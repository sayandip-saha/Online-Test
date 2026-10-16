import { useEffect, useState } from "react";
import { getPastSubmissions } from "../services/auth";
import { generateCertificatePdf } from "../utils/generateCertificatePdf";

function Home({ candidate, onStartTest, onLogout }) {
  var [pastSubmissions, setPastSubmissions] = useState([]);
  var [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(function () {
    if (!candidate) {
      setPastSubmissions([]);
      return;
    }

    setLoadingHistory(true);
    getPastSubmissions()
      .then(function (submissions) {
        setPastSubmissions(submissions || []);
      })
      .catch(function (err) {
        console.error("Failed to load past submissions:", err);
      })
      .finally(function () {
        setLoadingHistory(false);
      });
  }, [candidate]);

  function handleDownloadHistoryPdf(sub) {
    try {
      generateCertificatePdf({
        candidate: candidate,
        answers: sub.answers_payload || [],
      });
    } catch (e) {
      console.error("Failed to download PDF for past submission:", e);
      alert("Unable to generate PDF report card.");
    }
  }

  var hasAttempted = Boolean(
    candidate?.has_attempted || pastSubmissions.length > 0
  );

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_35%),radial-gradient(circle_at_bottom_right,#dbeafe,transparent_35%),#f8fafc] px-5 py-10">
      <section className="w-full max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:p-10 lg:p-15">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-block rounded-full bg-indigo-50 px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-indigo-600">
            ONLINE TEST PLATFORM
          </div>

          {candidate && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="size-2 rounded-full bg-emerald-500"></span>
                JWT Authenticated: {candidate.name}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                  hasAttempted
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                Attempt: {hasAttempted ? "1 / 1 (Limit Reached)" : "0 / 1"}
              </span>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-red-600 transition"
                >
                  Log Out
                </button>
              )}
            </div>
          )}
        </div>

        <h1 className="mx-auto mt-4 mb-5 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[52px]">
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
              Strict 1-Attempt Limit
            </strong>
            <p className="text-sm leading-6 text-slate-500">
              Each registered candidate is granted exactly 1 attempt.
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

        {candidate && hasAttempted && (
          <div className="mx-auto my-6 max-w-2xl rounded-2xl border border-amber-300 bg-amber-50/90 p-5 text-left shadow-xs">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Exam Completed &bull; Single Attempt Limit Reached
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  Candidates are permitted to attempt this examination <strong>only once</strong>.
                  Your examination has already been completed and securely saved in the database.
                  Further attempts are not allowed. You can review your score and download your PDF report card below.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          {hasAttempted ? (
            <div className="flex flex-col items-center gap-2">
              <button
                className="min-w-64 rounded-xl bg-slate-200 px-7 py-4 text-base font-extrabold text-slate-400 cursor-not-allowed border border-slate-300"
                type="button"
                disabled
              >
                🔒 Exam Completed (1 of 1 Attempt Used)
              </button>
              <span className="text-xs text-slate-500">
                Only 1 attempt is allowed per candidate.
              </span>
            </div>
          ) : (
            <button
              className="min-w-48 rounded-xl bg-indigo-600 px-7 py-4 text-base font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              type="button"
              onClick={onStartTest}
            >
              {candidate ? "Continue to Exam Instructions" : "Sign In / Register to Start"}
            </button>
          )}
        </div>

        {/* Previous Attempts Section (from Rails Backend) */}
        {candidate && (
          <div className="mt-12 text-left border-t border-slate-100 pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Your Exam History (Saved in Database)
              </h2>
              <span className="text-xs text-slate-500">
                {pastSubmissions.length} attempt{pastSubmissions.length === 1 ? "" : "s"}
              </span>
            </div>

            {loadingHistory ? (
              <p className="text-sm text-slate-500 py-4 text-center">Loading exam history...</p>
            ) : pastSubmissions.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-500">
                You haven't submitted any exams yet. Start your first exam above!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Submitted At</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Percentage</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3 text-right">Report Card</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pastSubmissions.map(function (sub) {
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 text-xs font-medium text-slate-600">
                            {sub.submitted_at}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {sub.score} / {sub.total_questions}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {sub.percentage}%
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                sub.passed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {sub.passed ? "PASSED" : "FAILED"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDownloadHistoryPdf(sub)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              📥 Download PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <p className="mt-8 text-xs text-slate-400">
          Make sure you are ready before starting the examination.
        </p>
      </section>
    </main>
  );
}

export default Home;
