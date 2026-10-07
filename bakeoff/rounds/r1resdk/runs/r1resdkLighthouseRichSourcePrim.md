```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Island Diorama",
  description:
    "A cozy diorama on a round wooden base: a striped lighthouse with a glowing lantern and iron balcony, a keeper's cottage with a crooked chimney and blue door, a jetty with a tied rowboat, two seagulls, grass tufts, wildflowers, rocks and foamy turquoise water.",
};

const D = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "lighthouse_island" });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(7);

  type V = [number, number, number];

  // Placer: positions and rotations are local to an origin and a yaw.
  function placer(origin: V, yaw: number) {
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * D);
    const o = new THREE.Vector3(...origin);
    const pt = (pos: V) => new THREE.Vector3(...pos).applyQuaternion(q).add(o);
    const put = (
      geo: THREE.BufferGeometry,
      color: string,
      pos: V = [0, 0, 0],
      rot: V = [0, 0, 0],
      opts: { scale?: V; bone?: any; flat?: boolean; name?: string } = {},
    ) => {
      const lq = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D));
      return b.part(geo, color, { at: pt(pos), quat: q.clone().multiply(lq), ...opts });
    };
    return { put, pt, q };
  }
  const W = placer([0, 0, 0], 0);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, ws = 8, hs = 6) => new THREE.SphereGeometry(r, ws, hs);

  // ---------- Base, water, island ----------
  W.put(cyl(0.72, 0.74, 0.07, 28), "#6b4426", [0, 0.035, 0]);
  W.put(new THREE.TorusGeometry(0.72, 0.01, 5, 40), "#d6a437", [0, 0.07, 0], [90, 0, 0]);
  W.put(cyl(0.68, 0.68, 0.05, 28), "#2fb8c4", [0, 0.095, 0]);
  W.put(cyl(0.5, 0.5, 0.004, 24), "#3fcad0", [0, 0.121, 0]);
  for (const r of [0.47, 0.57, 0.63])
    W.put(new THREE.TorusGeometry(r, 0.004, 4, 40), "#8fe6e6", [0, 0.123, 0], [90, 0, 0]);

  W.put(cyl(0.33, 0.38, 0.09, 9), "#6f7479", [0, 0.145, 0], [0, 10, 0], { flat: true });
  W.put(cyl(0.29, 0.33, 0.05, 9), "#868b90", [0, 0.215, 0], [0, 25, 0], { flat: true });
  W.put(cyl(0.27, 0.29, 0.03, 10), "#5fae45", [0, 0.255, 0], [0, 0, 0], { flat: true });
  const TOP = 0.27;

  // Rocks around the shore
  const rockCols = ["#5d6368", "#7a8086", "#4c5156"];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rand() * 0.3;
    const r = 0.31 + rand() * 0.07;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (x > -0.28 && x < -0.12 && z > 0.18) continue;
    const s = 0.035 + rand() * 0.04;
    W.put(new THREE.IcosahedronGeometry(1, 0), rockCols[i % 3], [x, 0.14 + rand() * 0.06, z], [rand() * 60, rand() * 360, rand() * 40], {
      scale: [s * 1.3, s, s * 1.1],
      flat: true,
    });
  }
  // foam
  W.put(new THREE.TorusGeometry(0.385, 0.014, 5, 32), "#ffffff", [0, 0.125, 0], [90, 0, 0]);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + rand() * 0.2;
    const r = 0.39 + rand() * 0.06;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (x > -0.27 && x < -0.13 && z > 0.2) continue;
    const s = 0.016 + rand() * 0.016;
    W.put(sph(1, 6, 4), i % 3 ? "#ffffff" : "#e6fbfb", [x, 0.126, z], [0, a / D, 0], { scale: [s * 1.6, s * 0.4, s] });
  }

  // ---------- Lighthouse ----------
  const LX = -0.06, LZ = -0.05;
  const L = placer([LX, 0, LZ], 0);
  L.put(cyl(0.092, 0.1, 0.03, 12), "#7b8085", [0, TOP + 0.015, 0]);
  const y0 = TOP + 0.03;
  const sh = 0.11;
  const rAt = (y: number) => 0.07 - (0.02 * (y - y0)) / (sh * 5);
  for (let i = 0; i < 5; i++) {
    const ya = y0 + i * sh;
    L.put(cyl(rAt(ya + sh), rAt(ya), sh, 12), i % 2 ? "#f4f1ea" : "#d0352c", [0, ya + sh / 2, 0]);
  }
  const topY = y0 + sh * 5;
  // door and windows
  L.put(box(0.034, 0.05, 0.012), "#3b2a1c", [0, y0 + 0.025, rAt(y0) - 0.001 + 0.003]);
  L.put(cyl(0.017, 0.017, 0.012, 8), "#3b2a1c", [0, y0 + 0.05, rAt(y0) + 0.002], [90, 0, 0]);
  for (const i of [1, 3]) {
    const wy = y0 + i * sh + sh / 2;
    L.put(box(0.022, 0.03, 0.01), "#ffe08a", [0, wy, rAt(wy) + 0.0005]);
    L.put(box(0.003, 0.03, 0.012), "#3b2a1c", [0, wy, rAt(wy) + 0.0008]);
    L.put(box(0.022, 0.003, 0.012), "#3b2a1c", [0, wy, rAt(wy) + 0.0008]);
  }
  // gallery
  L.put(cyl(0.094, 0.082, 0.012, 14), "#25272b", [0, topY + 0.006, 0]);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 360;
    L.put(box(0.004, 0.036, 0.004), "#25272b", [Math.sin(a * D) * 0.09, topY + 0.03, Math.cos(a * D) * 0.09]);
  }
  L.put(new THREE.TorusGeometry(0.09, 0.004, 4, 20), "#25272b", [0, topY + 0.048, 0], [90, 0, 0]);
  L.put(new THREE.TorusGeometry(0.09, 0.003, 4, 20), "#25272b", [0, topY + 0.028, 0], [90, 0, 0]);
  // lantern room
  const ly = topY + 0.012;
  L.put(cyl(0.048, 0.052, 0.01, 10), "#25272b", [0, ly + 0.005, 0]);
  L.put(cyl(0.044, 0.044, 0.062, 8), "#ffe27a", [0, ly + 0.041, 0]);
  L.put(sph(0.026, 8, 6), "#fff8cf", [0, ly + 0.041, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 360 + 22.5;
    L.put(box(0.005, 0.064, 0.005), "#25272b", [Math.sin(a * D) * 0.045, ly + 0.041, Math.cos(a * D) * 0.045]);
  }
  L.put(cyl(0.05, 0.048, 0.008, 10), "#25272b", [0, ly + 0.076, 0]);
  L.put(new THREE.ConeGeometry(0.058, 0.05, 10), "#d0352c", [0, ly + 0.105, 0]);
  L.put(sph(0.009, 6, 5), "#25272b", [0, ly + 0.134, 0]);
  L.put(cyl(0.0015, 0.0015, 0.03, 4), "#25272b", [0, ly + 0.15, 0]);

  // ---------- Cottage ----------
  const C = placer([0.2, TOP, 0.08], 20);
  const xd = new THREE.Vector3(1, 0, 0).applyQuaternion(C.q);
  C.put(box(0.215, 0.016, 0.165), "#8a8f93", [0, 0.006, 0]);
  C.put(box(0.2, 0.11, 0.15), "#f2e6c9", [0, 0.055, 0]);
  b.extrude(
    [[-0.125, 0], [0.125, 0], [0, 0.075]],
    { color: "#8a3b2a", at: C.pt([0, 0.11, 0]), x: xd, y: [0, 1, 0], thickness: 0.19 },
  );
  b.extrude(
    [[-0.1, 0], [0.1, 0], [0, 0.06]],
    { color: "#f2e6c9", at: C.pt([0, 0.11, 0]), x: xd, y: [0, 1, 0], thickness: 0.2 },
  );
  C.put(box(0.008, 0.008, 0.2), "#6e2c20", [0, 0.186, 0]);
  // roof tiles lines
  for (const s of [-1, 1])
    for (let k = 0; k < 3; k++)
      C.put(box(0.07, 0.003, 0.192), "#74301f", [s * (0.032 + k * 0.032) * 1.0, 0.11 + 0.075 * (1 - (0.032 + k * 0.032) / 0.125) + 0.0, 0], [0, 0, -s * 31]);
  // chimney, crooked
  C.put(box(0.036, 0.075, 0.036), "#a8503a", [0.06, 0.2, -0.035], [0, 0, -6]);
  C.put(box(0.038, 0.006, 0.038), "#d9c9a8", [0.0625, 0.215, -0.035], [0, 0, -6]);
  C.put(box(0.046, 0.012, 0.046), "#7b3a2a", [0.067, 0.243, -0.035], [0, 0, -12]);
  for (let k = 0; k < 3; k++) {
    const s = 0.012 + k * 0.007;
    C.put(sph(s, 6, 5), "#e8eaee", [0.075 + k * 0.014, 0.27 + k * 0.026, -0.035], [0, 0, 0], {});
  }
  // door
  C.put(box(0.05, 0.074, 0.008), "#ffffff", [0, 0.045, 0.0755]);
  C.put(box(0.04, 0.066, 0.01), "#2a62c9", [0, 0.041, 0.078]);
  C.put(sph(0.004, 5, 4), "#e6b43c", [0.013, 0.04, 0.0845]);
  C.put(box(0.06, 0.006, 0.03), "#9a9fa3", [0, 0.014, 0.092]);
  // windows
  const win = (px: number, pz: number, ry: number) => {
    C.put(box(0.04, 0.036, 0.008), "#ffffff", [px, 0.065, pz], [0, ry, 0]);
    C.put(box(0.032, 0.028, 0.01), "#ffd36b", [px, 0.065, pz], [0, ry, 0]);
    C.put(box(0.003, 0.03, 0.012), "#ffffff", [px, 0.065, pz], [0, ry, 0]);
    C.put(box(0.034, 0.003, 0.012), "#ffffff", [px, 0.065, pz], [0, ry, 0]);
  };
  win(-0.065, 0.0755, 0);
  win(0.065, 0.0755, 0);
  win(0.1005, 0.0, 90);
  win(-0.1005, 0.0, 90);
  // flowerbox
  C.put(box(0.046, 0.014, 0.014), "#7a4a2a", [-0.065, 0.032, 0.086]);
  const fc = ["#ff6fa1", "#ffd84a", "#ffffff"];
  for (let k = 0; k < 3; k++) C.put(sph(0.007, 5, 4), fc[k], [-0.08 + k * 0.015, 0.045, 0.088]);
  // path stones
  for (let k = 0; k < 5; k++)
    C.put(cyl(0.013, 0.014, 0.004, 6), k % 2 ? "#a9aeb2" : "#8f949a", [-0.01 * k + 0.01, 0.002 + 0.012, 0.115 + k * 0.03], [0, k * 20, 0]);

  // ---------- Jetty ----------
  const JX = -0.2;
  const J = placer([JX, 0, 0], 0);
  for (let k = 0; k < 11; k++)
    J.put(box(0.115, 0.012, 0.03), k % 2 ? "#a47a4a" : "#8f6a3d", [0, 0.2, 0.28 + k * 0.032 + (k % 3) * 0.0005]);
  for (const s of [-1, 1]) J.put(box(0.01, 0.012, 0.37), "#6b4a2a", [s * 0.045, 0.188, 0.465]);
  for (const z of [0.38, 0.5, 0.62])
    for (const s of [-1, 1]) {
      J.put(cyl(0.008, 0.009, 0.15, 6), "#5a3d22", [s * 0.06, 0.15, z]);
      J.put(cyl(0.009, 0.009, 0.006, 6), "#7b5632", [s * 0.06, 0.228, z]);
    }
  // lantern hook post decor: little barrel
  J.put(cyl(0.012, 0.012, 0.025, 8), "#7a4a2a", [0.035, 0.2185 + 0.0125, 0.34]);
  J.put(new THREE.TorusGeometry(0.012, 0.0015, 3, 8), "#2b2f36", [0.035, 0.226, 0.34], [90, 0, 0]);

  // ---------- Rowboat ----------
  const BX = -0.32;
  b.loft(
    [
      { at: [BX, 0.136, 0.4], w: 0.05, h: 0.034 },
      { at: [BX, 0.134, 0.44], w: 0.07, h: 0.036 },
      { at: [BX, 0.133, 0.49], w: 0.08, h: 0.036 },
      { at: [BX, 0.135, 0.55], w: 0.062, h: 0.036 },
      { at: [BX, 0.14, 0.6], w: 0.014, h: 0.034 },
    ],
    { color: "#b3452e", sides: 8, caps: "round", name: "hull" },
  );
  const BT = placer([BX, 0, 0], 0);
  BT.put(box(0.052, 0.004, 0.13), "#c9a273", [0, 0.153, 0.5]);
  BT.put(box(0.07, 0.006, 0.014), "#a47a4a", [0, 0.158, 0.46]);
  BT.put(box(0.06, 0.006, 0.014), "#a47a4a", [0, 0.158, 0.54]);
  BT.put(box(0.006, 0.006, 0.12), "#f4f1ea", [0.042, 0.153, 0.5], [0, 0, 0]);
  b.rod([BX - 0.02, 0.165, 0.47], [BX - 0.12, 0.185, 0.43], 0.0025, { color: "#8f6a3d", name: "oar" });
  BT.put(box(0.012, 0.003, 0.03), "#8f6a3d", [-0.145, 0.19, 0.42]);
  // rope
  b.rod([JX - 0.06, 0.226, 0.38], [BX + 0.01, 0.152, 0.6], 0.0022, { color: "#d9bb82", name: "rope" });
  b.rod([BX + 0.01, 0.152, 0.6], [BX + 0.012, 0.15, 0.608], 0.003, { color: "#d9bb82" });

  // ---------- Grass tufts and wildflowers ----------
  const greens = ["#4e9a3a", "#6cbf4a", "#3f8a3a"];
  const nearBuilding = (x: number, z: number, pad = 0) =>
    Math.hypot(x - LX, z - LZ) < 0.11 + pad || Math.hypot(x - 0.2, z - 0.08) < 0.16 + pad;
  let placed = 0;
  while (placed < 24) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.26;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (nearBuilding(x, z)) { placed++; continue; }
    for (let k = 0; k < 4; k++) {
      const h = 0.03 + rand() * 0.025;
      W.put(new THREE.ConeGeometry(0.006, h, 3), greens[(placed + k) % 3], [x + (rand() - 0.5) * 0.015, TOP + h / 2 - 0.004, z + (rand() - 0.5) * 0.015], [(rand() - 0.5) * 40, rand() * 180, (rand() - 0.5) * 40]);
    }
    placed++;
  }
  const petals = ["#ff6fa1", "#ffd84a", "#ffffff", "#b58cff", "#ff8a3c"];
  let f = 0, tries = 0;
  while (f < 16 && tries < 200) {
    tries++;
    const a = rand() * Math.PI * 2;
    const r = 0.1 + rand() * 0.17;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (nearBuilding(x, z, 0.015)) continue;
    const h = 0.03 + rand() * 0.02;
    W.put(cyl(0.0015, 0.0015, h, 4), "#3f8a3a", [x, TOP + h / 2 - 0.003, z]);
    W.put(sph(0.0085, 5, 4), petals[f % 5], [x, TOP + h, z], [0, 0, 0], { scale: [1, 0.7, 1] });
    W.put(sph(0.0035, 4, 3), "#f6c231", [x, TOP + h + 0.004, z]);
    f++;
  }
  // grass-side rocks on top
  W.put(new THREE.IcosahedronGeometry(1, 0), "#7a8086", [0.02, TOP + 0.005, 0.18], [0, 30, 0], { scale: [0.03, 0.022, 0.026], flat: true });
  W.put(new THREE.IcosahedronGeometry(1, 0), "#5d6368", [-0.2, TOP + 0.006, -0.12], [0, 70, 0], { scale: [0.035, 0.026, 0.03], flat: true });

  // ---------- Seagulls ----------
  function gull(name: string, origin: V, yaw: number, fly: boolean) {
    const G = placer(origin, yaw);
    const by = fly ? 0 : 0.05;
    const body = b.joint(name + "Body", { parent: "root", at: G.pt([0, by, 0]), role: "spine" });
    const head = b.joint(name + "Head", { parent: body, at: G.pt([0, by + 0.035, 0.04]), role: "head" });
    const jaw = b.joint(name + "Jaw", { parent: head, at: G.pt([0, by + 0.031, 0.056]), role: "jaw" });
    const wL = b.joint(name + "WingL", { parent: body, at: G.pt([0.025, by + 0.015, 0]), role: "wing" });
    const wR = b.joint(name + "WingR", { parent: body, at: G.pt([-0.025, by + 0.015, 0]), role: "wing" });
    G.put(sph(0.5, 8, 6), "#f6f6f2", [0, by, 0], [0, 0, 0], { scale: [0.064, 0.056, 0.125], bone: body });
    G.put(box(0.03, 0.006, 0.04), "#f6f6f2", [0, by + 0.005, -0.075], [-12, 0, 0], { bone: body });
    G.put(box(0.03, 0.002, 0.012), "#2b2f36", [0, by + 0.0065, -0.092], [-12, 0, 0], { bone: body });
    G.put(sph(0.021, 8, 6), "#f6f6f2", [0, by + 0.04, 0.045], [0, 0, 0], { bone: head });
    G.put(new THREE.ConeGeometry(0.008, 0.034, 4), "#f2a81d", [0, by + 0.034, 0.078], [90, 0, 0], { bone: head });
    G.put(new THREE.ConeGeometry(0.0065, 0.028, 4), "#d98a10", [0, by + 0.028, 0.074], [90, 0, 0], { bone: jaw });
    G.put(sph(0.0025, 4, 3), "#d6342c", [0, by + 0.0325, 0.088], [0, 0, 0], { bone: head });
    for (const s of [-1, 1]) G.put(sph(0.0035, 4, 3), "#16181c", [s * 0.013, by + 0.046, 0.058], [0, 0, 0], { bone: head });
    if (!fly) {
      for (const s of [-1, 1]) {
        b.rod(G.pt([s * 0.012, 0.05, 0]), G.pt([s * 0.012, 0.003, 0.004]), 0.0022, { color: "#f2a81d", bone: body });
        G.put(box(0.014, 0.003, 0.022), "#f2a81d", [s * 0.012, 0.0015, 0.012], [0, 0, 0], { bone: body });
        const j = s > 0 ? wL : wR;
        G.put(box(0.008, 0.034, 0.09), "#aab4bd", [s * 0.034, by + 0.008, -0.008], [-6, 0, -s * 6], { bone: j });
        G.put(box(0.0085, 0.01, 0.03), "#2b2f36", [s * 0.034, by + 0.002, -0.058], [-6, 0, -s * 6], { bone: j });
      }
    } else {
      for (const s of [-1, 1]) {
        const j = s > 0 ? wL : wR;
        G.put(box(0.07, 0.006, 0.05), "#f6f6f2", [s * 0.06, by + 0.02, 0], [0, 0, s * 12], { bone: j });
        G.put(box(0.07, 0.005, 0.042), "#aab4bd", [s * 0.125, by + 0.032, -0.005], [0, 0, s * 18], { bone: j });
        G.put(box(0.045, 0.004, 0.035), "#2b2f36", [s * 0.18, by + 0.046, -0.012], [0, 0, s * 24], { bone: j });
      }
      for (const s of [-1, 1]) G.put(box(0.004, 0.004, 0.025), "#f2a81d", [s * 0.01, by - 0.025, -0.03], [-10, 0, 0], { bone: body });
    }
  }
  gull("gullA", [JX + 0.06, 0.231, 0.62], 200, false);
  gull("gullB", [0.12, 1.0, -0.05], 60, true);

  return b.root;
}
```