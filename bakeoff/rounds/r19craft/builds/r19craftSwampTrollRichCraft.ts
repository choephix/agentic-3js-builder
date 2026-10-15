// Swamp troll: hunched, long-armed, huge-handed brute with curved tusks, a blazing mohawk and a pile of bone fetishes.
// Blizzard/Warcraft look: chunky heroic proportions (small head, giant shoulders, hands and feet), hand-painted
// warm-top / cool-bottom shading baked into paints, saturated palette (teal skin, orange mohawk, ivory, gold) and
// worn leather, rivets and bone trim.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { aim, rng } from "../../../../src/math";
import { cells, mix, mottle, noise, paint, resolve, smoothstep, spots } from "../../../../src/paint";
import type { ColorInput, Paint } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched swamp troll with curved gold-banded tusks, a flaming mohawk, mossy mushroom-studded hump and bone fetishes: skull necklace, bone belt charms, feather totem and tooth bracers.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type Col = string | Paint;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours) and painted surfaces

const GOLD = "#e3aa3c";
const DARK = "#1b1613";
const CLAWC = "#2c2a24";
const EYEC = "#ffe24c";
const MOUTHC = "#47142a";
const TONGUEC = "#c8465c";
const CREAM = "#eadfbb";
const ROPEC = "#c7a76a";
const SOCKET = "#15100d";
const WARTC = "#86b87a";

/** Painted-by-hand lighting: warm highlight on up-facing surfaces, cool shadow underneath. */
const tone = (base: ColorInput, k = 1) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const low = mix(c, "#2b2a4a", smoothstep(0.15, -0.9, n.y) * 0.45 * k);
    return mix(low, "#fff1c4", smoothstep(0.35, 1, n.y) * 0.28 * k);
  });

const skinMottle = mottle("#5a9a6c", "#3f7a5a", { size: 0.25, seed: 4, contrast: 1.3 });
const SKIN = paint((p, n) => {
  let c = resolve(skinMottle, p, n);
  c = mix(c, "#2b4f63", smoothstep(0.1, -0.95, n.y) * 0.5);
  c = mix(c, "#b8d68a", smoothstep(0.35, 1, n.y) * 0.3);
  // pale belly and chest
  if (p.y > 1.12 && p.y < 1.98 && Math.abs(p.x) < 0.46 && p.z > 0.05)
    c = mix(c, "#a9bd86", smoothstep(0.1, 0.5, n.z) * 0.7);
  // mud caked on the feet and shins
  const mud = smoothstep(0.55, 0.12, p.y) * (0.35 + 0.65 * noise(p, 0.12, 9));
  c = mix(c, "#4d3b25", Math.min(1, mud) * 0.8);
  // moss on top faces of shoulders, hump and head
  const moss = smoothstep(0.55, 0.85, n.y) * smoothstep(0.45, 0.65, noise(p, 0.1, 21)) * smoothstep(1.9, 2.2, p.y);
  c = mix(c, "#6f9a2e", moss * 0.9);
  // warts
  const w = cells(p, 0.13, 7);
  if (w.id > 0.62 && w.d1 < 0.14)
    c = mix(c, w.id > 0.85 ? "#cfd08a" : "#7db37f", 0.75 * smoothstep(0.14, 0.08, w.d1));
  // chest tattoo chevrons
  if (n.z > 0.35 && p.y > 1.5 && p.y < 2.0 && Math.abs(p.x) < 0.42 && p.z > 0.2) {
    const k = (p.y + Math.abs(p.x) * 1.3) / 0.07;
    if (k - Math.floor(k) < 0.2 && Math.abs(p.x) > 0.04) c = mix(c, "#1c4a55", 0.85);
  }
  // biceps bands
  if (Math.abs(p.x) > 0.58 && p.y > 1.5 && p.y < 1.95) {
    const k = p.y / 0.05;
    if (k - Math.floor(k) < 0.3) c = mix(c, "#1c4a55", 0.8);
  }
  // cream war-paint stripes on the cheeks
  if (p.z > 0.72 && p.y > 2.24 && p.y < 2.52 && Math.abs(p.x) > 0.05 && Math.abs(p.x) < 0.2 && n.z > 0.15) {
    const k = (p.y + 0.9 * Math.abs(p.x)) / 0.05;
    if (k - Math.floor(k) < 0.28) c = mix(c, "#ece0b0", 0.9);
  }
  return c;
});

const BONEP = tone(mottle("#efe3bf", "#d8c690", { size: 0.05, seed: 6, contrast: 1 }));
const LEATHER = tone(mottle("#8e5c30", "#633f20", { size: 0.07, seed: 2, contrast: 1.2 }));
const DARKLEATHER = tone(mottle("#4f3019", "#352012", { size: 0.06, seed: 5, contrast: 1 }));
const WOODP = tone(mottle("#6f4a2a", "#4d3119", { size: 0.08, seed: 8, contrast: 1 }));
const GOLDP = tone(GOLD, 0.6);
const IVORY = paint((_p, n, s) => {
  const base = mix("#a8884a", "#f4eacb", smoothstep(0, 0.7, s[0]));
  return mix(mix(base, "#5b4a3a", smoothstep(0.2, -0.9, n.y) * 0.35), "#fffbe8", smoothstep(0.5, 1, n.y) * 0.25);
});
const BRAID = paint((_p, _n, s) => (Math.floor(s[0] * 34) % 2 ? "#3a2a22" : "#5d402f"));
const MUSHCAP = spots("#d6482a", "#f6ecd0", { size: 0.035, amount: 0.55, seed: 2 });

const bladePaint = (h: number) =>
  paint((_p, _n, s) => {
    const k = Math.min(1, Math.max(0, s[1] / h));
    return k < 0.5 ? mix("#7c1426", "#e8531c", k * 2) : mix("#e8531c", "#ffc43a", (k - 0.5) * 2);
  });

// ---------------------------------------------------------------------------------------------------------------
// Textures

const featherTex = (a: string, c: string, quill: string) =>
  svg(
    `<svg viewBox="0 0 40 120">
      <path d="M20 118 C6 90 2 50 20 2 C38 50 34 90 20 118Z" fill="${a}"/>
      <path d="M20 110 C12 85 10 55 20 12 C30 55 28 85 20 110Z" fill="${c}"/>
      <path d="M20 118 L20 6" stroke="${quill}" stroke-width="3"/>
      <path d="M20 60 L8 44 M20 76 L7 62 M20 92 L9 82 M20 60 L32 44 M20 76 L33 62 M20 92 L31 82" stroke="${quill}" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

const mossTex = svg(
  `<svg viewBox="0 0 48 80"><g transform="rotate(180 24 40)">
    <path d="M4 0 L14 0 C15 25 12 52 10 78 C5 52 3 25 4 0Z" fill="#3f6b2a"/>
    <path d="M14 0 L26 0 C28 22 24 46 21 70 C16 46 14 22 14 0Z" fill="#5a8a30"/>
    <path d="M26 0 L36 0 C38 25 34 50 31 76 C27 50 25 25 26 0Z" fill="#3a6026"/>
    <path d="M34 0 L44 0 C45 20 42 38 40 58 C36 38 34 20 34 0Z" fill="#78a63c"/>
    <path d="M10 0 L20 0 C20 12 18 24 16 34 C12 24 10 12 10 0Z" fill="#8cbc48"/>
  </g></svg>`,
  { size: 128 },
);

const loinTex = svg(
  `<svg viewBox="0 0 64 80"><g transform="rotate(180 32 40)">
    <path d="M2 0 H62 V60 L54 72 L47 58 L39 79 L31 62 L23 76 L15 59 L8 70 L2 57Z" fill="#7a4d27"/>
    <path d="M2 0 H62 V9 H2Z" fill="#4e2f17"/>
    <path d="M5 13 H59" stroke="#d8c28a" stroke-width="1.6" stroke-dasharray="3 2"/>
    <path d="M32 18 L45 35 L32 52 L19 35Z" fill="#a8302a"/>
    <path d="M32 24 L40 35 L32 46 L24 35Z" fill="#f0d68a"/>
    <path d="M32 29 L36 35 L32 41 L28 35Z" fill="#2d6b6a"/>
    <path d="M8 24 L14 36 L8 48Z M56 24 L50 36 L56 48Z" fill="#c8a24c"/>
    <circle cx="14" cy="62" r="2.6" fill="#efe3bf"/><circle cx="32" cy="66" r="2.6" fill="#efe3bf"/><circle cx="50" cy="62" r="2.6" fill="#efe3bf"/>
  </g></svg>`,
  { size: 256 },
);

const mergeAll = (list: THREE.BufferGeometry[]) => {
  const g = mergeGeometries(list);
  if (!g) throw new Error("merge failed");
  return g;
};

export default function build() {
  const b = createBuilder({ name: "swampTroll", paintSize: 2048 });
  const rand = rng(17);

  const fRed = featherTex("#d8441e", "#ffb13a", "#5a2a14");
  const fTeal = featherTex("#1f8a8a", "#7fe0c8", "#14403f");
  const fBone = featherTex("#e9ddb8", "#fff7dc", "#6b5a3a");

  // ---------------------------------------------------------------------------------------------------------
  // Skeleton
  const HY = 2.4;
  const HZ = 0.68;
  const H = (x: number, y: number, z: number) => V(x, HY + y, HZ + z);

  const hips = b.joint("hips", { at: [0, 1.12, -0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, -0.1],
      [0, 1.55, 0.03],
      [0, 2.0, 0.17],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.05, 0.18],
      [0, 2.2, 0.34],
      [0, 2.33, 0.5],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const neckTip = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", { parent: neckTip, at: H(0, -0.03, -0.17), dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.1, -0.02), aim: H(0, -0.2, 0.3), role: "jaw" });

  // ---------------------------------------------------------------------------------------------------------
  // Torso, pelvis, hump
  const torso = b.loft(
    [
      { at: [0, 1.1, -0.12], w: 0.6, h: 0.5 },
      { at: [0, 1.32, 0.0], w: 0.78, h: 0.72 },
      { at: [0, 1.62, 0.05], w: 0.86, h: 0.66 },
      { at: [0, 1.92, 0.14], w: 1.1, h: 0.7 },
      { at: [0, 2.12, 0.2], w: 1.0, h: 0.56 },
      { at: [0, 2.24, 0.24], w: 0.46, h: 0.38 },
    ],
    { bone: spine, color: SKIN, sides: 12, caps: { start: "round", end: "flat" }, name: "torso" },
  );
  b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, { at: [0, 1.08, -0.1], bone: hips, scale: [0.33, 0.25, 0.29] });
  const hump = b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, {
    at: [0, 2.2, 0.08],
    bone: chest,
    scale: [0.36, 0.26, 0.32],
    name: "hump",
  });
  const chestParts = [torso, hump];
  for (const s of [1, -1]) {
    chestParts.push(
      b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { at: [s * 0.26, 1.86, 0.36], bone: chest, scale: [0.25, 0.2, 0.2] }),
    );
    chestParts.push(b.capsule([0, 2.25, 0.2], [s * 0.56, 2.12, 0.12], 0.15, SKIN, { bone: chest }));
  }
  const chestSurface = b.surface(chestParts);
  const torsoSkin = b.surface(torso);

  // neck
  const neckSweep = b.sweep(neck, [0.21, 0.18, 0.16], SKIN, { name: "neck" });

  // dorsal bone spikes
  b.along(torso, 6, (at) => {
    b.spike(at, at, 0.09, 0.03, BONEP);
  });

  // ---------------------------------------------------------------------------------------------------------
  // Head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { at: H(0, 0, 0), bone: head, scale: [0.2, 0.21, 0.24] });
  // heavy brow, hooded glowing eyes
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { at: H(0, 0.085, 0.215), bone: head, scale: [0.07, 0.05, 0.05] });
  for (const s of [1, -1]) {
    b.capsule(H(s * 0.035, 0.085, 0.215), H(s * 0.175, 0.12, 0.12), [0.042, 0.036], SKIN, { bone: head, sides: 6 });
    glow(
      b.part(new THREE.SphereGeometry(1, 8, 6), EYEC, { at: H(s * 0.09, 0.035, 0.2), bone: head, scale: 0.03 }),
      1.3,
    );
    b.part(new THREE.SphereGeometry(1, 6, 5), SOCKET, { at: H(s * 0.09, 0.035, 0.224), bone: head, scale: [0.01, 0.022, 0.012] });
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { at: H(s * 0.125, -0.05, 0.15), bone: head, scale: 0.06 });
    // nostrils
    b.part(new THREE.SphereGeometry(1, 6, 5), SOCKET, { at: H(s * 0.03, -0.085, 0.41), bone: head, scale: 0.016 });
    // ears: long, swept back, with gold hoops
    const earOutline: OutlinePoint[] = [
      [0, 0],
      [0.1, 0.12],
      [0.34, 0.26],
      [0.52, 0.34, "sharp"],
      [0.3, 0.06],
      [0.12, -0.12],
    ];
    b.extrude(earOutline, {
      at: H(s * 0.19, 0.0, -0.05),
      x: V(s * 0.55, 0, -1).normalize(),
      y: [0, 1, 0],
      thickness: [0.045, 0.01],
      color: SKIN,
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.04, 0.008, 5, 12), GOLDP, { at: H(s * 0.21, -0.03, -0.01), bone: head, dir: [s, 0, 0], axis: "z" });
    b.part(new THREE.TorusGeometry(0.022, 0.007, 5, 10), GOLDP, { at: H(s * 0.3, 0.1, -0.12), bone: head, dir: [s, 0, 0], axis: "z" });
  }
  // muzzle and nose
  b.capsule(H(0, -0.03, 0.12), H(0, -0.04, 0.28), [0.1, 0.085], SKIN, { bone: head, sides: 8, name: "muzzle" });
  b.sweep(catmull([H(0, 0.06, 0.2), H(0, 0.03, 0.33), H(0, -0.04, 0.405)]), [0.04, 0.055, 0.06], SKIN, {
    bone: head,
    sides: 8,
    name: "nose",
  });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 5, 12), GOLDP, { at: H(0, -0.1, 0.42), bone: head, dir: [1, 0, 0], axis: "z" });
  // mouth interior
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTHC, { at: H(0, -0.1, 0.12), bone: head, scale: [0.12, 0.07, 0.1] });
  b.part(new THREE.BoxGeometry(1, 1, 1), MOUTHC, { at: H(0, -0.12, 0.2), bone: head, scale: [0.19, 0.03, 0.3] });
  // upper teeth
  const upper: THREE.BufferGeometry[] = [];
  for (const [x, z] of [[0.04, 0.33], [0.07, 0.28], [0.085, 0.22], [0.09, 0.16]] as const)
    for (const s of [1, -1])
      upper.push(new THREE.ConeGeometry(0.014, 0.05, 5).rotateX(Math.PI).translate(s * x, HY - 0.135, HZ + z));
  b.part(mergeAll(upper), BONEP, { bone: head, at: [0, 0, 0] });

  // lower jaw (on the jaw joint)
  b.frustumBox(H(0, -0.185, 0.0), H(0, -0.185, 0.4), [0.28, 0.11], [0.24, 0.13], { bone: jaw, color: SKIN, name: "jaw" });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { at: H(0, -0.23, 0.4), bone: jaw, scale: [0.11, 0.075, 0.075] });
  b.part(new THREE.SphereGeometry(1, 8, 6), TONGUEC, { at: H(0, -0.135, 0.24), bone: jaw, scale: [0.075, 0.025, 0.15] });
  const lower: THREE.BufferGeometry[] = [];
  for (const [x, z] of [[0.05, 0.38], [0.09, 0.3], [0.1, 0.2], [0.1, 0.1]] as const)
    for (const s of [1, -1]) lower.push(new THREE.ConeGeometry(0.016, 0.045, 5).translate(s * x, HY - 0.108, HZ + z));
  b.part(mergeAll(lower), BONEP, { bone: jaw, at: [0, 0, 0] });

  // tusks with gold and leather wraps
  for (const s of [1, -1]) {
    const tusk = b.sweep(bezier(H(s * 0.1, -0.18, 0.27), H(s * 0.17, -0.12, 0.37), H(s * 0.15, 0.12, 0.39)), [0.036, 0.006], {
      bone: jaw,
      color: IVORY,
      caps: { start: "flat", end: "point" },
      sides: 7,
      name: `tusk${s > 0 ? "L" : "R"}`,
    });
    for (const [t, col] of [[0.3, GOLDP], [0.5, DARKLEATHER]] as const) {
      const pt = tusk.at(t);
      b.part(new THREE.TorusGeometry(0.0 + 0.036 * (1 - t) + 0.006 * t + 0.004, 0.007, 5, 10), col, { at: pt, dir: pt.tangent, axis: "z" });
    }
    // small wart on the cheek and brow
  }
  // moss beard under the chin
  b.cards(
    Array.from({ length: 5 }, (_, i) => frame(H((i - 2) * 0.035, -0.25, 0.2 + i * 0.04), [0, 1, 0])),
    mossTex,
    { size: [0.07, 0.16], lean: 180, flow: [0, 0, 1], bone: jaw, rng: rand, vary: 0.3 },
  );

  // mohawk: ridge strip and overlapping blades
  const angles = [34, 48, 62, 76, 90, 104, 118, 132, 146, 160, 172];
  const heights = [0.13, 0.19, 0.25, 0.3, 0.33, 0.31, 0.27, 0.22, 0.17, 0.14, 0.1];
  const ridge: THREE.Vector3[] = [];
  const bladeOutline = (w: number, h: number): OutlinePoint[] => [
    [-w, 0],
    [w, 0],
    [w * 1.15, h * 0.4],
    [w * 1.7, h, "sharp"],
    [-w * 0.2, h * 0.62],
    [-w * 0.9, h * 0.3],
  ];
  angles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const base = V(0, HY + 0.21 * Math.sin(a), HZ + 0.24 * Math.cos(a));
    ridge.push(V(0, HY + 0.214 * Math.sin(a), HZ + 0.245 * Math.cos(a)));
    const nrm = V(0, Math.sin(a) / 0.21, Math.cos(a) / 0.24).normalize();
    const tan = V(0, Math.cos(a) * 0.21, -Math.sin(a) * 0.24).normalize();
    const h = heights[i];
    const w = 0.04 + 0.06 * h;
    b.extrude(bladeOutline(w, h), {
      at: base.clone().addScaledVector(nrm, -0.03),
      x: tan,
      y: nrm,
      thickness: [0.04, 0.012],
      color: bladePaint(h),
      bone: head,
    });
    if (i % 2 === 1)
      for (const s of [1, -1]) {
        const lean = nrm.clone().addScaledVector(V(s, 0, 0), 0.3).normalize();
        b.extrude(bladeOutline(w * 0.9, h * 0.7), {
          at: base.clone().addScaledVector(nrm, -0.03).add(V(s * 0.035, 0, 0)),
          x: tan,
          y: lean,
          thickness: [0.03, 0.01],
          color: bladePaint(h * 0.7),
          bone: head,
        });
      }
  });
  b.sweep(catmull(ridge), 0.036, "#5a0f1e", { bone: head, sides: 6, name: "ridgeStrip" });
  // hump blades continue the mohawk down the back
  for (const [pos, nrm, tan, h] of [
    [V(0, 2.44, 0.12), V(0, 1, 0), V(0, 0, -1), 0.17],
    [V(0, 2.38, -0.08), V(0, 0.8, -0.6), V(0, -0.6, -0.8), 0.15],
    [V(0, 2.26, -0.2), V(0, 0.35, -0.94), V(0, -0.94, -0.35), 0.12],
  ] as const) {
    b.extrude(bladeOutline(0.05, h), {
      at: pos.clone().addScaledVector(nrm, -0.04),
      x: tan,
      y: nrm,
      thickness: [0.04, 0.012],
      color: bladePaint(h),
      bone: chest,
    });
  }
  // beaded braids hanging from the temples
  for (const s of [1, -1]) {
    const braid = b.sweep(
      catmull([H(s * 0.19, 0.03, -0.06), V(s * 0.31, 2.22, 0.58), V(s * 0.34, 1.98, 0.52), V(s * 0.34, 1.76, 0.56)]),
      0.026,
      BRAID,
      { bone: head, sides: 6, name: `braid${s > 0 ? "L" : "R"}` },
    );
    for (const t of [0.3, 0.55, 0.8]) {
      const pt = braid.at(t);
      b.part(new THREE.TorusGeometry(0.03, 0.012, 5, 10), GOLDP, { at: pt, dir: pt.tangent, axis: "z" });
    }
    const end = braid.at(1);
    b.spike(end, [0, -1, 0.1], 0.12, 0.026, BONEP, { bone: head });
    b.cards([frame(end.at, [0, 1, 0])], fTeal, { size: [0.05, 0.14], lean: 175, flow: [0, 0, 1], bone: head });
  }
  // warts on the face
  for (const hit of b.surface(skull).scatter(7, { rng: rng(3), minDist: 0.07, filter: (h) => h.n.z > 0.2 && h.at.y > HY - 0.1 })) {
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), WARTC, hit, { embed: 0.5, bone: head });
  }

  // ---------------------------------------------------------------------------------------------------------
  // Legs and feet
  const armJ: Record<number, Joint> = {};
  const skinTargets: Array<ReturnType<typeof b.sweep>> = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.32, 1.12, -0.1), [s * 0.46, 0.2, 0.2], [0.52, 0.52], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.46, 0, 0.28],
    });
    const ankle = leg.joints[leg.joints.length - 1];
    const legSweep = b.sweep(leg, [0.27, 0.23, 0.18, 0.15], SKIN, { name: `leg${side}` });
    skinTargets.push(legSweep);
    b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { at: pts[1], bone: leg.joints[1], scale: [0.2, 0.19, 0.2] });
    // anklet with fangs
    const legSkin = b.surface(legSweep);
    const anklet = legSkin.loop(leg.at(0.86), { lift: 0.02 });
    b.sweep(anklet, 0.028, DARKLEATHER);
    b.along(anklet, 6, (at) => {
      b.spike(at, [0, -1, 0.15], 0.08, 0.018, BONEP);
    });
    // foot
    const fx = s * 0.46;
    b.capsule([fx, 0.135, 0.06], [fx, 0.105, 0.33], [0.14, 0.11], SKIN, { bone: ankle, name: `foot${side}` });
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { at: [fx, 0.22, 0.02], bone: ankle, scale: [0.14, 0.12, 0.15] });
    for (let k = 0; k < 3; k++) {
      const o = (k - 1) * 0.1;
      const base = V(fx + o, 0.075, 0.34);
      const tip = V(fx + o * 1.25, 0.055, 0.56);
      const toe = b.joint(`toe${side}${k}`, { parent: ankle, at: base, aim: tip, role: "digit" });
      b.capsule(base, tip, [0.058, 0.045], SKIN, { bone: toe, sides: 7 });
      const dir = tip.clone().sub(base).normalize().add(V(0, -0.15, 0)).normalize();
      b.spike(tip.clone().addScaledVector(dir, -0.02), dir, 0.1, 0.03, CLAWC, { bone: toe, sides: 6 });
    }

    // -------------------------------------------------------------------------------------------------------
    // Arm
    const arm = limb(V(s * 0.66, 2.03, 0.12), [s * 1.02, 0.78, 0.42], [0.68, 0.72], [0, 0, -1]);
    const armChain = b.chain(`arm${side}`, arm, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const wristJ = armChain.joints[armChain.joints.length - 1];
    armJ[s] = armChain.joints[0];
    const armSweep = b.sweep(armChain, [0.2, 0.19, 0.16, 0.125], SKIN, { name: `arm${side}` });
    skinTargets.push(armSweep);
    b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { at: arm[0], bone: armChain.joints[0], scale: [0.29, 0.27, 0.29] });
    // elbow spike
    b.spike(arm[1], [s * 0.3, 0.1, -1], 0.32, 0.06, BONEP, { bone: armChain.joints[1], sides: 6 });
    // bone-studded bracers
    const askin = b.surface(armSweep);
    for (const t of [0.66, 0.8]) b.sweep(askin.loop(armChain.at(t), { lift: 0.02 }), 0.027, DARKLEATHER);
    b.along(askin.loop(armChain.at(0.73), { lift: 0.035 }), 8, (at) => {
      b.part(new THREE.SphereGeometry(0.024, 6, 4), BONEP, { at });
    });

    // hand: oversized palm, curled fingers with claws, thumb
    const wrist = arm[2];
    const d = wrist.clone().sub(arm[1]).normalize();
    const N = V(-s, 0, 0);
    const W = V(0, 0, 1);
    const at = (a: number, dd: number, c: number) =>
      wrist.clone().addScaledVector(d, dd).addScaledVector(W, a).addScaledVector(N, c);
    b.part(new THREE.BoxGeometry(0.2, 0.26, 0.3), SKIN, { at: at(0, 0.13, 0), bone: wristJ, dir: d, up: [0, 0, 1] });
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { at: at(0, 0.02, 0), bone: wristJ, scale: 0.14 });
    const offs = [-0.1, -0.035, 0.03, 0.095];
    const lens = [0.13, 0.15, 0.14, 0.115];
    offs.forEach((a, i) => {
      const L = lens[i];
      const p0 = at(a, 0.26, 0);
      const p1 = p0.clone().addScaledVector(d, L * 0.6).addScaledVector(N, L * 0.18);
      const p2 = p1.clone().addScaledVector(d, L * 0.45).addScaledVector(N, L * 0.4);
      const ch = b.chain(`f${i}${side}`, [p0, p1, p2], {
        parent: wristJ,
        names: [`f${i}${side}a`, `f${i}${side}b`, `f${i}${side}c`],
        role: "digit",
      });
      b.sweep(ch, [0.045, 0.038, 0.03], SKIN, { sides: 7 });
      b.part(new THREE.SphereGeometry(0.052, 7, 5), SKIN, { at: p0, bone: ch.joints[0] });
      const cd = p2.clone().sub(p1).normalize();
      b.spike(p2, cd, 0.085, 0.027, CLAWC, { bone: ch.joints[ch.joints.length - 1], sides: 6 });
    });
    const t0 = at(0.15, 0.12, 0);
    const t1 = t0.clone().add(d.clone().multiplyScalar(0.6).addScaledVector(W, 0.5).addScaledVector(N, 0.1).multiplyScalar(0.15));
    const t2 = t1.clone().add(d.clone().multiplyScalar(0.6).addScaledVector(W, 0.2).addScaledVector(N, 0.4).multiplyScalar(0.13));
    const th = b.chain(`th${side}`, [t0, t1, t2], {
      parent: wristJ,
      names: [`th${side}a`, `th${side}b`, `th${side}c`],
      role: "digit",
    });
    b.sweep(th, [0.055, 0.045, 0.035], SKIN, { sides: 7 });
    b.spike(t2, t2.clone().sub(t1).normalize(), 0.085, 0.029, CLAWC, { bone: th.joints[th.joints.length - 1], sides: 6 });
  }

  // ---------------------------------------------------------------------------------------------------------
  // Skull and bone helpers
  const skullProp = (c: THREE.Vector3, face: THREE.Vector3, S: number, bone: Joint, col: Col) => {
    const q = aim(face, [0, 1, 0], "z");
    const put = (x: number, y: number, z: number) => V(x * S, y * S, z * S).applyQuaternion(q).add(c);
    const sph = (x: number, y: number, z: number, sx: number, sy: number, sz: number, color: Col) =>
      b.part(new THREE.SphereGeometry(1, 8, 6), color, { at: put(x, y, z), quat: q, scale: [sx * S, sy * S, sz * S], bone });
    const box = (x: number, y: number, z: number, sx: number, sy: number, sz: number, color: Col) =>
      b.part(new THREE.BoxGeometry(1, 1, 1), color, { at: put(x, y, z), quat: q, scale: [sx * S, sy * S, sz * S], bone });
    sph(0, 0.12, 0, 0.5, 0.46, 0.52, col);
    box(0, -0.14, 0.16, 0.4, 0.3, 0.4, col);
    sph(0.2, -0.12, 0.3, 0.12, 0.12, 0.12, col);
    sph(-0.2, -0.12, 0.3, 0.12, 0.12, 0.12, col);
    box(0, -0.34, 0.12, 0.3, 0.12, 0.34, col);
    sph(0.18, 0.0, 0.38, 0.13, 0.14, 0.1, SOCKET);
    sph(-0.18, 0.0, 0.38, 0.13, 0.14, 0.1, SOCKET);
    box(0, -0.16, 0.37, 0.07, 0.1, 0.04, SOCKET);
    box(0, -0.27, 0.3, 0.3, 0.035, 0.05, "#b49c66");
  };
  const boneProp = (a: THREE.Vector3, c: THREE.Vector3, r: number, bone: Joint) => {
    b.rod(a, c, r, BONEP, { bone, sides: 6 });
    const d = c.clone().sub(a).normalize();
    const perp = V(0, 0, 1).cross(d);
    if (perp.lengthSq() < 1e-4) perp.set(1, 0, 0);
    perp.normalize();
    for (const end of [a, c])
      for (const k of [-1, 1])
        b.part(new THREE.SphereGeometry(r * 1.5, 6, 4), BONEP, { at: end.clone().addScaledVector(perp, k * r * 0.9), bone });
  };
  const hangFeathers = (pts: THREE.Vector3[], len: number, w: number, bone: Joint) => {
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      [fRed, fTeal, fBone],
      { size: [w, len], lean: 172, flow: [0, 0, 1], bone, rng: rand, vary: 0.2, spin: 12 },
    );
  };

  // ---------------------------------------------------------------------------------------------------------
  // Necklace of fangs with a skull pendant
  const neckLine = chestSurface.drape(
    catmull(
      [
        [0.33, 2.2, 0.15],
        [0.4, 2.05, 0.38],
        [0.2, 1.82, 0.6],
        [0, 1.78, 0.62],
        [-0.2, 1.82, 0.6],
        [-0.4, 2.05, 0.38],
        [-0.33, 2.2, 0.15],
        [0, 2.3, -0.12],
      ],
      { closed: true },
    ),
    { lift: 0.03 },
  );
  b.sweep(neckLine, 0.022, DARKLEATHER, { name: "necklace" });
  const beads: THREE.BufferGeometry[] = [];
  b.along(neckLine, 20, (at) => {
    if (at.at.z > 0.3 && at.at.y < 2.12) {
      b.spike(at, [0, -1, 0.3], 0.1, 0.026, BONEP);
      beads.push(new THREE.SphereGeometry(0.03, 6, 4).translate(at.at.x, at.at.y, at.at.z));
    }
  });
  if (beads.length) b.part(mergeAll(beads), GOLDP, { bone: chest, at: [0, 0, 0] });
  const pend = torsoSkin.ray([0, 1.78, 2], [0, 0, -1]);
  skullProp(V(0, 1.72, (pend ? pend.at.z : 0.5) + 0.06), V(0, -0.15, 1).normalize(), 0.085, chest, BONEP);

  // ---------------------------------------------------------------------------------------------------------
  // Belt with skull buckle, studs and hanging bone fetishes
  const beltLoop = torsoSkin.loop([0, 1.2, 0], { dir: [0, 1, 0], lift: 0.035 });
  b.sweep(beltLoop, 0.048, DARKLEATHER, { name: "belt" });
  b.sweep(torsoSkin.loop([0, 1.28, 0], { dir: [0, 1, 0], lift: 0.03 }), 0.02, LEATHER, { name: "beltTop" });
  const studs: THREE.BufferGeometry[] = [];
  b.along(beltLoop, 26, (at) => {
    const rad = V(at.at.x, 0, at.at.z + 0.03).normalize();
    studs.push(new THREE.SphereGeometry(0.017, 6, 4).translate(at.at.x + rad.x * 0.04, at.at.y, at.at.z + rad.z * 0.04));
  });
  b.part(mergeAll(studs), GOLDP, { bone: hips, at: [0, 0, 0] });
  const buckle = torsoSkin.ray([0, 1.2, 2], [0, 0, -1]);
  const bz = buckle ? buckle.at.z : 0.26;
  b.part(new THREE.BoxGeometry(0.17, 0.14, 0.04), GOLDP, { at: [0, 1.2, bz + 0.07], bone: hips });
  skullProp(V(0, 1.2, bz + 0.1), V(0, 0, 1), 0.06, hips, BONEP);

  const beltAt = (x: number, z: number) => beltLoop.at(beltLoop.closestT(V(x, 1.2, z)));
  // left hip: crossed bones, feathers and a shrunken skull
  const pl = beltAt(0.42, 0.02);
  b.rod(pl, pl.clone().add(V(0.02, -0.14, 0.04)), 0.012, ROPEC, { bone: hips });
  boneProp(pl.clone().add(V(0.0, -0.1, 0.07)), pl.clone().add(V(0.1, -0.4, 0.09)), 0.016, hips);
  boneProp(pl.clone().add(V(0.1, -0.1, 0.07)), pl.clone().add(V(0.0, -0.4, 0.09)), 0.016, hips);
  hangFeathers([pl.clone().add(V(0.06, -0.04, 0.0)), pl.clone().add(V(0.11, -0.03, 0.02)), pl.clone().add(V(0.01, -0.03, 0.03))], 0.3, 0.07, hips);
  b.rod(pl.clone().add(V(0.05, -0.04, 0.12)), pl.clone().add(V(0.05, -0.2, 0.14)), 0.008, ROPEC, { bone: hips });
  skullProp(pl.clone().add(V(0.05, -0.25, 0.15)), V(0.3, 0, 1).normalize(), 0.045, hips, BONEP);
  // right hip: pouch, button and fangs
  const pr = beltAt(-0.42, 0.02);
  b.rod(pr, pr.clone().add(V(-0.02, -0.12, 0.03)), 0.012, ROPEC, { bone: hips });
  b.part(new THREE.SphereGeometry(1, 10, 8), LEATHER, { at: pr.clone().add(V(-0.04, -0.22, 0.05)), bone: hips, scale: [0.1, 0.12, 0.085] });
  b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), DARKLEATHER, {
    at: pr.clone().add(V(-0.04, -0.17, 0.05)),
    bone: hips,
    scale: [0.105, 0.09, 0.09],
  });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLDP, { at: pr.clone().add(V(-0.04, -0.2, 0.13)), bone: hips });
  for (const k of [-1, 0, 1])
    b.spike(pr.clone().add(V(-0.04 + k * 0.05, -0.33, 0.05)), [0, -1, 0.1], 0.1, 0.02, BONEP, { bone: hips });
  hangFeathers([pr.clone().add(V(-0.1, -0.03, 0.02)), pr.clone().add(V(-0.04, -0.03, -0.02))], 0.26, 0.06, hips);
  // back: tail of feathers and a bone
  const pb = beltAt(0, -0.4);
  hangFeathers([pb.clone().add(V(-0.1, -0.02, 0.02)), pb.clone().add(V(0.0, -0.02, 0.0)), pb.clone().add(V(0.1, -0.02, 0.02))], 0.36, 0.08, hips);
  boneProp(pb.clone().add(V(0.0, -0.05, -0.05)), pb.clone().add(V(0.0, -0.4, -0.1)), 0.018, hips);

  // loincloth: layered tattered leather flaps hanging from the belt
  b.cards([frame([0, 1.18, 0.27], [0, 1, 0])], loinTex, { size: [0.4, 0.5], lean: 150, flow: [0, 0, 1], bone: hips });
  b.cards([frame([0.16, 1.14, 0.28], [0, 1, 0]), frame([-0.16, 1.14, 0.28], [0, 1, 0])], loinTex, {
    size: [0.22, 0.34],
    lean: 140,
    flow: [0, 0, 1],
    bone: hips,
    color: "#d8c0a0",
  });
  b.cards([frame([0, 1.18, -0.34], [0, 1, 0])], loinTex, { size: [0.44, 0.55], lean: 155, flow: [0, 0, -1], bone: hips });

  // ---------------------------------------------------------------------------------------------------------
  // Shoulders: right gets bone spikes, left carries a feather-and-skull totem
  const sr = armJ[-1];
  for (const [dx, dy, dz] of [[-0.5, 1, 0], [-0.9, 0.7, -0.2], [-0.2, 0.8, -0.7]] as const) {
    const dir = V(dx, dy, dz).normalize();
    b.spike(V(-0.66, 2.03, 0.12).addScaledVector(dir, 0.2), dir, 0.3, 0.05, BONEP, { bone: sr, sides: 6 });
  }
  b.sweep(
    b.surface(b.root.children.length ? hump : hump).loop([0, 2.2, 0.08], { dir: [1, 0, 0], lift: 0.0 }),
    0.001,
    DARKLEATHER,
    { name: "humpHairline", detail: 0.3 },
  );
  const sl = armJ[1];
  const poleA = V(0.7, 2.22, 0.1);
  const poleB = V(0.76, 2.78, 0.04);
  b.rod(poleA, poleB, 0.026, WOODP, { bone: sl, sides: 6, name: "totemPole" });
  skullProp(poleB.clone().add(V(0, 0.07, 0.02)), V(0.2, 0, 1).normalize(), 0.075, sl, BONEP);
  for (const t of [0.35, 0.6]) {
    const p = poleA.clone().lerp(poleB, t);
    b.part(new THREE.TorusGeometry(0.03, 0.01, 5, 10), DARKLEATHER, { at: p, bone: sl, dir: poleB.clone().sub(poleA), axis: "z" });
  }
  hangFeathers([V(0.7, 2.62, 0.08), V(0.82, 2.6, 0.04), V(0.76, 2.55, 0.12)], 0.3, 0.07, sl);
  b.rod(V(0.7, 2.5, 0.1), V(0.7, 2.38, 0.12), 0.008, ROPEC, { bone: sl });
  b.spike(V(0.7, 2.38, 0.12), [0, -1, 0], 0.09, 0.02, BONEP, { bone: sl });

  // ---------------------------------------------------------------------------------------------------------
  // Swamp growth: mushrooms and hanging moss on the hump and shoulders
  for (const [x, z, sc] of [[0.1, 0.05, 1], [-0.14, 0.14, 0.8], [0.22, -0.06, 0.65], [-0.05, -0.1, 0.55]] as const) {
    const hit = chestSurface.ray([x, 3, z], [0, -1, 0]);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.018 * sc, 0.026 * sc, 0.1 * sc, 6), CREAM, hit, { embed: 0.3 });
    b.part(new THREE.SphereGeometry(0.06 * sc, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), MUSHCAP, {
      at: hit.moved([0, 0.085 * sc, 0]),
      dir: hit.axis,
    });
  }
  const mossHits = chestSurface.scatter(14, { rng: rng(5), minDist: 0.12, filter: (h) => h.n.y > 0.5 && h.at.y > 2.0 });
  b.cards(
    mossHits.map((h) => frame(h, [0, 1, 0])),
    mossTex,
    { size: [0.13, 0.22], lean: 180, flow: [0, 0, 1], rng: rand, vary: 0.3, spin: 30 },
  );

  // warts across body and limbs
  for (const hit of b
    .surface([torso, ...skinTargets])
    .scatter(16, { rng: rng(11), minDist: 0.22, filter: (h) => h.n.y > -0.2 && h.at.y > 0.4 && h.at.y < 2.2 })) {
    b.stick(new THREE.SphereGeometry(0.026, 6, 4), WARTC, hit, { embed: 0.5 });
  }

  // neck is swept after the head parts so surface() above sees it; keep reference alive
  void neckSweep;

  // open the jaw a little for the rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}
