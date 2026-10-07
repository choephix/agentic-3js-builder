import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "jukebox",
  description:
    "A 1950s diner jukebox at real size: red and cream cabinet, chrome trim, glowing bubble tubes, a window of records and a pixel-lettered marquee.",
};

type V3 = [number, number, number];

// flat colours
const RED = "#d62839";
const CREAM = "#f5ebd3";
const CHROME = "#e3e9ee";
const CHROME_DARK = "#9aa6b0";
const NAVY = "#18213f";
const BLACK = "#1d1f26";
const SLOT = "#0c0d10";
const YELLOW = "#ffd23f";
const AMBER = "#ffa030";
const PINK = "#ff4f8b";
const TEAL = "#1fc2ae";
const BLUE = "#3f7bff";
const ORANGE = "#ff7a33";
const PURPLE = "#9b5de5";
const WHITE = "#fffaf0";

// 3 x 5 pixel font for the marquee
const FONT: Record<string, string[]> = {
  J: ["..#", "..#", "..#", "#.#", "###"],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  K: ["#.#", "#.#", "##.", "#.#", "#.#"],
  E: ["###", "#..", "##.", "#..", "###"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  O: ["###", "#.#", "#.#", "#.#", "###"],
  X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
};

export default function build() {
  const b = createBuilder({ name: "jukebox" });
  const body = b.joint("body", { at: [0, 0, 0] });

  const put = (geo: THREE.BufferGeometry, color: string, at: V3) => {
    b.part(geo, color, { at, bone: body });
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const drum = (r: number, h: number, seg = 14) => new THREE.CylinderGeometry(r, r, h, seg);
  const facing = (r: number, h: number, seg = 16) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    g.rotateX(Math.PI / 2); // axis along +Z, a disc that faces the front
    return g;
  };
  const ball = (r: number) => new THREE.SphereGeometry(r, 10, 8);

  // 1. plinth and chrome feet (bottom of feet on y = 0)
  const feet: V3[] = [
    [-0.26, 0.012, -0.2],
    [0.26, 0.012, -0.2],
    [-0.26, 0.012, 0.2],
    [0.26, 0.012, 0.2],
  ];
  for (const at of feet) put(drum(0.028, 0.024), CHROME_DARK, at);
  put(box(0.6, 0.06, 0.5), BLACK, [0, 0.05, 0]);

  // 2. lower cabinet, rear vent panel and chrome side trim
  put(box(0.62, 0.62, 0.54), RED, [0, 0.39, 0]);
  put(box(0.56, 0.44, 0.012), BLACK, [0, 0.36, -0.274]);
  for (const s of [-1, 1]) put(box(0.012, 0.03, 0.5), CHROME, [s * 0.316, 0.4, 0]);

  // 3. chrome waist band and cream upper cabinet
  put(box(0.64, 0.03, 0.56), CHROME, [0, 0.705, 0]);
  put(box(0.6, 0.68, 0.52), CREAM, [0, 1.06, 0.01]);

  // 4. domed red arch with chrome rims at both ends
  const arch = new THREE.CylinderGeometry(0.28, 0.28, 0.64, 16, 1, false, 0, Math.PI);
  arch.rotateZ(Math.PI / 2); // axis along X, half-circle in the YZ plane
  arch.scale(1, 0.5, 1); // flatten into a half-ellipse 0.14 high
  put(arch, RED, [0, 1.4, 0]);

  for (const s of [-1, 1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = (i / 12) * Math.PI;
      pts.push(new THREE.Vector3(0, 0.14 * Math.sin(t), 0.28 * Math.cos(t)));
    }
    const rim = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.011, 6, false);
    put(rim, CHROME, [s * 0.322, 1.4, 0]);
  }

  // 5. speaker grille with chrome slats on the lower front
  put(box(0.37, 0.46, 0.012), CHROME, [0, 0.39, 0.274]);
  put(box(0.34, 0.42, 0.01), SLOT, [0, 0.39, 0.282]);
  for (let i = 0; i < 7; i++) {
    put(box(0.34, 0.012, 0.012), CHROME, [0, 0.22 + i * 0.06, 0.29]);
  }

  // 6. coin slot and pilot lamp
  put(box(0.05, 0.11, 0.012), CHROME, [0.24, 0.6, 0.274]);
  put(box(0.012, 0.05, 0.006), SLOT, [0.24, 0.6, 0.284]);
  put(facing(0.03, 0.012), CHROME, [-0.24, 0.6, 0.276]);
  put(facing(0.02, 0.01), YELLOW, [-0.24, 0.6, 0.286]);

  // 7. selection panel: 5 x 3 keys with chrome bezels, colours on diagonals
  put(box(0.4, 0.17, 0.012), NAVY, [0, 0.83, 0.276]);
  const keyColors = [YELLOW, TEAL, PINK, BLUE, ORANGE];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const x = -0.16 + col * 0.08;
      const y = 0.78 + row * 0.05;
      put(facing(0.023, 0.008), CHROME, [x, y, 0.286]);
      put(facing(0.017, 0.016, 14), keyColors[(row + col) % keyColors.length], [x, y, 0.297]);
    }
  }

  // 8. record window: chrome frame, navy backdrop, a 4 x 3 rack of records
  put(box(0.41, 0.33, 0.012), CHROME, [0, 1.11, 0.274]);
  put(box(0.39, 0.31, 0.01), NAVY, [0, 1.11, 0.281]);
  const recordColors = [PINK, YELLOW, TEAL, BLUE, ORANGE, PURPLE];
  const recordCols = [-0.15, -0.05, 0.05, 0.15];
  const recordRows = [1.0, 1.11, 1.22];
  recordRows.forEach((y, r) =>
    recordCols.forEach((x, c) => {
      const k = r * recordCols.length + c;
      put(facing(0.042, 0.006, 20), recordColors[k % recordColors.length], [x, y, 0.291]);
      put(new THREE.TorusGeometry(0.031, 0.0025, 6, 24), BLACK, [x, y, 0.294]);
      put(facing(0.014, 0.008, 12), WHITE, [x, y, 0.295]);
    }),
  );

  // 9. bubble tubes flanking the window, with bubbles on their faces
  const tubeX = 0.265;
  for (const s of [-1, 1]) {
    const x = s * tubeX;
    put(drum(0.021, 0.56, 14), s < 0 ? AMBER : PINK, [x, 1.05, 0.28]);
    put(drum(0.03, 0.016, 14), CHROME, [x, 0.77, 0.28]);
    put(drum(0.03, 0.016, 14), CHROME, [x, 1.33, 0.28]);
    for (let i = 0; i < 9; i++) {
      const y = 0.82 + i * 0.06;
      const dx = i % 2 === 0 ? -0.008 : 0.008;
      const r = i % 3 === 0 ? 0.01 : 0.007;
      put(ball(r), WHITE, [x + dx, y, 0.3]);
    }
  }

  // 10. navy marquee with a pixel-lettered "JUKEBOX"
  put(box(0.44, 0.09, 0.012), NAVY, [0, 1.345, 0.274]);
  const p = 0.0148;
  const word = "JUKEBOX";
  const totalCols = word.length * 4 - 1;
  const x0 = -(totalCols * p) / 2;
  [...word].forEach((ch, li) => {
    const glyph = FONT[ch] ?? [];
    glyph.forEach((rowStr, r) => {
      [...rowStr].forEach((px, c) => {
        if (px !== "#") return;
        const gc = li * 4 + c;
        put(box(p * 0.86, p * 0.86, 0.008), YELLOW, [
          x0 + (gc + 0.5) * p,
          1.345 + (2 - r) * p,
          0.284,
        ]);
      });
    });
  });

  // 11. row of marquee bulbs along the seam where the arch meets the front
  const bulbColors = [AMBER, PINK, TEAL, YELLOW, BLUE];
  for (let i = 0; i < 13; i++) {
    const x = -0.3 + i * 0.05;
    put(ball(0.011), bulbColors[i % bulbColors.length], [x, 1.405, 0.283]);
  }

  return b.root;
}
