import * as THREE from "three";
import { type Builder, createBuilder, paint, mix, noise, smoothstep, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler guarding a sealed cargo pod.",
};

// ---- palette (top level, stage 2 may use these by name)
export const HULL = "#3b4452";
export const HULL_DARK = "#232a35";
export const HULL_LIGHT = "#5a6677";
export const POD = "#cdd5dd";
export const POD_SHADE = "#9aa6b4";
export const STEEL = "#6d7480";
export const BLACK = "#101216";
export const RUBBER = "#17181c";
export const CYAN = "#19e6ff";
export const MAGENTA = "#ff2bd6";
export const AMBER = "#ffb02e";
export const RED = "#ff2b3a";
export const GLASS = "#0f3a4a";
export const HAZARD = "#ffd21f";

export const REQUESTS = [
  {
    id: "roofLightBar", kind: "add", part: "cabHull",
    what: "Neon light bar across the cab roof: slim black housing, six lamps alternating CYAN and MAGENTA (glowing), end brackets and a small mounting riser.",
    at: [0, 3.22, 3.1], normal: [0, 1, 0], bone: null, room: [1.8, 0.25, 0.4],
  },
  {
    id: "frontGrille", kind: "add", part: "cabHull",
    what: "Armoured front grille: dark slatted louvres inside a HULL_DARK frame, a glowing CYAN horizontal slit, and a small magenta corp emblem plate in the centre.",
    at: [0, 1.7, 4.62], normal: [0, 0, 1], bone: null, room: [1.8, 0.7, 0.3],
  },
  {
    id: "bumperRam", kind: "add", part: "bumper",
    what: "Ram bumper fittings: row of angular steel teeth/spikes, two tow hooks and amber hazard chevrons along the bumper.",
    at: [0, 1.0, 4.85], normal: [0, 0, 1], bone: null, room: [2.6, 0.5, 0.4],
  },
  {
    id: "antennaArray", kind: "add", part: "cabHull",
    what: "Antenna array on the cab rear roof corner: three rods of different heights, a small dish, a blinking RED tip lamp, and cable runs.",
    at: [-1.0, 3.2, 2.2], normal: [0, 1, 0], bone: null, room: [0.5, 1.2, 0.5],
  },
  {
    id: "podHatch", kind: "add", part: "podShell",
    what: "Sealed inspection hatch on the pod's left flank: recessed hex door in HULL_DARK, four bolts, a glowing MAGENTA keypad and a hazard-striped frame.",
    at: [1.27, 2.4, -1.6], normal: [1, 0, 0], bone: null, room: [0.3, 1.2, 1.8],
  },
  {
    id: "podRoofArray", kind: "add", part: "podShell",
    what: "Roof equipment on the pod: vent grilles, two small cooling fans, a flat solar/sensor panel and cable conduits.",
    at: [0, 3.68, -1.6], normal: [0, 1, 0], bone: null, room: [1.2, 0.3, 2.8],
  },
  {
    id: "rearSealLock", kind: "add", part: "podShell",
    what: "Rear pod door: big circular vault seal with radial locking bolts, a CYAN status ring, a MAGENTA lock light and hazard stripes.",
    at: [0, 2.4, -4.95], normal: [0, 0, -1], bone: null, room: [1.8, 1.8, 0.3],
  },
  {
    id: "turretFittings", kind: "add", part: "turret",
    what: "Turret detail: ammo box with feed belt, barrel shroud with vents, targeting sensor with a RED glowing lens and a small shield plate.",
    at: [0, 4.05, 1.0], normal: [0, 1, 0], bone: null, room: [1.0, 0.6, 1.6],
  },
  {
    id: "underglow",kind: "add", part: "chassisFrame",
    what: "Underglow and undercarriage: CYAN neon strips under the chassis both sides, cable bundles, and a drive shaft with joints.",
    at: [0, 0.75, 0], normal: [0, -1, 0], bone: null, room: [1.6, 0.3, 8.0],
  },
  {
    id: "sideArmourStuds", kind: "add", part: "skirtPlate",
    what: "Skirt plate detail: rivets, a faded unit number, angled reactive-armour blocks and small amber marker lamps.",
    at: [1.1, 1.0, -1.6], normal: [1, 0, 0], bone: null, room: [0.3, 0.5, 2.2],
  },
  {
    id: "cabCamo", kind: "texture", part: "cabHull",
    what: "Dark urban digital camo in HULL, HULL_DARK and HULL_LIGHT blocks, with a CYAN stripe and a faded convoy number on the doors.",
  },
  {
    id: "podPanels", kind: "texture", part: "podShell",
    what: "Panel seams, rivets and scuffs on the pod in POD and POD_SHADE, with a MAGENTA corp logo band and warning text near the front.",
  },
  {
    id: "tyreTread", kind: "texture", part: "tyre",
    what: "Chunky tread blocks on all tyres in RUBBER and BLACK with dust at the edges.",
  },
  {
    id: "chassisGrime", kind: "texture", part: "chassisFrame",
    what: "Oil, grease and rust grime in dark browns over the HULL_DARK chassis rails.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });

  // ---- stage 2 paints
  const camoCols = [HULL, HULL_DARK, HULL_LIGHT, HULL_DARK];
  const CAB_PAINT = paint((p, n) => {
    const g = 0.12;
    const qx = Math.floor(p.z / g), qy = Math.floor(p.y / g), qz = Math.floor(p.x / g);
    const v = noise(new THREE.Vector3(qz * g, qy * g, qx * g), 0.45, 4);
    let c: any = camoCols[Math.min(3, Math.floor(v * 4))];
    c = mix(c, HULL_LIGHT, 0.25 * smoothstep(0.5, 1, n.y));
    if (Math.abs(n.x) > 0.7) {
      if (p.y > 1.86 && p.y < 1.96) return CYAN;
      const inPlate = p.z > 2.75 && p.z < 3.45 && p.y > 2.05 && p.y < 2.4 && p.y > 0;
      if (inPlate) {
        const u = (p.z - 2.75) / 0.7, w = (p.y - 2.05) / 0.35;
        const bar = (u > 0.12 && u < 0.28) || (u > 0.38 && u < 0.5) || (u > 0.62 && u < 0.88 && (w < 0.2 || w > 0.8 || u > 0.76));
        return mix(c, bar ? "#c8d2dc" : HULL_DARK, bar ? 0.55 : 0.5);
      }
    }
    return c;
  });
  const POD_PAINT = paint((p, n) => {
    let c: any = mix(POD, POD_SHADE, smoothstep(0.3, 0.9, noise(p, 0.5, 7)) * 0.7);
    c = mix(c, POD_SHADE, 0.35 * smoothstep(0.2, -0.8, n.y));
    const lz = ((p.z + 1.6) / 0.93);
    const fz = lz - Math.floor(lz);
    const seam = fz < 0.025 || fz > 0.975;
    const ang = Math.atan2(p.x, p.y - 2.45);
    const af = (ang / (Math.PI / 5)) - Math.floor(ang / (Math.PI / 5));
    if (seam || af < 0.03 || af > 0.97) c = mix(c, "#4b5560", 0.8);
    else {
      const rz = Math.abs(fz - 0.06), ra = Math.abs(af - 0.1);
      if (Math.hypot(rz * 0.9, ra * 0.5) < 0.03) c = mix(c, "#f0f4f8", 0.7);
    }
    c = mix(c, "#3a3f46", 0.5 * smoothstep(0.62, 0.8, noise(p, 0.12, 11)));
    if (p.z > 0.75 && p.z < 1.05 && n.y > -0.5) c = MAGENTA;
    if (p.z > 0.4 && p.z < 0.7 && n.y > 0.4 && Math.floor(p.x / 0.14) % 2 === 0) c = "#2a2d33";
    return c;
  });
  const TYRE_PAINT = paint((p, n, s) => {
    if (Math.abs(n.x) > 0.6) return mix(RUBBER, "#6f655a", 0.3 * noise(p, 0.1, 3) + 0.1);
    const a = s[0] * 28;
    const row = Math.floor(s[1] * 3);
    const f = a + (row % 2) * 0.5;
    const fr = f - Math.floor(f);
    const block = fr > 0.18;
    const base = block ? RUBBER : BLACK;
    const dust = smoothstep(0.55, 0.95, noise(p, 0.15, 5)) * 0.4;
    return mix(base, "#7b6e5e", dust);
  });
  const CHASSIS_PAINT = paint((p, n) => {
    let c: any = mix(HULL_DARK, BLACK, noise(p, 0.3, 2) * 0.6);
    c = mix(c, "#4a3320", 0.7 * smoothstep(0.55, 0.8, noise(p, 0.25, 8)));
    c = mix(c, "#6b3f1f", 0.5 * smoothstep(0.65, 0.85, noise(p, 0.1, 9)) * smoothstep(0.2, -0.6, n.y));
    c = mix(c, "#0a0a0c", 0.7 * smoothstep(0.6, 0.78, noise(p, 0.4, 13)));
    return c;
  });

  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, name?: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], name, rotation: rot });
  // cylinder along an axis: "z" | "x" | "y"
  const cyl = (rt: number, rb: number, len: number, seg: number, ax: "x" | "y" | "z", x: number, y: number, z: number, color: string, name?: string) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, {
      at: [x, y, z], name, rotation: ax === "z" ? [90, 0, 0] : ax === "x" ? [0, 0, 90] : [0, 0, 0],
    });

  // ---- chassis
  bx(1.5, 0.32, 8.8, 0, 0.98, 0, CHASSIS_PAINT as any, "chassisFrame");
  bx(0.2, 0.3, 8.6, 0.6, 0.78, 0, CHASSIS_PAINT as any, "chassisFrame");
  bx(0.2, 0.3, 8.6, -0.6, 0.78, 0, CHASSIS_PAINT as any, "chassisFrame");
  for (const z of [2.2, 0.6, -1.0, -2.6, -4.0]) bx(1.4, 0.18, 0.2, 0, 0.7, z, BLACK, "crossMember");
  // underglow (simple stage-1 strips)
  for (const s of [1, -1]) glow(bx(0.06, 0.05, 7.6, s * 0.78, 0.62, 0, CYAN, "underglowStrip"), 1.2);

  // ---- wheels
  const axles = [3.1, -0.9, -2.3, -3.7];
  for (const z of axles)
    for (const s of [1, -1]) {
      const x = s * 1.32;
      cyl(0.62, 0.62, 0.46, 10, "x", x, 0.62, z, TYRE_PAINT as any, "tyre");
      cyl(0.36, 0.36, 0.5, 8, "x", x, 0.62, z, STEEL, "wheelRim");
      cyl(0.18, 0.18, 0.54, 6, "x", x, 0.62, z, HULL_DARK, "hubCap");
      glow(cyl(0.1, 0.1, 0.58, 6, "x", x, 0.62, z, CYAN, "hubGlow"), 1.2);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.56, 0.07, 0.07), STEEL, {
          at: [x, 0.62 + Math.cos(a) * 0.27, z + Math.sin(a) * 0.27], rotation: [(a * 180) / Math.PI, 0, 0], name: "lugBolt",
        });
      }
      // fender arch cap
      bx(0.6, 0.1, 1.5, s * 1.32, 1.3, z, HULL, "fender");
    }
  for (const z of [3.1, -0.9, -3.7]) for (const s of [1, -1]) bx(0.06, 0.06, 0.06, s * 1.6, 0.62, z, STEEL);

  // ---- cab (side-profile extrude, z forward)
  const cabOutline: [number, number][] = [
    [0, 0], [2.6, 0], [2.6, 0.85], [2.0, 0.95], [1.5, 1.9], [0.15, 1.9], [0, 1.5],
  ];
  b.extrude(cabOutline, { at: [0, 1.25, 2.0], x: [0, 0, 1], thickness: 2.5, bevel: 0.05, color: CAB_PAINT, name: "cabHull" });
  // hood armour plates
  bx(2.2, 0.1, 1.0, 0, 2.23, 4.1, HULL_LIGHT, "hoodPlate", [-6, 0, 0]);
  for (const s of [1, -1]) bx(0.12, 0.14, 1.5, s * 1.0, 2.25, 3.9, HULL_DARK, "hoodRib");
  // windscreen & windows
  b.part(new THREE.BoxGeometry(2.2, 1.06, 0.06), GLASS, { at: [0, 2.7, 3.72], rotation: [-22.8, 0, 0], name: "windscreen" });
  for (const s of [1, -1]) {
    bx(0.05, 0.75, 1.1, s * 1.27, 2.75, 3.0, GLASS, "sideWindow");
    bx(0.07, 0.04, 1.2, s * 1.27, 3.15, 3.0, HULL_DARK, "windowFrame");
    bx(0.07, 0.8, 0.05, s * 1.27, 2.75, 2.45, HULL_DARK, "doorSeam");
    bx(0.07, 0.8, 0.05, s * 1.27, 2.75, 3.55, HULL_DARK, "doorSeam");
    bx(0.08, 0.06, 0.3, s * 1.28, 2.2, 3.5, STEEL, "doorHandle");
    // mirrors
    bx(0.08, 0.5, 0.05, s * 1.5, 2.85, 3.85, BLACK, "mirrorArm");
    bx(0.1, 0.4, 0.3, s * 1.55, 2.85, 3.85, HULL_DARK, "mirror");
    glow(bx(0.02, 0.06, 0.24, s * 1.61, 2.85, 3.85, CYAN, "mirrorGlow"), 1);
    // headlights
    glow(bx(0.5, 0.18, 0.06, s * 0.95, 1.75, 4.62, AMBER, "headlight"), 1.4);
    bx(0.6, 0.28, 0.05, s * 0.95, 1.75, 4.6, BLACK, "headlightBezel");
    // side armour on cab
    bx(0.1, 0.6, 1.8, s * 1.28, 1.7, 3.3, HULL_LIGHT, "doorArmour");
    bx(0.12, 0.1, 1.9, s * 1.28, 1.35, 3.3, HAZARD, "hazardRail");
  }
  // grille surface plain panel
  bx(1.5, 0.6, 0.08, 0, 1.7, 4.58, HULL_DARK, "grilleBase");
  // bumper
  bx(2.7, 0.4, 0.55, 0, 1.0, 4.55, HULL_LIGHT, "bumper");
  bx(2.2, 0.3, 0.3, 0, 1.0, 4.85, HULL_DARK, "bumper", [0, 0, 0]);
  // roof plate and sirens
  bx(1.9, 0.1, 1.4, 0, 3.2, 2.85, HULL_DARK, "roofPlate");
  bx(2.4, 0.5, 0.5, 0, 1.55, 2.0, HULL_DARK, "cabRearArmour");
  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.12, 0.14, 2.4, 8, "y", s * 1.05, 2.5, 1.75, STEEL, "exhaust");
    cyl(0.17, 0.17, 0.12, 8, "y", s * 1.05, 3.72, 1.75, BLACK, "exhaustTip");
    cyl(0.18, 0.18, 0.2, 8, "y", s * 1.05, 1.7, 1.75, HULL_DARK, "exhaustBand");
    cyl(0.18, 0.18, 0.2, 8, "y", s * 1.05, 2.9, 1.75, HULL_DARK, "exhaustBand");
  }

  // ---- fuel tanks & skirts
  for (const s of [1, -1]) {
    cyl(0.32, 0.32, 1.3, 8, "z", s * 0.98, 0.95, 1.2, HULL_LIGHT, "fuelTank");
    for (const z of [0.7, 1.7]) cyl(0.34, 0.34, 0.08, 8, "z", s * 0.98, 0.95, z, BLACK, "tankStrap");
    // skirt plates beside pod bay
    bx(0.12, 0.55, 2.8, s * 1.0, 1.0, -1.6, HULL, "skirtPlate");
    bx(0.14, 0.12, 2.8, s * 1.0, 1.32, -1.6, HULL_LIGHT, "skirtPlate");
    bx(0.12, 0.45, 1.0, s * 1.0, 1.0, -4.2, HULL, "skirtPlate");
    for (const z of [-0.6, -1.6, -2.6]) glow(bx(0.05, 0.08, 0.2, s * 1.08, 0.85, z, AMBER, "markerLamp"), 1.2);
  }

  // ---- cargo pod (sealed capsule)
  const PZ = -1.6, PY = 2.45, PL = 5.6, PR = 1.22;
  cyl(PR, PR, PL, 10, "z", 0, PY, PZ, POD_PAINT as any, "podShell");
  // end caps
  cyl(PR * 0.7, PR, 0.55, 10, "z", 0, PY, PZ + PL / 2 + 0.27, POD_PAINT as any, "podShell");
  cyl(PR, PR * 0.7, 0.55, 10, "z", 0, PY, PZ - PL / 2 - 0.27, POD_PAINT as any, "podShell");
  cyl(PR * 0.55, PR * 0.55, 0.12, 10, "z", 0, PY, PZ - PL / 2 - 0.58, HULL_DARK, "podRearPlate");
  // armour bands
  for (const z of [1.0, -0.2, -1.4, -2.6, -3.8]) {
    cyl(PR + 0.07, PR + 0.07, 0.22, 10, "z", 0, PY, z, HULL_DARK, "podBand");
  }
  // neon seam strips on flanks
  for (const s of [1, -1]) {
    glow(bx(0.05, 0.07, 5.0, s * 1.15, PY + 0.5, PZ, MAGENTA, "podNeon"), 1.2);
    glow(bx(0.05, 0.05, 5.0, s * 1.2, PY - 0.55, PZ, CYAN, "podNeon"), 1.2);
  }
  // saddle cradle
  for (const z of [0.6, -1.6, -3.6]) {
    bx(2.2, 0.35, 0.5, 0, 1.38, z, HULL_DARK, "cradle");
    for (const s of [1, -1]) bx(0.2, 0.55, 0.5, s * 1.0, 1.7, z, HULL, "cradleArm", [0, 0, s * -25]);
  }
  // hazard stripes at pod nose ring
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    if (i % 2 === 0) b.part(new THREE.BoxGeometry(0.28, 0.06, 0.3), HAZARD, {
      at: [Math.sin(a) * (PR * 0.86), PY + Math.cos(a) * PR * 0.86, PZ + PL / 2 + 0.5],
      rotation: [0, 0, -(a * 180) / Math.PI], name: "hazardMark",
    });
  }

  // ---- turret on pod roof front
  cyl(0.5, 0.58, 0.2, 8, "y", 0, 3.78, 1.0, HULL_DARK, "turretRing");
  bx(0.9, 0.4, 1.0, 0, 4.05, 1.0, HULL, "turret");
  bx(0.7, 0.2, 0.7, 0, 4.35, 0.95, HULL_LIGHT, "turret");
  for (const s of [1, -1]) {
    cyl(0.06, 0.07, 1.5, 6, "z", s * 0.25, 4.1, 1.95, BLACK, "turretBarrel");
    cyl(0.1, 0.1, 0.25, 6, "z", s * 0.25, 4.1, 2.7, STEEL, "muzzle");
  }
  glow(bx(0.12, 0.12, 0.08, 0, 4.4, 1.3, RED, "turretLens"), 1.5);

  // ---- rear
  bx(2.6, 0.35, 0.4, 0, 1.0, -4.75, HULL_LIGHT, "rearBumper");
  for (const s of [1, -1]) {
    glow(bx(0.4, 0.15, 0.06, s * 0.95, 1.0, -4.97, RED, "tailLight"), 1.3);
    // mud flaps
    bx(0.5, 0.45, 0.05, s * 1.32, 0.45, -4.2, BLACK, "mudFlap");
  }
  // antenna stub
  cyl(0.02, 0.03, 1.0, 5, "y", -1.0, 3.7, 2.2, BLACK, "antenna");
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [-1.0, 4.22, 2.2], name: "antennaTip" }), 1.5);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const Y0 = 3.25; // top of roof plate is ~3.25
  const Z = 3.1;
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, name: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name, rotation: rot });

  // mounting riser: base plate, two pedestals
  box(1.7, 0.04, 0.34, 0, Y0 + 0.02, Z, HULL_DARK, "s21Base");
  for (const s of [-1, 1]) {
    box(0.16, 0.1, 0.22, s * 0.55, Y0+ 0.09, Z, HULL_LIGHT, "s21Riser");
    box(0.2, 0.03, 0.26, s * 0.55, Y0 + 0.055, Z, BLACK, "s21RiserFoot");
  }
  const cy = Y0 + 0.2;
  // housing: back shell, top cap, lower lip, front bezel frame
  box(1.76, 0.16, 0.1, 0, cy, Z - 0.1, BLACK, "s21Housing");
  box(1.76, 0.04, 0.3, 0, cy + 0.1, Z - 0.02, HULL_DARK, "s21HousingTop", [-8, 0, 0]);
  box(1.76, 0.03, 0.26, 0, cy - 0.09, Z - 0.02, HULL_DARK, "s21HousingLip");
  box(1.7, 0.02, 0.04, 0, cy + 0.075, Z + 0.1, BLACK, "s21BezelTop");
  box(1.7, 0.02, 0.04, 0, cy - 0.075, Z + 0.1, BLACK, "s21BezelBot");

  // six lamps with dividers
  const lampX = [-0.7, -0.42, -0.14, 0.14, 0.42, 0.7];
  lampX.forEach((x, i) => {
    const col = i % 2 === 0 ? CYAN : MAGENTA;
    glow(box(0.22, 0.11, 0.07, x, cy, Z + 0.06, col, "s21Lamp"), 1.6);
    // slim wedge lens hood above each lamp
    box(0.24, 0.015, 0.1, x, cy + 0.065, Z + 0.08, BLACK, "s21LampHood", [-15, 0, 0]);
  });
  for (let i = 0; i <= 6; i++) {
    const x = -0.84 + i * 0.28;
    box(0.025, 0.14, 0.09, x, cy, Z + 0.06, BLACK, "s21Divider");
  }

  // end brackets and caps
  for (const s of [-1, 1]) {
    box(0.06, 0.2, 0.3, s * 0.9, cy, Z - 0.02, HULL_LIGHT, "s21EndCap");
    box(0.07, 0.05, 0.12, s * 0.9, cy + 0.08, Z + 0.1, AMBER, "s21EndMark");
    const bolt = b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), STEEL, {
      at: [s * 0.93, cy, Z + 0.1], rotation: [0, 0, 90], name: "s21EndBolt",
    });
    void bolt;
    // diagonal brace down to roof
    box(0.04, 0.22, 0.04, s * 0.78, Y0 + 0.11, Z - 0.12, STEEL, "s21Brace", [0, 0, s * 25]);
  }

  // rear cable run + connector
  box(0.04, 0.04, 0.5, 0.3, Y0 + 0.05, Z - 0.35, BLACK, "s21Cable");
  box(0.12, 0.06, 0.08, 0.3, Y0 + 0.06, Z - 0.62, HULL_DARK, "s21Conn");

  // tiny glow strip underneath casting on roof
  glow(box(1.5, 0.012, 0.04, 0, Y0 + 0.012, Z + 0.15, CYAN, "s21RoofSpill"), 0.8);

  // logo decal on housing top
  const tex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#101216"/>
    <path d="M2 8 L8 2 L14 8 L8 14Z" fill="#ff2bd6"/>
    <rect x="20" y="5" width="40" height="2" fill="#19e6ff"/><rect x="20" y="9" width="28" height="2" fill="#ffb02e"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
    at: [-0.1, cy + 0.125, Z - 0.015], dir: [0, 1, -0.14], axis: "z", up: [0, 0, -1], texture: tex, name: "s21Decal",
  });
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addFrontGrille(b: Builder) {
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, name: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name, rotation: rot });

  // ---------- FRONT GRILLE (cab front face at z~4.62, centre y 1.7)
  const gz = 4.63;
  // frame
  box(1.8, 0.07, 0.1, 0, 2.03, gz, HULL_DARK, "grilleFrame");
  box(1.8, 0.07, 0.1, 0, 1.37, gz, HULL_DARK, "grilleFrame");
  for (const s of [1, -1]) box(0.08, 0.7, 0.1, s * 0.86, 1.7, gz, HULL_DARK, "grilleFrame");
  // louvres, angled slats above and below the slit
  for (let i = 0; i < 4; i++) {
    const y = 1.45 + i * 0.065;
    box(1.62, 0.04, 0.09, 0, y, gz + 0.02, i % 2 ? BLACK : HULL_LIGHT, "louvre", [-28, 0, 0]);
  }
  for (let i = 0; i < 4; i++) {
    const y = 1.78 + i * 0.065;
    box(1.62, 0.04, 0.09, 0, y, gz + 0.02, i % 2 ? BLACK : HULL_LIGHT, "louvre", [-28, 0, 0]);
  }
  // glowing slit
  glow(box(1.5, 0.045, 0.06, 0, 1.7, gz + 0.04, CYAN, "grilleSlit"), 1.6);
  // vertical struts crossing slats
  for (const x of [-0.55, -0.28, 0.28, 0.55]) box(0.04, 0.6, 0.06, x, 1.7, gz + 0.06, HULL_DARK, "grilleStrut");
  // emblem plate
  box(0.3, 0.3, 0.05, 0, 1.7, gz + 0.1, HULL_DARK, "emblemPlate");
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#1a0f1c"/><path d="M32 8 L56 32 L32 56 L8 32Z" fill="none" stroke="#ff2bd6" stroke-width="5"/><path d="M32 20 L44 32 L32 44 L20 32Z" fill="#ff2bd6"/><rect x="29" y="4" width="6" height="12" fill="#ff2bd6"/></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
      at: [0, 1.7, gz + 0.128], dir: [0, 0, 1], axis: "z", texture: emblem, name: "emblem",
    }),
    1.2,
  );
  // frame bolts
  for (const x of [-0.8, 0.8]) for (const y of [1.4, 2.0])
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), STEEL, { at: [x, y, gz + 0.055], rotation: [90, 0, 0], name: "grilleBolt" });

  // ---------- BUMPER RAM (bumper box at z 4.55 / front block to 5.0, y 1.0)
  const bz = 5.02;
  // teeth: angular spikes pointing forward
  const teeth = 9;
  for (let i = 0; i < teeth; i++) {
    const x = -1.0 + (i * 2.0) / (teeth - 1);
    const big = i % 2 === 0;
    b.part(new THREE.ConeGeometry(0.09, big ? 0.34 : 0.24, 4), STEEL, {
      at: [x, 1.0, bz + (big ? 0.17 : 0.12)], rotation: [90, 45, 0], name: "ramTooth",
    });
  }
  // top & bottom rails behind teeth
  box(2.3, 0.07, 0.1, 0, 1.17, bz + 0.0, HULL_DARK, "ramRail");
  box(2.3, 0.07, 0.1, 0, 0.84, bz + 0.0, HULL_DARK, "ramRail");
  // tow hooks
  for (const s of [1, -1]) {
    box(0.14, 0.12, 0.2, s * 1.15, 0.85, 4.95, BLACK, "towMount");
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8, Math.PI * 1.5), STEEL, {
      at: [s * 1.15, 0.8, 5.1], rotation: [0, 0, s * 45], name: "towHook",
    });
  }
  // amber hazard chevrons on bumper top face front
  const chev = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#101216"/><g fill="none" stroke="#ffb02e" stroke-width="7" stroke-linejoin="miter"><path d="M6 4 L22 16 L6 28"/><path d="M30 4 L46 16 L30 28"/><path d="M54 4 L70 16 L54 28"/><path d="M78 4 L94 16 L78 28"/><path d="M102 4 L118 16 L102 28"/></g></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.85, 0.21), "#ffffff", {
      at: [s * 0.5, 1.12, 4.835], dir: [0, 0, 1], axis: "z", texture: chev, name: "bumperChevron",
    });
  // marker lamps
  for (const s of [1, -1]) glow(box(0.1, 0.07, 0.05, s * 1.3, 1.12, 4.84, AMBER, "bumperLamp"), 1.3);
}
    return addFrontGrille;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addAntennaArray(b: Builder) {
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, name: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name, rotation: rot });
  const cyl = (rt: number, rb: number, len: number, seg: number, x: number, y: number, z: number, c: string, name: string, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), c, { at: [x, y, z], name, rotation: rot });

  // ================= Antenna array (cab rear roof corner) =================
  const ax = -1.0, az = 2.2, ay = 3.25;
  // base plate and riser
  box(0.5, 0.06, 0.5, ax, ay + 0.03, az, HULL_DARK, "s23antBase");
  box(0.4, 0.12, 0.4, ax, ay + 0.12, az, BLACK, "s23antRiser");
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]])
    cyl(0.025, 0.025, 0.04, 6, ax + dx * 0.21, ay + 0.08, az + dz * 0.21, STEEL, "s23antBolt");

  // three rods of different heights
  const rods: [number, number, number, number][] = [
    [ax - 0.12, az - 0.1, 1.15, 0.018],
    [ax + 0.1, az - 0.12, 0.8, 0.014],
    [ax, az + 0.12, 0.55, 0.012],
  ];
  for (const [x, z, h, r] of rods) {
    cyl(r, r * 1.5, h, 6, x, ay + 0.18 + h / 2, z, BLACK, "s23antRod");
    cyl(r * 2.2, r * 2.2, 0.05, 6, x, ay + 0.22, z, STEEL, "s23antCollar");
    cyl(r * 1.8, r * 1.8, 0.03, 6, x, ay + 0.18 + h * 0.6, z, STEEL, "s23antRing");
  }
  // red tip lamp on tallest
  glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), RED, { at: [rods[0][0], ay + 0.18 + 1.15 + 0.03, rods[0][1]], name: "s23antTipLamp" }), 1.8);
  // small tip caps
  cyl(0.004, 0.012, 0.1, 5, rods[1][0], ay + 0.18 + 0.8 + 0.05, rods[1][1], AMBER, "s23antTip");

  // dish on short mast
  cyl(0.02, 0.02, 0.3, 6, ax + 0.14, ay + 0.3, az + 0.1, STEEL, "s23dishMast");
  const dishGeo = new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42);
  b.part(dishGeo, POD, { at: [ax + 0.14, ay + 0.5, az + 0.1], rotation: [-100, 0, 0], name: "s23dish" });
  cyl(0.012, 0.012, 0.16, 5, ax + 0.14, ay + 0.55, az + 0.18, STEEL, "s23dishFeed", [-80, 0, 0]);
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), CYAN, { at: [ax + 0.14, ay + 0.58, az + 0.26], name: "s23dishLamp" }), 1.5);

  // cable runs forward and down the cab rear
  box(0.04, 0.04, 0.8, ax + 0.05, ay + 0.04, az + 0.6, BLACK, "s23cable");
  box(0.04, 0.04, 0.5, ax - 0.1, ay + 0.04, az - 0.4, BLACK, "s23cable");
  box(0.04, 0.3, 0.04, ax - 0.1, ay - 0.1, az - 0.65, BLACK, "s23cable");
  box(0.1, 0.06, 0.1, ax + 0.05, ay + 0.06, az + 1.0, STEEL, "s23cableClip");

  // ================= Pod hatch (left flank, +X) =================
  const hx = 1.27, hy = 2.4, hz = -1.6;
  // hazard-striped frame: hex ring with alternating segments
  const R = 0.62;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const y = hy + Math.sin(a) * R, z = hz + Math.cos(a) * R;
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.2), i % 2 ? BLACK : HAZARD, {
      at: [hx + 0.02, y, z], rotation: [(-a * 180) / Math.PI, 0, 0], name: "s23hatchFrame",
    });
  }
  // recessed hex door
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 6), HULL_DARK, { at: [hx + 0.08, hy, hz], rotation: [0, 0, 90], name: "s23hatchDoor" });
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 6), HULL, { at: [hx + 0.13, hy, hz], rotation: [0, 0, 90], name: "s23hatchInset" });
  // bolts
  for (const [dy, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]])
    cyl(0.04, 0.04, 0.05, 6, hx + 0.17, hy + dy * 0.28, hz + dz * 0.28, STEEL, "s23hatchBolt", [0, 0, 90]);
  // handle bar
  box(0.06, 0.05, 0.3, hx + 0.18, hy - 0.08, hz - 0.05, STEEL, "s23hatchHandle");
  // keypad
  box(0.06, 0.3, 0.2, hx + 0.1, hy + 0.05, hz + 0.78, BLACK, "s23keypad");
  const padTex = svg(
    `<svg viewBox="0 0 40 60"><rect width="40" height="60" fill="#2a0030"/>
    <rect x="4" y="4" width="32" height="12" fill="#ff2bd6"/>
    ${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${5 + c * 11}" y="${22 + r * 9}" width="8" height="6" fill="#ff7be8"/>`).join("")).join("")}
    </svg>`, { size: 96 });
  glow(b.part(new THREE.PlaneGeometry(0.16, 0.26), "#ffffff", {
    at: [hx + 0.141, hy + 0.05, hz + 0.78], dir: [1, 0, 0], axis: "z", texture: padTex, name: "s23keypadFace",
  }), 1.3);
  glow(box(0.02, 0.03, 0.03, hx + 0.15, hy + 0.22, hz + 0.78, CYAN, "s23padLed"), 1.5);
  // conduit from keypad to door
  cyl(0.02, 0.02, 0.35, 5, hx + 0.1, hy - 0.2, hz + 0.6, BLACK, "s23conduit", [90, 0, 0]);
}
    return addAntennaArray;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addPodRoofArray(b: Builder) {
  // Pod: cylinder radius 1.22 centred y=2.45, 10 sides along z. Top flat at ~2.45+1.22*cos(18deg)=3.61.
  const TOP = 3.6;
  const Z0 = -1.6;
  const CABLE = "#1b1e24";
  const PANEL = "#1d3a66";
  const VENT = "#2b313b";

  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, name: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], name, rotation: rot });

  // --- base mounting plate
  bx(1.1, 0.06, 2.7, 0, TOP + 0.02, Z0, HULL_DARK, "s24Base");
  for (const x of [-0.5, 0.5]) for (const z of [-1.25, 1.25])
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), STEEL, { at: [x, TOP + 0.07, Z0 + z], name: "s24Bolt" });

  // --- vent grilles (front section)
  const ventTex = svg(
    `<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#2b313b"/>${
      Array.from({ length: 7 }, (_, i) => `<rect x="4" y="${4 + i * 6.2}" width="56" height="3.2" fill="#07090c"/>`).join("")
    }<rect x="1" y="1" width="62" height="46" fill="none" stroke="#5a6677" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    bx(0.4, 0.14, 0.7, s * 0.3, TOP + 0.12, Z0 + 1.0, VENT, "s24VentBox");
    b.part(new THREE.PlaneGeometry(0.36, 0.64), "#ffffff", {
      at: [s * 0.3, TOP + 0.195, Z0 + 1.0], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: ventTex, name: "s24VentGrille",
    });
  }

  // --- cooling fans
  const fanTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0b0d10"/>${
      Array.from({ length: 5 }, (_, i) => `<path d="M32 32 L${32 + 26 * Math.cos(i * 1.2566)} ${32 + 26 * Math.sin(i * 1.2566)} L${32 + 26 * Math.cos(i * 1.2566 + 0.7)} ${32 + 26 * Math.sin(i * 1.2566 + 0.7)}Z" fill="#7d8896"/>`).join("")
    }<circle cx="32" cy="32" r="5" fill="#19e6ff"/><circle cx="32" cy="32" r="30" fill="none" stroke="#3b4452" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const fz = Z0 - 0.15;
    b.part(new THREE.CylinderGeometry(0.27, 0.3, 0.12, 8), HULL, { at: [s * 0.3, TOP + 0.11, fz], name: "s24FanHousing" });
    b.part(new THREE.CircleGeometry(0.24, 12), "#ffffff", {
      at: [s * 0.3, TOP + 0.175, fz], dir: [0, 1, 0], axis: "z", texture: fanTex, name: "s24FanFace",
    });
    for (const a of [0, 90]) bx(0.5, 0.025, 0.03, s * 0.3, TOP + 0.2, fz, STEEL, "s24FanGuard", [0, a + 20, 0]);
    b.part(new THREE.TorusGeometry(0.26, 0.015, 4, 12), STEEL, { at: [s * 0.3, TOP + 0.19, fz], dir: [0, 1, 0], axis: "z", name: "s24FanRing" });
  }

  // --- solar / sensor panel (rear section), tilted slightly
  const solarTex = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#1d3a66"/>${
      Array.from({ length: 5 }, (_, i) => `<path d="M${i * 16 + 0} 0V64M0 ${i * 16}H64" stroke="#6aa4e0" stroke-width="1"/>`).join("")
    }<path d="M0 0L64 64" stroke="#2f5d9a" stroke-width="6" opacity="0.35"/><rect x="1" y="1" width="62" height="62" fill="none" stroke="#9aa6b4" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const pz = Z0 - 1.0;
  bx(0.9, 0.06, 0.9, 0, TOP + 0.12, pz, HULL_DARK, "s24PanelFrame", [-6, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.82, 0.82), "#ffffff", {
    at: [0, TOP + 0.16, pz], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: solarTex, name: "s24SolarFace", rotation: undefined,
  });
  for (const x of [-0.4, 0.4]) bx(0.05, 0.1, 0.05, x, TOP + 0.09, pz + 0.38, STEEL, "s24PanelLeg");
  // sensor dome
  b.part(new THREE.SphereGeometry(0.1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0, TOP + 0.2, pz + 0.65], name: "s24SensorDome" });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), CYAN, { at: [0, TOP + 0.26, pz + 0.72], name: "s24SensorEye" }), 1.5);

  // --- cable conduits along the sides, with clamps
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6), CABLE, {
      at: [s * 0.52, TOP + 0.1, Z0], rotation: [90, 0, 0], name: "s24Conduit",
    });
    for (const z of [-1.1, -0.3, 0.5, 1.2])
      bx(0.14, 0.05, 0.1, s * 0.52, TOP + 0.13, Z0 + z, STEEL, "s24Clamp");
  }
  // cross conduit linking fans to vents
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 1.04, 6), CABLE, { at: [0, TOP + 0.09, Z0 + 0.45], rotation: [0, 0, 90], name: "s24Conduit" });
  glow(bx(0.05, 0.03, 0.05, 0, TOP + 0.14, Z0 + 0.45, AMBER, "s24ConduitLamp"), 1.3);
  glow(bx(0.05, 0.03, 0.05, 0.52, TOP + 0.17, Z0 - 1.3, MAGENTA, "s24StatusLed"), 1.3);
  glow(bx(0.05, 0.03, 0.05, -0.52, TOP + 0.17, Z0 - 1.3, CYAN, "s24StatusLed"), 1.3);
}
    return addPodRoofArray;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addRearSealLock(b: Builder) {
  const D2R = 180 / Math.PI;
  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, name: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name, rotation: rot });
  const cylZ = (r: number, len: number, seg: number, x: number, y: number, z: number, c: string, name: string) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at: [x, y, z], rotation: [90, 0, 0], name });

  // ================= REAR SEAL LOCK =================
  // Rear plate surface is at z ~ -4.95 (plate centre -4.91, 0.12 thick, facing -Z)
  const ZR = -4.99;
  const CY = 2.45;
  // door base disc (frame)
  cylZ(0.86, 0.08, 12, 0, CY, ZR - 0.02, HULL_DARK, "sealFrame");
  // hazard ring: alternating wedges around the frame
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    if (i % 2 === 0)
      b.part(new THREE.BoxGeometry(0.2, 0.2, 0.05), HAZARD, {
        at: [Math.sin(a) * 0.78, CY + Math.cos(a) * 0.78, ZR - 0.07],
        rotation: [0, 0, -a * D2R],
        name: "sealHazard",
      });
  }
  // main vault disc
  cylZ(0.62, 0.1, 12, 0, CY, ZR - 0.09, STEEL, "vaultDisc");
  cylZ(0.5, 0.06, 12, 0, CY, ZR - 0.15, HULL_LIGHT, "vaultInner");
  // cyan status ring (glowing torus)
  const ring = b.part(new THREE.TorusGeometry(0.56, 0.025, 5, 20), CYAN, { at: [0, CY, ZR - 0.14], name: "statusRing" });
  glow(ring, 1.5);
  // radial locking bolts: 8 cylinders sliding from rim to disc
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const sx = Math.sin(a), cy = Math.cos(a);
    b.part(new THREE.BoxGeometry(0.1, 0.34, 0.09), STEEL, {
      at: [sx * 0.7, CY + cy * 0.7, ZR - 0.13],
      rotation: [0, 0, -a * D2R],
      name: "lockBolt",
    });
    b.part(new THREE.BoxGeometry(0.16, 0.08, 0.06), BLACK, {
      at: [sx * 0.86, CY + cy * 0.86, ZR - 0.1],
      rotation: [0, 0, -a * D2R],
      name: "boltBracket",
    });
  }
  // spoked wheel handle
  cylZ(0.12, 0.12, 8, 0, CY, ZR - 0.24, HULL_DARK, "wheelHub");
  for (let i = 0; i < 3; i++) {
    bx(0.5, 0.05, 0.05, 0, CY, ZR - 0.25, STEEL, "wheelSpoke", [0, 0, i * 60]);
  }
  // magenta lock light + housing
  bx(0.2, 0.2, 0.06, 0.0, CY + 0.78 + 0.02, ZR - 0.18, BLACK, "lockHousing");
  glow(bx(0.12, 0.12, 0.05, 0, CY + 0.8, ZR - 0.22, MAGENTA, "lockLight"), 1.6);
  // dial with engraved text decal
  const label = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" fill="#101216"/><text x="64" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#ffd21f">SEALED</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.6, 0.19), "#ffffff", {
    at: [0, CY - 0.8, ZR - 0.06],
    dir: [0, 0, -1],
    axis: "z",
    texture: label,
    name: "sealLabel",
  });
  // side hinges
  for (const s of [1, -1])
    for (const dy of [-0.4, 0.4]) {
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 6), BLACK, { at: [s * 0.92, CY + dy, ZR - 0.05], name: "hinge" });
    }

  // ================= TURRET FITTINGS =================
  // Turret body centred (0, 4.05, 1.0); barrels at x=+-0.25 from z 1.2..2.7
  // ammo box on the right side (-x) of turret
  bx(0.34, 0.34, 0.55, -0.62, 4.0, 0.95, HULL_DARK, "ammoBox");
  bx(0.36, 0.06, 0.57, -0.62, 4.2, 0.95, HULL_LIGHT, "ammoLid");
  bx(0.06, 0.2, 0.2, -0.82, 4.0, 0.95, HAZARD, "ammoLabel");
  // feed belt: chain of brass rounds from box to the breech
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    b.part(new THREE.BoxGeometry(0.1, 0.07, 0.07), AMBER, {
      at: [-0.58 + t * 0.34, 3.98 + Math.sin(t * Math.PI) * 0.12, 1.2 + t * 0.15],
      rotation: [0, 0, -20 + t * 30],
      name: "beltRound",
    });
  }
  // barrel shroud with vents (covers both barrels)
  bx(0.7, 0.26, 0.9, 0, 4.1, 1.75, HULL_DARK, "barrelShroud");
  for (let i = 0; i < 4; i++) {
    bx(0.5, 0.03, 0.08, 0, 4.24, 1.45 + i * 0.2, BLACK, "shroudVent");
  }
  for (const s of [1, -1]) {
    bx(0.04, 0.12, 0.6, s * 0.36, 4.1, 1.75, HULL_LIGHT, "shroudRail");
    // muzzle brake
    b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.12, 6), BLACK, { at: [s * 0.25, 4.1, 2.86], rotation: [90, 0, 0], name: "muzzleBrake" });
  }
  // targeting sensor on top with red lens
  bx(0.34, 0.2, 0.3, 0.22, 4.55, 0.95, BLACK, "sensorBody");
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 8), STEEL, { at: [0.22, 4.55, 1.13], rotation: [90, 0, 0], name: "sensorHood" });
  glow(b.part(new THREE.SphereGeometry(0.055, 6, 4), RED, { at: [0.22, 4.55, 1.2], name: "sensorLens" }), 1.8);
  bx(0.05, 0.2, 0.05, 0.22, 4.4, 0.95, STEEL, "sensorMount");
  // small shield plate in front of the sensor/turret face
  bx(0.9, 0.34, 0.06, 0, 4.12, 1.52, HULL_LIGHT, "shieldPlate", [-12, 0, 0]);
  for (const s of [1, -1]) bx(0.07, 0.07, 0.04, s * 0.38, 4.12, 1.56, STEEL, "shieldBolt");
  // small hazard stripe and rivets on turret roof
  bx(0.5, 0.03, 0.1, -0.1, 4.46, 0.7, HAZARD, "turretStripe");
  for (const s of [1, -1]) cylZ(0.04, 0.05, 6, s * 0.3, 4.2, 0.48, STEEL, "turretRivet");
}
    return addRearSealLock;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addUnderglow(b: Builder) {
  const R = rng(26);
  const CABLE = "#2a2d36";
  const BRASS = "#b58a3c";
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, name: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name, rotation: rot });
  const cylZ = (r: number, len: number, seg: number, x: number, y: number, z: number, c: string, name: string) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at: [x, y, z], name, rotation: [90, 0, 0] });

  // ===== Underglow & undercarriage =====
  // neon strips with housings (both sides, under the chassis)
  for (const s of [1, -1]) {
    box(0.16, 0.06, 7.8, s * 0.7, 0.58, 0, BLACK, "s26glowHousing");
    glow(box(0.1, 0.03, 7.6, s * 0.7, 0.545, 0, CYAN, "s26underNeon"), 1.6);
    // end caps
    for (const z of [-3.9, 3.9]) box(0.18, 0.08, 0.06, s * 0.7, 0.58, z, HULL_DARK, "s26glowCap");
    // brackets
    for (const z of [-3.2, -1.6, 0, 1.6, 3.2]) box(0.05, 0.1, 0.12, s * 0.7, 0.64, z, STEEL, "s26glowBracket");
  }

  // drive shaft with universal joints
  const shaftY = 0.5;
  cylZ(0.07, 8.0, 8, 0, shaftY, 0, STEEL, "s26driveShaft");
  for (const z of [3.0, 1.2, -0.4, -2.0, -3.6]) {
    b.part(new THREE.BoxGeometry(0.2, 0.2, 0.22), HULL_DARK, { at: [0, shaftY, z], name: "s26uJoint" });
    box(0.3, 0.05, 0.05, 0, shaftY, z, BRASS, "s26uJointPin");
    box(0.05, 0.3, 0.05, 0, shaftY, z, BRASS, "s26uJointPin");
  }
  // differentials on the axle lines
  for (const z of [3.1, -0.9, -2.3, -3.7]) {
    b.part(new THREE.SphereGeometry(0.2, 7, 5), HULL_LIGHT, { at: [0, 0.55, z], name: "s26diff" });
    box(1.9, 0.08, 0.08, 0, 0.58, z, STEEL, "s26axleTube");
  }
  // gearbox & transfer case
  box(0.5, 0.36, 0.8, 0, 0.62, 2.5, HULL_DARK, "s26gearbox");
  box(0.4, 0.04, 0.6, 0, 0.43, 2.5, STEEL, "s26gearboxPlate");

  // cable bundles: bundled tubes with ties, running along both inner rails
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const cols = [CABLE, MAGENTA, AMBER];
      const c = k === 0 ? CABLE : cols[k];
      cylZ(0.022, 7.2, 5, s * (0.34 + k * 0.045), 0.7 - k * 0.03, -0.2, c, "s26cable");
    }
    for (let i = 0; i < 9; i++) {
      const z = -3.8 + i * 0.95 + R() * 0.1;
      box(0.2, 0.12, 0.04, s * 0.4, 0.66, z, BLACK, "s26cableTie");
    }
  }
  // cross cable drops to the front and rear
  for (const z of [3.8, -4.1]) {
    box(1.0, 0.04, 0.04, 0, 0.72, z, CABLE, "s26crossCable");
    glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), MAGENTA, { at: [0, 0.72, z], name: "s26cableNode" }), 1.3);
  }
  // skid plates front and rear
  box(1.3, 0.05, 0.7, 0, 0.5, 3.9, HULL_LIGHT, "s26skid", [-6, 0, 0]);
  box(1.3, 0.05, 0.7, 0, 0.5, -4.3, HULL_LIGHT, "s26skid", [6, 0, 0]);

  // ===== Skirt plate detail =====
  // unit number texture (faded paint)
  const unit = svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="116" height="56" rx="4" fill="none" stroke="#e8e8e8" stroke-width="3" stroke-dasharray="14 4"/>
      <text x="60" y="44" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#e8e8e8" opacity="0.8">C-07</text>
      <path d="M8 52 L30 52" stroke="#19e6ff" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  const sx = 1.09;
  for (const s of [1, -1]) {
    // unit number decal on the long skirt plate
    b.part(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", {
      at: [s * (sx + 0.075), 1.0, -1.6], dir: [s, 0, 0], axis: "z", texture: unit, name: "s26unitNumber",
    });
    // rivets in rows along top and bottom edges
    for (let i = 0; i < 12; i++) {
      const z = -2.85 + i * 0.23;
      for (const y of [1.2, 0.8]) {
        b.part(new THREE.SphereGeometry(0.028, 5, 3), STEEL, { at: [s * (sx + 0.065), y, z], name: "s26rivet" });
      }
    }
    // reactive armour blocks, angled
    for (let i = 0; i < 4; i++) {
      const z = -2.6 + i * 0.5 - (i > 1 ? 0.0 : 0);
      const zz = -2.9 + i * 0.35;
      box(0.12, 0.2, 0.28, s * (sx + 0.1), 1.42, zz - 0.0 + 0.0, i % 2 ? HULL_DARK : HULL_LIGHT, "s26reactiveBlock", [0, 0, s * 15]);
      void z;
    }
    for (let i = 0; i < 3; i++) {
      box(0.1, 0.18, 0.3, s * (sx + 0.09), 0.62, -2.6 + i * 0.5 - 0.3 + 0.3 * 0, HULL_DARK, "s26reactiveBlock", [0, 0, s * -12]);
    }
    // amber marker lamps with bezels
    for (const z of [-2.9, -2.2, -1.5, -0.8, -0.2]) {
      box(0.06, 0.14, 0.24, s * (sx + 0.06), 1.0 - 0.0, z + 0.0, BLACK, "s26lampBezel").position.y += 0;
      glow(box(0.05, 0.09, 0.18, s * (sx + 0.1), 1.0, z, AMBER, "s26markerLamp"), 1.4);
    }
    // hazard step edge
    box(0.05, 0.05, 2.8, s * (sx + 0.06), 1.36, -1.6, HAZARD, "s26edgeStripe");
  }
}
    return addUnderglow;
  })(),
);
