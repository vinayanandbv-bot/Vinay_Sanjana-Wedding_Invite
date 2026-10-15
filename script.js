/**
 * THE ROYAL WEDDING E-INVITATION - WHITE & GOLD MASTER ENGINE
 * - Realistic 3D Scroll Unrolling Physics (Cylinder Roll & Dowel Rotation)
 * - Luminous Gold Leaf Sheen Sweep Animation
 * - Classical Raag Yaman & Court Romance Ambient Synthesizer
 * - Sunlit 24K Gold Flake Particle Canvas
 * - Real-Time Wedding Countdown Engine
 * - Google Calendar, Apple/Outlook (.ICS), and Address Copy
 */

(function() {
  'use strict';

  // DOM Elements
  const stageContainer = document.getElementById('stage-container');
  const scrollWrapper = document.getElementById('scroll-wrapper');
  const scrollBody = document.getElementById('scroll-body');
  const invitationInner = document.getElementById('invitation-inner');
  const closedCylinder = document.getElementById('closed-cylinder');
  const bottomRod = document.getElementById('bottom-rod');
  const sashSeal = document.getElementById('sash-seal');
  const sealTrigger = document.getElementById('seal-trigger');
  const threadAssembly = document.getElementById('thread-assembly');
  const pullThread = document.getElementById('pull-thread');
  const pullInstruction = document.getElementById('pull-instruction');
  const btnRollUp = document.getElementById('btn-roll-up');
  const goldSheen = document.getElementById('gold-sheen');
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

  // Physics & Drag State
  let isUnrolled = false;
  let isDragging = false;
  let startY = 0;
  let currentDragY = 0;
  let activePointerId = null;
  const DRAG_THRESHOLD = 85;
  const BASE_THREAD_HEIGHT = 85;

  /* ==========================================================================
     1. REALISTIC 3D SCROLL PULL & UNROLL PHYSICS
     ========================================================================== */
  function initPullInteractions() {
    const pullTargets = [threadAssembly, sealTrigger, bottomRod, pullInstruction];

    pullTargets.forEach(el => {
      if (!el) return;
      el.addEventListener('pointerdown', onPointerDown, { passive: false });
    });

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    if (sealTrigger) {
      sealTrigger.addEventListener('click', () => {
        if (!isUnrolled && currentDragY < 15) unrollScroll();
      });
    }

    if (threadAssembly) {
      threadAssembly.addEventListener('click', () => {
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
      if (e.cancelable) e.preventDefault();

      currentDragY = Math.min(deltaY, 260);

      // Unroll parchment & rotate the bottom cylinder rod in 3D
      scrollBody.style.height = `${currentDragY}px`;
      bottomRod.style.transform = `rotateX(${currentDragY * 1.5}deg)`;
      pullThread.style.height = `${BASE_THREAD_HEIGHT + currentDragY * 0.22}px`;

      // Fade out closed paper cylinder
      const cylOpacity = Math.max(0, 1 - (currentDragY / 100));
      closedCylinder.style.opacity = cylOpacity;
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
      // Spring back to closed state with dampening
      scrollBody.classList.add('smooth-transition');
      scrollBody.style.height = '0px';
      bottomRod.style.transform = 'rotateX(0deg)';
      pullThread.style.height = `${BASE_THREAD_HEIGHT}px`;
      closedCylinder.style.opacity = '1';
    }
  }

  function unrollScroll() {
    isUnrolled = true;
    stageContainer.classList.add('unrolled');
    scrollBody.classList.add('smooth-transition');

    const fullHeight = invitationInner.scrollHeight;
    scrollBody.style.height = `${fullHeight}px`;
    bottomRod.style.transform = 'rotateX(0deg)';
    pullThread.style.height = `${BASE_THREAD_HEIGHT}px`;

    // Hide closed cylinder and prompt
    closedCylinder.classList.add('hidden');
    pullInstruction.style.opacity = '0';
    pullInstruction.style.pointerEvents = 'none';

    // Play auspicious chime and start background court music
    playUnrollChime();

    if (!isMusicPlaying) {
      startAmbientMusic();
    }

    // Trigger gold foil sheen sweep across the unrolled card
    setTimeout(() => {
      if (goldSheen) {
        goldSheen.classList.remove('sweep-active');
        void goldSheen.offsetWidth; // Reflow
        goldSheen.classList.add('sweep-active');
      }
    }, 400);

    showToast('The Royal Wedding Invitation is revealed');

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

    closedCylinder.classList.remove('hidden');
    closedCylinder.style.opacity = '1';
    pullInstruction.style.opacity = '1';
    pullInstruction.style.pointerEvents = 'auto';

    if (goldSheen) {
      goldSheen.classList.remove('sweep-active');
    }

    setTimeout(() => {
      if (!isUnrolled) {
        stageContainer.classList.remove('unrolled');
      }
    }, 400);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================================
     2. CLASSICAL RAAG YAMAN / COURT ROMANCE AMBIENT SYNTHESIZER
     Web Audio API - Gentle Sitar / Flute / Harp & Tanpura Acoustic Drone
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
      // Ascending D Major / Yaman harmonic chime
      const notes = [293.66, 369.99, 440.00, 554.37, 587.33, 739.99]; // D4, F#4, A4, C#5, D5, F#5
      const now = audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + idx * 0.08 + 1.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.85);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  function playMelodyNote(freq, startTime, duration = 2.4, velocity = 0.075) {
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
      console.warn('Ambient music error:', e);
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
        filter.frequency.setValueAtTime(260, audioCtx.currentTime);

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
     3. SUNLIT 24K GOLD FLAKE PARTICLE CANVAS
     ========================================================================== */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 32;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class GoldLeafFlake {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : -15;
      this.size = Math.random() * 2.4 + 1.0;
      this.speedY = Math.random() * 0.45 + 0.18;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.45 + 0.2;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 1.5;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.008) * 0.4 + this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y > canvas.height + 15) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = `rgba(184, 139, 47, ${this.opacity})`;
      ctx.shadowColor = 'rgba(252, 237, 189, 0.6)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 1.3, this.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new GoldLeafFlake());
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
     4. WEDDING COUNTDOWN ENGINE (TARGET: NOVEMBER 28, 2026)
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

  // Initialize
  initPullInteractions();

})();
