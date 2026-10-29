import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Warforge Dwarf Blacksmith",
  "description": "A stout Warcraft-style dwarf blacksmith mid-strike, hammer raised overhead in his right hand and tongs with a glowing rod in his left, working at a rune-marked anvil before a coal forge."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#c98a5e",
  skinShadow: "#9e683f",
  nose: "#d97743",
  beard: "#b45a1e",
  beardLight: "#d97a2e",
  hairDark: "#7a3c14",
  tunic: "#3a5a8c",
  leather: "#6b4326",
  leatherDark: "#452a14",
  boot: "#3a2a1a",
  glove: "#8a5a2e",
  steel: "#8d959e",
  steelDark: "#565b63",
  iron: "#2f3238",
  brass: "#c9a227",
  wood: "#7a4a24",
  woodDark: "#553117",
  stone: "#7a7468",
  stoneDark: "#565044",
  coal: "#1c1a18",
  ember: "#ff7a1e",
  emberCore: "#ffd23e",
  runeBlue: "#4aa3ff",
  mouth: "#5c2a1a",
  eye: "#2a1c10",
};
const M = {
  hipsSocket: [0, 0.55, 0] as [number, number, number],
  neckBase: [0, 1.08, 0.02] as [number, number, number],
  shoulderL: [0.28, 1.02, 0.02] as [number, number, number],
  shoulderR: [-0.28, 1.02, 0.02] as [number, number, number],
  hammerGrip: [0.42, 1.62, 0.3] as [number, number, number],
  tongsGrip: [0.3, 0.72, 0.45] as [number, number, number],
  anvilWorkFace: [0, 0.78, 0.6] as [number, number, number],
  forgeFace: [0, 0.85, -0.52] as [number, number, number],
  floor: [0, 0, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const EMB = "#ff9a3a";
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], bone: any, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, dir });
  const sph = (r: number, c: string, at: number[], bone: any, sc?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at, scale: sc });

  // Hips block / pelvis
  b.frustumBox([0, 0.5, 0], [0, 0.72, 0], [0.42, 0.34], [0.5, 0.42], { bone: J.hips, color: P.tunic });
  // Barrel torso: loft
  b.loft(
    [
      { at: [0, 0.68, 0.0], w: 0.5, h: 0.4 },
      { at: [0, 0.82, 0.03], w: 0.6, h: 0.5 },
      { at: [0, 0.98, 0.0], w: 0.72, h: 0.5 },
      { at: [0, 1.1, 0.0], w: 0.66, h: 0.42 },
    ],
    { bone: [J.hips, J.spine, J.chest], color: P.tunic },
  );
  // dark underside
  box(0.5, 0.05, 0.42, "#27406a", [0, 0.64, 0.02], J.hips);
  // under-shirt collar
  b.frustumBox([0, 1.08, 0.02], [0, 1.14, 0.02], [0.4, 0.3], [0.34, 0.26], { bone: J.chest, color: P.leatherDark });
  // neck base
  cyl(0.11, 0.14, 0.1, 8, P.skinShadow, [0, 1.13, 0.03], J.chest);
  // shoulder plates (bronze)
  for (const s of [1, -1]) {
    sph(0.1, P.brass, [s * 0.3, 1.07, 0.03], J.chest, [1.2, 0.55, 1]);
    cyl(0.02, 0.02, 0.02, 6, P.brass, [s * 0.3, 1.12, 0.03], J.chest);
  }
  // Apron
  b.frustumBox([0, 1.0, 0.27], [0, 0.45, 0.3], [0.5, 0.06], [0.58, 0.06], { bone: J.spine, color: P.leather });
  box(0.4, 0.2, 0.05, P.leather, [0, 1.0, 0.27], J.chest);
  // apron hem band + stitches
  box(0.6, 0.05, 0.075, P.leatherDark, [0, 0.47, 0.3], J.hips);
  for (let i = 0; i < 9; i++) box(0.025, 0.012, 0.08, P.steel, [-0.24 + i * 0.06, 0.47, 0.3], J.hips);
  // apron pocket
  box(0.2, 0.14, 0.03, P.leatherDark, [0, 0.62, 0.325], J.hips);
  box(0.2, 0.025, 0.035, P.leather, [0, 0.68, 0.33], J.hips);
  // Belt
  b.loft(
    [
      { at: [0, 0.74, 0.0], w: 0.64, h: 0.5 },
      { at: [0, 0.78, 0.0], w: 0.65, h: 0.52 },
    ],
    { bone: J.spine, color: P.leatherDark },
  );
  box(0.6, 0.07, 0.1, P.leatherDark, [0, 0.76, 0.28], J.spine);
  cyl(0.065, 0.065, 0.03, 12, P.brass, [0, 0.76, 0.34], J.spine, [0, 0, 1]);
  cyl(0.04, 0.04, 0.035, 10, P.leatherDark, [0, 0.76, 0.355], J.spine, [0, 0, 1]);
  cyl(0.02, 0.02, 0.04, 8, P.brass, [0, 0.76, 0.365], J.spine, [0, 0, 1]);
  // Diagonal strap
  b.rod([0.26, 1.1, 0.2], [-0.26, 0.8, 0.29], 0.035, { bone: J.chest, color: P.leather });
  b.rod([-0.26, 1.1, -0.2], [0.26, 0.8, -0.28], 0.035, { bone: J.chest, color: P.leather });
  // chest buckle plate
  box(0.1, 0.1, 0.03, P.brass, [0.0, 0.95, 0.31], J.chest, [0, 0, 20]);
  box(0.05, 0.05, 0.035, P.leatherDark, [0, 0.95, 0.32], J.chest, [0, 0, 20]);
  // Back pouch
  box(0.2, 0.2, 0.1, P.leather, [-0.05, 0.82, -0.35], J.spine);
  box(0.21, 0.07, 0.11, P.leatherDark, [-0.05, 0.9, -0.35], J.spine);
  sph(0.02, P.brass, [-0.05, 0.88, -0.41], J.spine);
  // Hip pouch + mitten loop
  box(0.12, 0.14, 0.09, P.leather, [0.34, 0.6, 0.08], J.hips);
  box(0.13, 0.05, 0.1, P.leatherDark, [0.34, 0.66, 0.08], J.hips);
  b.torus ? 0 : 0;
  b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), P.iron, { bone: J.hips, at: [0.38, 0.52, 0.18], dir: [1, 0, 0], axis: "z" });
  box(0.06, 0.12, 0.05, P.glove, [0.38, 0.45, 0.18], J.hips);
  // Firelight rim on back (forge side -Z)
  for (let i = 0; i < 10; i++) {
    const x = -0.25 + i * 0.055 + (R() - 0.5) * 0.02;
    const y = 0.6 + R() * 0.45;
    box(0.04, 0.05 + R() * 0.05, 0.015, EMB, [x, y, -0.255], J.spine);
  }
  for (const s of [1, -1]) box(0.015, 0.5, 0.06, EMB, [s * 0.335, 0.88, -0.14], J.spine);
  // Side rivets on belt
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) sph(0.012, P.brass, [s * (0.1 + i * 0.08), 0.76, 0.335], J.spine);
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const HC: [number, number, number] = [0, 1.3, 0.1];
  const r = rng(5);

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: at as any, rotation: rot as any, flat: true });
  const sph = (rad: number, c: string, at: number[], bone: any, sc: number[] = [1, 1, 1], seg = 8) =>
    b.part(new THREE.SphereGeometry(rad, seg, Math.max(4, seg - 2)), c, { bone, at: at as any, scale: sc as any, flat: true });
  const cone = (rad: number, len: number, c: string, at: number[], dir: number[], bone: any, seg = 6) =>
    b.part(new THREE.ConeGeometry(rad, len, seg), c, { bone, at: at as any, dir: dir as any, flat: true });

  // neck
  b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.16, 8), P.skinShadow, { bone: neck, at: [0, 1.1, 0.03] });

  // skull
  sph(1, P.skin, HC, head, [0.24, 0.21, 0.24], 10);
  box(0.4, 0.2, 0.3, P.skin, [0, 1.25, 0.14], head);

  // nose
  sph(0.075, P.nose, [0, 1.25, 0.34], head, [1, 0.9, 0.9], 8);
  for (const s of [1, -1]) sph(0.03, P.nose, [s * 0.05, 1.22, 0.32], head, [1, 0.8, 0.8], 6);

  // eyes + brows
  for (const s of [1, -1]) {
    sph(0.03, P.eye, [s * 0.1, 1.31, 0.3], head, [1, 1, 0.8], 6);
    sph(0.009, "#ffffff", [s * 0.1 + s * 0.008, 1.318, 0.325], head, [1, 1, 1], 4);
    box(0.13, 0.03, 0.05, P.skinShadow, [s * 0.1, 1.345, 0.3], head);
    box(0.15, 0.035, 0.05, P.hairDark, [s * 0.095, 1.37, 0.315], head, [0, 0, s * 18]);
    // cheeks
    sph(0.07, P.skin, [s * 0.16, 1.2, 0.24], head, [1, 0.8, 0.8], 6);
    // ears
    cone(0.06, 0.2, P.skin, [s * 0.3, 1.32, 0.06], [s, 0.45, -0.1], head);
    cone(0.04, 0.14, P.skinShadow, [s * 0.285, 1.32, 0.075], [s, 0.45, -0.1], head);
  }

  // earring
  b.sweep(
    [[0.29, 1.24, 0.06], [0.3, 1.19, 0.06], [0.28, 1.17, 0.06], [0.27, 1.2, 0.06], [0.29, 1.24, 0.06]] as any,
    0.006, P.brass, { bone: head },
  );

  // mouth on jaw
  box(0.2, 0.05, 0.1, P.mouth, [0, 1.15, 0.27], jaw);
  for (const x of [-0.06, -0.02, 0.02, 0.06]) box(0.028, 0.03, 0.02, "#f2ead2", [x, 1.17, 0.325], jaw);
  box(0.24, 0.05, 0.14, P.skinShadow, [0, 1.12, 0.22], jaw);

  // cap
  sph(1, P.steel, [0, 1.38, 0.08], head, [0.265, 0.15, 0.27], 10);
  b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 12), P.steelDark, { bone: head, at: [0, 1.4, 0.08], flat: true });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    sph(0.01, P.brass, [Math.sin(a) * 0.272, 1.4, 0.08 + Math.cos(a) * 0.272], head, [1, 1, 1], 4);
  }
  box(0.08, 0.05, 0.1, P.steelDark, [0.08, 1.5, 0.05], head, [0, 0, 20]); // dent
  cone(0.02, 0.12, P.steelDark, [0, 1.55, 0.08], [0, 1, 0], head);

  // hair tufts
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      cone(0.04, 0.14, P.hairDark, [s * (0.26 - i * 0.01), 1.35 - i * 0.05, 0.08 - i * 0.02], [s, -0.3 - i * 0.2, -0.2], head);
  for (let i = 0; i < 4; i++) cone(0.04, 0.12, P.hairDark, [(i - 1.5) * 0.08, 1.34, -0.17], [0, -0.4, -1], head);

  // beard
  const bd = (w: number, h: number, d: number, c: string, at: number[], rot: number[]) =>
    box(w, h, d, c, at, jaw, rot);
  bd(0.46, 0.2, 0.22, P.beard, [0, 1.07, 0.2], [-10, 0, 0]);
  for (const s of [1, -1]) bd(0.14, 0.3, 0.18, P.beard, [s * 0.19, 1.1, 0.14], [0, 0, s * 10]);
  bd(0.4, 0.26, 0.2, P.beard, [0, 0.93, 0.26], [-12, 0, 0]);
  bd(0.3, 0.26, 0.18, P.beardLight, [0, 0.8, 0.3], [-8, 0, 0]);
  bd(0.46, 0.04, 0.16, P.beardLight, [0, 1.16, 0.3], [0, 0, 0]);
  // wedge tips
  for (const x of [-0.12, 0, 0.12]) cone(0.07, 0.2, P.beard, [x, 0.68, 0.34], [0, -1, 0.15], jaw, 5);
  // central braid
  for (let i = 0; i < 5; i++) sph(0.05, i % 2 ? P.beard : P.beardLight, [0, 0.74 - i * 0.07, 0.38], jaw, [1, 0.8, 0.8], 6);
  // moustache
  for (const s of [1, -1]) {
    box(0.15, 0.05, 0.08, P.beardLight, [s * 0.08, 1.2, 0.33], head, [0, 0, s * -15]);
    cone(0.03, 0.12, P.beardLight, [s * 0.17, 1.17, 0.33], [s, -0.7, 0], head, 5);
  }
  // side braids
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) sph(0.045, i % 2 ? P.beard : P.hairDark, [s * 0.2, 1.0 - i * 0.07, 0.3], jaw, [1, 0.85, 0.85], 6);
    b.part(new THREE.TorusGeometry(0.035, 0.012, 5, 8), P.brass, { bone: jaw, at: [s * 0.2, 0.72, 0.3], dir: [0, 1, 0], axis: "z" });
    cone(0.03, 0.08, P.beard, [s * 0.2, 0.66, 0.3], [0, -1, 0], jaw, 5);
  }
  void r; void frame; void M;
}
    return buildHead;
  })(),
  // armsAndHammer
  (() => {
function buildArmsAndHammer({ b, J, P, M }: any) {
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number) => new THREE.SphereGeometry(r, 8, 6);

  // Arm: upper arm + forearm + elbow pad + cuff + studs + pauldron + glove
  function arm(sh: any, el: any, hd: any, hp: number[], ep: number[], hand: number[], side: number) {
    b.capsule(hp, ep, 0.085, P.tunic, { bone: sh });
    b.capsule(ep, hand, 0.075, P.tunic, { bone: el });
    b.part(sph(0.1), P.steel, { bone: el, at: ep });
    // cuff
    const d = V(hand).sub(V(ep)).normalize();
    const cuffAt = V(hand).addScaledVector(d, -0.07).toArray();
    b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.06, 8), P.leather, { bone: el, at: cuffAt, dir: d.toArray() });
    // studs
    for (let i = 0; i < 4; i++) {
      const p = V(ep).lerp(V(hand), 0.3 + i * 0.13);
      b.part(sph(0.012), P.brass, { bone: el, at: [p.x, p.y + 0.075, p.z] });
    }
    // pauldron
    b.part(sph(0.13), P.steel, { bone: sh, at: [hp[0] + side * 0.02, hp[1] + 0.03, hp[2]], scale: [1, 0.7, 1] });
    b.part(new THREE.TorusGeometry(0.12, 0.014, 5, 10), P.brass, { bone: sh, at: [hp[0] + side * 0.02, hp[1] + 0.03, hp[2]], rotation: [90, 0, 0] });
    // glove
    b.part(box(0.15, 0.15, 0.16), P.glove, { bone: hd, at: hand });
    b.part(box(0.17, 0.05, 0.1), P.leather, { bone: hd, at: [hand[0], hand[1], hand[2] + 0.08] });
    b.part(box(0.05, 0.1, 0.07), P.glove, { bone: hd, at: [hand[0] - side * 0.1, hand[1] + 0.02, hand[2] + 0.04] });
  }

  const sL = M.shoulderL, sR = M.shoulderR;
  const elL = [0.44, 0.86, 0.18], hL = [0.34, 0.72, 0.46];
  const elR = [-0.4, 1.28, 0.16], hR = M.hammerGrip;
  arm(J.shoulderL, J.elbowL, J.handL, sL, elL, hL, 1);
  arm(J.shoulderR, J.elbowR, J.handR, sR, elR, hR, -1);

  // Hammer: handle vertical-ish at grip
  const g = V(hR);
  const bot = [g.x, g.y - 0.3, g.z], top = [g.x, g.y + 0.35, g.z];
  b.rod(bot, top, 0.03, P.wood, { bone: J.handR });
  b.part(sph(0.04), P.woodDark, { bone: J.handR, at: bot });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 8), P.leatherDark, { bone: J.handR, at: [g.x, g.y - 0.2 + i * 0.1, g.z] });
  const hc = [g.x, g.y + 0.36, g.z];
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), P.brass, { bone: J.handR, at: hc });
  b.part(box(0.38, 0.17, 0.17), P.iron, { bone: J.handR, at: [hc[0], hc[1] + 0.06, hc[2]] });
  for (const s of [1, -1]) {
    b.part(box(0.06, 0.2, 0.2), P.steel, { bone: J.handR, at: [hc[0] + s * 0.21, hc[1] + 0.06, hc[2]] });
    b.part(box(0.02, 0.1, 0.1), P.steelDark, { bone: J.handR, at: [hc[0] + s * 0.245, hc[1] + 0.06, hc[2]] });
  }
  glow(b.part(box(0.2, 0.1, 0.01), P.runeBlue, { bone: J.handR, at: [hc[0], hc[1] + 0.06, hc[2] + 0.088] }), 1.6);
  glow(b.part(box(0.04, 0.1, 0.01), P.runeBlue, { bone: J.handR, at: [hc[0], hc[1] + 0.06, hc[2] - 0.088] }), 1.6);

  // Tongs
  const t = V(M.tongsGrip);
  for (const s of [1, -1]) {
    b.rod([t.x + s * 0.02, t.y, t.z - 0.08], [t.x + s * 0.012, t.y - 0.1, t.z + 0.3], 0.011, P.iron, { bone: J.handL });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), P.iron, { bone: J.handL, at: [t.x, t.y, t.z + 0.0], dir: [1, 0, 0] });
  b.part(sph(0.015), P.brass, { bone: J.handL, at: [t.x + 0.02, t.y, t.z] });
  b.rod([t.x, t.y - 0.1, t.z + 0.26], [t.x, t.y - 0.1, t.z + 0.5], 0.016, P.iron, { bone: J.handL });
  glow(b.rod([t.x, t.y - 0.1, t.z + 0.4], [t.x, t.y - 0.1, t.z + 0.52], 0.016, P.ember, { bone: J.handL }), 1.4);
  glow(b.part(sph(0.02), P.emberCore, { bone: J.handL, at: [t.x, t.y - 0.1, t.z + 0.53] }), 1.8);
}
    return buildArmsAndHammer;
  })(),
  // legsAndBoots
  (() => {
function buildLegsAndBoots({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, ws = 8, hs = 6) => new THREE.SphereGeometry(r, ws, hs);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = s > 0 ? J.hipL : J.hipR;
    const knee = s > 0 ? J.kneeL : J.kneeR;
    const ankle = s > 0 ? J.ankleL : J.ankleR;
    const x = s * 0.17;

    // Thigh and shin (chunky trousers)
    b.rod([x, 0.56, 0.0], [x, 0.3, 0.02], [0.115, 0.1], P.leatherDark, { bone: hip, caps: "round" });
    b.rod([x, 0.3, 0.02], [x, 0.17, -0.01], [0.095, 0.088], P.leatherDark, { bone: knee, caps: "round" });
    // trouser wrinkle bands
    for (let i = 0; i < 3; i++) {
      b.part(box(0.2, 0.012, 0.19), P.boot, { bone: hip, at: [x, 0.5 - i * 0.07, 0.0] });
    }
    // knee patch + steel pad
    b.part(box(0.15, 0.1, 0.03), P.tunic, { bone: knee, at: [x, 0.3, 0.1] });
    b.part(sph(0.07, 8, 5), P.steel, { bone: knee, at: [x, 0.3, 0.115], scale: [1, 0.9, 0.55] });
    b.part(cyl(0.075, 0.075, 0.015, 8), P.steelDark, { bone: knee, at: [x, 0.3, 0.12], dir: [0, 0, 1] });
    for (const a of [-1, 1]) {
      b.part(sph(0.012, 5, 4), P.brass, { bone: knee, at: [x + a * 0.05, 0.3 + 0.035, 0.135] });
      b.part(sph(0.012, 5, 4), P.brass, { bone: knee, at: [x + a * 0.05, 0.3 - 0.035, 0.135] });
    }

    // Boot shaft
    b.part(cyl(0.1, 0.108, 0.17, 8), P.boot, { bone: ankle, at: [x, 0.12, -0.02] });
    // sock peek
    b.part(cyl(0.098, 0.098, 0.03, 8), "#d8c9a0", { bone: ankle, at: [x, 0.225, -0.02] });
    b.part(cyl(0.1, 0.1, 0.012, 8), "#a8392e", { bone: ankle, at: [x, 0.213, -0.02] });
    // folded cuff
    b.part(cyl(0.118, 0.118, 0.045, 8), P.leather, { bone: ankle, at: [x, 0.185, -0.02] });
    b.part(cyl(0.12, 0.12, 0.01, 8), P.leatherDark, { bone: ankle, at: [x, 0.16, -0.02] });
    // buckle
    b.part(box(0.04, 0.035, 0.012), P.brass, { bone: ankle, at: [x + s * 0.0, 0.185, 0.104] });
    b.part(box(0.022, 0.02, 0.014), P.boot, { bone: ankle, at: [x, 0.185, 0.106] });

    // Foot: heel + wide toe box
    b.part(box(0.2, 0.1, 0.16), P.boot, { bone: ankle, at: [x, 0.07, -0.04] });
    b.part(box(0.23, 0.11, 0.2), P.boot, { bone: ankle, at: [x, 0.065, 0.1] });
    b.part(sph(0.115, 8, 6), P.boot, { bone: ankle, at: [x, 0.06, 0.2], scale: [1, 0.72, 1.0] });
    // steel toe cap
    b.part(sph(0.1, 8, 6), P.steel, { bone: ankle, at: [x, 0.06, 0.245], scale: [1.08, 0.7, 0.8] });
    b.part(box(0.2, 0.012, 0.03), P.steelDark, { bone: ankle, at: [x, 0.09, 0.2] });
    // tongue & laces
    b.part(box(0.07, 0.05, 0.1), P.leather, { bone: ankle, at: [x, 0.13, 0.08], rotation: [-30, 0, 0] });
    for (let i = 0; i < 3; i++) {
      b.part(box(0.1, 0.008, 0.01), "#d8c9a0", { bone: ankle, at: [x, 0.135 + i * 0.006 - 0.005, 0.05 + i * 0.03 + 0.02], rotation: [-30, 0, 0] });
    }
    // stacked soles
    b.part(box(0.22, 0.02, 0.2), P.leatherDark, { bone: ankle, at: [x, 0.01, -0.04] });
    b.part(box(0.25, 0.02, 0.26), P.leatherDark, { bone: ankle, at: [x, 0.01, 0.13] });
    b.part(sph(0.125, 8, 4), P.leatherDark, { bone: ankle, at: [x, 0.01, 0.24], scale: [1, 0.16, 0.95] });
    b.part(box(0.21, 0.018, 0.06), P.boot, { bone: ankle, at: [x, 0.028, -0.1] });
    // stitched welt
    for (let i = 0; i < 6; i++) {
      const z = -0.08 + i * 0.07;
      b.part(box(0.005, 0.008, 0.02), P.glove, { bone: ankle, at: [x + 0.126 * (i < 5 ? 1 : 0.9) * 1, 0.032, z] });
      b.part(box(0.005, 0.008, 0.02), P.glove, { bone: ankle, at: [x - 0.126 * (i < 5 ? 1 : 0.9), 0.032, z] });
    }
    // mud flecks
    for (let i = 0; i < 4; i++) {
      b.part(sph(0.012 + R() * 0.01, 5, 4), P.woodDark, { bone: ankle, at: [x + (R() - 0.5) * 0.18, 0.04 + R() * 0.03, 0.25 - R() * 0.05], scale: [1, 0.5, 1] });
    }
  }
}
    return buildLegsAndBoots;
  })(),
  // anvilAndStump
  (() => {
function buildAnvilAndStump({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const SC = [0, 0, 0.5]; // stump centre
  const SH = 0.5; // stump height
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (rt: number, rb: number, h: number, n: number, c: string, at: number[], o: any = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, n), c, at, o);

  // Stump
  cyl(0.34, 0.4, SH, 12, P.wood, [SC[0], SH / 2, SC[2]]);
  // root flare
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    box(0.16, 0.12, 0.1, P.woodDark, [Math.sin(a) * 0.38, 0.06, SC[2] + Math.cos(a) * 0.38], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // bark rings on side
  for (const y of [0.1, 0.25, 0.4]) cyl(0.375 - (y - 0.1) * 0.12 + 0.012, 0.375 - (y - 0.1) * 0.12 + 0.012, 0.03, 12, P.woodDark, [0, y, SC[2]]);
  // bark vertical ridges
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r = 0.36;
    box(0.04, 0.4, 0.03, P.woodDark, [Math.sin(a) * r, 0.25, SC[2] + Math.cos(a) * r], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // top disc rings
  cyl(0.33, 0.33, 0.012, 12, "#a56a38", [0, SH + 0.004, SC[2]]);
  for (const r of [0.3, 0.22]) {
    b.part(new THREE.TorusGeometry(r, 0.006, 4, 16), P.woodDark, { at: [0, SH + 0.012, SC[2]], rotation: [90, 0, 0], flat: true });
  }
  // knot
  cyl(0.05, 0.05, 0.02, 7, P.woodDark, [0.2, SH + 0.01, SC[2] + 0.12]);

  // Steel plate pad
  box(0.62, 0.03, 0.34, P.steel, [0, SH + 0.03, SC[2]]);
  const y0 = SH + 0.045;
  // Feet
  box(0.46, 0.05, 0.26, P.iron, [0, y0 + 0.025, SC[2]]);
  // Waist
  box(0.3, 0.14, 0.18, P.iron, [0, y0 + 0.12, SC[2]]);
  // Body upper
  box(0.62, 0.1, 0.24, P.iron, [-0.02, y0 + 0.24, SC[2]]);
  // Top face (steel)
  box(0.64, 0.035, 0.25, P.steel, [-0.02, y0 + 0.31, SC[2]]);
  const topY = y0 + 0.33;
  // Heel block
  box(0.18, 0.12, 0.26, P.iron, [-0.36, y0 + 0.22, SC[2]]);
  // Hardy hole
  box(0.04, 0.006, 0.04, P.coal, [-0.28, topY, SC[2]]);
  b.part(new THREE.TorusGeometry(0.035, 0.008, 4, 8), P.steelDark, { at: [-0.4, topY + 0.001, SC[2]], rotation: [90, 0, 0], flat: true });
  // Horn
  b.part(new THREE.ConeGeometry(0.115, 0.4, 8), P.iron, { at: [0.55, y0 + 0.24, SC[2]], rotation: [0, 0, -90], flat: true });
  box(0.1, 0.1, 0.22, P.iron, [0.36, y0 + 0.245, SC[2]]);
  // Hot spot
  glow(box(0.14, 0.008, 0.1, P.ember, [0.0, topY + 0.004, SC[2]]), 1.6);
  glow(box(0.07, 0.01, 0.05, P.emberCore, [0.0, topY + 0.008, SC[2]]), 2);
  // highlight edge
  box(0.64, 0.01, 0.01, "#b8c0c8", [-0.02, topY - 0.006, SC[2] + 0.125]);
  // Rivet plates
  for (const s of [1, -1]) {
    box(0.07, 0.012, 0.07, P.brass, [s * 0.2, y0 + 0.056, SC[2] + 0.14]);
    cyl(0.01, 0.01, 0.014, 6, P.steelDark, [s * 0.2, y0 + 0.064, SC[2] + 0.14]);
  }
  // Tool rack along stump front
  const rz = SC[2] + 0.4;
  box(0.46, 0.04, 0.05, P.iron, [-0.05, 0.4, rz]);
  for (const s of [-1, 1]) box(0.03, 0.12, 0.03, P.iron, [-0.05 + s * 0.2, 0.34, rz - 0.02]);
  // punch
  cyl(0.008, 0.016, 0.26, 6, P.steelDark, [-0.2, 0.52, rz]);
  b.part(new THREE.ConeGeometry(0.008, 0.04, 6), P.steel, { at: [-0.2, 0.67, rz], flat: true });
  // flatter
  cyl(0.012, 0.012, 0.24, 6, P.wood, [-0.05, 0.52, rz]);
  box(0.08, 0.04, 0.04, P.steel, [-0.05, 0.66, rz]);
  // cut hardy
  cyl(0.012, 0.012, 0.2, 6, P.steelDark, [0.1, 0.5, rz]);
  b.part(new THREE.ConeGeometry(0.03, 0.06, 3), P.steel, { at: [0.1, 0.63, rz], rotation: [180, 0, 0], flat: true });
  // Tongs laid across corner
  const tc = [0.28, SH + 0.03, SC[2] - 0.12];
  for (const s of [1, -1]) {
    b.rod([tc[0] - 0.2, tc[1] + 0.012, tc[2] + s * 0.012], [tc[0] + 0.22, tc[1] + 0.01, tc[2] + s * 0.035 + 0.1], 0.009, P.iron);
    b.rod([tc[0] - 0.2, tc[1] + 0.012, tc[2] + s * 0.012], [tc[0] - 0.4, tc[1] + 0.01, tc[2] + s * 0.07], 0.01, P.iron);
  }
  cyl(0.016, 0.016, 0.03, 8, P.steelDark, [tc[0] - 0.2, tc[1] + 0.03, tc[2]]);
  // wood chips
  for (let i = 0; i < 5; i++) box(0.04, 0.012, 0.025, P.woodDark, [(R() - 0.5) * 1.4, 0.006, 0.2 + R() * 0.7], { rotation: [0, R() * 180, 0] });
}
    return buildAnvilAndStump;
  })(),
  // forge
  (() => {
function buildForge({ b, P }: any) {
  const r = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...(rot ? { rotation: rot } : {}) });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], ...(rot ? { rotation: rot } : {}) });

  // hearth: stacked offset stone blocks
  const zc = -0.75;
  box(1.7, 0.74, 0.46, P.stoneDark, 0, 0.37, zc);
  for (let row = 0; row < 4; row++) {
    const y = 0.09 + row * 0.18;
    const n = 5;
    for (let i = 0; i < n; i++) {
      const w = 1.7 / n;
      const x = -0.85 + w * (i + 0.5) + (row % 2 ? 0.08 : -0.02);
      if (Math.abs(x) > 0.86 - w / 2 + 0.1) continue;
      box(w - 0.025, 0.165, 0.5 + r() * 0.02, P.stone, x, y, zc + (r() - 0.5) * 0.02);
    }
  }
  // top slab with firebox opening
  box(1.72, 0.08, 0.52, P.stone, 0, 0.78, zc);
  // firebox cavity
  box(1.0, 0.34, 0.1, P.coal, 0, 0.5, -0.52);
  box(1.04, 0.05, 0.14, P.iron, 0, 0.7, -0.5);
  box(0.06, 0.4, 0.14, P.iron, -0.52, 0.5, -0.5);
  box(0.06, 0.4, 0.14, P.iron, 0.52, 0.5, -0.5);
  // coal bed
  box(0.96, 0.08, 0.2, P.coal, 0, 0.3, -0.54);
  for (let i = 0; i < 12; i++) {
    const x = -0.42 + i * 0.077;
    const hot = i % 3 === 0;
    const s = 0.07 + r() * 0.05;
    glow(b.part(new THREE.DodecahedronGeometry(s, 0), hot ? P.emberCore : P.ember, { at: [x, 0.37 + r() * 0.03, -0.54 + (r() - 0.5) * 0.1] }), hot ? 2 : 1.5);
    if (i % 2) b.part(new THREE.DodecahedronGeometry(0.05, 0), P.coal, { at: [x + 0.03, 0.42, -0.6] });
  }
  glow(box(0.8, 0.03, 0.04, P.ember, 0, 0.62, -0.5), 1.2);
  // fire bars
  for (let i = 0; i < 6; i++) box(0.025, 0.36, 0.025, P.iron, -0.4 + i * 0.16, 0.5, -0.48);
  // hood
  b.part(new THREE.CylinderGeometry(0.3, 0.62, 0.7, 4), P.iron, { at: [0, 1.2, zc], rotation: [0, 45, 0], scale: [1.2, 1, 0.55] });
  box(1.0, 0.05, 0.1, P.steelDark, 0, 0.86, -0.5);
  // chimney
  box(0.34, 0.6, 0.3, P.stone, 0, 1.75, zc - 0.02);
  box(0.4, 0.05, 0.36, P.stoneDark, 0, 2.06, zc - 0.02);
  box(0.37, 0.06, 0.33, P.brass, 0, 1.55, zc - 0.02);
  // smoke puffs (kept inside height spec budget loosely)
  [[0, 1.98, 0.09], [0.04, 2.0, 0.08], [-0.02, 2.02, 0.065]].forEach(([x, y, s], i) => {
    if (i === 0) return;
  });
  // lintel and embers on lip
  for (let i = 0; i < 5; i++) glow(box(0.035, 0.035, 0.035, P.emberCore, -0.7 + i * 0.35 + r() * 0.1, 0.83, -0.46 + r() * 0.05, [r() * 40, r() * 40, 0]), 2);

  // side rack (right side, x=-0.9 side)
  const rx = 0.98;
  box(0.07, 1.2, 0.07, P.wood, rx, 0.6, -0.7);
  box(0.07, 1.2, 0.07, P.wood, rx, 0.6, -0.9);
  box(0.06, 0.06, 0.3, P.woodDark, rx, 1.0, -0.8);
  box(0.06, 0.06, 0.3, P.woodDark, rx, 0.7, -0.8);
  // poker
  cyl(0.012, 0.012, 1.0, P.iron, rx + 0.07, 0.55, -0.8, 6, [0, 0, 5]);
  box(0.05, 0.05, 0.05, P.iron, rx + 0.1, 1.06, -0.8);
  // shovel
  cyl(0.014, 0.014, 0.9, P.wood, rx + 0.12, 0.6, -0.72, 6, [0, 0, -4]);
  box(0.16, 0.2, 0.02, P.iron, rx + 0.1, 0.12, -0.72);
  // rake
  cyl(0.014, 0.014, 0.9, P.wood, rx + 0.12, 0.6, -0.9, 6, [0, 0, -4]);
  box(0.2, 0.04, 0.03, P.iron, rx + 0.1, 0.14, -0.9);
  for (let i = 0; i < 4; i++) box(0.015, 0.1, 0.015, P.iron, rx + 0.1, 0.07, -0.98 + i * 0.055);

  // bellows on left side
  const bx = -0.98;
  box(0.34, 0.04, 0.5, P.wood, bx, 0.3, -0.75, [0, 0, 20]);
  box(0.34, 0.04, 0.5, P.woodDark, bx - 0.05, 0.12, -0.75, [0, 0, 0]);
  box(0.3, 0.2, 0.44, P.leather, bx - 0.02, 0.22, -0.75, [0, 0, 10]);
  box(0.28, 0.025, 0.46, P.leatherDark, bx - 0.02, 0.22, -0.75);
  cyl(0.025, 0.02, 0.4, P.brass, bx + 0.25, 0.28, -0.75, 6, [0, 0, 80]);

  // coal pile
  for (let i = 0; i < 9; i++)
    b.part(new THREE.DodecahedronGeometry(0.05 + r() * 0.03, 0), i % 4 ? P.coal : P.stoneDark, { at: [0.5 + r() * 0.3, 0.05, -0.36 + r() * 0.1] });
  glow(b.part(new THREE.DodecahedronGeometry(0.03, 0), P.ember, { at: [0.6, 0.1, -0.35] }), 1.5);
}
    return buildForge;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.55,0], dir: [0,1,0], role: "spine" });
  J["spine"] = b.joint("spine", { parent: J["hips"], at: [0,0.72,0], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine"], at: [0,0.92,0.02], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.08,0.02], dir: [0,1,0], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.18,0.03], dir: [0,0.2,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.16,0.12], dir: [0,-0.3,1], role: "jaw" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.28,1.02,0.02], dir: [1,0,0], role: "arm" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.44,0.86,0.18], dir: [1,-0.7,0.6], role: "arm" });
  J["handL"] = b.joint("handL", { parent: J["elbowL"], at: [0.34,0.72,0.46], dir: [0.5,-0.4,1], role: "arm" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.28,1.02,0.02], dir: [-1,0,0], role: "arm" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.4,1.28,0.16], dir: [-0.6,1,0.3], role: "arm" });
  J["handR"] = b.joint("handR", { parent: J["elbowR"], at: [0.42,1.62,0.3], dir: [1,0.2,0.3], role: "arm" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.16,0.55,0], dir: [0,-1,0], role: "leg" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.17,0.3,0.02], dir: [0,-1,0], role: "leg" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.17,0.09,-0.02], dir: [0,-1,0], role: "leg" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.16,0.55,0], dir: [0,-1,0], role: "leg" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.17,0.3,0.02], dir: [0,-1,0], role: "leg" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.17,0.09,-0.02], dir: [0,-1,0], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
