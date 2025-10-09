import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, setupToken } = await req.json();

    // Verify setup token (you'll set this as a secret)
    const expectedToken = Deno.env.get("ADMIN_SETUP_TOKEN");
    if (!expectedToken || setupToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: "Invalid setup token" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if any admin already exists
    const { data: existingAdmins } = await supabaseClient
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({ error: "Admin already exists. Use admin panel to manage roles." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find user by email
    const { data: { users }, error: userError } = await supabaseClient.auth.admin.listUsers();
    
    if (userError) throw userError;

    const user = users.find(u => u.email === email);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found. Please sign up first." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add admin role
    const { error: roleError } = await supabaseClient
      .from("user_roles")
      .insert({ user_id: user.id, role: "admin" });

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({ success: true, message: "Admin role granted successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
