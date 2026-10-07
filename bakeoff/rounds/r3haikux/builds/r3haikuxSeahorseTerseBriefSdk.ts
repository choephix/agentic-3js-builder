import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "seahorse",
  description:
    "A stylised seahorse: ringed golden trunk plates, a curled prehensile tail, a fan dorsal fin, pectoral fins, a crown and cheek spines, big eyes and a jointed snout.",
};

type V = [number, number, number];

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const unit = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

const C = {
  body: "#e0823a",
  head: "#f0a052",
  tail: "#d46a2e",
  plate: "#f7c65c",
  fin: "#ffd98a",
  spike: "#b8492c",
  eye: "#fff6e0",
  pupil: "#1d1630",
  jaw: "#c86a30",
};

// Box plate with its base on the surface (y = 0 before stick() seats it).
function plate(w: number, h: number, d: number) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0);
  return g;
}

// Pentagonal spike with its base on y = 0.
function spike(r: number, h: number) {
  const g = new THREE.ConeGeometry(r, h, 5);
  g.translate(0, h / 2, 0);
  return g;
}

const SPINE: V[] = [
  [0, 0.066, 0.0],
  [0, 0.09, 0.008],
  [0, 0.114, 0.014],
  [0, 0.136, 0.018],
  [0, 0.156, 0.018],
  [0, 0.174, 0.022],
];

// Tail curls down, round under the belly and back up.
const TAIL: V[] = [
  [0, 0.064, -0.012],
  [0, 0.052, -0.03],
  [0, 0.036, -0.038],
  [0, 0.021, -0.032],
  [0, 0.0065, -0.016],
  [0, 0.0065, 0.002],
  [0, 0.016, 0.014],
  [0, 0.03, 0.014],
  [0, 0.038, 0.002],
  [0, 0.032, -0.01],
];

const HEAD_C: V = [0, 0.197, 0.04];

const HEAD_PROFILE: [number, number][] = [
  [0, -0.028],
  [0.016, -0.027],
  [0.026, -0.018],
  [0.031, -0.004],
  [0.031, 0.01],
  [0.026, 0.024],
  [0.015, 0.032],
  [0, 0.035],
];

const EYE_PROFILE: [number, number][] = [
  [0, 0],
  [0.0078, 0.0004],
  [0.0088, 0.0035],
  [0.008, 0.0068],
  [0.005, 0.0088],
  [0, 0.0096],
];

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // ---- Skeleton ----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.066, 0] });
  const spine = b.chain("spine", SPINE, { role: "spine", parent: hips });
  const neck = spine.joints[spine.joints.length - 1];
  const head = b.joint("head", { at: HEAD_C, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.167, 0.1], parent: head });
  const tail = b.chain("tail", TAIL, { role: "tail", parent: hips });

  // ---- Body --------------------------------------------------------------
  b.sweep(spine, 0.019, { color: C.body });
  b.sweep(tail, 0.0065, { color: C.tail });

  // Bony coronet rings around the trunk.
  for (const t of [0.1, 0.23, 0.36, 0.49, 0.62, 0.75, 0.88]) {
    b.ring(spine.at(t), { count: 6, radius: 0.0185 }, (p) => {
      b.stick(plate(0.008, 0.0065, 0.0065), C.plate, p);
    });
  }

  // Smaller plate rings down the curled tail.
  for (const t of [0.3, 0.55, 0.8]) {
    b.ring(tail.at(t), { count: 4, radius: 0.0065 }, (p) => {
      b.stick(plate(0.005, 0.004, 0.004), C.plate, p);
    });
  }

  // ---- Fins --------------------------------------------------------------
  // Dorsal fan standing on the back of the trunk.
  b.extrude(
    [
      [0, 0],
      [0.05, 0],
      [0.052, 0.008],
      [0.044, 0.022],
      [0.03, 0.032],
      [0.014, 0.034],
      [0, 0.018],
    ],
    {
      at: [0, 0.12, -0.004],
      x: [0, 0.995, 0.0995],
      y: [0, 0.0995, -0.995],
      color: C.fin,
    },
  );

  // Small pectoral fans, one each side at the neck.
  const pectoral: [number, number][] = [
    [0, 0],
    [0.032, 0.003],
    [0.04, 0.014],
    [0.03, 0.026],
    [0.014, 0.024],
    [0, 0.01],
  ];
  b.extrude(pectoral, {
    at: [0.012, 0.158, 0.012],
    x: [1, 0, 0],
    y: [0, 0, -1],
    color: C.fin,
  });
  b.extrude(pectoral, {
    at: [-0.012, 0.158, 0.012],
    x: [-1, 0, 0],
    y: [0, 0, -1],
    color: C.fin,
  });

  // ---- Head --------------------------------------------------------------
  const headBody = b.lathe(HEAD_PROFILE, {
    at: HEAD_C,
    axis: [0, 1, 0],
    color: C.head,
    bone: head,
  });

  // Upper snout, a tube reaching forward and a little down.
  b.sweep(
    [
      [0, 0.19, 0.06],
      [0, 0.171, 0.119],
    ],
    0.0095,
    { color: C.head, bone: head },
  );

  // Lower jaw hinged under the snout tip so the mouth can open.
  b.sweep(
    [
      [0, 0.167, 0.1],
      [0, 0.164, 0.117],
    ],
    0.0048,
    { color: C.jaw, bone: jaw },
  );

  // Big eyes: a cream dome seated on each side of the head, with a dark pupil.
  for (const s of [1, -1]) {
    const aimAt: V = [s * 0.026, 0.207, 0.052];
    const n = unit(sub(aimAt, HEAD_C));
    const eyeHit = b.surface(headBody).nearest(aimAt);
    const dome = b.lathe(EYE_PROFILE, {
      at: eyeHit,
      axis: eyeHit,
      color: C.eye,
    });
    const pupilHit = b.surface(dome).nearest(add(HEAD_C, mul(n, 0.046)));
    b.stick(new THREE.SphereGeometry(0.0042, 10, 8), C.pupil, pupilHit);
  }

  // Crown: three spikes along the back of the skull, the middle one tallest.
  const crown: [number, number][] = [
    [-0.011, 0.011],
    [0, 0.016],
    [0.011, 0.011],
  ];
  for (const [x, h] of crown) {
    const hit = b.surface(headBody).nearest([x, 0.226, 0.03]);
    b.stick(spike(0.0038, h), C.spike, hit);
  }

  // Cheek spines sweeping back from each side of the head.
  for (const s of [1, -1]) {
    const hit = b.surface(headBody).nearest([s * 0.027, 0.188, 0.018]);
    b.stick(spike(0.0042, 0.013), C.spike, hit);
  }

  return b.root;
}
