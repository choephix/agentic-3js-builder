```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  rng,
  limb,
  catmull,
  polyline,
  offset,
  mix,
  noise,
  paint,
  smoothstep,
  countershade,
  spots,
  stripes,
  mottle,
  svg,
  DEG,
} from "agentic-3js-builder";
import type { V3, Rgb, ColorInput } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Treasure Chest Mimic",
  description:
    "A D&D-style treasure chest mimic: iron-banded wooden chest with a toothed, hinged lid, bulging angry eyes, a long lolling tongue, clawed fleshy legs, side tentacles, lure coins and a glowing gem.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours)
const BONE = "#eee3c4";
const CLAW = "#2c2227";
const WART = "#9a7a86";
const SUCKER = "#e3b9b0";
const GEM = "#e0204a";
const LIDDARK = "#4a2a52";
const THROAT = "#1c0710";
const PAPILLA = "#f08aa4";
const WHITE = "#ffffff";

// ---------------------------------------------------------------------------------------------------------------
// Paints
const hash1 = (k: number) => {
  const x = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lit = (c: Rgb, k: number): Rgb => [c[0] * k, c[1] * k, c[2] * k];
const q1 = new THREE.Vector3();

/** Weathered planks with seams, grain, grime near the ground and moss on upward faces. */
function woodPaint(across: boolean, seed: number) {
  return paint((p, n) => {
    const side = Math.abs(n.x) > 0.6;
    const coord = across && !side ? p.x : p.y;
    const plank = across ? 0.15 : 0.11;
    const kf = coord / plank;
    const k = Math.floor(kf);
    const f = kf - k;
    const tone = hash1(k + seed);
    if (side || across) q1.set(p.x * 1.2, p.y * 1.2, p.z * 0.2);
    else q1.set(p.x * 0.2, p.y * 1.2, p.z * 1.2);
    const g = noise(q1, 0.03, seed);
    let c: Rgb = mix("#5a3a1e", "#946232", tone * 0.55 + g * 0.6 - 0.1);
    if (f < 0.035) return mix(c, "#1d0f06", 0.85);
    if (f < 0.07) c = mix(c, "#c9965a", 0.18);
    c = mix(c, "#2c2512", 0.5 * smoothstep(0.5, 0.28, p.y) * (0.5 + noise(p, 0.1, seed + 3)));
    c = mix(c, "#4f7a2c", 0.8 * smoothstep(0.7, 0.95, n.y) * smoothstep(0.55, 0.72, noise(p, 0.09, seed + 7)));
    return lit(c, 0.9 + 0.12 * n.y);
  });
}
const WOOD_BASE = woodPaint(false, 11);
const WOOD_LID = woodPaint(true, 23);

const IRON = metal("iron", { tarnish: 0.6 });
const BRASS = metal("brass", { tarnish: 0.4, verdigris: 0.3 });
const GILT = metal("gilt");

const FLESH = countershade(
  spots(mottle("#5a3764", "#7d4560", { size: 0.1, seed: 2 }), "#3a2146", { size: 0.06, amount: 0.3, seed: 6 }),
  "#b57a82",
  { level: -0.2 },
);
const MOUTH = mottle("#9b2a40", "#c2485f", { size: 0.07, seed: 9 });
const PALATE = stripes(mottle("#a03048", "#c04a60", { size: 0.08, seed: 12 }), "#6e1a2e", {
  size: 0.07,
  axis: "z",
  width: 0.4,
  wobble: 0.2,
});
const EYEBALL = mottle("#f4eba0", "#e2c870", { size: 0.03, seed: 4 });
const TOOTH = paint((_p, _n, s) => mix("#b89a5a", "#f6efd8", smoothstep(0, 0.7, s[0])));
const TONGUE_BASE = countershade(spots("#d2476d", "#a02a55", { size: 0.04, amount: 0.65, seed: 4 }), "#ec93a6", {
  level: -0.35,
});
const TONGUE = paint((_p, _n, s) => {
  const c = Math.cos(s[1] * DEG);
  return c > 0.985 && s[0] > 0.04 && s[0] < 0.9 ? "#7c1c42" : TONGUE_BASE;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 100 100">
    <defs><radialGradient id="i" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="#e8ff5a"/><stop offset="0.6" stop-color="#ffb020"/><stop offset="1" stop-color="#c04a00"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="45" fill="url(#i)" stroke="#2a0d05" stroke-width="5"/>
    <path d="M50 50 L20 40 M50 50 L18 58 M50 50 L80 42 M50 50 L82 60 M50 50 L40 14 M50 50 L62 86" stroke="#8a2b00" stroke-width="1.6" opacity="0.7"/>
    <path d="M50 11 C63 30 63 70 50 89 C37 70 37 30 50 11Z" fill="#120405"/>
    <ellipse cx="37" cy="35" rx="7" ry="10" fill="#ffffff" opacity="0.92" transform="rotate(25 37 35)"/>
    <circle cx="63" cy="67" r="3.5" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

let ticks = "";
for (let i = 0; i < 12; i++) {
  const a = (i * 30 * Math.PI) / 180;
  ticks += `<path d="M${(50 + 40 * Math.sin(a)).toFixed(1)} ${(50 - 40 * Math.cos(a)).toFixed(1)} L${(50 + 46 * Math.sin(a)).toFixed(1)} ${(50 - 46 * Math.cos(a)).toFixed(1)}" stroke="#e8c8ff" stroke-width="3.5"/>`;
}
const RUNE = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="38" fill="none" stroke="#b97bff" stroke-width="5"/>
    <circle cx="50" cy="50" r="31" fill="none" stroke="#8d4dff" stroke-width="3"/>
    ${ticks}
    <path d="M50 22 L50 78 M50 30 L69 46 L50 62 M50 46 L32 58 M36 34 L50 40" stroke="#f1d8ff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const KEYPLATE = svg(
  `<svg viewBox="0 0 60 80">
    <rect x="2" y="2" width="56" height="76" rx="10" fill="#c99a38" stroke="#4a2f0a" stroke-width="3"/>
    <rect x="8" y="8" width="44" height="64" rx="6" fill="none" stroke="#f3d27a" stroke-width="2"/>
    <circle cx="12" cy="12" r="3" fill="#f3d27a" stroke="#4a2f0a" stroke-width="1.2"/>
    <circle cx="48" cy="12" r="3" fill="#f3d27a" stroke="#4a2f0a" stroke-width="1.2"/>
    <circle cx="12" cy="68" r="3" fill="#f3d27a" stroke="#4a2f0a" stroke-width="1.2"/>
    <circle cx="48" cy="68" r="3" fill="#f3d27a" stroke="#4a2f0a" stroke-width="1.2"/>
    <circle cx="30" cy="32" r="9" fill="#1a0e06"/>
    <path d="M26 56 L27.5 36 L32.5 36 L34 56Z" fill="#1a0e06"/>
    <circle cx="27" cy="29" r="2.4" fill="#ffd9a0" opacity="0.7"/>
  </svg>`,
  { size: 192 },
);

const MOSS = svg(
  `<svg viewBox="0 0 32 48">
    <path d="M4 48 Q2 24 7 6 Q11 24 12 48Z" fill="#3f7a2a"/>
    <path d="M10 48 Q12 20 18 2 Q22 22 20 48Z" fill="#5fa03a"/>
    <path d="M18 48 Q22 26 29 10 Q29 30 26 48Z" fill="#4b8c30"/>
    <path d="M13 48 Q14 30 17 18 Q18 32 17 48Z" fill="#8cc84a"/>
  </svg>`,
  { size: 128 },
);

const DROOL = svg(
  `<svg viewBox="0 0 20 80">
    <path d="M7 22 L13 22 L11.5 80 L8.5 80Z" fill="#a6e04a"/>
    <ellipse cx="10" cy="13" rx="8" ry="11" fill="#a6e04a"/>
    <ellipse cx="7" cy="10" rx="2.4" ry="4.5" fill="#e4ff9a"/>
  </svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "chestMimic" });
  const R = rng(2024);

  // Skeleton ---------------------------------------------------------------------------------------------------
  const chest = b.joint("chest", { at: [0, 0.5, 0], dir: [0, 0, 1], role: "spine" });
  const HINGE: V3 = [0, 0.72, -0.38];
  const jaw = b.joint("jaw", { parent: chest, at: HINGE, dir: [0, 0, 1], role: "jaw", group: "lid" });

  const box = (w: number, h: number, d: number, color: ColorInput, bone: typeof chest, at: V3, extra: object = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  // Base (lower jaw) -------------------------------------------------------------------------------------------
  box(1.1, 0.44, 0.07, WOOD_BASE, chest, [0, 0.5, 0.345]);
  box(1.1, 0.44, 0.07, WOOD_BASE, chest, [0, 0.5, -0.345]);
  box(0.07, 0.44, 0.62, WOOD_BASE, chest, [0.515, 0.5, 0]);
  box(0.07, 0.44, 0.62, WOOD_BASE, chest, [-0.515, 0.5, 0]);
  box(1.04, 0.03, 0.7, WOOD_BASE, chest, [0, 0.285, 0]);
  // gum pad and throat
  box(0.96, 0.4, 0.62, MOUTH, chest, [0, 0.48, 0]);
  b.part(new THREE.CylinderGeometry(1, 1, 1, 12), THROAT, { bone: chest, at: [0, 0.68, -0.2], scale: [0.3, 0.01, 0.17] });

  // corner brackets + rivets
  const rivets: THREE.BufferGeometry[] = [];
  const rivetProto = new THREE.SphereGeometry(0.014, 6, 4);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.116, 0.46, 0.116, IRON, chest, [sx * 0.505, 0.5, sz * 0.335]);
      for (const y of [0.36, 0.5, 0.64]) {
        rivets.push(rivetProto.clone().translate(sx * 0.505, y, sz * 0.395));
        rivets.push(rivetProto.clone().translate(sx * 0.565, y, sz * 0.335));
      }
    }
  // back straps on the base
  for (const x of [-0.3, 0.3]) {
    box(0.09, 0.44, 0.02, IRON, chest, [x, 0.5, -0.39]);
    rivets.push(rivetProto.clone().translate(x, 0.4, -0.402), rivetProto.clone().translate(x, 0.6, -0.402));
  }
  b.part(mergeGeometries(rivets)!, BRASS, { bone: chest, at: [0, 0, 0] });

  // rune medallions on the base front
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 14), BRASS, { bone: chest, at: [s * 0.3, 0.5, 0.388], dir: [0, 0, 1] });
    glow(
      b.part(new THREE.PlaneGeometry(0.17, 0.17), WHITE, {
        bone: chest,
        at: [s * 0.3, 0.5, 0.401],
        dir: [0, 0, 1],
        axis: "z",
        texture: RUNE,
      }),
      1.2,
    );
  }

  // Lid (upper jaw) --------------------------------------------------------------------------------------------
  const W = 0.76;
  const lidOutline = (g: number): [number, number][] => [
    [-g, -g * 0.2],
    [W + g, -g * 0.2],
    [W + g, 0.12 + g * 0.5],
    [W - 0.06 + g * 0.7, 0.21 + g * 0.9],
    [W - 0.21 + g * 0.4, 0.27 + g],
    [W / 2, 0.29 + g],
    [0.21 - g * 0.4, 0.27 + g],
    [0.06 - g * 0.7, 0.21 + g * 0.9],
    [-g, 0.12 + g * 0.5],
  ];
  const lid = b.extrude(lidOutline(0), {
    at: HINGE,
    x: [0, 0, 1],
    thickness: 1.12,
    bevel: 0.01,
    color: WOOD_LID,
    bone: jaw,
  });
  const bands: ReturnType<typeof b.extrude>[] = [];
  for (const x of [-0.37, 0.37])
    bands.push(b.extrude(lidOutline(0.02), { at: [x, 0.72, -0.38], x: [0, 0, 1], thickness: 0.1, color: IRON, bone: jaw }));
  for (const x of [-0.55, 0.55])
    b.extrude(lidOutline(0.015), { at: [x, 0.72, -0.38], x: [0, 0, 1], thickness: 0.06, color: IRON, bone: jaw });
  // rivets on the lid bands, seated on the band surface
  for (const band of bands) {
    const sf = b.surface(band);
    for (const z of [-0.3, -0.15, 0, 0.15, 0.3]) {
      const hit = sf.ray([band.at.x, 3, z], [0, -1, 0]);
      if (hit) b.stick(new THREE.SphereGeometry(0.017, 6, 4), BRASS, hit, { embed: 0.45 });
    }
  }
  // palate
  box(0.96, 0.03, 0.62, PALATE, jaw, [0, 0.71, 0]);
  // hinges
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), IRON, { bone: jaw, at: [s * 0.33, 0.72, -0.392], rotation: [0, 0, 90] });
    box(0.12, 0.15, 0.014, IRON, jaw, [s * 0.33, 0.8, -0.388]);
    box(0.12, 0.15, 0.014, IRON, chest, [s * 0.33, 0.64, -0.388]);
  }
  // hasp and keyplate on the lid front
  box(0.15, 0.2, 0.02, BRASS, jaw, [0, 0.76, 0.39]);
  b.part(new THREE.PlaneGeometry(0.12, 0.16), WHITE, { bone: jaw, at: [0, 0.76, 0.4015], dir: [0, 0, 1], axis: "z", texture: KEYPLATE });

  // Teeth ------------------------------------------------------------------------------------------------------
  const rim = polyline([
    [0.515, 0, -0.3],
    [0.515, 0, 0.345],
    [-0.515, 0, 0.345],
    [-0.515, 0, -0.3],
  ]);
  const NT = 26;
  const makeTeeth = (upper: boolean) => {
    for (let i = 0; i < NT; i++) {
      const t = upper ? (i + 1) / NT : (i + 0.5) / NT;
      if (t >= 1) continue;
      const p = rim.at(t);
      const front = p.z > 0.33;
      if (front && Math.abs(p.x) < 0.14) continue;
      const fx = upper ? 0.2 : 0.3;
      const fang = front && Math.abs(Math.abs(p.x) - fx) < 0.05;
      const len = fang ? 0.17 : 0.06 + 0.06 * R();
      const rad = fang ? 0.032 : 0.022 + 0.006 * R();
      const dir = new THREE.Vector3(-p.x * 0.18, upper ? -1 : 1, -p.z * 0.22).normalize();
      b.spike([p.x, upper ? 0.7 : 0.712, p.z], dir, len, rad, {
        color: TOOTH,
        bone: upper ? jaw : chest,
        sides: 5,
      });
    }
  };
  makeTeeth(false);
  makeTeeth(true);

  // Eyes on the lid --------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const eyeC: V3 = [s * 0.27, 0.96, 0.22];
    const eyeDir = new THREE.Vector3(s * 0.22, 0.18, 1).normalize();
    const eyeball = b.part(new THREE.SphereGeometry(0.085, 10, 8), EYEBALL, { bone: jaw, at: eyeC });
    glow(
      b.decal(eyeball, EYE, {
        at: offset(eyeC, eyeDir, 0.084),
        dir: eyeDir,
        up: [0, 1, 0],
        size: [0.1, 0.1],
        segments: 8,
        lift: 0.002,
      }),
      0.9,
    );
    b.part(new THREE.SphereGeometry(0.094, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), LIDDARK, {
      bone: jaw,
      at: [eyeC[0], eyeC[1] + 0.022, eyeC[2]],
      rotation: [0, 0, s * 18],
      flat: true,
    });
  }

  // Gem lure on the lid ----------------------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.07, 0.085, 0.03, 6), BRASS, { bone: jaw, at: [0, 1.005, 0.0] });
  glow(
    b.part(new THREE.OctahedronGeometry(0.06), GEM, { bone: jaw, at: [0, 1.07, 0], scale: [1, 1.4, 1], flat: true }),
    1.1,
  );
  // loose lure coins on the lid
  const lidSf = b.surface(lid);
  for (const [x, z] of [
    [0.2, -0.12],
    [-0.18, -0.2],
    [0.12, 0.08],
    [-0.12, 0.05],
  ]) {
    const hit = lidSf.ray([x, 3, z], [0, -1, 0]);
    if (hit) b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 10), GILT, hit, { embed: 0.2, spin: R() * 360 });
  }
  // moss tufts
  const mossHits = lidSf.scatter(36, {
    rng: rng(21),
    minDist: 0.06,
    filter: (h) => h.n.y > 0.55 && Math.abs(h.at.x) > 0.1,
  });
  b.cards(mossHits, MOSS, { size: [0.07, 0.08], lean: 25, vary: 0.3, rng: rng(22), cross: true, flow: [0, -0.2, -1] });

  // Drool strands from the lid front
  const droolFrames = [-0.42, -0.28, 0.24, 0.36, 0.47].map((x) => frame([x, 0.712, 0.33], [0, 1, 0]));
  glow(b.cards(droolFrames, DROOL, { size: [0.035, 0.18], lean: 180, flow: [0, 0, 1], vary: 0.4, rng: rng(31), cross: true, bone: jaw }), 0.5);

  // Legs -------------------------------------------------------------------------------------------------------
  const legRng = rng(77);
  for (const f of [1, -1])
    for (const s of [1, -1]) {
      const F = f > 0 ? "F" : "B";
      const S = s > 0 ? "L" : "R";
      const hip: V3 = [s * 0.4, 0.36, f * 0.25];
      const foot: V3 = [s * 0.53, 0.08, f * 0.4];
      const pts = limb(hip, foot, [0.2, 0.2], [[s, 0.6, 0]]);
      const leg = b.chain(`leg${F}${S}`, pts, {
        parent: chest,
        names: [`hip${F}${S}`, `knee${F}${S}`, `ankle${F}${S}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      const sw = b.sweep(leg, [0.09, 0.06, 0.05], { color: FLESH });
      const tip = leg.tip!;
      b.part(new THREE.SphereGeometry(1, 8, 6), FLESH, { bone: tip, at: [foot[0], 0.05, foot[2]], scale: [0.095, 0.05, 0.115] });
      for (const a of [-38, 0, 38]) {
        const d = new THREE.Vector3(Math.sin(a * DEG) + s * 0.2, -0.02, Math.cos(a * DEG)).normalize();
        b.spike([foot[0], 0.035, foot[2] + 0.05], d, 0.17, 0.028, { color: CLAW, bone: tip, sides: 6 });
      }
      b.spike(leg.joints[1], new THREE.Vector3(s, 0.5, 0).normalize(), 0.13, 0.04, { color: BONE, sides: 6 });
      const hits = b.surface(sw).scatter(6, { rng: legRng, minDist: 0.06, filter: (h) => h.n.y > -0.3 });
      for (const h of hits) b.stick(new THREE.SphereGeometry(0.017, 5, 4), WART, h, { embed: 0.4 });
    }

  // Side tentacles ---------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.5, 0.5, -0.12],
      [s * 0.78, 0.46, -0.22],
      [s * 1.02, 0.58, -0.16],
      [s * 1.2, 0.82, 0.0],
      [s * 1.24, 1.04, 0.18],
    ]);
    const tent = b.chain(`tentacle${S}`, path, { parent: chest, count: 6, role: "tentacle" });
    const sw = b.sweep(tent, [0.06, 0.04, 0.012], { color: FLESH });
    for (let i = 0; i < 7; i++) {
      const t = 0.14 + i * 0.12;
      const r = 0.03 * (1 - t * 0.7);
      b.stick(new THREE.CylinderGeometry(r * 0.8, r, 0.014, 8), SUCKER, sw.at(t, 180), { embed: 0.4 });
    }
  }

  // Tongue -----------------------------------------------------------------------------------------------------
  const tongue = b.chain(
    "tongue",
    catmull([
      [0, 0.7, -0.22],
      [0, 0.72, 0.0],
      [0, 0.775, 0.25],
      [0, 0.78, 0.44],
      [0, 0.66, 0.58],
      [0, 0.42, 0.66],
      [0, 0.17, 0.76],
      [0, 0.04, 0.95],
      [0.05, 0.035, 1.22],
      [0.3, 0.035, 1.5],
      [0.6, 0.035, 1.55],
      [0.82, 0.06, 1.38],
      [0.88, 0.17, 1.18],
    ]),
    { parent: chest, count: 11, role: "tentacle" },
  );
  const tongueSweep = b.sweep(
    tongue,
    (t: number): [number, number] => {
      const w = t < 0.88 ? 0.09 - 0.02 * t : 0.075 * Math.sqrt(Math.max(0, (1 - t) / 0.12));
      return [Math.max(w, 0.004), 0.03 * (1 - 0.5 * smoothstep(0.85, 1, t))];
    },
    { color: TONGUE },
  );
  const papillae = b.surface(tongueSweep).scatter(22, {
    rng: rng(44),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.6 && h.at.z > 0.8,
  });
  for (const h of papillae) b.stick(new THREE.SphereGeometry(0.014, 5, 4), PAPILLA, h, { embed: 0.5 });

  // Coins: heaps in the mouth, a few spilled on the floor ------------------------------------------------------
  const coinProto = new THREE.CylinderGeometry(0.04, 0.04, 0.008, 10);
  const coinAt = (x: number, y: number, z: number, tx: number, ty: number, tz: number) => {
    const g = coinProto.clone();
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(tx, ty, tz)),
        new THREE.Vector3(1, 1, 1),
      ),
    );
    return g;
  };
  const coins: THREE.BufferGeometry[] = [];
  for (const [cx, cz] of [
    [-0.3, -0.04],
    [0.3, 0.02],
    [-0.22, 0.2],
  ])
    for (let i = 0; i < 13; i++) {
      const layer = Math.floor(i / 5);
      const a = i * 2.4 + cx * 7;
      const rr = (0.12 - 0.035 * layer) * (0.5 + 0.5 * R());
      coins.push(
        coinAt(cx + Math.cos(a) * rr, 0.686 + layer * 0.009 + R() * 0.004, cz + Math.sin(a) * rr, (R() - 0.5) * 0.5, R() * 6.28, (R() - 0.5) * 0.5),
      );
    }
  for (const [x, z] of [
    [-0.78, 0.9],
    [-0.62, 1.05],
    [0.9, 0.7],
    [0.75, 0.9],
    [-0.95, 0.4],
    [0.35, 0.78],
  ])
    coins.push(coinAt(x, 0.004, z, (R() - 0.5) * 0.1, R() * 6.28, (R() - 0.5) * 0.1));
  b.part(mergeGeometries(coins)!, GILT, { bone: chest, at: [0, 0, 0] });

  // Rest pose: the lid (upper jaw) hinged open ---------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: -38 });

  return b.root;
}
```