import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { countershade, spots } from "../src/paint";
import { cel, INK } from "../kits/toon";
const FROG_SCALE = 0.12;
const FROG_FLOOR = 0.012;
const frogPoint = (x: number, y: number, z: number): [number, number, number] => [
  x * FROG_SCALE,
  FROG_FLOOR + y * FROG_SCALE,
  z * FROG_SCALE,
];
const frogPath = (points: number[][]) => points.map(([x, y, z]) => frogPoint(x, y, z));
const frogSize = (value: number) => value * FROG_SCALE;
const LEAF_SCALE = 0.5;
const leafPoint = (x: number, y: number, z: number): [number, number, number] => [x * LEAF_SCALE, y, z * LEAF_SCALE];
const RED = cel("#e5363d", "#8b1834");
const RED_SPOTTED = countershade(
  spots(RED, "#541d46", { size: 0.012, amount: 0.22, rosette: true, seed: 17 }),
  "#f5a22e",
  { level: -0.12 },
);
const BLUE = cel("#244b9b", "#111d55");
const BLUE_DARK = cel("#142556", "#080f2c");
const CYAN = cel("#52e3dc", "#14859a");
const GOLD = cel("#ffd552", "#c57a23");
const LEAF = cel("#55b44d", "#1f633a");
const LEAF_EDGE = cel("#9bdd55", "#3b8e40");
const LEAF_PAINT = spots(LEAF, "#2c843a", { size: 0.025, amount: 0.22, seed: 29 });
const VEIN = cel("#d2e765", "#679b3c");
const WATER = "#9cecff";

export const meta = {
  name: "Strawberry Poison Dart Frog",
  description: "A jewel-bright poison dart frog perched on a broad jungle leaf, with splayed toes, huge eyes, and hand-cut low-poly markings.",
  style: "whimsical low-poly mix",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "poisonDartFrog", detail: 0.8, paintSize: 1024 });

  // One compact root and a readable neutral frog skeleton.
  const hips = b.joint("hips", { at: frogPoint(0, 0.06, -0.045), role: "spine" });
  const spine = b.chain(
    "spine",
    catmull(
      frogPath([
        [0, 0.06, -0.045],
        [0, 0.068, 0.02],
        [0, 0.077, 0.085],
        [0, 0.085, 0.135],
      ]),
    ),
    { parent: hips, names: ["spine", "chest", "shoulder", "spineTip"], role: "spine" },
  );
  const shoulder = spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: shoulder, at: frogPoint(0, 0.089, 0.145), dir: [0, 0.18, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: frogPoint(0, 0.103, 0.19), dir: [0, 0.02, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: frogPoint(0, 0.082, 0.225), dir: [0, -0.2, 1], role: "jaw" });

  const hindL = b.chain(
    "hindL",
    polyline(
      frogPath([
        [0.045, 0.06, -0.035],
        [0.102, 0.047, -0.055],
        [0.12, 0.027, 0.008],
        [0.105, 0.018, 0.06],
      ]),
    ),
    { parent: hips, names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg" },
  );
  const hindR = b.chain(
    "hindR",
    polyline(
      frogPath([
        [-0.045, 0.06, -0.035],
        [-0.102, 0.047, -0.055],
        [-0.12, 0.027, 0.008],
        [-0.105, 0.018, 0.06],
      ]),
    ),
    { parent: hips, names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg" },
  );
  const armL = b.chain(
    "armL",
    polyline(
      frogPath([
        [0.038, 0.074, 0.105],
        [0.075, 0.053, 0.132],
        [0.082, 0.028, 0.18],
        [0.073, 0.016, 0.215],
      ]),
    ),
    { parent: shoulder, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    polyline(
      frogPath([
        [-0.038, 0.074, 0.105],
        [-0.075, 0.053, 0.132],
        [-0.082, 0.028, 0.18],
        [-0.073, 0.016, 0.215],
      ]),
    ),
    { parent: shoulder, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  // Low-poly leaf: broad, slightly asymmetric, and ribbed like a real jungle leaf.
  b.extrude(
    [
      [-0.02, -0.09],
      [0.07, -0.072],
      [0.15, -0.018],
      [0.17, 0.045],
      [0.13, 0.11],
      [0.06, 0.158],
      [-0.015, 0.19],
      [-0.08, 0.158],
      [-0.145, 0.095],
      [-0.16, 0.018],
      [-0.115, -0.045],
    ].map(([x, z]) => [x * LEAF_SCALE, z * LEAF_SCALE]),
    {
      at: leafPoint(0, 0.006, -0.005),
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.008,
      bevel: 0.003,
      color: LEAF_PAINT,
      bone: hips,
      name: "leaf",
      group: "scenery",
    },
  );
  const leafRoot = leafPoint(0, 0.012, -0.005);
  const leafTip = leafPoint(0, 0.014, 0.18);
  b.rod(leafRoot, leafTip, 0.003, { color: VEIN, bone: hips, name: "leafMidrib", group: "scenery" });
  for (const side of [1, -1]) {
    for (const [z, x] of [[0.035, 0.075], [0.085, 0.11], [0.13, 0.09]] as const) {
      b.rod(leafPoint(0, 0.015, z), leafPoint(side * x, 0.014, z + 0.025), 0.0014, {
        color: VEIN,
        bone: hips,
        name: `leafVein${side > 0 ? "L" : "R"}${z}`,
        group: "scenery",
      });
    }
  }
  for (const [x, z, s] of [[0.108, 0.115, 1], [-0.09, 0.07, 0.8], [0.055, 0.145, 0.65]] as const) {
    b.part(new THREE.SphereGeometry(0.0045 * s, 6, 4), WATER, {
      bone: hips,
      at: leafPoint(x, 0.023, z),
      name: `dew${x}`,
      group: "scenery",
      flat: true,
    });
  }

  const body = b.sweep(spine, (t) => [frogSize(0.06 - t * 0.012), frogSize(0.052 - t * 0.01)], {
    section: { ngon: 8 },
    color: RED_SPOTTED,
    caps: "round",
    name: "body",
    group: "frog",
  });
  b.sweep(
    catmull(
      frogPath([
        [0, 0.086, 0.125],
        [0, 0.096, 0.155],
        [0, 0.104, 0.19],
      ]),
    ),
    [frogSize(0.043), frogSize(0.035)],
    {
      bone: neck,
      section: { ngon: 7 },
      color: RED_SPOTTED,
      caps: "round",
      name: "neckSkin",
      group: "frog",
    },
  );
  const skull = b.part(new THREE.SphereGeometry(1, 10, 7), RED_SPOTTED, {
    bone: head,
    at: head.local({ forward: frogSize(0.012) }),
    scale: [frogSize(0.067), frogSize(0.057), frogSize(0.065)],
    flat: true,
    name: "skull",
    group: "frog",
  });

  // Indigo limbs contrast the scarlet body; flat sections retain the toy-like faceting.
  for (const [chain, name] of [[hindL, "hindL"], [hindR, "hindR"], [armL, "armL"], [armR, "armR"]] as const) {
    b.sweep(chain, (t) => frogSize(name.startsWith("hind") ? 0.015 - t * 0.006 : 0.011 - t * 0.004), {
      section: { ngon: 6 },
      color: name.endsWith("L") ? BLUE : BLUE_DARK,
      caps: "round",
      name: `${name}Skin`,
      group: "frog",
    });
  }

  // Broad sticky toe pads and three separated toes per foot/hand.
  const toeChains = [
    [hindL.joints[hindL.joints.length - 1], 1, "hindL"],
    [hindR.joints[hindR.joints.length - 1], -1, "hindR"],
    [armL.joints[armL.joints.length - 1], 1, "armL"],
    [armR.joints[armR.joints.length - 1], -1, "armR"],
  ] as const;
  for (const [parent, side, prefix] of toeChains) {
    const isHind = prefix.startsWith("hind");
    const spread = isHind ? frogSize(0.036) : frogSize(0.028);
    const forward = isHind ? frogSize(0.058) : frogSize(0.045);
    for (let i = -1; i <= 1; i++) {
      const toeName = `${prefix}Toe${i + 2}`;
      const start = parent.at;
      const toe = b.chain(
        toeName,
        polyline([
          start,
          [start.x + side * i * spread, FROG_FLOOR + frogSize(0.014), start.z + forward + Math.abs(i) * frogSize(0.008)],
        ]),
        { parent, names: [`${toeName}Base`, `${toeName}Tip`], role: "digit" },
      );
      b.sweep(toe, [frogSize(0.006), frogSize(0.003)], {
        section: { ngon: 5 },
        color: CYAN,
        caps: "round",
        name: `${toeName}Blue`,
        group: "digits",
      });
      const tip = toe.at(1);
      b.part(new THREE.SphereGeometry(frogSize(0.007), 6, 4), GOLD, {
        bone: toe.tip ?? toe.joints[toe.joints.length - 1],
        at: tip.at,
        scale: [1, 0.45, 1],
        flat: true,
        name: `${toeName}Pad`,
        group: "digits",
      });
    }
  }

  // Huge expressive eyes: dark socket, turquoise iris, gold ring, and twin catchlights.
  for (const side of [1, -1]) {
    const eyeAt = head.local({
      left: side * frogSize(0.047),
      up: frogSize(0.027),
      forward: frogSize(0.036),
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), INK, {
      bone: head,
      at: eyeAt,
      scale: [frogSize(0.027), frogSize(0.026), frogSize(0.022)],
      flat: true,
      name: `eyeSocket${side > 0 ? "L" : "R"}`,
      group: "face",
    });
    const irisAt = head.local({
      left: side * frogSize(0.047),
      up: frogSize(0.027),
      forward: frogSize(0.055),
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), CYAN, {
      bone: head,
      at: irisAt,
      scale: [frogSize(0.019), frogSize(0.019), frogSize(0.009)],
      flat: true,
      name: `iris${side > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), INK, {
      bone: head,
      at: head.local({
        left: side * frogSize(0.047),
        up: frogSize(0.027),
        forward: frogSize(0.063),
      }),
      scale: [frogSize(0.006), frogSize(0.014), frogSize(0.004)],
      flat: true,
      name: `pupil${side > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#ffffff", {
      bone: head,
      at: head.local({
        left: side * frogSize(0.04),
        up: frogSize(0.038),
        forward: frogSize(0.067),
      }),
      scale: [frogSize(0.0055), frogSize(0.0055), frogSize(0.003)],
      flat: true,
      name: `eyeGlint${side > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#ffffff", {
      bone: head,
      at: head.local({
        left: side * frogSize(0.052),
        up: frogSize(0.019),
        forward: frogSize(0.066),
      }),
      scale: [frogSize(0.0028), frogSize(0.0028), frogSize(0.002)],
      flat: true,
      name: `eyeGlintSmall${side > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // A separate upper lip and lower jaw make the mouth riggable and readable.
  b.sweep(
    polyline(
      frogPath([
        [0, 0.087, 0.22],
        [0, 0.084, 0.255],
      ]),
    ),
    [frogSize(0.009), frogSize(0.006)],
    {
      bone: head,
      section: { ngon: 6 },
      color: INK,
      caps: "round",
      name: "upperLip",
      group: "face",
    },
  );
  b.sweep(polyline([jaw.at, frogPoint(0, 0.076, 0.252)]), [frogSize(0.011), frogSize(0.004)], {
    bone: jaw,
    section: { ngon: 6 },
    color: RED,
    caps: "round",
    name: "lowerJaw",
    group: "face",
  });
  b.part(new THREE.SphereGeometry(frogSize(0.006), 7, 5), GOLD, {
    bone: jaw,
    at: frogPoint(0, 0.077, 0.252),
    scale: [1, 0.7, 0.5],
    flat: true,
    name: "tongueTip",
    group: "face",
  });

  // A handful of raised shoulder spots give the painted pattern a tactile finish.
  const bodySurface = b.surface([body, skull]);
  for (const [azimuth, elevation, radius] of [[24, 26, 0.009], [-35, 18, 0.007], [150, 35, 0.008], [205, 12, 0.006]] as const) {
    const hit = bodySurface.around(frogPoint(0, 0.08, 0.05)).at(azimuth, elevation);
    if (hit) {
      b.stick(new THREE.CylinderGeometry(frogSize(radius), frogSize(radius * 0.8), frogSize(0.003), 6), "#321638", hit, {
        embed: 0.4,
        name: `raisedSpot${azimuth}`,
        group: "markings",
      });
    }
  }

  // One curling tendril and a tiny folded leaf tag make the perch feel alive.
  b.sweep(
    catmull(
      [
        [0.12, 0.011, 0.04],
        [0.15, 0.014, 0.07],
        [0.14, 0.016, 0.1],
        [0.105, 0.018, 0.115],
      ].map(([x, y, z]) => leafPoint(x, y, z)),
    ),
    [0.002, 0.0005],
    {
      bone: hips,
      section: { ngon: 5 },
      color: LEAF_EDGE,
      caps: "round",
      name: "leafTendril",
      group: "scenery",
    },
  );

  // Keep the seed visible in source so all authored variation remains deterministic.
  rng(42);
  return b.root;
}
