import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  paint,
  spots,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A brutal five-headed hydra in a God of War-inspired low-poly puppet style, with armored scales, open jaws, horns, muscular legs, and a plated tail.",
};

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  const DARK = "#24151b";
  const DEEP = "#351b22";
  const SCALE = "#633b31";
  const SCALE_HI = "#9b6040";
  const BELLY = "#c08b62";
  const HORN = "#c9ad83";
  const TEETH = "#eee0b5";
  const GUM = "#7d2931";
  const EYE = "#ff9a22";
  const ARMOR = "#382c31";
  const BRONZE = "#95623d";

  const coat = cel(
    furEdge(SCALE_HI, SCALE, {
      axis: [0, 1, 0],
      level: -0.05,
      teeth: 0.22,
      period: 0.12,
      along: [0, 0, 1],
      ink: DARK,
      inkWidth: 0.025,
    }),
    "#3c2228",
    { threshold: 0.05 },
  );

  const bellyPaint = cel(BELLY, "#714038", { threshold: 0.02 });
  const armorPaint = cel(ARMOR, "#17151b", { threshold: 0.15 });
  const eyeTexture = animeEye({
    iris: EYE,
    irisLight: "#ffd36b",
    irisDark: "#7f240d",
    ink: "#130d12",
    blush: false,
    brow: true,
    size: 256,
  });

  // Skeleton first: one root, a heavy serpentine torso, four legs, tail, and five neck chains.
  const pelvis = b.joint("pelvis", {
    at: [0, 0.72, -0.1],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.72, -0.75],
    [0, 0.78, -0.35],
    [0, 0.86, 0.05],
    [0, 0.94, 0.42],
    [0, 1.0, 0.72],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: pelvis,
    names: ["spineRear", "spineMid", "spineFront", "chest"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.72, -0.55],
    [0, 0.61, -1.05],
    [0, 0.48, -1.5],
    [0.12, 0.38, -1.9],
    [0.3, 0.34, -2.18],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: pelvis,
    names: ["tailBase", "tail1", "tail2", "tailTip"],
    role: "tail",
  });

  const legTargets = [
    { s: 1, z: 0.34, name: "frontL" },
    { s: -1, z: 0.34, name: "frontR" },
    { s: 1, z: -0.48, name: "rearL" },
    { s: -1, z: -0.48, name: "rearR" },
  ];

  const legs: ReturnType<typeof b.chain>[] = [];
  for (const leg of legTargets) {
    const x = leg.s * 0.34;
    const hip = [x, 0.82, leg.z] as [number, number, number];
    const foot = [leg.s * 0.46, 0.16, leg.z + (leg.z > 0 ? 0.13 : -0.12)] as [
      number,
      number,
      number,
    ];
    const points = limb(
      hip,
      foot,
      [0.34, 0.31, 0.22],
      [
        [0, 0, leg.z > 0 ? 1 : -1],
        [0, 0, leg.z > 0 ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    legs.push(
      b.chain(leg.name, points, {
        parent: pelvis,
        names: [`hip${leg.s > 0 ? "L" : "R"}${leg.z > 0 ? "F" : "B"}`, `knee${leg.name}`, `ankle${leg.name}`],
        role: "leg",
        contact: foot,
      }),
    );
  }

  const neckData = [
    { x: 0, y: 1.12, z: 0.63, lean: 0 },
    { x: 0.34, y: 1.08, z: 0.61, lean: 0.17 },
    { x: -0.34, y: 1.08, z: 0.61, lean: -0.17 },
    { x: 0.62, y: 1.02, z: 0.5, lean: 0.36 },
    { x: -0.62, y: 1.02, z: 0.5, lean: -0.36 },
  ];

  const necks: ReturnType<typeof b.chain>[] = [];
  const heads: ReturnType<typeof b.joint>[] = [];
  for (let i = 0; i < neckData.length; i++) {
    const n = neckData[i];
    const neckPath = catmull([
      [n.x * 0.45, 0.88, 0.48],
      [n.x * 0.7, 1.06, 0.63],
      [n.x, n.y + 0.18, n.z + 0.18],
      [n.x + n.lean, n.y + 0.38, n.z + 0.38],
    ]);
    const neck = b.chain(`neck${i + 1}`, neckPath, {
      parent: spine.tip!,
      names: [`neck${i + 1}Base`, `neck${i + 1}Mid`, `neck${i + 1}Top`],
      role: "neck",
      count: 4,
    });
    necks.push(neck);
    const h = b.joint(`head${i + 1}`, {
      parent: neck.tip!,
      at: neck.at(1).at,
      dir: [n.lean * 0.35, 0.05, 1],
      role: "head",
      group: "heads",
    });
    heads.push(h);
    b.joint(`jaw${i + 1}`, {
      parent: h,
      at: h.local({ forward: 0.12, down: 0.05 }),
      dir: h.local({ forward: 0.4, down: 0.08 }),
      role: "jaw",
      group: "jaws",
    });
  }

  // Main body and tail tubes.
  const body = b.sweep(spine, (t) => 0.38 + 0.08 * Math.sin(t * Math.PI), {
    color: coat,
    section: { ngon: 8 },
    sides: 8,
  });
  b.sweep(tail, (t) => 0.25 * (1 - t) + 0.035, {
    color: coat,
    section: { ngon: 7 },
    caps: "point",
  });

  // Belly plates and dorsal armor ridge.
  b.sweep(spine.path, 0.23, {
    bone: spine,
    color: bellyPaint,
    shift: [0, -0.16],
    section: { ngon: 7 },
    caps: "none",
  });
  b.along(body, 9, (at) => {
    b.spike(at, at, 0.14, 0.055, { color: ARMOR });
  });
  b.along(tail, 7, (at) => {
    b.spike(at, at, 0.1, 0.035, { color: ARMOR });
  });

  // Four powerful digitigrade legs, claws, and bronze bracers.
  for (let li = 0; li < legs.length; li++) {
    const leg = legs[li];
    b.sweep(leg, (t) => 0.105 - t * 0.035, {
      color: coat,
      section: { ngon: 6 },
    });
    const tip = leg.tip!;
    b.part(
      new THREE.SphereGeometry(0.115, 7, 5),
      DARK,
      { bone: tip, at: tip.at, scale: [1.1, 0.55, 1.35], name: `paw${li}` },
    );
    for (let c = -1; c <= 1; c++) {
      const clawBase = tip.local([c * 0.055, 0.01, 0.06]);
      b.spike(clawBase, [0, -0.02, 1], 0.13, 0.024, {
        color: HORN,
        bone: tip!,
      });
    }
    const cuff = b.part(
      new THREE.CylinderGeometry(0.13, 0.14, 0.09, 8),
      armorPaint,
      { bone: leg.joints[0], at: leg.joints[0].at, name: `greave${li}` },
    );
    b.along(leg, 3, (at) =>
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BRONZE, {
        at,
        bone: at.bone,
      }),
    );
    void cuff;
  }

  // Heads: broad skulls, muzzles, brow ridges, eyes, horns, and open lower jaws.
  for (let i = 0; i < heads.length; i++) {
    const head = heads[i];
    const jaw = b.joint(`jaw${i + 1}`, {
      parent: head,
      at: head.local({ forward: 0.13, down: 0.035 }),
      dir: head.local({ forward: 0.35, down: 0.08 }),
      role: "jaw",
      group: "jaws",
    });

    b.part(
      new THREE.SphereGeometry(0.28, 10, 7),
      coat,
      {
        bone: head,
        at: head.local({ forward: 0.04, up: 0.02 }),
        scale: [0.88, 0.88, 1.22],
        name: `skull${i}`,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.19, 8, 5),
      bellyPaint,
      {
        bone: head,
        at: head.local({ forward: 0.25, down: 0.08 }),
        scale: [0.8, 0.58, 1.25],
        name: `muzzle${i}`,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.16, 8, 5),
      GUM,
      {
        bone: jaw,
        at: jaw.local({ forward: 0.19, down: 0.02 }),
        scale: [0.85, 0.35, 1.4],
        name: `lowerJaw${i}`,
      },
    );

    // Decals read strongly from the front and follow each head bone.
    for (const side of [1, -1]) {
      const eyeAt = head.local({
        left: side * 0.145,
        up: 0.09,
        forward: 0.205,
      });
      b.decal(head, eyeTexture, {
        at: eyeAt,
        dir: [0, 0, 1],
        up: [0, 1, 0],
        size: [0.11, 0.145],
        mirror: side > 0,
        lift: 0.006,
        name: `eye${i}_${side}`,
      });
    }

    // Brow plates and cheek horns.
    for (const side of [1, -1]) {
      const brow = head.local({
        left: side * 0.14,
        up: 0.18,
        forward: 0.19,
      });
      b.spike(brow, head.dir([0, 0.25, 0.8]), 0.18, 0.045, {
        color: armorPaint,
        bone: head,
      });
      const hornRoot = head.local({
        left: side * 0.19,
        up: 0.16,
        back: 0.02,
      });
      const hornTip = head.local({
        left: side * 0.34,
        up: 0.38,
        back: -0.05,
      });
      b.sweep(
        catmull([hornRoot, head.local({ left: side * 0.28, up: 0.27 }), hornTip]),
        [0.065, 0.012],
        { bone: head, color: HORN, caps: "point" },
      );
    }

    // Teeth are chunky and individually readable inside each open mouth.
    for (const side of [1, -1]) {
      for (let tooth = 0; tooth < 4; tooth++) {
        const p = jaw.local({
          left: side * (0.11 - tooth * 0.035),
          forward: 0.22 - tooth * 0.055,
          up: 0.035,
        });
        b.spike(p, [0, -1, 0], 0.085, 0.018, {
          color: TEETH,
          bone: jaw,
        });
      }
    }
    b.pose(jaw, { axis: [1, 0, 0], deg: -18 });
  }

  // Hideously recognizable glowing eyes on the main silhouettes.
  for (const head of heads) {
    const eye = b.part(
      new THREE.SphereGeometry(0.026, 8, 6),
      EYE,
      {
        bone: head,
        at: head.local({ forward: 0.235, up: 0.105 }),
        name: "eye-glint",
      },
    );
    glow(eye, 2.2);
  }

  // Scale studs scattered across the armored torso and necks.
  const bodySurface = b.surface(body);
  const studs = bodySurface.scatter(38, {
    rng: rng(41),
    minDist: 0.11,
    filter: (h) => h.n.y > -0.25,
  });
  for (const hit of studs) {
    b.stick(
      new THREE.ConeGeometry(0.045, 0.075, 6),
      SCALE_HI,
      hit,
      { embed: 0.35, name: "scale-stud" },
    );
  }

  for (const neck of necks) {
    b.sweep(neck, (t) => 0.15 - 0.035 * t, {
      color: spots(coat, SCALE_HI, {
        size: 0.13,
        amount: 0.32,
        rosette: true,
        seed: 90 + neck.joints.length,
      }),
      section: { ngon: 7 },
    });
    b.along(neck, 5, (at) =>
      b.spike(at, at, 0.1, 0.028, { color: ARMOR }),
    );
  }

  // Small shoulder plates make the silhouette read as a war-beast rather than a snake.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.28, 0.02],
        [0.22, 0.18],
        [0.06, 0.3],
        [0, 0.18],
      ],
      {
        at: [s * 0.35, 1.0, 0.38],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.012,
        color: armorPaint,
        bone: spine.tip!,
        name: `shoulder-plate-${s}`,
      },
    );
  }

  return b.root;
}
