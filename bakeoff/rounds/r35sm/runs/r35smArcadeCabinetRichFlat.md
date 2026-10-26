```ts
import * as THREE from "three";
import { createBuilder, polyline, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Synthwave Arcade Cabinet",
  description:
    "A 1980s upright arcade cabinet in synthwave style: neon-edged sides with a striped sun, a glowing retro-grid screen, an illuminated marquee, a two-player control deck and a coin door.",
};

// Palette
const BODY = "#0f0824";
const SIDE = "#1a0d3a";
const DEEP = "#07040f";
const PANEL = "#241046";
const MAGENTA = "#ff2e97";
const PINK = "#ff4fa0";
const CYAN = "#35f2ff";
const ORANGE = "#ff8a2e";
const YELLOW = "#ffd23f";
const SILVER = "#c9c9de";
const RED = "#ff2d3d";

export default function build() {
  const b = createBuilder({ name: "arcade" });

  const box = (size: [number, number, number], at: [number, number, number], color: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: rot });
  const cyl = (r: number, h: number, seg: number, at: [number, number, number], color: string, dir: [number, number, number] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir });

  // ---------- Body silhouette (z, y) ----------
  const O: [number, number][] = [
    [-0.37, 0],
    [0.34, 0],
    [0.34, 0.88],
    [0.42, 0.98],
    [0.42, 1.04],
    [0.26, 1.06],
    [0.2, 1.56],
    [0.31, 1.58],
    [0.31, 1.84],
    [-0.3, 1.84],
  ];
  b.extrude(O, { at: [0, 0, 0], x: [0, 0, 1], thickness: 0.62, color: BODY });

  const cz = 0.04;
  const cy = 0.92;
  const inset = O.map(([z, y]) => [cz + (z - cz) * 0.965, cy + (y - cy) * 0.965] as [number, number]);

  for (const s of [1, -1]) {
    b.extrude(O, { at: [s * 0.33, 0, 0], x: [0, 0, 1], thickness: 0.04, color: SIDE });
    const sx = s * 0.352;

    // neon silhouette edge
    const pts = inset.map(([z, y]) => [sx, y, z] as [number, number, number]);
    glow(b.sweep(polyline(pts, { closed: true }), 0.006, { color: s > 0 ? MAGENTA : CYAN, sides: 6 }), 1.2);

    // striped sun
    const sy = 1.3;
    const sz = -0.06;
    cyl(0.17, 0.006, 28, [sx + s * 0.002, sy, sz], YELLOW, [s, 0, 0]);
    cyl(0.125, 0.006, 24, [sx + s * 0.004, sy - 0.02, sz], ORANGE, [s, 0, 0]);
    cyl(0.075, 0.006, 20, [sx + s * 0.006, sy - 0.045, sz], PINK, [s, 0, 0]);
    [-0.03, -0.065, -0.1, -0.135].forEach((h, i) => {
      const w = 2 * Math.sqrt(0.17 * 0.17 - h * h);
      box([0.012, 0.008 + i * 0.004, w + 0.01], [sx + s * 0.007, sy + h, sz], SIDE);
    });

    // racing stripes
    [MAGENTA, ORANGE, YELLOW, CYAN].forEach((c, i) => {
      glow(box([0.006, 0.03, 0.56], [sx, 0.38 + i * 0.07, 0.0], c, [30, 0, 0]), 0.9);
    });

    // side kick trim
    box([0.008, 0.06, 0.68], [sx, 0.05, -0.01], DEEP);
  }

  // ---------- Back ----------
  box([0.62, 1.84, 0.02], [0, 0.92, -0.34], BODY, [1.9, 0, 0]);
  for (let i = 0; i < 7; i++) {
    const y = 0.45 + i * 0.035;
    box([0.36, 0.014, 0.01], [0, y, -0.37 + (0.06 * y) / 1.84 - 0.004], DEEP, [1.9, 0, 0]);
  }
  box([0.1, 0.1, 0.012], [0.16, 0.2, -0.366], SILVER, [1.9, 0, 0]);
  b.sweep(
    catmull([
      [0.16, 0.2, -0.375],
      [0.18, 0.1, -0.5],
      [0.1, 0.02, -0.62],
      [0.0, 0.015, -0.78],
    ]),
    0.008,
    { color: DEEP, sides: 6 },
  );

  // ---------- Front lower ----------
  box([0.62, 0.1, 0.006], [0, 0.05, 0.342], DEEP);
  glow(box([0.62, 0.012, 0.008], [0, 0.125, 0.343], MAGENTA), 1.3);
  glow(box([0.62, 0.012, 0.008], [0, 0.15, 0.343], CYAN), 1.3);
  glow(box([0.62, 0.008, 0.008], [0, 0.17, 0.343], YELLOW), 1.1);

  // speaker slits
  for (let i = 0; i < 5; i++) box([0.4, 0.007, 0.006], [0, 0.72 + i * 0.024, 0.343], DEEP);
  box([0.44, 0.13, 0.004], [0, 0.768, 0.341], PANEL);
  for (let i = 0; i < 5; i++) box([0.4, 0.007, 0.006], [0, 0.72 + i * 0.024, 0.345], "#05030a");

  // coin door
  box([0.24, 0.3, 0.012], [0, 0.46, 0.346], "#15152a");
  box([0.25, 0.012, 0.014], [0, 0.61, 0.347], SILVER);
  box([0.25, 0.012, 0.014], [0, 0.31, 0.347], SILVER);
  box([0.012, 0.3, 0.014], [0.125, 0.46, 0.347], SILVER);
  box([0.012, 0.3, 0.014], [-0.125, 0.46, 0.347], SILVER);
  for (const s of [1, -1]) {
    box([0.07, 0.11, 0.008], [s * 0.06, 0.5, 0.354], SILVER);
    box([0.006, 0.05, 0.01], [s * 0.06, 0.52, 0.356], DEEP);
    glow(box([0.05, 0.016, 0.008], [s * 0.06, 0.575, 0.354], YELLOW), 1.4);
    box([0.05, 0.05, 0.008], [s * 0.06, 0.4, 0.354], PANEL);
    glow(box([0.028, 0.03, 0.01], [s * 0.06, 0.4, 0.358], RED), 1.1);
  }

  // ---------- Control deck ----------
  box([0.62, 0.008, 0.16], [0, 1.044, 0.34], PANEL);
  glow(box([0.62, 0.012, 0.008], [0, 1.01, 0.424], MAGENTA), 1.4);
  glow(box([0.62, 0.006, 0.006], [0, 1.0, 0.424], CYAN), 1.2);
  const btnCols = [CYAN, MAGENTA, YELLOW];
  for (const s of [1, -1]) {
    const jx = s * 0.22;
    cyl(0.04, 0.008, 12, [jx, 1.052, 0.34], DEEP);
    cyl(0.007, 0.07, 8, [jx, 1.088, 0.34], SILVER);
    b.part(new THREE.SphereGeometry(0.024, 10, 8), s > 0 ? RED : CYAN, { at: [jx, 1.138, 0.34] });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), "#ffffff", { at: [jx - 0.008, 1.148, 0.35] });
    for (let i = 0; i < 3; i++) {
      const bx = s * (0.045 + i * 0.043);
      const bz = i === 1 ? 0.335 : 0.355;
      cyl(0.026, 0.008, 12, [bx, 1.05, bz], DEEP);
      glow(cyl(0.02, 0.014, 12, [bx, 1.058, bz], btnCols[(i + (s > 0 ? 0 : 1)) % 3]), 0.9);
    }
    box([0.03, 0.01, 0.02], [s * 0.025, 1.052, 0.4], s > 0 ? "#ffffff" : RED);
  }
  // deck arrow motif
  for (let i = 0; i < 3; i++) glow(box([0.05 - i * 0.012, 0.003, 0.004], [0, 1.049, 0.29 + i * 0.012], CYAN), 1);

  // ---------- Screen ----------
  const ang = Math.atan2(0.06, 0.5);
  const S = new THREE.Matrix4().compose(
    new THREE.Vector3(0, 1.06, 0.262),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-ang, 0, 0)),
    new THREE.Vector3(1, 1, 1),
  );
  const scr = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, rotZ = 0, str = 0) => {
    geo.applyMatrix4(
      S.clone()
        .multiply(new THREE.Matrix4().makeTranslation(x, y, z))
        .multiply(new THREE.Matrix4().makeRotationZ(rotZ)),
    );
    const p = b.part(geo, color, { at: [0, 0, 0] });
    if (str) glow(p, str);
    return p;
  };
  const sbox = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rotZ = 0, str = 0) =>
    scr(new THREE.BoxGeometry(w, h, d), color, x, y, z, rotZ, str);

  sbox(0.6, 0.5, 0.012, "#07060f", 0, 0.25, 0.004);
  sbox(0.5, 0.44, 0.004, "#0b0620", 0, 0.25, 0.011);
  const sky = ["#ff5a6e", "#d42a82", "#a31a8c", "#6a1485", "#3a0f6e", "#1b0b4a"];
  sky.forEach((c, i) => sbox(0.5, 0.0465, 0.004, c, 0, 0.2 + 0.0232 + i * 0.0465, 0.014, 0, 0.8));
  // sun
  scr(new THREE.CylinderGeometry(0.085, 0.085, 0.004, 24).rotateX(Math.PI / 2), YELLOW, 0, 0.26, 0.018, 0, 1);
  scr(new THREE.CylinderGeometry(0.055, 0.055, 0.004, 20).rotateX(Math.PI / 2), ORANGE, 0, 0.245, 0.02, 0, 1);
  [0.225, 0.25, 0.275].forEach((y, i) => sbox(0.2, 0.005 + i * 0.003, 0.004, "#d42a82", 0, y, 0.022, 0, 0.8));
  // mountains
  for (const s of [1, -1]) {
    const m = new THREE.ConeGeometry(0.06, 0.09, 4).rotateY(Math.PI / 4).scale(1, 1, 0.2);
    scr(m, "#2a0d5c", s * 0.16, 0.245, 0.024, 0, 0.5);
    const m2 = new THREE.ConeGeometry(0.04, 0.06, 4).rotateY(Math.PI / 4).scale(1, 1, 0.2);
    scr(m2, "#3b1280", s * 0.1, 0.23, 0.026, 0, 0.5);
  }
  // floor and grid
  sbox(0.5, 0.17, 0.004, "#14072e", 0, 0.115, 0.03, 0, 0.5);
  [0.195, 0.18, 0.16, 0.135, 0.105, 0.07, 0.04].forEach((y) => sbox(0.5, 0.003, 0.002, CYAN, 0, y, 0.034, 0, 1.2));
  for (let i = -4; i <= 4; i++) {
    const xb = i * 0.06;
    const L = Math.hypot(xb, 0.17);
    sbox(0.003, L, 0.002, i % 2 ? MAGENTA : CYAN, xb / 2, 0.115, 0.034, Math.atan2(xb, 0.17), 1.2);
  }
  sbox(0.5, 0.004, 0.003, MAGENTA, 0, 0.2, 0.035, 0, 1.4);
  // bezel strip and screen label
  sbox(0.6, 0.012, 0.014, DEEP, 0, 0.004, 0.006);
  glow(sbox(0.04, 0.005, 0.004, RED, 0.24, 0.002, 0.014), 1.5);

  // ---------- Marquee ----------
  box([0.62, 0.26, 0.012], [0, 1.71, 0.304], "#12072a");
  const tex = new THREE.Texture(); // placeholder to keep types simple
  tex.dispose();
  const svgMarkup = `<svg viewBox="0 0 250 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14052e"/><stop offset="1" stop-color="#5a1480"/></linearGradient>
      <linearGradient id="sn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff2e97"/></linearGradient>
    </defs>
    <rect width="250" height="100" fill="url(#bg)"/>
    <circle cx="125" cy="46" r="38" fill="url(#sn)"/>
    <rect x="80" y="52" width="90" height="3" fill="#5a1480"/>
    <rect x="80" y="60" width="90" height="4" fill="#5a1480"/>
    <rect x="80" y="69" width="90" height="5" fill="#5a1480"/>
    <rect x="0" y="78" width="250" height="22" fill="#14072e"/>
    <path d="M0 78H250M0 88H250M0 97H250" stroke="#35f2ff" stroke-width="1.5"/>
    <path d="M125 78L20 100M125 78L70 100M125 78L125 100M125 78L180 100M125 78L230 100" stroke="#ff2e97" stroke-width="1.5"/>
    <text x="125" y="44" text-anchor="middle" font-family="Impact, sans-serif" font-style="italic" font-size="30" fill="#14052e" stroke="#35f2ff" stroke-width="3">TURBO</text>
    <text x="125" y="70" text-anchor="middle" font-family="Impact, sans-serif" font-style="italic" font-size="26" fill="#ffffff" stroke="#ff2e97" stroke-width="3">NIGHTS</text>
  </svg>`;
  b.part(new THREE.PlaneGeometry(0.58, 0.232), "#ffffff", {
    at: [0, 1.71, 0.312],
    dir: [0, 0, 1],
    axis: "z",
    texture: svg(svgMarkup, { size: 512 }),
  });
  b.part(new THREE.PlaneGeometry(0.58, 0.232), "#ffffff", {
    at: [0, 1.71, 0.3125],
    dir: [0, 0, 1],
    axis: "z",
    texture: svg(svgMarkup, { size: 512 }),
  });
  glow(box([0.62, 0.012, 0.014], [0, 1.832, 0.318], CYAN), 1.4);
  glow(box([0.62, 0.012, 0.014], [0, 1.592, 0.318], MAGENTA), 1.4);
  for (const s of [1, -1]) glow(box([0.012, 0.26, 0.014], [s * 0.304, 1.712, 0.318], s > 0 ? MAGENTA : CYAN), 1.4);

  // chaser lights under marquee
  for (let i = 0; i < 11; i++) {
    glow(
      b.part(new THREE.SphereGeometry(0.0085, 6, 4), [YELLOW, MAGENTA, CYAN][i % 3], { at: [-0.25 + i * 0.05, 1.575, 0.32] }),
      1.3,
    );
  }

  return b.root;
}

// The module uses svg from the SDK:
import { svg } from "agentic-3js-builder";
```