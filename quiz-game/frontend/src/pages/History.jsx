import { useEffect, useState } from "react";

export default function History({ apiCall }) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await apiCall("http://localhost:5000/api/quiz-history", {
          method: "GET",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || "Failed to load history");
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error("History fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [apiCall]);

  const toggleQuizDetails = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const getLevelBadgeClass = (level) => {
    switch(level) {
      case 1: return "level-badge level-1";
      case 2: return "level-badge level-2";
      case 3: return "level-badge level-3";
      default: return "level-badge";
    }
  };

  const getScoreClass = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "score-excellent";
    if (percentage >= 70) return "score-good";
    if (percentage >= 50) return "score-average";
    return "score-poor";
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">Loading quiz history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-message">
          <h3>Error: {error}</h3>
          <button onClick={() => window.location.reload()} className="button">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="header">
        <img src="/logo/thunder-game.jpg" alt="Quiz Logo" className="logo" />
        <h2>Quiz History</h2>
      </div>
      
      {history.length === 0 ? (
        <div className="no-history">
          <p>No quiz history found.</p>
          <p>Take some quizzes to see your progress here!</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((quiz, index) => (
            <div key={quiz.quiz_id} className="history-item">
              <div
                className="history-summary"
                onClick={() => toggleQuizDetails(quiz.quiz_id)}
              >
                <div className="summary-row">
                  <span className="quiz-number">#{index + 1}</span>
                  <span className={getLevelBadgeClass(quiz.level)}>
                    Level {quiz.level}
                  </span>
                  <span className={`quiz-score ${getScoreClass(quiz.score, quiz.total_questions)}`}>
                    Score: {quiz.score}/{quiz.total_questions}
                  </span>
                  <span className="quiz-percentage">
                    ({quiz.percentage}%)
                  </span>
                  <span className="quiz-date">{quiz.submitted_at}</span>
                  <span className="expand-icon">
                    {expandedQuiz === quiz.quiz_id ? "▼" : "▶"}
                  </span>
                </div>
              </div>

              {expandedQuiz === quiz.quiz_id && (
                <div className="quiz-details">
                  <h4>Level {quiz.level} - Question Details:</h4>
                  <div className="answers-list">
                    {quiz.answers.map((answer, answerIndex) => (
                      <div
                        key={answer.question_id}
                        className={`answer-item ${answer.is_correct ? "correct" : "incorrect"}`}
                      >
                        <div className="question-header">
                          <div className="question-number">Q{answerIndex + 1}:</div>
                          <div className={`result-status ${answer.is_correct ? "correct" : "incorrect"}`}>
                            {answer.is_correct ? "✓ Correct" : "✗ Incorrect"}
                          </div>
                        </div>
                        <div className="question-text">{answer.question_text}</div>
                        <div className="answer-info">
                          <div className="selected-answer">
                            Your Answer: <span className="answer-text">{answer.selected_option}</span>
                          </div>
                          {!answer.is_correct && (
                            <div className="correct-answer">
                              Correct Answer: <span className="answer-text">{answer.correct_answer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}