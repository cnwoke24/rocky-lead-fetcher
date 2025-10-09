import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import rockyLogo from "@/assets/rocky-logo.png";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'openai-chatkit': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        style?: React.CSSProperties;
        'workflow-id'?: string;
        version?: string;
      };
    }
  }
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [chatkitLoaded, setChatkitLoaded] = useState(false);

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
    // Load ChatKit script
    const script = document.createElement("script");
    script.src = "https://cdn.platform.openai.com/deployments/chatkit/chatkit.js";
    script.async = true;
    script.onload = () => setChatkitLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!chatkitLoaded) return;

    const initializeChatKit = async () => {
      const el = document.getElementById('rocky-chat') as any;
      if (!el || el.hasAttribute('data-initialized')) return;

      try {
        // Ensure the custom element is defined
        if (window.customElements && !window.customElements.get('openai-chatkit')) {
          console.log('[ChatKit] waiting for custom element definition...');
          try {
            await (window.customElements as any).whenDefined('openai-chatkit');
          } catch (e) {
            console.warn('[ChatKit] custom element whenDefined failed', e);
          }
        }

        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || `anon-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;

        // Get token from backend with user ID
        const { data, error } = await supabase.functions.invoke('chatkit-session', {
          body: { user: userId }
        });
        if (error) throw error;
        console.log('[ChatKit] token received?', !!(data as any)?.token);

        // Wait until setOptions is available
        let attempts = 0;
        while (attempts < 20 && (typeof el.setOptions !== 'function')) {
          attempts++;
          await new Promise((r) => setTimeout(r, 100));
        }
        console.log('[ChatKit] element ready?', typeof el.setOptions === 'function');

        if (typeof el.setOptions !== 'function') {
          console.error('[ChatKit] setOptions is not available on element');
          return;
        }

        // Initialize ChatKit with token only (workflow set via HTML attributes)
        el.setOptions({
          token: (data as any).token
        });

        el.setAttribute('data-initialized', 'true');
        console.log('[ChatKit] Initialized with token');

        // Event listeners for debugging
        el.addEventListener('chatkit.ready', () => console.log('[ChatKit] Widget ready'));
        el.addEventListener('chatkit.response.start', () => console.log('[ChatKit] AI streaming...'));
        el.addEventListener('error', (e: any) => console.error('[ChatKit] Error:', e.detail || e));
      } catch (error) {
        console.error('Failed to initialize ChatKit:', error);
      }
    };

    initializeChatKit();
  }, [chatkitLoaded]);

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

        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6 shadow-lg">
          <openai-chatkit 
            id="rocky-chat" 
            workflow-id="wf_68e7e5ca571881908542b343253306900a32b7fa93548573"
            version="1"
            style={{ height: '560px', width: '100%', display: 'block' }} 
          />
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