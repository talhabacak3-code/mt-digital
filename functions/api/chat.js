// =====================================================================
// İmge Dijital — Destek AI (Cloudflare Pages Function)
// Route: /api/chat  (POST)
// Anahtar (ANTHROPIC_API_KEY) yalnızca burada, sunucuda kalır; tarayıcıya
// ASLA düşmez. Frontend (js/support.js) bu uca POST atar.
//
// Cloudflare Pages → Settings → Variables and Secrets:
//   ANTHROPIC_API_KEY = sk-ant-...   (Secret / encrypted)
//   MODEL             = claude-haiku-4-5   (opsiyonel; boşsa aşağıdaki default)
// =====================================================================

const ALLOWED_ORIGINS = [
  'https://imgedijital.com',
  'https://www.imgedijital.com',
  'https://talhabacak3-code.github.io'
];

const SYSTEM_PROMPT = `Sen "İmge Dijital" firmasının web sitesindeki 7/24 Türkçe destek asistanısın. Kısa, sıcak, profesyonel ve net cevap ver (genelde 1–3 cümle). Yalnızca İmge Dijital ve hizmetleriyle ilgili konularda yardımcı ol; alakasız konularda kibarca konuyu firmaya getir.

FİRMA BİLGİLERİ:
- İmge Dijital: Afyonkarahisar merkezli, tüm Türkiye'ye online hizmet veren dijital pazarlama & web tasarım ajansı.
- Hizmetler: kurumsal web tasarım, e-ticaret, SEO, Google Ads, Meta (Instagram/Facebook) reklamları, sosyal medya yönetimi, logo & kurumsal kimlik, video reklam.
- Paketler: Start (yeni markalar), Pro (büyüyen işletmeler), Premium (tam kapsamlı yönetim), Pazaryeri Yönetimi (Trendyol & Hepsiburada), ERP Yönetimi. Ayrıca Barkoset #Kampüs okul geçiş sisteminin (kartlı geçiş, turnike entegrasyonu, anlık veli bildirimi) yetkili bayisidir.
- Web sitesi teslim süresi: kurumsal siteler ortalama 5–10 iş günü; içerik/görsel hazırsa daha kısa.
- Teslim sonrası bakım, güncelleme ve teknik destek verilir. Kolay yönetim paneliyle müşteri içeriği kendi güncelleyebilir.
- İletişim: Telefon & WhatsApp 0553 676 91 56 · E-posta info@imgedijital.com · Afyonkarahisar / Merkez · Instagram @imgedijital.

KURALLAR:
- FİYAT: Sabit fiyat listesi YOK. Her işletmeye özel teklif hazırlanır; ilk görüşme ve keşif ücretsizdir. Net fiyat için WhatsApp'a (0553 676 91 56) yönlendir. Asla uydurma rakam/fiyat verme.
- Müşteri adı, istatistik, referans, ödül gibi DOĞRULANMAMIŞ bilgiler UYDURMA. Bilmediğin bir şey sorulursa dürüstçe söyle ve WhatsApp'tan uzmana bağlanmayı öner.
- Satın alma, sözleşme, kişisel/veri işlemleri yapma; bunları WhatsApp'a yönlendir.
- Yanıtları düz metin ver (markdown başlığı kullanma).`;

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request.headers.get('Origin') || '') });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const headers = { 'Content-Type': 'application/json', ...corsHeaders(origin) };

  try {
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'not_configured' }), { status: 500, headers });
    }

    const body = await request.json().catch(() => ({}));

    // Frontend {messages:[{role,content}]} ya da tek {message} gönderebilir.
    let messages = Array.isArray(body.messages) ? body.messages : null;
    if (!messages && typeof body.message === 'string') {
      messages = [{ role: 'user', content: body.message }];
    }
    if (!messages || !messages.length) {
      return new Response(JSON.stringify({ error: 'empty' }), { status: 400, headers });
    }

    // Güvenlik/limit: son 12 mesaj, rol doğrulama, uzunluk sınırı.
    messages = messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 1500) }));
    if (!messages.length || messages[0].role !== 'user') {
      // Anthropic ilk mesajın 'user' olmasını ister.
      messages = [{ role: 'user', content: (body.message || 'Merhaba').slice(0, 1500) }];
    }

    const model = env.MODEL || 'claude-haiku-4-5';

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    if (!apiRes.ok) {
      const detail = await apiRes.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'upstream', status: apiRes.status, detail: detail.slice(0, 300) }), { status: 502, headers });
    }

    const data = await apiRes.json();
    const reply = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    return new Response(JSON.stringify({ reply: reply || 'Şu an yanıt veremedim, WhatsApp’tan yazabilirsiniz: 0553 676 91 56' }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'exception', detail: String(e).slice(0, 200) }), { status: 500, headers });
  }
}
