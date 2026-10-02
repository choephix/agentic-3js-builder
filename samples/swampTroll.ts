import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame, line } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { countershade, grain, mottle, scales, stripes } from "../src/paint";
import { svg } from "../src/texture";

const SKIN = "#527447";
const SKIN_DARK = "#263b2b";
const SKIN_LIGHT = "#7fa15a";
const BELLY = "#9e9f62";
const MOSS = "#365b3c";
const MOSS_LIGHT = "#718d4b";
const HAIR = "#18251d";
const BONE = "#d6c99b";
const BONE_DARK = "#766c4a";
const TOOTH = "#e9ddb4";
const EYE = "#d5c449";
const PUPIL = "#171812";
const LEATHER = "#493428";
const LEATHER_LIGHT = "#795133";
const METAL = "#807451";
const RUST = "#9a4c2d";
const SLIME = "#8cae55";

const skinPaint = countershade(mottle(SKIN, SKIN_LIGHT, { size: 0.22, contrast: 0.7, seed: 31 }), BELLY, { level: -0.18 });
const barkPaint = grain(LEATHER, LEATHER_LIGHT, { size: 0.08, axis: "y", seed: 7 });
const warPaint = stripes(SKIN_DARK, SKIN_LIGHT, { size: 0.12, axis: "z", width: 0.22, wobble: 0.35, seed: 18 });
const scalePaint = scales([SKIN_DARK, SKIN], SKIN_LIGHT, { size: 0.12, width: 0.018, seed: 12 });

const mohawk = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 0 L29 12 L22 13 L30 27 L21 26 L27 42 L18 38 L16 64 L14 38 L5 42 L11 26 L2 27 L10 13 L3 12 Z" fill="#1b281e"/><path d="M16 4 L19 20 L16 49 L13 20 Z" fill="#68824d"/></svg>`,
  { size: 128 },
);
const mossTuft = svg(
  `<svg viewBox="0 0 32 64"><path d="M3 64 Q4 28 11 4 Q13 2 14 6 L16 38 Q17 16 25 0 Q28 -1 27 5 L23 64 Z" fill="#7e9f52"/><path d="M6 64 Q10 35 14 17" stroke="#273e2b" stroke-width="3" fill="none"/><path d="M19 64 Q21 31 25 8" stroke="#385a36" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);
const fetishMark = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 2 L19 10 L27 13 L19 16 L16 29 L13 16 L5 13 L13 10 Z" fill="#d8c692"/><circle cx="16" cy="13" r="3" fill="#554a33"/></svg>`,
  { size: 64 },
);


export const meta = {
  name: "Swamp Troll",
  description: "A hulking, mossy swamp troll with a crooked mohawk, tusks, war paint, and a necklace of bone fetishes.",
  style: "Blizzard/Warcraft",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "swampTroll", detail: 0.9, paintSize: 2048 });
  const hips = b.joint("hips", { at: [0, 1.08, 0], dir: [0, 0.7, 0.08], role: "spine" });

  const torsoPath = catmull([
    [0, 0.9, 0],
    [0, 1.18, 0.02],
    [0, 1.48, 0.03],
    [0, 1.76, 0.09],
    [0, 1.98, 0.12],
  ]);
  const spine = b.chain("spine", torsoPath, {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "spine3", "chest", "shoulders"],
    role: "spine",
  });
  const torso = b.sweep(torsoPath, (t) => 0.48 - t * 0.1, {
    bone: spine,
    color: skinPaint,
    section: { ngon: 8 },
    caps: "round",
    name: "torsoSkin",
  });
  b.sweep(torsoPath, (t) => 0.485 - t * 0.1, {
    bone: spine,
    color: scalePaint,
    sectors: [[-50, 50, SKIN_DARK, 0.18, 0.8]],
    section: { ngon: 8 },
    caps: "none",
    name: "backScales",
  });

  const neckPath = catmull([[0, 1.82, 0.1], [0, 2.03, 0.13], [0, 2.17, 0.18]]);
  const neck = b.chain("neck", neckPath, { parent: spine.joints[spine.joints.length - 1], count: 2, names: ["neck", "neckTip"], role: "neck" });
  const neckTube = b.sweep(neck, [0.28, 0.22], { color: skinPaint, section: { ngon: 7 }, name: "neck" });
  b.along(neckTube, 6, (at) => b.spike(at, at, 0.075, 0.025, { color: MOSS, caps: "point" }));

  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 2.21, 0.2], dir: [0, 0.12, 1], role: "head", group: "head" });
  b.part(new THREE.DodecahedronGeometry(0.34, 1), skinPaint, { bone: head, at: head.local([0, 0.02, 0.05]), scale: [1.18, 1.0, 1.05], flat: true, name: "skull" });
  b.part(new THREE.SphereGeometry(0.37, 10, 7), warPaint, { bone: head, at: head.local([0, 0.02, 0.04]), scale: [1.1, 0.9, 0.92], flat: true, name: "facePaint" });

  const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.07, 0.02]), dir: [0, -0.16, 1], role: "jaw", group: "head" });
  b.part(new THREE.BoxGeometry(0.42, 0.18, 0.4), SKIN_DARK, { bone: jaw, at: jaw.local([0, 0.0, 0.17]), scale: [1, 1, 1], rotation: [0, 0, 0], flat: true, name: "lowerJaw" });
  b.sweep(bezier(head.local([0, 0.12, 0.15]), head.local([0, 0.18, 0.32]), head.local([0, 0.12, 0.42])), [0.21, 0.13], { bone: head, color: skinPaint, section: { ngon: 6 }, name: "muzzle" });
  b.sweep(bezier(jaw.local([0, 0.05, 0.15]), jaw.local([0, -0.02, 0.28]), jaw.local([0, -0.01, 0.37])), [0.18, 0.1], { bone: jaw, color: SKIN_DARK, section: { ngon: 6 }, name: "lowerMuzzle" });

  const cheek = b.surface(head);
  for (const s of [1, -1]) {
    const eyeHit = cheek.around(head.at).at(s * 68, 18);
    if (eyeHit) {
      b.stick(new THREE.SphereGeometry(0.06, 8, 6), EYE, eyeHit, { embed: 0.35, name: s > 0 ? "eyeR" : "eyeL" });
      b.stick(new THREE.SphereGeometry(0.025, 6, 4), PUPIL, eyeHit.moved([0, 0.012, 0]), { embed: 0.1, name: s > 0 ? "pupilR" : "pupilL" });
      b.ring(line(eyeHit.at, eyeHit.moved([0, 0.01, 0])), { count: 7, radius: 0.064, fromDeg: -80, toDeg: 80 }, (lash) =>
        b.spike(lash, lash, 0.025, 0.006, { color: HAIR, caps: "point" }),
      );
    }
  }

  // Tall crest and loose moss around the crown.
  b.cards([head.local([0, 0.04, 0.02])].map((p) => frame(p, [0, 1, 0])), mohawk, {
    size: [0.3, 0.82],
    lean: 8,
    bend: 10,
    flow: [0, 0.15, -1],
    cross: true,
    color: HAIR,
    bone: head,
  });
  const crownFrames = [
    frame(head.local([0.2, -0.03, -0.08]), [0.35, 0.7, -0.1]),
    frame(head.local([-0.2, -0.03, -0.08]), [-0.35, 0.7, -0.1]),
    frame(head.local([0.27, 0.0, 0.1]), [0.55, 0.45, 0.08]),
    frame(head.local([-0.27, 0.0, 0.1]), [-0.55, 0.45, 0.08]),
  ];
  b.cards(crownFrames, mossTuft, { size: [0.12, 0.32], lean: 18, bend: 24, vary: 0.25, rng: rng(8), color: MOSS_LIGHT, cross: true });

  // Tusks follow the jaw, with dark root caps and ivory points.
  for (const s of [1, -1]) {
    const root = jaw.local([s * 0.16, -0.015, 0.28]);
    const tuskPath = bezier(root, jaw.local([s * 0.18, -0.17, 0.33]), jaw.local([s * 0.13, -0.31, 0.22]));
    b.sweep(tuskPath, [0.055, 0], { bone: jaw, color: TOOTH, caps: { start: "round", end: "point" }, section: { ngon: 6 }, name: s > 0 ? "tuskR" : "tuskL" });
    b.part(new THREE.CylinderGeometry(0.064, 0.055, 0.055, 7), BONE_DARK, { bone: jaw, at: root, dir: [0, -1, 0], flat: true, name: s > 0 ? "tuskRootR" : "tuskRootL" });
  }
  for (const s of [1, -1]) {
    const tooth = jaw.local([s * 0.09, 0.04, 0.32]);
    b.spike(tooth, jaw.local([s * 0.09, -0.08, 0.34]), null, 0.025, { bone: jaw, color: TOOTH, caps: "point" });
  }

  // Arms: long, relaxed, and readable in the rest pose.
  for (const s of [1, -1]) {
    const shoulder = [s * 0.38, 1.78, 0.08] as [number, number, number];
    const elbow = [s * 0.67, 1.48, 0.18] as [number, number, number];
    const wrist = [s * 0.84, 1.14, 0.32] as [number, number, number];
    const hand = [s * 0.98, 0.96, 0.38] as [number, number, number];
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, polyline([shoulder, elbow, wrist, hand]), {
      parent: spine.joints[spine.joints.length - 1],
      names: [s > 0 ? "shoulderL" : "shoulderR", s > 0 ? "elbowL" : "elbowR", s > 0 ? "wristL" : "wristR", s > 0 ? "handL" : "handR"],
      role: "arm",
    });
    b.part(new THREE.IcosahedronGeometry(0.2, 1), LEATHER, { bone: arm.joints[0], at: shoulder, scale: [1.35, 0.72, 1.15], flat: true, name: s > 0 ? "pauldronL" : "pauldronR" });
    b.ring(arm.joints[0], { count: 5, radius: 0.16, fromDeg: -70, toDeg: 70 }, (stud) =>
      b.spike(stud, stud, 0.045, 0.012, { color: METAL, caps: "point", section: { ngon: 5 } }),
    );
    b.sweep(arm, (t) => 0.125 - t * 0.045, { color: skinPaint, section: { ngon: 7 }, name: s > 0 ? "armSkinL" : "armSkinR" });
    b.sweep(polyline([shoulder, elbow]), [0.155, 0.12], { bone: arm.joints[0], color: scalePaint, section: { ngon: 7 }, name: s > 0 ? "armScalesL" : "armScalesR" });
    for (let f = -1; f <= 1; f++) {
      const fingerRoot = [hand[0] + s * 0.015 * f, hand[1] - 0.025, hand[2] + 0.05 * f] as [number, number, number];
      const fingerTip = [hand[0] + s * (0.11 + 0.025 * Math.abs(f)), hand[1] - 0.09 + 0.035 * f, hand[2] + 0.05 * f] as [number, number, number];
      b.sweep([fingerRoot, fingerTip], [0.028, 0.006], { bone: arm.joints[arm.joints.length - 1], color: SKIN_DARK, caps: { start: "round", end: "point" }, section: { ngon: 5 }, name: `finger${s > 0 ? "L" : "R"}${f + 2}` });
      b.spike(fingerTip, fingerTip, 0.055, 0.018, { color: TOOTH, caps: "point", section: { ngon: 5 } });
    }
    // Copper-green wrist bangles.
    const cuff = b.ring(arm.joints[2], { count: 8, radius: 0.122, fromDeg: 0, toDeg: 360 });
    b.sweep(catmull(cuff.items, { closed: true }), 0.018, { color: METAL, section: { ngon: 5 }, name: s > 0 ? "cuffL" : "cuffR" });
  }

  // Heavy legs and broad, three-toed feet.
  for (const s of [1, -1]) {
    const hip = [s * 0.25, 1.0, 0.01] as [number, number, number];
    const knee = [s * 0.31, 0.62, 0.16] as [number, number, number];
    const ankle = [s * 0.34, 0.22, 0.07] as [number, number, number];
    const foot = [s * 0.34, 0.10, 0.32] as [number, number, number];
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, polyline([hip, knee, ankle, foot]), {
      parent: hips,
      names: [s > 0 ? "hipL" : "hipR", s > 0 ? "kneeL" : "kneeR", s > 0 ? "ankleL" : "ankleR", s > 0 ? "footL" : "footR"],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    b.sweep(leg, (t) => 0.19 - t * 0.08, { color: skinPaint, section: { ngon: 7 }, name: s > 0 ? "legSkinL" : "legSkinR" });
    b.sweep(polyline([hip, knee]), [0.21, 0.16], { bone: leg.joints[0], color: scalePaint, section: { ngon: 7 }, name: s > 0 ? "thighScalesL" : "thighScalesR" });
    b.part(new THREE.BoxGeometry(0.28, 0.16, 0.45), SKIN_DARK, { bone: leg.joints[leg.joints.length - 1], at: foot, flat: true, name: s > 0 ? "footL" : "footR" });
    for (let t = -1; t <= 1; t++) {
      const toeRoot = [foot[0] + s * t * 0.07, 0.10, foot[2] + 0.14] as [number, number, number];
      const toeTip = [foot[0] + s * t * 0.09, 0.07, foot[2] + 0.34 + (t === 0 ? 0.05 : 0)] as [number, number, number];
      b.sweep([toeRoot, toeTip], [0.045, 0.01], { bone: leg.joints[leg.joints.length - 1], color: SKIN_DARK, caps: { start: "round", end: "point" }, section: { ngon: 5 }, name: `toe${s > 0 ? "L" : "R"}${t + 2}` });
      b.spike(toeTip, toeTip, 0.075, 0.018, { color: TOOTH, caps: "point", section: { ngon: 5 } });
    }
  }

  // Belt, shoulder strap, and painted war symbols.
  const belt = b.surface(torso).loop(hips, { lift: 0.018 });
  b.sweep(belt, 0.045, { color: barkPaint, section: { ngon: 6 }, name: "waistBelt" });
  b.along(belt, 11, (at) => b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.022, 6), METAL, { frame: at, axis: "y", dir: at.axis, name: "beltRivet" }));
  b.sweep(b.surface(torso).drape(catmull([[0.38, 1.88, 0.22], [0.2, 1.52, 0.43], [0.0, 1.1, 0.48]]), { lift: 0.024 }), 0.025, { color: LEATHER, section: { ngon: 5 }, name: "shoulderStrap" });
  for (const s of [1, -1]) {
    const war = cheek.around(head.at).at(s * 88, -2);
    if (war) b.stick(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 6), RUST, war, { embed: 0.4, spin: s * 25, name: s > 0 ? "warPaintR" : "warPaintL" });
  }

  // Necklace cord and three hanging fetishes: jawbone, tooth, and marked stone.
  const collar = b.surface(neckTube).loop(neck.joints[0], { lift: 0.018 });
  b.sweep(collar, 0.022, { color: LEATHER, section: { ngon: 5 }, name: "fetishCord" });
  const hanging = [
    { x: 0.22, y: 1.9, z: 0.34, kind: "jaw" },
    { x: 0, y: 1.75, z: 0.48, kind: "tooth" },
    { x: -0.23, y: 1.91, z: 0.34, kind: "stone" },
  ];
  for (const [i, f] of hanging.entries()) {
    const top = [f.x, f.y, f.z] as [number, number, number];
    const bottom = [f.x * 1.25, f.y - (0.2 + i * 0.07), f.z + 0.03] as [number, number, number];
    b.sweep(bezier(top, [f.x * 1.1, f.y - 0.08, f.z + 0.03], bottom), [0.012, 0.006], { bone: neck.joints[0], color: LEATHER, caps: "round", name: `fetishString${i}` });
    if (f.kind === "jaw") {
      b.sweep(polyline([bottom, [bottom[0] + 0.05, bottom[1] - 0.09, bottom[2] + 0.01], [bottom[0] - 0.04, bottom[1] - 0.14, bottom[2]]]), [0.018, 0.006], { bone: neck.joints[0], color: BONE, caps: "round", section: { ngon: 5 }, name: "jawFetish" });
    } else if (f.kind === "tooth") {
      b.spike(bottom, [0, -1, 0.1], 0.17, 0.035, { bone: neck.joints[0], color: TOOTH, caps: "point", section: { ngon: 6 }, name: "toothFetish" });
    } else {
      const stone = b.part(new THREE.IcosahedronGeometry(0.07, 0), MOSS_LIGHT, { bone: neck.joints[0], at: bottom, flat: true, name: "markedStone" });
      b.decal(stone, fetishMark, { at: bottom, dir: [0, 0, 1], size: [0.08, 0.08], lift: 0.01, bone: neck.joints[0], name: "fetishMark" });
    }
  }

  // Wet swamp slime and dangling moss on the lower silhouette.
  let slimeIndex = 0;
  b.along(torso, 10, (at) => {
    if (slimeIndex % 2 === 0) b.spike(at, at, 0.05 + (slimeIndex % 3) * 0.018, 0.018, { color: SLIME, caps: "point" });
    slimeIndex += 1;
  });
  const mossHits = b.surface(torso).scatter(18, { rng: rng(21), minDist: 0.11, filter: (h) => h.n.y > -0.1 && h.at.y > 1.1 });
  b.cards(mossHits, mossTuft, { size: [0.035, 0.12], lean: 62, bend: 18, vary: 0.35, rng: rng(22), color: MOSS_LIGHT });

  return b.root;
}
