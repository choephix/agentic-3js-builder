import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  paint,
  mottle,
  stripes,
  countershade,
  svg,
} from "../../../../src/index";
import { cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A richly decorated Slavic folk-art diorama of a crooked wooden hut perched on two expressive chicken legs.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD_DARK = "#5b2b1b";
  const WOOD = mottle("#9b5a2d", "#6f351f", { size: 0.18, seed: 11 });
  const WOOD_LIGHT = cel("#c47a3d", "#733820");
  const WOOD_RED = cel("#a9322c", "#5d171b");
  const ROOF = stripes(
    cel("#31566b", "#182f45"),
    ["#9a352d", "#d28b3c"],
    { size: 0.16, axis: "z", width: 0.22, wobble: 0.18, seed: 4 },
  );
  const CREAM = cel("#f5d894", "#b77b4a");
  const BLUE = cel("#3b7c91", "#1b3e58");
  const RED = cel("#c54836", "#711d24");
  const GOLD = cel("#e8af4c", "#9b4b25");
  const LEG = countershade(
    mottle("#b85f36", "#6d2d25", { size: 0.12, seed: 22 }),
    "#542225",
    { level: -0.1, soft: 0.3 },
  );
  const FEATHER = cel("#e5a93f", "#8f3a24");
  const BLACK = INK;

  const root = b.joint("hips", {
    at: [0, 1.02, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const legLPath = catmull([
    [0.32, 1.05, 0],
    [0.36, 0.73, 0.035],
    [0.28, 0.42, 0.06],
    [0.25, 0.17, 0.12],
  ]);
  const legRPath = catmull([
    [-0.32, 1.05, 0],
    [-0.37, 0.72, -0.025],
    [-0.29, 0.42, -0.015],
    [-0.25, 0.17, 0.12],
  ]);

  const legL = b.chain("legL", legLPath, {
    parent: root,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.25, 0.04, 0.2],
  });
  const legR = b.chain("legR", legRPath, {
    parent: root,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.25, 0.04, 0.2],
  });

  b.sweep(legL, (t) => 0.105 - t * 0.035, {
    color: LEG,
    sides: 7,
    section: "circle",
    caps: "round",
    name: "legL_feathered_shank",
    group: "chicken-legs",
  });
  b.sweep(legR, (t) => 0.105 - t * 0.035, {
    color: LEG,
    sides: 7,
    section: "circle",
    caps: "round",
    name: "legR_feathered_shank",
    group: "chicken-legs",
  });

  const base = b.part(
    new THREE.CylinderGeometry(1.18, 1.28, 0.09, 12),
    mottle("#52633a", "#263b2c", { size: 0.3, seed: 6 }),
    {
      bone: root,
      at: [0, 0.045, 0],
      name: "mossy-diorama-base",
      group: "ground",
      flat: true,
    },
  );
  b.part(
    new THREE.CylinderGeometry(1.02, 1.11, 0.035, 12),
    "#75613b",
    {
      bone: root,
      at: [0, 0.103, 0],
      name: "earth-top",
      group: "ground",
      flat: true,
    },
  );

  function toe(side: number, z: number, spread: number, name: string) {
    const heel = [side * 0.25, 0.13, z] as [number, number, number];
    const tip = [side * (0.25 + spread), 0.075, z + 0.22] as [
      number,
      number,
      number,
    ];
    b.rod(heel, tip, 0.027, {
      color: FEATHER,
      bone: side > 0 ? legL.tip : legR.tip,
      sides: 6,
      name,
      group: "chicken-toes",
    });
    b.spike(tip, [side * 0.1, -0.02, 0.08], 0.095, 0.022, {
      color: GOLD,
      bone: side > 0 ? legL.tip : legR.tip,
      name: `${name}_claw`,
      group: "chicken-toes",
    });
  }

  toe(1, 0.13, 0.18, "left_toe_outer");
  toe(1, 0.19, 0.12, "left_toe_middle");
  toe(1, 0.26, 0.07, "left_toe_inner");
  toe(-1, 0.13, 0.18, "right_toe_outer");
  toe(-1, 0.19, 0.12, "right_toe_middle");
  toe(-1, 0.26, 0.07, "right_toe_inner");

  function featherTuft(side: number, y: number, z: number, i: number) {
    b.part(
      new THREE.ConeGeometry(0.075, 0.22, 5),
      FEATHER,
      {
        bone: side > 0 ? legL.joints[0] : legR.joints[0],
        at: [side * 0.31, y, z],
        rotation: [0, side * 22, side * 18],
        name: `leg${side > 0 ? "L" : "R"}_feather_${i}`,
        group: "chicken-legs",
      },
    );
  }

  for (let i = 0; i < 5; i++) {
    featherTuft(1, 0.83 - i * 0.075, -0.015 + i * 0.025, i);
    featherTuft(-1, 0.83 - i * 0.075, -0.015 + i * 0.025, i);
  }

  const body = b.part(
    new THREE.BoxGeometry(1.28, 0.88, 0.98),
    WOOD,
    {
      bone: root,
      at: [0, 1.54, 0],
      name: "crooked-log-house",
      group: "hut",
      flat: true,
    },
  );

  function log(a: [number, number, number], c: [number, number, number], r: number, name: string) {
    b.rod(a, c, r, {
      color: WOOD_LIGHT,
      bone: root,
      sides: 8,
      name,
      group: "hut-logs",
    });
  }

  for (let i = 0; i < 6; i++) {
    const y = 1.17 + i * 0.145;
    log([-0.71, y, 0.49], [0.71, y, 0.49], 0.073, `front_log_${i}`);
    log([-0.71, y, -0.49], [0.71, y, -0.49], 0.073, `back_log_${i}`);
  }
  for (let i = 0; i < 5; i++) {
    const y = 1.24 + i * 0.145;
    log([0.65, y, -0.45], [0.65, y, 0.45], 0.068, `left_side_log_${i}`);
    log([-0.65, y, -0.45], [-0.65, y, 0.45], 0.068, `right_side_log_${i}`);
  }

  const door = b.part(
    new THREE.BoxGeometry(0.34, 0.61, 0.07),
    WOOD_DARK,
    {
      bone: root,
      at: [0, 1.39, 0.515],
      name: "round-arched-door",
      group: "front-details",
      flat: true,
    },
  );
  b.part(
    new THREE.BoxGeometry(0.39, 0.055, 0.055),
    RED,
    {
      bone: root,
      at: [0, 1.7, 0.56],
      name: "door-lintel",
      group: "front-details",
      flat: true,
    },
  );
  b.part(
    new THREE.SphereGeometry(0.028, 8, 5),
    GOLD,
    {
      bone: root,
      at: [0.1, 1.39, 0.56],
      name: "door-latch",
      group: "front-details",
    },
  );

  const windowTexture = svg(
    `<svg viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#24485a"/>
      <path d="M50 0V100M0 50H100" stroke="#e5b64e" stroke-width="9"/>
      <path d="M7 7L93 93M93 7L7 93" stroke="#c34231" stroke-width="5"/>
      <circle cx="50" cy="50" r="17" fill="#f4d889" stroke="#5e2521" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );
  const doorMark = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M50 8L61 36L91 37L68 55L76 86L50 68L24 86L32 55L9 37L39 36Z"
        fill="#d18a34" stroke="#351b1b" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="50" cy="48" r="9" fill="#6c2630"/>
    </svg>`,
    { size: 192 },
  );

  for (const s of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.28, 0.28, 0.035),
      BLUE,
      {
        bone: root,
        at: [s * 0.43, 1.52, 0.525],
        name: `window_shutter_${s}`,
        group: "windows",
        flat: true,
      },
    );
    b.part(
      new THREE.PlaneGeometry(0.23, 0.23),
      "#ffffff",
      {
        bone: root,
        at: [s * 0.43, 1.52, 0.55],
        dir: [0, 0, 1],
        axis: "z",
        texture: windowTexture,
        name: `round_window_${s}`,
        group: "windows",
      },
    );
    b.part(
      new THREE.BoxGeometry(0.06, 0.36, 0.045),
      RED,
      {
        bone: root,
        at: [s * 0.59, 1.52, 0.555],
        rotation: [0, 0, s * 18],
        name: `shutter_bar_${s}`,
        group: "windows",
      },
    );
  }

  b.part(
    new THREE.PlaneGeometry(0.22, 0.25),
    "#ffffff",
    {
      bone: root,
      at: [0, 1.46, 0.56],
      dir: [0, 0, 1],
      axis: "z",
      texture: doorMark,
      name: "door-sun-symbol",
      group: "folk-ornament",
    },
  );

  const gable = b.extrude(
    [
      [-0.73, 0],
      [0.73, 0],
      [0.58, 0.28],
      [0, 0.65, "sharp"],
      [-0.58, 0.28],
    ],
    {
      at: [0, 1.97, 0.5],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.07,
      bevel: 0.012,
      color: WOOD_RED,
      bone: root,
      name: "painted-gable",
      group: "roof",
    },
  );

  for (const s of [-1, 1]) {
    const angle = s * 27;
    b.part(
      new THREE.BoxGeometry(1.63, 0.085, 0.82),
      ROOF,
      {
        bone: root,
        at: [0, 2.22, s * 0.28],
        rotation: [angle * Math.PI / 180, 0, 0],
        name: `roof_slope_${s}`,
        group: "roof",
        flat: true,
      },
    );
    for (let i = 0; i < 6; i++) {
      b.part(
        new THREE.BoxGeometry(0.2, 0.035, 0.82),
        RED,
        {
          bone: root,
          at: [-0.68 + i * 0.27, 2.24, s * 0.29],
          rotation: [angle * Math.PI / 180, 0, 0],
          name: `roof_rib_${s}_${i}`,
          group: "roof-trim",
        },
      );
    }
  }

  b.rod([-0.82, 2.57, 0], [0.82, 2.57, 0], 0.055, {
    color: WOOD_DARK,
    bone: root,
    sides: 8,
    name: "ridge-pole",
    group: "roof",
  });

  const chimney = b.part(
    new THREE.BoxGeometry(0.22, 0.35, 0.22),
    WOOD_RED,
    {
      bone: root,
      at: [0.38, 2.62, -0.16],
      name: "crooked-chimney",
      group: "roof",
      flat: true,
    },
  );
  b.part(
    new THREE.BoxGeometry(0.31, 0.055, 0.29),
    WOOD_DARK,
    {
      bone: root,
      at: [0.38, 2.81, -0.16],
      rotation: [0, 0, 0.08],
      name: "chimney-cap",
      group: "roof",
    },
  );

  const trimPoints: [number, number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const x = -0.62 + i * 0.124;
    trimPoints.push([x, 1.04 + (i % 2 ? 0.025 : 0), 0.555]);
  }
  b.sweep(trimPoints, 0.027, {
    color: GOLD,
    bone: root,
    sides: 6,
    caps: "round",
    name: "golden-front-trim",
    group: "folk-ornament",
  });

  for (const s of [-1, 1]) {
    b.part(
      new THREE.ConeGeometry(0.095, 0.29, 6),
      RED,
      {
        bone: root,
        at: [s * 0.71, 1.03, 0.39],
        rotation: [0, 0, s * 0.35],
        name: `corner-carved-post_${s}`,
        group: "folk-ornament",
      },
    );
    b.part(
      new THREE.SphereGeometry(0.075, 8, 5),
      GOLD,
      {
        bone: root,
        at: [s * 0.71, 1.92, 0.45],
        name: `corner-finial_${s}`,
        group: "folk-ornament",
      },
    );
  }

  const bird = b.part(
    new THREE.SphereGeometry(0.09, 8, 6),
    FEATHER,
    {
      bone: root,
      at: [0, 2.72, 0.04],
      scale: [1.25, 0.9, 1.4],
      name: "roof-bird-body",
      group: "folk-ornament",
    },
  );
  b.part(
    new THREE.ConeGeometry(0.04, 0.12, 5),
    RED,
    {
      bone: root,
      at: [0, 2.75, 0.15],
      dir: [0, 0, 1],
      name: "roof-bird-beak",
      group: "folk-ornament",
    },
  );
  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.018, 6, 4),
      BLACK,
      {
        bone: root,
        at: [s * 0.045, 2.77, 0.105],
        name: `roof-bird-eye_${s}`,
        group: "folk-ornament",
      },
    );
    b.extrude(
      [
        [0, 0],
        [0.16, 0.03],
        [0.08, 0.14],
        [0.02, 0.1],
      ],
      {
        at: [s * 0.02, 2.73, 0.02],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        color: BLUE,
        bone: root,
        name: `roof-bird-wing_${s}`,
        group: "folk-ornament",
      },
    );
  }

  const vine = catmull([
    [-0.62, 1.83, 0.58],
    [-0.47, 1.77, 0.58],
    [-0.35, 1.84, 0.58],
    [-0.21, 1.78, 0.58],
  ]);
  b.sweep(vine, 0.012, {
    color: BLUE,
    bone: root,
    sides: 5,
    caps: "round",
    name: "painted-vine-left",
    group: "folk-ornament",
  });
  b.sweep(vine, 0.012, {
    color: RED,
    bone: root,
    sides: 5,
    caps: "round",
    name: "painted-vine-left-highlight",
    group: "folk-ornament",
  });

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.cos(a) * (0.93 + (i % 3) * 0.025);
    const z = Math.sin(a) * (0.93 + (i % 2) * 0.025);
    b.part(
      new THREE.SphereGeometry(0.035 + (i % 3) * 0.009, 6, 4),
      i % 2 ? "#6f8b46" : "#9b6338",
      {
        bone: root,
        at: [x, 0.14 + (i % 2) * 0.018, z],
        name: `base_moss_${i}`,
        group: "ground-detail",
      },
    );
  }

  return b.root;
}
