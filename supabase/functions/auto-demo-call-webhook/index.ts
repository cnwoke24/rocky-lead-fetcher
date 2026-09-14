import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retell-signature, x-webhook-secret",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type TranscriptTurn = { role?: string; content?: string };
type Outcome = "Spoke with customer" | "Voicemail" | "No answer";

const DAY_MS = 86_400_000;
const RETRY_DAYS = 3;
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);

const truthy = (value: unknown) =>
  value === true || (typeof value === "string" && /^(true|yes|y|1|booked|confirmed)$/i.test(value.trim()));

/** Lowercases and snake_cases custom analysis keys so "Visit Booked" and "visit_booked" match. */
const normalizeKeys = (input: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) out[key.trim().toLowerCase().replace(/[\s-]+/g, "_")] = value;
  return out;
};

const deriveOutcome = (call: Record<string, unknown>, analysis: Record<string, unknown>, disconnect?: string): Outcome => {
  if (analysis.in_voicemail === true || call.in_voicemail === true) return "Voicemail";
  if (disconnect && /voicemail/i.test(disconnect)) return "Voicemail";
  if (disconnect && /dial_no_answer|dial_busy|dial_failed|no_answer|machine_detected/i.test(disconnect)) return "No answer";
  return "Spoke with customer";
};

/** Resolves phrases like "next Wednesday", "tomorrow", "Friday", or an ISO date relative to the call end. Returns null when unknown. */
const parseVisitDay = (text: string | undefined, from: Date): Date | null => {
  if (!text) return null;
  const value = text.trim().toLowerCase();
  const iso = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const date = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T12:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const us = value.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (us) {
    const year = us[3] ? (us[3].length === 2 ? 2000 + Number(us[3]) : Number(us[3])) : from.getUTCFullYear();
    const date = new Date(Date.UTC(year, Number(us[1]) - 1, Number(us[2]), 12));
    if (!Number.isNaN(date.getTime())) return date < from && !us[3] ? new Date(date.getTime() + 365 * DAY_MS) : date;
  }
  const base = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 12));
  if (/\btoday\b/.test(value)) return base;
  if (/\btomorrow\b/.test(value)) return new Date(base.getTime() + DAY_MS);
  const weekday = WEEKDAYS.findIndex((day) => value.includes(day) || value.includes(day.slice(0, 3)));
  if (weekday >= 0) {
    let delta = (weekday - base.getUTCDay() + 7) % 7;
    if (delta === 0) delta = 7;
    if (/\bnext\b/.test(value) && delta < 3) delta += 7;
    return new Date(base.getTime() + delta * DAY_MS);
  }
  const inDays = value.match(/in\s+(\d+)\s+days?/);
  if (inDays) return new Date(base.getTime() + Number(inDays[1]) * DAY_MS);
  if (/next week/.test(value)) return new Date(base.getTime() + 7 * DAY_MS);
  return null;
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
    const custom = normalizeKeys((analysis.custom_analysis_data ?? {}) as Record<string, unknown>);
    const metadata = (call.metadata ?? {}) as Record<string, unknown>;
    const durationMs = typeof call.duration_ms === "number" ? call.duration_ms : undefined;
    const startMs = typeof call.start_timestamp === "number" ? call.start_timestamp : undefined;
    const endMs = typeof call.end_timestamp === "number" ? call.end_timestamp : undefined;
    const disconnect = asString(call.disconnection_reason);
    const endedAt = endMs ? new Date(endMs) : new Date();
    const analyzed = event === "call_analyzed" || Object.keys(analysis).length > 0;

    const outcome = deriveOutcome(call, analysis, disconnect);
    const visitConfirmed = outcome === "Spoke with customer" &&
      (truthy(custom.visit_booked) || truthy(custom.visit_confirmed) || truthy(custom.appointment_booked) || truthy(custom.booked));
    const scheduledVisit = asString(custom.scheduled_visit_day) ?? asString(custom.scheduled_visit) ?? asString(custom.visit_day) ?? asString(custom.appointment_day) ?? null;

    let nextFollowUp: Date;
    let followUpReason: string;
    if (visitConfirmed) {
      const visitDay = parseVisitDay(scheduledVisit ?? undefined, endedAt);
      nextFollowUp = visitDay ? new Date(visitDay.getTime() + DAY_MS) : new Date(endedAt.getTime() + 7 * DAY_MS);
      followUpReason = visitDay ? "Confirm the visit happened" : "Confirm the visit happened (visit day unclear)";
    } else if (outcome === "Spoke with customer") {
      nextFollowUp = new Date(endedAt.getTime() + RETRY_DAYS * DAY_MS);
      followUpReason = "Visit not confirmed · follow up on the offer";
    } else {
      nextFollowUp = new Date(endedAt.getTime() + RETRY_DAYS * DAY_MS);
      followUpReason = outcome === "Voicemail" ? "Left voicemail · retry call" : "No answer · retry call";
    }

    const row: Record<string, unknown> = {
      call_id: callId,
      customer_slug: asString(metadata.customer_slug) ?? null,
      agent_id: asString(call.agent_id) ?? null,
      from_number: asString(call.from_number) ?? null,
      to_number: asString(call.to_number) ?? null,
      call_status: asString(call.call_status) ?? event,
      outcome,
      duration_seconds: durationMs !== undefined
        ? Math.round(durationMs / 1000)
        : startMs !== undefined && endMs !== undefined ? Math.round((endMs - startMs) / 1000) : null,
      summary: asString(analysis.call_summary) ?? null,
      transcript: buildTranscript(call),
      recording_url: asString(call.recording_url) ?? null,
      sentiment: asString(analysis.user_sentiment) ?? null,
      disconnection_reason: disconnect ?? null,
      in_voicemail: typeof analysis.in_voicemail === "boolean" ? analysis.in_voicemail : null,
      visit_confirmed: analyzed ? visitConfirmed : null,
      scheduled_visit: scheduledVisit,
      next_follow_up_at: nextFollowUp.toISOString(),
      follow_up_reason: followUpReason,
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

    if (visitConfirmed && row.customer_slug) {
      const { error: customerError } = await supabase.from("demo_customers").update({
        confirmed_visit_day: scheduledVisit ?? "Date to be confirmed",
        confirmed_visit_at: endedAt.toISOString(),
        confirmed_follow_up_at: nextFollowUp.toISOString(),
      }).eq("slug", row.customer_slug);
      if (customerError) console.error("Failed to flag confirmed visit", customerError);
    }

    console.log("Stored call result", { callId, event, outcome, visitConfirmed, scheduledVisit, slug: row.customer_slug });
    return json({ received: true, outcome, visitConfirmed, scheduledVisit });
  } catch (err) {
    console.error("auto-demo-call-webhook failure", err);
    return json({ received: true });
  }
});
