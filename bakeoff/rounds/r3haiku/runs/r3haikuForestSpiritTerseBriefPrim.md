```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "forest-spirit",
  description: "A bark-and-moss forest spirit with antler branches, a leafy crown, root legs and trailing vines.",
};

const C = {
  bark: "#5b3f2c",
  barkLight: "#8c6443",
  moss: "#4d7a37",
  mossLight: "#6f9a46",
  leaf: "#7fbf5a",
  leafDark: "#3f6b34",
  glow: "#b8ffe0",
  eye: "#0d1f18",
  root: "#46301f",
};

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });
  const R = rng(42);

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.98, 0] });
  const chest = b.joint("chest", { at: [0, 1.28, 0], parent: hips });
  const neck = b.joint("neck", { at: [0, 1.52, 0], parent: chest });
  const head = b.joint("head", { at: [0, 1.7, 0], parent: neck });

  const shoulderL = b.joint("shoulderL", { at: [0.2, 1.42, 0], parent: chest });
  const elbowL = b.joint("elbowL", { at: [0.36, 1.18, 0.04], parent: shoulderL });
  const wristL = b.joint("wristL", { at: [0.44, 0.98, 0.1], parent: elbowL });
  const shoulderR = b.joint("shoulderR", { at: [-0.2, 1.42, 0], parent: chest });
  const elbowR = b.joint("elbowR", { at: [-0.36, 1.18, 0.04], parent: shoulderR });
  const wristR = b.joint("wristR", { at: [-0.44, 0.98, 0.1], parent: elbowR });

  const hipL = b.joint("hipL", { at: [0.12, 0.95, 0], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.14, 0.5, 0.03], parent: hipL });
  const footL = b.joint("footL", { at: [0.16, 0.05, 0.08], parent: kneeL });
  const hipR = b.joint("hipR", { at: [-0.12, 0.95, 0], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.14, 0.5, 0.03], parent: hipR });
  const footR = b.joint("footR", { at: [-0.16, 0.05, 0.08], parent: kneeR });

  // ---- Torso: blocky bark body with a hip block and a chest block ---------
  b.part(new THREE.BoxGeometry(0.36, 0.2, 0.24), C.bark, { at: [0, 0.98, 0], bone: hips });
  b.part(new THREE.BoxGeometry(0.42, 0.38, 0.28), C.barkLight, { at: [0, 1.24, 0], bone: chest });
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.2, 6), C.bark, { at: [0, 1.46, 0], bone: neck });

  // Moss patches and bark knots pressed onto the torso
  const patches: [number, number, number, string][] = [
    [0.12, 1.3, 0.15, C.moss],
    [-0.1, 1.18, 0.15, C.mossLight],
    [0.05, 1.08, 0.15, C.moss],
    [-0.16, 1.36, -0.12, C.moss],
    [0.2, 1.22, 0.02, C.mossLight],
  ];
  for (const [x, y, z, col] of patches) {
    const g = new THREE.SphereGeometry(0.07, 6, 4);
    g.scale(1, 0.55, 1);
    b.part(g, col, { at: [x, y, z], bone: chest });
  }
  for (let i = 0; i < 4; i++) {
    const x = (R() - 0.5) * 0.26;
    const y = 1.08 + R() * 0.3;
    b.part(new THREE.BoxGeometry(0.035, 0.05, 0.03), C.root, { at: [x, y, 0.16], bone: chest });
  }

  // ---- Head: a carved bark block with glowing eyes ------------------------
  b.part(new THREE.BoxGeometry(0.3, 0.28, 0.27), C.barkLight, { at: [0, 1.84, 0], bone: head });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.02), C.bark, { at: [0, 1.76, 0.14], bone: head });
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.07, 0.03), C.eye, { at: [sx * 0.075, 1.87, 0.14], bone: head });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), C.glow, { at: [sx * 0.075, 1.87, 0.155], bone: head });
  }

  // Antler branches growing from the crown, mirrored left and right
  for (const sx of [1, -1]) {
    b.sweep(
      [
        [sx * 0.1, 1.97, 0],
        [sx * 0.2, 2.1, 0.0],
        [sx * 0.27, 2.28, -0.03],
        [sx * 0.31, 2.4, -0.02],
      ],
      0.022,
      { color: C.bark },
    );
    b.sweep(
      [
        [sx * 0.2, 2.1, 0.0],
        [sx * 0.3, 2.14, 0.08],
        [sx * 0.34, 2.2, 0.12],
      ],
      0.013,
      { color: C.barkLight },
    );
    b.sweep(
      [
        [sx * 0.27, 2.28, -0.03],
        [sx * 0.25, 2.34, -0.12],
      ],
      0.012,
      { color: C.barkLight },
    );
  }

  // Leafy crown: a few faceted moss blobs with leaves tucked around them
  b.part(new THREE.IcosahedronGeometry(0.17, 0), C.moss, { at: [0, 2.0, -0.02], bone: head });
  b.part(new THREE.IcosahedronGeometry(0.11, 0), C.mossLight, { at: [-0.08, 2.08, 0.04], bone: head });
  b.part(new THREE.IcosahedronGeometry(0.1, 0), C.moss, { at: [0.1, 2.06, -0.06], bone: head });

  const crownLeaves = 14;
  for (let i = 0; i < crownLeaves; i++) {
    const a = (i / crownLeaves) * Math.PI * 2;
    const r = 0.16 + R() * 0.06;
    const g = new THREE.SphereGeometry(0.05, 5, 3);
    g.scale(1, 0.35, 1.7);
    b.part(g, i % 3 === 0 ? C.leafDark : C.leaf, {
      at: [Math.cos(a) * r, 1.98 + R() * 0.08, Math.sin(a) * r * 0.8],
      bone: head,
    });
  }

  // Leaves at the antler tips
  for (const sx of [1, -1]) {
    for (const [x, y, z] of [
      [sx * 0.31, 2.44, -0.02],
      [sx * 0.34, 2.22, 0.12],
      [sx * 0.25, 2.36, -0.12],
    ] as [number, number, number][]) {
      const g = new THREE.SphereGeometry(0.045, 5, 3);
      g.scale(1, 0.4, 1.5);
      b.part(g, C.leaf, { at: [x, y, z], bone: head });
    }
  }

  // ---- Arms: thin bark limbs with knuckle-like hands ----------------------
  for (const [sh, el, wr] of [
    [shoulderL, elbowL, wristL],
    [shoulderR, elbowR, wristR],
  ]) {
    b.sweep([sh, el, wr], 0.045, { color: C.bark });
    b.part(new THREE.SphereGeometry(0.06, 7, 5), C.barkLight, { at: wr, bone: wr });
    for (let f = 0; f < 3; f++) {
      const g = new THREE.CylinderGeometry(0.012, 0.02, 0.09, 4);
      b.part(g, C.barkLight, { at: [0, -0.04 - f * 0.01, 0], bone: wr });
    }
  }

  // ---- Legs: root-like tendrils that splay into the soil ------------------
  for (const [hp, kn, ft, sx] of [
    [hipL, kneeL, footL, 1],
    [hipR, kneeR, footR, -1],
  ] as const) {
    b.sweep(
      [
        [sx * 0.12, 0.95, 0],
        [sx * 0.14, 0.5, 0.03],
        [sx * 0.16, 0.12, 0.06],
        [sx * 0.16, 0.03, 0.14],
      ],
      0.05,
      { color: C.root },
    );
    b.sweep(
      [
        [sx * 0.16, 0.05, 0.12],
        [sx * 0.2, 0.03, 0.22],
      ],
      0.035,
      { color: C.root },
    );
    b.sweep(
      [
        [sx * 0.16, 0.05, 0.12],
        [sx * 0.1, 0.03, 0.2],
      ],
      0.03,
      { color: C.root },
    );
    b.part(new THREE.SphereGeometry(0.05, 6, 4), C.root, { at: ft, bone: ft });
    void hp;
    void kn;
  }

  // ---- Trailing vines behind the spirit, with leaves along them -----------
  const vineCount = 5;
  for (let i = 0; i < vineCount; i++) {
    const spread = (i - (vineCount - 1) / 2) * 0.09;
    const jitter = () => (R() - 0.5) * 0.05;
    const pts: [number, number, number][] = [
      [spread * 0.6, 0.92, -0.12],
      [spread * 1.2 + jitter(), 0.7, -0.26],
      [spread * 1.6 + jitter(), 0.45, -0.34],
      [spread * 1.8 + jitter(), 0.22, -0.3],
      [spread * 2.0 + jitter(), 0.06, -0.24],
    ];
    b.sweep(pts, 0.018, { color: i % 2 === 0 ? C.moss : C.leafDark });
    for (let k = 1; k < pts.length; k += 2) {
      const [x, y, z] = pts[k];
      const g = new THREE.SphereGeometry(0.04, 5, 3);
      g.scale(1, 0.4, 1.6);
      b.part(g, k % 2 ? C.leaf : C.leafDark, { at: [x + 0.03, y, z], bone: hips });
    }
  }

  // ---- Floating glow motes around the body --------------------------------
  const motes: [number, number, number][] = [
    [0.38, 1.6, 0.18],
    [-0.36, 1.3, 0.12],
    [0.3, 0.7, 0.24],
    [-0.3, 0.55, 0.2],
    [0.08, 2.3, 0.12],
  ];
  for (const [x, y, z] of motes) {
    b.part(new THREE.OctahedronGeometry(0.025, 0), C.glow, { at: [x, y, z], bone: hips });
  }

  return b.root;
}
```