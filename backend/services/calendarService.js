/**
 * Calendar Service (RFC 5545 iCalendar / .ics Generator)
 * Produces valid .ics files for Google Meet, Zoom, and Teams interview invites.
 */

function formatIcsDate(dateStr, timeStr) {
  // Expected dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm' or 'HH:mm:ss'
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = (timeStr || '10:00').split(':').map(Number);
    
    // Construct local date and convert to UTC
    const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
    return dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch (e) {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}

/**
 * Generates RFC 5545 compliant iCalendar string
 */
export function generateIcsInvite({
  uid,
  title,
  description,
  location,
  date,
  startTime,
  endTime,
  organizerName = 'UrbanGaon Talent Team',
  organizerEmail = 'careers@urbangaon.com',
  attendeeName,
  attendeeEmail
}) {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtStart = formatIcsDate(date, startTime);
  const dtEnd = formatIcsDate(date, endTime || (startTime ? `${parseInt(startTime.split(':')[0], 10) + 1}:${startTime.split(':')[1]}` : '11:00'));
  const safeUid = uid || `interview-${Date.now()}@urbangaon.com`;

  // Escape special characters for iCalendar format
  const safeTitle = (title || 'Interview with UrbanGaon').replace(/[,;\\]/g, '\\$&');
  const safeDesc = (description || 'UrbanGaon Candidate Interview').replace(/\n/g, '\\n').replace(/[,;\\]/g, '\\$&');
  const safeLocation = (location || 'Google Meet').replace(/[,;\\]/g, '\\$&');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UrbanGaon//Recruitment Dashboard Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${safeUid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${safeTitle}`,
    `DESCRIPTION:${safeDesc}`,
    `LOCATION:${safeLocation}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    `ORGANIZER;CN="${organizerName}":mailto:${organizerEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${attendeeName || 'Candidate'}":mailto:${attendeeEmail}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: UrbanGaon Interview starts in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return lines.join('\r\n');
}
