"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useBook } from "../Book";
import BootIntro from "../BootIntro";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Words — a staggered, word-by-word reveal. Each word focuses in (rises +
 * un-blurs). Collapses to a plain fade under prefers-reduced-motion.
 */
function Words({
  text,
  delay,
  className,
  reduced,
}: {
  text: string;
  delay: number;
  className?: string;
  reduced: boolean;
}) {
  if (reduced) {
    return (
      <motion.span
        className={`block ${className ?? ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay }}
      >
        {text}
      </motion.span>
    );
  }

  const nodes: ReactNode[] = [];
  text.split(" ").forEach((w, i) => {
    if (i > 0) nodes.push(" ");
    nodes.push(
      <motion.span
        key={i}
        className="inline-block will-change-[transform,filter]"
        variants={{
          hidden: { y: 28, opacity: 0, filter: "blur(12px)" },
          show: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: 0.72, ease: EASE },
          },
        }}
      >
        {w}
      </motion.span>
    );
  });

  return (
    <motion.span
      className={`block ${className ?? ""}`}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.09, delayChildren: delay } },
      }}
    >
      {nodes}
    </motion.span>
  );
}

export default function Landing() {
  const { goTo, total, booting, reduced } = useBook();

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
      {/* ruled label — a small structural mark that seats the composition */}
      <motion.div
        className="mb-9 flex items-center justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
      >
        <motion.span
          className="hidden h-px w-10 origin-right bg-line-2 sm:block"
          initial={reduced ? undefined : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.28 }}
        />
        <p className="eyebrow">Dawn Devs</p>
        <motion.span
          className="hidden h-px w-10 origin-left bg-line-2 sm:block"
          initial={reduced ? undefined : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.28 }}
        />
      </motion.div>

      <h1 className="display text-[14vw] leading-[1.02] text-ink sm:text-7xl md:text-8xl">
        <Words text="We craft websites" delay={0.28} reduced={reduced} />
        {reduced ? (
          <motion.span
            className="block italic shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            worth remembering.
          </motion.span>
        ) : (
          <motion.span
            className="block italic shimmer will-change-[transform,filter]"
            initial={{ y: 30, opacity: 0, filter: "blur(14px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.82 }}
          >
            worth remembering.
          </motion.span>
        )}
      </h1>

      {/* supporting line — gives the hero substance and a clear hierarchy */}
      <motion.p
        className="mx-auto mt-8 max-w-md text-[15px] leading-relaxed text-muted md:text-base"
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 1.0 }}
      >
        One focused studio, crafting websites that feel made, not assembled.
      </motion.p>

      <motion.button
        onClick={() => goTo(total - 1)}
        initial={{ opacity: 0, y: reduced ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 1.15 }}
        className="group btn-ghost mt-12 inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-sm tracking-wide"
      >
        Begin
        <span
          aria-hidden
          className="transition-transform duration-300 ease-out group-hover:translate-x-1.5"
        >
          →
        </span>
      </motion.button>

      <motion.p
        className="eyebrow mt-9 text-[9px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: reduced ? 0.5 : [0.3, 0.7, 0.3] }}
        transition={
          reduced
            ? { duration: 0.5, delay: 1.3 }
            : {
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.3,
              }
        }
      >
        Design · Build · Care
      </motion.p>
    </div>
  );
}
