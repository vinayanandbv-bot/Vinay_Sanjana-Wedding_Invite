/**
 * THE ROYAL PALACE WEDDING E-INVITATION - MASTER INTERACTION SCRIPT
 * - 3D Palace Gates Grand Opening with Crimson Monogram Wax Seal (P & V)
 * - Pure Visual Elegance: Silent (Zero Beeps/Audio), Zero Toast Popups
 * - Ambient 24K Gold Leaf Dust Particle Canvas
 * - Real-Time Wedding Countdown Timer (Target: Nov 28, 2026)
 * - One-Tap Google Calendar Sync & Google Maps Navigation
 */

(function () {
  'use strict';

  // DOM Elements
  const stageContainer = document.getElementById('stage-container');
  const palacePortal = document.getElementById('palace-portal');
  const doorsStage = document.getElementById('doors-stage');
  const centralPalaceSeal = document.getElementById('central-palace-seal');
  const portalPrompt = document.getElementById('portal-prompt');
  const btnCloseDoors = document.getElementById('btn-close-doors');
  const btnAddCalendar = document.getElementById('btn-add-calendar');
  const invitationInner = document.getElementById('invitation-inner');

  // Countdown Elements
  const countDays = document.getElementById('count-days');
  const countHours = document.getElementById('count-hours');
  const countMins = document.getElementById('count-mins');
  const countSecs = document.getElementById('count-secs');

  let areGatesOpen = false;

  /* ==========================================================================
     1. 3D ROYAL PALACE GATES OPEN / CLOSE INTERACTION
     ========================================================================== */
  function openGates() {
    if (areGatesOpen) return;
    areGatesOpen = true;

    // Add gates-open class to trigger 3D perspective door swing
    stageContainer.classList.add('gates-open');

    // Smoothly scroll down towards the revealed royal invitation courtyard
    setTimeout(() => {
      if (invitationInner) {
        invitationInner.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 750);
  }

  function closeGates() {
    if (!areGatesOpen) return;
    areGatesOpen = false;

    // Smooth scroll back to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close the palace doors
    setTimeout(() => {
      stageContainer.classList.remove('gates-open');
    }, 300);
  }

  // Bind Open Gate Triggers
  if (centralPalaceSeal) {
    centralPalaceSeal.addEventListener('click', function (e) {
      e.stopPropagation();
      openGates();
    });
  }

  if (doorsStage) {
    doorsStage.addEventListener('click', function () {
      if (!areGatesOpen) {
        openGates();
      }
    });
  }

  if (portalPrompt) {
    portalPrompt.addEventListener('click', function () {
      if (!areGatesOpen) {
        openGates();
      }
    });
  }

  // Bind Close Gate Button
  if (btnCloseDoors) {
    btnCloseDoors.addEventListener('click', function (e) {
      e.stopPropagation();
      closeGates();
    });
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
      this.speedY = Math.random() * 0.45 + 0.18;
      this.speedX = (Math.random() - 0.5) * 0.3;
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
