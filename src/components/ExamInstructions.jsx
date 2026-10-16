function ExamInstructions({ candidate, onStartExam, onBack }) {
  var hasAttempted = Boolean(candidate?.has_attempted);

  async function handleStartExam() {
    if (hasAttempted) {
      alert("You have already used your 1 permitted exam attempt.");
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
      onStartExam();
    } catch (error) {
      alert("Fullscreen mode is required to start the exam.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#eef2ff,#f8fafc_55%,#e0f2fe)] px-5 py-10">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-10">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-extrabold tracking-[0.14em] text-indigo-600">
              ONLINE TEST &bull; 1-ATTEMPT EXAMINATION
            </p>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
              >
                ← Back to Home
              </button>
            )}
          </div>

          <h1 className="my-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Exam Instructions
          </h1>

          <p className="leading-6 text-slate-500">
            Welcome,{" "}
            <strong className="text-slate-800">{candidate?.name || "Candidate"}</strong>. Please
            read the instructions carefully before starting.
          </p>
        </header>

        {hasAttempted && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <h3 className="text-sm font-bold text-amber-900">
              ⚠️ Attempt Limit Reached
            </h3>
            <p className="mt-1 text-xs text-amber-800">
              You have already completed your 1 permitted attempt for this exam. You cannot start a new attempt.
            </p>
          </div>
        )}

        <section className="mb-7">
          <h2 className="mb-3 text-xl font-bold text-slate-900">
            Before You Start
          </h2>

          <ul className="list-disc space-y-2.5 pl-6 leading-relaxed text-slate-600">
            <li><strong>Single Attempt Rule:</strong> You have exactly <strong>1 attempt</strong> to take and complete this examination.</li>
            <li>Make sure you have a stable internet connection.</li>
            <li>Keep your browser window open throughout the test.</li>
            <li>Allow the test to enter full screen mode.</li>
            <li>Do not switch to another browser tab.</li>
            <li>Do not exit full screen during the exam.</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="mb-3 text-xl font-bold text-slate-900">
            During the Exam
          </h2>

          <ul className="list-disc space-y-2.5 pl-6 leading-relaxed text-slate-600">
            <li>One question will be displayed at a time.</li>
            <li>Select one option for each question.</li>
            <li>Use Save &amp; Next to move to the next question.</li>
            <li>You can use the question palette to navigate.</li>
            <li>Questions can be reviewed before final submission.</li>
          </ul>
        </section>

        <div className="mt-7 rounded-xl border border-orange-200 bg-orange-50 p-5">
          <strong className="mb-2 block text-orange-800">Important</strong>

          <p className="leading-relaxed text-orange-900">
            The test will be cancelled if you switch browser tabs, exit full
            screen, or remain inactive for 5 minutes. Submitting will permanently conclude your 1 attempt.
          </p>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-end gap-3">
          {onBack && (
            <button
              className="rounded-xl border border-slate-300 px-5 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={onBack}
            >
              Back to Home
            </button>
          )}

          {hasAttempted ? (
            <button
              className="rounded-xl bg-slate-200 px-6 py-3.5 font-extrabold text-slate-400 cursor-not-allowed border border-slate-300"
              type="button"
              disabled
            >
              Attempt Limit Used
            </button>
          ) : (
            <button
              className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 sm:w-auto"
              type="button"
              onClick={handleStartExam}
            >
              Start Exam
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}

export default ExamInstructions;
