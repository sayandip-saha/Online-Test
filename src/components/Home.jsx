function Home({ onStartTest }) {
  function handleStartTest() {
    onStartTest();
  }

  return (
    <main className="home-page">
      <section className="home-card">
        <div className="home-badge">ONLINE TEST PLATFORM</div>

        <h1>
          Test Your Knowledge.
          <span> Show What You Know.</span>
        </h1>

        <p className="home-description">
          Welcome to our online examination platform. Complete the test, answer
          each question carefully, and submit your answers before the
          examination ends.
        </p>

        <div className="home-features">
          <div className="home-feature">
            <div className="feature-icon">✓</div>

            <div>
              <strong>Multiple Choice Questions</strong>
              <p>Answer one question at a time.</p>
            </div>
          </div>

          <div className="home-feature">
            <div className="feature-icon">⏱</div>

            <div>
              <strong>Secure Examination</strong>
              <p>Exam activity is monitored for security.</p>
            </div>
          </div>

          <div className="home-feature">
            <div className="feature-icon">◆</div>

            <div>
              <strong>Easy Navigation</strong>
              <p>Use the question palette to navigate.</p>
            </div>
          </div>
        </div>

        <button
          className="primary-button home-start-button"
          type="button"
          onClick={handleStartTest}
        >
          Start Test
        </button>

        <p className="home-note">
          Make sure you are ready before starting the examination.
        </p>
      </section>
    </main>
  );
}

export default Home;
