import jsPDF from 'jspdf';
import { Candidate, DetailedInterviewEvaluation } from '../types';

export const generateEvaluationFormPdf = (
  candidate: Candidate,
  evaluation: DetailedInterviewEvaluation
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const drawPageHeader = (pageNumber: number) => {
    // Version code at top right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    doc.text('2025/HRD/EF/Version-1', pageWidth - margin, margin - 3, { align: 'right' });

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('INTERVIEW EVALUATION FORM', margin, margin + 4);

    // UrbanGaon Brand Mark on right
    const logoX = pageWidth - margin - 45;
    const logoY = margin - 1;
    
    // Draw blue circular house logo
    doc.setFillColor(37, 129, 235);
    doc.circle(logoX + 4, logoY + 4, 3.8, 'F');
    // White house inside
    doc.setFillColor(255, 255, 255);
    doc.triangle(logoX + 4, logoY + 1.8, logoX + 2.2, logoY + 3.8, logoX + 5.8, logoY + 3.8, 'F');
    doc.rect(logoX + 2.6, logoY + 3.8, 2.8, 2.4, 'F');
    doc.setFillColor(37, 129, 235);
    doc.rect(logoX + 3.6, logoY + 4.8, 0.8, 1.4, 'F');

    // UrbanGaon text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text('UrbanGaon®', logoX + 9.5, logoY + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('a perfect balance', logoX + 9.5, logoY + 7.2);
  };

  // Helper to draw rating grid cells (5, 4, 3, 2, 1) for reviewers (RP, YT, SS)
  const drawRatingBoxes = (
    startX: number,
    startY: number,
    reviewerLabel: string,
    selectedScore: number
  ) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(17, 24, 39);
    doc.text(reviewerLabel, startX, startY + 3.8);

    const scores = [5, 4, 3, 2, 1];
    const boxSize = 3.6;
    const gap = 6.2;
    const firstBoxX = startX + 6.5;

    scores.forEach((score, idx) => {
      const bX = firstBoxX + idx * gap;
      const bY = startY + 0.6;
      const isSelected = selectedScore === score;

      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(0.3);

      if (isSelected) {
        doc.setFillColor(37, 129, 235);
        doc.rect(bX, bY, boxSize, boxSize, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);
        doc.text('✓', bX + 0.8, bY + 2.8);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(bX, bY, boxSize, boxSize, 'FD');
      }
    });
  };

  // ==================== PAGE 1 ====================
  drawPageHeader(1);
  let y = margin + 11;

  // 1. Candidate Info Table
  const rowHeight = 6.2;
  const col1W = 28;
  const col2W = 63;
  const col3W = 32;
  const col4W = contentWidth - (col1W + col2W + col3W);

  const infoRows = [
    {
      l1: 'Candidate Name:',
      v1: candidate.name,
      l2: 'Conducted By:',
      v2: evaluation.conductedBy || candidate.recruiterAssigned || 'HR Interview Panel'
    },
    {
      l1: 'Interview Date:',
      v1: evaluation.interviewDate || new Date().toISOString().slice(0, 10),
      l2: 'Interview Start Time:',
      v2: evaluation.interviewStartTime || '11:00 AM'
    },
    {
      l1: 'Contact Number:',
      v1: candidate.phone,
      l2: 'Email id:',
      v2: candidate.email
    },
    {
      l1: 'Position Applied for:',
      v1: candidate.jobAppliedFor,
      l2: 'Position Department:',
      v2: evaluation.department || candidate.department || 'Engineering & Operations'
    },
    {
      l1: 'Current Salary:',
      v1: evaluation.currentSalary || candidate.currentSalary || 'Confidential',
      l2: 'Expected Salary:',
      v2: evaluation.expectedSalary || candidate.expectedSalary
    }
  ];

  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, rowHeight * infoRows.length);

  infoRows.forEach((r, idx) => {
    const curY = y + idx * rowHeight;
    // Horizontal divider
    if (idx > 0) {
      doc.line(margin, curY, margin + contentWidth, curY);
    }

    // Col 1 label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(r.l1, margin + 2, curY + 4.3);

    // Col 2 value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(doc.splitTextToSize(r.v1, col2W - 4), margin + col1W + 1, curY + 4.3);

    // Col 3 label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(r.l2, margin + col1W + col2W + 2, curY + 4.3);

    // Col 4 value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(doc.splitTextToSize(r.v2, col4W - 4), margin + col1W + col2W + col3W + 1, curY + 4.3);
  });

  // Vertical dividers
  doc.line(margin + col1W, y, margin + col1W, y + rowHeight * infoRows.length);
  doc.line(margin + col1W + col2W, y, margin + col1W + col2W, y + rowHeight * infoRows.length);
  doc.line(margin + col1W + col2W + col3W, y, margin + col1W + col2W + col3W, y + rowHeight * infoRows.length);

  y += rowHeight * infoRows.length + 3;

  // 2. Instructions Box & Scale Table
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  const instructionText =
    'Interview evaluation forms are to be completed by the interviewer to rank the candidate’s overall qualifications for the position for which they have applied. Under each heading, the interviewer should give the candidate a numerical rating and write specific job-related comments in the space provided. The numerical rating system is based on the scale below.';
  const splitInstructions = doc.splitTextToSize(instructionText, contentWidth);
  doc.text(splitInstructions, margin, y + 3);
  y += splitInstructions.length * 3.4 + 2;

  // Scale bar
  doc.setDrawColor(70, 70, 70);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('Scale:', margin + 2, y + 3.8);

  doc.setFont('helvetica', 'normal');
  doc.text(
    '5 – Exceptional    4 – Above Average    3 – Average    2 – Satisfactory    1 – Unsatisfactory',
    margin + 15,
    y + 3.8
  );

  y += 7.5;

  // Rating Column Headers
  const ratingColX = pageWidth - margin - 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('Rating', ratingColX + 11, y + 1);
  y += 4;

  const scoreHeaderX = ratingColX + 6.5;
  [5, 4, 3, 2, 1].forEach((sc, i) => {
    doc.text(String(sc), scoreHeaderX + i * 6.2 + 1, y);
  });
  y += 2;

  // Questions 1, 2, 3 on Page 1
  const drawEvaluationQuestion = (
    qNum: number,
    title: string,
    description: string,
    bullets: string[],
    ratings: { rp: number; yt: number; ss: number; comments: string }
  ) => {
    const qStartY = y;
    const textWidth = ratingColX - margin - 4;

    doc.setDrawColor(70, 70, 70);
    doc.setLineWidth(0.3);

    // Number & title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text(String(qNum), margin + 1.5, y + 4.5);

    let textY = y + 4.5;
    doc.text(title, margin + 8, textY);
    
    // Description
    if (description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      const descLines = doc.splitTextToSize(description, textWidth - 8);
      textY += 4;
      doc.text(descLines, margin + 8, textY);
      textY += (descLines.length - 1) * 3.2;
    }

    // Bullet points
    if (bullets && bullets.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      bullets.forEach((b) => {
        textY += 3.4;
        doc.text(`•  ${b}`, margin + 12, textY);
      });
    }

    // Draw RP, YT, SS rating lines
    let ratingY = qStartY + 3;
    drawRatingBoxes(ratingColX, ratingY, 'RP', ratings.rp);
    ratingY += 5.5;
    drawRatingBoxes(ratingColX, ratingY, 'YT', ratings.yt);
    ratingY += 5.5;
    drawRatingBoxes(ratingColX, ratingY, 'SS', ratings.ss);

    // Section comments
    if (ratings.comments) {
      textY += 4.5;
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(7.5);
      doc.setTextColor(37, 99, 235);
      const commentLines = doc.splitTextToSize(`Comments: ${ratings.comments}`, textWidth - 8);
      doc.text(commentLines, margin + 8, textY);
      textY += (commentLines.length - 1) * 3.2;
    }

    const calculatedHeight = Math.max(textY - qStartY + 4, ratingY - qStartY + 8, 22);

    // Outline Box
    doc.rect(margin, qStartY, contentWidth, calculatedHeight);
    doc.line(margin + 6, qStartY, margin + 6, qStartY + calculatedHeight);
    doc.line(ratingColX - 2, qStartY, ratingColX - 2, qStartY + calculatedHeight);

    y = qStartY + calculatedHeight;
  };

  // Q1: Core Values
  drawEvaluationQuestion(
    1,
    'Core Values/ Culture fit',
    'The candidate\'s responses demonstrated a strong alignment with the company\'s core values.',
    [
      'Believe in Delight (wow)',
      'Spread smile',
      'Move fast',
      'Don’t waste',
      'Keep it simple'
    ],
    evaluation.coreValues
  );

  // Q2: Personality Development
  drawEvaluationQuestion(
    2,
    'Personality Development',
    'Personality, Grooming, Attitude, Attire, and time management skills.',
    [],
    evaluation.personality
  );

  // Q3: Communication Skills
  drawEvaluationQuestion(
    3,
    'Communication Skills',
    'How were the candidate’s communication skills during the interview? - Interpersonal Skills/Verbal/Passive Listening skills.',
    [],
    evaluation.communication
  );

  // Page 1 footer number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('1', margin, pageHeight - 6);
  doc.text('UrbanGaon Recruitment & Evaluation Protocol', pageWidth - margin, pageHeight - 6, { align: 'right' });

  // ==================== PAGE 2 ====================
  doc.addPage();
  drawPageHeader(2);
  y = margin + 12;

  // Q4: Adaptability & Receptiveness
  drawEvaluationQuestion(
    4,
    'Adaptability and Receptiveness to Feedback',
    'How did the candidate demonstrate their ability to adapt or improve based on new information or guidance? (Coachable/ Self-motivated/ Trainable/ Receptive)',
    [],
    evaluation.adaptability
  );

  // Q5: Technical Qualifications/Experience
  drawEvaluationQuestion(
    5,
    'Technical Qualifications/Experience',
    'Does the candidate possess the technical expertise, industry insights, and company-specific knowledge essential for this role?',
    [],
    evaluation.technical
  );

  // Q6: Overall Impression & Recommendation
  const q6StartY = y;
  const textWidth6 = ratingColX - margin - 4;

  doc.setDrawColor(70, 70, 70);
  doc.setLineWidth(0.3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('6', margin + 1.5, y + 4.5);
  doc.text('Overall Impression and Recommendation', margin + 8, y + 4.5);

  let q6TextY = y + 8.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const q6Desc = doc.splitTextToSize(
    'Summary of your perceptions of the candidate’s strengths/weaknesses. Final comments and recommendations for proceeding with the candidate.',
    textWidth6 - 8
  );
  doc.text(q6Desc, margin + 8, q6TextY);
  q6TextY += q6Desc.length * 3.4 + 2;

  // Three Positives
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text('Three Positive aspects about candidate:', margin + 8, q6TextY);
  q6TextY += 3.8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(17, 24, 39);
  const posArr = evaluation.positives || ['', '', ''];
  posArr.forEach((p, idx) => {
    doc.text(`${idx + 1}.  ${p || '—'}`, margin + 12, q6TextY);
    q6TextY += 3.6;
  });

  q6TextY += 2;

  // Three Negatives
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  doc.text('Three Negative aspects about candidate:', margin + 8, q6TextY);
  q6TextY += 3.8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(17, 24, 39);
  const negArr = evaluation.negatives || ['', '', ''];
  negArr.forEach((n, idx) => {
    doc.text(`${idx + 1}.  ${n || '—'}`, margin + 12, q6TextY);
    q6TextY += 3.6;
  });

  // Final Recommendation & Notes
  q6TextY += 2.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  const recMap: Record<string, string> = {
    strong_hire: 'STRONG HIRE',
    hire: 'HIRE',
    neutral: 'HOLD / MORE INFO',
    do_not_hire: 'DO NOT HIRE / REJECT'
  };
  const recStr = recMap[evaluation.overallRecommendation] || 'HIRE';
  doc.text(`Final Recommendation: ${recStr}`, margin + 8, q6TextY);

  if (evaluation.finalComments) {
    q6TextY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    const fNotes = doc.splitTextToSize(`Summary Notes: ${evaluation.finalComments}`, textWidth6 - 8);
    doc.text(fNotes, margin + 8, q6TextY);
    q6TextY += fNotes.length * 3.4;
  }

  // Draw Q6 Ratings on the right
  let rating6Y = q6StartY + 4;
  drawRatingBoxes(ratingColX, rating6Y, 'RP', evaluation.overallImpression.rp);
  rating6Y += 5.5;
  drawRatingBoxes(ratingColX, rating6Y, 'YT', evaluation.overallImpression.yt);
  rating6Y += 5.5;
  drawRatingBoxes(ratingColX, rating6Y, 'SS', evaluation.overallImpression.ss);

  const q6CalculatedHeight = Math.max(q6TextY - q6StartY + 5, 55);

  doc.rect(margin, q6StartY, contentWidth, q6CalculatedHeight);
  doc.line(margin + 6, q6StartY, margin + 6, q6StartY + q6CalculatedHeight);
  doc.line(ratingColX - 2, q6StartY, ratingColX - 2, q6StartY + q6CalculatedHeight);

  y = q6StartY + q6CalculatedHeight + 6;

  // Signatures Section
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + 50, y);
  doc.line(margin + 65, y, margin + 115, y);
  doc.line(pageWidth - margin - 50, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  doc.text('Interviewer Signature (RP)', margin, y + 4);
  doc.text('Technical Lead Signature (YT)', margin + 65, y + 4);
  doc.text('HR Head Signature (SS)', pageWidth - margin - 50, y + 4);

  // Page 2 footer number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('2', margin, pageHeight - 6);
  doc.text('UrbanGaon Recruitment & Evaluation Protocol', pageWidth - margin, pageHeight - 6, { align: 'right' });

  return doc;
};
