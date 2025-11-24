import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchAirtableCalls, calculateCallStats } from "../_shared/airtable.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[GET-CALL-STATS] Function invoked');

    // Extract JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[GET-CALL-STATS] Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('[GET-CALL-STATS] User authenticated:', user.email);

    // Fetch user's clinic_id from profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('clinic_id, clinics(airtable_base_id, airtable_table_name)')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[GET-CALL-STATS] Profile error:', profileError);
      throw new Error('Profile not found');
    }

    if (!profile.clinic_id) {
      console.log('[GET-CALL-STATS] No clinic assigned to user');
      return new Response(
        JSON.stringify({
          totalCallsToday: 0,
          newPatientsToday: 0,
          existingPatientsToday: 0,
          intakeLinksSent: 0,
          emailPercentage: 0,
          weeklyData: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clinic = profile.clinics as any;
    if (!clinic?.airtable_base_id) {
      throw new Error('Clinic Airtable configuration missing');
    }

    console.log('[GET-CALL-STATS] Calculating stats for clinic:', profile.clinic_id);

    // Fetch calls from Airtable (last 7 days for weekly data)
    const calls = await fetchAirtableCalls(
      clinic.airtable_base_id,
      clinic.airtable_table_name || 'Calls',
      profile.clinic_id
    );

    // Calculate statistics
    const stats = calculateCallStats(calls);

    return new Response(
      JSON.stringify(stats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET-CALL-STATS] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: errorMessage === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});