import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  rng,
  scales,
  countershade,
  paint,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A brutal God of War-inspired five-headed hydra with scarred scale armor, plated necks, open jaws, bone horns, amber eyes, talons, dorsal spines, and a heavy serpent tail.",
};

const INK = "#120d14";
const COAT_DARK = "#211a22";
const COAT_MID = "#40333b";
const COAT_LIGHT = "#65505a";
const BELLY = "#8a7469";
const SCAR = "#8e2527";
const BLOOD = "#4e1018";
const BONE = "#d5bd91";
const BONE_DARK = "#735844";
const CLAW = "#30252b";
const EYE_WHITE = "#e6d8b1";
const IRIS = "#e78727";
const IRIS_DARK = "#4a180e";
const MOUTH = "#260c14";
const GUM = "#73313b";
const METAL = "#4a424b";

const coat = scales(
  countershade(COAT_LIGHT, BELLY, { level: -0.12, soft: 0.22 }),
  INK,
  { size: 0.105, width: 0.14, seed: 41 },
);

const neckCoat = scales(
  countershade(COAT_MID, "#725c57", { level: -0.18, soft: 0.25 }),
  INK,
  { size: 0.085, width: 0.12, seed: 53 },
);

const headCoat = scales(
  countershade(COAT_LIGHT, "#9a8171", { level: -0.06, soft: 0.28 }),
  INK,
  { size: 0.075, width: 0.11, seed: 67 },
);

const scarPaint = paint((p, n) => {
  const ridge = Math.sin(p.z * 31 + p.y * 13 + p.x * 9);
  return ridge > 0.25 && n.z > -0.2 ? SCAR : coat;
});

const EYE_TEXTURE = svg(
  `<svg viewBox="0 0 128 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="iris" cx="50%" cy="40%">
        <stop offset="0" stop-color="#ffd87a"/>
        <stop offset=".42" stop-color="#e78727"/>
        <stop offset="1" stop-color="#651b0d"/>
      </radialGradient>
    </defs>
    <path d="M10 72 Q64 12 118 72 Q64 142 10 72Z" fill="#120d14" stroke="#050307" stroke-width="8"/>
    <ellipse cx="64" cy="76" rx="37" ry="49" fill="url(#iris)" stroke="#2a0c0c" stroke-width="5"/>
    <ellipse cx="64" cy="78" rx="10" ry="35" fill="#090408"/>
    <ellipse cx="50" cy="47" rx="12" ry="16" fill="#fff3cd"/>
    <circle cx="80" cy="106" r="6" fill="#fff3cd"/>
  </svg>`,
  { size: 256 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: any,
  at: any,
  opts: any = {},
) {
  return b.part(new THREE.BoxGeometry(...size), color, { at, ...opts });
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  color: any,
  at: any,
  scale: [number, number, number],
  bone?: any,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    bone,
    scale,
    flat: true,
  });
}

function makeClaw(b: ReturnType<typeof createBuilder>, base: any, direction: any, length: number, color = CLAW) {
  return b.spike(base, direction, length, 0.026, {
    color,
    caps: "point",
    section: { ngon: 6 },
  });
}

function makeHorn(
  b: ReturnType<typeof createBuilder>,
  base: any,
  tip: any,
  radius: number,
  color = BONE,
) {
  const bend = base.clone ? base.clone() : base;
  const path = bezier(base, bend, tip);
  return b.sweep(path, [radius, 0.006], {
    color,
    caps: { start: "round", end: "point" },
    section: { ngon: 7 },
  });
}

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton: one root, a continuous spine, four legs, tail, five necks, jaws.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.91, -0.3],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [-0.02, 0.88, -0.82],
    [0, 0.94, -0.38],
    [0, 1.02, 0.02],
    [0, 1.04, 0.34],
    [0, 1.00, 0.56],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["pelvis", "back", "chest", "shoulder"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.88, -0.7],
    [0, 0.78, -1.25],
    [0.02, 0.66, -1.8],
    [-0.02, 0.52, -2.28],
    [0.08, 0.47, -2.68],
    [0.2, 0.53, -2.98],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });

  const legData = [
    {
      side: "L",
      x: 0.46,
      z: 0.27,
      target: [0.58, 0.17, 0.38] as [number, number, number],
      names: ["hipL", "kneeL", "ankleL", "footL"],
    },
    {
      side: "R",
      x: -0.46,
      z: 0.27,
      target: [-0.58, 0.17, 0.38] as [number, number, number],
      names: ["hipR", "kneeR", "ankleR", "footR"],
    },
    {
      side: "L",
      x: 0.43,
      z: -0.48,
      target: [0.55, 0.17, -0.61] as [number, number, number],
      names: ["hindHipL", "hindKneeL", "hindAnkleL", "hindFootL"],
    },
    {
      side: "R",
      x: -0.43,
      z: -0.48,
      target: [-0.55, 0.17, -0.61] as [number, number, number],
      names: ["hindHipR", "hindKneeR", "hindAnkleR", "hindFootR"],
    },
  ];

  const legs = legData.map((d) => {
    const root: [number, number, number] = [d.x, 0.93, d.z];
    const points = limb(
      root,
      d.target,
      [0.32, 0.34, 0.27],
      [
        [d.x * 0.2, 0, 1],
        [d.x * -0.15, 0, -1],
      ],
      { sole: [0, 1, 0] },
    );
    return {
      data: d,
      chain: b.chain(d.names[0], points, {
        parent: hips,
        names: d.names,
        role: "leg",
        contact: d.target,
      }),
    };
  });

  const headPositions = [
    { id: "center", x: 0, y: 2.62, z: 0.92, dir: [0, -0.03, 1] as [number, number, number] },
    { id: "innerL", x: 0.42, y: 2.39, z: 0.91, dir: [0.13, -0.08, 1] as [number, number, number] },
    { id: "innerR", x: -0.42, y: 2.39, z: 0.91, dir: [-0.13, -0.08, 1] as [number, number, number] },
    { id: "outerL", x: 0.78, y: 2.13, z: 0.76, dir: [0.27, -0.12, 0.96] as [number, number, number] },
    { id: "outerR", x: -0.78, y: 2.13, z: 0.76, dir: [-0.27, -0.12, 0.96] as [number, number, number] },
  ];

  const necks = headPositions.map((h, i) => {
    const start: [number, number, number] = [
      h.x * 0.37,
      1.08 + Math.abs(h.x) * 0.06,
      0.35 - Math.abs(h.x) * 0.04,
    ];
    const mid: [number, number, number] = [
      h.x * 0.6,
      1.48 + (i === 0 ? 0.08 : 0),
      0.53,
    ];
    const near: [number, number, number] = [h.x * 0.88, h.y - 0.36, h.z - 0.06];
    const path = catmull([start, mid, near, [h.x, h.y, h.z]]);
    const chain = b.chain(`neck${i}`, path, {
      parent: hips,
      count: 4,
      names: [`neck${i}Base`, `neck${i}Mid`, `neck${i}High`, `neck${i}Tip`],
      role: "neck",
    });
    const head = b.joint(`head${i}`, {
      parent: chain.joints[chain.joints.length - 1],
      at: [h.x, h.y, h.z],
      dir: h.dir,
      role: "head",
      group: "heads",
    });
    const jaw = b.joint(`jaw${i}`, {
      parent: head,
      at: head.local({ forward: 0.12, down: 0.10 }),
      dir: head.dir([0, 0.55, -0.27]),
      role: "jaw",
      group: "jaws",
    });
    b.pose(jaw, { axis: [1, 0, 0], deg: 15 + (i === 0 ? 5 : 0) });
    return { data: h, chain, head, jaw };
  });

  // ---------------------------------------------------------------------------
  // Main body, armor silhouette, belly, shoulder masses.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.39 + 0.11 * Math.sin(Math.PI * t), {
    bone: spine,
    color: scarPaint,
    section: { ngon: 8 },
    caps: "round",
    name: "armored-body",
    group: "body",
  });

  b.sweep(tail, (t) => 0.27 * (1 - t) + 0.035, {
    bone: tail,
    color: coat,
    section: { ngon: 8 },
    caps: { start: "round", end: "point" },
    name: "serpent-tail",
    group: "body",
  });

  sphere(b, 0.5, coat, [0, 1.08, 0.38], [1.18, 0.85, 1.02], spine.joints[2]);
  sphere(b, 0.42, scarPaint, [0, 1.06, -0.43], [1.16, 0.84, 1.12], spine.joints[1]);

  // Heavy shoulder plates.
  for (const s of [1, -1]) {
    sphere(b, 0.24, COAT_DARK, [s * 0.43, 1.18, 0.34], [1.3, 1.25, 1.1], spine.joints[3]);
    sphere(b, 0.16, BONE_DARK, [s * 0.56, 1.23, 0.38], [1.3, 1.0, 0.65], spine.joints[3]);
  }

  // Belly plates as broad overlapping slabs.
  for (let i = 0; i < 6; i++) {
    const z = -0.53 + i * 0.19;
    const y = 0.76 + 0.035 * Math.cos(i * 0.7);
    box(b, [0.52 - i * 0.018, 0.12, 0.08], BELLY, [0, y, z], {
      bone: spine.joints[Math.min(3, Math.floor(i / 2))],
      rotation: [0, 0, i % 2 ? -4 : 4],
      flat: true,
      name: `bellyPlate${i}`,
      group: "armor",
    });
  }

  // Dorsal spikes, kept broad and primitive.
  for (let i = 0; i < 11; i++) {
    const t = 0.05 + i * 0.087;
    const at = body.at(t, 0, 0.015);
    const height = i < 3 ? 0.17 : i < 8 ? 0.21 : 0.15;
    b.spike(at, at, height, 0.065, {
      color: BONE_DARK,
      caps: "point",
      section: { ngon: 5 },
      name: `dorsalSpine${i}`,
      group: "spines",
    });
  }

  // Tail ridge and tail tip barb.
  for (let i = 0; i < 5; i++) {
    const at = tail.at(0.38 + i * 0.105);
    b.spike(at, at, 0.11 - i * 0.012, 0.036, {
      color: BONE_DARK,
      section: { ngon: 5 },
      caps: "point",
      name: `tailRidge${i}`,
      group: "spines",
    });
  }

  // ---------------------------------------------------------------------------
  // Legs: segmented reptilian limbs, armored knees, broad feet, three talons.
  // ---------------------------------------------------------------------------

  for (const leg of legs) {
    const c = leg.chain;
    const d = leg.data;
    b.sweep(c, (t) => (t < 0.45 ? 0.105 : 0.075), {
      color: coat,
      bone: c,
      section: { ngon: 6 },
      skin: "rigid",
      name: `${d.names[0]}-limb`,
      group: "legs",
    });

    const knee = c.at(0.48);
    const ankle = c.at(0.78);
    sphere(b, 0.12, COAT_DARK, knee.at, [1.25, 0.92, 1.1], knee.bone);
    sphere(b, 0.09, BONE_DARK, ankle.at, [1.18, 0.72, 1.0], ankle.bone);

    const foot = c.at(0.98);
    box(b, [0.18, 0.09, 0.27], CLAW, foot.at, {
      bone: foot.bone,
      rotation: [0, 0, d.x > 0 ? -5 : 5],
      name: `${d.names[3]}-pad`,
      group: "feet",
    });

    for (const toe of [-1, 0, 1]) {
      const base = foot.at.clone().add(new THREE.Vector3(toe * 0.065, -0.015, 0.105));
      const tip = base.clone().add(new THREE.Vector3(toe * 0.018, -0.018, 0.16));
      makeClaw(b, base, tip, null as any, CLAW);
    }
    // Rear heel spur.
    const spurBase = foot.at.clone().add(new THREE.Vector3(0, 0.01, -0.11));
    makeClaw(
      b,
      spurBase,
      spurBase.clone().add(new THREE.Vector3(0, 0.015, -0.12)),
      null as any,
      BONE_DARK,
    );
  }

  // ---------------------------------------------------------------------------
  // Five necks and heads.
  // ---------------------------------------------------------------------------

  necks.forEach((n, index) => {
    const h = n.data;
    const neckSweep = b.sweep(n.chain, (t) => 0.19 - t * 0.045, {
      color: neckCoat,
      bone: n.chain,
      section: { ngon: 8 },
      name: `neckArmor${index}`,
      group: "necks",
    });

    // Neck armor rings.
    for (let j = 1; j < 5; j++) {
      const t = j / 5;
      const at = neckSweep.at(t, 0, 0.018);
      const ring = b.ring(at, {
        count: 7,
        radius: 0.18 - t * 0.035,
        fromDeg: 20,
        toDeg: 340,
      });
      for (const item of ring.items) {
        b.part(new THREE.SphereGeometry(0.025, 6, 4), BONE_DARK, {
          frame: item,
          bone: item.bone,
          scale: [1.1, 0.7, 0.85],
          name: `neckRivet${index}_${j}`,
          group: "armor",
        });
      }
    }

    const head = n.head;
    const jaw = n.jaw;

    // Skull and cheek masses.
    const skull = sphere(b, 0.31, headCoat, head.at, [1.12, 1.0, 1.15], head);
    sphere(
      b,
      0.22,
      headCoat,
      head.local({ forward: 0.23, down: 0.015 }),
      [1.14, 0.82, 1.0],
      head,
    );

    // Brow ridges and cheek plates.
    for (const s of [1, -1]) {
      b.sweep(
        catmull([
          head.local([s * 0.22, 0.17, 0.16]),
          head.local([s * 0.10, 0.27, 0.20]),
          head.local([s * 0.01, 0.32, 0.13]),
        ]),
        [0.047, 0.025],
        {
          bone: head,
          color: COAT_DARK,
          caps: "round",
          name: `brow${index}_${s}`,
          group: "face",
        },
      );

      const cheek = head.local([s * 0.22, 0.19, -0.035]);
      sphere(b, 0.11, BONE_DARK, cheek, [1.25, 0.65, 1.2], head);

      // Large embedded eye and glowing slit pupil.
      const eyeAt = head.local([s * 0.145, 0.245, 0.095]);
      const eye = b.part(new THREE.SphereGeometry(0.067, 10, 7), EYE_WHITE, {
        at: eyeAt,
        bone: head,
        scale: [1.0, 0.7, 1.08],
        name: `eyeWhite${index}_${s}`,
        group: "eyes",
      });
      const irisAt = head.local([s * 0.145, 0.285, 0.095]);
      const iris = b.part(new THREE.SphereGeometry(0.043, 8, 6), IRIS, {
        at: irisAt,
        bone: head,
        scale: [0.72, 0.35, 1.15],
        name: `amberIris${index}_${s}`,
        group: "eyes",
      });
      glow(iris, 1.35);
      b.part(new THREE.SphereGeometry(0.014, 6, 4), IRIS_DARK, {
        at: head.local([s * 0.145, 0.302, 0.095]),
        bone: head,
        scale: [0.6, 0.35, 1.6],
        name: `slitPupil${index}_${s}`,
        group: "eyes",
      });

      // Small hornlets around the cheek and jaw hinge.
      makeHorn(
        b,
        head.local([s * 0.255, 0.14, 0.04]),
        head.local([s * 0.37, 0.12, 0.16]),
        0.045,
        BONE,
      );
    }

    // Crown horns: two swept-back and one central crown spike.
    for (const s of [1, -1]) {
      makeHorn(
        b,
        head.local([s * 0.16, -0.02, 0.22]),
        head.local([s * 0.31, -0.16, 0.52]),
        0.065,
        BONE,
      );
      makeHorn(
        b,
        head.local([s * 0.26, 0.04, 0.14]),
        head.local([s * 0.49, -0.03, 0.34]),
        0.05,
        BONE_DARK,
      );
    }
    makeHorn(
      b,
      head.local([0, -0.03, 0.25]),
      head.local([0, -0.18, 0.63]),
      0.055,
      BONE,
    );

    // Upper muzzle, nose plate, nostrils.
    const muzzleStart = head.local({ forward: 0.20, down: 0.07 });
    const muzzleEnd = head.local({ forward: 0.50, down: 0.09 });
    b.frustumBox(muzzleStart, muzzleEnd, [0.20, 0.17], [0.145, 0.12], {
      bone: head,
      color: headCoat,
      name: `muzzle${index}`,
      group: "face",
    });

    box(b, [0.19, 0.09, 0.09], BONE_DARK, head.local({ forward: 0.505, down: 0.08 }), {
      bone: head,
      name: `nosePlate${index}`,
      group: "face",
    });

    for (const s of [1, -1]) {
      sphere(
        b,
        0.026,
        INK,
        head.local([s * 0.07, 0.555, 0.0]),
        [1.0, 0.45, 0.7],
        head,
      );
    }

    // Upper mouth roof and lower jaw, deliberately separated.
    const upperMouth = catmull([
      head.local([0, 0.38, -0.10]),
      head.local([0, 0.58, -0.13]),
      head.local([0, 0.67, -0.12]),
    ]);
    b.sweep(upperMouth, [0.15, 0.075], {
      bone: head,
      color: MOUTH,
      caps: "flat",
      section: { ngon: 6 },
      name: `upperMouth${index}`,
      group: "mouth",
    });

    const lowerMouth = catmull([
      jaw.at,
      jaw.local({ forward: 0.25, down: -0.01 }),
      jaw.local({ forward: 0.52, down: -0.015 }),
    ]);
    b.sweep(lowerMouth, [0.12, 0.055], {
      bone: jaw,
      color: MOUTH,
      caps: "flat",
      section: { ngon: 6 },
      name: `lowerJaw${index}`,
      group: "mouth",
    });

    // Gums along both jaws.
    b.sweep(
      catmull([
        head.local([0, 0.39, -0.08]),
        head.local([0, 0.60, -0.10]),
      ]),
      [0.125, 0.065],
      {
        bone: head,
        color: GUM,
        caps: "flat",
        name: `upperGum${index}`,
        group: "mouth",
      },
    );

    b.sweep(
      catmull([
        jaw.local([0, 0.04, 0.02]),
        jaw.local([0, 0.27, 0.015]),
        jaw.local([0, 0.51, 0.005]),
      ]),
      [0.095, 0.042],
      {
        bone: jaw,
        color: GUM,
        caps: "flat",
        name: `lowerGum${index}`,
        group: "mouth",
      },
    );

    // Teeth are huge and uneven, with long fangs at the front.
    for (const s of [1, -1]) {
      const upperTeeth = [
        [s * 0.105, 0.40, -0.13],
        [s * 0.075, 0.50, -0.145],
        [s * 0.035, 0.59, -0.14],
      ];
      upperTeeth.forEach((p, j) => {
        const base = head.local(p);
        const tip = head.local([p[0], p[1] + 0.018, p[2] - (j === 0 ? 0.15 : 0.10)]);
        makeClaw(b, base, tip, null as any, BONE);
      });

      const lowerTeeth = [
        [s * 0.09, 0.18, 0.03],
        [s * 0.052, 0.30, 0.025],
        [s * 0.015, 0.42, 0.02],
      ];
      lowerTeeth.forEach((p, j) => {
        const base = jaw.local(p);
        const tip = jaw.local([p[0], p[1] + 0.015, p[2] + (j === 0 ? 0.10 : 0.075)]);
        makeClaw(b, base, tip, null as any, BONE_DARK);
      });
    }

    // A central fang makes each face read at thumbnail scale.
    makeClaw(
      b,
      head.local([0, 0.56, -0.13]),
      head.local([0, 0.59, -0.29]),
      null as any,
      BONE,
    );

    // Face scars and war-paint ridges.
    for (const s of [1, -1]) {
      b.sweep(
        bezier(
          head.local([s * 0.24, 0.10, 0.12]),
          head.local([s * 0.30, 0.21, 0.04]),
          head.local([s * 0.26, 0.31, -0.02]),
        ),
        [0.012, 0.004],
        {
          bone: head,
          color: SCAR,
          caps: { start: "round", end: "point" },
          name: `faceScar${index}_${s}`,
          group: "scars",
        },
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Small material details: armor studs, scars, neck fins, and a battle trophy.
  // ---------------------------------------------------------------------------

  // Shoulder and hip rivets.
  const rivetPoints = [
    [-0.53, 1.35, 0.28],
    [0.53, 1.35, 0.28],
    [-0.55, 0.91, -0.1],
    [0.55, 0.91, -0.1],
    [-0.46, 0.72, -0.55],
    [0.46, 0.72, -0.55],
  ];
  for (let i = 0; i < rivetPoints.length; i++) {
    sphere(b, 0.035, METAL, rivetPoints[i], [1, 0.55, 1], spine.joints[1]);
  }

  // Long red scars over the flank.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = -0.22 + i * 0.22;
      b.sweep(
        bezier(
          [s * 0.39, 1.18 + i * 0.015, z],
          [s * 0.52, 1.12, z + 0.06],
          [s * 0.57, 1.02, z + 0.12],
        ),
        [0.018, 0.006],
        {
          bone: spine.joints[2],
          color: BLOOD,
          caps: { start: "round", end: "point" },
          name: `flankScar${s}_${i}`,
          group: "scars",
        },
      );
    }
  }

  // A few webbed fins between the neck bases, giving the silhouette a war-banner profile.
  for (const s of [1, -1]) {
    const fin = b.extrude(
      [
        [0, 0],
        [0.16, 0.02],
        [0.24, 0.16],
        [0.08, 0.30],
        [0, 0.39],
      ],
      {
        at: [s * 0.17, 1.30, 0.43],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.026,
        bevel: 0.006,
        smoothing: 1,
        color: BONE_DARK,
        bone: hips,
        name: `neckFin${s}`,
        group: "silhouette",
      },
    );
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BONE, {
        at: fin.local([0.04 + i * 0.055, 0.08 + i * 0.08, 0.018]),
        bone: hips,
        name: `finRivet${s}_${i}`,
        group: "armor",
      });
    }
  }

  // A crude iron collar around the tail base, like a relic of an old failed hunt.
  const collarPath = catmull(
    [
      [-0.17, 0.87, -0.86],
      [0.17, 0.87, -0.86],
      [0.17, 0.87, -0.98],
      [-0.17, 0.87, -0.98],
    ],
    { closed: true },
  );
  b.sweep(collarPath, 0.035, {
    bone: hips,
    color: METAL,
    section: { ngon: 6 },
    name: "tailIronCollar",
    group: "relic",
  });

  // Tiny hanging iron tags under the collar.
  for (const s of [-1, 1]) {
    b.rod(
      [s * 0.11, 0.82, -0.95],
      [s * 0.11, 0.64, -0.97],
      0.012,
      {
        bone: hips,
        color: METAL,
        name: `tagChain${s}`,
        group: "relic",
      },
    );
    box(b, [0.08, 0.11, 0.018], METAL, [s * 0.11, 0.58, -0.97], {
      bone: hips,
      name: `ironTag${s}`,
      group: "relic",
    });
  }

  return b.root;
}
