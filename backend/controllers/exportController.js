import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import { getAllCandidatesFromStore } from '../services/candidateStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse dates into genuine Excel Date objects to eliminate green warning flags
export function parseDateToExcel(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d;
  
  // Try dd-mmm-yy format (e.g. 18-Sept-26, 21-Sep-26)
  const parts = String(val).trim().split(/[- ]+/);
  if (parts.length === 3) {
    const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
    const day = parseInt(parts[0], 10);
    const m = months[parts[1].toLowerCase()];
    let yr = parseInt(parts[2], 10);
    if (yr < 100) yr += 2000;
    if (!isNaN(day) && m !== undefined && !isNaN(yr)) {
      return new Date(Date.UTC(yr, m, day));
    }
  }
  return null;
}

// Clean role shorthand matching the original tracker template
export function cleanRole(role) {
  if (!role) return '';
  const r = role.trim();
  if (r.includes('Deputy Project Manager') || r === 'DPM') return 'DPM';
  if (r.includes('Executive Assistant') || r === 'EA') return 'EA';
  if (r.includes('Driver')) return 'Driver';
  if (r.includes('Civil Supervisor')) return 'Civil Supervisor';
  if (r.includes('Talent Acquisition') || r === 'Talent') return 'Talent';
  if (r.includes('Sales & Marketing') || r.includes('Sales& Marketing')) return 'Sales& Marketing';
  if (r.includes('Senior Project Manager') || r === 'Project Manager') return 'Project Manager';
  if (r.includes('Purchase Manager')) return 'Purchase Manager';
  if (r.includes('Architect')) return 'Architect';
  return r;
}

// Helper to format date strings for CSV export (DD-MMM-YY)
export function formatTrackerDateStr(dateVal) {
  if (!dateVal) return '';
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) {
    return typeof dateVal === 'string' ? dateVal : '';
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const yr = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${yr}`;
}

// Maps candidate record to the exact 13 columns of the "Candidate Tracker" sheet
export function mapCandidateToTrackerRow(cand, index) {
  const sNo = index + 1;
  const name = cand.name || '';
  const position = cleanRole(cand.jobAppliedFor || cand.department || '');

  // Clean source naming matching template
  let source = 'Naukri';
  const src = (cand.source || '').toLowerCase();
  if (src.includes('referral')) source = 'Referrals';
  else if (src.includes('newspaper')) source = 'Newspaper AD';
  else if (src.includes('apna')) source = 'Apna';
  else if (src.includes('naukri')) source = 'Naukri';
  else if (src.includes('linkedin')) source = 'LinkedIn';
  else if (src.includes('indeed')) source = 'Indeed';

  // CV Received Date
  const cvDateObj = parseDateToExcel(cand.appliedDate || cand.createdAt);

  // Extract interview details
  let r1DateObj = null;
  let r1Status = null;
  let r2DateObj = null;
  let r2Status = null;
  let offerDateObj = null;

  const activities = Array.isArray(cand.activityHistory) ? cand.activityHistory : [];
  
  // Round 1
  const r1Act = activities.find(a => 
    (a.action && a.action.toUpperCase().includes('ROUND 1')) ||
    (a.details && a.details.toUpperCase().includes('ROUND 1'))
  );
  if (r1Act) {
    r1DateObj = parseDateToExcel(r1Act.timestamp);
    if (r1Act.action.toUpperCase().includes('CLEARED')) r1Status = 'Cleared';
    else if (r1Act.action.toUpperCase().includes('REJECTED')) r1Status = 'Rejected';
    else r1Status = 'Pending';
  } else if (cand.status === 'interview_r1') {
    r1DateObj = parseDateToExcel(cand.callingDetails?.nextFollowUpDate || cand.lastUpdatedDate);
    r1Status = 'Pending';
  }

  // Round 2
  const r2Act = activities.find(a => 
    (a.action && a.action.toUpperCase().includes('ROUND 2')) ||
    (a.details && a.details.toUpperCase().includes('ROUND 2'))
  );
  if (r2Act) {
    r2DateObj = parseDateToExcel(r2Act.timestamp);
    if (r2Act.action.toUpperCase().includes('CLEARED')) r2Status = 'Cleared';
    else if (r2Act.action.toUpperCase().includes('REJECTED')) r2Status = 'Rejected';
    else r2Status = 'Pending';
  } else if (cand.status === 'interview_r2') {
    r2DateObj = parseDateToExcel(cand.callingDetails?.nextFollowUpDate || cand.lastUpdatedDate);
    if (!r1Status) r1Status = 'Cleared';
  }

  // Offer / Joined
  const offerAct = activities.find(a => 
    (a.action && (a.action.toUpperCase().includes('OFFER') || a.action.toUpperCase().includes('JOINED')))
  );
  if (offerAct) {
    offerDateObj = parseDateToExcel(offerAct.timestamp);
  }

  // Final Status - Only set when a final decision/offer is reached
  // (In-progress candidates remain null, keeping the sheet clean and matching the template)
  let finalStatus = null;
  const st = (cand.status || '').toLowerCase();
  if (st === 'joined' || st === 'selected' || st === 'hired') {
    finalStatus = 'Selected';
    if (!r1Status) r1Status = 'Cleared';
    if (!r2Status && r2DateObj) r2Status = 'Cleared';
  } else if (st === 'offered') {
    finalStatus = 'R2 Cleared / Offer Pending';
    if (!r1Status) r1Status = 'Cleared';
    if (!r2Status) r2Status = 'Cleared';
  } else if (r2Status === 'Rejected' || (st === 'rejected' && r2DateObj)) {
    finalStatus = 'Rejected';
  }

  // Recruiter - clean display name
  let recruiter = null;
  if (cand.recruiterAssigned) {
    recruiter = cand.recruiterAssigned.replace(/^Dr\s+/i, '').trim();
    if (recruiter.includes('Sharmila')) recruiter = 'Sharmila Yadav';
    else if (recruiter.includes('Rekha')) recruiter = 'Rekha Pareek';
    else if (recruiter.includes('Satyaveer')) recruiter = 'Satyaveer Singh';
  }

  // Remarks - Clean, concise status notes only (never generic seed notes)
  let remarks = null;
  if (st === 'joined') {
    remarks = 'Joined';
  } else if (st === 'offered') {
    remarks = 'Offer released, awaiting joining';
  } else if (cand.notes && !cand.notes.startsWith('Candidate tracked')) {
    remarks = cand.notes;
  }

  return {
    sNo,
    name,
    position,
    source,
    cvDateObj,
    r1DateObj,
    r1Status,
    r2DateObj,
    r2Status,
    finalStatus,
    offerDateObj,
    recruiter,
    remarks
  };
}

// GET /api/candidates/export/excel
export async function exportCandidateTrackerExcel(req, res) {
  try {
    const rawCandidates = await getAllCandidatesFromStore();
    const candidates = [...rawCandidates].sort((a, b) => {
      const numA = parseInt((a.id || '').replace(/\D/g, '')) || 999999;
      const numB = parseInt((b.id || '').replace(/\D/g, '')) || 999999;
      return numA - numB;
    });
    const rows = candidates.map((cand, idx) => mapCandidateToTrackerRow(cand, idx));

    const templatePath = path.resolve(__dirname, '../../Interview Tracker Sheet.xlsx');
    const wb = new ExcelJS.Workbook();

    if (fs.existsSync(templatePath)) {
      await wb.xlsx.readFile(templatePath);
    } else {
      const ws = wb.addWorksheet('Candidate Tracker');
      ws.addRow(['CANDIDATE-WISE INTERVIEW TRACKER']);
      ws.addRow(["One row per candidate. 'Final Status' drives the Dashboard pipeline counts — use the exact dropdown values."]);
      ws.addRow(['S.No', 'Candidate Name', 'Position Applied For', 'Source', 'CV Received Date', 'R1 Interview Date', 'R1 Status', 'R2 Interview Date', 'R2 Status', 'Final Status', 'Offer/Joining Date', 'Recruiter', 'Remarks']);
    }

    const wsD = wb.getWorksheet('Daily Update Log');
    if (wsD) {
      // Strictly protect Daily Update Log numeric metrics from style bleed
      for (let r = 5; r <= 100; r++) {
        const row = wsD.getRow(r);
        for (let c = 3; c <= 14; c++) {
          const cell = row.getCell(c);
          if (typeof cell.value === 'number') {
            cell.numFmt = '0';
          }
        }
      }
    }

    const ws = wb.getWorksheet('Candidate Tracker');

    if (ws) {
      // Set optimized column widths so no text ever gets cut off
      ws.getColumn(1).width = 7;     // S.No
      ws.getColumn(2).width = 25;    // Candidate Name
      ws.getColumn(3).width = 22;    // Position Applied For
      ws.getColumn(4).width = 16;    // Source
      ws.getColumn(5).width = 15;    // CV Received Date
      ws.getColumn(6).width = 15;    // R1 Interview Date
      ws.getColumn(7).width = 13;    // R1 Status
      ws.getColumn(8).width = 15;    // R2 Interview Date
      ws.getColumn(9).width = 13;    // R2 Status
      ws.getColumn(10).width = 25;   // Final Status
      ws.getColumn(11).width = 16;   // Offer/Joining Date
      ws.getColumn(12).width = 18;   // Recruiter
      ws.getColumn(13).width = 30;   // Remarks

      // Clear sharedFormula references across column A to prevent clone errors
      for (let r = 5; r <= 1002; r++) {
        const cell = ws.getCell('A' + r);
        if (cell.sharedFormula) delete cell.sharedFormula;
        if (cell.model?.sharedFormula) delete cell.model.sharedFormula;
      }

      // Populate candidate rows starting from row 5 (preserving row 4 sample row)
      rows.forEach((r, idx) => {
        const rowNum = 5 + idx;
        const row = ws.getRow(rowNum);

        const cvStr = formatTrackerDateStr(r.cvDateObj);
        const r1Str = formatTrackerDateStr(r.r1DateObj);
        const r2Str = formatTrackerDateStr(r.r2DateObj);
        const offStr = formatTrackerDateStr(r.offerDateObj);

        const data = [
          r.sNo,
          r.name,
          r.position,
          r.source,
          cvStr || null,
          r1Str || null,
          r.r1Status || null,
          r2Str || null,
          r.r2Status || null,
          r.finalStatus,
          offStr || null,
          r.recruiter,
          r.remarks
        ];

        data.forEach((val, cIdx) => {
          const colNum = cIdx + 1;
          const cell = row.getCell(colNum);
          cell.value = val;
          cell.font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
          };

          if ([1, 4, 5, 6, 7, 8, 9, 10, 11].includes(colNum)) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          }
        });

        row.height = 20;
        row.commit();
      });

      // Clear any extra rows beyond current candidate count
      const startClear = 5 + rows.length;
      for (let r = startClear; r <= Math.max(startClear + 50, ws.rowCount); r++) {
        const row = ws.getRow(r);
        let hasVal = false;
        for (let c = 1; c <= 13; c++) {
          if (row.getCell(c).value) {
            row.getCell(c).value = null;
            hasVal = true;
          }
        }
        if (hasVal) row.commit();
      }
    }

    const buffer = await wb.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Interview_Tracker_Sheet.xlsx"');
    return res.send(buffer);
  } catch (err) {
    console.error('Error generating Excel tracker sheet:', err);
    res.status(500).json({ error: 'Failed to export Excel tracker sheet', details: err.message });
  }
}

// GET /api/candidates/export/csv
export async function exportCandidateTrackerCSV(req, res) {
  try {
    const rawCandidates = await getAllCandidatesFromStore();
    const candidates = [...rawCandidates].sort((a, b) => {
      const numA = parseInt((a.id || '').replace(/\D/g, '')) || 999999;
      const numB = parseInt((b.id || '').replace(/\D/g, '')) || 999999;
      return numA - numB;
    });
    const rows = candidates.map((cand, idx) => mapCandidateToTrackerRow(cand, idx));

    const csvLines = [
      'CANDIDATE-WISE INTERVIEW TRACKER',
      '"One row per candidate. \'Final Status\' drives the Dashboard pipeline counts — use the exact dropdown values."',
      'S.No,Candidate Name,Position Applied For,Source,CV Received Date,R1 Interview Date,R1 Status,R2 Interview Date,R2 Status,Final Status,Offer/Joining Date,Recruiter,Remarks'
    ];

    rows.forEach((r) => {
      const escape = (val) => {
        if (val === undefined || val === null || val === '') return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      csvLines.push([
        r.sNo,
        escape(r.name),
        escape(r.position),
        escape(r.source),
        escape(formatTrackerDateStr(r.cvDateObj)),
        escape(formatTrackerDateStr(r.r1DateObj)),
        escape(r.r1Status || ''),
        escape(formatTrackerDateStr(r.r2DateObj)),
        escape(r.r2Status || ''),
        escape(r.finalStatus || ''),
        escape(formatTrackerDateStr(r.offerDateObj)),
        escape(r.recruiter || ''),
        escape(r.remarks || '')
      ].join(','));
    });

    const csvContent = '\uFEFF' + csvLines.join('\n'); // UTF-8 BOM

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Candidate_Tracker.csv"');
    return res.send(csvContent);
  } catch (err) {
    console.error('Error generating CSV tracker export:', err);
    res.status(500).json({ error: 'Failed to export CSV tracker', details: err.message });
  }
}
