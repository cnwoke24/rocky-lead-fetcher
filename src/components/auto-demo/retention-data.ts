export type DemoView = "overview" | "customers" | "campaigns" | "calls" | "analytics" | "settings";
export type VisitStage = "Visit 1" | "Visit 2" | "Visit 3" | "Visit 4+";
export type CustomerStatus = "At Risk" | "Monitor" | "Loyal Customer" | "Visit Confirmed";

export type ConfirmedVisit = { day: string; confirmedAt: string; followUpAt: string };

export type Customer = {
  id: string;
  slug?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicle: string;
  completedVisits: number;
  visitStage: VisitStage;
  lastVisit: string;
  daysSinceVisit: number;
  lastService: string;
  recommendedService: string;
  loyaltyCredit: number;
  campaignReason: string;
  campaignGoal: string;
  status: CustomerStatus;
  nextAction: string;
  confirmedVisit?: ConfirmedVisit | null;
};

export type Activity = { id: string; title: string; time: string; kind: "call" | "email" | "appointment" | "stage" | "sync"; celebrate?: boolean };

export type CallOutcome = "Spoke with customer" | "Voicemail" | "No answer";

export type CallRecord = {
  id: string;
  customer: string;
  campaign: string;
  date: string;
  duration: string;
  outcome: CallOutcome;
  visitConfirmed: boolean;
  scheduledVisit: string | null;
  nextFollowUp: string;
  followUpReason: string;
  emailSent: boolean;
  summary: string;
  transcript: { speaker: "Rocky AI" | "Customer"; text: string }[];
};

export const stageForVisits = (visits: number): VisitStage => visits >= 4 ? "Visit 4+" : (`Visit ${Math.max(1, visits)}` as VisitStage);

export const createCustomer = (visits: number): Customer => {
  const scenarios: Record<number, Omit<Customer, "id" | "firstName" | "lastName" | "phone" | "email" | "vehicle">> = {
    1: { completedVisits: 1, visitStage: "Visit 1", lastVisit: "45 days ago", daysSinceVisit: 45, lastService: "First Oil Change", recommendedService: "Routine Follow-Up", loyaltyCredit: 8.4, campaignReason: "First-visit follow-up", campaignGoal: "Get Visit 2", status: "Monitor", nextAction: "Contact for Visit 2" },
    2: { completedVisits: 2, visitStage: "Visit 2", lastVisit: "78 days ago", daysSinceVisit: 78, lastService: "Oil Change + Inspection", recommendedService: "Tire Rotation", loyaltyCredit: 18.75, campaignReason: "Second-visit retention", campaignGoal: "Get Visit 3", status: "At Risk", nextAction: "Contact for Visit 3" },
    3: { completedVisits: 3, visitStage: "Visit 3", lastVisit: "92 days ago", daysSinceVisit: 92, lastService: "Oil Change + Inspection", recommendedService: "Tire Rotation", loyaltyCredit: 31.6, campaignReason: "Priority retention stage", campaignGoal: "Get Visit 4", status: "At Risk", nextAction: "Contact for Visit 4" },
    4: { completedVisits: 4, visitStage: "Visit 4+", lastVisit: "Today", daysSinceVisit: 0, lastService: "Tire Rotation + Multi-Point Inspection", recommendedService: "Seasonal Maintenance", loyaltyCredit: 44.25, campaignReason: "Long-term retention", campaignGoal: "Ongoing retention / maintenance", status: "Loyal Customer", nextAction: "Schedule next maintenance reminder" },
  };
  const scenario = scenarios[Math.min(4, Math.max(1, visits))];
  return { id: "cust-mike", firstName: "Mike", lastName: "Prouse", phone: "(717) 555-0148", email: "mike.prouse@example.com", vehicle: "2021 Honda Accord", ...scenario };
};

export const initialCustomers: Customer[] = [
  { id: "cust-bob", slug: "bob", firstName: "Bob", lastName: "Hensley", phone: "(717) 555-0162", email: "bob.hensley@example.com", vehicle: "2020 Toyota Tacoma", completedVisits: 3, visitStage: "Visit 3", lastVisit: "92 days ago", daysSinceVisit: 92, lastService: "Oil Change + Multi-Point Inspection", recommendedService: "Tire Rotation", loyaltyCredit: 34.75, campaignReason: "Priority retention stage", campaignGoal: "Get Visit 4", status: "At Risk", nextAction: "Contact for Visit 4" },
  createCustomer(3),
  { id: "cust-sarah", firstName: "Sarah", lastName: "Johnson", phone: "(717) 555-0193", email: "sarah.johnson@example.com", vehicle: "2019 Toyota RAV4", completedVisits: 2, visitStage: "Visit 2", lastVisit: "104 days ago", daysSinceVisit: 104, lastService: "Multi-Point Inspection", recommendedService: "Oil Change", loyaltyCredit: 18.2, campaignReason: "Overdue maintenance", campaignGoal: "Get Visit 3", status: "At Risk", nextAction: "Contact for Visit 3" },
  { id: "cust-robert", firstName: "Robert", lastName: "Miller", phone: "(717) 555-0176", email: "robert.miller@example.com", vehicle: "2020 Ford F-150", completedVisits: 3, visitStage: "Visit 3", lastVisit: "119 days ago", daysSinceVisit: 119, lastService: "Oil Change", recommendedService: "Brake Inspection", loyaltyCredit: 42.5, campaignReason: "Priority retention stage", campaignGoal: "Get Visit 4", status: "Visit Confirmed", nextAction: "Visit 4 confirmed · Thursday", confirmedVisit: { day: "Thursday morning", confirmedAt: new Date().toISOString(), followUpAt: new Date(Date.now() + 3 * 86_400_000).toISOString() } },
  { id: "cust-jennifer", firstName: "Jennifer", lastName: "Williams", phone: "(717) 555-0124", email: "jennifer.williams@example.com", vehicle: "2022 Honda CR-V", completedVisits: 1, visitStage: "Visit 1", lastVisit: "45 days ago", daysSinceVisit: 45, lastService: "First Oil Change", recommendedService: "Routine Follow-Up", loyaltyCredit: 8.75, campaignReason: "First-visit follow-up", campaignGoal: "Get Visit 2", status: "Monitor", nextAction: "Contact for Visit 2" },
  { id: "cust-alicia", firstName: "Alicia", lastName: "Grant", phone: "(717) 555-0181", email: "alicia.grant@example.com", vehicle: "2018 Mazda CX-5", completedVisits: 3, visitStage: "Visit 3", lastVisit: "87 days ago", daysSinceVisit: 87, lastService: "Brake Service", recommendedService: "Tire Rotation", loyaltyCredit: 27.1, campaignReason: "Priority retention stage", campaignGoal: "Get Visit 4", status: "At Risk", nextAction: "Contact for Visit 4" },
];

export const journey = [
  { stage: "Visit 1", label: "First-time customer", count: 1250, rate: 100 },
  { stage: "Visit 2", label: "Second visit", count: 680, rate: 54 },
  { stage: "Visit 3", label: "Priority Retention Stage", count: 142, rate: 21 },
  { stage: "Visit 4+", label: "Loyal Customers", count: 212, rate: 100 },
] as const;

export const campaigns = [
  { name: "Visit 1 → Visit 2 Follow-Up", customers: 286, calls: 241, conversations: 198, appointments: 42, status: "Active" },
  { name: "Visit 2 → Visit 3 Retention", customers: 194, calls: 176, conversations: 151, appointments: 31, status: "Active" },
  { name: "Visit 3 → Visit 4 Priority Retention", customers: 142, calls: 128, conversations: 111, appointments: 38, status: "Priority" },
  { name: "Dormant Customer Reactivation", customers: 318, calls: 264, conversations: 203, appointments: 51, status: "Active" },
  { name: "Declined Service Follow-Up", customers: 72, calls: 61, conversations: 48, appointments: 14, status: "Active" },
  { name: "Failed Booking Recovery", customers: 35, calls: 29, conversations: 21, appointments: 8, status: "Paused" },
];

export const initialCalls: CallRecord[] = [
  { id: "call-mike", customer: "Mike Prouse", campaign: "Visit 3 → Visit 4 Priority Retention", date: "Today, 10:42 AM", duration: "4m 32s", outcome: "Spoke with customer", visitConfirmed: false, scheduledVisit: null, nextFollowUp: "In 3 days", followUpReason: "Visit not confirmed · follow up on the offer", emailSent: true, summary: "Mike confirmed he still owns the vehicle and is interested in scheduling his next maintenance visit. Loyalty credit was discussed. Customer requested additional information by email.", transcript: [{ speaker: "Rocky AI", text: "Hi Mike, this is Rocky calling from Mike's Motor Zone. I’m reaching out about your Accord’s next maintenance visit." }, { speaker: "Customer", text: "Yes, I still have the Accord. What service is coming up?" }, { speaker: "Rocky AI", text: "A tire rotation is recommended, and you currently have $31.60 in loyalty credit available." }, { speaker: "Customer", text: "That sounds good. Email me the details and I’ll look at my schedule." }] },
  { id: "call-robert", customer: "Robert Miller", campaign: "Visit 3 → Visit 4 Priority Retention", date: "Today, 9:18 AM", duration: "3m 06s", outcome: "Spoke with customer", visitConfirmed: true, scheduledVisit: "Thursday morning", nextFollowUp: "Friday", followUpReason: "Confirm the visit happened", emailSent: true, summary: "Robert booked a brake inspection for Thursday morning after reviewing his available loyalty credit.", transcript: [{ speaker: "Rocky AI", text: "Hi Robert, your F-150 is due for a brake inspection." }, { speaker: "Customer", text: "Thursday morning would work." }] },
  { id: "call-sarah", customer: "Sarah Johnson", campaign: "Visit 2 → Visit 3 Retention", date: "Yesterday, 3:35 PM", duration: "0m 38s", outcome: "Voicemail", visitConfirmed: false, scheduledVisit: null, nextFollowUp: "In 3 days", followUpReason: "Left voicemail · retry call", emailSent: true, summary: "Reached Sarah's voicemail and left a short reminder about her overdue oil change and available loyalty credit.", transcript: [{ speaker: "Rocky AI", text: "Hi Sarah, this is Rocky from Mike's Motor Zone calling about your next oil change. We'll try you again in a few days." }] },
];

export const initialActivity: Activity[] = [
  { id: "a1", title: "Call completed with Mike Prouse", time: "2 minutes ago", kind: "call" },
  { id: "a2", title: "Follow-up email sent to Mike Prouse", time: "3 minutes ago", kind: "email" },
  { id: "a3", title: "Appointment booked for Robert Miller", time: "28 minutes ago", kind: "appointment" },
  { id: "a4", title: "Customer moved from Visit 2 → Visit 3", time: "45 minutes ago", kind: "stage" },
  { id: "a5", title: "New customer data synced", time: "1 hour ago", kind: "sync" },
];

export const analyticsData = [
  { name: "Visit 1 → 2", conversion: 54, customers: 680 },
  { name: "Visit 2 → 3", conversion: 21, customers: 142 },
  { name: "Visit 3 → 4+", conversion: 36, customers: 51 },
];

export const importFields = ["first_name", "last_name", "phone_number", "email", "vehicle_year", "vehicle_make", "vehicle_model", "last_visit_date", "lifetime_visits", "last_service", "recommended_service", "loyalty_credit", "campaign_reason", "customer_id"];