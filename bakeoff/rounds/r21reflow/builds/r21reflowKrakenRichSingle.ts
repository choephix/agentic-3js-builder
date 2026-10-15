import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { gradient, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "A towering kraken heaving out of the sea: squid-crowned head with glowing eyes and face tendrils, armoured shoulders, a glowing-runed torso and eight spread tentacles, curled tips and sucker rows.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const TEAL = "#1f8f9a";
const DEEP = "#16406b";
const PURPLE = "#5a3fa0";
const CORAL = "#ff7f66";
const CORAL_D = "#d9503f";
const CREAM = "#ffd9a8";
const CYAN = "#35f2ff";
const NAVY = "#232a63";
const INK = "#12132b";
const SUCK_IN = "#7a2a3a";
const WATER = "#1d6f86";
const FOAM = "#cdf4f8";

const RUNE = svg(
  `<svg viewBox="0 0 64 128">
    <path d="M32 120 C10 100 12 70 32 62 C50 55 50 34 32 30 C22 28 20 16 30 10" stroke="${CYAN}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M32 98 C44 92 48 80 40 72" stroke="${CYAN}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M30 50 C20 48 16 40 20 34" stroke="${CYAN}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="122" r="4" fill="${CYAN}"/>
  </svg>`,
  { size: 256 },
);

const PROFILES: Record<string, number[][]> = {
  A: [
    [0.5, 1.4],
    [1.4, 1.8],
    [2.4, 1.1],
    [3.2, 0.35],
    [4.0, 0.18],
    [4.8, 0.35],
    [5.2, 0.9],
    [4.9, 1.4],
    [4.4, 1.35],
  ],
  B: [
    [0.5, 1.6],
    [1.1, 2.7],
    [1.9, 3.6],
    [2.9, 4.1],
    [3.8, 3.7],
    [4.1, 2.8],
    [3.6, 2.3],
    [3.2, 2.7],
  ],
  C: [
    [0.5, 1.3],
    [1.6, 1.5],
    [2.7, 0.8],
    [3.7, 0.25],
    [4.7, 0.2],
    [5.6, 0.55],
    [5.9, 1.3],
    [5.4, 1.9],
    [4.9, 1.7],
  ],
};
const TYPES = ["A", "C", "B", "A", "C", "A", "B", "C"];

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const random = rng(11);

  // ---- Skeleton
  const hips = b.joint("hips", { at: [0, 1.3, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.3, 0],
      [0, 2.0, 0],
      [0, 2.8, 0.1],
      [0, 3.5, 0.25],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: chest, at: [0, 3.5, 0.25], dir: [0, 0.5, 0.4], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.95, 0.5], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.98, 0.85], aim: [0, 3.85, 1.25], role: "jaw" });

  // ---- Water
  b.lathe(
    [
      [0, 0],
      [6.1, 0],
      [6.1, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], bone: hips, segments: 28, color: WATER, name: "sea" },
  );
  b.lathe(
    [
      [0, 0],
      [2.3, 0],
      [2.2, 0.15],
      [1.5, 0.6],
      [0.95, 1.0],
      [0, 1.05],
    ],
    { at: [0, 0, 0], bone: hips, segments: 16, color: WATER, name: "mound" },
  );
  for (const R of [2.6, 3.7, 4.9])
    b.part(new THREE.TorusGeometry(R, 0.05, 4, 40), FOAM, { at: [0, 0.12, 0], dir: [0, 1, 0], axis: "z", bone: hips });
  b.part(new THREE.TorusGeometry(1.9, 0.14, 5, 20), FOAM, { at: [0, 0.3, 0], dir: [0, 1, 0], axis: "z", bone: hips });
  const drops: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 40; i++) {
    const ang = random() * Math.PI * 2;
    const rr = 1.6 + random() * 4;
    drops.push(
      new THREE.SphereGeometry(0.04 + random() * 0.05, 5, 4).translate(
        Math.sin(ang) * rr,
        0.5 + random() * 3.5,
        Math.cos(ang) * rr,
      ),
    );
  }
  const dropGeo = mergeGeometries(drops);
  if (dropGeo) b.part(dropGeo, FOAM, { bone: hips, at: [0, 0, 0], name: "droplets" });

  // ---- Torso
  const BODY = cel(mottle(TEAL, DEEP, { size: 0.7, seed: 3, contrast: 1.5 }));
  const BELLY = cel("#ff9b7a");
  const torsoPaint = paint((_p, n) => (n.z > 0.5 ? BELLY : BODY));
  b.part(new THREE.SphereGeometry(1, 12, 8), BODY, {
    bone: hips,
    at: [0, 1.15, 0],
    scale: [1.05, 0.85, 1.05],
    name: "skirt",
  });
  const torso = b.sweep(spine, (t) => [0.8 + 0.3 * Math.sin(Math.min(t, 1) * Math.PI * 0.8), 0.72 + 0.12 * t], {
    color: torsoPaint,
    sides: 12,
    name: "torso",
  });
  for (let k = 0; k < 6; k++) {
    const p = torso.at(0.14 + k * 0.13, 180);
    b.stick(new THREE.BoxGeometry(0.7 - k * 0.03, 0.08, 0.17), CREAM, p, { embed: 0.5 });
  }
  glow(
    b.sweep(torso.line(180, 0.06).slice(0.08, 0.92), 0.025, CYAN, {
      bone: spine,
      sides: 5,
      name: "chestGlow",
    }),
    1.4,
  );
  for (const s of [1, -1]) {
    const p = torso.at(0.7, 90 * s);
    glow(
      b.decal(torso, RUNE, { at: p, dir: p, up: [0, 1, 0], size: [0.55, 1.0], mirror: s > 0, name: "torsoRune" }),
      1.3,
    );
  }
  b.extrude(
    [
      [0, -1.0],
      [0.5, -0.5],
      [0.9, 0.1, "sharp"],
      [0.5, 0.15],
      [0.55, 0.55, "sharp"],
      [0.15, 0.4],
      [0, 1.0],
    ],
    { at: [0, 2.6, -0.45], x: [0, 0, -1], thickness: 0.07, bevel: 0.02, color: CORAL, bone: chest, name: "backFin" },
  );

  // ---- Shoulders
  for (const s of [1, -1]) {
    const c: [number, number, number] = [s * 0.95, 3.25, 0.1];
    const axis = [s, 0.6, 0.0];
    b.lathe(
      [
        [0, 0],
        [0.42, 0],
        [0.38, 0.14],
        [0.2, 0.26],
        [0, 0.3],
      ],
      { at: c, axis, bone: chest, segments: 8, color: NAVY, name: "pauldron" },
    );
    b.part(new THREE.TorusGeometry(0.42, 0.04, 4, 10), CORAL, { at: c, dir: axis, axis: "z", bone: chest });
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), CYAN, { at: [s * 1.06, 3.45, 0.1], bone: chest }), 1.5);
    for (let i = 0; i < 3; i++)
      b.spike([s * (0.85 + i * 0.12), 3.55, -0.1 + i * 0.18], [s * 0.5, 0.9, 0.0], 0.45 - i * 0.07, 0.09, CORAL, {
        bone: chest,
      });
  }

  // ---- Neck and head
  b.capsule([0, 3.5, 0.25], [0, 4.0, 0.5], 0.5, BODY, { bone: neck, sides: 10, name: "neckTube" });
  const C = [0, 4.35, 0.65];
  const HEADP = cel(mottle(TEAL, PURPLE, { size: 0.45, seed: 9 }));
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADP, {
    bone: head,
    at: C,
    scale: [0.62, 0.75, 0.6],
    name: "skull",
  });
  glow(
    b.decal(skull, RUNE, { at: [0, 4.95, 0.95], dir: [0, 0.6, 0.8], size: [0.4, 0.65], name: "headRune" }),
    1.3,
  );
  b.extrude(
    [
      [0.45, 0],
      [-0.1, 0.95, "sharp"],
      [-0.5, 0.5],
      [-0.85, 0.8, "sharp"],
      [-1.0, -0.1],
    ],
    { at: [0, 4.8, 0.75], x: [0, 0, 1], thickness: 0.07, bevel: 0.02, color: CORAL, bone: head, name: "crest" },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.7, 0.5, "sharp"],
        [0.55, 0.05],
        [0.85, -0.3, "sharp"],
        [0.4, -0.35],
      ],
      {
        at: [s * 0.55, 4.45, 0.5],
        x: [s, 0, -0.3],
        y: [0, 1, 0],
        thickness: 0.05,
        bevel: 0.015,
        color: CORAL_D,
        bone: head,
        name: "frill",
      },
    );
    b.spike([s * 0.4, 4.85, 0.45], [s * 0.6, 0.7, -0.5], 0.7, 0.1, CORAL, { bone: head, name: "horn" });
    glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), CYAN, { bone: head, at: [s * 0.28, 4.42, 1.14], scale: [1.3, 0.7, 0.6], name: "eye" }), 1.8);
    b.part(new THREE.SphereGeometry(0.06, 6, 4), INK, { bone: head, at: [s * 0.28, 4.42, 1.19], scale: [0.3, 1.1, 0.4], name: "pupil" });
    b.rod([s * 0.1, 4.58, 1.22], [s * 0.5, 4.52, 1.14], 0.05, NAVY, { bone: head, sides: 5, name: "brow" });
  }
  b.part(new THREE.SphereGeometry(0.28, 8, 6), INK, { bone: head, at: [0, 3.97, 1.05], scale: [1, 0.7, 1], name: "mouth" });
  b.spike([0, 4.12, 1.15], [0, -0.5, 0.7], 0.3, 0.12, CREAM, { bone: head, name: "beak" });
  b.part(new THREE.SphereGeometry(1, 10, 6), CREAM, {
    bone: jaw,
    at: [0, 3.85, 1.0],
    scale: [0.38, 0.2, 0.4],
    name: "jawMesh",
  });

  // Face tendrils
  const TX = [-0.3, -0.12, 0.12, 0.3];
  TX.forEach((x, i) => {
    const len = i === 0 || i === 3 ? 1.0 : 0.8;
    const ch = b.chain(
      `tendril${i}`,
      catmull([
        [x, 3.95, 1.1],
        [x * 1.8, 3.5, 1.35],
        [x * 2.2, 3.0 - len * 0.2, 1.5],
        [x * 2.6, 2.5 - len * 0.5, 1.4],
      ]),
      { parent: jaw, names: [`tendril${i}a`, `tendril${i}b`, `tendril${i}c`], role: "tentacle" },
    );
    b.sweep(ch, [0.075, 0.02], gradient(CORAL, CREAM, [x, 3.95, 1.1], [x * 2.6, 2.5, 1.4]), { sides: 6, name: "tendril" });
  });

  // ---- Tentacles
  TYPES.forEach((type, k) => {
    const a = ((k * 45 + 22.5) * Math.PI) / 180;
    const pts = PROFILES[type].map(([r, y], i) => {
      const rr = r * 0.9;
      const lat = 0.3 * Math.sin(k * 2.1 + i * 1.2) * (rr / 5);
      return [Math.sin(a) * rr + Math.cos(a) * lat, y, Math.cos(a) * rr - Math.sin(a) * lat];
    });
    const path = catmull(pts);
    const names = Array.from({ length: 6 }, (_, j) => `tent${k}_${j + 1}`);
    const chain = b.chain(`tent${k}`, path, { parent: hips, count: 6, names, role: "tentacle" });
    const rad = (t: number) => 0.04 + 0.4 * Math.pow(1 - t, 1.3);
    const isB = type === "B";
    const sAng = isB ? 180 : 50;
    const gAng = isB ? 70 : -60;
    const spAng = isB ? 0 : 230;
    const skin = gradient(cel(TEAL), cel(PURPLE), path.at(0), path.at(1));
    const sw = b.sweep(chain, rad, skin, {
      sectors: [[sAng - 40, sAng + 40, CORAL_D]],
      sides: 8,
      name: "tentacle",
    });
    for (let j = 0; j < 12; j++) {
      const t = 0.1 + (0.78 * j) / 11;
      const r = rad(t);
      const p = sw.at(t, sAng);
      b.stick(new THREE.CylinderGeometry(r * 0.6, r * 0.7, 0.07, 8), CORAL, p, { embed: 0.4 });
      b.stick(new THREE.CylinderGeometry(r * 0.32, r * 0.32, 0.08, 6), SUCK_IN, p, { embed: 0.2 });
    }
    for (let j = 0; j < 6; j++) {
      const t = 0.12 + j * 0.1;
      const sc = Math.max(0.5, rad(t) * 3);
      b.stick(new THREE.ConeGeometry(0.05 * sc, 0.18 * sc, 5), CORAL, sw.at(t, spAng), { embed: 0.2 });
    }
    for (const [t0, t1] of [
      [0.1, 0.22],
      [0.28, 0.44],
      [0.5, 0.66],
    ])
      glow(b.sweep(sw.line(gAng, 0.012).slice(t0, t1), 0.02, CYAN, { bone: chain, sides: 5, name: "tentGlow" }), 1.4);
  });

  return b.root;
}
