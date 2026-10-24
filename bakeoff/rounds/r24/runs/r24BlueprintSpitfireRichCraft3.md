```ts
import * as THREE from "three";
import { createBuilder, catmull, mix, noise, paint, resolve, rgb, smoothstep, svg } from "agentic-3js-builder";
import type { ColorInput, DirectionInput, Joint, PointInput, Rgb, V3 } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Supermarine Spitfire Mk I — cyanotype blueprint",
  description:
    "A 1:1 Spitfire in three-point stance, printed in Prussian-blue cyanotype: white panel seams, rivet rows, glowing section rings, dimension arrows and stencilled labels drawn on the skin. Prop, rudder and elevators are rigged hinges.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: Prussian blue ground, chalk-white linework
const NAVY = "#06214f";
const LINE = "#e6f3ff";
const ICE = "#a9d6ff";
const SKY = "#3f8fe0";
const LN = rgb(LINE);
const INKC = rgb(NAVY);

const TAU = Math.PI * 2;
const D2R = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const arr = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];
const fract = (x: number) => x - Math.floor(x);

// Three-point stance: the centreline climbs 8.5 degrees toward the nose.
const SL = 0.15;
const cy = (z: number) => 1.55 + SL * z;
const AX = V(0, SL, 1).normalize(); // thrust axis
const UP_IN = V(0, 1, -SL).normalize(); // "up" inside the propeller disc
const SIDE = V(1, 0, 0);

// Elliptical wing
const WS = 5.6;
const UEND = 0.9;
const C0 = 2.6;
const cU = (u: number) => C0 * Math.sqrt(Math.max(1 - u * u, 0));
const zLE = (u: number) => 1.15 - 0.55 * u;
const zC = (u: number) => zLE(u) - cU(u) / 2;
const yC = (u: number) => 1.22 + 0.105 * WS * u;
const wingTop = (x: number) => yC(Math.abs(x) / WS) + 0.068 * cU(Math.abs(x) / WS);
const wingBottom = (x: number) => yC(Math.abs(x) / WS) - 0.068 * cU(Math.abs(x) / WS);
const WU = [0, 0.2, 0.4, 0.55, 0.7, 0.8, 0.9];

// ---------------------------------------------------------------------------------------------------------------
// Paints
type Hook = (p: THREE.Vector3, n: THREE.Vector3, s: readonly [number, number], c: Rgb) => Rgb | null;
type BP = { lo: string; hi: string; seed: number; grid?: [number, number]; pre?: Hook; hook?: Hook };

/** Cyanotype skin: lit-from-above blue, uneven exposure, chalk panel seams and rivet rows. */
function bp(o: BP) {
  const lo = rgb(o.lo);
  const hi = rgb(o.hi);
  const [pu, pv] = o.grid ?? [0.7, 0.46];
  const pitch = 0.1;
  const along = (x: number) => (fract(x / pitch) - 0.5) * pitch;
  return paint((p, n, s) => {
    const lit = smoothstep(-0.8, 0.9, n.y);
    const k = 0.1 + 0.72 * lit + (noise(p, 0.7, o.seed) - 0.5) * 0.4;
    let c: Rgb = mix(lo, hi, Math.min(Math.max(k, 0), 1));
    if (o.pre) c = o.pre(p, n, s, c) ?? c;
    if (o.hook) {
      const h = o.hook(p, n, s, c);
      if (h) return h;
    }
    if (pu > 0) {
      const ax = Math.abs(n.x);
      const ay = Math.abs(n.y);
      const az = Math.abs(n.z);
      const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
      const du = fract(u / pu) * pu;
      const dv = fract(v / pv) * pv;
      if (du < 0.011 || dv < 0.011) return mix(c, LN, 0.7);
      const d = Math.min(Math.hypot(du - 0.024, along(v)), Math.hypot(dv - 0.024, along(u)));
      if (d < 0.011) return mix(c, LN, 0.55);
    }
    return c;
  });
}

/** Chalk outline on the thin walls of a flat plate. `thick` is the plate's thickness direction. */
function rim(base: ColorInput, thick: THREE.Vector3) {
  return paint((p, n) => (Math.abs(n.dot(thick)) < 0.5 ? LN : resolve(base, p, n)));
}

const FUS_P = bp({
  lo: "#082a68",
  hi: "#2468c4",
  seed: 3,
  grid: [0.8, 0.5],
  pre: (p, _n, _s, c) => (p.z > 2.0 ? mix(c, INKC, 0.22) : null),
  hook: (p, n, _s, _c) => {
    // cockpit door outline
    if (Math.abs(n.x) > 0.6) {
      const dy = p.y - cy(p.z);
      const e = 0.008;
      const inZ = p.z > -0.3 && p.z < 0.75;
      const inY = dy > -0.1 && dy < 0.45;
      const edge =
        ((Math.abs(p.z + 0.3) < e || Math.abs(p.z - 0.75) < e) && inY) ||
        ((Math.abs(dy + 0.1) < e || Math.abs(dy - 0.45) < e) && inZ);
      if (edge) return LN;
    }
    if (Math.abs(p.z - 2.0) < 0.009) return LN;
    return null;
  },
});

const WING_P = bp({
  lo: "#0a2f74",
  hi: "#2e78d4",
  seed: 7,
  grid: [0, 0],
  hook: (p, n, s, c) => {
    const u = s[0] * UEND;
    const ch = cU(u);
    if (ch < 0.05) return null;
    const f = (p.z - (zC(u) - ch / 2)) / ch; // 0 trailing edge, 1 leading edge
    const span = WS * u;
    const w = 0.008;
    const near = (a: number) => Math.abs(span - a) < w;
    const inA = span > 3.3 && span < 5.0;
    const inF = span > 0.9 && span < 3.0;
    if ((inA || inF) && f < 0.26) {
      if (Math.abs(f - 0.26) * ch < w) return LN;
      if (inA && (near(3.3) || near(5.0))) return LN;
      if (inF && (near(0.9) || near(3.0))) return LN;
    }
    if (f > 0.76 && span > 1.4 && span < 3.2) {
      if (Math.abs(f - 0.78) * ch < w || near(1.4) || near(3.2)) return LN;
    }
    if (n.y > 0.6 && span < 1.3 && f > 0.25 && f < 0.75) return mix(c, INKC, 0.5);
    if (f < 0.75 && Math.abs(span / 0.7 - Math.round(span / 0.7)) * 0.7 < 0.005) return mix(c, LN, 0.28);
    // rivet row hugging the leading-edge seam
    if (Math.abs(f - 0.86) * ch < 0.009 && fract(span / 0.09) < 0.2) return mix(c, LN, 0.6);
    return null;
  },
});

const TAIL_P = bp({ lo: "#0b3079", hi: "#2a6fcb", seed: 11, grid: [0.5, 0.34] });
const DOOR_P = bp({ lo: "#0c3680", hi: "#2f78d0", seed: 13, grid: [0.2, 0.2] });
const RAD_P = bp({ lo: "#07235a", hi: "#1d5cb0", seed: 17, grid: [0.3, 0.2] });
const COWL_P = bp({ lo: "#061f52", hi: "#1a56a8", seed: 19, grid: [0.25, 0.2] });

const GLASS = paint((p, n) => {
  const t = smoothstep(-0.2, 0.9, n.y);
  const c: Rgb = mix("#2e7fd0", "#9fd8ff", t * 0.85);
  for (const z of [1.18, 0.12, -0.62]) if (Math.abs(p.z - z) < 0.016) return LN;
  if (p.z > 0.95 && Math.abs(p.x) < 0.013) return LN;
  const g = fract(p.z * 2.2 + p.x * 1.0 + p.y * 1.6);
  if (g < 0.1) return mix(c, LN, 0.4);
  return c;
});

const SPIN_P = paint((_p, n, s) => {
  if (s[0] > 0.66 || Math.abs(s[0] - 0.12) < 0.012 || Math.abs(s[0] - 0.4) < 0.008) return LN;
  return mix("#0a2f74", "#3a86d8", smoothstep(-0.5, 0.9, n.y));
});
const BLADE_P = paint((_p, _n, s) => {
  if (s[0] > 1.38) return LN;
  return mix("#0b2f78", "#3f8fe0", Math.min(Math.max((s[0] - 0.3) / 1.2, 0), 1));
});
const TIRE_P = paint((_p, n, s) => {
  const tread = fract(s[1] / 18) < 0.16 && Math.abs(n.x) < 0.6;
  return tread ? mix("#04122e", "#26509a", 0.8) : mix("#03102a", "#0f2c66", smoothstep(-0.5, 0.9, n.y));
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings (white linework on blueprint blue)
const spokes = (() => {
  let s = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    s += `<path d="M50 50 L${(50 + 40 * Math.cos(a)).toFixed(1)} ${(50 + 40 * Math.sin(a)).toFixed(1)}" stroke="${LINE}" stroke-width="5"/>`;
  }
  return s;
})();

function drawings() {
  const roundel = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="#7fb8f0" stroke="${LINE}" stroke-width="3"/>
      <circle cx="50" cy="50" r="35" fill="#f2f8ff" stroke="${LINE}" stroke-width="2"/>
      <circle cx="50" cy="50" r="23" fill="#0a2f74" stroke="${LINE}" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="10" fill="${ICE}" stroke="${LINE}" stroke-width="2"/>
      <path d="M50 0V8M50 92V100M0 50H8M92 50H100" stroke="${LINE}" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  const name = svg(
    `<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="236" height="56" rx="4" fill="none" stroke="${LINE}" stroke-width="2.5"/>
      <text x="120" y="35" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="30" letter-spacing="4" fill="${LINE}">SPITFIRE</text>
      <text x="120" y="52" text-anchor="middle" font-family="Courier New, monospace" font-size="10.5" letter-spacing="1.5" fill="${ICE}">SUPERMARINE · TYPE 300 · Mk I</text>
    </svg>`,
    { size: 512 },
  );
  const dim = (label: string, w: number) =>
    svg(
      `<svg viewBox="0 0 ${w} 44" xmlns="http://www.w3.org/2000/svg">
        <g stroke="${LINE}" stroke-width="3" fill="${LINE}">
          <path d="M8 22H${w / 2 - 52}M${w / 2 + 52} 22H${w - 8}"/>
          <path d="M6 8V36M${w - 6} 8V36"/>
          <path d="M6 22L22 15V29Z"/><path d="M${w - 6} 22L${w - 22} 15V29Z"/>
        </g>
        <text x="${w / 2}" y="30" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="22" fill="${LINE}">${label}</text>
      </svg>`,
      { size: 800 },
    );
  const code = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <text x="60" y="30" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="30" letter-spacing="2" fill="${LINE}">K9942</text>
    </svg>`,
    { size: 256 },
  );
  const hub = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#1d63bd"/>
      <circle cx="50" cy="50" r="45" fill="none" stroke="${LINE}" stroke-width="3.5"/>
      <circle cx="50" cy="50" r="24" fill="#0b3279" stroke="${LINE}" stroke-width="2.5"/>
      ${spokes}
      <circle cx="50" cy="50" r="9" fill="${LINE}"/>
    </svg>`,
    { size: 192 },
  );
  let bars = "";
  for (let i = 1; i < 11; i++) bars += `<path d="M${i * 5.5} 4V60" stroke="${LINE}" stroke-width="1.8"/>`;
  const grille = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="${NAVY}"/>${bars}
      <rect x="2" y="2" width="60" height="60" fill="none" stroke="${LINE}" stroke-width="3"/>
      <path d="M2 32H62" stroke="${LINE}" stroke-width="1.8"/>
    </svg>`,
    { size: 128 },
  );
  const title = svg(
    `<svg viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="216" height="86" fill="none" stroke="${LINE}" stroke-width="3"/>
      <path d="M2 30H218M110 30V88" stroke="${LINE}" stroke-width="2"/>
      <text x="110" y="23" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="17" fill="${LINE}">SUPERMARINE</text>
      <text x="56" y="56" text-anchor="middle" font-family="Courier New, monospace" font-size="13" fill="${LINE}">TYPE 300</text>
      <text x="56" y="76" text-anchor="middle" font-family="Courier New, monospace" font-size="11" fill="${ICE}">SCALE 1:1</text>
      <text x="165" y="56" text-anchor="middle" font-family="Courier New, monospace" font-size="13" fill="${LINE}">SHEET 1</text>
      <text x="165" y="76" text-anchor="middle" font-family="Courier New, monospace" font-size="11" fill="${ICE}">R.J.M. 1936</text>
    </svg>`,
    { size: 512 },
  );
  return {
    roundel,
    name,
    code,
    hub,
    grille,
    title,
    fusDim: dim("9.12 m", 400),
    wingDim: dim("5.61 m", 300),
  };
}

// ---------------------------------------------------------------------------------------------------------------
type PO = {
  bone?: Joint;
  dir?: DirectionInput;
  up?: DirectionInput;
  axis?: "x" | "y" | "z";
  scale?: V3;
  texture?: THREE.Texture;
};

const BLADE: [number, number][] = [
  [0.28, -0.05],
  [0.55, -0.11],
  [0.95, -0.16],
  [1.3, -0.15],
  [1.52, -0.1],
  [1.62, -0.03],
  [1.62, 0.05],
  [1.5, 0.12],
  [1.2, 0.17],
  [0.8, 0.15],
  [0.5, 0.08],
];
const SPIN_PROFILE: [number, number][] = [
  [0, 0],
  [0.4, 0],
  [0.405, 0.14],
  [0.34, 0.38],
  [0.22, 0.62],
  [0.1, 0.78],
  [0, 0.84],
];
const TIRE_PROFILE: [number, number][] = [
  [0.17, -0.1],
  [0.31, -0.1],
  [0.366, -0.06],
  [0.37, 0],
  [0.366, 0.06],
  [0.31, 0.1],
  [0.17, 0.1],
];
const FIN: [number, number][] = [
  [0.05, 0],
  [-0.55, 1.1],
  [-0.85, 1.45],
  [-1.05, 1.45],
  [-1.1, 0],
];
const RUDDER: [number, number][] = [
  [-1.1, 0],
  [-1.05, 1.45],
  [-1.2, 1.48],
  [-1.45, 1.35],
  [-1.75, 0.95],
  [-1.95, 0.4],
  [-1.95, 0],
];
const STAB: [number, number][] = [
  [-1.65, -0.3],
  [-1.55, -0.05],
  [-1.2, 0.2],
  [-0.6, 0.42],
  [0, 0.48],
  [0.6, 0.42],
  [1.2, 0.2],
  [1.55, -0.05],
  [1.65, -0.3],
];
const ELEV: [number, number][] = [
  [0.02, 0],
  [1.65, 0],
  [1.62, -0.25],
  [1.3, -0.55],
  [0.8, -0.75],
  [0.02, -0.8],
];
const DOOR: [number, number][] = [
  [-0.1, 0],
  [0.35, 0],
  [0.36, -0.35],
  [0.28, -0.7],
  [0.15, -0.78],
  [0.05, -0.6],
  [-0.08, -0.3],
];

const FUS_ST: [number, number, number, number][] = [
  [3.72, 0.0, 0.8, 0.82],
  [3.2, 0.0, 0.88, 0.96],
  [2.4, 0.02, 0.92, 1.08],
  [1.5, 0.04, 0.92, 1.18],
  [0.5, 0.06, 0.9, 1.22],
  [-0.5, 0.06, 0.82, 1.2],
  [-1.6, 0.0, 0.66, 1.06],
  [-2.8, -0.02, 0.5, 0.86],
  [-3.8, -0.03, 0.34, 0.6],
  [-4.6, -0.04, 0.12, 0.3],
];
const CAN_ST: [number, number, number, number][] = [
  [1.5, 0.52, 0.3, 0.22],
  [1.1, 0.68, 0.52, 0.5],
  [0.5, 0.78, 0.58, 0.64],
  [-0.3, 0.74, 0.56, 0.56],
  [-0.9, 0.62, 0.42, 0.36],
  [-1.3, 0.5, 0.2, 0.12],
];

export default function build() {
  const b = createBuilder({ name: "spitfire", paintSize: 2048 });
  const T = drawings();

  // Skeleton: one root, a spinning prop and three control-surface hinges.
  const body = b.joint("body", { at: [0, cy(0), 0], dir: [0, 0, 1] });
  const N0 = V(0, cy(3.78), 3.78);
  const HUB = N0.clone().addScaledVector(AX, 0.38);
  const prop = b.joint("prop", { parent: body, at: arr(HUB), dir: arr(AX), role: "fan" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 0.95, -3.8], dir: [0, 1, 0], role: "hinge" });
  const elevJ = [1, -1].map((s) =>
    b.joint(s > 0 ? "elevatorL" : "elevatorR", {
      parent: body,
      at: [s * 0.04, 1.02, -3.9],
      dir: [s, 0, 0],
      role: "hinge",
    }),
  );

  const put = (g: THREE.BufferGeometry, color: ColorInput, at: PointInput, o: PO = {}) =>
    b.part(g, color, { bone: body, at, ...o });
  const safe = (fn: () => void) => {
    try {
      fn();
    } catch {
      /* decorative surface work only */
    }
  };
  const thin = (path: Parameters<typeof b.sweep>[0], r = 0.008, g = 0.8) =>
    glow(b.sweep(path, r, { color: LINE, bone: body, sides: 4 }), g);

  // ---------------------------------------------------------------- fuselage
  const fus = b.loft(
    FUS_ST.map(([z, dy, w, h]) => ({ at: [0, cy(z) + dy, z] as [number, number, number], w, h })),
    { color: FUS_P, bone: body, caps: { start: "flat", end: "round" }, sides: 12 },
  );
  const skin = b.surface(fus);

  // bulkhead section rings, glowing chalk
  safe(() => {
    for (const z of [3.4, 2.7, 1.9, 0.9, -0.3, -1.4, -2.3, -3.2, -4.0])
      thin(skin.loop([0, cy(z) + 0.04, z], { dir: [0, 0, 1], lift: 0.012 }), 0.008);
  });
  // stringers
  safe(() => {
    for (const a of [0, 40, 80, 180, -40, -80]) thin(fus.line(a, 0.006), 0.007, 0.7);
  });
  // fastener rings
  safe(() => {
    for (const [z, n] of [
      [3.55, 30],
      [2.0, 30],
      [-1.45, 22],
      [-3.0, 14],
    ] as [number, number][]) {
      b.along(skin.loop([0, cy(z) + 0.04, z], { dir: [0, 0, 1], lift: 0.004 }), n, (at) =>
        b.part(new THREE.SphereGeometry(0.014, 5, 4), LINE, { at }),
      );
    }
  });

  // canopy
  b.loft(
    CAN_ST.map(([z, dy, w, h]) => ({ at: [0, cy(z) + dy, z] as [number, number, number], w, h })),
    { color: GLASS, bone: body, caps: { start: "round", end: "round" }, sides: 10 },
  );
  // headrest / armour fairing behind the pilot
  put(new THREE.BoxGeometry(0.34, 0.3, 0.22), COWL_P, [0, cy(-1.15) + 0.45, -1.15], { dir: AX, axis: "z" });

  // ---------------------------------------------------------------- nose
  // cowl lip ring and chin scoop
  glow(
    put(new THREE.TorusGeometry(0.405, 0.02, 5, 20), LINE, [0, cy(3.74), 3.74], { dir: AX, axis: "z" }),
    0.9,
  );
  put(new THREE.BoxGeometry(0.42, 0.22, 0.8), COWL_P, [0, cy(3.0) - 0.5, 3.05], { dir: AX, axis: "z" });
  glow(put(new THREE.PlaneGeometry(0.34, 0.16), "#ffffff", [0, cy(3.0) - 0.5, 3.46], { dir: AX, axis: "z", texture: T.grille }), 0.6);

  // blisters over the cylinder banks
  for (const s of [1, -1]) {
    const hit = skin.ray([s * 0.2, 4, 2.9], [0, -1, 0]);
    if (hit)
      b.stick(new THREE.SphereGeometry(1, 8, 5), COWL_P, hit, { embed: 0.3, flow: [0, 0, 1], scale: [0.1, 0.07, 0.45] });
    const hit2 = skin.ray([s * 0.2, 4, 3.45], [0, -1, 0]);
    if (hit2)
      b.stick(new THREE.SphereGeometry(1, 8, 5), COWL_P, hit2, { embed: 0.3, flow: [0, 0, 1], scale: [0.07, 0.05, 0.15] });
  }
  // exhaust stubs
  for (const s of [1, -1])
    for (let k = 0; k < 6; k++) {
      const z = 2.15 + k * 0.2;
      const hit = skin.around([0, cy(z) + 0.06, z]).at(s * 90, 6);
      if (hit)
        b.stick(new THREE.BoxGeometry(0.05, 0.16, 0.09), k % 2 ? ICE : "#cfe6ff", hit, { embed: 0.35, flow: [0, 0, -1] });
    }

  // spinner, blades and hub (all on the prop joint)
  b.lathe(SPIN_PROFILE, { at: arr(N0), axis: arr(AX), bone: prop, smoothing: 1, color: SPIN_P });
  put(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 14), "#0f3c8a", arr(N0.clone().addScaledVector(AX, 0.02)), {
    bone: prop,
    dir: arr(AX),
  });
  for (let k = 0; k < 3; k++) {
    const th = 0.35 + (k * TAU) / 3;
    const R = UP_IN.clone().multiplyScalar(Math.cos(th)).addScaledVector(SIDE, Math.sin(th));
    const Tn = new THREE.Vector3().crossVectors(AX, R).normalize();
    const pitch = 24 * D2R;
    const Y = Tn.clone().multiplyScalar(Math.cos(pitch)).addScaledVector(AX, Math.sin(pitch));
    b.extrude(BLADE, {
      at: arr(HUB),
      x: arr(R),
      y: arr(Y),
      thickness: 0.04,
      bevel: 0.012,
      smoothing: 1,
      bone: prop,
      color: BLADE_P,
    });
    put(new THREE.CylinderGeometry(0.075, 0.095, 0.34, 8), ICE, arr(HUB.clone().addScaledVector(R, 0.3)), {
      bone: prop,
      dir: arr(R),
    });
  }

  // ---------------------------------------------------------------- wings
  const wingSweeps: Record<string, ReturnType<typeof b.sweep>> = {};
  for (const s of [1, -1]) {
    const path = catmull(WU.map((u) => [s * WS * u, yC(u), zC(u)] as [number, number, number]));
    const wing = b.sweep(
      path,
      (t: number): [number, number] => {
        const c = cU(t * UEND);
        return [c / 2, 0.068 * c];
      },
      { up: [0, 1, 0], color: WING_P, bone: body, sides: 12, caps: { start: "flat", end: "round" }, detail: 1.4 },
    );
    wingSweeps[String(s)] = wing;
    const wskin = b.surface(wing);

    // rib section lines
    safe(() => {
      for (const u of [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82])
        thin(wskin.loop([s * WS * u, yC(u), zC(u)], { dir: [1, 0, 0], lift: 0.008 }), 0.008);
    });
    // edge and spar lines
    safe(() => {
      for (const a of [90, 270, 40, 140, 220, 320]) thin(wing.line(a, 0.005), 0.007, 0.7);
    });

    // machine guns in the leading edge
    for (const x of [1.7, 2.0, 2.35, 2.75]) {
      const u = x / WS;
      put(new THREE.CylinderGeometry(0.02, 0.022, 0.42, 6), ICE, [s * x, yC(u) - 0.01, zLE(u) + 0.07], {
        dir: [0, 0, 1],
      });
      put(new THREE.CylinderGeometry(0.032, 0.032, 0.04, 6), LINE, [s * x, yC(u) - 0.01, zLE(u) - 0.02], {
        dir: [0, 0, 1],
      });
    }
    // wingtip light
    glow(put(new THREE.SphereGeometry(0.05, 6, 4), "#8fe6ff", [s * 5.47, yC(0.9) + 0.04, 0.09]), 1.4);

    // radiator / oil cooler
    const rx = s * 2.5;
    const big = s < 0;
    const w0 = big ? 0.56 : 0.4;
    b.frustumBox([rx, 1.2, -0.55], [rx, 1.2, 0.5], [w0, 0.3], [w0 * 0.85, 0.34], { bone: body, color: RAD_P });
    glow(put(new THREE.PlaneGeometry(w0 * 0.9, 0.26), "#ffffff", [rx, 1.2, 0.505], { dir: [0, 0, 1], axis: "z", texture: T.grille }), 0.6);
    put(new THREE.BoxGeometry(w0 + 0.06, 0.04, 0.05), LINE, [rx, 1.04, 0.5]);

    // main undercarriage
    const ax: [number, number, number] = [s * 1.3, 0.365, 0.35];
    b.rod([s * 1.12, 1.28, 0.3], [s * 1.28, 0.42, 0.34], 0.06, { color: ICE, bone: body, sides: 6 });
    b.rod([s * 1.12, 1.28, 0.3], [s * 1.2, 0.86, 0.32], 0.08, { color: "#7fb4ee", bone: body, sides: 6 });
    b.rod([s * 1.2, 0.8, 0.33], [s * 1.2, 0.8, 0.12], 0.02, { color: LINE, bone: body, sides: 4 });
    b.rod([s * 1.2, 0.7, 0.34], [s * 1.42, 0.62, 0.34], 0.018, { color: LINE, bone: body, sides: 4 });
    b.rod([s * 1.18, 0.37, 0.35], [s * 1.44, 0.37, 0.35], 0.045, { color: ICE, bone: body, sides: 6 });
    b.lathe(TIRE_PROFILE, { at: ax, axis: [1, 0, 0], segments: 16, bone: body, color: TIRE_P });
    glow(put(new THREE.CircleGeometry(0.2, 20), "#ffffff", [s * 1.41, 0.365, 0.35], { dir: [s, 0, 0], axis: "z", texture: T.hub }), 0.5);
    put(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16), "#0b3279", [s * 1.205, 0.365, 0.35], { dir: [1, 0, 0] });
    // leg fairing door
    b.extrude(DOOR, {
      at: [s * 1.47, 1.18, 0.15],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.008,
      smoothing: 1,
      bone: body,
      color: rim(DOOR_P, V(1, 0, 0)),
    });
  }

  // wing decals: roundels, dimension arrows, title block
  for (const s of [1, -1]) {
    const w = wingSweeps[String(s)];
    safe(() => {
      glow(
        b.decal(w, T.roundel, {
          at: [s * 3.47, wingTop(3.47) + 0.06, zC(0.62)],
          dir: [0, 1, 0],
          up: [0, 0, 1],
          size: [1.0, 1.0],
          segments: 14,
          bone: body,
        }),
        0.7,
      );
      glow(
        b.decal(w, T.wingDim, {
          at: [s * 2.7, wingTop(2.7) + 0.06, 0.55],
          dir: [0, 1, 0],
          up: [0, 0, 1],
          size: [3.4, 0.26],
          segments: 26,
          bone: body,
        }),
        0.8,
      );
    });
  }
  safe(() => {
    glow(
      b.decal(wingSweeps["1"], T.title, {
        at: [3.2, wingBottom(3.2) - 0.05, -0.1],
        dir: [0, -1, 0],
        up: [0, 0, 1],
        size: [1.3, 0.53],
        segments: 14,
        bone: body,
      }),
      0.8,
    );
  });

  // pitot tube under the port wing
  b.rod([3.4, 1.4, 0.7], [3.4, 1.4, 1.5], 0.013, { color: LINE, bone: body, sides: 4 });
  put(new THREE.BoxGeometry(0.04, 0.1, 0.06), ICE, [3.4, 1.44, 0.72]);

  // ---------------------------------------------------------------- fuselage decals
  safe(() => {
    for (const s of [1, -1]) {
      glow(
        b.decal(fus, T.roundel, {
          at: [s * 0.2, cy(-2.45) + 0.16, -2.45],
          dir: [s, 0, 0],
          size: [0.5, 0.5],
          segments: 12,
          bone: body,
        }),
        0.7,
      );
      glow(
        b.decal(fus, T.fusDim, {
          at: [s * 0.2, cy(-2.5) - 0.3, -2.5],
          dir: [s, 0, 0],
          size: [3.3, 0.23],
          segments: 28,
          bone: body,
        }),
        0.8,
      );
      glow(
        b.decal(fus, T.name, {
          at: [s * 0.35, cy(0.3) - 0.38, 0.3],
          dir: [s, 0, 0],
          size: [1.5, 0.375],
          segments: 18,
          bone: body,
        }),
        0.9,
      );
    }
  });

  // ---------------------------------------------------------------- tail
  // fin and rudder
  b.extrude(FIN, {
    at: [0, 0.95, -2.7],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.015,
    smoothing: 1,
    bone: body,
    color: rim(TAIL_P, V(1, 0, 0)),
  });
  b.extrude(RUDDER, {
    at: [0, 0.95, -2.7],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.05,
    bevel: 0.012,
    smoothing: 1,
    bone: rudder,
    color: rim(TAIL_P, V(1, 0, 0)),
  });
  put(new THREE.BoxGeometry(0.03, 0.2, 0.12), LINE, [0, 1.75, -4.45], { bone: rudder });
  for (const s of [1, -1])
    glow(
      put(new THREE.PlaneGeometry(0.62, 0.21), "#ffffff", [s * 0.034, 1.78, -4.1], {
        bone: rudder,
        dir: [s, 0, 0],
        axis: "z",
        texture: T.code,
      }),
      0.9,
    );

  // tailplane and elevators
  b.extrude(STAB, {
    at: [0, 1.02, -3.6],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.07,
    bevel: 0.02,
    smoothing: 1,
    bone: body,
    color: rim(TAIL_P, V(0, 1, 0)),
  });
  [1, -1].forEach((s, i) => {
    b.extrude(ELEV, {
      at: [0, 1.02, -3.9],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.055,
      bevel: 0.015,
      smoothing: 1,
      bone: elevJ[i],
      color: rim(TAIL_P, V(0, 1, 0)),
    });
    // balance horn tab
    put(new THREE.BoxGeometry(0.34, 0.03, 0.14), LINE, [s * 1.35, 1.02, -4.0], { bone: elevJ[i] });
  });

  // tailwheel
  b.rod([0, 0.85, -3.95], [0, 0.2, -4.22], 0.04, { color: ICE, bone: body, sides: 6 });
  put(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), TIRE_P, [0, 0.118, -4.25], { dir: [1, 0, 0] });
  for (const s of [1, -1]) b.rod([s * 0.05, 0.2, -4.22], [s * 0.05, 0.12, -4.25], 0.015, { color: LINE, bone: body, sides: 4 });

  // aerial mast and wire to the fin
  b.rod([0, cy(-1.6) + 0.5, -1.6], [0, cy(-1.6) + 1.1, -1.66], 0.025, { color: ICE, bone: body, sides: 6 });
  put(new THREE.SphereGeometry(0.03, 6, 4), LINE, [0, cy(-1.6) + 1.12, -1.66]);
  b.rod([0, cy(-1.6) + 1.1, -1.66], [0, 2.38, -3.72], 0.007, { color: LINE, bone: body, sides: 4 });

  return b.root;
}
```