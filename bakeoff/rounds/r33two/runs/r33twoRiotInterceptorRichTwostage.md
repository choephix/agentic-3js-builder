<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.0, 0.5], normal: [0, 1, 0], bone: null, room: [1.6, 0.2, 0.3] },
  { id: "frontBar", kind: "add", part: "hull", what: "Neon strip and grille across the front bumper: CYAN lamp strip, dark mesh grille, small corp logo plate.", at: [0, 0.7, 2.7], normal: [0, 0, 1], bone: null, room: [1.8, 0.4, 0.2] },
  { id: "cannonFit", kind: "add", part: "cannonBarrel", what: "Water cannon fittings: barrel rings, pressure hose, muzzle nozzle with MAGENTA glow ring.", at: [0, 2.55, 0.9], normal: [0, 0, 1], bone: null, room: [0.5, 0.5, 1.4] },
  { id: "sideSkirtLights", kind: "add", part: "hull", what: "Neon underglow strips along both sides: MAGENTA tubes with end caps.", at: [1.05, 0.35, 0], normal: [1, 0, 0], bone: null, room: [0.15, 0.1, 4] },
  { id: "windowGrilles", kind: "add", part: "cab", what: "Armoured slatted grilles over the windshield and side windows, dark steel.", at: [0, 1.5, 1.3], normal: [0, 0.3, 1], bone: null, room: [1.6, 0.6, 0.2] },
  { id: "tankPipes", kind: "add", part: "tank", what: "Water tank piping, valves, gauge and hazard-stripe band on rear tank.", at: [0, 1.7, -1.6], normal: [0, 1, 0], bone: null, room: [1.5, 0.6, 1.8] },
  { id: "antennas", kind: "add", part: "cab", what: "Antenna array and sensor pods at cab roof rear with tiny red blinkers.", at: [0.6, 2.1, -0.2], normal: [0, 1, 0], bone: null, room: [0.5, 0.6, 0.5] },
  { id: "hullCamo", kind: "texture", part: "hull", what: "Corporate livery: HULL navy with MAGENTA diagonal stripes, faded unit number and logo near rear doors." },
  { id: "tankDecal", kind: "texture", part: "tank", what: "Hazard chevrons in YELLOW and DARK with warning text WATER CANNON." },
  { id: "tireTread", kind: "texture", part: "tire", what: "Tread pattern on tyres in DARK and RUBBER." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#1c2438";
export const HULL_DARK = "#10141f";
export const STEEL = "#4a5266";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const YELLOW = "#ffd21f";
export const GLASS = "#0b2a3a";
export const RUBBER = "#15161a";
export const DARK = "#07080c";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], name, rotation: rot as any });

  // lower hull
  box(2.1, 0.8, 5.2, HULL, [0, 0.85, 0], "hull");
  box(2.2, 0.15, 5.3, HULL_DARK, [0, 0.4, 0], "hullSill");
  // hood slope
  box(1.9, 0.35, 1.2, HULL, [0, 1.15, 2.0], "hood", [-12, 0, 0]);
  // bumper
  box(2.3, 0.4, 0.35, STEEL, [0, 0.6, 2.75], "bumper");
  box(2.0, 0.12, 0.3, CYAN, [0, 0.85, 2.82], "bumperLight");
  // cab
  box(1.9, 0.9, 1.7, HULL, [0, 1.7, 0.7], "cab");
  box(1.7, 0.55, 0.06, GLASS, [0, 1.8, 1.58], "windshield", [-18, 0, 0]);
  for (const s of [1, -1]) {
    box(0.05, 0.5, 1.2, GLASS, [s * 0.96, 1.8, 0.7], "sideWindow");
    box(0.08, 0.14, 0.05, MAGENTA, [s * 0.9, 1.0, 2.6]);
  }
  box(1.95, 0.08, 1.75, HULL_DARK, [0, 2.17, 0.7], "cabRoof");
  // rear tank
  const tank = b.lathe(
    [[0, -1.3], [0.7, -1.3], [0.85, -1.1], [0.85, 1.1], [0.7, 1.3], [0, 1.3]],
    { at: [0, 1.55, -1.5], axis: [0, 0, 1], segments: 10, color: STEEL, name: "tank" },
  );
  void tank;
  for (const z of [-0.6, -1.5, -2.4]) {
    b.part(new THREE.CylinderGeometry(0.88, 0.88, 0.1, 10), YELLOW, { at: [0, 1.55, z], dir: [0, 0, 1], name: "tankBand" });
  }
  // turret + cannon
  b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.25, 10), HULL_DARK, { at: [0, 2.3, 0.9], name: "cannonBase" });
  box(0.5, 0.35, 0.6, STEEL, [0, 2.55, 0.9], "turret");
  b.part(new THREE.CylinderGeometry(0.12, 0.15, 1.5, 8), STEEL, { at: [0, 2.6, 1.6], dir: [0, 0, 1], name: "cannonBarrel" });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 8), MAGENTA, { at: [0, 2.6, 2.4], dir: [0, 0, 1], name: "muzzle" });
  // wheels
  for (const s of [1, -1])
    for (const z of [1.8, -0.2, -2.0]) {
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), RUBBER, { at: [s * 1.1, 0.5, z], dir: [1, 0, 0], name: "tire" });
      b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 8), STEEL, { at: [s * 1.1, 0.5, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.44, 6), CYAN, { at: [s * 1.1, 0.5, z], dir: [1, 0, 0] });
    }
  // roof light bar base
  box(1.5, 0.1, 0.25, DARK, [0, 2.27, 0.5], "lightBarBase");

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

hullCamo: the hull gets a navy livery with a magenta diagonal stripe, panel seams, a faded unit number and a corp logo on a textured side face, all done with a paint.
tankDecal: the tank gets a paint of yellow/dark hazard chevron bands, with a WATER CANNON text label applied as a texture on a plane on each side.
tireTread: the tires get a paint of dark/rubber tread blocks around the circumference and grooves.

<<<<<<< SEARCH
export const DARK = "#07080c";
=======
export const DARK = "#07080c";

const HULL_PAINT = paint((p, n) => {
  const base = mix(HULL, "#26304a", noise(p, 0.5, 3) * 0.6);
  const d = (p.z * 0.8 + p.y * 1.2) % 0.9;
  const dd = d < 0 ? d + 0.9 : d;
  if (Math.abs(n.x) > 0.5 && dd < 0.22 && p.z < 2.2) return MAGENTA;
  if (Math.abs(n.x) > 0.5 && dd > 0.22 && dd < 0.27) return CYAN;
  const seam = Math.abs(((p.z + 0.3) % 1.3)) < 0.012 || Math.abs(p.y - 0.85) < 0.01;
  return seam ? HULL_DARK : base;
});

const TANK_PAINT = paint((p, n) => {
  const u = (p.x + p.y) / 0.3;
  const band = Math.abs(p.z + 1.5) < 1.1;
  if (!band) return STEEL;
  const k = Math.floor(u + Math.abs(p.z) * 0 + (p.y - 1.55) * 0);
  void n;
  return (((k % 2) + 2) % 2) === 0 ? YELLOW : DARK;
});

const TREAD_PAINT = paint((p, n) => {
  if (Math.abs(n.x) > 0.7) return mix(RUBBER, "#2a2c34", noise(p, 0.1, 1));
  const a = Math.atan2(p.y - 0.5, p.z - Math.round(p.z * 1) * 0);
  const k = Math.floor(a * 9);
  const groove = Math.abs(((p.x * 10) % 1)) < 0.12 || ((k % 2) + 2) % 2 === 0;
  return groove ? DARK : RUBBER;
});
>>>>>>> REPLACE

<<<<<<< SEARCH
import { createBuilder, type Builder } from "agentic-3js-builder";
=======
import { createBuilder, paint, mix, noise, type Builder } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(2.1, 0.8, 5.2, HULL, [0, 0.85, 0], "hull");
=======
  box(2.1, 0.8, 5.2, HULL_PAINT as any, [0, 0.85, 0], "hull");
>>>>>>> REPLACE

<<<<<<< SEARCH
    { at: [0, 1.55, -1.5], axis: [0, 0, 1], segments: 10, color: STEEL, name: "tank" },
=======
    { at: [0, 1.55, -1.5], axis: [0, 0, 1], segments: 10, color: TANK_PAINT, name: "tank" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), RUBBER, { at: [s * 1.1, 0.5, z], dir: [1, 0, 0], name: "tire" });
=======
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), TREAD_PAINT, { at: [s * 1.1, 0.5, z], dir: [1, 0, 0], name: "tire" });
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofLightBar(b: Builder) {
  const Y = 2.27; // top of base box (center 2.27, height 0.1) -> top 2.32
  const top = Y + 0.05;
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at: at as [number, number, number], name, rotation: rot as any });

  // slim housing
  P(new THREE.BoxGeometry(1.6, 0.1, 0.26), DARK, [0, top + 0.05, 0.5], "s21Housing");
  P(new THREE.BoxGeometry(1.64, 0.025, 0.3), STEEL, [0, top + 0.112, 0.5], "s21Cap");
  P(new THREE.BoxGeometry(1.64, 0.025, 0.3), STEEL, [0, top - 0.005, 0.5], "s21Base");

  // end caps
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.06, 0.16, 0.32), HULL_DARK, [s * 0.82, top + 0.06, 0.5], "s21End");
    P(new THREE.BoxGeometry(0.04, 0.06, 0.1), YELLOW, [s * 0.86, top + 0.06, 0.5], "s21Amber");
    // brackets
    for (const x of [0.55, 0.0]) {
      const xx = s * x;
      if (s === -1 && x === 0) continue;
      P(new THREE.BoxGeometry(0.07, 0.07, 0.2), STEEL, [xx, top + 0.01, 0.5], "s21Bracket");
      P(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), DARK, [xx, top + 0.045, 0.62], "s21Bolt");
    }
  }

  // six lamps, alternating cyan / magenta, front and back faces
  const lampW = 0.22;
  for (let i = 0; i < 6; i++) {
    const x = -0.65 + i * 0.26;
    const col = i % 2 === 0 ? CYAN : MAGENTA;
    for (const side of [1, -1]) {
      const lamp = P(new THREE.BoxGeometry(lampW, 0.07, 0.03), col, [x, top + 0.055, 0.5 + side * 0.14], "s21Lamp");
      glow(lamp, 1.8);
    }
    // glowing top lens
    const lens = P(new THREE.BoxGeometry(lampW - 0.04, 0.02, 0.18), col, [x, top + 0.13, 0.5], "s21Lens");
    glow(lens, 1.5);
    // divider fins
    P(new THREE.BoxGeometry(0.02, 0.09, 0.28), DARK, [x + 0.13, top + 0.055, 0.5], "s21Fin");
  }
  P(new THREE.BoxGeometry(0.02, 0.09, 0.28), DARK, [-0.78, top + 0.055, 0.5], "s21Fin");

  // glow strip under the bar casting onto the roof
  glow(P(new THREE.BoxGeometry(1.4, 0.01, 0.04), MAGENTA, [0, top - 0.02, 0.66], "s21RoofGlow"), 1.2);
  glow(P(new THREE.BoxGeometry(1.4, 0.01, 0.04), CYAN, [0, top - 0.02, 0.34], "s21RoofGlow"), 1.2);
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addFrontBar(b: Builder) {
  const PLATE = "#2a3350";
  const Z = 2.78;

  // Grille mesh drawing
  const mesh = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#07080c"/>` +
      Array.from({ length: 16 }, (_, i) => `<path d="M${i * 4 + 2} 0V24" stroke="#4a5266" stroke-width="1.6"/>`).join("") +
      Array.from({ length: 6 }, (_, i) => `<path d="M0 ${i * 4 + 2}H64" stroke="#2a3350" stroke-width="1.2"/>`).join("") +
      `</svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(1.5, 0.28), "#ffffff", {
    at: [0, 0.55, Z + 0.2],
    dir: [0, 0, 1],
    axis: "z",
    texture: mesh,
    name: "frontGrille",
  });
  // grille frame
  b.part(new THREE.BoxGeometry(1.64, 0.04, 0.06), STEEL, { at: [0, 0.7, Z + 0.19], name: "grilleTop" });
  b.part(new THREE.BoxGeometry(1.64, 0.04, 0.06), STEEL, { at: [0, 0.4, Z + 0.19], name: "grilleBot" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.34, 0.06), STEEL, { at: [s * 0.82, 0.55, Z + 0.19], name: "grilleSide" });
    // end lamp pods
    glow(
      b.part(new THREE.BoxGeometry(0.16, 0.1, 0.08), CYAN, { at: [s * 0.95, 0.88, Z + 0.1], name: "lampEnd" }),
      1.6,
    );
    // bolts
    for (const y of [0.42, 0.68])
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), HULL_DARK, {
        at: [s * 0.74, y, Z + 0.23],
        dir: [0, 0, 1],
        name: "bolt",
      });
  }
  // CYAN lamp strip made of segments
  for (let i = 0; i < 9; i++) {
    glow(
      b.part(new THREE.BoxGeometry(0.19, 0.06, 0.05), CYAN, { at: [-0.8 + i * 0.2, 0.86, Z + 0.1], name: "lampSeg" }),
      1.8,
    );
  }
  b.part(new THREE.BoxGeometry(1.9, 0.03, 0.06), DARK, { at: [0, 0.8, Z + 0.1], name: "lampTrim" });

  // Corp logo plate
  const logo = svg(
    `<svg viewBox="0 0 48 32"><rect width="48" height="32" rx="3" fill="#10141f" stroke="#ff2bd6" stroke-width="2"/>` +
      `<path d="M10 22L18 8L26 22Z" fill="none" stroke="#19f0ff" stroke-width="2.5"/>` +
      `<circle cx="34" cy="15" r="6" fill="none" stroke="#ff2bd6" stroke-width="2.5"/>` +
      `<path d="M8 28H40" stroke="#ffd21f" stroke-width="2"/></svg>`,
    { size: 192 },
  );
  b.part(new THREE.BoxGeometry(0.34, 0.2, 0.04), PLATE, { at: [0, 0.99, Z - 0.02], name: "logoBack" });
  glow(
    b.part(new THREE.PlaneGeometry(0.3, 0.2), "#ffffff", {
      at: [0, 0.99, Z + 0.005],
      dir: [0, 0, 1],
      axis: "z",
      texture: logo,
      name: "logoPlate",
    }),
    0.8,
  );

  // tow hooks and skid plate
  for (const s of [1, -1])
    b.part(new THREE.TorusGeometry(0.06, 0.018, 6, 10), YELLOW, { at: [s * 0.55, 0.38, Z + 0.1], name: "towHook" });
  b.part(new THREE.BoxGeometry(1.8, 0.05, 0.25), HULL_DARK, { at: [0, 0.34, Z + 0.1], rotation: [15, 0, 0], name: "skid" });
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addCannonFit(b: Builder) {
  const BRASS = "#8a6a2e";
  const HOSE = "#23262f";
  const WHITE = "#e8fbff";
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], dir: number[], seg = 8, name?: string) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: at as [number, number, number], dir: dir as [number, number, number], name });

  // barrel rings (barrel: center z=1.6, length 1.5 -> z 0.85..2.35, y 2.6)
  for (const z of [1.05, 1.35, 1.65, 1.95]) {
    cyl(0.19, 0.19, 0.07, STEEL, [0, 2.6, z], [0, 0, 1], 8, "cannonRing");
    cyl(0.2, 0.2, 0.02, DARK, [0, 2.6, z + 0.045], [0, 0, 1], 8, "cannonRingEdge");
  }
  // brass collars near breech
  cyl(0.18, 0.18, 0.1, BRASS, [0, 2.6, 0.9], [0, 0, 1], 8, "breechCollar");
  // flared nozzle at muzzle
  cyl(0.2, 0.15, 0.22, HULL_DARK, [0, 2.6, 2.3], [0, 0, 1], 8, "nozzleFlare");
  cyl(0.19, 0.19, 0.05, MAGENTA, [0, 2.6, 2.46], [0, 0, 1], 8, "nozzleGlowRing");
  glow(b.part(new THREE.TorusGeometry(0.19, 0.03, 6, 12), MAGENTA, { at: [0, 2.6, 2.47], dir: [0, 0, 1], axis: "z", name: "muzzleTorus" }), 1.8);
  // inner water opening
  glow(b.part(new THREE.CircleGeometry(0.11, 10), CYAN, { at: [0, 2.6, 2.475], dir: [0, 0, 1], axis: "z", name: "waterPort" }), 1.4);
  // glowing muzzle ring in stage 1 colour
  // top sight rail
  b.part(new THREE.BoxGeometry(0.06, 0.05, 1.2), DARK, { at: [0, 2.79, 1.6], name: "sightRail" });
  for (const z of [1.2, 1.6, 2.0])
    glow(b.part(new THREE.BoxGeometry(0.04, 0.03, 0.05), CYAN, { at: [0, 2.83, z], name: "sightLamp" }), 1.5);

  // side pressure hoses from the tank to the breech
  for (const s of [1, -1]) {
    const pts = [
      new THREE.Vector3(s * 0.3, 1.9, -0.7),
      new THREE.Vector3(s * 0.55, 2.4, -0.3),
      new THREE.Vector3(s * 0.55, 2.7, 0.4),
      new THREE.Vector3(s * 0.2, 2.62, 0.85),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    b.part(new THREE.TubeGeometry(curve, 14, 0.06, 6), HOSE, { at: [0, 0, 0], name: "hose" });
    for (const t of [0.15, 0.5, 0.85]) {
      const p = curve.getPoint(t);
      const tg = curve.getTangent(t);
      b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.08, 8), BRASS, {
        at: [p.x, p.y, p.z], dir: [tg.x, tg.y, tg.z], name: "hoseClamp",
      });
    }
    // coupling at turret
    b.part(new THREE.BoxGeometry(0.1, 0.14, 0.14), BRASS, { at: [s * 0.27, 2.6, 0.85], name: "coupling" });
    // turret side lamps
    glow(b.part(new THREE.BoxGeometry(0.03, 0.08, 0.3), MAGENTA, { at: [s * 0.26, 2.55, 1.0], name: "turretStrip" }), 1.5);
    // pressure gauge
    cyl(0.07, 0.07, 0.04, WHITE, [s * 0.27, 2.68, 0.7], [s, 0, 0], 10, "gauge");
  }
  // turret base trim ring
  glow(b.part(new THREE.TorusGeometry(0.45, 0.02, 5, 14), CYAN, { at: [0, 2.2, 0.9], rotation: [90, 0, 0], name: "baseRing" }), 1.2);
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, glow } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";

export function addSideSkirtLights(b: Builder) {
  const PINK_HOT = "#ff8ae8";
  const g = glowKit;
  void glow;
  for (const s of [1, -1]) {
    const x = s * 1.1;
    // main neon tube along the sill
    g(
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 3.8, 8), MAGENTA, {
        at: [x, 0.3, 0],
        dir: [0, 0, 1],
        name: "skirtTube",
      }),
      1.6,
    );
    // hot core
    g(
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 3.7, 6), PINK_HOT, {
        at: [x + s * 0.025, 0.3, 0],
        dir: [0, 0, 1],
        name: "skirtCore",
      }),
      2,
    );
    // end caps, dark housings
    for (const z of [1.95, -1.95]) {
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), DARK, {
        at: [x, 0.3, z],
        dir: [0, 0, 1],
        name: "skirtCap",
      });
      b.part(new THREE.SphereGeometry(0.045, 6, 4), MAGENTA, { at: [x, 0.3, z + Math.sign(z) * 0.06] });
    }
    // brackets holding the tube
    for (const z of [-1.5, -0.75, 0, 0.75, 1.5]) {
      b.part(new THREE.BoxGeometry(0.1, 0.06, 0.1), DARK, { at: [x - s * 0.04, 0.3, z], name: "skirtBracket" });
      b.part(new THREE.BoxGeometry(0.03, 0.14, 0.06), STEEL, { at: [x - s * 0.06, 0.37, z] });
    }
    // protective guard plate above the tube
    b.part(new THREE.BoxGeometry(0.08, 0.04, 3.9), HULL_DARK, { at: [x - s * 0.02, 0.4, 0], name: "skirtGuard" });
    // small cyan status dots
    for (const z of [-1.2, 0, 1.2])
      g(b.part(new THREE.SphereGeometry(0.025, 6, 4), CYAN, { at: [x + s * 0.01, 0.46, z] }), 1.5);
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addWindowGrilles(b: Builder) {
  const GRILLE = "#2b3040";
  const RIVET = "#6a7288";
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, {
      at: at as [number, number, number],
      rotation: rot as [number, number, number] | undefined,
      name: "grille",
    });

  // Windshield grille: the glass is tilted -18deg at z=1.58, so tilt the frame with it.
  const wz = 1.66;
  const wy = 1.8;
  const tilt = [-18, 0, 0];
  // frame
  box(1.78, 0.07, 0.07, GRILLE, [0, wy + 0.3, wz + 0.02], tilt);
  box(1.78, 0.07, 0.07, GRILLE, [0, wy - 0.3, wz - 0.02], tilt);
  for (const s of [1, -1]) box(0.07, 0.6, 0.07, GRILLE, [s * 0.86, wy, wz], tilt);
  // horizontal slats
  for (let i = 0; i < 5; i++) {
    const t = -0.2 + i * 0.1;
    box(1.66, 0.035, 0.05, GRILLE, [0, wy + t, wz + 0.01 - t * 0.3], tilt);
  }
  // center brace + rivets
  box(0.05, 0.56, 0.05, GRILLE, [0, wy, wz + 0.01], tilt);
  for (const s of [1, -1])
    for (const y of [-0.28, 0.28])
      b.part(new THREE.SphereGeometry(0.03, 6, 4), RIVET, {
        at: [s * 0.86, wy + y, wz + 0.05 - y * 0.1],
        name: "grilleRivet",
      });

  // Side window grilles
  for (const s of [1, -1]) {
    const x = s * 1.0;
    box(0.06, 0.07, 1.28, GRILLE, [x, 2.07, 0.7]);
    box(0.06, 0.07, 1.28, GRILLE, [x, 1.53, 0.7]);
    for (const z of [0.08, 1.32]) box(0.06, 0.6, 0.07, GRILLE, [x, 1.8, z]);
    for (let i = 0; i < 6; i++) box(0.05, 0.5, 0.035, GRILLE, [x + s * 0.005, 1.8, 0.2 + i * 0.2]);
    box(0.045, 0.035, 1.2, GRILLE, [x + s * 0.005, 1.8, 0.7]);
    for (const z of [0.08, 1.32])
      for (const y of [1.53, 2.07])
        b.part(new THREE.SphereGeometry(0.03, 6, 4), RIVET, { at: [x + s * 0.03, y, z], name: "grilleRivet" });
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addTankPipes(b: Builder) {
  const r = rng(26);
  const BRASS = "#b08a3a";
  const RED = "#ff2a2a";
  const P = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at: at as [number, number, number], ...o });

  // ---- tank piping (tank: axis z, centre y1.55, z -1.5, radius 0.85) ----
  const warn = svg(
    `<svg viewBox="0 0 128 48"><rect width="128" height="48" fill="#ffd21f"/>
    <path d="M0 48 L24 0 L40 0 L16 48Z M44 48 L68 0 L84 0 L60 48Z M88 48 L112 0 L128 0 L128 8 L104 48Z" fill="#07080c"/>
    <rect x="14" y="12" width="100" height="24" fill="#07080c"/>
    <text x="64" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#ffd21f">WATER CANNON</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    P(new THREE.PlaneGeometry(1.1, 0.41), "#ffffff", [s * 0.865, 1.6, -1.5], {
      dir: [s, 0, 0],
      axis: "z",
      texture: warn,
      up: [0, 1, 0],
      name: "tankDecal",
    });

  // top manifold pipe along the tank
  P(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 8), STEEL, [0, 2.45, -1.5], { dir: [0, 0, 1], name: "topPipe" });
  for (const z of [-2.4, -1.5, -0.6]) {
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), BRASS, [0, 2.45, z], { dir: [0, 0, 1], name: "pipeCollar" });
    P(new THREE.BoxGeometry(0.1, 0.14, 0.14), STEEL, [0, 2.38, z], { name: "pipeClamp" });
  }
  // valves
  for (const [x, z] of [[0.3, -1.1], [-0.3, -1.9]] as number[][]) {
    P(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), STEEL, [x, 2.55, z], { name: "valveStem" });
    P(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 8), RED, [x, 2.72, z], { name: "valveWheel" });
    P(new THREE.BoxGeometry(0.28, 0.03, 0.03), RED, [x, 2.74, z], { name: "valveSpoke" });
    P(new THREE.BoxGeometry(0.03, 0.03, 0.28), RED, [x, 2.74, z], { name: "valveSpoke" });
  }
  // hose from tank rear to cab
  const hose = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.35, 2.38, -0.55),
    new THREE.Vector3(0.35, 2.7, -0.2),
    new THREE.Vector3(0.2, 2.65, 0.4),
    new THREE.Vector3(0.1, 2.55, 0.85),
  ]);
  P(new THREE.TubeGeometry(hose, 14, 0.04, 6), RUBBER, [0, 0, 0], { name: "hose" });

  // gauge on tank rear face
  const gauge = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e8e0c8" stroke="#07080c" stroke-width="5"/>
    <path d="M20 70 A38 38 0 0 1 80 70" stroke="#ff2a2a" stroke-width="6" fill="none"/>
    <path d="M50 50 L68 28" stroke="#07080c" stroke-width="5"/><circle cx="50" cy="50" r="5" fill="#07080c"/></svg>`,
    { size: 128 },
  );
  P(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 12), BRASS, [0, 1.9, -2.83], { dir: [0, 0, 1], name: "gaugeRim" });
  P(new THREE.CircleGeometry(0.17, 12), "#ffffff", [0, 1.9, -2.865], { dir: [0, 0, -1], axis: "z", texture: gauge, name: "gauge" });
  // rear drain pipe + cap
  P(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8), STEEL, [0, 1.0, -2.75], { dir: [0, 0, 1], name: "drain" });
  P(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 8), BRASS, [0, 1.0, -2.92], { dir: [0, 0, 1] });
  // side fill ports
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 8), BRASS, [s * 0.88, 1.2, -2.1], { dir: [s, 0, 0], name: "fillPort" });
    glow(P(new THREE.SphereGeometry(0.04, 6, 4), CYAN, [s * 0.97, 1.2, -2.1], { name: "portLight" }), 1.5);
  }

  // ---- antennas at cab roof rear ----
  const mast = (x: number, z: number, h: number) => {
    P(new THREE.CylinderGeometry(0.02, 0.03, h, 6), STEEL, [x, 2.21 + h / 2, z], { name: "mast" });
    P(new THREE.CylinderGeometry(0.06, 0.07, 0.06, 8), HULL_DARK, [x, 2.24, z], { name: "mastBase" });
    glow(P(new THREE.SphereGeometry(0.03, 6, 4), RED, [x, 2.21 + h + 0.02, z], { name: "blinker" }), 2);
  };
  mast(0.6, -0.2, 0.55);
  mast(0.45, -0.3, 0.35);
  mast(-0.6, -0.25, 0.45);
  // dish
  P(new THREE.CylinderGeometry(0.0, 0.2, 0.08, 10), STEEL, [-0.4, 2.45, -0.1], { rotation: [-60, 0, 0], name: "dish" });
  P(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), STEEL, [-0.4, 2.33, -0.1], { name: "dishArm" });
  glow(P(new THREE.SphereGeometry(0.025, 6, 4), CYAN, [-0.4, 2.5, -0.02], { name: "dishFeed" }), 1.5);
  // sensor pods
  for (const x of [0.8, 0.2]) {
    P(new THREE.BoxGeometry(0.22, 0.12, 0.2), HULL_DARK, [x, 2.27, -0.05 + r() * 0.05], { name: "sensorPod" });
    glow(P(new THREE.BoxGeometry(0.14, 0.04, 0.02), MAGENTA, [x, 2.28, 0.06], { name: "podLens" }), 1.5);
  }
  // rear roof cable
  P(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), RUBBER, [0.3, 2.25, -0.4], { dir: [1, 0, 0], name: "cable" });
}
```