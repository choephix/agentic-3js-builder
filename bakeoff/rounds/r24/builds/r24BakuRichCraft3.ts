import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  bezier,
  spiral,
  limb,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baku",
  description:
    "The dream-eating tapir spirit in the manner of a ukiyo-e woodblock print: indigo seigaiha waves, a cream saddle with sumi key-lines, vermilion kumadori face paint, flame-curl mane, a shimenawa collar with paper shide, and a glowing dream drawn in through the trunk.",
};

// ------------------------------------------------------------------------------------------------
// Palette: the limited block-printer's inks.
const INK = "#1b1714";
const INDIGO = "#24427f";
const DEEP = "#152a57";
const PALEBLUE = "#8fb5d4";
const CREAM = "#f2e6c6";
const PAPER = "#e2cf9d";
const IVORY = "#f7efd8";
const VERM = "#d9442b";
const GOLD = "#e0aa3c";
const ROPE = "#d8c07a";
const ROPE2 = "#a98b45";
const MOUTH = "#a8322a";
const TONGUE = "#e0675e";
const WISP = "#cfeaff";

type C = string | readonly [number, number, number];

// ------------------------------------------------------------------------------------------------
// Pattern helpers

/** Seigaiha: ratio (0..1) of the distance to the centre of the topmost circle that covers (u, v). */
function waveRatio(u: number, v: number, R: number): number {
  const step = R / 2;
  const r0 = Math.floor(v / step);
  for (let r = r0 + 3; r >= r0 - 2; r--) {
    const off = r & 1 ? R : 0;
    const cu = (Math.floor((u - off) / (2 * R)) + 0.5) * 2 * R + off;
    const d = Math.hypot(u - cu, v - r * step);
    if (d < R) return d / R;
  }
  return 1;
}

function planar(p: THREE.Vector3, n: THREE.Vector3): [number, number] {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  if (ax >= ay && ax >= az) return [p.z, p.y];
  if (ay >= az) return [p.x, p.z];
  return [p.x, p.y];
}

const WAVES = ["#2e5499", "#223f80", "#2e5499", "#1d366f"];

/** Indigo waves with ukiyo-e bokashi (soft gradation) to pale blue underneath and a lighter back. */
function indigo(p: THREE.Vector3, n: THREE.Vector3, R = 0.05): C {
  const [u, v] = planar(p, n);
  const r = waveRatio(u, v, R);
  let c: C = r > 0.9 ? "#7fa9d0" : WAVES[Math.min(3, Math.floor((r / 0.9) * 4))];
  const k = smoothstep(-0.25, -0.95, n.y);
  if (k > 0) c = mix(c, "#9cc0de", k * 0.75);
  const top = smoothstep(0.65, 1, n.y);
  if (top > 0) c = mix(c, "#4a73b8", top * 0.35);
  return c;
}

const BODY = paint((p, n) => {
  const wob = 0.04 * Math.sin(p.y * 14 + 1.3) + 0.015 * Math.sin(p.y * 37 + p.x * 11);
  const z0 = -0.6 + wob;
  const z1 = 0.1 + wob * 0.7;
  const d = Math.min(p.z - z0, z1 - p.z);
  const high = n.y > -0.3 + 0.12 * Math.sin(p.z * 18);
  if (high && d > 0) {
    if (d < 0.008) return INK;
    if (d < 0.016) return VERM;
    return mix(CREAM, PAPER, noise(p, 0.07, 3) * 0.8);
  }
  let c = indigo(p, n);
  if (high && d > -0.1) c = mix(c, "#a9c8e0", smoothstep(-0.1, 0, d) * 0.55);
  return c;
});

const NECKP = paint((p, n) => indigo(p, n, 0.05));
const HEADP = paint((p, n) => indigo(p, n, 0.04));
const TAILP = paint((p, n) => indigo(p, n, 0.035));

const TRUNKP = paint((_p, n, s) => {
  const t = s[0];
  if (t > 0.94) return VERM;
  if (t > 0.91) return INK;
  const k = t * 18;
  const f = k - Math.floor(k);
  const base = n.y < -0.2 ? "#8fb5d4" : "#2c4f93";
  return f < 0.14 ? "#162d5c" : base;
});

const LEGP = paint((p, n, s) => {
  const edge = 0.215 + 0.022 * Math.sin((s[1] * Math.PI) / 30);
  if (p.y < edge - 0.012) return mix(CREAM, PAPER, noise(p, 0.05, 5) * 0.6);
  if (p.y < edge) return INK;
  return indigo(p, n, 0.045);
});

const PAWP = paint((p) => mix(CREAM, PAPER, noise(p, 0.04, 4) * 0.6));
const ROPEP = paint((_p, _n, s) => {
  const k = (((s[0] * 70 + s[1] / 45) % 1) + 1) % 1;
  return k < 0.5 ? ROPE : ROPE2;
});

// ------------------------------------------------------------------------------------------------
// Textures (all SVG, woodblock inks with sumi outlines)

const EYE = svg(
  `<svg viewBox="0 0 80 56" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 34 Q22 -2 46 2 Q72 4 79 28" fill="none" stroke="${VERM}" stroke-width="7" stroke-linecap="round"/>
  <path d="M4 36 Q22 8 46 9 Q68 11 76 30 Q58 50 34 50 Q14 50 4 36Z" fill="${IVORY}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="46" cy="30" r="15" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="46" cy="30" rx="5" ry="12" fill="${INK}"/>
  <circle cx="41" cy="24" r="3.4" fill="#ffffff"/>
</svg>`,
  { size: 256 },
);

const KUMA = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M98 20 Q60 20 4 4 Q52 32 98 32Z" fill="${VERM}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M98 36 Q60 40 8 52 Q58 24 98 28Z" fill="${VERM}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M98 26 Q64 14 20 -2 Q60 22 98 24Z" fill="${INDIGO}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
</svg>`,
  { size: 256 },
);

const MOON = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="29" fill="${DEEP}" stroke="${GOLD}" stroke-width="5"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="${INK}" stroke-width="1.5"/>
  <path d="M40 14 A19 19 0 1 0 46 42 A15 15 0 1 1 40 14Z" fill="${IVORY}"/>
  <circle cx="46" cy="22" r="2.2" fill="${GOLD}"/><circle cx="50" cy="32" r="1.6" fill="${GOLD}"/><circle cx="42" cy="46" r="1.8" fill="${GOLD}"/>
</svg>`,
  { size: 192 },
);

const SEAL = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="36" height="36" rx="3" fill="${VERM}"/>
  <path d="M10 12H30 M20 8V32 M10 22H30 M12 31 L20 25 L28 31" stroke="${IVORY}" stroke-width="3.2" fill="none" stroke-linecap="square"/>
</svg>`,
  { size: 128 },
);

const SWIRL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="${VERM}" stroke="${INK}" stroke-width="3"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="${GOLD}" stroke-width="2"/>
  <path d="M50 50 a6 6 0 0 1 12 0 a12 12 0 0 1 -24 0 a18 18 0 0 1 36 0 a24 24 0 0 1 -48 0 a30 30 0 0 1 60 0" fill="none" stroke="${IVORY}" stroke-width="5" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const CLOUD = svg(
  `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 62 Q-2 42 20 38 Q22 14 46 18 Q60 2 80 20 Q106 14 106 42 Q122 48 108 64 Q60 74 10 62Z" fill="${CREAM}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 56 Q60 66 102 56" fill="none" stroke="${VERM}" stroke-width="5" stroke-linecap="round"/>
  <path d="M30 40 Q36 28 46 34 Q52 40 44 44 M64 30 Q74 22 82 32 Q84 40 76 40 M88 46 Q96 40 100 46" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const maneTex = (base: string, tip: string, hi: string) =>
  svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="${base}"/><stop offset="0.55" stop-color="${base}"/>
    <stop offset="0.56" stop-color="${tip}"/><stop offset="1" stop-color="${tip}"/></linearGradient></defs>
  <path d="M30 94 C6 82 4 52 24 38 C36 30 34 18 26 5 C52 12 62 40 50 60 C42 72 46 84 30 94Z" fill="url(#g)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M30 84 C16 74 16 54 28 46 C40 38 42 26 38 18" fill="none" stroke="${hi}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 70 C28 64 30 58 36 55" fill="none" stroke="${hi}" stroke-width="3" stroke-linecap="round"/>
</svg>`,
    { size: 192 },
  );
const MANE_A = maneTex(INDIGO, VERM, PALEBLUE);
const MANE_B = maneTex("#2e5499", GOLD, IVORY);

const FLAME = svg(
  `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="${GOLD}"/><stop offset="0.5" stop-color="${GOLD}"/>
    <stop offset="0.51" stop-color="${VERM}"/><stop offset="1" stop-color="${VERM}"/></linearGradient></defs>
  <path d="M24 94 C6 80 8 56 20 40 C14 30 18 14 26 3 C28 22 40 30 38 50 C46 62 40 84 24 94Z" fill="url(#f)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M24 84 C16 74 18 60 24 52 C28 60 32 68 30 78" fill="${IVORY}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
</svg>`,
  { size: 192 },
);

const SHIDE = svg(
  `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="12,1 28,1 28,20 36,32 26,32 26,52 34,64 24,64 24,84 30,98 14,98 14,78 8,66 18,66 18,46 10,34 20,34 12,20" fill="${IVORY}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
</svg>`,
  { size: 160 },
);

const rays = (() => {
  let s = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const a1 = a - 0.09;
    const a2 = a + 0.09;
    const r0 = 38;
    const r1 = i % 2 ? 46 : 49;
    const P = (r: number, t: number) => `${(50 + r * Math.cos(t)).toFixed(1)} ${(50 + r * Math.sin(t)).toFixed(1)}`;
    s += `<path d="M${P(r0, a1)} L${P(r1, a)} L${P(r0, a2)}Z" fill="${i % 2 ? GOLD : "#fff2b0"}"/>`;
  }
  return s;
})();
const HALO = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="34" fill="none" stroke="#fff2b0" stroke-width="4"/>${rays}
</svg>`,
  { size: 256 },
);

// ------------------------------------------------------------------------------------------------
const prof = (keys: number[][]) => (t: number): [number, number] => {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1];
      const c = keys[i];
      const k = (t - a[0]) / (c[0] - a[0]);
      const e = k * k * (3 - 2 * k);
      return [a[1] + (c[1] - a[1]) * e, a[2] + (c[2] - a[2]) * e];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
};

export default function build() {
  const b = createBuilder({ name: "baku", paintSize: 2048 });
  const rand = rng(21);

  const ell = (bone: any, at: any, radii: [number, number, number], color: any, extra: any = {}) =>
    b.part(new THREE.SphereGeometry(1, 10, 7), color, { bone, at, scale: radii, flat: true, ...extra });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.76, -0.45] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.76, -0.45],
      [0, 0.78, -0.15],
      [0, 0.78, 0.15],
      [0, 0.76, 0.5],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.78, 0.5],
      [0, 0.9, 0.68],
      [0, 0.98, 0.85],
      [0, 0.98, 0.95],
    ]),
    { parent: spine, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: neck.at(1), dir: [0, -0.12, 1], role: "head" });
  const HL = (l: number, u: number, f: number) => head.local({ left: l, up: u, forward: f });

  // ---------------------------------------------------------------- body
  const bodyPath = catmull([
    [0, 0.76, -0.85],
    [0, 0.76, -0.45],
    [0, 0.78, -0.05],
    [0, 0.76, 0.35],
    [0, 0.74, 0.6],
  ]);
  const bodyR = prof([
    [0, 0.26, 0.28],
    [0.2, 0.35, 0.34],
    [0.55, 0.37, 0.36],
    [0.85, 0.33, 0.34],
    [1, 0.27, 0.29],
  ]);
  const body = b.sweep(bodyPath, bodyR, { bone: [spine, hips], color: BODY });
  for (const s of [1, -1]) {
    ell(hips, [s * 0.24, 0.68, -0.5], [0.17, 0.25, 0.27], BODY);
    ell(chest, [s * 0.24, 0.68, 0.36], [0.16, 0.24, 0.22], BODY);
  }

  // flank motifs
  const skinBody = b.surface(body);
  for (const s of [1, -1]) {
    const cloudHit = skinBody.nearest([s * 0.6, 0.9, 0.32]);
    b.decal(body, CLOUD, { at: cloudHit, size: [0.36, 0.24], segments: 12, lift: 0.004, mirror: s < 0 });
    const swirlHit = skinBody.nearest([s * 0.6, 0.86, -0.2]);
    b.decal(body, SWIRL, { at: swirlHit, size: [0.3, 0.3], segments: 12, lift: 0.004 });
  }
  b.decal(body, SEAL, { at: skinBody.nearest([0.1, 1.0, -1.1]), size: [0.11, 0.11], segments: 6, lift: 0.004 });

  // ---------------------------------------------------------------- neck & mane
  const neckTube = b.sweep(neck, [0.28, 0.25, 0.2], { color: NECKP });
  const maneFrames: any[] = [];
  for (let i = 0; i < 9; i++) {
    const t = 0.04 + i * 0.1;
    for (const a of [0, 38, -38]) maneFrames.push(neckTube.at(t, a));
  }
  b.cards(maneFrames, [MANE_A, MANE_B, MANE_A], {
    size: [0.15, 0.22],
    lean: 55,
    bend: 25,
    flow: [0, 0.15, -1],
    vary: 0.25,
    spin: 12,
    rng: rng(5),
    sink: 0.15,
  });
  const backFrames: any[] = [];
  for (let i = 0; i < 13; i++) {
    const t = 0.16 + i * 0.065;
    backFrames.push(body.at(t, 0));
    if (i % 2 === 0) {
      backFrames.push(body.at(t, 34));
      backFrames.push(body.at(t, -34));
    }
  }
  b.cards(backFrames, [MANE_A, MANE_B], {
    size: [0.13, 0.2],
    lean: 62,
    bend: 25,
    flow: [0, 0.1, -1],
    vary: 0.25,
    spin: 14,
    rng: rng(6),
    sink: 0.15,
  });

  // shimenawa collar with shide and bell
  const neckMid = neck.joints[1];
  const loop = b.surface(neckTube).loop(neckMid, { lift: 0.018 });
  b.sweep(loop, 0.034, { color: ROPEP });
  const spots: any[] = [];
  b.along(loop, 9, (at: any) => {
    spots.push(at);
  });
  const shideFrames = [1, 2, 3, 5, 6, 7].map((i) => frame(spots[i], [0, 1, 0]));
  b.cards(shideFrames, SHIDE, { size: [0.07, 0.22], lean: 180, flow: [0, 0, 1], sink: 0 });
  spots.forEach((sp, i) => {
    if (i !== 4) b.stick(new THREE.SphereGeometry(0.02, 6, 4), GOLD, sp, { embed: 0.3 });
  });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), GOLD, { bone: neckMid, at: offset(spots[4], [0, -1, 0], 0.05) });
  b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), INK, {
    bone: neckMid,
    at: offset(spots[4], [0, -1, 0], 0.03),
  });

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), HEADP, {
    bone: head,
    at: HL(0, 0.02, 0.1),
    scale: [0.19, 0.2, 0.25],
    flat: true,
  });
  ell(head, HL(0, -0.05, 0.3), [0.115, 0.1, 0.15], HEADP);
  const skin = b.surface(skull);
  const hit = (az: number, el: number) => skin.around(skull.at).at(az, el)!;

  // trunk
  const trunk = b.chain(
    "trunk",
    catmull([HL(0, 0, 0.36), HL(0, -0.1, 0.47), HL(0, -0.23, 0.52), HL(0, -0.32, 0.6), HL(0, -0.31, 0.7), HL(0, -0.22, 0.75)]),
    { parent: head, role: "tentacle" },
  );
  b.sweep(trunk, [0.1, 0.078, 0.058, 0.046, 0.04, 0.046], { color: TRUNKP });
  const tipF = trunk.at(1);
  for (const s of [1, -1])
    b.stick(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), INK, tipF.moved([s * 0.016, 0.036, 0]), { embed: 0.2 });
  const trunkEnd = trunk.joints[trunk.joints.length - 1];

  // jaw
  const jaw = b.joint("jaw", { parent: head, at: HL(0, -0.12, 0.0), aim: HL(0, -0.17, 0.36), role: "jaw" });
  ell(jaw, HL(0, -0.2, 0.2), [0.1, 0.05, 0.18], HEADP);
  ell(jaw, HL(0, -0.16, 0.2), [0.07, 0.03, 0.14], TONGUE);
  ell(head, HL(0, -0.13, 0.22), [0.08, 0.02, 0.14], MOUTH);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.spike(HL(s * 0.075, -0.162, 0.1 + 0.06 * i), [0, 1, 0], 0.035, 0.011, { color: IVORY, bone: jaw });
      b.spike(HL(s * 0.08, -0.115, 0.1 + 0.06 * i), [0, -1, 0], 0.032, 0.011, { color: IVORY, bone: head });
    }
    // tusks
    b.sweep(bezier(HL(s * 0.09, -0.11, 0.28), HL(s * 0.16, -0.2, 0.36), HL(s * 0.14, -0.06, 0.52)), [0.034, 0], {
      color: IVORY,
      bone: head,
      bands: [
        [0.2, GOLD],
        [1, IVORY],
      ],
      caps: { start: "flat", end: "point" },
      sides: 6,
    });
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.sweep(
        bezier(HL(s * 0.08, -0.05 - k * 0.02, 0.36), HL(s * (0.3 + 0.05 * k), -0.08 - k * 0.05, 0.44), HL(s * (0.5 + 0.04 * k), -0.2 - k * 0.1, 0.24)),
        [0.007, 0.0015],
        { color: CREAM, bone: head, sides: 4 },
      );
    }
  }

  // ears
  const earOutline: any[] = [
    [0, 0],
    [0.05, 0.03],
    [0.075, 0.1],
    [0.05, 0.17],
    [-0.02, 0.19],
    [-0.06, 0.12],
    [-0.05, 0.04],
  ];
  const scaled = (k: number, dy: number) => earOutline.map(([x, y]) => [x * k, y * k + dy]);
  for (const s of [1, -1]) {
    const at = HL(s * 0.13, 0.15, -0.03);
    b.extrude(earOutline, { at, x: [0, 0, 1], y: [s * 0.35, 1, 0], thickness: 0.026, bevel: 0.006, smoothing: 2, color: CREAM, bone: head });
    b.extrude(scaled(0.68, 0.025) as any, {
      at,
      x: [0, 0, 1],
      y: [s * 0.35, 1, 0],
      thickness: 0.036,
      bevel: 0.005,
      smoothing: 2,
      color: VERM,
      bone: head,
    });
  }

  // face painting: eyes, kumadori, brows, forehead moon
  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: hit(s * 48, 14), size: [0.13, 0.092], segments: 12, lift: 0.005, mirror: s > 0 });
    b.decal(skull, KUMA, { at: hit(s * 84, 6), size: [0.22, 0.13], segments: 12, lift: 0.002, mirror: s > 0, roll: s * -8 });
    const az = [20, 36, 52, 68];
    const el = [46, 49, 45, 38];
    const pts = az.map((a, i) => {
      const h = hit(s * a, el[i]);
      return offset(h, h, 0.012);
    });
    b.sweep(catmull(pts), [0.032, 0.008], { color: VERM, bone: head, caps: { start: "round", end: "point" }, sides: 6 });
  }
  b.decal(skull, MOON, { at: hit(0, 62), size: [0.11, 0.11], segments: 8, lift: 0.003 });

  // cheek whorls, brow crest and chin tuft
  const faceFrames: any[] = [];
  for (const s of [1, -1]) {
    for (const [a, e] of [[100, -8], [115, -16], [128, -24], [96, 18], [112, 8]]) faceFrames.push(hit(s * a, e));
  }
  for (const [a, e] of [[0, 78], [25, 74], [-25, 74], [0, 66], [150, 70], [180, 74], [-150, 70]]) faceFrames.push(hit(a, e));
  b.cards(faceFrames, [MANE_A, MANE_B, MANE_A], {
    size: [0.1, 0.15],
    lean: 62,
    bend: 25,
    flow: [0, 0.05, -1],
    vary: 0.2,
    spin: 14,
    rng: rng(8),
    sink: 0.15,
  });
  const jawSkin = b.surface(b.root);
  void jawSkin;

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const mk = (name: string, pts: THREE.Vector3[], parent: any, names: string[], radii: number[], flameIdx: number, toeZ: number, footX: number, footZ: number) => {
      const ch = b.chain(name + side, pts, { parent, names, role: "leg", contact: [footX, 0, footZ] });
      const tube = b.sweep(ch, radii, { color: LEGP });
      // cuff with studs
      const at = ch.at(0.9);
      const cuff = b.surface(tube).loop(at, { lift: 0.012 });
      b.sweep(cuff, 0.02, { color: VERM });
      const studs = b.surface(tube).loop(at, { lift: 0.026 });
      b.along(studs, 8, (p: any) => {
        b.stick(new THREE.SphereGeometry(0.014, 6, 4), GOLD, p, { embed: 0.4 });
      });
      // flame ruff at the bend
      const fr = b.ring(ch.joints[flameIdx], { count: 6, radius: 0.075 }).items;
      b.cards(fr, FLAME, { size: [0.1, 0.21], lean: 60, bend: 15, flow: [0, 1, 0], vary: 0.2, rng: rng(30 + flameIdx), sink: 0.1 });
      // tiger paw
      const paw = ch.tip!;
      const px = footX;
      const pz = footZ;
      ell(paw, [px, 0.065, pz + 0.04], [0.095, 0.065, 0.125], PAWP);
      for (let i = 0; i < 4; i++) {
        const tx = px + (i - 1.5) * 0.05;
        const tz = pz + toeZ - Math.abs(i - 1.5) * 0.012;
        ell(paw, [tx, 0.04, tz], [0.03, 0.032, 0.04], PAWP);
        b.spike([tx, 0.034, tz + 0.03], [0, -0.3, 1], 0.055, 0.014, { color: GOLD, bone: paw, sides: 5 });
      }
      return ch;
    };
    const front = limb([s * 0.21, 0.6, 0.38], [s * 0.21, 0.12, 0.42], [0.22, 0.2, 0.14], [[0, 0, -1], [0, 0, 1]]);
    mk("leg", front, chest, [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`], [0.12, 0.095, 0.075, 0.066], 1, 0.13, s * 0.21, 0.42);
    const hind = limb([s * 0.21, 0.62, -0.55], [s * 0.21, 0.12, -0.5], [0.28, 0.26, 0.16], [[0, 0, 1], [0, 0, -1]]);
    mk("legH", hind, hips, [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`], [0.13, 0.1, 0.075, 0.066], 2, 0.13, s * 0.21, -0.5);
  }

  // ---------------------------------------------------------------- ox tail with flame brush
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.76, -0.78],
      [0, 0.82, -1.0],
      [0, 0.72, -1.22],
      [0, 0.5, -1.32],
      [0, 0.32, -1.28],
    ]),
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, [0.09, 0.065, 0.048, 0.04, 0.036], { color: TAILP });
  const tailTip = tail.at(1);
  b.ring(tailTip, { count: 8, radius: 0.02, tilt: 35 }, (it: any) => {
    const ctrl = offset(it, it, 0.1);
    const tip = offset(ctrl, [0, -1, 0.15], 0.17);
    b.sweep(bezier(it, ctrl, tip), [0.045, 0], {
      color: INDIGO,
      bands: [
        [0.5, INDIGO],
        [1, it.i % 2 ? VERM : GOLD],
      ],
      caps: { start: "round", end: "point" },
      sides: 5,
    });
  });
  b.cards(b.ring(tailTip, { count: 5, radius: 0.025, tilt: 30 }).items, [FLAME, MANE_A], {
    size: [0.1, 0.22],
    lean: 45,
    bend: 25,
    flow: [0, -1, 0.2],
    rng: rng(9),
    vary: 0.2,
    sink: 0.1,
  });

  // ---------------------------------------------------------------- the dream drawn through the trunk
  const tipPt = tipF.at.clone();
  const centre = tipPt.clone().add(new THREE.Vector3(0, 0, 0.1));
  const wisp = spiral(centre, tipPt, [0, 1, 0], { turns: 1.6, r1: 0.035, pitch: 0.15 });
  glow(b.sweep(wisp, [0.02, 0.004], { color: WISP, bone: trunkEnd, caps: { end: "point" }, sides: 5 }), 1.2);
  const orbPos = wisp.at(1);
  glow(b.part(new THREE.SphereGeometry(0.055, 10, 7), WISP, { bone: trunkEnd, at: orbPos, flat: true }), 1.4);
  for (const dir of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
        bone: trunkEnd,
        at: orbPos,
        dir: [0, 0, dir],
        axis: "z",
        texture: HALO,
      }),
      1,
    );
  [[0.12, 0.08, 0.02], [-0.1, 0.13, 0.05], [0.05, 0.17, -0.1]].forEach(([dx, dy, dz], i) => {
    glow(
      b.part(new THREE.OctahedronGeometry(0.02 - i * 0.003), GOLD, {
        bone: trunkEnd,
        at: [orbPos.x + dx, orbPos.y + dy, orbPos.z + dz],
      }),
      1.3,
    );
  });

  // open the mouth a little: neutral rest pose with a visible upper and lower jaw
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  void rand;
  return b.root;
}
