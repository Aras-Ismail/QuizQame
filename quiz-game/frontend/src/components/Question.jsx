const Question = ({
  currentQuestion,
  selectedAnswer,
  handleAnswerSelect,
  handleNextQuestion,
}) => (
  <>
    <div className="header">
      <img src="/logo/thunder-game.jpg" alt="Quiz Logo" className="logo" />
      <h1>Quiz Game</h1>
    </div>
    <div className="question">{currentQuestion.question}</div>
    <div className="options">
      {currentQuestion.options?.map((option, idx) => {
        const isCorrect = option === currentQuestion.answer;
        const isSelected = option === selectedAnswer;
        let btnClass = "option-btn";
        if (selectedAnswer) {
          if (isCorrect) btnClass += " correct";
          else if (isSelected) btnClass += " incorrect";
        }
        return (
          <button
            key={idx}
            className={btnClass}
            onClick={() => handleAnswerSelect(option)}
            disabled={!!selectedAnswer}
          >
            {option}
          </button>
        );
      })}
    </div>
    {selectedAnswer && (
      <button onClick={handleNextQuestion} className="button">
        {currentQuestion.isLastQuestion ? "Finish" : "Next"}
      </button>
    )}
  </>
);

export default Question;


