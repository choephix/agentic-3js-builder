```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "typewriter",
  description:
    "A red portable typewriter: cream keys lettered in pixel type, a platen with HELLO / WORLD typed on the paper, a gold TYPE badge and a coiled cord.",
};

type V3 = [number, number, number];

const RED = "#c8372d";
const CREAM = "#eadfc6";
const BLACK = "#1d1d21";
const BED = "#2c2c32";
const CHROME = "#c3c8cf";
const INK = "#2a2a30";
const PAPER = "#fbf8ef";
const GOLD = "#e0ae3a";

// The keyboard deck slopes from the front lip (z 0.18, y 0.085) up to the back (z 0.015, y 0.14).
const SLOPE = (0.14 - 0.085) / (0.18 - 0.015);
const TILT = Math.atan(SLOPE);
const deckTop = (z: number) => 0.085 + (0.18 - z) * SLOPE + 0.002; // keys sit on the bed

const KEY_H = 0.008;
const KEY_PX = 0.0026;
const PAPER_PX = 0.009;

// 3x5 pixel font: rows top to bottom, "/" separated, "1" = ink.
const FONT: Record<string, string> = {
  A: "010/101/111/101/101",
  B: "110/101/110/101/110",
  C: "011/100/100/100/011",
  D: "110/101/101/101/110",
  E: "111/100/110/100/111",
  F: "111/100/110/100/100",
  G: "011/100/101/101/011",
  H: "101/101/111/101/101",
  I: "111/010/010/010/111",
  J: "001/001/001/101/010",
  K: "101/101/110/101/101",
  L: "100/100/100/100/111",
  M: "101/111/111/101/101",
  N: "101/111/111/111/101",
  O: "111/101/101/101/111",
  P: "110/101/110/100/100",
  Q: "111/101/101/111/001",
  R: "110/101/110/101/101",
  S: "111/100/111/001/111",
  T: "111/010/010/010/010",
  U: "101/101/101/101/111",
  V: "101/101/101/101/010",
  W: "101/101/101/111/101",
  X: "101/101/010/101/101",
  Y: "101/101/010/010/010",
  Z: "111/001/010/100/111",
  "0": "111/101/101/101/111",
  "1": "010/110/010/010/111",
  "2": "111/001/111/100/111",
  "3": "111/001/111/001/111",
  "4": "101/101/111/001/001",
  "5": "111/100/111/001/111",
  "6": "111/100/111/101/111",
  "7": "111/001/010/010/010",
  "8": "111/101/111/101/111",
  "9": "111/101/111/001/111",
};

// Lit cells of a line of text, centred on 0. x grows to the right, y grows up. Units: cells.
function cells(text: string): { x: number; y: number }[] {
  const cols = text.length * 4 - 1;
  const out: { x: number; y: number }[] = [];
  text.split("").forEach((ch, i) =>
    FONT[ch].split("/").forEach((row, r) =>
      row.split("").forEach((on, c) => {
        if (on === "1") out.push({ x: i * 4 + c - (cols - 1) / 2, y: 2 - r });
      }),
    ),
  );
  return out;
}

// Joins many small geometries into one, so a whole glyph is a single part.
function merge(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  for (const src of list) {
    const g = src.index ? src.toNonIndexed() : src;
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  return out;
}

// Turns a geometry by rot (radians, XYZ) and moves it to at.
function placed(g: THREE.BufferGeometry, at: V3, rot: V3 = [0, 0, 0]): THREE.BufferGeometry {
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
  m.setPosition(at[0], at[1], at[2]);
  return g.applyMatrix4(m);
}

// A side profile [z, y] pushed out across x from x0 to x1: a blocky slab with flat sides.
function prism(profile: [number, number][], x0: number, x1: number): THREE.BufferGeometry {
  const shape = new THREE.Shape(profile.map(([z, y]) => new THREE.Vector2(-z, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false });
  return g.rotateY(Math.PI / 2).translate(x0, 0, 0);
}

// Pixel lettering on a plane facing +Z: one small box per lit cell.
function lettering(text: string, px: number, cx: number, cy: number, z: number): THREE.BufferGeometry {
  return merge(
    cells(text).map(({ x, y }) =>
      new THREE.BoxGeometry(px * 0.85, px * 0.85, 0.0006).translate(cx + x * px, cy + y * px, z),
    ),
  );
}

// Stands a key-sized geometry (base at y = 0) on the sloped deck at (x, z).
function onDeck(g: THREE.BufferGeometry, x: number, z: number): THREE.BufferGeometry {
  const m = new THREE.Matrix4().makeRotationX(TILT);
  m.setPosition(x, deckTop(z), z);
  return g.applyMatrix4(m);
}

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const body = b.joint("body", { at: [0, 0, 0] });
  const put = (g: THREE.BufferGeometry, color: string) =>
    b.part(g, color, { at: [0, 0, 0], bone: body });

  // Base and rubber feet
  put(placed(new THREE.BoxGeometry(0.46, 0.022, 0.37), [0, 0.023, 0]), BLACK);
  put(
    merge(
      [-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) =>
          placed(new THREE.CylinderGeometry(0.016, 0.018, 0.012, 10), [sx * 0.18, 0.006, sz * 0.13]),
        ),
      ),
    ),
    BLACK,
  );

  // Red housing: a side profile [z, y] pushed out across the width.
  // The raised rear holds the carriage; the step down to the front is the keyboard deck.
  put(
    prism(
      [
        [-0.17, 0.034],
        [0.18, 0.034],
        [0.18, 0.085],
        [0.015, 0.14],
        [-0.075, 0.14],
        [-0.075, 0.18],
        [-0.17, 0.18],
      ],
      -0.21,
      0.21,
    ),
    RED,
  );

  // Dark keyboard bed laid on the slope
  put(
    prism(
      [
        [0.18, 0.085],
        [0.015, 0.14],
        [0.015, 0.142],
        [0.18, 0.087],
      ],
      -0.2,
      0.2,
    ),
    BED,
  );

  // Louvres on each side of the housing
  for (const sx of [-1, 1]) {
    for (const y of [0.105, 0.12, 0.135]) {
      put(placed(new THREE.BoxGeometry(0.003, 0.0055, 0.07), [sx * 0.2105, y, -0.12]), BLACK);
    }
  }

  // Gold front badge with TYPE in pixel letters
  put(placed(new THREE.BoxGeometry(0.085, 0.024, 0.004), [0, 0.062, 0.182]), GOLD);
  put(lettering("TYPE", 0.0035, 0, 0.062, 0.1845), INK);

  // Keys: cream caps on chrome collars, each lettered in pixel type that lies on the cap
  const key = (label: string, x: number, z: number) => {
    put(
      onDeck(new THREE.CylinderGeometry(0.0105, 0.0118, KEY_H, 8).translate(0, KEY_H / 2, 0), x, z),
      CREAM,
    );
    put(
      onDeck(new THREE.CylinderGeometry(0.0132, 0.0132, 0.0025, 8).translate(0, 0.00125, 0), x, z),
      CHROME,
    );
    const glyph = cells(label).map(({ x: cx, y: cy }) =>
      new THREE.BoxGeometry(KEY_PX * 0.8, 0.0008, KEY_PX * 0.8).translate(
        cx * KEY_PX,
        KEY_H + 0.0004,
        -cy * KEY_PX, // top of the glyph points away from the typist
      ),
    );
    put(onDeck(merge(glyph), x, z), INK);
  };

  const PITCH = 0.034;
  const ROWS: [string, number][] = [
    ["1234567890", 0.04],
    ["QWERTYUIOP", 0.074],
    ["ASDFGHJKL", 0.108],
    ["ZXCVBNM", 0.142],
  ];
  ROWS.forEach(([labels, z], r) => {
    const stagger = (r - 1.5) * 0.5 * PITCH;
    labels.split("").forEach((ch, i) => key(ch, (i - (labels.length - 1) / 2) * PITCH + stagger, z));
  });

  // Space bar at the front of the deck
  put(onDeck(new THREE.BoxGeometry(0.12, KEY_H, 0.02).translate(0, KEY_H / 2, 0), 0, 0.169), CREAM);
  put(onDeck(new THREE.BoxGeometry(0.03, 0.0008, 0.0016).translate(0, KEY_H + 0.0004, 0), 0, 0.169), INK);

  // Carriage: black platen with red knobs, chrome end plates, top rail and paper bail
  put(placed(new THREE.CylinderGeometry(0.024, 0.024, 0.43, 16), [0, 0.222, -0.13], [0, 0, Math.PI / 2]), BLACK);
  for (const sx of [-1, 1]) {
    put(placed(new THREE.CylinderGeometry(0.005, 0.005, 0.05, 8), [sx * 0.2385, 0.222, -0.13], [0, 0, Math.PI / 2]), CHROME);
    put(placed(new THREE.CylinderGeometry(0.018, 0.018, 0.022, 12), [sx * 0.27, 0.222, -0.13], [0, 0, Math.PI / 2]), RED);
    put(placed(new THREE.BoxGeometry(0.01, 0.075, 0.075), [sx * 0.222, 0.2175, -0.1225]), CHROME);
  }
  put(placed(new THREE.CylinderGeometry(0.007, 0.007, 0.46, 8), [0, 0.262, -0.15], [0, 0, Math.PI / 2]), CHROME);
  put(placed(new THREE.CylinderGeometry(0.0035, 0.0035, 0.45, 6), [0, 0.25, -0.09], [0, 0, Math.PI / 2]), CHROME);

  // Carriage return lever on the right end, with a red knob
  b.sweep(
    [
      [-0.226, 0.245, -0.1],
      [-0.246, 0.262, -0.075],
      [-0.255, 0.29, -0.045],
      [-0.256, 0.31, -0.025],
    ],
    0.0045,
    { color: CHROME },
  );
  put(placed(new THREE.SphereGeometry(0.013, 8, 6), [-0.256, 0.315, -0.02]), RED);

  // Paper rolled in front of the platen, with HELLO / WORLD typed on it
  put(placed(new THREE.BoxGeometry(0.21, 0.17, 0.0012), [0, 0.315, -0.1035]), PAPER);
  put(lettering("HELLO", PAPER_PX, 0, 0.355, -0.1025), INK);
  put(lettering("WORLD", PAPER_PX, 0, 0.295, -0.1025), INK);

  // Coiled power cord running off the back onto the floor, ending in a plug
  b.sweep(
    [
      [0.1, 0.05, -0.168],
      [0.12, 0.028, -0.195],
      [0.13, 0.0055, -0.235],
      [0.12, 0.0055, -0.3],
      [0.07, 0.0055, -0.37],
      [0.0, 0.0055, -0.4],
      [-0.05, 0.0055, -0.4],
    ],
    0.0055,
    { color: BLACK },
  );
  put(placed(new THREE.BoxGeometry(0.04, 0.011, 0.012), [-0.07, 0.0055, -0.4]), CHROME);

  return b.root;
}
```