```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  svg,
  rng,
  paint,
  mottle,
  countershade,
} from "agentic-3js-builder";
import { cel, furEdge, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A stylized Slavic folk-art diorama of Baba Yaga's crooked wooden hut, lifted on expressive chicken legs and decorated with painted folk motifs.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1, paintSize: 2048 });

  const WOOD_DARK = cel("#5b2f24", "#351b1a");
  const WOOD = cel("#9d5634", "#633025");
  const WOOD_LIGHT = cel("#d58a4e", "#8f452d");
  const ROOF = cel("#553d68", "#2a2442");
  const ROOF_LIGHT = cel("#865a83", "#49385d");
  const GOLD = cel("#edbd54", "#a86526");
  const CREAM = cel("#f4d99b", "#c99055");
  const RED = cel("#bd3e35", "#702735");
  const TEAL = cel("#3b8d82", "#225d63");
  const LEG = cel("#b87537", "#704025");
  const LEG_LIGHT = cel("#dc9a4a", "#8b4c2e");
  const INK_PAINT = "#281b28";
  const MOSS = mottle("#48633c", "#253a2e", { size: 0.17, seed: 9, contrast: 1.2 });
  const STONE = mottle("#5d625a", "#343a39", { size: 0.24, seed: 4 });

  // Textured folk-art surfaces.
  const doorTexture = svg(
    `<svg viewBox="0 0 128 192" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="192" fill="#7b392d"/>
      <path d="M8 0V192M29 0V192M51 0V192M76 0V192M101 0V192M121 0V192"
        stroke="#482329" stroke-width="5" opacity=".72"/>
      <path d="M8 16H120M8 52H120M8 93H120M8 135H120M8 174H120"
        stroke="#b96a3d" stroke-width="3" opacity=".7"/>
      <circle cx="64" cy="89" r="26" fill="#d39b45" stroke="#351c28" stroke-width="6"/>
      <path d="M64 66v46M41 89h46M48 73l32 32M80 73L48 105"
        stroke="#71333a" stroke-width="5"/>
      <circle cx="96" cy="98" r="6" fill="#f4d38d" stroke="#351c28" stroke-width="3"/>
      <path d="M23 11h82M23 181h82" stroke="#edbd54" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const windowTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="58" fill="#252743" stroke="#e6b950" stroke-width="8"/>
      <circle cx="64" cy="64" r="42" fill="#5db7aa" stroke="#351d37" stroke-width="5"/>
      <path d="M64 22V106M22 64H106" stroke="#f4d99b" stroke-width="7"/>
      <path d="M35 35L93 93M93 35L35 93" stroke="#bd3e35" stroke-width="4"/>
      <circle cx="64" cy="64" r="9" fill="#f1c65d" stroke="#351d37" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );

  const shutterTexture = svg(
    `<svg viewBox="0 0 64 112" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="112" rx="8" fill="#3a6c69" stroke="#211b31" stroke-width="6"/>
      <path d="M9 14h46M9 34h46M9 54h46M9 74h46M9 94h46"
        stroke="#e8b755" stroke-width="5"/>
      <path d="M9 103L55 9M9 9l46 94" stroke="#bc4139" stroke-width="4"/>
    </svg>`,
    { size: 160 },
  );

  const trimTexture = svg(
    `<svg viewBox="0 0 256 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="48" fill="#f0ca68"/>
      <path d="M0 24L16 5l16 19L48 5l16 19L80 5l16 19L112 5l16 19L144 5l16 19L176 5l16 19L208 5l16 19L240 5l16 19"
        fill="none" stroke="#912f3b" stroke-width="8"/>
      <path d="M0 7H256M0 41H256" stroke="#2d4055" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const featherTexture = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 124C27 99 8 78 12 46 15 22 32 7 32 7s17 15 20 39c4 32-15 53-20 78Z"
        fill="#e1a949" stroke="#321c2b" stroke-width="5"/>
      <path d="M32 13v105M31 45L17 31M32 63L48 42M31 83L17 66M32 101L47 81"
        stroke="#7d3540" stroke-width="4"/>
    </svg>`,
    { size: 160 },
  );

  // Skeleton first: the hut has a central root and two articulated chicken legs.
  const hutRoot = b.joint("hutRoot", {
    at: [0, 1.26, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "hut",
  });

  const legLPath = catmull([
    [0.34, 1.27, 0.02],
    [0.39, 0.84, 0.02],
    [0.29, 0.47, 0.07],
  ]);
  const legRPath = catmull([
    [-0.34, 1.27, 0.02],
    [-0.40, 0.84, 0.02],
    [-0.29, 0.47, 0.07],
  ]);

  const legL = b.chain("legL", legLPath, {
    parent: hutRoot,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.29, 0, 0.07],
  });
  const legR = b.chain("legR", legRPath, {
    parent: hutRoot,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.29, 0, 0.07],
  });

  const toes: Array<{ chain: ReturnType<typeof b.chain>; side: number; front: number }> = [];
  for (const side of [1, -1]) {
    const leg = side > 0 ? legL : legR;
    const ankle = side > 0 ? legLPath[legLPath.length - 1] : legRPath[legRPath.length - 1];

    const toeSpecs = [
      { name: `toe${side > 0 ? "L" : "R"}Front`, tip: [ankle[0] + side * 0.06, 0.055, ankle[2] + 0.22] as [number, number, number] },
      { name: `toe${side > 0 ? "L" : "R"}Outer`, tip: [ankle[0] + side * 0.20, 0.055, ankle[2] + 0.05] as [number, number, number] },
      { name: `toe${side > 0 ? "L" : "R"}Inner`, tip: [ankle[0] - side * 0.14, 0.055, ankle[2] + 0.05] as [number, number, number] },
      { name: `toe${side > 0 ? "L" : "R"}Back`, tip: [ankle[0], 0.06, ankle[2] - 0.16] as [number, number, number] },
    ];
    for (const spec of toeSpecs) {
      const path = catmull([ankle, [spec.tip[0], 0.18, spec.tip[2] * 0.75], spec.tip]);
      const toe = b.chain(spec.name, path, {
        parent: leg.tip,
        names: [`${spec.name}Base`, `${spec.name}Tip`],
        role: "digit",
      });
      toes.push({ chain: toe, side, front: spec.tip[2] > ankle[2] ? 1 : -1 });
    }
  }

  // Main block of the hut.
  const body = b.part(
    new THREE.BoxGeometry(1.24, 0.76, 0.86),
    WOOD,
    {
      bone: hutRoot,
      at: [0, 1.56, 0],
      flat: true,
      name: "crooked_log_house",
      group: "hut",
    },
  );

  // Uneven log courses and dark corner beams make the block read as hand-built timber.
  const logYs = [1.23, 1.39, 1.56, 1.73, 1.88];
  for (let i = 0; i < logYs.length; i++) {
    const y = logYs[i];
    b.part(new THREE.BoxGeometry(1.30, 0.075, 0.91), i % 2 ? WOOD_LIGHT : WOOD_DARK, {
      bone: hutRoot,
      at: [i % 2 ? -0.01 : 0.015, y, 0],
      name: `log_course_${i}`,
      group: "timber",
    });
  }

  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.105, 0.88, 0.105), WOOD_DARK, {
      bone: hutRoot,
      at: [s * 0.60, 1.56, 0.01],
      name: `corner_post_${s}`,
      group: "timber",
    });
  }

  // Broad decorative front fascia.
  b.part(
    new THREE.BoxGeometry(1.29, 0.105, 0.94),
    WOOD_LIGHT,
    { bone: hutRoot, at: [0, 1.95, 0], name: "gable_fascia", group: "folk_trim" },
  );
  b.part(
    new THREE.BoxGeometry(1.18, 0.07, 0.965),
    RED,
    { bone: hutRoot, at: [0, 1.995, 0], texture: trimTexture, name: "painted_fascia", group: "folk_trim" },
  );

  // Roof: a squat faceted cap with a colorful gable face.
  b.part(
    new THREE.ConeGeometry(0.84, 0.58, 8, 1, false),
    ROOF,
    { bone: hutRoot, at: [0, 2.22, 0], name: "faceted_roof", group: "roof" },
  );

  b.extrude(
    [
      [-0.65, 0],
      [0.65, 0],
      [0.0, 0.56, "sharp"],
    ],
    {
      at: [0, 1.94, 0.43],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      color: ROOF_LIGHT,
      bone: hutRoot,
      name: "front_gable",
      group: "roof",
    },
  );

  // Roof ribs and a crooked ridge finial.
  for (const s of [-1, 1]) {
    b.rod(
      [s * 0.64, 1.97, 0.43],
      [s * 0.06, 2.48, 0.16],
      0.035,
      WOOD_DARK,
      { bone: hutRoot, name: `roof_rib_${s}`, group: "roof" },
    );
  }
  b.sweep(
    catmull([
      [-0.62, 2.02, 0.04],
      [0, 2.48, 0.04],
      [0.68, 2.02, 0.04],
    ]),
    0.027,
    { bone: hutRoot, color: GOLD, group: "roof_trim", name: "golden_roof_edge" },
  );

  // Little chimney and smoke-colored cap.
  b.part(new THREE.BoxGeometry(0.18, 0.34, 0.18), WOOD_DARK, {
    bone: hutRoot,
    at: [-0.35, 2.34, -0.08],
    name: "chimney",
    group: "roof",
  });
  b.part(new THREE.ConeGeometry(0.17, 0.12, 6), RED, {
    bone: hutRoot,
    at: [-0.35, 2.57, -0.08],
    name: "chimney_cap",
    group: "roof",
  });

  // Front door, round folk window, and shutters.
  b.part(new THREE.BoxGeometry(0.31, 0.53, 0.035), WOOD_DARK, {
    bone: hutRoot,
    at: [0, 1.48, 0.46],
    texture: doorTexture,
    name: "painted_door",
    group: "front",
  });
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.025, 12), CREAM, {
    bone: hutRoot,
    at: [0, 1.75, 0.475],
    dir: [0, 0, 1],
    texture: windowTexture,
    name: "round_window",
    group: "front",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.16, 0.31, 0.04), TEAL, {
      bone: hutRoot,
      at: [s * 0.29, 1.75, 0.46],
      texture: shutterTexture,
      name: `window_shutter_${s}`,
      group: "front",
    });
  }

  // Door lintel, hinges, and a cheerful folk-art sun above the entrance.
  b.part(new THREE.BoxGeometry(0.43, 0.075, 0.075), GOLD, {
    bone: hutRoot,
    at: [0, 1.78, 0.49],
    name: "door_lintel",
    group: "front",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 6), INK_PAINT, {
      bone: hutRoot,
      at: [s * 0.12, 1.48, 0.50],
      dir: [0, 0, 1],
      name: `door_hinge_${s}`,
      group: "front",
    });
  }
  b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.018, 10), GOLD, {
    bone: hutRoot,
    at: [0, 2.08, 0.47],
    dir: [0, 0, 1],
    name: "sun_medallion",
    group: "folk_trim",
  });
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const p0: [number, number, number] = [Math.sin(a) * 0.11, 2.08 + Math.cos(a) * 0.11, 0.49];
    const p1: [number, number, number] = [Math.sin(a) * 0.16, 2.08 + Math.cos(a) * 0.16, 0.49];
    b.rod(p0, p1, 0.014, RED, { bone: hutRoot, name: `sun_ray_${i}`, group: "folk_trim" });
  }

  // Small geometric painted motifs on the side walls.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 8), i % 2 ? GOLD : RED, {
        bone: hutRoot,
        at: [side * 0.635, 1.42 + i * 0.22, -0.18 + (i % 2) * 0.25],
        dir: [side, 0, 0],
        name: `side_rosette_${side}_${i}`,
        group: "folk_trim",
      });
    }
  }

  // The living chicken legs.
  const leftLeg = b.sweep(legL, (t) => 0.105 - t * 0.035, {
    color: countershade(LEG_LIGHT, LEG, { level: -0.15, soft: 0.28 }),
    sides: 7,
    group: "legs",
    name: "legL_skin",
  });
  const rightLeg = b.sweep(legR, (t) => 0.105 - t * 0.035, {
    color: countershade(LEG_LIGHT, LEG, { level: -0.15, soft: 0.28 }),
    sides: 7,
    group: "legs",
    name: "legR_skin",
  });

  // Scaly-looking joint bands and talon cuffs.
  for (const leg of [legL, legR]) {
    for (const t of [0.14, 0.48, 0.79]) {
      const at = leg.at(t);
      b.ring(at, { count: 7, radius: 0.102 - t * 0.03, fromDeg: 0, toDeg: 360 }, (r) =>
        b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, {
          frame: r,
          bone: at.bone,
          name: "leg_scale",
          group: "legs",
        }),
      );
    }
  }

  // Four toes per foot, with large blunt talons.
  for (const toe of toes) {
    const sweep = b.sweep(toe.chain, [0.038, 0.012], {
      color: LEG_LIGHT,
      sides: 6,
      caps: "round",
      group: "feet",
      name: `${toe.chain.joints[0].name}_skin`,
    });
    const tip = toe.chain.at(1);
    b.spike(tip, tip, 0.065, 0.018, {
      color: GOLD,
      caps: "point",
      group: "talons",
      name: `${toe.chain.joints[0].name}_claw`,
    });
  }

  // Extra feather tufts at the leg/hut transition.
  for (const side of [-1, 1]) {
    const frames = [
      [side * 0.29, 1.20, 0.02],
      [side * 0.36, 1.18, 0.10],
      [side * 0.22, 1.18, 0.10],
      [side * 0.32, 1.18, -0.08],
    ].map((p) => b.surface(leftLeg && side > 0 ? leftLeg : rightLeg).nearest(p));
    b.cards(frames, featherTexture, {
      size: [0.085, 0.20],
      lean: 45,
      bend: 18,
      vary: 0.18,
      rng: rng(side + 20),
      color: GOLD,
      group: "feathers",
    });
  }

  // A simple low-poly mossy plinth grounds the diorama without competing with the hut.
  b.part(new THREE.CylinderGeometry(0.78, 0.86, 0.12, 9), STONE, {
    at: [0, 0.06, 0],
    name: "mossy_diorama_stone",
    group: "ground",
  });
  b.part(new THREE.CylinderGeometry(0.73, 0.78, 0.025, 9), MOSS, {
    at: [0, 0.13, 0],
    name: "moss_cap",
    group: "ground",
  });

  // A few painted stones and a tiny folk mushroom at the base.
  for (const p of [
    [-0.58, 0.16, 0.20],
    [0.56, 0.16, -0.18],
    [-0.48, 0.16, -0.34],
  ] as Array<[number, number, number]>) {
    b.part(new THREE.DodecahedronGeometry(0.10, 0), STONE, {
      at: p,
      scale: [1.2, 0.65, 0.9],
      name: "border_stone",
      group: "ground",
    });
  }

  b.rod([0.57, 0.15, 0.28], [0.57, 0.34, 0.28], 0.025, CREAM, {
    name: "mushroom_stem",
    group: "ground",
  });
  b.part(new THREE.SphereGeometry(0.095, 8, 5), RED, {
    at: [0.57, 0.38, 0.28],
    scale: [1.25, 0.55, 1.0],
    name: "mushroom_cap",
    group: "ground",
  });
  for (const x of [0.54, 0.58, 0.62]) {
    b.part(new THREE.SphereGeometry(0.012, 5, 4), CREAM, {
      at: [x, 0.40, 0.27],
      name: "mushroom_spot",
      group: "ground",
    });
  }

  // A crooked signpost with a tiny Slavic sun emblem completes the storybook silhouette.
  b.rod([-0.76, 0.14, 0.20], [-0.80, 0.82, 0.20], 0.027, WOOD_DARK, {
    name: "signpost",
    group: "ground",
  });
  b.part(new THREE.BoxGeometry(0.38, 0.16, 0.045), WOOD_LIGHT, {
    at: [-0.80, 0.74, 0.20],
    rotation: [0, 0, -8],
    name: "signboard",
    group: "ground",
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.018, 8), GOLD, {
    at: [-0.80, 0.74, 0.235],
    dir: [0, 0, 1],
    name: "sign_sun",
    group: "ground",
  });

  return b.root;
}
```