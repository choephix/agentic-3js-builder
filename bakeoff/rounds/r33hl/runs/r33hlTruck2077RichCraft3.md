This is a single-module build of a militarized cyberpunk truck. I haven't run it, so the first render may need small fixes.

```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled, INK, TINT } from "agentic-3js-builder/kits/clockwork";
import { paint, stripes, grain, mottle, rgb } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Militarized Truck 2077",
  description: "Armoured six-wheel cyberpunk troop and cargo truck with a roof turret, neon trim and riveted plating.",
};

type V3 = [number, number, number];

// ---- palette ---------------------------------------------------------------
const CYAN = "#23f0ff";
const MAGENTA = "#ff2bd6";
const AMBER = "#ffb000";
const GLASS = "#0a1822";
const CHASSIS = "#1a1d26";
const TIRE = "#101116";
const STEEL = metal("steel", { polish: 0.6 });
const IRON = metal("iron");
const BLUED = metal("blued");
const GILT = metal("gilt");
const HULL = panelled("#3a4150", { size: 0.55, rivets: 0.07 });
const CAB = panelled("#2a3040", { size: 0.32, rivets: 0.05 });
const CARGO = panelled(metal("iron", { verdigris: 0.15 }), { size: 0.6, rivets: 0.08 });
const HAZARD = stripes(AMBER, INK, { size: 0.25, axis: "x", width: 0.45, wobble: 0.1 });
const CHEV = paint((p, n) => {
  const band = Math.abs(((p.y * 3 + p.x * 2) % 0.5) - 0.25) < 0.07;
  return band && n.z > 0.5 ? AMBER : "#15161c";
});
const DIRT = mottle("#3a3a3a", "#4f4a40", { size: 0.4, seed: 4 });
const SCRATCH = grain("#2c3140", "#3b4356", { size: 0.04, axis: "y", seed: 2 });

// ---- decals ----------------------------------------------------------------
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="29" fill="#0c0f16" stroke="#23f0ff" stroke-width="3"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#ff2bd6" stroke-width="1.6" stroke-dasharray="3 3"/>
    <path d="M32 12 L50 46 L14 46 Z" fill="none" stroke="#23f0ff" stroke-width="3" stroke-linejoin="round"/>
    <path d="M32 26 L38 38 L26 38 Z" fill="#ff2bd6"/>
  </svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 96 32">
    <rect x="0" y="0" width="96" height="32" fill="#14151b"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 14 - 6} 32 L${i * 14 + 6} 0 L${i * 14 + 12} 0 L${i * 14} 32 Z" fill="#ffb000"/>`).join("")}
  </svg>`,
  { size: 512 },
);
const UNIT_TAG = svg(
  `<svg viewBox="0 0 128 40">
    <rect x="1" y="1" width="126" height="38" rx="4" fill="#0e1118" stroke="#23f0ff" stroke-width="2"/>
    <text x="64" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#e8fbff">KR-77</text>
  </svg>`,
  { size: 512 },
);

// ---- helpers ---------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "militarized-truck-2077" });
  const rand = rng(2077);

  const box = (size: V3, at: V3, color: any, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...extra });
  const cyl = (r: number, h: number, at: V3, color: any, extra: Record<string, unknown> = {}, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, ...extra });
  const neon = (size: V3, at: V3, color: string, strength = 1.6) =>
    glow(box(size, at, color), strength);
  const decal = (tex: THREE.Texture, at: V3, dir: V3, size: [number, number], color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), color, { at, dir, axis: "z", texture: tex });

  // ---- chassis and running gear -------------------------------------------
  box([2.0, 0.28, 7.0], [0, 0.72, 0.0], CHASSIS, { name: "frame" });
  for (const s of [1, -1]) {
    // Outer rails with a bolted lip.
    box([0.18, 0.34, 7.0], [s * 1.0, 0.7, 0], IRON);
    box([0.1, 0.12, 6.9], [s * 1.12, 0.9, 0], STEEL);
    // Leaf springs and shock stacks per axle.
    for (const z of [2.7, -1.0, -2.6]) {
      box([0.28, 0.12, 1.2], [s * 1.02, 0.48, z], BLUED);
      cyl(0.07, 0.6, [s * 1.1, 1.0, z], STEEL, {}, 8);
    }
  }

  const wheelZ = [2.7, -1.0, -2.6];
  for (const z of wheelZ)
    for (const s of [1, -1]) {
      const x = s * 1.22;
      // Tyre with a stepped tread and a sidewall ring.
      b.part(new THREE.CylinderGeometry(0.66, 0.66, 0.5, 14), TIRE, {
        at: [x, 0.66, z],
        rotation: [0, 0, 90],
      });
      b.part(new THREE.CylinderGeometry(0.6, 0.6, 0.52, 14, 1, true), "#1c2030", {
        at: [x, 0.66, z],
        rotation: [0, 0, 90],
      });
      // Rim, hub and six bolts facing outward.
      b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.54, 12), STEEL, {
        at: [x, 0.66, z],
        rotation: [0, 0, 90],
      });
      b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 8), GILT, {
        at: [x, 0.66, z],
        rotation: [0, 0, 90],
      });
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        cyl(0.04, 0.06, [x + s * 0.28, 0.66 + Math.cos(a) * 0.3, z + Math.sin(a) * 0.3], IRON, {
          rotation: [0, 0, 90],
        }, 6);
      }
      // Mudguard arch, a hazard-stripe lip on the rear axles.
      box([0.56, 0.1, 1.2], [s * 1.25, 1.42, z], CAB);
      box([0.04, 0.16, 1.2], [s * 1.54, 1.36, z], BLUED);
    }
  // Tail-wheel dust guard over the rear pair.
  for (const s of [1, -1]) box([0.06, 0.4, 1.3], [s * 1.52, 1.1, -1.8], CHASSIS);

  // ---- armoured cab ---------------------------------------------------------
  // Side profile drawn in (z, y), extruded across x, so the cab reads as a slab with a raked nose.
  b.extrude(
    [
      [1.2, 0.8],
      [3.25, 0.75],
      [3.62, 1.35],
      [3.62, 2.95, "sharp"],
      [3.0, 3.52, "sharp"],
      [1.6, 3.52],
      [1.2, 2.8],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.1, bevel: 0.05, smoothing: 1, color: CAB },
  );
  // Roof lip and sand shield.
  box([2.3, 0.14, 2.2], [0, 3.58, 2.5], HULL);
  box([2.2, 0.08, 0.5], [0, 3.62, 3.25], AMBER);
  // Raked windscreen with a dark glass and a bar.
  box([1.9, 0.82, 0.07], [0, 2.82, 3.44], GLASS, { rotation: [-24, 0, 0] });
  box([2.0, 0.08, 0.1], [0, 3.22, 3.39], IRON, { rotation: [-24, 0, 0] });
  box([0.06, 0.8, 0.1], [0, 2.8, 3.42], IRON, { rotation: [-24, 0, 0] });
  // Side windows, armoured slit.
  for (const s of [1, -1]) {
    box([0.04, 0.6, 1.6], [s * 1.06, 2.6, 2.3], GLASS);
    box([0.06, 0.08, 1.8], [s * 1.08, 2.94, 2.3], IRON);
    b.part(new THREE.PlaneGeometry(1.35, 0.95), "#ffffff", {
      at: [s * 1.07, 1.95, 2.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
    });
    cyl(0.1, 0.1, [s * 1.06, 1.7, 1.2], GILT, { rotation: [0, 0, 90] }, 8);
  }
  // Door seams and handles.
  for (const s of [1, -1]) {
    box([0.02, 1.7, 0.03], [s * 1.07, 1.6, 2.7], INK);
    box([0.04, 0.08, 0.2], [s * 1.08, 1.9, 2.4], STEEL);
  }
  // Front grille with glowing intakes and a hazard lower lip.
  box([1.8, 0.9, 0.08], [0, 1.6, 3.62], CHASSIS);
  for (let i = 0; i < 5; i++) neon([0.22, 0.08, 0.05], [-0.64 + i * 0.32, 1.55, 3.68], CYAN, 1.5);
  box([1.9, 0.18, 0.1], [0, 0.95, 3.65], HAZARD);
  for (const s of [1, -1]) {
    neon([0.26, 0.16, 0.06], [s * 0.72, 2.1, 3.66], CYAN, 2.2);
    box([0.34, 0.24, 0.1], [s * 0.72, 2.1, 3.64], STEEL);
  }
  // Brush guard and plough blade.
  for (const s of [1, -1]) cyl(0.04, 0.9, [s * 0.9, 1.0, 3.9], IRON, { rotation: [90, 0, 0] }, 6);
  box([2.6, 0.9, 0.12], [0, 0.6, 4.15], HAZARD, { rotation: [-18, 0, 0] });
  box([2.5, 0.12, 0.28], [0, 1.02, 4.02], IRON, { rotation: [-18, 0, 0] });
  // Chevrons on the blade's top edge.
  box([2.4, 0.06, 0.02], [0, 0.98, 4.1], CHEV, { rotation: [-18, 0, 0] });
  // Headlights and grille logo.
  for (const s of [1, -1]) {
    cyl(0.2, 0.18, [s * 0.92, 2.1, 3.55], STEEL, { rotation: [90, 0, 0] }, 10);
    glow(cyl(0.16, 0.06, [s * 0.92, 2.1, 3.66], "#e7ffff", { rotation: [90, 0, 0] }, 10), 3);
  }
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
    at: [0, 2.22, 3.66],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM,
  });

  // Exhaust stacks with glowing tips.
  for (const s of [1, -1]) {
    cyl(0.085, 2.0, [s * 0.92, 2.6, 2.0], STEEL, {}, 10);
    cyl(0.1, 0.12, [s * 0.92, 3.62, 2.0], IRON, {}, 10);
    glow(cyl(0.07, 0.06, [s * 0.92, 3.7, 2.0], "#ff7a2a", {}, 10), 2.4);
  }

  // Mirrors and side ammo rack on the cab.
  for (const s of [1, -1]) {
    box([0.12, 0.45, 0.06], [s * 1.36, 2.6, 3.0], CHASSIS);
    box([0.04, 0.06, 0.6], [s * 1.2, 2.9, 2.7], IRON);
  }

  // ---- cargo body -----------------------------------------------------------
  const cargoY = 2.05;
  box([2.2, 2.5, 4.6], [0, cargoY, -1.1], CARGO);
  // Top edge bevel and roof cage.
  box([2.3, 0.1, 4.7], [0, cargoY + 1.3, -1.1], HULL);
  for (const s of [1, -1]) {
    box([0.06, 0.06, 4.8], [s * 1.12, cargoY + 1.32, -1.1], IRON);
    for (const z of [-3.4, -1.1, 1.2]) cyl(0.04, 0.36, [s * 1.12, cargoY + 1.5, z], IRON, {}, 6);
  }
  // Side ports, vents and hazard sign panels.
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      box([0.03, 0.42, 0.06], [s * 1.115, cargoY + 0.6, -2.6 + i * 0.26], "#0f1117");
    }
    b.part(new THREE.PlaneGeometry(1.1, 0.9), "#ffffff", {
      at: [s * 1.12, cargoY - 0.2, -1.9],
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
    });
    b.part(new THREE.PlaneGeometry(1.6, 0.38), "#ffffff", {
      at: [s * 1.12, cargoY + 0.85, -3.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: UNIT_TAG,
    });
    b.part(new THREE.PlaneGeometry(1.2, 0.2), "#ffffff", {
      at: [s * 1.12, cargoY - 1.05, -0.9],
      dir: [s, 0, 0],
      axis: "z",
      texture: WARN,
    });
    // Neon strip running the full side under the roof.
    neon([0.02, 0.07, 4.2], [s * 1.125, cargoY + 0.98, -1.1], MAGENTA, 1.8);
  }
  // Rear doors: twin panels, handles, a seam, a stop lamp.
  box([0.04, 2.3, 2.2], [0, cargoY - 0.05, -3.7], CARGO);
  box([0.02, 2.2, 0.04], [0, cargoY - 0.05, -3.73], INK);
  for (const s of [1, -1]) {
    box([0.06, 1.2, 0.06], [s * 0.4, cargoY, -3.73], STEEL);
    for (const z of [0.25, -0.25]) cyl(0.05, 0.16, [s * 0.9, cargoY, -3.74 + z * 0.0], GILT, { rotation: [90, 0, 0] }, 6);
    glow(box([0.14, 0.22, 0.05], [s * 0.7, cargoY - 0.85, -3.72], MAGENTA), 2.2);
  }
  // Rear bumper, towing hook, licence plate.
  box([2.2, 0.26, 0.2], [0, 0.8, -4.55], IRON);
  b.part(new THREE.PlaneGeometry(0.7, 0.2), "#ffffff", {
    at: [0, 1.0, -4.67],
    dir: [0, 0, -1],
    axis: "z",
    texture: UNIT_TAG,
  });
  for (const s of [1, -1]) cyl(0.18, 0.06, [s * 0.7, 2.6, -4.61], "#ff2030", { rotation: [90, 0, 0] }, 8);

  // Side skirts with chevron paint.
  for (const s of [1, -1]) box([0.06, 0.3, 6.6], [s * 1.2, 0.74, 0.1], CHEV);

  // ---- roof turret ----------------------------------------------------------
  const turretY = cargoY + 1.4;
  // A lathed dome with a collar and a riveted shell.
  b.lathe(
    [
      [0, 0],
      [0.95, 0],
      [0.98, 0.1],
      [0.82, 0.2],
      [0.72, 0.5],
      [0.5, 0.78],
      [0.22, 0.9],
      [0, 0.92],
    ],
    { at: [0, turretY, -0.9], smoothing: 1, color: panelled(metal("steel"), { size: 0.22, rivets: 0.04 }) },
  );
  // Ring collar, gun shield, cupola.
  b.lathe(
    [
      [0, 0],
      [0.8, 0],
      [0.8, 0.08],
      [0, 0.08],
    ],
    { at: [0, turretY + 0.02, -0.9], color: GILT },
  );
  box([1.0, 0.6, 0.2], [0, turretY + 0.6, 0.0], HULL);
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.3, 0.12],
      [0.12, 0.2],
      [0, 0.22],
    ],
    { at: [0, turretY + 0.92, -0.9], color: TINT.gilt ? GLASS : GLASS },
  );
  glow(cyl(0.05, 0.02, [0, turretY + 0.98, -0.9], CYAN, {}, 8), 3);
  // Barrel pair with a muzzle brake and a rail.
  for (const s of [1, -1]) {
    b.rod([s * 0.2, turretY + 0.65, -0.9], [s * 0.2, turretY + 0.65, 1.5], 0.07, STEEL);
    b.rod([s * 0.2, turretY + 0.65, 1.5], [s * 0.2, turretY + 0.65, 1.6], 0.09, IRON);
    box([0.05, 0.15, 1.7], [s * 0.4, turretY + 0.6, 0.0], IRON);
  }
  // Ammo feed box with a cylinder drum.
  box([0.7, 0.5, 0.6], [-0.9, turretY + 0.4, -0.7], CARGO);
  cyl(0.3, 0.5, [0.9, turretY + 0.4, -0.7], GILT, {}, 12);
  // Targeting sensor array on a mast, glowing lenses.
  b.rod([0, turretY + 0.9, -1.4], [0, turretY + 1.7, -1.5], 0.03, IRON);
  glow(cyl(0.12, 0.08, [0, turretY + 1.75, -1.5], "#e6ffff", { rotation: [90, 0, 0] }, 10), 3);
  glow(cyl(0.05, 0.02, [0, turretY + 1.75, -1.58], MAGENTA, { rotation: [90, 0, 0] }, 8), 2.5);

  // Roof antennas: two whips and a dish, all ending in glowing tips.
  for (const s of [1, -1]) {
    b.rod([s * 0.85, cargoY + 1.4, 1.2], [s * 0.85, cargoY + 3.1, 1.0], 0.02, IRON);
    glow(cyl(0.035, 0.05, [s * 0.85, cargoY + 3.14, 1.0], CYAN, {}, 6), 3);
  }
  b.part(new THREE.CylinderGeometry(0.34, 0.14, 0.12, 14, 1, true), STEEL, {
    at: [0, cargoY + 1.6, 2.6],
    rotation: [20, 0, 0],
  });
  b.rod([0, cargoY + 1.6, 2.6], [0, cargoY + 1.5, 2.6], 0.03, IRON);

  // ---- hardware: tool boxes, fuel canister, spare tyre, lashing ----------
  box([1.4, 0.4, 0.55], [-0.4, 0.9, -4.0], HULL);
  for (const s of [1, -1]) box([0.05, 0.28, 0.3], [s * 0.6, 0.9, -4.02], STEEL);
  for (let i = 0; i < 3; i++) cyl(0.12, 0.38, [-1.1 + i * 0.22, 1.55, 3.0], "#b3372a", {}, 8);
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12), TIRE, {
    at: [0, 2.3, -4.0],
    rotation: [0, 0, 90],
  });
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.32, 12), STEEL, {
    at: [0, 2.3, -4.0],
    rotation: [0, 0, 90],
  });

  // Dust and grime on the lower hull and wheel arches, and scratches on the cab.
  for (const s of [1, -1]) {
    box([0.02, 0.5, 6.0], [s * 1.11, 0.9, 0], DIRT);
    box([0.02, 0.3, 2.0], [s * 1.07, 1.8, 2.3], SCRATCH);
  }

  return b.root;
}
```