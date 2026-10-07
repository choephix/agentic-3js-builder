import * as THREE from "three";
import { catmull, createBuilder, mix, noise, paint, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Keel-billed toucan",
  description:
    "A keel-billed toucan with a huge lime, sky-blue and orange beak tipped in cherry red, a lemon bib, lime eye rings and bright blue feet, perched on a mossy branch beside a pink orchid.",
};

// Palette (sRGB)
const PLUMAGE = "#16181e";
const SHEEN = "#2b3046";
const LEMON = "#fff03a";
const LIME = "#9be23d";
const SKY = "#43b6ea";
const ORANGE = "#ff8c1a";
const CHERRY = "#c8102e";
const SCARLET = "#e3192c";
const EYE = "#1d140f";
const BLUE = "#1f6fe6";
const BARK = "#5b4632";
const MOSS = "#5fa030";
const MOSS_DARK = "#3b6e22";
const LEAF = "#4d9a2a";
const STEM = "#5c9e35";
const PETAL = "#ffa3d1";
const SEPAL = "#f0609f";
const LIP = "#c41e6a";
const POLLEN = "#ffd23a";

// Key places, metres, +Y up, the bird faces +Z
const HEAD = new THREE.Vector3(0, 0.665, 0.095);
const HEAD_R = 0.066;
const EYES = [new THREE.Vector3(0.0633, 0.6734, 0.1126), new THREE.Vector3(-0.0633, 0.6734, 0.1126)];
const VENT = new THREE.Vector3(0, 0.4, -0.1);
const SPINE = [
  [0, 0.4, -0.1],
  [0, 0.46, -0.01],
  [0, 0.53, 0.05],
  [0, 0.595, 0.09],
];
const BLOOM = new THREE.Vector3(0.27, 0.49, -0.07);
const FACE = new THREE.Vector3(0, 0.3, 1).normalize();
const ACROSS = new THREE.Vector3(1, 0, 0);
const UP = new THREE.Vector3().crossVectors(FACE, ACROSS).normalize();

// Black wing outline in (z, y) at the wing's x, traced round the folded wing
const WING: Array<[number, number]> = [
  [0.04, 0.585],
  [0.0, 0.565],
  [-0.06, 0.52],
  [-0.12, 0.47],
  [-0.18, 0.41],
  [-0.22, 0.37],
  [-0.255, 0.342],
  [-0.2, 0.35],
  [-0.14, 0.38],
  [-0.08, 0.4],
  [-0.02, 0.43],
  [0.02, 0.48],
  [0.04, 0.53],
];

// Moss clumps on the branch and stump: x, y, z, radius, colour
const CLUMPS: Array<[number, number, number, number, string]> = [
  [-0.22, 0.312, 0.02, 0.034, MOSS],
  [-0.12, 0.314, -0.03, 0.028, MOSS_DARK],
  [0.13, 0.322, 0.03, 0.03, MOSS],
  [0.19, 0.324, -0.02, 0.026, MOSS_DARK],
  [-0.27, 0.3, -0.03, 0.03, MOSS_DARK],
];

/** A leaf or petal outline along +x, `length` long and `width` across; `shape` moves where it is widest. */
function lobe(length: number, width: number, shape: number): Array<[number, number]> {
  const N = 12;
  const half = (s: number) => width * Math.sin(Math.PI * Math.pow(s, shape));
  const out: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) out.push([length * (i / N), half(i / N)]);
  for (let i = N - 1; i >= 1; i--) out.push([length * (i / N), -half(i / N)]);
  return out;
}

/** Glossy black plumage: a lemon bib, lime eye rings and a scarlet vent patch. */
const plumage = paint((p, n) => {
  for (const eye of EYES) {
    const d = p.distanceTo(eye);
    if (d > 0.0105 && d < 0.0215) return LIME;
  }
  const bibEdge = 0.47 + 0.012 * (noise(p, 0.04, 5) - 0.5);
  if (n.z > 0.3 && p.z > 0.06 && p.y > bibEdge && p.y < 0.645) return LEMON;
  if (n.y < -0.3 && p.distanceTo(VENT) < 0.055 + 0.008 * (noise(p, 0.03, 6) - 0.5)) return SCARLET;
  return mix(PLUMAGE, SHEEN, 0.6 * smoothstep(0.45, 0.7, noise(p, 0.08, 9)));
});

/** Rainbow beak: lime at the base, then sky blue, orange and a cherry-red tip, banded along its length. */
const beak = paint((p, _n, s) => {
  const t = s[0] + 0.025 * (noise(p, 0.05, 21) - 0.5);
  return t < 0.4 ? LIME : t < 0.64 ? SKY : t < 0.84 ? ORANGE : CHERRY;
});

/** Bark with moss on the upward faces. */
const mossy = paint((p, n) => {
  const cover = smoothstep(0.1, 0.6, n.y) * smoothstep(0.42, 0.56, noise(p, 0.035, 2));
  return mix(BARK, mix(MOSS_DARK, MOSS, noise(p, 0.02, 4)), cover);
});

export default function toucan() {
  const b = createBuilder({ name: "keel-billed-toucan", paintSize: 2048 });

  // Skeleton: root, spine, head and beak hinge, legs with toes, wings, tail
  b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain("spine", SPINE, { parent: "root", names: ["spine1", "spine2", "spine3"], role: "spine" });
  b.joint("head", { parent: "spine3", at: HEAD, dir: [0.2, 0.25, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.628, 0.13], dir: [0.2, -0.06, 1], role: "jaw" });

  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    const x = side * 0.035;
    const leg = b.chain(
      `leg${s}`,
      [
        [x, 0.44, -0.02],
        [side * 0.042, 0.39, 0],
        [x, 0.35, 0.012],
      ],
      {
        parent: "spine1",
        names: [`hip${s}`, `knee${s}`, `ankle${s}`],
        role: "leg",
        contact: [x, 0.322, 0],
      },
    );
    b.sweep(leg, 0.0085, { color: BLUE, name: `leg${s}` });

    const toes: Array<[string, number[]]> = [
      [`toe${s}F1`, [x - 0.012, 0.322, 0.024]],
      [`toe${s}F2`, [x + 0.012, 0.322, 0.024]],
      [`toe${s}B`, [x, 0.322, -0.024]],
    ];
    for (const [name, tip] of toes) {
      const toe = b.chain(name, [[x, 0.35, 0.012], tip], {
        parent: `ankle${s}`,
        names: [name],
        role: "digit",
      });
      b.sweep(toe, 0.0072, { color: BLUE, name });
    }
  }

  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    b.chain(
      `wing${s}`,
      [
        [side * 0.066, 0.56, 0.03],
        [side * 0.07, 0.47, -0.08],
        [side * 0.066, 0.36, -0.2],
      ],
      {
        parent: "spine2",
        names: [`wing${s}1`, `wing${s}2`, `wing${s}3`],
        role: "wing",
      },
    );
    b.extrude(WING, {
      color: plumage,
      at: [side * 0.066, 0, 0],
      thickness: 0.014,
      bone: `wing${s}2`,
      name: `wing${s}`,
    });
  }

  const tail = b.chain(
    "tail",
    [
      [0, 0.4, -0.1],
      [0, 0.355, -0.16],
      [0, 0.3, -0.215],
      [0, 0.25, -0.265],
    ],
    { parent: "spine1", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, (t) => [0.03 - 0.006 * t, 0.011] as const, { color: plumage, sides: 8, name: "tail" });

  // Body, head, eyes
  b.loft(
    [
      { at: SPINE[0], w: 0.09, h: 0.1 },
      { at: SPINE[1], w: 0.13, h: 0.15 },
      { at: SPINE[2], w: 0.14, h: 0.16 },
      { at: SPINE[3], w: 0.1, h: 0.11 },
    ],
    { color: plumage, sides: 12, bone: spine, name: "body" },
  );

  b.part(new THREE.SphereGeometry(HEAD_R, b.segments(16), b.segments(12)), plumage, {
    at: HEAD,
    bone: "head",
    scale: [1, 1.04, 1.02],
    name: "head",
  });

  EYES.forEach((eye, i) => {
    const side = i === 0 ? 1 : -1;
    b.part(new THREE.SphereGeometry(0.0095, 10, 8), EYE, { at: eye, bone: "head", name: "eye" });
    b.part(new THREE.SphereGeometry(0.0028, 6, 5), "#ffffff", {
      at: eye.clone().add(new THREE.Vector3(side * 0.003, 0.004, 0.006)),
      bone: "head",
      name: "glint",
    });
  });

  // Beak: upper mandible on the head, lower mandible on the jaw hinge
  b.sweep(
    catmull([
      [0, 0.68, 0.12],
      [0.035, 0.69, 0.19],
      [0.08, 0.696, 0.27],
      [0.112, 0.69, 0.33],
      [0.126, 0.668, 0.36],
    ]),
    (t) => [0.034 - 0.022 * t, 0.012 + 0.036 * (1 - t) ** 1.2] as const,
    { color: beak, bone: "head", sides: 10, name: "beakUpper" },
  );
  b.sweep(
    catmull([
      [0, 0.628, 0.13],
      [0.03, 0.636, 0.2],
      [0.075, 0.65, 0.27],
      [0.1, 0.648, 0.31],
      [0.11, 0.64, 0.33],
    ]),
    (t) => [0.026 - 0.014 * t, 0.02 - 0.012 * t] as const,
    { color: beak, bone: "jaw", sides: 10, name: "beakLower" },
  );

  // Branch, stump and moss
  b.sweep(
    [
      [-0.33, 0, -0.02],
      [-0.32, 0.27, -0.02],
    ],
    (t) => 0.062 - 0.012 * t,
    { color: mossy, bone: "root", sides: 10, caps: { start: "flat", end: "round" }, name: "stump" },
  );
  b.sweep(
    catmull([
      [-0.31, 0.27, -0.02],
      [-0.1, 0.295, 0],
      [0.1, 0.3, 0],
      [0.3, 0.31, 0.01],
      [0.4, 0.34, 0.03],
    ]),
    (t) => 0.034 - 0.014 * t,
    { color: mossy, bone: "root", sides: 10, name: "branch" },
  );
  b.part(new THREE.SphereGeometry(0.05, 12, 8), MOSS_DARK, {
    at: [-0.345, 0.008, 0.05],
    scale: [1.4, 0.35, 1.1],
    bone: "root",
    name: "moss",
  });
  for (const [x, y, z, r, color] of CLUMPS) {
    b.part(new THREE.SphereGeometry(r, 10, 7), color, {
      at: [x, y, z],
      scale: [1.5, 0.55, 1.2],
      bone: "root",
      name: "moss",
    });
  }

  // Pink orchid growing from the branch
  b.sweep(
    catmull([
      [0.245, 0.318, -0.02],
      [0.252, 0.39, -0.04],
      [0.262, 0.44, -0.055],
      BLOOM,
    ]),
    (t) => 0.0055 - 0.0012 * t,
    { color: STEM, bone: "root", sides: 6, name: "stem" },
  );
  b.extrude(lobe(0.085, 0.018, 0.9), {
    color: LEAF,
    at: [0.245, 0.318, -0.02],
    x: [0.85, 0.45, 0.1],
    y: [0, 0, 1],
    thickness: 0.004,
    bone: "root",
    name: "leaf",
  });
  b.extrude(lobe(0.07, 0.016, 0.9), {
    color: LEAF,
    at: [0.245, 0.318, -0.02],
    x: [-0.6, 0.5, -0.3],
    y: [0, 0, 1],
    thickness: 0.004,
    bone: "root",
    name: "leaf",
  });

  const petal = (angle: number, length: number, width: number, color: string, shape = 1.3) => {
    const a = (angle * Math.PI) / 180;
    const radial = new THREE.Vector3().addScaledVector(ACROSS, Math.cos(a)).addScaledVector(UP, Math.sin(a));
    const tangent = new THREE.Vector3().addScaledVector(ACROSS, -Math.sin(a)).addScaledVector(UP, Math.cos(a));
    b.extrude(lobe(length, width, shape), {
      color,
      at: BLOOM,
      x: radial,
      y: tangent,
      thickness: 0.005,
      bone: "root",
      name: "petal",
    });
  };
  petal(90, 0.044, 0.016, SEPAL);
  petal(22, 0.042, 0.021, PETAL);
  petal(158, 0.042, 0.021, PETAL);
  petal(232, 0.043, 0.016, SEPAL);
  petal(308, 0.043, 0.016, SEPAL);
  petal(270, 0.03, 0.017, LIP, 1);
  b.part(new THREE.SphereGeometry(0.008, 8, 6), POLLEN, {
    at: BLOOM.clone().addScaledVector(FACE, 0.004),
    bone: "root",
    name: "column",
  });

  return b.root;
}
