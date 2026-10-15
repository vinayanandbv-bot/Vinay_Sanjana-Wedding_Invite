/**
 * THE ROYAL PALACE WEDDING E-INVITATION - MASTER CONTROLLER
 * - Orchestrates Three.js WebGL 3D Palace Gates, 3D Monogram Envelope & Heritage Scroll
 * - Zero Audio / Silent & Dignified
 * - Live Countdown to November 28, 2026
 * - Google Calendar One-Tap Sync & Google Maps Navigation
 */

(function () {
  'use strict';

  // DOM Elements
  const stageContainer = document.getElementById('stage-container');
  const courtyardInvitation = document.getElementById('courtyard-invitation');
  const invitationInner = document.getElementById('invitation-inner');
  const btnCloseAction = document.getElementById('btn-close-action');
  const btnAddCalendar = document.getElementById('btn-add-calendar');

  // Theme Switcher Buttons
  const themeBtns = document.querySelectorAll('.theme-tab-btn');
  const stages = {
    doors: document.getElementById('stage-doors'),
    envelope: document.getElementById('stage-envelope'),
    scroll: document.getElementById('stage-scroll'),
  };

  // Envelope Elements
  const envelopeAssembly = document.getElementById('envelope-assembly');
  const envelopeWaxSeal = document.getElementById('envelope-wax-seal');
  const envelopePrompt = document.getElementById('envelope-prompt');

  // Scroll Elements
  const scrollAssembly = document.getElementById('scroll-assembly');
  const scrollPullCord = document.getElementById('scroll-pull-cord');
  const scrollPrompt = document.getElementById('scroll-prompt');

  // Countdown Elements
  const countDays = document.getElementById('count-days');
  const countHours = document.getElementById('count-hours');
  const countMins = document.getElementById('count-mins');
  const countSecs = document.getElementById('count-secs');

  let activeTheme = 'doors';
  let isInvitationRevealed = false;

  /* ==========================================================================
     1. INITIALIZE THREE.JS 3D PALACE PORTAL
     ========================================================================== */
  if (window.Palace3D) {
    window.Palace3D.init({
      containerId: 'palace-webgl-container',
      onOpen: function () {
        revealInvitation();
      },
      onClose: function () {
        resetReveal();
      },
    });
  }

  // Also bind the prompt line for Palace Gates
  const portalPrompt = document.getElementById('portal-prompt');
  if (portalPrompt) {
    portalPrompt.addEventListener('click', function () {
      if (window.Palace3D && !window.Palace3D.isOpen()) {
        window.Palace3D.openGates();
      }
    });
  }

  /* ==========================================================================
     2. REVEAL & CLOSE INVITATION
     ========================================================================== */
  function revealInvitation() {
    if (isInvitationRevealed) return;
    isInvitationRevealed = true;

    stageContainer.classList.add('opened');

    setTimeout(() => {
      if (invitationInner) {
        invitationInner.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 700);
  }

  function resetReveal() {
    isInvitationRevealed = false;
    stageContainer.classList.remove('opened');
  }

  function closeCurrentTheme() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      if (activeTheme === 'doors') {
        if (window.Palace3D && window.Palace3D.isOpen()) {
          window.Palace3D.closeGates();
        }
      } else {
        resetReveal();
      }
    }, 300);
  }

  if (btnCloseAction) {
    btnCloseAction.addEventListener('click', function (e) {
      e.stopPropagation();
      closeCurrentTheme();
    });
  }

  /* ==========================================================================
     3. THEME SWITCHER LOGIC
     ========================================================================== */
  function switchTheme(newTheme) {
    if (newTheme === activeTheme) return;

    // Reset current state if opened
    if (isInvitationRevealed) {
      closeCurrentTheme();
    }

    activeTheme = newTheme;

    // Update body class for styling tweaks
    document.body.className = `theme-${newTheme}`;

    // Update Switcher Tab Active States
    themeBtns.forEach((btn) => {
      if (btn.dataset.theme === newTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Stage Visibility
    Object.keys(stages).forEach((key) => {
      if (stages[key]) {
        if (key === newTheme) {
          stages[key].classList.add('active');
        } else {
          stages[key].classList.remove('active');
        }
      }
    });

    // If switching back to doors, trigger canvas resize in Three.js
    if (newTheme === 'doors') {
      window.dispatchEvent(new Event('resize'));
    }
  }

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const theme = this.dataset.theme;
      switchTheme(theme);
    });
  });

  /* ==========================================================================
     4. ENVELOPE THEME INTERACTIONS
     ========================================================================== */
  function openEnvelope() {
    revealInvitation();
  }

  if (envelopeWaxSeal) {
    envelopeWaxSeal.addEventListener('click', function (e) {
      e.stopPropagation();
      openEnvelope();
    });
  }

  if (envelopeAssembly) {
    envelopeAssembly.addEventListener('click', function () {
      if (!isInvitationRevealed) {
        openEnvelope();
      }
    });
  }

  if (envelopePrompt) {
    envelopePrompt.addEventListener('click', openEnvelope);
  }

  /* ==========================================================================
     5. SCROLL THEME INTERACTIONS
     ========================================================================== */
  function openScroll() {
    revealInvitation();
  }

  if (scrollPullCord) {
    scrollPullCord.addEventListener('click', function (e) {
      e.stopPropagation();
      openScroll();
    });
  }

  if (scrollAssembly) {
    scrollAssembly.addEventListener('click', function () {
      if (!isInvitationRevealed) {
        openScroll();
      }
    });
  }

  if (scrollPrompt) {
    scrollPrompt.addEventListener('click', openScroll);
  }

  /* ==========================================================================
     6. AMBIENT 24K GOLD LEAF DUST CANVAS
     ========================================================================== */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  const PARTICLE_COUNT = 24;

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
      this.size = Math.random() * 2.2 + 0.9;
      this.speedY = Math.random() * 0.4 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.28;
      this.opacity = Math.random() * 0.35 + 0.15;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 1.2;
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
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ==========================================================================
     7. WEDDING COUNTDOWN TIMER (TARGET: NOVEMBER 28, 2026)
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
     8. ONE-TAP GOOGLE CALENDAR SYNC
     ========================================================================== */
  if (btnAddCalendar) {
    btnAddCalendar.addEventListener('click', function (e) {
      e.stopPropagation();
      const title = encodeURIComponent('The Royal Wedding of Priyanka & Vikram');
      const details = encodeURIComponent(
        'Together with their families, cordially inviting you to celebrate the marriage solemnization of Priyanka & Vikram at The Grand Heritage Palace & Royal Gardens.'
      );
      const location = encodeURIComponent(
        'The Grand Heritage Palace & Royal Gardens, Heritage Boulevard, Palace Enclave, Jaipur, Rajasthan 302001'
      );
      const startTime = '20261128T123000Z';
      const endTime = '20261128T183000Z';

      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startTime}/${endTime}`;
      window.open(gcalUrl, '_blank', 'noopener,noreferrer');
    });
  }
})();
