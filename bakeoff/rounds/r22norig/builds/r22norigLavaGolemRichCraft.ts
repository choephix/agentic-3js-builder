import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { DEG } from "../../../../src/math";
import { mottle, paint } from "../../../../src/paint";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description: "Hunched basalt-plate colossus with molten seams, a gold-caged magma core, hex-column back spines and gilt trim, cel shaded.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const LAVA = "#ff7a1a";
const LAVA_HOT = "#ffd23a";
const EMBER = "#ff4514";
const GOLD = cel("#f4c453", "#b5762a");
const GOLD_FLAT = "#f4c453";

const BASALT_A = cel(mottle("#4b4760", "#5f5a78", { size: 0.18, seed: 3 }), "#2c2842");
const BASALT_B = cel(mottle("#3e3a52", "#524d6a", { size: 0.14, seed: 8 }), "#25213a");
const BASALT_D = cel("#2a2638", "#17141f");
const SCORCH = cel("#7a2c1c", "#3d1418");
const LEG_PAINT = paint((p) => (p.y < 0.38 ? SCORCH : p.y < 0.5 ? BASALT_D : BASALT_B));
const FOOT_PAINT = paint((p) => (p.y < 0.12 ? SCORCH : BASALT_D));

type B = ReturnType<typeof createBuilder>;
type P = number[];

export default function build(): THREE.Object3D {
  const b: B = createBuilder({ name: "lavaGolem" });

  const boulder = (c: P, s: P, color: any, rot: P = [0, 0, 0], det = 1) =>
    b.part(new THREE.IcosahedronGeometry(1, det), color, { at: c, scale: s, rotation: rot });
  const box = (c: P, s: P, color: any, rot: P = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { at: c, rotation: rot });
  const ring = (c: P, r: number, tube: number, color: any, rot: P = [90, 0, 0], sc: P = [1, 1, 1]) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 14), color, { at: c, rotation: rot, scale: sc });
  const ep = (c: P, r: P, az: number, el: number, k = 1) => {
    const a = az * DEG;
    const e = el * DEG;
    return new THREE.Vector3(
      c[0] + Math.sin(a) * Math.cos(e) * r[0] * k,
      c[1] + Math.sin(e) * r[1] * k,
      c[2] + Math.cos(a) * Math.cos(e) * r[2] * k,
    );
  };
  const enorm = (c: P, r: P, p: THREE.Vector3) =>
    new THREE.Vector3((p.x - c[0]) / (r[0] * r[0]), (p.y - c[1]) / (r[1] * r[1]), (p.z - c[2]) / (r[2] * r[2])).normalize();
  const crack = (c: P, r: P, pts: number[][], rad: number, color: string, mir = 1) => {
    const path = pts.map(([az, el]) => ep(c, r, az * mir, el, 1.015));
    glow(b.sweep(path, rad, color, { sides: 5, caps: "round" }), 1.4);
  };
  const plates = (c: P, r: P, list: number[][], size: P, colors: any[]) => {
    list.forEach(([az, el], i) => {
      const p = ep(c, r, az, el, 1.02);
      const n = enorm(c, r, p);
      b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), colors[i % colors.length], {
        at: p,
        dir: n,
        axis: "z",
        up: [0, 1, 0],
        rotation: undefined,
      });
    });
  };
  const column = (base: P, dir: P, h: number, r: number, color: any, cap = true) => {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const mid = new THREE.Vector3(base[0], base[1], base[2]).addScaledVector(d, h / 2);
    b.part(new THREE.CylinderGeometry(r * 0.85, r, h, 6), color, { at: mid, dir: d });
    if (cap) {
      const top = new THREE.Vector3(base[0], base[1], base[2]).addScaledVector(d, h);
      glow(b.part(new THREE.ConeGeometry(r * 0.8, r * 1.1, 6), LAVA, { at: top.clone().addScaledVector(d, r * 0.45), dir: d }), 1.5);
    }
  };

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const x = s * 0.4;
    box([x, 0.1, 0.12], [0.62, 0.2, 0.86], FOOT_PAINT, [0, s * 4, 0]);
    // toe blocks
    for (const t of [-1, 0, 1]) box([x + t * 0.2, 0.1, 0.58], [0.17, 0.16, 0.22], BASALT_D, [0, t * 6, 0]);
    boulder([x, 0.56, 0], [0.3, 0.4, 0.32], LEG_PAINT, [0, s * 20, 0]);
    boulder([x, 0.98, 0.1], [0.34, 0.26, 0.34], BASALT_A, [10, 0, 0]); // knee
    box([x, 0.98, 0.42], [0.3, 0.26, 0.12], BASALT_D, [-15, 0, 0]); // knee cap
    boulder([x * 1.04, 1.28, -0.02], [0.36, 0.34, 0.34], BASALT_B, [0, s * 15, 0]);
    // ankle + thigh gold bands
    ring([x, 0.4, 0.02], 0.3, 0.028, GOLD_FLAT, [90, 0, 0], [1, 1, 1]);
    ring([x, 0.8, 0.02], 0.31, 0.024, GOLD_FLAT);
    // molten seams down shin and thigh
    glow(b.sweep([[x + s * 0.06, 0.28, 0.3], [x - s * 0.02, 0.5, 0.31], [x + s * 0.05, 0.7, 0.28]], 0.022, LAVA, { sides: 5 }), 1.4);
    glow(b.sweep([[x - s * 0.1, 1.1, 0.3], [x + s * 0.02, 1.25, 0.36], [x - s * 0.05, 1.42, 0.3]], 0.024, LAVA, { sides: 5 }), 1.4);
    glow(b.sweep([[x + s * 0.2, 1.5, 0.12], [x + s * 0.3, 1.28, 0.1], [x + s * 0.34, 1.05, 0.06]], 0.022, EMBER, { sides: 5 }), 1.3);
    // shin spikes
    b.spike([x + s * 0.28, 0.62, 0.05], [s * 1, 0.2, 0], 0.22, 0.06, BASALT_D);
    b.spike([x - s * 0.1, 0.6, -0.3], [0, 0.3, -1], 0.2, 0.06, BASALT_D);
  }

  // ---------- pelvis + belt ----------
  boulder([0, 1.45, 0], [0.72, 0.3, 0.46], BASALT_D);
  ring([0, 1.6, 0], 0.6, 0.04, GOLD_FLAT, [90, 0, 0], [1.15, 0.78, 1]);
  glow(b.part(new THREE.OctahedronGeometry(0.1), LAVA_HOT, { at: [0, 1.6, 0.46], scale: [1, 1.2, 0.6] }), 1.6);
  for (let i = 0; i < 9; i++) {
    const a = (-80 + i * 20) * DEG;
    const x = Math.sin(a) * 0.68;
    const z = Math.cos(a) * 0.44;
    b.rod([x, 1.55, z], [x * 1.02, 1.3 - (i % 2) * 0.1, z * 1.02], 0.018, GOLD_FLAT, { sides: 4 });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), GOLD_FLAT, { at: [x * 1.02, 1.3 - (i % 2) * 0.1, z * 1.02] });
  }
  // loincloth plate
  box([0, 1.3, 0.47], [0.3, 0.34, 0.08], BASALT_A, [-8, 0, 0]);
  glow(b.part(new THREE.BoxGeometry(0.04, 0.26, 0.02), LAVA, { at: [0, 1.3, 0.52], rotation: [-8, 0, 0] }), 1.3);

  // ---------- torso ----------
  const TC = [0, 2.0, 0.05];
  const TR = [0.82, 0.72, 0.56];
  boulder(TC, TR, BASALT_A, [0, 0, 0], 2);
  boulder([0, 1.62, 0.04], [0.62, 0.34, 0.46], BASALT_B, [0, 0, 0], 1); // waist
  plates(
    TC,
    TR,
    [[-48, 52], [48, 52], [-50, 15], [50, 15], [-48, -20], [48, -20], [0, 62], [0, -42], [-85, 30], [85, 30], [-88, -8], [88, -8], [-25, 72], [25, 72]],
    [0.3, 0.24, 0.1],
    [BASALT_B, BASALT_A, BASALT_D],
  );
  // seams
  for (const s of [1, -1]) {
    crack(TC, TR, [[26, 62], [34, 44], [24, 28], [38, 10], [30, -8], [40, -28], [28, -48]], 0.024, LAVA, s);
    crack(TC, TR, [[58, 38], [66, 20], [60, 2]], 0.02, EMBER, s);
    crack(TC, TR, [[100, 50], [108, 20], [112, -10], [104, -30]], 0.026, LAVA, s);
    crack(TC, TR, [[155, 60], [165, 30], [150, 0], [160, -30]], 0.028, LAVA, s);
  }
  crack(TC, TR, [[180, 65], [175, 35], [185, 5], [178, -25]], 0.03, LAVA_HOT, 1);

  // core with gold cage
  const CORE: P = [0, 2.0, 0.6];
  glow(b.part(new THREE.IcosahedronGeometry(0.17, 1), LAVA_HOT, { at: CORE }), 2.2);
  glow(b.part(new THREE.IcosahedronGeometry(0.22, 0), EMBER, { at: [0, 2.0, 0.56], scale: [1, 1, 0.6] }), 1.2);
  ring(CORE, 0.26, 0.03, GOLD_FLAT, [0, 0, 0]);
  ring(CORE, 0.36, 0.022, GOLD_FLAT, [0, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const d = [Math.cos(a), Math.sin(a), 0.1];
    b.spike([CORE[0] + d[0] * 0.33, CORE[1] + d[1] * 0.33, CORE[2]], d, i % 2 ? 0.1 : 0.17, 0.035, GOLD);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.035, 6, 4), GOLD_FLAT, { at: [CORE[0] + Math.cos(a) * 0.26, CORE[1] + Math.sin(a) * 0.26, CORE[2] + 0.01] });
  }
  // gold collar gorget
  ring([0, 2.58, 0.1], 0.52, 0.03, GOLD_FLAT, [90, 0, 0], [1.1, 0.9, 1]);

  // ---------- back columns ----------
  const cols: Array<[P, P, number, number]> = [
    [[0, 2.5, -0.35], [0, 0.55, -0.85], 0.8, 0.1],
    [[0.3, 2.45, -0.38], [0.35, 0.5, -0.8], 0.65, 0.09],
    [[-0.3, 2.45, -0.38], [-0.35, 0.5, -0.8], 0.65, 0.09],
    [[0.55, 2.25, -0.38], [0.6, 0.35, -0.8], 0.5, 0.08],
    [[-0.55, 2.25, -0.38], [-0.6, 0.35, -0.8], 0.5, 0.08],
    [[0.15, 2.05, -0.5], [0.1, 0.1, -1], 0.42, 0.075],
    [[-0.2, 2.1, -0.5], [-0.1, 0.2, -1], 0.4, 0.07],
  ];
  cols.forEach(([base, dir, h, r], i) => column(base, dir, h, r, i % 2 ? BASALT_B : BASALT_A));
  // lava drip veins on back
  glow(b.sweep([[0.0, 2.45, -0.5], [0.05, 2.2, -0.58], [-0.04, 1.95, -0.6], [0.02, 1.7, -0.5]], 0.03, LAVA, { sides: 5 }), 1.4);

  // ---------- head ----------
  const HC: P = [0, 2.82, 0.3];
  boulder(HC, [0.3, 0.25, 0.3], BASALT_A, [0, 0, 0], 1);
  boulder([0, 2.66, 0.44], [0.22, 0.1, 0.17], BASALT_D, [10, 0, 0], 1); // jaw
  box([0, 2.98, 0.45], [0.36, 0.06, 0.1], BASALT_D, [-20, 0, 0]); // brow ridge
  for (const s of [1, -1]) {
    box([s * 0.12, 2.9, 0.54], [0.18, 0.045, 0.06], BASALT_D, [0, 0, s * -18]);
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), LAVA_HOT, { at: [s * 0.12, 2.83, 0.55], scale: [1.4, 0.8, 0.6] }), 2.4);
    // horns
    b.spike([s * 0.2, 3.0, 0.2], [s * 0.55, 0.95, -0.3], 0.5, 0.075, BASALT_D);
    b.spike([s * 0.31, 3.3, 0.08], [s * 0.4, 0.9, -0.3], 0.16, 0.035, GOLD);
    ring([s * 0.23, 3.07, 0.17], 0.065, 0.016, GOLD_FLAT, [60, 0, s * 30]);
    // cheek cracks
    crack(HC, [0.3, 0.25, 0.3], [[s * 60, 25], [s * 62, 5], [s * 50, -15]], 0.012, LAVA, 1);
  }
  // mouth: glowing jagged line with teeth
  for (let i = 0; i < 6; i++) {
    const x = -0.13 + i * 0.052;
    glow(b.part(new THREE.BoxGeometry(0.035, 0.03 + (i % 2) * 0.02, 0.03), LAVA, { at: [x, 2.7 - (i % 2) * 0.01, 0.58] }), 1.6);
    b.spike([x, 2.73, 0.57], [0, -1, 0.2], 0.035, 0.014, BASALT_D);
  }
  // head crest of lava
  for (let i = 0; i < 4; i++) {
    glow(b.spike([0, 3.05 - i * 0.04, 0.3 - i * 0.12], [0, 0.8, -0.4], 0.14 - i * 0.015, 0.03, LAVA), 1.4);
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const SH: P = [s * 1.0, 2.5, 0.0];
    boulder(SH, [0.46, 0.36, 0.42], BASALT_A, [0, 0, s * 15], 1);
    boulder([s * 1.05, 2.25, 0.05], [0.3, 0.2, 0.34], BASALT_D, [0, 0, 0], 0);
    ring([s * 1.0, 2.76, 0], 0.3, 0.03, GOLD_FLAT, [90, 0, 0]);
    ring([s * 1.02, 2.69, 0], 0.37, 0.022, GOLD_FLAT, [90, 0, 0]);
    // pauldron spikes
    for (let i = 0; i < 3; i++) {
      const d = [s * (0.6 + i * 0.3), 1.0 - i * 0.25, -0.1 + i * 0.35];
      b.spike([s * (0.85 + i * 0.1), 2.76 - i * 0.04, -0.12 + i * 0.12], d, 0.38 - i * 0.07, 0.085 - i * 0.012, BASALT_D);
    }
    glow(b.sweep([[s * 0.8, 2.78, 0.2], [s * 0.95, 2.82, 0.0], [s * 1.12, 2.74, -0.2]], 0.022, LAVA, { sides: 5 }), 1.4);
    // upper arm
    b.rod([s * 1.05, 2.4, 0.02], [s * 1.2, 1.55, 0.2], [0.26, 0.24], BASALT_B, { sides: 7 });
    glow(b.sweep([[s * 1.3, 2.25, 0.2], [s * 1.38, 2.0, 0.24], [s * 1.34, 1.75, 0.3]], 0.026, LAVA, { sides: 5 }), 1.4);
    // elbow block + spike
    boulder([s * 1.22, 1.5, 0.12], [0.3, 0.26, 0.3], BASALT_A, [0, 0, 0], 1);
    b.spike([s * 1.38, 1.5, 0.0], [s * 1, 0.25, -0.5], 0.34, 0.09, BASALT_D);
    ring([s * 1.2, 1.76, 0.18], 0.26, 0.025, GOLD_FLAT, [80, 0, s * 10]);
    // forearm
    b.rod([s * 1.22, 1.45, 0.16], [s * 1.28, 0.78, 0.38], [0.27, 0.32], BASALT_A, { sides: 7 });
    // gold bracer
    b.rod([s * 1.25, 1.2, 0.26], [s * 1.27, 1.0, 0.33], [0.34, 0.34], GOLD, { sides: 8, caps: "flat" });
    ring([s * 1.25, 1.2, 0.26], 0.33, 0.02, GOLD_FLAT, [98, 0, 0]);
    ring([s * 1.27, 1.0, 0.33], 0.34, 0.02, GOLD_FLAT, [98, 0, 0]);
    glow(b.sweep([[s * 1.4, 1.4, 0.3], [s * 1.46, 1.3, 0.34], [s * 1.42, 1.22, 0.3]], 0.02, EMBER, { sides: 5 }), 1.3);
    // fist
    boulder([s * 1.3, 0.55, 0.42], [0.4, 0.37, 0.4], BASALT_B, [0, 0, 0], 1);
    boulder([s * 1.3, 0.3, 0.68], [0.34, 0.15, 0.2], BASALT_D, [0, 0, 0], 0);
    for (let k = -1.5; k <= 1.5; k++) {
      b.spike([s * 1.3 + k * 0.14, 0.7, 0.78], [0, 0.35, 1], 0.17, 0.05, BASALT_D);
      b.part(new THREE.BoxGeometry(0.04, 0.2, 0.03), "#ff5a14", { at: [s * 1.3 + k * 0.14 + 0.07, 0.5, 0.79] });
    }
    glow(b.sweep([[s * 1.12, 0.78, 0.6], [s * 1.2, 0.62, 0.7], [s * 1.18, 0.45, 0.66], [s * 1.28, 0.32, 0.72]], 0.024, LAVA, { sides: 5 }), 1.4);
    glow(b.sweep([[s * 1.55, 0.7, 0.5], [s * 1.62, 0.55, 0.45], [s * 1.58, 0.36, 0.4]], 0.02, LAVA, { sides: 5 }), 1.3);
    // thumb
    b.spike([s * 1.0, 0.55, 0.55], [s * -0.3, -0.2, 1], 0.28, 0.08, BASALT_D);
  }

  // ---------- embers on feet / lava drip puddles ----------
  for (const s of [1, -1]) {
    glow(b.part(new THREE.IcosahedronGeometry(0.06, 0), LAVA, { at: [s * 0.4, 0.22, 0.52], scale: [1.4, 0.7, 1] }), 1.3);
    glow(b.part(new THREE.IcosahedronGeometry(0.05, 0), LAVA_HOT, { at: [s * 0.4, 0.21, -0.28], scale: [1.4, 0.7, 1] }), 1.3);
  }

  return b.root;
}
