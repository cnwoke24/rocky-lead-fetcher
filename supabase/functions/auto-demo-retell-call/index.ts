import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const FALLBACK_AGENT_ID = "agent_207fae2372f9309f151c8bb69b";
const FROM_NUMBER = "+14722261802";

const EDITABLE_FIELDS = [
  "first_name", "last_name", "phone_number", "email",
  "vehicle_year", "vehicle_make", "vehicle_model",
  "completed_visits", "current_visit_stage", "last_visit_date",
  "last_service", "recommended_service", "loyalty_credit",
  "campaign_goal", "reason_for_call", "offer_description",
] as const;

const normalizePhone = (value: string) => {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  const bare = digits.replace(/\D/g, "");
  if (bare.length === 10) return `+1${bare}`;
  if (bare.length === 11 && bare.startsWith("1")) return `+${bare}`;
  return `+${bare}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action: string = body.action ?? "call";
    const slug: string = typeof body.slug === "string" && body.slug.length <= 64 ? body.slug : "bob";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (action === "list") {
      const { data, error } = await supabase.from("demo_customers").select("*").order("created_at");
      if (error) return json({ error: error.message }, 500);
      return json({ customers: data ?? [] });
    }

    if (action === "update") {
      const patch: Record<string, unknown> = {};
      for (const field of EDITABLE_FIELDS) {
        if (body.values && body.values[field] !== undefined) patch[field] = body.values[field];
      }
      if (!Object.keys(patch).length) return json({ error: "No valid fields provided" }, 400);
      const { data, error } = await supabase
        .from("demo_customers").update(patch).eq("slug", slug).select("*").maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: `No demo customer found for "${slug}"` }, 404);
      return json({ customer: data });
    }

    if (action !== "call") return json({ error: "Unsupported action" }, 400);

    const { data: customer, error } = await supabase
      .from("demo_customers").select("*").eq("slug", slug).maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!customer) return json({ error: `No demo customer found for "${slug}"` }, 404);

    const apiKey = Deno.env.get("RETELL_API_KEY");
    if (!apiKey) return json({ error: "The voice provider is not connected yet." }, 500);

    const agentId = Deno.env.get("RETELL_AUTO_DEMO_AGENT_ID") || FALLBACK_AGENT_ID;

    const toNumber = normalizePhone(
      typeof body.phone === "string" && body.phone.trim() ? body.phone : customer.phone_number,
    );
    if (toNumber.replace(/\D/g, "").length < 11) {
      return json({ error: "The phone number on this record is not a valid US mobile number." }, 400);
    }

    const dynamicVariables = {
      first_name: String(customer.first_name ?? ""),
      vehicle_year: String(customer.vehicle_year ?? ""),
      vehicle_make: String(customer.vehicle_make ?? ""),
      vehicle_model: String(customer.vehicle_model ?? ""),
      completed_visits: String(customer.completed_visits ?? ""),
      current_visit_stage: String(customer.current_visit_stage ?? ""),
      last_visit_date: String(customer.last_visit_date ?? ""),
      last_service: String(customer.last_service ?? ""),
      recommended_service: String(customer.recommended_service ?? ""),
      loyalty_credit: String(customer.loyalty_credit ?? ""),
      campaign_goal: String(customer.campaign_goal ?? ""),
      reason_for_call: String(customer.reason_for_call ?? ""),
      offer_description: String(customer.offer_description ?? ""),
    };

    console.log("Placing auto-demo call", { agentId, toNumber, slug });

    const response = await fetch("https://api.retellai.com/v2/create-phone-call", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from_number: FROM_NUMBER,
        to_number: toNumber,
        agent_id: agentId,
        retell_llm_dynamic_variables: dynamicVariables,
        metadata: { demo: "mikes-motor-zone", customer_slug: slug },
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Retell error", result);
      const detail = (result as { message?: string; error_message?: string }).message
        ?? (result as { error_message?: string }).error_message
        ?? "The voice provider rejected the call.";
      return json({ error: detail, details: result }, response.status);
    }

    return json({
      success: true,
      callId: (result as { call_id?: string }).call_id,
      to: toNumber,
      variables: dynamicVariables,
    });
  } catch (err) {
    console.error("auto-demo-retell-call failure", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
