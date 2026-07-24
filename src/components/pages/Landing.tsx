"use client";

import { motion } from "motion/react";
import Rise from "../Rise";
import { useBook } from "../Book";
import BootIntro from "../BootIntro";

export default function Landing() {
  const { next, booting } = useBook();

  // While the top line travels to the landing mark, show only the boot text.
  if (booting) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <BootIntro />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl text-center">
      <Rise delay={0.05}>
        <p className="eyebrow mb-10">Website Studio</p>
      </Rise>

      <h1 className="display text-[15vw] leading-[1.02] text-ink sm:text-7xl md:text-8xl">
        <Rise delay={0.14}>
          <span className="block">We craft websites</span>
        </Rise>
        <Rise delay={0.26}>
          <span className="block italic sheen">worth remembering.</span>
        </Rise>
      </h1>

      <Rise delay={0.5}>
        <button
          onClick={next}
          className="btn-ghost mt-14 inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-sm tracking-wide"
        >
          Begin
          <span aria-hidden>→</span>
        </button>
      </Rise>

      <Rise delay={0.62}>
        <motion.p
          className="eyebrow mt-8 text-[9px]"
          animate={{ opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          arrows · scroll · swipe to turn
        </motion.p>
      </Rise>
    </div>
  );
}
