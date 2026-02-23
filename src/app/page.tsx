"use client";

import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

/* ─── Animation variants ─── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT_EXPO } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: "easeOut" as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

/* ─── Animated counter ─── */
function AnimatedCounter({ value, prefix = "", suffix = "", duration = 2 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: EASE_OUT_EXPO,
        onUpdate: (v) => {
          if (value >= 1000) setDisplayValue(Math.round(v).toLocaleString());
          else if (value < 10) setDisplayValue(v.toFixed(1));
          else setDisplayValue(Math.round(v).toString());
        },
      });
      return controls.stop;
    }
  }, [isInView, motionValue, value, duration]);

  return <span ref={ref}>{prefix}{displayValue}{suffix}</span>;
}

/* ─── Reusable section ─── */
function Section({ children, className = "", id, wide = false }: { children: React.ReactNode; className?: string; id?: string; wide?: boolean }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger}
      className={`relative px-6 md:px-12 py-16 md:py-24 ${wide ? "max-w-7xl" : "max-w-5xl"} mx-auto ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeIn} className="mb-8 flex justify-center md:justify-start">
      <span className="badge-minimal">
        {children}
      </span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STICKY NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
const NAV_SECTIONS = [
  { id: "hero", label: "Top" },
  { id: "portfolio", label: "Work" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "quote", label: "Estimate" },
];

function StickyNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5);
      const sections = NAV_SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return { id: s.id, top: Infinity };
        return { id: s.id, top: Math.abs(el.getBoundingClientRect().top) };
      });
      setActiveSection(sections.reduce((a, b) => (a.top < b.top ? a : b)).id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-nav rounded-full px-2 py-2 flex items-center gap-1 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      {NAV_SECTIONS.map((s) => (
        <button 
          key={s.id} 
          onClick={() => scrollTo(s.id)} 
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeSection === s.id ? "bg-white text-[#0A0A0A] shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {s.label}
        </button>
      ))}
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SMART QUOTE WIDGET (SaaS Tier Dark)
   ═══════════════════════════════════════════════════════════════ */
function SmartQuoteWidget() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ type: "", budget: "", name: "", phone: "" });
  const [rejected, setRejected] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const types = ["Kitchen Renovation", "Bathroom Renovation", "Flooring", "Painting", "Full Condo Remodel", "Lighting / Electrical"];
  const budgets = [
    { label: "Under $10,000", ok: false },
    { label: "$10,000 – $25,000", ok: false },
    { label: "$25,000 – $50,000", ok: true },
    { label: "$50,000 – $100,000", ok: true },
    { label: "$100,000+", ok: true },
  ];

  if (rejected) return (
    <div className="text-center py-12 px-6">
      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        <span className="text-2xl">🙏</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Thanks for Your Interest</h3>
      <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
        Our minimum engagement for {data.type} starts at $25,000 CAD. We recommend checking with your local home improvement centre for projects under this range.
      </p>
      <button onClick={() => { setStep(0); setRejected(false); setData({ type: "", budget: "", name: "", phone: "" }); }} className="mt-8 text-sm text-zinc-500 hover:text-white transition-colors font-medium underline underline-offset-4">Start Over</button>
    </div>
  );

  if (submitted) return (
    <div className="text-center py-12 px-6 bg-white/5 border border-white/10 text-white rounded-[24px] shadow-[0_0_40px_rgba(255,255,255,0.05)]">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        <span className="text-2xl text-white">✓</span>
      </div>
      <h3 className="text-xl font-semibold mb-3 tracking-tight">We'll Be in Touch</h3>
      <p className="text-zinc-400 text-sm max-w-sm mx-auto">Ragu will personally review your project details and reach out within 24 hours.</p>
    </div>
  );

  return (
    <div className="glass-panel p-6 md:p-8">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-[24px]" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-8">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-out ${s <= step ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-white/10"}`} />
          ))}
        </div>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500 mb-4">Step 1 — Project Type</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {types.map((t) => (
                <button key={t} onClick={() => { setData({ ...data, type: t }); setStep(1); }}
                  className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left text-sm font-medium text-zinc-300 hover:text-white shadow-sm">
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex justify-between items-end mb-4">
              <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500">Step 2 — Budget Range</p>
              <button onClick={() => setStep(0)} className="text-xs text-zinc-400 font-medium hover:text-white transition-colors">Edit Type</button>
            </div>
            <p className="text-sm text-white font-medium mb-4 pb-4 border-b border-white/10">{data.type}</p>
            <div className="space-y-2">
              {budgets.map((b) => (
                <button key={b.label} onClick={() => { setData({ ...data, budget: b.label }); b.ok ? setStep(2) : setRejected(true); }}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left text-sm font-medium text-zinc-300 hover:text-white shadow-sm">
                  {b.label}
                  <span className="text-zinc-500 group-hover:text-white transition-colors">→</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex justify-between items-end mb-4">
              <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500">Step 3 — Contact Details</p>
              <button onClick={() => setStep(1)} className="text-xs text-zinc-400 font-medium hover:text-white transition-colors">Edit Budget</button>
            </div>
            <p className="text-sm text-white font-medium mb-6 pb-4 border-b border-white/10">{data.type} <span className="text-zinc-600 mx-2">/</span> {data.budget}</p>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner" />
              <input type="tel" placeholder="Phone Number" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner" />
              <button onClick={() => setSubmitted(true)} disabled={!data.name || !data.phone}
                className="w-full py-4 mt-2 btn-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm">
                Request Callback
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STRUCTURED DATA
   ═══════════════════════════════════════════════════════════════ */
function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: "Royalty Home Inc.",
    description: "Premium residential renovations in Barrie and the Greater Toronto Area.",
    telephone: "+16478942480",
    email: "marketing@royaltyhomeinc.com",
    address: { "@type": "PostalAddress", addressLocality: "Barrie", addressRegion: "ON", addressCountry: "CA" },
    areaServed: [{ "@type": "City", name: "Barrie" }, { "@type": "City", name: "Toronto" }, { "@type": "AdministrativeArea", name: "Greater Toronto Area" }],
    sameAs: ["https://www.instagram.com/royaltyhomeinc/"],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: "28" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

/* ═══════════════════════════════════════════════════════════════
   1. HERO
   ═══════════════════════════════════════════════════════════════ */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.7], [0, 80]);
  const filter = useTransform(scrollYProgress, [0, 0.7], ["blur(0px)", "blur(10px)"]);

  return (
    <section id="hero" ref={ref} className="relative min-h-screen pt-32 pb-16 flex flex-col justify-center overflow-hidden">
      {/* Immersive Dark Gradient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div style={{ opacity, y, filter }} className="relative z-10 px-6 max-w-5xl mx-auto w-full">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-10 flex items-center justify-center md:justify-start gap-4">
          <div className="p-1 rounded-2xl bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <Image src="/images/logo.png" alt="Royalty Home Inc." width={48} height={48} className="rounded-xl" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-lg tracking-tight">Royalty Home Inc.</span>
            <span className="text-zinc-500 text-sm">Barrie & The GTA</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.2 }} className="mb-8 text-center md:text-left drop-shadow-2xl">
          <span className="block heading-hero text-6xl md:text-8xl lg:text-[7.5rem] tracking-tighter text-white">Crafted,</span>
          <span className="block heading-hero text-6xl md:text-8xl lg:text-[7.5rem] tracking-tighter text-zinc-500 mt-1">Not Copied.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 text-center md:text-left leading-relaxed">
          Premium residential renovations built to a standard, not a price point. Proudly Canadian.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <a href="#portfolio" className="btn-primary px-8 py-4 text-sm uppercase tracking-wider">
            View Our Work
          </a>
          <a href="#quote" className="btn-secondary px-8 py-4 text-sm uppercase tracking-wider backdrop-blur-md">
            Get an Estimate
          </a>
        </motion.div>
      </motion.div>

      {/* Full width hero image container below the text */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.4, delay: 0.8, ease: EASE_OUT_EXPO }}
        className="relative mt-16 md:mt-24 px-4 md:px-8 w-full max-w-7xl mx-auto z-10"
      >
        <div className="relative w-full aspect-[21/9] rounded-[32px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10 opacity-60" />
          <Image src="/images/post-1-condo.png" alt="Premium Kitchen Renovation" fill className="object-cover" priority />
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. PORTFOLIO — Framed Instagram Glass Masonry
   ═══════════════════════════════════════════════════════════════ */
const PORTFOLIO = [
  { src: "/images/post-7-reno.png", title: "Full Living Space", detail: "End-to-end transformation.", span: "md:col-span-2 md:row-span-2", aspect: "aspect-[4/3] md:aspect-auto h-full" },
  { src: "/images/post-3-bathroom.png", title: "Luxury Suite", detail: "Calacatta marble tiles.", span: "md:col-span-1 md:row-span-1", aspect: "aspect-square" },
  { src: "/images/post-2-living.png", title: "Living Room Remodel", detail: "Premium hardwood flooring.", span: "md:col-span-1 md:row-span-1", aspect: "aspect-square" },
  { src: "/images/post-5-paint.png", title: "Resale Prep", detail: "Interior styling & prep.", span: "md:col-span-1 md:row-span-1", aspect: "aspect-square" },
  { src: "/images/post-6-bathroom2.png", title: "Bathroom Reno", detail: "Modern white tile.", span: "md:col-span-1 md:row-span-1", aspect: "aspect-square" },
  { src: "/images/post-1-condo.png", title: "Condo Renovation", detail: "12\"×24\" porcelain tiles.", span: "md:col-span-2 md:row-span-1", aspect: "aspect-[2/1] md:aspect-auto h-full" },
];

function PortfolioSection() {
  return (
    <Section id="portfolio" wide>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 px-4">
        <div>
          <SectionLabel>Our Work</SectionLabel>
          <motion.h2 variants={fadeUp} className="heading-section text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-lg">
            Real projects.
          </motion.h2>
        </div>
        <motion.p variants={fadeUp} className="text-zinc-400 max-w-md mt-6 md:mt-0 md:text-right text-lg">
          Every image is from our Instagram. No renders, no stock. Real homes in the GTA finished to the Summit Standard.
        </motion.p>
      </div>

      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[320px]">
        {PORTFOLIO.map((p, i) => (
          <motion.div key={i} variants={scaleIn} className={`group portfolio-image ${p.span}`}>
            <Image src={p.src} alt={p.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 z-10 pointer-events-none">
              <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">{p.title}</h3>
              <p className="text-sm text-zinc-300 font-medium">{p.detail}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeIn} className="mt-16 flex justify-center">
        <a href="https://www.instagram.com/royaltyhomeinc/" target="_blank" rel="noopener noreferrer" className="btn-secondary px-8 py-4 text-sm uppercase tracking-wider backdrop-blur-md">
          See more on Instagram @royaltyhomeinc
        </a>
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. PROCESS (Dark Bento Cards)
   ═══════════════════════════════════════════════════════════════ */
function ProcessSection() {
  const steps = [
    { phase: "01", title: "Call", description: "Free, no-obligation consultation. Tell us what you're envisioning.", icon: "phone_in_talk" },
    { phase: "02", title: "Walk-Through", description: "We visit the space, take measurements, and discuss materials.", icon: "architecture" },
    { phase: "03", title: "Proposal", description: "A detailed, transparent proposal — every cost itemized.", icon: "contract" },
    { phase: "04", title: "Build", description: "Regular updates, clean job sites, and zero compromise.", icon: "construction" },
  ];

  return (
    <Section id="process">
      <SectionLabel>How It Works</SectionLabel>
      <motion.h2 variants={fadeUp} className="heading-section text-4xl md:text-5xl lg:text-6xl mb-16 text-white drop-shadow-lg">
        Simple. Transparent. Fast.
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {steps.map((s, i) => (
          <motion.div key={i} variants={fadeUp} className="bento-card p-10 flex flex-col justify-between min-h-[240px]">
            <div className="flex justify-between items-start mb-8">
              <span className="text-5xl font-light text-white/[0.05]">{s.phase}</span>
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <span className="material-symbols-outlined text-white/50 text-2xl">{s.icon}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">{s.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{s.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. STATS (Glass Panels)
   ═══════════════════════════════════════════════════════════════ */
function StatsSection() {
  const stats = [
    { value: 10, prefix: "", suffix: "+", label: "Years\nexperience" },
    { value: 100, prefix: "", suffix: "%", label: "Referral\nbased" },
    { value: 5.0, prefix: "", suffix: "★", label: "Average\nrating" },
    { value: 50, prefix: "$", suffix: "K+", label: "Avg. project\nvalue" },
  ];

  return (
    <Section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <motion.div key={i} variants={fadeUp} className="glass-panel p-8 md:p-10 text-center flex flex-col items-center justify-center min-h-[200px]">
            <p className="stat-value text-4xl md:text-5xl lg:text-6xl text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest whitespace-pre-line">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. SMART QUOTE (Dark Glowing Widget)
   ═══════════════════════════════════════════════════════════════ */
function QuoteSection() {
  return (
    <Section id="quote" className="relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[800px] h-[400px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <SectionLabel>Instant Qualification</SectionLabel>
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div variants={fadeUp}>
            <h2 className="heading-section text-4xl md:text-5xl lg:text-6xl mb-8 text-white drop-shadow-lg">
              Get a quick estimate.
            </h2>
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed font-light">
              Tell us about your project and we'll let you know right away if we're a good fit. No sales pitch — just straight answers.
            </p>
            <div className="space-y-6">
              {[
                "Takes 30 seconds",
                "No obligation",
                "Personal callback from Ragu within 24hrs",
                "Under $25K? We'll tell you upfront.",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-white/80 text-xl border border-white/20 rounded-full p-1 bg-white/5 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">check</span>
                  <p className="text-zinc-300 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={scaleIn} className="w-full relative z-[1]">
             {/* Premium glowing backdrop for the widget */}
             <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-br from-white/10 to-transparent blur-2xl opacity-50 z-[-1] rounded-[40px]" />
             <SmartQuoteWidget />
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. ABOUT & CONTACT
   ═══════════════════════════════════════════════════════════════ */
function ContactSection() {
  return (
    <Section id="contact" className="pb-32">
      <div className="glass-panel p-10 md:p-20 text-center max-w-5xl mx-auto bg-[#0A0A0A]/80 border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
        
        <SectionLabel><span className="text-zinc-400 border-white/10">About Us</span></SectionLabel>
        
        <motion.h2 variants={fadeUp} className="heading-section text-4xl md:text-5xl lg:text-7xl mb-10 text-white drop-shadow-lg">
          Built on reputation, not advertising.
        </motion.h2>

        <motion.p variants={fadeUp} className="text-zinc-400 text-xl max-w-3xl mx-auto mb-16 leading-relaxed font-light">
          For over a decade, Royalty Home Inc. has served Barrie and the GTA through word-of-mouth and realtor referrals. 
          Every project is held to the same standard: premium materials and meticulous craftsmanship.
        </motion.p>
        
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-8 pt-12 border-t border-white/10">
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold">Ready to start?</p>
          <a href="tel:6478942480" className="text-5xl md:text-7xl font-bold tracking-tighter text-white hover:text-white/80 transition-colors drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            (647) 894-2480
          </a>
          <div className="flex gap-8 text-sm text-zinc-400 mt-4">
            <span>marketing@royaltyhomeinc.com</span>
            <a href="https://www.instagram.com/royaltyhomeinc/" className="hover:text-white transition-colors underline underline-offset-4">Instagram</a>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeIn} className="text-center pt-24 pb-8">
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-8 font-semibold">Proudly Canadian 🇨🇦</p>
        <div className="flex items-center justify-center gap-4">
          <div className="p-1 rounded-full bg-white/5 border border-white/10">
            <Image src="/images/logo.png" alt="Royalty Home Inc." width={32} height={32} className="rounded-full grayscale" />
          </div>
          <p className="text-sm text-zinc-400 font-medium">Royalty Home Inc. — Barrie & GTA</p>
        </div>
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function RoyaltyHomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/20 selection:text-white overflow-hidden">
      <LocalBusinessSchema />
      <StickyNav />
      <Hero />
      <PortfolioSection />
      <ProcessSection />
      <StatsSection />
      <QuoteSection />
      <ContactSection />

      {/* Mobile Sticky CTA - Dark Premium */}
      <div className="mobile-cta">
        <a href="tel:6478942480" className="flex items-center justify-center gap-2 w-full py-4 bg-white text-[#0A0A0A] font-semibold tracking-wide rounded-xl text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
          Call for an Estimate
        </a>
      </div>
    </main>
  );
}
