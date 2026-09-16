// =====================================================================
// İmge Dijital — Destek AI (Cloudflare Pages Function)
// Route: /api/chat  (POST)
//
// ÜCRETSİZ yol: Cloudflare Workers AI ("AI" binding) — kredi kartı/anahtar
// gerekmez, günlük ücretsiz kota vardır. Tarayıcıya hiçbir sır düşmez.
//
// AKTİFLEŞTİRME (tek seferlik):
//   Cloudflare → Workers & Pages → (Pages projen) → Settings → Bindings
//   → Add → Workers AI → Variable name: AI → Save → sonra Redeploy.
// Opsiyonel model değişkeni:  MODEL = @cf/meta/llama-3.3-70b-instruct-fp8-fast
//
// (İleride ücretli daha güçlü model istersen: ANTHROPIC_API_KEY secret'ı
//  eklersen otomatik olarak Claude'a geçer.)
// =====================================================================

const ALLOWED_ORIGINS = [
  'https://imgedijital.com',
  'https://www.imgedijital.com',
  'https://talhabacak3-code.github.io'
];

const SYSTEM_PROMPT = `Sen "İmge Dijital" firmasının web sitesindeki 7/24 destek asistanısın. HER ZAMAN TÜRKÇE ve kısa yanıt ver (genelde 1–3 cümle), sıcak ve profesyonel ol. Yalnızca İmge Dijital ve hizmetleriyle ilgili yardımcı ol; alakasız konularda kibarca konuyu firmaya getir.

FİRMA BİLGİLERİ:
- İmge Dijital: Afyonkarahisar merkezli, tüm Türkiye'ye online hizmet veren dijital pazarlama & web tasarım ajansı.
- Hizmetler: kurumsal web tasarım, e-ticaret, SEO, Google Ads, Meta (Instagram/Facebook) reklamları, sosyal medya yönetimi, logo & kurumsal kimlik, video reklam.
- Paketler: Start (yeni markalar), Pro (büyüyen işletmeler), Premium (tam kapsamlı yönetim), Pazaryeri Yönetimi (Trendyol & Hepsiburada), ERP Yönetimi. Ayrıca Barkoset #Kampüs okul geçiş sisteminin (kartlı geçiş, turnike entegrasyonu, anlık veli bildirimi) yetkili bayisidir.
- Web sitesi teslim süresi: kurumsal siteler ortalama 5–10 iş günü; içerik/görsel hazırsa daha kısa.
- Teslim sonrası bakım, güncelleme ve teknik destek verilir. Kolay yönetim paneliyle müşteri içeriği kendi güncelleyebilir.
- İletişim: Telefon & WhatsApp 0553 676 91 56 · E-posta info@imgedijital.com · Afyonkarahisar / Merkez · Instagram @imgedijital.

KURALLAR:
- FİYAT: Sabit fiyat listesi YOK. Her işletmeye özel teklif hazırlanır; ilk görüşme ve keşif ücretsizdir. Net fiyat için WhatsApp'a (0553 676 91 56) yönlendir. Asla uydurma rakam/fiyat verme.
- Müşteri adı, istatistik, referans, ödül gibi DOĞRULANMAMIŞ bilgileri UYDURMA. Bilmediğini dürüstçe söyle ve WhatsApp'tan uzmana bağlanmayı öner.
- Satın alma, sözleşme, kişisel/veri işlemleri yapma; bunları WhatsApp'a yönlendir.
- Yanıtları düz metin ver.`;

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

// Workers AI binding'ini ADINDAN bağımsız bul (env.AI, env.iMGE, vb.):
// binding nesnesinin .run() metodu vardır; değişkenler string olur.
function findAiBinding(env) {
  if (env.AI && typeof env.AI.run === 'function') return env.AI;
  for (const key in env) {
    const val = env[key];
    if (val && typeof val === 'object' && typeof val.run === 'function') return val;
  }
  return null;
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request.headers.get('Origin') || '') });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const headers = { 'Content-Type': 'application/json', ...corsHeaders(origin) };

  try {
    const body = await request.json().catch(() => ({}));

    // Frontend {messages:[{role,content}]} ya da tek {message} gönderebilir.
    let turns = Array.isArray(body.messages) ? body.messages : null;
    if (!turns && typeof body.message === 'string') turns = [{ role: 'user', content: body.message }];
    if (!turns || !turns.length) {
      return new Response(JSON.stringify({ error: 'empty' }), { status: 400, headers });
    }

    // Güvenlik/limit: son 12 mesaj, rol doğrulama, uzunluk sınırı.
    turns = turns
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 1500) }));
    if (!turns.length || turns[0].role !== 'user') {
      turns = [{ role: 'user', content: (body.message || 'Merhaba').slice(0, 1500) }];
    }

    let reply = '';

    // 1) ÜCRETLİ (opsiyonel): ANTHROPIC_API_KEY varsa Claude kullan.
    if (env.ANTHROPIC_API_KEY) {
      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: env.MODEL || 'claude-haiku-4-5',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: turns
        })
      });
      if (!apiRes.ok) {
        const detail = await apiRes.text().catch(() => '');
        return new Response(JSON.stringify({ error: 'upstream', status: apiRes.status, detail: detail.slice(0, 300) }), { status: 502, headers });
      }
      const data = await apiRes.json();
      reply = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    }
    // 2) ÜCRETSİZ: Cloudflare Workers AI binding (adı ne olursa olsun).
    else {
      const ai = findAiBinding(env);
      if (!ai) {
        return new Response(JSON.stringify({ error: 'not_configured' }), { status: 500, headers });
      }
      const model = env.MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
      const out = await ai.run(model, {
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...turns],
        max_tokens: 512,
        temperature: 0.3
      });
      reply = (out && (out.response || out.result || '')).toString().trim();
    }

    return new Response(JSON.stringify({ reply: reply || 'Şu an yanıt veremedim, WhatsApp’tan yazabilirsiniz: 0553 676 91 56' }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'exception', detail: String(e).slice(0, 200) }), { status: 500, headers });
  }
}
