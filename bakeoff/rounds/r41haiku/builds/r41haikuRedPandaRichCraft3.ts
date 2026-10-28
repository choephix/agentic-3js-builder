import * as THREE from "three";
import { createBuilder, catmull, cel, animeEye, INK, mix, noise, paint } from "../../../../src/index";

export const meta = {
  name: "red-panda-on-mossy-stone",
  description: "A stylised red panda balancing on a moss-covered stone, Genshin-style cel shading.",
};

// Palette
const RUST = "#c9622f";
const RUST_DEEP = "#8e3d1d";
const CREAM = "#fff0d6";
const DARK = "#2e1d15";
const AMBER = "#f2a33a";
const MOSS = "#6fae3e";
const MOSS_DEEP = "#3f7a2a";
const STONE_LIGHT = "#a6aba0";
const STONE_DARK = "#5e6459";

// Scale constants
const H = 1.0; // head scale multiplier
const HEAD = [0, 0.8, 0.14] as const;
const HEAD_R = 0.13 * H;

// Paints
const COAT = cel(RUST);
const FACE = cel(CREAM);
const STONE = paint((p, n) => {
  if (n.y > 0.45) return mix(MOSS_DEEP, MOSS, noise(p, 0.05, 3));
  return mix(STONE_DARK, STONE_LIGHT, noise(p, 0.12, 4));
});

const EYE = animeEye({ iris: AMBER });

export default function build() {
  const b = createBuilder({ name: "red-panda" });

  // ---- Skeleton -----------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.4, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, -0.02],
      [0, 0.5, 0.03],
      [0, 0.6, 0.09],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );

  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [...HEAD],
    dir: [0, 1, 0.15],
    role: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.36, -0.08],
      [0, 0.3, -0.3],
      [0.03, 0.36, -0.5],
      [0.02, 0.5, -0.6],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  const legs = (s: 1 | -1) => {
    const side = s > 0 ? "L" : "R";
    return b.chain(
      `leg${side}`,
      catmull([
        [s * 0.1, 0.4, 0.02],
        [s * 0.16, 0.28, 0.1],
        [s * 0.11, 0.32, 0.13],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
  };
  const legL = legs(1);
  const legR = legs(-1);

  const arms = (s: 1 | -1) => {
    const side = s > 0 ? "L" : "R";
    return b.chain(
      `arm${side}`,
      catmull([
        [s * 0.1, 0.6, 0.09],
        [s * 0.22, 0.56, 0.18],
        [s * 0.3, 0.48, 0.27],
      ]),
      { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
  };
  const armL = arms(1);
  const armR = arms(-1);

  // ---- Body ---------------------------------------------------------------------------------------------
  const bodyPath = catmull([
    [0, 0.34, -0.08],
    [0, 0.42, 0.0],
    [0, 0.56, 0.06],
    [0, 0.66, 0.1],
  ]);
  b.sweep(bodyPath, (t) => [0.12 + 0.03 * Math.sin(Math.PI * t), 0.13 + 0.03 * Math.sin(Math.PI * t)], {
    bone: [hips, spine],
    color: COAT,
    sectors: [[120, 240, CREAM]],
    smoothing: 1,
  } as never);

  // Limbs
  for (const leg of [legL, legR]) {
    const s = leg === legL ? 1 : -1;
    b.sweep(
      catmull([
        [s * 0.1, 0.4, 0.02],
        [s * 0.16, 0.28, 0.1],
        [s * 0.11, 0.32, 0.13],
      ]),
      0.05,
      { bone: leg, color: COAT },
    );
    b.part(new THREE.SphereGeometry(0.052, 10, 8), DARK, {
      bone: leg,
      at: [s * 0.11, 0.315, 0.16],
      scale: [1, 0.6, 1.4],
    });
  }
  for (const arm of [armL, armR]) {
    const s = arm === armL ? 1 : -1;
    b.sweep(
      catmull([
        [s * 0.1, 0.6, 0.09],
        [s * 0.22, 0.56, 0.18],
        [s * 0.3, 0.48, 0.27],
      ]),
      0.04,
      { bone: arm, color: COAT },
    );
    b.part(new THREE.SphereGeometry(0.045, 8, 6), DARK, {
      bone: arm,
      at: [s * 0.31, 0.47, 0.3],
      scale: [1, 0.8, 1.3],
    });
  }

  // Tail: alternating rust and dark rings, cream tip
  b.sweep(
    catmull([
      [0, 0.36, -0.08],
      [0, 0.3, -0.3],
      [0.03, 0.36, -0.5],
      [0.02, 0.5, -0.6],
    ]),
    (t: number) => 0.075 * (1 - t) + 0.045,
    {
      bone: tail,
      bands: [
        [0.2, RUST],
        [0.32, DARK],
        [0.46, RUST],
        [0.58, DARK],
        [0.72, RUST],
        [0.84, DARK],
        [1, CREAM],
      ],
      smoothing: 1,
    } as never,
  );

  // ---- Head ---------------------------------------------------------------------------------------------
  const headPart = b.part(new THREE.SphereGeometry(HEAD_R, 18, 14), COAT, {
    bone: head,
    at: [...HEAD],
    scale: [1.08, 0.96, 1],
  });

  // Cream mask and muzzle
  b.part(new THREE.SphereGeometry(0.1, 16, 12), FACE, {
    bone: head,
    at: head.local({ forward: 0.085, up: -0.03 }),
    scale: [1, 0.85, 0.55],
  });

  // Ears: rust outer shell, cream inner
  const earOuter = [
    [-0.05, -0.02],
    [0.05, -0.02],
    [0.065, 0.07],
    [0, 0.13],
    [-0.065, 0.07],
  ] as [number, number][];
  const earInner = [
    [-0.03, 0.0],
    [0.03, 0.0],
    [0.04, 0.06],
    [0, 0.095],
    [-0.04, 0.06],
  ] as [number, number][];
  for (const s of [1, -1] as const) {
    b.extrude(earOuter, {
      at: head.local({ left: s * 0.08, up: 0.09 }),
      x: [s, 0, 0],
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 1,
      color: COAT,
      bone: head,
    });
    b.extrude(earInner, {
      at: head.local({ left: s * 0.08, up: 0.095, forward: 0.02 }),
      x: [s, 0, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: FACE,
      bone: head,
    });
  }

  // Eyes: anime drawings on the skull, mirrored for the left eye
  for (const s of [1, -1] as const) {
    b.decal(headPart, EYE, {
      at: head.local({ left: s * 0.05, up: 0.02, forward: 0.12 }),
      dir: [0, 0, 1],
      size: [0.05, 0.07],
      mirror: s > 0,
    });
  }

  // Nose
  b.part(new THREE.SphereGeometry(0.022, 8, 6), INK, {
    bone: head,
    at: head.local({ forward: 0.125, up: -0.035 }),
    scale: [1.4, 0.9, 0.8],
  });

  // ---- Mossy stone ---------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.37, 0.08],
      [0.33, 0.2],
      [0.22, 0.29],
      [0.1, 0.32],
      [0, 0.32],
    ],
    { at: [0, 0, 0], bone: hips, smoothing: 1, color: STONE },
  );

  // Moss clumps on the top
  const clumps: [number, number, number][] = [
    [0.14, 0.3, -0.06],
    [-0.16, 0.28, 0.02],
    [0.02, 0.3, -0.18],
  ];
  for (const [x, y, z] of clumps) {
    b.part(new THREE.SphereGeometry(0.06, 8, 6), MOSS, {
      bone: hips,
      at: [x, y, z],
      scale: [1.3, 0.6, 1.2],
    });
  }

  return b.root;
}
