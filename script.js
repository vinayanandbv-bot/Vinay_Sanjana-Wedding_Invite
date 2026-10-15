/**
 * THE ROYAL WEDDING E-INVITATION - MOBILE-FIRST ENGINE
 * - Touch & Gesture Physics Drag-to-Unroll with PointerCapture
 * - Mobile Tap-to-Open Support on Thread, Tassel, Seal & Prompt
 * - Classical Raag Yaman & Court Romance Ambient Synthesizer
 * - Gold Stardust Particle Canvas
 * - Live Countdown Engine
 * - One-Tap Google Calendar, Apple/Outlook (.ICS), and Copy Address
 */

(function() {
  'use strict';

  // DOM Elements
  const stageContainer = document.getElementById('stage-container');
  const scrollWrapper = document.getElementById('scroll-wrapper');
  const scrollBody = document.getElementById('scroll-body');
  const invitationInner = document.getElementById('invitation-inner');
  const bottomRod = document.getElementById('bottom-rod');
  const sashSeal = document.getElementById('sash-seal');
  const sealTrigger = document.getElementById('seal-trigger');
  const threadAssembly = document.getElementById('thread-assembly');
  const pullThread = document.getElementById('pull-thread');
  const pullInstruction = document.getElementById('pull-instruction');
  const btnRollUp = document.getElementById('btn-roll-up');
  const toastNotice = document.getElementById('toast-notice');

  // Audio Elements
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicText = document.getElementById('music-text');

  // Action Buttons
  const btnCopyAddress = document.getElementById('btn-copy-address');
  const btnAddCalendar = document.getElementById('btn-add-calendar');
  const btnDownloadIcs = document.getElementById('btn-download-ics');

  // Countdown Elements
  const countDays = document.getElementById('count-days');
  const countHours = document.getElementById('count-hours');
  const countMins = document.getElementById('count-mins');
  const countSecs = document.getElementById('count-secs');

  // Drag State
  let isUnrolled = false;
  let isDragging = false;
  let startY = 0;
  let currentDragY = 0;
  let activePointerId = null;
  const DRAG_THRESHOLD = 90; // Optimized for mobile finger drag distance
  const BASE_THREAD_HEIGHT = 80;

  /* ==========================================================================
     1. MOBILE TOUCH & POINTER INTERACTIONS
     ========================================================================== */
  function initPullInteractions() {
    const pullElements = [threadAssembly, sealTrigger, bottomRod, pullInstruction];

    pullElements.forEach(el => {
      if (!el) return;
      el.addEventListener('pointerdown', onPointerDown, { passive: false });
    });

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Direct Tap / Click Fallbacks (Extremely intuitive on mobile)
    if (sealTrigger) {
      sealTrigger.addEventListener('click', (e) => {
        if (!isUnrolled && currentDragY < 15) unrollScroll();
      });
    }

    if (threadAssembly) {
      threadAssembly.addEventListener('click', (e) => {
        if (!isUnrolled && currentDragY < 15) unrollScroll();
      });
    }

    if (pullInstruction) {
      pullInstruction.addEventListener('click', () => {
        if (!isUnrolled) unrollScroll();
      });
    }

    if (btnRollUp) {
      btnRollUp.addEventListener('click', rollupScroll);
    }
  }

  function onPointerDown(e) {
    if (isUnrolled) return;
    isDragging = true;
    startY = e.clientY;
    currentDragY = 0;
    activePointerId = e.pointerId;

    try {
      if (e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }
    } catch (err) {}

    scrollBody.classList.remove('smooth-transition');

    // Wake mobile audio context on first touch gesture
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function onPointerMove(e) {
    if (!isDragging || isUnrolled) return;

    const deltaY = e.clientY - startY;

    if (deltaY > 0) {
      // Prevent mobile page rubber-band scrolling while pulling
      if (e.cancelable) e.preventDefault();

      currentDragY = Math.min(deltaY, 280);
      scrollBody.style.height = `${currentDragY}px`;
      pullThread.style.height = `${BASE_THREAD_HEIGHT + currentDragY * 0.22}px`;

      const sealOpacity = Math.max(0, 1 - (currentDragY / 120));
      sashSeal.style.opacity = sealOpacity;
    }
  }

  function onPointerUp(e) {
    if (!isDragging || isUnrolled) return;
    isDragging = false;

    if (e && e.target && e.target.hasPointerCapture && activePointerId !== null) {
      try {
        if (e.target.hasPointerCapture(activePointerId)) {
          e.target.releasePointerCapture(activePointerId);
        }
      } catch (err) {}
    }
    activePointerId = null;

    if (currentDragY >= DRAG_THRESHOLD) {
      unrollScroll();
    } else {
      // Spring back to closed state
      scrollBody.classList.add('smooth-transition');
      scrollBody.style.height = '0px';
      pullThread.style.height = `${BASE_THREAD_HEIGHT}px`;
      sashSeal.style.opacity = '1';
    }
  }

  function unrollScroll() {
    isUnrolled = true;
    stageContainer.classList.add('unrolled');
    scrollBody.classList.add('smooth-transition');

    const fullHeight = invitationInner.scrollHeight;
    scrollBody.style.height = `${fullHeight}px`;
    pullThread.style.height = `${BASE_THREAD_HEIGHT}px`;

    // Fade out ribbon, seal & prompt
    sashSeal.style.opacity = '0';
    sashSeal.style.transform = 'translate(-50%, -50%) scale(0.65)';
    pullInstruction.style.opacity = '0';
    pullInstruction.style.pointerEvents = 'none';

    playUnrollChime();

    if (!isMusicPlaying) {
      startAmbientMusic();
    }

    showToast('The Royal Invitation is revealed');

    // Set height to auto after unrolling finishes so mobile orientation/resizing works fluidly
    setTimeout(() => {
      if (isUnrolled) {
        scrollBody.style.height = 'auto';
      }
    }, 1300);
  }

  function rollupScroll() {
    isUnrolled = false;

    // Lock to current scrollHeight first
    const currentHeight = invitationInner.scrollHeight;
    scrollBody.style.height = `${currentHeight}px`;
    void scrollBody.offsetHeight;

    scrollBody.classList.add('smooth-transition');
    scrollBody.style.height = '0px';

    sashSeal.style.opacity = '1';
    sashSeal.style.transform = 'translate(-50%, -50%) scale(1)';
    pullInstruction.style.opacity = '1';
    pullInstruction.style.pointerEvents = 'auto';

    setTimeout(() => {
      if (!isUnrolled) {
        stageContainer.classList.remove('unrolled');
      }
    }, 400);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================================
     2. CLASSICAL ROYAL WEDDING MELODY (RAAG YAMAN / KALYAN COURT ROMANCE)
     Web Audio API - Starts on mobile user touch gesture.
     ========================================================================== */
  let audioCtx = null;
  let isMusicPlaying = false;
  let musicIntervalId = null;
  let droneNodes = [];

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUnrollChime() {
    try {
      initAudioContext();
      const notes = [293.66, 369.99, 440.00, 554.37, 587.33, 739.99]; // D4, F#4, A4, C#5, D5, F#5
      const now = audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.09 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + idx * 0.09 + 1.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 1.85);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  function playMelodyNote(freq, startTime, duration = 2.4, velocity = 0.08) {
    if (!audioCtx) return;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.frequency.exponentialRampToValueAtTime(800, startTime + duration);

    gain.gain.setValueAtTime(0.00001, startTime);
    gain.gain.linearRampToValueAtTime(velocity, startTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  function startAmbientMusic() {
    try {
      initAudioContext();
      isMusicPlaying = true;
      musicText.textContent = 'Pause Music';

      startAcousticDrone();

      const B3 = 246.94, D4 = 293.66, E4 = 329.63, Fs4 = 369.99, G4 = 392.00, A4 = 440.00, B4 = 493.88, Cs5 = 554.37, D5 = 587.33;

      const melodyPhrases = [
        [
          { note: B3, dur: 1.6, delay: 0.0 },
          { note: D4, dur: 1.8, delay: 1.4 },
          { note: Fs4, dur: 2.2, delay: 2.8 },
          { note: A4, dur: 2.4, delay: 4.4 },
          { note: B4, dur: 2.6, delay: 6.2 }
        ],
        [
          { note: Fs4, dur: 1.8, delay: 0.0 },
          { note: A4, dur: 1.8, delay: 1.4 },
          { note: Cs5, dur: 2.2, delay: 2.8 },
          { note: D5, dur: 3.2, delay: 4.5 }
        ],
        [
          { note: D5, dur: 1.6, delay: 0.0 },
          { note: Cs5, dur: 1.6, delay: 1.4 },
          { note: B4, dur: 1.8, delay: 2.8 },
          { note: A4, dur: 2.0, delay: 4.2 },
          { note: Fs4, dur: 2.4, delay: 5.8 }
        ],
        [
          { note: B3, dur: 1.8, delay: 0.0 },
          { note: D4, dur: 2.0, delay: 1.5 },
          { note: E4, dur: 2.0, delay: 3.2 },
          { note: D4, dur: 3.6, delay: 4.8 }
        ]
      ];

      let phraseIndex = 0;

      function playNextPhrase() {
        if (!isMusicPlaying) return;
        const now = audioCtx.currentTime;
        const currentPhrase = melodyPhrases[phraseIndex % melodyPhrases.length];

        currentPhrase.forEach(item => {
          playMelodyNote(item.note, now + item.delay, item.dur, 0.075);
        });

        phraseIndex++;
      }

      playNextPhrase();
      musicIntervalId = setInterval(playNextPhrase, 8600);

    } catch (e) {
      console.warn('Ambient music failed to start:', e);
    }
  }

  function startAcousticDrone() {
    stopAcousticDrone();
    try {
      const droneFreqs = [73.42, 110.00, 146.83];
      droneFreqs.forEach(freq => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 3.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        droneNodes.push({ osc, gain });
      });
    } catch (e) {}
  }

  function stopAcousticDrone() {
    droneNodes.forEach(node => {
      try {
        node.gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        setTimeout(() => node.osc.stop(), 900);
      } catch (e) {}
    });
    droneNodes = [];
  }

  function stopAmbientMusic() {
    isMusicPlaying = false;
    if (musicIntervalId) {
      clearInterval(musicIntervalId);
      musicIntervalId = null;
    }
    stopAcousticDrone();
    musicText.textContent = 'Royal Melody';
  }

  musicToggleBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
      stopAmbientMusic();
      showToast('Music paused');
    } else {
      startAmbientMusic();
      showToast('Playing Royal Yaman Melody');
    }
  });

  /* ==========================================================================
     3. UNDERSTATED GOLD STARDUST PARTICLES CANVAS
     ========================================================================== */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 30;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class GoldStardust {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : -15;
      this.size = Math.random() * 2.0 + 0.8;
      this.speedY = Math.random() * 0.4 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.15;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.008) * 0.35 + this.speedX;

      if (this.y > canvas.height + 15) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.fillStyle = `rgba(226, 192, 115, ${this.opacity})`;
      ctx.shadowColor = 'rgba(250, 238, 194, 0.5)';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new GoldStardust());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ==========================================================================
     4. WEDDING COUNTDOWN TIMER (TARGET: NOVEMBER 28, 2026)
     ========================================================================== */
  const targetDate = new Date('2026-11-28T18:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      countDays.textContent = '00';
      countHours.textContent = '00';
      countMins.textContent = '00';
      countSecs.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    countDays.textContent = String(d).padStart(2, '0');
    countHours.textContent = String(h).padStart(2, '0');
    countMins.textContent = String(m).padStart(2, '0');
    countSecs.textContent = String(s).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ==========================================================================
     5. ACTION HANDLERS (MAP, CALENDAR, COPY ADDRESS)
     ========================================================================== */
  btnCopyAddress.addEventListener('click', () => {
    const address = document.getElementById('venue-full-address').textContent;
    navigator.clipboard.writeText(address).then(() => {
      showToast('Venue address copied');
    }).catch(() => {
      showToast(address);
    });
  });

  btnAddCalendar.addEventListener('click', () => {
    const title = encodeURIComponent('The Wedding of Priyanka & Vikram');
    const details = encodeURIComponent('Together with their families, cordially inviting you to celebrate the marriage of Priyanka & Vikram.');
    const location = encodeURIComponent('The Grand Heritage Palace & Royal Gardens, Jaipur, Rajasthan 302001');
    const startTime = '20261128T123000Z';
    const endTime = '20261128T183000Z';

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startTime}/${endTime}`;
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  });

  btnDownloadIcs.addEventListener('click', () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The Royal Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:royal-wedding-2026@heritage',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:20261128T123000Z',
      'DTEND:20261128T183000Z',
      'SUMMARY:The Wedding Ceremony of Priyanka & Vikram',
      'DESCRIPTION:We cordially invite you to join us at The Grand Heritage Palace.',
      'LOCATION:The Grand Heritage Palace, Jaipur, Rajasthan 302001',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Priyanka_and_Vikram_Wedding.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Calendar invitation downloaded');
  });

  /* ==========================================================================
     6. TOAST UTILITY
     ========================================================================== */
  let toastTimer = null;
  function showToast(msg) {
    toastNotice.textContent = msg;
    toastNotice.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 3000);
  }

  // Initialize on page load
  initPullInteractions();

})();
