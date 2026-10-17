/**
 * Sanjana & Vinayanand Wedding Invitation
 * Complete interactive logic replicating Lovable production app
 */

const G = {
  couple: {
    first: 'Sanjana',
    second: 'Vinayanand',
    monogram: 'S & V'
  },
  date: '2026-11-20',
  timeZone: 'Asia/Kolkata',
  utcOffset: '+05:30',
  venue: {
    name: 'Aditya Kalyana Mantapa',
    address: '',
    mapsUrl: '',
    mapsDestination: 'Aditya Kalyana Mantapa'
  },
  ceremony: {
    title: 'Wedding Ceremony',
    startTime: null,
    endTime: null
  },
  reception: {
    title: 'Wedding Reception',
    startTime: '19:00',
    endTime: null
  },
  countdown: {
    targetTime: '00:00',
    provisional: true
  }
};

/* Formatters */
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h = 0, m = 0] = timeStr.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function formatWeddingDate() {
  const parts = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: G.timeZone
  }).formatToParts(new Date(`${G.date}T12:00:00${G.utcOffset}`));

  const get = type => parts.find(p => p.type === type)?.value || '';
  return `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')}`;
}

function getDirectionsUrl() {
  return G.venue.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(G.venue.mapsDestination)}`;
}

/* Calendar Date Formatting Helpers */
const stripDashes = s => s.replaceAll('-', '');
const toIcsDateUtc = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const parseLocalTime = t => new Date(`${G.date}T${t}:00${G.utcOffset}`);

const getNextDayIso = () => {
  const d = new Date(`${G.date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return stripDashes(d.toISOString().slice(0, 10));
};

function buildCalendarEventData(kind) {
  const ev = G[kind];
  const title = `${G.couple.first} & ${G.couple.second} — ${ev.title}`;
  const location = [G.venue.name, G.venue.address].filter(Boolean).join(', ');
  const description = [
    `Join ${G.couple.first} & ${G.couple.second} for their ${ev.title.toLowerCase()}.`,
    ev.startTime ? '' : 'Save the date. Muhurtham time is to be confirmed; this is an all-day date reminder, not the ceremony start time.',
    ev.endTime ? '' : 'End time to be confirmed. No confirmed ending time has been assigned.'
  ].filter(Boolean).join('\n');

  const start = ev.startTime ? toIcsDateUtc(parseLocalTime(ev.startTime)) : stripDashes(G.date);
  const end = ev.endTime
    ? toIcsDateUtc(parseLocalTime(ev.endTime))
    : ev.startTime
    ? toIcsDateUtc(parseLocalTime(ev.startTime))
    : getNextDayIso();

  return {
    title,
    location,
    description,
    start,
    end,
    allDay: !ev.startTime,
    hasEnd: Boolean(ev.endTime)
  };
}

function getGoogleCalendarUrl(kind) {
  const data = buildCalendarEventData(kind);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: data.title,
    dates: `${data.start}/${data.end}`,
    ctz: G.timeZone,
    location: data.location,
    details: data.description
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const escapeIcs = s => s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');

function foldIcsLine(line) {
  const parts = [];
  let cur = '';
  let curLen = 0;
  for (const char of line) {
    const bLen = new TextEncoder().encode(char).length;
    if (curLen + bLen > 75) {
      parts.push(cur);
      cur = ' ';
      curLen = 1;
    }
    cur += char;
    curLen += bLen;
  }
  parts.push(cur);
  return parts.join('\r\n');
}

function generateIcsFileContent(kind) {
  const data = buildCalendarEventData(kind);
  const now = new Date();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sanjana and Vinayanand//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${G.date}-${kind}@sanjana-vinayanand.wedding`,
    `DTSTAMP:${toIcsDateUtc(now)}`,
    `SUMMARY:${escapeIcs(data.title)}`,
    `LOCATION:${escapeIcs(data.location)}`,
    `DESCRIPTION:${escapeIcs(data.description)}`
  ];

  if (data.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${data.start}`);
    lines.push(`DTEND;VALUE=DATE:${data.end}`);
  } else {
    lines.push(`DTSTART:${data.start}`);
    if (data.hasEnd) lines.push(`DTEND:${data.end}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

function downloadIcs(kind) {
  const content = generateIcsFileContent(kind);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${kind}-${G.date}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Countdown Logic */
function getTargetCountdownTime() {
  return new Date(`${G.date}T${G.countdown.targetTime}:00${G.utcOffset}`).getTime();
}

function updateCountdown() {
  const targetTime = getTargetCountdownTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((targetTime - now) / 1000));

  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (daysEl && hoursEl && minutesEl && secondsEl) {
    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }
}

/* Main Initialization */
document.addEventListener('DOMContentLoaded', () => {
  const openingScene = document.getElementById('opening-scene');
  const revealedInvitation = document.getElementById('revealed-invitation');
  const waxSealBtn = document.getElementById('wax-seal-btn');
  const tapToOpen = document.getElementById('tap-to-open');
  const envelopeStage = document.querySelector('.envelope-stage');
  const envelopeFlap = document.querySelector('.envelope-flap');
  const backToEnvelopeBtn = document.getElementById('back-to-envelope-btn');
  const shareBtn = document.getElementById('share-invitation-btn');
  const shareStatus = document.getElementById('share-status');
  const shareFallbackInput = document.getElementById('share-fallback-input');

  // Calendar elements
  const ceremonyCalBtn = document.getElementById('ceremony-calendar-btn');
  const ceremonyCalMenu = document.getElementById('ceremony-calendar-menu');
  const ceremonyGcal = document.getElementById('ceremony-gcal-link');
  const ceremonyIcs = document.getElementById('ceremony-ics-btn');

  const receptionCalBtn = document.getElementById('reception-calendar-btn');
  const receptionCalMenu = document.getElementById('reception-calendar-menu');
  const receptionGcal = document.getElementById('reception-gcal-link');
  const receptionIcs = document.getElementById('reception-ics-btn');

  // Set Google Calendar links
  if (ceremonyGcal) ceremonyGcal.href = getGoogleCalendarUrl('ceremony');
  if (receptionGcal) receptionGcal.href = getGoogleCalendarUrl('reception');

  // Set Directions link
  const getDirectionsLink = document.getElementById('get-directions-link');
  if (getDirectionsLink) getDirectionsLink.href = getDirectionsUrl();

  // Populate dynamic times & dates
  const ceremonyTimeText = document.getElementById('ceremony-time-text');
  if (ceremonyTimeText) {
    ceremonyTimeText.textContent = G.ceremony.startTime
      ? `Muhurtham · ${formatTime(G.ceremony.startTime)} IST`
      : 'Muhurtham time to be confirmed';
  }

  const receptionTimeText = document.getElementById('reception-time-text');
  if (receptionTimeText) {
    receptionTimeText.textContent = G.reception.startTime
      ? `${formatTime(G.reception.startTime)} onwards`
      : 'Reception time to be confirmed';
  }

  const displayWeddingDate = document.getElementById('display-wedding-date');
  if (displayWeddingDate) {
    displayWeddingDate.textContent = formatWeddingDate();
  }

  // Open Invitation Handler
  let isOpening = false;
  let openTimer = null;

  function openInvitation() {
    if (isOpening) return;
    isOpening = true;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      openingScene.classList.add('hidden');
      revealedInvitation.classList.remove('hidden');
      window.scrollTo({ top: 0 });
      return;
    }

    openingScene.classList.add('is-opening');
    openingScene.setAttribute('aria-busy', 'true');
    waxSealBtn.disabled = true;

    openTimer = setTimeout(() => {
      openingScene.classList.add('hidden');
      openingScene.classList.remove('is-opening');
      openingScene.setAttribute('aria-busy', 'false');
      revealedInvitation.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Clear any text cursor focus so no caret is visible
      const title = document.getElementById('invitation-title');
      if (title && document.activeElement === title) {
        title.blur();
      }
      isOpening = false;
    }, 2650);
  }

  waxSealBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openInvitation();
  });
  tapToOpen?.addEventListener('click', (e) => {
    e.stopPropagation();
    openInvitation();
  });
  envelopeStage?.addEventListener('click', () => {
    openInvitation();
  });

  // Back to Envelope Handler
  backToEnvelopeBtn?.addEventListener('click', () => {
    if (openTimer) clearTimeout(openTimer);
    isOpening = false;
    revealedInvitation.classList.add('hidden');
    openingScene.classList.remove('hidden');
    openingScene.classList.remove('is-opening');
    waxSealBtn.disabled = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => {
      waxSealBtn.focus();
      // Remove outline/caret immediately after focus
      setTimeout(() => {
        if (document.activeElement === waxSealBtn) {
          waxSealBtn.blur();
        }
      }, 100);
    });
  });

  // Calendar Dropdowns
  function toggleMenu(menu, button) {
    const isClosed = menu.classList.contains('hidden');
    ceremonyCalMenu?.classList.add('hidden');
    receptionCalMenu?.classList.add('hidden');
    if (isClosed) {
      menu.classList.remove('hidden');
    }
  }

  ceremonyCalBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(ceremonyCalMenu, ceremonyCalBtn);
  });

  receptionCalBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(receptionCalMenu, receptionCalBtn);
  });

  // Close menus on outside click or Escape
  document.addEventListener('click', (e) => {
    if (!ceremonyCalMenu?.contains(e.target) && e.target !== ceremonyCalBtn) {
      ceremonyCalMenu?.classList.add('hidden');
    }
    if (!receptionCalMenu?.contains(e.target) && e.target !== receptionCalBtn) {
      receptionCalMenu?.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ceremonyCalMenu?.classList.add('hidden');
      receptionCalMenu?.classList.add('hidden');
    }
  });

  // ICS Download triggers
  ceremonyIcs?.addEventListener('click', () => {
    downloadIcs('ceremony');
    ceremonyCalMenu?.classList.add('hidden');
  });

  receptionIcs?.addEventListener('click', () => {
    downloadIcs('reception');
    receptionCalMenu?.classList.add('hidden');
  });

  // Share Handler
  shareBtn?.addEventListener('click', async () => {
    const shareBtnText = document.getElementById('share-btn-text');
    if (shareBtnText) shareBtnText.textContent = 'Sharing…';
    shareBtn.disabled = true;
    shareStatus.textContent = '';
    shareFallbackInput.classList.add('hidden');

    const shareUrl = window.location.href;
    const shareData = {
      title: `${G.couple.first} & ${G.couple.second} — Wedding Invitation`,
      text: 'A special invitation awaits. Join us as we begin our new chapter together.',
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        shareStatus.textContent = 'Invitation link copied.';
      }
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          shareStatus.textContent = 'Invitation link copied.';
        } catch {
          shareFallbackInput.value = shareUrl;
          shareFallbackInput.classList.remove('hidden');
          shareFallbackInput.focus();
          shareFallbackInput.select();
          shareStatus.textContent = 'Select and copy the invitation link below.';
        }
      }
    } finally {
      if (shareBtnText) shareBtnText.textContent = 'Share Invitation';
      shareBtn.disabled = false;
    }
  });

  // Start live countdown
  updateCountdown();
  setInterval(updateCountdown, 1000);
});
