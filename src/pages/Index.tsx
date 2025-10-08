import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      title: "Instant calls & SMS",
      description: "Built on Retell AI voice.",
    },
    {
      title: "Leadpages ready",
      description: "Connect and go live fast.",
    },
    {
      title: "Owner notifications",
      description: "We text outcomes on every attempt.",
    },
    {
      title: "Daily report",
      description: "See attempts, connects, bookings.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="flex items-start gap-6 mb-12 flex-wrap">
          <div className="w-16 h-16 bg-border border-2 border-foreground rounded-xl flex items-center justify-center text-3xl font-bold shrink-0">
            🐾
          </div>
          <div className="flex-1 min-w-[280px]">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Turn new leads into booked gym visits in minutes
            </h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Rocky AI calls every new lead within <span className="font-bold text-foreground">3 minutes</span>, 
              follows up by SMS, and logs everything for you.
            </p>
            <form onSubmit={handleStartTrial} className="flex gap-3 flex-wrap">
              <Input
                type="email"
                placeholder="Work email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-xs"
              />
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? "Loading..." : "Start 14-day free trial"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-3">
              $35/mo after trial. One-time setup fee is billed after onboarding + DocuSign.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
