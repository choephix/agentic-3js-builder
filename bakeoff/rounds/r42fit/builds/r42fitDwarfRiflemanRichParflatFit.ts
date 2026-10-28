import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Dwarf Rifleman",
  "description": "A stout Warcraft-style dwarf rifleman with a braided beard, riveted plate armor and a flared brass blunderbuss, standing in a neutral rig pose."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#d9936a",
  skinShade: "#b8704c",
  beard: "#c2501e",
  beardLight: "#e8802f",
  beardTip: "#f0b050",
  steel: "#6f7a8c",
  steelDark: "#3c4452",
  blueCloth: "#2b4a8c",
  leather: "#6b4224",
  leatherDark: "#3e2614",
  brass: "#d9a638",
  brassDark: "#8f6a1e",
  wood: "#7a4a26",
  woodDark: "#4e2e16",
  iron: "#2e3138",
  eyeWhite: "#f4efe6",
  eyeBlue: "#3a8ad8",
  ink: "#1c1410",
  red: "#b3261e",
  glow: "#ffb347",
};
const M = {
  pelvis: [0, 0.62, 0] as [number, number, number],
  chest: [0, 0.88, 0] as [number, number, number],
  neck: [0, 1.08, 0.02] as [number, number, number],
  headCenter: [0, 1.2, 0.04] as [number, number, number],
  shoulderL: [0.27, 1, 0] as [number, number, number],
  shoulderR: [-0.27, 1, 0] as [number, number, number],
  handL: [0.5, 0.72, 0.28] as [number, number, number],
  handR: [-0.4, 0.78, 0.3] as [number, number, number],
  hipL: [0.12, 0.6, 0] as [number, number, number],
  hipR: [-0.12, 0.6, 0] as [number, number, number],
  footL: [0.14, 0.06, 0.04] as [number, number, number],
  footR: [-0.14, 0.06, 0.04] as [number, number, number],
  backMount: [0, 0.9, -0.17] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // headBeard
  (() => {
function buildHeadBeard({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw;
  const R = rng(11);
  const HC = [0, 1.2, 0.04] as [number, number, number];
  const own = ["#8a929e", "#5a2a14", "#ffd070", "#2a1a10"];
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot, ...o });
  const sph = (r: number, c: string, at: number[], bone: any, sc?: number[], seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), c, { bone, at, scale: sc });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], bone: any, rot?: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, rotation: rot });

  // skull and face
  box(0.27, 0.22, 0.25, P.skin, [0, 1.2, 0.04], head);
  sph(0.15, P.skin, [0, 1.19, 0.04], head, [1, 0.95, 0.95], 10);
  // brow ridge
  box(0.29, 0.045, 0.07, P.ink, [0, 1.255, 0.165], head);
  box(0.28, 0.03, 0.06, P.skinShade, [0, 1.285, 0.15], head);
  for (const s of [1, -1]) {
    box(0.12, 0.04, 0.06, P.ink, [s * 0.075, 1.262, 0.17], head, [0, 0, s * -8]);
    // eyes
    sph(0.04, P.ink, [s * 0.07, 1.22, 0.165], head, [1.25, 1, 0.5], 8);
    sph(0.033, P.eyeWhite, [s * 0.07, 1.22, 0.172], head, [1.2, 1, 0.5], 8);
    sph(0.02, P.eyeBlue, [s * 0.07, 1.22, 0.186], head, [1, 1, 0.5], 8);
    sph(0.01, P.ink, [s * 0.07, 1.22, 0.192], head, [1, 1, 0.5], 6);
    sph(0.006, P.eyeWhite, [s * 0.077, 1.228, 0.195], head, undefined, 4);
    // cheeks, ears
    sph(0.06, P.skinShade, [s * 0.095, 1.15, 0.12], head, [1, 0.8, 0.8], 8);
    sph(0.04, P.skin, [s * 0.15, 1.19, 0.03], head, [0.5, 1.2, 1], 8);
    sph(0.022, P.skinShade, [s * 0.155, 1.19, 0.035], head, [0.4, 1, 1], 6);
    // sideburns
    box(0.03, 0.12, 0.1, P.beard, [s * 0.14, 1.12, 0.06], head);
  }
  // nose
  sph(0.05, P.skinShade, [0, 1.15, 0.2], head, [1, 0.9, 1], 8);
  sph(0.04, P.skin, [0, 1.155, 0.215], head, [1.1, 0.95, 1], 8);
  box(0.04, 0.07, 0.05, P.skin, [0, 1.2, 0.18], head);

  // upper jaw / lip block on head, lower jaw on jaw
  box(0.2, 0.04, 0.1, P.skin, [0, 1.105, 0.13], head);
  box(0.19, 0.035, 0.09, P.skinShade, [0, 1.12, 0.12], jaw);
  box(0.2, 0.045, 0.11, P.skin, [0, 1.085, 0.11], jaw);
  box(0.15, 0.012, 0.05, P.ink, [0, 1.103, 0.15], jaw);
  // moustache
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.03, 0.14, 6), P.beardLight, { bone: head, at: [s * 0.07, 1.12, 0.185], rotation: [0, 0, s * -80] });
    b.part(new THREE.ConeGeometry(0.022, 0.1, 6), P.beard, { bone: head, at: [s * 0.14, 1.105, 0.17], rotation: [0, 0, s * -125] });
  }
  sph(0.045, P.beardLight, [0, 1.125, 0.19], head, [1.5, 0.7, 0.8], 8);

  // beard mass
  sph(0.17, P.beard, [0, 1.02, 0.1], jaw, [1.05, 1.2, 0.9], 10);
  box(0.3, 0.2, 0.18, P.beard, [0, 0.94, 0.12], jaw);
  b.part(new THREE.ConeGeometry(0.17, 0.14, 8), P.beard, { bone: jaw, at: [0, 0.93, 0.14], rotation: [180, 0, 0], scale: [1.1, 1, 0.65] });
  // blades
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const x = (t - 0.5) * 0.32;
    const y = 1.0 - Math.abs(t - 0.5) * 0.1 - R() * 0.05;
    const len = 0.08 + (1 - Math.abs(t - 0.5) * 2) * 0.05 + R() * 0.01;
    const col = i % 3 === 0 ? P.beardLight : i % 3 === 1 ? P.beard : P.beardTip;
    b.part(new THREE.ConeGeometry(0.03, len, 5), col, {
      bone: jaw, at: [x, y - len / 2 + 0.02, 0.19 - Math.abs(x) * 0.3 + (i % 2) * 0.012],
      rotation: [180 + 8, 0, x * -60], scale: [1, 1, 0.5],
    });
  }
  for (let i = 0; i < 8; i++) {
    const x = (i / 7 - 0.5) * 0.26;
    b.part(new THREE.ConeGeometry(0.022, 0.12, 5), P.beardTip, { bone: jaw, at: [x, 0.92 + R() * 0.02, 0.15], rotation: [180, 0, 0], scale: [1, 1, 0.5] });
  }
  // two braids
  for (const s of [1, -1]) {
    const bx = s * 0.07;
    for (let i = 0; i < 6; i++) {
      const y = 0.99 - i * 0.022;
      sph(0.026 - i * 0.001, i % 2 ? P.beard : P.beardLight, [bx + (i % 2 ? 0.008 : -0.008) * s, y, 0.22 - i * 0.004], jaw, [1, 0.8, 1], 6);
    }
    cyl(0.032, 0.032, 0.014, own[2], [bx, 0.97, 0.22], jaw, undefined, 8);
    cyl(0.026, 0.026, 0.014, own[2], [bx, 0.885, 0.215], jaw, undefined, 8);
    b.part(new THREE.ConeGeometry(0.024, 0.04, 6), P.beardTip, { bone: jaw, at: [bx, 0.875, 0.21], rotation: [180, 0, 0] });
  }

  // helmet
  const hb = b.lathe([[0, 0], [0.175, 0], [0.18, 0.03], [0.15, 0.09], [0.08, 0.125], [0, 0.14]], { at: [0, 1.26, 0.04], bone: head, color: P.steel, segments: 12 });
  b.lathe([[0.17, 0], [0.205, 0], [0.205, 0.02], [0.17, 0.025]], { at: [0, 1.27, 0.04], bone: head, color: P.brass, segments: 12 });
  box(0.04, 0.03, 0.2, P.brassDark, [0, 1.385, 0.04], head);
  b.extrude([[0, 0], [0.22, 0], [0.2, 0.04], [0.12, 0.05], [0.02, 0.04]], { at: [0, 1.34, -0.1], x: [0, 0, 1], thickness: 0.025, color: P.brass, bone: head });
  box(0.035, 0.1, 0.01, P.steelDark, [0, 1.3, 0.222], head);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    sph(0.01, P.brass, [Math.sin(a) * 0.188, 1.3, 0.04 + Math.cos(a) * 0.188], head, undefined, 4);
  }
  // neck
  cyl(0.09, 0.1, 0.1, P.skinShade, [0, 1.08, 0.03], J.neck);
}
    return buildHeadBeard;
  })(),
  // torsoArmor
  (() => {
function buildTorsoArmor({ b, J, P, M }: any) {
  const R = rng(5);
  const hips = J.hips, spine = J.spine, chest = J.chest;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, rotation: rot });
  const sph = (r: number, c: string, at: number[], bone: any, scale?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), c, { bone, at, scale });

  // Barrel torso (cloth)
  cyl(0.26, 0.3, 0.3, 14, P.blueCloth, [0, 0.76, 0], spine).scale.set(1, 1, 0.75);
  cyl(0.34, 0.27, 0.28, 14, P.blueCloth, [0, 0.98, 0], chest).scale.set(1, 1, 0.72);
  cyl(0.3, 0.3, 0.14, 14, P.blueCloth, [0, 0.64, 0], hips).scale.set(1, 1, 0.75);

  // Breastplate
  const plate = box(0.4, 0.3, 0.05, P.steel, [0, 0.98, 0.2], chest);
  box(0.42, 0.04, 0.06, P.steelDark, [0, 1.13, 0.2], chest);
  box(0.42, 0.04, 0.06, P.steelDark, [0, 0.83, 0.2], chest);
  for (const s of [1, -1]) for (const y of [0.9, 1.06]) sph(0.014, P.brass, [s * 0.17, y, 0.23], chest);
  // Emblem: crossed rifles
  cyl(0.012, 0.012, 0.24, 6, P.brass, [0, 0.98, 0.235], chest, [0, 0, 55]);
  cyl(0.012, 0.012, 0.24, 6, P.brass, [0, 0.98, 0.24], chest, [0, 0, -55]);
  sph(0.025, P.brassDark, [0, 0.98, 0.245], chest);

  // Harness straps
  for (const s of [1, -1]) {
    box(0.05, 0.4, 0.02, P.leather, [s * 0.16, 0.98, 0.232], chest, [0, 0, s * -12]);
    box(0.05, 0.4, 0.02, P.leather, [s * 0.16, 0.98, -0.215], chest, [0, 0, s * -12]);
  }
  box(0.4, 0.04, 0.02, P.leatherDark, [0, 1.08, 0.235], chest);

  // Belt, buckle, pouches
  cyl(0.31, 0.31, 0.09, 16, P.leatherDark, [0, 0.7, 0], spine).scale.set(1, 1, 0.78);
  box(0.12, 0.09, 0.03, P.brass, [0, 0.7, 0.245], spine);
  box(0.07, 0.05, 0.035, P.brassDark, [0, 0.7, 0.255], spine);
  for (const s of [1, -1]) {
    box(0.09, 0.1, 0.06, P.leather, [s * 0.21, 0.66, 0.2], hips, [0, s * -20, 0]);
    box(0.09, 0.03, 0.065, P.leatherDark, [s * 0.21, 0.7, 0.2], hips, [0, s * -20, 0]);
    sph(0.012, P.brass, [s * 0.21, 0.67, 0.235], hips);
  }
  // Tassets
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) {
    const a = s * (0.08 + i * 0.1);
    box(0.09, 0.14, 0.03, i === 1 ? P.steelDark : P.steel, [a * 1.3, 0.6, 0.22 - i * 0.03], hips, [0, s * -i * 25, 0]);
  }

  // Pauldrons
  for (const s of [1, -1]) {
    const bone = s > 0 ? J.shoulderL : J.shoulderR;
    sph(0.15, P.steel, [s * 0.3, 1.04, 0], bone, [1.1, 0.75, 1.1]);
    cyl(0.16, 0.16, 0.025, 14, P.brass, [s * 0.3, 1.0, 0], bone, [0, 0, s * -10]);
    cyl(0.14, 0.15, 0.03, 14, P.brass, [s * 0.3, 1.1, 0], bone);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      sph(0.012, P.brassDark, [s * 0.3 + Math.cos(a) * 0.12, 1.1, Math.sin(a) * 0.12], bone);
    }
    b.part(new THREE.ConeGeometry(0.04, 0.12, 8), P.steelDark, { bone, at: [s * 0.3, 1.19, 0] });
    b.part(new THREE.ConeGeometry(0.03, 0.09, 6), P.steelDark, { bone, at: [s * 0.4, 1.1, 0], rotation: [0, 0, s * -80] });
  }

  // Backpack
  box(0.3, 0.34, 0.14, P.leather, [0, 0.92, -0.23], chest);
  box(0.32, 0.1, 0.16, P.leatherDark, [0, 1.06, -0.23], chest);
  box(0.24, 0.2, 0.04, P.leatherDark, [0, 0.88, -0.31], chest);
  for (const s of [1, -1]) {
    box(0.04, 0.3, 0.02, P.leatherDark, [s * 0.09, 0.9, -0.31], chest);
    sph(0.016, P.brass, [s * 0.09, 0.82, -0.325], chest);
  }
  // Bedroll
  cyl(0.06, 0.06, 0.36, 10, P.blueCloth, [0, 0.74, -0.24], chest, [0, 0, 90]);
  for (const x of [-0.1, 0.1]) cyl(0.063, 0.063, 0.025, 10, P.leatherDark, [x, 0.74, -0.24], chest, [0, 0, 90]);
  cyl(0.045, 0.045, 0.02, 10, P.red, [0.19, 0.74, -0.24], chest, [0, 0, 90]);
  // Powder horn
  const hornBone = chest;
  b.part(new THREE.ConeGeometry(0.04, 0.2, 8), P.woodDark, { bone: hornBone, at: [-0.24, 0.82, -0.22], rotation: [0, 0, 130] });
  cyl(0.042, 0.042, 0.03, 8, P.brass, [-0.19, 0.89, -0.22], hornBone, [0, 0, 130]);
  box(0.02, 0.2, 0.01, P.leather, [-0.2, 0.95, -0.2], chest, [0, 0, 30]);
}
    return buildTorsoArmor;
  })(),
  // legsBoots
  (() => {
function buildLegsBoots({ b, J, P, M }: Ctx) {
  const R = rng(5);
  for (const s of [1, -1]) {
    const hip = J[s > 0 ? "hipL" : "hipR"];
    const knee = J[s > 0 ? "kneeL" : "kneeR"];
    const ank = J[s > 0 ? "ankleL" : "ankleR"];
    const x = s * 0.13;

    // thigh: tapered leather trousers
    b.rod([x, 0.6, 0.0], [s * 0.135, 0.34, 0.03], [0.095, 0.075], P.leather, { bone: hip, sides: 8 });
    // hip cap / thigh bulk
    b.part(new THREE.SphereGeometry(0.1, 8, 6), P.leather, { bone: hip, at: [x, 0.6, 0] });
    // thigh seam and strap
    b.part(new THREE.CylinderGeometry(0.083, 0.083, 0.03, 8), P.leatherDark, { bone: hip, at: [s * 0.132, 0.46, 0.015] });
    b.part(new THREE.BoxGeometry(0.02, 0.2, 0.02), P.leatherDark, { bone: hip, at: [x + s * 0.0, 0.5, 0.085], rotation: [-5, 0, 0] });
    // shin
    b.rod([s * 0.135, 0.34, 0.03], [s * 0.14, 0.14, 0.01], [0.075, 0.07], P.leatherDark, { bone: knee, sides: 8 });
    // knee plate
    b.part(new THREE.SphereGeometry(0.085, 8, 6), P.steel, { bone: knee, at: [s * 0.135, 0.34, 0.085], scale: [1.05, 1, 0.55] });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.025, 8), P.steelDark, { bone: knee, at: [s * 0.135, 0.34, 0.035], rotation: [0, 0, 90] });
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.03), P.steelDark, { bone: knee, at: [s * 0.135, 0.405, 0.075] });
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.03), P.steelDark, { bone: knee, at: [s * 0.135, 0.275, 0.075] });
    for (const dx of [-0.04, 0.04]) for (const dy of [-0.03, 0.03])
      b.part(new THREE.SphereGeometry(0.01, 5, 4), P.brass, { bone: knee, at: [s * 0.135 + dx, 0.34 + dy, 0.118] });

    // boot shaft
    b.part(new THREE.CylinderGeometry(0.085, 0.09, 0.15, 8), P.leather, { bone: ank, at: [x + s * 0.01, 0.14, 0.0] });
    // cuff
    b.part(new THREE.CylinderGeometry(0.1, 0.095, 0.04, 8), P.leatherDark, { bone: ank, at: [x + s * 0.01, 0.225, 0] });
    b.part(new THREE.CylinderGeometry(0.102, 0.102, 0.008, 8), P.brass, { bone: ank, at: [x + s * 0.01, 0.245, 0] });
    // foot
    b.part(new THREE.BoxGeometry(0.15, 0.09, 0.22), P.leather, { bone: ank, at: [x + s * 0.01, 0.075, 0.07] });
    // toe cap
    b.part(new THREE.SphereGeometry(0.078, 8, 6), P.leatherDark, { bone: ank, at: [x + s * 0.01, 0.07, 0.15], scale: [1, 0.8, 0.85] });
    b.part(new THREE.BoxGeometry(0.152, 0.02, 0.05), P.steel, { bone: ank, at: [x + s * 0.01, 0.04, 0.2] });
    // sole + heel
    b.part(new THREE.BoxGeometry(0.17, 0.035, 0.27), P.iron, { bone: ank, at: [x + s * 0.01, 0.0175, 0.075] });
    b.part(new THREE.BoxGeometry(0.15, 0.04, 0.07), P.woodDark, { bone: ank, at: [x + s * 0.01, 0.05, -0.05] });
    // straps and buckles
    for (const y of [0.12, 0.185]) {
      b.part(new THREE.CylinderGeometry(0.092, 0.092, 0.022, 8), P.leatherDark, { bone: ank, at: [x + s * 0.01, y, 0] });
      b.part(new THREE.BoxGeometry(0.035, 0.03, 0.012), P.brass, { bone: ank, at: [x + s * 0.01 + s * 0.04, y, 0.082] });
      b.part(new THREE.BoxGeometry(0.018, 0.016, 0.014), P.brassDark, { bone: ank, at: [x + s * 0.01 + s * 0.04, y, 0.086] });
    }
    // instep strap
    b.part(new THREE.BoxGeometry(0.155, 0.02, 0.03), P.leatherDark, { bone: ank, at: [x + s * 0.01, 0.12, 0.09], rotation: [-30, 0, 0] });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.012), P.brass, { bone: ank, at: [x + s * 0.01, 0.12, 0.103], rotation: [-30, 0, 0] });
    // mud flecks
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(0.03, 0.015, 0.03), P.woodDark, { bone: ank, at: [x + (R() - 0.5) * 0.12, 0.04, 0.0 + R() * 0.15] });
  }
}
    return buildLegsBoots;
  })(),
  // armsHands
  (() => {
function buildArmsHands({ b, J, P, M }: Ctx) {
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const rand = rng(11);
  const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = J["shoulder" + side];
    const el = J["elbow" + side];
    const wr = J["wrist" + side];
    const shP = sh.at.clone();
    const elP = el.at.clone();
    const wrP = wr.at.clone();

    // sleeves (cloth)
    b.capsule(shP, elP, [0.075, 0.065], P.blueCloth, { bone: sh, sides: 8 });
    b.capsule(elP, wrP, [0.065, 0.055], P.blueCloth, { bone: el, sides: 8 });

    // elbow guard
    b.part(ball(0.07, 8, 6), P.steel, { bone: el, at: elP, scale: [1, 0.9, 1] });
    const spikeDir = elP.clone().sub(shP).add(wrP.clone().sub(elP)).normalize().add(new THREE.Vector3(s * 1.2, 0.4, -0.6)).normalize();
    b.spike(elP.clone().addScaledVector(spikeDir, 0.05), spikeDir, 0.07, 0.025, P.brass, { bone: el, sides: 6 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      b.part(ball(0.009, 5, 4), P.brass, {
        bone: el,
        at: elP.clone().add(new THREE.Vector3(Math.cos(a) * 0.065 * 0.9, Math.sin(a) * 0.05, Math.sin(a + 1) * 0.04 + 0.04)),
      });
    }

    // vambrace
    const vs = elP.clone().lerp(wrP, 0.3);
    const ve = elP.clone().lerp(wrP, 0.95);
    b.rod(vs, ve, [0.075, 0.068], P.steel, { bone: el, sides: 8 });
    for (const t of [0.35, 0.7]) {
      const p = elP.clone().lerp(wrP, t);
      b.part(new THREE.TorusGeometry(0.075 - 0.006 * t * 2 + 0.004, 0.008, 5, 10), P.steelDark, {
        bone: el, at: p, dir: wrP.clone().sub(elP), axis: "z",
      });
    }
    // rivets along vambrace top
    for (let i = 0; i < 4; i++) {
      const p = elP.clone().lerp(wrP, 0.4 + i * 0.15).add(new THREE.Vector3(0, 0.07, 0));
      b.part(ball(0.009, 5, 4), P.brass, { bone: el, at: p });
    }
    // brass cuff
    const cuffAt = elP.clone().lerp(wrP, 0.97);
    b.part(new THREE.CylinderGeometry(0.08, 0.075, 0.03, 10), P.brass, {
      bone: wr, at: cuffAt, dir: wrP.clone().sub(elP),
    });
    b.part(new THREE.TorusGeometry(0.078, 0.007, 5, 12), P.brassDark, {
      bone: wr, at: cuffAt.clone().addScaledVector(wrP.clone().sub(elP).normalize(), 0.018), dir: wrP.clone().sub(elP), axis: "z",
    });

    // shoulder sleeve ring
    b.part(new THREE.TorusGeometry(0.08, 0.01, 5, 10), P.leatherDark, {
      bone: sh, at: shP.clone().lerp(elP, 0.35), dir: elP.clone().sub(shP), axis: "z",
    });

    // hand
    const fwd = wrP.clone().sub(elP).normalize();
    const handC = wrP.clone().addScaledVector(fwd, 0.05).add(new THREE.Vector3(0, -0.005, 0));
    b.part(new THREE.BoxGeometry(0.1, 0.045, 0.09), P.leather, { bone: wr, at: handC, dir: fwd, axis: "z", up: [0, 1, 0] });
    // back-of-hand plate
    b.part(new THREE.BoxGeometry(0.09, 0.012, 0.07), P.steel, {
      bone: wr, at: handC.clone().add(new THREE.Vector3(0, 0.027, 0)), dir: fwd, axis: "z",
    });
    b.part(ball(0.008, 5, 4), P.brass, { bone: wr, at: handC.clone().add(new THREE.Vector3(0, 0.036, 0.0)) });

    const right = new THREE.Vector3(-1, 0, 0);
    const curl = side === "R" ? 0.9 : 0.2; // right hand grips
    for (let f = 0; f < 4; f++) {
      const off = (f - 1.5) * 0.024;
      const base = handC.clone().addScaledVector(fwd, 0.045).addScaledVector(right, off).add(new THREE.Vector3(0, 0.0, 0));
      const len = [0.035, 0.04, 0.042, 0.034][f];
      const d1 = fwd.clone().add(new THREE.Vector3(0, -curl * 0.5, 0)).normalize();
      const k1 = base.clone().addScaledVector(d1, len);
      const d2 = fwd.clone().add(new THREE.Vector3(0, -curl * 1.6, 0)).normalize();
      const k2 = k1.clone().addScaledVector(d2, len * 0.85);
      b.capsule(base, k1, 0.0125, P.leather, { bone: wr, sides: 6 });
      b.capsule(k1, k2, 0.0115, P.leatherDark, { bone: wr, sides: 6 });
      b.part(ball(0.009, 5, 4), P.steelDark, { bone: wr, at: k1.clone().add(new THREE.Vector3(0, 0.01, 0)) });
    }
    // thumb
    const tb = handC.clone().addScaledVector(right, -s * 0.0).add(new THREE.Vector3(s * 0.045, 0.0, -0.01));
    const td = new THREE.Vector3(s * 0.6, -0.1 - curl * 0.2, 0.9).normalize();
    const t1 = tb.clone().addScaledVector(td, 0.04);
    const t2 = t1.clone().addScaledVector(td.clone().add(new THREE.Vector3(0, -curl * 0.4, 0.3)).normalize(), 0.035);
    b.capsule(tb, t1, 0.0145, P.leather, { bone: wr, sides: 6 });
    b.capsule(t1, t2, 0.0125, P.leatherDark, { bone: wr, sides: 6 });
    // knuckle studs
    for (let f = 0; f < 4; f++) {
      b.part(ball(0.007, 5, 4), P.brassDark, {
        bone: wr,
        at: handC.clone().addScaledVector(fwd, 0.04).addScaledVector(right, (f - 1.5) * 0.024).add(new THREE.Vector3(0, 0.026, 0)),
      });
    }
  }
}
    return buildArmsHands;
  })(),
  // blunderbuss
  (() => {
function buildBlunderbuss({ b, J, P, M }: Ctx) {
  const bone = J.wristR;
  // Gun axis: butt at z=-0.1, muzzle at z=0.7, drops slightly in y.
  const X = -0.4;
  const pt = (z: number): [number, number, number] => [X, 0.78 + (0.1 - z) * 0.07, z];
  const dir: [number, number, number] = [0, -0.07, 1];
  const along = (z: number, dy = 0, dx = 0): [number, number, number] => {
    const p = pt(z);
    return [p[0] + dx, p[1] + dy, p[2]];
  };
  const cyl = (r0: number, r1: number, h: number, n = 10) => new THREE.CylinderGeometry(r1, r0, h, n);
  const put = (g: THREE.BufferGeometry, color: string, at: number[], d: number[] = dir, axis: "x" | "y" | "z" = "y") =>
    b.part(g, color, { bone, at: at as [number, number, number], dir: d as [number, number, number], axis });

  // Barrel (iron), z 0.12..0.5
  b.rod(along(0.1), along(0.5), 0.022, P.iron, { bone });
  // Flared bell muzzle (brass)
  b.rod(along(0.5), along(0.69), [0.024, 0.075], P.brass, { bone, sides: 12 });
  // dark hole
  put(new THREE.CircleGeometry(0.063, 12), P.ink, along(0.692, 0, 0), dir, "z");
  put(new THREE.TorusGeometry(0.072, 0.01, 5, 12), P.brassDark, along(0.688), dir, "z");
  // Barrel bands and rivets
  for (const z of [0.16, 0.28, 0.4, 0.52]) {
    put(new THREE.TorusGeometry(z > 0.5 ? 0.034 : 0.026, 0.008, 5, 10), P.brass, along(z), dir, "z");
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    put(new THREE.SphereGeometry(0.006, 5, 4), P.brassDark, along(0.66, Math.cos(a) * 0.066, Math.sin(a) * 0.066));
  }
  // Stock: butt to wrist
  b.frustumBox(along(-0.1), along(0.14), [0.05, 0.12], [0.05, 0.07], { bone, color: P.wood });
  b.frustumBox(along(-0.1, -0.04), along(-0.1, 0.1), [0.04, 0.02], [0.04, 0.02], { bone, color: P.wood });
  put(new THREE.BoxGeometry(0.056, 0.14, 0.015), P.brass, along(-0.105, 0.0));
  put(new THREE.BoxGeometry(0.03, 0.09, 0.004), P.woodDark, along(0.0, 0.0, 0.026));
  put(new THREE.BoxGeometry(0.03, 0.09, 0.004), P.woodDark, along(0.0, 0.0, -0.026));
  // Grip (wrist) beneath
  put(new THREE.BoxGeometry(0.045, 0.1, 0.05), P.wood, along(0.08, -0.07), [0, 1, 0.3]);
  // Lock plate
  put(new THREE.BoxGeometry(0.01, 0.045, 0.1), P.brassDark, along(0.14, 0.01, 0.03));
  put(new THREE.BoxGeometry(0.01, 0.045, 0.1), P.brassDark, along(0.14, 0.01, -0.03));
  // Flintlock pan, hammer
  put(new THREE.BoxGeometry(0.03, 0.014, 0.03), P.iron, along(0.1, 0.035, -0.012));
  put(new THREE.BoxGeometry(0.014, 0.07, 0.014), P.iron, along(0.065, 0.065, -0.012), [0, 1, -0.5]);
  put(new THREE.BoxGeometry(0.018, 0.03, 0.012), P.steel, along(0.04, 0.095, -0.012), [0, 1, -1]);
  put(new THREE.SphereGeometry(0.009, 5, 4), P.glow, along(0.1, 0.045, -0.012));
  // Trigger and guard
  put(new THREE.BoxGeometry(0.008, 0.03, 0.008), P.iron, along(0.05, -0.04), [0, 1, 0.3]);
  put(new THREE.TorusGeometry(0.035, 0.005, 4, 10, Math.PI), P.brass, along(0.065, -0.035), [1, 0, 0], "z");
  // Fore-stock under barrel
  b.frustumBox(along(0.2, -0.04), along(0.46, -0.04), [0.05, 0.04], [0.05, 0.04], { bone, color: P.wood });
  put(new THREE.BoxGeometry(0.058, 0.01, 0.02), P.brass, along(0.46, -0.04));
  put(new THREE.BoxGeometry(0.058, 0.01, 0.02), P.brass, along(0.2, -0.04));
  // Sling strap with rings
  put(new THREE.TorusGeometry(0.014, 0.004, 4, 8), P.brass, along(-0.06, -0.06, -0.03), [1, 0, 0], "z");
  put(new THREE.TorusGeometry(0.014, 0.004, 4, 8), P.brass, along(0.3, -0.07, -0.0), [1, 0, 0], "z");
  b.rod(along(-0.06, -0.075, -0.03), along(0.3, -0.085), 0.005, P.leather, { bone, sides: 4 });
}
    return buildBlunderbuss;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.62,0], dir: [0,1,0], role: "spine" });
  J["spine"] = b.joint("spine", { parent: J["hips"], at: [0,0.72,0], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine"], at: [0,0.88,0], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.06,0.02], dir: [0,1,0], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.12,0.03], dir: [0,1,0], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.15,0.08], dir: [0,0,1], role: "jaw" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.27,1,0], dir: [1,-0.5,0.2], role: "arm", group: "armL" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.4,0.88,0.07], dir: [0.6,-0.3,0.7], role: "arm", group: "armL" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.5,0.76,0.26], dir: [0.2,-0.1,1], role: "arm", group: "armL" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.27,1,0], dir: [-1,-0.5,0.2], role: "arm", group: "armR" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.38,0.88,0.08], dir: [-0.4,-0.3,0.8], role: "arm", group: "armR" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.4,0.78,0.28], dir: [0,-0.1,1], role: "arm", group: "armR" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.12,0.6,0], dir: [0,-1,0], role: "leg", group: "legL" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.13,0.34,0.03], dir: [0,-1,0], role: "leg", group: "legL" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.14,0.09,0], dir: [0,0,1], role: "leg", group: "legL" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.12,0.6,0], dir: [0,-1,0], role: "leg", group: "legR" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.13,0.34,0.03], dir: [0,-1,0], role: "leg", group: "legR" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.14,0.09,0], dir: [0,0,1], role: "leg", group: "legR" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
