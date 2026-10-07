```ts
import * as THREE from "three";
import { catmull, createBuilder, mottle, stripes } from "agentic-3js-builder";

export const meta = {
  name: "snail",
  description: "A stylised garden snail: soft mottled foot, banded spiral-domed shell, two eyestalks, feelers and a jaw.",
};

type Pt = { local: (w: any) => THREE.Vector3 };

// Offset from a frame by words, mirrored by side (s > 0 is the creature's left, +X).
const pt = (f: Pt, s: number, up: number, forward: number, lat: number) =>
  f.local(s > 0 ? { up, forward, left: lat } : { up, forward, right: lat });

const SKIN = "#c2ab84";
const SKIN_DARK = "#8c7455";
const EYE = "#1d1916";
const WHITE = "#f4efe4";
const SHELL = "#8a5a36";
const SHELL_BAND = "#e2b96b";
const APERTURE = "#2b1c12";
const LIP = "#d88f7a";

// Half cross-section of the shell: x = distance from the axis, y = height.
const SHELL_PROFILE: [number, number][] = [
  [0, -0.03],
  [0.05, -0.03],
  [0.06, -0.01],
  [0.07, 0.02],
  [0.075, 0.05],
  [0.07, 0.07],
  [0.078, 0.085],
  [0.07, 0.1],
  [0.055, 0.115],
  [0.035, 0.13],
  [0.015, 0.14],
  [0, 0.145],
];

export default function build() {
  const b = createBuilder({ name: "snail" });

  // Skeleton: a root over the foot, then a body chain from tail to head.
  const root = b.joint("root", { at: [0, 0.05, 0], role: "spine" });
  const bodyPath = catmull([
    [0, 0.02, -0.3],
    [0, 0.04, -0.15],
    [0, 0.05, 0],
    [0, 0.05, 0.14],
    [0, 0.055, 0.27],
  ]);
  const body = b.chain("body", bodyPath, {
    parent: root,
    names: ["tail", "midBody", "neck", "head"],
    role: "spine",
  });

  // Soft foot: a tube tapering to a point at the tail, rounded at the head.
  const bodySweep = b.sweep(body, [0.02, 0.045, 0.05, 0.05, 0.05], {
    color: mottle(SKIN, SKIN_DARK, { size: 0.09, seed: 3 }),
  });

  // Jaw under the head, with a pink lip.
  const head = body.joints[3];
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.03, up: -0.02 }) });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), LIP, { bone: jaw });

  // Eyestalks: two curved tubes rising from the top of the head, each with a black eye.
  for (const s of [1, -1]) {
    const root2 = bodySweep.at(0.86, s > 0 ? -35 : 35);
    const stalk = b.sprout(
      s > 0 ? "eyeStalkL" : "eyeStalkR",
      root2,
      catmull([pt(root2, s, 0.04, 0, 0), pt(root2, s, 0.09, 0.02, 0.012), pt(root2, s, 0.12, 0.06, 0.02)]),
      [0.011, 0.007],
      { count: 2, role: "tentacle", color: SKIN },
    );
    const tip = stalk.sweep.at(1);
    b.part(new THREE.SphereGeometry(0.024, 8, 6), EYE, { frame: tip });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), WHITE, { at: pt(tip, s, 0.016, 0.014, 0.006) });
  }

  // Short lower feelers at the front of the head.
  for (const s of [1, -1]) {
    const on = bodySweep.at(0.96, s > 0 ? -60 : 60);
    b.sprout(s > 0 ? "feelerL" : "feelerR", on, pt(on, s, 0.04, 0.09, 0.02), [0.009, 0.004], {
      count: 0,
      role: "tentacle",
      color: SKIN,
    });
  }

  // Shell: a banded, bulged dome sitting on the back, with a dark aperture facing forward.
  const shellAt = body.at(0.36).at.clone().add(new THREE.Vector3(0, 0.02, 0));
  b.lathe(SHELL_PROFILE, {
    at: shellAt,
    smoothing: 1,
    color: stripes(SHELL, SHELL_BAND, { size: 0.05, axis: "y", seed: 2 }),
  });
  b.part(new THREE.CircleGeometry(0.03, 16), APERTURE, {
    at: [shellAt.x, shellAt.y + 0.03, shellAt.z + 0.077],
    dir: [0, 0, 1],
    axis: "z",
  });

  return b.root;
}
```