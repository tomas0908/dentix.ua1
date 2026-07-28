(() => {
  'use strict';

  const header = document.getElementById('siteHeader');
  const hero   = document.getElementById('hero');
  const video  = document.getElementById('heroVideo');
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('mainNav');

  /* ---------- Header background on scroll ---------- */
  const SCROLL_THRESHOLD = 40;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  if (burger) {
    burger.addEventListener('click', () => {
      const isOpen = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
      header.classList.toggle('is-scrolled', !isOpen || window.scrollY > SCROLL_THRESHOLD);
    });
  }

  /* ---------- Assign staggered animation delays via CSS var ---------- */
  document.querySelectorAll('[data-anim]').forEach(el => {
    const delay = el.getAttribute('data-delay') || 0;
    el.style.setProperty('--d', delay);
  });

  /* ---------- Trigger load-in sequence once video/page is ready ---------- */
  const startReveal = () => {
    requestAnimationFrame(() => {
      hero.classList.add('is-ready');
    });
  };

  if (document.readyState === 'complete') {
    startReveal();
  } else {
    window.addEventListener('load', startReveal, { once: true });
    // Fallback: don't block the hero animation on slow video loads
    setTimeout(startReveal, 900);
  }

  /* ---------- Video ready / fallback handling ---------- */
  if (video) {
    const markReady = () => video.setAttribute('data-ready', 'true');
    video.addEventListener('canplay', markReady, { once: true });
    video.addEventListener('error', () => {
      // Keep the CSS gradient fallback visible; hide the empty video element
      video.style.display = 'none';
    });
    // Attempt autoplay defensively (some browsers require an explicit call)
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => { /* autoplay blocked — fallback gradient remains visible */ });
    }
  }

  /* ---------- Animated stat counters ---------- */
  const statEls = document.querySelectorAll('.stat-num');
  let countersStarted = false;

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * eased).toLocaleString('uk-UA');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const startCounters = () => {
    if (countersStarted) return;
    countersStarted = true;
    statEls.forEach(animateCount);
  };

  if ('IntersectionObserver' in window && statEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounters();
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    const panel = document.querySelector('.hero-panel');
    if (panel) io.observe(panel);
  } else {
    startCounters();
  }
})();
