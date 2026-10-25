```ts
import * as THREE from "three";
import { createBuilder, svg, paint, mottle, patches, countershade, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup converted to hover thrusters: camo armour plating, four ducted fan pods, neon trim, roof gun, bed rocket pod, low-poly cyberpunk.",
};

// ---------- palette ----------
const CYAN = "#22f0ff";
const MAGENTA = "#ff2bd6";
const ORANGE = "#ff8a1c";
const RED = "#ff2a3c";
const GLASS = "#12394d";
const DARK = "#12151b";
const BODY = countershade(
  patches("#262e3a", ["#2f3a46", "#222a33", "#34403f", "#2a2f4a"], { size: 0.42, gap: 0.04, seed: 3 }),
  "#141920",
  { level: -0.4 },
);
const PLATE = paint((p, n, _s) => {
  const base = mottle("#3a424e", "#2c333d", { size: 0.2, seed: 5 }).at(p, n);
  const seam = Math.abs(((p.z * 3.2) % 1) - 0.5) > 0.47 || Math.abs(((p.y * 4) % 1) - 0.5) > 0.48;
  const k = seam ? 0.55 : 1;
  return [base[0] * k, base[1] * k, base[2] * k];
});
const IRON = mottle("#14171c", "#252a33", { size: 0.15, seed: 8 });

// ---------- textures ----------
const FAN = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0a0d12" stroke="#22f0ff" stroke-width="4"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315]
    .map(
      (a) =>
        `<path transform="rotate(${a} 50 50)" d="M50 50 L40 10 Q54 6 62 16 Z" fill="#2c3644" stroke="#5de8ff" stroke-width="1.5"/>`,
    )
    .join("")}
  <circle cx="50" cy="50" r="10" fill="#1b222c" stroke="#ff2bd6" stroke-width="3"/><circle cx="50" cy="50" r="3" fill="#22f0ff"/></svg>`,
  { size: 128 },
);
const DOOR = svg(
  `<svg viewBox="0 0 120 70"><circle cx="24" cy="30" r="17" fill="none" stroke="#c9d6a0" stroke-width="3"/>
  <path d="M24 16 L28 27 L40 27 L30 34 L34 46 L24 38 L14 46 L18 34 L8 27 L20 27Z" fill="#c9d6a0"/>
  <text x="50" y="36" font-family="monospace" font-weight="bold" font-size="22" fill="#c9d6a0">HV-07</text>
  <text x="50" y="52" font-family="monospace" font-size="10" fill="#ff2bd6">ARMORED // HOVER</text>
  <path d="M2 64 H118" stroke="#22f0ff" stroke-width="3"/><path d="M80 4 l10 0 l-6 10 l-10 0z M94 4 l10 0 l-6 10 l-10 0z" fill="#ffd21f"/></svg>`,
  { size: 256 },
);
const GRILL = svg(
  `<svg viewBox="0 0 130 30"><rect width="130" height="30" rx="3" fill="#0b0d11" stroke="#3b4452" stroke-width="2"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8]
    .map((i) => `<rect x="${8 + i * 13}" y="5" width="7" height="20" fill="${i % 2 ? "#ff2bd6" : "#22f0ff"}"/>`)
    .join("")}</svg>`,
  { size: 192 },
);
const HEAD = svg(
  `<svg viewBox="0 0 100 24"><defs><linearGradient id="g"><stop offset="0" stop-color="#9ffaff"/><stop offset="1" stop-color="#22f0ff"/></linearGradient></defs>
  <path d="M4 20 L14 4 L96 4 L96 20Z" fill="url(#g)" stroke="#06242b" stroke-width="3"/><path d="M20 12 H90" stroke="#fff" stroke-width="3"/></svg>`,
  { size: 128 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#ffd21f"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 20 - 10} 32 l10 -32 l10 0 l-10 32z" fill="#15171b"/>`).join("")}</svg>`,
  { size: 128 },
);
const TAIL = svg(
  `<svg viewBox="0 0 100 16"><rect width="100" height="16" rx="3" fill="#7a0612"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${4 + i * 12}" y="3" width="9" height="10" fill="#ff2a3c"/>`).join("")}</svg>`,
  { size: 128 },
);
const PODTOP = svg(
  `<svg viewBox="0 0 100 70"><rect width="100" height="70" rx="6" fill="#1a1f27" stroke="#4b5666" stroke-width="3"/>
  ${[0, 1, 2]
    .flatMap((i) =>
      [0, 1].map(
        (j) =>
          `<circle cx="${20 + i * 30}" cy="${20 + j * 30}" r="11" fill="#07090c" stroke="#ffd21f" stroke-width="2"/><circle cx="${20 + i * 30}" cy="${20 + j * 30}" r="6" fill="#ff8a1c"/>`,
      ),
    )
    .join("")}</svg>`,
  { size: 192 },
);
const NEON = svg(
  `<svg viewBox="0 0 160 40"><rect width="160" height="40" rx="5" fill="#0a0c12" stroke="#ff2bd6" stroke-width="3"/>
  <text x="80" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#22f0ff" stroke="#9ffaff" stroke-width="0.6">HOVER·CORPS</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const R = rng(11);

  const box = (size: [number, number, number], color: any, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: rot });
  const decal = (
    w: number,
    h: number,
    tex: THREE.Texture,
    at: [number, number, number],
    dir: [number, number, number],
    up?: [number, number, number],
  ) => b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, up });

  // ---------- main body: side profile extruded ----------
  const profile: [number, number, "sharp"][] = [
    [-2.4, 0.5, "sharp"],
    [2.4, 0.5, "sharp"],
    [2.5, 0.9, "sharp"],
    [2.4, 1.2, "sharp"],
    [1.35, 1.25, "sharp"],
    [0.75, 1.85, "sharp"],
    [-0.25, 1.85, "sharp"],
    [-0.4, 1.25, "sharp"],
    [-0.4, 1.05, "sharp"],
    [-2.4, 1.05, "sharp"],
  ];
  b.extrude(profile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.7, color: BODY });

  // roof & hood armour plates
  box([1.5, 0.06, 1.05], PLATE, [0, 1.88, 0.25]);
  box([1.3, 0.05, 0.95], PLATE, [0, 1.25, 1.88]);
  box([0.18, 0.07, 1.0], IRON, [0, 1.28, 1.88]);
  for (const s of [1, -1]) {
    box([0.5, 0.03, 0.35], DARK, [s * 0.42, 1.255, 1.55]);
    for (let i = 0; i < 4; i++) glow(box([0.44, 0.012, 0.025], MAGENTA, [s * 0.42, 1.275, 1.43 + i * 0.09]), 1.2);
  }

  // glass
  glow(
    b.part(new THREE.BoxGeometry(1.5, 0.03, 0.85), GLASS, { at: [0, 1.57, 1.07], dir: [0, 0.707, 0.707] }),
    0.35,
  );
  glow(box([1.3, 0.42, 0.04], GLASS, [0, 1.55, -0.33], [-10, 0, 0]), 0.3);
  for (const s of [1, -1]) {
    const w = b.extrude(
      [
        [1.25, 1.33],
        [0.85, 1.75],
        [-0.15, 1.75],
        [-0.28, 1.33],
      ],
      { at: [s * 0.86, 0, 0], x: [0, 0, 1], thickness: 0.04, color: GLASS },
    );
    glow(w, 0.3);
    // door stencil
    decal(1.1, 0.64, DOOR, [s * 0.858, 0.86, 0.55], [s, 0, 0]);
    // handle & mirror
    box([0.02, 0.05, 0.22], DARK, [s * 0.87, 1.12, 0.1]);
    box([0.1, 0.03, 0.04], IRON, [s * 0.9, 1.4, 0.95]);
    box([0.06, 0.16, 0.2], PLATE, [s * 0.98, 1.45, 0.95]);
    glow(box([0.01, 0.1, 0.14], CYAN, [s * 0.985 + s * 0.035, 1.45, 0.95]), 1);
  }

  // ---------- neon trim ----------
  for (const s of [1, -1]) {
    glow(b.rod([s * 0.865, 0.57, -2.3], [s * 0.865, 0.57, 2.3], 0.025, MAGENTA, { sides: 4 }), 1.4);
    glow(b.rod([s * 0.865, 0.62, -2.3], [s * 0.865, 0.62, 2.3], 0.01, CYAN, { sides: 4 }), 1.2);
  }
  // underglow
  glow(b.part(new THREE.PlaneGeometry(1.5, 4.0), MAGENTA, { at: [0, 0.495, 0], dir: [0, -1, 0], axis: "z", up: [0, 0, 1] }), 1.1);

  // ---------- front end ----------
  box([1.95, 0.26, 0.22], IRON, [0, 0.66, 2.5]);
  decal(1.9, 0.2, HAZARD, [0, 0.66, 2.613], [0, 0, 1]);
  decal(1.3, 0.26, GRILL, [0, 1.02, 2.487], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(decal(0.5, 0.12, HEAD, [s * 0.68, 1.04, 2.487], [0, 0, 1]), 1.5);
    box([0.14, 0.34, 0.3], PLATE, [s * 0.92, 0.72, 2.45]);
    // tail
    glow(decal(0.7, 0.11, TAIL, [s * 0.6, 0.82, -2.403], [0, 0, -1]), 1.3);
  }
  // front tow hooks
  for (const s of [1, -1]) b.rod([s * 0.5, 0.58, 2.6], [s * 0.5, 0.58, 2.78], 0.03, ORANGE, { sides: 6 });

  // ---------- bed ----------
  for (const s of [1, -1]) {
    box([0.12, 0.42, 1.98], PLATE, [s * 0.79, 1.26, -1.42]);
    glow(box([0.05, 0.03, 1.98], CYAN, [s * 0.79, 1.49, -1.42]), 1.2);
    glow(decal(1.0, 0.25, NEON, [s * 0.852, 1.26, -1.42], [s, 0, 0]), 1.1);
  }
  box([1.7, 0.42, 0.12], PLATE, [0, 1.26, -2.34]);
  glow(box([1.7, 0.03, 0.05], MAGENTA, [0, 1.49, -2.34]), 1.2);
  // bed ribs
  for (let i = 0; i < 4; i++) box([1.5, 0.05, 0.05], IRON, [0, 1.22, -0.7 - i * 0.55]);
  // rocket pod
  box([1.0, 0.4, 0.8], IRON, [0, 1.27, -1.45]);
  decal(0.95, 0.66, PODTOP, [0, 1.475, -1.45], [0, 1, 0], [0, 0, 1]);
  for (const s of [1, -1]) box([0.06, 0.45, 0.08], PLATE, [s * 0.52, 1.3, -1.45]);
  // crate
  box([0.5, 0.3, 0.4], PLATE, [0.35, 1.2, -0.75]);
  glow(box([0.5, 0.02, 0.06], ORANGE, [0.35, 1.355, -0.75]), 1);

  // ---------- roof: light bar, gun, antenna ----------
  box([0.12, 0.08, 0.1], IRON, [-0.5, 1.94, -0.12]);
  box([0.12, 0.08, 0.1], IRON, [0.5, 1.94, -0.12]);
  glow(box([0.55, 0.12, 0.14], MAGENTA, [-0.28, 2.02, -0.12]), 1.6);
  glow(box([0.55, 0.12, 0.14], CYAN, [0.28, 2.02, -0.12]), 1.6);
  b.lathe(
    [
      [0, 0],
      [0.24, 0],
      [0.2, 0.08],
      [0.12, 0.12],
      [0, 0.12],
    ],
    { at: [0, 1.91, 0.4], segments: 8, color: IRON },
  );
  box([0.3, 0.22, 0.42], PLATE, [0, 2.12, 0.42]);
  box([0.34, 0.1, 0.2], IRON, [0, 2.12, 0.58]);
  for (const s of [1, -1]) {
    b.rod([s * 0.08, 2.12, 0.6], [s * 0.08, 2.12, 1.35], 0.03, IRON, { sides: 6 });
    glow(b.rod([s * 0.08, 2.12, 1.35], [s * 0.08, 2.12, 1.38], 0.022, ORANGE, { sides: 6 }), 1.5);
  }
  glow(box([0.22, 0.04, 0.02], CYAN, [0, 2.2, 0.64]), 1.4);
  // dish
  b.lathe(
    [
      [0, 0],
      [0.16, 0.06],
      [0.14, 0.07],
      [0, 0.02],
    ],
    { at: [-0.55, 1.95, 0.4], segments: 8, color: "#8b95a5" },
  );
  b.rod([-0.55, 1.9, 0.4], [-0.55, 1.97, 0.4], 0.02, IRON, { sides: 5 });
  // antenna
  b.rod([0.72, 1.88, -0.1], [0.72, 2.6, -0.1], [0.02, 0.008], "#aab4c4", { sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [0.72, 2.62, -0.1] }), 2);

  // ---------- rear main nozzle ----------
  b.lathe(
    [
      [0, 0],
      [0.26, 0],
      [0.24, 0.2],
      [0.31, 0.38],
      [0, 0.38],
    ],
    { at: [0, 0.78, -2.4], axis: [0, 0, -1], segments: 10, color: IRON },
  );
  glow(b.part(new THREE.CircleGeometry(0.23, 10), CYAN, { at: [0, 0.78, -2.785], dir: [0, 0, -1], axis: "z" }), 1.8);

  // ---------- hover thruster pods ----------
  const podProfile: [number, number][] = [
    [0, 0.04],
    [0.4, 0.04],
    [0.46, 0.3],
    [0.44, 0.6],
    [0.38, 0.68],
    [0, 0.68],
  ];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.14;
      const z = sz * 1.5;
      b.lathe(podProfile, { at: [x, 0, z], segments: 10, color: PLATE });
      decal(0.7, 0.7, FAN, [x, 0.69, z], [0, 1, 0], [0, 0, 1]);
      glow(
        b.part(new THREE.TorusGeometry(0.47, 0.03, 4, 12), sz > 0 ? CYAN : MAGENTA, {
          at: [x, 0.3, z],
          rotation: [90, 0, 0],
        }),
        1.6,
      );
      glow(b.part(new THREE.CircleGeometry(0.36, 10), CYAN, { at: [x, 0.012, z], dir: [0, -1, 0], axis: "z", up: [0, 0, 1] }), 1.8);
      // mounting strut and fins
      box([0.5, 0.14, 0.5], IRON, [sx * 0.9, 0.55, z]);
      box([0.06, 0.34, 0.3], PLATE, [x + sx * 0.4, 0.5, z - sz * 0.35], [0, 0, sx * 12]);
      // intake bolts
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 5), "#b9c3d1", {
          at: [x + Math.cos(a) * 0.41, 0.665, z + Math.sin(a) * 0.41],
        });
      }
    }

  // ---------- exhaust stacks behind cab ----------
  for (const s of [1, -1]) {
    b.rod([s * 0.6, 1.1, -0.5], [s * 0.6, 1.95, -0.5], 0.05, IRON, { sides: 6 });
    glow(b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 6), ORANGE, { at: [s * 0.6, 1.96, -0.5] }), 1.5);
  }

  // armour studs on hood/roof edges (merged by colour via many small parts, kept few)
  for (let i = 0; i < 10; i++) {
    const x = (R() - 0.5) * 1.1;
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.015, 5), "#9aa6b8", { at: [x, 1.915, 0.1 + R() * 0.5] });
  }

  return b.root;
}
```