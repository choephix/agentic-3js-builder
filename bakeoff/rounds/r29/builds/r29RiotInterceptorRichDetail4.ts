import * as THREE from "three";
import { createBuilder, svg, paint, noise, mix, smoothstep, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Riot-Control Interceptor",
  description:
    "Corporate armoured riot interceptor with a roof-mounted water cannon, hazard-striped bull bar and neon light bars. Cyberpunk style.",
};

const NAVY = "#1a2133", TRIM = "#0c0e15", STEEL = "#6b7385", YEL = "#f2d21b";
const CYAN = "#19f2ff", MAG = "#ff2fa8", GLASS = "#0a3442", TYRE = "#16171b", RED = "#ff2840";

const hull = panelled(
  paint((p, n) => {
    const grime = smoothstep(1.5, 0.5, p.y) * 0.65 + noise(p, 0.35, 3) * 0.2;
    const top = smoothstep(0.5, 1, n.y) * 0.15;
    return mix(mix(NAVY, "#2d3a58", top), "#07080d", Math.min(grime, 0.85));
  }),
  { size: 0.45, rivets: 0.09 },
);

const logoTex = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="196" height="96" rx="8" fill="#0c0e15" stroke="#19f2ff" stroke-width="3"/>
  <polygon points="30,75 52,22 74,75 62,75 52,48 42,75" fill="#ff2fa8"/>
  <circle cx="52" cy="62" r="6" fill="#19f2ff"/>
  <text x="88" y="48" font-family="sans-serif" font-weight="bold" font-size="22" fill="#19f2ff">ORBITEK</text>
  <text x="88" y="72" font-family="sans-serif" font-weight="bold" font-size="15" fill="#f2d21b">RIOT CONTROL</text>
  </svg>`,
  { size: 512 },
);
const hazardTex = svg(
  `<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="30" fill="#f2d21b"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<polygon points="${i * 20 - 10},30 ${i * 20},30 ${i * 20 + 20},0 ${i * 20 + 10},0" fill="#101010"/>`).join("")}
  </svg>`,
  { size: 256 },
);
const warnTex = svg(
  `<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="60" rx="6" fill="#0c0e15" stroke="#ff2840" stroke-width="3"/>
  <text x="120" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#ff2840">DISPERSE</text>
  <text x="120" y="48" text-anchor="middle" font-family="monospace" font-size="14" fill="#19f2ff">HIGH PRESSURE · KEEP CLEAR</text></svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const ch = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const box = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: ch, at, ...o });
  const cyl = (r: number, h: number, s: number, col: any, at: number[], rot: number[] = [0, 0, 0], bone: any = ch) =>
    b.part(new THREE.CylinderGeometry(r, r, h, s), col, { bone, at, rotation: rot, flat: true });

  // frame and underbody
  box(1.9, 0.3, 5.6, TRIM, [0, 0.62, 0]);
  for (const z of [-1.9, 1.9]) cyl(0.12, 2.2, 8, STEEL, [0, 0.55, z], [0, 0, 90]);
  // lower hull, nose, cab, rear box
  box(2.3, 0.85, 5.6, hull, [0, 1.15, 0]);
  b.frustumBox([0, 1.5, 1.6], [0, 1.35, 3.0], [2.2, 0.7], [2.1, 0.5], { bone: ch, color: hull });
  box(2.1, 0.95, 1.7, hull, [0, 2.05, 0.75]);
  box(2.3, 1.3, 2.7, hull, [0, 2.0, -1.55]);
  box(2.1, 0.08, 1.7, TRIM, [0, 2.55, 0.75]);
  box(2.3, 0.1, 2.7, TRIM, [0, 2.69, -1.55]);
  // windscreen and side windows
  box(1.8, 0.55, 0.06, GLASS, [0, 2.1, 1.62], { rotation: [-22, 0, 0] });
  box(1.8, 0.05, 0.1, TRIM, [0, 2.4, 1.6]);
  for (const s of [1, -1]) {
    box(0.05, 0.4, 1.0, GLASS, [s * 1.06, 2.15, 0.85]);
    for (let i = 0; i < 5; i++) box(0.04, 0.4, 0.03, STEEL, [s * 1.09, 2.15, 0.4 + i * 0.22]); // window bars
    box(0.05, 0.2, 0.12, TRIM, [s * 1.07, 1.78, 0.9]); // door handle recess
    box(0.07, 0.04, 0.4, TRIM, [s * 1.08, 1.7, 0.2]);
    // mirrors
    b.rod([s * 1.1, 2.1, 1.5], [s * 1.38, 2.2, 1.55], 0.02, STEEL, { bone: ch, sides: 6 });
    box(0.06, 0.28, 0.2, TRIM, [s * 1.4, 2.2, 1.55]);
    glow(box(0.02, 0.2, 0.14, CYAN, [s * 1.43, 2.2, 1.55]), 1.2);
    // armour side plates with rivets
    for (let i = 0; i < 3; i++) {
      box(0.06, 0.7, 0.8, TRIM, [s * 1.17, 1.15, -0.5 - i * 0.9 + 1.6 - 1.2 + 0.6]);
      for (const dz of [-0.3, 0.3])
        for (const dy of [-0.25, 0.25]) cyl(0.03, 0.04, 6, STEEL, [s * 1.21, 1.15 + dy, -0.1 - i * 0.9 + dz], [0, 0, 90]);
    }
    // rear box vents
    for (let i = 0; i < 4; i++) box(0.04, 0.05, 0.9, TRIM, [s * 1.16, 2.2 + i * 0.1, -1.6]);
    // neon underglow and side strips
    glow(box(0.05, 0.05, 4.2, s > 0 ? MAG : CYAN, [s * 1.0, 0.52, 0]), 1.6);
    glow(box(0.04, 0.04, 2.5, s > 0 ? CYAN : MAG, [s * 1.18, 1.62, -1.5]), 1.4);
    // wheel arches
    for (const z of [-1.9, 1.9]) {
      box(0.3, 0.12, 1.3, TRIM, [s * 1.18, 1.1, z]);
      box(0.06, 0.4, 1.3, hull, [s * 1.3, 0.95, z]);
    }
    // headlights, taillights
    glow(box(0.55, 0.09, 0.05, "#e8fbff", [s * 0.72, 1.4, 3.05]), 1.8);
    glow(box(0.4, 0.07, 0.05, RED, [s * 0.8, 1.9, -2.92]), 1.8);
    glow(box(0.2, 0.2, 0.05, RED, [s * 0.88, 1.5, -2.92]), 1.6);
    // roof spotlights
    cyl(0.09, 0.14, 8, TRIM, [s * 0.6, 2.67, 1.4], [90, 0, 0]);
    glow(cyl(0.07, 0.02, 8, "#ffffff", [s * 0.6, 2.67, 1.48], [90, 0, 0]), 1.8);
  }

  // grille and bull bar with hazard stripes
  box(1.5, 0.45, 0.1, TRIM, [0, 1.05, 3.02]);
  for (let i = 0; i < 6; i++) box(1.4, 0.03, 0.05, STEEL, [0, 0.88 + i * 0.07, 3.08]);
  box(2.3, 0.4, 0.3, TRIM, [0, 0.75, 3.0]);
  b.part(new THREE.PlaneGeometry(2.1, 0.35), "#ffffff", { bone: ch, at: [0, 0.75, 3.16], texture: hazardTex });
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 0.7, 3.1], [s * 0.9, 1.5, 3.1], 0.05, STEEL, { bone: ch, sides: 6 });
    b.rod([s * 0.4, 0.7, 3.1], [s * 0.4, 1.3, 3.1], 0.04, STEEL, { bone: ch, sides: 6 });
  }
  b.rod([-0.9, 1.5, 3.1], [0.9, 1.5, 3.1], 0.05, STEEL, { bone: ch, sides: 6 });
  b.rod([-0.9, 1.1, 3.12], [0.9, 1.1, 3.12], 0.035, STEEL, { bone: ch, sides: 6 });
  glow(box(1.6, 0.04, 0.04, MAG, [0, 0.52, 3.1]), 1.6);
  // rear bumper + warning sign
  box(2.3, 0.35, 0.3, TRIM, [0, 0.75, -2.95]);
  b.part(new THREE.PlaneGeometry(2.0, 0.28), "#ffffff", { bone: ch, at: [0, 0.75, -3.11], rotation: [0, 180, 0], texture: hazardTex });
  b.part(new THREE.PlaneGeometry(1.4, 0.35), "#ffffff", { bone: ch, at: [0, 1.7, -2.91], rotation: [0, 180, 0], texture: warnTex });
  box(0.9, 0.6, 0.04, TRIM, [0.5, 2.3, -2.92]);
  box(0.9, 0.6, 0.04, TRIM, [-0.5, 2.3, -2.92]);

  // side corporate decals
  b.part(new THREE.PlaneGeometry(1.5, 0.75), "#ffffff", { bone: ch, at: [1.2, 1.2, 1.6 - 1.0], rotation: [0, 90, 0], texture: logoTex });
  b.part(new THREE.PlaneGeometry(1.5, 0.75), "#ffffff", { bone: ch, at: [-1.2, 1.2, 0.6], rotation: [0, -90, 0], texture: logoTex });
  b.part(new THREE.PlaneGeometry(1.2, 0.6), "#ffffff", { bone: ch, at: [0, 1.62, 3.0 - 0.2], rotation: [-80, 0, 0], texture: logoTex });

  // roof light bar: alternating cyan / magenta
  box(1.9, 0.12, 0.3, TRIM, [0, 2.65, 1.1]);
  for (let i = 0; i < 6; i++) {
    glow(box(0.28, 0.1, 0.08, i % 2 ? MAG : CYAN, [-0.7 + i * 0.28, 2.72, 1.1 + 0.1]), 2);
    glow(box(0.28, 0.1, 0.08, i % 2 ? CYAN : MAG, [-0.7 + i * 0.28, 2.72, 1.1 - 0.1]), 2);
  }
  // cab front light strip & antenna
  glow(box(1.9, 0.04, 0.04, CYAN, [0, 2.47, 1.68]), 1.6);
  b.spike([-0.95, 2.7, -0.3], [0, 1, 0], 1.3, 0.02, STEEL, { bone: ch, sides: 5 });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { bone: ch, at: [-0.95, 4.02, -0.3] });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { bone: ch, at: [-0.95, 4.02, -0.3] }), 2);

  // water tanks on rear roof flanks
  for (const s of [1, -1]) {
    cyl(0.3, 2.0, 10, "#2a4a63", [s * 0.7, 2.98, -1.9], [90, 0, 0]);
    for (const z of [-2.7, -1.1]) {
      cyl(0.32, 0.06, 10, STEEL, [s * 0.7, 2.98, z + 0.7 + (z < -2 ? 0.1 : 0)], [90, 0, 0]);
    }
    glow(box(0.04, 0.04, 1.6, CYAN, [s * 0.98, 3.1, -1.9]), 1.4);
  }

  // turret
  const yaw = b.joint("yaw", { parent: ch, at: [0, 2.74, -1.0], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 3.1, -1.0], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.42, 0.04, 6, 14), STEEL, { bone: ch, at: [0, 2.76, -1.0], rotation: [90, 0, 0] });
  cyl(0.36, 0.3, 12, hull, [0, 2.9, -1.0], [0, 0, 0], yaw);
  for (const s of [1, -1]) box(0.06, 0.4, 0.4, TRIM, [s * 0.2, 3.1, -1.0], { bone: yaw });
  cyl(0.06, 0.5, 8, STEEL, [0, 3.1, -1.0], [0, 0, 90], pitch);
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.5), TRIM, { bone: pitch, at: [0, 3.1, -1.1] });
  b.rod([0, 3.1, -0.9], [0, 3.1, 1.1], 0.1, "#3b4258", { bone: pitch, sides: 10 });
  cyl(0.14, 0.4, 10, STEEL, [0, 3.1, 0.2], [90, 0, 0], pitch);
  b.lathe([[0, 0], [0.12, 0], [0.21, 0.28], [0.17, 0.28], [0.09, 0.05], [0, 0.05]], {
    at: [0, 3.1, 1.1], axis: [0, 0, 1], segments: 10, bone: pitch, color: TRIM,
  });
  glow(b.part(new THREE.TorusGeometry(0.2, 0.025, 5, 12), CYAN, { bone: pitch, at: [0, 3.1, 1.38] }), 2);
  glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 8), CYAN, { bone: pitch, at: [0, 3.1, 1.2], rotation: [90, 0, 0] }), 1.5);
  // hose from tank to turret
  b.sweep(catmull([[0.7, 2.9, -2.8], [0.6, 3.4, -2.0], [0.2, 3.3, -1.3], [0.05, 3.15, -1.15]]), 0.06, TRIM, { bone: ch, sides: 6 });
  // pressure gauge
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10), "#7dffd4", { bone: yaw, at: [0.22, 3.0, -1.0], rotation: [0, 0, 90] }), 1.2);

  // wheels
  for (const [k, s, z] of [["FL", 1, 1.9], ["FR", -1, 1.9], ["RL", 1, -1.9], ["RR", -1, -1.9]] as const) {
    const w = b.joint(`wheel${k}`, { parent: ch, at: [s * 1.1, 0.55, z], dir: [1, 0, 0], role: "hinge" });
    const at = (dx: number, dy = 0, dz = 0) => [s * 1.1 + s * dx, 0.55 + dy, z + dz];
    cyl(0.55, 0.42, 14, TYRE, at(0), [0, 0, 90], w);
    cyl(0.33, 0.44, 12, STEEL, at(0), [0, 0, 90], w);
    cyl(0.24, 0.46, 12, TRIM, at(0), [0, 0, 90], w);
    glow(b.part(new THREE.TorusGeometry(0.3, 0.015, 5, 14), s > 0 ? MAG : CYAN, { bone: w, at: at(0.23), dir: [s, 0, 0], axis: "z" }), 1.6);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      cyl(0.025, 0.05, 6, STEEL, at(0.24, 0.16 * Math.cos(a), 0.16 * Math.sin(a)), [0, 0, 90], w);
      b.part(new THREE.BoxGeometry(0.3, 0.08, 0.12), TYRE, { bone: w, at: at(0, 0.56 * Math.cos(a), 0.56 * Math.sin(a)), rotation: [(a * 180) / Math.PI, 0, 0] });
    }
  }
  return b.root;
}
