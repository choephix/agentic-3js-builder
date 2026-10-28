import * as THREE from "three";
import { type Builder, createBuilder, frame, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // head
  (() => {
function buildHead(b: Builder) {
  // The base source was not included in the prompt, so these positions are estimated from the
  // given box and attachment note (head joint at the front of the neck, skull sphere, snout wedge).
  const FUR = "#f6f1e6", ORANGE = "#f2a23c", CREAM = "#fff6e0", RED = "#d3342b";
  const DARK = "#2a1420", GOLD = "#f5c542", EYE = "#ffd24a", INNER = "#f7b7c0", WHITE = "#ffffff";

  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cone = (r: number, l: number, s = 6) => new THREE.ConeGeometry(r, l, s);
  const part = (g: THREE.BufferGeometry, color: string, at: number[], bone: string, o: any = {}) =>
    b.part(g, color, { bone, at, ...o });

  for (const s of [1, -1]) {
    // eyes: dark outline, gold iris, pupil, highlight
    part(sph(1), DARK, [s * 0.088, 1.045, 0.652], "head", { scale: [0.04, 0.03, 0.016], rotation: [0, 0, s * -18] });
    part(sph(1), EYE, [s * 0.09, 1.045, 0.664], "head", { scale: [0.032, 0.024, 0.012], rotation: [0, 0, s * -18] });
    part(sph(1), DARK, [s * 0.09, 1.045, 0.674], "head", { scale: [0.008, 0.02, 0.006] });
    part(sph(1), WHITE, [s * 0.098, 1.054, 0.678], "head", { scale: [0.007, 0.007, 0.005] });
    // brows (red markings)
    part(sph(1), RED, [s * 0.09, 1.087, 0.65], "head", { scale: [0.04, 0.008, 0.012], rotation: [0, 0, s * -25] });
    // ears
    part(cone(0.055, 0.12, 4), FUR, [s * 0.1, 1.185, 0.5], "head", { rotation: [-8, 0, s * -14] });
    part(cone(0.036, 0.09, 4), INNER, [s * 0.1, 1.178, 0.525], "head", { rotation: [-8, 0, s * -14] });
    part(cone(0.02, 0.03, 4), DARK, [s * 0.108, 1.235, 0.5], "head", { rotation: [-8, 0, s * -14] });
    // upper fangs
    part(cone(0.011, 0.04, 5), WHITE, [s * 0.04, 0.925, 0.742], "head", { rotation: [180, 0, 0] });
    // lower fangs
    part(cone(0.009, 0.03, 5), WHITE, [s * 0.036, 0.915, 0.755], "jaw");
    // cheek ruffs
    for (let i = 0; i < 3; i++) {
      part(cone(0.03 - i * 0.004, 0.11 - i * 0.012, 5), FUR, [s * 0.15, 0.95 - i * 0.03, 0.56 - i * 0.012], "head", {
        rotation: [-60 - i * 12, 0, s * -80],
      });
    }
    part(cone(0.014, 0.05, 4), RED, [s * 0.185, 0.92, 0.52], "head", { rotation: [-70, 0, s * -85] });
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod([s * 0.06, 0.965 - k * 0.012, 0.745], [s * 0.2, 0.975 - k * 0.03, 0.7], 0.0017, DARK, { bone: "head" });
    }
    // nose-side shadow
    part(sph(1), ORANGE, [s * 0.05, 0.975, 0.72], "head", { scale: [0.03, 0.03, 0.05] });
  }

  // muzzle
  part(sph(1, 10, 6), CREAM, [0, 0.955, 0.7], "head", { scale: [0.065, 0.045, 0.085] });
  part(sph(1), DARK, [0, 0.99, 0.775], "head", { scale: [0.02, 0.014, 0.014] });
  // mouth line
  b.rod([0, 0.945, 0.785], [0, 0.945, 0.7], 0.003, DARK, { bone: "head" });
  // lower jaw
  part(sph(1, 10, 6), CREAM, [0, 0.915, 0.7], "jaw", { scale: [0.052, 0.025, 0.075] });
  part(sph(1), INNER, [0, 0.93, 0.7], "jaw", { scale: [0.04, 0.012, 0.06] });
  part(sph(1), RED, [0, 0.925, 0.73], "jaw", { scale: [0.012, 0.01, 0.014] });

  // forehead mark: red diamond with stripes
  part(cone(0.02, 0.07, 4), RED, [0, 1.125, 0.62], "head", { rotation: [-70, 45, 0], scale: [1, 1, 0.3] });
  part(cone(0.012, 0.05, 4), RED, [0, 1.09, 0.665], "head", { rotation: [110, 45, 0], scale: [1, 1, 0.3] });
  for (const s of [1, -1]) {
    part(cone(0.008, 0.05, 4), RED, [s * 0.04, 1.12, 0.6], "head", { rotation: [-60, 0, s * -40] });
  }

  // golden ornament: circlet, gem and tassel
  part(new THREE.TorusGeometry(0.024, 0.006, 5, 10), GOLD, [0, 1.15, 0.58], "head", { rotation: [-35, 0, 0] });
  part(sph(0.011), RED, [0, 1.15, 0.595], "head");
  part(cone(0.008, 0.05, 5), GOLD, [0, 1.115, 0.585], "head", { rotation: [150, 0, 0] });
  part(sph(0.008), GOLD, [0, 1.088, 0.597], "head");
}
    return buildHead;
  })(),
  // legs
  (() => {
function buildLegs(b: Builder) {
  const FUR = "#fff4e2";
  const FUR_SHADE = "#f2dcc0";
  const SOCK = "#2a1a2e";
  const GOLD = "#f2b632";
  const CLAW = "#f5ecd8";
  const PAD = "#3a2438";

  const leg = (
    side: number,
    base: string,
    x: number,
    z: number,
    top: number,
    hind: boolean,
  ) => {
    const s = side;
    const tag = (hind ? "H" : "F") + (s > 0 ? "L" : "R");
    const hip: [number, number, number] = [x * s, top, z];
    const mid: [number, number, number] = hind
      ? [x * s, top * 0.55, z - 0.07]
      : [x * s, top * 0.55, z + 0.02];
    const ank: [number, number, number] = hind
      ? [x * s, 0.1, z - 0.02]
      : [x * s, 0.1, z + 0.02];
    const foot: [number, number, number] = [x * s, 0.035, ank[2] + 0.05];

    const chain = b.chain(
      `legs${tag}`,
      [hip, mid, ank],
      { parent: base, names: [`legs${tag}Up`, `legs${tag}Low`], role: "leg", contact: [x * s, 0, foot[2]] },
    );

    // upper and lower leg fur
    b.sweep(chain, (t: number) => (hind ? 0.062 - t * 0.03 : 0.052 - t * 0.022), {
      color: FUR,
      sides: 8,
    });

    // sock (dark lower leg)
    const sockPath = [
      [ank[0], 0.17, ank[2]],
      [ank[0], 0.07, ank[2]],
    ];
    b.rod(sockPath[0], sockPath[1], 0.026, SOCK, { bone: chain.joints[1], sides: 8 });

    // elbow / hock fur tuft
    const tuftAt: [number, number, number] = hind
      ? [x * s, mid[1] + 0.02, mid[2] - 0.03]
      : [x * s, mid[1] + 0.02, mid[2] - 0.035];
    for (let i = 0; i < 3; i++) {
      b.spike(
        tuftAt,
        [0, -0.5 - i * 0.2, -1],
        0.07 - i * 0.012,
        0.026 - i * 0.004,
        { color: i % 2 ? FUR_SHADE : FUR, bone: chain.joints[0], sides: 5 } as never,
      );
    }

    // golden anklet
    b.part(new THREE.TorusGeometry(0.03, 0.007, 6, 12), GOLD, {
      bone: chain.joints[1],
      at: [ank[0], 0.155, ank[2]],
      dir: [0, 1, 0],
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, {
      bone: chain.joints[1],
      at: [ank[0], 0.155, ank[2] + 0.032],
    });

    // paw
    b.part(new THREE.SphereGeometry(0.04, 8, 6), SOCK, {
      bone: chain.joints[1],
      at: [foot[0], 0.04, foot[2] - 0.005],
      scale: [1, 0.85, 1.35],
    });
    // toes + claws
    for (let i = -1; i <= 1; i++) {
      const tx = foot[0] + i * 0.022 * s;
      const tz = foot[2] + 0.045 - Math.abs(i) * 0.008;
      b.part(new THREE.SphereGeometry(0.016, 6, 4), SOCK, {
        bone: chain.joints[1],
        at: [tx, 0.02, tz],
        scale: [1, 0.9, 1.2],
      });
      b.spike([tx, 0.012, tz + 0.014], [0, -0.1, 1], 0.026, 0.005, {
        color: CLAW,
        bone: chain.joints[1],
        sides: 5,
      } as never);
    }
    // toe pad hint
    b.part(new THREE.SphereGeometry(0.014, 6, 4), PAD, {
      bone: chain.joints[1],
      at: [foot[0], 0.004, foot[2] - 0.01],
      scale: [1.2, 0.3, 1],
    });
  };

  for (const s of [1, -1]) {
    leg(s, s > 0 ? "shoulderL" : "shoulderR", 0.17, 0.3, 0.42, false);
    leg(s, s > 0 ? "hipL" : "hipR", 0.19, -0.3, 0.44, true);
  }
}
    return buildLegs;
  })(),
  // tails
  (() => {
function buildTails(b: Builder) {
  // The base source was not visible, so the rump anchor is a fixed guess at the back of the torso.
  // The tails parent to the named `tailRoot` joint.
  const R: [number, number, number] = [0, 0.95, -0.4];
  const FUR = "#f0b36a";
  const FUR_DARK = "#d98a45";
  const TIP = "#fbf8f0";
  const FLAME = "#6fe6ff";
  const FLAME_IN = "#d8fbff";
  const N = 9;
  for (let i = 0; i < N; i++) {
    const f = (i - 4) / 4;
    const a = f * 1.2;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const lift = 0.3 + 0.3 * (1 - Math.abs(f));
    const pts: [number, number, number][] = [
      R,
      [sx * 0.25, R[1] + 0.08, R[2] - cz * 0.25],
      [sx * 0.55, R[1] + 0.08 + lift * 0.5, R[2] - cz * 0.55],
      [sx * 0.8, R[1] + lift + 0.05, R[2] - cz * 0.78],
    ];
    const path = catmull(pts);
    const chain = b.chain(`tails${i + 1}`, path, { parent: "tailRoot", count: 4, role: "tail" });
    const body = b.sweep(chain, (t) => 0.04 + 0.075 * Math.sin(Math.PI * (0.15 + 0.7 * t)), {
      sides: 8,
      bands: [
        [0.72, i % 2 ? FUR : FUR_DARK],
        [1, TIP],
      ],
      caps: "round",
    });
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      for (const deg of [70, -70, 180]) {
        const p = body.at(t, deg);
        b.spike(p, p, 0.1 + 0.03 * t, 0.028, { color: t > 0.72 ? TIP : FUR_DARK });
      }
    }
    const tipBone = chain.joints[chain.joints.length - 1];
    const tp = path.at(1);
    b.spike(tp, [0, 1, 0], 0.17, 0.05, { color: FLAME, bone: tipBone });
    b.spike([tp.x, tp.y + 0.02, tp.z], [0, 1, 0], 0.1, 0.028, { color: FLAME_IN, bone: tipBone });
  }
}
    return buildTails;
  })(),
  // adornments
  (() => {
function buildAdornments(b: Builder) {
  // NOTE: the base source was not included in the prompt (only a placeholder),
  // so positions assume a fox chest near [0, 0.75, 0.3] and a neck rising forward.
  const CX = 0, CY = 0.75, CZ = 0.3;
  const WHITE = "#fff8ec", CREAM = "#f3e3c6", RED = "#c8202a", DRED = "#8e1420";
  const GOLD = "#e6b24a", DGOLD = "#a87a22", ROPE = "#f0e2c0", ROPE2 = "#b8452f";
  const PAPER = "#f4efe0", INK = "#2a1a2e";
  const FLAME_A = "#7fe8ff", FLAME_B = "#c9a6ff", FLAME_C = "#ffffff";

  const part = (g: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(g, color, { bone: "chest", at, ...o });

  // Chest ruff: ring of overlapping fur tufts, pointing outward and down
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 0.17;
    const x = CX + Math.sin(a) * r, y = CY + 0.1 + Math.cos(a) * r * 0.9, z = CZ + 0.14 + Math.cos(a) * 0.02;
    const front = Math.cos(a) < 0.2 ? 0 : 1; // lower arc is the front/bib side
    const cone = new THREE.ConeGeometry(0.05, 0.16, 5);
    part(cone, i % 2 ? WHITE : CREAM, [x, y, z + 0.06], {
      dir: [Math.sin(a) * 0.6, Math.cos(a) * 0.6 - 0.5, 0.7 + front * 0.1],
    });
  }
  // White bib
  part(new THREE.SphereGeometry(1, 8, 6), WHITE, [CX, CY - 0.06, CZ + 0.2], { scale: [0.15, 0.2, 0.09] });
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.045;
    part(new THREE.ConeGeometry(0.035, 0.14, 5), i % 2 ? WHITE : CREAM, [x, CY - 0.22 - (i % 2) * 0.03, CZ + 0.25], {
      dir: [0, -1, 0.2],
    });
  }

  for (const s of [1, -1]) {
    // Shoulder markings: red tapered flame-like swirls
    part(new THREE.ConeGeometry(0.04, 0.2, 4), RED, [s * 0.2, CY + 0.12, CZ - 0.02], { dir: [s * 0.4, -1, 0.1] });
    part(new THREE.ConeGeometry(0.025, 0.14, 4), DRED, [s * 0.24, CY + 0.06, CZ + 0.03], { dir: [s * 0.6, -1, 0.3] });
    part(new THREE.SphereGeometry(0.03, 6, 4), RED, [s * 0.2, CY + 0.2, CZ - 0.02]);
    // Cheek-chest red stripes on ruff
    for (let k = 0; k < 2; k++)
      part(new THREE.BoxGeometry(0.012, 0.07, 0.01), RED, [s * (0.07 + k * 0.05), CY + 0.0 - k * 0.02, CZ + 0.28], {
        rotation: [0, 0, s * 20],
      });
  }
  // Forehead-style mark on bib
  part(new THREE.ConeGeometry(0.03, 0.1, 3), RED, [0, CY - 0.1, CZ + 0.285], { dir: [0, -1, 0.1] });

  // Shrine bell collar with rope (torus around neck base)
  const collarY = CY + 0.18, collarZ = CZ + 0.18;
  part(new THREE.TorusGeometry(0.15, 0.018, 6, 16), ROPE, [CX, collarY, collarZ], { rotation: [70, 0, 0] });
  part(new THREE.TorusGeometry(0.152, 0.01, 5, 16), ROPE2, [CX, collarY, collarZ], { rotation: [70, 0, 0], scale: [1, 1, 1.6] });
  // Rope knots with tails
  part(new THREE.SphereGeometry(0.03, 6, 4), ROPE2, [0, collarY - 0.045, collarZ + 0.14]);
  for (const s of [1, -1])
    part(new THREE.CylinderGeometry(0.008, 0.012, 0.1, 5), ROPE2, [s * 0.025, collarY - 0.1, collarZ + 0.14], {
      rotation: [0, 0, s * 10],
    });
  // Bell
  const bellY = collarY - 0.12, bellZ = collarZ + 0.15;
  part(new THREE.SphereGeometry(0.045, 8, 6), GOLD, [0, bellY, bellZ]);
  part(new THREE.TorusGeometry(0.045, 0.004, 4, 12), DGOLD, [0, bellY - 0.005, bellZ], { rotation: [90, 0, 0] });
  part(new THREE.BoxGeometry(0.03, 0.006, 0.006), INK, [0, bellY - 0.018, bellZ + 0.044]);
  part(new THREE.SphereGeometry(0.01, 5, 4), DGOLD, [0, bellY - 0.045, bellZ]);
  part(new THREE.TorusGeometry(0.012, 0.004, 4, 8), GOLD, [0, bellY + 0.05, bellZ]);

  // Paper charms (ofuda) hanging from rope
  for (const [x, dz, rz] of [[-0.12, 0.08, 8], [0.12, 0.08, -8], [0.0, 0.17, 0]] as number[][]) {
    const cy = collarY - 0.05 - (dz > 0.15 ? 0.17 : 0);
    part(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 4), ROPE2, [x, cy + 0.035, collarZ + dz + 0.04], { rotation: [0, 0, rz] });
    part(new THREE.BoxGeometry(0.05, 0.11, 0.006), PAPER, [x, cy - 0.04, collarZ + dz + 0.05], { rotation: [0, 0, rz] });
    part(new THREE.BoxGeometry(0.008, 0.07, 0.008), RED, [x, cy - 0.04, collarZ + dz + 0.055], { rotation: [0, 0, rz] });
    part(new THREE.BoxGeometry(0.03, 0.008, 0.008), RED, [x, cy - 0.02, collarZ + dz + 0.055], { rotation: [0, 0, rz] });
    part(new THREE.BoxGeometry(0.03, 0.008, 0.008), INK, [x, cy - 0.065, collarZ + dz + 0.055], { rotation: [0, 0, rz] });
  }

  // Floating spirit flames orbiting the body
  const flames = 9;
  for (let i = 0; i < flames; i++) {
    const a = (i / flames) * Math.PI * 2 + 0.3;
    const rad = 0.42 + (i % 3) * 0.05;
    const x = Math.sin(a) * rad;
    const z = CZ - 0.1 + Math.cos(a) * rad * 0.9;
    const y = 0.35 + ((i * 0.37) % 1) * 0.8;
    const sz = 0.05 + (i % 3) * 0.012;
    if (Math.abs(x) > 0.57 || z > 0.76 || z < -0.56) continue;
    const col = i % 2 ? FLAME_A : FLAME_B;
    glow(part(new THREE.SphereGeometry(sz, 6, 5), col, [x, y, z], { scale: [1, 1.1, 1] }), 1.4);
    glow(part(new THREE.ConeGeometry(sz * 0.8, sz * 3, 5), col, [x, y + sz * 2, z]), 1.4);
    glow(part(new THREE.ConeGeometry(sz * 0.4, sz * 1.8, 4), FLAME_C, [x, y + sz * 0.6, z + sz * 0.2]), 1.8);
  }
}
    return buildAdornments;
  })(),
  // spiritFlames
  (() => {
function buildSpiritFlames(b: Builder) {
  const bone = "hips";
  const COLORS = ["#5ab4ff", "#8a6bff", "#9fe3ff", "#c08aff", "#3d7cff"];
  const N = 14;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const clampPos = (x: number, y: number, z: number): [number, number, number] => [
    Math.min(1.05, Math.max(-1.05, x)),
    Math.min(1.7, Math.max(0.4, y)),
    Math.min(0.85, Math.max(-1.05, z)),
  ];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + rnd() * 0.3;
    const r = 0.75 + rnd() * 0.2;
    const y = 0.5 + (i % 5) * 0.2 + rnd() * 0.1;
    const [x, yy, z] = clampPos(Math.sin(a) * r, y, Math.cos(a) * r - 0.1);
    const s = 0.05 + rnd() * 0.04;
    const col = COLORS[i % COLORS.length];
    // orb body
    b.part(new THREE.SphereGeometry(s, 8, 6), col, { bone, at: [x, yy, z], name: `spiritFlamesOrb${i}` });
    // teardrop tail (cone pointing up, tip trailing)
    b.part(new THREE.ConeGeometry(s * 0.8, s * 3.2, 7), col, {
      bone,
      at: [x, yy + s * 2.0, z],
      name: `spiritFlamesTail${i}`,
    });
    // inner bright core
    b.part(new THREE.SphereGeometry(s * 0.5, 6, 4), "#eaf6ff", {
      bone,
      at: [x, yy, z + s * 0.3],
      name: `spiritFlamesCore${i}`,
    });
    // small flicker
    if (i % 2 === 0) {
      b.part(new THREE.ConeGeometry(s * 0.35, s * 1.6, 5), COLORS[(i + 2) % COLORS.length], {
        bone,
        at: [x + s * 0.7, yy + s * 1.2, z],
        name: `spiritFlamesFlick${i}`,
      });
    }
  }
}
    return buildSpiritFlames;
  })(),
];

export const BASE_PARTS = [
  {
    id: "head",
    builds: "fox head details: eyes with brows, ears with inner fur, muzzle, nose, upper and lower jaw with fangs, cheek ruffs, forehead mark, whiskers, golden ornament",
    box: [
      [-0.25, 0.75, 0.2],
      [0.25, 1.25, 0.8],
    ],
    attaches: "head joint at the front of the neck; skull sphere and snout wedge",
    joints: ["head", "jaw"],
    floor: false,
    budget: 180,
  },
  {
    id: "legs",
    builds: "four legs with paws, toes, dark socks, claws, fur tufts at elbows and hocks, and golden anklets",
    box: [
      [-0.35, 0, -0.5],
      [0.35, 0.5, 0.5],
    ],
    attaches: "shoulder joints at the chest sides and hip joints at the rump sides, under the torso loft",
    joints: ["shoulderL", "shoulderR", "hipL", "hipR"],
    floor: true,
    budget: 150,
  },
  {
    id: "tails",
    builds: "nine large fanned tails, each a jointed swept chain with white tips, fur-blade layers and a spirit flame at each tip",
    box: [
      [-1.1, 0.3, -1.6],
      [1.1, 1.7, -0.3],
    ],
    attaches: "tail root joint on the rump at the back end of the torso",
    joints: ["tailRoot"],
    floor: false,
    budget: 260,
  },
  {
    id: "adornments",
    builds: "chest ruff and white bib, shoulder markings, red kitsune markings, shrine bell collar with rope, paper charms, floating glowing spirit flames around the body",
    box: [
      [-0.6, 0.1, -0.6],
      [0.6, 1.4, 0.8],
    ],
    attaches: "neck loop and torso surface around the chest and shoulders",
    joints: ["chest", "neck1"],
    floor: false,
    budget: 200,
  },
  {
    id: "spiritFlames",
    builds: "floating spirit flame wisps and glow orbs orbiting the fox, built of cone and teardrop shapes in glowing blue and violet",
    box: [
      [-1.2, 0.2, -1.2],
      [1.2, 1.9, 1.0],
    ],
    attaches: "free hovering around the torso, anchored to the root joint",
    joints: ["hips"],
    floor: false,
    budget: 100,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const FUR = "#f4efe6";
  const GOLDFUR = "#e9a24a";
  const BELLY = "#fffaf0";

  const hips = b.joint("hips", { at: [0, 0.55, -0.3], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.6, 0.25], aim: [0, 0.68, 0.45], role: "spine" });
  const neck1 = b.joint("neck1", { parent: chest, at: [0, 0.68, 0.45], aim: [0, 0.88, 0.62], role: "neck" });
  const head = b.joint("head", { parent: neck1, at: [0, 0.88, 0.62], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 0.9, 0.7], aim: [0, 0.86, 0.85], role: "jaw" });
  b.joint("tailRoot", { parent: hips, at: [0, 0.62, -0.7], dir: [0, 0.3, -1], role: "tail" });
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    b.joint("shoulder" + n, { parent: chest, at: [s * 0.16, 0.48, 0.35], dir: [0, -1, 0], role: "leg" });
    b.joint("hip" + n, { parent: hips, at: [s * 0.17, 0.46, -0.45], dir: [0, -1, 0], role: "leg" });
  }

  // torso loft
  b.loft(
    [
      { at: [0, 0.6, -0.7], w: 0.3, h: 0.3 },
      { at: [0, 0.6, -0.4], w: 0.38, h: 0.4 },
      { at: [0, 0.62, 0], w: 0.36, h: 0.38 },
      { at: [0, 0.66, 0.3], w: 0.4, h: 0.46 },
    ],
    { bone: [hips, chest], color: FUR },
  );
  // belly underside
  b.part(new THREE.BoxGeometry(0.26, 0.1, 0.9), BELLY, { bone: hips, at: [0, 0.4, -0.05] });
  // neck
  b.sweep(
    [
      [0, 0.7, 0.4],
      [0, 0.88, 0.58],
    ],
    [0.15, 0.12],
    { bone: neck1, color: FUR },
  );
  // skull
  b.part(new THREE.SphereGeometry(1, 12, 9), FUR, { bone: head, at: [0, 0.95, 0.72], scale: [0.2, 0.18, 0.2] });
  // snout wedge
  b.frustumBox([0, 0.9, 0.78], [0, 0.88, 0.98], [0.2, 0.16], [0.07, 0.07], { bone: head, color: FUR });
  // base leg stubs
  for (const s of [1, -1]) {
    b.rod([s * 0.16, 0.5, 0.35], [s * 0.16, 0.05, 0.38], [0.08, 0.05], { bone: s > 0 ? "shoulderL" : "shoulderR", color: GOLDFUR });
    b.rod([s * 0.17, 0.48, -0.45], [s * 0.17, 0.05, -0.42], [0.09, 0.05], { bone: s > 0 ? "hipL" : "hipR", color: GOLDFUR });
  }
    for (const add of PARTS) add(b);
  return b.root;
}
