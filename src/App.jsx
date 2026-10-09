import { useState } from "react";
import CandidateForm from "./components/CandidateForm";
import ExamInstructions from "./components/ExamInstructions";
import Exam from "./components/Exam";
import Home from "./components/Home";

function App() {
  var [candidate, setCandidate] = useState(null);
  var [currentPage, setCurrentPage] = useState("home");

  function handleStartTest() {
    setCurrentPage("registration");
  }

  function handleContinue(candidateData) {
    setCandidate(candidateData);
    setCurrentPage("instructions");
  }

  function handleStartExam() {
    setCurrentPage("exam");
  }

  function handleExitExam() {
    setCandidate(null);
    setCurrentPage("home");
  }

  return (
    <div>
      {currentPage === "home" && <Home onStartTest={handleStartTest} />}
      {currentPage === "registration" && (
        <CandidateForm onContinue={handleContinue} />
      )}
      {currentPage === "instructions" && (
        <ExamInstructions candidate={candidate} onStartExam={handleStartExam} />
      )}
      {currentPage === "exam" && (
        <Exam candidate={candidate} onExit={handleExitExam} />
      )}
    </div>
  );
}

export default App;
