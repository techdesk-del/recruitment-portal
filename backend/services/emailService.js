import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';
import { generateIcsInvite, generateGoogleCalendarUrl } from './calendarService.js';
import { getDefaultZoomMeetingLink } from './whatsappService.js';

let cachedTransporter = null;
let etherealAccount = null;

/**
 * Initializes or retrieves the Nodemailer transporter.
 * Supports custom SMTP, Gmail, Brevo, or free Ethereal test inbox.
 */
export async function getEmailTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const smtpUser = ENV.SMTP_USER || ENV.LINKEDIN_SYNC_EMAIL;
  const smtpPass = ENV.SMTP_PASS || ENV.LINKEDIN_SYNC_PASSWORD;

  if (smtpUser && smtpPass) {
    if (ENV.SMTP_HOST && !ENV.SMTP_HOST.includes('gmail')) {
      console.log(`📧 [Email] Using configured custom SMTP: ${ENV.SMTP_HOST}:${ENV.SMTP_PORT}`);
      cachedTransporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_PORT === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    } else {
      console.log(`📧 [Email] Using direct Gmail SMTP service for: ${smtpUser}`);
      cachedTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    }
    return cachedTransporter;
  }

  // Fallback: Create ephemeral free Ethereal test account
  try {
    console.log('📧 [Email] No external SMTP credentials detected. Initializing Ethereal test inbox...');
    etherealAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: etherealAccount.smtp.host,
      port: etherealAccount.smtp.port,
      secure: etherealAccount.smtp.secure,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass
      }
    });
    console.log(`✅ [Email] Ethereal test account active: ${etherealAccount.user}`);
    return cachedTransporter;
  } catch (err) {
    console.warn('⚠️ [Email] Ethereal initialization failed, falling back to simulated transport:', err.message);
    cachedTransporter = {
      sendMail: async (mailOptions) => {
        console.log(`📨 [Simulated Email] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
        return {
          messageId: `sim-${Date.now()}@urbangaon.com`,
          previewUrl: `https://mailpreview.urbangaon.com/preview/${Date.now()}`
        };
      }
    };
    return cachedTransporter;
  }
}

/**
 * HTML Template Helper: Base UrbanGaon Brand Wrapper
 */
function wrapEmailTemplate(contentHtml, preheaderText = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UrbanGaon Careers</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #bfdbfe; font-weight: 500; }
    .content { padding: 32px 28px; }
    .card { background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; margin-top: 12px; text-align: center; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; }
    .badge { display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 8px; }
  </style>
</head>
<body>
  <span style="display:none;font-size:1px;color:#fff;max-height:0;">${preheaderText}</span>
  <div class="container">
    <div class="header">
      <div style="font-size: 28px; margin-bottom: 6px;">🏡</div>
      <h1>UrbanGaon Careers</h1>
      <p>Talent Acquisition & Recruitment Portal</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;"><strong>UrbanGaon Technologies Pvt. Ltd.</strong></p>
      <p style="margin: 0 0 6px;">Jaipur, Rajasthan, India • <a href="https://urbangaon.com" style="color: #2563eb; text-decoration: none;">urbangaon.com</a></p>
      <p style="margin: 0; color: #94a3b8; font-size: 11px;">This is an automated recruitment communication. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Send Interview Invitation with Google Meet & .ics Calendar Invite
 */
export async function sendInterviewInviteEmail({ candidate, interview, customNotes = '' }) {
  const transporter = await getEmailTransporter();

  const recipientEmail = candidate.email;
  const candidateName = candidate.name || 'Candidate';
  const jobTitle = interview.jobTitle || candidate.jobAppliedFor || 'Specialist Role';
  const round = interview.round || 'Round 1: Technical Discussion';
  const dateStr = interview.date || 'To be announced';
  const startTime = interview.startTime || '10:00 AM';
  const endTime = interview.endTime || '11:00 AM';
  const meetingLink = (interview.meetingLink && !interview.meetingLink.includes('urb-interview'))
    ? interview.meetingLink
    : getDefaultZoomMeetingLink();
  const interviewer = interview.interviewerName || 'Dr Sharmila Yadav (Lead Recruiter)';

  const googleCalLink = generateGoogleCalendarUrl({
    title: `UrbanGaon Interview: ${round} - ${candidateName}`,
    description: `Interview for ${jobTitle} with ${interviewer}.\nZoom Meeting Link: ${meetingLink}`,
    location: meetingLink,
    date: dateStr,
    startTime,
    endTime
  });

  // Generate .ics attachment
  const icsContent = generateIcsInvite({
    uid: `${interview.id || Date.now()}@urbangaon.com`,
    title: `UrbanGaon Interview: ${round} - ${candidateName}`,
    description: `Interview for ${jobTitle} with ${interviewer}.\nZoom Meeting Link: ${meetingLink}\n\nCandidate: ${candidateName} (${candidate.phone || ''})`,
    location: meetingLink,
    date: dateStr,
    startTime,
    endTime,
    attendeeName: candidateName,
    attendeeEmail: recipientEmail,
    organizerName: 'UrbanGaon Talent Team',
    organizerEmail: 'careers@urbangaon.com'
  });

  const bodyHtml = `
    <span class="badge" style="background: #e0f2fe; color: #0284c7; font-weight: 700; padding: 4px 10px; border-radius: 6px; font-size: 11px; text-transform: uppercase;">Zoom Video Interview</span>
    <h2 style="margin: 6px 0 16px; font-size: 20px; color: #0f172a;">Interview Scheduled: ${round}</h2>
    <p>Dear <strong>${candidateName}</strong>,</p>
    <p>Thank you for your interest in joining <strong>UrbanGaon</strong>. We were thoroughly impressed by your profile for the <strong>${jobTitle}</strong> opening, and we are excited to invite you to the next round of discussions.</p>
    
    <div class="card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 16px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 130px;"><strong>Position:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${jobTitle}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Round:</strong></td>
          <td style="padding: 6px 0; color: #0b5cff; font-weight: 700;">${round}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Date:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">📅 ${dateStr}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Time:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">⏰ ${startTime} - ${endTime} (IST)</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Interviewer:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">👨‍💼 ${interviewer}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Platform:</strong></td>
          <td style="padding: 6px 0; color: #0b5cff; font-weight: 700;">🎥 Zoom Meetings</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${meetingLink}" target="_blank" style="display: inline-block; background-color: #0b5cff; color: #ffffff !important; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; margin: 6px; box-shadow: 0 4px 12px rgba(11, 92, 255, 0.3);">
          🚀 Join Zoom Meeting
        </a>
        <a href="${googleCalLink}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff !important; padding: 14px 24px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; margin: 6px;">
          📅 Add to Calendar
        </a>
      </div>
      <p style="font-size: 12px; text-align: center; color: #64748b; margin-top: 14px;">Zoom Direct Link: <a href="${meetingLink}" target="_blank" style="color: #0b5cff; word-break: break-all; font-weight: 600;">${meetingLink}</a></p>
    </div>

    ${customNotes ? `<p style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; font-size: 13px; color: #92400e;"><strong>Recruiter Note:</strong> ${customNotes}</p>` : ''}

    <h4 style="margin: 20px 0 8px; font-size: 14px; color: #334155;">Quick Tips for Your Discussion:</h4>
    <ul style="font-size: 13px; color: #475569; padding-left: 20px; line-height: 1.6;">
      <li>Please install Zoom or join directly through your browser 5 minutes prior to test audio and camera.</li>
      <li>Have your resume and work portfolio handy for discussion.</li>
      <li>A calendar invitation (<code>.ics</code>) is attached to this email. Click "Add to Calendar" to sync it automatically.</li>
    </ul>

    <p style="margin-top: 24px; font-size: 14px;">We look forward to speaking with you!<br>Warm regards,<br><strong>UrbanGaon Talent Acquisition Team</strong></p>
  `;

  const fullHtml = wrapEmailTemplate(bodyHtml, `UrbanGaon Interview Scheduled: ${round} on ${dateStr}`);

  const mailOptions = {
    from: ENV.SMTP_FROM,
    to: recipientEmail,
    subject: `Interview Invitation: ${round} - ${jobTitle} | UrbanGaon`,
    html: fullHtml,
    icalEvent: {
      filename: 'interview-invitation.ics',
      method: 'request',
      content: icsContent
    }
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

  return {
    success: true,
    messageId: info.messageId,
    previewUrl: previewUrl || (info.previewUrl || null),
    recipient: recipientEmail,
    subject: mailOptions.subject
  };
}

/**
 * 2. Send Candidate Status Update (Shortlisted, Screening, Next Round, Offer)
 */
export async function sendCandidateStatusEmail({ candidate, status, details = '' }) {
  const transporter = await getEmailTransporter();
  const candidateName = candidate.name || 'Candidate';
  const jobTitle = candidate.jobAppliedFor || 'Open Position';

  let statusTitle = `Application Status Update: ${status.toUpperCase()}`;
  let statusBadgeColor = '#2563eb';
  let messageContent = '';

  switch (status) {
    case 'shortlisted':
      statusTitle = 'Congratulations! Your profile has been Shortlisted';
      statusBadgeColor = '#16a34a';
      messageContent = `
        <p>We are delighted to share that your application for <strong>${jobTitle}</strong> has been <strong>shortlisted</strong> by our hiring panel!</p>
        <p>Our recruitment team is currently reviewing schedule availability and will reach out shortly with details for your first-round technical discussion.</p>
      `;
      break;
    case 'offer':
      statusTitle = '🎉 Offer of Employment - Welcome to UrbanGaon!';
      statusBadgeColor = '#9333ea';
      messageContent = `
        <p>Congratulations! Following your outstanding interviews, we are thrilled to extend an <strong>Offer of Employment</strong> for the role of <strong>${jobTitle}</strong> at UrbanGaon.</p>
        <p>Our HR Leadership team will send across your formal Offer Letter along with compensation structure and joining formalities shortly.</p>
      `;
      break;
    case 'hired':
      statusTitle = 'Official Welcome to UrbanGaon';
      statusBadgeColor = '#059669';
      messageContent = `
        <p>Welcome to the UrbanGaon family! All your onboarding documents have been verified.</p>
      `;
      break;
    default:
      messageContent = `
        <p>We wanted to give you an update regarding your application for the <strong>${jobTitle}</strong> role. Your status has transitioned to <strong>${status.toUpperCase()}</strong>.</p>
        ${details ? `<p><em>${details}</em></p>` : ''}
      `;
  }

  const bodyHtml = `
    <span class="badge" style="background-color: ${statusBadgeColor}20; color: ${statusBadgeColor};">${status.toUpperCase()}</span>
    <h2 style="margin: 4px 0 16px; font-size: 20px; color: #0f172a;">${statusTitle}</h2>
    <p>Dear <strong>${candidateName}</strong>,</p>
    ${messageContent}
    <p style="margin-top: 24px; font-size: 14px;">If you have any questions, feel free to write to us.<br>Best regards,<br><strong>UrbanGaon Careers Team</strong></p>
  `;

  const mailOptions = {
    from: ENV.SMTP_FROM,
    to: candidate.email,
    subject: `Update regarding your application for ${jobTitle} | UrbanGaon`,
    html: wrapEmailTemplate(bodyHtml, statusTitle)
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

  return {
    success: true,
    messageId: info.messageId,
    previewUrl: previewUrl || (info.previewUrl || null),
    recipient: candidate.email,
    subject: mailOptions.subject
  };
}

/**
 * 3. Send Polite Rejection & Future Talent Pool Email
 */
export async function sendRejectionEmail({ candidate, feedback = '' }) {
  const transporter = await getEmailTransporter();
  const candidateName = candidate.name || 'Candidate';
  const jobTitle = candidate.jobAppliedFor || 'Open Position';

  const bodyHtml = `
    <span class="badge" style="background-color: #fee2e2; color: #b91c1c;">Application Status</span>
    <h2 style="margin: 4px 0 16px; font-size: 20px; color: #0f172a;">Application Update: ${jobTitle}</h2>
    <p>Dear <strong>${candidateName}</strong>,</p>
    <p>Thank you very much for your time and interest in exploring opportunities with <strong>UrbanGaon</strong> for the <strong>${jobTitle}</strong> opening.</p>
    <p>We received an overwhelming number of strong applications for this position. While we were thoroughly impressed by your background and achievements, we have chosen to proceed with another candidate whose specific skill set aligns even closer with the immediate requirements of this particular project.</p>
    
    ${feedback ? `<div class="card" style="border-left: 4px solid #64748b;"><p style="margin: 0; font-size: 13px; color: #334155;"><strong>Recruiter Feedback:</strong> ${feedback}</p></div>` : ''}

    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <h4 style="margin: 0 0 6px; font-size: 13px; color: #1e293b;">Priority Talent Network</h4>
      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">We have retained your resume in our active candidate database. As our engineering and business operations expand, we will proactively reach out if a matching position opens up that fits your expertise.</p>
    </div>

    <p style="margin-top: 24px; font-size: 14px;">We wish you every success in your ongoing career journey.<br>Warm regards,<br><strong>UrbanGaon Talent Acquisition Team</strong></p>
  `;

  const mailOptions = {
    from: ENV.SMTP_FROM,
    to: candidate.email,
    subject: `Application Update: ${jobTitle} | UrbanGaon`,
    html: wrapEmailTemplate(bodyHtml, `Application update for ${jobTitle} at UrbanGaon`)
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

  return {
    success: true,
    messageId: info.messageId,
    previewUrl: previewUrl || (info.previewUrl || null),
    recipient: candidate.email,
    subject: mailOptions.subject
  };
}
