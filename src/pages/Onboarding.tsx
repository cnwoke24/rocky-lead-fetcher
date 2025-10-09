import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import rockyLogo from "@/assets/rocky-logo.png";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Rocky 🐾 Let's get your AI voice agent set up. First, what's your business name?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-chat`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: userMessage }] }),
      });

      if (resp.status === 429) {
        toast({
          title: "Rate limit exceeded",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
        return;
      }

      if (resp.status === 402) {
        toast({
          title: "Service unavailable",
          description: "Please contact support.",
          variant: "destructive",
        });
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to start stream");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Check if onboarding is complete based on message content
      if (assistantContent.toLowerCase().includes("setup call") || 
          assistantContent.toLowerCase().includes("book") ||
          assistantContent.toLowerCase().includes("everything you need")) {
        setOnboardingComplete(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    await streamChat(userMessage);
    setIsLoading(false);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B63D8] mx-auto mb-4"></div>
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

        {!onboardingComplete ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6 shadow-lg">
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-[#0B63D8] text-white"
                          : "bg-neutral-100 text-neutral-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? "..." : "Send"}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Book your setup call</h3>
              <p className="text-neutral-600 mb-4">
                Great! Now let's schedule a time to configure your custom voice agent.
              </p>
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/YOUR-NAME/30min"
                style={{ minWidth: "320px", height: "600px" }}
              />
            </div>

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
              >
                Continue to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Onboarding;