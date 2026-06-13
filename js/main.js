/**
 * main.js — Protepiel
 * Nav scroll · hamburgesa · acordeón · scroll-up
 */

(function () {
  'use strict';

  /* === NAV SCROLLED === */
  const nav = document.querySelector('.header-nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* === HAMBURGESA MÓVIL === */
  const toggle   = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    mobileMenu?.classList.toggle('is-open', !open);
  });

  /* === SCROLL UP BUTTON === */
  const scrollBtn = document.querySelector('.scroll-up-btn');
  if (scrollBtn) {
    const onScroll = () => scrollBtn.classList.toggle('visible', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* === ACORDEÓN FAQs === */
  document.querySelectorAll('.accordion-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const content  = btn.nextElementSibling;

      // Cerrar todos
      document.querySelectorAll('.accordion-button').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling?.classList.remove('active');
      });

      // Abrir/cerrar el actual
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        content?.classList.add('active');
      }
    });
  });

  /* === CONTADOR REGRESIVO (solo si hay promo con fecha real) === */
  const cuenta = document.querySelector('.cuenta-regresiva[data-fin]');
  if (cuenta) {
    const fin = new Date(cuenta.getAttribute('data-fin')).getTime();
    const elDias  = cuenta.querySelector('[data-dias]');
    const elHoras = cuenta.querySelector('[data-horas]');
    const elMin   = cuenta.querySelector('[data-min]');
    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      const diff = fin - Date.now();
      if (isNaN(fin) || diff <= 0) { cuenta.style.display = 'none'; return false; }
      const dias  = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const min   = Math.floor((diff % 3600000) / 60000);
      if (elDias)  elDias.textContent  = pad(dias);
      if (elHoras) elHoras.textContent = pad(horas);
      if (elMin)   elMin.textContent   = pad(min);
      return true;
    };

    if (tick()) setInterval(tick, 30000);
  }

  /* === LAZY ANIMATE (IntersectionObserver) === */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('animate-fade-up');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );

  document.querySelectorAll('.benefit-cell, .testimonio-card, .post-preview, .bento-cell').forEach((el) => {
    io.observe(el);
  });

})();
