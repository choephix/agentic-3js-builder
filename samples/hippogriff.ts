import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { countershade, gradient, mottle, spots, stripes } from "../src/paint";

const COAT = "#8b5a38";
const COAT_LIGHT = "#c3874d";
const FEATHER = "#415b72";
const FEATHER_LIGHT = "#7190a2";
const BELLY = "#e4c48a";
const BEAK = "#d8a83b";
const BEAK_DARK = "#7b431d";
const TALON = "#242a30";
const EYE = "#11151d";
const EYE_GOLD = "#f5d45c";
const CREST = "#26394f";
const STRAP = "#4a2d22";
const METAL = "#a9b3ae";

export const meta = {
  name: "Hippogriff",
  description: "A faceted low-poly hippogriff with an eagle's proud front, horse hindquarters, outstretched wings, and layered flight feathers.",
  style: "low-poly",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "hippogriff", detail: 0.8, paintSize: 1024 });
  const random = rng(73);

  const coat = countershade(mottle(COAT, COAT_LIGHT, { size: 0.3, contrast: 0.65, seed: 7 }), BELLY, { level: -0.15 });
  const horseMark = stripes(coat, "#3c2a24", { size: 0.32, axis: "z", width: 0.18, wobble: 0.18, seed: 11 });
  const featherPaint = countershade(mottle(FEATHER, FEATHER_LIGHT, { size: 0.16, contrast: 0.5, seed: 19 }), "#273646", { level: -0.25 });
  const wingBand = stripes(featherPaint, "#26384b", { size: 0.28, axis: "z", width: 0.22, wobble: 0.08, seed: 23 });
  const faceSpeckle = spots("#c79655", "#4a3024", { size: 0.055, amount: 0.28, rosette: true, seed: 31 });

  // Skeleton first: rooted at the horse pelvis, with a shared spine, neck, four legs, wings, and jaw.
  const hips = b.joint("hips", { at: [0, 1.28, -0.42], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.28, -0.56],
      [0, 1.48, -0.2],
      [0, 1.56, 0.2],
      [0, 1.62, 0.47],
    ]),
    { parent: hips, names: ["spineRump", "spineMid", "spineChest", "spineShoulder"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.62, 0.47],
      [0, 1.86, 0.54],
      [0, 2.08, 0.58],
      [0, 2.23, 0.68],
    ]),
    { parent: spine.joints[3], names: ["neckBase", "neckMid", "neckTop", "head"], role: "neck" },
  );
  const head = neck.joints[3];
  const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.07, -0.02]), aim: head.local({ forward: 0.3, down: 0.02 }), role: "jaw" });

  const hindLPoints = catmull([
    [0.3, 1.32, -0.48],
    [0.38, 0.92, -0.5],
    [0.34, 0.52, -0.38],
    [0.32, 0.19, -0.25],
  ]);
  const hindRPoints = catmull([
    [-0.3, 1.32, -0.48],
    [-0.38, 0.92, -0.5],
    [-0.34, 0.52, -0.38],
    [-0.32, 0.19, -0.25],
  ]);
  const hindL = b.chain("hindLegL", hindLPoints, { parent: hips, names: ["hipL", "kneeL", "hockL", "hoofL"], role: "leg", contact: [0.32, 0.05, -0.24] });
  const hindR = b.chain("hindLegR", hindRPoints, { parent: hips, names: ["hipR", "kneeR", "hockR", "hoofR"], role: "leg", contact: [-0.32, 0.05, -0.24] });

  const foreLPoints = catmull([
    [0.29, 1.48, 0.38],
    [0.4, 1.15, 0.52],
    [0.36, 0.74, 0.63],
    [0.33, 0.28, 0.69],
  ]);
  const foreRPoints = catmull([
    [-0.29, 1.48, 0.38],
    [-0.4, 1.15, 0.52],
    [-0.36, 0.74, 0.63],
    [-0.33, 0.28, 0.69],
  ]);
  const foreL = b.chain("foreLegL", foreLPoints, { parent: spine.joints[3], names: ["shoulderL", "elbowL", "wristL", "talonL"], role: "leg", contact: [0.33, 0.05, 0.69] });
  const foreR = b.chain("foreLegR", foreRPoints, { parent: spine.joints[3], names: ["shoulderR", "elbowR", "wristR", "talonR"], role: "leg", contact: [-0.33, 0.05, 0.69] });

  const wingLPath = catmull([
    [0.38, 1.72, 0.26],
    [0.78, 2.0, 0.12],
    [1.18, 2.27, -0.03],
    [1.55, 2.39, -0.18],
  ]);
  const wingRPath = catmull([
    [-0.38, 1.72, 0.26],
    [-0.78, 2.0, 0.12],
    [-1.18, 2.27, -0.03],
    [-1.55, 2.39, -0.18],
  ]);
  const wingL = b.chain("wingL", wingLPath, { parent: spine.joints[3], names: ["wingRootL", "wingElbowL", "wingWristL", "wingTipL"], role: "wing" });
  const wingR = b.chain("wingR", wingRPath, { parent: spine.joints[3], names: ["wingRootR", "wingElbowR", "wingWristR", "wingTipR"], role: "wing" });

  // Main volumes: horse barrel and rump, eagle breast, then a narrower feathered neck.
  const body = b.loft(
    [
      { at: [0, 1.3, -0.65], w: 0.64, h: 0.72 },
      { at: [0, 1.48, -0.28], w: 0.72, h: 0.8 },
      { at: [0, 1.56, 0.15], w: 0.68, h: 0.76 },
      { at: [0, 1.62, 0.48], w: 0.56, h: 0.68 },
    ],
    { bone: [hips, spine], section: "box", color: horseMark, name: "facetedBarrel", group: "body" },
  );
  b.sweep(
    catmull([
      [0, 1.54, 0.28],
      [0, 1.7, 0.53],
      [0, 1.86, 0.56],
    ]),
    (t) => 0.34 - t * 0.12,
    { bone: [spine, neck], section: { ngon: 7 }, color: featherPaint, caps: "round", smooth: false, name: "eagleBreast", group: "body" },
  );
  const neckTube = b.sweep(neck, (t) => 0.27 - t * 0.08, { section: { ngon: 7 }, color: featherPaint, caps: "round", smooth: false, name: "featheredNeck", group: "neck" });

  // Layered ruff and mane: short low-poly wedges around the neck and a horse mane down the back.
  b.ring(neck.joints[1], { count: 12, radius: 0.22, fromDeg: 0, toDeg: 360, name: "ruff", role: "fan" }, (item) => {
    b.spike(item, item, 0.16 + random() * 0.05, 0.045, { color: FEATHER_LIGHT, section: { ngon: 5 }, caps: "point", smooth: false, group: "ruff" });
  });
  const manePath = catmull([
    [0, 1.84, -0.35],
    [0, 1.92, -0.62],
    [0, 1.79, -0.9],
    [0, 1.58, -1.08],
  ]);
  b.along(manePath, 11, (at) => b.spike(at, [0, 0.15, -1], 0.18 + random() * 0.08, 0.035, { color: CREST, section: { ngon: 5 }, caps: "point", smooth: false, group: "mane" }));

  // Equine hind legs: broad upper limbs, angular lower limbs, and clearly separated hooves.
  for (const [side, leg] of [[1, hindL], [-1, hindR]] as const) {
    b.sweep(leg, (t) => (t < 0.45 ? 0.115 : 0.075 - t * 0.018), { section: { ngon: 6 }, color: coat, smooth: false, group: `hindLeg${side}` });
    b.sweep(polyline([[side * 0.32, 0.19, -0.25], [side * 0.34, 0.1, -0.2], [side * 0.34, 0.07, -0.08]]), [0.075, 0.06], { section: { ngon: 5 }, color: BELLY, smooth: false, caps: "round", bone: leg.joints[3], group: `hindPastern${side}` });
    b.part(new THREE.BoxGeometry(0.19, 0.13, 0.25), TALON, { bone: leg.joints[3], at: [side * 0.34, 0.065, -0.13], flat: true, name: `hoof${side}` });
    b.part(new THREE.BoxGeometry(0.21, 0.035, 0.2), STRAP, { bone: leg.joints[2], at: [side * 0.34, 0.22, -0.24], flat: true, name: `fetlockBand${side}` });
  }

  // Eagle forelegs finish in three-pronged talons.
  for (const [side, leg] of [[1, foreL], [-1, foreR]] as const) {
    b.sweep(leg, (t) => (t < 0.5 ? 0.09 : 0.055), { section: { ngon: 6 }, color: featherPaint, smooth: false, group: `foreLeg${side}` });
    const wrist = leg.joints[3].at;
    for (let i = -1; i <= 1; i++) {
      const toeTip = [wrist.x + side * i * 0.07, 0.045, wrist.z + 0.13 - Math.abs(i) * 0.025] as const;
      b.sweep(bezier(wrist, [wrist.x + side * i * 0.035, 0.13, wrist.z + 0.06], [toeTip[0], 0.08, toeTip[2]], toeTip), [0.028, 0.006], { bone: leg.joints[3], color: TALON, section: { ngon: 5 }, caps: "point", smooth: false, group: `talon${side}` });
    }
  }

  // Eagle head, brow, hooked beak, and a separate lower jaw for a readable rig.
  b.frustumBox(head.local({ back: 0.13, down: 0.04 }), head.local({ forward: 0.15, up: 0.08 }), [0.25, 0.27], [0.2, 0.22], { bone: head, color: featherPaint, section: "box", smooth: false, name: "eagleSkull", group: "head" });
  b.sweep(polyline([head.local({ left: 0.11, forward: 0.02, up: 0.13 }), head.local({ left: 0.11, forward: 0.2, up: 0.12 })]), [0.045, 0.025], { bone: head, color: CREST, section: { ngon: 5 }, caps: "flat", smooth: false, group: "brow" });
  for (const side of [1, -1]) {
    const eyeAt = head.local({ left: side * 0.1, forward: 0.18, up: 0.08 });
    b.part(new THREE.SphereGeometry(0.045, 8, 5), EYE_GOLD, { bone: head, at: eyeAt, flat: true, name: `eyeGold${side}`, group: "eyes" });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), EYE, { bone: head, at: head.local({ left: side * 0.1, forward: 0.215, up: 0.08 }), flat: true, name: `pupil${side}`, group: "eyes" });
    b.spike(head.local({ left: side * 0.1, forward: 0.19, up: 0.1 }), [0, 0.1, 0.35], 0.06, 0.025, { bone: head, color: CREST, section: { ngon: 5 }, smooth: false, group: "brow" });
  }
  const beakBase = head.local({ forward: 0.21, down: 0.04 });
  b.sweep([head.local({ forward: 0.14, down: 0.04 }), beakBase], [0.1, 0.085], { bone: head, color: BEAK, section: { ngon: 6 }, smooth: false, caps: "round", group: "beakBridge" });
  const beakTip = head.local({ forward: 0.55, down: 0.1 });
  b.frustumBox(beakBase, head.local({ forward: 0.39, down: 0.08 }), [0.14, 0.12], [0.08, 0.075], { bone: head, color: BEAK, section: "box", smooth: false, name: "upperBeak", group: "beak" });
  b.spike(head.local({ forward: 0.38, down: 0.08 }), beakTip, null, 0.08, { bone: head, color: BEAK_DARK, section: { ngon: 5 }, smooth: false, name: "beakHook", group: "beak" });
  b.frustumBox(head.local({ forward: 0.2, down: 0.075 }), head.local({ forward: 0.43, down: 0.12 }), [0.1, 0.07], [0.045, 0.035], { bone: jaw, color: BEAK_DARK, section: "box", smooth: false, name: "lowerJaw", group: "beak" });
  b.sweep(polyline([head.local({ back: 0.08, up: 0.16 }), head.local({ back: 0.18, up: 0.27 }), head.local({ back: 0.26, up: 0.16 })]), [0.055, 0.018], { bone: head, color: CREST, section: { ngon: 5 }, caps: "point", smooth: false, name: "crownCrest", group: "head" });

  // Broad, faceted wings with arm membranes and many individual primary feathers.
  for (const [side, wing] of [[1, wingL], [-1, wingR]] as const) {
    b.sweep(wing, (t) => 0.16 - t * 0.1, { section: { ngon: 6 }, color: wingBand, smooth: false, group: `wingArm${side}` });
    const lowerEdge = catmull([
      [side * 0.45, 1.6, 0.16],
      [side * 0.86, 1.64, -0.12],
      [side * 1.25, 1.78, -0.35],
      [side * 1.5, 1.94, -0.48],
    ]);
    b.membrane(wingPathFor(side), lowerEdge, { color: featherPaint, thickness: 0.018, rows: 5, cols: 8, scallop: 0.12, group: `wingMembrane${side}`, name: `wingMembrane${side}` });
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const root = wing.at(0.38 + t * 0.52).at;
      const tip = [root.x + side * (0.18 + i * 0.06), root.y + 0.22 - i * 0.06, root.z - 0.45 - i * 0.1] as const;
      b.sweep(bezier(root, [root.x + side * 0.13, root.y + 0.12, root.z - 0.18], [tip[0] - side * 0.08, tip[1] + 0.08, tip[2] + 0.12], tip), [0.055, 0.008], { color: i < 3 ? FEATHER_LIGHT : FEATHER, section: { ngon: 5 }, caps: "point", smooth: false, group: `primaryFeather${side}` });
    }
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const root = wing.at(0.08 + t * 0.72).at;
      const tip = [root.x + side * (0.1 + i * 0.04), root.y - 0.18 - i * 0.025, root.z - 0.28 - i * 0.06] as const;
      b.sweep([root, tip], [0.045, 0.009], { color: featherPaint, section: { ngon: 5 }, smooth: false, caps: "point", group: `coverts${side}` });
    }
  }

  // Shoulder clasps and leather flight straps make the silhouette read at a distance.
  for (const side of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.1, 0.035, 6), METAL, { bone: spine.joints[3], at: [side * 0.4, 1.73, 0.3], rotation: [0, 0, 90], flat: true, name: `shoulderClasp${side}`, group: "tack" });
    b.rod([side * 0.36, 1.63, 0.27], [side * 0.95, 1.86, -0.08], 0.018, { color: STRAP, section: { ngon: 5 }, smooth: false, group: "flightStraps" });
    b.along(polyline([[side * 0.38, 1.77, 0.24], [side * 0.78, 1.97, 0.09], [side * 1.18, 2.2, -0.04]]), 5, (at) => b.part(new THREE.SphereGeometry(0.027, 6, 4), METAL, { at, flat: true, group: "rivets" }));
  }

  // Neck and cheek feather dashes, plus a few horse coat markings.
  const neckSurface = b.surface(neckTube);
  for (const hit of neckSurface.scatter(24, { rng: rng(101), minDist: 0.07, filter: (h) => h.n.y > -0.2 })) {
    b.stick(new THREE.ConeGeometry(0.028, 0.11, 5), FEATHER_LIGHT, hit, { embed: 0.3, flat: true, group: "neckFeathers" });
  }
  const rumpSurface = b.surface(body);
  for (const hit of rumpSurface.scatter(18, { rng: rng(109), minDist: 0.13, filter: (h) => h.at.z < -0.1 && h.n.y > 0.1 })) {
    b.stick(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 6), faceSpeckle, hit, { embed: 0.25, flat: true, group: "coatMarks" });
  }

  // A small feather fan at the tail root and a braided horse tail.
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 1.33, -0.9], dir: [0, 0.05, -1], role: "tail" });
  const tail = b.chain("tail", catmull([[0, 1.33, -0.9], [0, 1.23, -1.18], [0, 1.08, -1.43], [0, 1.0, -1.7]]), { parent: tailBase, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" });
  b.sweep(tail, (t) => 0.105 - t * 0.07, { section: { ngon: 6 }, color: gradient(coat, CREST, [0, 1.3, -0.95], [0, 1, -1.7]), smooth: false, group: "horseTail" });
  b.ring(tailBase, { count: 9, radius: 0.1, fromDeg: 125, toDeg: 235, tilt: -12, name: "tailFan", role: "fan" }, (item) => {
    b.spike(item, item, 0.22 + random() * 0.1, 0.04, { color: CREST, section: { ngon: 5 }, caps: "point", smooth: false, group: "tailFan" });
  });

  // Keep the jaw visibly hinged in its neutral rest pose and return the baked root.
  b.pose(jaw, { axis: [1, 0, 0], deg: 3 });
  return b.root;
}

function wingPathFor(side: number) {
  return catmull([
    [side * 0.4, 1.72, 0.26],
    [side * 0.8, 1.84, 0.06],
    [side * 1.2, 1.99, -0.18],
    [side * 1.5, 2.12, -0.38],
  ]);
}
