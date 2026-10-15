import { useState } from "react";
import { loginCandidate, registerCandidate } from "../services/auth";

function CandidateForm({ onContinue, onBack }) {
  var [isLoginMode, setIsLoginMode] = useState(false);
  var [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
  });

  var [errors, setErrors] = useState({});
  var [apiError, setApiError] = useState("");
  var [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    var { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });

    if (apiError) {
      setApiError("");
    }
  }

  function validateForm() {
    var newErrors = {};

    if (!isLoginMode) {
      if (formData.name.trim() === "") {
        newErrors.name = "Name is required.";
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters.";
      }
    }

    if (formData.email.trim() === "") {
      newErrors.email = "Email ID is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email ID.";
    }

    if (formData.dateOfBirth === "") {
      newErrors.dateOfBirth = "Date of Birth is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      var result;
      if (isLoginMode) {
        result = await loginCandidate(formData.email, formData.dateOfBirth);
      } else {
        result = await registerCandidate(
          formData.name,
          formData.email,
          formData.dateOfBirth,
        );
      }

      if (result && result.candidate) {
        onContinue(result.candidate);
      }
    } catch (err) {
      setApiError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(login) {
    setIsLoginMode(login);
    setApiError("");
    setErrors({});
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#eef2ff,#f8fafc_55%,#e0f2fe)] px-5 py-8">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-10">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold tracking-[0.14em] text-indigo-600">
              ONLINE TEST &bull; SECURE JWT AUTH
            </p>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
              >
                &larr; Back to Home
              </button>
            )}
          </div>

          <h1 className="mt-2 mb-2 text-3xl font-extrabold text-slate-900 sm:text-[36px]">
            {isLoginMode ? "Candidate Sign In" : "Candidate Registration"}
          </h1>

          <p className="leading-6 text-slate-500">
            {isLoginMode
              ? "Sign in with your registered Email and Date of Birth."
              : "Enter your details to register and begin the examination."}
          </p>
        </header>

        {/* Tab switch between Register and Login */}
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
              !isLoginMode
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            New Candidate (Register)
          </button>
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
              isLoginMode
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Registered Candidate (Sign In)
          </button>
        </div>

        {apiError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <span className="font-bold">Error:</span>
              <span>{apiError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {!isLoginMode && (
            <div className="mb-5">
              <label
                className="mb-2 block font-bold text-slate-800"
                htmlFor="name"
              >
                Candidate Full Name
              </label>

              <input
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
                  errors.name ? "border-red-500" : "border-slate-300"
                }`}
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />

              {errors.name && (
                <p id="name-error" className="mt-2 text-sm text-red-600">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          <div className="mb-5">
            <label
              className="mb-2 block font-bold text-slate-800"
              htmlFor="email"
            >
              Registered Email ID
            </label>

            <input
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
                errors.email ? "border-red-500" : "border-slate-300"
              }`}
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="candidate@example.com"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />

            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-7">
            <label
              className="mb-2 block font-bold text-slate-800"
              htmlFor="dateOfBirth"
            >
              Date of Birth
            </label>

            <input
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
                errors.dateOfBirth ? "border-red-500" : "border-slate-300"
              }`}
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.dateOfBirth)}
              aria-describedby={errors.dateOfBirth ? "dob-error" : undefined}
            />

            {errors.dateOfBirth && (
              <p id="dob-error" className="mt-2 text-sm text-red-600">
                {errors.dateOfBirth}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Your Date of Birth is used alongside your Email for authentication and JWT session creation.
            </p>
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-60 disabled:hover:translate-y-0"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="size-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Authenticating with JWT...</span>
              </>
            ) : isLoginMode ? (
              "Sign In with JWT & Continue"
            ) : (
              "Register & Continue to Exam"
            )}
          </button>
        </form>

        <footer className="mt-6 border-t border-slate-100 pt-5 text-center">
          <p className="text-xs text-slate-500">
            {isLoginMode ? "First time taking the exam? " : "Already registered? "}
            <button
              type="button"
              onClick={() => switchMode(!isLoginMode)}
              className="font-bold text-indigo-600 hover:underline"
            >
              {isLoginMode ? "Register here" : "Sign in here"}
            </button>
          </p>
        </footer>
      </section>
    </main>
  );
}

export default CandidateForm;
