```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, polyline, limb, svg, mottle, grain, countershade, rng } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Dwarf Rifleman",
  description: "Stout Ironforge-style dwarf with a braided red beard, winged helm, bronze pauldrons and a brass blunderbuss.",
};

// ---------- palette ----------
const SKIN = mottle("#e0a07c", "#cc866a", { size: 0.05, seed: 3 });
const HAIR = grain("#e8702c", "#a63a18", { size: 0.02, axis: "y", seed: 5 });
const TUNIC = mottle("#2f64b0", "#25508f", { size: 0.06, seed: 8 });
const PANTS = mottle("#6a4a32", "#563a28", { size: 0.05, seed: 9 });
const LEATHER = mottle("#7a4c2a", "#5e3a1f", { size: 0.04, seed: 11 });
const BOOT = mottle("#4a2f1c", "#38230f", { size: 0.04, seed: 12 });
const BRONZE = metal("bronze", { polish: 0.35, tarnish: 0.2 });
const BRASS = metal("brass");
const STEEL = metal("steel");
const WOOD = grain("#8a5a30", "#5c3a1c", { size: 0.012, axis: "z", seed: 14 });
const BONE = "#efe3c0";
const DARK = "#14100e";
const GOLD = "#e8b83a";

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 64 40"><path d="M3 22 Q32 -2 61 22 Q32 40 3 22Z" fill="#14100e"/>
  <path d="M6 22 Q32 3 58 22 Q32 36 6 22Z" fill="#f6f1e6"/><circle cx="32" cy="21" r="12" fill="#2f86e0"/>
  <circle cx="32" cy="21" r="12" fill="none" stroke="#14407a" stroke-width="2"/>
  <circle cx="32" cy="21" r="5.5" fill="#0a0a12"/><circle cx="27" cy="16" r="3.4" fill="#fff"/>
  <path d="M3 22 Q32 -4 61 22" stroke="#14100e" stroke-width="5" fill="none"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1b3f7e" stroke="#e8b83a" stroke-width="6"/>
  <g transform="rotate(45 50 50)"><rect x="46" y="14" width="8" height="72" fill="#c9ccd6" stroke="#14100e" stroke-width="2"/>
  <rect x="34" y="12" width="32" height="16" fill="#e8b83a" stroke="#14100e" stroke-width="2"/></g>
  <g transform="rotate(-45 50 50)"><rect x="46" y="14" width="8" height="72" fill="#8a5a30" stroke="#14100e" stroke-width="2"/>
  <rect x="42" y="12" width="16" height="12" fill="#e8b83a" stroke="#14100e" stroke-width="2"/></g>
  <circle cx="50" cy="50" r="8" fill="#e8b83a" stroke="#14100e" stroke-width="2"/></svg>`,
  { size: 192 },
);
const TABARD = svg(
  `<svg viewBox="0 0 64 96"><rect width="64" height="96" fill="#2a5aa6"/>
  <path d="M0 0H64V96H0Z" fill="none" stroke="#e8b83a" stroke-width="5"/>
  <path d="M8 0V96M56 0V96" stroke="#1b3f7e" stroke-width="4"/>
  <circle cx="32" cy="40" r="17" fill="#1b3f7e" stroke="#e8b83a" stroke-width="3"/>
  <path d="M32 26 L36 38 L48 38 L38 45 L42 57 L32 50 L22 57 L26 45 L16 38 L28 38Z" fill="#e8b83a"/>
  <path d="M6 88 L14 80 L22 88 L30 80 L38 88 L46 80 L54 88" stroke="#e8b83a" stroke-width="3" fill="none"/></svg>`,
  { size: 192 },
);
const BUCKLE = svg(
  `<svg viewBox="0 0 64 48"><rect x="2" y="2" width="60" height="44" rx="6" fill="#e8b83a" stroke="#14100e" stroke-width="3"/>
  <rect x="14" y="12" width="36" height="24" rx="3" fill="#7a4c2a" stroke="#14100e" stroke-width="3"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });
  const R = rng(21);
  const sph = (r: number, ws = 10, hs = 7) => new THREE.SphereGeometry(r, ws, hs);
  const ball = (r: number, color: any, at: any, scale: number[], bone: any, extra: any = {}) =>
    b.part(sph(1), color, { bone, at, scale, ...extra });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.62, 0], [0, 0.85, 0.02], [0, 1.05, 0.04]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const chest = spine.tip!;
  const neck = b.chain("neck", catmull([[0, 1.05, 0.04], [0, 1.13, 0.06], [0, 1.2, 0.09]]), {
    parent: chest, names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.2, 0.09], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.23, 0.12], dir: [0, 0, 1], role: "jaw" });

  // ---------- torso ----------
  const torso = b.loft(
    [
      { at: [0, 0.58, 0], w: 0.46, h: 0.32 },
      { at: [0, 0.8, 0.04], w: 0.58, h: 0.4 },
      { at: [0, 1.0, 0.03], w: 0.62, h: 0.34 },
      { at: [0, 1.1, 0.03], w: 0.58, h: 0.28 },
    ],
    { bone: [spine, hips], color: TUNIC },
  );
  const cuirass = b.loft(
    [
      { at: [0, 0.88, 0.05], w: 0.64, h: 0.4 },
      { at: [0, 0.99, 0.05], w: 0.7, h: 0.4 },
      { at: [0, 1.1, 0.04], w: 0.66, h: 0.32 },
    ],
    { bone: spine, color: BRONZE },
  );
  const tskin = b.surface(torso);
  // belt
  b.sweep(tskin.loop([0, 0.7, 0], { lift: 0.018 }), 0.03, { color: LEATHER, bone: hips });
  b.part(new THREE.BoxGeometry(0.1, 0.075, 0.03), "#ffffff", { bone: hips, at: [0, 0.7, 0.245], texture: BUCKLE });
  // collar / gorget
  b.lathe([[0.1, 0], [0.17, 0.0], [0.19, 0.04], [0.12, 0.05], [0.1, 0.04]], {
    at: [0, 1.1, 0.05], bone: chest, color: BRONZE, segments: 10,
  });
  // chest emblem
  b.decal(cuirass, EMBLEM, { at: [0, 1.0, 0.3], dir: [0, 0, 1], size: [0.2, 0.2] });
  // bandolier
  const cskin = b.surface(cuirass);
  const strapPath = cskin.drape(
    catmull([[0.22, 1.1, 0.14], [0.06, 0.99, 0.28], [-0.1, 0.92, 0.28], [-0.3, 0.88, 0.12]]),
    { lift: 0.012 },
  );
  b.sweep(strapPath, 0.022, { color: LEATHER, bone: chest });
  for (let i = 0; i < 6; i++) {
    const hit = cskin.nearest(strapPath.at((i + 0.5) / 6));
    b.stick(new THREE.CylinderGeometry(0.015, 0.015, 0.06, 6), BRASS, hit, { embed: 0.15 });
    b.stick(new THREE.ConeGeometry(0.015, 0.025, 6), BRONZE, hit.moved([0, 0.05, 0]), { embed: 0 });
  }
  // tabard
  b.part(new THREE.BoxGeometry(0.3, 0.42, 0.03), "#ffffff", { bone: hips, at: [0, 0.5, 0.255], texture: TABARD });
  // backpack and bedroll
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.14), LEATHER, { bone: chest, at: [0, 0.9, -0.2] });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.42, 8), "#8a8f5a", { bone: chest, at: [0, 1.1, -0.22], dir: [1, 0, 0] });
  for (const x of [-0.12, 0.12])
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 8), LEATHER, { bone: chest, at: [x, 1.1, -0.22], dir: [1, 0, 0] });
  // powder horn
  b.sweep(bezier([0.24, 0.68, 0.1], [0.36, 0.6, 0.14], [0.31, 0.42, 0.2]), [0.036, 0.008], {
    bone: hips, color: BONE, caps: { start: "round", end: "point" },
  });
  ball(0.03, BRASS, [0.24, 0.69, 0.1], [1, 1, 1], hips);

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.13, 0.62, 0], [s * 0.14, 0.17, 0.03], [0.27, 0.27], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg",
    });
    b.sweep(leg, [0.105, 0.078], { color: PANTS });
    const ankle = leg.joints[2];
    b.part(new THREE.BoxGeometry(0.17, 0.13, 0.3), BOOT, { bone: ankle, at: [s * 0.14, 0.065, 0.06] });
    ball(0.085, BOOT, [s * 0.14, 0.075, 0.19], [1, 0.8, 1], ankle);
    b.part(new THREE.CylinderGeometry(0.1, 0.09, 0.12, 8), LEATHER, { bone: ankle, at: [s * 0.14, 0.2, 0.03] });
    b.part(new THREE.TorusGeometry(0.098, 0.01, 4, 10), BRASS, { bone: ankle, at: [s * 0.14, 0.26, 0.03], dir: [0, 1, 0], axis: "z" });
    b.part(new THREE.BoxGeometry(0.13, 0.04, 0.1), BRONZE, { bone: ankle, at: [s * 0.14, 0.02, 0.2] });
    // knee pad
    ball(0.075, BRONZE, leg.joints[1].local({ forward: 0.07 }), [1, 1, 0.7], leg.joints[1]);
  }

  // ---------- arms ----------
  const Hr = new THREE.Vector3(-0.45, 0.72, 0.3);
  const Lh = new THREE.Vector3(0.5, 0.62, 0.12);
  const arms: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hand = s > 0 ? Lh : Hr;
    const pts = limb([s * 0.37, 1.0, 0.02], [hand.x, hand.y, hand.z], [0.26, 0.25], [[0, -0.3, -1]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm",
    });
    arms[side] = arm;
    b.sweep(arm, [0.088, 0.066], { color: TUNIC });
    b.sweep(arm, 0.075, { from: 0.72, to: 1, caps: "flat", color: BRONZE });
    // pauldron
    const sh = arm.joints[0];
    ball(0.115, BRONZE, [s * 0.4, 1.06, 0.02], [1, 0.7, 1], sh);
    b.part(new THREE.TorusGeometry(0.11, 0.014, 5, 12), BRASS, { bone: sh, at: [s * 0.41, 1.04, 0.02], dir: [s * 0.4, 1, 0], axis: "z" });
    b.spike([s * 0.42, 1.1, 0.02], [s * 0.3, 1, 0], 0.09, 0.028, { color: BRASS, bone: sh });
    ball(0.062, SKIN, hand, [1, 1, 1], arm.tip ?? arm.joints[2], { });
  }
  // left open hand
  const wl = arms.L.joints[2];
  for (let k = 0; k < 4; k++) {
    const z = Lh.z + (k - 1.5) * 0.026;
    b.capsule([Lh.x, Lh.y - 0.03, z], [Lh.x + 0.01, Lh.y - 0.14, z + 0.012], 0.016, { color: SKIN, bone: wl });
  }
  b.capsule([Lh.x - 0.03, Lh.y - 0.02, Lh.z + 0.05], [Lh.x - 0.02, Lh.y - 0.08, Lh.z + 0.13], 0.018, { color: SKIN, bone: wl });
  // right fist knuckles
  const wr = arms.R.joints[2];
  for (let k = 0; k < 3; k++)
    ball(0.02, SKIN, [Hr.x + (k - 1) * 0.001, Hr.y + 0.03 - k * 0.03, Hr.z + 0.06], [1, 1, 1], wr);

  // ---------- blunderbuss ----------
  const G = new THREE.Vector3(0, 0.1, 1).normalize();
  const p0 = Hr.clone().add(new THREE.Vector3(0, 0.07, 0.07));
  const at = (d: number) => p0.clone().addScaledVector(G, d);
  b.frustumBox([Hr.x, Hr.y + 0.05, Hr.z + 0.1], [Hr.x, Hr.y - 0.1, Hr.z - 0.3], [0.055, 0.075], [0.07, 0.16], {
    color: WOOD, bone: wr,
  });
  b.lathe([[0, 0], [0.03, 0], [0.034, 0.35], [0.085, 0.62], [0, 0.62]], {
    at: p0, axis: G, color: STEEL, bone: wr, segments: 10,
  });
  for (const d of [0.05, 0.2, 0.34])
    b.part(new THREE.TorusGeometry(0.036 + (d > 0.3 ? 0.008 : 0), 0.009, 4, 10), BRASS, { bone: wr, at: at(d), dir: G, axis: "z" });
  b.part(new THREE.TorusGeometry(0.086, 0.013, 5, 12), BRASS, { bone: wr, at: at(0.62), dir: G, axis: "z" });
  b.part(new THREE.CircleGeometry(0.078, 10), DARK, { bone: wr, at: at(0.625), dir: G, axis: "z" });
  b.part(new THREE.BoxGeometry(0.02, 0.06, 0.08), BRASS, { bone: wr, at: [Hr.x + 0.035, Hr.y + 0.07, Hr.z + 0.04] });
  b.part(new THREE.BoxGeometry(0.02, 0.05, 0.03), STEEL, { bone: wr, at: [Hr.x, Hr.y + 0.14, Hr.z + 0.0] });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 4, 8), BRASS, { bone: wr, at: [Hr.x, Hr.y - 0.015, Hr.z + 0.09], dir: [1, 0, 0], axis: "z" });
  b.part(new THREE.BoxGeometry(0.014, 0.04, 0.012), STEEL, { bone: wr, at: [Hr.x, Hr.y - 0.0, Hr.z + 0.08] });
  b.part(new THREE.BoxGeometry(0.075, 0.17, 0.02), BRASS, { bone: wr, at: [Hr.x, Hr.y - 0.1, Hr.z - 0.3] });

  // ---------- head ----------
  const headC = head.local({ up: 0.1, forward: 0.04 });
  const skull = b.part(sph(1, 14, 10), SKIN, { bone: head, at: headC, scale: [0.145, 0.13, 0.14] });
  const hskin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = hskin.around(headC).at(s * 26, 6);
    if (hit) b.decal(hskin, EYE, { at: hit, size: [0.075, 0.048], mirror: s > 0 });
  }
  ball(0.058, "#d98a6c", head.local({ forward: 0.185, up: 0.065 }), [1, 0.9, 1], head);
  b.part(new THREE.BoxGeometry(0.15, 0.05, 0.12), SKIN, { bone: jaw, at: [0, 1.215, 0.19] });
  for (const s of [1, -1]) {
    ball(1, SKIN, [s * 0.14, 1.3, 0.1], [0.03, 0.055, 0.04], head);
    b.capsule([s * 0.012, 1.337, 0.266], [s * 0.088, 1.355, 0.235], 0.022, { color: HAIR, bone: head });
    b.sweep(catmull([[s * 0.01, 1.245, 0.258], [s * 0.06, 1.225, 0.252], [s * 0.115, 1.215, 0.21], [s * 0.15, 1.255, 0.17]]), [0.037, 0.014], {
      color: HAIR, bone: head,
    });
    b.capsule([s * 0.128, 1.29, 0.15], [s * 0.1, 1.17, 0.215], 0.035, { color: HAIR, bone: head });
  }
  // beard
  b.loft(
    [
      { at: [0, 1.21, 0.2], w: 0.22, h: 0.14 },
      { at: [0, 1.12, 0.23], w: 0.29, h: 0.14 },
      { at: [0, 1.0, 0.25], w: 0.25, h: 0.12 },
      { at: [0, 0.9, 0.26], w: 0.14, h: 0.09 },
    ],
    { bone: head, color: HAIR },
  );
  b.spike([0, 0.92, 0.265], [0, -1, 0.1], 0.14, 0.065, { color: HAIR, bone: head });
  // braids
  for (const s of [1, -1]) {
    const a = new THREE.Vector3(s * 0.105, 1.13, 0.275);
    const e = new THREE.Vector3(s * 0.115, 0.76, 0.3);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const p = a.clone().lerp(e, t);
      p.x += (i % 2 ? 1 : -1) * 0.012;
      ball(0.026 * (1 - 0.25 * t), HAIR, p, [1, 1.25, 0.9], head);
    }
    b.part(new THREE.TorusGeometry(0.022, 0.009, 4, 8), GOLD, { bone: head, at: [e.x, e.y - 0.035, e.z], dir: [0, 1, 0], axis: "z" });
    b.spike([e.x, e.y - 0.03, e.z], [0, -1, 0], 0.07, 0.022, { color: HAIR, bone: head });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 8), GOLD, { bone: head, at: [s * 0.105, 1.12, 0.29], dir: [0, 0, 1] });
  }
  // helmet
  const hc = head.local({ up: 0.16, forward: 0.03 });
  b.lathe([[0, 0], [0.165, 0], [0.172, 0.025], [0.15, 0.055], [0.125, 0.1], [0.075, 0.14], [0, 0.155]], {
    at: hc, bone: head, color: STEEL, segments: 12,
  });
  b.part(new THREE.TorusGeometry(0.17, 0.014, 5, 14), BRASS, { bone: head, at: hc.clone().add(new THREE.Vector3(0, 0.02, 0)), dir: [0, 1, 0], axis: "z" });
  b.spike(hc.clone().add(new THREE.Vector3(0, 0.15, 0)), [0, 1, 0], 0.08, 0.022, { color: BRASS, bone: head });
  b.part(new THREE.BoxGeometry(0.03, 0.06, 0.02), BRASS, { bone: head, at: hc.clone().add(new THREE.Vector3(0, 0.05, 0.17)) });
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.12, 0.03], [0.17, 0.13], [0.08, 0.07], [0, 0.05]], {
      at: [s * 0.165, 1.43, 0.13], x: [s, 0, 0], thickness: 0.014, color: BRASS, bone: head,
    });
    ball(0.016, GOLD, [s * 0.17, 1.44, 0.2], [1, 1, 1], head);
  }
  // hanging tuft of red hair behind helmet
  b.sweep(catmull([[0, 1.4, -0.02], [0, 1.3, -0.1], [0, 1.18, -0.12]]), [0.05, 0.015], { color: HAIR, bone: head });

  return b.root;
}
```