import * as THREE from "three";
import { createBuilder, bezier, catmull, svg } from "../../../../src/index";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "1930s desktop typewriter in glossy racing green with staggered chrome-rimmed keys, a semicircle of type bars, a platen with a half-typed sheet, a chrome carriage return lever and a brass maker's badge.",
};

const GREEN = "#0f4a2f";
const GREEN_D = "#0a3322";
const CHROME = "#d9dfe2";
const BLACK = "#141414";
const BRASS = "#b98a2e";
const PAPER = "#f3eedd";

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const root = b.joint("body", { at: [0, 0.1, 0] });

  const B = 0.008; // body sits on feet

  // feet
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.016, 0.018, 0.012, 8), BLACK, {
        at: [sx * 0.15, 0.006, sz * 0.15],
        bone: root,
      });

  // main body: side profile (z, y) extruded across x
  b.extrude(
    [
      [-0.2, 0],
      [0.21, 0],
      [0.21, 0.045],
      [0.14, 0.075],
      [0.02, 0.15],
      [-0.04, 0.19],
      [-0.2, 0.19],
    ],
    { at: [0, B, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.36, bevel: 0.006, color: GREEN, bone: root },
  );

  // chrome trim on front and a pinstripe
  b.part(new THREE.BoxGeometry(0.364, 0.006, 0.004), CHROME, { at: [0, B + 0.047, 0.2095], bone: root });
  b.part(new THREE.BoxGeometry(0.364, 0.004, 0.004), CHROME, { at: [0, B + 0.004, 0.209], bone: root });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.003, 0.004, 0.36), GREEN_D, { at: [s * 0.1815, B + 0.1, -0.0], bone: root });

  // brass maker's badge
  b.part(new THREE.BoxGeometry(0.07, 0.026, 0.004), BRASS, { at: [0, B + 0.024, 0.211], bone: root });
  const badgeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 26">
      <rect x="2" y="2" width="66" height="22" rx="3" fill="none" stroke="#5a3d0c" stroke-width="1.6"/>
      <text x="35" y="14" font-size="9" font-family="serif" font-weight="bold" text-anchor="middle" fill="#3a2506">VERDANT</text>
      <text x="35" y="21" font-size="5" font-family="serif" text-anchor="middle" fill="#3a2506">No. 7 STANDARD</text>
    </svg>`,
    { size: 280 },
  );
  b.part(new THREE.PlaneGeometry(0.07, 0.026), "#ffffff", {
    at: [0, B + 0.024, 0.2132],
    dir: [0, 0, 1],
    axis: "z",
    texture: badgeTex,
    bone: root,
  });

  // keyboard
  const rows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  const zs = [0.04, 0.07, 0.1, 0.13];
  const stagger = [0, 0.0065, 0.013, 0.02];
  const n = new THREE.Vector3(0, 0.848, 0.53);
  const upDir: [number, number, number] = [0, 0.53, -0.848];
  const texCache = new Map<string, any>();
  const keyGeo = new THREE.CylinderGeometry(0.0095, 0.0105, 0.014, 10);
  const capGeo = new THREE.CircleGeometry(0.0072, 10);
  rows.forEach((row, r) => {
    const z = zs[r];
    const y = B + 0.075 + (0.14 - z) * 0.625;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      const x = (i - (row.length - 1) / 2) * 0.027 + stagger[r] - 0.01;
      const p = new THREE.Vector3(x, y, z);
      const c1 = p.clone().addScaledVector(n, 0.005);
      b.part(keyGeo, CHROME, { at: [c1.x, c1.y, c1.z], dir: [n.x, n.y, n.z], bone: root });
      let tex = texCache.get(ch);
      if (!tex) {
        tex = svg(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#f1e6c8"/><text x="16" y="23.5" font-size="20" font-family="serif" font-weight="bold" text-anchor="middle" fill="#1a1a1a">${ch}</text></svg>`,
          { size: 32 },
        );
        texCache.set(ch, tex);
      }
      const c2 = p.clone().addScaledVector(n, 0.0123);
      b.part(capGeo, "#ffffff", {
        at: [c2.x, c2.y, c2.z],
        dir: [n.x, n.y, n.z],
        axis: "z",
        up: upDir,
        texture: tex,
        bone: root,
      });
    }
  });

  // space bar
  b.part(new THREE.BoxGeometry(0.17, 0.007, 0.016), CHROME, { at: [0, B + 0.07, 0.17], bone: root });

  // carriage frame
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.012, 0.13, 0.1), GREEN, { at: [s * 0.178, 0.265, -0.12], bone: root });
  b.part(new THREE.BoxGeometry(0.36, 0.02, 0.012), GREEN, { at: [0, 0.215, -0.17], bone: root });

  // platen
  const PY = 0.275;
  const PZ = -0.12;
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.34, 14), BLACK, { at: [0, PY, PZ], dir: [1, 0, 0], bone: root });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.43, 6), CHROME, { at: [0, PY, PZ], dir: [1, 0, 0], bone: root });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.021, 0.021, 0.02, 12), BLACK, {
      at: [s * 0.205, PY, PZ],
      dir: [1, 0, 0],
      bone: root,
    });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 8), CHROME, {
      at: [s * 0.218, PY, PZ],
      dir: [1, 0, 0],
      bone: root,
    });
  }

  // paper sheet wrapped around platen and standing up
  const R = 0.0305;
  const pts: number[][] = [];
  for (const deg of [-90, -45, 0, 40]) {
    const a = (deg * Math.PI) / 180;
    pts.push([0, PY + R * Math.sin(a), PZ + R * Math.cos(a)]);
  }
  pts.push([0, 0.34, -0.115], [0, 0.44, -0.135], [0, 0.47, -0.141]);
  b.sweep(catmull(pts), () => [0.11, 0.0006], {
    section: "box",
    caps: "flat",
    color: PAPER,
    bone: root,
  });

  // typed text
  const text = [
    "Dear Mr. Harlow,",
    "",
    "Thank you for your letter of the",
    "4th inst. We are pleased to confirm",
    "the order of two gross ribbons",
    "and one carriage, to be shipped",
    "by the first available steamer.",
    "",
    "Yours faithfully,",
    "A. Verdant",
  ];
  const lines = text
    .map((t, i) => `<text x="8" y="${12 + i * 11}" font-size="7.5" font-family="monospace" font-weight="bold" fill="#23242b">${t}</text>`)
    .join("");
  const letterTex = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 124">${lines}</svg>`, { size: 800 });
  b.part(new THREE.PlaneGeometry(0.19, 0.124), "#ffffff", {
    at: [0, 0.385, -0.1205],
    dir: [0, 0.196, 0.98],
    axis: "z",
    up: [0, 0.98, -0.196],
    texture: letterTex,
    bone: root,
  });

  // paper bail
  b.rod([-0.18, 0.32, -0.097], [0.18, 0.32, -0.097], 0.002, { color: CHROME, bone: root });

  // carriage return lever
  b.sweep(bezier([0.186, 0.3, -0.11], [0.2, 0.34, -0.09], [0.235, 0.35, -0.04], [0.238, 0.325, 0.0]), 0.0035, {
    color: CHROME,
    bone: root,
  });
  b.part(new THREE.SphereGeometry(0.0105, 8, 6), BLACK, { at: [0.238, 0.322, 0.004], bone: root });

  // ribbon spools
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.005, 12), CHROME, { at: [s * 0.12, 0.2005, -0.17], bone: root });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 12), BLACK, { at: [s * 0.12, 0.208, -0.17], bone: root });
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.022, 6), CHROME, { at: [s * 0.12, 0.214, -0.17], bone: root });
  }

  // type bar basket
  const CZ = -0.12;
  const HR = 0.09;
  const hingePts: number[][] = [];
  for (let d = -80; d <= 80; d += 20) {
    const a = (d * Math.PI) / 180;
    hingePts.push([Math.sin(a) * HR, 0.2, CZ + Math.cos(a) * HR]);
  }
  b.sweep(catmull(hingePts), 0.003, { color: CHROME, bone: root, sides: 6 });
  for (let d = -70; d <= 70; d += 10) {
    const a = (d * Math.PI) / 180;
    const sx = Math.sin(a);
    const cx = Math.cos(a);
    const H: number[] = [sx * HR, 0.202, CZ + cx * HR];
    const T: number[] = [0, 0.252, -0.092];
    const c1: number[] = [sx * HR * 0.95, 0.24, CZ + cx * HR * 0.95];
    const c2: number[] = [sx * 0.035, 0.238, -0.092 + cx * 0.035];
    b.sweep(bezier(H, c1, c2, T), [0.0016, 0.0012], { color: CHROME, bone: root, sides: 4 });
    b.part(new THREE.BoxGeometry(0.004, 0.003, 0.004), BLACK, { at: [sx * HR, 0.2, CZ + cx * HR], bone: root });
  }

  return b.root;
}
