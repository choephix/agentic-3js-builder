```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  spiral,
  frame,
  rng,
  paint,
  scales,
  spots,
  stripes,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Jewel Chameleon",
  description:
    "A low-poly veiled chameleon with a lime-green casque, turquoise flank bars, golden turret eyes, opposable little feet, and a loosely curled prehensile tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "jewelChameleon", detail: 1, paintSize: 2048 });

  const C = {
    green: "#80b642",
    lime: "#bdd34b",
    lemon: "#dce67b",
    jade: "#57aa76",
    turquoise: "#2ba79c",
    darkTeal: "#267c77",
    belly: "#cdda92",
    gold: "#e9bd59",
    orange: "#c98a40",
    ivory: "#ece7b3",
    dark: "#203c32",
  };

  // Skeleton: the four legs are comfortably spread, with all five toes
  // independently articulated and the tail held clear of the body.
  const hips = b.joint("hips", {
    at: [0, 0.125, -0.072],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      hips,
      hips.local({ forward: 0.057, up: 0.008 }),
      hips.local({ forward: 0.119, up: 0.013 }),
      hips.local({ forward: 0.156, up: 0.015 }),
    ]),
    {
      parent: hips,
      count: 3,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      spine.at(1),
      spine.at(1).local({ forward: 0.031, up: 0.007 }),
      spine.at(1).local({ forward: 0.053, up: 0.008 }),
    ],
    {
      parent: spine,
      names: ["neck1", "neck2", "neckTip"],
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

  const jaw = b.joint("jaw", {
    parent: head,
    at: H.p([0, -0.024, -0.013]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const coilCenter = hips.local({ back: 0.193, down: 0.024 });
  const coilStart = hips.local({ back: 0.142, down: 0.045 });
  const tailRoute = catmull([
    hips.local({ back: 0.033, down: 0.001 }),
    hips.local({ back: 0.073, down: 0.009 }),
    hips.local({ back: 0.109, down: 0.026 }),
    coilStart,
  ]).concat(
    spiral(coilCenter, coilStart, [1, 0, 0], {
      turns: 1.1,
      r1: 0.01,
    }),
  );
  const tail = b.chain("tail", tailRoute, {
    parent: hips,
    count: 12,
    role: "tail",
  });

  const feet = [1, -1].flatMap((s) =>
    [true, false].map((front) => {
      const side = s > 0 ? "L" : "R";
      const tag = `${front ? "F" : "H"}${side}`;
      const positions = front
        ? [
            [s * 0.029, 0.14, 0.075],
            [s * 0.067, 0.085, 0.1],
            [s * 0.082, 0.035, 0.105],
            [s * 0.082, 0.011, 0.108],
          ]
        : [
            [s * 0.03, 0.125, -0.073],
            [s * 0.076, 0.082, -0.114],
            [s * 0.078, 0.036, -0.071],
            [s * 0.082, 0.011, -0.062],
          ];

      const leg = b.chain(`leg${tag}`, positions, {
        parent: front ? spine : hips,
        names: front
          ? [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`, `foot${tag}`]
          : [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `foot${tag}`],
        role: "leg",
        contact: [s * 0.082, 0, front ? 0.108 : -0.062],
      });
      const foot = leg.tip!;
      const F = b.region({ at: foot, bone: foot });
      const f = front ? 1 : -1;

      // Three closely grouped fingers oppose a separate two-finger bundle.
      const digits = Array.from({ length: 5 }, (_, i) => {
        let start: number[];
        let middle: number[];
        let end: number[];

        if (i < 3) {
          const spread = i - 1;
          start = [s * spread * 0.0034, 0, f * 0.004];
          middle = [
            s * spread * 0.006,
            -0.004,
            f * (0.017 + (i === 1 ? 0.002 : 0)),
          ];
          end = [
            s * spread * 0.0085,
            -0.008,
            f * (0.028 + (i === 1 ? 0.004 : 0)),
          ];
        } else {
          const j = i - 3;
          start = [s * 0.005, 0, f * (-0.003 + j * 0.005)];
          middle = [s * (0.016 + j * 0.002), -0.004, f * (-0.01 + j * 0.006)];
          end = [s * (0.025 + j * 0.004), -0.008, f * (-0.017 + j * 0.008)];
        }

        const chain = b.chain(
          `toe${tag}${i + 1}`,
          [F.p(start), F.p(middle), F.p(end)],
          {
            parent: foot,
            names: [
              `toe${tag}${i + 1}root`,
              `toe${tag}${i + 1}mid`,
              `toe${tag}${i + 1}tip`,
            ],
            role: "digit",
          },
        );
        return chain;
      });

      return { tag, front, leg, foot, digits };
    }),
  );

  // The skin has fine painted scales, leaving the large geometry deliberately
  // simple and faceted. Broad colour bars do most of the visual work.
  const greenSkin = spots(
    scales(C.green, "#608b35", { size: 0.004, width: 0.075, seed: 2 }),
    "#bed965",
    { size: 0.005, amount: 0.18, seed: 13 },
  );
  const sunnySkin = scales(C.lime, "#8db440", {
    size: 0.004,
    width: 0.07,
    seed: 2,
  });
  const turquoiseSkin = spots(
    scales(C.turquoise, "#278a83", { size: 0.004, width: 0.065, seed: 2 }),
    "#82d5ae",
    { size: 0.0045, amount: 0.23, seed: 13 },
  );
  const bellySkin = scales(C.belly, "#a5bd77", {
    size: 0.0045,
    width: 0.06,
    seed: 2,
  });
  const stripeSkin = spots(C.lemon, "#f0e9ac", {
    size: 0.004,
    amount: 0.25,
    seed: 4,
  });

  const bodyPaint = paint((p, n) => {
    if (p.y < 0.098 || n.y < -0.52) return bellySkin;
    if (Math.abs(n.x) > 0.48 && p.y < 0.178) {
      const lateralLine = 0.137 + 0.005 * Math.sin((p.z + 0.08) * 19);
      if (Math.abs(p.y - lateralLine) < 0.0034) return stripeSkin;
      const bar = Math.sin(((p.z + 0.44 * (p.y - 0.13)) * Math.PI * 2) / 0.049);
      if (bar > 0.43) return turquoiseSkin;
    }
    return n.y > 0.45 || p.y > 0.176 ? sunnySkin : greenSkin;
  });

  const body = b.loft(
    [
      { at: hips.local({ back: 0.037 }), w: 0.036, h: 0.04 },
      { at: hips.local({ forward: 0.015, up: 0.005 }), w: 0.074, h: 0.085 },
      { at: spine.at(0.53), w: 0.089, h: 0.12 },
      { at: spine.at(0.87), w: 0.071, h: 0.094 },
      { at: neck.at(0.42), w: 0.05, h: 0.054 },
    ],
    {
      bone: [hips, spine, neck],
      color: bodyPaint,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "compressedOvalBody",
    },
  );

  b.sweep(neck, [0.024, 0.025], {
    color: greenSkin,
    sides: 8,
    smooth: false,
    caps: "flat",
    sectors: [[125, 235, bellySkin]],
    name: "shortNeck",
  });

  const tailPaint = paint((_p, _n, uv) => {
    const t = uv[0];
    if (t > 0.93) return C.gold;
    if (t > 0.83) return stripeSkin;
    const band = Math.sin(t * Math.PI * 15);
    return band > 0.38 ? turquoiseSkin : greenSkin;
  });
  const tailTube = b.sweep(
    tail,
    (t) => 0.0175 * Math.pow(1 - t, 1.3) + 0.0018,
    {
      color: tailPaint,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "prehensileTail",
    },
  );

  // A small, warm saw-tooth crest follows the curved back.
  b.along(
    body,
    17,
    (on) => {
      const height = 0.006 + 0.004 * Math.sin(Math.PI * on.t);
      b.stick(new THREE.ConeGeometry(0.0043, height, 4), C.gold, on, {
        embed: 0.26,
        flow: [0, 0, 1],
        name: "dorsalTooth",
      });
    },
    { from: 0.09, to: 0.92 },
  );
  b.along(
    tailTube,
    7,
    (on) =>
      b.stick(new THREE.ConeGeometry(0.0025, 0.004, 4), C.lime, on, {
        embed: 0.3,
        name: "tailScute",
      }),
    { from: 0.025, to: 0.34 },
  );

  const skinSurface = b.surface(body);
  const flankScales = skinSurface.scatter(58, {
    rng: rng(41),
    minDist: 0.009,
    filter: (hit) =>
      Math.abs(hit.n.x) > 0.53 && hit.at.y > 0.107 && hit.at.y < 0.169,
  });
  flankScales.forEach((hit, i) => {
    const radius = i % 5 === 0 ? 0.0029 : 0.0019;
    b.stick(
      new THREE.CylinderGeometry(radius, radius, 0.0011, 6),
      i % 6 === 0 ? C.gold : C.lemon,
      hit,
      { embed: 0.55, name: "raisedFlankScale" },
    );
  });

  // Wedge-shaped skull and an independently rigged lower jaw.
  const cheekSkin = spots(
    scales("#83bc54", "#669843", { size: 0.0035, width: 0.065, seed: 3 }),
    "#b8d57b",
    { size: 0.004, amount: 0.2, seed: 9 },
  );
  const skull = b.loft(
    [
      { at: H.p([0, -0.007, -0.032]), w: 0.064, h: 0.048 },
      { at: H.p([0, 0.006, 0.004]), w: 0.08, h: 0.056 },
      { at: H.p([0, -0.008, 0.043]), w: 0.063, h: 0.031 },
      { at: H.p([0, -0.01, 0.065]), w: 0.043, h: 0.022 },
    ],
    {
      bone: head,
      color: cheekSkin,
      sides: 10,
      smooth: false,
      caps: "flat",
      name: "upperJawAndSkull",
    },
  );

  b.frustumBox(
    H.p([0, -0.022, -0.009]),
    H.p([0, -0.022, 0.064]),
    [0.052, 0.0025],
    [0.039, 0.0025],
    { bone: head, color: C.dark, name: "mouthInterior" },
  );
  const lowerJaw = b.loft(
    [
      { at: H.p([0, -0.026, -0.014]), w: 0.05, h: 0.011 },
      { at: H.p([0, -0.028, 0.02]), w: 0.064, h: 0.012 },
      { at: H.p([0, -0.026, 0.062]), w: 0.043, h: 0.01 },
    ],
    {
      bone: jaw,
      color: bellySkin,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "lowerJaw",
    },
  );

  // The tall, thin casque is a single bevelled primitive slab.
  const casquePaint = paint((_p, _n, uv) => {
    if (uv[1] > 0.061) return sunnySkin;
    if (
      uv[1] > 0.023 &&
      Math.sin(uv[0] * 144 + uv[1] * 57) > 0.94
    )
      return greenSkin;
    return sunnySkin;
  });
  const casque = b.extrude(
    [
      [-0.039, 0.006],
      [-0.042, 0.028],
      [-0.032, 0.09, "sharp"],
      [0.009, 0.056],
      [0.068, 0.014, "sharp"],
      [0.043, 0.004],
      [0.002, -0.007],
    ],
    {
      at: H,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.069, 0.01],
      bevel: 0.002,
      smoothing: 0,
      bone: head,
      color: casquePaint,
      name: "veiledCasque",
    },
  );
  const casqueSurface = b.surface(casque);

  for (const s of [1, -1]) {
    const rim = casqueSurface.drape(
      [
        H.p([s * 0.032, 0.011, -0.037]),
        H.p([s * 0.023, 0.031, -0.04]),
        H.p([s * 0.007, 0.086, -0.032]),
        H.p([s * 0.018, 0.055, 0.009]),
        H.p([s * 0.029, 0.016, 0.063]),
      ],
      { lift: 0.0004 },
    );
    b.sweep(rim, 0.00135, {
      bone: head,
      color: C.lemon,
      sides: 6,
      name: "casqueRaisedRim",
    });
  }

  casqueSurface
    .scatter(18, {
      rng: rng(22),
      minDist: 0.006,
      filter: (hit) => Math.abs(hit.n.x) > 0.8 && hit.at.y > 0.18,
    })
    .forEach((hit, i) => {
      b.stick(
        new THREE.CylinderGeometry(0.0015, 0.0015, 0.0008, 6),
        i % 4 === 0 ? C.gold : C.lemon,
        hit,
        { embed: 0.5, name: "casquePearlScale" },
      );
    });

  // Conical, skin-covered turret eyes, rather than exposed white eyeballs.
  const iris = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="#b87b32"/>
      <circle cx="32" cy="32" r="29" fill="#edbe54"/>
      <circle cx="32" cy="32" r="23" fill="#d79735"/>
      <g stroke="#f6d578" stroke-width="2.6" stroke-linecap="round">
        <path d="M32 6v8M32 50v8M6 32h8M50 32h8"/>
        <path d="M14 14l6 6M44 44l6 6M14 50l6-6M44 20l6-6"/>
        <path d="M22 8l3 7M39 49l3 7M8 22l7 3M49 39l7 3"/>
        <path d="M42 8l-3 7M25 49l-3 7M8 42l7-3M49 25l7-3"/>
      </g>
      <circle cx="32" cy="32" r="16" fill="#202e28"/>
      <circle cx="32" cy="32" r="11.5" fill="#101d19"/>
      <ellipse cx="26" cy="24" rx="4.5" ry="3.7" fill="#fff1c0"/>
      <circle cx="38" cy="39" r="1.8" fill="#b1c5a0"/>
    </svg>`,
    { size: 256 },
  );
  const turretPaint = paint((_p, _n, uv) => {
    if (uv[0] > 0.022) return C.lemon;
    if (uv[0] > 0.018) return sunnySkin;
    return cheekSkin;
  });
  const headSurface = b.surface(skull);

  for (const s of [1, -1]) {
    const eyeHit = headSurface.nearest(H.p([s * 0.075, 0.01, 0.013]));
    b.lathe(
      [
        [0.026, -0.004],
        [0.028, 0.002],
        [0.025, 0.01],
        [0.019, 0.019],
        [0.013, 0.024],
        [0.0105, 0.0255],
        [0.0105, 0.021],
        [0.017, 0.012],
        [0.021, -0.004],
      ],
      {
        at: eyeHit,
        axis: eyeHit.n,
        segments: 12,
        bone: head,
        color: turretPaint,
        name: s > 0 ? "eyeTurretL" : "eyeTurretR",
      },
    );

    const aperture = eyeHit.moved([0, 0.0256, 0]);
    b.part(new THREE.CircleGeometry(0.0111, 24), "#ffffff", {
      at: aperture,
      bone: head,
      dir: eyeHit.n,
      axis: "z",
      up: [0, 1, 0],
      texture: iris,
      name: s > 0 ? "irisL" : "irisR",
    });

    b.ring(
      frame(eyeHit.moved([0, 0.0241, 0]), eyeHit.n),
      { count: 14, radius: 0.0123 },
      (bead) =>
        b.part(new THREE.SphereGeometry(0.00085, 6, 4), C.lemon, {
          at: bead,
          name: "eyelidBead",
        }),
    );

    const nostril = headSurface.nearest(H.p([s * 0.021, -0.002, 0.057]));
    b.stick(new THREE.SphereGeometry(0.0021, 8, 4), C.dark, nostril, {
      scale: [1, 0.32, 0.65],
      embed: 0.48,
      name: "nostril",
    });

    const mouthLine = headSurface.drape(
      [
        H.p([s * 0.032, -0.016, -0.007]),
        H.p([s * 0.035, -0.021, 0.025]),
        H.p([s * 0.027, -0.021, 0.051]),
        H.p([s * 0.018, -0.02, 0.065]),
      ],
      { lift: 0.00035 },
    );
    b.sweep(mouthLine, 0.0009, {
      bone: head,
      color: C.dark,
      sides: 6,
      name: "mouthSeam",
    });

    const lip = b.surface(lowerJaw).drape(
      [
        H.p([s * 0.029, -0.026, 0.013]),
        H.p([s * 0.028, -0.025, 0.04]),
        H.p([s * 0.018, -0.023, 0.061]),
      ],
      { lift: 0.0002 },
    );
    b.sweep(lip, 0.00085, {
      bone: jaw,
      color: C.lemon,
      sides: 6,
      name: "lowerLip",
    });
  }

  const frontMouth = headSurface.drape(
    [
      H.p([-0.018, -0.02, 0.066]),
      H.p([0, -0.02, 0.067]),
      H.p([0.018, -0.02, 0.066]),
    ],
    { lift: 0.0003 },
  );
  b.sweep(frontMouth, 0.0008, {
    bone: head,
    color: C.dark,
    sides: 6,
    name: "snoutMouthSeam",
  });

  const legSkin = spots(
    stripes("#76b34b", "#479d74", {
      size: 0.022,
      axis: "y",
      width: 0.24,
      wobble: 0.15,
      seed: 7,
    }),
    "#c5db79",
    { size: 0.0035, amount: 0.17, seed: 12 },
  );
  const palmSkin = scales("#a8cc66", "#80ac4d", {
    size: 0.003,
    width: 0.065,
    seed: 6,
  });

  for (const foot of feet) {
    const limbTube = b.sweep(foot.leg, [0.0135, 0.011, 0.0085, 0.007], {
      color: legSkin,
      sides: 8,
      smooth: false,
      caps: "round",
      name: `limb${foot.tag}`,
    });

    b.part(new THREE.SphereGeometry(1, 8, 6), palmSkin, {
      bone: foot.foot,
      at: foot.foot.local({ up: 0.002 }),
      scale: [0.0105, 0.0065, 0.012],
      flat: true,
      name: `opposablePalm${foot.tag}`,
    });

    for (const digit of foot.digits) {
      b.sweep(digit, [0.0036, 0.0031, 0.0028], {
        color: palmSkin,
        sides: 6,
        smooth: false,
        caps: "round",
        name: "separatedToe",
      });
      b.spike(digit.tip!, digit.tip!, 0.0047, 0.00165, {
        bone: digit.tip!,
        color: C.ivory,
        sides: 6,
        name: "tinyClaw",
      });
    }

    b.surface(limbTube)
      .scatter(7, {
        rng: rng(foot.front ? 71 : 83),
        minDist: 0.009,
        filter: (hit) => hit.n.y > -0.15 && hit.at.y > 0.04,
      })
      .forEach((hit) =>
        b.stick(
          new THREE.CylinderGeometry(0.0017, 0.0017, 0.0008, 6),
          C.lemon,
          hit,
          { embed: 0.55, name: "limbScale" },
        ),
      );
  }

  return b.root;
}
```