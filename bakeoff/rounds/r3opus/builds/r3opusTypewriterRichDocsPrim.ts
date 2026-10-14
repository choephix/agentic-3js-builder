import * as THREE from "three";
import { createBuilder, svg, polyline, bezier } from "../../../../src/index";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "A 1930s portable typewriter in glossy racing green: four staggered rows of chrome-rimmed round keys, a fan of type bars, a black platen holding a half-typed letter, a chrome carriage return lever and a brass maker's badge.",
};

const GREEN = "#0f4a2c";
const CHROME = "#c9ced3";
const BLACK = "#151515";
const CREAM = "#efe4c4";
const BRASS = "#c8a24a";
const GOLD = "#d9b45a";
const RED = "#9c1f1f";
const PAPER = "#f6f1e3";

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------- Body ----------
  b.extrude(
    [
      [0.15, 0.008, "sharp"],
      [0.15, 0.032, "sharp"],
      [0.04, 0.062, "sharp"],
      [0.025, 0.075, "sharp"],
      [-0.09, 0.075, "sharp"],
      [-0.1, 0.105, "sharp"],
      [-0.135, 0.105, "sharp"],
      [-0.135, 0.008, "sharp"],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.28, bevel: 0.005, color: GREEN, bone: root, name: "body" },
  );

  // rubber feet
  for (const sx of [1, -1])
    for (const z of [0.12, -0.115])
      b.part(new THREE.CylinderGeometry(0.012, 0.013, 0.012, 10), BLACK, { at: [sx * 0.12, 0.006, z], bone: root });

  // gold pinstripes on each side
  const inset = [
    [0.135, 0.016],
    [0.135, 0.03],
    [0.036, 0.057],
    [0.02, 0.068],
    [-0.088, 0.068],
    [-0.096, 0.096],
    [-0.125, 0.096],
    [-0.125, 0.016],
  ];
  for (const s of [1, -1]) {
    const pts = inset.map(([z, y]) => [s * 0.1408, y, z]);
    b.sweep(polyline(pts, { closed: true }), 0.0009, { color: GOLD, sides: 4, bone: root });
  }
  // chrome lip along the front
  b.rod([-0.138, 0.032, 0.15], [0.138, 0.032, 0.15], 0.0018, { color: CHROME, sides: 6, bone: root });

  // ---------- Brass badge ----------
  b.part(new THREE.BoxGeometry(0.062, 0.018, 0.003), BRASS, { at: [0, 0.02, 0.1512], bone: root });
  const badge = svg(
    `<svg viewBox="0 0 124 36"><rect x="1" y="1" width="122" height="34" rx="16" fill="#c8a24a" stroke="#6b4e17" stroke-width="3"/>
    <rect x="7" y="6" width="110" height="24" rx="11" fill="none" stroke="#8a6a26" stroke-width="1.5"/>
    <text x="62" y="25" font-family="Georgia, serif" font-size="17" font-weight="bold" text-anchor="middle" fill="#3a2a10" letter-spacing="2">MARLOWE</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.058, 0.0168), "#ffffff", {
    at: [0, 0.02, 0.1531],
    dir: [0, 0, 1],
    axis: "z",
    texture: badge,
    bone: root,
  });

  // ---------- Keyboard ----------
  const deckY = (z: number) => 0.032 + ((0.15 - z) / 0.11) * 0.03;
  const rows = ["ZXCVBNM,.", "ASDFGHJKL;", "QWERTYUIOP", "1234567890"];
  const rowZ = [0.128, 0.106, 0.084, 0.062];
  const rowOff = [0.012, 0.006, 0.0, -0.006];
  const texCache = new Map<string, ReturnType<typeof svg>>();
  const keyTex = (ch: string) => {
    let t = texCache.get(ch);
    if (!t) {
      t = svg(
        `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#141414"/>
        <circle cx="32" cy="32" r="27" fill="none" stroke="#3a3a3a" stroke-width="2"/>
        <text x="32" y="44" font-family="Georgia, serif" font-size="34" font-weight="bold" text-anchor="middle" fill="${CREAM}">${ch}</text></svg>`,
        { size: 64 },
      );
      texCache.set(ch, t);
    }
    return t;
  };
  const keyDir = new THREE.Vector3(0, 1, 0.22).normalize();
  rows.forEach((row, i) => {
    const z = rowZ[i];
    const top = 0.052 + i * 0.01;
    const n = row.length;
    for (let j = 0; j < n; j++) {
      const x = (j - (n - 1) / 2) * 0.021 + rowOff[i];
      b.rod([x, deckY(z) - 0.003, z], [x, top - 0.004, z], 0.0013, { color: CHROME, sides: 4, bone: root });
      const capC = new THREE.Vector3(x, top - 0.0025, z);
      b.part(new THREE.CylinderGeometry(0.0078, 0.0072, 0.005, 14), CHROME, { at: capC, dir: keyDir, bone: root });
      const face = capC.clone().addScaledVector(keyDir, 0.0029);
      b.part(new THREE.CircleGeometry(0.0065, 14), "#ffffff", {
        at: face,
        dir: keyDir,
        axis: "z",
        up: [0, 0.2, -1],
        texture: keyTex(row[j]),
        bone: root,
      });
    }
  });

  // space bar
  b.capsule([-0.08, 0.046, 0.143], [0.08, 0.046, 0.143], 0.0042, { color: CHROME, sides: 8, bone: root });
  for (const s of [1, -1])
    b.rod([s * 0.06, 0.046, 0.143], [s * 0.06, deckY(0.137) - 0.002, 0.137], 0.0015, { color: CHROME, sides: 4, bone: root });

  // ---------- Type basket ----------
  const C = new THREE.Vector3(0, 0.075, -0.05);
  b.part(new THREE.CylinderGeometry(0.076, 0.076, 0.003, 20, 1, false, -Math.PI / 2, Math.PI), BLACK, {
    at: [C.x, 0.0765, C.z],
    bone: root,
  });
  b.part(new THREE.TorusGeometry(0.078, 0.0022, 6, 28, Math.PI), CHROME, {
    at: [C.x, 0.0785, C.z],
    rotation: [90, 0, 0],
    bone: root,
  });
  b.part(new THREE.TorusGeometry(0.071, 0.0028, 5, 24, Math.PI), "#2b2b2b", {
    at: [C.x, 0.0795, C.z],
    rotation: [90, 0, 0],
    bone: root,
  });
  b.part(new THREE.TorusGeometry(0.028, 0.004, 6, 20, Math.PI), CHROME, {
    at: [C.x, 0.083, C.z],
    rotation: [90, 0, 0],
    bone: root,
  });
  const nBars = 38;
  for (let k = 0; k < nBars; k++) {
    const a = THREE.MathUtils.degToRad(-82 + (164 * k) / (nBars - 1));
    const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const inner = C.clone().addScaledVector(d, 0.028).setY(0.086);
    const outer = C.clone().addScaledVector(d, 0.069).setY(0.0828);
    b.rod(inner, outer, 0.0011, { color: CHROME, sides: 4, bone: root });
    b.part(new THREE.BoxGeometry(0.0028, 0.0036, 0.006), "#8f959b", {
      at: outer,
      dir: d,
      axis: "z",
      bone: root,
    });
  }
  // type guide and ribbon vibrator
  b.part(new THREE.BoxGeometry(0.016, 0.03, 0.004), CHROME, { at: [0, 0.098, -0.072], bone: root });
  b.part(new THREE.BoxGeometry(0.022, 0.004, 0.002), BLACK, { at: [0, 0.114, -0.0745], bone: root });
  b.part(new THREE.BoxGeometry(0.022, 0.004, 0.002), RED, { at: [0, 0.118, -0.0745], bone: root });

  // ribbon spools
  for (const s of [1, -1]) {
    const x = s * 0.105;
    const z = -0.045;
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.003, 18), CHROME, { at: [x, 0.0765, z], bone: root });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.007, 16), s > 0 ? RED : BLACK, { at: [x, 0.0815, z], bone: root });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.002, 18), CHROME, { at: [x, 0.0855, z], bone: root });
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.005, 8), BLACK, { at: [x, 0.089, z], bone: root });
  }

  // ---------- Carriage ----------
  b.part(new THREE.BoxGeometry(0.34, 0.014, 0.05), GREEN, { at: [0, 0.112, -0.105], bone: root });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.008, 0.04, 0.045), GREEN, { at: [s * 0.15, 0.13, -0.1], bone: root });
  const scale = svg(
    `<svg viewBox="0 0 240 10"><rect width="240" height="10" fill="${CREAM}"/>
    ${Array.from({ length: 47 }, (_, i) => {
      const x = 4 + i * 5;
      const h = i % 2 === 0 ? 6 : 3;
      return `<rect x="${x - 0.6}" y="0" width="1.2" height="${h}" fill="#222"/>`;
    }).join("")}</svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.24, 0.01), "#ffffff", {
    at: [0, 0.112, -0.0794],
    dir: [0, 0, 1],
    axis: "z",
    texture: scale,
    bone: root,
  });

  // platen
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.29, 18), BLACK, { at: [0, 0.135, -0.1], dir: [1, 0, 0], bone: root });
  b.rod([-0.185, 0.135, -0.1], [0.185, 0.135, -0.1], 0.004, { color: CHROME, sides: 8, bone: root });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.018, 16), BLACK, {
      at: [s * 0.165, 0.135, -0.1],
      dir: [1, 0, 0],
      flat: true,
      bone: root,
    });
    b.part(new THREE.TorusGeometry(0.0175, 0.0018, 5, 16), CHROME, {
      at: [s * 0.156, 0.135, -0.1],
      dir: [1, 0, 0],
      axis: "z",
      bone: root,
    });
    b.part(new THREE.CylinderGeometry(0.011, 0.013, 0.005, 14), CHROME, {
      at: [s * 0.176, 0.135, -0.1],
      dir: [1, 0, 0],
      bone: root,
    });
  }

  // paper bail
  b.rod([-0.13, 0.148, -0.078], [0.13, 0.148, -0.078], 0.0018, { color: CHROME, sides: 6, bone: root });
  for (const s of [1, -1]) {
    b.rod([s * 0.13, 0.148, -0.078], [s * 0.147, 0.128, -0.09], 0.0018, { color: CHROME, sides: 6, bone: root });
    b.part(new THREE.CylinderGeometry(0.0042, 0.0042, 0.012, 10), BLACK, {
      at: [s * 0.05, 0.148, -0.078],
      dir: [1, 0, 0],
      bone: root,
    });
  }

  // paper rest
  b.frustumBox([0, 0.142, -0.12], [0, 0.205, -0.178], [0.22, 0.003], [0.22, 0.003], { color: GREEN, bone: root });
  b.rod([-0.11, 0.205, -0.178], [0.11, 0.205, -0.178], 0.002, { color: CHROME, sides: 6, bone: root });

  // the sheet of paper, half typed
  const lines = [
    "Dear Margaret,",
    "",
    "The rain has not let up since",
    "Tuesday, and the old green",
    "machine clatters on regardless.",
    "I have written eleven pages of",
    "the novel and torn up ten. The",
    "hero still refuses to leave the",
    "railway platform at Crewe, and",
    "I confess I begin to sympathise",
    "with him entirely. Do wri",
  ];
  const paper = svg(
    `<svg viewBox="0 0 200 170"><rect width="200" height="170" fill="#ffffff"/>
    <text x="186" y="18" font-family="Courier New, monospace" font-size="8" text-anchor="end" fill="#2a2a2a">14 March 1934</text>
    ${lines
      .map(
        (l, i) =>
          `<text x="16" y="${40 + i * 11.6}" font-family="Courier New, monospace" font-size="8.6" fill="${
            i % 3 === 1 ? "#3a3a3a" : "#1c1c1c"
          }">${l}</text>`,
      )
      .join("")}</svg>`,
    { size: 512 },
  );
  b.cards(
    [{ at: [0, 0.155, -0.091], axis: [0, 1, -0.18] } as never].length ? [] : [],
    paper,
    { size: [0.2, 0.17] },
  );
  b.cards([frameAt([0, 0.155, -0.091], [0, 1, -0.18])], paper, {
    size: [0.2, 0.17],
    flow: [0, 0, 1],
    bend: -12,
    sink: 0,
    color: PAPER,
    bone: root,
  });

  // ---------- Carriage return lever ----------
  const pivot: [number, number, number] = [-0.15, 0.14, -0.082];
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 12), CHROME, { at: pivot, dir: [1, 0, 0], bone: root });
  const leverPath = bezier(pivot, [-0.185, 0.145, -0.055], [-0.2, 0.16, -0.01], [-0.205, 0.168, 0.025]);
  b.sweep(leverPath, [0.0035, 0.0028], { color: CHROME, sides: 8, bone: root });
  b.part(new THREE.SphereGeometry(0.008, 10, 8), CHROME, {
    at: [-0.205, 0.168, 0.03],
    scale: [0.8, 0.55, 1.4],
    bone: root,
  });

  // ---------- Gloss ----------
  const out = b.root;
  try {
    out.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (!m || Array.isArray(m) || !m.color || m.map) return;
      const hex = "#" + m.color.getHexString();
      if (hex === GREEN) {
        m.roughness = 0.28;
        m.metalness = 0.1;
      } else if (hex === CHROME) {
        m.roughness = 0.22;
        m.metalness = 0.45;
      } else if (hex === BRASS || hex === GOLD) {
        m.roughness = 0.3;
        m.metalness = 0.4;
      } else if (hex === BLACK) {
        m.roughness = 0.4;
      }
    });
  } catch {
    // material tweaks are cosmetic only
  }
  return out;
}

function frameAt(at: [number, number, number], dir: [number, number, number]) {
  return frameImpl(at, dir);
}

import { frame as frameImpl } from "../../../../src/index";
