"use client";

import { useEffect, useRef } from "react";

/**
 * MotionField — a self-contained, grain-veiled "video" background.
 *
 * Instead of shipping heavy video files, each capability row gets a lightweight
 * <canvas> that draws subtle, monochrome, software-flavoured motion. Kept very
 * low-contrast so — under the global .grain overlay + a dark legibility veil —
 * it reads the way the reference site's background video does: barely there,
 * but alive. Freezes for prefers-reduced-motion.
 *
 * On hover it reacts to the cursor: the pointer's position + an eased "influence"
 * (rises on enter, fades on leave) feed each variant, so the motion leans toward
 * the mouse.
 *
 * variants:
 *   flow — undulating hairlines that swell toward the cursor   (Design)
 *   grid — a swept dot matrix with a spotlight under the cursor (Engineering)
 *   pulse — concentric rings whose origin drifts to the cursor  (Care)
 */
type Variant = "flow" | "grid" | "pulse";

const INK = "243, 242, 239"; // warm white, matches --color-ink

export default function MotionField({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // The canvas itself is pointer-events-none, so listen on the row wrapper —
    // pointer events over the text/labels still bubble up to it.
    const host = canvas.parentElement;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    // Pointer state: (x,y) smoothed toward the target (tx,ty); active is the
    // eased hover influence in 0..1 that target flips between (1 hover, 0 away).
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, active: 0, target: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (ptr.x === 0 && ptr.y === 0) {
        ptr.x = ptr.tx = w / 2;
        ptr.y = ptr.ty = h / 2;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ptr.tx = e.clientX - rect.left;
      ptr.ty = e.clientY - rect.top;
      ptr.target = 1;
    };
    const onLeave = () => {
      ptr.target = 0;
    };
    if (host && !reduced) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }

    const drawFlow = (t: number) => {
      const { x: px, y: py, active: act } = ptr;
      const sigma = w * 0.16; // reach of the cursor's pull along x
      const lines = 6;
      for (let i = 0; i < lines; i++) {
        const baseY = (h * (i + 0.5)) / lines;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          let y =
            baseY +
            Math.sin(x * 0.008 + t * 0.75 + i * 0.9) * (h * 0.05) +
            Math.sin(x * 0.02 - t * 0.45 + i) * (h * 0.02);
          // pull the line toward the cursor, strongest directly under it
          const infl = act * Math.exp(-((x - px) ** 2) / (2 * sigma * sigma));
          y += (py - baseY) * 0.55 * infl;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${INK}, ${0.16 + (i % 2) * 0.06 + act * 0.05})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
    };

    const drawGrid = (t: number) => {
      const { x: px, y: py, active: act } = ptr;
      const reach = w * 0.13; // spotlight radius
      const gap = 24;
      // diagonal sweep position; +0.7 offset so the frozen frame 0 (and
      // reduced-motion users) get a lit band mid-canvas rather than darkness.
      const band = (((t * 0.13) + 0.7) % 1.4) - 0.2;
      for (let gx = gap / 2; gx < w; gx += gap) {
        for (let gy = gap / 2; gy < h; gy += gap) {
          // normalised diagonal coordinate 0..1
          const d = (gx / w + gy / h) / 2;
          const dist = Math.abs(d - band);
          const lit = Math.max(0, 1 - dist * 6); // bright near the band
          // spotlight: dots near the cursor brighten and grow
          const md = Math.hypot(gx - px, gy - py);
          const near = Math.max(0, 1 - md / reach) * act;
          const a = 0.1 + lit * 0.6 + near * 0.55;
          const r = 1 + lit * 1.4 + near * 2.4;
          ctx.beginPath();
          ctx.arc(gx, gy, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${INK}, ${a})`;
          ctx.fill();
        }
      }
    };

    const TAU = Math.PI * 2;
    // satellites that orbit the pulse origin, giving the field body
    const ORBITS = [
      { rf: 0.24, n: 3, spd: 0.5 },
      { rf: 0.42, n: 5, spd: -0.32 },
      { rf: 0.64, n: 7, spd: 0.22 },
    ];

    const drawPulse = (t: number) => {
      const act = ptr.active;
      // origin eases from centre toward the cursor as hover ramps up
      const cx = w / 2 + (ptr.x - w / 2) * act;
      const cy = h / 2 + (ptr.y - h / 2) * act;
      const maxR = Math.hypot(w, h) / 2;

      // expanding concentric rings
      const rings = 6;
      for (let i = 0; i < rings; i++) {
        const p = (t * 0.09 + i / rings) % 1;
        const r = p * maxR;
        const a = (1 - p) * (0.24 + act * 0.14);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.strokeStyle = `rgba(${INK}, ${a})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      // orbiting satellites — a slow, calm constellation around the node
      for (let o = 0; o < ORBITS.length; o++) {
        const orbit = ORBITS[o];
        const rr = h * orbit.rf;
        for (let k = 0; k < orbit.n; k++) {
          const ang = t * orbit.spd + (k / orbit.n) * TAU + o;
          const x = cx + Math.cos(ang) * rr;
          const y = cy + Math.sin(ang) * rr * 0.72; // gentle ellipse
          ctx.beginPath();
          ctx.arc(x, y, 1.3, 0, TAU);
          ctx.fillStyle = `rgba(${INK}, ${0.3 + act * 0.25})`;
          ctx.fill();
        }
      }

      // the pulsing centre node
      const breathe = 2.4 + Math.sin(t * 1.6) * 0.7 + act * 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, breathe, 0, TAU);
      ctx.fillStyle = `rgba(${INK}, ${0.5 + act * 0.2})`;
      ctx.fill();
    };

    const render = (tSeconds: number) => {
      // ease pointer + influence toward their targets
      ptr.x += (ptr.tx - ptr.x) * 0.15;
      ptr.y += (ptr.ty - ptr.y) * 0.15;
      ptr.active += (ptr.target - ptr.active) * 0.08;
      ctx.clearRect(0, 0, w, h);
      if (variant === "flow") drawFlow(tSeconds);
      else if (variant === "grid") drawGrid(tSeconds);
      else drawPulse(tSeconds);
    };

    const start = performance.now();
    const loop = (now: number) => {
      render((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };

    // Paint frame 0 immediately so there's never a blank flash — and so the
    // field still shows something if rAF is throttled (e.g. a background tab).
    render(0);
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (host) {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [variant]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
