import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Neon Cabinet 1984",
  "description": "A synthwave 1980s upright arcade cabinet with a glowing magenta and cyan marquee, angled screen, joystick control panel, and neon side art."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  body: "#14102b",
  bodyLight: "#241a4a",
  kick: "#07060f",
  neonMagenta: "#ff2bd6",
  neonCyan: "#2ff3ff",
  sunYellow: "#ffd23f",
  sunOrange: "#ff7a3d",
  sunPink: "#ff4f8b",
  purple: "#7a2cff",
  chrome: "#c9d3e6",
  darkMetal: "#2a2a38",
  screenGlass: "#0a1a2e",
  screenGlow: "#3affc8",
  buttonRed: "#ff3355",
  buttonBlue: "#3b8bff",
  buttonYellow: "#ffe14a",
  white: "#f4f1ff",
  black: "#050509",
};
const M = {
  cabFloorFront: [0, 0.08, 0.38] as [number, number, number],
  panelFront: [0, 0.98, 0.47] as [number, number, number],
  screenCentre: [0, 1.3, 0.28] as [number, number, number],
  marqueeBase: [0, 1.62, 0.1] as [number, number, number],
  coinDoor: [0, 0.62, 0.38] as [number, number, number],
  sideLeft: [0.37, 0.9, 0] as [number, number, number],
  sideRight: [-0.37, 0.9, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // carcass
  (() => {
function buildCarcass({ b, P }: any) {
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, g = false) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
    if (g) glow(p, 1.4);
    return p;
  };

  // Side profile (z horizontal drawn as x, y up), stepped: tall back, control shelf, notched kick
  const profile: [number, number][] = [
    [-0.45, 0.0], [-0.45, 1.62], [0.1, 1.62], [0.1, 1.05], [0.4, 1.0], [0.4, 0.1],
    [0.3, 0.1], [0.3, 0.0],
  ];
  for (const s of [1, -1]) {
    b.extrude(profile, {
      at: [s * 0.36, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, color: P.body,
    });
    // chrome T-molding along the side edges
    const tx = s * 0.386;
    box(0.012, 1.62, 0.016, P.chrome, tx, 0.81, -0.448);
    box(0.012, 0.016, 0.55, P.chrome, tx, 1.612, -0.175);
    box(0.012, 0.05, 0.016, P.chrome, tx, 1.03, 0.1);
    box(0.012, 0.016, 0.3, P.chrome, tx, 1.02, 0.25);
    box(0.012, 0.9, 0.016, P.chrome, tx, 0.55, 0.398);
    // side accent neon trim
    box(0.008, 0.012, 0.5, P.neonMagenta, s * 0.382, 0.2, -0.18, true);
    // feet
    for (const z of [-0.4, 0.25]) box(0.07, 0.03, 0.07, P.darkMetal, s * 0.32, 0.015, z);
  }

  // back panel
  box(0.68, 1.58, 0.03, P.bodyLight, 0, 0.81, -0.435);
  // inner core behind screen / shelf
  box(0.68, 1.52, 0.4, P.body, 0, 0.82, -0.2);
  // top cap
  box(0.76, 0.04, 0.56, P.body, 0, 1.6, -0.17);
  // upper front panel behind screen area (recessed)
  box(0.68, 0.55, 0.04, P.body, 0, 1.33, 0.08);
  // lower front panel
  box(0.68, 0.88, 0.03, P.bodyLight, 0, 0.55, 0.385);
  // panel shelf underside
  box(0.68, 0.04, 0.3, P.body, 0, 1.0, 0.25);
  // kick plate recess
  box(0.68, 0.1, 0.03, P.kick, 0, 0.05, 0.37);
  box(0.68, 0.1, 0.5, P.kick, 0, 0.05, 0.1);
  // front lower panel trim lines
  box(0.68, 0.012, 0.01, P.chrome, 0, 0.11, 0.402);
  box(0.68, 0.012, 0.01, P.chrome, 0, 0.99, 0.402);

  // neon front edge strips
  for (const s of [1, -1]) {
    box(0.014, 0.86, 0.012, P.neonCyan, s * 0.335, 0.55, 0.405, true);
    box(0.01, 0.86, 0.01, P.neonMagenta, s * 0.35, 0.55, 0.405, true);
    box(0.012, 0.5, 0.012, P.neonCyan, s * 0.335, 1.3, 0.1, true);
  }
  box(0.66, 0.012, 0.012, P.neonMagenta, 0, 0.13, 0.405, true);

  // rivets on panel
  const r = rng(3);
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1;
    const y = 0.2 + Math.floor(i / 2) * 0.22 + r() * 0.02;
    b.part(new THREE.SphereGeometry(0.008, 6, 4), P.chrome, { at: [s * 0.31, y, 0.404] });
  }
}
    return buildCarcass;
  })(),
  // controlPanel
  (() => {
function buildControlPanel({ b, P }: any) {
  const add = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { at, ...o });
  const box = (w: number, h: number, d: number, color: string, at: number[], o: any = {}) =>
    add(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], o: any = {}) =>
    add(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const g = (p: any, s = 1) => glow(p, s);

  // Deck slope: top surface tilts down toward the player. Tilt about X.
  const tilt = 0.30; // radians; the front edge is lower
  const deckC = [0, 1.0, 0.39];
  const R = [-(Math.PI / 2 - tilt) * 0 + tilt, 0, 0]; // rotation in radians
  const rotDeg = [(tilt * 180) / Math.PI, 0, 0];
  // Point on the deck surface: u across x, v along slope (+ toward the front), lift out of the surface
  const onDeck = (u: number, v: number, lift = 0) => {
    const c = Math.cos(tilt), s = Math.sin(tilt);
    return [u, deckC[1] + 0.012 + (-v * s) + lift * c, deckC[2] + v * c + lift * s];
  };
  const deckAim = rotDeg;

  // Main plate
  box(0.72, 0.024, 0.2, "#1a1030", deckC, { rotation: deckAim });
  // underside support wedge
  box(0.7, 0.2, 0.16, P.kick, [0, 0.9, 0.38]);
  // Chrome front lip
  box(0.73, 0.03, 0.016, P.chrome, onDeck(0, 0.1, 0.0), { rotation: deckAim });
  box(0.012, 0.03, 0.2, P.chrome, onDeck(0.36, 0, 0.0), { rotation: deckAim });
  box(0.012, 0.03, 0.2, P.chrome, onDeck(-0.36, 0, 0.0), { rotation: deckAim });
  // Neon outline trace
  const trace = (w: number, d: number, u: number, v: number) =>
    g(box(w, 0.002, d, P.neonCyan, onDeck(u, v, 0.002), { rotation: deckAim }), 1.2);
  trace(0.66, 0.003, 0, 0.088);
  trace(0.66, 0.003, 0, -0.088);
  trace(0.003, 0.176, 0.33, 0);
  trace(0.003, 0.176, -0.33, 0);

  // Joystick
  const jp = onDeck(-0.17, 0.0, 0);
  cyl(0.04, 0.045, 0.012, 14, P.darkMetal, onDeck(-0.17, 0, 0.006), { rotation: deckAim });
  cyl(0.028, 0.028, 0.004, 14, P.black, onDeck(-0.17, 0, 0.013), { rotation: deckAim });
  cyl(0.006, 0.006, 0.09, 8, P.chrome, onDeck(-0.17, 0, 0.055), { rotation: deckAim });
  g(add(new THREE.SphereGeometry(0.026, 12, 8), P.buttonRed, onDeck(-0.17, 0, 0.115)), 0.9);
  box(0.004, 0.004, 0.01, P.white, onDeck(-0.17, 0.0, 0.002), { rotation: deckAim });

  // Six buttons in two rows of three
  const cols = [P.buttonRed, P.buttonBlue, P.buttonYellow];
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) {
      const u = 0.05 + c * 0.075, v = -0.03 + r * 0.07;
      cyl(0.026, 0.028, 0.008, 14, P.black, onDeck(u, v, 0.004), { rotation: deckAim });
      g(cyl(0.02, 0.022, 0.014, 14, cols[(c + r) % 3], onDeck(u, v, 0.012), { rotation: deckAim }), 1.1);
      cyl(0.011, 0.014, 0.003, 10, P.white, onDeck(u, v, 0.02), { rotation: deckAim });
      // label stripe
      box(0.05, 0.002, 0.006, cols[(c + r) % 3], onDeck(u, v - 0.035, 0.001), { rotation: deckAim });
    }
  // Label stripes near joystick
  box(0.07, 0.002, 0.006, P.neonMagenta, onDeck(-0.17, 0.065, 0.001), { rotation: deckAim });
  box(0.05, 0.002, 0.004, P.neonCyan, onDeck(-0.17, 0.077, 0.001), { rotation: deckAim });

  // Start buttons
  for (const s of [-1, 1]) {
    const u = s * 0.065 - 0.015 + 0.0;
    cyl(0.017, 0.019, 0.008, 12, P.black, onDeck(-0.17 + s * 0.0 + (s - 1) * 0.0 + s * 0.09 + 0.0, 0.065, 0.004), { rotation: deckAim });
    g(cyl(0.012, 0.014, 0.012, 12, s > 0 ? P.buttonRed : P.buttonBlue, onDeck(-0.17 + s * 0.09, 0.065, 0.011), { rotation: deckAim }), 1);
  }
  void jp;

  // Coin door
  const dz = 0.388;
  box(0.26, 0.3, 0.014, P.darkMetal, [0, 0.62, dz + 0.007]);
  g(box(0.27, 0.008, 0.006, P.neonMagenta, [0, 0.775, dz + 0.016]), 1.2);
  g(box(0.27, 0.008, 0.006, P.neonMagenta, [0, 0.465, dz + 0.016]), 1.2);
  g(box(0.008, 0.31, 0.006, P.neonMagenta, [0.135, 0.62, dz + 0.016]), 1.2);
  g(box(0.008, 0.31, 0.006, P.neonMagenta, [-0.135, 0.62, dz + 0.016]), 1.2);
  for (const s of [-1, 1]) {
    const x = s * 0.06;
    box(0.06, 0.09, 0.004, P.chrome, [x, 0.67, dz + 0.016]);
    g(box(0.008, 0.045, 0.003, P.sunYellow, [x, 0.675, dz + 0.019]), 1.3);
    box(0.034, 0.012, 0.003, P.black, [x, 0.645, dz + 0.019]);
    // return cup
    box(0.055, 0.05, 0.012, P.black, [x, 0.56, dz + 0.02]);
    box(0.045, 0.036, 0.004, P.chrome, [x, 0.56, dz + 0.027]);
    box(0.038, 0.028, 0.003, P.kick, [x, 0.56, dz + 0.03]);
    cyl(0.006, 0.006, 0.004, 8, P.chrome, [x, 0.5, dz + 0.017], { rotation: [90, 0, 0] });
  }
  box(0.2, 0.012, 0.003, P.chrome, [0, 0.74, dz + 0.016]);
  for (const s of [-1, 1]) for (const t of [-1, 1])
    cyl(0.005, 0.005, 0.004, 6, P.chrome, [s * 0.115, 0.62 + t * 0.13, dz + 0.016], { rotation: [90, 0, 0] });
}
    return buildControlPanel;
  })(),
  // screenAssembly
  (() => {
function buildScreenAssembly({ b, J, P, M }: Ctx) {
  const box = (w: number, h: number, d: number, color: string, at: number[], rotX = 0, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: [rotX, 0, 0] as any });
    if (g) glow(p, g);
    return p;
  };
  // Screen tilts back: top leans toward -Z. Tilt angle in degrees.
  const TILT = -12;
  const cy = 1.3, cz = 0.28;
  const rad = (TILT * Math.PI) / 180;
  // point in tilted plane: u across x, v up the face, n out of the face
  const pt = (u: number, v: number, n: number) => [
    u,
    cy + v * Math.cos(rad) - n * Math.sin(rad) * -1 * -1 + 0,
    cz + v * Math.sin(rad) + n * Math.cos(rad),
  ];
  // recompute precisely: face up vector = (0,cos,sin(rad)) with rad negative => top goes back; normal = (0,-sin,cos)
  const P3 = (u: number, v: number, n: number) => [
    u,
    cy + v * Math.cos(rad) - n * Math.sin(rad),
    cz + v * Math.sin(rad) + n * Math.cos(rad),
  ];
  const rx = -rad * 180 / Math.PI * -1; // rotation about X for boxes
  const rot = TILT; // negative X rotation tips the top back
  const W = 0.6, H = 0.46;

  // bezel frame (black)
  const t = 0.05;
  box(W + 2 * t, t, 0.06, P.black, P3(0, H / 2 + t / 2, 0), rot);
  box(W + 2 * t, t, 0.06, P.black, P3(0, -H / 2 - t / 2, 0), rot);
  for (const s of [1, -1]) box(t, H, 0.06, P.black, P3(s * (W / 2 + t / 2), 0, 0), rot);
  // recessed glass
  box(W, H, 0.02, P.screenGlass, P3(0, 0, -0.012), rot);
  // glowing green face
  box(W - 0.04, H - 0.04, 0.004, P.screenGlow, P3(0, 0, 0.0), rot, 0.55);
  // cyan neon inner frame
  const fw = 0.006;
  box(W, fw, 0.01, P.neonCyan, P3(0, H / 2 - fw / 2, 0.012), rot, 1.4);
  box(W, fw, 0.01, P.neonCyan, P3(0, -H / 2 + fw / 2, 0.012), rot, 1.4);
  for (const s of [1, -1]) box(fw, H, 0.01, P.neonCyan, P3(s * (W / 2 - fw / 2), 0, 0.012), rot, 1.4);

  // pixel art invaders
  const dark = "#06281f";
  const px = 0.016;
  const inv = [
    "..x.....x..",
    "...x...x...",
    "..xxxxxxx..",
    ".xx.xxx.xx.",
    "xxxxxxxxxxx",
    "x.xxxxxxx.x",
    "x.x.....x.x",
    "...xx.xx...",
  ];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const ox = (c - 1) * 0.19, oy = 0.12 - r * 0.075;
      const scale = 0.55;
      inv.forEach((row, j) =>
        [...row].forEach((ch, i) => {
          if (ch !== "x") return;
          const col = r === 0 ? P.neonMagenta : r === 1 ? P.neonCyan : P.sunYellow;
          const q = box(px * scale, px * scale, 0.004, col, P3(ox + (i - 5) * px * scale, oy - (j - 4) * px * scale, 0.006), rot);
          glow(q, 1.2);
        }),
      );
    }
  // player ship
  const ship = [
    [0, 0.012],
    [-0.012, 0],
    [0, 0],
    [0.012, 0],
    [-0.024, -0.012],
    [-0.012, -0.012],
    [0, -0.012],
    [0.012, -0.012],
    [0.024, -0.012],
  ];
  for (const [x, y] of ship) glow(box(0.012, 0.012, 0.004, P.white, P3(x, -0.17 + y, 0.006), rot), 1.2);
  // barriers
  for (const bx of [-0.2, 0, 0.2])
    glow(box(0.06, 0.016, 0.004, P.purple, P3(bx, -0.1, 0.006), rot), 1);
  // score text bars
  const bars = [0.02, 0.035, 0.015, 0.03, 0.02];
  let x0 = -0.27;
  for (const w of bars) {
    glow(box(w, 0.012, 0.004, P.neonCyan, P3(x0 + w / 2, H / 2 - 0.03, 0.006), rot), 1.2);
    x0 += w + 0.01;
  }
  x0 = 0.08;
  for (const w of bars) {
    glow(box(w, 0.012, 0.004, P.neonMagenta, P3(x0 + w / 2, H / 2 - 0.03, 0.006), rot), 1.2);
    x0 += w + 0.01;
  }

  // chrome corner bolts
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      const p = P3(sx * (W / 2 + t / 2), sy * (H / 2 + t / 2), 0.036);
      b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 8), P.chrome, { at: p as any, rotation: [rot + 90, 0, 0] as any });
    }

  // side supports behind bezel to meet carcass
  for (const s of [1, -1]) box(0.03, 0.5, 0.2, P.black, [s * 0.335, 1.32, 0.18]);

  // speaker grille slits below marquee
  box(0.5, 0.07, 0.02, P.darkMetal, [0, 1.555, 0.12]);
  for (let i = 0; i < 9; i++) box(0.46, 0.005, 0.006, P.black, [0, 1.532 + i * 0.0085, 0.132]);
}
    return buildScreenAssembly;
  })(),
  // marquee
  (() => {
function buildMarquee({ b, P }: any) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (r: number, h: number, c: string, x: number, y: number, z: number, g = 0, seg = 8) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: [x, y, z], dir: [0, 0, 1], axis: "y" });
    if (g) glow(p, g);
    return p;
  };
  const cy = 1.71, fz = 0.46;
  // housing
  box(0.76, 0.26, 0.86, P.body, 0, cy, -0.02);
  box(0.74, 0.02, 0.88, P.chrome, 0, 1.835, -0.01);
  box(0.78, 0.015, 0.9, P.bodyLight, 0, 1.585, -0.01);
  // sign front
  box(0.68, 0.2, 0.012, P.neonMagenta, 0, cy + 0.01, fz - 0.01, 1.1);
  box(0.7, 0.012, 0.014, P.neonCyan, 0, cy + 0.115, fz, 1.3);
  box(0.7, 0.012, 0.014, P.neonCyan, 0, cy - 0.095, fz, 1.3);
  for (const s of [1, -1]) box(0.012, 0.21, 0.014, P.neonCyan, s * 0.35, cy + 0.01, fz, 1.3);
  box(0.64, 0.17, 0.008, P.purple, 0, cy + 0.01, fz + 0.002);
  // sun bands
  const bands = [P.sunYellow, P.sunYellow, P.sunOrange, P.sunOrange, P.sunPink, P.sunPink];
  bands.forEach((c, i) => {
    const y = cy + 0.075 - i * 0.017;
    const hw = Math.sqrt(Math.max(0.0, 0.085 * 0.085 - Math.pow(0.075 - i * 0.017 - 0.0, 2) * 0.5)) + 0.04;
    box(hw * 1.6, 0.012, 0.008, c, 0, y, fz + 0.008, 1.2);
  });
  // grid
  const gy = cy - 0.065;
  box(0.62, 0.01, 0.008, P.neonCyan, 0, gy + 0.015, fz + 0.008, 1.2);
  box(0.62, 0.008, 0.008, P.neonCyan, 0, gy - 0.01, fz + 0.008, 1.2);
  box(0.62, 0.008, 0.008, P.neonCyan, 0, gy - 0.025, fz + 0.008, 1.2);
  for (let i = -5; i <= 5; i++) {
    const p = b.part(new THREE.BoxGeometry(0.005, 0.05, 0.006), P.neonCyan, { at: [i * 0.055, gy - 0.003, fz + 0.009] });
    p.mesh.rotation.z = -i * 0.12;
    glow(p, 1.2);
  }
  // palms
  for (const s of [1, -1]) {
    const x = s * 0.24, z = fz + 0.009;
    box(0.008, 0.1, 0.006, P.black, x, cy - 0.01, z);
    for (let k = -2; k <= 2; k++) {
      const l = b.part(new THREE.BoxGeometry(0.05, 0.007, 0.006), P.black, { at: [x + k * 0.016, cy + 0.045 - Math.abs(k) * 0.01, z] });
      l.mesh.rotation.z = k * 0.35;
    }
  }
  // name letters (blocky bars)
  const nx = -0.17;
  [[0, 0.03], [0.04, 0.03], [0.08, 0.03], [0.12, 0.03], [0.16, 0.03], [0.2, 0.03]].forEach(([dx], i) => {
    box(0.008, 0.026, 0.006, P.white, nx + dx + 0.07, cy + 0.093, fz + 0.01, 1);
    if (i % 2 === 0) box(0.026, 0.006, 0.006, P.white, nx + dx + 0.075, cy + 0.103, fz + 0.01, 1);
  });
  // LEDs
  for (let i = 0; i < 15; i++) {
    const c = i % 2 ? P.neonCyan : P.neonMagenta;
    const p = b.part(new THREE.SphereGeometry(0.008, 6, 4), c, { at: [-0.35 + i * 0.05, 1.595, fz - 0.002] });
    glow(p, 1.5);
  }
  // overhang trim + side neon
  box(0.72, 0.012, 0.03, P.chrome, 0, 1.6, fz - 0.02);
  for (const s of [1, -1]) {
    box(0.006, 0.02, 0.86, P.neonMagenta, s * 0.381, 1.78, -0.02, 1.2);
    box(0.006, 0.012, 0.86, P.neonCyan, s * 0.381, 1.66, -0.02, 1.2);
  }
}
    return buildMarquee;
  })(),
  // sideArt
  (() => {
function buildSideArt({ b, J, P, M }: Ctx) {
  const R = rng(84);
  // Side panel face sits at x = +-0.38; plates are seated 4 mm off it.
  const X0 = 0.384;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
    if (g) glow(p, g);
    return p;
  };
  for (const s of [1, -1]) {
    const x = s * X0;
    // backing dark plate
    box(0.006, 1.38, 0.78, "#14102b", x, 0.83, -0.05);
    // sun made of stacked bands
    const cy = 1.0, cz = 0.0, R0 = 0.28;
    const bands = ["#ffd23f", "#ffd23f", "#ffb43f", "#ff7a3d", "#ff7a3d", "#ff4f8b", "#ff4f8b", "#ff2bd6"];
    bands.forEach((c, i) => {
      const y = cy + 0.24 - i * 0.065;
      const dy = y - cy;
      const half = Math.sqrt(Math.max(R0 * R0 - dy * dy, 0.0004));
      glow(box(0.004, 0.05 - i * 0.003, half * 2, c, x + s * 0.004, y, cz), 0.8);
    });
    // mountains: stacked triangles via extrude
    const mountain = (ox: number, w: number, h: number, c: string) => {
      const part = b.extrude(
        [[-w / 2, 0], [w / 2, 0], [0.02 * w, h, "sharp"], [-0.1 * w, h * 0.8, "sharp"]],
        { at: [x + s * 0.008, 0.52, ox], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: c },
      );
      return part;
    };
    mountain(-0.2, 0.42, 0.32, "#7a2cff");
    mountain(0.12, 0.5, 0.26, "#5a1fc0");
    mountain(0.28, 0.3, 0.2, "#7a2cff");
    // perspective grid at bottom
    const gridY0 = 0.14;
    for (let i = 0; i < 5; i++) {
      const y = gridY0 + i * i * 0.012 + 0.02;
      glow(box(0.003, 0.006, 0.76, i % 2 ? "#2ff3ff" : "#ff2bd6", x + s * 0.006, y + 0.1, -0.05), 1);
    }
    for (let i = -5; i <= 5; i++) {
      const z = -0.05 + i * 0.065;
      const p = b.part(new THREE.BoxGeometry(0.003, 0.2, 0.005), "#ff2bd6", {
        at: [x + s * 0.006, 0.24, -0.05 + i * 0.065 * 1.0],
        rotation: [i * 6, 0, 0],
      });
      glow(p, 1);
    }
    // diagonal neon stripes
    [["#2ff3ff", 0.45], ["#ff2bd6", 0.36]].forEach(([c, off], k) => {
      const p = b.part(new THREE.BoxGeometry(0.004, 0.012, 0.6), c as string, {
        at: [x + s * 0.006, 1.38 - k * 0.04, 0.0 + (off as number) * 0.0],
        rotation: [-25, 0, 0],
      });
      glow(p, 1.2);
    });
    // stars
    for (let i = 0; i < 14; i++) {
      const z = -0.38 + R() * 0.7;
      const y = 1.3 + R() * 0.2;
      glow(box(0.004, 0.008, 0.008, "#f4f1ff", x + s * 0.005, y, z), 1);
    }
  }
  // rear vent grille
  const rz = -0.452;
  box(0.4, 0.2, 0.01, "#050509", 0, 1.3, rz);
  for (let i = 0; i < 9; i++) box(0.36, 0.008, 0.008, "#2a2a38", 0, 1.22 + i * 0.02, rz - 0.007);
  box(0.42, 0.012, 0.012, "#c9d3e6", 0, 1.41, rz - 0.003);
  box(0.42, 0.012, 0.012, "#c9d3e6", 0, 1.19, rz - 0.003);
  // AC power plate
  box(0.14, 0.1, 0.008, "#c9d3e6", 0.15, 0.35, rz);
  box(0.1, 0.06, 0.008, "#2a2a38", 0.15, 0.35, rz - 0.005);
  box(0.016, 0.03, 0.008, "#050509", 0.13, 0.35, rz - 0.01);
  box(0.016, 0.03, 0.008, "#050509", 0.17, 0.35, rz - 0.01);
  glow(box(0.012, 0.012, 0.006, "#ff3355", 0.19, 0.39, rz - 0.01), 1);
  // cord
  const cord = b.sweep(
    [[0.15, 0.32, rz - 0.02], [0.15, 0.22, rz - 0.07], [0.05, 0.14, rz - 0.1], [-0.1, 0.12, rz - 0.16]],
    0.008,
    { color: "#050509", sides: 6 },
  );
}
    return buildSideArt;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "neonArcadeCabinet" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
