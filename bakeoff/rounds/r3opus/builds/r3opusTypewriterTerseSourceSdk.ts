import * as THREE from "three";
import { createBuilder, svg, paint, mottle } from "../../../../src/index";

export const meta = {
  name: "Aurora De Luxe Typewriter",
  description:
    "A 1950s portable typewriter in two-tone seafoam and cream: round chrome-ringed keys with lettered caps, a fanned typebar basket, red-and-black ribbon spools, a sliding carriage with bakelite knobs, a return lever and a half-typed letter in the platen.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });

  // ---------- skeleton (carriage slides, platen turns, lever swings)
  b.joint("root", { at: [0, 0, 0] });
  b.joint("carriage", { at: [0, 0.15, -0.1], parent: "root" });
  b.joint("platen", { at: [0, 0.19, -0.07], dir: [1, 0, 0], parent: "carriage", role: "hinge" });
  b.joint("returnLever", { at: [-0.214, 0.205, -0.062], parent: "carriage", role: "hinge" });

  // ---------- palette
  const CHROME = "#c9ced4";
  const TRIM = "#24302e";
  const RUBBER = "#161616";
  const KNOB = "#121212";
  const RED = "#b3202a";
  const INK = "#151515";
  const PAPER = "#f6f0e1";
  const chrome = b.material(CHROME);
  chrome.metalness = 0.75;
  chrome.roughness = 0.28;
  const knobMat = b.material(KNOB);
  knobMat.roughness = 0.35;

  const teal = mottle("#4f8f86", "#5c9c92", { size: 0.025, seed: 3, contrast: 0.6 });
  const cream = mottle("#ece1c6", "#e2d5b6", { size: 0.03, seed: 5, contrast: 0.6 });
  const bodyPaint = paint((p) => (p.y > 0.098 ? cream : teal));

  // ---------- body shell (side profile, z forward / y up)
  b.extrude(
    [
      [0.17, 0.006],
      [0.17, 0.034],
      [0.163, 0.042],
      [0.06, 0.074],
      [0.046, 0.08],
      [0.041, 0.124],
      [0.03, 0.133],
      [0.02, 0.135],
      [-0.13, 0.135],
      [-0.165, 0.125],
      [-0.17, 0.11],
      [-0.17, 0.006],
    ],
    { color: bodyPaint, at: [0, 0, 0], thickness: 0.4, bevel: 0.008, bone: "root", name: "body" },
  );
  b.ctx.paintMaterial().roughness = 0.42;

  // rubber feet
  const foot = new THREE.CylinderGeometry(0.012, 0.014, 0.01, 10);
  for (const x of [-0.17, 0.17])
    for (const z of [-0.14, 0.14]) b.part(foot, RUBBER, { at: [x, 0.005, z], bone: "root" });

  // chrome trim along the two-tone line
  for (const x of [-0.2015, 0.2015]) b.rod([x, 0.098, -0.166], [x, 0.098, 0.043], 0.0018, { color: CHROME, bone: "root", sides: 6 });
  b.rod([-0.198, 0.098, -0.1715], [0.198, 0.098, -0.1715], 0.0018, { color: CHROME, bone: "root", sides: 6 });
  for (const s of [-1, 1])
    b.rod([s * 0.068, 0.098, 0.0435], [s * 0.196, 0.098, 0.0435], 0.0018, { color: CHROME, bone: "root", sides: 6 });

  // nameplate on the riser
  const plateTex = svg(
    `<svg viewBox="0 0 240 44" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="238" height="42" rx="8" fill="#7a1f1f" stroke="#d9b45a" stroke-width="3"/>
      <text x="120" y="31" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="28" text-anchor="middle" fill="#e8c46a">Aurora</text>
      <text x="22" y="27" font-family="Arial" font-size="10" fill="#e8c46a">DE</text>
      <text x="200" y="27" font-family="Arial" font-size="10" fill="#e8c46a">LUXE</text>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.BoxGeometry(0.118, 0.026, 0.002), CHROME, { at: [0, 0.104, 0.0435], rotation: [-6, 0, 0], bone: "root" });
  b.part(new THREE.PlaneGeometry(0.112, 0.021), "#ffffff", {
    at: [0, 0.104, 0.0452],
    rotation: [-6, 0, 0],
    texture: plateTex,
    bone: "root",
    name: "nameplate",
  });

  // ---------- keyboard
  const rows = ["ZXCVBNM,./", "ASDFGHJKL;", "QWERTYUIOP", "1234567890"];
  const glyphs: string[] = [...rows.join(""), "SHIFT", "SHIFT", "BACK"];
  const cellOf = (g: string, nth = 0) => {
    let seen = 0;
    for (let i = 0; i < glyphs.length; i++) if (glyphs[i] === g && seen++ === nth) return i;
    return 0;
  };
  const glyphMarkup = glyphs
    .map((g, i) => {
      const col = i % 8;
      const row = Math.floor(i / 8);
      let content: string;
      if (g === "SHIFT")
        content = `<path d="M50 18 L80 50 L63 50 L63 80 L37 80 L37 50 L20 50 Z" fill="#f3ead2"/>`;
      else if (g === "BACK")
        content = `<path d="M18 50 L46 24 L46 40 L82 40 L82 60 L46 60 L46 76 Z" fill="#f3ead2"/>`;
      else
        content = `<text x="50" y="67" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="48" text-anchor="middle" fill="#f3ead2">${g}</text>`;
      return `<g transform="translate(${col * 100},${row * 100})"><circle cx="50" cy="50" r="50" fill="#171717"/><circle cx="50" cy="50" r="43" fill="none" stroke="#3b3b3b" stroke-width="3"/>${content}</g>`;
    })
    .join("");
  const keyTex = svg(`<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">${glyphMarkup}</svg>`, { size: 1024 });

  const ringGeo = new THREE.CylinderGeometry(0.0078, 0.0078, 0.0035, 14);
  const tilt = (8 * Math.PI) / 180;
  const n = new THREE.Vector3(0, Math.cos(tilt), Math.sin(tilt));
  const surfaceY = (z: number) => 0.042 + (0.163 - z) * 0.3107;
  let keyMat: THREE.Material | null = null;

  const key = (x: number, y: number, z: number, cell: number) => {
    const c = new THREE.Vector3(x, y, z);
    b.rod([x, y - 0.002, z], [x, surfaceY(z - 0.006) - 0.004, z - 0.006], 0.0012, { color: TRIM, bone: "root", sides: 4 });
    b.part(ringGeo, CHROME, { at: c, dir: n, bone: "root" });
    const top = new THREE.CircleGeometry(0.0066, 16);
    const uv = top.getAttribute("uv") as THREE.BufferAttribute;
    const col = cell % 8;
    const row = Math.floor(cell / 8);
    for (let i = 0; i < uv.count; i++) {
      const u = 0.5 + (uv.getX(i) - 0.5) * 0.96;
      const v = 0.5 + (uv.getY(i) - 0.5) * 0.96;
      uv.setXY(i, (col + u) / 8, 1 - (row + 1) / 6 + v / 6);
    }
    const p = b.part(top, "#ffffff", {
      at: c.clone().addScaledVector(n, 0.00185),
      dir: n,
      axis: "z",
      up: [0, 0, -1],
      texture: keyTex,
      bone: "root",
    });
    if (!keyMat) {
      keyMat = p.mesh.material as THREE.Material;
      (keyMat as THREE.MeshStandardMaterial).roughness = 0.3;
    }
  };

  const pitch = 0.019;
  const shifts = [0.012, 0.006, 0.0, -0.006];
  rows.forEach((letters, r) => {
    const z = 0.152 - r * 0.021;
    const y = 0.058 + r * 0.0125;
    const x0 = -4.5 * pitch + shifts[r];
    [...letters].forEach((g, i) => key(x0 + i * pitch, y, z, cellOf(g)));
    if (r === 0) {
      key(x0 - 0.024, y, z, cellOf("SHIFT", 0));
      key(x0 + 9 * pitch + 0.024, y, z, cellOf("SHIFT", 1));
    }
    if (r === 3) key(x0 + 9 * pitch + 0.024, y, z, cellOf("BACK"));
  });

  // space bar
  b.capsule([-0.085, 0.047, 0.177], [0.085, 0.047, 0.177], 0.0045, { color: CHROME, bone: "root", sides: 8 });
  for (const s of [-1, 1])
    b.rod([s * 0.07, 0.046, 0.176], [s * 0.07, 0.03, 0.158], 0.0016, { color: TRIM, bone: "root", sides: 5 });

  // ---------- typebar basket
  b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.004, 20, 1, false, -Math.PI / 2, Math.PI), "#1b1f22", {
    at: [0, 0.1365, -0.045],
    bone: "root",
  });
  b.part(new THREE.TorusGeometry(0.066, 0.0025, 6, 24, Math.PI), CHROME, {
    at: [0, 0.1385, -0.045],
    rotation: [90, 0, 0],
    bone: "root",
  });
  const slug = new THREE.BoxGeometry(0.0035, 0.004, 0.006);
  for (let i = 0; i < 28; i++) {
    const th = ((-80 + (160 * i) / 27) * Math.PI) / 180;
    const sx = Math.sin(th);
    const cz = Math.cos(th);
    const outer: [number, number, number] = [0.061 * sx, 0.1395, -0.045 + 0.061 * cz];
    const inner: [number, number, number] = [0.024 * sx, 0.1455, -0.045 + 0.024 * cz];
    b.rod(outer, inner, 0.0011, { color: CHROME, bone: "root", sides: 4 });
    b.part(slug, "#3a3d40", { at: inner, aim: [0, 0.1455, -0.045], axis: "z", bone: "root" });
  }
  // type guide and ribbon vibrator in front of the platen
  b.part(new THREE.BoxGeometry(0.03, 0.016, 0.002), CHROME, { at: [0, 0.166, -0.0465], bone: "root" });
  b.part(new THREE.BoxGeometry(0.026, 0.006, 0.0012), RED, { at: [0, 0.169, -0.0448], bone: "root" });
  b.part(new THREE.BoxGeometry(0.026, 0.006, 0.0012), INK, { at: [0, 0.163, -0.0448], bone: "root" });
  b.rod([0, 0.158, -0.046], [0, 0.14, -0.04], 0.0015, { color: CHROME, bone: "root", sides: 5 });

  // ---------- ribbon spools
  for (const s of [-1, 1]) {
    const x = s * 0.12;
    b.part(new THREE.CylinderGeometry(0.03, 0.027, 0.01, 20), CHROME, { at: [x, 0.139, -0.03], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.005, 18), INK, { at: [x, 0.1465, -0.03], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.005, 18), RED, { at: [x, 0.1515, -0.03], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.024, 10), CHROME, { at: [x, 0.15, -0.03], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.004, 8), KNOB, { at: [x, 0.163, -0.03], bone: "root" });
    for (const [dy, col] of [
      [0.003, RED],
      [-0.003, INK],
    ] as const)
      b.frustumBox([s * 0.098, 0.149 + dy, -0.032], [s * 0.014, 0.166 + dy, -0.045], [0.0008, 0.006], [0.0008, 0.006], {
        color: col,
        up: [0, 1, 0],
        bone: "root",
      });
  }

  // ---------- carriage
  b.part(new THREE.BoxGeometry(0.46, 0.02, 0.03), TRIM, { at: [0, 0.145, -0.1], bone: "carriage", name: "carriageRail" });
  const rulerTex = svg(
    `<svg viewBox="0 0 360 14" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="14" fill="#efe7d2"/>${Array.from(
      { length: 60 },
      (_, i) => `<rect x="${i * 6 + 2}" y="0" width="0.8" height="${i % 10 === 0 ? 7 : i % 5 === 0 ? 5 : 3}" fill="#222"/>`,
    ).join("")}${Array.from(
      { length: 6 },
      (_, i) => `<text x="${i * 60 + 2}" y="13" font-family="Arial" font-size="5.5" text-anchor="middle" fill="#a3161e">${i * 10}</text>`,
    ).join("")}</svg>`,
    { size: 1024 },
  );
  b.part(new THREE.PlaneGeometry(0.36, 0.014), "#ffffff", {
    at: [0, 0.145, -0.0846],
    texture: rulerTex,
    bone: "carriage",
    name: "marginScale",
  });
  for (const s of [-1, 1])
    b.extrude(
      [
        [-0.115, 0.137],
        [-0.045, 0.137],
        [-0.042, 0.17],
        [-0.055, 0.205],
        [-0.085, 0.205],
        [-0.112, 0.175],
      ],
      { color: TRIM, at: [s * 0.203, 0, 0], thickness: 0.006, bevel: 0.0015, bone: "carriage" },
    );

  // platen and knobs
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.4, 22), RUBBER, {
    at: [0, 0.19, -0.07],
    rotation: [0, 0, 90],
    bone: "platen",
    name: "platenRoller",
  });
  for (const s of [-1, 1]) {
    b.lathe(
      [
        [0, 0],
        [0.012, 0],
        [0.02, 0.004],
        [0.022, 0.01],
        [0.022, 0.022],
        [0.017, 0.029],
        [0, 0.031],
      ],
      { color: KNOB, at: [s * 0.206, 0.19, -0.07], axis: [s, 0, 0], segments: 18, bone: "platen" },
    );
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.004, 14), CHROME, {
      at: [s * 0.237, 0.19, -0.07],
      rotation: [0, 0, 90],
      bone: "platen",
    });
  }

  // paper bail
  b.rod([-0.16, 0.214, -0.064], [0.16, 0.214, -0.064], 0.002, { color: CHROME, bone: "carriage", sides: 6 });
  for (const s of [-1, 1]) {
    b.rod([s * 0.16, 0.214, -0.064], [s * 0.203, 0.2, -0.06], 0.002, { color: CHROME, bone: "carriage", sides: 6 });
    b.part(new THREE.CylinderGeometry(0.0035, 0.0035, 0.012, 10), RUBBER, {
      at: [s * 0.06, 0.214, -0.064],
      rotation: [0, 0, 90],
      bone: "carriage",
    });
  }

  // paper: wrap round the platen, the sheet, its back, and the rest behind it
  b.part(new THREE.CylinderGeometry(0.0228, 0.0228, 0.2, 12, 1, true, 0, Math.PI / 2), PAPER, {
    at: [0, 0.19, -0.07],
    rotation: [0, 0, 90],
    bone: "carriage",
  });
  const paperTex = svg(
    `<svg viewBox="0 0 210 260" xmlns="http://www.w3.org/2000/svg">
      <rect width="210" height="260" fill="#f6f0e1"/>
      <g font-family="Courier New, Courier, monospace" font-size="8.2" fill="#1d1d1d">
        <text x="20" y="28" fill="#a3161e" font-weight="bold" font-size="10">MEMO -- 14 OCT 1957</text>
        <text x="20" y="54">Dear friend,</text>
        <text x="20" y="72">The quick brown fox jumps</text>
        <text x="20" y="84">over the lazy dog. Every key</text>
        <text x="20" y="96">on this little machine still</text>
        <text x="20" y="108">sings with a bright clack,</text>
        <text x="20" y="120">and the bell rings sweetly</text>
        <text x="20" y="132">at the end of every line.</text>
        <text x="20" y="156">Write back soon --</text>
        <text x="20" y="180">Yours, typed with lov</text>
      </g>
      <rect x="128" y="172" width="5" height="9" fill="#a3161e" opacity="0.6"/>
    </svg>`,
    { size: 1024 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.26), "#ffffff", {
    at: [0, 0.332, -0.093],
    rotation: [-12, 0, 0],
    texture: paperTex,
    bone: "carriage",
    name: "paper",
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.26), "#e9e2d0", {
    at: [0, 0.3318, -0.0935],
    rotation: [-12, 180, 0],
    bone: "carriage",
  });
  b.part(new THREE.BoxGeometry(0.26, 0.09, 0.003), TRIM, {
    at: [0, 0.264, -0.083],
    rotation: [-12, 0, 0],
    bone: "carriage",
    name: "paperRest",
  });
  for (const s of [-1, 1])
    b.rod([s * 0.12, 0.225, -0.08], [s * 0.12, 0.155, -0.1], 0.002, { color: TRIM, bone: "carriage", sides: 5 });

  // carriage return lever (typist's left) and line-space lever
  b.sweep(
    [
      [-0.214, 0.205, -0.062],
      [-0.228, 0.215, -0.03],
      [-0.233, 0.213, 0.01],
      [-0.226, 0.202, 0.032],
    ].map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    0.0028,
    { color: CHROME, bone: "returnLever", sides: 8 },
  );
  b.part(new THREE.SphereGeometry(0.0065, 10, 8), KNOB, { at: [-0.226, 0.202, 0.034], bone: "returnLever" });
  b.rod([0.21, 0.2, -0.085], [0.222, 0.226, -0.09], 0.0022, { color: CHROME, bone: "carriage", sides: 6 });
  b.part(new THREE.SphereGeometry(0.005, 10, 8), KNOB, { at: [0.222, 0.228, -0.09], bone: "carriage" });

  return b.root;
}
