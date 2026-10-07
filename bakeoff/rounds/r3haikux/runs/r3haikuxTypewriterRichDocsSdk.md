```ts
import * as THREE from "three";
import { catmull, createBuilder, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Typewriter",
  description:
    "A 1930s racing-green typewriter: round cream-lettered keys on chrome rims in four staggered rows, a fan of type bars, a black platen with a half-typed sheet, a chrome carriage return lever and a brass maker's badge.",
};

type V = [number, number, number];

const GREEN = "#0c5030";
const GREEN_DARK = "#06291a";
const CHROME = "#d5dadf";
const STEEL = "#8c939a";
const KEY = "#17191a";
const BLACK = "#101110";
const RUBBER = "#0b0d0b";
const BRASS = "#b8893c";
const WHITE = "#ffffff";

// Keybed: a slope from the front lip up to the back of the frame.
const DECK_Z_FRONT = 0.165;
const DECK_Y_FRONT = 0.1;
const DECK_Z_BACK = -0.03;
const DECK_Y_BACK = 0.149;
const DECK_SLOPE = (DECK_Y_BACK - DECK_Y_FRONT) / (DECK_Z_FRONT - DECK_Z_BACK);
const deckY = (z: number) => DECK_Y_FRONT + (DECK_Z_FRONT - z) * DECK_SLOPE;

// Platen and carriage.
const PLATEN_C: V = [0, 0.205, -0.05];
const PLATEN_R = 0.024;

// Paper: tangent to the front of the platen, leaning back 14 degrees.
const TILT = (14 * Math.PI) / 180;
const PAPER_UP: V = [0, Math.cos(TILT), -Math.sin(TILT)];
const PAPER_FACE: V = [0, Math.sin(TILT), Math.cos(TILT)];
const PAPER_W = 0.19;
const PAPER_H = 0.21;

// Type-bar fan: heads on a shallow arc just under the platen.
const FAN_HALF = 0.092;
const FAN_R = 0.13;
const FAN_TOP = 0.19;
const FAN_Z = -0.012;

const add = (p: V, d: V, k: number): V => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

function roundRect(w: number, h: number, r: number): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, 90],
    [-w / 2 + r, -h / 2 + r, 180],
    [w / 2 - r, -h / 2 + r, 270],
  ];
  for (const [cx, cy, start] of corners)
    for (let i = 0; i <= 3; i++) {
      const a = ((start + i * 30) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  return pts;
}

const keyCap = (ch: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#17191a"/><text x="50" y="68" text-anchor="middle" font-family="Courier New, Courier, monospace" font-size="60" font-weight="bold" fill="#f1e6c8">${ch}</text></svg>`,
    { size: 96 },
  );

const PAPER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 880">
<rect width="800" height="880" fill="#f4ecd6"/>
<line x1="72" y1="0" x2="72" y2="880" stroke="#c98a7d" stroke-width="3"/>
<g font-family="Courier New, Courier, monospace" font-size="25" fill="#2b2620">
<text x="700" y="70" text-anchor="end">14 March 1936</text>
<text x="100" y="130">Dear Mr. Halloway,</text>
<text x="100" y="210">Thank you for your letter of the 3rd.</text>
<text x="100" y="250">The crates arrived in good order on</text>
<text x="100" y="290">Tuesday, exactly as you described them.</text>
<text x="100" y="330">I have set the second invoice aside for</text>
<text x="100" y="370">Friday's post, and would be glad to</text>
<text x="100" y="410">discuss the spring terms when you</text>
</g>
</svg>`;

const BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 340">
<rect width="920" height="340" fill="#c99a45"/>
<rect x="24" y="24" width="872" height="292" rx="22" fill="none" stroke="#5a3b12" stroke-width="8"/>
<text x="460" y="176" text-anchor="middle" font-family="Georgia, serif" font-size="84" font-weight="bold" fill="#3a2508">HALDANE &amp; WREN</text>
<text x="460" y="262" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#3a2508">NO. 6 STANDARD · MADE IN ENGLAND</text>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const chassis = b.joint("chassis", { at: [0, 0, 0] });

  // Body: one side profile thrown across the width (x = ±0.2).
  const side: OutlinePoint[] = [
    [DECK_Z_FRONT, 0.02],
    [DECK_Z_FRONT, DECK_Y_FRONT],
    [DECK_Z_BACK, DECK_Y_BACK],
    [-0.16, DECK_Y_BACK],
    [-0.16, 0.02],
  ];
  b.extrude(side, {
    at: [0, 0, 0],
    thickness: 0.4,
    bevel: 0.006,
    color: GREEN,
    bone: chassis,
    name: "housing",
  });

  // Rubber feet.
  for (const x of [-0.16, 0.16])
    for (const z of [-0.12, 0.12])
      b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.02, 10), RUBBER, {
        at: [x, 0.01, z],
        bone: chassis,
        group: "feet",
      });

  // Chrome lip along the front of the keybed and along the rear top.
  b.rod([-0.19, DECK_Y_FRONT, 0.1655], [0.19, DECK_Y_FRONT, 0.1655], 0.0025, {
    color: CHROME,
    bone: chassis,
    group: "trim",
  });
  b.rod([-0.19, DECK_Y_BACK, -0.158], [0.19, DECK_Y_BACK, -0.158], 0.0025, {
    color: CHROME,
    bone: chassis,
    group: "trim",
  });

  // Brass pinstripes on both flanks, racing-green style.
  for (const s of [1, -1])
    b.rod([s * 0.2005, 0.072, -0.15], [s * 0.2005, 0.072, 0.155], 0.0018, {
      color: BRASS,
      bone: chassis,
      group: "pinstripe",
    });

  // Maker's badge on the front wall.
  b.extrude(roundRect(0.088, 0.035, 0.005), {
    at: [0, 0.058, 0.165],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.005,
    color: BRASS,
    bone: chassis,
    name: "badge plate",
  });
  b.part(new THREE.PlaneGeometry(0.084, 0.031), BRASS, {
    at: [0, 0.058, 0.1678],
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    texture: svg(BADGE_SVG, { size: 512 }),
    bone: chassis,
    name: "badge",
  });
  for (const [sx, sy] of [
    [-0.038, 0.0705],
    [0.038, 0.0705],
    [-0.038, 0.0455],
    [0.038, 0.0455],
  ])
    b.part(new THREE.SphereGeometry(0.0028, 6, 4), CHROME, {
      at: [sx, sy, 0.1685],
      bone: chassis,
      group: "badge screws",
    });

  // Keys: four staggered rows, each key a dark cap with a chrome rim.
  const PITCH = 0.032;
  const ROW_STEP = 0.03;
  const FRONT_Z = 0.136;
  const rows = [
    { chars: "1234567890", shift: 0.45 },
    { chars: "QWERTYUIOP", shift: 0.15 },
    { chars: "ASDFGHJKL", shift: -0.15 },
    { chars: "ZXCVBNM,.", shift: -0.45 },
  ];
  const keys: { ch: string; x: number; z: number }[] = [];
  rows.forEach((row, r) => {
    const z = FRONT_Z - (rows.length - 1 - r) * ROW_STEP;
    const n = row.chars.length;
    row.chars.split("").forEach((ch, j) => {
      keys.push({ ch, x: (j - (n - 1) / 2 + row.shift) * PITCH, z });
    });
  });

  for (const k of keys) {
    const y0 = deckY(k.z);
    const top = y0 + 0.012;
    b.part(new THREE.CylinderGeometry(0.0118, 0.0128, 0.014, 14), KEY, {
      at: [k.x, y0 + 0.005, k.z],
      bone: chassis,
      group: "keys",
    });
    b.part(new THREE.TorusGeometry(0.0132, 0.0022, 6, 14), CHROME, {
      at: [k.x, top - 0.0012, k.z],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      bone: chassis,
      group: "keys",
    });
    b.part(new THREE.CircleGeometry(0.0112, 14), KEY, {
      at: [k.x, top + 0.0004, k.z],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: keyCap(k.ch),
      bone: chassis,
      group: "keys",
    });
  }

  // Type bars: a fan rising from behind the keys to a shallow arc of heads under the platen.
  const sorted = keys.slice().sort((p, q) => p.x - q.x);
  sorted.forEach((k, i) => {
    const xh = -FAN_HALF + (2 * FAN_HALF * i) / (sorted.length - 1);
    const head: V = [xh, FAN_TOP - (FAN_R - Math.sqrt(FAN_R * FAN_R - xh * xh)), FAN_Z];
    const tail: V = [k.x, deckY(k.z) + 0.012, k.z - 0.02];
    b.rod(tail, head, 0.0015, { color: STEEL, bone: chassis, group: "typebars" });
    b.part(new THREE.SphereGeometry(0.0032, 6, 4), STEEL, {
      at: head,
      bone: chassis,
      group: "typebars",
    });
  });

  // Carriage: side plates, platen axle, paper bail and a rail along the top.
  const carriage = b.joint("carriage", { parent: chassis, at: PLATEN_C });

  const plate: OutlinePoint[] = [
    [-0.105, 0.14],
    [-0.015, 0.14],
    [-0.015, 0.212],
    [-0.04, 0.245],
    [-0.085, 0.245],
    [-0.105, 0.212],
  ];
  b.extrude(plate, {
    at: [-0.165, 0, 0],
    thickness: 0.008,
    color: GREEN_DARK,
    bone: carriage,
    name: "plate R",
  });
  b.extrude(plate, {
    at: [0.165, 0, 0],
    thickness: 0.008,
    color: GREEN_DARK,
    bone: carriage,
    name: "plate L",
  });

  b.rod([-0.168, PLATEN_C[1], PLATEN_C[2]], [0.176, PLATEN_C[1], PLATEN_C[2]], 0.005, {
    color: CHROME,
    bone: carriage,
    group: "axle",
  });
  b.rod([-0.165, 0.245, -0.072], [0.165, 0.245, -0.072], 0.0045, {
    color: CHROME,
    bone: carriage,
    group: "rail",
  });
  b.sweep(
    catmull([
      [-0.165, 0.228, -0.05],
      [-0.12, 0.25, -0.012],
      [0.12, 0.25, -0.012],
      [0.165, 0.228, -0.05],
    ]),
    0.0028,
    { color: CHROME, bone: carriage, name: "paper bail" },
  );

  // Platen: black roller with a chrome knob on the left end.
  b.part(new THREE.CylinderGeometry(PLATEN_R, PLATEN_R, 0.28, 20), BLACK, {
    at: PLATEN_C,
    dir: [1, 0, 0],
    axis: "y",
    bone: carriage,
    name: "platen",
  });
  b.part(new THREE.CylinderGeometry(0.0125, 0.0125, 0.02, 14), CHROME, {
    at: [0.184, PLATEN_C[1], PLATEN_C[2]],
    dir: [1, 0, 0],
    axis: "y",
    bone: carriage,
    name: "platen knob",
  });

  // Paper: a sheet tangent to the platen, half typed.
  const paperBottom = add(PLATEN_C, PAPER_FACE, PLATEN_R + 0.0015);
  const paperCentre = add(paperBottom, PAPER_UP, PAPER_H / 2);
  b.part(new THREE.PlaneGeometry(PAPER_W, PAPER_H), WHITE, {
    at: paperCentre,
    dir: PAPER_FACE,
    up: PAPER_UP,
    axis: "z",
    texture: svg(PAPER_SVG, { size: 1024 }),
    bone: carriage,
    name: "paper sheet",
  });

  // Carriage return lever: chrome arm from the right carriage plate, with a grip.
  const R0: V = [-0.181, 0.19, -0.04];
  const lever = b.joint("returnLever", { parent: carriage, at: R0, role: "hinge" });
  b.rod([-0.165, 0.19, -0.04], R0, 0.0045, {
    color: CHROME,
    bone: carriage,
    group: "lever",
  });
  b.part(new THREE.SphereGeometry(0.0075, 10, 6), CHROME, {
    at: R0,
    bone: lever,
    group: "lever",
  });
  const grip: V = [-0.19, 0.145, 0.036];
  b.sweep(catmull([R0, [-0.197, 0.163, -0.004], grip]), 0.0042, {
    color: CHROME,
    bone: lever,
    name: "carriage return lever",
  });
  b.part(new THREE.SphereGeometry(0.0115, 12, 8), CHROME, {
    at: grip,
    bone: lever,
    name: "lever grip",
  });

  return b.root;
}
```