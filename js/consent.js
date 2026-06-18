(function () {
  'use strict';

  var STORAGE_KEY = 'cookie_consent';

  var banner    = document.getElementById('cookie-consent');
  var acceptBtn = document.getElementById('cookie-accept');
  var rejectBtn = document.getElementById('cookie-reject');

  /* ── Microsoft Clarity — solo carga si el usuario aceptó cookies ── */
  function loadClarity() {
    if (window._clarityLoaded) return;
    window._clarityLoaded = true;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,'clarity','script','wyt70s96q3');
  }

  function updateConsent(status) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        ad_storage:         status,
        ad_user_data:       status,
        ad_personalization: status,
        analytics_storage:  status
      });
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'cookie_consent_choice', choice: status });
  }

  function hideBanner() {
    if (banner) banner.style.display = 'none';
  }

  function showBanner() {
    if (banner) banner.style.display = 'flex';
  }

  function handleConsent(status) {
    try { localStorage.setItem(STORAGE_KEY, status); } catch (e) {}
    updateConsent(status);
    if (status === 'granted') loadClarity();
    hideBanner();
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (saved) {
    updateConsent(saved);
    if (saved === 'granted') loadClarity();
  } else {
    showBanner();
  }

  if (acceptBtn) acceptBtn.addEventListener('click', function () { handleConsent('granted'); });
  if (rejectBtn) rejectBtn.addEventListener('click', function () { handleConsent('denied'); });
})();
