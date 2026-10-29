import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, rng, frame, offset, polyline, line } from "../../../../src/index";

export const meta = {
  "name": "Alebrije Jaguar-Eagle",
  "description": "A standing Oaxacan alebrije: a jaguar-bodied chimera with an eagle head, hooked beak, spread feathered wings and an up-curled plumed tail, every surface covered in hand-painted dots, chevrons and rings."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  bodyGold: "#f0a232",
  bodyOrange: "#e2622b",
  bellyCream: "#f8e8c8",
  ink: "#2a1c3a",
  wingTeal: "#2ea89b",
  wingDeep: "#1c5c74",
  wingCream: "#f3ead4",
  beakYellow: "#f5c02e",
  beakOrange: "#e0861e",
  crestRed: "#cc342c",
  plumeRed: "#d94a30",
  eyeWhite: "#fdf9ec",
  irisAmber: "#f7a01b",
  clawIvory: "#efe4cd",
  pawRose: "#c96a7a",
  dotMagenta: "#c34f92",
  dotGreen: "#4f9c46",
  dotBlue: "#3a6fc6",
  dotSun: "#f4d93a",
  tongueRed: "#b73b40",
};
const M = {
  neckBase: [0, 1.42, 0.95] as [number, number, number],
  headSocket: [0, 1.72, 1.32] as [number, number, number],
  wingRootL: [0.32, 1.48, 0.5] as [number, number, number],
  wingRootR: [-0.32, 1.48, 0.5] as [number, number, number],
  tailBase: [0, 1.12, -0.6] as [number, number, number],
  legFL: [0.42, 1, 0.72] as [number, number, number],
  legFR: [-0.42, 1, 0.72] as [number, number, number],
  legBL: [0.5, 1.05, -0.72] as [number, number, number],
  legBR: [-0.5, 1.05, -0.72] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const gold = P.bodyGold;
  const orange = P.bodyOrange;
  const cream = P.bellyCream;
  const ink = P.ink;
  const red = P.crestRed;
  const magenta = P.dotMagenta;
  const green = P.dotGreen;
  const blue = P.dotBlue;
  const sun = P.dotSun;

  const bodyPath = catmull([
    M.tailBase,
    [0, 1.16, -0.42],
    [0, 1.20, 0.02],
    [0, 1.27, 0.48],
    M.neckBase,
  ]);

  const torso = b.sweep(bodyPath, (t) => {
    if (t < 0.18) return 0.42;
    if (t < 0.43) return 0.40;
    if (t < 0.72) return 0.37;
    return 0.34;
  }, {
    bone: [J.body, J.chest],
    section: { ngon: 10 },
    caps: "round",
    color: gold,
    sectors: [
      [118, 242, cream],
      [242, 298, cream],
    ],
    name: "torsoCoat",
    group: "torso",
  });

  const surface = b.surface(torso);

  // Warm shoulder and chest planes, kept separate so the painted wood reads in blocks.
  b.part(
    new THREE.SphereGeometry(0.39, 10, 7),
    orange,
    {
      bone: J.chest,
      at: [0, 1.28, 0.57],
      scale: [1.02, 1.08, 0.72],
      name: "torsoChestWarm",
      group: "torso",
    },
  );

  // Cream chest panel between the forelegs.
  b.part(
    new THREE.SphereGeometry(0.19, 8, 6),
    orange,
    {
      bone: J.chest,
      at: [0, 1.03, 0.79],
      scale: [0.52, 0.82, 0.20],
      name: "torsoChestPanel",
      group: "torso",
    },
  );

  const flowerCenter = surface.nearest([0, 1.08, 0.96]);
  b.stick(
    new THREE.CylinderGeometry(0.075, 0.075, 0.012, 10),
    ink,
    flowerCenter,
    { embed: 0.35, name: "torsoChestFlowerOutline", group: "torso" },
  );
  b.stick(
    new THREE.CylinderGeometry(0.046, 0.046, 0.016, 8),
    magenta,
    flowerCenter.moved([0, 0.006, 0]),
    { embed: 0.25, name: "torsoChestFlower", group: "torso" },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.stick(
      new THREE.SphereGeometry(0.018, 6, 4),
      sun,
      flowerCenter.moved([
        Math.cos(a) * 0.068,
        0.008,
        Math.sin(a) * 0.068,
      ]),
      { embed: 0.25, name: `torsoFlowerPetal${i}`, group: "torso" },
    );
  }

  // Dorsal red scalloped stripe, with a golden bead edge.
  const crestPath = catmull([
    [0, 1.47, -0.68],
    [0, 1.58, -0.28],
    [0, 1.62, 0.12],
    [0, 1.68, 0.52],
    [0, 1.67, 0.88],
  ]);
  b.sweep(crestPath, 0.075, {
    bone: [J.body, J.chest],
    section: { ngon: 6 },
    color: red,
    name: "torsoDorsalCrest",
    group: "torso",
  });
  b.along(crestPath, 11, (at) =>
    b.part(
      new THREE.SphereGeometry(0.026, 6, 4),
      sun,
      { at: at.at, bone: at.bone, name: "torsoCrestBead", group: "torso" },
    ),
  );

  // Rosettes on both upper flanks and the shoulder.
  const random = rng(1847);
  const rosetteColors = [green, blue, magenta];
  for (let i = 0; i < 24; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const z = -0.54 + random() * 1.43;
    const x = side * (0.27 + random() * 0.18);
    const y = 1.22 + random() * 0.27;
    const hit = surface.nearest([x, y, z]);
    const c = rosetteColors[i % rosetteColors.length];

    b.stick(
      new THREE.CylinderGeometry(0.064, 0.064, 0.012, 10),
      ink,
      hit,
      { embed: 0.42, name: "torsoRosetteOutline", group: "torso" },
    );
    b.stick(
      new THREE.CylinderGeometry(0.039, 0.039, 0.015, 9),
      c,
      hit.moved([0, 0.006, 0]),
      { embed: 0.30, name: "torsoRosetteCore", group: "torso" },
    );
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      b.stick(
        new THREE.SphereGeometry(0.010, 5, 3),
        i % 3 === 0 ? sun : ink,
        hit.moved([
          Math.cos(a) * 0.053,
          0.009,
          Math.sin(a) * 0.053,
        ]),
        { embed: 0.25, name: "torsoRosettePetal", group: "torso" },
      );
    }
  }

  // Painted chevrons across the haunches and shoulders.
  for (const side of [1, -1]) {
    for (let row = 0; row < 3; row++) {
      const z = -0.45 + row * 0.23;
      const a = surface.nearest([side * 0.39, 1.22 + row * 0.08, z]).at;
      const bpt = surface.nearest([side * 0.40, 1.34 + row * 0.08, z + 0.13]).at;
      const cpt = surface.nearest([side * 0.40, 1.22 + row * 0.08, z + 0.26]).at;
      b.rod(a, bpt, 0.012, { color: ink, bone: J.body, name: "torsoChevronA", group: "torso" });
      b.rod(bpt, cpt, 0.012, { color: ink, bone: J.body, name: "torsoChevronB", group: "torso" });
    }
  }

  // Short cream throat ruff under the neck: chunky wooden tufts rather than a smooth collar.
  const ruffBase = [0, 1.39, 0.88];
  for (let i = 0; i < 9; i++) {
    const x = -0.20 + i * 0.05;
    const tip = [x, 1.08 - Math.abs(x) * 0.18, 0.94 + Math.abs(x) * 0.05] as [number, number, number];
    b.spike(
      [x, 1.39, 0.88],
      tip,
      null,
      0.035,
      {
        color: cream,
        bone: J.chest,
        name: "torsoThroatTuft",
        group: "torso",
      },
    );
  }

  // Small ink collar marks at the neck socket, leaving the socket itself open.
  const collarPath = catmull([
    [-0.27, 1.48, 0.83],
    [0, 1.53, 0.91],
    [0.27, 1.48, 0.83],
  ]);
  b.sweep(collarPath, 0.014, {
    bone: J.chest,
    color: ink,
    caps: "round",
    name: "torsoNeckInk",
    group: "torso",
  });

  // A few cool painted studs along the lower belly, emphasizing the cream countershade.
  for (let i = 0; i < 7; i++) {
    const z = -0.52 + i * 0.22;
    const hit = surface.nearest([0, 0.86, z]);
    b.stick(
      new THREE.SphereGeometry(0.014, 6, 4),
      i % 2 ? blue : green,
      hit,
      { embed: 0.3, name: "torsoBellyStud", group: "torso" },
    );
  }
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const C = P as Record<string, string>;
  const neckRoot = M.neckBase ?? [0, 1.42, 0.95];
  const headSocket = M.headSocket ?? [0, 1.72, 1.32];

  const ink = C.ink;
  const cream = C.wingCream;
  const teal = C.wingTeal;
  const deep = C.wingDeep;
  const yellow = C.beakYellow;
  const orange = C.beakOrange;
  const red = C.crestRed;
  const green = C.dotGreen;
  const amber = C.irisAmber;
  const white = C.eyeWhite;
  const tongue = C.tongueRed;

  const neckPath = catmull([
    neckRoot,
    [0, 1.49, 1.08],
    [0, 1.62, 1.22],
    headSocket,
  ]);

  const neck = b.sweep(neckPath, (t) => 0.19 - 0.025 * t, {
    bone: J.neck,
    color: cream,
    sides: 8,
    bands: [
      [0.18, teal],
      [0.34, cream],
      [0.51, teal],
      [0.68, cream],
      [0.84, teal],
      [1, cream],
    ],
    caps: "round",
    name: "painted neck",
    group: "head",
  });

  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.14;
    const p = neck.at(t, 180);
    b.stick(
      new THREE.TorusGeometry(0.145 - t * 0.035, 0.009, 5, 12),
      ink,
      p,
      { embed: 0.18, name: `neckInkRing${i}`, group: "head" },
    );
  }

  const skull = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    cream,
    {
      bone: J.head,
      at: [0, 1.84, 1.49],
      scale: [0.31, 0.30, 0.38],
      name: "cream eagle skull",
      group: "head",
      flat: true,
    },
  );

  const brow = b.part(
    new THREE.SphereGeometry(1, 10, 8),
    cream,
    {
      bone: J.head,
      at: [0, 1.98, 1.57],
      scale: [0.30, 0.18, 0.28],
      name: "brow crown",
      group: "head",
      flat: true,
    },
  );

  const eyePositions = [
    [0.165, 1.88, 1.725],
    [-0.165, 1.88, 1.725],
  ];

  eyePositions.forEach((p, i) => {
    const side = i === 0 ? "L" : "R";
    const x = p[0];

    b.part(
      new THREE.SphereGeometry(1, 12, 8),
      ink,
      {
        bone: J.head,
        at: [x, p[1], p[2] - 0.012],
        scale: [0.103, 0.103, 0.025],
        name: `eyeOutline${side}`,
        group: "face",
      },
    );

    b.part(
      new THREE.CircleGeometry(0.088, 12),
      white,
      {
        bone: J.head,
        at: p,
        dir: [0, 0, 1],
        axis: "z",
        name: `eyeWhite${side}`,
        group: "face",
      },
    );

    b.part(
      new THREE.TorusGeometry(0.056, 0.012, 5, 12),
      amber,
      {
        bone: J.head,
        at: [x, p[1], p[2] + 0.006],
        dir: [0, 0, 1],
        name: `amberIris${side}`,
        group: "face",
      },
    );

    b.part(
      new THREE.CircleGeometry(0.036, 10),
      ink,
      {
        bone: J.head,
        at: [x, p[1], p[2] + 0.012],
        dir: [0, 0, 1],
        axis: "z",
        name: `eyePupil${side}`,
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.012, 7, 5),
      white,
      {
        bone: J.head,
        at: [x - 0.018, p[1] + 0.027, p[2] + 0.024],
        name: `eyeHighlight${side}`,
        group: "face",
      },
    );

    b.rod(
      [x - 0.095, 1.965, 1.73],
      [x + 0.065, 1.99, 1.75],
      0.012,
      { color: ink, bone: J.head, name: `paintedBrow${side}`, group: "face" },
    );
  });

  const cheekMarks = [
    [0.22, 1.73, 1.69],
    [0.20, 1.69, 1.68],
    [-0.22, 1.73, 1.69],
    [-0.20, 1.69, 1.68],
  ];
  cheekMarks.forEach((p, i) => {
    b.rod(
      [p[0] - Math.sign(p[0]) * 0.045, p[1] + 0.018, p[2]],
      [p[0] + Math.sign(p[0]) * 0.045, p[1] - 0.012, p[2] + 0.008],
      0.006,
      { color: ink, bone: J.head, name: `cheekChevron${i}`, group: "face" },
    );
  });

  const crest = [
    { x: -0.22, y: 1.99, z: 1.40, h: 0.34, w: 0.13 },
    { x: -0.14, y: 2.03, z: 1.37, h: 0.43, w: 0.14 },
    { x: -0.05, y: 2.05, z: 1.35, h: 0.50, w: 0.15 },
    { x: 0.05, y: 2.05, z: 1.35, h: 0.50, w: 0.15 },
    { x: 0.14, y: 2.03, z: 1.37, h: 0.43, w: 0.14 },
    { x: 0.22, y: 1.99, z: 1.40, h: 0.34, w: 0.13 },
  ];

  crest.forEach((f, i) => {
    const feather = b.extrude(
      [
        [-f.w * 0.5, 0],
        [f.w * 0.5, 0],
        [f.w * 0.32, f.h * 0.62],
        [0, f.h],
        [-f.w * 0.32, f.h * 0.62],
      ],
      {
        at: [f.x, f.y, f.z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.026,
        bevel: 0.006,
        color: red,
        bone: J.head,
        name: `crestFeather${i}`,
        group: "crest",
      },
    );

    b.rod(
      feather.local([0, f.h * 0.48, 0.018]),
      feather.local([0, f.h * 0.88, 0.018]),
      0.006,
      { color: ink, bone: J.head, name: `crestStripe${i}`, group: "crest" },
    );

    b.part(
      new THREE.CircleGeometry(0.028, 8),
      green,
      {
        bone: J.head,
        at: [f.x, f.y + f.h * 0.86, f.z + 0.018],
        dir: [0, 0, 1],
        axis: "z",
        name: `crestTip${i}`,
        group: "crest",
      },
    );
  });

  const upperBeak = b.extrude(
    [
      [-0.16, 0],
      [0.16, 0],
      [0.13, 0.11],
      [0.07, 0.22],
      [0.015, 0.33],
      [-0.035, 0.27],
      [-0.11, 0.16],
    ],
    {
      at: [0, 1.72, 1.70],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: [0.075, 0.035],
      bevel: 0.012,
      color: yellow,
      bone: J.head,
      name: "hooked upper beak",
      group: "beak",
    },
  );

  b.extrude(
    [
      [-0.105, 0],
      [0.105, 0],
      [0.08, 0.10],
      [0.015, 0.16],
      [-0.09, 0.10],
    ],
    {
      at: [0, 1.735, 1.70],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.045,
      bevel: 0.008,
      color: orange,
      bone: J.jaw,
      name: "lower orange jaw",
      group: "beak",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 8, 6),
    orange,
    {
      bone: J.head,
      at: [0, 1.78, 1.985],
      scale: [0.07, 0.06, 0.055],
      name: "beak orange hook tip",
      group: "beak",
    },
  );

  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.018, 7, 5),
      ink,
      {
        bone: J.head,
        at: [s * 0.105, 1.82, 1.825],
        name: `nostril${s > 0 ? "L" : "R"}`,
        group: "beak",
      },
    );
  }

  b.rod(
    [-0.105, 1.735, 1.705],
    [0.105, 1.735, 1.705],
    0.008,
    { color: ink, bone: J.jaw, name: "jaw seam", group: "beak" },
  );

  b.part(
    new THREE.SphereGeometry(1, 8, 5),
    tongue,
    {
      bone: J.jaw,
      at: [0, 1.735, 1.77],
      scale: [0.055, 0.018, 0.09],
      name: "tongue",
      group: "beak",
    },
  );

  const throat = [
    [0.00, 1.61, 1.54],
    [0.075, 1.63, 1.52],
    [-0.075, 1.63, 1.52],
    [0.00, 1.57, 1.48],
  ];

  throat.forEach((p, i) => {
    b.extrude(
      [
        [-0.045, 0],
        [0.045, 0],
        [0.028, 0.11],
        [0, 0.16],
        [-0.028, 0.11],
      ],
      {
        at: p,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.004,
        color: cream,
        bone: J.neck,
        name: `throatFeather${i}`,
        group: "head",
      },
    );
  });

  const foreheadDots = [
    [0, 2.075, 1.62],
    [0.09, 2.045, 1.64],
    [-0.09, 2.045, 1.64],
    [0.16, 2.005, 1.60],
    [-0.16, 2.005, 1.60],
  ];
  foreheadDots.forEach((p, i) => {
    b.part(
      new THREE.SphereGeometry(0.018, 7, 5),
      i % 2 ? green : red,
      {
        bone: J.head,
        at: p,
        name: `foreheadPaintDot${i}`,
        group: "paint",
      },
    );
  });
}
    return buildHead;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const TEAL = P.wingTeal;
  const DEEP = P.wingDeep;
  const CREAM = P.wingCream;
  const ORANGE = P.bodyOrange;
  const INK = P.ink;
  const SUN = P.dotSun;
  const MAGENTA = P.dotMagenta;

  const v = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const add = (a: THREE.Vector3, d: THREE.Vector3, n: number) =>
    a.clone().addScaledVector(d.clone().normalize(), n);

  const disk = (r: number, depth = 0.012) =>
    new THREE.CylinderGeometry(r, r, depth, 10, 1, false);

  const featherOutline = (w: number, h: number): [number, number, "sharp"][] => [
    [0, 0, "sharp"],
    [w * 0.72, h * 0.12, "sharp"],
    [w * 0.48, h * 0.72, "sharp"],
    [0, h, "sharp"],
    [-w * 0.48, h * 0.72, "sharp"],
    [-w * 0.72, h * 0.12, "sharp"],
  ];

  const creamTipOutline = (w: number, h: number): [number, number, "sharp"][] => [
    [0, h * 0.66, "sharp"],
    [w * 0.46, h * 0.59, "sharp"],
    [w * 0.28, h, "sharp"],
    [0, h * 1.08, "sharp"],
    [-w * 0.28, h, "sharp"],
    [-w * 0.46, h * 0.59, "sharp"],
  ];

  const motif = (p: THREE.Vector3, bone: any, i: number, side: number) => {
    if (i % 3 === 0) {
      b.part(new THREE.SphereGeometry(0.035, 8, 5), SUN, {
        at: p,
        bone,
        name: `wing${side > 0 ? "L" : "R"}_sun${i}`,
      });
    } else if (i % 3 === 1) {
      for (const q of [-0.045, 0.045]) {
        b.part(new THREE.SphereGeometry(0.022, 7, 5), MAGENTA, {
          at: p.clone().add(new THREE.Vector3(q, 0, 0)),
          bone,
          name: `wing${side > 0 ? "L" : "R"}_dot${i}`,
        });
      }
    } else {
      b.rod(
        p.clone().add(new THREE.Vector3(-0.06, -0.025, 0)),
        p.clone().add(new THREE.Vector3(0, 0.045, 0)),
        0.009,
        INK,
        { bone, name: `wing${side > 0 ? "L" : "R"}_chevron${i}` },
      );
      b.rod(
        p.clone().add(new THREE.Vector3(0, 0.045, 0)),
        p.clone().add(new THREE.Vector3(0.06, -0.025, 0)),
        0.009,
        INK,
        { bone, name: `wing${side > 0 ? "L" : "R"}_chevron${i}b` },
      );
    }
  };

  for (const side of [1, -1]) {
    const root = v(side > 0 ? M.wingRootL : M.wingRootR);
    const tip = v(side > 0 ? [1.35, 2.05, 0.25] : [-1.35, 2.05, 0.25]);
    const outer = v(side > 0 ? [1.84, 2.37, 0.02] : [-1.84, 2.37, 0.02]);
    const wing = side > 0 ? J.wingL : J.wingR;
    const wingTip = side > 0 ? J.wingTipL : J.wingTipR;
    const tag = side > 0 ? "L" : "R";

    const armPath = catmull([root, root.clone().add(new THREE.Vector3(side * 0.42, 0.25, -0.05)), tip]);
    const arm = b.sweep(armPath, [0.18, 0.12], {
      bone: [wing, wingTip],
      color: ORANGE,
      section: { ngon: 8 },
      name: `wing${tag}_arm`,
    });

    b.part(new THREE.SphereGeometry(0.2, 10, 7), ORANGE, {
      at: root,
      bone: wing,
      name: `wing${tag}_shoulder`,
    });

    const coverts = [
      root.clone().add(new THREE.Vector3(side * 0.16, 0.13, 0.02)),
      root.clone().add(new THREE.Vector3(side * 0.34, 0.25, 0.01)),
      root.clone().add(new THREE.Vector3(side * 0.54, 0.37, 0)),
      root.clone().add(new THREE.Vector3(side * 0.73, 0.45, -0.01)),
      root.clone().add(new THREE.Vector3(side * 0.9, 0.48, -0.02)),
    ];
    coverts.forEach((p, i) => {
      const s = 0.15 - i * 0.014;
      b.part(new THREE.SphereGeometry(s, 9, 6), TEAL, {
        at: p,
        bone: wing,
        scale: [1.35, 0.72, 0.82],
        name: `wing${tag}_covert${i}`,
      });
      b.part(new THREE.SphereGeometry(0.025, 7, 5), SUN, {
        at: p.clone().add(new THREE.Vector3(0, s * 0.65, 0.03)),
        bone: wing,
        name: `wing${tag}_covertDot${i}`,
      });
    });

    const membraneA = polyline([
      root.clone().add(new THREE.Vector3(0, 0.02, -0.12)),
      tip.clone().add(new THREE.Vector3(0, -0.09, -0.1)),
      outer.clone().add(new THREE.Vector3(0, -0.11, -0.08)),
    ]);
    const membraneB = polyline([
      root.clone().add(new THREE.Vector3(0, 0.15, 0.1)),
      tip.clone().add(new THREE.Vector3(0, 0.06, 0.1)),
      outer.clone().add(new THREE.Vector3(0, 0.02, 0.08)),
    ]);
    b.membrane(membraneA, membraneB, {
      bone: wing,
      color: DEEP,
      rows: 3,
      cols: 8,
      thickness: 0.018,
      name: `wing${tag}_underMembrane`,
    });

    for (let k = 0; k < 3; k++) {
      const a = root.clone().lerp(outer, 0.23 + k * 0.24);
      const c = a.clone().add(new THREE.Vector3(0, 0.02, 0.12));
      b.rod(a, c, 0.012, CREAM, {
        bone: wing,
        name: `wing${tag}_underChevron${k}`,
      });
    }

    const count = 8;
    for (let i = 0; i < count; i++) {
      const f = i / (count - 1);
      const base = tip.clone().add(new THREE.Vector3(
        side * (0.02 + f * 0.12),
        0.02 + f * 0.045,
        -0.08 + f * 0.14,
      ));
      const length = 0.58 + (1 - Math.abs(f - 0.48) * 1.4) * 0.34;
      const end = base.clone().add(new THREE.Vector3(
        side * (0.23 + f * 0.25),
        0.16 + f * 0.23,
        -0.16 + f * 0.28,
      ).normalize().multiplyScalar(length));
      const axis = end.clone().sub(base).normalize();
      const width = 0.14 - f * 0.018;
      const across = new THREE.Vector3(0, 0, 1);
      const featherBone = wingTip;

      b.extrude(featherOutline(width, length), {
        at: base,
        x: across,
        y: axis,
        thickness: [0.026, 0.012],
        bevel: 0.006,
        smoothing: 0,
        color: i % 2 ? TEAL : DEEP,
        bone: featherBone,
        name: `wing${tag}_flight${i}`,
      });

      const tipBase = base.clone().addScaledVector(axis, length * 0.66);
      b.extrude(creamTipOutline(width * 0.92, length * 0.34), {
        at: tipBase,
        x: across,
        y: axis,
        thickness: [0.014, 0.006],
        bevel: 0.003,
        smoothing: 0,
        color: CREAM,
        bone: featherBone,
        name: `wing${tag}_flightTip${i}`,
      });

      const stripeA = base.clone().addScaledVector(axis, 0.08);
      const stripeB = base.clone().addScaledVector(axis, length * 0.88);
      b.rod(stripeA, stripeB, 0.009, INK, {
        bone: featherBone,
        name: `wing${tag}_featherInk${i}`,
      });

      motif(
        base.clone().addScaledVector(axis, length * 0.42),
        featherBone,
        i,
        side,
      );
    }
  }
}
    return buildWings;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: any) {
  const ORANGE = P.bodyOrange;
  const GOLD = P.bodyGold;
  const TEAL = P.wingTeal;
  const INK = P.ink;
  const IVORY = P.clawIvory;
  const ROSE = P.pawRose;
  const BLUE = P.dotBlue;
  const MAGENTA = P.dotMagenta;
  const SUN = P.dotSun;

  const capsule = (
    a: any,
    c: any,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.capsule(a, c, radius, {
      color,
      bone,
      name,
      sides: 8,
      detail: 1,
    });

  const sphere = (
    at: any,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const cylinder = (
    at: any,
    radius: number,
    height: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const cone = (
    base: any,
    tip: any,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.spike(base, tip, null, radius, {
      color,
      bone,
      name,
      sides: 7,
      detail: 1,
    });

  const dot = (
    at: any,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) => sphere(at, radius, color, bone, name);

  const leg = (
    key: string,
    back: boolean,
    side: number,
    footZ: number,
  ) => {
    const hip = J[`${key}_hip`];
    const knee = J[`${key}_knee`];
    const ankle = J[`${key}_ankle`];
    const foot = J[`${key}_foot`];

    const upperRadius = back ? 0.115 : 0.095;
    const lowerRadius = back ? 0.10 : 0.082;

    capsule(
      hip.at,
      knee.at,
      upperRadius,
      ORANGE,
      hip,
      `${key}.upperOrange`,
    );
    capsule(
      knee.at,
      ankle.at,
      lowerRadius,
      GOLD,
      knee,
      `${key}.lowerGold`,
    );

    if (back) {
      sphere(
        new THREE.Vector3(hip.at.x, hip.at.y - 0.035, hip.at.z - 0.035),
        0.17,
        ORANGE,
        hip,
        `${key}.haunchCap`,
      );

      const chevronY = hip.at.y - 0.12;
      for (const s of [-1, 1]) {
        const a = new THREE.Vector3(
          hip.at.x + s * 0.095,
          chevronY + 0.025,
          hip.at.z + 0.015,
        );
        const c = new THREE.Vector3(
          hip.at.x,
          chevronY - 0.045,
          hip.at.z + 0.045,
        );
        capsule(a, c, 0.009, INK, hip, `${key}.haunchChevron${s}`);
      }
    }

    const cuffY = ankle.at.y + 0.055;
    const cuff = b.part(
      new THREE.TorusGeometry(0.093, 0.013, 6, 10),
      TEAL,
      {
        at: [ankle.at.x, cuffY, ankle.at.z],
        bone: ankle,
        name: `${key}.tealCuff`,
        flat: true,
      },
    );
    void cuff;

    for (const [i, x] of [-0.055, 0, 0.055].entries()) {
      dot(
        [ankle.at.x + x, cuffY + 0.014, ankle.at.z + 0.082],
        0.012,
        SUN,
        ankle,
        `${key}.cuffSun${i}`,
      );
    }

    for (const y of [ankle.at.y - 0.045, ankle.at.y + 0.135]) {
      b.part(
        new THREE.TorusGeometry(0.096, 0.006, 5, 10),
        INK,
        {
          at: [ankle.at.x, y, ankle.at.z],
          bone: ankle,
          name: `${key}.inkRing${y < ankle.at.y ? "Low" : "High"}`,
          flat: true,
        },
      );
    }

    const pawCenter = new THREE.Vector3(
      foot.at.x,
      0.105,
      footZ,
    );
    b.part(
      new THREE.BoxGeometry(0.22, 0.19, 0.30),
      GOLD,
      {
        at: pawCenter,
        bone: foot,
        name: `${key}.chunkyPaw`,
        flat: true,
        rotation: [0, side * -4, 0],
      },
    );

    dot(
      [pawCenter.x + side * 0.103, pawCenter.y + 0.01, pawCenter.z + 0.035],
      0.018,
      BLUE,
      foot,
      `${key}.outerBlueDot`,
    );

    const toeXs = [-0.075, -0.025, 0.025, 0.075];
    for (let i = 0; i < toeXs.length; i++) {
      const tx = pawCenter.x + toeXs[i];
      const start = new THREE.Vector3(tx, 0.105, pawCenter.z + 0.085);
      const end = new THREE.Vector3(tx, 0.095, pawCenter.z + 0.225);

      capsule(
        start,
        end,
        0.031,
        GOLD,
        foot,
        `${key}.toe${i}`,
      );

      const clawBase = new THREE.Vector3(tx, 0.095, pawCenter.z + 0.205);
      const clawTip = new THREE.Vector3(tx, 0.085, pawCenter.z + 0.285);
      cone(
        clawBase,
        clawTip,
        0.024,
        IVORY,
        foot,
        `${key}.claw${i}`,
      );

      if (!back) {
        dot(
          [tx, 0.055, pawCenter.z + 0.145],
          0.018,
          ROSE,
          foot,
          `${key}.toeBean${i}`,
        );
      }
    }

    const dewBase = new THREE.Vector3(
      pawCenter.x + side * 0.105,
      0.12,
      pawCenter.z + 0.015,
    );
    const dewTip = new THREE.Vector3(
      pawCenter.x + side * 0.16,
      0.095,
      pawCenter.z + 0.10,
    );
    capsule(
      dewBase,
      dewTip,
      0.022,
      GOLD,
      foot,
      `${key}.dewclaw`,
    );
    cone(
      dewTip,
      new THREE.Vector3(
        dewTip.x + side * 0.035,
        dewTip.y - 0.01,
        dewTip.z + 0.045,
      ),
      0.017,
      IVORY,
      foot,
      `${key}.dewclawTip`,
    );

    const sy = (knee.at.y + ankle.at.y) * 0.5;
    const sx = knee.at.x + side * 0.055;
    const sz = knee.at.z + 0.035;
    capsule(
      [sx - 0.035, sy + 0.028, sz],
      [sx, sy - 0.035, sz + 0.035],
      0.008,
      MAGENTA,
      knee,
      `${key}.shinChevronA`,
    );
    capsule(
      [sx, sy - 0.035, sz + 0.035],
      [sx + 0.035, sy + 0.028, sz],
      0.008,
      MAGENTA,
      knee,
      `${key}.shinChevronB`,
    );
  };

  leg("legFL", false, 1, 0.95);
  leg("legFR", false, -1, 0.95);
  leg("legBL", true, 1, -0.50);
  leg("legBR", true, -1, -0.50);
}
    return buildLegs;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const orange = P.bodyOrange;
  const cream = P.bellyCream;
  const red = P.crestRed;
  const magenta = P.dotMagenta;
  const green = P.dotGreen;
  const ink = P.ink;
  const sun = P.dotSun;
  const plume = P.plumeRed;
  const tailBone = J.tail1;
  const tailBones = [J.tail1, J.tail2, J.tail3];

  const tailPath = catmull(
    [
      M.tailBase,
      J.tail1.at,
      J.tail2.at,
      J.tail3.at,
      [0, 1.82, -1.42],
    ],
    { tension: 0.28 },
  );

  const tail = b.sweep(tailPath, (t: number) => {
    if (t < 0.18) return 0.18;
    if (t < 0.42) return 0.15;
    if (t < 0.7) return 0.115;
    return 0.05;
  }, {
    bone: tailBones,
    color: orange,
    bands: [
      [0.145, red],
      [0.255, orange],
      [0.37, magenta],
      [0.49, orange],
      [0.61, red],
      [0.73, orange],
      [0.84, magenta],
      [1, red],
    ],
    sectors: [
      [112, 248, cream],
    ],
    section: { ngon: 8 },
    caps: { start: "round", end: "point" },
    name: "tailCoat",
    group: "tail",
  });

  const bandSpecs = [
    [0.145, 0.18],
    [0.255, 0.15],
    [0.37, 0.13],
    [0.49, 0.105],
    [0.61, 0.082],
    [0.73, 0.064],
    [0.84, 0.052],
  ] as const;

  for (const [t, radius] of bandSpecs) {
    const center = tailPath.at(t);
    const tangent = tailPath.tangentAt(t);
    const ring = b.ring(
      frame(center, tangent, [0, 1, 0]),
      { count: 14, radius: radius + 0.004 },
    );
    b.sweep(catmull(ring.items, { closed: true }), 0.009, {
      bone: tailBones,
      color: ink,
      caps: "none",
      name: "tailBandInk",
      group: "tail-detail",
    });
  }

  const topDots = [0.105, 0.205, 0.315, 0.43, 0.55, 0.675, 0.79, 0.91];
  for (let i = 0; i < topDots.length; i++) {
    const t = topDots[i];
    const hit = tail.at(t, 0, 0.006);
    b.stick(
      new THREE.SphereGeometry(0.027, 8, 5),
      i % 2 ? green : sun,
      hit,
      { embed: 0.35, name: "tailRidgeDot", group: "tail-detail" },
    );
  }

  const tip = new THREE.Vector3(0, 1.82, -1.42);
  const featherData = [
    { s: -1, x: 0.34, h: 0.34, z: -1.43, w: 0.15 },
    { s: -1, x: 0.18, h: 0.43, z: -1.45, w: 0.15 },
    { s: 0, x: 0, h: 0.53, z: -1.46, w: 0.17 },
    { s: 1, x: 0.18, h: 0.43, z: -1.45, w: 0.15 },
    { s: 1, x: 0.34, h: 0.34, z: -1.43, w: 0.15 },
  ];

  for (let i = 0; i < featherData.length; i++) {
    const f = featherData[i];
    const base = new THREE.Vector3(f.s * f.x * 0.42, 1.76, f.z);
    const outline: [number, number, "sharp"][] = [
      [-f.w * 0.48, 0],
      [f.w * 0.5, 0.025],
      [f.w * 0.42, f.h * 0.52],
      [f.w * 0.08, f.h],
      [-f.w * 0.08, f.h * 0.82],
      [-f.w * 0.5, f.h * 0.2],
    ];

    const feather = b.extrude(outline, {
      at: base,
      x: [f.s || 1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      smoothing: 0,
      bone: J.tail3,
      color: plume,
      name: `tailPlume${i}`,
      group: "tail-plumes",
    });

    const tipAt = feather.local([0, f.h * 0.82, 0.018]);
    b.extrude(
      [
        [-f.w * 0.36, 0],
        [f.w * 0.34, 0],
        [f.w * 0.22, f.h * 0.2],
        [-f.w * 0.1, f.h * 0.29],
        [-f.w * 0.32, f.h * 0.16],
      ],
      {
        at: feather.local([0, f.h * 0.68, 0.019]),
        x: [f.s || 1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.009,
        bevel: 0.002,
        bone: J.tail3,
        color: cream,
        name: `tailPlumeTip${i}`,
        group: "tail-plumes",
      },
    );

    const stripeA = feather.local([0, 0.045, 0.03]);
    const stripeB = feather.local([0, f.h * 0.78, 0.03]);
    b.rod(stripeA, stripeB, 0.007, {
      bone: J.tail3,
      color: ink,
      caps: "flat",
      name: "plumeInkStripe",
      group: "tail-detail",
    });

    b.stick(
      new THREE.SphereGeometry(0.025, 7, 5),
      sun,
      feather.moved([0, f.h * 0.47, 0.035]),
      { embed: 0.25, name: "plumeSunDot", group: "tail-detail" },
    );
  }
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.15,0], dir: [0,0.1,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["body"], at: [0,1.25,0.55], dir: [0,0.25,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.42,0.95], dir: [0,0.5,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.72,1.32], dir: [0,0.25,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.6,1.4], dir: [0.1,-0.45,1], role: "jaw" });
  J["wingL"] = b.joint("wingL", { parent: J["chest"], at: [0.32,1.48,0.5], dir: [1,0.5,-0.15], role: "wing", group: "wings" });
  J["wingTipL"] = b.joint("wingTipL", { parent: J["wingL"], at: [1.35,2.05,0.25], dir: [1,0.25,-0.2], role: "wing", group: "wings" });
  J["wingR"] = b.joint("wingR", { parent: J["chest"], at: [-0.32,1.48,0.5], dir: [-1,0.5,-0.15], role: "wing", group: "wings" });
  J["wingTipR"] = b.joint("wingTipR", { parent: J["wingR"], at: [-1.35,2.05,0.25], dir: [-1,0.25,-0.2], role: "wing", group: "wings" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,1.12,-0.6], dir: [0,0.2,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.25,-1.05], dir: [0,0.55,-0.8], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.55,-1.35], dir: [0,1,-0.15], role: "tail" });
  J["legFL_hip"] = b.joint("legFL_hip", { parent: J["chest"], at: [0.42,1,0.72], dir: [0,-1,0.2], role: "leg", group: "legs" });
  J["legFL_knee"] = b.joint("legFL_knee", { parent: J["legFL_hip"], at: [0.44,0.6,0.6], dir: [0,-0.85,0.3], role: "leg", group: "legs" });
  J["legFL_ankle"] = b.joint("legFL_ankle", { parent: J["legFL_knee"], at: [0.46,0.32,0.78], dir: [0,-0.5,0.8], role: "leg", group: "legs" });
  J["legFL_foot"] = b.joint("legFL_foot", { parent: J["legFL_ankle"], at: [0.46,0.13,0.95], dir: [0,-0.2,1], role: "digit", group: "legs" });
  J["legFR_hip"] = b.joint("legFR_hip", { parent: J["chest"], at: [-0.42,1,0.72], dir: [0,-1,0.2], role: "leg", group: "legs" });
  J["legFR_knee"] = b.joint("legFR_knee", { parent: J["legFR_hip"], at: [-0.44,0.6,0.6], dir: [0,-0.85,0.3], role: "leg", group: "legs" });
  J["legFR_ankle"] = b.joint("legFR_ankle", { parent: J["legFR_knee"], at: [-0.46,0.32,0.78], dir: [0,-0.5,0.8], role: "leg", group: "legs" });
  J["legFR_foot"] = b.joint("legFR_foot", { parent: J["legFR_ankle"], at: [-0.46,0.13,0.95], dir: [0,-0.2,1], role: "digit", group: "legs" });
  J["legBL_hip"] = b.joint("legBL_hip", { parent: J["body"], at: [0.5,1.05,-0.72], dir: [0,-1,-0.1], role: "leg", group: "legs" });
  J["legBL_knee"] = b.joint("legBL_knee", { parent: J["legBL_hip"], at: [0.52,0.62,-0.82], dir: [0,-0.85,-0.3], role: "leg", group: "legs" });
  J["legBL_ankle"] = b.joint("legBL_ankle", { parent: J["legBL_knee"], at: [0.5,0.34,-0.68], dir: [0,-0.4,0.85], role: "leg", group: "legs" });
  J["legBL_foot"] = b.joint("legBL_foot", { parent: J["legBL_ankle"], at: [0.5,0.13,-0.5], dir: [0,-0.2,1], role: "digit", group: "legs" });
  J["legBR_hip"] = b.joint("legBR_hip", { parent: J["body"], at: [-0.5,1.05,-0.72], dir: [0,-1,-0.1], role: "leg", group: "legs" });
  J["legBR_knee"] = b.joint("legBR_knee", { parent: J["legBR_hip"], at: [-0.52,0.62,-0.82], dir: [0,-0.85,-0.3], role: "leg", group: "legs" });
  J["legBR_ankle"] = b.joint("legBR_ankle", { parent: J["legBR_knee"], at: [-0.5,0.34,-0.68], dir: [0,-0.4,0.85], role: "leg", group: "legs" });
  J["legBR_foot"] = b.joint("legBR_foot", { parent: J["legBR_ankle"], at: [-0.5,0.13,-0.5], dir: [0,-0.2,1], role: "digit", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
