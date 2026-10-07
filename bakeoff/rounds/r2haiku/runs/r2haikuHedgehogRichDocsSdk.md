```ts
import * as THREE from "three";
import { catmull, createBuilder, limb, rng } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Autumn hedgehog",
  description: "A plump hedgehog on an autumn evening walk, with chestnut spines, cream tips and a red maple leaf.",
};

const BROWN = "#6b3f22";
const CREAM = "#f3e6c9";
const FAWN = "#d8ae7e";
const EAR = "#e7a09a";
const PINK = "#f0a3b4";
const BLACK = "#161313";
const WHITE = "#ffffff";
const RED = "#b5241c";

// A simple maple leaf: five-ish sharp lobes, drawn in metres.
const LEAF: OutlinePoint[] = [
  [0, -0.045],
  [0.014, -0.012],
  [0.065, -0.035, "sharp"],
  [0.04, 0.005],
  [0.085, 0.02, "sharp"],
  [0.03, 0.04],
  [0.035, 0.075, "sharp"],
  [0, 0.05],
  [-0.035, 0.075, "sharp"],
  [-0.03, 0.04],
  [-0.085, 0.02, "sharp"],
  [-0.04, 0.005],
  [-0.065, -0.035, "sharp"],
  [-0.014, -0.012],
];

function leg(b: ReturnType<typeof createBuilder>, hips: ReturnType<typeof b.joint>, sx: number, z: number, front: boolean) {
  const side = sx > 0 ? "L" : "R";
  const tag = front ? "F" : "H";
  const root: [number, number, number] = [sx * 0.075, 0.07, z];
  const target: [number, number, number] = [sx * 0.085, 0.018, z + (front ? 0.04 : -0.03)];
  const pts = limb(root, target, [0.05, 0.04], [[0, 0, front ? 1 : -1]]);
  const lg = b.chain(`leg${tag}${side}`, pts, {
    parent: hips,
    names: [`hip${tag}${side}`, `knee${tag}${side}`, `ankle${tag}${side}`],
    role: "leg",
  });
  const foot = lg.joints[lg.joints.length - 1];
  // Pink paw: a flattened ball on the foot.
  b.part(new THREE.SphereGeometry(0.024, 8, 6).scale(1.2, 0.55, 1.4), PINK, {
    bone: foot,
    at: pts[pts.length - 1],
  });
}

export default function build() {
  const b = createBuilder({ name: "hedgehog" });

  // Skeleton: hips, a short spine, and a head joint on the front of the spine.
  const hips = b.joint("hips", { at: [0, 0.13, -0.02] });
  const spine = b.chain("spine", catmull([[0, 0.13, -0.12], [0, 0.13, -0.02], [0, 0.13, 0.08]]), {
    parent: hips,
    count: 3,
    role: "spine",
  });
  const head = b.joint("head", {
    parent: spine.joints[spine.joints.length - 1],
    at: [0, 0.13, 0.1],
    aim: [0, 0.12, 0.25],
    role: "head",
  });

  // Plump body: a loft of stations, skinned to the spine.
  const body = b.loft(
    [
      { at: [0, 0.1, -0.13], w: 0.12, h: 0.12 },
      { at: [0, 0.13, -0.05], w: 0.22, h: 0.2 },
      { at: [0, 0.13, 0.02], w: 0.24, h: 0.22 },
      { at: [0, 0.12, 0.09], w: 0.2, h: 0.18 },
    ],
    { bone: spine, color: BROWN },
  );

  // Pointed, twitchy snout: a tapering tube from the head to the nose.
  const headPath = catmull([
    [0, 0.13, 0.1],
    [0, 0.125, 0.18],
    [0, 0.105, 0.25],
  ]);
  const headTube = b.sweep(headPath, (t: number) => 0.068 - 0.054 * t, { bone: head, color: FAWN });
  const hs = b.surface(headTube);

  // Dome of spines on the back and flanks, cream at the tips.
  const skin = b.surface(body);
  for (const hit of skin.scatter(280, {
    rng: rng(7),
    minDist: 0.024,
    filter: (h) => h.n.y > -0.25 && h.at.z < 0.07,
  })) {
    b.spike(hit, hit, 0.045, 0.0065, { color: (t: number) => (t > 0.55 ? CREAM : BROWN) });
  }

  // The red maple leaf stuck on the spines, lying flat above the back.
  const top = skin.nearest([0.02, 0.22, -0.05]);
  b.extrude(LEAF, {
    at: top.moved([0, 0.035, 0]),
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.006,
    bevel: 0.002,
    color: RED,
  });

  for (const s of [1, -1]) {
    // Button nose and beady eyes on the face.
    const eye = hs.nearest([s * 0.05, 0.14, 0.165]);
    b.stick(new THREE.SphereGeometry(0.014, 8, 6), BLACK, eye, { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(0.0045, 6, 4), WHITE, eye.moved([s * 0.004, 0, 0.004]), { embed: 0.2 });

    // Tiny round ears, flattened against the head.
    const ear = hs.nearest([s * 0.05, 0.2, 0.1]);
    b.stick(new THREE.SphereGeometry(0.02, 8, 6).scale(1, 0.3, 1), EAR, ear, { embed: 0.2 });

    // Four pink-pawed legs.
    leg(b, hips, s * 1, 0.06, true);
    leg(b, hips, s * 1, -0.07, false);
  }

  const nose = hs.nearest(headPath.at(1));
  b.stick(new THREE.SphereGeometry(0.013, 8, 6), BLACK, nose, { embed: 0.4 });

  return b.root;
}
```