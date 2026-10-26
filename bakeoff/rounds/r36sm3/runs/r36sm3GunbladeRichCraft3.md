```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A Final Fantasy style revolver gunblade planted tip-down: a long steel blade with a gilded filigree fuller, a gold winged guard, a revolver cylinder and hammer, a trigger guard, a wrapped grip and a charm chain.",
};

// ---- palette -------------------------------------------------------------------------------------------------
const GUNMETAL = "#2b3040";
const NAVY = "#1b2236";
const LEATHER = "#20263c";
const CRYSTAL = "#5ff0ff";
const EMBER = "#ff5a3a";

const STEEL = paint((p, n, s) => {
  const x = s[0];
  const y = s[1];
  const grain = noise(p, 0.05, 3);
  let c = mix("#a8b4ca", "#dde6f2", smoothstep(0.2, 0.8, grain));
  c = mix(c, "#7d8aa6", smoothstep(-0.03, -0.065, x) * 0.7);
  c = mix(c, "#6f86b8", smoothstep(0.35, 0.0, y) * 0.5);
  if (x > 0.037) c = mix(c, "#f8fbff", 0.85);
  if (Math.abs(n.z) < 0.5 && x > 0.05) c = "#ffffff" as unknown as typeof c;
  return c;
});
const GOLD = paint((p, n) =>
  mix("#a8731f", "#ffd978", smoothstep(-0.4, 1, n.y) * 0.65 + noise(p, 0.03, 8) * 0.35),
);
const DARKMETAL = paint((p, n) =>
  mix("#232838", "#4a5370", smoothstep(-0.2, 1, n.y) * 0.6 + noise(p, 0.04, 5) * 0.3),
);
const WRAP = paint((p, n) => {
  const k = Math.sin(p.y * 260 + p.x * 40) * 0.5 + 0.5;
  return mix("#141a2c", "#2d3a5c", k * 0.8 + n.y * 0.1);
});

// ---- textures ------------------------------------------------------------------------------------------------
const FILIGREE = svg(
  `<svg viewBox="0 0 60 400" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 6 L30 300" stroke="#27345c" stroke-width="7" stroke-linecap="round"/>
    <path d="M30 6 L30 300" stroke="#8fb4ff" stroke-width="2" stroke-linecap="round"/>
    <g fill="none" stroke="#e9b94a" stroke-width="4" stroke-linecap="round">
      <path d="M30 310 C10 296 6 270 14 250"/><path d="M30 310 C50 296 54 270 46 250"/>
      <path d="M30 336 C14 326 10 306 18 290"/><path d="M30 336 C46 326 50 306 42 290"/>
      <path d="M30 362 C20 354 18 340 24 330"/><path d="M30 362 C40 354 42 340 36 330"/>
    </g>
    <path d="M30 372 L38 386 L30 398 L22 386Z" fill="#e9b94a" stroke="#6b4310" stroke-width="2"/>
    <g fill="#e9b94a"><circle cx="30" cy="60" r="3"/><circle cx="30" cy="110" r="3"/><circle cx="30" cy="160" r="3"/><circle cx="30" cy="210" r="3"/><circle cx="30" cy="260" r="3"/></g>
  </svg>`,
  { size: 400 },
);
const CHAMBER = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#8a96b4" stroke="#1b2236" stroke-width="3"/>
    <circle cx="50" cy="50" r="40" fill="#3a4466" stroke="#e9b94a" stroke-width="3"/>
    <g fill="#0c0f1a" stroke="#e9b94a" stroke-width="1.5">
      <circle cx="50" cy="24" r="8"/><circle cx="72.5" cy="37" r="8"/><circle cx="72.5" cy="63" r="8"/>
      <circle cx="50" cy="76" r="8"/><circle cx="27.5" cy="63" r="8"/><circle cx="27.5" cy="37" r="8"/>
    </g>
    <circle cx="50" cy="50" r="9" fill="#e9b94a" stroke="#6b4310" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);
const WINGS = svg(
  `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#2a1a05" stroke-width="3" stroke-linecap="round">
      <path d="M100 30 C80 10 40 8 6 24"/><path d="M100 30 C120 10 160 8 194 24"/>
      <path d="M96 36 C76 28 46 30 22 40"/><path d="M104 36 C124 28 154 30 178 40"/>
    </g>
    <path d="M100 14 L108 30 L100 46 L92 30Z" fill="#5ff0ff" stroke="#2a1a05" stroke-width="2.5"/>
  </svg>`,
  { size: 256 },
);

// ---- build ---------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const T = 0.02; // blade thickness

  // blade
  b.extrude(
    [
      [0.03, -0.005, "sharp"],
      [0.066, 0.12, "sharp"],
      [0.066, 0.9, "sharp"],
      [-0.066, 0.9, "sharp"],
      [-0.066, 0.2, "sharp"],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: T, bevel: 0.003, color: STEEL, name: "blade" },
  );
  // filigree on both faces
  for (const sgn of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.07, 0.466), "#ffffff", {
      at: [0.0, 0.64, sgn * (T / 2 + 0.0015)],
      dir: [0, 0, sgn],
      axis: "z",
      up: [0, 1, 0],
      texture: FILIGREE,
    });
  }
  // spine nicks (jagged saw edge on upper spine)
  for (let i = 0; i < 6; i++) {
    const y = 0.4 + i * 0.07;
    b.spike([-0.062, y + 0.03, 0], [-0.098, y, 0], null, 0.012, { color: DARKMETAL });
  }

  // barrel along the spine
  b.rod([-0.085, 0.92, 0], [-0.085, 0.5, 0], 0.017, { color: DARKMETAL, section: { ngon: 6 } });
  b.part(new THREE.TorusGeometry(0.019, 0.006, 5, 8), GOLD, { at: [-0.085, 0.505, 0], dir: [0, 1, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 6), EMBER, { at: [-0.085, 0.498, 0] }), 1.2);
  for (const y of [0.84, 0.7, 0.58]) {
    b.part(new THREE.BoxGeometry(0.052, 0.028, 0.04), GOLD, { at: [-0.07, y, 0] });
    b.part(new THREE.BoxGeometry(0.01, 0.034, 0.044), DARKMETAL, { at: [-0.052, y, 0] });
  }

  // guard
  b.extrude(
    [
      [-0.13, 0.04, "sharp"],
      [-0.07, -0.02, "sharp"],
      [0.08, -0.02, "sharp"],
      [0.13, 0.04, "sharp"],
      [0.08, 0.055, "sharp"],
      [-0.08, 0.055, "sharp"],
    ],
    { at: [0, 0.87, 0], x: [1, 0, 0], thickness: 0.048, bevel: 0.006, color: GOLD, name: "guard" },
  );
  for (const sgn of [1, -1]) {
    b.spike([sgn * 0.12, 0.89, 0], [sgn * 0.15, 0.82, 0], null, 0.016, { color: GOLD });
    b.part(new THREE.PlaneGeometry(0.2, 0.06), "#ffffff", {
      at: [0, 0.905, sgn * 0.0255],
      dir: [0, 0, sgn],
      axis: "z",
      texture: WINGS,
    });
  }

  // gun housing
  b.part(new THREE.BoxGeometry(0.13, 0.2, 0.056), DARKMETAL, { at: [0, 1.0, 0], name: "housing" });
  b.part(new THREE.BoxGeometry(0.138, 0.016, 0.062), GOLD, { at: [0, 0.912, 0] });
  b.part(new THREE.BoxGeometry(0.138, 0.016, 0.062), GOLD, { at: [0, 1.098, 0] });

  // revolver cylinder
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.072, 12), GOLD, {
    at: [0, 1.0, 0],
    dir: [0, 0, 1],
    flat: true,
    name: "cylinder",
  });
  for (const sgn of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.052, 12), "#ffffff", {
      at: [0, 1.0, sgn * 0.0368],
      dir: [0, 0, sgn],
      axis: "z",
      texture: CHAMBER,
    });
  }
  // flutes: bolts around the cylinder rim
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.078, 6), "#3a4466", {
      at: [Math.sin(a) * 0.054, 1.0 + Math.cos(a) * 0.054, 0],
      dir: [0, 0, 1],
    });
  }
  glow(
    b.part(new THREE.OctahedronGeometry(0.02), CRYSTAL, {
      at: [0, 0.905, 0.032],
      scale: [1, 1.4, 0.7],
      flat: true,
    }),
    1.4,
  );

  // hammer
  b.spike([-0.06, 1.085, 0], [-0.13, 1.17, 0], null, 0.016, { color: GUNMETAL });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.02), GOLD, { at: [-0.135, 1.175, 0] });

  // grip
  b.rod([0, 1.1, 0], [0, 1.34, 0], [0.024, 0.02], { color: WRAP, sides: 8, name: "grip" });
  for (const y of [1.115, 1.2, 1.325]) {
    b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.012, 8), GOLD, { at: [0, y, 0] });
  }
  // trigger + guard
  b.sweep(
    [
      [0.045, 1.105, 0],
      [0.1, 1.15, 0],
      [0.105, 1.22, 0],
      [0.05, 1.27, 0],
    ],
    0.006,
    { color: GOLD, sides: 6, caps: "round" },
  );
  b.spike([0.05, 1.235, 0], [0.04, 1.145, 0], null, 0.01, { color: GUNMETAL });

  // pommel
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.037, 0.016],
      [0.03, 0.04],
      [0.014, 0.056],
      [0, 0.058],
    ],
    { at: [0, 1.338, 0], color: GOLD, segments: 8, name: "pommel" },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.014), EMBER, { at: [0, 1.4, 0], scale: [1, 1.3, 1], flat: true }), 1.3);
  b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 10), GOLD, { at: [0, 1.347, 0.036], dir: [0, 0, 1], axis: "z" });

  // charm chain
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.TorusGeometry(0.01, 0.0028, 5, 8), GOLD, {
      at: [0, 1.325 - i * 0.017, 0.04],
      rotation: [0, i % 2 ? 0 : 90, 0],
    });
  }
  b.part(new THREE.OctahedronGeometry(0.02), GOLD, { at: [0, 1.2, 0.04], scale: [0.8, 1.4, 0.4], flat: true });
  b.part(new THREE.OctahedronGeometry(0.009), NAVY, { at: [0, 1.2, 0.046], scale: [0.8, 1.4, 0.4], flat: true });
  b.part(new THREE.SphereGeometry(0.004, 4, 3), LEATHER, { at: [0.2, 0.3, 0.3] }).mesh.visible = false;

  return b.root;
}
```