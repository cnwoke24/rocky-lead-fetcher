import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GymPage3 = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  const chalk = "#faf9f5";
  const ink = "#111111";
  const sprint = "#ff3e00";

  const display = { fontFamily: "'Oswald', sans-serif" };
  const mono = { fontFamily: "'Space Mono', monospace" };
  const body = { fontFamily: "'Chivo', sans-serif" };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-gym-checkout", {
        body: { email: email || undefined },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Checkout failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const benefits = [
    "14-day free trial — no charge today",
    "AI voice agent that calls & qualifies leads 24/7",
    "Daily analytics & lead summaries",
    "Unlimited message & workflow updates (4 months)",
    "Direct Slack & SMS alerts on new leads",
    "Cancel anytime, no contract",
  ];

  return (
    <div
      className="min-h-dvh selection:bg-[#ff3e00] selection:text-[#faf9f5] overflow-x-hidden"
      style={{ background: chalk, color: ink, ...body }}
    >
      <header
        className="flex items-center justify-between px-5 sm:px-6 py-4 border-b-2"
        style={{ borderColor: ink }}
      >
        <div className="font-bold tracking-tighter text-base sm:text-xl uppercase" style={mono}>
          Rocky AI <span style={{ color: sprint }}>//</span> Start Trial
        </div>
        <div className="text-xs uppercase tracking-widest hidden sm:block" style={mono}>
          14 Days Free
        </div>
      </header>

      <section className="p-6 sm:p-10 lg:p-16 border-b-2" style={{ borderColor: ink }}>
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-4xl">
          <div
            className="inline-block px-3 py-1 mb-6 border-2 text-xs uppercase tracking-widest"
            style={{ borderColor: ink, background: sprint, color: chalk, ...mono }}
          >
            Limited Onboarding Spots
          </div>
          <h1
            className="text-5xl sm:text-7xl lg:text-8xl font-bold uppercase leading-[0.9] tracking-tighter mb-6"
            style={display}
          >
            Turn Every Lead Into A <span style={{ color: sprint }}>Booked Tour.</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mb-8 opacity-80">
            Rocky is your AI voice agent that calls, qualifies, and books gym leads while you're
            running classes. Start free for 14 days — pay nothing today.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 max-w-xl p-2 border-2"
            style={{ borderColor: ink, background: chalk }}
          >
            <input
              type="email"
              inputMode="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-4 bg-transparent outline-none text-base"
              style={mono}
            />
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="px-6 py-4 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: ink, color: chalk, ...mono }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Start Free Trial
                </>
              )}
            </button>
          </div>
          <p className="text-xs mt-3 opacity-60" style={mono}>
            $35/mo after trial • Cancel anytime • Card required by Stripe
          </p>
        </motion.div>
      </section>

      <section className="p-6 sm:p-10 lg:p-16 border-b-2" style={{ borderColor: ink, background: ink, color: chalk }}>
        <div className="max-w-5xl">
          <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tighter mb-10" style={display}>
            What's <span style={{ color: sprint }}>Included</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-5 border-2"
                style={{ borderColor: chalk }}
              >
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: sprint }} />
                <span className="text-base sm:text-lg">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="p-6 sm:p-10 lg:p-16 border-b-2" style={{ borderColor: ink }}>
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-widest mb-4 opacity-60" style={mono}>
            Pricing
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-7xl sm:text-8xl font-bold tracking-tighter" style={display}>
              $35
            </span>
            <span className="text-2xl opacity-60" style={mono}>
              /month
            </span>
          </div>
          <p className="text-lg opacity-80 mb-8">
            14 days completely free. After that, $35/month flat. No setup fees. No per-call charges.
            Cancel from your dashboard anytime.
          </p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-8 py-5 font-bold uppercase tracking-wider text-base flex items-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: sprint, color: chalk, ...mono }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Loading
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Claim Your 14 Days Free
              </>
            )}
          </button>
        </div>
      </section>

      <footer className="p-6 sm:p-10" style={{ background: chalk }}>
        <div className="text-xs uppercase tracking-widest opacity-60" style={mono}>
          © Rocky AI — Built for gym owners who'd rather be coaching.
        </div>
      </footer>
    </div>
  );
};

export default GymPage3;
