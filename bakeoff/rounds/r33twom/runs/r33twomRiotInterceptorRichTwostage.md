<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, end brackets.", at: [0, 2.0, 0.5], normal: [0, 1, 0], bone: null, room: [1.7, 0.2, 0.3] },
  { id: "frontBumperBar", kind: "add", part: "bumper", what: "Wide neon strip and push-bar on the front bumper: dark bull-bar frame with a CYAN glowing strip and corner lamps.", at: [0, 0.6, 2.75], normal: [0, 0, 1], bone: null, room: [2.0, 0.4, 0.3] },
  { id: "grille", kind: "add", part: "hood", what: "Aggressive slatted grille with a corporate emblem in MAGENTA between two slim headlamp strips.", at: [0, 0.95, 2.62], normal: [0, 0, 1], bone: null, room: [1.2, 0.4, 0.2] },
  { id: "cannonNozzle", kind: "add", part: "turretBarrel", what: "Water cannon nozzle: flared muzzle ring, pressure gauge, hose clamps and a CYAN glow ring.", at: [0, 2.55, 1.9], normal: [0, 0, 1], bone: "cannonPitch", room: [0.4, 0.4, 0.3] },
  { id: "sideLightBarL", kind: "add", part: "hullSide", what: "Left side rocker neon strip in MAGENTA with small vent slats above.", at: [1.05, 0.55, 0], normal: [1, 0, 0], bone: null, room: [0.2, 0.15, 3.0] },
  { id: "sideLightBarR", kind: "add", part: "hullSide", what: "Right side rocker neon strip in MAGENTA with small vent slats above.", at: [-1.05, 0.55, 0], normal: [-1, 0, 0], bone: null, room: [0.2, 0.15, 3.0] },
  { id: "antennaArray", kind: "add", part: "cab", what: "Rear roof antenna array: three whip antennas of different heights, a dish and a small blinking beacon.", at: [0.6, 2.0, -0.9], normal: [0, 1, 0], bone: null, room: [0.6, 0.8, 0.5] },
  { id: "windowDetail", kind: "add", part: "windshield", what: "Armoured window wire grilles on the side windows and a HUD-like cyan sticker strip on the windshield top.", at: [0, 1.65, 1.1], normal: [0, 0, 1], bone: null, room: [1.6, 0.5, 0.2] },
  { id: "rearDetail", kind: "add", part: "rearDeck", what: "Rear lights bar in RED, exhaust pipes, tank hatch and hose reel with coiled hose.", at: [0, 1.2, -2.6], normal: [0, 0, -1], bone: null, room: [1.8, 0.8, 0.3] },
  { id: "hullCamo", kind: "texture", part: "hullSide", what: "Corporate livery on hull sides: diagonal HULL_DARK hazard chevrons, white unit number and faded scratches.", },
  { id: "tankTexture", kind: "texture", part: "tank", what: "Water tank with warning stripes, corporate logo and weathered grime in TANK and HULL_DARK.", },
  { id: "tyreTexture", kind: "texture", part: "wheel", what: "Tyre tread pattern and brushed hubcap with CYAN rim glow lines.", },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const HULL = "#2b3140";
const HULL_DARK = "#14171f";
const HULL_LIGHT = "#4a546a";
const TANK = "#3d4a5c";
const GLASS = "#0b2a3a";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const RED = "#ff2a3a";
const YELLOW = "#ffd400";
const TYRE = "#0c0c0f";
const RIM = "#8b93a6";

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const root = b.joint("chassis", { at: [0, 0.6, 0] });
  const cannonYaw = b.joint("cannonYaw", { parent: root, at: [0, 2.05, -0.4], dir: [0, 1, 0] });
  const cannonPitch = b.joint("cannonPitch", { parent: cannonYaw, at: [0, 2.3, -0.2], dir: [0, 0, 1] });

  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, bone: any = root) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, bone, name });

  // underbody & hull
  box(2.0, 0.35, 5.2, HULL_DARK, [0, 0.55, 0], "underbody");
  box(1.9, 0.5, 5.2, HULL, [0, 0.95, 0], "hullSide");
  for (const s of [1, -1]) {
    box(0.1, 0.45, 5.0, HULL_LIGHT, [s * 1.0, 0.95, 0], "hullSide");
    box(0.08, 0.1, 4.2, HULL_DARK, [s * 1.02, 0.6, 0], "rocker");
    box(0.04, 0.05, 3.2, MAGENTA, [s * 1.07, 0.52, 0], "rockerNeon");
  }
  // hood sloped
  b.frustumBox([0, 1.2, 1.4], [0, 1.2, 2.55], [1.9, 0.6], [1.8, 0.45], { color: HULL, name: "hood" });
  box(1.4, 0.06, 0.9, HULL_LIGHT, [0, 1.52, 1.85], "hoodPlate");
  // bumper
  box(2.1, 0.35, 0.3, HULL_DARK, [0, 0.65, 2.65], "bumper");
  box(1.6, 0.08, 0.1, CYAN, [0, 0.65, 2.82], "bumperNeon");
  // grille
  box(1.1, 0.3, 0.06, HULL_DARK, [0, 1.0, 2.62], "grille");
  for (const s of [1, -1]) {
    box(0.4, 0.08, 0.05, "#fff6c8", [s * 0.7, 1.15, 2.6], "headlamp");
    box(0.25, 0.1, 0.1, MAGENTA, [s * 0.95, 0.65, 2.8], "cornerLamp");
  }
  // cab
  box(1.85, 0.75, 2.0, HULL, [0, 1.65, 0.2], "cab");
  box(1.75, 0.08, 1.9, HULL_LIGHT, [0, 2.06, 0.2], "cabRoof");
  b.part(new THREE.BoxGeometry(1.6, 0.55, 0.06), GLASS, { at: [0, 1.7, 1.2], rotation: [-18, 0, 0], bone: root, name: "windshield" });
  for (const s of [1, -1]) {
    box(0.05, 0.4, 1.4, GLASS, [s * 0.93, 1.75, 0.3], "sideWindow");
    box(0.08, 0.05, 1.5, CYAN, [s * 0.94, 1.5, 0.3], "windowTrim");
  }
  // rear body / tank
  box(1.95, 0.9, 2.2, HULL, [0, 1.3, -1.5], "rearDeck");
  b.part(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 10), TANK, { at: [0, 1.95, -1.55], rotation: [0, 0, 90], bone: root, name: "tank" });
  for (const z of [-0.9, -1.55, -2.2]) b.part(new THREE.CylinderGeometry(0.73, 0.73, 0.1, 10), HULL_DARK, { at: [0, 1.95, z], rotation: [90, 0, 0], bone: root, name: "tankBand" });
  box(1.9, 0.08, 0.1, RED, [0, 1.3, -2.62], "tailLight");
  // roof light bar housing
  box(1.5, 0.1, 0.22, HULL_DARK, [0, 2.15, 0.5], "lightBarHousing");
  for (let i = 0; i < 6; i++)
    box(0.2, 0.07, 0.18, i % 2 ? MAGENTA : CYAN, [-0.6 + i * 0.24, 2.22, 0.5], "roofLamp");
  // wheels
  for (const s of [1, -1])
    for (const z of [1.7, -1.6]) {
      box(0.5, 0.2, 1.0, HULL_DARK, [s * 0.98, 0.9, z], "arch");
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), TYRE, { at: [s * 1.0, 0.5, z], rotation: [0, 0, 90], bone: root, name: "wheel" });
      b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 8), RIM, { at: [s * 1.0, 0.5, z], rotation: [0, 0, 90], bone: root, name: "hub" });
      b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.44, 8), CYAN, { at: [s * 1.0, 0.5, z], rotation: [0, 0, 90], bone: root, name: "hubGlow" });
    }
  // turret
  b.part(new THREE.CylinderGeometry(0.5, 0.6, 0.25, 10), HULL_DARK, { at: [0, 2.2, -0.4], bone: cannonYaw, name: "turretBase" });
  box(0.7, 0.5, 0.8, HULL, [0, 2.55, -0.4], "turretBody", cannonYaw);
  b.part(new THREE.CylinderGeometry(0.15, 0.2, 1.4, 8), HULL_LIGHT, { at: [0, 2.6, 0.7], rotation: [90, 0, 0], bone: cannonPitch, name: "turretBarrel" });
  b.part(new THREE.CylinderGeometry(0.24, 0.17, 0.25, 8), HULL_DARK, { at: [0, 2.6, 1.5], rotation: [90, 0, 0], bone: cannonPitch, name: "nozzle" });
  box(0.1, 0.1, 0.3, YELLOW, [0, 2.9, 0.2], "turretMark", cannonPitch);

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

- **hullCamo**: the hull side boxes get a paint with diagonal HULL_DARK hazard chevrons in the rear half, noise scratches and a lit-from-above tone. A white "07" unit-number decal goes on each flank.
- **tankTexture**: the tank gets a paint with yellow and dark warning stripes at both ends, a TANK body with grime and rust streaks, and a circular corporate emblem painted on the top.
- **tyreTexture**: the tyre gets a paint with tread lugs and grooves, with sidewall rings in grey and CYAN. The hubs get a brushed-metal grain.

<<<<<<< SEARCH
import { createBuilder, type Builder } from "agentic-3js-builder";
=======
import { createBuilder, paint, noise, smoothstep, mix, grain, svg, type Builder } from "agentic-3js-builder";
>>>>>>> REPLACE
<<<<<<< SEARCH
export default function build() {
=======
const UNIT_NUM = svg(
  `<svg viewBox="0 0 64 32"><text x="32" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#ffffff" stroke="#14171f" stroke-width="1">07</text></svg>`,
  { size: 256 },
);

const HULL_PAINT = paint((p, n) => {
  const light = 0.9 + 0.15 * smoothstep(-0.5, 1, n.y);
  let c = mix(HULL, HULL_LIGHT, 0.25 * noise(p, 0.4, 3));
  if (Math.abs(n.x) > 0.5) {
    const t = (p.z + Math.abs(p.y - 0.95) * 1.6) / 0.3;
    if (p.z < -0.3 && p.z > -2.3 && t - Math.floor(t) < 0.45) c = mix(c, HULL_DARK, 0.9);
  }
  const sc = noise(p, 0.05, 9);
  if (sc > 0.72) c = mix(c, "#8a93a8", 0.5);
  if (noise(p, 0.3, 5) > 0.7) c = mix(c, HULL_DARK, 0.35);
  return [c[0] * light, c[1] * light, c[2] * light];
});

const TANK_PAINT = paint((p, n) => {
  let c = mix(TANK, HULL_LIGHT, 0.3 * noise(p, 0.3, 11));
  const ax = Math.abs(p.x);
  if (ax > 0.72 && Math.abs(n.x) < 0.6) {
    const t = (p.z + p.y) / 0.12;
    c = t - Math.floor(t) < 0.5 ? mix(YELLOW, "#000000", 0.1) : HULL_DARK;
  } else if (n.y > 0.7 && Math.hypot(p.x, p.z + 1.55) < 0.28) {
    const d = Math.hypot(p.x, p.z + 1.55);
    c = d > 0.22 ? "#e8eef7" : d > 0.12 ? mix(HULL_DARK, CYAN, 0.2) : MAGENTA;
  }
  if (noise(p, 0.12, 21) > 0.62) c = mix(c, HULL_DARK, 0.45);
  if (n.y < 0.2 && noise(p, 0.06, 4) > 0.6) c = mix(c, "#6b3a1c", 0.3);
  return c;
});

const TYRE_PAINT = paint((p, n) => {
  const zc = p.z > 0 ? 1.7 : -1.6;
  const dy = p.y - 0.5;
  const dz = p.z - zc;
  const r = Math.hypot(dy, dz);
  if (Math.abs(n.x) > 0.7) {
    if (Math.abs(r - 0.4) < 0.012) return CYAN;
    if (Math.abs(r - 0.32) < 0.008) return RIM;
    return mix(TYRE, "#24242c", 0.5 * noise(p, 0.05, 2));
  }
  const a = Math.atan2(dy, dz) / (Math.PI * 2) * 24;
  const f = a - Math.floor(a);
  const lug = f < 0.55 ? 1 : 0;
  const groove = Math.abs(p.x - (p.x > 0 ? 1 : -1)) < 0.03 ? 0 : 1;
  return lug && groove ? mix("#1b1b22", "#2c2c36", noise(p, 0.04, 6)) : "#050507";
});

const HUB_PAINT = grain(RIM, "#c7ceda", { size: 0.02, axis: "x", seed: 4 });

export default function build() {
>>>>>>> REPLACE
<<<<<<< SEARCH
  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, bone: any = root) =>
=======
  const box = (w: number, h: number, d: number, c: any, at: number[], name: string, bone: any = root) =>
>>>>>>> REPLACE
<<<<<<< SEARCH
  box(1.9, 0.5, 5.2, HULL, [0, 0.95, 0], "hullSide");
  for (const s of [1, -1]) {
    box(0.1, 0.45, 5.0, HULL_LIGHT, [s * 1.0, 0.95, 0], "hullSide");
=======
  box(1.9, 0.5, 5.2, HULL_PAINT, [0, 0.95, 0], "hullSide");
  for (const s of [1, -1]) {
    box(0.1, 0.45, 5.0, HULL_PAINT, [s * 1.0, 0.95, 0], "hullSide");
    b.part(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", { at: [s * 1.056, 1.0, 1.0], dir: [s, 0, 0], axis: "z", bone: root, texture: UNIT_NUM, name: "unitNumber" });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 10), TANK, {
=======
  b.part(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 10), TANK_PAINT, {
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), TYRE, {
=======
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), TYRE_PAINT, {
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 8), RIM, {
=======
      b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 8), HUB_PAINT, {
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofLightBar(b: Builder) {
  const BRACKET = "#0a0c12";
  const WHITE = "#e8fbff";
  const Y0 = 2.2; // top of stage-1 housing
  const Z = 0.5;

  const bone = "chassis";
  const box = (w: number, h: number, d: number, c: string, at: number[], name: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, bone, name });

  // lens texture: bright core fading to edges, with scanline slits
  const lens = (hex: string) =>
    svg(
      `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="32" rx="5" fill="${hex}"/>
        <rect x="4" y="4" width="56" height="24" rx="4" fill="#ffffff" opacity="0.55"/>
        <path d="M8 10H56M8 16H56M8 22H56" stroke="${hex}" stroke-width="3" opacity="0.7"/>
        <rect width="64" height="32" rx="5" fill="none" stroke="#06080d" stroke-width="2"/>
      </svg>`,
      { size: 128 },
    );
  const lensC = lens(CYAN);
  const lensM = lens(MAGENTA);

  // main slim housing (dark shell wrapping the stage-1 housing)
  box(1.62, 0.05, 0.3, BRACKET, [0, 2.205, Z], "s21BarBase");
  box(1.62, 0.04, 0.05, HULL_LIGHT, [0, 2.31, Z + 0.13], "s21BarFrontLip");
  box(1.62, 0.04, 0.05, HULL_LIGHT, [0, 2.31, Z - 0.13], "s21BarBackLip");

  // six lamps, alternating cyan / magenta, each with a lens card and glowing core
  for (let i = 0; i < 6; i++) {
    const x = -0.6 + i * 0.24;
    const c = i % 2 ? MAGENTA : CYAN;
    const tex = i % 2 ? lensM : lensC;
    box(0.23, 0.02, 0.2, BRACKET, [x, 2.245, Z], "s21LampBase");
    glow(
      b.part(new THREE.BoxGeometry(0.2, 0.09, 0.17), c, { at: [x, 2.3, Z], bone, name: "s21LampCore" }),
      1.6,
    );
    // lens face on top and front
    glow(
      b.part(new THREE.PlaneGeometry(0.19, 0.16), "#ffffff", {
        at: [x, 2.352, Z],
        dir: [0, 1, 0],
        axis: "z",
        up: [0, 0, 1],
        texture: tex,
        bone,
        name: "s21LensTop",
      }),
      1.4,
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.19, 0.07), "#ffffff", {
        at: [x, 2.3, Z + 0.088],
        dir: [0, 0, 1],
        axis: "z",
        texture: tex,
        bone,
        name: "s21LensFront",
      }),
      1.4,
    );
    // white hot spot
    glow(
      b.part(new THREE.BoxGeometry(0.06, 0.012, 0.05), WHITE, { at: [x, 2.356, Z], bone, name: "s21Hot" }),
      2,
    );
    // divider fins between lamps
    if (i < 5) box(0.025, 0.1, 0.19, BRACKET, [x + 0.12, 2.3, Z], "s21Divider");
  }

  // end caps and brackets
  for (const s of [1, -1]) {
    box(0.07, 0.14, 0.3, BRACKET, [s * 0.8, 2.29, Z], "s21EndCap");
    glow(box(0.02, 0.06, 0.2, RED, [s * 0.84, 2.29, Z], "s21EndLamp"), 1.5);
    // mounting struts down to the cab roof
    for (const dz of [-0.09, 0.09]) {
      box(0.06, 0.12, 0.05, BRACKET, [s * 0.68, 2.16, Z + dz], "s21Strut");
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), RIM, {
        at: [s * 0.68, 2.12, Z + dz],
        bone,
        name: "s21Bolt",
      });
    }
    // angled foot plate
    box(0.14, 0.015, 0.2, HULL_LIGHT, [s * 0.68, 2.11, Z], "s21Foot");
  }

  // center emblem plate and cable conduit running back along the roof
  box(0.16, 0.03, 0.06, YELLOW, [0, 2.34, Z - 0.1], "s21Warning");
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 6), BRACKET, {
    at: [0, 2.12, Z - 0.35],
    rotation: [90, 0, 0],
    bone,
    name: "s21Conduit",
  });
  box(0.07, 0.035, 0.07, BRACKET, [0, 2.11, Z - 0.16], "s21ConduitClamp");

  // glow underlay strip reflecting on roof
  glow(box(1.5, 0.008, 0.28, CYAN, [0, 2.112, Z], "s21RoofGlow"), 0.5);
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addFrontBumperBar(b: Builder) {
  const STEEL = "#0a0c12";
  const BOLT = "#6b7385";
  const box = (w: number, h: number, d: number, c: string, at: number[], name: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, name });

  // ---- Bull bar (front bumper) ----
  const z0 = 2.88;
  // lower skid plate
  box(1.9, 0.1, 0.12, STEEL, [0, 0.46, z0], "bullSkid");
  // top rail
  box(1.9, 0.09, 0.1, STEEL, [0, 0.86, z0], "bullTop");
  // verticals
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) {
    box(0.08, 0.46, 0.09, STEEL, [x, 0.66, z0], "bullPost");
    b.part(new THREE.SphereGeometry(0.035, 6, 4), BOLT, { at: [x, 0.86, z0 + 0.06] as any, name: "bullBolt" });
  }
  // angled wings
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.4, 0.4), STEEL, { at: [s * 1.0, 0.66, 2.72] as any, rotation: [0, s * 20, 0], name: "bullWing" });
    glow(box(0.14, 0.14, 0.1, MAGENTA, [s * 1.0, 0.66, 2.93], "bullCornerLamp"), 1.6);
  }
  // glowing cyan strip between posts
  for (const x of [-0.675, -0.225, 0.225, 0.675])
    glow(box(0.32, 0.07, 0.05, CYAN, [x, 0.66, z0 + 0.05], "bullNeon"), 1.8);
  // tow hooks
  for (const s of [1, -1]) box(0.08, 0.08, 0.14, YELLOW, [s * 0.6, 0.46, z0 + 0.08], "towHook");

  // ---- Grille ----
  const gz = 2.67;
  box(1.2, 0.34, 0.04, STEEL, [0, 1.0, gz], "grilleBack");
  for (let i = 0; i < 5; i++) box(1.1, 0.03, 0.05, HULL_LIGHT, [0, 0.89 + i * 0.065, gz + 0.03], "grilleSlat");
  box(1.2, 0.04, 0.06, HULL_LIGHT, [0, 1.19, gz + 0.02], "grilleTop");
  box(1.2, 0.04, 0.06, HULL_LIGHT, [0, 0.83, gz + 0.02], "grilleBottom");
  for (const s of [1, -1]) {
    box(0.04, 0.34, 0.06, HULL_LIGHT, [s * 0.6, 1.0, gz + 0.02], "grilleSide");
    glow(box(0.5, 0.04, 0.04, "#fff6c8", [s * 0.75, 1.23, gz - 0.02], "headStrip"), 1.6);
    glow(box(0.5, 0.025, 0.04, CYAN, [s * 0.75, 1.17, gz - 0.02], "headStripCyan"), 1.6);
  }
  // emblem
  const emblem = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="29" fill="#1a0615" stroke="#ff2bd6" stroke-width="5"/>
      <path d="M32 10 L52 46 L12 46 Z" fill="none" stroke="#ff2bd6" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="32" cy="35" r="5" fill="#ff2bd6"/>
      <path d="M32 10 V26" stroke="#ff2bd6" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
      at: [0, 1.0, gz + 0.075] as any,
      dir: [0, 0, 1],
      axis: "z",
      texture: emblem,
      name: "grilleEmblem",
    }),
    1.5,
  );
}

export function addGrille(_b: Builder) {
  // grille is built in addFrontBumperBar
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addCannonNozzle(b: Builder) {
  const BRASS = "#b8893c";
  const STEEL = "#9aa3b5";
  const BLACK = "#0a0b10";
  const bone = "cannonPitch";

  // The barrel is a cylinder rotated 90deg about X: it runs along Z from z=0 to z=1.4 at y=2.6.
  // Nozzle part (stage 1) is at z=1.5. Build details around z=1.5..1.9, y=2.6.
  const Y = 2.6;
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, z: number, name: string, y = Y, x = 0) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: [90, 0, 0], bone, name });

  // flared muzzle: cone widening forward, then a lip ring
  cyl(0.3, 0.2, 0.22, 10, HULL_DARK, 1.72, "s23Flare");
  cyl(0.33, 0.33, 0.06, 10, STEEL, 1.85, "s23MuzzleRing");
  cyl(0.26, 0.26, 0.04, 10, BLACK, 1.875, "s23Bore");
  // glow ring just inside the lip
  glow(b.part(new THREE.TorusGeometry(0.29, 0.02, 5, 14), CYAN, { at: [0, Y, 1.89], bone, name: "s23GlowRing" }), 2);
  glow(b.part(new THREE.TorusGeometry(0.2, 0.012, 5, 12), CYAN, { at: [0, Y, 1.62], bone, name: "s23GlowRing2" }), 1.5);

  // hose clamps on the barrel
  for (const z of [0.3, 0.75, 1.2]) {
    cyl(0.21, 0.21, 0.08, 8, STEEL, z, "s23Clamp");
    b.part(new THREE.BoxGeometry(0.06, 0.08, 0.1), BLACK, { at: [0.0, Y + 0.23, z], bone, name: "s23ClampBolt" });
  }

  // pressure gauge on top of the barrel near the nozzle
  const gx = 0, gy = Y + 0.27, gz = 1.35;
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 6), BRASS, { at: [gx, gy - 0.03, gz], bone, name: "s23GaugeStem" });
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 12), BRASS, { at: [gx, gy + 0.04, gz], bone, name: "s23GaugeBody" });
  const face = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e8e8e0" stroke="#222" stroke-width="4"/>
    <path d="M20 70 A40 40 0 0 1 80 70" stroke="#222" stroke-width="5" fill="none"/>
    <path d="M62 36 A40 40 0 0 1 80 70" stroke="#ff2a3a" stroke-width="7" fill="none"/>
    <path d="M50 50 L68 34" stroke="#111" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="6" fill="#111"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.CircleGeometry(0.095, 12), "#ffffff", {
    at: [gx, gy + 0.075, gz], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: face, bone, name: "s23GaugeFace",
  });

  // feed pipe from gauge-side to the barrel sides and flange brackets
  for (const s of [1, -1]) {
    b.rod([s * 0.2, Y - 0.05, 1.0], [s * 0.27, Y - 0.2, 1.55], 0.025, BRASS, { bone, name: "s23Pipe" });
    b.part(new THREE.BoxGeometry(0.05, 0.12, 0.14), HULL_DARK, { at: [s * 0.22, Y - 0.1, 1.55], bone, name: "s23Bracket" });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), YELLOW, { at: [s * 0.3, Y - 0.2, 1.58], bone, name: "s23Valve" });
  }

  // warning stripes around the flare
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.62, 0.05, 0.03), i % 2 ? YELLOW : BLACK, { at: [0, Y, 1.64 + i * 0.0], bone, name: "s23Stripe", scale: [0.0001 + 0, 1, 1] });
  // emblem plate under the barrel
  b.part(new THREE.BoxGeometry(0.14, 0.04, 0.3), YELLOW, { at: [0, Y - 0.22, 0.95], bone, name: "s23Plate" });
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addSideLightBarL(b: Builder) {
  const VENT = "#07080c";
  const GLOW_HOT = "#ffd6f6";
  const STEEL = "#6b7387";

  // painted vent slat texture (shared)
  const ventTex = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="#0a0b10"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${3 + i * 7.6}" y="2" width="5" height="12" rx="1" fill="#1d2230"/><rect x="${3 + i * 7.6}" y="2" width="5" height="2" fill="#ff2bd6" opacity="0.55"/>`).join("")}
    </svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const x = s * 1.07;
    const root = "chassis";
    const P = (px: number, py: number, pz: number) => [px, py, pz] as [number, number, number];

    // neon housing channel (dark trough) behind the glow tube
    b.part(new THREE.BoxGeometry(0.07, 0.1, 3.3), HULL_DARK, { at: P(s * 1.055, 0.55, 0), bone: root, name: `sideNeonTrough${s}` });
    // main neon tube
    b.part(new THREE.BoxGeometry(0.04, 0.05, 3.1), MAGENTA, { at: P(s * 1.095, 0.55, 0), bone: root, name: `sideNeonTube${s}` });
    // hot core
    b.part(new THREE.BoxGeometry(0.02, 0.02, 3.05), GLOW_HOT, { at: P(s * 1.12, 0.55, 0), bone: root, name: `sideNeonCore${s}` });
    // end caps
    for (const z of [-1.65, 1.65]) {
      b.part(new THREE.BoxGeometry(0.09, 0.13, 0.06), STEEL, { at: P(s * 1.06, 0.55, z), bone: root, name: `sideNeonCap${s}` });
    }
    // mounting brackets
    for (let i = 0; i < 5; i++) {
      const z = -1.4 + i * 0.7;
      b.part(new THREE.BoxGeometry(0.1, 0.14, 0.05), HULL_LIGHT, { at: P(s * 1.06, 0.55, z), bone: root, name: `sideBracket${s}` });
      b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 6), STEEL, { at: P(s * 1.115, 0.55, z), rotation: [0, 0, 90], bone: root, name: `sideBolt${s}` });
    }
    // vent panel above the strip with textured slats
    b.part(new THREE.BoxGeometry(0.04, 0.14, 2.2), VENT, { at: P(s * 1.06, 0.72, -0.1), bone: root, name: `ventBack${s}` });
    b.part(new THREE.PlaneGeometry(2.1, 0.12), "#ffffff", {
      at: P(s * 1.084, 0.72, -0.1),
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: ventTex,
      bone: root,
      name: `ventTex${s}`,
    });
    // vent frame
    b.part(new THREE.BoxGeometry(0.05, 0.015, 2.25), STEEL, { at: P(s * 1.065, 0.795, -0.1), bone: root, name: `ventFrameTop${s}` });
    b.part(new THREE.BoxGeometry(0.05, 0.015, 2.25), STEEL, { at: P(s * 1.065, 0.645, -0.1), bone: root, name: `ventFrameBot${s}` });
    for (const z of [-1.2, 1.0]) {
      b.part(new THREE.BoxGeometry(0.05, 0.15, 0.02), STEEL, { at: P(s * 1.065, 0.72, z), bone: root, name: `ventFrameEnd${s}` });
    }
    // small status lamps beside the vents
    [CYAN, YELLOW, RED].forEach((c, i) => {
      b.part(new THREE.SphereGeometry(0.022, 6, 4), c, { at: P(s * 1.09, 0.72, 1.25 + i * 0.1), bone: root, name: `statusLamp${s}` });
    });
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addAntennaArray(b: Builder) {
  const BASE = [0.6, 2.2, -0.9];
  const BLACK = "#0a0b10";
  const METAL = "#6d7588";
  const PALE = "#c9d2e4";
  const bone: any = "chassis";

  const P = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { at: at as any, bone, ...extra });

  // mounting plate with corner bolts
  P(new THREE.BoxGeometry(0.62, 0.05, 0.5), HULL_DARK, [BASE[0], BASE[1] + 0.02, BASE[2]], { name: "antPlate" });
  P(new THREE.BoxGeometry(0.5, 0.03, 0.38), HULL_LIGHT, [BASE[0], BASE[1] + 0.055, BASE[2]], { name: "antPlateTop" });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      P(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), METAL, [BASE[0] + sx * 0.26, BASE[1] + 0.07, BASE[2] + sz * 0.2], { name: "antBolt" });

  // three whip antennas of different heights
  const whips = [
    { x: -0.2, z: 0.12, h: 0.75, c: CYAN },
    { x: 0.05, z: -0.14, h: 0.55, c: MAGENTA },
    { x: 0.22, z: 0.1, h: 0.4, c: YELLOW },
  ];
  whips.forEach((w, i) => {
    const x = BASE[0] + w.x;
    const z = BASE[2] + w.z;
    const y0 = BASE[1] + 0.07;
    P(new THREE.CylinderGeometry(0.045, 0.06, 0.1, 8), HULL_DARK, [x, y0 + 0.05, z], { name: "whipBase" + i });
    P(new THREE.CylinderGeometry(0.025, 0.035, 0.06, 8), METAL, [x, y0 + 0.13, z], { name: "whipCollar" + i });
    b.rod([x, y0 + 0.14, z], [x, y0 + w.h * 0.6, z], [0.014, 0.01], BLACK, { bone, name: "whipLow" + i });
    b.rod([x, y0 + w.h * 0.6, z], [x + 0.01, y0 + w.h, z], [0.01, 0.004], BLACK, { bone, name: "whipTop" + i });
    for (const f of [0.35, 0.6]) {
      P(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 6), METAL, [x, y0 + w.h * f, z], { name: "whipRing" + i });
    }
    glow(P(new THREE.SphereGeometry(0.022, 6, 4), w.c, [x + 0.01, y0 + w.h + 0.01, z], { name: "whipTip" + i }), 1.6);
  });

  // dish on a swivel mount
  const dx = BASE[0] - 0.02;
  const dz = BASE[2] - 0.05;
  P(new THREE.CylinderGeometry(0.05, 0.07, 0.12, 8), HULL_DARK, [dx - 0.0, BASE[1] + 0.13, dz + 0.0], { name: "dishPost", scale: [1, 1, 1] });
  P(new THREE.BoxGeometry(0.1, 0.06, 0.1), HULL_LIGHT, [dx, BASE[1] + 0.22, dz], { name: "dishYoke" });
  const dishTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#8a93a8"/><circle cx="32" cy="32" r="22" fill="none" stroke="#3a4152" stroke-width="2"/><circle cx="32" cy="32" r="12" fill="none" stroke="#3a4152" stroke-width="2"/><circle cx="32" cy="32" r="4" fill="#19f0ff"/></svg>`,
    { size: 128 },
  );
  // bowl: hemisphere facing up-and-back-left
  const bowl = new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.2);
  P(bowl, PALE, [dx, BASE[1] + 0.3, dz], { rotation: [-115, 0, 0], name: "dishBowl", flat: true });
  P(new THREE.CircleGeometry(0.15, 12), "#ffffff", [dx, BASE[1] + 0.3 + 0.02, dz - 0.03], {
    dir: [0, 0.4, -1],
    axis: "z",
    texture: dishTex,
    name: "dishFace",
  });
  b.rod([dx, BASE[1] + 0.3, dz], [dx, BASE[1] + 0.42, dz - 0.16], 0.008, METAL, { bone, name: "dishFeed" });
  glow(P(new THREE.SphereGeometry(0.02, 6, 4), CYAN, [dx, BASE[1] + 0.43, dz - 0.17], { name: "dishFeedTip" }), 1.4);

  // blinking beacon with cage
  const bx = BASE[0] + 0.24;
  const bz = BASE[2] - 0.15;
  P(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 8), HULL_DARK, [bx, BASE[1] + 0.09, bz], { name: "beaconBase" });
  glow(P(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8), RED, [bx, BASE[1] + 0.16, bz], { name: "beaconLens" }), 2);
  P(new THREE.CylinderGeometry(0.035, 0.02, 0.03, 8), HULL_DARK, [bx, BASE[1] + 0.23, bz], { name: "beaconCap" });
  for (const a of [0, 90, 180, 270]) {
    const r = (a * Math.PI) / 180;
    b.rod([bx + Math.cos(r) * 0.055, BASE[1] + 0.11, bz + Math.sin(r) * 0.055], [bx + Math.cos(r) * 0.05, BASE[1] + 0.22, bz + Math.sin(r) * 0.05], 0.004, METAL, { bone, name: "beaconCage" });
  }

  // cable run from plate to cab roof edge
  b.rod([BASE[0] - 0.2, BASE[1] + 0.06, BASE[2] + 0.15], [BASE[0] - 0.2, BASE[1] + 0.06, BASE[2] + 0.4], 0.012, BLACK, { bone, name: "antCable" });
  P(new THREE.BoxGeometry(0.06, 0.03, 0.04), YELLOW, [BASE[0] - 0.2, BASE[1] + 0.075, BASE[2] + 0.28], { name: "antTag" });
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addWindowDetail(b: Builder) {
  const WIRE = "#9aa3b5";
  const DARKM = "#0a0c12";
  const AMBER = "#ff8a1c";
  const bone = "chassis";

  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, bone, name, ...(rot ? { rotation: rot as any } : {}) });
  const cyl = (r0: number, r1: number, h: number, seg: number, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), c, { at: at as any, bone, name, ...(rot ? { rotation: rot as any } : {}) });

  // ---------- window wire grilles on side windows ----------
  const grille = svg(
    `<svg viewBox="0 0 64 64"><g stroke="#aab2c4" stroke-width="3.5" fill="none">
      <path d="M0 0L64 64M0 32L32 64M32 0L64 32M0 64L64 0M0 32L32 0M32 64L64 32"/></g>
      <rect x="1" y="1" width="62" height="62" fill="none" stroke="#5a6277" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.4, 0.4), "#ffffff", {
      at: [s * 0.97, 1.75, 0.3],
      dir: [s, 0, 0],
      axis: "z",
      bone,
      texture: grille,
      name: "windowGrille",
    });
    // frame
    box(0.04, 0.04, 1.44, DARKM, [s * 0.965, 1.96, 0.3], "grilleFrameT");
    box(0.04, 0.04, 1.44, DARKM, [s * 0.965, 1.54, 0.3], "grilleFrameB");
    for (const z of [-0.42, 1.02]) box(0.04, 0.44, 0.04, DARKM, [s * 0.965, 1.75, z], "grilleFrameE");
    for (const z of [-0.3, 0.3, 0.9]) cyl(0.012, 0.012, 0.01, 5, WIRE, [s * 0.975, 1.75, z], "grilleBolt", [0, 0, 90]);
  }

  // ---------- HUD sticker strip on windshield top ----------
  const hud = svg(
    `<svg viewBox="0 0 160 24"><rect width="160" height="24" fill="#052a33"/>
    <rect x="1" y="1" width="158" height="22" fill="none" stroke="#19f0ff" stroke-width="2"/>
    <path d="M6 6h30M6 12h18M6 18h40" stroke="#19f0ff" stroke-width="2"/>
    <text x="62" y="17" font-family="monospace" font-weight="bold" font-size="13" fill="#19f0ff">RCI-07 // UNIT</text>
    <path d="M140 4l12 8-12 8z" fill="#ff2bd6"/></svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(1.5, 0.12), "#ffffff", {
    at: [0, 1.93, 1.24],
    rotation: [-18, 0, 0] as any,
    bone,
    texture: hud,
    name: "hudSticker",
  });

  // ---------- rear lights bar ----------
  box(1.9, 0.16, 0.08, DARKM, [0, 1.3, -2.64], "tailHousing");
  for (let i = 0; i < 8; i++) box(0.2, 0.08, 0.04, i % 4 === 3 ? AMBER : RED, [-0.8 + i * 0.228, 1.3, -2.69], "tailLamp");

  // ---------- exhaust pipes ----------
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 0.4, 8, "#3a3f4c", [s * 0.7, 0.95, -2.65], "exhaust", [90, 0, 0]);
    cyl(0.055, 0.055, 0.05, 8, DARKM, [s * 0.7, 0.95, -2.86], "exhaustHole", [90, 0, 0]);
    cyl(0.085, 0.085, 0.04, 8, RIM, [s * 0.7, 0.95, -2.78], "exhaustBand", [90, 0, 0]);
    box(0.06, 0.2, 0.06, DARKM, [s * 0.7, 1.05, -2.5], "exhaustBracket");
  }

  // ---------- tank hatch ----------
  cyl(0.28, 0.3, 0.07, 10, HULL_DARK, [0, 2.63, -1.55], "hatchRing");
  cyl(0.22, 0.22, 0.06, 10, HULL_LIGHT, [0, 2.68, -1.55], "hatchLid");
  cyl(0.04, 0.04, 0.12, 6, YELLOW, [0, 2.75, -1.55], "hatchKnob");
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    cyl(0.018, 0.018, 0.03, 5, RIM, [Math.cos(a) * 0.25, 2.66, -1.55 + Math.sin(a) * 0.25], "hatchBolt");
  }

  // ---------- hose reel with coiled hose ----------
  const rz = -2.72;
  const ry = 1.75;
  cyl(0.3, 0.3, 0.06, 12, HULL_DARK, [-0.45, ry, rz], "reelFlangeA", [90, 0, 0]);
  cyl(0.3, 0.3, 0.06, 12, HULL_DARK, [-0.45, ry, rz - 0.3], "reelFlangeB", [90, 0, 0]);
  cyl(0.1, 0.1, 0.3, 8, RIM, [-0.45, ry, rz - 0.15], "reelCore", [90, 0, 0]);
  for (let i = 0; i < 4; i++) {
    const r = 0.14 + (i % 2) * 0.05;
    b.part(new THREE.TorusGeometry(r, 0.035, 5, 12), CYAN === "" ? YELLOW : "#e0b800", {
      at: [-0.45, ry, rz - 0.06 - i * 0.06] as any,
      bone,
      name: "hoseCoil",
    });
  }
  box(0.05, 0.5, 0.05, DARKM, [-0.45, ry - 0.3, rz - 0.03], "reelStrut");
  box(0.06, 0.06, 0.4, DARKM, [-0.45, ry, rz - 0.15], "reelAxle");
  b.part(new THREE.TorusGeometry(0.12, 0.025, 5, 10), "#e0b800", { at: [-0.25, 1.45, -2.7] as any, bone, name: "hoseLoop" });
  cyl(0.04, 0.04, 0.1, 6, RIM, [-0.45 + 0.3, 1.6, rz - 0.08], "hoseNozzle", [0, 0, 90]);

  // ---------- extra: neon strip under rear bumper ----------
  box(1.4, 0.04, 0.06, MAGENTA, [0, 0.72, -2.64], "rearUnderGlow");
}
```