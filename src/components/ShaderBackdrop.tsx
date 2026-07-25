"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBook } from "./Book";

/**
 * ShaderBackdrop — one persistent, site-wide WebGL "video" background.
 *
 * The whole book shares a single flowing-ink shader (domain-warped 5-octave
 * FBM). Rather than swapping a different background per page — which would feel
 * abrupt — the shader's uniforms EASE between per-page targets, so turning a
 * page gently morphs the mood:
 *
 *   Landing   — warm, calm, medium structure
 *   What we do — cooler, a touch more active
 *   Pricing   — coolest, silvered, refined
 *   Contact   — warm again, slow: a sense of arrival
 *
 * The palette variation stays inside the "Nocturne" register (near-black base,
 * near-white flow, a whisper of accent in the cores), so the change reads as
 * evolution, never a jump. Portalled to <body>, fixed behind the book (z-5),
 * rendered at 0.6x backing resolution, frozen for prefers-reduced-motion.
 */
type Look = {
  tone: [number, number, number]; // primary flow colour
  core: [number, number, number]; // accent in the brightest cores
  speed: number; // flow rate
  scale: number; // structure size
  warp: number; // domain-warp amount
  intensity: number; // overall brightness
};

// index matches the book's page order
const LOOKS: Look[] = [
  // Landing shares the second page's (Approach) background look — same tone,
  // core, scale and warp — so turning from page 1 to 2 holds one continuous mood.
  { tone: [0.8, 0.84, 0.86], core: [0.66, 0.8, 0.88], speed: 0.058, scale: 1.65, warp: 2.05, intensity: 0.96 },
  { tone: [0.8, 0.84, 0.86], core: [0.66, 0.8, 0.88], speed: 0.058, scale: 1.65, warp: 2.05, intensity: 0.96 },
  { tone: [0.78, 0.83, 0.9], core: [0.6, 0.74, 0.94], speed: 0.04, scale: 1.95, warp: 1.7, intensity: 0.9 },
  { tone: [0.88, 0.82, 0.73], core: [0.92, 0.72, 0.48], speed: 0.03, scale: 1.5, warp: 1.9, intensity: 0.95 },
];

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uTone;
uniform vec3 uCore;
uniform float uScale;
uniform float uWarp;
uniform float uIntensity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;

  vec2 q = vec2(
    fbm(uv * uScale + vec2(0.0, t)),
    fbm(uv * uScale + vec2(5.2, 1.3) - t)
  );
  vec2 r = vec2(
    fbm(uv * uScale + uWarp * q + vec2(1.7, 9.2) + 0.15 * t),
    fbm(uv * uScale + uWarp * q + vec2(8.3, 2.8) - 0.12 * t)
  );
  float f = fbm(uv * uScale + uWarp * r);

  float glow = smoothstep(0.12, 0.82, f);
  float filament = smoothstep(0.52, 0.80, f);
  vec3 col = vec3(0.03);
  col += uTone * glow * 0.32 * uIntensity;
  col += mix(uTone, vec3(1.0), 0.4) * filament * 0.24 * uIntensity;
  col += uCore * pow(glow, 3.0) * 0.10 * uIntensity;

  float vig = smoothstep(1.3, 0.15, length(uv + vec2(0.0, 0.12)));
  col *= mix(0.55, 1.0, vig);

  float g = hash(gl_FragCoord.xy + fract(uTime)) * 0.022 - 0.011;
  col += g;

  gl_FragColor = vec4(col, 1.0);
}
`;

function GLCanvas({
  pageRef,
  redrawRef,
}: {
  pageRef: React.MutableRefObject<number>;
  redrawRef: React.MutableRefObject<(() => void) | null>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    if (!gl) {
      canvas.style.background =
        "radial-gradient(70% 55% at 50% 35%, rgba(30,29,27,0.9), #0a0a0b 70%)";
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.warn("[ShaderBackdrop]", gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[ShaderBackdrop] link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      tone: gl.getUniformLocation(prog, "uTone"),
      core: gl.getUniformLocation(prog, "uCore"),
      scale: gl.getUniformLocation(prog, "uScale"),
      warp: gl.getUniformLocation(prog, "uWarp"),
      intensity: gl.getUniformLocation(prog, "uIntensity"),
    };

    const scale = 0.6;
    const resize = () => {
      const b = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(b.width * scale));
      canvas.height = Math.max(1, Math.floor(b.height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.res, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // eased current look (start at the current page's target)
    const cur: Look = structuredCloneLook(LOOKS[pageRef.current] ?? LOOKS[0]);
    let flowTime = 0;

    const applyUniforms = () => {
      gl.uniform1f(U.time, flowTime);
      gl.uniform3f(U.tone, cur.tone[0], cur.tone[1], cur.tone[2]);
      gl.uniform3f(U.core, cur.core[0], cur.core[1], cur.core[2]);
      gl.uniform1f(U.scale, cur.scale);
      gl.uniform1f(U.warp, cur.warp);
      gl.uniform1f(U.intensity, cur.intensity);
    };

    // static redraw (used for reduced-motion + on page change while frozen)
    const redrawStatic = () => {
      const tgt = LOOKS[pageRef.current] ?? LOOKS[0];
      snapLook(cur, tgt);
      flowTime = 6.0;
      applyUniforms();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    redrawRef.current = reduced ? redrawStatic : null;

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const tgt = LOOKS[pageRef.current] ?? LOOKS[0];
      const a = 1 - Math.exp(-dt / 0.6); // framerate-independent ease, ~0.6s
      easeLook(cur, tgt, a);
      flowTime += dt * cur.speed;
      applyUniforms();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };

    if (reduced) redrawStatic();
    else {
      applyUniforms();
      gl.drawArrays(gl.TRIANGLES, 0, 3); // frame 0
      raf = requestAnimationFrame(loop);
    }

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    const onRestored = () => {
      if (!reduced) raf = requestAnimationFrame(loop);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      redrawRef.current = null;
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      // deliberately not calling loseContext() — StrictMode remounts reuse this
      // same canvas and a lost context would poison the second mount.
    };
  }, [pageRef, redrawRef]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

export default function ShaderBackdrop() {
  const { page } = useBook();
  const [mounted, setMounted] = useState(false);
  const pageRef = useRef(page);
  const redrawRef = useRef<(() => void) | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    pageRef.current = page;
    // reduced-motion path is frozen; nudge a redraw so the page's look applies
    redrawRef.current?.();
  }, [page]);

  if (!mounted) return null;
  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5]">
      <GLCanvas pageRef={pageRef} redrawRef={redrawRef} />
      {/* gentle scrim: light in the centre, darker at the edges — keeps type
          legible across pages without hiding the flow */}
      <div className="absolute inset-0 bg-[radial-gradient(65%_60%_at_50%_45%,rgba(10,10,11,0.14),rgba(10,10,11,0.5))]" />
    </div>,
    document.body
  );
}

/* ---- look helpers ---- */
function structuredCloneLook(l: Look): Look {
  return { tone: [...l.tone], core: [...l.core], speed: l.speed, scale: l.scale, warp: l.warp, intensity: l.intensity };
}
function snapLook(cur: Look, t: Look) {
  cur.tone = [...t.tone];
  cur.core = [...t.core];
  cur.speed = t.speed;
  cur.scale = t.scale;
  cur.warp = t.warp;
  cur.intensity = t.intensity;
}
function easeLook(cur: Look, t: Look, a: number) {
  for (let i = 0; i < 3; i++) {
    cur.tone[i] += (t.tone[i] - cur.tone[i]) * a;
    cur.core[i] += (t.core[i] - cur.core[i]) * a;
  }
  cur.speed += (t.speed - cur.speed) * a;
  cur.scale += (t.scale - cur.scale) * a;
  cur.warp += (t.warp - cur.warp) * a;
  cur.intensity += (t.intensity - cur.intensity) * a;
}
