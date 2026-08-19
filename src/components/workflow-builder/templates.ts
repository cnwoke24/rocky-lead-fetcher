import type { WorkflowGraph } from "./types";

const START_X = 280;
const START_Y = 40;
const ROW_GAP = 130;

const start = () => ({ id: "start", type: "start" as const, position: { x: START_X, y: START_Y }, data: { label: "Start" } });

function chain(steps: { id: string; type: any; data: any }[]): WorkflowGraph {
  const nodes = [start(), ...steps.map((s, i) => ({
    ...s,
    position: { x: START_X, y: START_Y + (i + 1) * ROW_GAP },
  }))];
  const edges = [];
  const ids = ["start", ...steps.map((s) => s.id)];
  for (let i = 0; i < ids.length - 1; i++) {
    edges.push({ id: `e-${ids[i]}-${ids[i + 1]}`, source: ids[i], target: ids[i + 1] });
  }
  return { nodes, edges };
}

export const TEMPLATES: Record<string, { id: string; name: string; description: string; graph: WorkflowGraph }> = {
  standard: {
    id: "standard",
    name: "Standard Reactivation",
    description: "Balanced 7-day sequence mixing calls and SMS to win back lapsed members.",
    graph: chain([
      { id: "c1", type: "call", data: { label: "AI Call", dayOffset: 1, leaveVoicemail: true } },
      { id: "s1", type: "sms",  data: { label: "SMS follow-up", dayOffset: 1, message: "Hi {{first_name}}, sorry we missed you — got a sec?" } },
      { id: "c2", type: "call", data: { label: "AI Call", dayOffset: 2, leaveVoicemail: true } },
      { id: "s2", type: "sms",  data: { label: "SMS follow-up", dayOffset: 3, message: "Quick check-in — want to grab a free session this week?" } },
      { id: "c3", type: "call", data: { label: "Final AI Call", dayOffset: 5, leaveVoicemail: true } },
      { id: "s3", type: "sms",  data: { label: "Final SMS", dayOffset: 7, message: "Last note from us — let me know if you'd like to come back." } },
      { id: "end", type: "stop", data: { label: "End" } },
    ]),
  },
  promo: {
    id: "promo",
    name: "Fast Promo Campaign",
    description: "Aggressive 4-day blast for a time-limited offer.",
    graph: chain([
      { id: "c1", type: "call",  data: { label: "AI Call", dayOffset: 1, leaveVoicemail: true } },
      { id: "s1", type: "sms",   data: { label: "Offer SMS", dayOffset: 1, message: "{{offer_name}} ends soon — reply YES to claim.", includeBookingLink: true } },
      { id: "c2", type: "call",  data: { label: "AI Call", dayOffset: 2, leaveVoicemail: true } },
      { id: "e1", type: "email", data: { label: "Email reminder", dayOffset: 3, subject: "Don't miss out", body: "Hi {{first_name}}, our {{offer_name}} ends in 24 hours." } },
      { id: "s2", type: "sms",   data: { label: "Final SMS", dayOffset: 4, message: "Offer expires tonight — last chance!" } },
      { id: "end", type: "stop", data: { label: "End" } },
    ]),
  },
  winback: {
    id: "winback",
    name: "Low-Pressure Winback",
    description: "Gentle 10-day sequence that leads with text and email.",
    graph: chain([
      { id: "s1", type: "sms",   data: { label: "Intro SMS", dayOffset: 1, message: "Hey {{first_name}} — just checking in. No pressure." } },
      { id: "c1", type: "call",  data: { label: "AI Call", dayOffset: 2, leaveVoicemail: true } },
      { id: "e1", type: "email", data: { label: "Email follow-up", dayOffset: 4, subject: "We miss you", body: "Hi {{first_name}}, would love to hear how you're doing." } },
      { id: "c2", type: "call",  data: { label: "AI Call", dayOffset: 6, leaveVoicemail: true } },
      { id: "s2", type: "sms",   data: { label: "Final SMS", dayOffset: 10, message: "Door's always open. Reply anytime." } },
      { id: "end", type: "stop", data: { label: "End" } },
    ]),
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);
