```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  rng,
  grain,
  countershade,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Red Panda",
  description:
    "A little russet red panda with an ivory cheek ruff, pointed furry ears, charcoal stockings, tiny claws, and a long cinnamon-ringed tail. Fully jointed in a relaxed four-footed rest pose.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda", detail: 1, paintSize: 1024 });

  const C = {
    red: "#b64b29",
    copper: "#c66534",
    bright: "#d57842",
    darkRed: "#913b26",
    tear: "#793321",
    furBlack: "#302529",
    paw: "#281f24",
    toe: "#37282c",
    eye: "#17151a",
    iris: "#906039",
    nose: "#211d21",
    noseLight: "#655451",
    cream: "#f5e4c4",
    white: "#fff3db",
    buff: "#d9bf96",
    earDark: "#624239",
    earInner: "#b28269",
    claw: "#b7a695",
    whisker: "#e5d7bd",
  };

  const ellipsoid = (
    x: number,
    y: number,
    z: number,
    around = 10,
    rows = 6,
  ) => new THREE.SphereGeometry(1, around, rows).scale(x, y, z);

  const coat = countershade(
    grain(C.red, C.copper, { size: 0.014, axis: "z", seed: 17 }),
    C.furBlack,
    { level: -0.34, soft: 0.13 },
  );
  const tailRed = grain("#a94728", "#c46634", {
    size: 0.012,
    axis: "z",
    seed: 5,
  });
  const tailGold = grain("#dea15c", "#edbd79", {
    size: 0.012,
    axis: "z",
    seed: 5,
  });

  // Skeleton first: the two ends of the animal grow from the hips.
  const hips = b.joint("hips", {
    at: [0, 0.268, -0.18],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [hips, [0, 0.282, -0.025], [0, 0.291, 0.147]],
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [spine.tip!, [0, 0.339, 0.231], [0, 0.366, 0.278]],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck,
    at: neck.at(1),
    dir: [0, 0, 1],
    role: "head",
  });
  const H = b.region({ at: head, bone: head });

  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: H.p([0, -0.019, 0.065]),
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H.p([0, -0.044, 0.06]),
    dir: [0, 0, 1],
    role: "jaw",
  });
  const J = b.region({ at: jaw, bone: jaw });

  const ears = [1, -1].map((s) => {
    const joint = b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: H.p([s * 0.097, 0.083, -0.008]),
      dir: [0, 1, 0],
      role: "hinge",
    });
    return { s, joint, region: b.region({ at: joint, bone: joint }) };
  });

  const tail = b.chain(
    "tail",
    catmull([
      hips.local({ back: 0.06, up: 0.004 }),
      [0.005, 0.254, -0.34],
      [0.027, 0.218, -0.49],
      [0.085, 0.213, -0.636],
      [0.16, 0.239, -0.762],
      [0.224, 0.274, -0.865],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );

  const legs = [1, -1].flatMap((s) =>
    (["F", "H"] as const).map((kind) => {
      const front = kind === "F";
      const side = s === 1 ? "L" : "R";
      const suffix = `${kind}${side}`;
      const root = front
        ? [s * 0.101, 0.273, 0.133]
        : [s * 0.095, 0.264, -0.175];
      const target = front
        ? [s * 0.12, 0.043, 0.182]
        : [s * 0.112, 0.039, -0.177];

      const points = front
        ? limb(root, target, [0.132, 0.115], [0, 0, -1])
        : limb(
            root,
            target,
            [0.112, 0.091, 0.07],
            [
              [0, 0, 1],
              [0, 0, -1],
            ],
          );

      const chain = b.chain(`leg${suffix}`, points, {
        parent: front ? spine.tip! : hips,
        names: front
          ? [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`]
          : [
              `hip${suffix}`,
              `knee${suffix}`,
              `hock${suffix}`,
              `ankle${suffix}`,
            ],
        role: "leg",
        contact: [target[0], 0, target[2] + 0.035],
      });
      const ankle = chain.tip!;
      const foot = b.region({
        at: [ankle.at.x, 0.026, ankle.at.z + 0.01],
        bone: ankle,
      });
      const digits = [-0.0285, -0.0095, 0.0095, 0.0285].map(
        (dx, i) =>
          b.chain(
            `toe${suffix}${i + 1}`,
            [
              foot.p([dx, -0.011, 0.019]),
              foot.p([dx * 1.16, -0.013, 0.055]),
            ],
            {
              parent: ankle,
              names: [`toe${suffix}${i + 1}`],
              role: "digit",
            },
          ),
      );
      return { s, front, suffix, chain, ankle, foot, digits };
    }),
  );

  // Broad, deliberately simple faceted masses.
  const body = b.loft(
    [
      { at: [0, 0.265, -0.255], w: 0.135, h: 0.165 },
      { at: hips, w: 0.256, h: 0.257 },
      { at: spine.at(0.49), w: 0.259, h: 0.25 },
      { at: spine.at(1), w: 0.229, h: 0.233 },
      { at: [0, 0.309, 0.213], w: 0.15, h: 0.169 },
    ],
    {
      bone: [hips, spine],
      color: coat,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "russetBody",
    },
  );
  b.sweep(neck, [0.087, 0.08, 0.072], {
    color: C.red,
    sides: 10,
    smooth: false,
    sectors: [[105, 255, C.furBlack]],
    name: "darkThroatedNeck",
  });

  b.sweep(tail, [0.05, 0.066, 0.071, 0.069, 0.061, 0.044, 0.009], {
    sides: 10,
    smooth: false,
    caps: "round",
    bands: [
      [0.09, tailRed],
      [0.18, tailGold],
      [0.28, tailRed],
      [0.37, tailGold],
      [0.47, tailRed],
      [0.56, tailGold],
      [0.66, tailRed],
      [0.75, tailGold],
      [0.85, tailRed],
      [0.935, tailGold],
      [1, tailRed],
    ],
    name: "bushyRingedTail",
  });

  // Small low wedges read as a few locks of fur, not a shaggy particle coat.
  const furWedge = (w: number, length: number) =>
    new THREE.ConeGeometry(w, length, 4)
      .scale(1, 1, 0.3)
      .rotateX(Math.PI * 0.4);

  const locks = b.surface(body).scatter(18, {
    rng: rng(23),
    minDist: 0.048,
    filter: (h) => h.n.y > -0.12,
  });
  locks.forEach((hit, i) => {
    b.stick(furWedge(0.013, 0.042), i % 3 === 0 ? C.copper : C.red, hit, {
      flow: [0, -0.15, -1],
      embed: 0.66,
      name: `bodyFurLock${i + 1}`,
    });
  });

  for (const leg of legs) {
    const tube = b.sweep(
      leg.chain,
      leg.front ? [0.052, 0.044, 0.0285] : [0.064, 0.059, 0.038, 0.027],
      {
        sides: 8,
        smooth: false,
        caps: "round",
        bands: [
          [leg.front ? 0.19 : 0.37, C.red],
          [1, C.furBlack],
        ],
        name: `stocking${leg.suffix}`,
      },
    );

    for (const angle of [65, 115]) {
      b.stick(
        furWedge(0.017, 0.043),
        C.red,
        tube.at(leg.front ? 0.175 : 0.345, -leg.s * angle),
        {
          flow: [0, -1, -0.12],
          embed: 0.55,
          name: `furCuff${leg.suffix}${angle}`,
        },
      );
    }

    b.part(
      ellipsoid(leg.front ? 0.041 : 0.044, 0.026, 0.045),
      C.paw,
      {
        at: leg.foot.p([0, 0, 0]),
        bone: leg.ankle,
        flat: true,
        name: `paw${leg.suffix}`,
      },
    );
    leg.digits.forEach((digit, i) => {
      b.sweep(digit, [0.0124, 0.0096], {
        color: C.toe,
        sides: 6,
        smooth: false,
        caps: "round",
        name: `toeFur${leg.suffix}${i + 1}`,
      });
      const end = digit.at(1);
      b.sweep(
        bezier(
          end,
          end.local({ forward: 0.009, up: 0.001 }),
          end.local({ forward: 0.016, down: 0.004 }),
        ),
        [0.0039, 0],
        {
          color: C.claw,
          sides: 5,
          smooth: false,
          caps: "flat",
          name: `claw${leg.suffix}${i + 1}`,
        },
      );
    });
  }

  const skull = b.part(ellipsoid(0.137, 0.111, 0.105, 12, 8), C.red, {
    at: H.p([0, 0.008, 0.01]),
    bone: head,
    flat: true,
    name: "broadRedPandaHead",
  });

  // An angular white ruff widens the lower face and breaks its silhouette.
  const cheekOutline = [
    [-0.026, 0.032],
    [0.009, 0.053],
    [0.037, 0.047],
    [0.03, 0.029],
    [0.061, 0.026],
    [0.049, 0.009],
    [0.074, -0.002],
    [0.051, -0.019],
    [0.055, -0.034],
    [0.028, -0.037],
    [0.009, -0.052],
    [-0.028, -0.029],
  ];
  for (const s of [1, -1]) {
    b.extrude(cheekOutline, {
      at: H.p([s * 0.099, -0.014, 0.024]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.047,
      bevel: 0.004,
      detail: 0.5,
      color: C.buff,
      bone: head,
      name: s === 1 ? "cheekRuffL" : "cheekRuffR",
    });
    b.extrude(
      cheekOutline.map(([x, y]) => [x * 0.95, y * 0.95]),
      {
        at: H.p([s * 0.099, -0.012, 0.046]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        detail: 0.5,
        color: C.cream,
        bone: head,
        name: s === 1 ? "ivoryCheekL" : "ivoryCheekR",
      },
    );
  }

  // Painted markings follow the faceted head rather than floating over it.
  const faceMarkings = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 240">
      <defs>
        <g id="half">
          <path fill="#f5e4c4" d="M13 118 L32 96 L38 84 L52 94
            L62 114 L66 132 L86 154 L114 175 L121 192
            L91 214 L57 202 L28 182 L10 162 L25 161
            L6 143 L22 139 Z"/>
          <path fill="#fff3db" d="M22 132 L37 116 L46 111 L52 136
            L76 164 L97 177 L82 193 L48 177 L27 158 L39 159 Z"/>
          <path fill="#793321" d="M68 88 Q82 78 96 90
            L100 116 L109 138 L126 165 L107 165 L88 148
            L73 126 L66 105 Z"/>
          <path fill="#f5e4c4" d="M49 70 L54 57 Q67 44 84 49
            L99 57 L103 69 L94 80 L81 73 L67 76 L58 81 Z"/>
          <path fill="#fff3db" d="M57 65 Q69 50 82 55 L94 63
            L88 68 L73 65 L63 72 Z"/>
          <path d="M37 164 L52 178 M48 174 L63 187 M65 187 L78 194"
            fill="none" stroke="#dbc39e" stroke-width="2.7" stroke-linecap="round"/>
        </g>
      </defs>
      <path fill="#c86735" d="M103 26 L124 31 L145 18 L150 40
        L163 25 L184 31 L197 25 L188 44 L164 54 L150 66
        L132 49 L111 46 Z"/>
      <use href="#half"/>
      <use href="#half" transform="translate(300 0) scale(-1 1)"/>
    </svg>`,
    { size: 512 },
  );
  b.decal(skull, faceMarkings, {
    at: H.p([0, 0.01, 0.135]),
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.277, 0.218],
    segments: 20,
    lift: 0.00065,
    bone: head,
    name: "ivoryBrowsAndCheekMarkings",
  });

  const earOutline = [
    [-0.04, 0],
    [-0.043, 0.038],
    [-0.025, 0.08],
    [-0.002, 0.107],
    [0.019, 0.092],
    [0.043, 0.058],
    [0.05, 0.023],
    [0.027, -0.008],
    [-0.012, -0.011],
  ];
  for (const { s, joint, region: E } of ears) {
    b.extrude(earOutline, {
      at: E.p([0, 0, 0]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.031,
      bevel: 0.007,
      detail: 0.5,
      color: C.darkRed,
      bone: joint,
      name: `earBack${joint.name}`,
    });
    b.extrude(
      earOutline.map(([x, y]) => [x * 0.94, y * 0.96]),
      {
        at: E.p([0, 0.002, 0.015]),
        x: [s, 0, 0],
        thickness: 0.015,
        bevel: 0.004,
        detail: 0.5,
        color: C.white,
        bone: joint,
        name: `whiteEarRim${joint.name}`,
      },
    );
    b.extrude(
      [
        [-0.027, 0.015],
        [-0.027, 0.039],
        [-0.014, 0.068],
        [-0.001, 0.085],
        [0.017, 0.066],
        [0.034, 0.037],
        [0.03, 0.015],
        [0.006, 0.004],
      ],
      {
        at: E.p([0, 0.004, 0.026]),
        x: [s, 0, 0],
        thickness: 0.009,
        bevel: 0.002,
        detail: 0.5,
        color: C.earDark,
        bone: joint,
        name: `earCavity${joint.name}`,
      },
    );
    b.extrude(
      [
        [-0.013, 0.025],
        [-0.011, 0.045],
        [-0.001, 0.067],
        [0.015, 0.043],
        [0.021, 0.026],
        [0.004, 0.016],
      ],
      {
        at: E.p([0, 0.004, 0.032]),
        x: [s, 0, 0],
        thickness: 0.004,
        color: C.earInner,
        bone: joint,
        name: `warmEarInterior${joint.name}`,
      },
    );
    b.extrude(
      [
        [-0.027, 0.004],
        [-0.025, 0.018],
        [-0.014, 0.021],
        [-0.012, 0.039],
        [-0.002, 0.028],
        [0.008, 0.044],
        [0.013, 0.022],
        [0.028, 0.017],
        [0.024, 0.005],
        [0.002, -0.003],
      ],
      {
        at: E.p([0, 0, 0.035]),
        x: [s, 0, 0],
        thickness: 0.007,
        color: C.cream,
        bone: joint,
        name: `earFluff${joint.name}`,
      },
    );
  }

  // Small dark eyes with a restrained amber rim and two glints.
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const hit = b
      .surface(skull)
      .ray(H.p([s * 0.064, 0.042, 0.3]), [0, 0, -1])!;
    const socket = b.stick(
      ellipsoid(0.026, 0.006, 0.028),
      C.tear,
      hit,
      { embed: 0.45, name: `eyeSocket${side}` },
    );
    const socketFront = b.surface(socket).around(socket.at).at(s * 24, 14);
    const eye = b.stick(
      ellipsoid(0.0195, 0.0105, 0.022),
      C.eye,
      socketFront,
      { embed: 0.3, name: `eye${side}` },
    );
    const eyeFront = b.surface(eye).around(eye.at).at(s * 22, 10);
    const iris = b.stick(
      ellipsoid(0.0124, 0.0017, 0.0156),
      C.iris,
      eyeFront,
      { embed: 0.45, name: `amberIris${side}` },
    );
    b.stick(
      ellipsoid(0.0095, 0.002, 0.013),
      C.eye,
      b.surface(iris).around(iris.at).at(s * 22, 10),
      { embed: 0.45, name: `pupil${side}` },
    );
    b.stick(
      new THREE.SphereGeometry(0.0037, 6, 4),
      C.white,
      b.surface(eye).around(eye.at).at(s * 5, 43),
      { embed: 0.55, name: `eyeGlint${side}` },
    );
    b.stick(
      new THREE.SphereGeometry(0.0017, 5, 4),
      C.buff,
      b.surface(eye).around(eye.at).at(s * 42, -13),
      { embed: 0.6, name: `eyeSmallGlint${side}` },
    );
  }

  const muzzles = [1, -1].map((s) =>
    b.part(ellipsoid(0.043, 0.026, 0.036), C.cream, {
      at: H.p([s * 0.029, -0.02, 0.12]),
      bone: upperJaw,
      flat: true,
      name: s === 1 ? "upperMuzzleL" : "upperMuzzleR",
    }),
  );

  // The chin and inner lip ride their own opening jaw.
  b.part(ellipsoid(0.053, 0.006, 0.026), C.nose, {
    at: J.p([0, -0.0005, 0.061]),
    bone: jaw,
    name: "mouthInterior",
  });
  b.part(ellipsoid(0.052, 0.013, 0.037), C.cream, {
    at: J.p([0, -0.012, 0.06]),
    bone: jaw,
    flat: true,
    name: "lowerJawAndChin",
  });

  b.extrude(
    [
      [-0.024, 0.003],
      [-0.017, 0.011],
      [0.016, 0.011],
      [0.024, 0.003],
      [0.012, -0.01],
      [0, -0.016],
      [-0.013, -0.01],
    ],
    {
      at: H.p([0, -0.007, 0.149]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      detail: 0.5,
      color: C.nose,
      bone: upperJaw,
      name: "littleTriangularNose",
    },
  );
  b.extrude(
    [
      [-0.015, 0.004],
      [-0.009, 0.008],
      [0.007, 0.008],
      [0.013, 0.004],
      [0.002, 0.005],
    ],
    {
      at: H.p([0, -0.007, 0.1567]),
      x: [1, 0, 0],
      thickness: 0.0015,
      color: C.noseLight,
      bone: upperJaw,
      name: "noseHighlightFacet",
    },
  );

  const muzzleSurface = b.surface(muzzles);
  b.sweep(
    muzzleSurface.drape(
      [
        H.p([0, -0.02, 0.17]),
        H.p([0, -0.033, 0.168]),
        H.p([0, -0.042, 0.16]),
      ],
      { lift: 0.0007 },
    ),
    0.0015,
    { color: C.nose, bone: upperJaw, sides: 5, name: "philtrum" },
  );

  for (const s of [1, -1]) {
    b.sweep(
      muzzleSurface.drape(
        bezier(
          H.p([0, -0.041, 0.165]),
          H.p([s * 0.018, -0.049, 0.163]),
          H.p([s * 0.041, -0.041, 0.16]),
        ),
        { lift: 0.0007 },
      ),
      0.00125,
      {
        color: C.tear,
        bone: upperJaw,
        sides: 5,
        name: s === 1 ? "upperLipL" : "upperLipR",
      },
    );

    const muzzle = muzzles[s === 1 ? 0 : 1];
    for (let i = 0; i < 3; i++) {
      const root = b
        .surface(muzzle)
        .around(muzzle.at)
        .at(s * (57 + i * 5), (i - 1) * 17);
      b.stick(
        new THREE.SphereGeometry(0.00165, 5, 4),
        C.tear,
        root,
        { embed: 0.6, name: `whiskerFollicle${s === 1 ? "L" : "R"}${i}` },
      );
      b.sweep(
        bezier(
          root,
          root.local({
            left: s * 0.037,
            up: (i - 1) * 0.006,
            forward: 0.012,
          }),
          root.local({
            left: s * (0.082 + i * 0.008),
            up: (i - 1) * 0.014,
            back: 0.012 + i * 0.004,
          }),
        ),
        [0.00085, 0.00025],
        {
          color: C.whisker,
          bone: upperJaw,
          sides: 4,
          caps: "flat",
          name: `whisker${s === 1 ? "L" : "R"}${i + 1}`,
        },
      );
    }
  }

  return b.root;
}
```