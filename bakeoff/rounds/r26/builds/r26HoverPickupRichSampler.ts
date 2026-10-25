import * as THREE from "three";
import { createBuilder, paint, noise, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup with its wheels replaced by four ducted hover thrusters, a roof minigun, a bed rocket pod and neon trim, in a low-poly cyberpunk style.",
};

type V3 = [number, number, number];
const GLASS = "#0e3a4a", CYAN = "#2bf0ff", MAG = "#ff2bd6", STEEL = "#6a7079", DARK = "#14161c", GUN = "#262a30";

const seam = (v: number, s: number) => {
  const f = ((v / s) % 1 + 1) % 1;
  return Math.min(f, 1 - f) * s < 0.008;
};
const BODY = paint((p, n) => {
  if ((Math.abs(n.x) > 0.7 && (seam(p.z + 0.2, 0.6) || seam(p.y, 0.35))) ||
      (Math.abs(n.y) > 0.7 && (seam(p.x, 0.5) || seam(p.z, 0.6)))) return "#0c0e12";
  if (noise(p, 0.05, 3) > 0.8) return "#8a919b";
  if (p.y < 0.9) return "#1f242c";
  return n.y > 0.5 ? "#3d4552" : "#2c323c";
});
const HAZARD = paint((p) => ((((p.x + p.y) / 0.1) % 1 + 1) % 1 < 0.5 ? "#e9c32a" : "#15161a"));

const FONT = 'font-family="Arial Black, Arial, sans-serif" font-weight="900"';
const HUD = svg(`<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><g stroke="#0f4b5a" stroke-width="1">${[20,40,60,80,100,120,140].map(x=>`<line x1="${x}" y1="0" x2="${x}" y2="100"/>`).join("")}${[20,40,60,80].map(y=>`<line x1="0" y1="${y}" x2="160" y2="${y}"/>`).join("")}</g><circle cx="80" cy="50" r="22" fill="none" stroke="#2bf0ff" stroke-width="2"/><circle cx="80" cy="50" r="4" fill="#2bf0ff"/><rect x="8" y="78" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="78" width="44" height="6" fill="#2bf0ff"/><text x="152" y="18" font-family="monospace" font-size="12" fill="#2bf0ff" text-anchor="end">HOVER OK</text></svg>`, { size: 256 });
const UNIT = svg(`<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="none" stroke="#f2f2f2" stroke-width="5"/><text x="64" y="58" ${FONT} font-size="56" fill="#f2f2f2" text-anchor="middle">77</text></svg>`, { size: 256 });
const WARN = svg(`<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#f2c20a" stroke="#111" stroke-width="5"/><polygon points="52,26 36,54 48,54 42,76 62,44 50,44 56,26" fill="#111"/></svg>`, { size: 192 });
const BRAND = svg(`<svg viewBox="0 0 96 96"><polygon points="48,4 88,26 88,70 48,92 8,70 8,26" fill="#15161a" stroke="#ff2bd6" stroke-width="5"/><polyline points="22,60 48,30 74,60" fill="none" stroke="#2bf0ff" stroke-width="9"/><polyline points="32,74 48,54 64,74" fill="none" stroke="#ff2bd6" stroke-width="7"/></svg>`, { size: 192 });
const FANTEX = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#bfefff"/><circle cx="32" cy="32" r="22" fill="none" stroke="#2bf0ff" stroke-width="3"/><circle cx="32" cy="32" r="11" fill="none" stroke="#ffffff" stroke-width="3"/><circle cx="32" cy="32" r="4" fill="#ffffff"/></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const ch = b.joint("chassis", { at: [0, 0.8, 0], role: "spine" });
  const bx = (w: number, h: number, d: number, color: any, at: V3, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: ch, at, ...o });
  const cy = (r: number, h: number, sides: number, color: any, at: V3, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone: ch, at, flat: true, ...o });
  const plane = (tex: THREE.Texture, w: number, h: number, at: V3, dir: V3, bone: any = ch, g = false) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
    return g ? glow(p, 1.3) : p;
  };

  // hull and frame
  bx(1.9, 0.4, 5.0, BODY, [0, 0.75, 0]);
  bx(1.5, 0.12, 4.8, DARK, [0, 0.52, 0]);
  // hood
  b.frustumBox([0, 1.12, 0.9], [0, 1.02, 2.5], [1.9, 0.36], [1.8, 0.3], { bone: ch, color: BODY });
  bx(0.5, 0.05, 1.2, DARK, [0, 1.3, 1.7]); // hood scoop
  for (let i = 0; i < 4; i++) bx(0.4, 0.02, 0.05, GUN, [0, 1.33, 1.35 + i * 0.12]);
  // cab
  bx(1.9, 0.5, 1.5, BODY, [0, 1.2, -0.05]);
  bx(1.84, 0.42, 1.36, GLASS, [0, 1.66, -0.05]);
  glow(bx(1.86, 0.04, 1.38, "#1d7a8e", [0, 1.66, -0.05]), 0.5);
  for (const s of [1, -1])
    for (const z of [0.62, -0.72]) bx(0.1, 0.46, 0.1, BODY, [s * 0.9, 1.66, z]);
  bx(1.8, 0.1, 1.4, BODY, [0, 1.92, -0.05]);
  bx(1.4, 0.04, 1.0, STEEL, [0, 1.97, -0.05]);
  for (const s of [1, -1]) {
    bx(0.05, 0.04, 0.5, STEEL, [s * 0.96, 1.3, 0.0]); // door handles
    bx(0.04, 0.5, 0.04, DARK, [s * 0.95, 1.2, 0.3]); // door seam
    b.rod([s * 0.96, 1.9, 0.62], [s * 0.96, 1.35, 0.74], 0.03, STEEL, { bone: ch, sides: 6 }); // brush bar
  }
  // mirrors with cameras
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 1.55, 0.7], [s * 1.12, 1.6, 0.74], 0.015, STEEL, { bone: ch, sides: 5 });
    bx(0.08, 0.14, 0.12, DARK, [s * 1.14, 1.6, 0.74]);
    glow(bx(0.02, 0.06, 0.06, CYAN, [s * 1.14, 1.6, 0.81]));
  }
  // bed
  bx(1.9, 0.08, 2.2, DARK, [0, 1.0, -1.55]);
  bx(1.9, 0.5, 0.08, BODY, [0, 1.25, -0.5]);
  bx(1.9, 0.5, 0.08, BODY, [0, 1.25, -2.58]);
  for (const s of [1, -1]) {
    bx(0.08, 0.5, 2.2, BODY, [s * 0.91, 1.25, -1.55]);
    bx(0.12, 0.05, 2.2, STEEL, [s * 0.91, 1.52, -1.55]);
    plane(UNIT, 0.6, 0.34, [s * 0.96, 1.25, -1.6], [s, 0, 0], ch);
    for (const z of [-1.0, -1.55, -2.1]) bx(0.04, 0.4, 0.06, GUN, [s * 0.95, 1.25, z]);
  }
  plane(WARN, 0.3, 0.3, [0.5, 1.25, -2.64], [0, 0, -1]);
  plane(BRAND, 0.34, 0.34, [-0.5, 1.25, -2.64], [0, 0, -1]);
  // roll bar behind cab with HUD screen
  for (const s of [1, -1]) b.rod([s * 0.85, 1.05, -0.6], [s * 0.85, 2.0, -0.72], 0.04, STEEL, { bone: ch, sides: 6 });
  b.rod([-0.85, 2.0, -0.72], [0.85, 2.0, -0.72], 0.04, STEEL, { bone: ch, sides: 6 });
  bx(0.6, 0.36, 0.04, DARK, [0.0, 1.6, -0.76]);
  plane(HUD, 0.54, 0.32, [0, 1.6, -0.79], [0, 0, -1], ch, true);
  // bed rocket pod
  bx(0.8, 0.5, 0.7, GUN, [0, 1.35, -1.9]);
  for (const dx of [-0.17, 0.17]) for (const dy of [-0.12, 0.12]) {
    cy(0.1, 0.05, 8, DARK, [dx, 1.35 + dy, -1.54], { rotation: [90, 0, 0] });
    b.spike([dx, 1.35 + dy, -1.58], [0, 0, 1], 0.14, 0.06, STEEL, { bone: ch, sides: 6 });
  }
  b.part(new THREE.BoxGeometry(0.84, 0.06, 0.74), HAZARD, { bone: ch, at: [0, 1.62, -1.9] });
  // front: grille, headlights, bumper, ram
  bx(1.1, 0.34, 0.06, DARK, [0, 1.0, 2.52]);
  for (let i = 0; i < 4; i++) glow(bx(1.0, 0.025, 0.02, MAG, [0, 0.9 + i * 0.09, 2.56]), 1.4);
  for (const s of [1, -1]) {
    bx(0.4, 0.2, 0.1, DARK, [s * 0.68, 1.08, 2.46]);
    glow(bx(0.34, 0.08, 0.03, CYAN, [s * 0.68, 1.08, 2.52]), 1.6);
    glow(bx(0.3, 0.06, 0.03, "#ff2a2a", [s * 0.7, 1.2, -2.62]), 1.4); // tail lights
  }
  b.part(new THREE.BoxGeometry(2.1, 0.26, 0.2), HAZARD, { bone: ch, at: [0, 0.68, 2.62] });
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.68, 2.72], [0, 0, 1], 0.22, 0.04, STEEL, { bone: ch, sides: 5 });
  b.part(new THREE.BoxGeometry(2.1, 0.22, 0.16), HAZARD, { bone: ch, at: [0, 0.7, -2.64] });
  // main rear thruster
  cy(0.22, 0.2, 8, STEEL, [0, 0.95, -2.7], { rotation: [90, 0, 0] });
  glow(cy(0.16, 0.04, 8, CYAN, [0, 0.95, -2.8], { rotation: [90, 0, 0] }), 1.6);
  // roof light bar
  bx(1.2, 0.08, 0.12, DARK, [0, 2.06, 0.5]);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) glow(bx(0.2, 0.06, 0.02, x < 0 ? MAG : CYAN, [x, 2.06, 0.57]), 1.6);
  // antenna
  b.spike([-0.8, 2.0, -0.4], [0, 1, 0], 1.0, 0.015, STEEL, { bone: ch, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), MAG, { bone: ch, at: [-0.8, 3.02, -0.4] }));
  // skirts + neon
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      bx(0.06, 0.34, 0.8, BODY, [s * 0.98, 0.75, -0.9 + i * 0.9], { rotation: [0, 0, s * 8] });
      for (const dz of [-0.28, 0.28]) cy(0.02, 0.03, 6, STEEL, [s * 1.02, 0.78, -0.9 + i * 0.9 + dz], { rotation: [0, 0, 90] });
    }
    glow(b.rod([s * 1.0, 0.95, -2.4], [s * 1.0, 0.95, -0.4], 0.014, MAG, { bone: ch, sides: 6 }), 1.6);
    glow(b.rod([s * 1.0, 0.95, -0.2], [s * 1.0, 0.95, 2.3], 0.014, CYAN, { bone: ch, sides: 6 }), 1.6);
    glow(b.rod([s * 0.9, 0.5, -2.3], [s * 0.9, 0.5, 2.3], 0.02, MAG, { bone: ch, sides: 6 }), 1.4);
  }
  // hover pods
  const cfg: [string, number, number][] = [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]];
  for (const [k, s, z] of cfg) {
    const x = s * 1.3;
    cy(0.42, 0.7, 8, "#20252d", [x, 0.35, z]); // duct
    cy(0.44, 0.08, 8, HAZARD, [x, 0.66, z]); // top band
    cy(0.43, 0.06, 8, DARK, [x, 0.05, z]); // lower lip
    cy(0.3, 0.02, 12, "#06131a", [x, 0.62, z]);
    b.rod([s * 0.9, 0.8, z], [x, 0.55, z], 0.07, STEEL, { bone: ch, sides: 6 }); // pylon
    b.rod([s * 0.9, 0.62, z - 0.25], [x, 0.5, z - 0.1], 0.04, STEEL, { bone: ch, sides: 5 });
    b.rod([s * 0.9, 0.62, z + 0.25], [x, 0.5, z + 0.1], 0.04, STEEL, { bone: ch, sides: 5 });
    const fan = b.joint(`fan${k}`, { parent: ch, at: [x, 0.3, z], dir: [0, 1, 0], role: "hinge" });
    cy(0.06, 0.12, 8, STEEL, [x, 0.3, z], { bone: fan });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.05, 0.015, 0.24), "#9fb4c4", {
        bone: fan, at: [x + 0.17 * Math.sin(a), 0.3, z + 0.17 * Math.cos(a)], rotation: [0, (a * 180) / Math.PI, 18],
      });
    }
    glow(cy(0.3, 0.02, 12, CYAN, [x, 0.02, z]), 1.5); // thrust glow under duct
    b.part(new THREE.PlaneGeometry(0.58, 0.58), "#ffffff", { bone: ch, at: [x, 0.035, z], dir: [0, -1, 0], axis: "z", texture: FANTEX });
    glow(b.part(new THREE.TorusGeometry(0.4, 0.015, 5, 16), MAG, { bone: ch, at: [x, 0.38, z], rotation: [90, 0, 0] }), 1.5);
  }
  // roof turret with minigun
  const yaw = b.joint("yaw", { parent: ch, at: [0, 2.0, -0.05], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.3, -0.05], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.4, 0.035, 6, 14), STEEL, { bone: ch, at: [0, 2.02, -0.05], rotation: [90, 0, 0] });
  cy(0.3, 0.2, 10, GUN, [0, 2.14, -0.05], { bone: yaw });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.06, 0.34, 0.4), GUN, { bone: yaw, at: [s * 0.22, 2.3, -0.05] });
  b.part(new THREE.BoxGeometry(0.3, 0.26, 0.5), GUN, { bone: pitch, at: [0, 2.3, 0.0] });
  const spin = b.joint("spinGun", { parent: pitch, at: [0, 2.3, 0.3], dir: [0, 0, 1], role: "hinge" });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, ox = 0.06 * Math.cos(a), oy = 0.06 * Math.sin(a);
    b.rod([ox, 2.3 + oy, 0.3], [ox, 2.3 + oy, 1.25], 0.018, STEEL, { bone: spin, sides: 6 });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), DARK, { bone: spin, at: [0, 2.3, 1.15], rotation: [90, 0, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), MAG, { bone: pitch, at: [0, 2.3, 1.27], rotation: [90, 0, 0] }), 1.6);
  bx(0.2, 0.2, 0.3, DARK, [0.3, 2.26, -0.15], { bone: pitch }); // ammo box
  return b.root;
}
