```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Diorama",
  description:
    "A cozy lighthouse on a tiny rocky island: striped tower with a glowing lantern, keeper's cottage with a crooked chimney, jetty with rowboat, seagulls, flowers, turquoise water and foam on a round wooden base.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse_diorama", paintSize: 1024 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(5);

  const P = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) => b.part(g, color, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const sph = (r: number, w = 6, h = 5) => new THREE.SphereGeometry(r, w, h);
  const glow = (m: THREE.Mesh, c = "#ffe27a", e = "#ffb81c", i = 1.3) => {
    m.material = new THREE.MeshStandardMaterial({ color: c, emissive: e, emissiveIntensity: i, roughness: 0.4 });
  };

  // ---------- base & water ----------
  b.lathe(
    [[0, 0], [0.62, 0], [0.65, 0.03], [0.65, 0.1], [0.6, 0.1], [0.6, 0.07], [0, 0.07]],
    { color: "#7a4b2a", at: [0, 0, 0], segments: 24, name: "base" },
  );
  P(cyl(0.652, 0.652, 0.012, 24), "#c9a24a", [0, 0.045, 0]);
  P(cyl(0.652, 0.652, 0.012, 24), "#c9a24a", [0, 0.012, 0]);
  P(cyl(0.6, 0.6, 0.03, 24), mottle("#24bfc4", "#58e3d8", { size: 0.12, seed: 3 }), [0, 0.07, 0], { name: "water" });
  // ripples
  for (let i = 0; i < 6; i++) {
    const a = R() * 6.28, r = 0.5 + R() * 0.07;
    P(new THREE.TorusGeometry(0.03 + R() * 0.02, 0.003, 3, 8), "#bff5f0", [Math.cos(a) * r, 0.086, Math.sin(a) * r], { rotation: [90, 0, 0] });
  }

  // ---------- island ----------
  const GRASS = mottle("#6dbb4a", "#4f9f3a", { size: 0.06, seed: 2 });
  const ROCK = mottle("#767a82", "#a3a4a6", { size: 0.05, seed: 4 });
  b.lathe(
    [[0, 0.05], [0.46, 0.05], [0.41, 0.12], [0.35, 0.19], [0.3, 0.215], [0, 0.215]],
    { color: paint((p, n) => (n.y > 0.55 ? GRASS : ROCK)), at: [0, 0, 0], segments: 10, name: "island" },
  );
  const rockCols = ["#7b7e86", "#8f9196", "#686b73", "#a0a09c"];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 6.28 + R() * 0.4, r = 0.3 + R() * 0.12;
    const s = 0.04 + R() * 0.05;
    P(new THREE.IcosahedronGeometry(s, 0), rockCols[i % 4], [Math.cos(a) * r, 0.1 + R() * 0.08, Math.sin(a) * r], {
      scale: [1, 0.7 + R() * 0.3, 0.9 + R() * 0.3], rotation: [R() * 60, R() * 90, R() * 40], flat: true,
    });
  }
  // foam
  P(new THREE.TorusGeometry(0.45, 0.016, 4, 20), "#ffffff", [0, 0.088, 0], { rotation: [90, 0, 0], scale: [1, 1, 0.6] });
  P(new THREE.TorusGeometry(0.5, 0.01, 4, 22), "#e8fbfa", [0, 0.087, 0], { rotation: [90, 0, 0], scale: [1, 1, 0.6] });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * 6.28 + R() * 0.2, r = 0.4 + R() * 0.11, s = 0.014 + R() * 0.02;
    P(sph(s), "#ffffff", [Math.cos(a) * r, 0.088, Math.sin(a) * r], { scale: [1.4, 0.4, 1] , flat: true});
  }

  // ---------- lighthouse ----------
  const tx = -0.1, tz = -0.08, y0 = 0.215;
  const rad = (y: number) => 0.105 - 0.035 * ((y - 0.245) / 0.55);
  P(cyl(0.12, 0.135, 0.03, 10), "#8a8d94", [tx, y0 + 0.015, tz], { name: "foundation" });
  for (let i = 0; i < 5; i++) {
    const ya = 0.245 + 0.11 * i;
    P(cyl(rad(ya + 0.11), rad(ya), 0.11, 10), i % 2 ? "#f6f1e7" : "#d9322b", [tx, ya + 0.055, tz], { name: "tower" + i });
  }
  P(box(0.034, 0.06, 0.012), "#4a2f1d", [tx, 0.275, tz + rad(0.275) - 0.002]);
  P(box(0.036, 0.008, 0.014), "#555", [tx, 0.309, tz + rad(0.3) - 0.002]);
  for (const wy of [0.43, 0.62]) {
    P(box(0.02, 0.036, 0.012), "#2b2b3a", [tx, wy, tz + rad(wy) - 0.002]);
    P(box(0.026, 0.004, 0.014), "#f6f1e7", [tx, wy - 0.02, tz + rad(wy) - 0.001]);
  }
  const topY = 0.795;
  P(cyl(0.1, 0.07, 0.02, 12), "#2a2a30", [tx, topY - 0.01, tz]);
  P(cyl(0.118, 0.118, 0.012, 12), "#2a2a30", [tx, topY + 0.006, tz]);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 6.28;
    P(box(0.005, 0.05, 0.005), "#222228", [tx + Math.cos(a) * 0.111, topY + 0.037, tz + Math.sin(a) * 0.111]);
  }
  P(new THREE.TorusGeometry(0.111, 0.004, 4, 14), "#222228", [tx, topY + 0.063, tz], { rotation: [90, 0, 0] });
  const lant = P(cyl(0.056, 0.056, 0.085, 8), "#ffe27a", [tx, topY + 0.0545, tz], { name: "lantern" });
  glow(lant.mesh);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.28 + 0.39;
    P(box(0.006, 0.09, 0.006), "#222228", [tx + Math.sin(a) * 0.058, topY + 0.0545, tz + Math.cos(a) * 0.058]);
  }
  P(cyl(0.066, 0.066, 0.01, 8), "#222228", [tx, topY + 0.1, tz]);
  P(cyl(0.004, 0.07, 0.055, 8), "#c42a24", [tx, topY + 0.1325, tz], { name: "lanternRoof" });
  P(sph(0.012, 6, 4), "#222228", [tx, topY + 0.165, tz]);
  b.rod([tx, topY + 0.165, tz], [tx, topY + 0.195, tz], 0.002, { color: "#222228" });

  // ---------- cottage ----------
  const cx = 0.13, cz = 0.07, wy = y0 + 0.012;
  P(box(0.18, 0.012, 0.15), "#8a8d94", [cx, y0 + 0.006, cz]);
  P(box(0.17, 0.085, 0.14), "#f1e3c3", [cx, wy + 0.0425, cz], { name: "walls" });
  const wt = wy + 0.085;
  b.extrude([[-0.09, -0.004], [0.09, -0.004], [0, 0.06]], {
    color: "#8a3b2e", at: [cx, wt, cz], thickness: 0.2, bevel: 0.004, name: "roof",
  });
  // door
  P(box(0.032, 0.05, 0.006), "#2a6fb8", [cx - 0.03, wy + 0.025, cz + 0.072], { name: "door" });
  P(sph(0.003, 4, 3), "#e6c14a", [cx - 0.019, wy + 0.025, cz + 0.077]);
  P(box(0.04, 0.006, 0.014), "#9a9a9a", [cx - 0.03, wy + 0.003, cz + 0.08]);
  // windows
  for (const [wx, wz, ry] of [[cx + 0.04, cz + 0.072, 0], [cx + 0.0865, cz, 90]] as number[][]) {
    P(box(0.04, 0.034, 0.005), "#f6f1e7", [wx, wy + 0.045, wz], { rotation: [0, ry, 0] });
    const w = P(box(0.03, 0.024, 0.007), "#ffe27a", [wx, wy + 0.045, wz], { rotation: [0, ry, 0] });
    glow(w.mesh, "#ffe08a", "#ff9d2e", 0.9);
  }
  // crooked chimney
  const chx = cx - 0.06, chz = cz - 0.02;
  P(box(0.03, 0.055, 0.03), "#9b4a35", [chx, wt + 0.04, chz], { name: "chimney" });
  P(box(0.03, 0.04, 0.03), "#a85540", [chx + 0.005, wt + 0.083, chz + 0.003], { rotation: [4, 0, -9] });
  P(box(0.038, 0.008, 0.038), "#6b6b70", [chx + 0.009, wt + 0.107, chz + 0.004], { rotation: [4, 0, -9] });
  [[0.012, 0.13, 0.014], [0.022, 0.155, 0.02], [0.034, 0.183, 0.026]].forEach(([dx, dy, s], i) =>
    P(sph(s, 6, 4), i % 2 ? "#d8d8dc" : "#eeeef0", [chx + dx, wt + dy, chz + 0.004], { flat: true }),
  );

  // ---------- jetty & boat ----------
  const jx = -0.12;
  for (let i = 0; i < 8; i++) P(box(0.13, 0.012, 0.03), i % 2 ? "#a9743f" : "#b98450", [jx, 0.124, 0.3 + 0.037 * i]);
  for (const sx of [-0.05, 0.05]) P(box(0.012, 0.012, 0.3), "#6e4524", [jx + sx, 0.108, 0.44]);
  for (const sx of [-0.07, 0.07])
    for (const pz of [0.33, 0.57]) P(cyl(0.011, 0.011, 0.12, 6), "#5a3820", [jx + sx, 0.1, pz]);
  const hull = P(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), "#e8782f", [-0.3, 0.113, 0.45], {
    scale: [0.055, 0.042, 0.12], name: "hull",
  });
  hull.mesh.material = new THREE.MeshStandardMaterial({ color: "#e8782f", roughness: 0.7, side: THREE.DoubleSide });
  P(cyl(1, 1, 0.003, 10), "#f3dfb0", [-0.3, 0.109, 0.45], { scale: [0.054, 1, 0.118] });
  P(box(0.1, 0.008, 0.02), "#8a5a2b", [-0.3, 0.104, 0.45]);
  P(box(0.1, 0.008, 0.02), "#8a5a2b", [-0.3, 0.104, 0.5]);
  b.rod([-0.34, 0.12, 0.44], [-0.4, 0.16, 0.42], 0.003, { color: "#8a5a2b" });
  b.rod([-0.26, 0.12, 0.44], [-0.2, 0.16, 0.42], 0.003, { color: "#8a5a2b" });
  b.rod([jx - 0.07, 0.15, 0.33], [-0.288, 0.108, 0.4], 0.0022, { color: "#d8c28a" });

  // ---------- seagulls ----------
  function gull(ox: number, oy: number, oz: number, yaw: number, fly: boolean) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const p = (x: number, y: number, z: number) => [ox + x * c + z * s, oy + y, oz - x * s + z * c];
    const W = "#f7f7f2", G = "#8e98a2", O = "#f2a31b", K = "#1f1f24";
    const by = fly ? 0 : 0.05;
    b.capsule(p(0, by, -0.03), p(0, by + 0.005, 0.03), [0.02, 0.025], { color: W });
    P(sph(0.02), W, p(0, by + 0.032, 0.05), { name: "head" });
    b.spike(p(0, by + 0.028, 0.065), [s, -0.15, c], 0.024, 0.007, { color: O });
    b.spike(p(0, by + 0.005, -0.04), [-s, 0.05, -c], 0.045, 0.02, { color: G });
    for (const sg of [-1, 1]) P(sph(0.0035, 4, 3), K, p(sg * 0.014, by + 0.038, 0.062));
    if (!fly) {
      for (const sg of [-1, 1]) {
        P(sph(1, 5, 4), G, p(sg * 0.024, by + 0.01, -0.01), { scale: [0.007, 0.02, 0.045], rotation: [0, (yaw * 180) / Math.PI, 0] });
        b.rod(p(sg * 0.01, by - 0.01, 0), p(sg * 0.01, 0.003, 0), 0.0025, { color: O });
        P(box(0.012, 0.003, 0.02), O, p(sg * 0.01, 0.0015, 0.006), { rotation: [0, (yaw * 180) / Math.PI, 0] });
      }
    } else {
      for (const sg of [-1, 1]) {
        b.frustumBox(p(sg * 0.015, by + 0.012, 0), p(sg * 0.13, by + 0.045, -0.02), [0.055, 0.008], [0.032, 0.004], { color: W, up: [0, 1, 0] });
        b.frustumBox(p(sg * 0.13, by + 0.045, -0.02), p(sg * 0.19, by + 0.062, -0.035), [0.032, 0.004], [0.012, 0.003], { color: K, up: [0, 1, 0] });
        b.rod(p(sg * 0.008, by - 0.012, -0.005), p(sg * 0.008, by - 0.012, -0.04), 0.0022, { color: O });
      }
    }
  }
  gull(-0.05 - 0.0, 0.16, 0.57, -0.7, false);
  gull(0.2, 0.74, 0.12, 0.8, true);

  // ---------- grass & flowers ----------
  const greens = ["#4f9f3a", "#6dbb4a", "#86cc55"];
  const petals = ["#ffd23f", "#ff7ba9", "#ffffff", "#9b6bdc"];
  const ok = (x: number, z: number) =>
    Math.hypot(x, z) < 0.285 &&
    Math.hypot(x - tx, z - tz) > 0.15 &&
    !(x > cx - 0.12 && x < cx + 0.12 && z > cz - 0.1 && z < cz + 0.1) &&
    !(x > -0.2 && x < -0.04 && z > 0.2);
  let tufts = 0, flowers = 0;
  for (let k = 0; k < 400 && (tufts < 16 || flowers < 14); k++) {
    const a = R() * 6.28, r = Math.sqrt(R()) * 0.29;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!ok(x, z)) continue;
    if (tufts < 16 && k % 2 === 0) {
      tufts++;
      for (let j = 0; j < 3; j++) {
        const ang = (j / 3) * 6.28 + R();
        b.spike([x, y0 - 0.003, z], [Math.cos(ang) * 0.4, 1, Math.sin(ang) * 0.4], 0.035 + R() * 0.02, 0.0045, {
          color: greens[j % 3], sides: 3,
        });
      }
    } else if (flowers < 14) {
      flowers++;
      const h = 0.035 + R() * 0.02;
      b.rod([x, y0 - 0.003, z], [x, y0 + h, z], 0.0018, { color: "#4f9f3a", sides: 3 });
      P(sph(0.01 + R() * 0.003, 5, 4), petals[flowers % 4], [x, y0 + h + 0.004, z], { flat: true });
      P(sph(0.005, 4, 3), flowers % 4 === 0 ? "#e8782f" : "#ffd23f", [x, y0 + h + 0.011, z]);
    }
  }

  return b.root;
}
```