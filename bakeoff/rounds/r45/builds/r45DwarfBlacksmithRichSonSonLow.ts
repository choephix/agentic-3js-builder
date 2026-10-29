import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Dwarf Blacksmith at the Anvil",
  "description": "A stout, ginger-bearded Warcraft-style dwarf smith in oversized riveted pauldrons and a leather apron, raising a sledge over a glowing half-forged blade held in tongs on an anvil and tree stump."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#e0996b",
  skinShade: "#b8704c",
  skinLight: "#f2b88a",
  beard: "#c25a1f",
  beardLight: "#ea8d34",
  beardDark: "#7d3414",
  steel: "#8f9bb0",
  steelDark: "#4e586c",
  steelLight: "#d3deee",
  iron: "#3a3f4d",
  gold: "#f2b72c",
  goldDark: "#a6741a",
  leather: "#80502b",
  leatherDark: "#4b2d19",
  leatherLight: "#ae6e3d",
  cloth: "#2f62ad",
  clothDark: "#1d3d74",
  wood: "#8c5b31",
  woodDark: "#5a3a20",
  stone: "#8a8478",
  emberHot: "#ffd45e",
  ember: "#ff7a1a",
  emberDark: "#c8350f",
  eyeWhite: "#f4efe0",
  eyeBlue: "#3ea6ee",
  ink: "#1b1218",
};
const M = {
  floor: [0, 0, 0.3] as [number, number, number],
  hipsPoint: [0, 0.6, -0.02] as [number, number, number],
  beltLine: [0, 0.7, 0] as [number, number, number],
  chestCenter: [0, 0.95, 0.03] as [number, number, number],
  neckBase: [0, 1.1, 0.05] as [number, number, number],
  headCenter: [0, 1.27, 0.08] as [number, number, number],
  beardRoot: [0, 1.15, 0.2] as [number, number, number],
  shoulderL: [0.33, 1.05, 0] as [number, number, number],
  shoulderR: [-0.33, 1.05, 0] as [number, number, number],
  gripL: [0.3, 0.88, 0.38] as [number, number, number],
  gripR: [-0.28, 0.98, 0.4] as [number, number, number],
  hammerHead: [-0.02, 1.18, 0.58] as [number, number, number],
  tongsJaw: [0.26, 0.81, 0.62] as [number, number, number],
  bladeCenter: [0.11, 0.8, 0.62] as [number, number, number],
  anvilTop: [0, 0.78, 0.62] as [number, number, number],
  stumpTop: [0, 0.36, 0.62] as [number, number, number],
  footL: [0.15, 0, 0.04] as [number, number, number],
  footR: [-0.15, 0, 0.04] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // legsAndBelt
  (() => {
function buildLegsAndBelt({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r0: number, r1: number, h: number, n = 8) => new THREE.CylinderGeometry(r0, r1, h, n);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { at, bone, ...o });
  const rivet = (at: number[], bone: any, r = 0.01) =>
    put(new THREE.SphereGeometry(r, 6, 4), P.gold, at, bone);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = J["hip" + side], knee = J["knee" + side], ank = J["ankle" + side], toe = J["toe" + side];
    const x = s * 0.15;
    // trousers
    b.capsule([x, 0.58, -0.02], [x, 0.33, 0.04], 0.1, P.clothDark, { bone: hip });
    b.capsule([x, 0.33, 0.04], [x, 0.12, -0.02], 0.085, P.clothDark, { bone: knee });
    // knee guard
    put(box(0.13, 0.12, 0.04), P.leatherLight, [x, 0.34, 0.125], knee);
    put(box(0.15, 0.03, 0.05), P.leatherDark, [x, 0.34, 0.125], knee);
    rivet([x, 0.34, 0.15], knee);
    // calf wraps
    for (let i = 0; i < 3; i++)
      put(cyl(0.092, 0.092, 0.025, 8), P.leatherDark, [x, 0.26 - i * 0.05, 0.02 - i * 0.003], knee);
    // boot
    put(box(0.17, 0.09, 0.3), P.leather, [x, 0.07, 0.04], ank);
    put(box(0.18, 0.04, 0.32), P.iron, [x, 0.02, 0.05], ank);
    put(box(0.17, 0.08, 0.1), P.leatherDark, [x, 0.08, 0.15], toe);
    put(box(0.175, 0.05, 0.07), P.steel, [x, 0.06, 0.2], toe);
    put(box(0.18, 0.012, 0.075), P.gold, [x, 0.088, 0.2], toe);
    // cuff
    put(cyl(0.105, 0.105, 0.05, 8), P.leatherDark, [x, 0.14, -0.02], ank);
    put(cyl(0.11, 0.11, 0.012, 8), P.leatherLight, [x, 0.168, -0.02], ank);
    for (let i = -1; i <= 1; i++) rivet([x + i * 0.04, 0.14, 0.085], ank, 0.008);
  }

  // belt
  const h = J.hips;
  put(cyl(0.27, 0.26, 0.09, 12), P.leatherDark, [0, 0.7, 0], h, { scale: [1, 1, 0.8] });
  put(cyl(0.272, 0.272, 0.015, 12), P.leatherLight, [0, 0.738, 0], h, { scale: [1, 1, 0.8] });
  put(cyl(0.272, 0.272, 0.015, 12), P.leatherLight, [0, 0.662, 0], h, { scale: [1, 1, 0.8] });
  // buckle
  put(box(0.12, 0.1, 0.03), P.goldDark, [0, 0.7, 0.215], h);
  put(box(0.1, 0.08, 0.03), P.gold, [0, 0.7, 0.222], h);
  put(box(0.07, 0.015, 0.03), P.steel, [0, 0.715, 0.232], h);
  put(box(0.03, 0.02, 0.03), P.steel, [0, 0.7, 0.232], h);
  put(box(0.05, 0.012, 0.03), P.steelLight, [0, 0.685, 0.232], h);
  // studs
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const a = 0.45 + i * 0.22;
      rivet([s * Math.sin(a) * 0.27, 0.7, Math.cos(a) * 0.216 + 0.0], h, 0.011);
    }
  // tabard front and back
  for (const f of [1, -1]) {
    const z = f * 0.2;
    put(box(0.3, 0.17, 0.025), P.cloth, [0, 0.58, z], h);
    put(box(0.31, 0.025, 0.03), P.clothDark, [0, 0.49, z], h);
    put(box(0.3, 0.012, 0.03), P.gold, [0, 0.52, z + f * 0.002], h);
    put(box(0.025, 0.17, 0.03), P.clothDark, [0.15, 0.58, z], h);
    put(box(0.025, 0.17, 0.03), P.clothDark, [-0.15, 0.58, z], h);
  }
  // hammer loop on right hip
  put(box(0.03, 0.12, 0.03), P.leather, [-0.26, 0.62, 0.02], h);
  put(box(0.05, 0.03, 0.04), P.leatherDark, [-0.26, 0.67, 0.02], h);
  put(cyl(0.012, 0.012, 0.15, 6), P.wood, [-0.26, 0.58, 0.02], h);
  // pouch left hip
  put(box(0.1, 0.12, 0.07), P.leather, [0.27, 0.6, 0.04], h);
  put(box(0.105, 0.04, 0.075), P.leatherDark, [0.27, 0.65, 0.04], h);
  rivet([0.27, 0.64, 0.082], h, 0.012);
  // rope coil on right hip (placed left is pouch; rope back-right)
  for (let i = 0; i < 3; i++)
    put(new THREE.TorusGeometry(0.05, 0.014, 5, 10), P.leatherLight, [-0.27, 0.6 - i * 0.025, -0.08], h, {
      rotation: [90, 0, 0],
    });
}
    return buildLegsAndBelt;
  })(),
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cone = (rad: number, h: number, c: string, at: number[], dir: number[], bone: any) =>
    b.part(new THREE.ConeGeometry(rad, h, 6), c, { bone, at, dir });
  const ball = (rad: number, c: string, at: number[], bone: any, sc?: number[]) =>
    b.part(new THREE.SphereGeometry(rad, 8, 6), c, { bone, at, scale: sc });

  // Body loft: belly, chest
  b.loft(
    [
      { at: [0, 0.66, 0.0], w: 0.5, h: 0.14 },
      { at: [0, 0.76, 0.03], w: 0.56, h: 0.2 },
      { at: [0, 0.9, 0.03], w: 0.6, h: 0.3 },
      { at: [0, 1.04, 0.03], w: 0.58, h: 0.24 },
      { at: [0, 1.12, 0.04], w: 0.36, h: 0.16 },
    ],
    { bone: [J.hips, J.spine1, J.spine2], color: P.clothDark },
  );
  // skin V
  box(0.1, 0.1, 0.02, P.skin, [0, 1.06, 0.2], J.spine2, [-10, 0, 0]);
  // Gorget
  b.part(new THREE.TorusGeometry(0.15, 0.03, 6, 12), P.steel, { bone: J.spine2, at: [0, 1.12, 0.05], dir: [0, 1, 0] });
  b.part(new THREE.TorusGeometry(0.15, 0.012, 4, 12), P.gold, { bone: J.spine2, at: [0, 1.145, 0.05], dir: [0, 1, 0] });

  // Apron
  box(0.4, 0.36, 0.03, P.leatherDark, [0, 0.88, 0.255], J.spine1);
  box(0.37, 0.33, 0.03, P.leather, [0, 0.88, 0.27], J.spine1);
  box(0.37, 0.04, 0.032, P.leatherLight, [0, 1.04, 0.272], J.spine1);
  // stitches along sides
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) box(0.01, 0.025, 0.006, P.leatherDark, [s * 0.165, 0.73 + i * 0.05, 0.288], J.spine1);
  // bottom soot
  for (let i = 0; i < 4; i++)
    box(0.05 + r() * 0.05, 0.025, 0.006, P.ink, [(r() - 0.5) * 0.28, 0.73 + r() * 0.04, 0.289], J.spine1);
  // corner rivets
  for (const s of [1, -1]) {
    ball(0.014, P.gold, [s * 0.17, 1.03, 0.29], J.spine1);
  }
  // emblem: patch, hammer, flame
  box(0.14, 0.14, 0.008, P.leatherDark, [0, 0.88, 0.288], J.spine1);
  box(0.012, 0.09, 0.008, P.wood, [0, 0.88, 0.294], J.spine1, [0, 0, 35]);
  box(0.06, 0.03, 0.01, P.steel, [-0.018, 0.915, 0.296], J.spine1, [0, 0, 35]);
  glow(cone(0.02, 0.06, P.ember, [0.025, 0.86, 0.296], [0, 1, 0.2], J.spine1), 1);
  cone(0.01, 0.035, P.emberHot, [0.025, 0.855, 0.3], [0, 1, 0.2], J.spine1);

  // Neck strap & cross-chest strap
  for (const s of [1, -1]) box(0.035, 0.2, 0.012, P.leatherDark, [s * 0.1, 1.04, 0.245], J.spine2, [0, 0, s * 18]);
  box(0.05, 0.55, 0.02, P.leatherDark, [0.02, 0.92, 0.27], J.spine2, [-3, 0, -40]);
  box(0.02, 0.55, 0.022, P.leatherLight, [0.02, 0.92, 0.275], J.spine2, [-3, 0, -40]);
  ball(0.02, P.gold, [0.0, 0.92, 0.29], J.spine2);

  // Pauldrons
  for (const s of [1, -1]) {
    const at = [s * 0.33, 1.05, 0];
    // cape under
    box(0.3, 0.05, 0.3, P.cloth, [s * 0.35, 1.0, 0], J.spine2, [0, 0, s * -12]);
    box(0.3, 0.012, 0.3, P.clothDark, [s * 0.35, 0.975, 0], J.spine2, [0, 0, s * -12]);
    // layered plates
    const layers: [number, number, string, number][] = [
      [0.17, 1.0, P.steelDark, 0],
      [0.15, 1.05, P.steel, 0.045],
      [0.11, 1.09, P.steelLight, 0.085],
    ];
    for (const [rad, y, c, o] of layers) {
      b.part(new THREE.SphereGeometry(rad, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), c, {
        bone: J.spine2,
        at: [s * (0.34 + o * 0.2), y, 0],
        scale: [1.2, 0.8, 1.1],
      });
    }
    b.part(new THREE.TorusGeometry(0.19, 0.012, 4, 14), P.gold, {
      bone: J.spine2,
      at: [s * 0.34, 1.0, 0],
      dir: [0, 1, 0],
      scale: [1.15, 1.1, 1],
    });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ball(0.012, P.gold, [s * 0.34 + Math.cos(a) * 0.19, 1.008, Math.sin(a) * 0.19], J.spine2);
    }
    // spikes
    for (let i = 0; i < 3; i++) {
      const a = (-0.5 + i * 0.5) + 0;
      cone(0.03, 0.1, P.steelLight, [s * 0.38 + s * 0.04, 1.14 + (i === 1 ? 0.03 : 0), (i - 1) * 0.1], [s * 0.7, 1, (i - 1) * 0.5], J.spine2);
      b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.015, 6), P.gold, {
        bone: J.spine2,
        at: [s * 0.38, 1.1 + (i === 1 ? 0.01 : 0), (i - 1) * 0.1],
        dir: [s * 0.4, 1, (i - 1) * 0.3],
      });
    }
  }

  // Cloak
  box(0.5, 0.42, 0.025, P.cloth, [0, 0.9, -0.26], J.spine1);
  box(0.5, 0.025, 0.03, P.gold, [0, 0.69, -0.262], J.spine1);
  for (const s of [1, -1]) box(0.02, 0.42, 0.03, P.gold, [s * 0.25, 0.9, -0.262], J.spine1);
  box(0.46, 0.04, 0.03, P.clothDark, [0, 1.1, -0.255], J.spine2);
}
    return buildTorso;
  })(),
  // headAndBeard
  (() => {
function buildHeadAndBeard({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const hc = M.headCenter;
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cone = (r: number, l: number, s = 6) => new THREE.ConeGeometry(r, l, s);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const H = (x: number, y: number, z: number) => [hc[0] + x, hc[1] + y, hc[2] + z];

  // neck
  put(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 8), P.skinShade, [0, 1.12, 0.06], neck);

  // skull
  put(sph(1, 12, 9), P.skin, H(0, 0.02, 0.0), head, { scale: [0.17, 0.15, 0.16] });
  put(box(0.3, 0.05, 0.07), P.skinShade, H(0, 0.045, 0.145), head);
  // cheeks
  for (const s of [1, -1]) {
    put(sph(0.05), P.skinLight, H(s * 0.1, -0.04, 0.13), head, { scale: [1, 0.8, 0.8] });
    // ears
    put(cone(0.035, 0.1, 4), P.skin, H(s * 0.175, 0.0, 0.0), head, { rotation: [0, 0, -s * 100] });
    put(new THREE.TorusGeometry(0.018, 0.005, 5, 10), P.gold, H(s * 0.19, -0.04, 0.0), head, { rotation: [0, 90, 0] });
    // eyes
    const ex = s * 0.065, ey = 0.02, ez = 0.15;
    put(sph(0.04, 8, 6), P.ink, H(ex, ey, ez - 0.005), head, { scale: [1.15, 1, 0.6] });
    put(sph(0.034, 8, 6), P.eyeWhite, H(ex, ey, ez), head, { scale: [1.1, 1, 0.6] });
    put(sph(0.019, 8, 6), P.eyeBlue, H(ex, ey - 0.002, ez + 0.012), head, { scale: [1, 1, 0.5] });
    put(sph(0.01, 6, 4), P.ink, H(ex, ey - 0.002, ez + 0.02), head);
    glow(put(sph(0.005, 4, 3), "#ffffff", H(ex + 0.006, ey + 0.008, ez + 0.026), head), 1);
    // brows
    for (let i = 0; i < 3; i++) {
      const c = [P.beard, P.beardLight, P.beard][i];
      put(cone(0.016, 0.07, 4), c, H(s * (0.035 + i * 0.03), 0.065 - i * 0.005 + (i === 0 ? -0.01 : 0), 0.168), head,
        { rotation: [0, 0, -s * (80 - i * 8)] });
    }
  }
  // nose
  put(sph(0.05, 8, 6), P.skinLight, H(0, -0.03, 0.18), head);
  put(sph(0.03, 6, 4), P.skinShade, H(0, -0.06, 0.18), head);

  // helmet
  put(sph(1, 12, 8), P.steelDark, H(0, 0.06, -0.01), head, { scale: [0.19, 0.15, 0.185] });
  put(sph(1, 12, 8), P.steel, H(0, 0.08, -0.01), head, { scale: [0.185, 0.145, 0.18] });
  put(new THREE.TorusGeometry(0.17, 0.012, 5, 16), P.steelLight, H(0, 0.1, -0.005), head, { rotation: [90, 0, 0], scale: [1, 1, 1] });
  put(new THREE.CylinderGeometry(0.19, 0.19, 0.035, 14), P.gold, H(0, 0.085, 0.0), head);
  put(box(0.03, 0.09, 0.015), P.steelDark, H(0, 0.04, 0.19), head);
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI * 1.0 - Math.PI / 2 + Math.PI / 2;
    const ang = (i / 8 - 0.5) * 2.4;
    put(sph(0.008, 4, 3), P.goldDark, H(Math.sin(ang) * 0.19, 0.12, Math.cos(ang) * 0.19), head);
  }
  put(cone(0.02, 0.05, 6), P.gold, H(0, 0.22, -0.01), head);
  // horns
  for (const s of [1, -1]) {
    const pts = [[0.18, 0.1, 0], [0.25, 0.14, 0], [0.29, 0.26, 0], [0.26, 0.36, 0]].map((p) => H(s * p[0], p[1], p[2]));
    const path = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const geo = new THREE.TubeGeometry(path, 8, 0.03, 6);
    put(geo, P.steelLight, [0, 0, 0], head, { at: [0, 0, 0] });
    put(cone(0.03, 0.1, 6), P.gold, H(s * 0.258, 0.38, 0), head);
    put(new THREE.TorusGeometry(0.03, 0.01, 5, 8), P.gold, H(s * 0.2, 0.115, 0), head, { rotation: [0, 90, 0] });
  }
  // hair tufts
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1;
    put(cone(0.03, 0.12, 4), [P.beard, P.beardLight, P.beardDark][i % 3], H(s * (0.08 + R() * 0.1), -0.06 - R() * 0.03, -0.1 - R() * 0.06), head,
      { rotation: [160, 0, s * 20] });
  }
  put(new THREE.CapsuleGeometry(0.03, 0.14, 4, 6), P.beard, H(0, -0.1, -0.2), head, { rotation: [10, 0, 0] });
  put(sph(0.02, 5, 4), P.gold, H(0, -0.2, -0.21), head);

  // jaw
  put(box(0.24, 0.07, 0.2), P.skin, H(0, -0.12, 0.06), jaw);
  put(box(0.2, 0.012, 0.01), P.ink, H(0, -0.085, 0.16), jaw);
  for (let i = -1; i <= 1; i += 2) put(box(0.02, 0.014, 0.008), P.eyeWhite, H(i * 0.03, -0.092, 0.158), jaw);
  put(box(0.14, 0.05, 0.08), P.skinShade, H(0, -0.16, 0.15), jaw);

  // moustache
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const c = [P.beardDark, P.beard, P.beard, P.beardLight][i];
      put(cone(0.035 - i * 0.003, 0.14 + i * 0.02, 5), c, H(s * (0.04 + i * 0.045), -0.075 - i * 0.012, 0.18 - i * 0.015), head,
        { rotation: [0, 0, -s * (95 + i * 12)] });
    }
    put(new THREE.TorusGeometry(0.014, 0.005, 5, 8), P.gold, H(s * 0.2, -0.11, 0.15), head, { rotation: [0, 90, 0] });
  }

  // beard
  put(box(0.3, 0.1, 0.12), P.beardDark, H(0, -0.14, 0.12), jaw);
  const bw = new THREE.CylinderGeometry(0.15, 0.04, 0.4, 7);
  put(bw, P.beardDark, [0, 0.94, 0.2], jaw, { scale: [1, 1, 0.5], rotation: [0, 0, 180] });
  for (let i = 0; i < 12; i++) {
    const t = i / 11, x = (t - 0.5) * 0.28;
    const len = 0.26 - Math.abs(t - 0.5) * 0.2 + R() * 0.05;
    const c = [P.beardDark, P.beard, P.beardLight][i % 3];
    put(cone(0.045, len, 5), c, [x, 1.1 - len / 2 - Math.abs(x) * 0.3, 0.23 + (i % 3) * 0.012], jaw,
      { rotation: [180, 0, x * 40] });
  }
  for (const s of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      put(sph(0.04, 6, 5), k % 2 ? P.beard : P.beardLight, [s * 0.07, 1.02 - k * 0.055, 0.27 + 0.01 * k], jaw, { scale: [1, 1.2, 0.9] });
    }
    put(cone(0.03, 0.06, 5), P.beardDark, [s * 0.07, 0.8, 0.28], jaw, { rotation: [180, 0, 0] });
    put(new THREE.TorusGeometry(0.035, 0.008, 5, 8), P.gold, [s * 0.07, 0.96, 0.28], jaw, { rotation: [90, 0, 0] });
    put(sph(0.014, 5, 4), P.gold, [s * 0.07, 0.83, 0.285], jaw);
  }
}
    return buildHeadAndBeard;
  })(),
  // arms
  (() => {
function buildArms({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const SOOT = "#2a1a10";
  const arm = (s: number) => {
    const side = s > 0 ? "L" : "R";
    const sh = J["shoulder" + side], el = J["elbow" + side], wr = J["wrist" + side];
    const fg = J["fingers" + side], th = J["thumb" + side];
    // upper arm + forearm
    b.capsule(sh.at, el.at, 0.075, P.skin, { bone: sh });
    b.capsule(el.at, wr.at, 0.07, P.skin, { bone: el });
    b.ball = undefined;
    b.part(new THREE.SphereGeometry(0.08, 8, 6), P.skin, { bone: el, at: el.at });
    b.part(new THREE.SphereGeometry(0.085, 8, 6), P.skinShade, { bone: sh, at: sh.at });
    // upper-arm highlight and underside strips
    const ua = new THREE.Vector3(...el.at).sub(new THREE.Vector3(...sh.at));
    const uaMid = new THREE.Vector3(...sh.at).addScaledVector(ua, 0.45);
    b.part(new THREE.BoxGeometry(0.03, 0.1, 0.02), P.skinLight, { bone: sh, at: [uaMid.x + s * 0.02, uaMid.y + 0.06, uaMid.z], dir: ua.toArray() });
    // gold armband
    const bm = new THREE.Vector3(...sh.at).addScaledVector(ua, 0.55);
    b.part(new THREE.CylinderGeometry(0.084, 0.084, 0.035, 10), P.gold, { bone: sh, at: bm.toArray(), dir: ua.toArray() });
    // scars
    for (let i = 0; i < 2; i++) {
      const p = new THREE.Vector3(...sh.at).addScaledVector(ua, 0.25 + i * 0.2);
      b.part(new THREE.BoxGeometry(0.018, 0.004, 0.05), P.skinLight, { bone: sh, at: [p.x + s * 0.01, p.y + 0.07, p.z + 0.01], rotation: [0, 0, 30 * s] });
    }
    // bracer
    const fa = new THREE.Vector3(...wr.at).sub(new THREE.Vector3(...el.at));
    const at = (t: number) => new THREE.Vector3(...el.at).addScaledVector(fa, t);
    b.rod(at(0.35).toArray(), at(0.95).toArray(), 0.082, P.leatherDark, { bone: el });
    b.rod(at(0.7).toArray(), at(0.93).toArray(), 0.087, P.leather, { bone: el });
    // steel plate on top
    const pc = at(0.6);
    b.part(new THREE.BoxGeometry(0.07, 0.025, 0.14), P.steel, { bone: el, at: [pc.x, pc.y + 0.075, pc.z], dir: fa.toArray(), axis: "z" });
    b.part(new THREE.BoxGeometry(0.075, 0.008, 0.145), P.gold, { bone: el, at: [pc.x, pc.y + 0.092, pc.z], dir: fa.toArray(), axis: "z" });
    // rivets & lace
    for (let i = 0; i < 3; i++) {
      const q = at(0.45 + i * 0.2);
      b.part(new THREE.SphereGeometry(0.009, 5, 4), P.gold, { bone: el, at: [q.x, q.y + 0.09, q.z] });
      b.part(new THREE.BoxGeometry(0.1, 0.006, 0.01), P.leatherLight, { bone: el, at: [q.x, q.y + 0.01, q.z + 0.0], rotation: [0, 0, 0] });
    }
    // soot
    const sp = at(0.45);
    b.part(new THREE.BoxGeometry(0.04, 0.004, 0.05), SOOT, { bone: el, at: [sp.x + s * 0.03, sp.y + 0.08, sp.z] });
    // fist: palm
    const w = new THREE.Vector3(...wr.at);
    const palm = w.clone().add(new THREE.Vector3(0, 0, 0.03));
    b.part(new THREE.BoxGeometry(0.1, 0.09, 0.07), P.leather, { bone: wr, at: palm.toArray() });
    b.part(new THREE.BoxGeometry(0.104, 0.012, 0.074), P.leatherLight, { bone: wr, at: [palm.x, palm.y + 0.048, palm.z] });
    // fingers curled
    const f0 = new THREE.Vector3(...fg.at);
    for (let i = 0; i < 4; i++) {
      const y = f0.y + 0.04 - i * 0.027;
      b.part(new THREE.BoxGeometry(0.1, 0.024, 0.045), P.leather, { bone: fg, at: [f0.x, y, f0.z + 0.025] });
      b.part(new THREE.BoxGeometry(0.1, 0.016, 0.012), P.leatherDark, { bone: fg, at: [f0.x, y, f0.z + 0.052] });
      b.part(new THREE.SphereGeometry(0.01, 5, 4), P.gold, { bone: fg, at: [f0.x + 0.03 * (i % 2 ? 1 : -1), y, f0.z + 0.0] });
    }
    // knuckle studs on back of hand
    for (let i = -1; i <= 1; i++) b.part(new THREE.SphereGeometry(0.011, 5, 4), P.gold, { bone: wr, at: [w.x + i * 0.03, w.y + 0.05, w.z + 0.04] });
    // thumb
    const t0 = new THREE.Vector3(...th.at);
    b.capsule(t0.toArray(), [t0.x - s * 0.03, t0.y + 0.02, t0.z + 0.04], 0.02, P.skin, { bone: th });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), P.leatherDark, { bone: th, at: [t0.x - s * 0.03, t0.y + 0.02, t0.z + 0.04] });
  };
  arm(1);
  arm(-1);
}
    return buildArms;
  })(),
  // smithingTools
  (() => {
function buildSmithingTools({ b, J, P, M }: any) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---------- Sledgehammer (rides wristR) ----------
  const gripR = V(...(M.gripR as [number, number, number]));
  const hh = V(...(M.hammerHead as [number, number, number]));
  const shaftDir = hh.clone().sub(gripR).normalize();
  const pommelAt = gripR.clone().addScaledVector(shaftDir, -0.1);
  b.rod(pommelAt, hh, 0.021, P.wood, { bone: J.wristR });
  // grip wraps
  for (let i = 0; i < 5; i++) {
    const p = gripR.clone().addScaledVector(shaftDir, -0.06 + i * 0.045);
    b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.02, 8), i % 2 ? P.leatherDark : P.leather, {
      bone: J.wristR, at: p, dir: shaftDir,
    });
  }
  // pommel
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.03, 8), P.woodDark, { bone: J.wristR, at: pommelAt, dir: shaftDir });
  b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), P.gold, {
    bone: J.wristR, at: pommelAt.clone().addScaledVector(shaftDir, 0.02), dir: shaftDir, axis: "z",
  });
  // head: long axis perpendicular to shaft in XY plane
  const across = V(shaftDir.y, -shaftDir.x, 0).normalize();
  if (across.x < 0) across.negate();
  const headRot = { bone: J.wristR, at: hh.clone(), dir: across, axis: "x" as const };
  b.part(box(0.2, 0.1, 0.1), P.steelDark, { ...headRot, at: hh.clone().addScaledVector(shaftDir, -0.012) });
  b.part(box(0.18, 0.09, 0.09), P.steel, { ...headRot, at: hh.clone().addScaledVector(shaftDir, 0.004) });
  b.part(box(0.16, 0.012, 0.07), P.steelLight, { ...headRot, at: hh.clone().addScaledVector(shaftDir, 0.052) });
  for (const s of [1, -1]) {
    const e = hh.clone().addScaledVector(across, s * 0.082);
    b.part(box(0.022, 0.108, 0.108), P.gold, { bone: J.wristR, at: e, dir: across, axis: "x" });
    const f = hh.clone().addScaledVector(across, s * 0.1);
    b.part(box(0.012, 0.075, 0.075), P.steelLight, { bone: J.wristR, at: f, dir: across, axis: "x" });
  }
  // collar on shaft
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), P.iron, {
    bone: J.wristR, at: hh.clone().addScaledVector(shaftDir, -0.07), dir: shaftDir,
  });

  // ---------- Blade ----------
  const bc = V(...(M.bladeCenter as [number, number, number]));
  const tj = V(...(M.tongsJaw as [number, number, number]));
  const bladeOutline: any = [
    [-0.19, -0.035], [0.12, -0.035], [0.19, -0.004, "sharp"], [0.19, 0.012, "sharp"], [0.12, 0.035], [-0.19, 0.035],
  ];
  const bladeAt = V(bc.x, 0.781, bc.z);
  const mk = (sx: number, ex: number, col: string, th: number, y: number) => {
    const o: any = [[sx, -0.034], [ex, -0.034], [ex, 0.034], [sx, 0.034]];
    glow(b.extrude(o, { at: V(bc.x, y, bc.z), x: [1, 0, 0], y: [0, 0, 1], thickness: th, color: col, bone: J.wristL }), 1.6);
  };
  glow(b.extrude(bladeOutline, { at: bladeAt, x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, color: P.ember, bone: J.wristL }), 1.3);
  // note: extrude thickness runs along x×y = -Y; lift so it rests on the face
  mk(-0.18, -0.02, P.emberHot, 0.006, 0.792);
  mk(-0.02, 0.12, P.ember, 0.004, 0.791);
  glow(b.part(box(0.08, 0.004, 0.02), P.emberDark, { bone: J.wristL, at: V(bc.x + 0.15, 0.792, bc.z) }), 1.2);
  glow(b.part(box(0.12, 0.012, 0.02), P.emberHot, { bone: J.wristL, at: V(bc.x - 0.06, 0.795, bc.z) }), 2);
  // tang
  glow(b.part(box(0.08, 0.012, 0.022), P.emberDark, { bone: J.wristL, at: V(bc.x - 0.23, 0.786, bc.z) }), 1.2);
  // scale chips
  const r = rng(5);
  for (let i = 0; i < 4; i++)
    glow(b.part(box(0.015 + r() * 0.01, 0.005, 0.012), i % 2 ? P.ember : P.emberDark, {
      bone: J.wristL, at: V(bc.x - 0.1 + i * 0.07, 0.783, bc.z + 0.06 + r() * 0.04), rotation: [0, r() * 90, 0],
    }), 1.2);

  // ---------- Tongs (rides wristL) ----------
  const gripL = V(...(M.gripL as [number, number, number]));
  const pivot = V(0.19, 0.806, 0.57);
  const back = V(0.29, 0.88, 0.24);
  const jawY = 0.797;
  for (const s of [1, -1]) {
    const hand = back.clone().add(V(-s * 0.035, s * 0.0 + (s > 0 ? 0.02 : -0.03), 0));
    const jaw = V(tj.x - 0.06, jawY + (s > 0 ? 0.012 : -0.0), tj.z + s * 0.012);
    const piv = pivot.clone().add(V(0, s * 0.004, -s * 0.006));
    b.rod(hand, piv, 0.011, P.iron, { bone: J.wristL });
    b.rod(piv, jaw, 0.01, P.iron, { bone: J.wristL });
    b.rod(piv.clone().lerp(jaw, 0.2), piv.clone().lerp(jaw, 0.8), 0.004, P.steelDark, { bone: J.wristL });
    // jaw tip
    b.part(box(0.05, 0.012, 0.008), P.steelDark, { bone: J.wristL, at: V(jaw.x + 0.03, jaw.y, jaw.z - s * 0.003) });
    // leather wraps on handles
    for (let k = 0; k < 3; k++) {
      const p = hand.clone().lerp(piv, 0.12 + k * 0.14);
      b.part(new THREE.SphereGeometry(0.016, 6, 4), k % 2 ? P.leatherDark : P.leather, { bone: J.wristL, at: p });
    }
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.steelDark, { bone: J.wristL, at: hand });
  }
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.03, 8), P.steelDark, { bone: J.wristL, at: pivot, dir: [0, 1, 0] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.034, 6), P.gold, { bone: J.wristL, at: pivot, dir: [0, 1, 0] });

  // ---------- Sparks ----------
  const q = rng(11);
  for (let i = 0; i < 10; i++) {
    const x = -0.02 + q() * 0.34;
    const y = 0.86 + q() * 0.38;
    const z = 0.5 + q() * 0.22;
    const sz = 0.008 + q() * 0.014;
    const g = i % 3 === 0 ? new THREE.TetrahedronGeometry(sz * 1.2) : box(sz, sz, sz);
    glow(b.part(g, i % 2 ? P.emberHot : P.ember, {
      bone: J.wristL, at: V(x, y, z), rotation: [q() * 90, q() * 90, q() * 90],
    }), 2);
  }
}
    return buildSmithingTools;
  })(),
  // anvilAndStump
  (() => {
function buildAnvilAndStump({ b, J, P, M }: any) {
  const bone = J.base;
  const R = rng(5);
  const CX = 0, CZ = M.stumpTop[2];
  const SY = M.stumpTop[1];
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // Stump
  put(cyl(0.33, 0.35, SY, 14), P.wood, [CX, SY / 2, CZ]);
  put(cyl(0.325, 0.325, 0.012, 14), P.leatherLight, [CX, SY + 0.002, CZ]);
  for (const r of [0.1, 0.19, 0.28]) {
    put(new THREE.TorusGeometry(r, 0.004, 4, 20), P.woodDark, [CX, SY + 0.01, CZ], { rotation: [90, 0, 0] });
  }
  // bark ridges
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const h = 0.18 + R() * 0.12;
    put(box(0.035, h, 0.03), P.woodDark, [CX + Math.sin(a) * 0.335, h / 2 + 0.03, CZ + Math.cos(a) * 0.335], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // root flares
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    put(box(0.1, 0.07, 0.16), P.woodDark, [CX + Math.sin(a) * 0.37, 0.035, CZ + Math.cos(a) * 0.37], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // iron hoop
  put(cyl(0.345, 0.345, 0.04, 14), P.iron, [CX, SY - 0.07, CZ]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    put(new THREE.SphereGeometry(0.01, 5, 4), P.gold, [CX + Math.sin(a) * 0.347, SY - 0.07, CZ + Math.cos(a) * 0.347]);
  }
  // chips
  for (let i = 0; i < 3; i++) put(box(0.04, 0.015, 0.03), P.woodDark, [-0.3 + i * 0.3, 0.008, CZ + 0.4 + R() * 0.05], { rotation: [0, R() * 90, 0] });

  // Anvil
  put(box(0.4, 0.04, 0.2), P.iron, [0, SY + 0.02, CZ]);
  for (const s of [1, -1]) put(box(0.08, 0.05, 0.22), P.steelDark, [s * 0.17, SY + 0.06, CZ]);
  put(box(0.3, 0.2, 0.12), P.iron, [0, SY + 0.17, CZ]);
  put(box(0.26, 0.04, 0.14), P.steelDark, [0, SY + 0.29, CZ]);
  // face plate
  const faceY = 0.78;
  put(box(0.4, 0.1, 0.2), P.steel, [-0.05, faceY - 0.05, CZ]);
  put(box(0.4, 0.012, 0.2), P.steelLight, [-0.05, faceY - 0.006, CZ]);
  put(box(0.4, 0.012, 0.21), P.gold, [-0.05, faceY - 0.1, CZ]);
  // heel step
  put(box(0.14, 0.07, 0.2), P.steel, [-0.28, faceY - 0.075, CZ]);
  put(box(0.14, 0.01, 0.2), P.steelLight, [-0.28, faceY - 0.038, CZ]);
  // holes
  put(cyl(0.022, 0.022, 0.004, 10), P.ink, [-0.28, faceY - 0.037, CZ]);
  put(cyl(0.012, 0.012, 0.004, 8), P.ink, [-0.2, faceY + 0.001, CZ + 0.05]);
  // horn
  put(new THREE.ConeGeometry(0.085, 0.3, 10), P.steel, [0.41, faceY - 0.06, CZ], { rotation: [0, 0, -90] });
  put(cyl(0.085, 0.085, 0.012, 10), P.steelLight, [0.15, faceY - 0.06, CZ], { rotation: [0, 0, 90] });
  put(new THREE.ConeGeometry(0.03, 0.08, 8), P.steelLight, [0.52, faceY - 0.06, CZ], { rotation: [0, 0, -90] });
  // maker's mark
  put(box(0.05, 0.03, 0.006), P.gold, [-0.05, faceY - 0.05, CZ + 0.102]);
  put(box(0.02, 0.012, 0.007), P.goldDark, [-0.05, faceY - 0.05, CZ + 0.103]);
  // scratches and scorch
  for (let i = 0; i < 4; i++) put(box(0.03, 0.002, 0.004), P.steelDark, [-0.15 + i * 0.07, faceY - 0.03 - R() * 0.03, CZ + 0.102], { rotation: [0, 0, R() * 60 - 30] });
  put(box(0.1, 0.002, 0.07), P.ink, [0.08, faceY + 0.0005, CZ - 0.02]);
  put(box(0.05, 0.002, 0.05), P.ink, [-0.1, faceY + 0.0005, CZ + 0.04]);
  for (const dz of [-0.07, 0.07]) glow(put(box(0.14, 0.002, 0.008), P.ember, [0.1, faceY + 0.0008, CZ + dz]), 0.8);

  // Coal pile
  [[-0.35, 0.85, 0.05], [-0.28, 0.9, 0.04], [-0.4, 0.92, 0.035]].forEach(([x, z, r], i) => {
    put(new THREE.DodecahedronGeometry(r, 0), P.ink, [x, r * 0.8, z], { rotation: [i * 20, i * 40, 0] });
    glow(put(box(0.012, 0.008, 0.012), P.ember, [x + 0.01, r * 1.5, z + 0.01]), 1.2);
  });
}
    return buildAnvilAndStump;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith" });
  const J: Record<string, Joint> = {};
  J["base"] = b.joint("base", { at: [0,0,0.3], dir: [0,1,0] });
  J["hips"] = b.joint("hips", { parent: J["base"], at: [0,0.6,-0.02], dir: [0,1,0], role: "spine" });
  J["spine1"] = b.joint("spine1", { parent: J["hips"], at: [0,0.72,0], dir: [0,1,0.1], role: "spine" });
  J["spine2"] = b.joint("spine2", { parent: J["spine1"], at: [0,0.92,0.03], dir: [0,1,0.1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["spine2"], at: [0,1.1,0.05], dir: [0,1,0.3], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.18,0.08], dir: [0,1,0.15], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.22,0.06], dir: [0,-0.3,1], role: "jaw" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.14,0.58,-0.02], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.15,0.33,0.04], dir: [0,-1,-0.1], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.15,0.1,-0.02], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["toeL"] = b.joint("toeL", { parent: J["ankleL"], at: [0.15,0.05,0.1], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.14,0.58,-0.02], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.15,0.33,0.04], dir: [0,-1,-0.1], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.15,0.1,-0.02], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["toeR"] = b.joint("toeR", { parent: J["ankleR"], at: [-0.15,0.05,0.1], dir: [0,0,1], role: "leg", group: "legs" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["spine2"], at: [0.33,1.05,0], dir: [0.3,-0.8,0.5], role: "arm", group: "arms" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.415,0.83,0.14], dir: [-0.45,0.2,0.95], role: "arm", group: "arms" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.3,0.88,0.38], dir: [-0.1,-0.1,1], role: "arm", group: "arms" });
  J["fingersL"] = b.joint("fingersL", { parent: J["wristL"], at: [0.29,0.87,0.44], dir: [0,-0.1,1], role: "digit", group: "arms" });
  J["thumbL"] = b.joint("thumbL", { parent: J["wristL"], at: [0.25,0.88,0.42], dir: [-0.5,0,0.8], role: "digit", group: "arms" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["spine2"], at: [-0.33,1.05,0], dir: [-0.3,-0.5,0.8], role: "arm", group: "arms" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.415,0.91,0.226], dir: [0.5,0.25,0.65], role: "arm", group: "arms" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.28,0.98,0.4], dir: [0.5,0.3,0.4], role: "arm", group: "arms" });
  J["fingersR"] = b.joint("fingersR", { parent: J["wristR"], at: [-0.26,1,0.43], dir: [0.5,0.3,0.4], role: "digit", group: "arms" });
  J["thumbR"] = b.joint("thumbR", { parent: J["wristR"], at: [-0.3,1,0.43], dir: [0.2,0.4,0.7], role: "digit", group: "arms" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
