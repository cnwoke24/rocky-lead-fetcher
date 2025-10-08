import React, { useEffect, useRef, useState } from "react";
import { Zap, Phone, Bell, BarChart3, Check, Shield, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TryMeModal from "@/components/TryMeModal";

const BRAND_START = "#7C3AED";
const BRAND_END = "#22D3EE";

export default function Index() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [show, setShow] = useState(false);
  const [tryOpen, setTryOpen] = useState(false);
  const { toast } = useToast();
  
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const howRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setShow(true);
    const onScroll = () => setNavSolid(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  function go(ref: React.RefObject<HTMLDivElement>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { email },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Phone, title: "Smart Calling", desc: "AI dials instantly, qualifies, books, or schedules callbacks." },
    { icon: Bell, title: "Owner Alerts", desc: "Automatic SMS notifications with outcomes for every attempt." },
    { icon: BarChart3, title: "Analytics", desc: "Dashboards for attempts, connects, bookings, and outcomes." },
    { icon: Shield, title: "Compliance", desc: "Quiet hours + opt-out handling built in by default." },
  ];

  const logos = ["Evolve Fitness","Lift Lab","Core Club","Pulse Gym","Titan Athletics","Arena Fit"];

  const faqs = [
    { q: "Will I always access the most current and powerful AI models?", a: "Yes. We integrate with top LLMs and upgrade regularly." },
    { q: "Can I run as many AI sessions as I want?", a: "Usage is designed to scale. Plans include generous limits." },
    { q: "How often do the AI models get updated?", a: "Frequently — we evolve with the ecosystem and your feedback." },
    { q: "Is my data kept private and secure?", a: "We follow strong security and never sell your data." },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
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

      <header className={`fixed ${navSolid ? 'top-4' : 'top-0'} inset-x-0 z-40`}>
        <div className="mx-auto max-w-6xl px-3">
          <div
            className={`transition-all duration-300 backdrop-blur pointer-events-auto ${
              navSolid
                ? 'rounded-full bg-white/90 shadow-[0_10px_40px_rgba(2,6,23,0.06)] ring-1 ring-neutral-200'
                : 'bg-transparent'
            }`}
          >
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 md:gap-6 px-3 md:px-5 py-2 md:py-3 brand-font">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-9 h-9 rounded-xl brand-gradient grid place-items-center text-lg text-white shadow" aria-label="Rocky logo">🐾</div>
                <span className="text-base md:text-lg tracking-tight brand-title">Rocky AI • <span className="text-neutral-600">Fetch Leads</span></span>
              </div>

              <nav className="hidden md:flex items-center justify-center gap-8 font-semibold text-neutral-800 select-none">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:opacity-80 cursor-pointer">Home</button>
                <button onClick={() => go(howRef)} className="hover:opacity-80 cursor-pointer">Agents</button>
                <button onClick={() => go(featuresRef)} className="hover:opacity-80 cursor-pointer">Features</button>
                <button onClick={() => go(faqRef)} className="hover:opacity-80 cursor-pointer">FAQ</button>
                <button onClick={() => go(pricingRef)} className="hover:opacity-80 cursor-pointer">Pricing</button>
              </nav>

              <div className="hidden md:flex items-center gap-3">
                <button className="px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-800 hover:bg-neutral-100 transition-all duration-200 ease-out hover:scale-[1.04] hover:shadow-[0_8px_24px_rgba(2,6,23,0.08)]">Sign in</button>
                <button onClick={() => go(pricingRef)} className="px-4 h-10 inline-flex items-center gap-2 rounded-full font-semibold text-white bg-[#0B63D8] hover:bg-[#0A58C5] shadow-[0_6px_20px_rgba(11,99,216,.25)] transition-all duration-200 ease-out hover:scale-[1.06] hover:shadow-[0_14px_36px_rgba(11,99,216,.38)]">
                  Sign up <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-15 brand-gradient animate-[float_10s_ease-in-out_infinite]"/>
          <div className="absolute top-20 right-1/5 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-10 brand-gradient animate-[float_12s_ease-in-out_infinite]"/>
          <div className="absolute -bottom-24 left-10 w-80 h-80 rounded-full blur-3xl opacity-10 brand-gradient animate-[float_14s_ease-in-out_infinite]"/>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-40 pb-20 relative brand-font text-center">
          <div className={`transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white mb-6 text-neutral-700 reveal in" style={{transitionDelay: '0ms'}}>
              <Zap className="w-4 h-4 text-cyan-500" />
              <span className="text-xs tracking-wide">AI Assistants & Agents</span>
            </div>
            <h1 className="text-4xl md:text-6xl mb-6 brand-title h1-tuned mx-auto max-w-[22ch] reveal in" style={{transitionDelay: '100ms'}}>
              Turn Every Lead Into Revenue With <span className="brand-text">AI-Powered Calls</span>
            </h1>
            <p className="text-base md:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 reveal in" style={{transitionDelay: '200ms'}}>
              AI-powered calling that converts gym & salon leads into paying customers through intelligent conversations and CRM integration.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap reveal in" style={{transitionDelay: '300ms'}}>
              <a href="#pricing" onClick={(e)=>{e.preventDefault(); go(pricingRef);}} className="px-5 h-11 inline-flex items-center rounded-lg bg-neutral-900 text-white font-semibold hover:bg-black transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(2,6,23,0.15)]">Get Started</a>
              <button onClick={() => setTryOpen(true)} className="px-5 h-11 inline-flex items-center rounded-lg border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(2,6,23,0.08)]">Try me</button>
            </div>
          </div>

          <div className="mt-14 overflow-hidden border-y border-neutral-200 py-4 reveal" style={{transitionDelay: '400ms'}}>
            <div className="marquee">
              {logos.concat(logos, logos).map((n, i) => (
                <div key={n + i} className="text-neutral-600 text-sm tracking-wide">★ Trusted by {n}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative h-24 -mt-2">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="curveFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E7F1FB" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            <path d="M0,45 C240,105 480,105 720,65 C960,25 1200,25 1440,65 L1440,120 L0,120 Z" fill="url(#curveFade)" />
            <path d="M0,45 C240,105 480,105 720,65 C960,25 1200,25 1440,65" fill="none" stroke="#B9CFDF" strokeOpacity="0.6" strokeWidth="1" />
          </svg>
        </div>
      </section>

      <section ref={howRef} className="py-24 px-4 brand-font">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-2xl font-semibold text-neutral-700 mb-2 reveal" style={{transitionDelay: '0ms'}}>Smart Agents Ready</h3>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 brand-title reveal" style={{transitionDelay: '100ms'}}>Meet Your AI Task Force</h2>
          <p className="text-neutral-600 max-w-3xl reveal" style={{transitionDelay: '200ms'}}>Discover a growing lineup of intelligent agents built to act. From task automation to complex workflows, they think, decide, and execute — so you can focus on what matters.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[{n:1,title:"Connect lead form",desc:"Hook up Leadpages or your CRM webhook."},{n:2,title:"We call in ~3 minutes",desc:"Agent qualifies, books, or schedules a callback."},{n:3,title:"You get summaries",desc:"Texts + dashboard log of outcomes & next steps."}].map((s, i) => (
              <div key={s.n} className="p-8 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 transition reveal" style={{transitionDelay: `${150 + i*100}ms`}}>
                <div className="w-10 h-10 rounded-full grid place-items-center font-bold text-white brand-gradient mb-4">{s.n}</div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-neutral-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="py-24 px-4 brand-font">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-2xl font-semibold text-neutral-700 mb-2 reveal" style={{transitionDelay: '0ms'}}>Engineered for Impact</h3>
          <h2 className="text-3xl md:text-5xl font-bold mb-10 brand-title reveal" style={{transitionDelay: '100ms'}}>Unlock Your Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="p-8 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 transition reveal" style={{transitionDelay: `${150 + i*100}ms`}}>
                <div className="w-12 h-12 grid place-items-center rounded-lg brand-gradient mb-4 text-white">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">{title}</h3>
                <p className="text-neutral-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={pricingRef} id="pricing" className="py-28 px-4 brand-font">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 brand-title reveal" style={{transitionDelay: '0ms'}}>Pricing</h2>
            <p className="text-neutral-600 reveal" style={{transitionDelay: '100ms'}}>Start free. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border border-neutral-200 bg-white reveal" style={{transitionDelay: '150ms'}}>
              <div className="text-xs font-semibold tracking-wider text-neutral-700 mb-2">SUBSCRIPTION</div>
              <div className="flex items-end gap-2 mb-4">
                <div className="text-5xl font-extrabold">$35</div>
                <div className="text-neutral-500 mb-1">/mo</div>
              </div>
              <ul className="space-y-2 text-neutral-700 mb-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> 14-day free trial</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Calls & SMS follow-ups</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Notifications + daily report</li>
              </ul>
              <form onSubmit={handleStartTrial} className="flex gap-2">
                <input 
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  type="email" 
                  placeholder="Your email" 
                  required
                  disabled={loading}
                  className="h-12 flex-1 rounded-lg bg-white border border-neutral-300 px-3 placeholder:text-neutral-400 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="h-12 px-6 rounded-lg font-semibold bg-neutral-900 text-white hover:bg-black transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(2,6,23,0.15)] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? "Loading..." : "Sign up"}
                </button>
              </form>
            </div>

            <div className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50 reveal" style={{transitionDelay: '250ms'}}>
              <div className="text-xs font-semibold tracking-wider text-neutral-700 mb-2">SETUP FEE</div>
              <p className="text-neutral-700 mb-4">Billed <b>after</b> onboarding + DocuSign. Amount agreed on the call (e.g., $500) charged to your card on file.</p>
              <ul className="space-y-2 text-neutral-700 mb-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Custom voice agent configuration</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Lead source hookup (Leadpages)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Go-live checklist & QA</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section ref={faqRef} className="py-24 px-4 brand-font">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl md:text-5xl font-bold mb-10 brand-title reveal" style={{transitionDelay: '0ms'}}>Frequently Asked Questions</h2>
          <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 overflow-hidden reveal" style={{transitionDelay: '100ms'}}>
            {faqs.map((f, i) => (
              <details key={i} className="group open:bg-neutral-50 reveal" style={{transitionDelay: `${150 + i*50}ms`}}>
                <summary className="list-none cursor-pointer select-none px-5 py-4 flex items-center justify-between">
                  <span className="font-medium text-neutral-800">{f.q}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-neutral-600">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-8 brand-font">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg brand-gradient grid place-items-center text-sm text-white">🐾</div>
            <span>© 2025 Rocky AI. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-900">Privacy</a>
            <a href="#" className="hover:text-neutral-900">Terms</a>
            <a href="#" className="hover:text-neutral-900">Contact</a>
          </div>
        </div>
      </footer>

      {/* Try Me Modal */}
      <TryMeModal open={tryOpen} onClose={() => setTryOpen(false)} />
    </div>
  );
}
