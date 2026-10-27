import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "../../../../src/index";
import { cel, furEdge, INK, animeEye } from "../../../../kits/toon";

export const meta = {
  name: "Five-Headed Hydra",
  description: "A brutal, low-poly God of War inspired five-headed hydra with armored scales, raised necks, jaws, horns, eyes, claws, and a heavy reptilian body.",
};

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  const COAT = cel(
    furEdge("#364a35", "#151b19", {
      level: -0.08,
      teeth: 0.18,
      period: 0.17,
      along: [0, 0, 1],
      ink: "#101514",
      inkWidth: 0.025,
    }),
  );
  const NECK = cel("#526345", "#1d2823");
  const BELLY = cel("#a48b63", "#4e4031");
  const HORN = cel("#d0c39e", "#625b4d");
  const CLAW = cel("#d9c99b", "#655942");
  const MOUTH = "#170e10";
  const GUM = "#7c3030";
  const EYE_WHITE = "#f5dfb7";
  const IRIS = "#d78b25";
  const PUPIL = "#120d0d";
  const SCAR = "#6e2724";
  const METAL = "#4f4639";
  const EYE_TEX = animeEye({ iris: "#d78b25", blush: false, brow: false, size: 256 });

  const root = b.joint("hips", {
    at: [0, 0.72, -0.12],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.03, 0.72, -0.72],
      [0, 0.76, -0.32],
      [0, 0.78, 0.08],
      [0, 0.83, 0.35],
    ]),
    { parent: root, names: ["pelvis", "spineMid", "shoulders", "chest"], role: "spine" },
  );
  const body = b.sweep(spine, (t) => 0.28 + 0.05 * Math.sin(t * Math.PI), {
    color: COAT,
    sides: 8,
    section: "circle",
    caps: "round",
  });
  b.sweep(spine.path, (t) => 0.18 + 0.025 * Math.sin(t * Math.PI), {
    bone: spine,
    color: BELLY,
    sectors: [[112, 248, BELLY]],
    sides: 8,
    caps: "round",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.77, -0.58],
      [0, 0.7, -0.95],
      [0.02, 0.57, -1.3],
      [0.1, 0.45, -1.62],
      [0.17, 0.42, -1.88],
    ]),
    { parent: root, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );
  const tailTube = b.sweep(tail, (t) => 0.22 * (1 - t) + 0.035, {
    color: COAT,
    sides: 7,
    caps: "round",
  });
  b.along(tailTube, 7, (p) => b.spike(p, p, 0.10, 0.035, { color: HORN }));

  const footPositions = [
    [-0.24, 0.16, 0.16],
    [0.24, 0.16, 0.16],
    [-0.27, 0.15, -0.42],
    [0.27, 0.15, -0.42],
  ] as const;

  for (const [side, x] of [
    ["L", -0.22],
    ["R", 0.22],
  ] as const) {
    for (const front of [true, false]) {
      const hip = [x, front ? 0.78 : 0.7, front ? 0.2 : -0.38] as [number, number, number];
      const foot = front
        ? ([x * 1.12, 0.16, 0.2] as [number, number, number])
        : ([x * 1.18, 0.15, -0.45] as [number, number, number]);
      const pts = limb(hip, foot, [0.28, 0.3, 0.22], [
        [0, 0, front ? 1 : -1],
        [0, 0, front ? -1 : 1],
      ]);
      const leg = b.chain(`${front ? "front" : "hind"}Leg${side}`, pts, {
        parent: root,
        names: [
          `${front ? "shoulder" : "hip"}${side}`,
          `${front ? "elbow" : "knee"}${side}`,
          `${front ? "wrist" : "hock"}${side}`,
          `${front ? "paw" : "ankle"}${side}`,
        ],
        role: "leg",
        contact: foot,
      });
      b.sweep(leg, [0.105, 0.075], { color: COAT, sides: 7, caps: "round" });
      b.part(new THREE.SphereGeometry(0.115, 8, 5), COAT, {
        bone: leg.tip,
        at: foot,
        scale: [1.15, 0.55, 1.35],
      });
      for (let i = -1; i <= 1; i++) {
        const toe = [foot[0] + i * 0.055, 0.12, foot[2] + 0.095] as [number, number, number];
        b.spike(toe, [0, -0.05, 1], 0.15, 0.027, { color: CLAW, caps: "point" });
      }
    }
  }

  const headXs = [-0.52, -0.26, 0, 0.26, 0.52];
  const headZs = [0.37, 0.47, 0.53, 0.47, 0.37];
  const headYs = [1.48, 1.63, 1.7, 1.63, 1.48];

  for (let i = 0; i < 5; i++) {
    const x = headXs[i];
    const hz = headZs[i];
    const hy = headYs[i];
    const neckRoot = [x * 0.72, 0.82, 0.29] as [number, number, number];
    const neckTip = [x, hy - 0.16, hz - 0.1] as [number, number, number];

    const neck = b.chain(
      `neck${i + 1}`,
      catmull([
        neckRoot,
        [x * 0.9, 1.02, 0.31],
        [x * 1.02, 1.25, 0.36],
        neckTip,
      ]),
      {
        parent: root,
        names: [`neck${i + 1}Base`, `neck${i + 1}Mid`, `neck${i + 1}Tip`],
        role: "neck",
      },
    );
    const neckTube = b.sweep(neck, (t) => 0.16 - t * 0.035, {
      color: NECK,
      sides: 8,
      caps: "round",
    });
    b.sweep(neck.path, (t) => 0.105 - t * 0.02, {
      bone: neck,
      color: BELLY,
      sectors: [[110, 250, BELLY]],
      sides: 7,
      caps: "round",
    });
    b.along(neckTube, 4, (p, j) =>
      b.spike(p, p, 0.10 + (j % 2) * 0.025, 0.028, { color: HORN, caps: "point" }),
    );

    const skull = b.joint(`head${i + 1}`, {
      parent: neck.tip,
      at: [x, hy, hz],
      dir: [0, -0.02, 1],
      role: "head",
      group: "heads",
    });
    const skullPart = b.part(new THREE.SphereGeometry(1, 12, 8), COAT, {
      bone: skull,
      at: [x, hy, hz],
      scale: [0.235, 0.245, 0.34],
      flat: true,
      name: `skull${i + 1}`,
    });

    // Broad cheek and brow masses give each head a savage, readable silhouette.
    for (const s of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.12, 8, 5), COAT, {
        bone: skull,
        at: [x + s * 0.16, hy - 0.06, hz + 0.13],
        scale: [0.8, 0.9, 1.35],
      });
      b.part(new THREE.SphereGeometry(0.06, 7, 5), HORN, {
        bone: skull,
        at: [x + s * 0.105, hy + 0.19, hz + 0.12],
        scale: [0.55, 0.45, 1],
      });
    }

    // Eyes are oversized and set far apart, with glowing-looking amber irises.
    for (const s of [-1, 1]) {
      const eye = b.part(new THREE.SphereGeometry(0.052, 10, 6), EYE_WHITE, {
        bone: skull,
        at: [x + s * 0.105, hy + 0.055, hz + 0.285],
        scale: [1, 0.85, 0.65],
        name: `eye${i + 1}${s > 0 ? "L" : "R"}`,
      });
      b.part(new THREE.SphereGeometry(0.033, 8, 5), IRIS, {
        bone: skull,
        at: [x + s * 0.105, hy + 0.055, hz + 0.33],
        scale: [0.95, 1.15, 0.45],
      });
      b.part(new THREE.SphereGeometry(0.012, 7, 5), PUPIL, {
        bone: skull,
        at: [x + s * 0.105, hy + 0.055, hz + 0.35],
        scale: [0.7, 1.5, 0.35],
      });
      // Heavy angular brow ridge.
      b.rod(
        [x + s * 0.18, hy + 0.125, hz + 0.26],
        [x + s * 0.035, hy + 0.165, hz + 0.31],
        0.026,
        INK,
        { bone: skull },
      );
    }

    // Separate upper and lower jaws, visibly open.
    const upper = b.part(new THREE.SphereGeometry(1, 9, 5), COAT, {
      bone: skull,
      at: [x, hy - 0.02, hz + 0.28],
      scale: [0.17, 0.11, 0.28],
      name: `upperJaw${i + 1}`,
    });
    const jaw = b.joint(`jaw${i + 1}`, {
      parent: skull,
      at: [x, hy - 0.12, hz + 0.3],
      dir: [0, -0.18, 1],
      role: "jaw",
    });
    b.part(new THREE.SphereGeometry(1, 9, 5), COAT, {
      bone: jaw,
      at: [x, hy - 0.18, hz + 0.31],
      scale: [0.16, 0.075, 0.24],
      name: `lowerJaw${i + 1}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), MOUTH, {
      bone: jaw,
      at: [x, hy - 0.1, hz + 0.39],
      scale: [0.125, 0.035, 0.17],
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), GUM, {
      bone: skull,
      at: [x, hy - 0.075, hz + 0.43],
      scale: [0.13, 0.025, 0.16],
    });

    // Upper and lower teeth alternate for a vicious saw-toothed mouth.
    for (const s of [-1, 1]) {
      for (let t = 0; t < 3; t++) {
        const tx = x + s * (0.055 + t * 0.045);
        const tz = hz + 0.46 - t * 0.025;
        b.spike([tx, hy - 0.045, tz], [0, -1, 0], 0.095 - t * 0.012, 0.018, {
          bone: skull,
          color: CLAW,
          caps: "point",
        });
        b.spike([tx, hy - 0.125, tz + 0.015], [0, 1, 0], 0.07 - t * 0.008, 0.015, {
          bone: jaw,
          color: CLAW,
          caps: "point",
        });
      }
    }

    // Paired swept-back crown horns and smaller cheek spikes.
    for (const s of [-1, 1]) {
      b.sweep(
        catmull([
          [x + s * 0.075, hy + 0.16, hz + 0.02],
          [x + s * 0.11, hy + 0.31, hz - 0.02],
          [x + s * 0.15, hy + 0.4, hz - 0.11],
        ]),
        [0.045, 0.006],
        { bone: skull, color: HORN, caps: { start: "round", end: "point" }, sides: 7 },
      );
      b.spike([x + s * 0.19, hy + 0.04, hz + 0.12], [s * 0.6, 0.35, 0.7], 0.12, 0.025, {
        bone: skull,
        color: HORN,
        caps: "point",
      });
    }

    // A few deliberate battle scars distinguish the central heads.
    if (i === 0 || i === 2 || i === 4) {
      b.rod(
        [x - 0.12, hy + 0.02, hz + 0.285],
        [x + 0.08, hy - 0.08, hz + 0.31],
        0.012,
        SCAR,
        { bone: skull },
      );
    }
  }

  // Heavy dorsal armor plates unify the five necks into one iconic silhouette.
  for (let i = 0; i < 9; i++) {
    const z = -0.7 + i * 0.14;
    const y = 0.94 + Math.sin((i / 8) * Math.PI) * 0.07;
    b.part(new THREE.ConeGeometry(0.105 - i * 0.004, 0.2 - i * 0.006, 5), METAL, {
      bone: root,
      at: [0, y + 0.22, z],
      dir: [0, 1, 0],
      name: `dorsalPlate${i}`,
    });
  }

  // Small neck and shoulder scales: sparse, bold, and readable rather than furry noise.
  const scaleGeo = new THREE.ConeGeometry(0.035, 0.045, 5);
  for (let i = 0; i < 18; i++) {
    const s = i % 2 ? 1 : -1;
    const z = -0.2 + (i % 9) * 0.075;
    b.part(scaleGeo, HORN, {
      bone: root,
      at: [s * (0.22 + (i % 3) * 0.025), 0.83 + (i % 5) * 0.045, z],
      dir: [s * 0.55, 0.15, 0.82],
      scale: [1, 0.7, 0.8],
    });
  }

  return b.root;
}
