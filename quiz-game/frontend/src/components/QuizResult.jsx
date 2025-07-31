function QuizResult({ 
  score, 
  totalQuestions, 
  perfectScore, 
  currentLevel, 
  totalLevels, 
  resetQuiz,
  quizResult,
  levelInfo
}) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isLevelComplete = quizResult?.level_passed || percentage >= 80;
  const isLastLevel = currentLevel >= totalLevels;

  const getScoreMessage = () => {
    if (perfectScore) return "Perfect Score! Outstanding! 🌟";
    if (percentage >= 90) return "Excellent work! 🎉";
    if (percentage >= 80) return "Great job! 👏";
    if (percentage >= 70) return "Good work! ✅";
    return "Keep practicing! 💪";
  };

  const getScoreClass = () => {
    if (percentage >= 90) return "score-excellent";
    if (percentage >= 80) return "score-good";
    if (percentage >= 70) return "score-average";
    return "score-poor";
  };

  return (
    <div className="quiz-container">
      <div className="header">
        <img src="/logo/thunder-game.jpg" alt="Quiz Logo" className="logo" />
        <h1>Quiz Results</h1>
      </div>

      <div className="level-indicator">
        Level {currentLevel} Results
      </div>

      <div className={`score ${getScoreClass()}`}>
        Your Score: {score} / {totalQuestions} ({percentage}%)
      </div>

      <div className="score-message">
        {getScoreMessage()}
      </div>

      {perfectScore && (
        <div className="celebration">Perfect Score! 🎉</div>
      )}

      {isLevelComplete && !isLastLevel && (
        <div className="level-unlock">
          🎊 Level {currentLevel + 1} Unlocked! 🎊
          <br />
          <small>You passed with {percentage}%! Ready for the next challenge?</small>
        </div>
      )}

      {isLevelComplete && isLastLevel && (
        <div className="game-complete">
          🏆 Congratulations! You've completed all levels! 🏆
          <br />
          <small>You can replay any level to improve your scores.</small>
        </div>
      )}

      {!isLevelComplete && (
        <div className="retry-message">
          You need at least 80% to unlock the next level. 
          <br />
          <small>Current score: {percentage}% - You're getting there!</small>
        </div>
      )}

      <div className="result-actions">
        <button onClick={resetQuiz} className="button">
          {isLevelComplete && !isLastLevel ? "Continue to Next Level" : "Try Again"}
        </button>
      </div>

      <div className="progress-summary">
        <h3>Level {currentLevel} Summary</h3>
        <div className="level-progress">
          <div>Questions: {totalQuestions} | Correct: {score} | Wrong: {totalQuestions - score}</div>
          <div>Accuracy: {percentage}% | Status: {isLevelComplete ? "✅ Passed" : "❌ Not Passed"}</div>
        </div>
        
        {levelInfo && levelInfo.attempts > 0 && (
          <div className="previous-attempts">
            <small>
              Previous best: {levelInfo.best_score}/{levelInfo.total_questions} ({levelInfo.percentage}%)
              {score > levelInfo.best_score && <span className="improvement"> - New personal best! 🎯</span>}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
export default QuizResult;