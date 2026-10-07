import * as THREE from "three";
import { createBuilder, rng, paint, mottle, grain, stripes } from "../../../../src/index";

export const meta = {
  name: "pirate_treasure_chest",
  description: "Open weathered wooden treasure chest with iron straps, spilling gold, pearls, goblet and gems.",
};

export default function build() {
  const b = createBuilder({ name: "chest" });
  const WOOD = grain(mottle("#4a2e1a", "#352012", { size: 0.12, seed: 3 }), "#2c1a0e", { size: 0.03, axis: "z" });
  const WOOD2 = stripes("#4d3019", "#2e1b0e", { size: 0.16, axis: "y", width: 0.06 });
  const IRON = "#4a4038";
  const RUST = "#7a4426";
  const GOLD = "#e8b72a";
  const GOLD2 = "#c9921a";
  const INSIDE = "#2a1a10";

  const base = b.joint("base", { at: [0, 0, 0] });
  const hingeY = 0.5, hingeZ = -0.3;
  const lid = b.joint("lid", { parent: base, at: [0, hingeY, hingeZ], dir: [0, 0, -1], role: "hinge" });

  // body
  const W = 0.9, D = 0.6, H = 0.5;
  b.part(new THREE.BoxGeometry(W, H - 0.04, D), WOOD, { bone: base, at: [0, 0.02 + (H - 0.04) / 2, 0] });
  // plank grooves on front/back
  for (let i = 1; i < 4; i++) {
    const y = 0.02 + i * 0.115;
    for (const z of [1, -1]) b.part(new THREE.BoxGeometry(W + 0.004, 0.008, 0.008), "#1e1209", { bone: base, at: [0, y, z * (D / 2 + 0.001)] });
  }
  // interior dark rim + loot mound
  b.part(new THREE.BoxGeometry(W - 0.08, 0.02, D - 0.08), INSIDE, { bone: base, at: [0, H - 0.04, 0] });
  // top rim frame
  b.part(new THREE.BoxGeometry(W + 0.02, 0.04, 0.05), WOOD2, { bone: base, at: [0, H - 0.02, D / 2 - 0.025] });
  b.part(new THREE.BoxGeometry(W + 0.02, 0.04, 0.05), WOOD2, { bone: base, at: [0, H - 0.02, -D / 2 + 0.025] });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.05, 0.04, D), WOOD2, { bone: base, at: [s * (W / 2 - 0.025), H - 0.02, 0] });
  // feet
  for (const sx of [1, -1]) for (const sz of [1, -1])
    b.part(new THREE.BoxGeometry(0.09, 0.05, 0.09), "#2a190d", { bone: base, at: [sx * (W / 2 - 0.03), 0.025, sz * (D / 2 - 0.03)] });
  // base iron straps + studs
  for (const x of [-0.3, 0.3]) {
    b.part(new THREE.BoxGeometry(0.075, H, D + 0.016), IRON, { bone: base, at: [x, H / 2, 0] });
    for (const z of [1, -1]) for (const y of [0.1, 0.25, 0.4])
      b.part(new THREE.SphereGeometry(0.014, 6, 4), RUST, { bone: base, at: [x, y, z * (D / 2 + 0.012)] });
  }
  // corner brackets
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, H, 0.03), IRON, { bone: base, at: [sx * (W / 2), H / 2, sz * (D / 2)] });
  }
  // skull carving
  const SK = "#c9b48a", DK = "#140b05";
  const zf = D / 2 + 0.006;
  b.part(new THREE.SphereGeometry(0.045, 8, 6), SK, { bone: base, at: [0, 0.27, zf], scale: [1, 1, 0.25] });
  b.part(new THREE.BoxGeometry(0.05, 0.03, 0.01), SK, { bone: base, at: [0, 0.225, zf] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), DK, { bone: base, at: [s * 0.017, 0.277, zf + 0.012], scale: [1, 1.2, 0.4] });
    for (const r of [1, -1])
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.15, 6), SK, { bone: base, at: [0, 0.255, zf - 0.003], rotation: [0, 0, 90 + r * s * 35] });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), SK, { bone: base, at: [s * 0.065, 0.31, zf] });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), SK, { bone: base, at: [s * 0.065, 0.2, zf] });
  }
  b.part(new THREE.BoxGeometry(0.008, 0.016, 0.01), DK, { bone: base, at: [0, 0.255, zf + 0.011] });
  for (const x of [-0.012, 0, 0.012]) b.part(new THREE.BoxGeometry(0.004, 0.02, 0.01), DK, { bone: base, at: [x, 0.225, zf + 0.006] });

  // lock plate and hasp + padlock hanging loose
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.02), IRON, { bone: base, at: [0, 0.44, zf + 0.004] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 8), "#111", { bone: base, at: [0, 0.42, zf + 0.02], rotation: [90, 0, 0] });
  const lockAt = [0.1, 0.12, D / 2 + 0.03];
  b.part(new THREE.BoxGeometry(0.07, 0.08, 0.035), GOLD2, { bone: base, at: lockAt, rotation: [0, 0, 20] });
  b.part(new THREE.TorusGeometry(0.025, 0.007, 5, 10, Math.PI), IRON, { bone: base, at: [0.1 - 0.015, 0.16, D / 2 + 0.03], rotation: [0, 0, 20] });
  b.part(new THREE.BoxGeometry(0.1, 0.01, 0.008), IRON, { bone: base, at: [0.05, 0.3, D / 2 + 0.02], rotation: [0, 0, -50] });

  // hinges at back
  for (const x of [-0.3, 0.3]) b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8), IRON, { bone: base, at: [x, hingeY, hingeZ - 0.02], rotation: [0, 0, 90] });

  // lid (open: rotated back ~115 deg); built in lid-local frame by placing in model space then posing
  const lr = 0.3;
  const lidGeo = new THREE.CylinderGeometry(lr, lr, W, 10, 1, false, 0, Math.PI);
  // half cylinder: axis along X; arch faces +Y initially
  lidGeo.rotateZ(Math.PI / 2); // axis X
  lidGeo.rotateX(0);
  const lidMesh = (geo: THREE.BufferGeometry, color: any, at: number[], extra: any = {}) =>
    b.part(geo, color, { bone: lid, at: [at[0], hingeY + at[1], hingeZ + at[2]], ...extra });
  // arch: build with lathe-free approach: slabs along arc
  const N = 7;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI, a1 = ((i + 1) / N) * Math.PI;
    const am = (a0 + a1) / 2;
    const cz = D / 2 + 0 - 0; // lid depth
    const rr = D / 2;
    // arc in YZ: angle from front (z+) over top to back
    const y = Math.sin(am) * 0.22, z = Math.cos(am) * rr + D / 2;
    const len = 2 * rr * Math.sin(Math.PI / N / 2) * 1.08;
    b.part(new THREE.BoxGeometry(W, 0.04, len), i % 2 ? WOOD : WOOD2, { bone: lid, at: [0, hingeY + y * 1 + 0.0, hingeZ + z], rotation: [(-am + Math.PI / 2) * 57.3 * 0 + (Math.PI / 2 - am) * 57.3 * 0.0 + (am - Math.PI / 2) * 57.3 * 0.6, 0, 0] });
  }
  // lid end caps
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 3), WOOD2, { bone: lid, at: [s * (W / 2 - 0.015), hingeY + 0.11, hingeZ + D / 2], rotation: [0, 0, 90], scale: [1.5, 1, 3] });
  }
  // lid straps
  for (const x of [-0.3, 0.3]) {
    for (let i = 0; i < N; i++) {
      const am = ((i + 0.5) / N) * Math.PI;
      const y = Math.sin(am) * 0.22, z = Math.cos(am) * (D / 2) + D / 2;
      b.part(new THREE.BoxGeometry(0.075, 0.05, 0.09), IRON, { bone: lid, at: [x, hingeY + y + 0.012, hingeZ + z], rotation: [(am - Math.PI / 2) * 57.3 * 0.6, 0, 0] });
    }
  }
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });
  void lidMesh; void lidGeo;

  // loot mound in chest
  const r = rng(11);
  b.part(new THREE.SphereGeometry(0.3, 8, 5), GOLD2, { bone: base, at: [0, H - 0.08, 0], scale: [1.35, 0.35, 0.85] });
  const coin = new THREE.CylinderGeometry(0.03, 0.03, 0.008, 10);
  const coins: THREE.BufferGeometry[] = [];
  const addCoin = (x: number, y: number, z: number, rx: number, rz: number) => {
    const g = coin.clone();
    g.rotateX(rx); g.rotateZ(rz);
    g.translate(x, y, z);
    coins.push(g);
  };
  for (let i = 0; i < 55; i++) {
    const x = (r() - 0.5) * 0.7, z = (r() - 0.5) * 0.4;
    const y = H - 0.02 + 0.13 * (1 - (x / 0.4) ** 2) * (1 - (z / 0.28) ** 2) + r() * 0.02;
    addCoin(x, y, z, (r() - 0.5) * 0.8, (r() - 0.5) * 0.8);
  }
  // spill over front onto ground
  for (let i = 0; i < 30; i++) {
    const a = r(), x = 0.1 + a * 0.45 + (r() - 0.5) * 0.1, z = D / 2 + 0.05 + r() * 0.4 * (1 - a * 0.3);
    addCoin(x - 0.25, 0.005 + (r() < 0.3 ? 0.009 : 0), z, (r() - 0.5) * 0.1, (r() - 0.5) * 0.1);
  }
  // coins draped over front edge
  for (let i = 0; i < 6; i++) addCoin(-0.2 + i * 0.07, H - 0.05 - i * 0.01, D / 2 + 0.02, 0.9, 0.1);
  const merged = mergeAll(coins);
  b.part(merged, GOLD, { bone: base, at: [0, 0, 0] });

  // pearl necklace draped from chest over front edge
  const PEARL = "#f1ece4";
  const pts: number[][] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = -0.28 - 0.1 + t * 0.45;
    const z = 0.1 + t * 0.55;
    const y = t < 0.4 ? H + 0.02 - t * 0.1 : Math.max(0.012, H - 0.02 - (t - 0.4) * 0.9);
    pts.push([x, y, z + (t > 0.8 ? 0.05 * Math.sin(t * 20) : 0)]);
  }
  const pearls = pts.map(([x, y, z]) => new THREE.SphereGeometry(0.015, 6, 5).translate(x, y, z));
  b.part(mergeAll(pearls), PEARL, { bone: base, at: [0, 0, 0] });

  // goblet on the ground spilled
  const gob = b.lathe(
    [[0, 0], [0.05, 0], [0.05, 0.012], [0.012, 0.03], [0.012, 0.09], [0.05, 0.12], [0.065, 0.2], [0.06, 0.21], [0.045, 0.19], [0, 0.18]],
    { at: [0.12, H + 0.06, -0.08], axis: [0, 1, 0], segments: 10, color: GOLD, bone: base },
  );
  b.part(new THREE.TorusGeometry(0.064, 0.007, 4, 10), "#c0392b", { bone: base, at: [0.12, H + 0.06 + 0.17, -0.08], rotation: [90, 0, 0] });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.part(new THREE.OctahedronGeometry(0.01), i % 2 ? "#e0245e" : "#2ecc71", { bone: base, at: [0.12 + Math.cos(a) * 0.058, H + 0.06 + 0.12, -0.08 + Math.sin(a) * 0.058] });
  }
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 10), "#6b1a1a", { bone: base, at: [0.12, H + 0.06 + 0.195, -0.08] });
  void gob;

  // gems
  const gems: [number, number, number, string, number][] = [
    [-0.2, H + 0.08, 0.05, "#d6123f", 0.035], [-0.05, H + 0.1, 0.12, "#1fbf5a", 0.03],
    [0.28, H + 0.04, 0.15, "#d6123f", 0.028], [-0.35, 0.02, 0.5, "#1fbf5a", 0.03],
    [0.5, 0.02, 0.45, "#d6123f", 0.03], [0.05, 0.02, 0.75, "#1fbf5a", 0.025],
  ];
  for (const [x, y, z, c, s] of gems) b.part(new THREE.OctahedronGeometry(s), c, { bone: base, at: [x, y + s * 0.4, z], rotation: [20, x * 200, 15] });

  return b.root;
}

function mergeAll(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let pos: number[] = [], nor: number[] = [], idx: number[] = [];
  let off = 0;
  for (const g of geos) {
    const p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
    }
    if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + off);
    off += p.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  m.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  m.setIndex(idx);
  return m;
}
