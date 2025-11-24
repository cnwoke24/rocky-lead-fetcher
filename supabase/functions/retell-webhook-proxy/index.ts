import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const retellApiKey = Deno.env.get('RETELL_API_KEY');
    if (!retellApiKey) {
      console.error('RETELL_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the webhook payload from Retell
    const payload = await req.json();
    console.log('Received webhook from Retell:', JSON.stringify(payload));

    // Extract call_id from the payload
    const callId = payload.call?.call_id || payload.call_id;
    console.log('Call ID:', callId);

    let clinicId = null;

    // If we have a call_id, fetch the call details from Retell to get metadata
    if (callId) {
      try {
        const callDetailsResponse = await fetch(`https://api.retellai.com/v2/get-call/${callId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${retellApiKey}`,
          },
        });

        if (callDetailsResponse.ok) {
          const callDetails = await callDetailsResponse.json();
          console.log('Call details from Retell:', JSON.stringify(callDetails));
          
          // Extract clinic_id from metadata
          if (callDetails.metadata?.clinic_id) {
            clinicId = callDetails.metadata.clinic_id;
            console.log('Found clinic_id in call metadata:', clinicId);
          }
        } else {
          console.error('Failed to fetch call details:', await callDetailsResponse.text());
        }
      } catch (error) {
        console.error('Error fetching call details:', error);
      }
    }

    // Enrich the payload with clinic_id
    const enrichedPayload = {
      ...payload,
      clinic_id: clinicId,
    };

    console.log('Enriched payload:', JSON.stringify(enrichedPayload));

    // Forward to n8n webhook
    const n8nWebhookUrl = 'https://rockyai.app.n8n.cloud/webhook/8b7d8918-f3c8-4edb-a9f6-8711604385ba';
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedPayload),
    });

    console.log('n8n response status:', n8nResponse.status);

    // Return success response to Retell
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in retell-webhook-proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
