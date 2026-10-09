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
  var [isFullScreen, setIsFullScreen] = useState(false);
  var [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  var currentQuestion = questions[currentIndex];

  /*
   * Monitor fullscreen status and cancel if fullscreen is exited.
   */
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

  /*
   * Detect window focus loss.
   */
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

  /*
   * Detect browser tab switching.
   */
  useEffect(
    function () {
      function handleVisibilityChange() {
        if (document.visibilityState === "hidden" && examStatus === "running") {
          setExamStatus("cancelled");
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

  /*
   * Mark the current question as visited.
   */
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

  /*
   * Persist exam progress in the current browser tab.
   */
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

  /*
   * Reset inactivity timer whenever the candidate interacts
   * with the page.
   */
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

  /*
   * Countdown for inactivity.
   */
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

    setExamStatus("submitted");
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

    onExit();
  }

  function handleSubmit() {
    setShowSubmitConfirmation(false);
    setExamStatus("submitted");
    sessionStorage.setItem("examStatus", "submitted");
    sessionStorage.removeItem("examProgress");
  }

  /*
   * Exam cancellation page.
   */
  if (examStatus === "cancelled") {
    return (
      <main className="status-page">
        <section className="status-card danger">
          <div className="status-icon">!</div>

          <h1>Exam Cancelled</h1>

          <p>
            Your exam has been cancelled because the exam security rules were
            violated.
          </p>

          {!isFullScreen && <p>Full screen mode was exited.</p>}

          <button
            className="primary-button"
            type="button"
            onClick={handleExitExam}
          >
            Exit Exam
          </button>
        </section>
      </main>
    );
  }

  /*
   * Exam submitted page.
   */
  if (examStatus === "submitted") {
    return (
      <main className="thank-you-page">
        <section className="thank-you-card">
          <div className="thank-you-icon">✓</div>

          <p className="eyebrow">EXAM COMPLETED</p>

          <h1>Thank You!</h1>

          <p className="thank-you-message">
            Your exam has been submitted successfully.
          </p>

          <div className="thank-you-details">
            <p>
              <strong>Candidate:</strong> {candidate.name}
            </p>

            <p>
              <strong>Email:</strong> {candidate.email}
            </p>
          </div>

          <p className="thank-you-note">
            Your responses have been recorded. You may now close this window.
          </p>

          <button className="primary-button" type="button" onClick={onExit}>
            Finish
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="exam-page">
      <header className="exam-header">
        <div>
          <p className="eyebrow">ONLINE TEST</p>

          <h1>Welcome, {candidate.name}</h1>

          <p>
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="timer">
          <span>Inactivity Time</span>

          <strong>{formatTime(timeLeft)}</strong>
        </div>
      </header>

      <div className="exam-layout">
        <section className="question-panel">
          <div className="question-card">
            <div className="question-meta">
              <span>Question {currentIndex + 1}</span>

              <span>{currentQuestion.options.length} Options</span>
            </div>

            <h2>{currentQuestion.question}</h2>

            <div className="options">
              {currentQuestion.options.map(function (option, index) {
                var isSelected = answers[currentIndex] === index;

                return (
                  <label
                    className={isSelected ? "option selected" : "option"}
                    key={option}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={isSelected}
                      onChange={function () {
                        handleAnswerChange(index);
                      }}
                    />

                    <span className="option-number">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span>{option}</span>
                  </label>
                );
              })}
            </div>

            <div className="question-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  className="primary-button"
                  type="button"
                  onClick={function () {
                    setShowSubmitConfirmation(true);
                  }}
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  className="primary-button"
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
          onSelectQuestion={handlePaletteSelect}
        />
      </div>

      {showSubmitConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-card">
            <div className="status-icon">?</div>

            <h2>Submit Exam?</h2>

            <p>
              Are you sure you want to submit the exam? You cannot change your
              answers after submission.
            </p>

            <div className="confirmation-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={function () {
                  setShowSubmitConfirmation(false);
                }}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                type="button"
                onClick={handleSubmit}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Exam;
