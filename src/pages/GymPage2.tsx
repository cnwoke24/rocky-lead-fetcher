import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const GymPage2 = () => {
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

  // Athletic brutalist palette
  const chalk = "#faf9f5";
  const ink = "#111111";
  const sprint = "#ff3e00";
  const court = "#e8e6e1";

  const display = { fontFamily: "'Oswald', sans-serif" };
  const mono = { fontFamily: "'Space Mono', monospace" };
  const body = { fontFamily: "'Chivo', sans-serif" };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <div
      className="min-h-dvh selection:bg-[#ff3e00] selection:text-[#faf9f5] overflow-x-hidden"
      style={{ background: chalk, color: ink, ...body }}
    >
      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-5 sm:px-6 py-4 border-b-2"
        style={{ borderColor: ink }}
      >
        <div className="font-bold tracking-tighter text-base sm:text-xl uppercase" style={mono}>
          You're In <span style={{ color: sprint }}>//</span> Next Steps
        </div>
      </header>

      {/* HERO CONFIRMATION */}
      <section className="p-6 sm:p-10 lg:p-16 border-b-2" style={{ borderColor: ink }}>
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 text-xs sm:text-sm uppercase tracking-tight mb-6 border font-bold"
            style={{ ...mono, background: sprint, color: chalk, borderColor: ink }}
          >
            <CheckCircle2 className="h-4 w-4" /> Confirmed
          </div>
          <h1
            className="font-bold text-4xl sm:text-6xl lg:text-[5.5rem] leading-[0.9] uppercase tracking-tighter text-balance mb-6 sm:mb-8"
            style={display}
          >
            Your strategy video is on the{" "}
            <span className="inline-block transform -skew-x-6" style={{ color: sprint }}>
              way.
            </span>
          </h1>
          <p className="sm:text-xl lg:text-2xl max-w-[50ch] leading-snug text-base mb-8 sm:mb-10">
            Watch the full training below — it's under 9 minutes and walks through the exact reactivation system.
          </p>

          {/* VIDEO PLAYER */}
          <div
            className="border-2 overflow-hidden"
            style={{ borderColor: ink, background: ink, boxShadow: `8px 8px 0px ${ink}` }}
          >
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src="https://www.youtube.com/embed/k9rTU6DN9AA?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&loop=1&playlist=k9rTU6DN9AA"
                title="Free Training Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* WHAT TO DO NEXT */}
      <section className="border-b-2" style={{ borderColor: ink }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="p-6 sm:p-8 flex flex-col gap-5"
          style={{ borderColor: ink, background: sprint, color: chalk }}
        >
          <div
            className="text-5xl"
            style={{
              ...mono,
              WebkitTextStroke: `1px ${chalk}`,
              color: "transparent",
            }}
          >
            01
          </div>
          <div className="font-bold uppercase text-lg" style={display}>
            Book A Strategy Call
          </div>
          <p
            className="text-base sm:text-lg leading-tight pt-4 border-t max-w-2xl"
            style={{ borderColor: "rgba(250,249,245,0.3)" }}
          >
            If you want us to build it for you, grab a slot below. We only take on a few gyms a month.
          </p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="p-6 sm:p-10 lg:p-16 border-b-2" style={{ borderColor: ink }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="max-w-2xl mx-auto border-2 p-6 sm:p-10 text-center"
          style={{ background: court, borderColor: ink, boxShadow: `8px 8px 0px ${ink}` }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-tight mb-5 border font-bold"
            style={{ ...mono, background: chalk, borderColor: ink }}
          >
            <Mail className="h-3.5 w-3.5" /> Limited Slots
          </div>
          <h2
            className="text-3xl sm:text-5xl uppercase tracking-tighter leading-[0.9] mb-4"
            style={display}
          >
            Want us to build this <span style={{ color: sprint }}>for you?</span>
          </h2>
          <p className="text-base sm:text-lg mb-6 max-w-md mx-auto">
            Book a free 15-minute strategy call. We'll map your reactivation campaign live.
          </p>
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 text-base sm:text-lg uppercase py-4 px-7 border-2 transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            style={{
              ...display,
              background: sprint,
              color: chalk,
              borderColor: ink,
              boxShadow: `6px 6px 0px ${ink}`,
            }}
          >
            Book My Strategy Call
          </a>
        </motion.div>
      </section>

      <footer
        className="px-6 py-6 border-t-2 flex flex-col sm:flex-row gap-2 justify-between items-center"
        style={{ borderColor: ink, background: ink, color: chalk }}
      >
        <div className="uppercase text-xs tracking-widest" style={mono}>
          © {new Date().getFullYear()} Rocky Voice AI
        </div>
        <Link to="/gym" className="uppercase text-xs tracking-widest opacity-70 hover:opacity-100" style={mono}>
          ← Back to Gym
        </Link>
      </footer>
    </div>
  );
};

export default GymPage2;
