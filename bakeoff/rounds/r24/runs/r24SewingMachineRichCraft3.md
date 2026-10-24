```ts
import * as THREE from "three";
import {
  createBuilder,
  aim,
  offset,
  catmull,
  polyline,
  arc,
  spiral,
  paint,
  mix,
  noise,
  smoothstep,
  grain,
  svg,
} from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Victorian treadle sewing machine",
  description:
    "A black japanned, gold-decalled cast-iron treadle sewing machine on an ebonised table: filigree frames, rocking treadle, spoked flywheel with leather belt, hand wheel, needle bar, presser foot, spool, drawer and gilt transfers.",
};

type V = [number, number, number];

// ------------------------------------------------------------------ palette
const GOLD = "#e0ac32";
const GOLD_D = "#a8771a";
const STEEL_F = "#b8c0cc";
const BRASS_F = "#c99a3a";
const LEATHER = "#4a2c1a";
const RED = "#a31b2a";
const SPOOLW = "#6b4426";
const DARK = "#0e0e12";
const RUBBER = "#1b1714";

const GILT = metal("gilt", { polish: 0.75, tarnish: 0.08 });
const BRASS = metal("brass", { polish: 0.5 });
const STEEL = metal("steel", { polish: 0.7 });
const JAPAN = paint((p, n) => {
  const up = smoothstep(0.25, 1, n.y);
  const m = noise(p, 0.05, 4);
  const base = mix("#07070a", "#14151b", m);
  return mix(base, "#3b3d4a", up * 0.5 * smoothstep(0.35, 0.8, noise(p, 0.02, 9)) + up * 0.12);
});
const WOOD = grain("#150e0a", "#2b1b12", { size: 0.012, axis: "x", seed: 3 });

// ------------------------------------------------------------------ svg drawing helpers
const DK = "#3d2404";
const GD = "#e6b236";
const HI = "#fff1a8";
const gild = (d: string, w = 3) =>
  `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="${DK}" stroke-width="${w + 2.6}"/><path d="${d}" stroke="${GD}" stroke-width="${w}"/><path d="${d}" stroke="${HI}" stroke-width="${(w * 0.28).toFixed(2)}" transform="translate(-0.5 -0.6)"/></g>`;
const leaf = (d: string) =>
  `<path d="${d}" fill="${GD}" stroke="${DK}" stroke-width="1.6" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${HI}" stroke-width="0.7" opacity="0.7" transform="translate(-0.6 -0.6)"/>`;
const dot = (x: number, y: number, r: number) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${GD}" stroke="${DK}" stroke-width="1.2"/>`;
const mirrorX = (inner: string, w: number) => inner + `<g transform="translate(${w} 0) scale(-1 1)">${inner}</g>`;
const SERIF = `font-family="Georgia, 'Times New Roman', serif" font-weight="bold"`;

function makeTextures() {
  // Long arm transfer: scrolls either side of a lettered cartouche.
  const armHalf = [
    gild("M232 60 C205 60 190 34 160 34 C122 34 96 56 96 74 C96 92 126 98 134 82 C140 70 124 62 114 70", 3.4),
    gild("M232 60 C206 60 190 88 160 90 C136 92 112 100 88 98 C70 96 58 90 50 80", 2.6),
    gild("M228 54 C205 38 190 16 160 12 C130 8 100 16 72 30 C52 40 40 54 40 66", 2.2),
    leaf("M182 40 q-6 -16 -24 -18 q0 16 24 18z"),
    leaf("M158 88 q-4 14 -22 18 q-2 -14 22 -18z"),
    leaf("M120 38 q-4 -14 -20 -16 q0 14 20 16z"),
    dot(40, 70, 4),
    dot(112, 70, 3.4),
    dot(22, 62, 2.4),
    dot(14, 70, 1.8),
    gild("M16 8 L228 8", 1.6),
    gild("M16 112 L228 112", 1.6),
  ].join("");
  const arm = svg(
    `<svg viewBox="0 0 520 120">${mirrorX(armHalf, 520)}
      <ellipse cx="260" cy="60" rx="88" ry="39" fill="#09090d" stroke="${DK}" stroke-width="7"/>
      <ellipse cx="260" cy="60" rx="88" ry="39" fill="none" stroke="${GD}" stroke-width="3.6"/>
      <ellipse cx="260" cy="60" rx="80" ry="31" fill="none" stroke="${GD}" stroke-width="1.2"/>
      <text x="260" y="66" text-anchor="middle" ${SERIF} font-size="31" letter-spacing="3" fill="${GD}" stroke="${DK}" stroke-width="2.4" paint-order="stroke">EMPRESS</text>
      <text x="260" y="84" text-anchor="middle" ${SERIF} font-size="9.5" letter-spacing="3.4" fill="${HI}">SEWING MACHINE</text>
      ${dot(244, 36, 2.4)}${dot(260, 33, 3.2)}${dot(276, 36, 2.4)}
    </svg>`,
    { size: 1024 },
  );

  // Rosette: symmetric, reused at table corners, pillar, drawer.
  const petals = Array.from(
    { length: 8 },
    (_, i) => `<g transform="rotate(${i * 45} 50 50)">${leaf("M50 50 C41 40 41 24 50 12 C59 24 59 40 50 50z")}</g>`,
  ).join("");
  const smalls = Array.from(
    { length: 8 },
    (_, i) =>
      `<g transform="rotate(${i * 45 + 22.5} 50 50)">${leaf("M50 44 C47 38 47 32 50 26 C53 32 53 38 50 44z")}</g>`,
  ).join("");
  const rosette = svg(
    `<svg viewBox="0 0 100 100">${gild("M5 50 A45 45 0 0 1 95 50 A45 45 0 0 1 5 50Z", 1.8)}${smalls}${petals}${dot(50, 50, 5)}</svg>`,
    { size: 256 },
  );

  // Pillar transfer: shield with palmette.
  const pillar = svg(
    `<svg viewBox="0 0 100 140">
      ${gild("M50 8 C80 10 90 40 80 70 C74 90 60 112 50 132 C40 112 26 90 20 70 C10 40 20 10 50 8Z", 2.4)}
      ${Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45} 50 58)">${leaf("M50 58 q-8 -15 0 -28 q8 13 0 28z")}</g>`).join("")}
      ${dot(50, 58, 5)}
      ${gild("M50 96 C38 88 30 92 30 100 M50 96 C62 88 70 92 70 100", 2)}
      ${dot(50, 108, 3)}
    </svg>`,
    { size: 256 },
  );

  // Bed border strip: repeating S-scroll.
  const bandCells = Array.from(
    { length: 8 },
    (_, i) =>
      `<g transform="translate(${i * 75} 0)">${gild("M4 30 C18 6 38 6 48 30 C58 54 70 54 75 30", 2.4)}${leaf("M26 14 q-4 -9 -14 -10 q0 9 14 10z")}${dot(75, 30, 2.4)}</g>`,
  ).join("");
  const band = svg(`<svg viewBox="0 0 600 60">${bandCells}${gild("M0 4 H600", 1.4)}${gild("M0 56 H600", 1.4)}</svg>`, {
    size: 768,
  });

  // Frame column: vertical acanthus stem.
  let col = gild("M45 14 L45 346", 2.2) + dot(45, 10, 4);
  for (let i = 0; i < 5; i++) {
    const y = 40 + i * 60;
    col += gild(
      `M45 ${y} C79 ${y - 4} 83 ${y + 26} 63 ${y + 30} C53 ${y + 31} 51 ${y + 20} 59 ${y + 18}`,
      2.2,
    );
    col += gild(
      `M45 ${y} C11 ${y - 4} 7 ${y + 26} 27 ${y + 30} C37 ${y + 31} 39 ${y + 20} 31 ${y + 18}`,
      2.2,
    );
    col += leaf(`M45 ${y + 34} q-14 8 -20 24 q16 0 20 -24z`) + leaf(`M45 ${y + 34} q14 8 20 24 q-16 0 -20 -24z`);
    col += dot(45, y, 3);
  }
  const column = svg(`<svg viewBox="0 0 90 360">${col}</svg>`, { size: 512 });

  // Foot strip.
  const footCells = Array.from(
    { length: 8 },
    (_, i) =>
      `<g transform="translate(${i * 50} 0)">${gild("M2 42 C14 8 34 8 40 34 C42 46 34 48 32 40", 2.4)}${dot(46, 44, 2.2)}</g>`,
  ).join("");
  const foot = svg(`<svg viewBox="0 0 400 70">${footCells}${gild("M0 6 H400", 1.6)}${gild("M0 64 H400", 1.6)}</svg>`, {
    size: 640,
  });

  // Treadle lattice plate.
  let lat = "";
  for (let k = -140; k < 320; k += 26) {
    lat += gild(`M${k} 10 L${k + 110} 120`, 1.1) + gild(`M${k + 110} 10 L${k} 120`, 1.1);
  }
  const lattice = svg(
    `<svg viewBox="0 0 310 130">
      <defs><clipPath id="c"><rect x="14" y="14" width="282" height="102"/></clipPath></defs>
      <g clip-path="url(#c)">${lat}</g>
      ${gild("M8 8 H302 V122 H8Z", 2.6)}${gild("M16 16 H294 V114 H16Z", 1.2)}
      <ellipse cx="155" cy="65" rx="70" ry="28" fill="#09090d" stroke="${DK}" stroke-width="6"/>
      <ellipse cx="155" cy="65" rx="70" ry="28" fill="none" stroke="${GD}" stroke-width="3"/>
      <text x="155" y="62" text-anchor="middle" ${SERIF} font-size="17" letter-spacing="2" fill="${GD}">THE EMPRESS</text>
      <text x="155" y="78" text-anchor="middle" ${SERIF} font-size="8" letter-spacing="3" fill="${HI}">PATENT TREADLE</text>
    </svg>`,
    { size: 768 },
  );

  // Drawer front.
  const drawer = svg(
    `<svg viewBox="0 0 260 80">
      ${gild("M8 8 H252 V72 H8Z", 2.4)}${gild("M16 16 H244 V64 H16Z", 1.1)}
      ${mirrorX(gild("M26 40 C40 22 58 22 66 40 C72 52 60 56 56 48", 2.2) + leaf("M80 30 q-4 -10 -16 -12 q0 11 16 12z") + dot(24, 40, 3), 260)}
      ${gild("M110 40 C120 28 140 28 150 40 C140 52 120 52 110 40Z", 2)}${dot(130, 40, 4)}
    </svg>`,
    { size: 512 },
  );

  // Round faceplate.
  const face = svg(
    `<svg viewBox="0 0 100 100">
      <defs><radialGradient id="g" cx="0.38" cy="0.32" r="0.9"><stop offset="0" stop-color="#fff1a8"/><stop offset="0.55" stop-color="#d9a02a"/><stop offset="1" stop-color="#8a5c0c"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill="url(#g)" stroke="${DK}" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="${DK}" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="${HI}" stroke-width="0.8"/>
      ${[45, 135, 225, 315].map((a) => `<g transform="rotate(${a} 50 50)"><circle cx="50" cy="14" r="4" fill="#b88a20" stroke="${DK}" stroke-width="1.2"/><path d="M47 14 H53" stroke="${DK}" stroke-width="1.2"/></g>`).join("")}
      <rect x="44" y="26" width="12" height="48" rx="6" fill="#1a1208" stroke="${DK}" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );

  // Stitch regulator dial.
  const dial = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#17110a" stroke="${GD}" stroke-width="4"/>
      ${Array.from({ length: 11 }, (_, i) => {
        const a = ((-120 + i * 24) * Math.PI) / 180;
        const x1 = 50 + Math.sin(a) * 40;
        const y1 = 50 - Math.cos(a) * 40;
        const x2 = 50 + Math.sin(a) * 31;
        const y2 = 50 - Math.cos(a) * 31;
        return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${GD}" stroke-width="${i % 2 ? 2 : 3.4}"/>`;
      }).join("")}
      <text x="50" y="62" text-anchor="middle" ${SERIF} font-size="14" fill="${GD}">6</text>
      <path d="M50 50 L68 30" stroke="${HI}" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="5" fill="${GD}"/>
    </svg>`,
    { size: 256 },
  );

  return { arm, rosette, pillar, band, column, foot, lattice, drawer, face, dial };
}

// ------------------------------------------------------------------ geometry helpers
/** Offset a CCW polygon inward by d (mitred). */
function inset(poly: [number, number][], d: number): [number, number][] {
  const n = poly.length;
  return poly.map((p, i) => {
    const a = poly[(i + n - 1) % n];
    const c = poly[(i + 1) % n];
    const e1 = [p[0] - a[0], p[1] - a[1]];
    const e2 = [c[0] - p[0], c[1] - p[1]];
    const l1 = Math.hypot(e1[0], e1[1]);
    const l2 = Math.hypot(e2[0], e2[1]);
    const n1 = [-e1[1] / l1, e1[0] / l1];
    const n2 = [-e2[1] / l2, e2[0] / l2];
    const k = 1 + n1[0] * n2[0] + n1[1] * n2[1];
    const s = d / Math.max(k, 0.35);
    return [p[0] + (n1[0] + n2[0]) * s, p[1] + (n1[1] + n2[1]) * s] as [number, number];
  });
}

const FRAME: [number, number][] = [
  [-0.24, 0], [0.24, 0], [0.268, 0.042], [0.232, 0.082], [0.15, 0.062], [0.075, 0.1],
  [0.045, 0.22], [0.036, 0.5], [0.052, 0.64], [0.2, 0.712], [0.225, 0.745],
  [-0.225, 0.745], [-0.2, 0.712], [-0.052, 0.64], [-0.036, 0.5], [-0.045, 0.22], [-0.075, 0.1],
  [-0.15, 0.062], [-0.232, 0.082], [-0.268, 0.042],
];

const BED: [number, number][] = [
  [-0.275, -0.05], [-0.26, -0.085], [-0.2, -0.098], [0.15, -0.098], [0.215, -0.09], [0.225, -0.05],
  [0.225, 0.05], [0.215, 0.09], [0.15, 0.098], [-0.2, 0.098], [-0.26, 0.085], [-0.275, 0.05],
];

export default function build() {
  const b = createBuilder({ name: "treadle_sewing_machine", paintSize: 2048 });
  const T = makeTextures();

  // ---------------------------------------------------------------- skeleton
  const base = b.joint("base", { at: [0, 0, 0] });
  const flywheel = b.joint("flywheel", { parent: base, at: [0.2675, 0.22, 0], dir: [1, 0, 0] });
  const treadle = b.joint("treadle", { parent: base, at: [0, 0.09, 0], dir: [1, 0, 0] });
  const handwheel = b.joint("handwheel", { parent: base, at: [0.255, 0.985, 0], dir: [1, 0, 0] });
  const needleBar = b.joint("needleBar", { parent: base, at: [-0.23, 0.92, 0], dir: [0, -1, 0] });

  let bone: typeof base = base;

  // ---------------------------------------------------------------- helpers
  const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const ball = (r: number, color: any, at: V, sc: V = [1, 1, 1], o: any = {}) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), color, { bone, at, scale: sc, flat: true, ...o });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: V, dir: V = [0, 1, 0], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, seg), color, { bone, at, dir, flat: seg <= 12, ...o });
  const rodB = (a: V, c: V, r: number | [number, number], color: any, o: any = {}) =>
    b.rod(a, c, r, color, { bone, ...o });
  const bolt = (at: V, dir: V, r = 0.006, color: any = GOLD) => cyl(r, r, r * 0.9, 6, color, at, dir);
  const flatDecal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, up?: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, up, axis: "z", texture: tex });
  const roundDecal = (tex: THREE.Texture, r: number, at: V | THREE.Vector3, dir: V | THREE.Vector3) =>
    b.part(new THREE.CircleGeometry(r, 24), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const ringPath = (c: V, axis: V, r: number, n = 20) => {
    const q = aim(axis);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r).applyQuaternion(q).add(new THREE.Vector3(...c)));
    }
    return catmull(pts, { closed: true });
  };
  const goldRing = (c: V, axis: V, r: number, w = 0.0013) =>
    b.sweep(ringPath(c, axis, r), w, { color: GOLD, bone, sides: 5 });

  // ================================================================ CAST IRON FRAMES
  for (const s of [1, -1]) {
    bone = base;
    const fx = s * 0.39;
    const fr = b.extrude(FRAME, {
      at: [fx, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, bevel: 0.004, smoothing: 1, color: JAPAN, bone,
    });
    // gold bead tracing the silhouette on both faces
    for (const face of [1, -1]) {
      const pts = inset(FRAME, 0.009).map(([z, y]) => [fx + face * 0.0158, y, z]);
      b.sweep(polyline(pts, { closed: true }), 0.0018, { color: GOLD, bone, sides: 5 });
    }
    b.decal(fr, T.column, { at: [fx + s * 0.0152, 0.42, 0], dir: [s, 0, 0], size: [0.058, 0.44], bone });
    b.decal(fr, T.foot, { at: [fx + s * 0.0152, 0.034, 0], dir: [s, 0, 0], size: [0.3, 0.036], bone });
    // volutes on the foot tips
    for (const zs of [1, -1]) {
      const c = new THREE.Vector3(fx + s * 0.0162, 0.04, zs * 0.215);
      const from = c.clone().add(new THREE.Vector3(0, 0.018, 0));
      b.sweep(spiral(c, from, [1, 0, 0], { turns: zs * 1.15, r1: 0.005, pitch: 0 }), 0.002, {
        color: GOLD, bone, sides: 5,
      });
      bolt([fx + s * 0.0158, 0.73, zs * 0.16], [s, 0, 0], 0.007);
    }
    // pivot cone screw for the treadle, gold nut outside
    cyl(0.011, 0.003, 0.04, 8, STEEL_F, [fx - s * 0.035, 0.09, 0], [-s, 0, 0]);
    bolt([fx + s * 0.0158, 0.09, 0], [s, 0, 0], 0.012);
    // tie-rod nut
    bolt([fx + s * 0.0158, 0.55, 0], [s, 0, 0], 0.011);
    // studs up the column
    for (let i = 0; i < 4; i++) ball(0.0045, GOLD, [fx + s * 0.0158, 0.2 + i * 0.12, 0.0]);
  }
  // tie rod between the frames
  rodB([-0.375, 0.55, 0], [0.375, 0.55, 0], 0.007, JAPAN);
  rodB([-0.375, 0.55, 0], [-0.33, 0.55, 0], 0.0095, GILT);
  rodB([0.375, 0.55, 0], [0.33, 0.55, 0], 0.0095, GILT);

  // right frame bearing boss and the flywheel hanger under the table
  cyl(0.024, 0.024, 0.012, 12, BRASS, [0.369, 0.22, 0], [1, 0, 0]);
  bolt([0.4065, 0.22, 0], [1, 0, 0], 0.014);
  box(0.014, 0.53, 0.028, JAPAN, [0.232, 0.48, 0]);
  box(0.04, 0.004, 0.05, STEEL_F, [0.232, 0.743, 0]);
  cyl(0.018, 0.018, 0.016, 10, BRASS, [0.232, 0.22, 0], [1, 0, 0]);

  // ================================================================ TREADLE
  bone = treadle;
  box(0.67, 0.012, 0.3, JAPAN, [0, 0.1, 0]);
  box(0.67, 0.006, 0.012, JAPAN, [0, 0.109, 0.144]);
  box(0.67, 0.006, 0.012, JAPAN, [0, 0.109, -0.144]);
  box(0.012, 0.006, 0.276, JAPAN, [0.329, 0.109, 0]);
  box(0.012, 0.006, 0.276, JAPAN, [-0.329, 0.109, 0]);
  flatDecal(T.lattice, 0.62, 0.26, [0, 0.1068, 0], [0, 1, 0], [0, 0, -1]);
  cyl(0.011, 0.011, 0.67, 10, JAPAN, [0, 0.09, 0], [1, 0, 0]);
  for (const zz of [-0.1, 0.1]) box(0.66, 0.02, 0.01, JAPAN, [0, 0.087, zz]);
  for (const sx of [1, -1]) cyl(0.014, 0.014, 0.012, 10, GILT, [sx * 0.338, 0.09, 0], [1, 0, 0]);
  // pitman: bracket, rod, ring ends
  box(0.022, 0.022, 0.022, GILT, [0.32, 0.118, -0.12]);
  rodB([0.32, 0.118, -0.12], [0.32, 0.235, -0.03], [0.0075, 0.0055], JAPAN);
  cyl(0.012, 0.012, 0.012, 10, GOLD, [0.32, 0.118, -0.12], [1, 0, 0]);
  cyl(0.012, 0.012, 0.012, 10, GOLD, [0.32, 0.235, -0.03], [1, 0, 0]);

  // ================================================================ FLYWHEEL
  bone = flywheel;
  const RIM: [number, number][] = [
    [0.17, 0], [0.198, 0], [0.2, 0.004], [0.2, 0.0105], [0.1925, 0.016], [0.2, 0.0215], [0.2, 0.028], [0.198, 0.032], [0.17, 0.032],
  ];
  b.lathe(RIM, { at: [0.2515, 0.22, 0], axis: [1, 0, 0], segments: 28, color: JAPAN, bone });
  cyl(0.032, 0.032, 0.046, 12, JAPAN, [0.2675, 0.22, 0], [1, 0, 0]);
  cyl(0.02, 0.02, 0.01, 10, GILT, [0.2925, 0.22, 0], [1, 0, 0]);
  cyl(0.007, 0.007, 0.15, 8, STEEL, [0.3, 0.22, 0], [1, 0, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    rodB([0.2675, 0.22 + ca * 0.03, sa * 0.03], [0.2675, 0.22 + ca * 0.175, sa * 0.175], [0.0095, 0.006], JAPAN);
    for (const fx2 of [0.2838, 0.2512]) ball(0.0055, GOLD, [fx2, 0.22 + ca * 0.183, sa * 0.183]);
    bolt([0.2958, 0.22 + ca * 0.022, sa * 0.022], [1, 0, 0], 0.0045);
  }
  goldRing([0.2838, 0.22, 0], [1, 0, 0], 0.183);
  goldRing([0.2838, 0.22, 0], [1, 0, 0], 0.176, 0.0009);
  goldRing([0.2512, 0.22, 0], [1, 0, 0], 0.183);
  goldRing([0.2512, 0.22, 0], [1, 0, 0], 0.176, 0.0009);
  // crank
  cyl(0.036, 0.036, 0.008, 12, JAPAN, [0.3, 0.22, 0], [1, 0, 0]);
  goldRing([0.3042, 0.22, 0], [1, 0, 0], 0.03);
  cyl(0.007, 0.007, 0.03, 8, STEEL, [0.315, 0.235, -0.03], [1, 0, 0]);

  // ================================================================ BELT
  bone = base;
  const BX = 0.2675;
  for (const zs of [1, -1]) {
    b.sweep([[BX, 0.22, zs * 0.1945], [BX, 0.985, zs * 0.0595]], 0.0042, { color: LEATHER, bone, sides: 6 });
  }
  b.sweep(arc([BX, 0.22, 0], [BX, 0.22, 0.1945], [1, 0, 0], 180), 0.0042, { color: LEATHER, bone, sides: 6 });
  b.sweep(arc([BX, 0.985, 0], [BX, 0.985, -0.0595], [1, 0, 0], 180), 0.0042, { color: LEATHER, bone, sides: 6 });
  box(0.012, 0.026, 0.006, STEEL_F, [BX, 0.6, 0.126]);
  for (const dy of [-0.009, 0.009]) box(0.014, 0.003, 0.008, STEEL_F, [BX, 0.6 + dy, 0.126]);

  // ================================================================ TABLE
  bone = base;
  const TY = 0.7625;
  box(0.69, 0.035, 0.46, WOOD, [-0.105, TY, 0]);
  box(0.15, 0.035, 0.46, WOOD, [0.375, TY, 0]);
  box(0.06, 0.035, 0.11, WOOD, [0.27, TY, 0.175]);
  box(0.06, 0.035, 0.11, WOOD, [0.27, TY, -0.175]);
  // rails under the top
  box(0.75, 0.028, 0.02, WOOD, [0, 0.731, -0.205]);
  box(0.335, 0.028, 0.02, WOOD, [0.2075, 0.731, 0.205]);
  // gilt inlay border
  for (const zs of [1, -1]) box(0.856, 0.0013, 0.002, GOLD, [0, 0.7806, zs * 0.208]);
  for (const xs of [1, -1]) box(0.002, 0.0013, 0.416, GOLD, [xs * 0.428, 0.7806, 0]);
  for (const zs of [1, -1]) box(0.856, 0.0013, 0.0012, GOLD_D, [0, 0.7805, zs * 0.198]);
  for (const xs of [1, -1])
    for (const zs of [1, -1]) flatDecal(T.rosette, 0.05, 0.05, [xs * 0.4, 0.7814, zs * 0.18], [0, 1, 0], [0, 0, -1]);
  // lower gold edge beads
  for (const zs of [1, -1]) rodB([-0.45, 0.7485, zs * 0.2305], [0.45, 0.7485, zs * 0.2305], 0.0025, GOLD);
  for (const xs of [1, -1]) rodB([xs * 0.4505, 0.7485, -0.23], [xs * 0.4505, 0.7485, 0.23], 0.0025, GOLD);

  // drawer slung under the left half
  box(0.3, 0.006, 0.36, WOOD, [-0.19, 0.6485, 0]);
  for (const xs of [-1, 1]) box(0.006, 0.095, 0.36, WOOD, [-0.19 + xs * 0.147, 0.6965, 0]);
  box(0.3, 0.095, 0.006, WOOD, [-0.19, 0.6965, -0.177]);
  box(0.27, 0.08, 0.018, JAPAN, [-0.19, 0.69, 0.188]);
  flatDecal(T.drawer, 0.245, 0.062, [-0.19, 0.69, 0.1974], [0, 0, 1]);
  cyl(0.003, 0.003, 0.016, 6, BRASS_F, [-0.19, 0.69, 0.204], [0, 0, 1]);
  ball(0.0125, GOLD, [-0.19, 0.69, 0.214]);
  for (const xs of [-1, 1]) flatDecal(T.rosette, 0.03, 0.03, [-0.19 + xs * 0.112, 0.69, 0.1974], [0, 0, 1]);

  // ================================================================ MACHINE: BED
  const bed = b.extrude(BED, {
    at: [0, 0.795, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.004, smoothing: 1, color: JAPAN, bone,
  });
  const bedLine = inset(BED, 0.007).map(([x, z]) => [x, 0.8108, z]);
  b.sweep(polyline(bedLine, { closed: true }), 0.0012, { color: GOLD, bone, sides: 4 });
  b.along(polyline(inset(BED, 0.016).map(([x, z]) => [x, 0.8112, z]), { closed: true }), 26, (at) =>
    b.part(new THREE.SphereGeometry(0.0026, 6, 4), GOLD, { at, bone }),
  );
  for (const zs of [1, -1])
    flatDecal(T.band, 0.3, 0.03, [-0.04, 0.8114, zs * 0.074], [0, 1, 0], [0, 0, -zs]);
  flatDecal(T.rosette, 0.1, 0.1, [0.025, 0.8114, 0], [0, 1, 0], [0, 0, -1]);
  void bed;

  // throat plate, feed dogs, slide plate
  box(0.08, 0.0035, 0.05, STEEL, [-0.215, 0.8118, 0]);
  for (const zs of [1, -1]) {
    box(0.044, 0.0006, 0.007, DARK, [-0.225, 0.8137, zs * 0.0105]);
    for (let i = 0; i < 4; i++) box(0.006, 0.0016, 0.004, STEEL_F, [-0.24 + i * 0.0105, 0.8142, zs * 0.0105]);
  }
  cyl(0.003, 0.003, 0.0012, 8, DARK, [-0.23, 0.8137, 0], [0, 1, 0]);
  box(0.1, 0.0025, 0.07, STEEL, [-0.11, 0.811, 0]);
  for (const zs of [1, -1]) box(0.1, 0.0014, 0.0016, GOLD, [-0.11, 0.8126, zs * 0.0345]);
  for (const xs of [1, -1]) box(0.0016, 0.0014, 0.07, GOLD, [-0.11 + xs * 0.0492, 0.8126, 0]);
  cyl(0.009, 0.009, 0.0012, 10, DARK, [-0.065, 0.8124, 0], [0, 1, 0]);

  // ================================================================ MACHINE: PILLAR, ARM, HEAD
  const pillar = b.sweep([[0.168, 0.79, 0], [0.168, 0.97, 0]], [0.066, 0.052], {
    color: JAPAN, bone, sides: 12, caps: "flat",
  });
  goldRing([0.168, 0.82, 0], [0, 1, 0], 0.0675, 0.0016);
  goldRing([0.168, 0.95, 0], [0, 1, 0], 0.056, 0.0016);
  b.part(new THREE.SphereGeometry(1, 14, 10), JAPAN, { bone, at: [0.175, 0.985, 0], scale: [0.066, 0.066, 0.057] });
  const arm = b.sweep([[0.175, 0.985, 0], [-0.19, 0.99, 0]], (t: number) => [0.052 - 0.012 * t, 0.063 - 0.021 * t], {
    color: JAPAN, bone, sides: 16,
  });
  b.part(new THREE.SphereGeometry(1, 16, 12), JAPAN, { bone, at: [-0.205, 0.975, 0], scale: [0.062, 0.07, 0.052] });
  for (const ang of [48, -48, 132, -132])
    b.sweep(arm.line(ang, 0.0008), 0.0011, { color: GOLD, bone, sides: 4 });
  for (const zs of [1, -1]) {
    b.decal(arm, T.arm, { at: [-0.005, 0.99, zs * 0.045], dir: [0, 0, zs], size: [0.3, 0.07], bone });
    b.decal(pillar, T.pillar, { at: [0.168, 0.862, zs * 0.058], dir: [0, 0, zs], size: [0.062, 0.088], bone });
  }

  // faceplate and take-up lever
  cyl(0.043, 0.043, 0.012, 16, GILT, [-0.262, 0.975, 0], [-1, 0, 0]);
  roundDecal(T.face, 0.042, [-0.2685, 0.975, 0], [-1, 0, 0]);
  box(0.004, 0.04, 0.005, STEEL_F, [-0.2705, 0.99, 0]);
  ball(0.0065, GOLD, [-0.2715, 1.012, 0]);

  // presser bar, thumbscrew, foot
  cyl(0.0032, 0.0032, 0.08, 8, STEEL_F, [-0.205, 0.8655, 0]);
  cyl(0.011, 0.011, 0.012, 10, GOLD, [-0.205, 1.046, 0]);
  box(0.008, 0.02, 0.006, STEEL_F, [-0.205, 0.83, 0]);
  box(0.008, 0.006, 0.026, STEEL_F, [-0.2, 0.8205, 0]);
  for (const zs of [1, -1]) box(0.05, 0.0035, 0.0075, STEEL_F, [-0.2225, 0.8165, zs * 0.0105]);

  // needle bar assembly rides its own joint
  bone = needleBar;
  cyl(0.0035, 0.0035, 0.075, 8, STEEL_F, [-0.23, 0.8825, 0]);
  cyl(0.0085, 0.0085, 0.014, 8, BRASS_F, [-0.23, 0.862, 0]);
  cyl(0.0014, 0.0004, 0.05, 5, STEEL_F, [-0.23, 0.839, 0], [0, -1, 0]);
  box(0.006, 0.004, 0.012, STEEL_F, [-0.23, 0.905, 0.004]);
  bone = base;
  cyl(0.011, 0.011, 0.008, 10, BRASS_F, [-0.23, 0.908, 0]);

  // surface-seated details: stitch dial, tension, oil caps, spool
  const pskin = b.surface(pillar);
  const dh = pskin.around([0.168, 0.935, 0]).at(0, 0)!;
  b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 16), GILT, dh, { embed: 0.3, bone });
  roundDecal(T.dial, 0.0175, offset(dh.at, dh.n, 0.0066), dh.n);
  bolt([0.168, 0.9, 0.068], [0, 0, 1], 0.005);

  const askin = b.surface(arm);
  const tn = askin.around([-0.15, 0.99, 0]).at(0, 0)!;
  b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 12), BRASS_F, tn, { embed: 0.3, bone });
  b.stick(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 10), GOLD, tn.moved([0, 0.0095, 0]), { embed: 0.2, bone });
  for (const x of [0.12, -0.04, -0.12]) {
    const oh = askin.around([x, 0.99, 0]).at(0, 82)!;
    b.stick(new THREE.CylinderGeometry(0.0055, 0.0055, 0.005, 8), GOLD, oh, { embed: 0.3, bone });
  }
  const hs = askin.around([0.065, 0.987, 0]).at(0, 90)!;
  const sp = hs.at.clone();
  b.stick(new THREE.CylinderGeometry(0.01, 0.01, 0.008, 10), BRASS_F, hs, { embed: 0.3, bone });
  cyl(0.0035, 0.0035, 0.056, 8, STEEL_F, [sp.x, sp.y + 0.03, sp.z]);
  ball(0.0045, GOLD, [sp.x, sp.y + 0.059, sp.z]);
  b.lathe(
    [[0, 0], [0.017, 0], [0.017, 0.003], [0.0075, 0.0035], [0.0075, 0.0365], [0.017, 0.037], [0.017, 0.04], [0, 0.04]],
    { at: [sp.x, sp.y + 0.008, sp.z], color: SPOOLW, bone, segments: 12 },
  );
  cyl(0.0128, 0.0128, 0.032, 10, RED, [sp.x, sp.y + 0.028, sp.z]);
  // thread guide wire on the arm top
  cyl(0.0018, 0.0018, 0.038, 6, STEEL_F, [0.01, 1.062, 0]);
  ball(0.0042, GOLD, [0.01, 1.082, 0]);

  // the thread: spool, guide, tension, take-up, needle
  b.sweep(
    catmull([
      [0.0775, 1.07, 0], [0.01, 1.08, 0], [-0.06, 1.056, 0.012], [-0.14, 1.02, 0.045], [-0.168, 1.0, 0.057],
      [-0.218, 0.995, 0.058], [-0.262, 1.002, 0.03], [-0.274, 1.0, 0], [-0.272, 0.96, 0], [-0.255, 0.915, 0.006],
      [-0.236, 0.88, 0.007], [-0.2315, 0.835, 0],
    ]),
    0.0009,
    { color: RED, bone, sides: 4 },
  );

  // ================================================================ HAND WHEEL
  bone = handwheel;
  cyl(0.01, 0.01, 0.03, 8, STEEL_F, [0.24, 0.985, 0], [1, 0, 0]);
  b.lathe(
    [[0, 0], [0.06, 0], [0.0655, 0.004], [0.0655, 0.0085], [0.0575, 0.0125], [0.0655, 0.017], [0.0655, 0.0255], [0.052, 0.03], [0, 0.03]],
    { at: [0.255, 0.985, 0], axis: [1, 0, 0], segments: 28, color: JAPAN, bone },
  );
  goldRing([0.2854, 0.985, 0], [1, 0, 0], 0.046);
  goldRing([0.2854, 0.985, 0], [1, 0, 0], 0.034, 0.0009);
  cyl(0.02, 0.02, 0.01, 10, BRASS, [0.289, 0.985, 0], [1, 0, 0]);
  cyl(0.016, 0.016, 0.016, 10, GILT, [0.298, 0.985, 0], [1, 0, 0]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ball(0.0045, GOLD, [0.2856, 0.985 + Math.cos(a) * 0.04, Math.sin(a) * 0.04]);
  }
  bolt([0.3075, 0.985, 0], [1, 0, 0], 0.006, STEEL_F);

  return b.root;
}
```