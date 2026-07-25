"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";
import Atmosphere from "./Atmosphere";
import ShaderBackdrop from "./ShaderBackdrop";
import Landing from "./pages/Landing";
import Approach from "./pages/Approach";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";

/* --------------------------------------------------------------------------
   Book context — lets any page turn to another page or preselect a plan.
-------------------------------------------------------------------------- */
type BookCtx = {
  page: number;
  total: number;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
  reduced: boolean;
  booting: boolean;
  selectedPlan: string;
  setSelectedPlan: (p: string) => void;
};

const Ctx = createContext<BookCtx | null>(null);
export const useBook = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBook must be used inside <Book>");
  return c;
};

const PAGES = [
  { id: "landing", title: "Studio", node: <Landing /> },
  { id: "approach", title: "What we do", node: <Approach /> },
  { id: "pricing", title: "Pricing", node: <Pricing /> },
  { id: "contact", title: "Contact", node: <Contact /> },
];

const TOTAL = PAGES.length;
const EASE = [0.7, 0, 0.2, 1] as const;

export default function Book() {
  const [page, setPage] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("Not sure yet");
  const [reduced, setReduced] = useState(false);
  const [booting, setBooting] = useState(true);
  const dir = useRef(1);
  const lock = useRef(false);
  const touch = useRef({ x: 0, y: 0 });
  // keep a ref of page so wheel/key handlers always see the latest
  const pageRef = useRef(0);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReduced(reduce);
    // boot intro: hold long enough for the top line to travel to the landing
    // mark while the boot text types, then reveal the landing content.
    const t = setTimeout(() => setBooting(false), reduce ? 500 : 2200);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(TOTAL - 1, i));
    setPage((prev) => {
      if (clamped === prev) return prev;
      dir.current = clamped > prev ? 1 : -1;
      return clamped;
    });
  }, []);
  const next = useCallback(() => goTo(pageRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(pageRef.current - 1), [goTo]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const turn = useCallback(
    (delta: number) => {
      if (lock.current) return;
      lock.current = true;
      if (delta > 0) next();
      else prev();
      window.setTimeout(() => (lock.current = false), 1300);
    },
    [next, prev]
  );

  const onWheel = (e: React.WheelEvent) => {
    const vertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
    const d = vertical ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 20) return;
    // If the current page can still scroll in this direction, let it scroll and
    // only turn once it's reached the top/bottom edge.
    if (vertical) {
      const scroller = (e.currentTarget as HTMLElement).querySelector(
        "section > div"
      );
      if (scroller) {
        const atTop = scroller.scrollTop <= 0;
        const atBottom =
          scroller.scrollTop + scroller.clientHeight >=
          scroller.scrollHeight - 1;
        if (d > 0 && !atBottom) return; // more below — scroll, don't turn
        if (d < 0 && !atTop) return; // more above — scroll, don't turn
      }
    }
    turn(d);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) turn(-dx);
  };

  const d = dir.current;
  // Entrance-only, keyed by page: React remounts the section on each turn and
  // the new page flips in. Reliable — no AnimatePresence exit to hang mid-turn.
  const enter = reduced
    ? { opacity: 0 }
    : {
        opacity: 0,
        rotateY: d > 0 ? 18 : -18,
        x: d > 0 ? 130 : -130,
        filter: "blur(5px)",
        transformOrigin: d > 0 ? "left center" : "right center",
      };
  const center = reduced
    ? { opacity: 1 }
    : { opacity: 1, rotateY: 0, x: 0, filter: "blur(0px)" };

  const current = PAGES[page];

  return (
    <Ctx.Provider
      value={{ page, total: TOTAL, goTo, next, prev, reduced, booting, selectedPlan, setSelectedPlan }}
    >
      <Atmosphere />
      <ShaderBackdrop />

      <div
        className="book-stage fixed inset-0 z-10"
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <motion.section
          key={current.id}
          initial={enter}
          animate={center}
          transition={{ duration: reduced ? 0.25 : 0.62, ease: EASE }}
          className="absolute inset-0"
          aria-roledescription="slide"
          aria-label={`${current.title} — page ${page + 1} of ${TOTAL}`}
        >
          {/* The SCROLLER is a separate, un-transformed layer. Mobile browsers
              break touch-scrolling on a 3D-transformed scroll container, so the
              page-turn transform stays on <section> and the scroll lives here.
              touch-action: pan-y → vertical drags scroll, horizontal drags fall
              through to the swipe-to-turn handler. */}
          <div
            className="h-full overflow-y-auto overflow-x-hidden"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
              overscrollBehavior: "contain",
            }}
          >
            {/* min-h-full: centres content when it fits, scrolls from the top
                (no clipping) when it's taller than the screen. */}
            <div className="flex min-h-full items-center justify-center px-5 py-12 md:px-10 md:py-12">
              {current.node}
            </div>
          </div>
        </motion.section>
      </div>

      <Chrome titles={PAGES.map((p) => p.title)} />
    </Ctx.Provider>
  );
}

/* --------------------------------------------------------------------------
   Chrome — wordmark, page dots, bottom prev/next + counter, progress rule.
-------------------------------------------------------------------------- */
function Chrome({ titles }: { titles: string[] }) {
  const { page, total, goTo, next, prev, booting, reduced } = useBook();
  const atStart = page === 0;
  const atEnd = page === total - 1;

  // during boot the line travels from 0 to the current page's mark
  const mark = ((page + 1) / total) * 100;

  return (
    <>
      {/* progress line — starts at 0 and travels to the landing mark on boot,
          then advances one mark per page turn. */}
      <div className="fixed inset-x-0 top-0 z-40 h-px bg-line">
        <motion.div
          className="h-full bg-ink"
          initial={{ width: "0%" }}
          animate={{ width: `${mark}%` }}
          transition={{ duration: booting ? (reduced ? 0.3 : 1.9) : 0.6, ease: EASE }}
        />
      </div>

      {/* everything else appears only once the boot line has arrived */}
      {!booting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* wordmark */}
          <button
            onClick={() => goTo(0)}
            className="fixed left-5 top-6 z-40 flex items-center gap-2.5 md:left-10"
            aria-label="Back to start"
          >
         
            <span className="font-sans text-sm font-medium tracking-tight text-ink">
              dawn<span className="text-faint">devs</span>
            </span>
          </button>

          {/* page dots */}
          <nav className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex">
            {titles.map((t, i) => (
              <button
                key={t}
                onClick={() => goTo(i)}
                className="group flex items-center gap-2"
                aria-label={`Go to ${t}`}
                aria-current={i === page}
              >
                <span
                  className={`font-sans text-[11px] uppercase tracking-widest transition-all duration-300 ${
                    i === page
                      ? "text-ink opacity-100"
                      : "text-muted opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {t}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    i === page
                      ? "bg-ink scale-125"
                      : "bg-line-2 group-hover:bg-muted"
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* bottom controls */}
          <div className="fixed inset-x-0 bottom-6 z-40 flex items-center justify-center gap-6 md:bottom-8">
            <button
              onClick={prev}
              disabled={atStart}
              className="grid h-12 w-12 place-items-center rounded-full border border-line-2 bg-surface/60 backdrop-blur transition-all hover:border-ink disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Previous page"
            >
              <span className="text-lg">←</span>
            </button>

            <div className="flex min-w-[92px] flex-col items-center">
              <span className="font-display text-lg text-ink">
                {String(page + 1).padStart(2, "0")}
                <span className="text-faint">
                  {" "}
                  / {String(total).padStart(2, "0")}
                </span>
              </span>
              <span className="eyebrow mt-0.5 text-[10px] tracking-[0.24em]">
                {titles[page]}
              </span>
            </div>

            <button
              onClick={next}
              disabled={atEnd}
              className="grid h-12 w-12 place-items-center rounded-full border border-line-2 bg-surface/60 backdrop-blur transition-all hover:border-ink disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Next page"
            >
              <span className="text-lg">→</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
