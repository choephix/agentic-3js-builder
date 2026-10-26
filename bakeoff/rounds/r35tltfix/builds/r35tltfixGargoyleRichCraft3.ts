import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  polyline,
  limb,
  rng,
  mottle,
  countershade,
  paint,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouched gothic stone gargoyle with folded wings, horns, fangs, claws, and a long carved tail on a cathedral ledge.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = mottle("#686b70", "#353940", { size: 0.18, contrast: 1.35, seed: 17 });
  const DARK_STONE = mottle("#45484e", "#24262c", { size: 0.12, contrast: 1.2, seed: 23 });
  const BELLY = countershade(STONE, "#27292f", { level: -0.12, soft: 0.22 });
  const PALE = mottle("#85878a", "#505257", { size: 0.11, seed: 31 });
  const CLAW = "#222329";
  const EYE = "#c99a48";
  const INK = "#17171c";

  // ---------------------------------------------------------------------------
  // Skeleton first: compact crouched spine, jaw hinge, legs, arms, wings, tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.83, -0.02], role: "spine" });

  const spinePath = catmull([
    [0, 0.78, -0.06],
    [0, 0.98, 0.02],
    [0, 1.17, 0.08],
    [0, 1.35, 0.14],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["pelvis", "spineMid", "chest", "neckBase"],
    role: "spine",
  });

  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 1.43, 0.25],
    dir: [0, 0.12, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.37, 0.39],
    dir: [0, -0.05, 1],
    role: "jaw",
    group: "head",
  });

  const legPts = (s: number) =>
    limb(
      [s * 0.22, 0.82, -0.05],
      [s * 0.32, 0.25, 0.17],
      [0.25, 0.28, 0.19],
      [[0, 0, -1], [0, 0, 1]],
      { sole: [0, 1, 0] },
    );
  const legL = b.chain("legL", legPts(1), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.32, 0.18, 0.17],
  });
  const legR = b.chain("legR", legPts(-1), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.32, 0.18, 0.17],
  });

  const armPts = (s: number) =>
    limb(
      [s * 0.29, 1.22, 0.1],
      [s * 0.52, 0.66, 0.34],
      [0.24, 0.24, 0.18],
      [[0, 0, 1], [0, 0, -1]],
    );
  const armL = b.chain("armL", armPts(1), {
    parent: spine.joints[2],
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", armPts(-1), {
    parent: spine.joints[2],
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  const wingL = b.chain(
    "wingL",
    polyline([
      [0.27, 1.25, -0.02],
      [0.62, 1.53, -0.12],
      [0.98, 1.82, -0.18],
      [1.24, 1.64, -0.24],
    ]),
    { parent: spine.joints[2], names: ["wingL", "wingL2", "wingL3", "wingTipL"], role: "wing" },
  );
  const wingR = b.chain(
    "wingR",
    polyline([
      [-0.27, 1.25, -0.02],
      [-0.62, 1.53, -0.12],
      [-0.98, 1.82, -0.18],
      [-1.24, 1.64, -0.24],
    ]),
    { parent: spine.joints[2], names: ["wingR", "wingR2", "wingR3", "wingTipR"], role: "wing" },
  );

  const tailPath = catmull([
    [0, 0.84, -0.2],
    [0, 0.67, -0.55],
    [0.03, 0.48, -0.88],
    [0.12, 0.38, -1.19],
    [0.28, 0.48, -1.43],
    [0.42, 0.7, -1.54],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });

  // ---------------------------------------------------------------------------
  // Major carved masses.
  // ---------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.25 - t * 0.055, {
    color: BELLY,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "heavy-ribcage",
  });

  b.sweep(tail, (t) => 0.14 * (1 - t) + 0.025, {
    color: DARK_STONE,
    section: { ngon: 7 },
    sides: 7,
    caps: "round",
    name: "carved-tail",
  });

  for (const [chain, name] of [[legL, "left"], [legR, "right"]] as const) {
    b.sweep(chain, (t) => (t < 0.55 ? 0.105 : 0.075), {
      color: STONE,
      section: { ngon: 7 },
      sides: 7,
      caps: "round",
      name: `haunch-${name}`,
    });
  }

  for (const [chain, name] of [[armL, "left"], [armR, "right"]] as const) {
    b.sweep(chain, (t) => 0.075 - t * 0.025, {
      color: STONE,
      section: { ngon: 7 },
      sides: 7,
      name: `arm-${name}`,
    });
  }

  // Head and muzzle: broad, squat, unmistakably gargoyle-like.
  b.part(new THREE.SphereGeometry(1, 12, 8), STONE, {
    bone: head,
    at: [0, 1.48, 0.34],
    scale: [0.28, 0.25, 0.28],
    name: "massive-carved-head",
  });
  b.part(new THREE.BoxGeometry(0.27, 0.17, 0.23), PALE, {
    bone: head,
    at: [0, 1.39, 0.56],
    rotation: [0, 0, 0],
    name: "square-muzzle",
  });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), DARK_STONE, {
    bone: head,
    at: [0, 1.38, 0.69],
    scale: [1.25, 0.75, 0.8],
    name: "nose",
  });

  // Open separate jaw with a dark mouth cavity.
  b.part(new THREE.BoxGeometry(0.23, 0.11, 0.28), DARK_STONE, {
    bone: jaw,
    at: [0, 1.31, 0.51],
    name: "lower-jaw",
  });
  b.part(new THREE.BoxGeometry(0.19, 0.035, 0.16), INK, {
    bone: jaw,
    at: [0, 1.365, 0.61],
    name: "mouth-cavity",
  });

  // ---------------------------------------------------------------------------
  // Face details: glowing-looking amber stone eyes, brow slabs, horns and ears.
  // ---------------------------------------------------------------------------

  const eyeTexture = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#17131a"/>
     <circle cx="32" cy="32" r="20" fill="#c99a48"/>
     <ellipse cx="32" cy="34" rx="6" ry="16" fill="#1a1010"/>
     <circle cx="24" cy="22" r="5" fill="#fff1b0"/></svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const eyeAt = [s * 0.115, 1.52, 0.57] as [number, number, number];
    b.part(new THREE.SphereGeometry(0.052, 8, 6), EYE, {
      bone: head,
      at: eyeAt,
      scale: [1, 0.72, 0.45],
      name: `amber-eye-${s > 0 ? "L" : "R"}`,
    });
    b.decal(head, eyeTexture, {
      at: [s * 0.115, 1.52, 0.605],
      dir: [0, 0, 1],
      size: [0.065, 0.065],
      mirror: s > 0,
      lift: 0.002,
      name: `eye-carving-${s > 0 ? "L" : "R"}`,
    });

    b.sweep(
      polyline([
        [s * 0.2, 1.59, 0.52],
        [s * 0.12, 1.62, 0.59],
        [s * 0.03, 1.59, 0.58],
      ]),
      0.025,
      { color: DARK_STONE, caps: "round", name: `stone-brow-${s}` },
    );

    // Horns swept backward from the crown.
    b.sprout(
      `horn${s > 0 ? "L" : "R"}`,
      frame([s * 0.16, 1.62, 0.31], [0, 1, 0]),
      catmull([
        [s * 0.16, 1.62, 0.31],
        [s * 0.22, 1.78, 0.18],
        [s * 0.18, 1.91, -0.02],
        [s * 0.1, 1.98, -0.14],
      ]),
      [0.065, 0.005],
      {
        count: 2,
        color: DARK_STONE,
        caps: { end: "point", start: "round" },
        role: "horn",
        names: [`hornBase${s}`, `hornMid${s}`],
      },
    );

    // Pointed stone ear wedges.
    b.slab(
      [
        [s * 0.19, 1.56, 0.2],
        [s * 0.36, 1.67, 0.12],
        [s * 0.26, 1.46, 0.19],
      ],
      { color: STONE, thickness: 0.045, bone: head, name: `pointed-ear-${s}` },
    );
  }

  // Fangs and small lower teeth.
  for (const s of [1, -1]) {
    b.spike([s * 0.075, 1.35, 0.66], [0, -1, 0.08], 0.105, 0.025, {
      color: PALE,
      bone: jaw,
      name: `fang-${s}`,
    });
    b.spike([s * 0.16, 1.35, 0.64], [0, -1, 0.04], 0.07, 0.018, {
      color: PALE,
      bone: jaw,
      name: `tooth-${s}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Bat-like stone wings with thick fingers, webbing, and scalloped trailing edge.
  // ---------------------------------------------------------------------------

  b.sweep(wingL, (t) => 0.065 - t * 0.045, {
    color: DARK_STONE,
    section: { ngon: 6 },
    sides: 6,
    name: "left-wing-bones",
  });
  b.sweep(wingR, (t) => 0.065 - t * 0.045, {
    color: DARK_STONE,
    section: { ngon: 6 },
    sides: 6,
    name: "right-wing-bones",
  });

  const wingRootL = wingL.at(0);
  const wingRootR = wingR.at(0);
  const wingTipL = wingL.at(1);
  const wingTipR = wingR.at(1);

  b.membrane(
    polyline([
      wingRootL.at,
      [0.54, 1.36, -0.11],
      [0.83, 1.55, -0.16],
      wingTipL.at,
    ]),
    polyline([
      [0.29, 1.09, -0.04],
      [0.55, 1.13, -0.15],
      [0.81, 1.3, -0.21],
      [1.05, 1.48, -0.23],
    ]),
    { color: DARK_STONE, thickness: 0.018, rows: 4, cols: 8, scallop: 0.2, name: "left-wing-web" },
  );
  b.membrane(
    polyline([
      wingRootR.at,
      [-0.54, 1.36, -0.11],
      [-0.83, 1.55, -0.16],
      wingTipR.at,
    ]),
    polyline([
      [-0.29, 1.09, -0.04],
      [-0.55, 1.13, -0.15],
      [-0.81, 1.3, -0.21],
      [-1.05, 1.48, -0.23],
    ]),
    { color: DARK_STONE, thickness: 0.018, rows: 4, cols: 8, scallop: 0.2, name: "right-wing-web" },
  );

  // Wing rib spikes emphasize the carved silhouette.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const p = wingL.at(0.23 + i * 0.2).at;
      b.spike(p, [s * 0.18, 0.14, -0.24], 0.18 - i * 0.025, 0.022, {
        color: PALE,
        name: `wing-rib-${s}-${i}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Feet and hands: chunky palms with separated talons.
  // ---------------------------------------------------------------------------

  for (const [chain, s, label] of [
    [legL, 1, "L"],
    [legR, -1, "R"],
  ] as const) {
    const tip = chain.tip!;
    const foot = tip.at;
    b.part(new THREE.SphereGeometry(0.11, 8, 6), STONE, {
      at: foot,
      bone: chain.tip,
      scale: [1.3, 0.58, 1.45],
      name: `taloned-foot-${label}`,
    });
    for (let i = -1; i <= 1; i++) {
      const x = foot.x + s * i * 0.045;
      b.spike([x, 0.24, foot.z + 0.07], [s * i * 0.25, -0.02, 0.97], 0.13, 0.018, {
        color: CLAW,
        bone: chain.tip,
        name: `foot-claw-${label}-${i}`,
      });
    }
  }

  for (const [chain, s, label] of [
    [armL, 1, "L"],
    [armR, -1, "R"],
  ] as const) {
    const tip = chain.tip!;
    const hand = tip.at;
    b.part(new THREE.SphereGeometry(0.075, 8, 5), STONE, {
      at: hand,
      bone: chain.tip,
      scale: [1.1, 0.7, 1.25],
      name: `clawed-hand-${label}`,
    });
    for (let i = -1; i <= 1; i++) {
      b.spike(
        [hand.x + s * i * 0.035, hand.y - 0.015, hand.z + 0.045],
        [s * i * 0.22, -0.28, 0.93],
        0.1,
        0.014,
        { color: CLAW, bone: chain.tip, name: `hand-claw-${label}-${i}` },
      );
    }
  }

  // Tail tip barb.
  b.spike(tail.tip!.at, [0.35, 0.18, 0.8], 0.22, 0.045, {
    color: PALE,
    bone: tail.tip!,
    name: "tail-barb",
  });

  // ---------------------------------------------------------------------------
  // Carved ledge: simple staging, sized to the crouched silhouette.
  // ---------------------------------------------------------------------------

  b.part(new THREE.BoxGeometry(1.75, 0.18, 1.2), "#37393e", {
    at: [0, 0.09, -0.08],
    name: "cathedral-ledge",
  });
  b.part(new THREE.BoxGeometry(1.95, 0.09, 0.16), "#55585d", {
    at: [0, 0.225, 0.0],
    name: "ledge-front-moulding",
  });
  b.part(new THREE.BoxGeometry(1.5, 0.08, 0.14), "#24262b", {
    at: [0, 0.27, -0.37],
    name: "ledge-shadow-groove",
  });

  // Raised gothic rosettes on the ledge front.
  for (const x of [-0.62, 0, 0.62]) {
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.025, 8), PALE, {
      at: [x, 0.24, 0.075],
      dir: [0, 0, 1],
      name: "ledge-rosette",
    });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6), DARK_STONE, {
      at: [x, 0.24, 0.095],
      dir: [0, 0, 1],
      name: "rosette-center",
    });
  }

  return b.root;
}
