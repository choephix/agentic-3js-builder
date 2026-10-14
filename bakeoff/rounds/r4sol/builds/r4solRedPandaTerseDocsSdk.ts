import * as THREE from "three";
import {
  createBuilder,
  bezier,
  catmull,
  countershade,
  grain,
  rng,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Red Panda",
  description:
    "A little russet red panda with an ivory face, fluffy triangular ears, dark stocking legs, and a long, boldly ringed tail. Built in a neutral quadrupedal pose with a complete articulated skeleton.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda", detail: 1, paintSize: 1024 });

  const UNIT = 0.84;
  const m = (n: number) => n * UNIT;
  const P = (x: number, y: number, z: number): [number, number, number] => [
    m(x),
    m(y),
    m(z),
  ];

  const C = {
    rust: "#b94e2c",
    copper: "#ca6335",
    darkRust: "#903b27",
    tailDark: "#9c432b",
    tailLight: "#dfa060",
    tailTip: "#edba79",
    dark: "#352725",
    paw: "#302727",
    toe: "#3f302b",
    cream: "#efdfc2",
    creamShade: "#dcc5a5",
    ear: "#633b32",
    earSoft: "#b38064",
    nose: "#251e1d",
    eye: "#191a19",
    iris: "#86552e",
    glint: "#fff3d9",
    claw: "#a69883",
    whisker: "#e3d6bb",
  };

  // Skeleton first: a horizontal spine, four planted limbs, and an
  // independently articulated head, jaw, ears, toes, and extended tail.
  const hips = b.joint("hips", {
    at: P(0, 0.275, -0.225),
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [hips, P(0, 0.29, -0.035), P(0, 0.3, 0.155)],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    [spine.tip!, P(0, 0.348, 0.251), P(0, 0.389, 0.355)],
    { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neck.at(1),
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ down: m(0.069), forward: m(0.052) }),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears = [1, -1].map((s) => ({
    s,
    joint: b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: head.local({
        left: s * m(0.088),
        up: m(0.075),
        back: m(0.017),
      }),
      dir: [0, 1, 0],
      role: "hinge",
    }),
  }));

  const tail = b.chain(
    "tail",
    [
      hips.moved({ back: m(0.07) }),
      P(0, 0.281, -0.412),
      P(0.008, 0.274, -0.53),
      P(0.022, 0.269, -0.648),
      P(0.035, 0.281, -0.766),
      P(0.042, 0.306, -0.881),
      P(0.035, 0.339, -0.994),
    ],
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tailTip"],
      role: "tail",
    },
  );

  type Joint = ReturnType<typeof b.joint>;
  type Chain = ReturnType<typeof b.chain>;
  const legs: {
    chain: Chain;
    paw: Joint;
    hind: boolean;
    suffix: string;
    toes: { chain: Chain; tip: Joint }[];
  }[] = [];

  for (const hind of [true, false]) {
    for (const s of [1, -1]) {
      const suffix = `${hind ? "H" : "F"}${s > 0 ? "L" : "R"}`;
      const points = hind
        ? [
            hips.moved({ left: s * m(0.112), up: m(0.002) }),
            P(s * 0.138, 0.181, -0.184),
            P(s * 0.138, 0.098, -0.247),
            P(s * 0.14, 0.043, -0.228),
            P(s * 0.14, 0.032, -0.195),
          ]
        : [
            spine.tip!.moved({ left: s * m(0.104), down: m(0.006) }),
            P(s * 0.135, 0.183, 0.161),
            P(s * 0.14, 0.076, 0.184),
            P(s * 0.14, 0.032, 0.223),
          ];

      const chain = b.chain(`leg${suffix}`, points, {
        parent: hind ? hips : spine.tip!,
        names: hind
          ? [`hip${suffix}`, `knee${suffix}`, `hock${suffix}`, `ankle${suffix}`, `paw${suffix}`]
          : [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`, `paw${suffix}`],
        role: "leg",
        contact: P(s * 0.14, 0, hind ? -0.195 : 0.223),
      });

      const paw = chain.tip!;
      const toes: { chain: Chain; tip: Joint }[] = [];

      for (let i = 0; i < 4; i++) {
        const dx = (i - 1.5) * 0.021;
        const toe = b.chain(
          `toe${suffix}${i + 1}`,
          [
            paw.moved({
              left: m(dx),
              down: m(0.015),
              forward: m(0.027),
            }),
            paw.moved({
              left: m(dx * 1.18),
              down: m(0.017),
              forward: m(0.069 - Math.abs(i - 1.5) * 0.004),
            }),
          ],
          {
            parent: paw,
            names: [`toe${suffix}${i + 1}`, `toeTip${suffix}${i + 1}`],
            role: "digit",
          },
        );
        toes.push({ chain: toe, tip: toe.tip! });
      }
      legs.push({ chain, paw, hind, suffix, toes });
    }
  }

  // The main coat stays a few big, readable volumes. Fine streaks suggest
  // coarse fur without replacing the faceted silhouette.
  const coat = countershade(
    grain("#b74b29", "#c45c31", {
      size: m(0.011),
      axis: "z",
      seed: 31,
    }),
    C.dark,
    { level: -0.25, soft: 0.28 },
  );

  const torso = b.loft(
    [
      { at: hips.moved({ back: m(0.082), down: m(0.008) }), w: m(0.194), h: m(0.186) },
      { at: hips, w: m(0.295), h: m(0.247) },
      { at: spine.at(0.48), w: m(0.286), h: m(0.257) },
      { at: spine.at(1), w: m(0.245), h: m(0.229) },
      { at: neck.at(0.5), w: m(0.179), h: m(0.162) },
      { at: neck.at(0.9), w: m(0.118), h: m(0.112) },
    ],
    {
      bone: [hips, spine, neck],
      color: coat,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "russetCoat",
    },
  );

  b.sweep(tail, [m(0.058), m(0.069), m(0.064), m(0.059), m(0.049), m(0.034), 0], {
    sides: 10,
    smooth: false,
    caps: { start: "flat", end: "point" },
    bands: [
      [0.09, C.rust],
      [0.165, C.tailLight],
      [0.245, C.tailDark],
      [0.325, C.tailLight],
      [0.405, C.tailDark],
      [0.485, C.tailLight],
      [0.565, C.tailDark],
      [0.645, C.tailLight],
      [0.725, C.tailDark],
      [0.805, C.tailLight],
      [0.875, C.tailDark],
      [1, C.tailTip],
    ],
    color: C.rust,
    name: "sixRingBrushTail",
  });

  for (const leg of legs) {
    b.sweep(
      leg.chain,
      leg.hind
        ? [m(0.068), m(0.052), m(0.034), m(0.029), m(0.027)]
        : [m(0.053), m(0.041), m(0.029), m(0.027)],
      {
        color: C.dark,
        bands: leg.hind ? [[0.22, C.darkRust], [1, C.dark]] : undefined,
        sides: 8,
        smooth: false,
        caps: "round",
        name: `stocking${leg.suffix}`,
      },
    );

    // Flat lower faces of these horizontal tubes meet the floor.
    b.sweep(
      [
        leg.paw.moved({ back: m(0.025), down: m(0.002) }),
        leg.paw.moved({ forward: m(0.014), down: m(0.002) }),
      ],
      () => [m(0.04), m(0.03)],
      {
        bone: leg.paw,
        color: C.paw,
        sides: 8,
        smooth: false,
        caps: "round",
        name: `softPaw${leg.suffix}`,
      },
    );

    for (const toe of leg.toes) {
      b.sweep(toe.chain, [m(0.012), m(0.01)], {
        sides: 6,
        color: C.toe,
        smooth: false,
        caps: "round",
      });

      b.sweep(
        bezier(
          toe.tip,
          toe.tip.moved({ up: m(0.006), forward: m(0.011) }),
          toe.tip.moved({ down: m(0.006), forward: m(0.023) }),
        ),
        [m(0.0045), 0],
        {
          bone: toe.tip,
          color: C.claw,
          sides: 5,
          smooth: false,
          caps: { start: "flat", end: "point" },
          name: "smallCurvedClaw",
        },
      );
    }
  }

  // A broad, slightly oversized head gives the puppet its gentle character.
  const face = b.region({ at: head, scale: UNIT, bone: head });
  const skull = face.part(new THREE.SphereGeometry(1, 14, 10), C.rust, {
    at: [0, 0, 0],
    scale: [0.127, 0.102, 0.107],
    flat: true,
    name: "broadRedPandaHead",
  });
  const skullSurface = b.surface(skull);

  const mask = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 224">
      <g fill="#efdfc2">
        <path d="M24 79 C30 53 53 40 76 48 C91 53 98 70 85 86
                 C63 76 47 71 24 79Z"/>
        <path d="M232 79 C226 53 203 40 180 48 C165 53 158 70 171 86
                 C193 76 209 71 232 79Z"/>
        <path d="M23 98 L43 90 C57 101 62 119 83 133 L107 171
                 C89 188 60 184 39 164 L22 143 L27 133 L17 121Z"/>
        <path d="M233 98 L213 90 C199 101 194 119 173 133 L149 171
                 C167 188 196 184 217 164 L234 143 L229 133 L239 121Z"/>
      </g>
      <g fill="#873b29">
        <path d="M51 89 C60 89 66 96 67 108 C69 122 77 136 88 143
                 L80 154 C61 143 51 121 48 105Z"/>
        <path d="M205 89 C196 89 190 96 189 108 C187 122 179 136 168 143
                 L176 154 C195 143 205 121 208 105Z"/>
      </g>
      <g fill="#d67843">
        <path d="M111 23 L120 18 L119 43 L112 54Z"/>
        <path d="M128 16 L137 22 L135 49 L127 57Z"/>
        <path d="M144 28 L151 35 L145 57 L139 61Z"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  b.decal(skull, mask, {
    at: head.moved({ forward: m(0.13) }),
    dir: [0, 0, 1],
    size: [m(0.234), m(0.177)],
    segments: 16,
    lift: m(0.001),
    name: "ivoryMaskAndRussetTears",
  });

  const cheekOutline: OutlinePoint[] = [
    [-0.022, 0.017],
    [0.01, 0.026],
    [0.041, 0.015],
    [0.062, 0.001, "sharp"],
    [0.049, -0.009],
    [0.061, -0.026, "sharp"],
    [0.035, -0.029],
    [0.043, -0.043, "sharp"],
    [0.012, -0.04],
    [-0.02, -0.017],
  ];

  for (const s of [1, -1]) {
    const cheekRoot = skullSurface.nearest(face.p([s * 0.088, -0.03, 0.082]));
    b.extrude(
      cheekOutline.map(([x, y, sharp]) =>
        sharp ? [m(x), m(y), sharp] : [m(x), m(y)],
      ) as OutlinePoint[],
      {
        at: cheekRoot,
        x: [s, 0, -0.34],
        y: [0, 1, 0],
        thickness: m(0.028),
        bevel: m(0.003),
        smoothing: 0,
        color: C.cream,
        bone: head,
        name: s > 0 ? "cheekFluffL" : "cheekFluffR",
      },
    );
  }

  const earOutline: OutlinePoint[] = [
    [-0.043, -0.01],
    [-0.041, 0.027],
    [-0.014, 0.077],
    [0.015, 0.086],
    [0.041, 0.047],
    [0.048, 0.004],
    [0.025, -0.02],
    [-0.021, -0.018],
  ];
  const earCream: OutlinePoint[] = [
    [-0.032, -0.004],
    [-0.031, 0.025],
    [-0.011, 0.064],
    [0.014, 0.071],
    [0.033, 0.036],
    [0.036, 0.008],
    [0.015, -0.009],
    [-0.016, -0.007],
  ];
  const earInner: OutlinePoint[] = [
    [-0.019, 0.004],
    [-0.021, 0.025],
    [-0.007, 0.052],
    [0.009, 0.056],
    [0.024, 0.03],
    [0.023, 0.011],
    [0.007, 0.002],
  ];

  for (const ear of ears) {
    const outer = b.extrude(
      earOutline.map(([x, y]) => [m(x), m(y)] as [number, number]),
      {
        at: ear.joint,
        x: [ear.s, 0, 0],
        y: [0, 1, 0],
        thickness: m(0.033),
        bevel: m(0.004),
        smoothing: 1,
        color: C.darkRust,
        bone: ear.joint,
        name: `rustEar${ear.s > 0 ? "L" : "R"}`,
      },
    );

    const creamHit = b.surface(outer).ray(
      ear.joint.local({ up: m(0.036), forward: m(0.15) }),
      [0, 0, -1],
    )!;
    const cream = b.extrude(
      earCream.map(([x, y]) => [m(x), m(y - 0.036)] as [number, number]),
      {
        at: creamHit,
        x: [ear.s, 0, 0],
        y: [0, 1, 0],
        thickness: m(0.006),
        bevel: m(0.001),
        smoothing: 1,
        color: C.cream,
        bone: ear.joint,
        name: "fluffyIvoryEarRim",
      },
    );

    const innerHit = b.surface(cream).ray(
      ear.joint.local({ up: m(0.033), forward: m(0.15) }),
      [0, 0, -1],
    )!;
    b.extrude(
      earInner.map(([x, y]) => [m(x), m(y - 0.033)] as [number, number]),
      {
        at: innerHit,
        x: [ear.s, 0, 0],
        y: [0, 1, 0],
        thickness: m(0.004),
        smoothing: 1,
        color: C.ear,
        bone: ear.joint,
        name: "warmDarkEarInterior",
      },
    );

    // A small pale tuft breaks the lower edge of each inner ear.
    b.extrude(
      [
        [m(-0.018), m(-0.021)],
        [m(-0.02), m(-0.007)],
        [m(-0.009), m(-0.012)],
        [m(-0.003), m(0.001)],
        [m(0.004), m(-0.013)],
        [m(0.015), m(-0.005)],
        [m(0.018), m(-0.022)],
      ],
      {
        at: innerHit,
        x: [ear.s, 0, 0],
        y: [0, 1, 0],
        thickness: m(0.006),
        color: C.creamShade,
        bone: ear.joint,
        name: "innerEarTuft",
      },
    );
  }

  const upperMuzzle = b.loft(
    [
      { at: face.p([0, -0.036, 0.067]), w: m(0.112), h: m(0.061) },
      { at: face.p([0, -0.044, 0.105]), w: m(0.11), h: m(0.047) },
      { at: face.p([0, -0.042, 0.145]), w: m(0.073), h: m(0.036) },
    ],
    {
      bone: head,
      color: C.cream,
      sides: 10,
      caps: "flat",
      smooth: false,
      name: "upperMuzzle",
    },
  );

  b.loft(
    [
      { at: jaw, w: m(0.087), h: m(0.028) },
      { at: jaw.moved({ forward: m(0.055), down: m(0.004) }), w: m(0.089), h: m(0.026) },
      { at: jaw.moved({ forward: m(0.09), down: m(0.003) }), w: m(0.058), h: m(0.022) },
    ],
    {
      bone: jaw,
      color: C.creamShade,
      sides: 8,
      caps: "round",
      smooth: false,
      name: "separateLowerJaw",
    },
  );

  const muzzleSurface = b.surface(upperMuzzle);
  const noseHit = muzzleSurface.ray(face.p([0, -0.035, 0.3]), [0, 0, -1])!;
  const nose = b.extrude(
    [
      [m(-0.023), m(0.005)],
      [m(-0.014), m(0.014)],
      [m(0.014), m(0.014)],
      [m(0.023), m(0.005)],
      [0, m(-0.013), "sharp"],
    ],
    {
      at: noseHit,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: m(0.014),
      bevel: m(0.003),
      smoothing: 1,
      color: C.nose,
      bone: head,
      name: "littleTriangleNose",
    },
  );

  b.stick(
    new THREE.SphereGeometry(m(0.0036), 6, 4),
    "#8f8073",
    b.surface(nose).nearest(face.p([-0.007, -0.025, 0.22])),
    { scale: [1.7, 0.35, 0.55], embed: 0.35, name: "noseGlint" },
  );

  b.sweep(
    muzzleSurface.drape(
      catmull([
        face.p([-0.043, -0.058, 0.122]),
        face.p([-0.023, -0.063, 0.142]),
        face.p([0, -0.065, 0.149]),
        face.p([0.023, -0.063, 0.142]),
        face.p([0.043, -0.058, 0.122]),
      ]),
      { lift: m(0.0006) },
    ),
    m(0.0016),
    { bone: head, color: C.dark, sides: 5, name: "quietSmile" },
  );
  b.sweep(
    muzzleSurface.drape(
      [face.p([0, -0.047, 0.156]), face.p([0, -0.064, 0.153])],
      { lift: m(0.0005) },
    ),
    m(0.0012),
    { bone: head, color: C.dark, sides: 5, name: "philtrum" },
  );

  for (const s of [1, -1]) {
    const eyeHit = skullSurface.nearest(face.p([s * 0.058, 0.022, 0.115]));
    const eye = b.stick(
      new THREE.SphereGeometry(m(0.0205), 10, 7),
      C.eye,
      eyeHit,
      {
        scale: [1, 0.58, 1.04],
        embed: 0.55,
        name: s > 0 ? "eyeL" : "eyeR",
      },
    );
    const eyeSurface = b.surface(eye);
    const irisHit = eyeSurface.nearest(face.p([s * 0.058, 0.021, 0.22]));
    const iris = b.stick(
      new THREE.CylinderGeometry(m(0.0085), m(0.0085), m(0.0018), 10),
      C.iris,
      irisHit,
      { embed: 0.2, name: "hazelIris" },
    );

    b.stick(
      new THREE.CylinderGeometry(m(0.0066), m(0.0066), m(0.0015), 10),
      C.eye,
      b.surface(iris).nearest(face.p([s * 0.058, 0.021, 0.24])),
      { embed: 0.15, name: "roundPupil" },
    );
    b.stick(
      new THREE.SphereGeometry(m(0.004), 7, 5),
      C.glint,
      eyeSurface.nearest(face.p([s * 0.052, 0.03, 0.22])),
      { embed: 0.45, name: "brightEyeCatchlight" },
    );
    b.stick(
      new THREE.SphereGeometry(m(0.0017), 5, 4),
      C.creamShade,
      eyeSurface.nearest(face.p([s * 0.064, 0.015, 0.22])),
      { embed: 0.45, name: "smallEyeCatchlight" },
    );

    for (let i = 0; i < 3; i++) {
      const dotHit = muzzleSurface.nearest(
        face.p([s * (0.026 + i * 0.008), -0.044 - i * 0.003, 0.148]),
      );
      b.stick(
        new THREE.CylinderGeometry(m(0.0015), m(0.0015), m(0.001), 6),
        C.darkRust,
        dotHit,
        { embed: 0.3, name: "whiskerFreckle" },
      );

      const root = muzzleSurface.nearest(
        face.p([s * 0.045, -0.052 + i * 0.009, 0.127]),
      );
      b.sweep(
        bezier(
          root,
          root.moved({
            left: s * m(0.037),
            up: m((i - 1) * 0.009),
            forward: m(0.018),
          }),
          root.moved({
            left: s * m(0.081 - Math.abs(i - 1) * 0.008),
            up: m((i - 1) * 0.023),
            forward: m(0.01),
          }),
        ),
        [m(0.00095), m(0.00035)],
        {
          bone: head,
          color: C.whisker,
          sides: 5,
          caps: "flat",
          name: "ivoryWhisker",
        },
      );
    }
  }

  // Sparse, short cut-paper tufts add a fluffy edge while preserving the
  // simple low-poly body underneath.
  const furTuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
      <path fill="white" d="M5 64 L3 37 L0 23 L9 28 L11 8 L18 20
        L26 0 L26 28 L32 21 L28 48 L24 64Z"/>
    </svg>`,
    { size: 128 },
  );

  const furHits = b.surface(torso).scatter(64, {
    rng: rng(83),
    minDist: m(0.036),
    filter: (h) =>
      h.n.y > -0.05 && h.at.y > m(0.255) && h.at.z < m(0.22),
  });
  b.cards(furHits, furTuft, {
    size: [m(0.019), m(0.034)],
    lean: 75,
    bend: 20,
    flow: [0, -0.1, -1],
    vary: 0.22,
    spin: 12,
    sink: 0.14,
    color: C.copper,
    rng: rng(84),
    name: "shortRussetFurTufts",
  });

  return b.root;
}
