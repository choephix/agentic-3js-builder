import * as THREE from "three";
import { type Builder, createBuilder, frame, catmull } from "../../../../src/index";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // head
  (() => {
function buildHead(b: Builder) {
  const RUST = "#c4511f", DEEP = "#7a2a14", CREAM = "#fff1d6", DARK = "#2a1418";
  const AMBER = "#ffb23a", AMBER2 = "#ff7e1e", WHITE = "#ffffff", PINK = "#e8909a";
  const C: [number, number, number] = [0, 0.72, 0.2];
  const sph = (r: number, c: string, at: number[], scale: number[], bone = "head", rot?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), c, { bone, at: at as any, scale: scale as any, rotation: rot as any });
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0], bone = "head") =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: at as any, rotation: rot as any });
  const cone = (r: number, h: number, c: string, at: number[], rot: number[], bone = "head") =>
    b.part(new THREE.ConeGeometry(r, h, 6), c, { bone, at: at as any, rotation: rot as any });

  for (const s of [1, -1]) {
    // ears
    sph(0.07, CREAM, [s * 0.11, 0.85, 0.15], [1, 1, 0.55], "head", [-15, 0, s * 15]);
    sph(0.05, DARK, [s * 0.11, 0.848, 0.17], [1, 1, 0.4], "head", [-15, 0, s * 15]);
    sph(0.03, DEEP, [s * 0.11, 0.84, 0.182], [1, 1, 0.3], "head");
    // eyes
    sph(0.04, DARK, [s * 0.07, 0.75, 0.33], [0.9, 1.15, 0.5]);
    sph(0.032, AMBER, [s * 0.07, 0.748, 0.345], [0.85, 1.1, 0.4]);
    sph(0.02, AMBER2, [s * 0.07, 0.738, 0.352], [0.9, 0.8, 0.3]);
    sph(0.012, DARK, [s * 0.07, 0.75, 0.358], [0.7, 1.2, 0.3]);
    sph(0.01, WHITE, [s * 0.078, 0.762, 0.362], [1, 1, 0.5]);
    sph(0.005, WHITE, [s * 0.062, 0.735, 0.362], [1, 1, 0.5]);
    // brows
    box(0.05, 0.01, 0.012, CREAM, [s * 0.075, 0.795, 0.335], [0, 0, s * -12]);
    // tear stripes
    box(0.012, 0.05, 0.012, RUST, [s * 0.09, 0.69, 0.34], [0, 0, s * -12]);
    // cheek ruffs
    sph(0.055, CREAM, [s * 0.14, 0.67, 0.22], [0.8, 0.9, 1.2]);
    for (let i = 0; i < 3; i++)
      cone(0.016, 0.05, RUST, [s * (0.16 - i * 0.004), 0.7 - i * 0.03, 0.2 + i * 0.03], [0, 0, s * -(80 + i * 12)]);
    // whiskers
    for (let i = 0; i < 2; i++)
      b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.09, 4), WHITE, {
        bone: "head", at: [s * 0.12, 0.675 - i * 0.015, 0.37] as any, rotation: [0, 0, s * (-80 - i * 12)] as any,
      });
    // forehead stripes
    box(0.012, 0.04, 0.01, CREAM, [s * 0.03, 0.835, 0.3], [-30, 0, s * 10]);
  }
  // forehead patch
  box(0.03, 0.05, 0.01, RUST, [0, 0.83, 0.3], [-35, 0, 0]);
  // muzzle
  sph(0.06, CREAM, [0, 0.665, 0.33], [1.05, 0.8, 0.8]);
  sph(0.022, DARK, [0, 0.69, 0.372], [1.2, 0.8, 0.8]);
  sph(0.006, WHITE, [0.007, 0.695, 0.386], [1, 1, 1]);
  box(0.006, 0.025, 0.006, DARK, [0, 0.66, 0.375]);
  // lower jaw
  sph(0.045, CREAM, [0, 0.62, 0.31], [1.1, 0.5, 1], "jaw");
  sph(0.025, PINK, [0, 0.635, 0.325], [1.2, 0.3, 1], "jaw");
  for (const s of [1, -1]) box(0.03, 0.005, 0.006, DARK, [s * 0.017, 0.645, 0.37], [0, 0, s * 15]);
}
    return buildHead;
  })(),
  // tail
  (() => {
function buildTail(b: Builder) {
  const RUST = "#b5481f";
  const CREAM = "#e9a867";
  const DARK = "#3a1c12";
  const pts: number[][] = [
    [0, 0.7, -0.12],
    [0.06, 0.66, -0.3],
    [-0.07, 0.6, -0.48],
    [0.07, 0.62, -0.64],
    [-0.03, 0.72, -0.76],
    [0, 0.82, -0.82],
  ];
  const path = catmull(pts);
  const chain = b.chain("tail", path, {
    parent: "tailBase",
    count: 6,
    role: "tail",
    names: (i: number) => `tail${i + 1}`,
  });
  const radius = (t: number) => {
    const r = 0.075 + 0.1 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.85) * (1 - 0.35 * t);
    return [r * 1.05, r] as [number, number];
  };
  const bands: [number, string][] = [];
  const n = 7;
  for (let i = 0; i < n; i++) bands.push([(i + 1) / (n + 1), i % 2 ? CREAM : RUST]);
  bands.push([0.93, RUST]);
  bands.push([1, DARK]);
  const tube = b.sweep(chain, radius, { bands, color: RUST, sides: 8 });
  for (const t of [0.25, 0.45, 0.65, 0.82]) {
    b.ring(tube.at(t, 0), { count: 5, radius: 0.0 }, () => {});
    for (const ang of [-70, 0, 70, 140, 220]) {
      const p = tube.at(t, ang);
      b.stick(new THREE.ConeGeometry(0.025, 0.07, 5), t > 0.8 ? DARK : CREAM, p, { embed: 0.3 });
    }
  }
}
    return buildTail;
  })(),
  // arms
  (() => {
function buildArms(b: Builder) {
  const FUR = "#d9622b";
  const FUR_DARK = "#a8431c";
  const CUFF = "#f6ead2";
  const PAW = "#3a2418";
  const CLAW = "#1c1210";
  const PAD = "#5a3a2a";

  const jointOf = (n: string): any => {
    try {
      return (b as any).joints?.get?.(n) ?? (b as any).joint?.(n) ?? n;
    } catch {
      return n;
    }
  };

  for (const s of [1, -1]) {
    const name = s > 0 ? "shoulderL" : "shoulderR";
    const bone: any = s > 0 ? "shoulderL" : "shoulderR";
    void jointOf;
    const sh: [number, number, number] = [s * 0.17, 0.62, 0.08];
    const elbow: [number, number, number] = [s * 0.33, 0.62, 0.1];
    const wrist: [number, number, number] = [s * 0.43, 0.6, 0.1];

    // upper arm and forearm
    b.capsule(sh, elbow, 0.055, FUR, { bone });
    b.capsule(elbow, wrist, 0.048, FUR_DARK, { bone });
    // shoulder fur ball
    b.part(new THREE.SphereGeometry(0.07, 8, 6), FUR, { at: sh, bone });
    // elbow joint
    b.part(new THREE.SphereGeometry(0.05, 7, 5), FUR_DARK, { at: elbow, bone });

    // fur cuff rings near wrist
    for (let i = 0; i < 2; i++) {
      const p: [number, number, number] = [s * (0.385 + i * 0.03), 0.605, 0.1];
      b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.022, 8), CUFF, {
        at: p,
        dir: [s, 0, 0],
        bone,
      });
    }

    // paw
    const paw: [number, number, number] = [s * 0.455, 0.6, 0.1];
    b.part(new THREE.SphereGeometry(0.058, 8, 6), PAW, {
      at: paw,
      scale: [1.1, 0.85, 1],
      bone,
    });
    b.part(new THREE.SphereGeometry(0.026, 6, 4), PAD, {
      at: [paw[0], paw[1] - 0.04, paw[2]],
      scale: [1.2, 0.5, 1.2],
      bone,
    });

    // toes + claws
    for (let i = 0; i < 4; i++) {
      const dz = -0.036 + i * 0.024;
      const base: [number, number, number] = [s * 0.49, 0.6, 0.1 + dz];
      b.part(new THREE.SphereGeometry(0.019, 6, 4), PAW, { at: base, bone });
      b.spike(base, [s, -0.1, dz * 3], 0.04, 0.009, { color: CLAW, bone });
    }
  }
}
    return buildArms;
  })(),
  // legs
  (() => {
function buildLegs(b: Builder) {
  const FUR = "#d9622b";
  const FUR_LIGHT = "#f08a45";
  const SOCK = "#2a1a1a";
  const SOCK_HI = "#473030";
  const PAD = "#1a1010";
  const CREAM = "#f6e3c0";
  const CLAW = "#efe6d2";

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipName = s > 0 ? "hipL" : "hipR";
    const hip = [s * 0.14, 0.5, -0.08] as [number, number, number];
    const knee = [s * 0.2, 0.38, 0.02] as [number, number, number];
    const ankle = [s * 0.17, 0.27, -0.1] as [number, number, number];
    const toeBase = [s * 0.17, 0.235, 0.06] as [number, number, number];

    const legsKnee = b.joint(`legsKnee${side}`, { parent: hipName, at: knee, aim: ankle });
    const legsAnkle = b.joint(`legsAnkle${side}`, { parent: legsKnee, at: ankle, aim: toeBase });
    const legsFoot = b.joint(`legsFoot${side}`, { parent: legsAnkle, at: toeBase, dir: [0, 0, 1] });

    // thigh
    b.capsule(hip, knee, [0.085, 0.065], { color: FUR, bone: hipName });
    // thigh fur tufts
    for (let i = 0; i < 3; i++) {
      const t = 0.25 + i * 0.25;
      const p: [number, number, number] = [
        hip[0] + (knee[0] - hip[0]) * t + s * 0.05,
        hip[1] + (knee[1] - hip[1]) * t,
        hip[2] + (knee[2] - hip[2]) * t - 0.02,
      ];
      b.spike(p, [s * 0.5, -0.5, -0.6], 0.08, 0.03, { color: i % 2 ? FUR_LIGHT : FUR, bone: hipName });
    }
    // shin stocking
    b.capsule(knee, ankle, [0.058, 0.045], { color: SOCK, bone: legsKnee });
    b.part(new THREE.SphereGeometry(0.06, 8, 6), SOCK_HI, { at: knee, bone: legsKnee });
    // foot
    b.capsule(ankle, toeBase, [0.048, 0.044], { color: SOCK, bone: legsAnkle });
    b.part(new THREE.BoxGeometry(0.1, 0.045, 0.11), SOCK, { at: [s * 0.17, 0.245, 0.065], bone: legsFoot });
    b.part(new THREE.BoxGeometry(0.08, 0.012, 0.09), PAD, { at: [s * 0.17, 0.222, 0.07], bone: legsFoot });
    // toes
    for (let k = -1; k <= 1; k++) {
      const tx = s * 0.17 + k * 0.032;
      b.part(new THREE.SphereGeometry(0.02, 6, 4), SOCK, { at: [tx, 0.236, 0.125], bone: legsFoot });
      b.spike([tx, 0.234, 0.138], [0, -0.2, 1], 0.03, 0.008, { color: CLAW, bone: legsFoot });
    }
    // heel cream marking
    b.part(new THREE.SphereGeometry(0.02, 6, 4), CREAM, { at: [s * 0.17, 0.3, -0.12], bone: legsAnkle });
  }
}
    return buildLegs;
  })(),
  // stoneDetail
  (() => {
function buildStoneDetail(b: Builder) {
  const MOSS = ["#5f8f3a", "#76a845", "#4a7a30"];
  const PEB = ["#8a8a86", "#a09d94", "#6f706c"];
  const topY = 0.3;
  const R = 0.38;
  const P = (n: number) => n;

  // pebbles at foot, resting on floor
  const pebs: [number, number, number][] = [
    [0.44, 0.03, 0.12], [0.4, -0.2, 0.025], [-0.42, 0.15, 0.03], [-0.36, -0.28, 0.02],
    [0.1, 0.45, 0.025], [-0.2, 0.43, 0.03], [0.28, 0.36, 0.018], [-0.46, -0.05, 0.02],
    [0.05, -0.46, 0.03], [0.3, -0.38, 0.02],
  ];
  pebs.forEach(([x, z, r], i) => {
    b.part(new THREE.DodecahedronGeometry(r, 0), PEB[i % 3], {
      at: [x, r * 0.8, z], scale: [1, 0.7, 1], rotation: [i * 20, i * 40, 0], flat: true,
    });
  });

  // moss patches on top faces
  const patches: [number, number, number, number][] = [
    [-0.2, 0.15, 0.14, 0], [0.22, -0.1, 0.12, 1], [0.05, 0.28, 0.1, 2],
    [-0.25, -0.2, 0.11, 1], [0.28, 0.2, 0.08, 0], [-0.05, -0.3, 0.09, 2],
  ];
  patches.forEach(([x, z, r, c]) => {
    b.part(new THREE.CylinderGeometry(r, r * 1.1, 0.02, 7), MOSS[c], {
      at: [x, topY - 0.005, z], flat: true,
    });
    b.part(new THREE.SphereGeometry(r * 0.55, 6, 4), MOSS[(c + 1) % 3], {
      at: [x + r * 0.2, topY + 0.01, z - r * 0.1], scale: [1, 0.35, 1], flat: true,
    });
  });
  // moss drooping on flanks
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    b.part(new THREE.SphereGeometry(0.05, 6, 4), MOSS[i % 3], {
      at: [Math.sin(a) * R, topY - 0.05, Math.cos(a) * R], scale: [1, 0.7, 1], flat: true,
    });
  }

  // lichen spots
  const lich: [number, number][] = [[0.12, 0.05], [-0.1, -0.05], [0.3, 0.05], [-0.32, 0.05], [0.0, 0.18], [0.15, -0.28]];
  lich.forEach(([x, z], i) => {
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.006, 6), i % 2 ? "#d8d49a" : "#e6e0c0", {
      at: [x, topY + 0.003, z], flat: true,
    });
  });

  // mushrooms
  const mush: [number, number, number][] = [[0.3, -0.25, 0.04], [-0.33, 0.2, 0.05], [-0.28, 0.27, 0.03], [0.4, 0.1, 0.035]];
  mush.forEach(([x, z, r], i) => {
    const h = r * 1.8;
    const y0 = i === 3 ? 0 : topY - 0.01;
    b.part(new THREE.CylinderGeometry(r * 0.35, r * 0.45, h, 6), "#f3ead2", { at: [x, y0 + h / 2, z] });
    b.part(new THREE.SphereGeometry(r, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? "#e0592f" : "#d94a3a", {
      at: [x, y0 + h, z], flat: true,
    });
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1;
      b.part(new THREE.SphereGeometry(r * 0.15, 4, 3), "#fff6e0", {
        at: [x + Math.cos(a) * r * 0.5, y0 + h + r * 0.72, z + Math.sin(a) * r * 0.5],
      });
    }
  });

  // grass tufts
  const tufts: [number, number][] = [[-0.36, -0.1], [0.34, 0.28], [0.0, -0.36], [0.2, 0.3], [-0.15, 0.33]];
  tufts.forEach(([x, z]) => {
    for (let k = 0; k < 4; k++) {
      b.part(new THREE.ConeGeometry(0.01, 0.07 + k * 0.01, 4), MOSS[k % 3], {
        at: [x + (k - 1.5) * 0.012, topY + 0.02, z], rotation: [0, 0, (k - 1.5) * 14], flat: true,
      });
    }
  });

  // cracks on top and sides
  const cr: [number, number, number, number, number][] = [
    [0.05, -0.12, 0.12, 0.012, 30], [-0.15, 0.0, 0.1, 0.01, -50], [0.2, 0.15, 0.09, 0.01, 80],
  ];
  cr.forEach(([x, z, l, w, a]) => {
    b.part(new THREE.BoxGeometry(w, 0.004, l), "#3b3a37", { at: [x, topY + 0.004, z], rotation: [0, a, 0] });
  });
  b.part(new THREE.BoxGeometry(0.01, 0.14, 0.01), "#3b3a37", { at: [0, 0.2, R + 0.08], rotation: [0, 0, 10] });
  b.part(new THREE.BoxGeometry(0.01, 0.1, 0.01), "#3b3a37", { at: [R + 0.08, 0.15, 0.1], rotation: [0, 0, -12] });

  // rune carvings on sides (glowing teal)
  const RUNE = "#6fe3d0";
  const rune = (cx: number, cy: number, cz: number, ry: number, k: number) => {
    const q = (dx: number, dy: number, w: number, h: number, rz = 0) =>
      b.part(new THREE.BoxGeometry(w, h, 0.006), RUNE, {
        at: [cx + Math.cos(ry) * dx, cy + dy, cz - Math.sin(ry) * dx], rotation: [0, (ry * 180) / Math.PI, rz],
      });
    q(0, 0, 0.012, 0.07);
    if (k % 3 === 0) { q(0.02, 0.02, 0.04, 0.01, 30); q(-0.02, -0.02, 0.04, 0.01, -30); }
    if (k % 3 === 1) { q(0, 0.03, 0.05, 0.01); q(0, -0.03, 0.05, 0.01); }
    if (k % 3 === 2) { q(0.02, 0, 0.04, 0.01, 45); q(-0.02, 0, 0.04, 0.01, -45); }
  };
  for (let i = 0; i < 3; i++) rune(-0.12 + i * 0.12, 0.14, 0.42, 0, i);
  for (let i = 0; i < 2; i++) rune(0.43, 0.14, -0.1 + i * 0.14, Math.PI / 2, i + 1);
  for (let i = 0; i < 2; i++) rune(-0.43, 0.14, -0.1 + i * 0.14, -Math.PI / 2, i);
  P(0);
  void frame;
}
    return buildStoneDetail;
  })(),
];

export const BASE_PARTS = [
  {
    id: "head",
    builds: "Red panda head details: cream-rimmed round ears with dark inner, big anime eyes with highlights, brows, white cheek ruffs with rust tufts, muzzle, nose, mouth, separate lower jaw, whiskers, forehead markings, tear stripes",
    box: [
      [-0.2, 0.5, 0.0],
      [0.2, 0.95, 0.4],
    ],
    attaches: "The head joint and the skull sphere surface: the face front, top and sides",
    joints: ["head", "jaw"],
    floor: false,
    budget: 220,
  },
  {
    id: "tail",
    builds: "Big bushy tail with alternating rust and cream-orange rings, dark tip, fur tufts and curled S-shape, extended as a chain tail1..tail6",
    box: [
      [-0.2, 0.3, -0.85],
      [0.2, 1.1, -0.1],
    ],
    attaches: "The rump at the back of the body, tail joint chain starting at tailBase",
    joints: ["tailBase", "hips"],
    floor: false,
    budget: 180,
  },
  {
    id: "arms",
    builds: "Two arms with shoulders, forearms, chunky paws with toe digits and dark claws, outstretched sideways for balance, fur cuffs",
    box: [
      [-0.5, 0.3, -0.1],
      [0.5, 0.8, 0.3],
    ],
    attaches: "Shoulder sockets on the left and right upper sides of the torso at chest height",
    joints: ["chest", "shoulderL", "shoulderR"],
    floor: false,
    budget: 170,
  },
  {
    id: "legs",
    builds: "Two hind legs and feet with dark stockings, paws with toes, planted on the stone, thigh fur tufts",
    box: [
      [-0.3, 0.2, -0.25],
      [0.3, 0.55, 0.15],
    ],
    attaches: "Hip sockets at the lower sides of the pelvis, feet resting on top of the stone",
    joints: ["hips", "hipL", "hipR"],
    floor: false,
    budget: 140,
  },
  {
    id: "stoneDetail",
    builds: "Moss patches on upward faces, tufts, small mushrooms, cracks, lichen spots, rune carvings on the stone sides, small pebbles at foot",
    box: [
      [-0.5, 0, -0.5],
      [0.5, 0.3, 0.5],
    ],
    attaches: "The stone top and flanks of the base rock",
    joints: [],
    floor: true,
    budget: 150,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const RUST = "#c8542a";
  const CREAM = "#f6dfb4";
  const STONE = "#7c8088";
  const MOSS = "#5f9a3a";

  // Stone: base rock, mossy cap
  b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.26, 7), STONE, { at: [0, 0.13, 0] });
  b.part(new THREE.CylinderGeometry(0.36, 0.42, 0.06, 7), MOSS, { at: [0, 0.28, 0] });

  const hips = b.joint("hips", { at: [0, 0.5, -0.02] });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.6, 0.04], aim: [0, 0.75, 0.08] });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.72, 0.08], aim: [0, 0.8, 0.14] });
  const head = b.joint("head", { parent: neck, at: [0, 0.78, 0.13], aim: [0, 0.78, 0.3] });
  b.joint("jaw", { parent: head, at: [0, 0.74, 0.2], aim: [0, 0.72, 0.34] });
  b.joint("tailBase", { parent: hips, at: [0, 0.5, -0.2], aim: [0, 0.55, -0.45] });

  // Torso: pear-shaped, heavy rump
  b.part(new THREE.SphereGeometry(0.2, 10, 8), RUST, { bone: hips, at: [0, 0.48, -0.03], scale: [1, 0.9, 1.1] });
  b.part(new THREE.SphereGeometry(0.19, 10, 8), RUST, { bone: chest, at: [0, 0.65, 0.04], scale: [1, 1.05, 0.95] });
  b.part(new THREE.SphereGeometry(0.15, 8, 6), CREAM, { bone: chest, at: [0, 0.6, 0.12], scale: [0.9, 1, 0.6] });
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.12, 8), RUST, { bone: neck, at: [0, 0.76, 0.09] });

  // Skull: wide round head
  b.part(new THREE.SphereGeometry(0.17, 12, 9), RUST, { bone: head, at: [0, 0.83, 0.16], scale: [1.15, 0.92, 1] });

  // Shoulder and hip sockets as small mounts
  for (const s of [1, -1]) {
    b.joint(s > 0 ? "shoulderL" : "shoulderR", { parent: chest, at: [s * 0.17, 0.7, 0.04], dir: [s, -0.2, 0.1] });
    b.joint(s > 0 ? "hipL" : "hipR", { parent: hips, at: [s * 0.13, 0.42, -0.02], dir: [s * 0.1, -1, 0.2] });
    b.part(new THREE.SphereGeometry(0.07, 7, 5), RUST, { bone: chest, at: [s * 0.17, 0.7, 0.04] });
    b.part(new THREE.SphereGeometry(0.09, 7, 5), RUST, { bone: hips, at: [s * 0.13, 0.42, -0.02] });
  }
  b.part(new THREE.SphereGeometry(0.1, 8, 6), RUST, { bone: hips, at: [0, 0.48, -0.2] });

    for (const add of PARTS) add(b);
  return b.root;
}
