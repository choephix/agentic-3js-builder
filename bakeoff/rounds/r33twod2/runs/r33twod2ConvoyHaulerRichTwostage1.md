```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler guarding a sealed cargo pod.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.55, 3.2], normal: [0, 1, 0], bone: null, room: [1.8, 0.3, 0.4] },
  { id: "grille", kind: "add", part: "cab", what: "Front armoured grille with horizontal slats in STEEL_DARK and a CYAN glow strip behind them.", at: [0, 1.0, 4.45], normal: [0, 0, 1], bone: null, room: [1.6, 0.8, 0.2] },
  { id: "headlights", kind: "add", part: "cab", what: "Pair of angular headlamps in CYAN with bezels, left and right of the grille.", at: [0.95, 1.2, 4.4], normal: [0, 0, 1], bone: null, room: [0.5, 0.3, 0.2] },
  { id: "exhaustStacks", kind: "add", part: "cab", what: "Twin vertical exhaust stacks behind the cab with heat shields and soot caps.", at: [1.2, 2.2, 1.9], normal: [1, 0, 0], bone: null, room: [0.4, 1.4, 0.4] },
  { id: "antennaArray", kind: "add", part: "cab", what: "Antenna cluster on the cab roof rear: whips, a dish and blinking MAGENTA tips.", at: [-0.7, 2.55, 2.4], normal: [0, 1, 0], bone: null, room: [0.6, 1.2, 0.6] },
  { id: "podLocks", kind: "add", part: "pod", what: "Sealed pod locking clamps and a glowing MAGENTA seam ring with hazard emblem.", at: [0, 2.2, -2.4], normal: [0, 1, 0], bone: null, room: [2, 0.5, 4] },
  { id: "sideTurrets", kind: "add", part: "chassis", what: "Two side-mounted autocannon turrets with barrels and ammo boxes.", at: [1.5, 1.6, 0.3], normal: [1, 0, 0], bone: null, room: [0.6, 0.6, 1.2] },
  { id: "tailLights", kind: "add", part: "chassis", what: "Rear tail-light strip in MAGENTA and tow hitch with cables.", at: [0, 0.9, -6.3], normal: [0, 0, -1], bone: null, room: [2.2, 0.4, 0.3] },
  { id: "hullCamo", kind: "texture", part: "podShell", what: "Dark city-grime panelling in HULL and HULL_DARK with faded unit number and hazard stripes." },
  { id: "cabArmor", kind: "texture", part: "cab", what: "Scratched armour plating in HULL with rivets, neon CYAN edge lines." },
  { id: "tireTread", kind: "texture", part: "wheel", what: "Tyre tread pattern in TIRE with worn lighter edges." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#3a4252";
export const HULL_DARK = "#232833";
export const STEEL_DARK = "#14171d";
export const CYAN = "#22e6ff";
export const MAGENTA = "#ff2fa8";
export const TIRE = "#101216";
export const HUB = "#7b8494";
export const GLASS = "#0c3a52";
export const WARN = "#e8b224";

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], name, rotation: rot as any });

  // chassis
  box(2.4, 0.5, 11, HULL_DARK, [0, 0.9, -0.5], "chassis");
  box(2.6, 0.2, 10.4, STEEL_DARK, [0, 0.62, -0.5], "underplate");
  // wheels (3 axles)
  for (const s of [1, -1])
    for (const z of [3.2, -1.2, -4.2]) {
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 10), TIRE, { at: [s * 1.35, 0.62, z], rotation: [0, 0, 90], name: "wheel" });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.58, 8), HUB, { at: [s * 1.36, 0.62, z], rotation: [0, 0, 90] });
      box(0.2, 0.08, 1.5, HULL, [s * 1.25, 1.3, z], "fender");
    }
  // cab
  box(2.3, 1.2, 2.6, HULL, [0, 1.75, 3.1], "cab");
  box(2.3, 0.7, 1.6, HULL, [0, 1.15, 4.0], "cab");
  box(2.0, 0.55, 1.6, HULL_DARK, [0, 2.6, 2.6], "cabRoof");
  b.part(new THREE.BoxGeometry(2.0, 0.55, 0.1), GLASS, { at: [0, 2.2, 4.12], rotation: [-25, 0, 0] });
  for (const s of [1, -1]) box(0.06, 0.5, 1.2, GLASS, [s * 1.17, 2.05, 3.0]);
  box(2.5, 0.35, 0.5, STEEL_DARK, [0, 0.75, 4.7], "bumper");
  box(2.4, 0.15, 0.2, CYAN, [0, 0.62, 4.98]);
  // plates
  for (const s of [1, -1]) {
    box(0.15, 0.7, 2.2, HULL_DARK, [s * 1.2, 1.6, 3.1]);
    box(0.2, 0.5, 5.5, HULL, [s * 1.3, 1.25, -2.5]);
  }
  // pod
  box(2.7, 2.2, 6.6, HULL, [0, 2.25, -2.6], "podShell");
  box(2.5, 0.35, 6.4, HULL_DARK, [0, 3.5, -2.6], "podShell");
  for (const z of [-0.2, -2.6, -5.0]) box(2.85, 2.3, 0.18, HULL_DARK, [0, 2.25, z]);
  box(2.4, 0.25, 6.2, STEEL_DARK, [0, 1.1, -2.6]);
  for (const s of [1, -1]) box(0.08, 0.1, 6.0, MAGENTA, [s * 1.37, 2.9, -2.6]);
  box(1.2, 0.06, 1.2, WARN, [0, 3.7, -2.6]);
  box(2.2, 1.6, 0.15, STEEL_DARK, [0, 2.2, -6.0]);

  for (const add of STAGE2) add(b);
  return b.root;
}
```