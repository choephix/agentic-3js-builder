```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabRoof",
    what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, and brackets.",
    at: [0, 1.62, 0.15],
    normal: [0, 1, 0],
    bone: null,
    room: [1.5, 0.2, 0.3],
  },
  {
    id: "grille",
    kind: "add",
    part: "hood",
    what: "Front grille: dark mesh slats with a thin CYAN glowing strip, a small emblem in the centre.",
    at: [0, 0.72, 2.46],
    normal: [0, 0, 1],
    bone: null,
    room: [1.2, 0.35, 0.15],
  },
  {
    id: "bedTurret",
    kind: "add",
    part: "bed",
    what: "Pintle-mounted twin autocannon in the bed: ring mount, pivot, two barrels with muzzle brakes, ammo box with belt, glowing MAGENTA sight.",
    at: [0, 1.15, -1.2],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 0.7, 1.2],
  },
  {
    id: "thrusterFins",
    kind: "add",
    part: "thrusterFL",
    what: "Fins, intake grilles and a ring of glowing CYAN plasma emitters on the underside of each of the four thruster pods (one request, repeat on all four).",
    at: [0.95, 0.3, 1.4],
    normal: [0, -1, 0],
    bone: null,
    room: [0.8, 0.3, 0.8],
  },
  {
    id: "headlights",
    kind: "add",
    part: "hood",
    what: "Pair of angular headlights with glowing WHITE lenses and CYAN LED eyebrow strips.",
    at: [0.7, 0.8, 2.45],
    normal: [0, 0, 1],
    bone: null,
    room: [0.4, 0.2, 0.15],
  },
  {
    id: "tailLights",
    kind: "add",
    part: "bed",
    what: "Rear tail light strips in MAGENTA, a tow hitch removed and replaced by a small exhaust vent grid.",
    at: [0, 0.85, -2.45],
    normal: [0, 0, -1],
    bone: null,
    room: [1.7, 0.3, 0.15],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "cabRoof",
    what: "Cluster of whip antennas and a small radar dish on the rear roof corner with a blinking MAGENTA tip.",
    at: [-0.6, 1.62, -0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [0.4, 0.8, 0.4],
  },
  {
    id: "sideArmour",
    kind: "add",
    part: "bodySide",
    what: "Bolted armour plates and exhaust vents along both lower sides, with CYAN trim lines.",
    at: [1.0, 0.7, 0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.5, 2.4],
  },
  {
    id: "sideMirrors",
    kind: "add",
    part: "cab",
    what: "Angular wing mirrors with small CYAN indicator, and door handles.",
    at: [1.0, 1.15, 0.85],
    normal: [1, 0, 0],
    bone: null,
    room: [0.4, 0.3, 0.3],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "bodySide",
    what: "Dark urban digital camo in HULL and HULL_DARK on both body sides, with a faded white unit number near the rear and CYAN neon stripe.",
  },
  {
    id: "hoodDecal",
    kind: "texture",
    part: "hood",
    what: "Hazard chevrons in YELLOW and HULL_DARK along the hood front edge, scratches and soot near the vents.",
  },
  {
    id: "windshield",
    kind: "texture",
    part: "glass",
    what: "Tinted glass with a faint CYAN HUD grid and cracks at one corner.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5a48";
export const HULL_DARK = "#2e3a2f";
export const METAL = "#1d1f26";
export const STEEL = "#6b7280";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const YELLOW = "#f2c200";
export const GLASS = "#0c2a3a";
export const TIRE = "#101014";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const R = rng(5);

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], name });

  // chassis
  box(1.9, 0.25, 4.8, METAL, 0, 0.55, 0, "chassis");
  // body lower
  box(2.0, 0.45, 4.9, HULL, 0, 0.88, 0, "bodySide");
  // hood (sloped)
  b.part(new THREE.BoxGeometry(1.95, 0.35, 1.5), HULL, { at: [0, 1.2, 1.7], rotation: [-6, 0, 0], name: "hood" });
  box(1.5, 0.08, 0.5, HULL_DARK, 0, 1.4, 1.65, "hoodScoop");
  // front bumper
  box(2.1, 0.3, 0.3, HULL_DARK, 0, 0.75, 2.5, "bumper");
  box(1.6, 0.1, 0.2, METAL, 0, 0.55, 2.6, "splitter");
  // cab
  box(1.9, 0.6, 1.5, HULL, 0, 1.35, 0.1, "cab");
  b.part(new THREE.BoxGeometry(1.7, 0.1, 1.2), HULL_DARK, { at: [0, 1.58, 0.1], name: "cabRoof" });
  // glass
  b.part(new THREE.BoxGeometry(1.7, 0.5, 0.06), GLASS, { at: [0, 1.38, 0.88], rotation: [-25, 0, 0], name: "glass" });
  b.part(new THREE.BoxGeometry(1.7, 0.45, 0.06), GLASS, { at: [0, 1.38, -0.7], rotation: [20, 0, 0], name: "glassRear" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.4, 1.0), GLASS, { at: [s * 0.96, 1.4, 0.1], name: "glassSide" });
    // pillars
    box(0.1, 0.5, 0.1, HULL_DARK, s * 0.9, 1.4, 0.82);
    box(0.1, 0.5, 0.1, HULL_DARK, s * 0.9, 1.4, -0.62);
  }
  // bed
  box(1.9, 0.08, 2.0, METAL, 0, 1.08, -1.45, "bedFloor");
  for (const s of [1, -1]) {
    box(0.1, 0.4, 2.0, HULL, s * 0.95, 1.25, -1.45, "bed");
    box(0.12, 0.08, 2.0, HULL_DARK, s * 0.95, 1.5, -1.45);
  }
  box(1.9, 0.4, 0.1, HULL, 0, 1.25, -2.4, "bed");
  box(1.9, 0.4, 0.1, HULL, 0, 1.25, -0.5, "bedFront");
  // roll bar
  for (const s of [1, -1]) box(0.08, 0.6, 0.08, STEEL, s * 0.8, 1.55, -0.55);
  box(1.7, 0.08, 0.08, STEEL, 0, 1.85, -0.55);

  // thruster pods
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.25;
      const z = sz * 1.5;
      const nm = `thruster${sz > 0 ? "F" : "R"}${sx > 0 ? "L" : "R"}`;
      b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.45, 8), STEEL, { at: [x, 0.55, z], name: nm });
      b.part(new THREE.CylinderGeometry(0.5, 0.4, 0.15, 8), METAL, { at: [x, 0.3, z] });
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 8), CYAN, { at: [x, 0.2, z] });
      b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 8), HULL_DARK, { at: [x, 0.8, z] });
      // strut to body
      b.part(new THREE.BoxGeometry(0.5, 0.18, 0.25), METAL, { at: [sx * 1.08, 0.7, z] });
      for (let i = 0; i < 3; i++) {
        b.part(new THREE.BoxGeometry(0.06, 0.1, 0.5), YELLOW, { at: [x + (i - 1) * 0.2, 0.9, z], name: undefined });
      }
    }
  // underglow
  box(1.7, 0.04, 4.2, CYAN, 0, 0.4, 0, "underglow");
  // roof light bar housing placeholder
  box(1.4, 0.06, 0.12, METAL, 0, 1.66, 0.4);
  // fender flares
  for (const s of [1, -1]) box(0.1, 0.12, 4.9, HULL_DARK, s * 1.03, 1.0, 0);
  // exhaust stacks
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.6, 6), STEEL, { at: [s * 0.6, 1.4, -0.6 + 0.0] });
  // rear fins
  for (const s of [1, -1]) box(0.06, 0.4, 0.5, HULL_DARK, s * 0.8, 1.0, -2.5);
  // scatter bolts
  for (let i = 0; i < 12; i++) {
    const s = R() < 0.5 ? 1 : -1;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), STEEL, {
      at: [s * 1.015, 0.8 + R() * 0.2, -2 + R() * 4],
      dir: [s, 0, 0],
    });
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```