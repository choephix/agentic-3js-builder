import * as THREE from "three";
import { createBuilder, svg, catmull } from "../../../../src/index";

export const meta = {
  name: "Harcourt No. 5 Typewriter",
  description:
    "A 1930s desk typewriter in glossy racing green: four staggered rows of round black keys with cream letters on chrome rims, a semicircular basket of type bars, black platen with a half-typed letter, chrome carriage return lever and a brass maker's badge.",
};

const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "typewriter", paintSize: 1024 });

  const GREEN = "#1a4a2d";
  const CHROME = "#d5dade";
  const STEEL = "#8e979d";
  const BLACK = "#111111";
  const MATTE = "#1d1d1d";
  const CREAM = "#f1e5c5";
  const BRASS = "#c99b3a";
  const FELT = "#6b1f22";
  const RUBBER = "#272727";
  const RIBRED = "#a01c1c";
  const RIBBLK = "#151010";
  const DARK = "#141414";

  const finish = (c: string, r: number, m: number) => {
    const mt = b.material(c);
    mt.roughness = r;
    mt.metalness = m;
  };
  finish(GREEN, 0.2, 0.12);
  finish(CHROME, 0.18, 0.65);
  finish(STEEL, 0.3, 0.55);
  finish(BLACK, 0.15, 0.05);
  finish(BRASS, 0.26, 0.6);
  finish(MATTE, 0.85, 0.0);

  // ---------------- skeleton ----------------
  b.joint("root", { at: [0, 0, 0] });
  b.joint("carriage", { parent: "root", at: [0, 0.165, -0.075] });
  b.joint("platen", { parent: "carriage", at: [0, 0.165, -0.075], dir: [1, 0, 0], role: "hinge" });
  b.joint("returnLever", { parent: "carriage", at: [-0.214, 0.18, -0.075], dir: [-0.3, 0.35, 1], role: "hinge" });

  // ---------------- body ----------------
  b.extrude(
    [
      [0.18, 0.008],
      [0.18, 0.032],
      [0.03, 0.077],
      [-0.16, 0.077],
      [-0.16, 0.008],
    ],
    { color: GREEN, at: [0, 0, 0], thickness: 0.3, bevel: 0.008, bone: "root", name: "base" },
  );
  for (const sx of [1, -1]) {
    b.extrude(
      [
        [0.035, 0.07],
        [0.015, 0.1],
        [-0.03, 0.126],
        [-0.08, 0.131],
        [-0.155, 0.131],
        [-0.166, 0.118],
        [-0.166, 0.07],
      ],
      { color: GREEN, at: [sx * 0.142, 0, 0], thickness: 0.016, bevel: 0.003, smoothing: 2, bone: "root", name: sx > 0 ? "cheekL" : "cheekR" },
    );
  }
  // hood behind the basket
  b.part(new THREE.BoxGeometry(0.27, 0.045, 0.095), GREEN, { at: [0, 0.0975, -0.1125], bone: "root", name: "hood" });

  // feet
  for (const [fx, fz] of [
    [0.13, 0.15],
    [-0.13, 0.15],
    [0.13, -0.14],
    [-0.13, -0.14],
  ])
    b.part(new THREE.CylinderGeometry(0.012, 0.014, 0.012, 10), RUBBER, { at: [fx, 0.006, fz], bone: "root" });

  // gold pinstripes
  b.rod([-0.14, 0.0322, 0.1805], [0.14, 0.0322, 0.1805], 0.0008, { color: "#d9b54a", sides: 4, bone: "root" });
  b.rod([-0.14, 0.0774, 0.0305], [0.14, 0.0774, 0.0305], 0.0008, { color: "#d9b54a", sides: 4, bone: "root" });
  const stripe = (flip: boolean) => {
    const pts = [
      [0.02, 0.076],
      [0.006, 0.098],
      [-0.03, 0.119],
      [-0.08, 0.124],
      [-0.152, 0.124],
      [-0.158, 0.116],
      [-0.158, 0.077],
    ];
    const d =
      pts
        .map(([z, y], i) => `${i ? "L" : "M"}${((flip ? z + 0.165 : 0.035 - z) * 1000).toFixed(1)} ${((0.13 - y) * 1000).toFixed(1)}`)
        .join(" ") + " Z";
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><path d="${d}" fill="none" stroke="#d9b54a" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
      { size: 512 },
    );
  };
  b.part(new THREE.PlaneGeometry(0.2, 0.06), "#ffffff", {
    at: [0.1506, 0.1, -0.065],
    rotation: [0, 90, 0],
    texture: stripe(false),
    bone: "root",
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.06), "#ffffff", {
    at: [-0.1506, 0.1, -0.065],
    rotation: [0, -90, 0],
    texture: stripe(true),
    bone: "root",
  });

  // hood name decal in gold script
  const hoodTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48"><line x1="8" y1="24" x2="50" y2="24" stroke="#d9b54a" stroke-width="1.5"/><line x1="190" y1="24" x2="232" y2="24" stroke="#d9b54a" stroke-width="1.5"/><text x="120" y="34" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="bold" font-size="30" fill="#d9b54a">Harcourt</text></svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.12, 0.024), "#ffffff", { at: [0, 0.0975, -0.0644], texture: hoodTex, bone: "root" });

  // brass maker's badge
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.002, 24), BRASS, {
    at: [0, 0.02, 0.181],
    rotation: [90, 0, 0],
    scale: [2.45, 1, 0.8],
    bone: "root",
    name: "badge",
  });
  const badgeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 78"><ellipse cx="120" cy="39" rx="115" ry="35" fill="none" stroke="#ffffff" stroke-width="3"/><ellipse cx="120" cy="39" rx="106" ry="28" fill="none" stroke="#ffffff" stroke-width="1.2"/><text x="120" y="46" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="25" letter-spacing="3" fill="#ffffff">HARCOURT</text><text x="120" y="62" text-anchor="middle" font-family="Georgia, serif" font-size="9" letter-spacing="2" fill="#ffffff">No. 5  LONDON</text></svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.048, 0.0156), "#3d2a0c", { at: [0, 0.02, 0.1823], texture: badgeTex, bone: "root" });

  // ---------------- keyboard ----------------
  const deckY = (z: number) => (z >= 0.03 ? 0.032 + ((0.18 - z) / 0.15) * 0.045 : 0.077);
  const texCache = new Map<string, THREE.Texture>();
  const letterTex = (label: string) => {
    let t = texCache.get(label);
    if (!t) {
      const size = label.length > 1 ? 13 : 38;
      t = svg(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="${label.length > 1 ? 37 : 45}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="${size}" fill="#ffffff">${label}</text></svg>`,
        { size: 64 },
      );
      texCache.set(label, t);
    }
    return t;
  };
  const key = (x: number, yTop: number, z: number, label: string) => {
    b.part(new THREE.CylinderGeometry(0.0068, 0.0068, 0.003, 14), BLACK, { at: [x, yTop - 0.0015, z], bone: "root" });
    b.part(new THREE.TorusGeometry(0.0072, 0.0011, 5, 16), CHROME, { at: [x, yTop - 0.0012, z], rotation: [90, 0, 0], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.0072, 0.006, 0.0045, 14), CHROME, { at: [x, yTop - 0.005, z], bone: "root" });
    b.part(new THREE.PlaneGeometry(0.011, 0.011), CREAM, {
      at: [x, yTop + 0.0003, z],
      rotation: [-90, 0, 0],
      texture: letterTex(label),
      bone: "root",
    });
    b.rod([x, yTop - 0.007, z], [x, deckY(z - 0.012) - 0.004, z - 0.012], 0.0013, { color: DARK, sides: 5, bone: "root" });
  };
  const rows = ["1234567890-", "QWERTYUIOP", "ASDFGHJKL;", "ZXCVBNM,./"];
  rows.forEach((row, i) => {
    const z = 0.073 + i * 0.024;
    const yTop = 0.106 - i * 0.017;
    const n = row.length;
    for (let k = 0; k < n; k++) key((k - (n - 1) / 2) * 0.019 + (i - 1.5) * 0.005, yTop, z, row[k]);
  });
  key(-0.112, 0.055, 0.145, "SHIFT");
  key(0.127, 0.055, 0.145, "SHIFT");
  key(-0.118, 0.072, 0.121, "LOCK");
  // space bar
  b.capsule([-0.075, 0.046, 0.165], [0.075, 0.046, 0.165], 0.0045, { color: CHROME, bone: "root", name: "spaceBar" });
  for (const sx of [-1, 1])
    b.rod([sx * 0.068, 0.046, 0.163], [sx * 0.068, 0.036, 0.128], 0.0015, { color: DARK, sides: 5, bone: "root" });

  // ---------------- type basket ----------------
  const S = new THREE.Vector3(0, 0.112, -0.05);
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.0015, 20, 1, false, -Math.PI / 2, Math.PI), DARK, {
    at: [0, 0.0778, -0.05],
    bone: "root",
  });
  b.part(new THREE.TorusGeometry(0.1, 0.004, 5, 28, Math.PI), FELT, { at: [0, 0.086, -0.05], rotation: [90, 0, 0], bone: "root", name: "typeRest" });
  b.part(new THREE.TorusGeometry(0.04, 0.005, 6, 20, Math.PI), STEEL, { at: [S.x, S.y, S.z], rotation: [90, 0, 0], bone: "root", name: "segment" });
  const BARS = 36;
  for (let i = 0; i < BARS; i++) {
    const th = (-84 + (168 * i) / (BARS - 1)) * DEG;
    const dir = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
    const pivot = S.clone().addScaledVector(dir, 0.04);
    const head = S.clone().addScaledVector(dir, 0.1).add(new THREE.Vector3(0, -0.0205, 0));
    b.rod(pivot, head, 0.0008, { color: STEEL, sides: 4, bone: "root" });
    b.part(new THREE.BoxGeometry(0.0035, 0.007, 0.0045), CHROME, { at: head, dir: head.clone().sub(pivot), bone: "root" });
  }
  // type guide
  b.part(new THREE.BoxGeometry(0.03, 0.01, 0.002), CHROME, { at: [0, 0.15, -0.0455], bone: "root", name: "typeGuide" });
  for (const sx of [-1, 1]) b.rod([sx * 0.012, 0.145, -0.0455], [sx * 0.02, 0.12, -0.06], 0.0012, { color: CHROME, sides: 5, bone: "root" });

  // ribbon spools + ribbon
  for (const sx of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.022, 0.02, 0.012, 18), CHROME, { at: [sx * 0.1, 0.126, -0.09], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.0125, 16), RIBBLK, { at: [sx * 0.1, 0.127, -0.09], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.016, 8), CHROME, { at: [sx * 0.1, 0.128, -0.09], bone: "root" });
  }
  b.sweep(
    catmull([
      [0.1, 0.129, -0.069],
      [0.035, 0.153, -0.049],
      [-0.035, 0.153, -0.049],
      [-0.1, 0.129, -0.069],
    ]),
    {
      radius: () => [0.006, 0.0006] as const,
      section: "box",
      up: [0, 0, 1],
      color: RIBRED,
      sectors: [[-90, 90, RIBBLK]],
      caps: "flat",
      bone: "root",
      name: "ribbon",
    },
  );

  // rail the carriage rides on
  b.rod([-0.23, 0.132, -0.125], [0.23, 0.132, -0.125], 0.005, { color: CHROME, bone: "root", name: "rail" });
  for (const sx of [-1, 1]) b.rod([sx * 0.125, 0.118, -0.125], [sx * 0.125, 0.132, -0.125], 0.004, { color: CHROME, bone: "root" });

  // ---------------- carriage ----------------
  b.part(new THREE.BoxGeometry(0.42, 0.012, 0.07), GREEN, { at: [0, 0.143, -0.095], bone: "carriage", name: "tray" });
  for (const sx of [-1, 1])
    b.part(new THREE.BoxGeometry(0.008, 0.055, 0.085), GREEN, { at: [sx * 0.208, 0.16, -0.08], bone: "carriage" });
  // margin scale
  b.part(new THREE.BoxGeometry(0.37, 0.009, 0.002), CHROME, { at: [0, 0.138, -0.06], bone: "carriage" });
  let ticks = "";
  for (let k = 0; k <= 140; k++) {
    const x = 5 + k * 2.5;
    const tall = k % 10 === 0 ? 4.5 : k % 5 === 0 ? 3.2 : 2;
    ticks += `<line x1="${x}" y1="0" x2="${x}" y2="${tall}" stroke="#000" stroke-width="0.4"/>`;
    if (k % 10 === 0 && k > 0 && k < 140) ticks += `<text x="${x}" y="7.6" text-anchor="middle" font-family="Arial" font-size="2.8" fill="#000">${k / 2}</text>`;
  }
  const scaleTex = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 8"><rect width="360" height="8" fill="#fff"/>${ticks}</svg>`, { size: 2048 });
  b.part(new THREE.PlaneGeometry(0.36, 0.0075), CREAM, { at: [0, 0.138, -0.0588], texture: scaleTex, bone: "carriage" });

  // platen, shaft, knobs
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.4, 20), MATTE, { at: [0, 0.165, -0.075], rotation: [0, 0, 90], bone: "platen", name: "platenRoller" });
  b.rod([-0.236, 0.165, -0.075], [0.236, 0.165, -0.075], 0.004, { color: CHROME, bone: "platen" });
  for (const sx of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.016, 16), BLACK, { at: [sx * 0.243, 0.165, -0.075], rotation: [0, 0, 90], bone: "platen", flat: true });
    b.part(new THREE.TorusGeometry(0.017, 0.0016, 5, 16), CHROME, { at: [sx * 0.235, 0.165, -0.075], rotation: [0, 90, 0], bone: "platen" });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.003, 16), CHROME, { at: [sx * 0.2525, 0.165, -0.075], rotation: [0, 0, 90], bone: "platen" });
  }

  // paper bail with rollers
  b.rod([-0.19, 0.186, -0.0545], [0.19, 0.186, -0.0545], 0.0025, { color: CHROME, bone: "carriage", name: "bail" });
  for (const sx of [-1, 1]) {
    b.rod([sx * 0.19, 0.186, -0.0545], [sx * 0.205, 0.17, -0.068], 0.002, { color: CHROME, bone: "carriage" });
    b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.012, 10), "#e8e2d4", { at: [sx * 0.06, 0.186, -0.053], rotation: [0, 0, 90], bone: "carriage" });
  }

  // paper table
  b.part(new THREE.BoxGeometry(0.3, 0.12, 0.003), GREEN, { at: [0, 0.263, -0.1014], rotation: [-25, 0, 0], bone: "carriage", name: "paperTable" });
  for (const sx of [-1, 1]) b.rod([sx * 0.12, 0.226, -0.088], [sx * 0.12, 0.148, -0.116], 0.0025, { color: CHROME, bone: "carriage" });

  // ---------------- paper ----------------
  const R = 0.0235;
  const phS = -12 * DEG;
  const ph0 = 25 * DEG;
  const wrapL = R * (ph0 - phS);
  const L = wrapL + 0.19;
  const pg = new THREE.PlaneGeometry(0.216, L, 1, 40);
  const pos = pg.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const s = pos.getY(i) + L / 2;
    let Y: number;
    let Z: number;
    if (s < wrapL) {
      const ph = phS + s / R;
      Y = 0.165 + R * Math.sin(ph);
      Z = -0.075 + R * Math.cos(ph);
    } else {
      const d = s - wrapL;
      Y = 0.165 + R * Math.sin(ph0) + Math.cos(ph0) * d;
      Z = -0.075 + R * Math.cos(ph0) - Math.sin(ph0) * d;
    }
    pos.setXYZ(i, x, Y, Z);
  }
  pg.computeVertexNormals();
  const words = "the quick letter regarding our shipment of green enamel machines arrived this morning in fine order and we are pleased to report that every key strikes clean and true upon the platen while the carriage returns".split(" ");
  let wi = 0;
  const lines: string[] = [];
  for (let l = 0; l < 14; l++) {
    let line = "";
    while (true) {
      const w = words[wi % words.length];
      if ((line + " " + w).length > 52) break;
      line = line ? line + " " + w : w;
      wi += 3;
    }
    lines.push(l === 0 ? "    " + line : line);
  }
  let body = "";
  lines.forEach((ln, i) => {
    body += `<text x="22" y="${48 + i * 6}" font-family="'Courier New', Courier, monospace" font-size="4.6" fill="#1a1a1a">${ln}</text>`;
  });
  body += `<text x="22" y="${48 + lines.length * 6}" font-family="'Courier New', Courier, monospace" font-size="4.6" fill="#1a1a1a">With kind regards, and a</text>`;
  const paperTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 205"><rect width="216" height="205" fill="#ffffff"/><text x="194" y="22" text-anchor="end" font-family="'Courier New', Courier, monospace" font-size="4.6" fill="#1a1a1a">June 3, 1934</text><text x="22" y="36" font-family="'Courier New', Courier, monospace" font-size="4.6" fill="#1a1a1a">Dear Mr. Whitcombe,</text>${body}</svg>`,
    { size: 1024 },
  );
  const paper = b.part(pg, "#f6f1e3", { at: [0, 0, 0], texture: paperTex, bone: "carriage", name: "paper" });
  (paper.mesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;

  // ---------------- carriage return lever ----------------
  const leverPts: [number, number, number][] = [
    [-0.214, 0.18, -0.075],
    [-0.228, 0.198, -0.05],
    [-0.242, 0.21, -0.012],
    [-0.25, 0.214, 0.02],
  ];
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.005, 14), CHROME, { at: [-0.214, 0.18, -0.075], rotation: [0, 0, 90], bone: "returnLever" });
  b.sweep(catmull(leverPts), { radius: (t: number) => 0.0036 - 0.0012 * t, color: CHROME, bone: "returnLever", name: "returnLeverArm" });
  b.part(new THREE.SphereGeometry(0.007, 12, 8), CHROME, { at: leverPts[3], scale: [1, 0.75, 1.5], bone: "returnLever" });

  return b.root;
}
