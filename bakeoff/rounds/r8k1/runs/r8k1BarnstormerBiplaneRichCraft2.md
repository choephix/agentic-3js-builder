I rebuilt all seven changes, and the full module is below; nothing has been run or rendered yet. Because they touch most of the file, I'm sending the whole module instead of patches.

1. **Upper wing and pilot visibility:**
   - The upper wing now sits at `zc` 1.1, and its outline has a rounded-shoulder cockpit notch (trailing edge at z≈0.95 for |x|<0.48).
   - The cabane struts, interplane struts, wires and roundels are placed from the wing's new thickness and position.
   - The pilot head and `pilotHead` joint are raised 0.12 m, and the neck is extended to meet it.
2. **Real cockpits:**
   - The fuselage is now five lofts. Full-height end caps form the cockpit walls, and the middle lofts are scooped lower to form the floor.
   - Side panels, a coaming ring that follows the opening's perimeter, a seat back, seat and gauges complete the rear cockpit.
   - The pilot's torso, shoulders and neck rise out of it, and both hands stay on the stick.
   - A smaller recessed opening holds the mail sack.
3. **Lighter wings:**
   - Thicknesses are now `[0.04,0.13]` (upper) and `[0.035,0.12]` (lower), with a bevelled leading edge and a tapered trailing edge.
   - The ailerons are cut out of the wing polygons with a 0.018 m hinge seam, and are separate teal and yellow surfaces.
   - Every strut and wire ends on a brass shoe seated on the wing surface.
4. **Propeller and engine:**
   - The prop assembly is rotated 25° about Z, and the blades are widened to 0.36 m with a gentle sweep and short yellow tips.
   - The nine cylinders now point radially in the XY plane, each with three cooling-fin bands and a head cap, and all sit behind the propeller plane.
5. **Airfield:**
   - The base is an oval with semi-axes 4.5 × 4.15 m and a 7.5 m runway.
   - Grass and flowers are roughly halved, and the runway stones, bunting and lantern are gone.
   - The drums, crate and windsock form one compact cluster at the back right.
6. **Finish:**
   - The cowl is split into a smooth copper body, a narrow polished lip ring, and a dark recessed interior.
   - The cowl and spinner use broad normal-based gradient paints with a highlight band instead of noise; the spinner is clean brass.
   - The cowl rivets and faceting are kept.
7. **Scarf:**
   - There is one main ribbon, 0.22 m wide, rolled 25–45° with a rise-and-fall wave that clears the turtle deck by well over 0.08 m.
   - A shorter second tail and a knotted neck wrap complete it.
   - Both tails taper to triangular points, and the cream/teal banding is broad.

```ts
import * as THREE from "three";
import { createBuilder, frame, rng, lerp, catmull, bezier, paint, mix, smoothstep, noise, mottle, svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { metal, coil, gaugeTexture } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Biscuit the Barnstormer",
  description:
    "A whimsical cherry-red barnstormer biplane with a smooth copper radial cowl, a flying-pig nose badge, a moustachioed goggled pilot in a real leather-rimmed cockpit with a streaming ribbon scarf, light fabric wings with teal and yellow ailerons, glowing wingtip lights, and a small grass airfield with windsock, drums and a mail crate.",
};

type V3 = [number, number, number];
type Fill = string | ReturnType<typeof paint>;

// ---------- palette
const RED = "#d9432f";
const CREAM = "#f6e8bf";
const CREAM_SH = "#e3cf9b";
const TAPE = "#e8d3a0";
const TEAL = "#25a39b";
const YELLOW = "#ffcf3f";
const ORANGE = "#ff8a2a";
const WOOD = "#8a5a2e";
const WOOD_LT = "#c28b4e";
const LEATHER = "#7a4a2a";
const LEATHER_DK = "#4d2f1c";
const SEATWALL = "#6b4328";
const DASH = "#2d1d16";
const FLOOR = "#2a1c18";
const COAMING = "#5b3820";
const DARK = "#2a2430";
const WIRE = "#3a3340";
const RUBBER = "#2b2830";
const HUB = "#efe4c8";
const IRON = "#4a4a58";
const GLASS = "#9fdde8";
const SKIN = "#f2b488";
const NOSE = "#ee8c78";
const GINGER = "#b8651f";
const PINK = "#f59ab0";
const BRASS = "#d9a43a";
const BLUED = "#5a6fb0";
const SACK = "#cdb27c";
const WHITE = "#fbf7ea";
const BELLY = "#f1d9a0";
const DRUM = "#c8372d";
const STEM = "#4c9332";

const D = Math.PI / 180;
const fract = (x: number) => x - Math.floor(x);
const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();

// ---------- smooth metals: broad lit gradient with one highlight band, no noise
const metalGrad = (lo: string, midc: string, hi: string, spec: string) =>
  paint((_p, n) => {
    const l = n.dot(KEY);
    let c = mix(lo, midc, smoothstep(-0.4, 0.35, l));
    c = mix(c, hi, smoothstep(0.35, 0.8, l));
    return mix(c, spec, smoothstep(0.86, 0.96, l) * 0.85);
  });
const COPPER_BODY = metalGrad("#8c3a18", "#c8622d", "#ec8c52", "#ffe0b8");
const BRASS_SMOOTH = metalGrad("#8a6420", "#c9962f", "#e8bd58", "#fff1c0");
const LIP_METAL = metalGrad("#c98a50", "#eba66a", "#ffd7a8", "#fff3e0");

// ---------- planforms (u across, v along the chord)
function planform(S: number, C: number, R: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let a = -90; a <= 90; a += 30) pts.push([S - R + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  for (let a = 90; a <= 270; a += 30) pts.push([-(S - R) + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  return pts;
}
function halfPlan(S: number, C: number, R: number, u0: number, s: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let a = -90; a <= 90; a += 30) pts.push([S - R + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  pts.push([u0, C / 2], [u0, -C / 2]);
  const m = pts.map(([u, v]) => [s * u, v] as [number, number]);
  return s < 0 ? m.reverse() : m;
}
function rectPlan(a: number, c: number, v0: number, v1: number, s: number): [number, number][] {
  const m: [number, number][] = [
    [s * a, v0],
    [s * c, v0],
    [s * c, v1],
    [s * a, v1],
  ];
  return s < 0 ? m.reverse() : m;
}
// main wing with aileron regions cut out of the trailing edge (and an optional rounded cockpit notch)
function wingOutline(S: number, C: number, R: number, AC: number, g: number, a0: number, a1: number, notch: boolean): [number, number][] {
  const v0 = -C / 2;
  const vy = v0 + AC + g;
  const pts: [number, number][] = [];
  pts.push([-(S - R), v0], [-a1, v0], [-a1, vy], [-a0, vy], [-a0, v0]);
  if (notch) {
    const uN = 0.48;
    const vN = -0.15;
    const r1 = 0.14;
    const r2 = 0.1;
    const arcTo = (cx: number, cy: number, r: number, from: number, to: number, n: number) => {
      for (let i = 0; i <= n; i++) {
        const a = (from + ((to - from) * i) / n) * D;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    };
    arcTo(-uN - r1, v0 + r1, r1, -90, 0, 3);
    arcTo(-uN + r2, vN - r2, r2, 180, 90, 3);
    arcTo(uN - r2, vN - r2, r2, 90, 0, 3);
    arcTo(uN + r1, v0 + r1, r1, 180, 270, 3);
  }
  pts.push([a0, v0], [a0, vy], [a1, vy], [a1, v0], [S - R, v0]);
  for (let a = -60; a <= 60; a += 30) pts.push([S - R + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  pts.push([S - R, C / 2], [-(S - R), C / 2]);
  for (let a = 120; a <= 240; a += 30) pts.push([-(S - R) + R * Math.cos(a * D), (C / 2) * Math.sin(a * D)]);
  return pts;
}

// ---------- paints
const wingPaint = (span: number, tip: string) =>
  cel(
    paint((p, n) => {
      if (Math.abs(n.y) < 0.5) return RED;
      const ax = Math.abs(p.x);
      if (ax > span - 0.8) return tip;
      if (ax > span - 0.95) return RED;
      const rib = Math.abs(fract(p.x / 0.46 + 0.5) - 0.5) * 0.46;
      if (rib < 0.012) return TAPE;
      return mix(n.y > 0 ? CREAM : CREAM_SH, "#d9c08a", 0.55 * smoothstep(0.5, 0.85, noise(p, 0.6, 3)));
    }),
  );
const ailPaint = (tip: string) =>
  cel(
    paint((p, n) => {
      if (Math.abs(n.y) < 0.5) return RED;
      const rib = Math.abs(fract(p.x / 0.4 + 0.5) - 0.5) * 0.4;
      if (rib < 0.01) return TAPE;
      return tip;
    }),
  );

const fusBase = (p: THREE.Vector3, n: THREE.Vector3): string => {
  if (p.z < -2.62) return TEAL;
  if (p.z < -2.5) return CREAM;
  if (n.y < -0.5) return BELLY;
  if (n.y < -0.36) return TEAL;
  if (n.y < -0.3) return CREAM;
  return RED;
};
const inCock = (z: number) => z > -1.075 && z < 0.365;
const FUSELAGE = cel(
  paint((p, n) => {
    if (inCock(p.z)) {
      if (Math.abs(n.z) > 0.9) return n.z > 0 ? SEATWALL : DASH;
      if (Math.abs(p.x) < 0.36 && Math.abs(n.x) > 0.8 && n.x * p.x < 0) return SEATWALL;
    }
    return fusBase(p, n);
  }),
);
const FUS_MID = cel(paint((p, n) => (n.y > 0.4 ? FLOOR : fusBase(p, n))));

// ---------- fuselage profile (smooth interpolation of key stations so lofts can be cut anywhere)
const KN: [number, number, number, number][] = [
  [1.35, 1.55, 1.0, 1.05],
  [0.5, 1.55, 0.95, 1.05],
  [-0.7, 1.5, 0.78, 0.95],
  [-1.9, 1.32, 0.52, 0.66],
  [-3.1, 1.08, 0.28, 0.4],
  [-3.75, 1.0, 0.12, 0.22],
];
function prof(z: number) {
  let i = 0;
  while (i < KN.length - 2 && z < KN[i + 1][0]) i++;
  const k0 = KN[i];
  const k1 = KN[i + 1];
  const dz = k1[0] - k0[0];
  const t = (z - k0[0]) / dz;
  const t2 = t * t;
  const t3 = t2 * t;
  const out = [0, 0, 0];
  for (let c = 1; c <= 3; c++) {
    const pm = KN[i - 1];
    const pn = KN[i + 2];
    const m0 = pm ? (k1[c] - pm[c]) / (k1[0] - pm[0]) : (k1[c] - k0[c]) / dz;
    const m1 = pn ? (pn[c] - k0[c]) / (pn[0] - k0[0]) : (k1[c] - k0[c]) / dz;
    out[c - 1] = (2 * t3 - 3 * t2 + 1) * k0[c] + (t3 - 2 * t2 + t) * dz * m0 + (-2 * t3 + 3 * t2) * k1[c] + (t3 - t2) * dz * m1;
  }
  return { y: out[0], w: out[1], h: out[2] };
}
const fullSeg = (zs: number[]) =>
  zs.map((z) => {
    const p = prof(z);
    return { at: [0, p.y, z] as V3, w: p.w, h: p.h };
  });
const lowSeg = (zs: number[], drop: number, inset: number) =>
  zs.map((z) => {
    const p = prof(z);
    const bottom = p.y - p.h / 2 + 0.02;
    const top = p.y + p.h / 2 - drop;
    return { at: [0, (bottom + top) / 2, z] as V3, w: p.w - inset, h: top - bottom };
  });

type WingDef = { id: string; S: number; C: number; yc: number; zc: number; th: [number, number]; tip: string; AC: number; notch: boolean };

export default function build() {
  const b = createBuilder({ name: "biplane", paintSize: 2048 });
  const GROUND = 0.12;
  const FY = 1.55;
  const TY = 1.0;

  // ---------- textures
  const ROUNDEL = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#22112f"/><circle cx="50" cy="50" r="44" fill="#f6e8bf"/><circle cx="50" cy="50" r="34" fill="#d9432f"/><circle cx="50" cy="50" r="22" fill="#25a39b"/><polygon points="50,30 55,43.1 69,43.8 58.1,52.6 61.8,66.2 50,58.5 38.2,66.2 41.9,52.6 31,43.8 45,43.1" fill="#ffd23c" stroke="#22112f" stroke-width="2.4" stroke-linejoin="round"/></svg>`,
    { size: 256 },
  );
  const PIG = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#22112f"/><circle cx="50" cy="50" r="44" fill="#ffd23c"/>
      <path d="M24 58 Q4 44 8 22 Q24 26 32 46Z" fill="#fff" stroke="#22112f" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M76 58 Q96 44 92 22 Q76 26 68 46Z" fill="#fff" stroke="#22112f" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M29 42 L25 20 L45 32Z" fill="#f59ab0" stroke="#22112f" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M71 42 L75 20 L55 32Z" fill="#f59ab0" stroke="#22112f" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="50" cy="57" rx="24" ry="22" fill="#f8a8bd" stroke="#22112f" stroke-width="3"/>
      <ellipse cx="50" cy="67" rx="13" ry="9.5" fill="#ffc7d4" stroke="#22112f" stroke-width="2.5"/>
      <ellipse cx="45" cy="67" rx="2.4" ry="3.4" fill="#22112f"/><ellipse cx="55" cy="67" rx="2.4" ry="3.4" fill="#22112f"/>
      <path d="M26 50 H74" stroke="#4d2f1c" stroke-width="4"/>
      <circle cx="39" cy="50" r="8.5" fill="#fff" stroke="#b5832e" stroke-width="3.5"/>
      <circle cx="61" cy="50" r="8.5" fill="#fff" stroke="#b5832e" stroke-width="3.5"/>
      <circle cx="40" cy="51" r="3.4" fill="#22112f"/><circle cx="60" cy="51" r="3.4" fill="#22112f"/>
      <path d="M28 44 Q50 22 72 44" stroke="#4d2f1c" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const NAMEPLATE = svg(
    `<svg viewBox="0 0 200 60"><rect x="3" y="3" width="194" height="54" rx="16" fill="#f6e8bf" stroke="#22112f" stroke-width="4"/><text x="100" y="42" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-style="italic" font-size="32" fill="#d9432f" stroke="#22112f" stroke-width="1">Biscuit</text><circle cx="20" cy="30" r="5" fill="#25a39b"/><circle cx="180" cy="30" r="5" fill="#25a39b"/></svg>`,
    { size: 512 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#bfeaf2"/><circle cx="32" cy="38" r="26" fill="#9fdde8"/><circle cx="32" cy="34" r="16" fill="#fff" stroke="#22112f" stroke-width="2.5"/><circle cx="35" cy="37" r="8" fill="#22112f"/><circle cx="38" cy="34" r="2.8" fill="#fff"/><path d="M12 22 Q18 10 32 8" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const GAS = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="12" width="60" height="40" rx="6" fill="#ffd23c" stroke="#22112f" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="26" fill="#c8372d" stroke="#22112f" stroke-width="0.8">GAS</text></svg>`,
    { size: 128 },
  );
  const MAIL = svg(
    `<svg viewBox="0 0 64 64"><rect x="4" y="12" width="56" height="40" rx="4" fill="#f6e8bf" stroke="#22112f" stroke-width="3"/><path d="M6 14 L32 36 L58 14" fill="none" stroke="#d9432f" stroke-width="3.5" stroke-linejoin="round"/><text x="32" y="50" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="12" fill="#25a39b">AIR MAIL</text></svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 48 Q10 28 3 6 Q16 24 19 48Z" fill="#5faa3c" stroke="#2f6b2a" stroke-width="1.2"/><path d="M14 48 Q15 24 16 2 Q23 26 23 48Z" fill="#7bc94e" stroke="#2f6b2a" stroke-width="1.2"/><path d="M16 48 Q22 30 30 12 Q27 34 25 48Z" fill="#4c9332" stroke="#2f6b2a" stroke-width="1.2"/></svg>`,
    { size: 128 },
  );
  const GAUGE = gaugeTexture({ needle: 55, label: "PSI", size: 128 });

  // ---------- skeleton
  const body = b.joint("fuselage", { at: [0, FY, 0], dir: [0, 0, 1], role: "spine" });
  type J = typeof body;
  const prop = b.joint("prop", { parent: body, at: [0, FY, 2.3], dir: [0, 0, 1] });
  const rudder = b.joint("rudder", { parent: body, at: [0, TY, -3.46], dir: [0, 1, 0], role: "hinge" });
  const pilotHead = b.joint("pilotHead", { parent: body, at: [0, 2.42, -0.68], dir: [0, 1, 0], role: "head" });
  const wheels: Record<string, J> = {};
  const elevators: Record<string, J> = {};
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    wheels[sd] = b.joint(`wheel${sd}`, { parent: body, at: [s * 0.9, 0.52, 0.75], dir: [s, 0, 0] });
    elevators[sd] = b.joint(`elevator${sd}`, { parent: body, at: [s * 0.65, TY, -3.42], dir: [s, 0, 0], role: "hinge" });
  }

  type PO = { bone?: J; dir?: V3; axis?: "x" | "y" | "z"; rotation?: V3; scale?: V3; texture?: THREE.Texture; flat?: boolean; name?: string };
  const P = (geo: THREE.BufferGeometry, color: Fill, at: V3, o: PO = {}) => b.part(geo, color, { bone: body, at, ...o });
  const ball = (r: number, color: Fill, at: V3, o: PO = {}) => P(new THREE.SphereGeometry(r, 8, 6), color, at, { flat: true, ...o });
  const shoe = (at: V3) => P(new THREE.BoxGeometry(0.11, 0.04, 0.14), BRASS, at, { flat: true });

  // ---------- fuselage: five lofts, cockpits are real openings between full-height walls
  const capsF = { start: "round", end: "flat" } as const;
  const segA = b.loft(fullSeg([1.35, 0.85, 0.35]), { color: FUSELAGE, bone: body, caps: capsF });
  const midF = b.loft(lowSeg([0.35, 0.12, -0.11], 0.17, 0.06), { color: FUS_MID, bone: body, caps: "none" });
  const segB = b.loft(fullSeg([-0.11, -0.225, -0.34]), { color: FUSELAGE, bone: body, caps: "flat" });
  const midR = b.loft(lowSeg([-0.34, -0.7, -1.06], 0.225, 0.05), { color: FUS_MID, bone: body, caps: "none" });
  const segR = b.loft(fullSeg([-1.06, -1.5, -1.9, -2.5, -3.1, -3.75]), { color: FUSELAGE, bone: body, caps: { start: "flat", end: "round" } });
  const hull = b.surface([segA, segB, segR]);
  const wells = b.surface([midF, midR]);
  const topAt = (x: number, z: number) => hull.ray([x, 4, z], [0, -1, 0])?.at.y ?? 2.0;
  const floorAt = (z: number) => wells.ray([0, 4, z], [0, -1, 0])?.at.y ?? 1.75;

  // cockpit builder: side panels + coaming ring following the opening's perimeter
  const cockpit = (zA: number, zB: number, hx: number) => {
    const rim = (topAt(hx, zA + 0.03) + topAt(hx, zB - 0.03)) / 2;
    for (const s of [1, -1])
      b.extrude(
        [
          [zB, rim - 0.46],
          [zA, rim - 0.46],
          [zA, rim],
          [zB, rim],
        ],
        { at: [s * (hx + 0.025), 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bevel: 0.005, color: FUSELAGE, bone: body },
      );
    const xs = [-hx, -hx / 2, 0, hx / 2, hx];
    const ins = 0.012;
    const yAt = (x: number, z: number) => (Math.abs(Math.abs(x) - hx) < 1e-6 ? rim : topAt(x, z)) + 0.012;
    const pts: V3[] = [];
    for (const x of xs) pts.push([x, yAt(x, zA + 0.03), zA - ins]);
    pts.push([hx, rim + 0.012, (zA + zB) / 2]);
    for (const x of xs.slice().reverse()) pts.push([x, yAt(x, zB - 0.03), zB + ins]);
    pts.push([-hx, rim + 0.012, (zA + zB) / 2]);
    b.sweep(catmull(pts, { closed: true }), 0.04, { color: cel(LEATHER), bone: body, sides: 6 });
    return rim;
  };
  cockpit(-0.34, -1.06, 0.29);
  cockpit(0.35, -0.11, 0.21);
  const floorR = floorAt(-0.7);
  const floorF = floorAt(0.12);

  // windscreen, headrest deck, mail sack
  b.extrude(
    [
      [-0.28, 0],
      [0.28, 0],
      [0.23, 0.2],
      [-0.23, 0.2],
    ],
    { at: [0, topAt(0, -0.25) - 0.02, -0.25], x: [1, 0, 0], y: [0, 0.92, -0.4], thickness: 0.022, bevel: 0.007, color: GLASS, bone: body },
  );
  P(new THREE.SphereGeometry(1, 10, 7), FUSELAGE, [0, topAt(0, -1.5) - 0.02, -1.5], { scale: [0.26, 0.2, 0.42] });
  P(new THREE.SphereGeometry(1, 9, 7), SACK, [0, floorF + 0.12, 0.12], { scale: [0.19, 0.2, 0.2], flat: true });
  P(new THREE.TorusGeometry(0.085, 0.024, 5, 9).rotateX(Math.PI / 2), RED, [0, floorF + 0.3, 0.12], { flat: true });
  for (const s of [1, -1]) P(new THREE.ConeGeometry(0.05, 0.13, 5), SACK, [s * 0.05, floorF + 0.36, 0.12], { rotation: [0, 0, -s * 22], flat: true });

  // rear cockpit furnishing: seat, seat back, gauges, rudder bar
  P(new THREE.BoxGeometry(0.44, 0.38, 0.08), cel("#8a5a34"), [0, floorR + 0.3, -0.99], { rotation: [-10, 0, 0], flat: true });
  P(new THREE.BoxGeometry(0.44, 0.07, 0.34), cel("#8a5a34"), [0, floorR + 0.05, -0.82], { flat: true });
  for (const s of [1, -1]) {
    P(new THREE.CircleGeometry(0.05, 14), "#ffffff", [s * 0.1, floorR + 0.13, -0.352], { dir: [0, 0, -1], axis: "z", texture: GAUGE });
    P(new THREE.TorusGeometry(0.052, 0.01, 4, 12), BRASS, [s * 0.1, floorR + 0.13, -0.352], { dir: [0, 0, -1], axis: "z" });
    P(new THREE.BoxGeometry(0.07, 0.03, 0.12), BRASS, [s * 0.17, floorR + 0.04, -0.5], { flat: true });
  }
  b.rod([-0.2, floorR + 0.05, -0.5], [0.2, floorR + 0.05, -0.5], 0.014, BRASS, { bone: body, sides: 5 });

  // nameplate decals on both flanks
  for (const s of [1, -1])
    b.decal(segR, NAMEPLATE, { at: [s * 0.33, 1.5, -1.3], dir: [s, 0, 0], size: [0.9, 0.27], bone: body, segments: 12 });

  // ---------- cowl: copper body, polished lip, dark engine interior
  const COWL_P = paint((p, n) => {
    const r = Math.hypot(p.x, p.y - FY);
    if (p.z > 1.6 && r < 0.42) return mix("#1a1012", "#3b2420", smoothstep(1.9, 2.1, p.z));
    return COPPER_BODY.at(p, n);
  });
  const cowl = b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.57, 0.2],
      [0.6, 0.55],
      [0.575, 0.84],
      [0.41, 0.84],
      [0.4, 0.7],
      [0, 0.7],
    ],
    { at: [0, FY, 1.2], axis: [0, 0, 1], segments: 14, color: COWL_P, bone: body },
  );
  P(new THREE.TorusGeometry(0.495, 0.045, 6, 22), LIP_METAL, [0, FY, 2.045]);
  P(new THREE.TorusGeometry(0.41, 0.018, 5, 22), LIP_METAL, [0, FY, 2.06]);
  // nine-cylinder radial: long axes radial in XY, cooling fins, heads, all behind the propeller plane
  P(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 12), IRON, [0, FY, 2.0], { dir: [0, 0, 1] });
  P(new THREE.ConeGeometry(0.11, 0.1, 8), BRASS, [0, FY, 2.1], { dir: [0, 0, 1], flat: true });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const dir: V3 = [dx, dy, 0];
    const at = (r: number): V3 => [dx * r, FY + dy * r, 2.0];
    P(new THREE.CylinderGeometry(0.048, 0.055, 0.27, 8), IRON, at(0.245), { dir, flat: true });
    for (const r of [0.2, 0.255, 0.31]) P(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 8), "#6a6d7c", at(r), { dir, flat: true });
    P(new THREE.SphereGeometry(0.062, 7, 5), "#8a8d9c", at(0.375), { dir, flat: true });
  }
  b.ring(frame([0, FY, 1.75], [0, 0, 1]), { count: 20, radius: 0.6 }, (it) => ball(0.02, BRASS, [it.at.x, it.at.y, it.at.z], { bone: body }));
  for (const s of [1, -1]) {
    b.decal(cowl, PIG, { at: [s * 0.6, FY, 1.75], dir: [s, 0, 0], size: [0.5, 0.5], bone: body, segments: 12 });
    b.sweep(bezier([s * 0.58, 1.5, 1.7], [s * 0.78, 1.38, 1.55], [s * 0.68, 1.2, 1.05]), [0.055, 0.04], { color: IRON, bone: body, sides: 6 });
    ball(0.05, ORANGE, [s * 0.68, 1.19, 1.0], { bone: body });
  }

  // ---------- propeller (rotated 25 deg about Z at the end)
  P(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 8), IRON, [0, FY, 2.12], { dir: [0, 0, 1], bone: prop });
  const upper: [number, number][] = [
    [0.075, 0.12],
    [0.11, 0.45],
    [0.2, 0.85],
    [0.22, 1.06],
    [0.13, 1.2],
    [-0.06, 1.19],
    [-0.14, 1.05],
    [-0.14, 0.85],
    [-0.09, 0.5],
    [-0.075, 0.12],
  ];
  const lower = upper.map(([x, y]) => [-x, -y] as [number, number]);
  b.extrude([...upper, ...lower], {
    at: [0, FY, 2.36],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.05,
    bevel: 0.012,
    color: cel(paint((_p, _n, s) => (Math.abs(s[1]) > 1.04 ? YELLOW : WOOD_LT))),
    bone: prop,
  });
  b.