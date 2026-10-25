import * as THREE from "three";
import { createBuilder, frame, rng, paint, noise, svg, catmull, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "riot-interceptor",
  description: "Corporate riot-control interceptor: armoured 6-wheel truck with roof water cannon, neon light bars, cage windows and corporate decals.",
};

const BODY = "#23272f", TRIM = "#0e1014", STEEL = "#6b727c", GLASS = "#4fd8ff", TYRE = "#15171a", RIM = "#8b919a";
const NEON = "#ff2bd6", NEON2 = "#2bf0ff", AMBER = "#ffb000", RED = "#ff2a3a", WATER = "#7fd8ff";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const armour = paint((p, n) => {
  const base: [number, number, number] = [0.14, 0.15, 0.19];
  const wear = noise(p, 0.05, 3) > 0.78 ? 0.18 : 0;
  const top = Math.max(0, n.y) * 0.06;
  const lowDirt = p.y < 0.7 ? 0.05 : 0;
  const seam = Math.abs(((p.z + 5) % 0.6) - 0.3) < 0.006 && Math.abs(n.x) > 0.7 ? -0.06 : 0;
  const v = wear + top + lowDirt + seam;
  return [base[0] + v, base[1] + v, base[2] + v * 1.1];
});

const logo = svg(
  `<svg viewBox="0 0 96 96"><polygon points="48,4 88,26 88,70 48,92 8,70 8,26" fill="#0e1014" stroke="#f2f2f2" stroke-width="4"/><polyline points="22,60 48,30 74,60" fill="none" stroke="#ff2bd6" stroke-width="9"/><polyline points="32,74 48,54 64,74" fill="none" stroke="#2bf0ff" stroke-width="7"/></svg>`,
  { size: 256 },
);
const sign = svg(
  `<svg viewBox="0 0 160 48"><rect width="160" height="48" fill="#0e1014"/><rect x="2" y="2" width="156" height="44" fill="none" stroke="#ffb000" stroke-width="3"/><text x="80" y="34" font-family="Arial Black, Arial" font-weight="900" font-size="26" fill="#ffb000" text-anchor="middle">CROWD CTRL</text></svg>`,
  { size: 320 },
);
const chev = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e9c32a"/>${[0, 16, 32, 48, 64].map((x) => `<polygon points="${x},32 ${x + 8},32 ${x + 24},0 ${x + 16},0" fill="#111"/>`).join("")}</svg>`,
  { size: 256 },
);
const hud = svg(
  `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><circle cx="80" cy="50" r="24" fill="none" stroke="#2bf0ff" stroke-width="2"/><line x1="48" y1="50" x2="112" y2="50" stroke="#2bf0ff" stroke-width="2"/><line x1="80" y1="18" x2="80" y2="82" stroke="#2bf0ff" stroke-width="2"/><rect x="8" y="84" width="70" height="6" fill="#ff2bd6"/><text x="152" y="16" font-family="monospace" font-size="12" fill="#2bf0ff" text-anchor="end">H2O 87%</text></svg>`,
  { size: 320 },
);

export default function build() {
  const b = createBuilder({ name: "riot-interceptor" });
  const R = rng(5);
  const ch = b.joint("chassis", { at: [0, 0.75, 0], role: "spine" });

  // ---- chassis & hull
  b.part(box(1.7, 0.2, 6.0), TRIM, { bone: ch, at: [0, 0.6, -0.2] });
  b.part(box(2.3, 0.9, 5.6), armour, { bone: ch, at: [0, 1.25, -0.3] }); // lower hull
  b.part(box(2.1, 0.8, 3.4), armour, { bone: ch, at: [0, 2.05, -0.9] }); // upper cab
  // sloped nose
  b.frustumBox([0, 1.2, 2.5], [0, 1.1, 3.35], [2.3, 0.9], [2.2, 0.5], { bone: ch, color: armour });
  b.part(box(2.1, 0.1, 1.2), armour, { bone: ch, at: [0, 1.72, 2.2], rotation: [12, 0, 0] }); // hood
  // windscreen slit
  b.part(box(1.9, 0.38, 0.06), GLASS, { bone: ch, at: [0, 2.15, 0.82], rotation: [-18, 0, 0] });
  glow(b.part(box(1.9, 0.38, 0.06), GLASS, { bone: ch, at: [0, 2.15, 0.83], rotation: [-18, 0, 0] }), 0.35);
  b.part(box(2.12, 0.1, 0.2), TRIM, { bone: ch, at: [0, 2.43, 0.8] }); // visor brow
  // side window slits with cage bars
  for (const s of [1, -1]) {
    b.part(box(0.06, 0.3, 1.9), GLASS, { bone: ch, at: [s * 1.06, 2.15, -0.6] });
    for (let i = 0; i < 6; i++) b.part(box(0.08, 0.32, 0.04), TRIM, { bone: ch, at: [s * 1.07, 2.15, -1.45 + i * 0.35] });
    b.part(box(0.1, 0.5, 2.0), TRIM, { bone: ch, at: [s * 1.1, 1.0, -0.3] }); // skirt
    // armoured side panels
    for (let i = 0; i < 3; i++) b.part(box(0.08, 0.5, 1.4), BODY, { bone: ch, at: [s * 1.17, 1.3, -1.6 + i * 1.5 + 0.1] });
    // corporate logo
    b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", { bone: ch, at: [s * 1.2, 1.35, 1.2], dir: [s, 0, 0], axis: "z", texture: logo });
    b.part(new THREE.PlaneGeometry(1.4, 0.42), "#ffffff", { bone: ch, at: [s * 1.2, 1.2, -2.0], dir: [s, 0, 0], axis: "z", texture: sign });
    // neon flank strips
    glow(b.rod([s * 1.2, 0.95, -2.9], [s * 1.2, 0.95, 2.4], 0.025, NEON, { bone: ch, sides: 6 }), 1.8);
    glow(b.rod([s * 1.2, 1.7, -2.9], [s * 1.2, 1.7, 1.9], 0.02, NEON2, { bone: ch, sides: 6 }), 1.8);
    // mirrors
    b.rod([s * 1.1, 2.2, 0.9], [s * 1.5, 2.3, 1.0], 0.02, STEEL, { bone: ch });
    b.part(box(0.06, 0.28, 0.2), TRIM, { bone: ch, at: [s * 1.52, 2.3, 1.0] });
  }
  // rear
  b.part(box(2.0, 1.2, 0.2), BODY, { bone: ch, at: [0, 1.6, -3.15] });
  b.part(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", { bone: ch, at: [0, 1.4, -3.27], dir: [0, 0, -1], axis: "z", texture: chev });
  for (const s of [1, -1]) glow(b.part(box(0.3, 0.12, 0.05), RED, { bone: ch, at: [s * 0.85, 1.95, -3.27] }), 1.6);
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: ch, at: [0, 1.95, -3.27], dir: [0, 0, -1], axis: "z", texture: logo });
  // water tank rear (hose-fed)
  b.part(cyl(0.55, 1.8, 12), STEEL, { bone: ch, at: [0, 2.7, -2.0], rotation: [0, 0, 90], flat: true });
  for (const x of [-0.7, 0, 0.7]) b.part(new THREE.TorusGeometry(0.56, 0.03, 5, 12), TRIM, { bone: ch, at: [x, 2.7, -2.0], rotation: [0, 90, 0] });
  glow(b.part(box(0.9, 0.12, 0.04), WATER, { bone: ch, at: [0, 2.75, -1.44] }), 1.0);

  // ---- front: bumper, plough, grille, headlights
  b.part(box(2.4, 0.4, 0.3), TRIM, { bone: ch, at: [0, 0.85, 3.5] });
  for (let i = 0; i < 7; i++) b.spike([-1.0 + i * 0.33, 0.85, 3.6], [0, 0, 1], 0.2, 0.05, STEEL, { bone: ch, sides: 5 });
  for (const s of [1, -1]) b.part(box(0.9, 0.8, 0.08), STEEL, { bone: ch, at: [s * 0.65, 0.95, 3.75], rotation: [0, s * -20, 0] });
  b.part(box(1.0, 0.35, 0.08), TRIM, { bone: ch, at: [0, 1.3, 3.0], rotation: [-10, 0, 0] });
  for (let i = 0; i < 4; i++) b.rod([-0.45, 1.2 + i * 0.07, 3.06], [0.45, 1.2 + i * 0.07, 3.06], 0.015, STEEL, { bone: ch, sides: 5 });
  for (const s of [1, -1]) {
    glow(b.part(box(0.5, 0.1, 0.06), NEON2, { bone: ch, at: [s * 0.8, 1.45, 3.0] }), 2);
    b.part(box(0.56, 0.04, 0.12), TRIM, { bone: ch, at: [s * 0.8, 1.53, 3.0] });
  }
  glow(b.rod([-1.1, 1.05, 3.64], [1.1, 1.05, 3.64], 0.02, NEON, { bone: ch, sides: 6 }), 1.8);

  // ---- roof light bars (neon, red/blue)
  b.part(box(1.9, 0.1, 0.35), TRIM, { bone: ch, at: [0, 2.5, 0.2] });
  for (let i = 0; i < 6; i++) glow(b.part(box(0.28, 0.14, 0.3), i < 3 ? RED : "#2b6bff", { bone: ch, at: [-0.75 + i * 0.3, 2.6, 0.2] }), 2);
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.1, 2.0), TRIM, { bone: ch, at: [s * 0.95, 2.5, -1.2] });
    glow(b.rod([s * 0.95, 2.57, -2.1], [s * 0.95, 2.57, -0.3], 0.025, NEON, { bone: ch, sides: 6 }), 2);
  }
  glow(b.part(box(1.6, 0.05, 0.05), AMBER, { bone: ch, at: [0, 2.46, 0.95] }), 1.6);
  // antenna + hud screen
  b.spike([-0.8, 2.5, -2.9], [0, 1, 0], 1.3, 0.015, STEEL, { bone: ch, sides: 5 });
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.31), "#ffffff", { bone: ch, at: [0.8, 2.0, 0.83], dir: [0, 0, 1], axis: "z", texture: hud }), 1.2);

  // ---- water cannon turret
  const yaw = b.joint("cannonYaw", { parent: ch, at: [0, 2.58, -0.8], dir: [0, 1, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("cannonPitch", { parent: yaw, at: [0, 3.0, -0.8], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.5, 0.1, 14), STEEL, { bone: ch, at: [0, 2.58, -0.8], flat: true });
  b.part(cyl(0.38, 0.28, 12), BODY, { bone: yaw, at: [0, 2.78, -0.8], flat: true });
  for (const s of [1, -1]) b.part(box(0.1, 0.5, 0.5), BODY, { bone: yaw, at: [s * 0.36, 3.0, -0.8] });
  b.rod([-0.4, 3.0, -0.8], [0.4, 3.0, -0.8], 0.06, STEEL, { bone: pitch, sides: 8 });
  b.part(box(0.4, 0.4, 0.8), BODY, { bone: pitch, at: [0, 3.0, -0.9] });
  b.rod([0, 3.0, -0.6], [0, 3.0, 1.3], 0.13, STEEL, { bone: pitch, sides: 10 });
  b.part(new THREE.CylinderGeometry(0.2, 0.13, 0.3, 10), TRIM, { bone: pitch, at: [0, 3.0, 1.45], rotation: [90, 0, 0], flat: true });
  glow(b.part(cyl(0.12, 0.03, 10), WATER, { bone: pitch, at: [0, 3.0, 1.61], rotation: [90, 0, 0] }), 1.6);
  for (const z of [0.2, 0.6, 1.0]) b.part(new THREE.TorusGeometry(0.15, 0.025, 5, 10), TRIM, { bone: pitch, at: [0, 3.0, z] });
  // feed hose
  const hose = catmull([[0, 2.2, -2.3], [0.5, 3.2, -1.9], [0.3, 3.2, -1.1], [0.15, 3.0, -0.7]]);
  b.sweep(hose, 0.05, TYRE, { bone: ch, sides: 6 });
  // pressure gauge
  glow(b.part(cyl(0.07, 0.04, 10), AMBER, { bone: pitch, at: [0.22, 3.1, -0.9], rotation: [0, 0, 90] }), 1.2);

  // ---- six wheels with suspension
  const zs = [2.0, -0.4, -2.3];
  for (const z of zs)
    for (const s of [1, -1]) {
      const name = `${z > 1 ? "F" : z > -1 ? "M" : "R"}${s > 0 ? "L" : "R"}`;
      const w = b.joint(`wheel${name}`, { parent: ch, at: [s * 1.1, 0.55, z], dir: [0, 1, 0], role: "hinge" });
      b.part(cyl(0.55, 0.42, 14), TYRE, { bone: w, at: [s * 1.1, 0.55, z], rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.34, 0.46, 10), RIM, { bone: w, at: [s * 1.1, 0.55, z], rotation: [0, 0, 90], flat: true });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(cyl(0.025, 0.04, 6), TRIM, { bone: w, at: [s * 1.34, 0.55 + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)], rotation: [0, 0, 90] });
      }
      glow(b.part(new THREE.TorusGeometry(0.4, 0.015, 5, 16), NEON, { bone: w, at: [s * 1.33, 0.55, z], rotation: [0, 90, 0] }), 1.6);
      b.part(box(0.1, 0.12, 0.7), BODY, { bone: ch, at: [s * 1.2, 1.3, z - 0.8 * 0] }); // arch cap
      b.rod([s * 0.5, 0.65, z], [s * 1.1, 0.55, z], 0.06, STEEL, { bone: ch, sides: 6 });
    }
  // fenders over wheels
  for (const z of zs) for (const s of [1, -1]) b.part(box(0.45, 0.08, 1.2), BODY, { bone: ch, at: [s * 1.12, 1.14, z] });

  // ---- side smoke/tear-gas launchers and rear spotlights
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      b.rod([s * 0.8 + s * i * 0.14, 2.52, 1.0], [s * 0.8 + s * i * 0.14, 2.8, 1.4], 0.05, STEEL, { bone: ch, sides: 7 });
      b.part(cyl(0.06, 0.03, 7), TRIM, { bone: ch, at: [s * 0.8 + s * i * 0.14, 2.82, 1.42], rotation: [-55, 0, 0] });
    }
  const sp = R();
  void sp;
  return b.root;
}
