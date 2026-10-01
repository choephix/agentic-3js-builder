import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { mottle, paint } from "../src/paint";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Gingerbread Golem",
  description:
    "A hulking gingerbread golem built from house panels: blocky crumbly body with toasted edges, royal icing piping, gumdrop eyes and buttons, candy-corn teeth, cookie fists and a candy-cane club.",
};

// Flat colours (paints and textures don't count toward the colour budget).
const ICING = "#fff6ea";
const PEARL = "#ffffff";
const RED = "#d8262c";
const LEAF = "#3fa34d";
const ORANGE = "#ef8b2c";
const LEMON = "#f2c230";
const GRAPE = "#7b4fc4";
const CHOCO = "#3d2410";
const CAVITY = "#2a1408";
const AMBER = "#ffb347";
const COOKIE = "#8a4d16";

// Baked crumbly gingerbread with darker toasted flecks.
const GINGER = mottle("#a2601f", "#7a3f10", { size: 0.04, contrast: 0.55, seed: 5 });
// Candy-corn bands keyed to world height around the mouth.
const CORN = paint((p) => (p.y > 1.985 ? ICING : p.y > 1.955 ? ORANGE : LEMON));
// Candy-cane spiral on the club handle, keyed to the sweep's own [t, deg].
const CANE = paint((_p, _n, s) => ((((s[1] - 720 * s[0]) % 90) + 90) % 90 < 45 ? RED : ICING));

const PEPP = svg(
  `<svg viewBox="0 0 128 128">` +
    `<circle cx="64" cy="64" r="60" fill="#fff8f0"/>` +
    `<path d="M64 64 L124 64 A60 60 0 0 0 94 12.04 Z" fill="#d8262c"/>` +
    `<path d="M64 64 L34 12.04 A60 60 0 0 0 4 64 Z" fill="#d8262c"/>` +
    `<path d="M64 64 L34 115.96 A60 60 0 0 0 94 115.96 Z" fill="#d8262c"/>` +
    `<circle cx="64" cy="64" r="9" fill="#d8262c"/>` +
    `<circle cx="64" cy="64" r="60" fill="none" stroke="#d8262c" stroke-width="7"/>` +
    `</svg>`,
  { size: 256 },
);

/** A gumdrop (squashed sphere) seated on a surface frame, riding a bone. */
function gumdrop(
  b: Builder,
  at: [number, number, number],
  dir: [number, number, number],
  r: number,
  color: string,
  bone: Joint,
): void {
  const geo = new THREE.SphereGeometry(r, 8, 6);
  geo.scale(1, 0.88, 0.8);
  b.stick(geo, color, frame(at, dir), { bone, embed: 0.35 });
}

/** An icing piping tube between two model-space points, riding a bone. */
function pipe(b: Builder, a: [number, number, number], c: [number, number, number], r: number, bone: Joint): void {
  b.capsule(a, c, r, { bone, color: ICING });
}

export default function build() {
  const b = createBuilder({ name: "gingerbreadGolem" });

  // ---- Skeleton: pelvis root, spine, head + jaw, arms held out, planted legs ----
  const pelvis = b.joint("pelvis", { at: [0, 1.22, 0], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: pelvis, at: [0, 1.58, 0.005], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.88, 0.02], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.0, 0.05], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.94, 0.1], dir: [0, -0.3, 1], role: "jaw" });

  const wristOf: Record<string, Joint> = {};
  const elbowOf: Record<string, Joint> = {};
  const kneeOf: Record<string, Joint> = {};
  const ankleOf: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const armPts = limb([s * 0.33, 1.72, 0], [s * 0.64, 1.26, 0.07], [0.34, 0.31], [0, -1, -0.3]);
    const arm = b.chain(`arm${tag}`, armPts, {
      parent: chest,
      names: [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`],
      role: "arm",
    });
    elbowOf[tag] = arm.joints[1];
    wristOf[tag] = arm.tip!;
    const legPts = limb([s * 0.16, 1.15, 0], [s * 0.2, 0.12, 0.03], [0.55, 0.5], [0, 0, 1]);
    const leg = b.chain(`leg${tag}`, legPts, {
      parent: pelvis,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
      role: "leg",
      contact: [s * 0.2, 0, 0.07],
    });
    kneeOf[tag] = leg.joints[1];
    ankleOf[tag] = leg.tip!;
  }

  // ---- Torso: gingerbread wall panel, toasted corner posts, icing seams ----
  b.frustumBox([0, 1.18, 0], [0, 1.9, 0.02], [0.56, 0.36], [0.66, 0.42], { bone: chest, color: GINGER });
  for (const sx of [1, -1]) {
    b.rod([sx * 0.27, 1.2, -0.17], [sx * 0.32, 1.88, -0.2], 0.045, { bone: pelvis, color: GINGER });
    b.rod([sx * 0.27, 1.2, 0.17], [sx * 0.32, 1.88, 0.2], 0.045, { bone: pelvis, color: GINGER });
    pipe(b, [sx * 0.3, 1.2, 0.19], [sx * 0.35, 1.88, 0.22], 0.018, pelvis);
    pipe(b, [sx * 0.3, 1.2, -0.19], [sx * 0.35, 1.88, -0.22], 0.018, pelvis);
  }
  // Icing belt and collar rings around the panel.
  const belt = b.sweep(
    catmull(
      [
        [0.3, 1.32, 0.19],
        [0, 1.32, 0.22],
        [-0.3, 1.32, 0.19],
        [-0.32, 1.32, 0],
        [-0.3, 1.32, -0.19],
        [0, 1.32, -0.22],
        [0.3, 1.32, -0.19],
        [0.32, 1.32, 0],
      ],
      { closed: true },
    ),
    0.022,
    { bone: pelvis, color: ICING },
  );
  b.sweep(
    catmull(
      [
        [0.32, 1.87, 0.2],
        [0, 1.87, 0.235],
        [-0.32, 1.87, 0.2],
        [-0.34, 1.87, 0],
        [-0.32, 1.87, -0.2],
        [0, 1.87, -0.235],
        [0.32, 1.87, -0.2],
        [0.34, 1.87, 0],
      ],
      { closed: true },
    ),
    0.02,
    { bone: chest, color: ICING },
  );
  // Sugar pearls studded round the belt.
  b.along(belt, 12, (at) => {
    b.stick(new THREE.SphereGeometry(0.013, 6, 5), PEARL, at, { bone: pelvis, embed: 0.3 });
  });

  // ---- Window frame of icing with a warm glowing pane ----
  const pane = b.part(new THREE.PlaneGeometry(0.2, 0.24), AMBER, {
    bone: chest,
    at: [0, 1.62, 0.222],
    dir: [0, 0, 1],
    axis: "z",
  });
  glow(pane, 1.2);
  const wx = 0.12;
  const wy0 = 1.48;
  const wy1 = 1.76;
  const wz = 0.228;
  pipe(b, [-wx, wy0, wz], [wx, wy0, wz], 0.018, chest);
  pipe(b, [-wx, wy1, wz], [wx, wy1, wz], 0.018, chest);
  pipe(b, [-wx, wy0, wz], [-wx, wy1, wz], 0.018, chest);
  pipe(b, [wx, wy0, wz], [wx, wy1, wz], 0.018, chest);
  pipe(b, [0, wy0, wz], [0, wy1, wz], 0.012, chest);
  pipe(b, [-wx, 1.62, wz], [wx, 1.62, wz], 0.012, chest);
  // Gumdrop buttons below the window + icing seams down the back.
  gumdrop(b, [0, 1.42, 0.2], [0, 0, 1], 0.035, RED, chest);
  gumdrop(b, [0, 1.26, 0.195], [0, 0, 1], 0.035, LEAF, pelvis);
  pipe(b, [0, 1.2, -0.2], [0, 1.86, -0.22], 0.016, pelvis);

  // ---- Neck + head: blocky cranium with piped edges ----
  b.capsule([0, 1.8, 0.02], [0, 2.02, 0.045], 0.1, { bone: neck, color: GINGER });
  b.part(new THREE.BoxGeometry(0.4, 0.36, 0.38), GINGER, { bone: head, at: [0, 2.16, 0.06] });
  const hxo = 0.2;
  const hy0 = 1.98;
  const hy1 = 2.34;
  const hzo = -0.13;
  const hzf = 0.25;
  for (const sx of [1, -1]) {
    pipe(b, [sx * hxo, hy0, hzo], [sx * hxo, hy1, hzo], 0.02, head);
    pipe(b, [sx * hxo, hy0, hzf], [sx * hxo, hy1, hzf], 0.02, head);
    pipe(b, [sx * hxo, hy1, hzo], [sx * hxo, hy1, hzf], 0.02, head);
  }
  pipe(b, [-hxo, hy1, hzo], [hxo, hy1, hzo], 0.02, head);
  pipe(b, [-hxo, hy1, hzf], [hxo, hy1, hzf], 0.02, head);

  // Icing eyebrows, gumdrop eyes with glints, gumdrop nose + ears, peppermint cheeks.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.03, 0.028), ICING, {
      bone: head,
      at: [s * 0.115, 2.285, 0.252],
      rotation: [0, 0, s * 14],
    });
    gumdrop(b, [s * 0.115, 2.19, 0.235], [0, 0.2, 1], 0.05, RED, head);
    gumdrop(b, [s * 0.2, 2.16, 0.06], [s, 0, 0], 0.045, LEAF, head);
    const cheek = b.part(new THREE.CircleGeometry(0.035, 12), PEARL, {
      bone: head,
      at: [s * 0.155, 2.05, 0.252],
      dir: [0, 0, 1],
      axis: "z",
      texture: PEPP,
    });
    void cheek;
  }
  const glints: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    const g = new THREE.SphereGeometry(0.012, 6, 5);
    g.translate(s * 0.1, 2.205, 0.278);
    glints.push(g);
  }
  b.part(mergeGeometries(glints)!, PEARL, { bone: head, at: [0, 0, 0] });
  gumdrop(b, [0, 2.11, 0.245], [0, 0, 1], 0.045, ORANGE, head);
  // Peppermint topper + gumdrop peak (~2.46 m).
  const topper = b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 14), PEARL, {
    bone: head,
    at: [0, 2.355, 0.06],
    texture: PEPP,
  });
  void topper;
  gumdrop(b, [0, 2.375, 0.06], [0, 1, 0], 0.034, RED, head);

  // ---- Mouth: dark cavity, candy-corn teeth, separate jaw ----
  b.part(new THREE.BoxGeometry(0.26, 0.05, 0.1), CAVITY, { bone: head, at: [0, 1.968, 0.16] });
  const upper: THREE.BufferGeometry[] = [];
  for (let i = -2; i <= 2; i++) {
    const t = new THREE.BoxGeometry(0.042, 0.05, 0.03);
    t.translate(i * 0.05, 1.958, 0.2);
    upper.push(t);
  }
  b.part(mergeGeometries(upper)!, CORN, { bone: head, at: [0, 0, 0] });
  b.part(new THREE.BoxGeometry(0.34, 0.12, 0.3), GINGER, { bone: jaw, at: [0, 1.9, 0.08] });
  pipe(b, [-0.17, 1.845, 0.2], [0.17, 1.845, 0.2], 0.016, jaw);
  const lower: THREE.BufferGeometry[] = [];
  for (let i = -2; i <= 2; i++) {
    const t = new THREE.BoxGeometry(0.042, 0.045, 0.03);
    t.translate(i * 0.05, 1.962, 0.185);
    lower.push(t);
  }
  b.part(mergeGeometries(lower)!, CORN, { bone: jaw, at: [0, 0, 0] });
  // Icing roof-shingle rows down the back panel.
  for (let i = 0; i < 3; i++) {
    pipe(b, [-0.24, 1.78 - i * 0.18, -0.22], [0.24, 1.78 - i * 0.18, -0.22], 0.015, pelvis);
  }

  // ---- Arms: ginger limbs, icing cuffs, cookie fists, peppermint pauldrons ----
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const elbow = elbowOf[tag].at;
    const wrist = wristOf[tag].at;
    b.capsule([s * 0.33, 1.72, 0], [elbow.x, elbow.y, elbow.z], 0.13, { bone: elbowOf[tag], color: GINGER });
    b.capsule([elbow.x, elbow.y, elbow.z], [wrist.x, wrist.y, wrist.z], 0.112, { bone: wristOf[tag], color: GINGER });
    // Icing cuff ring round the wrist.
    b.sweep(
      catmull(
        [
          [wrist.x + 0.11, wrist.y, wrist.z],
          [wrist.x, wrist.y, wrist.z + 0.11],
          [wrist.x - 0.11, wrist.y, wrist.z],
          [wrist.x, wrist.y, wrist.z - 0.11],
        ],
        { closed: true },
      ),
      0.02,
      { bone: wristOf[tag], color: ICING },
    );
    // Fist of stacked cookies with chocolate chips.
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.CylinderGeometry(0.085 - i * 0.006, 0.085 - i * 0.006, 0.036, 12), COOKIE, {
        bone: wristOf[tag],
        at: [wrist.x, wrist.y - 0.05 - i * 0.038, wrist.z + 0.01],
      });
    }
    const chips: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const c = new THREE.SphereGeometry(0.011, 6, 5);
      c.translate(wrist.x + Math.cos(a) * 0.05, wrist.y - 0.03, wrist.z + 0.01 + Math.sin(a) * 0.05);
      chips.push(c);
    }
    b.part(mergeGeometries(chips)!, CHOCO, { bone: wristOf[tag], at: [0, 0, 0] });
    // Peppermint pauldron on the shoulder.
    const pauldron = b.part(new THREE.CircleGeometry(0.085, 16), PEARL, {
      bone: elbowOf[tag],
      at: [s * 0.475, 1.7, 0.06],
      dir: [s, 0.3, 0.6],
      axis: "z",
      texture: PEPP,
    });
    void pauldron;
    gumdrop(b, [s * 0.2, 1.06, 0.12], [0, 0.3, 1], 0.04, GRAPE, kneeOf[tag]);
  }

  // ---- Candy-cane club in the right fist ----
  const wristR = wristOf["R"].at;
  b.capsule([wristR.x + 0.02, wristR.y + 0.3, wristR.z + 0.02], [wristR.x - 0.03, wristR.y - 0.3, wristR.z], 0.045, {
    bone: wristOf["R"],
    color: CANE,
  });
  b.part(new THREE.BoxGeometry(0.24, 0.22, 0.24), GINGER, {
    bone: wristOf["R"],
    at: [wristR.x + 0.02, wristR.y + 0.42, wristR.z + 0.02],
  });
  pipe(
    b,
    [wristR.x - 0.1, wristR.y + 0.42, wristR.z + 0.15],
    [wristR.x + 0.14, wristR.y + 0.42, wristR.z + 0.15],
    0.018,
    wristOf["R"],
  );
  gumdrop(b, [wristR.x + 0.02, wristR.y + 0.42, wristR.z + 0.15], [0, 0, 1], 0.04, RED, wristOf["R"]);
  gumdrop(b, [wristR.x - 0.11, wristR.y + 0.42, wristR.z + 0.02], [-1, 0, 0], 0.035, LEAF, wristOf["R"]);

  // ---- Legs: thick ginger columns, blocky feet with icing toes ----
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const knee = kneeOf[tag].at;
    const ankle = ankleOf[tag].at;
    b.capsule([s * 0.16, 1.15, 0], [knee.x, knee.y, knee.z], 0.14, { bone: kneeOf[tag], color: GINGER });
    b.capsule([knee.x, knee.y, knee.z], [ankle.x, ankle.y, ankle.z], 0.12, { bone: ankleOf[tag], color: GINGER });
    pipe(b, [knee.x - 0.12, knee.y, knee.z + 0.13], [knee.x + 0.12, knee.y, knee.z + 0.13], 0.016, kneeOf[tag]);
    b.part(new THREE.BoxGeometry(0.22, 0.13, 0.32), GINGER, { bone: ankleOf[tag], at: [s * 0.2, 0.068, 0.08] });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.06), ICING, { bone: ankleOf[tag], at: [s * 0.2, 0.05, 0.22] });
  }

  return b.root;
}
