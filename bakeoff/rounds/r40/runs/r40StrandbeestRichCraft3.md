```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  rng,
  aim,
  paint,
  mix,
  noise,
  smoothstep,
  svg,
  catmull,
  polyline,
} from "agentic-3js-builder";

export const meta = {
  name: "Strandbeest",
  description:
    "A Theo Jansen style wind-walking beach creature: twelve Jansen-linkage legs of yellow PVC tube on a zig-zag crankshaft, a ladder deck of pressure bottles, hoses and a gauge, and twin canvas sails on a yard with pennant, ribbons and anemometer.",
};

// ---------------------------------------------------------------------------------------------
// Jansen linkage (units: Jansen's "holy numbers"), solved in a 2D plane
type P2 = [number, number];
const LEN = { a: 38, l: 7.8, m: 15, b: 41.5, c: 39.3, d: 40.1, e: 55.8, f: 39.4, g: 36.7, h: 65.7, i: 49, j: 50, k: 61.9 };

function circ(a: P2, ra: number, b: P2, rb: number, side: number): P2 {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const d = Math.max(Math.hypot(dx, dy), 1e-6);
  const ux = dx / d;
  const uy = dy / d;
  const x = (d * d + ra * ra - rb * rb) / (2 * d);
  const h = Math.sqrt(Math.max(0, ra * ra - x * x));
  return [a[0] + ux * x - side * uy * h, a[1] + uy * x + side * ux * h];
}

function jansen(deg: number) {
  const t = (deg * Math.PI) / 180;
  const P: P2 = [0, 0];
  const O: P2 = [LEN.a, LEN.l];
  const M: P2 = [O[0] + LEN.m * Math.cos(t), O[1] + LEN.m * Math.sin(t)];
  const N2 = circ(P, LEN.b, M, LEN.j, 1);
  const N3 = circ(P, LEN.d, M, LEN.k, -1);
  const N4 = circ(N2, LEN.e, N3, LEN.c, -1);
  const N5 = circ(N4, LEN.g, N3, LEN.f, -1);
  const F = circ(N5, LEN.h, N3, LEN.i, -1);
  return { P, O, M, N2, N3, N4, N5, F };
}

// ---------------------------------------------------------------------------------------------
// Palette
const PIN = "#22222a";
const ORANGE = "#e8602c";
const CREAM = "#f3e8c8";
const TEAL = "#1f5f6b";
const CORAL = "#e2603a";
const HOSE = "#1b1b20";
const JUTE = "#8a6a3c";
const BRASS = "#c59b3f";
const DARKPLATE = "#30343e";

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------
// Paints
const PVC = paint((p, n) => {
  let c = mix("#e8b627", "#f8d550", noise(p, 0.35, 2));
  c = mix(c, "#a97b1c", 0.45 * smoothstep(0.62, 0.8, noise(p, 0.05, 7)));
  if (n.y > 0.4) c = mix(c, "#fbe88a", 0.25);
  if (n.y < -0.4) c = mix(c, "#8a6a28", 0.35);
  const sand = smoothstep(0.55, 0.0, p.y) * (0.35 + 0.65 * noise(p, 0.08, 4));
  return mix(c, "#d4b57c", sand * 0.7);
});

const STEEL = paint((p, n) => {
  let c = mix("#3f424d", "#8d92a0", noise(p, 0.2, 5));
  c = mix(c, "#8a4a22", 0.5 * smoothstep(0.66, 0.82, noise(p, 0.06, 9)));
  if (n.y > 0.5) c = mix(c, "#c0c5d0", 0.25);
  return c;
});

const BOOT = paint((p) => mix("#43302a", "#d4b57c", smoothstep(0.35, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.05, 3))));
const FOOT = paint((p, n) => mix(mix("#3a2723", "#5a3d34", noise(p, 0.04, 8)), "#d9bc84", smoothstep(0.1, -0.5, n.y) * 0.0 + smoothstep(0.07, 0.0, p.y) * 0.6));

const BOTTLE = paint((p, n, s) => {
  const h = s[0];
  let c = mix("#8fd0e6", "#b8e6f2", noise(p, 0.1, 1));
  if (h < 0.025) c = mix(c, "#5b9fb8", 0.7);
  if (h > 0.085 && h < 0.185) {
    c = "#f6efdc" as any;
    if (h > 0.125 && h < 0.15) c = "#d6492a" as any;
    if (h > 0.16 && h < 0.17) c = "#1f5f6b" as any;
  }
  if (n.y > 0.7) return mix("#bfe8f4", "#ffffff", 0.3);
  return c;
});

const CANVAS = paint((p, n, s) => {
  const u = s[0];
  const v = s[1];
  let c = mix("#f0e5c9", "#e1d1aa", noise(p, 0.14, 3));
  const su = (((u + 0.95) % 0.38) + 0.38) % 0.38;
  if (v > -0.065) c = mix(c, "#cdb283", 0.9);
  if (Math.abs(u) > 0.9 || v < -0.4) c = mix(c, "#d9c293", 0.55);
  if (su < 0.005) c = mix(c, "#8f7a52", 0.85);
  else if (su > 0.012 && su < 0.019 && Math.floor(v / 0.022) % 2 === 0) c = mix(c, "#b09a6c", 0.9);
  if (Math.abs(v + 0.24) < 0.004) c = mix(c, "#8f7a52", 0.75);
  c = mix(c, "#bfa579", smoothstep(-0.18, -0.5, v) * 0.45 * noise(p, 0.07, 6));
  return mix(c, "#9a8a6a", Math.abs(n.y) > 0.99 ? 0 : 0.0);
});

// ---------------------------------------------------------------------------------------------
// Textures
function emblemSvg() {
  const n = jansen(35);
  const X = (x: number) => 100 + (x - 12) * 1.25;
  const Y = (y: number) => 58 - y * 0.92;
  const pt = (q: P2) => `${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)}`;
  const links: [P2, P2][] = [
    [n.P, n.N2], [n.M, n.N2], [n.P, n.N3], [n.M, n.N3], [n.N2, n.N4],
    [n.N3, n.N4], [n.N4, n.N5], [n.N3, n.N5], [n.N5, n.F], [n.N3, n.F],
  ];
  const lines = links
    .map(([a, b]) => `<line x1="${X(a[0]).toFixed(1)}" y1="${Y(a[1]).toFixed(1)}" x2="${X(b[0]).toFixed(1)}" y2="${Y(b[1]).toFixed(1)}" stroke="#1f5f6b" stroke-width="5" stroke-linecap="round"/>`)
    .join("");
  const nodes = [n.N2, n.N3, n.N4, n.N5, n.M]
    .map((q) => `<circle cx="${X(q[0]).toFixed(1)}" cy="${Y(q[1]).toFixed(1)}" r="6.5" fill="#fff4d8" stroke="#1f5f6b" stroke-width="3"/>`)
    .join("");
  let dots = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    dots += `<circle cx="${(100 + Math.cos(a) * 77).toFixed(1)}" cy="${(100 + Math.sin(a) * 77).toFixed(1)}" r="2.6" fill="#1f5f6b"/>`;
  }
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="93" fill="none" stroke="#1f5f6b" stroke-width="6"/>
    <circle cx="100" cy="100" r="85" fill="none" stroke="#e2603a" stroke-width="2.4"/>
    ${dots}
    <circle cx="${X(n.O[0]).toFixed(1)}" cy="${Y(n.O[1]).toFixed(1)}" r="${(LEN.m * 1.25).toFixed(1)}" fill="none" stroke="#e2603a" stroke-width="2.5" stroke-dasharray="5 4"/>
    ${lines}${nodes}
    <circle cx="${X(n.P[0]).toFixed(1)}" cy="${Y(n.P[1]).toFixed(1)}" r="7" fill="#e2603a" stroke="#1f5f6b" stroke-width="3"/>
    <circle cx="${X(n.O[0]).toFixed(1)}" cy="${Y(n.O[1]).toFixed(1)}" r="6" fill="#e2603a" stroke="#1f5f6b" stroke-width="3"/>
    <circle cx="${X(n.F[0]).toFixed(1)}" cy="${Y(n.F[1]).toFixed(1)}" r="9" fill="#e2603a" stroke="#1f5f6b" stroke-width="3.5"/>
    <path d="M38 162 q15 -13 30 0 t30 0 t30 0 t30 0" fill="none" stroke="#e2603a" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M52 174 q12 -10 24 0 t24 0 t24 0" fill="none" stroke="#1f5f6b" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`;
}
const EMBLEM = svg(emblemSvg(), { size: 512 });

const PATCH = svg(
  `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="92" height="72" rx="4" fill="#c9a77a" stroke="#6b5334" stroke-width="3.5" stroke-dasharray="7 5"/>
    <rect x="14" y="14" width="72" height="52" fill="#b98f5f" opacity="0.55"/>
    <path d="M14 14 L86 66 M86 14 L14 66" stroke="#6b5334" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="6 5"/>
  </svg>`,
  { size: 256 },
);

const TAG = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="194" height="94" rx="12" fill="#30343e" stroke="#f3e8c8" stroke-width="4"/>
    <rect x="12" y="12" width="176" height="76" rx="7" fill="none" stroke="#e2603a" stroke-width="2"/>
    <circle cx="20" cy="20" r="4" fill="#9aa0ad"/><circle cx="180" cy="20" r="4" fill="#9aa0ad"/>
    <circle cx="20" cy="80" r="4" fill="#9aa0ad"/><circle cx="180" cy="80" r="4" fill="#9aa0ad"/>
    <text x="100" y="47" text-anchor="middle" font-family="serif" font-weight="bold" font-size="22" fill="#f3e8c8">STRANDBEEST</text>
    <text x="100" y="72" text-anchor="middle" font-family="serif" font-weight="bold" font-size="15" fill="#f2b84a">VENTUS  No. 07</text>
  </svg>`,
  { size: 512 },
);

const PENNANT = svg(
  `<svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="f"><path d="M2 118 L58 118 L58 10 L30 34 L2 10 Z"/></clipPath></defs>
    <g clip-path="url(#f)">
      <rect x="0" y="0" width="60" height="120" fill="#e2603a"/>
      <rect x="0" y="40" width="60" height="26" fill="#f3e8c8"/>
      <rect x="0" y="96" width="60" height="26" fill="#1f5f6b"/>
      <circle cx="30" cy="53" r="9" fill="#1f5f6b"/>
      <circle cx="30" cy="53" r="4.5" fill="#f3e8c8"/>
    </g>
    <path d="M2 118 L58 118 L58 10 L30 34 L2 10 Z" fill="none" stroke="#2a1a14" stroke-width="3.5" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const ribbonSvg = (c1: string, c2: string) =>
  svg(
    `<svg viewBox="0 0 24 120" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="r"><path d="M1 119 L23 119 L23 8 L12 26 L1 8 Z"/></clipPath></defs>
      <g clip-path="url(#r)"><rect width="24" height="120" fill="${c1}"/>
      <rect y="38" width="24" height="12" fill="${c2}"/><rect y="74" width="24" height="12" fill="${c2}"/></g>
      <path d="M1 119 L23 119 L23 8 L12 26 L1 8 Z" fill="none" stroke="#2a1a14" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
    { size: 192 },
  );
const RIBBONS = [ribbonSvg("#e2603a", "#f3e8c8"), ribbonSvg("#1f5f6b", "#f2b84a"), ribbonSvg("#f3e8c8", "#e2603a")];

const gaugeSvg = () => {
  const pt = (r: number, deg: number) => `${(50 + r * Math.sin((deg * Math.PI) / 180)).toFixed(2)} ${(50 - r * Math.cos((deg * Math.PI) / 180)).toFixed(2)}`;
  let ticks = "";
  for (let i = 0; i <= 12; i++) {
    const a = -135 + (i * 270) / 12;
    ticks += `<path d="M${pt(43, a)} L${pt(i % 2 ? 37 : 33, a)}" stroke="#2a1d10" stroke-width="${i % 2 ? 2 : 3.2}"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#f1e6c6"/>
    <path d="M${pt(40, 70)} A40 40 0 0 1 ${pt(40, 135)}" stroke="#c0281e" stroke-width="7" fill="none"/>
    ${ticks}
    <text x="50" y="72" text-anchor="middle" font-family="serif" font-weight="bold" font-size="11" fill="#2a1d10">BAR</text>
    <path d="M${pt(3, -20)} L${pt(37, 28)} L${pt(3, 160)}Z" fill="#1b140c"/>
    <circle cx="50" cy="50" r="5" fill="#1b140c"/>
  </svg>`;
};
const GAUGE = svg(gaugeSvg(), { size: 256 });

// ---------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "strandbeest" });
  const R = rng(11);

  // ---- layout constants
  const S = 0.0105; // meters per linkage unit
  const FOOT_R = 0.04;
  const PZ = LEN.a * S; // pivot beams sit PZ either side of the crankshaft
  const XC = [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75]; // leg slot centres (along the crankshaft)
  const XB = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]; // frame posts between slots
  const TH = XC.map((_, u) => u * 60 + 20); // crank angle per slot
  const legTheta = (u: number, front: boolean) => (front ? TH[u] : 180 - TH[u]);

  let minYd = 0;
  for (let u = 0; u < 6; u++)
    for (const f of [true, false]) minYd = Math.min(minYd, jansen(legTheta(u, f)).F[1]);
  const Hp0 = FOOT_R - minYd * S - 0.005; // pivot beam height
  const yt = Hp0 + 0.5; // deck height
  const Oy = Hp0 + LEN.l * S; // crankshaft height
  const yardY = yt + 1.1;
  const manY = yt + 0.48;

  // ---- skeleton
  const body = b.joint("body", { at: [0, Hp0, 0], role: "spine" });
  const crank = b.joint("crank", { parent: body, at: [0, Oy, 0], dir: [1, 0, 0], role: "hinge" });
  const hips: Record<string, ReturnType<typeof b.joint>> = {};
  for (let u = 0; u < 6; u++)
    for (const f of [true, false]) {
      const x = XC[u];
      const side = x > 0 ? "L" : "R";
      const k = Math.abs(x) > 0.5 ? 3 : Math.abs(x) > 0.3 ? 2 : 1;
      const name = `hip${side}${k}${f ? "F" : "B"}`;
      hips[`${u}${f}`] = b.joint(name, { parent: body, at: [x, Hp0, (f ? 1 : -1) * PZ], dir: [0, -1, 0], role: "leg" });
    }
  const yard = b.joint("yard", { parent: body, at: [0, yardY, 0], dir: [1, 0, 0], role: "hinge" });
  const sailF = b.joint("sailF", { parent: yard, at: [0, yardY, 0.05], dir: [1, 0, 0], role: "wing" });
  const sailB = b.joint("sailB", { parent: yard, at: [0, yardY, -0.05], dir: [1, 0, 0], role: "wing" });
  const anemo = b.joint("anemometer", { parent: body, at: [-0.6, yardY + 0.2, 0], dir: [0, 1, 0], role: "hinge" });

  // ---- little black/orange ties merged per bone
  const ties: Record<string, { bone: any; color: string; geos: THREE.BufferGeometry[] }> = {};
  const tie = (bone: any, color: string, at: THREE.Vector3, dir: number[], Rr = 0.024, r = 0.0045) => {
    const g = new THREE.TorusGeometry(Rr, r, 4, 8);
    g.applyQuaternion(aim(dir, undefined, "z"));
    g.translate(at.x, at.y, at.z);
    const key = bone.name + color;
    (ties[key] ??= { bone, color, geos: [] }).geos.push(g);
  };

  const tube = (a: THREE.Vector3, c: THREE.Vector3, r = 0.016, color: any = PVC, bone: any = body, sides = 8) =>
    b.rod(a, c, r, color, { bone, sides });

  // ---- legs
  for (let u = 0; u < 6; u++) {
    for (const front of [true, false]) {
      const sgn = front ? 1 : -1;
      const joint = hips[`${u}${front}`];
      const n = jansen(legTheta(u, front));
      const xBase = XC[u] + (front ? 0.075 : -0.075);
      const lay: Record<string, number> = { P: 0, M: 0, N2: 0.03, N3: -0.03, N4: 0, N5: 0.03, F: 0 };
      const W = (key: keyof typeof n) => {
        const q = n[key] as P2;
        return v3(xBase + lay[key as string], Hp0 + q[1] * S, sgn * (PZ - q[0] * S));
      };
      const pts = { P: W("P"), M: W("M"), N2: W("N2"), N3: W("N3"), N4: W("N4"), N5: W("N5"), F: W("F") };
      const link = (a: keyof typeof pts, c: keyof typeof pts) => tube(pts[a], pts[c], 0.0125, PVC, joint, 8);
      link("P", "N2"); link("M", "N2"); link("P", "N3"); link("M", "N3");
      link("N2", "N4"); link("N3", "N4"); link("N4", "N5"); link("N3", "N5");
      link("N5", "F"); link("N3", "F");
      for (const key of ["P", "N2", "N3", "N4", "N5", "M"] as const)
        b.part(new THREE.CylinderGeometry(0.0155, 0.0155, key === "M" ? 0.07 : 0.082, 8), PIN, {
          bone: joint, at: pts[key], dir: [1, 0, 0], flat: true,
        });
      // rubber boot and foot ball
      for (const nb of [pts.N5, pts.N3]) {
        const d = nb.clone().sub(pts.F).normalize();
        b.rod(pts.F, pts.F.clone().addScaledVector(d, 0.15), [0.022, 0.0165], BOOT, { bone: joint, sides: 8 });
      }
      b.part(new THREE.SphereGeometry(FOOT_R, 8, 6), FOOT, { bone: joint, at: pts.F, flat: true });
      // zip tie on the elbow
      tie(joint, PIN, pts.N4, [1, 0, 0], 0.022, 0.004);
    }
  }

  // ---- crankshaft (zig-zag)
  const cpts: THREE.Vector3[] = [v3(-0.99, Oy, 0)];
  for (let u = 0; u < 6; u++) {
    const t = (TH[u] * Math.PI) / 180;
    const My = Hp0 + (LEN.l + LEN.m * Math.sin(t)) * S;
    const Mz = -LEN.m * Math.cos(t) * S;
    const x = XC[u];
    cpts.push(v3(x - 0.125, Oy, 0), v3(x - 0.125, My, Mz), v3(x + 0.125, My, Mz), v3(x + 0.125, Oy, 0));
  }
  cpts.push(v3(0.99, Oy, 0));
  b.sweep(polyline(cpts), 0.017, { bone: crank, color: STEEL, sides: 8 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 8, 6), ORANGE, { bone: crank, at: [s * 1.0, Oy, 0], flat: true });
    b.rod(v3(s * 0.99, Oy, 0), v3(s * 1.03, Oy + 0.0, 0.0), 0.02, ORANGE, { bone: crank, sides: 6 });
  }

  // ---- frame
  for (const sgn of [1, -1]) {
    const z = sgn * PZ;
    tube(v3(-0.97, Hp0, z), v3(0.97, Hp0, z), 0.02, STEEL); // pivot beam
    tube(v3(-0.97, yt, z), v3(0.97, yt, z), 0.017); // top rail
    for (const xb of XB) {
      tube(v3(xb, Hp0, z), v3(xb, yt, z), 0.016);
      tie(body, PIN, v3(xb, yt, z), [1, 0, 0]);
      tie(body, PIN, v3(xb, Hp0, z), [1, 0, 0]);
    }
    // deck stringers under the bottles
    tube(v3(-0.97, yt, sgn * 0.15), v3(0.97, yt, sgn * 0.15), 0.014);
  }
  for (const xb of XB) {
    tube(v3(xb, yt, -PZ), v3(xb, yt, PZ), 0.016); // deck cross tie
    tube(v3(xb, Oy, 0), v3(xb, yt, 0), 0.013); // king post holding the crankshaft
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.07, 8), PIN, { bone: body, at: [xb, Oy, 0], dir: [1, 0, 0], flat: true });
    tie(body, ORANGE, v3(xb, yt, 0), [0, 0, 1], 0.022, 0.004);
  }
  for (const sx of [1, -1]) {
    const x = sx * 0.9;
    const apex = v3(x, yt + 0.26, 0);
    tube(v3(x, Hp0, -PZ), v3(x, Hp0, PZ), 0.016);
    for (const sz of [1, -1]) {
      tube(apex, v3(x, yt, sz * PZ), 0.014);
      tube(apex, v3(x, Hp0, sz * PZ), 0.012);
    }
    b.part(new THREE.SphereGeometry(0.024, 8, 6), ORANGE, { bone: body, at: apex, flat: true });
  }
  tube(v3(-0.9, yt + 0.26, 0), v3(0.9, yt + 0.26, 0), 0.014); // ridge

  // ---- masts, stays, yard, guys
  const mastTop = yardY + 0.04;
  for (const xm of [0.6, -0.6]) {
    tube(v3(xm, yt, 0), v3(xm, mastTop, 0), 0.017);
    for (const sz of [1, -1]) tube(v3(xm, yt + 0.6, 0), v3(xm, yt, sz * PZ), 0.011, PVC, body, 6);
    tie(body, PIN, v3(xm, yt + 0.6, 0), [0, 1, 0], 0.024, 0.0045);
    tie(body, ORANGE, v3(xm, yardY - 0.02, 0), [0, 1, 0], 0.026, 0.0045);
  }
  b.rod(v3(-1.03, yardY, 0), v3(1.03, yardY, 0), 0.02, PVC, { bone: yard, sides: 8 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), ORANGE, { bone: yard, at: [s * 1.05, yardY, 0], flat: true });
    for (const sz of [1, -1])
      b.rod(v3(s * 1.02, yardY, 0), v3(s * 0.9, yt, sz * PZ), 0.0045, JUTE, { bone: body, sides: 5 });
  }
  for (let i = 0; i < 11; i++) tie(yard, ORANGE, v3(-0.95 + i * 0.19, yardY, 0), [1, 0, 0], 0.03, 0.005);

  // ---- bottles, hoses, manifold, gauge
  const yb = yt + 0.016;
  const profile: [number, number][] = [
    [0, 0], [0.07, 0], [0.078, 0.03], [0.078, 0.17], [0.068, 0.22], [0.04, 0.265], [0.03, 0.275], [0.03, 0.3], [0, 0.3],
  ];
  for (let u = 0; u < 6; u++)
    for (const zs of [1, -1]) {
      const x = XC[u];
      const z = zs * 0.15;
      b.lathe(profile, { at: [x, yb, z], segments: 10, color: BOTTLE, bone: body, name: `bottle${u}${zs > 0 ? "f" : "b"}` });
      b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.03, 8), (u + (zs > 0 ? 1 : 0)) % 2 ? ORANGE : CREAM, {
        bone: body, at: [x, yb + 0.315, z], flat: true,
      });
      b.sweep(catmull([v3(x, yb + 0.33, z), v3(x, yb + 0.42, z * 0.45), v3(x, manY, 0)]), 0.0065, {
        bone: body, color: HOSE, sides: 6,
      });
      tie(body, PIN, v3(x, yb + 0.02, z), [0, 1, 0], 0.08, 0.005);
    }
  b.rod(v3(-0.96, manY, 0), v3(0.96, manY, 0), 0.013, STEEL, { bone: body, sides: 8 });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.02, 8, 6), PIN, { bone: body, at: [s * 0.96, manY, 0], flat: true });
  b.rod(v3(0, manY, 0), v3(0, manY, 0.05), 0.011, STEEL, { bone: body, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.063, 0.063, 0.03, 16), BRASS, { bone: body, at: [0, manY, 0.06], dir: [0, 0, 1], flat: true });
  b.part(new THREE.CircleGeometry(0.053, 20), "#ffffff", {
    bone: body, at: [0, manY, 0.0765], dir: [0, 0, 1], axis: "z", texture: GAUGE,
  });

  // ---- name plate hung from the front rail
  const tagC = v3(0.15, yt - 0.11, PZ + 0.013);
  b.part(new THREE.BoxGeometry(0.22, 0.115, 0.01), DARKPLATE, { bone: body, at: tagC.clone().add(v3(0, 0, -0.004)) });
  b.part(new THREE.PlaneGeometry(0.21, 0.105), "#ffffff", {
    bone: body, at: tagC.clone().add(v3(0, 0, 0.0015)), dir: [0, 0, 1], axis: "z", texture: TAG,
  });
  for (const s of [1, -1]) b.rod(v3(0.15 + s * 0.085, yt, PZ), v3(0.15 + s * 0.085, yt - 0.055, PZ + 0.013), 0.003, JUTE, { bone: body, sides: 4 });

  // ---- sails
  const buildSail = (front: boolean) => {
    const sgn = front ? 1 : -1;
    const joint = front ? sailF : sailB;
    const k = 0.29;
    const yv = v3(0, 1, -sgn * k).normalize();
    const X = v3(1, 0, 0);
    const nrm = X.clone().cross(yv).normalize();
    const at = v3(0, yardY - 0.02, sgn * 0.05);
    const sp = (u: number, v: number, w = 0) => at.clone().addScaledVector(X, u).addScaledVector(yv, v).addScaledVector(nrm, w);

    const outline: ([number, number] | [number, number, "sharp"])[] = [
      [-0.95, 0, "sharp"], [0.95, 0, "sharp"], [0.93, -0.2], [0.85, -0.42, "sharp"],
    ];
    for (let i = 0; i <= 20; i++) {
      const uu = 0.82 - (1.64 * i) / 20;
      const vv = -0.5 + 0.07 * Math.abs(Math.sin((i / 20) * Math.PI * 4));
      outline.push(i % 5 === 0 ? [uu, vv, "sharp"] : [uu, vv]);
    }
    outline.push([-0.85, -0.42, "sharp"], [-0.93, -0.2]);

    b.extrude(outline as any, {
      at, x: [1, 0, 0], y: yv.toArray() as any, thickness: 0.008, color: CANVAS, bone: joint, name: front ? "sailFront" : "sailBack",
    });
    const wOut = sgn;
    const place = (tex: THREE.Texture, w: number, h: number, u: number, v: number, roll = 0) => {
      for (const face of [1, -1]) {
        const dir = nrm.clone().multiplyScalar(wOut * face);
        const up = yv.clone().addScaledVector(X, Math.tan((roll * Math.PI) / 180) * (face === 1 ? 1 : -1));
        b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
          bone: joint, at: sp(u, v, wOut * face * 0.0065), dir: dir.toArray() as any, axis: "z", up: up.toArray() as any, texture: tex(tex),
        });
      }
    };
    const tex = (t: THREE.Texture) => t;
    place(EMBLEM, 0.42, 0.42, 0, -0.25);
    place(PATCH, 0.2, 0.16, -0.64, -0.2, 6);
    place(PATCH, 0.17, 0.14, 0.64, -0.31, -8);
    // battens
    for (const u of [-0.8, -0.45, 0.45, 0.8]) b.rod(sp(u, -0.07, wOut * 0.012), sp(u, -0.43, wOut * 0.012), 0.007, PVC, { bone: joint, sides: 6 });
    b.rod(sp(-0.93, -0.075, wOut * 0.012), sp(0.93, -0.075, wOut * 0.012), 0.008, PVC, { bone: joint, sides: 6 });
    // hem bobbles
    const bobs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) {
      const q = sp(0.82 - i * 0.41, -0.5, 0);
      bobs.push(new THREE.SphereGeometry(0.02, 6, 4).translate(q.x, q.y, q.z));
    }
    b.part(mergeGeometries(bobs)!, ORANGE, { bone: joint, at: [0, 0, 0], flat: true });
  };
  buildSail(true);
  buildSail(false);

  // ---- pennant and ribbons
  b.cards([frame(v3(0.6, mastTop + 0.01, 0), [1, 0, 0])], PENNANT, {
    size: [0.2, 0.44], lean: 8, bend: 25, flow: [0, 0, -1], bone: body,
  });
  const ribFrames: any[] = [];
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) ribFrames.push(frame(v3(s * (1.0 + i * 0.03), yardY - 0.02, (i - 1) * 0.025), [0, 1, 0]));
  b.cards(ribFrames, RIBBONS, { size: [0.05, 0.34], lean: 180, flow: [0, 0, 1], vary: 0.25, rng: R, bone: yard, bend: -15 });

  // ---- anemometer on the right mast
  b.rod(v3(-0.6, mastTop, 0), v3(-0.6, yardY + 0.2, 0), 0.007, STEEL, { bone: anemo, sides: 6 });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), ORANGE, { bone: anemo, at: [-0.6, yardY + 0.2, 0], flat: true });
  for (let i = 0; i < 3; i++) {
    const a = ((i * 120 + 20) * Math.PI) / 180;
    const end = v3(-0.6 + Math.cos(a) * 0.11, yardY + 0.2, Math.sin(a) * 0.11);
    b.rod(v3(-0.6, yardY + 0.2, 0), end, 0.004, STEEL, { bone: anemo, sides: 5 });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), i % 2 ? CREAM : CORAL, { bone: anemo, at: end, scale: [1, 0.85, 0.65], flat: true });
  }

  // ---- flush merged ties
  for (const key of Object.keys(ties)) {
    const t = ties[key];
    const merged = mergeGeometries(t.geos);
    if (merged) b.part(merged, t.color, { bone: t.bone, at: [0, 0, 0], flat: true });
  }

  return b.root;
}
```