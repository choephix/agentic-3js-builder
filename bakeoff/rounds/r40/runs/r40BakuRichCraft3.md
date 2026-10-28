```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  catmull,
  spiral,
  limb,
  paint,
  gradient,
  countershade,
  grain,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baku",
  description:
    "The dream-eating tapir spirit in ukiyo-e woodblock style: indigo coat with a seigaiha-wave saddle, elephant trunk, tiger paws, ox tail, flame mane, and a glowing dream bubble drawn in by the trunk.",
};

// ---------------------------------------------------------------- palette (woodblock inks)
const INK = "#14111a";
const NAVY = "#14275a";
const INDIGO = "#27408a";
const CREAM = "#f3e7c6";
const IVORY = "#fff8e4";
const VERM = "#d93a1f";
const VERM_D = "#a82414";
const GOLD = "#e8ae37";
const WAVE = "#6f9bc9";
const PINK = "#e0788a";
const JADE = "#2f8f7a";
const SOCK = "#efcf86";

type V = [number, number, number];
type Pal = [string, string, string, string];
type Outline = Array<[number, number] | [number, number, "sharp"]>;

const FIRE: Pal = ["#1b2a5f", VERM_D, VERM, GOLD];
const WAVEP: Pal = ["#14275a", "#2f5ea0", "#86b0dc", "#f8f3e4"];

const ramp = (keys: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
};

// seigaiha: overlapping wave scales; returns 0..1 distance from the centre of the visible scale
function seigaiha(u: number, v: number, r: number) {
  const h = r / 2;
  const j0 = Math.ceil((v - r) / h);
  const j1 = Math.floor((v + r) / h);
  for (let j = j0; j <= j1; j++) {
    const off = (((j % 2) + 2) % 2) * (r / 2);
    const i = Math.round((u - off) / r);
    const cx = off + i * r;
    const d = Math.hypot(u - cx, v - j * h) / r;
    if (d <= 1) return d;
  }
  return 1;
}

// ---------------------------------------------------------------- paints
const BASE = countershade(grain("#15275a", "#2d4a9a", { size: 0.022, axis: "z", seed: 2 }), "#0e1836", {
  level: -0.15,
  soft: 0.45,
});

const coat = paint((p, n) => {
  const z0 = -0.38 + 0.03 * Math.sin(p.y * 13 + 0.7) + 0.02 * Math.sin(p.y * 29);
  const z1 = 0.26 + 0.03 * Math.sin(p.y * 11 + 2);
  const dz = Math.min(p.z - z0, z1 - p.z);
  if (dz < -0.016) return BASE;
  if (dz < 0) return INK;
  if (dz < 0.014) return VERM;
  if (dz < 0.022) return GOLD;
  const d = seigaiha(p.z, p.y + 0.5 * Math.abs(p.x), 0.075);
  const shade = n.y < -0.3 ? "#e3d3a8" : CREAM;
  if (d > 0.88 || (d > 0.58 && d < 0.66) || (d > 0.3 && d < 0.37) || d < 0.1) return WAVE;
  return shade;
});

const legPaint = paint((p) => {
  const lim = 0.3 + 0.035 * Math.sin(p.x * 70 + p.z * 50);
  if (p.y < lim) return (p.y * 22) % 1 < 0.28 ? INK : SOCK;
  return BASE;
});

const muzzlePaint = gradient(BASE, CREAM, [0, 1.15, 1.26], [0, 1.1, 1.42]);

const trunkPaint = paint((_p, n, s) => {
  if (s[0] > 0.93) return PINK;
  if ((s[0] * 18) % 1 < 0.14) return "#b79f78";
  return n.y > 0.6 ? "#e2d4ae" : CREAM;
});

const inked = (thick: THREE.Vector3, fill: string) =>
  paint((_p, n) => (Math.abs(n.dot(thick)) < 0.5 ? INK : fill));

const thickOf = (x: V, y: V) => new THREE.Vector3(...x).cross(new THREE.Vector3(...y)).normalize();

const scaleAbout = (o: Array<[number, number]>, k: number, cy: number): Array<[number, number]> =>
  o.map(([x, y]) => [x * k, cy + (y - cy) * k] as [number, number]);

// ---------------------------------------------------------------- textures
function makeTextures() {
  const EYE = svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 44 Q28 3 62 7 Q92 12 98 46 Q68 64 36 59 Q12 55 3 44Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M11 43 Q32 14 60 17 Q84 20 90 43 Q66 54 38 51 Q19 48 11 43Z" fill="${IVORY}"/>
      <circle cx="58" cy="35" r="17" fill="${GOLD}"/>
      <path d="M41 35 A17 17 0 0 1 75 35Z" fill="${VERM}"/>
      <ellipse cx="58" cy="36" rx="5.5" ry="13" fill="${INK}"/>
      <circle cx="58" cy="35" r="17" fill="none" stroke="${INK}" stroke-width="3"/>
      <circle cx="51" cy="29" r="4.2" fill="#ffffff"/>
      <path d="M7 38 Q30 0 66 4" stroke="${VERM}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M12 41 Q34 10 62 13" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const SCROLL = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="${INK}" stroke-width="14">
        <path d="M25 78 C8 52 28 20 56 22 C84 24 88 60 62 66 C42 70 36 46 52 42 C62 40 66 52 58 54"/>
        <path d="M25 78 C34 90 52 90 66 82"/>
        <path d="M70 20 C80 8 94 14 90 28"/>
      </g>
      <g stroke="${VERM}" stroke-width="8.5">
        <path d="M25 78 C8 52 28 20 56 22 C84 24 88 60 62 66 C42 70 36 46 52 42 C62 40 66 52 58 54"/>
        <path d="M25 78 C34 90 52 90 66 82"/>
        <path d="M70 20 C80 8 94 14 90 28"/>
      </g>
      <g stroke="${GOLD}" stroke-width="2.6">
        <path d="M24 74 C12 52 30 26 56 26 C78 28 82 56 62 62"/>
        <path d="M70 20 C79 12 88 16 87 25"/>
      </g>
      <circle cx="58" cy="54" r="3.5" fill="${GOLD}" stroke="none"/>
    </svg>`,
    { size: 256 },
  );
  const TOMOE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="${GOLD}" stroke="${INK}" stroke-width="5"/>
      <circle cx="50" cy="50" r="35" fill="${VERM}" stroke="${INK}" stroke-width="2.5"/>
      ${[0, 120, 240]
        .map(
          (a) =>
            `<g transform="rotate(${a} 50 50)"><circle cx="50" cy="34" r="9" fill="${IVORY}" stroke="${INK}" stroke-width="2"/><path d="M50 25 C68 25 76 44 58 56 C64 46 62 38 50 43Z" fill="${IVORY}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></g>`,
        )
        .join("")}
    </svg>`,
    { size: 192 },
  );
  const STRIPES = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" fill="${INK}">
      <path d="M2 6 Q30 0 58 14 Q30 8 2 11Z"/>
      <path d="M6 18 Q32 14 56 27 Q32 21 6 23Z"/>
      <path d="M12 29 Q34 28 50 37 Q32 33 12 33Z"/>
    </svg>`,
    { size: 128 },
  );
  const flame = (stops: [string, string, string]) =>
    svg(
      `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="${stops[0]}"/><stop offset="0.4" stop-color="${stops[1]}"/><stop offset="1" stop-color="${stops[2]}"/>
        </linearGradient></defs>
        <path d="M6 80 C2 50 14 24 30 3 C30 30 40 52 34 80Z" fill="url(#g)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M17 76 C16 58 21 44 27 26" stroke="${IVORY}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M23 78 C22 64 25 54 29 44" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      </svg>`,
      { size: 128 },
    );
  const FLAME_A = flame(["#1b2a5f", VERM, GOLD]);
  const FLAME_B = flame(["#14275a", "#3f6db0", "#f8f3e4"]);
  const DREAM = svg(
    `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
      <g fill="${INK}" stroke="${INK}" stroke-width="8">
        <circle cx="30" cy="58" r="20"/><circle cx="52" cy="42" r="24"/><circle cx="76" cy="56" r="20"/>
        <circle cx="40" cy="68" r="16"/><circle cx="64" cy="70" r="16"/>
      </g>
      <g fill="#f4ecff">
        <circle cx="30" cy="58" r="20"/><circle cx="52" cy="42" r="24"/><circle cx="76" cy="56" r="20"/>
        <circle cx="40" cy="68" r="16"/><circle cx="64" cy="70" r="16"/>
      </g>
      <path d="M44 24 A19 19 0 1 0 66 54 A15 15 0 1 1 44 24Z" fill="${GOLD}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M72 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3Z" fill="${VERM}" stroke="${INK}" stroke-width="1.6"/>
      <path d="M22 60 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2Z" fill="${VERM}"/>
      <path d="M30 76 q8 -6 16 0 q8 6 16 0 q8 -6 16 0" stroke="${WAVE}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  return { EYE, SCROLL, TOMOE, STRIPES, FLAME_A, FLAME_B, DREAM };
}

// ---------------------------------------------------------------- model
export default function build() {
  const b = createBuilder({ name: "baku" });
  const T = makeTextures();

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.97, -0.62], role: "spine" });
  const spineC = b.chain(
    "spine",
    catmull([
      [0, 0.97, -0.5],
      [0, 0.95, -0.05],
      [0, 0.97, 0.35],
      [0, 1.0, 0.68],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.0, 0.68],
      [0, 1.1, 0.9],
      [0, 1.17, 1.08],
    ]),
    { parent: spineC.tip!, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.17, 1.08], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.06, 1.2], aim: [0, 1.0, 1.45], role: "jaw" });
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 1.12, 1.46],
      [0, 1.1, 1.68],
      [0, 1.0, 1.86],
      [0, 0.9, 1.95],
      [0, 0.86, 2.07],
    ]),
    { parent: head, role: "tentacle" },
  );
  const tailC = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.72],
      [0, 0.84, -0.92],
      [0, 0.66, -1.04],
      [0, 0.46, -1.08],
      [0, 0.36, -1.08],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---------------- flame blades (hero mane pieces)
  const bladeCache = new Map<string, ReturnType<typeof paint>>();
  const blade = (o: { at: any; dir: V; hint: V; L: number; w: number; pal?: Pal; t?: number; bone?: any }) => {
    const d = new THREE.Vector3(...o.dir).normalize();
    const hn = new THREE.Vector3(...o.hint);
    const perp = hn.sub(d.clone().multiplyScalar(hn.dot(d))).normalize();
    const thick = d.clone().cross(perp).normalize();
    const pal = o.pal ?? FIRE;
    const { L, w } = o;
    const key = `${pal[1]}${L.toFixed(2)}${w.toFixed(2)}${Math.round(thick.x * 4)},${Math.round(thick.y * 4)},${Math.round(thick.z * 4)}`;
    let col = bladeCache.get(key);
    if (!col) {
      col = paint((_p, n, s) => {
        if (Math.abs(n.dot(thick)) < 0.5) return INK;
        const t = s[0] / L + 0.06 * Math.sin((s[1] / w) * 7);
        return t < 0.18 ? pal[0] : t < 0.45 ? pal[1] : t < 0.75 ? pal[2] : pal[3];
      });
      bladeCache.set(key, col);
    }
    const outline: Outline = [
      [0, -w * 0.45],
      [L * 0.35, -w * 0.6],
      [L * 0.75, -w * 0.3],
      [L, w * 0.25, "sharp"],
      [L * 0.78, w * 0.55],
      [L * 0.4, w * 0.75],
      [0, w * 0.45],
    ];
    return b.extrude(outline, {
      at: o.at,
      x: d.toArray(),
      y: perp.toArray(),
      thickness: o.t ?? 0.018,
      smoothing: 1,
      color: col,
      ...(o.bone ? { bone: o.bone } : {}),
    });
  };

  // ---------------- body, neck, tail
  const rx = ramp([0.2, 0.28, 0.31, 0.31, 0.3, 0.24, 0.14]);
  const ry = ramp([0.24, 0.34, 0.37, 0.37, 0.36, 0.3, 0.18]);
  const body = b.sweep(
    catmull([
      [0, 0.93, -0.84],
      [0, 0.97, -0.5],
      [0, 0.95, -0.05],
      [0, 0.97, 0.35],
      [0, 1.0, 0.68],
      [0, 1.02, 0.84],
    ]),
    (t) => [rx(t), ry(t)],
    { bone: [hips, spineC], color: coat, sides: 10, shift: [0, -0.06] },
  );
  const neckS = b.sweep(neck, (t) => 0.19 - 0.04 * t, { color: BASE, sides: 10 });
  b.sweep(tailC, [0.065, 0.05, 0.04, 0.03, 0.025], { color: BASE, sides: 8 });

  // ---------------- head
  const SK: V = [0, 1.19, 1.17];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), BASE, { bone: head, at: SK, scale: [0.18, 0.17, 0.2] });
  b.frustumBox([0, 1.17, 1.2], [0, 1.1, 1.5], [0.24, 0.2], [0.14, 0.13], { bone: head, color: muzzlePaint });
  b.frustumBox([0, 1.035, 1.2], [0, 1.0, 1.44], [0.17, 0.08], [0.1, 0.06], { bone: jaw, color: CREAM });
  b.part(new THREE.BoxGeometry(0.08, 0.015, 0.2), "#c8453f", { bone: jaw, at: [0, 1.03, 1.31] });
  // teeth
  for (const s of [1, -1])
    for (const [x, y, z] of [
      [0.045, 1.045, 1.3],
      [0.038, 1.04, 1.37],
      [0.045, 1.048, 1.42],
    ]) {
      b.part(new THREE.ConeGeometry(0.01, 0.035, 5), IVORY, { bone: jaw, at: [s * x, y, z] });
      if (z < 1.4)
        b.part(new THREE.ConeGeometry(0.01, 0.035, 5), IVORY, {
          bone: head,
          at: [s * x, y + 0.016, z],
          dir: [0, -1, 0],
        });
    }
  // trunk
  const trunkS = b.sweep(trunk, [0.08, 0.07, 0.055, 0.04, 0.03], { color: trunkPaint, sides: 8 });
  b.spike([0, 0.87, 2.08], [0, 0.5, 0.9], 0.075, 0.02, { color: CREAM, bone: trunk.joints[3] });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), INK, { bone: trunk.joints[3], at: [0.018, 0.842, 2.1] });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), INK, { bone: trunk.joints[3], at: [-0.018, 0.842, 2.1] });
  // ring wrinkle collar where trunk meets muzzle
  b.part(new THREE.TorusGeometry(0.082, 0.014, 5, 10), GOLD, {
    at: trunk.at(0.04),
    dir: trunk.at(0.04).tangent,
    axis: "z",
  });
  void trunkS;

  for (const s of [1, -1]) {
    // tusks and whiskers
    b.sweep(bezier([s * 0.07, 1.06, 1.38], [s * 0.15, 0.98, 1.48], [s * 0.14, 1.1, 1.6]), [0.028, 0.004], {
      bone: head,
      color: IVORY,
      caps: { start: "flat", end: "point" },
      sides: 6,
    });
    b.sweep(bezier([s * 0.09, 1.1, 1.43], [s * 0.3, 1.14, 1.5], [s * 0.46, 1.0, 1.3]), [0.009, 0.003], {
      bone: head,
      color: GOLD,
      caps: { end: "point" },
      sides: 5,
    });
    b.sweep(bezier([s * 0.08, 1.07, 1.42], [s * 0.28, 1.04, 1.46], [s * 0.4, 0.9, 1.28]), [0.008, 0.003], {
      bone: head,
      color: VERM,
      caps: { end: "point" },
      sides: 5,
    });
  }

  // eyes, forehead mon, cheek stripes
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(SK).at(s * 50, 12)!;
    glow(b.decal(skull, T.EYE, { at: eyeHit, size: [0.125, 0.088], mirror: s > 0 }), 0.4);
    const cheekHit = skin.around(SK).at(s * 82, -12)!;
    b.decal(skull, T.STRIPES, { at: cheekHit, size: [0.11, 0.075], mirror: s > 0 });
  }
  const foreHit = skin.around(SK).at(0, 52)!;
  b.decal(skull, T.TOMOE, { at: foreHit, size: [0.075, 0.075] });

  // ears
  const EAR: Array<[number, number]> = [
    [-0.05, 0],
    [0.05, 0],
    [0.09, 0.07],
    [0.095, 0.14],
    [0.05, 0.2],
    [-0.05, 0.2],
    [-0.095, 0.14],
    [-0.09, 0.07],
  ];
  for (const s of [1, -1]) {
    const E = s > 0 ? "L" : "R";
    const base: V = [s * 0.12, 1.3, 1.1];
    const earJ = b.joint(`ear${E}`, { parent: head, at: base, dir: [s * 0.5, 1, -0.15], role: "hinge" });
    const X: V = [1, 0, 0];
    const Y: V = [s * 0.5, 1, -0.15];
    const th = thickOf(X, Y);
    const outer = b.extrude(EAR, {
      at: base, x: X, y: Y, thickness: 0.024, bevel: 0.005, smoothing: 2, color: inked(th, CREAM), bone: earJ,
    });
    b.extrude(scaleAbout(EAR, 0.78, 0.1), {
      at: outer.local([0, 0, 0.015]), x: X, y: Y, thickness: 0.012, smoothing: 2, color: INDIGO, bone: earJ,
    });
    b.extrude(scaleAbout(EAR, 0.5, 0.1), {
      at: outer.local([0, 0, 0.026]), x: X, y: Y, thickness: 0.008, smoothing: 2, color: PINK, bone: earJ,
    });
    // brow flame
    blade({ at: [s * 0.05, 1.27, 1.31], dir: [s * 0.75, 0.1, -0.55], hint: [0, 1, 0.2], L: 0.1, w: 0.045, t: 0.016, bone: head });
  }

  // ---------------- mane: neck crest
  [0.1, 0.3, 0.5, 0.7, 0.9].forEach((t, i) => {
    const L = 0.36 - i * 0.02;
    blade({ at: neckS.at(t, 0), dir: [0, 0.5, -0.85], hint: [0, 1, 0], L, w: 0.16 });
    for (const s of [1, -1])
      blade({ at: neckS.at(t, s * 50), dir: [s * 0.45, 0.35, -0.85], hint: [0, 1, 0], L: L - 0.05, w: 0.13 });
  });
  // back crest, wave palette
  [0.25, 0.35, 0.45, 0.55, 0.65, 0.75].forEach((t) =>
    blade({ at: body.at(t, 0), dir: [0, 0.4, -0.9], hint: [0, 1, 0], L: 0.22, w: 0.11, pal: WAVEP }),
  );
  // lion ruff round the head
  b.ring(frame([0, 1.19, 1.12], [0, 0, 1]), { count: 12, radius: 0.15 }).items.forEach((it, i) => {
    if (i === 0) return;
    const out = it.axis;
    blade({
      at: it,
      dir: [out.x * 0.55, out.y * 0.55, out.z * 0.55 - 0.85],
      hint: [out.x, out.y, out.z],
      L: 0.3 - 0.05 * (i % 2),
      w: 0.14,
      pal: i % 3 === 0 ? WAVEP : FIRE,
      bone: head,
    });
  });
  // chest ruff
  [0.15, 0.3, 0.45].forEach((t) => {
    for (const s of [1, -1])
      blade({ at: neckS.at(t, 180 + s * 40), dir: [s * 0.3, -0.5, -0.7], hint: [0, 0, 1], L: 0.24, w: 0.12 });
  });
  // tail tuft
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const r: V = [Math.cos(a), 0, Math.sin(a)];
    blade({
      at: tailC.at(1),
      dir: [r[0] * 0.5, -1, r[2] * 0.5],
      hint: r,
      L: 0.26,
      w: 0.1,
      pal: k % 2 ? WAVEP : FIRE,
    });
  }
  // fur cards to fill the mane
  const neckHits = b.surface(neckS).scatter(36, { rng: rng(21), minDist: 0.05, filter: (h) => h.n.y > -0.1 });
  b.cards(neckHits, T.FLAME_A, { size: [0.07, 0.15], lean: 60, bend: 25, vary: 0.3, rng: rng(22) });
  const backHits = b.surface(body).scatter(30, {
    rng: rng(23), minDist: 0.07, filter: (h) => h.n.y > 0.5 && h.at.z > -0.4 && h.at.z < 0.7,
  });
  b.cards(backHits, T.FLAME_B, { size: [0.06, 0.12], lean: 65, bend: 25, vary: 0.3, rng: rng(24) });

  // ---------------- legs
  const paw = (x: number, z: number, bone: any) => {
    b.part(new THREE.SphereGeometry(1, 10, 8), SOCK, { bone, at: [x, 0.07, z + 0.045], scale: [0.095, 0.07, 0.12] });
    for (const dx of [-0.06, -0.02, 0.02, 0.06]) {
      b.part(new THREE.SphereGeometry(0.03, 6, 5), SOCK, { bone, at: [x + dx, 0.04, z + 0.155] });
      b.part(new THREE.ConeGeometry(0.011, 0.055, 5), IVORY, { bone, at: [x + dx, 0.034, z + 0.215], dir: [0, -0.35, 1] });
    }
  };
  const skinBody = b.surface(body);
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // front
    const fPts = limb([s * 0.21, 0.78, 0.5], [s * 0.23, 0.09, 0.54], [0.42, 0.38], [[0, 0, -1]]);
    const legF = b.chain(`legF${L}`, fPts, {
      parent: spineC.tip!, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "leg",
    });
    b.sweep(legF, [0.13, 0.105, 0.085, 0.075, 0.07], { color: legPaint, sides: 8 });
    paw(s * 0.23, 0.54, legF.tip!);
    b.part(new THREE.TorusGeometry(0.082, 0.013, 5, 12), GOLD, { at: legF.at(0.78), dir: [0, 1, 0], axis: "z" });
    [
      [s * 0.3, 0.1, -1],
      [s * 0.5, 0.4, -0.8],
      [s * 0.2, -0.2, -1],
    ].forEach((d, i) =>
      blade({ at: legF.joints[1], dir: d as V, hint: [0, 1, 0], L: 0.2 - i * 0.02, w: 0.1, pal: i === 1 ? WAVEP : FIRE }),
    );
    // hind
    const hPts = limb(
      [s * 0.21, 0.84, -0.5], [s * 0.24, 0.09, -0.55], [0.38, 0.36, 0.16],
      [[0, 0, 1], [0, 0, -1]],
    );
    const legH = b.chain(`legH${L}`, hPts, {
      parent: hips, names: [`hip${L}`, `knee${L}`, `hock${L}`, `foot${L}`], role: "leg",
    });
    b.sweep(legH, [0.17, 0.13, 0.095, 0.08, 0.07], { color: legPaint, sides: 8 });
    paw(s * 0.24, -0.55, legH.tip!);
    b.part(new THREE.TorusGeometry(0.085, 0.013, 5, 12), GOLD, { at: legH.at(0.84), dir: [0, 1, 0], axis: "z" });
    [
      [s * 0.2, 0.2, -1],
      [s * 0.4, -0.1, -1],
      [0, 0.5, -1],
    ].forEach((d, i) =>
      blade({ at: legH.joints[2], dir: d as V, hint: [0, 1, 0], L: 0.18 - i * 0.015, w: 0.09, pal: i === 1 ? WAVEP : FIRE }),
    );
    // flank scrolls
    const shoulder = skinBody.around([0, 0.95, 0.5]).at(s * 90, 5)!;
    b.decal(body, T.SCROLL, { at: shoulder, size: [0.3, 0.3], mirror: s > 0 });
    const haunch = skinBody.around([0, 0.95, -0.6]).at(s * 90, 5)!;
    b.decal(body, T.SCROLL, { at: haunch, size: [0.3, 0.3], mirror: s < 0 });
  }

  // ---------------- necklace of jade magatama beads
  const beads = b.ring(neck.at(0.3), { count: 16, radius: 0.19 }).items;
  beads.forEach((it, i) => {
    const big = i % 4 === 0;
    const pend = i === 8;
    b.part(new THREE.SphereGeometry(pend ? 0.04 : big ? 0.03 : 0.022, 6, 5), pend ? VERM : big ? GOLD : JADE, { at: it });
  });
  b.sweep(catmull(beads, { closed: true }), 0.008, { color: GOLD, sides: 5 });

  // ---------------- dream: spiralling wisp, bubbles and a cloud, drawn into the trunk
  const tipJ = trunk.joints[3];
  const wispPath = spiral([0, 0.86, 2.2], [0, 0.86, 2.1], [0, 1, 0], { turns: 2, r1: 0.03, pitch: 0.14 });
  glow(
    b.sweep(wispPath, [0.014, 0.004], { bone: tipJ, color: "#c9b8ff", caps: { end: "point" }, sides: 5 }),
    1.2,
  );
  [0.25, 0.5, 0.75, 0.95].forEach((t) =>
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), "#fff3c4", { at: wispPath.at(t), bone: tipJ }), 1.2),
  );
  [
    [0.14, 0.93, 2.13, 0.016],
    [0.22, 0.95, 2.1, 0.022],
    [0.3, 0.9, 2.05, 0.028],
  ].forEach(([x, y, z, r]) =>
    glow(b.part(new THREE.SphereGeometry(r, 6, 5), "#e9ddff", { at: [x, y, z], bone: head }), 0.8),
  );
  glow(
    b.cards([frame([0.46, 0.84, 1.98], [0, 1, 0])], T.DREAM, {
      size: [0.36, 0.32], lean: 0, flow: [0, 0, 1], bone: head,
    }),
    0.5,
  );

  // mouth open a touch so the upper and lower jaws read
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  return b.root;
}
```