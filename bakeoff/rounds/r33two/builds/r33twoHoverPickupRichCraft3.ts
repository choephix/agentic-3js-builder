import * as THREE from "three";
import { createBuilder, rng, countershade, mottle, svg, panelled, metal } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "hoverTruck",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const body = b.joint("body", { at: [0, 0.6, 0], role: "spine" });

  const ARMOR = panelled(countershade("#3b4a3c", "#232b25"), { size: 0.3, rivets: 0.06 });
  const DARK = "#14161c";
  const STEEL = metal("iron");
  const CYAN = "#22f0ff";
  const PINK = "#ff2d95";
  const YEL = "#ffd23a";

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...extra });

  // chassis
  box(1.9, 0.3, 4.4, STEEL, [0, 0.55, 0]);
  box(1.8, 0.25, 4.2, DARK, [0, 0.4, 0]);
  // hood
  box(1.8, 0.35, 1.5, ARMOR, [0, 0.9, 1.4]);
  b.frustumBox([0, 1.12, 0.7], [0, 1.1, 2.15], [1.7, 0.1], [1.5, 0.1], { bone: body, color: ARMOR });
  // cab
  b.frustumBox([0, 0.8, 0.5], [0, 1.4, 0.5], [1.85, 1.5], [1.6, 1.0], { bone: body, color: ARMOR });
  b.part(new THREE.BoxGeometry(1.5, 0.45, 0.04), "#0a1d2b", { bone: body, at: [0, 1.4, 1.02], rotation: [-18, 0, 0] });
  for (const s of [1, -1]) box(0.04, 0.4, 0.9, "#0a1d2b", [s * 0.93, 1.35, 0.3]);
  // roof light bar
  glow(box(1.3, 0.07, 0.12, PINK, [0, 1.95, 0.7]), 1.6);
  // bed
  box(1.8, 0.12, 1.9, DARK, [0, 0.8, -1.4]);
  for (const s of [1, -1]) {
    box(0.1, 0.4, 1.9, ARMOR, [s * 0.9, 1.05, -1.4]);
  }
  box(1.8, 0.4, 0.1, ARMOR, [0, 1.05, -2.35]);
  box(1.8, 0.4, 0.1, ARMOR, [0, 1.05, -0.45]);
  // roof turret
  b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.18, 8), STEEL, { bone: body, at: [0, 1.3, -1.4] });
  box(0.35, 0.25, 0.6, ARMOR, [0, 1.5, -1.4]);
  b.rod([0, 1.5, -1.1], [0, 1.52, -0.2], 0.05, { bone: body, color: DARK });
  b.rod([0.1, 1.5, -1.1], [0.1, 1.52, -0.3], 0.03, { bone: body, color: DARK });
  // bumper & ram
  box(2.0, 0.3, 0.3, STEEL, [0, 0.6, 2.25]);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.12, 0.05, YEL, [s * 0.6, 0.95, 2.18]), 2);
    glow(box(0.25, 0.1, 0.05, PINK, [s * 0.7, 0.9, -2.46]), 1.5);
  }
  // neon underglow strips
  for (const s of [1, -1]) glow(box(0.06, 0.06, 3.8, CYAN, [s * 0.97, 0.38, 0]), 1.8);

  // hover thrusters
  const logo = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#22f0ff" stroke-width="5"/><path d="M32 12 L44 44 L32 36 L20 44Z" fill="#22f0ff"/></svg>`,
    { size: 128 },
  );
  const spots = [[1, 1.45], [-1, 1.45], [1, -1.5], [-1, -1.5]];
  for (const [s, z] of spots) {
    const x = s * 1.25;
    b.part(new THREE.CylinderGeometry(0.46, 0.4, 0.3, 8), STEEL, { bone: body, at: [x, 0.55, z] });
    b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 8), ARMOR, { bone: body, at: [x, 0.7, z] });
    b.part(new THREE.CylinderGeometry(0.34, 0.4, 0.14, 8), DARK, { bone: body, at: [x, 0.35, z] });
    glow(b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8), CYAN, { bone: body, at: [x, 0.27, z] }), 2.2);
    b.rod([s * 0.95, 0.6, z], [x, 0.55, z], 0.07, { bone: body, color: STEEL });
    glow(
      b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
        bone: body, at: [x + s * 0.0, 0.76, z], dir: [0, 1, 0], axis: "z", texture: logo,
      }),
      1.3,
    );
    // fins
    for (const k of [1, -1]) box(0.04, 0.3, 0.5, DARK, [x + k * 0.46, 0.6, z]);
  }
  // exhaust stacks
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 0.9, 0.0], [s * 0.8, 1.9, -0.45], 0.06, { bone: body, color: STEEL });
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), PINK, { bone: body, at: [s * 0.8, 1.92, -0.46] }), 1.5);
  }
  // antenna
  b.rod([-0.7, 1.9, 0.3], [-0.9, 2.7, 0.1], 0.015, { bone: body, color: DARK });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), PINK, { bone: body, at: [-0.9, 2.72, 0.1] }), 2);
  // door stripe & number
  const R = rng(3);
  for (const s of [1, -1]) box(0.02, 0.12, 0.8, YEL, [s * 0.94, 1.0, 0.5 + R() * 0.0]);
  // cargo crates
  box(0.6, 0.4, 0.6, mottle("#6b5a3a", "#4a3d26", { size: 0.2 }), [-0.4, 1.05, -1.7]);
  glow(box(0.3, 0.1, 0.3, CYAN, [0.4, 0.92, -1.3]), 1.5);

  // lift body so bottom (thruster glow at ~0.25) hovers; ground at y=0 via lowest parts
  return b.root;
}
