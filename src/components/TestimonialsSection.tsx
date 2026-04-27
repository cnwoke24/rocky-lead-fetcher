import React from "react";

/**
 * Rocky AI — Logo Marquee
 * Continuously scrolling row of client logos rendered in a single muted tone.
 */

type Client = {
  name: string;
  website: string;
  logoUrl: string;
};

const CLIENTS: Client[] = [
  {
    name: "Expert Doctors of Physical Therapy",
    website: "https://expertdpt.com/",
    logoUrl:
      "https://i0.wp.com/expertdpt.com/wp-content/uploads/2024/03/86c1d-expertdptlogo-e1702679058925.png?fit=250%2C250&ssl=1",
  },
  {
    name: "Stretch Evolution & Wellness",
    website: "https://www.stretchew.com/",
    logoUrl:
      "https://static.wixstatic.com/media/7bdc64_ba27c7259ba04048a0298a654a81e610~mv2.png/v1/fill/w_156%2Ch_120%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/7bdc64_ba27c7259ba04048a0298a654a81e610~mv2.png",
  },
  {
    name: "EVOL Body & Wellness",
    website: "https://evolbodywellness.com/",
    logoUrl:
      "https://play-lh.googleusercontent.com/JdE8wzgTf0_GWhkaDvByt7Z06mZbjs8HWGqbZ_9rROQjY3Fwhs2uK90n8UHnqmZPgkjo%3Dw240-h480",
  },
];

function LogoItem({ c }: { c: Client }) {
  return (
    <a
      href={c.website}
      target="_blank"
      rel="noreferrer"
      title={c.name}
      className="group mx-10 flex shrink-0 items-center gap-3 opacity-70 transition hover:opacity-100"
    >
      <img
        src={c.logoUrl}
        alt={c.name + " logo"}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-10 w-10 object-contain grayscale"
      />
      <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-700">
        {c.name}
      </span>
    </a>
  );
}

export function TestimonialsSection({ id = "testimonials" }: { id?: string }) {
  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS];

  return (
    <section id={id} className="relative overflow-hidden border-y border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Custom systems built for
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-balance text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Trusted by clinics & wellness brands
        </h2>
      </div>

      <div
        className="relative mt-10"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee items-center">
          {loop.map((c, i) => (
            <LogoItem key={c.name + i} c={c} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes rocky-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: rocky-marquee 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee { animation: none; }
        }
      `}</style>
    </section>
  );
}
