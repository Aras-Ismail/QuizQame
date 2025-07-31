import logging
import os
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from .models import Question, UserQuiz, UserQuizAnswer
from .shared import db

quiz_bp = Blueprint('quiz', __name__, url_prefix='/api')

def get_option_text_by_letter(question, letter):
    """Convert option letter (A, B, C, D) to actual option text"""
    option_map = {
        'A': question.option_a,
        'B': question.option_b,
        'C': question.option_c,
        'D': question.option_d
    }
    return option_map.get(letter.upper(), '')

@quiz_bp.route('/questions')
@jwt_required()
def get_questions():
    try:
        user_id = int(get_jwt_identity())
        
        
        current_level = get_user_current_level(user_id)
        
        
        questions = Question.query.filter_by(level=current_level).order_by(Question.id).all()
        
        if not questions:
            return jsonify({
                "questions": [],
                "current_level": current_level,
                "total_levels": 3,
                "message": f"No questions available for level {current_level}"
            }), 200
        
        
        formatted_questions = []
        for question in questions:
            
            correct_answer_text = get_option_text_by_letter(question, question.correct_option)
            
            formatted_questions.append({
                "id": question.id,
                "question": question.question_text,
                "options": [
                    question.option_a,
                    question.option_b,
                    question.option_c,
                    question.option_d
                ],
                "answer": correct_answer_text,  
                "level": question.level
            })
        
        return jsonify({
            "questions": formatted_questions,
            "current_level": current_level,
            "total_levels": 3,
            "level_info": get_level_progress_info(user_id, current_level)
        }), 200
        
    except Exception as e:
        logging.error(f"Error fetching questions: {str(e)}")
        return jsonify({"error": "Failed to fetch questions"}), 500

@quiz_bp.route('/all-questions')
@jwt_required()
def get_all_questions():
    """Get all questions for settings/admin purposes"""
    try:
        
        questions = Question.query.order_by(Question.level, Question.id).all()
        
        
        formatted_questions = []
        for question in questions:
            
            correct_answer_text = get_option_text_by_letter(question, question.correct_option)
            
            formatted_questions.append({
                "id": question.id,
                "question": question.question_text,
                "options": [
                    question.option_a,
                    question.option_b,
                    question.option_c,
                    question.option_d
                ],
                "answer": correct_answer_text,
                "level": question.level
            })
        
        return jsonify({
            "questions": formatted_questions,
            "total_questions": len(formatted_questions)
        }), 200
        
    except Exception as e:
        logging.error(f"Error fetching all questions: {str(e)}")
        return jsonify({"error": "Failed to fetch questions"}), 500

@quiz_bp.route('/update-question-level', methods=['PUT'])
@jwt_required()
def update_question_level():
    """Update the level of a specific question"""
    try:
        data = request.get_json()
        question_id = data.get('question_id')
        new_level = data.get('level')
        
        if not question_id or not new_level:
            return jsonify({"error": "Question ID and level are required"}), 400
        
        if new_level not in [1, 2, 3]:
            return jsonify({"error": "Level must be 1, 2, or 3"}), 400
        
        question = Question.query.filter_by(id=question_id).first()
        if not question:
            return jsonify({"error": "Question not found"}), 404
        
       
        question.level = new_level
        db.session.commit()
        
        return jsonify({
            "message": "Question level updated successfully",
            "question_id": question_id,
            "new_level": new_level
        }), 200
        
    except Exception as e:
        logging.error(f"Error updating question level: {str(e)}")
        return jsonify({"error": "Failed to update question level"}), 500

def get_user_current_level(user_id):
    """Determine the current level a user should be playing"""
    
    
    has_completed_all_levels = True
    for level in [1, 2, 3]:
        total_questions = Question.query.filter_by(level=level).count()
        if total_questions == 0:
            continue
            
        level_quizzes = db.session.query(UserQuiz.score)\
            .join(UserQuizAnswer, UserQuiz.id == UserQuizAnswer.user_quiz_id)\
            .join(Question, UserQuizAnswer.question_id == Question.id)\
            .filter(UserQuiz.user_id == user_id)\
            .filter(Question.level == level)\
            .group_by(UserQuiz.id)\
            .all()
            
        if not level_quizzes:
            has_completed_all_levels = False
            break
            
        best_score = max([quiz.score for quiz in level_quizzes]) if level_quizzes else 0
        percentage = (best_score / total_questions) * 100 if total_questions > 0 else 0
        
        if percentage < 80:   
            has_completed_all_levels = False
            break
    
    
    if has_completed_all_levels:
        
        latest_quiz = db.session.query(UserQuiz)\
            .join(UserQuizAnswer, UserQuiz.id == UserQuizAnswer.user_quiz_id)\
            .join(Question, UserQuizAnswer.question_id == Question.id)\
            .filter(UserQuiz.user_id == user_id)\
            .order_by(UserQuiz.submitted_at.desc())\
            .first()
        
        if latest_quiz:
            
            latest_quiz_answer = UserQuizAnswer.query.filter_by(user_quiz_id=latest_quiz.id).first()
            if latest_quiz_answer:
                latest_question = Question.query.filter_by(id=latest_quiz_answer.question_id).first()
                if latest_question:
                    latest_level = latest_question.level
                    
                    
                    total_questions = Question.query.filter_by(level=latest_level).count()
                    percentage = (latest_quiz.score / total_questions) * 100 if total_questions > 0 else 0
                    
                    if percentage >= 70:
                        
                        return 1 if latest_level >= 3 else latest_level + 1
                    else:
                        
                        return latest_level
        
        
        return 1
    
    
    for level in [1, 2, 3]:
        total_questions = Question.query.filter_by(level=level).count()
        
        if total_questions == 0:
            continue
            
        level_quizzes = db.session.query(UserQuiz.score)\
            .join(UserQuizAnswer, UserQuiz.id == UserQuizAnswer.user_quiz_id)\
            .join(Question, UserQuizAnswer.question_id == Question.id)\
            .filter(UserQuiz.user_id == user_id)\
            .filter(Question.level == level)\
            .group_by(UserQuiz.id)\
            .all()
            
        if not level_quizzes:
            return level
            
        best_score = max([quiz.score for quiz in level_quizzes]) if level_quizzes else 0
        percentage = (best_score / total_questions) * 100 if total_questions > 0 else 0
        
        if percentage < 80:   
            return level
    
    
    return 1

def get_level_progress_info(user_id, current_level):
    """Get progress information for the current level"""
    total_questions = Question.query.filter_by(level=current_level).count()
    
    
    level_quizzes = db.session.query(UserQuiz.score)\
        .join(UserQuizAnswer, UserQuiz.id == UserQuizAnswer.user_quiz_id)\
        .join(Question, UserQuizAnswer.question_id == Question.id)\
        .filter(UserQuiz.user_id == user_id)\
        .filter(Question.level == current_level)\
        .group_by(UserQuiz.id)\
        .all()
    
    best_score = max([quiz.score for quiz in level_quizzes]) if level_quizzes else 0
    attempts = len(level_quizzes)
    
    percentage = (best_score / total_questions) * 100 if total_questions > 0 else 0
    
    return {
        "total_questions": total_questions,
        "best_score": best_score,
        "attempts": attempts,
        "percentage": round(percentage, 1),
        "passed": percentage >= 80   
    }

@quiz_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_quiz():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json().get('answers', {})
        score = 0
        answers = []
        question_ids = []

        
        for question_id_str, selected in data.items():
            question_id = int(question_id_str)
            question = Question.query.filter_by(id=question_id).first()
            
            if question:
                question_ids.append(question_id)
                
                correct_answer_text = get_option_text_by_letter(question, question.correct_option)
                
                if selected == correct_answer_text:
                    score += 1
                answers.append((question_id, selected))

        
        quiz = UserQuiz(user_id=user_id, score=score)
        db.session.add(quiz)
        db.session.commit()

        
        for question_id, selected in answers:
            ans = UserQuizAnswer(
                user_quiz_id=quiz.id, 
                question_id=question_id, 
                selected_option=selected
            )
            db.session.add(ans)
        db.session.commit()

        
        correct_answers = {}
        current_level = None
        for question_id in question_ids:
            question = Question.query.filter_by(id=question_id).first()
            if question:
                correct_answers[str(question_id)] = get_option_text_by_letter(question, question.correct_option)
                current_level = question.level

        
        percentage = (score / len(question_ids)) * 100 if question_ids else 0
        level_passed = percentage >= 80   
        
        next_level_unlocked = level_passed and current_level < 3

        return jsonify({
            "score": score,
            "total_questions": len(question_ids),
            "correct_answers": correct_answers,
            "percentage": round(percentage, 1),
            "level_passed": level_passed,
            "current_level": current_level,
            "next_level_unlocked": next_level_unlocked,
            "is_perfect": score == len(question_ids)
        }), 200
        
    except Exception as e:
        logging.error(f"Error submitting quiz: {str(e)}")
        return jsonify({"error": "Failed to submit quiz"}), 500

@quiz_bp.route('/quiz-history', methods=['GET'])
@jwt_required()
def history():
    try:
        user_id = get_jwt_identity()
        quizzes = UserQuiz.query.filter_by(user_id=user_id)\
            .order_by(UserQuiz.submitted_at.desc())\
            .all()
        
        quiz_history = []
        for quiz in quizzes:
            quiz_answers = UserQuizAnswer.query.filter_by(user_quiz_id=quiz.id).all()
            
            answer_details = []
            quiz_level = None
            
            for answer in quiz_answers:
                question = Question.query.filter_by(id=answer.question_id).first()
                
                if question:
                    if quiz_level is None:
                        quiz_level = question.level
                    
                    
                    correct_answer_text = get_option_text_by_letter(question, question.correct_option)
                    is_correct = answer.selected_option == correct_answer_text
                    
                    answer_details.append({
                        "question_id": answer.question_id,
                        "question_text": question.question_text,
                        "selected_option": answer.selected_option,
                        "correct_answer": correct_answer_text,  
                        "is_correct": is_correct,
                        "level": question.level
                    })
            
           
            total_questions = len(answer_details)
            percentage = (quiz.score / total_questions) * 100 if total_questions > 0 else 0
            
            quiz_history.append({
                "quiz_id": quiz.id,
                "score": quiz.score,
                "total_questions": total_questions,
                "percentage": round(percentage, 1),
                "level": quiz_level or 1,
                "level_passed": percentage >= 70,
                "submitted_at": quiz.submitted_at.strftime("%Y-%m-%d %H:%M"),
                "answers": answer_details
            })
        
        return jsonify(quiz_history)
        
    except Exception as e:
        logging.error(f"Error fetching quiz history: {str(e)}")
        return jsonify({"message": "Error fetching quiz history", "error": str(e)}), 500

@quiz_bp.route('/user-progress', methods=['GET'])
@jwt_required()
def get_user_progress():
    try:
        user_id = int(get_jwt_identity())
        
        
        progress = {}
        for level in [1, 2, 3]:
            
            total_questions = Question.query.filter_by(level=level).count()
            
            if total_questions == 0:
                progress[f"level_{level}"] = {
                    "total_questions": 0,
                    "best_score": 0,
                    "attempts": 0,
                    "percentage": 0,
                    "unlocked": level == 1,
                    "passed": False
                }
                continue
            
            
            level_quizzes = db.session.query(UserQuiz.score)\
                .join(UserQuizAnswer, UserQuiz.id == UserQuizAnswer.user_quiz_id)\
                .join(Question, UserQuizAnswer.question_id == Question.id)\
                .filter(UserQuiz.user_id == user_id)\
                .filter(Question.level == level)\
                .group_by(UserQuiz.id)\
                .all()
                
            best_score = max([quiz.score for quiz in level_quizzes]) if level_quizzes else 0
            attempts = len(level_quizzes)
            
            percentage = (best_score / total_questions) * 100 if total_questions > 0 else 0
            passed = percentage >= 70
            
            
            if level == 1:
                unlocked = True
            else:
                prev_level_passed = progress.get(f"level_{level-1}", {}).get("passed", False)
                unlocked = prev_level_passed
            
            progress[f"level_{level}"] = {
                "total_questions": total_questions,
                "best_score": best_score,
                "attempts": attempts,
                "percentage": round(percentage, 1),
                "unlocked": unlocked,
                "passed": passed
            }
        
        return jsonify({
            "progress": progress,
            "current_level": get_user_current_level(user_id)
        }), 200
        
    except Exception as e:
        logging.error(f"Error fetching user progress: {str(e)}")
        return jsonify({"error": "Failed to fetch progress"}), 500