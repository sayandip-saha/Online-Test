import questions from "../data/questions";

function ResultDashboard({ answers, onRestart }) {
  var totalQuestions = questions.length;
  var correctAnswers = 0;
  var incorrectAnswers = 0;
  var unansweredQuestions = 0;
  var passingPercentage = 60;

  questions.forEach(function (question) {
    var selectedAnswer = answers[question.id];

    if (selectedAnswer === undefined || selectedAnswer === null) {
      unansweredQuestions++;
    } else if (selectedAnswer === question.correctAnswer) {
      correctAnswers++;
    } else {
      incorrectAnswers++;
    }
  });

  var score = correctAnswers;
  var percentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  var isPassed = percentage >= passingPercentage;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-10">
          <div className="text-center">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
                isPassed
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isPassed ? "✓" : "✕"}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Exam Results
            </h1>

            <p className="mt-3 text-slate-500">
              Your exam has been submitted successfully.
            </p>

            <span
              className={`mt-5 inline-block rounded-full px-5 py-2 text-sm font-semibold ${
                isPassed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isPassed ? "PASSED" : "FAILED"}
            </span>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-indigo-50 p-6">
              <p className="text-sm font-medium text-indigo-600">Total Score</p>
              <p className="mt-2 text-3xl font-bold text-indigo-900">
                {score} / {totalQuestions}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-6">
              <p className="text-sm font-medium text-blue-600">Percentage</p>
              <p className="mt-2 text-3xl font-bold text-blue-900">
                {percentage}%
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-6">
              <p className="text-sm font-medium text-green-700">
                Correct Answers
              </p>
              <p className="mt-2 text-3xl font-bold text-green-800">
                {correctAnswers}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-6">
              <p className="text-sm font-medium text-red-700">
                Incorrect Answers
              </p>
              <p className="mt-2 text-3xl font-bold text-red-800">
                {incorrectAnswers}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-6 sm:col-span-2">
              <p className="text-sm font-medium text-amber-700">
                Unanswered Questions
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-800">
                {unansweredQuestions}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">
                Overall Performance
              </span>
              <span className="font-bold text-slate-800">{percentage}%</span>
            </div>

            <div
              className="h-3 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Exam percentage"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isPassed ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Passing score: {passingPercentage}%
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold">Answer Review</h2>

            <div className="mt-4 space-y-4">
              {questions.map(function (question) {
                var selectedAnswer = answers[question.id];
                var isUnanswered =
                  selectedAnswer === undefined || selectedAnswer === null;
                var isCorrect =
                  !isUnanswered && selectedAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className="rounded-lg bg-slate-50 p-4">
                    <p className="font-medium">
                      {question.id}. {question.question}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Your answer:{" "}
                      <span
                        className={
                          isUnanswered
                            ? "font-semibold text-amber-700"
                            : isCorrect
                              ? "font-semibold text-green-700"
                              : "font-semibold text-red-700"
                        }
                      >
                        {isUnanswered
                          ? "Not answered"
                          : question.options[selectedAnswer]}
                      </span>
                    </p>

                    {!isCorrect && (
                      <p className="mt-1 text-sm text-green-700">
                        Correct answer:{" "}
                        {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {onRestart && (
            <button
              type="button"
              onClick={onRestart}
              className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              Take Another Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultDashboard;
