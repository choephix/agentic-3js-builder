import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import type { Hit } from "../src/surface";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import type { Sweep } from "../src/sweep";
import { cells, gradient, grain, mottle, paint, spots } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Spore Brute",
  description:
    "A hulking low-poly fungal brute: a hunched stem body under a huge spotted cap, mushroom-cap pauldrons, bracket-fungus armour, glowing spore pods and a tusked maw.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---- palette -------------------------------------------------------------------------------------------------------
const RED = "#c8452b";
const RED_DEEP = "#8e2a1d";
const CREAM = "#f3e2b4";
const GILL = "#ebc58c";
const GILL_DK = "#b98457";
const STEM = "#d9c79d";
const STEM_DK = "#b49a6c";
const STEM_SHADE = "#8f7852";
const BELLY = "#efe0b9";
const BELLY_LINE = "#b79b6e";
const DIRT = "#5c4230";
const BROWN = "#3d2a1d";
const BONE = "#f1e8cd";
const BONE_DK = "#bfa972";
const MAW = "#2a1017";
const TONGUE = "#a2405a";
const PURPLE = "#7a4a8c";
const PURPLE_DK = "#4d2f5c";
const EYE = "#e6ff3c";
const SPORE = "#c9ff3f";
const TEAL = "#38ffc9";

// ---- textures ------------------------------------------------------------------------------------------------------
const TUFT = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 48 Q12 26 3 6 Q17 22 20 48Z" fill="#4f7a31"/>
    <path d="M14 48 Q18 24 22 2 Q26 24 22 48Z" fill="#6f9c43"/>
    <path d="M18 48 Q22 30 30 14 Q27 34 24 48Z" fill="#5b8a37"/>
    <path d="M10 48 Q8 34 2 24 Q12 32 16 48Z" fill="#7aa84c"/>
  </svg>`,
  { size: 128 },
);
const FRINGE = svg(
  `<svg viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,0 40,0 40,12 37,31 33,15 29,28 25,13 20,32 15,13 11,29 7,15 3,31 0,12" fill="#d8c496"/>
    <polygon points="0,18 3,31 7,19 11,29 15,19 20,32 25,19 29,28 33,19 37,31 40,18 40,32 0,32" fill="#6e5236"/>
    <polygon points="0,0 40,0 40,4 0,4" fill="#b99e6e"/>
  </svg>`,
  { size: 160 },
);
const STRAND = svg(
  `<svg viewBox="0 0 16 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0 Q4 16 8 30 Q10 40 7 48 Q12 38 10 28 Q6 14 10 0Z" fill="#efe3c0"/>
  </svg>`,
  { size: 96 },
);

// ---- paints --------------------------------------------------------------------------------------------------------
const fiber = grain(STEM, STEM_DK, { size: 0.07, axis: "y", seed: 2 });
const skin = mottle(fiber, STEM_SHADE, { size: 0.4, contrast: 0.35, seed: 4 });
const bellyPlates = paint((p) => {
  const c = cells(p, 0.2, 7);
  return c.d2 - c.d1 < 0.028 ? BELLY_LINE : BELLY;
});
const torsoPaint = paint((p, n) => (n.z > 0.3 && p.y > 0.95 && p.y < 1.85 ? bellyPlates : skin));
const legPaint = gradient(skin, DIRT, [0, 0.55, 0], [0, 0.18, 0]);
const handPaint = mottle("#9a7b52", STEM_SHADE, { size: 0.15, contrast: 0.5, seed: 8 });
const shelfTop = mottle("#b9552f", "#8a3320", { size: 0.12, contrast: 0.6, seed: 5 });
const shelfPaint = paint((_p, n) => (n.y < -0.25 ? GILL : shelfTop));
const skirtPaint = paint((_p, _n, s) => (s[0] < -0.22 ? DIRT : mottle(CREAM, STEM_DK, { size: 0.2, seed: 9 })));

function capPaint(spotSize: number, seed: number) {
  const top = spots(mottle(RED, RED_DEEP, { size: 0.3, contrast: 0.6, seed }), CREAM, {
    size: spotSize,
    amount: 0.34,
    seed,
  });
  return paint((_p, n, s) => {
    if (n.y < -0.4) return Math.floor(s[1] / 9) % 2 === 0 ? GILL : GILL_DK;
    if (n.y < 0.2) return RED_DEEP;
    return top;
  });
}

function capOutline(R: number): OutlinePoint[] {
  const k = R / 0.9;
  const raw: [number, number][] = [
    [0, 0.12],
    [0.45, 0.07],
    [0.88, 0],
    [0.94, 0.04],
    [0.9, 0.11],
    [0.74, 0.26],
    [0.46, 0.41],
    [0.2, 0.5],
    [0, 0.53],
  ];
  return raw.map(([x, y]): OutlinePoint => [x * k, y * k]);
}

export default function build() {
  const b = createBuilder({ name: "sporeBrute" });
  const r = rng(11);

  // ---- skeleton --------------------------------------------------------------------------------------------------
  const K = 1.25;
  const H = (x: number, y: number, z: number): [number, number, number] => [
    x * K,
    2.0 + (y - 2.0) * K + 0.04,
    0.42 + (z - 0.42) * K + 0.06,
  ];
  const hips = b.joint("hips", { at: [0, 0.98, -0.12] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.12],
      [0, 1.32, -0.1],
      [0, 1.66, 0.0],
      [0, 1.95, 0.18],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[3];
  const neck = b.chain(
    "neck",
    [
      [0, 1.95, 0.18],
      [0, 2.04, 0.48],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 2.04, 0.48], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: H(0, 1.93, 0.5), aim: H(0, 1.9, 0.9), role: "jaw" });

  // ---- torso -----------------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.88, -0.12], w: 0.8, h: 0.62 },
      { at: [0, 1.1, -0.08], w: 0.98, h: 0.78 },
      { at: [0, 1.4, 0.04], w: 1.02, h: 0.98 },
      { at: [0, 1.72, 0.0], w: 1.5, h: 0.92 },
      { at: [0, 1.98, 0.05], w: 1.4, h: 0.8 },
      { at: [0, 2.1, -0.12], w: 0.95, h: 0.62 },
    ],
    { bone: spine, color: torsoPaint, sides: 8, smooth: false, name: "torso" },
  );
  b.sweep(neck, 0.27, { color: skin, sides: 6, smooth: false, name: "neckTube" });

  // ---- legs ------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP: [number, number, number] = [s * 0.36, 0.98, -0.1];
    const footP: [number, number, number] = [s * 0.4, 0.17, 0.12];
    const pts = limb(hipP, footP, [0.46, 0.46], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.4, 0, 0.2],
    });
    const legTube = b.sweep(leg, [0.3, 0.27, 0.22, 0.22, 0.18], { color: legPaint, sides: 6, smooth: false, name: `legTube${S}` });
    const legSurf = b.surface(legTube);
    for (const t of [0.3, 0.78]) b.sweep(legSurf.loop(leg.at(t), { lift: 0.012 }), 0.032, { color: DIRT, sides: 5, smooth: false });
    const ankle = leg.tip!;
    const knee = leg.joints[1];
    // knee knob + shin plates
    b.part(new THREE.IcosahedronGeometry(0.17, 0), skin, { bone: knee, at: knee.local({ forward: 0.1 }), flat: true });
    // foot clod
    b.part(new THREE.CylinderGeometry(0.2, 0.25, 0.17, 6), DIRT, {
      bone: ankle,
      at: [s * 0.4, 0.085, 0.17],
      scale: [1, 1, 1.45],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.06, 6), STEM_SHADE, {
      bone: ankle,
      at: [s * 0.4, 0.2, 0.15],
      scale: [1, 1, 1.2],
      flat: true,
    });
    // root toes
    [-0.15, 0, 0.15].forEach((ox, i) => {
      const bx = s * 0.4 + ox;
      const toe = b.chain(
        `toe${S}${i + 1}`,
        [
          [bx, 0.085, 0.3],
          [bx * 1.03, 0.08, 0.58],
        ],
        { parent: ankle, names: [`toe${S}${i + 1}`], role: "digit" },
      );
      b.sweep(toe, [0.085, 0.06], { color: DIRT, sides: 5, smooth: false, caps: "flat" });
      b.spike([bx * 1.03, 0.08, 0.58], [0, -0.1, 1], 0.14, 0.05, { color: BONE_DK, bone: toe.joints[0], sides: 5 });
    });
    // dangling root hairs on the heel
    [-0.1, 0.1].forEach((ox) => {
      b.sweep(
        catmull([
          [s * 0.4 + ox, 0.14, -0.1],
          [s * 0.4 + ox * 1.5, 0.1, -0.24],
          [s * 0.4 + ox * 1.8, 0.04, -0.34],
        ]),
        [0.04, 0.012],
        { bone: ankle, color: BROWN, sides: 4, smooth: false, caps: "point" },
      );
    });
  }

  // ---- arms ------------------------------------------------------------------------------------------------------
  const armSweeps: Sweep[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulderP: [number, number, number] = [s * 0.7, 1.82, 0.1];
    const handP: [number, number, number] = [s * 1.5, 1.0, 0.38];
    const pts = limb(shoulderP, handP, [0.64, 0.66], [0, -0.2, -1]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const armTube = b.sweep(arm, [0.21, 0.24, 0.2, 0.19, 0.22, 0.18, 0.16], {
      color: skin,
      sides: 6,
      smooth: false,
      name: `armTube${S}`,
    });
    armSweeps.push(armTube);
    const armSurf = b.surface(armTube);
    for (const t of [0.14, 0.86]) b.sweep(armSurf.loop(arm.at(t), { lift: 0.012 }), 0.034, { color: DIRT, sides: 5, smooth: false });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;
    const wp = new THREE.Vector3(...pts[2]);
    const ep = new THREE.Vector3(...pts[1]);
    b.part(new THREE.IcosahedronGeometry(0.2, 0), skin, { bone: elbow, at: [ep.x, ep.y, ep.z - 0.06], flat: true });
    const d = wp.clone().sub(ep).normalize();
    const along = (m: number) => wp.clone().addScaledVector(d, m);

    // mushroom-cap pauldron
    const padAxis = new THREE.Vector3(s * 0.5, 1, -0.05).normalize();
    const pad = b.lathe(capOutline(0.4), {
      at: [s * 0.72, 1.97, 0.08],
      axis: [padAxis.x, padAxis.y, padAxis.z],
      segments: 8,
      bone: shoulder,
      color: capPaint(0.14, 21),
      name: `pauldron${S}`,
    });
    for (const h of b.surface(pad).scatter(5, { rng: rng(31 + s), minDist: 0.12, filter: (h) => h.n.y > 0.45 })) {
      b.stick(new THREE.IcosahedronGeometry(0.045, 0), CREAM, h, { embed: 0.4, flat: true });
    }
    b.cards(b.surface(pad).scatter(7, { rng: rng(51 + s), minDist: 0.09, filter: (h) => h.n.y > 0.2 }), TUFT, {
      size: [0.07, 0.1],
      lean: 40,
      bend: 15,
      vary: 0.3,
      rng: rng(52),
      cross: true,
      flow: [0, 0.2, -1],
    });

    // elbow thorns
    [0.45, 0.55].forEach((t, i) => {
      const hp = armTube.at(t, 150 + i * 30);
      b.spike(hp, hp, 0.19 - i * 0.04, 0.05, { color: BONE, sides: 5 });
    });
    // forearm bracket fungus
    for (const h of b.surface(armTube).scatter(9, { rng: rng(41 + s), minDist: 0.18, filter: (h) => Math.abs(h.n.y) < 0.55 && h.at.y < 1.8 })) {
      b.stick(shelfGeo(0.08 + r() * 0.06), shelfPaint, h, { embed: 0.25, flow: [0, 1, 0], spin: (r() - 0.5) * 30 });
    }

    // palm
    const palmEnd = along(0.26);
    b.part(new THREE.IcosahedronGeometry(0.2, 0), handPaint, {
      bone: wrist,
      at: [wp.x + d.x * 0.15, wp.y + d.y * 0.15, wp.z + d.z * 0.15],
      dir: [d.x, d.y, d.z],
      scale: [1.0, 1.15, 1.5],
      flat: true,
    });
    // fingers
    const curl = new THREE.Vector3(-s * 0.35, -0.15, 0.9).normalize();
    [0.11, 0.0, -0.11].forEach((zo, i) => {
      const base = palmEnd.clone().add(new THREE.Vector3(-s * 0.0, 0, zo));
      const p1 = base.clone().addScaledVector(d, 0.14);
      const p2 = p1.clone().addScaledVector(d, 0.05).addScaledVector(curl, 0.14);
      const finger = b.chain(`finger${S}${i + 1}`, [base, p1, p2], {
        parent: wrist,
        names: [`finger${S}${i + 1}a`, `finger${S}${i + 1}b`],
        role: "digit",
      });
      b.sweep(finger, [0.085, 0.07, 0.055], { color: handPaint, sides: 5, smooth: false, caps: "round" });
      const tan = p2.clone().sub(p1).normalize();
      b.spike(p2, tan, 0.1, 0.035, { color: BROWN, bone: finger.joints[1], sides: 5 });
      b.part(new THREE.IcosahedronGeometry(0.06, 0), handPaint, { bone: wrist, at: [base.x, base.y, base.z], flat: true });
    });
    // thumb
    {
      const base = along(0.16).add(new THREE.Vector3(-s * 0.1, 0, 0.1));
      const p1 = base.clone().addScaledVector(d, 0.06).add(new THREE.Vector3(-s * 0.06, 0, 0.1));
      const thumb = b.chain(`thumb${S}`, [base, p1], { parent: wrist, names: [`thumb${S}`], role: "digit" });
      b.sweep(thumb, [0.09, 0.065], { color: handPaint, sides: 5, smooth: false, caps: "round" });
      b.spike(p1, [-s * 0.4, -0.2, 1], 0.1, 0.035, { color: BROWN, bone: thumb.joints[0], sides: 5 });
    }
    // knuckle spikes
    [0.1, 0, -0.1].forEach((zo) => {
      const base = palmEnd.clone().add(new THREE.Vector3(s * 0.05, 0.03, zo));
      b.spike(base, [s * 0.5, 0.8, 0], 0.11, 0.035, { color: BONE_DK, bone: wrist, sides: 5 });
    });
  }

  // ---- head ------------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(0.3 * K, 8, 6), skin, {
    bone: head,
    at: H(0, 2.04, 0.6),
    scale: [1.05, 0.88, 1.0],
    flat: true,
    name: "skull",
  });
  const snout = b.frustumBox(H(0, 2.03, 0.7), H(0, 2.01, 0.98), [0.44 * K, 0.15 * K], [0.38 * K, 0.13 * K], {
    bone: head,
    color: skin,
    name: "snout",
  });
  b.part(new THREE.BoxGeometry(0.36 * K, 0.05 * K, 0.3 * K), MAW, { bone: head, at: H(0, 1.945, 0.8), name: "maw" });
  // lower jaw
  b.frustumBox(H(0, 1.86, 0.56), H(0, 1.84, 0.96), [0.44 * K, 0.17 * K], [0.36 * K, 0.15 * K], {
    bone: jaw,
    color: skin,
    name: "jawBox",
  });
  b.part(new THREE.IcosahedronGeometry(0.08 * K, 0), skin, {
    bone: jaw,
    at: H(0, 1.8, 0.96),
    scale: [1.4, 0.8, 0.9],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.22 * K, 0.04 * K, 0.22 * K), TONGUE, { bone: jaw, at: H(0, 1.94, 0.76) });
  // tusks and teeth
  for (const s of [1, -1]) {
    b.spike(H(s * 0.15, 1.88, 0.9), [s * 0.18, 1, 0.3], 0.34, 0.06, { color: BONE, bone: jaw, sides: 5 });
    b.spike(H(s * 0.15, 1.88, 0.9), [s * 0.18, 1, 0.3], 0.11, 0.068, { color: BONE_DK, bone: jaw, sides: 5 });
    b.spike(H(s * 0.1, 1.96, 0.97), [0, -1, 0.1], 0.1, 0.028, { color: BONE, bone: head, sides: 4 });
    b.spike(H(s * 0.04, 1.96, 0.98), [0, -1, 0.1], 0.08, 0.025, { color: BONE, bone: head, sides: 4 });
    b.spike(H(s * 0.15, 1.93, 0.72), [0, -1, 0], 0.07, 0.025, { color: BONE, bone: head, sides: 4 });
  }
  // eyes
  const faceSurface = b.surface([skull, snout]);
  for (const s of [1, -1]) {
    const eyeP = H(s * 0.14, 2.06, 1.5);
    const hit = faceSurface.ray(eyeP, [0, 0, -1]);
    if (hit) {
      b.stick(new THREE.SphereGeometry(0.075, 6, 4), MAW, hit, { embed: 0.3, scale: [1.6, 0.5, 1.0], spin: s * 22 });
      glow(
        b.stick(new THREE.SphereGeometry(0.05, 6, 4), EYE, hit.moved([0, 0.03, 0]), {
          embed: 0.3,
          scale: [1.7, 0.6, 0.7],
          spin: s * 22,
        }),
        1.6,
      );
    }
    // brow ridge
    b.rod(H(s * 0.03, 2.14, 0.9), H(s * 0.27, 2.21, 0.76), 0.058, { section: "box", color: RED_DEEP, bone: head });
    // nostrils
    b.part(new THREE.SphereGeometry(0.03, 5, 3), MAW, { bone: head, at: H(s * 0.05, 2.03, 0.99), scale: [1, 0.6, 0.7] });
    // ear bracket and cheek frills
    const ear = b.surface(skull).ray(H(s * 1.0, 2.02, 0.55), [-s, 0, 0]);
    if (ear) b.stick(shelfGeo(0.15), shelfPaint, ear, { embed: 0.3, flow: [0, 1, 0] });
    [1.93, 1.86].forEach((y, i) => {
      const fr = b.surface(skull).ray(H(s * 1.0, y, 0.6 + i * 0.06), [-s, 0, 0]);
      if (fr) b.stick(shelfGeo(0.09 - i * 0.015), shelfPaint, fr, { embed: 0.3, flow: [0, 1, 0] });
    });
    // cheek wart
    const cheek = faceSurface.ray(H(s * 1.0, 1.98, 0.8), [-s, 0, 0]);
    if (cheek) b.stick(new THREE.IcosahedronGeometry(0.045, 0), CREAM, cheek, { embed: 0.4, flat: true });
  }
  // nose ridge
  b.rod(H(0, 2.16, 0.82), H(0, 2.06, 1.0), 0.04, { section: "box", color: RED_DEEP, bone: head });
  // mycelium beard
  [-0.15, -0.075, 0, 0.075, 0.15].forEach((x, i) => {
    b.sweep(
      catmull([
        H(x, 1.8, 0.98 - Math.abs(x) * 0.5),
        H(x * 1.2, 1.64, 1.02 - Math.abs(x) * 0.4),
        H(x * 1.4, 1.48 - i * 0.01, 1.0 - Math.abs(x) * 0.4),
      ]),
      [0.032, 0.006],
      { bone: jaw, color: BONE, sides: 4, smooth: false, caps: "point" },
    );
  });


  // ---- great cap ------------------------------------------------------------------------------------------------
  const tilt = 3 * (Math.PI / 180);
  const capCenter = new THREE.Vector3(0, 2.44, 0.34);
  const capAxis = new THREE.Vector3(0, Math.cos(tilt), Math.sin(tilt));
  const capQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tilt);
  const cap = b.lathe(capOutline(0.88), {
    at: [capCenter.x, capCenter.y, capCenter.z],
    axis: [capAxis.x, capAxis.y, capAxis.z],
    segments: 10,
    bone: head,
    color: capPaint(0.27, 5),
    name: "cap",
  });
  // gill blades under the cap
  const blades: THREE.BufferGeometry[] = [];
  const slope = Math.atan(0.12 / 0.88);
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    const g = new THREE.BoxGeometry(0.012, 0.06, 0.68);
    g.translate(0, 0, 0.5);
    g.rotateX(slope);
    g.translate(0, 0.12 - 0.12 * (0.5 / 0.88) - 0.03, 0);
    g.rotateY(a);
    g.applyQuaternion(capQ);
    g.translate(capCenter.x, capCenter.y, capCenter.z);
    blades.push(g);
  }
  const bladeMerged = mergeGeometries(blades);
  if (bladeMerged) b.part(bladeMerged, GILL, { bone: head, at: [0, 0, 0], flat: true, name: "gillBlades" });
  // central under-cap hub joining head
  b.part(new THREE.CylinderGeometry(0.32, 0.38, 0.34, 8), STEM_DK, { bone: head, at: [0, 2.42, 0.44], flat: true });
  // cap decorations
  const capSurf = b.surface(cap);
  for (const h of capSurf.scatter(20, { rng: rng(55), minDist: 0.2, filter: (h) => h.n.y > 0.45 })) {
    b.stick(new THREE.IcosahedronGeometry(0.075, 0), CREAM, h, { embed: 0.45, flat: true, scale: [1, 0.6, 1] });
  }
  for (const h of capSurf.scatter(7, { rng: rng(77), minDist: 0.4, filter: (h) => h.n.y > 0.5 })) {
    b.stick(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 6), PURPLE_DK, h, { embed: 0.3, flat: true });
    glow(b.stick(new THREE.IcosahedronGeometry(0.05, 0), SPORE, h.moved([0, 0.02, 0]), { embed: 0.4, flat: true }), 1.4);
  }
  // moss tufts along the back rim
  const mossHits = capSurf.scatter(34, { rng: rng(88), minDist: 0.12, filter: (h) => h.n.y > 0.1 && h.at.z < 0.15 });
  b.cards(mossHits, TUFT, { size: [0.1, 0.15], lean: 35, bend: 15, vary: 0.3, rng: rng(89), cross: true, flow: [0, 0.2, -1] });
  // hanging veil strands around the rim
  const rim = b.ring(frame([capCenter.x, capCenter.y, capCenter.z], [capAxis.x, capAxis.y, capAxis.z]), {
    count: 38,
    radius: 0.87,
  });
  b.cards(
    rim.items.map((it) => frame(it.at.clone().add(new THREE.Vector3(0, -0.02, 0)), [0, 1, 0], [0, 0, 1])),
    STRAND,
    { size: [0.07, 0.17], lean: 180, flow: [0, 0, 1], bone: head, vary: 0.35, rng: rng(91) },
  );

  // ---- waist skirt (mushroom ring) -------------------------------------------------------------------------------
  const skirtProfile: OutlinePoint[] = [
    [0.5, 0.14],
    [0.55, 0.02],
    [0.65, -0.24],
    [0.69, -0.3],
    [0.63, -0.3],
    [0.53, -0.06],
    [0.47, 0.06],
  ];
  b.lathe(skirtProfile, { at: [0, 1.2, -0.08], segments: 10, bone: hips, color: skirtPaint, name: "skirt" });
  const skirtRing = b.ring(frame([0, 0.92, -0.08], [0, 1, 0]), { count: 24, radius: 0.72 });
  b.cards(
    skirtRing.items.map((it) => frame(it.at, [0, 1, 0], [0, 0, 1])),
    FRINGE,
    { size: [0.17, 0.16], lean: 180, flow: [0, 0, 1], bone: hips },
  );

  // ---- bandolier vine --------------------------------------------------------------------------------------------
  const torsoSurf = b.surface(torso);
  const vine = torsoSurf.drape(
    catmull(
      [
        [-0.6, 1.95, 0.05],
        [-0.25, 1.62, 0.6],
        [0.25, 1.22, 0.6],
        [0.6, 1.05, 0.05],
        [0.3, 1.15, -0.5],
        [-0.25, 1.6, -0.5],
      ],
      { closed: true },
    ),
    { lift: 0.015 },
  );
  b.sweep(vine, 0.045, { color: DIRT, sides: 5, smooth: false, name: "vine" });
  // spore pouch hanging on the vine
  const pouchHit = torsoSurf.nearest([0.3, 1.18, 0.62]);
  b.stick(new THREE.IcosahedronGeometry(0.12, 0), PURPLE, pouchHit.moved([0, 0.05, 0]), { embed: 0.2, flat: true, scale: [1, 1.2, 0.9] });
  glow(b.stick(new THREE.IcosahedronGeometry(0.05, 0), TEAL, pouchHit.moved([0, 0.19, 0]), { embed: 0.4, flat: true }), 1.5);

  // ---- torso dressing --------------------------------------------------------------------------------------------
  // bracket fungus armour on the back and flanks
  for (const h of torsoSurf.scatter(16, { rng: rng(101), minDist: 0.28, filter: (h) => Math.abs(h.n.y) < 0.5 && h.n.z < 0.25 && h.at.y > 1.0 })) {
    b.stick(shelfGeo(0.13 + r() * 0.1), shelfPaint, h, { embed: 0.25, flow: [0, 1, 0], spin: (r() - 0.5) * 25 });
  }
  // glowing spore pods
  for (const h of torsoSurf.scatter(14, { rng: rng(111), minDist: 0.24, filter: (h) => h.n.z < 0.2 && h.at.y > 1.2 })) {
    b.stick(new THREE.CylinderGeometry(0.055, 0.08, 0.035, 6), PURPLE_DK, h, { embed: 0.3, flat: true });
    glow(b.stick(new THREE.IcosahedronGeometry(0.06, 0), r() > 0.5 ? SPORE : TEAL, h.moved([0, 0.02, 0]), { embed: 0.35, flat: true }), 1.5);
  }
  // warts on the belly
  for (const h of torsoSurf.scatter(12, { rng: rng(121), minDist: 0.2, filter: (h) => h.n.z > 0.4 && h.at.y < 1.65 })) {
    b.stick(new THREE.IcosahedronGeometry(0.05, 0), STEM_DK, h, { embed: 0.4, flat: true });
  }
  // small mushroom colonies
  const shroom = (h: Hit, sz: number, capCol: string) => {
    b.stick(new THREE.CylinderGeometry(sz * 0.3, sz * 0.45, sz * 3.2, 6), BELLY, h, { embed: 0.2, flat: true });
    b.stick(new THREE.SphereGeometry(sz * 1.25, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2), capCol, h.moved([0, sz * 2.6, 0]), {
      embed: 0.1,
      scale: [1, 0.7, 1],
      flat: true,
    });
  };
  const colonies = [
    ...torsoSurf.scatter(8, { rng: rng(131), minDist: 0.3, filter: (h) => h.n.y > 0.3 || h.at.y > 1.75 }),
    ...b.surface(armSweeps).scatter(8, { rng: rng(141), minDist: 0.25, filter: (h) => h.n.y > 0.4 }),
  ];
  colonies.forEach((h, i) => shroom(h, 0.05 + r() * 0.06, [RED, PURPLE, "#e49b2c", CREAM][i % 4]));

  // dorsal crest: stacked bracket fungi down the spine and tall mushrooms either side
  [
    [0, 1.92, 0.3],
    [0, 1.7, 0.26],
    [0, 1.48, 0.21],
    [0, 1.26, 0.17],
  ].forEach(([x, y, rad]) => {
    const h = torsoSurf.ray([x, y, -2], [0, 0, 1]);
    if (h) b.stick(shelfGeo(rad), shelfPaint, h, { embed: 0.2, flow: [0, 1, 0], spin: (r() - 0.5) * 10 });
  });
  [
    [-0.32, 1.85, 0.11, RED],
    [0.34, 1.78, 0.14, "#e49b2c"],
    [-0.3, 1.52, 0.1, PURPLE],
    [0.28, 1.4, 0.12, CREAM],
    [0.0, 2.04, 0.1, RED],
  ].forEach(([x, y, sz, col]) => {
    const h = torsoSurf.ray([Number(x), Number(y), -2], [0, 0, 1]);
    if (h) shroom(h, Number(sz), String(col));
  });
  b.cards(
    torsoSurf.scatter(16, { rng: rng(151), minDist: 0.12, filter: (h) => h.n.y > 0.5 && h.at.y > 1.75 }),
    TUFT,
    { size: [0.08, 0.12], lean: 35, bend: 15, vary: 0.3, rng: rng(152), cross: true, flow: [0, 0.2, -1] },
  );

  // ---- floating spores -------------------------------------------------------------------------------------------
  const sporeGeos: THREE.BufferGeometry[] = [];
  const sporeGeos2: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.7 + r() * 0.5;
    const g = new THREE.OctahedronGeometry(0.02 + r() * 0.015, 0);
    g.translate(Math.cos(a) * rad, 1.15 + r() * 0.95, 0.15 + Math.sin(a) * rad * 0.8);
    (i % 2 ? sporeGeos : sporeGeos2).push(g);
  }
  const sA = mergeGeometries(sporeGeos);
  const sB = mergeGeometries(sporeGeos2);
  if (sA) glow(b.part(sA, SPORE, { bone: chest, at: [0, 0, 0], flat: true, name: "sporesA" }), 1.4);
  if (sB) glow(b.part(sB, TEAL, { bone: chest, at: [0, 0, 0], flat: true, name: "sporesB" }), 1.4);

  return b.root;
}

function shelfGeo(rad: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(rad * 0.7, rad, rad * 0.4, 7, 1, false, Math.PI / 2, Math.PI);
  g.rotateX(Math.PI / 2);
  return g;
}
