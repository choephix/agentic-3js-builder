import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Lighthouse Island Diorama",
  description:
    "A cozy lighthouse diorama: striped tower with glowing lantern, keeper's cottage, jetty with rowboat, seagulls, grass, wildflowers, rocks and foam on a round display base.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse_diorama" });
  const root = b.joint("base", { at: [0, 0, 0] });
  const R = rng(11);

  const P = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: root, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);

  // palette
  const WOOD = "#7a4b2a", WOOD2 = "#9b6a3c", WOODD = "#4e2f1a";
  const WATER = "#2cc1c4", WATER2 = "#47d6d0", FOAM = "#f4fbff";
  const RED = "#d8362f", WHITE = "#f6f1e6", IRON = "#23262b";
  const GLOW = "#ffe27a", GLOW2 = "#fff7cf";
  const ROCKS = ["#8a8f98", "#6f757e", "#a39f98", "#7b7f86"];
  const GRASS = ["#5faa4a", "#7cc65a", "#4b9140"];

  // ---------- display base ----------
  P(cyl(0.73, 0.73, 0.06, 32), WOODD, [0, 0.03, 0]);
  b.lathe(
    [[0.64, 0], [0.72, 0], [0.72, 0.17], [0.64, 0.17]],
    { at: [0, 0.0, 0], bone: root, color: WOOD, segments: 32 },
  );
  P(cyl(0.735, 0.735, 0.012, 32), WOOD2, [0, 0.17, 0].map((v, i) => (i === 1 ? 0.173 : v)), { scale: [0.96, 1, 0.96] });
  P(cyl(0.65, 0.65, 0.12, 32), WATER, [0, 0.06, 0]);
  P(cyl(0.64, 0.64, 0.01, 32), WATER2, [0, 0.12, 0]);
  // wave ticks
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2, r = 0.52 + R() * 0.1;
    if (a > 3.5 && a < 4.3) continue;
    P(box(0.06, 0.006, 0.012), FOAM, [Math.cos(a) * r, 0.127, Math.sin(a) * r], { rotation: [0, R() * 180, 0] });
  }

  // ---------- island ----------
  const y0 = 0.22;
  P(cyl(0.44, 0.52, 0.16, 10), "#7b7f86", [0, 0.14, 0], { rotation: [0, 12, 0] });
  P(cyl(0.43, 0.45, 0.04, 10), "#7ec65a", [0, 0.2, 0], { rotation: [0, 12, 0] });
  P(cyl(0.41, 0.43, 0.012, 10), "#69b34c", [0, 0.226, 0], { rotation: [0, 12, 0] });
  // foam rings
  P(new THREE.TorusGeometry(0.52, 0.016, 4, 28), FOAM, [0, 0.125, 0], { rotation: [90, 0, 0], flat: false });
  P(new THREE.TorusGeometry(0.57, 0.008, 4, 28), FOAM, [0, 0.127, 0], { rotation: [90, 0, 0], flat: false });
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + R() * 0.2, r = 0.5 + R() * 0.06;
    P(sph(0.025 + R() * 0.012, 6, 4), FOAM, [Math.cos(a) * r, 0.125, Math.sin(a) * r], { scale: [1.3, 0.35, 1] });
  }
  // rocks around shore
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + R() * 0.2;
    if (a > 0.9 && a < 1.5) continue; // jetty zone (front-left)
    const r = 0.44 + R() * 0.08, s = 0.05 + R() * 0.05;
    P(new THREE.DodecahedronGeometry(s, 0), ROCKS[i % 4], [Math.cos(a) * r, 0.13 + s * 0.4, Math.sin(a) * r],
      { scale: [1, 0.7 + R() * 0.3, 1], rotation: [R() * 60, R() * 360, R() * 40] });
  }
  for (const [x, z, s] of [[-0.3, -0.3, 0.08], [0.35, -0.2, 0.07], [0.0, 0.45, 0.06]] as number[][]) {
    P(new THREE.DodecahedronGeometry(s, 0), "#8a8f98", [x, 0.2 + s * 0.3, z], { scale: [1, 0.75, 1.1], rotation: [10, x * 300, 0] });
  }

  // ---------- lighthouse ----------
  const tx = -0.12, tz = -0.1;
  const H = 0.7, segH = H / 6;
  const rAt = (y: number) => 0.115 - 0.045 * (y / H);
  for (let i = 0; i < 6; i++) {
    P(cyl(rAt((i + 1) * segH), rAt(i * segH), segH, 10), i % 2 === 0 ? RED : WHITE, [tx, y0 + segH * (i + 0.5), tz]);
  }
  P(cyl(0.125, 0.13, 0.025, 10), "#8a8f98", [tx, y0 + 0.012, tz]);
  // door & windows on the tower
  P(box(0.045, 0.07, 0.01), "#2f6fd0", [tx, y0 + 0.055, tz + 0.115]);
  for (const wy of [0.25, 0.42, 0.57]) {
    const rr = rAt(wy);
    P(box(0.035, 0.05, 0.01), IRON, [tx, y0 + wy, tz + rr - 0.004]);
    P(box(0.022, 0.036, 0.012), GLOW, [tx, y0 + wy, tz + rr]);
  }
  const top = y0 + H;
  // gallery
  P(cyl(0.145, 0.13, 0.025, 12), IRON, [tx, top + 0.01, tz]);
  P(cyl(0.13, 0.13, 0.012, 12), "#3a3e45", [tx, top - 0.008, tz]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    P(box(0.008, 0.06, 0.008), IRON, [tx + Math.cos(a) * 0.14, top + 0.052, tz + Math.sin(a) * 0.14]);
  }
  P(new THREE.TorusGeometry(0.14, 0.005, 4, 20), IRON, [tx, top + 0.082, tz], { rotation: [90, 0, 0], flat: false });
  P(new THREE.TorusGeometry(0.14, 0.004, 4, 20), IRON, [tx, top + 0.05, tz], { rotation: [90, 0, 0], flat: false });
  // lantern room
  P(cyl(0.07, 0.07, 0.1, 8), GLOW, [tx, top + 0.075, tz]);
  P(sph(0.042, 6, 5), GLOW2, [tx, top + 0.08, tz]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    P(box(0.01, 0.105, 0.01), IRON, [tx + Math.cos(a) * 0.072, top + 0.075, tz + Math.sin(a) * 0.072]);
  }
  P(cyl(0.075, 0.075, 0.012, 8), IRON, [tx, top + 0.026, tz]);
  P(cyl(0.085, 0.085, 0.012, 8), IRON, [tx, top + 0.131, tz]);
  P(new THREE.ConeGeometry(0.1, 0.075, 8), RED, [tx, top + 0.175, tz]);
  P(sph(0.015, 6, 4), IRON, [tx, top + 0.222, tz]);
  P(cyl(0.003, 0.003, 0.05, 4), IRON, [tx, top + 0.25, tz]);

  // ---------- cottage ----------
  const cx = 0.22, cz = 0.12, wH = 0.11;
  P(box(0.215, 0.025, 0.175), "#8a8f98", [cx, y0 + 0.005, cz]);
  P(box(0.2, wH, 0.16), "#f2e6cf", [cx, y0 + 0.015 + wH / 2 - 0.01, cz]);
  const wallTop = y0 + 0.015 + wH - 0.01;
  b.extrude([[-0.1, 0], [0.1, 0], [0, 0.065]], { at: [cx, wallTop, cz - 0.08], x: [1, 0, 0], thickness: 0.16, color: "#f2e6cf", bone: root });
  for (const s of [1, -1]) {
    P(box(0.15, 0.012, 0.19), "#8c3a2b", [cx + s * 0.052, wallTop + 0.036, cz], { rotation: [0, 0, -s * 33] });
    P(box(0.15, 0.004, 0.195), "#b4503a", [cx + s * 0.052, wallTop + 0.043, cz], { rotation: [0, 0, -s * 33] });
  }
  P(box(0.012, 0.012, 0.19), "#6e2b20", [cx, wallTop + 0.067, cz]);
  // crooked chimney
  P(box(0.036, 0.06, 0.036), "#a0583f", [cx + 0.055, wallTop + 0.055, cz - 0.03], { rotation: [0, 0, 4] });
  P(box(0.034, 0.05, 0.034), "#a0583f", [cx + 0.0585, wallTop + 0.1, cz - 0.03], { rotation: [0, 0, -8] });
  P(box(0.046, 0.01, 0.046), "#5b3b30", [cx + 0.062, wallTop + 0.13, cz - 0.03], { rotation: [0, 0, -8] });
  for (let i = 0; i < 3; i++) {
    P(sph(0.016 + i * 0.006, 6, 4), "#e7edf0", [cx + 0.065 + i * 0.015, wallTop + 0.16 + i * 0.03, cz - 0.03], { flat: false });
  }
  // door, windows
  P(box(0.04, 0.065, 0.008), "#2f6fd0", [cx - 0.035, y0 + 0.06, cz + 0.082]);
  P(box(0.048, 0.007, 0.01), WHITE, [cx - 0.035, y0 + 0.097, cz + 0.082]);
  P(sph(0.004, 4, 3), "#e9c24a", [cx - 0.024, y0 + 0.058, cz + 0.088]);
  P(box(0.06, 0.012, 0.03), "#8a8f98", [cx - 0.035, y0 + 0.02, cz + 0.098]);
  P(box(0.04, 0.04, 0.008), WHITE, [cx + 0.05, y0 + 0.075, cz + 0.082]);
  P(box(0.03, 0.03, 0.01), GLOW, [cx + 0.05, y0 + 0.075, cz + 0.083]);
  P(box(0.003, 0.03, 0.011), WHITE, [cx + 0.05, y0 + 0.075, cz + 0.084]);
  for (const s of [1, -1]) P(box(0.012, 0.04, 0.008), "#2f6fd0", [cx + 0.05 + s * 0.026, y0 + 0.075, cz + 0.083]);
  P(box(0.008, 0.035, 0.035), GLOW, [cx + 0.1, y0 + 0.075, cz]);
  // side planter flowers
  P(box(0.05, 0.015, 0.014), WOOD, [cx + 0.05, y0 + 0.035, cz + 0.092]);

  // ---------- jetty ----------
  const jx = -0.2;
  for (let i = 0; i < 9; i++) {
    P(box(0.12, 0.012, 0.022), i % 2 ? WOOD2 : WOOD, [jx, 0.165, 0.37 + i * 0.026]);
  }
  for (const s of [1, -1]) {
    for (const z of [0.4, 0.5, 0.58]) {
      P(cyl(0.011, 0.011, 0.14, 5), WOODD, [jx + s * 0.062, 0.115, z]);
    }
    P(box(0.012, 0.01, 0.22), WOODD, [jx + s * 0.062, 0.168, 0.48]);
  }
  P(cyl(0.013, 0.013, 0.05, 5), WOODD, [jx + 0.062, 0.19, 0.58]);

  // ---------- rowboat ----------
  const bx = -0.33, bz = 0.47, by = 0.115;
  const hull: any = [[0, -0.14, "sharp"], [0.05, -0.05], [0.055, 0.07], [0.03, 0.13], [-0.03, 0.13], [-0.055, 0.07], [-0.05, -0.05]];
  b.extrude(hull, { at: [bx, by, bz], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.04, color: "#c9442f", bone: root });
  b.extrude(hull.map((p: any) => [p[0] * 0.8, p[1] * 0.8 - 0.005, ...(p[2] ? [p[2]] : [])]), {
    at: [bx, by + 0.025, bz], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.02, color: "#e8c88a", bone: root,
  });
  P(box(0.11, 0.012, 0.025), WOOD2, [bx, by + 0.036, bz + 0.01]);
  P(box(0.11, 0.012, 0.025), WOOD2, [bx, by + 0.036, bz - 0.06]);
  P(cyl(0.004, 0.004, 0.16, 4), WOOD, [bx + 0.03, by + 0.07, bz], { rotation: [0, 0, 60] });
  P(box(0.012, 0.005, 0.03), WOOD, [bx + 0.095, by + 0.04, bz + 0.0], { rotation: [0, 0, 60] });
  // rope
  b.rod([jx - 0.06, 0.17, 0.5], [bx + 0.02, by + 0.04, bz - 0.12], 0.003, { color: "#d9c79a", bone: root });

  // ---------- seagulls ----------
  const gull = (x: number, y: number, z: number, ry: number) => {
    const a = (ry * Math.PI) / 180, fx = Math.sin(a), fz = Math.cos(a);
    const at = (f: number, u: number, side = 0) => [x + fx * f + fz * side, y + u, z + fz * f - fx * side];
    P(sph(0.03, 6, 5), WHITE, at(0, 0.05), { scale: [0.8, 0.8, 1.5], rotation: [0, ry, 0] });
    P(sph(0.019, 6, 4), WHITE, at(0.04, 0.08), {});
    P(new THREE.ConeGeometry(0.007, 0.028, 5), "#f2a33a", at(0.07, 0.078), { dir: [fx, -0.1, fz] });
    for (const s of [1, -1]) {
      P(box(0.008, 0.025, 0.07), "#8d949c", at(-0.005, 0.058, s * 0.03), { rotation: [0, ry, 0] });
      P(sph(0.004, 4, 3), IRON, at(0.05, 0.088, s * 0.012));
      P(cyl(0.003, 0.003, 0.03, 4), "#f2a33a", at(0, 0.015, s * 0.01));
    }
    P(box(0.03, 0.006, 0.04), "#8d949c", at(-0.06, 0.055), { rotation: [0, ry, 0] });
  };
  gull(jx + 0.062, 0.2, 0.58, 200);
  gull(0.0, 0.215, 0.36, 30);
  // flying-less perched third on rock
  gull(-0.34, 0.22, -0.22, 120);

  // ---------- grass & flowers ----------
  const ok = (x: number, z: number) => {
    if (Math.hypot(x, z) > 0.4) return false;
    if (Math.hypot(x - tx, z - tz) < 0.15) return false;
    if (Math.abs(x - cx) < 0.13 && Math.abs(z - cz) < 0.115) return false;
    return true;
  };
  let tufts = 0;
  while (tufts < 22) {
    const x = (R() - 0.5) * 0.85, z = (R() - 0.5) * 0.85;
    if (!ok(x, z)) continue;
    tufts++;
    for (let k = 0; k < 3; k++) {
      P(new THREE.ConeGeometry(0.008, 0.045 + R() * 0.02, 4), GRASS[(tufts + k) % 3],
        [x + (k - 1) * 0.009, y0 + 0.03, z + (R() - 0.5) * 0.01], { rotation: [(R() - 0.5) * 30, 0, (k - 1) * 18] });
    }
  }
  const FL = ["#ffd23f", "#ff7aa2", "#ffffff", "#b78cff", "#ff8a3d"];
  let fl = 0;
  while (fl < 16) {
    const x = (R() - 0.5) * 0.85, z = (R() - 0.5) * 0.85;
    if (!ok(x, z)) continue;
    fl++;
    const h = 0.04 + R() * 0.02;
    P(cyl(0.0025, 0.0025, h, 4), "#3f8a3a", [x, y0 + h / 2, z]);
    P(sph(0.011, 5, 4), FL[fl % 5], [x, y0 + h + 0.004, z]);
    P(sph(0.005, 4, 3), "#f6c93a", [x, y0 + h + 0.012, z]);
  }

  return b.root;
}
