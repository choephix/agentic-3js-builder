import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, stripes, noise, svg } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description: "Final Fantasy style revolver-bladed gunblade with glowing runes, drum cylinder and lion emblem.",
};

const GILT = metal("gilt");
const STEEL = metal("steel", { polish: 0.7 });
const BLUED = metal("blued");
const DARK = "#1a1a24";
const LEATHER = "#3a2418";
const BRASS = "#d9a93e";

const RUNE = svg(
  `<svg viewBox="0 0 32 160" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#7be8ff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 6 V154"/>
  <path d="M6 20 L16 30 L26 20"/><path d="M8 48 H24 M16 48 V66"/>
  <path d="M6 84 L16 74 L26 84 L16 98 Z"/><path d="M6 114 L26 126 M26 114 L6 126"/>
  <circle cx="16" cy="142" r="6"/></g></svg>`,
  { size: 256 },
);

const LION = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="#e9b947" stroke="#4a2c0a" stroke-width="5"/>
  <path d="M50 8 L62 20 L78 14 L80 32 L94 42 L84 56 L90 74 L72 76 L62 92 L50 82 L38 92 L28 76 L10 74 L16 56 L6 42 L20 32 L22 14 L38 20 Z" fill="#b8801f" stroke="#4a2c0a" stroke-width="3"/>
  <ellipse cx="50" cy="52" rx="23" ry="26" fill="#f6d77a" stroke="#4a2c0a" stroke-width="3"/>
  <path d="M34 44 L44 48 M66 44 L56 48" stroke="#2a1608" stroke-width="4" stroke-linecap="round"/>
  <path d="M50 50 V62 M42 68 Q50 74 58 68" stroke="#2a1608" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M44 58 H56 L50 64 Z" fill="#7a3a22"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "gunblade" });

  const box = (w: number, h: number, d: number, color: any, at: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as [number, number, number] });

  // Blade
  const BY = 0.46;
  const bladePaint = paint((p, n, s) => {
    const edge = s[0] > 0.045 ? 1 : 0;
    const base = STEEL.at(p, n);
    const hi: [number, number, number] = [0.95, 0.97, 1];
    const wear = smoothstep(0.55, 0.8, noise(p, 0.05, 4)) * 0.15;
    const c = mix(base, hi, edge ? 0.7 : wear);
    return n.z < -0.5 && !edge ? mix(c, "#8a95b0", 0.15) : c;
  });
  b.extrude(
    [
      [-0.04, 0],
      [0.06, 0],
      [0.06, 0.58, "sharp"],
      [-0.04, 0.76, "sharp"],
    ],
    { at: [0, BY, 0], x: [1, 0, 0], thickness: 0.014, bevel: 0.003, color: bladePaint },
  );
  // fuller runes (glowing)
  for (const z of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.036, 0.18), "#ffffff", {
        at: [0.008, BY + 0.34, z * 0.0078],
        dir: [0, 0, z],
        axis: "z",
        texture: RUNE,
      }),
      1.4,
    );
    b.part(new THREE.PlaneGeometry(0.036, 0.32), "#ffffff", { at: [0.008, BY + 0.34, z * 0.0076], dir: [0, 0, z], axis: "z", color: DARK } as any);
  }
  // Spine barrel
  box(0.032, 0.76, 0.034, BLUED, [-0.052, BY + 0.38, 0]);
  for (let i = 0; i < 5; i++) box(0.04, 0.018, 0.042, GILT, [-0.052, BY + 0.1 + i * 0.15, 0]);
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 8), STEEL, { at: [-0.052, BY + 0.775, 0] });
  b.part(new THREE.CircleGeometry(0.011, 8), DARK, { at: [-0.052, BY + 0.791, 0], dir: [0, 1, 0], axis: "z" });
  // Ricasso collar
  box(0.13, 0.03, 0.044, GILT, [0.005, BY + 0.01, 0]);

  // Receiver and drum
  box(0.075, 0.06, 0.048, BLUED, [0, 0.34, 0]);
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.12, 12), BLUED, { at: [-0.01, 0.405, 0], flat: true });
  for (const y of [0.35, 0.46]) b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.014, 12), GILT, { at: [-0.01, y, 0], flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 8), BRASS, {
      at: [-0.01 + 0.035 * Math.cos(a), 0.472, 0.035 * Math.sin(a)],
    });
    b.part(new THREE.BoxGeometry(0.01, 0.1, 0.012), GILT, {
      at: [-0.01 + 0.05 * Math.cos(a + 0.5), 0.405, 0.05 * Math.sin(a + 0.5)],
      rotation: [0, -((a + 0.5) * 180) / Math.PI, 0],
    });
  }
  // gem + lion
  glow(b.part(new THREE.OctahedronGeometry(0.014), "#5fd8ff", { at: [-0.01, 0.405, 0.056] }), 1.6);
  b.part(new THREE.CircleGeometry(0.03, 16), "#ffffff", { at: [0.0, 0.337, 0.025], dir: [0, 0, 1], axis: "z", texture: LION });

  // Guard
  b.extrude(
    [
      [-0.07, 0.01],
      [-0.04, 0],
      [0.08, 0],
      [0.1, 0.015],
      [0.08, 0.04],
      [-0.04, 0.04],
    ],
    { at: [0, 0.29, 0], x: [1, 0, 0], thickness: 0.035, bevel: 0.004, color: GILT },
  );
  // trigger guard + trigger
  b.part(new THREE.TorusGeometry(0.04, 0.006, 5, 10, Math.PI), GILT, { at: [0.04, 0.292, 0], rotation: [0, 0, 180] });
  b.rod([0.04, 0.292, 0], [0.047, 0.262, 0], 0.005, STEEL);
  // hammer
  b.rod([-0.04, 0.335, 0], [-0.088, 0.395, 0], 0.009, STEEL);
  box(0.02, 0.016, 0.02, STEEL, [-0.092, 0.4, 0]);

  // Grip
  b.part(new THREE.CylinderGeometry(0.023, 0.021, 0.25, 8), stripes(LEATHER, "#150b06", { size: 0.022, axis: "y", wobble: 0.1, width: 0.5 }), {
    at: [0, 0.165, 0],
  });
  for (const y of [0.045, 0.285]) b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.012, 8), GILT, { at: [0, y, 0] });
  // Pommel
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.04, 0.02],
      [0.03, 0.045],
      [0, 0.05],
    ],
    { at: [0, 0, 0], color: GILT, segments: 8 },
  );
  b.part(new THREE.CircleGeometry(0.022, 14), "#ffffff", { at: [0, 0.025, 0.037], dir: [0, 0, 1], axis: "z", texture: LION });
  // Hanging chain loop from pommel to guard (lion pendant motif)
  b.part(new THREE.TorusGeometry(0.018, 0.004, 5, 10), GILT, { at: [0.045, 0.06, 0], rotation: [0, 0, 0] });

  return b.root;
}
