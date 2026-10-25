import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

const HAZARD = paint((p, _n) => {
  const d = (p.x * 0.9 + p.z * 0.9) / 0.22;
  const stripe = d - Math.floor(d) < 0.5;
  const base = stripe ? mix("#f2c200", "#f2c200", 0) : mix("#0a0b0f", "#0a0b0f", 0);
  const grime = noise(p, 0.2, 4);
  return mix(base, "#3a3320", smoothstep(0.55, 0.85, grime) * 0.6);
});

const TREAD = paint((p, n) => {
  const a = Math.atan2(p.y - 0.5, Math.abs(p.z) % 3.8 > 1.9 ? p.z - 1.9 * Math.sign(p.z) : p.z - 1.9 * Math.sign(p.z));
  const lug = Math.floor((a + Math.PI) / (Math.PI / 12)) % 2 === 0;
  const onTread = Math.abs(n.x) < 0.5;
  const base = onTread ? (lug ? "#1d1e24" : "#07080a") : "#111216";
  return mix(base, "#4a4234", smoothstep(0.5, 0.9, noise(p, 0.15, 7)) * 0.5);
});

const PLATING = paint((p, n) => {
  const ax = Math.abs(n.x) > 0.5;
  const u = ax ? p.z : p.x;
  const v = p.y;
  const cu = 0.55;
  const cv = 0.4;
  const du = (((u / cu) % 1) + 1) % 1 * cu;
  const dv = (((v / cv) % 1) + 1) % 1 * cv;
  let c = mix("#2b2f3a", "#3a4050", noise(p, 0.3, 2));
  if (du < 0.012 || dv < 0.012) c = mix(c, "#07080b", 0.9);
  else if (Math.hypot(du - 0.04, dv - 0.04) < 0.012 || Math.hypot(du - cu + 0.04, dv - 0.04) < 0.012) c = mix(c, "#9aa4b5", 0.8);
  const sc = noise(p, 0.05, 11);
  if (sc > 0.72 && sc < 0.74) c = mix(c, "#aab3c2", 0.6);
  return mix(c, "#14161c", smoothstep(0.6, 0.9, noise(p, 0.25, 5)) * 0.4);
});

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.0, 0.6], normal: [0, 1, 0], bone: null, room: [1.8, 0.2, 0.3] },
  { id: "bumperBar", kind: "add", part: "hull", what: "Front bumper neon strip in MAGENTA with a dark housing and end caps.", at: [0, 0.7, 3.1], normal: [0, 0, 1], bone: null, room: [2.0, 0.2, 0.2] },
  { id: "grille", kind: "add", part: "hull", what: "Armoured front grille with horizontal slats in DARK and thin CYAN glow lines.", at: [0, 1.0, 3.05], normal: [0, 0, 1], bone: null, room: [1.4, 0.5, 0.2] },
  { id: "cannonNozzle", kind: "add", part: "cannon", what: "Water cannon nozzle fittings: collar rings, pressure gauge, hose clamps in STEEL and a cyan glow tip.", at: [0, 2.45, 1.9], normal: [0, 0, 1], bone: null, room: [0.5, 0.5, 0.5] },
  { id: "sideLightBars", kind: "add", part: "hull", what: "Vertical neon bars along both side flanks, alternating CYAN and MAGENTA, with dark housings.", at: [1.05, 1.2, 0], normal: [1, 0, 0], bone: null, room: [0.2, 0.3, 3.0] },
  { id: "roofAntennas", kind: "add", part: "cab", what: "Antenna array at the cab rear: three whip antennas, a dish and a small blinking beacon.", at: [0.5, 2.0, -0.6], normal: [0, 1, 0], bone: null, room: [0.6, 0.8, 0.5] },
  { id: "wheelRims", kind: "add", part: "wheel", what: "Neon ring rims and bolt patterns on all four wheels, CYAN glow inside STEEL hubs.", at: [1.0, 0.5, 1.9], normal: [1, 0, 0], bone: null, room: [0.3, 0.9, 0.9] },
  { id: "cageWindow", kind: "add", part: "cab", what: "Windscreen wire mesh guard and a CORP emblem decal on each door.", at: [0, 1.65, 1.35], normal: [0, 0.4, 1], bone: null, room: [1.6, 0.6, 0.2] },
  { id: "hullPaint", kind: "texture", part: "hullSide", what: "Corporate riot livery: HULL with diagonal DARK hazard stripes at the lower sill, a large faded unit number and logo.", },
  { id: "tireTread", kind: "texture", part: "tire", what: "Chunky tread pattern with grime on the tires." },
  { id: "plating", kind: "texture", part: "cab", what: "Scuffed armour panel seams, rivets and scratches on the cab." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#2b2f3a";
export const HULL_DARK = "#14161c";
export const STEEL = "#8a93a3";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const GLASS = "#0b2a3a";
export const DARK = "#0a0b0f";
export const YELLOW = "#f2c200";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot });

  // chassis and hull
  P(box(2.0, 0.35, 6.0), HULL_DARK, [0, 0.55, 0], "chassis");
  P(box(2.1, 0.8, 5.6), HULL, [0, 1.0, 0], "hull");
  P(box(2.12, 0.18, 5.4), HAZARD as unknown as string, [0, 0.72, 0], "hullSide");
  P(box(1.9, 0.12, 2.2), HULL, [0, 1.46, 1.8], "hood");
  // sloped hood
  P(box(2.0, 0.5, 0.8), HULL, [0, 1.0, 2.9], "nose", [-12, 0, 0].map((d) => d));
  // cab
  P(box(1.9, 0.8, 2.4), PLATING as unknown as string, [0, 1.8, -0.6], "cab");
  P(box(1.7, 0.55, 0.1), GLASS, [0, 1.8, 0.62], "windscreen", [-18, 0, 0]);
  P(box(0.1, 0.5, 1.8), GLASS, [0.96, 1.85, -0.6], "windowL");
  P(box(0.1, 0.5, 1.8), GLASS, [-0.96, 1.85, -0.6], "windowR");
  P(box(1.8, 0.15, 2.3), HULL_DARK, [0, 2.25, -0.6], "roof");
  // rear
  P(box(1.9, 0.9, 1.6), HULL_DARK, [0, 1.5, -2.4], "rearBox");
  // bumper and grille
  P(box(2.2, 0.3, 0.3), STEEL, [0, 0.62, 3.15], "bumper");
  P(box(1.4, 0.45, 0.1), DARK, [0, 1.0, 3.12], "grilleBase");
  // neon strips
  P(box(2.0, 0.06, 0.06), MAGENTA, [0, 0.82, 3.3], "bumperGlow");
  for (const s of [1, -1]) {
    P(box(0.05, 0.05, 4.8), CYAN, [s * 1.08, 0.9, 0], "sideGlow");
    P(box(0.25, 0.14, 0.06), "#fff6d0", [s * 0.7, 1.2, 3.14], "headlight");
  }
  // wheels
  for (const s of [1, -1])
    for (const z of [1.9, -1.9]) {
      const t = P(new THREE.CylinderGeometry(0.5, 0.5, 0.45, 14), TREAD as unknown as string, [s * 1.0, 0.5, z], "tire", [0, 0, 90]);
      P(new THREE.CylinderGeometry(0.28, 0.28, 0.48, 10), STEEL, [s * 1.0, 0.5, z], "wheelHub", [0, 0, 90]);
      void t;
    }
  // water cannon turret on roof
  P(new THREE.CylinderGeometry(0.4, 0.5, 0.25, 12), HULL_DARK, [0, 2.45, 0.4], "turretBase");
  P(box(0.6, 0.35, 0.6), HULL, [0, 2.7, 0.4], "turretHead");
  P(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 10), STEEL, [0, 2.75, 1.1], "cannon", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.2, 0.14, 0.25, 10), HULL_DARK, [0, 2.75, 1.9], "cannonMuzzle", [90, 0, 0]);
  P(new THREE.CylinderGeometry(0.3, 0.3, 0.7, 10), HULL, [0, 2.7, -0.1], "waterTank", [0, 0, 90]);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const y0 = 2.33; // roof top at ~2.325
  const z = 0.6;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // main housing
  b.part(box(1.8, 0.1, 0.28), HULL_DARK, { at: [0, y0 + 0.08, z], name: "lightbarHousing" });
  // top cap and lower trim
  b.part(box(1.72, 0.03, 0.22), STEEL, { at: [0, y0 + 0.14, z], name: "lightbarCap" });
  b.part(box(1.84, 0.03, 0.3), DARK, { at: [0, y0 + 0.03, z], name: "lightbarBase" });

  // brackets
  for (const x of [-0.78, -0.26, 0.26, 0.78]) {
    b.part(box(0.08, 0.1, 0.2), STEEL, { at: [x, y0 + 0.01, z], name: "lightbarBracket" });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), DARK, {
      at: [x, y0 + 0.17, z],
      name: "lightbarBolt",
    });
  }

  // six lamps alternating cyan / magenta
  for (let i = 0; i < 6; i++) {
    const x = -0.72 + i * 0.288;
    const c = i % 2 === 0 ? CYAN : MAGENTA;
    // lens in front of housing
    glow(
      b.part(box(0.24, 0.07, 0.04), c, { at: [x, y0 + 0.08, z + 0.15], name: "lightbarLamp" }),
      1.8,
    );
    // rear lens too, readable from behind
    glow(
      b.part(box(0.24, 0.07, 0.04), c, { at: [x, y0 + 0.08, z - 0.15], name: "lightbarLampRear" }),
      1.4,
    );
    // top glow strip
    glow(b.part(box(0.2, 0.012, 0.1), c, { at: [x, y0 + 0.158, z], name: "lightbarTopGlow" }), 1.2);
    // divider fins
    if (i < 5)
      b.part(box(0.02, 0.09, 0.3), DARK, { at: [x + 0.144, y0 + 0.08, z], name: "lightbarFin" });
  }

  // end caps
  for (const s of [1, -1]) {
    b.part(box(0.06, 0.12, 0.32), STEEL, { at: [s * 0.92, y0 + 0.08, z], name: "lightbarEnd" });
    glow(b.part(box(0.02, 0.06, 0.2), s > 0 ? MAGENTA : CYAN, { at: [s * 0.955, y0 + 0.08, z], name: "lightbarEndGlow" }), 1.5);
  }
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addBumperBar(b: Builder) {
  const HOUSING = "#05060a";
  const CAP = "#3a3f4e";
  const BOLT = "#b9c2d0";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot });

  // Strip texture: magenta core with bright white centre line and segment ticks
  const tex = svg(
    `<svg viewBox="0 0 128 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="16" fill="#ff2bd6"/>
      <rect y="5" width="128" height="6" fill="#ff9cf0"/>
      <rect y="7" width="128" height="2" fill="#ffffff"/>
      ${Array.from({ length: 15 }, (_, i) => `<rect x="${8 + i * 8 - 0.5}" y="0" width="1.5" height="16" fill="#a0107f"/>`).join("")}
    </svg>`,
    { size: 256 },
  );

  const z = 3.2;
  const y = 0.82;

  // dark housing channel behind and around the strip
  put(box(1.9, 0.14, 0.1), HOUSING, [0, y, z - 0.03], "bumperHousing");
  put(box(1.9, 0.02, 0.12), CAP, [0, y + 0.075, z - 0.03], "bumperHousingTop");
  put(box(1.9, 0.02, 0.12), CAP, [0, y - 0.075, z - 0.03], "bumperHousingBottom");

  // glowing textured strip face
  const face = b.part(new THREE.PlaneGeometry(1.8, 0.1), "#ffffff", {
    at: [0, y, z + 0.025],
    dir: [0, 0, 1],
    axis: "z",
    texture: tex,
    name: "bumperStripFace",
  });
  glow(face, 1.6);

  // solid glowing core under the face for side visibility
  glow(put(box(1.8, 0.05, 0.03), "#ff2bd6", [0, y, z + 0.005], "bumperCore"), 1.4);

  // end caps with bolts and small glowing tips
  for (const s of [1, -1]) {
    put(box(0.12, 0.2, 0.16), CAP, [s * 0.98, y, z - 0.02], "bumperCap");
    put(box(0.04, 0.14, 0.12), HOUSING, [s * 1.05, y, z - 0.02], "bumperCapOuter");
    put(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), BOLT, [s * 0.98, y + 0.06, z + 0.07], "capBolt", [90, 0, 0]);
    put(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), BOLT, [s * 0.98, y - 0.06, z + 0.07], "capBolt", [90, 0, 0]);
    glow(put(box(0.03, 0.05, 0.1), "#ff2bd6", [s * 1.075, y, z - 0.02], "capGlow"), 1.5);
    // mounting brackets down to the bumper
    put(box(0.06, 0.2, 0.08), CAP, [s * 0.7, y - 0.14, z - 0.06], "bumperBracket");
    put(box(0.06, 0.2, 0.08), CAP, [s * 0.25, y - 0.14, z - 0.06], "bumperBracket");
  }

  // central emblem plate with glow dot
  put(box(0.22, 0.16, 0.04), HOUSING, [0, y + 0.0, z + 0.0], "bumperPlate");
  glow(put(box(0.08, 0.04, 0.02), "#19f0ff", [0, y, z + 0.03], "bumperPlateGlow"), 1.5);

  // spill glow strip on the bumper below
  glow(put(box(1.6, 0.015, 0.02), "#ff2bd6", [0, y - 0.1, z + 0.06], "bumperUnderGlow"), 0.8);
}
    return addBumperBar;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addGrille(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1: number, r2: number, h: number, s = 12) => new THREE.CylinderGeometry(r1, r2, h, s);
  const GUN = "#4a5160";
  const place = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot });

  // ---------- Grille ----------
  // frame around the grille opening (nose face is near z = 3.12)
  const gz = 3.2;
  place(box(1.5, 0.06, 0.1), STEEL, [0, 1.26, gz], "grilleFrameTop");
  place(box(1.5, 0.06, 0.1), STEEL, [0, 0.74, gz], "grilleFrameBot");
  for (const s of [1, -1]) {
    place(box(0.06, 0.58, 0.1), STEEL, [s * 0.72, 1.0, gz], "grilleFrameSide");
    // corner bolts
    for (const y of [1.2, 0.8])
      place(cyl(0.025, 0.025, 0.04, 6), HULL_DARK, [s * 0.72, y, gz + 0.06], "grilleBolt", [90, 0, 0]);
  }
  // horizontal slats with cyan glow lines between
  for (let i = 0; i < 5; i++) {
    const y = 0.82 + i * 0.09;
    place(box(1.36, 0.055, 0.08), i % 2 ? GUN : DARK, [0, y, gz - 0.01], "grilleSlat");
    glow(place(box(1.3, 0.012, 0.03), CYAN, [0, y + 0.047, gz + 0.03], "grilleGlow"), 1.6);
  }
  // vertical centre brace
  place(box(0.07, 0.5, 0.09), HULL_DARK, [0, 1.0, gz + 0.02], "grilleBrace");
  // corp badge
  glow(place(box(0.16, 0.16, 0.03), MAGENTA, [0, 1.0, gz + 0.075], "grilleBadge", [0, 0, 45]), 1.2);
  place(box(0.07, 0.07, 0.035), DARK, [0, 1.0, gz + 0.09], "grilleBadgeCore", [0, 0, 45]);
  // tow hooks
  for (const s of [1, -1])
    place(new THREE.TorusGeometry(0.06, 0.016, 5, 10), YELLOW, [s * 0.55, 0.55, 3.32], "towHook");

  // ---------- Cannon nozzle ----------
  const cy = 2.75;
  // collar rings along the barrel
  for (const z of [1.45, 1.62, 1.78]) {
    place(cyl(0.19, 0.19, 0.06, 12), STEEL, [0, cy, z], "nozzleCollar", [90, 0, 0]);
  }
  // flared nozzle end
  place(cyl(0.24, 0.2, 0.14, 12), HULL_DARK, [0, cy, 2.06], "nozzleFlare", [90, 0, 0]);
  place(cyl(0.2, 0.2, 0.04, 12), STEEL, [0, cy, 2.14], "nozzleLip", [90, 0, 0]);
  // glowing tip
  glow(place(cyl(0.13, 0.13, 0.03, 12), CYAN, [0, cy, 2.17], "nozzleTip", [90, 0, 0]), 2);
  // internal ring glow on barrel
  glow(place(new THREE.TorusGeometry(0.2, 0.014, 5, 14), CYAN, [0, cy, 1.9], "nozzleGlowRing"), 1.5);

  // hose clamps with bolts
  for (const z of [1.3, 1.95]) {
    place(new THREE.TorusGeometry(0.175, 0.025, 5, 12), STEEL, [0, cy, z], "hoseClamp");
    place(box(0.07, 0.05, 0.05), STEEL, [0, cy + 0.2, z], "clampLug");
  }

  // pressure gauge on top
  place(cyl(0.05, 0.05, 0.12, 6), STEEL, [0, cy + 0.19, 1.62], "gaugeStem");
  place(cyl(0.1, 0.1, 0.05, 14), STEEL, [0, cy + 0.27, 1.62], "gaugeBody", [90, 0, 0]);
  glow(place(cyl(0.08, 0.08, 0.02, 14), "#e9fdff", [0, cy + 0.27, 1.65], "gaugeFace", [90, 0, 0]), 1.2);
  place(box(0.012, 0.07, 0.01), MAGENTA, [0.015, cy + 0.285, 1.665], "gaugeNeedle", [0, 0, -35]);

  // side feed hoses from tank to barrel
  for (const s of [1, -1]) {
    place(cyl(0.035, 0.035, 0.6, 6), HULL_DARK, [s * 0.18, cy - 0.05, 0.75], "feedHose", [90, 0, 0]);
    place(cyl(0.05, 0.05, 0.06, 6), STEEL, [s * 0.18, cy - 0.05, 1.07], "feedCoupler", [90, 0, 0]);
  }
}
    return addGrille;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addSideLightBars(b: Builder) {
  const BOLT = "#4a505e";
  const geo = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  for (const s of [1, -1]) {
    const x = s * 1.07;
    // long rail housing along the flank, behind the bars
    b.part(geo(0.08, 0.14, 3.0), DARK, { at: [s * 1.1, 1.2, 0], name: "sideRail" });
    // top and bottom trim
    for (const y of [1.34, 1.06]) {
      b.part(geo(0.05, 0.03, 3.0), BOLT, { at: [s * 1.1, y, 0], name: "sideTrim" });
    }
    // vertical neon bars with dark housings, alternating colours
    const n = 7;
    for (let i = 0; i < n; i++) {
      const z = -1.38 + i * (2.76 / (n - 1));
      const col = i % 2 === 0 ? CYAN : MAGENTA;
      // housing
      b.part(geo(0.09, 0.4, 0.2), DARK, { at: [s * 1.11, 1.2, z], name: "barHousing" });
      // glowing tube
      glow(b.part(geo(0.05, 0.3, 0.08), col, { at: [s * 1.16, 1.2, z], name: "neonBar" }), 1.6);
      // end caps
      for (const dy of [0.17, -0.17]) {
        b.part(geo(0.1, 0.03, 0.22), STEEL, { at: [s * 1.11, 1.2 + dy, z], name: "barCap" });
      }
      // small bolts
      for (const dz of [-0.08, 0.08]) {
        b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6), STEEL, {
          at: [x + s * 0.02, 1.02, z + dz],
          dir: [s, 0, 0],
          name: "bolt",
        });
      }
    }
    // thin glow line under rail
    glow(b.part(geo(0.03, 0.02, 2.9), s > 0 ? CYAN : MAGENTA, { at: [s * 1.13, 0.98, 0], name: "railGlow" }), 1.3);
  }
}
    return addSideLightBars;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addRoofAntennas(b: Builder) {
  const BASE_Y = 2.325; // roof top surface
  const place = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, name, rotation: rot });

  // mounting plate with bolts
  place(new THREE.BoxGeometry(0.62, 0.04, 0.48), HULL_DARK, [0.5, BASE_Y + 0.02, -0.6], "antPlate");
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      place(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), STEEL, [0.5 + sx * 0.26, BASE_Y + 0.055, -0.6 + sz * 0.2], "antBolt");

  // three whip antennas, splayed, with bases and tips
  const whips = [
    { x: 0.32, z: -0.72, h: 0.75, tx: 6, tz: -5 },
    { x: 0.5, z: -0.8, h: 0.6, tx: 0, tz: -8 },
    { x: 0.68, z: -0.72, h: 0.7, tx: -6, tz: 5 },
  ];
  whips.forEach((w, i) => {
    const y0 = BASE_Y + 0.04;
    place(new THREE.CylinderGeometry(0.045, 0.06, 0.1, 8), DARK, [w.x, y0 + 0.05, w.z], "whipBase");
    place(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 8), STEEL, [w.x, y0 + 0.11, w.z], "whipRing");
    const mid = y0 + 0.1 + w.h / 2;
    place(new THREE.CylinderGeometry(0.006, 0.014, w.h, 5), STEEL, [w.x, mid, w.z], "whip", [w.tx, 0, w.tz]);
    const tipY = y0 + 0.1 + w.h * 0.98;
    const tipX = w.x - Math.sin((w.tz * Math.PI) / 180) * w.h * 0.5;
    const tipZ = w.z + Math.sin((w.tx * Math.PI) / 180) * w.h * 0.5;
    glow(place(new THREE.SphereGeometry(0.022, 6, 4), i === 1 ? MAGENTA : CYAN, [tipX, tipY, tipZ], "whipTip"), 1.6);
  });

  // dish: pedestal, yoke, bowl, feed arm
  const dx = 0.5, dz = -0.4;
  place(new THREE.CylinderGeometry(0.05, 0.07, 0.2, 8), HULL, [dx, BASE_Y + 0.14, dz], "dishPost");
  place(new THREE.BoxGeometry(0.16, 0.05, 0.08), HULL_DARK, [dx, BASE_Y + 0.26, dz], "dishYoke");
  const bowl = new THREE.SphereGeometry(0.17, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.2);
  place(bowl, STEEL, [dx, BASE_Y + 0.4, dz + 0.04], "dishBowl", [-100, 0, 0]);
  place(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 12), HULL_DARK, [dx, BASE_Y + 0.4, dz + 0.02], "dishBack", [-100, 0, 0]);
  place(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 5), STEEL, [dx, BASE_Y + 0.46, dz + 0.17], "dishFeed", [-100, 0, 0]);
  glow(place(new THREE.SphereGeometry(0.02, 6, 4), CYAN, [dx, BASE_Y + 0.49, dz + 0.27], "dishLamp"), 1.4);

  // blinking beacon with cage
  const bx = 0.82, bz = -0.35;
  place(new THREE.CylinderGeometry(0.06, 0.07, 0.05, 8), HULL_DARK, [bx, BASE_Y + 0.065, bz], "beaconBase");
  glow(place(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8), MAGENTA, [bx, BASE_Y + 0.14, bz], "beaconLens"), 2);
  place(new THREE.SphereGeometry(0.045, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#ff7ae8", [bx, BASE_Y + 0.19, bz], "beaconCap");
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + 0.4;
    place(new THREE.CylinderGeometry(0.004, 0.004, 0.13, 4), STEEL, [bx + Math.cos(a) * 0.05, BASE_Y + 0.14, bz + Math.sin(a) * 0.05], "beaconBar");
  }

  // small label plate on the plate edge
  const tag = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" rx="3" fill="#0a0b0f"/><rect x="2" y="2" width="60" height="20" rx="2" fill="none" stroke="#19f0ff" stroke-width="1.5"/><text x="32" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#19f0ff">COMMS</text></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.075), "#ffffff", {
      at: [0.5, BASE_Y + 0.05, -0.36],
      dir: [0, 0.55, 0.85],
      axis: "z",
      texture: tag,
      name: "commsTag",
    }),
    1,
  );

  // cable runs from antennas to the roof
  place(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 5), DARK, [0.66, BASE_Y + 0.03, -0.5], "cable", [0, 0, 90]);
}
    return addRoofAntennas;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addWheelRims(b: Builder) {
  const NEON = "#19f0ff";
  const BOLT = "#c9d2e0";
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#0a0b0f" stroke="#ff2bd6" stroke-width="4"/><path d="M32 12 L50 22 L50 42 L32 52 L14 42 L14 22Z" fill="none" stroke="#19f0ff" stroke-width="4"/><path d="M40 26 Q24 22 24 32 Q24 42 40 38" fill="none" stroke="#ff2bd6" stroke-width="5"/></svg>`,
    { size: 128 },
  );
  const MESH = svg(
    `<svg viewBox="0 0 64 64"><path d="M0 0H64M0 16H64M0 32H64M0 48H64M0 63H64M0 0V64M16 0V64M32 0V64M48 0V64M63 0V64" stroke="#8a93a3" stroke-width="3" fill="none"/></svg>`,
    { size: 128 },
  );

  // wheel rims
  for (const s of [1, -1])
    for (const z of [1.9, -1.9]) {
      const x = s * 1.0;
      const out = s * 0.235;
      // neon ring
      b.part(new THREE.TorusGeometry(0.4, 0.035, 6, 20), NEON, {
        at: [x + out, 0.5, z],
        dir: [s, 0, 0],
        axis: "z",
        name: "rimNeon",
      });
      // inner dark disc and steel cap
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.02, 14), "#0a0b0f", {
        at: [x + out, 0.5, z],
        dir: [s, 0, 0],
        name: "rimDisc",
      });
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), BOLT, {
        at: [x + s * 0.26, 0.5, z],
        dir: [s, 0, 0],
        name: "hubCap",
      });
      // bolts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), BOLT, {
          at: [x + s * 0.255, 0.5 + Math.sin(a) * 0.19, z + Math.cos(a) * 0.19],
          dir: [s, 0, 0],
          name: "bolt",
        });
      }
      // spokes of glow
      for (let i = 0; i < 3; i++) {
        b.part(new THREE.BoxGeometry(0.02, 0.62, 0.04), NEON, {
          at: [x + s * 0.245, 0.5, z],
          rotation: [(i * 60), 0, 0],
          name: "spoke",
        });
      }
    }

  // windscreen guard
  b.part(new THREE.PlaneGeometry(1.6, 0.55), "#ffffff", {
    at: [0, 1.8, 0.72],
    dir: [0, 0.31, 0.95],
    axis: "z",
    texture: MESH,
    name: "meshGuard",
  });
  for (const x of [-0.82, 0.82])
    b.part(new THREE.BoxGeometry(0.05, 0.6, 0.06), STEEL, {
      at: [x, 1.8, 0.7],
      rotation: [-18, 0, 0],
      name: "guardPost",
    });
  b.part(new THREE.BoxGeometry(1.7, 0.05, 0.07), STEEL, { at: [0, 2.08, 0.66], name: "guardTop" });
  b.part(new THREE.BoxGeometry(1.7, 0.05, 0.07), STEEL, { at: [0, 1.52, 0.77], name: "guardBottom" });

  // door emblems
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
      at: [s * 0.965, 1.3, -0.4],
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
      name: "corpEmblem",
    });
}
    return addWheelRims;
  })(),
);
