/**
 * ROYAL WEDDING E-INVITATION - INTERACTIVE ENGINE
 * Features:
 * - Touch & Mouse Physics Drag-to-Unroll Scroll
 * - Golden Particle & Rose Petal Canvas Animation
 * - Web Audio API Ambient Harp & Chimes (No external assets required)
 * - Live Wedding Countdown Timer
 * - Google Calendar & .ICS Event Generator
 * - Copy Address with Toast Notification
 * - Interactive RSVP & Blessings Wall
 * - Real-Time Customizer & LocalStorage Persistence
 */

(function() {
  'use strict';

  // DOM Elements
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

  // Controls & Customizer Elements
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicIcon = document.getElementById('music-icon');
  const musicText = document.getElementById('music-text');
  const customizeBtn = document.getElementById('customize-btn');
  const customizerDrawer = document.getElementById('customizer-drawer');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');

  // Action Buttons
  const btnCopyAddress = document.getElementById('btn-copy-address');
  const btnAddCalendar = document.getElementById('btn-add-calendar');
  const btnDownloadIcs = document.getElementById('btn-download-ics');
  const btnMapLink = document.getElementById('btn-map-link');

  // RSVP Form & Blessings
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpSuccessBanner = document.getElementById('rsvp-success-banner');
  const wishesList = document.getElementById('wishes-list');

  // Countdown Elements
  const countDays = document.getElementById('count-days');
  const countHours = document.getElementById('count-hours');
  const countMins = document.getElementById('count-mins');
  const countSecs = document.getElementById('count-secs');

  // State
  let isUnrolled = false;
  let isDragging = false;
  let startY = 0;
  let currentDragY = 0;
  const DRAG_THRESHOLD = 110; // Pixels dragged down to trigger full open
  const BASE_THREAD_HEIGHT = 90;

  /* ==========================================================================
     1. PULL DOWN PHYSICS & SCROLL UNROLL MECHANICS
     ========================================================================== */

  function initPullInteractions() {
    // Listen for pointer events on thread assembly, seal, and instruction
    const pullTargets = [threadAssembly, sealTrigger, pullInstruction];

    pullTargets.forEach(target => {
      target.addEventListener('pointerdown', onPointerDown);
    });

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Also support direct click/tap to unroll smoothly
    sealTrigger.addEventListener('click', () => {
      if (!isUnrolled) unrollScroll();
    });

    pullInstruction.addEventListener('click', () => {
      if (!isUnrolled) unrollScroll();
    });

    // Replay Roll-up
    if (btnRollUp) {
      btnRollUp.addEventListener('click', rollupScroll);
    }
  }

  function onPointerDown(e) {
    if (isUnrolled) return;
    isDragging = true;
    startY = e.clientY;
    currentDragY = 0;
    scrollBody.classList.remove('smooth-transition');
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging || isUnrolled) return;

    const deltaY = e.clientY - startY;

    if (deltaY > 0) {
      // Apply slight rubber-band damping
      currentDragY = Math.min(deltaY, 320);

      // Dynamically stretch parchment & thread
      scrollBody.style.height = `${currentDragY}px`;
      pullThread.style.height = `${BASE_THREAD_HEIGHT + currentDragY * 0.25}px`;

      // Fade sash seal slightly as pulled
      const sealOpacity = Math.max(0, 1 - (currentDragY / 150));
      sashSeal.style.opacity = sealOpacity;
    }
  }

  function onPointerUp() {
    if (!isDragging || isUnrolled) return;
    isDragging = false;

    if (currentDragY >= DRAG_THRESHOLD) {
      unrollScroll();
    } else {
      // Snap back to closed state
      scrollBody.classList.add('smooth-transition');
      scrollBody.style.height = '0px';
      pullThread.style.height = `${BASE_THREAD_HEIGHT}px`;
      sashSeal.style.opacity = '1';
    }
  }

  function unrollScroll() {
    isUnrolled = true;
    scrollBody.classList.add('smooth-transition');

    // Calculate full content height
    const fullHeight = invitationInner.scrollHeight;
    scrollBody.style.height = `${fullHeight}px`;

    // Reset thread height
    pullThread.style.height = `${BASE_THREAD_HEIGHT}px`;

    // Hide instruction and wax seal
    sashSeal.style.opacity = '0';
    sashSeal.style.transform = 'translate(-50%, -50%) scale(0.6)';
    pullInstruction.style.opacity = '0';
    pullInstruction.style.pointerEvents = 'none';
    pullInstruction.style.transform = 'translateY(20px)';

    // Play unroll audio effect & celebration sparkles
    playUnrollChime();
    spawnCelebrationConfetti();

    // Start background music if not started yet
    if (!isMusicPlaying) {
      startAmbientMusic();
    }

    showToast('✨ The Royal Invitation is opened with love and blessings! ✨');

    // Once transition completes, set height to auto for fluid responsiveness
    setTimeout(() => {
      if (isUnrolled) {
        scrollBody.style.height = 'auto';
      }
    }, 1300);
  }

  function rollupScroll() {
    isUnrolled = false;
    
    // Smoothly roll back up
    const currentHeight = invitationInner.scrollHeight;
    scrollBody.style.height = `${currentHeight}px`;
    
    // Force reflow
    void scrollBody.offsetHeight;
    
    scrollBody.classList.add('smooth-transition');
    scrollBody.style.height = '0px';

    // Restore sash seal and instructions
    sashSeal.style.opacity = '1';
    sashSeal.style.transform = 'translate(-50%, -50%) scale(1)';
    pullInstruction.style.opacity = '1';
    pullInstruction.style.pointerEvents = 'auto';
    pullInstruction.style.transform = 'translateY(0)';

    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Scroll rolled up. Pull down anytime to open!');
  }

  /* ==========================================================================
     2. WEB AUDIO API SYNTHESIZER (HARP, CHIMES & AMBIENT MUSIC)
     No external audio MP3s needed - 100% reliable offline & on GitHub Pages!
     ========================================================================== */
  let audioCtx = null;
  let isMusicPlaying = false;
  let musicIntervalId = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Sparkling unroll chime effect
  function playUnrollChime() {
    try {
      initAudioContext();
      const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      const now = audioCtx.currentTime;

      frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.25);
      });
    } catch (e) {
      console.warn('Audio chime unsupported:', e);
    }
  }

  // Play a single soft harp pluck
  function playHarpNote(freq, time, duration = 2.5) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.07, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.00001, time + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Continuous soothing ambient wedding melody loop
  function startAmbientMusic() {
    try {
      initAudioContext();
      isMusicPlaying = true;
      musicIcon.textContent = '🔊';
      musicText.textContent = 'Mute Music';

      const chordProgression = [
        [261.63, 329.63, 392.00, 523.25], // C Major
        [220.00, 261.63, 329.63, 440.00], // A Minor
        [174.61, 220.00, 261.63, 349.23], // F Major
        [196.00, 246.94, 293.66, 392.00]  // G Major
      ];

      let chordIdx = 0;

      function playNextArpeggio() {
        if (!isMusicPlaying) return;
        const now = audioCtx.currentTime;
        const chord = chordProgression[chordIdx % chordProgression.length];

        // Pluck arpeggio notes gracefully
        chord.forEach((freq, noteIdx) => {
          playHarpNote(freq, now + noteIdx * 0.45, 3.2);
        });

        // Add a soft high bell on beat 3
        if (chordIdx % 2 === 0) {
          playHarpNote(chord[3] * 1.5, now + 1.2, 2.0);
        }

        chordIdx++;
      }

      playNextArpeggio();
      musicIntervalId = setInterval(playNextArpeggio, 2400);

    } catch (e) {
      console.warn('Ambient music failed to start:', e);
    }
  }

  function stopAmbientMusic() {
    isMusicPlaying = false;
    if (musicIntervalId) {
      clearInterval(musicIntervalId);
      musicIntervalId = null;
    }
    musicIcon.textContent = '🎵';
    musicText.textContent = 'Play Music';
  }

  musicToggleBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
      stopAmbientMusic();
      showToast('Music paused');
    } else {
      startAmbientMusic();
      showToast('Playing royal ambient melody 🎵');
    }
  });

  /* ==========================================================================
     3. AMBIENT PARTICLES (GOLDEN SPARKLES & DRIFTING ROSE PETALS)
     ========================================================================== */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 45;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : -20;
      this.size = Math.random() * 4 + 1.5;
      this.speedY = Math.random() * 0.8 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.isPetal = Math.random() > 0.65; // Some are petals, some are gold sparkles
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 2;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.01) * 0.5 + this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y > canvas.height + 20) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);

      if (this.isPetal) {
        // Soft blush rose petal
        ctx.fillStyle = `rgba(224, 98, 126, ${this.opacity * 0.75})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 1.8, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Shimmering gold sparkle
        ctx.fillStyle = `rgba(245, 218, 125, ${this.opacity})`;
        ctx.shadowColor = '#ffeaa7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
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

  // Burst confetti upon scroll unroll
  function spawnCelebrationConfetti() {
    for (let i = 0; i < 70; i++) {
      const p = new Particle();
      p.x = canvas.width / 2 + (Math.random() - 0.5) * 200;
      p.y = 120 + (Math.random() - 0.5) * 60;
      p.speedY = Math.random() * 3 + 1;
      p.speedX = (Math.random() - 0.5) * 4;
      p.size = Math.random() * 6 + 2;
      p.opacity = 1;
      particles.push(p);
    }
    // Trim extra particles after a while
    setTimeout(() => {
      if (particles.length > PARTICLE_COUNT) {
        particles.splice(PARTICLE_COUNT);
      }
    }, 6000);
  }

  /* ==========================================================================
     4. COUNTDOWN TIMER ENGINE
     ========================================================================== */
  let weddingTargetDate = new Date('2026-11-28T18:00:00');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingTargetDate.getTime() - now;

    if (distance < 0) {
      countDays.textContent = '00';
      countHours.textContent = '00';
      countMins.textContent = '00';
      countSecs.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countDays.textContent = String(days).padStart(2, '0');
    countHours.textContent = String(hours).padStart(2, '0');
    countMins.textContent = String(minutes).padStart(2, '0');
    countSecs.textContent = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ==========================================================================
     5. ACTION BUTTONS: GOOGLE CALENDAR, .ICS DOWNLOAD, COPY ADDRESS
     ========================================================================== */

  // Copy Address
  btnCopyAddress.addEventListener('click', () => {
    const address = document.getElementById('field-venue-address').textContent;
    navigator.clipboard.writeText(address).then(() => {
      showToast('📋 Venue address copied to clipboard!');
    }).catch(() => {
      showToast('Venue: ' + address);
    });
  });

  // Add to Google Calendar
  btnAddCalendar.addEventListener('click', () => {
    const title = encodeURIComponent(`The Wedding of ${document.getElementById('field-bride-name').textContent} & ${document.getElementById('field-groom-name').textContent}`);
    const details = encodeURIComponent('Together with their families, joyfully inviting you to celebrate their wedding ceremony.');
    const location = encodeURIComponent(`${document.getElementById('field-venue-name').textContent}, ${document.getElementById('field-venue-address').textContent}`);
    
    // Nov 28, 2026, 18:00 to 23:59 UTC format approx
    const startTime = '20261128T123000Z'; // 6:00 PM IST is 12:30 UTC
    const endTime = '20261128T183000Z';

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startTime}/${endTime}`;
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  });

  // Download .ics file
  btnDownloadIcs.addEventListener('click', () => {
    const bride = document.getElementById('field-bride-name').textContent;
    const groom = document.getElementById('field-groom-name').textContent;
    const venue = document.getElementById('field-venue-name').textContent;
    const address = document.getElementById('field-venue-address').textContent;

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Royal Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@wedding-invitation',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:20261128T123000Z',
      'DTEND:20261128T183000Z',
      `SUMMARY:Wedding Ceremony of ${bride} & ${groom}`,
      `DESCRIPTION:Join us in celebrating our eternal union at ${venue}.`,
      `LOCATION:${venue}, ${address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${bride.replace(/\s+/g, '_')}_and_${groom.replace(/\s+/g, '_')}_Wedding.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('💾 Calendar invitation (.ics) downloaded!');
  });

  /* ==========================================================================
     6. INTERACTIVE RSVP FORM & BLESSINGS WALL
     ========================================================================== */
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const guestName = document.getElementById('rsvp-guest-name').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    const guestCount = document.getElementById('rsvp-guest-count').value;
    const diet = document.getElementById('rsvp-diet').value;
    const wishes = document.getElementById('rsvp-wishes').value.trim();

    // Store RSVP
    const newRsvp = {
      guestName,
      attendance,
      guestCount,
      diet,
      wishes,
      timestamp: new Date().toISOString()
    };

    const storedRsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    storedRsvps.push(newRsvp);
    localStorage.setItem('wedding_rsvps', JSON.stringify(storedRsvps));

    // Show banner
    rsvpSuccessBanner.style.display = 'block';
    spawnCelebrationConfetti();
    showToast(`🎉 Thank you ${guestName}! Your RSVP is confirmed.`);

    // If wish was provided, prepend to Blessings Wall
    if (wishes) {
      const bubble = document.createElement('div');
      bubble.className = 'wish-bubble';
      bubble.innerHTML = `
        <div class="wish-author">${escapeHtml(guestName)}</div>
        <div class="wish-message">"${escapeHtml(wishes)}"</div>
      `;
      wishesList.insertBefore(bubble, wishesList.firstChild);
    }

    // Reset inputs
    document.getElementById('rsvp-wishes').value = '';
  });

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ==========================================================================
     7. LIVE PERSONALIZATION DRAWER & REAL-TIME CUSTOMIZER
     Allows changing names, dates, venue & map easily in 1 click!
     ========================================================================== */
  customizeBtn.addEventListener('click', () => {
    customizerDrawer.classList.add('open');
  });

  drawerCloseBtn.addEventListener('click', () => {
    customizerDrawer.classList.remove('open');
  });

  // Bind live updates
  const fieldBindings = [
    { input: 'input-bride-name', target: 'field-bride-name' },
    { input: 'input-bride-parents', target: 'field-bride-parents' },
    { input: 'input-groom-name', target: 'field-groom-name' },
    { input: 'input-groom-parents', target: 'field-groom-parents' },
    { input: 'input-monogram', target: 'field-monogram' },
    { input: 'input-date', target: 'field-event-date' },
    { input: 'input-time', target: 'field-event-time' },
    { input: 'input-venue-name', target: 'field-venue-name' },
    { input: 'input-venue-address', target: 'field-venue-address' },
    { input: 'input-quote', target: 'field-quote' },
    { input: 'input-footer-hosts', target: 'field-footer-hosts' }
  ];

  fieldBindings.forEach(binding => {
    const inputEl = document.getElementById(binding.input);
    const targetEl = document.getElementById(binding.target);

    if (inputEl && targetEl) {
      inputEl.addEventListener('input', () => {
        targetEl.textContent = inputEl.value;
        // Update document title if bride or groom changed
        if (binding.input === 'input-bride-name' || binding.input === 'input-groom-name') {
          document.title = `Royal Wedding Invitation | ${document.getElementById('input-bride-name').value} & ${document.getElementById('input-groom-name').value}`;
        }
      });
    }
  });

  // Google Maps URL binding
  const inputMapsUrl = document.getElementById('input-maps-url');
  if (inputMapsUrl) {
    inputMapsUrl.addEventListener('input', () => {
      btnMapLink.href = inputMapsUrl.value;
    });
  }

  // Countdown Date input binding
  const inputCountdown = document.getElementById('input-countdown-target');
  if (inputCountdown) {
    inputCountdown.addEventListener('change', () => {
      const selectedDate = new Date(inputCountdown.value + 'T18:00:00');
      if (!isNaN(selectedDate.getTime())) {
        weddingTargetDate = selectedDate;
        updateCountdown();
      }
    });
  }

  // Save changes to localStorage
  const btnSaveCustomization = document.getElementById('btn-save-customization');
  btnSaveCustomization.addEventListener('click', () => {
    const customData = {};
    fieldBindings.forEach(b => {
      customData[b.input] = document.getElementById(b.input).value;
    });
    customData['input-maps-url'] = inputMapsUrl.value;
    customData['input-countdown-target'] = inputCountdown.value;

    localStorage.setItem('wedding_customization', JSON.stringify(customData));
    customizerDrawer.classList.remove('open');
    showToast('💾 Invitation details saved to your browser!');
  });

  // Reset to defaults
  const btnResetCustomization = document.getElementById('btn-reset-customization');
  btnResetCustomization.addEventListener('click', () => {
    localStorage.removeItem('wedding_customization');
    location.reload();
  });

  // Load saved customization on page startup
  function loadSavedCustomization() {
    const saved = localStorage.getItem('wedding_customization');
    if (!saved) return;
    try {
      const customData = JSON.parse(saved);
      fieldBindings.forEach(b => {
        if (customData[b.input]) {
          document.getElementById(b.input).value = customData[b.input];
          document.getElementById(b.target).textContent = customData[b.input];
        }
      });

      if (customData['input-maps-url']) {
        inputMapsUrl.value = customData['input-maps-url'];
        btnMapLink.href = customData['input-maps-url'];
      }

      if (customData['input-countdown-target']) {
        inputCountdown.value = customData['input-countdown-target'];
        weddingTargetDate = new Date(customData['input-countdown-target'] + 'T18:00:00');
        updateCountdown();
      }
    } catch (e) {
      console.warn('Failed to load saved customization', e);
    }
  }

  /* ==========================================================================
     8. TOAST NOTIFICATION UTILITY
     ========================================================================== */
  let toastTimeout = null;
  function showToast(msg) {
    toastNotice.textContent = msg;
    toastNotice.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 3800);
  }

  // Initialize
  initPullInteractions();
  loadSavedCustomization();

})();
