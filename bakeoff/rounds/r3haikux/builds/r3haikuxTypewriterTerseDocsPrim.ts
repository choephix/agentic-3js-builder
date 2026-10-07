import * as THREE from "three";
import { createBuilder, paint, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "typewriter",
  description:
    "A red portable typewriter: cream keys with printed letters, a chrome carriage holding a sheet of typed paper, and a red return lever.",
};

// Palette
const RED = "#c8392e";
const DECK = "#2a2a2e";
const CREAM = "#f2e9d4";
const INK = "#1f1f22";
const CHROME = "#c3c9d1";
const BLACK = "#17171a";
const PAPER = "#f6f1e3";
const BADGE = "#efe6cf";
const WHITE = "#ffffff";

// Dimensions (m)
const PLATEN_Y = 0.225;
const PLATEN_Z = -0.095;
const PAGE_W = 0.2;
const PAGE_H = 0.17;
const PITCH = 0.025;
const KW = 0.019;
const KD = 0.019;
const KH = 0.011;

// Housing side profile, drawn as (z, y) and thickened across x.
const SIDE: OutlinePoint[] = [
  [-0.17, 0.03],
  [0.2, 0.03],
  [0.2, 0.08],
  [0.0, 0.13],
  [-0.06, 0.13],
  [-0.06, 0.17],
  [-0.17, 0.17],
];

// Chrome plinth band along the bottom edge.
const PLINTH: OutlinePoint[] = [
  [-0.172, 0.03],
  [0.203, 0.03],
  [0.203, 0.042],
  [-0.172, 0.042],
];

// Carriage end plate, drawn as (z, y).
const PLATE: OutlinePoint[] = [
  [-0.15, 0.15],
  [-0.03, 0.13],
  [-0.03, 0.215],
  [-0.07, 0.237],
  [-0.15, 0.237],
];

const FEET: [number, number][] = [
  [-0.15, 0.14],
  [0.15, 0.14],
  [-0.15, -0.13],
  [0.15, -0.13],
];

// Key rows, front-to-back. Each glyph is one key.
const KEY_ROWS = [
  { z: 0.04, cx: 0, keys: "1234567890" },
  { z: 0.067, cx: 0.0125, keys: "QWERTYUIOP" },
  { z: 0.094, cx: 0, keys: "ASDFGHJKL" },
  { z: 0.121, cx: 0, keys: "ZXCVBNM,." },
];

// One sheet holds every key letter: cell k = index in GLYPHS + 1, cell 0 is blank cream.
const GLYPHS = "1234567890QWERTYUIOPASDFGHJKLZXCVBNM,.";
const COLS = 8;
const ROWS = 5;
const CELL = 64;

function cell(k: number) {
  const c = k % COLS;
  const r = Math.floor(k / COLS);
  return { u0: c / COLS, u1: (c + 1) / COLS, v0: 1 - (r + 1) / ROWS, v1: 1 - r / ROWS };
}

const KEY_MARKUP = (() => {
  let s = `<rect x="0" y="0" width="${COLS * CELL}" height="${ROWS * CELL}" fill="${CREAM}"/>`;
  GLYPHS.split("").forEach((ch, g) => {
    const k = g + 1;
    const x = (k % COLS) * CELL + CELL / 2;
    const y = Math.floor(k / COLS) * CELL + CELL * 0.72;
    s += `<text x="${x}" y="${y}" font-family="Courier New, Courier, monospace" font-weight="700" font-size="46" text-anchor="middle" fill="${INK}">${ch}</text>`;
  });
  return `<svg viewBox="0 0 ${COLS * CELL} ${ROWS * CELL}">${s}</svg>`;
})();

const PAGE_MARKUP = `<svg viewBox="0 0 200 170">
<rect width="200" height="170" fill="${PAPER}"/>
<line x1="22" y1="0" x2="22" y2="170" stroke="#d6584b" stroke-width="0.6"/>
<g font-family="Courier New, Courier, monospace" font-size="5.2" fill="#2a2724">
<text x="28" y="20">Dear Sir or Madam,</text>
<text x="28" y="32">THE QUICK BROWN FOX JUMPS</text>
<text x="28" y="40.5">OVER THE LAZY DOG. 1234567890</text>
<text x="28" y="53">Thank you for your letter of the</text>
<text x="28" y="61.5">14th. I shall be pleased to meet</text>
<text x="28" y="70">you on Thursday at ten o'clock.</text>
<text x="28" y="84">Yours faithfully,</text>
<text x="28" y="98">A. Writer</text>
</g>
<text x="182" y="162" font-family="Courier New, Courier, monospace" font-size="4" fill="#2a2724">1</text>
</svg>`;

const BADGE_MARKUP = `<svg viewBox="0 0 240 48">
<rect width="240" height="48" fill="${BADGE}"/>
<rect x="4" y="4" width="232" height="40" fill="none" stroke="${RED}" stroke-width="2.5"/>
<text x="120" y="32" font-family="Courier New, Courier, monospace" font-weight="700" font-size="24" letter-spacing="5" text-anchor="middle" fill="${INK}">MERIDIAN</text>
</svg>`;

// A key box whose top face shows one glyph cell; sides show the blank cell.
function keyGeometry(k: number): THREE.BoxGeometry {
  const geo = new THREE.BoxGeometry(KW, KH, KD);
  const pos = geo.attributes.position;
  const nrm = geo.attributes.normal;
  const uv = geo.attributes.uv;
  const c = cell(k);
  const blank = cell(0);
  const bu = (blank.u0 + blank.u1) / 2;
  const bv = (blank.v0 + blank.v1) / 2;
  for (let i = 0; i < pos.count; i++) {
    if (nrm.getY(i) > 0.5) {
      const u = 0.5 + pos.getX(i) / KW; // 0 at the left, 1 at the right
      const v = 0.5 - pos.getZ(i) / KD; // 1 at the back, the top of the letter
      uv.setXY(
        i,
        c.u0 + (c.u1 - c.u0) * (0.08 + 0.84 * u),
        c.v0 + (c.v1 - c.v0) * (0.08 + 0.84 * v),
      );
    } else {
      uv.setXY(i, bu, bv);
    }
  }
  uv.needsUpdate = true;
  return geo;
}

export default function build() {
  const b = createBuilder({ name: "typewriter" });

  // Red shell with a dark keyboard deck: the slope and the flat under the keys.
  const shell = paint((p, n) => (n.y > 0.5 && p.z > -0.06 ? DECK : RED));

  const keyTex = svg(KEY_MARKUP, { size: 512 });
  const pageTex = svg(PAGE_MARKUP, { size: 768 });
  const badgeTex = svg(BADGE_MARKUP, { size: 480 });

  // Skeleton: body at the floor, carriage on the rear top, lever on the carriage.
  const root = b.joint("body", { at: [0, 0, 0] });
  const carriage = b.joint("carriage", { parent: root, at: [0, 0.17, PLATEN_Z] });
  const lever = b.joint("returnLever", { parent: carriage, at: [-0.2, PLATEN_Y, PLATEN_Z] });

  // Housing and trim
  const housing = b.extrude(SIDE, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.42,
    bevel: 0.008,
    color: shell,
    bone: root,
  });
  b.extrude(PLINTH, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.43,
    color: CHROME,
    bone: root,
  });
  b.part(new THREE.BoxGeometry(0.4, 0.008, 0.008), CHROME, { at: [0, 0.08, 0.2], bone: root });
  b.decal(housing, badgeTex, { at: [0, 0.058, 0.2], dir: [0, 0, 1], size: [0.12, 0.024] });

  for (const [x, z] of FEET) {
    b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.03, 10), BLACK, {
      at: [x, 0.015, z],
      bone: root,
      flat: true,
    });
  }

  // Keys seated on the sloped deck
  const deck = b.surface(housing);
  for (const row of KEY_ROWS) {
    const n = row.keys.length;
    row.keys.split("").forEach((ch, i) => {
      const x = row.cx + (i - (n - 1) / 2) * PITCH;
      const hit = deck.ray([x, 0.5, row.z], [0, -1, 0]);
      if (hit) {
        b.stick(keyGeometry(GLYPHS.indexOf(ch) + 1), WHITE, hit, {
          flow: [0, 0, 1],
          texture: keyTex,
        });
      }
    });
  }
  for (const s of [-1, 1]) {
    const hit = deck.ray([s * 0.133, 0.5, 0.121], [0, -1, 0]);
    if (hit) b.stick(new THREE.BoxGeometry(0.034, KH, KD), RED, hit, { flow: [0, 0, 1] });
  }
  const spaceHit = deck.ray([0, 0.5, 0.15], [0, -1, 0]);
  if (spaceHit) {
    b.stick(new THREE.BoxGeometry(0.12, KH, 0.016), CREAM, spaceHit, { flow: [0, 0, 1] });
  }

  // Carriage: chrome end plates, black platen, chrome knobs
  for (const s of [-1, 1]) {
    b.extrude(PLATE, {
      at: [s * 0.175, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.01,
      color: CHROME,
      bone: carriage,
    });
  }
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.4, 14), BLACK, {
    at: [0, PLATEN_Y, PLATEN_Z],
    dir: [1, 0, 0],
    bone: carriage,
    flat: true,
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 10), CHROME, {
      at: [s * 0.209, PLATEN_Y, PLATEN_Z],
      dir: [1, 0, 0],
      bone: carriage,
      flat: true,
    });
  }

  // Sheet of typed paper in front of the platen, leaning back, with a blank back side
  const normal = new THREE.Vector3(0, 0.2, 1).normalize();
  const up = new THREE.Vector3(0, 1, -0.2).normalize();
  const bottom = new THREE.Vector3(0, 0.215, -0.06);
  const centre = bottom.clone().addScaledVector(up, PAGE_H / 2);
  b.part(new THREE.PlaneGeometry(PAGE_W, PAGE_H), WHITE, {
    at: centre.clone().addScaledVector(normal, 0.0008),
    dir: normal,
    axis: "z",
    texture: pageTex,
    bone: carriage,
  });
  b.part(new THREE.PlaneGeometry(PAGE_W, PAGE_H), PAPER, {
    at: centre.clone().addScaledVector(normal, -0.0008),
    dir: normal.clone().negate(),
    axis: "z",
    bone: carriage,
  });

  // Carriage return lever on the operator's right, with a red grip
  b.capsule([-0.2, PLATEN_Y, PLATEN_Z], [-0.238, 0.2, -0.02], 0.0065, {
    color: CHROME,
    bone: lever,
  });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), RED, {
    at: [-0.238, 0.2, -0.02],
    bone: lever,
    flat: true,
  });

  return b.root;
}
