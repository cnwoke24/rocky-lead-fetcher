import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Phone, MessageSquare, Bell, BarChart3, Zap, Check } from "lucide-react";

const Index = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { email },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Could not start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Phone,
      title: "Instant calls & SMS",
      description: "Built on Retell AI voice.",
    },
    {
      icon: Zap,
      title: "Leadpages ready",
      description: "Connect and go live fast.",
    },
    {
      icon: Bell,
      title: "Owner notifications",
      description: "We text outcomes on every attempt.",
    },
    {
      icon: BarChart3,
      title: "Daily report",
      description: "See attempts, connects, bookings.",
    },
  ];

  const benefits = [
    "Call every lead in under 3 minutes",
    "Automated SMS follow-ups",
    "Real-time owner notifications",
    "Complete call transcripts & analytics",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center text-xl">
              🐾
            </div>
            <span className="text-xl font-bold">Rocky AI</span>
          </div>
          <Button variant="outline" size="sm" className="hidden md:flex">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl relative">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by Retell AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Turn new leads into booked gym visits in minutes
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
              Rocky AI calls every new lead within <span className="font-bold text-primary">3 minutes</span>, 
              follows up by SMS, and logs everything for you.
            </p>

            <form onSubmit={handleStartTrial} className="flex gap-4 justify-center flex-wrap mb-6">
              <Input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-sm h-12 text-base bg-card/50 backdrop-blur"
              />
              <Button 
                type="submit" 
                disabled={isLoading} 
                size="lg"
                className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? "Loading..." : "Start 14-day free trial"}
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground">
              $35/mo after trial · One-time setup fee billed after onboarding
            </p>
          </div>

          {/* Benefits List */}
          <div className={`mt-20 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-4 rounded-lg bg-card/30 backdrop-blur border border-border/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to convert leads</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rocky AI handles the heavy lifting so you can focus on running your gym
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-4xl text-center relative">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to convert more leads?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join gyms that are already using Rocky AI to turn leads into members faster
            </p>
            <Button 
              size="lg" 
              className="h-14 px-10 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center text-sm">
                🐾
              </div>
              <span>© 2025 Rocky AI. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
