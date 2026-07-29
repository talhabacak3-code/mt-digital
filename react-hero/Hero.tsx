/**
 * Hero.tsx — İmge Dijital · Premium Dark Hero
 * -------------------------------------------------------------
 * Next.js (App Router) + Tailwind CSS + Framer Motion
 *
 * Bu bileşen, sitenin canlı (vanilla) hero'sunun React/Next karşılığıdır.
 * Amaç: yeniden kullanılabilir, temiz mimari, erişilebilir ve performanslı.
 *
 * Kurulum:
 *   npm i framer-motion
 *   tailwind.config: aşağıdaki "brand" renklerini theme.extend.colors'a ekleyin:
 *     brand:  { blue: "#1b63e3", teal: "#34b3c9" }
 *   (İsteğe bağlı) Poppins fontunu next/font ile yükleyin.
 *
 * Not: Ağır kütüphane yok. Parallax + magnetic saf React + rAF ile.
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/* ---------- İçerik (tek yerden yönetim) ---------- */
const CONTENT = {
  eyebrow: "Dijital Ajans · Afyonkarahisar",
  titleLines: ["Sadece web sitesi değil,", "markanızı büyüten @dijital deneyimler", "tasarlıyoruz."],
  sub: "Web tasarım, yazılım, SEO, yapay zeka, dijital pazarlama ve marka kimliğiyle işletmenizi bir sonraki seviyeye taşıyoruz.",
  primary: { label: "Projeni Başlat", href: "https://wa.me/905536769156?text=Merhaba,%20projemi%20ba%C5%9Flatmak%20istiyorum" },
  secondary: { label: "Çalışmaları Gör", href: "#hizmetler" },
  trust: ["★★★★★", "5+ Yıl Tecrübe", "24 Saatte Dönüş", "Ücretsiz İlk Görüşme"],
};

/* ---------- Animasyon varyantları ---------- */
const rise = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.2, 0.7, 0.3, 1] } }),
};

/* ============================================================ */
export default function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  /* Cursor glow + parallax + magnetic — rAF ile tek pass */
  const raf = useRef<number | null>(null);
  const onMove = (e: React.MouseEvent) => {
    if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
    const { clientX: mx, clientY: my } = e;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const sec = sectionRef.current!;
      const r = sec.getBoundingClientRect();
      sec.style.setProperty("--mx", `${mx - r.left}px`);
      sec.style.setProperty("--my", `${my - r.top}px`);
      const px = (mx - r.left) / r.width - 0.5;
      const py = (my - r.top) / r.height - 0.5;
      const card = visualRef.current?.querySelector<HTMLElement>("[data-depth]");
      if (card) card.style.transform = `translate(${px * 7}px, ${py * 7}px)`;
    });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      onMouseMove={onMove}
      className="group relative flex min-h-[92vh] items-center overflow-hidden bg-[#09090b] text-white"
    >
      {/* ---- arka plan katmanları ---- */}
      <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
        {/* animasyonlu grid (maske ile kenarlara doğru silinir) */}
        <div className="absolute inset-0 animate-[gridPan_40s_linear_infinite] [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(ellipse_82%_72%_at_50%_28%,#000_28%,transparent_84%)]" />
        {/* yumuşak spotlight + renkli glow'lar */}
        <div className="absolute inset-0 [background:radial-gradient(720px_520px_at_26%_16%,rgba(52,179,201,.16),transparent_60%)]" />
        <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(27,99,227,.5),transparent_70%)] blur-[80px]" />
        <div className="absolute -bottom-44 -right-28 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(52,179,201,.45),transparent_70%)] blur-[80px]" />
      </div>
      {/* cursor takip eden ışıltı */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-[1] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(circle,rgba(52,179,201,.14),transparent_60%)]"
        style={{ left: "var(--mx,50%)", top: "var(--my,30%)" }}
      />

      <div className="container relative z-[2] mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-10 px-6 py-24 lg:grid-cols-[1.05fr_.95fr]">
        {/* ---------- SOL: içerik ---------- */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.span
            custom={0} variants={rise} initial="hidden" animate="show"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] font-semibold text-slate-300 backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-brand-teal shadow-[0_0_0_0_rgba(52,179,201,.55)] motion-safe:animate-pulse" />
            {CONTENT.eyebrow}
          </motion.span>

          <h1 className="text-[clamp(31px,4.7vw,58px)] font-extrabold leading-[1.07] tracking-[-1.4px]">
            {CONTENT.titleLines.map((line, i) => (
              <motion.span key={i} custom={i} variants={rise} initial="hidden" animate="show" className="block">
                {/* "@" ile işaretli kelime = vurgulu gradyan */}
                {line.includes("@") ? (
                  <>
                    {line.split("@")[0]}
                    <span className="bg-gradient-to-r from-brand-teal to-[#6aa0ff] bg-clip-text text-transparent">
                      {line.split("@")[1]}
                    </span>
                  </>
                ) : line}
              </motion.span>
            ))}
          </h1>

          <motion.p custom={4} variants={rise} initial="hidden" animate="show" className="mt-5 max-w-[520px] text-[clamp(15px,1.5vw,18px)] leading-relaxed text-slate-400">
            {CONTENT.sub}
          </motion.p>

          <motion.div custom={5} variants={rise} initial="hidden" animate="show" className="mt-8 flex flex-wrap gap-3.5">
            <MagneticButton href={CONTENT.primary.href} reduce={!!reduce}>
              {CONTENT.primary.label}
              <ArrowIcon />
            </MagneticButton>
            <a href={CONTENT.secondary.href} className="inline-flex items-center gap-2 rounded-[14px] border border-white/15 bg-white/5 px-6 py-3.5 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10">
              {CONTENT.secondary.label}
            </a>
          </motion.div>

          <motion.div custom={6} variants={rise} initial="hidden" animate="show" className="mt-9 flex flex-wrap items-center gap-3.5 text-[13.5px] font-medium text-slate-400">
            {CONTENT.trust.map((t, i) => (
              <span key={i} className="flex items-center gap-3.5">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-white/20" />}
                <span className={i === 0 ? "tracking-[2px] text-amber-400" : ""}>{t}</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* ---------- SAĞ: premium görsel ---------- */}
        <motion.div
          ref={visualRef} aria-hidden
          initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.2, 0.7, 0.3, 1] }}
          className="relative mx-auto hidden aspect-square w-full max-w-[460px] md:block"
        >
          <div className="absolute inset-[8%] rounded-full blur-3xl [background:radial-gradient(circle_at_40%_35%,rgba(52,179,201,.35),rgba(27,99,227,.18)_45%,transparent_70%)]" />
          {/* ana panel (parallax) */}
          <div data-depth="7" className="absolute inset-x-[6%] inset-y-[14%_20%] overflow-hidden rounded-[18px] border border-white/10 bg-slate-900/60 shadow-[0_30px_70px_rgba(0,0,0,.55)] backdrop-blur-xl">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2.5 rounded-md bg-white/5 px-3 py-1 text-[11px] text-slate-400">imgedijital.com</span>
            </div>
            <div className="p-4">
              <div className="mb-3.5 h-[74px] rounded-[10px] bg-gradient-to-r from-brand-blue to-brand-teal shadow-[0_10px_26px_rgba(27,99,227,.35)]" />
              <div className="mb-3.5 grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map((i) => <div key={i} className="h-11 rounded-lg border border-white/5 bg-white/5" />)}
              </div>
              <div className="mb-2 h-2 w-[85%] rounded bg-white/10" />
              <div className="h-2 w-[60%] rounded bg-white/10" />
            </div>
          </div>
          {/* yüzen kartlar (CSS float) */}
          <FloatCard className="-right-[6%] top-[4%]" icon="/assets/icons/figma.svg" title="Tasarım" sub="Kusursuz arayüz" />
          <FloatCard className="-left-[10%] bottom-[20%] [animation-delay:1.4s]" icon="/assets/icons/googleads.svg" title="Reklam" sub="Doğru kitle" />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Alt bileşenler ---------- */
function MagneticButton({ href, reduce, children }: { href: string; reduce: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.MouseEvent) => {
    if (reduce) return;
    const r = ref.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    ref.current!.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <a
      ref={ref} href={href} target="_blank" rel="noopener" onMouseMove={move} onMouseLeave={reset}
      className="relative inline-flex items-center gap-2 overflow-hidden rounded-[14px] bg-gradient-to-r from-brand-blue to-brand-teal px-6 py-3.5 font-semibold text-white shadow-[0_12px_34px_rgba(27,99,227,.38)] transition-[box-shadow,transform] duration-300 hover:shadow-[0_18px_44px_rgba(52,179,201,.5)]"
    >
      {children}
    </a>
  );
}

function FloatCard({ className = "", icon, title, sub }: { className?: string; icon: string; title: string; sub: string }) {
  return (
    <div className={`absolute flex items-center gap-3 rounded-[18px] border border-white/10 bg-slate-900/60 px-3.5 py-3 shadow-[0_30px_70px_rgba(0,0,0,.55)] backdrop-blur-xl motion-safe:animate-[floatY_6s_ease-in-out_infinite] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" width={30} height={30} />
      <div>
        <b className="block text-[13.5px] text-white">{title}</b>
        <small className="text-[11.5px] text-slate-400">{sub}</small>
      </div>
    </div>
  );
}

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path fill="currentColor" d="M5 12h12.17l-5.58-5.59L13 5l8 8-8 8-1.41-1.41L17.17 14H5z" /></svg>
);

/*
 * tailwind.config.ts > theme.extend.keyframes / animation:
 *   keyframes: {
 *     gridPan: { to: { backgroundPosition: "54px 54px" } },
 *     floatY:  { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
 *   }
 * colors.brand = { blue: "#1b63e3", teal: "#34b3c9" }
 */
