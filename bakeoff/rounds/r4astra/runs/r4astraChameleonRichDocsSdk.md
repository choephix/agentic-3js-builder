```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  paint,
  scales,
  grain,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Prism on a Twig",
  description:
    "A faceted panther chameleon with a turquoise-to-lime-to-orange coat, scarlet barring, independently aimed turret eyes, grasping mitten feet, and a tightly wound tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "PrismChameleon", detail: 1, paintSize: 2048 });

  const IVORY = "#f4f5d9";
  const DARK = "#163b36";
  const RED = "#cf4031";
  const TEAL = "#157f76";
  const GOLD = "#e5bd49";

  type RGB = [number, number, number];
  const lerpColor = (a: RGB, c: RGB, t: number): RGB => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];
  const shade = (c: RGB, k: number): RGB => [
    Math.min(1, c[0] * k),
    Math.min(1, c[1] * k),
    Math.min(1, c[2] * k),
  ];

  const ramp: { z: number; c: RGB }[] = [
    { z: -0.19, c: [0.98, 0.39, 0.095] },
    { z: -0.115, c: [0.98, 0.66, 0.12] },
    { z: -0.025, c: [0.66, 0.85, 0.16] },
    { z: 0.055, c: [0.30, 0.81, 0.29] },
    { z: 0.12, c: [0.075, 0.76, 0.59] },
    { z: 0.225, c: [0.055, 0.70, 0.73] },
  ];
  function hue(z: number): RGB {
    if (z <= ramp[0].z) return ramp[0].c;
    for (let i = 1; i < ramp.length; i++) {
      if (z <= ramp[i].z) {
        const a = ramp[i - 1];
        const c = ramp[i];
        return lerpColor(a.c, c.c, (z - a.z) / (c.z - a.z));
      }
    }
    return ramp[ramp.length - 1].c;
  }

  function skinRGB(p: THREE.Vector3, n: THREE.Vector3, head = false): RGB {
    let c = hue(p.z);
    const side = Math.abs(n.x);
    if (!head) {
      const wave =
        ((p.z + 0.135) * Math.PI * 2) / 0.047 +
        0.75 * Math.sin((p.y - 0.19) * 58) +
        0.23 * Math.sin(p.z * 129);
      const bar = Math.cos(wave);
      const stripeY = 0.239 + 0.064 * (p.z + 0.02);
      const stripe =
        side > 0.48 &&
        p.z > -0.131 &&
        p.z < 0.122 &&
        Math.abs(p.y - stripeY) < 0.0048;

      if (bar > 0.53 && side > 0.28 && p.y > 0.210) {
        c = [0.83, 0.19, 0.16];
      }
      if (stripe) {
        c = bar > 0.93 ? [0.89, 0.39, 0.29] : [0.98, 0.985, 0.88];
      }
      if (p.y < 0.216) c = lerpColor(c, [0.79, 0.86, 0.35], 0.24);
    } else {
      if (p.y > 0.286) c = lerpColor(c, [0.38, 0.81, 0.48], 0.42);
      if (side > 0.42 && p.y > 0.241 && p.y < 0.247) {
        c = [0.93, 0.97, 0.80];
      }
      if (
        side > 0.5 &&
        p.z < 0.15 &&
        p.y > 0.25 &&
        p.y < 0.267 &&
        Math.sin(p.z * 380 + p.y * 90) > 0.4
      ) {
        c = [0.85, 0.32, 0.20];
      }
    }
    return shade(c, 0.96 + 0.055 * Math.max(0, n.y));
  }

  const bodyPaint = scales(
    paint((p, n) => skinRGB(p, n)),
    paint((p, n) => shade(skinRGB(p, n), 0.77)),
    { size: 0.0035, width: 0.075, seed: 24 },
  );
  const headPaint = scales(
    paint((p, n) => skinRGB(p, n, true)),
    paint((p, n) => shade(skinRGB(p, n, true), 0.78)),
    { size: 0.0028, width: 0.075, seed: 24 },
  );
  const limbPaint = scales(
    paint((p, _n, s) => {
      const c = hue(p.z);
      return Math.cos(s[0] * Math.PI * 6 + 0.4) > 0.77
        ? lerpColor(c, [0.79, 0.27, 0.16], 0.7)
        : c;
    }),
    paint((p) => shade(hue(p.z), 0.70)),
    { size: 0.003, width: 0.075, seed: 24 },
  );
  const footPaint = scales(
    paint((p) => lerpColor(hue(p.z), [0.66, 0.84, 0.39], 0.24)),
    paint((p) => shade(hue(p.z), 0.69)),
    { size: 0.0025, width: 0.075, seed: 24 },
  );
  const tailPaint = scales(
    paint((_p, _n, s) => {
      let c = lerpColor([1, 0.56, 0.13], [0.91, 0.28, 0.13], s[0]);
      if (Math.cos(s[0] * Math.PI * 18) > 0.79)
        c = lerpColor(c, [0.71, 0.20, 0.12], 0.45);
      if (s[0] < 0.20 && Math.abs(Math.abs(s[1]) - 90) < 11)
        c = [0.99, 0.90, 0.61];
      return c;
    }),
    "#bb5225",
    { size: 0.003, width: 0.06, seed: 24 },
  );

  // Skeleton: the perch is static; the entire animal is beneath hips.
  const sceneRoot = b.joint("sceneRoot", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: sceneRoot,
    at: [0, 0.236, -0.105],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    catmull([
      hips,
      [0, 0.243, -0.035],
      [0, 0.248, 0.043],
      [0, 0.253, 0.106],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest", "neckBase"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neckChain",
    [spine.at(1), [0, 0.260, 0.137]],
    { parent: spine, names: ["neck", "headAnchor"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck,
    at: neck.at(1),
    dir: [0, 0, 1],
    role: "head",
  });
  const face = b.region({ at: head, bone: head });
  const jaw = b.joint("jaw", {
    parent: head,
    at: face.p([0, -0.028, -0.018]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const eyes = [1, -1].map((s) => ({
    s,
    joint: b.joint(s > 0 ? "eyeL" : "eyeR", {
      parent: head,
      at: face.p([s * 0.022, 0.010, 0.029]),
      dir: s > 0 ? [1, 0.10, 0.50] : [-1, 0.18, -0.52],
      role: "hinge",
    }),
  }));

  const tailPoints: number[][] = [
    [0, 0.232, -0.140],
    [0, 0.244, -0.164],
  ];
  for (let i = 0; i <= 46; i++) {
    const t = i / 46;
    const angle = 0.95 + t * Math.PI * 2 * 1.65;
    const radius = 0.067 + (0.0075 - 0.067) * t;
    tailPoints.push([
      0,
      0.186 + radius * Math.sin(angle),
      -0.223 + radius * Math.cos(angle),
    ]);
  }
  const tail = b.chain("tail", catmull(tailPoints), {
    parent: hips,
    count: 13,
    role: "tail",
  });

  function branchY(z: number): number {
    return z < 0
      ? 0.079 + ((z + 0.17) / 0.17) * 0.007
      : 0.086 + (z / 0.18) * 0.006;
  }

  function makeLeg(s: number, front: boolean) {
    const side = s > 0 ? "L" : "R";
    const label = `${front ? "F" : "H"}${side}`;
    const z = front ? (s > 0 ? 0.149 : 0.122) : s > 0 ? -0.095 : -0.132;
    const by = branchY(z);
    const palm = new THREE.Vector3(s * 0.014, by + 0.021, z);
    const leg = b.chain(
      `leg${label}`,
      [
        front
          ? [s * 0.023, 0.248, 0.075]
          : [s * 0.023, 0.234, -0.093],
        front
          ? [s * 0.066, 0.186, 0.077]
          : [s * 0.065, 0.180, -0.095],
        palm,
      ],
      {
        parent: front ? spine.joints[2] : hips,
        names: front
          ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
          : [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [0, by + 0.009, z],
      },
    );

    // Three fingers cross the twig; two oppose them underneath it.
    const digits = Array.from({ length: 5 }, (_, i) => {
      const across = i < 3;
      const dz = across ? -0.001 + i * 0.006 : -0.008 - (i - 3) * 0.006;
      const points = across
        ? [
            [s * 0.013, by + 0.019, z + dz],
            [-s * 0.001, by + 0.015, z + dz + 0.002],
            [-s * 0.0105, by + 0.002, z + dz + 0.003],
          ]
        : [
            [s * 0.016, by + 0.016, z + dz],
            [s * 0.020, by + 0.003, z + dz - 0.001],
            [s * 0.009, by - 0.005, z + dz - 0.002],
          ];
      const digit = b.chain(`digit${label}${i + 1}`, points, {
        parent: leg,
        names: [
          `digit${label}${i + 1}Base`,
          `digit${label}${i + 1}Knuckle`,
          `digit${label}${i + 1}Tip`,
        ],
        role: "digit",
      });
      return { digit, across };
    });
    return { s, z, by, palm, leg, digits, front, label };
  }

  const legs = [
    makeLeg(1, true),
    makeLeg(-1, true),
    makeLeg(1, false),
    makeLeg(-1, false),
  ];

  // A laterally compressed, deep-bellied chameleon torso.
  const body = b.loft(
    [
      { at: [0, 0.234, -0.145], w: 0.017, h: 0.026 },
      { at: [0, 0.238, -0.103], w: 0.042, h: 0.076 },
      { at: [0, 0.244, -0.042], w: 0.064, h: 0.108 },
      { at: [0, 0.248, 0.030], w: 0.063, h: 0.112 },
      { at: [0, 0.253, 0.088], w: 0.047, h: 0.077 },
      { at: [0, 0.258, 0.129], w: 0.035, h: 0.045 },
    ],
    {
      bone: [hips, spine, neck, tail.joints[0]],
      color: bodyPaint,
      sides: 10,
      smooth: false,
      caps: "flat",
      name: "compressedPrismaticBody",
    },
  );

  b.sweep(tail, (t) => 0.0021 + 0.012 * Math.pow(1 - t, 0.92), {
    color: tailPaint,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "round" },
    name: "clockSpringTail",
  });

  const skull = b.loft(
    [
      { at: face.p([0, 0.004, -0.030]), w: 0.036, h: 0.052 },
      { at: face.p([0, 0.008, 0.004]), w: 0.052, h: 0.064 },
      { at: face.p([0, 0, 0.042]), w: 0.057, h: 0.046 },
      { at: face.p([0, -0.010, 0.084]), w: 0.038, h: 0.026 },
      { at: face.p([0, -0.013, 0.098]), w: 0.017, h: 0.018 },
    ],
    {
      bone: head,
      color: headPaint,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "upperJawAndSkull",
    },
  );
  b.loft(
    [
      { at: face.p([0, -0.025, -0.016]), w: 0.034, h: 0.004 },
      { at: face.p([0, -0.024, 0.035]), w: 0.049, h: 0.003 },
      { at: face.p([0, -0.023, 0.093]), w: 0.023, h: 0.003 },
    ],
    { bone: head, color: DARK, sides: 8, caps: "flat", name: "mouthOpening" },
  );
  const lowerJaw = b.loft(
    [
      { at: face.p([0, -0.032, -0.021]), w: 0.031, h: 0.014 },
      { at: face.p([0, -0.032, 0.030]), w: 0.044, h: 0.014 },
      { at: face.p([0, -0.028, 0.089]), w: 0.030, h: 0.011 },
      { at: face.p([0, -0.025, 0.098]), w: 0.014, h: 0.007 },
    ],
    {
      bone: jaw,
      color: headPaint,
      sides: 8,
      caps: "flat",
      smooth: false,
      name: "separateLowerJaw",
    },
  );
  const chinSurface = b.surface(lowerJaw);
  const chin = chinSurface.ray(face.p([0, -0.08, 0.05]), [0, 1, 0]);
  if (chin) {
    b.stick(new THREE.SphereGeometry(0.008, 8, 4), IVORY, chin, {
      scale: [1.2, 0.15, 2.2],
      name: "paleChin",
    });
  }

  const casque = b.extrude(
    [
      [-0.038, -0.001],
      [-0.034, 0.035],
      [-0.015, 0.052],
      [0.006, 0.048],
      [0.055, 0.012],
      [0.088, -0.003],
      [0.017, -0.008],
    ],
    {
      at: face.p([0, 0, 0]),
      bone: head,
      thickness: 0.016,
      bevel: 0.002,
      color: headPaint,
      name: "lowAngularCasque",
    },
  );
  const headSurface = b.surface([skull, casque]);
  const crestPath = polyline([
    face.p([0, 0.035, -0.034]),
    face.p([0, 0.052, -0.015]),
    face.p([0, 0.048, 0.006]),
    face.p([0, 0.012, 0.055]),
  ]);
  b.sweep(crestPath, 0.0022, {
    bone: head,
    color: TEAL,
    sides: 5,
    name: "casqueRidge",
  });
  b.along(
    crestPath,
    11,
    (at) => {
      const hit = headSurface.nearest(at);
      b.stick(new THREE.ConeGeometry(0.0024, 0.006, 4), "#85cfa0", hit, {
        scale: [0.65, 1, 1],
        flow: [0, 0, 1],
        bone: head,
        embed: 0.32,
        name: "casqueSerration",
      });
    },
    { from: 0.05, to: 0.9 },
  );

  for (const s of [1, -1]) {
    const brow = headSurface.drape(
      catmull([
        face.p([s * 0.016, 0.037, -0.020]),
        face.p([s * 0.022, 0.029, 0.017]),
        face.p([s * 0.025, 0.019, 0.043]),
        face.p([s * 0.018, -0.002, 0.082]),
      ]),
      { lift: 0.0008 },
    );
    b.sweep(brow, 0.0016, {
      bone: head,
      color: "#8fd68c",
      sides: 5,
      name: `cranialKeel${s > 0 ? "L" : "R"}`,
    });
    const nostril = b.surface(skull).nearest(face.p([s * 0.027, -0.006, 0.079]));
    b.stick(new THREE.SphereGeometry(0.0018, 7, 4), DARK, nostril, {
      scale: [1.25, 0.24, 0.8],
      bone: head,
      name: "nostril",
    });
  }

  const eyePaint = scales(
    paint((_p, _n, s) => {
      if (s[0] > 0.0175) return [0.63, 0.82, 0.25];
      if (
        s[0] > 0.001 &&
        s[0] < 0.016 &&
        Math.cos((s[1] * Math.PI * 8) / 180 + s[0] * 70) > 0.78
      )
        return [0.80, 0.31, 0.17];
      return lerpColor([0.08, 0.69, 0.63], [0.46, 0.80, 0.35], Math.max(0, s[0] / 0.021));
    }),
    "#318f66",
    { size: 0.0022, width: 0.065, seed: 17 },
  );

  for (const { s, joint: eye } of eyes) {
    const turret = b.lathe(
      [
        [0, -0.005],
        [0.014, -0.005],
        [0.021, 0],
        [0.020, 0.007],
        [0.015, 0.015],
        [0.009, 0.021],
        [0, 0.021],
      ],
      {
        at: eye,
        axis: eye,
        bone: eye,
        segments: 12,
        color: eyePaint,
        name: `turret${s > 0 ? "L" : "R"}`,
      },
    );
    b.lathe(
      [
        [0.0043, 0.0209],
        [0.0072, 0.0209],
        [0.0072, 0.0230],
        [0.0043, 0.0230],
      ],
      { at: eye, axis: eye, bone: eye, segments: 12, color: GOLD, name: "irisRim" },
    );
    b.part(new THREE.CylinderGeometry(0.0044, 0.0044, 0.0018, 12), "#102b29", {
      at: eye.local([0, 0.0226, 0]),
      dir: eye,
      bone: eye,
      name: "independentPupil",
    });
    b.part(new THREE.SphereGeometry(0.00125, 6, 4), "#fff5d9", {
      at: eye.local([-0.0015, 0.0238, 0.0015]),
      bone: eye,
      name: "eyeGlint",
    });
    const turretSurface = b.surface(turret);
    b.ring(eye.moved([0, 0.009, 0]), { count: 10, radius: 0.022 }, (item) => {
      b.stick(
        new THREE.SphereGeometry(0.00105, 6, 4),
        "#bad45a",
        turretSurface.nearest(item),
        { scale: [1, 0.5, 1], bone: eye, name: "turretPearl" },
      );
    });
  }

  for (const f of legs) {
    b.sweep(f.leg, [f.front ? 0.0118 : 0.0145, 0.012, 0.008, 0.0064], {
      color: limbPaint,
      sides: 8,
      smooth: false,
      caps: "round",
      name: `bentLeg${f.label}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), footPaint, {
      at: f.palm,
      bone: f.leg,
      scale: [0.008, 0.007, 0.014],
      flat: true,
      name: `mittenPalm${f.label}`,
    });
    for (const { digit, across } of f.digits) {
      b.sweep(digit, [0.0036, 0.0031, 0.0021], {
        color: footPaint,
        sides: 6,
        smooth: false,
        caps: "round",
        name: "graspingToe",
      });
      b.spike(
        digit.at(1),
        across ? [f.s * 0.25, -1, 0.15] : [-f.s, -0.25, -0.15],
        0.004,
        0.00115,
        { color: "#dfd9ac", bone: digit, sides: 5, name: "tinyCurvedClaw" },
      );
    }
  }

  // Saw-toothed dorsal edge and a sparse layer of larger scale granules.
  const bodySurface = b.surface(body);
  const dorsalHits = Array.from({ length: 21 }, (_, i) => {
    const z = -0.132 + (0.244 * i) / 20;
    return bodySurface.ray([0, 0.42, z], [0, -1, 0]);
  }).filter((hit): hit is NonNullable<typeof hit> => hit !== null);

  b.along(catmull(dorsalHits), 30, (at) => {
    const hit = bodySurface.nearest(at);
    b.stick(
      new THREE.ConeGeometry(0.0025, 0.0065, 4),
      paint((p) => lerpColor(hue(p.z), [0.89, 0.92, 0.51], 0.45)),
      hit,
      {
        scale: [0.65, 1, 1.25],
        flow: [0, 0, 1],
        embed: 0.3,
        name: "dorsalSawtooth",
      },
    );
  });
  const scaleHits = bodySurface.scatter(72, {
    rng: rng(621),
    minDist: 0.009,
    filter: (hit) => Math.abs(hit.n.x) > 0.65 && hit.at.y > 0.212,
  });
  for (const hit of scaleHits) {
    b.stick(new THREE.SphereGeometry(0.0018, 6, 4), bodyPaint, hit, {
      scale: [1, 0.36, 1.12],
      embed: 0.25,
      name: "raisedScale",
    });
  }

  // The twig touches the ground at its heel and at two narrow fork tips.
  const bark = grain("#594333", "#96764b", { size: 0.0025, axis: "z", seed: 71 });
  const twigPath = catmull([
    [-0.004, 0.011, -0.326],
    [-0.002, 0.049, -0.260],
    [0, 0.079, -0.170],
    [0, 0.086, 0],
    [0, 0.092, 0.180],
    [0.008, 0.072, 0.322],
  ]);
  const twig = b.sweep(twigPath, [0.011, 0.0105, 0.009, 0.0085, 0.0075, 0.0055], {
    bone: sceneRoot,
    color: bark,
    sides: 7,
    smooth: false,
    caps: "flat",
    name: "mainTwig",
  });
  for (const angle of [55, 155, 250]) {
    b.sweep(twig.line(angle, 0.0002).slice(0.06, 0.96), 0.00055, {
      bone: sceneRoot,
      color: "#4c3b2f",
      sides: 4,
      name: "barkFissure",
    });
  }
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0, 0.088, 0.175],
        [s * 0.039, 0.052, 0.218],
        [s * 0.080, 0.018, 0.260],
        [s * 0.098, 0.0032, 0.289],
      ]),
      [0.006, 0.0045, 0.003, 0.0026],
      {
        bone: sceneRoot,
        color: bark,
        sides: 6,
        smooth: false,
        caps: "round",
        name: "groundedTwigFork",
      },
    );
  }
  b.sweep(
    catmull([
      [0, 0.091, 0.180],
      [-0.031, 0.098, 0.208],
      [-0.059, 0.111, 0.242],
      [-0.077, 0.119, 0.270],
    ]),
    [0.0039, 0.0011],
    { bone: sceneRoot, color: bark, sides: 6, name: "leafShoot" },
  );
  b.sweep(
    [[0, 0.069, -0.206], [0.038, 0.080, -0.235], [0.052, 0.083, -0.246]],
    [0.004, 0.0017],
    { bone: sceneRoot, color: bark, sides: 6, caps: "flat", name: "brokenSpur" },
  );

  const woodEnd = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#c1a16b"/>
      <g fill="none" stroke="#886543" stroke-width="4">
        <path d="M17 59C18 26 49 13 79 20S116 61 105 90S54 118 29 95Z"/>
        <path d="M31 60C31 40 49 29 72 33S100 59 91 81S58 101 43 87Z"/>
        <path d="M47 60C46 47 58 44 72 48S84 68 75 77S53 79 47 60Z"/>
      </g>
      <path d="M9 88L38 76M90 12L83 37" stroke="#624b34" stroke-width="5"/>
      <ellipse cx="62" cy="62" rx="7" ry="10" fill="#8c6743"/>
    </svg>`,
    { size: 128 },
  );
  for (const t of [0, 1]) {
    const tangent = twigPath.tangentAt(t).multiplyScalar(t === 0 ? -1 : 1);
    const at = twigPath.at(t).addScaledVector(tangent, 0.00025);
    b.part(new THREE.CircleGeometry(t === 0 ? 0.0095 : 0.0048, 12), "#ffffff", {
      at,
      bone: sceneRoot,
      dir: tangent,
      axis: "z",
      texture: woodEnd,
      name: "twigEndGrain",
    });
  }

  // A restrained pair of leaves gives the perch a living, botanical finish.
  const leaves = [
    {
      base: [-0.048, 0.106, 0.230],
      tip: [-0.118, 0.122, 0.268],
      left: [-0.093, 0.119, 0.232],
      right: [-0.074, 0.119, 0.270],
      color: "#688a46",
    },
    {
      base: [-0.073, 0.117, 0.263],
      tip: [-0.065, 0.141, 0.320],
      left: [-0.089, 0.133, 0.291],
      right: [-0.053, 0.131, 0.291],
      color: "#91a65a",
    },
  ];
  for (const leaf of leaves) {
    const a = new THREE.Vector3(...(leaf.base as [number, number, number]));
    const c = new THREE.Vector3(...(leaf.tip as [number, number, number]));
    const ridge = a.clone().lerp(c, 0.5).add(new THREE.Vector3(0, 0.003, 0));
    b.slab([leaf.base, leaf.left, leaf.tip, ridge], {
      bone: sceneRoot,
      color: leaf.color,
      thickness: 0.0008,
      name: "leafLightFacet",
    });
    b.slab([leaf.base, ridge, leaf.tip, leaf.right], {
      bone: sceneRoot,
      color: "#587b41",
      thickness: 0.0008,
      name: "leafShadeFacet",
    });
    b.sweep([a, ridge, c], [0.00075, 0.00025], {
      bone: sceneRoot,
      color: "#b3bd77",
      sides: 4,
      name: "leafMidrib",
    });
  }

  return b.root;
}
```