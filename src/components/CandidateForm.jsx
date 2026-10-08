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
    <main className="candidate-page">
      <section className="candidate-card">
        <div className="candidate-header">
          <p className="eyebrow">ONLINE TEST</p>
          <h1>Candidate Registration</h1>
          <p>Enter your details to continue to the test.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email ID</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email ID"
            />

            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>

            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            {errors.dateOfBirth && (
              <p className="error-message">{errors.dateOfBirth}</p>
            )}
          </div>

          <button className="primary-button" type="submit">
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}

export default CandidateForm;
