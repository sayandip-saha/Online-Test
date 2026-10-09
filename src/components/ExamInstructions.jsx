function ExamInstructions({ candidate, onStartExam }) {
  async function handleStartExam() {
    try {
      await document.documentElement.requestFullscreen();
      onStartExam();
    } catch (error) {
      alert("Fullscreen mode is required to start the exam.");
    }
  }

  return (
    <main className="instructions-page">
      <section className="instructions-card">
        <div className="instructions-header">
          <p className="eyebrow">ONLINE TEST</p>

          <h1>Exam Instructions</h1>

          <p>
            Welcome, <strong>{candidate.name}</strong>. Please read the
            instructions carefully before starting.
          </p>
        </div>

        <div className="instructions-section">
          <h2>Before You Start</h2>

          <ul>
            <li>Make sure you have a stable internet connection.</li>
            <li>Keep your browser window open throughout the test.</li>
            <li>Allow the test to enter full screen mode.</li>
            <li>Do not switch to another browser tab.</li>
            <li>Do not exit full screen during the exam.</li>
          </ul>
        </div>

        <div className="instructions-section">
          <h2>During the Exam</h2>

          <ul>
            <li>One question will be displayed at a time.</li>
            <li>Select one option for each question.</li>
            <li>Use Save &amp; Next to move to the next question.</li>
            <li>You can use the question palette to navigate.</li>
            <li>Questions can be reviewed before final submission.</li>
          </ul>
        </div>

        <div className="warning-box">
          <strong>Important</strong>

          <p>
            The test will be cancelled if you switch browser tabs, exit full
            screen, or remain inactive for 5 minutes.
          </p>
        </div>

        <div className="instructions-footer">
          <button
            className="primary-button"
            type="button"
            onClick={handleStartExam}
          >
            Start Exam
          </button>
        </div>
      </section>
    </main>
  );
}

export default ExamInstructions;
