import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description: "Firewatch-style flat colour diorama: a small polar research station with lit windows, radio mast, antenna dish, sled, fuel drums and snowy ground.",
};

export default function build() {
  const b = createBuilder({ name: "arcticOutpost" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(5);

  const SNOW = "#f3e6dc", SNOW2 = "#e8c9c0", ICE = "#9fb7c9";
  const RED = "#c8472f", DARKRED = "#8e2f27", ORANGE = "#e98a3c", CREAM = "#f2d9a8";
  const DARK = "#3a2a35", METAL = "#6d6a78", GLOW = "#ffc762", WOOD = "#7a4a36";

  const snowPaint = paint((p, n) => {
    const t = noise(p, 0.5, 3);
    const warm = mix(SNOW, SNOW2, smoothstep(0.4, 0.8, t) * 0.8);
    return n.y > 0.5 ? warm : mix(SNOW2, ICE, 0.5);
  });
  const wallPaint = paint((p, n) => {
    const c = mix(RED, DARKRED, smoothstep(0.3, 0.9, noise(p, 0.3, 8)) * 0.4);
    const plank = Math.abs(((p.y / 0.12) % 1) - 0.5) < 0.02;
    return plank ? DARKRED : c;
  });

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: base, at: at as any, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone: base, at: at as any, rotation: rot as any });

  // ground: snowy island with drifts
  cyl(2.6, 2.9, 0.3, 14, snowPaint, [0, 0.13, 0]);
  cyl(2.3, 2.6, 0.12, 14, SNOW, [0, 0.3, 0]);
  for (let i = 0; i < 9; i++) {
    const a = R() * 6.28, r = 1 + R() * 1.2;
    b.part(new THREE.SphereGeometry(0.3 + R() * 0.3, 7, 5), snowPaint, {
      bone: base, at: [Math.cos(a) * r, 0.3, Math.sin(a) * r], scale: [1.4, 0.4, 1],
    });
  }

  // main cabin on stilts
  for (const x of [-0.9, 0.9]) for (const z of [-0.5, 0.5]) box(0.12, 0.3, 0.12, WOOD, [x, 0.45, z]);
  box(2.2, 0.08, 1.4, WOOD, [0, 0.62, 0]);
  box(2.0, 0.9, 1.2, wallPaint, [0, 1.1, 0]);
  // roof
  const roof = b.extrude([[-0.7, 0], [0.7, 0], [0, 0.55]], { at: [0, 1.55, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: DARK, bone: base });
  roof.mesh.visible = false;
  for (const s of [1, -1]) {
    box(1.35, 0.06, 1.5, DARK, [0, 1.82, s * 0.0] as any, [0, 90, 0]);
  }
  box(2.3, 0.07, 0.8, DARK, [0, 1.74, 0.38], [-25, 0, 0]);
  box(2.3, 0.07, 0.8, DARK, [0, 1.74, -0.38], [25, 0, 0]);
  box(2.3, 0.08, 0.14, CREAM, [0, 1.93, 0]);
  // gable fill
  for (const s of [1, -1]) box(0.06, 0.28, 1.0, wallPaint, [s * 0.99, 1.6, 0]);
  // chimney
  box(0.18, 0.5, 0.18, DARK, [0.6, 2.0, -0.3]);
  for (let i = 0; i < 3; i++) b.part(new THREE.SphereGeometry(0.1 + i * 0.04, 6, 5), "#ffffff", { bone: base, at: [0.6 + i * 0.08, 2.35 + i * 0.2, -0.3], scale: [1, 0.7, 1] });

  // door + steps
  box(0.4, 0.65, 0.06, ORANGE, [0.55, 0.98, 0.62]);
  box(0.5, 0.06, 0.3, WOOD, [0.55, 0.52, 0.8]);
  box(0.5, 0.06, 0.3, WOOD, [0.55, 0.38, 1.0]);
  box(0.5, 0.06, 0.3, WOOD, [0.55, 0.24, 1.2]);
  // windows with glow
  const winTex = svg(`<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#ffc762"/><path d="M20 0V40M0 20H40" stroke="#3a2a35" stroke-width="4"/><rect width="40" height="40" fill="none" stroke="#3a2a35" stroke-width="5"/></svg>`, { size: 64 });
  for (const x of [-0.6, -0.1]) {
    glow(b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { bone: base, at: [x, 1.15, 0.62], dir: [0, 0, 1], axis: "z", texture: winTex }), 1.2);
  }
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { bone: base, at: [s * 1.01, 1.15, 0], dir: [s, 0, 0], axis: "z", texture: winTex }), 1.2);
  // lantern by the door
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 5), GLOW, { bone: base, at: [0.9, 1.3, 0.66] }), 1.8);

  // side module (lab shed)
  box(1.0, 0.7, 0.9, METAL, [-1.9, 0.75, 0.1]);
  box(1.1, 0.07, 1.0, DARK, [-1.9, 1.13, 0.1]);
  box(0.06, 0.4, 0.4, ORANGE, [-1.37, 0.75, 0.1]);
  for (const z of [-0.2, 0.4]) box(0.1, 0.3, 0.1, WOOD, [-1.9, 0.45, z]);

  // radio mast
  cyl(0.04, 0.06, 2.8, 6, METAL, [-0.8, 2.9, -0.5]);
  for (let i = 0; i < 5; i++) box(0.5 - i * 0.07, 0.03, 0.03, METAL, [-0.8, 2.0 + i * 0.4, -0.5]);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 5), "#ff4d3a", { bone: base, at: [-0.8, 4.35, -0.5] }), 2);
  for (const a of [0, 120, 240]) {
    const r = a * Math.PI / 180;
    b.rod([-0.8, 4.0, -0.5], [-0.8 + Math.cos(r) * 1.1, 0.35, -0.5 + Math.sin(r) * 1.1], 0.008, "#cfc3c0", { bone: base });
  }

  // satellite dish
  cyl(0.05, 0.05, 0.5, 6, METAL, [1.2, 0.55, -1.6]);
  const dish = b.lathe([[0, 0], [0.35, 0.12], [0.37, 0.14], [0.33, 0.14], [0, 0.03]], { at: [1.2, 0.95, -1.55], axis: [0, 0.6, 0.8], color: CREAM, bone: base, segments: 10 });
  void dish;
  b.rod([1.2, 0.95, -1.55], [1.2, 1.15, -1.3], 0.015, METAL, { bone: base });

  // weather station
  cyl(0.02, 0.02, 0.9, 5, METAL, [1.7, 0.75, 0.5]);
  for (let i = 0; i < 3; i++) b.part(new THREE.SphereGeometry(0.06, 5, 4), ORANGE, { bone: base, at: [1.7 + Math.cos(i * 2.1) * 0.15, 1.2, 0.5 + Math.sin(i * 2.1) * 0.15] });
  box(0.2, 0.2, 0.2, CREAM, [1.7, 0.6, 0.5]);

  // fuel drums
  for (let i = 0; i < 3; i++) {
    cyl(0.17, 0.17, 0.4, 9, i === 1 ? ORANGE : RED, [-1.4 + i * 0.36, 0.55, 1.2]);
    cyl(0.175, 0.175, 0.03, 9, DARK, [-1.4 + i * 0.36, 0.6, 1.2]);
  }

  // crates
  box(0.4, 0.3, 0.4, WOOD, [1.6, 0.46, 1.1], [0, 20, 0]);
  box(0.3, 0.24, 0.3, "#9a6a45", [1.65, 0.73, 1.1], [0, -10, 0]);

  // sled
  box(0.9, 0.05, 0.4, WOOD, [-0.4, 0.4, 1.7]);
  for (const z of [1.5, 1.9]) box(1.0, 0.04, 0.05, DARK, [-0.4, 0.34, z]);
  box(0.4, 0.2, 0.3, DARK, [-0.5, 0.52, 1.7]);

  // ice rocks
  for (const [x, z, s] of [[2.0, -0.8, 0.35], [-2.1, -1.2, 0.45], [0.3, -2.0, 0.3]])
    b.part(new THREE.IcosahedronGeometry(s, 0), ICE, { bone: base, at: [x, 0.4 + s * 0.4, z], flat: true });

  // flag
  cyl(0.015, 0.015, 1.1, 5, WOOD, [2.0, 0.85, 1.3]);
  box(0.35, 0.2, 0.02, ORANGE, [2.18, 1.3, 1.3]);

  return b.root;
}
