/* =====================================================================
   İmge Dijital — Çerez onay bandı (KVKK/GDPR uyumlu)
   - Üçüncü taraf içerik (Google Haritalar) izin verilene kadar YÜKLENMEZ.
   - Tercih localStorage'da tutulur (çerez kullanmadan).
   ===================================================================== */
(function () {
  'use strict';
  var KEY = 'imge_cookie_consent';
  var banner = document.getElementById('cookie');
  var frame = document.getElementById('mapFrame');
  var blocked = document.getElementById('mapBlocked');

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Banner açıkken sabit butonları (Destek / yukarı çık) bandın üstüne iter.
  function setOffset(px) { document.documentElement.style.setProperty('--consent-h', (px || 0) + 'px'); }
  function liftForBanner() { if (banner && !banner.hidden) setOffset(banner.offsetHeight + 14); }

  function loadMap() {
    if (frame && frame.dataset.src && !frame.src) frame.src = frame.dataset.src;
    if (blocked) blocked.hidden = true;
  }
  function blockMap() { if (blocked) blocked.hidden = false; }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('show');
    setOffset(0);
    setTimeout(function () { banner.hidden = true; }, 300);
  }
  function accept() { set('accepted'); loadMap(); hideBanner(); }
  function reject() { set('rejected'); blockMap(); hideBanner(); }

  var consent = get();
  if (consent === 'accepted') {
    loadMap();
  } else if (consent === 'rejected') {
    blockMap();
  } else {
    blockMap();
    if (banner) {
      setTimeout(function () {
        banner.hidden = false;
        liftForBanner();
        setTimeout(function () { banner.classList.add('show'); }, 30);
      }, 600);
    }
    window.addEventListener('resize', liftForBanner);
  }

  var a = document.getElementById('cookieAccept');
  var r = document.getElementById('cookieReject');
  var m = document.getElementById('mapAllow');
  if (a) a.addEventListener('click', accept);
  if (r) r.addEventListener('click', reject);
  if (m) m.addEventListener('click', accept); // "Haritayı Göster" = çerezleri kabul et
})();
