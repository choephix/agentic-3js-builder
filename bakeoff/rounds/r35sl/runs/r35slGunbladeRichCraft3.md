```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gunblade",
  description: "Final Fantasy style revolver gunblade with a lion-wing guard, drum, hammer, trigger and glowing gem.",
};

const STEEL = "#c9d3e0";
const DARK = "#2b3040";
const GOLD = "#e0b24a";
const LEATHER = "#3a2418";
const CYAN = "#5ff0ff";

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const Z = [0, 0, 1] as [number, number, number];
  const X = [1, 0, 0] as [number, number, number];

  const steelPaint = paint((p, n) => {
    const c = mix("#8f9bb0", "#eef3fa", smoothstep(0.2, 0.8, noise(p, 0.12, 3)) * 0.5 + 0.5 * smoothstep(-0.4, 1, n.y));
    return c;
  });
  const goldPaint = paint((p, n) => mix("#a87a22", "#ffe08a", smoothstep(-0.5, 1, n.y) * 0.7 + noise(p, 0.05, 5) * 0.3));
  const leather = paint((p) => mix("#2a1810", "#5a3a26", noise(p, 0.015, 8)));

  // ---- Pommel
  b.lathe(
    [[0, 0], [0.03, 0.0], [0.04, 0.02], [0.04, 0.04], [0.026, 0.055], [0, 0.055]],
    { at: [0, 0, 0], color: goldPaint, segments: 8 },
  );
  b.part(new THREE.SphereGeometry(0.012, 6, 4), CYAN, { at: [0, 0.03, 0.04], bone: undefined });
  glow(b.part(new THREE.SphereGeometry(0.011, 6, 4), CYAN, { at: [0, 0.03, 0.04] }), 1.5);

  // ---- Grip
  b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.25, 8), leather, { at: [0, 0.18, 0] });
  for (let i = 0; i < 9; i++) {
    b.part(new THREE.TorusGeometry(0.0245, 0.004, 4, 8), DARK, {
      at: [0, 0.07 + i * 0.026, 0],
      rotation: [90, 0, 0],
    });
  }
  // ---- Guard (lion wing shape)
  const wing = [
    [0, 0], [0.12, 0.02], [0.16, 0.0], [0.13, -0.03], [0.1, -0.02], [0, -0.03],
  ] as [number, number][];
  for (const s of [1, -1]) {
    b.extrude(wing, { at: [0, 0.31, 0], x: [s, 0, 0], thickness: 0.018, bevel: 0.004, color: goldPaint, smoothing: 1 });
  }
  b.part(new THREE.BoxGeometry(0.07, 0.05, 0.05), goldPaint, { at: [0, 0.305, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.02), CYAN, { at: [0, 0.305, 0.03], scale: [1, 1.4, 0.6] }), 1.6);

  // ---- Trigger guard + trigger
  b.part(new THREE.TorusGeometry(0.04, 0.005, 4, 10, Math.PI * 1.1), GOLD, { at: [0.0, 0.31, 0.0], rotation: [0, 90, 200], scale: [1, 1, 1] });
  b.extrude([[0, 0], [0.012, 0.0], [0.006, -0.05], [-0.004, -0.05]], {
    at: [0, 0.38, 0.0], x: [0, 0, 1], thickness: 0.008, color: DARK,
  });

  // ---- Receiver block
  b.part(new THREE.BoxGeometry(0.09, 0.14, 0.05), steelPaint, { at: [-0.02, 0.4, 0] });
  b.part(new THREE.BoxGeometry(0.094, 0.015, 0.054), DARK, { at: [-0.02, 0.335, 0] });

  // ---- Blade
  const bladeBase = 0.46;
  const blade = [
    [-0.045, 0], [0.06, 0], [0.06, 0.66], [0.0, 0.82, "sharp"], [-0.045, 0.76],
  ] as [number, number, "sharp"?][];
  b.extrude(blade as any, { at: [0, bladeBase, 0], x: X, thickness: 0.012, bevel: 0.002, color: steelPaint });
  // edge bevel strip (bright)
  b.extrude(
    [[0.044, 0.0], [0.06, 0.0], [0.06, 0.66], [0.0, 0.82, "sharp"], [0.02, 0.7]] as any,
    { at: [0, bladeBase, 0], x: X, thickness: 0.0135, color: "#f6fbff" },
  );
  // spine
  b.part(new THREE.BoxGeometry(0.026, 0.8, 0.034), DARK, { at: [-0.055, bladeBase + 0.38, 0] });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.038), GOLD, { at: [-0.055, bladeBase + 0.05, 0] });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.038), GOLD, { at: [-0.055, bladeBase + 0.5, 0] });
  // barrel on spine
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.5, 8), STEEL, { at: [-0.055, bladeBase + 0.4, 0.028] });
  b.part(new THREE.CylinderGeometry(0.014, 0.012, 0.03, 8), DARK, { at: [-0.055, bladeBase + 0.66, 0.028] });
  b.part(new THREE.BoxGeometry(0.01, 0.014, 0.01), GOLD, { at: [-0.055, bladeBase + 0.68, 0.04] });

  // engraving texture
  const rune = svg(
    `<svg viewBox="0 0 40 300" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4 L34 30 L34 290 L6 290 L6 30Z" fill="none" stroke="#38425a" stroke-width="3"/>
      <path d="M20 20 L20 280" stroke="#38425a" stroke-width="3"/>
      <g fill="#5d6c8c"><path d="M20 60 l8 12 l-8 12 l-8 -12z"/><path d="M20 120 l8 12 l-8 12 l-8 -12z"/><path d="M20 180 l8 12 l-8 12 l-8 -12z"/></g>
      <circle cx="20" cy="250" r="8" fill="none" stroke="#38425a" stroke-width="3"/>
    </svg>`,
    { size: 300 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.05, 0.37), "#ffffff", {
      at: [0.0, bladeBase + 0.38, s * 0.0068],
      dir: [0, 0, s],
      axis: "z",
      texture: rune,
    });
  }

  // ---- Revolver drum (axis along z)
  const drumY = bladeBase - 0.02;
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 6), steelPaint, { at: [-0.04, drumY, 0.0], dir: Z });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.008, 6), GOLD, { at: [-0.04, drumY, s * 0.039], dir: Z });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 6), DARK, {
        at: [-0.04 + Math.cos(a) * 0.045, drumY + Math.sin(a) * 0.045, s * 0.0425],
        dir: Z,
      });
    }
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), CYAN, { at: [-0.04, drumY, s * 0.044], dir: Z });
    glow(b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8), CYAN, { at: [-0.04, drumY, s * 0.046], dir: Z }), 1.4);
  }
  // hammer
  b.extrude([[0, 0], [0.03, 0.01], [0.04, 0.05], [0.02, 0.04], [-0.005, 0.015]] as any, {
    at: [-0.075, bladeBase - 0.095, 0], x: [0, 0, 0].length ? [-1, 0, 0] : X, thickness: 0.01, color: DARK, bevel: 0.002,
  });

  // ---- Chain with lion charm hanging from guard
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.TorusGeometry(0.01, 0.0025, 4, 6), STEEL, {
      at: [0.045, 0.3 - i * 0.017, 0.03],
      rotation: [0, i % 2 ? 90 : 0, 0],
    });
  }
  const charm = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 2 L36 12 L32 34 L20 38 L8 34 L4 12Z" fill="#e0b24a" stroke="#4a3210" stroke-width="3"/><circle cx="14" cy="16" r="3" fill="#3a2410"/><circle cx="26" cy="16" r="3" fill="#3a2410"/><path d="M14 28 Q20 33 26 28" stroke="#3a2410" stroke-width="3" fill="none"/></svg>`,
    { size: 96 },
  );
  b.part(new THREE.PlaneGeometry(0.04, 0.04), "#ffffff", { at: [0.045, 0.17, 0.034], dir: Z, axis: "z", texture: charm });

  return b.root;
}
```