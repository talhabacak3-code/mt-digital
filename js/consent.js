/* =====================================================================
   İmge Dijital — Çerez onay bandı (bilgilendirme)
   - Tercih localStorage'da tutulur; bir kez gösterilir.
   - Harita her zaman görünür (çerez tercihine bağlı değildir).
   ===================================================================== */
(function () {
  'use strict';
  var KEY = 'imge_cookie_consent';
  var banner = document.getElementById('cookie');
  if (!banner) return;

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Banner açıkken sabit butonları (Destek / yukarı çık) bandın üstüne iter.
  function setOffset(px) { document.documentElement.style.setProperty('--consent-h', (px || 0) + 'px'); }
  function liftForBanner() { if (!banner.hidden) setOffset(banner.offsetHeight + 14); }

  function hideBanner() {
    banner.classList.remove('show');
    setOffset(0);
    setTimeout(function () { banner.hidden = true; }, 300);
  }
  function accept() { set('accepted'); hideBanner(); }
  function reject() { set('rejected'); hideBanner(); }

  if (!get()) {
    setTimeout(function () {
      banner.hidden = false;
      liftForBanner();
      setTimeout(function () { banner.classList.add('show'); }, 30);
    }, 600);
    window.addEventListener('resize', liftForBanner);
  }

  var a = document.getElementById('cookieAccept');
  var r = document.getElementById('cookieReject');
  if (a) a.addEventListener('click', accept);
  if (r) r.addEventListener('click', reject);
})();
