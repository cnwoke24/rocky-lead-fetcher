import React from "react";
type Tone = "blue" | "purple" | "slate";
type Plan = {
  badge?: {
    label: string;
    tone: Tone;
  };
  name: string;
  setupFee: string;
  price: string;
  priceSuffix?: string;
  features: string[];
  note?: string;
  cta: string;
  accent: Tone;
  featured?: boolean;
};
const TONE = {
  blue: {
    border: "border-blue-200",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    accentText: "text-blue-700",
    ring: "ring-blue-200",
    gradient: "from-blue-500 to-violet-500",
    soft: "bg-blue-50"
  },
  purple: {
    border: "border-violet-200",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    accentText: "text-violet-700",
    ring: "ring-violet-200",
    gradient: "from-violet-600 to-fuchsia-500",
    soft: "bg-violet-50"
  },
  slate: {
    border: "border-slate-200",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    accentText: "text-slate-700",
    ring: "ring-slate-200",
    gradient: "from-slate-900 to-slate-700",
    soft: "bg-slate-50"
  }
} as const;
const Check = ({
  tone
}: {
  tone: Tone;
}) => <span className={"inline-flex h-5 w-5 items-center justify-center rounded-full " + TONE[tone].soft}>
    <svg viewBox="0 0 20 20" fill="currentColor" className={"h-4 w-4 " + TONE[tone].accentText} aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.07 7.07a1 1 0 01-1.414 0l-3.535-3.535a1 1 0 111.414-1.414l2.828 2.828 6.364-6.364a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  </span>;
function Pill({
  tone,
  children
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return <span className={"inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold " + TONE[tone].badgeBg + " " + TONE[tone].badgeText}>
      {children}
    </span>;
}
function PricingCard({
  plan
}: {
  plan: Plan;
}) {
  const tone = plan.accent;
  return <div className={"relative rounded-3xl border bg-white p-6 shadow-sm transition " + TONE[tone].border + (plan.featured ? " ring-2 " + TONE[tone].ring + " shadow-md" : "")}>
      {plan.badge ? <div className="absolute -top-3 left-6">
          <Pill tone={plan.badge.tone}>{plan.badge.label}</Pill>
        </div> : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {plan.name}
          </h3>
          <div className="mt-2">
            <span className={"inline-flex rounded-full px-3 py-1 text-xs font-semibold " + TONE[tone].badgeBg + " " + TONE[tone].badgeText}>
              {plan.setupFee}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-end gap-2">
          <div className="text-4xl font-extrabold tracking-tight text-slate-900">
            {plan.price}
          </div>
          {plan.priceSuffix ? <div className="pb-1 text-sm font-semibold text-slate-500">
              {plan.priceSuffix}
            </div> : null}
        </div>
      </div>
      <div className="mt-6">
        <div className="text-sm font-bold text-slate-900">What's included</div>
        <ul className="mt-3 grid gap-3">
          {plan.features.map((item, idx) => <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
              <Check tone={tone} />
              <span>{item}</span>
            </li>)}
        </ul>
        {plan.note ? <div className={"mt-5 rounded-2xl border p-4 text-xs text-slate-700 " + TONE[tone].border + " bg-white/60"}>
            {plan.note}
          </div> : null}
      </div>
      <button className={"mt-8 w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] bg-gradient-to-r " + TONE[tone].gradient}>
        {plan.cta}
      </button>
    </div>;
}
export default function PricingSection({
  id = "pricing"
}: {
  id?: string;
}) {
  const plans: Plan[] = [{
    badge: {
      label: "⚡ Starter",
      tone: "blue"
    },
    name: "Launch",
    setupFee: "$0 setup fee",
    price: "$299",
    priceSuffix: "/mo",
    features: ["24/7 inbound call answering", "Caller information capture + confirmation", "Call logging + summary", "Email confirmations (instant follow-ups)", "Intelligent routing for new vs. returning callers", "Email support"],
    cta: "Get Started",
    accent: "blue"
  }, {
    badge: {
      label: "⭐ Most Popular",
      tone: "purple"
    },
    name: "Pro",
    setupFee: "$0 setup fee",
    price: "$899",
    priceSuffix: "/mo",
    features: ["Advanced analytics dashboard", "Webhook/automation routing for booking + updates + cancellations", "Calendar + CRM connection (event creation + contact logging)", "Automatic SMS confirmations", "Call transfer options", "Outbound appointment reminders", "Slack channel support", "Everything in the Launch plan"],
    note: "Best for teams that want full automation: booking workflows, CRM/calendar logging, reminders, and transfer routing.",
    cta: "Choose Pro",
    accent: "purple",
    featured: true
  }, {
    badge: {
      label: "💰 Lower Monthly",
      tone: "slate"
    },
    name: "Saver",
    setupFee: "$2,000 setup fee",
    price: "$499",
    priceSuffix: "/mo",
    features: ["Client dashboard login for call analytics", "Call transfer options", "Slack channel support", "Everything in the Launch & Pro plans"],
    note: "Ideal if you want a lower monthly rate and can pay the one-time setup fee upfront.",
    cta: "Choose Saver",
    accent: "slate"
  }];
  return <section id={id} className="relative overflow-hidden py-16 sm:py-20">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-50 via-violet-50 to-sky-50 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-50 via-violet-50 to-blue-50 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Simple pricing for{" "}
            <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
              AI receptionists
            </span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Choose a tier based on how automated you want scheduling, reminders,
            and reporting.
          </p>
          
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map(p => <PricingCard key={p.name} plan={p} />)}
        </div>
        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-700 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2">
            <div className="font-extrabold text-slate-900">
              Need something custom?
            </div>
            <div className="text-slate-600">
              If you need add-ons like multilingual support, emergency routing,
              payments follow-ups, or multi-location logic — we'll scope it and
              quote it.
            </div>
          </div>
        </div>
      </div>
    </section>;
}