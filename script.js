/* =============================================
   MFN DUALITY STUDIO — SCRIPT.JS
   ============================================= */

'use strict';

/* ========================================
    PAGE LOADER
   ======================================== */
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loaderFill');
  const text   = document.getElementById('loaderText');
  let progress = 0;

  const interval = setInterval(() => {
    const step = Math.random() * 12 + 4;
    progress = Math.min(progress + step, 95);
    fill.style.width = progress + '%';
    text.textContent = Math.floor(progress) + '%';
  }, 100);

  window.addEventListener('load', () => {
    clearInterval(interval);
    fill.style.width = '100%';
    text.textContent = '100%';
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      startRevealAnimations();
    }, 500);
  });

  // Prevent scroll while loading
  document.body.style.overflow = 'hidden';
})();

/* ========================================
   CUSTOM CURSOR
   ======================================== */
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  const magneticEls = document.querySelectorAll('.magnetic, a, button, .project-card, .service-card, .pillar');
  magneticEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      follower.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
      follower.classList.remove('active');
    });
  });
})();

/* ========================================
   MAGNETIC BUTTONS
   ======================================== */
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect   = el.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.2;
      const dy     = (e.clientY - cy) * 0.2;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ========================================
   NAVIGATION
   ======================================== */
function initNav() {
  const nav       = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu= document.getElementById('mobileMenu');
  const navLinks  = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Scroll state
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  });

  // Hamburger
  hamburger && hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // Active link on scroll
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
}

/* ========================================
   SCROLL REVEAL
   ======================================== */
function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => observer.observe(el));
}

function startRevealAnimations() {
  // Immediately reveal hero elements
  document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
  initReveal();
}

/* ========================================
   COUNTER ANIMATION
   ======================================== */
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ========================================
   CONTACT FORM
   ======================================== */
function initContactForm() {
  const form        = document.getElementById('contactForm');
  const successBox  = document.getElementById('formSuccess');
  const submitBtn   = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const nombre  = form.nombre.value.trim();
    const email   = form.email.value.trim();
    const mensaje = form.mensaje.value.trim();

    if (!nombre || !email || !mensaje) {
      shakeForm(form);
      return;
    }
    if (!isValidEmail(email)) {
      shakeForm(form);
      return;
    }

    // Build mailto link as fallback (no server needed)
    const subject  = encodeURIComponent(`Contacto desde MFN Duality Studio — ${nombre}`);
    const servicio = form.servicio.value.trim();
    const body     = encodeURIComponent(
      `Nombre: ${nombre}\nEmail: ${email}\nServicio: ${servicio || 'No especificado'}\n\nMensaje:\n${mensaje}`
    );
    const mailtoUrl = `mailto:mfndualitystudio@gmail.com?subject=${subject}&body=${body}`;

    // Show loading state
    submitBtn.querySelector('.btn-text').style.display = 'none';
    submitBtn.querySelector('.btn-loading').style.display = '';
    submitBtn.disabled = true;

    // Simulate processing then open mail client
    await delay(800);

    window.location.href = mailtoUrl;

    await delay(600);

    // Show success
    form.style.display = 'none';
    successBox.style.display = 'block';
    successBox.style.animation = 'fade-in-up 0.6s ease-out both';
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeForm(form) {
  form.style.animation = 'shake 0.4s ease';
  setTimeout(() => form.style.animation = '', 400);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ========================================
   PARALLAX HERO
   ======================================== */
function initParallax() {
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  const grid  = document.querySelector('.hero-bg-grid');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (orb1) orb1.style.transform = `translateY(${y * 0.15}px)`;
    if (orb2) orb2.style.transform = `translateY(${y * -0.1}px)`;
    if (grid) grid.style.transform = `translateY(${y * 0.05}px)`;
  }, { passive: true });
}

/* ========================================
   INJECT KEYFRAMES DYNAMICALLY
   ======================================== */
function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px); }
      40%      { transform: translateX(8px); }
      60%      { transform: translateX(-6px); }
      80%      { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
}

/* ========================================
   SERVICE CARDS — TILT EFFECT
   ======================================== */
function initTilt() {
  document.querySelectorAll('.service-card, .project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const rx     = (e.clientY - cy) / rect.height * 4;
      const ry     = (e.clientX - cx) / rect.width * -4;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}

/* ========================================
   PROGRESS BAR ON SCROLL
   ======================================== */
function initProgressBar() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px;
    background: linear-gradient(to right, #4A6FA5, rgba(74,111,165,0.3));
    z-index: 10001; width: 0%; transition: width 0.1s;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = (window.scrollY / docHeight) * 100;
    bar.style.width  = progress + '%';
  }, { passive: true });
}

/* ========================================
   TYPING EFFECT ON HERO EYEBROW
   ======================================== */
function initTypingEffect() {
  const eyebrow = document.querySelector('.hero-eyebrow');
  if (!eyebrow) return;
  const text = eyebrow.textContent;
  eyebrow.textContent = '';
  eyebrow.style.opacity = '1';
  let i = 0;
  setTimeout(() => {
    const interval = setInterval(() => {
      eyebrow.textContent += text[i];
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 55);
  }, 700);
}

/* ========================================
   INIT ALL
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  injectKeyframes();
  initNav();
  initMagnetic();
  initCounters();
  initContactForm();
  initParallax();
  initTilt();
  initProgressBar();
  initTypingEffect();
});
