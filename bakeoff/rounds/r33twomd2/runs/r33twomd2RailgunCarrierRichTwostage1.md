```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled low-poly sci-fi railgun carrier with a stowed twin-rail gun, capacitor bank and four deployed stabiliser legs.",
};

export const REQUESTS = [
  {
    id: "roofLightBar", kind: "add", part: "cab",
    what: "Light bar across the cab roof: slim dark housing, six lamps alternating CYAN and MAGENTA (glowing), end brackets.",
    at: [0, 2.68, 3.2], normal: [0, 1, 0], bone: null, room: [1.8, 0.25, 0.35],
  },
  {
    id: "frontGrille", kind: "add", part: "cab",
    what: "Armoured front grille and bumper: angled slats in METAL, two square headlamps in CYAN glow, tow hooks in ORANGE.",
    at: [0, 1.5, 4.32], normal: [0, 0, 1], bone: null, room: [2.3, 0.8, 0.3],
  },
  {
    id: "antennaArray", kind: "add", part: "turret",
    what: "Antenna cluster on turret rear-left: a whip mast, a dish, a phased-array panel and a small blinking beacon in MAGENTA.",
    at: [0.8, 2.97, -2.2], normal: [0, 1, 0], bone: null, room: [0.9, 1.4, 0.9],
  },
  {
    id: "muzzleFittings", kind: "add", part: "gun",
    what: "Rail muzzle fittings: flared guide rings, insulator clamps, a CYAN glowing muzzle slit and a bolted collar.",
    at: [0, 3.1, 5.85], normal: [0, 0, 1], bone: null, room: [1.5, 0.7, 0.6],
  },
  {
    id: "capacitorVents", kind: "add", part: "capBank",
    what: "Capacitor bank detailing: heat-sink fins on the top, thick cables looping into the deck in METAL and ORANGE, a warning plate.",
    at: [0, 3.02, -3.3], normal: [0, 1, 0], bone: null, room: [2.0, 0.4, 1.4],
  },
  {
    id: "sideStowage", kind: "add", part: "hullSide",
    what: "Left-side stowage: two lockable equipment boxes, a rolled tarp, a jerrycan pair and a tool rack with bolts.",
    at: [1.33, 1.1, -1.2], normal: [1, 0, 0], bone: null, room: [0.4, 0.7, 1.4],
  },
  {
    id: "legHydraulics", kind: "add", part: "stabiliserLeg",
    what: "Hydraulic detail on the stabiliser legs: hose pairs, piston collars in STEEL, warning ORANGE bands and a pad indicator lamp, repeated on all four legs.",
    at: [2.2, 0.9, 1.5], normal: [1, 0, 0], bone: null, room: [1.8, 1.2, 0.5],
  },
  {
    id: "sensorDome", kind: "add", part: "turret",
    what: "Targeting sensor turret on turret roof right: a dome with a glass lens in GLASS, a CYAN glowing eye and a small shroud.",
    at: [-0.8, 2.97, -0.4], normal: [0, 1, 0], bone: null, room: [0.6, 0.5, 0.6],
  },
  {
    id: "rearLadder", kind: "add", part: "hull",
    what: "Rear access ladder and tow hitch: rungs, side rails, a hand grip and a hitch ball plus two tail lights in red glow.",
    at: [0, 1.4, -4.22], normal: [0, 0, -1], bone: null, room: [1.6, 1.2, 0.4],
  },
  {
    id: "hullCamo", kind: "texture", part: "hullSide",
    what: "Digital camo of blocky patches in HULL, HULL_DARK and PLATE on hull side panels and cab, with a faded white unit number.",
  },
  {
    id: "turretEmblem", kind: "texture", part: "turretSide",
    what: "Unit emblem on both turret side plates: a stylised lightning bolt through a ring in CYAN on dark METAL, plus a stencilled barrel kill-ring set.",
  },
  {
    id: "hazardLegs", kind: "texture", part: "stabiliserLeg",
    what: "ORANGE and METAL diagonal hazard stripes on the outer leg cylinders and pad rims.",
  },
  {
    id: "tireTread", kind: "texture", part: "tire",
    what: "Worn rubber with chevron tread pattern and white sidewall lettering in TIRE tones.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const HULL = "#5b6b4a";
const HULL_DARK = "#3f4a35";
const PLATE = "#78855f";
const METAL = "#2c3036";
const STEEL = "#8a929c";
const GLASS = "#1c3a4a";
const CYAN = "#35e6ff";
const MAGENTA = "#ff3fb4";
const ORANGE = "#e8a21a";
const TIRE = "#1b1c1f";
const RED = "#d0262b";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });

  const box = (size: number[], at: number[], color: string, opts: { rot?: number[]; name?: string } = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: opts.rot, name: opts.name });
  const cyl = (r: number, h: number, at: number[], color: string, dir: number[] = [0, 1, 0], sides = 10, name?: string) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { at, dir, name });

  // ---- hull
  box([2.5, 0.8, 8.4], [0, 1.1, 0], HULL_DARK, { name: "hull" });
  box([2.7, 0.5, 5.0], [0, 1.6, -1.7], HULL, { name: "hull" });
  box([2.3, 0.18, 8.2], [0, 0.62, 0], METAL); // belly plate
  box([2.2, 0.3, 0.5], [0, 1.0, 4.35], PLATE); // bumper
  box([2.6, 0.25, 0.4], [0, 1.0, -4.3], PLATE);
  for (const s of [1, -1]) {
    for (const z of [1.5, -1.2]) {
      box([0.12, 0.7, 1.5], [s * 1.28, 1.1, z], HULL, { name: "hullSide" });
      box([0.05, 0.5, 1.2], [s * 1.35, 1.1, z], PLATE, { name: "hullSide" });
    }
    box([0.12, 0.7, 1.2], [s * 1.28, 1.1, 3.6], HULL, { name: "hullSide" });
    box([0.12, 0.7, 1.0], [s * 1.28, 1.1, -3.5], HULL, { name: "hullSide" });
    // deck armour edges
    box([0.12, 0.3, 4.8], [s * 1.38, 1.62, -1.7], PLATE);
    box([0.5, 0.06, 1.0], [s * 0.9, 1.88, 1.4], METAL); // grip plates
  }

  // ---- wheels
  const wz = [2.8, 0.2, -2.4];
  for (const s of [1, -1])
    for (const z of wz) {
      const x = s * 1.5;
      cyl(0.62, 0.55, [x, 0.62, z], TIRE, [1, 0, 0], 14, "tire");
      cyl(0.34, 0.6, [x, 0.62, z], STEEL, [1, 0, 0], 10);
      cyl(0.18, 0.66, [x + s * 0.02, 0.62, z], ORANGE, [1, 0, 0], 8);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        box([0.58, 0.13, 0.22], [x, 0.62 + Math.cos(a) * 0.64, z + Math.sin(a) * 0.64], "#101113", {
          rot: [(a * 180) / Math.PI, 0, 0],
        });
      }
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.08, [x + s * 0.3, 0.62 + Math.cos(a) * 0.25, z + Math.sin(a) * 0.25], METAL, [1, 0, 0], 6);
      }
      // fender
      box([0.8, 0.12, 1.5], [x, 1.42, z], HULL_DARK);
      box([0.8, 0.12, 0.35], [x, 1.3, z + 0.8], HULL_DARK, { rot: [-35, 0, 0] });
      box([0.8, 0.12, 0.35], [x, 1.3, z - 0.8], HULL_DARK, { rot: [35, 0, 0] });
    }
  for (const z of wz) cyl(0.14, 3.0, [0, 0.62, z], METAL, [1, 0, 0], 8); // axles

  // ---- cab
  box([2.4, 1.1, 1.7], [0, 2.15, 3.45], HULL, { name: "cab" });
  box([2.5, 0.12, 1.8], [0, 2.75, 3.45], PLATE, { name: "cab" });
  box([2.4, 0.5, 0.9], [0, 1.6, 3.9], HULL, { name: "cab" }); // hood wedge base
  box([2.0, 0.75, 0.08], [0, 2.3, 4.33], GLASS, { rot: [-14, 0, 0] });
  box([2.2, 0.1, 0.12], [0, 2.7, 4.3], METAL);
  for (const s of [1, -1]) {
    box([0.05, 0.55, 1.0], [s * 1.21, 2.3, 3.5], GLASS);
    box([0.1, 0.12, 0.35], [s * 1.28, 2.55, 4.15], METAL); // mirror arm
    box([0.08, 0.35, 0.22], [s * 1.34, 2.4, 4.15], METAL);
    cyl(0.1, 1.2, [s * 1.1, 2.4, 1.9], METAL, [0, 1, 0], 8); // exhaust
    cyl(0.12, 0.1, [s * 1.1, 3.0, 1.9], STEEL, [0, 1, 0], 8);
    cyl(0.1, 0.06, [s * 0.75, 1.55, 4.38], CYAN, [0, 0, 1], 8);
  }
  box([2.1, 0.1, 0.1], [0, 1.9, 4.32], PLATE);
  box([2.1, 0.7, 0.04], [0, 3.0, 2.6], METAL); // placeholder under rail rest
  b.root.children[b.root.children.length - 1].visible = true;

  // ---- turret
  cyl(1.3, 0.25, [0, 1.98, -1.2], METAL, [0, 1, 0], 16);
  box([2.1, 0.9, 3.0], [0, 2.5, -1.2], HULL, { name: "turret" });
  box([1.4, 0.18, 2.8], [0, 3.0, -1.2], PLATE, { name: "turret" });
  for (const s of [1, -1]) {
    box([0.12, 0.8, 2.8], [s * 1.12, 2.5, -1.2], HULL_DARK, { rot: [0, 0, -s * 14], name: "turretSide" });
    box([0.5, 0.35, 0.5], [s * 0.7, 2.98, -1.9], METAL);
  }

  // ---- gun
  box([1.2, 0.8, 3.2], [0, 3.1, -1.0], HULL_DARK, { name: "gun" }); // cradle
  box([1.0, 0.5, 0.5], [0, 2.78, 3.4], METAL); // rest on cab roof
  box([0.8, 0.12, 0.7], [0, 2.84, 3.4], STEEL);
  for (const s of [1, -1]) {
    box([0.3, 0.32, 7.8], [s * 0.38, 3.1, 1.9], METAL, { name: "gun" });
    box([0.12, 0.1, 7.6], [s * 0.38, 3.28, 1.9], STEEL);
    for (let i = 0; i < 8; i++) box([0.4, 0.38, 0.12], [s * 0.38, 3.1, 0.2 + i * 0.85], STEEL);
  }
  glow(box([0.12, 0.08, 7.2], [0, 3.12, 1.9], CYAN), 1.4);
  box([1.4, 0.55, 0.5], [0, 3.1, 5.75], STEEL, { name: "gun" });
  box([1.1, 0.12, 0.5], [0, 3.42, 5.4], METAL);

  // ---- capacitor bank
  box([2.2, 1.0, 1.6], [0, 2.5, -3.3], METAL, { name: "capBank" });
  box([2.3, 0.1, 1.7], [0, 3.02, -3.3], PLATE);
  for (let i = 0; i < 5; i++) glow(box([0.2, 0.7, 0.05], [-0.84 + i * 0.42, 2.5, -4.12], CYAN), 1.3);
  for (const s of [1, -1]) box([0.06, 0.8, 1.3], [s * 1.12, 2.5, -3.3], HULL_DARK);
  box([0.5, 0.3, 0.8], [0, 2.1, -2.3], HULL_DARK);

  // ---- stabiliser legs
  for (const s of [1, -1])
    for (const z of [1.5, -1.0]) {
      box([0.5, 0.5, 0.6], [s * 1.45, 1.55, z], PLATE, { name: "stabiliserLeg" });
      b.rod([s * 1.5, 1.45, z], [s * 2.85, 0.3, z], 0.17, METAL, { name: "stabiliserLeg" });
      b.rod([s * 2.1, 0.95, z], [s * 2.85, 0.3, z], 0.12, STEEL);
      b.rod([s * 1.4, 1.0, z], [s * 2.45, 0.55, z], 0.08, ORANGE); // brace
      cyl(0.5, 0.22, [s * 2.9, 0.11, z], PLATE, [0, 1, 0], 8, "stabiliserLeg");
      cyl(0.36, 0.12, [s * 2.9, 0.26, z], METAL, [0, 1, 0], 8);
      box([0.6, 0.1, 0.5], [s * 2.0, 0.9, z], ORANGE);
    }

  // ---- misc greebles
  box([1.2, 0.05, 0.9], [0, 1.9, 0.4], METAL);
  for (const s of [1, -1]) box([0.5, 0.2, 0.5], [s * 0.7, 1.95, 0.4], HULL_DARK);

  for (const add of STAGE2) add(b);
  return b.root;
}
```