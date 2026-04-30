import { useRef, useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
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

  // Inject fonts once
  useEffect(() => {
    const id = "rocky-fonts-athletic";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Chivo:wght@400;700&family=Oswald:wght@500;700&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
  }, []);

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
      toast({ title: "Sequence initialized", description: "We'll reach out shortly to schedule your live demo." });
    } catch (err) {
      toast({ title: "Something went wrong", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Color tokens (athletic brutalist palette)
  const chalk = "#faf9f5";
  const ink = "#111111";
  const sprint = "#ff3e00";
  const court = "#e8e6e1";

  const display = { fontFamily: "'Oswald', sans-serif" };
  const mono = { fontFamily: "'Space Mono', monospace" };
  const body = { fontFamily: "'Chivo', sans-serif" };

  return (
    <div
      className="min-h-dvh selection:bg-[#ff3e00] selection:text-[#faf9f5] overflow-x-hidden"
      style={{ background: chalk, color: ink, ...body }}
    >
      {/* Top Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-6 py-4 border-b-2 gap-2" style={{ borderColor: ink }}>
        <div className="font-bold tracking-tighter text-base sm:text-xl uppercase" style={mono}>
          Free Strategy Video Reveals:
        </div>
      </header>

      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b-2" style={{ borderColor: ink }}>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="lg:col-span-8 p-6 sm:p-10 lg:p-16 border-b-2 lg:border-b-0 lg:border-r-2"
          style={{ borderColor: ink }}
        >
          <h1
            className="font-bold text-4xl sm:text-6xl lg:text-[5.5rem] leading-[0.9] uppercase tracking-tighter text-balance mb-6 sm:mb-8"
            style={display}
          >
            How to reactivate{" "}
            <span className="inline-block transform -skew-x-6" style={{ color: sprint }}>
              5–10 inactive members
            </span>{" "}
            and get them back in your gym every month.
          </h1>
          <p className="sm:text-xl lg:text-2xl max-w-[45ch] leading-snug text-base">
            Bring old members back without cold calling, chasing leads for hours, or asking your staff to do awkward sales follow-up.
          </p>
          <button
            onClick={scrollToForm}
            className="mt-8 inline-flex items-center gap-3 text-chalk text-lg sm:text-xl uppercase py-4 px-7 border-2 transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            style={{
              ...display,
              background: sprint,
              color: chalk,
              borderColor: ink,
              boxShadow: `6px 6px 0px ${ink}`,
            }}
          >
            Commence Dialing <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Right: Action Form column (visual placeholder; real form below for mobile UX) */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 flex flex-col"
          style={{ background: court }}
        >
          <div className="p-5 border-b-2 uppercase text-xs sm:text-sm font-bold" style={{ ...mono, borderColor: ink }}>
            Live Sequence Log
          </div>
          <div className="p-6 sm:p-8 flex-grow flex flex-col gap-4 text-sm" style={mono}>
            <div className="flex gap-3">
              <span className="opacity-50 shrink-0">[09:42:01]</span>
              <span>SYS_STANDBY...</span>
            </div>
            <div className="flex gap-3 font-bold" style={{ color: sprint }}>
              <span className="opacity-80 shrink-0">[09:42:12]</span>
              <span>{"> /rocky go dormant_list"}</span>
            </div>
            <div className="flex gap-3">
              <span className="opacity-50 shrink-0">[09:42:13]</span>
              <span>TRIGGER_RECEIVED</span>
            </div>
            <div className="flex gap-3">
              <span className="opacity-50 shrink-0">[09:42:15]</span>
              <span>PARSING: 247 RECORDS</span>
            </div>
            <div className="flex gap-3 pl-3 border-l-2 my-1 py-2" style={{ borderColor: sprint }}>
              <span className="opacity-50 shrink-0">[09:43:01]</span>
              <span>OUTBOUND_CALL → RINGING</span>
            </div>
            <div className="px-2 py-1 inline-block self-start font-bold" style={{ background: sprint, color: chalk }}>
              [09:46:44] APPOINTMENT_CONFIRMED
            </div>
            <div className="flex gap-3 mt-2 animate-pulse">
              <span className="opacity-50 shrink-0">[09:46:45]</span>
              <span>AWAITING_NEXT █</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* THE HANDOFF / MECHANISM */}
      <section className="flex flex-col lg:flex-row border-b-2" style={{ borderColor: ink }}>
        <div
          className="lg:w-48 p-6 border-b-2 lg:border-b-0 lg:border-r-2 flex items-center justify-center"
          style={{ borderColor: ink, background: court }}
        >
          <h2
            className="text-2xl sm:text-3xl uppercase tracking-widest lg:transform lg:-rotate-90 lg:whitespace-nowrap"
            style={display}
          >
            The Handoff
          </h2>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-3">
          {[
            {
              num: "01",
              title: "Webhook Received",
              meta: "Target: Form_Abandon_48h",
              copy: "Lead stalls out on your pricing page. Your CRM fires a signal.",
              dark: false,
            },
            {
              num: "02",
              title: "> Executing: Voice_Protocol",
              meta: "Latency: < 30s",
              copy: "Rocky takes the baton. Outbound call initiated in under thirty seconds.",
              dark: true,
            },
            {
              num: "03",
              title: "[CALENDAR_UPDATE]",
              meta: "Event: Intro Assessment",
              copy: "Conversation handled, objections cleared, appointment locked on your calendar.",
              dark: false,
            },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
              className="p-6 sm:p-8 border-b-2 md:border-b-0 md:border-r-2 last:border-r-0 flex flex-col gap-5"
              style={{
                borderColor: ink,
                background: step.dark ? sprint : "transparent",
                color: step.dark ? chalk : ink,
              }}
            >
              <div
                className="text-5xl"
                style={{
                  ...mono,
                  WebkitTextStroke: `1px ${step.dark ? chalk : ink}`,
                  color: "transparent",
                }}
              >
                {step.num}
              </div>
              <div
                className="border p-4 text-sm shadow-[3px_3px_0px_currentColor]"
                style={{
                  ...mono,
                  background: step.dark ? ink : court,
                  color: step.dark ? chalk : ink,
                  borderColor: step.dark ? chalk : ink,
                }}
              >
                <span className="font-bold uppercase block mb-1">{step.title}</span>
                {step.meta}
              </div>
              <p className="text-base sm:text-lg leading-tight mt-auto pt-4 border-t" style={{ borderColor: step.dark ? "rgba(250,249,245,0.3)" : "rgba(17,17,17,0.2)" }}>
                {step.copy}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CASE STUDY */}
      <section className="p-6 sm:p-10 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 border-b-2" style={{ borderColor: ink }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="lg:col-span-5"
        >
          <div className="text-xs uppercase tracking-widest mb-4 flex items-center gap-2" style={mono}>
            <span className="size-2 inline-block" style={{ background: sprint }} /> Field Report
          </div>
          <h2 className="text-4xl sm:text-5xl uppercase tracking-tight mb-6" style={display}>
            EVOL Athletics
          </h2>
          <p className="text-lg sm:text-xl mb-6 leading-relaxed max-w-[40ch]">
            "We had hundreds of numbers from an old promo sitting in a spreadsheet. We plugged Rocky in on a Tuesday. By Wednesday afternoon, my coaching staff was fully booked for the week. It's like a relentless front desk that never sleeps."
          </p>
          <div className="font-bold text-xs sm:text-sm uppercase" style={mono}>
            — Marcus Vance, Head of Operations
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 border-2 p-6 sm:p-10 lg:p-12 grid grid-cols-2 gap-6 sm:gap-8"
          style={{ background: court, borderColor: ink, boxShadow: `8px 8px 0px ${ink}` }}
        >
          <div className="flex flex-col justify-end">
            <div className="text-[5rem] sm:text-[7rem] lg:text-[8rem] leading-none tracking-tighter" style={display}>
              186
            </div>
            <div className="text-xs sm:text-sm uppercase tracking-wider font-bold border-t-2 pt-2 mt-2" style={{ ...mono, borderColor: ink }}>
              Stale Records Contacted
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <div className="text-[5rem] sm:text-[7rem] lg:text-[8rem] leading-none tracking-tighter" style={{ ...display, color: sprint }}>
              9
            </div>
            <div className="text-xs sm:text-sm uppercase tracking-wider font-bold border-t-2 pt-2 mt-2" style={{ ...mono, borderColor: ink }}>
              Reactivations Booked
            </div>
          </div>
        </motion.div>
      </section>

      {/* LEAD FORM */}
      <section ref={formRef} className="p-6 sm:p-10 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 scroll-mt-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="lg:col-span-6"
        >
          <div className="inline-block px-3 py-1 text-xs sm:text-sm uppercase tracking-tight mb-6 border" style={{ ...mono, background: court, borderColor: ink }}>
            Initialize Sequence
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.9] mb-6" style={display}>
            Plug Rocky In.<br />
            <span style={{ color: sprint }}>Watch the calendar fill.</span>
          </h2>
          <p className="text-lg sm:text-xl max-w-[40ch]">
            Drop your details. We'll provision a custom AI agent for your facility and put it on a live demo call within 24 hours.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="lg:col-span-6 border-2 p-6 sm:p-8 lg:p-10"
          style={{ background: court, borderColor: ink, boxShadow: `8px 8px 0px ${ink}` }}
        >
          {submitted ? (
            <div className="py-10 text-center">
              <div className="inline-block px-4 py-2 mb-6 font-bold uppercase" style={{ ...mono, background: sprint, color: chalk }}>
                Sequence Confirmed
              </div>
              <h3 className="text-3xl uppercase mb-3" style={display}>You're in the queue.</h3>
              <p className="text-base sm:text-lg max-w-md mx-auto">
                We'll be in touch shortly to set up your live demo call.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider font-bold" style={mono}>
                  Operator Name
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="J. Thompson"
                  className="border-2 px-4 py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all rounded-none min-h-[52px]"
                  style={{ background: chalk, borderColor: ink, ...body }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider font-bold" style={mono}>
                  Comm Link (Email)
                </label>
                <input
                  type="email"
                  inputMode="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hq@facility.com"
                  className="border-2 px-4 py-3 text-base sm:text-lg focus:outline-none transition-all rounded-none min-h-[52px]"
                  style={{ background: chalk, borderColor: ink, ...body }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider font-bold" style={mono}>
                  Facility Designation
                </label>
                <input
                  type="text"
                  required
                  autoComplete="organization"
                  value={form.business}
                  onChange={(e) => setForm({ ...form, business: e.target.value })}
                  placeholder="Apex Conditioning"
                  className="border-2 px-4 py-3 text-base sm:text-lg focus:outline-none transition-all rounded-none min-h-[52px]"
                  style={{ background: chalk, borderColor: ink, ...body }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center gap-3 text-2xl uppercase tracking-wider py-4 sm:py-5 border-2 transition-all hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none disabled:opacity-60 min-h-[60px]"
                style={{
                  ...display,
                  background: sprint,
                  color: chalk,
                  borderColor: ink,
                  boxShadow: `6px 6px 0px ${ink}`,
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>Commence Dialing <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
              <p className="text-[11px] uppercase tracking-widest text-center pt-2 opacity-70" style={mono}>
                No credit card. Live demo within 24h.
              </p>
            </form>
          )}
        </motion.div>
      </section>

      <footer className="px-6 py-6 border-t-2 flex flex-col sm:flex-row gap-2 justify-between items-center" style={{ borderColor: ink, background: ink, color: chalk }}>
        <div className="uppercase text-xs tracking-widest" style={mono}>
          © {new Date().getFullYear()} Rocky Voice AI
        </div>
        <div className="uppercase text-xs tracking-widest opacity-70" style={mono}>
          Reactivation Engine v.4.2
        </div>
      </footer>
    </div>
  );
};

export default GymFunnel;
