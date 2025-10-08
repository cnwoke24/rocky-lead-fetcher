import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Load Calendly widget
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-border border-2 border-foreground rounded-xl flex items-center justify-center text-2xl font-bold">
              🐾
            </div>
            <h1 className="text-4xl font-bold">Rocky AI</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Book your onboarding call</h2>
          <p className="text-muted-foreground">
            We'll configure your custom voice agent for Evolve Fitness and connect your lead source.
          </p>
          {sessionId && (
            <p className="text-sm text-muted-foreground mt-2">
              Session ID: {sessionId}
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/YOUR-NAME/30min"
            style={{ minWidth: "320px", height: "720px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
