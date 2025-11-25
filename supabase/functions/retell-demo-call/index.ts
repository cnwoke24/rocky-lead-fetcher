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
    const { phone, userId } = await req.json();
    
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

    let agentId = 'agent_63426c2713064c5f302799ae36'; // Default demo agent
    let metadata: any = undefined;

    // If userId is provided, look up clinic-specific configuration
    if (userId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.74.0');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Look up user's clinic and agent configuration
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('clinic_id, clinics(id, retell_agent_id)')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'User profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!profile.clinic_id) {
        return new Response(
          JSON.stringify({ error: 'No clinic assigned to user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const clinic = Array.isArray(profile.clinics) ? profile.clinics[0] : profile.clinics;
      
      if (!clinic?.retell_agent_id) {
        return new Response(
          JSON.stringify({ error: 'No Retell agent ID configured for this clinic' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use clinic-specific agent and inject metadata
      agentId = clinic.retell_agent_id;
      metadata = {
        clinic_id: profile.clinic_id,
        agent_type: 'receptionist'
      };

      console.log(`Using clinic agent: ${agentId} for clinic: ${profile.clinic_id}`);
    }

    // Format phone number for Retell AI (ensure it starts with +)
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;

    console.log(`Initiating Retell AI call to: ${formattedPhone} using agent: ${agentId}`);

    // Build request body
    const requestBody: any = {
      from_number: '+19163144644',
      to_number: formattedPhone,
      agent_id: agentId,
    };

    // Add metadata only if it was set (clinic-specific calls)
    if (metadata) {
      requestBody.metadata = metadata;
      console.log('Metadata being sent to Retell:', JSON.stringify(metadata));
    } else {
      console.log('No metadata - using default demo agent');
    }

    console.log('Full request body to Retell:', JSON.stringify(requestBody));

    // Call Retell AI API to create phone call
    const retellResponse = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
