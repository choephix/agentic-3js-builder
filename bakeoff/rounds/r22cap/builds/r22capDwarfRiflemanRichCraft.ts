import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { countershade, grain, mottle, Paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "Stocky dwarf sharpshooter with a braided copper beard, horned steel helm, pauldrons, bandolier and a brass-bell blunderbuss held at port arms.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type Fill = string | Paint;
type N3 = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dwarfRifleman" });

  // ---------- palette ----------
  const SKIN = countershade(mottle("#eaa87c", "#dc966a", { size: 0.04, seed: 2 }), "#b8704e");
  const CHEEK = countershade("#ec8b6c", "#b8604a");
  const BEARD = countershade(grain("#e2701f", "#b9480f", { size: 0.012, axis: "y", seed: 4 }), "#7a2a08");
  const BEARD_D = countershade(grain("#c85a14", "#9a3a0a", { size: 0.012, axis: "y", seed: 6 }), "#6a2206");
  const BROW = "#f0d9b0";
  const CLOTH = countershade(mottle("#3d71c6", "#3263ae", { size: 0.06, seed: 5 }), "#1f3f78");
  const TROUSER = countershade(mottle("#7a4c2c", "#6a3f24", { size: 0.05, seed: 8 }), "#3f2314");
  const LEATHER = countershade(grain("#92602f", "#74481f", { size: 0.012, axis: "y", seed: 9 }), "#4a2c14");
  const LEATHER_D = countershade(grain("#5a3820", "#46291a", { size: 0.012, axis: "y", seed: 11 }), "#2a170c");
  const STEEL = countershade(mottle("#b8c3d2", "#9ea9bc", { size: 0.03, seed: 3 }), "#56647c");
  const GOLD = countershade("#f3c64a", "#a8701a");
  const BRASS = countershade(mottle("#e0a834", "#c88e22", { size: 0.025, seed: 12 }), "#8a5a14");
  const BONE = countershade("#efe2c0", "#b09a72");
  const ROLL = stripes("#cfa96c", "#8a5a34", { size: 0.035, axis: "x", width: 0.5 });
  const DARK = "#17120f";
  const WOOD_D = new THREE.Vector3();

  // ---------- helpers ----------
  const ball = (at: N3, s: N3, color: Fill, seg: [number, number] = [8, 6], rot: N3 = [0, 0, 0]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { at, scale: s, rotation: rot });
  const box = (at: N3, size: N3, color: Fill, rot: N3 = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: rot });
  const cyl = (at: N3, r: number, h: number, color: Fill, rot: N3 = [0, 0, 0], seg = 8, sc: N3 = [1, 1, 1]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, rotation: rot, scale: sc });
  const studs = (pts: N3[], r: number, color: Fill) => {
    const gs = pts.map((p) => new THREE.SphereGeometry(r, 5, 4).translate(p[0], p[1], p[2]));
    b.part(mergeGeometries(gs), color, { at: [0, 0, 0] });
  };
  const lerp3 = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);

  // ---------- boots & legs ----------
  for (const s of [1, -1]) {
    const x = s * 0.12;
    box([x, 0.015, 0.04], [0.19, 0.03, 0.34], LEATHER_D);
    box([x, 0.13, 0.04], [0.17, 0.2, 0.28], LEATHER);
    ball([x, 0.09, 0.19], [0.085, 0.065, 0.075], LEATHER);
    ball([x, 0.085, 0.235], [0.07, 0.05, 0.04], STEEL);
    cyl([x, 0.245, 0.03], 1, 0.05, "#c9a063", [0, 0, 0], 8, [0.1, 1, 0.1]);
    box([x + s * 0.0, 0.2, 0.18], [0.1, 0.012, 0.012], GOLD);
    box([x, 0.13, 0.186], [0.03, 0.04, 0.01], GOLD);
    b.rod([x, 0.54, 0], [x, 0.25, 0.01], [0.09, 0.075], TROUSER);
    ball([x, 0.4, 0.075], [0.085, 0.075, 0.06], STEEL);
    studs([[x, 0.4, 0.132], [x - 0.045, 0.43, 0.11], [x + 0.045, 0.43, 0.11]], 0.012, GOLD);
    b.rod([x, 0.33, 0.045], [x, 0.26, 0.05], 0.085, LEATHER_D); // shin wrap
  }

  // ---------- torso ----------
  ball([0, 0.55, 0], [0.23, 0.15, 0.18], TROUSER, [10, 6]);
  ball([0, 0.78, 0], [0.27, 0.28, 0.2], CLOTH, [12, 8]);
  cyl([0, 0.6, 0], 1, 0.08, LEATHER_D, [0, 0, 0], 12, [0.235, 1, 0.19]);
  box([0, 0.6, 0.19], [0.08, 0.065, 0.02], GOLD);
  box([0, 0.6, 0.2], [0.04, 0.035, 0.01], DARK);
  studs(
    [-0.15, -0.1, 0.1, 0.15].map((x) => [x, 0.6, Math.sqrt(Math.max(0.0001, 1 - (x / 0.235) ** 2)) * 0.19 + 0.003] as N3),
    0.009,
    GOLD,
  );
  // tabard flap
  const TAB = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 90"><rect width="40" height="90" fill="#a8321f"/><rect x="2" y="0" width="36" height="86" fill="none" stroke="#e0a526" stroke-width="2.5"/><polygon points="0,90 0,80 10,90 20,80 30,90 40,80 40,90" fill="#e0a526"/><polygon points="20,18 32,40 20,62 8,40" fill="#e0a526"/><polygon points="20,27 27,40 20,53 13,40" fill="#7a2014"/><circle cx="20" cy="40" r="4" fill="#e0a526"/><rect x="18" y="66" width="4" height="8" fill="#e0a526"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.BoxGeometry(0.13, 0.28, 0.012), "#ffffff", { at: [0, 0.5, 0.2], texture: TAB });
  // chest plate shoulder yoke
  ball([0, 0.99, 0], [0.24, 0.08, 0.17], LEATHER, [10, 5]);
  studs([[-0.12, 1.05, 0.1], [0.12, 1.05, 0.1], [0, 1.065, 0.12], [-0.06, 1.06, 0.11], [0.06, 1.06, 0.11]], 0.01, GOLD);

  // bandolier
  const bp: THREE.Vector3[] = [new THREE.Vector3(-0.22, 1.0, 0.1), new THREE.Vector3(0, 0.82, 0.2), new THREE.Vector3(0.2, 0.62, 0.12)];
  b.sweep(bp, 0.03, LEATHER_D, { sides: 6 });
  const Q = (t: number) => {
    const a = lerp3(bp[0], bp[1], t);
    const c = lerp3(bp[1], bp[2], t);
    return lerp3(a, c, t);
  };
  for (const t of [0.14, 0.26, 0.64, 0.76, 0.88]) {
    const p = Q(t);
    cyl([p.x, p.y, p.z + 0.035], 0.017, 0.07, BRASS, [0, 0, 8], 6);
    ball([p.x, p.y + 0.038, p.z + 0.035], [0.015, 0.012, 0.015], "#b8341f", [5, 4]);
  }
  box([0.0, 0.82, 0.215], [0.04, 0.04, 0.012], GOLD);

  // backpack & bedroll
  box([0, 0.82, -0.27], [0.3, 0.32, 0.14], LEATHER);
  box([0, 0.9, -0.345], [0.26, 0.12, 0.014], LEATHER_D);
  box([0, 0.9, -0.355], [0.04, 0.04, 0.012], GOLD);
  cyl([0, 1.03, -0.27], 0.075, 0.4, ROLL, [0, 0, 90], 10);
  for (const x of [-0.1, 0.1]) cyl([x, 1.03, -0.27], 0.078, 0.025, LEATHER_D, [0, 0, 90], 10);
  cyl([0.2, 0.72, -0.3], 0.04, 0.08, STEEL, [0, 0, 0], 8);
  b.rod([0.16, 0.74, -0.3], [0.2, 0.8, -0.3], 0.008, GOLD);
  for (const s of [1, -1]) {
    b.rod([s * 0.15, 0.97, -0.2], [s * 0.15, 0.97, 0.06], 0.022, LEATHER_D, { sides: 4 });
    b.rod([s * 0.1, 0.7, -0.34], [s * 0.1, 0.96, -0.34], 0.012, LEATHER_D, { sides: 4 });
  }

  // belt pouches & horn
  box([0.255, 0.54, 0.05], [0.07, 0.09, 0.11], LEATHER);
  box([0.262, 0.575, 0.05], [0.07, 0.03, 0.12], LEATHER_D);
  studs([[0.292, 0.575, 0.05]], 0.012, GOLD);
  cyl([-0.26, 0.5, -0.04], 0.07, 0.05, "#9a6a38", [0, 0, 90], 10);
  b.rod([-0.28, 0.5, -0.04], [-0.28, 0.5, -0.04], 0.03, GOLD);
  b.spike([0.2, 0.56, 0.14], [0.45, -1, 0.35], 0.2, 0.04, BONE, { sides: 6 });
  cyl([0.2, 0.575, 0.145], 0.045, 0.03, GOLD, [20, 0, -12], 8);
  b.rod([0.2, 0.6, 0.14], [0.05, 0.9, 0.18], 0.007, LEATHER_D);

  // ---------- gun ----------
  const butt = new THREE.Vector3(-0.24, 0.72, 0.28);
  const muzzle = new THREE.Vector3(0.15, 1.0, 0.88);
  const dir = muzzle.clone().sub(butt);
  WOOD_D.copy(dir).normalize();
  const G = (t: number) => butt.clone().addScaledVector(dir, t);
  const WOOD = countershade(grain("#9a6030", "#7a4420", { size: 0.01, axis: WOOD_D, seed: 14 }), "#4a2a12");
  b.rod(G(0), G(0.3), [0.052, 0.032], WOOD);
  b.rod(G(-0.02), G(0.012), 0.058, BRASS);
  ball([G(0.08).x, G(0.08).y + 0.03, G(0.08).z], [0.04, 0.045, 0.07], WOOD, [6, 5]); // cheek rest
  b.rod(G(0.27), G(0.82), [0.032, 0.037], STEEL, { sides: 8 });
  b.rod(G(0.78), G(1.0), [0.037, 0.09], BRASS, { sides: 10 });
  b.rod(G(0.995), G(1.012), 0.075, DARK, { sides: 10 });
  for (const t of [0.4, 0.55, 0.7]) b.rod(G(t - 0.012), G(t + 0.012), 0.044, BRASS, { sides: 8 });
  b.rod(G(0.82), G(0.84), 0.046, GOLD, { sides: 8 });
  // ramrod beneath
  const drop = new THREE.Vector3(0, -0.05, 0);
  b.rod(G(0.3).add(drop), G(0.78).add(drop), 0.01, WOOD);
  for (const t of [0.34, 0.58, 0.74]) b.rod(G(t).add(drop).add(new THREE.Vector3(0, 0.03, 0)), G(t).add(drop), 0.016, BRASS, { sides: 6 });
  // lock
  const lk = G(0.3);
  ball([lk.x - 0.034, lk.y + 0.005, lk.z], [0.012, 0.04, 0.06], BRASS, [6, 5], [-30, 0, 0]);
  b.rod([lk.x - 0.02, lk.y + 0.035, lk.z - 0.04], [lk.x - 0.02, lk.y + 0.085, lk.z - 0.06], 0.012, STEEL, { sides: 5 });
  ball([lk.x - 0.02, lk.y + 0.04, lk.z + 0.03], [0.015, 0.012, 0.025], STEEL, [5, 4]);
  // trigger guard
  b.rod([lk.x, lk.y - 0.04, lk.z - 0.04], [lk.x, lk.y - 0.075, lk.z - 0.01], 0.008, BRASS, { sides: 5 });
  b.rod([lk.x, lk.y - 0.075, lk.z - 0.01], [lk.x, lk.y - 0.075, lk.z + 0.05], 0.008, BRASS, { sides: 5 });
  // stock studs
  studs([0.06, 0.12, 0.18, 0.24].map((t) => { const p = G(t); return [p.x + 0.04, p.y + 0.008, p.z] as N3; }), 0.009, GOLD);
  // muzzle teeth ring
  studs([0.0, 60, 120, 180, 240, 300].map((deg) => {
    const p = G(0.985);
    const a = (deg * Math.PI) / 180;
    return [p.x + Math.cos(a) * 0.085, p.y + Math.sin(a) * 0.085, p.z - 0.01] as N3;
  }), 0.011, GOLD);

  // ---------- arms ----------
  const arm = (shoulder: N3, elbow: N3, hand: THREE.Vector3) => {
    const sh = new THREE.Vector3(...shoulder);
    const el = new THREE.Vector3(...elbow);
    ball(shoulder, [0.12, 0.11, 0.12], CLOTH, [8, 6]);
    b.rod(sh, el, [0.075, 0.065], CLOTH);
    ball(elbow, [0.07, 0.07, 0.07], CLOTH, [7, 5]);
    b.rod(el, hand, [0.062, 0.05], LEATHER);
    b.rod(lerp3(el, hand, 0.45), lerp3(el, hand, 0.9), 0.062, STEEL, { sides: 8 });
    b.rod(lerp3(el, hand, 0.45), lerp3(el, hand, 0.5), 0.066, GOLD, { sides: 8 });
    b.rod(lerp3(el, hand, 0.87), lerp3(el, hand, 0.92), 0.062, GOLD, { sides: 8 });
    ball([hand.x, hand.y, hand.z], [0.06, 0.055, 0.06], SKIN, [7, 5]);
    ball([hand.x, hand.y + 0.05, hand.z - 0.01], [0.022, 0.022, 0.03], SKIN, [5, 4]);
    for (const dz of [-0.03, 0, 0.03]) ball([hand.x + 0.03, hand.y - 0.01, hand.z + dz], [0.02, 0.02, 0.02], SKIN, [5, 4]);
  };
  arm([-0.29, 0.95, 0], [-0.38, 0.7, 0.12], G(0.22));
  arm([0.29, 0.95, 0], [0.28, 0.75, 0.33], G(0.45));

  // pauldrons
  for (const s of [1, -1]) {
    const x = s * 0.31;
    ball([x, 1.0, 0], [0.17, 0.09, 0.16], STEEL, [10, 6], [0, 0, -s * 14]);
    ball([x + s * 0.01, 0.94, 0], [0.16, 0.06, 0.15], STEEL, [10, 5], [0, 0, -s * 22]);
    b.part(new THREE.TorusGeometry(0.16, 0.011, 5, 14), GOLD, { at: [x, 1.005, 0], rotation: [90, 0, -s * 14], scale: [1.04, 1.0, 0.98] });
    b.spike([x + s * 0.02, 1.07, 0], [0, 1, 0], 0.1, 0.03, STEEL, { sides: 6 });
    studs([[x, 1.088, 0.07], [x, 1.088, -0.07], [x + s * 0.12, 1.04, 0], [x - s * 0.1, 1.05, 0.0]], 0.012, GOLD);
  }

  // ---------- head ----------
  const HC: N3 = [0, 1.1, 0.02];
  ball(HC, [0.145, 0.14, 0.14], SKIN, [12, 8]);
  ball([0, 1.08, 0.168], [0.042, 0.037, 0.042], CHEEK, [7, 5]); // nose
  for (const s of [1, -1]) {
    ball([s * 0.055, 1.115, 0.142], [0.024, 0.024, 0.02], "#f3ead8", [7, 5]);
    ball([s * 0.057, 1.113, 0.158], [0.013, 0.014, 0.01], "#2a1a12", [6, 4]);
    ball([s * 0.052, 1.12, 0.166], [0.005, 0.005, 0.004], "#ffffff", [4, 3]);
    b.capsule([s * 0.02, 1.152, 0.15], [s * 0.1, 1.165, 0.12], 0.02, BROW, { sides: 6 });
    ball([s * 0.095, 1.055, 0.12], [0.04, 0.035, 0.03], CHEEK, [6, 4]);
    ball([s * 0.148, 1.1, 0.01], [0.02, 0.045, 0.032], SKIN, [6, 5]);
    b.rod([s * 0.16, 1.07, 0.01], [s * 0.16, 1.055, 0.01], 0.01, GOLD, { sides: 6 });
    // moustache
    b.capsule([s * 0.015, 1.04, 0.158], [s * 0.075, 1.02, 0.152], [0.03, 0.024], BEARD);
    b.capsule([s * 0.075, 1.02, 0.152], [s * 0.125, 1.045, 0.12], [0.024, 0.012], BEARD);
    // sideburns
    ball([s * 0.125, 1.0, 0.07], [0.04, 0.07, 0.05], BEARD, [6, 5]);
    // horn
    b.rod([s * 0.15, 1.24, 0.02], [s * 0.25, 1.27, 0.02], [0.045, 0.032], BONE, { sides: 6 });
    b.spike([s * 0.25, 1.27, 0.02], [s * 0.3, 1.36, 0.02], null, 0.032, BONE, { sides: 6 });
    b.rod([s * 0.15, 1.24, 0.02], [s * 0.16, 1.24, 0.02], 0.05, GOLD, { sides: 8 });
  }
  // helmet
  b.lathe(
    [
      [0, 0],
      [0.155, 0],
      [0.155, 0.02],
      [0.14, 0.09],
      [0.09, 0.14],
      [0, 0.165],
    ],
    { at: [0, 1.17, 0.02], smoothing: 1, segments: 10, color: STEEL },
  );
  b.part(new THREE.TorusGeometry(0.157, 0.013, 5, 14), GOLD, { at: [0, 1.185, 0.02], rotation: [90, 0, 0] });
  b.capsule([0, 1.325, -0.12], [0, 1.35, 0.13], 0.014, GOLD, { sides: 6 });
  box([0, 1.14, 0.168], [0.02, 0.08, 0.012], STEEL);
  studs(
    Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return [Math.sin(a) * 0.158, 1.215, 0.02 + Math.cos(a) * 0.158] as N3;
    }),
    0.009,
    GOLD,
  );
  // hair
  b.capsule([0, 1.09, -0.11], [0, 0.95, -0.18], [0.045, 0.03], BEARD);
  b.rod([0, 1.0, -0.17], [0, 0.99, -0.17], 0.045, GOLD, { sides: 8 });

  // ---------- beard ----------
  ball([0, 1.0, 0.105], [0.135, 0.095, 0.08], BEARD, [10, 6]);
  ball([0, 0.92, 0.13], [0.13, 0.12, 0.085], BEARD, [10, 6]);
  ball([0, 0.82, 0.2], [0.1, 0.15, 0.06], BEARD_D, [8, 6]);
  b.spike([0.0, 0.7, 0.2], [0, -1, 0.1], 0.1, 0.045, BEARD_D, { sides: 6 });
  for (const s of [1, -1]) {
    b.spike([s * 0.1, 0.85, 0.2], [s * 0.5, -1, 0.2], 0.13, 0.035, BEARD, { sides: 6 });
    b.spike([s * 0.05, 0.75, 0.22], [s * 0.2, -1, 0.2], 0.12, 0.03, BEARD_D, { sides: 6 });
    // braid
    for (let k = 0; k < 13; k++) {
      const x = s * 0.078 + (k % 2 ? 0.012 : -0.012);
      const y = 0.97 - 0.034 * k;
      const z = 0.25 - 0.0045 * k;
      const r = 0.031 - 0.0009 * k;
      ball([x, y, z], [r, r * 0.85, r], k % 2 ? BEARD : BEARD_D, [6, 5]);
    }
    for (const k of [3, 8]) b.rod([s * 0.078, 0.97 - 0.034 * k - 0.014, 0.236 - 0.0045 * k], [s * 0.078, 0.97 - 0.034 * k + 0.014, 0.236 - 0.0045 * k], 0.034, GOLD, { sides: 8 });
    b.rod([s * 0.078, 0.545, 0.19], [s * 0.078, 0.56, 0.19], 0.026, GOLD, { sides: 8 });
    b.spike([s * 0.078, 0.55, 0.19], [0, -1, 0], 0.07, 0.022, BEARD, { sides: 6 });
    ball([s * 0.078, 0.475, 0.19], [0.012, 0.012, 0.012], GOLD, [5, 4]);
  }

  return b.root;
}
