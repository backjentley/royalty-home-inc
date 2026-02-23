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
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-nav rounded-full px-2 py-2 flex items-center gap-1 shadow-sm"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      {NAV_SECTIONS.map((s) => (
        <button 
          key={s.id} 
          onClick={() => scrollTo(s.id)} 
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeSection === s.id ? "bg-charcoal text-white shadow-sm" : "text-smoke hover:bg-black/5"
          }`}
        >
          {s.label}
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
      <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">🙏</span>
      </div>
      <h3 className="text-xl font-semibold text-charcoal mb-3">Thanks for Your Interest</h3>
      <p className="text-smoke text-sm max-w-sm mx-auto leading-relaxed">
        Our minimum engagement for {data.type} starts at $25,000 CAD. We recommend checking with your local home improvement centre for projects under this range.
      </p>
      <button onClick={() => { setStep(0); setRejected(false); setData({ type: "", budget: "", name: "", phone: "" }); }} className="mt-8 text-sm text-smoke hover:text-charcoal transition-colors font-medium">Start Over</button>
    </div>
  );

  if (submitted) return (
    <div className="text-center py-12 px-6 bg-charcoal text-white rounded-3xl">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">✓</span>
      </div>
      <h3 className="text-xl font-semibold mb-3">We'll Be in Touch</h3>
      <p className="text-white/70 text-sm max-w-sm mx-auto">Ragu will personally review your project details and reach out within 24 hours.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.04] p-6 md:p-8">
      <div className="flex items-center gap-2 mb-8">
        {[0, 1, 2].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-charcoal" : "bg-black/5"}`} />)}
      </div>

      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs font-semibold tracking-wider uppercase text-smoke mb-4">Step 1 — Project Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {types.map((t) => (
              <button key={t} onClick={() => { setData({ ...data, type: t }); setStep(1); }}
                className="p-4 rounded-2xl border border-black/5 bg-ivory hover:border-black/15 hover:bg-white transition-all text-left text-sm font-medium text-charcoal-elevated hover:text-charcoal shadow-sm hover:shadow-md">
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-end mb-4">
            <p className="text-xs font-semibold tracking-wider uppercase text-smoke">Step 2 — Budget Range</p>
            <button onClick={() => setStep(0)} className="text-xs text-blue-accent font-medium hover:underline">Edit Type</button>
          </div>
          <p className="text-sm text-charcoal font-medium mb-4 pb-4 border-b border-black/5">{data.type}</p>
          <div className="space-y-2">
            {budgets.map((b) => (
              <button key={b.label} onClick={() => { setData({ ...data, budget: b.label }); b.ok ? setStep(2) : setRejected(true); }}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-black/5 bg-ivory hover:border-black/15 hover:bg-white transition-all text-left text-sm font-medium text-charcoal-elevated hover:text-charcoal shadow-sm">
                {b.label}
                <span className="text-smoke">→</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-end mb-4">
            <p className="text-xs font-semibold tracking-wider uppercase text-smoke">Step 3 — Contact Details</p>
            <button onClick={() => setStep(1)} className="text-xs text-blue-accent font-medium hover:underline">Edit Budget</button>
          </div>
          <p className="text-sm text-charcoal font-medium mb-6 pb-4 border-b border-black/5">{data.type} · {data.budget}</p>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-ivory border border-black/5 text-sm text-charcoal placeholder:text-smoke focus:outline-none focus:border-charcoal/20 focus:ring-1 focus:ring-charcoal/20 transition-all shadow-inner" />
            <input type="tel" placeholder="Phone Number" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-ivory border border-black/5 text-sm text-charcoal placeholder:text-smoke focus:outline-none focus:border-charcoal/20 focus:ring-1 focus:ring-charcoal/20 transition-all shadow-inner" />
            <button onClick={() => setSubmitted(true)} disabled={!data.name || !data.phone}
              className="w-full py-4 mt-2 btn-primary disabled:opacity-30 disabled:cursor-not-allowed">
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
  const y = useTransform(scrollYProgress, [0, 0.7], [0, 80]);

  return (
    <section id="hero" ref={ref} className="relative min-h-[90dvh] pt-32 pb-16 flex flex-col justify-center overflow-hidden">
      <motion.div style={{ opacity, y }} className="relative z-10 px-6 max-w-5xl mx-auto w-full">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-10 flex items-center justify-center md:justify-start gap-4">
          <Image src="/images/logo.png" alt="Royalty Home Inc." width={56} height={56} className="rounded-2xl shadow-sm border border-black/5" />
          <div className="flex flex-col">
            <span className="text-charcoal font-semibold text-lg tracking-tight">Royalty Home Inc.</span>
            <span className="text-smoke text-sm">Barrie & The GTA</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.2 }} className="mb-8 text-center md:text-left">
          <span className="block heading-hero text-6xl md:text-8xl lg:text-[7.5rem] tracking-tighter text-charcoal">Crafted,</span>
          <span className="block heading-hero text-6xl md:text-8xl lg:text-[7.5rem] tracking-tighter text-smoke mt-1">Not Copied.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg md:text-xl text-smoke max-w-2xl mb-12 text-center md:text-left leading-relaxed">
          Premium residential renovations built to a standard, not a price point. Proudly Canadian.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <a href="#portfolio" className="btn-primary px-8 py-4 text-base">
            View Our Work
          </a>
          <a href="#quote" className="btn-secondary px-8 py-4 text-base">
            Get an Estimate
          </a>
        </motion.div>
      </motion.div>

      {/* Full width hero image container below the text */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.8, ease: EASE_OUT_EXPO }}
        className="mt-16 md:mt-24 px-4 md:px-8 w-full max-w-7xl mx-auto"
      >
        <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-black/5">
          <Image src="/images/post-1-condo.png" alt="Premium Kitchen Renovation" fill className="object-cover" priority />
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. PORTFOLIO — Real Instagram content (Bento Grid)
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
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <SectionLabel>Our Work</SectionLabel>
          <motion.h2 variants={fadeUp} className="heading-section text-4xl md:text-5xl lg:text-6xl text-charcoal">
            Real projects.
          </motion.h2>
        </div>
        <motion.p variants={fadeUp} className="text-body max-w-md mt-6 md:mt-0 md:text-right">
          Every image is from our Instagram. No stock photos, no renders. Real homes in the GTA, finished to our standard.
        </motion.p>
      </div>

      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[300px]">
        {PORTFOLIO.map((p, i) => (
          <motion.div key={i} variants={scaleIn} className={`group relative rounded-3xl overflow-hidden border border-black/5 shadow-sm ${p.span}`}>
            <Image src={p.src} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-80 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 z-10">
              <h3 className="text-lg font-semibold text-white mb-1">{p.title}</h3>
              <p className="text-sm text-white/80">{p.detail}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeIn} className="mt-12 flex justify-center">
        <a href="https://www.instagram.com/royaltyhomeinc/" target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-3 text-sm">
          See more on Instagram @royaltyhomeinc
        </a>
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. PROCESS (Bento Grid)
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
      <motion.h2 variants={fadeUp} className="heading-section text-4xl md:text-5xl lg:text-6xl mb-12 text-charcoal">
        Simple. Transparent. Fast.
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {steps.map((s, i) => (
          <motion.div key={i} variants={fadeUp} className="bento-card p-8 flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl font-light text-smoke/30">{s.phase}</span>
              <span className="material-symbols-outlined text-charcoal/20 text-3xl">{s.icon}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">{s.title}</h3>
              <p className="text-smoke leading-relaxed">{s.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. STATS
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
          <motion.div key={i} variants={fadeUp} className="bg-white rounded-3xl p-8 text-center border border-black/5 shadow-sm">
            <p className="stat-value text-4xl md:text-5xl text-charcoal mb-3">
              <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="text-sm text-smoke font-medium uppercase tracking-wider whitespace-pre-line">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. SMART QUOTE
   ═══════════════════════════════════════════════════════════════ */
function QuoteSection() {
  return (
    <Section id="quote" className="bg-pearl-mist/50">
      <div className="max-w-5xl mx-auto">
        <SectionLabel>Instant Qualification</SectionLabel>
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div variants={fadeUp}>
            <h2 className="heading-section text-4xl md:text-5xl lg:text-6xl mb-6 text-charcoal">
              Get a quick estimate.
            </h2>
            <p className="text-body mb-8">
              Tell us about your project and we'll let you know right away if we're a good fit. No sales pitch — just a straight answer.
            </p>
            <div className="space-y-4">
              {[
                "Takes 30 seconds",
                "No obligation",
                "Personal callback from Ragu within 24hrs",
                "Under $25K? We'll tell you upfront.",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-accent text-sm">check_circle</span>
                  <p className="text-charcoal font-medium text-sm">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={scaleIn} className="w-full max-w-md mx-auto relative relative z-[1]">
             {/* Decorative background blur to make the widget pop */}
             <div className="absolute -inset-4 bg-white rounded-[40px] blur-2xl opacity-50 z-[-1]" />
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
    <Section id="contact">
      <div className="bento-card p-10 md:p-16 text-center max-w-4xl mx-auto bg-charcoal text-white rounded-[40px] shadow-2xl overflow-hidden relative">
        {/* Subtle texture inside the dark card */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
        
        <SectionLabel><span className="text-white/80 border-white/20">About Us</span></SectionLabel>
        
        <motion.h2 variants={fadeUp} className="heading-section text-3xl md:text-5xl lg:text-6xl mb-8">
          Built on reputation, not advertising.
        </motion.h2>

        <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-2xl mx-auto mb-16 leading-relaxed">
          For over a decade, Royalty Home Inc. has served Barrie and the GTA through word-of-mouth and realtor referrals. 
          Every project is held to the same standard: premium materials and meticulous craftsmanship.
        </motion.p>
        
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-6 pt-10 border-t border-white/10">
          <p className="text-sm text-white/40 uppercase tracking-widest font-semibold">Ready to start?</p>
          <a href="tel:6478942480" className="text-4xl md:text-5xl font-bold tracking-tight hover:text-white/80 transition-colors">
            (647) 894-2480
          </a>
          <div className="flex gap-6 text-sm text-white/50 mt-4">
            <span>marketing@royaltyhomeinc.com</span>
            <a href="https://www.instagram.com/royaltyhomeinc/" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeIn} className="text-center pt-20 pb-8">
        <p className="text-smoke text-[10px] tracking-widest uppercase mb-6 font-semibold">Proudly Canadian 🇨🇦</p>
        <div className="flex items-center justify-center gap-2">
          <Image src="/images/logo.png" alt="Royalty Home Inc." width={24} height={24} className="rounded-full grayscale border border-black/10" />
          <p className="text-sm text-smoke font-medium">Royalty Home Inc. — Barrie & GTA</p>
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
    <main className="min-h-screen selection:bg-black/10 selection:text-charcoal bg-ivory">
      <LocalBusinessSchema />
      <StickyNav />
      <Hero />
      <PortfolioSection />
      <ProcessSection />
      <StatsSection />
      <QuoteSection />
      <ContactSection />

      {/* Mobile Sticky CTA */}
      <div className="mobile-cta">
        <a href="tel:6478942480" className="flex items-center justify-center gap-2 w-full py-3.5 bg-charcoal text-white font-medium rounded-xl text-sm shadow-md">
          <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
          Call for an Estimate
        </a>
      </div>
    </main>
  );
}
