import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    
    // Validate phone number
    if (!phone || phone.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY');
    if (!RETELL_API_KEY) {
      console.error('RETELL_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number for Retell AI (ensure it starts with +)
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;

    console.log(`Initiating Retell AI call to: ${formattedPhone}`);

    // Call Retell AI API to create phone call
    const retellResponse = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_number: '+15076687433',
        to_number: formattedPhone,
        agent_id: 'agent_63426c2713064c5f302799ae36',
      }),
    });

    const retellData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error('Retell AI error:', retellData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to initiate call',
          details: retellData 
        }),
        { status: retellResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Retell AI call initiated successfully:', retellData);

    return new Response(
      JSON.stringify({ 
        success: true,
        callId: retellData.call_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in retell-demo-call function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
