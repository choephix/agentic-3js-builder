```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Red panda on a mossy branch",
  description:
    "A delighted red panda balancing on a mossy branch, holding a bamboo shoot in one paw.",
};

type V = [number, number, number];

const C = {
  rust: "#a84a22",
  ginger: "#e08a3e",
  cream: "#f6e7c9",
  white: "#f8f2e6",
  black: "#1d1816",
  tear: "#a63a1e",
  nose: "#120e0d",
  mouth: "#4a1a22",
  tongue: "#d9707a",
  bark: "#5a3d27",
  moss: "#4f7d2c",
  mossLight: "#8ab64e",
  rock: "#6a7656",
  rockDark: "#4e5a40",
  bamboo: "#86b848",
  bambooDark: "#4d7d2e",
  bambooPale: "#e3efa6",
};

// Plain three.js shapes, each built around its own origin. Cones stand on
// their base at the origin so they can be seated on a point and aimed.
const ball = (r: number, sx = 1, sy = 1, sz = 1) => {
  const g = new THREE.SphereGeometry(r, 10, 7);
  g.scale(sx, sy, sz);
  return g;
};
const cone = (r: number, h: number, seg = 7) => {
  const g = new THREE.ConeGeometry(r, h, seg);
  g.translate(0, h / 2, 0);
  return g;
};
const stone = (sx: number, sy: number, sz: number) => {
  const g = new THREE.IcosahedronGeometry(1, 0);
  g.scale(sx, sy, sz);
  return g;
};

export default function build() {
  const b = createBuilder({ name: "red-panda-branch" });

  // ---- skeleton ---------------------------------------------------------
  const base = b.joint("base", { at: [0, 0, 0] });
  const hips = b.joint("hips", { at: [0, 0.45, -0.16], parent: base });
  const chest = b.joint("chest", { at: [0, 0.47, 0.06], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.56, 0.2], parent: chest });
  const head = b.joint("head", { at: [0, 0.665, 0.3], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.63, 0.34], parent: head });

  const shL = b.joint("shoulderL", { at: [0.07, 0.44, 0.08], parent: chest });
  const elL = b.joint("elbowL", { at: [0.12, 0.4, 0.17], parent: shL });
  const wrL = b.joint("wristL", { at: [0.09, 0.5, 0.27], parent: elL });
  const shR = b.joint("shoulderR", { at: [-0.07, 0.44, 0.08], parent: chest });
  const elR = b.joint("elbowR", { at: [-0.08, 0.35, 0.1], parent: shR });
  const wrR = b.joint("wristR", { at: [-0.05, 0.27, 0.14], parent: elR });
  const hipL = b.joint("hipL", { at: [0.07, 0.43, -0.15], parent: hips });
  const knL = b.joint("kneeL", { at: [0.09, 0.34, -0.12], parent: hipL });
  const anL = b.joint("ankleL", { at: [0.06, 0.27, -0.08], parent: knL });
  const hipR = b.joint("hipR", { at: [-0.07, 0.43, -0.15], parent: hips });
  const knR = b.joint("kneeR", { at: [-0.09, 0.34, -0.12], parent: hipR });
  const anR = b.joint("ankleR", { at: [-0.06, 0.27, -0.08], parent: knR });

  // Tail: seven joints rising out behind the hips and curling up and forward.
  const tailAt: V[] = [
    [0.0, 0.44, -0.23],
    [0.05, 0.46, -0.32],
    [0.12, 0.53, -0.39],
    [0.14, 0.62, -0.42],
    [0.14, 0.71, -0.41],
    [0.12, 0.79, -0.36],
    [0.09, 0.84, -0.3],
  ];
  const tail: ReturnType<typeof b.joint>[] = [];
  tailAt.forEach((p, i) => {
    tail.push(b.joint(`tail${i + 1}`, { at: p, parent: i === 0 ? hips : tail[i - 1] }));
  });

  // ---- mossy branch and its rocks (scenery on the base joint) ----------
  const branch = b.sweep(
    [
      [0, 0.2, -0.66],
      [0.01, 0.22, -0.2],
      [0, 0.22, 0.2],
      [-0.01, 0.2, 0.66],
    ] as V[],
    0.065,
    { color: C.bark },
  );
  const bark = b.surface(branch);

  // Moss stuck around the upper half of the branch.
  for (let k = 0; k < 24; k++) {
    const a = Math.PI * (0.06 + 0.88 * ((k * 0.618) % 1));
    const z = -0.6 + 1.2 * ((k * 0.4143) % 1);
    const hit = bark.nearest([0.25 * Math.cos(a), 0.21 + 0.25 * Math.sin(a), z]);
    b.stick(stone(0.034, 0.012, 0.028), k % 3 === 0 ? C.mossLight : C.moss, hit);
  }

  // Two low rocks holding the branch up off the ground.
  b.part(stone(0.2, 0.12, 0.17), C.rock, { at: [0.0, 0.095, -0.44], bone: base });
  b.part(stone(0.22, 0.11, 0.18), C.rockDark, { at: [0.02, 0.09, 0.46], bone: base });

  // ---- tail: fluffy segments in ginger and cream rings -----------------
  const tailCols = [C.rust, C.ginger, C.cream, C.ginger, C.cream, C.ginger, C.cream];
  const spine = [hips, ...tail];
  for (let i = 0; i < tailCols.length; i++) {
    const last = i === tailCols.length - 1;
    b.sweep([spine[i], spine[i + 1]], last ? 0.05 : 0.064, { color: tailCols[i] });
  }
  tail.forEach((j, i) => {
    const isTip = i === tail.length - 1;
    b.part(ball(isTip ? 0.06 : 0.074), tailCols[i + 1] ?? C.ginger, { at: j });
  });

  // ---- body: rust back, black belly -----------------------------------
  b.sweep([hips, chest], 0.1, { color: C.rust });
  b.part(ball(0.1, 1, 0.96, 1.12), C.rust, { at: hips });
  b.part(ball(0.102, 1, 1, 0.9), C.rust, { at: chest });
  b.sweep(
    [
      [0, 0.415, -0.15],
      [0, 0.43, 0.06],
    ] as V[],
    0.086,
    { color: C.black },
  );

  // Neck from chest to head.
  const neckTube = b.sweep([chest, neck, head], 0.072, { color: C.rust });
  const neckSurf = b.surface(neckTube);
  b.stick(ball(0.05, 0.9, 1.1, 0.45), C.cream, neckSurf.nearest([0, 0.5, 0.3]));

  // ---- legs and paws (black) ------------------------------------------
  const legs = [
    [shL, elL, wrL],
    [shR, elR, wrR],
    [hipL, knL, anL],
    [hipR, knR, anR],
  ];
  for (const leg of legs) {
    b.sweep(leg, 0.03, { color: C.black });
    b.part(ball(0.031), C.black, { at: leg[1] });
  }
  for (const p of [wrR, anL, anR]) {
    b.part(ball(0.03, 1.15, 0.8, 1.4), C.black, { at: p });
  }
  // The raised left paw that holds the shoot.
  b.part(ball(0.034, 1.1, 0.85, 1.25), C.black, { at: wrL });

  // ---- bamboo shoot in the raised paw ---------------------------------
  const shootBase = new THREE.Vector3(0.09, 0.52, 0.28);
  const shootDir = new THREE.Vector3(0.45, 1, 0.1).normalize();
  const shootSide = new THREE.Vector3()
    .crossVectors(shootDir, new THREE.Vector3(0, 0, 1))
    .normalize();
  const SL = 0.28;
  const toV = (v: THREE.Vector3): V => [v.x, v.y, v.z];
  const sd = toV(shootDir);

  b.part(cone(0.036, SL, 8), C.bamboo, { at: toV(shootBase), dir: sd, bone: wrL });
  b.part(cone(0.013, 0.08, 6), C.bambooPale, {
    at: toV(shootBase.clone().addScaledVector(shootDir, SL * 0.74)),
    dir: sd,
    bone: wrL,
  });
  // Leaf sheaths wrapped down the shoot.
  for (const f of [0.12, 0.24]) {
    for (const s of [1, -1]) {
      const p = shootBase.clone().addScaledVector(shootDir, SL * f);
      const ld = shootSide
        .clone()
        .multiplyScalar(s * 0.9)
        .addScaledVector(shootDir, 0.45)
        .normalize();
      b.part(cone(0.013, 0.11, 4), C.bambooDark, { at: toV(p), dir: toV(ld), bone: wrL });
    }
  }

  // ---- head: rust crown, white face plate, features stuck on it --------
  // The head is tipped back a little so the face looks up, delighted.
  const hz = (z: number): V => [0, 0.665 + (z - 0.3) * 0.45, z];
  const crown = b.sweep([hz(0.22), hz(0.3)], 0.094, { color: C.rust });
  b.sweep([hz(0.29), hz(0.345)], 0.106, { color: C.rust });
  const faceDisc = b.sweep([hz(0.335), hz(0.368)], 0.092, { color: C.white });
  const crownSurf = b.surface(crown);
  const face = b.surface(faceDisc);

  // White cheek puffs on the sides of the head.
  for (const s of [1, -1]) {
    b.stick(ball(0.04, 0.9, 1, 0.9), C.white, crownSurf.nearest([s * 0.12, 0.62, 0.27]));
  }

  // Pointed ears with a white inner edge.
  for (const s of [1, -1]) {
    const e = crownSurf.nearest([s * 0.07, 0.77, 0.26]);
    b.part(cone(0.05, 0.095, 3), C.rust, { at: e, dir: [s * 0.42, 0.88, -0.1] });
    b.part(cone(0.03, 0.072, 3), C.white, { at: e, dir: [s * 0.34, 0.85, 0.16] });
  }

  // Eyes, highlights, and red tear marks running down from each eye.
  for (const s of [1, -1]) {
    b.stick(ball(0.021, 1, 1.15, 0.55), C.black, face.nearest([s * 0.04, 0.708, 0.42]));
    b.stick(ball(0.0065), C.white, face.nearest([s * 0.034, 0.72, 0.42]));
    const tear: V[] = [
      [s * 0.03, 0.69, 0.42],
      [s * 0.048, 0.664, 0.42],
      [s * 0.056, 0.632, 0.42],
    ];
    b.sweep(tear.map((p) => face.nearest(p)), 0.0095, { color: C.tear });
  }

  // Little black nose.
  b.stick(ball(0.024, 1.1, 0.75, 0.7), C.nose, face.nearest([0, 0.678, 0.42]));

  // Happy smile line across the lower face.
  const smile: V[] = [];
  for (let i = 0; i <= 8; i++) {
    const s = -1 + i / 4;
    smile.push([0.05 * s, 0.655 - 0.014 * (1 - s * s), 0.42]);
  }
  b.sweep(smile.map((p) => face.nearest(p)), 0.0052, { color: C.black });

  // Open mouth and tongue ride the lower jaw.
  b.part(ball(0.026, 1, 0.5, 0.6), C.mouth, { at: face.nearest([0, 0.63, 0.42]), bone: jaw });
  b.part(ball(0.016, 1, 0.4, 0.6), C.tongue, {
    at: face.nearest([0, 0.622, 0.42]),
    bone: jaw,
  });

  return b.root;
}
```