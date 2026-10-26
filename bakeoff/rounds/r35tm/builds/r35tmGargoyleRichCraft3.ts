import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
  mottle,
  countershade,
  stripes,
  svg,
} from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouched gothic stone gargoyle carved from faceted rock, perched on a heavy cathedral ledge with folded wing bones, talons, horns, fangs, and a long spiked tail.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = countershade(
    mottle("#626169", "#3b3945", { size: 0.19, contrast: 1.2, seed: 17 }),
    "#292833",
    { level: -0.18, soft: 0.28 },
  );
  const STONE_LIGHT = cel("#777581", "#403e4b", { threshold: 0.18 });
  const STONE_DARK = cel("#45434f", "#24232c", { threshold: 0.04 });
  const EDGE = "#9a9694";
  const CREVICE = "#17151d";
  const EYE_GLOW = "#d17b32";
  const HORN = mottle("#34323b", "#17161d", { size: 0.11, seed: 31 });
  const LEDGE = mottle("#554f54", "#28262d", { size: 0.24, seed: 8 });
  const LEDGE_TOP = countershade(LEDGE, "#26242b", { level: -0.1, soft: 0.2 });
  const TEETH = "#d0c2a0";

  const ledge = b.part(
    new THREE.BoxGeometry(2.35, 0.18, 1.3, 1, 1, 1),
    LEDGE_TOP,
    { at: [0, 0.09, 0.02], name: "cathedral_ledge", group: "scenery", flat: true },
  );
  b.part(
    new THREE.BoxGeometry(2.55, 0.16, 0.16, 1, 1, 1),
    LEDGE,
    { at: [0, 0.03, 0.59], name: "ledge_front_moulding", group: "scenery", flat: true },
  );
  b.part(
    new THREE.BoxGeometry(2.15, 0.13, 0.16, 1, 1, 1),
    LEDGE,
    { at: [0, 0.19, 0.54], name: "ledge_capstone", group: "scenery", flat: true },
  );

  for (const x of [-0.92, -0.46, 0.46, 0.92]) {
    b.part(
      new THREE.BoxGeometry(0.035, 0.08, 0.035, 1, 1, 1),
      EDGE,
      { at: [x, 0.22, 0.54], name: "capstone_chisel_mark", group: "scenery" },
    );
  }

  // Skeleton first: crouched spine and neck.
  const hips = b.joint("hips", {
    at: [0, 0.98, -0.02],
    dir: [0, 0.2, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.92, -0.16],
    [0, 1.08, -0.05],
    [0, 1.28, 0.08],
    [0, 1.43, 0.16],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });

  const neckPath = catmull([
    spine.tip.at,
    [0, 1.53, 0.18],
    [0, 1.66, 0.23],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: neck.tip.at,
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.1, -0.055]),
    dir: [0, 0.18, -0.16],
    role: "jaw",
    group: "head",
  });

  // Hind legs, folded beneath the body.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = [s * 0.22, 0.98, -0.08] as [number, number, number];
    const foot = [s * 0.38, 0.25, 0.22] as [number, number, number];
    const points = limb(
      hip,
      foot,
      [0.36, 0.34, 0.29],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 1, 0] },
    );
    b.chain(`leg${side}`, points, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: foot,
    });
  }

  // Long forearms planted like a crouching beast.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder = [s * 0.28, 1.31, 0.13] as [number, number, number];
    const hand = [s * 0.39, 0.31, 0.48] as [number, number, number];
    const points = limb(
      shoulder,
      hand,
      [0.34, 0.31, 0.35],
      [
        [0, -1, 1],
        [0, 1, 1],
      ],
      { sole: [0, 1, 0] },
    );
    b.chain(`arm${side}`, points, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
      contact: hand,
    });
  }

  // Broad bat-like wings, extended enough to read in silhouette.
  const wingChains: any[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wingPath = catmull([
      [s * 0.28, 1.39, 0.02],
      [s * 0.55, 1.58, -0.04],
      [s * 0.92, 1.72, -0.18],
      [s * 1.18, 1.62, -0.42],
    ]);
    const wing = b.chain(`wing${side}`, wingPath, {
      parent: spine.joints[2],
      names: [`wingRoot${side}`, `wingElbow${side}`, `wingTip${side}`],
      role: "wing",
    });
    wingChains.push({ s, side, wing });
  }

  // Tail curves behind and down onto the ledge.
  const tailPath = catmull([
    [0, 0.96, -0.18],
    [0, 0.84, -0.48],
    [0, 0.68, -0.82],
    [0, 0.52, -1.08],
    [0, 0.34, -1.24],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
    contact: [0, 0.25, -1.24],
  });

  // Main carved volumes.
  b.sweep(spine, [0.30, 0.36, 0.28, 0.22], {
    color: STONE,
    section: { ngon: 8 },
    sides: 8,
    name: "ribcage_carving",
    group: "body",
  });
  b.sweep(neck, [0.19, 0.17, 0.14], {
    color: STONE,
    section: { ngon: 7 },
    name: "neck_carving",
    group: "body",
  });
  b.sweep(tail, (t: number) => 0.15 * (1 - t) + 0.027, {
    color: STONE_DARK,
    section: { ngon: 7 },
    name: "tail_stone",
    group: "tail",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = (b as any).root; // keep handles in the builder; chains are located by their named joints
    const hind = catmull([
      [s * 0.22, 0.98, -0.08],
      [s * 0.29, 0.70, -0.14],
      [s * 0.39, 0.43, 0.04],
      [s * 0.38, 0.25, 0.22],
    ]);
    b.sweep(hind, [0.12, 0.105, 0.085, 0.07], {
      bone: (side === "L" ? "hipL" : "hipR") as any,
      color: STONE,
      section: { ngon: 6 },
      name: `hind_leg_${side}`,
      group: "limbs",
    });

    const front = catmull([
      [s * 0.28, 1.31, 0.13],
      [s * 0.37, 1.00, 0.26],
      [s * 0.42, 0.65, 0.40],
      [s * 0.39, 0.31, 0.48],
    ]);
    b.sweep(front, [0.105, 0.085, 0.065, 0.052], {
      bone: (side === "L" ? "shoulderL" : "shoulderR") as any,
      color: STONE_LIGHT,
      section: { ngon: 6 },
      name: `forearm_${side}`,
      group: "limbs",
    });

    const paw = b.part(
      new THREE.SphereGeometry(0.105, 7, 5),
      STONE_DARK,
      { at: [s * 0.39, 0.265, 0.48], scale: [1.15, 0.42, 1.35], name: `paw_${side}`, group: "limbs" },
    );

    for (let i = -1; i <= 1; i++) {
      const toeBase = [s * (0.39 + i * 0.045), 0.265, 0.51] as [number, number, number];
      const toeTip = [s * (0.39 + i * 0.052), 0.225, 0.66] as [number, number, number];
      b.sweep(polyline([toeBase, toeTip]), [0.026, 0.009], {
        color: HORN,
        caps: "round",
        name: `front_claw_${side}_${i}`,
        group: "claws",
      });
    }

    // Hind talons curl toward the viewer.
    for (let i = -1; i <= 1; i++) {
      b.sweep(
        catmull([
          [s * (0.38 + i * 0.04), 0.255, 0.15],
          [s * (0.39 + i * 0.043), 0.225, 0.23],
          [s * (0.40 + i * 0.045), 0.22, 0.31],
        ]),
        [0.024, 0.008],
        { color: HORN, caps: "point", name: `hind_claw_${side}_${i}`, group: "claws" },
      );
    }

    // Wing leading bones and webbing.
    const wc = wingChains.find((x) => x.s === s).wing;
    b.sweep(wc, [0.075, 0.055, 0.024], {
      color: STONE_DARK,
      section: { ngon: 6 },
      name: `wing_bone_${side}`,
      group: "wings",
    });

    const root = wc.at(0);
    const elbow = wc.at(0.48);
    const tip = wc.at(1);
    const lower = [
      root.at,
      [s * 0.49, 1.18, -0.28],
      [s * 0.78, 1.08, -0.56],
      [s * 1.04, 1.16, -0.72],
    ];
    b.membrane(
      polyline([root.at, elbow.at, tip.at]),
      polyline(lower),
      {
        color: mottle("#484550", "#211f29", { size: 0.16, seed: s > 0 ? 42 : 43 }),
        thickness: 0.018,
        rows: 4,
        cols: 8,
        scallop: 0.12,
        name: `wing_membrane_${side}`,
        group: "wings",
      },
    );

    // Three articulated finger rays along each wing edge.
    for (let i = 0; i < 3; i++) {
      const q = i / 2;
      const base = wc.at(0.38 + q * 0.45).at;
      const end = [
        s * (0.68 + q * 0.52),
        1.18 + 0.38 * Math.sin(q * Math.PI),
        -0.34 - q * 0.35,
      ] as [number, number, number];
      b.sweep(polyline([base, end]), [0.023, 0.008], {
        color: STONE_DARK,
        caps: "point",
        name: `wing_finger_${side}_${i}`,
        group: "wings",
      });
    }
  }

  // Head, muzzle and separate opening jaw.
  const skull = b.part(
    new THREE.SphereGeometry(0.24, 10, 7),
    STONE_LIGHT,
    {
      bone: head,
      at: head.at,
      scale: [1.0, 0.9, 1.05],
      name: "carved_skull",
      group: "head",
      flat: true,
    },
  );
  b.part(
    new THREE.SphereGeometry(0.16, 8, 5),
    STONE_LIGHT,
    {
      bone: head,
      at: head.local([0, 0.13, -0.075]),
      scale: [1.15, 0.8, 0.7],
      name: "upper_muzzle",
      group: "face",
      flat: true,
    },
  );
  b.part(
    new THREE.BoxGeometry(0.22, 0.19, 0.28, 1, 1, 1),
    CREVICE,
    {
      bone: jaw,
      at: jaw.at,
      dir: [0, 0.8, -0.25],
      scale: [1, 0.65, 0.8],
      name: "open_mouth",
      group: "face",
    },
  );
  b.sweep(polyline([jaw.at, jaw.local([0, 0.18, -0.04])]), [0.13, 0.09], {
    bone: jaw,
    color: STONE_DARK,
    caps: "flat",
    name: "lower_jaw",
    group: "face",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  const brow = [
    [head.local([0.09, 0.12, 0.10]), head.local([0.19, 0.11, 0.14])],
    [head.local([-0.09, 0.12, 0.10]), head.local([-0.19, 0.11, 0.14])],
  ];
  for (const [a, z] of brow) {
    b.sweep(polyline([a, z]), [0.035, 0.024], {
      color: STONE_DARK,
      caps: "round",
      name: "heavy_brow",
      group: "face",
    });
  }

  // Pointed ears and temple horns.
  for (const s of [1, -1]) {
    b.spike(head.local([s * 0.15, 0.03, 0.13]), [s * 0.22, -0.02, 0.20], 0.23, 0.065, {
      color: STONE_DARK,
      name: `ear_horn_${s > 0 ? "L" : "R"}`,
      group: "head",
    });
    b.sweep(
      catmull([
        head.local([s * 0.15, -0.01, 0.14]),
        head.local([s * 0.22, -0.04, 0.23]),
        head.local([s * 0.25, -0.02, 0.34]),
      ]),
      [0.06, 0.035],
      {
        color: HORN,
        caps: "point",
        name: `temple_horn_${s > 0 ? "L" : "R"}`,
        group: "horns",
      },
    );
  }

  const eyeTexture = animeEye({
    iris: "#d27a26",
    irisLight: "#ffca68",
    irisDark: "#552419",
    ink: INK,
    blush: false,
    brow: false,
    size: 256,
  });
  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = faceSurface.around(head.at).at(s * 38, 7);
    if (hit) {
      b.decal(faceSurface, eyeTexture, {
        at: hit.at,
        dir: hit.n,
        up: [0, 1, 0],
        size: [0.115, 0.14],
        lift: 0.006,
        mirror: s > 0,
        name: `carved_eye_${s > 0 ? "L" : "R"}`,
        group: "face",
      });
    }
  }

  // Nose block and pronounced fangs.
  b.part(
    new THREE.ConeGeometry(0.075, 0.13, 6),
    STONE_DARK,
    {
      bone: head,
      at: head.local([0, 0.235, -0.025]),
      dir: [0, 0, 1],
      axis: "z",
      name: "gargoyle_nose",
      group: "face",
    },
  );
  for (const s of [1, -1]) {
    b.spike(
      head.local([s * 0.075, 0.19, -0.08]),
      [0, 0, -1],
      0.095,
      0.023,
      { color: TEETH, name: `fang_${s > 0 ? "L" : "R"}`, group: "teeth" },
    );
  }

  // Chisel-like cheek ridges and a central forehead keystone.
  for (const s of [1, -1]) {
    b.sweep(
      polyline([
        head.local([s * 0.14, 0.11, -0.02]),
        head.local([s * 0.18, 0.17, -0.01]),
        head.local([s * 0.12, 0.22, 0.01]),
      ]),
      [0.018, 0.009],
      {
        color: EDGE,
        caps: "flat",
        name: "cheek_chisel_ridge",
        group: "face",
      },
    );
  }
  b.part(
    new THREE.ConeGeometry(0.055, 0.16, 5),
    EDGE,
    {
      bone: head,
      at: head.local([0, 0.08, 0.18]),
      dir: [0, 0, 1],
      axis: "z",
      name: "forehead_keystone",
      group: "head",
    },
  );

  // Tail and spinal stone spines.
  for (let i = 0; i < 7; i++) {
    const t = 0.12 + i * 0.13;
    const p = tail.at(t);
    b.spike(p, [0, 1, -0.15], 0.11 * (1 - t * 0.4), 0.032, {
      color: STONE_LIGHT,
      name: `tail_spine_${i}`,
      group: "tail",
    });
  }

  // Small carved rosettes on the shoulders, echoing cathedral ornament.
  const rosette = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="27" fill="#bca878" stroke="#211a22" stroke-width="4"/>
      <path d="M32 8 L38 25 L56 22 L43 34 L54 48 L36 42 L30 58 L25 41 L8 47 L20 33 L8 21 L26 25Z" fill="#5b3030" stroke="#211a22" stroke-width="3"/>
      <circle cx="32" cy="32" r="7" fill="#e4c875" stroke="#211a22" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.decal(b.surface(spine), rosette, {
      at: [s * 0.25, 1.26, 0.25],
      dir: [0, 0.15, 1],
      size: [0.13, 0.13],
      lift: 0.004,
      mirror: s > 0,
      name: "shoulder_rosette",
      group: "ornament",
    });
  }

  // A few monumental chips on the ledge, kept simpler than the hero.
  for (const z of [-0.38, 0.0, 0.38]) {
    b.part(
      new THREE.ConeGeometry(0.05, 0.12, 5),
      STONE_DARK,
      { at: [0.92, 0.25, z], dir: [0, 1, 0], name: "ledge_gargoyle_chip", group: "scenery" },
    );
  }

  return b.root;
}
