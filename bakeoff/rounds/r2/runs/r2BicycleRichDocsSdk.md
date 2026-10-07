```ts
import * as THREE from "three";
import { createBuilder, paint, mottle, spiral, catmull, polyline, arc } from "agentic-3js-builder";

export const meta = {
  name: "Dutch city bicycle",
  description:
    "Vintage mint-green Dutch step-through bicycle with whitewall tyres, chrome mudguards, chain case, sprung leather saddle, and a wicker basket of sunflowers and a baguette.",
};

const MINT = "#8fd6b8";
const MINT_D = "#6fbf9f";
const CHROME = "#d5dce0";
const STEEL = "#8d979c";
const BLACK = "#222426";
const CREAM = "#f3ead2";
const LEATHER_A = "#6b3f23";
const LEATHER_B = "#58321b";
const RED = "#c9302c";
const YELLOW = "#f6c522";
const ORANGE = "#eea41c";
const GREEN = "#4f8a3a";
const WICK_A = "#c9965b";
const WICK_B = "#b07f46";
const WICK_RIM = "#8f6334";

export default function build() {
  const b = createBuilder({ name: "dutchBike" });

  // ---------- skeleton ----------
  const BB: [number, number, number] = [0, 0.3, -0.04];
  const root = b.joint("frame", { at: BB });
  const HEAD_DIR: [number, number, number] = [0, 0.2, -0.065];
  const steer = b.joint("steer", { parent: root, at: [0, 0.8, 0.44], dir: HEAD_DIR });
  const rearWheel = b.joint("wheelRear", { parent: root, at: [0, 0.35, -0.58], dir: [1, 0, 0], role: "hinge" });
  const frontWheel = b.joint("wheelFront", { parent: steer, at: [0, 0.35, 0.585], dir: [1, 0, 0], role: "hinge" });
  const crank = b.joint("crank", { parent: root, at: BB, dir: [1, 0, 0], role: "hinge" });
  const basket = b.joint("basket", { parent: steer, at: [0, 0.98, 0.6], dir: [0, 1, 0] });

  const cap = (a: any, c: any, r: number, color: any, bone: any) => b.capsule(a, c, r, { color, bone });

  // ---------- wheels ----------
  const wheel = (W: any, cy: number, cz: number) => {
    const tirePaint = paint((p, n) => {
      const rad = Math.hypot(p.y - cy, p.z - cz);
      if (Math.abs(n.x) > 0.5 && rad > 0.296 && rad < 0.333) return CREAM;
      return BLACK;
    });
    b.part(new THREE.TorusGeometry(0.32, 0.03, 12, 32), tirePaint, {
      at: [0, cy, cz], dir: [1, 0, 0], axis: "z", bone: W, flat: true,
    });
    b.part(new THREE.TorusGeometry(0.285, 0.012, 5, 32), CHROME, { at: [0, cy, cz], dir: [1, 0, 0], axis: "z", bone: W, flat: true });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 10), CHROME, { at: [0, cy, cz], dir: [1, 0, 0], bone: W });
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.008, 12), STEEL, { at: [s * 0.03, cy, cz], dir: [1, 0, 0], bone: W });
    for (const s of [1, -1]) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + (s > 0 ? 0 : Math.PI / 16);
        const off = (i % 2 ? 0.5 : -0.5);
        const rim: [number, number, number] = [s * 0.004, cy + 0.283 * Math.cos(a), cz + 0.283 * Math.sin(a)];
        const hub: [number, number, number] = [s * 0.03, cy + 0.032 * Math.cos(a + off), cz + 0.032 * Math.sin(a + off)];
        b.rod(hub, rim, 0.0023, { color: STEEL, bone: W, sides: 4 });
      }
    }
  };
  wheel(rearWheel, 0.35, -0.58);
  wheel(frontWheel, 0.35, 0.585);

  // ---------- frame ----------
  const FR = 0.017;
  cap(BB, [0, 0.9, -0.22], FR, MINT, root); // seat tube
  b.sweep(
    catmull([[0, 0.9, 0.41], [0, 0.66, 0.34], [0, 0.45, 0.15], [0, 0.31, -0.03]]),
    0.021, { color: MINT, bone: root },
  ); // swooping step-through tube
  for (const s of [1, -1]) {
    cap([s * 0.04, 0.3, -0.04], [s * 0.075, 0.35, -0.58], 0.013, MINT, root); // chainstay
    cap([s * 0.02, 0.8, -0.19], [s * 0.075, 0.35, -0.58], 0.011, MINT, root); // seatstay
  }
  // head tube
  b.rod([0, 0.8, 0.44], [0, 1.0, 0.375], 0.026, { color: MINT, bone: root, sides: 10 });
  for (const y of [0.8, 1.0])
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 10), CHROME, {
      at: y < 0.9 ? [0, 0.8, 0.44] : [0, 1.0, 0.375], dir: HEAD_DIR, bone: root,
    });
  // bottom bracket shell
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 10), STEEL, { at: BB, dir: [1, 0, 0], bone: root });

  // ---------- fork & steering ----------
  for (const s of [1, -1]) cap([s * 0.06, 0.775, 0.445], [s * 0.06, 0.35, 0.585], 0.013, MINT, steer);
  b.rod([-0.06, 0.775, 0.445], [0.06, 0.775, 0.445], 0.016, { color: MINT, bone: steer });
  b.rod([-0.075, 0.35, 0.585], [0.075, 0.35, 0.585], 0.008, { color: STEEL, bone: steer });
  cap([0, 0.98, 0.38], [0, 1.115, 0.335], 0.013, CHROME, steer); // stem

  for (const s of [1, -1]) {
    const bar = catmull([
      [0, 1.12, 0.335], [s * 0.18, 1.125, 0.34], [s * 0.33, 1.12, 0.27], [s * 0.385, 1.1, 0.14], [s * 0.375, 1.08, 0.02],
    ]);
    b.sweep(bar, 0.012, { color: CHROME, bone: steer });
    b.sweep(bar.slice(0.74, 1), 0.021, { color: CREAM, bone: steer, caps: "flat" });
    // grip end plug
    const e = bar.at(1);
    b.part(new THREE.SphereGeometry(0.02, 8, 5), CREAM, { at: [e.x, e.y, e.z], bone: steer });
    // grip rings
    const g = bar.at(0.74);
    b.part(new THREE.SphereGeometry(0.023, 8, 5), STEEL, { at: [g.x, g.y, g.z], bone: steer, scale: [1, 0.6, 1] });
    // brake lever
    const l = bar.at(0.66);
    b.rod([l.x, l.y - 0.01, l.z], [l.x - s * 0.01, l.y - 0.05, l.z + 0.1], 0.006, { color: BLACK, bone: steer });
  }
  // bell
  b.part(new THREE.CylinderGeometry(0.03, 0.032, 0.02, 10), CHROME, { at: [0.11, 1.147, 0.337], bone: steer });
  b.part(new THREE.SphereGeometry(0.038, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), CHROME, { at: [0.11, 1.157, 0.337], bone: steer, flat: true });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), STEEL, { at: [0.11, 1.197, 0.337], bone: steer });
  b.part(new THREE.BoxGeometry(0.012, 0.012, 0.04), STEEL, { at: [0.11, 1.15, 0.37], bone: steer });

  // ---------- mudguards ----------
  const fenderR = 0.38;
  const fenderPath = (cy: number, cz: number, from: number, sweepDeg: number) => {
    const a = (from * Math.PI) / 180;
    return arc([0, cy, cz], [0, cy + fenderR * Math.cos(a), cz + fenderR * Math.sin(a)], [1, 0, 0], sweepDeg);
  };
  b.sweep(fenderPath(0.35, 0.585, -50, 150), () => [0.05, 0.005], { section: "box", color: CHROME, bone: steer, caps: "flat" });
  b.sweep(fenderPath(0.35, -0.58, -105, 140), () => [0.05, 0.005], { section: "box", color: CHROME, bone: root, caps: "flat" });
  for (const s of [1, -1]) {
    cap([s * 0.05, 0.284, 0.955], [s * 0.055, 0.35, 0.585], 0.005, CHROME, steer);
    cap([s * 0.05, 0.252, -0.947], [s * 0.055, 0.35, -0.58], 0.005, CHROME, root);
    cap([s * 0.05, 0.55, 0.98 - 0.4], [s * 0.06, 0.78, 0.45], 0.004, CHROME, steer);
  }
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 10), RED, { at: [0, 0.285, -0.962], dir: [0, 0, 1], bone: root });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 10), CREAM, { at: [0, 0.285, 0.968], dir: [0, 0, 1], bone: steer });

  // ---------- drivetrain, chain case, pedals ----------
  const chaincase = b.extrude(
    [
      [-0.6, 0.05], [-0.57, 0.105], [-0.5, 0.115], [-0.1, 0.14], [0.04, 0.15], [0.11, 0.11], [0.145, 0],
      [0.11, -0.11], [0.0, -0.15], [-0.1, -0.12], [-0.4, -0.01], [-0.54, -0.015], [-0.59, 0.0],
    ],
    { at: [-0.095, 0.3, -0.04], thickness: 0.045, bevel: 0.008, smoothing: 1, color: MINT_D, bone: root },
  );
  void chaincase;
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 12), CHROME, { at: [-0.122, 0.3, -0.04], dir: [1, 0, 0], bone: root });
  b.rod([-0.1, 0.3, -0.04], [0.1, 0.3, -0.04], 0.01, { color: STEEL, bone: crank });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.006, 16), STEEL, { at: [0.045, 0.3, -0.04], dir: [1, 0, 0], bone: crank });
  const armL: [number, number, number] = [0.085, 0.14, -0.04];
  const armR: [number, number, number] = [-0.14, 0.46, -0.04];
  b.rod([0.085, 0.3, -0.04], armL, [0.014, 0.01], { color: CHROME, bone: crank });
  b.rod([-0.14, 0.3, -0.04], armR, [0.014, 0.01], { color: CHROME, bone: crank });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.075), BLACK, { at: [0.15, 0.14, -0.04], bone: crank });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.075), BLACK, { at: [-0.2, 0.46, -0.04], bone: crank });
  b.rod([0.085, 0.14, -0.04], [0.17, 0.14, -0.04], 0.006, { color: STEEL, bone: crank });
  b.rod([-0.14, 0.46, -0.04], [-0.22, 0.46, -0.04], 0.006, { color: STEEL, bone: crank });

  // ---------- saddle ----------
  b.rod([0, 0.88, -0.215], [0, 0.945, -0.235], 0.013, { color: CHROME, bone: root });
  b.part(new THREE.BoxGeometry(0.05, 0.025, 0.04), CHROME, { at: [0, 0.945, -0.235], bone: root });
  b.loft(
    [
      { at: [0, 1.0, -0.37], w: 0.22, h: 0.06 },
      { at: [0, 1.0, -0.28], w: 0.23, h: 0.07 },
      { at: [0, 1.005, -0.18], w: 0.15, h: 0.065 },
      { at: [0, 1.015, -0.08], w: 0.05, h: 0.05 },
    ],
    { color: mottle(LEATHER_A, LEATHER_B, { size: 0.05 }), bone: root, sides: 10 } as any,
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.03, 0.96, -0.1], [s * 0.07, 0.955, -0.31], 0.005, { color: CHROME, bone: root });
    const spr = spiral([s * 0.07, 0.9, -0.31], [s * 0.07 + 0.03, 0.9, -0.31], [0, 1, 0], { turns: 5, r1: 0.03, pitch: 0.012 });
    b.sweep(spr, 0.0035, { color: CHROME, bone: root, sides: 4 });
    // rivets
    b.part(new THREE.SphereGeometry(0.008, 6, 4), CHROME, { at: [s * 0.1, 1.012, -0.3], bone: root });
  }
  b.rod([-0.07, 0.9, -0.31], [0.07, 0.9, -0.31], 0.005, { color: CHROME, bone: root });
  b.rod([0, 0.9, -0.31], [0, 0.93, -0.24], 0.005, { color: CHROME, bone: root });

  // ---------- rear rack & lock ----------
  for (const s of [1, -1]) {
    b.rod([s * 0.06, 0.8, -0.3], [s * 0.06, 0.8, -0.8], 0.005, { color: CHROME, bone: root });
    cap([s * 0.06, 0.8, -0.8], [s * 0.075, 0.35, -0.58], 0.005, CHROME, root);
    b.rod([s * 0.06, 0.8, -0.3], [s * 0.03, 0.78, -0.2], 0.005, { color: CHROME, bone: root });
  }
  for (let i = 0; i < 5; i++)
    b.rod([-0.06, 0.8, -0.36 - i * 0.1], [0.06, 0.8, -0.36 - i * 0.1], 0.004, { color: CHROME, bone: root });
  b.part(new THREE.BoxGeometry(0.05, 0.045, 0.07), BLACK, { at: [0, 0.69, -0.33], bone: root });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 8), CHROME, { at: [0.027, 0.69, -0.33], dir: [1, 0, 0], bone: root });

  // kickstand
  b.rod([0.07, 0.325, -0.3], [0.11, 0.015, -0.34], 0.007, { color: BLACK, bone: root });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.05), BLACK, { at: [0.11, 0.006, -0.34], bone: root });

  // ---------- basket ----------
  const weave = paint((p) => ((Math.floor(p.y / 0.022) + Math.floor((p.x + p.z) / 0.022)) & 1 ? WICK_A : WICK_B));
  const bz = 0.6, by = 0.98;
  const wall = (w: number, h: number, d: number, at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), weave, { at, bone: basket });
  wall(0.38, 0.24, 0.012, [0, by, bz + 0.14]);
  wall(0.38, 0.24, 0.012, [0, by, bz - 0.14]);
  wall(0.012, 0.24, 0.28, [0.19, by, bz]);
  wall(0.012, 0.24, 0.28, [-0.19, by, bz]);
  wall(0.38, 0.012, 0.28, [0, by - 0.115, bz]);
  b.sweep(
    polyline([[-0.19, 1.1, bz - 0.14], [0.19, 1.1, bz - 0.14], [0.19, 1.1, bz + 0.14], [-0.19, 1.1, bz + 0.14]], { closed: true }),
    0.012, { color: WICK_RIM, bone: basket, sides: 6 },
  );
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.19, 1.09, bz - 0.09], [s * 0.2, 1.2, bz - 0.07], [s * 0.2, 1.2, bz + 0.07], [s * 0.19, 1.09, bz + 0.09]]), 0.008, {
      color: WICK_RIM, bone: basket, sides: 6,
    });
    cap([s * 0.1, 0.865, 0.52], [s * 0.07, 0.35, 0.585], 0.006, CHROME, steer);
  }
  b.rod([-0.1, 0.865, 0.52], [0.1, 0.865, 0.52], 0.006, { color: CHROME, bone: basket });
  b.rod([0, 0.865, 0.5], [0, 0.99, 0.4], 0.008, { color: CHROME, bone: steer });
  // gingham cloth
  const gingham = paint((p) => {
    const a = Math.floor(p.x / 0.03) & 1, c = Math.floor(p.z / 0.03) & 1;
    return a && c ? RED : a || c ? "#ee9a98" : "#fbf6f0";
  });
  b.part(new THREE.BoxGeometry(0.37, 0.012, 0.27), gingham, { at: [0, 1.02, bz], bone: basket });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.1, 0.1, 0.012), gingham, { at: [s * 0.1, 1.08, bz + 0.15], bone: basket, rotation: [-12, 0, 0] });

  // sunflowers
  const flowers = [
    { pos: [-0.12, 1.33, 0.7], dir: [-0.2, 0.3, 1], size: 0.05 },
    { pos: [0.08, 1.4, 0.7], dir: [0.15, 0.25, 1], size: 0.055 },
    { pos: [-0.04, 1.26, 0.78], dir: [0, 0.1, 1], size: 0.045 },
    { pos: [-0.2, 1.24, 0.6], dir: [-0.8, 0.3, 0.7], size: 0.045 },
    { pos: [-0.03, 1.5, 0.62], dir: [0, 0.6, 1], size: 0.05 },
  ];
  for (const f of flowers) {
    const pos = new THREE.Vector3(...(f.pos as [number, number, number]));
    const d = new THREE.Vector3(...(f.dir as [number, number, number])).normalize();
    const base = new THREE.Vector3(f.pos[0] * 0.4, 1.0, bz + (f.pos[2] - bz) * 0.3);
    const neck = pos.clone().addScaledVector(d, -0.012);
    cap(base, neck, 0.008, GREEN, basket);
    const mid = base.clone().lerp(neck, 0.45);
    const sx = f.pos[0] < 0 ? -1 : 1;
    b.spike(mid, [mid.x + sx * 0.08, mid.y + 0.03, mid.z + 0.02], null, 0.022, { color: GREEN, bone: basket });
    // head
    b.part(new THREE.CylinderGeometry(f.size * 0.95, f.size * 0.95, 0.022, 10), paint_center(), { at: pos, dir: d.toArray(), bone: basket });
    const u = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0));
    if (u.lengthSq() < 0.01) u.set(1, 0, 0);
    u.normalize();
    const v = new THREE.Vector3().crossVectors(d, u).normalize();
    for (let layer = 0; layer < 2; layer++) {
      const n = 13;
      for (let i = 0; i < n; i++) {
        const a = ((i + layer * 0.5) / n) * Math.PI * 2;
        const out = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a));
        const bp = pos.clone().addScaledVector(out, f.size * (0.85 - layer * 0.08)).addScaledVector(d, -0.004 * layer);
        const dirp = out.clone().multiplyScalar(0.85).addScaledVector(d, layer ? 0.45 : 0.2).normalize();
        b.spike(bp, dirp.toArray(), f.size * (1.0 - layer * 0.12), 0.012, { color: layer ? ORANGE : YELLOW, bone: basket, sides: 4 });
      }
    }
  }
  function paint_center() {
    return mottle("#4a2c12", "#2d1a0a", { size: 0.015 });
  }

  // baguette
  const baguetteColor = paint((p) => {
    const t = p.y * 18 + p.z * 4;
    return (t - Math.floor(t)) < 0.22 ? "#ecc780" : "#d49a45";
  });
  b.capsule([0.1, 0.92, 0.7], [0.17, 1.37, 0.48], [0.032, 0.032], { color: baguetteColor, bone: basket, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.07, 8), CREAM, { at: [0.115, 1.09, 0.63], dir: [0.07, 0.45, -0.22], bone: basket });

  return b.root;
}
```