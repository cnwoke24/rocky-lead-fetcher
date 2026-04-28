import React, { useEffect, useRef, useState } from "react";
import { Zap, Phone, Bell, BarChart3, Shield, ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TryMeModal from "@/components/TryMeModal";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { LeadMagnetModal, shouldShowLeadPopup } from "@/components/LeadMagnetModal";
import rockyLogo from "@/assets/rocky-logo.png";
import partnerEvol from "@/assets/partners/evol.png";
import partnerStretch from "@/assets/partners/stretch-evolution.png";
import partnerKlippit from "@/assets/partners/klippit.png";
import partnerTheCut from "@/assets/partners/thecut.png";
import partnerExpertDpt from "@/assets/partners/expert-dpt.png";
const BRAND_START = "#7C3AED";
const BRAND_END = "#22D3EE";
export default function Index() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [show, setShow] = useState(false);
  const [tryOpen, setTryOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    toast
  } = useToast();
  
  const howRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setShow(true);
    const onScroll = () => setNavSolid(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15
    });
    document.querySelectorAll<HTMLElement>(".reveal").forEach(el => io.observe(el));

    // Lead magnet popup paused — keep functionality intact, just don't auto-open
    // const leadTimer = setTimeout(() => {
    //   if (shouldShowLeadPopup()) {
    //     setLeadModalOpen(true);
    //   }
    // }, 1000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);
  function go(ref: React.RefObject<HTMLDivElement>) {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          email
        }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start trial. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const features = [{
    icon: Phone,
    title: "Smart Calling",
    desc: "AI dials instantly, qualifies, books, or schedules callbacks."
  }, {
    icon: Bell,
    title: "Owner Alerts",
    desc: "Automatic SMS notifications with outcomes for every attempt."
  }, {
    icon: BarChart3,
    title: "Analytics",
    desc: "Dashboards for attempts, connects, bookings, and outcomes."
  }, {
    icon: Shield,
    title: "Compliance",
    desc: "Quiet hours + opt-out handling built in by default."
  }];
  const logos = ["Evolve Fitness", "Lift Lab", "Core Club", "Pulse Gym", "Titan Athletics", "Arena Fit"];
  const faqs = [{
    q: "Will I always access the most current and powerful AI models?",
    a: "Yes. We integrate with top LLMs and upgrade regularly."
  }, {
    q: "Can I run as many AI sessions as I want?",
    a: "Usage is designed to scale. Plans include generous limits."
  }, {
    q: "How often do the AI models get updated?",
    a: "Frequently — we evolve with the ecosystem and your feedback."
  }, {
    q: "Is my data kept private and secure?",
    a: "We follow strong security and never sell your data."
  }];
  return <div className="min-h-screen bg-white text-neutral-900">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .brand-gradient { background: linear-gradient(135deg, ${BRAND_START}, ${BRAND_END}); }
        .brand-text { background: linear-gradient(135deg, ${BRAND_START}, ${BRAND_END}); -webkit-background-clip: text; background-clip: text; color: transparent; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee { display:flex; gap:64px; white-space:nowrap; animation: marquee 22s linear infinite; }
        .brand-font { font-family: 'Inter', 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; letter-spacing: -0.0125em; }
        .brand-title { font-weight: 700; letter-spacing: -0.02em; }
        .brand-nav { font-weight: 500; }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
        .reveal.in { opacity: 1; transform: translateY(0); }
        .h1-tuned { letter-spacing: -0.025em; word-spacing: 0.02em; line-height: 1.04; }
        button, a, [role="button"], .clickable { cursor: pointer; }
      `}</style>

      {/* Architectural blueprint grid background */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 z-0" />

      <header className={`fixed ${navSolid ? 'top-4' : 'top-0'} inset-x-0 z-40`}>
        <div className="mx-auto max-w-6xl px-3">
          <div className={`transition-all duration-300 backdrop-blur pointer-events-auto ${navSolid ? 'rounded-2xl bg-white/95 shadow-[0_10px_40px_rgba(2,6,23,0.06)] ring-1 ring-neutral-200' : 'bg-white/80 ring-1 ring-neutral-200/60'}`}>
            <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-2.5 brand-font">
              <a href="/" className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" aria-label="Rocky logo">
                  <img src={rockyLogo} alt="Rocky AI Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-base md:text-lg font-semibold tracking-tight text-neutral-900 truncate">Rocky AI</span>
              </a>

              <nav className="hidden md:flex items-center justify-center gap-8 font-medium text-neutral-700 select-none">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-neutral-900">Home</button>
                <button onClick={() => go(howRef)} className="hover:text-neutral-900">Approach</button>
                <button onClick={() => go(featuresRef)} className="hover:text-neutral-900">Case Studies</button>
                <button onClick={() => go(faqRef)} className="hover:text-neutral-900">FAQ</button>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileOpen(v => !v)}
                  aria-label="Toggle menu"
                  className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mobileOpen && (
              <div className="md:hidden border-t border-neutral-200/70 px-4 py-3 flex flex-col gap-1 text-neutral-800 font-medium">
                <button onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left py-2">Home</button>
                <button onClick={() => { setMobileOpen(false); go(howRef); }} className="text-left py-2">Approach</button>
                <button onClick={() => { setMobileOpen(false); go(featuresRef); }} className="text-left py-2">Case Studies</button>
                <button onClick={() => { setMobileOpen(false); go(faqRef); }} className="text-left py-2">FAQ</button>
                <a href="/login" className="py-2">Sign in</a>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-15 brand-gradient animate-[float_10s_ease-in-out_infinite]" />
        </div>
      </section>

      <section className="relative overflow-hidden z-10">
        <div className="mx-auto max-w-7xl px-6 md:px-12 pt-32 pb-16 flex flex-col items-center text-center brand-font">
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-balance max-w-4xl leading-[1.1] reveal in" style={{ transitionDelay: '100ms' }}>
            Complexity is a liability. <br />
            <span className="text-neutral-400">Automation is leverage.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-600 max-w-[55ch] text-pretty font-light reveal in" style={{ transitionDelay: '200ms' }}>
            We architect custom AI systems for small businesses. Replace chaotic manual workflows with precise, invisible infrastructure that scales your margins without scaling your headcount.
          </p>
          <div className="mt-10 flex gap-4 flex-wrap justify-center reveal in" style={{ transitionDelay: '300ms' }}>
            <a href="/signup" className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/10 ring-1 ring-inset ring-white/10">
              Map Your Workflow
            </a>
            <button onClick={() => setTryOpen(true)} className="bg-white text-neutral-900 px-6 py-3 rounded-lg font-medium hover:bg-neutral-50 transition-colors border border-neutral-200 shadow-sm">
              View Architecture
            </button>
          </div>
        </div>

        {/* Workflow video preview card */}
        <div className="px-6 md:px-12 max-w-5xl mx-auto pb-24 brand-font">
          <div className="bg-white/60 backdrop-blur-2xl border border-neutral-200 rounded-2xl p-2 shadow-[0_8px_40px_rgba(0,0,0,0.04)] ring-1 ring-neutral-900/5 reveal" style={{ transitionDelay: '400ms' }}>
            <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
              <div className="flex items-center border-b border-neutral-100 px-4 py-3 gap-2 bg-neutral-50/50">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-neutral-300" />
                  <div className="size-2.5 rounded-full bg-neutral-300" />
                  <div className="size-2.5 rounded-full bg-neutral-300" />
                </div>
                <div className="ml-4 font-mono text-[10px] text-neutral-400 tracking-wider">ROCKY_WORKFLOW</div>
              </div>
              <video
                src="/workflow-demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by companies - marquee carousel */}
      <section className="relative z-10 py-12 md:py-20 brand-font overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-center text-base md:text-3xl tracking-tight font-light text-[#8b887e]">
            Trusted by businesses like...
          </h2>
        </div>
        <div
          className="mt-10 md:mt-14 relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
          }}
        >
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                {[
                  { src: partnerEvol, alt: "EVOL Body & Wellness" },
                  { src: partnerStretch, alt: "Stretch Evolution & Wellness" },
                  { src: partnerKlippit, alt: "Klippit" },
                  { src: partnerTheCut, alt: "theCut" },
                  { src: partnerExpertDpt, alt: "Expert Doctors of Physical Therapy" },
                ].map((logo) => (
                  <div
                    key={`${dup}-${logo.alt}`}
                    className="mx-4 sm:mx-6 md:mx-8 flex h-28 sm:h-36 md:h-48 w-[220px] sm:w-[280px] md:w-[360px] items-center justify-center"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      loading="lazy"
                      className="max-h-full max-w-full w-auto h-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach + Metrics */}
      <section ref={howRef} className="relative z-10 py-24 md:py-32 px-6 max-w-7xl mx-auto brand-font">
        <div className="max-w-3xl mb-16 reveal" style={{ transitionDelay: '0ms' }}>
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-600">Our Approach</span>
          <h2 className="mt-4 text-3xl md:text-5xl font-medium tracking-tight text-balance">
            We don't sell software. <span className="text-neutral-400">We engineer leverage.</span>
          </h2>
          <p className="mt-4 text-neutral-600 text-lg font-light">Every engagement starts with a conversation about your business — not a product pitch. Then we design, build, and stay hands-on through deployment.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="flex flex-col border-l border-neutral-200 pl-6 reveal" style={{ transitionDelay: '100ms' }}>
            <span className="text-6xl font-light tracking-tight text-cyan-600 tabular-nums">42<span className="text-3xl text-neutral-400">hrs</span></span>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">Weekly Time Reclaimed</h3>
            <p className="mt-2 text-sm text-neutral-600">Average time saved per operational role through automated routing and data entry.</p>
          </div>
          <div className="flex flex-col border-l border-neutral-200 pl-6 reveal" style={{ transitionDelay: '200ms' }}>
            <span className="text-6xl font-light tracking-tight text-cyan-600 tabular-nums">31<span className="text-3xl text-neutral-400">%</span></span>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">Margin Expansion</h3>
            <p className="mt-2 text-sm text-neutral-600">Increase in profit margins by decoupling revenue growth from headcount growth.</p>
          </div>
          <div className="flex flex-col border-l border-neutral-200 pl-6 reveal" style={{ transitionDelay: '300ms' }}>
            <span className="text-6xl font-light tracking-tight text-cyan-600 tabular-nums">0</span>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">Technical Debt Added</h3>
            <p className="mt-2 text-sm text-neutral-600">Systems built on secure, modular platforms that require zero engineering maintenance.</p>
          </div>
        </div>
      </section>

      {/* Results dark section */}
      <section ref={featuresRef} className="relative z-10 py-24 bg-neutral-900 text-white brand-font">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-6 reveal">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-balance">Results across all business-critical layers.</h2>
            <p className="text-neutral-400 text-lg max-w-[45ch] font-light">We don't build toys or chatbots. We engineer robust operational pipelines that handle your most tedious, error-prone tasks with absolute precision.</p>
            <ul className="mt-4 flex flex-col gap-4">
              <li className="flex items-start gap-3 border-t border-neutral-800 pt-4">
                <div className="size-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <div>
                  <strong className="block font-medium text-neutral-100">Client Acquisition</strong>
                  <span className="text-sm text-neutral-400">Automated lead qualification and personalized follow-ups in seconds.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 border-t border-neutral-800 pt-4">
                <div className="size-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <div>
                  <strong className="block font-medium text-neutral-100">Service Delivery</strong>
                  <span className="text-sm text-neutral-400">Algorithmic scheduling and automated milestone reporting.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl reveal" style={{ transitionDelay: '150ms' }}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs text-neutral-500">ACTIVE_PIPELINES</span>
              <span className="text-cyan-400 text-xs font-mono bg-cyan-500/10 px-2 py-1 rounded">100% UPTIME</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">New Lead Outreach</span>
                  <span className="text-xs text-neutral-500 font-mono">PROCESSED: 142 TODAY</span>
                </div>
                <div className="text-cyan-400 text-sm">+ 24 BOOKED</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Appointment Reminders</span>
                  <span className="text-xs text-neutral-500 font-mono">DELIVERY: 98.4%</span>
                </div>
                <div className="text-cyan-400 text-sm">OPTIMIZED</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center opacity-50">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Support Triage</span>
                  <span className="text-xs text-neutral-500 font-mono">AWAITING BATCH...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 bg-white">
        <TestimonialsSection />
      </div>

      {/* Deployment Protocol */}
      <section className="relative z-10 py-24 md:py-32 max-w-7xl mx-auto px-6 brand-font">
        <div className="mb-16 text-center reveal">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-600">Deployment Protocol</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-medium tracking-tight">From chaotic operations to pristine architecture.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-neutral-200" />
          {[
            { n: '01', title: 'Diagnostic Audit', desc: 'We analyze your current workflows, identifying friction points and manual bottlenecks costing you margin.', active: false },
            { n: '02', title: 'System Architecture', desc: 'We design a custom AI-driven pipeline, selecting the exact nodes needed without bloat or complexity.', active: true },
            { n: '03', title: 'Silent Deployment', desc: 'We integrate the new architecture parallel to your existing operations, switching over only when tested flawless.', active: false },
          ].map((s, i) => (
            <div key={s.n} className={`relative flex flex-col items-center text-center bg-white p-8 border border-neutral-200 rounded-xl hover:shadow-lg transition-shadow reveal ${s.active ? 'shadow-md ring-1 ring-cyan-500/20' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className={`size-12 rounded-full border-4 border-white flex items-center justify-center font-mono text-sm mb-6 z-10 ${s.active ? 'bg-cyan-500 text-white' : 'bg-neutral-100 text-neutral-700'}`}>{s.n}</div>
              <h3 className="text-lg font-medium">{s.title}</h3>
              <p className="text-sm text-neutral-600 mt-2 font-light">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 bg-cyan-500 text-neutral-900 brand-font">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight">Ready to build leverage?</h2>
          <p className="mt-6 text-lg md:text-xl text-neutral-900/80 font-light max-w-[50ch] mx-auto">Stop competing on effort. Start competing on architecture. Book your diagnostic audit today.</p>
          <div className="mt-10">
            <a href="/signup" className="inline-block bg-neutral-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-neutral-800 transition-colors shadow-xl shadow-neutral-900/20 text-base md:text-lg">
              Schedule Architecture Review
            </a>
          </div>
        </div>
      </section>



      <section ref={faqRef} className="py-24 px-4 brand-font">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl md:text-5xl font-bold mb-10 brand-title reveal" style={{
          transitionDelay: '0ms'
        }}>Frequently Asked Questions</h2>
          <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 overflow-hidden reveal" style={{
          transitionDelay: '100ms'
        }}>
            {faqs.map((f, i) => <details key={i} className="group open:bg-neutral-50 reveal" style={{
            transitionDelay: `${150 + i * 50}ms`
          }}>
                <summary className="list-none cursor-pointer select-none px-5 py-4 flex items-center justify-between">
                  <span className="font-medium text-neutral-800">{f.q}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-neutral-600">{f.a}</div>
              </details>)}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-12 brand-font">
        <div className="mx-auto max-w-7xl px-4">
          {/* Top Section - Logo and Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8">
            {/* Left - Brand */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <img src={rockyLogo} alt="Rocky AI Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-neutral-600 text-xs">© 2025 Rocky AI. All rights reserved.</span>
            </div>
            
            {/* Right - Use Cases */}
            <div className="md:text-right">
              <h3 className="font-semibold text-neutral-500 uppercase tracking-wide mb-4 text-xs">Use Cases</h3>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-neutral-700 hover:text-primary transition-colors text-xs">
                  For Gym Owners & Fitness Entrepreneurs
                </a>
                <a href="/nightlife" className="text-neutral-700 hover:text-primary transition-colors text-xs">
                  For Nightlife
                </a>
                <a href="/physical-therapy" className="text-neutral-700 hover:text-primary transition-colors text-xs">
                  Physical Therapy Clinics
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom Links */}
          <div className="pt-6 border-t border-neutral-200">
            <div className="text-neutral-600 text-xs">
              <a href="/privacy" className="hover:text-neutral-900 transition-colors text-xs">Privacy</a>
              <span className="mx-2">|</span>
              <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
              <span className="mx-2">|</span>
              <a href="#" className="hover:text-neutral-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Try Me Modal */}
      <TryMeModal open={tryOpen} onClose={() => setTryOpen(false)} />

      {/* Lead Magnet Modal */}
      <LeadMagnetModal open={leadModalOpen} onClose={() => setLeadModalOpen(false)} />
    </div>;
}