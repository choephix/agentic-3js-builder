import * as THREE from "three";
import { createBuilder, catmull, limb, mottle } from "../../../../src/index";

export const meta = {
  name: "Red-eyed tree frog on a leaf",
  description:
    "A startled red-eyed tree frog clinging to a leaf: lime skin, blue and cream flanks, ruby eyes with slit pupils, orange toes with round sticky pads and a cream belly.",
};

const LIME = "#78dd2c";
const LIME2 = "#58c121";
const CREAM = "#f6efd2";
const BLUE = "#3567d6";
const ORANGE = "#ff7a14";
const PAD = "#ff9a2e";
const RUBY = "#d4122a";
const BLACK = "#0a0a0a";
const LEAF = "#2f8f2a";
const LEAF2 = "#3fa836";
const VEIN = "#9ad870";

export default function build() {
  const b = createBuilder({ name: "treefrog" });
  const skin = mottle(LIME, LIME2, { size: 0.012, contrast: 0.6, seed: 3 });
  const leafPaint = mottle(LEAF, LEAF2, { size: 0.05, contrast: 0.5, seed: 9 });

  // ---------- skeleton ----------
  const pelvis = b.joint("pelvis", { at: [0, 0.03, -0.03], dir: [0, 0.1, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.03, -0.03],
      [0, 0.032, -0.005],
      [0, 0.038, 0.02],
      [0, 0.042, 0.04],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.042, 0.04], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.036, 0.042], aim: [0, 0.034, 0.075], role: "jaw" });

  // ---------- leaf ----------
  const leaf = b.extrude(
    [
      [0, -0.13],
      [0.06, -0.09],
      [0.09, -0.01],
      [0.07, 0.07],
      [0, 0.15, "sharp"],
      [-0.07, 0.07],
      [-0.09, -0.01],
      [-0.06, -0.09],
    ],
    { at: [0, 0.006, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, bevel: 0.002, smoothing: 2, color: leafPaint, bone: pelvis },
  );
  void leaf;
  b.rod([0, 0.0126, -0.13], [0, 0.0126, 0.145], 0.0018, { color: VEIN, sides: 4, bone: pelvis });
  for (const s of [1, -1]) {
    for (let k = 0; k < 6; k++) {
      const z = -0.1 + k * 0.04;
      const reach = 0.06 * (1 - Math.abs(z - 0.0) / 0.2);
      b.rod([0, 0.0126, z], [s * Math.max(0.02, reach), 0.0126, z + 0.04], 0.0011, { color: VEIN, sides: 4, bone: pelvis });
    }
  }
  b.rod([0, 0.006, -0.12], [0, 0.012, -0.2], 0.004, { color: "#5a8f3a", sides: 6, bone: pelvis });
  b.part(new THREE.SphereGeometry(0.007, 8, 6), "#bfe6ff", { at: [0.05, 0.013, 0.07], scale: [1, 0.55, 1], bone: pelvis });

  // ---------- body ----------
  b.sweep(
    spine,
    (t) => {
      const r = 0.02 + 0.008 * Math.sin(Math.PI * Math.min(1, t * 1.1));
      return [r * 1.15, 0.019 * (0.9 + 0.15 * Math.sin(Math.PI * t))];
    },
    {
      color: skin,
      sides: 12,
      shift: [0, -0.002],
      sectors: [
        [112, 248, CREAM],
        [72, 112, BLUE, 0.05, 0.8],
        [60, 72, CREAM, 0.05, 0.8],
        [248, 288, BLUE, 0.05, 0.8],
        [288, 300, CREAM, 0.05, 0.8],
      ],
    },
  );

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.02, 12, 8), skin, { at: [0, 0.046, 0.052], scale: [1.25, 0.7, 1.15], bone: head });
  b.part(new THREE.SphereGeometry(0.017, 10, 6), CREAM, { at: [0, 0.036, 0.058], scale: [1.1, 0.4, 1.1], bone: jaw });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0016, 5, 4), BLACK, { at: [s * 0.006, 0.0485, 0.0738], bone: head });
    const e = new THREE.Vector3(s * 0.021, 0.059, 0.05);
    b.part(new THREE.SphereGeometry(0.016, 12, 8), RUBY, { at: e, bone: head });
    const d = new THREE.Vector3(s * 0.35, 0.15, 0.9).normalize();
    b.part(new THREE.SphereGeometry(0.009, 8, 8), BLACK, {
      at: e.clone().addScaledVector(d, 0.0145),
      dir: d,
      axis: "z",
      scale: [0.2, 1, 0.25],
      bone: head,
    });
    const h = new THREE.Vector3(s * 0.2, 0.7, 0.6).normalize();
    b.part(new THREE.SphereGeometry(0.0028, 6, 4), "#ffffff", { at: e.clone().addScaledVector(h, 0.0155), bone: head });
    b.part(new THREE.SphereGeometry(0.0168, 10, 6, 0, Math.PI * 2, 0, 1.1), LIME, { at: e, bone: head });
  }

  // ---------- toes ----------
  function toes(parent: any, base: THREE.Vector3, n: number, spread: number, off: number, len: number, s: number, tag: string, padR: number, tr: number) {
    for (let i = 0; i < n; i++) {
      const a = -spread + (2 * spread * i) / (n - 1);
      const dx = Math.sin(a) + s * off;
      const dz = Math.cos(a);
      const l = Math.hypot(dx, dz);
      const p0: [number, number, number] = [base.x, base.y, base.z];
      const p1: [number, number, number] = [base.x + (dx / l) * len, 0.0155, base.z + (dz / l) * len];
      const toe = b.chain(`toe${tag}${i}`, [p0, p1], { parent, role: "digit" });
      b.sweep(toe, [tr, tr * 0.75], { color: ORANGE, sides: 6 });
      b.part(new THREE.SphereGeometry(padR, 8, 6), PAD, { at: p1, scale: [1, 0.65, 1], bone: toe.joints[0] });
    }
  }

  // ---------- limbs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ap = limb([s * 0.022, 0.032, 0.02], [s * 0.032, 0.0158, 0.042], [0.024, 0.024], [[s * 0.7, 0.3, -1]]);
    const arm = b.chain(`arm${S}`, ap, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.0085, 0.0065, 0.0045], { color: skin, sides: 8 });
    toes(arm.tip!, ap[2], 4, 0.6, 0.3, 0.017, s, `F${S}`, 0.0048, 0.0028);

    const hp = limb([s * 0.024, 0.03, -0.03], [s * 0.046, 0.0165, -0.064], [0.036, 0.038], [[s * 0.6, 0.5, 1]]);
    const leg = b.chain(`leg${S}`, hp, {
      parent: pelvis,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.046, 0.012, -0.064],
    });
    b.sweep(leg, [0.012, 0.008, 0.005], { color: skin, sides: 8 });
    toes(leg.tip!, hp[2], 5, 0.8, 0.3, 0.03, s, `H${S}`, 0.005, 0.003);
  }

  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });
  return b.root;
}
