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

  function getStatusClasses(status) {
    if (status === "current") {
      return "bg-indigo-600 text-white outline outline-3 outline-indigo-300 outline-offset-2";
    }

    if (status === "answered") {
      return "bg-green-500 text-white hover:bg-green-600";
    }

    if (status === "not-answered") {
      return "bg-red-500 text-white hover:bg-red-600";
    }

    return "bg-slate-200 text-slate-700 hover:bg-slate-300";
  }

  return (
    <aside className="sticky top-5 self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] max-[850px]:static">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Question Palette</h2>

        <span className="text-sm text-slate-500">{questions.length} total</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map(function (question, index) {
          var status = getQuestionStatus(index);

          return (
            <button
              key={question.id}
              type="button"
              aria-label={`Question ${index + 1}: ${status}`}
              aria-current={index === currentIndex ? "step" : undefined}
              className={`aspect-square rounded-lg font-extrabold transition duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${getStatusClasses(status)}`}
              onClick={function () {
                onSelectQuestion(index);
              }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="size-3 rounded-full bg-green-500" />
          <span>Answered</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="size-3 rounded-full bg-slate-300" />
          <span>Not Visited</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="size-3 rounded-full bg-red-500" />
          <span>Visited, Not Answered</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="size-3 rounded-full bg-indigo-600" />
          <span>Current Question</span>
        </div>
      </div>
    </aside>
  );
}

export default Palette;
