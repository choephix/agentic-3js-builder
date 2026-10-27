```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "agentic-3js-builder";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description: "A charming child hiding inside a handmade cardboard robot costume, covered in taped seams, buttons, panels, antennae and chunky boxy limbs.",
};

export default function build() {
  const b = createBuilder({ name: "cardboard-box-robot-kid", detail: 1 });

  const CARDBOARD = "#b9793e";
  const CARDBOARD_LIGHT = "#d79b5b";
  const CARDBOARD_DARK = "#754522";
  const EDGE = "#4c2b1a";
  const TAPE = "#e7bd70";
  const TAPE_DARK = "#b9813c";
  const INK = "#241813";
  const SCREEN = "#274b4c";
  const SCREEN_LIGHT = "#75c4a7";
  const RED = "#d84a32";
  const YELLOW = "#f0bd3d";
  const BLUE = "#3d7eaf";
  const WHITE = "#f3dfae";
  const SKIN = "#e9ad83";
  const SHOE = "#35251f";

  const box = (w: number, h: number, d: number) =>
    new THREE.BoxGeometry(w, h, d);

  const cyl = (r: number, h: number, sides = 8) =>
    new THREE.CylinderGeometry(r, r, h, sides);

  const sphere = (r: number, ws = 8, hs = 6) =>
    new THREE.SphereGeometry(r, ws, hs);

  const root = b.joint("hips", {
    at: [0, 0.84, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.84, 0],
      [0, 1.12, 0],
      [0, 1.43, 0],
      [0, 1.66, 0],
    ]),
    {
      parent: root,
      names: ["pelvis", "chest", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.8, 0],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.7, 0.18],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });

  const leftLegPts = limb(
    [0.18, 0.79, 0],
    [0.22, 0.18, 0.12],
    [0.27, 0.27],
    [[0, 0, 1]],
  );
  const rightLegPts = limb(
    [-0.18, 0.79, 0],
    [-0.22, 0.18, 0.12],
    [0.27, 0.27],
    [[0, 0, 1]],
  );

  const legL = b.chain("legL", leftLegPts, {
    parent: root,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.22, 0, 0.12],
  });
  const legR = b.chain("legR", rightLegPts, {
    parent: root,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.22, 0, 0.12],
  });

  const armL = b.chain(
    "armL",
    catmull([
      [0.42, 1.48, 0],
      [0.65, 1.34, 0],
      [0.77, 1.08, 0.03],
      [0.78, 0.82, 0.15],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
    },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.42, 1.48, 0],
      [-0.65, 1.34, 0],
      [-0.77, 1.08, 0.03],
      [-0.78, 0.82, 0.15],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
    },
  );

  const torso = b.part(box(0.78, 0.72, 0.48), CARDBOARD, {
    bone: spine.joints[1],
    at: [0, 1.28, 0],
    name: "large_torso_box",
    group: "cardboard",
  });
  b.part(box(0.68, 0.16, 0.5), CARDBOARD_LIGHT, {
    bone: root,
    at: [0, 0.9, 0],
    name: "lower_box_flap",
    group: "cardboard",
  });

  b.part(box(0.64, 0.52, 0.56), CARDBOARD_LIGHT, {
    bone: head,
    at: [0, 1.78, 0.02],
    name: "helmet_box",
    group: "cardboard",
  });
  b.part(box(0.72, 0.09, 0.6), CARDBOARD_DARK, {
    bone: head,
    at: [0, 2.07, 0.02],
    name: "helmet_top_flap",
    group: "cardboard",
  });
  b.part(box(0.7, 0.07, 0.58), TAPE, {
    bone: head,
    at: [0, 1.53, 0.02],
    name: "helmet_bottom_tape",
    group: "tape",
  });

  // Box corners and folded seams.
  for (const x of [-0.39, 0.39]) {
    b.part(box(0.025, 0.72, 0.025), EDGE, {
      bone: spine.joints[1],
      at: [x, 1.28, 0.245],
      name: `torso_front_corner_${x}`,
    });
    b.part(box(0.025, 0.7, 0.025), TAPE, {
      bone: spine.joints[1],
      at: [x, 1.28, -0.245],
      name: `torso_back_tape_${x}`,
    });
  }
  b.part(box(0.035, 0.72, 0.035), TAPE_DARK, {
    bone: spine.joints[1],
    at: [0, 1.28, 0.248],
    name: "torso_center_fold",
  });
  b.part(box(0.8, 0.035, 0.035), TAPE, {
    bone: spine.joints[1],
    at: [0, 1.62, 0.25],
    name: "shoulder_fold",
  });

  // Chest control panel.
  b.part(box(0.44, 0.29, 0.025), EDGE, {
    bone: spine.joints[1],
    at: [0, 1.34, 0.255],
    name: "chest_panel_outline",
  });
  b.part(box(0.39, 0.24, 0.03), CARDBOARD_DARK, {
    bone: spine.joints[1],
    at: [0, 1.34, 0.272],
    name: "chest_panel",
  });
  b.part(box(0.22, 0.08, 0.018), SCREEN, {
    bone: spine.joints[1],
    at: [0, 1.405, 0.292],
    name: "chest_display",
  });
  b.part(box(0.15, 0.018, 0.012), SCREEN_LIGHT, {
    bone: spine.joints[1],
    at: [0, 1.406, 0.305],
    name: "display_glow",
  });

  const buttonPositions: [number, string][] = [
    [-0.135, RED],
    [-0.045, YELLOW],
    [0.045, BLUE],
    [0.135, WHITE],
  ];
  for (const [x, color] of buttonPositions) {
    b.part(cyl(0.027, 0.018, 8), color, {
      bone: spine.joints[1],
      at: [x, 1.285, 0.292],
      dir: [0, 0, 1],
      name: `chest_button_${x}`,
    });
  }

  // Face: dark visor, glowing eyes, cheek bolts and a friendly mouth grille.
  b.part(box(0.5, 0.24, 0.026), EDGE, {
    bone: head,
    at: [0, 1.83, 0.315],
    name: "visor_outline",
  });
  b.part(box(0.44, 0.18, 0.03), SCREEN, {
    bone: head,
    at: [0, 1.83, 0.335],
    name: "dark_robot_visor",
  });

  for (const x of [-0.13, 0.13]) {
    b.part(sphere(0.052, 8, 6), SCREEN_LIGHT, {
      bone: head,
      at: [x, 1.855, 0.365],
      name: `glowing_eye_${x}`,
    });
    b.part(sphere(0.018, 6, 4), WHITE, {
      bone: head,
      at: [x - 0.018, 1.875, 0.405],
      name: `eye_highlight_${x}`,
    });
  }

  b.part(box(0.23, 0.035, 0.025), INK, {
    bone: jaw,
    at: [0, 1.69, 0.32],
    name: "smiling_mouth",
  });
  for (const x of [-0.075, 0, 0.075]) {
    b.part(box(0.018, 0.055, 0.03), TAPE, {
      bone: jaw,
      at: [x, 1.69, 0.34],
      name: `mouth_grille_${x}`,
    });
  }

  for (const x of [-0.28, 0.28]) {
    b.part(cyl(0.025, 0.025, 8), TAPE, {
      bone: head,
      at: [x, 1.7, 0.31],
      dir: [0, 0, 1],
      name: `cheek_bolt_${x}`,
    });
    b.part(box(0.035, 0.11, 0.04), CARDBOARD_DARK, {
      bone: head,
      at: [x, 1.94, 0.03],
      name: `helmet_side_tab_${x}`,
    });
  }

  // Antenna and lightning-shaped topper.
  const antennaBase = [0, 2.1, 0.02] as [number, number, number];
  b.rod(antennaBase, [0, 2.29, 0.02], 0.018, {
    color: EDGE,
    bone: head,
    name: "antenna_stem",
  });
  b.part(sphere(0.055, 8, 6), RED, {
    bone: head,
    at: [0, 2.33, 0.02],
    name: "antenna_lamp",
  });
  b.part(
    b.extrude(
      [
        [-0.07, 0],
        [0.015, 0],
        [-0.018, 0.11],
        [0.075, 0.11],
        [-0.025, 0.27],
        [-0.12, 0.27],
        [-0.06, 0.15],
        [-0.13, 0.15],
      ],
      {
        at: [0, 2.09, 0.31],
        x: [1, 0, 0],
        thickness: 0.025,
        color: TAPE,
        bone: head,
        name: "forehead_lightning_badge",
      },
    ).mesh.geometry,
    TAPE,
    { bone: head, at: [0, 0, 0], name: "forehead_badge_mount" },
  );

  // Legs: cardboard boots over visible sneakers.
  for (const [side, chain] of [
    ["L", legL],
    ["R", legR],
  ] as const) {
    const s = side === "L" ? 1 : -1;
    b.frustumBox(
      chain.at(0).at,
      chain.at(0.58).at,
      [0.18, 0.2],
      [0.15, 0.17],
      { color: CARDBOARD, bone: chain.joints[0], name: `cardboard_thigh_${side}` },
    );
    b.frustumBox(
      chain.at(0.56).at,
      chain.at(1).at,
      [0.15, 0.17],
      [0.13, 0.14],
      { color: CARDBOARD_LIGHT, bone: chain.joints[1], name: `cardboard_shin_${side}` },
    );
    b.part(box(0.25, 0.14, 0.36), SHOE, {
      bone: chain.tip,
      at: [s * 0.22, 0.11, 0.14],
      name: `sneaker_${side}`,
    });
    b.part(box(0.27, 0.035, 0.38), WHITE, {
      bone: chain.tip,
      at: [s * 0.22, 0.19, 0.15],
      name: `sneaker_sole_${side}`,
    });
    b.part(box(0.18, 0.018, 0.012), RED, {
      bone: chain.tip,
      at: [s * 0.22, 0.2, 0.34],
      name: `shoe_stripe_${side}`,
    });
    b.part(cyl(0.035, 0.025, 8), TAPE, {
      bone: chain.joints[1],
      at: [s * 0.22, 0.48, 0.12],
      dir: [0, 0, 1],
      name: `knee_rivet_${side}`,
    });
  }

  // Arms with box sleeves, elbows, mitts and cardboard fingers.
  for (const [side, chain] of [
    ["L", armL],
    ["R", armR],
  ] as const) {
    const s = side === "L" ? 1 : -1;
    b.frustumBox(
      chain.at(0).at,
      chain.at(0.48).at,
      [0.16, 0.19],
      [0.13, 0.16],
      { color: CARDBOARD, bone: chain.joints[0], name: `upper_box_arm_${side}` },
    );
    b.part(sphere(0.105, 8, 6), TAPE_DARK, {
      bone: chain.joints[1],
      at: chain.at(0.5).at,
      name: `elbow_${side}`,
    });
    b.frustumBox(
      chain.at(0.5).at,
      chain.at(1).at,
      [0.13, 0.16],
      [0.105, 0.12],
      { color: CARDBOARD_LIGHT, bone: chain.joints[2], name: `forearm_box_${side}` },
    );
    b.part(box(0.18, 0.18, 0.2), CARDBOARD_DARK, {
      bone: chain.tip,
      at: chain.at(1).at,
      name: `robot_mitt_${side}`,
    });
    for (let i = 0; i < 3; i++) {
      b.part(box(0.045, 0.12, 0.055), TAPE, {
        bone: chain.tip,
        at: [s * (0.72 + i * 0.05), 0.78 - i * 0.012, 0.22],
        name: `square_finger_${side}_${i}`,
      });
    }
    b.part(cyl(0.032, 0.022, 8), RED, {
      bone: chain.joints[2],
      at: [s * 0.76, 1.09, 0.1],
      dir: [0, 0, 1],
      name: `arm_warning_light_${side}`,
    });
  }

  // Shoulder straps and repeated tape bands.
  for (const s of [1, -1]) {
    b.part(box(0.12, 0.58, 0.035), TAPE, {
      bone: spine.joints[1],
      at: [s * 0.25, 1.29, 0.27],
      name: `front_vertical_tape_${s}`,
    });
    b.part(box(0.18, 0.04, 0.52), TAPE, {
      bone: spine.joints[1],
      at: [s * 0.29, 1.57, 0],
      name: `shoulder_strap_${s}`,
    });
    b.part(box(0.19, 0.035, 0.3), EDGE, {
      bone: spine.joints[1],
      at: [s * 0.31, 1.02, 0.25],
      name: `waist_label_${s}`,
    });
  }

  // Handmade warning labels and tiny rivets.
  b.part(box(0.16, 0.09, 0.012), YELLOW, {
    bone: spine.joints[1],
    at: [0.23, 1.12, 0.274],
    name: "warning_label_left",
  });
  b.part(box(0.16, 0.09, 0.012), YELLOW, {
    bone: spine.joints[1],
    at: [-0.23, 1.12, 0.274],
    name: "warning_label_right",
  });
  for (const x of [-0.34, 0.34]) {
    for (const y of [1.48, 1.1]) {
      b.part(sphere(0.018, 6, 4), EDGE, {
        bone: spine.joints[1],
        at: [x, y, 0.27],
        name: `torso_rivet_${x}_${y}`,
      });
    }
  }

  // A loose cardboard flap at the back makes the costume read as handmade.
  b.extrude(
    [
      [-0.32, 0],
      [0.32, 0],
      [0.27, 0.3],
      [-0.27, 0.3],
    ],
    {
      at: [0, 1.0, -0.27],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      color: CARDBOARD_LIGHT,
      bone: root,
      name: "back_open_flap",
    },
  );

  return b.root;
}
```