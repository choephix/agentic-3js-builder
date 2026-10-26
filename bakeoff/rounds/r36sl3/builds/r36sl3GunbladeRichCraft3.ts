import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { catmull } from "../../../../src/index";
import { metal, INK as CINK } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { grain, mottle, countershade, paint, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Gunblade",
  description: "A Final Fantasy style revolver-sword with a gilded guard, chamber cylinder, trigger and lion emblem.",
};

const GILT = metal("gilt");
const STEEL = countershade(metal("steel", { polish: 0.7, tarnish: 0.05 }), "#8a93aa", { level: -0.2 });
const DARK = metal("iron");
const BLUED = metal("blued");
const LEATHER = grain("#3a2218", "#6a4430", { size: 0.01, axis: "y" });
const EDGE = "#f4f8ff";
const BLACK = "#14141c";
const GEM = "#44c8ff";
const WINE = "#7a1e2c";

const LION = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 6 L38 22 L32 30 L26 22Z" fill="#2a3552" stroke="#0e1426" stroke-width="2"/>
  <circle cx="32" cy="44" r="13" fill="#d9a83c" stroke="#3a2a0e" stroke-width="3"/>
  <path d="M32 31 L36 38 L44 36 L40 44 L46 50 L38 52 L36 59 L32 54 L28 59 L26 52 L18 50 L24 44 L20 36 L28 38Z" fill="#f2cf6a" stroke="#3a2a0e" stroke-width="2"/>
  <circle cx="27" cy="44" r="2.2" fill="#2a1a08"/><circle cx="37" cy="44" r="2.2" fill="#2a1a08"/>
  <path d="M29 50 L32 54 L35 50" stroke="#2a1a08" stroke-width="2" fill="none"/>
  <path d="M30 64 L32 120 L34 64Z" fill="#2a3552"/>
  <path d="M10 70 Q20 78 28 92 M54 70 Q44 78 36 92" stroke="#2a3552" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M14 84 Q22 90 29 104 M50 84 Q42 90 35 104" stroke="#2a3552" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const Z = [0, 0, 1] as const;

  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);

  // --- Pommel and grip ---
  b.lathe(
    [[0, 0], [0.026, 0], [0.034, 0.015], [0.036, 0.03], [0.028, 0.05], [0.02, 0.058], [0, 0.058]],
    { at: [0, 0, 0], segments: 8, color: GILT },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.014), GEM, { at: [0, 0.03, 0.034], scale: [1, 1.3, 0.8] }), 1.6);
  b.rod([0, 0.055, 0], [0, 0.345, 0], [0.025, 0.021], { color: LEATHER, sides: 8 });
  for (let i = 0; i < 7; i++) {
    const y = 0.09 + i * 0.038;
    b.part(new THREE.TorusGeometry(0.0235 - i * 0.0003, 0.0045, 4, 10), WINE, {
      at: [0, y, 0],
      dir: [0, 1, 0],
      axis: "z",
    });
  }
  b.part(cyl(0.03, 0.03, 0.016, 8), GILT, { at: [0, 0.35, 0] });

  // --- Guard ---
  b.extrude(
    [[-0.075, 0.02], [-0.05, 0], [0.05, 0], [0.1, 0.035, "sharp"], [0.05, 0.065], [-0.05, 0.065], [-0.08, 0.045, "sharp"]],
    { at: [0, 0.355, 0], x: [1, 0, 0], thickness: 0.032, bevel: 0.005, color: GILT },
  );
  b.extrude([[-0.05, 0], [0.05, 0], [0.04, 0.03], [-0.04, 0.03]], {
    at: [0, 0.395, 0], x: [1, 0, 0], thickness: 0.026, color: DARK,
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.008, 6, 4), GEM, { at: [s * 0.062, 0.388, 0.019] });
  b.part(new THREE.SphereGeometry(0.0085, 6, 4), GEM, { at: [0.062, 0.388, 0.019] });
  glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), GEM, { at: [-0.062, 0.388, 0.019] }), 1.4);

  // --- Trigger guard and trigger (left of the spine side) ---
  const tg = catmull(
    [[-0.045, 0.37, -0.01], [-0.045, 0.31, -0.01], [-0.045, 0.27, 0.04], [-0.045, 0.31, 0.09], [-0.045, 0.365, 0.075]],
  );
  b.sweep(tg, 0.0065, { color: GILT, sides: 6 });
  b.spike([-0.045, 0.36, 0.045], [0.0, -0.9, -0.35], 0.065, 0.011, { color: DARK });
  b.spike([-0.045, 0.36, 0.045], [0.0, -0.9, -0.35], 0.065, 0.011, { color: DARK });

  // --- Blade ---
  const B0 = 0.43;
  b.part(new THREE.BoxGeometry(0.06, 0.07, 0.03), GILT, { at: [0, B0 + 0.01, 0] });
  b.extrude(
    [[-0.05, 0], [0.055, 0], [0.055, 0.78], [-0.012, 0.93, "sharp"], [-0.05, 0.84]],
    { at: [0, B0, 0], x: [1, 0, 0], thickness: 0.012, bevel: 0.002, color: STEEL },
  );
  b.extrude(
    [[0.04, 0.03], [0.057, 0.03], [0.057, 0.77], [0.04, 0.74]],
    { at: [0, B0, 0], x: [1, 0, 0], thickness: 0.009, color: EDGE },
  );
  // thick spine
  b.part(new THREE.BoxGeometry(0.026, 0.84, 0.03), DARK, { at: [-0.05, B0 + 0.45, 0] });
  for (let i = 0; i < 5; i++)
    b.part(new THREE.SphereGeometry(0.007, 6, 4), GILT, { at: [-0.05, B0 + 0.28 + i * 0.12, 0.0155] });
  // fuller groove
  b.part(new THREE.BoxGeometry(0.014, 0.56, 0.003), BLUED, { at: [0.012, B0 + 0.4, 0.0062] });
  // lion emblem
  b.part(new THREE.PlaneGeometry(0.056, 0.112), "#ffffff", {
    at: [0, B0 + 0.34, 0.0075], dir: Z as unknown as number[], axis: "z", texture: LION,
  });
  // tip accent
  b.spike([0.0, B0 + 0.86, 0], [0, 1, 0], 0.001, 0.001, { color: EDGE });

  // --- Revolver cylinder (on the blade root, axis along Z) ---
  const CC: [number, number, number] = [-0.012, B0 + 0.095, 0.0];
  b.part(cyl(0.062, 0.062, 0.05, 12), DARK, { at: CC, dir: [0, 0, 1] });
  b.part(cyl(0.066, 0.066, 0.012, 12), GILT, { at: [CC[0], CC[1], 0.027], dir: [0, 0, 1] });
  b.part(cyl(0.066, 0.066, 0.012, 12), GILT, { at: [CC[0], CC[1], -0.027], dir: [0, 0, 1] });
  b.part(cyl(0.016, 0.016, 0.07, 8), BLUED, { at: [CC[0], CC[1], 0.0], dir: [0, 0, 1] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(cyl(0.0125, 0.0125, 0.008, 8), BLACK, {
      at: [CC[0] + Math.cos(a) * 0.04, CC[1] + Math.sin(a) * 0.04, 0.0335],
      dir: [0, 0, 1],
    });
    b.part(cyl(0.007, 0.007, 0.009, 6), "#d9a83c", {
      at: [CC[0] + Math.cos(a) * 0.04, CC[1] + Math.sin(a) * 0.04, 0.0345],
      dir: [0, 0, 1],
    });
  }
  // hammer
  b.extrude([[0, 0], [0.04, 0.0], [0.05, 0.03], [0.02, 0.05, "sharp"], [0, 0.03]], {
    at: [-0.04, B0 + 0.12, 0], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.016, color: DARK,
  });
  b.part(cyl(0.01, 0.01, 0.022, 6), GILT, { at: [-0.075, B0 + 0.12, 0], dir: [0, 0, 1] });
  // barrel / muzzle piece along the spine
  b.part(new THREE.BoxGeometry(0.024, 0.34, 0.022), BLUED, { at: [-0.05, B0 + 0.34, 0.0] , scale: [1, 1, 1] });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.032), GILT, { at: [-0.05, B0 + 0.52, 0] });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.032), GILT, { at: [-0.05, B0 + 0.78, 0] });

  return b.root;
}
