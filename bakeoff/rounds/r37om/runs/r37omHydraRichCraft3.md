```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  paint,
  countershade,
  scales,
  svg,
  rng,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "five-headed hydra",
  description:
    "A brutal, low-poly God of War inspired hydra with five snarling heads, plated scales, hooked horns, open jaws, claws, dorsal spines, and a heavy serpentine tail.",
};

const BLACK = "#17151a";
const INK = "#28151d";
const DEEP = "#2d2028";
const SCALE_DARK = "#3b2528";
const SCALE_MID = "#68403d";
const SCALE_LIT = "#9b6250";
const BELLY = "#b68768";
const BONE = "#d6b184";
const BONE_DARK = "#795640";
const TOOTH = "#ead7ac";
const GUM = "#481d25";
const EYE_WHITE = "#f1c995";
const EYE_AMBER = "#ff9b25";
const BLOOD = "#9d2027";
const IRON = "#3c3c48";
const BRONZE = "#9b633c";

const coat = countershade(
  scales([SCALE_DARK, SCALE_MID, SCALE_LIT], "#211a20", {
    size: 0.115,
    width: 0.14,
    seed: 18,
  }),
  BELLY,
  { level: -0.14, soft: 0.24 },
);

const neckCoat = countershade(
  scales([SCALE_DARK, SCALE_MID, "#805049"], "#24191f", {
    size: 0.09,
    width: 0.13,
    seed: 31,
  }),
  "#bb8a6c",
  { level: -0.05, soft: 0.28 },
);

const scarPaint = paint((p, n) => {
  const ridge = Math.abs(Math.sin(p.x * 26 + p.z * 11 + p.y * 18));
  return ridge > 0.985 && n.z > -0.4 ? BLOOD : SCALE_DARK;
});

const eyeTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <radialGradient id="iris"><stop offset="0" stop-color="#fff19b"/><stop offset=".38" stop-color="#ffae28"/><stop offset=".8" stop-color="#a82c13"/><stop offset="1" stop-color="#220a0b"/></radialGradient>
    </defs>
    <circle cx="64" cy="64" r="59" fill="#120b0e" stroke="#321016" stroke-width="8"/>
    <circle cx="64" cy="64" r="45" fill="url(#iris)" stroke="#ffcc52" stroke-width="3"/>
    <ellipse cx="64" cy="64" rx="9" ry="36" fill="#160b0d"/>
    <circle cx="46" cy="41" r="12" fill="#fff8d2"/>
    <circle cx="82" cy="87" r="5" fill="#fff"/>
  </svg>`,
  { size: 256 },
);

const runeTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#130e14"/>
    <path d="M64 12 L76 45 L108 54 L79 72 L86 109 L64 87 L40 109 L48 72 L19 54 L52 45 Z"
      fill="none" stroke="#ff6837" stroke-width="7" stroke-linejoin="round"/>
    <path d="M64 30 L68 51 L88 57 L69 64 L64 84 L58 64 L39 57 L59 51 Z"
      fill="#f5b348"/>
  </svg>`,
  { size: 192 },
);

function sphere(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  color: any,
  bone: any,
  name: string,
  segments = 10,
) {
  return b.part(new THREE.SphereGeometry(1, segments, Math.max(6, segments - 2)), color, {
    at,
    scale,
    bone,
    name,
    flat: true,
  });
}

function box(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3 | [number, number, number],
  size: [number, number, number],
  color: any,
  bone: any,
  name: string,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    name,
    rotation,
    flat: true,
  });
}

function claw(
  b: ReturnType<typeof createBuilder>,
  base: THREE.Vector3,
  tip: THREE.Vector3,
  bone: any,
  name: string,
) {
  b.sweep(catmull([base, base.clone().lerp(tip, 0.48), tip]), [0.027, 0.004], {
    bone,
    color: TOOTH,
    caps: { start: "flat", end: "point" },
    name,
  });
}

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton: one root spine, four planted legs, a tail, five necks, five jaws.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.92, -0.12],
    dir: [0, 0, 1],
    role: "spine",
  });

  const bodyPath = catmull([
    [0, 0.91, -0.72],
    [0, 0.98, -0.36],
    [0, 1.06, 0.02],
    [0, 1.13, 0.38],
    [0, 1.16, 0.63],
  ]);
  const body = b.chain("spine", bodyPath, {
    parent: hips,
    count: 5,
    names: ["spineBase", "spineRear", "spineMid", "spineChest", "spineTop"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.91, -0.58],
    [0, 0.78, -1.0],
    [0.08, 0.62, -1.45],
    [0.22, 0.47, -1.87],
    [0.36, 0.39, -2.22],
    [0.56, 0.37, -2.49],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 6,
    names: ["tail0", "tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });

  const neckData = [
    { x: -0.58, y: 1.12, z: 0.28, tx: -0.68, ty: 1.91, tz: 0.60, name: "neckL" },
    { x: -0.29, y: 1.22, z: 0.43, tx: -0.34, ty: 2.08, tz: 0.82, name: "neckL2" },
    { x: 0.0, y: 1.27, z: 0.48, tx: 0.0, ty: 2.18, tz: 0.94, name: "neckC" },
    { x: 0.29, y: 1.22, z: 0.43, tx: 0.34, ty: 2.08, tz: 0.82, name: "neckR2" },
    { x: 0.58, y: 1.12, z: 0.28, tx: 0.68, ty: 1.91, tz: 0.60, name: "neckR" },
  ];

  const necks: any[] = [];
  const heads: any[] = [];
  const jaws: any[] = [];

  for (let i = 0; i < neckData.length; i++) {
    const d = neckData[i];
    const neckPath = catmull([
      [d.x, d.y, d.z],
      [d.x * 1.03, 1.43, d.z + 0.1],
      [d.tx * 0.86, 1.7, d.tz - 0.12],
      [d.tx, d.ty, d.tz],
    ]);
    const neck = b.chain(d.name, neckPath, {
      parent: body.joints[Math.min(3, body.joints.length - 1)],
      count: 4,
      names: [`${d.name}Base`, `${d.name}Mid`, `${d.name}High`, `${d.name}Tip`],
      role: "neck",
    });
    necks.push(neck);

    const head = b.joint(`head${i + 1}`, {
      parent: neck.tip,
      at: [d.tx, d.ty, d.tz],
      dir: [0, 0.02, 1],
      role: "head",
      group: "heads",
    });
    heads.push(head);

    const jaw = b.joint(`jaw${i + 1}`, {
      parent: head,
      at: [d.tx, d.ty - 0.12, d.tz + 0.04],
      dir: [0, -0.42, 0.92],
      role: "jaw",
      group: "jaws",
    });
    jaws.push(jaw);
  }

  const legTargets = [
    { side: "L", x: 0.56, z: 0.34, fwd: 0.12 },
    { side: "R", x: -0.56, z: 0.34, fwd: 0.12 },
    { side: "L", x: 0.56, z: -0.42, fwd: -0.15 },
    { side: "R", x: -0.56, z: -0.42, fwd: -0.15 },
  ];

  const legs: any[] = [];
  for (let i = 0; i < legTargets.length; i++) {
    const d = legTargets[i];
    const root = [d.x * 0.67, 0.98, d.z] as [number, number, number];
    const foot = [d.x, 0.22, d.z + d.fwd] as [number, number, number];
    const points = limb(
      root,
      foot,
      [0.38, 0.33, 0.25],
      [
        [0, 0, d.fwd >= 0 ? 1 : -1],
        [0, 0, d.fwd >= 0 ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain(`leg${d.side}${i}`, points, {
      parent: hips,
      names: [`hip${d.side}${i}`, `knee${d.side}${i}`, `ankle${d.side}${i}`, `paw${d.side}${i}`],
      role: "leg",
      contact: foot,
    });
    legs.push(leg);
  }

  // ---------------------------------------------------------------------------
  // Torso, necks, tail, belly plates, and heavy dorsal silhouette.
  // ---------------------------------------------------------------------------

  b.sweep(body, (t) => 0.34 + 0.07 * Math.sin(t * Math.PI), {
    bone: body,
    color: coat,
    section: { ngon: 8 },
    name: "armored torso",
  });

  b.sweep(tail, (t) => 0.19 * (1 - t) + 0.025, {
    bone: tail,
    color: coat,
    section: { ngon: 7 },
    bands: [[0.82, SCALE_LIT], [0.96, BONE_DARK], [1, TOOTH]],
    name: "serpentine tail",
  });

  for (let i = 0; i < necks.length; i++) {
    b.sweep(necks[i], (t) => 0.18 * (1 - t) + 0.09, {
      bone: necks[i],
      color: neckCoat,
      section: { ngon: 8 },
      name: `scaled neck ${i + 1}`,
    });
  }

  // Belly armor plates as overlapping broad slabs.
  for (let i = 0; i < 8; i++) {
    const z = -0.53 + i * 0.17;
    const y = 0.93 + Math.sin((i / 7) * Math.PI) * 0.12;
    const w = 0.25 - Math.abs(i - 3.5) * 0.012;
    b.extrude(
      [
        [-w, 0],
        [w, 0],
        [w * 0.78, 0.13],
        [0, 0.19],
        [-w * 0.78, 0.13],
      ],
      {
        at: [0, y - 0.23, z],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.055,
        bevel: 0.012,
        color: BELLY,
        bone: body.joints[Math.min(i, body.joints.length - 1)],
        name: `belly plate ${i}`,
      },
    );
  }

  // Shoulder armor masses and side plates.
  for (const s of [-1, 1]) {
    sphere(b, [s * 0.49, 1.08, 0.31], [0.27, 0.30, 0.30], SCALE_MID, hips, `shoulder ${s}`);
    box(b, [s * 0.61, 0.98, 0.28], [0.16, 0.27, 0.34], SCALE_DARK, hips, `shoulder plate ${s}`, [
      0.15,
      0,
      s * -0.18,
    ]);
  }

  // Dorsal spikes from rump through the tail.
  for (let i = 0; i < 15; i++) {
    const t = i / 15;
    const at = i < 8 ? body.at(Math.min(t * 0.82, 0.78)) : tail.at((i - 8) / 8);
    const h = i < 8 ? 0.18 + 0.08 * Math.sin(t * Math.PI) : 0.15 * (1 - (i - 8) / 9);
    b.spike(at, [0, 1, -0.1], h, 0.045, {
      bone: at.bone,
      color: BONE_DARK,
      name: `dorsal spine ${i}`,
    });
  }

  // Tail barbs along the final third.
  for (let i = 0; i < 7; i++) {
    const at = tail.at(0.48 + i * 0.075);
    for (const s of [-1, 1]) {
      b.spike(at, [s * 0.7, 0.25, -0.35], 0.16 - i * 0.012, 0.026, {
        bone: at.bone,
        color: TOOTH,
        name: `tail barb ${i}-${s}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Legs: muscular segments, armored knees, paws, and three claws each.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    const side = i % 2 === 0 ? 1 : -1;
    const front = i < 2;
    b.sweep(leg, [0.13, 0.095], {
      bone: leg,
      color: coat,
      section: { ngon: 6 },
      name: `muscular leg ${i}`,
    });

    const knee = leg.at(0.42);
    const ankle = leg.at(0.78);
    sphere(b, knee.at, [0.145, 0.13, 0.14], SCALE_LIT, knee.bone, `knuckle ${i}`, 8);
    sphere(b, ankle.at, [0.10, 0.09, 0.12], SCALE_DARK, ankle.bone, `ankle armor ${i}`, 8);

    const paw = leg.tip.at;
    box(b, [paw.x, paw.y + 0.045, paw.z + 0.035], [0.22, 0.09, 0.28], SCALE_DARK, leg.tip, `paw ${i}`, [
      0,
      side * 0.08,
      0,
    ]);

    for (let c = -1; c <= 1; c++) {
      const base = new THREE.Vector3(paw.x + c * 0.052, 0.18, paw.z + 0.11);
      const tip = new THREE.Vector3(paw.x + c * 0.064, 0.13, paw.z + 0.27 + Math.abs(c) * 0.02);
      claw(b, base, tip, leg.tip, `foot claw ${i}-${c}`);
    }

    // Knee talons protrude forward like a predatory raptor.
    b.spike(knee, [0, -0.15, 1], 0.16, 0.035, {
      bone: knee.bone,
      color: TOOTH,
      name: `knee talon ${i}`,
    });

    if (front) {
      sphere(b, [side * 0.62, 0.96, 0.46], [0.13, 0.18, 0.12], BONE_DARK, hips, `front armor ${i}`, 7);
    }
  }

  // ---------------------------------------------------------------------------
  // Five heads: skull, cheek ruffs, brow ridges, horns, eyes, rune plates.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < heads.length; i++) {
    const d = neckData[i];
    const head = heads[i];
    const jaw = jaws[i];
    const s = i < 2 ? 0.95 : i === 2 ? 1.08 : 0.95;

    const skull = sphere(
      b,
      [d.tx, d.ty + 0.03, d.tz + 0.10],
      [0.29 * s, 0.27 * s, 0.38 * s],
      coat,
      head,
      `skull ${i + 1}`,
      12,
    );

    // Long armored muzzle and nose.
    b.sweep(
      catmull([
        [d.tx, d.ty - 0.02, d.tz + 0.25],
        [d.tx, d.ty - 0.04, d.tz + 0.46],
        [d.tx, d.ty - 0.08, d.tz + 0.67],
      ]),
      [0.18 * s, 0.095],
      {
        bone: head,
        color: neckCoat,
        section: { ngon: 7 },
        caps: { start: "flat", end: "round" },
        name: `muzzle ${i + 1}`,
      },
    );
    sphere(b, [d.tx, d.ty - 0.08, d.tz + 0.67], [0.16 * s, 0.11, 0.10], INK, head, `nose ${i + 1}`, 8);

    // Brow ridges make the eyes read aggressively.
    for (const side of [-1, 1]) {
      b.sweep(
        catmull([
          [d.tx + side * 0.11, d.ty + 0.16, d.tz + 0.26],
          [d.tx + side * 0.17, d.ty + 0.20, d.tz + 0.38],
          [d.tx + side * 0.09, d.ty + 0.14, d.tz + 0.48],
        ]),
        [0.045, 0.018],
        {
          bone: head,
          color: BONE_DARK,
          caps: "round",
          name: `brow ridge ${i + 1}-${side}`,
        },
      );

      const eyeAt = new THREE.Vector3(d.tx + side * 0.135, d.ty + 0.095, d.tz + 0.405);
      const eye = b.part(new THREE.SphereGeometry(1, 10, 7), EYE_WHITE, {
        at: eyeAt,
        scale: [0.073, 0.065, 0.045],
        bone: head,
        name: `eye white ${i + 1}-${side}`,
      });
      const iris = b.decal(head, eyeTexture, {
        at: [eyeAt.x, eyeAt.y, eyeAt.z + 0.043],
        dir: [0, 0, 1],
        up: [0, 1, 0],
        size: [0.085, 0.085],
        lift: 0.003,
        mirror: side > 0,
        bone: head,
        name: `burning eye ${i + 1}-${side}`,
      });
      glow(iris, 1.65);

      // Cheek spikes and a short whisker-like horn.
      b.spike(
        [d.tx + side * 0.20, d.ty - 0.01, d.tz + 0.19],
        [side * 0.55, -0.08, 0.65],
        0.19,
        0.034,
        { bone: head, color: BONE, name: `cheek spike ${i + 1}-${side}` },
      );
    }

    // Crown horns: two swept-back horns on every skull.
    for (const side of [-1, 1]) {
      const hornBase = new THREE.Vector3(d.tx + side * 0.17, d.ty + 0.22, d.tz + 0.02);
      const hornPath = catmull([
        hornBase,
        new THREE.Vector3(d.tx + side * 0.25, d.ty + 0.37, d.tz - 0.10),
        new THREE.Vector3(d.tx + side * 0.30, d.ty + 0.52, d.tz - 0.24),
      ]);
      b.sweep(hornPath, [0.065, 0.006], {
        bone: head,
        color: BONE_DARK,
        caps: { start: "round", end: "point" },
        name: `swept horn ${i + 1}-${side}`,
      });
      b.spike(hornBase, [side * 0.35, 0.85, -0.35], 0.22, 0.038, {
        bone: head,
        color: BONE,
        name: `horn ridge ${i + 1}-${side}`,
      });
    }

    // Brow rune plate: a small ritual metal shield between the horns.
    const rune = b.part(new THREE.BoxGeometry(0.12, 0.17, 0.025), BRONZE, {
      at: [d.tx, d.ty + 0.25, d.tz + 0.305],
      scale: [1, 1.25, 1],
      bone: head,
      name: `rune plate ${i + 1}`,
      texture: runeTexture,
    });
    glow(rune, 0.55);

    // Jaw is deliberately a separate open lower jaw.
    b.sweep(
      catmull([
        [d.tx, d.ty - 0.12, d.tz + 0.04],
        [d.tx, d.ty - 0.23, d.tz + 0.28],
        [d.tx, d.ty - 0.28, d.tz + 0.62],
      ]),
      [0.14, 0.065],
      {
        bone: jaw,
        color: neckCoat,
        section: { ngon: 6 },
        caps: { start: "flat", end: "round" },
        name: `open lower jaw ${i + 1}`,
      },
    );

    b.sweep(
      catmull([
        [d.tx, d.ty - 0.10, d.tz + 0.16],
        [d.tx, d.ty - 0.15, d.tz + 0.40],
        [d.tx, d.ty - 0.18, d.tz + 0.63],
      ]),
      [0.11, 0.035],
      {
        bone: jaw,
        color: GUM,
        section: { ngon: 6 },
        caps: { start: "flat", end: "round" },
        name: `gum line ${i + 1}`,
      },
    );

    // Upper and lower teeth, staggered so the mouth silhouette is unmistakable.
    for (let tooth = 0; tooth < 5; tooth++) {
      const z = d.tz + 0.27 + tooth * 0.085;
      const x = d.tx + (tooth % 2 === 0 ? 0.105 : -0.105);
      b.spike([x, d.ty - 0.035, z], [0, -1, 0.02], 0.13 - tooth * 0.012, 0.025, {
        bone: head,
        color: TOOTH,
        name: `upper fang ${i + 1}-${tooth}`,
      });
      b.spike([x * 0.98, d.ty - 0.19, z + 0.025], [0, 1, -0.04], 0.105 - tooth * 0.01, 0.021, {
        bone: jaw,
        color: TOOTH,
        name: `lower fang ${i + 1}-${tooth}`,
      });
    }

    // A pair of chin tendrils / beard spikes.
    for (const side of [-1, 1]) {
      b.spike(
        [d.tx + side * 0.09, d.ty - 0.31, d.tz + 0.38],
        [side * 0.20, -0.9, 0.35],
        0.22,
        0.025,
        { bone: jaw, color: BONE_DARK, name: `chin spike ${i + 1}-${side}` },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Neck and skull scars: narrow red slash accents, plus metal neck collars.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < necks.length; i++) {
    const neck = necks[i];
    for (let k = 0; k < 3; k++) {
      const t = 0.22 + k * 0.19;
      const p = neck.at(t);
      b.sweep(
        [
          p.moved([0.08, 0.014, -0.08]),
          p.moved([-0.08, 0.014, 0.08]),
        ],
        0.012,
        { bone: p.bone, color: scarPaint, caps: "round", name: `neck scar ${i}-${k}` },
      );
    }

    const collar = b.surface(neck).loop(neck.at(0.34), { lift: 0.015 });
    b.sweep(collar, 0.027, {
      color: IRON,
      bone: neck.joints[1],
      name: `iron neck collar ${i}`,
    });
    b.along(collar, 8, (at: any) =>
      b.part(new THREE.SphereGeometry(0.027, 6, 4), BRONZE, {
        frame: at,
        bone: at.bone,
        name: `collar rivet ${i}`,
      }),
    );
  }

  // A few large scar strips across the torso, painted rather than cluttered.
  for (const z of [-0.22, 0.12, 0.43]) {
    b.sweep(
      catmull([
        [-0.28, 1.23, z],
        [0, 1.30, z + 0.035],
        [0.30, 1.22, z - 0.02],
      ]),
      0.014,
      { bone: body.joints[3], color: BLOOD, caps: "round", name: "torso scar" },
    );
  }

  return b.root;
}
```