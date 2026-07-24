"use client";

import Rise from "../Rise";

const PILLARS = [
  { k: "Design", v: "Considered, elegant, unmistakably yours." },
  { k: "Build", v: "Fast, modern, and built to last." },
  { k: "Care", v: "Looked after long after launch." },
];

export default function Approach() {
  return (
    <div className="mx-auto w-full max-w-4xl text-center">
      <Rise delay={0.05}>
        <p className="eyebrow mb-10">What we do</p>
      </Rise>

      <h2 className="display text-4xl leading-[1.1] text-ink md:text-6xl">
        <Rise delay={0.14}>
          <span className="block">We build one thing —</span>
        </Rise>
        <Rise delay={0.24}>
          <span className="block italic sheen">websites, exceptionally.</span>
        </Rise>
      </h2>

      <Rise delay={0.4}>
        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted">
          No distractions, no templates. One focused studio pouring everything
          into the craft — which is exactly why our work feels made, not
          assembled.
        </p>
      </Rise>

      <div className="mx-auto mt-10 grid max-w-3xl gap-px border border-line md:mt-16 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Rise
            key={p.k}
            delay={0.5 + i * 0.1}
            className="bg-surface/40 px-6 py-7 text-left md:px-8 md:py-10"
          >
            <p className="display text-2xl text-ink">{p.k}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{p.v}</p>
          </Rise>
        ))}
      </div>
    </div>
  );
}
