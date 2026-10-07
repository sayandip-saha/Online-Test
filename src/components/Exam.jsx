import { useEffect, useMemo, useState } from "react";
import questions from "../data/questions";
import Palette from "./Palette";

var INACTIVITY_LIMIT = 5 * 60 * 1000;

function Exam ({ candidate, onExit }) {
  var [currentIndex, setCurrentIndex] = useState(0);
  var [answers, setAnswers] = useState({});
  var [questionStates, setQuestionStates] = useState(
    questions.map(function () {
      return "not-visited";
    })
  );
  var [examStatus, setExamStatus] = useState("active");
  var [timeLeft, setTimeLeft] = useState(INACTIVITY_LIMIT);
  var [isFullScreen, setIsFullScreen] = useState(false);

  var currentQuestion = questions[currentIndex];

  var answeredCount = useMemo(function () {
    return Object.keys(answers).length;
  }, [answers]);

  useEffect(function () {
    setQuestionStates(function (currentStates) {
      var updatedStates = currentStates.slice();

      if (updatedStates[currentIndex] === "not-visited") {
        updatedStates[currentIndex] = "not-answered";
      }

      return updatedStates;
    });
  }, [currentIndex]);

  useEffect(function () {
    if (examStatus !== "active") {
      return;
    }

    var intervalId = window.setInterval(function () {
      setTimeLeft(function (currentTime) {
        var nextTime = currentTime - 1000;

        if (nextTime <= 0) {
          window.clearInterval(intervalId);
          setExamStatus("cancelled");
          return 0;
        }

        return nextTime;
      });
    }, 1000);

    return function () {
      window.clearInterval(intervalId);
    };
  }, [examStatus]);

  useEffect(function () {
    if (examStatus !== "active") {
      return;
    }

    var resetInactivityTimer = function () {
      setTimeLeft(INACTIVITY_LIMIT);
    };

    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);

    return function () {
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
    };
  }, [examStatus]);

  useEffect(function () {
    function handleVisibilityChange () {
      if (document.hidden && examStatus === "active") {
        setExamStatus("cancelled");
      }
    }

    function handleFullScreenChange () {
      var currentlyFullScreen = document.fullscreenElement !== null;
      setIsFullScreen(currentlyFullScreen);

      if (!currentlyFullScreen && examStatus === "active") {
        setExamStatus("cancelled");
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return function () {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, [examStatus]);

  useEffect(function () {
    if (examStatus === "active" && !isFullScreen) {
      enterFullScreen();
    }
  }, [examStatus, isFullScreen]);

  function enterFullScreen () {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () {
        setExamStatus("cancelled");
      });
    }
  }

  function handleAnswerChange (answerIndex) {
    setAnswers(function (currentAnswers) {
      return {
        ...currentAnswers,
        [currentQuestion.id]: answerIndex
      };
    });
  }

  function saveAndNext () {
    if (answers[currentQuestion.id] === undefined) {
      setQuestionStates(function (currentStates) {
        var updatedStates = currentStates.slice();
        updatedStates[currentIndex] = "not-answered";
        return updatedStates;
      });
    } else {
      setQuestionStates(function (currentStates) {
        var updatedStates = currentStates.slice();
        updatedStates[currentIndex] = "answered";
        return updatedStates;
      });
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    setExamStatus("submitted");
  }

  function selectQuestion (index) {
    setCurrentIndex(index);
  }

  function formatTime (milliseconds) {
    var totalSeconds = Math.floor(milliseconds / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;

    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function handleExit () {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }

    onExit();
  }

  if (examStatus === "cancelled") {
    return (
      <main className="status-page">
        <section className="status-card danger">
          <span className="status-icon">!</span>
          <h1>Exam Cancelled</h1>
          <p>
            The examination was cancelled because of inactivity, a tab change,
            or exiting full-screen mode.
          </p>
          <button className="primary-button" type="button" onClick={handleExit}>
            Exit Exam
          </button>
        </section>
      </main>
    );
  }

  if (examStatus === "submitted") {
    return (
      <main className="status-page">
        <section className="status-card success">
          <span className="status-icon">✓</span>
          <h1>Exam Submitted</h1>
          <p>
            {candidate.name}, you answered {answeredCount} of {questions.length} questions.
          </p>
          <button className="primary-button" type="button" onClick={handleExit}>
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
          <p className="eyebrow">SECURE ONLINE TEST</p>
          <h1>Candidate Examination</h1>
          <p>{candidate.name} · {candidate.email}</p>
        </div>

        <div className="timer">
          <span>Inactivity timer</span>
          <strong>{formatTime(timeLeft)}</strong>
        </div>
      </header>

      <div className="exam-layout">
        <section className="question-card">
          <div className="question-meta">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>

          <h2>{currentQuestion.question}</h2>

          <div className="options">
            {currentQuestion.options.map(function (option, index) {
              var checked = answers[currentQuestion.id] === index;

              return (
                <label className={"option " + (checked ? "selected" : "")} key={option}>
                  <input
                    type="radio"
                    name={"question-" + currentQuestion.id}
                    checked={checked}
                    onChange={function () {
                      handleAnswerChange(index);
                    }}
                  />
                  <span className="option-number">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </label>
              );
            })}
          </div>

          <div className="question-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={currentIndex === 0}
              onClick={function () {
                setCurrentIndex(currentIndex - 1);
              }}
            >
              Previous
            </button>

            <button className="primary-button" type="button" onClick={saveAndNext}>
              {currentIndex === questions.length - 1 ? "Save & Submit" : "Save & Next"}
            </button>
          </div>
        </section>

        <Palette
          questions={questions}
          questionStates={questionStates}
          currentIndex={currentIndex}
          onSelect={selectQuestion}
        />
      </div>
    </main>
  );
}

export default Exam;