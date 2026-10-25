import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, cells, mix } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = { name: "Railgun Carrier", description: "Six-wheeled railgun carrier braced on stabiliser legs, low-poly sci-fi military." };

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Slim light bar across the cab roof: housing, four lamps alternating CYAN and AMBER, brackets.", at: [0, 2.55, 3.3], normal: [0, 1, 0], bone: null, room: [1.8, 0.25, 0.4] },
  { id: "railMuzzle", kind: "add", part: "barrel", what: "Muzzle brake: flared collar, side vents and glowing CYAN coil rings around the barrel tip.", at: [0, 3.0, 8.8], normal: [0, 0, 1], bone: null, room: [0.8, 0.8, 1.2] },
  { id: "railCoils", kind: "add", part: "barrel", what: "Series of CYAN glowing accelerator coil rings with dark brackets along the barrel.", at: [0, 3.0, 5.5], normal: [0, 1, 0], bone: null, room: [0.7, 0.7, 4] },
  { id: "cabGrille", kind: "add", part: "cab", what: "Armoured front grille with horizontal slats and two headlamps in AMBER glow.", at: [0, 1.4, 4.65], normal: [0, 0, 1], bone: null, room: [1.8, 0.8, 0.2] },
  { id: "antennaArray", kind: "add", part: "hull", what: "Antenna array: two whip antennas and a small radar dish with base on rear deck.", at: [-1.0, 2.3, -2.5], normal: [0, 1, 0], bone: null, room: [0.8, 1.5, 0.8] },
  { id: "padFittings", kind: "add", part: "legPads", what: "Hydraulic piston details, hazard stripes and bolts on four stabiliser legs.", at: [1.9, 0.5, 0], normal: [1, 0, 0], bone: null, room: [0.6, 1, 1] },
  { id: "exhaustStacks", kind: "add", part: "hull", what: "Twin exhaust stacks with caps behind the cab.", at: [1.0, 2.4, 2.2], normal: [0, 1, 0], bone: null, room: [0.5, 0.8, 0.5] },
  { id: "sideLights", kind: "add", part: "hull", what: "Row of small marker lights and tool boxes along each hull side.", at: [1.45, 1.4, 0], normal: [1, 0, 0], bone: null, room: [0.3, 0.4, 6] },
  { id: "hullCamo", kind: "texture", part: "hull", what: "Digital camo in HULL and HULL_DARK on hull top and sides, with a faded unit number near the rear." },
  { id: "cabMarks", kind: "texture", part: "cab", what: "Windscreen glass gradient and a white emblem plus stencilled serial on the cab doors." },
  { id: "railPanel", kind: "texture", part: "railHousing", what: "Riveted panel seams and warning chevrons in HAZARD on the railgun housing." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const HULL = "#59664a", HULL_DARK = "#3d4734", METAL = "#2c3036", STEEL = "#6b727c", GLASS = "#3b6c80";
const TIRE = "#16171a", RIM = "#8a9099", HAZARD = "#e0b020", CYAN = "#40e8ff", AMBER = "#ffb040";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, name, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], dir: number[], seg = 8, name?: string) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, dir, name });

  const camo = paint((p, n) => {
    const c = cells(p, 0.35, 3);
    const nz = noise(p, 0.9, 5);
    let col: string | readonly number[] = nz + 0.25 * (c.id - 0.5) > 0.5 ? HULL_DARK : HULL;
    if (c.id > 0.88) col = "#7a8660";
    // faded unit number "07" near the rear on the sides
    if (Math.abs(n.x) > 0.7 && p.z < -3 && p.z > -3.9 && p.y > 1.2 && p.y < 1.8) {
      const u = (p.z + 3.9) / 0.9 * (n.x > 0 ? -1 : 1) + (n.x > 0 ? 1 : 0);
      const v = (p.y - 1.2) / 0.6;
      const bar = (Math.abs(u - 0.25) < 0.05 && v > 0.1 && v < 0.9) || (Math.abs(u - 0.75) < 0.05 && v > 0.1 && v < 0.9) ||
        (u > 0.1 && u < 0.4 && (v < 0.17 || v > 0.83) && v > 0.1 && v < 0.9) || (u > 0.6 && u < 0.9 && (v < 0.17 || v > 0.83));
      if (bar) return mix(col as string, "#d8d8c8", 0.6);
    }
    return col as string;
  });
  const cabPaint = paint((p, n) => {
    if (Math.abs(n.x) > 0.7 && p.y > 1.3 && p.y < 1.95 && Math.abs(p.z - 3.7) < 0.8) {
      const dz = p.z - 3.2, dy = p.y - 1.65;
      const r = Math.hypot(dz, dy);
      if (r < 0.2 && r > 0.15) return "#f0f0e8";
      if (r < 0.1 && Math.abs(dz) < 0.05) return "#f0f0e8";
      if (r < 0.1 && Math.abs(dy) < 0.04) return "#f0f0e8";
      if (p.z > 3.85 && p.z < 4.4 && Math.abs(p.y - 1.6) < 0.05) return "#e8e8e0";
      if (p.z > 3.85 && p.z < 4.4 && Math.abs(p.y - 1.78) < 0.03) return "#e8e8e0";
    }
    return noise(p, 1.2, 8) > 0.55 ? HULL_DARK : HULL;
  });
  const glassPaint = paint((p) => mix("#7fb8cc", "#1f4658", Math.min(Math.max((2.25 - p.y) / 0.5, 0), 1)));
  const railPaint = paint((p, n) => {
    const seam = (v: number, s: number) => Math.abs(((v / s) % 1 + 1) % 1 - 0.5) > 0.47;
    const a = Math.abs(n.y) > 0.7 ? [p.x, p.z] : Math.abs(n.x) > 0.7 ? [p.z, p.y] : [p.x, p.y];
    if (Math.abs(n.x) > 0.7 || Math.abs(n.y) > 0.7) {
      const t = (a[0] + a[1] * 0.0 + a[1]) / 0.4;
      if (Math.abs(n.x) > 0.7 && Math.abs(p.y - 2.6) < 0.2 && ((t % 1) + 1) % 1 < 0.5) return HAZARD;
    }
    if (seam(a[0], 0.65) || seam(a[1], 0.5)) return "#1a1d20";
    const rv = Math.hypot(((a[0] / 0.65) % 1 + 1) % 1 - 0.5, 0) < 0.02 ? "#9aa0a8" : null;
    return rv ?? (noise(p, 0.6, 2) > 0.5 ? HULL : "#516042");
  });

  // chassis
  box(3.0, 0.5, 9.0, METAL, [0, 0.9, 0], "chassis");
  box(2.8, 0.9, 6.0, camo as unknown as string, [0, 1.5, -1.2], "hull");
  box(2.9, 0.12, 6.1, HULL_DARK, [0, 1.98, -1.2], "hullTop");
  // sloped front hull
  box(2.8, 0.9, 1.2, HULL, [0, 1.4, 2.6], "hullFront", [-12, 0, 0]);
  // cab
  box(2.6, 1.2, 1.8, cabPaint as unknown as string, [0, 1.75, 3.7], "cab");
  box(2.4, 0.5, 0.1, glassPaint as unknown as string, [0, 2.0, 4.62], "windscreen", [-18, 0, 0]);
  box(0.1, 0.45, 1.2, GLASS, [1.31, 2.0, 3.7]);
  box(0.1, 0.45, 1.2, GLASS, [-1.31, 2.0, 3.7]);
  box(2.7, 0.15, 1.9, HULL_DARK, [0, 2.4, 3.7]);
  box(2.9, 0.4, 0.5, METAL, [0, 0.75, 4.7], "bumper");
  // fenders
  for (const s of [1, -1]) box(0.5, 0.12, 8, HULL_DARK, [s * 1.55, 1.2, 0.3], "fender");

  // wheels
  const zs = [3.3, 0.3, -2.7];
  for (const s of [1, -1]) for (const z of zs) {
    const x = s * 1.7;
    cyl(0.75, 0.75, 0.6, TIRE, [x, 0.75, z], [1, 0, 0], 10, "tire");
    cyl(0.45, 0.45, 0.64, RIM, [x, 0.75, z], [1, 0, 0], 8, "rim");
    cyl(0.15, 0.15, 0.7, METAL, [x + s * 0.02, 0.75, z], [1, 0, 0], 6, "hub");
    cyl(0.1, 0.1, 1.0, STEEL, [s * 1.0, 0.7, z], [1, 0, 0], 6, "axle");
  }

  // stabiliser legs (deployed), 4 corners
  for (const s of [1, -1]) for (const z of [2.0, -3.4]) {
    box(0.4, 0.3, 0.4, METAL, [s * 1.65, 0.9, z], "legMount");
    b.rod([s * 1.7, 0.9, z], [s * 2.5, 0.35, z], 0.14, STEEL, { name: "legStrut" });
    cyl(0.1, 0.1, 0.9, STEEL, [s * 2.5, 0.5, z], [0, 1, 0], 6, "piston");
    b.part(new THREE.CylinderGeometry(0.5, 0.6, 0.12, 8), METAL, { at: [s * 2.5, 0.06, z], name: "legPads" });
    box(0.3, 0.05, 0.3, HAZARD, [s * 2.5, 0.14, z]);
  }

  // railgun mount + housing
  cyl(1.0, 1.1, 0.25, METAL, [0, 2.1, -1.5], [0, 1, 0], 12, "turretRing");
  box(1.7, 0.7, 2.6, railPaint as unknown as string, [0, 2.6, -1.5], "railHousing");
  box(1.5, 0.12, 2.4, HULL_DARK, [0, 3.0, -1.5]);
  for (const s of [1, -1]) {
    box(0.2, 0.9, 1.4, HULL_DARK, [s * 0.95, 2.6, -1.5], "cheek");
    box(0.3, 0.25, 6.0, STEEL, [s * 0.35, 2.95, 2.8], "railRail");
  }
  // barrel
  cyl(0.28, 0.28, 8.6, METAL, [0, 3.05, 3.2], [0, 0, 1], 8, "barrel");
  cyl(0.38, 0.38, 1.0, STEEL, [0, 3.05, 7.6], [0, 0, 1], 8, "barrelSleeve");
  cyl(0.45, 0.35, 0.5, METAL, [0, 3.05, 8.3], [0, 0, 1], 8, "muzzle");
  box(1.3, 0.6, 0.6, METAL, [0, 2.9, 0.2]);
  // rear
  box(2.8, 0.4, 0.4, METAL, [0, 1.0, -4.7], "rearBeam");
  for (const s of [1, -1]) box(0.3, 0.2, 0.1, "#c02020", [s * 1.1, 1.3, -4.52]);
  // cab lights
  for (const s of [1, -1]) box(0.3, 0.2, 0.1, AMBER, [s * 0.9, 1.3, 4.65]);
  // ammo bins
  for (const s of [1, -1]) box(0.5, 0.6, 1.8, HULL_DARK, [s * 1.2, 2.3, -3.6]);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const DARKMETAL = "#1b1d22";
  const LENS_C = "#9defff";
  const LENS_A = "#ffd08a";
  const y0 = 2.55;
  const z0 = 3.3;

  // housing: main bar with end caps and lower flange
  b.part(new THREE.BoxGeometry(1.8, 0.14, 0.3), DARKMETAL, { at: [0, y0 + 0.17, z0], name: "lightBarHousing" });
  b.part(new THREE.BoxGeometry(1.86, 0.04, 0.34), METAL, { at: [0, y0 + 0.09, z0], name: "lightBarFlange" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.08, 0.2, 0.34), STEEL, { at: [s * 0.92, y0 + 0.17, z0], name: "lightBarCap" });
    // brackets: two feet per side bolted to the roof
    for (const dx of [0.62, 0.3]) {
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.22), METAL, { at: [s * dx * 1.2, y0 + 0.04, z0], name: "lightBarBracket" });
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), STEEL, {
        at: [s * dx * 1.2, y0 + 0.1, z0 + 0.07],
        name: "lightBarBolt",
      });
    }
  }

  // four lamps alternating cyan / amber, with dark bezels and glowing lenses
  const xs = [-0.63, -0.21, 0.21, 0.63];
  xs.forEach((x, i) => {
    const cyan = i % 2 === 0;
    b.part(new THREE.BoxGeometry(0.36, 0.17, 0.05), DARKMETAL, { at: [x, y0 + 0.17, z0 + 0.15], name: "lampBezel" });
    const lens = b.part(new THREE.BoxGeometry(0.3, 0.11, 0.04), cyan ? CYAN : AMBER, {
      at: [x, y0 + 0.17, z0 + 0.17],
      name: "lampLens",
    });
    glow(lens, 1.6);
    // lens ribs
    for (const dx of [-0.07, 0.0, 0.07]) {
      b.part(new THREE.BoxGeometry(0.012, 0.11, 0.012), cyan ? LENS_C : LENS_A, {
        at: [x + dx, y0 + 0.17, z0 + 0.195],
        name: "lampRib",
      });
    }
    // rear-facing small lamp on back face
    glow(
      b.part(new THREE.BoxGeometry(0.16, 0.05, 0.03), cyan ? CYAN : AMBER, {
        at: [x, y0 + 0.17, z0 - 0.155],
        name: "lampRear",
      }),
      1.2,
    );
  });

  // top fins between lamps
  for (const x of [-0.42, 0, 0.42]) {
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.26), HULL_DARK, { at: [x, y0 + 0.27, z0], name: "lightBarFin" });
  }
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addRailMuzzle(b: Builder) {
  const DARK = "#1a1d22";
  const Z0 = 8.55; // barrel tip region: barrel runs to z=7.5..8.55, muzzle to 8.55
  const Y = 3.05;
  const cyl = (rt: number, rb: number, h: number, c: string, z: number, seg = 8, name?: string) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [0, Y, z], dir: [0, 0, 1], name });

  // flared collar: wide ring stepping out to the brake body
  cyl(0.5, 0.42, 0.18, METAL, 8.45, 8, "muzzleCollar");
  cyl(0.62, 0.5, 0.3, STEEL, 8.65, 8, "muzzleFlare");
  cyl(0.6, 0.6, 0.45, METAL, 9.0, 8, "brakeBody");
  cyl(0.66, 0.62, 0.12, STEEL, 9.28, 8, "brakeLip");
  // dark bore at the front
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 8), DARK, { at: [0, Y, 9.36], dir: [0, 0, 1], name: "bore" });

  // glowing coil rings around the barrel tip
  for (const z of [7.2, 7.55, 8.0]) {
    glow(b.part(new THREE.TorusGeometry(0.42, 0.045, 5, 12), CYAN, { at: [0, Y, z], name: "muzzleCoil" }), 1.6);
  }
  // front glowing ring between flare and brake
  glow(b.part(new THREE.TorusGeometry(0.6, 0.05, 5, 12), CYAN, { at: [0, Y, 8.82], name: "muzzleGlow" }), 1.8);

  // side vents: dark slots on both sides and top of the brake body
  for (const s of [1, -1]) {
    for (const z of [8.88, 9.02, 9.16]) {
      b.part(new THREE.BoxGeometry(0.06, 0.28, 0.07), DARK, { at: [s * 0.6, Y, z], name: "vent" });
    }
    b.part(new THREE.BoxGeometry(0.1, 0.36, 0.5), STEEL, { at: [s * 0.62, Y, 9.02], name: "ventFrame" });
  }
  for (const z of [8.9, 9.1]) {
    b.part(new THREE.BoxGeometry(0.28, 0.06, 0.07), DARK, { at: [0, Y + 0.6, z], name: "ventTop" });
  }
  // hazard bands on the brake
  b.part(new THREE.CylinderGeometry(0.615, 0.615, 0.06, 8), HAZARD, { at: [0, Y, 8.72], dir: [0, 0, 1], name: "hazardBand" });

  // bolts around the collar
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 5), DARK, {
      at: [Math.cos(a) * 0.52, Y + Math.sin(a) * 0.52, 8.82],
      dir: [0, 0, 1],
      name: "bolt",
    });
  }
  // glowing slits flanking the bore
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.05, 0.2, 0.04), CYAN, { at: [s * 0.4, Y, 9.37], name: "boreGlow" }), 1.5);
  }
}
    return addRailMuzzle;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addRailCoils(b: Builder) {
  const DARK = "#1c1f24";
  const BRASS = "#a8844a";
  const BOLT = "#9aa0a8";

  // ---------- Rail coils along the barrel (barrel axis y=3.05, z 3.2 +- 4.3) ----------
  const coilZs = [3.9, 4.6, 5.3, 6.0, 6.7];
  for (const z of coilZs) {
    const ring = b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 12), CYAN, {
      at: [0, 3.05, z], dir: [0, 0, 1], name: "coilRing",
    });
    glow(ring, 1.6);
    // dark flanges each side of the ring
    for (const d of [-0.13, 0.13]) {
      b.part(new THREE.CylinderGeometry(0.54, 0.54, 0.06, 12), DARK, {
        at: [0, 3.05, z + d], dir: [0, 0, 1], name: "coilFlange",
      });
    }
    // brackets: top, and two sides, bolted to barrel
    for (const a of [90, 210, 330]) {
      const r = (a * Math.PI) / 180;
      const x = Math.cos(r) * 0.42, y = Math.sin(r) * 0.42;
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.34), DARK, {
        at: [x * 0.8, 3.05 + y * 0.8, z], rotation: [0, 0, a - 90], name: "coilBracket",
      });
      b.part(new THREE.SphereGeometry(0.035, 5, 4), BOLT, {
        at: [x * 1.12, 3.05 + y * 1.12, z + 0.1], name: "coilBolt",
      });
    }
  }
  // connecting cable spine running along the top of the coils
  b.rod([0, 3.62, 3.7], [0, 3.62, 6.9], 0.04, BRASS, { name: "coilCable" });
  for (const z of coilZs) {
    b.part(new THREE.BoxGeometry(0.12, 0.1, 0.12), BRASS, { at: [0, 3.58, z], name: "cableClamp" });
  }
  // thin glowing capacitor strips between coils
  for (const z of [4.25, 4.95, 5.65, 6.35]) {
    glow(b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.1, 8), CYAN, {
      at: [0, 3.05, z], dir: [0, 0, 1], name: "coilGap",
    }), 0.9);
  }

  // ---------- Armoured front grille on the cab (front face z ~ 4.6) ----------
  const gz = 4.74;
  // frame
  b.part(new THREE.BoxGeometry(1.9, 0.82, 0.1), DARK, { at: [0, 1.4, gz - 0.04], name: "grilleBack" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.9, 0.16), METAL, { at: [s * 0.95, 1.4, gz], name: "grilleFrame" });
  }
  b.part(new THREE.BoxGeometry(2.0, 0.1, 0.16), METAL, { at: [0, 1.84, gz], name: "grilleFrame" });
  b.part(new THREE.BoxGeometry(2.0, 0.1, 0.16), METAL, { at: [0, 0.96, gz], name: "grilleFrame" });
  // horizontal slats, slightly angled
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.BoxGeometry(1.5, 0.07, 0.12), STEEL, {
      at: [0, 1.1 + i * 0.14, gz + 0.04], rotation: [-15, 0, 0], name: "grilleSlat",
    });
  }
  // central badge
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.06), HAZARD, { at: [0, 1.4, gz + 0.1], rotation: [0, 0, 45], name: "grilleBadge" });
  // headlamps (amber glow) with bezels and visors
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10), DARK, { at: [s * 0.62, 1.5, gz + 0.04], dir: [0, 0, 1], name: "lampBezel" });
    glow(b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 10), AMBER, {
      at: [s * 0.62, 1.5, gz + 0.09], dir: [0, 0, 1], name: "headlamp",
    }), 1.8);
    b.part(new THREE.BoxGeometry(0.42, 0.05, 0.16), DARK, { at: [s * 0.62, 1.73, gz + 0.1], name: "lampVisor" });
    // corner bolts
    for (const dy of [-0.38, 0.38]) {
      b.part(new THREE.SphereGeometry(0.03, 5, 4), BOLT, { at: [s * 0.95, 1.4 + dy, gz + 0.09], name: "grilleBolt" });
    }
  }
  // tow hooks beneath
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.07, 0.025, 5, 8), HAZARD, { at: [s * 0.8, 0.82, 4.98], name: "towHook" });
  }
}

const CYAN = "#40e8ff", AMBER = "#ffb040", HAZARD = "#e0b020", METAL = "#2c3036", STEEL = "#6b727c";
    return addRailCoils;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addAntennaArray(b: Builder) {
  const DARK = "#1c1f24";
  const WHITE = "#cfd4d8";
  const RED = "#d02828";
  const bx = -1.0, by = 2.3, bz = -2.5;

  // base plate with bolts
  b.part(new THREE.BoxGeometry(0.8, 0.1, 0.8), METAL, { at: [bx, by + 0.05, bz], name: "antPlate" });
  for (const sx of [1, -1]) for (const sz of [1, -1])
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), STEEL, { at: [bx + sx * 0.32, by + 0.12, bz + sz * 0.32], name: "antBolt" });

  // whip antennas: mount, tapered mast, tip ball
  const whips: [number, number, number, number][] = [
    [-0.25, -0.25, 1.45, 6],
    [0.25, -0.25, 1.1, -5],
  ];
  for (const [ox, oz, h, tilt] of whips) {
    const x = bx + ox, z = bz + oz;
    b.part(new THREE.CylinderGeometry(0.09, 0.12, 0.2, 8), DARK, { at: [x, by + 0.2, z], name: "whipBase" });
    b.part(new THREE.CylinderGeometry(0.012, 0.03, h, 6), STEEL, {
      at: [x, by + 0.3 + h / 2, z], rotation: [0, 0, tilt], name: "whip",
    });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, {
      at: [x - Math.sin((tilt * Math.PI) / 180) * h * 0.5, by + 0.3 + h, z], name: "whipTip",
    });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), HAZARD, { at: [x, by + 0.45, z], name: "whipBand" });
  }

  // radar dish on a pedestal
  const dx = bx + 0.1, dz = bz + 0.2;
  b.part(new THREE.CylinderGeometry(0.12, 0.16, 0.3, 8), DARK, { at: [dx, by + 0.25, dz], name: "radarPedestal" });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 10), METAL, { at: [dx, by + 0.44, dz], name: "radarSwivel" });
  b.part(new THREE.BoxGeometry(0.06, 0.2, 0.06), STEEL, { at: [dx, by + 0.58, dz], name: "radarYoke" });
  // dish: hemisphere cap facing forward and up
  const dish = new THREE.SphereGeometry(0.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.4);
  b.part(dish, WHITE, {
    at: [dx, by + 0.72, dz], rotation: [55, 0, 0], name: "radarDish", flat: true,
  });
  // feed arm and horn
  b.rod([dx, by + 0.72, dz], [dx, by + 0.95, dz + 0.25], 0.012, STEEL, { name: "radarFeedArm" });
  b.part(new THREE.ConeGeometry(0.04, 0.09, 6), DARK, {
    at: [dx, by + 0.97, dz + 0.27], rotation: [-100, 0, 0], name: "radarHorn",
  });

  // cable run
  b.rod([bx - 0.25, by + 0.1, bz - 0.25], [bx + 0.3, by + 0.1, bz + 0.3], 0.02, DARK, { name: "antCable" });
}
    return addAntennaArray;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addPadFittings(b: Builder) {
  const DARK_HAZ = "#2a2a2a";
  const CHROME = "#b8c0c8";
  const OIL = "#1c1410";
  const BOLT = "#9aa0a8";
  const legZs = [2.0, -3.4];

  for (const s of [1, -1]) {
    for (const z of legZs) {
      const x = s * 2.5;

      // pad hazard stripes: alternating blocks around the pad rim
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const px = x + Math.cos(a) * 0.52;
        const pz = z + Math.sin(a) * 0.52;
        b.part(new THREE.BoxGeometry(0.2, 0.06, 0.12), i % 2 ? HAZARD : DARK_HAZ, {
          at: [px, 0.16, pz],
          rotation: [0, (-a * 180) / Math.PI, 0],
          name: "padStripe",
        });
      }

      // pad bolts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), BOLT, {
          at: [x + Math.cos(a) * 0.3, 0.2, z + Math.sin(a) * 0.3],
          name: "padBolt",
        });
      }

      // piston: outer sleeve, chrome rod, collars
      b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 8), STEEL, { at: [x, 0.75, z], name: "pistonSleeve" });
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 8), CHROME, { at: [x, 0.38, z], name: "pistonRod" });
      for (const y of [0.52, 1.0]) {
        b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.06, 8), METAL, { at: [x, y, z], name: "pistonCollar" });
      }
      // hazard band on sleeve
      b.part(new THREE.CylinderGeometry(0.185, 0.185, 0.08, 8), HAZARD, { at: [x, 0.85, z], name: "sleeveBand" });
      b.part(new THREE.CylinderGeometry(0.188, 0.188, 0.08, 8), DARK_HAZ, { at: [x, 0.72, z], name: "sleeveBand" });

      // hydraulic hose from sleeve to mount
      b.rod([x - s * 0.17, 0.95, z + 0.05], [s * 1.8, 0.95, z + 0.05], 0.035, OIL, { name: "hose" });
      b.part(new THREE.SphereGeometry(0.06, 6, 4), METAL, { at: [x - s * 0.17, 0.95, z + 0.05], name: "hoseFitting" });

      // diagonal brace
      b.rod([s * 1.9, 0.75, z - 0.18], [x - s * 0.12, 0.45, z - 0.18], 0.05, STEEL, { name: "brace" });

      // bolts on mount plate
      for (const dz of [-0.15, 0.15]) {
        for (const dy of [-0.1, 0.1]) {
          b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), BOLT, {
            at: [s * 1.86, 0.9 + dy, z + dz],
            dir: [s, 0, 0],
            name: "mountBolt",
          });
        }
      }
    }
  }
}
    return addPadFittings;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addExhaustStacks(b: Builder) {
  const SOOT = "#1a1b1e";
  const WHITE = "#d8dce0";
  const BOLT = "#9aa0a8";
  const RED = "#c02020";

  const part = (g: THREE.BufferGeometry, c: string, at: number[], name: string, dir?: number[]) =>
    b.part(g, c, { at, name, dir });

  // Twin exhaust stacks behind the cab, on the hull top (y ~2.04)
  for (const s of [1, -1]) {
    const x = s * 1.0;
    const z = 2.2;
    part(new THREE.CylinderGeometry(0.26, 0.3, 0.1, 8), METAL, [x, 2.09, z], "stackBase");
    part(new THREE.CylinderGeometry(0.16, 0.18, 0.7, 8), STEEL, [x, 2.45, z], "stackPipe");
    // clamp bands
    for (const y of [2.27, 2.6]) part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8), METAL, [x, y, z], "stackBand");
    // angled cap
    part(new THREE.CylinderGeometry(0.2, 0.17, 0.1, 8), METAL, [x, 2.84, z], "stackCap");
    part(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 8), SOOT, [x, 2.9, z], "stackMouth");
    // heat shield plate facing cab
    part(new THREE.BoxGeometry(0.3, 0.45, 0.04), HULL_DARK, [x, 2.4, z + 0.24], "heatShield");
    // bolts on base
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), BOLT, [x + Math.cos(a) * 0.23, 2.17, z + Math.sin(a) * 0.23], "stackBolt");
    }
  }

  // Side marker lights and tool boxes along each hull side (hull side x = 1.4)
  for (const s of [1, -1]) {
    const x = s * 1.43;
    const lights = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.3];
    lights.forEach((z, i) => {
      const col = i === 0 ? RED : i === lights.length - 1 ? AMBER : i % 2 ? AMBER : CYAN;
      part(new THREE.BoxGeometry(0.06, 0.1, 0.18), METAL, [x, 1.78, z], "markerBezel");
      part(new THREE.BoxGeometry(0.05, 0.07, 0.14), col, [x + s * 0.03, 1.78, z], "markerLamp");
    });
    // tool boxes
    const boxes: [number, number][] = [[-2.8, 0.9], [-0.4, 1.1], [1.6, 0.8]];
    for (const [z, len] of boxes) {
      part(new THREE.BoxGeometry(0.22, 0.38, len), HULL_DARK, [x + s * 0.11, 1.35, z], "toolBox");
      part(new THREE.BoxGeometry(0.24, 0.05, len + 0.04), METAL, [x + s * 0.11, 1.56, z], "toolLid");
      part(new THREE.BoxGeometry(0.06, 0.06, 0.22), STEEL, [x + s * 0.24, 1.4, z], "toolHandle");
      for (const e of [-1, 1]) part(new THREE.BoxGeometry(0.04, 0.1, 0.05), HAZARD, [x + s * 0.23, 1.5, z + e * (len / 2 - 0.1)], "toolLatch");
    }
    // grab rail under the lights
    part(new THREE.BoxGeometry(0.05, 0.05, 1.2), STEEL, [x + s * 0.08, 1.72, -1.0], "grabRail");
    part(new THREE.BoxGeometry(0.05, 0.05, 1.2), WHITE, [x + s * 0.08, 1.12, 1.0], "stripe");
  }
}
    return addExhaustStacks;
  })(),
);
