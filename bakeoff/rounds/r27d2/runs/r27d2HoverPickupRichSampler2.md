```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Raider",
  description: "Militarized pickup converted to four hover thrusters, low-poly cyberpunk: armour, neon, turret, decals.",
};

const NEON = "#ff2bd6", CYAN = "#2bf0ff", AMBER = "#ffb000";
const DARK = "#14161b", STEEL = "#6a7079", TRIM = "#1d2026", GLASS = "#5fc8ff";

// Painted hull: gunmetal with panel seams, edge wear and a cool-top / warm-bottom light
const HULL = paint((p, n) => {
  const base = mix("#2c323b", "#3b4452", smoothstep(0.2, 0.8, noise(p, 0.3, 4)));
  const f = (v: number) => { const k = ((v / 0.45) % 1 + 1) % 1; return Math.min(k, 1 - k) * 0.45; };
  const seam = (Math.abs(n.x) < 0.7 && f(p.x + 0.1) < 0.012) || (Math.abs(n.y) < 0.7 && f(p.y) < 0.012) || (Math.abs(n.z) < 0.7 && f(p.z + 0.2) < 0.012);
  if (seam) return "#0d0f12";
  if (noise(p, 0.04, 9) > 0.8) return "#8a929c";
  const c = mix(base, "#6a86a8", Math.max(0, n.y) * 0.25);
  return mix(c, "#1a1216", Math.max(0, -n.y) * 0.5);
});
const CHEV = paint((p) => (((((p.x + p.z * 0.0 + p.y) / 0.14) % 1) + 1) % 1 < 0.5 ? "#e9c32a" : "#15161a"));
const ARMOUR = paint((p, n) => (noise(p, 0.05, 3) > 0.78 ? "#7c848e" : mix("#232830", "#323a46", Math.max(0, n.y))));

const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cy = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "hoverRaider" });
  const ch = b.joint("chassis", { at: [0, 0.75, 0], role: "spine" });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: ch, at, ...o });

  // frame, hull and underbelly
  P(bx(1.9, 0.5, 4.8), HULL, [0, 0.95, 0]);
  P(bx(1.2, 0.2, 4.4), DARK, [0, 0.62, 0]);
  P(bx(1.4, 0.06, 3.6), "#0b0c0f", [0, 0.5, 0]);
  for (const s of [1, -1]) {
    P(bx(0.06, 0.34, 3.4), TRIM, [s * 0.97, 0.9, -0.1]); // side rail
    glow(b.rod([s * 1.0, 0.8, -2.2], [s * 1.0, 0.8, 2.0], 0.018, NEON, { bone: ch, sides: 6 }), 1.6);
    glow(b.rod([s * 0.6, 0.52, -2.0], [s * 0.6, 0.52, 2.0], 0.02, CYAN, { bone: ch, sides: 6 }), 1.6);
  }

  // landing skids
  for (const s of [1, -1]) {
    b.rod([s * 0.7, 0.06, -2.2], [s * 0.7, 0.06, 2.0], 0.06, STEEL, { bone: ch, sides: 8 });
    b.rod([s * 0.7, 0.06, 2.0], [s * 0.7, 0.2, 2.3], 0.05, STEEL, { bone: ch, sides: 8 });
    for (const z of [-1.4, 0, 1.4]) b.rod([s * 0.7, 0.06, z], [s * 0.5, 0.7, z], 0.045, DARK, { bone: ch, sides: 6 });
  }

  // hover thruster pods at the four old wheel stations
  const pods: Record<string, any> = {};
  for (const [k, s, z] of [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]] as const) {
    const at: [number, number, number] = [s * 1.2, 0.62, z];
    b.rod([s * 0.9, 0.85, z], [s * 1.2, 0.62, z], 0.07, STEEL, { bone: ch, sides: 6 }); // arm
    b.rod([s * 0.9, 0.7, z - 0.3], [s * 1.2, 0.55, z], 0.04, DARK, { bone: ch, sides: 6 });
    const fan = b.joint(`fan${k}`, { parent: ch, at, dir: [0, 1, 0], up: [1, 0, 0], role: "hinge" });
    pods[k] = fan;
    b.lathe([[0, 0], [0.4, 0], [0.45, 0.06], [0.45, 0.32], [0.38, 0.34], [0.36, 0.1], [0, 0.1]],
      { at: [at[0], at[1] - 0.2, at[2]], axis: [0, 1, 0], segments: 10, bone: ch, color: ARMOUR }); // shroud
    P(new THREE.TorusGeometry(0.43, 0.025, 5, 12), NEON, [at[0], at[1] - 0.2, at[2]], { rotation: [90, 0, 0] });
    glow(b.part(cy(0.34, 0.03, 12), CYAN, { bone: ch, at: [at[0], at[1] - 0.17, at[2]], flat: true }), 1.7); // plume disc
    b.part(cy(0.07, 0.14, 8), STEEL, { bone: fan, at });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * 360;
      b.part(bx(0.28, 0.015, 0.07), "#9aa3ad", {
        bone: fan, at: [at[0] + 0.19 * Math.sin((a * Math.PI) / 180), at[1], at[2] + 0.19 * Math.cos((a * Math.PI) / 180)],
        rotation: [0, a, 0], flat: true,
      });
    }
  }

  // cab
  P(bx(1.9, 0.5, 1.6), HULL, [0, 1.45, 0.45]);
  P(bx(1.92, 0.08, 1.62), TRIM, [0, 1.72, 0.45]);
  P(bx(1.6, 0.1, 1.5), ARMOUR, [0, 1.84, 0.4]); // roof plate
  P(bx(1.7, 0.4, 0.05), GLASS, [0, 1.5, 1.22], { rotation: [-28, 0, 0] }); // raked screen
  P(bx(1.7, 0.3, 0.05), GLASS, [0, 1.52, -0.37]);
  for (const s of [1, -1]) {
    P(bx(0.04, 0.3, 1.0), GLASS, [s * 0.96, 1.52, 0.5]); // side glass
    P(bx(0.12, 0.62, 0.5), CHEV, [s * 0.99, 1.1, 0.5]); // door armour
    P(bx(0.16, 0.5, 1.0), ARMOUR, [s * 1.0, 1.28, 0.2], { rotation: [0, 0, s * 8] });
    P(bx(0.06, 0.1, 0.3), AMBER, [s * 1.05, 1.5, 0.75]);
    P(bx(0.04, 0.2, 0.3), "#0d0f12", [s * 1.1, 1.6, 1.0]); // mirror
    P(bx(0.5, 0.12, 0.12), STEEL, [s * 0.95, 1.9, 0.4]); // roof bar ends
  }
  // hood and nose
  b.frustumBox([0, 1.3, 1.25], [0, 1.15, 2.55], [1.8, 0.5], [1.7, 0.36], { bone: ch, color: HULL });
  P(bx(0.5, 0.05, 1.1), ARMOUR, [0, 1.52, 1.85]);
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.9, 0], [0.7, 0.18, "sharp"], [0.1, 0.18]], {
      at: [s * 0.62, 1.55, 1.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, color: ARMOUR, bone: ch });
    glow(P(bx(0.5, 0.06, 0.03), CYAN, [s * 0.6, 1.2, 2.58]), 1.8); // slit headlamp
    P(bx(0.54, 0.03, 0.08), TRIM, [s * 0.6, 1.27, 2.57]);
  }
  P(bx(1.0, 0.3, 0.06), DARK, [0, 1.0, 2.57]); // grille
  for (let i = 0; i < 5; i++) glow(P(bx(0.8, 0.014, 0.02), NEON, [0, 0.9 + i * 0.06, 2.61]), 1.2);
  P(bx(2.0, 0.2, 0.2), ARMOUR, [0, 0.75, 2.5]); // ram bumper
  for (let i = 0; i < 6; i++) b.spike([-0.8 + i * 0.32, 0.75, 2.6], [0, 0, 1], 0.2, 0.05, STEEL, { bone: ch, sides: 5 });

  // roof light bar + antenna
  P(bx(1.2, 0.08, 0.12), DARK, [0, 1.95, 0.95]);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) glow(P(cy(0.045, 0.02, 8), "#ff3a2a", [x, 1.95, 1.02], { rotation: [90, 0, 0] }), 1.5);
  b.spike([-0.8, 1.9, -0.2], [0, 1, 0], 1.1, 0.02, STEEL, { bone: ch, sides: 5 });
  glow(P(new THREE.SphereGeometry(0.035, 6, 4), "#ff3a2a", [-0.8, 3.0, -0.2]), 1.6);

  // bed
  P(bx(1.9, 0.08, 2.2), DARK, [0, 1.2, -1.5]);
  P(bx(1.9, 0.5, 0.08), HULL, [0, 1.45, -2.58]);
  P(bx(1.9, 0.55, 0.08), HULL, [0, 1.48, -0.4]);
  for (const s of [1, -1]) {
    P(bx(0.1, 0.55, 2.2), HULL, [s * 0.93, 1.48, -1.5]);
    P(bx(0.14, 0.06, 2.2), ARMOUR, [s * 0.93, 1.78, -1.5]);
    for (const z of [-2.1, -1.5, -0.9]) P(bx(0.04, 0.4, 0.1), TRIM, [s * 1.0, 1.45, z]);
    // rear thrusters
    b.lathe([[0, 0], [0.2, 0], [0.16, 0.1], [0.3, 0.45], [0.26, 0.45], [0.12, 0.12], [0, 0.14]],
      { at: [s * 0.55, 1.1, -2.62], axis: [0, 0, -1], segments: 8, bone: ch, color: STEEL });
    glow(P(cy(0.1, 0.03, 8), CYAN, [s * 0.55, 1.1, -2.7], { rotation: [90, 0, 0] }), 1.8);
  }
  for (let i = -3; i <= 3; i++) P(bx(0.08, 0.03, 2.1), TRIM, [i * 0.25, 1.26, -1.5]);
  // cargo: fuel/cell canisters with glow bands
  for (const x of [-0.55, 0.55]) {
    P(cy(0.17, 0.5, 8), "#3b4a3e", [x, 1.52, -2.2]);
    glow(P(cy(0.175, 0.05, 8), AMBER, [x, 1.55, -2.2]), 1.3);
  }
  // roll bar behind cab
  for (const s of [1, -1]) b.rod([s * 0.85, 1.25, -0.5], [s * 0.85, 2.2, -0.55], 0.04, STEEL, { bone: ch, sides: 6 });
  b.rod([-0.85, 2.2, -0.55], [0.85, 2.2, -0.55], 0.04, STEEL, { bone: ch, sides: 6 });
  for (const x of [-0.5, 0.5]) glow(P(bx(0.2, 0.08, 0.04), CYAN, [x, 2.2, -0.62]), 1.5);

  // turret on pedestal
  P(cy(0.28, 0.3, 10), ARMOUR, [0, 1.42, -1.5], { flat: true });
  const yaw = b.joint("yaw", { parent: ch, at: [0, 1.57, -1.5], dir: [0, 1, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 1.85, -1.5], dir: [0, 0, 1], role: "hinge" });
  b.part(cy(0.34, 0.14, 10), ARMOUR, { bone: yaw, at: [0, 1.63, -1.5], flat: true });
  for (const s of [1, -1]) b.part(bx(0.06, 0.34, 0.4), HULL, { bone: yaw, at: [s * 0.2, 1.84, -1.5] });
  b.part(bx(0.3, 0.24, 0.5), HULL, { bone: pitch, at: [0, 1.85, -1.55] });
  for (const s of [1, -1]) {
    b.rod([s * 0.08, 1.85, -1.4], [s * 0.08, 1.85, -0.3], 0.04, DARK, { bone: pitch, sides: 8 });
    b.part(bx(0.08, 0.1, 0.16), STEEL, { bone: pitch, at: [s * 0.08, 1.85, -0.25] });
    glow(b.part(cy(0.025, 0.02, 6), CYAN, { bone: pitch, at: [s * 0.08, 1.85, -0.16], rotation: [90, 0, 0] }), 1.6);
  }
  b.part(bx(0.2, 0.2, 0.3), "#262a30", { bone: pitch, at: [0.3, 1.82, -1.6] }); // ammo box

  // decals & screen
  const NUM = svg(`<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="none" stroke="#f2f2f2" stroke-width="5"/><text x="64" y="58" font-family="Arial Black,Arial" font-weight="900" font-size="54" fill="#f2f2f2" text-anchor="middle">77</text></svg>`, { size: 256 });
  const WARN = svg(`<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#f2c20a" stroke="#111" stroke-width="5"/><polygon points="52,26 36,54 48,54 42,76 62,44 50,44 56,26" fill="#111"/></svg>`, { size: 192 });
  const HUD = svg(`<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><circle cx="80" cy="50" r="22" fill="none" stroke="#2bf0ff" stroke-width="2"/><circle cx="80" cy="50" r="4" fill="#2bf0ff"/><line x1="48" y1="50" x2="112" y2="50" stroke="#2bf0ff" stroke-width="2"/><rect x="8" y="80" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="80" width="44" height="6" fill="#2bf0ff"/><text x="152" y="18" font-family="monospace" font-size="12" fill="#ff2bd6" text-anchor="end">HOVER OK</text></svg>`, { size: 256 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.4, 0.22), "#ffffff", { bone: ch, at: [s * 1.0, 1.55, -1.5], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: NUM });
  }
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: ch, at: [0.5, 1.5, -2.63], dir: [0, 0, -1], axis: "z", texture: WARN });
  glow(b.part(new THREE.PlaneGeometry(0.4, 0.25), "#ffffff", { bone: ch, at: [0, 1.5, -0.45], dir: [0, 0, -1], axis: "z", texture: HUD }), 1.3);

  return b.root;
}
```