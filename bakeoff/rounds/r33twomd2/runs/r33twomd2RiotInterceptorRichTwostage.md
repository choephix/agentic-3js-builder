<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "roofPlate",
    what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.",
    at: [0, 1.78, 0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [1.6, 0.2, 0.3],
  },
  {
    id: "frontBar",
    kind: "add",
    part: "hull",
    what: "Front bumper neon strip with CYAN lamps, a mesh grille below it and two amber fog lamps.",
    at: [0, 0.75, 2.5],
    normal: [0, 0, 1],
    bone: null,
    room: [1.8, 0.5, 0.3],
  },
  {
    id: "cannonFittings",
    kind: "add",
    part: "cannonBarrel",
    what: "Water cannon fittings: muzzle ring with nozzle detail, pressure hoses to the turret, glowing CYAN coolant bands.",
    at: [0, 2.15, 1.4],
    normal: [0, 0, 1],
    bone: null,
    room: [0.5, 0.5, 1.0],
  },
  {
    id: "sideStripe",
    kind: "add",
    part: "hull",
    what: "Neon side stripe in MAGENTA along the left flank with small corporate emblem plate and door handle.",
    at: [1.0, 0.95, 0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.3, 2.4],
  },
  {
    id: "rearLights",
    kind: "add",
    part: "hull",
    what: "Rear tail light bar in RED neon, exhaust-vent stack, tow hook and license plate.",
    at: [0, 1.0, -2.5],
    normal: [0, 0, -1],
    bone: null,
    room: [1.8, 0.5, 0.3],
  },
  {
    id: "windowShield",
    kind: "add",
    part: "windshield",
    what: "Wire cage over the windshield, wiper blades, and small HUD-glow strip along the top edge.",
    at: [0, 1.5, 1.35],
    normal: [0, 0.5, 1],
    bone: null,
    room: [1.6, 0.6, 0.3],
  },
  {
    id: "wheelDetails",
    kind: "add",
    part: "wheelFL",
    what: "Wheel hubs: spoked rims with CYAN neon ring and lug nuts, brake calipers, for all four wheels.",
    at: [1.0, 0.45, 1.5],
    normal: [1, 0, 0],
    bone: null,
    room: [0.3, 0.8, 0.8],
  },
  {
    id: "roofAntenna",
    kind: "add",
    part: "roofPlate",
    what: "Antenna array at the rear of the roof: two whip antennas, a small dish, a sensor pod with a red blinking lamp.",
    at: [-0.5, 1.8, -0.8],
    normal: [0, 1, 0],
    bone: null,
    room: [0.6, 0.8, 0.6],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "hull",
    what: "Corporate livery on hull: HULL navy with HULL_DARK hazard chevrons near the bottom skirt and a faded unit number on the doors.",
  },
  {
    id: "armorPlates",
    kind: "texture",
    part: "armor",
    what: "Scratched, scuffed armour plating with rivets and warning stencil text in YELLOW.",
  },
  {
    id: "cannonPaint",
    kind: "texture",
    part: "cannonBarrel",
    what: "Brushed steel with water-stain streaks and a MAGENTA corporate logo band.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const HULL = "#1c2233";
const HULL_DARK = "#10131d";
const ARMOR = "#2d3550";
const STEEL = "#6b7385";
const GLASS = "#0b2a3a";
const TIRE = "#0a0a0c";
const RIM = "#9aa3b5";
const CYAN = "#19f3ff";
const MAGENTA = "#ff2bd6";
const YELLOW = "#ffd21f";
const RED = "#ff2a3a";

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(g, c, { at: at as [number, number, number], name, rotation: rot as [number, number, number] | undefined });

  // chassis
  P(box(2.0, 0.5, 4.8), HULL_DARK, [0, 0.55, 0], "chassis");
  // main hull lower body
  P(box(2.1, 0.55, 4.6), HULL, [0, 0.95, 0], "hull");
  // hood sloped
  P(box(1.9, 0.3, 1.5), HULL, [0, 1.15, 1.6], "hood", [8, 0, 0]);
  // cab
  P(box(1.9, 0.7, 2.2), HULL, [0, 1.45, -0.3], "cab");
  P(box(1.7, 0.1, 2.0), ARMOR, [0, 1.83, -0.3], "roofPlate");
  // windshield
  P(box(1.7, 0.55, 0.08), GLASS, [0, 1.5, 0.85], "windshield", [-28, 0, 0]);
  // side windows
  for (const s of [1, -1]) {
    P(box(0.06, 0.4, 1.5), GLASS, [s * 0.96, 1.5, -0.3], "sideWindow");
    P(box(0.12, 0.45, 2.0), ARMOR, [s * 1.0, 0.95, -0.2], "armor");
    P(box(0.1, 0.25, 0.9), ARMOR, [s * 1.0, 0.95, 1.5], "armor");
  }
  P(box(1.7, 0.4, 0.08), GLASS, [0, 1.5, -1.42], "rearWindow");
  // bumpers
  P(box(2.2, 0.35, 0.35), ARMOR, [0, 0.6, 2.45], "armor");
  P(box(2.2, 0.15, 0.2), STEEL, [0, 0.4, 2.55], "ramBar");
  P(box(2.2, 0.35, 0.3), ARMOR, [0, 0.65, -2.4], "armor");
  // fenders / wheel arches
  const wheelPos: [string, number, number][] = [
    ["wheelFL", 1, 1.55], ["wheelFR", -1, 1.55], ["wheelRL", 1, -1.55], ["wheelRR", -1, -1.55],
  ];
  for (const [n, s, z] of wheelPos) {
    P(box(0.35, 0.18, 1.1), HULL_DARK, [s * 1.05, 0.85, z], "arch");
    P(new THREE.CylinderGeometry(0.46, 0.46, 0.38, 14), TIRE, [s * 1.0, 0.46, z], n, [0, 0, 90]);
    P(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 10), RIM, [s * 1.0, 0.46, z], "rim", [0, 0, 90]);
    glow(P(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 10), CYAN, [s * 1.0, 0.46, z], "rimGlow", [0, 0, 90]), 1);
  }
  // turret + water cannon
  P(new THREE.CylinderGeometry(0.4, 0.46, 0.2, 10), ARMOR, [0, 1.98, -0.6], "turretBase");
  P(box(0.6, 0.35, 0.7), HULL, [0, 2.2, -0.5], "turret");
  P(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 10), STEEL, [0, 2.25, 0.4], "cannonBarrel", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.14, 0.1, 0.25, 10), ARMOR, [0, 2.25, 1.3], "cannonMuzzle", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 10), STEEL, [0, 2.0, -1.2], "tank", [0, 0, 90]);
  // lights
  glow(P(box(1.4, 0.07, 0.07), CYAN, [0, 1.93, 0.55], "lightBarFront"), 1.5);
  glow(P(box(1.5, 0.08, 0.05), CYAN, [0, 0.75, 2.64], "bumperNeon"), 1.4);
  glow(P(box(1.5, 0.08, 0.05), RED, [0, 1.0, -2.32], "tailNeon"), 1.4);
  for (const s of [1, -1]) {
    glow(P(box(0.05, 0.06, 1.8), MAGENTA, [s * 1.07, 0.85, -0.1], "sideNeon"), 1.2);
    glow(P(box(0.22, 0.12, 0.05), YELLOW, [s * 0.7, 0.95, 2.34], "headlamp"), 1.2);
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

- **hullCamo**: the hull gets navy livery with panel seams. A HULL_DARK and yellow-edged hazard chevron band runs along the lower skirt, and a faded door panel with unit-number bars sits on each flank.
- **armorPlates**: every `armor` part gets scuffed dark steel-blue plating with scratches, a rivet grid and seam lines. Warning-stencil YELLOW diagonal blocks and bars appear on the faces.
- **cannonPaint**: the `cannonBarrel` is brushed steel with vertical-streak water stains, and a MAGENTA corporate band with dark edge lines sits near the muzzle.

<<<<<<< SEARCH
import { createBuilder, type Builder } from "agentic-3js-builder";
=======
import { createBuilder, paint, mix, noise, smoothstep, type Builder } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
=======
const hex = (c: string) => {
  const k = new THREE.Color(c);
  return [k.r, k.g, k.b] as [number, number, number];
};
const fr = (x: number) => x - Math.floor(x);

const HULL_PAINT = paint((p, n) => {
  let c = mix(hex(HULL), hex("#2a3350"), 0.5 * smoothstep(0.5, 1, n.y));
  c = mix(c, hex(HULL_DARK), 0.35 * smoothstep(0.35, 0.8, noise(p, 0.3, 3)));
  const side = Math.abs(n.x) > 0.7;
  // panel seams
  const sz = side ? p.z : p.x;
  if (Math.abs(fr(sz / 0.9) - 0.5) > 0.495) c = mix(c, hex(HULL_DARK), 0.8);
  // hazard chevrons on lower skirt
  if (p.y > 0.68 && p.y < 0.8 && n.y < 0.6) {
    const u = side ? p.z : p.x;
    const v = fr((u + Math.abs(p.y - 0.74) * 1.2) / 0.22);
    c = v < 0.5 ? hex(HULL_DARK) : hex(YELLOW);
    c = mix(c, hex(HULL_DARK), 0.35);
  } else if (p.y > 0.8 && p.y < 0.83 && n.y < 0.6) c = mix(c, hex(YELLOW), 0.5);
  // faded unit number on doors
  if (side && p.y > 0.95 && p.y < 1.15 && p.z > -0.7 && p.z < -0.1) {
    const u = (p.z + 0.7) / 0.6;
    const digit = (u > 0.1 && u < 0.4) || (u > 0.6 && u < 0.9);
    const bar = Math.abs(p.y - 1.05) < 0.015 || (u > 0.1 && u < 0.14) || (u > 0.36 && u < 0.4) || (u > 0.6 && u < 0.64) || (u > 0.86 && u < 0.9);
    if (digit && bar) c = mix(c, hex("#cfd6e6"), 0.55 * (0.5 + 0.5 * noise(p, 0.05, 8)));
  }
  return c;
});

const ARMOR_PAINT = paint((p, n) => {
  let c = mix(hex(ARMOR), hex("#46506d"), 0.5 * noise(p, 0.25, 11));
  c = mix(c, hex("#1a1f30"), 0.5 * smoothstep(0.6, 0.8, noise(p, 0.07, 12)));
  // scratches
  const sc = noise(new THREE.Vector3(p.x * 14 + p.y * 3, p.y * 2, p.z * 14), 0.2, 13);
  if (sc > 0.66) c = mix(c, hex("#b8c0d4"), 0.5);
  // rivets
  const ax = Math.abs(n.x), az = Math.abs(n.z);
  const [u, v] = ax > az && ax > 0.5 ? [p.z, p.y] : az > 0.5 ? [p.x, p.y] : [p.x, p.z];
  const du = (fr(u / 0.12) - 0.5) * 0.12, dv = (fr(v / 0.12) - 0.5) * 0.12;
  if (Math.hypot(du, dv) < 0.012) c = mix(c, hex("#cdd3e2"), 0.7);
  // warning stencil blocks
  const sx = ax > az ? p.z : p.x;
  if (Math.abs(sx % 0.5) < 0.25 && p.y > 0.55 && p.y < 0.7 && n.y < 0.7) {
    const stripe = fr((u + v) / 0.1) < 0.5;
    if (stripe) c = mix(c, hex(YELLOW), 0.8 * smoothstep(0.2, 0.5, noise(p, 0.1, 14) + 0.3));
  }
  if (Math.abs(p.y - 0.6) < 0.012 && n.y < 0.7) c = mix(c, hex(YELLOW), 0.5);
  return c;
});

const CANNON_PAINT = paint((p) => {
  const streak = noise(new THREE.Vector3(p.x * 18, p.y * 18, p.z * 1.2), 0.3, 21);
  let c = mix(hex("#7c8497"), hex("#b5bccd"), streak);
  c = mix(c, hex("#3f5a66"), 0.45 * smoothstep(0.62, 0.8, noise(new THREE.Vector3(p.x * 10, p.y * 2, p.z * 10), 0.3, 22)));
  if (p.z > 0.52 && p.z < 0.78) {
    c = hex(MAGENTA);
    if (p.z < 0.55 || p.z > 0.75) c = hex("#18121f");
    else if (Math.abs(p.z - 0.65) < 0.015 && p.x > -0.03) c = mix(c, hex("#ffffff"), 0.6);
  }
  return c;
});

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(g, c, { at: at as [number, number, number], name, rotation: rot as [number, number, number] | undefined });
=======
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name?: string, rot?: number[]) => {
    const fill = name === "hull" ? HULL_PAINT : name === "armor" ? ARMOR_PAINT : name === "cannonBarrel" ? CANNON_PAINT : c;
    return b.part(g, fill, { at: at as [number, number, number], name, rotation: rot as [number, number, number] | undefined });
  };
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofLightBar(b: Builder) {
  const Y = 1.88; // top of roof plate (1.83 + 0.05)
  const Z = 0.2;
  const BRACKET = "#161a26";
  const HOUSING = "#0d0f17";
  const P = (g: THREE.BufferGeometry, c: string, at: [number, number, number], name: string, rot?: [number, number, number]) =>
    b.part(g, c, { at, name, rotation: rot });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // housing: slim base rail and top shell
  P(box(1.56, 0.04, 0.26), HOUSING, [0, Y + 0.02, Z], "lbBase");
  P(box(1.5, 0.05, 0.05), HOUSING, [0, Y + 0.115, Z - 0.1], "lbBackRail");
  P(box(1.5, 0.03, 0.22), HOUSING, [0, Y + 0.175, Z], "lbCap", [-6, 0, 0]);
  // end caps
  for (const s of [1, -1]) {
    P(box(0.05, 0.14, 0.26), HOUSING, [s * 0.78, Y + 0.09, Z], "lbEnd");
    P(box(0.03, 0.06, 0.28), STEEL, [s * 0.8, Y + 0.09, Z], "lbEndTrim");
  }
  // brackets and feet
  for (const x of [-0.62, -0.2, 0.2, 0.62]) {
    P(box(0.06, 0.1, 0.18), BRACKET, [x, Y + 0.07, Z], "lbBracket");
    P(box(0.12, 0.015, 0.22), STEEL, [x, Y + 0.005, Z], "lbFoot");
    for (const dz of [-0.07, 0.07]) P(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), STEEL, [x, Y + 0.018, Z + dz], "lbBolt");
  }
  // lamps: six, alternating cyan / magenta
  const lampX = [-0.6, -0.36, -0.12, 0.12, 0.36, 0.6];
  lampX.forEach((x, i) => {
    const c = i % 2 === 0 ? CYAN : MAGENTA;
    glow(P(box(0.2, 0.09, 0.05), c, [x, Y + 0.095, Z + 0.1], "lbLamp"), 1.6);
    // lens frame
    P(box(0.22, 0.012, 0.055), HOUSING, [x, Y + 0.145, Z + 0.1], "lbVisorTop");
    P(box(0.22, 0.012, 0.055), HOUSING, [x, Y + 0.045, Z + 0.1], "lbVisorBottom");
    // rear small accent
    glow(P(box(0.08, 0.02, 0.02), c, [x, Y + 0.12, Z - 0.13], "lbRearLamp"), 1.1);
    // divider
    if (i < 5) P(box(0.02, 0.1, 0.06), HOUSING, [x + 0.12, Y + 0.095, Z + 0.1], "lbDivider");
  });
  // center beacon dome
  glow(P(new THREE.SphereGeometry(0.045, 6, 4), YELLOW, [0, Y + 0.2, Z], "lbBeacon"), 1.3);
  // power conduit running to the roof edge
  P(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 6), BRACKET, [0.82, Y + 0.02, Z - 0.2], "lbConduit", [90, 0, 0]);
  // warning stripe decal on base
  for (let i = 0; i < 8; i++) {
    P(box(0.05, 0.006, 0.05), i % 2 ? YELLOW : HOUSING, [-0.7 + i * 0.2, Y + 0.044, Z - 0.1], "lbHazard");
  }
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addFrontBar(b: Builder) {
  const AMBER = "#ffa31a";
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, opts: object = {}) =>
    b.part(g, c, { at: at as [number, number, number], name, ...opts });

  // neon strip housing + frame (strip itself is stage 1's bumperNeon at z~2.64)
  P(box(1.76, 0.14, 0.1), HULL_DARK, [0, 0.75, 2.58], "s22neonHousing");
  P(box(1.7, 0.02, 0.06), STEEL, [0, 0.83, 2.62], "s22neonTopTrim");
  P(box(1.7, 0.02, 0.06), STEEL, [0, 0.67, 2.62], "s22neonBotTrim");

  // cyan lamps along the strip
  for (let i = 0; i < 7; i++) {
    const x = -0.78 + i * 0.26;
    glow(P(box(0.1, 0.05, 0.03), CYAN, [x, 0.75, 2.68], "s22lamp" + i), 1.8);
    P(box(0.02, 0.1, 0.05), HULL_DARK, [x + 0.13, 0.75, 2.66], "s22lampDiv" + i);
  }

  // mesh grille texture
  const mesh = svg(
    `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="24" fill="#05070b"/>
      <g stroke="#7f8aa3" stroke-width="1.6">
        ${Array.from({ length: 17 }, (_, i) => `<path d="M${i * 4} 0 L${i * 4 - 24} 24"/><path d="M${i * 4 - 24} 0 L${i * 4} 24"/>`).join("")}
      </g>
      <rect x="0" y="0" width="64" height="2" fill="#19f3ff" opacity="0.5"/>
      <rect x="0.5" y="0.5" width="63" height="23" fill="none" stroke="#2d3550" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
  P(new THREE.PlaneGeometry(1.5, 0.3), "#ffffff", [0, 0.53, 2.74], "s22grille", {
    texture: mesh, dir: [0, 0, 1], axis: "z",
  });
  // grille frame
  P(box(1.6, 0.04, 0.08), ARMOR, [0, 0.69, 2.7], "s22grilleTop");
  P(box(1.6, 0.04, 0.08), ARMOR, [0, 0.37, 2.7], "s22grilleBot");
  for (const s of [1, -1]) P(box(0.04, 0.34, 0.08), ARMOR, [s * 0.8, 0.53, 2.7], "s22grilleSide");
  for (const x of [-0.4, 0, 0.4]) P(box(0.03, 0.3, 0.06), STEEL, [x, 0.53, 2.72], "s22grilleBar");

  // amber fog lamps in the outer corners
  for (const s of [1, -1]) {
    const x = s * 0.88;
    P(new THREE.CylinderGeometry(0.1, 0.11, 0.08, 10), HULL_DARK, [x, 0.53, 2.68], "s22fogBezel", { rotation: [90, 0, 0] });
    glow(P(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10), AMBER, [x, 0.53, 2.72], "s22fog" + s, { rotation: [90, 0, 0] }), 1.6);
    P(box(0.2, 0.025, 0.06), STEEL, [x, 0.65, 2.7], "s22fogBrow");
  }

  // corner bolts and tow loops
  for (const s of [1, -1]) {
    for (const y of [0.7, 0.4]) P(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), STEEL, [s * 1.02, y, 2.64], "s22bolt", { rotation: [90, 0, 0] });
    P(box(0.05, 0.1, 0.12), STEEL, [s * 0.5, 0.28, 2.6], "s22towBracket");
  }
  P(new THREE.TorusGeometry(0.07, 0.015, 5, 10), STEEL, [0.5, 0.2, 2.62], "s22towLoop");
  P(new THREE.TorusGeometry(0.07, 0.015, 5, 10), STEEL, [-0.5, 0.2, 2.62], "s22towLoop");

  // hazard stripe plate under bumper
  const hazard = svg(
    `<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="8" fill="#10131d"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 8} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 8Z" fill="#ffd21f"/>`).join("")}</svg>`,
    { size: 256 },
  );
  P(new THREE.PlaneGeometry(1.9, 0.08), "#ffffff", [0, 0.9, 2.64], "s22hazard", {
    texture: hazard, dir: [0, 0, 1], axis: "z",
  });
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addCannonFittings(b: Builder) {
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[], tex?: THREE.Texture) =>
    b.part(g, c, {
      at: at as [number, number, number],
      name,
      rotation: rot as [number, number, number] | undefined,
      texture: tex,
    });
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---- Water cannon fittings (barrel along z at y=2.25, z from -0.4 to 1.2, muzzle at ~1.3)
  const BY = 2.25;
  // muzzle ring + nozzle
  P(cyl(0.17, 0.17, 0.08, 12), STEEL, [0, BY, 1.46], "s23muzzleRing", [90, 0, 0]);
  P(cyl(0.1, 0.13, 0.12, 10), HULL_DARK, [0, BY, 1.54], "s23nozzle", [90, 0, 0]);
  P(cyl(0.06, 0.06, 0.03, 8), "#000000", [0, BY, 1.61], "s23nozzleHole", [90, 0, 0]);
  // flange bolts around the ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(cyl(0.015, 0.015, 0.03, 6), RIM, [Math.cos(a) * 0.155, BY + Math.sin(a) * 0.155, 1.5], "s23bolt", [90, 0, 0]);
  }
  // glowing coolant bands along barrel
  for (const z of [0.0, 0.4, 0.8]) {
    glow(P(cyl(0.128, 0.128, 0.05, 12), CYAN, [0, BY, z], "s23coolantBand", [90, 0, 0]), 1.4);
    P(cyl(0.135, 0.135, 0.02, 12), ARMOR, [0, BY, z + 0.05], "s23bandClamp", [90, 0, 0]);
  }
  // magenta logo band (svg texture)
  const logo = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#12141c"/><path d="M4 12 L10 4 L16 12 M20 4 H34 M20 12 H34 M20 4 V12 M40 4 L52 12 M40 12 L52 4" stroke="#ff2bd6" stroke-width="2.4" fill="none"/></svg>`,
    { size: 128 },
  );
  P(box(0.01, 0.0, 0.0).clone(), STEEL, [0, BY, 0], "s23dummy");
  P(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", [0.131, BY + 0.0, 0.62], "s23logoR", undefined, logo).mesh.rotation.set(0, Math.PI / 2, 0);
  // pressure hoses from barrel base to tank/turret
  const hose = (x: number) => {
    const s = Math.sign(x);
    const pts = [
      new THREE.Vector3(s * 0.13, BY - 0.02, -0.2),
      new THREE.Vector3(s * 0.3, BY + 0.12, -0.5),
      new THREE.Vector3(s * 0.38, BY - 0.1, -0.9),
      new THREE.Vector3(s * 0.22, 2.05, -1.15),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(curve, 14, 0.035, 6);
    b.part(g, HULL_DARK, { at: [0, 0, 0], name: "s23hose" });
    for (const t of [0.2, 0.5, 0.8]) {
      const p = curve.getPoint(t);
      P(cyl(0.045, 0.045, 0.04, 8), STEEL, [p.x, p.y, p.z], "s23hoseClamp", [0, 0, 90]);
    }
    const e = pts[3];
    P(cyl(0.06, 0.06, 0.06, 8), STEEL, [e.x, e.y, e.z], "s23hoseCoupler");
  };
  hose(1);
  hose(-1);
  // pressure gauge on turret
  P(cyl(0.05, 0.05, 0.03, 12), STEEL, [0, 2.25, -0.88], "s23gauge", [90, 0, 0]);
  glow(P(cyl(0.035, 0.035, 0.032, 12), CYAN, [0, 2.25, -0.885], "s23gaugeGlow", [90, 0, 0]), 1);
  // barrel support yoke
  P(box(0.34, 0.06, 0.12), ARMOR, [0, BY - 0.15, 0.1], "s23yokeBase");
  for (const s of [1, -1]) P(box(0.04, 0.17, 0.1), ARMOR, [s * 0.15, BY - 0.07, 0.1], "s23yokeArm");

  // ---- Side stripe (left flank, x ~ +1.07)
  glow(P(box(0.03, 0.05, 3.2), MAGENTA, [1.09, 1.02, -0.1], "s23stripeA"), 1.3);
  glow(P(box(0.03, 0.025, 2.6), CYAN, [1.09, 0.93, -0.1], "s23stripeB"), 1.1);
  // emblem plate
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="8" fill="#10131d" stroke="#ff2bd6" stroke-width="4"/><path d="M32 10 L52 20 V36 Q52 50 32 56 Q12 50 12 36 V20Z" fill="none" stroke="#19f3ff" stroke-width="3"/><path d="M22 28 H42 M22 36 H42 M32 20 V46" stroke="#ffd21f" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  P(box(0.02, 0.3, 0.3), HULL_DARK, [1.1, 1.2, 0.55], "s23emblemBack");
  const em = P(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", [1.122, 1.2, 0.55], "s23emblem", undefined, emblem);
  em.mesh.rotation.set(0, Math.PI / 2, 0);
  // door handle + recess
  P(box(0.02, 0.1, 0.34), "#05060a", [1.1, 1.35, -0.55], "s23handleRecess");
  P(box(0.05, 0.04, 0.24), STEEL, [1.12, 1.35, -0.55], "s23handle");
  // door seams and unit number panel
  P(box(0.012, 0.5, 0.012), "#05060a", [1.1, 1.2, -1.05], "s23seam");
  P(box(0.012, 0.5, 0.012), "#05060a", [1.1, 1.2, 0.18], "s23seam");
  // yellow warning chevrons low on the skirt
  for (let i = 0; i < 6; i++)
    P(box(0.012, 0.07, 0.14), YELLOW, [1.1, 0.74, -1.5 + i * 0.3], "s23chevron", [0, 0, 0]).mesh.rotation.x = 0.6;
  // rivets along stripe
  for (let i = 0; i < 9; i++) P(cyl(0.015, 0.015, 0.02, 6), RIM, [1.1, 1.1, -1.5 + i * 0.37], "s23rivet", [0, 0, 90]);
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRearLights(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1: number, r2: number, h: number, s = 8) => new THREE.CylinderGeometry(r1, r2, h, s);
  const P = (g: THREE.BufferGeometry, c: string, at: [number, number, number], rot?: [number, number, number], name?: string) =>
    b.part(g, c, { at, rotation: rot, name });

  const Z = -2.62; // rear face of the bumper block sits near -2.55
  const AMBER = "#ff9a1f";
  const DARKRED = "#7a0f1a";

  // ---- tail light bar: housing, emissive strip, segments
  P(box(1.7, 0.16, 0.08), HULL_DARK, [0, 1.0, -2.34], undefined, "tailHousing");
  glow(P(box(1.56, 0.07, 0.05), RED, [0, 1.0, -2.39], undefined, "tailStrip"), 1.8);
  for (let i = -3; i <= 3; i++) {
    P(box(0.025, 0.12, 0.04), HULL_DARK, [i * 0.2, 1.0, -2.42], undefined, "tailDivider");
  }
  // corner brake lamps
  for (const s of [1, -1]) {
    P(box(0.2, 0.22, 0.08), HULL_DARK, [s * 0.98, 1.0, -2.34], undefined, "brakeHousing");
    glow(P(box(0.14, 0.16, 0.05), RED, [s * 0.98, 1.0, -2.39], undefined, "brakeLamp"), 1.6);
    glow(P(box(0.14, 0.04, 0.05), AMBER, [s * 0.98, 0.86, -2.39], undefined, "indicator"), 1.3);
    // lower reflectors on bumper
    P(box(0.2, 0.06, 0.04), DARKRED, [s * 0.9, 0.5, -2.56], undefined, "reflector");
    // bumper bolts
    for (const dx of [-0.07, 0.07]) {
      P(cyl(0.025, 0.025, 0.03, 6), STEEL, [s * 0.75 + dx, 0.78, -2.56], [90, 0, 0], "bolt");
    }
  }

  // ---- license plate with painted texture
  const plate = svg(
    `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="58" rx="5" fill="#e8ecf2" stroke="#10131d" stroke-width="3"/>
      <rect x="1" y="1" width="118" height="14" rx="5" fill="#19f3ff"/>
      <text x="60" y="12" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10" fill="#10131d">NIGHT CITY</text>
      <text x="60" y="44" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="25" fill="#10131d">RC-2077</text>
      <rect x="6" y="50" width="108" height="4" fill="#ff2bd6"/>
    </svg>`,
    { size: 256 },
  );
  P(box(0.56, 0.3, 0.04), HULL_DARK, [0, 0.66, -2.565], undefined, "plateFrame");
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    at: [0, 0.66, -2.59],
    dir: [0, 0, -1],
    axis: "z",
    texture: plate,
    name: "plate",
  });
  // plate lamps
  for (const s of [1, -1]) {
    P(box(0.06, 0.04, 0.05), STEEL, [s * 0.22, 0.83, -2.58], undefined, "plateLampMount");
    glow(P(box(0.04, 0.02, 0.03), "#ffffff", [s * 0.22, 0.83, -2.6], undefined, "plateLamp"), 1.2);
  }

  // ---- exhaust vent stack (left-rear corner side, vertical stack beside cab)
  for (const s of [1, -1]) {
    const x = s * 0.72;
    P(box(0.34, 0.5, 0.2), ARMOR, [x, 1.4, -1.5], undefined, "stackBase");
    P(cyl(0.09, 0.11, 0.7, 8), STEEL, [x, 1.95, -1.52], undefined, "stackPipe");
    P(cyl(0.13, 0.13, 0.05, 8), HULL_DARK, [x, 2.32, -1.52], undefined, "stackRim");
    P(cyl(0.085, 0.085, 0.02, 8), "#000000", [x, 2.345, -1.52], undefined, "stackHole");
    for (const y of [1.7, 2.0]) P(cyl(0.125, 0.125, 0.04, 8), HULL_DARK, [x, y, -1.52], undefined, "stackBand");
    glow(P(cyl(0.115, 0.115, 0.03, 8), AMBER, [x, 1.82, -1.52], undefined, "stackHeat"), 1.2);
    // vent louvres on the hull rear
    for (let i = 0; i < 4; i++) {
      P(box(0.3, 0.025, 0.04), HULL_DARK, [s * 0.55, 1.3 + i * 0.07, -2.43], [-15, 0, 0], "louvre");
    }
  }

  // ---- tow hook
  P(box(0.3, 0.14, 0.1), STEEL, [0, 0.42, -2.5], undefined, "towMount");
  P(cyl(0.035, 0.035, 0.28, 6), STEEL, [0, 0.42, -2.64], [90, 0, 0], "towShank");
  const hook = new THREE.TorusGeometry(0.09, 0.025, 6, 10, Math.PI * 1.5);
  P(hook, STEEL, [0, 0.38, -2.76], [0, 0, 0], "towHook");
  P(cyl(0.03, 0.03, 0.04, 6), YELLOW, [0, 0.5, -2.52], [90, 0, 0], "towMark");

  // ---- hazard stripe on rear bumper
  for (let i = -5; i <= 5; i++) {
    P(box(0.09, 0.07, 0.03), i % 2 ? YELLOW : HULL_DARK, [i * 0.18, 0.5 + 0.0, -2.56], [0, 0, 25], "hazard");
  }

  // ---- mud flaps behind rear wheels
  for (const s of [1, -1]) {
    P(box(0.04, 0.3, 0.35), TIRE, [s * 1.0, 0.45, -2.1], undefined, "mudflap");
    glow(P(box(0.045, 0.03, 0.2), CYAN, [s * 1.0, 0.58, -2.1], undefined, "flapStrip"), 1);
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addWindowShield(b: Builder) {
  // Windshield: box 1.7 x 0.55 x 0.08 at [0,1.5,0.85], tilted -28deg about X.
  // Surface-plane helper: u across (x), v up the glass slope, w out of the glass.
  const tilt = (-28 * Math.PI) / 180;
  const cy = Math.cos(tilt);
  const sy = Math.sin(tilt);
  const base = new THREE.Vector3(0, 1.5, 0.85);
  const on = (u: number, v: number, w: number): [number, number, number] => {
    // local (u, v, w) -> model: y = v*cos - w*sin, z = v*sin + w*cos
    return [base.x + u, base.y + v * cy - w * sy, base.z + v * sy + w * cy];
  };
  const rotX: [number, number, number] = [-28, 0, 0];
  const part = (g: THREE.BufferGeometry, c: string, p: [number, number, number], name: string, rot = rotX) =>
    b.part(g, c, { at: p, name, rotation: rot });

  // Wire cage frame
  const W = 1.72;
  const H = 0.58;
  const out = 0.07;
  part(new THREE.BoxGeometry(W, 0.03, 0.03), STEEL, on(0, H / 2, out), "cageTop");
  part(new THREE.BoxGeometry(W, 0.03, 0.03), STEEL, on(0, -H / 2, out), "cageBottom");
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.03, H, 0.03), STEEL, on(s * W / 2, 0, out), "cageSide");
  // vertical bars
  for (let i = -6; i <= 6; i++) {
    part(new THREE.BoxGeometry(0.014, H, 0.014), ARMOR, on(i * 0.13, 0, out), "cageBar");
  }
  // horizontal bars
  for (const v of [-0.14, 0, 0.14]) {
    part(new THREE.BoxGeometry(W, 0.014, 0.014), ARMOR, on(0, v, out + 0.003), "cageRail");
  }
  // brackets to hull
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.06, 0.06, 0.1), HULL_DARK, on(s * 0.8, -H / 2 - 0.02, 0.03), "cageBracket");
    part(new THREE.BoxGeometry(0.06, 0.06, 0.1), HULL_DARK, on(s * 0.8, H / 2 + 0.02, 0.03), "cageBracket");
  }

  // Wiper blades (inside the cage, close to glass)
  for (const s of [1, -1]) {
    const pivot = on(s * 0.3, -H / 2 + 0.03, 0.06);
    part(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 8), STEEL, pivot, "wiperPivot");
    part(new THREE.BoxGeometry(0.02, 0.46, 0.012), TIRE, on(s * 0.3 + s * 0.04, 0.0, 0.055), "wiperArm", [-28, 0, s * 8]);
    part(new THREE.BoxGeometry(0.014, 0.4, 0.02), HULL_DARK, on(s * 0.3 + s * 0.07, 0.02, 0.05), "wiperBlade", [-28, 0, s * 8]);
  }

  // HUD glow strip along top edge
  glow(part(new THREE.BoxGeometry(1.5, 0.022, 0.02), CYAN, on(0, H / 2 - 0.05, 0.055), "hudStrip"), 1.6);
  // HUD ticks
  for (let i = -5; i <= 5; i++) {
    glow(part(new THREE.BoxGeometry(0.012, i % 2 ? 0.035 : 0.055, 0.015), i === 0 ? MAGENTA : CYAN,
      on(i * 0.13, H / 2 - 0.09, 0.055), "hudTick"), 1.3);
  }
  // Sun-visor hood over the glass top
  part(new THREE.BoxGeometry(1.8, 0.04, 0.16), HULL_DARK, on(0, H / 2 + 0.05, 0.1), "visor");
  glow(part(new THREE.BoxGeometry(1.7, 0.012, 0.012), MAGENTA, on(0, H / 2 + 0.08, 0.18), "visorNeon"), 1.2);
  // Washer nozzles
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 6), YELLOW, on(s * 0.55, -H / 2 + 0.02, 0.05), "washer");
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addWheelDetails(b: Builder) {
  const R = rng(26);
  const BOLT = "#c9d0de";
  const CALIPER = "#d8203a";
  const DISC = "#4a5163";
  const PODC = "#1a1f2e";

  const P = (g: THREE.BufferGeometry, c: string, at: number[], rot?: number[], name?: string) =>
    b.part(g, c, {
      at: at as [number, number, number],
      rotation: rot as [number, number, number] | undefined,
      name,
    });

  // ---- wheels: all four ----
  const wheels: [number, number][] = [
    [1, 1.55],
    [-1, 1.55],
    [1, -1.55],
    [-1, -1.55],
  ];
  for (const [s, z] of wheels) {
    const x = s * 1.0;
    const out = s * 0.215; // just outside the rim face
    // brake disc behind the rim
    P(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 14), DISC, [x - s * 0.1, 0.46, z], [0, 0, 90], "brakeDisc");
    // caliper
    P(new THREE.BoxGeometry(0.1, 0.12, 0.2), CALIPER, [x - s * 0.1, 0.46 + 0.2, z + 0.02], undefined, "caliper");
    // neon ring on outer face
    glow(
      P(new THREE.TorusGeometry(0.25, 0.018, 5, 18), CYAN, [x + out, 0.46, z], [0, 90, 0], "neonRing"),
      1.6,
    );
    // spokes
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + (s > 0 ? 0 : 0.3);
      const r = 0.14;
      P(
        new THREE.BoxGeometry(0.03, 0.25, 0.05),
        RIM,
        [x + out, 0.46 + Math.cos(a) * r, z + Math.sin(a) * r],
        [(-a * 180) / Math.PI + 0, 0, 0],
        "spoke",
      );
    }
    // lug nuts
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      P(
        new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6),
        BOLT,
        [x + out + s * 0.01, 0.46 + Math.cos(a) * 0.07, z + Math.sin(a) * 0.07],
        [0, 0, 90],
        "lug",
      );
    }
    // center cap
    P(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), STEEL, [x + out + s * 0.01, 0.46, z], [0, 0, 90], "hubCap");
    // tire tread blocks
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      P(
        new THREE.BoxGeometry(0.3, 0.06, 0.1),
        TIRE,
        [x, 0.46 + Math.cos(a) * 0.46, z + Math.sin(a) * 0.46],
        [(-a * 180) / Math.PI, 0, 0],
        "tread",
      );
    }
  }

  // ---- roof antenna array ----
  const base = [-0.5, 1.88, -0.8];
  P(new THREE.BoxGeometry(0.5, 0.04, 0.5), ARMOR, [base[0], base[1], base[2]], undefined, "antPlate");
  // two whip antennas, slightly splayed
  const whips: [number, number, number][] = [
    [-0.18, 5, 4],
    [0.18, -5, -3],
  ];
  for (const [dx, rx, rz] of whips) {
    P(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 6), STEEL, [base[0] + dx, base[1] + 0.06, base[2] - 0.15], undefined, "whipBase");
    P(
      new THREE.CylinderGeometry(0.004, 0.01, 0.9, 5),
      BOLT,
      [base[0] + dx + rz * 0.004, base[1] + 0.52, base[2] - 0.15],
      [rx * 0.4, 0, rz],
      "whip",
    );
    glow(P(new THREE.SphereGeometry(0.014, 5, 4), MAGENTA, [base[0] + dx + rz * 0.008, base[1] + 0.97, base[2] - 0.15], undefined, "whipTip"), 1.6);
  }
  // dish
  P(new THREE.CylinderGeometry(0.03, 0.04, 0.2, 6), STEEL, [base[0] - 0.05, base[1] + 0.12, base[2] + 0.1], undefined, "dishMast");
  P(
    new THREE.ConeGeometry(0.17, 0.08, 12, 1, true),
    BOLT,
    [base[0] - 0.05, base[1] + 0.27, base[2] + 0.12],
    [-60, 0, -15],
    "dish",
  );
  P(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 4), STEEL, [base[0] - 0.05, base[1] + 0.32, base[2] + 0.2], [-60, 0, -15], "dishFeed");
  glow(P(new THREE.SphereGeometry(0.02, 5, 4), CYAN, [base[0] - 0.02, base[1] + 0.36, base[2] + 0.26], undefined, "dishLamp"), 1.4);
  // sensor pod
  P(new THREE.BoxGeometry(0.2, 0.12, 0.2), PODC, [base[0] + 0.12, base[1] + 0.08, base[2] + 0.12], undefined, "pod");
  P(new THREE.BoxGeometry(0.21, 0.02, 0.21), ARMOR, [base[0] + 0.12, base[1] + 0.15, base[2] + 0.12], undefined, "podLid");
  P(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), GLASS, [base[0] + 0.12, base[1] + 0.08, base[2] + 0.23], [90, 0, 0], "podLens");
  glow(P(new THREE.SphereGeometry(0.03, 6, 4), RED, [base[0] + 0.12, base[1] + 0.19, base[2] + 0.12], undefined, "redBlink"), 2.2);
  // cable clips
  for (let i = 0; i < 3; i++) {
    P(
      new THREE.BoxGeometry(0.02, 0.01, 0.02),
      BOLT,
      [base[0] - 0.2 + i * 0.2, base[1] + 0.03, base[2] + 0.2 + R() * 0.02],
      undefined,
      "clip",
    );
  }
}
```