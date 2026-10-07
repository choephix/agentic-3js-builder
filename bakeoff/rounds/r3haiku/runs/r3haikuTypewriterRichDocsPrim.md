```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "Royale Typewriter",
  description: "A 1930s portable typewriter in racing green: round cream-lettered keys on chrome rims in four staggered rows, a fan of type bars, a black platen with a half-typed letter, and a brass maker's badge.",
};

const GREEN = "#0b4d30";
const KEYCAP = "#082f20";
const CHROME = "#d4d9de";
const CREAM = "#f1e6c8";
const BLACK = "#151515";
const TYPE = "#3a3f44";
const BRASS = "#c09a4a";

// Deck tilt: the keyboard slopes down toward the typist (+Z).
const TILT = (12 * Math.PI) / 180;
const CT = Math.cos(TILT);
const ST = Math.sin(TILT);
const TT = Math.tan(TILT);
const DECK_TOP_Y = 0.1547; // top surface height at z = 0.02

type V = [number, number, number];

// A point on the tilted deck top, at x and z.
function deckPoint(x: number, z: number): V {
  return [x, DECK_TOP_Y - (z - 0.02) * TT, z];
}

// A point h metres above the deck top, along its normal.
function onDeck(x: number, z: number, h: number): V {
  const p = deckPoint(x, z);
  return [p[0], p[1] + CT * h, p[2] + ST * h];
}

const NORMAL: V = [0, CT, ST];
const BACK: V = [0, ST, -CT];

const letterCache = new Map<string, ReturnType<typeof svg>>();
function letter(ch: string) {
  let tex = letterCache.get(ch);
  if (!tex) {
    tex = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text x="16" y="22" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="${CREAM}">${ch}</text></svg>`,
      { size: 64 },
    );
    letterCache.set(ch, tex);
  }
  return tex;
}

const paperTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 130">
    <rect x="0" y="0" width="240" height="130" fill="#f7f1df"/>
    <g font-family="Courier New, monospace" font-size="11" fill="#2b2622">
      <text x="18" y="30">Dearest Margaret,</text>
      <text x="18" y="48">I have finally found the time to</text>
      <text x="18" y="64">write. The new house is lovely and</text>
      <text x="18" y="80">the garden has come up at last. Tell</text>
      <text x="18" y="96">your mother that the</text>
    </g>
    <rect x="128" y="84" width="7" height="12" fill="#2b2622"/>
  </svg>`,
  { size: 512 },
);

const badgeTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 36">
    <rect x="1" y="1" width="94" height="34" rx="4" fill="${BRASS}" stroke="#7a5a22" stroke-width="2"/>
    <text x="48" y="16" text-anchor="middle" font-family="Georgia, serif" font-size="12" font-weight="bold" letter-spacing="1" fill="#2a1d08">ROYALE</text>
    <text x="48" y="28" text-anchor="middle" font-family="Georgia, serif" font-size="6.5" letter-spacing="0.6" fill="#2a1d08">TYPEWRITER CO.</text>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "royale-typewriter" });

  // Root joint: the whole typewriter is one rigid body.
  b.joint("body", { at: [0, 0, 0] });

  // Feet, body and front trim.
  for (const fx of [-0.18, 0.18]) {
    for (const fz of [-0.1, 0.1]) {
      b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.02, 12), BLACK, { at: [fx, 0.01, fz] });
    }
  }
  b.part(new THREE.BoxGeometry(0.42, 0.1, 0.26), GREEN, { at: [0, 0.07, 0] });
  b.part(new THREE.BoxGeometry(0.4, 0.006, 0.004), CHROME, { at: [0, 0.035, 0.1335] });

  // Badge on the front.
  b.part(new THREE.PlaneGeometry(0.09, 0.034), "#ffffff", {
    at: [0, 0.07, 0.1345],
    dir: [0, 0, 1],
    axis: "z",
    texture: badgeTex,
  });

  // Sloped keyboard deck.
  b.part(new THREE.BoxGeometry(0.42, 0.03, 0.22), GREEN, {
    at: [0, 0.14, 0.02],
    rotation: [12, 0, 0],
  });

  // Keys: four staggered rows, each key a chrome rim, a dark cap and a cream letter.
  const rows = [
    { z: 0.098, off: 0, keys: "QWERTYUIOP" },
    { z: 0.062, off: 0.017, keys: "ASDFGHJKL" },
    { z: 0.026, off: 0, keys: "ZXCVBNM,." },
    { z: -0.01, off: 0.017, keys: "1234567890" },
  ];
  for (const row of rows) {
    const n = row.keys.length;
    [...row.keys].forEach((ch, i) => {
      const x = (i - (n - 1) / 2) * 0.034 + row.off;
      const z = row.z;
      b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.005, 16), CHROME, {
        at: onDeck(x, z, 0.0025),
        rotation: [12, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.0125, 0.0135, 0.012, 16), KEYCAP, {
        at: onDeck(x, z, 0.011),
        rotation: [12, 0, 0],
      });
      b.part(new THREE.CircleGeometry(0.0105, 16), "#ffffff", {
        at: onDeck(x, z, 0.0182),
        dir: NORMAL,
        up: BACK,
        axis: "z",
        texture: letter(ch),
      });
    });
  }

  // Fan of type bars rising behind the keys toward the strike point under the platen.
  for (let i = 0; i <= 20; i++) {
    const a = ((-60 + i * 6) * Math.PI) / 180;
    const base: V = [0.2 * Math.sin(a), 0.172, -0.075];
    const tip: V = [0.06 * Math.sin(a), 0.262, -0.035];
    b.rod(base, tip, 0.0022, { color: TYPE });
  }

  // Back plate and side cheeks.
  b.part(new THREE.BoxGeometry(0.4, 0.1, 0.012), GREEN, { at: [0, 0.23, -0.105] });
  for (const sx of [-0.2, 0.2]) {
    b.part(new THREE.BoxGeometry(0.014, 0.13, 0.14), GREEN, { at: [sx, 0.21, -0.04] });
    b.part(new THREE.BoxGeometry(0.012, 0.135, 0.04), GREEN, { at: [sx, 0.3425, -0.07] });
  }

  // Black platen roller with chrome knobs.
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.42, 16), BLACK, {
    at: [0, 0.235, -0.07],
    dir: [1, 0, 0],
  });
  for (const sx of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 12), CHROME, {
      at: [sx * 0.214, 0.235, -0.07],
      dir: [1, 0, 0],
    });
  }

  // Half-typed letter over the platen.
  b.part(new THREE.PlaneGeometry(0.24, 0.13), "#ffffff", {
    at: [0, 0.32, -0.036],
    dir: [0, 0, 1],
    axis: "z",
    texture: paperTex,
  });

  // Chrome carriage rail and carriage return lever.
  b.rod([-0.19, 0.41, -0.07], [0.19, 0.41, -0.07], 0.006, { color: CHROME });
  b.rod([0.21, 0.2, -0.02], [0.225, 0.3, -0.08], 0.005, { color: CHROME });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), CHROME, { at: [0.228, 0.31, -0.085] });

  return b.root;
}
```