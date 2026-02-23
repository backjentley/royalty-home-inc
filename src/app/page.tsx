"use client";

import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

/* ─── Animation variants ─── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT_EXPO } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: "easeOut" as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: EASE_OUT_EXPO } },
};
const slideRight = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE_OUT_EXPO } },
};
const slideLeft = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE_OUT_EXPO } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };
const staggerFast = { visible: { transition: { staggerChildren: 0.06 } } };

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
    <motion.div variants={fadeIn} className="mb-10">
      <span className="inline-flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] uppercase text-cream/40">
        <span className="w-10 h-px bg-gradient-to-r from-cream/30 to-transparent" />
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
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

function StickyNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
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
      className="sticky-nav"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      {NAV_SECTIONS.map((s) => (
        <button key={s.id} onClick={() => scrollTo(s.id)} className={`nav-dot ${activeSection === s.id ? "active" : ""}`} aria-label={s.label}>
          <span className="nav-dot-inner" />
          <span className="nav-tooltip">{s.label}</span>
        </button>
      ))}
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SMART QUOTE WIDGET
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
      <p className="text-3xl mb-4">🙏</p>
      <h3 className="text-xl font-semibold text-white mb-3 font-display">Thanks for Your Interest</h3>
      <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
        Our minimum engagement for {data.type} starts at $25,000 CAD. We&apos;d recommend checking with your local home improvement centre for projects under this range.
      </p>
      <button onClick={() => { setStep(0); setRejected(false); setData({ type: "", budget: "", name: "", phone: "" }); }} className="mt-6 text-xs text-white/20 hover:text-white/40 transition-colors">Start Over</button>
    </div>
  );

  if (submitted) return (
    <div className="text-center py-12 px-6">
      <p className="text-3xl mb-4">✓</p>
      <h3 className="text-xl font-semibold text-white mb-3 font-display">We&apos;ll Be in Touch</h3>
      <p className="text-white/40 text-sm max-w-sm mx-auto">Ragu will personally review your project details and reach out within 24 hours.</p>
    </div>
  );

  return (
    <div className="py-8 px-6 md:px-8">
      <div className="flex items-center gap-2 mb-8">
        {[0, 1, 2].map((s) => <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-cream" : "bg-white/10"}`} />)}
      </div>

      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30 mb-4">Step 1 — Project Type</p>
          <div className="grid grid-cols-2 gap-3">
            {types.map((t) => (
              <button key={t} onClick={() => { setData({ ...data, type: t }); setStep(1); }}
                className="p-4 rounded-2xl border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03] transition-all text-left text-sm font-medium text-white/60 hover:text-white/90">
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30 mb-1">Step 2 — Budget Range</p>
          <p className="text-xs text-white/20 mb-4">For: {data.type}</p>
          <div className="space-y-2">
            {budgets.map((b) => (
              <button key={b.label} onClick={() => { setData({ ...data, budget: b.label }); b.ok ? setStep(2) : setRejected(true); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03] transition-all text-left text-sm font-medium text-white/60 hover:text-white/90">
                {b.label}
                <span className="text-white/15">→</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30 mb-1">Step 3 — Contact Details</p>
          <p className="text-xs text-white/20 mb-6">{data.type} · {data.budget}</p>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cream/30 transition-all" />
            <input type="tel" placeholder="Phone Number" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cream/30 transition-all" />
            <button onClick={() => setSubmitted(true)} disabled={!data.name || !data.phone}
              className="w-full py-4 bg-cream text-charcoal font-bold rounded-xl text-sm hover:bg-cream-light transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Request Callback
            </button>
          </div>
        </motion.div>
      )}
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
  const y = useTransform(scrollYProgress, [0, 0.7], [0, 120]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  return (
    <section id="hero" ref={ref} className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Geometric background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[700px] h-[700px] md:w-[900px] md:h-[900px]">
          <svg className="absolute inset-0 w-full h-full animate-rotate-slow opacity-[0.04]" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cream" strokeDasharray="4 8" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-gradient-to-r from-transparent via-cream/[0.03] to-transparent" /></div>
          <div className="absolute inset-0 flex items-center justify-center"><div className="h-full w-px bg-gradient-to-b from-transparent via-cream/[0.03] to-transparent" /></div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[600px] h-[600px] bg-cream/[0.015] rounded-full blur-[200px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-cream/[0.01] rounded-full blur-[180px]" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream/10 to-transparent" />

      <motion.div style={{ opacity, y, scale }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <Image src="/images/logo.png" alt="Royalty Home Inc." width={48} height={48} className="rounded-full" />
          <span className="text-cream/30 text-[10px] tracking-[0.4em] uppercase font-mono">Royalty Home Inc.</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: EASE_OUT_EXPO }}
          className="mb-10"
        >
          <span className="block heading-hero text-7xl md:text-[8.5rem] lg:text-[10rem] text-white">Crafted,</span>
          <span className="block heading-hero text-7xl md:text-[8.5rem] lg:text-[10rem] text-cream cream-text-glow mt-[-0.08em]">Not Copied.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: EASE_OUT_EXPO }}
          className="flex items-center justify-center gap-6 mb-10"
        >
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-white/10 text-lg font-light tracking-[0.3em] uppercase font-mono">🇨🇦</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-white/10" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.9 }}
          className="text-lg md:text-xl text-white-muted leading-relaxed max-w-lg mx-auto mb-16"
        >
          Premium residential renovations in <span className="text-cream font-semibold">Barrie & the GTA</span>.
          <br className="hidden md:block" />
          Built to a standard, not a price point.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href="#portfolio" className="group inline-flex items-center justify-center px-10 py-4.5 bg-cream text-charcoal font-semibold rounded-2xl hover:bg-cream-light transition-all duration-600 hover:shadow-[0_0_60px_rgba(245,240,232,0.15)] hover:scale-[1.02] text-[15px]">
            View Our Work
            <svg className="ml-2.5 w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </a>
          <a href="tel:6478942480" className="inline-flex items-center justify-center px-10 py-4.5 border border-white/8 text-white/45 font-medium rounded-2xl hover:border-cream/20 hover:text-cream/70 transition-all duration-600 hover:bg-cream/[0.02] text-[15px]">
            Call (647) 894-2480
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 2.5 }} className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-5 h-9 rounded-full border border-white/15 flex items-start justify-center pt-2">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} className="w-1 h-1 rounded-full bg-cream/50" />
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. PORTFOLIO — Real Instagram content
   ═══════════════════════════════════════════════════════════════ */
const PORTFOLIO = [
  { src: "/images/post-1-condo.png", title: "Condo Renovation — Toronto", detail: "12\"×24\" Calacatta marble porcelain tiles, new baseboards, doors, trims, sliding glass doors", tag: "Full Renovation" },
  { src: "/images/post-3-bathroom.png", title: "Luxury Bathroom Suite", detail: "Calacatta marble tiles, custom vanity, frameless shower enclosure, LED lighting", tag: "Custom Design" },
  { src: "/images/post-2-living.png", title: "Living Room Remodel", detail: "Premium hardwood flooring, recessed lighting, crown moulding, and full paint restoration", tag: "Transformation" },
  { src: "/images/post-5-paint.png", title: "Resale Prep — Sharon, ON", detail: "Interior painting, surface patching, light carpentry, staging-ready finishes — 2,100 sq ft", tag: "Market Ready" },
  { src: "/images/post-6-bathroom2.png", title: "Bathroom Renovation", detail: "Modern white tile, custom vanity installation, plumbing fixtures, neutral colour transitions", tag: "Before & After" },
  { src: "/images/post-7-reno.png", title: "Full Living Space", detail: "End-to-end transformation — flooring, paint, lighting, trim work, and staging", tag: "Complete Remodel" },
];

function PortfolioSection() {
  return (
    <Section id="portfolio" wide>
      <SectionLabel>Our Work</SectionLabel>

      <motion.h2 variants={fadeUp} className="heading-section text-4xl md:text-6xl lg:text-7xl mb-8">
        Real projects. <br className="hidden md:block" />
        <span className="text-cream">Real craftsmanship.</span>
      </motion.h2>

      <motion.p variants={fadeUp} className="text-body max-w-2xl mb-16">
        Every image below is from our Instagram — @royaltyhomeinc. No stock photos, no renders.
        These are real homes in the GTA, finished to our standard.
      </motion.p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {PORTFOLIO.map((p, i) => (
          <motion.div
            key={i}
            variants={i % 2 === 0 ? slideRight : slideLeft}
            className="group"
          >
            <div className="portfolio-image aspect-[4/3] relative rounded-2xl overflow-hidden mb-4">
              <Image src={p.src} alt={p.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 z-10">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-cream/60">{p.tag}</span>
              </div>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">{p.title}</h3>
            <p className="text-sm text-white-dim leading-relaxed">{p.detail}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeIn} className="mt-12 text-center">
        <a href="https://www.instagram.com/royaltyhomeinc/" target="_blank" rel="noopener noreferrer" className="glass-card inline-flex items-center gap-3 px-6 py-3 !rounded-full text-sm text-white/40 hover:text-white/70 transition-colors">
          📸 See more on Instagram @royaltyhomeinc
        </a>
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. SERVICES
   ═══════════════════════════════════════════════════════════════ */
function ServicesSection() {
  const services = [
    { name: "Kitchen Renovations", status: "PREMIUM", detail: "Custom cabinetry, marble countertops, appliance integration, full layout reconfigurations", variant: "cream" as const },
    { name: "Bathroom Renovations", status: "SPECIALTY", detail: "Shower-tub conversions, radiant floor heating, bamboo vanities, Carrara marble, LED lighting", variant: "cream" as const },
    { name: "Flooring", status: "ALL TYPES", detail: "Premium hardwood, hickory laminate, large-format porcelain tile, herringbone, wide plank", variant: "cream" as const },
    { name: "Painting", status: "INTERIOR", detail: "Full interior painting, surface patching, sanding, neutral tones for resale or personal preference", variant: "cream" as const },
    { name: "Lighting & Electrical", status: "MODERN", detail: "Recessed LED, pendant installation, electrical supply relocation, voice-activated controls", variant: "cream" as const },
    { name: "Full Condo Remodels", status: "END-TO-END", detail: "Complete gut renovations — flooring, walls, plumbing, electrical, and finishing", variant: "cream" as const },
  ];

  return (
    <Section id="services">
      <SectionLabel>Services</SectionLabel>
      <motion.h2 variants={fadeUp} className="heading-section text-4xl md:text-6xl lg:text-7xl mb-8">
        Every detail <br className="hidden md:block" />
        <span className="text-cream">matters.</span>
      </motion.h2>

      <motion.p variants={fadeUp} className="text-body max-w-2xl mb-16">
        From a single room to a full condo gut — every project gets the same level of precision.
        We don&apos;t cut corners. That&apos;s why our clients keep coming back.
      </motion.p>

      <motion.div variants={staggerFast} className="space-y-3">
        {services.map((s, i) => (
          <motion.div key={s.name} variants={i % 2 === 0 ? slideRight : slideLeft} className="glass-card p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-cream shrink-0" style={{ boxShadow: "0 0 10px rgba(245,240,232,0.3)" }} />
              <div className="min-w-0">
                <p className="font-semibold text-white text-[15px]">{s.name}</p>
                <p className="text-sm text-white-dim mt-0.5">{s.detail}</p>
              </div>
            </div>
            <span className="badge-status text-cream bg-cream/[0.08] shrink-0 self-start md:self-center">{s.status}</span>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PROCESS
   ═══════════════════════════════════════════════════════════════ */
function ProcessSection() {
  const steps = [
    { phase: "01", title: "Call", description: "Reach out for a free, no-obligation consultation. Tell us what you're envisioning." },
    { phase: "02", title: "Walk-Through", description: "We visit the space, take measurements, and discuss materials, timeline and budget face-to-face." },
    { phase: "03", title: "Proposal in 48hrs", description: "You receive a detailed, transparent proposal — every cost itemized. No hidden fees, no surprises." },
    { phase: "04", title: "Build", description: "We execute with precision. Regular updates, clean job sites, and zero compromise on quality." },
  ];

  return (
    <Section id="process" className="cream-glow-bg">
      <SectionLabel>How It Works</SectionLabel>
      <motion.h2 variants={fadeUp} className="heading-section text-4xl md:text-6xl lg:text-7xl mb-16">
        Simple. Transparent. <span className="text-cream">Fast.</span>
      </motion.h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 relative z-[1]">
        {steps.map((s, i) => (
          <motion.div key={i} variants={fadeUp} className="glass-card p-7 md:p-8 group hover:!border-cream/10">
            <span className="text-cream/15 font-bold text-4xl block mb-4 font-display">{s.phase}</span>
            <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
            <p className="text-sm text-white-dim leading-relaxed">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. STATS
   ═══════════════════════════════════════════════════════════════ */
function StatsSection() {
  const stats = [
    { value: 10, prefix: "", suffix: "+", label: "Years\nexperience", color: "text-cream" },
    { value: 100, prefix: "", suffix: "%", label: "Referral\nbased", color: "text-cream" },
    { value: 5.0, prefix: "", suffix: "★", label: "Average\nrating", color: "text-cream" },
    { value: 50, prefix: "$", suffix: "K+", label: "Avg. project\nvalue", color: "text-cream" },
  ];

  return (
    <Section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((s, i) => (
          <motion.div key={i} variants={fadeUp} className="glass-card p-7 md:p-9 text-center group hover:!border-cream/10">
            <p className={`stat-value text-4xl md:text-5xl font-semibold ${s.color} cream-text-glow mb-4`}>
              <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="text-[13px] text-white-dim leading-snug whitespace-pre-line">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. SMART QUOTE
   ═══════════════════════════════════════════════════════════════ */
function QuoteSection() {
  return (
    <Section id="quote">
      <SectionLabel>Instant Qualification</SectionLabel>
      <motion.h2 variants={fadeUp} className="heading-section text-4xl md:text-6xl lg:text-7xl mb-8">
        Get a quick <span className="text-cream">estimate.</span>
      </motion.h2>
      <motion.p variants={fadeUp} className="text-body max-w-2xl mb-12">
        Tell us about your project and we&apos;ll let you know right away if we&apos;re a good fit.
        No sales pitch — just a straight answer.
      </motion.p>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start relative z-[1]">
        <motion.div variants={fadeUp} className="space-y-6">
          {[
            "Takes 30 seconds",
            "No obligation",
            "Personal callback from Ragu within 24hrs",
            "Under $25K? We'll tell you upfront.",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-cream/30 shrink-0" />
              <p className="text-sm text-white/50">{item}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={scaleIn} className="glass-featured cream-border-pulse">
          <SmartQuoteWidget />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. ABOUT
   ═══════════════════════════════════════════════════════════════ */
function AboutSection() {
  return (
    <Section id="about" className="cream-glow-bg">
      <div className="text-center max-w-3xl mx-auto">
        <SectionLabel>About Us</SectionLabel>
        <motion.h2 variants={fadeUp} className="heading-section text-3xl md:text-5xl lg:text-6xl mb-8 md:mb-12">
          Built on <span className="text-cream">reputation</span>,
          <br />not advertising.
        </motion.h2>

        <motion.div variants={stagger} className="space-y-6 md:space-y-8 text-base md:text-lg text-white/50 leading-relaxed max-w-3xl mx-auto px-4">
          <motion.p variants={fadeUp}>
            For over a decade, Royalty Home Inc. has served the Barrie and Greater Toronto Area
            through <strong className="text-white/80">word-of-mouth and realtor referrals</strong>. We don&apos;t chase clients — our work does.
          </motion.p>
          <motion.p variants={fadeUp}>
            Every project is held to the same standard: <strong className="text-cream">premium materials</strong>,
            meticulous craftsmanship, and a result that speaks for itself.
            We don&apos;t run ads. We don&apos;t need to.
          </motion.p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center gap-2 text-sm text-white/20">
          <span>📍</span> Barrie, Ontario — Serving the Greater Toronto Area
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. CONTACT / CTA
   ═══════════════════════════════════════════════════════════════ */
function ContactSection() {
  return (
    <Section id="contact">
      <div className="text-center mb-12 md:mb-20">
        <SectionLabel>Get in Touch</SectionLabel>
        <motion.h2 variants={fadeUp} className="heading-section text-3xl md:text-6xl lg:text-7xl">
          Ready to <span className="text-cream">start?</span>
        </motion.h2>
      </div>

      <motion.div variants={fadeUp} className="glass-featured p-8 md:p-12 relative z-[1]">
        <div className="text-center">
          <a href="tel:6478942480" className="inline-flex items-center gap-3 text-4xl md:text-5xl font-bold text-cream cream-text-glow font-display hover:opacity-80 transition-opacity">
            (647) 894-2480
          </a>
          <p className="text-white/30 text-sm mt-4 mb-8">Call for a free, no-obligation estimate</p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center text-[13px] text-white/25">
            <span>📧 marketing@royaltyhomeinc.com</span>
            <a href="https://www.instagram.com/royaltyhomeinc/" target="_blank" rel="noopener noreferrer" className="hover:text-cream/60 transition-colors">
              📸 @royaltyhomeinc
            </a>
          </div>
        </div>
      </motion.div>

      {/* Footer sign-off */}
      <motion.div variants={fadeUp} className="text-center pt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent mb-16" />
        <p className="text-white/10 text-[10px] tracking-[0.3em] uppercase mb-6">Proudly Canadian 🇨🇦</p>
        <div className="flex items-center justify-center gap-3">
          <Image src="/images/logo.png" alt="Royalty Home Inc." width={28} height={28} className="rounded-full opacity-30" />
          <p className="text-sm text-white/20">Royalty Home Inc. — Barrie & GTA</p>
        </div>
        <div className="mt-8 inline-flex items-center gap-3 glass-card px-5 py-2.5 !rounded-full">
          <div className="w-2 h-2 rounded-full bg-cream/30 animate-pulse" />
          <p className="text-[10px] text-white/15">Built by <span className="text-cream/40 font-medium">Summit</span></p>
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
    <main className="min-h-screen bg-charcoal overflow-x-hidden">
      <LocalBusinessSchema />
      <StickyNav />
      <Hero />
      <PortfolioSection />
      <ServicesSection />
      <StatsSection />
      <ProcessSection />
      <QuoteSection />
      <AboutSection />
      <ContactSection />

      {/* Mobile Sticky CTA */}
      <div className="mobile-cta">
        <a href="tel:6478942480" className="flex items-center justify-center gap-2 w-full py-3 bg-cream text-charcoal font-bold rounded-xl text-sm">
          📞 Call for an Estimate — (647) 894-2480
        </a>
      </div>
    </main>
  );
}
