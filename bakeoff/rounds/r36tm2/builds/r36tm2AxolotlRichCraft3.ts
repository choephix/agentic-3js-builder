import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A cute low-poly axolotl with a wide smiling face, tiny feet, a finned tail, and three pairs of frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const PINK = cel("#e98da8", "#b94e75");
  const PALE_PINK = cel("#ffb4c4", "#db6d91");
  const BELLY = cel("#ffd9d5", "#ef9eac");
  const DARK_PINK = "#9c3f65";
  const INK_PURPLE = INK;
  const EYE_WHITE = "#fff8ef";
  const IRIS = cel("#58d6d2", "#218a9b");
  const BLACK = "#171526";
  const MINT = cel("#b9f0dc", "#65bea9");
  const TOADSTOOL = cel("#f49aaf", "#bd5579");

  // ---------------------------------------------------------------------------
  // Skeleton first: one grounded body, a short tail, four splayed legs, jaw,
  // toes, and six named external gill filaments.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.42, -0.12],
    dir: [0, 0.02, 1],
    role: "spine",
  });

  const torso = b.chain(
    "torso",
    catmull([
      [0, 0.43, -0.28],
      [0, 0.47, -0.08],
      [0, 0.52, 0.14],
      [0, 0.62, 0.31],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "spine3", "shoulders"],
      role: "spine",
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.43, -0.22],
      [0, 0.38, -0.48],
      [0, 0.31, -0.78],
      [0, 0.26, -1.03],
      [0, 0.24, -1.23],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const head = b.joint("head", {
    parent: torso.tip!,
    at: [0, 0.73, 0.39],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.64, 0.56],
    dir: [0, -0.2, 1],
    role: "jaw",
    group: "face",
  });

  const limbChains: Array<{
    side: number;
    kind: "front" | "hind";
    chain: ReturnType<typeof b.chain>;
    foot: THREE.Vector3;
  }> = [];

  const legSpecs = [
    { side: 1, kind: "front" as const, hip: [0.19, 0.56, 0.22] as [number, number, number], foot: [0.31, 0.105, 0.31] as [number, number, number] },
    { side: -1, kind: "front" as const, hip: [-0.19, 0.56, 0.22] as [number, number, number], foot: [-0.31, 0.105, 0.31] as [number, number, number] },
    { side: 1, kind: "hind" as const, hip: [0.2, 0.46, -0.14] as [number, number, number], foot: [0.34, 0.105, -0.28] as [number, number, number] },
    { side: -1, kind: "hind" as const, hip: [-0.2, 0.46, -0.14] as [number, number, number], foot: [-0.34, 0.105, -0.28] as [number, number, number] },
  ];

  for (const spec of legSpecs) {
    const s = spec.side;
    const suffix = s > 0 ? "L" : "R";
    const isFront = spec.kind === "front";
    const knee: [number, number, number] = [
      s * (isFront ? 0.29 : 0.31),
      isFront ? 0.34 : 0.29,
      isFront ? 0.28 : -0.08,
    ];
    const ankle: [number, number, number] = [
      s * (isFront ? 0.33 : 0.37),
      0.15,
      isFront ? 0.33 : -0.25,
    ];
    const chain = b.chain(
      `${spec.kind}Leg${suffix}`,
      [spec.hip, knee, ankle, spec.foot],
      {
        parent: hips,
        names: [
          `${spec.kind}Hip${suffix}`,
          `${spec.kind}Knee${suffix}`,
          `${spec.kind}Ankle${suffix}`,
          `${spec.kind}Foot${suffix}`,
        ],
        role: "leg",
        contact: spec.foot,
      },
    );
    limbChains.push({ side: s, kind: spec.kind, chain, foot: new THREE.Vector3(...spec.foot) });

    // Three tiny, separated digits per foot.
    for (let d = 0; d < 3; d++) {
      const spread = (d - 1) * 0.055;
      const toeEnd: [number, number, number] = [
        spec.foot[0] + spread,
        0.075,
        spec.foot[2] + (isFront ? 0.105 : -0.095),
      ];
      b.chain(
        `${spec.kind}Toe${suffix}${d + 1}`,
        [
          spec.foot,
          [spec.foot[0] + spread * 0.45, 0.085, spec.foot[2] + (isFront ? 0.045 : -0.04)],
          toeEnd,
        ],
        {
          parent: chain.tip!,
          names: [`${spec.kind}ToeBase${suffix}${d + 1}`, `${spec.kind}ToeTip${suffix}${d + 1}`],
          role: "digit",
        },
      );
    }
  }

  const gillChains: Array<{
    side: number;
    index: number;
    chain: ReturnType<typeof b.chain>;
  }> = [];

  for (const s of [1, -1]) {
    const sideName = s > 0 ? "L" : "R";
    for (let i = 0; i < 3; i++) {
      const z = 0.29 - i * 0.095;
      const base: [number, number, number] = [s * 0.215, 0.82 - i * 0.018, z];
      const mid: [number, number, number] = [s * (0.31 + i * 0.008), 0.88 + i * 0.018, z - 0.015];
      const tip: [number, number, number] = [s * (0.42 + i * 0.012), 0.98 + i * 0.025, z - 0.035];
      const chain = b.chain(
        `gill${sideName}${i + 1}`,
        [base, mid, tip],
        {
          parent: head,
          names: [`gill${sideName}${i + 1}Base`, `gill${sideName}${i + 1}Mid`, `gill${sideName}${i + 1}Tip`],
          role: "fan",
        },
      );
      gillChains.push({ side: s, index: i, chain });
    }
  }

  // ---------------------------------------------------------------------------
  // Main body masses
  // ---------------------------------------------------------------------------

  const bodyPaint = cel("#a9e5d0", "#55a990");
  const body = b.sweep(torso, (t) => 0.255 - t * 0.035, {
    color: bodyPaint,
    sides: 8,
    caps: "round",
    group: "body",
    name: "rounded torso",
  });

  const belly = b.sweep(torso, (t) => 0.257 - t * 0.036, {
    color: BELLY,
    sectors: [[105, 255, BELLY]],
    sides: 8,
    caps: "none",
    group: "belly",
    name: "soft belly",
  });

  const tailTube = b.sweep(tail, (t) => 0.18 * (1 - t) + 0.025, {
    color: bodyPaint,
    sides: 7,
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "tapered tail",
  });

  // A thin, broad upright caudal fin gives the tail its salamander silhouette.
  b.extrude(
    [
      [-0.03, 0],
      [0.13, 0.08],
      [0.19, 0.35],
      [0.13, 0.76],
      [0.035, 0.94],
      [-0.025, 0.74],
      [-0.08, 0.32],
    ],
    {
      at: [0, 0.23, -0.62],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.006,
      smoothing: 1,
      color: PALE_PINK,
      bone: tail.joints[1],
      group: "tail-fin",
      name: "tail fin",
    },
  );

  // Head: oversized and slightly flattened, the main chibi read.
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), bodyPaint, {
    bone: head,
    at: [0, 0.77, 0.42],
    scale: [0.34, 0.285, 0.29],
    group: "head",
    name: "big round head",
    flat: true,
  });

  // Pale lower face / throat patch.
  b.part(new THREE.SphereGeometry(1, 10, 8), BELLY, {
    bone: head,
    at: [0, 0.69, 0.59],
    scale: [0.235, 0.16, 0.105],
    group: "face",
    name: "cream muzzle",
    flat: true,
  });

  // Two little cheek puffs make the face wider and softer.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), PALE_PINK, {
      bone: head,
      at: [s * 0.245, 0.70, 0.51],
      scale: [0.105, 0.105, 0.105],
      group: "face",
      name: s > 0 ? "left cheek" : "right cheek",
      flat: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Face
  // ---------------------------------------------------------------------------

  const eyeTexture = animeEye({
    iris: "#42cbd0",
    irisLight: "#a8fff1",
    irisDark: "#1c657a",
    blush: "#f184a1",
    size: 256,
  });

  const eyeSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeAt = new THREE.Vector3(s * 0.125, 0.805, 0.657);
    const eye = b.part(new THREE.SphereGeometry(1, 10, 8), EYE_WHITE, {
      bone: head,
      at: eyeAt,
      scale: [0.108, 0.125, 0.07],
      group: "eyes",
      name: s > 0 ? "left eye white" : "right eye white",
      flat: true,
    });

    b.part(new THREE.SphereGeometry(1, 8, 6), IRIS, {
      bone: head,
      at: [s * 0.125, 0.81, 0.718],
      scale: [0.066, 0.078, 0.025],
      group: "eyes",
      name: s > 0 ? "left turquoise iris" : "right turquoise iris",
      flat: true,
    });

    b.part(new THREE.SphereGeometry(1, 7, 5), BLACK, {
      bone: head,
      at: [s * 0.125, 0.81, 0.741],
      scale: [0.026, 0.048, 0.012],
      group: "eyes",
      name: s > 0 ? "left pupil" : "right pupil",
      flat: true,
    });

    // A tiny decal adds graphic lashes and highlights without losing the chunky eye volume.
    const hit = eyeSurface.around(eyeAt).at(s * 32, 3);
    if (hit) {
      b.decal(eyeSurface, eyeTexture, {
        at: hit.at,
        dir: hit.n,
        size: [0.13, 0.16],
        lift: 0.004,
        mirror: s > 0,
        group: "eye decals",
        name: s > 0 ? "left anime eye" : "right anime eye",
      });
    }
  }

  // Soft brows, nostrils, and a small button nose.
  for (const s of [1, -1]) {
    b.rod(
      [s * 0.115, 0.93, 0.655],
      [s * 0.185, 0.945, 0.65],
      0.014,
      INK_PURPLE,
      { bone: head, caps: "round", group: "face", name: "expressive brow" },
    );
    b.part(new THREE.SphereGeometry(1, 6, 4), DARK_PINK, {
      bone: head,
      at: [s * 0.045, 0.705, 0.704],
      scale: [0.018, 0.014, 0.009],
      group: "face",
      name: "nostril",
    });
  }

  b.part(new THREE.SphereGeometry(1, 8, 5), DARK_PINK, {
    bone: head,
    at: [0, 0.704, 0.718],
    scale: [0.042, 0.032, 0.027],
    group: "face",
    name: "button nose",
    flat: true,
  });

  // Separate upper and lower mouth shapes: the jaw is visibly a hinged piece.
  b.rod(
    [-0.115, 0.655, 0.685],
    [0.115, 0.655, 0.685],
    0.018,
    INK_PURPLE,
    { bone: head, caps: "round", group: "mouth", name: "smiling upper mouth" },
  );

  b.part(new THREE.SphereGeometry(1, 8, 5), BELLY, {
    bone: jaw,
    at: [0, 0.625, 0.68],
    scale: [0.13, 0.045, 0.08],
    group: "jaw",
    name: "lower jaw",
    flat: true,
  });

  b.rod(
    [-0.095, 0.645, 0.705],
    [0.095, 0.645, 0.705],
    0.009,
    INK_PURPLE,
    { bone: jaw, caps: "round", group: "mouth", name: "open mouth line" },
  );

  // ---------------------------------------------------------------------------
  // Legs and toes
  // ---------------------------------------------------------------------------

  for (const entry of limbChains) {
    const s = entry.side;
    const front = entry.kind === "front";
    const suffix = s > 0 ? "L" : "R";
    const legPaint = front ? bodyPaint : cel("#8edbc2", "#4d9d88");

    b.sweep(entry.chain, [0.065, 0.048, 0.035, 0.027], {
      color: legPaint,
      sides: 7,
      caps: "round",
      group: "legs",
      name: `${entry.kind} leg ${suffix}`,
    });

    b.part(new THREE.SphereGeometry(1, 8, 5), PALE_PINK, {
      bone: entry.chain.tip!,
      at: entry.foot,
      scale: [0.085, 0.045, 0.095],
      group: "feet",
      name: `${entry.kind} paw ${suffix}`,
      flat: true,
    });

    for (let d = 0; d < 3; d++) {
      const spread = (d - 1) * 0.055;
      const toeStart: [number, number, number] = [
        entry.foot.x + spread * 0.35,
        0.085,
        entry.foot.z + (front ? 0.025 : -0.02),
      ];
      const toeEnd: [number, number, number] = [
        entry.foot.x + spread,
        0.055,
        entry.foot.z + (front ? 0.105 : -0.095),
      ];
      b.rod(toeStart, toeEnd, 0.018, PALE_PINK, {
        bone: entry.chain.tip!,
        caps: "round",
        group: "digits",
        name: `${entry.kind} toe ${suffix} ${d + 1}`,
      });
      b.part(new THREE.SphereGeometry(1, 6, 4), DARK_PINK, {
        bone: entry.chain.tip!,
        at: toeEnd,
        scale: [0.021, 0.012, 0.026],
        group: "digits",
        name: `${entry.kind} toe pad ${suffix} ${d + 1}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Frilly pink gills: each side has three branching stalks, with repeated
  // triangular filaments along the stalks to create a readable fan silhouette.
  // ---------------------------------------------------------------------------

  for (const g of gillChains) {
    const s = g.side;
    const pink = g.index === 1 ? PALE_PINK : PINK;
    const stalk = b.sweep(g.chain, [0.034, 0.023, 0.009], {
      color: pink,
      sides: 7,
      caps: { start: "round", end: "point" },
      group: "gills",
      name: `pink gill stalk ${s > 0 ? "L" : "R"} ${g.index + 1}`,
    });

    b.along(stalk, 5, (at) => {
      const outward = new THREE.Vector3(s, 0.16, -0.12).normalize();
      b.spike(at, outward, 0.065 + g.index * 0.006, 0.012, {
        color: pink,
        caps: "point",
        group: "gill frills",
        name: `gill filament ${s > 0 ? "L" : "R"} ${g.index + 1}`,
      });
      b.spike(at, new THREE.Vector3(s, 0.03, 0.2).normalize(), 0.043, 0.009, {
        color: PALE_PINK,
        caps: "point",
        group: "gill frills",
        name: `gill inner filament ${s > 0 ? "L" : "R"} ${g.index + 1}`,
      });
    });
  }

  // Small translucent-looking finlets behind the gills emphasize their fan shape.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = 0.30 - i * 0.095;
      b.extrude(
        [
          [0, 0],
          [0.06, 0.03],
          [0.11, 0.105],
          [0.025, 0.075],
        ],
        {
          at: [s * 0.26, 0.82 - i * 0.015, z],
          x: [s, 0, 0],
          y: [0, 0.2, 1],
          thickness: 0.009,
          bevel: 0.003,
          smoothing: 1,
          color: PALE_PINK,
          bone: head,
          group: "gill membranes",
          name: `gill web ${s > 0 ? "L" : "R"} ${i + 1}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // A few deliberate freckles and body spots keep the simple primitive base
  // lively without obscuring the silhouette.
  // ---------------------------------------------------------------------------

  const freckles = [
    [-0.20, 0.69, 0.665],
    [-0.17, 0.67, 0.69],
    [0.20, 0.69, 0.665],
    [0.17, 0.67, 0.69],
    [-0.23, 0.61, 0.58],
    [0.23, 0.61, 0.58],
  ];

  for (let i = 0; i < freckles.length; i++) {
    const p = freckles[i];
    b.part(new THREE.SphereGeometry(1, 6, 4), DARK_PINK, {
      bone: head,
      at: p as [number, number, number],
      scale: [0.011, 0.011, 0.006],
      group: "freckles",
      name: `freckle ${i + 1}`,
    });
  }

  // A tiny mint dorsal spot is the one non-pink accent on the back.
  b.part(new THREE.SphereGeometry(1, 8, 5), MINT, {
    bone: torso.joints[1],
    at: [0, 0.69, 0.12],
    scale: [0.07, 0.028, 0.055],
    group: "markings",
    name: "back mint spot",
    flat: true,
  });

  return b.root;
}
