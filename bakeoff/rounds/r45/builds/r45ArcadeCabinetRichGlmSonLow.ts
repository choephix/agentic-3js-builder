import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Neon Horizon Arcade Cabinet",
  "description": "A 1980s upright arcade cabinet in full synthwave dress: deep purple cabinet, a glowing sunset marquee, a CRT showing a neon grid horizon, chrome controls and magenta-cyan neon trim with an underglow on the floor."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  cabPurple: "#35245c",
  cabDark: "#241a40",
  cabShadow: "#191129",
  trimPurple: "#5a3a86",
  trimMagenta: "#ff3fae",
  neonCyan: "#2ff3ff",
  neonPink: "#ff5ce1",
  sunOrange: "#ff7a3c",
  sunYellow: "#ffd23c",
  sunRed: "#e83a5f",
  sunViolet: "#7a3fae",
  screenDeep: "#0a0620",
  bezelBlack: "#120c1e",
  chrome: "#c9d4e4",
  steel: "#8a93a4",
  ink: "#1a1026",
  cream: "#f2e9d8",
  btnRed: "#ff2a4d",
  btnCyan: "#35e0ff",
  btnWhite: "#f4f4f8",
};
const M = {
  kickTop: [0, 0.72, 0.15] as [number, number, number],
  deckRear: [0, 0.95, -0.05] as [number, number, number],
  screenTop: [0, 1.5, 0] as [number, number, number],
  doorMount: [0, 0.66, 0.45] as [number, number, number],
  baseUnder: [0, 0, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // shellBase
  (() => {
function buildShellBase({ b, J, P, M }: Ctx) {
  const bone = J.cab;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });
    if (g) glow(p, g);
    return p;
  };

  // Kick base
  box(0.86, 0.18, 0.92, P.cabDark, 0, 0.09, -0.04);
  // recessed toe-kick shadow band on the front
  box(0.8, 0.1, 0.01, P.cabShadow, 0, 0.09, 0.425);
  // chrome toe rail
  box(0.84, 0.014, 0.012, P.chrome, 0, 0.03, 0.425);
  // base top edge T-molding
  box(0.88, 0.014, 0.94, P.trimPurple, 0, 0.187, -0.04);
  box(0.86, 0.01, 0.01, P.trimMagenta, 0, 0.176, 0.46);

  // Lower body: side panels
  for (const s of [1, -1]) {
    box(0.04, 0.54, 0.95, P.cabPurple, s * 0.41, 0.45, -0.025);
    // inner darker lining
    box(0.006, 0.5, 0.9, P.cabDark, s * 0.388, 0.45, -0.025);
    // front vertical T-molding
    box(0.05, 0.54, 0.02, P.trimPurple, s * 0.405, 0.45, 0.45);
    box(0.012, 0.54, 0.024, P.trimMagenta, s * 0.43, 0.45, 0.44);
    // pinstripes
    for (const y of [0.3, 0.6]) {
      box(0.004, 0.012, 0.9, P.trimMagenta, s * 0.432, y, -0.025, 0.5);
      box(0.004, 0.005, 0.9, P.neonCyan, s * 0.432, y - 0.014, -0.025, 0.5);
    }
    // feet
    for (const z of [-0.42, 0.36]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.02, 8), P.chrome, {
        bone,
        at: [s * 0.36, 0.01, z],
      });
    }
  }

  // Back panel
  box(0.86, 0.54, 0.03, P.cabPurple, 0, 0.45, -0.485);
  box(0.8, 0.46, 0.006, P.cabDark, 0, 0.45, -0.467);
  // vent slots on the back
  for (let i = 0; i < 5; i++) box(0.4, 0.012, 0.006, P.ink, 0, 0.3 + i * 0.04, -0.502);

  // Front wall, recessed to z 0.42 with opening framing
  box(0.86, 0.54, 0.03, P.cabPurple, 0, 0.45, 0.435);
  // top and bottom header bars of the door opening
  box(0.52, 0.03, 0.02, P.trimPurple, 0, 0.69, 0.452);
  box(0.52, 0.03, 0.02, P.trimPurple, 0, 0.2, 0.452);
  for (const s of [1, -1]) box(0.03, 0.5, 0.02, P.trimPurple, s * 0.265, 0.445, 0.452);
  // dark opening recess behind the door
  box(0.5, 0.46, 0.01, P.ink, 0, 0.445, 0.446);

  // Floor, top and interior deck seats
  box(0.8, 0.012, 0.9, P.cabShadow, 0, 0.714, -0.025);
  // top cross rail where deck lands
  box(0.86, 0.012, 0.02, P.trimMagenta, 0, 0.716, 0.456, 0.6);

  // Side art accent: small cyan stripe segments near the lower front edges
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      box(0.004, 0.02, 0.06, i % 2 ? P.neonPink : P.neonCyan, s * 0.433, 0.2 + i * 0.0, -0.4 + i * 0.07, 0.6);

  // corner screws on opening
  const r = rng(3);
  for (const s of [1, -1])
    for (const y of [0.21, 0.69]) {
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6), P.chrome, {
        bone,
        at: [s * 0.265 + (r() - 0.5) * 0.0, y, 0.464],
        dir: [0, 0, 1],
      });
    }
}
    return buildShellBase;
  })(),
  // coinDoor
  (() => {
function buildCoinDoor({ b, J, P, M }: Ctx) {
  const bone = J.coinDoor;
  const Z = 0.455; // front face of the door plate
  const cx = 0; // door centre x
  const cy = 0.44; // door centre y
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], name });
  const cyl = (rt: number, rb: number, len: number, seg: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, { bone, at: [x, y, z], dir: [0, 0, 1] });

  // ink outline lip then steel plate
  box(0.5, 0.46, 0.012, P.ink, cx, cy, 0.448);
  box(0.476, 0.436, 0.016, P.steel, cx, cy, 0.456);
  // inset darker panel bands for brushed look
  for (const dy of [-0.19, 0.19]) box(0.46, 0.006, 0.004, P.chrome, cx, cy + dy, Z + 0.01);
  for (const dx of [-0.23, 0.23]) box(0.006, 0.4, 0.004, P.chrome, cx + dx, cy, Z + 0.01);

  // corner screws
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      cyl(0.013, 0.013, 0.008, 8, P.chrome, sx * 0.21, cy + sy * 0.185, Z + 0.011);
      box(0.018, 0.003, 0.003, P.ink, sx * 0.21, cy + sy * 0.185, Z + 0.017);
    }

  // coin slots
  for (const s of [1, -1]) {
    const x = s * 0.1;
    const y = cy + 0.06;
    cyl(0.062, 0.062, 0.01, 16, P.chrome, x, y, Z + 0.011);
    cyl(0.052, 0.052, 0.014, 16, P.bezelBlack, x, y, Z + 0.013);
    cyl(0.04, 0.04, 0.016, 14, P.cream, x, y, Z + 0.014);
    // illustrated insert: ring + star-ish bars
    cyl(0.028, 0.028, 0.018, 12, s > 0 ? P.trimMagenta : P.neonCyan, x, y, Z + 0.015);
    cyl(0.018, 0.018, 0.02, 10, P.cream, x, y, Z + 0.016);
    box(0.004, 0.034, 0.004, P.ink, x, y, Z + 0.019);
    box(0.034, 0.004, 0.004, P.ink, x, y, Z + 0.019);
    // slot opening
    box(0.006, 0.05, 0.004, P.ink, x + 0.0, y + 0.0, Z + 0.021);
    // coin-return LED
    glow(cyl(0.008, 0.008, 0.01, 8, P.neonCyan, x, y - 0.082, Z + 0.012), 1.6);
    cyl(0.014, 0.014, 0.006, 8, P.chrome, x, y - 0.082, Z + 0.01);
  }

  // coin return cup bottom-centre
  box(0.13, 0.08, 0.01, P.trimMagenta, cx, cy - 0.125, Z + 0.011);
  box(0.11, 0.06, 0.012, P.chrome, cx, cy - 0.125, Z + 0.013);
  box(0.09, 0.04, 0.014, P.ink, cx, cy - 0.12, Z + 0.015);
  box(0.09, 0.012, 0.03, P.chrome, cx, cy - 0.152, Z + 0.025);
  box(0.1, 0.004, 0.032, P.trimMagenta, cx, cy - 0.16, Z + 0.025);

  // lock top-right
  cyl(0.026, 0.026, 0.01, 14, P.ink, 0.17, cy + 0.15, Z + 0.011);
  cyl(0.02, 0.02, 0.016, 14, P.chrome, 0.17, cy + 0.15, Z + 0.013);
  box(0.004, 0.018, 0.004, P.ink, 0.17, cy + 0.15, Z + 0.023);

  // small pinstripe accents and label strip
  box(0.2, 0.02, 0.004, P.ink, -0.1, cy + 0.15, Z + 0.01);
  box(0.18, 0.004, 0.004, P.neonPink, -0.1, cy + 0.15, Z + 0.013);
  box(0.12, 0.012, 0.004, P.cream, cx, cy - 0.035, Z + 0.01);
  box(0.1, 0.003, 0.004, P.ink, cx, cy - 0.035, Z + 0.013);

  // hinge barrel on left edge
  for (const dy of [-0.15, 0.15]) cyl(0.01, 0.01, 0.07, 8, P.chrome, -0.255, cy + dy, 0.452).rotation.set(0, 0, 0);
}
    return buildCoinDoor;
  })(),
  // controlDeck
  (() => {
function buildControlDeck({ b, J, P, M }: Ctx) {
  const cab = J.cab;
  const stick = J.joystick;
  // Deck surface slopes: rear (z -0.05, y 0.80) to front (z 0.55, y 0.93)
  const z0 = -0.05, z1 = 0.55, y0 = 0.8, y1 = 0.93;
  const slope = Math.atan2(y1 - y0, z1 - z0);
  const len = Math.hypot(z1 - z0, y1 - y0);
  const deckY = (z: number) => y0 + ((z - z0) / (z1 - z0)) * (y1 - y0);
  const T = 0.03; // panel thickness
  const mid = (z0 + z1) / 2;
  const rotX = -slope;

  // Support block under the deck (cabDark) so it reads as a solid body
  b.part(new THREE.BoxGeometry(0.7, 0.16, 0.5), P.cabDark, { bone: cab, at: [0, 0.8, 0.28] });
  // Angled panel
  b.part(new THREE.BoxGeometry(0.72, T, len), P.screenDeep, {
    bone: cab, at: [0, (y0 + y1) / 2 - T / 2 + 0.0, mid], rotation: [rotX * 180 / Math.PI, 0, 0],
  });
  // Side cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.2, 0.6), P.cabPurple, { bone: cab, at: [s * 0.345, 0.84, 0.25] });
  }
  // Place on deck surface helper: local deck coords (x, z) -> world at surface + lift
  const surf = (x: number, z: number, lift = 0.0): [number, number, number] => [x, deckY(z) + lift, z];
  const rotDeg = [rotX * 180 / Math.PI, 0, 0];

  const flat = (geo: THREE.BufferGeometry, color: string, x: number, z: number, lift: number, bone = cab) =>
    b.part(geo, color, { bone, at: surf(x, z, lift), rotation: rotDeg });

  // Sun artwork: stripes of half-disc low on panel
  const sunColors = [P.sunYellow, P.sunYellow, P.sunOrange, P.sunOrange, P.sunRed, P.sunRed];
  for (let i = 0; i < 6; i++) {
    const w = 0.26 - i * 0.036;
    flat(new THREE.BoxGeometry(w, 0.003, 0.03), sunColors[i], 0, 0.1 + i * 0.034, 0.003);
  }
  // Horizon lines
  flat(new THREE.BoxGeometry(0.66, 0.003, 0.008), P.trimMagenta, 0, 0.065, 0.003);
  flat(new THREE.BoxGeometry(0.66, 0.003, 0.008), P.neonCyan, 0, 0.045, 0.003);
  glow(flat(new THREE.BoxGeometry(0.66, 0.002, 0.004), P.neonCyan, 0, 0.3, 0.003), 1);
  glow(flat(new THREE.BoxGeometry(0.66, 0.002, 0.004), P.trimMagenta, 0, 0.32, 0.003), 1);

  // Joystick
  const sy = deckY(0.26);
  b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.012, 12), P.chrome, { bone: stick, at: [0, sy + 0.006, 0.26] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 10), P.ink, { bone: stick, at: [0, sy + 0.015, 0.26] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8), P.chrome, { bone: stick, at: [0, sy + 0.07, 0.26] });
  b.part(new THREE.SphereGeometry(0.032, 10, 8), P.btnRed, { bone: stick, at: [0, sy + 0.145, 0.26] });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), P.cream, { bone: stick, at: [-0.01, sy + 0.157, 0.275] });

  // Buttons: 2 sides x 6 (3x2)
  const bcols = [
    [P.btnCyan, P.btnCyan, P.btnRed],
    [P.btnCyan, P.btnRed, P.btnWhite],
  ];
  const extra = ["#ffd23c", "#ffd23c"];
  for (const s of [1, -1]) {
    let k = 0;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const x = s * (0.15 + c * 0.065);
        const z = 0.2 + r * 0.075 + (c === 1 ? 0.012 : 0);
        let col = bcols[r][c];
        if (s === 1 && r === 0 && c === 2) col = extra[0];
        if (s === -1 && r === 0 && c === 2) col = extra[1];
        k++;
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 12), P.ink, { bone: cab, at: surf(x, z, 0.004), rotation: rotDeg });
        const btn = b.part(new THREE.SphereGeometry(0.023, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), col, {
          bone: cab, at: surf(x, z, 0.008), rotation: rotDeg,
        });
        glow(btn, 0.7);
      }
    }
  }

  // Start plate behind rear edge
  const pz = 0.0;
  b.part(new THREE.BoxGeometry(0.16, 0.012, 0.06), P.chrome, { bone: cab, at: surf(0, pz, 0.006), rotation: rotDeg });
  for (const [x, col] of [[-0.035, P.btnWhite], [0.035, P.btnRed]] as [number, string][]) {
    glow(b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 12), col, { bone: cab, at: surf(x, pz, 0.014), rotation: rotDeg }), 0.8);
  }

  // Front lip T-molding
  b.part(new THREE.BoxGeometry(0.74, 0.03, 0.02), P.trimPurple, { bone: cab, at: [0, y1 - 0.015, z1 - 0.004] });
  b.part(new THREE.BoxGeometry(0.74, 0.008, 0.026), P.trimMagenta, { bone: cab, at: [0, y1 + 0.001, z1 - 0.002] });
  // Rear edge rail
  b.part(new THREE.BoxGeometry(0.72, 0.012, 0.014), P.chrome, { bone: cab, at: [0, y0 + 0.006, z0 + 0.005] });
}
    return buildControlDeck;
  })(),
  // screenBay
  (() => {
function buildScreenBay({ b, J, P }: any) {
  const bone = J.cab;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, g = 0, rx = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: [rx, 0, 0] });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (r: number, d: number, seg: number, c: string, x: number, y: number, z: number, g = 0, rx = 90) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, d, seg), c, { bone, at: [x, y, z], rotation: [rx, 0, 0] });
    if (g) glow(p, g);
    return p;
  };
  const Y0 = 0.95, Y1 = 1.5, H = Y1 - Y0, YC = (Y0 + Y1) / 2;

  // side panels, back, inner walls
  for (const s of [1, -1]) {
    box(0.04, H, 0.96, P.cabPurple, s * 0.41, YC, -0.02);
    box(0.012, H - 0.02, 0.5, P.trimPurple, s * 0.434, YC, -0.1);
    // trim front edge
    box(0.03, H, 0.02, P.trimPurple, s * 0.415, YC, 0.45);
    // side art: sunset glyph
    const ax = s * 0.432;
    const disc = b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.006, 20), P.sunRed, { bone, at: [ax, 1.22, -0.05], rotation: [0, 0, 90] });
    // grid bands
    for (let i = 0; i < 4; i++) {
      const y = 1.1 + i * 0.05;
      b.part(new THREE.BoxGeometry(0.008, 0.012, 0.36), P.neonCyan, { bone, at: [ax + s * 0.002, y, -0.05] });
    }
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.009, 0.012, 0.36), P.trimMagenta, { bone, at: [ax + s * 0.003, 1.26 + i * 0.035, -0.05] });
    }
    for (let i = -2; i <= 2; i++) {
      b.part(new THREE.BoxGeometry(0.008, 0.2, 0.008), P.neonCyan, { bone, at: [ax + s * 0.002, 1.2, -0.05 + i * 0.08] });
    }
  }
  box(0.78, H, 0.04, P.cabDark, 0, YC, -0.48);
  box(0.78, 0.04, 0.9, P.cabShadow, 0, Y0 + 0.02, -0.02);

  // bezel frame (tilted back)
  const tilt = -8, zF = 0.28;
  const bz = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, g = 0) => box(w, h, d, c, x, y, z, g, tilt);
  bz(0.78, 0.07, 0.06, P.bezelBlack, 0, 1.0, zF);
  bz(0.78, 0.06, 0.06, P.bezelBlack, 0, 1.47, zF - 0.01);
  for (const s of [1, -1]) bz(0.07, 0.5, 0.06, P.bezelBlack, s * 0.355, YC, zF - 0.005);
  // recessed glass
  bz(0.64, 0.42, 0.03, P.screenDeep, 0, 1.24, zF - 0.02);
  // picture, on glass front (z offset along tilt)
  const f = 0.0;
  const pz = zF - 0.003;
  const pic = (w: number, h: number, c: string, x: number, y: number, dz = 0, g = 0) =>
    bz(w, h, 0.004, c, x, 1.24 + y, pz + dz, g);
  // sky bands
  pic(0.62, 0.05, P.sunViolet, 0, 0.17, 0);
  // sun
  const sun = b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.004, 20), P.neonPink, { bone, at: [0, 1.26, pz + 0.004], rotation: [90 + tilt, 0, 0] });
  glow(sun, 1.4);
  for (let i = 0; i < 4; i++) pic(0.21, 0.008 + i * 0.002, i % 2 ? P.sunYellow : P.sunOrange, 0, -0.015 + i * 0.0, 0.007, 1);
  // mountains
  for (const [x, w, h] of [[-0.2, 0.16, 0.07], [0.18, 0.2, 0.09], [0.03, 0.12, 0.05]] as number[][]) {
    const m = b.part(new THREE.ConeGeometry(w / 2, h, 4), P.trimMagenta, { bone, at: [x, 1.24 + 0.0 + h / 2 - 0.02, pz + 0.006], rotation: [tilt, 45, 0] });
    m.mesh.scale.z = 0.05;
    glow(m, 0.8);
  }
  pic(0.62, 0.006, P.neonCyan, 0, -0.025, 0.008, 1.5);
  // grid floor
  for (let i = 0; i < 6; i++) pic(0.62, 0.005, P.neonCyan, 0, -0.045 - i * i * 0.0045 - i * 0.012, 0.006, 1.2);
  for (let i = -5; i <= 5; i++) {
    const p = b.part(new THREE.BoxGeometry(0.005, 0.17, 0.004), P.neonCyan, { bone, at: [i * 0.055, 1.14, pz + 0.006], rotation: [tilt, 0, i * 6] });
    glow(p, 1.2);
  }
  // scanlines
  for (let i = 0; i < 8; i++) pic(0.62, 0.003, P.cream, 0, -0.19 + i * 0.05, 0.009);
  // reflection streak
  const st = b.part(new THREE.BoxGeometry(0.03, 0.4, 0.003), P.chrome, { bone, at: [-0.18, 1.26, pz + 0.01], rotation: [tilt, 0, 25] });
  b.part(new THREE.BoxGeometry(0.012, 0.35, 0.003), P.chrome, { bone, at: [-0.12, 1.26, pz + 0.01], rotation: [tilt, 0, 25] });
  // power LED, brand plate
  glow(cyl(0.008, 0.006, 8, P.neonCyan, 0.3, 0.995, zF + 0.035, 1.5, 90 + tilt), 1.5);
  bz(0.1, 0.02, 0.004, P.ink, -0.28, 1.0, zF + 0.032);
  bz(0.06, 0.006, 0.004, P.chrome, -0.28, 1.0, zF + 0.035);
  // bezel inner lip
  bz(0.66, 0.012, 0.01, P.ink, 0, 1.455, zF + 0.025);
  bz(0.66, 0.012, 0.01, P.ink, 0, 1.03, zF + 0.025);
}
    return buildScreenBay;
  })(),
  // marqueeCrown
  (() => {
function buildMarqueeCrown({ b, J, P, M }: Ctx) {
  const bone = J.cab;
  const box = (w: number, h: number, d: number, color: string, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...opts });
  const lean = 6; // degrees back-lean of the sign
  const rot: [number, number, number] = [-lean, 0, 0];

  // Cap and body shell for the crown
  box(0.86, 0.04, 0.92, P.cabPurple, [0, 1.78, -0.04]);
  box(0.86, 0.02, 0.02, P.trimPurple, [0, 1.79, 0.42]);
  box(0.02, 0.28, 0.9, P.cabPurple, [0.42, 1.64, -0.04]);
  box(0.02, 0.28, 0.9, P.cabPurple, [-0.42, 1.64, -0.04]);
  box(0.84, 0.28, 0.02, P.cabDark, [0, 1.64, -0.49]);
  for (const s of [1, -1]) {
    box(0.03, 0.03, 0.03, P.chrome, [s * 0.43, 1.795, 0.42]);
    box(0.03, 0.03, 0.03, P.chrome, [s * 0.43, 1.795, -0.5]);
    box(0.025, 0.28, 0.02, P.trimPurple, [s * 0.43, 1.64, 0.41]);
  }

  // Sign assembly (leaning) positioned around centre
  const cy = 1.66, cz = 0.4;
  const sign = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, g = 0) => {
    const p = box(w, h, d, color, [x, cy + y * Math.cos(lean * Math.PI / 180), cz + z - y * Math.sin(lean * Math.PI / 180)], { rotation: rot });
    if (g) glow(p, g);
    return p;
  };
  // frame
  sign(0.84, 0.2, 0.03, P.bezelBlack, 0, 0, 0);
  // backlit stripes (panel 0.76 x 0.16)
  const stripes = [
    [P.sunViolet, 0.065, 0.03], [P.sunRed, 0.02, 0.03], [P.sunOrange, -0.02, 0.04], [P.sunYellow, -0.06, 0.04],
  ] as const;
  stripes.forEach(([c, y, h]) => sign(0.78, h, 0.012, c, 0, y, 0.018, 1));
  sign(0.78, 0.03, 0.012, P.sunViolet, 0, 0.085, 0.018, 1);
  // title letters: chunky blocks with ink outline
  const letters = "NEON";
  const cols = [P.neonPink, P.neonCyan, P.neonPink, P.neonCyan];
  letters.split("").forEach((_, i) => {
    const x = -0.24 + i * 0.16;
    sign(0.13, 0.12, 0.012, P.ink, x, 0.0, 0.028);
    const c = cols[i];
    if (i === 0) {
      sign(0.025, 0.1, 0.012, c, x - 0.045, 0, 0.036, 1.4);
      sign(0.025, 0.1, 0.012, c, x + 0.045, 0, 0.036, 1.4);
      sign(0.02, 0.1, 0.012, c, x, 0, 0.036, 1.4).rotation.z = 0.5;
    } else if (i === 1) {
      sign(0.025, 0.1, 0.012, c, x - 0.045, 0, 0.036, 1.4);
      for (const y of [0.04, 0, -0.04]) sign(0.085, 0.02, 0.012, c, x + 0.01, y, 0.036, 1.4);
    } else if (i === 2) {
      sign(0.1, 0.022, 0.012, c, x, 0.04, 0.036, 1.4);
      sign(0.1, 0.022, 0.012, c, x, -0.04, 0.036, 1.4);
      sign(0.025, 0.1, 0.012, c, x - 0.045, 0, 0.036, 1.4);
      sign(0.025, 0.1, 0.012, c, x + 0.045, 0, 0.036, 1.4);
    } else {
      sign(0.025, 0.1, 0.012, c, x - 0.045, 0, 0.036, 1.4);
      sign(0.025, 0.1, 0.012, c, x + 0.045, 0, 0.036, 1.4);
      sign(0.1, 0.022, 0.012, c, x, 0.04, 0.036, 1.4);
    }
  });
  // underline accent
  sign(0.7, 0.008, 0.012, P.neonCyan, 0, -0.075, 0.03, 1.4);

  // speaker grille strip
  box(0.82, 0.07, 0.04, P.bezelBlack, [0, 1.535, 0.42]);
  box(0.84, 0.012, 0.05, P.chrome, [0, 1.572, 0.42]);
  box(0.84, 0.012, 0.05, P.chrome, [0, 1.5, 0.42]);
  const holeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.006, 6);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 28; c++) {
      b.part(holeGeo, P.ink, {
        bone,
        at: [-0.369 + c * 0.0273 + (r % 2) * 0.01, 1.52 + r * 0.02, 0.442],
        dir: [0, 0, 1],
      });
    }
}
    return buildMarqueeCrown;
  })(),
  // neonEdge
  (() => {
function buildNeonEdge({ b, J, P }: any) {
  const bone = J.cab;
  const G = (part: any, s = 1.4) => glow(part, s);

  // Vertical neon tubes on the front corners
  const tubes: [number, string][] = [
    [0.445, P.neonCyan],
    [-0.445, P.trimMagenta],
  ];
  for (const [x, c] of tubes) {
    G(b.rod([x, 0.04, 0.545], [x, 1.78, 0.545], 0.014, c, { bone, sides: 8 }), 1.6);
    // clips
    for (let i = 0; i < 9; i++) {
      const y = 0.15 + i * 0.2;
      b.part(new THREE.BoxGeometry(0.03, 0.035, 0.012), P.chrome, { bone, at: [x, y, 0.545] });
      b.part(new THREE.BoxGeometry(0.012, 0.035, 0.03), P.steel, { bone, at: [x * 0.97, y, 0.53] });
    }
    // end caps
    b.part(new THREE.SphereGeometry(0.02, 8, 6), P.chrome, { bone, at: [x, 1.79, 0.545] });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), P.chrome, { bone, at: [x, 0.035, 0.545] });
  }

  // Underglow strip around the kick base
  const y = 0.012;
  const r = 0.011;
  G(b.rod([-0.45, y, 0.5], [0.45, y, 0.5], r, P.neonPink, { bone, sides: 6 }), 1.8);
  G(b.rod([-0.45, y, -0.48], [0.45, y, -0.48], r, P.neonPink, { bone, sides: 6 }), 1.8);
  G(b.rod([0.45, y, -0.48], [0.45, y, 0.5], r, P.neonPink, { bone, sides: 6 }), 1.8);
  G(b.rod([-0.45, y, -0.48], [-0.45, y, 0.5], r, P.neonPink, { bone, sides: 6 }), 1.8);
  for (const [cx, cz] of [[0.45, 0.5], [-0.45, 0.5], [0.45, -0.48], [-0.45, -0.48]])
    G(b.part(new THREE.SphereGeometry(r * 1.05, 6, 5), P.neonPink, { bone, at: [cx, y, cz] }), 1.8);

  // Floor glow pools (thin flat slabs just above floor)
  for (const [w, d, z] of [[0.9, 0.05, 0.55], [0.9, 0.05, -0.52]])
    b.part(new THREE.BoxGeometry(w, 0.002, d), P.neonPink, { bone, at: [0, 0.001, z] });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.05, 0.002, 1.0), P.neonPink, { bone, at: [s * 0.52, 0.001, 0] });

  // Cyan accent arcs at screen bay outer corners
  for (const s of [1, -1]) {
    for (const [yy, dir] of [[0.97, 1], [1.48, -1]] as [number, number][]) {
      const arcGeo = new THREE.TorusGeometry(0.06, 0.008, 6, 10, Math.PI / 2);
      G(
        b.part(arcGeo, P.neonCyan, {
          bone,
          at: [s * 0.4, yy, 0.47],
          rotation: [0, 0, s > 0 ? (dir > 0 ? 180 : 90) : dir > 0 ? 270 : 0],
        }),
        1.5,
      );
    }
  }

  // Power bulb on right side panel (right = -X)
  const bx = -0.445;
  b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.012, 10), P.chrome, {
    bone,
    at: [bx, 0.9, 0.3],
    dir: [-1, 0, 0],
  });
  G(b.part(new THREE.SphereGeometry(0.022, 8, 6), P.trimMagenta, { bone, at: [bx - 0.012, 0.9, 0.3] }), 2);
  b.part(new THREE.TorusGeometry(0.026, 0.004, 5, 10), P.ink, {
    bone,
    at: [bx - 0.004, 0.9, 0.3],
    dir: [-1, 0, 0],
    axis: "z",
  });
}
    return buildNeonEdge;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "neonHorizonCabinet" });
  const J: Record<string, Joint> = {};
  J["cab"] = b.joint("cab", { at: [0,0.85,0], dir: [0,1,0], role: "spine" });
  J["joystick"] = b.joint("joystick", { parent: J["cab"], at: [0,0.9,0.26], dir: [0,1,0], role: "hinge", group: "controls" });
  J["coinDoor"] = b.joint("coinDoor", { parent: J["cab"], at: [0,0.66,0.46], dir: [0,0,1], role: "hinge", group: "coin" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
