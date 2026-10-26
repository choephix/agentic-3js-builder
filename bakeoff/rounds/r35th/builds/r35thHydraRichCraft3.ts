import * as THREE from "three";
import {
  bezier,
  b,
  catmull,
  countershade,
  createBuilder,
  furEdge,
  glow,
  gradient,
  limb,
  mottle,
  rng,
  scales,
  svg,
  cel,
} from "../../../../src/index";
import { animeEye, INK, inkLines } from "../../../../kits/toon";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A brutal, low-poly five-headed hydra with armored scales, open jaws, glowing eyes, horns, crimson neck fins, scars, claws, and a barbed tail.",
};

const EYE_TEXTURE = animeEye({
  iris: "#e12d23",
  irisLight: "#ffb02d",
  irisDark: "#6e0b18",
  ink: "#13090d",
  blush: false,
  brow: false,
  size: 384,
});

const RUNE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
    <path d="M32 5 L45 24 L36 39 L51 55 L32 91 L13 55 L28 39 L19 24 Z"
      fill="#d6aa55" stroke="#261516" stroke-width="5" stroke-linejoin="round"/>
    <path d="M32 18 L32 75 M22 53 L42 53 M25 30 L39 30"
      fill="none" stroke="#fff0a0" stroke-width="4" stroke-linecap="round"/>
    <circle cx="32" cy="53" r="5" fill="#4b1117"/>
  </svg>`,
  { size: 256 },
);

const SCAR_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
    <path d="M6 8 L53 34 L34 56 M39 6 L83 31 L62 60 M79 5 L122 28 L101 58"
      fill="none" stroke="#170d12" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 8 L53 34 L34 56 M39 6 L83 31 L62 60 M79 5 L122 28 L101 58"
      fill="none" stroke="#a72b27" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 11 L51 35 M44 9 L81 31 M85 8 L119 29"
      fill="none" stroke="#ff7650" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const EMBLEM_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="57" fill="#151719" stroke="#08090b" stroke-width="6"/>
    <path d="M64 12 L77 43 L110 46 L84 67 L92 101 L64 82 L36 101 L44 67 L18 46 L51 43 Z"
      fill="#b5372c" stroke="#e0b15d" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="64" cy="61" r="12" fill="#1c0a12" stroke="#f0d477" stroke-width="4"/>
    <path d="M64 25 L64 46 M38 50 L52 57 M90 50 L76 57"
      stroke="#ffdc75" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const BLACK = "#0b0c0f";
const MOUTH = "#13090e";
const DEEP_RED = "#4b1117";
const CRIMSON = cel("#ac2925", "#3d1018");
const BLOOD = cel("#d33c2d", "#5b1019");
const BELLY = cel("#77705d", "#302b2b");
const BONE = cel("#c5ad7e", "#624a38");
const HORN = inkLines(BONE, { levels: [0.18, 0.62], width: 0.05, axis: [0, 1, 0] });
const CLAW = cel("#d7c08d", "#5b4535");
const PLATE = cel("#65706a", "#202928");
const BRONZE = cel("#a9783f", "#3a241e");
const FRILL = cel("#8d2528", "#2b1019");

const SCALE_FIELD = scales(
  ["#26302f", "#35413d", "#48514a", "#293634"],
  "#111718",
  { size: 0.15, width: 0.11, seed: 17 },
);

const COAT_EDGE = furEdge(SCALE_FIELD, BELLY, {
  level: -0.19,
  teeth: 0.17,
  period: 0.038,
  along: [0, 0, 1],
  ink: "#141719",
  inkWidth: 0.025,
});

const COAT = cel(COAT_EDGE, "#111719", {
  threshold: 0.08,
});

const HEAD_COAT = cel(
  mottle(COAT_EDGE, "#576057", { size: 0.27, contrast: 1.2, seed: 31 }),
  "#151b1a",
  { threshold: 0.04 },
);

const THROAT = countershade(CRIMSON, "#35141b", { level: -0.05, soft: 0.22 });

function add(p: THREE.Vector3, x: number, y: number, z: number) {
  return p.clone().add(new THREE.Vector3(x, y, z));
}

function lowSphere(
  bld: ReturnType<typeof createBuilder>,
  at: THREE.Vector3,
  scale: [number, number, number],
  color: any,
  bone: any,
  name: string,
) {
  return bld.part(new THREE.SphereGeometry(1, 12, 8), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

export default function build() {
  const b = createBuilder({
    name: "five-headed-hydra",
    detail: 1,
    paintSize: 2048,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first: one root, a heavy spine, four legs, a barbed tail, five independent necks, and five jaws.

  const hips = b.joint("hips", {
    at: [0, 1.18, -0.42],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, -1.45],
      [0, 1.18, -0.82],
      [0, 1.28, -0.15],
      [0, 1.4, 0.56],
      [0, 1.48, 0.82],
    ]),
    {
      parent: hips,
      count: 5,
      names: ["spineBase", "spineRear", "spineMid", "shoulder", "chest"],
      role: "spine",
      group: "body",
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.04, -0.82],
      [0, 1.0, -1.3],
      [0, 0.91, -1.82],
      [0, 0.78, -2.3],
      [0, 0.68, -2.72],
      [0, 0.6, -3.02],
    ]),
    {
      parent: hips,
      count: 6,
      names: ["tailBase", "tail2", "tail3", "tail4", "tail5", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  const legDefs = [
    {
      tag: "FL",
      root: [0.47, 1.27, 0.42] as [number, number, number],
      target: [0.76, 0.2, 0.67] as [number, number, number],
      parent: spine.joints[3],
    },
    {
      tag: "FR",
      root: [-0.47, 1.27, 0.42] as [number, number, number],
      target: [-0.76, 0.2, 0.67] as [number, number, number],
      parent: spine.joints[3],
    },
    {
      tag: "HL",
      root: [0.49, 1.13, -0.68] as [number, number, number],
      target: [0.79, 0.2, -0.98] as [number, number, number],
      parent: spine.joints[1],
    },
    {
      tag: "HR",
      root: [-0.49, 1.13, -0.68] as [number, number, number],
      target: [-0.79, 0.2, -0.98] as [number, number, number],
      parent: spine.joints[1],
    },
  ];

  const legs = legDefs.map((d) => {
    const points = limb(
      d.root,
      d.target,
      [0.5, 0.52, 0.36],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const chain = b.chain(`leg${d.tag}`, points, {
      parent: d.parent,
      count: 4,
      names: [`hip${d.tag}`, `knee${d.tag}`, `ankle${d.tag}`, `paw${d.tag}`],
      role: "leg",
      contact: d.target,
      group: "limbs",
    });
    return { ...d, chain };
  });

  const neckDefs = [
    {
      tag: "L2",
      points: [
        [0.53, 1.5, 0.54],
        [0.79, 2.0, 0.68],
        [0.98, 2.57, 0.9],
        [1.02, 3.08, 1.1],
      ],
      headDir: [0.3, 0, 1] as [number, number, number],
    },
    {
      tag: "L1",
      points: [
        [0.27, 1.55, 0.61],
        [0.41, 2.12, 0.82],
        [0.38, 2.7, 1.12],
        [0.3, 3.38, 1.36],
      ],
      headDir: [0.16, 0, 1] as [number, number, number],
    },
    {
      tag: "C",
      points: [
        [0, 1.58, 0.65],
        [-0.03, 2.18, 0.88],
        [0, 2.78, 1.2],
        [0, 3.52, 1.5],
      ],
      headDir: [0, 0, 1] as [number, number, number],
    },
    {
      tag: "R1",
      points: [
        [-0.27, 1.55, 0.61],
        [-0.41, 2.12, 0.82],
        [-0.38, 2.7, 1.12],
        [-0.3, 3.38, 1.36],
      ],
      headDir: [-0.16, 0, 1] as [number, number, number],
    },
    {
      tag: "R2",
      points: [
        [-0.53, 1.5, 0.54],
        [-0.79, 2.0, 0.68],
        [-0.98, 2.57, 0.9],
        [-1.02, 3.08, 1.1],
      ],
      headDir: [-0.3, 0, 1] as [number, number, number],
    },
  ];

  const neckRecords = neckDefs.map((d) => {
    const neck = b.chain(`neck${d.tag}`, catmull(d.points), {
      parent: spine.joints[4],
      count: 4,
      names: [
        `neck${d.tag}Base`,
        `neck${d.tag}Mid`,
        `neck${d.tag}Upper`,
        `neck${d.tag}Tip`,
      ],
      role: "neck",
      group: "necks",
    });

    const head = b.joint(`head${d.tag}`, {
      parent: neck.tip!,
      at: neck.at(1).at,
      dir: d.headDir,
      role: "head",
      group: "heads",
    });

    const jaw = b.joint(`jaw${d.tag}`, {
      parent: head,
      at: head.local({ forward: 0.16, down: 0.19 }),
      dir: head.dir([0, -0.35, 0.95]),
      role: "jaw",
      group: "heads",
    });

    return { ...d, neck, head, jaw };
  });

  // -------------------------------------------------------------------------------------------------------------
  // Core body, tail, and leg masses.

  const bodySweep = b.sweep(
    spine,
    (t) => 0.39 + 0.105 * Math.sin(Math.min(1, t) * Math.PI * 0.9),
    {
      color: COAT,
      shift: [0, -0.045],
      section: { ngon: 8 },
      caps: "round",
      sectors: [[122, 238, BELLY]],
      group: "body",
      name: "armored-torso",
    },
  );

  const tailSweep = b.sweep(
    tail,
    (t) => 0.27 * (1 - t) + 0.045,
    {
      color: gradient(COAT, DEEP_RED, tail.at(0).at, tail.at(1).at),
      shift: [0, -0.015],
      section: { ngon: 7 },
      caps: { start: "round", end: "point" },
      sectors: [[125, 235, BELLY]],
      group: "tail",
      name: "barbed-tail",
    },
  );

  const legSweeps = legs.map((leg) =>
    b.sweep(
      leg.chain,
      (t) => (t < 0.62 ? 0.155 - t * 0.025 : 0.13 + (t - 0.62) * 0.055),
      {
        color: COAT,
        shift: [0, -0.015],
        section: { ngon: 6 },
        caps: "round",
        sectors: [[125, 235, BELLY]],
        group: "limbs",
        name: `muscular-leg-${leg.tag}`,
      },
    ),
  );

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    const sweep = legSweeps[i];
    const paw = leg.chain.tip!;
    const side = leg.tag.endsWith("L") ? 1 : -1;
    const front = leg.tag.startsWith("F");

    lowSphere(b, paw.at, [0.2, 0.14, 0.28], COAT, paw, `paw-${leg.tag}`);

    const knee = sweep.at(0.36, 0);
    b.stick(
      new THREE.CylinderGeometry(0.17, 0.18, 0.055, 8),
      PLATE,
      knee,
      {
        embed: 0.42,
        spin: side * 18,
        flat: true,
        group: "limbs",
        name: `knee-guard-${leg.tag}`,
      },
    );

    const ankle = sweep.at(0.72, 0);
    b.stick(
      new THREE.CylinderGeometry(0.1, 0.11, 0.038, 7),
      BRONZE,
      ankle,
      {
        embed: 0.45,
        spin: side * 28,
        flat: true,
        group: "limbs",
        name: `ankle-band-${leg.tag}`,
      },
    );

    for (let toe = -1; toe <= 1; toe++) {
      const base = add(paw.at, toe * 0.075, -0.055, front ? 0.13 : 0.1);
      const tip = add(
        paw.at,
        toe * 0.088,
        -0.15,
        front ? 0.34 : 0.27,
      );
      b.spike(base, tip, null, 0.034, {
        color: CLAW,
        bone: paw,
        caps: "point",
        group: "claws",
        name: `claw-${leg.tag}-${toe + 1}`,
      });
    }
  }

  // Broad belly armor plates, deliberately chunky and faceted.
  const bellySurface = b.surface(bodySweep);
  for (const t of [0.12, 0.27, 0.42, 0.57, 0.72, 0.87]) {
    const hit = bodySweep.at(t, 180);
    b.stick(
      new THREE.CapsuleGeometry(0.11 - 0.035 * t, 0.028, 2, 6),
      BELLY,
      hit,
      {
        embed: 0.55,
        flow: [0, 0, 1],
        spin: 90,
        flat: true,
        group: "armor",
        name: `belly-plate-${Math.round(t * 100)}`,
      },
    );
  }

  // Back ridge and tail barbs.
  for (const t of [0.08, 0.2, 0.33, 0.47, 0.61, 0.75, 0.88]) {
    const ridge = bodySweep.at(t, 0);
    b.spike(ridge, ridge, 0.16 - 0.045 * t, 0.052 - 0.014 * t, {
      color: PLATE,
      group: "body",
      name: `dorsal-spine-${Math.round(t * 100)}`,
    });
  }

  for (const t of [0.15, 0.29, 0.44, 0.59, 0.73, 0.86]) {
    const barb = tailSweep.at(t, 0);
    b.spike(barb, barb, 0.12 - t * 0.045, 0.042 - t * 0.019, {
      color: HORN,
      group: "tail",
      name: `tail-spike-${Math.round(t * 100)}`,
    });
  }

  const tailTip = tail.tip!;
  const tailRattle = b.ring(
    tailTip,
    {
      count: 6,
      radius: 0.085,
      fromDeg: 0,
      toDeg: 360,
      group: "tail",
      role: "fan",
      name: "tail-rattle",
    },
    (item) =>
      b.spike(item, item, 0.16, 0.038, {
        color: HORN,
        caps: "point",
        group: "tail",
        name: `tail-rattle-spike-${item.i}`,
      }),
  );

  // -------------------------------------------------------------------------------------------------------------
  // Neck tubes, throat color, fins, collars, and scales.

  const neckWithSweeps = neckRecords.map((record) => {
    const sweep = b.sweep(
      record.neck,
      (t) => 0.26 - 0.075 * t,
      {
        color: COAT,
        shift: [0, -0.02],
        section: { ngon: 7 },
        caps: "round",
        sectors: [[120, 240, THROAT]],
        group: "necks",
        name: `scaled-neck-${record.tag}`,
      },
    );

    const liftedEdge = catmull(
      record.points.map((p, i) => [
        p[0],
        p[1] + 0.12 + 0.04 * Math.sin(i),
        p[2] - 0.14,
      ]),
    );

    b.membrane(record.neck, liftedEdge, {
      color: FRILL,
      thickness: 0.018,
      rows: 5,
      cols: 7,
      scallop: 0.16,
      bone: record.neck.joints[0],
      group: "neck-fins",
      name: `crimson-neck-fin-${record.tag}`,
    });

    for (const t of [0.18, 0.36, 0.55, 0.74, 0.9]) {
      const ridge = sweep.at(t, 0);
      b.spike(ridge, ridge, 0.13 - 0.04 * t, 0.042 - 0.012 * t, {
        color: PLATE,
        group: "necks",
        name: `neck-ridge-${record.tag}-${Math.round(t * 100)}`,
      });
    }

    const neckSurface = b.surface(sweep);
    const collar = neckSurface.loop(record.neck.joints[2], { lift: 0.012 });
    b.sweep(collar, 0.029, {
      color: BRONZE,
      caps: "none",
      group: "armor",
      name: `neck-collar-${record.tag}`,
    });

    b.along(collar, 8, (at) =>
      b.stick(
        new THREE.SphereGeometry(0.036, 6, 4),
        BONE,
        at,
        {
          embed: 0.55,
          group: "armor",
          name: `neck-collar-rivet-${record.tag}-${at.i}`,
        },
      ),
    );

    const neckScales = neckSurface.scatter(9, {
      rng: rng(200 + record.tag.charCodeAt(0)),
      minDist: 0.105,
      filter: (h) => h.n.y > -0.15,
    });

    for (const [i, hit] of neckScales.entries()) {
      b.stick(
        new THREE.ConeGeometry(0.065, 0.028, 6),
        PLATE,
        hit,
        {
          embed: 0.62,
          flow: [0, 0, 1],
          spin: i * 31,
          flat: true,
          group: "scales",
          name: `neck-scale-${record.tag}-${i}`,
        },
      );
    }

    return { ...record, sweep };
  });

  // Scattered shoulder plates add a hand-built, brutal armor silhouette.
  const shoulderScales = bellySurface.scatter(38, {
    rng: rng(713),
    minDist: 0.135,
    filter: (h) => h.n.y > 0.05 && h.at.z > -0.7,
  });

  for (const [i, hit] of shoulderScales.entries()) {
    b.stick(
      new THREE.ConeGeometry(0.074, 0.035, 6),
      i % 4 === 0 ? BRONZE : PLATE,
      hit,
      {
        embed: 0.6,
        flow: [0, 0, 1],
        spin: i * 23,
        flat: true,
        group: "scales",
        name: `shoulder-scale-${i}`,
      },
    );
  }

  // A huge diagonal scar across the flank.
  const scarHit = bellySurface.around(bodySweep.at(0.52).at).at(90, 8);
  if (scarHit) {
    b.decal(bodySweep, SCAR_TEXTURE, {
      at: scarHit,
      size: [0.42, 0.2],
      dir: scarHit.n,
      up: [0, 1, 0],
      lift: 0.004,
      segments: 8,
      group: "scars",
      name: "flank-scar",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Five heads. Each gets a skull, cheek masses, separate upper and lower jaws, teeth, tongue, horns, eyes, and runes.

  const headMeshes = neckWithSweeps.map((record) => {
    const { head, jaw, tag } = record;

    const skull = lowSphere(
      b,
      head.at,
      [0.39, 0.36, 0.48],
      HEAD_COAT,
      head,
      `skull-${tag}`,
    );

    const cheekL = head.local([-0.24, 0.03, -0.025]);
    const cheekR = head.local([0.24, 0.03, -0.025]);

    lowSphere(b, cheekL, [0.18, 0.23, 0.25], HEAD_COAT, head, `cheek-a-${tag}`);
    lowSphere(b, cheekR, [0.18, 0.23, 0.25], HEAD_COAT, head, `cheek-b-${tag}`);

    const upperBase = head.local([0, 0.11, -0.035]);
    const upperTip = head.local([0, 0.58, -0.085]);

    const upperMuzzle = b.sweep(
      bezier(
        upperBase,
        head.local([0, 0.25, 0.015]),
        head.local([0, 0.43, -0.035]),
        upperTip,
      ),
      [0.235, 0.2, 0.145, 0.11],
      {
        bone: head,
        color: THROAT,
        section: { ngon: 6 },
        caps: { start: "round", end: "flat" },
        group: "heads",
        name: `upper-jaw-${tag}`,
      },
    );

    const lowerMuzzle = b.sweep(
      bezier(
        jaw.at,
        jaw.local([0, 0.17, 0.01]),
        jaw.local([0, 0.38, -0.015]),
        jaw.local([0, 0.56, -0.01]),
      ),
      [0.18, 0.16, 0.125, 0.075],
      {
        bone: jaw,
        color: CRIMSON,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        group: "heads",
        name: `lower-jaw-${tag}`,
      },
    );

    b.part(
      new THREE.BoxGeometry(0.32, 0.055, 0.42),
      MOUTH,
      {
        bone: head,
        at: head.local([0, 0.37, -0.125]),
        flat: true,
        group: "mouth",
        name: `open-mouth-${tag}`,
      },
    );

    const tongue = b.sweep(
      bezier(
        jaw.local([0, 0.16, 0.015]),
        jaw.local([0, 0.28, 0.025]),
        jaw.local([0, 0.42, 0.01]),
        jaw.local([0, 0.52, -0.005]),
      ),
      [0.038, 0.034, 0.025, 0.008],
      {
        bone: jaw,
        color: BLOOD,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        group: "mouth",
        name: `forked-tongue-${tag}`,
      },
    );

    for (const side of [-1, 1]) {
      const upperToothBase = head.local([side * 0.105, 0.39, -0.095]);
      b.spike(upperToothBase, [0, -1, 0], 0.13, 0.026, {
        color: CLAW,
        bone: head,
        caps: "point",
        group: "teeth",
        name: `upper-fang-${tag}-${side}`,
      });

      const lowerToothBase = jaw.local([side * 0.095, 0.31, 0.025]);
      b.spike(lowerToothBase, [0, 1, 0], 0.095, 0.022, {
        color: CLAW,
        bone: jaw,
        caps: "point",
        group: "teeth",
        name: `lower-fang-${tag}-${side}`,
      });

      const eyeAt = head.local([side * 0.175, 0.355, 0.095]);
      const eye = b.decal(skull, EYE_TEXTURE, {
        at: eyeAt,
        dir: head.dir([0, 1, 0]),
        up: [0, 1, 0],
        size: [0.145, 0.19],
        lift: 0.006,
        segments: 8,
        mirror: side > 0,
        color: "#ffffff",
        group: "eyes",
        name: `burning-eye-${tag}-${side}`,
      });
      glow(eye, 2.2);

      const browA = head.local([side * 0.105, 0.3, 0.185]);
      const browB = head.local([side * 0.27, 0.275, 0.16]);
      b.rod(browA, browB, 0.027, {
        color: INK,
        bone: head,
        caps: "round",
        group: "face",
        name: `heavy-brow-${tag}-${side}`,
      });

      const cheekPlate = head.local([side * 0.285, 0.105, -0.055]);
      b.extrude(
        [
          [0, 0],
          [0.12, 0.035],
          [0.16, 0.12],
          [0.08, 0.19],
          [0, 0.14],
        ],
        {
          at: cheekPlate,
          x: [side, 0, 0],
          y: [0, 1, 0],
          thickness: 0.025,
          bevel: 0.006,
          smoothing: 1,
          color: BONE,
          bone: head,
          group: "face-armor",
          name: `cheek-blade-${tag}-${side}`,
        },
      );
    }

    // War-paint rune on each head's outer cheek.
    const runeSide = tag === "L2" || tag === "L1" ? 1 : -1;
    const runeAt = head.local([runeSide * 0.315, 0.16, -0.025]);
    b.decal(skull, RUNE_TEXTURE, {
      at: runeAt,
      dir: head.dir([runeSide, 0, 0]),
      up: [0, 1, 0],
      size: [0.12, 0.18],
      lift: 0.006,
      segments: 7,
      mirror: runeSide < 0,
      color: "#ffffff",
      group: "war-paint",
      name: `head-rune-${tag}`,
    });

    // Two swept-back horns on every skull.
    for (const side of [-1, 1]) {
      const hornBase = head.local([side * 0.205, -0.025, 0.235]);
      const horn = bezier(
        hornBase,
        head.local([side * 0.255, -0.13, 0.39]),
        head.local([side * 0.31, -0.24, 0.59]),
        head.local([side * 0.255, -0.34, 0.77]),
      );
      b.sweep(horn, [0.068, 0.055, 0.032, 0.004], {
        bone: head,
        color: HORN,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        group: "horns",
        name: `swept-horn-${tag}-${side}`,
      });
    }

    // A jagged crown fin behind each head.
    b.extrude(
      [
        [-0.28, 0],
        [-0.2, 0.19],
        [-0.095, 0.38],
        [0, 0.55, "sharp"],
        [0.095, 0.38],
        [0.2, 0.19],
        [0.28, 0],
      ],
      {
        at: head.local([0, -0.27, 0.005]),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: [0.035, 0.012],
        bevel: 0.006,
        smoothing: 1,
        color: FRILL,
        bone: head,
        group: "head-fins",
        name: `crown-fin-${tag}`,
      },
    );

    // Small bone studs along the jaw hinge.
    const hingeLine = new THREE.Vector3(0, 0, 1);
    for (const side of [-1, 1]) {
      b.stick(
        new THREE.SphereGeometry(0.052, 7, 5),
        BONE,
        head.local([side * 0.27, 0.12, -0.11]),
        {
          embed: 0.42,
          spin: side * 20,
          group: "face-armor",
          name: `jaw-hinge-stud-${tag}-${side}`,
        },
      );
    }

    // A dark red throat ember, separately emissive from the painted flesh.
    const ember = b.part(
      new THREE.SphereGeometry(1, 8, 6),
      "#e33a23",
      {
        bone: jaw,
        at: jaw.local([0, 0.22, -0.045]),
        scale: [0.09, 0.045, 0.12],
        flat: true,
        group: "mouth",
        name: `throat-ember-${tag}`,
      },
    );
    glow(ember, 1.5);

    // One little scar decal under the dominant eye.
    const scarSide = tag === "L2" || tag === "L1" ? -1 : 1;
    const scarAt = head.local([scarSide * 0.25, 0.29, -0.045]);
    b.decal(skull, SCAR_TEXTURE, {
      at: scarAt,
      dir: head.dir([scarSide * 0.7, 0.65, 0]),
      up: [0, 1, 0],
      size: [0.13, 0.07],
      lift: 0.005,
      segments: 6,
      mirror: scarSide > 0,
      color: "#ffffff",
      group: "scars",
      name: `facial-scar-${tag}`,
    });

    return { ...record, skull, upperMuzzle, lowerMuzzle };
  });

  // -------------------------------------------------------------------------------------------------------------
  // Chest emblem and a final set of hard armor accents.

  const chestHit = bellySurface.around(bodySweep.at(0.72).at).at(0, 12);
  if (chestHit) {
    b.decal(bodySweep, EMBLEM_TEXTURE, {
      at: chestHit,
      dir: chestHit.n,
      up: [0, 1, 0],
      size: [0.32, 0.32],
      lift: 0.006,
      segments: 10,
      group: "emblem",
      name: "fivefold-chest-emblem",
    });
  }

  // Shoulder horns point out from the upper torso, framing the neck forest.
  for (const side of [-1, 1]) {
    const base = bodySweep.at(0.74, side * 70);
    b.spike(base, base, 0.23, 0.078, {
      color: HORN,
      group: "shoulders",
      name: `shoulder-horn-${side}`,
    });

    const second = bodySweep.at(0.88, side * 70);
    b.spike(second, second, 0.17, 0.06, {
      color: BONE,
      group: "shoulders",
      name: `shoulder-horn-inner-${side}`,
    });
  }

  // Low-poly bronze rivets around the hip armor.
  const hipLoop = bellySurface.loop(spine.joints[1], {
    lift: 0.015,
  });
  b.sweep(hipLoop, 0.022, {
    color: BRONZE,
    caps: "none",
    group: "armor",
    name: "hip-armor-rim",
  });

  b.along(hipLoop, 14, (at) =>
    b.stick(
      new THREE.SphereGeometry(0.028, 6, 4),
      BONE,
      at,
      {
        embed: 0.52,
        group: "armor",
        name: `hip-rivet-${at.i}`,
      },
    ),
  );

  return b.root;
}
