```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, svg } from "agentic-3js-builder";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly ornamented, low-poly Italian piano accordion with iridescent shell panels, burgundy bellows, ivory piano keys, bass buttons, gold trim, grillework and floral inlay.",
};

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-accordion", detail: 1 });

  const INK = "#24151b";
  const EBONY = "#17141a";
  const BURGUNDY = "#551827";
  const BURGUNDY_DARK = "#321019";
  const OXBLOOD = "#741f32";
  const IVORY = "#fff3d0";
  const IVORY_SHADOW = "#d9bd91";
  const GOLD = "#d49a3c";
  const GOLD_LIGHT = "#f4d37c";
  const GOLD_DARK = "#71431d";
  const PEARL_BASE = "#e9d7c1";
  const PEARL_BLUE = "#a8c8d2";
  const PEARL_PINK = "#d8a9b6";
  const PEARL_GREEN = "#a7c5ad";
  const BUTTON = "#b9a37a";
  const BUTTON_DARK = "#59434b";
  const BELLOWS = "#6f2435";
  const BELLOWS_HIGHLIGHT = "#a34b51";

  const pearl = paint((p, n) => {
    const broad = noise(p, 0.11, 17);
    const fine = noise(p, 0.028, 41);
    const wave = 0.5 + 0.5 * Math.sin(p.x * 42 + p.y * 17 + p.z * 31);
    let c = mix(PEARL_BASE, PEARL_BLUE, 0.18 + broad * 0.26);
    c = mix(c, PEARL_PINK, 0.12 * wave + 0.08 * fine);
    c = mix(c, PEARL_GREEN, 0.09 * (1 - wave) * broad);
    if (n.y < -0.45) c = mix(c, "#9a7e86", 0.22);
    if (n.z > 0.7) c = mix(c, "#fff8e8", 0.16);
    return c;
  });

  const pearlShadow = paint((p, n) => {
    const c = noise(p, 0.075, 23);
    return mix("#a9969d", "#e7d0bc", c * 0.62 + (n.y + 1) * 0.12);
  });

  const lacquer = paint((p, n) => {
    const grain = noise(p, 0.055, 8);
    const shine = Math.max(0, n.z) * 0.18 + Math.max(0, n.y) * 0.1;
    return mix(BURGUNDY_DARK, OXBLOOD, grain * 0.75 + shine);
  });

  const bellowsPaint = paint((p, n) => {
    const band = 0.5 + 0.5 * Math.sin(p.x * 155);
    const shade = Math.max(0, n.z) * 0.16 + Math.max(0, n.y) * 0.08;
    return mix(BURGUNDY_DARK, BELLOWS_HIGHLIGHT, band * 0.38 + shade);
  });

  const goldPaint = paint((p, n) => {
    const shimmer = noise(p, 0.025, 72);
    return mix(GOLD, GOLD_LIGHT, shimmer * 0.48 + Math.max(0, n.y) * 0.28);
  });

  const shellFiligree = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 280">
      <g fill="none" stroke="#f7d98a" stroke-width="4" stroke-linecap="round">
        <path d="M90 265 C35 235 35 175 90 140 C145 105 145 45 90 15"/>
        <path d="M90 265 C145 235 145 175 90 140 C35 105 35 45 90 15"/>
        <path d="M90 210 C60 190 60 160 90 140 C120 120 120 85 90 65"/>
        <path d="M90 210 C120 190 120 160 90 140 C60 120 60 85 90 65"/>
      </g>
      <g fill="#c9824e" stroke="#fff0ac" stroke-width="2">
        <ellipse cx="90" cy="140" rx="13" ry="22"/>
        <ellipse cx="57" cy="107" rx="8" ry="15" transform="rotate(-42 57 107)"/>
        <ellipse cx="123" cy="107" rx="8" ry="15" transform="rotate(42 123 107)"/>
        <ellipse cx="56" cy="173" rx="8" ry="15" transform="rotate(42 56 173)"/>
        <ellipse cx="124" cy="173" rx="8" ry="15" transform="rotate(-42 124 173)"/>
      </g>
      <circle cx="90" cy="140" r="28" fill="none" stroke="#fff0ac" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const sideFiligree = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 160">
      <g fill="none" stroke="#f8db8d" stroke-width="4">
        <path d="M15 80 Q45 12 82 80 T150 80 T205 80"/>
        <path d="M15 105 Q45 38 82 105 T150 105 T205 105"/>
      </g>
      <g fill="#b96b48" stroke="#ffe7a0" stroke-width="2">
        <circle cx="45" cy="58" r="9"/><circle cx="110" cy="80" r="11"/>
        <circle cx="175" cy="102" r="9"/>
      </g>
    </svg>`,
    { size: 192 },
  );

  const grilleTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210">
      <rect width="180" height="210" rx="16" fill="#29151d"/>
      <g fill="none" stroke="#d5a754" stroke-width="5">
        <path d="M12 34 Q45 8 78 34 T168 34"/>
        <path d="M12 76 Q45 50 78 76 T168 76"/>
        <path d="M12 118 Q45 92 78 118 T168 118"/>
        <path d="M12 160 Q45 134 78 160 T168 160"/>
        <path d="M12 202 Q45 176 78 202 T168 202"/>
      </g>
      <g fill="#8b3143">
        <circle cx="43" cy="34" r="7"/><circle cx="111" cy="76" r="7"/>
        <circle cx="65" cy="118" r="7"/><circle cx="135" cy="160" r="7"/>
      </g>
    </svg>`,
    { size: 192 },
  );

  const tricolor = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
      <path d="M10 10 H110 V70 H10 Z" fill="#f8eee0" stroke="#d0a24a" stroke-width="4"/>
      <path d="M16 16 H50 V64 H16 Z" fill="#198754"/>
      <path d="M70 16 H104 V64 H70 Z" fill="#c52c3c"/>
      <circle cx="60" cy="40" r="16" fill="#e2b450"/>
      <path d="M60 24 l4 10 11 1-8 7 3 11-10-6-10 6 3-11-8-7 11-1z" fill="#fff2b5"/>
    </svg>`,
    { size: 160 },
  );

  function part(
    geometry: THREE.BufferGeometry,
    color: any,
    at: [number, number, number],
    options: Record<string, any> = {},
  ) {
    return b.part(geometry, color, { at, flat: true, ...options });
  }

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    options: Record<string, any> = {},
  ) {
    return part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, options);
  }

  function cylinder(
    radius: number,
    depth: number,
    at: [number, number, number],
    color: any,
    sides = 10,
    options: Record<string, any> = {},
  ) {
    return part(
      new THREE.CylinderGeometry(radius, radius, depth, sides, 1),
      color,
      at,
      { dir: [0, 0, 1], ...options },
    );
  }

  function sphere(
    radius: number,
    at: [number, number, number],
    color: any,
    options: Record<string, any> = {},
  ) {
    return part(new THREE.SphereGeometry(radius, 10, 6), color, at, options);
  }

  function frontPanel(
    size: [number, number],
    at: [number, number, number],
    texture: THREE.Texture,
    options: Record<string, any> = {},
  ) {
    return part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", at, {
      dir: [0, 0, 1],
      axis: "z",
      texture,
      ...options,
    });
  }

  // Main left and right wooden shells.
  box([0.165, 0.49, 0.19], [-0.205, 0.35, 0], lacquer);
  box([0.165, 0.49, 0.19], [0.205, 0.35, 0], lacquer);

  // Raised mother-of-pearl faceplates.
  box([0.145, 0.445, 0.018], [-0.205, 0.35, 0.102], pearl);
  box([0.145, 0.445, 0.018], [0.205, 0.35, 0.102], pearlShadow);

  // Deep side walls and bottom feet.
  box([0.025, 0.50, 0.205], [-0.292, 0.35, 0], BURGUNDY_DARK);
  box([0.025, 0.50, 0.205], [0.292, 0.35, 0], BURGUNDY_DARK);
  box([0.19, 0.035, 0.21], [-0.205, 0.095, 0], GOLD_DARK);
  box([0.19, 0.035, 0.21], [0.205, 0.095, 0], GOLD_DARK);

  // Gold rails around each shell.
  for (const x of [-0.205, 0.205]) {
    box([0.155, 0.014, 0.024], [x, 0.125, 0.108], goldPaint);
    box([0.155, 0.014, 0.024], [x, 0.575, 0.108], goldPaint);
    box([0.014, 0.46, 0.024], [x - 0.071, 0.35, 0.108], goldPaint);
    box([0.014, 0.46, 0.024], [x + 0.071, 0.35, 0.108], goldPaint);
  }

  // Back shell glimpses and shoulder caps.
  box([0.155, 0.445, 0.025], [-0.205, 0.35, -0.105], BURGUNDY);
  box([0.155, 0.445, 0.025], [0.205, 0.35, -0.105], BURGUNDY);
  for (const x of [-0.27, 0.27]) {
    sphere(0.022, [x, 0.59, 0.04], goldPaint);
    sphere(0.022, [x, 0.11, 0.04], goldPaint);
  }

  // Bellows, visible between the two cases.
  box([0.16, 0.39, 0.145], [0, 0.35, -0.005], bellowsPaint);
  for (let i = 0; i < 9; i++) {
    const x = -0.082 + i * 0.0205;
    box([0.008, 0.405, 0.164], [x, 0.35, 0.018], GOLD_DARK);
    box([0.003, 0.385, 0.169], [x + 0.005, 0.35, 0.022], BELLOWS);
  }
  for (const y of [0.145, 0.555]) {
    box([0.18, 0.018, 0.18], [0, y, 0.02], goldPaint);
    box([0.18, 0.009, 0.185], [0, y + (y < 0.3 ? -0.014 : 0.014), 0.022], BURGUNDY_DARK);
  }

  // Bellows corner leather tabs.
  for (const x of [-0.095, 0.095]) {
    for (const y of [0.17, 0.53]) {
      box([0.018, 0.052, 0.012], [x, y, 0.103], BURGUNDY_DARK);
      sphere(0.009, [x, y - 0.018, 0.114], GOLD);
    }
  }

  // Floral inlay on both mother-of-pearl panels.
  frontPanel([0.105, 0.205], [-0.205, 0.35, 0.114], shellFiligree);
  frontPanel([0.105, 0.205], [0.205, 0.35, 0.114], shellFiligree, { mirror: true });
  frontPanel([0.108, 0.078], [-0.205, 0.19, 0.116], sideFiligree);
  frontPanel([0.108, 0.078], [-0.205, 0.51, 0.116], sideFiligree, { mirror: true });

  // Italian tricolor medallion and upper crest.
  cylinder(0.036, 0.008, [-0.205, 0.35, 0.126], goldPaint, 16);
  frontPanel([0.050, 0.033], [-0.205, 0.35, 0.132], tricolor);
  box([0.09, 0.012, 0.018], [0.205, 0.60, 0.114], goldPaint);
  box([0.06, 0.008, 0.014], [0.205, 0.618, 0.115], GOLD_DARK);

  // Left-hand grille with a heavy gold frame.
  box([0.112, 0.142, 0.011], [-0.205, 0.245, 0.123], GOLD_DARK);
  frontPanel([0.095, 0.125], [-0.205, 0.245, 0.132], grilleTexture);
  box([0.125, 0.009, 0.016], [-0.205, 0.167, 0.138], goldPaint);
  box([0.125, 0.009, 0.016], [-0.205, 0.323, 0.138], goldPaint);

  // Bass button board inset.
  box([0.123, 0.20, 0.012], [-0.205, 0.425, 0.125], BURGUNDY_DARK);
  box([0.105, 0.182, 0.006], [-0.205, 0.425, 0.134], lacquer);

  const bassRows = [
    { y: 0.35, xs: [-0.242, -0.205, -0.168] },
    { y: 0.405, xs: [-0.242, -0.205, -0.168] },
    { y: 0.46, xs: [-0.242, -0.205, -0.168] },
    { y: 0.515, xs: [-0.242, -0.205, -0.168] },
  ];
  for (let r = 0; r < bassRows.length; r++) {
    for (let c = 0; c < bassRows[r].xs.length; c++) {
      const x = bassRows[r].xs[c];
      const y = bassRows[r].y;
      cylinder(0.014, 0.011, [x, y, 0.145], c === 1 ? IVORY : BUTTON, 12);
      cylinder(0.009, 0.004, [x, y, 0.153], c === 1 ? GOLD_LIGHT : BUTTON_DARK, 10);
      sphere(0.004, [x - 0.003, y + 0.004, 0.157], "#fff2cf");
    }
  }

  // Decorative bass-side studs.
  for (const y of [0.18, 0.57]) {
    for (const x of [-0.255, -0.155]) {
      cylinder(0.008, 0.008, [x, y, 0.132], GOLD_LIGHT, 8);
    }
  }

  // Keyboard escutcheon and piano keys on the right case.
  box([0.128, 0.412, 0.014], [0.205, 0.36, 0.129], EBONY);
  box([0.116, 0.398, 0.008], [0.205, 0.36, 0.139], GOLD_DARK);

  const whiteCount = 10;
  const whiteH = 0.037;
  const whiteStart = 0.178;
  for (let i = 0; i < whiteCount; i++) {
    const y = whiteStart + i * 0.0405;
    box([0.096, whiteH, 0.026], [0.205, y, 0.157], i % 2 ? IVORY : "#fff8e5");
    box([0.096, 0.004, 0.029], [0.205, y - whiteH / 2 + 0.002, 0.173], IVORY_SHADOW);
  }

  const blackPositions = [0.198, 0.239, 0.320, 0.360, 0.401, 0.482, 0.522];
  for (const y of blackPositions) {
    box([0.060, 0.024, 0.041], [0.195, y, 0.180], EBONY);
    box([0.054, 0.008, 0.008], [0.195, y + 0.006, 0.201], "#453742");
  }

  // Gold separator at the keyboard's outer edge.
  box([0.010, 0.408, 0.032], [0.267, 0.36, 0.155], goldPaint);
  box([0.014, 0.408, 0.012], [0.145, 0.36, 0.151], GOLD_DARK);

  // Tiny mother-of-pearl key-end markers.
  for (let i = 0; i < whiteCount; i++) {
    const y = whiteStart + i * 0.0405;
    sphere(0.004, [0.248, y, 0.176], i % 3 === 0 ? PEARL_PINK : PEARL_BLUE);
  }

  // Shoulder strap anchors and leather strap glimpses.
  box([0.028, 0.075, 0.018], [-0.26, 0.64, -0.015], BURGUNDY_DARK);
  box([0.028, 0.075, 0.018], [0.26, 0.64, -0.015], BURGUNDY_DARK);
  cylinder(0.014, 0.009, [-0.26, 0.64, 0.012], GOLD_LIGHT, 10);
  cylinder(0.014, 0.009, [0.26, 0.64, 0.012], GOLD_LIGHT, 10);
  box([0.035, 0.30, 0.018], [-0.265, 0.40, -0.13], BURGUNDY_DARK);
  box([0.035, 0.30, 0.018], [0.265, 0.40, -0.13], BURGUNDY_DARK);

  // Side pearl plaques, seen around the cases.
  for (const x of [-0.296, 0.296]) {
    box([0.008, 0.25, 0.12], [x, 0.36, 0.02], pearlShadow);
    box([0.011, 0.19, 0.07], [x + (x < 0 ? -0.006 : 0.006), 0.36, 0.03], pearl);
  }

  // Corner rivets across the instrument.
  for (const x of [-0.278, -0.132, 0.132, 0.278]) {
    for (const y of [0.13, 0.57]) {
      sphere(0.007, [x, y, 0.125], GOLD_LIGHT);
    }
  }

  // A few dark ventilation slots over the grille, giving it physical depth.
  for (let i = 0; i < 5; i++) {
    box([0.075, 0.004, 0.004], [-0.205, 0.195 + i * 0.024, 0.143], INK);
  }

  return b.root;
}
```