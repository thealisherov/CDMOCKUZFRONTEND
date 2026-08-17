/**
 * Full Mock PDF Generator
 * Creates a clean, official vector IELTS Full Mock Test Report PDF
 * and downloads it immediately with filename IELTS_Full_Mock_<Name>.pdf.
 */

export function getCefrLevel(band) {
  const b = parseFloat(band) || 0;
  if (b >= 8.5) return "C2 Proficient";
  if (b >= 7.0) return "C1 Advanced";
  if (b >= 5.5) return "B2 Upper-Intermediate";
  if (b >= 4.0) return "B1 Intermediate";
  return "A2 Elementary";
}

export async function downloadFullMockPdf(resultData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF("p", "mm", "a4");

  const r = resultData?.results || {};
  const personName = resultData?.person_name || "Candidate";
  const testTitle = resultData?.title || "IELTS Full Mock Test";
  const createdAt = resultData?.created_at
    ? new Date(resultData.created_at).toLocaleDateString("uz-UZ", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
      })
    : new Date().toLocaleDateString("uz-UZ");

  const writingEvaluation = r.writing?.tasksEvaluation || {};
  const writingTasks = r.writing?.tasks || [];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  // ── Header Banner ──
  doc.setFillColor(30, 27, 75); // Dark Indigo
  doc.roundedRect(12, y, pageWidth - 24, 28, 4, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("MEGA IELTS — FULL MOCK TEST REPORT", pageWidth / 2, y + 11, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254);
  doc.text("Official AI-Evaluated Computer-Delivered Mock Exam Results", pageWidth / 2, y + 19, { align: "center" });

  y += 34;

  // ── Candidate & Test Info Box ──
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, y, pageWidth - 24, 24, 3, 3, "FD");

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Candidate:", 18, y + 9);
  doc.setFont("helvetica", "normal");
  doc.text(String(personName), 40, y + 9);

  doc.setFont("helvetica", "bold");
  doc.text("Test:", 18, y + 17);
  doc.setFont("helvetica", "normal");
  doc.text(String(testTitle), 40, y + 17);

  doc.setFont("helvetica", "bold");
  doc.text("Date:", 120, y + 9);
  doc.setFont("helvetica", "normal");
  doc.text(String(createdAt), 135, y + 9);

  doc.setFont("helvetica", "bold");
  doc.text("Status:", 120, y + 17);
  doc.setTextColor(22, 163, 74);
  doc.setFont("helvetica", "bold");
  doc.text("Completed", 135, y + 17);

  y += 30;

  // ── Overall Band Box ──
  const overallBand = String(r.overall_band || "0.0");
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(12, y, pageWidth - 24, 30, 4, 4, "FD");

  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("OVERALL IELTS BAND SCORE", pageWidth / 2, y + 9, { align: "center" });

  doc.setFontSize(28);
  doc.text(overallBand, pageWidth / 2 - 8, y + 23, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text("/ 9.0", pageWidth / 2 + 12, y + 21);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(67, 56, 202);
  doc.text(`CEFR Level: ${getCefrLevel(overallBand)}`, pageWidth - 20, y + 20, { align: "right" });

  y += 36;

  // ── Section Band Cards ──
  const cardWidth = (pageWidth - 24 - 8) / 3;

  // 1. Listening
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(12, y, cardWidth, 26, 3, 3, "FD");
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("LISTENING", 12 + cardWidth / 2, y + 8, { align: "center" });
  doc.setFontSize(16);
  doc.text(String(r.listening?.band || "0.0"), 12 + cardWidth / 2, y + 17, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text(`${r.listening?.score || 0} / ${r.listening?.total || 40} correct`, 12 + cardWidth / 2, y + 22, { align: "center" });

  // 2. Reading
  const rX = 12 + cardWidth + 4;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(rX, y, cardWidth, 26, 3, 3, "FD");
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("READING", rX + cardWidth / 2, y + 8, { align: "center" });
  doc.setFontSize(16);
  doc.text(String(r.reading?.band || "0.0"), rX + cardWidth / 2, y + 17, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text(`${r.reading?.score || 0} / ${r.reading?.total || 40} correct`, rX + cardWidth / 2, y + 22, { align: "center" });

  // 3. Writing
  const wX = rX + cardWidth + 4;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(wX, y, cardWidth, 26, 3, 3, "FD");
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("WRITING", wX + cardWidth / 2, y + 8, { align: "center" });
  doc.setFontSize(16);
  doc.text(String(r.writing?.band || "0.0"), wX + cardWidth / 2, y + 17, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.setFont("helvetica", "normal");
  doc.text("AI Examiner", wX + cardWidth / 2, y + 22, { align: "center" });

  y += 34;

  // ── Writing AI Evaluation Section ──
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Writing Assessment & AI Examiner Feedback", 12, y);
  y += 6;

  const evalEntries = Object.entries(writingEvaluation);
  if (evalEntries.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("No writing evaluation data available.", 12, y + 6);
    y += 12;
  } else {
    evalEntries.forEach(([idx, task]) => {
      const taskNum = Number(idx) + 1;
      const taskAns = writingTasks[idx] || {};

      if (y + 55 > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(12, y, pageWidth - 24, 12, 2, 2, "FD");

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Task ${taskNum} — Word Count: ${taskAns.wordCount || 0} words`, 16, y + 8);

      doc.setTextColor(79, 70, 229);
      doc.text(`Band ${task.BandScore || "0.0"}`, pageWidth - 20, y + 8, { align: "right" });
      y += 16;

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      const criteriaText = task.isTask1
        ? `Task Achievement: ${task.TaskAchievement}   |   Coherence & Cohesion: ${task.CoherenceAndCohesion}   |   Lexical Resource: ${task.LexicalResource}   |   Grammar: ${task.GrammaticalRangeAndAccuracy}`
        : `Task Response: ${task.TaskResponse}   |   Coherence & Cohesion: ${task.CoherenceAndCohesion}   |   Lexical Resource: ${task.LexicalResource}   |   Grammar: ${task.GrammaticalRangeAndAccuracy}`;
      doc.text(criteriaText, 16, y);
      y += 6;

      if (task.Feedback && task.Feedback !== "No response provided.") {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        const splitFeedback = doc.splitTextToSize(`Feedback: ${task.Feedback}`, pageWidth - 32);
        doc.text(splitFeedback, 16, y);
        y += splitFeedback.length * 3.8 + 4;
      }

      if (task.Corrections) {
        doc.setFontSize(8);
        doc.setTextColor(146, 64, 14);
        const splitCorr = doc.splitTextToSize(`Corrections: ${task.Corrections}`, pageWidth - 32);
        doc.text(splitCorr, 16, y);
        y += splitCorr.length * 3.8 + 6;
      }
    });
  }

  // ── Footer ──
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.text("Mega IELTS — Online IELTS Preparation & Mock Platform · https://mega-ielts.uz", pageWidth / 2, footerY, { align: "center" });

  const cleanName = String(personName).trim().replace(/[^a-zA-Z0-9]/g, "_") || "Candidate";
  doc.save(`IELTS_Full_Mock_${cleanName}.pdf`);
}
