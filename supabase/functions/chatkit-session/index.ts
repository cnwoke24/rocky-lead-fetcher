import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Parse request body to get user info
    let requestBody: any = {};
    try {
      requestBody = await req.json();
    } catch {
      // Body is optional, will use anonymous user
    }

    const inputUser = requestBody?.user;
    // Normalize user to object with id
    const user = typeof inputUser === 'string'
      ? { id: inputUser }
      : (inputUser && typeof inputUser === 'object')
        ? inputUser
        : { id: `anon-${crypto.randomUUID()}` };

    // Create a ChatKit session token via OpenAI API
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
      },
      body: JSON.stringify({
        user,
        workflow: {
          id: 'wf_68e7e5ca571881908542b343253306900a32b7fa93548573',
          version: '1'
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${error}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const data = await response.json();
    console.log('[ChatKit Session] Response:', { hasClientSecret: !!data.client_secret, hasToken: !!data.token });
    
    return new Response(
      JSON.stringify({ 
        token: data.client_secret?.value || data.token,
        expires_at: data.expires_at 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in chatkit-session:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
