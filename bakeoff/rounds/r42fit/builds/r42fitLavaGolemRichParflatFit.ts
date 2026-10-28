import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Basalt Lava Golem",
  "description": "A hulking Genshin-style lava golem built from dark basalt plates with glowing molten seams, a crystal-lit chest core and a cracked horned head."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  basalt: "#3a3a4a",
  basaltLight: "#58586c",
  basaltDeep: "#22222e",
  lava: "#ff6a1a",
  lavaHot: "#ffc23a",
  lavaCore: "#fff1a0",
  gold: "#d9a63a",
  goldDark: "#8a5f1e",
  ash: "#8a8a96",
  eye: "#ffe45a",
  ember: "#ff3c10",
  rune: "#ffb347",
};
const M = {
  pelvis: [0, 1.3, 0] as [number, number, number],
  chestCore: [0, 2, 0.55] as [number, number, number],
  neckBase: [0, 2.6, 0.05] as [number, number, number],
  headCenter: [0, 2.85, 0.15] as [number, number, number],
  shoulderL: [1, 2.5, 0] as [number, number, number],
  shoulderR: [-1, 2.5, 0] as [number, number, number],
  hipL: [0.5, 1.3, 0] as [number, number, number],
  hipR: [-0.5, 1.3, 0] as [number, number, number],
  fistL: [1.55, 0.7, 0.2] as [number, number, number],
  fistR: [-1.55, 0.7, 0.2] as [number, number, number],
  backVent: [0, 2.2, -0.6] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P }: any) {
  const R = rng(5);
  const pel = J.pelvis, ch = J.chest;

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, bone, rotation: rot });
  const glowBox = (w: number, h: number, d: number, c: string, at: number[], bone: any, s = 1.2) =>
    glow(box(w, h, d, c, at, bone), s);

  // pelvis block
  box(1.5, 0.3, 1.0, P.basaltDeep, [0, 1.35, 0], pel);
  box(1.6, 0.12, 1.1, P.basaltLight, [0, 1.6, 0], pel);
  box(1.56, 0.1, 1.06, P.gold, [0, 1.3, 0], pel);
  // belt buckle
  box(0.34, 0.3, 0.1, P.gold, [0, 1.42, 0.55], pel);
  glowBox(0.2, 0.18, 0.06, P.lava, [0, 1.42, 0.61], pel);

  // stacked tapered plates: waist, belly, chest
  const tiers = [
    { y: 1.82, w: 1.4, d: 1.0, h: 0.42 },
    { y: 2.15, w: 1.7, d: 1.2, h: 0.5 },
    { y: 2.5, w: 2.1, d: 1.45, h: 0.5 },
  ];
  tiers.forEach((t, i) => {
    box(t.w, t.h, t.d, P.basalt, [0, t.y, 0], ch);
    box(t.w + 0.04, 0.1, t.d + 0.04, P.basaltLight, [0, t.y + t.h / 2, 0], ch);
    box(t.w + 0.06, 0.07, t.d + 0.06, P.gold, [0, t.y - t.h / 2 + 0.03, 0], ch);
    // lava seam
    glowBox(t.w * 0.96, 0.05, t.d * 1.02, P.lava, [0, t.y - t.h / 2 - 0.02, 0], ch, 1.4);
    // front plate bevels
    for (const s of [1, -1]) {
      box(0.3, t.h * 0.8, 0.08, P.basaltDeep, [s * t.w * 0.33, t.y, t.d / 2 + 0.03], ch);
      b.part(new THREE.SphereGeometry(0.035, 6, 4), P.gold, { at: [s * t.w * 0.46, t.y + 0.1, t.d / 2 + 0.03], bone: ch });
    }
    void i;
  });

  // chest core
  box(0.74, 0.74, 0.1, P.gold, [0, 2.0, 0.55], ch);
  box(0.6, 0.6, 0.06, P.goldDark, [0, 2.0, 0.6], ch, [0, 0, 45]);
  glow(b.part(new THREE.TorusGeometry(0.28, 0.04, 5, 12), P.lavaHot, { at: [0, 2.0, 0.64], bone: ch }), 1.5);
  glow(b.part(new THREE.OctahedronGeometry(0.2, 0), P.lavaCore, { at: [0, 2.0, 0.68], bone: ch, scale: [1, 1.3, 0.8] }), 2);
  // radial cracks from core
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    glow(b.part(new THREE.BoxGeometry(0.04, 0.3 + R() * 0.2, 0.03), P.lava, {
      at: [Math.cos(a) * 0.5, 2.0 + Math.sin(a) * 0.5, 0.57], bone: ch, rotation: [0, 0, (a * 180) / Math.PI - 90],
    }), 1.3);
  }

  // rune marks on belly
  for (const s of [1, -1])
    for (let k = 0; k < 3; k++) {
      glowBox(0.05, 0.16, 0.03, P.rune, [s * 0.5, 1.8 + k * 0.01, 0.52 - 0.0], ch, 1.2).position.y += 0;
      glowBox(0.14, 0.04, 0.03, P.rune, [s * (0.5 + 0.06 * (k - 1)), 1.85 + k * 0.05, 0.53], ch, 1.2);
    }

  // shoulder yoke / collar plates
  for (const s of [1, -1]) {
    box(0.5, 0.14, 1.1, P.basaltLight, [s * 0.8, 2.6, 0], ch, [0, 0, -s * 12]);
    box(0.52, 0.04, 1.12, P.gold, [s * 0.8, 2.52, 0], ch, [0, 0, -s * 12]);
  }
  box(0.7, 0.14, 0.8, P.basaltDeep, [0, 2.63, 0.05], ch);

  // back spines
  for (let i = 0; i < 5; i++) {
    const y = 1.75 + i * 0.18, x = (i % 2 ? 0.45 : -0.45) * (i / 4 + 0.3);
    b.part(new THREE.ConeGeometry(0.12 - i * 0.01, 0.3 + R() * 0.05, 5), i % 2 ? P.basalt : P.basaltLight, {
      at: [x, y, -0.65], bone: ch, rotation: [-115, 0, 0],
    });
  }
  // ember vent
  box(0.5, 0.45, 0.14, P.gold, [0, 2.2, -0.74], ch);
  glowBox(0.38, 0.33, 0.1, P.ember, [0, 2.2, -0.78], ch, 1.5);
  glowBox(0.2, 0.2, 0.08, P.lavaHot, [0, 2.2, -0.82], ch, 1.8);
  for (let i = 0; i < 6; i++)
    glow(b.part(new THREE.TetrahedronGeometry(0.04 + R() * 0.03), P.ember, {
      at: [(R() - 0.5) * 0.5, 2.45 + R() * 0.15, -0.75 - R() * 0.03], bone: ch,
    }), 1.5);
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const lit = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, s = 1, o: any = {}) =>
    glow(b.part(g, c, { bone, at, ...o }), s);

  const head = J.head, jaw = J.jaw, neck = J.neck;

  // neck collar: stacked plates
  put(box(0.62, 0.1, 0.5), P.basaltDeep, [0, 2.6, 0.06], neck);
  put(box(0.7, 0.08, 0.56), P.basalt, [0, 2.68, 0.08], neck);
  put(box(0.74, 0.03, 0.6), P.gold, [0, 2.73, 0.08], neck);
  for (const s of [1, -1]) {
    lit(box(0.04, 0.05, 0.4), P.lava, [s * 0.36, 2.64, 0.07], neck, 1);
    put(new THREE.SphereGeometry(0.025, 6, 4), P.gold, [s * 0.37, 2.73, 0.3], neck);
  }

  // skull
  put(box(0.86, 0.46, 0.8), P.basalt, [0, 2.97, 0.15], head);
  put(box(0.9, 0.08, 0.84), P.basaltLight, [0, 3.2 - 0.04, 0.15], head);
  put(box(0.7, 0.14, 0.2), P.basaltDeep, [0, 2.82, 0.5], head);
  // brow slab
  put(box(0.94, 0.12, 0.3), P.basaltLight, [0, 3.07, 0.54], head);
  put(box(0.96, 0.03, 0.32), P.gold, [0, 3.14, 0.54], head);
  // cheek plates
  for (const s of [1, -1]) {
    put(box(0.1, 0.3, 0.5), P.basalt, [s * 0.47, 2.92, 0.3], head);
    put(box(0.12, 0.05, 0.3), P.goldDark, [s * 0.47, 3.08, 0.3], head);
  }
  // eyes + lava brows
  for (const s of [1, -1]) {
    lit(box(0.2, 0.05, 0.04), P.eye, [s * 0.2, 2.99, 0.7], head, 1.6, { rotation: [0, 0, -s * 14] });
    lit(box(0.24, 0.035, 0.05), P.lava, [s * 0.22, 3.04, 0.7], head, 1.2, { rotation: [0, 0, s * 12] });
    lit(box(0.08, 0.02, 0.03), P.lavaCore, [s * 0.2, 2.99, 0.72], head, 1.5);
  }
  // forehead cracks
  const crack = [[0, 3.17, 0.38, 0.04, 0.02, 0.3], [0.06, 3.17, 0.1, 0.035, 0.02, 0.22], [-0.2, 3.17, 0.3, 0.03, 0.02, 0.2], [0.24, 3.17, 0.25, 0.03, 0.02, 0.18]];
  crack.forEach((c, i) => lit(box(c[3], c[4], c[5]), P.lava, [c[0], c[1] + 0.025, c[2]], head, 1.2, { rotation: [0, (i - 1.5) * 12, 0] }));
  // rune on brow
  lit(box(0.05, 0.05, 0.02), P.rune, [0, 3.07, 0.7], head, 1.2, { rotation: [0, 0, 45] });

  // horns
  for (const s of [1, -1]) {
    const pts = [[s * 0.4, 2.98, 0.1], [s * 0.5, 3.04, 0.04], [s * 0.52, 3.12, 0.08], [s * 0.46, 3.16, 0.2]];
    const path = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const horn = new THREE.TubeGeometry(path, 8, 0.04, 6);
    put(horn, P.basalt, [0, 0, 0], head, { at: [0, 0, 0] });
    put(new THREE.ConeGeometry(0.03, 0.1, 6), P.gold, [s * 0.46, 3.15, 0.24], head, { rotation: [70, 0, 0] });
    put(new THREE.CylinderGeometry(0.06, 0.07, 0.06, 6), P.goldDark, [s * 0.4, 3.0, 0.1], head);
  }

  // jaw
  put(box(0.78, 0.14, 0.62), P.basaltDeep, [0, 2.7, 0.4], jaw);
  put(box(0.82, 0.05, 0.4), P.basalt, [0, 2.65, 0.5], jaw);
  put(box(0.5, 0.1, 0.1), P.basalt, [0, 2.66, 0.72], jaw);
  lit(box(0.6, 0.03, 0.4), P.lava, [0, 2.775, 0.42], jaw, 1.4);
  lit(box(0.4, 0.015, 0.25), P.lavaHot, [0, 2.79, 0.44], jaw, 1.6);
  // teeth
  for (let i = 0; i < 6; i++) {
    const x = -0.27 + i * 0.108;
    put(new THREE.ConeGeometry(0.035, 0.12, 4), P.ash, [x, 2.84, 0.7], jaw);
    put(new THREE.ConeGeometry(0.03, 0.09, 4), P.ash, [x, 2.78 + 0.0, 0.72], jaw, { rotation: [180, 0, 0], at: [x + 0.05, 2.9, 0.7] });
  }
  // upper teeth on skull
  for (let i = 0; i < 5; i++)
    put(new THREE.ConeGeometry(0.03, 0.09, 4), P.ash, [-0.22 + i * 0.11, 2.77, 0.72], head, { rotation: [180, 0, 0] });

  // gold studs
  for (const s of [1, -1]) for (let k = 0; k < 2; k++)
    put(new THREE.SphereGeometry(0.022, 6, 4), P.gold, [s * 0.46, 3.0 - k * 0.1, 0.56], head);

  // embers
  for (let i = 0; i < 8; i++) {
    const a = r() * 6.28;
    lit(new THREE.OctahedronGeometry(0.018 + r() * 0.012, 0), i % 2 ? P.ember : P.lavaHot,
      [Math.cos(a) * (0.3 + r() * 0.1), 3.22 - 0.01 * r(), 0.15 + Math.sin(a) * 0.25], head, 1.5);
  }
}
    return buildHead;
  })(),
  // armL
  (() => {
function buildArmL({ b, J, P }: any) {
  const up = J.upperArmL, fore = J.foreArmL, fist = J.fistL;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: string, bone: any, at: number[], rot?: number[], lava = 0) => {
    const p = b.part(g, c, { bone, at, rotation: rot });
    if (lava) glow(p, lava);
    return p;
  };

  // Shoulder pauldron: stacked plates
  const sh = [1.05, 2.62, 0];
  put(new THREE.SphereGeometry(0.48, 8, 6), P.basalt, up, [1.55, 2.5, 0]);
  put(box(0.9, 0.2, 1.0), P.basaltLight, up, [1.6, 2.88, 0]);
  put(box(1.0, 0.2, 1.1), P.basalt, up, [1.6, 2.7, 0]);
  put(box(0.95, 0.2, 1.05), P.basaltDeep, up, [1.6, 2.52, 0]);
  put(box(1.0, 0.05, 1.15), P.gold, up, [1.6, 2.6, 0]);
  put(box(0.9, 0.05, 1.05), P.gold, up, [1.6, 2.79, 0]);
  for (let i = 0; i < 3; i++) {
    put(new THREE.ConeGeometry(0.1, 0.3, 6), P.basaltDeep, up, [1.3 + i * 0.3, 2.95, 0.1 - i * 0.1], [0, 0, -20 - i * 5]);
    put(new THREE.SphereGeometry(0.04, 6, 4), P.gold, up, [1.5 + i * 0.05, 2.83, 0.4 - i * 0.4]);
  }

  // Upper arm
  b.rod(sh, [1.9, 2.15, 0.05], [0.4, 0.34], P.basalt, { bone: up, sides: 8 });
  put(box(0.5, 0.15, 0.7), P.basaltLight, up, [1.45, 2.5, 0.05], [0, 0, -20]);
  put(box(0.5, 0.15, 0.7), P.basaltDeep, up, [1.4, 2.15, 0.05], [0, 0, -20]);
  // Elbow seam rings
  for (const t of [0, 0.12]) {
    const p = put(new THREE.TorusGeometry(0.36, 0.04, 5, 10), P.lavaHot, up, [1.82 + t * 0.4, 2.2 - t, 0.05], [90, 0, -20], 1.3);
  }
  put(new THREE.SphereGeometry(0.38, 8, 6), P.basaltDeep, fore, [1.9, 2.15, 0.05]);

  // Forearm
  b.rod([1.9, 2.15, 0.05], [2.3, 1.3, 0.2], [0.36, 0.42], P.basalt, { bone: fore, sides: 8 });
  const dir = -26;
  for (let i = 0; i < 3; i++) {
    const y = 1.95 - i * 0.28, x = 1.98 + i * 0.1;
    put(box(0.62, 0.2, 0.75), i % 2 ? P.basalt : P.basaltLight, fore, [x + 0.03, y, 0.1], [0, 0, dir]);
    put(box(0.64, 0.04, 0.77), P.gold, fore, [x + 0.03, y + 0.11, 0.1], [0, 0, dir]);
    put(new THREE.SphereGeometry(0.04, 6, 4), P.gold, fore, [x + 0.3, y, 0.42]);
    put(box(0.5, 0.05, 0.6), P.lava, fore, [x, y - 0.13, 0.08], [0, 0, dir], 1.2);
  }

  // Fist: four stacked knuckle blocks
  for (let i = 0; i < 4; i++) {
    const z = -0.2 + i * 0.22;
    put(box(0.5, 0.55, 0.2), i % 2 ? P.basalt : P.basaltLight, fist, [2.32, 1.0, z + 0.1]);
    put(box(0.3, 0.1, 0.2), P.basaltDeep, fist, [2.32, 0.68, z + 0.1]);
    if (i < 3) put(box(0.46, 0.5, 0.03), P.lavaHot, fist, [2.32, 1.0, z + 0.21], undefined, 1.4);
  }
  put(box(0.55, 0.06, 0.95), P.gold, fist, [2.32, 1.3, 0.25]);
  put(box(0.3, 0.35, 0.25), P.basalt, fist, [2.05, 1.05, 0.4], [0, 0, 20]); // thumb
  put(new THREE.SphereGeometry(0.04, 6, 4), P.gold, fist, [2.62, 1.2, 0.25]);
  put(new THREE.SphereGeometry(0.05, 6, 4), P.ember, fist, [2.6, 0.75, 0.5], undefined, 1.5);
}
    return buildArmL;
  })(),
  // armR
  (() => {
function buildArmR({ b, J, P }: any) {
  const up = J.upperArmR, fore = J.foreArmR, fist = J.fistR;
  const S = -1; // right side is -X
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const lava = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, rot?: number[], s = 1) =>
    glow(b.part(g, c, { bone, at, rotation: rot }), s);

  // Pauldron: stacked plates
  const pc: number[] = [-1.68, 2.4, 0];
  b.part(new THREE.SphereGeometry(0.58, 8, 6), P.basalt, { bone: up, at: pc, scale: [1.0, 0.85, 1] });
  box(0.9, 0.18, 1.0, P.basaltLight, [-1.7, 2.8, 0], up, [0, 0, 4]);
  box(1.0, 0.2, 1.1, P.basalt, [-1.72, 2.6, 0], up, [0, 0, 5]);
  box(1.1, 0.2, 1.15, P.basaltDeep, [-1.75, 2.4, 0], up, [0, 0, 6]);
  for (const y of [2.9, 2.7, 2.5])
    box(0.9 + (2.9 - y) * 0.2, 0.04, 1.0, P.gold, [-1.72, y, 0], up);
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.ConeGeometry(0.1, 0.2, 5), P.basaltLight, { bone: up, at: [-1.4 - i * 0.28, 2.95, 0] });
    b.part(new THREE.SphereGeometry(0.04, 5, 4), P.gold, { bone: up, at: [-1.4 - i * 0.28, 2.75, 0.56] });
  }
  box(0.8, 0.05, 0.05, P.lava, [-1.75, 2.35, 0.62], up);

  // Upper arm
  const a: number[] = [-1.2, 2.5, 0], e: number[] = [-1.9, 2.15, 0.05];
  b.rod(a, e, [0.4, 0.36], P.basalt, { bone: up, sides: 8 });
  b.rod([-1.45, 2.38, 0], [-1.65, 2.28, 0], 0.43, P.basaltLight, { bone: up, sides: 6 });
  for (const t of [0.35, 0.8]) {
    const x = a[0] + (e[0] - a[0]) * t, y = a[1] + (e[1] - a[1]) * t;
    lava(new THREE.TorusGeometry(0.4, 0.035, 5, 10), P.lava, [x, y, 0.02], up, [0, 70, 0]);
  }
  b.sphere?.call;
  b.part(new THREE.SphereGeometry(0.4, 8, 6), P.basaltDeep, { bone: fore, at: [-1.9, 2.15, 0.05] });
  lava(new THREE.TorusGeometry(0.4, 0.04, 5, 10), P.lavaHot, [-1.9, 2.15, 0.05], fore, [0, 50, 0]);

  // Forearm
  const f0: number[] = [-1.9, 2.15, 0.05], f1: number[] = [-2.3, 1.3, 0.2];
  b.rod(f0, f1, [0.38, 0.45], P.basalt, { bone: fore, sides: 8 });
  const dir = new THREE.Vector3(f1[0] - f0[0], f1[1] - f0[1], f1[2] - f0[2]);
  const ang = Math.atan2(-dir.x, dir.y) * 180 / Math.PI;
  for (const t of [0.3, 0.6]) {
    const x = f0[0] + dir.x * t, y = f0[1] + dir.y * t, z = f0[2] + dir.z * t;
    box(0.2, 0.28, 0.9, P.basaltLight, [x - 0.3, y, z], fore, [0, 0, ang]);
    box(0.06, 0.3, 0.92, P.gold, [x - 0.42, y, z], fore, [0, 0, ang]);
    b.part(new THREE.SphereGeometry(0.04, 5, 4), P.gold, { bone: fore, at: [x - 0.1, y, z + 0.47] });
  }
  lava(new THREE.BoxGeometry(0.5, 0.04, 0.04), P.lava, [-2.12, 1.75, 0.5], fore, [0, 0, ang]);
  lava(new THREE.TorusGeometry(0.43, 0.035, 5, 10), P.lava, [-2.25, 1.4, 0.18], fore, [0, 0, ang - 90]);

  // Fist
  const fc = [-2.35, 1.0, 0.2];
  box(0.85, 0.7, 0.8, P.basaltDeep, fc, fist);
  for (let i = 0; i < 4; i++) {
    const x = fc[0] + (i - 1.5) * 0.2;
    box(0.2, 0.34, 0.3, i % 2 ? P.basalt : P.basaltLight, [x, 0.75, 0.55], fist);
    box(0.2, 0.06, 0.32, P.gold, [x, 0.95, 0.55], fist);
    lava(new THREE.BoxGeometry(0.03, 0.34, 0.04), P.lavaHot, [x + 0.1, 0.75, 0.71], fist);
  }
  box(0.9, 0.2, 0.84, P.basaltLight, [fc[0], 1.35, fc[2]], fist);
  box(0.3, 0.45, 0.35, P.basalt, [-1.9, 0.95, 0.3], fist, [0, 0, 15]);
  lava(new THREE.BoxGeometry(0.8, 0.04, 0.04), P.lava, [fc[0], 1.2, 0.62], fist);
  lava(new THREE.BoxGeometry(0.04, 0.5, 0.04), P.lava, [fc[0] - 0.43, 1.0, 0.45], fist);
  for (let i = 0; i < 3; i++)
    b.part(new THREE.SphereGeometry(0.04, 5, 4), P.gold, { bone: fist, at: [fc[0] - 0.2 + i * 0.2, 1.3, 0.63] });
  b.part(new THREE.OctahedronGeometry(0.05), P.ember, { bone: fist, at: [-2.9, 0.8, 0.3] });
}
    return buildArmR;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P }: any) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r0: number, r1: number, h: number, n = 8) => new THREE.CylinderGeometry(r0, r1, h, n);

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = J["hip" + S], knee = J["knee" + S], foot = J["foot" + S];
    const x = s * 0.55;

    // thigh pillar (hip y1.3 -> knee y0.75)
    b.part(cyl(0.34, 0.3, 0.6, 8), P.basalt, { bone: hip, at: [x, 1.05, 0.05] });
    b.part(box(0.74, 0.14, 0.62), P.basaltLight, { bone: hip, at: [x, 1.36, 0.03] });
    b.part(box(0.7, 0.12, 0.58), P.basaltDeep, { bone: hip, at: [x, 0.8, 0.06] });
    // thigh plates
    for (const sx of [-1, 1]) b.part(box(0.1, 0.4, 0.5), P.basaltLight, { bone: hip, at: [x + sx * 0.33, 1.05, 0.05] });
    b.part(box(0.5, 0.36, 0.1), P.basalt, { bone: hip, at: [x, 1.05, 0.38] });
    // hip lava seam and gold band
    glow(b.part(cyl(0.36, 0.36, 0.05, 8), P.lava, { bone: hip, at: [x, 1.22, 0.05] }), 1.4);
    b.part(cyl(0.37, 0.37, 0.05, 8), P.gold, { bone: hip, at: [x, 1.29, 0.05] });
    // studs
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI - Math.PI / 2;
      b.part(new THREE.SphereGeometry(0.03, 6, 4), P.gold, { bone: hip, at: [x + Math.sin(a) * 0.37, 1.29, 0.05 + Math.cos(a) * 0.37] });
    }

    // knee
    b.part(new THREE.DodecahedronGeometry(0.3, 0), P.basaltLight, { bone: knee, at: [x, 0.75, 0.2], scale: [1, 0.9, 0.7] });
    b.part(box(0.5, 0.06, 0.12), P.gold, { bone: knee, at: [x, 0.93, 0.36] });
    b.part(box(0.5, 0.06, 0.12), P.gold, { bone: knee, at: [x, 0.57, 0.36] });
    glow(b.part(box(0.05, 0.3, 0.03), P.lavaHot, { bone: knee, at: [x, 0.75, 0.43], rotation: [0, 0, 20] }), 1.5);
    glow(b.part(box(0.04, 0.16, 0.03), P.lava, { bone: knee, at: [x + 0.08, 0.7, 0.44], rotation: [0, 0, -35] }), 1.3);
    glow(b.part(cyl(0.3, 0.3, 0.05, 8), P.lava, { bone: knee, at: [x, 0.62, 0.08] }), 1.4);

    // shin
    b.part(box(0.56, 0.42, 0.52), P.basalt, { bone: knee, at: [x, 0.4, 0.1] });
    b.part(box(0.6, 0.1, 0.56), P.basaltLight, { bone: knee, at: [x, 0.6, 0.1] });
    b.part(box(0.5, 0.3, 0.1), P.basaltLight, { bone: knee, at: [x, 0.4, 0.38] });
    glow(b.part(box(0.04, 0.22, 0.02), P.lava, { bone: knee, at: [x, 0.4, 0.44] }), 1.3);

    // ankle seam
    glow(b.part(box(0.6, 0.04, 0.54), P.lavaHot, { bone: foot, at: [x, 0.2, 0.1] }), 1.5);

    // foot
    b.part(box(0.7, 0.16, 0.9), P.basaltDeep, { bone: foot, at: [x, 0.08, 0.25] });
    b.part(box(0.62, 0.08, 0.5), P.basaltLight, { bone: foot, at: [x, 0.19, 0.12] });
    b.part(box(0.72, 0.06, 0.92), P.ash, { bone: foot, at: [x, 0.03, 0.25] });
    glow(b.part(box(0.36, 0.025, 0.22), P.lava, { bone: foot, at: [x, 0.235, 0.1] }), 1.4);
    // toes
    for (let i = -1; i <= 1; i++) {
      b.part(box(0.2, 0.15, 0.24), P.basalt, { bone: foot, at: [x + i * 0.23, 0.075, 0.76] });
      b.part(box(0.2, 0.05, 0.2), P.basaltLight, { bone: foot, at: [x + i * 0.23, 0.16, 0.76] });
      b.part(box(0.16, 0.03, 0.03), P.gold, { bone: foot, at: [x + i * 0.23, 0.1, 0.89] });
    }
  }
}
    return buildLegs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const J: Record<string, Joint> = {};
  J["pelvis"] = b.joint("pelvis", { at: [0,1.3,0], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["pelvis"], at: [0,1.7,0], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,2.6,0.05], dir: [0,1,0.2], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,2.75,0.12], dir: [0,0.3,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,2.75,0.3], dir: [0,-0.1,1], role: "jaw" });
  J["upperArmL"] = b.joint("upperArmL", { parent: J["chest"], at: [1,2.5,0], dir: [1,-0.35,0], role: "arm", group: "arms" });
  J["foreArmL"] = b.joint("foreArmL", { parent: J["upperArmL"], at: [1.9,2.15,0.05], dir: [0.5,-1,0.15], role: "arm", group: "arms" });
  J["fistL"] = b.joint("fistL", { parent: J["foreArmL"], at: [2.3,1.2,0.2], dir: [0.2,-1,0.1], role: "arm", group: "arms" });
  J["upperArmR"] = b.joint("upperArmR", { parent: J["chest"], at: [-1,2.5,0], dir: [-1,-0.35,0], role: "arm", group: "arms" });
  J["foreArmR"] = b.joint("foreArmR", { parent: J["upperArmR"], at: [-1.9,2.15,0.05], dir: [-0.5,-1,0.15], role: "arm", group: "arms" });
  J["fistR"] = b.joint("fistR", { parent: J["foreArmR"], at: [-2.3,1.2,0.2], dir: [-0.2,-1,0.1], role: "arm", group: "arms" });
  J["hipL"] = b.joint("hipL", { parent: J["pelvis"], at: [0.5,1.3,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.55,0.75,0.1], dir: [0,-1,0], role: "leg", group: "legs" });
  J["footL"] = b.joint("footL", { parent: J["kneeL"], at: [0.55,0.2,0.1], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["pelvis"], at: [-0.5,1.3,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.55,0.75,0.1], dir: [0,-1,0], role: "leg", group: "legs" });
  J["footR"] = b.joint("footR", { parent: J["kneeR"], at: [-0.55,0.2,0.1], dir: [0,0,1], role: "leg", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
