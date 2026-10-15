import { useState, useEffect } from "react";
import CandidateForm from "./components/CandidateForm";
import ExamInstructions from "./components/ExamInstructions";
import Exam from "./components/Exam";
import Home from "./components/Home";
import { getCurrentCandidate, removeToken } from "./services/auth";

function App() {
  var [candidate, setCandidate] = useState(null);
  var [currentPage, setCurrentPage] = useState("home");
  var [isInitializing, setIsInitializing] = useState(true);

  // Restore authenticated session using JWT on initial load
  useEffect(function () {
    async function restoreSession() {
      try {
        var current = await getCurrentCandidate();
        if (current) {
          setCandidate(current);
        }
      } catch (err) {
        console.error("Failed to restore JWT session:", err);
      } finally {
        setIsInitializing(false);
      }
    }

    restoreSession();
  }, []);

  function handleStartTest() {
    if (candidate) {
      setCurrentPage("instructions");
    } else {
      setCurrentPage("registration");
    }
  }

  function handleContinue(candidateData) {
    setCandidate(candidateData);
    setCurrentPage("instructions");
  }

  function handleStartExam() {
    setCurrentPage("exam");
  }

  function handleExitExam() {
    setCurrentPage("home");
  }

  function handleLogout() {
    removeToken();
    setCandidate(null);
    setCurrentPage("home");
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-semibold">Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentPage === "home" && (
        <Home
          candidate={candidate}
          onStartTest={handleStartTest}
          onLogout={handleLogout}
        />
      )}
      {currentPage === "registration" && (
        <CandidateForm
          onContinue={handleContinue}
          onBack={() => setCurrentPage("home")}
        />
      )}
      {currentPage === "instructions" && (
        <ExamInstructions
          candidate={candidate || { name: "Candidate" }}
          onStartExam={handleStartExam}
        />
      )}
      {currentPage === "exam" && (
        <Exam candidate={candidate} onExit={handleExitExam} />
      )}
    </div>
  );
}

export default App;
