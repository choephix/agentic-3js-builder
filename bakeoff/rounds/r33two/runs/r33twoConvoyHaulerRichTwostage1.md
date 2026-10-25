```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler guarding a sealed cargo pod.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.55, 3.3], normal: [0, 1, 0], bone: null, room: [1.8, 0.3, 0.4] },
  { id: "grille", kind: "add", part: "cab", what: "Armoured front grille: horizontal slats in STEEL_DARK with a CYAN glowing core strip and a small emblem.", at: [0, 1.0, 4.45], normal: [0, 0, 1], bone: null, room: [1.6, 0.8, 0.3] },
  { id: "headlights", kind: "add", part: "cab", what: "Pair of angular headlights with MAGENTA-rimmed visors; one request, at is the left lamp, mirror to the right at x=-0.85.", at: [0.85, 0.75, 4.45], normal: [0, 0, 1], bone: null, room: [0.5, 0.25, 0.2] },
  { id: "podHatch", kind: "add", part: "pod", what: "Sealed pod top hatch: ring seal, hazard chevrons, four bolts, a glowing CYAN status lamp.", at: [0, 3.3, -1.2], normal: [0, 1, 0], bone: null, room: [1.2, 0.2, 1.2] },
  { id: "podLocks", kind: "add", part: "pod", what: "Row of three heavy lock clamps with small red lamps down the pod's left side.", at: [1.35, 2.0, -1.2], normal: [1, 0, 0], bone: null, room: [0.3, 1.2, 3.0] },
  { id: "antenna", kind: "add", part: "cab", what: "Antenna array behind the cab: whip antennas, a small dish, blinking MAGENTA tip lights.", at: [-0.8, 2.6, 2.2], normal: [0, 1, 0], bone: null, room: [0.6, 1.2, 0.6] },
  { id: "sidePlates", kind: "add", part: "chassis", what: "Bolted armour skirt plates along the chassis sides with CYAN edge trim.", at: [1.3, 0.75, 0.5], normal: [1, 0, 0], bone: null, room: [0.2, 0.6, 5.0] },
  { id: "exhaust", kind: "add", part: "cab", what: "Twin vertical exhaust stacks with vent caps and faint glow.", at: [1.25, 2.0, 2.4], normal: [1, 0, 0], bone: null, room: [0.3, 1.4, 0.3] },
  { id: "hullCamo", kind: "texture", part: "podSide", what: "Faded urban digital camo in HULL and HULL_DARK on pod sides, with a stencilled unit number near the rear." },
  { id: "cabSide", kind: "texture", part: "cabBody", what: "Scratched armour paint on cab with CYAN circuit-trace lines and hazard stripes along the lower edge." },
  { id: "chassisGrime", kind: "texture", part: "chassis", what: "Oil and road grime streaks in STEEL_DARK and BLACK, heavier near the wheels." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5560";
export const HULL_DARK = "#2e353d";
export const STEEL_DARK = "#20252b";
export const STEEL = "#7d8a96";
export const BLACK = "#111317";
export const CYAN = "#22e6ff";
export const MAGENTA = "#ff2fa8";
export const GLASS = "#0c2a3a";
export const WARN = "#ffb020";

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name });

  // chassis
  box(2.4, 0.5, 8.6, HULL_DARK, 0, 0.85, 0.2, "chassis");
  box(2.0, 0.3, 8.0, STEEL_DARK, 0, 0.55, 0.2);
  // wheels
  for (const s of [1, -1])
    for (const z of [-2.8, -1.2, 1.6, 3.4]) {
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 10), BLACK, { at: [s * 1.3, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.54, 8), STEEL, { at: [s * 1.3, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.58, 6), CYAN, { at: [s * 1.3, 0.62, z], dir: [1, 0, 0] });
      box(0.2, 0.08, 1.4, HULL, s * 1.28, 1.35, z); // fender
    }
  // cab
  box(2.4, 1.5, 2.6, HULL, 0, 1.9, 3.1, "cabBody");
  box(2.2, 0.7, 1.4, HULL, 0, 1.15, 4.1, "cab");
  box(2.0, 0.55, 0.12, GLASS, 0, 2.2, 4.42);
  const slant = b.part(new THREE.BoxGeometry(2.2, 0.5, 0.9), HULL_DARK, { at: [0, 2.7, 3.2], name: "cab" });
  void slant;
  for (const s of [1, -1]) {
    box(0.1, 0.5, 1.0, GLASS, s * 1.22, 2.2, 3.4);
    box(0.5, 0.9, 0.5, STEEL_DARK, s * 1.2, 0.95, 4.35);
    box(0.4, 0.15, 0.4, WARN, s * 1.2, 1.45, 4.35);
  }
  box(2.6, 0.35, 0.5, STEEL_DARK, 0, 0.55, 4.5); // bumper
  box(2.4, 0.15, 0.3, CYAN, 0, 0.55, 4.76);
  // coupling deck
  box(2.2, 0.2, 5.0, STEEL, 0, 1.2, -1.3);
  // pod
  box(2.7, 2.0, 5.0, HULL, 0, 2.3, -1.3, "pod");
  box(2.76, 1.6, 4.9, HULL, 0, 2.3, -1.3, "podSide");
  box(2.3, 0.3, 4.6, HULL_DARK, 0, 3.45, -1.3);
  for (const z of [-3.3, -2.2, -0.2, 0.7]) box(2.9, 0.2, 0.25, STEEL_DARK, 0, 2.3, z);
  for (const z of [-3.3, 0.7]) box(2.9, 2.1, 0.25, STEEL_DARK, 0, 2.3, z);
  box(2.6, 1.9, 0.2, STEEL_DARK, 0, 2.3, -3.85);
  box(1.6, 0.12, 0.1, CYAN, 0, 3.0, -3.98);
  // rear lights
  for (const s of [1, -1]) box(0.4, 0.2, 0.1, MAGENTA, s * 0.9, 1.2, -4.0);

  for (const add of STAGE2) add(b);
  return b.root;
}
```