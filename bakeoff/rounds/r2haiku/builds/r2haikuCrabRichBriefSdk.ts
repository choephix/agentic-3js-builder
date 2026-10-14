import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "red rock crab",
  description: "A feisty red rock crab with one oversized raised claw, knobbly speckled shell, eyes on stalks and a barnacle and seaweed on its back.",
};

type V = [number, number, number];

const SHELL = "#b8402a";
const SHELL_DARK = "#7f2a1b";
const ORANGE = "#e8803a";
const CREAM = "#f2e3c6";
const DARK = "#2b1a14";
const WEED = "#3f7a3a";

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scl = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

// Claw pieces: a 2D outline extruded, laid so it runs forward along +Z.
function clawPiece(
  b: ReturnType<typeof createBuilder>,
  pts: [number, number][],
  depth: number,
  tilt: number,
  scale: number,
  color: string,
  at: V,
) {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 3,
  });
  geo.translate(0, 0, -depth / 2);
  geo.scale(scale, scale, scale);
  geo.rotateY(-Math.PI / 2);
  geo.rotateX(tilt);
  b.part(geo, color, { at });
}

export default function build() {
  const b = createBuilder({ name: "red rock crab" });
  const rnd = rng(11);

  // Skeleton root: the carapace.
  const body = b.joint("body", { at: [0, 0.24, 0] });

  // Shell: a wide, flattened dome in brick red.
  b.part(new THREE.SphereGeometry(1, 16, 10), SHELL, {
    at: [0, 0.24, 0],
    scale: [0.34, 0.14, 0.28],
  });

  // Dark underside gives the body weight and reads well from below.
  b.part(new THREE.SphereGeometry(1, 12, 6), SHELL_DARK, {
    at: [0, 0.16, 0.0],
    scale: [0.3, 0.1, 0.25],
  });

  // Knobs and speckles scattered over the top of the shell.
  for (let i = 0; i < 26; i++) {
    const ny = 0.15 + rnd() * 0.85;
    const ring = Math.sqrt(1 - ny * ny);
    const a = rnd() * Math.PI * 2;
    const n: V = [ring * Math.cos(a), ny, ring * Math.sin(a)];
    const p: V = [0.34 * n[0], 0.24 + 0.14 * n[1], 0.28 * n[2]];
    const big = rnd() < 0.5;
    const r = big ? 0.028 + rnd() * 0.012 : 0.018;
    const color = big ? SHELL_DARK : rnd() < 0.5 ? ORANGE : CREAM;
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at: p });
  }
  for (let i = 0; i < 40; i++) {
    const ny = 0.3 + rnd() * 0.7;
    const ring = Math.sqrt(1 - ny * ny);
    const a = rnd() * Math.PI * 2;
    const n: V = [ring * Math.cos(a), ny, ring * Math.sin(a)];
    const p: V = [0.34 * n[0], 0.24 + 0.14 * n[1], 0.28 * n[2]];
    const color = rnd() < 0.6 ? ORANGE : CREAM;
    b.part(new THREE.SphereGeometry(0.011, 4, 3), color, { at: p });
  }

  // Barnacle and seaweed clinging to the back of the shell.
  b.part(new THREE.SphereGeometry(1, 6, 4), CREAM, {
    at: [0.07, 0.36, -0.14],
    scale: [0.035, 0.03, 0.035],
  });
  b.part(new THREE.SphereGeometry(1, 5, 3), DARK, {
    at: [0.07, 0.355, -0.14],
    scale: [0.02, 0.012, 0.02],
  });
  b.sweep(
    [
      [0.0, 0.36, -0.02],
      [0.04, 0.42, -0.08],
      [-0.02, 0.5, -0.14],
      [0.03, 0.58, -0.2],
    ],
    0.012,
    { color: WEED },
  );
  b.part(new THREE.SphereGeometry(1, 6, 4), WEED, {
    at: [0.04, 0.44, -0.09],
    scale: [0.04, 0.012, 0.02],
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), WEED, {
    at: [-0.02, 0.52, -0.15],
    scale: [0.03, 0.01, 0.018],
  });

  // Eyes on stalks.
  for (const s of [1, -1]) {
    const base: V = [0.1 * s, 0.33, 0.24];
    const tip: V = [0.12 * s, 0.45, 0.3];
    b.sweep([base, tip], 0.016, { color: SHELL });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), CREAM, { at: tip });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), DARK, {
      at: add(tip, [0.03 * s, 0.0, 0.03]),
    });
  }

  // Eight jointed walking legs with pointed dark tips.
  const legZ = [0.12, 0.02, -0.08, -0.17];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legZ.forEach((z, idx) => {
      const hip: V = [0.26 * s, 0.22, z];
      const knee: V = [0.48 * s, 0.3, z - 0.02];
      const ankle: V = [0.6 * s, 0.1, z - 0.04];
      const tip: V = [0.66 * s, 0.0, z - 0.06];
      const chain = b.chain(`leg${side}${idx}`, [hip, knee, ankle, tip], {
        parent: body,
        role: "leg",
      });
      b.sweep(chain, 0.035, { color: SHELL_DARK });
      // Pointed foot tip, aimed along the last segment.
      const d = norm(sub(tip, ankle));
      const len = 0.09;
      b.part(new THREE.ConeGeometry(0.03, len, 5), DARK, {
        at: add(tip, scl(d, len / 2)),
        aim: add(tip, scl(d, len)),
      });
    });
  }

  // Oversized raised claw on the +X side.
  const armBig = b.chain(
    "armBig",
    [
      [0.27, 0.25, 0.18],
      [0.4, 0.4, 0.34],
      [0.44, 0.5, 0.56],
    ],
    { parent: body, role: "arm" },
  );
  b.sweep(armBig, 0.05, { color: SHELL });
  b.part(new THREE.SphereGeometry(1, 12, 8), SHELL, {
    at: [0.45, 0.53, 0.68],
    scale: [0.13, 0.11, 0.16],
  });
  // Upper pincer: raised, with teeth on its inner edge and a dark tip.
  const upperPts: [number, number][] = [
    [0.0, -0.03],
    [0.12, -0.04],
    [0.26, -0.02],
    [0.36, 0.03],
    [0.3, 0.02],
    [0.27, 0.045],
    [0.24, 0.02],
    [0.2, 0.05],
    [0.17, 0.025],
    [0.13, 0.055],
    [0.1, 0.03],
    [0.05, 0.06],
    [0.0, 0.07],
  ];
  clawPiece(b, upperPts, 0.08, -0.2, 1, SHELL, [0.44, 0.57, 0.72]);
  clawPiece(
    b,
    [
      [0.26, -0.02],
      [0.36, 0.03],
      [0.3, 0.02],
      [0.27, 0.045],
      [0.24, 0.02],
      [0.2, 0.035],
    ],
    0.09,
    -0.2,
    1,
    DARK,
    [0.44, 0.57, 0.72],
  );
  // Lower pincer: mirrored outline, slightly open.
  const lowerPts: [number, number][] = upperPts.map(
    ([x, y]) => [x, -y] as [number, number],
  );
  clawPiece(b, lowerPts, 0.08, -0.05, 1, SHELL, [0.44, 0.47, 0.72]);
  clawPiece(
    b,
    [
      [0.26, 0.02],
      [0.36, -0.03],
      [0.3, -0.02],
      [0.27, -0.045],
      [0.24, -0.02],
      [0.2, -0.035],
    ],
    0.09,
    -0.05,
    1,
    DARK,
    [0.44, 0.47, 0.72],
  );

  // Smaller second claw on the -X side.
  const armSmall = b.chain(
    "armSmall",
    [
      [-0.27, 0.22, 0.12],
      [-0.4, 0.2, 0.3],
      [-0.42, 0.18, 0.44],
    ],
    { parent: body, role: "arm" },
  );
  b.sweep(armSmall, 0.035, { color: SHELL });
  b.part(new THREE.SphereGeometry(1, 10, 6), SHELL, {
    at: [-0.43, 0.18, 0.5],
    scale: [0.07, 0.06, 0.09],
  });
  clawPiece(b, upperPts, 0.05, 0.0, 0.5, SHELL, [-0.43, 0.2, 0.54]);
  clawPiece(b, lowerPts, 0.05, 0.0, 0.5, SHELL, [-0.43, 0.15, 0.54]);

  return b.root;
}
