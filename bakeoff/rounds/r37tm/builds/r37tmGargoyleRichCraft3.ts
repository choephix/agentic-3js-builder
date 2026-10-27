import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  rng,
  mottle,
  countershade,
  scales,
  paint,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle with spread bat wings, hooked claws, fangs, a curled tail, and carved cathedral details.",
};

const STONE_DARK = "#36343d";
const STONE = "#686872";
const STONE_LIGHT = "#96939a";
const STONE_EDGE = "#b9b0ad";
const MORTAR = "#25232c";
const EYE_GLOW = "#e8a34d";
const IRON = "#17151c";
const GOLD = "#b88a45";

const stone = countershade(
  mottle("#5f6069", "#77777e", { size: 0.22, contrast: 1.35, seed: 17 }),
  "#3b3a43",
  { level: -0.12, soft: 0.3 },
);

const carvedStone = scales(
  [STONE, STONE_LIGHT, "#555660"],
  "#393842",
  { size: 0.16, width: 0.11, seed: 9 },
);

const bellyStone = furEdge(stone, "#9c9997", {
  axis: [0, 1, 0],
  by: "normal",
  level: -0.12,
  teeth: 0.16,
  period: 0.045,
  along: [0, 0, 1],
  ink: "#35343b",
  inkWidth: 0.035,
});

const EYE = animeEye({
  iris: "#d88931",
  irisLight: "#ffd675",
  irisDark: "#4d2014",
  ink: "#17131b",
  blush: false,
  brow: false,
  size: 256,
});

const SIGIL = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="55" fill="none" stroke="#d9c38f" stroke-width="5"/>
    <path d="M64 15 L76 51 L111 64 L76 77 L64 113 L52 77 L17 64 L52 51 Z"
      fill="none" stroke="#d9c38f" stroke-width="6"/>
    <path d="M64 32 L64 96 M32 64 L96 64" stroke="#8d5a38" stroke-width="4"/>
    <circle cx="64" cy="64" r="8" fill="#d9c38f"/>
  </svg>`,
  { size: 256 },
);

const CRACK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M31 0 L28 17 L35 25 L25 35 L29 48 L18 64
             M29 17 L13 25 M35 25 L51 19 M25 35 L7 42 M29 48 L46 55"
      fill="none" stroke="#211f27" stroke-width="3" stroke-linecap="square"/>
  </svg>`,
  { size: 128 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: THREE.Vector3 | [number, number, number],
  color: any,
  opts: any = {},
) {
  return b.part(new THREE.BoxGeometry(...size), color, { at, flat: true, ...opts });
}

function claw(
  b: ReturnType<typeof createBuilder>,
  root: any,
  tip: THREE.Vector3,
  color = STONE_LIGHT,
  name = "claw",
) {
  const d = tip.clone().sub(root.at).normalize();
  return b.spike(root, d, root.at.distanceTo(tip), 0.032, {
    color,
    caps: { start: "round", end: "point" },
    name,
  });
}

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: a compact crouching quadrupedal gargoyle.

  const hips = b.joint("hips", {
    at: [0, 0.94, -0.08],
    dir: [0, 0.1, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.94, -0.1],
      [0, 1.12, 0.08],
      [0, 1.34, 0.28],
      [0, 1.47, 0.46],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "shoulders", "chest"],
      role: "spine",
      count: 4,
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.46, 0.43],
      [0, 1.61, 0.56],
      [0, 1.73, 0.67],
    ]),
    {
      parent: spine.tip,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
      count: 3,
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: neck.tip.at,
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.12, down: 0.055 }),
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.94, -0.17],
      [0, 0.84, -0.48],
      [0, 0.70, -0.83],
      [0.06, 0.66, -1.14],
      [0.22, 0.76, -1.37],
      [0.34, 0.92, -1.45],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
      count: 5,
    },
  );

  const rearLegs: any[] = [];
  const frontLegs: any[] = [];

  for (const side of [1, -1]) {
    const s = side;

    const rear = b.chain(
      `legH${s > 0 ? "L" : "R"}`,
      [
        [s * 0.22, 0.94, -0.12],
        [s * 0.36, 0.67, -0.27],
        [s * 0.39, 0.37, -0.03],
        [s * 0.42, 0.27, 0.20],
      ],
      {
        parent: hips,
        names: [s > 0 ? "hipL" : "hipR", s > 0 ? "kneeL" : "kneeR", s > 0 ? "hockL" : "hockR", s > 0 ? "ankleL" : "ankleR"],
        role: "leg",
        contact: [s * 0.42, 0.02, 0.20],
      },
    );
    rearLegs.push(rear);

    const front = b.chain(
      `arm${s > 0 ? "L" : "R"}`,
      [
        [s * 0.29, 1.38, 0.36],
        [s * 0.44, 1.02, 0.50],
        [s * 0.49, 0.54, 0.43],
        [s * 0.50, 0.25, 0.30],
      ],
      {
        parent: spine.tip,
        names: [s > 0 ? "shoulderL" : "shoulderR", s > 0 ? "elbowL" : "elbowR", s > 0 ? "wristL" : "wristR", s > 0 ? "handL" : "handR"],
        role: "arm",
        contact: [s * 0.50, 0.02, 0.30],
      },
    );
    frontLegs.push(front);
  }

  // Broad, raised bat wings. Each is a chain along the leading edge and a matching
  // trailing edge, allowing a real stretched membrane.
  const wingLeading: any[] = [];
  const wingTrailing: any[] = [];

  for (const side of [1, -1]) {
    const s = side;
    const lead = b.chain(
      `wingLead${s > 0 ? "L" : "R"}`,
      [
        [s * 0.27, 1.43, 0.28],
        [s * 0.60, 1.74, 0.12],
        [s * 0.92, 2.04, -0.02],
        [s * 1.17, 2.18, 0.12],
        [s * 1.28, 2.02, 0.43],
      ],
      {
        parent: spine.tip,
        names: [s > 0 ? "wingRootL" : "wingRootR", s > 0 ? "wingElbowL" : "wingElbowR", s > 0 ? "wingOuterL" : "wingOuterR", s > 0 ? "wingTipL" : "wingTipR"],
        role: "wing",
        count: 4,
      },
    );
    const trail = b.chain(
      `wingTrail${s > 0 ? "L" : "R"}`,
      [
        [s * 0.29, 1.40, 0.26],
        [s * 0.56, 1.55, -0.19],
        [s * 0.84, 1.63, -0.53],
        [s * 1.02, 1.72, -0.82],
        [s * 1.28, 2.02, 0.43],
      ],
      {
        parent: spine.tip,
        names: [s > 0 ? "wingWebL" : "wingWebR", s > 0 ? "wingLowerL" : "wingLowerR", s > 0 ? "wingScallopL" : "wingScallopR", s > 0 ? "wingEdgeL" : "wingEdgeR"],
        role: "wing",
        count: 4,
      },
    );
    wingLeading.push(lead);
    wingTrailing.push(trail);
  }

  // ---------------------------------------------------------------------------
  // Ledge / architectural staging.

  box(b, [1.72, 0.16, 1.15], [0, 0.08, 0.03], carvedStone, { name: "ledge_cap", group: "architecture" });
  box(b, [1.45, 0.42, 0.86], [0, -0.17, -0.10], stone, { name: "ledge_corbel", group: "architecture" });
  box(b, [0.62, 0.48, 0.38], [-0.59, 0.08, -0.23], stone, { name: "left_corbel", group: "architecture" });
  box(b, [0.62, 0.48, 0.38], [0.59, 0.08, -0.23], stone, { name: "right_corbel", group: "architecture" });

  for (const x of [-0.72, -0.36, 0, 0.36, 0.72]) {
    b.part(
      new THREE.BoxGeometry(0.025, 0.09, 0.78),
      MORTAR,
      { at: [x, 0.18, -0.01], name: "ledge_joint", group: "architecture" },
    );
  }

  // ---------------------------------------------------------------------------
  // Main carved body and limbs.

  b.sweep(spine, (t) => 0.26 - t * 0.045, {
    color: bellyStone,
    section: "box",
    sides: 8,
    caps: "round",
    name: "ribbed_torso",
    group: "body",
  });

  b.sweep(neck, [0.22, 0.16], {
    color: stone,
    section: "box",
    caps: "round",
    name: "carved_neck",
    group: "body",
  });

  b.sweep(tail, (t) => 0.15 * (1 - t) + 0.035, {
    color: stone,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    bands: [[0.74, STONE_LIGHT], [0.91, carvedStone]],
    name: "curling_tail",
    group: "tail",
  });

  for (const leg of rearLegs) {
    b.sweep(leg, [0.13, 0.105], {
      color: stone,
      section: "box",
      caps: "round",
      name: "hind_leg",
      group: "limbs",
    });
    const foot = leg.tip;
    b.part(new THREE.BoxGeometry(0.22, 0.12, 0.30), carvedStone, {
      bone: foot,
      at: foot.at,
      dir: [0, 0, 1],
      name: "rear_foot",
      group: "limbs",
    });
  }

  for (const arm of frontLegs) {
    b.sweep(arm, [0.105, 0.075], {
      color: stone,
      section: "box",
      caps: "round",
      name: "forelimb",
      group: "limbs",
    });
    const hand = arm.tip;
    b.part(new THREE.BoxGeometry(0.17, 0.105, 0.24), carvedStone, {
      bone: hand,
      at: hand.at,
      dir: [0, 0, 1],
      name: "front_paw",
      group: "limbs",
    });
  }

  // Toes and hooked fingers, deliberately oversized for a readable silhouette.
  for (let si = 0; si < 2; si++) {
    const s = si === 0 ? 1 : -1;
    const rear = rearLegs[si].tip;
    const hand = frontLegs[si].tip;

    for (let i = -1; i <= 1; i++) {
      const rearTip = new THREE.Vector3(s * (0.42 + i * 0.065), 0.12, 0.40 + Math.abs(i) * 0.025);
      claw(b, rear, rearTip, STONE_EDGE, "rear_toe");
      const handTip = new THREE.Vector3(s * (0.50 + i * 0.07), 0.12, 0.43 + i * 0.045);
      claw(b, hand, handTip, STONE_EDGE, "front_claw");
    }
  }

  // ---------------------------------------------------------------------------
  // Wings: thick stone fingers, thin carved membranes, scalloped lower edge.

  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    b.membrane(wingLeading[i], wingTrailing[i], {
      color: mottle("#4d4d58", "#777680", { size: 0.14, contrast: 1.8, seed: 30 + i }),
      thickness: 0.025,
      rows: 5,
      cols: 9,
      scallop: 0.20,
      name: "wing_membrane",
      group: "wings",
    });

    b.sweep(wingLeading[i], [0.075, 0.045], {
      color: carvedStone,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "wing_bone",
      group: "wings",
    });

    b.sweep(wingTrailing[i], [0.038, 0.018], {
      color: stone,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      name: "wing_rib",
      group: "wings",
    });

    const edge = wingLeading[i];
    for (const t of [0.18, 0.38, 0.58, 0.78, 0.94]) {
      const p = edge.at(t);
      b.spike(p, p, 0.075 + 0.04 * t, 0.018, {
        color: STONE_EDGE,
        name: "wing_spur",
        group: "wings",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Skull, muzzle, open jaw, ears, horns, brows.

  const skull = b.part(
    new THREE.SphereGeometry(0.30, 12, 8),
    carvedStone,
    {
      bone: head,
      at: head.at,
      scale: [1.18, 0.96, 1.12],
      flat: true,
      name: "massive_skull",
      group: "head",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.19, 10, 7),
    bellyStone,
    {
      bone: head,
      at: head.local({ forward: 0.23, down: 0.04 }),
      scale: [1.15, 0.70, 1.10],
      name: "muzzle",
      group: "face",
    },
  );

  b.frustumBox(
    jaw.at,
    jaw.local({ forward: 0.24, down: 0.09 }),
    [0.15, 0.07],
    [0.12, 0.035],
    {
      bone: jaw,
      color: stone,
      name: "lower_jaw",
      group: "jaw",
    },
  );

  b.part(new THREE.BoxGeometry(0.12, 0.045, 0.09), IRON, {
    bone: jaw,
    at: jaw.local({ forward: 0.225, down: 0.015 }),
    name: "mouth_void",
    group: "jaw",
  });

  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.145, up: 0.055, forward: 0.255 });
    b.decal(skull, EYE, {
      at: eyeAt,
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.115, 0.145],
      lift: 0.006,
      mirror: s > 0,
      name: "glowing_eye",
      group: "face",
    });

    b.part(new THREE.BoxGeometry(0.19, 0.055, 0.065), stone_dark(), {
      bone: head,
      at: head.local({ left: s * 0.14, up: 0.145, forward: 0.22 }),
      dir: [0, 0.1, 1],
      name: "heavy_brow",
      group: "face",
    });

    b.spike(
      head.local({ left: s * 0.13, up: -0.005, forward: 0.34 }),
      [0, 0, 1],
      0.095,
      0.028,
      { color: STONE_LIGHT, name: "fang", group: "face" },
    );

    // Pointed stone ear, folded backward.
    b.extrude(
      [
        [0, 0],
        [0.13, 0.02],
        [0.19, 0.22, "sharp"],
        [0.045, 0.14],
      ],
      {
        at: head.local({ left: s * 0.22, up: 0.12, back: 0.01 }),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.008,
        color: stone,
        bone: head,
        name: "pointed_ear",
        group: "head",
      },
    );

    // Brow horns and cheek spikes.
    const hornPath = bezier(
      head.local({ left: s * 0.18, up: 0.18, back: 0.02 }),
      head.local({ left: s * 0.25, up: 0.30, back: 0.02 }),
      head.local({ left: s * 0.29, up: 0.39, back: 0.08 }),
      head.local({ left: s * 0.24, up: 0.46, back: 0.16 }),
    );
    b.sweep(hornPath, [0.065, 0.005], {
      color: carvedStone,
      caps: { start: "round", end: "point" },
      name: "brow_horn",
      group: "head",
    });

    b.spike(
      head.local({ left: s * 0.26, up: -0.06, back: 0.02 }),
      [s * 0.34, -0.08, -0.12],
      0.13,
      0.025,
      { color: STONE_EDGE, name: "cheek_spike", group: "head" },
    );
  }

  // Nose block and nostril holes.
  b.part(new THREE.BoxGeometry(0.16, 0.11, 0.13), STONE_DARK, {
    bone: head,
    at: head.local({ forward: 0.36, down: 0.015 }),
    name: "nose_block",
    group: "face",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), IRON, {
      bone: head,
      at: head.local({ left: s * 0.055, forward: 0.425, down: 0.005 }),
      name: "nostril",
      group: "face",
    });
  }

  // ---------------------------------------------------------------------------
  // Gothic carving: rib plates, spinal thorns, medallion, cracks.

  for (let i = 0; i < 7; i++) {
    const t = i / 7;
    const p = spine.at(0.12 + t * 0.78);
    b.part(new THREE.BoxGeometry(0.34 - t * 0.07, 0.035, 0.045), STONE_EDGE, {
      at: p.at,
      dir: p.tangent,
      name: "rib_plate",
      group: "carving",
    });
  }

  b.along(spine, 7, (at) =>
    b.spike(at, at, 0.12, 0.027, {
      color: carvedStone,
      name: "dorsal_spine",
      group: "carving",
    }),
  );

  const chestHit = b.surface(spine).around(spine.at(0.72).at).at(0, 8);
  if (chestHit) {
    b.decal(spine, SIGIL, {
      at: chestHit,
      dir: chestHit.n,
      size: [0.22, 0.22],
      lift: 0.008,
      name: "cathedral_sigil",
      group: "carving",
    });
  }

  // A few deliberately graphic fracture lines on the stone.
  for (const s of [1, -1]) {
    b.decal(spine, CRACK, {
      at: [s * 0.22, 1.26, 0.45],
      dir: [s * 0.28, 0.12, 0.95],
      up: [0, 1, 0],
      size: [0.10, 0.18],
      lift: 0.012,
      mirror: s < 0,
      name: "stone_crack",
      group: "weathering",
    });
  }

  // Stone gargoyles often have a small crown of chipped fins at the neck.
  for (let i = -2; i <= 2; i++) {
    const p = neck.at(0.65);
    b.spike(
      p.moved([i * 0.055, 0.015, 0.01]),
      [i * 0.06, 0.14, -0.03],
      0.12 + (2 - Math.abs(i)) * 0.025,
      0.023,
      { color: STONE_EDGE, name: "neck_crown", group: "carving" },
    );
  }

  // Dark iron ring around the ledge and tiny golden eyes in the sigil.
  const ringPath = polyline([
    [-0.70, 0.18, 0.49],
    [0.70, 0.18, 0.49],
  ]);
  b.sweep(ringPath, 0.012, { color: IRON, name: "ledge_iron_band", group: "architecture" });

  b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, {
    at: [0, 1.38, 0.735],
    name: "sigil_ember",
    group: "carving",
  });

  return b.root;
}

function stone_dark() {
  return paint((_p, n) => (n.y > 0.4 ? "#74747c" : "#2d2b34"));
}
