/**
 * main.js — EcomendaStore
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
