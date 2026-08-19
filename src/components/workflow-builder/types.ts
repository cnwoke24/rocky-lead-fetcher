export type StepType =
  | "start"
  | "call"
  | "sms"
  | "email"
  | "wait"
  | "voicemail"
  | "notify"
  | "book"
  | "stop";

export type StepNodeData = {
  label?: string;
  // timing
  dayOffset?: number;
  timeWindow?: string;
  // call
  voiceId?: string;
  leaveVoicemail?: boolean;
  // sms
  message?: string;
  includeBookingLink?: boolean;
  stopOnReply?: boolean;
  // email
  subject?: string;
  body?: string;
  includeOffer?: boolean;
  // wait
  waitAmount?: number;
  waitUnit?: "hours" | "days";
  continueOnlyIfNoResponse?: boolean;
  // voicemail
  voicemailScript?: string;
  // notify
  notifyChannel?: "sms" | "email" | "slack";
  notifyRecipient?: string;
  // book
  bookingLink?: string;
};

export type WorkflowNode = {
  id: string;
  type: StepType;
  position: { x: number; y: number };
  data: StepNodeData;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
};

export type WorkflowGraph = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type ObjectionPair = { objection: string; response: string };

export type ScriptMode = "generate" | "paste" | "upload";
export type InterestedAction = "booking_link" | "transfer" | "notify";

export type AgentConfig = {
  // business
  gym_name: string;
  gym_description: string;
  // campaign
  campaign_name: string;
  campaign_goal: string;
  target_audience: string;
  // offer
  offer_details: string;
  // ai voice & persona
  voice_id: string;
  tone: string;
  ai_intro: string;
  // script
  script_mode: ScriptMode;
  script_text: string;
  script_file_path: string | null;
  script_file_name: string | null;
  // talking points
  key_talking_points: string;
  things_to_avoid: string;
  // objections
  objections: ObjectionPair[];
  // when interested
  interested_action: InterestedAction | "";
  booking_link: string;
  transfer_phone: string;
  notify_recipient: string;
  // outbound caller ID
  phone_option: "new" | "port" | "";
  area_code: string;
  branded_caller_name: string;
  existing_phone_number: string;
  // contact list
  contact_list_path: string | null;
  contact_list_filename: string | null;
  contact_count: number | null;
  consent_accepted: boolean;

};

export const EMPTY_AGENT_CONFIG: AgentConfig = {
  gym_name: "",
  gym_description: "",
  campaign_name: "",
  campaign_goal: "",
  target_audience: "",
  offer_details: "",
  voice_id: "",
  tone: "",
  ai_intro: "",
  script_mode: "generate",
  script_text: "",
  script_file_path: null,
  script_file_name: null,
  key_talking_points: "",
  things_to_avoid: "",
  objections: [],
  interested_action: "",
  booking_link: "",
  transfer_phone: "",
  notify_recipient: "",
  phone_option: "",
  area_code: "",
  branded_caller_name: "",
  existing_phone_number: "",
  contact_list_path: null,
  contact_list_filename: null,
  contact_count: null,
  consent_accepted: false,
};

export const EMPTY_WORKFLOW: WorkflowGraph = {
  nodes: [
    { id: "start", type: "start", position: { x: 80, y: 200 }, data: { label: "Start" } },
  ],
  edges: [],
};

export const STEP_META: Record<StepType, { label: string; description: string; color: string }> = {
  start:     { label: "Start",            description: "Workflow entry point",      color: "#64748b" },
  call:      { label: "AI Call",          description: "AI agent dials the lead",   color: "#6366f1" },
  sms:       { label: "SMS",              description: "Send a text message",       color: "#10b981" },
  email:     { label: "Email",            description: "Send an email",             color: "#f59e0b" },
  wait:      { label: "Wait",             description: "Pause before next step",    color: "#94a3b8" },
  voicemail: { label: "Voicemail",        description: "Leave a recorded message",  color: "#8b5cf6" },
  notify:    { label: "Notify team",      description: "Alert your staff",          color: "#ec4899" },
  book:      { label: "Book appointment", description: "Offer a calendar booking",  color: "#0ea5e9" },
  stop:      { label: "Stop",             description: "End the sequence",          color: "#ef4444" },
};
