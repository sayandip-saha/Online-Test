import { useState } from "react";
import questions from "../data/questions";
import { generateCertificatePdf } from "../utils/generateCertificatePdf";

function ResultDashboard({ answers = [], candidate, onExit }) {
  var [isDownloading, setIsDownloading] = useState(false);
  var totalQuestions = questions.length;
  var correctAnswers = 0;
  var incorrectAnswers = 0;
  var unansweredQuestions = 0;
  var passingPercentage = 60;

  questions.forEach(function (question, index) {
    var selectedAnswer = Array.isArray(answers)
      ? answers[index]
      : answers[question.id];

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

  function handleDownloadPdf() {
    setIsDownloading(true);
    setTimeout(function () {
      try {
        generateCertificatePdf({ candidate: candidate, answers: answers });
      } catch (error) {
        console.error("PDF generation failed:", error);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setIsDownloading(false);
      }
    }, 150);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_35%),radial-gradient(circle_at_bottom_right,#dbeafe,transparent_35%),#f8fafc] px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
          
          {/* Candidate & JWT Banner */}
          {candidate && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-extrabold tracking-[0.14em] text-indigo-600">
                  ONLINE EXAMINATION REPORT
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {candidate.name}
                </h2>
                <p className="text-xs text-slate-500">{candidate.email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="size-2 rounded-full bg-emerald-500"></span>
                  Verified JWT Session
                </span>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                  title="Download Report Card as PDF"
                >
                  <span>📥</span>
                  <span>{isDownloading ? "Generating..." : "Download Report Card (PDF)"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Result Header */}
          <div className="text-center">
            <div
              className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl text-4xl shadow-md ${
                isPassed
                  ? "bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50"
                  : "bg-red-50 text-red-600 ring-8 ring-red-50/50"
              }`}
            >
              {isPassed ? "✓" : "✕"}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {isPassed ? "Congratulations! You Passed!" : "Exam Completed"}
            </h1>

            <p className="mt-2 text-slate-500">
              Your exam has been submitted and evaluated automatically.
            </p>

            <div className="mt-4 inline-flex items-center gap-2">
              <span
                className={`rounded-full px-5 py-2 text-sm font-extrabold tracking-wide uppercase ${
                  isPassed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isPassed ? "PASSED (PASSING CRITERIA MET)" : "NEEDS IMPROVEMENT (BELOW 60%)"}
              </span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Score
              </p>
              <p className="mt-2 text-3xl font-extrabold text-indigo-900">
                {score} <span className="text-base font-normal text-indigo-500">/ {totalQuestions}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Percentage
              </p>
              <p className="mt-2 text-3xl font-extrabold text-blue-900">
                {percentage}%
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Correct
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                {correctAnswers}
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                Incorrect
              </p>
              <p className="mt-2 text-3xl font-extrabold text-red-700">
                {incorrectAnswers}
              </p>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-700">
                Overall Score Progress
              </span>
              <span className="font-extrabold text-slate-900">{percentage}%</span>
            </div>

            <div
              className="h-3.5 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isPassed ? "bg-emerald-500" : "bg-red-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Required to pass: {passingPercentage}%</span>
              <span>Unanswered questions: {unansweredQuestions}</span>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="mt-10 rounded-2xl border border-slate-200 p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Answer Key &amp; Performance Review
                </h2>
                <p className="text-xs text-slate-500">
                  Review your answers and compare with correct responses.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {totalQuestions} Questions
              </span>
            </div>

            <div className="space-y-4">
              {questions.map(function (question, index) {
                var selectedAnswer = Array.isArray(answers)
                  ? answers[index]
                  : answers[question.id];
                var isUnanswered =
                  selectedAnswer === undefined || selectedAnswer === null;
                var isCorrect =
                  !isUnanswered && selectedAnswer === question.correctAnswer;

                return (
                  <div
                    key={question.id}
                    className={`rounded-2xl border p-5 transition ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50/30"
                        : isUnanswered
                          ? "border-amber-200 bg-amber-50/20"
                          : "border-red-200 bg-red-50/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-900">
                        {index + 1}. {question.question}
                      </p>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : isUnanswered
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isCorrect
                          ? "CORRECT"
                          : isUnanswered
                            ? "NOT ANSWERED"
                            : "INCORRECT"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-1.5 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="w-24 shrink-0 font-medium text-slate-500">
                          Your Answer:
                        </span>
                        <span
                          className={`font-semibold ${
                            isUnanswered
                              ? "text-amber-700"
                              : isCorrect
                                ? "text-emerald-700"
                                : "text-red-600"
                          }`}
                        >
                          {isUnanswered
                            ? "— None selected"
                            : `${String.fromCharCode(65 + selectedAnswer)}. ${question.options[selectedAnswer]}`}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div className="flex items-start gap-2">
                          <span className="w-24 shrink-0 font-medium text-slate-500">
                            Correct Answer:
                          </span>
                          <span className="font-semibold text-emerald-700">
                            {String.fromCharCode(65 + question.correctAnswer)}.{" "}
                            {question.options[question.correctAnswer]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 bg-indigo-50 px-6 py-3.5 font-extrabold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50"
            >
              <span>📥</span>
              <span>
                {isDownloading
                  ? "Generating Document..."
                  : "Download Report Card (PDF)"}
              </span>
            </button>

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="rounded-xl bg-indigo-600 px-6 py-3.5 font-extrabold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              >
                Return to Home
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultDashboard;
