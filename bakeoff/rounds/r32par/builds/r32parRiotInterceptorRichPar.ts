import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, smoothstep, mix, rng, frame, bezier, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, metal, gaugeTexture } from "../../../../kits/clockwork";

export const meta = {
  "name": "Arasaka-style Riot Interceptor RC-9 'Pacifier'",
  "description": "A heavy corporate riot-control interceptor truck in Cyberpunk 2077 style: angular armored hull, roof-mounted water cannon, neon light bars, grilles, decals and glowing hologram signage."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2c313b",
  hullLight: "#4a5262",
  hullDark: "#14171d",
  armor: "#1d2128",
  corpWhite: "#e8ecf2",
  corpRed: "#d1202f",
  hazard: "#f2c514",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonAmber: "#ff9a1f",
  glass: "#0a1a26",
  tire: "#0d0d10",
  rim: "#7b8494",
  steel: "#8a93a3",
  tankBlue: "#2b6fa8",
  ink: "#07080b",
};
const M = {
  bodyCenter: [0, 1.1, 0] as [number, number, number],
  frontAxle: [0, 0.52, 1.8] as [number, number, number],
  rearAxle: [0, 0.52, -1.7] as [number, number, number],
  cabFloor: [0, 1.35, 0.5] as [number, number, number],
  roofTop: [0, 2, 0.4] as [number, number, number],
  rearDeck: [0, 1.45, -1.9] as [number, number, number],
  turretRing: [0, 1.5, -1.5] as [number, number, number],
  cannonPivot: [0, 2.05, -1.5] as [number, number, number],
  bumperFront: [0, 0.75, 2.95] as [number, number, number],
  tankMount: [0, 1.45, -2.45] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // hull
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildHull({ b, J, P, M }: Ctx) {
  const body = J.body;
  const HULL = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const t = noise(p, 0.3, 4);
      const base = mix(P.hull, P.hullLight, 0.25 * t + 0.25 * Math.max(n.y, 0));
      const lower = smoothstep(0.7, 0.4, p.y);
      return mix(base, P.hullDark, lower * 0.6);
    }),
    { size: 0.5, aspect: 0.6, rivets: 0.07, seam: P.ink },
  );
  const ARMOR = panelled(P.armor, { size: 0.35, rivets: 0.06, seam: P.ink });

  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...extra });

  // Main hull as a loft (wedge nose)
  b.loft(
    [
      { at: [0, 0.95, -2.95], w: 2.3, h: 0.9 },
      { at: [0, 0.95, -1.5], w: 2.4, h: 0.9 },
      { at: [0, 0.95, 0.8], w: 2.4, h: 0.9 },
      { at: [0, 0.9, 1.9], w: 2.3, h: 0.8 },
      { at: [0, 0.82, 2.55], w: 2.0, h: 0.5 },
    ],
    { bone: body, color: HULL, section: "box", caps: "flat" },
  );
  // sloped hood plate
  box(2.0, 0.08, 0.9, HULL, [0, 1.2, 2.1], { rotation: [14, 0, 0] });
  // rear deck plate
  box(2.3, 0.1, 1.6, ARMOR, [0, 1.43, -2.15]);
  box(2.4, 0.1, 3.0, HULL, [0, 1.43, -0.3]);
  // skid plate
  box(1.9, 0.08, 4.6, P.hullDark, [0, 0.33, -0.1]);
  box(1.9, 0.08, 0.5, P.hullDark, [0, 0.38, 2.4], { rotation: [-20, 0, 0] });

  // wheel arches and fender flares
  const axles: [number, number][] = [
    [1.8, 1],
    [-1.7, 1],
  ];
  for (const [z] of axles)
    for (const s of [1, -1]) {
      // flare as half torus-ish: three boxes around the wheel
      const x = s * 1.12;
      box(0.5, 0.12, 1.3, ARMOR, [x, 1.1, z]);
      box(0.5, 0.45, 0.12, ARMOR, [x, 0.9, z + 0.72], { rotation: [-25, 0, 0] });
      box(0.5, 0.45, 0.12, ARMOR, [x, 0.9, z - 0.72], { rotation: [25, 0, 0] });
      box(0.06, 0.1, 1.45, P.hazard, [s * 1.37, 1.14, z]);
    }

  // sills with magenta neon
  const NEON = svg(`<svg viewBox="0 0 8 8"><rect width="8" height="8" fill="#ff2bd6"/></svg>`, { size: 8 });
  for (const s of [1, -1]) {
    box(0.22, 0.2, 2.1, P.armor, [s * 1.22, 0.62, 0], {});
    glow(b.part(new THREE.BoxGeometry(0.04, 0.05, 1.9), P.neonMagenta, { bone: body, at: [s * 1.34, 0.62, 0] }), 1.6);
    glow(b.part(new THREE.BoxGeometry(0.04, 0.03, 1.2), P.neonCyan, { bone: body, at: [s * 1.3, 0.78, 0.2] }), 1.4);
  }

  // doors with stripes, handles, hazard chevrons
  const CHEV = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#f2c514"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 6} 0 L${i * 10 + 4} 0 L${i * 10 + 14} 32 L${i * 10 + 4} 32Z" fill="#07080b"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const STRIPE = svg(
    `<svg viewBox="0 0 128 40"><rect y="4" width="128" height="14" fill="#e8ecf2"/><rect y="22" width="128" height="9" fill="#d1202f"/><text x="6" y="16" font-size="11" font-family="sans-serif" font-weight="bold" fill="#14171d">警備 RC-9</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    const x = s * 1.205;
    box(0.04, 0.8, 1.2, P.hullLight, [x, 1.0, 0.55]);
    box(0.06, 0.04, 1.24, P.ink, [x, 1.4, 0.55]);
    box(0.06, 0.8, 0.03, P.ink, [x, 1.0, -0.06]);
    box(0.06, 0.8, 0.03, P.ink, [x, 1.0, 1.16]);
    b.part(new THREE.PlaneGeometry(1.1, 0.34), "#ffffff", {
      bone: body,
      at: [s * 1.232, 0.92, 0.55],
      dir: [s, 0, 0],
      axis: "z",
      texture: STRIPE,
    });
    b.part(new THREE.PlaneGeometry(0.6, 0.2), "#ffffff", {
      bone: body,
      at: [s * 1.232, 0.62, 0.55],
      dir: [s, 0, 0],
      axis: "z",
      texture: CHEV,
    });
    box(0.06, 0.05, 0.22, P.steel, [s * 1.25, 1.18, 0.95]);
    // side vents
    for (let i = 0; i < 4; i++) box(0.04, 0.05, 0.5, P.ink, [s * 1.22, 0.95 + i * 0.09, -1.15]);
    // side hazard on rear panel
    b.part(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", {
      bone: body,
      at: [s * 1.232, 1.1, -2.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: CHEV,
    });
  }

  // rear bumper and tail lights
  box(2.4, 0.3, 0.25, P.armor, [0, 0.7, -3.0]);
  box(2.2, 0.08, 0.3, P.hazard, [0, 0.9, -3.02]);
  box(2.0, 0.25, 0.05, P.hullDark, [0, 1.1, -3.02]);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.8, 0.08, 0.04), P.corpRed, { bone: body, at: [s * 0.65, 1.1, -3.06] }), 2);
    glow(b.part(new THREE.BoxGeometry(0.3, 0.06, 0.04), P.neonAmber, { bone: body, at: [s * 0.95, 0.7, -3.14] }), 1.5);
    // exhaust stacks
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.9, 8), P.steel, { bone: body, at: [s * 1.0, 1.0, -2.98] });
    b.part(new THREE.CylinderGeometry(0.05, 0.07, 0.05, 8), P.ink, { bone: body, at: [s * 1.0, 1.47, -2.98] });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 8), P.hazard, { bone: body, at: [s * 1.0, 0.9, -2.98] });
    // tow hooks rear
    box(0.12, 0.1, 0.18, P.steel, [s * 0.5, 0.55, -3.12]);
  }

  // front grille-side details (nose face under frontEnd): armour lip
  box(1.9, 0.12, 0.12, P.armor, [0, 0.62, 2.55]);
  // corp emblem on hood
  const LOGO = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#d1202f" stroke-width="5"/><path d="M32 10 L48 52 L40 52 L32 30 L24 52 L16 52Z" fill="#e8ecf2"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
    bone: body,
    at: [0, 1.255, 1.95],
    dir: [0, 1, 0.25],
    axis: "z",
    texture: LOGO,
  });

  // underbody details and rivet bolts on deck
  const r = rng(5);
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 24; i++) {
    const g = new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6);
    g.translate(-1.0 + (i % 6) * 0.4 + r() * 0.02, 1.5, -2.8 + Math.floor(i / 6) * 0.35);
    bolts.push(g);
  }
  for (const g of bolts) b.part(g, P.steel, { bone: body, at: [0, 0, 0] });
  // fuel cap
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), P.steel, {
    bone: body,
    at: [-1.23, 1.2, -0.8],
    dir: [-1, 0, 0],
  });
}
    return buildHull;
  })(),
  // cab
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildCab({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const ARMOR_PAINT = panelled(
    paint((p, n) => {
      const t = noise(p, 0.18, 4);
      return mix(P.hull, P.hullLight, 0.25 * t + 0.35 * smoothstep(0.4, 1, n.y));
    }),
    { size: 0.35, aspect: 0.6, rivets: 0.08, seam: P.ink },
  );
  const DARK_PAINT = panelled(P.armor, { size: 0.3, rivets: 0.1, seam: P.ink });
  const part = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const lit = (w: number, h: number, d: number, color: string, at: number[], s = 1.6, o: any = {}) =>
    glow(box(w, h, d, color, at, o), s);

  // Cab shell: z from -0.6 to 1.9, y 1.35..2.2
  // lower cab body (tapered with rake): frustum
  b.frustumBox([0, 1.35, 0.55], [0, 1.95, 0.45], [2.2, 1.2], [2.2, 1.0], { bone, color: ARMOR_PAINT });
  // back wall
  box(2.2, 0.8, 0.12, DARK_PAINT, [0, 1.75, -0.55]);
  // raked windshield (dark glass)
  const wsRot = [-38, 0, 0];
  box(1.9, 0.62, 0.05, P.glass, [0, 1.75, 1.72], { rotation: wsRot });
  // windshield frame
  box(2.0, 0.07, 0.1, P.hullDark, [0, 2.07, 1.58], { rotation: wsRot });
  box(2.0, 0.07, 0.1, P.hullDark, [0, 1.46, 1.88], { rotation: wsRot });
  // A-pillars
  for (const s of [1, -1]) {
    box(0.09, 0.78, 0.1, P.armor, [s * 1.0, 1.77, 1.73], { rotation: [-38, 0, s * 4] });
    // side windows
    box(0.04, 0.45, 1.0, P.glass, [s * 1.11, 1.82, 0.9]);
    box(0.04, 0.4, 0.7, P.glass, [s * 1.11, 1.82, -0.1]);
    box(0.07, 0.5, 0.09, P.armor, [s * 1.1, 1.82, 0.38]);
    // window frames
    box(0.06, 0.04, 1.1, P.hullDark, [s * 1.11, 2.07, 0.8]);
    box(0.06, 0.04, 1.1, P.hullDark, [s * 1.11, 1.58, 0.8]);
    // door panel + handle + stripe
    box(0.04, 0.2, 0.9, P.corpWhite, [s * 1.12, 1.45, 0.8]);
    box(0.045, 0.06, 0.9, P.corpRed, [s * 1.125, 1.45, 0.8]);
    box(0.07, 0.05, 0.22, P.steel, [s * 1.14, 1.64, 0.25]);
    // mirrors
    box(0.05, 0.06, 0.16, P.armor, [s * 1.2, 1.9, 1.5]);
    box(0.06, 0.2, 0.14, P.hullDark, [s * 1.3, 1.95, 1.5]);
    lit(0.02, 0.15, 0.1, P.neonAmber, [s * 1.335, 1.95, 1.5], 1.3);
    b.rod([s * 1.15, 1.9, 1.5], [s * 1.28, 1.92, 1.5], 0.015, P.steel, { bone });
  }
  // cab pillar lights in glass via HUD decals
  const HUD = svg(
    `<svg viewBox="0 0 100 60"><g fill="none" stroke="#2ff3ff" stroke-width="2.5" opacity="0.8">
    <path d="M5 50 L30 20 L50 35 L75 10 L95 22"/><circle cx="75" cy="10" r="4"/><rect x="10" y="8" width="26" height="10"/>
    <path d="M60 52 h30 M60 44 h18"/></g>
    <text x="12" y="16" font-size="8" fill="#2ff3ff" font-family="monospace">TARGET 07</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(1.1, 0.4), "#ffffff", {
    bone, at: [0.3, 1.78, 1.76], rotation: [-38, 0, 0], axis: "z", texture: HUD, dir: [0, 0.62, 0.79],
  });
  b.part(new THREE.PlaneGeometry(0.8, 0.3), "#ffffff", {
    bone, at: [1.14, 1.84, 0.9], dir: [1, 0, 0], axis: "z", texture: HUD,
  });
  b.part(new THREE.PlaneGeometry(0.8, 0.3), "#ffffff", {
    bone, at: [-1.14, 1.84, 0.9], dir: [-1, 0, 0], axis: "z", texture: HUD,
  });

  // visor slats above windshield
  for (let i = 0; i < 5; i++) {
    box(2.0, 0.025, 0.14, i % 2 ? P.hullDark : P.armor, [0, 2.12 + i * 0.012, 1.5 - i * 0.04 + 0.06], { rotation: [-18, 0, 0] });
  }
  box(2.1, 0.05, 0.3, P.armor, [0, 2.14, 1.42]);

  // Roof: thick armor with ribs
  box(2.3, 0.1, 2.3, ARMOR_PAINT, [0, 2.13, 0.52]);
  for (let i = 0; i < 6; i++) {
    box(2.1, 0.05, 0.07, P.hullLight, [0, 2.2, -0.45 + i * 0.3]);
  }
  for (const s of [1, -1]) {
    box(0.08, 0.06, 2.3, P.hullDark, [s * 1.1, 2.19, 0.52]);
    box(0.07, 0.08, 0.5, P.hazard, [s * 1.12, 2.08, 1.7]);
  }
  // corp logo on roof
  const LOGO = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#d1202f" stroke-width="8"/>
    <path d="M50 18 L78 78 L64 78 L50 46 L36 78 L22 78Z" fill="#e8ecf2"/><rect x="30" y="62" width="40" height="7" fill="#d1202f"/>
    <text x="50" y="96" font-size="9" text-anchor="middle" fill="#e8ecf2" font-family="sans-serif" font-weight="bold">荒坂 RC-9</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
    bone, at: [0, 2.19, 0.9], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: LOGO,
  });
  // door logo
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      bone, at: [s * 1.135, 1.7, 0.25], dir: [s, 0, 0], axis: "z", texture: LOGO,
    });

  // Roof light bar (alternating segments)
  const barCols = [P.neonCyan, P.neonMagenta, P.neonAmber, P.neonMagenta, P.neonCyan, P.neonAmber, P.neonCyan, P.neonMagenta];
  box(2.1, 0.08, 0.28, P.hullDark, [0, 2.26, 1.15]);
  box(0.08, 0.12, 0.2, P.armor, [0.8, 2.22, 1.15]);
  box(0.08, 0.12, 0.2, P.armor, [-0.8, 2.22, 1.15]);
  barCols.forEach((c, i) => {
    lit(0.24, 0.12, 0.22, c, [-0.91 + i * 0.26, 2.34, 1.15], 2);
  });
  box(2.1, 0.03, 0.3, P.armor, [0, 2.41, 1.15]);
  // hazard end caps
  for (const s of [1, -1]) box(0.06, 0.14, 0.3, P.hazard, [s * 1.07, 2.34, 1.15]);

  // Antennas
  for (const [x, z, h] of [[-0.95, -0.4, 0.55], [0.95, -0.4, 0.4], [0.7, 0.0, 0.3]] as number[][]) {
    b.rod([x, 2.2, z], [x * 0.98, 2.2 + h, z], 0.012, P.steel, { bone });
    lit(0.04, 0.04, 0.04, P.corpRed, [x * 0.98, 2.2 + h + 0.02, z], 2);
    part(new THREE.CylinderGeometry(0.04, 0.05, 0.05, 8), P.armor, [x, 2.22, z]);
  }
  // sensor pods
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 8), P.hullDark, [s * 0.55, 2.27, 0.1]);
    part(new THREE.SphereGeometry(0.09, 8, 5, 0, 6.3, 0, 1.6), P.glass, [s * 0.55, 2.34, 0.1]);
    lit(0.05, 0.05, 0.05, P.neonCyan, [s * 0.55, 2.35, 0.1], 2);
  }
  // roof cameras with red lens
  for (const s of [1, -1]) {
    box(0.16, 0.14, 0.2, P.armor, [s * 0.9, 2.3, 0.62]);
    part(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 8), P.ink, [s * 0.9, 2.3, 0.76], { dir: [0, 0, 1] });
    glow(part(new THREE.CircleGeometry(0.035, 8), P.corpRed, [s * 0.9, 2.3, 0.815], { dir: [0, 0, 1], axis: "z" }), 2.5);
  }
  // spotlight on A-pillar roof corner
  for (const s of [1, -1]) {
    box(0.14, 0.1, 0.14, P.armor, [s * 0.5, 2.25, 1.68]);
    lit(0.12, 0.07, 0.03, "#ffffff", [s * 0.5, 2.25, 1.76], 1.8);
  }

  // Interior hints
  box(1.7, 0.1, 0.35, P.hullDark, [0, 1.52, 1.5]); // dash
  const SCREEN = svg(
    `<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#06222c"/><path d="M4 30 L20 14 L34 24 L50 8 L76 20" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    <rect x="52" y="26" width="22" height="8" fill="#ff2bd6"/><text x="6" y="10" font-size="7" fill="#2ff3ff" font-family="monospace">SYS OK</text></svg>`,
    { size: 192 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
      bone, at: [0.0, 1.62, 1.68], dir: [0, 0.4, -1], axis: "z", texture: SCREEN,
    }),
    1.3,
  );
  for (const s of [1, -1]) {
    box(0.5, 0.1, 0.5, P.hullDark, [s * 0.5, 1.5, 0.7]); // seat base
    box(0.5, 0.55, 0.1, P.armor, [s * 0.5, 1.8, 0.4], { rotation: [-8, 0, 0] }); // seat back
    box(0.3, 0.12, 0.08, P.hullLight, [s * 0.5, 2.1, 0.38]); // headrest
  }
  box(0.4, 0.5, 0.1, P.armor, [0, 1.8, -0.35]);
  lit(0.5, 0.025, 0.02, P.neonMagenta, [0, 1.52, 1.38], 1.5);
  box(0.4, 0.06, 0.4, P.steel, [0.0, 1.52, 0.7], { rotation: [0, 0, 0] }); // console

  // neon trim on roof edge and rear
  lit(2.2, 0.03, 0.03, P.neonMagenta, [0, 2.07, 1.71], 1.6, { rotation: [-38, 0, 0] });
  lit(2.1, 0.03, 0.02, P.neonCyan, [0, 2.05, -0.62], 1.5);
  for (const s of [1, -1]) lit(0.02, 0.03, 2.2, P.neonCyan, [s * 1.16, 2.1, 0.52], 1.4);
  // rear wall rivet plates & hazard
  for (let i = 0; i < 5; i++) box(0.3, 0.08, 0.04, i % 2 ? P.hazard : P.ink, [-0.6 + i * 0.3, 1.45, -0.62], { rotation: [0, 0, 20] });
  // rear cab hatch-like turret clearance guard
  box(1.2, 0.1, 0.16, P.hullLight, [0, 2.0, -0.62]);
  for (const s of [1, -1]) box(0.06, 0.5, 0.1, P.hullDark, [s * 0.6, 1.8, -0.6]);
  void R; void frame;
}
    return buildCab;
  })(),
  // frontEnd
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildFrontEnd({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, ...opts });

  // paints
  const armorPaint = paint((p, n) => {
    const base: [number, number, number] = [0.17, 0.19, 0.23];
    const lit = smoothstep(-0.5, 0.9, n.y);
    const m = noise(p, 0.08, 3);
    const c = mix(base, [0.3, 0.33, 0.4], lit * 0.6 + m * 0.25);
    // rivets rows
    const rx = Math.abs(((p.x * 1000) % 90) - 45) < 6 && Math.abs(((p.y * 1000) % 90) - 45) < 6;
    return rx ? [0.5, 0.54, 0.6] : c;
  });
  const hazardPaint = paint((p) => {
    const k = Math.floor((p.x + p.y) / 0.07);
    return k % 2 === 0 ? "#f2c514" : "#14171d";
  });
  const grillePaint = paint((p) => (Math.floor(p.y / 0.025) % 2 === 0 ? "#07080b" : "#1d2128"));

  // textures
  const logo = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#07080b" stroke="#d1202f" stroke-width="4"/>
    <path d="M32 10 L50 50 L42 50 L32 28 L22 50 L14 50Z" fill="#d1202f"/><rect x="26" y="40" width="12" height="4" fill="#e8ecf2"/></svg>`,
    { size: 128 },
  );
  const plate = svg(
    `<svg viewBox="0 0 120 60"><rect x="2" y="2" width="116" height="56" rx="6" fill="#e8ecf2" stroke="#07080b" stroke-width="4"/>
    <rect x="6" y="6" width="108" height="12" fill="#d1202f"/>
    <text x="60" y="15" font-size="9" fill="#fff" text-anchor="middle" font-family="sans-serif" font-weight="bold">RC-9 ARASAKA</text>
    <text x="60" y="46" font-size="24" fill="#07080b" text-anchor="middle" font-family="monospace" font-weight="bold">NC-4471</text></svg>`,
    { size: 128 },
  );
  const slit = svg(
    `<svg viewBox="0 0 64 16"><rect x="0" y="4" width="64" height="8" fill="#2ff3ff"/><rect x="0" y="6" width="64" height="2" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
  const headTex = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#cffcff"/><rect x="2" y="10" width="60" height="4" fill="#ffffff"/><rect x="0" y="0" width="64" height="3" fill="#2ff3ff"/></svg>`,
    { size: 64 },
  );

  // hood / nose cap wedge (sloped)
  const hood = b.loft(
    [
      { at: [0, 1.38, 2.0], w: 2.3, h: 0.2 },
      { at: [0, 1.22, 2.4], w: 2.35, h: 0.3 },
      { at: [0, 1.0, 2.75], w: 2.3, h: 0.5 },
    ],
    { bone: body, color: armorPaint, section: "box" },
  );
  box(2.1, 0.06, 0.5, P.hullLight, [0, 1.34, 2.3], { rotation: [-14, 0, 0] });
  // hood vents
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++)
      box(0.4, 0.02, 0.04, P.ink, [s * 0.5, 1.37 - i * 0.015, 2.1 + i * 0.12], { rotation: [-14, 0, 0] });
  }
  // center ridge
  box(0.12, 0.05, 0.7, P.hazard, [0, 1.38, 2.3], { rotation: [-14, 0, 0] });

  // grille block
  box(1.5, 0.5, 0.1, grillePaint, [0, 0.98, 2.78]);
  box(1.6, 0.06, 0.12, P.hullDark, [0, 1.25, 2.78]);
  box(1.6, 0.06, 0.12, P.hullDark, [0, 0.72, 2.78]);
  for (const s of [1, -1]) box(0.06, 0.58, 0.12, P.hullDark, [s * 0.78, 0.98, 2.78]);
  for (let i = 0; i < 3; i++)
    glow(
      b.part(new THREE.PlaneGeometry(1.3, 0.06), "#ffffff", {
        bone: body, at: [0, 1.08 - i * 0.14, 2.835], dir: [0, 0, 1], axis: "z", texture: slit,
      }),
      1.6,
    );
  // emblem
  b.part(new THREE.CircleGeometry(0.13, 16), "#ffffff", {
    bone: body, at: [0, 1.3, 2.84], dir: [0, 0, 1], axis: "z", texture: logo,
  });
  // cyan frame glow tubes
  glow(box(1.7, 0.02, 0.02, P.neonCyan, [0, 1.285, 2.85]), 1.5);

  // headlight clusters
  for (const s of [1, -1]) {
    box(0.5, 0.26, 0.14, P.hullDark, [s * 0.95, 1.12, 2.7]);
    glow(
      b.part(new THREE.PlaneGeometry(0.42, 0.16), "#ffffff", {
        bone: body, at: [s * 0.95, 1.14, 2.775], dir: [0, 0, 1], axis: "z", texture: headTex,
      }),
      1.8,
    );
    // fog lights
    cyl(0.07, 0.07, 0.08, 10, P.hullDark, [s * 0.95, 0.72, 2.8], { rotation: [90, 0, 0] });
    glow(cyl(0.05, 0.05, 0.03, 10, P.neonAmber, [s * 0.95, 0.72, 2.85], { rotation: [90, 0, 0] }), 1.6);
    // side guards
    box(0.1, 0.5, 0.4, armorPaint, [s * 1.18, 1.0, 2.5]);
    // flip-up spotlights on hood
    cyl(0.06, 0.06, 0.12, 8, P.hullDark, [s * 0.8, 1.45, 2.05], { rotation: [70, 0, 0] });
    glow(cyl(0.045, 0.045, 0.02, 8, "#ffffff", [s * 0.8, 1.48, 2.1], { rotation: [70, 0, 0] }), 1.6);
    box(0.1, 0.04, 0.1, P.steel, [s * 0.8, 1.4, 2.0]);
  }

  // bull-bar bumper
  const bz = M.bumperFront[2];
  box(2.4, 0.26, 0.28, hazardPaint, [0, 0.58, bz - 0.08]);
  box(2.4, 0.12, 0.3, armorPaint, [0, 0.4 + 0.12, bz - 0.08]);
  box(2.0, 0.05, 0.05, P.neonCyan, [0, 0.62, bz + 0.07]);
  glow(box(2.0, 0.05, 0.03, P.neonCyan, [0, 0.62, bz + 0.07]), 2);
  // bull bars
  for (const s of [-0.9, -0.45, 0, 0.45, 0.9])
    b.rod([s, 0.62, bz - 0.02], [s, 1.12, bz - 0.2], 0.04, P.armor, { bone: body, sides: 8 });
  b.rod([-0.95, 1.12, bz - 0.2], [0.95, 1.12, bz - 0.2], 0.05, P.steel, { bone: body, sides: 8 });
  // push-plate ram
  box(1.1, 0.5, 0.1, P.hullLight, [0, 0.88, bz + 0.0], { });
  box(1.1, 0.12, 0.12, hazardPaint, [0, 1.12, bz + 0.0]);
  for (let i = 0; i < 4; i++)
    for (const sy of [0.74, 1.0])
      b.part(new THREE.SphereGeometry(0.025, 6, 4), P.steel, { bone: body, at: [-0.45 + i * 0.3, sy, bz + 0.055] });
  // license plate
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
    bone: body, at: [0, 0.8, bz + 0.065], dir: [0, 0, 1], axis: "z", texture: plate,
  });
  // tow hooks
  for (const s of [1, -1]) {
    box(0.1, 0.1, 0.1, P.hazard, [s * 0.75, 0.5, bz - 0.2]);
    b.sweep(
      [[s * 0.75, 0.5, bz - 0.15], [s * 0.75, 0.42, bz + 0.1], [s * 0.75, 0.55, bz + 0.2], [s * 0.75, 0.6, bz + 0.1]],
      0.022, { bone: body, color: P.steel, sides: 6 },
    );
  }
  // bumper end caps with amber lights
  for (const s of [1, -1]) {
    box(0.18, 0.3, 0.3, P.armor, [s * 1.17, 0.58, bz - 0.1]);
    glow(box(0.12, 0.08, 0.04, P.neonAmber, [s * 1.17, 0.6, bz + 0.06]), 1.6);
  }
  // under-nose skid
  box(2.2, 0.08, 0.6, P.hullDark, [0, 0.45, 2.55]);
  // random bolt studs on hood edge
  for (let i = 0; i < 10; i++)
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.steel, {
      bone: body, at: [-1.05 + i * 0.233, 1.43, 1.95 + R() * 0.02],
    });
}
    return buildFrontEnd;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.54;
  const wheels: [string, number, number][] = [
    ["FL", 1, M.frontAxle[2]],
    ["FR", -1, M.frontAxle[2]],
    ["RL", 1, M.rearAxle[2]],
    ["RR", -1, M.rearAxle[2]],
  ];

  // Tire paint: chevron tread grooves on the lathe's own coordinates, road dust near the floor.
  const tirePaint = paint((p, _n, s) => {
    const groove = ((((s[1] + Math.abs(s[0]) * 140) % 30) + 30) % 30) < 4.5 && Math.abs(s[0]) < 0.17;
    let c = mix(P.tire, "#1a1a20", groove ? 1 : 0);
    if (p.y < 0.18) c = mix(c, "#4a4034", 0.35 * (1 - p.y / 0.18));
    return c;
  });
  const rimPaint = paint((_p, n) => mix(P.rim, P.steel, Math.max(0, n.y) * 0.8));

  const tireProfile: [number, number][] = [
    [0.3, -0.2],
    [0.47, -0.21],
    [R, -0.13],
    [R, 0.13],
    [0.47, 0.21],
    [0.3, 0.2],
  ];
  const barrel: [number, number][] = [
    [0.29, -0.2],
    [0.355, -0.2],
    [0.37, -0.17],
    [0.37, 0.19],
    [0.29, 0.19],
  ];

  const boltGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6);
  const treadStud = new THREE.BoxGeometry(0.03, 0.03, 0.03);

  for (const [name, s, z] of wheels) {
    const bone = J["wheel" + name];
    const cy = M.frontAxle[1];
    const cx = s * 1.1;
    const at = (d: number, y = 0, zz = 0): [number, number, number] => [cx + s * d, cy + y, z + zz];
    const ax: [number, number, number] = [s, 0, 0];

    // tire and rim
    b.lathe(tireProfile, { at: at(0), axis: ax, segments: 12, bone, color: tirePaint, group: "wheels" });
    b.lathe(barrel, { at: at(0), axis: ax, segments: 12, bone, color: rimPaint, group: "wheels" });
    // dish plate inside
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12), P.hullDark, { bone, at: at(0.05), dir: ax });
    // glowing magenta ring accent inside the rim
    glow(
      b.part(new THREE.TorusGeometry(0.27, 0.017, 5, 20), P.neonMagenta, {
        bone,
        at: at(0.1),
        rotation: [0, 90, 0],
      }),
      1.6,
    );
    // spokes
    const spokes = 5;
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      const r = 0.17;
      b.part(new THREE.BoxGeometry(0.045, 0.2, 0.07), P.steel, {
        bone,
        at: at(0.15, Math.cos(a) * r, Math.sin(a) * r),
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    // hub cap, bolt ring, centre nut
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.07, 8), P.rim, { bone, at: at(0.17), dir: ax });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 6), P.corpRed, { bone, at: at(0.215), dir: ax });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(boltGeo, P.steel, { bone, at: at(0.2, Math.cos(a) * 0.075, Math.sin(a) * 0.075), dir: ax });
    }
    // outer rim bolts and hazard tread studs
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.part(treadStud, P.hazard, {
        bone,
        at: at(s * 0 + 0.205, Math.cos(a) * 0.335, Math.sin(a) * 0.335),
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    // brake disc spins with the wheel
    b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 12), P.steel, { bone, at: at(-0.1), dir: ax });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), P.hullDark, { bone, at: at(-0.1), dir: ax });

    // static parts on the body: caliper, axle stub, suspension
    b.part(new THREE.BoxGeometry(0.09, 0.14, 0.12), P.corpRed, {
      bone: J.body,
      at: at(-0.1, 0.22, 0),
    });
    b.rod(at(-0.22), at(-0.5), 0.07, P.steel, { bone: J.body, sides: 8 });
    const ix = s * 0.55;
    // lower wishbone
    b.rod([cx - s * 0.28, cy - 0.05, z + 0.3], [ix, cy + 0.12, z + 0.28], 0.035, P.hullLight, { bone: J.body });
    b.rod([cx - s * 0.28, cy - 0.05, z - 0.3], [ix, cy + 0.12, z - 0.28], 0.035, P.hullLight, { bone: J.body });
    // upper arm
    b.rod([cx - s * 0.28, cy + 0.25, z], [s * 0.6, cy + 0.6, z], 0.03, P.hullLight, { bone: J.body });
    // shock absorber: steel body, red spring sleeve
    const lo: [number, number, number] = [cx - s * 0.3, cy + 0.02, z + 0.08];
    const hi: [number, number, number] = [s * 0.7, cy + 0.6, z + 0.08];
    b.rod(lo, hi, 0.03, P.steel, { bone: J.body, sides: 6 });
    b.rod(
      [lo[0] + (hi[0] - lo[0]) * 0.3, lo[1] + (hi[1] - lo[1]) * 0.3, lo[2]],
      [lo[0] + (hi[0] - lo[0]) * 0.85, lo[1] + (hi[1] - lo[1]) * 0.85, lo[2]],
      0.05,
      P.hazard,
      { bone: J.body, sides: 8 },
    );
  }

  // cross-axle beams reaching the hull underside
  for (const z of [M.frontAxle[2], M.rearAxle[2]]) {
    b.rod([-0.8, 0.5, z], [0.8, 0.5, z], 0.06, P.hullDark, { bone: J.body, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 8), P.steel, {
      bone: J.body,
      at: [0, 0.5, z],
      dir: [0, 0, 1],
    });
  }
}
    return buildWheels;
  })(),
  // waterCannon
  (() => {
function buildWaterCannon({ b, J, P, M }: any) {
  const body = J.body, turret = J.turret, cannon = J.cannon;
  const R = rng(11);
  const V = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];

  const GUN = metal("iron", { tarnish: 0.3, size: 0.2 });
  const STEEL = metal("steel", { polish: 0.3 });
  const RUBBER = "#17181c";
  const TANK = paint((p, n) => {
    const t = noise(p, 0.25, 4);
    const base = mix(P.tankBlue, "#1f4f7c", t * 0.6);
    const ao = 0.75 + 0.25 * smoothstep(-0.9, 0.5, n.y);
    return [base[0] * ao, base[1] * ao, base[2] * ao];
  });

  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: body, at, ...o });

  // ---- textures
  const HAZ = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c514"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#07080b"/>`).join("")}</svg>`, { size: 128 });
  const AQUA = svg(`<svg viewBox="0 0 200 64"><rect width="200" height="64" fill="none"/><text x="100" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="25" fill="#e8ecf2" stroke="#07080b" stroke-width="1">AQUA-SUPPRESS</text><text x="100" y="54" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#2ff3ff">水 圧 鎮 圧 RC-9</text></svg>`, { size: 512 });
  const WARN = svg(`<svg viewBox="0 0 64 64"><path d="M32 4 L60 56 H4Z" fill="#f2c514" stroke="#07080b" stroke-width="4"/><rect x="29" y="22" width="6" height="18" fill="#07080b"/><rect x="29" y="44" width="6" height="6" fill="#07080b"/></svg>`, { size: 128 });
  const LEVEL = svg(`<svg viewBox="0 0 24 96"><rect width="24" height="96" fill="#0a2a3a"/><rect y="30" width="24" height="66" fill="#2ff3ff"/>${[10, 30, 50, 70, 90].map((y) => `<rect x="0" y="${y}" width="9" height="2" fill="#07080b"/>`).join("")}</svg>`, { size: 128 });
  const EYE = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#07080b"/><circle cx="16" cy="16" r="10" fill="#d1202f"/><circle cx="16" cy="16" r="5" fill="#ff8a8a"/></svg>`, { size: 64 });
  const flat = (tex: any, w: number, h: number, at: number[], dir: number[], bone: any = body, tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { bone, at, dir, axis: "z", texture: tex });

  // ---- turret base (body bone: ring), rotating parts on turret
  b.part(new THREE.CylinderGeometry(0.62, 0.68, 0.1, 16), P.armor, { bone: body, at: V(0, 1.5, -1.5) });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), STEEL, { bone: body, at: V(Math.sin(a) * 0.55, 1.57, -1.5 + Math.cos(a) * 0.55) });
  }
  b.part(new THREE.TorusGeometry(0.6, 0.02, 4, 24), P.neonMagenta, { bone: body, at: V(0, 1.56, -1.5), rotation: [90, 0, 0] });
  glow(b.part(new THREE.TorusGeometry(0.6, 0.02, 4, 24), P.neonMagenta, { bone: body, at: V(0, 1.56, -1.5), rotation: [90, 0, 0] }), 1.6);

  const tp = (g: any, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: turret, at, ...o });
  tp(new THREE.CylinderGeometry(0.5, 0.55, 0.12, 14), GUN, V(0, 1.62, -1.5));
  tp(new THREE.CylinderGeometry(0.52, 0.52, 0.03, 14), P.hazard, V(0, 1.69, -1.5));
  tp(new THREE.BoxGeometry(0.5, 0.36, 0.4), P.armor, V(0, 1.86, -1.55));
  tp(new THREE.BoxGeometry(0.36, 0.1, 0.3), P.hullLight, V(0, 2.06, -1.55));
  // cradle yokes
  for (const s of [1, -1]) {
    tp(new THREE.BoxGeometry(0.08, 0.42, 0.34), P.hull, V(s * 0.3, 2.0, -1.5));
    tp(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 8), STEEL, V(s * 0.35, 2.05, -1.5), { rotation: [0, 0, 90] });
  }
  // gunner shield
  const shield = b.extrude([[-0.45, 0], [0.45, 0], [0.4, 0.5], [0.22, 0.6], [-0.22, 0.6], [-0.4, 0.5]], {
    at: V(0, 1.7, -1.78), x: [1, 0, 0], thickness: 0.06, bevel: 0.015, bone: turret, color: P.hull });
  b.part(new THREE.PlaneGeometry(0.8, 0.12), "#ffffff", { bone: turret, at: V(0, 1.82, -1.81), dir: [0, 0, -1], axis: "z", texture: HAZ });
  b.part(new THREE.BoxGeometry(0.5, 0.12, 0.02), P.glass, { bone: turret, at: V(0, 2.12, -1.79) });
  glow(b.part(new THREE.BoxGeometry(0.5, 0.015, 0.025), P.neonCyan, { bone: turret, at: V(0, 2.19, -1.79) }), 1.4);
  flat(WARN, 0.14, 0.14, V(0, 1.95, -1.815), [0, 0, -1], turret);
  // sensor mast with red eye
  tp(new THREE.CylinderGeometry(0.02, 0.025, 0.25, 6), STEEL, V(-0.3, 2.2, -1.65));
  tp(new THREE.BoxGeometry(0.12, 0.1, 0.14), P.ink, V(-0.3, 2.37, -1.65));
  glow(b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", { bone: turret, at: V(-0.3, 2.37, -1.575), dir: [0, 0, 1], axis: "z", texture: EYE }), 1.8);
  // gauge
  tp(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 14), P.steel, V(0.27, 1.9, -1.4), { rotation: [0, 0, 90] });
  b.part(new THREE.CircleGeometry(0.058, 16), "#ffffff", { bone: turret, at: V(0.292, 1.9, -1.4), dir: [1, 0, 0], axis: "z", texture: gaugeTexture({ needle: 70, label: "BAR" }) });

  // ---- cannon barrel (on cannon joint, along +Z)
  const cn = (g: any, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: cannon, at, ...o });
  const barrel = [V(0, 2.05, -1.6), V(0, 2.05, -0.5)];
  b.sweep(barrel, 0.1, { bone: cannon, color: GUN, section: { ngon: 10 }, caps: "flat" });
  cn(new THREE.BoxGeometry(0.22, 0.2, 0.36), P.hullLight, V(0, 2.05, -1.55));
  for (const z of [-1.35, -1.1, -0.85, -0.65]) {
    cn(new THREE.CylinderGeometry(0.125, 0.125, 0.05, 10), P.steel, V(0, 2.05, z), { rotation: [90, 0, 0] });
  }
  for (const z of [-1.22, -0.75]) {
    glow(cn(new THREE.TorusGeometry(0.11, 0.012, 4, 14), P.neonMagenta, V(0, 2.05, z)), 1.6);
  }
  // nozzle
  b.lathe([[0, 0], [0.12, 0], [0.13, 0.04], [0.17, 0.18], [0.2, 0.2], [0.16, 0.2], [0.1, 0.05], [0, 0.04]], {
    at: V(0, 2.05, -0.5), axis: [0, 0, 1], bone: cannon, color: P.steel, segments: 12 });
  glow(cn(new THREE.CylinderGeometry(0.1, 0.07, 0.02, 12), P.neonCyan, V(0, 2.05, -0.31), { rotation: [90, 0, 0] }), 2);
  // side pressure pipe on barrel
  b.sweep([V(0.13, 2.05, -1.4), V(0.14, 2.05, -0.7)], 0.02, { bone: cannon, color: STEEL });

  // ---- tank
  const tz = -2.4;
  b.sweep([V(0, 1.95, tz + 0.5), V(0, 1.95, tz - 0.5)], 0.52, { bone: body, color: TANK, section: { ngon: 12 }, caps: "flat" });
  for (const z of [tz + 0.55, tz - 0.55]) cyl(0.5, 0.54, 0.1, 12, P.armor, V(0, 1.95, z), { rotation: [90, 0, 0] });
  for (const z of [tz + 0.3, tz - 0.3]) {
    b.sweep([V(0, 1.95, z), V(0, 1.95, z + 0.001)], 0.545, { bone: body, color: STEEL, section: { ngon: 12 }, caps: "flat", extend: 0.05 });
    box(0.06, 0.07, 0.07, P.hazard, V(0, 2.5, z));
  }
  // tank top hatch
  cyl(0.14, 0.16, 0.06, 8, P.armor, V(0, 2.5, tz));
  cyl(0.04, 0.04, 0.1, 6, STEEL, V(0, 2.58, tz));
  // level window
  box(0.1, 0.5, 0.03, P.ink, V(0.5, 1.95, tz + 0.12), { rotation: [0, 0, -10] });
  glow(flat(LEVEL, 0.07, 0.42, V(0.545, 1.97, tz + 0.12), [1, 0, 0]), 1.3);
  glow(flat(LEVEL, 0.07, 0.42, V(-0.545, 1.97, tz + 0.12), [-1, 0, 0]), 1.3);
  // decals
  flat(AQUA, 0.9, 0.28, V(0.535, 1.85, tz - 0.2), [1, 0, 0]);
  flat(AQUA, 0.9, 0.28, V(-0.535, 1.85, tz - 0.2), [-1, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.9, 0.2), "#ffffff", { bone: body, at: V(0.505, 2.18, tz + 0.1), dir: [0.9, 0.45, 0], axis: "z", texture: HAZ });
  // valve wheels & pipes at tank front
  const vz = tz + 0.58;
  for (const s of [1, -1]) {
    cyl(0.03, 0.03, 0.2, 6, STEEL, V(s * 0.3, 1.75, vz + 0.08), { rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.07, 0.012, 4, 10), P.corpRed, { bone: body, at: V(s * 0.3, 1.75, vz + 0.2) });
    box(0.14, 0.012, 0.012, P.corpRed, V(s * 0.3, 1.75, vz + 0.2));
  }
  // hoses from tank to turret
  for (const s of [1, -1]) {
    const path = catmull([V(s * 0.3, 1.78, vz + 0.2), V(s * 0.4, 1.7, -1.9), V(s * 0.3, 1.78, -1.7), V(s * 0.26, 1.95, -1.55)]);
    b.sweep(path, 0.032, { bone: body, color: RUBBER, sides: 6 });
    for (const t of [0.02, 0.97]) b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 6), STEEL, { bone: body, at: path.at(t), dir: path.tangentAt(t) });
  }
  // hose to cannon
  const hp = bezier(V(0.2, 1.95, -1.9), V(0.3, 2.3, -1.8), V(0.14, 2.3, -1.6), V(0.1, 2.12, -1.5));
  b.sweep(hp, 0.025, { bone: cannon, color: RUBBER, sides: 6 });

  // ---- ladder at rear
  const lz = tz - 0.75;
  for (const s of [1, -1]) box(0.04, 1.0, 0.04, STEEL, V(s * 0.2, 2.0, lz));
  for (let i = 0; i < 6; i++) box(0.4, 0.03, 0.03, STEEL, V(0, 1.6 + i * 0.16, lz));
  // rear deck light bars
  for (const s of [1, -1]) {
    box(0.4, 0.07, 0.06, P.ink, V(s * 0.65, 2.4, tz - 0.62), { rotation: [0, 0, 0] });
    glow(box(0.36, 0.035, 0.065, P.neonAmber, V(s * 0.65, 2.4, tz - 0.62)), 1.6);
    glow(box(0.3, 0.025, 0.04, P.neonMagenta, V(s * 0.6, 1.62, tz - 0.62)), 1.4);
  }
  glow(box(0.9, 0.03, 0.04, P.neonCyan, V(0, 2.52, tz - 0.58)), 1.5);
  // pedestal-to-deck braces
  for (const s of [1, -1]) box(0.08, 0.14, 0.5, P.hullLight, V(s * 0.52, 1.62, -1.5), { rotation: [0, 0, s * 20] });
  // tank saddle
  box(1.0, 0.1, 1.2, P.armor, V(0, 1.5, tz));
}
    return buildWaterCannon;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.1,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.1,0.52,1.8], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.1,0.52,1.8], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.1,0.52,-1.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.1,0.52,-1.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turret"] = b.joint("turret", { parent: J["body"], at: [0,1.5,-1.5], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannon"] = b.joint("cannon", { parent: J["turret"], at: [0,2.05,-1.5], dir: [0,0,1], role: "hinge", group: "turret" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
