```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, polyline, paint, mix, cells, noise, smoothstep, stripes, svg } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { gaugeTexture } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "American 4-4-0 (lithographed tinplate)",
  description:
    "A 4-4-0 'American' steam locomotive with a wood-and-coal tender, built as a chunky lithographed tinplate toy: green boiler with brass bands, red cab and tender with printed gilt lettering, red spoked drivers, glowing headlamp and firebox, engineer and fireman in the cab windows.",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const INK = "#241a2e";
const BLACK = "#2a2530";
const GREEN = "#2f8049";
const RED = "#b3331f";
const WHEELRED = "#dc3b2b";
const CREAM = "#f3e6bd";
const GOLD = "#f2c94c";
const BRASS = "#e2a63a";
const BRASS_D = "#b57c22";
const STEEL = "#aeb4c0";
const SILVER = "#d5d9e2";
const COAL = "#25222c";
const WOOD = "#8a5a32";
const SKIN = "#f1c19a";
const SMOKE_A = "#eceaf2";
const SMOKE_B = "#cfcbdc";

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters)
const GAUGE = 0.72; // rail centre
const DR = 0.86; // driver tread radius
const PR = 0.46; // pony / tender wheel radius
const BY = 2.45; // boiler axis height
const Z_DRV = [2.5, 0.5];
const Z_PONY = [5.0, 4.0];
const Z_TEND = [-3.7, -4.6, -6.2, -7.1];
const rB = (z: number) => 0.86 - (0.06 * (z + 1.7)) / 5.9;

// ---------------------------------------------------------------------------------------------------------------
// Paints: lithographed tin = warm lit side, cool shadow side, chipped silver flecks
const tin = (hex: string, seed = 3, wear = 0.3) => {
  const hi = mix(hex, "#ffffff", 0.24);
  const lo = mix(hex, "#2a1238", 0.38);
  return paint((p, n) => {
    const lit = 0.5 + 0.5 * (0.75 * n.y + 0.45 * n.z + 0.25 * n.x);
    let c = mix(lo, hi, smoothstep(0.15, 0.95, lit));
    if (wear > 0) {
      const k = cells(p, 0.26, seed);
      if (k.d1 < 0.09 && k.id < wear * 0.3) c = mix(c, SILVER, 0.85);
    }
    return c;
  });
};

const BAND_Z = [1.15, 2.3, 3.45];
const G_LO = mix(GREEN, "#10202e", 0.42);
const G_HI = mix(GREEN, "#ffffff", 0.2);
const BR_LO = mix(BRASS, "#3a1a10", 0.3);
const BR_HI = mix(BRASS, "#ffffff", 0.3);
const boilerPaint = paint((p, n) => {
  const lit = 0.5 + 0.5 * (0.8 * n.y + 0.4 * n.z + 0.25 * n.x);
  const t = smoothstep(0.1, 0.95, lit);
  let c = mix(G_LO, G_HI, t);
  const ang = Math.atan2(p.x, p.y - BY) * 0.82;
  const fa = ((((ang / 0.14) % 1) + 1) % 1) - 0.5;
  for (const bz of BAND_Z) {
    const dz = Math.abs(p.z - bz);
    if (dz < 0.075) c = mix(BR_LO, BR_HI, t);
    else if (dz > 0.1 && dz < 0.125) c = mix(c, INK, 0.9);
    else if (dz > 0.155 && dz < 0.175) c = mix(c, GOLD, 0.9);
    if (Math.hypot(Math.abs(dz - 0.26), fa * 0.14) < 0.017) c = mix(c, "#d9f2c2", 0.85);
  }
  // soft warm sheen along the shoulders
  const sh = smoothstep(0.55, 0.8, n.y) * (1 - smoothstep(0.8, 0.95, n.y));
  c = mix(c, "#ffffff", 0.12 * sh);
  const k = cells(p, 0.3, 9);
  if (k.d1 < 0.08 && k.id < 0.09) c = mix(c, SILVER, 0.85);
  return c;
});

const roofPaint = paint((p, n) => {
  const t = smoothstep(0.1, 1, n.y * 0.8 + 0.2);
  let c = mix(mix(CREAM, "#3a2a40", 0.32), mix(CREAM, "#ffffff", 0.25), t);
  const f = (((p.x / 0.2) % 1) + 1) % 1;
  if (f < 0.07) c = mix(c, "#7a5a3a", 0.8);
  return c;
});

const coalPaint = paint((p, n) => {
  const v = noise(p, 0.14, 4);
  let c = mix("#17141d", "#4b4658", smoothstep(0.35, 0.85, v));
  c = mix(c, "#6f6a85", 0.35 * smoothstep(0.6, 1, n.y) * smoothstep(0.6, 0.8, noise(p, 0.05, 6)));
  return c;
});

const sootPaint = paint((p, n) => {
  const lit = 0.5 + 0.5 * (0.75 * n.y + 0.45 * n.z);
  let c = mix("#17141d", "#4a4458", smoothstep(0.2, 1, lit));
  c = mix(c, "#6b4a32", 0.35 * smoothstep(0.55, 0.8, noise(p, 0.3, 2)) * smoothstep(-0.2, 0.8, n.y));
  const k = cells(p, 0.3, 5);
  if (k.d1 < 0.08 && k.id < 0.1) c = mix(c, SILVER, 0.8);
  return c;
});

const REDPAINT = tin(RED, 4, 0.5);
const REDDARK = tin("#8a2616", 6, 0.4);
const BLACKPAINT = tin(BLACK, 2, 0.35);
const GREENPAINT = tin(GREEN, 8, 0.3);
const CAPSTRIPE = stripes("#2f4a9e", "#f0f0f0", { size: 0.07, axis: "y", width: 0.4, wobble: 0 });

// ---------------------------------------------------------------------------------------------------------------
// Textures (lithographed prints)
const rivetRow = (x0: number, x1: number, y: number, step: number, r = 1.6, fill = "#f6ead0") => {
  let o = "";
  for (let x = x0; x <= x1; x += step) o += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  return o;
};

const TEX_TENDER = svg(
  `<svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="468" height="118" rx="10" fill="none" stroke="#f3cf62" stroke-width="3.4"/>
    <rect x="12" y="12" width="456" height="106" rx="7" fill="none" stroke="#f6ead0" stroke-width="1.8"/>
    <rect x="21" y="22" width="438" height="86" rx="5" fill="none" stroke="#f3cf62" stroke-width="2"/>
    ${rivetRow(28, 452, 16.5, 14, 1.7)}${rivetRow(28, 452, 114, 14, 1.7)}
    <g fill="none" stroke="#f3cf62" stroke-width="2.6">
      <circle cx="62" cy="65" r="22"/><circle cx="418" cy="65" r="22"/>
    </g>
    <g fill="#f3cf62" stroke="#4a0f08" stroke-width="1.4">
      <polygon points="62,46 67,59 81,59 70,67 74,81 62,72 50,81 54,67 43,59 57,59"/>
      <polygon points="418,46 423,59 437,59 426,67 430,81 418,72 406,81 410,67 399,59 413,59"/>
    </g>
    <text x="240" y="66" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="40" textLength="290" lengthAdjust="spacingAndGlyphs" fill="#ffd75a" stroke="#4a0f08" stroke-width="3.2" paint-order="stroke">GRAND CENTRAL</text>
    <path d="M118 78 H362" stroke="#f6ead0" stroke-width="2"/>
    <text x="240" y="98" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="19" textLength="220" lengthAdjust="spacingAndGlyphs" fill="#f6ead0" stroke="#4a0f08" stroke-width="2" paint-order="stroke">RAIL ROAD CO.</text>
  </svg>`,
  { size: 1100 },
);

const cabSheet = (s: number) => {
  const U = (z: number) => (s > 0 ? 1.0 - z : z + 1.6) * 100;
  const wa = Math.min(U(0.45), U(-0.95));
  const wb = Math.max(U(0.45), U(-0.95));
  const cx = (wa + wb) / 2;
  const pl = wa / 2;
  const pr = (wb + 260) / 2;
  return svg(
    `<svg viewBox="0 0 260 205" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="252" height="197" rx="6" fill="none" stroke="#f3cf62" stroke-width="3"/>
      <rect x="${wa - 5}" y="30" width="${wb - wa + 10}" height="100" rx="4" fill="none" stroke="#f3cf62" stroke-width="3.6"/>
      <rect x="${wa - 1.5}" y="33.5" width="${wb - wa + 3}" height="93" rx="2" fill="none" stroke="#f6ead0" stroke-width="1.8"/>
      <path d="M${pl} 40 V122 M${pr} 40 V122" stroke="#f3cf62" stroke-width="2.4"/>
      <circle cx="${pl}" cy="56" r="5" fill="none" stroke="#f3cf62" stroke-width="2"/>
      <circle cx="${pr}" cy="56" r="5" fill="none" stroke="#f3cf62" stroke-width="2"/>
      <rect x="10" y="134" width="240" height="61" rx="5" fill="none" stroke="#f3cf62" stroke-width="2.4"/>
      ${rivetRow(16, 244, 139, 12)}${rivetRow(16, 244, 190, 12)}
      <ellipse cx="${cx}" cy="165" rx="52" ry="27" fill="#f4e6c0" stroke="#4a0f08" stroke-width="3"/>
      <ellipse cx="${cx}" cy="165" rx="46" ry="22" fill="none" stroke="#d9a62e" stroke-width="2"/>
      <text x="${cx}" y="181" text-anchor="middle" font-family="Georgia, serif" font-weight="900" font-size="48" fill="#b3331f" stroke="#4a0f08" stroke-width="1.6" paint-order="stroke">7</text>
      <text x="${cx}" y="22" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="14" textLength="150" lengthAdjust="spacingAndGlyphs" fill="#f6ead0" stroke="#4a0f08" stroke-width="1.6" paint-order="stroke">GRAND CENTRAL</text>
      <path d="M14 14 H${cx - 90} M${cx + 90} 14 H246" stroke="#f3cf62" stroke-width="2.4"/>
    </svg>`,
    { size: 820 },
  );
};
const TEX_CAB_L = cabSheet(1);
const TEX_CAB_R = cabSheet(-1);

const TEX_NUMBER = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#f2c94c" stroke="#4a0f08" stroke-width="3"/>
    <circle cx="50" cy="50" r="41" fill="#7a1e16" stroke="#fff1c4" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="#f2c94c" stroke-width="1.6" stroke-dasharray="3 4"/>
    <text x="50" y="69" text-anchor="middle" font-family="Georgia, serif" font-weight="900" font-size="58" fill="#fff1c4" stroke="#2b0a06" stroke-width="2.4" paint-order="stroke">7</text>
  </svg>`,
  { size: 256 },
);

const TEX_LENS = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="l" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fffff0"/><stop offset="0.45" stop-color="#ffe27a"/><stop offset="1" stop-color="#ff9d2e"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="49" fill="url(#l)"/>
    <circle cx="50" cy="50" r="33" fill="none" stroke="#ffc24a" stroke-width="3"/>
    <circle cx="50" cy="50" r="18" fill="none" stroke="#fff6c8" stroke-width="3"/>
    <path d="M50 4 V96 M4 50 H96 M17 17 L83 83 M83 17 L17 83" stroke="#ffb73a" stroke-width="2" opacity="0.7"/>
  </svg>`,
  { size: 256 },
);

const TEX_FIRE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="f" cx="0.5" cy="0.7" r="0.6">
      <stop offset="0" stop-color="#fff2a0"/><stop offset="0.5" stop-color="#ff9a28"/><stop offset="1" stop-color="#b3260e"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="48" fill="#2a2630" stroke="#9aa0ae" stroke-width="4"/>
    <circle cx="50" cy="50" r="34" fill="url(#f)" stroke="#16131c" stroke-width="3"/>
    <path d="M30 70 Q34 48 42 58 Q44 36 52 48 Q58 30 62 52 Q70 46 68 70 Z" fill="#ffe56a" stroke="#ff7a1c" stroke-width="2"/>
    <path d="M42 70 Q46 56 52 62 Q56 52 58 70 Z" fill="#fffbe0"/>
    <rect x="44" y="12" width="12" height="6" rx="2" fill="#d9a62e"/>
  </svg>`,
  { size: 256 },
);

const TEX_BUILDER = svg(
  `<svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="70" cy="40" rx="67" ry="37" fill="#e2a63a" stroke="#4a2a08" stroke-width="3"/>
    <ellipse cx="70" cy="40" rx="59" ry="30" fill="none" stroke="#fff1b8" stroke-width="2"/>
    <text x="70" y="27" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="11" fill="#3a1a08">BUILT BY</text>
    <text x="70" y="46" text-anchor="middle" font-family="Georgia, serif" font-weight="900" font-size="17" textLength="94" lengthAdjust="spacingAndGlyphs" fill="#3a1a08">TINWORKS</text>
    <text x="70" y="62" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="11" fill="#3a1a08">No. 7 - 1893</text>
  </svg>`,
  { size: 420 },
);

const hazard = (x0: number, x1: number) => {
  let o = "";
  for (let x = x0; x < x1; x += 16)
    o += `<polygon points="${x},40 ${x + 8},40 ${x + 18},0 ${x + 10},0" fill="#f6ead0"/>`;
  return o;
};
const TEX_BEAM = svg(
  `<svg viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="a"><rect x="8" y="6" width="60" height="28"/></clipPath><clipPath id="c"><rect x="172" y="6" width="60" height="28"/></clipPath></defs>
    <rect x="1" y="1" width="238" height="38" rx="4" fill="#c9331f" stroke="#f3cf62" stroke-width="2.4"/>
    <g clip-path="url(#a)">${hazard(0, 80)}</g><g clip-path="url(#c)">${hazard(164, 250)}</g>
    <rect x="8" y="6" width="60" height="28" fill="none" stroke="#f3cf62" stroke-width="1.6"/>
    <rect x="172" y="6" width="60" height="28" fill="none" stroke="#f3cf62" stroke-width="1.6"/>
    <rect x="80" y="5" width="80" height="30" rx="6" fill="#f4e6c0" stroke="#4a0f08" stroke-width="2"/>
    <text x="120" y="29" text-anchor="middle" font-family="Georgia, serif" font-weight="900" font-size="22" fill="#b3331f" stroke="#4a0f08" stroke-width="1" paint-order="stroke">No. 7</text>
  </svg>`,
  { size: 768 },
);

const faceTex = (fireman: boolean) =>
  svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#f1c19a" stroke="#4a2a1a" stroke-width="4"/>
      ${fireman ? `<path d="M18 62 Q30 74 44 66 M62 30 Q74 24 82 36" stroke="#3a3238" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.7"/>` : ""}
      <ellipse cx="34" cy="46" rx="9" ry="10" fill="#fff" stroke="#2b1a14" stroke-width="3"/>
      <ellipse cx="66" cy="46" rx="9" ry="10" fill="#fff" stroke="#2b1a14" stroke-width="3"/>
      <circle cx="36" cy="48" r="4.6" fill="#2b1a14"/><circle cx="64" cy="48" r="4.6" fill="#2b1a14"/>
      <path d="M22 32 Q34 24 44 32 M56 32 Q66 24 78 32" stroke="${fireman ? "#3a2418" : "#e9e6e0"}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="24" cy="64" r="8" fill="#e98a7a" opacity="0.7"/><circle cx="76" cy="64" r="8" fill="#e98a7a" opacity="0.7"/>
      ${
        fireman
          ? `<path d="M36 74 Q50 86 64 74" stroke="#4a1a14" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
          : `<path d="M22 70 Q34 56 50 66 Q66 56 78 70 Q66 80 50 72 Q34 80 22 70 Z" fill="#e9e6e0" stroke="#7a766e" stroke-width="2.4"/>`
      }
    </svg>`,
    { size: 160 },
  );
const TEX_FACE_ENG = faceTex(false);
const TEX_FACE_FIRE = faceTex(true);
const TEX_GAUGE = gaugeTexture({ needle: 35, label: "STM", size: 160 });

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "locomotive-440", paintSize: 2048 });

  // ---- skeleton -------------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 1.05, 2.0] });
  const ponyTruck = b.joint("ponyTruck", { parent: chassis, at: [0, 0.95, 4.5], dir: [0, 0, 1] });
  const ponyF = b.joint("ponyWheelF", { parent: ponyTruck, at: [0, PR, Z_PONY[0]], dir: [1, 0, 0] });
  const ponyR = b.joint("ponyWheelR", { parent: ponyTruck, at: [0, PR, Z_PONY[1]], dir: [1, 0, 0] });
  const drvF = b.joint("driverF", { parent: chassis, at: [0, DR, Z_DRV[0]], dir: [1, 0, 0] });
  const drvR = b.joint("driverR", { parent: chassis, at: [0, DR, Z_DRV[1]], dir: [1, 0, 0] });
  const tender = b.joint("tender", { parent: chassis, at: [0, 1.1, -3.0] });
  const truckF = b.joint("truckF", { parent: tender, at: [0, 0.9, -4.15] });
  const truckR = b.joint("truckR", { parent: tender, at: [0, 0.9, -6.65] });
  const tw = [
    b.joint("tenderWheel1", { parent: truckF, at: [0, PR, Z_TEND[0]], dir: [1, 0, 0] }),
    b.joint("tenderWheel2", { parent: truckF, at: [0, PR, Z_TEND[1]], dir: [1, 0, 0] }),
    b.joint("tenderWheel3", { parent: truckR, at: [0, PR, Z_TEND[2]], dir: [1, 0, 0] }),
    b.joint("tenderWheel4", { parent: truckR, at: [0, PR, Z_TEND[3]], dir: [1, 0, 0] }),
  ];
  const BT = { bone: tender };

  // ---- helpers ---------------------------------------------------------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Any = any;
  const P = (geo: THREE.BufferGeometry, color: Any, at: V, o: Any = {}) =>
    b.part(geo, color, { bone: chassis, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, color: Any, at: V, o: Any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r: number, h: number, color: Any, at: V, dir: V, seg = 12, o: Any = {}) =>
    P(new THREE.CylinderGeometry(r, r, h, seg), color, at, { dir, ...o });
  const ball = (r: number, color: Any, at: V, o: Any = {}) => P(new THREE.SphereGeometry(r, 8, 6), color, at, o);
  const rod = (a: V, c: V, r: number, color: Any, o: Any = {}) =>
    b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  const plate = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, o: Any = {}) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex, ...o });
  const disc = (r: number, tex: THREE.Texture, at: V, dir: V, o: Any = {}) =>
    P(new THREE.CircleGeometry(r, 20), "#ffffff", at, { dir, axis: "z", texture: tex, ...o });
  const band = (at: V, axis: V, r0: number, r1: number, w: number, color: Any, seg = 16, o: Any = {}) =>
    b.lathe(
      [
        [r0, -w / 2],
        [r1, -w / 2],
        [r1, w / 2],
        [r0, w / 2],
      ] as [number, number][],
      { at, axis, segments: seg, color, bone: chassis, ...o },
    );

  // ---- wheels ----------------------------------------------------------------------------------------------------
  const spokeGeo = (n: number, r0: number, r1: number, w: number, t: number, cx: number, cy: number, cz: number) => {
    const gs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const g = new THREE.BoxGeometry(t, r1 - r0, w);
      g.rotateX(a);
      const rc = (r0 + r1) / 2;
      g.translate(cx, cy + rc * Math.cos(a), cz + rc * Math.sin(a));
      gs.push(g);
    }
    return mergeGeometries(gs)!;
  };

  const wheel = (axle: Joint, zc: number, R: number, driver: boolean) => {
    b.rod([-GAUGE, R, zc], [GAUGE, R, zc], 0.07, STEEL, { bone: axle, sides: 8 });
    for (const s of [1, -1]) {
      const at: V = [s * GAUGE, R, zc];
      const base = { at, axis: [s, 0, 0] as V, bone: axle };
      b.lathe(
        [
          [R - 0.11, -0.065],
          [R + 0.05, -0.065],
          [R + 0.05, -0.04],
          [R, -0.02],
          [R, 0.07],
          [R - 0.11, 0.07],
        ],
        { ...base, segments: driver ? 24 : 18, color: SILVER },
      );
      const hr = R * 0.19;
      b.lathe(
        [
          [0, -0.06],
          [hr, -0.06],
          [hr, 0.09],
          [hr * 0.6, 0.14],
          [0, 0.14],
        ],
        { ...base, segments: 12, color: BRASS },
      );
      if (driver) {
        b.part(spokeGeo(12, hr * 0.8, R - 0.08, 0.07, 0.05, s * (GAUGE + 0.02), R, zc), WHEELRED, {
          bone: axle,
          at: [0, 0, 0],
          flat: true,
        });
        b.lathe(
          [
            [R - 0.2, 0.0],
            [R - 0.12, 0.0],
            [R - 0.12, 0.085],
            [R - 0.2, 0.085],
          ],
          { ...base, segments: 24, color: WHEELRED },
        );
        b.lathe(
          [
            [R - 0.215, 0.07],
            [R - 0.185, 0.07],
            [R - 0.185, 0.1],
            [R - 0.215, 0.1],
          ],
          { ...base, segments: 24, color: GOLD },
        );
        // counterweight crescent, opposite the crank (which points rearward)
        const A = (55 * Math.PI) / 180;
        const r1 = R - 0.13;
        const r0 = 0.27;
        const pts: [number, number][] = [];
        for (let i = 0; i <= 4; i++) {
          const a = -A + (2 * A * i) / 4;
          pts.push([r1 * Math.cos(a), r1 * Math.sin(a)]);
        }
        for (let i = 4; i >= 0; i--) {
          const a = -A + (2 * A * i) / 4;
          pts.push([r0 * Math.cos(a), r0 * Math.sin(a)]);
        }
        b.extrude(pts, {
          at: [s * (GAUGE + 0.04), R, zc],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.06,
          color: WHEELRED,
          bone: axle,
        });
        // crank pin
        P(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), BRASS, [s * 0.9, R, zc - 0.32], {
          dir: [1, 0, 0],
          bone: axle,
        });
        P(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), BRASS_D, [s * 0.81, R, zc - 0.32], {
          dir: [1, 0, 0],
          bone: axle,
        });
      } else {
        b.lathe(
          [
            [0, -0.04],
            [R - 0.1, -0.04],
            [R - 0.1, 0.03],
            [R * 0.35, 0.03],
            [R * 0.22, 0.07],
            [0, 0.07],
          ],
          { ...base, segments: 16, color: WHEELRED },
        );
        b.part(spokeGeo(8, hr * 0.9, R - 0.1, 0.045, 0.03, s * (GAUGE + 0.05), R, zc), WHEELRED, {
          bone: axle,
          at: [0, 0, 0],
          flat: true,
        });
      }
    }
  };
  wheel(drvF, Z_DRV[0], DR, true);
  wheel(drvR, Z_DRV[1], DR, true);
  wheel(ponyF, Z_PONY[0], PR, false);
  wheel(ponyR, Z_PONY[1], PR, false);
  tw.forEach((j, i) => wheel(j, Z_TEND[i], PR, false));

  // ---- frame -----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    box(0.14, 0.28, 8.3, BLACKPAINT, [s * 0.5, 1.05, 1.85]);
    // pony truck bars, cross ties
    box(0.1, 0.14, 1.3, BLACK, [s * 0.55, 0.62, 4.5], { bone: ponyTruck });
    box(0.1, 0.2, 0.2, BRASS_D, [s * 0.58, PR, Z_PONY[0]], { bone: ponyTruck });
    box(0.1, 0.2, 0.2, BRASS_D, [s * 0.58, PR, Z_PONY[1]], { bone: ponyTruck });
    // axle boxes on the drivers
    box(0.12, 0.22, 0.24, BRASS_D, [s * 0.58, DR, Z_DRV[0]]);
    box(0.12, 0.22, 0.24, BRASS_D, [s * 0.58, DR, Z_DRV[1]]);
  }
  box(1.6, 0.14, 0.3, BLACK, [0, 0.8, 4.5], { bone: ponyTruck });
  box(1.2, 0.2, 0.22, BLACK, [0, 1.05, 1.5]);
  box(1.2, 0.2, 0.22, BLACK, [0, 1.05, -2.0]);
  box(1.2, 0.46, 1.2, BLACKPAINT, [0, 1.42, 4.9]); // smokebox saddle

  // ---- boiler & smokebox ----------------------------------------------------------------------------------------
  const boiler = b.sweep(
    polyline([
      [0, BY, -1.7],
      [0, BY, 4.25],
    ]),
    (t: number) => rB(-1.7 + t * 5.95),
    { color: boilerPaint, sides: 18, caps: "flat", bone: chassis },
  );
  for (const z of BAND_Z) band([0, BY, z], [0, 0, 1], rB(z) - 0.02, rB(z) + 0.035, 0.15, BRASS, 18);
  b.sweep(
    polyline([
      [0, BY, 4.2],
      [0, BY, 5.92],
    ]),
    0.84,
    { color: sootPaint, sides: 18, caps: "flat", bone: chassis },
  );
  band([0, BY, 4.2], [0, 0, 1], 0.78, 0.88, 0.12, BRASS, 18);
  band([0, BY, 5.88], [0, 0, 1], 0.78, 0.9, 0.1, BRASS, 18);
  b.lathe(
    [
      [0, 0],
      [0.82, 0],
      [0.82, 0.05],
      [0.55, 0.12],
      [0, 0.17],
    ],
    { at: [0, BY, 5.9], axis: [0, 0, 1], segments: 18, color: BLACKPAINT, bone: chassis },
  );
  disc(0.31, TEX_NUMBER, [0, BY, 6.085], [0, 0, 1]);
  band([0, BY, 6.07], [0, 0, 1], 0.3, 0.36, 0.04, BRASS, 18);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    rod([Math.cos(a) * 0.36, BY + Math.sin(a) * 0.36, 6.06], [Math.cos(a) * 0.78, BY + Math.sin(a) * 0.78, 5.97], 0.022, BRASS);
    ball(0.04, BRASS, [Math.cos(a) * 0.78, BY + Math.sin(a) * 0.78, 5.97]);
  }
  ball(0.07, BRASS, [0, BY + 0.0, 6.12]);

  // builder's plates on the boiler
  for (const s of [1, -1])
    b.decal(boiler, TEX_BUILDER, { at: [s * 0.8, BY - 0.05, 2.85], dir: [s, 0, 0], size: [0.7, 0.4] });

  // backhead: firebox door, gauges, valves
  disc(0.3, TEX_FIRE, [0, BY - 0.35, -1.715], [0, 0, -1]);
  glow(disc(0.22, TEX_FIRE, [0, BY - 0.35, -1.725], [0, 0, -1]), 1.3);
  for (const s of [1, -1]) {
    P(new THREE.CircleGeometry(0.14, 16), "#ffffff", [s * 0.36, BY + 0.38, -1.72], {
      dir: [0, 0, -1],
      axis: "z",
      texture: TEX_GAUGE,
    });
    band([s * 0.36, BY + 0.38, -1.71], [0, 0, -1], 0.13, 0.17, 0.04, BRASS, 12);
    cyl(0.04, 0.2, BRASS, [s * 0.6, BY - 0.1, -1.8], [0, 0, -1], 8);
    ball(0.06, WHEELRED, [s * 0.6, BY - 0.1, -1.92]);
  }
  rod([0.0, BY + 0.1, -1.74], [0.0, BY + 0.75, -1.85], 0.025, STEEL);
  ball(0.05, BLACK, [0.0, BY + 0.78, -1.86]);
  rod([0.2, BY - 0.6, -1.74], [0.2, BY - 0.1, -2.1], 0.025, STEEL);

  // ---- domes, stack, bell, whistle ------------------------------------------------------------------------------
  const dome = (z: number, r: number, h: number, color: Any) => {
    const base = BY + rB(z) - 0.08;
    b.lathe(
      [
        [0, 0],
        [r * 1.25, 0],
        [r * 1.25, 0.07],
        [r, 0.14],
        [r * 0.92, h * 0.5],
        [r * 0.72, h * 0.8],
        [r * 0.38, h * 0.95],
        [0, h],
      ],
      { at: [0, base, z], axis: [0, 1, 0], segments: 14, color, bone: chassis },
    );
    return base;
  };
  const sb = dome(2.9, 0.3, 0.5, BRASS);
  band([0, sb + 0.22, 2.9], [0, 1, 0], 0.27, 0.34, 0.05, BRASS_D, 14);
  const stb = dome(1.7, 0.4, 0.78, BRASS);
  band([0, stb + 0.36, 1.7], [0, 1, 0], 0.37, 0.45, 0.06, BRASS_D, 14);
  ball(0.07, BRASS, [0, stb + 0.8, 1.7]);
  // whistle
  cyl(0.045, 0.34, BRASS, [0, BY + rB(1.0) + 0.1, 1.0], [0, 1, 0], 8);
  ball(0.06, BRASS_D, [0, BY + rB(1.0) + 0.29, 1.0]);
  // bell
  const bellY = BY + rB(3.65) + 0.34;
  b.lathe(
    [
      [0, 0.3],
      [0.06, 0.3],
      [0.1, 0.2],
      [0.15, 0.08],
      [0.23, -0.03],
      [0.2, -0.03],
      [0.13, 0.04],
      [0.08, 0.12],
      [0, 0.2],
    ],
    { at: [0, bellY, 3.65], axis: [0, 1, 0], segments: 10, color: BRASS, bone: chassis },
  );
  for (const s of [1, -1]) rod([s * 0.2, BY + rB(3.65) - 0.05, 3.65], [s * 0.17, bellY + 0.22, 3.65], 0.03, BRASS_D);
  rod([-0.2, bellY + 0.22, 3.65], [0.2, bellY + 0.22, 3.65], 0.03, BRASS_D);
  // diamond stack
  const stackY = BY + 0.84 - 0.09;
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.25, 0.42],
      [0.5, 0.82],
      [0.27, 1.28],
      [0.3, 1.3],
      [0.3, 1.38],
      [0, 1.38],
    ],
    { at: [0, stackY, 4.5], axis: [0, 1, 0], segments: 14, color: BLACKPAINT, bone: chassis },
  );
  band([0, stackY + 0.38, 4.5], [0, 1, 0], 0.22, 0.29, 0.08, BRASS, 14);
  band([0, stackY + 1.34, 4.5], [0, 1, 0], 0.28, 0.34, 0.1, BRASS, 14);
  b.lathe(
    [
      [0, 0],
      [0.31, 0],
      [0.31, 0.06],
      [0.12, 0.26],
      [0, 0.3],
    ],
    { at: [0, stackY + 1.38, 4.5], axis: [0, 1, 0], segments: 14, color: BRASS_D, bone: chassis },
  );

  // smoke puffs, tinplate-toy style
  const puff = (r: number, at: V, c: string) =>
    P(new THREE.IcosahedronGeometry(r, 1), c, at, { scale: [1, 0.85, 1] });
  puff(0.26, [0, stackY + 1.95, 4.45], SMOKE_A);
  puff(0.36, [0, stackY + 2.4, 4.1], SMOKE_B);
  puff(0.46, [0, stackY + 2.95, 3.55], SMOKE_A);

  // ---- headlamp ------------------------------------------------------------------------------------------------
  const LZ = 5.45;
  const LY = BY + 0.84;
  box(0.5, 0.12, 0.6, BLACK, [0, LY + 0.02, LZ]);
  box(0.74, 0.72, 0.78, BLACKPAINT, [0, LY + 0.44, LZ]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.06, 0.74, 0.06, BRASS, [sx * 0.37, LY + 0.44, LZ + sz * 0.39]);
  box(0.82, 0.05, 0.86, BRASS, [0, LY + 0.1, LZ]);
  glow(disc(0.27, TEX_LENS, [0, LY + 0.44, LZ + 0.402], [0, 0, 1]), 1.5);
  band([0, LY + 0.44, LZ + 0.4], [0, 0, 1], 0.26, 0.34, 0.05, BRASS, 16);
  for (const s of [1, -1]) {
    glow(plate(0.4, 0.4, TEX_LENS, [s * 0.372, LY + 0.44, LZ], [s, 0, 0]), 1.0);
    box(0.02, 0.46, 0.46, BRASS_D, [s * 0.384, LY + 0.44, LZ], { scale: [1, 1, 1] });
  }
  b.lathe(
    [
      [0, 0],
      [0.62, 0],
      [0.62, 0.04],
      [0.2, 0.28],
      [0.2, 0.32],
      [0, 0.38],
    ],
    { at: [0, LY + 0.8, LZ], axis: [0, 1, 0], segments: 4, spin: 45, color: BRASS, bone: chassis },
  );
  cyl(0.07, 0.18, BRASS_D, [0, LY + 1.27, LZ], [0, 1, 0], 8);
  ball(0.09, BRASS, [0, LY + 1.38, LZ]);

  // ---- handrails along the boiler ----------------------------------------------------------------------------
  for (const s of [1, -1]) {
    rod([s * 0.7, 3.05, 4.1], [s * 0.7, 3.05, 1.1], 0.025, BRASS);
    ball(0.045, BRASS, [s * 0.7, 3.05, 4.1]);
    ball(0.045, BRASS, [s * 0.7, 3.05, 1.1]);
    for (const z of [3.7, 2.4, 1.3]) rod([s * 0.7, 3.05, z], [s * 0.52, 3.0, z], 0.022, BRASS);
  }

  // ---- cylinders & running gear -------------------------------------------------------------------------------
  const CX = 0.96;
  for (const s of [1, -1]) {
    const x = s * CX;
    b.sweep(
      polyline([
        [x, 1.35, 3.85],
        [x, 1.35, 5.05],
      ]),
      0.22,
      { color: BLACKPAINT, sides: 12, caps: "flat", bone: chassis },
    );
    band([x, 1.35, 3.95], [0, 0, 1], 0.2, 0.26, 0.07, BRASS, 12);
    band([x, 1.35, 4.95], [0, 0, 1], 0.2, 0.26, 0.07, BRASS, 12);
    cyl(0.2, 0.07, BRASS, [x, 1.35, 5.085], [0, 0, 1], 12);
    cyl(0.2, 0.07, BRASS, [x, 1.35, 3.815], [0, 0, 1], 12);
    b.sweep(
      polyline([
        [x, 1.64, 3.9],
        [x, 1.64, 4.95],
      ]),
      0.13,
      { color: BLACKPAINT, sides: 10, caps: "flat", bone: chassis },
    );
    cyl(0.12, 0.06, BRASS, [x, 1.64, 4.97], [0, 0, 1], 10);
    box(0.4, 0.3, 0.5, BLACK, [s * 0.7, 1.15, 4.4]); // cylinder saddle
    rod([x, 1.7, 4.4], [s * 0.55, 2.15, 4.4], 0.07, BRASS_D); // steam pipe
    // piston rod, crosshead, guides
    rod([x, 1.35, 3.85], [x, 1.35, 3.3], 0.04, STEEL);
    box(0.12, 0.16, 0.22, STEEL, [x, 1.35, 3.3]);
    rod([x, 1.27, 3.8], [x, 1.27, 3.0], 0.022, STEEL);
    rod([x, 1.43, 3.8], [x, 1.43, 3.0], 0.022, STEEL);
    box(0.1, 0.24, 0.08, STEEL, [x, 1.35, 3.0]);
    // main rod to the front driver crank pin, side rod between the pins
    const pinF: V = [s * 0.97, DR, Z_DRV[0] - 0.32];
    const pinR: V = [s * 0.91, DR, Z_DRV[1] - 0.32];
    rod([x, 1.35, 3.3], pinF, 0.04, STEEL, { section: "box" });
    rod([s * 0.89, DR, Z_DRV[0] - 0.32], [s * 0.89, DR, Z_DRV[1] - 0.32], 0.04, STEEL, { section: "box" });
    cyl(0.07, 0.05, BRASS, [pinF[0], pinF[1], pinF[2]], [1, 0, 0], 8);
    cyl(0.07, 0.05, BRASS, [pinR[0], pinR[1], pinR[2]], [1, 0, 0], 8);
    // valve gear: rocker and eccentric rod
    rod([s * 0.88, 1.64, 3.9], [s * 0.88, 1.64, 3.45], 0.025, STEEL);
    rod([s * 0.88, 1.8, 3.45], [s * 0.88, 1.15, 3.45], 0.03, STEEL);
    rod([s * 0.88, 1.15, 3.45], [s * 0.86, DR + 0.12, Z_DRV[0] + 0.1], 0.025, STEEL);
    ball(0.06, BRASS, [s * 0.88, 1.8, 3.45]);
  }

  // ---- running boards, brackets, valence --------------------------------------------------------------------
  for (const s of [1, -1]) {
    box(0.8, 0.06, 4.7, "#3a3540", [s * 1.02, 1.95, 3.35]);
    box(0.05, 0.22, 4.7, REDPAINT, [s * 1.42, 1.82, 3.35]);
    rod([s * 1.44, 1.95, 1.0], [s * 1.44, 1.95, 5.7], 0.03, GOLD);
    for (const z of [1.5, 3.0, 4.6]) rod([s * 1.38, 1.9, z], [s * 0.55, 1.2, z], 0.03, BLACK);
  }
  box(2.9, 0.08, 3.2, WOOD, [0, 1.94, -0.6]); // cab floor

  // ---- buffer beam, pilot, coupler -----------------------------------------------------------------------------
  box(2.6, 0.5, 0.2, REDPAINT, [0, 1.1, 5.85]);
  plate(2.4, 0.4, TEX_BEAM, [0, 1.1, 5.962], [0, 0, 1]);
  box(0.3, 0.22, 0.5, BLACK, [0, 0.98, 6.25]);
  rod([0, 0.98, 6.3], [0, 0.98, 6.6], 0.05, STEEL, { section: "box" });
  const pilotX = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => i * 0.2);
  const pil = (x: number, t: number): V => [x * (1 - 0.9 * t), 0.95 - 0.61 * t, 5.95 + 1.5 * t];
  for (const x of pilotX) {
    const edge = Math.abs(x) > 0.95;
    rod(pil(x, 0), pil(x, 1), edge ? 0.05 : 0.032, edge ? RED : BLACK, { section: "box" });
  }
  for (const t of [0.3, 0.62, 0.92]) rod(pil(-1, t), pil(1, t), 0.035, RED, { section: "box" });
  for (const s of [1, -1]) rod([s * 0.5, 0.9, 5.8], pil(s * 0.1, 0.95), 0.03, BLACK);

  // ---- cab -----------------------------------------------------------------------------------------------------
  const wallColor = REDPAINT;
  box(2.6, 2.05, 0.1, wallColor, [0, 2.975, 0.95]); // front wall
  for (const s of [1, -1]) {
    const x = s * 1.25;
    box(0.1, 0.8, 2.6, wallColor, [x, 2.35, -0.3]);
    box(0.1, 0.35, 2.6, wallColor, [x, 3.825, -0.3]);
    box(0.1, 0.9, 0.55, wallColor, [x, 3.2, 0.725]);
    box(0.1, 0.9, 0.65, wallColor, [x, 3.2, -1.275]);
    box(0.16, 0.05, 1.5, GOLD, [s * 1.28, 2.78, -0.25]); // sill
    box(0.12, 2.05, 0.12, REDDARK, [s * 1.25, 2.975, -2.15]); // rear post
    box(0.12, 0.12, 0.8, REDDARK, [s * 1.25, 3.96, -1.8]);
    plate(2.6, 2.05, s > 0 ? TEX_CAB_L : TEX_CAB_R, [s * 1.306, 2.975, -0.3], [s, 0, 0]);
    // steps
    rod([s * 1.5, 1.95, -1.75], [s * 1.5, 0.65, -1.75], 0.03, BLACK);
    rod([s * 1.5, 1.95, -2.1], [s * 1.5, 0.65, -2.1], 0.03, BLACK);
    box(0.36, 0.04, 0.42, "#3a3540", [s * 1.5, 1.4, -1.925]);
    box(0.36, 0.04, 0.42, "#3a3540", [s * 1.5, 0.85, -1.925]);
  }
  // roof
  const roofProfile: ([number, number] | [number, number, "sharp"])[] = [
    [-1.55, 0, "sharp"],
    [1.55, 0, "sharp"],
    [1.5, 0.1],
    [1.0, 0.2],
    [0, 0.28],
    [-1.0, 0.2],
    [-1.5, 0.1],
  ];
  b.extrude(roofProfile, {
    at: [0, 4.0, -0.6],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 3.7,
    smoothing: 1,
    color: roofPaint,
    bone: chassis,
  });
  b.extrude(
    [
      [-0.7, 0, "sharp"],
      [0.7, 0, "sharp"],
      [0.62, 0.14],
      [0, 0.2],
      [-0.62, 0.14],
    ],
    {
      at: [0, 4.22, -0.6],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 2.8,
      smoothing: 1,
      color: REDPAINT,
      bone: chassis,
    },
  );
  for (const s of [1, -1]) {
    rod([s * 1.55, 4.02, -2.45], [s * 1.55, 4.02, 1.25], 0.035, GOLD);
    rod([s * 0.7, 4.24, -1.9], [s * 0.7, 4.24, 0.7], 0.025, GOLD);
  }
  rod([-1.55, 4.02, -2.45], [1.55, 4.02, -2.45], 0.035, GOLD);
  rod([-1.55, 4.02, 1.25], [1.55, 4.02, 1.25], 0.035, GOLD);

  // engineer (right, -X) and fireman (left, +X)
  const figure = (s: number, face: THREE.Texture, shirt: Any, fireman: boolean) => {
    const x = s * 0.96;
    const zc = -0.25;
    box(0.5, 0.08, 0.45, WOOD, [x, 2.4, zc]);
    box(0.42, 0.6, 0.34, shirt, [x, 2.76, zc]);
    ball(0.17, SKIN, [x, 3.2, zc]);
    disc(0.13, face, [x + s * 0.176, 3.2, zc], [s, 0, 0]);
    cyl(0.19, 0.12, fireman ? "#59403a" : CAPSTRIPE, [x, 3.38, zc], [0, 1, 0], 10);
    box(0.2, 0.025, 0.26, "#1b1b2a", [x + s * 0.14, 3.33, zc]);
    rod([x + s * 0.18, 2.95, zc], [s * 1.2, 2.84, zc + 0.14], 0.05, fireman ? "#8a3a2a" : "#2f4a9e");
    ball(0.06, SKIN, [s * 1.22, 2.84, zc + 0.15]);
  };
  figure(-1, TEX_FACE_ENG, CAPSTRIPE, false);
  figure(1, TEX_FACE_FIRE, "#8a3a2a", true);

  // ---- tender --------------------------------------------------------------------------------------------------
  box(2.6, 1.45, 5.0, REDPAINT, [0, 1.825, -5.4], BT);
  box(2.7, 0.06, 5.1, REDDARK, [0, 2.58, -5.4], BT);
  box(2.2, 0.18, 4.9, BLACK, [0, 1.0, -5.4], BT);
  for (const s of [1, -1]) {
    plate(4.8, 1.3, TEX_TENDER, [s * 1.306, 1.85, -5.4], [s, 0, 0], BT);
    rod([s * 1.32, 2.55, -2.9], [s * 1.32, 2.55, -7.9], 0.04, GOLD, BT);
    rod([s * 1.32, 1.14, -2.9], [s * 1.32, 1.14, -7.9], 0.035, GOLD, BT);
    // bunker side boards
    b.extrude(
      [
        [0, 0],
        [2.4, 0],
        [2.4, 0.4],
        [0, 0.72],
      ],
      { at: [s * 1.25, 2.61, -2.9], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.1, color: REDPAINT, bone: tender },
    );
    rod([s * 1.25, 3.34, -2.9], [s * 1.25, 3.02, -5.3], 0.03, GOLD, BT);
    // truck frames, bolsters, springs
    for (const [j, zs] of [
      [truckF, [Z_TEND[0], Z_TEND[1]]],
      [truckR, [Z_TEND[2], Z_TEND[3]]],
    ] as [Joint, number[]][]) {
      const zm = (zs[0] + zs[1]) / 2;
      box(0.1, 0.14, 1.3, BLACK, [s * 0.58, 0.62, zm], { bone: j });
      box(0.08, 0.05, 0.95, STEEL, [s * 0.58, 0.74, zm], { bone: j });
      for (const z of zs) box(0.1, 0.2, 0.2, BRASS_D, [s * 0.58, PR, z], { bone: j });
    }
    // ladder on the rear
    rod([s * 0.95, 1.2, -7.97], [s * 0.95, 2.5, -7.97], 0.03, STEEL, BT);
    // rear marker lamps
    box(0.2, 0.26, 0.2, BLACK, [s * 1.1, 2.78, -7.84], BT);
    glow(plate(0.14, 0.14, TEX_LENS, [s * 1.1, 2.78, -7.945], [0, 0, -1], BT), 1.2);
  }
  for (const y of [1.45, 1.75, 2.05, 2.35]) rod([-0.95, y, -7.97], [0.95, y, -7.97], 0.025, STEEL, BT);
  for (const zs of [-4.15, -6.65]) box(1.6, 0.14, 0.3, BLACK, [0, 0.86, zs], BT);
  // bunker front, back, coal
  box(2.5, 0.72, 0.1, REDPAINT, [0, 2.97, -2.95], BT);
  box(2.5, 0.4, 0.1, REDPAINT, [0, 2.81, -5.3], BT);
  P(new THREE.IcosahedronGeometry(1, 1), coalPaint, [0, 2.62, -4.1], { ...BT, scale: [1.12, 0.58, 1.08] });
  const rnd = rng(11);
  const lumps: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 34; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = Math.sqrt(rnd()) * 0.92;
    const u = Math.cos(a) * rr;
    const w = Math.sin(a) * rr;
    const y = 2.62 + 0.58 * Math.sqrt(Math.max(0, 1 - u * u - w * w));
    const g = new THREE.DodecahedronGeometry(0.09 + 0.08 * rnd(), 0);
    g.scale(1 + rnd() * 0.5, 0.8 + rnd() * 0.4, 1 + rnd() * 0.4);
    g.rotateY(rnd() * 6);
    g.rotateX(rnd() * 6);
    g.translate(u * 1.12, y + 0.02, -4.1 + w * 1.08);
    lumps.push(g);
  }
  b.part(mergeGeometries(lumps)!, "#3a3646", { bone: tender, at: [0, 0, 0], flat: true });
  // water hatch
  cyl(0.4, 0.1, BRASS_D, [0, 2.66, -7.0], [0, 1, 0], 12, BT);
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.3, 0.1],
      [0.14, 0.17],
      [0, 0.19],
    ],
    { at: [0, 2.71, -7.0], axis: [0, 1, 0], segments: 12, color: BRASS, bone: tender },
  );
  ball(0.06, BRASS_D, [0, 2.93, -7.0], BT);
  box(0.12, 0.05, 0.3, STEEL, [0.45, 2.66, -7.0], BT);
  // draw bar and fall plate
  rod([0, 1.2, -2.1], [0, 1.2, -3.05], 0.07, STEEL, { section: "box" });
  box(2.0, 0.04, 0.7, "#3a3540", [0, 1.97, -2.55]);
  rod([-0.7, 1.99, -2.2], [0.7, 1.99, -2.2], 0.025, GOLD);

  return b.root;
}
```