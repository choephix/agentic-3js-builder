import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  limb,
  catmull,
  bezier,
  countershade,
  mottle,
  paint,
  grain,
  noise,
  mix,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis",
  description:
    "Low-poly whimsical desert oasis diorama: turquoise pond ringed with stones and reeds, three bent palms, a striped Bedouin tent and a small blue one, a standing and a kneeling camel with blankets and bridles, campfire, jars and a cactus on a layered sand base.",
};

// ---------------------------------------------------------------------------------------------------------------
// Shared state and small helpers

type B = ReturnType<typeof createBuilder>;
type Jt = ReturnType<B["joint"]>;
type V = THREE.Vector3;

let b: B;
let root: Jt;

const G = 0.16; // top of the sand base: everything stands on it
const PX = -0.3; // pond centre
const PZ = 0.15;
const PA = 0.72; // pond semi-axes
const PB = 0.48;

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Local frame placed on the sand at (ox, oz), turned by yaw, uniformly scaled by k. */
function xf(ox: number, oz: number, yaw: number, k = 1) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return {
    p: (x: number, y: number, z: number) => v3(ox + (x * c + z * s) * k, G + y * k, oz + (-x * s + z * c) * k),
    d: (x: number, y: number, z: number) => v3(x * c + z * s, y, -x * s + z * c),
    inv: (p: V) => ({
      x: ((p.x - ox) * c - (p.z - oz) * s) / k,
      y: (p.y - G) / k,
      z: ((p.x - ox) * s + (p.z - oz) * c) / k,
    }),
    deg: (yaw * 180) / Math.PI,
  };
}

/** A part on the root joint (scenery) unless `bone` says otherwise. */
function P(geo: THREE.BufferGeometry, color: any, at: V, o: Record<string, any> = {}) {
  return b.part(geo, color, { bone: root, at, ...o });
}

function ball(at: V, r: number, color: any, o: Record<string, any> = {}) {
  return P(new THREE.SphereGeometry(r, 7, 5), color, at, { flat: true, ...o });
}

function rock(at: V, sx: number, sy: number, sz: number, color: any, yawDeg: number) {
  return P(new THREE.IcosahedronGeometry(1, 0), color, at, {
    flat: true,
    scale: [sx, sy, sz],
    rotation: [0, yawDeg, 0],
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints

const BRASS = "#e0b040";
const ROPE = "#cbb07a";
const WOOD = "#8a5530";
const DARKWOOD = "#4e2f1a";
const HOOF = "#6b4a2a";
const RED = "#c8442f";
const CREAM = "#f6e6c0";
const NAVY = "#2f4f93";
const SKY = "#8ec8e8";

const SAND = paint((p, n) => {
  if (n.y < 0.5 && p.y <= G + 0.001) {
    const y = p.y + (noise(p, 0.2, 4) - 0.5) * 0.04;
    return y < 0.05 ? "#9c5530" : y < 0.1 ? "#c0803f" : y < 0.14 ? "#dba655" : "#ecc779";
  }
  const base = mix("#f2d38c", "#e6bb6c", noise(p, 0.35, 2));
  const rip = Math.sin((p.x * 0.7 + p.z * 1.3 + noise(p, 0.5, 7) * 2) * 34) > 0.82 ? 0.16 : 0;
  const r = Math.hypot((p.x - PX) / PA, (p.z - PZ) / PB);
  const wet = smoothstep(1.7, 1.1, r);
  return mix(mix(base, "#cf9f55", rip), "#c9a15c", wet * 0.65);
});

const WATER = paint((p) => {
  const r = Math.min(Math.hypot((p.x - PX) / (PA * 0.95), (p.z - PZ) / (PB * 0.95)), 1.2);
  let c = mix("#1c8fa8", "#6fe3d4", smoothstep(0.15, 1.0, r));
  const glint = smoothstep(0.76, 0.82, noise(p, 0.12, 11));
  c = mix(c, "#f2fffb", glint * 0.7);
  return mix(c, "#d9f3d0", smoothstep(0.9, 1.1, r) * 0.5);
});

const STONE = mottle("#a39682", "#7c725f", { size: 0.08, seed: 5 });
const STONE_D = mottle("#8f8472", "#675d4e", { size: 0.06, seed: 9 });
const LEAF = paint((_p, _n, s) => {
  const leaflet = (s[0] * 26) % 1 < 0.18;
  const edge = Math.abs(s[1] - 0.5) * 2;
  let c = mix("#2f7d3a", "#7dc24a", smoothstep(0.1, 1, edge));
  c = mix(c, "#d6d85a", smoothstep(0.78, 1, s[0]) * 0.7);
  return leaflet ? mix(c, "#1e5a2c", 0.5) : c;
});
const JAR = paint((p, n, s) => {
  const h = s[0];
  if ((h > 0.07 && h < 0.085) || (h > 0.125 && h < 0.14)) return "#3a2a6a";
  if (h > 0.085 && h < 0.125) return Math.floor(s[1] / 30) % 2 ? "#e8c070" : "#b5532f";
  return mix("#c9633a", "#a8482a", noise(p, 0.08, 3) + n.y * 0.05);
});
const BASKET = grain("#d8b060", "#a47a34", { size: 0.01, axis: "x", seed: 4 });
const CRATE = grain("#a8743a", "#7a4e26", { size: 0.012, axis: "x", seed: 8 });
const CACTUS = mottle("#4f9a4a", "#397a3a", { size: 0.06, seed: 2 });

function trunkPaint(len: number) {
  return paint((p, _n, s) => {
    const k = (s[0] * len) / 0.1 % 1;
    const base = mix("#9a6a3a", "#b98a52", noise(p, 0.05, 6));
    if (k < 0.2) return mix(base, "#4e3018", 0.7);
    if (k > 0.2 && k < 0.3) return mix(base, "#e0b880", 0.35);
    return base;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const EYE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 26 Q4 15 11 8" stroke="#2a1810" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M18 17 Q15 8 22 3" stroke="#2a1810" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="32" cy="37" rx="27" ry="24" fill="#2a1810"/>
  <ellipse cx="32" cy="37" rx="22" ry="19" fill="#8a4c22"/>
  <ellipse cx="33" cy="38" rx="14" ry="14" fill="#1b100a"/>
  <ellipse cx="24" cy="29" rx="7" ry="8" fill="#ffffff"/>
  <circle cx="41" cy="46" r="3.6" fill="#ffffff"/>
  <path d="M7 31 Q32 8 57 31" stroke="#e8c58c" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const PENNANT = svg(
  `<svg viewBox="0 0 48 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 80 L45 80 L45 12 L24 30 L3 12 Z" fill="#c8442f" stroke="#7a2418" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M3 62 L45 62 L45 70 L3 70 Z" fill="#f6e6c0"/>
  <path d="M24 38 L27 46 L36 46 L29 51 L31 59 L24 54 L17 59 L19 51 L12 46 L21 46 Z" fill="#f0c040" stroke="#8a5a10" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`,
  { size: 192 },
);

const RUG = svg(
  `<svg viewBox="0 0 72 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 8 H6 M0 14 H6 M0 20 H6 M0 26 H6 M0 32 H6 M0 38 H6 M66 8 H72 M66 14 H72 M66 20 H72 M66 26 H72 M66 32 H72 M66 38 H72" stroke="#f6e6c0" stroke-width="2.4"/>
  <rect x="6" y="2" width="60" height="44" rx="2" fill="#b83a2e" stroke="#4a1a14" stroke-width="2"/>
  <rect x="10" y="6" width="52" height="36" fill="none" stroke="#f6e6c0" stroke-width="2"/>
  <path d="M36 9 L50 24 L36 39 L22 24 Z" fill="#2f4f93" stroke="#f0c040" stroke-width="2"/>
  <path d="M36 16 L43 24 L36 32 L29 24 Z" fill="#f0c040"/>
  <path d="M14 24 L18 20 L22 24 L18 28 Z M50 24 L54 20 L58 24 L54 28 Z" fill="#f0c040"/>
</svg>`,
  { size: 256 },
);

const PAD = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 32 L36.9 4.4 A28 28 0 1 0 53.4 14 Z" fill="#4aa545" stroke="#276a2e" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M32 32 L14 14 M32 32 L8 36 M32 32 L26 58 M32 32 L52 50" stroke="#2f7d38" stroke-width="2" fill="none"/>
  <g fill="#ff8fb8" stroke="#c4467a" stroke-width="1.4">
    <ellipse cx="22" cy="40" rx="4" ry="8" transform="rotate(-40 22 40)"/>
    <ellipse cx="22" cy="40" rx="4" ry="8" transform="rotate(40 22 40)"/>
    <ellipse cx="22" cy="40" rx="4" ry="8"/>
  </g>
  <circle cx="22" cy="40" r="3" fill="#ffe27a"/>
</svg>`,
  { size: 128 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 46 L12 36" stroke="#8a5a10" stroke-width="3"/>
  <circle cx="12" cy="42" r="4.4" fill="#f0c040" stroke="#8a5a10" stroke-width="1.5"/>
  <path d="M8 36 L16 36 L22 3 L2 3 Z" fill="#c8442f" stroke="#7a2418" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M7 8 L9 34 M12 8 L12 34 M17 8 L15 34" stroke="#f6e6c0" stroke-width="1.6"/>
</svg>`,
  { size: 96 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 48 Q8 24 3 6 Q13 22 12 48 Z" fill="#7cb83e" stroke="#3e7a22" stroke-width="1.4"/>
  <path d="M12 48 Q15 22 16 2 Q21 22 21 48 Z" fill="#9ad04c" stroke="#3e7a22" stroke-width="1.4"/>
  <path d="M20 48 Q24 26 29 10 Q28 30 28 48 Z" fill="#6aa832" stroke="#3e7a22" stroke-width="1.4"/>
</svg>`,
  { size: 96 },
);

const SUN = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#7a2418" stroke-width="2.4" stroke-linecap="round">
    <path d="M20 2 V8 M20 32 V38 M2 20 H8 M32 20 H38 M7 7 L11 11 M29 29 L33 33 M33 7 L29 11 M7 33 L11 29"/>
  </g>
  <circle cx="20" cy="20" r="9" fill="#f0c040" stroke="#7a2418" stroke-width="2.4"/>
  <circle cx="20" cy="20" r="4" fill="#c8442f"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Camel

function camel(id: string, x: number, z: number, yaw: number, kneel: boolean, COAT: any, mane: string, cloth: string[]) {
  const T = xf(x, z, yaw);
  const by = kneel ? 0.22 : 0.4;
  const MUZZLE = "#ecd0a0";

  // Skeleton
  const hips = b.joint(`${id}_hips`, { parent: root, at: T.p(0, by, -0.16), dir: T.d(0, 0, 1), role: "spine" });
  const spine = b.chain(
    `${id}_spine`,
    catmull([T.p(0, by, -0.16), T.p(0, by + 0.01, 0.04), T.p(0, by + 0.02, 0.24)]),
    { parent: hips, names: [`${id}_spine1`, `${id}_spine2`], role: "spine" },
  );
  const neck = b.chain(
    `${id}_neck`,
    catmull([T.p(0, by + 0.04, 0.26), T.p(0, by + 0.2, 0.37), T.p(0, by + 0.36, 0.34), T.p(0, by + 0.45, 0.4)]),
    { parent: spine, names: [`${id}_neck1`, `${id}_neck2`, `${id}_neck3`], role: "neck" },
  );
  const hC = [0, by + 0.45, 0.4];
  const f = [0, -0.287, 0.958];
  const u = [0, 0.958, 0.287];
  const hp = (a: number, up: number, fw: number) => T.p(a, hC[1] + up * u[1] + fw * f[1], hC[2] + up * u[2] + fw * f[2]);
  const hd = T.d(f[0], f[1], f[2]);
  const head = b.joint(`${id}_head`, { parent: neck, at: T.p(hC[0], hC[1], hC[2]), dir: hd, role: "head" });
  const jaw = b.joint(`${id}_jaw`, { parent: head, at: hp(0, -0.07, 0.07), aim: hp(0, -0.085, 0.2), role: "jaw" });

  // Body
  const body = b.loft(
    [
      { at: T.p(0, by, -0.3), w: 0.14, h: 0.18 },
      { at: T.p(0, by, -0.2), w: 0.25, h: 0.29 },
      { at: T.p(0, by + 0.01, 0.0), w: 0.29, h: 0.33 },
      { at: T.p(0, by + 0.01, 0.18), w: 0.27, h: 0.31 },
      { at: T.p(0, by + 0.02, 0.3), w: 0.2, h: 0.24 },
    ],
    { bone: [hips, spine], color: COAT },
  );
  ball(T.p(0, by, -0.3), 0.1, COAT, { bone: hips, scale: [1.2, 1.0, 0.9] });
  ball(T.p(0, by + 0.01, 0.3), 0.12, COAT, { bone: spine.joints[1], scale: [1.1, 1.05, 1.0] });
  ball(T.p(0, by + 0.17, -0.02), 1, COAT, {
    bone: spine.joints[0],
    scale: [0.12, 0.15, 0.16],
    dir: T.d(0, 1, 0),
  });
  ball(T.p(0, by + 0.115, -0.02), 1, cloth[0], { bone: spine.joints[0], scale: [0.138, 0.085, 0.17] });
  ball(T.p(0, by + 0.34, -0.02), 0.022, cloth[1], { bone: spine.joints[0] });

  // Neck, mane
  const neckS = b.sweep(neck, [0.08, 0.052], { color: COAT, sides: 8 });
  b.along(neckS, 4, (at) => b.spike(at, at, 0.06, 0.026, { color: mane }));

  // Head
  const skull = P(new THREE.SphereGeometry(1, 10, 8), COAT, hp(0, 0, 0.03), {
    bone: head,
    dir: hd,
    axis: "z",
    scale: [0.068, 0.068, 0.085],
  });
  b.frustumBox(hp(0, -0.01, 0.07), hp(0, -0.025, 0.2), [0.1, 0.095], [0.08, 0.07], { color: MUZZLE, bone: head });
  ball(hp(0, -0.03, 0.205), 0.04, MUZZLE, { bone: head, scale: [1.15, 0.95, 0.85] });
  for (const s of [1, -1]) {
    ball(hp(s * 0.024, -0.02, 0.236), 0.009, "#3a2216", { bone: head });
    // Eye decal and brow
    b.decal(skull, EYE, {
      at: hp(s * 0.058, 0.022, 0.05),
      dir: T.d(s * 0.85, 0.2, 0.5),
      size: [0.054, 0.054],
      mirror: s > 0,
    });
    b.capsule(hp(s * 0.035, 0.056, 0.065), hp(s * 0.07, 0.046, 0.03), 0.013, "#b27c3e", { bone: head });
    // Ears
    P(new THREE.SphereGeometry(1, 6, 4), COAT, hp(s * 0.05, 0.068, -0.025), {
      bone: head,
      dir: T.d(s * 0.6, 1, -0.2),
      scale: [0.03, 0.052, 0.02],
      flat: true,
    });
    P(new THREE.SphereGeometry(1, 6, 4), "#e8a090", hp(s * 0.05, 0.066, -0.015), {
      bone: head,
      dir: T.d(s * 0.6, 1, -0.2),
      scale: [0.018, 0.036, 0.012],
      flat: true,
    });
    // Bridle: brass discs and cheek straps
    P(new THREE.CylinderGeometry(0.013, 0.013, 0.006, 8), BRASS, hp(s * 0.063, -0.03, 0.115), {
      bone: head,
      dir: T.d(s, 0, 0),
    });
    b.rod(hp(s * 0.058, -0.03, 0.115), hp(s * 0.066, 0.0, -0.02), 0.005, "#a8362a", { bone: head });
    // Mouth corners
    b.capsule(hp(s * 0.045, -0.06, 0.185), hp(s * 0.05, -0.058, 0.07), 0.004, "#4a2a1a", { bone: head });
  }
  P(new THREE.TorusGeometry(0.058, 0.006, 4, 10), "#a8362a", hp(0, -0.03, 0.115), {
    bone: head,
    dir: hd,
    axis: "z",
    scale: [1, 0.9, 1],
  });
  P(new THREE.ConeGeometry(0.02, 0.05, 5), mane, hp(0, 0.076, 0.02), { bone: head, dir: T.d(0, 1, 0.4), flat: true });
  b.frustumBox(hp(0, -0.063, 0.07), hp(0, -0.063, 0.195), [0.075, 0.012], [0.07, 0.012], {
    color: "#4a2a1a",
    bone: head,
  });
  b.frustumBox(hp(0, -0.085, 0.07), hp(0, -0.09, 0.195), [0.08, 0.032], [0.07, 0.03], { color: MUZZLE, bone: jaw });
  ball(hp(0, -0.09, 0.2), 0.03, MUZZLE, { bone: jaw, scale: [1.1, 0.8, 0.9] });

  // Legs
  for (const sd of [1, -1]) {
    for (const front of [true, false]) {
      const nm = `${id}_leg${front ? "F" : "H"}${sd > 0 ? "L" : "R"}`;
      const rootP = T.p(sd * 0.09, by - 0.03, front ? 0.18 : -0.2);
      let pts: V[];
      if (!kneel) {
        pts = limb(rootP, T.p(sd * 0.1, 0.04, front ? 0.2 : -0.2), [0.18, 0.18], [T.d(0, 0, front ? 1 : -1)]);
      } else if (front) {
        pts = limb(rootP, T.p(sd * 0.1, 0.04, 0.38), [0.14, 0.14], [T.d(0, -1, 0)]);
      } else {
        pts = limb(rootP, T.p(sd * 0.11, 0.04, -0.04), [0.14, 0.14], [T.d(0, -0.1, -1)]);
      }
      const leg = b.chain(nm, pts, {
        parent: front ? spine : hips,
        names: [`${nm}_hip`, `${nm}_knee`, `${nm}_foot`],
        role: "leg",
      });
      b.sweep(leg, [0.06, 0.038, 0.033], { color: COAT, sides: 7 });
      ball(pts[1], 0.043, COAT, { bone: leg.joints[1] });
      P(new THREE.CylinderGeometry(0.044, 0.05, 0.03, 7), HOOF, v3(pts[2].x, G + 0.015, pts[2].z), {
        bone: leg.joints[leg.joints.length - 1],
        flat: true,
      });
    }
  }

  // Tail
  const tail = b.chain(
    `${id}_tail`,
    catmull([T.p(0, by + 0.04, -0.28), T.p(0, by + 0.02, -0.38), T.p(0, by - 0.08, -0.42)]),
    { parent: hips, names: [`${id}_tail1`, `${id}_tail2`], role: "tail" },
  );
  b.sweep(tail, [0.032, 0.016], { color: COAT, sides: 6 });
  ball(T.p(0, by - 0.1, -0.42), 0.032, mane, { bone: tail.joints[1], scale: [0.9, 1.4, 0.9] });

  // Blanket band, gold trim, saddle bags
  const skin = b.surface(body);
  const blanketPaint = paint((_p, _n, s) => cloth[Math.floor(s[0] * 28) % cloth.length]);
  const zb = -0.02;
  const band = skin.loop(T.p(0, by, zb), { dir: T.d(0, 0, 1), lift: 0.01 });
  b.sweep(band, [0.085, 0.007], { section: "box", color: blanketPaint });
  for (const dz of [-0.09, 0.09]) {
    const trim = skin.loop(T.p(0, by, zb + dz), { dir: T.d(0, 0, 1), lift: 0.016 });
    b.sweep(trim, 0.008, { color: BRASS, sides: 5 });
  }
  const tas: V[] = [];
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.05, 0.11, 0.13), cloth[2], T.p(s * 0.168, by - 0.04, zb), {
      bone: spine.joints[0],
      rotation: [0, T.deg, 0],
      flat: true,
    });
    P(new THREE.BoxGeometry(0.054, 0.02, 0.134), cloth[1], T.p(s * 0.168, by + 0.005, zb), {
      bone: spine.joints[0],
      rotation: [0, T.deg, 0],
      flat: true,
    });
    for (const dz of [-0.04, 0.04]) tas.push(T.p(s * 0.168, by - 0.094, zb + dz));
  }
  b.cards(
    tas.map((p) => frame(p, [0, 1, 0])),
    TASSEL,
    { size: [0.035, 0.07], lean: 180, flow: [0, 0, 1], cross: true, bone: spine.joints[0] },
  );
  return { hips, head, jaw };
}

// ---------------------------------------------------------------------------------------------------------------
// Palm

function palm(x: number, z: number, h: number, lx: number, lz: number, nf: number, seed: number) {
  const R = rng(seed);
  const pts = [
    v3(x, G - 0.01, z),
    v3(x + lx * 0.12, G + h * 0.35, z + lz * 0.12),
    v3(x + lx * 0.45, G + h * 0.7, z + lz * 0.45),
    v3(x + lx, G + h, z + lz),
  ];
  const path = catmull(pts);
  b.sweep(path, [0.085, 0.045], { color: trunkPaint(h * 1.05), bone: root, sides: 7 });
  ball(v3(x, G + 0.03, z), 0.1, DARKWOOD, { scale: [1.1, 0.7, 1.1] });
  b.along(
    path,
    7,
    (a) => {
      P(new THREE.TorusGeometry(0.085 - 0.04 * a.t + 0.006, 0.012, 4, 9), "#6e4526", a.at, {
        dir: a.axis,
        axis: "z",
        flat: true,
      });
    },
    { from: 0.08, to: 0.95 },
  );
  const top = pts[3].clone();
  ball(top.clone().add(v3(0, 0.02, 0)), 0.075, "#8a8a3a", { scale: [1, 0.8, 1] });
  for (let i = 0; i < nf; i++) {
    const ang = (i / nf) * Math.PI * 2 + R() * 0.3;
    const low = i % 3 === 2;
    const len = (low ? 0.6 : 0.78) * (0.9 + 0.2 * R()) * (0.7 + h * 0.18);
    const base = top.clone().add(v3(0, 0.04, 0));
    frond(base, ang, len, low ? 0.1 : 0.3, low ? 0.6 : 0.36, low ? 0.085 : 0.1);
  }
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.4;
    ball(top.clone().add(v3(Math.cos(a) * 0.06, -0.05, Math.sin(a) * 0.06)), 0.045, "#6b4423");
  }
}

function frond(top: V, ang: number, len: number, lift: number, droop: number, wid: number) {
  const d = v3(Math.cos(ang), 0, Math.sin(ang));
  const side = v3(-d.z, 0, d.x);
  const N = 9;
  const sp: V[] = [];
  const eL: V[] = [];
  const eR: V[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const c = top.clone().addScaledVector(d, len * t);
    c.y += lift * Math.sin(t * Math.PI * 0.85) - droop * t * t;
    const w = Math.max(0.004, wid * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.7));
    sp.push(c);
    eL.push(c.clone().addScaledVector(side, w).add(v3(0, -w * 0.2, 0)));
    eR.push(c.clone().addScaledVector(side, -w).add(v3(0, -w * 0.2, 0)));
  }
  b.sweep(catmull(sp), [0.016, 0.003], { color: "#5a7a26", bone: root, sides: 4 });
  b.membrane(eL, eR, { color: LEAF, thickness: 0.006, rows: 2, bone: root });
}

// ---------------------------------------------------------------------------------------------------------------
// Tent

function tent(x: number, z: number, yaw: number, k: number, A: string, Bc: string, hem: string) {
  const T = xf(x, z, yaw, k);
  const W = 0.72;
  const D = 0.62;
  const wh = 0.18;
  const rh = 0.5;
  const dw = 0.13; // half door width
  const y13 = wh + (rh - wh) * (1 - dw / (W / 2));
  const roofPaint = paint((p, n) => {
    const l = T.inv(p);
    if (n.y < -0.3) return mix(A, "#000000", 0.45);
    if (l.y < wh + 0.035) return hem;
    return Math.floor((l.z + 1) / 0.1) % 2 === 0 ? A : Bc;
  });
  const sc = (o: [number, number, string?][]) => o.map(([u, v, m]) => (m ? [u * k, v * k, m] : [u * k, v * k])) as any;

  // Floor, back and front walls
  P(new THREE.BoxGeometry(W * k, 0.012, D * k), "#5e3a2a", T.p(0, 0.006 / k, 0), { rotation: [0, T.deg, 0] });
  b.extrude(
    sc([
      [-W / 2, 0],
      [W / 2, 0],
      [W / 2, wh],
      [0, rh],
      [-W / 2, wh],
    ]),
    { at: T.p(0, 0, -D / 2), x: T.d(1, 0, 0), y: [0, 1, 0], thickness: 0.014 * k, color: "#6a4430", bone: root },
  );
  for (const s of [1, -1]) {
    b.extrude(
      sc([
        [s * (W / 2), 0],
        [s * dw, 0],
        [s * dw, y13],
        [s * (W / 2), wh],
      ]),
      { at: T.p(0, 0, D / 2), x: T.d(1, 0, 0), y: [0, 1, 0], thickness: 0.016 * k, color: Bc, bone: root },
    );
    // Tied-back door curtain
    b.extrude(
      sc([
        [0, 0],
        [0.09, 0],
        [0.055, y13],
        [0, y13],
      ]),
      { at: T.p(s * dw, 0, D / 2 + 0.016), x: T.d(s, 0, 0), y: [0, 1, 0], thickness: 0.012 * k, color: A, bone: root },
    );
    // Door posts
    b.rod(T.p(s * dw, 0, D / 2 + 0.012), T.p(s * dw, y13, D / 2 + 0.012), 0.011 * k, WOOD, { bone: root, sides: 5 });
    ball(T.p(s * (dw + 0.02), 0.2, D / 2 + 0.03), 0.014 * k, BRASS);
  }
  b.extrude(
    sc([
      [-dw, y13],
      [dw, y13],
      [0, rh],
    ]),
    { at: T.p(0, 0, D / 2), x: T.d(1, 0, 0), y: [0, 1, 0], thickness: 0.016 * k, color: Bc, bone: root },
  );
  b.capsule(T.p(-dw, y13, D / 2 + 0.012), T.p(dw, y13, D / 2 + 0.012), 0.011 * k, WOOD, { bone: root, sides: 5 });
  P(new THREE.PlaneGeometry(0.1 * k, 0.1 * k), "#ffffff", T.p(0, 0.435, D / 2 + 0.012), {
    dir: T.d(0, 0, 1),
    axis: "z",
    texture: SUN,
  });

  // Roof
  for (const s of [1, -1]) {
    b.slab(
      [
        T.p(s * (W / 2 + 0.06), wh - 0.03, -D / 2 - 0.05),
        T.p(s * (W / 2 + 0.06), wh - 0.03, D / 2 + 0.07),
        T.p(0, rh + 0.01, D / 2 + 0.07),
        T.p(0, rh + 0.01, -D / 2 - 0.05),
      ],
      { color: roofPaint, thickness: 0.016 * k, bone: root },
    );
  }
  b.capsule(T.p(0, rh + 0.02, -D / 2 - 0.06), T.p(0, rh + 0.02, D / 2 + 0.1), 0.016 * k, BRASS, { bone: root, sides: 6 });
  ball(T.p(0, rh + 0.02, D / 2 + 0.115), 0.022 * k, BRASS, { bone: root });
  ball(T.p(0, rh + 0.02, -D / 2 - 0.075), 0.022 * k, BRASS, { bone: root });

  // Pennant on a pole
  b.rod(T.p(0, rh, -D / 2 - 0.02), T.p(0, rh + 0.26, -D / 2 - 0.02), 0.008 * k, WOOD, { bone: root, sides: 5 });
  ball(T.p(0, rh + 0.265, -D / 2 - 0.02), 0.015 * k, BRASS);
  b.cards([frame(T.p(0, rh + 0.2, -D / 2 - 0.02), T.d(0, 0, 1))], PENNANT, {
    size: [0.1 * k, 0.17 * k],
    lean: 90,
    flow: T.d(1, 0, 0),
    bone: root,
  });

  // Eave tassels
  const tp: V[] = [];
  for (const s of [1, -1]) for (let i = 0; i < 5; i++) tp.push(T.p(s * (W / 2 + 0.058), wh - 0.04, -D / 2 + 0.02 + (i * (D - 0.04)) / 4));
  b.cards(
    tp.map((p) => frame(p, [0, 1, 0])),
    TASSEL,
    { size: [0.035 * k, 0.07 * k], lean: 180, flow: [0, 0, 1], cross: true, bone: root },
  );

  // Ropes and pegs
  for (const s of [1, -1])
    for (const zz of [-1, 1]) {
      const corner = T.p(s * (W / 2 + 0.06), wh - 0.03, zz * (D / 2 + 0.04));
      const peg = T.p(s * (W / 2 + 0.24), 0.0, zz * (D / 2 + 0.2));
      const midp = corner.clone().lerp(peg, 0.5).add(v3(0, -0.02, 0));
      b.sweep(catmull([corner, midp, peg.clone().add(v3(0, 0.05 * k, 0))]), 0.005 * k, {
        color: ROPE,
        bone: root,
        sides: 4,
      });
      P(new THREE.ConeGeometry(0.014 * k, 0.07 * k, 5), WOOD, peg.clone().add(v3(0, 0.02 * k, 0)), { flat: true });
    }

  // Rug
  P(new THREE.PlaneGeometry(0.44 * k, 0.29 * k), "#ffffff", T.p(0, 0.012, D / 2 + 0.3), {
    dir: [0, 1, 0],
    axis: "z",
    up: T.d(0, 0, 1),
    texture: RUG,
  });
  return T;
}

// ---------------------------------------------------------------------------------------------------------------
// Props

function reedClump(x: number, z: number, seed: number) {
  const R = rng(seed);
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2;
    const h = 0.32 + R() * 0.22;
    const bx = x + Math.cos(a) * 0.04;
    const bz = z + Math.sin(a) * 0.04;
    const p0 = v3(bx, G + 0.02, bz);
    const p1 = v3(bx + Math.cos(a) * 0.04, G + h * 0.6, bz + Math.sin(a) * 0.04);
    const p2 = v3(bx + Math.cos(a) * 0.1, G + h, bz + Math.sin(a) * 0.1);
    b.sweep(bezier(p0, p1, p2), [0.012, 0.001], { color: "#6fa43a", bone: root, sides: 4 });
    if (i % 3 === 0) b.capsule(p2.clone().add(v3(0, 0.0, 0)), p2.clone().add(v3(0, 0.07, 0)), 0.014, "#6b3f1f", { bone: root, sides: 5 });
  }
}

function cactus(x: number, z: number) {
  b.sweep(catmull([v3(x, G - 0.01, z), v3(x, G + 0.15, z), v3(x + 0.01, G + 0.34, z)]), [0.045, 0.036], {
    color: CACTUS,
    bone: root,
    sides: 6,
  });
  b.sweep(bezier(v3(x, G + 0.13, z), v3(x + 0.11, G + 0.13, z), v3(x + 0.11, G + 0.26, z)), [0.026, 0.022], {
    color: CACTUS,
    bone: root,
    sides: 6,
  });
  b.sweep(bezier(v3(x, G + 0.2, z), v3(x - 0.09, G + 0.2, z), v3(x - 0.09, G + 0.29, z)), [0.022, 0.018], {
    color: CACTUS,
    bone: root,
    sides: 6,
  });
  ball(v3(x + 0.01, G + 0.375, z), 0.025, "#ff7fb0");
  ball(v3(x + 0.11, G + 0.3, z), 0.018, "#ffd45a");
}

function jar(x: number, z: number) {
  b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.085, 0.05],
      [0.09, 0.1],
      [0.065, 0.16],
      [0.04, 0.19],
      [0.052, 0.22],
      [0, 0.22],
    ],
    { at: v3(x, G, z), bone: root, segments: 9, smoothing: 1, color: JAR },
  );
  ball(v3(x, G + 0.225, z), 0.03, "#7a4b2a", { scale: [1.2, 0.5, 1.2] });
}

function basket(x: number, z: number) {
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.095, 0.06],
      [0.085, 0.065],
      [0.06, 0.015],
      [0, 0.015],
    ],
    { at: v3(x, G, z), bone: root, segments: 9, color: BASKET },
  );
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    ball(v3(x + Math.cos(a) * 0.04 * (i % 3 ? 1 : 0.3), G + 0.04 + (i % 2) * 0.012, z + Math.sin(a) * 0.04), 0.017, "#5a2a14", {
      scale: [1, 1.3, 1],
    });
  }
}

function crates(x: number, z: number) {
  P(new THREE.BoxGeometry(0.15, 0.12, 0.15), CRATE, v3(x, G + 0.06, z), { rotation: [0, 14, 0], flat: true });
  P(new THREE.BoxGeometry(0.155, 0.02, 0.155), DARKWOOD, v3(x, G + 0.115, z), { rotation: [0, 14, 0], flat: true });
  P(new THREE.BoxGeometry(0.155, 0.02, 0.155), DARKWOOD, v3(x, G + 0.015, z), { rotation: [0, 14, 0], flat: true });
  P(new THREE.BoxGeometry(0.11, 0.09, 0.11), CRATE, v3(x + 0.03, G + 0.165, z + 0.01), { rotation: [0, -20, 0], flat: true });
  P(new THREE.BoxGeometry(0.115, 0.016, 0.115), DARKWOOD, v3(x + 0.03, G + 0.2, z + 0.01), { rotation: [0, -20, 0], flat: true });
}

function fire(x: number, z: number) {
  const T = xf(x, z, 0);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1;
    b.rod(T.p(Math.cos(a) * 0.13, 0.03, Math.sin(a) * 0.13), T.p(-Math.cos(a) * 0.13, 0.06, -Math.sin(a) * 0.13), 0.022, "#5a3620", {
      bone: root,
      sides: 6,
    });
  }
  glow(P(new THREE.ConeGeometry(0.08, 0.24, 6), "#ff7a1f", T.p(0, 0.19, 0), { flat: true }), 1.3);
  glow(P(new THREE.ConeGeometry(0.055, 0.19, 6), "#ffc233", T.p(0, 0.17, 0.0), { flat: true }), 1.6);
  glow(P(new THREE.ConeGeometry(0.028, 0.12, 5), "#fff1a0", T.p(0, 0.14, 0), { flat: true }), 1.8);
  glow(P(new THREE.ConeGeometry(0.035, 0.1, 5), "#ff8a2a", T.p(0.07, 0.1, 0.03), { flat: true, rotation: [0, 0, -15] }), 1.3);
  glow(P(new THREE.ConeGeometry(0.03, 0.08, 5), "#ff8a2a", T.p(-0.06, 0.09, -0.04), { flat: true, rotation: [0, 0, 15] }), 1.3);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rock(T.p(Math.cos(a) * 0.2, 0.03, Math.sin(a) * 0.2), 0.045, 0.035, 0.04, i % 2 ? STONE : STONE_D, i * 40);
  }
}

function lantern(x: number, z: number, yaw: number) {
  const T = xf(x, z, yaw);
  b.rod(T.p(0, 0, 0), T.p(0, 0.34, 0), 0.01, WOOD, { bone: root, sides: 5 });
  b.rod(T.p(0, 0.34, 0), T.p(-0.07, 0.34, 0), 0.008, WOOD, { bone: root, sides: 5 });
  b.rod(T.p(-0.07, 0.34, 0), T.p(-0.07, 0.3, 0), 0.003, BRASS, { bone: root, sides: 4 });
  P(new THREE.ConeGeometry(0.03, 0.025, 6), BRASS, T.p(-0.07, 0.29, 0), { flat: true });
  glow(P(new THREE.CylinderGeometry(0.025, 0.022, 0.05, 6), "#ffd36b", T.p(-0.07, 0.255, 0), { flat: true }), 1.6);
  P(new THREE.CylinderGeometry(0.026, 0.026, 0.01, 6), BRASS, T.p(-0.07, 0.226, 0), { flat: true });
}

// ---------------------------------------------------------------------------------------------------------------
// Build

export default function build() {
  b = createBuilder({ name: "oasis", paintSize: 2048 });
  root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(21);

  // --- Base: layered sand disc, dunes, pebbles
  b.lathe(
    [
      [0, 0],
      [1.55, 0],
      [1.65, 0.05],
      [1.65, 0.12],
      [1.56, G],
      [0, G],
    ],
    { at: [0, 0, 0], bone: root, segments: 10, color: SAND },
  );
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.12 + i * 0.15);
    const r = 1.4;
    P(new THREE.SphereGeometry(1, 8, 5), SAND, v3(Math.cos(a) * r, G - 0.01, -Math.sin(a) * r), {
      scale: [0.4 + R() * 0.2, 0.1 + R() * 0.05, 0.28],
      rotation: [0, (a * 180) / Math.PI + 90, 0],
    });
  }
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.6 + R() * 0.9;
    const px = Math.cos(a) * r;
    const pz = Math.sin(a) * r;
    if (Math.hypot((px - PX) / (PA * 1.4), (pz - PZ) / (PB * 1.4)) < 1) continue;
    rock(v3(px, G, pz), 0.03 + R() * 0.03, 0.02 + R() * 0.02, 0.03 + R() * 0.03, STONE_D, R() * 360);
  }

  // --- Pond
  const pondOutline = (k: number) =>
    Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      const rr = 1 + 0.09 * Math.sin(3 * a + 0.6) + 0.06 * Math.cos(5 * a);
      return [Math.cos(a) * PA * rr * k, Math.sin(a) * PB * rr * k] as [number, number];
    });
  b.extrude(pondOutline(1.18), {
    at: v3(PX, G + 0.01, PZ),
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.02,
    smoothing: 1,
    color: "#d2ae6a",
    bone: root,
  });
  b.extrude(pondOutline(0.95), {
    at: v3(PX, G + 0.02, PZ),
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.02,
    smoothing: 1,
    bevel: 0.004,
    color: WATER,
    bone: root,
  });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    const rr = 1 + 0.09 * Math.sin(3 * a + 0.6) + 0.06 * Math.cos(5 * a);
    const sz = 0.065 + R() * 0.05;
    rock(
      v3(PX + Math.cos(a) * PA * 1.22 * rr, G + sz * 0.3, PZ + Math.sin(a) * PB * 1.22 * rr),
      sz,
      sz * 0.7,
      sz * 0.9,
      i % 2 ? STONE : STONE_D,
      R() * 360,
    );
  }
  const ringY = G + 0.032;
  for (const [rx, rz, sc, cx, cz] of [
    [0.22, 0.14, 1, 0.12, -0.05],
    [0.34, 0.22, 1, 0.12, -0.05],
    [0.14, 0.09, 1, -0.4, 0.2],
  ] as [number, number, number, number, number][]) {
    glow(
      P(new THREE.TorusGeometry(rx * sc, 0.004, 4, 16), "#d6fff6", v3(PX + cx, ringY, PZ + cz), {
        dir: [0, 1, 0],
        axis: "z",
        up: [0, 0, 1],
        scale: [1, rz / rx, 1],
      }),
      0.7,
    );
  }
  for (const [dx, dz, sz, a] of [
    [-0.25, 0.1, 0.17, 0.5],
    [0.1, -0.17, 0.14, 2.0],
    [0.3, 0.18, 0.12, 4.0],
  ] as [number, number, number, number][]) {
    P(new THREE.PlaneGeometry(sz, sz), "#ffffff", v3(PX + dx, G + 0.034, PZ + dz), {
      dir: [0, 1, 0],
      axis: "z",
      up: [Math.cos(a), 0, Math.sin(a)],
      texture: PAD,
    });
  }
  reedClump(PX - 0.6, PZ - 0.32, 3);
  reedClump(PX + 0.52, PZ - 0.4, 5);

  // --- Palms
  palm(-1.05, -0.5, 1.9, 0.35, 0.25, 9, 31);
  palm(0.55, -1.05, 1.6, -0.2, 0.3, 8, 32);
  palm(-1.2, 0.8, 1.05, 0.25, -0.05, 7, 33);

  // --- Tents
  tent(0.95, -0.6, -0.5, 1, RED, CREAM, "#7a2418");
  tent(1.2, 0.35, -1.0, 0.62, NAVY, CREAM, "#1c2f66");
  lantern(1.3, -0.12, -0.5);

  // --- Camels
  const COAT_A = countershade(mottle("#dba35a", "#c28d48", { size: 0.14, seed: 3 }), "#f1d9a4", { level: -0.3, soft: 0.3 });
  const COAT_B = countershade(mottle("#c99256", "#a8743a", { size: 0.12, seed: 8 }), "#e8cd96", { level: -0.3, soft: 0.3 });
  camel("camelA", 0.45, 0.85, 0.6, false, COAT_A, "#8a5a28", [RED, BRASS, NAVY, CREAM]);
  camel("camelB", -0.4, -0.95, 0.45, true, COAT_B, "#5e3a1a", [NAVY, BRASS, RED, CREAM]);

  // --- Camp props
  fire(0.4, -0.6);
  jar(0.2, -1.15);
  jar(0.02, -1.22);
  basket(-0.12, -1.28);
  crates(-0.95, -0.98);
  cactus(-1.4, 0.15);

  // --- Grass tufts around the pond
  const tufts: V[] = [];
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2;
    const rr = 1.3 + R() * 0.15;
    tufts.push(v3(PX + Math.cos(a) * PA * rr, G, PZ + Math.sin(a) * PB * rr));
  }
  b.cards(
    tufts.map((p) => frame(p, [0, 1, 0])),
    TUFT,
    { size: [0.08, 0.13], lean: 0, cross: true, vary: 0.3, rng: rng(5), bone: root },
  );

  return b.root;
}
