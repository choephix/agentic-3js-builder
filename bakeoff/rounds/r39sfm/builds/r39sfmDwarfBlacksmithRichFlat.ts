import * as THREE from "three";
import { createBuilder, bezier, catmull, polyline, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description:
    "Warcraft-style stout dwarf smith with a horned helm, braided ginger beard, pauldrons and leather apron, raising a warhammer over an anvil on a stump with a glowing ingot held in tongs.",
};

const SKIN = "#d79a76";
const SKIN_D = "#b97858";
const BLUSH = "#e0836a";
const HAIR = "#c8571d";
const HAIR_D = "#8e3a12";
const HAIR_L = "#f08a2a";
const TUNIC = "#2f4f86";
const TUNIC_D = "#223a66";
const LEATHER = "#6b4226";
const LEATHER_D = "#45291a";
const GOLD = "#e2b13c";
const GOLD_D = "#a97a1e";
const STEEL = "#7d8796";
const STEEL_D = "#4b5361";
const STEEL_L = "#b4bfce";
const WOOD = "#7a5230";
const WOOD_D = "#533820";
const WOOD_L = "#a57a4a";
const PANTS = "#4a3a2c";
const FUR = "#d8c9a0";
const BONE = "#efe3c4";
const FIRE = "#ff7a1a";
const FIRE_Y = "#ffd24a";
const DARK = "#1a1018";

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.58, 0] });
  const spine = b.chain("spine", catmull([[0, 0.58, 0], [0, 0.85, 0.02], [0, 1.08, 0.03]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.tip!;
  const belly = spine.joints[0];
  const neck = b.chain("neck", polyline([[0, 1.08, 0.03], [0, 1.2, 0.05]]), {
    parent: chest,
    names: ["neck", "head"],
    role: "neck",
  });
  const head = neck.tip!;
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.27, 0.1], aim: [0, 1.27, 0.2], role: "jaw" });

  // ---------- small helpers ----------
  const ell = (bone: any, color: string, at: number[], r: number[], seg: [number, number] = [10, 8]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { bone, at, scale: r });
  const box = (bone: any, color: string, at: any, size: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...opts });
  const cyl = (bone: any, color: string, at: any, r0: number, r1: number, h: number, seg = 10, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { bone, at, ...opts });

  const braid = (bone: any, x: number, y: number, z: number, n: number, dy: number, dz: number, r0: number) => {
    for (let i = 0; i < n; i++) {
      const r = r0 * (1 - i * 0.05);
      ell(bone, i % 2 ? HAIR_D : HAIR, [x, y + dy * i, z + dz * i], [r, r * 0.85, r], [8, 6]);
    }
    const ex = y + dy * n;
    cyl(bone, GOLD, [x, ex + dy * 0.1, z + dz * n], r0 * 0.85, r0 * 0.85, 0.025, 8);
    b.spike([x, ex + dy * 0.2, z + dz * n], [0, -1, 0], 0.07, r0 * 0.8, { color: HAIR_L, bone });
  };

  // ---------- torso ----------
  b.sweep(spine, (t: number) => [0.19 + 0.08 * Math.min(1, t * 1.6), 0.14 + 0.05 * Math.min(1, t * 1.6)], {
    color: TUNIC,
  });
  ell(belly, TUNIC, [0, 0.82, 0.06], [0.24, 0.2, 0.2], [12, 8]);
  ell(hips, PANTS, [0, 0.6, 0.0], [0.22, 0.14, 0.17], [10, 8]);
  ell(hips, PANTS, [0, 0.58, 0.1], [0.2, 0.18, 0.18], [10, 8]);
  ell(chest, TUNIC_D, [0, 1.0, -0.05], [0.26, 0.14, 0.14], [10, 6]); // back yoke
  // neck
  b.sweep(neck, 0.075, { color: SKIN_D });
  // collar
  cyl(chest, LEATHER, [0, 1.1, 0.03], 0.12, 0.14, 0.05, 10);

  // belt
  cyl(hips, LEATHER_D, [0, 0.69, 0.03], 0.245, 0.245, 0.07, 14, { scale: [1, 1, 0.92] });
  box(hips, GOLD, [0, 0.69, 0.255], [0.09, 0.075, 0.025]);
  box(hips, GOLD_D, [0, 0.69, 0.27], [0.05, 0.04, 0.012]);
  for (const s of [1, -1]) {
    box(hips, LEATHER, [s * 0.2, 0.55, 0.16], [0.03, 0.2, 0.03]);
    ell(hips, STEEL_D, [s * 0.2, 0.44, 0.16], [0.03, 0.03, 0.03], [6, 4]);
  }

  // apron
  const apron = b.extrude(
    [
      [-0.15, 0.62], [0.15, 0.62], [0.2, 0.5], [0.22, 0.3], [0.2, 0.0], [-0.2, 0.0], [-0.22, 0.3], [-0.2, 0.5],
    ],
    { at: [0, 0.4, 0.285], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.006, color: LEATHER, bone: belly },
  );
  box(belly, LEATHER_D, [0, 0.41, 0.3], [0.41, 0.04, 0.035]);
  box(belly, LEATHER_D, [0, 0.52, 0.31], [0.22, 0.13, 0.02]);
  box(belly, GOLD, [0, 0.58, 0.322], [0.22, 0.012, 0.01]);
  // emblem on apron: gold diamond with dark core
  box(belly, GOLD, [0, 0.76, 0.304], [0.085, 0.085, 0.012], { rotation: [0, 0, 45] });
  box(belly, DARK, [0, 0.76, 0.31], [0.05, 0.05, 0.012], { rotation: [0, 0, 45] });
  box(belly, GOLD, [0, 0.76, 0.316], [0.022, 0.022, 0.012], { rotation: [0, 0, 45] });
  for (let i = 0; i < 6; i++) {
    const x = -0.12 + i * 0.048;
    ell(belly, GOLD, [x, 0.6, 0.303], [0.01, 0.01, 0.008], [6, 4]);
  }
  void apron;
  // apron straps
  for (const s of [1, -1]) {
    b.capsule([s * 0.12, 0.98, 0.28], [s * 0.15, 1.15, 0.06], 0.02, LEATHER, { bone: chest });
    box(chest, GOLD, [s * 0.12, 0.99, 0.29], [0.04, 0.035, 0.012]);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${N}`,
      polyline([[s * 0.12, 0.58, 0], [s * 0.13, 0.34, 0.02], [s * 0.13, 0.09, 0]]),
      { parent: hips, names: [`hip${N}`, `knee${N}`, `ankle${N}`], role: "leg" },
    );
    b.sweep(leg, [0.105, 0.085, 0.072], { color: PANTS });
    const ank = leg.tip!;
    // boot
    cyl(ank, LEATHER, [s * 0.13, 0.22, 0.0], 0.088, 0.092, 0.22, 10);
    box(ank, LEATHER, [s * 0.13, 0.075, 0.07], [0.17, 0.15, 0.29]);
    ell(ank, LEATHER_D, [s * 0.13, 0.07, 0.2], [0.09, 0.07, 0.07], [8, 6]);
    box(ank, DARK, [s * 0.13, 0.012, 0.075], [0.18, 0.024, 0.31]); // sole
    cyl(ank, FUR, [s * 0.13, 0.335, 0.0], 0.1, 0.105, 0.06, 10);
    cyl(ank, LEATHER_D, [s * 0.13, 0.17, 0.0], 0.096, 0.096, 0.03, 10);
    box(ank, GOLD, [s * 0.13, 0.17, 0.095], [0.05, 0.04, 0.012]);
    box(ank, STEEL, [s * 0.13, 0.12, 0.222], [0.1, 0.03, 0.03]); // toe plate
    // knee pad
    ell(leg.joints[1], STEEL_D, [s * 0.13, 0.35, 0.095], [0.06, 0.06, 0.04], [8, 6]);
    ell(leg.joints[1], GOLD, [s * 0.13, 0.35, 0.125], [0.02, 0.02, 0.012], [6, 4]);
  }

  // ---------- arms ----------
  const armPts: Record<string, number[][]> = {
    L: [[0.27, 1.05, 0.02], [0.37, 0.86, 0.1], [0.34, 0.78, 0.3]],
    R: [[-0.27, 1.05, 0.02], [-0.37, 0.88, 0.12], [-0.36, 0.8, 0.3]],
  };
  const arms: Record<string, any> = {};
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${N}`, polyline(armPts[N]), {
      parent: chest,
      names: [`shoulder${N}`, `elbow${N}`, `wrist${N}`],
      role: "arm",
    });
    arms[N] = arm;
    b.sweep(arm, [0.088, 0.075, 0.06], {
      bands: [[0.5, TUNIC], [1, SKIN]],
    });
    const sh = arm.joints[0];
    const el = arm.joints[1];
    const wr = arm.tip!;
    // pauldron
    ell(sh, STEEL, [s * 0.31, 1.12, 0.02], [0.15, 0.1, 0.15], [10, 7]);
    ell(sh, STEEL_D, [s * 0.34, 1.03, 0.02], [0.12, 0.06, 0.12], [10, 6]);
    b.part(new THREE.TorusGeometry(0.15, 0.015, 6, 14), GOLD, {
      bone: sh, at: [s * 0.31, 1.09, 0.02], rotation: [90, 0, 0], scale: [1, 1, 1],
    });
    b.part(new THREE.ConeGeometry(0.045, 0.16, 6), STEEL_L, {
      bone: sh, at: [s * 0.33, 1.22, 0.02], dir: [s * 0.45, 1, 0],
    });
    ell(sh, GOLD, [s * 0.31, 1.2, 0.02], [0.03, 0.03, 0.03], [6, 4]);
    // bracer on forearm
    const a = el.at.clone();
    const w = wr.at.clone();
    const dir = w.clone().sub(a);
    const mid = a.clone().lerp(w, 0.55);
    cyl(el, STEEL, mid, 0.066, 0.058, 0.13, 10, { dir });
    cyl(el, GOLD, a.clone().lerp(w, 0.55 - 0.3), 0.07, 0.07, 0.014, 10, { dir });
    cyl(el, GOLD, a.clone().lerp(w, 0.55 + 0.3), 0.06, 0.06, 0.014, 10, { dir });
    cyl(el, LEATHER_D, a.clone().lerp(w, 0.05), 0.083, 0.083, 0.03, 10, { dir });
    // hand
    const handAt = w.clone().add(new THREE.Vector3(0, -0.005, 0.045));
    ell(wr, SKIN, [handAt.x, handAt.y, handAt.z], [0.055, 0.055, 0.06], [8, 6]);
    for (let i = 0; i < 4; i++) {
      ell(wr, SKIN_D, [handAt.x + (i - 1.5) * 0.02 * s, handAt.y - 0.01, handAt.z + 0.06], [0.014, 0.018, 0.02], [6, 4]);
    }
    ell(wr, SKIN, [handAt.x - s * 0.05, handAt.y + 0.01, handAt.z + 0.01], [0.02, 0.025, 0.03], [6, 4]);
  }

  // ---------- hammer (right hand) ----------
  const wristR = new THREE.Vector3(...armPts.R[2]);
  const d = new THREE.Vector3(0.15, 0.75, 0.55).normalize();
  const wR = arms.R.tip;
  const hA = wristR.clone().addScaledVector(d, -0.14).add(new THREE.Vector3(0, 0, 0.045));
  const hB = wristR.clone().addScaledVector(d, 0.5).add(new THREE.Vector3(0, 0, 0.045));
  b.rod(hA, hB, 0.022, WOOD, { bone: wR, sides: 8 });
  ell(wR, WOOD_D, [hA.x, hA.y, hA.z], [0.032, 0.032, 0.032], [6, 4]);
  for (let i = 0; i < 3; i++) {
    const p = wristR.clone().addScaledVector(d, -0.06 + i * 0.045).add(new THREE.Vector3(0, 0, 0.045));
    cyl(wR, LEATHER_D, p, 0.027, 0.027, 0.025, 8, { dir: d });
  }
  const hc = wristR.clone().addScaledVector(d, 0.52).add(new THREE.Vector3(0, 0, 0.045));
  const hh = b.part(new THREE.BoxGeometry(0.2, 0.1, 0.11), STEEL_D, { bone: wR, at: hc, dir: d });
  for (const k of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.115, 0.125), STEEL_L, { bone: wR, at: hh.local([k * 0.115, 0, 0]), dir: d });
    b.part(new THREE.BoxGeometry(0.02, 0.07, 0.07), STEEL, { bone: wR, at: hh.local([k * 0.14, 0, 0]), dir: d });
    b.part(new THREE.BoxGeometry(0.03, 0.105, 0.115), GOLD, { bone: wR, at: hh.local([k * 0.075, 0, 0]), dir: d });
  }
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.05), STEEL, { bone: wR, at: hh.local([0, 0, 0.07]), dir: d });
  b.part(new THREE.BoxGeometry(0.06, 0.03, 0.115), GOLD, { bone: wR, at: hh.local([0, 0, 0]), dir: d });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.12), DARK, { bone: wR, at: hh.local([0, 0.052, 0]), dir: d });

  // ---------- tongs + hot ingot (left hand) ----------
  const wL = arms.L.tip;
  const tongA = new THREE.Vector3(0.34, 0.78, 0.35);
  for (const k of [1, -1]) {
    const tip = new THREE.Vector3(0.17 + k * 0.0, 0.73 + k * 0.014, 0.64 + k * 0.0);
    b.rod(tongA.clone().add(new THREE.Vector3(k * 0.01, k * 0.012, 0)), tip, 0.011, STEEL_D, { bone: wL, sides: 6 });
  }
  ell(wL, STEEL, [0.33, 0.785, 0.37], [0.025, 0.025, 0.025], [6, 4]);
  glow(box(wL, FIRE, [0.06, 0.727, 0.65], [0.24, 0.036, 0.055], { rotation: [0, 8, 0] }), 1.3);
  glow(box(wL, FIRE_Y, [0.0, 0.73, 0.652], [0.1, 0.038, 0.058], { rotation: [0, 8, 0] }), 1.8);

  // ---------- head ----------
  const HC = [0, 1.34, 0.07];
  ell(head, SKIN, HC, [0.15, 0.15, 0.15], [14, 10]);
  ell(head, SKIN, [0, 1.28, 0.09], [0.14, 0.12, 0.13], [12, 8]); // cheeks / jaw mass
  ell(head, "#e08a68", [0, 1.31, 0.228], [0.052, 0.045, 0.05], [8, 6]); // big nose
  ell(head, "#c9704f", [0, 1.295, 0.255], [0.03, 0.02, 0.012], [6, 4]);
  for (const s of [1, -1]) {
    ell(head, "#ffffff", [s * 0.058, 1.355, 0.203], [0.03, 0.03, 0.02], [8, 6]);
    ell(head, "#3aa0d8", [s * 0.058, 1.355, 0.221], [0.018, 0.02, 0.01], [8, 6]);
    ell(head, DARK, [s * 0.058, 1.355, 0.228], [0.009, 0.011, 0.006], [6, 4]);
    ell(head, "#ffffff", [s * 0.052, 1.363, 0.232], [0.004, 0.004, 0.003], [4, 3]);
    box(head, HAIR_L, [s * 0.065, 1.395, 0.205], [0.085, 0.03, 0.05], { rotation: [0, 0, s * 15] });
    box(head, HAIR, [s * 0.075, 1.405, 0.2], [0.07, 0.02, 0.05], { rotation: [0, 0, s * 15] });
    ell(head, BLUSH, [s * 0.1, 1.3, 0.17], [0.04, 0.035, 0.03], [6, 5]);
    ell(head, SKIN, [s * 0.15, 1.34, 0.06], [0.022, 0.05, 0.035], [6, 5]);
    ell(head, SKIN_D, [s * 0.158, 1.34, 0.06], [0.01, 0.03, 0.02], [6, 4]);
    b.spike([s * 0.15, 1.375, 0.06], [s * 0.6, 1, -0.2], 0.05, 0.022, { color: SKIN, bone: head });
    ell(head, HAIR, [s * 0.125, 1.27, 0.12], [0.06, 0.1, 0.1], [8, 6]); // sideburns
    // mustache
    b.sweep(bezier([s * 0.015, 1.295, 0.232], [s * 0.09, 1.29, 0.245], [s * 0.15, 1.19, 0.2]), [0.036, 0.012], {
      color: HAIR_L, bone: head,
    });
    b.sweep(bezier([s * 0.012, 1.285, 0.228], [s * 0.07, 1.27, 0.235], [s * 0.12, 1.17, 0.205]), [0.03, 0.008], {
      color: HAIR, bone: head,
    });
    ell(head, GOLD, [s * 0.15, 1.185, 0.2], [0.018, 0.018, 0.018], [6, 4]);
  }
  // back hair
  ell(head, HAIR_D, [0, 1.35, -0.03], [0.155, 0.14, 0.12], [10, 7]);
  braid(head, 0, 1.36, -0.14, 7, -0.05, -0.012, 0.035);

  // jaw (separate, opens)
  b.part(new THREE.BoxGeometry(0.15, 0.04, 0.13), SKIN_D, { bone: jaw, at: [0, 1.255, 0.14] });
  box(jaw, DARK, [0, 1.275, 0.14], [0.11, 0.015, 0.1]);
  box(jaw, BONE, [0, 1.282, 0.2], [0.08, 0.012, 0.01]);

  // beard: solid mass + tufts
  const beard: number[][] = [
    [1.24, 0.17, 0.15, 0.1, 0.11],
    [1.15, 0.2, 0.145, 0.1, 0.1],
    [1.06, 0.225, 0.125, 0.1, 0.09],
    [0.98, 0.235, 0.095, 0.09, 0.07],
  ];
  beard.forEach(([y, z, rx, ry, rz], i) => ell(head, i % 2 ? HAIR : HAIR_L, [0, y, z], [rx, ry, rz], [10, 7]));
  for (let i = 0; i < 5; i++) {
    const x = -0.08 + i * 0.04;
    b.spike([x, 1.0, 0.255], [x * 1.3, -1, 0.15], 0.14 - Math.abs(i - 2) * 0.025, 0.035, { color: i % 2 ? HAIR_L : HAIR, bone: head });
  }
  for (let i = 0; i < 4; i++) {
    const x = -0.06 + i * 0.04;
    b.spike([x, 1.17, 0.29], [0, -1, 0.1], 0.16, 0.025, { color: HAIR_L, bone: head });
    b.spike([x * 0.8, 1.08, 0.305], [0, -1, 0.1], 0.12, 0.022, { color: HAIR, bone: head });
  }
  for (const s of [1, -1]) {
    braid(head, s * 0.11, 1.16, 0.23, 6, -0.045, 0.012, 0.03);
    cyl(head, GOLD, [s * 0.075, 1.0, 0.26], 0.05, 0.05, 0.018, 8, { rotation: [0, 0, 90] });
  }
  cyl(head, GOLD, [0, 1.0, 0.285], 0.04, 0.04, 0.02, 8);

  // helmet
  b.lathe(
    [[0, 0], [0.165, 0], [0.175, 0.04], [0.155, 0.1], [0.09, 0.15], [0, 0.17]],
    { at: [0, 1.395, 0.07], color: STEEL, bone: head, segments: 14 },
  );
  b.part(new THREE.TorusGeometry(0.168, 0.014, 6, 16), GOLD, { bone: head, at: [0, 1.4, 0.07], rotation: [90, 0, 0] });
  box(head, STEEL_D, [0, 1.45, 0.07], [0.018, 0.14, 0.34]); // crest ridge plate
  box(head, STEEL_L, [0, 1.35, 0.245], [0.03, 0.11, 0.015]); // nasal guard
  ell(head, GOLD, [0, 1.52, 0.07], [0.025, 0.025, 0.025], [6, 4]);
  for (const s of [1, -1]) {
    const p0 = [s * 0.16, 1.45, 0.07];
    const horn = b.sweep(bezier(p0, [s * 0.3, 1.46, 0.07], [s * 0.35, 1.6, 0.09]), [0.042, 0.004], {
      bone: head, color: BONE, caps: { start: "flat", end: "point" },
    });
    void horn;
    ell(head, GOLD, p0, [0.05, 0.05, 0.05], [8, 6]);
    cyl(head, GOLD, [s * 0.235, 1.465, 0.073], 0.036, 0.036, 0.02, 8, { rotation: [0, 0, 90 + s * -5] });
    ell(head, STEEL_L, [s * 0.14, 1.33, 0.21], [0.0, 0.0, 0.0], [3, 2]); // placeholder-free no-op size
  }

  // ---------- stump + anvil ----------
  const AZ = 0.65;
  const root = hips;
  cyl(root, WOOD, [0, 0.19, AZ], 0.28, 0.33, 0.38, 10);
  cyl(root, WOOD_L, [0, 0.382, AZ], 0.27, 0.27, 0.006, 10);
  cyl(root, WOOD, [0, 0.386, AZ], 0.18, 0.18, 0.006, 10);
  cyl(root, WOOD_D, [0, 0.389, AZ], 0.09, 0.09, 0.006, 8);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.spike([Math.sin(a) * 0.3, 0.03, AZ + Math.cos(a) * 0.3], [Math.sin(a), -0.3, Math.cos(a)], 0.12, 0.04, { color: WOOD_D, bone: root });
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    box(root, WOOD_D, [Math.sin(a) * 0.29, 0.2 + (i % 2) * 0.08, AZ + Math.cos(a) * 0.29], [0.03, 0.2, 0.02], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  cyl(root, STEEL_D, [0, 0.12, AZ], 0.31, 0.31, 0.025, 10);
  cyl(root, STEEL_D, [0, 0.31, AZ], 0.295, 0.295, 0.025, 10);
  box(root, STEEL_D, [0, 0.42, AZ], [0.34, 0.08, 0.24]);
  box(root, STEEL, [0, 0.53, AZ], [0.2, 0.14, 0.17]);
  box(root, STEEL_D, [0, 0.65, AZ], [0.58, 0.1, 0.2]);
  box(root, STEEL_L, [0, 0.706, AZ], [0.52, 0.012, 0.2]);
  box(root, STEEL_D, [-0.31, 0.62, AZ], [0.1, 0.06, 0.2]);
  b.part(new THREE.ConeGeometry(0.095, 0.28, 8), STEEL_D, { bone: root, at: [0.4, 0.655, AZ], rotation: [0, 0, -90] });
  box(root, DARK, [-0.18, 0.713, AZ], [0.035, 0.004, 0.035]);
  cyl(root, DARK, [-0.1, 0.712, AZ], 0.012, 0.012, 0.004, 8);
  box(root, GOLD, [0, 0.42, AZ + 0.123], [0.1, 0.03, 0.006]);

  // sparks
  const rand = rng(7);
  for (let i = 0; i < 14; i++) {
    const r = 0.007 + rand() * 0.008;
    glow(
      b.part(new THREE.OctahedronGeometry(r), i % 3 ? FIRE_Y : FIRE, {
        bone: root,
        at: [0.03 + (rand() - 0.5) * 0.5, 0.76 + rand() * 0.32, AZ + (rand() - 0.5) * 0.4],
      }),
      2,
    );
  }

  return b.root;
}
