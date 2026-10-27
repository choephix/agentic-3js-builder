import * as THREE from "three";
import { createBuilder, rng, svg, mottle, grain } from "../../../../src/index";

export const meta = {
  name: "brutalist housing block",
  description: "A raw-concrete brutalist housing slab with deep loggias, repetitive windows, service cores, rooftop tanks, rails, vents, entry canopy, and weathered architectural detail.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = mottle("#777873", "#5b5d5a", { size: 0.42, contrast: 1.35, seed: 19 });
  const LIGHT_CONCRETE = mottle("#989994", "#6e716d", { size: 0.34, contrast: 1.15, seed: 23 });
  const DARK_CONCRETE = mottle("#4d504d", "#343836", { size: 0.25, contrast: 1.4, seed: 31 });
  const WOOD_FORM = grain("#4c4d49", "#777871", { size: 0.045, axis: "y", seed: 6 });

  const GLASS = "#17252a";
  const GLASS_LIGHT = "#32464a";
  const METAL = "#292c2c";
  const RAIL = "#424541";
  const DOOR = "#272b2b";
  const AMBER = "#c37d35";
  const RED = "#773d32";
  const WHITE = "#d5d4c9";

  const windowTex = svg(
    `<svg viewBox="0 0 128 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="160" fill="#17252a"/>
      <rect x="7" y="7" width="114" height="146" fill="#273a3e" stroke="#101719" stroke-width="5"/>
      <path d="M10 43H118M10 83H118M10 122H118M64 8V152" stroke="#698080" stroke-width="3" opacity=".48"/>
      <path d="M14 18L53 48M76 10L116 39M15 111L54 140" stroke="#b1c2bc" stroke-width="2" opacity=".18"/>
      <rect x="10" y="132" width="108" height="18" fill="#101719" opacity=".45"/>
    </svg>`,
    { size: 192 },
  );

  const narrowWindowTex = svg(
    `<svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="160" fill="#142226"/>
      <rect x="6" y="6" width="68" height="148" fill="#2e4648" stroke="#0d1315" stroke-width="5"/>
      <path d="M10 52H70M10 101H70M40 7V153" stroke="#8ca09b" stroke-width="2" opacity=".38"/>
    </svg>`,
    { size: 160 },
  );

  const entryTex = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#242a29"/>
      <rect x="22" y="15" width="212" height="226" fill="#121718" stroke="#9c9b88" stroke-width="7"/>
      <rect x="43" y="35" width="170" height="115" fill="#263b3c"/>
      <path d="M43 85H213M128 35V150" stroke="#93a8a0" stroke-width="5" opacity=".55"/>
      <rect x="43" y="166" width="170" height="50" fill="#9a693f"/>
      <circle cx="184" cy="190" r="5" fill="#ddd1a0"/>
      <text x="128" y="233" text-anchor="middle" font-family="sans-serif" font-size="12" letter-spacing="3" fill="#d7d4bd">BLOCK 07</text>
    </svg>`,
    { size: 256 },
  );

  const graffitiTex = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="128" fill="#6a6b66"/>
      <path d="M18 98 Q32 24 54 84 T91 43 T127 87 T164 32 T205 80 T241 30" fill="none" stroke="#9c4036" stroke-width="12" opacity=".8"/>
      <path d="M25 105 Q46 49 68 92 T112 57 T148 96 T188 50 T229 88" fill="none" stroke="#d18a3d" stroke-width="4"/>
      <text x="128" y="35" text-anchor="middle" font-family="sans-serif" font-size="19" font-weight="bold" letter-spacing="7" fill="#252b29">CONCRETE / COMMONS</text>
    </svg>`,
    { size: 256 },
  );

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: any = CONCRETE,
    name = "concrete-block",
    texture?: THREE.Texture,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      flat: true,
      texture,
      name,
      group: "architecture",
    });
  }

  function cyl(
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    name: string,
    segments = 10,
    dir: [number, number, number] = [0, 1, 0],
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      flat: true,
      name,
      group: "architecture",
    });
  }

  function rod(
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    name: string,
  ) {
    return b.rod(a, c, radius, { color, name, group: "architecture", caps: "flat" });
  }

  function frontWindow(
    x: number,
    y: number,
    w: number,
    h: number,
    texture = windowTex,
    name = "recessed-window",
  ) {
    box([w, h, 0.065], [x, y, 1.656], GLASS, name, texture);
    box([0.045, h + 0.1, 0.09], [x - w / 2 - 0.045, y, 1.69], CONCRETE, "window-jamb");
    box([0.045, h + 0.1, 0.09], [x + w / 2 + 0.045, y, 1.69], CONCRETE, "window-jamb");
    box([w + 0.14, 0.07, 0.1], [x, y + h / 2 + 0.06, 1.69], CONCRETE, "window-lintel");
    box([w + 0.14, 0.07, 0.1], [x, y - h / 2 - 0.06, 1.69], DARK_CONCRETE, "window-sill");
    box([0.025, h - 0.07, 0.082], [x, y, 1.705], METAL, "window-mullion");
  }

  // Low, heavy plinth and a simple paved forecourt.
  box([6.9, 0.18, 4.15], [0, 0.09, 0], DARK_CONCRETE, "foundation-plinth");
  box([7.8, 0.07, 5.1], [0, 0.035, 0.15], "#555754", "paved-forecourt");

  // Hairline expansion joints in the paving.
  for (const x of [-3.1, -1.55, 0, 1.55, 3.1]) {
    box([0.018, 0.012, 4.7], [x, 0.077, 0.18], "#353936", "paving-joint");
  }
  for (const z of [-1.8, -0.6, 0.6, 1.8]) {
    box([7.2, 0.012, 0.018], [0, 0.078, z], "#353936", "paving-joint");
  }

  // The massive slab, with slightly projecting end walls.
  box([6.05, 6.05, 3.22], [0, 3.28, 0], CONCRETE, "main-housing-slab");
  box([0.28, 5.8, 3.42], [-3.16, 3.35, 0], DARK_CONCRETE, "left-end-wall");
  box([0.28, 5.8, 3.42], [3.16, 3.35, 0], DARK_CONCRETE, "right-end-wall");

  // A deep horizontal datum band makes the facade read as stacked concrete plates.
  for (const y of [0.68, 2.02, 3.36, 4.70, 6.04]) {
    box([6.45, 0.18, 3.38], [0, y, 0.02], LIGHT_CONCRETE, "floor-band");
  }

  // Front loggias: broad cantilevered slabs and heavy side fins.
  const bayXs = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
  const floorYs = [0.86, 2.20, 3.54, 4.88];
  for (let level = 0; level < floorYs.length; level++) {
    const y = floorYs[level];
    for (let i = 0; i < bayXs.length; i++) {
      const x = bayXs[i];
      if ((level + i) % 3 !== 1) {
        box([0.92, 0.13, 0.78], [x, y - 0.46, 1.99], LIGHT_CONCRETE, "balcony-slab");
        box([0.08, 0.92, 0.22], [x - 0.48, y - 0.06, 2.26], CONCRETE, "balcony-edge");
        box([0.08, 0.92, 0.22], [x + 0.48, y - 0.06, 2.26], CONCRETE, "balcony-edge");
        box([0.92, 0.09, 0.16], [x, y - 0.5, 2.27], CONCRETE, "balcony-front-beam");

        for (const rx of [-0.35, 0, 0.35]) {
          rod([x + rx, y - 0.43, 2.28], [x + rx, y + 0.24, 2.28], 0.018, RAIL, "balcony-rail");
        }
        rod([x - 0.43, y + 0.24, 2.28], [x + 0.43, y + 0.24, 2.28], 0.022, RAIL, "balcony-handrail");
      }
    }
  }

  // Recessed windows behind and between the projecting balconies.
  for (let level = 0; level < floorYs.length; level++) {
    const y = floorYs[level];
    for (let i = 0; i < bayXs.length; i++) {
      const x = bayXs[i];
      const balcony = (level + i) % 3 !== 1;
      const wy = y + 0.05;
      const ww = balcony ? 0.68 : 0.78;
      const wh = balcony ? 0.67 : 0.88;
      frontWindow(x, wy, ww, wh, i % 2 ? windowTex : narrowWindowTex);
      if (!balcony) {
        box([0.82, 0.11, 0.16], [x, y - 0.42, 1.77], CONCRETE, "deep-window-reveal");
      }
    }
  }

  // End-wall slit windows, intentionally narrow and repetitive.
  for (const side of [-1, 1]) {
    for (let level = 0; level < 4; level++) {
      const y = floorYs[level] + 0.03;
      for (let j = 0; j < 2; j++) {
        const z = -0.9 + j * 1.25;
        box([0.055, 0.72, 0.53], [side * 3.315, y, z], GLASS, "end-wall-slit", narrowWindowTex);
        box([0.09, 0.82, 0.08], [side * 3.35, y, z - 0.33], DARK_CONCRETE, "slit-sill");
      }
    }
  }

  // Tall vertical concrete blades interrupt the long frontage and reinforce the brutalist rhythm.
  for (const x of [-3.02, -2.0, -1.0, 0, 1.0, 2.0, 3.02]) {
    box([0.12, 5.3, 0.27], [x, 3.34, 1.73], LIGHT_CONCRETE, "vertical-facade-blade");
  }

  // Entrance bay: an oversized shadowed void, canopy, and stair-like cheek walls.
  box([1.22, 1.88, 0.13], [0, 1.2, 1.704], DOOR, "main-entry", entryTex);
  box([1.52, 0.26, 0.7], [0, 2.17, 1.92], LIGHT_CONCRETE, "entry-canopy");
  box([0.2, 1.9, 0.78], [-0.78, 1.2, 1.83], DARK_CONCRETE, "entry-cheek");
  box([0.2, 1.9, 0.78], [0.78, 1.2, 1.83], DARK_CONCRETE, "entry-cheek");
  box([1.36, 0.08, 0.12], [0, 0.27, 1.78], AMBER, "entry-threshold");

  // Intercom and a graphic panel beside the entrance.
  box([0.24, 0.5, 0.025], [0.91, 1.35, 1.91], METAL, "intercom-panel");
  for (let i = 0; i < 5; i++) {
    cyl(0.018, 0.015, [0.91, 1.52 - i * 0.075, 1.94], AMBER, "intercom-button", 8, [0, 0, 1]);
  }
  box([1.22, 0.58, 0.025], [-1.15, 1.22, 1.91], "#777873", "graffiti-panel", graffitiTex);

  // Side service stair/core emerging above the roof line.
  box([1.25, 1.05, 1.2], [-1.95, 6.72, -0.2], DARK_CONCRETE, "rooftop-service-core");
  box([1.45, 0.16, 1.36], [-1.95, 7.27, -0.2], LIGHT_CONCRETE, "service-core-cap");
  for (let i = 0; i < 3; i++) {
    box([0.52, 0.14, 0.035], [-1.95, 6.52 + i * 0.24, 0.417], GLASS, "service-window");
  }

  // Roof parapet, set back to create a heavy sawtooth silhouette.
  box([6.45, 0.38, 0.22], [0, 6.42, 1.56], LIGHT_CONCRETE, "front-parapet");
  box([6.45, 0.38, 0.22], [0, 6.42, -1.56], LIGHT_CONCRETE, "back-parapet");
  box([0.22, 0.38, 3.35], [-3.12, 6.42, 0], LIGHT_CONCRETE, "parapet-end");
  box([0.22, 0.38, 3.35], [3.12, 6.42, 0], LIGHT_CONCRETE, "parapet-end");

  // Rooftop ventilation sheds and angular clerestory teeth.
  for (const x of [-1.1, 0, 1.1]) {
    box([0.76, 0.55, 0.9], [x, 6.72, -0.55], CONCRETE, "roof-vent-house");
    box([0.82, 0.08, 0.94], [x, 7.02, -0.55], DARK_CONCRETE, "roof-vent-cap");
    for (let j = 0; j < 4; j++) {
      box([0.055, 0.3, 0.03], [x - 0.25 + j * 0.17, 6.76, -1.02], METAL, "vent-louver");
    }
  }

  // Two low cylindrical water tanks on the roof, with collars, feet, and pipework.
  for (const x of [1.72, 2.42]) {
    cyl(0.32, 0.72, [x, 6.86, -0.45], DARK_CONCRETE, "water-tank", 12);
    cyl(0.34, 0.06, [x, 7.23, -0.45], LIGHT_CONCRETE, "tank-lid", 12);
    cyl(0.11, 0.12, [x, 7.32, -0.45], METAL, "tank-cap", 8);
    for (const px of [-0.22, 0.22]) {
      box([0.08, 0.18, 0.08], [x + px, 6.38, -0.45], METAL, "tank-foot");
    }
  }
  rod([1.72, 7.32, -0.45], [2.42, 7.32, -0.45], 0.025, METAL, "roof-pipe");
  rod([2.42, 7.32, -0.45], [2.42, 6.4, -0.45], 0.025, METAL, "downpipe");

  // Rooftop maintenance access ladder and safety rail.
  rod([2.85, 6.48, 0.55], [2.85, 7.35, 0.55], 0.025, RAIL, "ladder-side");
  rod([3.1, 6.48, 0.55], [3.1, 7.35, 0.55], 0.025, RAIL, "ladder-side");
  for (let i = 0; i < 5; i++) {
    rod([2.85, 6.6 + i * 0.16, 0.55], [3.1, 6.6 + i * 0.16, 0.55], 0.018, RAIL, "ladder-rung");
  }
  rod([1.02, 6.63, 1.34], [2.85, 6.63, 1.34], 0.025, RAIL, "roof-safety-rail");
  for (const x of [1.02, 1.62, 2.22, 2.85]) {
    rod([x, 6.42, 1.34], [x, 6.63, 1.34], 0.018, RAIL, "roof-rail-post");
  }

  // Rear fire-escape balconies, visible around the side silhouette.
  for (const level of [1.18, 2.52, 3.86, 5.2]) {
    box([2.0, 0.12, 0.72], [2.15, level - 0.42, -1.93], CONCRETE, "rear-balcony-slab");
    rod([1.2, level + 0.18, -2.31], [3.1, level + 0.18, -2.31], 0.022, RAIL, "rear-rail-top");
    for (const x of [1.25, 1.72, 2.2, 2.68, 3.05]) {
      rod([x, level - 0.42, -2.31], [x, level + 0.18, -2.31], 0.016, RAIL, "rear-rail-post");
    }
  }

  // A few chunky air-conditioning boxes and drain pipes prevent the slab from feeling sterile.
  for (const [x, y, z] of [
    [-2.62, 1.18, 1.88],
    [1.62, 2.52, 1.88],
    [-1.62, 3.86, 1.88],
    [2.62, 5.2, 1.88],
  ] as [number, number, number][]) {
    box([0.42, 0.3, 0.25], [x, y, z], DARK_CONCRETE, "air-conditioner");
    for (let j = 0; j < 4; j++) {
      box([0.018, 0.19, 0.02], [x - 0.12 + j * 0.08, y, z + 0.132], METAL, "ac-grille");
    }
    rod([x + 0.2, y - 0.15, z], [x + 0.2, y - 0.52, z], 0.012, METAL, "ac-drain");
  }

  // Vertical rainwater pipes and oversized concrete downspout collars.
  for (const x of [-2.92, 2.92]) {
    rod([x, 0.36, 1.72], [x, 6.25, 1.72], 0.035, METAL, "rainwater-pipe");
    for (const y of [1.05, 2.39, 3.73, 5.07]) {
      cyl(0.07, 0.18, [x, y, 1.72], DARK_CONCRETE, "pipe-collar", 8, [0, 0, 1]);
    }
  }

  // Deep foundation steps at the public entry.
  for (let i = 0; i < 3; i++) {
    box([1.75 - i * 0.18, 0.12, 0.42], [0, 0.22 + i * 0.12, 2.02 + i * 0.11], CONCRETE, "entry-step");
  }

  // Scattered bolt heads, form-tie scars, and facade patches: small details with architectural purpose.
  const tiePoints: [number, number, number][] = [
    [-2.78, 5.72, 1.69], [-1.92, 5.72, 1.69], [-0.84, 5.72, 1.69],
    [0.72, 5.72, 1.69], [1.86, 5.72, 1.69], [2.75, 5.72, 1.69],
    [-2.82, 0.48, 1.69], [-1.42, 0.48, 1.69], [0.16, 0.48, 1.69],
    [1.55, 0.48, 1.69], [2.78, 0.48, 1.69],
  ];
  for (const p of tiePoints) cyl(0.035, 0.018, p, DARK_CONCRETE, "form-tie-scar", 8, [0, 0, 1]);

  // A final roof datum slab gives the building its unmistakable heavy horizontal crown.
  box([6.7, 0.16, 3.55], [0, 6.25, 0], WOOD_FORM, "roof-crown-slab");

  // A restrained pair of rooftop warning lights, the only bright accents.
  for (const x of [-2.55, 2.55]) {
    cyl(0.055, 0.12, [x, 6.52, -1.18], METAL, "warning-light-base", 8);
    cyl(0.042, 0.07, [x, 6.62, -1.18], RED, "warning-light", 8);
  }

  return b.root;
}
