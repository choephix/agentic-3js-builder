import * as THREE from "three";
import { createBuilder, frame, rng, paint, noise, mix, smoothstep, svg, countershade } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description: "A Final Fantasy style gunblade: a heavy steel blade with a revolver chamber, trigger guard, lion-crest guard and ornate grip.",
};

const STEEL = "#c9d2de";
const DARK = "#2a2f3a";
const GOLD = "#e0b24a";
const LEATHER = "#3a2418";
const BLUE = "#4aa8ff";

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const r = rng(5);

  // The weapon is held vertically in a display pose, pommel at the floor.
  const root = b.joint("root", { at: [0, 0.05, 0], dir: [0, 1, 0] });

  const bladePaint = paint((p, n) => {
    const edge = smoothstep(0.02, 0.0, Math.abs(p.x) - 0.0);
    const base = mix("#aeb9c8", "#eef3fa", noise(p, 0.15, 3));
    return mix(base, "#7f8b9c", 0.35 * (1 - smoothstep(-0.6, 0.6, n.x)) + 0.0 * edge);
  });
  const metalDark = countershade("#4a5262", "#20242e");

  // Pommel
  b.part(new THREE.SphereGeometry(0.045, 8, 6), GOLD, { bone: root, at: [0, 0.05, 0] });
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.04, 8), DARK, { bone: root, at: [0, 0.1, 0] });

  // Grip with wraps
  b.part(new THREE.CylinderGeometry(0.026, 0.028, 0.22, 8), LEATHER, { bone: root, at: [0, 0.23, 0] });
  for (let i = 0; i < 8; i++)
    b.part(new THREE.TorusGeometry(0.029, 0.005, 4, 8), GOLD, {
      bone: root,
      at: [0, 0.14 + i * 0.026, 0],
      rotation: [90, 0, 0],
    });

  // Revolver chamber (cylinder) with bullet holes
  const cy = 0.4;
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 6), metalDark, { bone: root, at: [0, cy, 0], rotation: [0, 0, 90] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.104, 6), "#0c0e12", {
      bone: root,
      at: [0, cy + Math.sin(a) * 0.05, Math.cos(a) * 0.05],
      rotation: [0, 0, 90],
    });
  }
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), GOLD, { bone: root, at: [0, cy, 0], rotation: [0, 0, 90] });

  // Gun body behind the blade
  b.part(new THREE.BoxGeometry(0.05, 0.14, 0.2), DARK, { bone: root, at: [0, 0.4, -0.04] });
  b.part(new THREE.BoxGeometry(0.056, 0.05, 0.1), GOLD, { bone: root, at: [0, 0.47, -0.1] });
  // Hammer
  b.part(new THREE.BoxGeometry(0.02, 0.07, 0.03), STEEL, { bone: root, at: [0, 0.5, -0.14], rotation: [-30, 0, 0] });
  // Trigger and guard
  b.part(new THREE.TorusGeometry(0.045, 0.007, 4, 10, Math.PI), GOLD, { bone: root, at: [0, 0.33, 0.07], rotation: [0, 90, 0] });
  b.part(new THREE.BoxGeometry(0.01, 0.04, 0.012), STEEL, { bone: root, at: [0, 0.34, 0.06] });

  // Guard (crossguard, lion-style wings)
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.12, 0.02], [0.2, 0.09], [0.14, 0.0], [0.1, -0.05], [0, -0.035]],
      { at: [0, 0.49, 0], x: [s, 0, 0], thickness: 0.03, bevel: 0.006, color: GOLD, bone: root },
    );
  }
  b.part(new THREE.OctahedronGeometry(0.03), BLUE, { bone: root, at: [0, 0.49, 0.025] });
  glow(b.part(new THREE.OctahedronGeometry(0.022), BLUE, { bone: root, at: [0, 0.49, 0.03] }), 1.5);

  // Blade: wide, single-edged, with notch and clipped tip
  const outline: [number, number, "sharp"?][] = [
    [-0.045, 0.0],
    [0.045, 0.0],
    [0.065, 0.45],
    [0.06, 0.95],
    [0.0, 1.12, "sharp"],
    [-0.055, 0.98],
    [-0.055, 0.5],
  ];
  b.extrude(outline as any, { at: [0, 0.5, 0], x: [1, 0, 0], thickness: 0.018, bevel: 0.004, color: bladePaint, bone: root });
  // Fuller groove / spine
  b.part(new THREE.BoxGeometry(0.014, 0.8, 0.022), "#7d8898", { bone: root, at: [0.015, 0.95, 0] });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.026), DARK, { bone: root, at: [0.005, 0.54, 0] });
  // Edge highlight
  b.part(new THREE.BoxGeometry(0.006, 0.9, 0.022), "#ffffff", { bone: root, at: [0.058, 0.97, 0] });
  // Rivets along the blade
  for (let i = 0; i < 5; i++)
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { bone: root, at: [-0.02, 0.62 + i * 0.12, 0.012] });

  // Rune glyphs on blade
  const rune = svg(
    `<svg viewBox="0 0 32 128"><g stroke="#4aa8ff" stroke-width="4" fill="none" stroke-linecap="round"><path d="M16 6 L16 30 M6 18 L26 18"/><circle cx="16" cy="56" r="9"/><path d="M6 90 L16 76 L26 90 L16 108 Z"/></g></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.05, 0.3), "#ffffff", {
      bone: root,
      at: [-0.005, 0.85, 0.0105],
      dir: [0, 0, 1],
      axis: "z",
      texture: rune,
    }),
    1.2,
  );

  // Muzzle at blade base and tassel chain
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 6), GOLD, { bone: root, at: [0, 0.66, 0.04], rotation: [90, 0, 0] });
  for (let i = 0; i < 6; i++)
    b.part(new THREE.TorusGeometry(0.01, 0.003, 4, 6), STEEL, {
      bone: root,
      at: [0.03, 0.16 - i * 0.0, -0.03 + 0 * r()],
      rotation: [0, i % 2 ? 90 : 0, 0],
      scale: 0.0001,
    });

  return b.root;
}
