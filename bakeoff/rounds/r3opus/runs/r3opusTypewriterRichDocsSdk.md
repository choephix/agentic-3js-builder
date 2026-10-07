```ts
import * as THREE from "three";
import { createBuilder, arc, bezier, catmull, frame, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "A 1930s portable typewriter in glossy racing green: four staggered rows of round glass-top keys on chrome rims, a fan of type bars, a black platen holding a half-typed letter, a chrome carriage return lever and a brass maker's badge.",
};

const GREEN = "#0d4a2b";
const GREEN_D = "#08321d";
const CHROME = "#d9dee3";
const STEEL = "#8d949b";
const BLACK = "#151515";
const RUBBER = "#222222";
const BRASS = "#c9a043";
const BRASS_D = "#8c6a22";
const GOLD = "#d8b350";
const PAPER = "#f6f1e3";
const FELT = "#4a2020";
const RED = "#b3261e";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const base = b.joint("base", { at: [0, 0, 0] });

  const box = (w: number, h: number, d: number, color: string, at: number[], bone: any = base) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone });

  // ---------- body ----------
  box(0.266, 0.07, 0.24, BLACK, [0, 0.035, 0.03]); // dark interior
  box(0.29, 0.008, 0.29, GREEN_D, [0, 0.004, 0.015]); // base plate

  const sideOutline: OutlinePoint[] = [
    [0.16, 0, "sharp"],
    [-0.13, 0, "sharp"],
    [-0.13, 0.115],
    [-0.1, 0.136],
    [0.0, 0.136],
    [0.065, 0.098],
    [0.16, 0.036],
  ];
  const stripe = [
    [0.145, 0.012],
    [-0.115, 0.012],
    [-0.115, 0.106],
    [-0.093, 0.123],
    [-0.006, 0.123],
    [0.057, 0.089],
    [0.145, 0.031],
  ];
  for (const s of [1, -1]) {
    b.extrude(sideOutline, {
      at: [s * 0.1395, 0, 0],
      thickness: 0.013,
      bevel: 0.004,
      smoothing: 1,
      color: GREEN,
      bone: base,
    });
    // gold pinstripe on the outer face
    b.sweep(catmull(stripe.map(([z, y]) => [s * 0.1466, y, z]), { closed: true }), 0.0009, {
      color: GOLD,
      sides: 4,
      bone: base,
    });
    // rubber feet
    b.part(new THREE.CylinderGeometry(0.013, 0.015, 0.008, 10), RUBBER, { at: [s * 0.135, 0.004, 0.14], bone: base });
    b.part(new THREE.CylinderGeometry(0.013, 0.015, 0.008, 10), RUBBER, { at: [s * 0.135, 0.004, -0.12], bone: base });
  }

  // front apron with pinstripes
  box(0.268, 0.032, 0.016, GREEN, [0, 0.016, 0.152]);
  for (const y of [0.0275, 0.0045])
    b.rod([-0.125, y, 0.1602], [0.125, y, 0.1602], 0.0008, { color: GOLD, sides: 4, bone: base });

  // keyboard deck
  const deckY = (z: number) => 0.03 + (0.155 - z) * (0.058 / 0.105);
  b.slab(
    [
      [-0.133, 0.03, 0.155],
      [0.133, 0.03, 0.155],
      [0.133, 0.088, 0.05],
      [-0.133, 0.088, 0.05],
    ],
    { color: GREEN, thickness: 0.005, bone: base },
  );

  box(0.266, 0.125, 0.04, GREEN, [0, 0.0625, -0.11]); // back block
  box(0.2, 0.01, 0.05, GREEN, [0, 0.12, -0.065]); // cover behind basket
  for (const s of [1, -1]) box(0.035, 0.01, 0.14, GREEN, [s * 0.1155, 0.123, -0.05]); // shoulders

  // ---------- type bar basket ----------
  const C = { x: 0, z: -0.045 };
  b.part(new THREE.CylinderGeometry(0.112, 0.112, 0.004, 20, 1, false, -Math.PI / 2, Math.PI), BLACK, {
    at: [0, 0.074, C.z],
    bone: base,
  });
  const ang = (deg: number, r: number, y: number) => {
    const a = (deg * Math.PI) / 180;
    return [r * Math.sin(a), y, C.z + r * Math.cos(a)];
  };
  b.sweep(arc([0, 0.086, C.z], ang(-80, 0.108, 0.086), [0, 1, 0], 160), 0.004, {
    color: FELT,
    sides: 6,
    bone: base,
  });
  b.sweep(arc([0, 0.103, C.z], ang(-82, 0.05, 0.103), [0, 1, 0], 164), () => [0.005, 0.006], {
    color: CHROME,
    section: "box",
    bone: base,
  });
  const NB = 34;
  for (let i = 0; i < NB; i++) {
    const d = -76 + (152 * i) / (NB - 1);
    const inner = ang(d, 0.05, 0.106);
    const outer = ang(d, 0.104, 0.09);
    b.rod(inner, outer, 0.0011, { color: STEEL, sides: 4, bone: base });
    const a = (d * Math.PI) / 180;
    b.part(new THREE.BoxGeometry(0.0035, 0.007, 0.003), CHROME, {
      at: ang(d, 0.106, 0.0905),
      dir: [Math.sin(a), -0.15, Math.cos(a)],
      bone: base,
    });
  }
  box(0.012, 0.016, 0.0015, CHROME, [0, 0.147, -0.044]); // ribbon vibrator
  box(0.02, 0.004, 0.012, CHROME, [0, 0.13, -0.052]); // type guide

  // ---------- ribbon spools ----------
  const spool: OutlinePoint[] = [
    [0, 0],
    [0.021, 0],
    [0.021, 0.0025],
    [0.006, 0.0025],
    [0.006, 0.0115],
    [0.021, 0.0115],
    [0.021, 0.014],
    [0, 0.014],
  ];
  for (const s of [1, -1]) {
    b.lathe(spool, { at: [s * 0.112, 0.128, -0.01], segments: 16, color: CHROME, bone: base });
    b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.0088, 16), BLACK, { at: [s * 0.112, 0.135, -0.01], bone: base });
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.004, 6), CHROME, { at: [s * 0.112, 0.143, -0.01], bone: base });
  }
  const ribbonPath = catmull([
    [0.096, 0.135, -0.012],
    [0.03, 0.15, -0.047],
    [-0.03, 0.15, -0.047],
    [-0.096, 0.135, -0.012],
  ]);
  b.sweep(ribbonPath, () => [0.0005, 0.003], { shift: [0, 0.003], section: "box", color: BLACK, caps: "flat", bone: base });
  b.sweep(ribbonPath, () => [0.0005, 0.003], { shift: [0, -0.003], section: "box", color: RED, caps: "flat", bone: base });

  // margin scale
  box(0.17, 0.008, 0.003, CHROME, [0, 0.128, -0.035]);
  let ticks = "";
  for (let i = 0; i <= 85; i++) {
    const x = 2 + i * 2;
    const h = i % 5 === 0 ? 4.5 : 2.5;
    ticks += `<rect x="${x - 0.3}" y="0" width="0.6" height="${h}" fill="#000"/>`;
    if (i % 10 === 0 && i > 0 && i < 85)
      ticks += `<text x="${x}" y="7.6" font-size="3.2" font-family="Arial" text-anchor="middle" fill="#000">${i}</text>`;
  }
  const scaleTex = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175 8">${ticks}</svg>`, { size: 1024 });
  b.part(new THREE.PlaneGeometry(0.17, 0.008), "#2a2a2a", {
    at: [0, 0.128, -0.0325],
    dir: [0, 0, 1],
    axis: "z",
    texture: scaleTex,
    bone: base,
  });

  // ---------- keys ----------
  const texCache = new Map<string, any>();
  const keyTex = (label: string, fs: number) => {
    const k = label + fs;
    if (!texCache.has(k))
      texCache.set(
        k,
        svg(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#121212"/><circle cx="32" cy="32" r="28" fill="none" stroke="#2c2c2c" stroke-width="3"/><text x="32" y="${32 + fs * 0.36}" font-family="Courier New, Courier, monospace" font-weight="bold" font-size="${fs}" text-anchor="middle" fill="#f1e6c8">${esc(label)}</text></svg>`,
          { size: 96 },
        ),
      );
    return texCache.get(k);
  };
  const key = (x: number, z: number, label: string, r = 0.0072, fs = 36) => {
    const top = deckY(z) + 0.028;
    b.rod([x, deckY(z) - 0.003, z + 0.004], [x, top - 0.003, z], 0.0012, { color: STEEL, sides: 4, bone: base });
    b.part(new THREE.CylinderGeometry(r, r + 0.0006, 0.004, 14), BLACK, { at: [x, top - 0.002, z], bone: base });
    b.part(new THREE.TorusGeometry(r + 0.0006, 0.0012, 4, 16), CHROME, {
      at: [x, top - 0.0016, z],
      dir: [0, 1, 0],
      axis: "z",
      bone: base,
    });
    b.part(new THREE.CircleGeometry(r - 0.0006, 16), "#ffffff", {
      at: [x, top + 0.0004, z],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: keyTex(label, fs),
      bone: base,
    });
  };
  const rows = [
    { z: 0.068, keys: "1234567890-", off: -0.006 },
    { z: 0.092, keys: "QWERTYUIOP&", off: -0.002 },
    { z: 0.116, keys: "ASDFGHJKL;'", off: 0.002 },
    { z: 0.14, keys: "ZXCVBNM,.?", off: 0 },
  ];
  for (const row of rows) {
    const n = row.keys.length;
    for (let i = 0; i < n; i++) key(row.off + (i - (n - 1) / 2) * 0.021, row.z, row.keys[i]);
  }
  key(0.122, 0.14, "SH", 0.0085, 24);
  key(-0.122, 0.14, "SH", 0.0085, 24);
  key(-0.124, 0.116, "LK", 0.0072, 24);

  // space bar
  b.capsule([-0.075, 0.047, 0.168], [0.075, 0.047, 0.168], 0.0055, { color: BLACK, sides: 8, bone: base });
  for (const s of [1, -1]) {
    b.rod([s * 0.065, 0.047, 0.166], [s * 0.065, 0.032, 0.15], 0.0016, { color: CHROME, sides: 6, bone: base });
    b.part(new THREE.CylinderGeometry(0.0058, 0.0058, 0.003, 10), CHROME, {
      at: [s * 0.0755, 0.047, 0.168],
      dir: [1, 0, 0],
      bone: base,
    });
  }

  // ---------- brass badge ----------
  const oval = (rx: number, ry: number): OutlinePoint[] =>
    Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2;
      return [rx * Math.cos(a), ry * Math.sin(a)] as OutlinePoint;
    });
  b.extrude(oval(0.036, 0.0135), { at: [0, 0.016, 0.1607], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.0016, color: BRASS_D, bone: base });
  b.extrude(oval(0.032, 0.011), {
    at: [0, 0.016, 0.1615],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.003,
    bevel: 0.001,
    color: BRASS,
    bone: base,
  });
  const badgeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 56"><text x="100" y="40" font-family="Georgia, Times, serif" font-weight="bold" font-size="34" letter-spacing="3" text-anchor="middle" fill="#000">ROYALTON</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.05, 0.014), "#3b2a0e", {
    at: [0, 0.016, 0.1638],
    dir: [0, 0, 1],
    axis: "z",
    texture: badgeTex,
    bone: base,
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0018, 6, 4), BRASS_D, { at: [s * 0.0335, 0.016, 0.1615], bone: base });

  // ---------- carriage ----------
  const carriage = b.joint("carriage", { parent: base, at: [0, 0.165, -0.075] });
  const P: [number, number, number] = [0, 0.165, -0.075];
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.32, 18), BLACK, { at: P, dir: [1, 0, 0], bone: carriage });
  b.part(new THREE.CylinderGeometry(0.0227, 0.0227, 0.216, 18), PAPER, { at: P, dir: [1, 0, 0], bone: carriage });
  b.rod([-0.2, P[1], P[2]], [0.2, P[1], P[2]], 0.004, { color: CHROME, sides: 8, bone: carriage });

  const knob: OutlinePoint[] = [
    [0, 0],
    [0.008, 0],
    [0.009, 0.006],
    [0.02, 0.01],
    [0.022, 0.022],
    [0.018, 0.031],
    [0, 0.033],
  ];
  const plate: OutlinePoint[] = [
    [-0.125, 0.128, "sharp"],
    [-0.035, 0.128, "sharp"],
    [-0.035, 0.158],
    [-0.055, 0.19],
    [-0.1, 0.19],
    [-0.125, 0.168],
  ];
  for (const s of [1, -1]) {
    b.lathe(knob, { at: [s * 0.183, P[1], P[2]], axis: [s, 0, 0], segments: 14, smoothing: 1, color: BLACK, bone: carriage });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.003, 14), CHROME, {
      at: [s * 0.2165, P[1], P[2]],
      dir: [1, 0, 0],
      bone: carriage,
    });
    b.part(new THREE.TorusGeometry(0.0205, 0.0016, 4, 18), CHROME, {
      at: [s * 0.193, P[1], P[2]],
      dir: [1, 0, 0],
      axis: "z",
      bone: carriage,
    });
    b.extrude(plate, { at: [s * 0.172, 0, 0], thickness: 0.008, bevel: 0.002, smoothing: 1, color: GREEN, bone: carriage });
    b.rod([s * 0.12, 0.145, -0.118], [s * 0.12, 0.19, -0.118], 0.002, { color: CHROME, sides: 6, bone: carriage });
    // paper bail arms and rollers
    b.rod([s * 0.13, 0.186, -0.058], [s * 0.168, 0.168, -0.07], 0.0015, { color: CHROME, sides: 6, bone: carriage });
    b.part(new THREE.CylinderGeometry(0.0042, 0.0042, 0.012, 10), BLACK, {
      at: [s * 0.05, 0.186, -0.058],
      dir: [1, 0, 0],
      bone: carriage,
    });
  }
  for (const z of [-0.05, -0.11])
    b.rod([-0.2, 0.134, z], [0.2, 0.134, z], 0.0035, { color: CHROME, sides: 8, bone: carriage });
  box(0.35, 0.018, 0.012, GREEN, [0, 0.14, -0.118], carriage);
  b.rod([-0.13, 0.186, -0.058], [0.13, 0.186, -0.058], 0.0016, { color: CHROME, sides: 6, bone: carriage });

  // paper table
  b.slab(
    [
      [-0.15, 0.17, -0.105],
      [0.15, 0.17, -0.105],
      [0.15, 0.285, -0.15],
      [-0.15, 0.285, -0.15],
    ],
    { color: GREEN, thickness: 0.004, bone: carriage },
  );
  b.rod([-0.15, 0.2865, -0.1505], [0.15, 0.2865, -0.1505], 0.0016, { color: GOLD, sides: 6, bone: carriage });
  b.part(new THREE.BoxGeometry(0.004, 0.05, 0.008), CHROME, {
    at: [-0.112, 0.215, -0.122],
    dir: [0, 0.93, -0.36],
    bone: carriage,
  });

  // the half-typed letter
  const lines = [
    "October 14, 1934",
    "",
    "Dear Margaret,",
    "",
    "The new machine arrived this",
    "morning, green as a racing car",
    "and very nearly as loud. Every",
    "key strikes like a small bell,",
    "and the carriage sings when I",
    "send it home. I mean to write",
    "you a proper letter at last, so",
    "bear with these first clumsy l",
  ];
  let txt = "";
  lines.forEach((l, i) => {
    if (l) txt += `<text x="24" y="${22 + i * 9}" font-family="Courier New, Courier, monospace" font-size="5.6" fill="#262626">${esc(l)}</text>`;
  });
  const paperTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 170"><rect width="216" height="170" fill="${PAPER}"/>${txt}</svg>`,
    { size: 768 },
  );
  b.cards([frame([0, 0.1885, -0.075], [0, 1, 0])], paperTex, {
    size: [0.216, 0.17],
    lean: 20,
    bend: 8,
    flow: [0, 0, -1],
    mirror: true,
    sink: 0,
    bone: carriage,
  });

  // carriage return lever (typist's left)
  const lever = b.joint("lever", { parent: carriage, at: [-0.184, 0.178, -0.06], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.0065, 0.0065, 0.009, 10), CHROME, {
    at: [-0.181, 0.178, -0.06],
    dir: [1, 0, 0],
    bone: lever,
  });
  b.sweep(bezier([-0.186, 0.178, -0.06], [-0.2, 0.21, -0.045], [-0.212, 0.228, -0.005], [-0.23, 0.226, 0.045]), [0.0035, 0.0028], {
    color: CHROME,
    sides: 8,
    bone: lever,
  });
  b.part(new THREE.SphereGeometry(0.009, 10, 6), CHROME, {
    at: [-0.232, 0.226, 0.054],
    scale: [1, 0.5, 1.7],
    bone: lever,
  });

  // ---------- finish: gloss on lacquer and chrome ----------
  const root = b.root;
  const tune: Record<string, [number, number]> = {
    [GREEN]: [0.2, 0.08],
    [GREEN_D]: [0.3, 0.08],
    [CHROME]: [0.22, 0.45],
    [BRASS]: [0.3, 0.45],
    [BRASS_D]: [0.35, 0.4],
    [GOLD]: [0.3, 0.4],
    [BLACK]: [0.35, 0.05],
  };
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    if (!m || Array.isArray(m) || !(m instanceof THREE.MeshStandardMaterial) || m.map) return;
    const t = tune["#" + m.color.getHexString()];
    if (t) {
      m.roughness = t[0];
      m.metalness = t[1];
    }
  });
  return root;
}
```