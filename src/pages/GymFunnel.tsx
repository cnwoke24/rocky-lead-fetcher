import { useRef, useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
      navigate("/gym-page-2");
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
      <section className="border-b-2" style={{ borderColor: ink }}>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="p-6 sm:p-10 lg:p-16"
        >
          <h1
            className="font-bold text-4xl sm:text-6xl lg:text-[5.5rem] leading-[0.9] uppercase tracking-tighter text-balance mb-6 sm:mb-8"
            style={display}
          >
            How To Win Back{" "}
            <span className="inline-block transform -skew-x-6" style={{ color: sprint }}>
              5–10 Inactive Members
            </span>{" "}
            Every Month
          </h1>

          {/* VIDEO PLAYER */}
          <div
            className="border-2 overflow-hidden mb-6 sm:mb-8 max-w-sm mx-auto"
            style={{ borderColor: ink, boxShadow: `8px 8px 0px ${ink}` }}
          >
            <div className="relative w-full" style={{ aspectRatio: "9 / 16" }}>
              <iframe
                src="https://www.youtube.com/embed/lBZp4eqlx1k?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&loop=1&playlist=lBZp4eqlx1k&cc_load_policy=0"
                title="Free Training Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>

          <p className="sm:text-xl lg:text-2xl max-w-[45ch] leading-snug text-base">
            Bring old members back without cold calling, chasing leads for hours, or asking your staff to do awkward sales follow-up.
          </p>
          <div
            className="mt-8 max-w-md border-2 p-5 sm:p-6"
            style={{ background: court, borderColor: ink, boxShadow: `6px 6px 0px ${ink}` }}
          >
            <div className="text-sm sm:text-base font-bold uppercase tracking-tight mb-4" style={mono}>
              Where should we send the video?
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!form.name || !form.email) return;
                setSubmitting(true);
                try {
                  await supabase.functions.invoke("submit-lead", {
                    body: {
                      name: form.name,
                      email: form.email,
                      businessName: form.business || "N/A",
                      source: "gym-funnel-hero",
                    },
                  });
                  setSubmitted(true);
                  toast({ title: "Got it!", description: "Check your inbox shortly for the video." });
                  navigate("/gym-page-2");
                } catch (err) {
                  toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
                } finally {
                  setSubmitting(false);
                }
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                required
                autoComplete="given-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="First name"
                className="border-2 px-4 py-3 text-base focus:outline-none rounded-none min-h-[48px]"
                style={{ background: chalk, borderColor: ink, ...body }}
              />
              <input
                type="email"
                inputMode="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className="border-2 px-4 py-3 text-base focus:outline-none rounded-none min-h-[48px]"
                style={{ background: chalk, borderColor: ink, ...body }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-3 text-base sm:text-lg uppercase py-4 px-6 border-2 transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-60 min-h-[52px]"
                style={{
                  ...display,
                  background: sprint,
                  color: chalk,
                  borderColor: ink,
                  boxShadow: `6px 6px 0px ${ink}`,
                }}
              >
                {submitting ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Sending…</>
                ) : (
                  <>Send Me The Video <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>
          </div>
        </motion.div>
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

      {/* SECONDARY LEAD FORM */}
      <section className="p-6 sm:p-10 lg:p-16 border-b-2" style={{ borderColor: ink }}>
        <div
          className="max-w-md mx-auto border-2 p-5 sm:p-6"
          style={{ background: court, borderColor: ink, boxShadow: `6px 6px 0px ${ink}` }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-2" style={display}>
            Unlock The Strategy
          </h2>
          <div className="text-sm sm:text-base font-bold uppercase tracking-tight mb-4" style={mono}>
            Where should we send the video?
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!form.name || !form.email) return;
              setSubmitting(true);
              try {
                await supabase.functions.invoke("submit-lead", {
                  body: {
                    name: form.name,
                    email: form.email,
                    businessName: form.business || "N/A",
                    source: "gym-funnel-secondary",
                  },
                });
                setSubmitted(true);
                toast({ title: "Got it!", description: "Check your inbox shortly for the video." });
                navigate("/gym-page-2");
              } catch (err) {
                toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
              } finally {
                setSubmitting(false);
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              required
              autoComplete="given-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="First name"
              className="border-2 px-4 py-3 text-base focus:outline-none rounded-none min-h-[48px]"
              style={{ background: chalk, borderColor: ink, ...body }}
            />
            <input
              type="email"
              inputMode="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              className="border-2 px-4 py-3 text-base focus:outline-none rounded-none min-h-[48px]"
              style={{ background: chalk, borderColor: ink, ...body }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-3 text-base sm:text-lg uppercase py-4 px-6 border-2 transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-60 min-h-[52px]"
              style={{
                ...display,
                background: sprint,
                color: chalk,
                borderColor: ink,
                boxShadow: `6px 6px 0px ${ink}`,
              }}
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Sending…</>
              ) : (
                <>Send Me The Video <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          </form>
        </div>
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
