/**
 * THE ROYAL PALACE WEDDING E-INVITATION - MASTER CONTROLLER (V2 - 9.5 GRADE)
 * - Three.js WebGL 3D Palace Doors with Flower Petal Burst & PBR Shaders
 * - Cinematic Multi-Scene Story Card Engine (Swipe, Progress Bars, Direct Jump)
 * - View Mode Toggle: Interactive Story Carousel vs Continuous Royal Parchment
 * - 24K Gold Specular Shimmer Calligraphy Animations
 * - Live Wedding Countdown to November 28, 2026
 * - Google Calendar One-Tap Sync & Google Maps Navigation
 */

(function () {
  'use strict';

  // DOM Elements
  const stageContainer = document.getElementById('stage-container');
  const courtyardInvitation = document.getElementById('courtyard-invitation');
  const btnReplayGates = document.getElementById('btn-replay-gates');
  const btnCloseScroll = document.querySelector('.btn-close-scroll');
  const btnAddCalendar = document.getElementById('btn-add-calendar');
  const btnCalendarScroll = document.querySelector('.btn-calendar-scroll');

  // Mode Switcher Elements
  const btnModeStory = document.getElementById('btn-mode-story');
  const btnModeScroll = document.getElementById('btn-mode-scroll');

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

  // Story Carousel Elements
  const storyCards = document.querySelectorAll('.story-card');
  const progressSegments = document.querySelectorAll('.progress-segment');
  const btnStoryPrev = document.getElementById('btn-story-prev');
  const btnStoryNext = document.getElementById('btn-story-next');
  const storyCounter = document.getElementById('story-counter');
  const storyTrack = document.getElementById('story-slides-track');

  let currentCardIndex = 0;
  const totalCards = storyCards.length;
  let activeTheme = 'doors';
  let isInvitationRevealed = false;

  /* ==========================================================================
     1. THREE.JS 3D PALACE PORTAL ENGINE INITIALIZATION
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

  const portalPrompt = document.getElementById('portal-prompt');
  if (portalPrompt) {
    portalPrompt.addEventListener('click', function () {
      if (window.Palace3D && !window.Palace3D.isOpen()) {
        window.Palace3D.openGates();
      }
    });
  }

  /* ==========================================================================
     2. REVEAL & RESET INVITATION
     ========================================================================== */
  function revealInvitation() {
    if (isInvitationRevealed) return;
    isInvitationRevealed = true;

    stageContainer.classList.add('opened');

    setTimeout(() => {
      if (courtyardInvitation) {
        courtyardInvitation.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 700);
  }

  function resetReveal() {
    isInvitationRevealed = false;
    stageContainer.classList.remove('opened');
  }

  function replayPalaceExperience() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      if (activeTheme === 'doors') {
        if (window.Palace3D && window.Palace3D.isOpen()) {
          window.Palace3D.closeGates();
        }
      } else {
        resetReveal();
      }
      goToCard(0);
    }, 300);
  }

  if (btnReplayGates) {
    btnReplayGates.addEventListener('click', function (e) {
      e.stopPropagation();
      replayPalaceExperience();
    });
  }

  if (btnCloseScroll) {
    btnCloseScroll.addEventListener('click', function (e) {
      e.stopPropagation();
      replayPalaceExperience();
    });
  }

  /* ==========================================================================
     3. CINEMATIC STORY CAROUSEL ENGINE
     ========================================================================== */
  function updateStoryCarousel() {
    // Update active card
    storyCards.forEach((card, idx) => {
      if (idx === currentCardIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Update progress segments
    progressSegments.forEach((segment, idx) => {
      segment.classList.remove('active', 'completed');
      if (idx < currentCardIndex) {
        segment.classList.add('completed');
      } else if (idx === currentCardIndex) {
        segment.classList.add('active');
      }
    });

    // Update Counter
    if (storyCounter) {
      storyCounter.textContent = `${currentCardIndex + 1} / ${totalCards}`;
    }
  }

  function goToCard(index) {
    if (index < 0 || index >= totalCards) return;
    currentCardIndex = index;
    updateStoryCarousel();
  }

  function nextCard() {
    if (currentCardIndex < totalCards - 1) {
      goToCard(currentCardIndex + 1);
    }
  }

  function prevCard() {
    if (currentCardIndex > 0) {
      goToCard(currentCardIndex - 1);
    }
  }

  if (btnStoryNext) btnStoryNext.addEventListener('click', nextCard);
  if (btnStoryPrev) btnStoryPrev.addEventListener('click', prevCard);

  // Direct Progress Bar Segment Click
  progressSegments.forEach((seg, idx) => {
    seg.addEventListener('click', () => goToCard(idx));
  });

  // Touch Swipe on Story Track
  let touchStartX = 0;
  let touchStartY = 0;

  if (storyTrack) {
    storyTrack.addEventListener(
      'touchstart',
      function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    storyTrack.addEventListener(
      'touchend',
      function (e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Ensure horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            nextCard();
          } else {
            prevCard();
          }
        }
      },
      { passive: true }
    );
  }

  // Keyboard Navigation
  window.addEventListener('keydown', function (e) {
    if (!isInvitationRevealed) return;
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
  });

  /* ==========================================================================
     4. VIEW MODE TOGGLE (STORY CAROUSEL VS CONTINUOUS SCROLL)
     ========================================================================== */
  if (btnModeStory && btnModeScroll) {
    btnModeStory.addEventListener('click', function () {
      btnModeStory.classList.add('active');
      btnModeScroll.classList.remove('active');
      document.body.classList.remove('mode-scroll-active');
    });

    btnModeScroll.addEventListener('click', function () {
      btnModeScroll.classList.add('active');
      btnModeStory.classList.remove('active');
      document.body.classList.add('mode-scroll-active');
    });
  }

  /* ==========================================================================
     5. THEME SWITCHER LOGIC
     ========================================================================== */
  function switchTheme(newTheme) {
    if (newTheme === activeTheme) return;

    if (isInvitationRevealed) {
      replayPalaceExperience();
    }

    activeTheme = newTheme;
    document.body.className = `theme-${newTheme}`;

    themeBtns.forEach((btn) => {
      if (btn.dataset.theme === newTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    Object.keys(stages).forEach((key) => {
      if (stages[key]) {
        if (key === newTheme) {
          stages[key].classList.add('active');
        } else {
          stages[key].classList.remove('active');
        }
      }
    });

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
     6. ENVELOPE & SCROLL FALLBACK INTERACTION
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
     7. FLOATING 24K GOLD LEAF DUST CANVAS
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
     8. WEDDING COUNTDOWN TIMER (TARGET: NOVEMBER 28, 2026)
     ========================================================================== */
  const targetDate = new Date('2026-11-28T18:00:00').getTime();
  const storyDays = document.getElementById('story-days');
  const storyHours = document.getElementById('story-hours');
  const storyMins = document.getElementById('story-mins');
  const storySecs = document.getElementById('story-secs');

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (storyDays) storyDays.textContent = '00';
      if (storyHours) storyHours.textContent = '00';
      if (storyMins) storyMins.textContent = '00';
      if (storySecs) storySecs.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const sD = String(d).padStart(2, '0');
    const sH = String(h).padStart(2, '0');
    const sM = String(m).padStart(2, '0');
    const sS = String(s).padStart(2, '0');

    if (storyDays) storyDays.textContent = sD;
    if (storyHours) storyHours.textContent = sH;
    if (storyMins) storyMins.textContent = sM;
    if (storySecs) storySecs.textContent = sS;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ==========================================================================
     9. ONE-TAP GOOGLE CALENDAR SYNC
     ========================================================================== */
  function syncGoogleCalendar(e) {
    if (e) e.stopPropagation();
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
  }

  if (btnAddCalendar) btnAddCalendar.addEventListener('click', syncGoogleCalendar);
  if (btnCalendarScroll) btnCalendarScroll.addEventListener('click', syncGoogleCalendar);
})();
