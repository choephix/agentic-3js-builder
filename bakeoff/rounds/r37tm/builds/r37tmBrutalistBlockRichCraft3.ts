import * as THREE from "three";
import { createBuilder, mottle, svg } from "../../../../src/index";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A stylized raw-concrete brutalist housing block with heavy stepped masses, recessed windows, stacked balconies, service vents, a monumental entrance, and rooftop machinery.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = mottle("#858782", "#5f625f", {
    size: 0.42,
    contrast: 1.35,
    seed: 18,
  });
  const DARK_CONCRETE = mottle("#656864", "#414542", {
    size: 0.3,
    contrast: 1.25,
    seed: 23,
  });
  const LIGHT_CONCRETE = mottle("#a19f95", "#72746f", {
    size: 0.55,
    contrast: 1.15,
    seed: 31,
  });

  const GLASS = "#182227";
  const GLASS_LIT = "#33454a";
  const FRAME = "#4b504e";
  const BLACK = "#171b1b";
  const RUST = "#6b4030";
  const SAFETY = "#b99142";
  const ROOF = "#555a57";

  const windowTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#172126"/>
      <rect x="5" y="4" width="54" height="56" fill="#27383d"/>
      <path d="M8 10 Q22 4 56 12 L56 28 Q29 21 8 29Z" fill="#47636a" opacity=".62"/>
      <path d="M6 46 Q28 38 58 48 L58 57 L6 57Z" fill="#101719" opacity=".8"/>
      <path d="M31 4V60M5 31H59" stroke="#0b1011" stroke-width="4"/>
      <path d="M34 8V57M9 34H55" stroke="#66787b" stroke-width="1.2" opacity=".7"/>
    </svg>`,
    { size: 128 },
  );

  const litWindowTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#6d806f"/>
      <rect x="6" y="5" width="52" height="54" fill="#d4b968"/>
      <path d="M8 11 Q25 3 57 13V29Q28 21 8 31Z" fill="#fff0af" opacity=".55"/>
      <path d="M31 4V60M5 31H59" stroke="#303633" stroke-width="4"/>
      <rect x="10" y="37" width="13" height="18" fill="#a08448" opacity=".6"/>
      <rect x="39" y="37" width="15" height="18" fill="#eee1a0" opacity=".72"/>
    </svg>`,
    { size: 128 },
  );

  const entranceTexture = svg(
    `<svg viewBox="0 0 128 192" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="192" fill="#151919"/>
      <rect x="9" y="8" width="110" height="176" fill="#253031" stroke="#76817d" stroke-width="4"/>
      <path d="M15 145H113M64 8V184" stroke="#111515" stroke-width="5"/>
      <rect x="22" y="25" width="30" height="94" fill="#526669"/>
      <rect x="76" y="25" width="30" height="94" fill="#3c4d50"/>
      <circle cx="58" cy="146" r="4" fill="#c1a35b"/>
      <circle cx="70" cy="146" r="4" fill="#c1a35b"/>
      <path d="M26 161H103" stroke="#c1a35b" stroke-width="3"/>
      <text x="64" y="177" text-anchor="middle" font-size="10" font-family="sans-serif" fill="#c1a35b">BLOC 07</text>
    </svg>`,
    { size: 192 },
  );

  const signTexture = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="64" fill="#282d2a" stroke="#9d9b83" stroke-width="4"/>
      <path d="M16 12H240M16 52H240" stroke="#59605a" stroke-width="2"/>
      <text x="128" y="41" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="25" letter-spacing="5" fill="#d6c78d">RÉSIDENCE 07</text>
    </svg>`,
    { size: 256 },
  );

  const warningTexture = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" fill="#252a28"/>
      <path d="M0 70L70 0M18 80L80 18M0 38L38 0" stroke="#c39a39" stroke-width="12"/>
      <path d="M0 70L70 0M18 80L80 18M0 38L38 0" stroke="#202321" stroke-width="4"/>
      <text x="40" y="54" text-anchor="middle" font-size="14" font-family="sans-serif" font-weight="bold" fill="#f2e6b0">DANGER</text>
    </svg>`,
    { size: 96 },
  );

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: any = CONCRETE,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      name,
      ...extra,
    });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    segments = 8,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      flat: true,
      name,
      ...extra,
    });

  const frontWindow = (
    x: number,
    y: number,
    w = 0.82,
    h = 0.92,
    texture: any = windowTexture,
    name = "recessed-window",
  ) => {
    box(`${name}-void`, [w + 0.2, h + 0.2, 0.12], [x, y, 3.66], BLACK);
    box(`${name}-glass`, [w, h, 0.035], [x, y, 3.735], GLASS, {
      texture,
    });
    box(`${name}-lintel`, [w + 0.22, 0.075, 0.18], [x, y + h / 2 + 0.075, 3.78], FRAME);
    box(`${name}-sill`, [w + 0.22, 0.075, 0.22], [x, y - h / 2 - 0.075, 3.8], DARK_CONCRETE);
  };

  const sideWindow = (
    x: number,
    y: number,
    z: number,
    w = 0.68,
    h = 0.84,
    texture: any = windowTexture,
  ) => {
    box("side-window-recess", [0.12, h + 0.2, w + 0.2], [x, y, z], BLACK);
    box("side-window-glass", [0.035, h, w], [x + (x > 0 ? 0.075 : -0.075), y, z], GLASS, {
      texture,
    });
    box("side-window-sill", [0.2, 0.075, w + 0.2], [x, y - h / 2 - 0.07, z], DARK_CONCRETE);
  };

  const balcony = (x: number, y: number, width: number, depth: number, index: number) => {
    const z = 3.98;
    box(`balcony-${index}-slab`, [width, 0.19, depth], [x, y - 0.59, z], LIGHT_CONCRETE);
    box(`balcony-${index}-ceiling`, [width + 0.12, 0.12, depth + 0.08], [x, y + 0.63, z], DARK_CONCRETE);
    box(`balcony-${index}-left-cheek`, [0.16, 1.18, depth], [x - width / 2 - 0.07, y, z], CONCRETE);
    box(`balcony-${index}-right-cheek`, [0.16, 1.18, depth], [x + width / 2 + 0.07, y, z], CONCRETE);

    const railY = y - 0.03;
    const frontZ = z + depth / 2;
    b.rod([x - width / 2, railY, frontZ], [x + width / 2, railY, frontZ], 0.025, {
      color: SAFETY,
      name: `balcony-${index}-top-rail`,
    });
    b.rod([x - width / 2, y - 0.48, frontZ], [x + width / 2, y - 0.48, frontZ], 0.018, {
      color: FRAME,
      name: `balcony-${index}-lower-rail`,
    });
    for (const dx of [-width / 2, -width / 4, 0, width / 4, width / 2]) {
      b.rod([x + dx, y - 0.52, frontZ], [x + dx, railY, frontZ], 0.015, {
        color: SAFETY,
        name: `balcony-${index}-baluster`,
      });
    }

    box(`balcony-${index}-drain`, [0.08, 0.08, 0.18], [x + width * 0.34, y - 0.5, z + depth * 0.3], BLACK);
    box(`balcony-${index}-planter`, [0.72, 0.22, 0.24], [x - width * 0.24, y - 0.38, frontZ - 0.1], DARK_CONCRETE);
    for (let i = 0; i < 3; i++) {
      cylinder(
        `balcony-${index}-plant-${i}`,
        0.035,
        0.24 + i * 0.035,
        [x - width * 0.36 + i * 0.13, y - 0.18, frontZ - 0.1],
        "#4c5b43",
        5,
      );
    }
  };

  // Massive podium, plinth, and asymmetrical structural masses.
  box("subterranean-shadow-plinth", [12.8, 0.32, 8.5], [0, 0.16, 0], DARK_CONCRETE);
  box("monumental-podium", [12.2, 1.35, 7.8], [0, 0.88, 0], CONCRETE);
  box("main-housing-bar", [11.35, 5.8, 6.85], [0, 4.32, 0], CONCRETE);
  box("left-projecting-wing", [3.4, 4.25, 7.55], [-4.35, 5.35, -0.18], DARK_CONCRETE);
  box("right-projecting-wing", [3.25, 3.65, 7.9], [4.25, 5.65, -0.05], CONCRETE);
  box("upper-bridge", [8.9, 1.05, 7.55], [0.25, 7.62, -0.04], LIGHT_CONCRETE);
  box("upper-left-overhang", [4.7, 0.72, 8.2], [-3.25, 7.95, 0], DARK_CONCRETE);
  box("upper-right-overhang", [4.7, 0.72, 8.25], [3.4, 7.95, 0], CONCRETE);

  // Deep horizontal shadow bands emphasize the raw concrete construction.
  for (let y = 1.58; y < 7.25; y += 1.12) {
    box(`front-shadow-band-${y.toFixed(2)}`, [11.5, 0.12, 0.28], [0, y, 3.48], DARK_CONCRETE);
  }
  for (const x of [-5.15, -2.58, 0, 2.58, 5.15]) {
    box("vertical-pour-joint", [0.055, 5.55, 0.035], [x, 4.36, 3.535], DARK_CONCRETE);
  }

  // Front elevation: repeated recessed windows and a deliberately uneven rhythm.
  const floors = [2.05, 3.12, 4.2, 5.28, 6.36];
  const bays = [-4.65, -3.48, -2.31, -1.14, 0.03, 1.2, 2.37, 3.54, 4.71];
  floors.forEach((y, fi) => {
    bays.forEach((x, bi) => {
      const lit = (fi === 2 && (bi === 1 || bi === 6)) || (fi === 4 && bi === 7);
      if ((fi === 0 && bi === 0) || (fi === 3 && bi === 8)) return;
      frontWindow(x, y, bi % 3 === 0 ? 0.72 : 0.86, 0.78, lit ? litWindowTexture : windowTexture, `front-${fi}-${bi}`);
    });
  });

  // Cantilevered balcony stacks on the central facade.
  balcony(-3.18, 2.98, 2.15, 1.02, 1);
  balcony(0.05, 4.08, 2.18, 1.12, 2);
  balcony(3.18, 5.18, 2.15, 1.02, 3);
  balcony(-0.75, 6.26, 2.28, 1.08, 4);

  // Side elevations with slit windows and heavy vertical ribs.
  for (const side of [-1, 1]) {
    const x = side * 5.78;
    for (let i = 0; i < 5; i++) {
      const y = 2.12 + i * 1.08;
      sideWindow(x, y, -2.35, 0.86, 0.72, i === 1 ? litWindowTexture : windowTexture);
      sideWindow(x, y, 0.05, 0.58, 0.72, windowTexture);
      sideWindow(x, y, 2.25, 0.78, 0.72, i === 4 ? litWindowTexture : windowTexture);
    }
    for (let z = -3.5; z <= 3.3; z += 1.35) {
      box(`side-rib-${side}-${z.toFixed(1)}`, [0.24, 5.9, 0.22], [x + side * 0.12, 4.35, z], DARK_CONCRETE);
    }
  }

  // Podium windows are lower, wider, and nearly black.
  for (let i = -5; i <= 5; i++) {
    const x = i * 1.03;
    box("podium-window-recess", [0.82, 0.62, 0.13], [x, 0.92, 3.95], BLACK);
    box("podium-window", [0.62, 0.43, 0.025], [x, 0.92, 4.03], GLASS, {
      texture: i % 4 === 0 ? litWindowTexture : windowTexture,
    });
  }

  // Monumental recessed entrance and broad stair canopy.
  box("entrance-void", [2.08, 2.64, 0.48], [0, 1.58, 3.82], BLACK);
  box("entrance-door", [1.58, 2.18, 0.035], [0, 1.53, 4.09], "#273335", {
    texture: entranceTexture,
  });
  box("entrance-left-pier", [0.28, 2.72, 0.72], [-1.15, 1.62, 3.76], DARK_CONCRETE);
  box("entrance-right-pier", [0.28, 2.72, 0.72], [1.15, 1.62, 3.76], DARK_CONCRETE);
  box("entrance-canopy", [3.1, 0.28, 1.55], [0, 2.96, 4.3], LIGHT_CONCRETE);
  box("entrance-canopy-shadow", [2.62, 0.06, 1.2], [0, 2.79, 4.75], BLACK);
  box("entrance-step-1", [2.9, 0.18, 1.02], [0, 0.23, 4.22], DARK_CONCRETE);
  box("entrance-step-2", [2.55, 0.16, 0.72], [0, 0.4, 4.08], CONCRETE);
  box("entrance-sign", [2.8, 0.66, 0.04], [0, 2.55, 4.96], "#4b514d", {
    texture: signTexture,
  });

  // Raw concrete parapets and rooftop silhouettes.
  box("roof-parapet-front", [12.25, 0.58, 0.42], [0, 8.28, 3.38], CONCRETE);
  box("roof-parapet-left", [0.42, 0.58, 7.85], [-5.92, 8.28, -0.15], DARK_CONCRETE);
  box("roof-parapet-right", [0.42, 0.58, 8.1], [5.92, 8.28, -0.08], CONCRETE);
  box("roof-service-house", [3.0, 1.65, 2.7], [1.15, 9.02, -0.4], DARK_CONCRETE);
  box("roof-service-cap", [3.35, 0.24, 3.05], [1.15, 9.96, -0.4], LIGHT_CONCRETE);
  box("roof-stair-house", [2.25, 1.28, 2.05], [-2.85, 8.88, -0.55], CONCRETE);
  box("roof-stair-cap", [2.55, 0.22, 2.35], [-2.85, 9.63, -0.55], DARK_CONCRETE);

  // Rooftop ventilation drums and square ducts.
  for (let i = 0; i < 5; i++) {
    const x = -4.55 + i * 1.15;
    cylinder(`roof-vent-${i}`, 0.26, 0.68, [x, 8.77, 2.15], ROOF, 8);
    cylinder(`roof-vent-cap-${i}`, 0.31, 0.08, [x, 9.13, 2.15], DARK_CONCRETE, 8);
    box(`roof-duct-${i}`, [0.38, 0.7, 0.42], [x + 0.38, 8.77, 2.15], CONCRETE);
  }

  // Deep rooftop sawtooth skylights.
  for (let i = 0; i < 4; i++) {
    const x = -3.2 + i * 1.75;
    box(`skylight-frame-${i}`, [1.25, 0.18, 1.1], [x, 8.48, -2.35], BLACK);
    box(`skylight-glass-${i}`, [0.92, 0.035, 0.78], [x, 8.59, -2.31], GLASS_LIT, {
      texture: windowTexture,
    });
    box(`skylight-back-${i}`, [1.3, 0.85, 0.13], [x, 8.82, -2.72], CONCRETE);
  }

  // A few unmistakable brutalist service details.
  for (const x of [-4.8, -3.9, 4.0, 4.9]) {
    box("facade-service-panel", [0.38, 0.82, 0.07], [x, 1.7, 3.85], BLACK, {
      texture: warningTexture,
    });
  }

  // Deliberate concrete beam ends protruding from the right wing.
  for (let i = 0; i < 4; i++) {
    const y = 3.0 + i * 1.12;
    box(`right-wing-beam-${i}`, [3.9, 0.22, 0.5], [4.15, y, 3.76], LIGHT_CONCRETE);
    box(`right-wing-shadow-${i}`, [2.7, 0.06, 0.08], [4.15, y - 0.14, 4.03], BLACK);
  }

  // Tiny roof warning lights and antenna masts keep the silhouette lively without scenery.
  for (const x of [-1.2, 2.4]) {
    cylinder("antenna-base", 0.16, 0.16, [x, 10.16, -0.45], BLACK, 8);
    b.rod([x, 10.2, -0.45], [x, 11.15, -0.45], 0.025, {
      color: FRAME,
      name: "antenna-mast",
    });
    cylinder("antenna-beacon", 0.07, 0.13, [x, 11.22, -0.45], RUST, 8);
  }

  return b.root;
}
