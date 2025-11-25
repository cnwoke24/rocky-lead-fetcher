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
    let callDetails: any = null;

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
          callDetails = await callDetailsResponse.json();
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

    // Fallback 1: Check if clinic_id is directly in the webhook payload
    if (!clinicId) {
      clinicId = payload.metadata?.clinic_id ?? 
                 payload.call?.metadata?.clinic_id ?? 
                 null;
      if (clinicId) {
        console.log('Found clinic_id in webhook payload:', clinicId);
      }
    }

    // Fallback 2 (TEMPORARY for testing): Default to Rocky Demo Clinic 
    // if the agent_id matches your clinic's agent
    if (!clinicId) {
      const agentId = payload.agent_id || payload.call?.agent_id;
      if (agentId === 'agent_c0c778e41160a70636421bdbd4') {
        clinicId = '749d7134-de6e-4f50-a829-a60f43bb0641'; // Rocky Demo Clinic
        console.log('Using default clinic_id for Rocky Demo agent (TEMP):', clinicId);
      }
    }

    // Log final clinic_id status
    if (clinicId) {
      console.log('Final clinic_id to be sent to n8n:', clinicId);
    } else {
      console.warn('No clinic_id found after all fallback attempts');
    }

    // Extract patient information from call details
    const callAnalysis = callDetails?.call_analysis || payload.call_analysis || {};
    const patientEmail = callAnalysis.patient_email || 
                        callDetails?.metadata?.patient_email || 
                        payload.metadata?.patient_email || 
                        '';
    
    const patientType = (callAnalysis.patient_type || 
                         callDetails?.metadata?.patient_type || 
                         payload.metadata?.patient_type || 
                         'new').toLowerCase();
    
    const isNewPatient = patientType === 'new';
    
    // Build intake URL
    const basePortalUrl = 'https://www.myclinicportal.com';
    const mcpParam = clinicId ? clinicId.substring(0, 8) : 'default';
    const intakeUrl = `${basePortalUrl}/?mcp=${mcpParam}`;

    // Build simplified n8n payload
    const n8nPayload = {
      channel: 'email',
      name: isNewPatient ? 'send_link_new' : 'send_link_existing',
      address: patientEmail,
      url: intakeUrl,
      patient_type: isNewPatient ? 'new' : 'existing',
      clinic_id: clinicId,
    };

    console.log('Transformed n8n payload:', JSON.stringify(n8nPayload));

    // Forward simplified payload to n8n webhook
    const n8nWebhookUrl = 'https://rockyai.app.n8n.cloud/webhook/8b7d8918-f3c8-4edb-a9f6-8711604385ba';
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
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
