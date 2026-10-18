/**
 * Vinayanad B V & Sanjana P Wedding Invitation
 * Complete interactive logic replicating Lovable production app
 */

const G = {
  couple: {
    first: 'Vinayanad B V',
    second: 'Sanjana P',
    monogram: 'V & S'
  },
  parents: 'Smt. Vidya D S and Dr. J B Venkatesh Prasad',
  date: '2026-11-20',
  timeZone: 'Asia/Kolkata',
  utcOffset: '+05:30',
  venue: {
    name: 'Aditya Kalyana Mantapa',
    address: 'Ittmadu, Bengaluru',
    mapsUrl: '',
    mapsDestination: 'Aditya Kalyana Mantapa, Ittmadu, Bengaluru'
  },
  ceremony: {
    title: 'Muhurtam',
    startTime: '08:40',
    endTime: '09:04'
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
    `${G.parents} warmly welcome you to the wedding of their elder son ${G.couple.first} with ${G.couple.second} for their ${ev.title.toLowerCase()}.`,
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
    'PRODID:-//Vinayanad and Sanjana//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${G.date}-${kind}@vinayanad-sanjana.wedding`,
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

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  // Strict stop at 0 - countdown will never go negative or lower
  if (now >= targetTime) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    return;
  }

  const diffSec = Math.max(0, Math.floor((targetTime - now) / 1000));
  const days = Math.max(0, Math.floor(diffSec / 86400));
  const hours = Math.max(0, Math.floor((diffSec % 86400) / 3600));
  const minutes = Math.max(0, Math.floor((diffSec % 3600) / 60));
  const seconds = Math.max(0, diffSec % 60);

  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  secondsEl.textContent = String(seconds).padStart(2, '0');
}

/* Main Initialization */
document.addEventListener('DOMContentLoaded', () => {
  const openingScene = document.getElementById('opening-scene');
  const revealedInvitation = document.getElementById('revealed-invitation');
  const waxSealBtn = document.getElementById('wax-seal-btn');
  const tapToOpen = document.getElementById('tap-to-open');
  const envelopeStage = document.querySelector('.envelope-stage');
  const backToEnvelopeBtn = document.getElementById('back-to-envelope-btn');
  const shareBtn = document.getElementById('share-invitation-btn');
  const shareStatus = document.getElementById('share-status');
  const shareFallbackInput = document.getElementById('share-fallback-input');

  // Set Directions link
  const getDirectionsLink = document.getElementById('get-directions-link');
  if (getDirectionsLink) getDirectionsLink.href = getDirectionsUrl();

  // Populate dynamic times & dates
  const ceremonyTimeText = document.getElementById('ceremony-time-text');
  if (ceremonyTimeText) {
    ceremonyTimeText.textContent = '8:40 AM to 9:04 AM';
  }

  const receptionTimeText = document.getElementById('reception-time-text');
  if (receptionTimeText) {
    receptionTimeText.textContent = G.reception.startTime
      ? `${formatTime(G.reception.startTime)} onwards`
      : '7:00 PM onwards';
  }

  const displayVenueAddress = document.getElementById('display-venue-address');
  if (displayVenueAddress && G.venue.address) {
    displayVenueAddress.textContent = G.venue.address;
    displayVenueAddress.classList.remove('hidden');
  }

  const displayWeddingDate = document.getElementById('display-wedding-date');
  if (displayWeddingDate) {
    displayWeddingDate.textContent = formatWeddingDate();
  }

  // Open Invitation Handler
  let isOpening = false;
  let openTimer = null;

  function openInvitation() {
    tryPlayAudio();
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
      setTimeout(() => {
        if (document.activeElement === waxSealBtn) {
          waxSealBtn.blur();
        }
      }, 100);
    });
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
      text: `${G.parents} warmly welcome you to the wedding of their elder son ${G.couple.first} with ${G.couple.second}.`,
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

  // Background Wedding Music Manager: Seetha Kalyanam
  // Robust cross-platform handling for Android Chrome, iOS Safari & Desktop
  const bgMusic = document.getElementById('wedding-music');
  let playCount = 0;
  const MAX_PLAYS = 1;
  let isAudioUnlocked = false;

  const unlockEvents = ['click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'keydown'];

  function removeUnlockListeners() {
    if (isAudioUnlocked) return;
    isAudioUnlocked = true;
    unlockEvents.forEach(evt => {
      window.removeEventListener(evt, handleUserGestureUnlock, true);
      document.removeEventListener(evt, handleUserGestureUnlock, true);
    });
  }

  function tryPlayAudio() {
    if (!bgMusic || playCount >= MAX_PLAYS) return;

    // Ensure audio element is primed and buffered (critical for Android Chrome over cellular/data-saver)
    if (bgMusic.readyState === 0) {
      try { bgMusic.load(); } catch (e) {}
    }

    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Audio playback successfully started! Now safe to remove gesture listeners
        removeUnlockListeners();
      }).catch(() => {
        // Autoplay blocked by browser policy; DO NOT remove listeners so subsequent taps retry!
      });
    }
  }

  function handleUserGestureUnlock() {
    tryPlayAudio();
  }

  // 1. Attempt play immediately when script initializes
  tryPlayAudio();

  // 2. Attempt play on window load
  window.addEventListener('load', tryPlayAudio);

  // 3. Capture-phase user interaction handlers (retries until playback succeeds)
  unlockEvents.forEach(evt => {
    window.addEventListener(evt, handleUserGestureUnlock, { capture: true, passive: true });
    document.addEventListener(evt, handleUserGestureUnlock, { capture: true, passive: true });
  });

  // 4. Stop after playing once
  bgMusic?.addEventListener('ended', () => {
    playCount++;
    if (playCount < MAX_PLAYS) {
      bgMusic.currentTime = 0;
      bgMusic.play().catch(() => {});
    } else {
      bgMusic.pause();
    }
  });

  // 5. Stop music when browser is minimized, screen locked, app switched, or user goes to home screen on phone
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && bgMusic && !bgMusic.paused) {
      bgMusic.pause();
    }
  });

  window.addEventListener('pagehide', () => {
    if (bgMusic && !bgMusic.paused) {
      bgMusic.pause();
    }
  });
});
