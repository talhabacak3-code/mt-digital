/* =====================================================================
   İmge Dijital — Destek asistanı (kural tabanlı, 7/24 çalışır)
   - Sitenin kendi içeriğinden DOĞRU ve tutarlı yanıtlar verir.
   - Anlamadığında WhatsApp'ta uzmana yönlendirir.
   - Gerçek Claude'lu AI'ya yükseltmek için: AI_ENDPOINT'i Cloudflare
     Worker adresinizle doldurun; anahtar Worker'da GİZLİ kalır, tarayıcıya
     asla düşmez. Endpoint boşken yerel bilgi tabanı kullanılır.
   ===================================================================== */
(function () {
  'use strict';

  // Gerçek Claude AI ucu (Cloudflare Pages Function). Anahtar sunucuda gizli.
  // imgedijital.com'da çalışır; erişilemezse otomatik olarak yerel bilgi
  // tabanına düşer (github.io veya anahtar ayarlı değilken).
  var AI_ENDPOINT = 'https://imgedijital.com/api/chat';
  var WA = 'https://wa.me/905536769156?text=';
  var convo = []; // {role:'user'|'assistant', content} — AI'ya bağlam için

  // ---- Türkçe normalizasyon (aksan + İ/ı duyarsız eşleşme) ----
  function norm(s) {
    return (s || '')
      .replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i')
      .toLowerCase()
      .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/â/g, 'a')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  // ---- Bilgi tabanı: her niyet için anahtar kelimeler + doğru yanıt ----
  var KB = [
    { k: ['merhaba', 'selam', 'iyi gunler', 'gunaydin', 'hey', 'alo'],
      a: 'Merhaba! 👋 İmge Dijital destek asistanıyım. Fiyat, teslim süresi, hizmetler, paketler veya iletişim hakkında sorabilirsiniz.' },
    { k: ['fiyat', 'ucret', 'ne kadar', 'kac para', 'maliyet', 'butce', 'paket fiyat', 'tutar'],
      a: 'Sabit bir fiyat listemiz yok; her işletmenin ihtiyacı farklı olduğu için size özel teklif hazırlıyoruz. İlk görüşme ve keşif tamamen ücretsiz. Net fiyat için WhatsApp’tan yazabilirsiniz.',
      wa: 'Merhaba, fiyat teklifi almak istiyorum' },
    { k: ['sure', 'ne kadar surede', 'kac gunde', 'teslim', 'hazir', 'zaman'],
      a: 'Kurumsal siteler proje kapsamına göre ortalama 5–10 iş gününde teslim edilir. İçerik ve görseller hazırsa süre daha da kısalır.' },
    { k: ['hizmetler', 'hizmetleri', 'hizmetleriniz', 'hangi hizmet', 'neler yapiyorsunuz', 'ne yapiyorsunuz', 'neler sunuyorsunuz'],
      a: 'Hizmetlerimiz: web tasarım, e-ticaret, SEO, Google Ads, Meta (Instagram/Facebook) reklamları, sosyal medya yönetimi, logo & kurumsal kimlik ve video reklam.' },
    { k: ['paket', 'start', 'pro', 'premium'],
      a: 'Paketlerimiz: Start (yeni markalar), Pro (büyüyen işletmeler), Premium (tam kapsamlı yönetim), Pazaryeri Yönetimi ve ERP. Ayrıca Barkoset #Kampüs okul geçiş sisteminin yetkili bayisiyiz. Hangisini merak ediyorsunuz?' },
    { k: ['web', 'site', 'internet sitesi', 'kurumsal site', 'web tasarim'],
      a: 'Modern, hızlı ve mobil uyumlu kurumsal web siteleri tasarlıyoruz; kolay yönetim paneli ve SEO dostu altyapı dahil.' },
    { k: ['e ticaret', 'eticaret', 'online satis', 'magaza', 'sepet'],
      a: 'Satışa hazır, güvenli ve yönetimi kolay e-ticaret siteleri kuruyoruz; ödeme ve kargo entegrasyonlarıyla birlikte.' },
    { k: ['trendyol', 'hepsiburada', 'pazaryeri', 'pazar yeri'],
      a: 'Pazaryeri Yönetimi paketimizde Trendyol & Hepsiburada mağaza kurulumu, ürün listeleme, görsel/SEO düzenleme, reklam yönetimi ve satış raporlaması yapıyoruz.' },
    { k: ['seo', 'google da ust', 'siralama', 'organik', 'arama'],
      a: 'SEO tarafında teknik SEO, içerik ve backlink çalışmalarıyla Google’da kalıcı organik sıralama hedefliyoruz.' },
    { k: ['reklam', 'google ads', 'meta', 'instagram reklam', 'facebook reklam', 'ads'],
      a: 'Dönüşüm odaklı Google Ads ve Meta (Instagram/Facebook) reklam yönetimi yapıyoruz; bütçenizi en verimli şekilde kullanırız.' },
    { k: ['sosyal medya', 'instagram yonetim', 'icerik', 'paylasim'],
      a: 'Sosyal medya yönetiminde içerik planı, tasarım ve paylaşım yönetimiyle markanızı canlı tutuyoruz.' },
    { k: ['logo', 'kurumsal kimlik', 'marka', 'kartvizit'],
      a: 'Akılda kalıcı logo, kartvizit ve kurumsal kimlik tasarımıyla markanıza profesyonel bir yüz kazandırıyoruz.' },
    { k: ['video', 'tanitim', 'reklam filmi'],
      a: 'Tanıtım, ürün ve reklam videolarıyla markanızı hareketlendiriyoruz; kısa ve etkili prodüksiyon.' },
    { k: ['erp', 'stok', 'fatura', 'muhasebe', 'otomasyon'],
      a: 'ERP paketimizde kurulum danışmanlığı, stok/sipariş/fatura yönetimi, e-ticaret & pazaryeri ve muhasebe entegrasyonu, otomasyon ve personel eğitimi yer alır.' },
    { k: ['barkoset', 'kampus', 'okul', 'turnike', 'veli', 'gecis', 'ogrenci'],
      a: 'Barkoset #Kampüs yetkili bayisiyiz: kartlı (Proximity/MIFARE) güvenli geçiş, turnike entegrasyonu, anlık veli bildirimi ve giriş-çıkışların dijital kaydı. Kağıtsız, güvenli okul deneyimi.' },
    { k: ['destek', 'bakim', 'guncelleme sonrasi', 'sorun', 'yardim'],
      a: 'Teslim sonrasında yalnız kalmazsınız; bakım, güncelleme ve teknik destekle her zaman yanınızdayız.' },
    { k: ['panel', 'kendim guncelle', 'yonetim'],
      a: 'Teknik bilgi gerektirmeyen, kullanımı kolay bir yönetim paneli veriyoruz; içerik, görsel ve fiyatları dilediğiniz zaman kendiniz güncelleyebilirsiniz.' },
    { k: ['sehir', 'sehirler', 'nerede', 'bolge', 'afyon', 'hangi il', 'uzak', 'nereye hizmet', 'baska sehir'],
      a: 'Merkezimiz Afyonkarahisar’da; tüm hizmetleri online olarak Türkiye’nin her yerine veriyoruz. Uzaklık bir engel değil.' },
    { k: ['iletisim', 'telefon', 'numara', 'mail', 'e posta', 'eposta', 'ulas', 'adres'],
      a: 'Telefon & WhatsApp: 0553 676 91 56 · E-posta: info@imgedijital.com · Konum: Afyonkarahisar / Merkez.',
      wa: 'Merhaba, bilgi almak istiyorum' },
    { k: ['calisma saati', 'saat', 'acik', 'ne zaman'],
      a: 'WhatsApp’tan bize 7/24 yazabilirsiniz; en kısa sürede dönüş yapıyoruz.' },
    { k: ['tesekkur', 'sagol', 'eyvallah', 'tskler'],
      a: 'Rica ederiz! 🙌 Başka bir sorunuz olursa buradayım.' }
  ];

  function localAnswer(text) {
    var n = ' ' + norm(text) + ' ';
    var best = null, bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var score = 0;
      for (var j = 0; j < KB[i].k.length; j++) {
        if (n.indexOf(' ' + KB[i].k[j] + ' ') !== -1 || n.indexOf(KB[i].k[j]) !== -1) {
          score += KB[i].k[j].length; // daha uzun/özel eşleşme daha güçlü
        }
      }
      if (score > bestScore) { bestScore = score; best = KB[i]; }
    }
    if (best) return { a: best.a, wa: best.wa };
    return {
      a: 'Bunu tam anlayamadım 🙂 Fiyat, teslim süresi, hizmetler, paketler, e-ticaret/pazaryeri, SEO, reklam veya iletişim hakkında sorabilirsiniz. Dilerseniz WhatsApp’tan uzmanımıza bağlanın.',
      wa: null, fallback: true
    };
  }

  // ---- DOM ----
  var root = document.getElementById('support');
  if (!root) return;
  var fab = document.getElementById('supportFab');
  var panel = document.getElementById('supportPanel');
  var closeBtn = document.getElementById('supportClose');
  var body = document.getElementById('supportBody');
  var chips = document.getElementById('supportChips');
  var form = document.getElementById('supportForm');
  var input = document.getElementById('supportMsg');
  var greeted = false;

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  // Bot yanıtındaki telefon numarasını WhatsApp linkine, e-postayı mailto'ya çevir (güvenli, DOM ile)
  function linkifyInto(container, text) {
    var re = /(0?5\d{2}[\s.\-]?\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2})|([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})/g;
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) container.appendChild(document.createTextNode(text.slice(last, m.index)));
      var a = document.createElement('a');
      a.className = 'msg-link';
      a.target = '_blank'; a.rel = 'noopener';
      if (m[1]) { // telefon → WhatsApp
        var wa = m[1].replace(/\D/g, '').replace(/^0/, '90');
        if (wa.indexOf('90') !== 0) wa = '90' + wa;
        a.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Merhaba, bilgi almak istiyorum');
      } else { // e-posta → mailto
        a.href = 'mailto:' + m[2];
      }
      a.textContent = m[0];
      container.appendChild(a);
      last = m.index + m[0].length;
    }
    if (last < text.length) container.appendChild(document.createTextNode(text.slice(last)));
  }

  function bubble(text, who, waText) {
    var el = document.createElement('div');
    el.className = 'msg msg-' + who;
    var p = document.createElement('div');
    p.className = 'msg-b';
    if (who === 'bot') linkifyInto(p, text); else p.textContent = text;
    el.appendChild(p);
    if (waText) {
      var a = document.createElement('a');
      a.className = 'msg-wa';
      a.href = WA + encodeURIComponent(waText);
      a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'WhatsApp’tan devam et →';
      el.appendChild(a);
    }
    body.appendChild(el);
    scrollDown();
    return el;
  }

  function typing() {
    var el = document.createElement('div');
    el.className = 'msg msg-bot';
    el.innerHTML = '<div class="msg-b msg-typing"><span></span><span></span><span></span></div>';
    body.appendChild(el); scrollDown();
    return el;
  }

  async function remoteAnswer(text) {
    var r = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: convo, message: text })
    });
    if (!r.ok) throw new Error('bad status');
    var data = await r.json();
    return { a: (data && (data.reply || data.answer)) || '', wa: null };
  }

  async function respond(text) {
    var t = typing();
    var res;
    try {
      if (AI_ENDPOINT) {
        res = await remoteAnswer(text);
        if (!res.a) res = localAnswer(text);
      } else {
        await new Promise(function (r) { setTimeout(r, 380); });
        res = localAnswer(text);
      }
    } catch (e) {
      res = localAnswer(text); // AI erişilemezse yerel bilgi tabanına düş
      res.wa = res.wa || 'Merhaba, canlı destek istiyorum';
    }
    t.remove();
    bubble(res.a, 'bot', res.fallback ? 'Merhaba, canlı destek istiyorum' : res.wa);
    convo.push({ role: 'assistant', content: res.a });
    if (convo.length > 12) convo = convo.slice(-12);
  }

  function send(text) {
    text = (text || '').trim();
    if (!text) return;
    bubble(text, 'user');
    convo.push({ role: 'user', content: text });
    input.value = '';
    respond(text);
  }

  function open() {
    root.classList.add('open');
    fab.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    if (!greeted) {
      greeted = true;
      bubble('Merhaba! 👋 Ben İmge Dijital’in destek asistanıyım, 7/24 buradayım. Size nasıl yardımcı olabilirim?', 'bot');
    }
    setTimeout(function () { input.focus(); }, 120);
  }
  function close() {
    root.classList.remove('open');
    fab.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
  }

  fab.addEventListener('click', function () {
    root.classList.contains('open') ? close() : open();
  });
  closeBtn.addEventListener('click', close);
  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-q]');
    if (b) send(b.getAttribute('data-q'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('open')) close();
  });

  // Sayfa açılışında otomatik aç (her oturumda bir kez; her yenilemede değil).
  var AUTO_OPEN = true;
  var AUTO_OPEN_DELAY = 1500;
  if (AUTO_OPEN) {
    var already = false;
    try { already = sessionStorage.getItem('imge_support_opened') === '1'; } catch (e) {}
    if (!already) {
      setTimeout(function () {
        if (!root.classList.contains('open')) open();
        try { sessionStorage.setItem('imge_support_opened', '1'); } catch (e) {}
      }, AUTO_OPEN_DELAY);
    }
  }
})();
