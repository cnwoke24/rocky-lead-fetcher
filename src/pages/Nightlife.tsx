import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Bell, Database, Users, MessageSquare, ArrowRight, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TryMeModal from "@/components/TryMeModal";

const BRAND_START = "#7C3AED"; // purple-600
const BRAND_END = "#D946EF";   // fuchsia-500

const Nightlife = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [navStyle, setNavStyle] = useState(false);
  const [tryOpen, setTryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setNavStyle(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to start your free trial.",
        variant: "destructive",
      });
      return;
    }

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
    {
      icon: Phone,
      title: "Calls & SMS Handling",
      description: "AI answers calls instantly AND responds to guest texts about table availability, bottle options, and VIP sections—all in natural conversation.",
    },
    {
      icon: Database,
      title: "Live Availability Updates",
      description: "Automatically syncs with your CRM to check which sections are open, what bottles are available, and updates booking status in real-time.",
    },
    {
      icon: Bell,
      title: "Instant Alerts",
      description: "Get SMS notifications for every booking, text inquiry, or status change—so you're always in the loop without being on your phone 24/7.",
    },
    {
      icon: Users,
      title: "VIP Tracking",
      description: "Track guest preferences, booking history, no-show patterns, and high-value VIP behavior to optimize your service and revenue.",
    },
  ];

  const venues = [
    "Velvet Nightclub",
    "Neon Lounge",
    "The Electric Room",
    "Luxe Nightlife",
    "Pulse Nightclub",
    "Crown Bottle Service",
  ];

  const faqs = [
    {
      question: "Can the AI handle complex text conversations about bottle packages?",
      answer: "Yes. The AI is trained on your bottle menu, section layouts, and pricing. It can discuss options, upsell packages, and answer detailed questions via text.",
    },
    {
      question: "Does it integrate with my current reservation/CRM system?",
      answer: "We integrate with most popular venue management systems (Tablelist, SevenRooms, etc.) or can work with your custom spreadsheet setup.",
    },
    {
      question: "What if a guest wants to negotiate pricing or has a special request?",
      answer: "The AI can flag VIP requests or custom negotiations and loop you in via SMS, or handle them based on your pre-set guidelines.",
    },
    {
      question: "Can it send confirmation texts before events?",
      answer: "Absolutely. The AI sends automated 'Just confirming your table tonight' texts to reduce no-shows and keep guests engaged.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text {
          background: linear-gradient(135deg, ${BRAND_START} 0%, ${BRAND_END} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-bg {
          background: linear-gradient(135deg, ${BRAND_START} 0%, ${BRAND_END} 100%);
        }
        .neon-glow {
          box-shadow: 0 0 30px rgba(217, 70, 239, 0.4), 0 0 60px rgba(124, 58, 237, 0.2);
        }
        .neon-glow-text {
          text-shadow: 0 0 20px rgba(217, 70, 239, 0.6);
        }
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .marquee {
          display: flex;
          overflow: hidden;
          user-select: none;
          gap: 2rem;
        }
        .marquee-content {
          flex-shrink: 0;
          display: flex;
          gap: 2rem;
          min-width: 100%;
          animation: scroll 30s linear infinite;
        }
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>

      <TryMeModal open={tryOpen} onClose={() => setTryOpen(false)} />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navStyle ? "bg-black/95 backdrop-blur-md shadow-lg shadow-purple-500/10" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/rocky-logo.png" alt="Rocky AI" className="h-8 w-8" />
            <span className="text-xl font-bold gradient-text">Rocky AI</span>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => go("features")} className="text-gray-300 hover:text-purple-400 transition-colors">
              Features
            </button>
            <button onClick={() => go("pricing")} className="text-gray-300 hover:text-purple-400 transition-colors">
              Pricing
            </button>
            <button onClick={() => go("faq")} className="text-gray-300 hover:text-purple-400 transition-colors">
              FAQ
            </button>
            <Button onClick={() => go("trial")} className="gradient-bg text-white hover:opacity-90 neon-glow">
              Get Started
            </Button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <button onClick={() => go("features")} className="text-gray-300 hover:text-purple-400 transition-colors text-left">
                Features
              </button>
              <button onClick={() => go("pricing")} className="text-gray-300 hover:text-purple-400 transition-colors text-left">
                Pricing
              </button>
              <button onClick={() => go("faq")} className="text-gray-300 hover:text-purple-400 transition-colors text-left">
                FAQ
              </button>
              <Button onClick={() => go("trial")} className="gradient-bg text-white hover:opacity-90 w-full">
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-black via-purple-950 to-purple-900">
        <div className="container mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-6">
            Voice + SMS + CRM Integration
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Handle Table Bookings & Guest Texts 24/7 With{" "}
            <span className="gradient-text neon-glow-text">AI-Powered Communications</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            AI that answers calls AND texts for reservations, section availability, bottle service, and VIP bookings—while keeping your CRM updated in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setTryOpen(true)}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 neon-glow"
            >
              Try It Now
            </Button>
            <Button
              onClick={() => go("trial")}
              size="lg"
              variant="outline"
              className="text-lg px-8 border-2 border-purple-500 bg-transparent text-white hover:bg-purple-600/20"
            >
              Get Started Tonight <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 bg-gray-900/50 border-y border-gray-800">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400 mb-6">Trusted by premier nightlife venues</p>
          <div className="marquee">
            <div className="marquee-content">
              {[...venues, ...venues].map((venue, i) => (
                <div key={i} className="text-gray-500 font-semibold whitespace-nowrap">
                  {venue}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-black">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 reveal gradient-text">
            Everything You Need To Run Your Venue
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="reveal p-8 bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg hover:border-purple-500/60 transition-all neon-glow"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mb-4 neon-glow">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-purple-950/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 reveal gradient-text">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Connect Your Booking System & Phone Line",
                description: "Integrate with your existing CRM, reservation system, or spreadsheet",
              },
              {
                step: "2",
                title: "AI Handles Calls & Texts in Real-Time",
                description: "Answers: 'What sections are available Saturday?' or 'Can I get Grey Goose with my table?' AI checks your CRM, confirms availability, discusses bottle packages, and books the reservation.",
              },
              {
                step: "3",
                title: "You Get Instant Updates & Analytics",
                description: "Every booking, text conversation, and status change flows into your dashboard with nightly reports",
              },
            ].map((item, i) => (
              <div key={i} className="reveal text-center" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 neon-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases - SMS Examples */}
      <section className="py-20 px-4 bg-black">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 reveal gradient-text">
            Real Conversations, Real Results
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Section Availability",
                messages: [
                  { from: "guest", text: "Hey, do you still have booths available for Saturday?" },
                  { from: "ai", text: "Yes! We have 2 VIP booths left. $2,500 min. Includes Grey Goose, Patron, mixers. Want to reserve?" },
                  { from: "guest", text: "What's the view like?" },
                  { from: "ai", text: "Booth 7 has direct dance floor view. Booth 12 overlooks the DJ booth. Both premium spots." },
                ],
              },
              {
                title: "Bottle Service Inquiry",
                messages: [
                  { from: "guest", text: "What bottles come with the $3k package?" },
                  { from: "ai", text: "The $3k package includes: 2 bottles premium vodka (your choice), 1 champagne bottle, mixers, and reserved seating for up to 8 guests." },
                  { from: "guest", text: "Perfect, book it" },
                  { from: "ai", text: "Booked! Section 5 for Saturday 11pm. Confirmation sent to your phone." },
                ],
              },
              {
                title: "Pre-Event Confirmation",
                messages: [
                  { from: "ai", text: "Hey Marcus! Just confirming your table for tonight at 11pm. Section 5, 6 guests, Grey Goose package. Reply YES to confirm." },
                  { from: "guest", text: "Yes, we're coming!" },
                  { from: "ai", text: "Perfect! See you at 11. Text us when you arrive and we'll get you seated right away." },
                ],
              },
            ].map((useCase, i) => (
              <div
                key={i}
                className="reveal p-6 bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold mb-4 text-purple-400">{useCase.title}</h3>
                <div className="space-y-3">
                  {useCase.messages.map((msg, j) => (
                    <div
                      key={j}
                      className={`p-3 rounded-lg text-sm ${
                        msg.from === "guest"
                          ? "bg-gray-700 text-gray-200 ml-4"
                          : "bg-purple-600/30 text-white mr-4 border border-purple-500/30"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-black to-purple-950/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 reveal gradient-text">
            Simple, Transparent Pricing
          </h2>
          <div className="max-w-lg mx-auto reveal">
            <div className="p-8 bg-gray-800 border-2 border-purple-500 rounded-lg neon-glow">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold gradient-text mb-2">$35/mo</div>
                <div className="text-gray-400">+ $450 one-time setup</div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited calls & SMS conversations",
                  "Real-time CRM/booking system integration",
                  "Section & bottle availability checks",
                  "VIP guest history tracking",
                  "Automated confirmation texts",
                  "Promoter notifications + nightly reports",
                  "Handles reservations, walk-ins, and special requests",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => go("trial")} className="w-full gradient-bg text-white text-lg py-6 neon-glow hover:opacity-90">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-black">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 reveal gradient-text">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="reveal p-6 bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold mb-3 text-purple-400">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="trial" className="py-20 px-4 bg-gradient-to-b from-black via-purple-950/50 to-black">
        <div className="container mx-auto text-center max-w-2xl reveal">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text neon-glow-text">
            Ready to Handle Every Guest 24/7?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start your free trial today. No credit card required.
          </p>
          <form onSubmit={handleStartTrial} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-purple-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="gradient-bg text-white px-8 py-3 neon-glow hover:opacity-90"
            >
              {loading ? "Processing..." : "Start Free Trial"}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black border-t border-gray-800">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src="/rocky-logo.png" alt="Rocky AI" className="h-6 w-6" />
              <span className="font-semibold gradient-text">Rocky AI</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                Main Site
              </a>
              <a href="/physical-therapy" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                For Physical Therapy
              </a>
              <a href="/nightlife" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                For Nightlife
              </a>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Rocky AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Nightlife;
