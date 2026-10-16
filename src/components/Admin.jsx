import { useState, useEffect } from "react";
import questionsData from "../data/questions";
import {
  fetchAdminStats,
  fetchAdminSubmissions,
  fetchAdminCandidates,
  resetCandidateAttempt,
  deleteAdminSubmission,
  deleteAdminCandidate,
  clearAllPlatformData,
  getStoredAdminPasscode,
  setStoredAdminPasscode,
  clearStoredAdminPasscode,
} from "../services/admin";
import { generateCertificatePdf } from "../utils/generateCertificatePdf";

function Admin({ onBackToHome }) {
  var [passcode, setPasscode] = useState(getStoredAdminPasscode());
  var [inputPasscode, setInputPasscode] = useState("");
  var [isAuthorized, setIsAuthorized] = useState(Boolean(getStoredAdminPasscode()));
  var [authError, setAuthError] = useState("");
  var [activeTab, setActiveTab] = useState("submissions"); // "submissions", "candidates", "questions"

  // Data states
  var [stats, setStats] = useState(null);
  var [submissions, setSubmissions] = useState([]);
  var [candidates, setCandidates] = useState([]);
  var [loading, setLoading] = useState(false);
  var [actionFeedback, setActionFeedback] = useState({ message: "", type: "" });

  // Filters
  var [searchQuery, setSearchQuery] = useState("");
  var [resultFilter, setResultFilter] = useState("all"); // "all", "passed", "failed"

  // Modal states
  var [inspectSubmission, setInspectSubmission] = useState(null);
  var [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm, confirmText, isDanger }

  useEffect(function () {
    if (isAuthorized) {
      loadAllData();
    }
  }, [isAuthorized]);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    var code = inputPasscode.trim();
    if (!code) {
      setAuthError("Please enter the admin passcode.");
      return;
    }

    try {
      setLoading(true);
      await fetchAdminStats(code);
      setStoredAdminPasscode(code);
      setPasscode(code);
      setIsAuthorized(true);
    } catch (err) {
      setAuthError(err.message || "Invalid admin passcode.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogoutAdmin() {
    clearStoredAdminPasscode();
    setPasscode("");
    setIsAuthorized(false);
    setInputPasscode("");
    setStats(null);
    setSubmissions([]);
    setCandidates([]);
  }

  async function loadAllData() {
    setLoading(true);
    setActionFeedback({ message: "", type: "" });
    try {
      var [statsData, subsData, candsData] = await Promise.all([
        fetchAdminStats(passcode),
        fetchAdminSubmissions(passcode),
        fetchAdminCandidates(passcode),
      ]);
      setStats(statsData);
      setSubmissions(subsData);
      setCandidates(candsData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      if (err.message.includes("Unauthorized") || err.message.includes("passcode")) {
        setIsAuthorized(false);
        setAuthError("Session expired or invalid passcode. Please re-enter.");
      }
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(message, type = "success") {
    setActionFeedback({ message: message, type: type });
    setTimeout(function () {
      setActionFeedback({ message: "", type: "" });
    }, 4000);
  }

  // Admin Actions
  function handleResetAttempt(candidate) {
    setConfirmModal({
      title: "Reset Candidate Attempt?",
      message: `Are you sure you want to reset the exam attempt for ${candidate.name} (${candidate.email})? Their previous score will be removed, allowing them to take the exam again.`,
      confirmText: "Yes, Reset Attempt",
      isDanger: false,
      onConfirm: async function () {
        try {
          var res = await resetCandidateAttempt(candidate.id, passcode);
          showFeedback(res.message);
          loadAllData();
        } catch (err) {
          showFeedback(err.message || "Failed to reset attempt", "error");
        } finally {
          setConfirmModal(null);
        }
      },
    });
  }

  function handleDeleteSubmission(sub) {
    setConfirmModal({
      title: "Delete Exam Submission?",
      message: `Are you sure you want to delete this submission for ${sub.candidate_name}? This action will allow the candidate to retake the test.`,
      confirmText: "Yes, Delete Submission",
      isDanger: true,
      onConfirm: async function () {
        try {
          var res = await deleteAdminSubmission(sub.id, passcode);
          showFeedback(res.message);
          loadAllData();
        } catch (err) {
          showFeedback(err.message || "Failed to delete submission", "error");
        } finally {
          setConfirmModal(null);
        }
      },
    });
  }

  function handleDeleteCandidate(candidate) {
    setConfirmModal({
      title: "Delete Candidate?",
      message: `Permanently delete ${candidate.name} (${candidate.email}) and all their exam submissions? This cannot be undone.`,
      confirmText: "Yes, Delete Candidate",
      isDanger: true,
      onConfirm: async function () {
        try {
          var res = await deleteAdminCandidate(candidate.id, passcode);
          showFeedback(res.message);
          loadAllData();
        } catch (err) {
          showFeedback(err.message || "Failed to delete candidate", "error");
        } finally {
          setConfirmModal(null);
        }
      },
    });
  }

  function handleClearAllData() {
    setConfirmModal({
      title: "CLEAR ALL PLATFORM DATA?",
      message: "WARNING: This will permanently delete ALL registered candidates and ALL exam submissions. The database will be completely reset.",
      confirmText: "Yes, Clear Everything",
      isDanger: true,
      onConfirm: async function () {
        try {
          var res = await clearAllPlatformData(passcode);
          showFeedback(res.message);
          loadAllData();
        } catch (err) {
          showFeedback(err.message || "Failed to clear platform data", "error");
        } finally {
          setConfirmModal(null);
        }
      },
    });
  }

  function handleDownloadCandidatePdf(sub) {
    try {
      generateCertificatePdf({
        candidate: {
          name: sub.candidate_name,
          email: sub.candidate_email,
          dateOfBirth: sub.candidate_dob,
        },
        answers: sub.answers_payload || [],
      });
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF report card.");
    }
  }

  function exportSubmissionsCsv() {
    if (submissions.length === 0) {
      alert("No submissions available to export.");
      return;
    }

    var headers = [
      "Submission ID",
      "Candidate Name",
      "Candidate Email",
      "Score",
      "Total Questions",
      "Percentage",
      "Correct",
      "Incorrect",
      "Unanswered",
      "Status",
      "Submitted At",
    ];

    var rows = submissions.map(function (s) {
      return [
        s.id,
        `"${(s.candidate_name || "").replace(/"/g, '""')}"`,
        `"${(s.candidate_email || "").replace(/"/g, '""')}"`,
        s.score,
        s.total_questions,
        `${s.percentage}%`,
        s.correct_answers,
        s.incorrect_answers,
        s.unanswered_questions,
        s.passed ? "PASSED" : "FAILED",
        `"${s.submitted_at || ""}"`,
      ].join(",");
    });

    var csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exam_submissions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filter submissions
  var filteredSubmissions = submissions.filter(function (s) {
    var matchesSearch =
      (s.candidate_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.candidate_email || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (resultFilter === "passed") return s.passed;
    if (resultFilter === "failed") return !s.passed;
    return true;
  });

  // Filter candidates
  var filteredCandidates = candidates.filter(function (c) {
    return (
      (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Passcode Gate View
  if (!isAuthorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_35%),radial-gradient(circle_at_bottom_right,#dbeafe,transparent_35%),#f8fafc] px-5 py-10">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-10">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-indigo-50 text-3xl font-black text-indigo-600">
            🔐
          </div>

          <p className="text-xs font-extrabold tracking-[0.14em] text-indigo-600 uppercase">
            Restricted Access
          </p>
          <h1 className="mt-1 mb-2 text-2xl font-extrabold text-slate-900">
            Admin Portal
          </h1>
          <p className="mb-6 text-sm text-slate-500">
            Enter the administrator passcode to access candidate records, reset attempts, and view exam analytics.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                Admin Passcode
              </label>
              <input
                type="password"
                value={inputPasscode}
                onChange={(e) => setInputPasscode(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-100"
                autoFocus
              />
              <p className="mt-1 text-xs text-slate-400">
                Default system passcode: <code className="font-mono font-bold text-slate-600">admin123</code>
              </p>
            </div>

            {authError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-extrabold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Unlock Admin Dashboard"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
            >
              ← Back to Candidate Portal
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Authorized Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-lg font-black text-white">
              ⚙️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900">
                  Online Test &bull; Admin Console
                </h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Candidate Management, Single-Attempt Controls &amp; Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAllData}
              disabled={loading}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              title="Refresh all data"
            >
              🔄 {loading ? "Updating..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
            >
              Candidate Portal
            </button>

            <button
              type="button"
              onClick={handleLogoutAdmin}
              className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
        {/* Action feedback banner */}
        {actionFeedback.message && (
          <div
            className={`mb-6 flex items-center justify-between rounded-2xl p-4 text-sm font-semibold shadow-xs ${
              actionFeedback.type === "error"
                ? "border border-red-200 bg-red-50 text-red-800"
                : "border border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <span>{actionFeedback.type === "error" ? "⚠️" : "✓"} {actionFeedback.message}</span>
            <button
              type="button"
              onClick={() => setActionFeedback({ message: "", type: "" })}
              className="text-xs font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Metrics Row */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Candidates
              </span>
              <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                👥
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {stats ? stats.total_candidates : "..."}
            </p>
            <span className="mt-1 block text-xs text-slate-500">
              Total candidates in database
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Exam Submissions
              </span>
              <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                📝
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {stats ? stats.total_submissions : "..."}
            </p>
            <span className="mt-1 block text-xs text-slate-500">
              Completed examinations recorded
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Passing Rate
              </span>
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                🏆
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {stats ? `${stats.pass_rate}%` : "..."}
            </p>
            <span className="mt-1 block text-xs text-slate-500">
              {stats ? `${stats.passed_count} Passed / ${stats.failed_count} Failed` : ""}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Average Score
              </span>
              <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                📊
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {stats ? `${stats.average_score} / 15` : "..."}
            </p>
            <span className="mt-1 block text-xs text-slate-500">
              Average accuracy: {stats ? `${stats.average_percentage}%` : ""}
            </span>
          </div>
        </section>

        {/* Tab Navigation & Controls Bar */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("submissions")}
              className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === "submissions"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Exam Submissions ({submissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("candidates")}
              className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === "candidates"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Registered Candidates ({candidates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("questions")}
              className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === "questions"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Question Bank ({questionsData.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "submissions" && (
              <button
                type="button"
                onClick={exportSubmissionsCsv}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition flex items-center gap-1.5"
              >
                📥 Export CSV
              </button>
            )}

            <button
              type="button"
              onClick={handleClearAllData}
              className="rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition flex items-center gap-1.5"
            >
              ⚠️ Reset Platform
            </button>
          </div>
        </section>

        {/* Search & Filter Bar (for Submissions & Candidates) */}
        {activeTab !== "questions" && (
          <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by candidate name or email..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-9 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                🔍
              </span>
            </div>

            {activeTab === "submissions" && (
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setResultFilter("all")}
                  className={`rounded-lg px-3 py-1.5 ${
                    resultFilter === "all" ? "bg-indigo-50 text-indigo-700 font-extrabold" : "hover:text-slate-900"
                  }`}
                >
                  All ({submissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setResultFilter("passed")}
                  className={`rounded-lg px-3 py-1.5 ${
                    resultFilter === "passed" ? "bg-emerald-50 text-emerald-700 font-extrabold" : "hover:text-slate-900"
                  }`}
                >
                  Passed ({submissions.filter((s) => s.passed).length})
                </button>
                <button
                  type="button"
                  onClick={() => setResultFilter("failed")}
                  className={`rounded-lg px-3 py-1.5 ${
                    resultFilter === "failed" ? "bg-red-50 text-red-700 font-extrabold" : "hover:text-slate-900"
                  }`}
                >
                  Failed ({submissions.filter((s) => !s.passed).length})
                </button>
              </div>
            )}
          </section>
        )}

        {/* Tab 1: Submissions Table */}
        {activeTab === "submissions" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {loading ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading exam submissions...
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-500">
                {submissions.length === 0
                  ? "No exam submissions recorded in the database yet."
                  : "No submissions match your search/filter criteria."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Candidate</th>
                      <th className="px-5 py-3.5">Score</th>
                      <th className="px-5 py-3.5">Percentage</th>
                      <th className="px-5 py-3.5">Breakdown (C / I / U)</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Submitted At</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map(function (sub) {
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-4">
                            <strong className="block text-slate-900 font-bold">
                              {sub.candidate_name}
                            </strong>
                            <span className="text-xs text-slate-500">
                              {sub.candidate_email}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-slate-900">
                            {sub.score} / {sub.total_questions}
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800">
                            {sub.percentage}%
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                            <span className="text-emerald-700 font-bold">{sub.correct_answers}</span> /{" "}
                            <span className="text-red-600 font-bold">{sub.incorrect_answers}</span> /{" "}
                            <span className="text-slate-400 font-bold">{sub.unanswered_questions}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                                sub.passed
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {sub.passed ? "PASSED" : "FAILED"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                            {sub.submitted_at}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setInspectSubmission(sub)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
                                title="Inspect Question Answers"
                              >
                                View Answers
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadCandidatePdf(sub)}
                                className="rounded-lg border border-indigo-200 bg-indigo-50/50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                                title="Download Vector PDF Report Card"
                              >
                                📥 PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubmission(sub)}
                                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                                title="Delete submission & allow re-test"
                              >
                                Reset
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Candidates Table */}
        {activeTab === "candidates" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {loading ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading candidates...
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-500">
                {candidates.length === 0
                  ? "No candidates registered yet."
                  : "No candidates match your search query."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Date of Birth</th>
                      <th className="px-5 py-3.5">Attempt Status</th>
                      <th className="px-5 py-3.5">Last Score</th>
                      <th className="px-5 py-3.5">Registered</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCandidates.map(function (c) {
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-4 font-mono text-xs text-slate-400">
                            #{c.id}
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-900">
                            {c.name}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-600">
                            {c.email}
                          </td>
                          <td className="px-5 py-4 text-xs font-mono text-slate-600">
                            {c.date_of_birth}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                c.has_attempted
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {c.has_attempted ? "1 / 1 (Completed)" : "0 / 1 (Eligible)"}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800">
                            {c.last_submission ? (
                              <span
                                className={
                                  c.last_submission.passed ? "text-emerald-700" : "text-red-600"
                                }
                              >
                                {c.last_submission.score}/{c.last_submission.total_questions} ({c.last_submission.percentage}%)
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">No attempt</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                            {c.created_at}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {c.has_attempted ? (
                                <button
                                  type="button"
                                  onClick={() => handleResetAttempt(c)}
                                  className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                                  title="Reset exam attempt for this candidate"
                                >
                                  Reset Attempt
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400 italic px-2">Ready</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteCandidate(c)}
                                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                                title="Delete Candidate"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Question Bank Overview */}
        {activeTab === "questions" && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Question Bank Roster
                </h2>
                <p className="text-xs text-slate-500">
                  Current standardized 15-question examination paper with answer keys and explanations
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                15 Questions Total
              </span>
            </div>

            <div className="space-y-3">
              {questionsData.map(function (q, idx) {
                return (
                  <div
                    key={q.id || idx}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Correct Option: Index {q.correctAnswer} ({q.options[q.correctAnswer]})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                      {q.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-3">
                      {q.options.map(function (opt, oIdx) {
                        var isCorrect = oIdx === q.correctAnswer;
                        return (
                          <div
                            key={oIdx}
                            className={`rounded-xl border p-2.5 text-xs font-medium ${
                              isCorrect
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-bold"
                                : "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="mr-2 font-mono">{String.fromCharCode(65 + oIdx)}.</span>
                            {opt} {isCorrect && " ✓ (Correct)"}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 border border-slate-100">
                        <strong className="text-slate-800">Explanation: </strong>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Inspect Submission Answers Modal */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Submission Details: {inspectSubmission.candidate_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Score: {inspectSubmission.score}/15 ({inspectSubmission.percentage}%) &bull;{" "}
                  {inspectSubmission.passed ? "PASSED" : "FAILED"} &bull; {inspectSubmission.submitted_at}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectSubmission(null)}
                className="rounded-full bg-slate-100 size-8 text-slate-600 hover:bg-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {questionsData.map(function (question, index) {
                var chosenIndex = inspectSubmission.answers_payload
                  ? inspectSubmission.answers_payload[index]
                  : null;
                var isAnswered = chosenIndex !== null && chosenIndex !== undefined;
                var isCorrect = isAnswered && chosenIndex === question.correctAnswer;

                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-4 text-xs ${
                      !isAnswered
                        ? "border-slate-200 bg-slate-50/70"
                        : isCorrect
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-red-200 bg-red-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">
                        Question {index + 1}
                      </span>
                      <span
                        className={`font-extrabold px-2 py-0.5 rounded-full ${
                          !isAnswered
                            ? "bg-slate-200 text-slate-700"
                            : isCorrect
                            ? "bg-emerald-200 text-emerald-900"
                            : "bg-red-200 text-red-900"
                        }`}
                      >
                        {!isAnswered ? "UNANSWERED" : isCorrect ? "CORRECT (+1)" : "INCORRECT"}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-900 mb-3 text-sm">
                      {question.question}
                    </p>

                    <div className="space-y-1.5 pl-2">
                      {question.options.map(function (opt, oIdx) {
                        var isCandidateSelection = chosenIndex === oIdx;
                        var isRealCorrect = oIdx === question.correctAnswer;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg ${
                              isCandidateSelection && isRealCorrect
                                ? "bg-emerald-100 text-emerald-900 font-bold"
                                : isCandidateSelection && !isRealCorrect
                                ? "bg-red-100 text-red-900 font-bold line-through"
                                : isRealCorrect
                                ? "bg-emerald-50 text-emerald-800 font-semibold"
                                : "text-slate-600"
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                            {isCandidateSelection && " ◄ Candidate Answer"}
                            {isRealCorrect && !isCandidateSelection && " ✓ Correct Answer"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setInspectSubmission(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Action Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center">
            <div
              className={`mx-auto mb-4 grid size-12 place-items-center rounded-2xl ${
                confirmModal.isDanger ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
              } text-2xl font-black`}
            >
              {confirmModal.isDanger ? "⚠️" : "❓"}
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-2">
              {confirmModal.title}
            </h3>

            <p className="text-xs leading-relaxed text-slate-600 mb-6">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`rounded-xl px-4 py-2.5 text-xs font-extrabold text-white transition ${
                  confirmModal.isDanger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {confirmModal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;

