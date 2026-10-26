import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg, countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Arctic Research Outpost",
  description: "Firewatch-style flat colour diorama: a small polar research station with cabin, radio mast, weather instruments, sled, fuel drums and glowing windows on a snowy base.",
};

export default function build() {
  const b = createBuilder({ name: "arcticOutpost" });
  const root = b.joint("base", { at: [0, 0, 0] });

  const SNOW = "#f3e9e4", SNOW_SH = "#d9c3cf", ICE = "#8fc4d6", ROCK = "#5b4a5a";
  const RED = "#c8412f", RED_DK = "#8f2a2a", WOOD = "#6b4630", WOOD_DK = "#4a2f26";
  const ORANGE = "#f0873a", CREAM = "#f6dfb0", STEEL = "#7d8a9a", DARK = "#2f2838";
  const GLOW = "#ffc660", TEAL = "#2f7f86";

  const snowPaint = paint((p, n) => {
    const t = noise(p, 0.5, 3);
    const c = mix(SNOW_SH, SNOW, smoothstep(0.1, 0.9, n.y) * 0.8 + t * 0.2);
    return c;
  });
  const roofPaint = countershade(mix(SNOW, "#ffffff", 0.3), RED_DK, { level: 0.6, soft: 0.1 });
  const wallPaint = paint((p, n) => {
    const stripe = Math.floor(p.y / 0.08) % 2 ? RED : "#b93a2b";
    return mix(stripe, RED_DK, smoothstep(0.3, -0.8, n.y) * 0.5);
  });
  const rockPaint = mottle(ROCK, "#7a6577", { size: 0.25, seed: 4 });

  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: root, at, flat: true, ...o });

  // base island
  P(new THREE.CylinderGeometry(2.1, 2.3, 0.3, 9), snowPaint, [0, 0.13, 0]);
  P(new THREE.CylinderGeometry(1.7, 2.0, 0.18, 9), SNOW, [0, 0.3, 0], { rotation: [0, 12, 0] });
  P(new THREE.CylinderGeometry(2.0, 1.5, 0.15, 9), ICE, [0, 0.0, 0], { rotation: [0, 20, 0] });
  const R = rng(5);
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + 0.4, r = 1.55 + R() * 0.3, s = 0.18 + R() * 0.15;
    P(new THREE.DodecahedronGeometry(s, 0), rockPaint, [Math.sin(a) * r, 0.36 + s * 0.4, Math.cos(a) * r - 0.1]);
    P(new THREE.ConeGeometry(s * 0.9, s * 0.5, 6), SNOW, [Math.sin(a) * r, 0.36 + s * 0.95, Math.cos(a) * r - 0.1]);
  }

  // main cabin
  const cx = -0.3, cz = -0.2, by = 0.39;
  P(new THREE.BoxGeometry(1.5, 0.12, 1.0), WOOD_DK, [cx, by + 0.06, cz]);
  P(new THREE.BoxGeometry(1.4, 0.7, 0.9), wallPaint, [cx, by + 0.47, cz]);
  // roof
  const roofShape = [[-0.8, 0], [0.8, 0], [0.0, 0.5]] as number[][];
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.95, 0.07, 1.1), roofPaint, [cx + s * 0.36, by + 1.1, cz], { rotation: [0, 0, -s * 32] });
    P(new THREE.BoxGeometry(0.95, 0.06, 1.1), WOOD_DK, [cx + s * 0.36, by + 1.06, cz], { rotation: [0, 0, -s * 32] });
  }
  b.extrude([[-0.7, 0], [0.7, 0], [0, 0.42]], { at: [cx, by + 0.82, cz + 0.45], x: [1, 0, 0], thickness: 0.03, color: RED_DK, bone: root });
  b.extrude([[-0.7, 0], [0.7, 0], [0, 0.42]], { at: [cx, by + 0.82, cz - 0.45], x: [1, 0, 0], thickness: 0.03, color: RED_DK, bone: root });
  // chimney
  P(new THREE.BoxGeometry(0.14, 0.4, 0.14), ROCK, [cx + 0.45, by + 1.25, cz - 0.2]);
  P(new THREE.BoxGeometry(0.18, 0.05, 0.18), SNOW, [cx + 0.45, by + 1.47, cz - 0.2]);
  // door + step
  P(new THREE.BoxGeometry(0.28, 0.5, 0.04), WOOD, [cx + 0.35, by + 0.35, cz + 0.46]);
  P(new THREE.BoxGeometry(0.4, 0.06, 0.25), WOOD_DK, [cx + 0.35, by + 0.03, cz + 0.58]);
  P(new THREE.SphereGeometry(0.02, 5, 4), GLOW, [cx + 0.45, by + 0.35, cz + 0.49]);
  // windows with glow
  const win = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#ffc660"/><rect x="14" y="0" width="4" height="32" fill="#7a3b1e"/><rect y="14" width="32" height="4" fill="#7a3b1e"/><rect width="32" height="32" fill="none" stroke="#4a2f26" stroke-width="4"/></svg>`, { size: 64 });
  const wpos: [number, number, number, number][] = [[-0.3, 0.45, 0.46, 0], [-0.72, 0.45, 0.46, 0]];
  for (const [x, y, z] of wpos) {
    const m = b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", { bone: root, at: [cx + x + 0.3, by + y, cz + z + 0.005], dir: [0, 0, 1], axis: "z", texture: win });
    m.mesh.material = (m.mesh.material as THREE.MeshStandardMaterial).clone();
    const mm = m.mesh.material as THREE.MeshStandardMaterial;
    mm.emissive = new THREE.Color("#ffc660"); mm.emissiveMap = mm.map; mm.emissiveIntensity = 1;
  }
  const sideWin = b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: root, at: [cx + 0.705, by + 0.45, cz], dir: [1, 0, 0], axis: "z", texture: win });
  const sm = (sideWin.mesh.material = (sideWin.mesh.material as THREE.MeshStandardMaterial).clone()) as THREE.MeshStandardMaterial;
  sm.emissive = new THREE.Color("#ffc660"); sm.emissiveMap = sm.map;
  // porch lamp
  P(new THREE.SphereGeometry(0.05, 6, 5), GLOW, [cx + 0.35, by + 0.72, cz + 0.5], {});
  // sign
  const sign = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#f6dfb0" stroke="#4a2f26" stroke-width="3"/><text x="32" y="17" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#8f2a2a">STN-7</text></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.4, 0.15), "#ffffff", { bone: root, at: [cx, by + 0.77, cz + 0.46], dir: [0, 0, 1], axis: "z", texture: sign });

  // lean-to lab (teal)
  const lx = 0.85, lz = 0.1;
  P(new THREE.BoxGeometry(0.6, 0.5, 0.7), TEAL, [lx + 0.0, by + 0.25, lz]);
  P(new THREE.BoxGeometry(0.7, 0.07, 0.8), SNOW, [lx, by + 0.54, lz]);
  P(new THREE.BoxGeometry(0.3, 0.2, 0.03), GLOW, [lx + 0.1, by + 0.3, lz + 0.36]);
  // dome instrument
  P(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), CREAM, [lx, by + 0.58, lz]);
  P(new THREE.BoxGeometry(0.04, 0.12, 0.04), STEEL, [lx, by + 0.78, lz]);

  // radio mast
  const mx = -1.2, mz = -0.75;
  b.rod([mx, 0.39, mz], [mx, 2.6, mz], [0.035, 0.015], { color: STEEL, bone: root, sides: 6 });
  for (let i = 0; i < 4; i++) {
    const y = 0.9 + i * 0.5, w = 0.45 - i * 0.08;
    b.rod([mx - w, y, mz], [mx + w, y, mz], 0.015, { color: i % 2 ? RED : CREAM, bone: root, sides: 5 });
  }
  for (const a of [0, 2.1, 4.2]) {
    b.rod([mx, 2.2, mz], [mx + Math.sin(a) * 0.9, 0.42, mz + Math.cos(a) * 0.9], 0.006, { color: DARK, bone: root, sides: 4 });
  }
  glowP(P(new THREE.SphereGeometry(0.05, 6, 5), "#ff4a3a", [mx, 2.65, mz]));
  function glowP(p: any) {
    const m = (p.mesh.material = p.mesh.material.clone());
    m.emissive = m.color.clone(); m.emissiveIntensity = 1.5;
  }
  // satellite dish
  P(new THREE.SphereGeometry(0.25, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2.4), CREAM, [mx + 0.0, 1.9, mz + 0.12], { rotation: [70, 0, 0] });
  P(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 4), STEEL, [mx, 1.95, mz + 0.25], { rotation: [70, 0, 0] });

  // weather station (stevenson screen)
  const wx = 0.7, wz = 1.0;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P(new THREE.BoxGeometry(0.03, 0.4, 0.03), WOOD_DK, [wx + dx * 0.13, 0.55, wz + dz * 0.1]);
  P(new THREE.BoxGeometry(0.34, 0.22, 0.26), CREAM, [wx, 0.82, wz]);
  P(new THREE.BoxGeometry(0.4, 0.04, 0.32), WOOD_DK, [wx, 0.96, wz]);
  for (let i = 0; i < 3; i++) P(new THREE.BoxGeometry(0.3, 0.02, 0.01), STEEL, [wx, 0.76 + i * 0.06, wz + 0.135]);
  // anemometer
  b.rod([wx - 0.5, 0.39, wz - 0.1], [wx - 0.5, 1.3, wz - 0.1], 0.015, { color: STEEL, bone: root, sides: 5 });
  for (let i = 0; i < 3; i++) {
    const a = i * 2.09;
    b.rod([wx - 0.5, 1.32, wz - 0.1], [wx - 0.5 + Math.sin(a) * 0.18, 1.32, wz - 0.1 + Math.cos(a) * 0.18], 0.008, { color: DARK, bone: root, sides: 4 });
    P(new THREE.SphereGeometry(0.04, 5, 4), ORANGE, [wx - 0.5 + Math.sin(a) * 0.18, 1.32, wz - 0.1 + Math.cos(a) * 0.18]);
  }

  // fuel drums
  for (const [dx, dz, c] of [[-1.35, 0.55, ORANGE], [-1.1, 0.8, ORANGE], [-1.45, 0.95, STEEL]] as any[]) {
    P(new THREE.CylinderGeometry(0.14, 0.14, 0.34, 8), c, [dx, 0.56, dz]);
    P(new THREE.CylinderGeometry(0.145, 0.145, 0.03, 8), DARK, [dx, 0.5, dz]);
    P(new THREE.CylinderGeometry(0.145, 0.145, 0.03, 8), DARK, [dx, 0.62, dz]);
    P(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 8), SNOW, [dx, 0.74, dz]);
  }

  // sled
  const sx = 0.2, sz = 1.3;
  for (const s of [1, -1]) {
    b.rod([sx + s * 0.12, 0.4, sz - 0.4], [sx + s * 0.12, 0.4, sz + 0.4], 0.02, { color: WOOD_DK, bone: root, sides: 5 });
    b.rod([sx + s * 0.12, 0.4, sz + 0.4], [sx + s * 0.12, 0.5, sz + 0.5], 0.02, { color: WOOD_DK, bone: root, sides: 5 });
  }
  P(new THREE.BoxGeometry(0.34, 0.04, 0.7), WOOD, [sx, 0.46, sz]);
  P(new THREE.BoxGeometry(0.26, 0.16, 0.3), TEAL, [sx, 0.56, sz - 0.1]);
  P(new THREE.BoxGeometry(0.28, 0.04, 0.32), SNOW, [sx, 0.65, sz - 0.1]);

  // flag pole
  b.rod([1.4, 0.39, -0.8], [1.4, 1.7, -0.8], 0.02, { color: STEEL, bone: root, sides: 5 });
  b.extrude([[0, 0], [0.4, 0.04], [0.4, 0.26], [0, 0.3]], { at: [1.4, 1.38, -0.8], x: [1, 0, 0], thickness: 0.015, color: ORANGE, bone: root });

  // snow drifts
  P(new THREE.SphereGeometry(0.45, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), SNOW, [cx - 0.5, 0.39, cz + 0.65], { scale: [1.3, 0.5, 0.8] });
  P(new THREE.SphereGeometry(0.4, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), SNOW, [1.3, 0.39, 0.7], { scale: [1.1, 0.4, 1] });

  // smoke
  for (let i = 0; i < 4; i++) P(new THREE.IcosahedronGeometry(0.08 + i * 0.03, 0), i % 2 ? "#e6d6dc" : "#cdb8c6", [cx + 0.5 + i * 0.05, by + 1.8 + i * 0.2, cz - 0.2]);

  return b.root;
}
