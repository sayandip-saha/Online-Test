function Palette({
  questions,
  currentIndex,
  answers,
  visitedQuestions,
  onSelectQuestion,
}) {
  function getQuestionStatus(index) {
    if (index === currentIndex) {
      return "current";
    }

    if (answers[index] !== null && answers[index] !== undefined) {
      return "answered";
    }

    if (visitedQuestions[index]) {
      return "not-answered";
    }

    return "not-visited";
  }

  return (
    <aside className="palette-panel">
      <h2>Question Palette</h2>

      <div className="palette-grid">
        {questions.map(function (question, index) {
          return (
            <button
              key={question.id}
              type="button"
              className={`palette-button ${getQuestionStatus(index)}`}
              onClick={function () {
                onSelectQuestion(index);
              }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="palette-legend">
        <div className="legend-item">
          <span className="legend-box answered"></span>
          <span>Answered</span>
        </div>

        <div className="legend-item">
          <span className="legend-box not-visited"></span>
          <span>Not Visited</span>
        </div>

        <div className="legend-item">
          <span className="legend-box not-answered"></span>
          <span>Not Answered</span>
        </div>
      </div>
    </aside>
  );
}

export default Palette;
