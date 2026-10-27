```ts
import * as THREE from "three";
import { createBuilder, polyline, rng } from "agentic-3js-builder";

export const meta = {
  name: "cardboard-box robot kid",
  description: "A charming child wearing a handmade cardboard robot costume, with corrugated panels, taped seams, a glowing face screen, chunky boots, antennae, and playful controls.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const PAPER = "#b9783f";
  const PAPER_LIGHT = "#d79a58";
  const PAPER_DARK = "#754322";
  const EDGE = "#4b291b";
  const TAPE = "#e5c27d";
  const TAPE_DARK = "#b98b4d";
  const SCREEN = "#172b2d";
  const SCREEN_EDGE = "#30231d";
  const CYAN = "#53e0d5";
  const CYAN_DARK = "#1c8f92";
  const RED = "#dc4c3d";
  const YELLOW = "#f2c44e";
  const WHITE = "#fff1c4";
  const BOOT = "#3e3028";
  const GLOVE = "#9c6038";
  const SHADOW = "#58341f";

  const faceTex = b.root; // keeps the model intentionally entirely builder-owned
  const rand = rng(42);

  // ---------------------------------------------------------------------------------------------
  // Skeleton first: a neutral child-sized humanoid rest pose.

  const hips = b.joint("hips", {
    at: [0, 0.78, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "kid",
  });

  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.78, 0],
      [0, 1.04, 0],
      [0, 1.28, 0],
    ]),
    {
      parent: hips,
      names: ["pelvis", "chest", "shoulder"],
      role: "spine",
      group: "kid",
    },
  );

  const neck = b.joint("neck", {
    parent: spine.tip,
    at: [0, 1.35, 0],
    dir: [0, 1, 0],
    role: "neck",
    group: "kid",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.48, 0.02],
    dir: [0, 0.3, 1],
    role: "head",
    group: "kid",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.39, 0.13],
    dir: [0, 0.2, 1],
    role: "jaw",
    group: "face",
  });

  const legL = b.chain(
    "legL",
    polyline([
      [0.17, 0.78, 0],
      [0.18, 0.47, 0.035],
      [0.18, 0.18, 0.055],
      [0.18, 0.11, 0.11],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      group: "kid",
      contact: [0.18, 0, 0.16],
    },
  );

  const legR = b.chain(
    "legR",
    polyline([
      [-0.17, 0.78, 0],
      [-0.18, 0.47, 0.035],
      [-0.18, 0.18, 0.055],
      [-0.18, 0.11, 0.11],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      group: "kid",
      contact: [-0.18, 0, 0.16],
    },
  );

  const armL = b.chain(
    "armL",
    polyline([
      [0.37, 1.22, 0],
      [0.52, 1.03, 0.01],
      [0.58, 0.78, 0.06],
    ]),
    {
      parent: spine.tip,
      names: ["shoulderL", "elbowL", "handL"],
      role: "arm",
      group: "kid",
    },
  );

  const armR = b.chain(
    "armR",
    polyline([
      [-0.37, 1.22, 0],
      [-0.52, 1.03, 0.01],
      [-0.58, 0.78, 0.06],
    ]),
    {
      parent: spine.tip,
      names: ["shoulderR", "elbowR", "handR"],
      role: "arm",
      group: "kid",
    },
  );

  // ---------------------------------------------------------------------------------------------
  // Small reusable primitive helpers.

  const box = (
    size: [number, number, number],
    color: string,
    at: any,
    bone?: any,
    name?: string,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    return b.part(g, color, {
      at,
      bone,
      name,
      flat: true,
    });
  };

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: any,
    bone?: any,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      bone,
      dir,
      name,
      flat: true,
    });
  };

  const sphere = (radius: number, color: string, at: any, bone?: any, name?: string) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const seam = (
    a: any,
    c: any,
    width: number,
    color = TAPE_DARK,
    bone?: any,
    name?: string,
  ) => b.rod(a, c, width, { color, bone, caps: "flat", name });

  const rivet = (at: any, color = TAPE_DARK, bone?: any, name?: string) =>
    b.part(new THREE.SphereGeometry(0.018, 6, 4), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const panel = (
    at: any,
    size: [number, number, number],
    color = PAPER_LIGHT,
    bone?: any,
    name?: string,
  ) => {
    const p = box(size, color, at, bone, name);
    // A raised cardboard panel has four tiny corner fasteners.
    const x = size[0] * 0.42;
    const y = size[1] * 0.38;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        rivet([at[0] + sx * x, at[1] + sy * y, at[2] + size[2] * 0.53], TAPE_DARK, bone, `${name ?? "panel"}-rivet`);
      }
    }
    return p;
  };

  const button = (at: any, color: string, radius = 0.035, bone?: any, name?: string) => {
    const outer = cyl(radius + 0.012, 0.025, EDGE, at, bone, [0, 0, 1], `${name ?? "button"}-rim`);
    const inner = cyl(radius, 0.028, color, [at[0], at[1], at[2] + 0.014], bone, [0, 0, 1], name);
    return { outer, inner };
  };

  // ---------------------------------------------------------------------------------------------
  // Costume silhouette: oversized torso box, slightly smaller pelvis box, and a proud square head.

  const pelvis = box([0.48, 0.30, 0.34], PAPER, [0, 0.82, 0.0], spine.joints[0], "cardboard-pelvis");
  const pelvisFront = panel([0, 0.84, 0.181], [0.30, 0.19, 0.018], PAPER_LIGHT, spine.joints[0], "pelvis-front");
  seam([-0.20, 0.97, 0.185], [0.20, 0.97, 0.185], 0.012, TAPE, spine.joints[0], "pelvis-top-tape");

  const chest = box([0.70, 0.53, 0.47], PAPER_LIGHT, [0, 1.08, 0.0], spine.joints[1], "large-chest-box");
  const chestFront = panel([0, 1.10, 0.245], [0.47, 0.30, 0.022], PAPER, spine.joints[1], "chest-panel");

  // Corrugation marks across the chest and side panels.
  for (let i = -3; i <= 3; i++) {
    const yy = 0.93 + i * 0.055;
    seam([-0.28, yy, 0.252], [0.28, yy, 0.252], 0.004, PAPER_DARK, spine.joints[1], "chest-corrugation");
  }
  seam([0, 0.82, 0.253], [0, 1.34, 0.253], 0.015, TAPE, spine.joints[1], "vertical-front-tape");
  seam([-0.345, 0.82, 0], [-0.345, 1.34, 0], 0.012, TAPE_DARK, spine.joints[1], "left-edge-tape");
  seam([0.345, 0.82, 0], [0.345, 1.34, 0], 0.012, TAPE_DARK, spine.joints[1], "right-edge-tape");

  // Chest control console.
  box([0.32, 0.16, 0.025], EDGE, [0, 1.12, 0.265], spine.joints[1], "control-console");
  box([0.28, 0.12, 0.014], SCREEN, [0, 1.125, 0.282], spine.joints[1], "control-screen");
  button([-0.105, 1.115, 0.299], RED, 0.034, spine.joints[1], "red-power-button");
  button([0.0, 1.115, 0.299], YELLOW, 0.034, spine.joints[1], "yellow-button");
  button([0.105, 1.115, 0.299], CYAN, 0.034, spine.joints[1], "cyan-button");

  // A hand-drawn robot emblem: concentric square plates and a bolt.
  box([0.13, 0.13, 0.018], EDGE, [0, 0.91, 0.281], spine.joints[1], "emblem-outline");
  box([0.105, 0.105, 0.021], TAPE, [0, 0.91, 0.294], spine.joints[1], "emblem-tape");
  box([0.055, 0.055, 0.024], RED, [0, 0.91, 0.309], spine.joints[1], "emblem-heart");
  rivet([0, 0.91, 0.327], WHITE, spine.joints[1], "emblem-bolt");

  // Side labels and crooked taped patches.
  for (const s of [-1, 1]) {
    panel([s * 0.365, 1.10, 0], [0.018, 0.23, 0.25], PAPER, spine.joints[1], s > 0 ? "left-side-patch" : "right-side-patch");
    seam([s * 0.377, 0.98, -0.11], [s * 0.377, 1.22, -0.11], 0.008, TAPE, spine.joints[1], "side-seam");
  }

  // ---------------------------------------------------------------------------------------------
  // Legs: exposed cardboard tubes with knee caps and big homemade boots.

  b.sweep(legL, (t: number) => 0.085 - t * 0.012, {
    color: PAPER_DARK,
    section: "box",
    sides: 6,
    caps: "round",
    name: "left-cardboard-leg",
  });
  b.sweep(legR, (t: number) => 0.085 - t * 0.012, {
    color: PAPER_DARK,
    section: "box",
    sides: 6,
    caps: "round",
    name: "right-cardboard-leg",
  });

  for (const s of [-1, 1]) {
    const knee = s > 0 ? legL.joints[1].at : legR.joints[1].at;
    const ankle = s > 0 ? legL.joints[2].at : legR.joints[2].at;
    const foot = s > 0 ? legL.tip.at : legR.tip.at;
    box([0.16, 0.14, 0.05], TAPE, [knee.x, knee.y, knee.z + 0.073], s > 0 ? legL.joints[1] : legR.joints[1], "knee-cap");
    seam([knee.x - 0.055, knee.y, knee.z + 0.103], [knee.x + 0.055, knee.y, knee.z + 0.103], 0.006, EDGE, s > 0 ? legL.joints[1] : legR.joints[1], "knee-crease");

    box([0.23, 0.17, 0.36], BOOT, [foot.x, 0.09, 0.10], s > 0 ? legL.tip : legR.tip, "oversized-boot");
    box([0.19, 0.07, 0.025], PAPER_LIGHT, [foot.x, 0.165, 0.285], s > 0 ? legL.tip : legR.tip, "boot-top-card");
    seam([foot.x - 0.095, 0.11, 0.287], [foot.x + 0.095, 0.11, 0.287], 0.009, TAPE, s > 0 ? legL.tip : legR.tip, "boot-toe-tape");
    for (let i = -1; i <= 1; i++) {
      seam(
        [foot.x + i * 0.05, 0.025, 0.285],
        [foot.x + i * 0.05, 0.07, 0.285],
        0.006,
        PAPER_DARK,
        s > 0 ? legL.tip : legR.tip,
        "boot-tread",
      );
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Arms: cardboard sleeves, taped elbows, mitten hands with finger blocks.

  b.sweep(armL, (t: number) => 0.075 - t * 0.01, {
    color: PAPER,
    section: "box",
    sides: 6,
    caps: "round",
    name: "left-cardboard-arm",
  });
  b.sweep(armR, (t: number) => 0.075 - t * 0.01, {
    color: PAPER,
    section: "box",
    sides: 6,
    caps: "round",
    name: "right-cardboard-arm",
  });

  for (const s of [-1, 1]) {
    const arm = s > 0 ? armL : armR;
    const elbow = arm.joints[1].at;
    const hand = arm.tip.at;
    const bone = arm.tip;

    box([0.15, 0.13, 0.055], TAPE, [elbow.x, elbow.y, elbow.z + 0.065], arm.joints[1], "elbow-band");
    seam([elbow.x - 0.045, elbow.y + 0.045, elbow.z + 0.097], [elbow.x + 0.045, elbow.y + 0.045, elbow.z + 0.097], 0.006, EDGE, arm.joints[1], "elbow-mark");

    sphere(0.10, GLOVE, [hand.x, hand.y - 0.02, hand.z + 0.015], bone, "round-mitten");
    box([0.10, 0.12, 0.10], GLOVE, [hand.x, hand.y - 0.085, hand.z + 0.055], bone, "mitten-palm");

    // Three chunky fingers and a thumb, spread just enough to read.
    for (let i = -1; i <= 1; i++) {
      box([0.038, 0.075, 0.055], GLOVE, [hand.x + i * 0.043, hand.y - 0.145, hand.z + 0.06], bone, "mitten-finger");
    }
    box([0.045, 0.075, 0.055], GLOVE, [hand.x + s * 0.09, hand.y - 0.075, hand.z + 0.045], bone, "mitten-thumb");
    seam([hand.x - 0.07, hand.y - 0.045, hand.z + 0.105], [hand.x + 0.07, hand.y - 0.045, hand.z + 0.105], 0.006, TAPE, bone, "glove-tape");
  }

  // ---------------------------------------------------------------------------------------------
  // Helmet/head box. The child is visible only through a dark robot face plate.

  const helmet = box([0.58, 0.47, 0.50], PAPER_LIGHT, [0, 1.57, 0.02], head, "helmet-box");
  box([0.46, 0.29, 0.026], EDGE, [0, 1.55, 0.286], head, "faceplate-rim");
  box([0.415, 0.245, 0.018], SCREEN, [0, 1.55, 0.304], head, "dark-face-screen");

  // Face screen border screws.
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      rivet([sx * 0.215, 1.55 + sy * 0.125, 0.321], TAPE, head, "faceplate-screw");
    }
  }

  // Large expressive square eyes.
  for (const s of [-1, 1]) {
    box([0.095, 0.075, 0.022], CYAN_DARK, [s * 0.105, 1.59, 0.326], head, "eye-shadow");
    box([0.065, 0.050, 0.025], CYAN, [s * 0.105, 1.59, 0.341], head, "glowing-cyan-eye");
    box([0.018, 0.018, 0.028], WHITE, [s * 0.09, 1.607, 0.357], head, "eye-glint");
  }

  // Pixel-like happy mouth made from separate teeth/segments.
  box([0.18, 0.028, 0.022], EDGE, [0, 1.475, 0.327], jaw, "mouth-dark");
  for (let i = -2; i <= 2; i++) {
    box([0.023, 0.035, 0.025], i === 0 ? RED : WHITE, [i * 0.034, 1.475, 0.345], jaw, "mouth-pixel");
  }

  // Side ear flaps: square cardboard ears with tape hinges.
  for (const s of [-1, 1]) {
    box([0.07, 0.22, 0.28], PAPER, [s * 0.335, 1.57, 0.01], head, "helmet-ear-flap");
    box([0.025, 0.19, 0.22], TAPE, [s * 0.376, 1.57, 0.01], head, "ear-flap-tape");
    rivet([s * 0.394, 1.64, 0.01], EDGE, head, "ear-hinge");
    rivet([s * 0.394, 1.50, 0.01], EDGE, head, "ear-hinge");
  }

  // Helmet top flap and taped seam.
  box([0.30, 0.055, 0.40], PAPER, [0, 1.83, -0.01], head, "top-flap");
  seam([-0.20, 1.845, 0.20], [0.20, 1.845, 0.20], 0.011, TAPE, head, "top-flap-tape");

  // ---------------------------------------------------------------------------------------------
  // Antenna and warning beacon. A small handmade prop gives the silhouette a strong robot read.

  const antenna = b.joint("antenna", {
    parent: head,
    at: [0, 1.86, 0],
    dir: [0, 1, 0],
    role: "hinge",
    group: "helmet",
  });

  cyl(0.018, 0.18, EDGE, [0, 1.95, 0], antenna, [0, 1, 0], "antenna-stalk");
  cyl(0.052, 0.075, RED, [0, 2.065, 0], antenna, [0, 1, 0], "warning-beacon");
  cyl(0.034, 0.018, WHITE, [0, 2.11, 0], antenna, [0, 1, 0], "beacon-glint");
  seam([-0.04, 2.035, 0.035], [0.04, 2.035, 0.035], 0.006, TAPE, antenna, "beacon-band");

  // Two little exhaust fins behind the head.
  for (const s of [-1, 1]) {
    box([0.075, 0.20, 0.035], PAPER_DARK, [s * 0.245, 1.61, -0.27], head, "rear-helmet-fin");
    box([0.045, 0.12, 0.018], TAPE, [s * 0.245, 1.61, -0.294], head, "rear-fin-tape");
  }

  // ---------------------------------------------------------------------------------------------
  // Extra cardboard craft details: labels, corner guards, staples, and a dangling cable.

  // Chest corner guards.
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      box([0.055, 0.055, 0.025], TAPE, [sx * 0.315, 1.08 + sy * 0.215, 0.27], spine.joints[1], "chest-corner-guard");
    }
  }

  // Handmade serial-number tiles.
  const labelLetters = [
    [0.18, RED],
    [0.12, YELLOW],
    [0.06, CYAN],
    [0.0, WHITE],
    [-0.06, RED],
    [-0.12, YELLOW],
    [-0.18, CYAN],
  ] as const;
  for (const [x, color] of labelLetters) {
    box([0.035, 0.035, 0.012], color, [x, 0.71, 0.182], spine.joints[0], "serial-tile");
  }

  // A short flexible wire from the console toward the right hip.
  b.sweep(
    polyline([
      [0.16, 1.04, 0.30],
      [0.24, 0.96, 0.31],
      [0.28, 0.83, 0.22],
    ]),
    0.009,
    {
      color: EDGE,
      caps: "round",
      name: "loose-control-wire",
    },
  );
  sphere(0.022, RED, [0.28, 0.83, 0.22], spine.joints[0], "wire-end");

  // Paper tabs sticking from the lower back, visible in silhouette.
  for (const s of [-1, 1]) {
    box([0.10, 0.17, 0.025], PAPER_LIGHT, [s * 0.20, 0.87, -0.265], spine.joints[0], "back-tab");
    seam([s * 0.20 - 0.035, 0.87, -0.281], [s * 0.20 + 0.035, 0.87, -0.281], 0.006, TAPE, spine.joints[0], "back-tab-tape");
  }

  // A few deliberate, oversized cardboard "staples" make the construction legible.
  const staplePoints: [number, number, number][] = [
    [-0.27, 1.30, 0.265],
    [0.27, 1.30, 0.265],
    [-0.27, 0.86, 0.265],
    [0.27, 0.86, 0.265],
    [-0.22, 1.78, 0.268],
    [0.22, 1.78, 0.268],
  ];
  for (const p of staplePoints) {
    cyl(0.011, 0.018, EDGE, [p[0], p[1], p[2] + 0.01], undefined, [0, 0, 1], "cardboard-staple");
  }

  // Floor contact is guaranteed by the boot geometry at y ~= 0.005.
  return b.root;
}
```