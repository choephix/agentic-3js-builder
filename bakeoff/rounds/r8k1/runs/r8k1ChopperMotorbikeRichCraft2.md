1. **Tank and V-twin mass:** the tank cross-section is now `[tankR·1.18, tankR·0.9]` (x widened 18%, length and tapered rear unchanged). The decal is re-projected onto the wider surface at a slightly larger size, so `TANK_TEX` re-fits. Cylinder fins go from `0.078` to `0.09`, and the rocker boxes from `0.17` to `0.20` with the cover plate widened to match. The engine height is unchanged and I checked the clearance under the tank.
2. **Front assembly:** handlebars are `0.019`, mirror stalks `0.013`, and the fork legs `[0.042, 0.033]`. Collars are `0.052` and the spring gaps are still open. The headlight brow is thicker and beveled, with a taller leading edge. The mirror glass, fork axle caps and wheel hub caps no longer glow, so the lamp is the one prominent cyan feature.
3. **Kickstand:** the hinge stays at `[0.15, 0.33, 0.1]`. The rod now runs to `[0.30, 0.094, -0.06]`, ending inside a square foot block centred at `y = 0.088` whose underside sits at `0.082` on the plinth.
4. **Belt:** it is now a closed polyline with a box section (26 mm across x, 6 mm thick) on the `x = 0.22` plane. The path is built from the `gearSize().outer` of the two sprockets plus half the belt thickness: external tangent runs plus wrapped arcs on each pulley, with no hull. A short outer lathe flange ring sits on each pulley to show the seating. The cradle-rail ends are nudged inward and the sissy bar moves outboard so daylight shows between the belt and the frame.
5. **Exhausts:** each pipe is cut 60 mm short and finished with an open lathe sleeve along the endpoint tangent (`0.052/0.039` lower, `0.055/0.042` upper). The sleeve interior is painted dark and a black disk is recessed 18 mm inside. The plate backing and face share one rearward normal and orientation, with the face offset 1.5 mm outward.
6. **Stage:** the bollards, holo pillar, toolbox, wrench, hazard deck and glowing edge are gone. A plain beveled two-slab plinth (about 0.85 × 3.0 m, top at `y = 0.08`) replaces them. `P` and the wheel heights are unchanged.
7. **Materials:** the cyan rings are removed from `TIRE`, leaving dark rubber with broad tread alternation. A thin non-emissive cyan ring sits on the front rim. `CHROME` is a cool-gray banded paint with a bright top highlight band.
8. **Branding:** `AIR` is a vent ring with a plain recessed centre. `COVER` is an orange perimeter, navy centre and four large bolts. The tank flames are two broad tongues with one thin cyan stroke each.

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { catmull, createBuilder, gradient, mix, offset, paint, polyline, smoothstep, svg } from "agentic-3js-builder";
import type { DirectionInput, Fill, Joint, PointInput } from "agentic-3js-builder";
import { coil, gaugeTexture, gearGeometry, gearSize, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Overwatch Chopper",
  description:
    "A stylised hero-tech chopper in an Overwatch look: raked springer fork with orange springs, flame-and-emblem tank, heavy V-twin with a glowing cyan energy core, flat belt drive, open drag pipes, shown on a simple beveled plinth.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants

const P = 0.08; // stage height
const RF = 0.34; // front tyre radius
const RR = 0.38; // rear tyre radius
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const AXLE_F = V(0, RF + P, 1.12);
const AXLE_R = V(0, RR + P, -0.95);
const HEAD = V(0, 1.0, 0.5);
const FORK = AXLE_F.clone().sub(HEAD).normalize();
const FORK_LEN = AXLE_F.distanceTo(HEAD);
/** A point down the fork axis, `t` metres from the steering head, with optional sideways offset. */
const u = (t: number, x = 0) => offset(HEAD, FORK, t).add(V(x, 0, 0));

const ORANGE = "#f99e1a";
const NAVY = "#1f2b44";
const WHITE = "#f2f6ff";
const CYAN = "#35d4ff";
const BLACK = "#15171f";
const RUBBER = "#1a1b21";
const RED = "#ff4a2a";

// ---------------------------------------------------------------------------------------------------------------
// SVG helpers

const hexPts = (cx: number, cy: number, r: number, rot = -90) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((rot + 60 * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

const bolt = (cx: number, cy: number, r: number, fill: string) => {
  const pts = [
    [0.12, -0.62],
    [-0.34, 0.1],
    [-0.04, 0.1],
    [-0.14, 0.62],
    [0.34, -0.14],
    [0.04, -0.14],
  ];
  return `<polygon points="${pts.map(([x, y]) => `${(cx + x * r).toFixed(2)},${(cy + y * r).toFixed(2)}`).join(" ")}" fill="${fill}"/>`;
};

const emblem = (cx: number, cy: number, r: number, bg: string, fg: string, ring: string) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}" stroke="${ring}" stroke-width="${(r * 0.12).toFixed(2)}"/>` +
  `<polygon points="${hexPts(cx, cy, r * 0.7)}" fill="none" stroke="${fg}" stroke-width="${(r * 0.1).toFixed(2)}" stroke-linejoin="round"/>` +
  bolt(cx, cy, r * 0.52, fg);

const flame = (x0: number, y0: number, len: number, w: number, curl: number) =>
  `M${x0} ${y0 - w} C${x0 + len * 0.45} ${y0 - w} ${x0 + len * 0.7} ${y0 - w * 0.4 + curl * 0.3} ${x0 + len} ${y0 + curl} ` +
  `C${x0 + len * 0.72} ${y0 + w * 0.2} ${x0 + len * 0.5} ${y0 + w} ${x0} ${y0 + w}Z`;

const TONGUES: [number, number, number, number, number][] = [
  [56, 28, 132, 17, -8],
  [52, 63, 122, 16, 8],
];

const prof = (ks: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (ks.length - 1);
  const i = Math.min(Math.floor(x), ks.length - 2);
  return ks[i] + (ks[i + 1] - ks[i]) * (x - i);
};

const arcBand = (rIn: number, rOut: number, a0: number, a1: number, n: number): [number, number][] => {
  const o: [number, number][] = [];
  const i: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180;
    o.push([rOut * Math.sin(a), rOut * Math.cos(a)]);
    i.push([rIn * Math.sin(a), rIn * Math.cos(a)]);
  }
  return o.concat(i.reverse());
};

/** Octagonal plinth outline as [z, x] with centre offset in z. */
const plinth = (hl: number, hw: number, c: number, cz: number): [number, number][] => [
  [cz - hl, -hw + c],
  [cz - hl + c, -hw],
  [cz + hl - c, -hw],
  [cz + hl, -hw + c],
  [cz + hl, hw - c],
  [cz + hl - c, hw],
  [cz - hl + c, hw],
  [cz - hl, hw - c],
];

type PartOpts = {
  dir?: DirectionInput;
  axis?: "x" | "y" | "z";
  up?: DirectionInput;
  scale?: number | [number, number, number];
  texture?: THREE.Texture;
};

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "chopper" });

  // Skeleton ---------------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 0.7, 0] });
  const steer = b.joint("steer", { parent: chassis, at: HEAD, dir: FORK });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXLE_F, dir: [1, 0, 0] });
  const wheelR = b.joint("wheelR", { parent: chassis, at: AXLE_R, dir: [1, 0, 0] });
  const KICK_HINGE = V(0.15, 0.33, 0.1);
  const KICK_TIP = V(0.3, 0.094, -0.06);
  const kick = b.joint("kickstand", { parent: chassis, at: KICK_HINGE, aim: KICK_TIP, role: "hinge" });

  // Helpers ----------------------------------------------------------------------------------------------------
  const R = (bone: Joint, a: PointInput, c: PointInput, r: number | [number, number], color: Fill, sides = 10) =>
    b.rod(a, c, r, color, { bone, sides });
  const G = (geo: THREE.BufferGeometry, color: Fill, bone: Joint, at: PointInput, o: PartOpts = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // Paints -----------------------------------------------------------------------------------------------------
  const hemi = (hi: string, md: string, lo: string) =>
    paint((_p, n) => (n.y > 0.1 ? mix(md, hi, smoothstep(0.1, 0.95, n.y)) : mix(md, lo, smoothstep(0.1, -0.8, n.y))));
  const ORANGE_P = hemi("#ffc457", ORANGE, "#c9561b");
  const WH = hemi("#ffffff", "#e9eef8", "#a9b6d4");
  const NV = hemi("#4a5f92", "#2a3857", "#141b30");
  const GUN = hemi("#59627a", "#363c4d", "#1a1d28");
  const FIN = hemi("#6b7ca8", "#3a4668", "#1c2238");
  const STAGE = hemi("#3d486b", "#262e4b", "#141a2d");
  const STAGE_TOP = hemi("#4a5678", "#2f3959", "#192038");
  const LEATHER = hemi("#454a63", "#2a2e42", "#12141f");
  const STRIPED = paint((p) => (Math.abs(p.x) < 0.02 ? WH : Math.abs(p.x) < 0.03 ? NV : ORANGE_P));
  const BLUED = metal("blued", { tarnish: 0 });
  // Clean stylised metal: broad cool-gray value bands with a bright upper highlight.
  const CHROME = paint((_p, n) => {
    const y = n.y;
    if (y > 0.82) return "#f4f8ff";
    if (y > 0.45) return "#c9d3e6";
    if (y > -0.1) return "#8f9cb6";
    if (y > -0.6) return "#5e6a86";
    return "#363e58";
  });
  const TIRE = paint((_p, _n, s) => {
    const edge = Math.min(s[1], 1 - s[1]);
    if (edge < 0.2) return Math.floor(s[0] * 44) % 2 === 0 ? "#23242c" : "#17181f";
    return "#121319";
  });

  // Textures ---------------------------------------------------------------------------------------------------
  const TANK_TEX = svg(
    `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x, y, l, w, c)}" fill="${NAVY}" stroke="${NAVY}" stroke-width="7" stroke-linejoin="round"/>`).join("")}
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x, y, l, w, c)}" fill="#ffd25a"/>`).join("")}
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x + 8, y, l * 0.68, w * 0.52, c * 0.6)}" fill="#fff7dc"/>`).join("")}
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x + 16, y, l * 0.36, w * 0.2, c * 0.3)}" fill="${CYAN}"/>`).join("")}
      ${emblem(30, 45, 25, NAVY, ORANGE, WHITE)}
    </svg>`,
    { size: 512 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#c4f5ff"/><stop offset="1" stop-color="#35d4ff"/></radialGradient></defs>
      <circle cx="50" cy="50" r="49" fill="url(#g)"/>
      <polygon points="${hexPts(50, 50, 32)}" fill="none" stroke="#35d4ff" stroke-width="3"/>
      <polygon points="${hexPts(50, 50, 18)}" fill="none" stroke="#7fe3ff" stroke-width="2.5"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const a = ((-90 + 60 * i) * Math.PI) / 180;
        return `<line x1="50" y1="50" x2="${50 + 32 * Math.cos(a)}" y2="${50 + 32 * Math.sin(a)}" stroke="#35d4ff" stroke-width="2"/>`;
      }).join("")}
    </svg>`,
    { size: 256 },
  );
  const CORE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#06202e"/>
      <polygon points="${hexPts(50, 50, 40)}" fill="none" stroke="${CYAN}" stroke-width="3.5"/>
      <polygon points="${hexPts(50, 50, 27)}" fill="#0a3550" stroke="#9cecff" stroke-width="2.5"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const a = ((-90 + 60 * i) * Math.PI) / 180;
        return `<line x1="50" y1="50" x2="${50 + 40 * Math.cos(a)}" y2="${50 + 40 * Math.sin(a)}" stroke="${CYAN}" stroke-width="2"/>`;
      }).join("")}
      <circle cx="50" cy="50" r="14" fill="${CYAN}"/><circle cx="50" cy="50" r="8" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const MAG = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#232b44"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#8f9cb6" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="38" fill="#171d33"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const a = (60 * i * Math.PI) / 180;
        return `<line x1="50" y1="50" x2="${50 + 36 * Math.cos(a)}" y2="${50 + 36 * Math.sin(a)}" stroke="${ORANGE}" stroke-width="12" stroke-linecap="round"/>`;
      }).join("")}
      <circle cx="50" cy="50" r="40" fill="none" stroke="${ORANGE}" stroke-width="5"/>
      <circle cx="50" cy="50" r="13" fill="#1f2b44" stroke="#f2f6ff" stroke-width="3"/>
      <polygon points="${hexPts(50, 50, 8)}" fill="${CYAN}"/>
    </svg>`,
    { size: 256 },
  );
  const COVER = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="${ORANGE}"/>
      <circle cx="50" cy="50" r="33" fill="${NAVY}" stroke="#ffd98a" stroke-width="2"/>
      ${[45, 135, 225, 315]
        .map((d) => {
          const a = (d * Math.PI) / 180;
          return `<circle cx="${50 + 41 * Math.cos(a)}" cy="${50 + 41 * Math.sin(a)}" r="5" fill="#dfe6f2" stroke="${NAVY}" stroke-width="2"/>`;
        })
        .join("")}
    </svg>`,
    { size: 256 },
  );
  const AIR = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#d6deed"/>
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (22.5 * i * Math.PI) / 180;
        return `<line x1="${50 + 36 * Math.cos(a)}" y1="${50 + 36 * Math.sin(a)}" x2="${50 + 46 * Math.cos(a)}" y2="${50 + 46 * Math.sin(a)}" stroke="${NAVY}" stroke-width="4" stroke-linecap="round"/>`;
      }).join("")}
      <circle cx="50" cy="50" r="30" fill="#8793ad" stroke="${NAVY}" stroke-width="3"/>
      <circle cx="50" cy="50" r="17" fill="#5d6985"/>
    </svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="117" height="57" rx="8" fill="${WHITE}" stroke="${NAVY}" stroke-width="3"/>
      <rect x="8" y="7" width="104" height="9" fill="${ORANGE}"/>
      <text x="60" y="48" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="29" fill="${NAVY}">HX-76</text>
    </svg>`,
    { size: 256 },
  );
  const GAUGE = gaugeTexture({ needle: 55, label: "kW" });

  // ---------------------------------------------------------------------------------------------------------
  // Plinth: simple beveled two-slab base, top at y = P
  b.extrude(plinth(1.5, 0.425, 0.1, 0.03), {
    at: [0, 0.03, 0],
    x: [0, 0, 1],
    y: [1, 0, 0],
    thickness: 0.06,
    bevel: 0.012,
    color: STAGE,
    bone: chassis,
  });
  b.extrude(plinth(1.46, 0.395, 0.09, 0.03), {
    at: [0, 0.07, 0],
    x: [0, 0, 1],
    y: [1, 0, 0],
    thickness: 0.02,
    bevel: 0.006,
    color: STAGE_TOP,
    bone: chassis,
  });

  // ---------------------------------------------------------------------------------------------------------
  // Frame
  const backbone = catmull([
    [0, 1.01, 0.48],
    [0, 0.9, 0.22],
    [0, 0.76, -0.1],
    [0, 0.64, -0.46],
  ]);
  b.sweep(backbone, 0.038, { color: GUN, bone: chassis, sides: 8 });
  for (const s of [1, -1]) {
    // lower cradle rails run straight back to the axle
    b.sweep(
      catmull([
        [s * 0.02, 0.945, 0.558],
        [s * 0.1, 0.5, 0.32],
        [s * 0.12, 0.34, 0.12],
        [s * 0.12, 0.33, -0.15],
        [s * 0.14, 0.38, -0.5],
        [s * 0.17, 0.46, -0.95],
      ]),
      0.028,
      { color: GUN, bone: chassis, sides: 8 },
    );
    // upper stays
    b.sweep(
      catmull([
        [0, 0.64, -0.46],
        [s * 0.09, 0.58, -0.7],
        [s * 0.17, 0.5, -0.9],
        [s * 0.17, 0.46, -0.95],
      ]),
      0.022,
      { color: GUN, bone: chassis, sides: 8 },
    );
    // dropout plates
    G(box(0.02, 0.08, 0.1), ORANGE_P, chassis, V(s * 0.19, 0.46, -0.95));
  }
  // head tube + clamps
  R(steer, u(-0.13), u(0.11), 0.05, NV, 10);
  R(steer, u(-0.025), u(0.025), 0.058, ORANGE, 10);
  G(box(0.32, 0.05, 0.075), CHROME, steer, u(-0.2), { dir: FORK });
  G(box(0.26, 0.045, 0.07), NV, steer, u(0.12), { dir: FORK });

  // skid plate
  G(box(0.2, 0.03, 0.52), NV, chassis, V(0, 0.325, 0.04));

  // ---------------------------------------------------------------------------------------------------------
  // Engine
  G(box(0.22, 0.2, 0.38), GUN, chassis, V(0, 0.43, 0.04));
  G(box(0.17, 0.16, 0.14), GUN, chassis, V(0, 0.4, -0.22));
  const fa = (32 * Math.PI) / 180;
  const dirF = V(0, Math.cos(fa), Math.sin(fa));
  const dirR = V(0, Math.cos(fa), -Math.sin(fa));
  const cylAssy = (base: THREE.Vector3, dir: THREE.Vector3) => {
    R(chassis, offset(base, dir, 0), offset(base, dir, 0.22), 0.062, GUN, 10);
    for (let i = 0; i < 7; i++) R(chassis, offset(base, dir, 0.03 + i * 0.027), offset(base, dir, 0.045 + i * 0.027), 0.09, FIN, 10);
    G(box(0.2, 0.09, 0.15), GUN, chassis, offset(base, dir, 0.25), { dir });
    G(box(0.175, 0.035, 0.12), ORANGE_P, chassis, offset(base, dir, 0.3), { dir });
  };
  cylAssy(V(0, 0.52, 0.14), dirF);
  cylAssy(V(0, 0.52, -0.04), dirR);

  // primary cover (left) with simplified cover badge
  R(chassis, V(0.11, 0.42, 0.07), V(0.15, 0.42, 0.07), 0.105, ORANGE_P, 14);
  G(new THREE.CircleGeometry(0.085, 18), "#ffffff", chassis, V(0.1505, 0.42, 0.07), { dir: [1, 0, 0], axis: "z", texture: COVER });
  G(new THREE.TorusGeometry(0.098, 0.008, 6, 18), CHROME, chassis, V(0.151, 0.42, 0.07), { dir: [1, 0, 0], axis: "z" });
  // energy core (right)
  R(chassis, V(-0.11, 0.42, 0.07), V(-0.15, 0.42, 0.07), 0.105, NV, 14);
  G(new THREE.TorusGeometry(0.088, 0.011, 6, 18), CHROME, chassis, V(-0.151, 0.42, 0.07), { dir: [-1, 0, 0], axis: "z" });
  glow(
    G(new THREE.CircleGeometry(0.075, 6), "#ffffff", chassis, V(-0.1515, 0.42, 0.07), { dir: [-1, 0, 0], axis: "z", texture: CORE }),
    1.5,
  );
  // air cleaner (left)
  R(chassis, V(0, 0.68, 0.06), V(0.1, 0.68, 0.06), 0.035, CHROME, 8);
  R(chassis, V(0.1, 0.68, 0.06), V(0.17, 0.68, 0.06), 0.125, ORANGE_P, 14);
  R(chassis, V(0.17, 0.68, 0.06), V(0.18, 0.68, 0.06), 0.13, CHROME, 14);
  G(new THREE.CircleGeometry(0.115, 16), "#ffffff", chassis, V(0.1805, 0.68, 0.06), { dir: [1, 0, 0], axis: "z", texture: AIR });

  // output shaft + sprocket
  const SPR_BIG = { teeth: 34, module: 0.01, holes: 6, bore: 0.02 };
  const SPR_SMALL = { teeth: 14, module: 0.01, bore: 0.012 };
  const BX = 0.22;
  const SMALL_C = V(BX, 0.4, -0.2);
  R(chassis, V(0.09, 0.4, -0.2), V(0.24, 0.4, -0.2), 0.02, CHROME, 8);
  b.part(gearGeometry(SPR_SMALL), CHROME, { bone: chassis, at: SMALL_C, dir: [1, 0, 0] });

  // ---------------------------------------------------------------------------------------------------------
  // Exhaust: pipe body shortened, then an open annular sleeve with a recessed dark disk
  const pipe1 = catmull([
    [-0.07, 0.72, 0.31],
    [-0.17, 0.68, 0.34],
    [-0.25, 0.52, 0.3],
    [-0.27, 0.36, 0.18],
    [-0.27, 0.31, -0.2],
    [-0.27, 0.31, -0.7],
    [-0.27, 0.32, -1.12],
  ]);
  const pipe2 = catmull([
    [-0.07, 0.7, -0.13],
    [-0.17, 0.66, -0.14],
    [-0.26, 0.55, -0.17],
    [-0.3, 0.45, -0.3],
    [-0.3, 0.44, -0.7],
    [-0.3, 0.45, -1.2],
  ]);
  const SLEEVE = 0.06;
  const exhaust = (
    pipe: ReturnType<typeof catmull>,
    radii: number[],
    rOut: number,
    rIn: number,
    body: Fill,
  ) => {
    const tEnd = 1 - SLEEVE / pipe.length;
    b.sweep(pipe.slice(0, tEnd), radii, { color: body, bone: chassis, sides: 12, caps: "flat" });
    const start = pipe.at(tEnd);
    const end = pipe.at(1);
    const tan = pipe.tangentAt(1).clone().normalize();
    const mid = (rOut + rIn) / 2;
    const sleevePaint = paint((p) => {
      const q = p.clone().sub(start);
      const along = q.dot(tan);
      const r = q.sub(tan.clone().multiplyScalar(along)).length();
      return r < mid ? "#2a3045" : CHROME;
    });
    b.lathe(
      [
        [rIn, -0.004],
        [rOut, -0.004],
        [rOut, SLEEVE],
        [rIn, SLEEVE],
      ],
      { at: start, axis: tan, segments: 12, color: sleevePaint, bone: chassis },
    );
    G(new THREE.CircleGeometry(rIn + 0.001, 12), BLACK, chassis, end.clone().addScaledVector(tan, -0.018), {
      dir: tan,
      axis: "z",
    });
    b.along(
      pipe,
      3,
      (at) => b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.018, 10), BLACK, { frame: at, bone: chassis }),
      { from: 0.5, to: 0.85 },
    );
  };
  exhaust(
    pipe1,
    [0.026, 0.028, 0.03, 0.032, 0.036, 0.044, 0.05],
    0.052,
    0.039,
    gradient(BLUED, CHROME, V(-0.1, 0.7, 0.3), V(-0.27, 0.34, 0.15)),
  );
  exhaust(
    pipe2,
    [0.026, 0.028, 0.03, 0.034, 0.042, 0.053],
    0.055,
    0.042,
    gradient(BLUED, CHROME, V(-0.1, 0.68, -0.13), V(-0.28, 0.5, -0.2)),
  );

  // ---------------------------------------------------------------------------------------------------------
  // Tank: 18% wider across x
  const tankR = prof([0.06, 0.12, 0.15, 0.155, 0.14, 0.1, 0.05]);
  const tank = b.sweep(
    catmull([
      [0, 0.92, 0.42],
      [0, 0.94, 0.25],
      [0, 0.92, 0.05],
      [0, 0.88, -0.2],
    ]),
    (t: number): [number, number] => [tankR(t) * 1.18, tankR(t) * 0.9],
    { color: STRIPED, bone: chassis, sides: 12 },
  );
  for (const s of [1, -1])
    b.decal(tank, TANK_TEX, { at: tank.at(0.42, s * 90), dir: [s, 0, 0], size: [0.42, 0.19], mirror: s < 0 });
  const tankSkin = b.surface(tank);
  for (const z of [0.3, -0.04])
    b.sweep(tankSkin.loop([0, 0.93, z], { dir: [0, 0, 1], lift: 0.004 }), 0.006, { color: CHROME, sides: 6 });
  const capHit = tankSkin.nearest([0, 1.4, 0.2]);
  b.stick(new THREE.CylinderGeometry(0.04, 0.045, 0.03, 8), CHROME, capHit, { embed: 0.35 });
  b.stick(box(0.06, 0.012, 0.014), ORANGE, capHit.moved([0, 0.026, 0]), { embed: 0 });
  G(box(0.06, 0.05, 0.08), GUN, chassis, V(0, 0.8, 0.0));

  // ---------------------------------------------------------------------------------------------------------
  // Seat + sissy bar
  b.sweep(
    catmull([
      [0, 0.81, -0.2],
      [0, 0.775, -0.38],
      [0, 0.8, -0.6],
    ]),
    (t: number): [number, number] => [0.07 + 0.08 * Math.sin(Math.PI * t), 0.05],
    {
      color: LEATHER,
      bone: chassis,
      sides: 10,
      sectors: [
        [75, 105, ORANGE],
        [255, 285, ORANGE],
      ],
    },
  );
  G(box(0.1, 0.03, 0.2), GUN, chassis, V(0, 0.73, -0.38));
  // sissy bar mounted outboard of the belt flange, at the axle ends
  b.sweep(
    catmull([
      [0.26, 0.5, -0.96],
      [0.26, 0.9, -1.02],
      [0.2, 1.15, -1.05],
      [0.1, 1.29, -1.05],
      [-0.1, 1.29, -1.05],
      [-0.2, 1.15, -1.05],
      [-0.26, 0.9, -1.02],
      [-0.26, 0.5, -0.96],
    ]),
    0.013,
    { color: CHROME, bone: chassis, sides: 8 },
  );
  for (const s of [1, -1]) {
    R(chassis, V(s * 0.26, 0.5, -0.96), V(s * 0.225, 0.47, -0.95), 0.014, CHROME, 6);
    R(chassis, V(s * 0.17, 0.89, -1.0), V(s * 0.26, 0.89, -1.02), 0.01, CHROME, 6);
  }
  G(box(0.22, 0.1, 0.05), LEATHER, chassis, V(0, 1.14, -1.08));
  G(box(0.22, 0.012, 0.052), ORANGE, chassis, V(0, 1.195, -1.08));

  // ---------------------------------------------------------------------------------------------------------
  // Fenders
  b.extrude(arcBand(0.42, 0.448, 62, -104, 14), {
    at: AXLE_R,
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.34,
    bevel: 0.01,
    color: STRIPED,
    bone: chassis,
  });
  {
    const riv: THREE.BufferGeometry[] = [];
    for (const sx of [1, -1])
      for (let a = 55; a >= -95; a -= 15) {
        const r = (a * Math.PI) / 180;
        riv.push(new THREE.SphereGeometry(0.008, 6, 4).translate(sx * 0.15, AXLE_R.y + 0.452 * Math.cos(r), AXLE_R.z + 0.452 * Math.sin(r)));
      }
    b.part(mergeGeometries(riv)!, CHROME, { bone: chassis, at: [0, 0, 0] });
  }
  for (const s of [1, -1]) R(chassis, V(s * 0.05, 0.66, -0.5), V(s * 0.14, 0.745, -0.63), 0.012, CHROME, 6);
  // tail light
  R(chassis, V(0, 0.55, -1.395), V(0, 0.55, -1.415), 0.05, CHROME, 6);
  glow(R(chassis, V(0, 0.55, -1.415), V(0, 0.55, -1.44), 0.036, RED, 6), 1.6);
  // plate: backing and face share one rearward normal; the face sits 1.5 mm proud
  {
    const N = V(0, 0.15, -1).normalize();
    const C = V(0, 0.42, -1.4);
    G(box(0.17, 0.09, 0.008), NV, chassis, C, { dir: N, axis: "z" });
    G(new THREE.PlaneGeometry(0.16, 0.08), "#ffffff", chassis, offset(C, N, 0.004 + 0.0015), {
      dir: N,
      axis: "z",
      texture: PLATE,
    });
  }

  // front fender
  b.extrude(arcBand(0.375, 0.4, 70, -35, 10), {
    at: AXLE_F,
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.13,
    bevel: 0.008,
    color: STRIPED,
    bone: steer,
  });
  for (const s of [1, -1]) R(steer, u(0.62, s * 0.095), V(s * 0.065, AXLE_F.y + 0.384, AXLE_F.z - 0.068), 0.01, CHROME, 6);

  // ---------------------------------------------------------------------------------------------------------
  // Fork
  for (const s of [1, -1]) {
    const x = s * 0.095;
    R(steer, u(-0.2, x), u(0.32, x), 0.02, CHROME, 8);
    b.sweep(coil(u(-0.16, x), u(0.3, x), 0.036, 9), 0.0068, { color: ORANGE, bone: steer, sides: 5 });
    R(steer, u(0.3, x), u(FORK_LEN, x), [0.042, 0.033], NV, 10);
    R(steer, u(0.28, x), u(0.33, x), 0.052, ORANGE, 10);
    R(wheelF, V(s * 0.095, AXLE_F.y, AXLE_F.z), V(s * 0.128, AXLE_F.y, AXLE_F.z), 0.03, CHROME, 6);
    G(new THREE.CircleGeometry(0.018, 6), "#7fb9cc", wheelF, V(s * 0.1285, AXLE_F.y, AXLE_F.z), { dir: [s, 0, 0], axis: "z" });
  }
  // front brake caliper
  G(box(0.03, 0.07, 0.06), ORANGE_P, steer, V(-0.07, AXLE_F.y + 0.115, AXLE_F.z - 0.06));

  // ---------------------------------------------------------------------------------------------------------
  // Headlight with armoured brow
  const LAMP = V(0, 1.06, 0.63);
  R(steer, V(0, LAMP.y, LAMP.z - 0.07), V(0, LAMP.y, LAMP.z + 0.03), 0.09, NV, 12);
  R(steer, V(0, LAMP.y, LAMP.z + 0.03), V(0, LAMP.y, LAMP.z + 0.06), 0.097, ORANGE, 12);
  glow(
    G(new THREE.CircleGeometry(0.08, 12), "#ffffff", steer, V(0, LAMP.y, LAMP.z + 0.0612), { dir: [0, 0, 1], axis: "z", texture: LENS }),
    1.3,
  );
  b.extrude(
    [
      [-0.105, 0],
      [0.105, 0],
      [0.092, 0.03],
      [0.048, 0.055],
      [-0.048, 0.055],
      [-0.092, 0.03],
    ],
    { at: [0, LAMP.y + 0.07, LAMP.z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.16, bevel: 0.016, color: ORANGE_P, bone: steer },
  );
  for (const s of [1, -1]) R(steer, V(s * 0.095, LAMP.y, 0.436), V(s * 0.08, LAMP.y, LAMP.z - 0.03), 0.016, CHROME, 6);

  // ---------------------------------------------------------------------------------------------------------
  // Handlebars
  const GP = V(0, 1.215, 0.335);
  const GD = V(0, 0.55, -0.83).normalize();
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0, 1.17, 0.34],
        [s * 0.12, 1.2, 0.35],
        [s * 0.25, 1.27, 0.36],
        [s * 0.3, 1.36, 0.3],
        [s * 0.3, 1.38, 0.2],
        [s * 0.3, 1.37, 0.08],
      ]),
      0.019,
      { color: CHROME, bone: steer, sides: 8 },
    );
    R(steer, u(-0.2, s * 0.05), V(s * 0.05, 1.17, 0.34), 0.024, CHROME, 8);
    R(steer, V(s * 0.3, 1.378, 0.2), V(s * 0.3, 1.37, 0.05), 0.028, RUBBER, 8);
    R(steer, V(s * 0.3, 1.37, 0.05), V(s * 0.3, 1.368, 0.03), 0.03, ORANGE, 8);
    b.spike([s * 0.29, 1.36, 0.22], [s * 0.25, 1.33, 0.0], null, 0.012, { color: CHROME, bone: steer });
    // mirror
    R(steer, V(s * 0.3, 1.36, 0.3), V(s * 0.38, 1.49, 0.27), 0.013, CHROME, 6);
    const md = V(s * -0.08, 0.35, -1).normalize();
    R(steer, V(s * 0.38, 1.49, 0.27), offset(V(s * 0.38, 1.49, 0.27), md, 0.03), 0.052, NV, 6);
    G(new THREE.CircleGeometry(0.043, 6), "#8fe8ff", steer, offset(V(s * 0.38, 1.49, 0.27), md, 0.0305), { dir: md, axis: "z" });
  }
  // gauge pod
  R(steer, u(-0.2), GP, 0.022, CHROME, 8);
  R(steer, GP, offset(GP, GD, 0.035), 0.055, NV, 12);
  G(new THREE.CircleGeometry(0.047, 20), "#ffffff", steer, offset(GP, GD, 0.0356), { dir: GD, axis: "z", texture: GAUGE });
  G(new THREE.TorusGeometry(0.052, 0.006, 6, 16), CHROME, steer, offset(GP, GD, 0.035), { dir: GD, axis: "z" });

  // ---------------------------------------------------------------------------------------------------------
  // Front wheel
  G(new THREE.TorusGeometry(0.29, 0.05, 8, 28), TIRE, wheelF, AXLE_F, { dir: [1, 0, 0], axis: "z" });
  G(new THREE.TorusGeometry(0.235, 0.018, 6, 24), CHROME, wheelF, AXLE_F, { dir: [1, 0, 0], axis: "z", scale: [1, 1, 1.6] });
  for (const s of [1, -1])
    G(new THREE.TorusGeometry(0.243, 0.0035, 4, 28), CYAN, wheelF, V(s * 0.026, AXLE_F.y, AXLE_F.z), { dir: [1, 0, 0], axis: "z" });
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const cy = Math.cos(a);
    const sz = Math.sin(a);
    const sx = i % 2 ? 0.012 : -0.012;
    R(wheelF, V(sx, AXLE_F.y + 0.045 * cy, AXLE_F.z + 0.045 * sz), V(-sx, AXLE_F.y + 0.232 * cy, AXLE_F.z + 0.232 * sz), 0.0075, ORANGE, 6);
  }
  R(wheelF, V(-0.07, AXLE_F.y, AXLE_F.z), V(0.07, AXLE_F.y, AXLE_F.z), 0.045, CHROME, 10);
  R(wheelF, V(-0.055, AXLE_F.y, AXLE_F.z), V(-0.062, AXLE_F.y, AXLE_F.z), 0.14, CHROME, 18);

  // ---------------------------------------------------------------------------------------------------------
  // Rear wheel
  G(new THREE.TorusGeometry(0.28, 0.1, 10, 32), TIRE, wheelR, AXLE_R, { dir: [1, 0, 0], axis: "z", scale: [1, 1, 1.55] });
  R(wheelR, V(-0.13, AXLE_R.y, AXLE_R.z), V(0.13, AXLE_R.y, AXLE_R.z), 0.23, GUN, 14);
  for (const s of [1, -1])
    G(new THREE.CircleGeometry(0.205, 24), "#ffffff", wheelR, V(s * 0.131, AXLE_R.y, AXLE_R.z), { dir: [s, 0, 0], axis: "z", texture: MAG });
  R(wheelR, V(-0.13, AXLE_R.y, AXLE_R.z), V(-0.23, AXLE_R.y, AXLE_R.z), 0.045, CHROME, 10);
  R(wheelR, V(0.13, AXLE_R.y, AXLE_R.z), V(0.26, AXLE_R.y, AXLE_R.z), 0.045, CHROME, 10);
  R(wheelR, V(0.13, AXLE_R.y, AXLE_R.z), V(0.21, AXLE_R.y, AXLE_R.z), 0.09, NV, 12);
  G(new THREE.CircleGeometry(0.036, 6), "#7fb9cc", wheelR, V(0.2612, AXLE_R.y, AXLE_R.z), { dir: [1, 0, 0], axis: "z" });
  G(new THREE.CircleGeometry(0.036, 6), "#7fb9cc", wheelR, V(-0.2312, AXLE_R.y, AXLE_R.z), { dir: [-1, 0, 0], axis: "z" });
  // sprocket
  b.part(gearGeometry(SPR_BIG), CHROME, { bone: wheelR, at: V(BX, AXLE_R.y, AXLE_R.z), dir: [1, 0, 0] });
  // rear brake disc + caliper
  R(wheelR, V(-0.19, AXLE_R.y, AXLE_R.z), V(-0.198, AXLE_R.y, AXLE_R.z), 0.13, CHROME, 18);
  G(box(0.04, 0.07, 0.1), ORANGE_P, chassis, V(-0.19, AXLE_R.y + 0.115, AXLE_R.z - 0.07));

  // belt drive: flat band on the actual sprocket tip radii, tangent runs + wrapped arcs
  {
    const BELT_T = 0.003;
    const rBig = gearSize(SPR_BIG).outer + BELT_T;
    const rSmall = gearSize(SPR_SMALL).outer + BELT_T;
    const c1 = [AXLE_R.z, AXLE_R.y];
    const c2 = [SMALL_C.z, SMALL_C.y];
    const dz = c2[0] - c1[0];
    const dy = c2[1] - c1[1];
    const L = Math.hypot(dz, dy);
    const phi = Math.atan2(dy, dz);
    const al = Math.acos((rBig - rSmall) / L);
    const na = phi + al;
    const nb = phi - al;
    const at = (c: number[], r: number, a: number): [number, number, number] => [BX, c[1] + r * Math.sin(a), c[0] + r * Math.cos(a)];
    const step = (12 * Math.PI) / 180;
    const pts: [number, number, number][] = [];
    const n2 = Math.max(2, Math.ceil((2 * al) / step));
    for (let k = 0; k <= n2; k++) pts.push(at(c2, rSmall, na - ((na - nb) * k) / n2));
    const sweepBig = 2 * Math.PI - 2 * al;
    const n1 = Math.max(4, Math.ceil(sweepBig / step));
    for (let k = 0; k <= n1; k++) pts.push(at(c1, rBig, nb - (sweepBig * k) / n1));
    b.sweep(polyline(pts, { closed: true }), (_t: number): [number, number] => [0.013, BELT_T], {
      color: RUBBER,
      bone: chassis,
      section: "box",
    });
    // outer flanges that make the seating legible
    b.lathe(
      [
        [rBig - 0.02, 0],
        [rBig + 0.012, 0],
        [rBig + 0.012, 0.005],
        [rBig - 0.02, 0.005],
      ],
      { at: [0.233, AXLE_R.y, AXLE_R.z], axis: [1, 0, 0], segments: 28, color: CHROME, bone: wheelR },
    );
    b.lathe(
      [
        [rSmall - 0.014, 0],
        [rSmall + 0.012, 0],
        [rSmall + 0.012, 0.005],
        [rSmall - 0.014, 0.005],
      ],
      { at: [0.233, SMALL_C.y, SMALL_C.z], axis: [1, 0, 0], segments: 18, color: CHROME, bone: chassis },
    );
  }

  // axle through
  R(wheelR, V(-0.23, AXLE_R.y, AXLE_R.z), V(0.26, AXLE_R.y, AXLE_R.z), 0.016, CHROME, 8);

  // ---------------------------------------------------------------------------------------------------------
  // Footpegs and deployed kickstand
  for (const s of [1, -1]) {
    R(chassis, V(s * 0.1, 0.5, 0.32), V(s * 0.24, 0.3, 0.4), 0.014, CHROME, 6);
    R(chassis, V(s * 0.2, 0.3, 0.4), V(s * 0.29, 0.3, 0.4), 0.024, RUBBER, 8);
  }
  R(kick, KICK_HINGE, KICK_TIP, 0.012, CHROME, 6);
  G(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 8), CHROME, kick, KICK_HINGE, { dir: [1, 0, 0] });
  G(box(0.06, 0.012, 0.05), BLACK, kick, V(KICK_TIP.x, 0.088, KICK_TIP.z));

  return b.root;
}
```