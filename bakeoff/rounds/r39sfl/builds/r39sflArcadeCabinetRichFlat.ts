import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Synthwave Arcade Cabinet",
  description: "1980s upright arcade cabinet with neon trim, glowing screen, joystick and buttons.",
};

const BODY = "#1a0f33";
const SIDE = "#2a1250";
const PINK = "#ff2d95";
const CYAN = "#19e6ff";
const PURPLE = "#8a2be2";
const YELLOW = "#ffd23f";
const BLACK = "#08040f";
const SUN = "#ff7a2f";

export default function build() {
  const b = createBuilder({ name: "arcade" });
  const W = 0.68;
  const D = 0.8;

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const neon = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, s = 1.4) =>
    glow(box(w, h, d, color, x, y, z), s);

  // base plinth
  box(W, 0.1, D, BLACK, 0, 0.05, 0);
  // side panels (profile extrude)
  const prof: [number, number][] = [
    [-0.4, 0], [0.4, 0], [0.4, 0.8], [0.3, 1.0], [0.38, 1.5], [0.3, 1.78], [-0.4, 1.78],
  ];
  for (const s of [1, -1]) {
    b.extrude(prof, {
      at: [s * (W / 2 - 0.02), 0, 0],
      x: [0, 0, 1],
      thickness: 0.04,
      color: SIDE,
    });
    // neon edge stripes on side
    neon(0.045, 0.012, 0.8, PINK, s * (W / 2 + 0.003), 0.8, 0.0, 1.2).mesh.scale.set(1, 1, 1);
    neon(0.045, 0.012, 0.1, CYAN, s * (W / 2 + 0.003), 1.2, 0.2);
    neon(0.045, 0.012, 0.1, PINK, s * (W / 2 + 0.003), 1.3, 0.2);
  }
  // lower front body
  box(W - 0.06, 0.7, 0.04, BODY, 0, 0.45, 0.38);
  // coin door
  box(0.2, 0.22, 0.02, BLACK, 0, 0.4, 0.405);
  for (const s of [1, -1]) {
    glow(box(0.04, 0.05, 0.01, s > 0 ? YELLOW : CYAN, s * 0.045, 0.43, 0.418), 1.3);
    box(0.05, 0.012, 0.01, BLACK, s * 0.045, 0.37, 0.418);
  }
  neon(0.5, 0.015, 0.02, CYAN, 0, 0.78, 0.4);
  neon(0.5, 0.015, 0.02, PINK, 0, 0.1, 0.4);

  // control panel (sloped)
  b.part(new THREE.BoxGeometry(W - 0.06, 0.05, 0.4), PURPLE, { at: [0, 0.9, 0.3], rotation: [-14, 0, 0] });
  b.part(new THREE.BoxGeometry(W - 0.04, 0.02, 0.03), PINK, { at: [0, 0.865, 0.5], rotation: [-14, 0, 0] });
  // joystick
  b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.015, 10), BLACK, { at: [-0.12, 0.945, 0.3] });
  b.rod([-0.12, 0.95, 0.3], [-0.12, 1.06, 0.3], 0.01, "#cfcfe8");
  b.part(new THREE.SphereGeometry(0.035, 10, 8), PINK, { at: [-0.12, 1.09, 0.3] });
  // buttons
  const cols = [CYAN, YELLOW, PINK, CYAN, YELLOW, PINK];
  cols.forEach((c, i) => {
    const x = 0.02 + (i % 3) * 0.085;
    const z = 0.34 - Math.floor(i / 3) * 0.09;
    b.part(new THREE.CylinderGeometry(0.03, 0.033, 0.02, 10), BLACK, { at: [x, 0.95 - (z - 0.3) * 0.0, z] });
    glow(b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.025, 10), c, { at: [x, 0.96, z] }), 1.2);
  });
  // start buttons
  glow(box(0.04, 0.02, 0.04, "#ffffff", 0.2, 0.95, 0.22), 1.1);

  // monitor bezel + screen
  box(W - 0.08, 0.6, 0.06, BLACK, 0, 1.3, 0.28);
  const screenTex = new THREE.PlaneGeometry(0.46, 0.44);
  glow(b.part(screenTex, "#2a0a5e", { at: [0, 1.32, 0.312], dir: [0, 0, 1], axis: "z" }), 1);
  // screen scene: sun, horizon, grid
  glow(b.part(new THREE.CircleGeometry(0.11, 14), SUN, { at: [0, 1.42, 0.314], dir: [0, 0, 1], axis: "z" }), 1.3);
  for (let i = 0; i < 4; i++)
    box(0.24, 0.01, 0.002, "#2a0a5e", 0, 1.38 + i * 0.015 - 0.02, 0.316);
  glow(box(0.46, 0.012, 0.003, PINK, 0, 1.28, 0.317), 1.5);
  for (let i = -4; i <= 4; i++) {
    const g = box(0.006, 0.12, 0.002, CYAN, i * 0.05, 1.22, 0.318);
    g.mesh.rotation.z = -i * 0.12;
    glow(g, 1.3);
  }
  for (let i = 0; i < 3; i++) glow(box(0.46, 0.006, 0.002, CYAN, 0, 1.25 - i * 0.035, 0.318), 1.3);
  // stars
  for (let i = 0; i < 8; i++)
    glow(box(0.008, 0.008, 0.002, "#ffffff", -0.2 + i * 0.055, 1.47 + (i % 3) * 0.015, 0.318), 1.2);

  // marquee
  box(W - 0.04, 0.2, 0.3, BODY, 0, 1.68, 0.18);
  glow(box(W - 0.1, 0.14, 0.02, PINK, 0, 1.68, 0.335), 1.2);
  // marquee letters ("A R C A D E" as blocks)
  for (let i = 0; i < 6; i++) {
    glow(box(0.05, 0.07, 0.01, i % 2 ? CYAN : "#fff0fa", -0.2 + i * 0.08, 1.68, 0.347), 1.6);
  }
  neon(W - 0.04, 0.012, 0.02, CYAN, 0, 1.585, 0.34);
  neon(W - 0.04, 0.012, 0.02, CYAN, 0, 1.775, 0.3);
  // back and top
  box(W - 0.06, 1.7, 0.04, BODY, 0, 0.9, -0.38);
  box(W, 0.03, 0.5, BLACK, 0, 1.79, 0.05);
  return b.root;
}
