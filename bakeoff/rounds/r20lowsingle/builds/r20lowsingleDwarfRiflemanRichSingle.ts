import * as THREE from "three";
import { glow } from "../../../../kits/glow";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { lerp, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { grain, mix, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout 1.4 m dwarf marksman in plate pauldrons and a gold-trimmed cuirass, with a braided auburn beard, horned helmet, bandolier and a brass-mouthed blunderbuss with glowing rune inlay.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const SKIN = "#d79a6c";
const SKIN_HI = "#f2bb8c";
const SKIN_LO = "#94563a";
const NOSE = "#d9806a";
const BEARD = "#b8531f";
const BEARD_HI = "#f08a3a";
const BEARD_MID = "#d86a2a";
const BEARD_LO = "#58230f";
const STEEL = "#8a9bb0";
const STEEL_HI = "#e2ecf8";
const STEEL_LO = "#3a4256";
const GOLD = "#e2b23c";
const GOLD_HI = "#fff0a0";
const GOLD_LO = "#8a5a14";
const LEATHER = "#7a4a28";
const LEATHER_HI = "#b8814a";
const LEATHER_LO = "#35200f";
const CLOTH = "#2d4f9c";
const CLOTH_HI = "#6a93e0";
const CLOTH_LO = "#13214c";
const PANTS = "#5a3d2c";
const PANTS_HI = "#8a6446";
const WOOD = "#8a5530";
const WOOD_LO = "#4e2a14";
const BRASS = "#cf9a3e";
const IVORY = "#efe3c4";
const IVORY_LO = "#b79c6c";
const DARK = "#1b130e";
const EYEW = "#f6f0e0";
const IRIS = "#3a8fd9";
const RED = "#b83a2a";
const SCAR = "#c0605a";
const PIPE = "#5a3a22";
const EMBER = "#ff7a1a";
const GLOVE = "#4a2e18";
const CANVAS = "#8c6a3e";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// A hand-painted look: light from above-front, a warm highlight, a cool shadow, and mottled brush variation.
const hand = (midC: string, hi: string, lo: string, size = 0.06, seed = 1) =>
  paint((p, n) => {
    const l = smoothstep(-0.6, 0.9, n.x * 0.25 + n.y * 0.75 + n.z * 0.45);
    const c = l < 0.5 ? mix(lo, midC, l * 2) : mix(midC, hi, (l - 0.5) * 2);
    const k = (noise(p, size, seed) - 0.5) * 0.5;
    return mix(c, k > 0 ? hi : lo, Math.abs(k));
  });

// The same light and shadow laid over a patterned base paint.
const shaded = (base: Paint, hi: string, lo: string) =>
  paint((p, n) => {
    const l = smoothstep(-0.5, 0.9, n.y * 0.6 + n.z * 0.5 + n.x * 0.2);
    const c = base.at(p, n);
    return mix(mix(c, lo, 0.4 * (1 - l)), hi, 0.3 * l * l);
  });

// A torus lying flat around the Y axis.
const hoop = (r: number, t: number, seg = 10) => new THREE.TorusGeometry(r, t, 5, seg).rotateX(Math.PI / 2);

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman", paintSize: 2048 });
  const rand = rng(11);

  // ------------------------------------------------------------ paints
  const SKINP = hand(SKIN, SKIN_HI, SKIN_LO, 0.05, 2);
  const NOSEP = hand(NOSE, "#f4a58c", "#8e4638", 0.03, 3);
  const BEARDP = shaded(grain(BEARD, BEARD_LO, { size: 0.012, axis: "y", seed: 4 }), BEARD_HI, "#3a1508");
  const BEARDF = hand(BEARD, BEARD_HI, BEARD_LO, 0.03, 5);
  const STEELP = hand(STEEL, STEEL_HI, STEEL_LO, 0.04, 6);
  const GOLDP = hand(GOLD, GOLD_HI, GOLD_LO, 0.03, 7);
  const LEATHERP = hand(LEATHER, LEATHER_HI, LEATHER_LO, 0.05, 8);
  const BOOTP = hand("#4a3020", "#7a5236", LEATHER_LO, 0.04, 9);
  const CLOTHP = hand(CLOTH, CLOTH_HI, CLOTH_LO, 0.07, 10);
  const PANTSP = hand(PANTS, PANTS_HI, "#2a1a12", 0.06, 12);
  const GLOVEP = hand(GLOVE, "#7a5030", "#1e1008", 0.03, 13);
  const BRASSP = hand(BRASS, "#ffe08a", "#6a4012", 0.03, 14);
  const HORNP = shaded(stripes(IVORY, IVORY_LO, { size: 0.035, axis: "y", width: 0.3, seed: 15 }), "#fff8e0", "#6a5030");
  const CANVASP = hand(CANVAS, "#c8a468", "#4a3a22", 0.05, 16);
  const woodGrain = grain(WOOD, WOOD_LO, { size: 0.01, axis: [0.03, 0.15, 0.99], seed: 17 });
  const WOODP = shaded(woodGrain, "#e0a060", "#2a160a");
  const BARRELP = hand("#56606e", "#a9b6c6", "#232a36", 0.03, 18);

  // The tabard: blue field, gold border, red centre stripe, gold hem following the pointed bottom edge.
  const TABP = paint((p, n, s) => {
    const x = Math.abs(s[0]);
    const y = s[1];
    const edgeY = -0.27 + (x / 0.12) * 0.07;
    const base = CLOTHP.at(p, n);
    if (x > 0.103 || y > -0.014 || y < edgeY + 0.02) return GOLD;
    if (x < 0.014) return RED;
    if (x > 0.075 && x < 0.083) return mix(base, "#ffffff", 0.25);
    return base;
  });

  // ------------------------------------------------------------ textures
  const TUFT = svg(
    `<svg viewBox="0 0 32 64"><path d="M10 64 C3 44 8 20 16 0 C24 20 29 44 22 64Z" fill="#ffffff"/><path d="M16 6 L16 60" stroke="#aaaaaa" stroke-width="3"/><path d="M12 62 C9 44 12 26 16 10" stroke="#cccccc" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 100 36"><g fill="none" stroke="#ffc24a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6 V30 M8 6 L20 12 L8 18"/><path d="M30 6 L42 18 L30 30 M42 6 V30"/><path d="M52 18 H64 M58 6 V30 M52 6 L64 6"/><path d="M74 30 L80 6 L86 30 M76 20 H84"/><path d="M94 6 V30"/></g></svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.52, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.52, 0],
      [0, 0.74, 0],
      [0, 0.96, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.97, 0.02], aim: [0, 1.05, 0.04], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.04, 0.04], aim: [0, 1.2, 0.05], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.1, 0.06], aim: [0, 1.07, 0.17], role: "jaw" });

  // ------------------------------------------------------------ torso
  const torso = b.loft(
    [
      { at: [0, 0.46, -0.01], w: 0.36, h: 0.28 },
      { at: [0, 0.62, 0.03], w: 0.42, h: 0.34 },
      { at: [0, 0.82, 0.01], w: 0.5, h: 0.32 },
      { at: [0, 0.95, 0], w: 0.52, h: 0.28 },
      { at: [0, 0.995, 0], w: 0.3, h: 0.2 },
    ],
    { bone: spine, caps: "flat", color: CLOTHP },
  );
  const plate = b.loft(
    [
      { at: [0, 0.68, 0.03], w: 0.48, h: 0.37 },
      { at: [0, 0.82, 0.01], w: 0.55, h: 0.35 },
      { at: [0, 0.93, 0], w: 0.56, h: 0.31 },
    ],
    { bone: spine, caps: "flat", color: STEELP },
  );
  const chestSurf = b.surface([torso, plate]);
  const torsoSurf = b.surface(torso);
  const plateSurf = b.surface(plate);

  // gold trims on the cuirass: lower and upper rims and a centre ridge
  b.sweep(plateSurf.loop(frame([0, 0.7, 0], [0, 1, 0]), { lift: 0.008 }), 0.014, { color: GOLDP, sides: 6 });
  b.sweep(plateSurf.loop(frame([0, 0.91, 0], [0, 1, 0]), { lift: 0.008 }), 0.014, { color: GOLDP, sides: 6 });
  b.sweep(plate.line(180, 0.008), 0.012, { color: GOLDP, sides: 6 });
  for (const s of [1, -1]) {
    for (const y of [0.76, 0.84]) {
      const h = plateSurf.ray([s * 0.12, y, 1], [0, 0, -1]);
      if (h) b.stick(new THREE.SphereGeometry(0.016, 6, 4), GOLD, h, { embed: 0.4 });
    }
  }

  // belt and buckle
  b.sweep(torsoSurf.loop(frame([0, 0.55, 0], [0, 1, 0]), { lift: 0.015 }), 0.03, { color: LEATHERP, sides: 8 });
  const buckleHit = torsoSurf.ray([0, 0.55, 1], [0, 0, -1]);
  if (buckleHit) {
    b.stick(new THREE.BoxGeometry(0.11, 0.03, 0.085), GOLD, buckleHit, { embed: 0.3 });
    b.stick(new THREE.BoxGeometry(0.06, 0.036, 0.045), DARK, buckleHit, { embed: 0.1 });
  }

  // tabard front and leather rear flap
  const tabOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.12, 0],
    [0.12, 0],
    [0.12, -0.19],
    [0, -0.27, "sharp"],
    [-0.12, -0.19],
  ];
  b.extrude(tabOutline, {
    at: [0, 0.565, 0.18],
    x: [1, 0, 0],
    y: [0, 1, 0.15],
    thickness: 0.02,
    bevel: 0.005,
    color: TABP,
    bone: hips,
  });
  b.extrude(tabOutline, {
    at: [0, 0.565, -0.17],
    x: [1, 0, 0],
    y: [0, 1, -0.1],
    thickness: 0.02,
    bevel: 0.005,
    color: LEATHERP,
    bone: hips,
  });

  // belt pouches, powder horn
  b.part(new THREE.BoxGeometry(0.08, 0.1, 0.06), LEATHERP, { bone: hips, at: [0.2, 0.48, 0.12], rotation: [0, 28, 0] });
  b.part(new THREE.BoxGeometry(0.084, 0.03, 0.064), LEATHER_HI, { bone: hips, at: [0.2, 0.525, 0.12], rotation: [0, 28, 0] });
  b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { bone: hips, at: [0.225, 0.512, 0.15] });
  b.part(new THREE.BoxGeometry(0.09, 0.11, 0.06), LEATHERP, { bone: hips, at: [-0.2, 0.48, 0.1], rotation: [0, -28, 0] });
  b.part(new THREE.BoxGeometry(0.094, 0.03, 0.064), LEATHER_HI, { bone: hips, at: [-0.2, 0.53, 0.1], rotation: [0, -28, 0] });
  b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { bone: hips, at: [-0.225, 0.517, 0.13] });
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.05), LEATHERP, { bone: hips, at: [0.1, 0.49, -0.17], rotation: [0, 12, 0] });
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.05), LEATHERP, { bone: hips, at: [-0.1, 0.49, -0.17], rotation: [0, -12, 0] });
  const hornP0 = V(0.22, 0.6, 0.12);
  const hornP1 = V(0.3, 0.52, 0.16);
  const hornP2 = V(0.29, 0.4, 0.13);
  b.sweep(bezier(hornP0, hornP1, hornP2), [0.036, 0.008], { color: HORNP, bone: hips, caps: { start: "flat", end: "point" } });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 8), BRASSP, { bone: hips, at: hornP0, dir: hornP1.clone().sub(hornP0) });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { bone: hips, at: V(0.29, 0.402, 0.13) });

  // bandolier across the chest with pouches and cartridges
  const strapRough = catmull(
    [
      [-0.18, 0.94, 0.12],
      [-0.05, 0.8, 0.22],
      [0.1, 0.66, 0.22],
      [0.24, 0.54, 0.14],
      [0.27, 0.52, -0.05],
      [0.15, 0.62, -0.16],
      [0, 0.78, -0.17],
      [-0.17, 0.94, -0.1],
      [-0.22, 0.97, 0.0],
    ],
    { closed: true },
  );
  const strapPath = chestSurf.drape(strapRough, { lift: 0.016 });
  b.sweep(strapPath, 0.026, { color: LEATHERP, sides: 6 });
  const shell = new THREE.CylinderGeometry(0.014, 0.014, 0.07, 6).rotateZ(Math.PI / 2);
  const pouch = new THREE.BoxGeometry(0.05, 0.055, 0.034);
  let strapIndex = 0;
  b.along(
    strapPath,
    8,
    (at) => {
      if (strapIndex++ % 2) b.stick(pouch, LEATHER_HI, at, { embed: 0.2 });
      else b.stick(shell, BRASSP, at, { embed: 0.25 });
    },
    { from: 0.04, to: 0.42 },
  );

  // gorget
  b.part(hoop(0.14, 0.028), STEELP, { bone: chest, at: [0, 0.975, 0.02], scale: [1, 1, 1.05] });
  b.part(hoop(0.14, 0.01), GOLDP, { bone: chest, at: [0, 1.0, 0.02], scale: [1, 1, 1.05] });

  // backpack, bedroll and cup
  b.part(new THREE.BoxGeometry(0.3, 0.34, 0.14), LEATHERP, { bone: chest, at: [0, 0.78, -0.225] });
  b.part(new THREE.BoxGeometry(0.31, 0.1, 0.15), LEATHER_HI, { bone: chest, at: [0, 0.91, -0.23] });
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.02), GOLD, { bone: chest, at: [0, 0.86, -0.31] });
  b.part(new THREE.BoxGeometry(0.1, 0.16, 0.08), LEATHERP, { bone: chest, at: [0.18, 0.7, -0.22] });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.09), LEATHER_HI, { bone: chest, at: [0.18, 0.79, -0.22] });
  b.part(new THREE.CylinderGeometry(0.04, 0.032, 0.07, 8), STEELP, { bone: chest, at: [-0.19, 0.72, -0.24] });
  b.part(hoop(0.041, 0.006), BRASS, { bone: chest, at: [-0.19, 0.752, -0.24] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.36, 10).rotateZ(Math.PI / 2), CANVASP, { bone: chest, at: [0, 1.015, -0.215] });
  for (const x of [-0.11, 0.11]) b.part(hoop(0.074, 0.011).rotateZ(Math.PI / 2), LEATHER_LO, { bone: chest, at: [x, 1.015, -0.215] });
  for (const x of [-0.17, 0.17]) b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.014, 8).rotateZ(Math.PI / 2), "#a98446", { bone: chest, at: [x, 1.015, -0.215] });

  // ------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${n}`,
      catmull([
        [s * 0.13, 0.5, 0],
        [s * 0.14, 0.27, 0.04],
        [s * 0.14, 0.09, 0],
      ]),
      {
        parent: hips,
        names: [`hip${n}`, `knee${n}`, `ankle${n}`],
        role: "leg",
        contact: [s * 0.14, 0, 0.05],
      },
    );
    b.sweep(leg, [0.1, 0.088, 0.078], { color: PANTSP });
    const knee = leg.joints[1];
    const ankle = leg.tip!;
    // boot shaft, folded cuff, strap and sole
    b.rod([s * 0.14, 0.075, 0], [s * 0.14, 0.27, 0.035], [0.092, 0.1], { color: BOOTP, bone: ankle });
    b.part(new THREE.CylinderGeometry(0.108, 0.1, 0.05, 10), LEATHERP, { bone: ankle, at: [s * 0.14, 0.255, 0.034] });
    b.part(hoop(0.098, 0.011), GOLDP, { bone: ankle, at: [s * 0.14, 0.18, 0.024] });
    b.part(new THREE.BoxGeometry(0.035, 0.03, 0.02), GOLD, { bone: ankle, at: [s * 0.14, 0.18, 0.126] });
    b.frustumBox([s * 0.14, 0.08, -0.03], [s * 0.14, 0.075, 0.2], [0.15, 0.14], [0.14, 0.11], { color: BOOTP, bone: ankle });
    b.part(new THREE.BoxGeometry(0.17, 0.035, 0.28), DARK, { bone: ankle, at: [s * 0.14, 0.0175, 0.085] });
    b.part(new THREE.BoxGeometry(0.152, 0.012, 0.03), LEATHER_HI, { bone: ankle, at: [s * 0.14, 0.146, 0.07] });
    b.part(new THREE.BoxGeometry(0.035, 0.014, 0.03), GOLD, { bone: ankle, at: [s * 0.14, 0.154, 0.07] });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), STEELP, { bone: ankle, at: [s * 0.14, 0.065, 0.17], scale: [1, 0.7, 0.9] });
    // knee pad
    b.part(new THREE.SphereGeometry(0.065, 8, 6), STEELP, { bone: knee, at: [s * 0.14, 0.28, 0.1], scale: [1, 1, 0.8] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone: knee, at: [s * 0.14, 0.28, 0.157] });
    b.part(hoop(0.066, 0.01), GOLDP, { bone: knee, at: [s * 0.14, 0.28, 0.1], rotation: [90, 0, 0], scale: [1, 1, 0.8] });
  }

  // ------------------------------------------------------------ gun frame of reference
  const G = V(-0.5, 0.78, 0.3);
  const D = V(0.03, 0.148, 0.989).normalize();
  const YP = V(0, 1, 0).addScaledVector(D, -D.y).normalize();
  const Pg = (u: number, v = 0) => G.clone().addScaledVector(D, u).addScaledVector(YP, v);
  const out = (p: THREE.Vector3, dx: number) => p.clone().add(V(dx, 0, 0));
  const H = Pg(-0.17, -0.115);

  // ------------------------------------------------------------ arms
  const makeArm = (s: number, sh: THREE.Vector3, el: THREE.Vector3, wr: THREE.Vector3) => {
    const n = s > 0 ? "L" : "R";
    const chain = b.chain(`arm${n}`, catmull([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`],
      role: "arm",
    });
    b.sweep(chain, [0.095, 0.08, 0.07], { color: CLOTHP, caps: { start: "round", end: "flat" } });
    const shoulder = chain.joints[0];
    const elbow = chain.joints[1];
    const tip = chain.tip!;
    const forearm = wr.clone().sub(el);
    // vambrace and gold cuffs
    b.rod(lerp(el, wr, 0.22), lerp(el, wr, 0.92), [0.087, 0.076], { color: STEELP, bone: elbow });
    b.part(hoop(0.09, 0.011), GOLDP, { bone: elbow, at: lerp(el, wr, 0.2), dir: forearm });
    b.part(hoop(0.08, 0.011), GOLDP, { bone: tip, at: lerp(el, wr, 0.93), dir: forearm });
    b.part(new THREE.SphereGeometry(0.08, 8, 6), STEELP, { bone: elbow, at: el, scale: [1, 1, 1] });
    b.part(new THREE.ConeGeometry(0.022, 0.07, 6), GOLD, { bone: elbow, at: el.clone().add(V(s * 0.04, 0, -0.06)), dir: [s * 0.4, 0, -1] });
    // layered pauldron with gold band and spike
    const tilt = -s * 20;
    b.part(new THREE.SphereGeometry(1, 10, 7), STEELP, { bone: shoulder, at: [s * 0.3, 1.0, 0], scale: [0.15, 0.09, 0.14], rotation: [0, 0, tilt] });
    b.part(new THREE.SphereGeometry(1, 10, 7), hand("#6f819a", STEEL_HI, STEEL_LO, 0.04, 21), {
      bone: shoulder,
      at: [s * 0.35, 0.945, 0],
      scale: [0.13, 0.07, 0.12],
      rotation: [0, 0, tilt * 1.4],
    });
    b.part(hoop(0.145, 0.012), GOLDP, { bone: shoulder, at: [s * 0.3, 1.0, 0], scale: [1.03, 1, 0.96], rotation: [0, 0, tilt] });
    b.part(new THREE.ConeGeometry(0.03, 0.09, 6), GOLD, { bone: shoulder, at: [s * 0.3, 1.075, 0], dir: [s * 0.3, 1, 0] });
    for (const a of [-0.7, 0, 0.7]) {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, {
        bone: shoulder,
        at: [s * (0.3 + 0.1 * Math.cos(a)), 1.045, 0.115 * Math.sin(a)],
      });
    }
    return chain;
  };

  const armR = makeArm(-1, V(-0.28, 0.93, 0), V(-0.42, 0.72, -0.04), V(-0.49, 0.69, 0.1));
  const armL = makeArm(1, V(0.28, 0.93, 0), V(0.43, 0.74, -0.02), V(0.5, 0.56, 0.04));
  const wristR = armR.tip!;
  const wristL = armL.tip!;

  // right fist gripping the blunderbuss
  b.part(new THREE.SphereGeometry(0.065, 8, 6), GLOVEP, { bone: wristR, at: H, scale: [0.9, 1, 1] });
  for (let i = 0; i < 4; i++) {
    const y = (i - 1.5) * 0.03;
    b.capsule(H.clone().add(V(0.045, y, 0.05)), H.clone().add(V(-0.05, y, 0.05)), 0.016, { color: GLOVEP, bone: wristR });
  }
  b.capsule(H.clone().add(V(0.03, 0.035, -0.05)), H.clone().add(V(-0.03, 0.06, 0.03)), 0.017, { color: GLOVEP, bone: wristR });

  // left hand hanging open
  const HL = V(0.515, 0.5, 0.06);
  b.part(new THREE.SphereGeometry(0.062, 8, 6), GLOVEP, { bone: wristL, at: HL, scale: [0.8, 1, 1] });
  for (let i = 0; i < 4; i++) {
    const base = HL.clone().add(V(0, -0.04, (i - 1.5) * 0.025));
    b.capsule(base, base.clone().add(V(-0.012, -0.065, 0.012)), 0.015, { color: GLOVEP, bone: wristL });
  }
  b.capsule(HL.clone().add(V(-0.03, 0, 0.07)), HL.clone().add(V(-0.03, -0.04, 0.105)), 0.016, { color: GLOVEP, bone: wristL });

  // ------------------------------------------------------------ blunderbuss
  const stockOutline: Array<[number, number]> = [
    [-0.42, 0.03],
    [-0.3, 0.0],
    [-0.12, -0.005],
    [0.35, -0.005],
    [0.35, -0.045],
    [0.0, -0.05],
    [-0.1, -0.05],
    [-0.14, -0.14],
    [-0.22, -0.14],
    [-0.22, -0.07],
    [-0.3, -0.1],
    [-0.42, -0.16],
  ];
  const stock = b.extrude(stockOutline, {
    at: Pg(0),
    x: D,
    y: YP,
    thickness: 0.05,
    bevel: 0.008,
    color: WOODP,
    bone: wristR,
  });
  // barrel with brass bands and a flared brass muzzle
  b.sweep([Pg(-0.06), Pg(0.5)], [0.034, 0.031, 0.03, 0.031, 0.034], {
    color: BARRELP,
    bone: wristR,
    sides: 8,
    smooth: false,
    caps: "flat",
  });
  for (const u of [-0.02, 0.14, 0.28, 0.42]) b.part(hoop(0.037, 0.0075), BRASSP, { bone: wristR, at: Pg(u), dir: D });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.05), BRASSP, { bone: wristR, at: Pg(-0.07, 0.03), dir: D, axis: "z", up: YP });
  const bellOutline: Array<[number, number]> = [
    [0, 0],
    [0.033, 0],
    [0.045, 0.04],
    [0.065, 0.09],
    [0.08, 0.13],
    [0.065, 0.135],
    [0.047, 0.09],
    [0.03, 0.04],
    [0, 0.03],
  ];
  b.lathe(bellOutline, { at: Pg(0.5), axis: D, segments: 10, color: BRASSP, bone: wristR });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 8), DARK, { bone: wristR, at: Pg(0.585), dir: D });
  b.part(hoop(0.079, 0.008), GOLDP, { bone: wristR, at: Pg(0.625), dir: D });
  b.part(hoop(0.05, 0.007), GOLDP, { bone: wristR, at: Pg(0.545), dir: D });
  // flintlock on the outer side
  const lockC = out(Pg(-0.15, -0.027), -0.029);
  b.part(new THREE.BoxGeometry(0.008, 0.05, 0.11), BRASSP, { bone: wristR, at: lockC, dir: D, axis: "z", up: YP });
  b.rod(out(Pg(-0.17, -0.03), -0.036), out(Pg(-0.12, 0.03), -0.036), 0.008, { color: STEELP, bone: wristR });
  b.part(new THREE.BoxGeometry(0.016, 0.02, 0.022), GOLD, { bone: wristR, at: out(Pg(-0.11, 0.036), -0.036), dir: D, axis: "z", up: YP });
  b.part(new THREE.BoxGeometry(0.02, 0.012, 0.04), BRASSP, { bone: wristR, at: out(Pg(-0.09, -0.012), -0.034), dir: D, axis: "z", up: YP });
  b.rod(out(Pg(-0.085, -0.008), -0.034), out(Pg(-0.075, 0.045), -0.034), 0.008, { color: STEELP, bone: wristR });
  for (const u of [-0.19, -0.11]) b.part(new THREE.SphereGeometry(0.007, 5, 4), GOLD, { bone: wristR, at: out(Pg(u, -0.045), -0.034) });
  // trigger guard and trigger
  b.sweep(catmull([Pg(-0.04, -0.05), Pg(-0.045, -0.1), Pg(-0.11, -0.115), Pg(-0.12, -0.075)]), 0.007, {
    color: BRASSP,
    bone: wristR,
    sides: 6,
  });
  b.rod(Pg(-0.075, -0.05), Pg(-0.085, -0.085), 0.006, { color: STEELP, bone: wristR });
  // ramrod, thimbles, butt plate, rivets
  b.rod(Pg(-0.02, -0.06), Pg(0.47, -0.06), 0.008, { color: STEELP, bone: wristR });
  for (const u of [0.08, 0.28]) b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.022, 6), BRASSP, { bone: wristR, at: Pg(u, -0.06), dir: D });
  b.part(new THREE.BoxGeometry(0.056, 0.19, 0.014), BRASSP, { bone: wristR, at: Pg(-0.417, -0.065), dir: D, axis: "z", up: YP });
  for (const u of [-0.36, -0.3, -0.25]) b.part(new THREE.SphereGeometry(0.007, 5, 4), GOLD, { bone: wristR, at: out(Pg(u, -0.045), -0.026) });
  // sling
  const slingA = Pg(-0.36, -0.07);
  const slingB = Pg(0.3, -0.06);
  const slingMid = slingA.clone().lerp(slingB, 0.5).add(V(0, -0.44, 0));
  b.sweep(bezier(slingA, slingMid, slingB), 0.012, { color: LEATHERP, bone: wristR, sides: 6 });
  // glowing runes on the stock
  glow(
    b.decal(stock, RUNE, {
      at: out(Pg(-0.28, -0.04), -0.025),
      dir: [-1, 0, 0],
      size: [0.14, 0.05],
      bone: wristR,
    }),
    1.3,
  );

  // ------------------------------------------------------------ head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKINP, {
    bone: head,
    at: [0, 1.16, 0.04],
    scale: [0.145, 0.14, 0.15],
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), SKINP, { bone: jaw, at: [0, 1.08, 0.09], scale: [0.1, 0.07, 0.09] });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), NOSEP, { bone: head, at: [0, 1.135, 0.205] });
  b.part(new THREE.SphereGeometry(0.048, 7, 5), SKINP, { bone: head, at: [0.085, 1.12, 0.145] });
  b.part(new THREE.SphereGeometry(0.048, 7, 5), SKINP, { bone: head, at: [-0.085, 1.12, 0.145] });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.03, 0.09, 5), SKINP, { bone: head, at: [s * 0.15, 1.18, 0.03], dir: [s, 0.35, -0.1] });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), EYEW, { bone: head, at: [s * 0.055, 1.185, 0.172] });
    b.part(new THREE.SphereGeometry(0.013, 6, 4), IRIS, { bone: head, at: [s * 0.055, 1.185, 0.188] });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), "#ffffff", { bone: head, at: [s * 0.05, 1.192, 0.199] });
    b.capsule([s * 0.095, 1.208, 0.15], [s * 0.02, 1.222, 0.178], 0.022, { color: BEARDF, bone: head });
    b.part(new THREE.SphereGeometry(0.05, 7, 5), BEARDF, { bone: head, at: [s * 0.12, 1.1, 0.1], scale: [0.7, 1.1, 1.1] });
  }
  b.rod([0.07, 1.22, 0.158], [0.1, 1.12, 0.14], 0.006, { color: SCAR, bone: head });

  // beard: main mass, braids, whiskers
  const beard = b.sweep(
    catmull([
      [0, 1.09, 0.11],
      [0, 0.99, 0.19],
      [0, 0.86, 0.23],
      [0, 0.72, 0.22],
      [0, 0.62, 0.19],
    ]),
    (t): [number, number] => [0.115 - 0.07 * t ** 1.5, 0.075 - 0.03 * t],
    { color: BEARDP, bone: jaw, caps: { start: "flat", end: "round" } },
  );
  const beardHits = b.surface(beard).scatter(150, { rng: rand, minDist: 0.025, filter: (h) => h.n.z > -0.1 });
  b.cards(beardHits, TUFT, {
    size: [0.04, 0.09],
    lean: 55,
    flow: [0, -1, 0.15],
    bend: 30,
    vary: 0.3,
    rng: rand,
    color: BEARD_HI,
  });
  const napeHits = b.surface(skull).scatter(60, { rng: rand, minDist: 0.03, filter: (h) => h.at.y < 1.21 && h.n.z < -0.2 });
  b.cards(napeHits, TUFT, { size: [0.04, 0.08], lean: 60, flow: [0, -1, -0.3], bend: 25, vary: 0.3, rng: rand, color: BEARD });

  for (const s of [1, -1]) {
    const path = catmull([
      [s * 0.07, 1.0, 0.29],
      [s * 0.08, 0.88, 0.325],
      [s * 0.075, 0.74, 0.32],
      [s * 0.065, 0.6, 0.27],
      [s * 0.06, 0.48, 0.2],
    ]);
    let i = 0;
    b.along(path, 17, (at) => {
      const side = i++ % 2 ? 1 : -1;
      b.part(new THREE.SphereGeometry(0.026, 6, 4), side > 0 ? BEARD : BEARD_MID, {
        bone: jaw,
        at: at.at.clone().add(V(side * 0.013, 0, 0)),
        rotation: [0, 0, side * 38],
        scale: [1.15, 0.9, 1],
      });
    });
    b.part(hoop(0.034, 0.01), GOLDP, { bone: jaw, at: path.at(0.08), dir: path.tangentAt(0.08) });
    b.part(hoop(0.032, 0.01), GOLDP, { bone: jaw, at: path.at(0.55), dir: path.tangentAt(0.55) });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), GOLDP, { bone: jaw, at: path.at(1) });
    b.spike(path.at(1), [0, -1, 0], 0.07, 0.03, BEARD, { bone: jaw });
    // moustache sweep
    b.sweep(bezier([s * 0.01, 1.125, 0.205], [s * 0.1, 1.13, 0.22], [s * 0.17, 1.05, 0.19], [s * 0.15, 1.0, 0.15]), [0.032, 0.008], {
      color: BEARDP,
      bone: head,
      caps: { start: "round", end: "point" },
    });
  }

  // pipe with a glowing ember
  b.sweep(
    catmull([
      [-0.04, 1.1, 0.2],
      [-0.07, 1.085, 0.27],
      [-0.075, 1.1, 0.31],
    ]),
    0.008,
    { color: PIPE, bone: head, caps: "flat" },
  );
  b.part(new THREE.CylinderGeometry(0.026, 0.016, 0.05, 7), PIPE, { bone: head, at: [-0.075, 1.125, 0.315] });
  glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), EMBER, { bone: head, at: [-0.075, 1.15, 0.315] }), 1.4);

  // helmet: dome, rim band, rivets, crest, horns
  const helmetOutline: Array<[number, number]> = [
    [0, 0],
    [0.19, 0],
    [0.19, 0.012],
    [0.168, 0.03],
    [0.166, 0.07],
    [0.14, 0.12],
    [0.09, 0.155],
    [0.04, 0.172],
    [0, 0.175],
  ];
  b.lathe(helmetOutline, { at: [0, 1.235, 0.03], bone: head, smoothing: 1, color: STEELP });
  b.part(hoop(0.172, 0.011, 16), GOLDP, { bone: head, at: [0, 1.25, 0.03] });
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.009, 5, 4), GOLD, { bone: head, at: [0.178 * Math.sin(a), 1.25, 0.03 + 0.178 * Math.cos(a)] });
  }
  const crestOutline: Array<[number, number]> = [
    [-0.14, 0],
    [0.14, 0],
    [0.09, 0.03],
    [0, 0.045],
    [-0.09, 0.035],
  ];
  b.extrude(crestOutline, { at: [0, 1.375, 0.03], x: [0, 0, 1], thickness: 0.02, bevel: 0.004, color: GOLDP, bone: head });
  for (const s of [1, -1]) {
    b.sweep(bezier([s * 0.16, 1.3, 0.03], [s * 0.28, 1.3, 0.03], [s * 0.3, 1.41, 0.03]), [0.035, 0], {
      color: HORNP,
      bone: head,
      caps: { start: "flat", end: "point" },
    });
    b.part(hoop(0.037, 0.008), GOLDP, { bone: head, at: [s * 0.185, 1.3, 0.03], dir: [1, 0, 0] });
  }

  return b.root;
}
