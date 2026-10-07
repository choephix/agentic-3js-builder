import * as THREE from "three";
import { createBuilder, paint, grain, svg, polyline, catmull } from "../../../../src/index";

export const meta = {
  name: "Jukebox",
  description:
    "1950s arch-top jukebox: walnut cabinet with a rainbow light-tube arch, a sunburst record window with a spinning vinyl and tonearm, a chrome selector panel with buttons and volume knob, a title-strip display, a gold-cloth speaker grille, lacquered side panels and a power cord.",
};

type V3 = [number, number, number];

// ---------- dimensions (meters) ----------
const CY = 1.08; // centre height of the dome arc
const RX = 0.49; // half width of the cabinet
const RY = 1.04; // record centre height
const RZ = 0.352; // record centre depth
const PX = 0.235; // tonearm pivot
const PY = 0.845;
const TX = 0.105; // tonearm stylus point
const TY = 0.985;
const AZ = 0.362; // tonearm height off the front

// ---------- palette ----------
const CHROME = "#d9e0e6";
const CHROME_DK = "#9aa6b0";
const CREAM = "#f3e7c9";
const BLACK = "#16151a";
const PANEL_DK = "#1d1816";
const PLINTH = "#2e1a11";
const WOOD_A = "#7a4224";
const WOOD_B = "#552a15";
const PALE_A = "#dcab6c";
const PALE_B = "#c28c4e";
const RED = "#d8312b";
const RED_LAC = "#9c2a1e";
const ORANGE = "#ff7a1a";
const YELLOW = "#ffd23f";
const GREEN = "#37b24d";
const BLUE = "#2f8fe0";
const MAROON = "#2a0e10";
const CLOTH_A = "#b98b3d";
const CLOTH_B = "#a27832";
const BACKPANEL = "#33201a";
const CORD = "#1b1b1f";
const GLOSS = "#fff6dc";

// ---------- shape helpers (pure maths) ----------
// front-view outline of an arch-topped slab, for extrude
const archShape = (rx: number, yb: number, n = 16): [number, number][] => {
  const o: [number, number][] = [
    [-rx, yb],
    [rx, yb],
  ];
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI;
    o.push([rx * Math.cos(a), CY + rx * Math.sin(a)]);
  }
  return o;
};

// closed loop round an arch-topped window, starting at the apex
const archLoop = (rx: number, yb: number, z: number, n = 8): V3[] => {
  const pts: V3[] = [];
  for (let k = 0; k <= n; k++) {
    const a = Math.PI / 2 + (k / n) * (Math.PI / 2);
    pts.push([rx * Math.cos(a), CY + rx * Math.sin(a), z]);
  }
  pts.push([-rx, yb, z], [rx, yb, z]);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * (Math.PI / 2);
    pts.push([rx * Math.cos(a), CY + rx * Math.sin(a), z]);
  }
  return pts;
};

// open rail up one side, over the dome and down the other
const archRail = (rx: number, yb: number, z: number, n = 24): V3[] => {
  const pts: V3[] = [[rx, yb, z]];
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI;
    pts.push([rx * Math.cos(a), CY + rx * Math.sin(a), z]);
  }
  pts.push([-rx, yb, z]);
  return pts;
};

// closed rectangle in the YZ plane at a fixed x, starting mid-edge
const sideFrame = (x: number, yc: number, hy: number, hz: number): V3[] => [
  [x, yc + hy, 0],
  [x, yc + hy, hz],
  [x, yc - hy, hz],
  [x, yc - hy, -hz],
  [x, yc + hy, -hz],
];

export default function build() {
  const b = createBuilder({ name: "jukebox" });

  // ---------- skeleton ----------
  const base = b.joint("base", { at: [0, 0, 0] });
  const record = b.joint("record", { parent: base, at: [0, RY, RZ], dir: [0, 0, 1] });
  const tonearm = b.joint("tonearm", { parent: base, at: [PX, PY, AZ], aim: [TX, TY, AZ] });
  const knob = b.joint("volumeKnob", { parent: base, at: [-0.355, 0.553, 0.38], dir: [0, 0, 1] });

  // ---------- helpers ----------
  const box = (sx: number, sy: number, sz: number, color: string, at: V3, o: object = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone: base, at, ...o });
  const disc = (r: number, h: number, seg: number, color: string, at: V3, o: object = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone: base, at, dir: [0, 0, 1], flat: true, ...o });
  const rod = (a: V3, c: V3, r: number, color: string, o: object = {}) =>
    b.rod(a, c, r, { color, bone: base, sides: 6, ...o });

  // ---------- paints ----------
  const wood = grain(WOOD_A, WOOD_B, { size: 0.05, axis: "y", seed: 2 });
  const paleWood = grain(PALE_A, PALE_B, { size: 0.04, axis: "z", seed: 5 });
  const cloth = paint((p) => ((Math.floor(p.x / 0.009) + Math.floor(p.y / 0.009)) & 1 ? CLOTH_A : CLOTH_B));
  const burst = paint((p) => {
    const a = Math.atan2(p.y - RY, p.x);
    const ray = Math.floor((a + Math.PI) / (Math.PI / 10)) % 2 === 0;
    const d = Math.hypot(p.x, p.y - RY);
    if (d < 0.24) return ray ? "#ffe27a" : "#ffcb45";
    if (d > 0.33) return ray ? "#f08c12" : "#e07a0a";
    return ray ? "#ffbb30" : "#f79a1a";
  });
  const vinyl = paint((p) => {
    const dx = p.x;
    const dy = p.y - RY;
    const d = Math.hypot(dx, dy);
    if (d < 0.014) return "#0c0c0f";
    if (d < 0.026) return "#f3e7c9";
    if (d < 0.062) return "#d8312b";
    if (d < 0.074 || d > 0.176) return "#0e0e12";
    const sheen = Math.abs(Math.sin(2 * Math.atan2(dy, dx) - 0.9)) > 0.94;
    const g = Math.floor(d / 0.006) % 2 === 0;
    if (sheen) return g ? "#3a3a44" : "#30303a";
    return g ? "#1f1f25" : "#17171c";
  });

  // ---------- textures ----------
  const letters = (str: string, x0: number, y: number) =>
    [...str].map((ch, i) => `<text x="${(x0 + i * 18.4).toFixed(1)}" y="${y}">${ch}</text>`).join("");
  const panelTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 336 52">
      <rect width="336" height="52" rx="3" fill="#1d1816"/>
      <rect x="2" y="2" width="332" height="48" rx="3" fill="none" stroke="#d9a63a" stroke-width="1.2"/>
      <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="7" fill="#f3e7c9" text-anchor="middle">
        ${letters("ABCDE", 60, 11)}${letters("FGHJK", 202.4, 11)}
        ${letters("12345", 60, 47)}${letters("67890", 202.4, 47)}
        <text x="26" y="11" font-size="6">VOL</text>
        <text x="310" y="12" font-size="6.5">COIN</text>
      </g>
      <rect x="143" y="7" width="50" height="38" rx="6" fill="#e0a93c" stroke="#7a4a12" stroke-width="1.2"/>
      <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" fill="#4a2414" text-anchor="middle">
        <text x="168" y="23" font-size="9.5">MELODY</text>
        <rect x="150" y="26.5" width="36" height="1.2"/>
        <text x="168" y="38" font-size="10.5">KING</text>
      </g>
    </svg>`,
    { size: 1024 },
  );

  const pastel = ["#f4c2a1", "#bfe3d0", "#f7e08a", "#c4d4f0", "#f2b5b5", "#d9c8ea"];
  let cards = "";
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      const x = 2 + c * 27.5;
      const y = 2 + r * 11;
      const w1 = 12 + ((c * 5 + r * 3) % 4) * 2;
      const w2 = 8 + ((c * 3 + r) % 5) * 2;
      cards +=
        `<rect x="${x}" y="${y}" width="26" height="9.5" rx="1" fill="${pastel[(r * 3 + c * 2) % 6]}"/>` +
        `<rect x="${x + 2}" y="${y + 2}" width="${w1}" height="1.4" fill="#3a2a22"/>` +
        `<rect x="${x + 2}" y="${y + 5.2}" width="${w2}" height="1.4" fill="#6a5448"/>`;
    }
  }
  const titleTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 24"><rect width="224" height="24" fill="#efe3c2"/>${cards}</svg>`,
    { size: 768 },
  );

  const noteTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 60"><g fill="#7b2d06">
      <ellipse cx="11" cy="50" rx="8" ry="6" transform="rotate(-20 11 50)"/>
      <ellipse cx="31" cy="44" rx="8" ry="6" transform="rotate(-20 31 44)"/>
      <rect x="17" y="8" width="3.5" height="42"/>
      <rect x="37" y="2" width="3.5" height="42"/>
      <polygon points="17,8 40.5,2 40.5,12 17,18"/>
    </g></svg>`,
    { size: 128 },
  );

  const emblemTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#d9a63a"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#a87a1e" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#a87a1e" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke="#a87a1e" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="23" fill="#7a1f16"/>
      <ellipse cx="44" cy="58" rx="5.5" ry="4" fill="#f3e7c9" transform="rotate(-20 44 58)"/>
      <rect x="47.6" y="35" width="2.4" height="23" fill="#f3e7c9"/>
      <path d="M50 35 q9 3 8 13 q-2 -6 -8 -6z" fill="#f3e7c9"/>
      <circle cx="50" cy="50" r="2" fill="#2a0e10"/>
    </svg>`,
    { size: 256 },
  );

  // ---------- plinth and cabinet ----------
  b.extrude(
    [
      [-0.52, 0],
      [0.52, 0],
      [0.52, 0.05],
      [0.505, 0.085],
      [-0.505, 0.085],
      [-0.52, 0.05],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.7, color: PLINTH, bone: base, name: "plinth" },
  );
  rod([-0.5, 0.068, 0.352], [0.5, 0.068, 0.352], 0.006, CHROME);

  b.extrude(archShape(RX, 0.08, 20), {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.66,
    bevel: 0.02,
    detail: 0.4,
    color: wood,
    bone: base,
    name: "cabinet",
  });

  // chrome edge rails front and back, ridge lines on the dome
  for (const z of [0.328, -0.328]) {
    b.sweep(polyline(archRail(0.482, 0.1, z)), 0.009, { color: CHROME, bone: base, sides: 6 });
  }
  for (const deg of [-38, 0, 38]) {
    const a = (deg * Math.PI) / 180;
    const r = RX + 0.003;
    const x = r * Math.sin(a);
    const y = CY + r * Math.cos(a);
    rod([x, y, -0.3], [x, y, 0.3], deg === 0 ? 0.01 : 0.007, CHROME);
  }

  // ---------- speaker grille ----------
  box(0.88, 0.025, 0.028, CHROME, [0, 0.1175, 0.341]);
  box(0.88, 0.025, 0.028, CHROME, [0, 0.4425, 0.341]);
  for (const s of [1, -1]) box(0.025, 0.3, 0.028, CHROME, [s * 0.4275, 0.28, 0.341]);
  b.part(new THREE.BoxGeometry(0.86, 0.3, 0.006), cloth, { bone: base, at: [0, 0.28, 0.336] });
  for (let i = 0; i < 13; i++) {
    const x = -0.36 + i * 0.06;
    const top = 0.345 + 0.075 * (1 - (x / 0.38) ** 2);
    b.capsule([x, 0.155, 0.343], [x, top, 0.343], 0.011, { color: CHROME, bone: base, sides: 8 });
  }
  rod([-0.405, 0.215, 0.349], [0.405, 0.215, 0.349], 0.005, CHROME_DK);
  for (const s of [1, -1]) {
    disc(0.007, 0.006, 6, CHROME_DK, [s * 0.4275, 0.45, 0.357]);
    disc(0.007, 0.006, 6, CHROME_DK, [s * 0.4275, 0.11, 0.357]);
  }

  // ---------- selector panel ----------
  box(0.9, 0.19, 0.05, CHROME, [0, 0.555, 0.345]);
  box(0.84, 0.13, 0.008, PANEL_DK, [0, 0.555, 0.374]);
  b.part(new THREE.PlaneGeometry(0.84, 0.13), "#ffffff", {
    bone: base,
    at: [0, 0.555, 0.3785],
    dir: [0, 0, 1],
    axis: "z",
    texture: panelTex,
  });

  const rowsY = [0.5675, 0.5375];
  const banks = [
    { x0: -0.27, caps: [RED, CREAM] },
    { x0: 0.086, caps: [CREAM, RED] },
  ];
  for (const bank of banks) {
    for (let i = 0; i < 5; i++) {
      for (let r = 0; r < 2; r++) {
        const x = bank.x0 + i * 0.046;
        disc(0.0135, 0.006, 10, CHROME, [x, rowsY[r], 0.382]);
        disc(0.0105, 0.01, 10, bank.caps[r], [x, rowsY[r], 0.386]);
      }
    }
  }

  // volume knob (rides its own joint)
  disc(0.026, 0.022, 12, CHROME, [-0.355, 0.553, 0.391], { bone: knob });
  disc(0.018, 0.004, 12, BLACK, [-0.355, 0.553, 0.404], { bone: knob });
  box(0.004, 0.016, 0.003, RED, [-0.355, 0.565, 0.4065], { bone: knob });

  // coin slot
  box(0.04, 0.072, 0.01, CHROME, [0.355, 0.537, 0.384]);
  box(0.006, 0.044, 0.004, BLACK, [0.355, 0.537, 0.3905]);

  // ---------- title strip display ----------
  box(0.6, 0.082, 0.03, CHROME, [0, 0.696, 0.345]);
  b.part(new THREE.PlaneGeometry(0.56, 0.06), "#ffffff", {
    bone: base,
    at: [0, 0.696, 0.3615],
    dir: [0, 0, 1],
    axis: "z",
    texture: titleTex,
  });

  // ---------- arch window ----------
  b.extrude(archShape(0.452, 0.755, 20), {
    at: [0, 0, 0.334],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    color: MAROON,
    bone: base,
    name: "channel",
  });
  b.sweep(polyline(archLoop(0.458, 0.752, 0.34, 10), { closed: true }), 0.011, {
    color: CHROME,
    bone: base,
    sides: 8,
  });
  b.extrude(archShape(0.3, 0.775, 14), {
    at: [0, 0, 0.3405],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    color: burst,
    bone: base,
    name: "backdrop",
  });
  b.sweep(polyline(archLoop(0.308, 0.775, 0.345, 7), { closed: true }), 0.018, {
    color: CHROME,
    bone: base,
    sides: 8,
  });

  // little music notes on the glowing backdrop
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.05, 0.068), "#ffffff", {
      bone: base,
      at: [s * 0.245, 1.03, 0.3455],
      dir: [0, 0, 1],
      axis: "z",
      texture: noteTex,
    });
  }

  // rainbow light tubes round the arch
  const tubePts = (r: number, z: number, yb: number): V3[] => {
    const pts: V3[] = [
      [r, yb, z],
      [r, (yb + CY) / 2, z],
    ];
    const n = 24;
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * Math.PI;
      pts.push([r * Math.cos(a), CY + r * Math.sin(a), z]);
    }
    pts.push([-r, (yb + CY) / 2, z], [-r, yb, z]);
    return pts;
  };
  const lightPath = polyline(tubePts(0.385, 0.352, 0.8));
  const TUBE_COLORS = [RED, ORANGE, YELLOW, GREEN, BLUE, GREEN, YELLOW, ORANGE, RED];
  b.sweep(lightPath, 0.036, {
    color: BLUE,
    bone: base,
    caps: "flat",
    bands: TUBE_COLORS.map((c, i) => [(i + 1) / TUBE_COLORS.length, c] as [number, string]),
  });
  // glass highlight line
  b.sweep(polyline(tubePts(0.373, 0.384, 0.82)), 0.0045, { color: GLOSS, bone: base, caps: "flat", sides: 5 });
  // chrome clamps between the tube sections
  for (let i = 0; i <= TUBE_COLORS.length; i++) {
    const t = Math.min(0.994, Math.max(0.006, i / TUBE_COLORS.length));
    const at = lightPath.at(t);
    const dir = lightPath.tangentAt(t);
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.014, 10), CHROME, { bone: base, at, dir, flat: true });
    b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.024, 10), CHROME_DK, { bone: base, at, dir, flat: true });
  }

  // jewels on the outer ring
  for (const [deg, col, size] of [
    [45, RED, 0.02],
    [90, YELLOW, 0.026],
    [135, RED, 0.02],
  ] as [number, string, number][]) {
    const a = (deg * Math.PI) / 180;
    const x = 0.458 * Math.cos(a);
    const y = CY + 0.458 * Math.sin(a);
    disc(0.027, 0.012, 10, CHROME, [x, y, 0.344]);
    b.part(new THREE.IcosahedronGeometry(size, 0), col, { bone: base, at: [x, y, 0.358], flat: true });
  }

  // ---------- record, spindle and tonearm ----------
  b.part(new THREE.CylinderGeometry(0.185, 0.185, 0.008, 28), vinyl, {
    bone: record,
    at: [0, RY, RZ],
    dir: [0, 0, 1],
  });
  disc(0.007, 0.014, 8, CHROME, [0, RY, RZ + 0.011], { bone: record });

  const alen = Math.hypot(TX - PX, TY - PY);
  const ux = (TX - PX) / alen;
  const uy = (TY - PY) / alen;
  const nx = uy;
  const ny = -ux;
  const armPt = (a: number, w: number): V3 => [PX + ux * a + nx * w, PY + uy * a + ny * w, AZ];
  const armPath = catmull([armPt(-0.05, 0), armPt(0, 0), armPt(0.07, 0.012), armPt(0.14, 0.009), armPt(alen, 0)]);
  b.sweep(armPath, 0.0055, { color: CHROME, bone: tonearm, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.032, 8), CHROME_DK, {
    bone: tonearm,
    at: armPt(-0.05, 0),
    dir: [ux, uy, 0],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.022, 0.03, 0.006), BLACK, {
    bone: tonearm,
    at: armPt(alen + 0.004, 0),
    dir: [ux, uy, 0],
  });
  b.part(new THREE.ConeGeometry(0.0035, 0.012, 5), CHROME, {
    bone: tonearm,
    at: [TX, TY, 0.3605],
    dir: [0, 0, -1],
    flat: true,
  });
  disc(0.032, 0.014, 12, CHROME, [PX, PY, 0.354]);
  disc(0.016, 0.008, 10, BLACK, [PX, PY, 0.364], { bone: tonearm });

  // ---------- sides ----------
  for (const s of [1, -1]) {
    // lower red lacquer panel with chrome speed lines
    box(0.008, 0.31, 0.53, RED_LAC, [s * 0.494, 0.28, 0]);
    b.sweep(polyline(sideFrame(s * 0.4975, 0.28, 0.1625, 0.2725), { closed: true }), 0.0045, {
      color: CHROME,
      bone: base,
      sides: 6,
    });
    for (let i = 0; i < 6; i++) {
      const y = 0.19 + i * 0.036;
      rod([s * 0.5, y, -0.22], [s * 0.5, y, 0.22 - i * 0.035], 0.004, CHROME, { sides: 5 });
    }
    // chrome trim between the panels
    rod([s * 0.495, 0.465, -0.3], [s * 0.495, 0.465, 0.3], 0.006, CHROME);
    rod([s * 0.495, 0.492, -0.3], [s * 0.495, 0.492, 0.3], 0.004, CHROME_DK, { sides: 5 });
    // upper pale-wood panel with the gold-record emblem
    b.part(new THREE.BoxGeometry(0.008, 0.5, 0.53), paleWood, { bone: base, at: [s * 0.494, 0.78, 0] });
    b.sweep(polyline(sideFrame(s * 0.4975, 0.78, 0.2575, 0.2725), { closed: true }), 0.0045, {
      color: CHROME,
      bone: base,
      sides: 6,
    });
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      bone: base,
      at: [s * 0.5, 0.78, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: emblemTex,
    });
  }

  // ---------- back ----------
  box(0.74, 0.84, 0.01, BACKPANEL, [0, 0.55, -0.335]);
  for (let i = 0; i < 9; i++) box(0.5, 0.012, 0.004, BLACK, [0, 0.8 + i * 0.02, -0.3405]);
  for (const x of [-0.34, 0.34]) {
    for (const y of [0.15, 0.55, 0.95]) disc(0.01, 0.005, 6, CHROME_DK, [x, y, -0.3425], { dir: [0, 0, -1] });
  }
  box(0.12, 0.06, 0.003, CHROME, [-0.2, 0.25, -0.3415]);
  disc(0.02, 0.008, 8, BLACK, [0.12, 0.2, -0.344], { dir: [0, 0, -1] });

  // power cord lying on the floor, ending in a plug
  const cordPts: V3[] = [
    [0.12, 0.2, -0.338],
    [0.12, 0.11, -0.39],
    [0.105, 0.04, -0.43],
    [0.06, 0.012, -0.47],
    [-0.02, 0.012, -0.52],
    [-0.09, 0.012, -0.55],
    [-0.12, 0.012, -0.585],
    [-0.12, 0.012, -0.6],
  ];
  b.sweep(catmull(cordPts), 0.01, { color: CORD, bone: base, sides: 6 });
  box(0.04, 0.025, 0.05, CORD, [-0.12, 0.0125, -0.625]);
  box(0.006, 0.003, 0.02, CHROME_DK, [-0.132, 0.0125, -0.66]);
  box(0.006, 0.003, 0.02, CHROME_DK, [-0.108, 0.0125, -0.66]);

  return b.root;
}
