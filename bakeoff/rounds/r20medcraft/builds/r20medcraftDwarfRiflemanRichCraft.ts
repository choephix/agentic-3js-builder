// Dwarf rifleman with a braided beard and a blunderbuss, Blizzard/Warcraft style: chunky heroic proportions,
// oversized shoulders, hands and boots, hand-painted warm-top / cool-underside shading, brass trims and rivets.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { grain, mix, mottle, noise, paint, resolve, smoothstep, stripes } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull, polyline } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout dwarf marksman in horned iron helm and steel pauldrons, with a thick ginger beard braided into two brass-tied plaits, resting a flared blunderbuss butt-down on the ground.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Hand-painted look: warm light from above, cool violet shade below, a little grime from noise.
const lit = (src: ColorInput, grit = 0.1, seed = 1) =>
  paint((p, n) => {
    const c = resolve(src, p, n);
    const t = smoothstep(-0.6, 0.8, n.y * 0.85 + n.z * 0.25);
    const shaded = mix(mix(c, "#1b1040", 0.34), mix(c, "#fff1bc", 0.2), t);
    return mix(shaded, "#150c2a", grit * noise(p, 0.05, seed));
  });

const SKIN = lit(mottle("#dc9a72", "#c9805e", { size: 0.06, contrast: 0.7, seed: 2 }), 0.06, 2);
const SKIN_R = lit("#e58a6a", 0.05, 3);
const BEARD = lit(grain("#c4601f", "#f09a45", { size: 0.014, axis: "y" }), 0.05, 5);
const BEARD_D = lit("#b7541b", 0.08, 15);
const BEARD_L = lit("#eca04e", 0.06, 16);
const STEEL = lit(mottle("#98a5b8", "#74829a", { size: 0.035, seed: 3 }), 0.14, 3);
const STEEL_D = lit(mottle("#566177", "#3e4859", { size: 0.05, seed: 4 }), 0.12, 4);
const GOLD = lit(mottle("#f0c04a", "#c8912a", { size: 0.03, seed: 5 }), 0.08, 5);
const LEATHER = lit(mottle("#8a5428", "#6b3f1d", { size: 0.04, seed: 6 }), 0.18, 6);
const LEATHER_D = lit(mottle("#5e3a1c", "#472a14", { size: 0.04, seed: 7 }), 0.18, 7);
const TUNIC = lit(mottle("#2f66c0", "#2653a0", { size: 0.07, seed: 8 }), 0.1, 8);
const PANTS = lit(mottle("#7a5a38", "#624528", { size: 0.06, seed: 9 }), 0.14, 9);
const SLEEVE = lit(mottle("#3b74d0", "#2f66c0", { size: 0.06, seed: 10 }), 0.1, 10);
const RED = lit(mottle("#b02f2a", "#8f2220", { size: 0.05, seed: 11 }), 0.12, 11);
const WOOD = lit(grain("#9a5e30", "#6a3d1c", { size: 0.012, axis: "y" }), 0.1, 12);
const HORN = lit(mottle("#f0e2bc", "#d8c593", { size: 0.03, seed: 13 }), 0.1, 13);
const BEDROLL = lit(stripes("#a83a2a", "#e8d9a8", { size: 0.05, axis: "x", width: 0.35, wobble: 0.1, seed: 14 }), 0.1, 14);
const SOLE = lit("#2e1b0e", 0.1, 17);

const EYE_WHITE = "#f5ecd8";
const IRIS = "#3aa6d9";
const DARK = "#1a1014";
const LIP = "#c0605a";
const GEM = "#e0283c";

function ringPts(c: THREE.Vector3, nrm: THREE.Vector3, r: number, n: number, start = 0) {
  const a = new THREE.Vector3(0, 0, 1);
  if (Math.abs(nrm.dot(a)) > 0.9) a.set(1, 0, 0);
  const u = a.sub(nrm.clone().multiplyScalar(a.dot(nrm))).normalize();
  const v = nrm.clone().cross(u);
  return Array.from({ length: n }, (_, i) => {
    const t = start + (i / n) * Math.PI * 2;
    return c.clone().addScaledVector(u, Math.cos(t) * r).addScaledVector(v, Math.sin(t) * r);
  });
}

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const tor = (r: number, t: number, s = 10) => new THREE.TorusGeometry(r, t, 5, s);
  const put = (g: THREE.BufferGeometry, c: Fill, bone: Joint, at: THREE.Vector3 | number[], o: PartOptions = {}) =>
    b.part(g, c, { ...o, bone, at });

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.56, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.56, 0],
      [0, 0.7, 0],
      [0, 0.84, 0],
      [0, 0.98, 0],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const spine1 = spine.joints[0]!;
  const chest = spine.joints[2]!;
  const neck = b.joint("neck", { parent: chest, at: [0, 1.0, 0], aim: [0, 1.07, 0.02], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.06, 0.02], aim: [0, 1.3, 0.03], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.09, 0.07], aim: [0, 1.05, 0.2], role: "jaw" });

  // ------------------------------------------------------------------ torso, neck
  const torso = b.loft(
    [
      { at: [0, 0.5, 0], w: 0.27, h: 0.2 },
      { at: [0, 0.62, 0.01], w: 0.35, h: 0.26 },
      { at: [0, 0.78, 0.02], w: 0.39, h: 0.28 },
      { at: [0, 0.92, 0.02], w: 0.5, h: 0.3 },
      { at: [0, 1.0, 0], w: 0.42, h: 0.26 },
      { at: [0, 1.05, 0], w: 0.2, h: 0.2 },
    ],
    { bone: spine, color: TUNIC },
  );
  b.capsule([0, 0.98, 0], [0, 1.08, 0.02], 0.075, { color: SKIN, bone: neck });

  // Breastplate with gold centre ridge, rim studs and a ruby
  const plate = put(sph(1, 10, 8), STEEL, chest, V(0, 0.9, 0.11), { scale: [0.2, 0.17, 0.12] });
  b.sweep(
    catmull([
      [0, 0.76, 0.2],
      [0, 0.82, 0.232],
      [0, 0.9, 0.24],
      [0, 0.98, 0.222],
      [0, 1.04, 0.18],
    ]),
    0.01,
    { color: GOLD, bone: chest },
  );
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    put(sph(0.012, 5, 4), GOLD, chest, V(0.2 * 0.86 * Math.cos(a), 0.9 + 0.17 * 0.86 * Math.sin(a), 0.176));
  }
  glow(put(new THREE.IcosahedronGeometry(0.03, 0), GEM, chest, V(0, 0.9, 0.245)), 1.2);
  put(tor(0.036, 0.008, 8), GOLD, chest, V(0, 0.9, 0.243), { dir: [0, 0, 1], axis: "z" });

  // Gorget
  put(tor(0.112, 0.03, 10), STEEL, chest, V(0, 1.01, 0.005), { rotation: [90, 0, 0] });
  put(tor(0.116, 0.009, 10), GOLD, chest, V(0, 1.035, 0.005), { rotation: [90, 0, 0] });

  // Belt, buckle, studs
  put(cyl(0.19, 0.19, 0.07, 14), LEATHER_D, spine1, V(0, 0.6, 0.01), { scale: [1, 1, 0.82] });
  put(box(0.075, 0.058, 0.02), GOLD, spine1, V(0, 0.6, 0.18));
  put(box(0.04, 0.03, 0.012), DARK, spine1, V(0, 0.6, 0.19));
  for (let i = -4; i <= 4; i++) {
    if (Math.abs(i) < 2) continue;
    const x = i * 0.04;
    put(sph(0.01, 5, 4), GOLD, spine1, V(x, 0.6, 0.01 + 0.155 * Math.sqrt(Math.max(0, 1 - (x / 0.19) ** 2)) + 0.012));
  }

  // Tabard hanging in front of the belt, tilted back at the bottom, with a drawn gold sun
  const tabard: OutlinePoint[] = [
    [-0.07, 0],
    [0.07, 0],
    [0.075, -0.1],
    [0.07, -0.2],
    [0, -0.25],
    [-0.07, -0.2],
    [-0.075, -0.1],
  ];
  b.extrude(tabard, { at: [0, 0.6, 0.17], x: [1, 0, 0], y: [0, 0.97, 0.24], thickness: 0.012, color: RED, bone: hips });
  b.sweep(
    polyline(
      tabard.map(([x, y]) => V(x * 0.92, 0.6 + y * 0.97 * 0.96 - 0.004, 0.17 + y * 0.24 * 0.96 + 0.008)),
      { closed: true },
    ),
    0.005,
    { color: GOLD, bone: hips },
  );
  const sun = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#c8922a"/><circle cx="32" cy="32" r="24" fill="#7a1f1f"/>
    <path d="M32 6 L38 26 L58 32 L38 38 L32 58 L26 38 L6 32 L26 26 Z" fill="#f0c24a" stroke="#6b4210" stroke-width="2"/>
    <circle cx="32" cy="32" r="8" fill="#2a1a10"/><circle cx="32" cy="32" r="4" fill="#e8b84a"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    bone: hips,
    at: [0, 0.503, 0.1535],
    dir: [0, -0.24, 1],
    axis: "z",
    texture: sun,
  });

  // Bandolier over the chest, with brass cartridge rings
  const strapPath = b
    .surface([torso, plate])
    .drape(
      catmull([
        [-0.2, 1.02, 0.0],
        [-0.12, 0.95, 0.2],
        [0.0, 0.84, 0.24],
        [0.12, 0.72, 0.2],
        [0.2, 0.62, 0.08],
      ]),
      { lift: 0.012 },
    );
  b.sweep(strapPath, 0.022, { color: LEATHER_D });
  b.along(strapPath, 7, (at) => {
    b.stick(cyl(0.03, 0.03, 0.05, 8), GOLD, at);
  });

  // Hip pouches and powder horn
  put(box(0.1, 0.11, 0.055), LEATHER, hips, V(-0.19, 0.5, 0.1));
  put(box(0.105, 0.05, 0.062), LEATHER_D, hips, V(-0.19, 0.545, 0.1));
  put(sph(0.014, 6, 4), GOLD, hips, V(-0.19, 0.53, 0.135));
  b.sweep(
    catmull([
      [0.19, 0.62, 0.08],
      [0.235, 0.56, 0.14],
      [0.255, 0.47, 0.15],
      [0.24, 0.38, 0.11],
    ]),
    [0.042, 0.012],
    { color: HORN, bone: hips },
  );
  put(sph(0.032, 6, 5), GOLD, hips, V(0.19, 0.625, 0.08));
  put(sph(0.012, 5, 4), GOLD, hips, V(0.24, 0.375, 0.108));

  // Backpack, bedroll, cup
  put(box(0.3, 0.3, 0.14), LEATHER, chest, V(0, 0.84, -0.2));
  put(box(0.32, 0.04, 0.16), LEATHER_D, chest, V(0, 0.995, -0.2));
  put(box(0.29, 0.14, 0.02), LEATHER_D, chest, V(0, 0.84, -0.275));
  for (const s of [1, -1]) put(box(0.04, 0.05, 0.012), GOLD, chest, V(s * 0.08, 0.82, -0.285));
  put(cyl(0.07, 0.07, 0.4, 10), BEDROLL, chest, V(0, 1.09, -0.2), { rotation: [0, 0, 90] });
  for (const s of [1, -1])
    put(cyl(0.074, 0.074, 0.035, 10), LEATHER_D, chest, V(s * 0.11, 1.09, -0.2), { rotation: [0, 0, 90] });
  put(cyl(0.035, 0.03, 0.06, 8), STEEL, chest, V(0.17, 0.76, -0.24));
  put(tor(0.02, 0.005, 8), STEEL, chest, V(0.2, 0.765, -0.24), { dir: [1, 0, 0], axis: "z" });

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.115, 0.54, 0), V(s * 0.125, 0.115, 0.02), [0.23, 0.23], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    const hipJ = leg.joints[0]!;
    const knee = leg.joints[1]!;
    const ankle = leg.joints[2]!;
    b.sweep(leg, [0.1, 0.095, 0.088, 0.08, 0.074], { color: PANTS });
    const k = pts[1]!;
    const an = pts[2]!;
    const top = an.clone().lerp(k, 0.52);
    const shinDir = k.clone().sub(an).normalize();
    // boot shaft with folded cuff and strap
    b.capsule(an, top, 0.092, { color: LEATHER_D, bone: knee });
    put(tor(0.1, 0.022, 10), LEATHER, knee, top, { dir: shinDir, axis: "z" });
    const strapAt = an.clone().lerp(top, 0.4);
    put(tor(0.097, 0.01, 10), STEEL, knee, strapAt, { dir: shinDir, axis: "z" });
    put(box(0.022, 0.03, 0.012), GOLD, knee, V(strapAt.x + s * 0.0, strapAt.y, strapAt.z + 0.096));
    // thigh strap, knee guard
    put(tor(0.103, 0.011, 10), LEATHER, hipJ, pts[0]!.clone().lerp(k, 0.42), {
      dir: k.clone().sub(pts[0]!).normalize(),
      axis: "z",
    });
    put(sph(0.065, 8, 6), STEEL, knee, V(k.x, k.y, k.z + 0.07), { scale: [1, 0.9, 0.7] });
    put(sph(0.014, 5, 4), GOLD, knee, V(k.x, k.y, k.z + 0.11));
    // chunky boot
    const x = an.x;
    b.capsule([x, 0.08, -0.04], [x, 0.08, 0.13], 0.08, { color: LEATHER_D, bone: ankle });
    put(box(0.17, 0.026, 0.35), SOLE, ankle, V(x, 0.013, 0.045));
    put(sph(0.062, 8, 6), STEEL, ankle, V(x, 0.07, 0.175), { scale: [1.05, 0.9, 1] });
    put(box(0.04, 0.012, 0.03), GOLD, ankle, V(x, 0.12, 0.2));
  }

  // ------------------------------------------------------------------ arms
  const makeArm = (s: number) => {
    const S = s > 0 ? "L" : "R";
    const wrist = s > 0 ? V(0.38, 0.5, 0.05) : V(-0.42, 0.5, 0.15);
    const pts = limb(V(s * 0.265, 0.965, 0), wrist, [0.27, 0.27], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.078, 0.072, 0.066, 0.06, 0.056], { color: SKIN, bands: [[0.56, SLEEVE]] });
    const cuffPt = arm.at(0.56);
    put(tor(0.074, 0.02, 10), SLEEVE, arm.joints[1]!, cuffPt.at, { dir: cuffPt.tangent, axis: "z" });
    // steel bracer with gold rims and rivets
    b.sweep(arm, (t: number) => 0.0716 - 0.0197 * (t - 0.62), {
      from: 0.62,
      to: 0.93,
      color: STEEL,
      caps: "flat",
    });
    for (const t of [0.62, 0.93]) {
      const c = arm.at(t);
      put(tor(0.0716 - 0.0197 * (t - 0.62) + 0.004, 0.008, 10), GOLD, arm.joints[1]!, c.at, {
        dir: c.tangent,
        axis: "z",
      });
    }
    const mid = arm.at(0.78);
    for (const p of ringPts(mid.at, mid.tangent.clone().normalize(), 0.067, 6))
      put(sph(0.009, 5, 4), GOLD, arm.joints[1]!, p);
    return { arm, pts };
  };
  const left = makeArm(1);
  const right = makeArm(-1);

  // Pauldrons: layered domes, gold rim, studs and a spike
  for (const s of [1, -1]) {
    const sj = (s > 0 ? left : right).arm.joints[0]!;
    const layers: Array<[THREE.Vector3, number, number]> = [
      [V(s * 0.285, 0.985, 0), 0.125, 0.314],
      [V(s * 0.3, 0.925, 0), 0.105, 0.52],
    ];
    layers.forEach(([c, r, tilt], li) => {
      const n = V(s * Math.sin(tilt), Math.cos(tilt), 0);
      put(new THREE.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, sj, c, {
        dir: n,
        scale: [1, 0.75, 1],
      });
      put(tor(r, 0.012, 12), GOLD, sj, c, { dir: n, axis: "z" });
      for (const p of ringPts(c, n, r, 9, li * 0.3)) put(sph(0.011, 5, 4), GOLD, sj, p);
      if (li === 0) put(new THREE.ConeGeometry(0.022, 0.07, 6), GOLD, sj, c.clone().addScaledVector(n, 0.1), { dir: n });
    });
  }

  // Left hand: open, fingers as digit chains
  {
    const W = left.pts[2]!;
    const wj = left.arm.joints[2]!;
    put(sph(0.05, 8, 6), SKIN, wj, V(W.x, W.y - 0.05, W.z), { scale: [0.75, 1.1, 1.1] });
    const fingers: Array<[string, number, number]> = [
      ["index", 0.03, 1],
      ["middle", 0.01, 1.08],
      ["ring", -0.01, 1],
      ["pinky", -0.03, 0.8],
    ];
    for (const [nm, zo, len] of fingers) {
      const base = V(W.x, W.y - 0.095, W.z + zo);
      const fp = [
        base,
        V(W.x + 0.006, W.y - 0.095 - 0.045 * len, W.z + zo + 0.008),
        V(W.x + 0.012, W.y - 0.095 - 0.08 * len, W.z + zo + 0.024),
      ];
      const fc = b.chain(`${nm}L`, fp, { parent: wj, names: [`${nm}L1`, `${nm}L2`, `${nm}L3`], role: "digit" });
      b.sweep(fc, [0.016, 0.014, 0.011], { color: SKIN });
    }
    const th = b.chain(
      "thumbL",
      [V(W.x, W.y - 0.05, W.z + 0.045), V(W.x + 0.005, W.y - 0.09, W.z + 0.075), V(W.x + 0.01, W.y - 0.12, W.z + 0.09)],
      { parent: wj, names: ["thumbL1", "thumbL2", "thumbL3"], role: "digit" },
    );
    b.sweep(th, [0.019, 0.016, 0.012], { color: SKIN });
  }

  // ------------------------------------------------------------------ blunderbuss, gripped in the right hand
  const gx = -0.42;
  const gz = 0.2;
  const wR = right.arm.joints[2]!;
  const g = (y: number, dz = 0, dx = 0) => V(gx + dx, y, gz + dz);
  // hand: palm behind the stock, fingers wrapped around its front, thumb over them
  put(sph(0.05, 8, 6), SKIN, wR, g(0.44, -0.045), { scale: [0.95, 1.3, 0.8] });
  for (const y of [0.375, 0.408, 0.441, 0.474])
    b.sweep(
      catmull([g(y, -0.04, 0.042), g(y, 0.02, 0.048), g(y, 0.055, 0.02), g(y, 0.056, -0.03)]),
      0.017,
      { color: SKIN, bone: wR },
    );
  b.sweep(catmull([g(0.49, -0.03, -0.045), g(0.47, 0.02, -0.055), g(0.455, 0.065, -0.02)]), 0.019, {
    color: SKIN,
    bone: wR,
  });

  // stock
  b.frustumBox(g(0.012, -0.03), g(0.4, 0), [0.075, 0.12], [0.05, 0.065], { color: WOOD, bone: wR });
  put(box(0.08, 0.02, 0.125), GOLD, wR, g(0.008, -0.03));
  for (const sx of [1, -1]) put(box(0.004, 0.1, 0.03), GOLD, wR, g(0.2, -0.01, sx * 0.0335));
  // lock, hammer, trigger guard
  put(box(0.06, 0.1, 0.07), STEEL, wR, g(0.505));
  put(box(0.014, 0.075, 0.09), GOLD, wR, g(0.505, 0, 0.036));
  put(box(0.014, 0.075, 0.09), GOLD, wR, g(0.505, 0, -0.036));
  b.sweep(catmull([g(0.52, -0.035), g(0.57, -0.06), g(0.6, -0.045), g(0.585, -0.02)]), 0.009, {
    color: STEEL_D,
    bone: wR,
  });
  put(tor(0.032, 0.006, 8), GOLD, wR, g(0.462, 0.062), { rotation: [0, 90, 0] });
  put(new THREE.ConeGeometry(0.008, 0.03, 5), STEEL_D, wR, g(0.468, 0.048), { dir: [0, -0.3, -1] });
  // breech, barrel, bands, bell mouth
  put(cyl(0.034, 0.05, 0.06, 8), STEEL, wR, g(0.56));
  b.sweep([g(0.55), g(0.95)], (t: number): [number, number] => [0.03 + 0.006 * t, 0.03 + 0.006 * t], {
    color: STEEL_D,
    bone: wR,
    sides: 8,
    caps: "flat",
  });
  for (const y of [0.6, 0.7, 0.8, 0.9])
    put(tor(0.037, 0.008, 10), GOLD, wR, g(y), { rotation: [90, 0, 0] });
  const mouth: OutlinePoint[] = [
    [0.034, 0],
    [0.05, 0.05],
    [0.088, 0.16],
    [0.078, 0.16],
    [0.043, 0.055],
    [0.026, 0],
  ];
  b.lathe(mouth, { at: g(0.93), segments: 12, color: STEEL, bone: wR });
  put(tor(0.083, 0.009, 12), GOLD, wR, g(1.09), { rotation: [90, 0, 0] });
  put(cyl(0.042, 0.042, 0.004, 10), DARK, wR, g(0.99));
  // ramrod with brass pipes
  b.rod(g(0.56, 0.034), g(0.9, 0.034), 0.008, { color: WOOD, bone: wR });
  for (const y of [0.62, 0.74, 0.86]) put(cyl(0.012, 0.012, 0.03, 6), GOLD, wR, g(y, 0.034));
  put(sph(0.013, 6, 4), GOLD, wR, g(0.56, 0.034));
  // ribbon and tassel tied to the top band
  b.sweep(catmull([g(0.9, 0.02, 0.03), g(0.84, 0.03, 0.055), g(0.77, 0.03, 0.065)]), 0.008, {
    color: RED,
    bone: wR,
  });
  put(sph(0.016, 6, 5), GOLD, wR, g(0.76, 0.03, 0.066));
  put(new THREE.ConeGeometry(0.018, 0.05, 6), RED, wR, g(0.73, 0.03, 0.066), { dir: [0, -1, 0] });

  // ------------------------------------------------------------------ head
  put(sph(1, 12, 9), SKIN, head, V(0, 1.13, 0.03), { scale: [0.135, 0.14, 0.14] });
  for (const s of [1, -1]) {
    put(sph(0.06, 8, 6), SKIN, head, V(s * 0.085, 1.09, 0.1), { scale: [1, 0.9, 0.9] });
    // ear with point and gold ring
    put(sph(0.032, 6, 5), SKIN, head, V(s * 0.135, 1.14, 0.0), { scale: [0.6, 1.4, 1] });
    put(new THREE.ConeGeometry(0.022, 0.07, 6), SKIN, head, V(s * 0.145, 1.17, -0.005), { dir: [s * 0.6, 0.8, -0.2] });
    put(tor(0.014, 0.004, 8), GOLD, head, V(s * 0.145, 1.105, 0.0), { dir: [1, 0, 0], axis: "z" });
    // eyes: heavy lid, white, iris, pupil, glint
    const ex = s * 0.052;
    put(sph(0.02, 8, 6), EYE_WHITE, head, V(ex, 1.16, 0.15));
    put(sph(0.012, 6, 5), IRIS, head, V(ex, 1.16, 0.165));
    put(sph(0.0065, 5, 4), DARK, head, V(ex, 1.16, 0.172));
    put(sph(0.0035, 4, 3), "#ffffff", head, V(ex + s * 0.004, 1.166, 0.176));
    put(sph(0.023, 8, 6), SKIN, head, V(ex, 1.172, 0.15), { scale: [1, 0.55, 1] });
    // bushy brow
    b.sweep(
      catmull([
        [s * 0.012, 1.19, 0.162],
        [s * 0.05, 1.2, 0.165],
        [s * 0.092, 1.186, 0.145],
      ]),
      [0.024, 0.008],
      { color: BEARD, bone: head },
    );
    // nostril
    put(sph(0.008, 5, 4), DARK, head, V(s * 0.017, 1.103, 0.205));
    // sideburn
    put(sph(0.05, 7, 5), BEARD, head, V(s * 0.12, 1.1, 0.04), { scale: [0.8, 1.3, 1] });
    // mustache
    b.sweep(
      catmull([
        [0, 1.098, 0.2],
        [s * 0.045, 1.09, 0.205],
        [s * 0.09, 1.072, 0.19],
        [s * 0.125, 1.078, 0.16],
        [s * 0.14, 1.1, 0.13],
      ]),
      [0.026, 0.008],
      { color: BEARD_L, bone: head },
    );
    // helmet horns
    b.sweep(
      catmull([
        [s * 0.145, 1.25, 0.02],
        [s * 0.22, 1.25, 0.02],
        [s * 0.26, 1.29, 0.02],
        [s * 0.265, 1.34, 0.02],
        [s * 0.24, 1.38, 0.02],
      ]),
      [0.034, 0.03, 0.02, 0.008],
      { color: HORN, bands: [[0.14, GOLD]], bone: head, caps: { end: "point" } },
    );
    // braids
    const braid = catmull([
      [s * 0.045, 1.0, 0.2],
      [s * 0.06, 0.9, 0.26],
      [s * 0.05, 0.78, 0.25],
      [s * 0.05, 0.66, 0.2],
      [s * 0.048, 0.6, 0.19],
    ]);
    b.sweep(braid, 0.016, { color: BEARD_D, bone: head });
    const beads = 14;
    for (let i = 0; i < beads; i++) {
      const p = braid.at(i / (beads - 1));
      const odd = i % 2 === 1;
      put(sph(0.028 - 0.0008 * i, 6, 5), odd ? BEARD_L : BEARD_D, head, V(p.x + (odd ? 0.011 : -0.011), p.y, p.z), {
        scale: [1, 0.75, 1],
        rotation: [0, 0, odd ? 30 : -30],
      });
    }
    const tip = braid.at(1);
    put(tor(0.024, 0.008, 8), GOLD, head, V(tip.x, tip.y - 0.005, tip.z), { rotation: [90, 0, 0] });
    put(new THREE.ConeGeometry(0.022, 0.06, 6), BEARD, head, V(tip.x, tip.y - 0.04, tip.z), { dir: [0, -1, 0] });
    // cheek lock
    b.sweep(
      catmull([
        [s * 0.1, 1.15, 0.1],
        [s * 0.105, 1.05, 0.16],
        [s * 0.08, 0.95, 0.2],
      ]),
      [0.05, 0.02],
      { color: BEARD, bone: head },
    );
  }
  put(sph(0.042, 8, 6), SKIN_R, head, V(0, 1.125, 0.175), { scale: [1, 1.05, 1.15] });
  put(sph(1, 8, 6), SKIN, jaw, V(0, 1.04, 0.1), { scale: [0.09, 0.05, 0.08] });
  put(sph(0.02, 6, 4), LIP, jaw, V(0, 1.093, 0.19), { scale: [1.6, 0.5, 0.7] });

  // main beard, chin tuft and a fringe of drawn tufts
  const beard = b.sweep(
    catmull([
      [0, 1.1, 0.12],
      [0, 1.06, 0.15],
      [0, 0.95, 0.18],
      [0, 0.82, 0.2],
    ]),
    (t: number): [number, number] => [0.13 - 0.08 * t, 0.07 - 0.025 * t],
    { color: BEARD, bone: head },
  );
  b.sweep(
    catmull([
      [0, 1.0, 0.2],
      [0, 0.9, 0.235],
      [0, 0.78, 0.245],
    ]),
    [0.05, 0.004],
    { color: BEARD_L, bone: head, caps: { end: "point" } },
  );
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#a84f1a"/><stop offset="0.6" stop-color="#d9742b"/><stop offset="1" stop-color="#f6b35c"/></linearGradient></defs>
    <path d="M2 64 C4 40 10 18 16 0 C22 18 28 40 30 64 Z" fill="url(#g)"/>
    <path d="M16 60 C16 40 16 20 16 6" stroke="#f9cf8a" stroke-width="2.4" fill="none"/></svg>`,
    { size: 128 },
  );
  const hits = b.surface(beard).scatter(90, { rng: rand, minDist: 0.03, filter: (h) => h.n.y < 0.4 });
  b.cards(hits, tuft, { size: [0.04, 0.085], lean: 50, flow: [0, -1, 0.15], bend: 25, vary: 0.3, spin: 15, rng: rand });

  // ------------------------------------------------------------------ helmet
  const helm: OutlinePoint[] = [
    [0, 0],
    [0.158, 0],
    [0.162, 0.015],
    [0.152, 0.07],
    [0.128, 0.12],
    [0.085, 0.16],
    [0.035, 0.18],
    [0, 0.185],
  ];
  b.lathe(helm, { at: [0, 1.2, 0.02], segments: 14, color: STEEL, bone: head });
  put(tor(0.162, 0.011, 14), GOLD, head, V(0, 1.205, 0.02), { rotation: [90, 0, 0] });
  for (const p of ringPts(V(0, 1.235, 0.02), V(0, 1, 0), 0.158, 12)) put(sph(0.011, 5, 4), GOLD, head, p);
  b.sweep(
    catmull([
      [0, 1.215, -0.14],
      [0, 1.26, -0.135],
      [0, 1.31, -0.115],
      [0, 1.35, -0.07],
      [0, 1.388, 0.02],
      [0, 1.355, 0.11],
      [0, 1.31, 0.155],
      [0, 1.26, 0.185],
      [0, 1.215, 0.19],
    ]),
    0.012,
    { color: GOLD, bone: head },
  );

  return b.root;
}
