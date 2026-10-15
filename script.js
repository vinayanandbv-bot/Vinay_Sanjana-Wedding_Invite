/**
 * THE ROYAL WEDDING E-INVITATION - MASTER INTERACTION ENGINE
 * - Realistic Physical Scroll Unrolling Physics (Zero beep noises!)
 * - Fluid Mobile Touch & Drag Gestures with Natural Inertia
 * - Tap-to-Open Fallbacks on Tassel, Rolled Scroll, Dowel & Hint
 * - Pure 24K Gold Dust Floating Particle Canvas
 * - Real-Time Wedding Countdown Engine (Target: Nov 28, 2026)
 * - Seamless Google Maps & Google Calendar Actions
 */

(function() {
  'use strict';

  // DOM Elements
  const stageContainer = document.getElementById('stage-container');
  const scrollWrapper = document.getElementById('scroll-wrapper');
  const parchmentViewport = document.getElementById('parchment-viewport');
  const invitationInner = document.getElementById('invitation-inner');
  const travelingRoller = document.getElementById('traveling-roller');
  const scrollCylinderTrigger = document.getElementById('scroll-cylinder-trigger');
  const bottomDowel = document.getElementById('bottom-dowel');
  const threadAssembly = document.getElementById('thread-assembly');
  const pullThread = document.getElementById('pull-thread');
  const pullInstruction = document.getElementById('pull-instruction');
  const btnRollUp = document.getElementById('btn-roll-up');
  const btnAddCalendar = document.getElementById('btn-add-calendar');

  // Countdown Elements
  const countDays = document.getElementById('count-days');
  const countHours = document.getElementById('count-hours');
  const countMins = document.getElementById('count-mins');
  const countSecs = document.getElementById('count-secs');

  // Interaction State
  let isUnrolled = false;
  let isDragging = false;
  let startY = 0;
  let currentDragY = 0;
  let activePointerId = null;
  const DRAG_THRESHOLD = 65; // Highly responsive on mobile screens
  const BASE_THREAD_HEIGHT = 85;

  /* ==========================================================================
     1. PHYSICAL PULL-DOWN & UNROLL INTERACTIONS
     ========================================================================== */
  function initPullInteractions() {
    const pullTargets = [threadAssembly, scrollCylinderTrigger, bottomDowel, pullInstruction];

    pullTargets.forEach(el => {
      if (!el) return;
      el.addEventListener('pointerdown', onPointerDown, { passive: false });
    });

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Instant Tap-to-Open Fallbacks (Optimized for Smartphone Users)
    if (scrollCylinderTrigger) {
      scrollCylinderTrigger.addEventListener('click', () => {
        if (!isUnrolled && currentDragY < 10) unrollScroll();
      });
    }

    if (threadAssembly) {
      threadAssembly.addEventListener('click', () => {
        if (!isUnrolled && currentDragY < 10) unrollScroll();
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

    parchmentViewport.classList.remove('smooth-transition');
  }

  function onPointerMove(e) {
    if (!isDragging || isUnrolled) return;

    const deltaY = e.clientY - startY;

    if (deltaY > 0) {
      // Prevent mobile page rubber-banding during finger pull
      if (e.cancelable) e.preventDefault();

      currentDragY = Math.min(deltaY, 280);

      // Dynamically unfurl the parchment in real-time under finger
      parchmentViewport.style.height = `${currentDragY}px`;
      pullThread.style.height = `${BASE_THREAD_HEIGHT + currentDragY * 0.18}px`;

      // Gently fade the rolled cylinder as the parchment unfolds
      const progress = currentDragY / 150;
      scrollCylinderTrigger.style.opacity = Math.max(0.1, 1 - progress);
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
      // Smooth spring back to resting rolled position
      parchmentViewport.classList.add('smooth-transition');
      parchmentViewport.style.height = '0px';
      pullThread.style.height = `${BASE_THREAD_HEIGHT}px`;
      scrollCylinderTrigger.style.opacity = '1';
    }
  }

  function unrollScroll() {
    isUnrolled = true;
    stageContainer.classList.add('unrolled');
    parchmentViewport.classList.add('smooth-transition');

    // Calculate full content height
    const fullHeight = invitationInner.scrollHeight + 14;
    parchmentViewport.style.height = `${fullHeight}px`;
    pullThread.style.height = `${BASE_THREAD_HEIGHT}px`;

    // Seamless unrolling (Completely silent, no intrusive notifications!)
    setTimeout(() => {
      if (isUnrolled) {
        parchmentViewport.style.height = 'auto';
      }
    }, 1400);
  }

  function rollupScroll() {
    isUnrolled = false;

    // Lock to explicit height first for smooth CSS collapse
    const currentHeight = invitationInner.scrollHeight + 14;
    parchmentViewport.style.height = `${currentHeight}px`;
    void parchmentViewport.offsetHeight;

    parchmentViewport.classList.add('smooth-transition');
    parchmentViewport.style.height = '0px';

    scrollCylinderTrigger.style.opacity = '1';

    setTimeout(() => {
      if (!isUnrolled) {
        stageContainer.classList.remove('unrolled');
      }
    }, 450);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================================
     2. AMBIENT 24K GOLD LEAF DUST CANVAS
     ========================================================================== */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  const PARTICLE_COUNT = 26;

  function resizeCanvas() {
    if (!canvas) return;
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
      if (!canvas) return;
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : -15;
      this.size = Math.random() * 2.2 + 1.0;
      this.speedY = Math.random() * 0.4 + 0.16;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.38 + 0.16;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 1.4;
    }

    update() {
      if (!canvas) return;
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.008) * 0.35 + this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y > canvas.height + 15) {
        this.reset(false);
      }
    }

    draw() {
      if (!ctx) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = `rgba(184, 139, 47, ${this.opacity})`;
      ctx.shadowColor = 'rgba(252, 237, 189, 0.45)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 1.3, this.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  if (canvas && ctx) {
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
  }

  /* ==========================================================================
     3. WEDDING COUNTDOWN TIMER (TARGET: NOVEMBER 28, 2026)
     ========================================================================== */
  const targetDate = new Date('2026-11-28T18:00:00').getTime();

  function updateCountdown() {
    if (!countDays || !countHours || !countMins || !countSecs) return;
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
     4. GOOGLE CALENDAR ONE-TAP SYNC
     ========================================================================== */
  if (btnAddCalendar) {
    btnAddCalendar.addEventListener('click', () => {
      const title = encodeURIComponent('The Royal Wedding of Priyanka & Vikram');
      const details = encodeURIComponent('Together with their families, cordially inviting you to celebrate the marriage solemnization of Priyanka & Vikram at The Grand Heritage Palace & Royal Gardens.');
      const location = encodeURIComponent('The Grand Heritage Palace & Royal Gardens, Heritage Boulevard, Palace Enclave, Jaipur, Rajasthan 302001');
      const startTime = '20261128T123000Z';
      const endTime = '20261128T183000Z';

      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startTime}/${endTime}`;
      window.open(gcalUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Initialize Interaction Engine
  initPullInteractions();

})();
