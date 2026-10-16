import { useEffect, useState } from "react";
import questions from "../data/questions";
import Palette from "./Palette";
import ResultDashboard from "./ResultDashboard";
import { recordExamSubmission } from "../services/auth";

var INACTIVITY_LIMIT = 5 * 60;
var INITIAL_TIME = INACTIVITY_LIMIT;

function Exam({ candidate, onExit, onExamSubmitted }) {
  var [currentIndex, setCurrentIndex] = useState(0);
  var [answers, setAnswers] = useState(Array(questions.length).fill(null));
  var [visitedQuestions, setVisitedQuestions] = useState(
    Array(questions.length).fill(false),
  );
  var [flaggedQuestions, setFlaggedQuestions] = useState(
    Array(questions.length).fill(false),
  );
  var [examStatus, setExamStatus] = useState("running");
  var [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  var [isFullScreen, setIsFullScreen] = useState(
    Boolean(document.fullscreenElement),
  );
  var [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  var currentQuestion = questions[currentIndex];

  useEffect(
    function () {
      function handleFullscreenChange() {
        var fullScreenActive = Boolean(document.fullscreenElement);
        setIsFullScreen(fullScreenActive);

        if (!fullScreenActive && examStatus === "running") {
          setExamStatus("cancelled");
          sessionStorage.setItem("examStatus", "cancelled");
        }
      }

      document.addEventListener("fullscreenchange", handleFullscreenChange);

      return function () {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange,
        );
      };
    },
    [examStatus],
  );

  useEffect(
    function () {
      if (examStatus !== "running") {
        return;
      }

      function handleWindowBlur() {
        setExamStatus("cancelled");
        sessionStorage.setItem("examStatus", "cancelled");
      }

      window.addEventListener("blur", handleWindowBlur);

      return function () {
        window.removeEventListener("blur", handleWindowBlur);
      };
    },
    [examStatus],
  );

  useEffect(
    function () {
      function handleVisibilityChange() {
        if (document.visibilityState === "hidden" && examStatus === "running") {
          setExamStatus("cancelled");
          sessionStorage.setItem("examStatus", "cancelled");
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return function () {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    },
    [examStatus],
  );

  useEffect(
    function () {
      if (examStatus !== "running") {
        return;
      }

      setVisitedQuestions(function (previous) {
        var updated = [...previous];
        updated[currentIndex] = true;
        return updated;
      });
    },
    [currentIndex, examStatus],
  );

  useEffect(
    function () {
      sessionStorage.setItem(
        "examProgress",
        JSON.stringify({
          currentIndex: currentIndex,
          answers: answers,
          visitedQuestions: visitedQuestions,
          flaggedQuestions: flaggedQuestions,
          timeLeft: timeLeft,
        }),
      );
    },
    [currentIndex, answers, visitedQuestions, flaggedQuestions, timeLeft],
  );

  useEffect(
    function () {
      if (examStatus !== "running") {
        return;
      }

      function resetInactivityTimer() {
        setTimeLeft(INACTIVITY_LIMIT);
      }

      window.addEventListener("mousemove", resetInactivityTimer);
      window.addEventListener("mousedown", resetInactivityTimer);
      window.addEventListener("keydown", resetInactivityTimer);
      window.addEventListener("touchstart", resetInactivityTimer);

      return function () {
        window.removeEventListener("mousemove", resetInactivityTimer);
        window.removeEventListener("mousedown", resetInactivityTimer);
        window.removeEventListener("keydown", resetInactivityTimer);
        window.removeEventListener("touchstart", resetInactivityTimer);
      };
    },
    [examStatus],
  );

  useEffect(
    function () {
      if (examStatus !== "running") {
        return;
      }

      var timer = setInterval(function () {
        setTimeLeft(function (previous) {
          if (previous <= 1) {
            clearInterval(timer);
            setExamStatus("cancelled");
            sessionStorage.setItem("examStatus", "cancelled");
            return 0;
          }

          return previous - 1;
        });
      }, 1000);

      return function () {
        clearInterval(timer);
      };
    },
    [examStatus],
  );

  function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  function handleAnswerChange(optionIndex) {
    if (examStatus !== "running") {
      return;
    }

    setAnswers(function (previous) {
      var updated = [...previous];
      updated[currentIndex] = optionIndex;
      return updated;
    });
  }

  function handleToggleFlag() {
    if (examStatus !== "running") {
      return;
    }

    setFlaggedQuestions(function (previous) {
      var updated = [...previous];
      updated[currentIndex] = !updated[currentIndex];
      return updated;
    });
  }

  function handleMarkForReviewAndNext() {
    if (examStatus !== "running") {
      return;
    }

    setFlaggedQuestions(function (previous) {
      var updated = [...previous];
      updated[currentIndex] = true;
      return updated;
    });

    handleNext();
  }

  function handleClearResponse() {
    if (examStatus !== "running") {
      return;
    }

    setAnswers(function (previous) {
      var updated = [...previous];
      updated[currentIndex] = null;
      return updated;
    });
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    setShowSubmitConfirmation(true);
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function handlePaletteSelect(index) {
    setCurrentIndex(index);
  }

  function handleExitExam() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function () {
        return;
      });
    }

    sessionStorage.removeItem("examProgress");
    onExit();
  }

  function handleSubmit() {
    setShowSubmitConfirmation(false);
    setExamStatus("submitted");
    sessionStorage.setItem("examStatus", "submitted");
    sessionStorage.removeItem("examProgress");

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function () {
        return;
      });
    }

    // Save exam details permanently in the Rails backend database
    var totalQuestions = questions.length;
    var correctAnswers = 0;
    var incorrectAnswers = 0;
    var unansweredQuestions = 0;

    questions.forEach(function (question, index) {
      var selected = answers[index];
      if (selected === undefined || selected === null) {
        unansweredQuestions++;
      } else if (selected === question.correctAnswer) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    var score = correctAnswers;
    var percentage =
      totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    var isPassed = percentage >= 60;

    if (onExamSubmitted) {
      onExamSubmitted();
    }

    recordExamSubmission({
      score: score,
      total_questions: totalQuestions,
      percentage: percentage,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
      unanswered_questions: unansweredQuestions,
      passed: isPassed,
      answers_payload: answers,
    }).catch(function (err) {
      console.error("Failed to save exam submission to backend:", err);
    });
  }

  if (examStatus === "cancelled") {
    return (
      <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#eef2ff,#f8fafc_55%,#e0f2fe)] px-5 py-8">
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 border-t-4 border-t-red-500 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-10">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-red-50 text-2xl font-black text-red-600">
            !
          </div>

          <h1 className="mb-4 text-3xl font-extrabold text-slate-900">
            Exam Cancelled
          </h1>

          <p className="mb-5 leading-7 text-slate-500">
            Your exam has been cancelled because the exam security rules were
            violated.
          </p>

          {!isFullScreen && (
            <p className="mb-6 text-sm text-red-600">
              Full screen mode was exited.
            </p>
          )}

          <button
            className="rounded-xl bg-indigo-600 px-6 py-3 font-extrabold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            type="button"
            onClick={handleExitExam}
          >
            Exit Exam
          </button>
        </section>
      </main>
    );
  }

  if (examStatus === "submitted") {
    return (
      <ResultDashboard
        answers={answers}
        candidate={candidate}
        onExit={handleExitExam}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-7">
      <header className="mx-auto mb-6 flex max-w-7xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-extrabold tracking-[0.14em] text-indigo-600">
            ONLINE TEST
          </p>

          <h1 className="mb-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Welcome, {candidate.name}
          </h1>

          <p className="text-sm text-slate-500">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
          <div className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center sm:w-44">
            <span className="block text-xs text-slate-500">Inactivity Time</span>

            <strong
              className={`mt-1 block font-mono text-2xl font-extrabold ${
                timeLeft <= 60 ? "text-red-600" : "text-slate-900"
              }`}
            >
              {formatTime(timeLeft)}
            </strong>
          </div>

          <button
            type="button"
            onClick={function () {
              setShowSubmitConfirmation(true);
            }}
            className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-sm font-extrabold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            Submit Exam
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="flex min-h-130 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-500">
                Question {currentIndex + 1} of {questions.length}
              </span>
              {flaggedQuestions[currentIndex] && (
                <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300 bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-900">
                  <span>⚑</span>
                  <span>Marked for Review</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleFlag}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                  flaggedQuestions[currentIndex]
                    ? "border-yellow-400 bg-yellow-100 text-yellow-900 hover:bg-yellow-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-yellow-400 hover:text-yellow-700"
                }`}
                title="Mark this question to review later"
              >
                <span className="text-sm">⚑</span>
                <span>
                  {flaggedQuestions[currentIndex]
                    ? "Unmark Review"
                    : "Mark for Review"}
                </span>
              </button>

              <span className="text-xs text-slate-400">
                {currentQuestion.options.length} Options
              </span>
            </div>
          </div>

          <h2 className="my-9 text-xl leading-relaxed font-bold text-slate-900 sm:my-12 sm:text-2xl">
            {currentQuestion.question}
          </h2>

          <div className="grid gap-3">
            {currentQuestion.options.map(function (option, index) {
              var isSelected = answers[currentIndex] === index;

              return (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition sm:gap-4 sm:p-4 ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                  key={option}
                >
                  <input
                    className="size-4.5 accent-indigo-600"
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={isSelected}
                    onChange={function () {
                      handleAnswerChange(index);
                    }}
                  />

                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg font-extrabold ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="text-sm leading-6 text-slate-700 sm:text-base">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                className="rounded-xl bg-slate-200 px-5 py-3 font-extrabold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </button>

              {answers[currentIndex] !== null &&
                answers[currentIndex] !== undefined && (
                  <button
                    type="button"
                    onClick={handleClearResponse}
                    className="rounded-xl border border-slate-200 px-3.5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    title="Clear selected option for this question"
                  >
                    Clear Selection
                  </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                className="rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 font-extrabold text-yellow-900 hover:bg-yellow-100 transition focus:outline-none focus:ring-4 focus:ring-yellow-200"
                title="Mark for review and move to next question"
              >
                Mark for Review &amp; Next
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-extrabold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                  type="button"
                  onClick={function () {
                    setShowSubmitConfirmation(true);
                  }}
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-extrabold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                  type="button"
                  onClick={handleNext}
                >
                  Save &amp; Next
                </button>
              )}
            </div>
          </div>
        </section>

        <Palette
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          visitedQuestions={visitedQuestions}
          flaggedQuestions={flaggedQuestions}
          onSelectQuestion={handlePaletteSelect}
        />
      </div>

      {showSubmitConfirmation && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-5 backdrop-blur-sm">
          <section
            className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-dialog-title"
          >
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-indigo-50 text-2xl font-black text-indigo-600">
              ?
            </div>

            <h2
              id="submit-dialog-title"
              className="mb-3 text-2xl font-extrabold text-slate-900"
            >
              Submit Exam?
            </h2>

            <p className="mb-4 text-sm leading-6 text-slate-500">
              Are you sure you want to submit the exam? You will not be able to change your answers after submission.
            </p>

            <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
              <div className="p-1">
                <span className="block text-[11px] font-bold uppercase text-slate-400">Answered</span>
                <span className="text-lg font-black text-emerald-600">
                  {answers.filter((a) => a !== null && a !== undefined).length}
                </span>
              </div>
              <div className="p-1">
                <span className="block text-[11px] font-bold uppercase text-slate-400">Unanswered</span>
                <span className="text-lg font-black text-rose-500">
                  {answers.filter((a) => a === null || a === undefined).length}
                </span>
              </div>
              <div className="p-1">
                <span className="block text-[11px] font-bold uppercase text-slate-400">Marked ⚑</span>
                <span className="text-lg font-black text-amber-600">
                  {flaggedQuestions.filter(Boolean).length}
                </span>
              </div>
            </div>

            {flaggedQuestions.filter(Boolean).length > 0 && (
              <p className="mb-5 rounded-xl border border-yellow-300 bg-yellow-50 p-2.5 text-xs text-yellow-900">
                Notice: You have {flaggedQuestions.filter(Boolean).length} question(s) marked for review. They will be submitted with your currently selected answers.
              </p>
            )}

            <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row">
              <button
                className="min-w-32 rounded-xl bg-slate-200 px-5 py-3 font-extrabold text-slate-700 transition hover:bg-slate-300"
                type="button"
                onClick={function () {
                  setShowSubmitConfirmation(false);
                }}
              >
                Cancel
              </button>

              <button
                className="min-w-32 rounded-xl bg-indigo-600 px-5 py-3 font-extrabold text-white transition hover:bg-indigo-700"
                type="button"
                onClick={handleSubmit}
              >
                Yes, Submit
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Exam;
