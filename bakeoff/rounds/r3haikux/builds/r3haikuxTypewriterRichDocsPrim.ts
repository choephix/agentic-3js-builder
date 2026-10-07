import * as THREE from "three";
import { arc, bezier, createBuilder, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

type V3 = [number, number, number];

// Palette: glossy racing green, chrome, ebony keys, brass, cream letters and paper.
const GREEN = "#0c4b31";
const CHROME = "#d7dce2";
const KEYTOP = "#1b1d1c";
const BLACK = "#121315";
const BRASS = "#c39b4e";
const BARS = "#b4bbc3";
const CREAM = "#f3e9d2";
const PAPER = "#f4efe1";
const INK = "#2b2820";

const add = (p: V3, d: V3, k: number): V3 => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];
const mix = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dist = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Keyboard deck: a slope from the front edge (z .17, y .10) up to the top housing (z 0, y .175).
const deckAt = (u: number, x: number): V3 => [x, 0.1 + 0.075 * u, 0.17 - 0.17 * u];
const KEY_N: V3 = [0, 0.915, 0.404]; // deck normal: up and toward the operator
const KEY_UP: V3 = [0, 0.404, -0.915]; // up the deck, away from the operator: top of each letter
const KEY_PITCH = 0.0345;
const FRONT_N: V3 = [0, -0.152, 0.988]; // normal of the housing's front face

// Four staggered key rows, front (ZXCV) to back (numbers). Centred rows stagger by half a pitch.
const ROWS: { u: number; keys: string[] }[] = [
  { u: 0.12, keys: "ZXCVBNM,".split("") },
  { u: 0.36, keys: "ASDFGHJKL".split("") },
  { u: 0.6, keys: "QWERTYUIOP".split("") },
  { u: 0.84, keys: "1234567890-".split("") },
];

// Cream letter on a transparent disc, so the dark key cap shows around it.
const keyLetter = (ch: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="45" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="36" font-weight="bold" fill="${CREAM}">${ch}</text></svg>`,
    { size: 80 },
  );

// Platen and paper sheet.
const PLATEN: V3 = [0, 0.345, -0.115];
const PLATEN_R = 0.026;
const SHEET_W = 0.2;
const SHEET_R = PLATEN_R + 0.0014;
const SHEET_BOTTOM = 0.235;

// Type basket and strike point.
const STRIKE: V3 = [0, 0.332, -0.0925];
const BASKET_C: V3 = [0, 0.332, -0.03];
const BASKET_R = 0.11;

// Typed lines: y in mm from the top of the sheet, text, font size.
const TYPED: [number, string, number][] = [
  [13, "THE HARTWELL PRESERVE CO.", 4.6],
  [21, "14 Lantern Row, Bristol", 3.4],
  [34, "3rd March, 1934", 4.2],
  [46, "Mr. J. Halloran,", 4.2],
  [57, "Dear Sir,", 4.2],
  [69, "Thank you for your letter of the", 4.2],
  [77, "third instant. I am pleased to", 4.2],
  [85, "confirm the order for twelve crates", 4.2],
  [93, "of the Ashford pear preserve, to be", 4.2],
  [101, "delivered before the Michaelmas term.", 4.2],
  [109, "Kindly reply by return of post, and", 4.2],
];

const sheetMarkup = (lenMm: number): string => {
  const h = lenMm.toFixed(1);
  const lines = TYPED.map(([y, text, size]) => `<text x="22" y="${y}" font-size="${size}">${text}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 ${h}"><rect width="200" height="${h}" fill="${PAPER}"/><g font-family="'Courier New', Courier, monospace" fill="${INK}">${lines}</g></svg>`;
};

// Paper samples: over the top of the platen from behind, round the front, then down.
type Sample = { p: V3; n: V3 };
const samples: Sample[] = [];
const ARC_STEPS = 14;
for (let k = 0; k <= ARC_STEPS; k++) {
  const a = ((100 - (100 * k) / ARC_STEPS) * Math.PI) / 180;
  const ny = Math.sin(a);
  const nz = Math.cos(a);
  samples.push({ p: [0, PLATEN[1] + SHEET_R * ny, PLATEN[2] + SHEET_R * nz], n: [0, ny, nz] });
}
const HANG_STEPS = 8;
for (let k = 1; k <= HANG_STEPS; k++) {
  const y = PLATEN[1] + (SHEET_BOTTOM - PLATEN[1]) * (k / HANG_STEPS);
  samples.push({ p: [0, y, PLATEN[2] + SHEET_R], n: [0, 0, 1] });
}
const along: number[] = [0];
for (let j = 1; j < samples.length; j++) along.push(along[j - 1] + dist(samples[j - 1].p, samples[j].p));
const sheetLen = along[along.length - 1];

// Build the sheet as one ribbon: u across the width (left to right as seen from the front), v down the length.
const sheetPos: number[] = [];
const sheetNor: number[] = [];
const sheetUv: number[] = [];
const sheetIdx: number[] = [];
samples.forEach((s, j) => {
  const v = 1 - along[j] / sheetLen;
  for (const k of [0, 1]) {
    const x = k === 0 ? -SHEET_W / 2 : SHEET_W / 2;
    sheetPos.push(x, s.p[1], s.p[2]);
    sheetNor.push(s.n[0], s.n[1], s.n[2]);
    sheetUv.push(k, v);
  }
});
for (let j = 0; j < samples.length - 1; j++) {
  const a = 2 * j;
  const b1 = 2 * j + 1;
  const c = 2 * j + 2;
  const d = 2 * j + 3;
  sheetIdx.push(a, c, b1, b1, c, d);
}
const sheetGeo = new THREE.BufferGeometry();
sheetGeo.setAttribute("position", new THREE.Float32BufferAttribute(sheetPos, 3));
sheetGeo.setAttribute("normal", new THREE.Float32BufferAttribute(sheetNor, 3));
sheetGeo.setAttribute("uv", new THREE.Float32BufferAttribute(sheetUv, 2));
sheetGeo.setIndex(sheetIdx);

export default function build() {
  const b = createBuilder({ name: "typewriter-1934" });
  const body = b.joint("body", { at: [0, 0, 0] });

  // Lower housing: one side profile (z, y) pushed out across the width.
  const profile: OutlinePoint[] = [
    [-0.17, 0.035],
    [0.16, 0.035],
    [0.17, 0.1],
    [0, 0.175],
    [-0.03, 0.2],
    [-0.17, 0.2],
  ];
  b.extrude(profile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.4, bevel: 0.01, color: GREEN, bone: body });

  // Rubber feet, bottom on y = 0.
  const FEET: [number, number][] = [
    [-0.15, -0.12],
    [0.15, -0.12],
    [-0.15, 0.11],
    [0.15, 0.11],
  ];
  for (const [x, z] of FEET) {
    b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.04, 12), BLACK, { bone: body, at: [x, 0.02, z] });
  }

  // Brass pinstripes along both sides.
  for (const s of [-1, 1]) {
    b.rod([s * 0.2015, 0.07, -0.15], [s * 0.2015, 0.07, 0.14], 0.0022, { bone: body, color: BRASS });
  }

  // Brass maker's badge on the front face.
  const badgeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 48">
<defs><linearGradient id="br" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ecd594"/><stop offset="0.45" stop-color="#c79c4f"/><stop offset="1" stop-color="#8a5f25"/>
</linearGradient></defs>
<rect x="1" y="1" width="138" height="46" rx="6" fill="url(#br)"/>
<rect x="5" y="5" width="130" height="38" rx="3" fill="none" stroke="#5a3c14" stroke-width="1.5"/>
<text x="70" y="22" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="12" font-weight="bold" letter-spacing="1.5" fill="#37240b">HARTWELL &amp; CO.</text>
<text x="70" y="36" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="7.5" letter-spacing="1" fill="#37240b">LONDON · MODEL 9 · 1934</text>
</svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.07, 0.024), BRASS, {
    bone: body,
    at: [0, 0.0614, 0.166],
    dir: FRONT_N,
    axis: "z",
    texture: badgeTex,
  });

  // Round keys: a chrome rim, a dark cap, and a cream letter, in four staggered rows.
  for (const row of ROWS) {
    const n = row.keys.length;
    row.keys.forEach((label, i) => {
      const x = (i - (n - 1) / 2) * KEY_PITCH;
      const base = deckAt(row.u, x);
      b.part(new THREE.TorusGeometry(0.015, 0.0028, 6, 16), CHROME, {
        bone: body,
        at: add(base, KEY_N, 0.004),
        dir: KEY_N,
        axis: "z",
      });
      b.part(new THREE.CylinderGeometry(0.0135, 0.0145, 0.008, 18), KEYTOP, {
        bone: body,
        at: add(base, KEY_N, 0.007),
        dir: KEY_N,
      });
      b.part(new THREE.CircleGeometry(0.0132, 18), CREAM, {
        bone: body,
        at: add(base, KEY_N, 0.0117),
        dir: KEY_N,
        axis: "z",
        up: KEY_UP,
        texture: keyLetter(label),
      });
    });
  }

  // Platen: a black roller on a carriage, with chrome and black knobs.
  b.part(new THREE.CylinderGeometry(PLATEN_R, PLATEN_R, 0.34, 20), BLACK, { bone: body, at: PLATEN, dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.0115, 0.0115, 0.024, 14), CHROME, {
    bone: body,
    at: [-0.195, PLATEN[1], PLATEN[2]],
    dir: [1, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.0115, 0.0115, 0.024, 14), BLACK, {
    bone: body,
    at: [0.195, PLATEN[1], PLATEN[2]],
    dir: [1, 0, 0],
  });

  // Carriage: green end brackets on a chrome rail.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.012, 0.155, 0.075), GREEN, { bone: body, at: [s * 0.178, 0.283, -0.115] });
  }
  b.rod([-0.18, 0.21, -0.13], [0.18, 0.21, -0.13], 0.0055, { bone: body, color: CHROME });

  // Type basket: a chrome semicircle on two posts, with thin type bars fanning up to the strike point.
  b.sweep(arc(BASKET_C, [BASKET_C[0] - BASKET_R, BASKET_C[1], BASKET_C[2]], [0, 0, 1], 180), 0.0028, {
    bone: body,
    color: CHROME,
  });
  for (const s of [-1, 1]) {
    b.rod([s * BASKET_R, 0.19, BASKET_C[2]], [s * BASKET_R, BASKET_C[1], BASKET_C[2]], 0.003, {
      bone: body,
      color: CHROME,
    });
  }
  for (let i = 0; i < 38; i++) {
    const phi = ((185 + (i * 170) / 37) * Math.PI) / 180;
    const pivot: V3 = [
      BASKET_C[0] + BASKET_R * Math.cos(phi),
      BASKET_C[1] + BASKET_R * Math.sin(phi),
      BASKET_C[2],
    ];
    b.rod(pivot, mix(STRIKE, pivot, 0.1), 0.0017, { bone: body, color: BARS });
  }

  // Paper: a sheet wrapped over the platen and hanging in front, half typed.
  b.part(sheetGeo, PAPER, { bone: body, at: [0, 0, 0], texture: svg(sheetMarkup(sheetLen * 1000), { size: 640 }) });

  // Carriage return lever: a chrome arm on a hinge at the carriage bracket, ending in a black knob.
  const lever = b.joint("returnLever", { parent: body, at: [-0.186, 0.3, -0.1], role: "hinge" });
  const leverEnd: V3 = [-0.214, 0.255, -0.025];
  b.sweep(
    bezier([-0.186, 0.3, -0.1], [-0.206, 0.3, -0.1], [-0.216, 0.28, -0.06], leverEnd),
    0.0042,
    { bone: lever, color: CHROME },
  );
  b.part(new THREE.SphereGeometry(0.0115, 12, 8), BLACK, { bone: lever, at: leverEnd });

  return b.root;
}

export const meta = {
  name: "1934 Typewriter",
  description:
    "A glossy racing-green portable typewriter: round keys with cream letters on chrome rims in four staggered rows, a semicircle of type bars, a black platen with a half-typed letter, a chrome carriage return lever and a brass maker's badge.",
};
