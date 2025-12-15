import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchAirtableCalls } from "../_shared/airtable.ts";

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
    console.log('[GET-RECENT-CALLS] Function invoked');

    // Extract JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    // Parse request body for limit parameter
    const { limit = 20 } = req.method === 'POST' ? await req.json() : {};

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
      console.error('[GET-RECENT-CALLS] Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('[GET-RECENT-CALLS] User authenticated:', user.email);

    // Fetch user's clinic_id from profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('clinic_id, clinics(airtable_base_id, airtable_table_name, airtable_display_fields)')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[GET-RECENT-CALLS] Profile error:', profileError);
      throw new Error('Profile not found');
    }

    if (!profile.clinic_id) {
      console.log('[GET-RECENT-CALLS] No clinic assigned to user');
      return new Response(
        JSON.stringify({ calls: [], displayFields: [], message: 'No clinic assigned' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clinic = profile.clinics as any;
    if (!clinic?.airtable_base_id) {
      throw new Error('Clinic Airtable configuration missing');
    }

    // Get display fields configuration
    const displayFields = clinic.airtable_display_fields || [
      "Caller Name", "Phone Number", "Email Address", "Patient Type", 
      "Call Status", "Call Summary", "Duration Seconds", "Needs Callback"
    ];

    console.log('[GET-RECENT-CALLS] Fetching recent calls for clinic:', profile.clinic_id);

    // Fetch recent calls from Airtable
    const calls = await fetchAirtableCalls(
      clinic.airtable_base_id,
      clinic.airtable_table_name || 'Calls',
      profile.clinic_id,
      {
        maxRecords: limit,
        sort: [{ field: 'Created time', direction: 'desc' }],
      }
    );

    return new Response(
      JSON.stringify({ calls, displayFields }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET-RECENT-CALLS] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: errorMessage === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});