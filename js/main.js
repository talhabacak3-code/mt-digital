// ===== MT Digital — main.js =====

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

// ===== Hero arka plan videosu (voldi tarzı) — şimdilik KAPALI, foto-panel aktif =====
// Gerçek video kullanmak için: videonuzu assets/video/afyon.mp4 koyup aşağıyı true yapın.
const ENABLE_HERO_VIDEO = false;
const HERO_VIDEO_SRC = 'assets/video/afyon.mp4';
const heroEl = document.querySelector('.hero');
if (heroEl && ENABLE_HERO_VIDEO) {
  const v = document.createElement('video');
  v.className = 'hero-video';
  v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('aria-hidden', 'true');
  v.addEventListener('loadeddata', () => {
    if (v.videoWidth > 0) { v.classList.add('active'); v.play().catch(() => {}); }
  });
  v.src = HERO_VIDEO_SRC;
  heroEl.appendChild(v);
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

// Footer yılını güncelle
document.getElementById('year').textContent = new Date().getFullYear();
