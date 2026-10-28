import * as THREE from "three";
import { type Builder, createBuilder, frame } from "../../../../src/index";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // head
  (() => {
function buildHead(b: Builder) {
  const SKIN = "#8d8780";
  const DARK = "#6d6862";
  const PALE = "#b9b1a6";
  const IVORY = "#efe6cf";
  const INK = "#1a1512";
  const PINK = "#b88a80";

  const cx = 0, cy = 2.75, cz = 2.05;

  const add = (geo: THREE.BufferGeometry, color: string, at: number[], scale?: number[], rot?: number[]) =>
    b.part(geo, color, { at, scale, rotation: rot, flat: true });

  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // skull and forehead dome
  add(sph(1, 10, 8), SKIN, [cx, cy + 0.1, cz - 0.05], [0.62, 0.7, 0.6]);
  add(sph(1, 8, 6), DARK, [cx, cy + 0.6, cz - 0.15], [0.42, 0.25, 0.4]);
  add(sph(1, 8, 6), SKIN, [cx - 0.22, cy + 0.55, cz + 0.05], [0.25, 0.2, 0.22]);
  add(sph(1, 8, 6), SKIN, [cx + 0.22, cy + 0.55, cz + 0.05], [0.25, 0.2, 0.22]);

  // brow ridge
  add(new THREE.BoxGeometry(1.0, 0.1, 0.22), DARK, [cx, cy + 0.38, cz + 0.45]);

  for (const s of [1, -1]) {
    // cheeks
    add(sph(1, 8, 6), PALE, [s * 0.5, cy - 0.2, cz + 0.15], [0.2, 0.32, 0.32]);
    // ear mounts
    add(new THREE.CylinderGeometry(0.2, 0.26, 0.16, 8), DARK, [s * 0.62, cy + 0.2, cz - 0.3], undefined, [0, 0, 90]);
    add(sph(1, 6, 5), DARK, [s * 0.66, cy + 0.38, cz - 0.28], [0.12, 0.2, 0.2]);
    // eye
    const ex = s * 0.43, ey = cy + 0.22, ez = cz + 0.42;
    add(sph(0.07, 8, 6), INK, [ex, ey, ez]);
    add(sph(0.02, 5, 4), "#ffffff", [ex + s * 0.02, ey + 0.03, ez + 0.06]);
    // lids
    add(new THREE.BoxGeometry(0.2, 0.04, 0.12), DARK, [ex, ey + 0.09, ez - 0.01], undefined, [-15, 0, s * 8]);
    add(new THREE.BoxGeometry(0.18, 0.03, 0.1), PALE, [ex, ey - 0.09, ez - 0.02]);
    // lashes
    for (let i = 0; i < 4; i++) {
      add(new THREE.BoxGeometry(0.01, 0.07, 0.01), INK, [ex + (i - 1.5) * 0.045, ey + 0.14, ez + 0.0], undefined, [0, 0, (i - 1.5) * -12]);
    }
    // tusk root
    add(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8), IVORY, [s * 0.28, cy - 0.65, cz + 0.55], undefined, [90, 0, 0]);
    // lower jaw side
    add(sph(1, 8, 6), PALE, [s * 0.3, cy - 0.85, cz + 0.35], [0.18, 0.16, 0.3]);
  }

  // upper jaw/mouth
  add(new THREE.BoxGeometry(0.55, 0.22, 0.4), SKIN, [cx, cy - 0.55, cz + 0.45]);
  add(new THREE.BoxGeometry(0.4, 0.04, 0.3), PINK, [cx, cy - 0.7, cz + 0.5]);
  // lower jaw
  const jaw = b.joint("headJaw", { at: [cx, cy - 0.72, cz + 0.2], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.45, 0.14, 0.45), PALE, { at: [cx, cy - 0.82, cz + 0.45], bone: jaw, flat: true });
  b.part(new THREE.BoxGeometry(0.34, 0.03, 0.34), PINK, { at: [cx, cy - 0.74, cz + 0.45], bone: jaw, flat: true });
}
    return buildHead;
  })(),
  // trunk
  (() => {
function buildTrunk(b: Builder) {
  const SKIN = "#7d7a76";
  const DARK = "#5a5753";
  const PINK = "#a8857a";
  const NOSTRIL = "#1e1c1b";

  const path = [
    [0, 2.05, 2.3],
    [0, 1.7, 2.5],
    [0, 1.25, 2.68],
    [0, 0.8, 2.85],
    [0, 0.5, 3.05],
    [0, 0.36, 3.3],
  ];
  const curve = b.catmull ? b.catmull(path) : null;
  const trunk = b.chain("trunk", curve ?? path, { parent: "head", count: 8, role: "tail" });
  const rad = (t: number) => 0.26 - 0.17 * t;
  b.sweep(trunk, (t: number) => [rad(t), rad(t) * 0.92], {
    color: SKIN,
    caps: "round",
    sides: 8,
  });

  // wrinkle rings
  const n = 15;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.7) / (n + 0.5);
    const p = trunk.at(t);
    const r = rad(t);
    b.part(new THREE.TorusGeometry(r * 0.98, 0.011, 4, 10), i % 2 ? DARK : SKIN, {
      at: p.at,
      dir: p.tangent,
      axis: "z",
      bone: p.bone,
    });
  }
  // underside darker strip
  const end = trunk.at(1);
  const tipR = rad(1);
  const fwd = [end.tangent.x, end.tangent.y, end.tangent.z] as [number, number, number];
  const tipPos = end.at.clone();

  // pink tip pad
  b.part(new THREE.CylinderGeometry(tipR * 0.9, tipR * 1.05, 0.08, 8), PINK, {
    at: tipPos.clone().addScaledVector(end.tangent, 0.0),
    dir: fwd,
    bone: end.bone,
  });
  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.028, 6, 4), NOSTRIL, {
      at: [s * 0.04, tipPos.y - 0.04 * 0 + end.tangent.y * 0.1, tipPos.z + end.tangent.z * 0.1 + 0.0],
      bone: end.bone,
    });
  }
  // finger on top of tip
  b.spike(
    [0, tipPos.y + 0.06, tipPos.z + 0.04],
    [0, 0.5, 0.6],
    0.17,
    0.032,
    { color: PINK, bone: end.bone },
  );
  // lower lip
  b.part(new THREE.BoxGeometry(0.11, 0.035, 0.12), PINK, {
    at: [0, tipPos.y - 0.075, tipPos.z + 0.05],
    bone: end.bone,
  });
}
    return buildTrunk;
  })(),
  // tusks
  (() => {
function buildTusks(b: Builder) {
  const IVORY = "#efe6cc";
  const TIP = "#cdbf9a";
  const BAND = "#b79f6a";
  const SOCKET = "#6b5f55";
  const head = "head";
  for (const s of [1, -1]) {
    const pts: [number, number, number][] = [
      [s * 0.3, 1.45, 1.95],
      [s * 0.42, 1.3, 2.3],
      [s * 0.55, 1.18, 2.7],
      [s * 0.6, 1.3, 3.05],
      [s * 0.5, 1.6, 3.28],
    ];
    const path = b.catmull ? (b as any).catmull(pts) : pts;
    const tusk = b.sweep(path, [0.075, 0.012], {
      bone: head,
      color: IVORY,
      caps: { start: "flat", end: "point" },
      sides: 8,
    });
    // dark tip
    b.sweep(path, [0.075, 0.012], {
      bone: head,
      color: (t: number) => (t > 0.86 ? TIP : IVORY),
      caps: { start: "flat", end: "point" },
      sides: 8,
    });
    // root socket
    b.part(new THREE.SphereGeometry(0.13, 8, 6), SOCKET, {
      bone: head,
      at: [s * 0.3, 1.45, 1.97],
      scale: [1, 1, 0.8],
    });
    // bands
    for (const t of [0.25, 0.5, 0.72]) {
      const p = tusk.at(t, 0);
      b.part(new THREE.TorusGeometry(0.06 * (1 - t * 0.6) + 0.02, 0.012, 5, 10), BAND, {
        bone: head,
        at: tusk.curve().at(t),
        dir: tusk.curve().tangentAt(t),
        axis: "z",
      });
    }
  }
}
    return buildTusks;
  })(),
  // ears
  (() => {
function buildEars(b: Builder) {
  const OUT = "#7d7468";
  const INN = "#b98f86";
  const RIM = "#5f574d";
  const VEIN = "#8f6a64";
  const root = b.joint("earsRoot", { parent: "head", at: [0, 2.6, 1.0], dir: [0, 0, 1] });
  void root;

  // Africa-like outline (u outward from head, v up), metres
  const africa: [number, number][] = [
    [0.0, 0.45], [0.25, 0.7], [0.6, 0.78], [0.95, 0.7], [1.3, 0.62],
    [1.6, 0.45], [1.75, 0.15], [1.7, -0.15], [1.5, -0.5], [1.3, -0.85],
    [1.1, -1.2], [0.85, -1.5], [0.6, -1.3], [0.45, -0.9], [0.3, -0.5], [0.12, -0.2], [0.0, 0.0],
  ];
  const scaled = (k: number, dx = 0, dy = 0) =>
    africa.map(([x, y]) => [x * k + dx, y * k + dy] as [number, number]);

  for (const s of [1, -1]) {
    const origin: [number, number, number] = [s * 0.42, 3.25, 1.12];
    const X: [number, number, number] = [s * 0.96, 0, 0.28 * 1];
    const Xn: [number, number, number] = [s * 0.96, 0, 0.28];
    void X;
    // outer skin
    b.extrude(scaled(1), {
      at: origin, x: Xn, y: [0, 1, 0], thickness: 0.06, bevel: 0.015, color: OUT, bone: "head",
      name: `earsOuter${s}`,
    });
    // inner skin layer on the front face
    const front = new THREE.Vector3(...Xn).cross(new THREE.Vector3(0, 1, 0)).normalize();
    const lift = (d: number): [number, number, number] => [
      origin[0] + front.x * d, origin[1], origin[2] + front.z * d,
    ];
    b.extrude(scaled(0.84, 0.1, 0.02), {
      at: lift(0.04), x: Xn, y: [0, 1, 0], thickness: 0.02, color: INN, bone: "head",
      name: `earsInner${s}`,
    });
    // rim fold: thin darker slab along the top edge
    b.extrude(
      [[0.0, 0.45], [0.25, 0.7], [0.6, 0.78], [0.95, 0.7], [1.3, 0.62], [1.6, 0.45], [1.6, 0.38], [1.3, 0.55], [0.95, 0.63], [0.6, 0.7], [0.25, 0.62], [0.0, 0.4]],
      { at: lift(-0.03), x: Xn, y: [0, 1, 0], thickness: 0.05, color: RIM, bone: "head", name: `earsRim${s}` },
    );
    // veins
    const veins: [number, number, number, number][] = [
      [0.2, 0.2, 1.4, 0.3], [0.25, 0.0, 1.5, 0.0], [0.3, -0.2, 1.3, -0.4],
      [0.35, -0.4, 1.1, -0.9], [0.4, 0.4, 1.0, 0.55],
    ];
    for (const [u0, v0, u1, v1] of veins) {
      const p = (u: number, v: number): [number, number, number] => [
        origin[0] + Xn[0] * u + front.x * 0.07,
        origin[1] + v,
        origin[2] + Xn[2] * u + front.z * 0.07,
      ];
      b.rod(p(u0, v0), p(u1, v1), 0.014, VEIN, { bone: "head", name: `earsVein${s}` });
    }
  }
}
    return buildEars;
  })(),
  // legs
  (() => {
function buildLegs(b: Builder) {
  const SKIN = "#8b8581";
  const SKIN_D = "#6f6a66";
  const WRINKLE = "#5f5a56";
  const NAIL = "#d8cfbd";
  const PAD = "#4e4a47";
  const DUST = "#b9a27c";

  const legs = [
    { n: "FL", x: 0.32, z: 0.75, parent: "spine", r: 0.26 },
    { n: "FR", x: -0.32, z: 0.75, parent: "spine", r: 0.26 },
    { n: "HL", x: 0.32, z: -0.8, parent: "hips", r: 0.27 },
    { n: "HR", x: -0.32, z: -0.8, parent: "hips", r: 0.27 },
  ];

  for (const L of legs) {
    const top = 1.45;
    const kneeY = 0.55;
    const hip = b.joint(`legs_hip${L.n}`, { parent: L.parent, at: [L.x, top, L.z], dir: [0, -1, 0], role: "leg" });
    const knee = b.joint(`legs_knee${L.n}`, { parent: hip, at: [L.x, kneeY, L.z], dir: [0, -1, 0], role: "leg" });
    const foot = b.joint(`legs_foot${L.n}`, { parent: knee, at: [L.x, 0.12, L.z], dir: [0, -1, 0], role: "leg" });

    // upper pillar
    b.part(new THREE.CylinderGeometry(L.r, L.r * 0.88, top - kneeY + 0.1, 8), SKIN, {
      bone: hip, at: [L.x, (top + kneeY) / 2 + 0.03, L.z],
    });
    // knee block
    b.part(new THREE.SphereGeometry(L.r * 0.92, 8, 6), SKIN, { bone: knee, at: [L.x, kneeY, L.z + 0.02] });
    // lower pillar
    b.part(new THREE.CylinderGeometry(L.r * 0.88, L.r * 0.95, kneeY - 0.1, 8), SKIN, {
      bone: knee, at: [L.x, (kneeY + 0.1) / 2, L.z],
    });
    // foot pad
    b.part(new THREE.CylinderGeometry(L.r * 1.05, L.r * 1.15, 0.1, 10), SKIN_D, {
      bone: foot, at: [L.x, 0.06, L.z],
    });
    b.part(new THREE.CylinderGeometry(L.r * 1.1, L.r * 1.1, 0.03, 10), PAD, {
      bone: foot, at: [L.x, 0.015, L.z],
    });
    // wrinkle rings
    for (const y of [0.3, 0.42, 0.85, 1.05, 1.25]) {
      const rr = y < kneeY ? L.r * 0.93 : L.r * (0.88 + 0.12 * ((y - kneeY) / 0.9));
      b.part(new THREE.TorusGeometry(rr, 0.012, 4, 10), WRINKLE, {
        bone: y < kneeY ? knee : hip, at: [L.x, y, L.z], rotation: [90, 0, 0],
      });
    }
    // toenails
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.4;
      const nx = L.x + Math.sin(a) * L.r * 1.05;
      const nz = L.z + Math.cos(a) * L.r * 1.12;
      b.part(new THREE.BoxGeometry(0.07, 0.07, 0.04), NAIL, {
        bone: foot, at: [nx, 0.07, nz], rotation: [0, a * 57.3, 0],
      });
    }
    // dust
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6 + L.x;
      b.part(new THREE.DodecahedronGeometry(0.045 + 0.01 * (i % 2), 0), DUST, {
        bone: foot, at: [L.x + Math.cos(a) * L.r * 1.25, 0.03, L.z + Math.sin(a) * L.r * 1.25],
      });
    }
  }
}
    return buildLegs;
  })(),
  // tail
  (() => {
function buildTail(b: Builder) {
  const SKIN = "#7d756d";
  const SKIN_D = "#5f5852";
  const HAIR = "#2a2420";
  const WR = "#6a625b";

  // Tail path: from the rump down the back of the legs, inside the box.
  const pts: [number, number, number][] = [
    [0, 2.45, -1.7],
    [0, 2.2, -1.95],
    [0, 1.8, -2.1],
    [0, 1.4, -2.2],
    [0, 1.05, -2.25],
  ];
  const tail = b.chain("tail", pts, {
    parent: "hips",
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });
  b.sweep(tail, [0.07, 0.03], { color: SKIN, sides: 6, caps: "round" });

  // Tuft at the tip: a hair stem and fanned blades.
  const tip = tail.at(1);
  const base = tip.at.clone();
  b.rod(base, [base.x, base.y - 0.12, base.z - 0.02], [0.035, 0.03], HAIR, { bone: tail.joints[tail.joints.length - 1] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 6 - 0.5) * 1.6;
    const end: [number, number, number] = [
      base.x + Math.sin(a) * 0.1,
      base.y - 0.32 - Math.abs(a) * -0.02,
      base.z - 0.04 - Math.cos(a) * 0.02,
    ];
    b.spike([base.x, base.y - 0.08, base.z], end, null, 0.028, {
      color: i % 2 ? HAIR : "#3b332d",
      bone: tail.joints[tail.joints.length - 1],
    });
  }

  // Rump wrinkles: flattened ridges across the rear, on the hips bone.
  for (let i = 0; i < 5; i++) {
    const y = 2.75 - i * 0.2;
    const w = 0.34 - Math.abs(i - 1.5) * 0.03;
    b.part(new THREE.BoxGeometry(w * 2, 0.025, 0.05), i % 2 ? WR : SKIN_D, {
      bone: "hips",
      at: [0, y, -1.78 - 0.02 * (i % 2)],
    });
  }
  // Base ring where tail meets rump.
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 6), SKIN_D, {
    bone: "hips",
    at: [0, 2.45, -1.72],
    dir: [0, -0.3, -1],
  });

  // Back bristles: short hair spikes along the spine toward the rump.
  for (let i = 0; i < 9; i++) {
    const z = -1.65 - (i % 3) * 0.0;
    const x = (i - 4) * 0.05;
    b.spike([x, 2.95, -1.7 + (i % 3) * 0.02], [0, 1, -0.3], 0.1, 0.012, { color: HAIR, bone: "hips" });
  }
}
    return buildTail;
  })(),
];

// Elephant: ~3.2 m shoulder height, body length ~3.6 m, faces +Z.
export const BASE_PARTS = [
  {
    id: "head",
    builds: "skull cap details, brow, cheeks, eyes with lids and lashes, jaw/mouth, forehead dome and ear mounts",
    box: [
      [-0.75, 1.7, 1.5],
      [0.75, 3.7, 2.6],
    ],
    attaches: "the head joint at the front of the neck and the front face of the body",
    joints: ["neck", "head"],
    floor: false,
    budget: 180,
  },
  {
    id: "trunk",
    builds: "segmented trunk chain with joints, wrinkle rings, nostril tip and finger, and a lower lip",
    box: [
      [-0.3, 0, 2.2],
      [0.3, 2.6, 3.6],
    ],
    attaches: "the front-bottom of the head joint, below the forehead",
    joints: ["head"],
    floor: false,
    budget: 180,
  },
  {
    id: "tusks",
    builds: "two curved ivory tusks with bands, tips and root sockets",
    box: [
      [-0.8, 1.0, 1.9],
      [0.8, 2.4, 3.3],
    ],
    attaches: "the sides of the upper jaw on the head, either side of the trunk root",
    joints: ["head"],
    floor: false,
    budget: 70,
  },
  {
    id: "ears",
    builds: "two large Africa-map shaped ears with thickness, inner skin colour, veins and rim folds",
    box: [
      [-2.0, 1.8, 0.7],
      [2.0, 3.9, 1.8],
    ],
    attaches: "the sides of the head joint behind the eyes",
    joints: ["head"],
    floor: false,
    budget: 120,
  },
  {
    id: "legs",
    builds: "four pillar legs with knees, toenails, foot pads, wrinkle rings and dust at the feet",
    box: [
      [-1.0, 0, -1.7],
      [1.0, 1.6, 1.6],
    ],
    attaches: "the underside of the torso at the shoulder and hip sockets",
    joints: ["spine", "hips"],
    floor: true,
    budget: 240,
  },
  {
    id: "tail",
    builds: "tail chain with joints, hair tuft at the tip, plus rump wrinkles and back bristles",
    box: [
      [-0.3, 0.8, -2.6],
      [0.3, 3.0, -1.6],
    ],
    attaches: "the rump at the rear of the torso, the hips joint",
    joints: ["hips"],
    floor: false,
    budget: 100,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const SKIN = "#8b8279";
  const SKIN_D = "#756d65";

  const hips = b.joint("hips", { at: [0, 2.2, -0.9], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 2.3, 0.4], aim: [0, 2.5, 1.2], role: "spine" });
  const neck = b.joint("neck", { parent: spine, at: [0, 2.5, 1.2], aim: [0, 2.7, 1.8], role: "neck" });
  b.joint("head", { parent: neck, at: [0, 2.7, 1.8], aim: [0, 2.7, 2.4], role: "head" });

  // Torso barrel
  b.loft(
    [
      { at: [0, 2.15, -1.7], w: 0.9, h: 1.2 },
      { at: [0, 2.2, -0.9], w: 1.55, h: 1.7 },
      { at: [0, 2.25, 0.1], w: 1.7, h: 1.85 },
      { at: [0, 2.35, 1.0], w: 1.6, h: 1.9 },
      { at: [0, 2.5, 1.6], w: 1.2, h: 1.6 },
    ],
    { bone: [hips, spine, neck], color: SKIN, sides: 10 },
  );
  // Shoulder hump / back ridge
  b.part(new THREE.SphereGeometry(0.7, 8, 6), SKIN_D, { bone: spine, at: [0, 3.0, 0.7], scale: [1.1, 0.5, 1.3] });
  // Belly shade
  b.part(new THREE.BoxGeometry(1.2, 0.2, 2.4), SKIN_D, { bone: spine, at: [0, 1.35, -0.1] });
  // Head mass
  b.part(new THREE.SphereGeometry(0.62, 9, 7), SKIN, { bone: "head", at: [0, 2.75, 2.0], scale: [0.95, 1.15, 1.0] });
  // Forehead dome
  b.part(new THREE.SphereGeometry(0.45, 8, 6), SKIN, { bone: "head", at: [0, 3.15, 1.95], scale: [1, 0.8, 0.9] });
  // Neck bridge
  b.capsule([0, 2.5, 1.3], [0, 2.7, 1.9], 0.55, { bone: neck, color: SKIN });

    for (const add of PARTS) add(b);
  return b.root;
}
