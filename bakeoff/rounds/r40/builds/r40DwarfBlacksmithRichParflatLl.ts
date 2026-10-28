import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Dwarf Blacksmith at the Anvil",
  "description": "A stocky Warcraft-style dwarf blacksmith with a braided beard and heavy hammer, mid-forge at an anvil on a stump, with a glowing forge-fire brazier beside him."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#d9a07a",
  skinShade: "#b87c5a",
  beard: "#c8582a",
  beardTip: "#f0a040",
  beardBand: "#e7c14a",
  leather: "#5a3a22",
  leatherDark: "#33200f",
  cloth: "#3f5a8a",
  steel: "#8a93a3",
  steelDark: "#4a5262",
  steelLight: "#d5dce8",
  gold: "#e7b83a",
  wood: "#7a5230",
  woodDark: "#4a301a",
  ember: "#ff7a1a",
  emberHot: "#ffd24a",
  coal: "#1c1614",
  eyeWhite: "#f4efe4",
  eyeDark: "#1a1210",
  stone: "#6b6a70",
};
const M = {
  hips: [0, 0.62, -0.1] as [number, number, number],
  chest: [0, 0.95, -0.08] as [number, number, number],
  neckBase: [0, 1.15, -0.05] as [number, number, number],
  headCenter: [0, 1.28, 0] as [number, number, number],
  shoulderR: [-0.3, 1.05, -0.08] as [number, number, number],
  shoulderL: [0.3, 1.05, -0.08] as [number, number, number],
  handR: [-0.28, 0.98, 0.4] as [number, number, number],
  handL: [0.22, 0.88, 0.45] as [number, number, number],
  anvilTop: [0, 0.78, 0.55] as [number, number, number],
  stumpTop: [0, 0.5, 0.55] as [number, number, number],
  brazier: [0.62, 0, 0.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const HC = [0, 1.28, 0.0];
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });

  // neck
  put(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 8), P.skinShade, [0, 1.14, -0.04], neck);

  // skull
  put(box(0.38, 0.3, 0.36), P.skin, [0, 1.3, 0.0], head);
  put(box(0.34, 0.1, 0.3), P.skin, [0, 1.46 - 0.08, 0.0], head);
  // brow ridge
  put(box(0.38, 0.06, 0.08), P.skinShade, [0, 1.35, 0.17], head);
  // nose
  put(box(0.09, 0.1, 0.1), P.skin, [0, 1.27, 0.2], head, { rotation: [-15, 0, 0] });
  put(sph(0.065), P.skin, [0, 1.235, 0.245], head);
  // cheeks
  for (const s of [1, -1]) {
    put(sph(0.07), P.skin, [s * 0.14, 1.24, 0.15], head);
    // eyes
    put(sph(0.04, 8, 6), P.eyeWhite, [s * 0.09, 1.31, 0.175], head);
    put(sph(0.02, 6, 4), P.eyeDark, [s * 0.09, 1.31, 0.208], head);
    put(sph(0.006, 4, 3), P.eyeWhite, [s * 0.095, 1.318, 0.226], head);
    // brows bushy
    put(box(0.12, 0.035, 0.05), P.beard, [s * 0.1, 1.365, 0.185], head, { rotation: [0, 0, s * 12] });
    put(cone(0.02, 0.07, 5), P.beardTip, [s * 0.17, 1.35, 0.19], head, { rotation: [0, 0, -s * 80] });
    // ears
    put(box(0.04, 0.1, 0.07), P.skin, [s * 0.2, 1.29, 0.0], head);
    put(cone(0.035, 0.08, 4), P.skinShade, [s * 0.235, 1.33, 0.0], head, { rotation: [0, 0, -s * 70] });
    // moustache curled ends
    put(box(0.1, 0.05, 0.06), P.beard, [s * 0.06, 1.2, 0.225], head, { rotation: [0, 0, -s * 10] });
    put(box(0.07, 0.04, 0.05), P.beard, [s * 0.13, 1.17, 0.2], head, { rotation: [0, 0, -s * 40] });
    put(sph(0.035, 6, 4), P.beardTip, [s * 0.165, 1.2, 0.2], head);
    put(cone(0.02, 0.07, 5), P.beardTip, [s * 0.185, 1.235, 0.2], head, { rotation: [0, 0, s * 30] });
    // helmet horns
    put(cone(0.045, 0.2, 6), P.steelLight, [s * 0.22, 1.5, 0.0], head, { rotation: [0, 0, -s * 55] });
    put(new THREE.CylinderGeometry(0.05, 0.06, 0.06, 6), P.leatherDark, [s * 0.19, 1.43, 0.0], head, { rotation: [0, 0, -s * 70] });
    // side beard sideburns
    put(box(0.07, 0.2, 0.2), P.beard, [s * 0.17, 1.16, 0.06], head);
  }
  // helmet
  put(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 8), P.steel, [0, 1.46, 0.0], head);
  put(sph(0.2, 8, 4), P.steel, [0, 1.49, 0.0], head, { scale: [1, 0.7, 1] });
  put(new THREE.CylinderGeometry(0.225, 0.225, 0.03, 8), P.gold, [0, 1.41, 0.0], head);
  put(box(0.04, 0.1, 0.34), P.leather, [0, 1.56, 0], head);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(sph(0.011, 4, 3), P.gold, [Math.sin(a) * 0.225, 1.41, Math.cos(a) * 0.225], head);
  }
  put(box(0.05, 0.08, 0.02), P.steel, [0, 1.41, 0.225], head);

  // jaw
  put(box(0.34, 0.1, 0.32), P.skin, [0, 1.17, 0.03], jaw);
  put(box(0.1, 0.03, 0.03), P.skinShade, [0, 1.19, 0.2], jaw);
  put(box(0.1, 0.06, 0.08), P.skin, [0, 1.15, 0.2], jaw);

  // beard blades
  const rows = [
    { y: 1.1, w: 0.34, n: 5, c: P.beard },
    { y: 0.98, w: 0.34, n: 5, c: P.beard },
    { y: 0.86, w: 0.28, n: 4, c: P.beardTip },
  ];
  put(box(0.3, 0.2, 0.1), P.beard, [0, 1.07, 0.2], jaw);
  put(box(0.3, 0.28, 0.06), P.beard, [0, 0.88, 0.2], jaw);
  rows.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const t = r.n === 1 ? 0 : i / (r.n - 1) - 0.5;
      const x = t * r.w;
      const len = 0.2 - Math.abs(t) * 0.1 + R() * 0.02;
      const col = ri === 2 ? P.beardTip : i % 2 ? P.beard : P.beardTip;
      put(box(0.075, len, 0.035), col, [x, r.y, 0.245 + ri * 0.012], jaw, { rotation: [-6, 0, t * -18] });
      put(cone(0.04, 0.1, 4), col, [x * 0.95, r.y - len / 2 - 0.04, 0.25 + ri * 0.012], jaw, { rotation: [180, 45, 0] });
    }
  });
  // braids
  for (const s of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      put(sph(0.035, 6, 4), k % 2 ? P.beard : P.beardTip, [s * 0.1, 0.93 - k * 0.055, 0.27], jaw, { scale: [1, 1.2, 0.8] });
    }
    put(cone(0.03, 0.06, 5), P.beardTip, [s * 0.1, 0.65, 0.27], jaw, { rotation: [180, 0, 0] });
  }
  // gold rings
  for (const y of [1.0, 0.8]) {
    put(box(0.32, 0.03, 0.05), P.beardBand, [0, y, 0.27], jaw);
    put(sph(0.014, 4, 3), P.gold, [0, y, 0.3], jaw);
  }
  put(new THREE.TorusGeometry(0.035, 0.012, 4, 8), P.beardBand, [0.1, 0.78, 0.275], jaw);
  put(new THREE.TorusGeometry(0.035, 0.012, 4, 8), P.beardBand, [-0.1, 0.78, 0.275], jaw);
}
    return buildHead;
  })(),
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const hips = J.hips, chest = J.chest;
  const R = rng(5);

  const box = (w: number, h: number, d: number, col: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, sides: number, col: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), col, { bone, at, rotation: rot });
  const ball = (r: number, col: string, at: number[], bone: any, sc?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at, scale: sc });

  // hips & pelvis
  cyl(0.3, 0.33, 0.24, 10, P.cloth, [0, 0.68, -0.1], hips);
  // barrel torso: tunic
  cyl(0.36, 0.3, 0.32, 10, P.cloth, [0, 0.9, -0.1], chest);
  cyl(0.4, 0.36, 0.2, 10, P.cloth, [0, 1.06, -0.1], chest);
  // leather vest panels
  for (const s of [1, -1]) {
    box(0.17, 0.4, 0.08, P.leather, [s * 0.15, 0.95, 0.1], chest, [0, s * -8, 0]);
    box(0.17, 0.3, 0.08, P.leather, [s * 0.27, 1.05, 0.0], chest, [0, s * 40, 0]);
    // back vest
    box(0.3, 0.4, 0.05, P.leather, [s * 0.15, 0.97, -0.33], chest);
    // vest straps over shoulders
    box(0.07, 0.04, 0.34, P.leatherDark, [s * 0.2, 1.17, -0.08], chest);
    // gold buckles
    box(0.045, 0.045, 0.02, P.gold, [s * 0.15, 1.08, 0.145], chest);
    box(0.045, 0.045, 0.02, P.gold, [s * 0.15, 0.93, 0.15], chest);
    // strap lines
    box(0.03, 0.4, 0.015, P.leatherDark, [s * 0.15, 0.95, 0.145], chest);
  }
  // collar
  cyl(0.17, 0.2, 0.07, 8, P.leatherDark, [0, 1.15, -0.07], chest);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ball(0.012, P.gold, [Math.sin(a) * 0.19, 1.16, -0.07 + Math.cos(a) * 0.19], chest);
  }

  // belt
  cyl(0.37, 0.37, 0.09, 12, P.leatherDark, [0, 0.74, -0.1], hips);
  box(0.16, 0.12, 0.04, P.gold, [0, 0.74, 0.27], hips);
  box(0.1, 0.07, 0.03, P.leatherDark, [0, 0.74, 0.29], hips);
  box(0.04, 0.03, 0.03, P.gold, [0, 0.74, 0.305], hips);
  for (let i = 0; i < 7; i++) {
    const a = -1.2 + i * 0.4 + (i > 3 ? 0.4 : 0);
    ball(0.012, P.gold, [Math.sin(a) * 0.375, 0.74, -0.1 + Math.cos(a) * 0.375], hips);
  }

  // apron
  box(0.4, 0.5, 0.04, P.leather, [0, 0.52 + 0.2, 0.29], hips);
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 3), P.leather, { bone: hips, at: [0, 0.43, 0.29], rotation: [90, 0, 60] });
  box(0.3, 0.1, 0.03, P.leatherDark, [0, 0.6, 0.315], hips);
  for (const s of [1, -1]) {
    ball(0.014, P.steelLight, [s * 0.17, 0.82, 0.315], hips);
    ball(0.014, P.steelLight, [s * 0.15, 0.56, 0.315], hips);
  }
  // scorch marks
  for (let i = 0; i < 6; i++) {
    ball(0.035 + R() * 0.03, P.leatherDark, [(R() - 0.5) * 0.3, 0.45 + R() * 0.3, 0.312], hips, [1, 0.8, 0.15]);
  }

  // pouch
  box(0.1, 0.11, 0.05, P.leather, [0.27, 0.64, 0.2], hips, [0, 30, 0]);
  box(0.1, 0.04, 0.055, P.leatherDark, [0.27, 0.69, 0.2], hips, [0, 30, 0]);
  ball(0.015, P.gold, [0.3, 0.64, 0.23], hips);
  // tongs hanging on right
  cyl(0.012, 0.012, 0.26, 6, P.steelDark, [-0.26, 0.58, 0.22], hips, [0, 0, 5]);
  cyl(0.012, 0.012, 0.26, 6, P.steel, [-0.29, 0.58, 0.21], hips, [0, 0, -5]);
  box(0.06, 0.03, 0.03, P.steelDark, [-0.28, 0.45, 0.22], hips);
  ball(0.02, P.steelLight, [-0.275, 0.72, 0.22], hips);

  // pauldrons
  for (const s of [1, -1]) {
    const sh = s > 0 ? J.shoulderL : J.shoulderR;
    const x = s * 0.31;
    b.part(new THREE.SphereGeometry(0.17, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, { bone: chest, at: [x, 1.1, -0.08], scale: [1.1, 0.9, 1.1], rotation: [0, 0, s * -15] });
    cyl(0.185, 0.19, 0.03, 10, P.gold, [x + s * 0.03, 1.09, -0.08], chest, [0, 0, s * -15]);
    cyl(0.12, 0.14, 0.03, 8, P.steelDark, [x + s * 0.02, 1.2, -0.08], chest);
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.7;
      b.part(new THREE.ConeGeometry(0.03, 0.12, 6), P.steelLight, {
        bone: chest, at: [x + s * 0.06, 1.23, -0.08 + Math.sin(a) * 0.1], rotation: [a * 40, 0, s * -30],
      });
      ball(0.014, P.gold, [x + s * 0.12, 1.12 - Math.abs(i - 1) * 0.015, -0.08 + (i - 1) * 0.1], chest);
    }
    box(0.18, 0.03, 0.2, P.leatherDark, [x, 1.0, -0.08], chest);
  }
}
    return buildTorso;
  })(),
  // arms
  (() => {
function buildArms({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const GOLD = P.gold, STEEL = P.steel, SD = P.steelDark, SL = P.steelLight;
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // arm builder
  const arm = (s: number, side: "R" | "L", sh: any, el: any, wr: any, hand: number[]) => {
    const shP = sh.at.clone();
    const elP = el.at.clone();
    const wrP = wr.at.clone();
    // sleeve upper arm
    b.sweep([shP.toArray(), elP.toArray()], [0.105, 0.09], { bone: [sh, el], color: P.cloth, sides: 8 });
    b.part(sph(0.115), P.cloth, { bone: sh, at: shP.toArray() });
    // cuff at elbow
    b.rod(elP.clone().lerp(shP, 0.12), elP.clone().lerp(wrP, 0.08), 0.1, P.leatherDark, { bone: el, sides: 8 });
    // forearm skin
    b.sweep([elP.toArray(), wrP.toArray()], [0.09, 0.075], { bone: [el, wr], color: P.skin, sides: 8 });
    // bracer
    b.rod(elP.clone().lerp(wrP, 0.35), elP.clone().lerp(wrP, 0.9), 0.095, P.leather, { bone: el, sides: 8 });
    b.rod(elP.clone().lerp(wrP, 0.36), elP.clone().lerp(wrP, 0.42), 0.099, P.leatherDark, { bone: el, sides: 8 });
    b.rod(elP.clone().lerp(wrP, 0.82), elP.clone().lerp(wrP, 0.88), 0.099, P.leatherDark, { bone: el, sides: 8 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const c = elP.clone().lerp(wrP, 0.6);
      b.part(sph(0.012, 6, 4), GOLD, { bone: el, at: [c.x + Math.sin(a) * 0.098, c.y + Math.cos(a) * 0.098, c.z] });
    }
    // fist
    const h = hand;
    b.part(box(0.17, 0.15, 0.17), P.skin, { bone: wr, at: [h[0], h[1], h[2]] });
    for (let i = 0; i < 4; i++)
      b.part(box(0.038, 0.05, 0.05), P.skinShade, { bone: wr, at: [h[0] - 0.06 + i * 0.04, h[1] + 0.02, h[2] + 0.1] });
    b.part(box(0.05, 0.06, 0.1), P.skin, { bone: wr, at: [h[0] + s * 0.09 * -1 * -1 * 0 + (side === "R" ? 0.1 : -0.1), h[1] + 0.04, h[2] + 0.02], rotation: [0, 0, 0] });
  };

  arm(-1, "R", J.shoulderR, J.elbowR, J.wristR, [-0.28, 0.96, 0.4]);
  arm(1, "L", J.shoulderL, J.elbowL, J.wristL, [0.22, 0.88, 0.44]);

  // hammer: handle vertical-ish through right fist
  const hx = -0.28, hy = 0.96, hz = 0.4;
  const w = J.wristR;
  b.rod([hx, hy - 0.12, hz - 0.02], [hx, hy + 0.32, hz + 0.1], 0.024, P.wood, { bone: w, sides: 8 });
  b.rod([hx, hy - 0.04, hz + 0.01], [hx, hy + 0.08, hz + 0.04], 0.03, P.leather, { bone: w, sides: 8 });
  for (let i = 0; i < 3; i++)
    b.rod([hx, hy - 0.03 + i * 0.04, hz + 0.01 + i * 0.012], [hx, hy - 0.01 + i * 0.04, hz + 0.015 + i * 0.012], 0.033, P.leatherDark, { bone: w, sides: 8 });
  b.part(sph(0.03), GOLD, { bone: w, at: [hx, hy - 0.13, hz - 0.02] });
  const hc = [hx, hy + 0.34, hz + 0.11];
  b.part(box(0.34, 0.17, 0.17), STEEL, { bone: w, at: hc });
  b.part(box(0.04, 0.19, 0.19), GOLD, { bone: w, at: [hx + 0.1, hc[1], hc[2]] });
  b.part(box(0.04, 0.19, 0.19), GOLD, { bone: w, at: [hx - 0.1, hc[1], hc[2]] });
  for (const e of [1, -1]) b.part(box(0.05, 0.2, 0.2), SD, { bone: w, at: [hx + e * 0.185, hc[1], hc[2]] });
  b.part(box(0.1, 0.012, 0.14), SL, { bone: w, at: [hx, hc[1] + 0.09, hc[2]] });
  b.part(box(0.02, 0.07, 0.01), P.ember, { bone: w, at: [hx, hc[1], hc[2] + 0.092] });
  b.part(box(0.06, 0.015, 0.01), P.ember, { bone: w, at: [hx, hc[1] + 0.01, hc[2] + 0.092] });

  // tongs + ingot on anvil
  const wl = J.wristL;
  const ing = [0.04, 0.8, 0.6];
  b.part(box(0.1, 0.035, 0.2), P.ember, { bone: wl, at: ing });
  b.part(box(0.07, 0.015, 0.14), P.emberHot, { bone: wl, at: [ing[0], ing[1] + 0.02, ing[2]] });
  for (const e of [1, -1]) {
    b.rod([0.22 + e * 0.02, 0.88 + e * 0.01, 0.46], [ing[0] + e * 0.04, ing[1] + 0.02, ing[2] - 0.03], 0.012, SD, { bone: wl, sides: 6 });
    b.rod([0.22 + e * 0.02, 0.88 + e * 0.01, 0.46], [0.24 + e * 0.04, 0.9, 0.3], 0.013, SD, { bone: wl, sides: 6 });
  }
  b.part(sph(0.02), STEEL, { bone: wl, at: [0.24, 0.89, 0.5] });
}
    return buildArms;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: any) {
  const R = rng(11);
  const CUFF = "#7a4e2c";
  const ASH = "#8d8780";
  const SOLE = P.leatherDark;

  for (const s of [-1, 1]) {
    const side = s < 0 ? "R" : "L";
    const hip = J["hip" + side];
    const knee = J["knee" + side];
    const ankle = J["ankle" + side];
    const x = s * 0.15;

    // thigh (trousers)
    b.rod([x, 0.6, -0.1], [x, 0.33, -0.08], [0.115, 0.1], P.cloth, { bone: hip, sides: 8 });
    // knee joint blob
    b.part(new THREE.SphereGeometry(0.1, 8, 6), P.cloth, { bone: knee, at: [x, 0.32, -0.08] });
    // shin
    b.rod([x, 0.32, -0.08], [x, 0.17, -0.1], [0.1, 0.095], P.cloth, { bone: knee, sides: 8 });

    // leather knee wrap with strap and buckle
    b.part(new THREE.CylinderGeometry(0.108, 0.108, 0.07, 8), P.leather, { bone: knee, at: [x, 0.33, -0.08] });
    b.part(new THREE.BoxGeometry(0.2, 0.014, 0.02), P.leatherDark, { bone: knee, at: [x, 0.355, -0.075] });
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.012), P.gold, { bone: knee, at: [x, 0.33, -0.0] });
    // kneecap plate
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.steelDark, { bone: knee, at: [x, 0.33, -0.01], scale: [1, 1, 0.5] });

    // boot cuff
    b.part(new THREE.CylinderGeometry(0.125, 0.115, 0.07, 8), CUFF, { bone: ankle, at: [x, 0.17, -0.1] });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.014, 8), P.leatherDark, { bone: ankle, at: [x, 0.205, -0.1] });
    // boot main
    b.part(new THREE.BoxGeometry(0.2, 0.1, 0.34), P.leather, { bone: ankle, at: [x, 0.09, -0.02] });
    b.part(new THREE.BoxGeometry(0.19, 0.09, 0.2), P.leather, { bone: ankle, at: [x, 0.12, -0.1] });
    // steel toe cap
    b.part(new THREE.BoxGeometry(0.205, 0.095, 0.1), P.steel, { bone: ankle, at: [x, 0.075, 0.17] });
    b.part(new THREE.BoxGeometry(0.185, 0.03, 0.09), P.steelLight, { bone: ankle, at: [x, 0.13, 0.17] });
    b.part(new THREE.CylinderGeometry(0.1, 0.105, 0.09, 8), P.steel, { bone: ankle, at: [x, 0.07, 0.19], scale: [1, 1, 0.6], rotation: [90, 0, 0] });
    // toe rivets
    for (const k of [-1, 0, 1])
      b.part(new THREE.SphereGeometry(0.01, 5, 4), P.gold, { bone: ankle, at: [x + k * 0.06, 0.12, 0.215] });
    // sole
    b.part(new THREE.BoxGeometry(0.22, 0.035, 0.4), SOLE, { bone: ankle, at: [x, 0.0175, 0.0] });
    b.part(new THREE.BoxGeometry(0.2, 0.03, 0.08), P.woodDark, { bone: ankle, at: [x, 0.015, -0.14] });
    // side buckles on cuff
    b.part(new THREE.BoxGeometry(0.014, 0.04, 0.03), P.gold, { bone: ankle, at: [x + s * 0.125, 0.17, -0.05] });
    b.part(new THREE.BoxGeometry(0.01, 0.015, 0.1), P.leatherDark, { bone: ankle, at: [x + s * 0.118, 0.17, -0.1] });
    // ash smudges
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.SphereGeometry(0.02 + R() * 0.012, 5, 4), ASH, {
        bone: ankle,
        at: [x + (R() - 0.5) * 0.16, 0.05 + R() * 0.04, 0.05 + R() * 0.15],
        scale: [1, 0.4, 1],
      });
    }
    // trouser seam stripe
    b.rod([x + s * 0.1, 0.55, -0.1], [x + s * 0.095, 0.2, -0.1], 0.008, P.steelDark, { bone: hip, sides: 4 });
  }
}
    return buildLegs;
  })(),
  // forge
  (() => {
function buildForge({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });

  // ---- stump ----
  const sx = M.stumpTop[0], sz = M.stumpTop[2], stumpH = M.stumpTop[1];
  put(cyl(0.25, 0.29, stumpH, 10), P.wood, [sx, stumpH / 2, sz]);
  // bark ridges
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = 0.27;
    put(box(0.04, stumpH * 0.9, 0.05), P.woodDark, [sx + Math.sin(a) * r, stumpH / 2, sz + Math.cos(a) * r], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // top rings
  put(cyl(0.24, 0.24, 0.01, 12), "#9a6a3e", [sx, stumpH + 0.005, sz]);
  put(cyl(0.17, 0.17, 0.004, 12), P.wood, [sx, stumpH + 0.011, sz]);
  put(cyl(0.1, 0.1, 0.004, 10), "#9a6a3e", [sx, stumpH + 0.014, sz]);
  put(cyl(0.04, 0.04, 0.004, 8), P.woodDark, [sx, stumpH + 0.017, sz]);
  // iron bands
  for (const y of [0.1, 0.4]) {
    const r = y < 0.2 ? 0.287 - y * 0.05 : 0.262;
    put(cyl(r, r, 0.04, 12), P.steelDark, [sx, y, sz]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      put(new THREE.SphereGeometry(0.012, 5, 4), P.steelLight, [sx + Math.sin(a) * (r + 0.005), y, sz + Math.cos(a) * (r + 0.005)]);
    }
  }

  // ---- anvil (top at M.anvilTop[1]) ----
  const top = M.anvilTop[1];
  const ay = stumpH + 0.02;
  const base = ay + 0.04;
  put(box(0.34, 0.08, 0.22), P.steelDark, [sx, ay + 0.04, sz]);
  put(box(0.28, 0.03, 0.17), P.steel, [sx, ay + 0.095, sz]);
  const waistH = top - 0.1 - (ay + 0.11);
  put(box(0.17, waistH, 0.12), P.steel, [sx, ay + 0.11 + waistH / 2, sz]);
  put(box(0.5, 0.1, 0.17), P.steel, [sx, top - 0.05, sz]);
  put(box(0.5, 0.012, 0.17), P.steelLight, [sx, top - 0.006, sz]);
  // horn
  put(new THREE.ConeGeometry(0.08, 0.26, 8), P.steel, [sx + 0.37, top - 0.06, sz], { rotation: [0, 0, -90] });
  put(new THREE.ConeGeometry(0.05, 0.14, 6), P.steelLight, [sx + 0.36, top - 0.02, sz], { rotation: [0, 0, -90], scale: [1, 1, 0.3] });
  // heel
  put(box(0.1, 0.07, 0.15), P.steelDark, [sx - 0.29, top - 0.07, sz]);
  // hardy + pritchel holes
  put(box(0.032, 0.004, 0.032), P.coal, [sx - 0.17, top + 0.001, sz]);
  put(cyl(0.011, 0.011, 0.004, 6), P.coal, [sx - 0.1, top + 0.001, sz]);
  // scratches
  for (let i = 0; i < 9; i++)
    put(box(0.05 + R() * 0.05, 0.002, 0.004), P.steelDark, [sx - 0.1 + R() * 0.3, top + 0.0015, sz + (R() - 0.5) * 0.12], { rotation: [0, (R() - 0.5) * 60, 0] });
  // side trim gold rivets
  for (const s of [1, -1]) for (const x of [-0.12, 0.12])
    put(new THREE.SphereGeometry(0.011, 5, 4), P.gold, [sx + x, top - 0.05, sz + s * 0.087]);
  // ingot + glow
  put(box(0.2, 0.025, 0.05), P.ember, [sx + 0.02, top + 0.0125, sz + 0.0], { rotation: [0, 8, 0] });
  put(box(0.1, 0.012, 0.03), P.emberHot, [sx + 0.0, top + 0.03, sz], { rotation: [0, 8, 0] });
  put(new THREE.CircleGeometry(0.08, 8), P.ember, [sx, top + 0.003, sz], { dir: [0, 1, 0], axis: "z" });

  // ---- brazier ----
  const bx = M.brazier[0], bz = M.brazier[2];
  put(cyl(0.2, 0.22, 0.05, 9), P.stone, [bx, 0.025, bz]);
  const N = 9;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const g = new THREE.DodecahedronGeometry(0.075 + R() * 0.025, 0);
    put(g, i % 2 ? P.stone : "#58575d", [bx + Math.sin(a) * 0.19, 0.1, bz + Math.cos(a) * 0.19], { scale: [1, 1.2, 1], rotation: [R() * 40, R() * 360, 0] });
    put(g, i % 2 ? "#58575d" : P.stone, [bx + Math.sin(a + 0.35) * 0.18, 0.2, bz + Math.cos(a + 0.35) * 0.18], { scale: [0.9, 0.8, 0.9], rotation: [R() * 40, R() * 360, 0] });
  }
  put(cyl(0.17, 0.17, 0.05, 9), P.coal, [bx, 0.22, bz]);
  for (let i = 0; i < 8; i++)
    put(new THREE.DodecahedronGeometry(0.04 + R() * 0.02, 0), i % 3 ? P.ember : P.emberHot, [bx + (R() - 0.5) * 0.22, 0.25 + R() * 0.02, bz + (R() - 0.5) * 0.22], { rotation: [R() * 90, R() * 90, 0] });
  // flames
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const rr = i === 0 ? 0 : 0.08;
    const h = 0.2 + R() * 0.12;
    const x = bx + Math.sin(a) * rr, z = bz + Math.cos(a) * rr;
    put(new THREE.ConeGeometry(0.06, h, 4), P.ember, [x, 0.25 + h / 2, z], { rotation: [(R() - 0.5) * 20, R() * 90, (R() - 0.5) * 20], scale: [1, 1, 0.5] });
    put(new THREE.ConeGeometry(0.035, h * 0.7, 4), P.emberHot, [x, 0.25 + h * 0.35, z], { rotation: [0, R() * 90, 0], scale: [1, 1, 0.5] });
  }

  // ---- bucket ----
  const kx = 0.7, kz = 0.7, kh = 0.26;
  put(cyl(0.12, 0.095, kh, 10), P.wood, [kx, kh / 2, kz]);
  put(cyl(0.105, 0.105, 0.01, 10), "#3c6a9a", [kx, kh - 0.02, kz]);
  for (const y of [0.05, 0.14, 0.23]) {
    const r = 0.095 + ((y) / kh) * 0.025 + 0.004;
    put(cyl(r, r, 0.02, 10), P.steelDark, [kx, y, kz]);
  }
  put(new THREE.TorusGeometry(0.11, 0.008, 4, 10, Math.PI), P.steel, [kx, kh, kz], { rotation: [0, 0, 0] });

  // ---- tools leaning on stump ----
  const tools: [number, number, string][] = [[-0.2, -0.3, P.wood], [-0.27, 0.12, P.woodDark]];
  tools.forEach(([dx, ang, col], i) => {
    const px = sx - 0.27 + dx * 0.2, pz = sz + 0.1 - i * 0.18;
    put(cyl(0.015, 0.015, 0.55, 6), col, [px - 0.05, 0.28, pz], { rotation: [0, 0, 18] });
    put(box(0.07, 0.06, 0.03), P.steelDark, [px - 0.12, 0.5, pz], { rotation: [0, 0, 18] });
  });
  // tongs leaning
  put(box(0.025, 0.5, 0.012), P.steel, [sx - 0.31, 0.26, sz - 0.12], { rotation: [0, 0, 12] });
  put(box(0.025, 0.5, 0.012), P.steelDark, [sx - 0.3, 0.26, sz - 0.1], { rotation: [0, 0, 10] });

  // ---- sparks ----
  for (let i = 0; i < 9; i++)
    put(new THREE.OctahedronGeometry(0.01 + R() * 0.008, 0), i % 2 ? P.emberHot : P.ember, [sx + (R() - 0.5) * 0.45, top + 0.08 + R() * 0.2, sz + (R() - 0.5) * 0.3]);
}
    return buildForge;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dwarfSmith" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.62,-0.1], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,0.82,-0.1], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.12,-0.06], dir: [0,1,0.1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.2,-0.04], dir: [0,1,0], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.22,0], dir: [0,0,1], role: "jaw" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.3,1.05,-0.08], dir: [-0.3,-0.5,0.8], role: "arm", group: "armR" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.4,0.86,0.12], dir: [0.1,0,1], role: "arm", group: "armR" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.3,0.92,0.36], dir: [0,0,1], role: "arm", group: "armR" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.3,1.05,-0.08], dir: [0.3,-0.5,0.8], role: "arm", group: "armL" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.4,0.86,0.12], dir: [-0.1,0,1], role: "arm", group: "armL" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.26,0.86,0.38], dir: [0,0,1], role: "arm", group: "armL" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.14,0.58,-0.1], dir: [0,-1,0], role: "leg", group: "legR" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.15,0.32,-0.08], dir: [0,-1,0], role: "leg", group: "legR" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.15,0.08,-0.1], dir: [0,0,1], role: "leg", group: "legR" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.14,0.58,-0.1], dir: [0,-1,0], role: "leg", group: "legL" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.15,0.32,-0.08], dir: [0,-1,0], role: "leg", group: "legL" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.15,0.08,-0.1], dir: [0,0,1], role: "leg", group: "legL" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
