import { useState } from "react";

function CandidateForm({ onContinue }) {
  var [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
  });

  var [errors, setErrors] = useState({});

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
  }

  function validateForm() {
    var newErrors = {};

    if (formData.name.trim() === "") {
      newErrors.name = "Name is required.";
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

  function handleSubmit(event) {
    event.preventDefault();

    if (validateForm()) {
      onContinue(formData);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#eef2ff,#f8fafc_55%,#e0f2fe)] px-5 py-8">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-10">
        <header className="mb-8">
          <p className="mb-2 text-xs font-extrabold tracking-[0.14em] text-indigo-600">
            ONLINE TEST
          </p>

          <h1 className="mb-2 text-3xl font-extrabold text-slate-900 sm:text-[38px]">
            Candidate Registration
          </h1>

          <p className="leading-6 text-slate-500">
            Enter your details to continue to the test.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label
              className="mb-2 block font-bold text-slate-800"
              htmlFor="name"
            >
              Name
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
              placeholder="Enter your full name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />

            {errors.name && (
              <p id="name-error" className="mt-2 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label
              className="mb-2 block font-bold text-slate-800"
              htmlFor="email"
            >
              Email ID
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
              placeholder="Enter your email ID"
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
              aria-invalid={Boolean(errors.dateOfBirth)}
              aria-describedby={errors.dateOfBirth ? "dob-error" : undefined}
            />

            {errors.dateOfBirth && (
              <p id="dob-error" className="mt-2 text-sm text-red-600">
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          <button
            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            type="submit"
          >
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}

export default CandidateForm;
