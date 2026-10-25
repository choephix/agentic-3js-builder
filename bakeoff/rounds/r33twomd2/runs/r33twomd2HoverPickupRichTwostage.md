<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

// ---------- palette (top level so stage 2 can use it) ----------
export const HULL = "#4b5a4a";
export const HULL_DARK = "#2f3a33";
export const ARMOR = "#242a30";
export const METAL = "#5d6670";
export const BLACK = "#0f1217";
export const GLASS = "#0c2a3a";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2fa8";
export const AMBER = "#ffb02e";
export const RED = "#ff2a3a";
export const WHITE = "#e8f4ff";
export const RUBBER = "#1a1c20";

export const meta = {
  name: "hoverPickup",
  description: "Militarized pickup truck converted to four hover thrusters, low-poly cyberpunk.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cab",
    what: "Neon light bar across the cab roof: a slim black housing, six lamps alternating CYAN and MAGENTA (glowing), end brackets and two small amber strobes at the ends.",
    at: [0, 1.9, 0.25],
    normal: [0, 1, 0],
    bone: null,
    room: [1.6, 0.2, 0.3],
  },
  {
    id: "frontGrille",
    kind: "add",
    part: "frontFascia",
    what: "Aggressive grille on the front fascia: dark slats, a CYAN glowing centre strip, angular ARMOR frame and small tow hooks below.",
    at: [0, 0.85, 2.72],
    normal: [0, 0, 1],
    bone: null,
    room: [1.2, 0.4, 0.15],
  },
  {
    id: "roofTurret",
    kind: "add",
    part: "turretRing",
    what: "Remote weapon station on the roof ring: rotating armoured housing, twin short barrels with muzzle brakes, a camera eye glowing RED and an ammo box on the side.",
    at: [0, 1.95, -0.1],
    normal: [0, 1, 0],
    bone: null,
    room: [0.8, 0.6, 1.0],
  },
  {
    id: "bedCargo",
    kind: "add",
    part: "bedFloor",
    what: "Cargo in the bed: stacked ARMOR crates with CYAN stencil marks, a coil of cables, a glowing AMBER battery cell and tie-down straps.",
    at: [0, 1.25, -1.7],
    normal: [0, 1, 0],
    bone: null,
    room: [1.5, 0.5, 1.6],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "exhaustL",
    what: "Antenna array on the rear-left of the cab: one tall whip with a MAGENTA tip, a small dish and two shorter rods with blinking AMBER nodes.",
    at: [0.8, 1.7, -0.75],
    normal: [0, 1, 0],
    bone: null,
    room: [0.5, 1.2, 0.4],
  },
  {
    id: "thrusterVentsL",
    kind: "add",
    part: "podFL",
    what: "Detail the outer face of the front-left hover pod: heat-vent louvres, a glowing CYAN status strip, bolted cover plates, and a fan hub inside the top intake.",
    at: [1.65, 0.6, 1.7],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.5, 0.7],
  },
  {
    id: "thrusterVentsR",
    kind: "add",
    part: "podRL",
    what: "Detail the outer face of the rear-right hover pod: heat-vent louvres, MAGENTA status strip, bolted plates, and a stabiliser fin angled outward.",
    at: [-1.65, 0.6, -1.6],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.3, 0.5, 0.7],
  },
  {
    id: "doorInsignia",
    kind: "add",
    part: "cab",
    what: "Unit emblem on the left cab door: a hexagonal badge with a MAGENTA skull-and-circuit motif, small CYAN stencil numerals and a door handle plus armoured window slit trim.",
    at: [0.93, 1.35, 0.3],
    normal: [1, 0, 0],
    bone: null,
    room: [0.1, 0.5, 0.7],
  },
  {
    id: "hoodScoop",
    kind: "add",
    part: "hood",
    what: "Hood details: an angular armour scoop with CYAN glowing intake edge, two pairs of exposed bolts, a wiper rack at the windshield base and a thin MAGENTA hood-edge line.",
    at: [0, 1.25, 1.9],
    normal: [0, 1, 0],
    bone: null,
    room: [1.2, 0.25, 1.0],
  },
  {
    id: "rearLights",
    kind: "add",
    part: "tailgate",
    what: "Tailgate: licence holo-plate glowing CYAN, a wide RED light strip, hinge latches, and a pair of rear tow shackles.",
    at: [0, 1.25, -2.74],
    normal: [0, 0, -1],
    bone: null,
    room: [1.7, 0.4, 0.12],
  },
  {
    id: "skirtArmor",
    kind: "texture",
    part: "skirtL",
    what: "Side skirts (skirtL and skirtR): hazard chevrons in AMBER and BLACK on the lower edge, scuffs and bolt rows.",
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "hullSideL",
    what: "Urban digital camo in HULL, HULL_DARK and METAL on hullSideL, hullSideR, hood and cab; faded grime near wheel pods and a neon CYAN pin stripe.",
  },
  {
    id: "windshieldHud",
    kind: "texture",
    part: "windshield",
    what: "Tinted glass with faint CYAN scanlines and a HUD overlay (targeting reticle, small readouts), kept dark so glass reads.",
  },
  {
    id: "bedFloorTread",
    kind: "texture",
    part: "bedFloor",
    what: "Diamond-plate tread pattern in METAL and ARMOR with oil stains and a few glowing CYAN grid lines.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "hoverPickup" });

  const box = (name: string, size: number[], at: number[], color: string, rot?: number[], g = 0) => {
    const p = b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at: at as [number, number, number],
      name,
      ...(rot ? { rotation: rot as [number, number, number] } : {}),
    });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (name: string, rt: number, rb: number, h: number, seg: number, at: number[], color: string, g = 0) => {
    const p = b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: at as [number, number, number], name });
    if (g) glow(p, g);
    return p;
  };

  // ---------- chassis & hull ----------
  box("underbody", [1.7, 0.2, 5.0], [0, 0.52, 0], BLACK);
  box("hull", [1.9, 0.45, 5.4], [0, 0.82, 0], HULL);
  box("hullSideL", [0.06, 0.4, 5.2], [0.96, 0.82, 0], HULL_DARK);
  box("hullSideR", [0.06, 0.4, 5.2], [-0.96, 0.82, 0], HULL_DARK);
  for (const s of [1, -1]) {
    box(s > 0 ? "skirtL" : "skirtR", [0.08, 0.2, 3.2], [s * 1.0, 0.55, 0.1], ARMOR, [0, 0, s * 10]);
    box("underglow", [0.05, 0.03, 4.4], [s * 0.82, 0.38, 0], MAGENTA, undefined, 1.3);
  }

  // hood
  box("hood", [1.85, 0.2, 1.5], [0, 1.15, 1.95], HULL, [-4, 0, 0]);
  box("hoodRidge", [0.5, 0.06, 1.2], [0, 1.27, 1.95], ARMOR, [-4, 0, 0]);
  box("frontFascia", [1.9, 0.5, 0.12], [0, 0.85, 2.7], ARMOR);
  box("bumper", [2.05, 0.22, 0.25], [0, 0.55, 2.78], METAL);
  for (const s of [1, -1]) {
    box("bullBarPost", [0.07, 0.5, 0.07], [s * 0.7, 0.8, 2.9], METAL);
    box("headlight", [0.4, 0.12, 0.05], [s * 0.7, 1.1, 2.73], WHITE, undefined, 1.4);
    box("headlightFrame", [0.5, 0.18, 0.04], [s * 0.7, 1.1, 2.71], BLACK);
  }
  box("bullBar", [1.5, 0.07, 0.07], [0, 1.05, 2.9], METAL);

  // cab
  const cabOutline: [number, number][] = [
    [-0.7, 1.05],
    [-0.7, 1.8],
    [0.45, 1.85],
    [1.2, 1.2],
    [1.2, 1.05],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, color: HULL, name: "cab" });
  const glassOutline: [number, number][] = [
    [-0.5, 1.4],
    [-0.5, 1.72],
    [0.35, 1.76],
    [0.85, 1.4],
  ];
  b.extrude(glassOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.84, color: GLASS, name: "sideGlass" });
  box("windshield", [1.6, 0.03, 0.99], [0, 1.54, 0.84], GLASS, [41, 0, 0]);
  box("rearWindow", [1.5, 0.3, 0.03], [0, 1.55, -0.71], GLASS);
  box("roofPlate", [1.7, 0.06, 1.0], [0, 1.88, -0.1], ARMOR);
  for (const s of [1, -1]) {
    box("pillarArmor", [0.08, 0.5, 0.1], [s * 0.9, 1.5, 0.4], ARMOR, [0, 0, 0]);
    box("mirror", [0.08, 0.14, 0.2], [s * 1.0, 1.45, 0.95], BLACK);
    box("mirrorArm", [0.12, 0.04, 0.04], [s * 0.95, 1.4, 0.95], METAL);
  }
  cyl("turretRing", 0.32, 0.36, 0.1, 10, [0, 1.95, -0.1], METAL);

  // bed
  box("bedFloor", [1.8, 0.06, 1.95], [0, 1.08, -1.72], ARMOR);
  box("tailgate", [1.9, 0.45, 0.08], [0, 1.28, -2.7], HULL);
  for (const s of [1, -1]) {
    box("bedWall", [0.1, 0.45, 2.0], [s * 0.9, 1.3, -1.7], HULL);
    box("bedRail", [0.05, 0.04, 2.0], [s * 0.9, 1.54, -1.7], CYAN, undefined, 1.1);
    const e = cyl(s > 0 ? "exhaustL" : "exhaustR", 0.07, 0.07, 0.9, 6, [s * 0.78, 1.5, -0.78], METAL);
    cyl("exhaustTip", 0.09, 0.09, 0.08, 6, [s * 0.78, 1.97, -0.78], BLACK);
    void e;
    box("rollBarPost", [0.07, 0.5, 0.07], [s * 0.78, 1.35, -0.8], METAL);
    box("taillight", [0.4, 0.1, 0.04], [s * 0.7, 1.12, -2.76], RED, undefined, 1.3);
  }

  // ---------- hover pods ----------
  const pods: [string, number, number][] = [
    ["podFL", 1.3, 1.7],
    ["podFR", -1.3, 1.7],
    ["podRL", 1.3, -1.6],
    ["podRR", -1.3, -1.6],
  ];
  for (const [n, x, z] of pods) {
    const s = Math.sign(x);
    box("podArm", [0.5, 0.18, 0.4], [s * 1.05, 0.75, z], ARMOR);
    cyl(n, 0.44, 0.36, 0.55, 8, [x, 0.6, z], HULL_DARK);
    cyl("podRim", 0.47, 0.47, 0.06, 8, [x, 0.9, z], METAL);
    cyl("intake", 0.32, 0.32, 0.04, 8, [x, 0.94, z], BLACK);
    cyl("thrustCore", 0.28, 0.28, 0.04, 8, [x, 0.3, z], s > 0 ? CYAN : MAGENTA, 1.8);
    cyl("nozzle", 0.38, 0.34, 0.08, 8, [x, 0.34, z], METAL);
    // landing leg + foot
    box("legStrut", [0.08, 0.32, 0.08], [x + s * 0.4, 0.2, z], METAL);
    box("footPad", [0.3, 0.06, 0.5], [x + s * 0.4, 0.03, z], BLACK);
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

- **skirtArmor**: a paint on both skirts with AMBER/BLACK hazard chevrons on the lower edge, scuff noise, and two rows of bolts.
- **hullCamo**: a blocky digital-camo paint (HULL, HULL_DARK, METAL cells) on hullSideL/R, hood and cab, with grime on the lower sides and a CYAN pin stripe.
- **windshieldHud**: an SVG texture on the windshield with dark tinted glass, faint CYAN scanlines, a targeting reticle and small readouts.
- **bedFloorTread**: a diamond-plate paint in METAL and ARMOR with oil stains and CYAN grid lines.

<<<<<<< SEARCH
import { glow } from "agentic-3js-builder/kits/glow";
=======
import { glow } from "agentic-3js-builder/kits/glow";
import { paint, noise, svg, type ColorInput } from "agentic-3js-builder";
>>>>>>> REPLACE
<<<<<<< SEARCH
  const box = (name: string, size: number[], at: number[], color: string, rot?: number[], g = 0) => {
=======
  const box = (name: string, size: number[], at: number[], color: ColorInput, rot?: number[], g = 0) => {
>>>>>>> REPLACE
<<<<<<< SEARCH
  // ---------- chassis & hull ----------
=======
  // ---------- paints ----------
  const SKIRT = paint((p, n) => {
    if (Math.abs(n.x) < 0.5) return ARMOR;
    const sc = noise(p, 0.05, 3);
    if (p.y < 0.52) {
      const k = Math.floor((p.z + p.y * 1.2) / 0.1);
      return k % 2 === 0 ? AMBER : BLACK;
    }
    for (const by of [0.6, 0.66]) {
      const dz = ((p.z % 0.25) + 0.25) % 0.25 - 0.125;
      if (Math.hypot(dz, p.y - by) < 0.012) return METAL;
    }
    return sc > 0.65 ? "#3a424a" : sc < 0.3 ? "#181c21" : ARMOR;
  });
  const CAMO = paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y);
    const c = 0.07;
    const q = new THREE.Vector3(Math.floor(p.x / c) * c, Math.floor(p.y / c) * c, Math.floor(p.z / c) * c);
    if (ax > 0.5 && Math.abs(p.y - 0.95) < 0.01) return CYAN;
    const v = noise(q, 0.35, 11);
    let col = v < 0.38 ? HULL_DARK : v > 0.62 ? METAL : HULL;
    if (noise(q, 0.12, 5) > 0.7) col = HULL_DARK;
    if (ax > 0.5 && p.y < 0.78) col = noise(q, 0.1, 8) > 0.45 ? "#262b27" : col;
    if (ay > 0.7 && noise(q, 0.2, 2) > 0.8) col = METAL;
    return col;
  });
  const TREAD = paint((p, n) => {
    if (n.y < 0.5) return ARMOR;
    const gx = Math.abs(((p.x + 0.9) % 0.45) - 0.225), gz = Math.abs(((p.z + 3) % 0.45) - 0.225);
    if (gx < 0.004 || gz < 0.004) return CYAN;
    const u = (p.x + p.z) / 0.09, w = (p.x - p.z) / 0.09;
    const a = Math.abs((u % 1) - 0.5), d = Math.abs((w % 1) - 0.5);
    let col = a < 0.12 || d < 0.12 ? "#7a848e" : METAL;
    const oil = noise(p, 0.3, 21);
    if (oil > 0.66) col = "#15171b";
    else if (oil > 0.6) col = ARMOR;
    return col;
  });
  const HUD = svg(
    `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="#0a2230"/>
      <rect width="160" height="100" fill="#06151e" opacity="0.4"/>
      ${Array.from({ length: 25 }, (_, i) => `<rect x="0" y="${i * 4}" width="160" height="0.8" fill="#19f0ff" opacity="0.12"/>`).join("")}
      <g fill="none" stroke="#19f0ff" stroke-width="1.2" opacity="0.8">
        <circle cx="80" cy="50" r="14"/><circle cx="80" cy="50" r="2"/>
        <path d="M80 28V38M80 62V72M58 50H68M92 50H102"/>
        <path d="M20 14H34V20M140 14H126V20M20 86H34V80M140 86H126V80"/>
      </g>
      <g font-family="monospace" font-size="6" fill="#19f0ff" opacity="0.85">
        <text x="12" y="30">SPD 142</text><text x="12" y="38">ALT 0.6M</text>
        <text x="112" y="30">TGT LOCK</text><text x="112" y="38" fill="#ff2fa8">HOSTILE</text>
        <text x="12" y="76">PWR ||||||</text><text x="112" y="76">HVR OK</text>
      </g>
    </svg>`,
    { size: 256 },
  );

  // ---------- chassis & hull ----------
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(s > 0 ? "skirtL" : "skirtR", [0.08, 0.2, 3.2], [s * 1.0, 0.55, 0.1], ARMOR, [0, 0, s * 10]);
=======
    box(s > 0 ? "skirtL" : "skirtR", [0.08, 0.2, 3.2], [s * 1.0, 0.55, 0.1], SKIRT, [0, 0, s * 10]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  box("hullSideL", [0.06, 0.4, 5.2], [0.96, 0.82, 0], HULL_DARK);
  box("hullSideR", [0.06, 0.4, 5.2], [-0.96, 0.82, 0], HULL_DARK);
=======
  box("hullSideL", [0.06, 0.4, 5.2], [0.96, 0.82, 0], CAMO);
  box("hullSideR", [0.06, 0.4, 5.2], [-0.96, 0.82, 0], CAMO);
>>>>>>> REPLACE
<<<<<<< SEARCH
  box("hood", [1.85, 0.2, 1.5], [0, 1.15, 1.95], HULL, [-4, 0, 0]);
=======
  box("hood", [1.85, 0.2, 1.5], [0, 1.15, 1.95], CAMO, [-4, 0, 0]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, color: HULL, name: "cab" });
=======
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, color: CAMO, name: "cab" });
>>>>>>> REPLACE
<<<<<<< SEARCH
  box("windshield", [1.6, 0.03, 0.99], [0, 1.54, 0.84], GLASS, [41, 0, 0]);
=======
  b.part(new THREE.BoxGeometry(1.6, 0.03, 0.99), "#ffffff", {
    at: [0, 1.54, 0.84],
    name: "windshield",
    rotation: [41, 0, 0],
    texture: HUD,
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
  box("bedFloor", [1.8, 0.06, 1.95], [0, 1.08, -1.72], ARMOR);
=======
  box("bedFloor", [1.8, 0.06, 1.95], [0, 1.08, -1.72], TREAD);
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofLightBar(b: Builder) {
  const Y0 = 1.91; // roof plate top is ~1.91
  const Z0 = 0.25;
  const BRACKET = "#3a424a";

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    g = 0,
    rot?: [number, number, number],
  ) => {
    const p = b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      ...(rot ? { rotation: rot } : {}),
    });
    if (g) glow(p, g);
    return p;
  };

  // housing: slim black body with a lower base
  box("lbBase", [1.5, 0.03, 0.26], [0, Y0 + 0.015, Z0], ARMOR);
  box("lbHousing", [1.44, 0.09, 0.2], [0, Y0 + 0.075, Z0], BLACK);
  // sloped front/back visor lips
  box("lbVisorF", [1.44, 0.03, 0.06], [0, Y0 + 0.13, Z0 + 0.1], METAL, 0, [30, 0, 0]);
  box("lbVisorB", [1.44, 0.03, 0.06], [0, Y0 + 0.13, Z0 - 0.1], METAL, 0, [-30, 0, 0]);

  // lamps: six alternating cyan / magenta, glowing
  const lampW = 0.2;
  for (let i = 0; i < 6; i++) {
    const x = -0.55 + i * 0.22;
    const c = i % 2 === 0 ? CYAN : MAGENTA;
    box("lbLamp" + i, [lampW, 0.07, 0.04], [x, Y0 + 0.08, Z0 + 0.105], c, 1.9);
    // thin dividers between lamps
    if (i < 5) box("lbDiv" + i, [0.02, 0.09, 0.05], [x + 0.11, Y0 + 0.08, Z0 + 0.1], ARMOR);
    // rear-facing dim lamp strip pieces
    box("lbLampB" + i, [lampW * 0.8, 0.04, 0.03], [x, Y0 + 0.08, Z0 - 0.105], c, 0.9);
  }

  // end caps, brackets and feet
  for (const s of [1, -1]) {
    box("lbEnd", [0.05, 0.11, 0.22], [s * 0.745, Y0 + 0.075, Z0], ARMOR);
    box("lbBracket", [0.07, 0.09, 0.07], [s * 0.6, Y0 + 0.045, Z0 + 0.14], BRACKET);
    box("lbBracket", [0.07, 0.09, 0.07], [s * 0.6, Y0 + 0.045, Z0 - 0.14], BRACKET);
    box("lbBracketMid", [0.07, 0.09, 0.07], [s * 0.2, Y0 + 0.045, Z0 - 0.14], BRACKET);
    // bolts on the base
    for (const z of [-0.1, 0.1]) {
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6), METAL, {
        at: [s * 0.68, Y0 + 0.04, Z0 + z],
        name: "lbBolt",
      });
    }
    // amber strobe: dome on a base at each end
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 8), ARMOR, {
      at: [s * 0.8, Y0 + 0.035, Z0],
      name: "strobeBase",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.045, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), AMBER, {
        at: [s * 0.8, Y0 + 0.05, Z0],
        name: "strobe",
      }),
      2,
    );
    // small guard fin
    box("strobeFin", [0.01, 0.06, 0.12], [s * 0.86, Y0 + 0.07, Z0], METAL);
  }

  // wiring conduit running down behind the bar
  box("lbConduit", [0.04, 0.04, 0.2], [0.35, Y0 + 0.02, Z0 - 0.2], BLACK);

  // decal: tiny stencil on housing top
  const tex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="none"/>
    <path d="M2 14 L8 2 L14 14 M18 2 L18 14 M18 2 L28 2 M18 8 L26 8 M34 2 L34 14 L44 14 M50 2 L62 2 M56 2 L56 14" stroke="#19f0ff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 256 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", {
      at: [0, Y0 + 0.1228, Z0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      name: "lbStencil",
      texture: tex,
    }),
    1.2,
  );
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addFrontGrille(b: Builder) {
  const P = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];
  const box = (name: string, size: number[], at: number[], color: string, rot?: number[], g = 0) => {
    const p = b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at: P(at[0], at[1], at[2]),
      name,
      ...(rot ? { rotation: rot as [number, number, number] } : {}),
    });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (name: string, rt: number, rb: number, h: number, seg: number, at: number[], color: string, rot?: number[], g = 0) => {
    const p = b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, {
      at: P(at[0], at[1], at[2]),
      name,
      ...(rot ? { rotation: rot as [number, number, number] } : {}),
    });
    if (g) glow(p, g);
    return p;
  };

  // ================= FRONT GRILLE =================
  const gz = 2.77;
  // angular armor frame
  box("grilleFrameTop", [1.2, 0.06, 0.05], [0, 1.04, gz], ARMOR);
  box("grilleFrameBot", [1.2, 0.06, 0.05], [0, 0.66, gz], ARMOR);
  for (const s of [1, -1]) {
    box("grilleFrameSide", [0.07, 0.4, 0.05], [s * 0.6, 0.85, gz], ARMOR);
    box("grilleChamfer", [0.16, 0.06, 0.05], [s * 0.54, 1.0, gz + 0.005], ARMOR, [0, 0, s * -35]);
    box("grilleChamferLow", [0.16, 0.06, 0.05], [s * 0.54, 0.7, gz + 0.005], ARMOR, [0, 0, s * 35]);
  }
  // dark back plate
  box("grilleBack", [1.08, 0.32, 0.02], [0, 0.85, gz - 0.01], BLACK);
  // slats, angled, with gap for centre strip
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const y = 0.7 + i * 0.07;
      box("grilleSlat", [0.4, 0.035, 0.04], [s * 0.33, y + 0.05, gz + 0.015], i % 2 ? HULL_DARK : METAL, [s * 0, 0, s * 8]);
    }
  }
  // glowing cyan centre strip with housing
  box("stripHousing", [0.16, 0.34, 0.04], [0, 0.85, gz + 0.01], BLACK);
  box("stripGlow", [0.06, 0.3, 0.03], [0, 0.85, gz + 0.03], CYAN, undefined, 1.8);
  for (let i = 0; i < 4; i++) box("stripRung", [0.12, 0.012, 0.035], [0, 0.73 + i * 0.08, gz + 0.04], BLACK);
  // bolts
  for (const sx of [1, -1])
    for (const y of [1.04, 0.66]) cyl("grilleBolt", 0.016, 0.016, 0.02, 6, [sx * 0.5, y, gz + 0.03], METAL, [90, 0, 0]);
  // tow hooks
  for (const s of [1, -1]) {
    box("hookMount", [0.1, 0.1, 0.08], [s * 0.45, 0.56, 2.8], ARMOR);
    b.part(new THREE.TorusGeometry(0.06, 0.016, 5, 8, Math.PI * 1.5), AMBER, {
      at: P(s * 0.45, 0.5, 2.88),
      name: "towHook",
      rotation: [0, 0, 135 + (s > 0 ? 0 : 0)],
    });
  }

  // ================= ROOF TURRET =================
  const ty = 1.95;
  const tz = -0.1;
  cyl("turretBase", 0.3, 0.32, 0.06, 10, [0, ty + 0.07, tz], ARMOR);
  cyl("turretCollar", 0.22, 0.26, 0.1, 8, [0, ty + 0.15, tz], METAL);
  // armoured housing
  const hy = ty + 0.34;
  box("turretHousing", [0.46, 0.26, 0.5], [0, hy, tz], HULL);
  box("turretMantlet", [0.5, 0.2, 0.16], [0, hy, tz + 0.3], ARMOR);
  box("turretTop", [0.36, 0.06, 0.4], [0, hy + 0.15, tz - 0.02], ARMOR, [-6, 0, 0]);
  for (const s of [1, -1]) {
    box("turretCheek", [0.06, 0.2, 0.36], [s * 0.26, hy - 0.02, tz - 0.02], ARMOR, [0, s * -8, 0]);
    // barrels
    cyl("barrel", 0.028, 0.028, 0.55, 8, [s * 0.1, hy, tz + 0.55], BLACK, [90, 0, 0]);
    cyl("barrelShroud", 0.045, 0.045, 0.18, 8, [s * 0.1, hy, tz + 0.42], METAL, [90, 0, 0]);
    // muzzle brake
    cyl("muzzleBrake", 0.05, 0.05, 0.1, 6, [s * 0.1, hy, tz + 0.86], METAL, [90, 0, 0]);
    box("muzzleSlot", [0.012, 0.11, 0.06], [s * 0.1, hy, tz + 0.86], BLACK);
  }
  // ammo box on the side
  box("ammoBox", [0.12, 0.14, 0.24], [0.33, hy - 0.04, tz - 0.08], ARMOR);
  box("ammoLid", [0.13, 0.03, 0.25], [0.33, hy + 0.04, tz - 0.08], METAL);
  box("ammoLatch", [0.02, 0.05, 0.04], [0.4, hy - 0.04, tz - 0.08], AMBER);
  box("ammoFeed", [0.2, 0.03, 0.04], [0.22, hy - 0.02, tz + 0.1], METAL, [0, 0, 0]);
  // camera eye on top front
  box("camHousing", [0.14, 0.12, 0.12], [0, hy + 0.22, tz + 0.1], BLACK);
  cyl("camLens", 0.04, 0.04, 0.05, 8, [0, hy + 0.22, tz + 0.18], BLACK, [90, 0, 0]);
  cyl("camEye", 0.026, 0.026, 0.03, 8, [0, hy + 0.22, tz + 0.205], RED, [90, 0, 0], 2);
  // small antenna + armour bolts
  cyl("turretWhip", 0.006, 0.006, 0.25, 4, [-0.16, hy + 0.28, tz - 0.15], METAL);
  for (const s of [1, -1]) box("turretBolt", [0.03, 0.03, 0.03], [s * 0.15, hy + 0.19, tz - 0.12], METAL);

  // decal on housing front: warning chevrons
  const tex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#0f1217"/>${[0, 1, 2, 3, 4, 5]
      .map((i) => `<path d="M${i * 11} 16 L${i * 11 + 6} 0 L${i * 11 + 11} 0 L${i * 11 + 5} 16Z" fill="#ffb02e"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.07), "#ffffff", {
    at: P(0, hy - 0.08, tz + 0.385),
    dir: [0, 0, 1],
    axis: "z",
    texture: tex,
    name: "turretChevrons",
  });
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder, rng, svg, paint, noise, smoothstep, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addBedCargo(b: Builder) {
  const R = rng(23);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { at: at as [number, number, number], ...o });
  const Bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const Cy = (r1: number, r2: number, h: number, s = 8) => new THREE.CylinderGeometry(r1, r2, h, s);

  const STEEL_D = "#3a4048";
  const CABLE = "#14181d";
  const STRAP = "#c9701e";

  const crateTex = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/>
    <rect x="3" y="3" width="58" height="58" fill="none" stroke="#19f0ff" stroke-width="3"/>
    <path d="M3 3L61 61M61 3L3 61" stroke="#19f0ff" stroke-width="1.5" opacity="0.5"/>
    <text x="32" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#19f0ff">A-07</text>
    <rect x="10" y="48" width="44" height="4" fill="#19f0ff"/></svg>`,
    { size: 128 },
  );
  const crateTex2 = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/>
    <path d="M4 4H60V60H4Z" fill="none" stroke="#19f0ff" stroke-width="3"/>
    <circle cx="32" cy="26" r="11" fill="none" stroke="#19f0ff" stroke-width="3"/>
    <path d="M32 15V37M21 26H43" stroke="#19f0ff" stroke-width="2.5"/>
    <text x="32" y="55" text-anchor="middle" font-family="monospace" font-size="10" fill="#19f0ff">HAZ-X</text></svg>`,
    { size: 128 },
  );

  const crateTop = paint((p, n) => {
    const base = mix("#2a3037", "#3c444d", noise(p, 0.12, 4));
    return mix(base, "#14171b", 0.4 * smoothstep(0.3, 0.8, noise(p, 0.05, 9)) * (n.y > 0.5 ? 1 : 0.3));
  });

  const floorY = 1.11;
  // crate builder
  const crate = (x: number, y: number, z: number, w: number, h: number, d: number, rotY: number, tex: any) => {
    P(Bx(w, h, d), crateTop, [x, y + h / 2, z], { rotation: [0, rotY, 0] });
    // stencil faces (side +x/-x style planes oriented with the crate)
    const c = Math.cos((rotY * Math.PI) / 180);
    const s = Math.sin((rotY * Math.PI) / 180);
    const place = (lx: number, lz: number) => [x + lx * c + lz * s, y + h / 2, z - lx * s + lz * c];
    const faces: [number, number, number, number][] = [
      [0, d / 2 + 0.004, 0, w],
      [0, -d / 2 - 0.004, 180, w],
    ];
    for (const [lx, lz, ry, fw] of faces) {
      const p = place(lx, lz);
      const m = P(new THREE.PlaneGeometry(Math.min(fw, h) * 0.8, Math.min(fw, h) * 0.8), "#ffffff", p, {
        rotation: [0, rotY + ry, 0],
        texture: tex,
      });
      glow(m, 1.2);
    }
    // corner braces
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        const q = place(sx * (w / 2), sz * (d / 2));
        P(Bx(0.05, h + 0.02, 0.05), STEEL_D, q, { rotation: [0, rotY, 0] });
      }
    // top slats
    P(Bx(w * 0.9, 0.02, 0.05), METAL, [x, y + h + 0.01, z], { rotation: [0, rotY, 0] });
  };

  crate(-0.38, floorY, -2.15, 0.7, 0.45, 0.6, 4, crateTex);
  crate(0.42, floorY, -2.15, 0.65, 0.4, 0.62, -3, crateTex2);
  crate(-0.35, floorY, -1.5, 0.6, 0.36, 0.5, -6, crateTex2);
  crate(-0.34, floorY + 0.36, -2.12, 0.5, 0.3, 0.45, 12, crateTex);
  crate(0.42, floorY + 0.4, -2.15, 0.4, 0.26, 0.4, -9, crateTex);

  // straps over the big crates
  for (const [x, y] of [
    [-0.55, floorY + 0.66],
    [-0.2, floorY + 0.66],
  ] as number[][]) {
    P(Bx(0.05, 0.015, 0.5), STRAP, [x, y + 0.01, -2.12], { rotation: [0, 12, 0] });
  }
  P(Bx(0.05, 0.6, 0.015), STRAP, [0.42, floorY + 0.2, -1.83]);
  P(Bx(0.05, 0.6, 0.015), STRAP, [0.2, floorY + 0.2, -1.83]);
  P(Bx(0.05, 0.015, 0.62), STRAP, [0.2, floorY + 0.41, -2.15]);
  P(Bx(0.05, 0.015, 0.62), STRAP, [0.55, floorY + 0.41, -2.15]);
  // ratchet buckles
  for (const x of [0.2, 0.55]) P(Bx(0.07, 0.03, 0.05), METAL, [x, floorY + 0.43, -1.9]);

  // cable coil (stacked tori)
  for (let i = 0; i < 4; i++) {
    const t = P(new THREE.TorusGeometry(0.17 - i * 0.005, 0.035, 5, 10), CABLE, [0.42, floorY + 0.05 + i * 0.065, -1.4], {
      rotation: [90, 0, i * 15],
    });
    void t;
  }
  P(Cy(0.09, 0.09, 0.25, 6), STEEL_D, [0.42, floorY + 0.15, -1.4]);
  // loose cable tail
  b.sweep(
    [
      [0.25, floorY + 0.04, -1.4],
      [0.1, floorY + 0.04, -1.3],
      [-0.05, floorY + 0.04, -1.15],
      [-0.2, floorY + 0.04, -1.0],
    ],
    0.02,
    { color: CABLE, sides: 5 },
  );
  glow(P(Bx(0.05, 0.03, 0.03), CYAN, [-0.2, floorY + 0.04, -0.98]), 1.4);

  // battery cell
  P(Bx(0.4, 0.05, 0.3), METAL, [-0.25, floorY + 0.03, -0.95]);
  P(Bx(0.3, 0.26, 0.22), ARMOR, [-0.25, floorY + 0.18, -0.95]);
  glow(P(Bx(0.22, 0.18, 0.015), AMBER, [-0.25, floorY + 0.19, -0.838]), 1.6);
  glow(P(Bx(0.015, 0.18, 0.14), AMBER, [-0.098, floorY + 0.19, -0.95]), 1.6);
  for (const sx of [-1, 1]) P(Cy(0.025, 0.025, 0.04, 6), METAL, [-0.25 + sx * 0.08, floorY + 0.33, -0.95]);

  // ---------- antenna array ----------
  const ax = 0.8;
  const ay = 1.97;
  const az = -0.75;
  P(Cy(0.1, 0.12, 0.06, 8), ARMOR, [ax + 0.12, ay + 0.03, az]);
  // whip
  b.sweep(
    [
      [ax + 0.12, ay + 0.05, az],
      [ax + 0.12, ay + 0.7, az],
      [ax + 0.1, ay + 1.15, az - 0.02],
    ],
    [0.014, 0.004],
    { color: METAL, sides: 5 },
  );
  glow(P(new THREE.SphereGeometry(0.03, 6, 4), MAGENTA, [ax + 0.1, ay + 1.17, az - 0.02]), 2);
  for (let i = 0; i < 3; i++) P(Cy(0.022, 0.022, 0.03, 6), BLACK, [ax + 0.12, ay + 0.2 + i * 0.25, az]);
  // dish
  P(Cy(0.02, 0.02, 0.3, 5), METAL, [ax - 0.05, ay + 0.15, az + 0.08]);
  const dish = P(new THREE.SphereGeometry(0.13, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.4), WHITE, [ax - 0.05, ay + 0.34, az + 0.08], {
    rotation: [-110, 0, 0],
  });
  void dish;
  P(Cy(0.012, 0.012, 0.12, 5), METAL, [ax - 0.05, ay + 0.37, az + 0.15], { rotation: [70, 0, 0] });
  glow(P(new THREE.SphereGeometry(0.02, 5, 4), CYAN, [ax - 0.05, ay + 0.43, az + 0.2]), 1.5);
  // short rods with amber nodes
  for (const [dx, dz, h] of [
    [-0.14, -0.1, 0.55],
    [0.2, 0.1, 0.42],
  ]) {
    P(Cy(0.012, 0.016, h, 5), METAL, [ax + dx, ay + h / 2, az + dz]);
    glow(P(new THREE.SphereGeometry(0.03, 6, 4), AMBER, [ax + dx, ay + h + 0.02, az + dz]), 1.8);
    P(Cy(0.035, 0.035, 0.03, 6), ARMOR, [ax + dx, ay + 0.015, az + dz]);
  }
  void R;
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addThrusterVentsL(b: Builder) {
  const cx = 1.3, cy = 0.6, cz = 1.7;
  const P = (
    g: THREE.BufferGeometry,
    color: string,
    at: number[],
    rot: number[] = [0, 0, 0],
    name = "s24vent",
    gl = 0,
  ) => {
    const p = b.part(g, color, { at: at as [number, number, number], rotation: rot as [number, number, number], name });
    if (gl) glow(p, gl);
    return p;
  };
  const PLATE = "#38424a";
  const VENT = "#07090c";

  // ----- heat-vent louvres on the outer edge face -----
  // dark recess backing
  P(new THREE.BoxGeometry(0.03, 0.34, 0.34), VENT, [cx + 0.385, 0.55, cz]);
  for (let i = 0; i < 6; i++) {
    const y = 0.4 + i * 0.056;
    P(new THREE.BoxGeometry(0.05, 0.022, 0.34), i % 2 ? METAL : ARMOR, [cx + 0.39, y, cz], [-28, 0, 0], "s24louvre");
  }
  // frame around louvres
  P(new THREE.BoxGeometry(0.045, 0.02, 0.38), ARMOR, [cx + 0.388, 0.74, cz], [0, 0, 0], "s24ventFrameT");
  P(new THREE.BoxGeometry(0.045, 0.02, 0.38), ARMOR, [cx + 0.388, 0.37, cz], [0, 0, 0], "s24ventFrameB");

  // ----- glowing cyan status strip near the rim -----
  P(new THREE.BoxGeometry(0.03, 0.03, 0.3), CYAN, [cx + 0.405, 0.8, cz], [0, 0, 0], "s24status", 1.8);
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.035, 0.045, 0.02), BLACK, [cx + 0.405, 0.8, cz + s * 0.165], [0, 0, 0], "s24statusCap");
  }
  // small status pips below the louvres
  for (let i = 0; i < 3; i++) {
    P(new THREE.BoxGeometry(0.03, 0.025, 0.025), i === 1 ? AMBER : CYAN, [cx + 0.395, 0.345, cz - 0.07 + i * 0.07], [0, 0, 0], "s24pip", 1.5);
  }

  // ----- bolted cover plates on the two neighbouring facets -----
  for (const s of [1, -1]) {
    const px = cx + 0.37 * Math.cos(Math.PI / 8) + 0.012;
    const pz = cz + s * 0.37 * Math.sin(Math.PI / 8) + s * 0.0;
    const ry = -s * 22.5;
    P(new THREE.BoxGeometry(0.03, 0.3, 0.2), PLATE, [px + 0.006, 0.58, pz + s * 0.12], [0, ry, 0], "s24plate");
    // bolts at corners
    for (const dy of [-0.11, 0.11])
      for (const dz of [-0.07, 0.07]) {
        const a = (s * 22.5 * Math.PI) / 180;
        const lx = px + 0.022;
        const lz = pz + s * 0.12;
        P(
          new THREE.CylinderGeometry(0.015, 0.015, 0.02, 6),
          METAL,
          [lx + Math.sin(a) * dz * -0 + Math.sin(a) * dz * 0 + dz * Math.sin(a) * -1 * -1 * 0 + dz * -Math.sin(a) * -1 * 0 + Math.sin(a) * dz, 0.58 + dy, lz + Math.cos(a) * dz * s * 0 + dz * Math.cos(a) * s],
          [0, ry, 90],
          "s24bolt",
        );
      }
  }

  // ----- fan hub inside the top intake -----
  const fy = 0.965;
  P(new THREE.CylinderGeometry(0.3, 0.3, 0.012, 10), "#141a20", [cx, 0.962, cz], [0, 0, 0], "s24fanDisc");
  P(new THREE.CylinderGeometry(0.06, 0.07, 0.05, 8), METAL, [cx, fy + 0.02, cz], [0, 0, 0], "s24hub");
  P(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 6), CYAN, [cx, fy + 0.05, cz], [0, 0, 0], "s24hubCore", 1.8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = 0.17;
    P(
      new THREE.BoxGeometry(0.2, 0.012, 0.055),
      i % 2 ? ARMOR : METAL,
      [cx + Math.sin(a) * r, fy + 0.01, cz + Math.cos(a) * r],
      [0, (a * 180) / Math.PI - 90, 25],
      "s24blade",
    );
  }
  // intake guard ring and cross struts
  for (let i = 0; i < 3; i++) {
    P(new THREE.BoxGeometry(0.62, 0.015, 0.02), BLACK, [cx, 0.985, cz], [0, i * 60, 0], "s24guard");
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addDetails(b: Builder) {
  const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
  const box = (name: string, size: number[], at: number[], color: string, rot?: number[], g = 0) => {
    const p = b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at: V(at[0], at[1], at[2]),
      name,
      ...(rot ? { rotation: V(rot[0], rot[1], rot[2]) } : {}),
    });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (name: string, r: number, h: number, seg: number, at: number[], color: string, rot?: number[], g = 0) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, h, seg), color, {
      at: V(at[0], at[1], at[2]),
      name,
      ...(rot ? { rotation: V(rot[0], rot[1], rot[2]) } : {}),
    });
    if (g) glow(p, g);
    return p;
  };

  // ======== thrusterVentsR: rear-right pod (podRL is at x=+1.3 in stage 1; request places it at -x side) ========
  // Outer face of the rear-right pod: at x = -1.65 facing -X.
  {
    const x = -1.62;
    const y0 = 0.6;
    const z0 = -1.6;
    // backing plate
    box("s25VentPlate", [0.04, 0.46, 0.64], [x, y0, z0], "#2f3a33");
    // heat vent louvres (slanted slats)
    for (let i = 0; i < 6; i++) {
      const y = y0 + 0.17 - i * 0.065;
      box("s25Louvre", [0.05, 0.025, 0.4], [x - 0.02, y, z0 - 0.08], "#0f1217", [-18, 0, 0]);
      box("s25LouvreLip", [0.03, 0.012, 0.4], [x - 0.035, y - 0.012, z0 - 0.08], "#5d6670", [-18, 0, 0]);
    }
    // magenta status strip
    box("s25StatusStrip", [0.03, 0.4, 0.04], [x - 0.03, y0, z0 + 0.25], "#ff2fa8", undefined, 1.6);
    // status dots
    for (let i = 0; i < 3; i++)
      box("s25StatusDot", [0.03, 0.03, 0.03], [x - 0.03, y0 + 0.17 - i * 0.07, z0 + 0.15], i === 1 ? "#ffb02e" : "#19f0ff", undefined, 1.4);
    // bolted cover plates with bolts
    for (const dz of [-0.26, 0.28]) {
      box("s25CoverPlate", [0.03, 0.14, 0.1], [x - 0.025, y0 - 0.19, z0 + dz], "#242a30");
    }
    for (const dz of [-0.3, -0.22, 0.24, 0.32]) {
      cyl("s25Bolt", 0.012, 0.03, 6, [x - 0.045, y0 - 0.19, z0 + dz], "#5d6670", [0, 0, 90]);
    }
    for (const [dy, dz] of [[0.2, -0.28], [0.2, 0.28], [-0.2, -0.28], [-0.2, 0.28]]) {
      cyl("s25CornerBolt", 0.014, 0.03, 6, [x - 0.04, y0 + dy, z0 + dz], "#5d6670", [0, 0, 90]);
    }
    // stabiliser fin angled outward
    const finOutline: [number, number][] = [
      [0, 0],
      [0.55, 0],
      [0.38, 0.28],
      [0.08, 0.3],
    ];
    b.extrude(finOutline, {
      at: V(x - 0.02, y0 + 0.05, z0 - 0.3),
      x: [0, 0, 1],
      y: [-0.55, 0.85, 0],
      thickness: 0.035,
      bevel: 0.006,
      color: "#242a30",
      name: "s25StabFin",
    });
    box("s25FinEdge", [0.1, 0.02, 0.5], [x - 0.12, y0 + 0.28, z0 + 0.02], "#ff2fa8", [0, 0, -30], 1.2);
  }

  // ======== doorInsignia: left cab door at x ~ +0.93 facing +X ========
  {
    const x = 0.93;
    const y0 = 1.35;
    const z0 = 0.3;
    // emblem drawing
    const badge = svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill="#0f1217" stroke="#19f0ff" stroke-width="4"/>
        <polygon points="50,12 85,32 85,68 50,88 15,68 15,32" fill="none" stroke="#ff2fa8" stroke-width="2"/>
        <ellipse cx="50" cy="42" rx="19" ry="17" fill="#ff2fa8"/>
        <rect x="38" y="54" width="24" height="12" rx="2" fill="#ff2fa8"/>
        <ellipse cx="42" cy="42" rx="5" ry="6" fill="#0f1217"/>
        <ellipse cx="58" cy="42" rx="5" ry="6" fill="#0f1217"/>
        <polygon points="50,48 47,55 53,55" fill="#0f1217"/>
        <path d="M43 60 v6 M50 60 v6 M57 60 v6" stroke="#0f1217" stroke-width="2.5"/>
        <path d="M14 50 H26 L30 44 H36 M86 50 H74 L70 56 H64" stroke="#19f0ff" stroke-width="2.5" fill="none"/>
        <circle cx="36" cy="44" r="2.5" fill="#19f0ff"/><circle cx="64" cy="56" r="2.5" fill="#19f0ff"/>
      </svg>`,
      { size: 256 },
    );
    const badgeP = b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      at: V(x + 0.012, y0 + 0.05, z0),
      dir: [1, 0, 0],
      axis: "z",
      texture: badge,
      name: "s25Badge",
    });
    glow(badgeP, 0.9);
    // numerals
    const nums = svg(
      `<svg viewBox="0 0 80 30" xmlns="http://www.w3.org/2000/svg"><text x="40" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#19f0ff">07-X</text></svg>`,
      { size: 192 },
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.24, 0.09), "#ffffff", {
        at: V(x + 0.012, y0 - 0.2, z0),
        dir: [1, 0, 0],
        axis: "z",
        texture: nums,
        name: "s25Numerals",
      }),
      1.2,
    );
    // door handle
    box("s25HandleBase", [0.03, 0.05, 0.2], [x + 0.015, y0 - 0.04, z0 - 0.38], "#0f1217");
    box("s25Handle", [0.04, 0.035, 0.16], [x + 0.04, y0 - 0.04, z0 - 0.38], "#5d6670");
    box("s25HandleLed", [0.02, 0.02, 0.02], [x + 0.045, y0 - 0.04, z0 - 0.3], "#19f0ff", undefined, 1.5);
    // armoured window slit trim around side glass
    box("s25TrimTop", [0.03, 0.035, 1.0], [x + 0.01, y0 + 0.4, z0 + 0.05], "#242a30");
    box("s25TrimFront", [0.03, 0.4, 0.035], [x + 0.01, y0 + 0.22, z0 + 0.52], "#242a30", [0, 0, 0]);
    box("s25TrimRear", [0.03, 0.4, 0.035], [x + 0.01, y0 + 0.22, z0 - 0.45], "#242a30");
    // door seams
    box("s25SeamF", [0.012, 0.6, 0.012], [x + 0.005, y0 - 0.05, z0 + 0.55], "#0f1217");
    box("s25SeamR", [0.012, 0.6, 0.012], [x + 0.005, y0 - 0.05, z0 - 0.55], "#0f1217");
    // hinge bolts
    for (const dy of [0.2, -0.3]) cyl("s25Hinge", 0.02, 0.04, 6, [x + 0.02, y0 + dy, z0 + 0.55], "#5d6670", [0, 0, 90]);
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addHoodScoop(b: Builder) {
  type V = [number, number, number];
  const box = (name: string, size: V, at: V, color: string, rot?: V, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      ...(rot ? { rotation: rot } : {}),
    });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (name: string, r: number, h: number, seg: number, at: V, color: string, rot?: V, g = 0) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, h, seg), color, {
      at,
      name,
      ...(rot ? { rotation: rot } : {}),
    });
    if (g) glow(p, g);
    return p;
  };

  // ================= HOOD SCOOP =================
  // hood top sits near y = 1.25 (tilted -4 deg about x), centred z = 1.95
  const hy = 1.3;
  // scoop body: wedge extrusion in side view (z forward)
  b.extrude(
    [
      [0, 0],
      [0.7, 0],
      [0.55, 0.12],
      [0.12, 0.2, "sharp"],
      [0, 0.2],
    ],
    { at: [0, hy + 0.02, 1.75], x: [0, 0, 1], thickness: [0.5, 0.34], bevel: 0.01, color: ARMOR, name: "scoopBody" },
  );
  // scoop side cheeks (angled)
  for (const s of [1, -1]) {
    box("scoopCheek", [0.05, 0.14, 0.62], [s * 0.26, hy + 0.09, 2.05], HULL_DARK, [-8, 0, s * 12]);
    // intake edge glow strip
    box("scoopEdge", [0.03, 0.03, 0.4], [s * 0.2, hy + 0.2, 2.15], CYAN, [-10, 0, 0], 1.6);
  }
  // front intake lip glow
  box("intakeLip", [0.36, 0.035, 0.04], [0, hy + 0.12, 2.4], CYAN, undefined, 1.8);
  box("intakeMouth", [0.34, 0.08, 0.05], [0, hy + 0.07, 2.39], BLACK);
  // intake slats
  for (let i = 0; i < 4; i++) box("scoopSlat", [0.3, 0.015, 0.2], [0, hy + 0.2 + i * 0.0, 1.92 + i * 0.1], BLACK, [-12, 0, 0]);
  // top plate ridge
  box("scoopTop", [0.3, 0.03, 0.55], [0, hy + 0.23, 2.0], METAL, [-10, 0, 0]);

  // exposed bolts: two pairs
  for (const s of [1, -1])
    for (const z of [1.45, 2.4]) {
      cyl("hoodBolt", 0.025, 0.03, 6, [s * 0.62, 1.27 - (z - 1.95) * 0.07, z], METAL);
      cyl("hoodBoltCap", 0.012, 0.035, 4, [s * 0.62, 1.285 - (z - 1.95) * 0.07, z], BLACK);
    }

  // wiper rack at windshield base
  box("wiperTray", [1.4, 0.05, 0.1], [0, 1.27, 1.2], BLACK);
  for (const s of [1, -1]) {
    box("wiperArm", [0.02, 0.02, 0.5], [s * 0.35, 1.31, 1.2], METAL, [0, s * 25, 0]);
    box("wiperBlade", [0.03, 0.025, 0.55], [s * 0.35, 1.32, 1.2], BLACK, [0, s * 25, 0]);
    cyl("wiperPivot", 0.025, 0.05, 6, [s * 0.5, 1.3, 1.0], METAL);
  }

  // magenta hood-edge lines
  box("hoodEdgeFront", [1.8, 0.02, 0.025], [0, 1.255, 2.7], MAGENTA, undefined, 1.4);
  for (const s of [1, -1]) box("hoodEdgeSide", [0.025, 0.02, 1.4], [s * 0.91, 1.27, 1.95], MAGENTA, [-4, 0, 0], 1.4);

  // ================= TAILGATE =================
  const tz = -2.77;
  // RED light strip
  box("tailStrip", [1.6, 0.06, 0.03], [0, 1.4, tz], RED, undefined, 1.8);
  box("tailStripFrame", [1.7, 0.1, 0.02], [0, 1.4, tz + 0.01], BLACK);

  // holo licence plate with svg
  const plateTex = svg(
    `<svg viewBox="0 0 120 60"><rect x="2" y="2" width="116" height="56" rx="6" fill="#06222c" stroke="#19f0ff" stroke-width="3"/>
    <text x="60" y="34" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#19f0ff">HV-2077</text>
    <path d="M10 48 H110" stroke="#ff2fa8" stroke-width="3"/><path d="M10 12 H40" stroke="#19f0ff" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  box("plateBack", [0.5, 0.26, 0.03], [0, 1.2, tz], BLACK);
  const plate = b.part(new THREE.PlaneGeometry(0.44, 0.22), "#ffffff", {
    at: [0, 1.2, tz - 0.02],
    dir: [0, 0, -1],
    axis: "z",
    texture: plateTex,
    name: "licencePlate",
  });
  glow(plate, 1.3);
  box("plateLamp", [0.2, 0.03, 0.04], [0, 1.36, tz - 0.01], WHITE, undefined, 1.2);

  // hinge latches and tow shackles
  for (const s of [1, -1]) {
    box("latchBase", [0.14, 0.14, 0.05], [s * 0.7, 1.2, tz], METAL);
    box("latchHook", [0.05, 0.08, 0.05], [s * 0.7, 1.19, tz - 0.04], ARMOR);
    cyl("latchBolt", 0.02, 0.05, 6, [s * 0.7, 1.25, tz - 0.05], BLACK, [90, 0, 0]);
    // tow shackle: U of boxes
    box("shackleBracket", [0.12, 0.1, 0.06], [s * 0.4, 1.0, tz - 0.02], METAL);
    box("shackleL", [0.025, 0.14, 0.025], [s * 0.4 - 0.05, 0.92, tz - 0.08], METAL);
    box("shackleR", [0.025, 0.14, 0.025], [s * 0.4 + 0.05, 0.92, tz - 0.08], METAL);
    box("shackleBase", [0.125, 0.025, 0.025], [s * 0.4, 0.85, tz - 0.08], METAL);
    cyl("shacklePin", 0.02, 0.14, 6, [s * 0.4, 1.0, tz - 0.08], BLACK, [0, 0, 90]);
    // corner armour
    box("tailCorner", [0.1, 0.4, 0.05], [s * 0.9, 1.25, tz], ARMOR);
    box("tailMark", [0.1, 0.02, 0.04], [s * 0.9, 1.1, tz - 0.03], AMBER, undefined, 1.0);
  }
  // bottom cyan edge line
  box("tailEdge", [1.6, 0.02, 0.025], [0, 1.06, tz - 0.01], CYAN, undefined, 1.2);
}
```