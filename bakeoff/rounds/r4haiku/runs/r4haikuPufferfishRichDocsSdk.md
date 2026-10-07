```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, paint, rng, spots } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

// A fully puffed pufferfish, about 30 cm across. Its underside rests on y = 0.
const RX = 0.15; // half width, side to side and front to back
const RY = 0.14; // half height
const CENTRE: [number, number, number] = [0, RY, 0];

// Flat colours
const BELLY = "#fbf6e6";
const CREAM = "#f3d98a";
const BROWN = "#7b4a22";
const SPIKE = "#f7eed0";
const SPIKE_TIP = "#9b6b35";
const EYE = "#fffdf5";
const PUPIL = "#1d1915";
const GLINT = "#ffffff";
const LIP = "#e9896a";
const BROW = "#5b3a1f";
const FIN = "#f6bc62";
const FIN_RAY = "#de8a40";
const BUBBLE = "#d7f2ff";

// Paints: leopard rosettes on the back, fading to a white belly
const SPOTTED = spots(CREAM, BROWN, { size: 0.065, amount: 0.4, rosette: true, seed: 5 });
const BODY = countershade(SPOTTED, BELLY, { level: -0.15, soft: 0.2 });
const SPIKES = paint((_p, _n, s) => (s[0] > 0.55 ? SPIKE_TIP : SPIKE));
const FINS = paint((_p, _n, s) =>
  Math.sin(Math.atan2(s[1], s[0] + 0.02) * 15) > 0.5 ? FIN_RAY : FIN,
);

// Stubby fan tail, drawn in (back, up) metres from its base
const FAN_OUTLINE: OutlinePoint[] = [
  [0, 0.012, "sharp"],
  [0.03, 0.045],
  [0.06, 0.068],
  [0.078, 0.072],
  [0.09, 0.04],
  [0.092, 0.0],
  [0.09, -0.04],
  [0.078, -0.072],
  [0.06, -0.068],
  [0.03, -0.045],
  [0, -0.012, "sharp"],
];

// Small paddle fin, drawn in (back, up) metres from its base
const FIN_OUTLINE: OutlinePoint[] = [
  [0, 0.02, "sharp"],
  [0.025, 0.06],
  [0.055, 0.078],
  [0.082, 0.05],
  [0.088, 0.0],
  [0.06, -0.03],
  [0.02, -0.02, "sharp"],
];

// Ball profile: a half-section from the bottom pole, round the arc, to the top pole
const BALL: OutlinePoint[] = [[0, -RY]];
for (const deg of [-80, -60, -40, -20, 0, 20, 40, 60, 80]) {
  const a = (deg * Math.PI) / 180;
  BALL.push([RX * Math.cos(a), RY * Math.sin(a)]);
}
BALL.push([0, RY]);

// Unit direction for an azimuth (0 = +Z, 90 = +X) and elevation, in degrees
const dirOf = (azDeg: number, elDeg: number) => {
  const a = (azDeg * Math.PI) / 180;
  const e = (elDeg * Math.PI) / 180;
  return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
};

export default function build() {
  const b = createBuilder({ name: "startled-pufferfish" });

  // Skeleton: body root, head with a two-part pouting mouth, a short tail, two side fins
  const hips = b.joint("hips", { at: CENTRE, role: "spine" });
  const head = b.joint("head", { parent: hips, at: [0, 0.125, 0.14], role: "head" });
  b.joint("jawU", { parent: head, at: [0, 0.1365, 0.14], role: "jaw" });
  const jawL = b.joint("jawL", { parent: head, at: [0, 0.1135, 0.14], role: "jaw" });
  const jawU = b.joint("jawU", { parent: head, at: [0, 0.1365, 0.14], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.15, -0.1], [0, 0.147, -0.14], [0, 0.142, -0.185]]), {
    parent: hips,
    names: ["tail1", "tail2", "tailTip"],
    role: "tail",
  });

  // Puffed body: a turned ball, one part on the root bone
  const body = b.lathe(BALL, { at: CENTRE, bone: hips, segments: 14, color: BODY });
  const skin = b.surface(body);
  const hitAt = (az: number, el: number) => {
    const h = skin.around(CENTRE).at(az, el);
    if (!h) throw new Error(`no skin at azimuth ${az}, elevation ${el}`);
    return h;
  };

  // Peduncle and stubby fan tail
  b.sweep(tail, [0.042, 0.018], { color: BODY });
  b.extrude(FAN_OUTLINE, {
    at: [0, 0.142, -0.185],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.01,
    bevel: 0.003,
    smoothing: 1,
    color: FINS,
    bone: tail,
  });

  // Small fluttering side fins, each lifted outward on its own hinge
  for (const s of [1, -1]) {
    const at: [number, number, number] = [s * 0.145, 0.12, 0.03];
    const fin = b.joint(s > 0 ? "finL" : "finR", { parent: hips, at, role: "hinge" });
    b.extrude(FIN_OUTLINE, {
      at,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      color: FINS,
      bone: fin,
    });
    b.pose(fin, { axis: [0, 0, 1], deg: s > 0 ? -22 : 34 });
  }

  // Big round worried eyes: white sclera, dark pupil looking up, a glint
  const EYE_R = 0.055;
  for (const s of [1, -1]) {
    const e = hitAt(s * 40, 14);
    const eye = new THREE.Vector3().copy(e.at).addScaledVector(e.n, EYE_R * 0.35);
    b.part(new THREE.SphereGeometry(EYE_R, 14, 10), EYE, { at: eye, bone: hips });

    const look = e.n.clone().add(new THREE.Vector3(0, 0.35, 0)).normalize();
    const pupil = eye.clone().addScaledVector(look, EYE_R * 0.7);
    b.part(new THREE.SphereGeometry(0.024, 10, 8), PUPIL, { at: pupil, bone: hips });

    const glint = pupil.clone().addScaledVector(look, 0.018).add(new THREE.Vector3(0, 0.006, 0));
    b.part(new THREE.SphereGeometry(0.007, 6, 5), GLINT, { at: glint, bone: hips });
  }

  // Worried brows: each rises toward the middle of the face
  for (const s of [1, -1]) {
    const pts = [
      hitAt(s * 58, 22).moved([0, 0.004, 0]).at,
      hitAt(s * 48, 32).moved([0, 0.004, 0]).at,
      hitAt(s * 38, 41).moved([0, 0.004, 0]).at,
    ];
    b.sweep(catmull(pts), 0.0055, { color: BROW, bone: hips });
  }

  // Tiny pouting mouth: a small upper lip and a fuller lower lip on their own jaw joints
  b.part(new THREE.SphereGeometry(0.018, 10, 7), LIP, {
    at: [0, 0.1365, 0.158],
    bone: jawU,
    scale: [1.25, 0.6, 0.85],
  });
  b.part(new THREE.SphereGeometry(0.02, 10, 7), LIP, {
    at: [0, 0.1135, 0.163],
    bone: jawL,
    scale: [1.1, 0.7, 0.95],
  });

  // A few bubbles rising from the mouth, each a little larger than the last
  const bubbles: [number, number, number, number][] = [
    [0.004, 0.172, 0.19, 0.009],
    [0.012, 0.215, 0.21, 0.0135],
    [0.021, 0.27, 0.23, 0.019],
    [0.031, 0.335, 0.25, 0.024],
  ];
  for (const [x, y, z, r] of bubbles) {
    b.part(new THREE.SphereGeometry(r, 10, 7), BUBBLE, { at: [x, y, z], bone: head });
    b.part(new THREE.SphereGeometry(r * 0.26, 6, 4), GLINT, {
      at: [x - 0.4 * r, y + 0.5 * r, z + 0.6 * r],
      bone: head,
    });
  }

  // Short spikes all over, kept off the eyes, mouth, fins, tail root and underside
  const rand = rng(11);
  const exclude: [THREE.Vector3, number][] = [
    [dirOf(40, 14), 0.88],
    [dirOf(-40, 14), 0.88],
    [dirOf(0, -6), 0.93],
    [dirOf(88, -4), 0.9],
    [dirOf(-88, -4), 0.9],
    [dirOf(180, 0), 0.8],
  ];
  const spikeHits = skin.scatter(170, {
    rng: rng(7),
    minDist: 0.032,
    filter: (h) => h.n.y > -0.55 && exclude.every(([d, c]) => h.n.dot(d) < c),
  });
  for (const h of spikeHits) {
    b.spike(h, h, 0.024 + 0.016 * rand(), 0.0065, { color: SPIKES, sides: 6 });
  }

  return b.root;
}

export const meta = {
  name: "Startled pufferfish",
  description:
    "A fully puffed pufferfish: creamy yellow back with brown leopard rosettes, white belly, short spikes, worried eyes, a pouting mouth, fluttering side fins, a fan tail and a few bubbles.",
};
```