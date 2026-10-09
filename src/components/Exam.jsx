import { useEffect, useState } from "react";
import questions from "../data/questions";
import Palette from "./Palette";

var INACTIVITY_LIMIT = 5 * 60;
var INITIAL_TIME = INACTIVITY_LIMIT;

function Exam({ candidate, onExit }) {
  var [currentIndex, setCurrentIndex] = useState(0);
  var [answers, setAnswers] = useState(Array(questions.length).fill(null));
  var [visitedQuestions, setVisitedQuestions] = useState(
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
          timeLeft: timeLeft,
        }),
      );
    },
    [currentIndex, answers, visitedQuestions, timeLeft],
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
      <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#eef2ff,#f8fafc_55%,#e0f2fe)] px-5 py-8">
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-10">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-green-100 text-3xl font-black text-green-600">
            ✓
          </div>

          <p className="mb-2 text-xs font-extrabold tracking-[0.14em] text-indigo-600">
            EXAM COMPLETED
          </p>

          <h1 className="mb-3 text-4xl font-extrabold text-slate-900">
            Thank You!
          </h1>

          <p className="mb-6 leading-7 text-slate-500">
            Your exam has been submitted successfully.
          </p>

          <div className="my-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
            <p className="mb-2 text-slate-600">
              <strong className="text-slate-900">Candidate:</strong>{" "}
              {candidate.name}
            </p>

            <p className="text-slate-600">
              <strong className="text-slate-900">Email:</strong>{" "}
              {candidate.email}
            </p>
          </div>

          <p className="mb-7 text-sm leading-6 text-slate-500">
            Your responses have been recorded. You may now close this window.
          </p>

          <button
            className="rounded-xl bg-indigo-600 px-6 py-3 font-extrabold text-white transition hover:bg-indigo-700"
            type="button"
            onClick={onExit}
          >
            Finish
          </button>
        </section>
      </main>
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
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="flex min-h-130 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-500">
            <span>Question {currentIndex + 1}</span>
            <span>{currentQuestion.options.length} Options</span>
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

          <div className="mt-auto flex flex-col-reverse justify-between gap-3 pt-8 sm:flex-row">
            <button
              className="rounded-xl bg-slate-200 px-5 py-3 font-extrabold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
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
        </section>

        <Palette
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          visitedQuestions={visitedQuestions}
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

            <p className="mb-7 leading-7 text-slate-500">
              Are you sure you want to submit the exam? You cannot change your
              answers after submission.
            </p>

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
