import * as THREE from "three";
import { createBuilder, rng, offset, limb, catmull, paint, noise, mix, svg } from "../../../../src/index";
import { cel, furEdge, animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on Mossy Stone",
  description: "A cel-shaded, Genshin-style red panda standing on a mossy stone with a glowing Dendro rune and flowers.",
};

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  // ---------- palette ----------
  const S = 0.22; // stone top height
  const RUST = "#e0642a";
  const RUST_L = "#f2893f";
  const RUST_D = "#b3441e";
  const DARK = "#3b1f1a";
  const CREAM_C = "#fff1d6";
  const HC = new THREE.Vector3(0, 0.55, 0.37); // head centre

  const COAT = cel(furEdge(RUST, DARK, { level: -0.2, teeth: 0.2, period: 0.03 }));
  const LEG = cel(DARK);
  const CREAM = cel(CREAM_C, "#e8c9a0");
  const NOSE = cel("#1b1014", "#1b1014");
  const EARIN = cel("#4a2620", "#2f1714");
  const EARBACK = cel(RUST, RUST_D);

  const headPaint = paint((p) => {
    const dx = Math.abs(p.x - HC.x);
    const dy = p.y - HC.y;
    const dz = p.z - HC.z;
    if (dz > 0.05 && dy < -0.012) return CREAM_C;
    if (dx > 0.06 && dy < 0 && dz > -0.02) return CREAM_C;
    if (dy > 0.04 && dy < 0.065 && dx > 0.02 && dx < 0.055 && dz > 0.03) return CREAM_C;
    if (Math.abs(dx - 0.04) < 0.007 && dy < -0.028 && dy > -0.06 && dz > 0.04) return RUST_D;
    return dy > 0.03 ? RUST_L : RUST;
  });
  const HEAD = cel(headPaint);

  const tailPaint = paint((_p, _n, s) => {
    if (s[0] > 0.93) return DARK;
    return Math.floor(s[0] * 10) % 2 ? RUST_D : RUST_L;
  });
  const TAIL = cel(tailPaint);

  const MOSS_A = "#86c64e";
  const MOSS_B = "#4f9a3a";
  const STONE_C = "#8f96aa";
  const stonePaint = paint((p, n) => {
    const nz = noise(p, 0.07, 3);
    const edge = 0.15 + 0.07 * nz;
    if (n.y > 0.5 || p.y > edge) return mix(MOSS_B, MOSS_A, noise(p, 0.05, 8));
    return mix("#6c7388", STONE_C, noise(p, 0.09, 4));
  });
  const STONE = cel(stonePaint);

  // ---------- textures ----------
  const EYE = animeEye({ iris: "#d98a1e", blush: false, size: 256 });
  const RUNE = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#9dff7a" stroke-width="4"/>
     <path d="M32 12 C48 26 48 42 32 52 C16 42 16 26 32 12Z" fill="none" stroke="#9dff7a" stroke-width="4" stroke-linejoin="round"/>
     <path d="M32 20 V50 M32 32 L42 26 M32 40 L22 34" stroke="#9dff7a" stroke-width="3.5" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 48 L10 4 L19 48Z" fill="#6cbb40"/><path d="M11 48 L1 18 L16 48Z" fill="#8bd24f"/>
     <path d="M17 48 L31 12 L24 48Z" fill="#4a9a34"/><path d="M14 48 L20 22 L21 48Z" fill="#a4e060"/></svg>`,
    { size: 96 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.43, -0.22] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.43, -0.22],
      [0, 0.45, -0.02],
      [0, 0.47, 0.14],
      [0, 0.51, 0.25],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    [
      [0, 0.51, 0.25],
      [0, 0.54, 0.31],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip ?? neck.joints[0], at: [0, 0.54, 0.31], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ up: -0.035, forward: 0.02 }),
    aim: head.local({ up: -0.035, forward: 0.12 }),
    role: "jaw",
  });

  // ---------- body ----------
  b.sweep(spine, [0.085, 0.11, 0.115, 0.09], { color: COAT });
  b.sweep(neck, 0.08, { color: COAT });
  const sph = (n = 10, m = 8) => new THREE.SphereGeometry(1, n, m);
  for (const s of [1, -1]) {
    b.part(sph(), COAT, { bone: hips, at: [s * 0.08, 0.42, -0.2], scale: [0.07, 0.085, 0.09] });
    b.part(sph(), COAT, { bone: chest, at: [s * 0.08, 0.44, 0.15], scale: [0.065, 0.08, 0.075] });
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.44, -0.27],
      [0, 0.47, -0.45],
      [0, 0.5, -0.65],
      [0, 0.49, -0.85],
      [0, 0.45, -1.02],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );
  b.sweep(tail, [0.055, 0.075, 0.09, 0.09, 0.07, 0.035], { color: TAIL, sides: 8 });

  // ---------- legs ----------
  const legs: { name: string; hip: number[]; foot: number[]; parent: any; bend: number[] }[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legs.push({ name: `H${side}`, hip: [s * 0.075, 0.41, -0.2], foot: [s * 0.085, S + 0.024, -0.2], parent: hips, bend: [0, 0, 1] });
    legs.push({ name: `F${side}`, hip: [s * 0.075, 0.42, 0.15], foot: [s * 0.08, S + 0.024, 0.16], parent: chest, bend: [0, 0, -1] });
  }
  for (const l of legs) {
    const pts = limb(l.hip as any, l.foot as any, [0.1, 0.1], [l.bend as any]);
    const leg = b.chain(`leg${l.name}`, pts, {
      parent: l.parent,
      names: [`hip${l.name}`, `knee${l.name}`, `ankle${l.name}`],
      role: "leg",
      contact: [l.foot[0], S, l.foot[2]],
    });
    b.sweep(leg, [0.05, 0.04, 0.036], { color: LEG });
    const tip = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.part(sph(8, 6), LEG, {
      bone: tip,
      at: [l.foot[0], S + 0.02, l.foot[2] + 0.012],
      scale: [0.042, 0.024, 0.058],
    });
    for (const i of [-1, 0, 1])
      b.part(sph(6, 4), LEG, {
        bone: tip,
        at: [l.foot[0] + i * 0.019, S + 0.017, l.foot[2] + 0.055 - Math.abs(i) * 0.006],
        scale: [0.014, 0.012, 0.018],
      });
  }

  // ---------- head ----------
  const skull = b.part(sph(16, 12), HEAD, { bone: head, at: HC, scale: [0.1, 0.088, 0.09] });
  // muzzle & lower jaw & nose
  b.part(sph(10, 8), CREAM, { bone: head, at: [0, 0.525, 0.44], scale: [0.04, 0.03, 0.045] });
  b.part(sph(6, 5), NOSE, { bone: head, at: [0, 0.538, 0.484], scale: [0.017, 0.012, 0.012] });
  b.part(sph(10, 8), CREAM, { bone: jaw, at: [0, 0.497, 0.425], scale: [0.032, 0.014, 0.04] });
  b.part(sph(6, 4), cel("#c85a6a", "#8f3a4a"), { bone: jaw, at: [0, 0.505, 0.43], scale: [0.02, 0.006, 0.028] });

  // eyes
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 30, 8)!;
    b.decal(skin, EYE, { at: hit, size: [0.042, 0.058], mirror: s > 0, bone: head });
  }
  // cheek ruffs
  for (const s of [1, -1])
    for (const [az, el] of [
      [62, -18],
      [78, -22],
      [94, -18],
      [108, -10],
      [80, -4],
    ]) {
      const hit = skin.around(HC).at(s * az, el)!;
      b.stick(new THREE.ConeGeometry(0.02, 0.06, 5), CREAM, hit, { embed: 0.25, bone: head });
    }
  // ears
  for (const s of [1, -1]) {
    const d = new THREE.Vector3(s * 0.55, 0.35, 0.75).normalize();
    const base = head.local({ left: s * 0.068, up: 0.075, forward: -0.005 });
    const dirA = [d.x, d.y, d.z];
    b.part(sph(10, 8), EARBACK, { bone: head, at: offset(base, dirA, -0.004), dir: dirA, axis: "z", scale: [0.046, 0.052, 0.014] });
    b.part(sph(10, 8), CREAM, { bone: head, at: offset(base, dirA, 0.002), dir: dirA, axis: "z", scale: [0.048, 0.053, 0.013] });
    b.part(sph(10, 8), EARIN, { bone: head, at: offset(base, dirA, 0.007), dir: dirA, axis: "z", scale: [0.033, 0.039, 0.012] });
  }

  // ---------- stone ----------
  const stone = b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.37, 0.06],
      [0.38, 0.13],
      [0.34, 0.2],
      [0.3, S],
      [0, S],
    ],
    { at: [0, 0, 0], bone: hips, segments: 9, color: STONE },
  );
  for (const [x, z, r] of [
    [0.42, 0.2, 0.09],
    [-0.4, -0.15, 0.08],
    [0.26, -0.4, 0.07],
  ] as number[][])
    b.part(new THREE.DodecahedronGeometry(r, 0), STONE, { bone: hips, at: [x, r * 0.7, z], flat: true, scale: [1.2, 0.8, 1] });

  const rune = b.decal(stone, RUNE, { at: [0, 0.1, 0.37], dir: [0, 0, 1], size: [0.12, 0.12], bone: hips });
  glow(rune, 1.4);

  const top = b.surface(stone);
  const tufts = top.scatter(70, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.y > 0.8 });
  b.cards(tufts, TUFT, { size: [0.04, 0.05], lean: 15, cross: true, vary: 0.35, spin: 180, rng: rng(6), bone: hips });

  const flowers = top.scatter(6, { rng: rng(9), minDist: 0.15, filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 0.22 });
  for (const h of flowers) {
    b.part(new THREE.ConeGeometry(0.004, 0.055, 4), "#5aa83a", { bone: hips, at: offset(h.at, [0, 1, 0], 0.025) });
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), "#9ff6ff", { bone: hips, at: offset(h.at, [0, 1, 0], 0.06) }), 1.6);
    glow(b.part(new THREE.SphereGeometry(0.006, 5, 4), "#fff6a0", { bone: hips, at: offset(h.at, [0, 1, 0], 0.07) }), 1.8);
  }

  return b.root;
}
