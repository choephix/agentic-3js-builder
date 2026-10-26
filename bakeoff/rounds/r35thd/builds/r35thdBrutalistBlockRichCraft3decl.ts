import * as THREE from "three";
import {
  createBuilder,
  mottle,
  grain,
  countershade,
  paint,
  noise,
  mix,
  svg,
  rng,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "brutalist housing block",
  description:
    "A raw-concrete brutalist housing block with deep repetitive windows, projecting balcony bands, exposed service details, graffiti, rooftop tanks, vents, and a fire-service facade.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1, paintSize: 2048 });
  let serial = 0;
  const next = (prefix: string) => `${prefix}_${serial++}`;

  const RAW = grain(
    mottle("#716d68", "#aaa39a", { size: 0.42, contrast: 1.25, seed: 17 }),
    "#575552",
    { size: 0.16, axis: "y", seed: 23 },
  );

  const LIGHT_CONCRETE = countershade(
    mottle("#918c84", "#c1bbb0", { size: 0.32, contrast: 1.1, seed: 8 }),
    "#625f5b",
    { soft: 0.25, level: -0.1 },
  );

  const DARK_CONCRETE = grain(
    mottle("#454542", "#706d67", { size: 0.26, contrast: 1.45, seed: 41 }),
    "#292a29",
    { size: 0.11, axis: "z", seed: 45 },
  );

  const SHADOW = "#272a2b";
  const JOINT = "#3b3b39";
  const GLASS = "#182b31";
  const GLASS_BLUE = "#294b55";
  const ALUMINUM = "#8b8c84";
  const RUST = "#754a38";
  const BRASS = "#b79054";
  const BLACK = "#151819";
  const WARM = "#ffd28b";

  const windowsWarm = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 92">
      <rect width="120" height="92" fill="#17282c"/>
      <rect x="5" y="5" width="51" height="82" fill="#344f54"/>
      <rect x="64" y="5" width="51" height="82" fill="#283d42"/>
      <rect x="8" y="8" width="45" height="34" fill="#e4ad67"/>
      <rect x="67" y="8" width="45" height="34" fill="#8b684d"/>
      <rect x="8" y="48" width="45" height="35" fill="#af784d"/>
      <rect x="67" y="48" width="45" height="35" fill="#f0c47b"/>
      <path d="M60 4v84M5 45h110" stroke="#101c1f" stroke-width="6"/>
      <path d="M12 11h36M71 11h35M12 52h30M72 52h33" stroke="#fff1bd" stroke-width="2" opacity=".45"/>
    </svg>`,
    { size: 256 },
  );

  const windowsCool = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 92">
      <rect width="120" height="92" fill="#15262c"/>
      <rect x="5" y="5" width="51" height="82" fill="#315463"/>
      <rect x="64" y="5" width="51" height="82" fill="#203c4a"/>
      <rect x="8" y="8" width="45" height="34" fill="#4e8ca0"/>
      <rect x="67" y="8" width="45" height="34" fill="#1e596b"/>
      <rect x="8" y="48" width="45" height="35" fill="#224754"/>
      <rect x="67" y="48" width="45" height="35" fill="#5f97a3"/>
      <path d="M60 4v84M5 45h110" stroke="#0a161b" stroke-width="6"/>
      <path d="M12 13l35 25M72 12l34 25M12 56l34 24" stroke="#bce4e2" stroke-width="2" opacity=".44"/>
    </svg>`,
    { size: 256 },
  );

  const windowsCurtain = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 92">
      <rect width="120" height="92" fill="#202b2c"/>
      <rect x="5" y="5" width="51" height="82" fill="#59625f"/>
      <rect x="64" y="5" width="51" height="82" fill="#303939"/>
      <path d="M7 7h47v78H7zM66 7h47v78H66z" fill="#a9a38b" opacity=".35"/>
      <path d="M18 7v78M27 7v78M38 7v78M47 7v78M78 7v78M88 7v78M101 7v78" stroke="#dad2b7" stroke-width="5" opacity=".46"/>
      <path d="M60 4v84M5 45h110" stroke="#0f1718" stroke-width="6"/>
      <circle cx="17" cy="17" r="3" fill="#ffe6a3"/><circle cx="103" cy="72" r="3" fill="#ffd17a"/>
    </svg>`,
    { size: 256 },
  );

  const windowDark = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 92">
      <rect width="120" height="92" fill="#101b1d"/>
      <rect x="6" y="6" width="48" height="80" fill="#1d353b"/>
      <rect x="66" y="6" width="48" height="80" fill="#14272d"/>
      <path d="M60 3v86M3 45h114" stroke="#080c0d" stroke-width="7"/>
      <path d="M12 77h39M69 18h39" stroke="#71939a" stroke-width="2" opacity=".35"/>
    </svg>`,
    { size: 256 },
  );

  const ventTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70">
      <rect width="100" height="70" fill="#303332"/>
      <path d="M8 13h84M8 25h84M8 37h84M8 49h84M8 61h84" stroke="#a6a69c" stroke-width="4"/>
      <path d="M8 13h84M8 37h84M8 61h84" stroke="#555753" stroke-width="2"/>
      <path d="M15 7v56M35 7v56M55 7v56M75 7v56M95 7v56" stroke="#181a1a" stroke-width="2" opacity=".75"/>
    </svg>`,
    { size: 192 },
  );

  const doorTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 210">
      <rect width="160" height="210" fill="#171b1c"/>
      <rect x="12" y="10" width="61" height="188" fill="#30393a" stroke="#89908a" stroke-width="3"/>
      <rect x="87" y="10" width="61" height="188" fill="#252d2e" stroke="#89908a" stroke-width="3"/>
      <path d="M18 47h49M18 104h49M18 161h49M93 47h49M93 104h49M93 161h49" stroke="#52605d" stroke-width="3"/>
      <circle cx="61" cy="105" r="4" fill="#d6a75d"/><circle cx="99" cy="105" r="4" fill="#d6a75d"/>
      <path d="M8 202h144" stroke="#c6b58c" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const graffiti = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 150">
      <rect width="440" height="150" fill="none"/>
      <path d="M18 124L44 27h30l17 97M29 86h51M112 125V30h50q38 0 38 34t-38 34h-50M151 30v94M219 122V28h65M219 75h48M219 122h65M310 122V29h30l35 66V29M375 95h37v27M18 140h400" fill="none" stroke="#16151c" stroke-width="17" stroke-linejoin="bevel"/>
      <path d="M18 124L44 27h30l17 97M29 86h51M112 125V30h50q38 0 38 34t-38 34h-50M151 30v94M219 122V28h65M219 75h48M219 122h65M310 122V29h30l35 66V29M375 95h37v27" fill="none" stroke="#d34d35" stroke-width="8" stroke-linejoin="bevel"/>
      <path d="M32 17l27 11M232 14l28 10M397 14l25 12" stroke="#4db5a7" stroke-width="8"/>
      <circle cx="104" cy="30" r="9" fill="#f0c55d"/><circle cx="287" cy="35" r="8" fill="#f0c55d"/>
    </svg>`,
    { size: 512 },
  );

  const signTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80">
      <rect width="240" height="80" fill="#c9c0a4"/>
      <rect x="5" y="5" width="230" height="70" fill="#25282a" stroke="#d2ad62" stroke-width="4"/>
      <text x="120" y="38" fill="#e3d9b6" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" letter-spacing="4">BLOC 17</text>
      <text x="120" y="61" fill="#b79054" text-anchor="middle" font-family="sans-serif" font-size="10" letter-spacing="3">RUE DU BÉTON</text>
    </svg>`,
    { size: 256 },
  );

  const roofLabel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 70">
      <rect width="180" height="70" fill="#252725"/>
      <path d="M10 10h160v50H10z" fill="none" stroke="#b7aa8a" stroke-width="3"/>
      <text x="90" y="31" text-anchor="middle" fill="#d5c9a2" font-family="sans-serif" font-size="16" font-weight="bold">EAU / W-17</text>
      <text x="90" y="49" text-anchor="middle" fill="#a48e67" font-family="monospace" font-size="9">SERVICE ROOF 1974</text>
    </svg>`,
    { size: 192 },
  );

  const mailboxTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">
      <rect width="200" height="120" fill="#3d4140"/>
      <path d="M0 30h200M0 60h200M0 90h200M50 0v120M100 0v120M150 0v120" stroke="#171a19" stroke-width="5"/>
      <path d="M8 15h34M58 15h34M108 15h34M158 15h34M8 45h34M58 45h34M108 45h34M158 45h34M8 75h34M58 75h34M108 75h34M158 75h34M8 105h34M58 105h34M108 105h34M158 105h34" stroke="#a29b87" stroke-width="3"/>
      <circle cx="44" cy="15" r="2" fill="#d6b96e"/><circle cx="94" cy="45" r="2" fill="#d6b96e"/><circle cx="144" cy="75" r="2" fill="#d6b96e"/>
    </svg>`,
    { size: 256 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any = RAW,
    rotation?: [number, number, number],
    name = "concrete",
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name: next(name),
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    segments = 12,
    rotation?: [number, number, number],
    name = "cylinder",
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      flat: true,
      name: next(name),
    });

  const frontPanel = (
    width: number,
    height: number,
    at: [number, number, number],
    texture: THREE.Texture,
    name = "panel",
    tint = "#ffffff",
  ) =>
    b.part(new THREE.PlaneGeometry(width, height), tint, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture,
      name: next(name),
    });

  const sidePanel = (
    width: number,
    height: number,
    at: [number, number, number],
    texture: THREE.Texture,
    outward: 1 | -1,
    name = "side-panel",
  ) =>
    b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir: [outward, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture,
      name: next(name),
    });

  const frontRail = (
    x0: number,
    x1: number,
    y: number,
    z: number,
    height: number,
    name = "balcony-rail",
  ) => {
    box([x1 - x0, 0.075, 0.075], [(x0 + x1) / 2, y + height, z], DARK_CONCRETE, undefined, `${name}-top`);
    for (let x = x0; x <= x1 + 0.001; x += 0.28) {
      box([0.055, height, 0.055], [x, y + height / 2, z], DARK_CONCRETE, undefined, `${name}-bar`);
    }
  };

  const sideRail = (
    z0: number,
    z1: number,
    y: number,
    x: number,
    height: number,
    outward: 1 | -1,
    name = "side-rail",
  ) => {
    box([0.075, 0.075, z1 - z0], [x, y + height, (z0 + z1) / 2], DARK_CONCRETE, undefined, `${name}-top`);
    for (let z = z0; z <= z1 + 0.001; z += 0.28) {
      box([0.055, height, 0.055], [x, y + height / 2, z], DARK_CONCRETE, undefined, `${name}-bar`);
    }
    void outward;
  };

  const acUnit = (x: number, y: number, z: number, side = 1) => {
    box([0.46, 0.28, 0.30], [x, y, z], ALUMINUM, undefined, "air-conditioner");
    box([0.34, 0.17, 0.012], [x, y, z + 0.157], BLACK, undefined, "ac-shadow");
    for (let i = -1; i <= 1; i++) {
      box([0.035, 0.13, 0.018], [x + i * 0.10, y, z + 0.168], "#b4b2a7", [0, 0, side * 8], "ac-fin");
    }
    box([0.06, 0.05, 0.22], [x + side * 0.27, y + 0.08, z], RUST, [0, 0, side * 35], "ac-pipe");
  };

  const rooftopVent = (x: number, z: number) => {
    box([0.55, 0.48, 0.55], [x, 8.08, z], DARK_CONCRETE, undefined, "roof-vent");
    box([0.63, 0.10, 0.63], [x, 8.34, z], RAW, undefined, "roof-vent-cap");
    frontPanel(0.38, 0.24, [x, 8.10, z + 0.283], ventTexture, "roof-vent-grille");
  };

  // Ground-touching stepped plinth and the heavy lower podium.
  box([9.5, 0.16, 6.5], [0, 0.08, 0], DARK_CONCRETE, undefined, "ground-plinth");
  box([9.15, 0.42, 6.18], [0, 0.37, 0], RAW, undefined, "lower-plinth");
  box([8.78, 1.42, 5.55], [0, 1.25, 0], RAW, undefined, "podium");
  box([8.95, 0.18, 5.82], [0, 1.98, 0], LIGHT_CONCRETE, undefined, "podium-cap");

  // A monolithic upper tower, with deliberately oversized structural bands.
  box([7.55, 5.48, 4.72], [0, 4.70, 0], RAW, undefined, "main-tower");
  box([7.86, 0.23, 5.12], [0, 2.03, 0], LIGHT_CONCRETE, undefined, "tower-foot-band");
  box([7.86, 0.22, 5.12], [0, 7.37, 0], LIGHT_CONCRETE, undefined, "tower-roof-band");

  // Front floor plates and deep shadow lines.
  const floorBands = [2.10, 3.39, 4.68, 5.97, 7.34];
  for (const y of floorBands) {
    box([7.95, 0.17, 0.72], [0, y, 2.59], LIGHT_CONCRETE, undefined, "front-floor-slab");
    box([7.60, 0.045, 0.055], [0, y - 0.12, 2.974], JOINT, undefined, "front-shadow-line");
  }

  // Strong front piers.
  for (const x of [-3.62, -1.82, 0, 1.82, 3.62]) {
    box([0.22, 5.25, 0.30], [x, 4.68, 2.84], LIGHT_CONCRETE, undefined, "front-structural-pier");
  }

  // Formwork seams and a few darker vertical recesses.
  for (const x of [-2.72, -0.92, 0.92, 2.72]) {
    box([0.035, 5.12, 0.025], [x, 4.72, 2.717], JOINT, undefined, "front-formwork-seam");
  }
  for (const y of [2.75, 4.04, 5.33, 6.62]) {
    box([7.35, 0.025, 0.032], [0, y, 2.718], JOINT, undefined, "front-formwork-seam-horizontal");
  }

  // Repeating front windows, intentionally varied as occupied apartment interiors.
  const frontXs = [-2.72, -0.92, 0.92, 2.72];
  const frontYs = [2.69, 3.98, 5.27, 6.56];
  const frontTextures = [windowsWarm, windowsCool, windowsCurtain, windowDark];
  for (let row = 0; row < frontYs.length; row++) {
    for (let col = 0; col < frontXs.length; col++) {
      const x = frontXs[col];
      const y = frontYs[row];
      box([1.38, 0.88, 0.10], [x, y, 2.715], SHADOW, undefined, "recessed-window");
      const panel = frontPanel(1.25, 0.76, [x, y, 2.776], frontTextures[(row * 3 + col) % frontTextures.length], "apartment-window");
      if ((row + col) % 4 === 0) glow(panel, 0.32);
      box([1.31, 0.045, 0.10], [x, y - 0.46, 2.82], LIGHT_CONCRETE, undefined, "window-sill");
    }
  }

  // Alternating projecting balconies on the front.
  const balconies = [
    { x: -2.28, y: 3.42, w: 2.55 },
    { x: 2.28, y: 3.42, w: 2.55 },
    { x: -2.28, y: 6.00, w: 2.55 },
    { x: 2.28, y: 6.00, w: 2.55 },
  ];
  for (const bal of balconies) {
    box([bal.w, 0.14, 0.83], [bal.x, bal.y, 3.04], RAW, undefined, "projecting-balcony");
    box([bal.w + 0.12, 0.10, 0.10], [bal.x, bal.y + 0.10, 3.43], LIGHT_CONCRETE, undefined, "balcony-nosing");
    frontRail(bal.x - bal.w / 2, bal.x + bal.w / 2, bal.y + 0.08, 3.38, 0.76);
    sideRail(2.67, 3.38, bal.y + 0.08, bal.x - bal.w / 2, 0.76, -1, "balcony-side-rail");
    sideRail(2.67, 3.38, bal.y + 0.08, bal.x + bal.w / 2, 0.76, 1, "balcony-side-rail");
  }

  // Air-conditioning units sit below selected windows, with exposed rusty condensate pipes.
  for (const x of [-2.72, -0.92, 0.92, 2.72]) {
    acUnit(x, 3.32, 2.82, x > 0 ? 1 : -1);
    acUnit(x, 5.90, 2.82, x > 0 ? 1 : -1);
  }

  // Side facade at +X: windows, vertical fins, and a service pattern.
  for (const z of [-1.72, -0.48, 0.76, 1.82]) {
    box([0.11, 5.20, 0.17], [3.81, 4.70, z], LIGHT_CONCRETE, undefined, "side-fin");
  }
  const sideZs = [-1.72, -0.48, 0.76, 1.82];
  const sideYs = [2.68, 3.98, 5.27, 6.56];
  for (let row = 0; row < sideYs.length; row++) {
    for (let col = 0; col < sideZs.length; col++) {
      const z = sideZs[col];
      const y = sideYs[row];
      box([0.10, 0.86, 0.88], [3.715, y, z], SHADOW, undefined, "side-window-recess");
      sidePanel(0.78, 0.72, [3.778, y, z], frontTextures[(row + col + 1) % frontTextures.length], 1, "side-apartment-window");
      box([0.12, 0.05, 0.83], [3.84, y - 0.46, z], LIGHT_CONCRETE, undefined, "side-window-sill");
    }
  }

  // Smaller, colder service windows on the opposite side.
  for (const z of [-1.55, 0.1, 1.55]) {
    for (const y of [2.75, 4.15, 5.55, 6.72]) {
      box([0.08, 0.72, 0.86], [-3.715, y, z], SHADOW, undefined, "opposite-window-recess");
      sidePanel(0.72, 0.58, [-3.778, y, z], windowDark, -1, "opposite-service-window");
    }
  }

  // Ground-level entry portal: a dark void held by a massive concrete frame.
  box([1.75, 1.34, 0.22], [0, 1.22, 2.82], DARK_CONCRETE, undefined, "entry-void");
  box([0.30, 1.72, 0.62], [-1.12, 1.44, 2.88], LIGHT_CONCRETE, undefined, "entry-portal-left");
  box([0.30, 1.72, 0.62], [1.12, 1.44, 2.88], LIGHT_CONCRETE, undefined, "entry-portal-right");
  box([2.55, 0.28, 0.62], [0, 2.18, 2.88], LIGHT_CONCRETE, undefined, "entry-portal-lintel");
  const entry = frontPanel(1.48, 1.88, [0, 1.18, 2.952], doorTexture, "entry-door");
  glow(entry, 0.12);
  box([2.80, 0.12, 1.05], [0, 2.35, 3.05], RAW, [8, 0, 0], "entry-canopy");
  box([2.94, 0.07, 0.10], [0, 2.28, 3.57], DARK_CONCRETE, undefined, "entry-canopy-shadow");

  // Entry signage and an intercom/mailbox wall.
  frontPanel(1.60, 0.53, [0, 2.58, 2.93], signTexture, "building-sign");
  frontPanel(1.82, 1.08, [-2.05, 1.18, 2.786], mailboxTexture, "mailbox-bank");
  box([1.98, 0.08, 0.10], [-2.05, 1.18, 2.84], LIGHT_CONCRETE, undefined, "mailbox-frame");
  box([0.30, 0.48, 0.08], [2.15, 1.37, 2.84], BLACK, undefined, "intercom");
  for (let i = 0; i < 6; i++) {
    cylinder(0.025, 0.02, [2.15, 1.10 + i * 0.105, 2.91], BRASS, 8, [90, 0, 0], "intercom-button");
  }

  // Graffiti mural, partly occluded by the entry mass.
  frontPanel(3.15, 1.08, [-2.30, 1.18, 2.812], graffiti, "graffiti-wall");
  box([3.30, 0.06, 0.07], [-2.30, 0.60, 2.86], DARK_CONCRETE, undefined, "graffiti-base-shadow");

  // Base-level ventilation grilles and utility doors.
  for (const x of [-3.55, -2.55, 2.62, 3.55]) {
    box([0.72, 0.72, 0.12], [x, 0.92, 2.805], DARK_CONCRETE, undefined, "base-vent-recess");
    frontPanel(0.61, 0.48, [x, 0.94, 2.88], ventTexture, "base-vent-grille");
  }
  box([1.10, 0.96, 0.10], [2.05, 1.00, 2.82], RUST, undefined, "utility-door");
  frontPanel(0.88, 0.74, [2.05, 1.00, 2.886], ventTexture, "utility-door-grille");

  // Heavy corner buttresses and rough plinth scars.
  for (const s of [-1, 1]) {
    box([0.42, 2.05, 0.54], [s * 4.10, 1.28, 2.35], DARK_CONCRETE, [0, s * 7, 0], "corner-buttress");
    box([0.50, 0.24, 0.78], [s * 4.15, 0.61, 2.35], RAW, undefined, "corner-foot");
  }
  for (const x of [-3.65, -1.2, 1.35, 3.72]) {
    box([0.12, 0.34, 0.12], [x, 0.58, 2.98], RUST, [0, 0, 18], "foundation-stain");
  }

  // A detached concrete service balcony and ladder on the +X side.
  for (const y of [2.05, 3.42, 4.79, 6.16]) {
    box([0.78, 0.12, 1.65], [4.08, y, -0.86], RAW, undefined, "service-platform");
    sideRail(-1.62, -0.10, y + 0.08, 4.45, 0.72, 1, "service-platform-rail");
    box([0.07, 0.07, 1.63], [3.73, y + 0.82, -0.86], DARK_CONCRETE, undefined, "service-platform-edge");
  }
  box([0.08, 4.65, 0.08], [4.44, 4.22, -0.12], RUST, undefined, "service-ladder-side");
  box([0.08, 4.65, 0.08], [4.44, 4.22, -1.42], RUST, undefined, "service-ladder-side");
  for (let i = 0; i < 14; i++) {
    box([0.10, 0.08, 1.38], [4.44, 2.02 + i * 0.34, -0.77], ALUMINUM, [0, 0, 90], "service-ladder-rung");
  }

  // External drainpipes, deliberately visible against the concrete.
  for (const x of [-4.16, 4.16]) {
    cylinder(0.075, 5.85, [x, 3.35, 2.76], RUST, 8, undefined, "drainpipe");
    box([0.22, 0.12, 0.18], [x, 6.15, 2.76], RUST, undefined, "drainpipe-bracket");
    box([0.22, 0.12, 0.18], [x, 3.05, 2.76], RUST, undefined, "drainpipe-bracket");
  }

  // Roofline parapets and a recessed roof deck.
  box([7.88, 0.52, 0.25], [0, 7.66, 2.35], RAW, undefined, "front-parapet");
  box([7.88, 0.52, 0.25], [0, 7.66, -2.35], RAW, undefined, "rear-parapet");
  box([0.25, 0.52, 4.45], [-3.82, 7.66, 0], RAW, undefined, "left-parapet");
  box([0.25, 0.52, 4.45], [3.82, 7.66, 0], RAW, undefined, "right-parapet");
  box([7.25, 0.13, 4.25], [0, 7.42, 0], DARK_CONCRETE, undefined, "roof-shadow-deck");

  // Rooftop stair/lift penthouse with projecting cap.
  box([3.15, 0.92, 2.65], [0, 8.08, -0.18], RAW, undefined, "roof-penthouse");
  box([3.42, 0.18, 2.92], [0, 8.60, -0.18], LIGHT_CONCRETE, undefined, "roof-penthouse-cap");
  box([2.82, 0.72, 0.12], [0, 8.05, 1.165], DARK_CONCRETE, undefined, "roof-penthouse-window-recess");
  frontPanel(2.50, 0.50, [0, 8.05, 1.235], windowDark, "roof-penthouse-window");
  frontPanel(1.80, 0.48, [0, 8.31, 1.24], roofLabel, "roof-service-label");

  // Concrete rooftop vents.
  rooftopVent(-1.92, 0.90);
  rooftopVent(1.75, 0.80);
  rooftopVent(-1.15, -1.40);
  rooftopVent(1.20, -1.45);

  // Two squat water tanks with low-poly collars and service pipes.
  for (const x of [-1.62, 1.62]) {
    cylinder(0.66, 1.15, [x, 8.25, -0.72], DARK_CONCRETE, 12, undefined, "water-tank");
    cylinder(0.71, 0.12, [x, 7.70, -0.72], RAW, 12, undefined, "tank-foot-ring");
    cylinder(0.71, 0.10, [x, 8.82, -0.72], RAW, 12, undefined, "tank-top-ring");
    cylinder(0.22, 0.16, [x, 8.91, -0.72], RUST, 10, undefined, "tank-cap");
    for (const y of [7.82, 8.20, 8.57]) {
      const torus = new THREE.TorusGeometry(0.665, 0.025, 6, 16);
      b.part(torus, RUST, { at: [x, y, -0.72], rotation: [90, 0, 0], name: next("tank-band") });
    }
    frontPanel(0.92, 0.36, [x, 8.25, -0.055], roofLabel, "tank-label");
    cylinder(0.055, 0.78, [x + 0.42, 8.80, -0.34], RUST, 8, [22, 0, 0], "tank-pipe");
  }

  // Low antenna mast, kept below the building's visual top.
  cylinder(0.035, 0.52, [0, 8.88, 0.10], ALUMINUM, 8, undefined, "antenna-mast");
  box([0.72, 0.035, 0.035], [0, 8.98, 0.10], ALUMINUM, undefined, "antenna-crossbar");
  box([0.035, 0.28, 0.035], [-0.34, 8.84, 0.10], RUST, [0, 0, 25], "antenna-brace");
  box([0.035, 0.28, 0.035], [0.34, 8.84, 0.10], RUST, [0, 0, -25], "antenna-brace");

  // Roof edge scars, small inspection plates, and repeated bolts.
  for (const x of [-3.15, -2.1, -1.05, 0, 1.05, 2.1, 3.15]) {
    box([0.12, 0.08, 0.26], [x, 7.93, 2.48], RUST, undefined, "parapet-scar");
    cylinder(0.035, 0.025, [x, 7.98, 2.60], BRASS, 8, undefined, "parapet-bolt");
  }
  for (const z of [-1.90, -0.95, 0, 0.95, 1.90]) {
    cylinder(0.035, 0.025, [3.95, 7.92, z], BRASS, 8, [0, 0, 90], "side-parapet-bolt");
  }

  // A few brutalist wedge-like projections around the upper silhouette.
  box([1.95, 0.26, 0.62], [-2.55, 7.54, 2.77], LIGHT_CONCRETE, [0, 0, -7], "upper-sun-breaker");
  box([1.95, 0.26, 0.62], [2.55, 7.54, 2.77], LIGHT_CONCRETE, [0, 0, 7], "upper-sun-breaker");
  box([0.38, 1.05, 0.42], [-3.70, 6.88, 2.72], DARK_CONCRETE, [0, 0, -5], "upper-corner-shadow");
  box([0.38, 1.05, 0.42], [3.70, 6.88, 2.72], DARK_CONCRETE, [0, 0, 5], "upper-corner-shadow");

  // Dark underside blocks make the facade feel recessed rather than painted on.
  for (const x of [-2.72, -0.92, 0.92, 2.72]) {
    for (const y of [2.23, 3.52, 4.81, 6.10]) {
      box([1.33, 0.08, 0.34], [x, y, 2.79], DARK_CONCRETE, undefined, "window-underside");
    }
  }

  // Small signs, inspection labels, and an isolated concrete marker at the entry.
  frontPanel(0.42, 0.30, [1.48, 2.56, 2.94], signTexture, "entry-small-sign");
  frontPanel(0.40, 0.26, [-1.45, 2.55, 2.94], ventTexture, "entry-service-label");
  box([0.52, 0.08, 0.52], [3.28, 1.12, 2.88], ALUMINUM, undefined, "meter-box");
  frontPanel(0.36, 0.30, [3.28, 1.14, 2.935], ventTexture, "meter-box-face");

  // Isolated raw-concrete ledges and block joints at the lower podium.
  for (const y of [0.77, 1.72]) {
    box([8.42, 0.055, 0.06], [0, y, 2.785], JOINT, undefined, "podium-joint");
    box([8.42, 0.055, 0.06], [0, y, -2.785], JOINT, undefined, "podium-rear-joint");
  }
  for (const x of [-3.85, -1.92, 0, 1.92, 3.85]) {
    box([0.045, 1.30, 0.045], [x, 1.24, 2.79], JOINT, undefined, "podium-formwork-joint");
  }

  // A restrained line of shrubs is intentionally not added: the block remains the entire subject.
  // Force deterministic evaluation of a seed used for tiny material variation in environments that inspect it.
  rng(311);

  return b.root;
}
