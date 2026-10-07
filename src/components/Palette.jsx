function Palette ({ questions, questionStates, currentIndex, onSelect }) {
  function getStatusClass (index) {
    var status = questionStates[index];

    if (index === currentIndex) {
      return "palette-button current";
    }

    if (status === "answered") {
      return "palette-button answered";
    }

    if (status === "not-answered") {
      return "palette-button not-answered";
    }

    return "palette-button not-visited";
  }

  return (
    <aside className="palette-panel">
      <div className="palette-header">
        <h2>Questions</h2>
        <span>{questions.length}</span>
      </div>

      <div className="palette-grid">
        {questions.map(function (question, index) {
          return (
            <button
              className={getStatusClass(index)}
              key={question.id}
              type="button"
              onClick={function () {
                onSelect(index);
              }}
              aria-label={"Go to question " + (index + 1)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="legend">
        <div><span className="legend-dot answered"></span> Answered</div>
        <div><span className="legend-dot not-visited"></span> Not visited</div>
        <div><span className="legend-dot not-answered"></span> Not answered</div>
      </div>
    </aside>
  );
}

export default Palette;