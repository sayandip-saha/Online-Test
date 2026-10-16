# Online Examination Portal — Complete User & Operations Guide

Welcome to the **Online Examination Portal**. This guide provides step-by-step instructions for **Candidates** taking an examination and **Administrators / Developers** deploying, running, and managing the application.

---

## 1. Quick Start & Setup Guide (Developers & Admins)

### 1.1 Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Ruby**: v3.2.0 or higher (v3.4+ compatible)
- **Bundler**: v2.4+
- **SQLite3**: Standard package on Linux/macOS/Windows

### 1.2 Installation Steps

1. **Clone & Open Project Directory**:
   ```bash
   cd /home/sayandip/Desktop/online-test-react
   ```

2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Backend Gems & Setup Database**:
   ```bash
   cd backend
   bundle install
   bin/rails db:migrate
   cd ..
   ```

### 1.3 Running the Application

You need two terminals running simultaneously (or run them using npm scripts):

- **Terminal 1: Start Rails API Backend (Port 3000)**:
  ```bash
  npm run server
  # Or manually:
  cd backend && bundle exec rails server -p 3000
  ```

- **Terminal 2: Start Vite React Frontend (Port 5173)**:
  ```bash
  npm run dev
  ```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 2. Candidate User Walkthrough

```
[1. Home Dashboard] ──> [2. Register/Login] ──> [3. Instructions] ──> [4. Enter Fullscreen]
                                                                              │
                                                                              v
[7. Download PDF] <── [6. Scorecard & Review] <── [5. Complete Exam] <── [In-Progress Exam]
```

### Step 1: Landing on the Home Dashboard
- When you first visit the portal, you will see the **Online Test Platform** hero section.
- If you are not signed in, click the primary action button: **`Sign In / Register to Start`**.

### Step 2: Candidate Authentication (Email + Date of Birth)
The portal uses a passwordless, secure authentication mechanism based on **Email ID** and **Date of Birth**:

- **New Candidates (Register)**:
  1. Click **"New candidate? Register here"**.
  2. Enter your **Full Name** (e.g., `John Doe`).
  3. Enter your **Email ID** (e.g., `john@example.com`).
  4. Select your **Date of Birth** using the date picker.
  5. Click **"Register & Continue"**. A secure JWT session token is generated automatically.

- **Returning Candidates (Login)**:
  1. Click **"Already registered? Log in"**.
  2. Enter your registered **Email ID** and matching **Date of Birth**.
  3. Click **"Log In & Continue"**.

> [!NOTE]
> Your credentials are validated against the backend database. You do not need to remember a complex password—your verified Date of Birth serves as your access key.

---

### Step 3: Reviewing Instructions & System Readiness
Once authenticated, you will see your name displayed at the top. The **Exam Instructions** screen will outline the critical rules:
- **1-Attempt Policy**: You are allowed exactly **one attempt**. Once submitted, you cannot retake the test.
- **Stable Connection**: Ensure your internet remains connected.
- **Fullscreen Requirement**: The exam will only run in full-screen mode.
- **Anti-Cheating Policy**: Switching browser tabs, minimizing the browser, or remaining inactive for 5 minutes will result in immediate test cancellation.

Click **`Start Exam`** to proceed. Your browser will prompt to enter **Full Screen Mode**. You must allow full screen to begin.

---

### Step 4: Taking the Examination

#### 1. Answering Questions
- Questions are displayed one by one on the left side of the screen.
- Click any of the 4 options to select your answer.
- Click **`Save & Next`** to confirm your choice and proceed to the next question.
- Click **`Previous`** to revisit previous questions.
- Click **`Clear Response`** if you wish to deselect your answer for the current question.

#### 2. "Mark for Review" (Yellow Flag)
- If you are unsure of an answer and wish to double-check it before submitting, click **`Mark for Review`**.
- The question will be tagged with a yellow bookmark icon in the top header and will display as **Amber/Yellow** on the question palette.

#### 3. Using the Question Palette (Right Panel)
The question palette lets you instantly navigate to any question and monitor your progress using color-coded badges:

| Color | Status Meaning |
|---|---|
| **Indigo Ring** | Currently active question |
| **Emerald (Green)** | Question answered and saved |
| **Amber (Yellow)** | Marked for Review |
| **Rose (Red)** | Visited but left unanswered |
| **Slate (Gray)** | Not yet visited |

You can also use the filter tabs above the palette (**All**, **Answered**, **Marked**, **Unanswered**) to focus only on questions requiring attention.

#### 4. Inactivity Countdown Timer (Top-Right)
- A 5-minute countdown timer is displayed at the top right.
- Any keyboard key, mouse movement, or touch gesture automatically resets this timer back to `05:00`.
- If you leave your device unattended for 5 minutes, the exam will be automatically cancelled.

---

### Step 5: Proctoring & Security Violations
The platform actively monitors for exam infractions:
- **Exiting Full Screen**: Triggers an immediate "Exam Cancelled" screen for security violation.
- **Switching Tabs or Minimizing Window**: Triggers cancellation for unauthorized navigation.

If your exam is cancelled due to a security violation, your attempt is marked as void and cannot be resumed.

---

### Step 6: Submitting the Examination
- When you reach the final question (or when you are satisfied with your answers), click the **`Submit Exam`** button in the header.
- A **Submit Confirmation Modal** will appear showing your current totals:
  - Total Questions Answered
  - Questions Marked for Review
  - Questions Left Unanswered
- Confirm by clicking **`Yes, Submit Final Exam`**.

---

### Step 7: Viewing Results & Detailed Analysis
Upon submission, the **Result Dashboard** opens immediately:
1. **Performance Summary**:
   - Total Score (e.g., `12 / 15`)
   - Percentage (e.g., `80%`)
   - Official Status: **PASSED** (score >= 60%) or **FAILED** (< 60%)
2. **Question Breakdown**:
   - Filter questions by **All**, **Correct**, **Incorrect**, or **Unanswered**.
   - Review the question text, your chosen option, the correct answer, and an explanation.

---

### Step 8: Downloading Official PDF Report Card
- On the Result Dashboard, click **`📥 Download PDF Report Card`**.
- An official, high-resolution vector PDF certificate is generated and downloaded instantly to your device.
- It includes:
  - Official Organization Banner & Watermark
  - Candidate Name, Email, and Date of Birth
  - Scorecard (Questions, Correct, Incorrect, Percentage, Result)
  - Security Verification Signature and Timestamp

---

### Step 9: Re-Visiting the Portal (Single Attempt Limit)
- When you exit to the **Home Screen**, the platform detects that your single attempt has been completed:
  - The attempt counter shows: **`Attempt: 1 / 1 (Limit Reached)`**.
  - The start button is locked: **`🔒 Exam Completed (1 of 1 Attempt Used)`**.
  - A prominent notice explains that repeat attempts are forbidden.
  - Your exam submission is listed in the **"Your Exam History"** table at the bottom, where you can re-download your PDF report card at any time.

---

## 3. Administrator & Proctor Operations Guide

The portal includes a dedicated, secure **Admin Console** accessible directly from the application header and footer.

### 3.1 Accessing the Admin Console
1. On the **Home Page**, click the **`⚙️ Admin Portal`** button in the top bar or **`⚙️ Administrator Console`** in the footer.
2. Enter the administrator passcode:
   - **Default Passcode**: `admin123` (configured via `ADMIN_PASSCODE` in backend).
3. Click **`Unlock Admin Dashboard`**.

### 3.2 Platform Analytics & KPIs
Upon login, the dashboard displays 4 live metrics:
- **Registered Candidates**: Total candidate profiles registered in the database.
- **Exam Submissions**: Number of completed test attempts recorded.
- **Passing Rate**: Percentage of candidates who achieved a score of 60% or above, with a breakdown of Passed vs Failed counts.
- **Average Score & Accuracy**: Average score out of 15 and mean accuracy percentage.

### 3.3 Managing Exam Submissions
Under the **`Exam Submissions`** tab:
- **Search & Filter**: Search candidates by name/email, and filter results by **All**, **Passed**, or **Failed**.
- **Inspect Detailed Answers (`View Answers`)**: Opens a modal showing the candidate's exact answer selection for every single question compared against the correct answer.
- **Download Official PDF Report Card (`📥 PDF`)**: Generates and downloads the candidate's vector report card on-demand.
- **Reset Attempt (`Reset`)**: Deletes the submission, allowing that specific candidate to retake their exam without wiping their registration profile.
- **Export to CSV (`📥 Export CSV`)**: Downloads a comprehensive spreadsheet with candidate names, emails, scores, breakdown, percentage, pass/fail status, and submission timestamps.

### 3.4 Managing Candidates
Under the **`Registered Candidates`** tab:
- View all candidates, their emails, dates of birth, and registration timestamps.
- **Attempt Status**: Check whether a candidate is **Eligible (0/1)** or **Completed (1/1)**.
- **Reset Attempt**: Clear a candidate's attempt so they can take the test again.
- **Delete Candidate**: Permanently remove a candidate and all their submissions.

### 3.5 Question Bank Inspection
Under the **`Question Bank`** tab:
- Review all 15 questions currently loaded in the exam paper.
- Verify option choices, correct answer indices, and educational explanations.

### 3.6 Resetting Platform / Emergency Wipe
- Click **`⚠️ Reset Platform`** in the admin toolbar to wipe all candidate accounts and exam submissions in one click with confirmation.

---

## 4. Technical Troubleshooting & Terminal FAQ

### 4.1 Inspecting Stored Records via Rails CLI
```bash
cd backend
bin/rails runner "Candidate.all.each { |c| puts \"Candidate: #{c.name} (#{c.email}) - Attempts: #{c.exam_submissions.count}\" }"
```

### 4.2 Resolving Stale Server PID
If Puma/Rails fails to start with `"A server is already running"`:
```bash
rm -f backend/tmp/pids/server.pid
```

### 4.3 In-Progress Session Recovery
If a candidate accidentally refreshes their browser tab during an active test:
- The system automatically restores the session from `sessionStorage("examProgress")`.
- All previously answered, visited, and flagged questions are restored seamlessly without losing candidate progress.

