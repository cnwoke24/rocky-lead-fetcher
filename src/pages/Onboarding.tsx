import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { OnboardingChat } from "@/components/OnboardingChat";
import rockyLogo from "@/assets/rocky-logo.png";

const Onboarding = () => {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/signup");
      } else {
        setAuthChecking(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/signup");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img src={rockyLogo} alt="Rocky AI Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-4xl font-bold">Rocky AI</h1>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              Sign Out
            </Button>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome to your onboarding</h2>
          <p className="text-neutral-600">
            Let's get your custom voice agent configured for your business.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6 shadow-lg">
          <div className="text-center space-y-2 mb-6">
            <p className="text-neutral-600">
              Let's get started with a quick onboarding conversation
            </p>
            <p className="text-sm text-muted-foreground">
              Chat with Rocky to set up your account
            </p>
          </div>

          <OnboardingChat />
        </div>

        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="bg-[#D4AF37] hover:bg-[#C5A028] text-white"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
