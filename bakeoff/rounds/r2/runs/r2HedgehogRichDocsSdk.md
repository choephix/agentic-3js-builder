```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, polyline } from "agentic-3js-builder";

export const meta = {
  name: "Autumn Hedgehog",
  description:
    "A plump hedgehog on an evening stroll: chestnut spine dome with cream tips, fawn face, black button nose, pink paws and a red maple leaf stuck on its back.",
};

const BASE = "#5a3a22";
const SPINE_A = "#7a4a26";
const SPINE_B = "#6a3f20";
const CREAM = "#f0dfb8";
const FAWN = "#d9b88c";
const PINK = "#e9a0a0";
const BLACK = "#0b0b0d";
const WHITE = "#ffffff";
const RED = "#c42a14";
const VEIN = "#7d1408";
const STEM = "#6b3b1c";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "hedgehog" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.09, -0.02] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.09, -0.12],
      [0, 0.09, -0.02],
      [0, 0.09, 0.07],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );

  const headChain = b.chain(
    "headc",
    catmull([
      [0, 0.085, 0.07],
      [0, 0.075, 0.13],
      [0, 0.058, 0.205],
    ]),
    { parent: spine.joints[1], names: ["neck", "head"], role: "neck" },
  );
  const head = headChain.joints[1];

  // Body
  const body = b.sweep(spine, (t) => {
    const k = Math.sin(Math.PI * (0.08 + 0.84 * t));
    return [0.03 + 0.065 * k, 0.025 + 0.06 * k];
  }, {
    sides: 12,
    color: BASE,
    sectors: [[120, 240, FAWN]],
  });

  // Head and face
  const headTube = b.sweep(headChain, [0.052, 0.05, 0.036, 0.011], {
    color: FAWN,
    sides: 8,
    caps: "round",
  });

  // Lower jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.046, 0.14],
    aim: [0, 0.04, 0.195],
    role: "jaw",
  });
  b.rod([0, 0.046, 0.14], [0, 0.04, 0.195], [0.024, 0.008], {
    bone: jaw,
    color: FAWN,
    sides: 6,
  });

  // Nose
  b.part(new THREE.SphereGeometry(0.014, 8, 6), BLACK, {
    bone: head,
    at: [0, 0.06, 0.213],
  });
  b.part(new THREE.SphereGeometry(0.004, 4, 3), WHITE, {
    bone: head,
    at: [0.004, 0.066, 0.224],
  });

  // Eyes and ears
  const hs = b.surface(headTube);
  for (const s of [1, -1]) {
    const hit = hs.around([0, 0.07, 0.15]).at(s * 55, 25);
    if (hit) {
      b.stick(new THREE.SphereGeometry(0.0115, 8, 6), BLACK, hit, { embed: 0.3, bone: head });
      const glint = hit.moved([0.0035, 0.009, 0.0035]);
      b.stick(new THREE.SphereGeometry(0.003, 4, 3), WHITE, glint, { embed: 0, bone: head });
    }
    b.part(new THREE.SphereGeometry(0.017, 8, 6), FAWN, {
      bone: head,
      at: [s * 0.04, 0.108, 0.105],
      scale: [0.8, 1, 0.55],
    });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), PINK, {
      bone: head,
      at: [s * 0.041, 0.108, 0.113],
      scale: [0.8, 1, 0.4],
    });
  }

  // Legs
  for (const s of [1, -1]) {
    for (const [name, z, parent] of [
      ["F", 0.045, spine.joints[1]],
      ["H", -0.1, spine.joints[0]],
    ] as const) {
      const side = s > 0 ? "L" : "R";
      const leg = b.chain(
        `leg${name}${side}`,
        catmull([
          [s * 0.055, 0.05, z],
          [s * 0.058, 0.032, z + 0.004],
          [s * 0.06, 0.016, z + 0.012],
        ]),
        { parent, names: [`hip${name}${side}`, `knee${name}${side}`], role: "leg", contact: [s * 0.06, 0, z + 0.015] },
      );
      b.sweep(leg, [0.02, 0.014], { color: PINK, sides: 6 });
      b.part(new THREE.SphereGeometry(0.015, 6, 4), PINK, {
        bone: leg.joints[1],
        at: [s * 0.06, 0.009, z + 0.02],
        scale: [1, 0.65, 1.35],
      });
      for (const k of [-1, 0, 1]) {
        b.part(new THREE.SphereGeometry(0.0055, 5, 4), "#cf7f86", {
          bone: leg.joints[1],
          at: [s * 0.06 + k * 0.009, 0.007, z + 0.037 - Math.abs(k) * 0.003],
        });
      }
    }
  }

  // Spines: chestnut with cream tips
  const skin = b.surface(body);
  const hits = skin.scatter(270, {
    rng: rng(5),
    minDist: 0.016,
    filter: (h) => h.n.y > -0.12 && h.at.z < 0.05,
  });
  const spineGeo = new THREE.ConeGeometry(0.009, 0.05, 5);
  const tipGeo = new THREE.ConeGeometry(0.0058, 0.022, 5);
  hits.forEach((h, i) => {
    b.stick(spineGeo, i % 2 ? SPINE_A : SPINE_B, h, { embed: 0.2 });
    b.stick(tipGeo, CREAM, h.moved([0, 0.027, 0]), { embed: 0 });
  });

  // Little tail nub
  b.part(new THREE.SphereGeometry(0.014, 6, 4), FAWN, {
    bone: spine.joints[0],
    at: [0, 0.06, -0.19],
  });

  // Maple leaf
  const outline: [number, number, "sharp"][] = [];
  const lobes = [
    [90, 0.042],
    [90 - 62, 0.036],
    [90 - 125, 0.026],
    [90 + 125, 0.026],
    [90 + 62, 0.036],
  ];
  const order = [0, 1, 2, 3, 4];
  const pts: [number, number, "sharp"][] = [];
  for (const i of order) {
    const [a, r] = lobes[i];
    const rad = (a * Math.PI) / 180;
    // notch before each lobe
    const na = ((a + 36) * Math.PI) / 180;
    pts.push([Math.cos(na) * 0.016, Math.sin(na) * 0.016, "sharp"]);
    pts.push([Math.cos(rad) * r, Math.sin(rad) * r, "sharp"]);
  }
  // order points counter-clockwise by angle
  const sorted = pts
    .map((p) => ({ p, a: Math.atan2(p[1], p[0]) }))
    .sort((u, v) => u.a - v.a)
    .map((o) => o.p);
  outline.push(...sorted);

  const leafDir: [number, number, number] = [0, 0.35, 1];
  const leaf = b.extrude(outline, {
    at: [0.02, 0.205, -0.05],
    x: [1, 0, 0],
    y: leafDir,
    thickness: 0.003,
    color: RED,
    bone: spine.joints[0],
  });
  b.rod(leaf.local([0, -0.04, 0.003]), leaf.local([0, 0.035, 0.003]), 0.0013, {
    color: VEIN,
    bone: spine.joints[0],
    sides: 4,
  });
  for (const s of [1, -1]) {
    b.rod(leaf.local([0, 0, 0.003]), leaf.local([s * 0.03, 0.022, 0.003]), 0.001, {
      color: VEIN,
      bone: spine.joints[0],
      sides: 4,
    });
  }
  b.rod(leaf.local([0, -0.015, 0]), leaf.local([0, -0.055, 0]), 0.0013, {
    color: STEM,
    bone: spine.joints[0],
    sides: 4,
  });

  return b.root;
}
```