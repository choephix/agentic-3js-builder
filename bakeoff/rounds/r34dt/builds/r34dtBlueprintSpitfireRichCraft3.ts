import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, svg, rng } from "../../../../src/index";

export const meta = {
  name: "Spitfire Blueprint",
  description: "Supermarine Spitfire fighter rendered as a cyanotype blueprint, with white panel lines and drawn roundels.",
};

const DEEP = "#0b2a66";
const BLUE = "#1d4fa3";
const MID = "#3f82d6";
const PALE = "#cfe6ff";
const WHITE = "#f4f9ff";

const fract = (x: number) => x - Math.floor(x);

// Blueprint paint: deep blue lit from above, white drafted panel lines and rivet dashes, paper-grain mottle.
function blueprint(base: string, lit: string, size: number, aspect = 0.8) {
  return paint((p, n) => {
    const t = smoothstep(-0.8, 0.9, n.y);
    let c = mix(base, lit, t * 0.8 + noise(p, 0.5, 3) * 0.2);
    const top = Math.abs(n.y) > 0.6;
    const u = top ? p.x : p.z;
    const v = top ? p.z : p.y;
    const du = fract(u / size) * size;
    const dv = fract(v / (size * aspect)) * size * aspect;
    if (du < 0.012 || dv < 0.012) return mix(c, WHITE, 0.85);
    if (du < 0.03 && Math.abs(fract(dv / 0.07) - 0.5) < 0.1 && dv > 0.03) return mix(c, PALE, 0.6);
    return c;
  });
}

const FUSE = blueprint(BLUE, MID, 0.7);
const WING = blueprint(BLUE, MID, 0.45, 1.3);
const DARK = blueprint(DEEP, BLUE, 0.5);

const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#0b2a66" stroke="#f4f9ff" stroke-width="4"/>
  <circle cx="50" cy="50" r="32" fill="#cfe6ff" stroke="#f4f9ff" stroke-width="3"/>
  <circle cx="50" cy="50" r="18" fill="#1d4fa3" stroke="#f4f9ff" stroke-width="3"/>
  <circle cx="50" cy="50" r="6" fill="#f4f9ff"/>
  <path d="M4 50H96M50 4V96" stroke="#f4f9ff" stroke-width="2" stroke-dasharray="6 4"/></svg>`,
  { size: 256 },
);
const SERIAL = svg(
  `<svg viewBox="0 0 200 80"><rect x="3" y="3" width="194" height="74" fill="none" stroke="#f4f9ff" stroke-width="4"/>
  <text x="100" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#f4f9ff">K9795</text>
  <text x="100" y="64" text-anchor="middle" font-family="monospace" font-size="15" fill="#cfe6ff">SPITFIRE Mk.I</text></svg>`,
  { size: 256 },
);
const CANOPY_TEX = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#9fd0ff"/>
  <path d="M0 0L64 64M0 20L44 64M20 0L64 44" stroke="#f4f9ff" stroke-width="3"/></svg>`,
  { size: 128 },
);
const GRID = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#0b2a66"/><path d="M0 0H64M0 0V64" stroke="#f4f9ff" stroke-width="3"/></svg>`,
  { size: 64 },
);

export default function build() {
  const b = createBuilder({ name: "spitfire" });
  const R = rng(5);

  // Fuselage
  const fuse = b.loft(
    [
      { at: [0, 1.65, 3.0], w: 0.55, h: 0.7 },
      { at: [0, 1.65, 2.2], w: 0.8, h: 0.95 },
      { at: [0, 1.6, 1.0], w: 0.85, h: 1.05 },
      { at: [0, 1.6, -0.5], w: 0.75, h: 1.0 },
      { at: [0, 1.7, -2.0], w: 0.5, h: 0.7 },
      { at: [0, 1.85, -3.5], w: 0.25, h: 0.4 },
      { at: [0, 1.95, -4.5], w: 0.12, h: 0.25 },
    ],
    { color: FUSE, sides: 10 },
  );

  // Nose, spinner, propeller
  b.lathe(
    [[0, 0], [0.3, 0], [0.3, 0.3], [0.17, 0.7], [0, 0.95]],
    { at: [0, 1.65, 3.0], axis: [0, 0, 1], segments: 12, color: "#e8f3ff" },
  );
  b.part(new THREE.CylinderGeometry(0.34, 0.4, 0.35, 12), DARK, { at: [0, 1.65, 2.9], dir: [0, 0, 1] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    b.extrude(
      [[0.2, -0.08], [1.5, -0.05], [1.62, 0], [1.5, 0.05], [0.2, 0.08]],
      { at: [0, 1.65, 3.55], x: [Math.cos(a), Math.sin(a), 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.01, color: PALE },
    );
  }
  // Exhaust stacks
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      b.part(new THREE.CylinderGeometry(0.035, 0.05, 0.16, 6), WHITE, {
        at: [s * 0.4, 1.85, 2.5 - i * 0.2],
        dir: [s, 0.3, 0],
      });

  // Under-chin radiator and canopy
  b.part(new THREE.BoxGeometry(0.5, 0.35, 0.8), DARK, { at: [0, 1.0, 1.0] });
  const canopy = b.part(new THREE.SphereGeometry(1, 10, 8), "#9fd0ff", {
    at: [0, 2.15, -0.2],
    scale: [0.32, 0.3, 1.0],
    texture: CANOPY_TEX,
  });
  void canopy;
  for (const z of [-0.9, -0.2, 0.5])
    b.part(new THREE.BoxGeometry(0.62, 0.04, 0.05), WHITE, { at: [0, 2.28 - Math.abs(z + 0.2) * 0.12, z] });
  b.part(new THREE.BoxGeometry(0.03, 0.04, 1.5), WHITE, { at: [0, 2.45, -0.2] });

  // Wings with guns, ribs, tip lights
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 1.0], [1.5, 0.8], [3.5, 0.2], [5.1, -0.35], [5.6, -0.6], [5.2, -0.95], [3.5, -0.95], [1.5, -1.4], [0, -1.6],
      ],
      { at: [0, 1.3, 0], x: [s, 0.05, 0], y: [0, 0, 1], thickness: [0.2, 0.08], bevel: 0.03, smoothing: 1, color: WING },
    );
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      at: [s * 3.4, 1.45 + 0.03, -0.3], dir: [0, 1, 0], axis: "z", texture: ROUNDEL, up: [0, 0, 1],
    });
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      at: [s * 3.4, 1.3 - 0.09, -0.3], dir: [0, -1, 0], axis: "z", texture: ROUNDEL, up: [0, 0, 1],
    });
    for (const gx of [2.0, 2.5]) b.rod([s * gx, 1.3, 0.55], [s * gx, 1.3, 1.35], 0.025, WHITE);
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 8), MID, { at: [s * 5.5, 1.31, -0.6] });
    // radiator pods
    b.part(new THREE.BoxGeometry(0.5, 0.28, 0.7), DARK, { at: [s * 1.9, 1.05, -0.4] });
    // fuselage roundel + wing root fillet
    b.decal(fuse, ROUNDEL, { at: [s * 0.3, 1.7, -2.0], dir: [s, 0, 0], size: [0.6, 0.6] });
    // landing gear
    b.rod([s * 1.2, 1.25, 0.4], [s * 1.4, 0.4, 0.4], 0.05, WHITE);
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.14, 14), DARK, { at: [s * 1.45, 0.4, 0.4], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 8), PALE, { at: [s * 1.45, 0.4, 0.4], dir: [1, 0, 0] });
    // tailplane
    b.extrude(
      [[0, 0.5], [1.0, 0.25], [1.75, -0.2], [1.5, -0.5], [0, -0.55]],
      { at: [0, 1.88, -3.9], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.015, smoothing: 1, color: WING },
    );
    // fin serial text
    b.part(new THREE.PlaneGeometry(0.55, 0.22), "#ffffff", {
      at: [s * 0.04, 2.4, -3.6], dir: [s, 0, 0], axis: "z", texture: SERIAL,
    });
  }

  // Tail fin
  b.extrude([[0, 0], [1.2, 0], [1.1, 0.6], [0.8, 1.3], [0.45, 1.3], [0, 0.3]], {
    at: [0, 1.9, -3.1], x: [0, 0, -1], y: [0, 1, 0], thickness: [0.1, 0.04], bevel: 0.015, color: DARK,
  });
  // Tail wheel
  b.rod([0, 1.75, -3.6], [0, 0.2, -3.7], 0.04, WHITE);
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 10), DARK, { at: [0, 0.2, -3.7], dir: [1, 0, 0] });

  // Antenna mast with wire
  b.rod([0, 2.35, 0.3], [0, 2.7, 0.3], 0.02, WHITE);
  b.rod([0, 2.7, 0.3], [0, 2.2, -4.3], 0.006, PALE);

  // Drafting dimension marks on the floor beside the plane (blueprint feel), scaled to footprint
  for (let i = 0; i < 6; i++) {
    const z = -4.2 + i * 1.6 + R() * 0.0;
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.5), WHITE, { at: [6.2, 0.01, z] });
  }
  b.part(new THREE.BoxGeometry(0.04, 0.02, 8.6), WHITE, { at: [6.0, 0.01, -0.2], texture: GRID, flat: true });

  return b.root;
}
