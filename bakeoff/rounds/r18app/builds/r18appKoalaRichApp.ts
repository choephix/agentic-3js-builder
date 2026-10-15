// Pixel-art koala sitting in the fork of a eucalyptus branch stand, gripping both branches with all four paws.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { arc, catmull } from "../../../../src/path";
import { noise } from "../../../../src/paint";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, stepped, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a eucalyptus stand",
  description:
    "A pixel-art koala sits in the fork of a gum branch mounted on a wooden plinth, hugging both branches with all four paws; dithered grey fur, cream chest, fluffy ears, glaucous leaf sprays.",
  style: "pixel art",
  commit: "88fc1f0",
};

const CELL = 0.016;
const snap = (c: string) => snapColor(c, 32);

// ------------------------------------------------------------------------------------------------------------
// Palette
const GREY = ["#262a34", "#3c4252", "#565d6f", "#737a8d", "#979eae", "#bec3cf"].map(snap);
const CREAM = ["#9a917f", "#bfb7a3", "#ddd7c4", "#f2eee1", "#fbf8ef"].map(snap);
const RUMP = ["#6d584a", "#8b7765", "#a99887", "#c9bcab"].map(snap);
const NOSE = ["#07070a", "#13131a", "#22222c", "#43434f"].map(snap);
const BARK = ["#5e5a4c", "#7b7863", "#9d9a82", "#c0bba2", "#dcd6bd"].map(snap);
const BARK_TAN = ["#8a6a4a", "#a9845a", "#c7a272"].map(snap);
const BARK_YOUNG = ["#5a3a30", "#7a4e3c", "#9a6a4c"].map(snap);
const LICHEN = ["#6f8a6a", "#92aa84"].map(snap);
const PAW = "#2b2830";
const PAD = "#4b3c46";
const CLAW = "#d8d0bc";
const MOUTH = "#17131a";
const IRON = "#3c4049";
const IRON_LIGHT = "#6d7482";
const NUT = "#6a4a2e";
const NUT_CAP = "#8b6a44";

// ------------------------------------------------------------------------------------------------------------
// Paints
const furBase = (c: { at: THREE.Vector3; n: THREE.Vector3; random: (s?: number) => number }) => {
  const n1 = noise(c.at, 0.08, 3);
  const speck = c.random(1) < 0.05 ? -0.2 : c.random(2) > 0.95 ? 0.16 : 0;
  return 0.46 + 0.3 * c.n.y + 0.6 * (n1 - 0.5) + speck;
};

const COAT = cellPaint(
  CELL,
  (c) => {
    const n1 = noise(c.at, 0.08, 3);
    const front = c.n.z + 0.5 * (n1 - 0.5);
    if (c.at.y < 1.0 && c.at.y > 0.62 && front > 0.4 && Math.abs(c.at.x) < 0.18)
      return c.pick(CREAM, 0.5 + 0.55 * (n1 - 0.4) + (c.random(4) - 0.5) * 0.2);
    if (c.n.z < -0.3 && c.at.y < 0.8) {
      const r = c.random(6);
      return c.pick(RUMP, 0.35 + 0.5 * noise(c.at, 0.06, 8) + (r < 0.12 ? -0.3 : r > 0.9 ? 0.3 : 0));
    }
    return c.pick(GREY, furBase(c));
  },
  { dither: true },
);

const LIMB = cellPaint(
  CELL,
  (c) => {
    const n1 = noise(c.at, 0.07, 5);
    if (c.n.y < -0.3 || (c.n.z > 0.55 && c.at.y < 0.8)) return c.pick(CREAM, 0.45 + 0.5 * n1);
    return c.pick(GREY, furBase(c) - 0.05);
  },
  { dither: true },
);

const HEAD = cellPaint(
  CELL * 0.8,
  (c) => {
    const n1 = noise(c.at, 0.05, 9);
    const jowl = c.at.y < 1.066 + 0.02 * (n1 - 0.5) && Math.abs(c.at.x) > 0.05;
    if (jowl || c.n.y < -0.4) return c.pick(CREAM, 0.55 + 0.45 * n1);
    if (c.at.y > 1.12 && Math.abs(c.at.x) < 0.07) return c.pick(GREY, furBase(c) + 0.1);
    return c.pick(GREY, furBase(c) + 0.08);
  },
  { dither: true },
);

const NOSEP = cellPaint(CELL * 0.5, (c) => c.pick(NOSE, 0.15 + 0.7 * Math.max(0, c.n.y) + 0.35 * Math.max(0, c.n.z) * (c.random(1) > 0.5 ? 1 : 0.5)));

const EAR_BACK = cellPaint(CELL * 0.8, (c) => c.pick(GREY, 0.3 + 0.35 * noise(c.at, 0.04, 2) + (c.random(3) > 0.9 ? 0.15 : 0)), { dither: true });
const EAR_IN = cellPaint(CELL * 0.8, (c) => c.pick(CREAM, 0.6 + 0.4 * noise(c.at, 0.03, 4) - (c.random(5) < 0.08 ? 0.25 : 0)), { dither: true });

const PAWFUR = cellPaint(CELL * 0.7, (c) => (c.random(1) > 0.8 ? PAD : PAW));

const BARK_P = cellPaint(
  0.014,
  (c) => {
    const n1 = noise(new THREE.Vector3(c.at.x * 2.5, c.at.y * 0.35, c.at.z * 2.5), 0.09, 11);
    const n2 = noise(c.at, 0.16, 13);
    const r = c.random(7);
    if (r < 0.05) return BARK[0];
    if (n2 > 0.66) return c.pick(LICHEN, 0.2 + 0.7 * n1);
    if (n1 > 0.7) return c.pick(BARK_TAN, (n1 - 0.65) * 2.2 + 0.1 * r);
    return c.pick(BARK, 0.25 + 0.7 * n1 + (r > 0.93 ? 0.25 : 0), );
  },
  { dither: true },
);

const TWIG_P = cellPaint(0.01, (c) => c.pick(BARK_YOUNG, 0.2 + 0.7 * noise(c.at, 0.05, 15) + 0.2 * c.n.y), { dither: true });
const STRIP_P = cellPaint(0.012, (c) => c.pick(BARK_TAN, 0.25 + 0.7 * noise(c.at, 0.05, 21) + 0.2 * c.n.y), { dither: true });

// ------------------------------------------------------------------------------------------------------------
// Textures
const EYE = pixelArt([".rrr.", "rkkkr", "rkwkr", "rkkkr", ".rrr."], { r: "#454b5c", k: "#07070b", w: "#ffffff" });

const TUFT = pixelTexture(4, 6, (g) => {
  g.stamp(0, 0, ["..w.", ".ww.", ".www", "wwww", "wwww", "wwww"], { w: "#ffffff" });
  g.stamp(0, 4, [".b..", ".b.."], { b: "#d8d8d8" });
});

const LEAF = pixelTexture(10, 26, (g) => {
  const H = 26;
  for (let y = 0; y < H; y++) {
    const v = y / (H - 1); // 0 tip .. 1 base
    const hw = 3.9 * Math.sin(Math.PI * Math.pow(v, 0.72)) + (y === 0 ? 0.2 : 0);
    const cx = 4.5 - 2.6 * Math.pow(1 - v, 2.2);
    for (let x = 0; x < 10; x++) {
      const d = x + 0.5 - cx;
      if (Math.abs(d) > hw) continue;
      const mid = Math.abs(d) < 0.55;
      const edge = Math.abs(d) > hw - 0.9 && hw > 1.5;
      const shade = d < 0 ? 0.28 : 0.55;
      const ramp = ["#265c52", "#34776a", "#4f9684", "#7bbca2", "#a8d8bd"];
      let c = pick(ramp, shade + 0.25 * v * (d > 0 ? 1 : 0.3), bayer(x, y));
      if (edge) c = "#2a665a";
      if (mid) c = y % 5 === 4 ? "#9fd0b4" : "#c3e4cd";
      g.set(x, y, c);
    }
  }
});

const MOSS = pixelTexture(8, 6, (g) => {
  const ramp = ["#2f5a2c", "#4a7f36", "#74a948", "#a3cf62"];
  for (let y = 0; y < 6; y++)
    for (let x = 0; x < 8; x++) {
      const hgt = 2 + ((x * 5 + y * 3) % 4);
      if (5 - y < hgt - 1 + (x % 3 === 0 ? 1 : 0)) g.set(x, y, pick(ramp, 1 - (y + 1) / 7 + 0.1 * (x % 2), bayer(x, y)));
    }
});

const plank = (ramp: string[], seam: string, w: number, h: number, seed: number) =>
  pixelTexture(w, h, (g) => {
    const r = rng(seed);
    const rowH = 12;
    const joints: number[] = [];
    for (let i = 0; i < Math.ceil(h / rowH); i++) joints.push(Math.floor(r() * w));
    g.fill((x, y) => {
      const row = Math.floor(y / rowH);
      const within = y % rowH;
      if (within === 0) return seam;
      const jx = joints[row];
      if (x === jx || x === (jx + 1) % w) return seam;
      const base = 0.25 + 0.5 * ((Math.sin(row * 7.3) + 1) / 2);
      const grain = 0.12 * Math.sin(x * 0.21 + row * 2.1 + within * 0.9) + 0.1 * Math.sin(x * 0.05 + within * 0.4 + row);
      const edge = within === 1 ? 0.18 : within === rowH - 1 ? -0.12 : 0;
      const knot = (x * 13 + y * 7 + row * 5) % 97 === 0 ? -0.3 : 0;
      return pick(ramp, base + grain + edge + knot, bayer(x, y));
    });
  });

const FONT: Record<string, string[]> = {
  K: ["k.k", "k.k", "kk.", "k.k", "k.k"],
  O: ["kkk", "k.k", "k.k", "k.k", "kkk"],
  A: [".k.", "k.k", "kkk", "k.k", "k.k"],
  L: ["k..", "k..", "k..", "k..", "kkk"],
};
const PLAQUE = pixelTexture(37, 7, (g) => {
  g.fill((x, y) => (x === 0 || y === 0 || x === 36 || y === 6 ? "#7a5a26" : y === 1 ? "#e6c872" : "#c8a24a"));
  g.fill((x, y) => ((x * 3 + y * 5) % 11 === 0 ? "#b8923e" : undefined), [1, 2, 35, 4]);
  "KOALA".split("").forEach((ch, i) => g.stamp(9 + i * 4, 1, FONT[ch], { k: "#3a2610" }));
  g.stamp(2, 1, ["..g", ".gg", "ggg", ".g.", "g.."], { g: "#3a6a3a" });
  g.stamp(32, 1, ["g..", "gg.", "ggg", ".g.", "..g"], { g: "#3a6a3a" });
});

// ------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "koala" });
  const R = rng(11);

  // ============ Skeleton ============
  const root = b.joint("root", { at: [0, 0.09, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.64, -0.03], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.64, -0.03],
      [0, 0.74, -0.05],
      [0, 0.85, -0.035],
      [0, 0.95, 0.0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.95, 0.0],
      [0, 1.0, 0.04],
      [0, 1.03, 0.07],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.03, 0.07], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.015, 0.12], aim: [0, 1.01, 0.3], role: "jaw" });

  // ============ Stand ============
  const PLINTH_D = 0.66;
  const woodDark = plank(["#2e1c12", "#44291a", "#5c3a24", "#7a4f30"].map(snap), "#1d110b", 72, 48, 5);
  const woodLight = plank(["#6e4a2c", "#8c6238", "#aa7e4a", "#c79c60"].map(snap), "#4a2e1a", 72, 48, 9);
  b.part(tileBox([0.96, 0.07, PLINTH_D], woodDark, 0.0125, { rand: rng(2), step: [1, 12] }), "#ffffff", {
    texture: woodDark,
    bone: root,
    at: [0, 0.035, 0],
    name: "plinthLow",
  });
  const baseTop = b.part(tileBox([0.86, 0.04, 0.56], woodLight, 0.0125, { rand: rng(3), step: [1, 12] }), "#ffffff", {
    texture: woodLight,
    bone: root,
    at: [0, 0.09, 0],
    name: "plinthTop",
  });
  b.part(new THREE.BoxGeometry(0.296, 0.056, 0.012), "#ffffff", {
    texture: PLAQUE,
    bone: root,
    at: [0, 0.036, PLINTH_D / 2 + 0.005],
    name: "plaque",
  });
  // plinth corner bolts and plaque screws
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 6), IRON_LIGHT, {
        bone: root,
        at: [sx * 0.44, 0.075, sz * 0.3],
        name: "bolt",
      });
  for (const sx of [1, -1])
    b.part(new THREE.BoxGeometry(0.012, 0.012, 0.01), IRON, { bone: root, at: [sx * 0.168, 0.036, PLINTH_D / 2 + 0.009], name: "screw" });

  // trunk
  const trunkPath = catmull([
    [0, 0.1, 0],
    [0.012, 0.2, -0.015],
    [-0.006, 0.35, -0.02],
    [0, 0.5, -0.02],
  ]);
  const trunk = b.sweep(trunkPath, [0.1, 0.072, 0.066, 0.064], {
    bone: root,
    color: BARK_P,
    sides: 8,
    caps: { start: "flat", end: "round" },
    name: "trunk",
  });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), BARK_P, { bone: root, at: [0, 0.505, -0.02], name: "fork" });
  // iron collar at the trunk foot
  b.lathe(
    [
      [0.088, 0],
      [0.118, 0],
      [0.118, 0.022],
      [0.1, 0.034],
      [0.088, 0.034],
    ],
    { at: [0, 0.11, 0], bone: root, color: IRON, segments: 8, name: "collar" },
  );
  b.ring(frame([0, 0.12, 0], [0, 1, 0]), { count: 8, radius: 0.1 }, (item) =>
    b.stick(new THREE.CylinderGeometry(0.009, 0.009, 0.014, 6), IRON_LIGHT, item, { embed: 0.3, bone: root }),
  );
  // trunk details: knots and peeling strips
  const knotHits = [
    [0.52, 20],
    [0.15, 200],
    [0.78, 300],
    [0.35, 110],
  ].map(([t, a]) => trunk.at(t, a));
  for (const h of knotHits)
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), "#3f3b30", h, { embed: 0.7, scale: [1, 0.35, 1.5], bone: root, name: "knot" });
  for (const [t, a, dr] of [
    [0.3, 40, 0.1],
    [0.55, 250, -0.1],
    [0.4, 150, 0.12],
    [0.75, 320, -0.12],
    [0.2, 330, 0.09],
  ]) {
    const h = trunk.at(t, a);
    const out = h;
    const p0 = offset(h, out, -0.004);
    const p1 = offset(offset(p0, out, 0.022), [dr, -0.0, 0], 0.01);
    const p2 = offset(offset(p1, out, 0.035), [dr, -1, 0], 0.07);
    const p3 = offset(offset(p2, out, 0.015), [dr * 0.5, -1, 0], 0.06);
    b.sweep(catmull([p0, p1, p2, p3]), [0.02, 0.012], {
      bone: root,
      color: STRIP_P,
      section: "box",
      caps: { start: "flat", end: "point" },
      name: "strip",
    });
  }

  // ============ Branches (the V fork) ============
  const branchR = (t: number) => 0.014 + 0.046 * Math.pow(1 - t, 1.2);
  const branches = [1, -1].map((s) => {
    const path = catmull(
      (
        [
          [0, 0.46, -0.03],
          [0.1, 0.56, -0.03],
          [0.2, 0.7, -0.03],
          [0.33, 0.93, -0.035],
          [0.46, 1.2, -0.05],
          [0.57, 1.46, -0.065],
        ] as number[][]
      ).map(([x, y, z]) => [s * x, y, z]),
    );
    const sweep = b.sweep(path, branchR, { bone: root, color: BARK_P, sides: 8, caps: { start: "none", end: "round" }, name: s > 0 ? "branchL" : "branchR" });
    return { s, path, sweep };
  });
  const backPath = catmull([
    [0, 0.5, -0.08],
    [0, 0.7, -0.22],
    [0, 0.98, -0.32],
    [0, 1.26, -0.36],
  ]);
  const backSweep = b.sweep(backPath, (t) => 0.014 + 0.032 * Math.pow(1 - t, 1.2), {
    bone: root,
    color: BARK_P,
    sides: 8,
    caps: { start: "none", end: "round" },
    name: "branchBack",
  });

  // ============ Koala body ============
  const bodyLoft = b.loft(
    [
      { at: [0, 0.555, -0.035], w: 0.2, h: 0.2 },
      { at: [0, 0.62, -0.05], w: 0.32, h: 0.3 },
      { at: [0, 0.72, -0.05], w: 0.34, h: 0.31 },
      { at: [0, 0.83, -0.04], w: 0.31, h: 0.28 },
      { at: [0, 0.92, -0.01], w: 0.25, h: 0.22 },
      { at: [0, 1.0, 0.03], w: 0.17, h: 0.17 },
    ],
    { bone: [hips, spine, neck], color: COAT, sides: 10, name: "body" },
  );

  // ---------- Head ----------
  const H = [0, 1.075, 0.11] as const;
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEAD, { bone: head, at: [...H], scale: [0.118, 0.1, 0.104], name: "skull" });
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), HEAD, { bone: head, at: [0, 1.047, 0.168], scale: [0.058, 0.046, 0.054], name: "muzzle" });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSEP, { bone: head, at: [0, 1.064, 0.222], scale: [0.04, 0.028, 0.032], name: "nose" });
  // lower jaw with chin tuft
  b.part(new THREE.SphereGeometry(1, 10, 6), HEAD, { bone: jaw, at: [0, 0.99, 0.158], scale: [0.05, 0.024, 0.05], name: "jawLow" });
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.07), "#2a1c20", { bone: jaw, at: [0, 1.005, 0.14], name: "mouthInside" });
  // mouth line and philtrum
  const skullSurf = b.surface([skull, muzzle]);
  b.sweep(
    skullSurf.drape(
      catmull([
        [0.052, 1.018, 0.18],
        [0.028, 1.006, 0.212],
        [0, 1.012, 0.222],
        [-0.028, 1.006, 0.212],
        [-0.052, 1.018, 0.18],
      ]),
      { lift: 0.003 },
    ),
    0.0035,
    { color: MOUTH, sides: 4, bone: head, name: "mouthLine" },
  );
  b.rod([0, 1.045, 0.228], [0, 1.014, 0.222], 0.0035, MOUTH, { sides: 4, bone: head, name: "philtrum" });
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.01, 0.007, 0.006), "#000000", { bone: head, at: [s * 0.014, 1.058, 0.252], name: "nostril" });
  // eyes
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: [s * 0.056, 1.092, 0.188],
      dir: [s * 0.25, 0.08, 1],
      size: [0.05, 0.05],
      mirror: s > 0,
      bone: head,
      name: "eye",
    });
  }
  // brow ridge fur patches
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.05, 0.012, 0.02), "#2c313d", { bone: head, at: [s * 0.058, 1.12, 0.18], rotation: [0, s * -20, s * 14], name: "brow" });

  // ---------- Ears ----------
  const EC = 0.012;
  const EAR_OUT = stepped(
    [[-2, 2], [-3, 3], [-4, 4], [-5, 5], [-5, 5], [-5, 5], [-5, 5], [-4, 4], [-3, 3], [-2, 2]],
    EC,
    { rows: true },
  );
  const EAR_INNER = stepped(
    [[-2, 2], [-3, 3], [-4, 4], [-4, 4], [-4, 4], [-4, 4], [-3, 3], [-2, 2]],
    EC,
    { rows: true, start: 1 },
  );
  for (const s of [1, -1]) {
    const d = new THREE.Vector3(s * 0.5, 0.12, 0.85).normalize();
    const xd = new THREE.Vector3(0, 1, 0).cross(d).normalize();
    const yd = d.clone().cross(xd);
    const C = new THREE.Vector3(s * 0.108, 1.162, 0.065);
    const earJoint = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: C.clone(), dir: d.clone(), role: "hinge" });
    const base = C.clone().addScaledVector(yd, -0.06);
    b.extrude(EAR_OUT, { at: base, x: xd, y: yd, thickness: 0.036, color: EAR_BACK, bone: earJoint, name: "earBack" });
    b.extrude(EAR_INNER, {
      at: base.clone().addScaledVector(d, 0.012),
      x: xd,
      y: yd,
      thickness: 0.028,
      color: EAR_IN,
      bone: earJoint,
      name: "earInner",
    });
    const rim = b.ring(frame(C, d), { count: 14, radius: 0.056, fromDeg: 0, toDeg: 360 });
    b.cards(rim.items, TUFT, {
      size: [0.04, 0.05],
      lean: 38,
      flow: d.toArray(),
      color: "#f3efe3",
      bone: earJoint,
      spin: 10,
      rng: R,
      vary: 0.2,
      cross: true,
      name: "earTufts",
    });
  }

  // cheek tufts and head fur cards
  const headHits = b
    .surface(skull)
    .scatter(60, { rng: rng(31), minDist: 0.033, filter: (h) => h.at.y < 1.1 && Math.abs(h.n.x) > 0.45 });
  b.cards(headHits, TUFT, { size: [0.045, 0.06], lean: 60, flow: [0, -1, -0.4], color: "#efeade", rng: rng(32), vary: 0.25, spin: 20, bone: head, name: "cheekTufts" });
  const crownHits = b.surface(skull).scatter(30, { rng: rng(33), minDist: 0.04, filter: (h) => h.n.y > 0.55 });
  b.cards(crownHits, TUFT, { size: [0.04, 0.05], lean: 55, flow: [0, -0.3, -1], color: GREY[3], rng: rng(34), vary: 0.25, spin: 25, bone: head, name: "crownTufts" });

  // ---------- Body fur and chest ----------
  const bodyHits = b.surface(bodyLoft).scatter(170, { rng: rng(41), minDist: 0.04, filter: (h) => h.n.y > -0.5 });
  b.cards(bodyHits, TUFT, { size: [0.05, 0.065], lean: 62, flow: [0, -1, -0.15], color: COAT, rng: rng(42), vary: 0.25, spin: 25, name: "furTufts" });
  const chestHits = b.surface(bodyLoft).scatter(60, {
    rng: rng(43),
    minDist: 0.03,
    filter: (h) => h.n.z > 0.5 && h.at.y > 0.68 && h.at.y < 0.98,
  });
  b.cards(chestHits, TUFT, { size: [0.045, 0.06], lean: 70, flow: [0, -1, 0.2], color: "#f4f0e4", rng: rng(44), vary: 0.2, spin: 20, name: "chestFluff" });

  // ============ Limbs and paws ============
  const rGrip = (t: number) => branchR(t);
  type Grip = { C: THREE.Vector3; T: THREE.Vector3; r0: THREE.Vector3; Rb: number; wrist: THREE.Vector3 };
  const gripAt = (path: ReturnType<typeof catmull>, t: number, from: THREE.Vector3, reach: number): Grip => {
    const C = path.at(t);
    const T = path.tangentAt(t);
    const r0 = from.clone().sub(C);
    r0.addScaledVector(T, -r0.dot(T)).normalize();
    const Rb = rGrip(t);
    return { C, T, r0, Rb, wrist: C.clone().addScaledVector(r0, Rb + reach) };
  };
  const hand = (side: string, kind: string, tip: ReturnType<typeof b.joint>, g: Grip, big: number) => {
    // dir that goes through the front (+z) first
    const front = new THREE.Vector3().crossVectors(g.T, g.r0).dot(new THREE.Vector3(0, 0, 1)) >= 0 ? 1 : -1;
    const sc = 0.026 * big;
    const specs: { id: string; a: number; ang: number; r: number }[] = [
      { id: "1", a: -2, ang: front * 118, r: 1 },
      { id: "2", a: 0, ang: front * 125, r: 1.05 },
      { id: "3", a: 2, ang: front * 118, r: 1 },
      { id: "T1", a: -1, ang: -front * 95, r: 0.95 },
      { id: "T2", a: 1, ang: -front * 95, r: 0.95 },
    ];
    // palm
    const pa = g.C.clone().addScaledVector(g.r0, g.Rb + 0.022 * big).addScaledVector(g.T, -sc * 2.6);
    const pb = g.C.clone().addScaledVector(g.r0, g.Rb + 0.022 * big).addScaledVector(g.T, sc * 2.6);
    b.rod(pa, pb, 0.026 * big, PAWFUR, { bone: tip, sides: 6, name: `palm${kind}${side}` });
    for (const sp of specs) {
      const rd = 0.012 * big;
      const center = g.C.clone().addScaledVector(g.T, sp.a * sc);
      const start = center.clone().addScaledVector(g.r0, g.Rb + rd * 1.1);
      const path = arc(center, start, g.T, sp.ang);
      const ch = b.chain(`digit${kind}${sp.id}${side}`, path, {
        parent: tip,
        names: [`digit${kind}${sp.id}${side}1`, `digit${kind}${sp.id}${side}2`, `digit${kind}${sp.id}${side}3`],
        role: "digit",
      });
      b.sweep(ch, [rd * 1.15, rd * 0.8], { color: PAWFUR, sides: 6, caps: "round", name: `digit${kind}${sp.id}${side}` });
      const tipPt = ch.at(1);
      if (sp.id !== "T1") b.spike(tipPt, tipPt, 0.034 * big, 0.0075 * big, CLAW, { sides: 5, caps: "point" });
    }
  };

  for (const br of branches) {
    const s = br.s;
    const side = s > 0 ? "L" : "R";
    // ----- forelimb -----
    const S = new THREE.Vector3(s * 0.135, 0.9, 0.03);
    const tArm = br.path.closestT([s * 0.385, 1.08, -0.04]);
    const ga = gripAt(br.path, tArm, S, 0.03);
    const armPts = limb(S, ga.wrist, [0.16, 0.15], [[0, -0.6, -0.6]]);
    const arm = b.chain(`arm${side}`, armPts, { parent: spine, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    const armSweep = b.sweep(arm, [0.058, 0.046, 0.04], { color: LIMB, sides: 8, name: `arm${side}` });
    b.part(new THREE.SphereGeometry(0.065, 8, 6), LIMB, { bone: arm.joints[0], at: S, name: `shoulder${side}` });
    hand(side, "H", arm.tip!, ga, 1);
    const armHits = b.surface(armSweep).scatter(40, { rng: rng(51 + (s > 0 ? 1 : 2)), minDist: 0.035, filter: (h) => h.n.y > -0.3 });
    b.cards(armHits, TUFT, { size: [0.045, 0.06], lean: 65, flow: [0, -1, 0.1], color: LIMB, rng: rng(53), vary: 0.25, spin: 25, name: `armFur${side}` });

    // ----- hind limb -----
    const Hp = new THREE.Vector3(s * 0.115, 0.66, -0.03);
    const tLeg = br.path.closestT([s * 0.255, 0.79, -0.03]);
    const gl = gripAt(br.path, tLeg, Hp, 0.03);
    const legPts = limb(Hp, gl.wrist, [0.19, 0.19], [[s * 0.3, 0.25, 1]]);
    const leg = b.chain(`leg${side}`, legPts, { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    const legSweep = b.sweep(leg, [0.09, 0.062, 0.042], { color: LIMB, sides: 8, name: `leg${side}` });
    hand(side, "F", leg.tip!, gl, 1.05);
    b.part(new THREE.SphereGeometry(0.06, 8, 6), LIMB, { bone: leg.joints[1], at: legPts[1], name: `knee${side}` });
    const legHits = b.surface(legSweep).scatter(40, { rng: rng(61 + (s > 0 ? 1 : 2)), minDist: 0.04, filter: (h) => h.n.y > -0.3 });
    b.cards(legHits, TUFT, { size: [0.05, 0.065], lean: 65, flow: [0, -1, 0.1], color: LIMB, rng: rng(63), vary: 0.25, spin: 25, name: `legFur${side}` });
  }

  // ============ Leaf sprays and gumnuts ============
  const leafFrames: ReturnType<typeof frame>[] = [];
  const leafFlows: THREE.Vector3[] = [];
  const nutHits: ReturnType<typeof frame>[] = [];
  const twigAt = (hit: { at: THREE.Vector3; n: THREE.Vector3; tangent?: THREE.Vector3 }, grow: THREE.Vector3, len: number, leaves: number, thick: number) => {
    const p0 = hit.at.clone();
    const dir = grow.clone().normalize();
    const p1 = p0.clone().addScaledVector(dir, len * 0.5).add(new THREE.Vector3(0, len * 0.06, 0));
    const p2 = p0.clone().addScaledVector(dir, len).add(new THREE.Vector3(0, -len * 0.1, 0));
    const tw = b.sweep(catmull([p0, p1, p2]), [thick, thick * 0.3], { bone: root, color: TWIG_P, sides: 5, caps: { start: "none", end: "round" }, name: "twig" });
    for (let i = 0; i < leaves; i++) {
      const t = 0.2 + (0.8 * i) / Math.max(1, leaves - 1);
      const f = tw.at(t, R() * 360);
      leafFrames.push(f as ReturnType<typeof frame>);
      leafFlows.push(new THREE.Vector3((R() - 0.5) * 1.2, -0.8 - R() * 0.8, (R() - 0.5) * 1.2));
    }
    // terminal leaf pair
    const tip = tw.at(1, 0);
    leafFrames.push(tip as ReturnType<typeof frame>);
    leafFlows.push(new THREE.Vector3(R() - 0.5, -0.4, R() - 0.5));
    if (R() < 0.6) nutHits.push(tw.at(0.55, 180) as ReturnType<typeof frame>);
  };
  const sprayOn = (sweep: ReturnType<typeof b.sweep>, ts: number[], bias: THREE.Vector3, len: number, leaves: number) => {
    ts.forEach((t, k) => {
      const ang = k % 2 ? 100 + R() * 50 : -100 - R() * 50;
      const hit = sweep.at(t, ang);
      const grow = new THREE.Vector3().copy(hit.n).multiplyScalar(0.9).add(bias).add(new THREE.Vector3(R() * 0.3 - 0.15, 0.2, R() * 0.3 - 0.15));
      twigAt(hit as never, grow, len * (0.8 + R() * 0.5), leaves, 0.011);
    });
  };
  for (const br of branches) {
    const s = br.s;
    sprayOn(br.sweep, [0.5, 0.62, 0.72, 0.82, 0.9, 0.97], new THREE.Vector3(s * 0.5, 0.35, 0.15), 0.26, 5);
    // terminal twigs
    const endHit = br.sweep.at(1, 0);
    twigAt(endHit as never, new THREE.Vector3(s * 0.4, 1, 0.1), 0.3, 6, 0.012);
    twigAt(endHit as never, new THREE.Vector3(s * 0.9, 0.5, 0.35), 0.28, 5, 0.01);
    twigAt(endHit as never, new THREE.Vector3(s * 0.3, 0.7, -0.6), 0.28, 5, 0.01);
  }
  sprayOn(backSweep, [0.5, 0.65, 0.78, 0.9], new THREE.Vector3(0, 0.3, -0.1), 0.26, 5);
  twigAt(backSweep.at(1, 0) as never, new THREE.Vector3(0.3, 1, -0.2), 0.3, 6, 0.011);
  twigAt(backSweep.at(1, 0) as never, new THREE.Vector3(-0.4, 0.8, -0.2), 0.28, 5, 0.01);
  // a couple of leafy shoots low on the left branch so the paws have greenery nearby
  b.cards(leafFrames, LEAF, {
    size: [0.052, 0.15],
    lean: 52,
    bend: 18,
    flow: (_f: unknown, i: number) => leafFlows[i].toArray(),
    vary: 0.25,
    spin: 40,
    rng: rng(71),
    bone: root,
    name: "leaves",
  });
  const NUTG = new THREE.SphereGeometry(0.014, 6, 4);
  const CAPG = new THREE.CylinderGeometry(0.009, 0.015, 0.01, 6);
  for (const f of nutHits) {
    b.stick(NUTG, NUT, f, { embed: 0.0, bone: root, name: "gumnut" });
    b.stick(CAPG, NUT_CAP, f.moved([0, 0.012, 0]), { embed: 0.2, bone: root, name: "gumnutCap" });
  }

  // ============ Plinth dressing ============
  const topSurf = b.surface(baseTop);
  const mossHits = topSurf.scatter(18, { rng: rng(81), minDist: 0.08, filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 0.13 });
  b.cards(mossHits, MOSS, { size: [0.07, 0.04], lean: 8, flow: [1, 0, 0], rng: rng(82), vary: 0.35, cross: true, bone: root, name: "moss" });
  const fallen = topSurf.scatter(7, { rng: rng(83), minDist: 0.14, filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 0.16 });
  const fallenFrames = fallen.map((h) => frame(offset(h, [0, 1, 0], 0.002), [0, 1, 0]));
  b.cards(fallenFrames, LEAF, {
    size: [0.04, 0.12],
    lean: 90,
    flow: (_f: unknown, i: number) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    mirror: true,
    sink: 0,
    bone: root,
    name: "fallenLeaves",
  });
  const nutsOnBase = topSurf.scatter(5, { rng: rng(84), minDist: 0.12, filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 0.16 });
  for (const h of nutsOnBase) {
    b.stick(NUTG, NUT, h, { embed: 0.1, bone: root, name: "baseNut" });
    b.stick(CAPG, NUT_CAP, h.moved([0, 0.014, 0]), { embed: 0.2, bone: root, name: "baseNutCap" });
  }
  const pebbles = topSurf.scatter(4, { rng: rng(85), minDist: 0.2, filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 0.2 });
  for (const h of pebbles)
    b.stick(new THREE.DodecahedronGeometry(0.02, 0), "#8c8f9a", h, { embed: 0.4, scale: [1.3, 0.8, 1], bone: root, spin: R() * 360, name: "pebble" });

  return b.root;
}
