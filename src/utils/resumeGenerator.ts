import jsPDF from 'jspdf';
import { Candidate, CandidateSource } from '../types';

export const getSourceMeta = (source: CandidateSource) => {
  switch (source) {
    case 'naukri':
      return {
        label: 'Naukri.com Verified',
        badgeColor: '#0073e6',
        textColor: '#ffffff',
        accentColor: [0, 115, 230] as [number, number, number],
        iconText: 'NAUKRI FASTFORWARD'
      };
    case 'linkedin':
      return {
        label: 'LinkedIn EasyApply',
        badgeColor: '#0a66c2',
        textColor: '#ffffff',
        accentColor: [10, 102, 194] as [number, number, number],
        iconText: 'LINKEDIN VERIFIED CANDIDATE'
      };
    case 'indeed':
      return {
        label: 'Indeed Profile',
        badgeColor: '#2164f3',
        textColor: '#ffffff',
        accentColor: [33, 100, 243] as [number, number, number],
        iconText: 'INDEED RESUME'
      };
    case 'apna':
      return {
        label: 'Apna.co Verified Profile',
        badgeColor: '#059669',
        textColor: '#ffffff',
        accentColor: [5, 150, 105] as [number, number, number],
        iconText: 'APNA.CO VERIFIED APPLICANT'
      };
    case 'urbangaon':
      return {
        label: 'UrbanGaon Careers Portal',
        badgeColor: '#2581eb',
        textColor: '#ffffff',
        accentColor: [37, 129, 235] as [number, number, number],
        iconText: 'URBANGAON® • A PERFECT BALANCE'
      };
    case 'internshala':
      return {
        label: 'Internshala Candidate',
        badgeColor: '#00a5ec',
        textColor: '#ffffff',
        accentColor: [0, 165, 236] as [number, number, number],
        iconText: 'INTERNSHALA CERTIFIED'
      };
    case 'referral':
      return {
        label: 'Internal Referral',
        badgeColor: '#8b5cf6',
        textColor: '#ffffff',
        accentColor: [139, 92, 246] as [number, number, number],
        iconText: 'INTERNAL EMPLOYEE REFERRAL'
      };
    default:
      return {
        label: 'Direct Application',
        badgeColor: '#64748b',
        textColor: '#ffffff',
        accentColor: [100, 116, 139] as [number, number, number],
        iconText: 'STANDARD RESUME'
      };
  }
};

/**
 * Generates an authentic, high-quality, ATS-formatted PDF resume in real time.
 */
export const generateCandidateResumePdf = (candidate: Candidate): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  const sourceMeta = getSourceMeta(candidate.source);

  // 1. Top Decorative Brand Banner
  doc.setFillColor(sourceMeta.accentColor[0], sourceMeta.accentColor[1], sourceMeta.accentColor[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // 2. Platform Origin Header Badge
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, currentY, contentWidth, 9, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(sourceMeta.accentColor[0], sourceMeta.accentColor[1], sourceMeta.accentColor[2]);
  doc.text(`[ ${sourceMeta.iconText} ]`, margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  const syncDate = new Date(candidate.appliedDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Synced on: ${syncDate} | Ingestion Ref: ${candidate.id.toUpperCase()}`, pageWidth - margin - 4, currentY + 6, { align: 'right' });

  currentY += 16;

  // 3. Candidate Name & Primary Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39);
  doc.text(candidate.name, margin, currentY);

  currentY += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(sourceMeta.accentColor[0], sourceMeta.accentColor[1], sourceMeta.accentColor[2]);
  doc.text(candidate.jobAppliedFor.toUpperCase(), margin, currentY);

  // Experience & CTC Tag
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  const expText = `${candidate.experienceYears} Years Exp • Exp CTC: ${candidate.expectedSalary} • Notice: ${candidate.noticePeriod}`;
  doc.text(expText, pageWidth - margin, currentY, { align: 'right' });

  currentY += 7;

  // 4. Contact Information Bar
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  const contactString = `Email: ${candidate.email}   |   Phone: ${candidate.phone}   |   Location: ${candidate.location}`;
  doc.text(contactString, margin, currentY);

  currentY += 9;

  // 5. Executive Summary
  if (candidate.resumeData?.summary) {
    drawSectionHeader(doc, 'EXECUTIVE PROFESSIONAL SUMMARY', margin, currentY, contentWidth, sourceMeta.accentColor);
    currentY += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    
    const summaryLines = doc.splitTextToSize(candidate.resumeData.summary, contentWidth);
    doc.text(summaryLines, margin, currentY);
    currentY += (summaryLines.length * 4.6) + 5;
  }

  // 6. Key Skills & Technical Stack
  if (candidate.resumeData?.skills && candidate.resumeData.skills.length > 0) {
    drawSectionHeader(doc, 'CORE COMPETENCIES & TECHNICAL PROFICIENCIES', margin, currentY, contentWidth, sourceMeta.accentColor);
    currentY += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);

    // Render skill badges / string
    const skillList = candidate.resumeData.skills.join('   •   ');
    const skillLines = doc.splitTextToSize(skillList, contentWidth);
    doc.text(skillLines, margin, currentY);
    currentY += (skillLines.length * 4.6) + 5;
  }

  // 7. Work Experience
  if (candidate.resumeData?.experience && candidate.resumeData.experience.length > 0) {
    drawSectionHeader(doc, 'PROFESSIONAL EXPERIENCE', margin, currentY, contentWidth, sourceMeta.accentColor);
    currentY += 7;

    candidate.resumeData.experience.forEach((exp) => {
      // Check page overflow
      if (currentY > pageHeight - 35) {
        doc.addPage();
        currentY = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(17, 24, 39);
      doc.text(exp.role, margin, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(107, 114, 128);
      doc.text(exp.duration, pageWidth - margin, currentY, { align: 'right' });

      currentY += 4.5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(sourceMeta.accentColor[0], sourceMeta.accentColor[1], sourceMeta.accentColor[2]);
      doc.text(`${exp.company} — ${exp.location}`, margin, currentY);

      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);

      exp.highlights.forEach((point) => {
        const bulletText = `•  ${point}`;
        const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 4);
        
        if (currentY > pageHeight - 20) {
          doc.addPage();
          currentY = margin;
        }
        
        doc.text(bulletLines, margin + 2, currentY);
        currentY += (bulletLines.length * 4.2) + 1.5;
      });

      currentY += 3;
    });
  }

  // 8. Education & Certifications
  if (candidate.resumeData?.education && candidate.resumeData.education.length > 0) {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin;
    }

    drawSectionHeader(doc, 'EDUCATION & ACADEMIC CREDENTIALS', margin, currentY, contentWidth, sourceMeta.accentColor);
    currentY += 7;

    candidate.resumeData.education.forEach((edu) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(17, 24, 39);
      doc.text(edu.degree, margin, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(edu.year, pageWidth - margin, currentY, { align: 'right' });

      currentY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(`${edu.institution}${edu.grade ? ` | ${edu.grade}` : ''}`, margin, currentY);

      currentY += 5.5;
    });
  }

  // 9. ATS Screening & Verification Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `UrbanGaon® (a perfect balance) ATS • Candidate ID: ${candidate.id} • ATS Match: ${candidate.atsMatchScore}% • Recruiter: ${candidate.recruiterAssigned || 'Unassigned'}`,
      margin,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  return doc;
};

const drawSectionHeader = (
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  width: number,
  accentColor: [number, number, number]
) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(title, x, y);

  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.6);
  doc.line(x, y + 2, x + width, y + 2);
};

/**
 * Downloads candidate resume directly to user's device in real-time.
 */
export const downloadCandidateResume = (candidate: Candidate) => {
  try {
    const doc = generateCandidateResumePdf(candidate);
    const sanitizedName = candidate.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Resume_${sanitizedName}_${candidate.source.toUpperCase()}_${candidate.id.slice(0, 6)}.pdf`;
    doc.save(filename);
    return { success: true, filename };
  } catch (error) {
    console.error('Failed to generate resume PDF:', error);
    return { success: false, error };
  }
};

/**
 * Downloads a bundled ZIP / batch of resumes for selected candidates.
 */
export const downloadBulkResumes = async (candidates: Candidate[]) => {
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    downloadCandidateResume(candidate);
    // Slight delay to prevent browser download throttling
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
};
