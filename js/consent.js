(function () {
  'use strict';

  var STORAGE_KEY = 'cookie_consent';

  var banner    = document.getElementById('cookie-consent');
  var acceptBtn = document.getElementById('cookie-accept');
  var rejectBtn = document.getElementById('cookie-reject');

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
    hideBanner();
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (saved) {
    updateConsent(saved);
  } else {
    showBanner();
  }

  if (acceptBtn) acceptBtn.addEventListener('click', function () { handleConsent('granted'); });
  if (rejectBtn) rejectBtn.addEventListener('click', function () { handleConsent('denied'); });
})();
