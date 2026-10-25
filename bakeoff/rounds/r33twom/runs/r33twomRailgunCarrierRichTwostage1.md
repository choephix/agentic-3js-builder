```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabRoof",
    what: "Slim amber/cyan light bar across the cab roof: dark housing, six lamps alternating CYAN and HAZARD, end brackets.",
    at: [0, 2.78, 4.2],
    normal: [0, 1, 0],
    bone: null,
    room: [1.8, 0.25, 0.4],
  },
  {
    id: "railCoils",
    kind: "add",
    part: "railL",
    what: "Glowing CYAN accelerator coil bands wrapped around both rails along the forward half, with copper ring fittings and small insulator blocks.",
    at: [0, 3.5, 3.5],
    normal: [0, 1, 0],
    bone: null,
    room: [1.6, 0.8, 5],
  },
  {
    id: "muzzleBrake",
    kind: "add",
    part: "railL",
    what: "Muzzle assembly at the rail tips: a spacer frame, flared blast shield plates, and a glowing CYAN arc gap between the rails.",
    at: [0, 3.5, 6.5],
    normal: [0, 0, 1],
    bone: null,
    room: [1.4, 0.8, 0.8],
  },
  {
    id: "capacitorBanks",
    kind: "add",
    part: "capL",
    what: "Capacitor bank details on both side tanks: warning bands, terminal posts, status lamps in CYAN and MAGENTA, and cable loops running to the breech.",
    at: [1.1, 2.9, -2.5],
    normal: [1, 0, 0],
    bone: null,
    room: [0.8, 0.8, 3.2],
  },
  {
    id: "rearVents",
    kind: "add",
    part: "hullRear",
    what: "Heat-exchange grille on the rear hull face: louvred vents in DARK, a radiator frame, two exhaust stacks above.",
    at: [0, 1.8, -5.55],
    normal: [0, 0, -1],
    bone: null,
    room: [2.4, 0.9, 0.4],
  },
  {
    id: "frontSensors",
    kind: "add",
    part: "cabFront",
    what: "Sensor suite on the cab front: armoured headlamp pods, a radar dish and a camera turret on a mast, a tow hook and bumper plates.",
    at: [0, 1.9, 5.45],
    normal: [0, 0, 1],
    bone: null,
    room: [2.5, 1.0, 0.5],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "hullTop",
    what: "Communications antenna array behind the cab: three whip antennas of different heights, a flat dish and a small box transceiver.",
    at: [-1.1, 2.3, 1.8],
    normal: [0, 1, 0],
    bone: null,
    room: [0.8, 1.6, 0.8],
  },
  {
    id: "stabiliserPads",
    kind: "add",
    part: "padFL",
    what: "Detail on each stabiliser leg: hydraulic hoses, hazard-striped sleeves in HAZARD and DARK, bolts around the pad and a ground spike.",
    at: [2.9, 0.3, 2.0],
    normal: [0, 1, 0],
    bone: null,
    room: [1.4, 1.4, 1.4],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "hullSideL",
    what: "Angular digital camo in HULL, HULL_DARK and PLATE on both hull sides (hullSideL and hullSideR), a faded unit number and a small chevron emblem near the front.",
  },
  {
    id: "wheelTread",
    kind: "texture",
    part: "tire",
    what: "Worn rubber tread pattern on all six tires, with dirt in DARK on the lower half.",
  },
  {
    id: "cabGlass",
    kind: "texture",
    part: "windshield",
    what: "Tinted glass with a cyan HUD glow reflection and thin cracked-edge frame lines.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#5b6b4a";
export const HULL_DARK = "#3f4a34";
export const PLATE = "#7a8668";
export const STEEL = "#8a919a";
export const DARK = "#23272d";
export const TIRE = "#1a1b1d";
export const HAZARD = "#e0b020";
export const CYAN = "#40e8ff";
export const MAGENTA = "#ff3cb4";
export const RAIL = "#4a5260";
export const COPPER = "#b8683a";
export const GLASS = "#2a4a60";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  type V = [number, number, number];
  const box = (color: string, size: V, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, flat: true, ...o });
  const cyl = (color: string, r: number, len: number, at: V, dir: V, sides = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { at, dir, flat: true, ...o });
  const X: V = [1, 0, 0];
  const Z: V = [0, 0, 1];

  // chassis
  box(DARK, [2.6, 0.5, 10.4], [0, 1.0, -0.3], { name: "chassis" });
  box(STEEL, [1.2, 0.3, 10.0], [0, 0.75, -0.3], { name: "underFrame" });
  for (const z of [3.4, 0.6, -2.2]) cyl(STEEL, 0.12, 3.6, [0, 0.7, z], X, 8, { name: "axle" });

  // hull
  box(HULL, [3.0, 1.0, 6.6], [0, 1.75, -2.2], { name: "hullBody" });
  box(HULL_DARK, [2.4, 0.3, 6.4], [0, 2.4, -2.2], { name: "hullTop" });
  box(HULL, [3.0, 1.0, 0.2], [0, 1.75, -5.55], { name: "hullRear" });
  for (const s of [1, -1]) {
    box(HULL, [0.15, 0.9, 6.4], [s * 1.55, 1.75, -2.2], { name: s > 0 ? "hullSideL" : "hullSideR" });
    box(PLATE, [0.2, 0.15, 6.6], [s * 1.55, 2.28, -2.2], { name: "sideTrim" });
    // sloped armour on the rear corners
    box(PLATE, [0.25, 0.8, 1.0], [s * 1.5, 1.7, -5.2], { rotation: [0, s * 20, 0], name: "cornerPlate" });
    // fender over each wheel
    for (const z of [3.4, 0.6, -2.2]) {
      box(HULL_DARK, [0.8, 0.15, 1.9], [s * 1.7, 1.55, z], { name: "fender" });
      box(HULL, [0.1, 0.3, 1.9], [s * 2.1, 1.45, z], { name: "fenderLip" });
    }
    // capacitor tanks
    cyl(STEEL, 0.5, 4.6, [s * 1.0, 3.0, -2.6], Z, 10, { name: s > 0 ? "capL" : "capR" });
    cyl(HAZARD, 0.52, 0.25, [s * 1.0, 3.0, -0.6], Z, 10, { name: "capBand" });
    cyl(HAZARD, 0.52, 0.25, [s * 1.0, 3.0, -4.6], Z, 10, { name: "capBand" });
    box(DARK, [0.5, 0.4, 3.0], [s * 1.0, 2.55, -2.6], { name: "capMount" });
  }

  // wheels
  const wheel = (s: number, zc: number) => {
    const cx = s * 1.65;
    cyl(TIRE, 0.7, 0.55, [cx, 0.7, zc], X, 14, { name: "tire" });
    cyl(STEEL, 0.4, 0.6, [cx, 0.7, zc], X, 10, { name: "hub" });
    cyl(DARK, 0.15, 0.7, [cx, 0.7, zc], X, 8, { name: "hubCap" });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(DARK, 0.04, 0.08, [cx + s * 0.31, 0.7 + Math.sin(a) * 0.27, zc + Math.cos(a) * 0.27], X, 6, { name: "bolt" });
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      box(TIRE, [0.58, 0.12, 0.22], [cx, 0.7 + Math.cos(a) * 0.68, zc + Math.sin(a) * 0.68], {
        rotation: [(a * 180) / Math.PI, 0, 0],
        name: "tread",
      });
    }
  };
  for (const s of [1, -1]) for (const z of [3.4, 0.6, -2.2]) wheel(s, z);

  // cab
  box(HULL, [2.7, 1.2, 2.3], [0, 1.9, 4.25], { name: "cabBody" });
  box(HULL_DARK, [2.5, 0.15, 1.5], [0, 2.55, 4.0], { name: "cabRoof" });
  box(HULL, [2.7, 0.9, 0.3], [0, 1.65, 5.5], { name: "cabFront" });
  box(GLASS, [2.2, 0.7, 0.1], [0, 2.2, 5.15], { rotation: [-25, 0, 0], name: "windshield" });
  box(DARK, [2.4, 0.1, 0.12], [0, 2.52, 5.0], { rotation: [-25, 0, 0], name: "windshieldFrame" });
  for (const s of [1, -1]) {
    box(GLASS, [0.1, 0.55, 1.0], [s * 1.38, 2.2, 4.5], { name: "sideWindow" });
    box(DARK, [0.1, 0.1, 0.4], [s * 1.4, 1.95, 5.1], { name: "mirrorArm" });
    box(DARK, [0.1, 0.4, 0.25], [s * 1.55, 2.15, 5.1], { name: "mirror" });
    glow(box(CYAN, [0.5, 0.2, 0.08], [s * 0.85, 1.55, 5.67], { name: "headlamp" }), 1.5);
  }
  box(PLATE, [2.9, 0.4, 0.4], [0, 1.0, 5.55], { name: "bumper" });
  box(PLATE, [2.9, 0.4, 0.4], [0, 1.0, -5.7], { name: "rearBumper" });
  box(DARK, [2.6, 0.25, 0.2], [0, 1.3, 5.7], { name: "bumperStrip" });

  // railgun
  box(DARK, [1.3, 1.1, 1.8], [0, 3.15, -3.6], { name: "breech" });
  box(HULL_DARK, [1.4, 0.2, 2.0], [0, 3.8, -3.6], { name: "breechCap" });
  box(STEEL, [1.6, 0.35, 2.8], [0, 2.65, -3.0], { name: "cradleBase" });
  for (const z of [-0.2, 2.2]) {
    for (const s of [1, -1]) box(STEEL, [0.25, 1.0, 0.5], [s * 0.55, 3.0, z], { name: "pylon" });
    box(STEEL, [1.6, 0.3, 0.6], [0, 2.55, z], { name: "pylonBase" });
  }
  for (const s of [1, -1]) {
    box(RAIL, [0.32, 0.36, 11.2], [s * 0.38, 3.5, 1.0], { name: s > 0 ? "railL" : "railR" });
    box(STEEL, [0.1, 0.1, 11.0], [s * 0.38, 3.72, 1.0], { name: "railTop" });
  }
  for (const z of [-1.5, 1.2, 3.9, 6.3]) box(DARK, [1.3, 0.3, 0.3], [0, 3.5, z], { name: "railSpacer" });
  for (const z of [-0.8, 2.0, 4.8]) box(COPPER, [1.3, 0.12, 0.2], [0, 3.28, z], { name: "railBrace" });

  // stabilisers
  for (const s of [1, -1])
    for (const z of [2.0, -3.6]) {
      const px = s * 3.0;
      const tag = (s > 0 ? "L" : "R") + (z > 0 ? "F" : "R");
      box(STEEL, [0.7, 0.6, 0.7], [s * 1.75, 1.4, z], { name: "legMount" });
      cyl(DARK, 0.22, 0.4, [s * 1.9, 1.4, z], Z, 8, { name: "legPivot" });
      b.rod([s * 1.85, 1.45, z], [px - s * 0.15, 0.55, z], 0.17, STEEL, { name: "legUpper" });
      b.rod([s * 1.9, 1.15, z + 0.3], [px - s * 0.3, 0.45, z + 0.1], 0.08, DARK, { name: "legPiston" });
      b.rod([px - s * 0.15, 0.6, z], [px, 0.25, z], 0.2, HAZARD, { name: "legLower" });
      cyl(PLATE, 0.65, 0.2, [px, 0.1, z], [0, 1, 0], 8, { name: "pad" + tag });
      cyl(DARK, 0.5, 0.06, [px, 0.22, z], [0, 1, 0], 8, { name: "padRim" });
      cyl(STEEL, 0.15, 0.2, [px, 0.35, z], [0, 1, 0], 8, { name: "padKnuckle" });
    }

  // misc
  for (const s of [1, -1]) box(DARK, [0.25, 0.25, 0.5], [s * 1.2, 2.55, 3.1], { name: "stowBox" });
  box(PLATE, [2.4, 0.2, 0.5], [0, 2.5, 3.0], { name: "bulkhead" });

  for (const add of STAGE2) add(b);
  return b.root;
}
```