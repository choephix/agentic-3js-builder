```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  limb,
  frame,
  paint,
  scales,
  countershade,
  gradient,
  svg,
} from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK as TOON_INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A towering five-headed hydra in a brutal God of War-inspired style, built from angular primitive geometry with bronze scales, bone horns, ragged neck spines, open jaws, glowing red eyes, and a heavy quadrupedal body.",
};

const DARK = "#19151a";
const DEEP = "#302329";
const SCALE_EDGE = "#171217";
const SCALE_BASE = cel("#4c3b39", "#241b22");
const SCALE_PAINT = scales(SCALE_BASE, SCALE_EDGE, {
  size: 0.075,
  width: 0.16,
  seed: 17,
});
const BELLY = cel("#a77c59", "#513a37");
const NECK_PAINT = countershade(SCALE_PAINT, BELLY, { level: -0.12, soft: 0.25 });
const LIMB_PAINT = cel("#3b2d31", "#18131a");
const BONE = cel("#d7bd8a", "#665044");
const HORN = cel("#3a2426", "#120d12");
const MOUTH = "#130b12";
const GUM = "#702d36";
const TONGUE = cel("#bd3c4a", "#5e1828");
const EYE_RED = "#ff2f24";
const EYE_GLOW = "#ff5a35";
const EYE_TEX = animeEye({
  iris: EYE_RED,
  irisLight: "#ffd05c",
  irisDark: "#721217",
  ink: "#10070d",
  blush: false,
  brow: true,
  size: 384,
});
const RUNE_TEX = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 7 L75 45 L112 27 L86 58 L119 80 L78 76 L79 119 L61 84 L38 113 L46 75 L9 87 L39 58 L13 34 L51 45 Z"
      fill="#d7a34a" stroke="#2a1016" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="64" cy="64" r="13" fill="#ff4b27" stroke="#281017" stroke-width="5"/>
  </svg>`,
  { size: 192 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: THREE.Vector3 | [number, number, number],
  color: any,
  bone: any,
  name: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function tuft(
  b: ReturnType<typeof createBuilder>,
  base: THREE.Vector3,
  dir: [number, number, number],
  length: number,
  radius: number,
  color: any,
  bone: any,
) {
  return b.spike(base, dir, length, radius, {
    color,
    bone,
    caps: "point",
    name: "raggedSpine",
  });
}

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one heavy root, a continuous torso, tail, four legs,
  // five independent neck chains, five skull joints, and five lower jaws.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.72, -0.22],
    dir: [0, 0.12, 1],
    role: "spine",
  });

  const torsoPath = catmull([
    [-0.02, 0.78, -0.72],
    [0, 0.82, -0.36],
    [0, 0.83, 0.05],
    [0, 0.94, 0.38],
    [0, 1.02, 0.57],
  ]);
  const torso = b.chain("spine", torsoPath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.73, -0.55],
    [0, 0.66, -0.92],
    [0, 0.54, -1.28],
    [0.07, 0.48, -1.62],
    [0.16, 0.56, -1.92],
    [0.1, 0.72, -2.16],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const legData = [
    { side: 1, z: 0.22, names: ["hipL", "kneeL", "ankleL"] },
    { side: -1, z: 0.22, names: ["hipR", "kneeR", "ankleR"] },
    { side: 1, z: -0.38, names: ["hipBackL", "kneeBackL", "ankleBackL"] },
    { side: -1, z: -0.38, names: ["hipBackR", "kneeBackR", "ankleBackR"] },
  ];

  const legs: any[] = [];
  for (const leg of legData) {
    const x = leg.side * 0.29;
    const root = [x, 0.82, leg.z] as [number, number, number];
    const foot = [leg.side * 0.36, 0.16, leg.z + (leg.z > 0 ? 0.13 : -0.08)] as [
      number,
      number,
      number,
    ];
    const points = limb(
      root,
      foot,
      [0.29, 0.32, 0.25],
      [
        [0, 0, leg.z > 0 ? 1 : -1],
        [0, 0, leg.z > 0 ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    legs.push(
      b.chain(`leg${leg.side > 0 ? "L" : "R"}${leg.z > 0 ? "Front" : "Back"}`, points, {
        parent: hips,
        names: leg.names,
        role: "leg",
        contact: foot,
      }),
    );
  }

  const neckSpecs = [
    {
      key: "neckOuterL",
      x: 0.4,
      h: 1.63,
      lean: 0.2,
      names: ["neckOuterL1", "neckOuterL2", "neckOuterL3", "neckOuterLTip"],
    },
    {
      key: "neckInnerL",
      x: 0.2,
      h: 1.82,
      lean: 0.1,
      names: ["neckInnerL1", "neckInnerL2", "neckInnerL3", "neckInnerLTip"],
    },
    {
      key: "neckCenter",
      x: 0,
      h: 1.98,
      lean: 0,
      names: ["neckCenter1", "neckCenter2", "neckCenter3", "neckCenterTip"],
    },
    {
      key: "neckInnerR",
      x: -0.2,
      h: 1.82,
      lean: -0.1,
      names: ["neckInnerR1", "neckInnerR2", "neckInnerR3", "neckInnerRTip"],
    },
    {
      key: "neckOuterR",
      x: -0.4,
      h: 1.63,
      lean: -0.2,
      names: ["neckOuterR1", "neckOuterR2", "neckOuterR3", "neckOuterRTip"],
    },
  ];

  const necks: any[] = [];
  const heads: any[] = [];
  const jaws: any[] = [];

  for (const spec of neckSpecs) {
    const x = spec.x;
    const start: [number, number, number] = [x * 0.76, 1.02, 0.42];
    const path = catmull([
      start,
      [x * 0.9, 1.28, 0.5],
      [x, 1.57, 0.67],
      [x + spec.lean, spec.h, 0.83],
    ]);
    const neck = b.chain(spec.key, path, {
      parent: hips,
      names: spec.names,
      role: "neck",
    });
    necks.push(neck);

    const tip = neck.at(1).at;
    const head = b.joint(`${spec.key}Head`, {
      parent: neck.tip,
      at: tip,
      dir: [spec.lean * 0.18, -0.01, 1],
      role: "head",
      group: "head",
    });
    heads.push(head);

    const jaw = b.joint(`${spec.key}Jaw`, {
      parent: head,
      at: head.local({ forward: 0.12, down: 0.035 }),
      dir: [spec.lean * 0.1, -0.08, 1],
      role: "jaw",
      group: "jaw",
    });
    jaws.push(jaw);
  }

  // A slightly open, threatening resting pose.
  for (const jaw of jaws) b.pose(jaw, { axis: [1, 0, 0], deg: -15 });

  // ---------------------------------------------------------------------------
  // Main continuous body and limbs.
  // ---------------------------------------------------------------------------

  b.sweep(torso, (t) => 0.31 + 0.07 * Math.sin(Math.PI * t), {
    color: SCALE_PAINT,
    sides: 8,
    section: "circle",
    name: "armoredTorso",
  });

  b.sweep(tail, (t) => 0.24 * (1 - t) + 0.035, {
    color: SCALE_PAINT,
    sides: 7,
    section: "circle",
    bands: [
      [0.76, DEEP],
      [0.91, BONE],
      [1, HORN],
    ],
    name: "scaledTail",
  });

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    b.sweep(leg, (t) => (t < 0.55 ? 0.13 : 0.1), {
      color: LIMB_PAINT,
      sides: 6,
      section: "box",
      name: `legArmor${i}`,
    });
    const foot = leg.at(1).at;
    b.part(new THREE.SphereGeometry(0.13, 7, 5), DARK, {
      bone: leg.tip,
      at: foot,
      scale: [1.05, 0.6, 1.3],
      name: `clawedFoot${i}`,
    });
    for (let t = 0; t < 3; t++) {
      const toeBase = new THREE.Vector3(
        foot.x + (t - 1) * 0.065,
        0.13,
        foot.z + 0.08,
      );
      b.spike(toeBase, [0, -0.02, 1], 0.17, 0.025, {
        color: BONE,
        bone: leg.tip,
        name: `footClaw${i}`,
      });
    }
  }

  // Broad shoulder plates make the five-neck silhouette feel anchored.
  for (const s of [1, -1]) {
    box(
      b,
      [0.18, 0.28, 0.42],
      [s * 0.29, 1.03, 0.31],
      cel("#66504a", "#2e2026"),
      hips,
      "shoulderPlate",
    );
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.SphereGeometry(0.025, 6, 4), BONE, {
        bone: hips,
        at: [s * (0.31 + (i % 2) * 0.035), 1.04 + Math.floor(i / 2) * 0.1, 0.18 + (i % 2) * 0.18],
        name: "shoulderRivet",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Five necks: thick serpentine columns, belly countershade, and a row of
  // enormous dorsal spikes on every chain.
  // ---------------------------------------------------------------------------

  for (let n = 0; n < necks.length; n++) {
    const neck = necks[n];
    const spec = neckSpecs[n];

    const tube = b.sweep(neck, (t) => 0.17 - 0.045 * t, {
      color: NECK_PAINT,
      sides: 8,
      name: `${spec.key}Skin`,
    });

    for (let i = 0; i < 7; i++) {
      const at = neck.at(0.12 + i * 0.12);
      const spikeHeight = 0.18 - i * 0.012;
      tuft(
        b,
        at.at.clone().add(new THREE.Vector3(0, 0.012, -0.03)),
        [0, 0.72, -0.48],
        spikeHeight,
        0.045,
        BONE,
        at.bone,
      );
    }

    // A thin red scar-like stripe down each throat.
    const throat = tube.line(180, 0.012);
    b.sweep(throat, 0.018, {
      color: cel("#8b3031", "#3b1722"),
      caps: "flat",
      name: `${spec.key}ThroatStripe`,
    });
  }

  // ---------------------------------------------------------------------------
  // Heads: large angular skulls, upper and lower jaws, teeth, tongues,
  // cheek blades, brow ridges, horns, and glowing decals.
  // ---------------------------------------------------------------------------

  const skullParts: any[] = [];

  for (let i = 0; i < heads.length; i++) {
    const head = heads[i];
    const jaw = jaws[i];
    const spec = neckSpecs[i];
    const headScale = i === 2 ? 1.12 : i === 0 || i === 4 ? 0.97 : 1.04;

    const skull = b.part(new THREE.SphereGeometry(0.24, 10, 7), SCALE_PAINT, {
      bone: head,
      at: head.at,
      scale: [0.92 * headScale, 0.88 * headScale, 1.08 * headScale],
      name: `skull${i}`,
      flat: true,
    });
    skullParts.push(skull);

    // A wedge-like upper muzzle, distinct from the lower jaw.
    const muzzlePath = bezier(
      head.local({ forward: 0.12, down: 0.005 }),
      head.local({ forward: 0.28, down: 0.01 }),
      head.local({ forward: 0.48, down: 0.03 }),
    );
    b.sweep(muzzlePath, [0.16 * headScale, 0.075], {
      bone: head,
      color: cel("#574044", "#251921"),
      section: "box",
      sides: 6,
      caps: { start: "flat", end: "round" },
      name: `upperMuzzle${i}`,
    });

    const lowerMuzzle = bezier(
      jaw.local({ forward: 0.05, down: 0 }),
      jaw.local({ forward: 0.25, down: 0.02 }),
      jaw.local({ forward: 0.45, down: 0.025 }),
    );
    b.sweep(lowerMuzzle, [0.13 * headScale, 0.055], {
      bone: jaw,
      color: cel("#3c292f", "#160f17"),
      section: "box",
      caps: { start: "flat", end: "round" },
      name: `lowerJaw${i}`,
    });

    // Black mouth seam and a protruding red tongue.
    b.sweep(
      bezier(
        jaw.local({ forward: 0.13, up: 0.035 }),
        jaw.local({ forward: 0.32, up: 0.055 }),
        jaw.local({ forward: 0.46, up: 0.025 }),
      ),
      0.018,
      { bone: jaw, color: MOUTH, caps: "flat", name: `mouth${i}` },
    );
    b.sweep(
      bezier(
        jaw.local({ forward: 0.2, up: 0.015 }),
        jaw.local({ forward: 0.38, down: 0.035 }),
        jaw.local({ forward: 0.54, down: 0.01 }),
      ),
      [0.035, 0.008],
      { bone: jaw, color: TONGUE, caps: "point", name: `tongue${i}` },
    );

    // Four large uneven fangs per mouth.
    for (const f of [-0.085, -0.028, 0.034, 0.09]) {
      const upperTooth = head.local({
        left: f,
        forward: 0.27 + Math.abs(f) * 0.45,
        down: 0.06,
      });
      b.spike(upperTooth, [0, -1, 0], 0.105 + Math.abs(f) * 0.2, 0.022, {
        color: BONE,
        bone: head,
        name: `upperFang${i}`,
      });
    }
    for (const f of [-0.07, 0.07]) {
      const lowerTooth = jaw.local({ left: f, forward: 0.33, up: 0.035 });
      b.spike(lowerTooth, [0, 1, 0], 0.07, 0.018, {
        color: BONE,
        bone: jaw,
        name: `lowerFang${i}`,
      });
    }

    // Horn pairs sweep backward from the crown.
    for (const s of [1, -1]) {
      const base = head.local({ left: s * 0.13, up: 0.13, back: 0.01 });
      const control = head.local({ left: s * 0.2, up: 0.28, back: 0.08 });
      const tip = head.local({ left: s * 0.24, up: 0.34, back: 0.28 });
      b.sweep(bezier(base, control, tip), [0.06, 0], {
        bone: head,
        color: HORN,
        caps: { start: "round", end: "point" },
        name: `crownHorn${i}`,
      });
      b.sweep(
        bezier(
          head.local({ left: s * 0.17, up: 0.08, back: 0.09 }),
          head.local({ left: s * 0.24, up: 0.15, back: 0.11 }),
          head.local({ left: s * 0.3, up: 0.19, back: 0.17 }),
        ),
        [0.035, 0],
        { bone: head, color: BONE, caps: "point", name: `cheekHorn${i}` },
      );
    }

    // Heavy brow blocks and cheek blades.
    for (const s of [1, -1]) {
      box(
        b,
        [0.095, 0.065, 0.14],
        head.local({ left: s * 0.115, up: 0.075, forward: 0.15 }),
        cel("#302328", "#120d12"),
        head,
        `brow${i}`,
      );

      b.extrude(
        [
          [0, 0],
          [0.13, 0.025],
          [0.09, 0.15],
          [0.025, 0.22],
          [0, 0.1],
        ],
        {
          at: head.local({ left: s * 0.19, up: -0.02, back: 0.01 }),
          x: [0, 0, 1],
          y: [s * 0.25, 1, 0],
          thickness: 0.025,
          bevel: 0.008,
          color: BONE,
          bone: head,
          name: `cheekBlade${i}`,
        },
      );
    }

    // Eyes are placed on the actual skull surface so they follow head posing.
    const skullSurface = b.surface(skull);
    for (const s of [1, -1]) {
      const eyeHit = skullSurface.nearest(
        head.local({ left: s * 0.135, up: 0.055, forward: 0.16 }),
      );
      const eye = b.decal(skull, EYE_TEX, {
        at: eyeHit,
        size: [0.115 * headScale, 0.145 * headScale],
        lift: 0.006,
        segments: 7,
        mirror: s > 0,
        name: `burningEye${i}`,
      });
      glow(eye, 1.8);
    }

    // A small embossed rune on the back of every skull.
    const runePoint = head.local({ back: 0.19, up: 0.04 });
    b.decal(skull, RUNE_TEX, {
      at: runePoint,
      dir: [0, 0, -1],
      up: [0, 1, 0],
      size: [0.075, 0.075],
      lift: 0.004,
      segments: 5,
      mirror: false,
      name: `skullRune${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Dorsal silhouette: large bony plates from shoulders to tail, plus scales
  // seated directly on the torso.
  // ---------------------------------------------------------------------------

  const spineFrames: any[] = [];
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const p = torso.at(t);
    spineFrames.push(p);
    const height = 0.12 + 0.16 * Math.sin(Math.PI * t);
    tuft(
      b,
      p.at.clone().add(new THREE.Vector3(0, 0.08, -0.015)),
      [0, 0.8, -0.18],
      height,
      0.055,
      BONE,
      p.bone,
    );
  }

  // Scatter chunky scales over the armored back and shoulders.
  const bodySurface = b.surface([torso, necks]);
  const scaleHits = bodySurface.scatter(44, {
    rng: rng(44),
    minDist: 0.075,
    filter: (h: any) => h.n.y > -0.25 && h.at.z > -1.45,
  });
  for (const hit of scaleHits) {
    b.stick(
      new THREE.ConeGeometry(0.045, 0.035, 6),
      cel("#77544a", "#2d2025"),
      hit,
      { embed: 0.62, spin: rng(91)() * 360, name: "raisedScale" },
    );
  }

  // Tail terminal crown.
  const tailTip = tail.at(1);
  for (let i = 0; i < 5; i++) {
    const angle = (i - 2) * 0.35;
    tuft(
      b,
      tailTip.at.clone(),
      [angle, 0.32 + Math.abs(i - 2) * 0.12, -0.75],
      0.2,
      0.035,
      BONE,
      tailTip.bone,
    );
  }

  // Low armor bands around the lower torso make the creature read as battle-worn.
  const beltPath = bodySurface.loop(torso.at(0.38), { lift: 0.012 });
  b.sweep(beltPath, 0.028, {
    color: cel("#7e4b3f", "#2c1a20"),
    sides: 6,
    name: "lowerArmorBand",
  });

  // A few dark scars crossing the flank.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = -0.08 - i * 0.18;
      b.sweep(
        bezier(
          [s * 0.29, 0.82 + i * 0.035, z + 0.08],
          [s * 0.34, 0.9 + i * 0.035, z],
          [s * 0.3, 0.97 + i * 0.035, z - 0.12],
        ),
        0.009,
        {
          bone: hips,
          color: TOON_INK,
          caps: "flat",
          name: "flankScar",
        },
      );
    }
  }

  return b.root;
}
```