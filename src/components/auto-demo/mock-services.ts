import * as XLSX from "xlsx";
import type { Customer } from "./retention-data";

export type ImportedRow = Record<string, string | number>;

const wait = (ms = 450) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function uploadCustomerFile(file: File): Promise<ImportedRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) return [];
  return XLSX.utils.sheet_to_json<ImportedRow>(workbook.Sheets[firstSheet], { defval: "" });
}

export async function syncCustomerData(rows: ImportedRow[]) {
  await wait();
  return rows.map((row) => {
    const visits = Math.max(1, Number(row.lifetime_visits) || 1);
    const stage = visits >= 4 ? "Visit 4+" : `Visit ${visits}`;
    return { ...row, visit_stage: stage, risk_status: visits >= 4 ? "Loyal Customer" : visits >= 2 ? "At Risk" : "Monitor", campaign_goal: visits >= 4 ? "Ongoing retention" : `Get Visit ${visits + 1}`, next_best_action: visits >= 4 ? "Schedule maintenance reminder" : `Contact for Visit ${visits + 1}` };
  });
}

export async function triggerRetellCall(_customer: Customer) { await wait(650); return { callId: "demo-call-1042", status: "triggered" as const }; }
export async function sendEmail(_customer: Customer) { await wait(); return { status: "sent" as const }; }
export async function getCallOutcome(_customer: Customer) { await wait(700); return { outcome: "Interested", sentiment: "Positive", appointment: "Pending" }; }
export async function updateCustomerRecord(customer: Customer) { await wait(350); return customer; }
export async function simulateCompletedVisit(customer: Customer) { await wait(350); return Math.min(4, customer.completedVisits + 1); }

export const sampleImportRows: ImportedRow[] = Array.from({ length: 30 }, (_, index) => ({
  first_name: ["Emily", "David", "Monica", "James", "Nina"][index % 5],
  last_name: ["Carter", "Wilson", "Reed", "Bennett", "Lopez"][index % 5],
  phone_number: `(717) 555-${String(2000 + index)}`,
  email: `customer${index + 1}@example.com`,
  vehicle_year: 2018 + (index % 6),
  vehicle_make: ["Honda", "Toyota", "Ford", "Subaru", "Mazda"][index % 5],
  vehicle_model: ["Accord", "RAV4", "F-150", "Outback", "CX-5"][index % 5],
  last_visit_date: `2026-0${(index % 8) + 1}-12`,
  lifetime_visits: (index % 4) + 1,
  last_service: "Oil Change + Inspection",
  recommended_service: index % 2 ? "Tire Rotation" : "Brake Inspection",
  loyalty_credit: Number((8.5 + index * 1.35).toFixed(2)),
  campaign_reason: "Retention follow-up",
  customer_id: `MMZ-${1001 + index}`,
}));