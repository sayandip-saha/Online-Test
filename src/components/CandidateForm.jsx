import { useState } from "react";

function CandidateForm ({ onStartExam }) {
  var [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: ""
  });
  var [errors, setErrors] = useState({});

  function handleChange (event) {
    var name = event.target.name;
    var value = event.target.value;

    setFormData(function (currentData) {
      return {
        ...currentData,
        [name]: value
      };
    });

    setErrors(function (currentErrors) {
      return {
        ...currentErrors,
        [name]: ""
      };
    });
  }

  function validateForm () {
    var validationErrors = {};

    if (formData.name.trim() === "") {
      validationErrors.name = "Name is required.";
    }

    if (formData.email.trim() === "") {
      validationErrors.email = "Email ID is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = "Enter a valid email ID.";
    }

    if (formData.dateOfBirth === "") {
      validationErrors.dateOfBirth = "Date of Birth is required.";
    }

    return validationErrors;
  }

  function handleSubmit (event) {
    event.preventDefault();

    var validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onStartExam(formData);
  }

  return (
    <main className="candidate-page">
      <section className="candidate-card">
        <div className="brand-mark">OT</div>
        <p className="eyebrow">SECURE EXAMINATION</p>
        <h1>Online Test</h1>
        <p className="intro">
          Enter your details before starting the examination.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email ID</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
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
              <p className="field-error">{errors.dateOfBirth}</p>
            )}
          </div>

          <div className="exam-rules">
            <p>Before you start</p>
            <ul>
              <li>One question is displayed per page.</li>
              <li>Save your answer before moving to the next question.</li>
              <li>Leaving full screen or changing tabs cancels the exam.</li>
              <li>Five minutes of inactivity cancels the exam.</li>
            </ul>
          </div>

          <button className="primary-button" type="submit">
            Start Test
          </button>
        </form>
      </section>
    </main>
  );
}

export default CandidateForm;