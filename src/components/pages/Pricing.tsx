"use client";

import Rise from "../Rise";
import { useBook } from "../Book";
import { TIERS } from "../tiers";

export default function Pricing() {
  const { goTo, total, setSelectedPlan } = useBook();

  const choose = (name: string, price: string) => {
    setSelectedPlan(`${name} — ${price}`);
    goTo(total - 1); // contact is the last page
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-12 text-center">
        <Rise delay={0.05}>
          <p className="eyebrow mb-6">Pricing</p>
        </Rise>
        <Rise delay={0.12}>
          <h2 className="display text-4xl text-ink md:text-6xl">
            Three ways to <span className="italic sheen">work together.</span>
          </h2>
        </Rise>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {TIERS.map((t, i) => {
          const featured = t.featured;
          return (
            <Rise key={t.id} delay={0.2 + i * 0.1}>
              <div
                className={`flex h-full flex-col rounded-2xl p-6 transition-transform duration-500 md:p-8 ${
                  featured
                    ? "bg-ink text-bg md:-translate-y-3 md:shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]"
                    : "card text-ink"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-sans text-[11px] uppercase tracking-[0.28em] ${
                      featured ? "text-bg/50" : "text-faint"
                    }`}
                  >
                    {t.name}
                  </span>
                  {featured && (
                    <span className="rounded-full bg-bg/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-bg">
                      Popular
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-baseline gap-2 md:mt-6">
                  <span className="display text-4xl md:text-5xl">{t.price}</span>
                  {t.priceNote && (
                    <span
                      className={`text-[11px] uppercase tracking-widest ${
                        featured ? "text-bg/50" : "text-faint"
                      }`}
                    >
                      {t.priceNote}
                    </span>
                  )}
                </div>

                <p
                  className={`mt-3 text-sm ${
                    featured ? "text-bg/70" : "text-muted"
                  }`}
                >
                  {t.tagline}
                </p>

                <div
                  className={`my-5 h-px w-full md:my-7 ${
                    featured ? "bg-bg/15" : "bg-line"
                  }`}
                />

                <ul className="flex flex-1 flex-col gap-3">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-3 text-sm ${
                        featured ? "text-bg/80" : "text-muted"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="mt-0.5 h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M5 12.5l4.5 4.5L19 6.5" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => choose(t.name, t.price)}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm ${
                    featured
                      ? "bg-bg text-ink transition-opacity hover:opacity-90"
                      : "btn-ghost"
                  }`}
                >
                  {t.cta}
                  <span aria-hidden>→</span>
                </button>
              </div>
            </Rise>
          );
        })}
      </div>

      <Rise delay={0.6}>
        <p className="mt-8 text-center text-xs text-faint">
          Every plan includes a friendly, jargon-free process from first sketch
          to launch.
        </p>
      </Rise>
    </div>
  );
}
