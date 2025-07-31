import { useState, useRef, useEffect } from "react";
import Confetti from "../components/Confetti";
import Question from "../components/Question";
import QuizResult from "../components/QuizResult";

const QuizPage = ({ apiCall }) => {
  const [questions, setQuestions] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalLevels, setTotalLevels] = useState(3);
  const [levelInfo, setLevelInfo] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [perfect, setPerfect] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const audioRef = useRef(null);

  const resetState = () => {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setPerfect(false);
    setCorrectAnswers({});
    setUserAnswers({});
    setError(null);
    setQuizResult(null);
  };

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall("http://localhost:5000/api/questions", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.msg || "Failed to load questions");
      }

      const data = await response.json();
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentLevel(data.current_level || 1);
        setTotalLevels(data.total_levels || 3);
        setLevelInfo(data.level_info || null);
        resetState();
      } else {
        setError(data.message || "No questions available for your current level");
        setQuestions([]);
      }
    } catch (err) {
      console.error("Question fetch error:", err.message);
      setError(err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [apiCall]);

  const current = questions[index] || {};
  const isLast = index === questions.length - 1;

  const handleSelect = (option) => setSelected(option);

  const handleNext = () => {
    if (!selected) return;
    
    const questionId = current.id;
    const updatedAnswers = { ...userAnswers, [questionId]: selected };
    setUserAnswers(updatedAnswers);

    if (isLast) {
      submitAnswers(updatedAnswers);
    } else {
      setIndex((prev) => prev + 1);
      setSelected(null);
    }
  };

  const submitAnswers = async (answers) => {
    try {
      const response = await apiCall("http://localhost:5000/api/submit", {
        method: "POST",
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.msg || "Quiz submission failed");
      }

      const data = await response.json();
      setScore(data.score);
      setCorrectAnswers(data.correct_answers);
      setQuizResult(data);
      setFinished(true);

      const isPerfect = data.is_perfect || data.score === questions.length;
      setPerfect(isPerfect);

      if (isPerfect && audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.log("Audio play failed:", error);
        });
      }
    } catch (err) {
      console.error("Submit error:", err.message);
      setError("Failed to submit quiz. Please try again.");
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-message">
          <h3>Error: {error}</h3>
          <button onClick={loadQuestions} className="button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="quiz-container">
        <div className="no-questions">
          <h3>No questions available</h3>
          <p>Complete previous levels to unlock more questions.</p>
          <button onClick={loadQuestions} className="button">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <audio ref={audioRef} src="/sounds/celebration.mp3" preload="auto" />
      <Confetti perfectScore={perfect} />
      {finished ? (
        <QuizResult
          score={score}
          totalQuestions={questions.length}
          perfectScore={perfect}
          correctAnswers={correctAnswers}
          userAnswers={userAnswers}
          currentLevel={currentLevel}
          totalLevels={totalLevels}
          resetQuiz={loadQuestions}
          quizResult={quizResult}
          levelInfo={levelInfo}
        />
      ) : (
        <div className="quiz-container">
          <div className="level-indicator">
            Level {currentLevel} of {totalLevels}
          </div>
          
          {levelInfo && (
            <div className="level-info">
              <div className="progress-indicator">
                Question {index + 1} of {questions.length}
              </div>
              {levelInfo.attempts > 0 && (
                <div className="level-stats">
                  Best Score: {levelInfo.best_score}/{levelInfo.total_questions} ({levelInfo.percentage}%)
                  {levelInfo.passed && <span className="level-passed-badge">✓ Passed</span>}
                </div>
              )}
            </div>
          )}
          
          <Question
            currentQuestion={{ ...current, isLastQuestion: isLast }}
            selectedAnswer={selected}
            handleAnswerSelect={handleSelect}
            handleNextQuestion={handleNext}
          />
        </div>
      )}
    </>
  );
};

export default QuizPage;