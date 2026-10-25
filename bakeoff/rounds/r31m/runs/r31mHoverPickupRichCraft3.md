```ts
import * as THREE from "three";
import { createBuilder, paint, noise, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup with its wheels replaced by four ducted hover thrusters, a bed-mounted twin gun, neon underglow and cyberpunk markings.",
};

const CYAN = "#2ff3ff";
const MAGENTA = "#ff2fa8";
const AMBER = "#ffa11f";
const RED = "#ff2a35";
const DARK = "#14171d";
const STEEL = "#3a404c";
const GLASS = "#0b2a3a";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const rand = rng(11);

  // ---------- paints & textures ----------
  const camo = (() => {
    const A = "#3d4a3a", B = "#2c352e", C = "#4d4b3a", D = "#23292b";
    return paint((p) => {
      const n = noise(p, 0.55, 3);
      return n < 0.3 ? D : n < 0.5 ? B : n < 0.72 ? A : C;
    });
  })();
  const BODY = paint((p, n) => {
    if (p.y < 0.78 && n.y < 0.5) return "#1d2024";
    if (n.y > 0.6) return "#56654f";
    return camo;
  });
  const PLATE = paint((p) => (noise(p, 0.2, 8) > 0.55 ? "#2d323c" : "#383e4b"));

  const GRILLE = svg(
    `<svg viewBox="0 0 100 20"><rect width="100" height="20" fill="#0b0d12"/>
     ${Array.from({ length: 10 }, (_, i) => `<rect x="${4 + i * 9.4}" y="3" width="5" height="14" fill="#1b2a3a"/><rect x="${4 + i * 9.4}" y="3" width="5" height="3" fill="#2ff3ff"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="none"/>
     <polygon points="8,40 30,8 48,8 26,40" fill="#ff2fa8"/><polygon points="34,40 56,8 66,8 44,40" fill="#2ff3ff"/>
     <circle cx="80" cy="25" r="16" fill="#0b0d12" stroke="#ff2fa8" stroke-width="4"/>
     <path d="M80 12 L86 25 L80 38 L74 25Z" fill="#2ff3ff"/></svg>`,
    { size: 256 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 100 20"><rect width="100" height="20" fill="#e7b814"/>
     ${Array.from({ length: 9 }, (_, i) => `<polygon points="${i * 14 - 10},20 ${i * 14},20 ${i * 14 + 14},0 ${i * 14 + 4},0" fill="#101216"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const CRATE = svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#4a5440"/><rect x="2" y="2" width="36" height="36" fill="none" stroke="#1d241a" stroke-width="3"/>
     <rect x="8" y="16" width="24" height="8" fill="#e7b814"/><path d="M0 0L40 40M40 0L0 40" stroke="#1d241a" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...opts });
  const decal = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });

  // ---------- chassis ----------
  box(1.7, 0.18, 4.9, DARK, [0, 0.55, 0]);
  box(1.9, 0.4, 2.0, BODY, [0, 0.8, -1.6]); // under bed
  // cab + hood from side profile
  b.extrude(
    [
      [-0.6, 0.6], [2.6, 0.6], [2.6, 1.05], [2.1, 1.2], [1.1, 1.25],
      [0.75, 1.85], [-0.3, 1.9], [-0.6, 1.4],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, color: BODY },
  );
  // bed
  for (const s of [1, -1]) {
    box(0.1, 0.45, 2.0, BODY, [s * 0.9, 1.22, -1.6]);
    box(0.14, 0.06, 2.04, PLATE, [s * 0.9, 1.47, -1.6]);
    decal(1.8, 0.3, HAZARD, [s * 0.953, 1.2, -1.6], [s, 0, 0]);
  }
  box(1.9, 0.45, 0.1, BODY, [0, 1.22, -2.6]);
  box(1.9, 0.06, 0.14, PLATE, [0, 1.47, -2.6]);
  box(1.7, 0.05, 2.0, STEEL, [0, 1.02, -1.6]);

  // windshield, side windows, rear window
  glow(
    b.part(new THREE.BoxGeometry(1.7, 0.02, 0.7), GLASS, { at: [0, 1.557, 0.938], rotation: [59.7, 0, 0] }),
    0.5,
  );
  for (const s of [1, -1]) {
    b.extrude([[-0.2, 1.4], [0.6, 1.4], [0.9, 1.4], [0.7, 1.78], [-0.2, 1.8]].slice(0, 2).concat([[0.62, 1.4], [0.55, 1.77], [-0.2, 1.8]] as any), {
      at: [s * 0.962, 0, 0], x: [0, 0, 1], thickness: 0.02, color: GLASS,
    });
    // door panel line, handle, emblem
    box(0.02, 0.04, 0.18, CYAN, [s * 0.965, 1.28, 0.5], {}).mesh && glow(b.part(new THREE.BoxGeometry(0.02, 0.03, 0.2), CYAN, { at: [s * 0.966, 1.3, 0.45] }));
    decal(0.8, 0.4, EMBLEM, [s * 0.962, 0.98, 0.15], [s, 0, 0]);
    // side skirt armor
    box(0.12, 0.2, 3.4, PLATE, [s * 0.94, 0.7, 0.4]);
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 3.2), s > 0 ? CYAN : MAGENTA, { at: [s * 1.01, 0.62, 0.4] }), 1.4);
    // door armor plate
    b.extrude([[-0.4, 0], [0.4, 0], [0.5, 0.2], [0.3, 0.45], [-0.3, 0.45], [-0.5, 0.2]], {
      at: [s * 0.96, 0.82, -0.25], x: [0, 0, 1], thickness: 0.04, color: PLATE,
    });
  }
  glow(box(1.5, 0.02, 0.3, GLASS, [0, 1.65, -0.58], { rotation: [90, 0, 0] }).mesh ? b.part(new THREE.BoxGeometry(1.5, 0.45, 0.02), GLASS, { at: [0, 1.62, -0.605] }) : null as any, 0.4);

  // roof gear
  box(1.5, 0.05, 0.9, PLATE, [0, 1.93, -0.05]);
  glow(box(1.4, 0.05, 0.08, CYAN, [0, 1.99, 0.28]), 1.8);
  glow(box(1.4, 0.05, 0.08, MAGENTA, [0, 1.99, -0.38]), 1.8);
  b.rod([0.75, 1.95, -0.45], [0.75, 2.75, -0.5], 0.012, DARK);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [0.75, 2.77, -0.5] }), 2);
  b.lathe([[0, 0], [0.22, 0.06], [0.24, 0.1], [0.0, 0.04]], { at: [-0.5, 1.98, -0.1], color: STEEL, segments: 10 });
  b.rod([-0.5, 1.98, -0.1], [-0.5, 2.12, -0.05], 0.012, DARK);

  // hood details
  box(0.7, 0.06, 0.8, PLATE, [0, 1.22, 1.8]); // scoop base
  box(0.6, 0.12, 0.5, DARK, [0, 1.3, 1.75]);
  for (let i = 0; i < 4; i++) glow(box(0.5, 0.02, 0.04, AMBER, [0, 1.37, 1.55 + i * 0.12]), 1.2);
  for (const s of [1, -1]) {
    box(0.04, 0.04, 1.3, STEEL, [s * 0.5, 1.24, 1.7]);
    // headlights
    glow(box(0.3, 0.1, 0.05, MAGENTA, [s * 0.78, 1.0, 2.62]), 2);
    glow(box(0.14, 0.05, 0.05, CYAN, [s * 0.78, 0.9, 2.63]), 2);
  }
  decal(1.0, 0.15, GRILLE, [0, 0.975, 2.607], [0, 0, 1]);

  // ram bumper
  box(2.0, 0.3, 0.3, PLATE, [0, 0.75, 2.72]);
  box(2.1, 0.06, 0.35, DARK, [0, 0.58, 2.7]);
  for (let i = -3; i <= 3; i++)
    b.part(new THREE.ConeGeometry(0.05, 0.22, 5), STEEL, { at: [i * 0.3, 0.75, 2.97], rotation: [90, 0, 0] });
  glow(box(1.8, 0.03, 0.03, CYAN, [0, 0.92, 2.88]), 1.5);

  // rear lights & thrusters
  for (const s of [1, -1]) {
    glow(box(0.3, 0.12, 0.04, RED, [s * 0.7, 1.35, -2.67]), 2);
    cyl(0.14, 0.17, 0.35, 8, STEEL, [s * 0.55, 0.78, -2.8], { rotation: [90, 0, 0] });
    glow(b.part(new THREE.CircleGeometry(0.12, 8), AMBER, { at: [s * 0.55, 0.78, -2.99], dir: [0, 0, -1], axis: "z" }), 2.2);
  }
  glow(box(1.0, 0.03, 0.03, AMBER, [0, 1.12, -2.68]), 1.2);

  // roll hoop
  for (const s of [1, -1]) {
    b.rod([s * 0.85, 1.45, -1.0], [s * 0.85, 2.0, -1.0], 0.04, STEEL);
    b.rod([s * 0.85, 2.0, -1.0], [s * 0.85, 1.5, -2.0], 0.03, STEEL);
  }
  b.rod([-0.85, 2.0, -1.0], [0.85, 2.0, -1.0], 0.04, STEEL);
  glow(box(1.6, 0.03, 0.03, CYAN, [0, 1.92, -1.0]), 1.2);

  // gun turret
  cyl(0.1, 0.14, 0.45, 8, STEEL, [0, 1.25, -1.5]);
  box(0.34, 0.24, 0.55, PLATE, [0, 1.6, -1.5]);
  box(0.5, 0.36, 0.04, STEEL, [0, 1.66, -1.14]);
  for (const s of [1, -1]) {
    cyl(0.035, 0.035, 1.0, 6, DARK, [s * 0.1, 1.62, -0.85], { rotation: [90, 0, 0] });
    cyl(0.05, 0.05, 0.12, 6, STEEL, [s * 0.1, 1.62, -0.34], { rotation: [90, 0, 0] });
  }
  glow(box(0.06, 0.06, 0.04, RED, [0, 1.72, -1.2]), 2);
  // ammo crates
  box(0.55, 0.4, 0.4, "#ffffff", [-0.5, 1.25, -2.2], { texture: CRATE });
  box(0.5, 0.35, 0.4, "#ffffff", [0.45, 1.22, -2.25], { texture: CRATE, rotation: [0, 15, 0] });
  box(0.3, 0.3, 0.3, "#ffffff", [-0.5, 1.6, -2.2], { texture: CRATE, rotation: [0, -20, 0] });

  // ---------- hover pods ----------
  const spots: number[][] = [[1.28, 1.7], [-1.28, 1.7], [1.28, -1.7], [-1.28, -1.7]];
  for (const [x, z] of spots) {
    const s = Math.sign(x);
    b.lathe(
      [[0.34, 0.02], [0.4, 0], [0.45, 0.1], [0.45, 0.4], [0.4, 0.44], [0.34, 0.4]],
      { at: [x, 0, z], color: PLATE, segments: 10 },
    );
    glow(b.part(new THREE.TorusGeometry(0.455, 0.018, 4, 12), s > 0 ? CYAN : MAGENTA, { at: [x, 0.25, z], rotation: [90, 0, 0] }), 1.6);
    glow(b.part(new THREE.CircleGeometry(0.34, 10), CYAN, { at: [x, 0.08, z], dir: [0, -1, 0], axis: "z" }), 1.8);
    cyl(0.08, 0.08, 0.2, 6, STEEL, [x, 0.2, z]);
    for (let i = 0; i < 3; i++) box(0.64, 0.02, 0.07, DARK, [x, 0.3, z], { rotation: [0, i * 60 + rand() * 10, 0] });
    // struts to the chassis
    box(Math.abs(x) - 0.8, 0.12, 0.3, PLATE, [s * (0.8 + (Math.abs(x) - 0.8) / 2 + 0.05), 0.62, z]);
    b.rod([x, 0.42, z], [s * 1.0, 0.62, z + (z > 0 ? -0.2 : 0.2)], 0.035, STEEL);
    // intake grille on top & light
    cyl(0.1, 0.1, 0.08, 6, DARK, [x, 0.46, z]);
    glow(b.part(new THREE.SphereGeometry(0.035, 5, 4), AMBER, { at: [x + s * 0.2, 0.52, z] }), 2);
  }
  // under-body diffuser glow
  glow(box(1.2, 0.02, 3.8, CYAN, [0, 0.455, 0]), 0.8);

  return b.root;
}
```