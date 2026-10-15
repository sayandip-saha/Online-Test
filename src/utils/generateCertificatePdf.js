import { jsPDF } from "jspdf";
import questions from "../data/questions";

export function generateCertificatePdf({ candidate, answers = [] }) {
  var totalQuestions = questions.length;
  var correctAnswers = 0;
  var incorrectAnswers = 0;
  var unansweredQuestions = 0;
  var passingPercentage = 60;

  questions.forEach(function (question, index) {
    var selectedAnswer = Array.isArray(answers)
      ? answers[index]
      : answers[question.id];

    if (selectedAnswer === undefined || selectedAnswer === null) {
      unansweredQuestions++;
    } else if (selectedAnswer === question.correctAnswer) {
      correctAnswers++;
    } else {
      incorrectAnswers++;
    }
  });

  var score = correctAnswers;
  var percentage =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  var isPassed = percentage >= passingPercentage;

  var candidateName = candidate?.name || "Candidate";
  var candidateEmail = candidate?.email || "N/A";
  var examDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  var doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  var pageWidth = 210;
  var margin = 14;
  var contentWidth = pageWidth - margin * 2; // 182 mm

  // ==========================================
  // PAGE 1: SCORECARD & PERFORMANCE SUMMARY
  // ==========================================

  // Top Accent Bar
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(margin, 12, contentWidth, 3, "F");

  // Header Title & Date
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text("ONLINE EXAMINATION REPORT CARD", margin, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text("Official Performance Assessment & Verification", margin, 29);

  // Right-aligned Date
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${examDate}`, pageWidth - margin, 24, { align: "right" });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, 34, pageWidth - margin, 34);

  // ------------------------------------------
  // Candidate Profile & Result Card
  // ------------------------------------------
  var profileY = 38;
  var profileH = 28;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, profileY, contentWidth, profileH, 2, 2, "FD");

  // Left side: Candidate details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(candidateName, margin + 6, profileY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${candidateEmail}`, margin + 6, profileY + 16);
  doc.text("Assessment: Web Development & Programming Assessment", margin + 6, profileY + 22);

  // Right side: Result Badge
  var badgeW = 56;
  var badgeH = 16;
  var badgeX = pageWidth - margin - badgeW - 6;
  var badgeY = profileY + 6;

  if (isPassed) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text("PASSED", badgeX + badgeW / 2, badgeY + 7.5, { align: "center" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(4, 120, 87);
    doc.text(`Threshold: ${passingPercentage}% met`, badgeX + badgeW / 2, badgeY + 12.5, { align: "center" });
  } else {
    doc.setFillColor(254, 242, 242); // Red 50
    doc.setDrawColor(254, 202, 202); // Red 200
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38); // Red 600
    doc.text("FAILED", badgeX + badgeW / 2, badgeY + 7.5, { align: "center" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(185, 28, 28);
    doc.text(`Below ${passingPercentage}% threshold`, badgeX + badgeW / 2, badgeY + 12.5, { align: "center" });
  }

  // ------------------------------------------
  // Performance Metric Cards (5 Cards)
  // ------------------------------------------
  var cardY = 72;
  var numCards = 5;
  var cardGap = 3.5;
  var cardW = (contentWidth - cardGap * (numCards - 1)) / numCards; // ~33.6 mm
  var cardH = 22;

  var metrics = [
    { label: "FINAL SCORE", value: `${score}/${totalQuestions}`, bg: [238, 242, 255], border: [199, 210, 254], valColor: [67, 56, 202] },
    { label: "PERCENTAGE", value: `${percentage}%`, bg: [239, 246, 255], border: [191, 219, 254], valColor: [29, 78, 216] },
    { label: "CORRECT", value: `${correctAnswers}`, bg: [240, 253, 244], border: [187, 247, 208], valColor: [21, 128, 61] },
    { label: "INCORRECT", value: `${incorrectAnswers}`, bg: [254, 242, 242], border: [254, 202, 202], valColor: [185, 28, 28] },
    { label: "UNANSWERED", value: `${unansweredQuestions}`, bg: [255, 251, 235], border: [254, 240, 138], valColor: [180, 83, 9] },
  ];

  metrics.forEach(function (m, idx) {
    var cX = margin + idx * (cardW + cardGap);
    doc.setFillColor(m.bg[0], m.bg[1], m.bg[2]);
    doc.setDrawColor(m.border[0], m.border[1], m.border[2]);
    doc.roundedRect(cX, cardY, cardW, cardH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cX + cardW / 2, cardY + 6.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(m.valColor[0], m.valColor[1], m.valColor[2]);
    doc.text(m.value, cX + cardW / 2, cardY + 16, { align: "center" });
  });

  // ------------------------------------------
  // Itemized Question Performance Section
  // ------------------------------------------
  var sectionY = 101;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Itemized Question Breakdown & Answer Key", margin, sectionY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total: ${totalQuestions} Questions  |  Passing: ${passingPercentage}%`, pageWidth - margin, sectionY, { align: "right" });

  // Function to draw Table Header
  function drawTableHeader(y) {
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 7, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    doc.text("#", margin + 3, y + 4.8);
    doc.text("Question", margin + 11, y + 4.8);
    doc.text("Your Answer", margin + 92, y + 4.8);
    doc.text("Correct Answer", margin + 138, y + 4.8);
    doc.text("Result", margin + 172, y + 4.8, { align: "center" });

    return y + 7;
  }

  var currentTableY = drawTableHeader(sectionY + 4);
  var pageMaxY = 282;
  var currentPageNum = 1;

  questions.forEach(function (question, index) {
    var selectedAnswer = Array.isArray(answers)
      ? answers[index]
      : answers[question.id];

    var isUnanswered = selectedAnswer === undefined || selectedAnswer === null;
    var isCorrect = !isUnanswered && selectedAnswer === question.correctAnswer;

    var yourAnsText = isUnanswered
      ? "— Not Answered"
      : `(${String.fromCharCode(65 + selectedAnswer)}) ${question.options[selectedAnswer]}`;

    var correctAnsText = `(${String.fromCharCode(65 + question.correctAnswer)}) ${question.options[question.correctAnswer]}`;

    // Calculate wrapped text lines
    var qLines = doc.splitTextToSize(`${index + 1}. ${question.question}`, 78);
    var yourLines = doc.splitTextToSize(yourAnsText, 43);
    var correctLines = doc.splitTextToSize(correctAnsText, 32);

    var maxTextLines = Math.max(qLines.length, yourLines.length, correctLines.length);
    var rowHeight = Math.max(8, maxTextLines * 3.4 + 3);

    // If row exceeds page, start a new page
    if (currentTableY + rowHeight > pageMaxY) {
      // Print footer for current page
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${currentPageNum}`, pageWidth / 2, 291, { align: "center" });

      doc.addPage("a4", "portrait");
      currentPageNum++;

      // New page top bar
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, 10, contentWidth, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text("Itemized Question Breakdown (Continued)", margin, 18);

      currentTableY = drawTableHeader(21);
    }

    // Alternating Row Background
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252); // Slate 50
    }

    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentTableY, contentWidth, rowHeight, "FD");

    // Question Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(qLines, margin + 3, currentTableY + 4.2);

    // Your Answer
    if (isUnanswered) {
      doc.setTextColor(217, 119, 6); // Amber
    } else if (isCorrect) {
      doc.setTextColor(22, 101, 52); // Green
    } else {
      doc.setTextColor(220, 38, 38); // Red
    }
    doc.text(yourLines, margin + 92, currentTableY + 4.2);

    // Correct Answer
    doc.setTextColor(71, 85, 105);
    doc.text(correctLines, margin + 138, currentTableY + 4.2);

    // Result Badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    if (isCorrect) {
      doc.setTextColor(22, 101, 52);
      doc.text("✓ Correct", margin + 172, currentTableY + 4.8, { align: "center" });
    } else if (isUnanswered) {
      doc.setTextColor(180, 83, 9);
      doc.text("— Skipped", margin + 172, currentTableY + 4.8, { align: "center" });
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text("✗ Wrong", margin + 172, currentTableY + 4.8, { align: "center" });
    }

    currentTableY += rowHeight;
  });

  // Footer for last page
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Page ${currentPageNum}`, pageWidth / 2, 291, { align: "center" });

  var safeName = candidateName.replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`Report_Card_${safeName}.pdf`);
}
