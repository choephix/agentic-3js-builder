```ts
import * as THREE from "three";
import { createBuilder, mix, noise, paint, rng, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Autumn hedgehog",
  description:
    "A plump hedgehog on an autumn evening walk: a dome of chestnut quills tipped in cream, a fawn face with a pointed snout, a black button nose, pink paws, and a red maple leaf skewered on its back.",
};

const QUILL_BROWNS = ["#8a4a2b", "#7a3d22", "#9b5a33"];
const QUILL_TIPS = ["#f5e6c8", "#efdcb8"];
const SKIN = "#3a2418";
const SKIN_LIGHT = "#5c3a24";
const BELLY = "#c49a6c";
const FACE = "#dbb38a";
const FACE_LIGHT = "#ecd0a8";
const EAR = "#e0a296";
const LEG = "#8d5f3e";
const PAW = "#f2a0ad";
const INK = "#0f0c0b";
const WHITE = "#ffffff";
const WHISKER = "#3b2a1f";
const MAPLE = "#c8311d";
const VEIN = "#f29a5c";

// A five-lobed maple leaf in meters: stem at the origin, lobes pointing up (+y).
const LEAF: Array<[number, number]> = [
  [0, 0.07],
  [-0.008, 0.04],
  [-0.034, 0.054],
  [-0.018, 0.026],
  [-0.04, 0.012],
  [-0.012, 0.01],
  [-0.022, -0.006],
  [-0.004, 0.006],
  [0, 0],
  [0.004, 0.006],
  [0.022, -0.006],
  [0.012, 0.01],
  [0.04, 0.012],
  [0.018, 0.026],
  [0.034, 0.054],
  [0.008, 0.04],
];
const LEAF_LOBES: Array<[number, number]> = [
  [0, 0.07],
  [-0.034, 0.054],
  [0.034, 0.054],
  [-0.04, 0.012],
  [0.04, 0.012],
  [-0.022, -0.006],
  [0.022, -0.006],
];
const LEAF_SCALE = 0.85;

const leafOutline = (k: number): Array<[number, number]> =>
  LEAF.map(([x, y]): [number, number] => [x * k, y * k]);

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const vx = bx - ax;
  const vy = by - ay;
  const t = Math.min(1, Math.max(0, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - ax - vx * t, py - ay - vy * t);
}

// Paints: colour as a function of where on the surface it lands.
const skin = paint((p, n) => mix(mix(SKIN, SKIN_LIGHT, noise(p, 0.025, 4)), BELLY, smoothstep(-0.1, -0.6, n.y)));
const face = paint((p) => mix(FACE, FACE_LIGHT, smoothstep(0.3, 0.7, noise(p, 0.03, 9))));
const maple = paint((_p, _n, s) => {
  let d = Infinity;
  for (const [x, y] of LEAF_LOBES)
    d = Math.min(d, distanceToSegment(s[0], s[1], 0, 0, x * LEAF_SCALE, y * LEAF_SCALE));
  return mix(MAPLE, VEIN, 1 - smoothstep(0.0007, 0.0013, d));
});

export default function hedgehog() {
  const b = createBuilder({ name: "hedgehog", detail: 1, paintSize: 1024 });
  const random = rng(7);
  const pick = (list: readonly string[]) => list[Math.floor(random() * list.length)];

  // Skeleton: body, head with a lower jaw, four legs ending in paws.
  const body = b.joint("body", { at: [0, 0.084, -0.02], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 0.07, 0.03], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.062, 0.06], dir: [0, -0.2, 1], role: "jaw" });

  // Plump body, rump to shoulders.
  const bodyShape = b.loft(
    [
      { at: [0, 0.08, -0.095], w: 0.05, h: 0.06 },
      { at: [0, 0.084, -0.06], w: 0.11, h: 0.095 },
      { at: [0, 0.084, -0.02], w: 0.13, h: 0.11 },
      { at: [0, 0.082, 0], w: 0.125, h: 0.1 },
    ],
    { color: skin, bone: body, sides: 10, name: "body" },
  );

  // Head tapering to a pointed snout.
  const headShape = b.loft(
    [
      { at: [0, 0.08, -0.005], w: 0.09, h: 0.085 },
      { at: [0, 0.077, 0.045], w: 0.085, h: 0.082 },
      { at: [0, 0.069, 0.085], w: 0.068, h: 0.062 },
      { at: [0, 0.061, 0.115], w: 0.036, h: 0.034 },
      { at: [0, 0.058, 0.13], w: 0.01, h: 0.01 },
    ],
    { color: face, bone: head, sides: 10, name: "head" },
  );

  // Lower jaw, tucked under the snout.
  b.loft(
    [
      { at: [0, 0.06, 0.03], w: 0.05, h: 0.03 },
      { at: [0, 0.054, 0.09], w: 0.036, h: 0.022 },
      { at: [0, 0.052, 0.12], w: 0.014, h: 0.012 },
    ],
    { color: face, bone: jaw, sides: 8, name: "jaw" },
  );

  // Short legs with pink paws and three little toes each.
  const legs = [
    { name: "FL", x: 0.05, hipZ: 0.02, footZ: 0.025 },
    { name: "FR", x: -0.05, hipZ: 0.02, footZ: 0.025 },
    { name: "BL", x: 0.055, hipZ: -0.04, footZ: -0.035 },
    { name: "BR", x: -0.055, hipZ: -0.04, footZ: -0.035 },
  ];
  for (const leg of legs) {
    const chain = b.chain(
      `leg${leg.name}`,
      [
        [leg.x, 0.05, leg.hipZ],
        [leg.x, 0.0105, leg.footZ],
      ],
      { parent: body, names: [`hip${leg.name}`, `foot${leg.name}`], role: "leg" },
    );
    b.sweep(chain, [0.0135, 0.0105], { color: LEG, sides: 8, group: `leg${leg.name}` });
    b.part(new THREE.SphereGeometry(0.0125, 12, 8), PAW, {
      at: [leg.x, 0.0062, leg.footZ + 0.003],
      scale: [0.9, 0.5, 1.15],
      bone: chain,
      name: `paw${leg.name}`,
    });
    for (const dx of [-0.0045, 0, 0.0045]) {
      b.part(new THREE.SphereGeometry(0.0034, 8, 6), PAW, {
        at: [leg.x + dx, 0.0042, leg.footZ + 0.0132],
        bone: chain,
      });
    }
  }

  const bodySurface = b.surface(bodyShape);
  const headSurface = b.surface(headShape);

  // Bright beady eyes with a catchlight, set on the side of the face.
  for (const side of [1, -1]) {
    const hit = headSurface.nearest([side * 0.033, 0.074, 0.075]);
    const eye = b.stick(new THREE.SphereGeometry(0.009, 12, 8), INK, hit, {
      embed: 0.3,
      name: side > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.SphereGeometry(0.0028, 8, 6), WHITE, {
      at: eye.moved(
        side > 0 ? { left: 0.0042, forward: 0.0042, up: 0.0042 } : { right: 0.0042, forward: 0.0042, up: 0.0042 },
      ),
    });
  }

  // Shiny black button nose with a highlight.
  const nose = b.part(new THREE.SphereGeometry(0.0115, 12, 8), INK, {
    at: [0, 0.0595, 0.1255],
    scale: [1, 0.85, 0.95],
    bone: head,
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.0022, 8, 6), WHITE, {
    at: nose.moved({ left: 0.0045, up: 0.0055, forward: 0.0075 }),
  });

  // Tiny round ears, flattened onto the side of the head behind the eyes.
  for (const side of [1, -1]) {
    const hit = headSurface.nearest([side * 0.036, 0.097, 0.06]);
    b.stick(new THREE.SphereGeometry(0.0115, 12, 8), EAR, hit, {
      embed: 0.3,
      scale: [1, 0.4, 1],
      name: side > 0 ? "earL" : "earR",
    });
  }

  // Twitchy whiskers from the snout.
  for (const side of [1, -1]) {
    for (const [dy, dz] of [
      [0, 0],
      [-0.007, 0.01],
    ]) {
      b.rod([side * 0.012, 0.066 + dy, 0.105 + dz], [side * 0.032, 0.072 + dy, 0.15 + dz], 0.0008, {
        color: WHISKER,
        bone: head,
      });
    }
  }

  // The dome of quills: each one brown with a cream tip, leaning back.
  const quills = bodySurface.scatter(260, {
    rng: random,
    minDist: 0.0095,
    filter: (hit) => hit.at.z < 0.05 && hit.n.y > -0.25,
  });
  for (const hit of quills) {
    const lean = 0.42 + 0.12 * random();
    const dir = hit.n.add(new THREE.Vector3(0, 0, -lean)).normalize();
    const length = 0.024 + 0.012 * random();
    const radius = 0.0021 + 0.0007 * random();
    b.spike(hit.moved([0, -0.003, 0]), dir, length, radius, {
      bands: [
        [0.6 + 0.12 * random(), pick(QUILL_BROWNS)],
        [1, pick(QUILL_TIPS)],
      ],
      sides: 6,
      group: "quill",
    });
  }

  // A red maple leaf skewered on a quill at the top of the back.
  const crown = bodySurface.nearest([0.03, 0.14, -0.03]);
  const stalkDir = new THREE.Vector3(0.14, 1, -0.06).normalize();
  const stalkBase = crown.moved([0, -0.003, 0]);
  const STALK = 0.036;
  b.spike(stalkBase, stalkDir, STALK, 0.0028, {
    bands: [
      [0.55, QUILL_BROWNS[0]],
      [1, QUILL_TIPS[0]],
    ],
    sides: 6,
    group: "stalk",
  });
  const tip = stalkBase.at.addScaledVector(stalkDir, STALK);
  b.extrude(leafOutline(LEAF_SCALE), {
    color: maple,
    at: tip,
    x: [0.9, 0, 0.35],
    y: [-0.2, 0.95, 0.25],
    thickness: 0.0026,
    bevel: 0.0007,
    bone: body,
    name: "maple leaf",
  });

  // Fallen leaves on the path, lying flat on the ground.
  const fallen = [
    { at: [0.095, 0.0008, 0.07], angle: 0.6, color: "#d9822b", k: 0.42 },
    { at: [-0.11, 0.0008, 0.01], angle: -0.4, color: "#e3b43f", k: 0.36 },
    { at: [0.05, 0.0008, -0.13], angle: 1.7, color: "#a8542a", k: 0.4 },
  ];
  for (const f of fallen) {
    b.extrude(leafOutline(f.k), {
      color: f.color,
      at: f.at,
      x: [Math.cos(f.angle), 0, Math.sin(f.angle)],
      y: [-Math.sin(f.angle), 0, Math.cos(f.angle)],
      thickness: 0.0016,
      bone: body,
      name: "fallen leaf",
    });
  }

  return b.root;
}
```