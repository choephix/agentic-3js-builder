```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  paint,
  spots,
  stripes,
  countershade,
  svg,
} from "agentic-3js-builder";
import { animeEye, cel, furEdge, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A vividly painted Oaxacan alebrije: a spotted jaguar body with eagle wings, feathered tail, golden eyes, carved beak and curling ornamental crest.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const ORANGE = "#d95727";
  const RED = "#b82d2d";
  const TURQUOISE = "#18aeb0";
  const BLUE = "#2454a6";
  const YELLOW = "#f5c542";
  const CREAM = "#f5dfad";
  const DARK = "#291b2b";
  const GREEN = "#4e9c55";
  const PURPLE = "#713d9c";
  const WOOD = "#8e3d28";

  const coatBase = cel(
    furEdge(spots(ORANGE, [RED, PURPLE], { size: 0.15, amount: 0.7, rosette: true, seed: 14 }), CREAM, {
      by: "normal",
      level: -0.18,
      teeth: 0.18,
      period: 0.12,
      ink: DARK,
      inkWidth: 0.035,
    }),
    "#7d2f31",
  );
  const belly = cel(CREAM, "#c48772");
  const featherPaint = cel(
    stripes(TURQUOISE, [BLUE, PURPLE, GREEN], {
      size: 0.11,
      width: 0.34,
      wobble: 0.22,
      seed: 7,
    }),
    "#173b75",
  );
  const gold = cel(YELLOW, "#9b5a20");
  const beakPaint = cel("#e89b31", "#813a24");
  const eyeTexture = animeEye({ iris: "#20d5c5", blush: false, size: 384 });

  // One central root joint.
  const hips = b.joint("hips", {
    at: [0, 0.62, -0.05],
    dir: [0, 0.03, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.66, -0.72],
    [0, 0.72, -0.36],
    [0, 0.72, 0.08],
    [0, 0.78, 0.42],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
  });
  const body = b.sweep(spine, (t) => 0.24 - t * 0.035, {
    bone: spine,
    color: coatBase,
    section: { ngon: 8 },
    caps: "round",
    name: "paintedJaguarBody",
  });

  // Cream chest and belly panels.
  const chestPanel = b.sweep(
    catmull([
      [0, 0.69, 0.26],
      [0, 0.62, 0.48],
      [0, 0.57, 0.67],
    ]),
    [0.19, 0.125],
    { bone: spine.joints[2], color: belly, section: { ngon: 7 }, caps: "round", name: "creamChest" },
  );

  // Hind legs and forelegs, posed in a sturdy resting quadruped stance.
  const feet = [
    { s: 1, side: "L", hip: [0.18, 0.67, -0.37], foot: [0.25, 0.13, -0.62] },
    { s: -1, side: "R", hip: [-0.18, 0.67, -0.37], foot: [-0.25, 0.13, -0.62] },
    { s: 1, side: "L", hip: [0.18, 0.72, 0.30], foot: [0.22, 0.13, 0.53] },
    { s: -1, side: "R", hip: [-0.18, 0.72, 0.30], foot: [-0.22, 0.13, 0.53] },
  ];

  feet.forEach((f, i) => {
    const pts = limb(
      f.hip,
      f.foot,
      i < 2 ? [0.24, 0.22, 0.19] : [0.25, 0.22, 0.19],
      i < 2 ? [[0, 0, -1], [0, 0, 1]] : [[0, 0, 1], [0, 0, -1]],
      { sole: [0, 1, 0] },
    );
    const leg = b.chain(`leg${f.side}${i < 2 ? "H" : "F"}`, pts, {
      parent: hips,
      names: [`hip${f.side}${i}`, `knee${f.side}${i}`, `ankle${f.side}${i}`, `paw${f.side}${i}`],
      role: "leg",
      contact: f.foot,
    });
    b.sweep(leg, (t) => (t < 0.62 ? 0.105 : 0.075), {
      bone: leg,
      color: coatBase,
      section: { ngon: 7 },
      caps: "round",
      name: `stripedLeg${f.side}${i}`,
    });
    const paw = b.part(new THREE.SphereGeometry(0.095, 8, 5), DARK, {
      bone: leg.tip!,
      at: f.foot,
      scale: [1.05, 0.48, 1.2],
      name: `paw${f.side}${i}`,
    });
    // bright carved toe beans and claws
    for (let j = -1; j <= 1; j++) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), YELLOW, {
        bone: leg.tip!,
        at: [f.foot[0] + j * 0.038, 0.115, f.foot[2] + 0.045],
        name: `toe${f.side}${i}${j}`,
      });
    }
    void paw;
  });

  // Neck and oversized expressive head.
  const neckPath = catmull([
    [0, 0.76, 0.36],
    [0, 0.88, 0.56],
    [0, 1.02, 0.70],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip!,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  b.sweep(neck, [0.18, 0.135], {
    bone: neck,
    color: coatBase,
    section: { ngon: 8 },
    name: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.1, 0.76],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });
  const skull = b.part(new THREE.SphereGeometry(0.235, 12, 8), coatBase, {
    bone: head,
    at: [0, 1.12, 0.78],
    scale: [1.05, 0.9, 1.18],
    name: "roundJaguarSkull",
  });
  const muzzle = b.part(new THREE.SphereGeometry(0.13, 9, 6), belly, {
    bone: head,
    at: [0, 1.04, 0.97],
    scale: [1.22, 0.7, 0.9],
    name: "creamMuzzle",
  });

  // Separate openable upper/lower jaws.
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.02, 0.91],
    aim: [0, 0.99, 1.13],
    role: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.18, 0.055, 0.18), DARK, {
    bone: jaw,
    at: [0, 0.99, 1.04],
    name: "lowerJaw",
  });
  for (const s of [-1, 1]) {
    b.spike([s * 0.078, 1.03, 1.08], [0, -0.12, -0.12], 0.095, 0.018, {
      color: CREAM,
      bone: jaw,
      name: "tusk",
    });
  }
  b.part(new THREE.SphereGeometry(0.045, 8, 5), DARK, {
    bone: head,
    at: [0, 1.055, 1.105],
    scale: [1.15, 0.55, 0.75],
    name: "nose",
  });

  // Eyes are the face's strongest read.
  const faceSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = faceSurface.around([0, 1.12, 0.78]).at(s * 48, 5)!;
    b.decal(faceSurface, eyeTexture, {
      at: hit,
      size: [0.105, 0.14],
      lift: 0.006,
      mirror: s > 0,
      name: `jewelEye${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.ConeGeometry(0.018, 0.09, 6), DARK, {
      bone: head,
      at: [s * 0.17, 1.28, 0.77],
      dir: [0, 0.45, -0.15],
      name: "browHorn",
    });
  }

  // Tall jaguar ears, painted like carved leaves.
  const earOutline: [number, number, "sharp"][] = [
    [-0.09, 0],
    [-0.12, 0.17, "sharp"],
    [0, 0.29, "sharp"],
    [0.12, 0.17, "sharp"],
    [0.09, 0],
  ];
  for (const s of [-1, 1]) {
    b.extrude(earOutline, {
      at: [s * 0.16, 1.27, 0.72],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      color: RED,
      bone: head,
      name: `paintedEar${s}`,
    });
    b.part(new THREE.ConeGeometry(0.045, 0.13, 6), YELLOW, {
      bone: head,
      at: [s * 0.16, 1.38, 0.715],
      dir: [0, 0.7, 0],
      name: "earTip",
    });
  }

  // Eagle beak and crest.
  b.part(new THREE.ConeGeometry(0.105, 0.25, 6), beakPaint, {
    bone: head,
    at: [0, 1.14, 1.12],
    dir: [0, -0.18, 1],
    rotation: [0, 0, 180],
    name: "hookedEagleBeak",
  });
  const crest = b.chain(
    "crest",
    catmull([
      [0, 1.27, 0.62],
      [0, 1.47, 0.58],
      [0, 1.65, 0.52],
    ]),
    { parent: head, names: ["crest1", "crest2", "crest3"], role: "fan" },
  );
  b.sweep(crest, [0.07, 0.012], {
    bone: crest,
    color: PURPLE,
    caps: { start: "round", end: "point" },
    name: "purpleCrest",
  });
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.042;
    b.spike([x, 1.38 + Math.abs(i - 2) * 0.015, 0.61], [x * 0.6, 1.62, 0.5], null, 0.025, {
      color: YELLOW,
      bone: head,
      name: "crestQuill",
    });
  }

  // Long curling tail, with a turquoise painted tip.
  const tailPath = catmull([
    [0, 0.69, -0.55],
    [0, 0.63, -0.95],
    [0.12, 0.72, -1.24],
    [0.27, 0.9, -1.38],
    [0.18, 1.08, -1.5],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });
  b.sweep(tail, (t) => 0.115 * (1 - t) + 0.018, {
    bone: tail,
    color: (t) => (t > 0.7 ? featherPaint : coatBase),
    caps: { start: "round", end: "point" },
    name: "stripedTail",
  });
  b.along(tail, 8, (at) =>
    b.spike(at, at, 0.06 + 0.035 * at.t, 0.014, {
      color: YELLOW,
      name: "tailDecoration",
    }),
  );

  // Eagle wings: broad angular arm bones plus layered feather membranes.
  for (const s of [-1, 1]) {
    const shoulder = [s * 0.16, 0.96, 0.22] as [number, number, number];
    const elbow = [s * 0.43, 1.25, 0.12] as [number, number, number];
    const wrist = [s * 0.76, 1.28, -0.04] as [number, number, number];
    const wing = b.chain(`wing${s > 0 ? "L" : "R"}`, catmull([shoulder, elbow, wrist]), {
      parent: spine.joints[2],
      names: [`wingRoot${s}`, `wingElbow${s}`, `wingTip${s}`],
      role: "wing",
    });
    b.sweep(wing, [0.075, 0.035], {
      bone: wing,
      color: BLUE,
      section: { ngon: 6 },
      name: "blueWingArm",
    });

    const upperEdge = catmull([
      shoulder,
      [s * 0.36, 1.48, 0.03],
      [s * 0.71, 1.56, -0.12],
      [s * 0.88, 1.42, -0.28],
    ]);
    const lowerEdge = catmull([
      shoulder,
      [s * 0.42, 1.04, -0.08],
      [s * 0.72, 1.08, -0.26],
      [s * 0.88, 1.17, -0.28],
    ]);
    b.membrane(upperEdge, lowerEdge, {
      color: featherPaint,
      thickness: 0.018,
      rows: 5,
      cols: 7,
      scallop: 0.16,
      name: "paintedWingMembrane",
    });

    // Seven large, individually readable flight feathers.
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const root: [number, number, number] = [
        s * (0.38 + t * 0.34),
        1.24 + Math.sin(t * Math.PI) * 0.08,
        -0.04 - t * 0.16,
      ];
      const tip: [number, number, number] = [
        s * (0.62 + t * 0.38),
        1.55 - t * 0.12,
        -0.23 - t * 0.28,
      ];
      b.sweep(catmull([root, tip]), [0.035, 0.006], {
        bone: wing.joints[Math.min(1, wing.joints.length - 1)],
        color: i % 2 ? YELLOW : RED,
        caps: { start: "round", end: "point" },
        name: "flightFeather",
      });
      b.part(new THREE.SphereGeometry(0.018, 6, 4), TURQUOISE, {
        bone: wing.joints[1],
        at: tip,
        name: "featherBead",
      });
    }
  }

  // Painted rosettes and bright studs on the shoulders.
  const bodySurface = b.surface(body);
  for (const h of bodySurface.scatter(28, {
    rng: rng(33),
    minDist: 0.105,
    filter: (hit) => hit.n.y > -0.15,
  })) {
    b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 7), YELLOW, h, {
      embed: 0.45,
      name: "alebrijeStud",
    });
  }

  // Small ornamental rings around the neck and tail root.
  const neckLoop = b.surface(neck).loop(neck.joints[0], { lift: 0.008 });
  b.sweep(neckLoop, 0.018, { color: YELLOW, name: "goldNeckBand" });
  const tailBand = b.surface(body).loop(spine.joints[0], { lift: 0.006 });
  b.sweep(tailBand, 0.014, { color: TURQUOISE, name: "turquoiseBand" });

  return b.root;
}
```