import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VOICES } from "@/lib/voices";

export type SimpleAgentConfig = {
  business_name: string;
  campaign_name: string;
  campaign_goal: string;
  target_audience: string;
  offer_details: string;
  voice_id: string;
  tone: string;
  ai_intro: string;
  script_text: string;
  things_to_avoid: string;
  booking_link: string;
  call_window: string;
};

export const EMPTY_SIMPLE_AGENT: SimpleAgentConfig = {
  business_name: "",
  campaign_name: "",
  campaign_goal: "",
  target_audience: "",
  offer_details: "",
  voice_id: "",
  tone: "",
  ai_intro: "",
  script_text: "",
  things_to_avoid: "",
  booking_link: "",
  call_window: "9:00 AM – 6:00 PM",
};

export function AgentSetup({
  value,
  onChange,
}: {
  value: SimpleAgentConfig;
  onChange: (patch: Partial<SimpleAgentConfig>) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Campaign basics" description="Who the AI is calling and why.">
        <Field label="Business name">
          <Input
            value={value.business_name}
            onChange={(e) => onChange({ business_name: e.target.value })}
            placeholder="Mike's Motor Zone"
          />
        </Field>
        <Field label="Campaign name">
          <Input
            value={value.campaign_name}
            onChange={(e) => onChange({ campaign_name: e.target.value })}
            placeholder="Spring reactivation"
          />
        </Field>
        <Field label="Goal of the call">
          <Select value={value.campaign_goal} onValueChange={(v) => onChange({ campaign_goal: v })}>
            <SelectTrigger><SelectValue placeholder="Choose a goal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="book_appointment">Book an appointment</SelectItem>
              <SelectItem value="reactivate">Reactivate a dormant customer</SelectItem>
              <SelectItem value="qualify">Qualify a new lead</SelectItem>
              <SelectItem value="follow_up">Follow up after a visit</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Who are we calling?">
          <Textarea
            rows={3}
            value={value.target_audience}
            onChange={(e) => onChange({ target_audience: e.target.value })}
            placeholder="Customers who haven't booked a service in 6+ months"
          />
        </Field>
        <Field label="Offer details">
          <Textarea
            rows={3}
            value={value.offer_details}
            onChange={(e) => onChange({ offer_details: e.target.value })}
            placeholder="$20 off their next oil change if they book this week"
          />
        </Field>
      </Section>

      <Section title="Voice & script" description="How the AI sounds and what it says.">
        <Field label="Voice">
          <Select value={value.voice_id} onValueChange={(v) => onChange({ voice_id: v })}>
            <SelectTrigger><SelectValue placeholder="Pick a voice" /></SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} — {v.style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Tone">
          <Select value={value.tone} onValueChange={(v) => onChange({ tone: v })}>
            <SelectTrigger><SelectValue placeholder="Pick a tone" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly &amp; casual</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="energetic">Energetic</SelectItem>
              <SelectItem value="calm">Calm &amp; reassuring</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Opening line">
          <Input
            value={value.ai_intro}
            onChange={(e) => onChange({ ai_intro: e.target.value })}
            placeholder="Hi, this is Katie calling from…"
          />
        </Field>
        <Field label="Talking points / script">
          <Textarea
            rows={5}
            value={value.script_text}
            onChange={(e) => onChange({ script_text: e.target.value })}
            placeholder="Key points the AI should cover on the call"
          />
        </Field>
        <Field label="Things to avoid">
          <Textarea
            rows={2}
            value={value.things_to_avoid}
            onChange={(e) => onChange({ things_to_avoid: e.target.value })}
            placeholder="Never quote exact pricing over the phone"
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Booking link">
            <Input
              value={value.booking_link}
              onChange={(e) => onChange({ booking_link: e.target.value })}
              placeholder="https://cal.com/…"
            />
          </Field>
          <Field label="Calling window">
            <Input
              value={value.call_window}
              onChange={(e) => onChange({ call_window: e.target.value })}
              placeholder="9:00 AM – 6:00 PM"
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-app-border bg-card p-5 shadow-card space-y-4">
      <div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
