```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, mottle, paint } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Red panda on a mossy branch",
  description: "A delighted red panda sitting on a mossy bough, holding up a bamboo shoot, with a big ringed tail.",
};

// ---- palette ----------------------------------------------------------------
const RUST = "#b4522a";
const RUST_DK = "#7a3317";
const GINGER = "#dc8a3c";
const GINGER_DK = "#b25f2a";
const CREAM = "#f6e9cb";
const CREAM_DK = "#e4cfa0";
const BLACK = "#1f1714";
const WHITE = "#fcf7ec";
const NOSE = "#0b0706";
const EYE = "#120b09";
const TEAR = "#8c3818";
const MOUTH = "#3a1613";
const PINK = "#e58b97";
const MOSS = "#4c7c24";
const MOSS_LT = "#84b23f";
const BARK = "#6e4c2e";
const BARK_DK = "#412c1a";
const STUMP = "#7b6a50";
const SHOOT = "#a8cf68";
const SHOOT_LT = "#e2f0b6";
const BRACT = "#7b5027";

const HEAD = { x: 0, y: 0.9, z: 0.3, r: 0.09 };

// ---- paints -----------------------------------------------------------------
const furMottle = mottle(RUST, RUST_DK, { size: 0.06, seed: 4 });
const creamMottle = mottle(CREAM, CREAM_DK, { size: 0.03, seed: 5 });
const gingerMottle = mottle(GINGER, GINGER_DK, { size: 0.03, seed: 6 });
const mossPaint = mottle(MOSS, MOSS_LT, { size: 0.05, seed: 9 });
const barkPaint = grain(BARK, BARK_DK, { size: 0.03, axis: "z", seed: 2 });

// Rust back, black belly and chest.
const bodyPaint = paint((p, n) => ((n.y < -0.3 || (n.z > 0.45 && p.y < 0.72)) ? BLACK : furMottle));

// Moss on the upper face of the bough, bark elsewhere.
const branchPaint = paint((_p, n) => (n.y > 0.4 ? mossPaint : barkPaint));

// Pale bamboo with brown bract bands along the shoot.
const shootPaint = paint((_p, _n, s) => {
  if (s[0] > 0.78) return SHOOT_LT;
  return s[0] % 0.22 < 0.06 ? BRACT : SHOOT;
});

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Face drawn on the head: arch eyes, tear marks, nose, white muzzle field.
const headPaint = paint((p, n) => {
  if (n.z < 0.15) return furMottle;
  const x = p.x;
  const y = p.y - HEAD.y;
  for (const s of [-1, 1]) {
    const arch = Math.abs(Math.hypot(x - s * 0.038, y) - 0.016);
    if (y > 0 && arch < 0.0055) return EYE;
  }
  if (Math.hypot(x / 0.016, (y + 0.028) / 0.011) < 1) return NOSE;
  for (const s of [-1, 1]) {
    if (segDist(x, y, s * 0.046, 0, s * 0.072, -0.056) < 0.0075) return TEAR;
  }
  if (Math.hypot(x / 0.078, (y + 0.012) / 0.07) < 1) return WHITE;
  return furMottle;
});

// ---- model ------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "red-panda" });

  // Skeleton. The spine chain is the root: hips, waist, chest.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.06],
      [0, 0.62, 0.0],
      [0, 0.72, 0.08],
      [0, 0.78, 0.13],
    ]),
    { names: ["hips", "waist", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.78, 0.13],
      [0, 0.84, 0.21],
      [0, 0.89, 0.27],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const H: [number, number, number] = [HEAD.x, HEAD.y, HEAD.z];
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: H,
    aim: [0, HEAD.y + 0.1, HEAD.z + 0.05],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.83, 0.33],
    aim: [0, 0.78, 0.37],
    role: "jaw",
  });

  // Body: a loft along the spine, rump on the bough to shoulders.
  b.loft(
    [
      { at: [0, 0.5, -0.1], w: 0.25, h: 0.26 },
      { at: [0, 0.62, 0.0], w: 0.26, h: 0.26 },
      { at: [0, 0.72, 0.08], w: 0.23, h: 0.24 },
      { at: [0, 0.78, 0.13], w: 0.17, h: 0.17 },
    ],
    { bone: spine, color: bodyPaint },
  );

  b.sweep(neck, (t) => 0.072 - 0.012 * t, { color: furMottle, sides: 10 });

  // Head: painted face on a round skull.
  b.part(new THREE.SphereGeometry(HEAD.r, 14, 10), headPaint, { bone: head, at: H });
  b.part(new THREE.SphereGeometry(0.04, 12, 8).scale(1.2, 0.8, 0.9), WHITE, {
    bone: head,
    at: [0, 0.88, 0.375],
  });
  b.part(new THREE.SphereGeometry(0.014, 8, 6).scale(1.3, 0.9, 0.8), NOSE, {
    bone: head,
    at: [0, 0.872, 0.41],
  });
  // Open mouth: dark cavity between the upper muzzle and the lower jaw.
  b.part(new THREE.SphereGeometry(0.03, 9, 6).scale(1, 0.45, 0.6), MOUTH, {
    bone: head,
    at: [0, 0.842, 0.36],
  });

  // Lower jaw hangs on its own joint, with a pink tongue.
  b.part(new THREE.SphereGeometry(0.034, 9, 6).scale(1.1, 0.55, 0.85), WHITE, {
    bone: jaw,
    at: [0, 0.815, 0.36],
  });
  b.part(new THREE.SphereGeometry(0.02, 8, 6).scale(1.1, 0.4, 1), PINK, {
    bone: jaw,
    at: [0, 0.826, 0.37],
  });

  // Pointed ears: a white rim behind a slightly smaller rust face.
  const earOuter: OutlinePoint[] = [
    [-0.035, 0],
    [0.035, 0],
    [0.026, 0.045],
    [0, 0.08, "sharp"],
    [-0.026, 0.045],
  ];
  const earInner: OutlinePoint[] = [
    [-0.024, 0.007],
    [0.024, 0.007],
    [0.017, 0.04],
    [0, 0.068, "sharp"],
    [-0.017, 0.04],
  ];
  for (const s of [-1, 1]) {
    const base: [number, number, number] = [s * 0.055, 0.972, 0.285];
    b.extrude(earOuter, { at: base, x: [s, 0, 0], y: [s * 0.3, 1, 0], thickness: 0.01, color: WHITE, bone: head });
    b.extrude(earInner, { at: base, x: [s, 0, 0], y: [s * 0.3, 1, 0], thickness: 0.014, color: RUST, bone: head });
  }

  // Whiskers.
  for (const s of [-1, 1]) {
    for (const dy of [-0.012, 0, 0.012]) {
      b.rod([s * 0.03, 0.88 + dy, 0.405], [s * 0.14, 0.87 + dy * 0.5, 0.35], 0.0018, {
        color: BLACK,
        bone: head,
      });
    }
  }

  // Hind legs: thighs on the rump, feet gripping the bough's shoulders.
  for (const s of [-1, 1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.11, 0.5, -0.05],
        [s * 0.14, 0.42, 0.09],
        [s * 0.1, 0.36, 0.18],
        [s * 0.095, 0.325, 0.25],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
    b.sweep(leg, (t) => 0.06 - 0.02 * t, { color: BLACK, sides: 8 });
    b.part(new THREE.SphereGeometry(0.03, 8, 6).scale(1, 0.55, 1.5), BLACK, {
      bone: leg.joints[3],
      at: [s * 0.095, 0.31, 0.24],
    });
  }

  // Left arm lifts the bamboo shoot.
  const armL = b.chain(
    "armL",
    catmull([
      [0.09, 0.72, 0.12],
      [0.16, 0.62, 0.2],
      [0.14, 0.75, 0.28],
      [0.13, 0.8, 0.32],
    ]),
    { parent: chest, names: ["shoulderL", "elbowL", "wristL", "pawL"], role: "arm" },
  );
  b.sweep(armL, (t) => 0.05 - 0.018 * t, { color: BLACK, sides: 8 });
  const pawL: [number, number, number] = [0.13, 0.8, 0.32];
  b.part(new THREE.SphereGeometry(0.03, 8, 6).scale(1.2, 0.9, 1.1), BLACK, {
    bone: armL.joints[3],
    at: pawL,
  });
  const shootDir = new THREE.Vector3(0.3, 0.8, 0.5).normalize();
  b.spike(pawL, [shootDir.x, shootDir.y, shootDir.z], 0.24, 0.032, {
    color: shootPaint,
    bone: armL.joints[3],
  });

  // Right arm rests a paw on the bough in front of the hind feet.
  const armR = b.chain(
    "armR",
    catmull([
      [-0.09, 0.72, 0.12],
      [-0.2, 0.6, 0.22],
      [-0.08, 0.44, 0.3],
      [-0.03, 0.37, 0.3],
    ]),
    { parent: chest, names: ["shoulderR", "elbowR", "wristR", "pawR"], role: "arm" },
  );
  b.sweep(armR, (t) => 0.05 - 0.018 * t, { color: BLACK, sides: 8 });
  b.part(new THREE.SphereGeometry(0.027, 8, 6).scale(1.3, 0.8, 1.1), BLACK, {
    bone: armR.joints[3],
    at: [-0.03, 0.365, 0.3],
  });

  // Big fluffy tail: rests on the bough, then curls up for balance.
  // Rings: cream and ginger, with a rust base.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.47, -0.1],
      [0, 0.45, -0.22],
      [0.08, 0.43, -0.32],
      [0.2, 0.42, -0.4],
      [0.29, 0.5, -0.43],
      [0.31, 0.64, -0.41],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.05 + 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.1)), {
    sides: 10,
    bands: [
      [0.14, furMottle],
      [0.26, creamMottle],
      [0.38, gingerMottle],
      [0.5, creamMottle],
      [0.62, gingerMottle],
      [0.74, creamMottle],
      [0.86, gingerMottle],
      [1, creamMottle],
    ],
  });

  // Mossy bough on two stumps. The props ride the root joint.
  const branch = b.sweep(
    catmull([
      [0, 0.26, -0.8],
      [0.01, 0.26, -0.3],
      [-0.01, 0.26, 0.3],
      [0, 0.26, 0.8],
    ]),
    0.1,
    { bone: hips, color: branchPaint, sides: 10, smooth: false },
  );

  for (const z of [-0.5, 0.55]) {
    b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 10), STUMP, { bone: hips, at: [0, 0.08, z] });
    b.part(new THREE.SphereGeometry(0.13, 10, 6).scale(1, 0.3, 1), MOSS, { bone: hips, at: [0, 0.16, z] });
  }

  // Moss clumps on top of the bough.
  const top = b.surface(branch);
  for (const z of [-0.62, 0.05, 0.42, 0.68]) {
    const hit = top.nearest([0.03, 0.4, z]);
    b.stick(new THREE.SphereGeometry(0.05, 7, 5).scale(1.2, 0.5, 1.1), MOSS_LT, hit, {
      embed: 0.3,
      bone: hips,
    });
  }

  return b.root;
}
```