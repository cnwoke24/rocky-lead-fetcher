import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import rockyLogo from "@/assets/rocky-logo.png";

const SubscriptionPayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subscription && ['trial', 'active'].includes(subscription.status)) {
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast({
          title: "Error",
          description: "You must be logged in to continue",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { email: user.email },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const benefits = [
    {
      title: "Ongoing Support",
      description: "Direct access to our team for assistance whenever you need it",
      included: true,
    },
    {
      title: "Message & Workflow Updates",
      description: "Modify your agent's messaging anytime at no extra cost",
      included: true,
    },
    {
      title: "Free Revisions (4 Months)",
      description: "Unlimited changes to your voice agent for the first 4 months",
      included: true,
    },
    {
      title: "Daily Analytics Summaries",
      description: "Track your agent's performance with detailed daily reports",
      included: true,
    },
    {
      title: "Future Integrations",
      description: "Free access to Slack alerts, SMS notifications, and more as they launch",
      included: true,
    },
    {
      title: "Voice Agent Maintenance",
      description: "We keep your agent running smoothly with regular updates",
      included: true,
    },
    {
      title: "14-Day Free Trial",
      description: "Try Rocky AI risk-free with no commitment",
      included: true,
    },
  ];

  const additionalServices = [
    {
      title: "Voice Agent Workflow Modifications",
      description: "Major changes to call flow logic (may incur additional fees)",
      included: false,
    },
    {
      title: "Additional Voice Agents",
      description: "Create new campaigns with separate voice agents (separate pricing)",
      included: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={rockyLogo} alt="Rocky AI" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Rocky AI</h1>
              <p className="text-xs text-muted-foreground">Voice Agent Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Start Your Free Trial
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Experience the power of AI voice agents
          </p>
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground mt-6">
            <span className="text-primary">$35</span>
            <span className="text-lg text-muted-foreground font-normal">/month</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            after your 14-day free trial • Cancel anytime
          </p>
        </div>

        <Card className="mb-8 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">What's Included</CardTitle>
            <CardDescription>
              Everything you need to run successful AI voice campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-8 border-muted">
          <CardHeader>
            <CardTitle className="text-lg">Additional Services Available</CardTitle>
            <CardDescription className="text-sm">
              Contact your account executive for pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {additionalServices.map((service, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm mb-0.5">{service.title}</h3>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full max-w-md h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up your trial...
              </>
            ) : (
              "Start 14-Day Free Trial"
            )}
          </Button>
          
          <div className="text-center space-y-2 text-sm text-muted-foreground max-w-md">
            <p className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4 text-primary" /> No credit card required for trial
            </p>
            <p className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4 text-primary" /> Cancel anytime before trial ends
            </p>
            <p className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4 text-primary" /> Instant setup after checkout
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            Questions about billing or need help?{" "}
            <button className="text-primary hover:underline font-medium">
              Contact Support
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPayment;
