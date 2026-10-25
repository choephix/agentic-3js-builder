import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, mix, smoothstep, svg, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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

const podPaint = paint((p, n) => {
  const cu = 0.9, cv = 0.7;
  const ax = Math.abs(n.x), ay = Math.abs(n.y);
  const [u, v] = ax > 0.5 ? [p.z, p.y] : ay > 0.5 ? [p.x, p.z] : [p.x, p.y];
  const fu = ((u / cu) % 1 + 1) % 1 * cu, fv = ((v / cv) % 1 + 1) % 1 * cv;
  const grime = noise(p, 0.5, 3);
  let c = mix(HULL, HULL_DARK, 0.25 + 0.6 * grime);
  const cell = Math.floor(u / cu) + Math.floor(v / cv);
  if (cell % 2 === 0) c = mix(c, HULL_DARK, 0.25);
  if (fu < 0.03 || fv < 0.03) c = mix(c, STEEL_DARK, 0.85);
  else if (Math.hypot(fu - 0.07, ((fv / 0.2) % 1 - 0.5) * 0.2) < 0.017) c = mix(c, HUB, 0.7);
  if (ax > 0.5 && p.y < 1.5 && p.y > 1.2 && ((p.z * 4 + p.y * 4) % 1 + 1) % 1 < 0.5) c = mix(c, WARN, 0.55);
  if (ax > 0.5 && p.y > 2.4 && p.y < 3.1 && Math.abs(p.z + 2.6) < 0.8) {
    const k = ((p.z + 3.4) / 1.6);
    const d = Math.abs(((k * 3) % 1) - 0.5);
    if (d < 0.18 && Math.abs(p.y - 2.75) < 0.3) c = mix(c, WARN, 0.4);
  }
  c = mix(c, STEEL_DARK, 0.5 * smoothstep(0.55, 0.8, noise(p, 0.15, 8)) * smoothstep(0.5, -0.5, n.y));
  return c;
});
const cabPaint = paint((p, n) => {
  const cu = 0.6, cv = 0.45;
  const ax = Math.abs(n.x), ay = Math.abs(n.y);
  const [u, v] = ax > 0.5 ? [p.z, p.y] : ay > 0.5 ? [p.x, p.z] : [p.x, p.y];
  const fu = ((u / cu) % 1 + 1) % 1 * cu, fv = ((v / cv) % 1 + 1) % 1 * cv;
  let c = mix(HULL, HULL_DARK, 0.2 * noise(p, 0.3, 5));
  const scr = Math.abs(((p.x * 3 + p.y * 9 + p.z * 5) % 1) - 0.5);
  if (scr < 0.02 && noise(p, 0.2, 6) > 0.5) c = mix(c, HUB, 0.6);
  if (fu < 0.025 || fv < 0.025) c = mix(c, STEEL_DARK, 0.8);
  else if (fu < 0.04 || fv < 0.04) c = mix(c, CYAN, 0.7);
  else if (Math.hypot(fu - 0.07, fv - 0.07) < 0.014) c = mix(c, HUB, 0.8);
  return c;
});
const tirePaint = paint((p, n, s) => {
  const ang = Math.atan2(p.y - 0.62, p.z - Math.round((p.z + 1.2) / 3.2) * 0) ;
  const a = Math.atan2(n.y, n.z);
  const chev = Math.abs((((p.x > 0 ? p.x - 1.35 : -p.x - 1.35) * 6 + a * 3) % 1 + 1) % 1 - 0.5);
  let c: any = TIRE;
  if (Math.abs(n.x) < 0.5 && chev < 0.18) c = mix(TIRE, "#05060a", 0.8);
  else c = mix(TIRE, "#242831", 0.5 * noise(p, 0.1, 2));
  if (Math.abs(n.x) > 0.7) c = mix(c, "#3a3f4a", 0.6);
  return c;
});

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
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 10), tirePaint, { at: [s * 1.35, 0.62, z], rotation: [0, 0, 90], name: "wheel" });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.58, 8), HUB, { at: [s * 1.36, 0.62, z], rotation: [0, 0, 90] });
      box(0.2, 0.08, 1.5, HULL, [s * 1.25, 1.3, z], "fender");
    }
  // cab
  box(2.3, 1.2, 2.6, cabPaint as any, [0, 1.75, 3.1], "cab");
  box(2.3, 0.7, 1.6, cabPaint as any, [0, 1.15, 4.0], "cab");
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
  box(2.7, 2.2, 6.6, podPaint as any, [0, 2.25, -2.6], "podShell");
  box(2.5, 0.35, 6.4, podPaint as any, [0, 3.5, -2.6], "podShell");
  for (const z of [-0.2, -2.6, -5.0]) box(2.85, 2.3, 0.18, HULL_DARK, [0, 2.25, z]);
  box(2.4, 0.25, 6.2, STEEL_DARK, [0, 1.1, -2.6]);
  for (const s of [1, -1]) box(0.08, 0.1, 6.0, MAGENTA, [s * 1.37, 2.9, -2.6]);
  box(1.2, 0.06, 1.2, WARN, [0, 3.7, -2.6]);
  box(2.2, 1.6, 0.15, STEEL_DARK, [0, 2.2, -6.0]);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const Y = 2.875; // cab roof top (2.6 + 0.275)
  const Z = 3.2;
  const BAR = "#1b1f27";
  const box = (w: number, h: number, d: number, c: string, at: number[], name: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], name });

  // housing: slim bar with end caps and a front hood
  box(1.8, 0.14, 0.3, BAR, [0, Y + 0.17, Z], "lightBarHousing");
  box(1.84, 0.04, 0.38, STEEL_DARK, [0, Y + 0.26, Z - 0.02], "lightBarHood");
  for (const s of [1, -1]) {
    box(0.06, 0.2, 0.34, HULL_DARK, [s * 0.92, Y + 0.17, Z], "lightBarCap");
    // brackets down to the roof
    for (const x of [0.62, 0.0]) {
      const px = s * x;
      if (s === -1 && x === 0) continue;
      box(0.12, 0.12, 0.2, STEEL_DARK, [px, Y + 0.05, Z], "lightBarBracket");
      box(0.2, 0.03, 0.28, HUB, [px, Y + 0.005, Z], "lightBarFoot");
    }
  }

  // six lamps alternating cyan / magenta, glowing
  const xs = [-0.7, -0.42, -0.14, 0.14, 0.42, 0.7];
  xs.forEach((x, i) => {
    const c = i % 2 === 0 ? CYAN : MAGENTA;
    glow(
      b.part(new THREE.BoxGeometry(0.22, 0.09, 0.05), c, {
        at: [x, Y + 0.17, Z + 0.17],
        name: "lightBarLamp",
      }),
      1.6,
    );
    // lens bezel
    box(0.26, 0.12, 0.02, STEEL_DARK, [x, Y + 0.17, Z + 0.155], "lightBarBezel");
  });

  // hazard label decal on the hood top
  const tex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#14171d"/>
    <path d="M0 16 L8 0 H16 L8 16Z M16 16 L24 0 H32 L24 16Z M32 16 L40 0 H48 L40 16Z M48 16 L56 0 H64 L56 16Z" fill="#e8b224"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
    at: [0, Y + 0.285, Z - 0.02],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: tex,
    name: "lightBarStripe",
  });

  // wiring conduit running from bar rear to roof
  b.rod([0.5, Y + 0.1, Z - 0.16], [0.5, Y + 0.02, Z - 0.5], 0.015, { color: STEEL_DARK });
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addGrille(b: Builder) {
  const Z = 4.5;
  const BOLT = "#59626f";
  // frame: housing box behind slats
  b.part(new THREE.BoxGeometry(1.7, 0.85, 0.12), STEEL_DARK, { at: [0, 1.0, Z - 0.02], name: "grilleBack" });
  // glowing strip behind slats
  glow(b.part(new THREE.BoxGeometry(1.45, 0.07, 0.05), CYAN, { at: [0, 1.0, Z + 0.06], name: "grilleGlow" }), 1.6);
  // slats
  for (let i = 0; i < 6; i++) {
    const y = 0.72 + i * 0.11;
    b.part(new THREE.BoxGeometry(1.55, 0.065, 0.1), i % 2 ? STEEL_DARK : HULL_DARK, {
      at: [0, y, Z + 0.1],
      rotation: [-18, 0, 0],
      name: "grilleSlat",
    });
  }
  // frame rails
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.85, 0.16), HULL, { at: [s * 0.82, 1.0, Z + 0.08], name: "grilleRail" });
    for (const y of [0.75, 1.25]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), BOLT, {
        at: [s * 0.82, y, Z + 0.17],
        rotation: [90, 0, 0],
      });
    }
    // vertical cyan edge lines
    glow(b.part(new THREE.BoxGeometry(0.03, 0.7, 0.03), CYAN, { at: [s * 0.9, 1.0, Z + 0.12] }), 1.3);
  }
  // top and bottom rails
  for (const y of [0.54, 1.46]) {
    b.part(new THREE.BoxGeometry(1.75, 0.08, 0.18), HULL, { at: [0, y, Z + 0.08], name: "grilleRail" });
  }
  // center emblem
  b.part(new THREE.BoxGeometry(0.16, 0.16, 0.05), HULL_DARK, { at: [0, 1.0, Z + 0.17], rotation: [0, 0, 45] });
  glow(b.part(new THREE.BoxGeometry(0.07, 0.07, 0.03), MAGENTA, { at: [0, 1.0, Z + 0.2], rotation: [0, 0, 45] }), 1.5);
  // tow hooks below
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.1, 0.22), WARN, { at: [s * 0.55, 0.58, Z + 0.2] });
  }
}
    return addGrille;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addHeadlights(b: Builder) {
  const SOOT = "#0a0b0d";
  const LENS = svg(
    `<svg viewBox="0 0 64 32"><polygon points="2,16 12,2 62,2 62,30 12,30" fill="#22e6ff" stroke="#e9ffff" stroke-width="2"/><path d="M14 10H58M14 16H58M14 22H58" stroke="#ffffff" stroke-width="2" opacity="0.7"/></svg>`,
    { size: 128 },
  );

  // headlamps
  for (const s of [1, -1]) {
    const x = s * 0.95;
    // bezel frame: angular
    b.part(new THREE.BoxGeometry(0.5, 0.3, 0.1), STEEL_DARK, { at: [x, 1.2, 4.43], name: "headBezel" });
    b.part(new THREE.BoxGeometry(0.56, 0.06, 0.12), HULL_DARK, { at: [x, 1.38, 4.44] });
    b.part(new THREE.BoxGeometry(0.56, 0.06, 0.12), HULL_DARK, { at: [x, 1.02, 4.44] });
    // lens (textured)
    glow(
      b.part(new THREE.PlaneGeometry(0.42, 0.21), "#ffffff", {
        at: [x, 1.2, 4.495],
        dir: [0, 0, 1],
        axis: "z",
        texture: LENS,
        name: "headLens",
      }),
      1.4,
    );
    // angled cyan slab accent
    glow(b.part(new THREE.BoxGeometry(0.1, 0.22, 0.08), CYAN, { at: [x + s * 0.3, 1.2, 4.44], rotation: [0, s * 25, 0] }), 1.2);
    // mounting bolts
    for (const dx of [-0.22, 0.22])
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), HUB, { at: [x + dx, 1.2, 4.5], rotation: [90, 0, 0] });
  }

  // exhaust stacks
  for (const s of [1, -1]) {
    const x = s * 1.2;
    const z = 1.9;
    // base collar
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 8), STEEL_DARK, { at: [x, 1.9, z], name: "stackBase" });
    // pipe
    b.part(new THREE.CylinderGeometry(0.11, 0.13, 1.3, 8), HUB, { at: [x, 2.55, z], name: "stack" });
    // bands
    for (const y of [2.1, 2.5, 2.9])
      b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8), STEEL_DARK, { at: [x, y, z] });
    // heat shield on outer side (half-ish plate)
    b.part(new THREE.BoxGeometry(0.04, 0.9, 0.3), HULL, { at: [x + s * 0.17, 2.4, z], name: "heatShield" });
    for (const y of [2.1, 2.4, 2.7])
      b.part(new THREE.BoxGeometry(0.05, 0.04, 0.34), HULL_DARK, { at: [x + s * 0.17, y, z] });
    // brackets to cab
    b.part(new THREE.BoxGeometry(0.3, 0.06, 0.08), STEEL_DARK, { at: [x - s * 0.1, 2.2, z - 0.14] });
    // soot cap
    b.part(new THREE.CylinderGeometry(0.16, 0.12, 0.1, 8), SOOT, { at: [x, 3.25, z], name: "sootCap" });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8), "#000000", { at: [x, 3.31, z] });
    // cap rain-hat arms
    for (const a of [0, 90])
      b.part(new THREE.BoxGeometry(0.2, 0.02, 0.02), STEEL_DARK, { at: [x, 3.32, z], rotation: [0, a, 0] });
  }
}
    return addHeadlights;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addAntennaArray(b: Builder) {
  const BASE: [number, number, number] = [-0.7, 2.875, 2.4];
  const P = (x: number, y: number, z: number): [number, number, number] => [BASE[0] + x, BASE[1] + y, BASE[2] + z];
  const RUBBER = "#1b1e26";
  const BRASS = "#b08a3c";

  // mounting plate and bolts
  b.part(new THREE.BoxGeometry(0.62, 0.06, 0.62), STEEL_DARK, { at: P(0, 0.03, 0), name: "antPlate" });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.5), HULL, { at: P(0, 0.085, 0), name: "antPlate2" });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), HUB, { at: P(sx * 0.25, 0.1, sz * 0.25) });

  // central mast with collars
  b.part(new THREE.CylinderGeometry(0.05, 0.07, 0.3, 8), STEEL_DARK, { at: P(0, 0.25, 0), name: "mastBase" });
  b.part(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 6), HUB, { at: P(0, 0.85, 0), name: "mast" });
  for (const y of [0.45, 0.8])
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 8), BRASS, { at: P(0, y, 0) });
  const tip = b.part(new THREE.SphereGeometry(0.05, 6, 4), MAGENTA, { at: P(0, 1.33, 0), name: "mastTip" });
  glow(tip, 1.6);

  // whips: tilted thin rods with magenta tips
  const whips: [number, number, number, number][] = [
    [-0.2, 0.15, 1.0, 12],
    [0.22, -0.15, 0.85, -14],
    [0.18, 0.2, 0.7, 20],
    [-0.22, -0.18, 0.6, -22],
  ];
  whips.forEach(([x, z, h, tilt], i) => {
    const rx = (i % 2 ? 1 : -1) * tilt;
    const rz = -tilt * (x > 0 ? 1 : -1) * 0.8;
    b.part(new THREE.CylinderGeometry(0.008, 0.016, h, 5), i % 2 ? RUBBER : STEEL_DARK, {
      at: P(x, 0.1 + h / 2, z),
      rotation: [rx, 0, rz],
      name: "whip",
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), RUBBER, { at: P(x, 0.14, z) });
    const tx = x + Math.sin((rz * Math.PI) / 180) * -h * 0.5;
    const tz = z + Math.sin((rx * Math.PI) / 180) * h * 0.5;
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), MAGENTA, { at: P(tx, 0.1 + h * 0.98, tz), name: "whipTip" }), 1.8);
  });

  // dish on a side arm, facing forward and up
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.3), STEEL_DARK, { at: P(0.0, 0.62, 0.15), name: "dishArm" });
  const dish = new THREE.SphereGeometry(0.28, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.6);
  b.part(dish, HULL, {
    at: P(0, 0.7, 0.33),
    rotation: [75, 0, 0],
    name: "dish",
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 5), STEEL_DARK, {
    at: P(0, 0.82, 0.45),
    rotation: [75, 0, 0],
  });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), CYAN, { at: P(0, 0.9, 0.55), name: "feed" }), 1.5);
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), STEEL_DARK, { at: P(0, 0.66, 0.1), rotation: [75, 0, 0] });

  // small receiver box with status strip and cable
  b.part(new THREE.BoxGeometry(0.2, 0.12, 0.16), HULL_DARK, { at: P(0.2, 0.18, -0.2), name: "relayBox" });
  glow(b.part(new THREE.BoxGeometry(0.14, 0.02, 0.01), CYAN, { at: P(0.2, 0.2, -0.285) }), 1.3);
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 5), RUBBER, {
    at: P(0.1, 0.12, -0.05),
    rotation: [0, 0, 80],
  });
}
    return addAntennaArray;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addPodLocks(b: Builder) {
  const DARKM = "#5a0f3e";
  const BOLT = "#9aa3b4";
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], rotation: rot as any });

  // Hazard emblem texture
  const emblem = svg(
    `<svg viewBox="0 0 64 64">
      <polygon points="32,4 60,56 4,56" fill="#e8b224" stroke="#14171d" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="32" cy="38" r="9" fill="none" stroke="#14171d" stroke-width="4"/>
      <circle cx="32" cy="38" r="3" fill="#14171d"/>
      <rect x="30" y="18" width="4" height="9" fill="#14171d"/>
    </svg>`,
    { size: 128 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8b224"/>
      <path d="M0 16 L8 0 H20 L12 16Z M24 16 L32 0 H44 L36 16Z M48 16 L56 0 H68 L60 16Z" fill="#14171d"/></svg>`,
    { size: 128 },
  );

  // Pod top is y=3.675 (shell 2.25+1.1=3.35, lid 3.5+0.175). Pod spans x +-1.35, z -5.9..0.7
  const topY = 3.68;

  // Glowing seam rings around the pod at the divider bands
  for (const z of [-0.2, -2.6, -5.0]) {
    const y = z === -2.6 ? 2.25 : 2.25;
    // top seam
    glow(box(2.5, 0.06, 0.06, "#ff2fa8", [0, 3.36, z + 0.1]), 1.6);
    for (const s of [1, -1]) {
      glow(box(0.06, 2.0, 0.06, "#ff2fa8", [s * 1.4, y, z + 0.1]), 1.6);
    }
    glow(box(2.5, 0.06, 0.06, "#ff2fa8", [0, 1.18, z + 0.1]), 1.4);
  }

  // Central main seam ring (emphasised) at z=-2.6
  glow(box(2.9, 0.05, 0.05, "#ff2fa8", [0, 3.4, -2.6]), 2);

  // Clamps over top at each divider: bridge + side jaws + bolts
  for (const z of [-0.2, -2.6, -5.0]) {
    box(2.9, 0.16, 0.4, "#232833", [0, 3.46, z]);
    box(2.5, 0.08, 0.3, DARKM, [0, 3.56, z]);
    for (const s of [1, -1]) {
      box(0.2, 0.7, 0.42, "#14171d", [s * 1.42, 3.1, z]);
      box(0.12, 0.35, 0.46, "#e8b224", [s * 1.5, 2.9, z]);
      for (const dz of [-0.13, 0.13]) {
        b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6), BOLT, {
          at: [s * 1.5 + s * 0.06, 3.2, z + dz],
          rotation: [0, 0, 90],
        });
        b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 6), BOLT, { at: [s * 0.9, 3.64, z + dz] });
        b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 6), BOLT, { at: [-s * 0.9, 3.64, z + dz] });
      }
    }
    // latch handle
    box(0.5, 0.1, 0.1, "#9aa3b4", [0, 3.66, z]);
  }

  // Hazard emblem on lid, flat facing up
  b.part(new THREE.PlaneGeometry(1.1, 1.1), "#ffffff", {
    at: [0, 3.69, -2.6],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: emblem,
  });
  // Glowing ring around the emblem
  glow(
    b.part(new THREE.TorusGeometry(0.7, 0.04, 5, 16), "#ff2fa8", { at: [0, 3.7, -2.6], rotation: [90, 0, 0] }),
    2,
  );
  // hazard stripe bands near edges of lid
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.22, 5.0), "#ffffff", {
      at: [s * 1.1, 3.69, -2.6],
      dir: [0, 1, 0],
      axis: "z",
      texture: hazard,
      rotation: [-90, 0, 90],
    });
  }

  // Status lights on side clamps
  for (const s of [1, -1])
    for (const z of [-0.2, -2.6, -5.0])
      glow(box(0.06, 0.1, 0.1, z === -2.6 ? "#22e6ff" : "#ff2fa8", [s * 1.54, 3.3, z]), 2);

  // Rear locking bar across the pod end
  box(2.6, 0.2, 0.2, "#14171d", [0, 2.9, -6.15]);
  glow(box(0.5, 0.08, 0.05, "#ff2fa8", [0, 2.9, -6.27]), 2);
}
    return addPodLocks;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addSideTurrets(b: Builder) {
  const AMMO = "#5a6b3a";
  const BRASS = "#c9a24a";
  const RED = "#ff3a3a";
  const P = (g: THREE.BufferGeometry, c: string, at: number[], rot?: number[], name?: string, tex?: THREE.Texture) =>
    b.part(g, c, { at: at as [number, number, number], rotation: rot as any, name, texture: tex });

  const hazard = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#e8b224"/><path d="M-8 32L8 0h8L0 32zM8 32L24 0h8L16 32zM24 32L40 0h8L32 32z" fill="#14171d"/></svg>`,
    { size: 64 },
  );
  const tail = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#5a0a38"/><rect x="2" y="3" width="60" height="10" fill="#ff2fa8"/><path d="M4 8H60" stroke="#ffd0ee" stroke-width="2"/><path d="M16 3v10M32 3v10M48 3v10" stroke="#5a0a38" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );

  // side turrets
  for (const s of [1, -1]) {
    const x = s * 1.5;
    P(new THREE.CylinderGeometry(0.3, 0.34, 0.12, 8), STEEL_DARK, [x, 1.56, 0.3], undefined, "turretRing");
    P(new THREE.CylinderGeometry(0.26, 0.3, 0.2, 8), HULL, [x, 1.7, 0.3], undefined, "turretBase");
    P(new THREE.BoxGeometry(0.42, 0.28, 0.6), HULL, [x, 1.92, 0.3], undefined, "turretHead");
    P(new THREE.BoxGeometry(0.44, 0.1, 0.5), HULL_DARK, [x, 2.1, 0.28], [-8, 0, 0], "turretRoof");
    P(new THREE.BoxGeometry(0.46, 0.06, 0.3), CYAN, [x, 1.95, 0.5]);
    for (const o of [-0.12, 0.12]) {
      P(new THREE.CylinderGeometry(0.04, 0.045, 1.0, 6), STEEL_DARK, [x + o, 1.92, 0.95], [90, 0, 0], "barrel");
      P(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 6), HULL_DARK, [x + o, 1.92, 1.45], [90, 0, 0], "muzzle");
      P(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 6), HULL, [x + o, 1.92, 0.7], [90, 0, 0], "sleeve");
    }
    // ammo boxes
    P(new THREE.BoxGeometry(0.3, 0.3, 0.4), AMMO, [x + s * 0.3, 1.78, 0.1], undefined, "ammoBox");
    P(new THREE.BoxGeometry(0.32, 0.06, 0.1), WARN, [x + s * 0.3, 1.96, 0.1]);
    P(new THREE.BoxGeometry(0.02, 0.2, 0.2), BRASS, [x + s * 0.46, 1.78, 0.1]);
    P(new THREE.BoxGeometry(0.28, 0.24, 0.34), HULL_DARK, [x + s * 0.28, 1.66, -0.3], undefined, "ammoBox");
    P(new THREE.BoxGeometry(0.02, 0.2, 0.28), undefined as any, [x + s * 0.43, 1.66, -0.3], undefined, "ammoLabel", hazard);
    // feed belt
    for (let i = 0; i < 4; i++)
      P(new THREE.BoxGeometry(0.06, 0.05, 0.07), BRASS, [x + s * (0.22 - i * 0.04), 1.85 + i * 0.02, 0.0 + i * 0.07]);
    // mount bracket and status light
    P(new THREE.BoxGeometry(0.1, 0.5, 0.3), STEEL_DARK, [s * 1.4, 1.4, 0.3]);
    P(new THREE.SphereGeometry(0.04, 6, 4), RED, [x - s * 0.1, 2.14, 0.1]);
  }

  // tail lights
  P(new THREE.BoxGeometry(2.3, 0.4, 0.14), STEEL_DARK, [0, 0.95, -6.12], undefined, "tailHousing");
  P(new THREE.PlaneGeometry(2.1, 0.26), "#ffffff", [0, 0.95, -6.2], undefined, "tailStrip", tail).mesh.rotation.y = Math.PI;
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.3, 0.3, 0.12), MAGENTA, [s * 1.0, 1.28, -6.1]);
    P(new THREE.BoxGeometry(0.34, 0.06, 0.14), STEEL_DARK, [s * 1.0, 1.46, -6.1]);
  }
  // tow hitch
  P(new THREE.BoxGeometry(0.5, 0.25, 0.3), STEEL_DARK, [0, 0.62, -6.2], undefined, "hitchMount");
  P(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 8), HUB, [0, 0.62, -6.5], undefined, "hitchBall");
  P(new THREE.BoxGeometry(0.1, 0.1, 0.4), HUB, [0, 0.62, -6.35]);
  // cables
  for (const s of [1, -1]) {
    const pts = [
      new THREE.Vector3(s * 0.2, 0.7, -6.2),
      new THREE.Vector3(s * 0.45, 0.45, -6.45),
      new THREE.Vector3(s * 0.7, 0.55, -6.3),
      new THREE.Vector3(s * 0.8, 0.75, -6.15),
    ];
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.03, 5);
    b.part(g, s > 0 ? CYAN : MAGENTA, { at: [0, 0, 0], name: "cable" });
    P(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), HUB, [s * 0.2, 0.7, -6.2], [90, 0, 0]);
  }
  // reflectors
  for (const s of [1, -1]) P(new THREE.BoxGeometry(0.2, 0.08, 0.05), WARN, [s * 1.1, 0.72, -6.1]);
}
    return addSideTurrets;
  })(),
);
