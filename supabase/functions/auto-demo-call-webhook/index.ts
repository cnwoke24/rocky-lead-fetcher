import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retell-signature, x-webhook-secret",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type TranscriptTurn = { role?: string; content?: string };

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);

const deriveOutcome = (analysis: Record<string, unknown>, disconnect?: string) => {
  const custom = (analysis.custom_analysis_data ?? {}) as Record<string, unknown>;
  const explicit = asString(custom.outcome) ?? asString(custom.call_outcome) ?? asString(custom.disposition);
  if (explicit) return explicit;
  if (custom.appointment_booked === true || custom.booked === true) return "Booked";
  if (custom.callback_requested === true) return "Callback Requested";
  if (analysis.call_successful === false) return "Not Interested";
  if (disconnect && /voicemail|no_answer|dial_no_answer|dial_busy|dial_failed/i.test(disconnect)) return "No Answer";
  if (analysis.call_successful === true) return "Interested";
  return "Completed";
};

const buildTranscript = (call: Record<string, unknown>) => {
  const objectTranscript = call.transcript_object;
  if (Array.isArray(objectTranscript)) {
    return (objectTranscript as TranscriptTurn[])
      .map((turn) => `${turn.role === "agent" ? "Rocky AI" : "Customer"}: ${turn.content ?? ""}`.trim())
      .join("\n");
  }
  return asString(call.transcript) ?? null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const expectedSecret = Deno.env.get("AUTO_DEMO_WEBHOOK_SECRET");
    if (expectedSecret) {
      const url = new URL(req.url);
      const provided = req.headers.get("x-webhook-secret") ?? url.searchParams.get("secret");
      if (provided !== expectedSecret) return json({ error: "Unauthorized" }, 401);
    }

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") return json({ received: true, ignored: "invalid body" });

    const body = payload as Record<string, unknown>;
    const event = asString(body.event) ?? asString(body.event_type) ?? "unknown";
    const call = (body.call ?? body) as Record<string, unknown>;
    const callId = asString(call.call_id) ?? asString(body.call_id);

    if (!callId) return json({ received: true, ignored: "missing call_id" });
    if (event === "call_started") return json({ received: true, ignored: "call_started" });

    const analysis = (call.call_analysis ?? {}) as Record<string, unknown>;
    const metadata = (call.metadata ?? {}) as Record<string, unknown>;
    const durationMs = typeof call.duration_ms === "number" ? call.duration_ms : undefined;
    const startMs = typeof call.start_timestamp === "number" ? call.start_timestamp : undefined;
    const endMs = typeof call.end_timestamp === "number" ? call.end_timestamp : undefined;
    const disconnect = asString(call.disconnection_reason);

    const row: Record<string, unknown> = {
      call_id: callId,
      customer_slug: asString(metadata.customer_slug) ?? null,
      agent_id: asString(call.agent_id) ?? null,
      from_number: asString(call.from_number) ?? null,
      to_number: asString(call.to_number) ?? null,
      call_status: asString(call.call_status) ?? event,
      outcome: deriveOutcome(analysis, disconnect),
      duration_seconds: durationMs !== undefined
        ? Math.round(durationMs / 1000)
        : startMs !== undefined && endMs !== undefined ? Math.round((endMs - startMs) / 1000) : null,
      summary: asString(analysis.call_summary) ?? null,
      transcript: buildTranscript(call),
      recording_url: asString(call.recording_url) ?? null,
      sentiment: asString(analysis.user_sentiment) ?? null,
      disconnection_reason: disconnect ?? null,
      raw: body,
      started_at: startMs ? new Date(startMs).toISOString() : null,
      ended_at: endMs ? new Date(endMs).toISOString() : null,
    };

    for (const key of Object.keys(row)) {
      if (row[key] === null && key !== "raw") delete row[key];
    }
    row.raw = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("demo_call_results").upsert(row, { onConflict: "call_id" });
    if (error) console.error("Failed to store call result", error);

    console.log("Stored call result", { callId, event, outcome: row.outcome, slug: row.customer_slug });
    return json({ received: true });
  } catch (err) {
    console.error("auto-demo-call-webhook failure", err);
    return json({ received: true });
  }
});
