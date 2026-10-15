function Palette({
  questions,
  currentIndex,
  answers,
  visitedQuestions,
  flaggedQuestions = [],
  onSelectQuestion,
}) {
  function getQuestionStatus(index) {
    var isFlagged = Boolean(flaggedQuestions[index]);
    var isAnswered = answers[index] !== null && answers[index] !== undefined;
    var isVisited = Boolean(visitedQuestions[index]);

    if (isFlagged && isAnswered) {
      return "flagged-answered";
    }

    if (isFlagged) {
      return "flagged";
    }

    if (isAnswered) {
      return "answered";
    }

    if (isVisited) {
      return "not-answered";
    }

    return "not-visited";
  }

  function getStatusClasses(status, isCurrent) {
    var base = "relative aspect-square rounded-xl font-extrabold text-sm transition duration-150 hover:scale-105 focus:outline-none flex items-center justify-center ";

    var currentRing = isCurrent
      ? " ring-4 ring-indigo-400 ring-offset-2 z-10 font-black shadow-md"
      : "";

    if (status === "flagged-answered") {
      return base + "bg-yellow-400 text-slate-900 hover:bg-yellow-500 ring-2 ring-emerald-500" + currentRing;
    }

    if (status === "flagged") {
      return base + "bg-yellow-400 text-slate-900 hover:bg-yellow-500" + currentRing;
    }

    if (status === "answered") {
      return base + "bg-emerald-600 text-white hover:bg-emerald-700" + currentRing;
    }

    if (status === "not-answered") {
      return base + "bg-rose-500 text-white hover:bg-rose-600" + currentRing;
    }

    return base + "bg-slate-200 text-slate-700 hover:bg-slate-300" + currentRing;
  }

  var flaggedCount = flaggedQuestions.filter(Boolean).length;
  var answeredCount = answers.filter((a) => a !== null && a !== undefined).length;

  return (
    <aside className="sticky top-5 self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] max-[850px]:static">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Question Palette</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {questions.length} total
        </span>
      </div>

      {/* Summary stats badge bar */}
      <div className="mb-4 flex flex-wrap gap-1.5 text-[11px] font-semibold">
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-100">
          {answeredCount} Answered
        </span>
        <span className="rounded-md bg-yellow-50 px-2 py-0.5 text-yellow-800 border border-yellow-200">
          {flaggedCount} Marked ⚑
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map(function (question, index) {
          var status = getQuestionStatus(index);
          var isCurrent = index === currentIndex;
          var isFlagged = Boolean(flaggedQuestions[index]);
          var isAnswered = answers[index] !== null && answers[index] !== undefined;

          return (
            <button
              key={question.id}
              type="button"
              aria-label={`Question ${index + 1}: ${status}${isCurrent ? " (current)" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
              className={getStatusClasses(status, isCurrent)}
              onClick={function () {
                onSelectQuestion(index);
              }}
            >
              <span>{index + 1}</span>

              {/* Little flag marker for review */}
              {isFlagged && (
                <span
                  className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-yellow-300 shadow-sm"
                  title="Marked for Review"
                >
                  ⚑
                </span>
              )}

              {/* Indicator if answered while marked */}
              {isFlagged && isAnswered && (
                <span
                  className="absolute bottom-1 right-1 size-1.5 rounded-full bg-emerald-600"
                  title="Answered"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Palette Legend */}
      <div className="mt-5 border-t border-slate-100 pt-4 grid gap-2.5 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full bg-emerald-600" />
          <span>Answered</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full bg-rose-500" />
          <span>Visited, Not Answered</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex size-3.5 shrink-0 items-center justify-center rounded-md bg-yellow-400 text-[9px] text-slate-900 font-bold">
            ⚑
          </span>
          <span>Marked for Review</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex size-3.5 shrink-0 items-center justify-center rounded-md bg-yellow-400 text-[9px] text-slate-900 font-bold ring-2 ring-emerald-500">
            ⚑
          </span>
          <span>Answered &amp; Marked</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full bg-slate-300" />
          <span>Not Visited</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="size-3.5 shrink-0 rounded-md border-2 border-indigo-400 bg-white" />
          <span>Current Question</span>
        </div>
      </div>
    </aside>
  );
}

export default Palette;
