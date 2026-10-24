import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, gradient, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Celestia",
  description:
    "1930s art-deco luxury passenger zeppelin: ribbed silver envelope with gold cheat lines and sunburst nose/tail, " +
    "sunburst cruciform fins with hinged rudders and elevators, a long cream gondola with stepped glowing windows and " +
    "chevron trim, and two gilt engine pods with spinning propellers.",
};

// ---------------------------------------------------------------------------------------------------------------
// Scale constants (meters). The ship points along +Z, nose at +Z.
const L = 130; // envelope length
const HALF = L / 2;
const R = 10.5; // max envelope radius
const AY = 13; // height of the envelope axis
const U0 = 0.42; // where the envelope is fattest (0 = tail, 1 = nose)
const DEG = Math.PI / 180;

// Palette
const GOLD = "#d9a62e";
const GOLD_D = "#a97a1c";
const GOLD_L = "#f1cf6a";
const CREAM = "#f3e8cb";
const CREAM_D = "#d8c9a2";
const NAVY = "#1f2b57";
const NAVY_L = "#34457f";
const SILVER = "#d6dce5";
const SILVER_L = "#eef1f6";
const SILVER_D = "#7f8ba2";
const STEEL = "#b9c1cd";
const RUBBER = "#2a2a33";
const RED = "#ff3b30";
const GREEN = "#35e07a";
const WARM = "#ffe9a8";

/** Envelope radius at height z along the axis. */
function hullR(z: number) {
  const u = (z + HALF) / L;
  if (u >= U0) {
    const e = (u - U0) / (1 - U0);
    return R * Math.sqrt(Math.max(0, 1 - Math.pow(e, 2.3)));
  }
  const e = (U0 - u) / U0;
  return R * Math.pow(Math.max(0, 1 - Math.pow(e, 1.9)), 0.62);
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const shade = (c: readonly number[], k: number): [number, number, number] => [c[0] * k, c[1] * k, c[2] * k];

// ---------------------------------------------------------------------------------------------------------------
// Paints

const hullPaint = paint((p, n) => {
  const dy = p.y - AY;
  const rr = Math.hypot(p.x, dy);
  const ang = Math.atan2(p.x, dy);
  let c: readonly number[] = mix("#8794ad", "#f3f6fa", smoothstep(-0.85, 0.85, n.y));
  c = mix(c as [number, number, number], "#b9c4d6", 0.25 * smoothstep(0.55, 0.8, noise(p, 5, 3)));
  // fabric panels, each a touch different
  const pz = (p.z + HALF) / 4;
  const pa = (ang / (Math.PI * 2)) * 24 + 12;
  const iz = Math.floor(pz);
  const ia = Math.floor(pa);
  const hs = Math.sin(iz * 12.9898 + ia * 78.233) * 43758.5453;
  const hv = hs - Math.floor(hs);
  c = shade(c, 0.94 + 0.1 * hv);
  const zEdge = Math.min(pz - iz, 1 - (pz - iz)) * 4;
  const aEdge = Math.min(pa - ia, 1 - (pa - ia)) * ((Math.PI * 2 * rr) / 24);
  if (zEdge < 0.055 || aEdge < 0.055) c = mix(c as [number, number, number], "#566178", 0.5);
  // gold & navy cheat line down each flank
  const dc = p.y - (AY - 3.1);
  if (rr > 3.3) {
    if (Math.abs(dc) < 0.17) c = mix(c as [number, number, number], NAVY, 0.95);
    else if (Math.abs(dc) < 0.37) c = mix(c as [number, number, number], GOLD, 0.95);
  }
  // speed lines streaming toward the tail
  for (let i = 0; i < 3; i++) {
    if (p.z < -36 - 6 * i && p.z > -58 && Math.abs(p.y - (AY + 0.5 + 0.8 * i)) < 0.12 && rr > 2)
      c = mix(c as [number, number, number], GOLD, 0.95);
  }
  // dorsal gold stripe
  if (Math.abs(p.x) < 0.2 && n.y > 0.8) c = mix(c as [number, number, number], GOLD, 0.9);
  return c as [number, number, number];
});

const gondolaPaint = paint((p, n) => {
  let c = mix("#d9c9a2", "#f6ecd2", smoothstep(-0.3, 0.8, n.y));
  c = mix(c, "#cdbd92", 0.25 * smoothstep(0.5, 0.75, noise(p, 2, 7)));
  if (Math.abs(p.y - 0.8) < 0.07) c = mix(c, GOLD, 0.95);
  return c;
});

const keelPaint = paint((p, n) => {
  let c = mix("#16204a", NAVY_L, smoothstep(-0.8, 0.8, n.y));
  if (p.y < 0.07 || Math.abs(p.y - 0.72) < 0.04) c = mix(c, GOLD, 0.9);
  return c;
});

const bladePaint = paint((_p, _n, s) => (s[1] > 2.25 ? GOLD_L : s[1] > 2.08 ? NAVY : "#8b5a2b"));

// ---------------------------------------------------------------------------------------------------------------
// SVG drawings

type Outline = [number, number][];
const FIN_FIXED: Outline = [
  [34, 3],
  [18, 12.6],
  [14, 12.6],
  [12.7, 3],
];
const FIN_RUD: Outline = [
  [12.3, 3],
  [13.8, 12.6],
  [8.5, 12.6],
  [5, 3],
];

/** Sunburst drawing for a fin piece. Bounding box of the fin: x 5..34, y 3..12.6. */
function finSvg(outline: Outline, flip: boolean) {
  const x0 = 5,
    x1 = 34,
    y0 = 3,
    y1 = 12.6,
    k = 24;
  const W = (x1 - x0) * k;
  const H = (y1 - y0) * k;
  const X = (x: number) => (x - x0) * k;
  const Y = (y: number) => (y1 - y) * k;
  const poly = outline.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(" ");
  const fx = X(22);
  const fy = Y(0.2);
  let rays = "";
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI;
    const a1 = ((i + 0.5) / n) * Math.PI;
    const r2 = 1500;
    rays += `<path d="M${fx.toFixed(1)} ${fy.toFixed(1)} L${(fx + Math.cos(a0) * r2).toFixed(1)} ${(fy - Math.sin(a0) * r2).toFixed(1)} L${(fx + Math.cos(a1) * r2).toFixed(1)} ${(fy - Math.sin(a1) * r2).toFixed(1)}Z" fill="${GOLD}"/>`;
  }
  const arcs = [170, 290, 410]
    .map((r) => `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${r}" fill="none" stroke="${NAVY}" stroke-width="3" opacity="0.55"/>`)
    .join("");
  const inner = `<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="${CREAM}"/>${rays}${arcs}</g>
    <polygon points="${poly}" fill="none" stroke="${GOLD_D}" stroke-width="7" stroke-linejoin="round"/>
    <polygon points="${poly}" fill="none" stroke="${NAVY}" stroke-width="1.6" stroke-linejoin="round"/>`;
  const body = flip ? `<g transform="translate(${W} 0) scale(-1 1)">${inner}</g>` : inner;
  return svg(
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="c"><polygon points="${poly}"/></clipPath></defs>${body}</svg>`,
    { size: 1024 },
  );
}

/** A row of glowing window bays with stepped tops. */
function bayStrip(heights: number[], bw: number, gap: number, H: number) {
  const W = heights.length * bw + (heights.length - 1) * gap;
  let s = "";
  heights.forEach((h, i) => {
    const x = i * (bw + gap);
    const y = H - h;
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="url(#g)" stroke="#c28a1e" stroke-width="2.4"/>`;
    s += `<path d="M${x} ${y + h * 0.38} H${x + bw}" stroke="#c28a1e" stroke-width="1.2"/>`;
    s += `<path d="M${x + bw / 2} ${y} V${y + h}" stroke="#c28a1e" stroke-width="0.9" opacity="0.8"/>`;
  });
  s += `<rect x="0" y="${H - 2}" width="${W}" height="2" fill="${GOLD}"/>`;
  return {
    W,
    H,
    tex: svg(
      `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset="1" stop-color="#ffb347"/></linearGradient></defs>${s}</svg>`,
      { size: 1024 },
    ),
  };
}

function chevronSvg() {
  const W = 840;
  const H = 20;
  let s = `<rect width="${W}" height="${H}" fill="${NAVY}"/><rect width="${W}" height="2" fill="${GOLD}"/><rect y="${H - 2}" width="${W}" height="2" fill="${GOLD}"/>`;
  for (let x = 6; x < W - 12; x += 30) {
    s += `<polyline points="${x},3.5 ${x + 10},10 ${x},16.5" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linejoin="miter"/>`;
    s += `<polyline points="${x + 8},4.5 ${x + 16},10 ${x + 8},15.5" fill="none" stroke="${CREAM}" stroke-width="1.6"/>`;
  }
  return svg(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 2048 });
}

function doorSvg() {
  return svg(
    `<svg viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 38 V13 H4 V8 H8 V3 H18 V8 H22 V13 H25 V38Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="0.8"/>
      <path d="M4 38 V15 H6.5 V10.5 H10 V6 H16 V10.5 H19.5 V15 H22 V38Z" fill="${NAVY}"/>
      <path d="M13 6 V38" stroke="${GOLD}" stroke-width="1.2"/>
      <rect x="7.4" y="14" width="4.6" height="9" fill="#ffd98a"/><rect x="14" y="14" width="4.6" height="9" fill="#ffd98a"/>
      <path d="M6.5 27 H19.5" stroke="${GOLD}" stroke-width="1"/>
      <circle cx="11" cy="31" r="1" fill="${GOLD}"/><circle cx="15" cy="31" r="1" fill="${GOLD}"/>
    </svg>`,
    { size: 256 },
  );
}

function nameSvg() {
  return svg(
    `<svg viewBox="0 0 900 90" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="${GOLD_D}" stroke-width="3"><path d="M10 45 H105"/><path d="M795 45 H890"/><path d="M30 33 H105"/><path d="M795 33 H870"/><path d="M30 57 H105"/><path d="M795 57 H870"/></g>
      <path d="M113 45 l9 -9 l9 9 l-9 9z" fill="${GOLD}"/><path d="M769 45 l9 -9 l9 9 l-9 9z" fill="${GOLD}"/>
      <text x="450" y="66" text-anchor="middle" font-family="Futura, 'Century Gothic', 'Trebuchet MS', Arial, sans-serif" font-size="66" font-weight="700" letter-spacing="30" fill="${NAVY}" stroke="${GOLD}" stroke-width="1.4">CELESTIA</text>
    </svg>`,
    { size: 2048 },
  );
}

function emblemSvg() {
  let rays = "";
  for (let i = 0; i < 24; i++) {
    const a0 = i * 15 * DEG;
    const a1 = a0 + 7.5 * DEG;
    rays += `<path d="M100 100 L${(100 + 88 * Math.cos(a0)).toFixed(1)} ${(100 + 88 * Math.sin(a0)).toFixed(1)} L${(100 + 88 * Math.cos(a1)).toFixed(1)} ${(100 + 88 * Math.sin(a1)).toFixed(1)}Z" fill="${GOLD}"/>`;
  }
  let star = "";
  for (let i = 0; i < 16; i++) {
    const r = i % 2 ? 9 : 24;
    const a = (i * 22.5 - 90) * DEG;
    star += `${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)} `;
  }
  return svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="97" fill="${NAVY}" stroke="${GOLD}" stroke-width="6"/>
      ${rays}
      <circle cx="100" cy="100" r="40" fill="${CREAM}" stroke="${GOLD_D}" stroke-width="4"/>
      <circle cx="100" cy="100" r="31" fill="${NAVY}"/>
      <polygon points="${star}" fill="${GOLD_L}"/>
      <circle cx="100" cy="100" r="93" fill="none" stroke="${CREAM}" stroke-width="1.5"/>
    </svg>`,
    { size: 512 },
  );
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "celestia", paintSize: 2048 });
  const hull = b.joint("hull", { at: [0, AY, 0] });
  const part = (geo: THREE.BufferGeometry, color: string | ReturnType<typeof paint>, o: Record<string, unknown> = {}) =>
    b.part(geo, color, { bone: hull, ...o } as never);

  const GILT = metal("gilt");

  // ---------------------------------------------------------------- envelope
  const N = 36;
  const profile: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const u = 0.5 - 0.5 * Math.cos((Math.PI * i) / N);
    const z = -HALF + u * L;
    profile.push([i === 0 || i === N ? 0 : Math.max(hullR(z), 0.05), z]);
  }
  const envelope = b.lathe(profile, {
    at: [0, AY, 0],
    axis: [0, 0, 1],
    segments: 24,
    color: hullPaint,
    bone: hull,
    name: "envelope",
  });

  // transverse frames
  for (let k = 1; k <= 15; k++) {
    const z = -HALF + 8 * k;
    part(new THREE.TorusGeometry(hullR(z) + 0.02, 0.16, 4, 32), k % 4 === 0 ? GOLD : SILVER_L, {
      at: [0, AY, z],
      flat: true,
      name: `frame${k}`,
    });
  }
  // longitudinal girders
  const ribZ = [-62, -58, -52, -44, -34, -24, -12, 0, 12, 24, 34, 42, 50, 56, 60, 62.5];
  for (let k = 0; k < 12; k++) {
    const a = (15 + 30 * k) * DEG;
    const pts = ribZ.map((z) => {
      const r = hullR(z) + 0.05;
      return [r * Math.sin(a), AY + r * Math.cos(a), z];
    });
    b.sweep(catmull(pts), 0.12, { color: SILVER_D, bone: hull, sides: 4, name: `girder${k}` });
  }

  // caps
  const noseCap: [number, number][] = [[0, 59.8]];
  for (const z of [59.8, 61.2, 62.4, 63.4, 64.2, 65]) noseCap.push([hullR(z) + 0.14, z]);
  noseCap.push([0, 65.6]);
  b.lathe(noseCap, { at: [0, AY, 0], axis: [0, 0, 1], segments: 24, color: GILT, bone: hull, name: "noseCap" });
  const tailCap: [number, number][] = [[0, -65.6]];
  for (const z of [-65, -64.2, -63.4, -62.4, -61.2, -59.8]) tailCap.push([hullR(z) + 0.14, z]);
  tailCap.push([0, -59.8]);
  b.lathe(tailCap, { at: [0, AY, 0], axis: [0, 0, 1], segments: 24, color: GILT, bone: hull, name: "tailCap" });

  // mooring finial
  b.rod([0, AY, 65.4], [0, AY, 67.6], [0.28, 0.1], { color: GOLD, bone: hull });
  part(new THREE.SphereGeometry(0.5, 8, 6), GOLD_L, { at: [0, AY, 67.9] });
  part(new THREE.TorusGeometry(0.45, 0.09, 4, 12), GOLD_D, { at: [0, AY, 65.9], flat: true });

  // sunburst rays at nose and tail
  const ray = (a: number, z0: number, dz: number, len: number, color: string) => {
    const pts: number[][] = [];
    for (let j = 0; j <= 3; j++) {
      const z = z0 + (dz * len * j) / 3;
      const r = hullR(z) + 0.08;
      pts.push([r * Math.sin(a), AY + r * Math.cos(a), z]);
    }
    b.sweep(catmull(pts), [0.42, 0], { color, bone: hull, sides: 4, caps: { start: "flat", end: "point" } });
  };
  for (let i = 0; i < 16; i++) {
    const a = (i * 360) / 16 * DEG;
    const long = i % 2 === 0;
    ray(a, 59.6, -1, long ? 11 : 6.5, long ? GOLD : NAVY);
    ray(a, -59.6, 1, long ? 11 : 6.5, long ? GOLD : NAVY);
  }

  // lettering and roundels
  const nameTex = nameSvg();
  const emblemTex = emblemSvg();
  for (const s of [1, -1]) {
    b.decal(envelope, nameTex, {
      at: [s * 10.5, AY + 0.8, -1],
      dir: [s, 0, 0],
      size: [60, 6],
      segments: 48,
      lift: 0.2,
      bone: hull,
      name: `lettering${s > 0 ? "L" : "R"}`,
    });
    b.decal(envelope, emblemTex, {
      at: [s * 7.4, AY + 0.4, 43],
      dir: [s, 0, 0],
      size: [6.4, 6.4],
      segments: 14,
      lift: 0.2,
      bone: hull,
      name: `roundel${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------- tail fins
  const O = V(0, AY, -HALF);
  const Z = V(0, 0, 1);
  const FINS: { d: [number, number, number]; joint: string; light: string | null; caps: boolean }[] = [
    { d: [0, 1, 0], joint: "rudderTop", light: "#ffffff", caps: true },
    { d: [0, -1, 0], joint: "rudderBottom", light: null, caps: false },
    { d: [1, 0, 0], joint: "elevatorL", light: RED, caps: true },
    { d: [-1, 0, 0], joint: "elevatorR", light: GREEN, caps: true },
  ];
  for (const f of FINS) {
    const D = V(...f.d);
    const Nn = Z.clone().cross(D);
    const P = (x: number, y: number) => O.clone().addScaledVector(Z, x).addScaledVector(D, y);
    const hinge = b.joint(f.joint, { parent: hull, at: P(12.3, 3), aim: P(13.8, 12.6), role: "hinge" });

    b.extrude(FIN_FIXED, {
      at: O, x: [0, 0, 1], y: f.d, thickness: 0.6, bevel: 0.12, color: SILVER, bone: hull, name: `fin_${f.joint}`,
    });
    b.extrude(FIN_RUD, {
      at: O, x: [0, 0, 1], y: f.d, thickness: 0.6, bevel: 0.12, color: SILVER, bone: hinge, name: `ctrl_${f.joint}`,
    });

    for (const side of [1, -1]) {
      const flip = side < 0;
      const centre = P(19.5, 7.8).addScaledVector(Nn, side * 0.32);
      const faceDir = Nn.clone().multiplyScalar(side);
      b.part(new THREE.PlaneGeometry(29, 9.6), "#ffffff", {
        at: centre, dir: faceDir, up: D, axis: "z", texture: finSvg(FIN_FIXED, flip), bone: hull,
        name: `finArt_${f.joint}_${side}`,
      });
      b.part(new THREE.PlaneGeometry(29, 9.6), "#ffffff", {
        at: centre, dir: faceDir, up: D, axis: "z", texture: finSvg(FIN_RUD, flip), bone: hinge,
        name: `ctrlArt_${f.joint}_${side}`,
      });
    }
    // gold edge trims
    b.rod(P(24.5, 8.7), P(18, 12.55), 0.17, GOLD, { bone: hull });
    b.rod(P(8.5, 12.5), P(5.4, 4), 0.11, GOLD, { bone: hinge });

    if (f.caps) {
      for (let k = 0; k < 3; k++) {
        const len = 3.6 - 1.0 * k;
        const h = 0.22;
        const t = 0.8 - 0.17 * k;
        const geo = new THREE.BoxGeometry(
          Math.abs(D.x) * h + Math.abs(Nn.x) * t + Math.abs(Z.x) * len,
          Math.abs(D.y) * h + Math.abs(Nn.y) * t + Math.abs(Z.y) * len,
          Math.abs(D.z) * h + Math.abs(Nn.z) * t + Math.abs(Z.z) * len,
        );
        part(geo, k === 1 ? NAVY : GOLD, { at: P(16, 12.7 + 0.22 * k) });
      }
    }
    if (f.light) glow(part(new THREE.SphereGeometry(0.34, 6, 4), f.light, { at: P(18.2, 12.0) }), 1.4);
  }
  // tail bumper wheel under the lower fin
  part(new THREE.CylinderGeometry(0.5, 0.5, 0.9, 12), RUBBER, { at: [0, 0.5, -49], dir: [1, 0, 0] });
  part(new THREE.CylinderGeometry(0.26, 0.26, 1.0, 8), GOLD, { at: [0, 0.5, -49], dir: [1, 0, 0] });

  // ---------------------------------------------------------------- gondola
  const GZ0 = -6, GZ1 = 15, GZN = 20.5, GY = 2.3, GW = 3.8, GH = 3.1;
  const body = b.frustumBox([0, GY, GZ0], [0, GY, GZ1], [GW, GH], [GW, GH], { color: gondolaPaint, bone: hull, name: "gondola" });
  const nose = b.frustumBox([0, GY, GZ1], [0, GY, GZN], [GW, GH], [1.9, 2.4], { color: gondolaPaint, bone: hull, name: "gondolaNose" });
  b.frustumBox([0, GY, GZ0], [0, GY, -8.2], [GW, GH], [2.4, 2.5], { color: gondolaPaint, bone: hull, name: "gondolaTail" });
  b.frustumBox([0, 0.4, -6.8], [0, 0.4, 15], [2.8, 0.8], [2.8, 0.8], { color: keelPaint, bone: hull, name: "keel" });
  b.frustumBox([0, 0.4, 15], [0, 0.4, 19.2], [2.8, 0.8], [1.2, 0.8], { color: keelPaint, bone: hull, name: "keelNose" });
  b.frustumBox([0, 0.4, -6.8], [0, 0.4, -8.3], [2.8, 0.8], [1.6, 0.8], { color: keelPaint, bone: hull, name: "keelTail" });
  // stepped gold bow
  const steps: [number, number, number, number][] = [
    [19.2, 19.9, 1.2, 0.8],
    [19.9, 20.5, 0.8, 0.55],
    [20.5, 21.0, 0.45, 0.3],
  ];
  steps.forEach(([za, zb, w, h], i) =>
    b.frustumBox([0, 0.4, za], [0, 0.4, zb], [w, h], [w, h], { color: i === 1 ? NAVY_L : GOLD, bone: hull, name: `bow${i}` }),
  );

  const winMain = bayStrip([14, 16, 18, 20, 22, 24, 26, 26, 24, 22, 20, 18, 16, 14].slice(1, 13), 22, 6, 27);
  const winNose = bayStrip([18, 24, 18], 30, 6, 28);
  const winFront = bayStrip([16, 22, 16], 10, 3, 22);
  const chevron = chevronSvg();
  const door = doorSvg();
  for (const s of [1, -1]) {
    glow(
      b.decal(body, winMain.tex, {
        at: [s * GW / 2, 1.975, 5.75], dir: [s, 0, 0], size: [winMain.W / 20, winMain.H / 20],
        segments: 8, lift: 0.06, bone: hull, name: `windows${s > 0 ? "L" : "R"}`,
      }),
      0.65,
    );
    b.decal(body, chevron, {
      at: [s * GW / 2, 1.03, 4.5], dir: [s, 0, 0], size: [21, 0.5], segments: 8, lift: 0.04,
      mirror: s > 0, bone: hull, name: `chevrons${s > 0 ? "L" : "R"}`,
    });
    b.decal(body, door, {
      at: [s * GW / 2, 1.7, -4.3], dir: [s, 0, 0], size: [1.3, 1.9], segments: 4, lift: 0.08, bone: hull,
      name: `door${s > 0 ? "L" : "R"}`,
    });
    glow(
      b.decal(nose, winNose.tex, {
        at: [s * 1.43, 2.25, 17.75], dir: [s * 0.986, 0, 0.17], size: [4.6, 1.26], segments: 8, lift: 0.05,
        bone: hull, name: `noseWindows${s > 0 ? "L" : "R"}`,
      }),
      0.65,
    );
    // nose lamps
    glow(part(new THREE.SphereGeometry(0.22, 6, 4), "#fff2c0", { at: [s * 0.7, 1.25, 20.8] }), 1.3);
  }
  glow(
    b.decal(nose, winFront.tex, {
      at: [0, 2.2, GZN], dir: [0, 0, 1], size: [1.7, 1.04], segments: 4, lift: 0.05, bone: hull, name: "windscreen",
    }),
    0.7,
  );

  // portholes along the keel (merged: one glowing part, one brass part)
  const glassGeos: THREE.BufferGeometry[] = [];
  const ringGeos: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    for (let k = 0; k < 11; k++) {
      const z = -4.2 + 1.75 * k;
      glassGeos.push(new THREE.CircleGeometry(0.16, 8).rotateY((s * Math.PI) / 2).translate(s * 1.41, 0.4, z));
      ringGeos.push(new THREE.TorusGeometry(0.17, 0.035, 4, 8).rotateY((s * Math.PI) / 2).translate(s * 1.41, 0.4, z));
    }
  }
  const glassMerged = mergeGeometries(glassGeos);
  const ringMerged = mergeGeometries(ringGeos);
  if (glassMerged) glow(part(glassMerged, WARM, { at: [0, 0, 0], name: "portholes" }), 1.2);
  if (ringMerged) part(ringMerged, GOLD, { at: [0, 0, 0], name: "porthole_rims", flat: true });

  // ---------------------------------------------------------------- engine pods
  const POD: [number, number][] = [
    [0, -4.7], [0.35, -4.4], [0.7, -3.6], [1.0, -2.4], [1.18, -1.2], [1.26, 0],
    [1.28, 1.0], [1.22, 2.2], [1.05, 3.3], [0.75, 4.1], [0.35, 4.55], [0, 4.75],
  ];
  const BLADE: [number, number][] = [
    [-0.1, 0.35], [-0.3, 0.8], [-0.33, 1.6], [-0.2, 2.1], [0, 2.6], [0.17, 2.1], [0.22, 1.6], [0.18, 0.8], [0.1, 0.35],
  ];
  const PLATE: [number, number][] = [[-3.8, 9.4], [3.6, 9.4], [2.2, 13.8], [-3.0, 13.8]];
  const zc = -20;
  const ang = 25 * DEG;
  const podPaint = gradient(CREAM, GILT, [0, 0, zc - 0.5], [0, 0, zc + 1.8]);
  const zh = V(0, 0, 1);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ur = V(s * Math.cos(ang), -Math.sin(ang), 0);
    const A = V(0, AY, zc);
    const Pc = A.clone().addScaledVector(ur, hullR(zc) + 4.2);

    b.lathe(POD, { at: Pc, axis: [0, 0, 1], segments: 14, color: podPaint, bone: hull, name: `pod${side}` });
    for (const [yb, rb] of [[-2.4, 1.0], [0.2, 1.27], [2.2, 1.22]] as [number, number][])
      part(new THREE.TorusGeometry(rb + 0.02, 0.07, 4, 20), GOLD_D, { at: Pc.clone().addScaledVector(zh, yb), flat: true });

    // pylon plate and struts
    b.extrude(PLATE, { at: A, x: [0, 0, 1], y: ur, thickness: 0.4, bevel: 0.07, color: CREAM_D, bone: hull, name: `pylon${side}` });
    const S1 = Pc.clone().addScaledVector(ur, -0.9).addScaledVector(zh, -2.4);
    const S2 = Pc.clone().addScaledVector(ur, -0.9).addScaledVector(zh, 2.0);
    const hullPt = (zz: number) => V(0, AY, zz).addScaledVector(ur, hullR(zz) - 0.35);
    const H1 = hullPt(zc - 6.5);
    const H2 = hullPt(zc + 5.5);
    b.rod(S1, H1, [0.2, 0.16], STEEL, { bone: hull });
    b.rod(S2, H2, [0.2, 0.16], STEEL, { bone: hull });
    b.rod(S1, H2, [0.1, 0.1], STEEL, { bone: hull });
    b.rod(S2, H1, [0.1, 0.1], STEEL, { bone: hull });

    // exhausts
    for (const dz of [-1.4, -2.3])
      b.rod(Pc.clone().add(V(s * 0.5, 0.95, dz)), Pc.clone().add(V(s * 0.9, 1.5, dz - 1.4)), 0.13, STEEL, { bone: hull });

    // propeller on its own joint
    const hubPos = Pc.clone().addScaledVector(zh, 4.75);
    const prop = b.joint(`prop${side}`, { parent: hull, at: hubPos, dir: [0, 0, 1] });
    b.lathe(
      [[0, -0.15], [0.62, -0.15], [0.64, 0.1], [0.5, 0.6], [0.28, 1.1], [0, 1.5]],
      { at: hubPos, axis: [0, 0, 1], segments: 12, color: GILT, bone: prop, name: `spinner${side}` },
    );
    part(new THREE.TorusGeometry(0.62, 0.07, 4, 12), GOLD_D, { at: hubPos.clone().addScaledVector(zh, 0.05), bone: prop, flat: true });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + 0.3;
      const rad = V(Math.sin(a), Math.cos(a), 0);
      const tan = V(Math.cos(a), -Math.sin(a), 0);
      const pitch = 0.45;
      const xd = tan.clone().multiplyScalar(Math.cos(pitch)).addScaledVector(zh, Math.sin(pitch));
      b.extrude(BLADE, {
        at: hubPos.clone().addScaledVector(zh, 0.35), x: xd, y: rad, thickness: 0.09, bevel: 0.02,
        color: bladePaint, bone: prop, name: `blade${side}${k}`,
      });
    }
  }

  return b.root;
}
