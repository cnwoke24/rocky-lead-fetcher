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
    const message = (data as { error?: string } | null)?.error ?? error.message;
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
