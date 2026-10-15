```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, paint, polyline, svg } from "agentic-3js-builder";
import type { Fill, JointRef } from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";
import { gearGeometry, gearTexture, metal, panelled, TINT } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Dwarf rifleman",
  description: "A stout dwarf rifleman with a copper braided beard, riveted steel helm and a blued, brass-banded blunderbuss.",
};

// ---------------------------------------------------------------------------------------------------------------
// Helpers

type V3 = [number, number, number];
const V = (p: V3) => new THREE.Vector3(p[0], p[1], p[2]);
const toArr = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];
const lerp3 = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const mirror = (p: V3): V3 => [-p[0], p[1], p[2]];

/** k points on a circle of radius r about c, in the plane with normal n. */
function ringPoints(c: V3, n: V3, r: number, k: number): V3[] {
  const N = V(n).normalize();
  const a = Math.abs(N.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(N, a).normalize();
  const w = new THREE.Vector3().crossVectors(N, u);
  const out: V3[] = [];
  for (let i = 0; i < k; i++) {
    const th = (i / k) * Math.PI * 2;
    out.push(toArr(V(c).addScaledVector(u, r * Math.cos(th)).addScaledVector(w, r * Math.sin(th))));
  }
  return out;
}

/** An ellipsoid in model space, ready for `put`. */
const ellipsoid = (c: V3, r: V3, seg: [number, number] = [14, 10]) =>
  new THREE.SphereGeometry(1, seg[0], seg[1]).scale(r[0], r[1], r[2]).translate(c[0], c[1], c[2]);

// ---------------------------------------------------------------------------------------------------------------
// Paints. Warm skin and orange beard against a teal coat, blue trousers, steel and copper: a bold Warcraft palette.

const SKIN = cel("#eaa274", "#b8634a");
const NOSE = cel("#e4765a", "#9c3e35");
const BEARD = cel(grain("#d4582a", "#f08a3c", { size: 0.035, axis: "y" }), "#7d2a16");
const BEARD_HI = cel("#f7b35c", "#b8662c");
const BEARD_LO = cel("#a8401f", "#5e1f10");
const COAT = cel("#2d8a7a", "#1a5249");
const VEST = cel(grain("#94602f", "#5a3018", { size: 0.04, axis: "y" }), "#3d2010");
// Teal coat with a leather vest panel down the front.
const TORSO = paint((p, n) =>
  n.z > 0.45 && p.y > 0.7 && p.y < 0.92 && Math.abs(p.x) < 0.1 + 0.12 * (p.y - 0.7) ? VEST : COAT,
);
const LEATHER = cel("#8a5230", "#56301a");
const TROUSER = cel("#3e5fb8", "#22347a");
const BOOT = cel("#4e2e1b", "#2a170b");
const WOOD = cel(grain("#8c5530", "#4f2a14", { size: 0.02, axis: "z" }), "#3a1d0c");
const HORN = cel("#efd9a4", "#b99657");
const STEEL = panelled(metal("steel"), { size: 0.07, rivets: 0.022 });
const COPPER = metal("copper", { verdigris: 0.25 });
const GILT = metal("gilt");
const BRASS = metal("brass", { verdigris: 0.2 });
const BLUED = metal("blued");
const IRON = metal("iron");

// ---------------------------------------------------------------------------------------------------------------
// Drawings

/** Heavy-browed, squinting eye: the brow line is the character. Drawn for the +X eye; mirrored for the other. */
const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="23" rx="25" ry="13" fill="#f6ecd8"/>
    <circle cx="34" cy="23" r="10.5" fill="#2b86b8"/>
    <circle cx="34" cy="23" r="5.2" fill="#0c1820"/>
    <circle cx="37.5" cy="19.5" r="2.6" fill="#ffffff"/>
    <path d="M5 21 Q32 -2 60 13" fill="none" stroke="#2e160a" stroke-width="7" stroke-linecap="round"/>
    <path d="M8 31 Q32 39 57 28" fill="none" stroke="#2e160a" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

/** A cog on a red field: the clan mark on the helm. */
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="25" fill="none" stroke="#f6d36b" stroke-width="8" stroke-dasharray="4.2 3.4"/>
    <circle cx="32" cy="32" r="22" fill="#c2452a" stroke="#3a2212" stroke-width="2"/>
    <circle cx="32" cy="32" r="11" fill="#f6d36b" stroke="#3a2212" stroke-width="2"/>
    <circle cx="32" cy="32" r="4" fill="#3a2212"/>
  </svg>`,
  { size: 256 },
);

/** A round gold-rimmed sigil with a hammer, sewn on the vest. */
const SIGIL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#f0b53c"/>
    <circle cx="32" cy="32" r="25" fill="#b8402a"/>
    <rect x="29" y="16" width="6" height="32" rx="2" fill="#f6d36b"/>
    <rect x="20" y="13" width="24" height="11" rx="2.5" fill="#f6d36b"/>
    <rect x="22" y="46" width="20" height="4" rx="2" fill="#f6d36b"/>
  </svg>`,
  { size: 192 },
);

/** An engraved lock plate. */
const LOCK = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="48" fill="#7b8291"/>
    <path d="M5 10 Q16 1 27 10 T23 27 T9 40" fill="none" stroke="#f2c35b" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M5 38 Q16 46 27 38" fill="none" stroke="#f2c35b" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="16" cy="22" r="3" fill="#f2c35b"/>
  </svg>`,
  { size: 160 },
);

const BUCKLE = { teeth: 12, module: 0.0065, bore: 0.006, spokes: 4 };
const BUCKLE_TEX = gearTexture(BUCKLE);

// ---------------------------------------------------------------------------------------------------------------
// Outlines and skeleton points (model space, meters, +Y up, facing +Z)

const HELM: [number, number][] = [
  [0, 0],
  [0.176, 0],
  [0.18, 0.02],
  [0.168, 0.085],
  [0.132, 0.14],
  [0.076, 0.175],
  [0, 0.18],
];
const PAULDRON: [number, number][] = [
  [0, 0],
  [0.118, 0],
  [0.122, 0.02],
  [0.11, 0.06],
  [0.085, 0.095],
  [0.045, 0.12],
  [0, 0.125],
];
/** Boot side profile: x runs forward (+Z), y up. */
const BOOT_OUT: [number, number][] = [
  [-0.09, 0],
  [0.17, 0],
  [0.19, 0.04],
  [0.16, 0.065],
  [0.07, 0.075],
  [0.07, 0.16],
  [-0.09, 0.16],
];
const TORSO_ST: { at: V3; w: number; h: number }[] = [
  { at: [0, 0.68, 0], w: 0.34, h: 0.24 },
  { at: [0, 0.8, 0], w: 0.35, h: 0.26 },
  { at: [0, 0.93, 0.01], w: 0.42, h: 0.3 },
  { at: [0, 1.03, 0], w: 0.4, h: 0.26 },
  { at: [0, 1.1, 0], w: 0.22, h: 0.18 },
];
const ARM_L: V3[] = [
  [0.22, 1.0, 0],
  [0.25, 0.9, 0.16],
  [-0.06, 0.99, 0.46],
];
const ARM_R: V3[] = [
  [-0.22, 1.0, 0],
  [-0.27, 0.86, 0.12],
  [-0.15, 0.96, 0.26],
];
const LEG_L: V3[] = [
  [0.12, 0.66, 0],
  [0.13, 0.36, 0.02],
  [0.13, 0.07, 0],
];
const LEG_R: V3[] = LEG_L.map(mirror);
const BEARD_PTS: V3[] = [
  [0, 1.07, 0.1],
  [0, 1.0, 0.15],
  [0, 0.93, 0.17],
  [0, 0.87, 0.18],
  [0, 0.83, 0.175],
];
const BEARD_W = [0.18, 0.22, 0.21, 0.16, 0.08];
const BEARD_H = [0.12, 0.14, 0.13, 0.11, 0.07];

// The blunderbuss, in model space: stock butt, stock front (barrel root), muzzle.
const STOCK_BUTT: V3 = [-0.2, 0.9, -0.05];
const STOCK_FRONT: V3 = [-0.14, 0.97, 0.32];
const MUZZLE: V3 = [0, 1.03, 0.72];
const LOCK_AT: V3 = [-0.158, 0.976, 0.36];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "dwarf-rifleman" });
  const put = (geo: THREE.BufferGeometry, color: Fill, bone: JointRef) => b.part(geo, color, { bone, at: [0, 0, 0] });

  // Skeleton: hips, a two-joint spine and head, a jaw for the beard, arms and legs with tips.
  const hips = b.joint("hips", { at: [0, 0.66, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.66, 0], [0, 0.84, 0.01], [0, 1.0, 0]]), {
    parent: hips,
    names: ["waist", "chest"],
    role: "spine",
  });
  const chest = spine.joints[1];
  const head = b.joint("head", { parent: chest, at: [0, 1.08, 0], aim: [0, 1.24, 0.03], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.07, 0.04], aim: [0, 0.98, 0.12], role: "jaw" });
  const armL = b.chain("armL", polyline(ARM_L), {
    parent: chest,
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
  });
  const armR = b.chain("armR", polyline(ARM_R), {
    parent: chest,
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
  });
  const legL = b.chain("legL", polyline(LEG_L), { parent: hips, names: ["hipL", "kneeL", "ankleL"], role: "leg" });
  const legR = b.chain("legR", polyline(LEG_R), { parent: hips, names: ["hipR", "kneeR", "ankleR"], role: "leg" });

  // Body: a barrel chest over the spine, sleeves and trousers on their chains.
  const torso = b.loft(TORSO_ST, { bone: spine, color: TORSO });
  const torsoSurf = b.surface(torso);
  b.sweep(legL, [0.095, 0.072, 0.06], { color: TROUSER });
  b.sweep(legR, [0.095, 0.072, 0.06], { color: TROUSER });
  b.sweep(armL, [0.08, 0.06, 0.05], { color: COAT });
  b.sweep(armR, [0.08, 0.06, 0.05], { color: COAT });

  // Boots, knee pads and leather cuffs at the wrists.
  for (const s of [1, -1]) {
    const ankle = (s > 0 ? legL : legR).tip!;
    b.extrude(BOOT_OUT, { at: [s * 0.13, 0, 0], thickness: 0.12, bevel: 0.012, smoothing: 1, color: BOOT, bone: ankle });
    put(ellipsoid([s * 0.13, 0.36, 0.075], [0.06, 0.055, 0.035], [10, 8]), BRASS, (s > 0 ? legL : legR).joints[1]);
  }
  const cuffAt = (a: V3, w: V3, bone: JointRef) =>
    b.sweep(catmull(ringPoints(lerp3(a, w, 0.8), toArr(V(w).sub(V(a))), 0.062, 12), { closed: true }), 0.013, {
      bone,
      color: LEATHER,
    });
  cuffAt(ARM_L[1], ARM_L[2], armL.joints[1]);
  cuffAt(ARM_R[1], ARM_R[2], armR.joints[1]);
  put(ellipsoid(ARM_L[2], [0.05, 0.054, 0.05], [12, 9]), SKIN, armL.tip!);
  put(ellipsoid(ARM_R[2], [0.05, 0.054, 0.05], [12, 9]), SKIN, armR.tip!);

  // Pauldrons: copper domes with a gilt rim and studs.
  for (const s of [1, -1]) {
    const at: V3 = [s * 0.225, 0.99, 0];
    b.lathe(PAULDRON, { at, bone: chest, smoothing: 1, color: COPPER });
    const rim = catmull(ringPoints(at, [0, 1, 0], 0.12, 14), { closed: true });
    b.sweep(rim, 0.009, { bone: chest, color: GILT });
    b.along(rim, 9, (p) => b.part(new THREE.SphereGeometry(0.009, 6, 4), GILT, { frame: p }));
  }

  // Collar, belt and its gear buckle, the belt studs and a powder horn on the left hip.
  b.sweep(catmull(ringPoints([0, 1.1, 0], [0, 1, 0], 0.118, 14), { closed: true }), 0.011, { bone: chest, color: GILT });
  const belt = torsoSurf.loop([0, 0.74, 0], { dir: [0, 1, 0], lift: 0.012 });
  b.sweep(belt, 0.014, { color: LEATHER });
  b.along(belt, 10, (p) => b.part(new THREE.SphereGeometry(0.008, 6, 4), BRASS, { frame: p }));
  b.part(gearGeometry(BUCKLE), TINT.gilt, {
    bone: chest,
    at: [0, 0.74, 0.158],
    dir: [0, 0, 1],
    texture: BUCKLE_TEX,
  });
  b.sweep(
    catmull([
      [0.19, 0.8, -0.04],
      [0.27, 0.76, -0.09],
      [0.29, 0.66, -0.1],
      [0.26, 0.58, -0.08],
    ]),
    [0.03, 0.036, 0.028, 0.02],
    { bone: hips, color: HORN },
  );
  put(ellipsoid([0.26, 0.58, -0.08], [0.024, 0.024, 0.024], [10, 8]), GILT, hips);
  put(ellipsoid([-0.18, 0.78, 0.1], [0.06, 0.055, 0.04]), LEATHER, hips);

  // Bandolier of brass cartridges draped over the chest, and the clan sigil.
  const strap = torsoSurf.drape(
    catmull([
      [-0.19, 1.02, 0.1],
      [-0.1, 0.95, 0.19],
      [0.02, 0.86, 0.2],
      [0.14, 0.76, 0.17],
    ]),
    { lift: 0.012 },
  );
  b.sweep(strap, () => [0.026, 0.012], { color: LEATHER });
  b.along(strap, 9, (p) =>
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.04, 7), BRASS, { frame: p, dir: [0, 1, 0.45] }),
  );
  b.decal(torso, SIGIL, { at: [0.11, 1.0, 0.14], dir: [0, 0, 1], size: [0.1, 0.1] });

  // Head: a broad skull, a bulbous nose, ears, a squinting eye on each side, a heavy brow and moustache.
  const skull = put(ellipsoid([0, 1.14, 0], [0.15, 0.165, 0.155], [18, 12]), SKIN, head);
  put(ellipsoid([0, 1.068, 0.085], [0.065, 0.05, 0.055]), SKIN, jaw);
  put(ellipsoid([0, 1.112, 0.165], [0.042, 0.05, 0.047]), NOSE, head);
  for (const s of [1, -1]) {
    put(ellipsoid([s * 0.152, 1.13, 0], [0.02, 0.036, 0.026], [8, 6]), SKIN, head);
    b.decal(skull, EYE, { at: [s * 0.058, 1.15, 0.14], dir: [0, 0, 1], size: [0.052, 0.0325], mirror: s < 0 });
    const side: V3[] = [
      [0.15, 1.2, 0],
      [0.16, 1.15, 0.01],
      [0.152, 1.11, 0.02],
    ];
    b.sweep(catmull(s > 0 ? side : side.map(mirror)), [0.016, 0.02, 0.016], { bone: head, color: BEARD });
  }
  b.sweep(
    catmull([
      [-0.105, 1.19, 0.1],
      [-0.05, 1.2, 0.14],
      [0, 1.2, 0.15],
      [0.05, 1.2, 0.14],
      [0.105, 1.19, 0.1],
    ]),
    [0.015, 0.021, 0.024, 0.021, 0.015],
    { bone: head, color: BEARD },
  );
  b.sweep(
    catmull([
      [-0.078, 1.088, 0.15],
      [-0.04, 1.1, 0.18],
      [0, 1.078, 0.19],
      [0.04, 1.1, 0.18],
      [0.078, 1.088, 0.15],
    ]),
    [0.012, 0.02, 0.018, 0.02, 0.012],
    { bone: head, color: BEARD },
  );

  // Helm: a riveted steel dome with a gilt brim, a copper ridge and the cog emblem on its front.
  const helm = b.lathe(HELM, { at: [0, 1.215, 0], bone: head, smoothing: 1, color: STEEL });
  b.decal(helm, EMBLEM, { at: [0, 1.27, 0.17], dir: [0, 0, 1], size: [0.07, 0.07] });
  b.sweep(catmull(ringPoints([0, 1.215, 0], [0, 1, 0], 0.177, 16), { closed: true }), 0.011, {
    bone: head,
    color: GILT,
  });
  b.sweep(
    catmull([
      [0, 1.36, 0.1],
      [0, 1.4, 0],
      [0, 1.36, -0.1],
    ]),
    [0.011, 0.02, 0.011],
    { bone: head, color: COPPER },
  );

  // Braided beard: a loft hangs from the jaw, three strands twist round it, and gilt beads finish the tip.
  const beard = catmull(BEARD_PTS);
  b.loft(
    BEARD_PTS.map((at, i) => ({ at, w: BEARD_W[i], h: BEARD_H[i] })),
    { bone: jaw, color: BEARD },
  );
  const STRANDS = [BEARD_HI, BEARD_LO, BEARD];
  for (let k = 0; k < 3; k++) {
    const pts: V3[] = [];
    for (let i = 0; i <= 44; i++) {
      const t = 0.04 + (0.9 * i) / 44;
      const c = beard.at(t).clone();
      const tan = beard.tangentAt(t).normalize();
      const e2 = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(1, 0, 0)).normalize();
      const th = (2 * Math.PI * 2.5 * i) / 44 + (k * 2 * Math.PI) / 3;
      const squeeze = 1 - 0.55 * Math.pow(i / 44, 1.5);
      c.addScaledVector(new THREE.Vector3(1, 0, 0), 0.095 * squeeze * Math.cos(th));
      c.addScaledVector(e2, 0.072 * squeeze * Math.sin(th));
      pts.push(toArr(c));
    }
    b.sweep(catmull(pts), 0.019, { bone: jaw, color: STRANDS[k] });
  }
  b.part(new THREE.TorusGeometry(0.05, 0.007, 6, 12), GILT, {
    bone: jaw,
    at: beard.at(0.92),
    dir: beard.tangentAt(0.92),
    axis: "z",
  });
  b.part(new THREE.SphereGeometry(0.022, 8, 6), GILT, { bone: jaw, at: beard.at(0.99) });

  // Blunderbuss, held in the right hand on the stock and the left hand on the barrel. Rigid to the chest.
  const gunDir = V(MUZZLE).sub(V(STOCK_FRONT)).normalize();
  const stockDir = V(STOCK_FRONT).sub(V(STOCK_BUTT)).normalize();
  b.frustumBox(STOCK_BUTT, STOCK_FRONT, [0.075, 0.09], [0.05, 0.055], { bone: chest, color: WOOD });
  b.part(new THREE.BoxGeometry(0.085, 0.1, 0.014), IRON, {
    bone: chest,
    at: V(STOCK_BUTT).addScaledVector(stockDir, -0.006),
    dir: stockDir,
    axis: "z",
  });
  b.sweep(polyline([STOCK_FRONT, MUZZLE]), (t) => 0.02 + 0.03 * Math.pow(Math.max(0, (t - 0.7) / 0.3), 2), {
    bone: chest,
    color: BLUED,
    caps: { start: "round", end: "flat" },
  });
  for (const t of [0.2, 0.55]) {
    b.part(new THREE.TorusGeometry(0.026, 0.0065, 6, 12), GILT, {
      bone: chest,
      at: lerp3(STOCK_FRONT, MUZZLE, t),
      dir: gunDir,
      axis: "z",
    });
  }
  b.part(new THREE.CircleGeometry(0.044, 12), INK, {
    bone: chest,
    at: V(MUZZLE).addScaledVector(gunDir, 0.003),
    dir: gunDir,
    axis: "z",
  });
  b.part(new THREE.BoxGeometry(0.014, 0.075, 0.07), "#ffffff", {
    bone: chest,
    at: LOCK_AT,
    dir: gunDir,
    axis: "z",
    texture: LOCK,
  });
  b.sweep(
    polyline([
      [-0.13, 0.93, 0.38],
      [0, 0.96, 0.68],
    ]),
    0.0065,
    { bone: chest, color: IRON },
  );

  return b.root;
}
```