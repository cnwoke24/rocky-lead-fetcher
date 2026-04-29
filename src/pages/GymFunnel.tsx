import { useRef, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { MessageSquare, PhoneCall, CalendarCheck, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const GymFunnel = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", business: "" });

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.business) return;
    setSubmitting(true);
    try {
      await supabase.functions.invoke("submit-lead", {
        body: {
          name: form.name,
          email: form.email,
          businessName: form.business,
          source: "gym-funnel",
        },
      });
      setSubmitted(true);
      toast({ title: "You're in!", description: "We'll reach out shortly to schedule your live demo." });
    } catch (err) {
      toast({ title: "Something went wrong", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { icon: MessageSquare, title: "You type 'Go' in your dedicated Slack channel.", num: "01" },
    { icon: PhoneCall, title: "Our AI instantly dials your dormant or old customer list.", num: "02" },
    { icon: CalendarCheck, title: "Customers are re-engaged and booked straight into your calendar.", num: "03" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased" style={{ fontSize: 16 }}>
      {/* Accent gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* HERO */}
        <section className="px-5 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
          <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-medium text-cyan-300 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Rocky Voice AI for Gyms & Spas
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                Turn Dormant Gym Members Into{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Active Revenue
                </span>{" "}
                with One Slack Message.
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl">
                Rocky Voice AI automatically calls your old CRM leads and books them back into your facility so you don't have to lift a finger.
              </p>
              <div className="mt-8">
                <button
                  onClick={scrollToForm}
                  className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-cyan-400 px-8 py-5 text-base sm:text-lg font-semibold text-slate-950 shadow-[0_0_40px_-5px_rgba(34,211,238,0.5)] transition-all hover:bg-cyan-300 hover:shadow-[0_0_60px_-5px_rgba(34,211,238,0.7)] active:scale-[0.98] min-h-[56px]"
                >
                  Get Your Custom AI Agent
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <p className="mt-3 text-sm text-slate-400">No credit card. Live demo in minutes.</p>
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 sm:p-6 shadow-2xl">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                  <div className="h-3 w-3 rounded-full bg-red-400/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                  <div className="h-3 w-3 rounded-full bg-green-400/70" />
                  <span className="ml-3 text-xs text-slate-400">#rocky-voice-ai</span>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded bg-cyan-400/20 flex items-center justify-center text-cyan-300 text-sm font-bold shrink-0">Y</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">You <span className="text-slate-500 font-normal text-xs ml-2">9:42 AM</span></p>
                      <p className="text-base text-slate-100 mt-0.5">go</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-300 text-sm font-bold shrink-0">R</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">Rocky AI <span className="text-slate-500 font-normal text-xs ml-2">9:42 AM</span></p>
                      <p className="text-sm text-slate-300 mt-0.5">🚀 Calling 247 dormant leads now…</p>
                      <div className="mt-3 rounded-lg bg-slate-800/60 border border-slate-700/50 p-3 space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Conversations</span><span className="text-cyan-300 font-mono">186</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Bookings</span><span className="text-cyan-300 font-mono">9</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-green-400">● Live</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="text-center mb-14"
            >
              <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-3">How It Works</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Three steps. Zero lifting.
              </h2>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3 relative">
              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  transition={{ delay: i * 0.12 }}
                  className="relative rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-6 sm:p-7 hover:border-cyan-400/30 transition-colors"
                >
                  <div className="relative flex items-center gap-4 mb-5">
                    <div className="h-12 w-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-cyan-300" />
                    </div>
                    <span className="text-3xl font-bold text-slate-700 font-mono">{step.num}</span>
                  </div>
                  <p className="text-lg text-slate-200 leading-snug">{step.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROOF / CASE STUDY */}
        <section className="px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-12 lg:p-16"
            >
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">
                <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-3">Case Study</p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">EVOL Body and Wellness</h3>
                <p className="text-slate-400 mb-10">In just 30 days with Rocky Voice AI</p>

                <div className="grid grid-cols-2 gap-6 sm:gap-12">
                  <div>
                    <div className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-br from-cyan-300 to-blue-400 bg-clip-text text-transparent leading-none">
                      186
                    </div>
                    <p className="mt-3 text-base sm:text-lg text-slate-300">Conversations had</p>
                  </div>
                  <div>
                    <div className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-br from-cyan-300 to-blue-400 bg-clip-text text-transparent leading-none">
                      9
                    </div>
                    <p className="mt-3 text-base sm:text-lg text-slate-300">Members reactivated</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LEAD FORM */}
        <section ref={formRef} className="px-5 py-20 sm:py-28 scroll-mt-8">
          <div className="mx-auto max-w-xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="text-center mb-10"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                See it in action.
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Get a live demo of your custom AI agent in under 5 minutes.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 sm:p-8"
            >
              {submitted ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
                    <CalendarCheck className="h-7 w-7 text-cyan-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
                  <p className="text-slate-400">We'll be in touch shortly to set up your live demo.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full min-h-[52px] rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full min-h-[52px] rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition"
                      placeholder="jane@yourgym.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="business" className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
                    <input
                      id="business"
                      type="text"
                      autoComplete="organization"
                      required
                      value={form.business}
                      onChange={(e) => setForm({ ...form, business: e.target.value })}
                      className="w-full min-h-[52px] rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition"
                      placeholder="EVOL Body and Wellness"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-4 text-base sm:text-lg font-semibold text-slate-950 shadow-[0_0_40px_-5px_rgba(34,211,238,0.5)] transition-all hover:bg-cyan-300 hover:shadow-[0_0_60px_-5px_rgba(34,211,238,0.7)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[56px]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        See A Live Demo <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-500 pt-2">
                    By submitting, you agree to be contacted about Rocky Voice AI.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        <footer className="px-5 py-10 text-center text-sm text-slate-500 border-t border-slate-900">
          © {new Date().getFullYear()} Rocky Voice AI. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default GymFunnel;
