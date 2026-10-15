/**
 * THE ROYAL WEDDING E-INVITATION - MASTER INTERACTION ENGINE
 * - Silent, Realistic 3D Scroll Unroll Animation (NO beep music!)
 * - Physical Touch & Mouse Drag Gesture Tracking
 * - Tap-to-Open Fallback on Cylinder, Wax Seal, Dowel & Prompt
 * - Luminous 24K Gold Leaf Dust Particle Canvas
 * - Real-Time Wedding Countdown Engine
 * - One-Tap Google Maps, Google Calendar, Apple/Outlook (.ICS) & Copy Address
 */

(function() {
  'use strict';

  // DOM Elements
  const stageContainer = document.getElementById('stage-container');
  const scrollWrapper = document.getElementById('scroll-wrapper');
  const closedScrollAssembly = document.getElementById('closed-scroll-assembly');
  const scrollCylinderTrigger = document.getElementById('scroll-cylinder-trigger');
  const scrollBody = document.getElementById('scroll-body');
  const invitationInner = document.getElementById('invitation-inner');
  const bottomDowelClosed = document.getElementById('bottom-dowel-closed');
  const threadAssembly = document.getElementById('thread-assembly');
  const pullThread = document.getElementById('pull-thread');
  const pullInstruction = document.getElementById('pull-instruction');
  const btnRollUp = document.getElementById('btn-roll-up');
  const toastNotice = document.getElementById('toast-notice');

  // Action Buttons
  const btnCopyAddress = document.getElementById('btn-copy-address');
  const btnAddCalendar = document.getElementById('btn-add-calendar');
  const btnDownloadIcs = document.getElementById('btn-download-ics');

  // Countdown Elements
  const countDays = document.getElementById('count-days');
  const countHours = document.getElementById('count-hours');
  const countMins = document.getElementById('count-mins');
  const countSecs = document.getElementById('count-secs');

  // Interaction & Physics State
  let isUnrolled = false;
  let isDragging = false;
  let startY = 0;
  let currentDragY = 0;
  let activePointerId = null;
  const DRAG_THRESHOLD = 75; // Comfortable finger pull distance on mobile
  const BASE_THREAD_HEIGHT = 85;

  /* ==========================================================================
     1. PHYSICAL PULL-DOWN & UNROLL INTERACTIONS (SILENT & SMOOTH)
     ========================================================================== */
  function initPullInteractions() {
    const pullTargets = [threadAssembly, scrollCylinderTrigger, bottomDowelClosed, pullInstruction];

    pullTargets.forEach(el => {
      if (!el) return;
      el.addEventListener('pointerdown', onPointerDown, { passive: false });
    });

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Instant Tap-to-Open Fallbacks (Intuitive for Mobile Phones)
    if (scrollCylinderTrigger) {
      scrollCylinderTrigger.addEventListener('click', () => {
        if (!isUnrolled && currentDragY < 12) unrollScroll();
      });
    }

    if (threadAssembly) {
      threadAssembly.addEventListener('click', () => {
        if (!isUnrolled && currentDragY < 12) unrollScroll();
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
  }

  function onPointerMove(e) {
    if (!isDragging || isUnrolled) return;

    const deltaY = e.clientY - startY;

    if (deltaY > 0) {
      // Prevent mobile page bouncing during pull gesture
      if (e.cancelable) e.preventDefault();

      currentDragY = Math.min(deltaY, 260);

      // Dynamically stretch parchment & cord
      scrollBody.style.height = `${currentDragY}px`;
      pullThread.style.height = `${BASE_THREAD_HEIGHT + currentDragY * 0.22}px`;

      // Squeeze and fade closed scroll roll as it unfurls
      const progress = currentDragY / 140;
      closedScrollAssembly.style.opacity = Math.max(0, 1 - progress);
      closedScrollAssembly.style.transform = `scaleY(${Math.max(0.6, 1 - progress * 0.4)})`;
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
      closedScrollAssembly.style.opacity = '1';
      closedScrollAssembly.style.transform = 'scaleY(1)';
    }
  }

  function unrollScroll() {
    isUnrolled = true;
    stageContainer.classList.add('unrolled');
    scrollBody.classList.add('smooth-transition');

    // Calculate full content height including dowels and padding
    const fullHeight = invitationInner.scrollHeight + 70;
    scrollBody.style.height = `${fullHeight}px`;
    pullThread.style.height = `${BASE_THREAD_HEIGHT}px`;

    // Hide closed scroll assembly and instruction prompt smoothly (NO beeps!)
    closedScrollAssembly.classList.add('hidden');
    pullInstruction.style.opacity = '0';
    pullInstruction.style.pointerEvents = 'none';

    showToast('The Royal Wedding Invitation is revealed');

    // Set height to auto after unroll transition for responsive orientation and content flow
    setTimeout(() => {
      if (isUnrolled) {
        scrollBody.style.height = 'auto';
      }
    }, 1300);
  }

  function rollupScroll() {
    isUnrolled = false;

    // Lock to current height first
    const currentHeight = invitationInner.scrollHeight + 70;
    scrollBody.style.height = `${currentHeight}px`;
    void scrollBody.offsetHeight;

    scrollBody.classList.add('smooth-transition');
    scrollBody.style.height = '0px';

    closedScrollAssembly.classList.remove('hidden');
    closedScrollAssembly.style.opacity = '1';
    closedScrollAssembly.style.transform = 'scaleY(1)';
    pullInstruction.style.opacity = '1';
    pullInstruction.style.pointerEvents = 'auto';

    setTimeout(() => {
      if (!isUnrolled) {
        stageContainer.classList.remove('unrolled');
      }
    }, 380);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================================
     2. SUNLIT 24K GOLD FLAKE PARTICLE CANVAS
     ========================================================================== */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 28;

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
      this.size = Math.random() * 2.2 + 1.0;
      this.speedY = Math.random() * 0.4 + 0.16;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.18;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 1.4;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.008) * 0.35 + this.speedX;
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
      ctx.shadowColor = 'rgba(252, 237, 189, 0.5)';
      ctx.shadowBlur = 5;
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
     3. WEDDING COUNTDOWN TIMER (TARGET: NOVEMBER 28, 2026)
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
     4. ACTION HANDLERS (MAP, CALENDAR, COPY ADDRESS)
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
     5. TOAST NOTIFICATION UTILITY
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
