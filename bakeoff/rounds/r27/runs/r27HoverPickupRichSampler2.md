```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Raider",
  description: "Militarized pickup converted to hover thrusters: armoured low-poly cyberpunk skiff with a bed turret, neon and four lift pods.",
};

const NEON = "#ff2bd6";
const CYAN = "#2bf0ff";
const AMBER = "#ffb000";
const GUN = "#2b3038";
const DARK = "#14161a";
const STEEL = "#6a7079";

// body paint: gunmetal, lit from above, panel seams, chipped edges, grime near the floor
const hullPaint = paint((p, n) => {
  let c = mix("#242932", "#3b424d", 0.5 + 0.5 * n.y);
  const ax = Math.abs(n.x), ay = Math.abs(n.y);
  const [u, v] = ax > 0.6 ? [p.z, p.y] : ay > 0.6 ? [p.x, p.z] : [p.x, p.y];
  const fu = ((u / 0.5) % 1 + 1) % 1, fv = ((v / 0.35) % 1 + 1) % 1;
  if (fu < 0.015 || fv < 0.02) c = mix(c, "#07080a", 0.85);
  if (noise(p, 0.04, 4) > 0.8) c = mix(c, "#8a919b", 0.6);
  c = mix(c, "#15171b", 0.5 * smoothstep(0.9, 0.3, p.y) * noise(p, 0.2, 9));
  return c;
});
const hazard = paint((p) => ((((p.x + p.y + p.z) / 0.12) % 1 + 1) % 1 < 0.5 ? AMBER : "#16161a"));
const plateP = paint((p, n) => mix("#4a3a52", "#2c2433", 0.5 - 0.5 * n.y + 0.2 * noise(p, 0.1, 2)));

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "hoverRaider" });
  const chassis = b.joint("chassis", { at: [0, 0.8, 0], role: "spine" });
  const P = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: chassis, at, flat: true, ...o });

  // ---- hull
  b.frustumBox([0, 0.9, -2.5], [0, 0.9, 1.9], [2.0, 0.5], [1.9, 0.5], { bone: chassis, color: hullPaint });
  b.frustumBox([0, 0.88, 1.9], [0, 0.8, 2.6], [1.9, 0.5], [1.5, 0.3], { bone: chassis, color: hullPaint }); // nose
  P(box(1.4, 0.2, 5.0), DARK, [0, 0.58, 0]); // belly pan
  P(box(1.1, 0.06, 4.6), "#0b0c0f", [0, 0.47, 0]);
  // hood
  b.frustumBox([0, 1.2, 0.95], [0, 1.1, 2.4], [1.85, 0.2], [1.55, 0.14], { bone: chassis, color: hullPaint });
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) P(box(0.3, 0.02, 0.035), CYAN, [s * 0.5, 1.31 - i * 0.012, 1.35 + i * 0.2], { rotation: [0, 0, 0] }); // hood vents
    glow(P(box(0.3, 0.02, 0.035), CYAN, [s * 0.5, 1.33, 1.2]));
  }
  // cab
  P(box(1.9, 0.55, 1.7), hullPaint, [0, 1.42, 0.1]);
  P(box(1.8, 0.1, 1.2), hullPaint, [0, 2.03, -0.1]); // roof
  P(box(1.72, 0.62, 0.05), "#7fd8ee", [0, 1.7, 0.98], { rotation: [-32, 0, 0] }); // raked screen
  glow(P(box(1.66, 0.05, 0.04), CYAN, [0, 1.45, 1.1]), 0.8);
  P(box(1.74, 0.48, 0.05), "#5aa8c0", [0, 1.75, -0.85]);
  for (const s of [1, -1]) {
    P(box(0.05, 0.4, 1.0), "#5aa8c0", [s * 0.96, 1.75, 0.15]); // side glass
    for (const z of [-0.45, 0.15, 0.7]) P(box(0.08, 0.5, 0.08), GUN, [s * 0.95, 1.75, z]);
    P(box(0.12, 0.05, 1.2), GUN, [s * 0.9, 2.08, 0.05]);
  }
  // bed
  P(box(1.95, 0.08, 2.4), DARK, [0, 1.12, -1.3]);
  for (let i = -3; i <= 3; i++) P(box(0.07, 0.03, 2.3), "#23262c", [i * 0.27, 1.17, -1.3]);
  P(box(1.95, 0.55, 0.08), hullPaint, [0, 1.4, -0.12]);
  P(box(1.95, 0.55, 0.08), hullPaint, [0, 1.4, -2.5]);
  for (const s of [1, -1]) {
    P(box(0.08, 0.55, 2.5), hullPaint, [s * 0.98, 1.4, -1.3]);
    P(box(0.16, 0.06, 2.55), hazard, [s * 0.98, 1.7, -1.3]);
    P(box(0.06, 0.4, 1.5), plateP, [s * 1.04, 1.38, -1.3]); // side armour
    for (const z of [-0.8, -1.8]) for (const y of [1.26, 1.52]) P(cyl(0.025, 0.04, 6), STEEL, [s * 1.08, y, z], { rotation: [0, 0, 90] });
    P(box(0.14, 0.3, 1.9), hullPaint, [s * 1.0, 0.95, 0.0]); // sponson skirt
    glow(b.rod([s * 1.08, 1.02, -2.4], [s * 1.08, 1.02, 2.2], 0.018, s > 0 ? NEON : CYAN, { bone: chassis, sides: 6 }), 1.6);
  }
  // bumpers & lights
  b.frustumBox([0, 0.95, 2.55], [0, 0.95, 2.75], [2.0, 0.3], [2.1, 0.3], { bone: chassis, color: hazard });
  P(box(2.1, 0.08, 0.25), DARK, [0, 0.76, 2.75]);
  for (let i = 0; i < 5; i++) b.spike([-0.8 + i * 0.4, 0.8, 2.82], [0, -0.3, 1], 0.22, 0.045, STEEL, { bone: chassis, sides: 5 });
  for (const s of [1, -1]) {
    P(box(0.5, 0.14, 0.1), DARK, [s * 0.65, 1.0, 2.52]);
    glow(P(box(0.44, 0.07, 0.04), "#bffcff", [s * 0.65, 1.0, 2.58]), 1.4);
    glow(P(box(0.4, 0.08, 0.04), "#ff2a3a", [s * 0.75, 1.15, -2.56]), 1.4);
  }
  P(box(2.0, 0.24, 0.14), hazard, [0, 0.82, -2.6]);
  // rear thrusters
  for (const s of [1, -1]) {
    b.lathe([[0, 0], [0.2, 0], [0.16, 0.12], [0.27, 0.6], [0.23, 0.6], [0.12, 0.14], [0, 0.16]], {
      at: [s * 0.55, 1.0, -2.62], axis: [0, 0, -1], segments: 8, bone: chassis, color: STEEL,
    });
    glow(P(cyl(0.12, 0.03, 8), CYAN, [s * 0.55, 1.0, -2.78], { rotation: [90, 0, 0] }), 1.8);
  }
  // roof: light bar, antenna, sensor
  P(box(1.3, 0.1, 0.14), DARK, [0, 2.14, 0.55]);
  for (let i = 0; i < 4; i++) glow(P(box(0.24, 0.06, 0.03), i % 2 ? NEON : CYAN, [-0.45 + i * 0.3, 2.14, 0.63]), 1.6);
  b.spike([-0.8, 2.08, -0.5], [0, 1, 0], 1.0, 0.018, STEEL, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), "#ff2a3a", { bone: chassis, at: [-0.8, 3.12, -0.5] }), 2);
  P(new THREE.SphereGeometry(0.16, 8, 4, 0, 6.28, 0, 1.57), "#2a6f82", [0.7, 2.08, -0.5]);
  // ---- bed turret
  P(cyl(0.34, 0.2, 10), STEEL, [0, 1.28, -1.5]);
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.4, -1.5], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 1.75, -1.5], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.3, 0.2, 10), GUN, { bone: yaw, at: [0, 1.5, -1.5], flat: true });
  b.part(cyl(0.05, 0.36, 6), STEEL, { bone: yaw, at: [0, 1.6, -1.5] });
  for (const s of [1, -1]) {
    b.part(box(0.06, 0.34, 0.4), GUN, { bone: yaw, at: [s * 0.3, 1.72, -1.5] });
    b.part(box(0.22, 0.26, 0.4), "#1b1d22", { bone: yaw, at: [s * 0.5, 1.7, -1.55] }); // ammo
    b.part(box(0.2, 0.2, 0.5), GUN, { bone: pitch, at: [s * 0.12, 1.78, -1.55] });
    b.rod([s * 0.12, 1.78, -1.4], [s * 0.12, 1.78, -0.5], 0.04, STEEL, { bone: pitch, sides: 8 });
    b.part(cyl(0.065, 0.2, 8), DARK, { bone: pitch, at: [s * 0.12, 1.78, -0.52], rotation: [90, 0, 0] });
    glow(b.part(cyl(0.025, 0.02, 6), CYAN, { bone: pitch, at: [s * 0.12, 1.78, -0.41], rotation: [90, 0, 0] }), 1.8);
  }
  b.rod([-0.3, 1.74, -1.5], [0.3, 1.74, -1.5], 0.035, STEEL, { bone: pitch, sides: 6 });
  // rear roll bar
  for (const s of [1, -1]) b.rod([s * 0.9, 1.15, -2.4], [s * 0.9, 2.1, -2.3], 0.035, STEEL, { bone: chassis, sides: 6 });
  b.rod([-0.9, 2.1, -2.3], [0.9, 2.1, -2.3], 0.035, STEEL, { bone: chassis, sides: 6 });

  // ---- decals & screen
  const num = svg(`<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="none" stroke="#2bf0ff" stroke-width="5"/><text x="64" y="56" font-family="Arial Black,Arial" font-weight="900" font-size="52" fill="#2bf0ff" text-anchor="middle">R-77</text></svg>`, { size: 256 });
  const logo = svg(`<svg viewBox="0 0 96 96"><polygon points="48,4 88,26 88,70 48,92 8,70 8,26" fill="#14161a" stroke="#ff2bd6" stroke-width="5"/><polyline points="22,60 48,30 74,60" fill="none" stroke="#ff2bd6" stroke-width="9"/><polyline points="32,76 48,56 64,76" fill="none" stroke="#2bf0ff" stroke-width="7"/></svg>`, { size: 192 });
  const hud = svg(`<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><circle cx="80" cy="50" r="24" fill="none" stroke="#2bf0ff" stroke-width="2"/><circle cx="80" cy="50" r="4" fill="#ff2bd6"/><line x1="48" y1="50" x2="112" y2="50" stroke="#2bf0ff" stroke-width="2"/><line x1="80" y1="18" x2="80" y2="82" stroke="#2bf0ff" stroke-width="2"/><rect x="8" y="84" width="70" height="7" fill="#2bf0ff"/><text x="152" y="18" font-family="monospace" font-size="13" fill="#2bf0ff" text-anchor="end">HOVER OK</text></svg>`, { size: 320 });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex });
  plane(0.7, 0.4, num, [1.1, 1.38, -1.3], [1, 0, 0]);
  plane(0.7, 0.4, num, [-1.1, 1.38, -1.3], [-1, 0, 0]);
  plane(0.4, 0.4, logo, [0, 1.42, -2.55], [0, 0, -1]);
  plane(0.4, 0.4, logo, [0.97, 1.4, 0.7], [1, 0, 0]);
  plane(0.4, 0.4, logo, [-0.97, 1.4, 0.7], [-1, 0, 0]);
  glow(plane(0.5, 0.32, hud, [0.55, 1.62, -0.2 - 0.07], [0, 0, -1]), 1.3);

  // ---- hover thrusters
  const corners: [string, number, number][] = [["FL", 1, 1.6], ["FR", -1, 1.6], ["RL", 1, -1.6], ["RR", -1, -1.6]];
  for (const [k, s, z] of corners) {
    const x = s * 1.3;
    const pod = b.joint(`thruster${k}`, { parent: chassis, at: [x, 0.5, z], dir: [0, 1, 0], role: "hinge" });
    b.lathe([[0.3, 0], [0.46, 0.12], [0.46, 0.44], [0.32, 0.56], [0.28, 0.42], [0.28, 0.1]], {
      at: [x, 0, z], axis: [0, 1, 0], segments: 10, bone: pod, color: hullPaint,
    });
    glow(b.part(cyl(0.27, 0.02, 10), CYAN, { bone: pod, at: [x, 0.07, z], flat: true }), 1.8);
    const fan = b.joint(`fan${k}`, { parent: pod, at: [x, 0.2, z], dir: [0, 1, 0], role: "hinge" });
    b.part(cyl(0.05, 0.1, 6), STEEL, { bone: fan, at: [x, 0.2, z] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(box(0.22, 0.012, 0.06), "#9aa4b0", {
        bone: fan, at: [x + 0.13 * Math.sin(a), 0.2, z + 0.13 * Math.cos(a)], rotation: [0, (a * 180) / Math.PI, 12],
      });
    }
    b.part(new THREE.TorusGeometry(0.46, 0.025, 5, 12), NEON, { bone: pod, at: [x, 0.22, z], rotation: [90, 0, 0] });
    glow(b.part(new THREE.TorusGeometry(0.47, 0.018, 5, 12), NEON, { bone: pod, at: [x, 0.3, z], rotation: [90, 0, 0] }), 1.8);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.78;
      b.part(box(0.08, 0.14, 0.08), STEEL, { bone: pod, at: [x + 0.44 * Math.sin(a), 0.5, z + 0.44 * Math.cos(a)] });
    }
    b.rod([x, 0.5, z], [s * 0.75, 0.85, z], 0.08, GUN, { bone: chassis, section: "box" }); // pylon
    b.rod([x, 0.45, z - 0.2], [s * 0.8, 0.7, z - 0.4], 0.04, STEEL, { bone: chassis, sides: 6 });
  }
  // frame cross-members
  for (const z of [-1.6, 1.6]) b.rod([-1.0, 0.7, z], [1.0, 0.7, z], 0.06, DARK, { bone: chassis, sides: 6 });

  return b.root;
}
```