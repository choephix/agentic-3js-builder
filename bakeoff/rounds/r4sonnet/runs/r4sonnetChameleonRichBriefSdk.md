```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Panther chameleon on a twig",
  description:
    "A stylised, rigged panther chameleon walking along a twig: a turquoise head fading through lime green to a sunset-orange tail, a white flank stripe crossed by red bars, a serrated stepped casque, turret eyes looking in two directions, mitten feet clamped round the bark and a tightly coiled tail.",
};

/* ------------------------------------------------------------------ */
/* small math + palette helpers                                        */
/* ------------------------------------------------------------------ */
type V = THREE.Vector3;
interface St { p: V; up: V; rx: number; ry: number }
interface Fr { T: V; L: V; U: V }

const DEG = Math.PI / 180;
const v3 = (x: number, y: number, z: number): V => new THREE.Vector3(x, y, z);
const clamp = (x: number, a: number, c: number) => Math.min(c, Math.max(a, x));
const mix = (a: number, c: number, t: number) => a + (c - a) * t;
const smooth = (a: number, c: number, x: number) => {
  const t = clamp((x - a) / (c - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const UP: V = v3(0, 1, 0);

const usedColors = new Set<string>();
function reg(hex: string): string {
  if (usedColors.has(hex)) return hex;
  if (usedColors.size >= 62) {
    const c = new THREE.Color(hex);
    let best = hex;
    let bd = 1e9;
    usedColors.forEach((h) => {
      const o = new THREE.Color(h);
      const d = (c.r - o.r) ** 2 + (c.g - o.g) ** 2 + (c.b - o.b) ** 2;
      if (d < bd) { bd = d; best = h; }
    });
    return best;
  }
  usedColors.add(hex);
  return hex;
}
function hsl(h: number, s: number, l: number): string {
  const c = new THREE.Color().setHSL((((h % 360) + 360) % 360) / 360, clamp(s, 0, 1), clamp(l, 0, 1), THREE.SRGBColorSpace);
  return reg("#" + c.getHexString(THREE.SRGBColorSpace));
}

// turquoise head -> lime body -> sunset-orange tail
const STOPS: number[][] = [
  [0.0, 178, 0.82, 0.45],
  [0.22, 160, 0.7, 0.46],
  [0.42, 90, 0.68, 0.5],
  [0.6, 48, 0.92, 0.54],
  [0.8, 26, 0.98, 0.55],
  [1.0, 16, 0.96, 0.52],
];
function gradRaw(t: number): number[] {
  t = clamp(t, 0, 1);
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const c = STOPS[i + 1];
    if (t <= c[0]) {
      const k = (t - a[0]) / (c[0] - a[0]);
      return [mix(a[1], c[1], k), mix(a[2], c[2], k), mix(a[3], c[3], k)];
    }
  }
  const e = STOPS[STOPS.length - 1];
  return [e[1], e[2], e[3]];
}
const G = (t: number) => {
  const q = Math.round(clamp(t, 0, 1) * 15) / 15;
  const g = gradRaw(q);
  return hsl(g[0], g[1], g[2]);
};
const Bc = (t: number) => {
  const q = Math.round(clamp(t, 0, 1) * 5) / 5;
  const g = gradRaw(q);
  return hsl(g[0], g[1] * 0.5, 0.78);
};
const tBody = (z: number) => clamp(((0.208 - z) / 0.308) * 0.55, 0, 0.55);

const WHITE = hsl(52, 0.35, 0.94);
const RED = hsl(355, 0.8, 0.46);
const CREAM = hsl(44, 0.55, 0.85);
const CLAW = hsl(40, 0.35, 0.72);
const BLACK = hsl(200, 0.2, 0.05);
const IRIS = hsl(30, 0.85, 0.42);
const GOLD = hsl(46, 0.9, 0.55);
const RAYC = hsl(68, 0.75, 0.55);
const SPARK = hsl(0, 0, 1);
const CREST1 = hsl(172, 0.8, 0.6);
const CREST2 = hsl(180, 0.7, 0.5);
const CREST3 = hsl(176, 0.75, 0.42);

function makeRand(seed: number): () => number {
  try {
    const r: any = (rng as any)(seed);
    let f: (() => number) | null = null;
    if (typeof r === "function") f = () => r();
    else if (r && typeof r.next === "function") f = () => r.next();
    else if (r && typeof r.random === "function") f = () => r.random();
    else if (r && typeof r.float === "function") f = () => r.float();
    if (f) {
      const probe = f();
      if (typeof probe === "number" && isFinite(probe)) return f;
    }
  } catch (e) {
    /* fall through to local generator */
  }
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* geometry helpers (all geometry is built in model space, flat shaded) */
/* ------------------------------------------------------------------ */
function flat(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const src = g.index ? g.toNonIndexed() : g.clone();
  src.computeVertexNormals();
  const n = src.getAttribute("position").count;
  if (!src.getAttribute("uv")) {
    src.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  }
  src.setIndex(Array.from({ length: n }, (_, i) => i));
  return src;
}

function circAngles(n: number): number[] {
  const a: number[] = [];
  for (let i = 0; i <= n; i++) a.push((i / n) * Math.PI * 2);
  return a;
}
function mirrorAngles(halfDeg: number[]): number[] {
  const h = halfDeg.map((d) => d * DEG);
  const full = h.slice();
  for (let i = h.length - 2; i >= 0; i--) full.push(Math.PI * 2 - h[i]);
  return full;
}

function stFrames(st: St[]): Fr[] {
  const n = st.length;
  return st.map((s, i) => {
    const T = st[Math.min(n - 1, i + 1)].p.clone().sub(st[Math.max(0, i - 1)].p).normalize();
    let L = new THREE.Vector3().crossVectors(s.up, T);
    if (L.lengthSq() < 1e-9) L = new THREE.Vector3().crossVectors(v3(1, 0, 0), T);
    if (L.lengthSq() < 1e-9) L = new THREE.Vector3().crossVectors(v3(0, 0, 1), T);
    L.normalize();
    const U = new THREE.Vector3().crossVectors(T, L).normalize();
    return { T, L, U };
  });
}
function ringV(s: St, f: Fr, phi: number, k = 1): V {
  return s.p.clone().addScaledVector(f.L, s.rx * k * Math.sin(phi)).addScaledVector(f.U, s.ry * k * Math.cos(phi));
}

interface LoftOpts {
  angles: number[];
  i0?: number;
  i1?: number;
  segs?: number[];
  capStart?: boolean;
  capEnd?: boolean;
}
function loftGeo(st: St[], o: LoftOpts): THREE.BufferGeometry {
  const fr = stFrames(st);
  const i0 = o.i0 ?? 0;
  const i1 = o.i1 ?? st.length - 1;
  const A = o.angles;
  const nseg = A.length - 1;
  const segs = o.segs ?? Array.from({ length: nseg }, (_, j) => j);
  const pos: number[] = [];
  const push = (...vs: V[]) => {
    for (const v of vs) pos.push(v.x, v.y, v.z);
  };
  for (let i = i0; i < i1; i++) {