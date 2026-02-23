"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Phone, MapPin, Instagram, Mail, Star, ArrowRight, ChevronRight,
  CheckCircle2, Paintbrush, Bath, Lamp, Home, Ruler,
  ArrowLeftRight, Send, Clock, MessageSquare
} from "lucide-react";

/* ────────────────────── ANIMATION HOOK ────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

/* ────────────────────── SMART QUOTE WIDGET ────────────────────── */
function SmartQuoteWidget() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ type: "", budget: "", name: "", phone: "" });
  const [rejected, setRejected] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const projectTypes = [
    { label: "Kitchen Renovation", icon: Home },
    { label: "Bathroom Renovation", icon: Bath },
    { label: "Flooring", icon: Ruler },
    { label: "Painting", icon: Paintbrush },
    { label: "Full Condo Remodel", icon: Home },
    { label: "Lighting / Electrical", icon: Lamp },
  ];

  const budgets = [
    { label: "Under $10,000", value: "under10k", qualified: false },
    { label: "$10,000 – $25,000", value: "10k-25k", qualified: false },
    { label: "$25,000 – $50,000", value: "25k-50k", qualified: true },
    { label: "$50,000 – $100,000", value: "50k-100k", qualified: true },
    { label: "$100,000+", value: "100k+", qualified: true },
  ];

  const handleBudget = (b: typeof budgets[0]) => {
    setData({ ...data, budget: b.label });
    if (!b.qualified) {
      setRejected(true);
    } else {
      setStep(2);
    }
  };

  if (rejected) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-neutral-900">Thanks for Your Interest</h3>
        <p className="text-neutral-500 max-w-md mx-auto leading-relaxed">
          We appreciate you reaching out. Our minimum engagement for {data.type || "this project type"} starts at $25,000 CAD. For projects under this range, we&apos;d recommend checking with your local home improvement center for more suitable options.
        </p>
        <button onClick={() => { setStep(0); setRejected(false); setData({ type: "", budget: "", name: "", phone: "" }); }} className="mt-6 text-sm text-neutral-400 hover:text-neutral-600 underline">
          Start Over
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-neutral-900">We&apos;ll Be in Touch</h3>
        <p className="text-neutral-500 max-w-md mx-auto">
          Ragu will personally review your project details and reach out within 24 hours to schedule a walk-through.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 px-2">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 px-4">
        {[0, 1, 2].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-neutral-900" : "bg-neutral-200"}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="animate-fade-in">
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4 px-4">Step 1 — Project Type</p>
          <div className="grid grid-cols-2 gap-3 px-4">
            {projectTypes.map((pt) => (
              <button
                key={pt.label}
                onClick={() => { setData({ ...data, type: pt.label }); setStep(1); }}
                className="flex items-center gap-3 p-4 rounded-2xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all text-left group"
              >
                <pt.icon className="w-5 h-5 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
                <span className="text-sm font-medium text-neutral-700">{pt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-in">
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-1 px-4">Step 2 — Budget Range</p>
          <p className="text-xs text-neutral-400 mb-4 px-4">For: {data.type}</p>
          <div className="space-y-2 px-4">
            {budgets.map((b) => (
              <button
                key={b.value}
                onClick={() => handleBudget(b)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all text-left"
              >
                <span className="text-sm font-medium text-neutral-700">{b.label}</span>
                <ChevronRight className="w-4 h-4 text-neutral-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in px-4">
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-1">Step 3 — Contact Details</p>
          <p className="text-xs text-neutral-400 mb-6">{data.type} • {data.budget}</p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
            <button
              onClick={() => setSubmitted(true)}
              disabled={!data.name || !data.phone}
              className="w-full py-4 bg-neutral-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Request Callback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── DATA ────────────────────────── */
const services = [
  { title: "Kitchen Renovations", description: "Custom cabinetry, marble countertops, premium appliance integration, and full layout reconfigurations.", image: "/images/royalty-kitchen.png" },
  { title: "Bathroom Renovations", description: "Shower-tub conversions, radiant floor heating, bamboo vanities with Carrara marble, and LED lighting.", image: "/images/royalty-bathroom.png" },
  { title: "Flooring", description: "Premium hardwood, hickory laminate, and large-format porcelain tile. Wide plank, herringbone, and custom patterns.", image: "/images/royalty-flooring.png" },
];

const projects = [
  { title: "Condo Renovation — Toronto", scope: "12\"x24\" Calacatta marble porcelain tiles, new baseboards, doors, trims, and sliding glass doors.", tag: "Full Renovation" },
  { title: "Suite Renovation — Sharon, ON", scope: "12mm Hickory laminate flooring, 6\" colonial baseboards, LED lighting, and A/C installation.", tag: "Before & After" },
  { title: "Luxury Bathroom — Custom", scope: "Shower-tub conversion, bamboo/marble vanity, slatted feature wall, and layout reconfiguration.", tag: "$18,200 CAD" },
  { title: "Resale Prep — Paint & Restoration", scope: "Interior painting with neutral tones, surface patching, light carpentry, and staging-ready finishes.", tag: "Market Ready" },
];

const steps = [
  { icon: Phone, title: "1. Call Us", description: "Reach out for a free, no-obligation consultation. Tell us what you're envisioning." },
  { icon: Clock, title: "2. Walk-Through", description: "We visit the space, take measurements, and discuss materials, timeline, and budget in person." },
  { icon: Send, title: "3. Proposal in 48hrs", description: "You receive a detailed, transparent proposal within two business days. No surprises." },
];

/* ────────────────────── STRUCTURED DATA ────────────────────── */
function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: "Royalty Home Inc.",
    description: "Premium residential renovations in Barrie and the Greater Toronto Area. Flooring, painting, kitchens, bathrooms, and lighting.",
    telephone: "+16478942480",
    email: "marketing@royaltyhomeinc.com",
    address: { "@type": "PostalAddress", addressLocality: "Barrie", addressRegion: "ON", addressCountry: "CA" },
    areaServed: [
      { "@type": "City", name: "Barrie" },
      { "@type": "City", name: "Toronto" },
      { "@type": "AdministrativeArea", name: "Greater Toronto Area" },
    ],
    sameAs: ["https://www.instagram.com/royaltyhomeinc/"],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: "28" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

/* ═══════════════════════════ PAGE ═══════════════════════════ */
export default function RoyaltyHomePage() {
  const s1 = useInView();
  const s2 = useInView();
  const s3 = useInView();
  const s4 = useInView();
  const s5 = useInView();
  const s6 = useInView();

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      <LocalBusinessSchema />

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Royalty Home</span>
              <span className="text-[10px] text-neutral-400 block -mt-1 tracking-widest uppercase">Inc.</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
            <a href="#services" className="hover:text-neutral-900 transition-colors">Services</a>
            <a href="#portfolio" className="hover:text-neutral-900 transition-colors">Portfolio</a>
            <a href="#process" className="hover:text-neutral-900 transition-colors">Process</a>
            <a href="#quote" className="hover:text-neutral-900 transition-colors">Get a Quote</a>
            <a href="#contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              (647) 894-2480
            </a>
          </div>
          <a href="tel:6478942480" className="md:hidden inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-full">
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-end pt-20">
        <div className="absolute inset-0">
          <Image src="/images/royalty-hero.png" alt="Premium condo renovation by Royalty Home Inc." fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 md:pb-32 w-full">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-medium tracking-widest uppercase text-white/60">Proudly Canadian</span>
              <span className="text-white/40">🇨🇦</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[0.9] mb-6">
              Crafted,<br />Not Copied.
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-xl mb-10 leading-relaxed delay-200 animate-fade-in-up">
              Premium residential renovations in Barrie & the GTA. Flooring, painting, kitchens, bathrooms, and lighting — built to a standard, not a price point.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-400">
            <a href="#quote" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-neutral-900 font-semibold rounded-full hover:bg-neutral-100 transition-all text-sm shadow-xl">
              Get a Free Estimate
            </a>
            <a href="#portfolio" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-medium rounded-full border border-white/20 hover:bg-white/20 transition-all text-sm backdrop-blur-sm">
              View Our Work <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
          <div><p className="text-3xl font-bold">10+</p><p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Years Experience</p></div>
          <div className="w-px h-10 bg-neutral-200 hidden md:block" />
          <div><p className="text-3xl font-bold">GTA</p><p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Barrie & Toronto</p></div>
          <div className="w-px h-10 bg-neutral-200 hidden md:block" />
          <div><p className="text-3xl font-bold">100%</p><p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Referral Based</p></div>
          <div className="w-px h-10 bg-neutral-200 hidden md:block" />
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
            <span className="text-xs text-neutral-500 ml-2">5.0 Rating</span>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="py-24 md:py-32" ref={s1.ref}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`max-w-2xl mb-16 ${s1.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">What We Do</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Every Detail Matters.</h2>
            <p className="text-lg text-neutral-500 leading-relaxed">
              From flooring to full condo remodels, every project gets the same level of precision. We don&apos;t cut corners — that&apos;s why our clients keep coming back.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div key={i} className={`group relative rounded-3xl overflow-hidden bg-neutral-100 aspect-[3/4] ${s1.isVisible ? `animate-scale-in delay-${(i + 1) * 200}` : "opacity-0"}`}>
                <Image src={service.image} alt={service.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {["Flooring", "Painting", "Kitchens", "Bathrooms", "Lighting"].map((s, i) => (
              <div key={i} className="py-4 px-6 rounded-2xl bg-neutral-50 border border-neutral-100">
                <p className="text-sm font-semibold text-neutral-700">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PORTFOLIO ─── */}
      <section id="portfolio" className="py-24 md:py-32 bg-neutral-950 text-white" ref={s2.ref}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`max-w-2xl mb-16 ${s2.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <p className="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-3">Recent Projects</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Our Work Speaks.</h2>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Every project below was completed for existing clients — realtors and homeowners who know the standard.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <div key={i} className={`group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all ${s2.isVisible ? `animate-fade-in-up delay-${(i + 1) * 100}` : "opacity-0"}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-white/60">{project.tag}</span>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{project.scope}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href="https://www.instagram.com/royaltyhomeinc/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 hover:bg-white/10 transition-all">
              <Instagram className="w-4 h-4" /> See More on Instagram @royaltyhomeinc
            </a>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="process" className="py-24 md:py-32" ref={s3.ref}>
        <div className="max-w-5xl mx-auto px-6">
          <div className={`text-center max-w-2xl mx-auto mb-16 ${s3.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple. Transparent. Fast.</h2>
            <p className="text-lg text-neutral-500">No hidden fees, no runarounds. Three steps from first call to proposal.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className={`text-center ${s3.isVisible ? `animate-fade-in-up delay-${(i + 1) * 200}` : "opacity-0"}`}>
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <s.icon className="w-7 h-7 text-neutral-700" />
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{s.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
                    <ArrowRight className="w-5 h-5 text-neutral-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SMART QUOTE ─── */}
      <section id="quote" className="py-24 md:py-32 bg-neutral-50" ref={s4.ref}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className={`${s4.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Instant Qualification</p>
              <h2 className="text-4xl font-bold tracking-tight mb-4">Get a Quick Estimate</h2>
              <p className="text-neutral-500 leading-relaxed mb-6">
                Tell us about your project and we&apos;ll let you know right away if we&apos;re a good fit. No sales pitch — just a straight answer.
              </p>
              <div className="space-y-3 text-sm text-neutral-500">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Takes 30 seconds</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No obligation</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Personal callback from Ragu within 24hrs</div>
              </div>
            </div>
            <div className={`bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden ${s4.isVisible ? "animate-scale-in delay-200" : "opacity-0"}`}>
              <SmartQuoteWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-24 md:py-32" ref={s5.ref}>
        <div className={`max-w-4xl mx-auto px-6 text-center ${s5.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">About Royalty Home</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Built on Reputation,<br />Not Advertising.</h2>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto mb-8">
            For over a decade, Royalty Home Inc. has served the Barrie and Greater Toronto Area through word-of-mouth and realtor referrals. We don&apos;t chase clients — our work does. Every project is held to the same standard: premium materials, meticulous craftsmanship, and a result that speaks for itself.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-neutral-400">
            <MapPin className="w-4 h-4" /> Barrie, Ontario — Serving the Greater Toronto Area
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-24 md:py-32 bg-neutral-950 text-white" ref={s6.ref}>
        <div className={`max-w-4xl mx-auto px-6 text-center ${s6.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to Start?</h2>
          <p className="text-lg text-neutral-400 mb-12 max-w-xl mx-auto">
            Call for a free, no-obligation estimate. We&apos;ll walk the space with you and give you an honest assessment — no high-pressure sales.
          </p>
          <a href="tel:6478942480" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-neutral-900 font-bold rounded-full text-lg hover:bg-neutral-100 transition-all shadow-2xl shadow-white/10 mb-8">
            <Phone className="w-5 h-5" /> (647) 894-2480
          </a>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-neutral-500">
            <a href="mailto:marketing@royaltyhomeinc.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" /> marketing@royaltyhomeinc.com
            </a>
            <a href="https://www.instagram.com/royaltyhomeinc/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <Instagram className="w-4 h-4" /> @royaltyhomeinc
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-neutral-950 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">R</span>
            </div>
            <span className="text-sm text-white/40">Royalty Home Inc. — Barrie & GTA</span>
          </div>
          <p className="text-xs text-white/20">🇨🇦 Proudly Canadian</p>
        </div>
      </footer>

      {/* ─── MOBILE STICKY CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 safe-area-inset-bottom">
        <a href="tel:6478942480" className="flex items-center justify-center gap-2 w-full py-3.5 bg-neutral-900 text-white font-semibold rounded-xl text-sm">
          <Phone className="w-4 h-4" />
          Call for an Estimate — (647) 894-2480
        </a>
      </div>
    </div>
  );
}
