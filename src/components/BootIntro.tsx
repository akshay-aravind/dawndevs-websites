"use client";

import { useEffect, useState } from "react";

/**
 * The boot text — a short terminal sequence that types itself out while the
 * top progress line travels to the landing mark. No overlay, no separate bar;
 * this simply sits in the landing page until the intro finishes.
 */
const SCRIPT = ["> dawndevs booting", "> preparing your studio", "> ready"];
const SPEED = 34; // ms per character

export default function BootIntro() {
  const [idx, setIdx] = useState(0);
  const full = SCRIPT.join("\n");
  const total = full.length;

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setIdx(total);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setIdx(i);
      if (i >= total) clearInterval(id);
    }, SPEED);
    return () => clearInterval(id);
  }, [total]);

  const lines = full.slice(0, idx).split("\n");

  return (
    <div className="mono text-left text-sm leading-relaxed text-muted md:text-base">
      {lines.map((l, i) => (
        <div key={i}>
          {l}
          {i === lines.length - 1 && idx < total && <span className="caret" />}
        </div>
      ))}
    </div>
  );
}
