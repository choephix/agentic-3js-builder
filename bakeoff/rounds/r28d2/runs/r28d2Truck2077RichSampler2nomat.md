```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nomad-77 Warcrawler",
  description:
    "Six-wheeled armoured 2077 pickup: gunmetal panelled hull, neon underglow, roof missile pods, rear remote turret, ram bumper and thrusters.",
};

const TAU = Math.PI * 2;
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const AMBER = "#ffb02e";
const WHITE = "#f4fbff";
const DARK = "#14161d";
const STEEL = "#6d7486";
const GLASS = "#10303c";
const RUBBER = "#1b1c21";
const ORANGE = "#e8641a";
const OLIVE = "#3b4636";

// Hull paint: gunmetal with panel seams, grime low down, a magenta belt line and top sheen.
const HULL = paint((p, n) => {
  let c = mix("#2a2f3c", "#59647c", smoothstep(0.2, 0.8, noise(p, 0.5, 3)) * 0.6 + 0.4 * Math.max(n.y, 0));
  const fu = (p.z / 0.62) % 1;
  const fv = (p.y / 0.4) % 1;
  if (Math.abs(fu) < 0.012 || Math.abs(fv) < 0.012) c = mix(c, "#090a0e", 0.85);
  else if (Math.abs(fu) < 0.03 || Math.abs(fv) < 0.03) c = mix(c, "#8b97b0", 0.15);
  c = mix(c, "#15110d", 0.6 * smoothstep(1.2, 0.7, p.y) * noise(p, 0.18, 8));
  if (Math.abs(p.y - 1.32) < 0.022 && Math.abs(n.y) < 0.6) return MAG;
  return c;
});
const PLATE = paint((p, n) =>
  mix(mix("#3a4256", "#262b38", noise(p, 0.25, 5)), "#8a97b2", 0.2 * smoothstep(0.5, 1, n.y)),
);
const CAMO = paint((p) => (noise(p, 0.45, 12) > 0.55 ? "#2f3a2e" : noise(p, 0.3, 4) > 0.5 ? OLIVE : "#252c27"));

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#0b0e14" stroke="#19f0ff" stroke-width="5"/>
  <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" fill="none" stroke="#ff2bd6" stroke-width="3"/>
  <text x="50" y="62" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="34" fill="#19f0ff">77</text></svg>`,
  { size: 192 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 120 24"><rect width="120" height="24" fill="#ffb02e"/>${Array.from({ length: 9 }, (_, i) => `<polygon points="${i * 16 - 8},24 ${i * 16 + 4},24 ${i * 16 + 20},0 ${i * 16 + 8},0" fill="#101018"/>`).join("")}</svg>`,
  { size: 256 },
);
const NAME = svg(
  `<svg viewBox="0 0 200 60"><text x="100" y="34" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#f4fbff" stroke="#000" stroke-width="1">NOMAD</text>
  <text x="100" y="54" text-anchor="middle" font-family="monospace" font-size="15" fill="#ff2bd6">WARCRAWLER MK-VII</text></svg>`,
  { size: 384 },
);
const PLATE_TEX = svg(
  `<svg viewBox="0 0 100 40"><rect width="100" height="40" rx="4" fill="#e9e4c8"/><rect x="2" y="2" width="96" height="36" rx="3" fill="none" stroke="#222" stroke-width="2"/>
  <text x="50" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#222">NX-2077</text></svg>`,
  { size: 160 },
);
const GRILLE_TEX = svg(
  `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#07080c"/>${[6, 15, 24, 33].map((y) => `<rect x="6" y="${y}" width="88" height="4" fill="#19f0ff"/>`).join("")}<rect x="47" y="0" width="6" height="40" fill="#14161d"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "nomad77" });
  const ch = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const r = rng(77);

  const bx = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: ch, at: at as any, ...o });
  const cy = (rad: number, h: number, sides: number, col: any, at: number[], rot: number[] = [0, 0, 0], bone: any = ch) =>
    b.part(new THREE.CylinderGeometry(rad, rad, h, sides), col, { bone, at: at as any, rotation: rot as any, flat: true });
  const rod = (a: number[], c: number[], rad: number, col: any, bone: any = ch, sides = 6) =>
    b.rod(a as any, c as any, rad, col, { bone, sides });

  // ---------- frame and hull
  for (const s of [1, -1]) bx(0.14, 0.2, 6.0, DARK, [s * 0.5, 0.78, 0]);
  for (const z of [-2.8, -1.4, 0, 1.4, 2.8]) bx(1.2, 0.12, 0.1, DARK, [0, 0.78, z]);
  bx(2.1, 0.6, 6.2, HULL, [0, 1.05, 0]);
  bx(1.6, 0.1, 6.0, "#0b0c10", [0, 0.72, 0]); // belly plate
  for (const s of [1, -1]) {
    bx(0.12, 0.05, 6.0, MAG, [s * 1.02, 0.7, 0]);
    glow(bx(0.06, 0.04, 5.6, MAG, [s * 1.05, 0.66, 0]), 1.4); // underglow
    glow(bx(0.5, 0.04, 0.04, CYAN, [s * 0.9, 0.8, 2.9]));
  }
  glow(bx(1.6, 0.04, 0.05, CYAN, [0, 0.66, 2.9]), 1.2);
  glow(bx(1.6, 0.04, 0.05, CYAN, [0, 0.66, -2.9]), 1.2);

  // hood / nose
  b.frustumBox([0, 1.54, 1.45], [0, 1.5, 3.02], [2.08, 0.46], [1.84, 0.4], { bone: ch, color: HULL });
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      bx(0.3, 0.05, 0.1, DARK, [s * 0.55, 1.78, 1.9 + i * 0.28], { rotation: [-18, 0, 0] }); // vents
      glow(bx(0.26, 0.012, 0.04, MAG, [s * 0.55, 1.795, 1.9 + i * 0.28], { rotation: [-18, 0, 0] }), 0.8);
    }
    // ERA tiles on hood sides
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++)
        b.part(new THREE.BoxGeometry(0.2, 0.06, 0.2), PLATE, { bone: ch, at: [s * (0.2 + j * 0.24), 1.8, 2.3 + i * 0.24] as any });
    rod([s * 0.95, 1.78, 1.5], [s * 0.95, 1.78, 2.9], 0.03, STEEL, ch, 5);
  }
  // grille
  b.part(new THREE.PlaneGeometry(1.3, 0.52), "#ffffff", { bone: ch, at: [0, 1.5, 3.03], dir: [0, 0, 1], axis: "z", texture: GRILLE_TEX });
  bx(1.4, 0.06, 0.06, STEEL, [0, 1.78, 3.03]);
  bx(1.4, 0.06, 0.06, STEEL, [0, 1.22, 3.03]);
  for (const s of [1, -1]) {
    bx(0.5, 0.14, 0.12, DARK, [s * 0.88, 1.5, 3.0]);
    glow(bx(0.42, 0.06, 0.03, WHITE, [s * 0.88, 1.5, 3.07]), 1.8);
    bx(0.5, 0.04, 0.16, STEEL, [s * 0.88, 1.6, 3.0]);
  }

  // ram bumper
  bx(2.3, 0.42, 0.3, PLATE, [0, 0.92, 3.1]);
  b.part(new THREE.PlaneGeometry(1.8, 0.36), "#ffffff", { bone: ch, at: [0, 0.92, 3.26], dir: [0, 0, 1], axis: "z", texture: HAZARD });
  for (let i = 0; i < 6; i++)
    b.spike([-1.0 + i * 0.4, 0.74, 3.2], [0, -0.1, 1], 0.3, 0.05, STEEL, { bone: ch, sides: 5 });
  for (const s of [1, -1]) {
    bx(0.3, 0.5, 0.36, PLATE, [s * 1.2, 0.95, 3.0], { rotation: [0, s * 20, 0] });
    cy(0.06, 0.2, 6, STEEL, [s * 0.6, 0.7, 3.3], [90, 0, 0]);
    b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8, Math.PI), STEEL, { bone: ch, at: [s * 0.6, 0.62, 3.4] as any, rotation: [0, 0, 180] as any });
  }
  // winch
  cy(0.09, 0.7, 8, DARK, [0, 1.0, 3.28], [0, 0, 90]);
  b.part(new THREE.PlaneGeometry(0.3, 0.12), "#ffffff", { bone: ch, at: [0, 0.78, 3.27], dir: [0, 0, 1], axis: "z", texture: PLATE_TEX });

  // ---------- cab
  b.extrude(
    [
      [-0.4, 1.3],
      [1.55, 1.3],
      [1.55, 1.62],
      [0.9, 2.2],
      [-0.2, 2.2],
      [-0.4, 1.95],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, bevel: 0.03, bone: ch, color: HULL },
  );
  b.part(new THREE.BoxGeometry(1.76, 0.86, 0.04), GLASS, { bone: ch, at: [0, 1.92, 1.25] as any, rotation: [-41.8, 0, 0] as any });
  glow(b.part(new THREE.BoxGeometry(1.5, 0.02, 0.02), CYAN, { bone: ch, at: [0, 2.2, 1.0] as any }), 0.9); // HUD edge
  bx(1.8, 0.05, 0.1, DARK, [0, 1.64, 1.55]);
  for (const s of [1, -1]) {
    bx(0.04, 0.4, 1.1, GLASS, [s * 0.96, 1.88, 0.4]);
    bx(0.06, 0.06, 1.2, DARK, [s * 0.96, 1.66, 0.4]);
    bx(0.06, 0.6, 0.08, DARK, [s * 0.96, 1.6, -0.12]); // B/C pillar
    bx(0.06, 0.03, 0.4, STEEL, [s * 0.97, 1.55, 0.95]); // handle
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: ch, at: [s * 0.962, 1.46, 0.35] as any, dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    // mirror camera
    rod([s * 0.95, 1.8, 1.3], [s * 1.2, 1.85, 1.35], 0.02, STEEL);
    b.part(new THREE.SphereGeometry(0.07, 6, 4), DARK, { bone: ch, at: [s * 1.22, 1.85, 1.36] as any, flat: true });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), AMBER, { bone: ch, at: [s * 1.22, 1.85, 1.43] as any }));
    // slat armour on windows
    for (let i = 0; i < 6; i++) bx(0.03, 0.4, 0.03, STEEL, [s * 0.995, 1.88, -0.1 + i * 0.2]);
    // exhaust stacks
    cy(0.07, 1.1, 8, STEEL, [s * 1.0, 2.15, -0.7]);
    cy(0.1, 0.5, 8, "#2a2a30", [s * 1.0, 1.9, -0.7]);
    glow(cy(0.05, 0.03, 8, AMBER, [s * 1.0, 2.71, -0.7]), 1.2);
  }
  // roof gear
  bx(1.3, 0.1, 0.18, DARK, [0, 2.3, 0.8]);
  for (let i = 0; i < 6; i++) glow(bx(0.18, 0.06, 0.02, i % 2 ? MAG : CYAN, [-0.5 + i * 0.2, 2.3, 0.9]), 1.6);
  for (const s of [1, -1]) {
    bx(0.5, 0.36, 0.9, PLATE, [s * 0.6, 2.38, 0.0]); // missile pod
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        cy(0.08, 0.04, 8, "#050507", [s * 0.6 + (i - 0.5) * 0.2, 2.38 + (j - 0.5) * 0.18, 0.46], [90, 0, 0]);
        b.spike([s * 0.6 + (i - 0.5) * 0.2, 2.38 + (j - 0.5) * 0.18, 0.4], [0, 0, 1], 0.1, 0.05, ORANGE, { bone: ch, sides: 6 });
      }
    b.part(new THREE.SphereGeometry(0.2, 8, 4, 0, TAU, 0, Math.PI / 2), GLASS, { bone: ch, at: [s * 0.25, 2.2, -0.1] as any, flat: true });
  }
  rod([-0.9, 2.2, -0.2], [-0.95, 3.3, -0.25], 0.015, STEEL, ch, 5);
  rod([0.9, 2.2, -0.2], [1.0, 3.0, -0.25], 0.012, STEEL, ch, 5);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), MAG, { bone: ch, at: [-0.95, 3.3, -0.25] as any }), 1.5);
  b.part(new THREE.CylinderGeometry(0.3, 0.05, 0.1, 10), STEEL, { bone: ch, at: [0, 2.3, -0.1] as any, rotation: [30, 0, 0] as any, flat: true }); // dish

  // ---------- bed
  bx(2.1, 0.1, 2.9, PLATE, [0, 1.35, -1.7]);
  for (const s of [1, -1]) {
    bx(0.12, 0.8, 2.9, HULL, [s * 0.99, 1.75, -1.7]);
    bx(0.18, 0.06, 2.9, STEEL, [s * 0.99, 2.17, -1.7]);
    for (let i = 0; i < 4; i++) bx(0.06, 0.7, 0.1, DARK, [s * 1.07, 1.75, -0.7 - i * 0.7]);
    b.part(new THREE.PlaneGeometry(1.4, 0.42), "#ffffff", { bone: ch, at: [s * 1.065, 1.8, -1.7] as any, dir: [s, 0, 0], axis: "z", texture: NAME });
  }
  bx(2.1, 0.8, 0.12, HULL, [0, 1.75, -3.1]);
  bx(2.1, 0.06, 0.2, STEEL, [0, 2.17, -3.1]);
  glow(bx(1.8, 0.06, 0.03, MAG, [0, 1.95, -3.18]), 1.8); // tail light
  glow(bx(1.8, 0.03, 0.03, MAG, [0, 1.6, -3.18]), 1.3);
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", { bone: ch, at: [0, 1.4, -3.17] as any, dir: [0, 0, -1], axis: "z", texture: PLATE_TEX });
  bx(2.1, 0.8, 0.12, HULL, [0, 1.75, -0.35]);
  // cargo
  bx(0.6, 0.5, 0.7, CAMO, [0.5, 1.65, -2.6]);
  bx(0.62, 0.05, 0.72, STEEL, [0.5, 1.92, -2.6]);
  bx(0.55, 0.4, 0.5, ORANGE, [-0.55, 1.6, -2.7]);
  for (let i = 0; i < 3; i++) cy(0.12, 0.45, 8, i % 2 ? "#a3252b" : "#2d6a3a", [-0.6 + i * 0.3, 1.62, -1.0]);
  for (let i = 0; i < 4; i++) glow(bx(0.1, 0.2, 0.05, CYAN, [-0.3 + i * 0.14, 1.62, -1.5]), 1.0); // battery cells
  bx(0.7, 0.3, 0.3, DARK, [-0.3, 1.55, -1.5]);
  // tie-down rings
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), STEEL, { bone: ch, at: [s * 0.9, 1.42, -1.1 - i * 0.8] as any });

  // ---------- turret
  const yaw = b.joint("yaw", { parent: ch, at: [0, 2.2, -1.9], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.6, -1.9], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.5, 0.04, 5, 16), STEEL, { bone: ch, at: [0, 2.2, -1.9] as any, rotation: [90, 0, 0] as any });
  cy(0.12, 0.3, 8, STEEL, [0, 2.3, -1.9], [0, 0, 0], yaw);
  cy(0.38, 0.14, 12, PLATE, [0, 2.4, -1.9], [0, 0, 0], yaw);
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.4, 0.4), PLATE, { bone: yaw, at: [s * 0.3, 2.62, -1.9] as any });
    b.part(new THREE.BoxGeometry(0.22, 0.24, 0.4), DARK, { bone: yaw, at: [s * 0.5, 2.55, -1.95] as any });
  }
  b.part(new THREE.BoxGeometry(0.42, 0.24, 0.5), PLATE, { bone: pitch, at: [0, 2.6, -1.8] as any });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 2.6, -1.6], [s * 0.1, 2.6, -0.4], 0.05, STEEL, { bone: pitch, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.2, 8), DARK, { bone: pitch, at: [s * 0.1, 2.6, -0.4] as any, rotation: [90, 0, 0] as any, flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), CYAN, { bone: pitch, at: [s * 0.1, 2.6, -0.29] as any, rotation: [90, 0, 0] as any }), 1.6);
    for (let k = 0; k < 3; k++) b.part(new THREE.TorusGeometry(0.065, 0.015, 4, 8), CYAN, { bone: pitch, at: [s * 0.1, 2.6, -1.3 + k * 0.28] as any });
  }
  glow(b.part(new THREE.BoxGeometry(0.06, 0.04, 0.2), MAG, { bone: pitch, at: [0, 2.74, -1.85] as any }), 1.5);

  // ---------- thrusters
  for (const s of [1, -1]) {
    b.lathe(
      [[0, 0], [0.2, 0], [0.16, 0.12], [0.32, 0.5], [0.28, 0.5], [0.12, 0.14], [0, 0.16]],
      { at: [s * 0.6, 1.05, -3.12], axis: [0, 0, -1], segments: 10, bone: ch, color: STEEL },
    );
    glow(b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 10), CYAN, { bone: ch, at: [s * 0.6, 1.05, -3.27] as any, rotation: [90, 0, 0] as any }), 2);
    b.part(new THREE.TorusGeometry(0.28, 0.025, 5, 12), DARK, { bone: ch, at: [s * 0.6, 1.05, -3.45] as any });
  }

  // ---------- skirts and fenders
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      bx(0.06, 0.4, 1.0, PLATE, [s * 1.12, 0.92, 1.05 - i * 1.15], { rotation: [0, 0, s * 12] });
      for (const dz of [-0.3, 0.3]) cy(0.025, 0.04, 6, STEEL, [s * 1.16, 1.0, 1.05 - i * 1.15 + dz], [0, 0, 90]);
    }
  }

  // ---------- wheels
  for (const [k, z] of [["F", 2.1], ["M", -0.1], ["R", -2.3]] as const)
    for (const s of [1, -1]) {
      const x = s * 1.2;
      const hubY = 0.6;
      const j = b.joint(`wheel${k}${s > 0 ? "L" : "R"}`, { parent: ch, at: [x, hubY, z], dir: [1, 0, 0], role: "hinge" });
      cy(0.55, 0.5, 14, RUBBER, [x, hubY, z], [0, 0, 90], j);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * TAU;
        b.part(new THREE.BoxGeometry(0.52, 0.1, 0.2), RUBBER, {
          bone: j,
          at: [x + (i % 2 ? 0.04 : -0.04), hubY + 0.56 * Math.cos(a), z + 0.56 * Math.sin(a)] as any,
          rotation: [(a * 180) / Math.PI, 0, 0] as any,
          flat: true,
        });
      }
      cy(0.34, 0.52, 10, STEEL, [x, hubY, z], [0, 0, 90], j);
      cy(0.22, 0.56, 8, DARK, [x, hubY, z], [0, 0, 90], j);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), STEEL, {
          bone: j,
          at: [x + s * 0.28, hubY + 0.15 * Math.cos(a), z + 0.15 * Math.sin(a)] as any,
          rotation: [0, 0, 90] as any,
        });
      }
      glow(b.part(new THREE.TorusGeometry(0.3, 0.022, 5, 18), i2(s) ? CYAN : MAG, { bone: j, at: [x + s * 0.27, hubY, z] as any, rotation: [0, 90, 0] as any }), 1.6);
      // fender arch over the wheel
      bx(0.7, 0.1, 1.5, PLATE, [x, 1.32, z]);
      bx(0.06, 0.3, 1.5, PLATE, [s * 1.52, 1.18, z]);
      for (const dz of [-0.7, 0.7]) bx(0.7, 0.08, 0.1, STEEL, [x, 1.15, z + dz], { rotation: [dz > 0 ? 25 : -25, 0, 0] });
      // axle & shock
      rod([s * 0.5, 0.8, z], [x, hubY, z], 0.06, DARK, ch, 6);
      rod([s * 0.7, 0.85, z + 0.2], [s * 0.95, 1.3, z + 0.2], 0.03, ORANGE, ch, 6);
    }
  // mud flaps
  for (const s of [1, -1]) bx(0.5, 0.35, 0.03, RUBBER, [s * 1.2, 0.45, -2.95]);

  return b.root;
}
function i2(s: number) {
  return s > 0;
}
```