```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  line,
  rng,
  paint,
  spots,
  stripes,
  countershade,
  svg,
} from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "alebrije-jaguar-eagle",
  description:
    "A vividly painted Oaxacan alebrije: a chunky spotted jaguar body with an eagle head, talons, enormous patterned wings, crest, tail feathers, and carved-wood ornament.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const ORANGE = cel("#ef6a25", "#a92f25");
  const GOLD = cel("#f5bd35", "#bd6322");
  const TURQUOISE = cel("#20b9ac", "#08736f");
  const BLUE = cel("#276bc3", "#183b8d");
  const MAGENTA = cel("#d83272", "#812052");
  const CREAM = cel("#ffe2a0", "#c98243");
  const WOOD = cel("#9b3f25", "#542022");
  const DARK = "#241326";
  const WHITE = "#fff4d4";
  const RED = "#cf292d";
  const GREEN = "#39a34a";

  const coat = furEdge(
    spots(ORANGE, [GOLD, MAGENTA, RED], { size: 0.16, amount: 0.72, rosette: true, seed: 12 }),
    CREAM,
    { level: -0.12, teeth: 0.16, period: 0.055, ink: DARK, inkWidth: 0.035 },
  );
  const wingPaint = stripes(TURQUOISE, [BLUE, MAGENTA, GOLD], {
    size: 0.22,
    width: 0.33,
    wobble: 0.2,
    axis: "y",
    seed: 8,
  });
  const bellyPaint = countershade(coat, CREAM, { level: -0.15, soft: 0.22 });

  // One root skeleton, then the major chains.
  const pelvis = b.joint("pelvis", { at: [0, 0.74, -0.18], dir: [0, 0.1, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      pelvis.at,
      [0, 0.88, 0.18],
      [0, 0.98, 0.52],
      [0, 1.08, 0.78],
    ]),
    { parent: pelvis, names: ["spine", "chest", "shoulder", "neck"], role: "spine" },
  );
  const neck = spine.tip;
  const head = b.joint("head", { parent: neck, at: [0, 1.18, 0.96], dir: [0, 0.08, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.11, 1.11], dir: [0, -0.12, 1], role: "jaw", group: "head" });

  const body = b.sweep(spine, (t) => 0.24 + 0.055 * Math.sin(t * Math.PI), {
    bone: spine,
    color: bellyPaint,
    section: "box",
    sides: 8,
    caps: "round",
    name: "paintedJaguarBody",
  });

  // Legs, deliberately sturdy and low like a carved puppet.
  for (const side of [1, -1]) {
    for (const front of [false, true]) {
      const x = side * (front ? 0.19 : 0.22);
      const z = front ? 0.55 : -0.28;
      const hip = [x, front ? 0.88 : 0.72, z] as [number, number, number];
      const knee = [x * 1.12, 0.43, z + (front ? 0.10 : -0.10)] as [number, number, number];
      const paw = [x * 1.08, 0.16, z + (front ? 0.18 : -0.16)] as [number, number, number];
      const leg = b.chain(`${front ? "fore" : "hind"}Leg${side > 0 ? "L" : "R"}`, [hip, knee, paw], {
        parent: pelvis,
        names: [`hip${side > 0 ? "L" : "R"}${front ? "F" : "H"}`, `knee${side > 0 ? "L" : "R"}${front ? "F" : "H"}`, `paw${side > 0 ? "L" : "R"}${front ? "F" : "H"}`],
        role: "leg",
        contact: paw,
      });
      b.sweep(leg, (t) => 0.095 - t * 0.025, {
        bone: leg,
        color: coat,
        section: "box",
        skin: "rigid",
        caps: "round",
        name: `${front ? "fore" : "hind"}Leg`,
      });
      b.part(new THREE.BoxGeometry(0.16, 0.10, 0.22), DARK, {
        bone: leg.tip,
        at: paw,
        name: "pawPad",
      });
      for (let i = -1; i <= 1; i++) {
        const toe = [x + i * 0.035, 0.12, paw[2] + 0.10] as [number, number, number];
        b.sweep([paw, toe], [0.028, 0.008], { bone: leg.tip, color: CREAM, caps: "point", name: "claw" });
      }
    }
  }

  // Eagle neck ruff and jaguar muzzle.
  b.sweep(
    catmull([
      [0, 1.03, 0.72],
      [0, 1.18, 0.92],
      [0, 1.30, 1.02],
    ]),
    [0.18, 0.12],
    { bone: neck, color: TURQUOISE, caps: "round", name: "neckRuff" },
  );
  b.part(new THREE.SphereGeometry(0.22, 10, 7), GOLD, {
    bone: head,
    at: [0, 1.34, 1.13],
    scale: [0.9, 0.9, 1.18],
    name: "eagleHead",
  });
  b.part(new THREE.ConeGeometry(0.14, 0.34, 6), GOLD, {
    bone: jaw,
    at: [0, 1.19, 1.35],
    dir: [0, -0.28, 1],
    name: "hookedBeak",
  });
  b.part(new THREE.ConeGeometry(0.11, 0.24, 6), RED, {
    bone: jaw,
    at: [0, 1.16, 1.48],
    dir: [0, -0.2, 1],
    name: "beakTip",
  });
  b.part(new THREE.BoxGeometry(0.25, 0.035, 0.035), DARK, {
    bone: jaw,
    at: [0, 1.22, 1.47],
    name: "beakMouth",
  });

  const eyeTexture = animeEye({ iris: "#21d8ca", blush: "#ef5275", brow: true, size: 256 });
  const headSurface = b.surface(b.root);
  for (const side of [1, -1]) {
    const eye = b.part(new THREE.SphereGeometry(0.052, 8, 6), WHITE, {
      bone: head,
      at: [side * 0.135, 1.40, 1.19],
      name: "eyeSocket",
    });
    b.decal(headSurface, eyeTexture, {
      at: [side * 0.135, 1.40, 1.245],
      dir: [0, 0.05, 1],
      up: [0, 1, 0],
      size: [0.105, 0.13],
      mirror: side > 0,
      lift: 0.006,
      name: "paintedEye",
    });
    b.part(new THREE.ConeGeometry(0.035, 0.16, 5), MAGENTA, {
      bone: head,
      at: [side * 0.14, 1.52, 1.09],
      dir: [side * 0.16, 0.3, -0.12],
      name: "eyebrowHorn",
    });
  }

  // Huge alebrije ears / feather fans.
  for (const side of [1, -1]) {
    const ear = b.extrude(
      [
        [0, 0],
        [0.16, 0.02],
        [0.22, 0.20],
        [0.08, 0.34, "sharp"],
        [-0.04, 0.17],
      ],
      {
        at: [side * 0.13, 1.48, 1.02],
        x: [side, 0, 0],
        thickness: 0.035,
        bevel: 0.012,
        smoothing: 1,
        color: MAGENTA,
        bone: head,
        name: "paintedEar",
      },
    );
    b.part(new THREE.ConeGeometry(0.032, 0.15, 5), GOLD, {
      bone: head,
      at: ear.local([0.08, 0.20, 0]),
      dir: [0, 1, 0],
      name: "earPaintSpike",
    });
  }

  // Eagle wings: articulated roots, membranes, broad feather fingers.
  for (const side of [1, -1]) {
    const wingRoot = b.joint(`wing${side > 0 ? "L" : "R"}`, {
      parent: spine.joints[1],
      at: [side * 0.22, 1.08, 0.42],
      dir: [side * 0.85, 0.28, 0.12],
      role: "wing",
      group: "wings",
    });
    const wingTip = [side * 0.92, 1.55, 0.08] as [number, number, number];
    const wing = b.chain(`wingBone${side > 0 ? "L" : "R"}`, [
      wingRoot.at,
      [side * 0.58, 1.38, 0.38],
      wingTip,
    ], { parent: wingRoot, role: "wing", names: ["wingBase", "wingElbow", "wingTip"] });
    b.sweep(wing, [0.10, 0.055], { bone: wing, color: BLUE, section: "box", name: "wingArm" });
    const upper = [side * 0.48, 1.72, 0.30] as [number, number, number];
    b.membrane(wing, [wingRoot.at, upper, [side * 0.90, 1.72, 0.02]], {
      color: wingPaint,
      thickness: 0.018,
      rows: 5,
      cols: 8,
      scallop: 0.12,
      name: "paintedWingMembrane",
    });
    for (let i = 0; i < 7; i++) {
      const root = [side * (0.46 + i * 0.065), 1.48 + i * 0.035, 0.25 - i * 0.045] as [number, number, number];
      const tip = [side * (0.73 + i * 0.075), 1.88 - i * 0.025, -0.02 - i * 0.07] as [number, number, number];
      b.sweep([root, tip], [0.045, 0.006], {
        bone: wing,
        color: i % 2 ? TURQUOISE : GOLD,
        caps: "point",
        name: "flightFeather",
      });
    }
  }

  // Dorsal crest, painted tail, and tail fan.
  const crest = [
    [0, 1.10, 0.12],
    [0, 1.30, 0.27],
    [0, 1.48, 0.40],
    [0, 1.62, 0.55],
  ] as [number, number, number][];
  for (let i = 0; i < crest.length; i++) {
    b.part(new THREE.ConeGeometry(0.065, 0.25, 5), i % 2 ? MAGENTA : TURQUOISE, {
      at: crest[i],
      dir: [0, 1, 0],
      bone: spine.joints[Math.min(i, spine.joints.length - 1)],
      name: "backCrest",
    });
  }

  const tail = b.chain("tail", catmull([
    [-0.01, 0.78, -0.38],
    [0, 0.78, -0.82],
    [0.04, 0.90, -1.20],
    [0.12, 1.08, -1.48],
  ]), { parent: pelvis, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" });
  const tailTube = b.sweep(tail, (t) => 0.13 - t * 0.10, {
    bone: tail,
    color: stripes(coat, [BLUE, MAGENTA], { size: 0.18, axis: "z", seed: 4 }),
    section: "box",
    name: "stripedTail",
  });
  for (const s of [1, -1]) {
    const root = tail.at(0.82).at;
    const tip = [root.x + s * 0.34, root.y + 0.20, root.z - 0.18] as [number, number, number];
    b.sweep([root, tip], [0.055, 0.008], { bone: tail.tip, color: s > 0 ? GOLD : MAGENTA, caps: "point", name: "tailFanFeather" });
  }

  // Painted wood beads and rosette studs enrich the silhouette.
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.10;
    const p = body.at(t, 0);
    b.stick(new THREE.SphereGeometry(0.028, 7, 5), i % 3 === 0 ? RED : GOLD, p, {
      embed: 0.45,
      name: "carvedBodyStud",
    });
  }

  // Small decorative rays behind the head.
  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const base = [side * (0.12 + i * 0.035), 1.32 + i * 0.035, 0.92] as [number, number, number];
      b.sweep([base, [side * (0.28 + i * 0.04), 1.43 + i * 0.06, 0.82]], [0.025, 0.004], {
        bone: head,
        color: i % 2 ? GOLD : RED,
        caps: "point",
        name: "headRay",
      });
    }
  }

  return b.root;
}
```