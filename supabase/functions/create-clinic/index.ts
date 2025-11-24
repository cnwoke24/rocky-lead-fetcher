import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the JWT from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated and has admin role
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, clinicName } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has a clinic
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (existingProfile?.clinic_id) {
      return new Response(
        JSON.stringify({ error: 'User already has a clinic assigned' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate clinic ID
    const clinicId = crypto.randomUUID();

    // Get user email for default clinic name
    const { data: userData } = await supabase
      .from('profiles')
      .select('email, company_name')
      .eq('id', userId)
      .single();

    const defaultClinicName = clinicName || 
      userData?.company_name || 
      `Clinic for ${userData?.email || 'User'}`;

    // Create clinic record with placeholder Airtable config
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert({
        id: clinicId,
        name: defaultClinicName,
        airtable_base_id: 'placeholder', // Admin needs to configure this
        airtable_table_name: 'Calls'
      })
      .select()
      .single();

    if (clinicError) {
      console.error('Error creating clinic:', clinicError);
      return new Response(
        JSON.stringify({ error: 'Failed to create clinic' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user's profile with clinic_id
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ clinic_id: clinicId })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      // Rollback: delete the clinic we just created
      await supabase.from('clinics').delete().eq('id', clinicId);
      return new Response(
        JSON.stringify({ error: 'Failed to assign clinic to user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update agent_status with clinic_id
    const { error: agentError } = await supabase
      .from('agent_status')
      .update({ clinic_id: clinicId })
      .eq('user_id', userId);

    if (agentError) {
      console.error('Error updating agent_status:', agentError);
    }

    console.log('Clinic created successfully:', clinic);

    return new Response(
      JSON.stringify({ 
        success: true,
        clinic 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-clinic function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
