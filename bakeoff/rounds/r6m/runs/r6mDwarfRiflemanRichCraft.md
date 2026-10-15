```ts
import * as THREE from "three";
import { createBuilder, lerp, offset, catmull, polyline, bezier, svg, paint, mix, smoothstep, patches, grain, mottle, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description: "Warcraft-style Ironforge dwarf rifleman with a braided flame-red beard and a brass blunderbuss, standing on a shooting-range stone base.",
};

// ---------- palette ----------
const GOLD = "#e0aa32";
const BRASS = "#c8932e";
const DARK = "#17151c";
const CLOTH = mottle("#2d5bb0", "#3b6dc6", { size: 0.06, contrast: 0.6 });
const CLOTH_D = mottle("#1f3f80", "#2a529c", { size: 0.05 });
const LEATHER = mottle("#6a4326", "#87562f", { size: 0.05 });
const LEATHER_D = "#3e2616";
const PANTS = mottle("#4a3a2c", "#5c4836", { size: 0.05 });
const STEEL = mottle("#707b8c", "#b2bdcd", { size: 0.05, contrast: 1.2 });
const WOOD = grain("#6e3f1f", "#9c6232", { size: 0.02, axis: "y" });
const SKIN = mottle("#e1a279", "#efb48d", { size: 0.08, contrast: 0.5 });
const NOSE = "#eb937a";
const HAT = mottle("#5a3820", "#744a2a", { size: 0.04 });
const FEATHER = "#c4281f";
const BONE = "#efe3c4";
const ROCK = mottle("#6d6b70", "#9a979c", { size: 0.08 });
const STONE = paint((p, n) => {
  if (n.y > 0.5 && (Math.sin(p.x * 7) * Math.cos(p.z * 6) + Math.sin(p.x * 3 + p.z * 4)) > 1.1) return "#58783a";
  return patches("#3b3834", ["#6d6a62", "#7d786c", "#5f5c55"], { size: 0.2, gap: 0.07 });
});
const beardPaint = (a: string, c: string) =>
  paint((_p, _n, s) => {
    const k = 0.5 + 0.5 * Math.sin(s[0] * 150 + Math.sin(s[1] * 18) * 1.5);
    return mix(a, c, k * 0.75 + smoothstep(-0.45, 0, s[1]) * 0.25);
  });
const BEARD = beardPaint("#a8441a", "#e47c34");
const BEARD_L = beardPaint("#c85a24", "#f29a48");

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 64 48"><ellipse cx="32" cy="26" rx="29" ry="19" fill="#17151c"/><ellipse cx="32" cy="26" rx="26" ry="16" fill="#fff6e6"/><circle cx="34" cy="26" r="13" fill="#2f86d6"/><circle cx="34" cy="26" r="8" fill="#14233f"/><circle cx="29" cy="21" r="4" fill="#fff"/><path d="M4 22 Q32 -2 60 22" stroke="#17151c" stroke-width="5" fill="none"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 80"><path d="M4 4 H60 V44 Q60 68 32 78 Q4 68 4 44Z" fill="#244a96" stroke="#e0aa32" stroke-width="5"/><path d="M12 60 L26 34 L34 46 L40 38 L52 60Z" fill="#c9d4e6" stroke="#17151c" stroke-width="2"/><rect x="29" y="12" width="6" height="30" fill="#7a4a26" stroke="#17151c" stroke-width="1.5" transform="rotate(30 32 27)"/><rect x="18" y="12" width="26" height="12" rx="2" fill="#e0aa32" stroke="#17151c" stroke-width="2" transform="rotate(30 32 18)"/></svg>`,
  { size: 192 },
);
const TARGET = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#17151c"/><circle cx="50" cy="50" r="44" fill="#f2e6c6"/><circle cx="50" cy="50" r="34" fill="#c4281f"/><circle cx="50" cy="50" r="24" fill="#f2e6c6"/><circle cx="50" cy="50" r="14" fill="#c4281f"/><circle cx="50" cy="50" r="5" fill="#17151c"/><circle cx="30" cy="38" r="3" fill="#17151c"/><circle cx="62" cy="58" r="3" fill="#17151c"/></svg>`,
  { size: 192 },
);
const LABEL = svg(
  `<svg viewBox="0 0 80 70"><rect x="2" y="2" width="76" height="66" rx="6" fill="#efe3c4" stroke="#17151c" stroke-width="4"/><circle cx="40" cy="26" r="13" fill="#17151c"/><rect x="31" y="34" width="18" height="8" fill="#17151c"/><circle cx="35" cy="25" r="3.5" fill="#efe3c4"/><circle cx="45" cy="25" r="3.5" fill="#efe3c4"/><text x="40" y="60" font-size="13" font-family="serif" font-weight="bold" text-anchor="middle" fill="#a3170f">POWDER</text></svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({ name: "dwarf_rifleman" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const S = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const put = (geo: THREE.BufferGeometry, color: any, at: number[], opt: any = {}) =>
    b.part(geo, color, { at, flat: true, ...opt });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.64, 0] });
  const spine = b.chain("spine", catmull([[0, 0.7, 0], [0, 0.88, 0.02], [0, 1.04, 0.03]]), {
    parent: hips, role: "spine", names: ["spine1", "spine2", "chest"],
  });
  const chest = spine.tip ?? spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.1, 0.03], aim: [0, 1.2, 0.06], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.2, 0.06], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.27, 0.07], aim: [0, 1.25, 0.2], role: "jaw" });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${k}`, catmull([[s * 0.12, 0.62, 0], [s * 0.12, 0.35, 0.03], [s * 0.12, 0.1, 0]]), {
      parent: hips, role: "leg", names: [`hip${k}`, `knee${k}`, `ankle${k}`],
    });
    b.sweep(leg, (t: number) => 0.105 - 0.03 * t, { color: PANTS });
    const ankle = leg.tip ?? leg.joints[2];
    put(S(0.075), STEEL, [s * 0.12, 0.36, 0.1], { bone: leg.joints[1], scale: [1, 1, 0.7] });
    put(S(0.05, 6, 4), GOLD, [s * 0.12, 0.36, 0.14], { bone: leg.joints[1], scale: [1, 1, 0.5] });
    put(new THREE.BoxGeometry(0.175, 0.14, 0.31), LEATHER, [s * 0.12, 0.07, 0.06], { bone: ankle });
    put(S(0.088, 8, 5), LEATHER, [s * 0.12, 0.06, 0.17], { bone: ankle, scale: [1, 0.8, 1] });
    put(new THREE.CylinderGeometry(0.115, 0.12, 0.15, 8), LEATHER, [s * 0.12, 0.2, 0.0], { bone: ankle });
    put(new THREE.TorusGeometry(0.118, 0.016, 4, 10), GOLD, [s * 0.12, 0.275, 0], { bone: ankle, dir: [0, 1, 0], axis: "z" });
    put(new THREE.BoxGeometry(0.06, 0.04, 0.02), GOLD, [s * 0.12, 0.2, 0.12], { bone: ankle });
  }

  // ---------- torso ----------
  const torso = b.loft(
    [
      { at: [0, 0.64, 0], w: 0.42, h: 0.3 },
      { at: [0, 0.84, 0.03], w: 0.46, h: 0.34 },
      { at: [0, 1.02, 0.02], w: 0.6, h: 0.38 },
      { at: [0, 1.12, 0.02], w: 0.62, h: 0.32 },
    ],
    { bone: [hips, spine], color: CLOTH },
  );
  const skin = b.surface(torso);
  // belt, trim, buckle
  b.sweep(skin.loop([0, 0.76, 0], { lift: 0.018 }), 0.032, { color: LEATHER_D });
  b.sweep(skin.loop([0, 0.87, 0], { lift: 0.008 }), 0.012, { color: GOLD });
  const bk = skin.nearest([0, 0.76, 0.6]);
  b.stick(new THREE.BoxGeometry(0.1, 0.03, 0.08), GOLD, bk, { embed: 0.2 });
  b.stick(new THREE.BoxGeometry(0.05, 0.034, 0.04), LEATHER_D, bk, { embed: 0.05 });
  b.decal(torso, EMBLEM, { at: [0, 0.97, 0.22], dir: [0, 0, 1], size: [0.17, 0.21] });
  // bandolier
  const sashPath = catmull([[-0.24, 1.14, 0.05], [-0.14, 1.07, 0.2], [0, 0.97, 0.24], [0.15, 0.86, 0.22], [0.22, 0.77, 0.1]]);
  b.sweep(skin.drape(sashPath, { lift: 0.014 }), 0.026, { color: LEATHER });
  b.along(skin.drape(sashPath, { lift: 0.045 }), 6, (at) => {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 6), BRASS, { at, flat: true });
    b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.02, 6), FEATHER, { at: offset(at, [0, 1, 0], 0.04), flat: true });
  });
  // tassets
  put(new THREE.BoxGeometry(0.24, 0.2, 0.03), CLOTH_D, [0, 0.58, 0.165], { bone: hips });
  put(new THREE.BoxGeometry(0.24, 0.025, 0.036), GOLD, [0, 0.48, 0.165], { bone: hips });
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.03, 0.18, 0.2), CLOTH_D, [s * 0.215, 0.56, 0.02], { bone: hips });
    put(new THREE.BoxGeometry(0.036, 0.022, 0.2), GOLD, [s * 0.215, 0.47, 0.02], { bone: hips });
  }
  // pouch + powder horn
  put(new THREE.BoxGeometry(0.1, 0.1, 0.06), LEATHER, [-0.2, 0.7, -0.14], { bone: hips });
  put(new THREE.BoxGeometry(0.105, 0.03, 0.065), GOLD, [-0.2, 0.74, -0.14], { bone: hips });
  b.sweep(bezier(V(0.24, 0.74, -0.12), V(0.36, 0.64, -0.12), V(0.28, 0.46, -0.04)), [0.036, 0.008], {
    bone: hips, color: BONE, caps: { start: "flat", end: "point" }, sides: 6,
  });
  put(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), BRASS, [0.24, 0.745, -0.12], { bone: hips });
  // backpack and bedroll
  put(new THREE.BoxGeometry(0.34, 0.36, 0.17), LEATHER, [0, 0.93, -0.24], { bone: chest });
  put(new THREE.BoxGeometry(0.36, 0.1, 0.19), LEATHER_D, [0, 1.07, -0.24], { bone: chest });
  put(new THREE.CylinderGeometry(0.075, 0.075, 0.46, 8), CLOTH_D, [0, 1.2, -0.26], { bone: chest, dir: [1, 0, 0] });
  for (const x of [-0.14, 0.14]) put(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 8), GOLD, [x, 1.2, -0.26], { bone: chest, dir: [1, 0, 0] });
  put(new THREE.BoxGeometry(0.05, 0.05, 0.02), GOLD, [0, 0.9, -0.33], { bone: chest });

  // ---------- neck & head ----------
  b.rod([0, 1.08, 0.03], [0, 1.24, 0.07], 0.08, SKIN, { bone: neck });
  const C = [0, 1.34, 0.07];
  const skull = put(S(0.16, 12, 9), SKIN, C, { bone: head, scale: [1, 0.95, 1.02] });
  put(S(0.05, 8, 6), NOSE, [0, 1.31, 0.235], { bone: head, scale: [1, 0.9, 1] });
  put(S(0.095, 8, 5), SKIN, [0, 1.235, 0.13], { bone: jaw, scale: [1.1, 0.6, 1] });
  put(new THREE.BoxGeometry(0.1, 0.012, 0.03), "#5a1e18", [0, 1.265, 0.2], { bone: jaw });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: [s * 0.07, 1.37, 0.21], dir: [0, 0, 1], size: [0.065, 0.05], mirror: s > 0 });
    put(new THREE.BoxGeometry(0.105, 0.038, 0.06), BEARD, [s * 0.07, 1.42, 0.2], { bone: head, rotation: [0, 0, -s * 14] });
    put(new THREE.ConeGeometry(0.035, 0.1, 5), SKIN, [s * 0.165, 1.35, 0.04], { bone: head, dir: [s, 0.4, -0.3] });
    put(S(0.1, 8, 5), BEARD, [s * 0.105, 1.27, 0.12], { bone: head, scale: [0.8, 1.1, 1] });
    put(S(0.05, 6, 4), SKIN, [s * 0.1, 1.33, 0.2], { bone: head, scale: [1, 0.8, 0.8] });
    b.sweep(catmull([[s * 0.01, 1.278, 0.235], [s * 0.07, 1.268, 0.248], [s * 0.13, 1.285, 0.215], [s * 0.15, 1.24, 0.19]]), [0.034, 0.012], {
      bone: head, color: BEARD_L, sides: 6,
    });
  }
  // beard
  b.extrude(
    [[-0.15, 0.0], [-0.17, -0.1], [-0.14, -0.25], [-0.08, -0.4], [0, -0.48], [0.08, -0.4], [0.14, -0.25], [0.17, -0.1], [0.15, 0], [0.08, 0.03], [-0.08, 0.03]],
    { at: [0, 1.285, 0.15], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, bevel: 0.015, color: BEARD, bone: head },
  );
  b.extrude(
    [[-0.1, -0.02], [-0.125, -0.12], [-0.09, -0.28], [0, -0.39], [0.09, -0.28], [0.125, -0.12], [0.1, -0.02]],
    { at: [0, 1.25, 0.185], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, bevel: 0.01, color: BEARD_L, bone: head },
  );
  // braids
  for (const s of [1, -1]) {
    const x0 = s * 0.075;
    for (let i = 0; i < 8; i++) {
      const y = 1.2 - i * 0.052;
      const wob = (i % 2 ? 1 : -1) * 0.017;
      put(S(0.032, 6, 4), i % 2 ? "#c8582a" : "#e88a3c", [x0 + wob, y, 0.25 - i * 0.004], { bone: head, scale: [1, 1.35, 1] });
    }
    put(new THREE.TorusGeometry(0.03, 0.01, 4, 8), GOLD, [x0, 1.2 - 8 * 0.052 + 0.02, 0.22], { bone: head, dir: [0, 1, 0], axis: "z" });
    put(new THREE.ConeGeometry(0.03, 0.08, 6), "#e88a3c", [x0, 1.2 - 8 * 0.052 - 0.03, 0.22], { bone: head, dir: [0, -1, 0] });
    put(new THREE.CylinderGeometry(0.014, 0.014, 0.025, 6), GOLD, [x0, 1.2 - 3 * 0.052 + 0.02, 0.255], { bone: head, scale: [1.5, 1, 1.5] });
  }
  // hat
  b.lathe(
    [[0, 0], [0.22, 0], [0.235, 0.012], [0.17, 0.035], [0.152, 0.1], [0.125, 0.15], [0.08, 0.168], [0, 0.17]],
    { at: [0, 1.435, 0.06], bone: head, color: HAT, segments: 12 },
  );
  put(new THREE.CylinderGeometry(0.153, 0.162, 0.035, 12), GOLD, [0, 1.49, 0.06], { bone: head });
  put(new THREE.BoxGeometry(0.05, 0.05, 0.03), GOLD, [0, 1.49, 0.22], { bone: head });
  b.extrude([[0, 0], [-0.05, 0.08], [-0.18, 0.15], [-0.3, 0.13], [-0.2, 0.04], [-0.08, -0.01]], {
    at: [-0.14, 1.52, 0.04], x: [-0.2, 0.1, 1], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, color: FEATHER, bone: head,
  });

  // ---------- shoulders & arms ----------
  const gb = V(-0.54, 0.015, 0.06);
  const gt = V(-0.5, 1.18, 0.3);
  const gd = gt.clone().sub(gb).normalize();
  const P = (t: number) => lerp(gb, gt, t);
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const pts = s > 0 ? [[0.37, 1.06, 0.02], [0.52, 0.86, -0.06], [0.27, 0.74, 0.1]] : [[-0.37, 1.06, 0.02], [-0.52, 0.84, -0.03], [-0.516, 0.72, 0.206]];
    const arm = b.chain(`arm${k}`, catmull(pts), { parent: chest, role: "arm", names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`] });
    b.sweep(arm, (t: number) => 0.085 - 0.022 * t, { color: CLOTH, bands: [[0.52, CLOTH], [1, SKIN]] });
    const wrist = arm.tip ?? arm.joints[2];
    const elbow = arm.joints[1];
    put(S(0.1, 8, 6), CLOTH, [s * 0.37, 1.06, 0.02], { bone: chest });
    // pauldron
    const pd = V(s * 0.7, 0.7, 0).normalize();
    const pc = [s * 0.4, 1.11, 0.02];
    put(new THREE.SphereGeometry(0.15, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, pc, { bone: chest, dir: pd, scale: [1, 0.85, 1.1] });
    put(new THREE.TorusGeometry(0.15, 0.02, 5, 12), GOLD, pc, { bone: chest, dir: pd, axis: "z", scale: [1, 1.1, 1] });
    put(new THREE.ConeGeometry(0.032, 0.11, 6), GOLD, offset(pc, pd, 0.14).toArray(), { bone: chest, dir: pd });
    // bracer + cuff
    const e = V(...(pts[1] as [number, number, number]));
    const w = V(...(pts[2] as [number, number, number]));
    const fa = w.clone().sub(e);
    put(new THREE.CylinderGeometry(0.068, 0.072, 0.09, 8), GOLD, lerp(e, w, 0.65).toArray(), { bone: elbow, dir: fa });
    put(new THREE.CylinderGeometry(0.062, 0.066, 0.05, 8), LEATHER, lerp(e, w, 0.3).toArray(), { bone: elbow, dir: fa });
    put(S(0.07, 6, 4), STEEL, [pts[1][0] + s * 0.03, pts[1][1], pts[1][2] - 0.03], { bone: elbow });
    // hands
    const W = pts[2];
    put(S(0.062, 8, 6), LEATHER, W, { bone: wrist, scale: [1, 1.05, 1] });
    if (s < 0) {
      for (let i = 0; i < 4; i++) put(S(0.026, 6, 4), LEATHER, [W[0], W[1] + 0.036 - i * 0.024, W[2] + 0.05], { bone: wrist });
      put(S(0.028, 6, 4), LEATHER, [W[0] - 0.05, W[1] + 0.04, W[2] + 0.02], { bone: wrist });
    } else {
      for (let i = 0; i < 4; i++) put(S(0.024, 6, 4), SKIN, [W[0] - 0.02 + i * 0.0, W[1] - 0.04, W[2] + 0.02 - 0.02 * i + 0.03], { bone: wrist });
      put(S(0.028, 6, 4), SKIN, [W[0] + 0.045, W[1] + 0.02, W[2] + 0.03], { bone: wrist });
    }
  }

  // ---------- blunderbuss (held by right hand) ----------
  const rw = b.surface(b.root) && "wristR";
  const gunOpt = { bone: rw };
  b.frustumBox(P(0), P(0.42), [0.075, 0.105], [0.05, 0.075], { color: WOOD, ...gunOpt });
  b.frustumBox(P(0), P(0.025), [0.08, 0.11], [0.08, 0.11], { color: BRASS, ...gunOpt });
  b.rod(P(0.4), P(0.78), 0.04, WOOD, { ...gunOpt, sides: 8 });
  b.rod(P(0.4), P(0.93), 0.027, STEEL, { ...gunOpt, sides: 8 });
  b.rod(P(0.9), P(1.0), [0.03, 0.085], STEEL, { ...gunOpt, sides: 10 });
  b.rod(P(0.982), P(1.0), 0.089, BRASS, { ...gunOpt, sides: 10 });
  put(new THREE.CylinderGeometry(0.075, 0.075, 0.004, 10), DARK, offset(P(1.0), gd, 0.003).toArray(), { ...gunOpt, dir: gd });
  for (const t of [0.6, 0.72, 0.84]) {
    const r = t < 0.78 ? 0.047 : 0.036;
    put(new THREE.CylinderGeometry(r, r, 0.022, 8), BRASS, P(t).toArray(), { ...gunOpt, dir: gd });
  }
  put(new THREE.BoxGeometry(0.022, 0.13, 0.065), STEEL, offset(P(0.45), [-1, 0, 0], 0.04).toArray(), { ...gunOpt, dir: gd });
  put(new THREE.BoxGeometry(0.02, 0.07, 0.03), STEEL, offset(P(0.5), [-1, 0, -0.5], 0.05).toArray(), { ...gunOpt, rotation: [0, 0, 30] });
  put(new THREE.TorusGeometry(0.04, 0.008, 4, 8), BRASS, offset(P(0.36), [0, 0, -1], 0.05).toArray(), { ...gunOpt, dir: [1, 0, 0], axis: "z" });
  put(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6), GOLD, offset(P(0.2), [-1, 0, 0], 0.04).toArray(), { ...gunOpt, dir: [1, 0, 0] });

  // ---------- base ----------
  b.lathe([[0, 0], [1.0, 0], [1.02, 0.008], [1.0, 0.025], [0, 0.025]], { at: [0, -0.025, 0], color: STONE, segments: 20, bone: hips });
  // keg
  const kx = -0.62, kz = -0.45;
  b.lathe([[0, 0], [0.14, 0], [0.17, 0.05], [0.19, 0.15], [0.17, 0.26], [0.14, 0.3], [0, 0.3]], { at: [kx, 0, kz], color: WOOD, segments: 10, bone: hips });
  for (const y of [0.07, 0.23]) put(new THREE.TorusGeometry(0.185, 0.012, 4, 12), GOLD, [kx, y, kz], { bone: hips, dir: [0, 1, 0], axis: "z" });
  put(new THREE.PlaneGeometry(0.16, 0.14), "#ffffff", [kx, 0.15, kz + 0.196], { bone: hips, dir: [0, 0, 1], axis: "z", texture: LABEL });
  // lantern on keg
  glow(put(new THREE.CylinderGeometry(0.04, 0.05, 0.09, 6), "#ffc060", [kx, 0.355, kz], { bone: hips }), 1.5);
  put(new THREE.CylinderGeometry(0.056, 0.056, 0.02, 6), BRASS, [kx, 0.31, kz], { bone: hips });
  put(new THREE.ConeGeometry(0.06, 0.05, 6), BRASS, [kx, 0.425, kz], { bone: hips });
  put(new THREE.TorusGeometry(0.03, 0.005, 4, 8), BRASS, [kx, 0.46, kz], { bone: hips });
  // target
  const tx = 0.55, tz = -0.5;
  const td = V(-0.25, 0, 1).normalize();
  put(new THREE.CylinderGeometry(0.23, 0.23, 0.04, 14), WOOD, [tx, 0.6, tz], { bone: hips, dir: td });
  put(new THREE.CircleGeometry(0.21, 16), "#ffffff", offset([tx, 0.6, tz], td, 0.022).toArray(), { bone: hips, dir: td, axis: "z", texture: TARGET });
  for (const s of [1, -1]) b.rod([tx + s * 0.1, 0.52, tz - 0.03], [tx + s * 0.28, 0, tz - 0.3], 0.018, WOOD, { bone: hips, sides: 5 });
  b.rod([tx, 0.45, tz - 0.03], [tx + 0.02, 0, tz + 0.08], 0.018, WOOD, { bone: hips, sides: 5 });
  // rocks, casings, tufts
  put(new THREE.IcosahedronGeometry(0.14, 0), ROCK, [0.72, 0.075, 0.28], { bone: hips, scale: [1, 0.7, 1.1], rotation: [10, 30, 0] });
  put(new THREE.IcosahedronGeometry(0.1, 0), ROCK, [-0.78, 0.06, 0.2], { bone: hips, scale: [1, 0.7, 1], rotation: [0, 70, 10] });
  put(new THREE.IcosahedronGeometry(0.08, 0), ROCK, [0.2, 0.05, -0.72], { bone: hips, scale: [1.2, 0.7, 1] });
  for (const [x, z] of [[0.3, 0.35], [0.42, 0.3], [-0.25, 0.45]])
    put(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 6), BRASS, [x, 0.012, z], { bone: hips, rotation: [90, x * 200, 0] });
  const r = rng(5);
  for (let i = 0; i < 7; i++) {
    const a = r() * 6.28, d = 0.75 + r() * 0.2;
    for (let j = 0; j < 3; j++)
      put(new THREE.ConeGeometry(0.02, 0.12 + r() * 0.06, 4), j % 2 ? "#4f7a2e" : "#6a9a3a", [Math.cos(a) * d + j * 0.02, 0.06, Math.sin(a) * d], {
        bone: hips, rotation: [(j - 1) * 14, 0, (j - 1) * 14],
      });
  }
  return b.root;
}
```