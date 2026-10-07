/**
 * Calendar Service (RFC 5545 iCalendar / .ics Generator)
 * Produces valid .ics files for Google Meet, Zoom, and Teams interview invites.
 */

export function parseTimeHoursMinutes(timeStr) {
  if (!timeStr) return { hours: 10, minutes: 0 };
  const clean = String(timeStr).trim();
  const match12 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = (match12[3] || '').toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  }
  return { hours: 10, minutes: 0 };
}

export function formatIcsDate(dateStr, timeStr) {
  try {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();
    if (dateStr && dateStr.includes('-')) {
      const parts = dateStr.split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        [year, month, day] = parts;
      }
    }
    const { hours, minutes } = parseTimeHoursMinutes(timeStr);
    const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
    return dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch (e) {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}

/**
 * Generates direct 1-click Google Calendar Event URL
 */
export function generateGoogleCalendarUrl({
  title,
  description,
  location,
  date,
  startTime,
  endTime
}) {
  const dtStart = formatIcsDate(date, startTime);
  const dtEnd = formatIcsDate(date, endTime || (startTime ? `${parseTimeHoursMinutes(startTime).hours + 1}:00` : '11:00'));
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'UrbanGaon Candidate Interview',
    dates: `${dtStart}/${dtEnd}`,
    details: description || '',
    location: location || 'https://meet.google.com'
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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
  const dtEnd = formatIcsDate(date, endTime || (startTime ? `${parseTimeHoursMinutes(startTime).hours + 1}:00` : '11:00'));
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
