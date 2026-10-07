import { useState } from "react";
import CandidateForm from "./components/CandidateForm";
import Exam from "./components/Exam";

function App () {
  var [candidate, setCandidate] = useState(null);

  function handleStartExam (candidateData) {
    setCandidate(candidateData);
  }

  function handleExamExit () {
    setCandidate(null);
  }

  if (candidate === null) {
    return <CandidateForm onStartExam={handleStartExam} />;
  }

  return <Exam candidate={candidate} onExit={handleExamExit} />;
}

export default App;