import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { limb } from "../../../../src/ik";
import type { PointInput } from "../../../../src/math";
import { bezier, catmull, polyline, spiral } from "../../../../src/path";
import { countershade, grain, mottle, paint, stripes } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A whimsical low-poly gnome inventor with a huge white beard, goggles on a droopy red hat and a backpack crammed with gears, a spinning rotor, a pressure gauge, a copper tank, a telescope and a steam chimney.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

// Palette
const SKIN = "#f0b48c";
const SKIN_D = "#dd9570";
const NOSE = "#e8806a";
const BLUSH = "#ee8a82";
const WHITE = "#f7f3e8";
const BEARD = "#e4e0d6";
const BEARD_D = "#bdb8ae";
const HAT = "#d9432f";
const HAT_2 = "#e45c3b";
const HAT_D = "#a62c26";
const TUNIC = "#4f9a45";
const TUNIC_2 = "#5fae4e";
const TUNIC_D = "#357535";
const APRON = "#9a6a3c";
const APRON_D = "#704527";
const LEATHER = "#8a5632";
const LEATHER_D = "#5e3a22";
const STRAP = "#47291a";
const BRASS = "#e0aa44";
const BRASS_D = "#a8742a";
const COPPER = "#c8693a";
const STEEL = "#97a4af";
const STEEL_D = "#5d6873";
const BOOT = "#5e3d2b";
const BOOT_D = "#3a2418";
const SOLE = "#2b1d16";
const PANTS = "#4d68b0";
const PANTS_2 = "#5b78c2";
const PANTS_D = "#364c85";
const PATCH = "#d6b574";
const GLASS = "#62e6d8";
const LAMP = "#ffcf5a";
const BLACK = "#2a2420";
const CREAM = "#f3e3b8";
const SCARF = "#f2b632";
const SCARF_2 = "#e8582f";
const POM = "#f6d44a";
const BLUE = "#4f7fd0";
const BLADE_A = "#f2c744";
const BLADE_B = "#e8582f";
const IRIS = "#4a9bd8";

const gearOutline = (n: number, rIn: number, rOut: number): OutlinePoint[] => {
  const pts: OutlinePoint[] = [];
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a0 = i * step;
    for (const [f, r] of [
      [0, rIn],
      [0.18, rOut],
      [0.5, rOut],
      [0.68, rIn],
    ] as const) {
      const a = a0 + f * step;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }
  return pts;
};

const gaugeSvg = (() => {
  const cx = 32;
  const cy = 32;
  const pt = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(cx + Math.cos(a) * r).toFixed(2)} ${(cy - Math.sin(a) * r).toFixed(2)}`;
  };
  let ticks = "";
  for (let i = 0; i <= 8; i++) {
    const deg = 210 - i * 30;
    ticks += `<line x1="${pt(deg, 22).split(" ")[0]}" y1="${pt(deg, 22).split(" ")[1]}" x2="${pt(deg, 27).split(" ")[0]}" y2="${pt(deg, 27).split(" ")[1]}" stroke="#2a2420" stroke-width="2.4"/>`;
  }
  const [nx, ny] = pt(55, 20).split(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#f3e3b8" stroke="#2a2420" stroke-width="3"/><path d="M ${pt(-10, 24)} A 24 24 0 0 1 ${pt(-30, 24)}" fill="none" stroke="#d9432f" stroke-width="4"/><path d="M ${pt(150, 24)} A 24 24 0 0 1 ${pt(100, 24)}" fill="none" stroke="#4f9a45" stroke-width="4"/>${ticks}<line x1="32" y1="32" x2="${nx}" y2="${ny}" stroke="#c62b2b" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#2a2420"/></svg>`;
})();

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });
  const gauge = svg(gaugeSvg, { size: 192 });

  // ---- helpers ----
  const box = (w: number, h: number, d: number, color: Fill, at: PointInput, bone: Joint, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, flat: true, ...o });
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    color: Fill,
    at: PointInput,
    bone: Joint,
    o: PartOptions = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, bone, flat: true, ...o });
  const sph = (r: number, color: Fill, at: PointInput, bone: Joint, sc?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), color, { at, bone, flat: true, ...(sc ? { scale: sc } : {}) });
  const tor = (R: number, r: number, color: Fill, at: PointInput, bone: Joint, rot: number[], seg = 10) =>
    b.part(new THREE.TorusGeometry(R, r, 5, seg), color, { at, bone, flat: true, rotation: rot });

  // ---- paints ----
  const skinPaint = countershade(mottle(SKIN, SKIN_D, { size: 0.05, contrast: 0.6 }), SKIN_D, { level: -0.5 });
  const tunicPaint = countershade(mottle(TUNIC, TUNIC_2, { size: 0.08 }), TUNIC_D, { level: -0.3 });
  const pantsPaint = countershade(mottle(PANTS, PANTS_2, { size: 0.07 }), PANTS_D, { level: -0.3 });
  const leatherPaint = grain(LEATHER, LEATHER_D, { size: 0.015, seed: 3 });
  const apronPaint = grain(APRON, APRON_D, { size: 0.014, seed: 5 });
  const beardPaint = grain(BEARD, BEARD_D, { size: 0.012, seed: 9 });
  const hatBase = countershade(mottle(HAT, HAT_2, { size: 0.07 }), HAT_D, { level: -0.2 });
  const hatPaint = paint((_p, _n, s) => (((s[1] + s[0] * 1000) % 90) + 90) % 90 < 18 ? HAT_D : hatBase);
  const bedPaint = stripes(BLUE, CREAM, { size: 0.06, axis: "x", width: 0.4, wobble: 0.1 });
  const scarfPaint = stripes(SCARF, SCARF_2, { size: 0.05, axis: "y", width: 0.4, wobble: 0.1 });
  const gearPaint = (cy: number, cz: number, rIn: number) =>
    paint((p) => {
      const d = Math.hypot(p.y - cy, p.z - cz);
      return d < rIn * 0.35 ? BRASS_D : d < rIn * 0.58 ? BRASS : d < rIn * 0.85 ? BRASS_D : BRASS;
    });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.42, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, 0],
      [0, 0.56, 0.01],
      [0, 0.7, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chestJ = spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: chestJ, at: [0, 0.72, 0.025], aim: [0, 0.82, 0.05], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.8, 0.04], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.88, 0.06], aim: [0, 0.84, 0.17], role: "jaw" });
  const pack = b.joint("pack", { parent: chestJ, at: [0, 0.56, -0.2], dir: [0, 1, 0] });
  const rotor = b.joint("rotor", { parent: pack, at: [0, 1.0, -0.34], dir: [0, 1, 0], role: "hinge" });
  const gearBig = b.joint("gearBig", { parent: pack, at: [0.2, 0.56, -0.26], dir: [1, 0, 0], role: "hinge" });
  const gearSmall = b.joint("gearSmall", { parent: pack, at: [0.2, 0.68, -0.36], dir: [1, 0, 0], role: "hinge" });

  // ---- torso ----
  const torso = b.sweep(spine, [0.13, 0.17, 0.155, 0.115], { color: tunicPaint, caps: { start: "flat", end: "round" } });
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.195, 0.02],
      [0.16, 0.12],
      [0.15, 0.14],
      [0, 0.14],
    ],
    {
      at: [0, 0.33, 0],
      bone: hips,
      segments: 10,
      color: paint((p, _n) => (p.y < 0.355 ? TUNIC_D : tunicPaint)),
    },
  );
  tor(0.152, 0.017, STRAP, [0, 0.47, 0], hips, [90, 0, 0], 12);
  box(0.06, 0.05, 0.02, BRASS, [0, 0.47, 0.162], hips);
  box(0.03, 0.025, 0.022, BRASS_D, [0, 0.47, 0.163], hips);
  for (const s of [1, -1]) {
    box(0.07, 0.08, 0.06, LEATHER_D, [s * 0.13, 0.43, 0.1], hips);
    box(0.075, 0.025, 0.065, LEATHER, [s * 0.13, 0.475, 0.1], hips);
    sph(0.01, BRASS, [s * 0.13, 0.46, 0.133], hips);
  }

  // apron
  const apron = b.extrude(
    [
      [-0.11, 0],
      [0.11, 0],
      [0.12, 0.1],
      [0.095, 0.22],
      [0.07, 0.24],
      [-0.07, 0.24],
      [-0.095, 0.22],
      [-0.12, 0.1],
    ],
    { at: [0, 0.43, 0.15], x: [1, 0, 0], thickness: 0.04, bevel: 0.006, color: apronPaint, bone: chestJ },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.07, 0.665, 0.165], [s * 0.06, 0.77, 0.09], 0.011, STRAP, { bone: chestJ });
    box(0.075, 0.065, 0.02, APRON_D, [s * 0.052, 0.5, 0.175], chestJ);
    box(0.075, 0.012, 0.022, LEATHER_D, [s * 0.052, 0.528, 0.176], chestJ);
  }
  // tools in apron pockets
  b.rod([0.052, 0.51, 0.18], [0.058, 0.6, 0.18], 0.007, STEEL, { bone: chestJ });
  b.rod([0.052, 0.51, 0.18], [0.054, 0.545, 0.18], 0.012, BLADE_B, { bone: chestJ });
  b.rod([-0.045, 0.51, 0.18], [-0.05, 0.6, 0.18], 0.006, BRASS, { bone: chestJ });
  b.rod([-0.065, 0.51, 0.18], [-0.08, 0.58, 0.18], 0.006, STEEL_D, { bone: chestJ });
  b.rod([-0.065, 0.51, 0.18], [-0.052, 0.58, 0.18], 0.006, STEEL_D, { bone: chestJ });
  sph(0.012, BRASS, [0, 0.64, 0.175], chestJ);
  sph(0.012, BRASS, [0, 0.6, 0.175], chestJ);
  sph(0.012, BRASS, [0, 0.56, 0.175], chestJ);

  // scarf
  tor(0.105, 0.04, scarfPaint, [0, 0.775, 0.035], neck, [90, 0, 0], 9);
  b.sweep(
    catmull([
      [0.13, 0.76, 0.08],
      [0.17, 0.68, 0.1],
      [0.16, 0.58, 0.1],
    ]),
    [0.032, 0.026],
    { color: scarfPaint, bone: chestJ, sides: 6, caps: { start: "round", end: "flat" } },
  );
  b.spike([0.16, 0.58, 0.1], [0, -1, 0], 0.06, 0.022, SCARF_2, { bone: chestJ, sides: 6 });
  for (const k of [-1, 0, 1]) b.spike([0.16 + k * 0.012, 0.545, 0.1], [k * 0.2, -1, 0], 0.045, 0.006, SCARF_2, { bone: chestJ, sides: 5 });

  // ---- head ----
  const skull = b.part(new THREE.SphereGeometry(0.13, 10, 8), skinPaint, {
    at: [0, 0.93, 0.05],
    bone: head,
    scale: [1, 0.95, 1.02],
    flat: true,
  });
  sph(0.045, NOSE, [0, 0.9, 0.2], head, [1, 0.9, 1.1]);
  sph(0.012, BLUSH, [0.012, 0.912, 0.241], head);
  sph(0.05, SKIN_D, [0, 0.84, 0.11], jaw, [1, 0.8, 1]);
  for (const s of [1, -1]) {
    // eyes
    sph(0.032, WHITE, [s * 0.055, 0.935, 0.16], head);
    sph(0.02, IRIS, [s * 0.055, 0.935, 0.178], head);
    sph(0.011, BLACK, [s * 0.055, 0.935, 0.19], head);
    sph(0.006, WHITE, [s * 0.055 + 0.007, 0.943, 0.196], head);
    b.capsule([s * 0.025, 0.978, 0.185], [s * 0.09, 0.986, 0.16], 0.014, WHITE, { bone: head, sides: 5 });
    b.capsule([s * 0.075, 0.984, 0.17], [s * 0.1, 0.99, 0.14], 0.011, BEARD, { bone: head, sides: 5 });
    sph(0.032, BLUSH, [s * 0.09, 0.89, 0.125], head, [1, 0.8, 0.6]);
    // ears
    b.spike([s * 0.12, 0.94, 0.04], [s, 0.25, -0.3], 0.17, 0.045, SKIN, { bone: head, sides: 6 });
    b.spike([s * 0.126, 0.935, 0.055], [s, 0.25, -0.3], 0.12, 0.028, NOSE, { bone: head, sides: 6 });
    // sideburn tufts
    for (const k of [-1, 0, 1])
      b.spike([s * 0.11, 0.975, 0.05 + k * 0.04], [s, -0.2, k * 0.3], 0.075, 0.022, BEARD, { bone: head, sides: 5 });
    // moustache
    b.sweep(
      catmull([
        [0, 0.868, 0.195],
        [s * 0.05, 0.858, 0.195],
        [s * 0.1, 0.875, 0.17],
        [s * 0.125, 0.9, 0.14],
      ]),
      [0.03, 0.012],
      { color: beardPaint, bone: head, sides: 6, caps: { start: "round", end: "point" } },
    );
  }

  // beard
  const beardPts: OutlinePoint[] = [
    [-0.1, 0],
    [-0.115, -0.05],
    [-0.1, -0.11],
    [-0.07, -0.17],
    [-0.035, -0.22],
    [0, -0.265, "sharp"],
    [0.035, -0.22],
    [0.07, -0.17],
    [0.1, -0.11],
    [0.115, -0.05],
    [0.1, 0],
  ];
  b.extrude(beardPts, {
    at: [0, 0.865, 0.15],
    x: [1, 0, 0],
    thickness: 0.1,
    bevel: 0.02,
    color: beardPaint,
    bone: jaw,
  });
  for (const k of [-2, -1, 0, 1, 2])
    b.spike([k * 0.04, 0.76 - Math.abs(k) * 0.03, 0.205], [k * 0.05, -1, 0.15], 0.1 - Math.abs(k) * 0.015, 0.02, BEARD, {
      bone: jaw,
      sides: 5,
    });
  tor(0.02, 0.006, BRASS, [0, 0.66, 0.2], jaw, [90, 0, 0], 8);

  // ---- hat ----
  const hat = b.lathe(
    [
      [0, 0],
      [0.18, 0],
      [0.185, 0.018],
      [0.13, 0.035],
      [0.118, 0.08],
      [0.095, 0.16],
      [0.068, 0.23],
      [0.04, 0.29],
      [0, 0.32],
    ],
    { at: [0, 1.0, 0.03], bone: head, segments: 8, color: hatPaint },
  );
  b.sweep(bezier([0, 1.29, 0.03], [0, 1.39, 0.0], [0, 1.39, -0.1], [0, 1.31, -0.14]), [0.04, 0.008], {
    bone: head,
    color: hatPaint,
    sides: 6,
    caps: { start: "flat", end: "point" },
  });
  sph(0.035, POM, [0, 1.3, -0.145], head);
  // goggles
  tor(0.123, 0.011, STRAP, [0, 1.065, 0.03], head, [90, 0, 0], 12);
  for (const s of [1, -1]) {
    tor(0.044, 0.009, BRASS, [s * 0.057, 1.07, 0.157], head, [-8, 0, 0], 8);
    glow(
      b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.02, 8), GLASS, {
        at: [s * 0.057, 1.07, 0.152],
        bone: head,
        rotation: [82, 0, 0],
        flat: true,
      }),
      1.2,
    );
    sph(0.01, BRASS_D, [s * 0.1, 1.05, 0.125], head);
  }
  box(0.04, 0.012, 0.012, BRASS, [0, 1.07, 0.16], head);
  b.extrude(gearOutline(8, 0.02, 0.03), {
    at: [0, 1.17, 0.113],
    x: [1, 0, 0],
    thickness: 0.02,
    color: BRASS,
    bone: head,
  });
  sph(0.012, BRASS_D, [0, 1.17, 0.125], head);
  box(0.03, 0.02, 0.012, BRASS, [0, 1.065, -0.098], head);

  // ---- legs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.08, 0.42, 0], [s * 0.09, 0.065, 0], [0.2, 0.2], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.09, 0, 0.05],
    });
    b.sweep(leg, [0.072, 0.055], { color: pantsPaint });
    const ankle = leg.joints[2];
    const knee = leg.joints[1];
    box(0.07, 0.07, 0.02, PATCH, [pts[1].x, pts[1].y, pts[1].z + 0.062], knee);
    box(0.075, 0.012, 0.022, BRASS_D, [pts[1].x, pts[1].y + 0.04, pts[1].z + 0.062], knee);
    // boots
    sph(1, BOOT, [s * 0.09, 0.06, 0.05], ankle, [0.075, 0.06, 0.135]);
    cyl(0.068, 0.072, 0.1, 8, BOOT, [s * 0.09, 0.13, 0], ankle);
    cyl(0.078, 0.078, 0.025, 8, BOOT_D, [s * 0.09, 0.185, 0], ankle);
    box(0.15, 0.02, 0.27, SOLE, [s * 0.09, 0.01, 0.05], ankle);
    sph(0.05, BOOT_D, [s * 0.09, 0.05, 0.15], ankle, [1.1, 0.8, 0.9]);
    box(0.04, 0.03, 0.012, BRASS, [s * 0.09, 0.15, 0.074], ankle);
  }

  // ---- arms ----
  const arms: Record<string, { hand: THREE.Vector3; wrist: Joint }> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.19, 0.66, 0], [s * 0.4, 0.5, 0.12], [0.19, 0.17], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chestJ,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.06, 0.05], { color: tunicPaint });
    const wrist = arm.joints[2];
    const d = pts[2].clone().sub(pts[1]).normalize();
    const hand = pts[2].clone().addScaledVector(d, 0.05);
    cyl(0.056, 0.056, 0.04, 8, LEATHER_D, pts[2], wrist, { dir: d });
    b.part(new THREE.SphereGeometry(0.058, 7, 5), skinPaint, { at: hand, bone: wrist, flat: true });
    for (const k of [-1, 0, 1]) {
      const a = hand.clone().add(new THREE.Vector3(0, 0, k * 0.022));
      const c = a.clone().addScaledVector(d, 0.05).add(new THREE.Vector3(0, -0.02, 0.012));
      b.capsule(a, c, 0.014, SKIN, { bone: wrist, sides: 5 });
    }
    b.capsule(hand, hand.clone().add(new THREE.Vector3(-s * 0.035, 0.0, 0.05)), 0.015, SKIN, { bone: wrist, sides: 5 });
    sph(0.075, LEATHER, [s * 0.19, 0.68, 0], chestJ, [1, 0.8, 1]);
    sph(0.014, BRASS, [s * 0.19, 0.725, 0], chestJ);
    arms[S] = { hand, wrist };
  }
  // left hand: hanging lantern
  {
    const { hand, wrist } = arms.L;
    const x = hand.x;
    const z = hand.z;
    const y = hand.y;
    tor(0.018, 0.004, BRASS, [x, y - 0.045, z], wrist, [0, 90, 0], 6);
    b.rod([x, y - 0.05, z], [x, y - 0.15, z], 0.004, BRASS, { bone: wrist, sides: 4 });
    cyl(0.01, 0.045, 0.03, 6, BRASS, [x, y - 0.165, z], wrist);
    glow(b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.09, 6), LAMP, { at: [x, y - 0.225, z], bone: wrist, flat: true }), 1.4);
    cyl(0.046, 0.046, 0.015, 6, BRASS, [x, y - 0.28, z], wrist);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.rod([x + Math.cos(a) * 0.046, y - 0.272, z + Math.sin(a) * 0.046], [x + Math.cos(a) * 0.046, y - 0.18, z + Math.sin(a) * 0.046], 0.0035, BRASS_D, { bone: wrist, sides: 4 });
    }
  }
  // right hand: big wrench
  {
    const { hand, wrist } = arms.R;
    b.rod([hand.x, hand.y - 0.08, hand.z], [hand.x, hand.y + 0.26, hand.z], 0.014, STEEL, { bone: wrist, sides: 6 });
    b.rod([hand.x, hand.y - 0.08, hand.z], [hand.x, hand.y + 0.03, hand.z], 0.019, BLADE_B, { bone: wrist, sides: 6 });
    b.extrude(
      [
        [-0.04, -0.01],
        [0.04, -0.01],
        [0.05, 0.06],
        [0.03, 0.09],
        [0.015, 0.09],
        [0.015, 0.045],
        [-0.015, 0.045],
        [-0.015, 0.09],
        [-0.03, 0.09],
        [-0.05, 0.06],
      ],
      { at: [hand.x, hand.y + 0.26, hand.z], x: [1, 0, 0], thickness: 0.025, bevel: 0.004, color: STEEL, bone: wrist },
    );
  }

  // ---- backpack ----
  box(0.34, 0.4, 0.22, leatherPaint, [0, 0.55, -0.26], pack);
  box(0.36, 0.13, 0.24, LEATHER_D, [0, 0.79, -0.26], pack);
  for (const s of [1, -1]) {
    box(0.045, 0.32, 0.01, STRAP, [s * 0.125, 0.54, -0.375], pack);
    box(0.04, 0.012, 0.25, STRAP, [s * 0.1, 0.858, -0.26], pack);
    box(0.04, 0.13, 0.012, STRAP, [s * 0.1, 0.79, -0.386], pack);
    box(0.05, 0.04, 0.016, BRASS, [s * 0.125, 0.72, -0.382], pack);
    box(0.02, 0.02, 0.018, BRASS_D, [s * 0.125, 0.72, -0.384], pack);
    tor(0.07, 0.008, STRAP, [s * 0.1, 0.33, -0.3], pack, [0, 90, 0], 8);
  }
  // right pocket + canteen
  box(0.07, 0.2, 0.18, LEATHER, [-0.21, 0.46, -0.26], pack);
  box(0.075, 0.03, 0.19, LEATHER_D, [-0.21, 0.56, -0.26], pack);
  cyl(0.08, 0.08, 0.05, 9, STEEL, [-0.205, 0.66, -0.26], pack, { rotation: [0, 0, 90] });
  cyl(0.025, 0.025, 0.03, 6, BRASS, [-0.24, 0.66, -0.26], pack, { rotation: [0, 0, 90] });
  tor(0.082, 0.006, STRAP, [-0.205, 0.66, -0.26], pack, [0, 90, 0], 10);
  // bedroll
  cyl(0.07, 0.07, 0.4, 8, bedPaint, [0, 0.33, -0.3], pack, { rotation: [0, 0, 90] });
  // telescope
  cyl(0.035, 0.035, 0.16, 8, BRASS, [-0.1, 0.89, -0.22], pack, { rotation: [0, 0, 90] });
  cyl(0.028, 0.028, 0.14, 8, BRASS_D, [0.05, 0.89, -0.22], pack, { rotation: [0, 0, 90] });
  cyl(0.022, 0.022, 0.1, 8, BRASS, [0.17, 0.89, -0.22], pack, { rotation: [0, 0, 90] });
  glow(b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.006, 8), GLASS, { at: [0.222, 0.89, -0.22], bone: pack, rotation: [0, 0, 90], flat: true }), 1);
  tor(0.036, 0.006, STEEL, [-0.18, 0.89, -0.22], pack, [0, 90, 0], 8);
  tor(0.03, 0.005, STEEL, [-0.01, 0.89, -0.22], pack, [0, 90, 0], 8);
  // antenna with spring
  b.rod([0.12, 0.855, -0.34], [0.12, 0.93, -0.34], 0.008, STEEL, { bone: pack, sides: 5 });
  b.sweep(spiral([0.12, 0.87, -0.34], [0.145, 0.87, -0.34], [0, 1, 0], { turns: 4, r1: 0.025, pitch: 0.014 }), 0.004, COPPER, { bone: pack, sides: 4, caps: "flat" });
  glow(sph(0.022, SCARF_2, [0.12, 0.95, -0.34], pack), 1.2);
  // rotor
  cyl(0.012, 0.012, 0.145, 6, STEEL, [0, 0.9275, -0.34], pack);
  cyl(0.03, 0.03, 0.03, 8, BRASS, [0, 1.0, -0.34], rotor);
  cyl(0.012, 0.016, 0.02, 6, BRASS_D, [0, 1.025, -0.34], rotor);
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 * Math.PI) / 180;
    box(0.17, 0.008, 0.05, i === 1 ? BLADE_B : BLADE_A, [0.095 * Math.cos(a), 1.008, -0.34 + 0.095 * Math.sin(a)], rotor, {
      rotation: [0, -i * 120, 0],
    });
  }
  // gears
  b.extrude(gearOutline(10, 0.088, 0.112), {
    at: [0.2, 0.56, -0.26],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.004,
    color: gearPaint(0.56, -0.26, 0.088),
    bone: gearBig,
  });
  cyl(0.03, 0.03, 0.045, 8, BRASS_D, [0.2, 0.56, -0.26], gearBig, { rotation: [0, 0, 90] });
  cyl(0.012, 0.012, 0.055, 6, STEEL, [0.2, 0.56, -0.26], gearBig, { rotation: [0, 0, 90] });
  b.extrude(gearOutline(7, 0.04, 0.06), {
    at: [0.2, 0.68, -0.36],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.003,
    color: gearPaint(0.68, -0.36, 0.04),
    bone: gearSmall,
  });
  cyl(0.015, 0.015, 0.045, 6, BRASS_D, [0.2, 0.68, -0.36], gearSmall, { rotation: [0, 0, 90] });
  // gauge, tank, pipes
  tor(0.058, 0.01, BRASS, [0, 0.62, -0.378], pack, [0, 0, 0], 10);
  b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
    at: [0, 0.62, -0.376],
    dir: [0, 0, -1],
    axis: "z",
    texture: gauge,
  });
  cyl(0.05, 0.05, 0.16, 8, COPPER, [0, 0.44, -0.42], pack, { rotation: [0, 0, 90] });
  for (const s of [1, -1]) {
    cyl(0.054, 0.054, 0.02, 8, BRASS, [s * 0.07, 0.44, -0.42], pack, { rotation: [0, 0, 90] });
    box(0.03, 0.1, 0.05, STRAP, [s * 0.04, 0.44, -0.395], pack);
  }
  b.rod([0, 0.49, -0.42], [0, 0.565, -0.385], 0.011, COPPER, { bone: pack, sides: 6 });
  tor(0.02, 0.006, BLADE_B, [0, 0.495, -0.472], pack, [0, 0, 0], 6);
  b.sweep(
    polyline([
      [-0.085, 0.44, -0.42],
      [-0.15, 0.44, -0.42],
      [-0.15, 0.8, -0.4],
      [-0.12, 0.865, -0.34],
    ]),
    0.011,
    COPPER,
    { bone: pack, sides: 6 },
  );
  cyl(0.025, 0.03, 0.1, 7, STEEL_D, [-0.12, 0.89, -0.34], pack);
  cyl(0.032, 0.032, 0.015, 7, BRASS, [-0.12, 0.945, -0.34], pack);
  sph(0.03, WHITE, [-0.12, 0.99, -0.34], pack);
  sph(0.04, WHITE, [-0.105, 1.045, -0.33], pack);
  sph(0.034, WHITE, [-0.135, 1.1, -0.34], pack);
  // shoulder straps
  const skin = b.surface(torso);
  for (const s of [1, -1]) {
    const path = catmull([
      [s * 0.095, 0.56, -0.15],
      [s * 0.1, 0.7, -0.1],
      [s * 0.095, 0.77, 0.0],
      [s * 0.095, 0.7, 0.12],
      [s * 0.09, 0.56, 0.15],
    ]);
    b.sweep(skin.drape(path, { lift: 0.012 }), () => [0.028, 0.009], {
      section: "box",
      caps: "none",
      color: STRAP,
      bone: chestJ,
    });
  }

  // keep references used for typecheck cleanliness
  void skull;
  void hat;
  void apron;
  return b.root;
}
