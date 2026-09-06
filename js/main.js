// ===== İmge Dijital — main.js =====

// Mobil menü aç/kapat
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Menü linkine tıklayınca mobilde menüyü kapat
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Header'a kaydırınca gölge ekle
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});

// Scroll-reveal: kartlar tek tek belirsin
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // grup içinde sıralı (kademeli) belirme efekti
          entry.target.style.transitionDelay = `${(entry.target.dataset.delay || i % 3) * 0.12}s`;
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  // IntersectionObserver desteklenmiyorsa hepsini göster
  revealEls.forEach((el) => el.classList.add('visible'));
}

// SSS akordeon
document.querySelectorAll('.faq-item').forEach((item) => {
  const btn = item.querySelector('.faq-q');
  const ans = item.querySelector('.faq-a');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // diğerlerini kapat (tek seferde bir cevap açık)
    document.querySelectorAll('.faq-item.open').forEach((other) => {
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});

// Yukarı çık butonu
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('show', window.scrollY > 500);
});
toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Sayaç animasyonu (istatistikler görünürken 0'dan hedefe sayar)
const counters = document.querySelectorAll('.count');
const runCounter = (el) => {
  const target = +el.dataset.target || 0;
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
};
if (counters.length) {
  if ('IntersectionObserver' in window) {
    const cObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { runCounter(entry.target); obs.unobserve(entry.target); }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => cObs.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.target));
  }
}

// ===== Hero (.hx) mikro etkileşimleri: cursor glow + parallax + magnetic =====
(function () {
  const hx = document.querySelector('.hx');
  if (!hx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  if (reduce || !fine) return; // dokunmatik/erişilebilirlik: kapalı

  const visual = document.getElementById('hxVisual');
  const layers = visual ? Array.from(visual.querySelectorAll('[data-depth]')) : [];
  const magnets = Array.from(hx.querySelectorAll('.magnetic'));
  let rect = hx.getBoundingClientRect();
  window.addEventListener('resize', () => { rect = hx.getBoundingClientRect(); });

  let mx = 0, my = 0, raf = null;
  hx.addEventListener('mouseenter', () => hx.classList.add('cursor-on'));
  hx.addEventListener('mouseleave', () => {
    hx.classList.remove('cursor-on');
    layers.forEach((l) => (l.style.transform = ''));
    magnets.forEach((m) => (m.style.transform = ''));
  });
  hx.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!raf) raf = requestAnimationFrame(update);
  });
  function update() {
    raf = null;
    hx.style.setProperty('--mx', (mx - rect.left) + 'px');
    hx.style.setProperty('--my', (my - rect.top) + 'px');
    const px = (mx - rect.left) / rect.width - 0.5;
    const py = (my - rect.top) / rect.height - 0.5;
    layers.forEach((l) => {
      const d = +l.dataset.depth || 0;
      l.style.transform = 'translate(' + (px * d).toFixed(1) + 'px,' + (py * d).toFixed(1) + 'px)';
    });
    magnets.forEach((m) => {
      const r = m.getBoundingClientRect();
      const dx = mx - (r.left + r.width / 2);
      const dy = my - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < 130) m.style.transform = 'translate(' + (dx * 0.25).toFixed(1) + 'px,' + (dy * 0.25).toFixed(1) + 'px)';
      else m.style.transform = '';
    });
  }
})();

// ===== Hero arka plan videosu (opsiyonel) =====
// Kullanmak için: videonuzu assets/video/hero.mp4 olarak koyun ve aşağıyı true yapın.
var ENABLE_HERO_VIDEO = true;
var HERO_VIDEO_SRC = 'assets/video/hero.mp4';
var hxVideo = document.getElementById('hxVideo');
if (hxVideo && ENABLE_HERO_VIDEO) {
  hxVideo.addEventListener('loadeddata', function () {
    if (hxVideo.videoWidth > 0) {
      hxVideo.classList.add('active');
      var sec = hxVideo.closest('.hx');
      if (sec) sec.classList.add('has-video');
      hxVideo.play().catch(function () {});
    }
  });
  hxVideo.src = HERO_VIDEO_SRC;
  hxVideo.load();
}

// Footer yılını güncelle
document.getElementById('year').textContent = new Date().getFullYear();
