```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  spiral,
  polyline,
  frame,
  rng,
  paint,
  mix,
  type Chain,
  type Joint,
  type Fill,
} from "agentic-3js-builder";

export const meta = {
  name: "Jade — Veiled Chameleon",
  description:
    "A jewel-green chameleon with a tall angular casque, independently articulated turret eyes, golden flank bars, opposed five-toed feet, and a tightly spiralled prehensile tail.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({
    name: "JadeChameleon",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(7319);

  const C = {
    green: "#69b948",
    lime: "#b9d86b",
    emerald: "#338f56",
    teal: "#287f78",
    darkTeal: "#176453",
    mint: "#c0dda1",
    gold: "#e5c05e",
    cream: "#f1dfa0",
    orange: "#c98742",
    mouth: "#234437",
    pupil: "#102923",
    glint: "#f8f1d4",
  };
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const fract = (v: number) => v - Math.floor(v);

  // Small, staggered painted scales, rather than a dense coat of geometry.
  function scaleDot(p: THREE.Vector3): number {
    const cell = 0.0041;
    const col = Math.floor(p.z / cell);
    const fy = p.y / cell + (col % 2 === 0 ? 0 : 0.5);
    const row = Math.floor(fy);
    const id = fract(Math.sin(col * 127.1 + row * 311.7) * 43758.5453);
    if (id > 0.58) return 0;
    const dz = fract(p.z / cell) - 0.5;
    const dy = fract(fy) - 0.5;
    const r = 0.11 + id * 0.12;
    return Math.hypot(dy, dz) < r ? 1 : 0;
  }

  const bodyPaint = paint((p, n) => {
    const high = clamp((p.y - 0.051) / 0.089);
    let color = mix(C.teal, C.green, clamp(high * 1.15));
    if (p.y > 0.119) color = mix(color, C.lime, (p.y - 0.119) / 0.039);
    if (n.y < -0.38 || p.y < 0.055) {
      color = mix(C.mint, C.green, clamp((n.y + 1) * 0.42));
    }

    const z = p.z + 0.0048 * Math.sin((p.y - 0.065) * 53)
      + 0.0014 * Math.sin(p.y * 177);
    const bars = [-0.069, -0.028, 0.015, 0.050];
    for (let i = 0; i < bars.length; i++) {
      const width = 0.0058 + 0.0016 * Math.sin(p.y * 67 + i * 1.4);
      if (
        Math.abs(z - bars[i]) < width &&
        p.y > 0.059 &&
        n.y > -0.65
      ) {
        color = mix(C.gold, C.cream, clamp((p.y - 0.064) / 0.09));
      }
    }

    // The slim pale lateral stripe ties the four broad vertical bars together.
    const lateral = 0.077 + 0.0025 * Math.sin(p.z * 35);
    if (
      Math.abs(p.y - lateral) < 0.00125 &&
      Math.abs(n.x) > 0.58 &&
      p.z < 0.064
    ) {
      color = mix(C.cream, C.mint, 0.35);
    }

    if (Math.abs(n.x) > 0.4 && scaleDot(p)) {
      color = mix(color, p.y > 0.11 ? C.cream : C.darkTeal, 0.29);
    }
    return color;
  });

  const headPaint = paint((p, n) => {
    let color = mix(C.green, C.lime, clamp((p.y - 0.116) / 0.064));
    if (p.y < 0.112) color = mix(C.mint, C.green, 0.3);
    const rearStripe = 0.084 + (0.174 - p.y) * 0.31;
    if (
      p.y > 0.132 &&
      Math.abs(p.z - rearStripe) < 0.0028 &&
      Math.abs(n.x) > 0.25
    ) color = mix(C.teal, C.emerald, 0.35);
    if (p.z < 0.092 && p.y < 0.138) color = mix(color, C.teal, 0.38);
    if (scaleDot(p) && Math.abs(n.x) > 0.4) color = mix(color, C.cream, 0.18);
    return color;
  });

  const limbPaint = paint((p, n) => {
    let color = mix(C.lime, C.emerald, clamp((p.y - 0.018) / 0.08));
    if (p.y < 0.026) color = mix(C.gold, C.lime, 0.7);
    if (Math.abs(n.x) > 0.4 && scaleDot(p)) color = mix(color, C.teal, 0.25);
    return color;
  });

  const tailPaint = paint((_p, _n, s) => {
    const t = s[0];
    let color = mix(C.green, "#42ad83", clamp(t * 1.25));
    const repeat = fract(t * 9.6);
    if (repeat > 0.39 && repeat < 0.55) {
      color = mix(C.gold, C.lime, clamp(t * 1.2));
    }
    if (repeat > 0.55 && repeat < 0.595) color = mix(C.teal, C.green, 0.45);
    if (t > 0.91) color = mix(color, C.lime, (t - 0.91) / 0.09);
    return color;
  });

  // ------------------------- Skeleton first -------------------------

  const hips = b.joint("hips", {
    at: [0, 0.082, -0.070],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.084, -0.073],
      [0, 0.094, -0.012],
      [0, 0.090, 0.060],
    ],
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.094, 0.066],
      [0, 0.104, 0.089],
      [0, 0.113, 0.109],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "throat"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.113, 0.109],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.104, 0.094],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "jaw",
  });

  const eyeBones = [
    b.joint("eyeL", {
      parent: head,
      at: [0.016, 0.126, 0.126],
      dir: [0.87, 0.08, 0.49],
      role: "head",
    }),
    b.joint("eyeR", {
      parent: head,
      at: [-0.016, 0.126, 0.126],
      dir: [-0.87, 0.08, 0.49],
      role: "head",
    }),
  ];

  const tailLead = catmull([
    [0, 0.078, -0.097],
    [0, 0.069, -0.125],
    [0, 0.046, -0.152],
    [0, 0.024, -0.180],
  ]);
  const tailCurl = spiral(
    [0, 0.059, -0.199],
    [0, 0.024, -0.180],
    [1, 0, 0],
    { turns: 1.43, r1: 0.0075 },
  );
  const tail = b.chain("tail", tailLead.concat(tailCurl), {
    parent: hips,
    count: 11,
    role: "tail",
  });

  type Toe = {
    chain: Chain;
    points: number[][];
    clawTip: number[];
    name: string;
  };
  type Leg = {
    chain: Chain;
    points: number[][];
    toes: Toe[];
    front: boolean;
    sign: number;
    id: string;
  };
  const legs: Leg[] = [];

  for (const front of [true, false]) {
    for (const sign of [1, -1]) {
      const side = sign > 0 ? "L" : "R";
      const id = `${front ? "F" : "H"}${side}`;
      const points = front
        ? [
            [sign * 0.014, 0.093, 0.051],
            [sign * 0.045, 0.065, 0.044],
            [sign * 0.054, 0.022, 0.081],
            [sign * 0.058, 0.0065, 0.079],
          ]
        : [
            [sign * 0.014, 0.084, -0.071],
            [sign * 0.046, 0.058, -0.043],
            [sign * 0.058, 0.023, -0.078],
            [sign * 0.062, 0.0065, -0.077],
          ];

      const names = front
        ? [`shoulder${id}`, `elbow${id}`, `wrist${id}`, `foot${id}`]
        : [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`];
      const foot = points[3];
      const chain = b.chain(`leg${id}`, points, {
        parent: front ? spine.tip! : hips,
        names,
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });

      // Zygodactyl feet: three inward / two outward on the forefeet,
      // and the opposing arrangement on the hind feet.
      const angles = front
        ? [-82, -62, -42, 110, 135]
        : [-133, -108, 40, 60, 80];
      const toes: Toe[] = [];

      angles.forEach((degrees, i) => {
        const a = THREE.MathUtils.degToRad(degrees);
        const dx = Math.sin(a) * sign;
        const dz = Math.cos(a);
        const reach = 0.0118 + (i === 1 || i === 3 ? 0.0012 : 0);
        const pts = [
          [foot[0] + dx * 0.0022, 0.0053, foot[2] + dz * 0.0022],
          [foot[0] + dx * 0.0073, 0.0042, foot[2] + dz * 0.0073],
          [foot[0] + dx * reach, 0.00325, foot[2] + dz * reach],
        ];
        const name = `toe${id}${i + 1}`;
        const toeChain = b.chain(name, pts, {
          parent: chain.tip!,
          names: [`${name}A`, `${name}B`],
          role: "digit",
          up: [0, 1, 0],
        });
        toes.push({
          chain: toeChain,
          points: pts,
          clawTip: [
            foot[0] + dx * (reach + 0.0033),
            0.00035,
            foot[2] + dz * (reach + 0.0033),
          ],
          name,
        });
      });
      legs.push({ chain, points, toes, front, sign, id });
    }
  }

  // ------------------------- Main volumes -------------------------

  const body = b.loft(
    [
      { at: [0, 0.079, -0.100], w: 0.022, h: 0.038 },
      { at: [0, 0.086, -0.071], w: 0.037, h: 0.068 },
      { at: [0, 0.095, -0.028], w: 0.048, h: 0.094 },
      { at: [0, 0.093, 0.024], w: 0.044, h: 0.088 },
      { at: [0, 0.091, 0.057], w: 0.034, h: 0.065 },
      { at: [0, 0.096, 0.080], w: 0.020, h: 0.030 },
    ],
    {
      color: bodyPaint,
      bone: [hips, spine],
      sides: 10,
      smooth: false,
      name: "deepLeafShapedBody",
    },
  );

  const throatSkin = b.loft(
    [
      { at: [0, 0.094, 0.064], w: 0.025, h: 0.037 },
      { at: [0, 0.103, 0.089], w: 0.026, h: 0.034 },
      { at: [0, 0.111, 0.109], w: 0.031, h: 0.031 },
    ],
    {
      color: bodyPaint,
      bone: [neck, head],
      sides: 8,
      smooth: false,
      name: "neckAndGularFold",
    },
  );

  const headShell = b.extrude(
    [
      [-0.026, -0.004],
      [-0.031, 0.020],
      [-0.012, 0.067, "sharp"],
      [0.003, 0.062, "sharp"],
      [0.030, 0.032],
      [0.066, 0.006],
      [0.067, -0.004],
      [0.048, -0.007],
      [0.012, -0.007],
    ],
    {
      at: [0, 0.111, 0.105],
      thickness: [0.039, 0.008],
      bevel: 0.0013,
      detail: 0.4,
      color: headPaint,
      bone: head,
      name: "casqueAndUpperJaw",
    },
  );

  // Separate lower jaw; the dark interior is recessed between the lips.
  b.extrude(
    [
      [-0.019, 0.003],
      [0.034, 0.003],
      [0.062, 0.006],
      [0.066, 0.004],
      [0.050, -0.006],
      [0.028, -0.010],
      [-0.006, -0.008],
      [-0.022, -0.002],
    ],
    {
      at: [0, 0.100, 0.105],
      thickness: [0.021, 0.035],
      bevel: 0.0008,
      detail: 0.4,
      color: paint((p) => mix(C.mint, C.lime, clamp((p.y - 0.091) / 0.019))),
      bone: jaw,
      name: "lowerJaw",
    },
  );

  b.loft(
    [
      { at: [0, 0.1039, 0.089], w: 0.030, h: 0.0013 },
      { at: [0, 0.1042, 0.140], w: 0.030, h: 0.0013 },
      { at: [0, 0.1061, 0.169], w: 0.019, h: 0.0011 },
    ],
    {
      color: C.mouth,
      bone: jaw,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "mouthInterior",
    },
  );

  b.sweep(tail, [0.011, 0.0091, 0.0074, 0.0058, 0.0044, 0.0025, 0.0012], {
    color: tailPaint,
    sides: 8,
    smooth: false,
    caps: "round",
    name: "spiralledPrehensileTail",
  });

  // A thin crest foundation follows the actual loft surface.
  b.sweep(body.line(0, 0.00015), 0.00105, {
    color: C.lime,
    bone: [hips, spine],
    sides: 5,
    smooth: false,
    caps: "round",
    name: "dorsalCrestFoundation",
  });

  function crestTooth(width: number, length: number, height: number) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          -width / 2, 0, -length / 2,
          -width / 2, 0, length / 2,
          -width / 2, height, -length * 0.15,
          width / 2, 0, -length / 2,
          width / 2, 0, length / 2,
          width / 2, height, -length * 0.15,
        ],
        3,
      ),
    );
    geometry.setIndex([
      0, 1, 2, 3, 5, 4,
      0, 3, 4, 0, 4, 1,
      1, 4, 5, 1, 5, 2,
      2, 5, 3, 2, 3, 0,
    ]);
    const flat = geometry.toNonIndexed();
    flat.computeVertexNormals();
    return flat;
  }

  b.along(
    body,
    23,
    (on) => {
      const prominence = Math.sin(Math.PI * on.t);
      b.stick(
        crestTooth(0.0015, 0.0058, 0.0024 + prominence * 0.0031),
        on.t > 0.66 ? C.lime : C.gold,
        on,
        {
          embed: 0.22,
          flow: [0, 0, 1],
          name: `crestTooth${Math.round(on.t * 1000)}`,
        },
      );
    },
    { from: 0.07, to: 0.94 },
  );

  b.sweep(
    polyline([
      [0, 0.132, 0.075],
      [0, 0.178, 0.093],
      [0, 0.173, 0.108],
      [0, 0.143, 0.135],
      [0, 0.117, 0.167],
    ]),
    0.00105,
    {
      color: C.lime,
      bone: head,
      sides: 5,
      smooth: false,
      caps: "round",
      name: "helmetRidge",
    },
  );

  // ------------------------- Limbs and opposed digits -------------------------

  function ellipsoid(
    name: string,
    at: number[] | THREE.Vector3,
    size: number[],
    color: Fill,
    bone: Joint,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 6), color, {
      at,
      scale: size,
      bone,
      flat: true,
      name,
    });
  }

  for (const leg of legs) {
    const { chain, points, front, id } = leg;
    b.sweep(
      chain,
      front
        ? [0.0063, 0.0054, 0.0038, 0.0028]
        : [0.0082, 0.0064, 0.0040, 0.0029],
      {
        color: limbPaint,
        sides: 8,
        smooth: false,
        extend: [0.003, 0],
        name: `angularLeg${id}`,
      },
    );

    const kneeR = front ? 0.0055 : 0.0066;
    ellipsoid(
      `jointKnuckle${id}`,
      points[1],
      [kneeR, kneeR * 0.95, kneeR],
      C.green,
      chain.joints[1],
      8,
    );

    ellipsoid(
      `wrist${id}Skin`,
      points[2],
      [0.0039, 0.0042, 0.0040],
      C.lime,
      chain.joints[2],
      8,
    );

    const foot = points[3];
    // The underside of each little palm touches the floor.
    ellipsoid(
      `pincerPalm${id}`,
      [foot[0], 0.0045, foot[2]],
      [0.0048, 0.0045, 0.0052],
      C.lime,
      chain.tip!,
      8,
    );

    for (const toe of leg.toes) {
      b.sweep(toe.chain, [0.00205, 0.00175, 0.00113], {
        color: limbPaint,
        sides: 6,
        smooth: false,
        extend: [0.0011, 0],
        name: `${toe.name}Skin`,
      });
      b.spike(toe.points[2], toe.clawTip, null, 0.00115, {
        color: C.cream,
        bone: toe.chain.joints[1],
        sides: 5,
        smooth: false,
        name: `${toe.name}Claw`,
      });
    }
  }

  // A sparse selection of larger scales catches light on the broad flanks.
  const bodySurface = b.surface(body);
  const flankScales = bodySurface.scatter(76, {
    rng: random,
    minDist: 0.0038,
    filter: (hit) =>
      Math.abs(hit.n.x) > 0.68 &&
      hit.at.y > 0.060 &&
      hit.at.y < 0.128,
  });

  flankScales.forEach((on, i) => {
    const r = 0.00065 + random() * 0.0004;
    b.stick(
      new THREE.SphereGeometry(r, 6, 4),
      i % 5 === 0 ? C.cream : i % 3 === 0 ? C.lime : C.green,
      on,
      {
        scale: [1, 0.48, 1],
        embed: 0.42,
        name: `raisedFlankScale${i + 1}`,
      },
    );
  });

  // ------------------------- Face and turret eyes -------------------------

  const headSurface = b.surface(headShell);

  for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
    const sign = sideIndex === 0 ? 1 : -1;
    const suffix = sign > 0 ? "L" : "R";
    const eyeBone = eyeBones[sideIndex];
    const gaze = new THREE.Vector3(sign * 0.87, 0.08, 0.49).normalize();

    const socket = headSurface.ray(
      [sign * 0.080, 0.126, 0.126],
      [-sign, 0, 0],
    )!;
    const eyeRoot = socket.at.addScaledVector(socket.n, -0.0011);

    const turretPaint = paint((_p, _n, s) => {
      const height = s[0];
      const angle = THREE.MathUtils.degToRad(s[1]);
      let color = mix(C.green, C.lime, clamp(height / 0.017));
      if (Math.sin(angle * 10 + height * 240) > 0.83 && height < 0.0155) {
        color = mix(color, C.teal, 0.48);
      }
      if (height > 0.0145) color = mix(color, C.gold, 0.36);
      return color;
    });

    b.lathe(
      [
        [0, 0],
        [0.0124, 0],
        [0.0139, 0.003],
        [0.0130, 0.007],
        [0.0102, 0.012],
        [0.0054, 0.0167],
        [0.0032, 0.0181],
        [0, 0.0181],
      ],
      {
        at: eyeRoot,
        axis: gaze,
        segments: 12,
        color: turretPaint,
        bone: eyeBone,
        name: `scalyEyeTurret${suffix}`,
      },
    );

    b.lathe(
      [
        [0.0048, 0.0174],
        [0.0049, 0.0190],
        [0.00305, 0.0194],
        [0.00305, 0.0180],
      ],
      {
        at: eyeRoot,
        axis: gaze,
        segments: 12,
        color: C.gold,
        bone: eyeBone,
        name: `amberEyeApertureRim${suffix}`,
      },
    );

    const pupilAt = eyeRoot.clone().addScaledVector(gaze, 0.0190);
    b.part(new THREE.CylinderGeometry(0.00305, 0.00305, 0.00075, 12), C.pupil, {
      at: pupilAt,
      dir: gaze,
      bone: eyeBone,
      name: `pupil${suffix}`,
    });

    const eyeUp = new THREE.Vector3(0, 1, 0)
      .addScaledVector(gaze, -gaze.y)
      .normalize();
    const eyeSide = gaze.clone().cross(eyeUp).normalize();
    const glintAt = eyeRoot
      .clone()
      .addScaledVector(gaze, 0.01962)
      .addScaledVector(eyeUp, 0.00105)
      .addScaledVector(eyeSide, 0.00055);
    b.part(new THREE.SphereGeometry(0.00052, 6, 4), C.glint, {
      at: glintAt,
      bone: eyeBone,
      name: `eyeGlint${suffix}`,
    });

    const nostril = headSurface.ray(
      [sign * 0.070, 0.118, 0.157],
      [-sign, 0, 0],
    );
    if (nostril) {
      b.stick(
        new THREE.SphereGeometry(0.00125, 8, 4),
        C.darkTeal,
        nostril,
        {
          scale: [0.72, 0.27, 1],
          flow: [0, 0, 1],
          embed: 0.45,
          name: `nostril${suffix}`,
        },
      );
    }

    // Seat the fine mouth crease on the real tapered skull.
    const lipSamples = [
      [0.088, 0.109],
      [0.104, 0.107],
      [0.129, 0.1055],
      [0.151, 0.1055],
      [0.169, 0.107],
    ];
    const lipPoints = lipSamples.map(([z, y]) => {
      const hit =
        headSurface.ray([sign * 0.080, y, z], [-sign, 0, 0]) ??
        headSurface.nearest([sign * 0.018, y, z]);
      return hit.at.addScaledVector(hit.n, 0.00035);
    });
    b.sweep(catmull(lipPoints), 0.00065, {
      color: C.mouth,
      bone: head,
      sides: 5,
      caps: "round",
      name: `quietSmile${suffix}`,
    });

    // Short oblique cheek markings sit below the turret, not across the eye.
    const cheekPoints = [
      [0.092, 0.118],
      [0.103, 0.1145],
      [0.113, 0.1115],
    ].map(([z, y]) => {
      const hit =
        headSurface.ray([sign * 0.08, y, z], [-sign, 0, 0]) ??
        headSurface.nearest([sign * 0.017, y, z]);
      return hit.at.addScaledVector(hit.n, 0.00025);
    });
    b.sweep(catmull(cheekPoints), 0.0008, {
      color: C.cream,
      bone: head,
      sides: 5,
      caps: "round",
      name: `paleCheekStripe${suffix}`,
    });
  }

  // A few small scales under the throat continue the natural serrated outline.
  const throatSurface = b.surface(throatSkin);
  for (let i = 0; i < 5; i++) {
    const z = 0.070 + i * 0.007;
    const on = throatSurface.ray([0, 0, z], [0, 1, 0]);
    if (on) {
      b.stick(
        crestTooth(0.0015, 0.0034, 0.0018),
        C.mint,
        on,
        {
          embed: 0.35,
          flow: [0, 0, 1],
          name: `gularScale${i + 1}`,
        },
      );
    }
  }

  b.material(C.pupil).roughness = 0.23;
  b.material(C.glint).roughness = 0.24;

  const root = b.root;
  root.userData.species = "Chamaeleo calyptratus";
  return root;
}
```