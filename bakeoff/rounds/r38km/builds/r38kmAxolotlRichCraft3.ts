import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  paint,
  mottle,
  spots,
  countershade,
  gradient,
  mix,
  offset,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Chibi Axolotl",
  description:
    "A pearlescent little axolotl with a huge smiling head, sparkling eyes, tiny splayed toes, a paddle tail, and six extravagant feather-frilled pink gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi_axolotl", detail: 1, paintSize: 1024 });
  const random = rng(1847);

  const CREAM = "#fff1d7";
  const PALE = "#ffe9df";
  const SPECKLE = "#d89fa7";
  const MOUTH = "#422536";
  const EYE = "#261c31";
  const EYE_RIM = "#bd7389";
  const WHITE = "#ffffff";
  const GILL_DEEP = "#d9477f";
  const GILL_MID = "#f36f9e";
  const GILL_LIGHT = "#ffb3c8";
  const GILL_PALE = "#ffd0dc";
  const FIN_RAY = "#ed9eae";
  const FILAMENT_COLORS = ["#f77fa8", "#ff91b2", "#e96296"];

  const SKIN_BASE = countershade(
    mottle("#f4d4cc", "#ffe7dc", { size: 0.09, seed: 4 }),
    CREAM,
    { level: -0.18, soft: 0.42 },
  );
  const SKIN = spots(SKIN_BASE, SPECKLE, {
    size: 0.058,
    amount: 0.15,
    seed: 12,
  });

  const FIN = paint((_p, _n, s) => {
    const edge = Math.pow(Math.max(0, Math.min(1, s[1])), 1.35);
    const ray = Math.pow(Math.abs(Math.sin(s[0] * Math.PI * 18)), 22);
    const base = mix("#f9d9d2", "#f58ca9", edge * 0.8);
    return mix(base, "#ffbfd0", ray * 0.42);
  });

  const BLUSH = svg(
    `<svg viewBox="0 0 100 62" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="31" rx="45" ry="24" fill="#f58da5" opacity="0.55"/>
      <ellipse cx="50" cy="28" rx="34" ry="15" fill="#ffb4bf" opacity="0.48"/>
      <path d="M29 39 L37 22 M46 42 L54 23 M63 39 L70 24"
        stroke="#d9688b" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
      <ellipse cx="37" cy="17" rx="13" ry="5" fill="#ffd9df" opacity="0.65"/>
    </svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton: a compact quadruped with a broad head, hinged jaw and long tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.15, -0.15],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.15, -0.15],
      [0, 0.17, -0.025],
      [0, 0.195, 0.105],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.195, 0.105],
      [0, 0.235, 0.205],
    ],
    {
      parent: spine.tip!,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.255, 0.215],
    dir: [0, 0.04, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.205, 0.255],
    dir: [0, -0.08, 1],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.15, -0.205],
      [0, 0.125, -0.34],
      [0, 0.135, -0.475],
      [0, 0.175, -0.605],
      [0, 0.225, -0.72],
    ]),
    {
      parent: hips,
      count: 5,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
      role: "tail",
    },
  );

  const legRecords: Array<{
    label: string;
    side: number;
    kind: string;
    chain: ReturnType<typeof b.chain>;
    paw: THREE.Vector3;
  }> = [];

  const toeRecords: Array<{
    joint: ReturnType<typeof b.joint>;
    start: THREE.Vector3;
    end: THREE.Vector3;
    radius: number;
  }> = [];

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";
    for (const kind of ["F", "H"]) {
      const front = kind === "F";
      const root = front
        ? new THREE.Vector3(side * 0.103, 0.17, 0.085)
        : new THREE.Vector3(side * 0.098, 0.15, -0.145);
      const middle = front
        ? new THREE.Vector3(side * 0.165, 0.102, 0.125)
        : new THREE.Vector3(side * 0.172, 0.096, -0.175);
      const foot = front
        ? new THREE.Vector3(side * 0.205, 0.043, 0.18)
        : new THREE.Vector3(side * 0.215, 0.043, -0.205);
      const paw = foot
        .clone()
        .add(new THREE.Vector3(side * 0.008, -0.014, front ? 0.027 : 0.018));

      const names = front
        ? [`shoulder${label}`, `elbow${label}`, `footF${label}`]
        : [`hipH${label}`, `kneeH${label}`, `footH${label}`];

      const chain = b.chain(`leg${kind}${label}`, [root, middle, foot], {
        parent: front ? spine.tip! : hips,
        names,
        role: "leg",
        contact: [paw.x, 0, paw.z + 0.035],
      });

      legRecords.push({ label, side, kind, chain, paw });

      const toeCount = front ? 4 : 5;
      const spacing = front ? 0.021 : 0.0175;
      for (let i = 0; i < toeCount; i++) {
        const centered = i - (toeCount - 1) / 2;
        const lateral = centered * spacing;
        const start = new THREE.Vector3(
          paw.x + lateral * 0.72,
          0.0105,
          paw.z + 0.039 - Math.abs(centered) * 0.002,
        );
        const end = new THREE.Vector3(
          paw.x + lateral * 1.18,
          0.0105,
          paw.z + 0.087 - Math.abs(centered) * 0.006,
        );
        const toeName = `toe${kind}${label}${i + 1}`;
        const joint = b.joint(toeName, {
          parent: chain.tip!,
          at: start,
          dir: end.clone().sub(start),
          role: "digit",
        });
        toeRecords.push({ joint, start, end, radius: front ? 0.0105 : 0.0098 });
      }
    }
  }

  // Three gill plumes per side, each with its own flexible central stalk.
  const gillRecords: Array<{
    side: number;
    branch: number;
    base: THREE.Vector3;
    tip: THREE.Vector3;
    chain: ReturnType<typeof b.chain>;
  }> = [];

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";
    const specs = [
      {
        base: new THREE.Vector3(side * 0.132, 0.325, 0.19),
        tip: new THREE.Vector3(side * 0.305, 0.465, 0.065),
      },
      {
        base: new THREE.Vector3(side * 0.151, 0.278, 0.17),
        tip: new THREE.Vector3(side * 0.36, 0.303, 0.025),
      },
      {
        base: new THREE.Vector3(side * 0.133, 0.235, 0.185),
        tip: new THREE.Vector3(side * 0.292, 0.135, 0.06),
      },
    ];

    specs.forEach((spec, branch) => {
      const control = spec.base
        .clone()
        .lerp(spec.tip, 0.48)
        .add(new THREE.Vector3(side * 0.025, branch === 2 ? -0.006 : 0.016, 0.014));
      const chain = b.chain(
        `gill${label}${branch + 1}`,
        catmull([spec.base, control, spec.tip]),
        {
          parent: head,
          count: 3,
          names: [
            `gill${label}${branch + 1}a`,
            `gill${label}${branch + 1}b`,
            `gill${label}${branch + 1}c`,
          ],
          role: "tentacle",
        },
      );
      gillRecords.push({ side, branch, base: spec.base, tip: spec.tip, chain });
    });
  }

  // ---------------------------------------------------------------------------
  // Body and tail skin.
  // ---------------------------------------------------------------------------

  const keyed = (t: number, values: number[]) => {
    const q = Math.max(0, Math.min(1, t)) * (values.length - 1);
    const i = Math.min(values.length - 2, Math.floor(q));
    let f = q - i;
    f = f * f * (3 - 2 * f);
    return values[i] * (1 - f) + values[i + 1] * f;
  };

  const bodyPath = catmull([
    [0, 0.145, -0.245],
    [0, 0.15, -0.15],
    [0, 0.165, -0.035],
    [0, 0.19, 0.075],
    [0, 0.215, 0.16],
    [0, 0.228, 0.21],
  ]);

  b.sweep(
    bodyPath,
    (t) => [
      keyed(t, [0.072, 0.112, 0.137, 0.119, 0.073]),
      keyed(t, [0.056, 0.086, 0.103, 0.087, 0.059]),
    ],
    {
      bone: [hips, spine, neck],
      color: SKIN,
      sides: 14,
      caps: "round",
      name: "plump_body",
    },
  );

  b.sweep(
    tail,
    (t) => [
      0.074 * Math.pow(1 - t, 1.1) + 0.003,
      0.052 * Math.pow(1 - t, 0.9) + 0.006,
    ],
    {
      color: SKIN,
      sides: 12,
      caps: { start: "round", end: "point" },
      name: "tail_core",
    },
  );

  // Broad, soft dorsal and ventral membranes make the characteristic paddle.
  const finSamples = [0, 0.12, 0.27, 0.43, 0.6, 0.76, 0.89, 1];
  const topFrames = finSamples.map((t) => {
    const center = tail.at(t);
    const height =
      (0.048 + 0.105 * Math.pow(Math.sin(Math.PI * t), 0.82)) *
        (1 - 0.72 * t) +
      0.002;
    return center.moved(offset(center.at, [0, 1, 0], height));
  });
  const bottomFrames = finSamples.map((t) => {
    const center = tail.at(t);
    const height =
      (0.037 + 0.08 * Math.pow(Math.sin(Math.PI * t), 0.85)) *
        (1 - 0.76 * t) +
      0.002;
    return center.moved(offset(center.at, [0, -1, 0], height));
  });

  const topPath = catmull(topFrames);
  const bottomPath = catmull(bottomFrames);

  b.membrane(tail, topPath, {
    color: FIN,
    thickness: 0.005,
    rows: 7,
    name: "dorsal_tail_fin",
  });
  b.membrane(tail, bottomPath, {
    color: FIN,
    thickness: 0.005,
    rows: 7,
    name: "ventral_tail_fin",
  });
  b.sweep(topPath, 0.0038, {
    color: GILL_LIGHT,
    sides: 6,
    name: "upper_fin_rim",
  });
  b.sweep(bottomPath, 0.0034, {
    color: "#f8a7b9",
    sides: 6,
    name: "lower_fin_rim",
  });

  for (let i = 1; i < finSamples.length - 1; i++) {
    const t = finSamples[i];
    const center = tail.at(t).at;
    for (const outer of [topFrames[i], bottomFrames[i]]) {
      const middle = center
        .clone()
        .lerp(outer.at, 0.55)
        .add(new THREE.Vector3(0, 0, -0.004));
      b.sweep(bezier(center, middle, outer.at), [0.0025, 0.0012], {
        bone: tail.jointAt(t),
        color: FIN_RAY,
        sides: 5,
        name: "fin_ray",
      });
    }
  }

  // A low soft ridge continues the tail fin onto the rear back.
  b.sweep(
    catmull([
      [0, 0.229, -0.26],
      [0, 0.25, -0.19],
      [0, 0.257, -0.09],
      [0, 0.263, -0.015],
    ]),
    [0.009, 0.003],
    {
      bone: [hips, spine],
      color: "#f3b7ba",
      sides: 7,
      caps: "point",
      name: "back_fin_root",
    },
  );

  // ---------------------------------------------------------------------------
  // Big chibi head, separate jaws and an unmistakable smile.
  // ---------------------------------------------------------------------------

  const sphere16 = new THREE.SphereGeometry(1, 16, 12);
  const sphere12 = new THREE.SphereGeometry(1, 12, 8);
  const sphere8 = new THREE.SphereGeometry(1, 8, 6);

  const skull = b.part(sphere16, SKIN, {
    bone: head,
    at: [0, 0.292, 0.296],
    scale: [0.188, 0.126, 0.147],
    flat: true,
    name: "wide_axolotl_skull",
  });

  const cheeks: ReturnType<typeof b.part>[] = [];
  for (const side of [1, -1]) {
    cheeks.push(
      b.part(sphere12, SKIN, {
        bone: head,
        at: [side * 0.117, 0.247, 0.354],
        scale: [0.092, 0.071, 0.087],
        name: "round_cheek",
      }),
    );
  }

  b.part(sphere12, CREAM, {
    bone: head,
    at: [0, 0.24, 0.403],
    scale: [0.127, 0.049, 0.06],
    name: "upper_jaw",
  });
  for (const side of [1, -1]) {
    b.part(sphere12, PALE, {
      bone: head,
      at: [side * 0.052, 0.247, 0.416],
      scale: [0.069, 0.039, 0.048],
      name: "muzzle_puff",
    });
  }

  b.part(sphere12, CREAM, {
    bone: jaw,
    at: [0, 0.187, 0.384],
    scale: [0.118, 0.034, 0.068],
    name: "lower_jaw",
  });
  b.part(sphere12, MOUTH, {
    bone: jaw,
    at: [0, 0.21, 0.438],
    scale: [0.098, 0.015, 0.024],
    name: "smile_opening",
  });
  b.sweep(
    catmull([
      [-0.098, 0.224, 0.435],
      [-0.052, 0.213, 0.46],
      [0, 0.207, 0.47],
      [0.052, 0.213, 0.46],
      [0.098, 0.224, 0.435],
    ]),
    0.0045,
    {
      bone: head,
      color: MOUTH,
      sides: 7,
      name: "happy_smile",
    },
  );
  b.part(sphere8, "#f68ca5", {
    bone: jaw,
    at: [0, 0.201, 0.463],
    scale: [0.026, 0.008, 0.011],
    name: "tiny_tongue",
  });

  for (const side of [1, -1]) {
    b.part(sphere8, "#9c6471", {
      bone: head,
      at: [side * 0.034, 0.267, 0.46],
      scale: [0.0055, 0.004, 0.0035],
      name: "nostril",
    });
    b.part(sphere8, MOUTH, {
      bone: head,
      at: [side * 0.098, 0.224, 0.438],
      scale: [0.0055, 0.006, 0.004],
      name: "smile_dimple",
    });

    for (let i = 0; i < 3; i++) {
      b.part(sphere8, "#d7969b", {
        bone: head,
        at: [
          side * (0.061 + i * 0.014),
          0.246 + (i % 2) * 0.009,
          0.455 - i * 0.006,
        ],
        scale: [0.0034, 0.0034, 0.0022],
        name: "muzzle_freckle",
      });
    }
  }

  // Glossy raised eyes, with independent catchlights and a pink lower reflection.
  for (const side of [1, -1]) {
    const at = new THREE.Vector3(side * 0.105, 0.337, 0.397);
    const direction = new THREE.Vector3(side * 0.3, 0.08, 1).normalize();

    b.part(sphere12, EYE_RIM, {
      bone: head,
      at,
      dir: direction,
      axis: "z",
      scale: [0.051, 0.06, 0.019],
      name: "soft_eye_rim",
    });

    const eye = b.part(sphere16, EYE, {
      bone: head,
      at: offset(at, direction, 0.008),
      dir: direction,
      axis: "z",
      scale: [0.043, 0.052, 0.027],
      name: "glossy_eye",
    });

    b.part(sphere12, WHITE, {
      bone: head,
      at: eye.local([-0.012, 0.017, 0.025]),
      quat: eye.quat,
      scale: [0.0105, 0.013, 0.0055],
      name: "large_eye_catchlight",
    });
    b.part(sphere8, WHITE, {
      bone: head,
      at: eye.local([0.012, -0.007, 0.027]),
      quat: eye.quat,
      scale: [0.0052, 0.0058, 0.0035],
      name: "small_eye_catchlight",
    });
    b.part(sphere8, "#b77baf", {
      bone: head,
      at: eye.local([-0.003, -0.025, 0.023]),
      quat: eye.quat,
      scale: [0.014, 0.005, 0.003],
      name: "violet_eye_reflection",
    });

    b.sweep(
      bezier(
        eye.local([-0.041, 0.021, 0.015]),
        eye.local([0, 0.061, 0.008]),
        eye.local([0.041, 0.021, 0.015]),
      ),
      0.0035,
      {
        bone: head,
        color: "#a8647c",
        sides: 6,
        name: "upper_eyelid",
      },
    );

    b.sweep(
      bezier(
        [side * 0.066, 0.405, 0.382],
        [side * 0.105, 0.419, 0.387],
        [side * 0.143, 0.4, 0.368],
      ),
      0.0034,
      {
        bone: head,
        color: "#c47f8d",
        sides: 6,
        name: "soft_brow",
      },
    );

    b.decal([skull, ...cheeks], BLUSH, {
      at: [side * 0.143, 0.257, 0.403],
      dir: [side * 0.43, -0.06, 1],
      size: [0.055, 0.034],
      mirror: side < 0,
      name: "rosy_cheek",
    });
  }

  // Sparse raised freckles over the crown complement the painted skin speckles.
  const crownFreckles = b.surface(skull).scatter(18, {
    rng: random,
    minDist: 0.025,
    filter: (h) => h.n.y > 0.28 && h.at.z < 0.37 && h.at.y > 0.32,
  });
  for (const hit of crownFreckles) {
    b.stick(sphere8, "#dea4a7", hit, {
      embed: 0.48,
      scale: [0.0055, 0.0018, 0.0055],
      name: "crown_freckle",
    });
  }

  // ---------------------------------------------------------------------------
  // Signature gills: six curved stalks and hundreds of fine feather branches.
  // ---------------------------------------------------------------------------

  for (const gill of gillRecords) {
    const { side, branch, base, tip, chain } = gill;

    b.part(sphere12, "#e8869d", {
      bone: head,
      at: base,
      scale: [0.024, 0.022, 0.025],
      name: "gill_socket",
    });
    b.part(sphere8, GILL_LIGHT, {
      bone: head,
      at: offset(base, [side, branch === 2 ? -0.2 : 0.2, -0.15], 0.009),
      scale: [0.012, 0.014, 0.012],
      name: "gill_socket_highlight",
    });

    b.sweep(chain, (t) => 0.0135 * (1 - t) + 0.0038, {
      color: gradient(GILL_DEEP, GILL_LIGHT, base, tip),
      sides: 8,
      caps: "round",
      name: "feather_gill_stalk",
    });

    const tangent = tip.clone().sub(base).normalize();
    const across = new THREE.Vector3(0, 0, 1)
      .addScaledVector(tangent, -tangent.z)
      .normalize();
    const outward = new THREE.Vector3().crossVectors(tangent, across).normalize();
    if (outward.x * side < 0) outward.negate();

    const plumeScale = branch === 1 ? 1.12 : branch === 0 ? 0.96 : 0.87;
    const rows = 12;

    for (let row = 0; row < rows; row++) {
      const t = 0.1 + (row / (rows - 1)) * 0.82;
      const cp = chain.at(t);
      const fullness = Math.pow(Math.sin(Math.PI * (t * 0.94 + 0.03)), 0.65);
      const baseLength = (0.026 + 0.047 * fullness) * plumeScale;

      for (const sign of [1, -1]) {
        const length = baseLength * (0.91 + random() * 0.18);
        const start = cp.at.clone();
        const end = start
          .clone()
          .addScaledVector(across, sign * length)
          .addScaledVector(tangent, length * 0.29)
          .addScaledVector(outward, 0.008 + length * 0.08);
        const control = start
          .clone()
          .addScaledVector(across, sign * length * 0.53)
          .addScaledVector(tangent, length * 0.055)
          .addScaledVector(outward, 0.014);

        const color =
          FILAMENT_COLORS[
            (row + branch + (sign > 0 ? 1 : 0)) % FILAMENT_COLORS.length
          ];

        b.sweep(bezier(start, control, end), [0.0033, 0.00075], {
          bone: cp.bone,
          color,
          sides: 5,
          detail: 0.72,
          caps: "round",
          name: "pink_gill_filament",
        });

        if (row % 4 === 1 && sign > 0) {
          b.part(sphere8, GILL_PALE, {
            bone: cp.bone,
            at: end,
            scale: [0.0022, 0.0022, 0.0022],
            name: "gill_filament_glint",
          });
        }
      }
    }

    // A shorter forward-facing row gives each plume a soft, three-dimensional heart.
    for (let row = 0; row < 6; row++) {
      const t = 0.2 + row * 0.115;
      const cp = chain.at(t);
      const length = (0.025 + 0.014 * Math.sin(Math.PI * t)) * plumeScale;
      const start = cp.at.clone();
      const end = start
        .clone()
        .addScaledVector(outward, length)
        .addScaledVector(across, (row % 2 ? 1 : -1) * length * 0.35)
        .addScaledVector(tangent, length * 0.18);
      const control = start
        .clone()
        .lerp(end, 0.55)
        .addScaledVector(tangent, -0.006);
      b.sweep(bezier(start, control, end), [0.0028, 0.00065], {
        bone: cp.bone,
        color: row % 2 ? GILL_LIGHT : GILL_MID,
        sides: 5,
        detail: 0.7,
        caps: "round",
        name: "inner_gill_filament",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Stubby legs, soft paws and individually articulated little toes.
  // ---------------------------------------------------------------------------

  for (const leg of legRecords) {
    b.sweep(leg.chain, (t) => 0.034 * (1 - t) + 0.021, {
      color: SKIN,
      sides: 9,
      caps: "round",
      name: "stubby_leg",
    });

    b.part(sphere12, SKIN, {
      bone: leg.chain.joints[0],
      at: leg.chain.joints[0].at,
      scale: [0.043, 0.039, 0.043],
      name: "rounded_leg_socket",
    });

    b.part(sphere12, SKIN_BASE, {
      bone: leg.chain.tip!,
      at: leg.paw,
      scale: [leg.kind === "F" ? 0.052 : 0.055, 0.027, 0.061],
      name: "soft_paw",
    });

    // A tiny pale wrist accent keeps the paw readable against the body.
    b.sweep(
      catmull([
        [leg.paw.x - 0.034, 0.046, leg.paw.z - 0.016],
        [leg.paw.x, 0.051, leg.paw.z - 0.022],
        [leg.paw.x + 0.034, 0.046, leg.paw.z - 0.016],
      ]),
      0.003,
      {
        bone: leg.chain.tip!,
        color: PALE,
        sides: 6,
        name: "paw_highlight",
      },
    );
  }

  for (const toe of toeRecords) {
    b.capsule(toe.start, toe.end, toe.radius, {
      bone: toe.joint,
      color: PALE,
      sides: 7,
      name: "rounded_toe",
    });
    b.part(sphere8, CREAM, {
      bone: toe.joint,
      at: toe.end,
      scale: [toe.radius * 0.72, toe.radius * 0.45, toe.radius * 0.72],
      name: "toe_tip",
    });
  }

  return b.root;
}
