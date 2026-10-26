import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  stripes,
  countershade,
  rng,
  svg,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A dark, brutal five-headed hydra with armored scales, blood-red crests, horned skulls, glowing eyes, open jaws, talons, and a barbed tail.",
};

const COAT_BASE = "#292226";
const COAT_LIGHT = "#4e3031";
const COAT_SHADOW = "#17151b";
const BELLY = "#70463b";
const RED = "#a52c2b";
const RED_DARK = "#551b25";
const BONE = "#d7bd8b";
const BONE_DARK = "#785844";
const CLAW = "#d6c49b";
const INK_DARK = "#110e16";
const EYE_GOLD = "#ffd447";
const EYE_RED = "#ff4a28";
const BRONZE = "#8f5b35";

const SCALE = cel(
  furEdge(COAT_LIGHT, BELLY, {
    by: "normal",
    level: -0.18,
    teeth: 0.18,
    period: 0.055,
    along: [0, 0, 1],
    ink: INK,
    inkWidth: 0.025,
  }),
  COAT_SHADOW,
  { threshold: 0.06 },
);

const NECK_SCALE = cel(
  stripes(SCALE, [RED_DARK, "#71302d"], {
    size: 0.19,
    width: 0.18,
    wobble: 0.24,
    seed: 17,
  }),
  COAT_SHADOW,
  { threshold: 0.04 },
);

const BELLY_PAINT = countershade(SCALE, cel(BELLY, "#3d272b"), {
  level: -0.08,
  soft: 0.25,
});

const EYE_TEX = animeEye({
  iris: EYE_GOLD,
  irisLight: "#fff2a0",
  irisDark: "#a62318",
  ink: INK_DARK,
  blush: false,
  brow: true,
  size: 256,
});

const RUNE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="M32 4 L38 21 L55 26 L40 35 L43 54 L32 43 L21 54 L24 35 L9 26 L26 21 Z"
      fill="#ff9b31" stroke="#1a0d12" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="32" cy="29" r="5" fill="#ffe9a3"/>
  </svg>`,
  { size: 128 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: any,
  at: any,
  bone: any,
  name: string,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    rotation,
    flat: true,
    name,
  });
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  color: any,
  at: any,
  bone: any,
  scale?: [number, number, number],
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function claw(
  b: ReturnType<typeof createBuilder>,
  base: any,
  tip: any,
  radius: number,
  bone: any,
  name: string,
) {
  return b.sweep([base, tip], [radius, 0.004], {
    bone,
    color: CLAW,
    section: { ngon: 5 },
    caps: { start: "flat", end: "point" },
    name,
  });
}

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one heavy spine, four grounded legs, one tail, five necks.
  // ---------------------------------------------------------------------------

  const spinePath = catmull([
    [0, 0.82, -0.62],
    [0, 0.91, -0.28],
    [0, 1.02, 0.16],
    [0, 1.08, 0.54],
    [0, 1.1, 0.78],
  ]);

  const spine = b.chain("spine", spinePath, {
    names: ["pelvis", "spineMid", "chest", "shoulder", "sternum"],
    role: "spine",
    count: 5,
  });

  const tailPath = catmull([
    [0, 0.88, -0.55],
    [0, 0.76, -0.98],
    [0, 0.63, -1.38],
    [0.04, 0.55, -1.73],
    [0.12, 0.58, -2.03],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: spine,
    names: ["tailBase", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
    count: 5,
  });

  const footTargets = [
    [-0.43, 0.14, -0.48],
    [0.43, 0.14, -0.48],
    [-0.46, 0.14, 0.48],
    [0.46, 0.14, 0.48],
  ] as const;

  const legChains: any[] = [];
  for (let i = 0; i < 4; i++) {
    const s = i % 2 === 0 ? 1 : -1;
    const x = footTargets[i][0];
    const z = footTargets[i][2];
    const root: [number, number, number] =
      z < 0 ? [x * 0.78, 0.91, -0.32] : [x * 0.82, 1.02, 0.42];
    const pts = limb(
      root,
      footTargets[i],
      z < 0 ? [0.31, 0.31, 0.25] : [0.34, 0.31, 0.24],
      [
        [0, 0, s > 0 ? 1 : -1],
        [0, 0, s > 0 ? -1 : 1],
      ],
    );
    const chain = b.chain(
      i === 0
        ? "legFrontL"
        : i === 1
          ? "legFrontR"
          : i === 2
            ? "legBackL"
            : "legBackR",
      pts,
      {
        parent: z < 0 ? spine : spine,
        names:
          i === 0
            ? ["hipL", "kneeL", "ankleL"]
            : i === 1
              ? ["hipR", "kneeR", "ankleR"]
              : i === 2
                ? ["hipBackL", "kneeBackL", "ankleBackL"]
                : ["hipBackR", "kneeBackR", "ankleBackR"],
        role: "leg",
        contact: footTargets[i],
      },
    );
    legChains.push(chain);
  }

  const headSpecs = [
    {
      side: "L",
      root: [-0.38, 1.12, 0.42] as [number, number, number],
      mid: [-0.58, 1.48, 0.58] as [number, number, number],
      tip: [-0.76, 2.08, 0.92] as [number, number, number],
      lean: [-0.1, 0.02, 1] as [number, number, number],
    },
    {
      side: "LInner",
      root: [-0.19, 1.15, 0.52] as [number, number, number],
      mid: [-0.3, 1.62, 0.73] as [number, number, number],
      tip: [-0.39, 2.27, 1.02] as [number, number, number],
      lean: [-0.04, 0.04, 1] as [number, number, number],
    },
    {
      side: "C",
      root: [0, 1.17, 0.56] as [number, number, number],
      mid: [0, 1.72, 0.78] as [number, number, number],
      tip: [0, 2.39, 1.12] as [number, number, number],
      lean: [0, 0.05, 1] as [number, number, number],
    },
    {
      side: "RInner",
      root: [0.19, 1.15, 0.52] as [number, number, number],
      mid: [0.3, 1.62, 0.73] as [number, number, number],
      tip: [0.39, 2.27, 1.02] as [number, number, number],
      lean: [0.04, 0.04, 1] as [number, number, number],
    },
    {
      side: "R",
      root: [0.38, 1.12, 0.42] as [number, number, number],
      mid: [0.58, 1.48, 0.58] as [number, number, number],
      tip: [0.76, 2.08, 0.92] as [number, number, number],
      lean: [0.1, 0.02, 1] as [number, number, number],
    },
  ] as const;

  const necks: any[] = [];
  const heads: any[] = [];
  const jaws: any[] = [];

  for (let i = 0; i < headSpecs.length; i++) {
    const h = headSpecs[i];
    const neck = b.chain(
      `neck${i + 1}`,
      catmull([h.root, h.mid, h.tip]),
      {
        parent: spine,
        names: [`neck${i + 1}Base`, `neck${i + 1}Mid`, `neck${i + 1}Tip`],
        role: "neck",
        count: 3,
      },
    );
    necks.push(neck);

    const head = b.joint(`head${i + 1}`, {
      parent: neck.tip,
      at: h.tip,
      dir: h.lean,
      role: "head",
      group: "skulls",
    });
    heads.push(head);

    const jaw = b.joint(`jaw${i + 1}`, {
      parent: head,
      at: head.local({ forward: 0.07, down: 0.075 }),
      dir: head.dir([0, 1, -0.13]),
      role: "jaw",
      group: "jaws",
    });
    jaws.push(jaw);
  }

  // ---------------------------------------------------------------------------
  // Main body and tail: broad, low-poly, heavily armored silhouettes.
  // ---------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.29 - t * 0.035, {
    color: BELLY_PAINT,
    section: { ngon: 8 },
    sides: 8,
    name: "armored torso",
  });

  b.sweep(tail, (t) => 0.19 * (1 - t) + 0.028, {
    color: NECK_SCALE,
    section: { ngon: 7 },
    bands: [[0.78, RED_DARK], [0.93, BONE_DARK]],
    name: "barbed tail",
  });

  // Tail armor ridges and tail-tip weapon.
  for (let i = 0; i < 8; i++) {
    const p = tail.at(0.08 + i * 0.105);
    b.spike(p, p, 0.12 - i * 0.008, 0.045 - i * 0.003, {
      color: BONE_DARK,
      bone: p.bone!,
      name: `tailSpine${i}`,
    });
  }
  b.spike(tail.at(0.96), tail.at(1), 0.2, 0.09, {
    color: BONE,
    name: "tail mace",
  });

  // Dorsal plates along the back.
  for (let i = 0; i < 8; i++) {
    const p = spine.at(0.16 + i * 0.105);
    b.spike(p, [0, 1, 0], 0.18 - Math.abs(i - 4) * 0.012, 0.065, {
      color: RED_DARK,
      name: `dorsal plate ${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Legs, armored joints, hooves, and three forward-splayed talons per foot.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < legChains.length; i++) {
    const leg = legChains[i];
    const s = i % 2 === 0 ? 1 : -1;

    b.sweep(leg, (t) => (t < 0.45 ? 0.105 : 0.082), {
      color: SCALE,
      section: { ngon: 6 },
      name: `leg armor ${i}`,
    });

    const knee = leg.at(0.43);
    const ankle = leg.at(0.83);
    sphere(b, 0.12, RED_DARK, knee.at, knee.bone, [1.1, 0.78, 1.05], `knee guard ${i}`);
    sphere(b, 0.095, BONE_DARK, ankle.at, ankle.bone, [1.05, 0.7, 0.9], `ankle guard ${i}`);

    const foot = leg.at(1);
    sphere(b, 0.105, SCALE, foot.at, foot.bone, [1.25, 0.6, 1.5], `foot ${i}`);

    for (let t = 0; t < 3; t++) {
      const spread = (t - 1) * 0.075;
      const base = foot.moved([spread, -0.01, 0.055]);
      const tip = foot.moved([spread * 1.55, -0.025, 0.23 + Math.abs(t - 1) * 0.025]);
      claw(b, base, tip, 0.027, foot.bone, `talon ${i}-${t}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Five necks, each with a dramatic red mane, collar armor, and dorsal spikes.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < necks.length; i++) {
    const neck = necks[i];
    b.sweep(neck, (t) => 0.14 - t * 0.025, {
      color: NECK_SCALE,
      section: { ngon: 7 },
      name: `scaled neck ${i + 1}`,
    });

    for (let j = 0; j < 5; j++) {
      const p = neck.at(0.16 + j * 0.16);
      b.spike(p, [0, 0.72, -0.15], 0.12, 0.038, {
        color: RED_DARK,
        name: `neck crest ${i + 1}-${j}`,
      });
    }

    const collar = neck.at(0.12);
    b.ring(
      collar,
      {
        count: 8,
        radius: 0.13,
        fromDeg: 0,
        toDeg: 360,
        tilt: 8,
        group: `collar${i}`,
        role: "fan",
      },
      (item) =>
        b.spike(item, item, 0.075, 0.018, {
          color: BRONZE,
          name: `collar spike ${i}`,
        }),
    );
  }

  // ---------------------------------------------------------------------------
  // Five skulls: oversized, angular, horned, and visibly different in silhouette.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < heads.length; i++) {
    const head = heads[i];
    const jaw = jaws[i];
    const side = i === 0 || i === 1 ? -1 : i === 3 || i === 4 ? 1 : 0;

    const skull = sphere(
      b,
      0.29,
      SCALE,
      head.at,
      head,
      [0.88, 1.0, 1.12],
      `skull ${i + 1}`,
    );

    // Brow and cheek plates create the God-of-War carved-mask feel.
    box(
      b,
      [0.34, 0.075, 0.18],
      RED_DARK,
      head.local({ up: 0.16, forward: 0.12 }),
      head,
      `brow plate ${i + 1}`,
      [side * 0.06, 0, 0],
    );

    sphere(
      b,
      0.17,
      BELLY_PAINT,
      head.local({ down: 0.015, forward: 0.19 }),
      head,
      [1.05, 0.76, 0.72],
      `muzzle ${i + 1}`,
    );

    // Lower jaw deliberately separate and slightly dropped.
    b.sweep(
      catmull([
        jaw.at,
        jaw.local({ forward: 0.13, down: 0.015 }),
        jaw.local({ forward: 0.3, down: -0.015 }),
      ]),
      [0.105, 0.07],
      {
        bone: jaw,
        color: BELLY_PAINT,
        section: { ngon: 6 },
        caps: "round",
        name: `open lower jaw ${i + 1}`,
      },
    );

    // Dark mouth cavity and a hard upper snout.
    box(
      b,
      [0.19, 0.07, 0.2],
      INK_DARK,
      head.local({ forward: 0.25, down: 0.06 }),
      jaw,
      `mouth cavity ${i + 1}`,
      [0, 0, 0],
    );
    sphere(
      b,
      0.065,
      INK_DARK,
      head.local({ forward: 0.32, down: 0.01 }),
      jaw,
      [1.35, 0.7, 0.55],
      `nose ${i + 1}`,
    );

    // Teeth hang from both jaws.
    for (let t = 0; t < 5; t++) {
      const x = (t - 2) * 0.047;
      const upper = head.local({ left: x, forward: 0.245, down: 0.04 });
      const lower = jaw.local({ left: x * 0.9, forward: 0.235, up: 0.02 });
      b.spike(upper, [0, -1, 0], 0.105 - (t % 2) * 0.018, 0.018, {
        color: BONE,
        bone: head,
        name: `upper fang ${i + 1}-${t}`,
      });
      b.spike(lower, [0, 1, 0], 0.075, 0.015, {
        color: BONE_DARK,
        bone: jaw,
        name: `lower fang ${i + 1}-${t}`,
      });
    }

    // Eyes are conformed to the skull, large and unmistakable.
    const skullSurface = b.surface(skull);
    for (const s of [-1, 1]) {
      const eyeAt = head.local({
        left: s * 0.145,
        up: 0.075,
        forward: 0.205,
      });
      b.decal(skullSurface, EYE_TEX, {
        at: eyeAt,
        dir: head.dir([0, 1, 0]),
        up: [0, 1, 0],
        size: [0.105, 0.14],
        mirror: s > 0,
        lift: 0.004,
        name: `glowing eye ${i + 1}-${s < 0 ? "L" : "R"}`,
      });
    }

    // Forehead rune / war paint.
    b.decal(skullSurface, RUNE_TEX, {
      at: head.local({ up: 0.22, forward: 0.17 }),
      dir: head.dir([0, 1, 0]),
      up: [0, 1, 0],
      size: [0.09, 0.09],
      lift: 0.006,
      name: `forehead rune ${i + 1}`,
    });

    // Two sweeping horns per skull, plus a smaller rear horn on the central head.
    for (const s of [-1, 1]) {
      const hornRoot = head.local({ left: s * 0.18, up: 0.17, back: 0.035 });
      const hornPath = catmull([
        hornRoot,
        head.local({ left: s * 0.27, up: 0.3, back: 0.01 }),
        head.local({ left: s * 0.29, up: 0.39, forward: 0.02 }),
        head.local({ left: s * 0.22, up: 0.46, forward: 0.08 }),
      ]);
      b.sweep(hornPath, [0.055, 0.008], {
        bone: head,
        color: BONE_DARK,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        name: `swept horn ${i + 1}-${s}`,
      });
    }

    if (i === 2) {
      for (const s of [-1, 1]) {
        b.spike(
          head.local({ left: s * 0.13, up: 0.2, back: 0.13 }),
          [0, 1, -0.25],
          0.23,
          0.04,
          { color: BONE, bone: head, name: `central crown horn ${s}` },
        );
      }
    }

    // Jaw hinge plates and cheek spikes.
    for (const s of [-1, 1]) {
      b.spike(
        head.local({ left: s * 0.23, down: 0.015, forward: 0.08 }),
        [s * 0.35, -0.15, 0.3],
        0.105,
        0.028,
        { color: BONE_DARK, bone: head, name: `cheek spike ${i + 1}-${s}` },
      );
      sphere(
        b,
        0.045,
        BRONZE,
        head.local({ left: s * 0.22, down: 0.08, forward: 0.1 }),
        head,
        [1.3, 0.7, 0.8],
        `jaw hinge ${i + 1}-${s}`,
      );
    }
  }

  // A few heavy shoulder armor blocks complete the silhouette without adding scenery.
  box(
    b,
    [0.42, 0.18, 0.3],
    RED_DARK,
    spine.at(0.72).at,
    spine.at(0.72).bone,
    "left shoulder armor",
    [0.08, 0, 0],
  );
  box(
    b,
    [0.42, 0.18, 0.3],
    RED_DARK,
    spine.at(0.72).at,
    spine.at(0.72).bone,
    "right shoulder armor",
    [-0.08, 0, 0],
  );

  // Small ember-red neck marks help distinguish the five faces at a glance.
  for (let i = 0; i < necks.length; i++) {
    const n = necks[i].at(0.62);
    sphere(b, 0.034, RED, n.at, n.bone, [1.8, 0.45, 0.6], `neck scar ${i + 1}`);
  }

  return b.root;
}
