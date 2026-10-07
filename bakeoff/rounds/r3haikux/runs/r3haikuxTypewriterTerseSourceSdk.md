```ts
import * as THREE from "three";
import { createBuilder, gradient, svg } from "agentic-3js-builder";

export const meta = {
  name: "Typewriter",
  description:
    "A red portable typewriter: a gradient enamel case on a black tray, ivory keys printed with their letters, a chrome typebar fan, a black platen and a sheet of typed letter.",
};

const ENAMEL_LOW = "#9f2e1d";
const ENAMEL_HIGH = "#e2632f";
const IVORY = "#f3eadb";
const INK = "#1d1c20";
const CHROME = "#c8cdd6";

// The case is 0.40 m wide, faces +Z, and its top is a deck sloping from the front edge up to the back.
const TRAY_TOP = 0.028;
const FRONT = { z: 0.16, y: 0.075 };
const BACK = { z: -0.03, y: 0.125 };
const DECK = Math.atan2(BACK.y - FRONT.y, FRONT.z - BACK.z); // the slope, radians
const deckNormal = new THREE.Vector3(0, Math.cos(DECK), Math.sin(DECK));
const deckTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), DECK);
const deckY = (z: number) => FRONT.y + ((FRONT.z - z) * (BACK.y - FRONT.y)) / (FRONT.z - BACK.z);
/** A point on the deck above (x, z), lifted `lift` along the deck's normal. */
const onDeck = (x: number, z: number, lift: number) =>
  new THREE.Vector3(x, deckY(z), z).addScaledVector(deckNormal, lift);

// Keys: four staggered rows, a space bar and two shift keys.
const PITCH = 0.027;
const KEY = 0.022;
const CAP = 0.016;
const SINK = 0.002;
const COLS = 10;
const CELL = 60;
const ROWS = [
  { text: "1234567890", z: 0.0, stagger: -0.375 },
  { text: "QWERTYUIOP", z: 0.03, stagger: -0.125 },
  { text: "ASDFGHJKL", z: 0.06, stagger: 0.125 },
  { text: "ZXCVBNM,.", z: 0.09, stagger: 0.375 },
];

/** One key's letter: a square cell of the letter atlas, lying flat on the key with its top toward the back. */
function letterCap(col: number, row: number, size: number) {
  const geometry = new THREE.PlaneGeometry(size, size);
  geometry.rotateX(-Math.PI / 2);
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  const du = 1 / COLS;
  const dv = 1 / ROWS.length;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (col + uv.getX(i)) * du, 1 - (row + 1 - uv.getY(i)) * dv);
  return geometry;
}

export default function typewriter() {
  const b = createBuilder({ name: "typewriter", detail: 1, paintSize: 1024 });

  b.joint("body", { at: [0, 0, 0] });
  b.joint("carriage", { at: [0, 0.2, -0.12], parent: "body" });

  // One atlas holds every key letter; each key's square shows its own cell.
  const glyphs = ROWS.map((row, r) =>
    row.text
      .split("")
      .map(
        (ch, c) =>
          `<text x="${(c + 0.5) * CELL}" y="${(r + 0.5) * CELL}" text-anchor="middle" dominant-baseline="central">${ch}</text>`,
      )
      .join(""),
  ).join("");
  const letters = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COLS * CELL} ${ROWS.length * CELL}">` +
      `<g font-family="Courier New, Courier, monospace" font-weight="700" font-size="44" fill="${INK}">${glyphs}</g></svg>`,
    { size: 1024 },
  );

  // A cream plate for the front of the case.
  const badge = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 60">
  <rect x="3" y="3" width="314" height="54" rx="10" fill="#f6efdc" stroke="${INK}" stroke-width="3"/>
  <text x="160" y="31" text-anchor="middle" dominant-baseline="central" font-family="Arial Black, Arial, sans-serif" font-size="26" letter-spacing="5" fill="${INK}">VOLTA 7</text>
</svg>`,
    { size: 512 },
  );

  // The typed sheet, with a margin line.
  const paper = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 360">
  <rect width="520" height="360" fill="#fbf7ec"/>
  <line x1="60" y1="0" x2="60" y2="360" stroke="#e8a59d" stroke-width="2"/>
  <g font-family="Courier New, Courier, monospace" font-size="22" fill="#2a2420">
    <text x="496" y="44" text-anchor="end">14 MARCH</text>
    <text x="84" y="92">DEAR MARGARET,</text>
    <text x="84" y="130">THE PARCEL ARRIVED TUESDAY.</text>
    <text x="84" y="168">THE MACHINE IS RED AND LOUD.</text>
    <text x="84" y="206">I HAVE WRITTEN TWELVE LETTERS</text>
    <text x="84" y="244">PLEASE WRITE SOON.</text>
    <text x="84" y="304">JOHN</text>
  </g>
</svg>`,
    { size: 1024 },
  );

  // Black tray and feet, with a chrome bead along the deck's front edge.
  b.part(new THREE.BoxGeometry(0.41, 0.016, 0.33), INK, { at: [0, 0.02, 0], bone: "body", name: "tray" });
  for (const x of [-0.17, 0.17])
    for (const z of [-0.12, 0.12])
      b.part(new THREE.CylinderGeometry(0.017, 0.019, 0.012, b.segments(10)), INK, {
        at: [x, 0.006, z],
        bone: "body",
        group: "foot",
      });
  b.rod([-0.19, FRONT.y, FRONT.z + 0.002], [0.19, FRONT.y, FRONT.z + 0.002], 0.0045, {
    color: CHROME,
    bone: "body",
    name: "trim",
  });

  // The case: one profile pushed across the width, rounded where it meets the side faces, painted with a gradient.
  const shell = b.extrude(
    [
      [-0.15, TRAY_TOP],
      [FRONT.z, TRAY_TOP],
      [FRONT.z, FRONT.y],
      [BACK.z, BACK.y],
      [-0.15, BACK.y],
    ],
    {
      name: "case",
      at: [0, 0, 0],
      thickness: 0.4,
      bevel: 0.012,
      color: gradient(ENAMEL_LOW, ENAMEL_HIGH, [0, TRAY_TOP, 0], [0, BACK.y, 0]),
      bone: "body",
    },
  );
  b.decal(shell, badge, {
    at: [0, 0.05, FRONT.z],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.15, 0.028],
    name: "badge",
  });

  // Ivory pinstripe and chrome screws on both sides.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.003, 0.007, 0.26), IVORY, {
      at: [s * 0.2015, 0.068, -0.01],
      bone: "body",
      group: "pinstripe",
    });
    for (const z of [-0.12, 0.13])
      b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.004, b.segments(8)).rotateZ(Math.PI / 2), CHROME, {
        at: [s * 0.2015, 0.05, z],
        bone: "body",
        group: "screw",
      });
  }

  // Keys sit on the sloped deck, tilted to match it. Each letter is a flat card just above its key top.
  ROWS.forEach((row, r) =>
    row.text.split("").forEach((_, c) => {
      const x = (c - (row.text.length - 1) / 2 + row.stagger) * PITCH;
      b.part(new THREE.BoxGeometry(KEY, CAP, KEY), IVORY, {
        at: onDeck(x, row.z, CAP / 2 - SINK),
        quat: deckTilt,
        bone: "body",
        group: "key",
      });
      b.part(letterCap(c, r, 0.0175), "#ffffff", {
        texture: letters,
        at: onDeck(x, row.z, CAP - SINK + 0.0006),
        quat: deckTilt,
        bone: "body",
        group: "key",
      });
    }),
  );
  b.part(new THREE.BoxGeometry(0.11, CAP, KEY), IVORY, {
    at: onDeck(0, 0.125, CAP / 2 - SINK),
    quat: deckTilt,
    bone: "body",
    name: "space",
  });
  for (const x of [-0.152, 0.152])
    b.part(new THREE.BoxGeometry(0.036, CAP, KEY), INK, {
      at: onDeck(x, 0.09, CAP / 2 - SINK),
      quat: deckTilt,
      bone: "body",
      group: "shift",
    });

  // Carriage: black side plates, a black platen with chrome knobs, a chrome rail, and the sheet on the platen.
  const plate: [number, number][] = [
    [-0.145, 0.118],
    [-0.065, 0.118],
    [-0.065, 0.2],
    [-0.105, 0.27],
    [-0.145, 0.27],
  ];
  for (const x of [-0.186, 0.186])
    b.extrude(plate, { name: "plate", color: INK, at: [x, 0, 0], thickness: 0.012, bone: "carriage" });
  b.rod([-0.178, 0.205, -0.12], [0.178, 0.205, -0.12], 0.024, {
    color: INK,
    sides: 12,
    bone: "carriage",
    name: "platen",
  });
  for (const s of [-1, 1])
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, b.segments(10)).rotateZ(Math.PI / 2), CHROME, {
      at: [s * 0.2, 0.205, -0.12],
      bone: "carriage",
      group: "knob",
    });
  b.rod([-0.186, 0.27, -0.105], [0.186, 0.27, -0.105], 0.007, {
    color: CHROME,
    bone: "carriage",
    name: "rail",
  });
  b.part(new THREE.PlaneGeometry(0.26, 0.18), "#ffffff", {
    texture: paper,
    at: [0, 0.295, -0.095],
    bone: "carriage",
    name: "paper",
  });

  // Typebar fan: thin chrome bars from the key well up to the platen.
  for (let i = 0; i < 13; i++) {
    const x = -0.12 + (i * 0.24) / 12;
    b.rod([0, 0.1, 0], [x, 0.1896, -0.1016], 0.0035, {
      color: CHROME,
      sides: 6,
      bone: "body",
      name: "typebar",
    });
  }

  return b.root;
}
```