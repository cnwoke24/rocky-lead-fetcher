import { supabase } from "@/integrations/supabase/client";

export type DemoCustomerRecord = {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string | null;
  vehicle_year: string;
  vehicle_make: string;
  vehicle_model: string;
  completed_visits: number;
  current_visit_stage: string;
  last_visit_date: string;
  last_service: string;
  recommended_service: string;
  loyalty_credit: string;
  campaign_goal: string;
  reason_for_call: string;
  offer_description: string;
};

const FUNCTION = "auto-demo-retell-call";

async function callFunction<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(FUNCTION, { body });
  if (error) {
    let message = (data as { error?: string } | null)?.error ?? error.message;
    const context = (error as { context?: { clone?: () => Response; json?: () => Promise<unknown> } }).context;

    try {
      const response = context?.clone?.() ?? context;
      const payload = await response?.json?.();
      if (payload && typeof payload === "object" && "error" in payload) {
        message = String((payload as { error: unknown }).error);
      }
    } catch {
      // Keep the SDK message when the provider response is not JSON.
    }

    throw new Error(message);
  }
  if (data && typeof data === "object" && "error" in data) throw new Error(String((data as { error: string }).error));
  return data as T;
}

export const fetchDemoCustomers = () =>
  callFunction<{ customers: DemoCustomerRecord[] }>({ action: "list" }).then((result) => result.customers);

export const saveDemoCustomer = (slug: string, values: Partial<DemoCustomerRecord>) =>
  callFunction<{ customer: DemoCustomerRecord }>({ action: "update", slug, values }).then((result) => result.customer);

export const runDemoCall = (slug: string) =>
  callFunction<{ success: boolean; callId?: string; to: string }>({ action: "call", slug });

export type DemoCallResult = {
  id: string;
  call_id: string;
  customer_slug: string | null;
  call_status: string | null;
  outcome: string | null;
  duration_seconds: number | null;
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  sentiment: string | null;
  to_number: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

export async function fetchDemoCallResults(limit = 20): Promise<DemoCallResult[]> {
  const { data, error } = await supabase
    .from("demo_call_results")
    .select("id, call_id, customer_slug, call_status, outcome, duration_seconds, summary, transcript, recording_url, sentiment, to_number, started_at, ended_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as DemoCallResult[];
}

export async function fetchDemoCallResult(callId: string): Promise<DemoCallResult | null> {
  const { data, error } = await supabase
    .from("demo_call_results")
    .select("id, call_id, customer_slug, call_status, outcome, duration_seconds, summary, transcript, recording_url, sentiment, to_number, started_at, ended_at, created_at")
    .eq("call_id", callId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DemoCallResult | null) ?? null;
}
