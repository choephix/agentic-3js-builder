import * as THREE from "three";
import { createBuilder, frame, svg, paint, arc, catmull } from "../../../../src/index";

export const meta = {
  name: "Typewriter",
  description:
    "A stylized vintage portable typewriter in sea-green enamel with chrome trim. It has glass-ringed round keys, a fanned typebar basket, a red and black ribbon on twin spools, a knurled platen with a typed letter rising from it, a margin scale and a carriage return lever.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  b.joint("root", { at: [0, 0, 0] });

  const BODY = "#2f7d74";
  const BODY_DK = "#24655e";
  const CHROME = "#d5d8dd";
  const STEEL = "#8d939b";
  const RUBBER = "#1a1a1e";
  const DARK = "#121417";
  const RED = "#b3262d";
  const CREAM = "#f3ead2";
  const FELT = "#7a1f24";

  // ---------- main body (side profile, z/y, extruded across X) ----------
  const body = b.extrude(
    [
      [-0.155, 0.008, "sharp"],
      [0.17, 0.008, "sharp"],
      [0.175, 0.045],
      [0.155, 0.05],
      [0.0, 0.088],
      [-0.03, 0.105],
      [-0.155, 0.105],
    ],
    { at: [0, 0, 0], thickness: 0.37, bevel: 0.006, color: BODY, name: "body" },
  );
  const deckY = (z: number) => 0.05 + ((0.155 - z) / 0.155) * 0.038;

  // side cheeks
  const cheeks: any[] = [];
  for (const s of [1, -1]) {
    cheeks.push(
      b.extrude(
        [
          [-0.16, 0.008, "sharp"],
          [0.172, 0.008, "sharp"],
          [0.176, 0.05],
          [0.06, 0.105],
          [-0.03, 0.135],
          [-0.16, 0.135],
        ],
        { at: [s * 0.2, 0, 0], thickness: 0.04, bevel: 0.008, smoothing: 1, color: BODY, name: "cheek" },
      ),
    );
  }

  // rubber feet
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 10), RUBBER, { at: [sx * 0.165, 0.006, sz * 0.13] });

  // dark keyboard well plate on the deck slope
  const slope = (Math.atan(0.038 / 0.155) * 180) / Math.PI;
  b.part(new THREE.BoxGeometry(0.34, 0.003, 0.16), DARK, {
    at: [0, deckY(0.075) + 0.001, 0.075],
    rotation: [slope, 0, 0],
  });

  // ---------- front nameplate & cheek emblems ----------
  const nameTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 52">
      <rect x="3" y="3" width="254" height="46" rx="10" fill="none" stroke="#d8b45a" stroke-width="3"/>
      <text x="130" y="37" font-family="Georgia, serif" font-size="30" font-weight="bold" font-style="italic" text-anchor="middle" fill="#e2c06a" letter-spacing="4">Royale</text>
    </svg>`,
    { size: 512 },
  );
  b.decal(body, nameTex, { at: [0, 0.027, 0.176], dir: [0, 0, 1], size: [0.15, 0.03] });

  const crest = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="29" fill="none" stroke="#d8b45a" stroke-width="4"/>
      <circle cx="32" cy="32" r="22" fill="#d8b45a"/>
      <text x="32" y="43" font-family="Georgia, serif" font-size="30" font-weight="bold" text-anchor="middle" fill="#24655e">R</text>
    </svg>`,
    { size: 256 },
  );
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    b.decal(cheeks[i], crest, { at: [s * 0.221, 0.07, 0.04], dir: [s, 0, 0], size: [0.045, 0.045] });
  }

  // ---------- typebar basket ----------
  const BC: [number, number, number] = [0, 0.096, -0.08];
  const half: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const a = (-90 + i * 15) * (Math.PI / 180);
    half.push([0.095 * Math.sin(a), 0.095 * Math.cos(a)]);
  }
  b.extrude(half, { at: BC, x: [1, 0, 0], y: [0, 0, 1], thickness: 0.025, bevel: 0.003, color: DARK, name: "basket" });
  b.sweep(arc([0, 0.1095, -0.08], [-0.095, 0.1095, -0.08], [0, 1, 0], 180), 0.003, { color: CHROME, sides: 6 });
  b.sweep(arc([0, 0.111, -0.08], [-0.03, 0.111, -0.08], [0, 1, 0], 180), 0.004, { color: FELT, sides: 6 });
  for (let i = 0; i <= 30; i++) {
    const a = (-82 + (164 * i) / 30) * (Math.PI / 180);
    const dx = Math.sin(a), dz = Math.cos(a);
    const outer: [number, number, number] = [dx * 0.088, 0.1105, -0.08 + dz * 0.088];
    const inner: [number, number, number] = [dx * 0.034, 0.116, -0.08 + dz * 0.034];
    b.rod(outer, inner, 0.0012, { color: STEEL, sides: 4 });
    b.part(new THREE.BoxGeometry(0.003, 0.008, 0.004), DARK, { at: outer, dir: [dx, 0, dz] });
  }
  // ribbon vibrator / type guide
  b.rod([0, 0.112, -0.075], [0, 0.146, -0.073], 0.0018, { color: CHROME, sides: 6 });
  b.part(new THREE.BoxGeometry(0.024, 0.016, 0.002), CHROME, { at: [0, 0.152, -0.072] });

  // ---------- ribbon spools ----------
  for (const s of [1, -1]) {
    const x = s * 0.135, z = -0.04, y = 0.105;
    b.lathe(
      [
        [0, 0],
        [0.026, 0],
        [0.026, 0.002],
        [0.009, 0.0025],
        [0.009, 0.0135],
        [0.026, 0.014],
        [0.026, 0.016],
        [0, 0.016],
      ],
      { at: [x, y, z], segments: 16, color: STEEL, name: "spool" },
    );
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.0055, 16), RUBBER, { at: [x, y + 0.0055, z] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.0055, 16), RED, { at: [x, y + 0.011, z] });
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 8), CHROME, { at: [x, y + 0.018, z] });
  }
  const ribbonPath = catmull([
    [-0.115, 0.112, -0.045],
    [-0.06, 0.138, -0.064],
    [-0.02, 0.152, -0.0735],
    [0.02, 0.152, -0.0735],
    [0.06, 0.138, -0.064],
    [0.115, 0.112, -0.045],
  ]);
  b.sweep(ribbonPath, () => [0.0008, 0.0026], { section: "box", shift: [0, 0.0026], color: RUBBER, caps: "flat" });
  b.sweep(ribbonPath, () => [0.0008, 0.0026], { section: "box", shift: [0, -0.0026], color: RED, caps: "flat" });

  // ---------- keyboard ----------
  const keyTexCache = new Map<string, any>();
  const keyTex = (label: string) => {
    let t = keyTexCache.get(label);
    if (!t) {
      const fs = label.length > 2 ? 15 : 32;
      t = svg(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="32" fill="#111"/>
          <circle cx="32" cy="32" r="27" fill="none" stroke="#fff" stroke-width="2.5"/>
          <text x="32" y="${label.length > 2 ? 37 : 43}" font-family="Georgia, serif" font-size="${fs}" font-weight="bold" text-anchor="middle" fill="#fff">${label}</text>
        </svg>`,
        { size: 64 },
      );
      keyTexCache.set(label, t);
    }
    return t;
  };
  const tiltDir = new THREE.Vector3(0, 1, 0.22).normalize();
  const key = (label: string, x: number, z: number, capY: number, rad = 0.0095) => {
    const c = new THREE.Vector3(x, capY, z);
    b.rod([x, capY - 0.002, z], [x, deckY(z) - 0.003, z], 0.0018, { color: STEEL, sides: 5 });
    b.part(new THREE.CylinderGeometry(rad, rad * 0.95, 0.004, 12), CHROME, { at: c, dir: tiltDir });
    b.part(new THREE.CircleGeometry(rad * 0.86, 16), CREAM, {
      at: c.clone().addScaledVector(tiltDir, 0.0022),
      dir: tiltDir,
      axis: "z",
      up: [0, 0, -1],
      texture: keyTex(label),
    });
  };
  const rows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM,."];
  const pitch = 0.024;
  rows.forEach((row, r) => {
    const z = 0.03 + r * 0.025;
    const capY = 0.115 - r * 0.012;
    const x0 = -((row.length - 1) / 2) * pitch + r * 0.006;
    for (let i = 0; i < row.length; i++) key(row[i], x0 + i * pitch, z, capY);
    if (r === 3) {
      key("SHIFT", x0 - 0.032, z, capY, 0.012);
      key("SHIFT", x0 + (row.length - 1) * pitch + 0.032, z, capY, 0.012);
    }
    if (r === 1) key("TAB", x0 - 0.03, z, capY, 0.011);
    if (r === 0) key("MAR", x0 + 9 * pitch + 0.03, z, capY, 0.011);
  });
  // space bar
  b.capsule([-0.1, 0.068, 0.137], [0.1, 0.068, 0.137], 0.0065, { color: CHROME, sides: 8 });
  for (const s of [1, -1]) b.rod([s * 0.08, 0.066, 0.135], [s * 0.08, deckY(0.115) - 0.003, 0.115], 0.002, { color: STEEL, sides: 5 });

  // ---------- carriage ----------
  b.rod([-0.24, 0.122, -0.132], [0.24, 0.122, -0.132], 0.004, { color: CHROME, sides: 8 });
  b.rod([-0.24, 0.122, -0.098], [0.24, 0.122, -0.098], 0.004, { color: CHROME, sides: 8 });
  b.part(new THREE.BoxGeometry(0.46, 0.025, 0.06), BODY_DK, { at: [0, 0.145, -0.115] });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.145, 0.13],
        [-0.075, 0.13],
        [-0.075, 0.16],
        [-0.09, 0.205],
        [-0.115, 0.212],
        [-0.142, 0.185],
      ],
      { at: [s * 0.215, 0, 0], thickness: 0.01, bevel: 0.002, smoothing: 1, color: BODY, name: "carriagePlate" },
    );
  }
  // margin stops
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.008, 0.012, 0.012), CHROME, { at: [s * 0.13, 0.162, -0.13] });

  // margin scale
  let ticks = "";
  for (let i = 0; i <= 100; i++) {
    const x = 2 + i * 3.96;
    const h = i % 10 === 0 ? 7 : i % 5 === 0 ? 5 : 3;
    ticks += `<rect x="${x.toFixed(2)}" y="0" width="1.2" height="${h}" fill="#111"/>`;
    if (i % 10 === 0 && i > 0 && i < 100) ticks += `<text x="${x.toFixed(2)}" y="11.5" font-family="Arial" font-size="5" text-anchor="middle" fill="#111">${i}</text>`;
  }
  const ruler = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 12"><rect width="400" height="12" fill="#fff"/>${ticks}</svg>`,
    { size: 1024 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.012), CREAM, { at: [0, 0.145, -0.0843], dir: [0, 0, 1], axis: "z", texture: ruler });

  // platen
  const PY = 0.185, PZ = -0.1;
  b.rod([-0.205, PY, PZ], [0.205, PY, PZ], 0.024, { color: RUBBER, sides: 16 });
  const knurl = paint((_p, _n, s) => (Math.floor((((s[1] % 360) + 360) % 360) / 12) % 2 ? RUBBER : "#34343c"));
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.006, 16), CHROME, { at: [s * 0.208, PY, PZ], dir: [1, 0, 0] });
    b.rod([s * 0.2, PY, PZ], [s * 0.236, PY, PZ], 0.005, { color: CHROME, sides: 8 });
    b.lathe(
      [
        [0, 0],
        [0.012, 0],
        [0.012, 0.008],
        [0.025, 0.011],
        [0.027, 0.03],
        [0.023, 0.036],
        [0, 0.036],
      ],
      { at: [s * 0.232, PY, PZ], axis: [s, 0, 0], segments: 24, color: knurl, name: "knob" },
    );
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.003, 14), CHROME, { at: [s * 0.2695, PY, PZ], dir: [1, 0, 0] });
  }

  // paper rest
  b.part(new THREE.BoxGeometry(0.36, 0.004, 0.09), STEEL, { at: [0, 0.225, -0.135], rotation: [55, 0, 0] });

  // paper bail with rollers
  const bailY = 0.203, bailZ = -0.0786;
  b.rod([-0.17, bailY, bailZ], [0.17, bailY, bailZ], 0.0025, { color: CHROME, sides: 8 });
  for (const x of [-0.1, 0.02, 0.1])
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.014, 10), RUBBER, { at: [x, bailY, bailZ], dir: [1, 0, 0] });
  for (const s of [1, -1]) b.rod([s * 0.17, bailY, bailZ], [s * 0.21, 0.19, -0.09], 0.0025, { color: CHROME, sides: 6 });

  // carriage return lever (typist's left = model's right, -X)
  const leverPath = catmull([
    [-0.215, 0.2, -0.09],
    [-0.235, 0.214, -0.07],
    [-0.252, 0.224, -0.035],
    [-0.258, 0.222, -0.005],
  ]);
  b.sweep(leverPath, 0.0035, { color: CHROME, sides: 6 });
  b.capsule([-0.258, 0.222, -0.005], [-0.27, 0.222, 0.01], 0.006, { color: RUBBER, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.01, 10), CHROME, { at: [-0.215, 0.2, -0.09], dir: [1, 0, 0] });

  // ---------- the sheet of paper ----------
  const lines = [
    "Dear friend,",
    "",
    "The keys still clack like rain",
    "on a tin roof, and every bell",
    "at the margin sounds like a",
    "small round of applause.",
    "I typed this by the window,",
    "coffee going cold beside me.",
    "",
    "Yours, in ink and ribbon -",
    "P.S. the quick brown fox_",
  ];
  let txt = "";
  lines.forEach((l, i) => {
    if (l) txt += `<text x="18" y="${96 + i * 14}">${l}</text>`;
  });
  const paperTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 250">
      <rect width="210" height="250" fill="#f8f4e9"/>
      <text x="105" y="62" font-family="Courier New, Courier, monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#b3262d" letter-spacing="2">A  LETTER</text>
      <rect x="70" y="66" width="70" height="1.4" fill="#b3262d"/>
      <g font-family="Courier New, Courier, monospace" font-size="9.5" font-weight="bold" fill="#2a2a2a">${txt}</g>
    </svg>`,
    { size: 512 },
  );
  b.cards([frame([0.02, 0.206, -0.094], [0, 1, 0])], paperTex, {
    size: [0.21, 0.25],
    lean: 16,
    bend: 14,
    flow: [0, 0, -1],
    mirror: true,
    color: "#ffffff",
  });

  return b.root;
}
