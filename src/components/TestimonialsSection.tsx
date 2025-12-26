import React from "react";

/**
 * Rocky AI — Testimonials (Industry-standard)
 * Simple quote cards + logo strip (no pricing-style CTAs).
 *
 * Notes:
 * - Quotes are summarized/paraphrased based on client feedback.
 * - Uses direct logo URLs (no Next/Image domain config needed).
 */

type Tone = "blue" | "purple" | "slate";
type Testimonial = {
  name: string;
  website: string;
  logoUrl: string;
  tag: string;
  tone: Tone;
  quote: string;
  useCase: string;
};
const TONE = {
  blue: {
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700"
  },
  purple: {
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700"
  },
  slate: {
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700"
  }
} as const;
function Pill({
  tone,
  children
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return <span className={"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold " + TONE[tone].badgeBg + " " + TONE[tone].badgeText}>
      {children}
    </span>;
}
function TestimonialCard({
  t
}: {
  t: Testimonial;
}) {
  return <figure className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <Pill tone={t.tone}>{t.tag}</Pill>
        <span aria-hidden="true" className="text-2xl text-slate-300">
          "
        </span>
      </div>
      <blockquote className="mt-4 text-base font-semibold leading-relaxed text-slate-900">
        {t.quote}
      </blockquote>
      <p className="mt-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-800">Use case:</span> {t.useCase}
      </p>
      <figcaption className="mt-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <img src={t.logoUrl} alt={t.name + " logo"} className="h-8 w-8 rounded-xl object-contain" loading="lazy" referrerPolicy="no-referrer" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">{t.name}</div>
          <a href={t.website} target="_blank" rel="noreferrer" className="truncate text-xs text-slate-500 hover:text-slate-700">
            {t.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        </div>
      </figcaption>
    </figure>;
}
export function TestimonialsSection({
  id = "testimonials"
}: {
  id?: string;
}) {
  const testimonials: Testimonial[] = [{
    name: "Expert Doctors of Physical Therapy",
    website: "https://expertdpt.com/",
    logoUrl: "https://i0.wp.com/expertdpt.com/wp-content/uploads/2024/03/86c1d-expertdptlogo-e1702679058925.png?fit=250%2C250&ssl=1",
    tag: "AI Receptionist",
    tone: "blue",
    quote: "Our calls stopped piling up and the team isn't tied to the phone anymore. Patients get helped right away, even when the front desk is busy.",
    useCase: "Inbound call handling + intake so they didn't need to overstaff the front desk to avoid missed calls."
  }, {
    name: "Stretch Evolution & Wellness",
    website: "https://www.stretchew.com/",
    logoUrl: "https://static.wixstatic.com/media/7bdc64_ba27c7259ba04048a0298a654a81e610~mv2.png/v1/fill/w_156%2Ch_120%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/7bdc64_ba27c7259ba04048a0298a654a81e610~mv2.png",
    tag: "Booking Automation",
    tone: "purple",
    quote: "We can focus on sessions instead of interrupting them to answer calls. Booking feels smooth and we're not losing appointments when things get hectic.",
    useCase: "AI receptionist that answers questions and books appointments so the owner can grow without hiring a full-time receptionist."
  }, {
    name: "EVOL Body & Wellness",
    website: "https://evolbodywellness.com/",
    logoUrl: "https://play-lh.googleusercontent.com/JdE8wzgTf0_GWhkaDvByt7Z06mZbjs8HWGqbZ_9rROQjY3Fwhs2uK90n8UHnqmZPgkjo%3Dw240-h480",
    tag: "Retention Outreach",
    tone: "slate",
    quote: "The outreach runs consistently every week. Members who fell off get a clear reason to come back, and the team only steps in when someone's interested.",
    useCase: "Outbound calling to inactive members with a 'return special' to improve retention and reactivations."
  }];
  return <section id={id} className="relative overflow-hidden py-16 sm:py-20">
      {/* subtle background (lighter than pricing) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-60 w-[46rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-50 via-white to-violet-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
              real clinics & wellness brands
            </span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Three real implementations — inbound reception, booking automation, and retention outreach.
          </p>
          
        </div>

        {/* Logo strip */}
        

        {/* Quote cards */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map(t => <TestimonialCard key={t.name} t={t} />)}
        </div>
      </div>
    </section>;
}