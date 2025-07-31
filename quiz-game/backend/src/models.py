from datetime import datetime
from src.shared import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.Text)
    option_b = db.Column(db.Text)
    option_c = db.Column(db.Text)
    option_d = db.Column(db.Text)
    correct_option = db.Column(db.String(1))
    level = db.Column(db.Integer, nullable=False, default=1) 

class UserQuiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    score = db.Column(db.Integer)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserQuizAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_quiz_id = db.Column(db.Integer, db.ForeignKey('user_quiz.id'))
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    selected_option = db.Column(db.Text)