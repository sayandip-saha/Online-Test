# Online Examination Platform — Technical Implementation Specification

This document provides a comprehensive technical breakdown of how each subsystem, controller, React component, state workflow, and utility function is implemented in the platform.

---

## 1. System Architecture & Tech Stack

```
+-----------------------------------------------------------+
|                   Client Browser                          |
|  React 19 (Hooks) + Vite 7 + Tailwind CSS v4 + jsPDF     |
+-----------------------------------------------------------+
                             |
                   HTTP / REST (JSON)
            Proxy: Vite /api -> localhost:3000
                             |
                             v
+-----------------------------------------------------------+
|                   Backend API Server                      |
|       Ruby on Rails 7.2.3 (API Mode) + SQLite3            |
|       JWT Authentication (HMAC-SHA256)                    |
+-----------------------------------------------------------+
```

### Directory Structure & Key Files
```
online-test-react/
├── backend/
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── application_controller.rb       # JWT auth filter
│   │   │   └── api/
│   │   │       ├── auth_controller.rb          # Register, Login, Me
│   │   │       └── exam_submissions_controller.rb # Submission & History
│   │   ├── models/
│   │   │   ├── candidate.rb                    # Candidate model & validations
│   │   │   └── exam_submission.rb              # Submission model & attempt guard
│   │   └── services/
│   │       └── json_web_token.rb               # JWT encoding/decoding helper
│   ├── config/
│   │   ├── routes.rb                           # API routes
│   │   └── initializers/cors.rb                # CORS whitelist
│   └── db/
│       └── migrate/                            # Active Record migrations
├── src/
│   ├── components/
│   │   ├── CandidateForm.jsx                   # Register / Login modal
│   │   ├── Exam.jsx                            # Proctored test environment
│   │   ├── ExamInstructions.jsx               # Candidate orientation screen
│   │   ├── Home.jsx                            # Main landing page & history table
│   │   ├── Palette.jsx                         # Question status navigation grid
│   │   └── ResultDashboard.jsx                 # Scorecard & answer analysis
│   ├── data/
│   │   └── questions.js                        # Standardized question bank
│   ├── services/
│   │   └── auth.js                             # API communication layer
│   ├── utils/
│   │   └── generateCertificatePdf.js           # Client-side jsPDF generator
│   └── App.jsx                                 # Root application controller
├── package.json
└── vite.config.js                              # Vite dev proxy configuration
```

---

## 2. Backend Implementation (Ruby on Rails 7.2)

### 2.1 Database Schema & Relationships

#### `candidates` Table
| Column | Type | Constraints / Attributes |
|---|---|---|
| `id` | integer | Primary Key, Auto-increment |
| `name` | string | Non-null, length: 2..100 |
| `email` | string | Non-null, Unique (case-insensitive) |
| `date_of_birth` | date | Non-null |
| `created_at` / `updated_at` | datetime | Auto-managed timestamps |

#### `exam_submissions` Table
| Column | Type | Constraints / Attributes |
|---|---|---|
| `id` | integer | Primary Key, Auto-increment |
| `candidate_id` | integer | Foreign Key references `candidates(id)` |
| `score` | integer | Non-null, >= 0 |
| `total_questions` | integer | Non-null, >= 0 |
| `percentage` | integer | Non-null, 0..100 |
| `correct_answers` | integer | Non-null, >= 0 |
| `incorrect_answers` | integer | Non-null, >= 0 |
| `unanswered_questions`| integer | Non-null, >= 0 |
| `passed` | boolean | Default: false |
| `answers_payload` | text | JSON serialized array of candidate choices |
| `created_at` / `updated_at` | datetime | Auto-managed timestamps |

**Active Record Association:**
```ruby
# backend/app/models/candidate.rb
class Candidate < ApplicationRecord
  has_many :exam_submissions, dependent: :destroy
end

# backend/app/models/exam_submission.rb
class ExamSubmission < ApplicationRecord
  belongs_to :candidate
end
```

---

### 2.2 JWT Authentication & Session Token Service

The token service uses the `jwt` gem (version ~> 3.3) and signs tokens using the application's unique `secret_key_base`:

```ruby
# backend/app/services/json_web_token.rb
class JsonWebToken
  SECRET_KEY = Rails.application.secret_key_base

  def self.encode(payload, exp = 7.days.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY, "HS256")
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: "HS256" })[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError
    nil
  end
end
```

#### Authentication Filter
In [`ApplicationController`](file:///home/sayandip/Desktop/online-test-react/backend/app/controllers/application_controller.rb):
- Extracts the `Authorization: Bearer <token>` header.
- Decodes token, extracting `candidate_id`.
- Sets `@current_candidate`.
- `authenticate_candidate!` halts execution with `401 Unauthorized` if no valid candidate is found.

---

### 2.3 Single-Attempt Enforcement in Backend

Enforcement is layered across **both model validations and controller guards**:

1. **Model Validation ([`ExamSubmission#single_attempt_per_candidate`](file:///home/sayandip/Desktop/online-test-react/backend/app/models/exam_submission.rb#L36-L44)):**
   ```ruby
   validate :single_attempt_per_candidate, on: :create

   def single_attempt_per_candidate
     return unless candidate
     if candidate.exam_submissions.where.not(id: id).exists?
       errors.add(:base, "You have already completed your exam attempt.")
     end
   end
   ```

2. **Controller Guard ([`Api::ExamSubmissionsController#create`](file:///home/sayandip/Desktop/online-test-react/backend/app/controllers/api/exam_submissions_controller.rb#L6-L12)):**
   ```ruby
   if current_candidate.exam_submissions.exists?
     render json: {
       error: "You have already completed your exam attempt. Only 1 attempt is permitted per candidate."
     }, status: :forbidden
     return
   end
   ```

3. **Status Serialization in Auth Payload ([`Api::AuthController#candidate_payload`](file:///home/sayandip/Desktop/online-test-react/backend/app/controllers/api/auth_controller.rb#L79-L87)):**
   ```ruby
   def candidate_payload(candidate)
     {
       id: candidate.id,
       name: candidate.name,
       email: candidate.email,
       dateOfBirth: candidate.date_of_birth.strftime("%Y-%m-%d"),
       has_attempted: candidate.exam_submissions.exists?,
       attempts_count: candidate.exam_submissions.count
     }
   end
   ```

---

## 3. Frontend Implementation (React 19)

### 3.1 Application State Machine ([`src/App.jsx`](file:///home/sayandip/Desktop/online-test-react/src/App.jsx))

The client app acts as a top-level state machine driven by `currentPage`:

```
               [App Init: GET /api/auth/me]
                          |
             +------------+------------+
             |                         |
      (Token Found)             (No Token)
             |                         |
             v                         v
     candidate logged in        candidate = null
             |                         |
             +------------+------------+
                          |
                          v
                    [Page: "home"]
                          |
         +----------------+----------------+
         |                                 |
 [Start Test clicked]             [Candidate Form]
         |                                 |
   has_attempted?                          |
    /         \                            |
 (Yes)        (No)                         |
   |           |                           |
Blocked   [Instructions] <-----------------+
               |
          [Start Exam]
               |
               v
         [Page: "exam"]
               |
         [Submit Test]
               |
               v
       [ResultDashboard]
               |
          [Exit Exam]
               |
               v
         [Page: "home"] (1 Attempt Reached)
```

---

### 3.2 Automated Proctoring System ([`src/components/Exam.jsx`](file:///home/sayandip/Desktop/online-test-react/src/components/Exam.jsx))

The proctoring system enforces three strict security policies during examination:

#### 1. Fullscreen Enforcement
- Initiated in `ExamInstructions.jsx` via `document.documentElement.requestFullscreen()`.
- Monitored in `Exam.jsx` via `fullscreenchange` event:
  ```javascript
  useEffect(() => {
    function handleFullscreenChange() {
      var isNowFullscreen = Boolean(document.fullscreenElement);
      setIsFullScreen(isNowFullscreen);
      if (!isNowFullscreen && examStatus === "running") {
        triggerExamCancellation("exited full screen mode");
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [examStatus]);
  ```

#### 2. Tab-Switch / Blur Detection
- Monitors page visibility and window focus:
  ```javascript
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && examStatus === "running") {
        triggerExamCancellation("switched browser tabs or minimized window");
      }
    }
    function handleBlur() {
      if (examStatus === "running") {
        triggerExamCancellation("lost window focus / tab switch");
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [examStatus]);
  ```

#### 3. Inactivity Countdown Timer (5 Minutes)
- Tracks user interaction events: `mousemove`, `mousedown`, `keydown`, `touchstart`.
- Resets inactivity timer to `300 seconds` whenever an event occurs.
- If timer reaches `0`, triggers cancellation for candidate absence.

---

### 3.3 Question Navigation & Mark for Review Palette

#### State Arrays
- `answers`: Array of length 15 storing selected option index (0..3) or `null`.
- `visitedQuestions`: Boolean array tracking questions viewed by the candidate.
- `flaggedQuestions`: Boolean array tracking questions marked for review.

#### Color-Coded Palette Rules ([`src/components/Palette.jsx`](file:///home/sayandip/Desktop/online-test-react/src/components/Palette.jsx))
Question buttons are dynamically computed based on priority:

```javascript
function getQuestionStyle(index) {
  var isCurrent = index === currentIndex;
  var isFlagged = flaggedQuestions[index];
  var isAnswered = answers[index] !== null && answers[index] !== undefined;
  var isVisited = visitedQuestions[index];

  // 1. Flagged / Mark for Review has high visual priority
  if (isFlagged) {
    return "bg-amber-400 text-amber-950 font-bold border-amber-500 shadow-sm";
  }
  // 2. Answered
  if (isAnswered) {
    return "bg-emerald-600 text-white font-bold border-emerald-700";
  }
  // 3. Visited but Unanswered
  if (isVisited) {
    return "bg-rose-500 text-white font-bold border-rose-600";
  }
  // 4. Not Visited
  return "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200";
}
```

---

### 3.4 Score Computation & Backend Submission

When candidate confirms submission in `Exam.jsx`:
```javascript
var totalQuestions = questions.length;
var correctAnswers = 0;
var incorrectAnswers = 0;
var unansweredQuestions = 0;

questions.forEach(function (question, index) {
  var selected = answers[index];
  if (selected === undefined || selected === null) {
    unansweredQuestions++;
  } else if (selected === question.correctAnswer) {
    correctAnswers++;
  } else {
    incorrectAnswers++;
  }
});

var score = correctAnswers;
var percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
var isPassed = percentage >= 60;
```

The payload is dispatched via `recordExamSubmission(payload)` to `POST /api/exam_submissions`, persisting the score, breakdown, and all answer selections to the database.

---

### 3.5 Vector PDF Generation ([`src/utils/generateCertificatePdf.js`](file:///home/sayandip/Desktop/online-test-react/src/utils/generateCertificatePdf.js))

The certificate is generated client-side using **jsPDF** vector drawing API rather than HTML canvas scraping, ensuring crisp typography, exact margins, and instant generation:

1. **Page Setup**: Standard `a4` portrait (210mm x 297mm).
2. **Branding Banner**: Deep indigo (`#1e1b4b`) top header with gold secondary accent band (`#d97706`).
3. **Typography**: Clean Helvetica vector fonts with hierarchical point sizes (`22pt` title, `11pt` headings, `9pt` metadata).
4. **Candidate Details Grid**: Name, Email ID, Date of Birth, and Unique Submission Identifier.
5. **Score Table**: Total Questions, Attempted Count, Correct Answers, Accuracy %, and Final Score.
6. **Pass / Fail Ribbon**:
   - `PASSED`: Emerald green vector pill (`#059669`).
   - `FAILED`: Crimson red vector pill (`#dc2626`).
7. **Security Watermark & Verification**: Includes ISO formatted timestamp, digital verification signature disclaimer, and single-page constraint logic.

