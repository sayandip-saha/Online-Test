function Home({ onStartTest }) {
  function handleStartTest() {
    onStartTest();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_35%),radial-gradient(circle_at_bottom_right,#dbeafe,transparent_35%),#f8fafc] px-5 py-10">
      <section className="w-full max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:p-10 lg:p-15">
        <div className="inline-block rounded-full bg-indigo-50 px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-indigo-600">
          ONLINE TEST PLATFORM
        </div>
        <h1 className="mx-auto mt-6 mb-5 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[52px]">
          Test Your Knowledge.
          <span className="text-indigo-600"> Show What You Know.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-slate-500 sm:text-[17px] sm:leading-8">
          Welcome to our online examination platform. Complete the test, answer
          each question carefully, and submit your answers before the
          examination ends.
        </p>
        <div className="mx-auto my-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
            <div className="mb-4 grid size-10 place-items-center rounded-xl bg-indigo-50 font-extrabold text-indigo-600">
              ✓
            </div>
            <strong className="mb-2 block text-sm font-bold text-slate-900">
              Multiple Choice Questions
            </strong>
            <p className="text-sm leading-6 text-slate-500">
              Answer one question at a time.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
            <div className="mb-4 grid size-10 place-items-center rounded-xl bg-indigo-50 font-extrabold text-indigo-600">
              ⏱
            </div>
            <strong className="mb-2 block text-sm font-bold text-slate-900">
              Secure Examination
            </strong>
            <p className="text-sm leading-6 text-slate-500">
              Exam activity is monitored for security.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
            <div className="mb-4 grid size-10 place-items-center rounded-xl bg-indigo-50 font-extrabold text-indigo-600">
              ◆
            </div>
            <strong className="mb-2 block text-sm font-bold text-slate-900">
              Easy Navigation
            </strong>
            <p className="text-sm leading-6 text-slate-500">
              Use the question palette to navigate.
            </p>
          </div>
        </div>
        <button
          className="min-w-44 rounded-xl bg-indigo-600 px-7 py-4 text-base font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          type="button"
          onClick={handleStartTest}
        >
          Start Test
        </button>
        <p className="mt-5 text-xs text-slate-400">
          Make sure you are ready before starting the examination.
        </p>
      </section>
    </main>
  );
}

export default Home;
