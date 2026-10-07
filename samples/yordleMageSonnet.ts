import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { offset, rng } from "../src/math";
import { bezier, catmull, spiral } from "../src/path";
import { gradient, mix, mottle, noise, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Yordle Starweaver",
  description:
    "A knee-high furry yordle mage in a gold-trimmed indigo mantle and a crooked star hat, gripping a staff taller than himself that cradles a glowing cyan orb in a golden crescent.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const AMBER = "#f29a2e";
const AMBER_D = "#c4601a";
const CREAM = "#ffeac4";
const CREAM_D = "#e9c58c";
const BROWN = "#4a2616";
const PINK = "#ff8fa8";
const INDIGO = "#2b3fb4";
const INDIGO_D = "#171f78";
const INDIGO_L = "#4d6ae0";
const GOLD = "#ffc83a";
const GOLD_D = "#b97a12";
const CYAN = "#4ff6ff";
const MAGENTA = "#ff3fa4";
const WOOD = "#7a4421";
const WOOD_D = "#4a2812";
const LEATHER = "#8a3b2a";
const INK = "#22112f";
const WHITE = "#fffaf0";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const FUR = mottle(AMBER, AMBER_D, { size: 0.045, contrast: 0.55, seed: 3 });
const FUR_CREAM = mottle(CREAM, CREAM_D, { size: 0.04, contrast: 0.5, seed: 5 });
const PAW = paint((p, n) => {
  const soft = mix(AMBER, AMBER_D, noise(p, 0.04, 9));
  return n.y < -0.5 ? INK : soft;
});

const HEAD = paint((p, n) => {
  const m = Math.hypot(p.x / 0.14, (p.y - 0.845) / 0.1, (p.z - 0.2) / 0.11);
  const cheek = Math.hypot((Math.abs(p.x) - 0.1) / 0.06, (p.y - 0.865) / 0.05, (p.z - 0.14) / 0.08);
  if (m < 1 || cheek < 1) {
    const cream = mix(CREAM, CREAM_D, smoothstep(0.7, 1.2, Math.min(m, cheek)) * 0.5);
    const blush = Math.hypot((Math.abs(p.x) - 0.108) / 0.032, (p.y - 0.868) / 0.022, (p.z - 0.19) / 0.05);
    return blush < 1 ? mix(cream, PINK, 0.75 * (1 - blush)) : cream;
  }
  if (p.y > 0.99 && n.y > 0.5) return AMBER_D;
  return FUR;
});

const EAR_L = paint((p, n) => {
  const tip = smoothstep(1.1, 1.19, p.y);
  const base = n.z > 0.45 ? mix(PINK, "#ffb8c8", noise(p, 0.03, 4)) : FUR.at(p, n);
  return mix(base, BROWN, tip * 0.9);
});

const ROBE = paint((p, n) => {
  // brocade lattice with gold studs at the crossings, plus a gold hem line
  const ang = Math.atan2(p.x, p.z) * 0.17;
  const fu = ((((ang + p.y) / 0.1) % 1) + 1) % 1;
  const fv = ((((ang - p.y) / 0.1) % 1) + 1) % 1;
  const du = Math.min(fu, 1 - fu);
  const dv = Math.min(fv, 1 - fv);
  if (du < 0.1 && dv < 0.1) return GOLD;
  if (p.y < 0.215 && p.y > 0.2) return GOLD;
  const shade = noise(p, 0.08, 2);
  const base = mix(INDIGO_D, INDIGO, 0.35 + 0.65 * Math.min(1, Math.max(0, n.y * 0.5 + 0.6)));
  if (du < 0.035 || dv < 0.035) return mix(base, INDIGO_L, 0.55);
  return mix(base, INDIGO_L, shade * 0.28);
});

const HAT = paint((p, n) => {
  const shade = noise(p, 0.1, 6);
  const band = Math.sin((p.y - 1.05) * 60 + Math.atan2(p.x, p.z) * 3) > 0.92;
  return band ? INDIGO_L : mix(INDIGO_D, INDIGO, 0.4 + 0.5 * shade + 0.1 * n.y);
});

const CAPE = paint((p, n) => {
  const thick = Math.abs(n.z) < 0.6 && Math.abs(n.y) < 0.6;
  if (thick) return GOLD;
  return mix(INDIGO_D, INDIGO, 0.2 + 0.6 * smoothstep(0.35, 0.7, p.y));
});

const WOODP = paint((p) => {
  const g = noise(new THREE.Vector3(p.x * 6, p.y * 0.7, p.z * 6), 0.1, 8);
  return mix(WOOD, WOOD_D, g * 0.8);
});

const LEATHERP = paint((_p, _n, s) => (((s[1] + s[0] * 5200) % 90) + 90) % 90 < 28 ? "#5f2418" : LEATHER);

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="i" cx="50%" cy="62%" r="62%"><stop offset="0" stop-color="#eaffff"/><stop offset="0.4" stop-color="#4ff6ff"/><stop offset="1" stop-color="#1668d8"/></radialGradient></defs>
  <ellipse cx="32" cy="42" rx="29" ry="36" fill="#fffaf0"/>
  <ellipse cx="32" cy="45" rx="24" ry="31" fill="url(#i)"/>
  <ellipse cx="32" cy="47" rx="11" ry="17" fill="#0b1235"/>
  <ellipse cx="23" cy="31" rx="7" ry="9" fill="#ffffff"/>
  <circle cx="42" cy="60" r="3.5" fill="#ffffff"/>
  <ellipse cx="32" cy="42" rx="29" ry="36" fill="none" stroke="#2b1208" stroke-width="3.5"/>
  <path d="M1 22 Q30 -2 63 16 L60 25 Q32 12 6 31 Z" fill="#2b1208"/>
  <path d="M61 18 L68 12" stroke="#2b1208" stroke-width="4" fill="none"/>
</svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0 C24 12 31 38 27 64 L5 64 C1 38 8 12 16 0Z" fill="#ffffff"/>
  <path d="M16 6 C18 24 20 44 16 64" stroke="#c8c8c8" stroke-width="2.5" fill="none"/>
  <path d="M9 24 C10 40 10 52 9 64 M23 26 C22 42 22 54 23 64" stroke="#dcdcdc" stroke-width="2" fill="none"/>
</svg>`,
  { size: 128 },
);

const RIBBON = svg(
  `<svg viewBox="0 0 16 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 0 L15 0 L15 52 L8 64 L1 52 Z" fill="#ffffff"/>
  <path d="M3 4 L13 4 M8 4 L8 56" stroke="#c8c8c8" stroke-width="1.5" fill="none"/>
</svg>`,
  { size: 128 },
);

function rune(d: string) {
  return svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg"><path d="${d}" stroke="#7bf9ff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 192 },
  );
}
const RUNES = [
  rune("M16 4 L16 44 M6 14 L16 24 L26 14 M8 34 L24 34"),
  rune("M8 6 L24 6 L8 42 L24 42 M16 6 L16 42"),
  rune("M16 4 L28 24 L16 44 L4 24 Z M16 14 L16 34"),
  rune("M6 8 L26 8 M16 8 L16 44 M6 28 L16 38 L26 28"),
  rune("M24 6 L8 24 L24 42 M12 24 L28 24"),
];

const STAR = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 1 L20 12 L31 12 L22 19 L26 31 L16 24 L6 31 L10 19 L1 12 L12 12 Z" fill="#ffc83a" stroke="#fff3b0" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`,
  { size: 128 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="29" fill="none" stroke="#ffc83a" stroke-width="4"/>
  <circle cx="32" cy="32" r="22" fill="#171f78"/>
  <path d="M32 6 L37 25 L58 32 L37 39 L32 58 L27 39 L6 32 L27 25 Z" fill="#ffc83a"/>
  <path d="M32 16 L35 29 L48 32 L35 35 L32 48 L29 35 L16 32 L29 29 Z" fill="#4ff6ff"/>
  <circle cx="32" cy="32" r="4" fill="#ffffff"/>
</svg>`,
  { size: 192 },
);

const BOOK_RUNE = svg(
  `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="26" height="34" rx="2" fill="none" stroke="#ffc83a" stroke-width="2.5"/>
  <path d="M16 9 L22 20 L16 31 L10 20 Z" fill="#4ff6ff"/>
  <circle cx="16" cy="20" r="2.5" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

function ringPoints(center: THREE.Vector3, normal: THREE.Vector3, radius: number, count: number) {
  const n = normal.clone().normalize();
  const ref = Math.abs(n.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(n, ref).normalize();
  const v = new THREE.Vector3().crossVectors(n, u).normalize();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    pts.push(center.clone().addScaledVector(u, Math.cos(a) * radius).addScaledVector(v, Math.sin(a) * radius));
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "yordleMage", paintSize: 2048 });
  const R = rng(17);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton

  const hips = b.joint("hips", { at: [0, 0.36, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, 0],
      [0, 0.51, 0.012],
      [0, 0.62, 0.022],
      [0, 0.71, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.71, 0.03], aim: [0, 0.79, 0.05], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.79, 0.05], aim: [0, 0.95, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.83, 0.13], aim: [0, 0.82, 0.25], role: "jaw" });

  // ears
  const ears = [1, -1].map((s) => {
    const name = s > 0 ? "L" : "R";
    const ch = b.chain(
      `ear${name}`,
      catmull([
        [s * 0.15, 0.985, 0.02],
        [s * 0.215, 1.075, 0.0],
        [s * 0.27, 1.16, -0.05],
        [s * 0.3, 1.23, -0.1],
      ]),
      { parent: head, names: [`ear${name}1`, `ear${name}2`, `ear${name}3`] },
    );
    return ch;
  });

  // tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.4, -0.1],
      [0, 0.37, -0.26],
      [0, 0.45, -0.4],
      [0, 0.62, -0.46],
      [0, 0.8, -0.4],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );

  // legs
  const legs = [1, -1].map((s) => {
    const name = s > 0 ? "L" : "R";
    const hipP: [number, number, number] = [s * 0.085, 0.36, 0];
    const pts = limb(hipP, [s * 0.1, 0.07, 0.03], [0.17, 0.17], [0, 0, 1]);
    const ch = b.chain(`leg${name}`, catmull(pts), {
      parent: hips,
      names: [`hip${name}`, `knee${name}`, `ankle${name}`],
      role: "leg",
    });
    return ch;
  });

  // arms: left open, right gripping the staff
  const STAFF_B = new THREE.Vector3(-0.3, 0, 0.14);
  const STAFF_T = new THREE.Vector3(-0.4, 1.62, 0.2);
  const STAFF_A = STAFF_T.clone().sub(STAFF_B).normalize();
  const onStaff = (y: number) => STAFF_B.clone().addScaledVector(STAFF_A, y / STAFF_A.y);
  const gripC = onStaff(0.56);

  const armL = b.chain(
    "armL",
    catmull([
      [0.17, 0.63, 0.01],
      [0.3, 0.5, 0.05],
      [0.37, 0.46, 0.17],
    ]),
    { parent: chest, names: ["shoulderL", "elbowL", "wristL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.17, 0.63, 0.01],
      [-0.3, 0.45, 0.04],
      [gripC.x, gripC.y, gripC.z],
    ]),
    { parent: chest, names: ["shoulderR", "elbowR", "wristR"], role: "arm" },
  );
  const wristL = armL.tip!;
  const wristR = armR.tip!;

  // -------------------------------------------------------------------------------------------------------------
  // Torso and robe

  const torso = b.sweep(
    spine,
    (t) => {
      const w = 0.118 + 0.05 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.8) + (t > 0.8 ? -0.03 * (t - 0.8) * 5 : 0);
      return [w, w * 0.88];
    },
    { color: ROBE, detail: 1 },
  );
  const skin = b.surface(torso);

  const skirt = b.lathe(
    [
      [0.152, 0.31],
      [0.185, 0.24],
      [0.22, 0.12],
      [0.262, 0.0],
      [0.248, -0.006],
      [0.205, 0.12],
      [0.172, 0.24],
      [0.14, 0.31],
    ],
    { at: [0, 0.19, 0], bone: hips, segments: 14, color: ROBE },
  );
  const skirtSurf = b.surface(skirt);
  const onSkirt = (deg: number, y: number) => {
    const r = (deg * Math.PI) / 180;
    return skirtSurf.ray([Math.sin(r) * 0.7, y, Math.cos(r) * 0.7], [-Math.sin(r), 0, -Math.cos(r)]);
  };
  // gold hem and waist band
  const hemY = 0.205;
  const hemR = 0.262 - 0.0 + 0.004;
  const hemPts = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return [Math.cos(a) * hemR, hemY, Math.sin(a) * hemR];
  });
  b.sweep(catmull(hemPts, { closed: true }), 0.012, { color: GOLD, bone: hips, sides: 6 });
  // hem tassels: little teal-gold bells around the skirt
  const hemItems = Array.from({ length: 10 }, (_, i) => {
    const a = ((i + 0.5) / 10) * Math.PI * 2;
    return [Math.cos(a) * (hemR + 0.004), hemY - 0.012, Math.sin(a) * (hemR + 0.004)];
  });
  for (const p of hemItems)
    b.part(new THREE.ConeGeometry(0.014, 0.034, 6), GOLD, { at: [p[0], p[1] - 0.012, p[2]], bone: hips, rotation: [180, 0, 0] });

  b.decal(skirt, EMBLEM, { at: [0, 0.3, 0.195], dir: [0, 0, 1], size: [0.11, 0.11], bone: hips, lift: 0.004 });

  // belt
  const beltY = 0.49;
  b.sweep(skin.loop([0, beltY, 0], { lift: 0.012 }), 0.026, { color: GOLD_D, bone: spine.joints[0], sides: 6 });
  b.sweep(skin.loop([0, beltY, 0], { lift: 0.026 }), 0.008, { color: GOLD, bone: spine.joints[0], sides: 6 });
  const beltFront = skin.ray([0, beltY, 1], [0, 0, -1]);
  const bz = (beltFront?.at.z ?? 0.15) + 0.026;
  b.part(new THREE.BoxGeometry(0.075, 0.062, 0.02), GOLD, { at: [0, beltY, bz], bone: spine.joints[0] });
  glow(
    b.part(new THREE.OctahedronGeometry(0.027, 0), CYAN, { at: [0, beltY, bz + 0.012], bone: spine.joints[0], scale: [1, 1.25, 0.8], flat: true }),
    1.2,
  );
  // crossing sash with gold studs and a star charm
  const sash = skin.drape(
    catmull([
      [-0.11, 0.7, 0.07],
      [-0.05, 0.63, 0.15],
      [0.04, 0.55, 0.17],
      [0.15, 0.48, 0.1],
    ]),
    { lift: 0.006 },
  );
  b.sweep(sash, () => [0.024, 0.008], { color: LEATHER, bone: chest, sides: 6 });
  b.along(sash, 5, (at) => b.part(new THREE.SphereGeometry(0.0085, 6, 4), GOLD, { at, bone: chest }));
  glow(b.part(new THREE.OctahedronGeometry(0.02, 0), CYAN, { at: offset(sash.at(0.5), [0, 0.2, 1], 0.02), bone: chest, scale: [1, 1.3, 0.8], flat: true }), 1.2);
  // collar rolls at the neck: cream fur ruff
  const ruffPath = catmull(ringPoints(new THREE.Vector3(0, 0.71, 0.02), new THREE.Vector3(0, 1, 0), 0.14, 12), { closed: true });
  const ruff = b.sweep(ruffPath, 0.04, { color: FUR_CREAM, bone: chest, sides: 6 });
  b.cards(
    b.surface(ruff).scatter(130, { rng: R, minDist: 0.026, filter: (h) => h.n.y > -0.2 }),
    TUFT,
    { size: [0.04, 0.05], lean: 72, bend: 24, flow: [0, 0.2, 1], vary: 0.25, rng: R, color: FUR_CREAM, bone: chest },
  );

  // shoulder mantle fur and clasps
  for (const s of [1, -1]) {
    const m = b.part(new THREE.SphereGeometry(0.085, 9, 7), FUR_CREAM, {
      at: [s * 0.185, 0.68, 0.0],
      scale: [1.1, 0.75, 1.05],
      bone: chest,
    });
    b.cards(
      b.surface(m).scatter(36, { rng: R, minDist: 0.03, filter: (h) => h.n.y > -0.1 }),
      TUFT,
      { size: [0.04, 0.05], lean: 72, bend: 26, flow: [s * 1, -0.2, 0], vary: 0.25, rng: R, color: FUR_CREAM, bone: chest },
    );
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 8), GOLD, {
      at: [s * 0.185, 0.708, 0.07],
      dir: [0, 0.35, 1],
      bone: chest,
    });
    glow(b.part(new THREE.OctahedronGeometry(0.015, 0), CYAN, { at: [s * 0.185, 0.712, 0.08], bone: chest, flat: true }), 1.2);
  }

  // cape panels
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.128, -0.14],
      [0.115, -0.24],
      [0.06, -0.2, "sharp"],
      [0, -0.29, "sharp"],
      [-0.06, -0.2, "sharp"],
      [-0.115, -0.24],
      [-0.128, -0.14],
    ] as OutlinePoint[],
    {
      at: [0, 0.7, -0.15],
      x: [1, 0, 0],
      y: [0, 1, -0.18],
      thickness: 0.02,
      bevel: 0.004,
      color: CAPE,
      bone: chest,
    },
  );
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.1, -0.005],
        [0.16, -0.1],
        [0.17, -0.2],
        [0.12, -0.17, "sharp"],
        [0.07, -0.25, "sharp"],
        [0.02, -0.2, "sharp"],
        [0, -0.2],
      ] as OutlinePoint[],
      {
        at: [s * 0.115, 0.7, -0.145],
        x: [s * 0.93, 0, -0.36],
        y: [0, 1, -0.15],
        thickness: 0.02,
        bevel: 0.004,
        color: CAPE,
        bone: chest,
      },
    );

  // tall back collar blades
  const bladeAng = [-62, -31, 0, 31, 62];
  for (const [i, deg] of bladeAng.entries()) {
    const r = (deg * Math.PI) / 180;
    const h = 0.17 + 0.13 * Math.cos(r * 1.1);
    b.extrude(
      [
        [-0.04, 0],
        [0.04, 0],
        [0.042, h * 0.5],
        [0, h, "sharp"],
        [-0.042, h * 0.5],
      ] as OutlinePoint[],
      {
        at: [Math.sin(r) * 0.05, 0.69, -0.17 + (i % 2) * 0.005],
        x: [Math.cos(r), -Math.sin(r), 0],
        y: [Math.sin(r), Math.cos(r), 0.12],
        thickness: 0.016,
        bevel: 0.004,
        color: CAPE,
        bone: chest,
      },
    );
  }

  // pouch, potion, book on the skirt
  const pouchHit = onSkirt(-62, 0.4);
  if (pouchHit) {
    const out = pouchHit.n.clone();
    const pa = pouchHit.at.clone().addScaledVector(out, 0.022);
    const rot: [number, number, number] = [0, -62, 0];
    b.part(new THREE.BoxGeometry(0.08, 0.074, 0.044), LEATHER, { at: pa, rotation: rot, bone: hips });
    b.part(new THREE.BoxGeometry(0.086, 0.034, 0.05), "#5f2418", { at: pa.clone().add(new THREE.Vector3(0, 0.03, 0)), rotation: rot, bone: hips });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: pa.clone().addScaledVector(out, 0.03), bone: hips });
    b.rod([-0.128, 0.485, 0.11], pa.clone().add(new THREE.Vector3(0, 0.05, 0)), 0.006, { color: GOLD_D, bone: hips, sides: 4 });
  }
  const potionHit = onSkirt(60, 0.38);
  if (potionHit) {
    const out = potionHit.n.clone();
    const pc = potionHit.at.clone().addScaledVector(out, 0.045);
    b.rod([0.125, 0.485, 0.115], pc.clone().add(new THREE.Vector3(0, 0.07, 0)), 0.005, { color: LEATHER, bone: hips, sides: 4 });
    glow(b.part(new THREE.SphereGeometry(0.038, 8, 6), MAGENTA, { at: pc, bone: hips }), 1.0);
    b.part(new THREE.CylinderGeometry(0.012, 0.015, 0.036, 6), WHITE, { at: pc.clone().add(new THREE.Vector3(0, 0.05, 0)), bone: hips });
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.018, 6), WOOD, { at: pc.clone().add(new THREE.Vector3(0, 0.078, 0)), bone: hips });
  }
  const bookHit = onSkirt(140, 0.36);
  if (bookHit) {
    const out = bookHit.n.clone();
    const bc = bookHit.at.clone().addScaledVector(out, 0.02);
    const rot: [number, number, number] = [0, 140, 0];
    b.part(new THREE.BoxGeometry(0.1, 0.12, 0.034), "#7d2a8c", { at: bc, rotation: rot, bone: hips });
    b.part(new THREE.BoxGeometry(0.094, 0.112, 0.03), CREAM, { at: bc.clone().addScaledVector(out, -0.004), rotation: rot, bone: hips });
    b.part(new THREE.PlaneGeometry(0.08, 0.1), "#ffffff", {
      at: bc.clone().addScaledVector(out, 0.0185),
      dir: out,
      axis: "z",
      bone: hips,
      texture: BOOK_RUNE,
    });
    b.part(new THREE.BoxGeometry(0.012, 0.124, 0.038), GOLD_D, {
      at: bc.clone().addScaledVector(new THREE.Vector3(Math.cos((140 * Math.PI) / 180), 0, -Math.sin((140 * Math.PI) / 180)), 0.048),
      rotation: rot,
      bone: hips,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head

  const skull = b.part(new THREE.SphereGeometry(0.17, 14, 10), HEAD, {
    at: [0, 0.91, 0.06],
    scale: [1.14, 0.98, 1.0],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.065, 10, 8), HEAD, {
    at: [0, 0.865, 0.21],
    scale: [1.15, 0.8, 1.0],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.056, 10, 8), FUR_CREAM, { at: [0, 0.805, 0.2], scale: [1.15, 0.58, 1.0], bone: jaw });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), "#c43a5a", { at: [0, 0.83, 0.2], scale: [1.1, 0.5, 1.0], bone: jaw });
  b.part(new THREE.SphereGeometry(0.02, 6, 5), "#e86a8a", { at: [0, 0.822, 0.23], scale: [1.3, 0.5, 1.4], bone: jaw });

  // eyes
  for (const s of [1, -1])
    glow(
      b.decal(skull, EYE, {
        at: [s * 0.08, 0.935, 0.22],
        dir: [s * 0.15, 0.04, 1],
        size: [0.092, 0.115],
        mirror: s > 0,
        roll: s * -8,
        bone: head,
        lift: 0.003,
      }),
      0.55,
    );
  // brows
  for (const s of [1, -1]) {
    b.capsule([s * 0.125, 1.0, 0.185], [s * 0.045, 0.993, 0.235], [0.011, 0.007], { color: BROWN, bone: head, sides: 5 });
    b.spike([s * 0.13, 1.0, 0.18], [s * 0.15, 1.018, 0.162], null, 0.009, { color: BROWN, bone: head, sides: 5 });
  }
  // nose, mouth, teeth
  b.part(new THREE.SphereGeometry(0.021, 8, 6), "#4a1f3a", { at: [0, 0.889, 0.268], scale: [1.25, 0.85, 1.0], bone: head });
  b.part(new THREE.SphereGeometry(0.006, 5, 4), WHITE, { at: [-0.007, 0.896, 0.284], bone: head });
  b.sweep(
    catmull([
      [-0.05, 0.848, 0.232],
      [-0.024, 0.832, 0.263],
      [0.0, 0.84, 0.272],
      [0.024, 0.832, 0.263],
      [0.05, 0.848, 0.232],
    ]),
    0.0045,
    { color: INK, bone: head, sides: 5, caps: "round" },
  );
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.016, 0.026, 0.008), WHITE, { at: [s * 0.009, 0.826, 0.268], bone: head });
  // whiskers
  for (const s of [1, -1])
    for (const [i, dy] of [-0.012, 0.006, 0.024].entries())
      b.sweep(
        bezier(
          [s * 0.07, 0.87 + dy * 0.4, 0.235],
          [s * 0.14, 0.87 + dy, 0.26],
          [s * 0.22, 0.86 + dy * 1.6 - 0.01 * i, 0.19],
        ),
        [0.0035, 0.0012],
        { color: "#fff4e0", bone: head, sides: 4, caps: "none" },
      );

  // cheek and brow fur
  const headSurf = b.surface(skull);
  b.cards(
    headSurf.scatter(70, {
      rng: R,
      minDist: 0.03,
      filter: (h) => Math.abs(h.at.x) > 0.11 && h.at.y < 0.95 && h.at.y > 0.8 && h.at.z > -0.02,
    }),
    TUFT,
    {
      size: [0.042, 0.06],
      lean: 70,
      bend: 20,
      flow: (f) => [Math.sign(f.at.x) * 0.6, -0.25, -1],
      vary: 0.3,
      rng: R,
      color: FUR_CREAM,
      bone: head,
    },
  );
  b.cards(
    headSurf.scatter(40, { rng: R, minDist: 0.035, filter: (h) => h.at.y > 0.98 && h.at.z < 0.12 && h.n.y > 0.3 }),
    TUFT,
    { size: [0.035, 0.07], lean: 50, bend: 18, flow: [0, 0.1, -1], vary: 0.3, rng: R, color: FUR, bone: head },
  );


  // ears
  for (const [i, ch] of ears.entries()) {
    const s = i === 0 ? 1 : -1;
    const ear = b.sweep(
      ch,
      (t) => [0.062 - 0.034 * t * t + 0.012 * Math.sin(t * 3.14), 0.016 - 0.007 * t],
      { color: EAR_L, caps: "round" },
    );
    b.cards(
      b.surface(ear).scatter(12, { rng: R, minDist: 0.03, filter: (h) => h.at.y > 1.12 }),
      TUFT,
      { size: [0.024, 0.05], lean: 70, flow: [s * 0.4, 0.2, -1], rng: R, color: BROWN, vary: 0.2 },
    );
    // gold ear cuff
    const cuffT = 0.2;
    const cp = ch.at(cuffT);
    b.sweep(
      catmull(ringPoints(new THREE.Vector3(...cp.at.toArray()), new THREE.Vector3(...cp.tangent.toArray()), 0.062, 10), { closed: true }),
      0.0075,
      { color: GOLD, bone: ch.joints[0], sides: 5 },
    );
    glow(b.part(new THREE.OctahedronGeometry(0.012, 0), CYAN, { at: offset(cp.at, [0, 0, 1], 0.03), bone: ch.joints[0], flat: true }), 1.2);
  }

  // hat: crooked cone with a bell and a star
  const hatPath = catmull([
    [0, 1.055, 0.02],
    [0, 1.15, 0.0],
    [0.01, 1.25, -0.04],
    [0.06, 1.33, -0.1],
    [0.15, 1.37, -0.16],
  ]);
  const hat = b.sweep(hatPath, (t) => 0.125 * Math.pow(1 - t, 0.9) + 0.012, { color: HAT, bone: head, caps: "round", sides: 10 });
  const hatSurf = b.surface(hat);
  for (const [az, y] of [
    [24, 1.13],
    [-38, 1.17],
    [82, 1.2],
    [-85, 1.1],
    [-10, 1.24],
  ]) {
    const ar = (az * Math.PI) / 180;
    const h = hatSurf.ray([Math.sin(ar) * 0.5, y, 0.01 + Math.cos(ar) * 0.5], [-Math.sin(ar), 0, -Math.cos(ar)]);
    if (h) glow(b.decal(hat, STAR, { at: h.at, dir: h.n, size: [0.04, 0.04], bone: head, roll: az * 0.6, lift: 0.002 }), 0.5);
  }
  b.lathe(
    [
      [0.0, 0.0],
      [0.15, 0.0],
      [0.19, 0.012],
      [0.19, 0.026],
      [0.14, 0.026],
      [0.0, 0.03],
    ],
    { at: [0, 1.05, 0.03], bone: head, segments: 14, color: HAT, axis: [0, 1, 0.06] },
  );
  b.sweep(catmull(ringPoints(new THREE.Vector3(0, 1.062, 0.03), new THREE.Vector3(0, 1, 0.06), 0.122, 14), { closed: true }), 0.012, {
    color: GOLD,
    bone: head,
    sides: 6,
  });
  b.sweep(catmull(ringPoints(new THREE.Vector3(0, 1.052, 0.03), new THREE.Vector3(0, 1, 0.06), 0.19, 18), { closed: true }), 0.007, {
    color: GOLD,
    bone: head,
    sides: 5,
  });
  b.part(new THREE.BoxGeometry(0.05, 0.045, 0.012), GOLD, { at: [0, 1.065, 0.152], bone: head });
  glow(b.part(new THREE.OctahedronGeometry(0.02, 0), CYAN, { at: [0, 1.066, 0.16], bone: head, scale: [1, 1.2, 0.8], flat: true }), 1.3);
  const tipP = hatPath.at(1);
  b.part(new THREE.SphereGeometry(0.024, 8, 6), GOLD, { at: [tipP.x + 0.01, tipP.y - 0.01, tipP.z - 0.015], bone: head });
  glow(b.part(new THREE.OctahedronGeometry(0.02, 0), CYAN, { at: [tipP.x + 0.03, tipP.y - 0.005, tipP.z - 0.03], bone: head, flat: true }), 1.4);
  // jaunty feather tucked in the hatband
  const featherPath = catmull([
    [-0.095, 1.068, 0.1],
    [-0.14, 1.13, 0.135],
    [-0.18, 1.22, 0.13],
    [-0.2, 1.31, 0.09],
  ]);
  b.sweep(featherPath, (t) => [0.034 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 0.004, 0.005], {
    color: gradient(MAGENTA, CYAN, [-0.095, 1.068, 0.1], [-0.2, 1.31, 0.09]),
    bone: head,
    caps: "point",
    sides: 6,
  });
  b.sweep(featherPath, 0.0035, { color: GOLD, bone: head, sides: 4, caps: "round" });

  // -------------------------------------------------------------------------------------------------------------
  // Tail

  const tailTube = b.sweep(tail, (t) => 0.045 + 0.095 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.85) + (t > 0.7 ? 0.01 : 0), {
    color: gradient(FUR, FUR_CREAM, [0, 0.55, -0.46], [0, 0.78, -0.4]),
    caps: "round",
    sides: 10,
  });
  b.cards(
    b.surface(tailTube).scatter(90, { rng: R, minDist: 0.04, filter: (h) => h.at.y > 0.4 }),
    TUFT,
    {
      size: [0.05, 0.075],
      lean: 55,
      bend: 22,
      flow: [0, 1, 0.1],
      vary: 0.3,
      rng: R,
      color: gradient(FUR, FUR_CREAM, [0, 0.55, -0.46], [0, 0.78, -0.4]),
    },
  );
  // tail ring: gold band with glowing gem
  const tb = tail.at(0.18);
  b.sweep(
    catmull(ringPoints(new THREE.Vector3(...tb.at.toArray()), new THREE.Vector3(...tb.tangent.toArray()), 0.07, 10), { closed: true }),
    0.009,
    { color: GOLD, bone: tail.joints[0], sides: 5 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Legs and feet

  for (const [i, ch] of legs.entries()) {
    const s = i === 0 ? 1 : -1;
    const name = s > 0 ? "L" : "R";
    b.sweep(ch, (t) => 0.062 - 0.012 * t, { color: FUR, sides: 8 });
    const ankle = ch.joints[2];
    const fx = s * 0.1;
    // paw/foot
    b.sweep(
      catmull([
        [fx, 0.075, -0.03],
        [fx, 0.058, 0.07],
        [fx, 0.05, 0.15],
      ]),
      [0.056, 0.05],
      { color: PAW, bone: ankle, sides: 8, caps: "round" },
    );
    b.cards(
      b.surface(b.part(new THREE.SphereGeometry(0.06, 8, 6), FUR, { at: [fx, 0.09, -0.01], bone: ankle, scale: [1, 0.7, 1.3] })).scatter(18, {
        rng: R,
        minDist: 0.03,
        filter: (h) => h.n.y > 0,
      }),
      TUFT,
      { size: [0.028, 0.05], lean: 75, flow: [0, -0.1, 1], rng: R, color: FUR_CREAM, bone: ankle },
    );
    // toes
    for (const [j, dx] of [-0.034, 0, 0.034].entries()) {
      const tx = fx + dx;
      const toe = b.chain(
        `toe${name}${j + 1}`,
        [
          [tx, 0.04, 0.14],
          [tx + dx * 0.35, 0.036, 0.19],
        ],
        { parent: ankle, names: [`toe${name}${j + 1}`], role: "digit" },
      );
      b.sweep(toe, [0.022, 0.02], { color: FUR_CREAM, caps: "round", sides: 6 });
      b.spike([tx + dx * 0.35, 0.036, 0.205], [0, -0.1, 1], 0.026, 0.009, { color: BROWN, bone: toe.joints[0], sides: 5 });
    }
    // anklet
    const ap = ch.at(0.97);
    b.sweep(
      catmull(ringPoints(new THREE.Vector3(...ap.at.toArray()), new THREE.Vector3(0, 1, 0), 0.058, 10), { closed: true }),
      0.01,
      { color: GOLD, bone: ankle, sides: 5 },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms and hands

  const arms: [typeof armL, number][] = [
    [armL, 1],
    [armR, -1],
  ];
  for (const [ch, s] of arms) {
    const sf = s > 0 ? "L" : "R";
    const wrist = s > 0 ? wristL : wristR;
    b.sweep(ch, (t) => 0.056 - 0.014 * t, { color: FUR, sides: 8 });
    // bell sleeve
    b.sweep(ch, (t) => 0.066 + 0.05 * smoothstep(0.15, 0.55, t), { from: 0, to: 0.56, color: ROBE, sides: 10, caps: "flat" });
    b.sweep(ch, (t) => 0.066 + 0.05 * smoothstep(0.15, 0.55, t) + 0.006, { from: 0.53, to: 0.58, color: GOLD, sides: 10, caps: "flat" });
    b.sweep(ch, (t) => 0.066 + 0.05 * smoothstep(0.15, 0.55, t) + 0.003, { from: 0.5, to: 0.515, color: GOLD_D, sides: 10, caps: "flat" });
    const cuff = ch.at(0.59);
    const cuffRing = b.sweep(
      catmull(ringPoints(new THREE.Vector3(...cuff.at.toArray()), new THREE.Vector3(...cuff.tangent.toArray()), 0.112, 12), { closed: true }),
      0.02,
      { color: FUR_CREAM, bone: ch.joints[1], sides: 6 },
    );
    b.cards(b.surface(cuffRing).scatter(44, { rng: R, minDist: 0.024 }), TUFT, {
      size: [0.036, 0.045],
      lean: 72,
      bend: 20,
      flow: cuff.tangent.toArray(),
      vary: 0.25,
      rng: R,
      color: FUR_CREAM,
      bone: ch.joints[1],
    });
    const w = wrist.at;
    // palm
    const palm = b.part(new THREE.SphereGeometry(0.058, 9, 7), PAW, { at: [w.x, w.y, w.z], scale: [1, 0.9, 1.0], bone: wrist });
    b.cards(
      b.surface(palm).scatter(16, { rng: R, minDist: 0.03, filter: (h) => h.n.y > -0.1 }),
      TUFT,
      { size: [0.024, 0.045], lean: 70, flow: [0, -0.2, -1], rng: R, color: FUR_CREAM, bone: wrist },
    );
    if (s > 0) {
      // open hand: three fingers forward, thumb out
      for (const [j, dx] of [-0.036, 0, 0.036].entries()) {
        const fx = w.x + dx * 1.3;
        const f = b.chain(
          `finger${sf}${j + 1}`,
          catmull([
            [fx - dx * 0.2, w.y + 0.01, w.z + 0.04],
            [fx, w.y + 0.025, w.z + 0.09],
            [fx + dx * 0.15, w.y + 0.05, w.z + 0.13],
          ]),
          { parent: wrist, names: [`finger${sf}${j + 1}a`, `finger${sf}${j + 1}b`, `finger${sf}${j + 1}c`], role: "digit" },
        );
        b.sweep(f, [0.02, 0.016], { color: PAW, caps: "round", sides: 6 });
        b.spike(f.tip!, f.tip!, 0.022, 0.008, { color: BROWN, sides: 5 });
      }
      const thumb = b.chain(
        `thumb${sf}`,
        catmull([
          [w.x + 0.04, w.y + 0.01, w.z + 0.02],
          [w.x + 0.085, w.y + 0.03, w.z + 0.045],
          [w.x + 0.11, w.y + 0.06, w.z + 0.06],
        ]),
        { parent: wrist, names: [`thumb${sf}a`, `thumb${sf}b`, `thumb${sf}c`], role: "digit" },
      );
      b.sweep(thumb, [0.022, 0.017], { color: PAW, caps: "round", sides: 6 });
      b.spike(thumb.tip!, thumb.tip!, 0.022, 0.008, { color: BROWN, sides: 5 });
    } else {
      // fist round the staff
      for (const [j, dy] of [-0.044, -0.01, 0.024].entries()) {
        const f = b.chain(
          `finger${sf}${j + 1}`,
          catmull([
            [w.x - 0.05, w.y + dy, w.z + 0.01],
            [w.x - 0.034, w.y + dy, w.z + 0.056],
            [w.x + 0.02, w.y + dy, w.z + 0.064],
            [w.x + 0.052, w.y + dy, w.z + 0.02],
          ]),
          {
            parent: wrist,
            names: [`finger${sf}${j + 1}a`, `finger${sf}${j + 1}b`, `finger${sf}${j + 1}c`, `finger${sf}${j + 1}d`],
            role: "digit",
          },
        );
        b.sweep(f, 0.018, { color: PAW, caps: "round", sides: 6 });
        b.spike(f.tip!, f.tip!, 0.02, 0.008, { color: BROWN, sides: 5 });
      }
      const thumb = b.chain(
        `thumb${sf}`,
        catmull([
          [w.x + 0.05, w.y + 0.07, w.z - 0.01],
          [w.x + 0.045, w.y + 0.07, w.z + 0.04],
          [w.x + 0.005, w.y + 0.072, w.z + 0.068],
        ]),
        { parent: wrist, names: [`thumb${sf}a`, `thumb${sf}b`], role: "digit" },
      );
      b.sweep(thumb, 0.019, { color: PAW, caps: "round", sides: 6 });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // The staff

  const staff = b.joint("staff", { parent: wristR, at: STAFF_B, aim: STAFF_T });
  const shaftPath = [STAFF_B.clone().addScaledVector(STAFF_A, 0.2), STAFF_T.clone()];
  const shaft = b.sweep(shaftPath, (t) => 0.03 + 0.003 * Math.sin(t * 38), {
    color: WOODP,
    bone: staff,
    sides: 8,
    caps: "flat",
  });
  // ferrule on the floor
  b.spike(STAFF_B.clone().addScaledVector(STAFF_A, 0.22), STAFF_B, null, 0.04, { color: GOLD_D, bone: staff, sides: 8 });
  b.rod(onStaff(0.2), onStaff(0.24), 0.043, { color: GOLD, bone: staff, sides: 8 });
  b.rod(onStaff(0.245), onStaff(0.262), 0.036, { color: GOLD_D, bone: staff, sides: 8 });
  // grip wrap
  b.rod(onStaff(0.44), onStaff(0.7), 0.035, { color: LEATHERP, bone: staff, sides: 8 });
  b.rod(onStaff(0.435), onStaff(0.455), 0.04, { color: GOLD, bone: staff, sides: 8 });
  b.rod(onStaff(0.685), onStaff(0.705), 0.04, { color: GOLD, bone: staff, sides: 8 });
  // gold bands and a gold wire coil up the shaft
  for (const y of [0.95, 1.2, 1.42]) {
    b.rod(onStaff(y), onStaff(y + 0.02), 0.038, { color: GOLD, bone: staff, sides: 8 });
    b.rod(onStaff(y + 0.024), onStaff(y + 0.036), 0.034, { color: GOLD_D, bone: staff, sides: 8 });
  }
  b.sweep(
    spiral(onStaff(0.96), onStaff(0.96).add(new THREE.Vector3(0.036, 0, 0)), STAFF_A, { turns: 4, r1: 0.036, pitch: 0.06 }),
    0.005,
    { color: GOLD, bone: staff, sides: 4, detail: 0.5 },
  );
  b.rod(onStaff(1.53), onStaff(1.6), [0.034, 0.04], { color: GOLD_D, bone: staff, sides: 8 });
  // glowing runes down the shaft
  const shaftSurf = b.surface(shaft);
  for (const [i, y] of [0.8, 1.06, 1.3].entries()) {
    const c = onStaff(y);
    const hit = shaftSurf.ray([c.x, c.y, c.z + 0.3], [0, 0, -1]);
    if (hit)
      glow(
        b.decal(shaft, RUNES[i % RUNES.length], { at: hit.at, dir: [0, 0, 1], size: [0.04, 0.06], bone: staff, lift: 0.0015 }),
        1.3,
      );
  }
  // hanging ribbons and charm just under the head
  const ribJ = b.joint("ribbonAnchor", { parent: staff, at: onStaff(1.5), dir: [0, -1, 0] });
  for (const r of [
    { n: "ribbonA", off: [-0.03, 0, 0.035], len: 0.26 },
    { n: "ribbonB", off: [0.035, 0, -0.025], len: 0.2 },
  ]) {
    const base = onStaff(1.5).add(new THREE.Vector3(...r.off));
    const ch = b.chain(
      r.n,
      catmull([
        base,
        base.clone().add(new THREE.Vector3(0.0, -r.len * 0.5, 0.0)),
        base.clone().add(new THREE.Vector3(0.0, -r.len * 0.98, 0.0)),
      ]),
      { parent: ribJ, names: [`${r.n}1`, `${r.n}2`, `${r.n}3`] },
    );
    b.cards([frame(base, [0, 1, 0])], RIBBON, { size: [0.04, r.len], lean: 180, flow: [0, 0, 1], color: INDIGO_L, bone: ch.joints[0] });
    b.part(new THREE.SphereGeometry(0.014, 6, 5), GOLD, { at: ch.at(1).at.clone().add(new THREE.Vector3(0, -0.01, 0)), bone: ch.joints[2] });
  }

  // crescent head
  const C = STAFF_T.clone().addScaledVector(STAFF_A, 0.25);
  const side = new THREE.Vector3(1, 0, 0);
  const crescent: OutlinePoint[] = [];
  const Rout = 0.25;
  const Rin = 0.185;
  for (let i = 0; i <= 12; i++) {
    const a = ((158 + (i / 12) * 224) * Math.PI) / 180;
    crescent.push(i === 0 || i === 12 ? [Math.cos(a) * Rout, Math.sin(a) * Rout, "sharp"] : [Math.cos(a) * Rout, Math.sin(a) * Rout]);
  }
  for (let i = 0; i <= 12; i++) {
    const a = ((382 - (i / 12) * 224) * Math.PI) / 180;
    crescent.push([Math.cos(a) * Rin, 0.06 + Math.sin(a) * Rin]);
  }
  b.extrude(crescent, { at: C, x: side, y: STAFF_A, thickness: 0.036, bevel: 0.01, color: GOLD, bone: staff });
  // glowing cyan inlay on the crescent
  const inlay: OutlinePoint[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = ((174 + (i / 12) * 192) * Math.PI) / 180;
    inlay.push([Math.cos(a) * 0.232, Math.sin(a) * 0.232]);
  }
  for (let i = 0; i <= 12; i++) {
    const a = ((364 - (i / 12) * 192) * Math.PI) / 180;
    inlay.push([Math.cos(a) * 0.205, 0.06 + Math.sin(a) * 0.205]);
  }
  glow(b.extrude(inlay, { at: C, x: side, y: STAFF_A, thickness: 0.041, color: CYAN, bone: staff }), 1.2);
  // horns of the crescent
  for (const s of [1, -1]) {
    const tip = C.clone().addScaledVector(side, s * 0.232).addScaledVector(STAFF_A, 0.094);
    b.spike(tip, STAFF_A, 0.1, 0.02, { color: GOLD, bone: staff, sides: 6 });
    glow(b.part(new THREE.OctahedronGeometry(0.016, 0), MAGENTA, { at: tip.clone().addScaledVector(STAFF_A, 0.115), bone: staff, scale: [1, 1.5, 1], flat: true }), 1.2);
  }
  // crescent seat collar
  b.rod(STAFF_T.clone().addScaledVector(STAFF_A, -0.04), STAFF_T.clone().addScaledVector(STAFF_A, 0.02), 0.042, { color: GOLD, bone: staff, sides: 8 });
  b.rod(STAFF_T.clone().addScaledVector(STAFF_A, 0.02), STAFF_T.clone().addScaledVector(STAFF_A, 0.075), [0.044, 0.026], { color: GOLD_D, bone: staff, sides: 8 });
  // gem at the crescent's foot
  glow(
    b.part(new THREE.OctahedronGeometry(0.026, 0), MAGENTA, {
      at: STAFF_T.clone().addScaledVector(STAFF_A, 0.1).add(new THREE.Vector3(0, 0, 0.03)),
      bone: staff,
      scale: [1, 1.3, 0.8],
      flat: true,
    }),
    1.3,
  );

  // orb with orbiting halos and shards
  const OC = C.clone().addScaledVector(STAFF_A, 0.06);
  const orbit = b.joint("orbit", { parent: staff, at: OC, dir: STAFF_A });
  glow(b.part(new THREE.IcosahedronGeometry(0.125, 1), CYAN, { at: OC, bone: orbit, flat: true }), 1.5);
  glow(b.part(new THREE.OctahedronGeometry(0.07, 0), "#e8ffff", { at: OC, bone: orbit, flat: true, rotation: [20, 30, 0] }), 1.8);
  const halo1 = b.joint("halo1", { parent: orbit, at: OC, dir: STAFF_A });
  const halo2 = b.joint("halo2", { parent: orbit, at: OC, dir: STAFF_A });
  const n1 = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), (32 * Math.PI) / 180);
  const n2 = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), (-32 * Math.PI) / 180);
  b.sweep(catmull(ringPoints(OC, n1, 0.2, 22), { closed: true }), 0.0095, { color: GOLD, bone: halo1, sides: 5 });
  b.sweep(catmull(ringPoints(OC, n2, 0.175, 20), { closed: true }), 0.0085, { color: CYAN, bone: halo2, sides: 5 });
  for (const [i, p] of ringPoints(OC, n1, 0.2, 5).entries()) {
    glow(
      b.part(new THREE.OctahedronGeometry(i % 2 ? 0.02 : 0.028, 0), i % 2 ? MAGENTA : CYAN, {
        at: p,
        bone: halo1,
        scale: [0.8, 1.5, 0.8],
        rotation: [15 * i, 40 * i, 10],
        flat: true,
      }),
      1.3,
    );
  }
  for (const [i, p] of ringPoints(OC, n2, 0.175, 3).entries())
    glow(b.part(new THREE.OctahedronGeometry(0.018, 0), "#e8ffff", { at: p, bone: halo2, scale: [1, 1.4, 1], rotation: [20 * i, 0, 30], flat: true }), 1.4);

  // -------------------------------------------------------------------------------------------------------------
  // Left-hand wisp

  const wisp = b.joint("wisp", { parent: wristL, at: [0.4, 0.62, 0.25], dir: [0, 1, 0] });
  glow(b.part(new THREE.IcosahedronGeometry(0.04, 1), "#ffd96a", { at: [0.4, 0.62, 0.25], bone: wisp, flat: true }), 1.6);
  glow(b.part(new THREE.OctahedronGeometry(0.022, 0), "#ffffff", { at: [0.4, 0.62, 0.25], bone: wisp, flat: true }), 1.8);
  b.sweep(
    catmull(ringPoints(new THREE.Vector3(0.4, 0.62, 0.25), new THREE.Vector3(0.2, 1, 0.3), 0.07, 12), { closed: true }),
    0.004,
    { color: CYAN, bone: wisp, sides: 4 },
  );
  b.sweep(bezier([0.4, 0.57, 0.24], [0.39, 0.52, 0.22], [0.385, 0.49, 0.2]), [0.012, 0.0], { color: "#ffe9a0", bone: wisp, sides: 5, caps: "none" });

  // drifting motes of light
  const motes = b.joint("motes", { parent: staff, at: OC, dir: [0, 1, 0] });
  for (const [i, m] of [
    [-0.2, 1.72, 0.3],
    [-0.05, 1.98, 0.35],
    [-0.7, 1.82, 0.12],
    [-0.62, 1.5, 0.3],
    [-0.18, 1.45, 0.4],
    [-0.78, 2.0, 0.28],
    [0.1, 1.3, 0.34],
    [0.55, 0.95, 0.4],
  ].entries()) {
    glow(
      b.part(new THREE.OctahedronGeometry(i % 3 === 0 ? 0.016 : 0.01, 0), i % 2 ? CYAN : "#ffe9a0", { at: m as [number, number, number], bone: motes, flat: true }),
      1.3,
    );
  }
  return b.root;
}
