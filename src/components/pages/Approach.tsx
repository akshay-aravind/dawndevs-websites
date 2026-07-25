"use client";

import Rise from "../Rise";
import MotionField from "../MotionField";

const CAPABILITIES = [
  {
    k: "Design",
    v: "Interfaces people feel before they think.",
    variant: "flow" as const,
    services: [
      "UX / UI",
      "Design systems",
      "Prototyping",
      "Motion",
      "Art direction",
      "Brand",
    ],
  },
  {
    k: "Engineering",
    v: "Fast, modern, and built to last.",
    variant: "grid" as const,
    services: [
      "Front-end",
      "Back-end",
      "React / Next.js",
      "APIs",
      "E-commerce",
      "Performance",
    ],
  },
  {
    k: "Care",
    v: "Looked after, long after launch.",
    variant: "pulse" as const,
    services: [
      "Hosting",
      "Analytics",
      "SEO",
      "Iteration",
      "Support",
      "Optimization",
    ],
  },
];

export default function Approach() {
  return (
    <div className="mx-auto w-full max-w-4xl text-center">
      <Rise delay={0.05}>
        <p className="eyebrow mb-5">What we do</p>
      </Rise>

      <h2 className="display text-4xl leading-[1.1] text-ink md:text-5xl">
        <Rise delay={0.14}>
          <span className="block">We build one thing —</span>
        </Rise>
        <Rise delay={0.24}>
          <span className="block italic sheen">websites, exceptionally.</span>
        </Rise>
      </h2>

      <Rise delay={0.4}>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">
          No distractions, no templates. One focused studio pouring everything
          into the craft — which is exactly why our work feels made, not
          assembled.
        </p>
      </Rise>

      {/* Capability rows — each carries a subtle, grain-veiled motion field
          behind it, more evident on hover. */}
      <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-px border border-line md:mt-8">
        {CAPABILITIES.map((c, i) => (
          <Rise
            key={c.k}
            delay={0.5 + i * 0.12}
            className="group relative overflow-hidden bg-surface/30"
          >
            <MotionField
              variant={c.variant}
              className="pointer-events-none absolute inset-0 h-full w-full opacity-90 transition-opacity duration-700 ease-out group-hover:opacity-100"
            />
            {/* legibility veil — keeps the type crisp over the motion */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg/75 via-bg/20 to-bg/75" />

            <div className="relative flex flex-col gap-4 px-6 py-5 text-left md:flex-row md:items-center md:justify-between md:px-10 md:py-4">
              <div className="md:max-w-[42%]">
                <p className="display text-3xl text-ink md:text-5xl">{c.k}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.v}</p>
              </div>

              <ul className="flex flex-wrap gap-x-5 gap-y-2 md:max-w-[46%] md:justify-end">
                {c.services.map((s) => (
                  <li
                    key={s}
                    className="eyebrow text-[10px] tracking-[0.22em] text-faint transition-colors duration-500 group-hover:text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Rise>
        ))}
      </div>
    </div>
  );
}
