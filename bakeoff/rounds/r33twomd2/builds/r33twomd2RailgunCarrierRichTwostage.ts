import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, svg, rng, smoothstep, mix } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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

// blocky digital camo: noise sampled at the centre of 0.16 m cells
const CAMO = paint((p) => {
  const q = 0.16;
  const c = p.clone().multiplyScalar(1 / q).floor().addScalar(0.5).multiplyScalar(q);
  const v = noise(c, 0.7, 11);
  const w = noise(c, 0.35, 23);
  return v > 0.56 ? HULL_DARK : v < 0.4 ? PLATE : w > 0.62 ? HULL_DARK : HULL;
});

// diagonal hazard stripes
const HAZARD = paint((p) => {
  const k = Math.floor((p.y + Math.abs(p.x) + p.z) / 0.1);
  return k % 2 === 0 ? ORANGE : METAL;
});

// worn tyre: chevron tread on the tread, pale dashed lettering ring on the faces
const TIRE_PAINT = paint((p, n, s) => {
  const wear = noise(p, 0.15, 5);
  if (Math.abs(n.x) > 0.8) {
    const dx = s[0] - 0.5;
    const dy = s[1] - 0.5;
    const r = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx);
    if (r > 0.3 && r < 0.36 && Math.floor((a + Math.PI) / 0.2) % 2 === 0) return wear > 0.45 ? "#d8d8d0" : "#9a9a94";
    if (r > 0.44) return "#2a2b2f";
    return wear > 0.6 ? "#26272b" : TIRE;
  }
  const chev = (((s[0] * 28 + Math.abs(s[1] - 0.5) * 5) % 1) + 1) % 1;
  if (chev < 0.4) return "#0c0d0f";
  return wear > 0.58 ? "#34353a" : TIRE;
});

const EMBLEM = svg(
  `<svg viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="140" height="40" fill="#23272d"/>
    <rect x="1" y="1" width="138" height="38" fill="none" stroke="#3a4048" stroke-width="1.5"/>
    <circle cx="48" cy="20" r="16" fill="#12161a" stroke="#35e6ff" stroke-width="3"/>
    <path d="M52 5 L38 22 L47 22 L43 35 L58 17 L49 17 Z" fill="#35e6ff" stroke="#0b3a44" stroke-width="1"/>
    <g fill="none" stroke="#8a929c" stroke-width="1.6">
      <circle cx="90" cy="20" r="6"/><circle cx="90" cy="20" r="2"/>
      <circle cx="106" cy="20" r="6"/><circle cx="106" cy="20" r="2"/>
      <circle cx="122" cy="20" r="6"/><circle cx="122" cy="20" r="2"/>
    </g>
  </svg>`,
  { size: 512 },
);

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
      box([0.12, 0.7, 1.5], [s * 1.28, 1.1, z], CAMO as unknown as string, { name: "hullSide" });
      box([0.05, 0.5, 1.2], [s * 1.35, 1.1, z], PLATE, { name: "hullSide" });
    }
    box([0.12, 0.7, 1.2], [s * 1.28, 1.1, 3.6], CAMO as unknown as string, { name: "hullSide" });
    box([0.12, 0.7, 1.0], [s * 1.28, 1.1, -3.5], CAMO as unknown as string, { name: "hullSide" });
    // deck armour edges
    box([0.12, 0.3, 4.8], [s * 1.38, 1.62, -1.7], PLATE);
    box([0.5, 0.06, 1.0], [s * 0.9, 1.88, 1.4], METAL); // grip plates
  }

  // ---- wheels
  const wz = [2.8, 0.2, -2.4];
  for (const s of [1, -1])
    for (const z of wz) {
      const x = s * 1.5;
      cyl(0.62, 0.55, [x, 0.62, z], TIRE_PAINT as unknown as string, [1, 0, 0], 14, "tire");
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
  box([2.4, 1.1, 1.7], [0, 2.15, 3.45], CAMO as unknown as string, { name: "cab" });
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
    b.part(new THREE.BoxGeometry(0.12, 0.8, 2.8), "#ffffff", {
      at: [s * 1.12, 2.5, -1.2],
      rotation: [0, 0, -s * 14],
      name: "turretSide",
      texture: EMBLEM,
    });
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
      b.rod([s * 1.5, 1.45, z], [s * 2.85, 0.3, z], 0.17, HAZARD as unknown as string, { name: "stabiliserLeg" });
      b.rod([s * 2.1, 0.95, z], [s * 2.85, 0.3, z], 0.12, STEEL);
      b.rod([s * 1.4, 1.0, z], [s * 2.45, 0.55, z], 0.08, ORANGE); // brace
      cyl(0.5, 0.22, [s * 2.9, 0.11, z], HAZARD as unknown as string, [0, 1, 0], 8, "stabiliserLeg");
      cyl(0.36, 0.12, [s * 2.9, 0.26, z], METAL, [0, 1, 0], 8);
      box([0.6, 0.1, 0.5], [s * 2.0, 0.9, z], ORANGE);
    }

  // ---- misc greebles
  box([1.2, 0.05, 0.9], [0, 1.9, 0.4], METAL);
  for (const s of [1, -1]) box([0.5, 0.2, 0.5], [s * 0.7, 1.95, 0.4], HULL_DARK);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const cx = 0, cy = 2.68, cz = 3.2;
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, name: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], name });

  // base plate sitting on the roof (roof top is y = 2.81)
  box(1.9, 0.05, 0.34, cx, 2.835, cz, METAL, "lightbar.base");
  // main dark housing
  box(1.7, 0.14, 0.26, cx, 2.935, cz, METAL, "lightbar.housing");
  // top cap and front/back lips
  box(1.76, 0.03, 0.3, cx, 3.02, cz, HULL_DARK, "lightbar.cap");
  box(1.7, 0.04, 0.03, cx, 2.93, cz + 0.14, STEEL, "lightbar.lipF");
  box(1.7, 0.04, 0.03, cx, 2.93, cz - 0.14, STEEL, "lightbar.lipB");

  // six alternating lamps on the front face, with small lens shrouds
  for (let i = 0; i < 6; i++) {
    const x = cx - 0.7 + i * 0.28;
    const c = i % 2 === 0 ? CYAN : MAGENTA;
    glow(box(0.2, 0.1, 0.05, x, 2.935, cz + 0.145, c, "lightbar.lamp"), 1.6);
    box(0.22, 0.015, 0.06, x, 2.99, cz + 0.145, METAL, "lightbar.visor");
    // rear lamps echo the front
    glow(box(0.2, 0.08, 0.04, x, 2.935, cz - 0.145, c, "lightbar.lampR"), 1.2);
    // dividers
    if (i < 5) box(0.03, 0.12, 0.28, x + 0.14, 2.935, cz, STEEL, "lightbar.divider");
  }

  // end brackets and bolts
  for (const s of [1, -1]) {
    box(0.1, 0.22, 0.32, s * 0.93, 2.93, cz, STEEL, "lightbar.bracket");
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), ORANGE, {
      at: [s * 0.93, 3.05, cz], name: "lightbar.bolt",
    });
    box(0.14, 0.06, 0.2, s * 0.82, 2.85, cz, METAL, "lightbar.foot");
    // end beacon cubes
    glow(box(0.07, 0.08, 0.2, s * 0.99, 2.93, cz, s > 0 ? CYAN : MAGENTA, "lightbar.endlamp"), 1.4);
  }
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addFrontGrille(b: Builder) {
  const box = (s: number[], at: number[], c: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, rotation: rot });
  const cyl = (r: number, h: number, at: number[], c: string, dir: number[], sides = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), c, { at, dir });

  // ===== Front grille and bumper (cab front, z ~ 4.32)
  const z0 = 4.36;
  // grille frame
  box([1.5, 0.06, 0.1], [0, 1.78, z0], METAL);
  box([1.5, 0.06, 0.1], [0, 1.22, z0], METAL);
  for (const s of [1, -1]) box([0.06, 0.6, 0.1], [s * 0.75, 1.5, z0], METAL);
  // angled slats
  for (let i = 0; i < 6; i++) box([1.4, 0.06, 0.08], [0, 1.28 + i * 0.09, z0 + 0.03], STEEL, [-28, 0, 0]);
  // dark backing
  box([1.4, 0.5, 0.04], [0, 1.5, z0 - 0.04], "#0f1114");
  // headlamps
  for (const s of [1, -1]) {
    box([0.34, 0.3, 0.1], [s * 0.98, 1.55, z0 - 0.0], METAL);
    glow(box([0.26, 0.22, 0.06], [s * 0.98, 1.55, z0 + 0.06], CYAN), 1.6);
    box([0.3, 0.05, 0.12], [s * 0.98, 1.72, z0 + 0.02], HULL_DARK); // brow
  }
  // armoured bumper
  box([2.4, 0.22, 0.28], [0, 1.0, 4.58], PLATE);
  box([2.4, 0.07, 0.3], [0, 1.13, 4.58], METAL);
  box([1.2, 0.18, 0.1], [0, 0.88, 4.72], HULL_DARK, [-20, 0, 0]);
  for (const s of [1, -1]) {
    box([0.3, 0.3, 0.3], [s * 1.12, 1.0, 4.52], HULL_DARK, [0, s * 20, 0]);
    // tow hooks
    cyl(0.04, 0.3, [s * 0.55, 0.92, 4.8], ORANGE, [0, 0, 1], 6);
    b.part(new THREE.TorusGeometry(0.07, 0.025, 5, 8, Math.PI * 1.4), ORANGE, {
      at: [s * 0.55, 0.88, 4.96],
      rotation: [0, 0, 0],
    });
    box([0.14, 0.14, 0.1], [s * 0.55, 0.92, 4.72], METAL);
    // bolts
    for (const x of [0.2, 0.5]) cyl(0.025, 0.04, [s * (0.7 + x), 1.0, 4.74], STEEL, [0, 0, 1], 6);
  }
  // hazard stripe plate under bumper
  for (let i = 0; i < 5; i++) box([0.14, 0.07, 0.04], [-0.5 + i * 0.25, 1.0, 4.74], i % 2 ? ORANGE : METAL);

  // ===== Antenna cluster on turret rear-left (0.8, 2.97, -2.2)
  const ax = 0.8, ay = 3.0, az = -2.2;
  box([0.8, 0.06, 0.8], [ax, ay, az], METAL); // base plate
  for (const [dx, dz] of [[-0.34, -0.34], [0.34, -0.34], [-0.34, 0.34], [0.34, 0.34]])
    cyl(0.025, 0.05, [ax + dx, ay + 0.05, az + dz], STEEL, [0, 1, 0], 6);
  // whip mast
  cyl(0.06, 0.2, [ax - 0.25, ay + 0.13, az - 0.25], METAL, [0, 1, 0]);
  b.rod([ax - 0.25, ay + 0.2, az - 0.25], [ax - 0.2, ay + 1.4, az - 0.22], [0.025, 0.008], STEEL);
  cyl(0.035, 0.05, [ax - 0.2, ay + 1.4, az - 0.22], RED, [0, 1, 0], 6);
  // dish
  cyl(0.05, 0.5, [ax + 0.22, ay + 0.3, az - 0.2], METAL, [0, 1, 0]);
  b.part(new THREE.SphereGeometry(0.28, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.4), STEEL, {
    at: [ax + 0.22, ay + 0.62, az - 0.2],
    dir: [0.4, 0.6, 0.7],
    axis: "y",
    scale: [1, 0.45, 1],
  });
  cyl(0.02, 0.28, [ax + 0.27, ay + 0.76, az - 0.08], METAL, [0.4, 0.6, 0.7], 5);
  box([0.06, 0.06, 0.06], [ax + 0.31, ay + 0.88, az - 0.0], ORANGE);
  // phased array panel
  box([0.05, 0.4, 0.4], [ax - 0.3, ay + 0.35, az + 0.2], METAL, [0, 0, 0]);
  const r = rng(5);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      box([0.03, 0.09, 0.09], [ax - 0.33, ay + 0.22 + i * 0.13, az + 0.07 + j * 0.13], r() > 0.5 ? STEEL : GLASS);
  box([0.1, 0.1, 0.1], [ax - 0.28, ay + 0.1, az + 0.2], HULL_DARK);
  // beacon
  cyl(0.08, 0.05, [ax + 0.25, ay + 0.06, az + 0.28], METAL, [0, 1, 0]);
  glow(b.part(new THREE.SphereGeometry(0.08, 8, 6), MAGENTA, { at: [ax + 0.25, ay + 0.15, az + 0.28] }), 1.8);
}
    return addFrontGrille;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addMuzzleFittings(b: Builder) {
  const BRASS = "#b8883a";
  const INSUL = "#d8d2c0";
  const DARKBOLT = "#15171b";

  const box = (size: number[], at: number[], color: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: rot });
  const cylZ = (r0: number, r1: number, h: number, at: number[], color: string, sides = 10) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, sides), color, { at, dir: [0, 0, 1] });

  const Y = 3.1;
  const Z0 = 5.85;
  const XR = 0.38; // rail x offset

  // flared guide rings: tapered frame around both rails, stacked toward the muzzle
  for (let i = 0; i < 3; i++) {
    const z = Z0 + 0.3 + i * 0.22;
    const w = 1.1 + i * 0.12;
    const h = 0.52 + i * 0.08;
    const t = 0.07;
    box([w, t, 0.1], [0, Y + h / 2, z], STEEL);
    box([w, t, 0.1], [0, Y - h / 2, z], STEEL);
    for (const s of [1, -1]) box([t, h, 0.1], [s * w / 2, Y, z], STEEL);
  }

  // bolted collar around the barrel base
  box([1.5, 0.08, 0.16], [0, Y + 0.34, Z0 - 0.15], METAL);
  box([1.5, 0.08, 0.16], [0, Y - 0.34, Z0 - 0.15], METAL);
  for (const s of [1, -1]) {
    box([0.1, 0.6, 0.16], [s * 0.7, Y, Z0 - 0.15], METAL);
    for (const y of [0.34, -0.34])
      for (const k of [-0.5, 0, 0.5]) cylZ(0.035, 0.035, 0.05, [s * 0.5 * 0 + k * 0.9 * (s > 0 ? 1 : 1), Y + y, Z0 - 0.05], DARKBOLT, 6);
  }
  for (const y of [0.15, -0.15])
    for (const s of [1, -1]) cylZ(0.04, 0.04, 0.05, [s * 0.7, Y + y, Z0 - 0.05], DARKBOLT, 6);

  // insulator clamps on each rail: ribbed ceramic discs plus brass clamp
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = Z0 + 0.25 + i * 0.1;
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), INSUL, { at: [s * XR, Y - 0.23, z], dir: [0, 1, 0] });
    }
    box([0.36, 0.06, 0.5], [s * XR, Y - 0.2, Z0 + 0.4], BRASS);
    box([0.06, 0.28, 0.5], [s * (XR + 0.17), Y - 0.04, Z0 + 0.4], BRASS);
    box([0.06, 0.28, 0.5], [s * (XR - 0.17), Y - 0.04, Z0 + 0.4], BRASS);
    box([0.36, 0.06, 0.5], [s * XR, Y + 0.2, Z0 + 0.4], BRASS);
    cylZ(0.03, 0.03, 0.04, [s * XR, Y + 0.24, Z0 + 0.5], DARKBOLT, 6);
    cylZ(0.03, 0.03, 0.04, [s * XR, Y + 0.24, Z0 + 0.3], DARKBOLT, 6);
    // rail end cap
    box([0.32, 0.34, 0.06], [s * XR, Y, Z0 + 0.62 + 0.0], METAL);
  }

  // glowing muzzle slit between the rails
  glow(box([0.3, 0.1, 0.06], [0, Y, Z0 + 0.66], CYAN), 1.8);
  glow(box([0.06, 0.1, 0.5], [0, Y, Z0 + 0.4], CYAN), 1.2);
  box([0.5, 0.05, 0.08], [0, Y + 0.09, Z0 + 0.66], METAL);
  box([0.5, 0.05, 0.08], [0, Y - 0.09, Z0 + 0.66], METAL);

  // top spine rail with warning chevrons
  box([0.2, 0.06, 0.9], [0, Y + 0.3, Z0 + 0.25], ORANGE);
  for (let i = 0; i < 3; i++) box([0.22, 0.02, 0.08], [0, Y + 0.335, Z0 + 0.0 + i * 0.25], METAL);

  // ceramic bead strip on the back of collar
  for (const s of [1, -1]) cylZ(0.05, 0.05, 0.2, [s * 0.55, Y + 0.38, Z0 - 0.3], BRASS, 6);
}
    return addMuzzleFittings;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addCapacitorVents(b: Builder) {
  const R = rng(24);
  const WARN = "#f2c21a";
  const box = (s: number[], at: number[], color: any, rot?: number[], tex?: THREE.Texture) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { at, rotation: rot, texture: tex });

  // ---------- capacitor bank: heat-sink fins on top (deck top y=3.07)
  const finPaint = paint((p, n) => {
    const t = noise(p, 0.12, 4);
    const base = mix("#2c3036", "#8a929c", 0.25 + 0.5 * t);
    return n.y > 0.5 ? mix(base, "#b8c0ca", 0.25) : base;
  });
  box([1.9, 0.06, 1.3], [0, 3.1, -3.3], METAL);
  for (let i = 0; i < 9; i++) {
    const x = -0.8 + i * 0.2;
    const h = 0.22 + 0.04 * (i % 2);
    box([0.05, h, 1.15], [x, 3.1 + h / 2, -3.3], finPaint);
    box([0.09, 0.03, 1.2], [x, 3.1 + h, -3.3], STEEL);
  }
  // spine brace across fins
  box([1.8, 0.05, 0.08], [0, 3.28, -3.3], METAL);
  box([1.8, 0.05, 0.08], [0, 3.28, -3.7], METAL);
  box([1.8, 0.05, 0.08], [0, 3.28, -2.9], METAL);

  // cables looping from the bank down to the hull deck
  for (const s of [1, -1]) {
    for (let k = 0; k < 2; k++) {
      const z = -3.55 + k * 0.5;
      const col = k === 0 ? ORANGE : METAL;
      const path = [
        [s * 0.95, 3.1, z],
        [s * 1.1, 3.4, z + 0.05],
        [s * 1.25, 3.3, z + 0.1],
        [s * 1.3, 2.9, z + 0.12],
        [s * 1.32, 2.2, z + 0.12],
      ];
      b.sweep(path, 0.045, { color: col, caps: "round", sides: 6 } as any);
      box([0.14, 0.1, 0.14], [s * 0.93, 3.12, z], STEEL);
      box([0.14, 0.1, 0.14], [s * 1.32, 2.2, z + 0.12], STEEL);
    }
  }

  // warning plate on rear face of the deck top
  const plate = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#f2c21a" stroke="#111" stroke-width="3"/>
    <path d="M32 6 L46 30 H18Z" fill="none" stroke="#111" stroke-width="3"/>
    <path d="M32 14 V23" stroke="#111" stroke-width="3"/><circle cx="32" cy="27" r="1.6" fill="#111"/>
    <path d="M4 36 L14 36 M50 36 L60 36" stroke="#111" stroke-width="3"/></svg>`,
    { size: 192 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.31), "#ffffff", {
    at: [0.55, 3.35, -2.48], dir: [0, 0, 1], axis: "z", texture: plate,
  });
  box([0.54, 0.35, 0.03], [0.55, 3.35, -2.5], METAL);
  // status lamps
  for (let i = 0; i < 3; i++)
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), i === 2 ? RED : CYAN, { at: [-0.7 + i * 0.15, 3.35, -2.48] }), 1.4);
  // rear bolts
  for (let i = 0; i < 6; i++)
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), STEEL, {
      at: [-0.9 + i * 0.36, 2.98, -4.12], dir: [0, 0, 1],
    });

  // ---------- left side stowage (x ~ +1.4, z from -1.9 to -0.5)
  const X = 1.4;
  const lock = (y: number, z: number) => {
    box([0.05, 0.1, 0.1], [X + 0.3, y, z], STEEL);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), ORANGE, { at: [X + 0.33, y, z], dir: [1, 0, 0] });
  };
  const crate = (y: number, z: number, h: number, w: number, color: string) => {
    box([0.3, h, w], [X + 0.15, y, z], color);
    box([0.32, 0.05, w + 0.04], [X + 0.15, y + h / 2, z], METAL);
    box([0.32, 0.05, w + 0.04], [X + 0.15, y - h / 2 + 0.02, z], METAL);
    box([0.04, h + 0.02, 0.05], [X + 0.31, y, z - w / 2 + 0.06], STEEL);
    box([0.04, h + 0.02, 0.05], [X + 0.31, y, z + w / 2 - 0.06], STEEL);
    lock(y + h * 0.15, z);
  };
  crate(0.85, -0.85, 0.3, 0.6, "#4a5238");
  crate(0.85, -1.5, 0.3, 0.6, "#4a5238");

  // rolled tarp above boxes
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 1.2, 8), "#6b7355", {
    at: [X + 0.15, 1.17, -1.2], dir: [0, 0, 1],
  });
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 8), "#3a3f2c", { at: [X + 0.15, 1.17, -1.2], dir: [0, 0, 1] });
  for (const z of [-1.65, -0.75]) {
    box([0.26, 0.04, 0.06], [X + 0.15, 1.17, z], METAL);
    box([0.04, 0.26, 0.06], [X + 0.16, 1.17, z], METAL);
  }

  // jerrycan pair
  const can = (z: number, c: string) => {
    box([0.16, 0.3, 0.3], [X + 0.1, 1.4, z], c);
    box([0.12, 0.05, 0.1], [X + 0.1, 1.58, z - 0.08], c);
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), METAL, { at: [X + 0.1, 1.63, z - 0.08] });
    box([0.18, 0.03, 0.28], [X + 0.1, 1.46, z], c === ORANGE ? "#b87a10" : "#333a2a");
    box([0.04, 0.02, 0.2], [X + 0.19, 1.4, z], METAL);
  };
  can(-1.6, "#4a5238");
  can(-1.2, ORANGE);

  // tool rack with bolts
  box([0.05, 0.28, 0.9], [X + 0.04, 1.4, -0.5 + 0.0 - 0.0 + 0.0 - 0.0 + 0.0 - 0.0 + 0.0 + 0.0 - 0.0 + 0.0 + 0.0 - 0.0 + 0.0], METAL);
  for (let i = 0; i < 4; i++) {
    const z = -0.8 + i * 0.22;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.4 - 0.05 * R(), 6), i % 2 ? STEEL : ORANGE, {
      at: [X + 0.12, 1.4, z], dir: [0, 1, 0.0],
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), STEEL, { at: [X + 0.08, 1.6, z], dir: [1, 0, 0] });
  }
}
    return addCapacitorVents;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addLegHydraulics(b: Builder) {
  const HOSE = "#15171a";
  const CHROME = "#c9d1da";
  const LAMP = "#7dff6a";
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  for (const s of [1, -1]) {
    for (const z of [1.5, -1.0]) {
      // leg runs from (s*1.5,1.45) to (s*2.85,0.3)
      const A = V(s * 1.5, 1.45, z);
      const B = V(s * 2.85, 0.3, z);
      const at = (t: number, dz = 0, dy = 0) =>
        V(A.x + (B.x - A.x) * t, A.y + (B.y - A.y) * t + dy, z + dz);
      const dir = B.clone().sub(A).normalize();

      // piston collars in STEEL
      for (const t of [0.22, 0.62]) {
        b.part(new THREE.CylinderGeometry(0.23, 0.23, 0.14, 10), STEEL, { at: at(t), dir: dir.toArray() });
        b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 10), CHROME, { at: at(t + 0.05), dir: dir.toArray() });
      }
      // orange warning bands
      for (const t of [0.35, 0.42, 0.78]) {
        b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10), ORANGE, { at: at(t), dir: dir.toArray() });
      }
      // chrome piston rod near the pad
      b.rod(at(0.62), at(0.92), 0.06, CHROME);

      // hose pair on the front and rear sides
      for (const d of [0.3, -0.3]) {
        const p0 = at(0.15, d, 0.1);
        const p1 = at(0.45, d * 1.4, 0.32);
        const p2 = at(0.8, d, 0.1);
        b.sweep([p0.toArray(), p1.toArray(), p2.toArray()], 0.04, { color: HOSE });
        for (const p of [p0, p2]) {
          b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 6), STEEL, { at: p, dir: dir.toArray() });
        }
      }

      // pad indicator lamp
      const lampPos = V(s * 2.9, 0.34, z + 0.38);
      b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 8), METAL, { at: V(s * 2.9, 0.3, z + 0.4) });
      glow(b.part(new THREE.SphereGeometry(0.075, 8, 6), LAMP, { at: lampPos }), 1.6);

      // pad rim bolts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), STEEL, {
          at: V(s * 2.9 + Math.cos(a) * 0.4, 0.24, z + Math.sin(a) * 0.4),
        });
      }
    }
  }
}
    return addLegHydraulics;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addSensorDome(b: Builder) {
  const LENS = "#0c2a38";
  const RUBBER = "#222428";

  const box = (size: number[], at: number[], color: string, rot?: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: rot, name });
  const cyl = (r: number, h: number, at: number[], color: string, dir: number[] = [0, 1, 0], sides = 10, name?: string) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { at, dir, name });

  // ---------- sensor dome (turret roof, right) ----------
  const cx = -0.8, cy = 3.09, cz = -0.4;
  cyl(0.28, 0.06, [cx, cy, cz], METAL, [0, 1, 0], 10, "sensorBase");
  cyl(0.22, 0.14, [cx, cy + 0.09, cz], HULL_DARK, [0, 1, 0], 10, "sensorPedestal");
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    cyl(0.02, 0.05, [cx + Math.cos(a) * 0.25, cy + 0.04, cz + Math.sin(a) * 0.25], STEEL, [0, 1, 0], 6);
  }
  // dome (upper hemisphere)
  b.part(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), PLATE, {
    at: [cx, cy + 0.16, cz], name: "sensorDome",
  });
  // shroud brow over lens, facing forward (+Z)
  box([0.34, 0.05, 0.14], [cx, cy + 0.3, cz + 0.17], METAL, [-18, 0, 0], "sensorShroud");
  for (const s of [1, -1]) box([0.04, 0.16, 0.14], [cx + s * 0.16, cy + 0.24, cz + 0.15], METAL, [0, 0, 0]);
  // lens
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), GLASS, {
    at: [cx, cy + 0.24, cz + 0.2], dir: [0, 0.25, 1], name: "sensorLens",
  });
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 12), RUBBER, {
    at: [cx, cy + 0.24, cz + 0.17], dir: [0, 0.25, 1],
  });
  glow(
    b.part(new THREE.SphereGeometry(0.05, 8, 6), CYAN, { at: [cx, cy + 0.25, cz + 0.235], name: "sensorEye" }),
    1.8,
  );
  // small side sensors
  for (const s of [1, -1]) {
    cyl(0.03, 0.08, [cx + s * 0.2, cy + 0.2, cz + 0.02], LENS, [s, 0, 0], 6);
    glow(cyl(0.015, 0.02, [cx + s * 0.25, cy + 0.2, cz + 0.02], CYAN, [s, 0, 0], 6), 1.2);
  }
  // little antenna stub
  b.rod([cx - 0.1, cy + 0.3, cz - 0.1], [cx - 0.12, cy + 0.55, cz - 0.14], 0.012, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), MAGENTA, { at: [cx - 0.12, cy + 0.56, cz - 0.14] }), 1.5);

  // ---------- rear ladder and tow hitch ----------
  const zr = -4.36;
  // side rails
  for (const s of [1, -1]) {
    box([0.07, 1.1, 0.07], [s * 0.4, 1.45, zr - 0.06], STEEL, undefined, "ladderRail");
    // standoff brackets
    for (const y of [1.0, 1.9]) box([0.07, 0.07, 0.16], [s * 0.4, y, zr + 0.02], METAL);
  }
  // rungs
  for (let i = 0; i < 6; i++) {
    cyl(0.025, 0.8, [0, 0.98 + i * 0.19, zr - 0.06], STEEL, [1, 0, 0], 6, "ladderRung");
  }
  // hand grip at top
  for (const s of [1, -1]) box([0.06, 0.06, 0.2], [s * 0.3, 2.08, zr - 0.1], ORANGE);
  cyl(0.035, 0.6, [0, 2.08, zr - 0.2], ORANGE, [1, 0, 0], 6, "handGrip");

  // anti-slip step plate
  box([0.9, 0.05, 0.3], [0, 0.88, zr - 0.12], METAL, undefined, "stepPlate");
  for (let i = 0; i < 5; i++) box([0.06, 0.02, 0.22], [-0.3 + i * 0.15, 0.915, zr - 0.12], STEEL);

  // tow hitch
  box([0.3, 0.2, 0.3], [0, 0.95 + 0.2, zr - 0.05], METAL, undefined, "hitchMount").position.y += 0;
  box([0.34, 0.1, 0.4], [0, 0.78, zr - 0.08], METAL, undefined, "hitchBar");
  cyl(0.05, 0.12, [0, 0.88, zr - 0.2], STEEL, [0, 1, 0], 8);
  b.part(new THREE.SphereGeometry(0.075, 8, 6), STEEL, { at: [0, 0.97, zr - 0.2], name: "hitchBall" });
  // safety chain loops
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), STEEL, { at: [s * 0.2, 0.8, zr - 0.05], dir: [0, 0, 1], axis: "z" });
  }

  // tail lights, red glow, with housings and grilles
  for (const s of [1, -1]) {
    box([0.32, 0.22, 0.08], [s * 0.95, 1.55, zr + 0.0], METAL, undefined, "tailLightHousing");
    glow(box([0.26, 0.16, 0.04], [s * 0.95, 1.55, zr - 0.05], RED, undefined, "tailLight"), 1.6);
    for (let i = 0; i < 3; i++) box([0.28, 0.015, 0.02], [s * 0.95, 1.5 + i * 0.05, zr - 0.075], METAL);
    // warning chevron strip
    box([0.32, 0.05, 0.03], [s * 0.95, 1.38, zr - 0.02], ORANGE);
  }
  // number plate with drawn unit marking
  const plate = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#d8dccb"/><rect x="1.5" y="1.5" width="61" height="21" fill="none" stroke="#2c3036" stroke-width="1.5"/><text x="32" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#2c3036">RC-06</text></svg>`,
    { size: 192 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.15), "#ffffff", {
    at: [0, 1.38, zr - 0.012], dir: [0, 0, -1], axis: "z", texture: plate, name: "unitPlate",
  });
  // rear reflectors
  for (const s of [1, -1]) cyl(0.04, 0.02, [s * 0.55, 1.18, zr - 0.01], ORANGE, [0, 0, -1], 6);
}
    return addSensorDome;
  })(),
);
