```ts
import * as THREE from "three";
import { createBuilder, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured convoy hauler: riveted six-axle-class cab with roof turret, neon trim and a sealed octagonal cargo pod with hazard hatch and glowing lock.",
};

// ---------------------------------------------------------------- palette
const NEON_C = "#22e6ff";
const NEON_M = "#ff2bd6";
const AMBER = "#ffb02e";
const RED = "#ff2a3c";
const WARM = "#fff1c4";
const DARK = "#14151b";
const STEEL = "#2c3040";
const GLASS = "#12a9c0";

// ---------------------------------------------------------------- textures
const windshield = svg(
  `<svg viewBox="0 0 180 108" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d3a4e"/><stop offset="1" stop-color="#061622"/></linearGradient></defs>
  <rect x="2" y="2" width="176" height="104" rx="8" fill="url(#g)" stroke="#05080d" stroke-width="4"/>
  <path d="M20 100 L70 6 M52 100 L102 6 M130 100 L158 40" stroke="#5ff2ff" stroke-opacity="0.35" stroke-width="7"/>
  <rect x="14" y="14" width="64" height="5" fill="#22e6ff"/><rect x="14" y="24" width="40" height="4" fill="#22e6ff" opacity="0.7"/>
  <text x="104" y="22" font-family="monospace" font-weight="bold" font-size="11" fill="#ff2bd6">CONVOY 07</text>
  <text x="104" y="35" font-family="monospace" font-size="9" fill="#22e6ff">ARMED / ESCORT</text>
  <path d="M30 88 H150" stroke="#22e6ff" stroke-width="2" stroke-dasharray="6 4"/>
  <circle cx="90" cy="66" r="14" fill="none" stroke="#ff2bd6" stroke-width="2"/><path d="M90 48v8M90 76v8M72 66h8M100 66h8" stroke="#ff2bd6" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);
const grille = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="50" rx="4" fill="#07080c" stroke="#000" stroke-width="3"/>
  ${[8, 16, 24, 32, 40].map((y) => `<rect x="8" y="${y}" width="84" height="4" fill="#ff2bd6" opacity="${0.45 + y / 90}"/>`).join("")}
  <path d="M50 6 L80 25 L50 44 L20 25Z" fill="none" stroke="#22e6ff" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);
const hazard = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#f5c518"/>
  ${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 24 - 130} 128 L${i * 24} 0" stroke="#121212" stroke-width="12"/>`).join("")}
  <rect x="2" y="2" width="124" height="124" fill="none" stroke="#121212" stroke-width="4"/>
  <rect x="34" y="52" width="60" height="44" rx="5" fill="#121212"/>
  <path d="M46 52 V40 a18 18 0 0 1 36 0 V52" fill="none" stroke="#121212" stroke-width="8"/>
  <circle cx="64" cy="70" r="7" fill="#ff2a3c"/><rect x="61" y="72" width="6" height="14" fill="#ff2a3c"/>
  </svg>`,
  { size: 256 },
);
const podLabel = svg(
  `<svg viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="176" height="86" rx="6" fill="#0a0f1c" stroke="#22e6ff" stroke-width="3"/>
  <path d="M30 16 L52 28 V54 L30 66 L8 54 V28Z" fill="none" stroke="#ff2bd6" stroke-width="4"/>
  <circle cx="30" cy="41" r="6" fill="#ff2bd6"/>
  <path d="M30 41 L30 25 M30 41 L16 49 M30 41 L44 49" stroke="#ff2bd6" stroke-width="3"/>
  <text x="62" y="40" font-family="sans-serif" font-weight="bold" font-size="24" fill="#ff2bd6">SEALED</text>
  <text x="62" y="58" font-family="monospace" font-size="11" fill="#22e6ff">CARGO POD // ARC-7</text>
  ${Array.from({ length: 22 }, (_, i) => `<rect x="${10 + i * 7.6}" y="74" width="${i % 3 === 0 ? 4 : 2}" height="9" fill="#22e6ff"/>`).join("")}
  <path d="M62 66 H170" stroke="#ffb02e" stroke-width="2" stroke-dasharray="5 3"/>
  </svg>`,
  { size: 384 },
);
const emblem = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 4 L92 18 V54 Q92 82 50 97 Q8 82 8 54 V18Z" fill="#0b1020" stroke="#22e6ff" stroke-width="5"/>
  <path d="M22 36 L50 54 L78 36 V50 L50 70 L22 50Z" fill="#ff2bd6"/>
  <text x="50" y="92" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#ffb02e" stroke="#000" stroke-width="0.8">07</text>
  </svg>`,
  { size: 192 },
);
const seal = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="#150508" stroke="#ff2a3c" stroke-width="5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#ff2a3c" stroke-width="3" stroke-dasharray="8 5"/>
  <rect x="30" y="46" width="40" height="30" rx="4" fill="#ff2a3c"/>
  <path d="M37 46 V36 a13 13 0 0 1 26 0 V46" fill="none" stroke="#ff2a3c" stroke-width="7"/>
  <rect x="47" y="55" width="6" height="12" fill="#150508"/>
  </svg>`,
  { size: 192 },
);
const tail = svg(
  `<svg viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="20" rx="3" fill="#2a0408"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${4 + i * 11.5}" y="4" width="9" height="12" fill="${i % 2 ? "#ff2a3c" : "#ff6a3c"}"/>`).join("")}
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- paints
const HULL = panelled(
  paint((p, n) => {
    const t = noise(p, 0.9, 3);
    let c = mix("#2a3347", "#475a82", t * 0.75 + smoothstep(0.2, 1, n.y) * 0.25);
    c = mix(c, "#15161c", smoothstep(1.3, 0.3, p.y) * 0.7);
    return c;
  }),
  { size: 0.6, aspect: 0.7, rivets: 0.14 },
);
const POD = panelled(
  paint((p, n) => mix("#241f36", "#40386a", noise(p, 0.8, 8) * 0.8 + smoothstep(0.3, 1, n.y) * 0.2)),
  { size: 0.7, aspect: 0.7, rivets: 0.15, seam: "#0a0812" },
);
const IRON = metal("iron", { tarnish: 0.6 });
const RUBBER = paint((p) => mix("#16161c", "#3a3026", noise(p, 0.25, 5) * 0.8));
const BAND = metal("steel", { tarnish: 0.5, polish: 0.1 });

// ---------------------------------------------------------------- builder
export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, opts: object = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...opts });
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    color: any,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    opts: object = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir, ...opts });
  const plane = (
    w: number,
    h: number,
    tex: THREE.Texture,
    at: [number, number, number],
    dir: [number, number, number],
    up?: [number, number, number],
  ) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir,
      axis: "z",
      texture: tex,
      ...(up ? { up } : {}),
    });
  const oct = (R: number): [number, number][] => {
    const t = R * Math.tan(Math.PI / 8);
    return [
      [t, R],
      [R, t],
      [R, -t],
      [t, -R],
      [-t, -R],
      [-R, -t],
      [-R, t],
      [-t, R],
    ];
  };

  // ------------------------------------------------ chassis & deck
  box(2.0, 0.5, 9.4, DARK, 0, 1.0, -0.05);
  box(2.5, 0.2, 6.4, STEEL, 0, 1.35, -1.3, {});
  box(2.46, 0.04, 6.3, IRON, 0, 1.47, -1.3);
  // under-glow
  for (const s of [1, -1]) {
    glow(box(0.06, 0.06, 8.6, NEON_M, s * 1.02, 0.66, -0.1), 1.4);
    // skirts between wheel groups
    box(0.1, 0.5, 2.6, HULL, s * 1.2, 0.98, -0.15);
    glow(box(0.02, 0.05, 2.3, NEON_C, s * 1.26, 0.98, -0.15), 1.3);
  }

  // ------------------------------------------------ wheels
  const wheel = (s: number, z: number) => {
    const x = s * 1.4;
    cyl(0.75, 0.75, 0.56, 12, RUBBER, [x, 0.73, z], [1, 0, 0]);
    cyl(0.5, 0.5, 0.6, 8, IRON, [x, 0.73, z], [1, 0, 0]);
    glow(cyl(0.27, 0.27, 0.05, 8, NEON_C, [s * 1.69, 0.73, z], [1, 0, 0]), 1.3);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.04, 0.04, 0.08, 6, BAND, [s * 1.7, 0.73 + Math.sin(a) * 0.4, z + Math.cos(a) * 0.4], [1, 0, 0]);
    }
  };
  for (const s of [1, -1]) for (const z of [3.3, 1.9, -2.2, -3.6]) wheel(s, z);
  // fenders
  for (const s of [1, -1]) {
    box(0.75, 0.16, 3.0, HULL, s * 1.4, 1.62, 2.6);
    box(0.75, 0.16, 2.3, HULL, s * 1.4, 1.62, -2.9);
    box(0.08, 0.34, 3.0, HULL, s * 1.76, 1.5, 2.6);
    box(0.08, 0.34, 2.3, HULL, s * 1.76, 1.5, -2.9);
    glow(box(0.03, 0.04, 2.9, NEON_C, s * 1.8, 1.54, 2.6), 1.2);
    glow(box(0.03, 0.04, 2.2, NEON_C, s * 1.8, 1.54, -2.9), 1.2);
  }

  // ------------------------------------------------ cab
  b.extrude(
    [
      [2.0, 1.1],
      [4.4, 1.1],
      [4.5, 1.9],
      [3.9, 2.4],
      [3.3, 3.3],
      [2.0, 3.3],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, color: HULL },
  );
  // windshield on slanted face (normal in z,y = 0.832,0.555)
  glow(plane(1.8, 1.08, windshield, [0, 2.85 + 0.012, 3.6 + 0.018], [0, 0.555, 0.832]), 0.9);
  // grille & lights
  glow(plane(1.2, 0.5, grille, [0, 1.62, 4.49], [0, 0.125, 1]), 1.0);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.14, 0.08, WARM, s * 0.8, 1.7, 4.49), 1.8);
    glow(box(0.14, 0.14, 0.08, AMBER, s * 0.93, 1.5, 4.49), 1.4);
  }
  // hood armour wedge
  b.extrude(
    [
      [3.95, 2.35],
      [4.52, 1.88],
      [4.52, 1.8],
      [3.9, 2.25],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.26, color: IRON },
  );
  // ram bumper
  b.extrude(
    [
      [4.35, 0.55],
      [5.0, 0.7],
      [5.0, 1.35],
      [4.35, 1.35],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, color: IRON },
  );
  plane(2.1, 0.5, hazard, [0, 1.02, 5.008], [0, 0, 1]);
  for (const s of [1, -1]) {
    box(0.18, 0.12, 0.7, DARK, s * 0.85, 0.5, 4.8);
    glow(box(0.08, 0.08, 0.05, NEON_M, s * 0.85, 0.5, 5.15), 1.5);
  }
  // side windows, doors
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [1.15, 0],
        [1.15, 0.6],
        [0, 0.6],
      ],
      { at: [s * 1.105, 2.4, 2.3], x: [0, 0, 1], thickness: 0.03, color: GLASS },
    );
    glow(box(0.02, 0.6, 1.15, GLASS, s * 1.11, 2.7, 2.875), 0.7);
    glow(plane(0.8, 0.8, emblem, [s * 1.112, 1.85, 3.1], [s, 0, 0]), 0.8);
    glow(box(0.02, 0.05, 2.0, NEON_M, s * 1.112, 1.4, 3.2), 1.4);
    box(0.03, 1.4, 0.04, DARK, s * 1.11, 1.9, 2.35);
    box(0.03, 1.4, 0.04, DARK, s * 1.11, 1.9, 3.8);
    box(0.06, 0.06, 0.3, BAND, s * 1.13, 2.2, 2.55);
    // mirrors
    box(0.2, 0.05, 0.05, DARK, s * 1.2, 2.55, 3.75);
    box(0.08, 0.42, 0.24, STEEL, s * 1.32, 2.55, 3.75);
    glow(box(0.02, 0.34, 0.18, NEON_C, s * 1.37, 2.55, 3.75), 0.8);
  }

  // roof light bar
  box(1.7, 0.12, 0.25, DARK, 0, 3.36, 2.15);
  glow(box(0.7, 0.08, 0.27, NEON_C, -0.45, 3.42, 2.15), 1.6);
  glow(box(0.7, 0.08, 0.27, RED, 0.45, 3.42, 2.15), 1.6);

  // turret
  cyl(0.5, 0.58, 0.2, 8, IRON, [0, 3.4, 2.85]);
  box(0.9, 0.45, 1.0, HULL, 0, 3.72, 2.8);
  box(0.7, 0.3, 0.3, IRON, 0, 3.72, 3.4);
  for (const s of [1, -1]) {
    cyl(0.065, 0.065, 1.5, 8, DARK, [s * 0.2, 3.72, 4.05], [0, 0, 1]);
    cyl(0.1, 0.1, 0.4, 8, BAND, [s * 0.2, 3.72, 3.5], [0, 0, 1]);
    glow(cyl(0.05, 0.05, 0.06, 8, AMBER, [s * 0.2, 3.72, 4.8], [0, 0, 1]), 1.6);
    box(0.3, 0.3, 0.4, STEEL, s * 0.6, 3.7, 2.7);
  }
  glow(b.part(new THREE.SphereGeometry(0.09, 6, 4), RED, { at: [0, 3.95, 3.15] }), 2);
  box(0.12, 0.2, 0.12, DARK, 0, 3.92, 3.15);

  // exhaust stacks, antenna
  for (const s of [1, -1]) {
    cyl(0.1, 0.1, 2.6, 8, IRON, [s * 1.06, 2.8, 1.85]);
    cyl(0.14, 0.1, 0.2, 8, BAND, [s * 1.06, 4.15, 1.85]);
    glow(cyl(0.11, 0.11, 0.04, 8, AMBER, [s * 1.06, 4.26, 1.85]), 1.4);
    box(0.2, 0.08, 0.2, DARK, s * 1.06, 2.0, 1.9);
  }
  cyl(0.02, 0.03, 1.5, 6, DARK, [-0.8, 4.05, 2.1]);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), NEON_M, { at: [-0.8, 4.82, 2.1] }), 2);
  // bridge between cab and pod
  box(1.2, 1.1, 0.2, DARK, 0, 2.55, 1.96);

  // ------------------------------------------------ cargo pod
  const CY = 2.65;
  b.extrude(oct(1.2), { at: [0, CY, -1.3], x: [1, 0, 0], thickness: 5.6, color: POD });
  b.extrude(oct(0.95), { at: [0, CY, 1.7], x: [1, 0, 0], thickness: 0.4, color: POD });
  b.extrude(oct(0.95), { at: [0, CY, -4.3], x: [1, 0, 0], thickness: 0.4, color: POD });
  glow(plane(0.95, 0.95, seal, [0, CY, -4.505], [0, 0, -1]), 1.1);
  for (const s of [1, -1]) {
    glow(box(0.12, 0.12, 0.05, RED, s * 0.7, CY + 0.55, 1.905), 1.8);
    glow(box(0.12, 0.12, 0.05, RED, s * 0.7, CY - 0.55, 1.905), 1.8);
    // pod side label
    glow(plane(1.8, 0.9, podLabel, [s * 1.212, CY, -1.3], [s, 0, 0]), 0.9);
    // upper ridge neon
    glow(box(0.05, 0.05, 5.4, NEON_C, s * 1.2, CY + 0.5, -1.3), 1.4);
    glow(box(0.05, 0.05, 5.4, NEON_M, s * 1.2, CY - 0.5, -1.3), 1.2);
  }
  // armour bands
  for (const z of [1.1, -0.2, -2.4, -3.7]) {
    b.extrude(oct(1.27), { at: [0, CY, z], x: [1, 0, 0], thickness: 0.22, color: BAND });
    glow(box(0.9, 0.04, 0.2, NEON_M, 0, CY + 1.275, z), 1.3);
    for (const s of [1, -1]) {
      glow(box(0.04, 0.9, 0.2, NEON_M, s * 1.275, CY, z), 1.3);
      box(0.24, 0.24, 0.3, DARK, s * 0.9, CY + 0.9, z);
      box(0.24, 0.24, 0.3, DARK, s * 0.9, CY - 0.9, z);
    }
  }
  // hatch
  plane(0.9, 1.7, hazard, [0, CY + 1.206, -1.3], [0, 1, 0], [0, 0, 1]);
  for (const s of [1, -1]) box(0.06, 0.08, 1.8, DARK, s * 0.5, CY + 1.205, -1.3);
  box(1.0, 0.08, 0.06, DARK, 0, CY + 1.205, -0.4);
  box(1.0, 0.08, 0.06, DARK, 0, CY + 1.205, -2.2);

  // ------------------------------------------------ rear
  box(2.4, 0.35, 0.3, IRON, 0, 0.95, -4.65);
  glow(plane(2.0, 0.28, tail, [0, 0.95, -4.805], [0, 0, -1]), 1.4);
  for (const s of [1, -1]) {
    box(0.5, 0.4, 0.3, DARK, s * 0.9, 0.55, -4.6);
    box(0.4, 0.5, 0.06, STEEL, s * 1.5, 0.9, -4.6);
    glow(box(0.1, 0.1, 0.04, RED, s * 1.0, 1.35, -4.52), 1.6);
  }

  return b.root;
}
```