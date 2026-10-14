```ts
import * as THREE from "three";
import { bezier, createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "typewriter",
  description:
    "A teal portable typewriter with cream letter keys, red shift keys and ribbon spools, chrome trim, a black platen and a sheet of typed text.",
};

const TEAL = "#2f8f83";
const CREAM = "#f2e8cf";
const CHROME = "#c3c9d1";
const BLACK = "#1e1e1e";
const RED = "#d1342f";

const KW = 0.022; // keycap width and depth
const KH = 0.014; // keycap height
const PITCH = 0.026; // key spacing across a row

// One greyscale drawing per letter: the white field takes the key colour, the letter stays dark.
function letterTexture(ch: string) {
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffffff"/><text x="32" y="46" text-anchor="middle" font-family="Courier New, monospace" font-size="40" font-weight="bold" fill="#1b1b1b">${ch}</text></svg>`,
    { size: 96 },
  );
}

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const base = b.joint("base", { at: [0, 0, 0] });

  // Body: a side profile in (z, y) pushed out into a slab 0.40 wide.
  // The sloped front and the keyboard deck come from the profile itself.
  const body = b.extrude(
    [
      [-0.17, 0.03],
      [0.15, 0.03],
      [0.17, 0.08],
      [0.15, 0.11],
      [-0.04, 0.16],
      [-0.1, 0.2],
      [-0.17, 0.2],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.4, bevel: 0.012, color: TEAL, bone: base },
  );

  // The keyboard deck runs from the front lip up to the back of the body.
  const front: [number, number] = [0.15, 0.11];
  const back: [number, number] = [-0.04, 0.16];
  const len = Math.hypot(back[0] - front[0], back[1] - front[1]);
  const uz = (back[0] - front[0]) / len; // along the deck, z
  const uy = (back[1] - front[1]) / len; // along the deck, y
  const N: [number, number, number] = [0, -uz, uy]; // deck normal: up and forward
  const onDeck = (D: number, x: number, lift: number): [number, number, number] => [
    x,
    front[1] + uy * D + N[1] * lift,
    front[0] + uz * D + N[2] * lift,
  ];

  // Letter rows: QWERTY nearest the carriage, ZXCV at the front.
  const rows: [string, number][] = [
    ["QWERTYUIOP", 0.16],
    ["ASDFGHJKL", 0.125],
    ["ZXCVBNM", 0.09],
  ];
  for (const [letters, D] of rows) {
    letters.split("").forEach((ch, i) => {
      const x = (i - (letters.length - 1) / 2) * PITCH;
      b.part(new THREE.BoxGeometry(KW, KH, KW), CREAM, {
        at: onDeck(D, x, KH / 2 - 0.002),
        dir: N,
        bone: base,
      });
      b.part(new THREE.PlaneGeometry(KW * 0.92, KW * 0.92), CREAM, {
        at: onDeck(D, x, KH - 0.0015),
        dir: N,
        axis: "z",
        texture: letterTexture(ch),
        bone: base,
      });
    });
  }

  // Red shift keys at either end of the ZXCV row.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, KH, KW), RED, {
      at: onDeck(0.09, s * 0.122, KH / 2 - 0.002),
      dir: N,
      bone: base,
    });
  }

  // Space bar standing out below the front lip.
  b.part(new THREE.BoxGeometry(0.13, 0.016, 0.034), CREAM, { at: [0, 0.07, 0.186], bone: base });

  // Chrome trim along the front edge of the deck.
  b.rod([-0.19, 0.114, 0.152], [0.19, 0.114, 0.152], 0.004, { color: CHROME, bone: base });

  // Chrome rail across the top of the back riser.
  b.part(new THREE.BoxGeometry(0.4, 0.012, 0.03), CHROME, { at: [0, 0.206, -0.15], bone: base });

  // Four black feet.
  for (const x of [-0.15, 0.15]) {
    for (const z of [-0.11, 0.1]) {
      b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.03, 12), BLACK, { at: [x, 0.015, z], bone: base });
    }
  }

  // Chrome screws on both flanks.
  const screws: [number, number][] = [
    [0.11, 0.055],
    [-0.14, 0.055],
    [-0.14, 0.175],
  ];
  for (const s of [1, -1]) {
    for (const [z, y] of screws) {
      b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 8), CHROME, {
        at: [s * 0.2005, y, z],
        dir: [s, 0, 0],
        bone: base,
      });
    }
  }

  // Ribbon spools with chrome posts, one each side in front of the paper.
  for (const s of [1, -1]) {
    const x = s * 0.15;
    b.rod([x, 0.1767, -0.065], [x, 0.25, -0.065], 0.004, { color: CHROME, bone: base });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 18), RED, {
      at: [x, 0.25, -0.065],
      dir: [0, 0, 1],
      bone: base,
    });
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.016, 10), BLACK, {
      at: [x, 0.25, -0.065],
      dir: [0, 0, 1],
      bone: base,
    });
  }

  // Black platen with chrome brackets and a knob on the left end.
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.44, 18), BLACK, {
    at: [0, 0.265, -0.13],
    dir: [1, 0, 0],
    bone: base,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.022, 0.07, 0.05), CHROME, { at: [s * 0.205, 0.23, -0.13], bone: base });
  }
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.026, 14), CHROME, {
    at: [0.233, 0.265, -0.13],
    dir: [1, 0, 0],
    bone: base,
  });

  // Paper bail: a chrome bar across the front of the sheet.
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 8), CHROME, {
    at: [0, 0.36, -0.07],
    dir: [1, 0, 0],
    bone: base,
  });

  // The sheet of typed text, rising from the platen and leaning back a little.
  const paperTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240"><rect width="200" height="240" fill="#fbf6e9"/><g font-family="Courier New, monospace" font-size="10" fill="#2b2a28"><text x="18" y="40">TO WHOM IT MAY CONCERN,</text><text x="18" y="58">THE KEYS ARE SMALL AND</text><text x="18" y="76">PROUD, AND THE RIBBON</text><text x="18" y="94">REMEMBERS EVERYTHING.</text><text x="18" y="122">PLEASE SEND MORE INK.</text><text x="104" y="150">- THE TYPEWRITER</text></g></svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.24), "#ffffff", {
    at: [0, 0.34, -0.095],
    rotation: [-6, 0, 0],
    texture: paperTex,
    bone: base,
  });

  // Carriage return lever: a hinge on the right end of the carriage, ending in a red knob.
  const lever = b.joint("lever", { parent: base, at: [-0.21, 0.23, -0.13], role: "hinge" });
  b.sweep(bezier([-0.21, 0.23, -0.13], [-0.26, 0.28, -0.12], [-0.29, 0.25, -0.1]), 0.006, {
    color: CHROME,
    bone: lever,
  });
  b.part(new THREE.SphereGeometry(0.022, 10, 8), RED, { at: [-0.29, 0.25, -0.1], bone: lever });

  // Badge on the left flank.
  const badgeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 70"><rect x="4" y="6" width="212" height="58" rx="14" fill="#f2e8cf"/><rect x="12" y="13" width="196" height="44" rx="9" fill="none" stroke="#d1342f" stroke-width="3"/><text x="110" y="50" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#d1342f">TYPEX</text></svg>`,
    { size: 256 },
  );
  b.decal(body, badgeTex, { at: [0.2, 0.085, 0], dir: [1, 0, 0], size: [0.11, 0.035] });

  return b.root;
}
```