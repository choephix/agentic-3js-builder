```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  paint,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Bamboo Break",
  description:
    "A delighted red panda balances on an old moss-covered branch, clutching a leafy bamboo shoot. Sculpted cheek tufts, ivory-rimmed ears, charcoal paws, and a great cream-and-ginger striped tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Bamboo Break", detail: 1, paintSize: 1024 });

  const C = {
    rust: "#AD492D",
    ginger: "#C76234",
    copper: "#D67A43",
    darkRust: "#873825",
    black: "#242124",
    belly: "#302629",
    pad: "#66504B",
    ivory: "#F5E9CF",
    cream: "#EAD6B5",
    tailCream: "#EBC696",
    nose: "#211F23",
    tongue: "#D9857F",
    claw: "#BBAB91",
    bark: "#584034",
    barkLight: "#785542",
    barkDark: "#382D29",
    cut: "#C79964",
    ring: "#886044",
    mossDark: "#405336",
    moss: "#647B3D",
    mossLight: "#8B9D4F",
    mossGold: "#ACAF60",
    bamboo: "#648747",
    bambooLight: "#9BAD5A",
    bambooDark: "#3D633A",
    leaf: "#537D41",
    leafLight: "#80A34F",
  };

  // Skeleton: the scenery has its own stationary root.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 0.592, -0.003],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [hips, [0, 0.73, 0], [0, 0.829, 0.02]],
    {
      parent: hips,
      names: ["spineLower", "spineUpper", "chest"],
      role: "spine",
    },
  );
  const neck = b.chain("neckChain", [spine.at(1), [0, 0.897, 0.05]], {
    parent: spine,
    names: ["neck", "neckTip"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.957, 0.068],
    dir: [0, 0, 1],
    role: "head",
  });
  const H = b.region({ at: head, bone: head });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H.p([0, -0.065, 0.078]),
    dir: [0, -0.15, 1],
    role: "jaw",
  });

  const ears = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const joint = b.joint(`ear${side}`, {
      parent: head,
      at: H.p([s * 0.12, 0.074, -0.009]),
      dir: [s * 0.15, 1, 0],
      role: "hinge",
    });
    return { s, joint, region: b.region({ at: joint, bone: joint }) };
  });

  const tail = b.chain(
    "tail",
    catmull([
      hips.local({ back: 0.115, down: 0.023 }),
      [-0.10, 0.541, -0.254],
      [-0.29, 0.518, -0.321],
      [-0.47, 0.548, -0.305],
      [-0.61, 0.611, -0.215],
      [-0.65, 0.704, -0.108],
    ]),
    { parent: hips, count: 7, role: "tail" },
  );

  type Joint = ReturnType<typeof b.joint>;
  const makeDigit = (name: string, parent: Joint, points: THREE.Vector3[]) =>
    b.chain(name, points, {
      parent,
      role: "digit",
      names: points.map((_, i) => (i === 0 ? name : `${name}_${i}`)),
    });

  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.102, 0.602, -0.012],
        [s * 0.143, 0.512, 0.027],
        [s * 0.127, s > 0 ? 0.451 : 0.442, s > 0 ? 0.035 : 0.018],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.127, s > 0 ? 0.421 : 0.412, 0.04],
      },
    );
    const ankle = leg.joints[leg.joints.length - 1];
    const F = b.region({ at: ankle, bone: ankle });
    const toes = [-1, 0, 1].map((d, i) =>
      makeDigit(`toe${i + 1}${side}`, ankle, [
        F.p([d * 0.029, -0.009, 0.064]),
        F.p([d * 0.036, -0.009, 0.112]),
      ]),
    );
    return { leg, ankle, F, toes };
  });

  const arms = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const positions =
      s > 0
        ? [
            [0.125, 0.803, 0.017],
            [0.236, 0.758, 0.02],
            [0.309, 0.716, 0.105],
            [0.343, 0.711, 0.146],
          ]
        : [
            [-0.125, 0.803, 0.017],
            [-0.23, 0.726, 0.028],
            [-0.29, 0.665, 0.09],
            [-0.305, 0.644, 0.115],
          ];
    const arm = b.chain(`arm${side}`, positions, {
      parent: spine,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    const hand = arm.joints[arm.joints.length - 1];
    const P = b.region({ at: hand, bone: hand });
    const fingers = [-1, 0, 1].map((d, i) =>
      makeDigit(
        `finger${i + 1}${side}`,
        hand,
        s > 0
          ? [
              P.p([-0.014, d * 0.021, 0.014]),
              P.p([0.018, d * 0.021, 0.046]),
              P.p([0.036, d * 0.021, 0.034]),
            ]
          : [
              P.p([d * 0.023, -0.022, 0.006]),
              P.p([d * 0.037, -0.067, 0.026]),
            ],
      ),
    );
    const thumb = makeDigit(
      `thumb${side}`,
      hand,
      s > 0
        ? [
            P.p([0.006, -0.031, -0.001]),
            P.p([0.04, -0.032, 0.007]),
            P.p([0.04, -0.012, 0.029]),
          ]
        : [
            P.p([0.026, -0.003, 0.006]),
            P.p([0.06, -0.028, 0.024]),
          ],
    );
    return { s, arm, hand, P, fingers, thumb };
  });

  // An old, low, rooted branch: a complete support rather than a floating perch.
  const stump = b.sweep(
    catmull([
      [-0.38, 0, -0.02],
      [-0.38, 0.16, -0.02],
      [-0.32, 0.32, 0],
    ]),
    [0.12, 0.103, 0.076],
    { bone: root, color: C.bark, sides: 9, smooth: false, caps: "flat" },
  );
  const roots = [
    [
      [-0.38, 0.077, -0.02],
      [-0.50, 0.042, 0.12],
      [-0.62, 0.024, 0.16],
    ],
    [
      [-0.35, 0.075, -0.02],
      [-0.22, 0.04, -0.13],
      [-0.13, 0.024, -0.18],
    ],
    [
      [-0.39, 0.071, -0.035],
      [-0.49, 0.041, -0.15],
      [-0.57, 0.024, -0.18],
    ],
  ].map((p) =>
    b.sweep(catmull(p), [0.067, 0.036, 0.021], {
      bone: root,
      color: C.bark,
      sides: 7,
      smooth: false,
    }),
  );

  const branchPath = catmull([
    [-0.71, 0.266, 0],
    [-0.43, 0.327, -0.008],
    [0, 0.35, 0],
    [0.43, 0.39, 0.025],
    [0.70, 0.417, 0.055],
  ]);
  const branch = b.sweep(branchPath, [0.087, 0.088, 0.073, 0.049], {
    bone: root,
    color: C.bark,
    sides: 10,
    smooth: false,
    caps: "flat",
    name: "old_branch",
  });

  for (const angle of [38, 91, 151, 216, 280, 325]) {
    b.sweep(branch.line(angle, 0.001).slice(0.025, 0.98), 0.0024, {
      bone: root,
      color: angle % 2 ? C.barkDark : C.barkLight,
      sides: 4,
      caps: "flat",
    });
  }
  for (const angle of [45, 140, 225, 315]) {
    b.sweep(stump.line(angle, 0.001).slice(0.04, 0.89), 0.0031, {
      bone: root,
      color: C.barkDark,
      sides: 4,
    });
  }

  // End grain and the irregular cracks of both exposed ends.
  for (const end of [0, 1]) {
    const p = branchPath.at(end);
    const normal = branchPath.tangentAt(end).multiplyScalar(end === 0 ? -1 : 1);
    const radius = end === 0 ? 0.084 : 0.047;
    const cut = b.part(
      new THREE.CylinderGeometry(radius, radius, 0.004, 10),
      C.cut,
      {
        bone: root,
        at: p.clone().addScaledVector(normal, 0.002),
        dir: normal,
      },
    );
    for (const f of [0.28, 0.55, 0.81]) {
      b.part(new THREE.TorusGeometry(radius * f, 0.00135, 3, 14), C.ring, {
        bone: root,
        at: p.clone().addScaledVector(normal, 0.0045),
        dir: normal,
        axis: "z",
        scale: [1, 0.9, 1],
      });
    }
    const cutFrame = frame(cut, normal);
    for (const a of [0.5, 2.8, 4.7]) {
      const point = (r: number) =>
        cutFrame.local([Math.cos(a) * r, 0.003, Math.sin(a) * r]);
      b.rod(point(radius * 0.5), point(radius * 0.95), 0.0016, {
        bone: root,
        color: C.barkDark,
        sides: 4,
      });
    }
  }

  const twigPaths = [
    [
      [0.41, 0.385, 0.025],
      [0.49, 0.446, -0.032],
      [0.53, 0.477, -0.084],
    ],
    [
      [-0.39, 0.209, 0.023],
      [-0.49, 0.233, 0.132],
      [-0.54, 0.251, 0.173],
    ],
  ];
  for (const points of twigPaths) {
    const path = catmull(points);
    b.sweep(path, [0.034, 0.018], {
      bone: root,
      color: C.bark,
      sides: 7,
      smooth: false,
      caps: "flat",
    });
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.003, 7), C.cut, {
      bone: root,
      at: path.at(1),
      dir: path.tangentAt(1),
    });
  }

  const woodSurface = b.surface([branch, stump, roots]);
  const mossHits = woodSurface.scatter(105, {
    rng: rng(23),
    minDist: 0.019,
    filter: (h) =>
      h.n.y > 0.38 &&
      !(Math.abs(h.at.x) < 0.20 && h.at.y > 0.34 && h.at.z > -0.045),
  });
  const mossColors = [C.moss, C.mossDark, C.mossLight, C.moss, C.mossGold];
  mossHits.forEach((hit, i) => {
    const r = 0.023 + (i % 5) * 0.004;
    b.stick(new THREE.IcosahedronGeometry(1, 0), mossColors[i % 5], hit, {
      scale: [r, 0.009 + (i % 3) * 0.003, r * 0.78],
      embed: 0.6,
      name: "moss_cushion",
    });
    if (i % 6 === 0) {
      b.stick(new THREE.ConeGeometry(0.008, 0.026, 4), C.mossLight, hit, {
        embed: 0.2,
        name: "moss_tip",
      });
    }
  });

  const branchSurface = b.surface(branch);
  for (let i = 0; i < 3; i++) {
    const hit = branchSurface.nearest([0.43 + i * 0.056, 0.44, 0.075]);
    const capAt = hit.local({ up: 0.026 + i * 0.007 });
    b.rod(hit, capAt, 0.0045, { color: C.cream, bone: root, sides: 6 });
    const r = 0.023 - i * 0.003;
    b.lathe(
      [
        [0, -0.002],
        [r, -0.002],
        [r, 0.002],
        [r * 0.74, 0.011],
        [r * 0.32, 0.016],
        [0, 0.017],
      ],
      { at: capAt, bone: root, segments: 8, color: i === 1 ? C.cut : "#B27D45" },
    );
  }

  // Simple, bold body masses, with the black underside painted continuously.
  const coat = paint((p) => {
    const frontBoundary = 0.025 + 0.028 * Math.pow(Math.abs(p.x) / 0.18, 2);
    return p.z > frontBoundary && p.y < 0.855 ? C.belly : C.rust;
  });
  const torso = b.loft(
    [
      { at: hips.local({ down: 0.042 }), w: 0.14, h: 0.13 },
      { at: hips.local({ up: 0.009 }), w: 0.282, h: 0.24 },
      { at: spine.at(0.5), w: 0.324, h: 0.285 },
      { at: spine.at(0.88), w: 0.27, h: 0.245 },
      { at: spine.at(1).local({ up: 0.03 }), w: 0.14, h: 0.13 },
    ],
    {
      bone: [hips, spine],
      color: coat,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "rust_coat_black_belly",
    },
  );
  b.sweep(neck, [0.089, 0.093], {
    color: C.rust,
    sides: 9,
    smooth: false,
  });

  const backMarks = b.surface(torso).scatter(24, {
    rng: rng(8),
    minDist: 0.038,
    filter: (h) => h.n.z < 0.15 && h.at.y > 0.615,
  });
  backMarks.forEach((hit, i) => {
    b.stick(
      new THREE.BoxGeometry(0.009, 0.0035, 0.023 + (i % 3) * 0.005),
      i % 3 === 0 ? C.darkRust : C.ginger,
      hit,
      { embed: 0.5, flow: [0, -1, -0.25], name: "coat_fur_stroke" },
    );
  });

  const tailBands: [number, string][] = [
    [0.12, C.rust],
    [0.22, C.tailCream],
    [0.32, C.ginger],
    [0.425, C.tailCream],
    [0.53, C.ginger],
    [0.635, C.tailCream],
    [0.745, C.ginger],
    [0.85, C.tailCream],
    [0.945, C.ginger],
    [1, C.tailCream],
  ];
  b.sweep(
    tail,
    (t) => {
      const fullness = Math.sin(Math.PI * Math.pow(t, 0.8));
      return 0.036 + 0.052 * fullness - 0.014 * t;
    },
    {
      color: C.ginger,
      bands: tailBands,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "fluffy_ringed_tail",
    },
  );

  for (const { leg, ankle, F, toes } of legs) {
    b.sweep(leg, [0.061, 0.048, 0.033], {
      color: C.black,
      sides: 8,
      smooth: false,
    });
    b.sweep(
      [F.p([0, -0.002, -0.013]), F.p([0, -0.006, 0.058])],
      () => [0.052, 0.029],
      { bone: ankle, color: C.black, sides: 8, caps: "round", smooth: false },
    );
    for (const toe of toes) {
      b.sweep(toe, [0.017, 0.012], { color: C.black, sides: 6 });
      b.spike(toe.at(1), [0, -0.13, 1], 0.014, 0.005, {
        color: C.claw,
        sides: 5,
      });
    }
  }

  for (const { s, arm, hand, P, fingers, thumb } of arms) {
    b.sweep(arm, [0.064, 0.052, 0.034, 0.032], {
      color: C.black,
      bands: [
        [0.15, C.rust],
        [1, C.black],
      ],
      sides: 8,
      smooth: false,
    });
    b.part(new THREE.SphereGeometry(1, 10, 6), C.black, {
      bone: hand,
      at: hand,
      scale: [0.037, 0.039, 0.03],
      flat: true,
    });
    for (const finger of [...fingers, thumb]) {
      b.sweep(finger, [0.0125, 0.009], {
        color: C.black,
        sides: 6,
        caps: "round",
      });
      if (s < 0) {
        b.spike(finger.at(1), [0, -0.6, 0.8], 0.011, 0.0044, {
          color: C.claw,
          sides: 5,
        });
      }
    }
    if (s < 0) {
      b.part(new THREE.SphereGeometry(1, 8, 5), C.pad, {
        bone: hand,
        at: P.p([0, -0.01, 0.029]),
        scale: [0.021, 0.025, 0.004],
      });
    }
  }

  // Rounded head, layered white cheek tufts, and pointed, white-rimmed ears.
  b.part(new THREE.SphereGeometry(1, 14, 10), C.rust, {
    bone: head,
    at: H.p([0, 0.001, -0.009]),
    scale: [0.173, 0.134, 0.13],
    flat: true,
    name: "round_rust_skull",
  });

  const cheekOutline = [
    [-0.025, 0.039],
    [0.006, 0.059],
    [0.042, 0.037],
    [0.039, 0.025],
    [0.071, 0.006],
    [0.044, -0.001],
    [0.059, -0.024],
    [0.026, -0.018],
    [0.029, -0.043],
    [-0.02, -0.029],
  ];
  for (const s of [1, -1]) {
    b.extrude(cheekOutline, {
      at: H.p([s * 0.126, -0.02, 0.057]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.047,
      color: C.ivory,
      bone: head,
      bevel: 0.005,
      detail: 0.5,
      name: "white_cheek_tuft",
    });
  }
  const face = b.part(new THREE.SphereGeometry(1, 16, 10), C.ivory, {
    bone: head,
    at: H.p([0, -0.004, 0.084]),
    scale: [0.161, 0.113, 0.071],
    flat: true,
    name: "white_face",
  });

  const earOutline = [
    [-0.046, 0.008],
    [0.037, 0],
    [0.061, 0.054],
    [0.042, 0.139],
    [0.009, 0.122],
    [-0.047, 0.061],
  ];
  const innerEar = [
    [-0.027, 0.015],
    [0.024, 0.01],
    [0.043, 0.051],
    [0.031, 0.103],
    [0.004, 0.086],
    [-0.03, 0.046],
  ];
  for (const { s, joint, region: E } of ears) {
    b.extrude(earOutline, {
      at: E.p([0, 0, -0.01]),
      x: [s, 0, 0],
      thickness: 0.049,
      color: C.rust,
      bone: joint,
      bevel: 0.003,
      detail: 0.5,
    });
    b.extrude(earOutline, {
      at: E.p([0, 0, 0.014]),
      x: [s, 0, 0],
      thickness: 0.019,
      color: C.ivory,
      bone: joint,
      bevel: 0.003,
      detail: 0.5,
      name: "ivory_ear_rim",
    });
    b.extrude(innerEar, {
      at: E.p([0, 0.005, 0.026]),
      x: [s, 0, 0],
      thickness: 0.008,
      color: C.darkRust,
      bone: joint,
    });
    b.extrude(
      [
        [-0.019, 0.005],
        [0.031, 0.008],
        [0.026, 0.042],
        [0.011, 0.028],
        [0, 0.05],
        [-0.004, 0.025],
      ],
      {
        at: E.p([0, 0.018, 0.032]),
        x: [s, 0, 0],
        thickness: 0.005,
        color: C.cream,
        bone: joint,
      },
    );
  }

  // Tear markings and joyful crescent eyes are painted onto the faceted face.
  const faceDrawing = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
      <defs>
        <g id="eye">
          <path d="M63 69 Q88 51 121 72
                   Q116 105 90 128 L50 148
                   Q69 119 63 69Z" fill="#AE4C31"/>
          <path d="M68 71 Q88 57 112 71" fill="none"
                stroke="#CD7145" stroke-width="7" stroke-linecap="round"/>
          <path d="M72 83 Q91 62 112 81" fill="none"
                stroke="#282124" stroke-width="8" stroke-linecap="round"/>
          <path d="M70 57 Q92 44 114 58" fill="none"
                stroke="#F8ECD2" stroke-width="8" stroke-linecap="round"/>
        </g>
      </defs>
      <use href="#eye"/>
      <use href="#eye" transform="translate(320 0) scale(-1 1)"/>
    </svg>`,
    { size: 512 },
  );
  b.decal(face, faceDrawing, {
    at: H.p([0, 0.009, 0.151]),
    dir: [0, 0, 1],
    size: [0.293, 0.184],
    segments: 16,
    lift: 0.0012,
    bone: head,
    name: "red_tears_and_delighted_eyes",
  });

  // The lower jaw and its chin are independent of the upper muzzle.
  b.part(new THREE.SphereGeometry(1, 12, 6), C.ivory, {
    bone: jaw,
    at: H.p([0, -0.077, 0.14]),
    scale: [0.055, 0.021, 0.034],
    flat: true,
    name: "lower_jaw",
  });
  b.extrude(
    [
      [-0.05, 0.004],
      [-0.024, -0.004],
      [0, -0.008],
      [0.024, -0.004],
      [0.05, 0.004],
      [0.038, -0.019],
      [0.015, -0.03],
      [-0.015, -0.03],
      [-0.038, -0.019],
    ],
    {
      at: H.p([0, -0.05, 0.174]),
      x: [1, 0, 0],
      thickness: 0.012,
      color: C.nose,
      bone: jaw,
      name: "happy_open_mouth",
    },
  );
  b.part(new THREE.SphereGeometry(1, 10, 6), C.tongue, {
    bone: jaw,
    at: H.p([0.004, -0.071, 0.182]),
    scale: [0.022, 0.008, 0.004],
    name: "little_tongue",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 6), C.ivory, {
      bone: head,
      at: H.p([s * 0.029, -0.039, 0.146]),
      scale: [0.039, 0.028, 0.033],
      flat: true,
      name: "upper_muzzle",
    });
  }
  b.extrude(
    [
      [-0.023, 0.008],
      [-0.013, 0.016],
      [0.013, 0.016],
      [0.023, 0.008],
      [0.008, -0.009],
      [0, -0.012],
      [-0.008, -0.009],
    ],
    {
      at: H.p([0, -0.025, 0.188]),
      x: [1, 0, 0],
      thickness: 0.017,
      bevel: 0.003,
      detail: 0.5,
      color: C.nose,
      bone: head,
      name: "button_nose",
    },
  );
  b.part(new THREE.SphereGeometry(1, 8, 4), "#686064", {
    at: H.p([-0.006, -0.017, 0.198]),
    bone: head,
    scale: [0.007, 0.003, 0.0018],
  });
  b.rod(H.p([0, -0.035, 0.188]), H.p([0, -0.052, 0.181]), 0.0026, {
    color: C.nose,
    bone: head,
    sides: 5,
  });
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.0021, 6, 4), C.pad, {
        at: H.p([s * (0.035 + (i % 2) * 0.012), -0.039 - i * 0.007, 0.177]),
        bone: head,
      });
    }
  }

  // Bamboo passes through the curled fingers, not in front of an empty paw.
  const holding = arms[0];
  const grip = holding.P.p([0.02, 0.001, 0.038]);
  const bambooBottom = grip.clone().add(new THREE.Vector3(-0.017, -0.17, 0));
  const bambooTop = grip.clone().add(new THREE.Vector3(0.043, 0.42, -0.003));
  const stemDirection = bambooTop.clone().sub(bambooBottom).normalize();
  const bambooPoint = (t: number) => bambooBottom.clone().lerp(bambooTop, t);

  b.rod(bambooBottom, bambooTop, [0.0125, 0.007], {
    bone: holding.hand,
    color: C.bamboo,
    sides: 8,
    smooth: false,
    name: "bamboo_shoot",
  });
  b.rod(
    bambooBottom.clone().add(new THREE.Vector3(-0.004, 0, 0.01)),
    bambooTop.clone().add(new THREE.Vector3(-0.002, 0, 0.005)),
    0.0018,
    { bone: holding.hand, color: C.bambooLight, sides: 4 },
  );
  for (const t of [0.035, 0.2, 0.39, 0.58, 0.77, 0.94]) {
    const r = 0.014 - t * 0.004;
    b.part(new THREE.CylinderGeometry(r, r, 0.008, 8), C.bambooLight, {
      bone: holding.hand,
      at: bambooPoint(t),
      dir: stemDirection,
    });
    b.part(new THREE.CylinderGeometry(r + 0.0008, r + 0.0008, 0.002, 8), C.bambooDark, {
      bone: holding.hand,
      at: bambooPoint(t).addScaledVector(stemDirection, -0.005),
      dir: stemDirection,
    });
  }
  b.spike(bambooTop, stemDirection, 0.037, 0.007, {
    bone: holding.hand,
    color: C.bambooLight,
    sides: 6,
  });

  const leaf = (base: THREE.Vector3, tip: THREE.Vector3, width: number, i: number) => {
    const d = tip.clone().sub(base);
    const side = new THREE.Vector3(-d.y, d.x, 0).normalize().multiplyScalar(width);
    const middle = base.clone().lerp(tip, 0.49);
    const ridge = middle.clone().add(new THREE.Vector3(0, 0, 0.004));
    const edgeA = middle.clone().add(side);
    const edgeB = middle.clone().sub(side);
    b.slab([base, edgeA, tip, ridge], {
      color: i % 2 ? C.leaf : C.leafLight,
      thickness: 0.0015,
      bone: holding.hand,
      name: "bamboo_leaf_light_half",
    });
    b.slab([base, ridge, tip, edgeB], {
      color: C.leaf,
      thickness: 0.0015,
      bone: holding.hand,
      name: "bamboo_leaf_dark_half",
    });
    b.sweep([base, ridge, tip], [0.0015, 0.0005], {
      color: C.bambooLight,
      bone: holding.hand,
      sides: 4,
      caps: "flat",
    });
  };

  const leafSpecs = [
    { t: 0.60, stem: [0.044, 0.022, 0.007], tip: [0.161, -0.021, 0.012], w: 0.017 },
    { t: 0.73, stem: [0.052, 0.035, -0.002], tip: [0.185, 0.077, -0.007], w: 0.019 },
    { t: 0.73, stem: [0.052, 0.035, -0.002], tip: [0.154, -0.033, 0.008], w: 0.016 },
    { t: 0.86, stem: [-0.018, 0.025, 0.003], tip: [-0.10, 0.085, 0.01], w: 0.016 },
    { t: 0.94, stem: [0.023, 0.032, 0], tip: [0.09, 0.14, -0.009], w: 0.016 },
    { t: 0.94, stem: [0.023, 0.032, 0], tip: [0.155, 0.045, 0.013], w: 0.018 },
  ];
  leafSpecs.forEach((spec, i) => {
    const origin = bambooPoint(spec.t);
    const leafBase = origin.clone().add(new THREE.Vector3(...spec.stem));
    const leafTip = origin.clone().add(new THREE.Vector3(...spec.tip));
    b.rod(origin, leafBase, [0.0035, 0.0018], {
      bone: holding.hand,
      color: C.bambooDark,
      sides: 5,
    });
    leaf(leafBase, leafTip, spec.w, i);
  });

  return b.root;
}
```