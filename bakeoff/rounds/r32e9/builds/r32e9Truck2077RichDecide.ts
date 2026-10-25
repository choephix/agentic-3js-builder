import * as THREE from "three";
import { createBuilder, rng, aim, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wraith-77 Armored Hauler",
  description:
    "Low-poly cyberpunk militarized 6x6 truck from 2077: armored cab with plow, olive cargo module, roof turret, missile pods, radar, neon trim and underglow.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "wraith77", paintSize: 2048 });

  // ------------------------------------------------------------------ palette
  const MAG = "#ff2a9a";
  const CYAN = "#18e3ff";
  const YEL = "#ffc21a";
  const RED = "#ff2b2b";
  const ORANGE = "#ff7a1a";
  const BLK = "#101217";
  const DARK = "#1b1e25";
  const GUN = "#2a2f38";
  const STEEL = "#6c7480";
  const TANK = "#4a5a6a";

  // armored plating paint: camo blotches, panel seams, lighting by normal, mud near the ground
  const armor = (base: string, dark: string, light: string, size: number, seed: number) =>
    paint((p, n) => {
      const t = noise(p, 0.7, seed);
      const t2 = noise(p, 0.22, seed + 4);
      let c = mix(base, dark, smoothstep(0.52, 0.6, t));
      c = mix(c, light, 0.5 * smoothstep(0.62, 0.7, t2) * smoothstep(0.2, 0.9, n.y + 0.4));
      const k = 0.78 + 0.27 * smoothstep(-0.8, 0.8, n.y);
      const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
      const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
      const sv = size * 0.7;
      const fu = (((u / size) % 1) + 1) % 1 * size;
      const fv = (((v / sv) % 1) + 1) % 1 * sv;
      if (fu < 0.012 || fv < 0.012) c = mix(c, "#06080c", 0.85);
      else if (fu < 0.024 || fv < 0.024) c = mix(c, "#9fb4c4", 0.16);
      c = mix(c, "#3b3226", 0.7 * smoothstep(0.9, 0.2, p.y) * smoothstep(0.35, 0.6, noise(p, 0.15, seed + 9)));
      return [c[0] * k, c[1] * k, c[2] * k] as const;
    });
  const ARM = armor("#34414d", "#252d36", "#4b5d68", 0.55, 1);
  const ARM2 = armor("#3b4538", "#2a3128", "#566350", 0.6, 5);
  const ARM3 = armor("#262b34", "#181b21", "#3a4350", 0.4, 8);

  const tirePaint = (cz: number) =>
    paint((p, n) => {
      const a = Math.atan2(p.y - 0.62, p.z - cz);
      const r = Math.hypot(p.y - 0.62, p.z - cz);
      if (Math.abs(n.x) < 0.6) return Math.sin(a * 14) > 0.1 ? "#2a2b31" : "#0f1013";
      if (r > 0.5 && r < 0.53) return "#3d414b";
      if (r > 0.34 && r < 0.36) return YEL;
      return p.y < 0.25 ? "#2c261c" : "#17181c";
    });

  // ------------------------------------------------------------------ textures
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#0b0e14" stroke="#18e3ff" stroke-width="4"/>
    <polygon points="50,15 82,33 82,67 50,85 18,67 18,33" fill="none" stroke="#ff2a9a" stroke-width="2.5"/>
    <path d="M28 38 L50 25 L72 38 L63 46 L50 39 L37 46Z" fill="#ffc21a"/>
    <path d="M32 52 L50 63 L68 52 L68 62 L50 76 L32 62Z" fill="#ffc21a"/>
    <circle cx="50" cy="51" r="4" fill="#ff2b2b"/></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#14151a"/>${Array.from({ length: 9 }, (_, i) => `<polygon points="${i * 8 - 8},16 ${i * 8},16 ${i * 8 + 8},0 ${i * 8},0" fill="#ffc21a"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 60 20"><rect width="60" height="20" fill="#0a0c10"/>${Array.from({ length: 6 }, (_, i) => `<rect x="3" y="${2 + i * 3}" width="54" height="1.4" fill="#18e3ff"/>`).join("")}<polygon points="30,4 34,10 30,16 26,10" fill="#ff2b2b"/></svg>`,
    { size: 256 },
  );
  const GLASS = svg(
    `<svg viewBox="0 0 100 50"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3a4a"/><stop offset="1" stop-color="#05121a"/></linearGradient></defs>
    <rect width="100" height="50" fill="url(#g)"/><polygon points="10,0 24,0 8,50 0,50" fill="#18e3ff" opacity="0.25"/><polygon points="40,0 48,0 32,50 24,50" fill="#18e3ff" opacity="0.15"/>
    <path d="M10 42 H90 M10 38 H40 M60 38 H90" stroke="#3dff9a" stroke-width="1" opacity="0.8"/><circle cx="50" cy="40" r="5" fill="none" stroke="#3dff9a" stroke-width="1"/></svg>`,
    { size: 256 },
  );
  const HUB = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#22252d" stroke="#18e3ff" stroke-width="3"/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#6c7480" stroke-width="2"/>
    ${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<circle cx="${50 + 26 * Math.cos(a)}" cy="${50 + 26 * Math.sin(a)}" r="4" fill="#ffc21a" stroke="#0a0a0a" stroke-width="1.5"/>`; }).join("")}
    <circle cx="50" cy="50" r="12" fill="#101217" stroke="#ff2a9a" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );
  const STRIP = svg(
    `<svg viewBox="0 0 120 24"><rect width="120" height="24" fill="#0b0e14" stroke="#ffc21a" stroke-width="2"/><text x="60" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#ffc21a">WRAITH//77-HVY</text></svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#e8e6d8" stroke="#101217" stroke-width="3"/><rect x="0" y="0" width="100" height="9" fill="#18a0ff"/><text x="50" y="33" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#101217">NX-2077</text></svg>`,
    { size: 256 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#04141a"/><path d="M4 30 L16 20 L26 26 L40 8 L52 22 L64 14 L76 24" stroke="#18e3ff" stroke-width="2" fill="none"/>
    <rect x="4" y="4" width="22" height="4" fill="#ff2a9a"/><rect x="4" y="34" width="40" height="2" fill="#3dff9a"/><circle cx="68" cy="8" r="3" fill="#ff2b2b"/></svg>`,
    { size: 256 },
  );
  const NEON = svg(
    `<svg viewBox="0 0 120 40"><rect x="2" y="2" width="116" height="36" rx="4" fill="#12040e" stroke="#ff2a9a" stroke-width="3"/>
    <text x="60" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#ff7ad0" stroke="#ff2a9a" stroke-width="0.8">2077</text></svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------ helpers
  const box = (sx: number, sy: number, sz: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), c, { at: [x, y, z], ...o });
  const cyl = (r: number, h: number, c: any, at: V, dir: V, seg = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at, dir, flat: true, ...o });
  const ball = (r: number, c: any, at: V) => b.part(new THREE.SphereGeometry(r, 8, 6), c, { at, flat: true });
  const decal = (tex: any, w: number, h: number, at: V, dir: V, c = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), c, { at, dir, axis: "z", texture: tex });
  const lit = (p: any, k = 1) => glow(p, k);
  const sides = [1, -1];
  const AXLES = [2.4, -1.6, -2.9];

  // ------------------------------------------------------------------ chassis
  for (const s of sides) box(0.2, 0.3, 7.1, DARK, s * 0.6, 1.0, -0.1);
  for (const z of [-3.3, -2.2, -0.6, 0.8, 1.9, 3.0]) box(1.4, 0.18, 0.14, GUN, 0, 0.98, z);
  box(1.3, 0.12, 6.2, ARM3, 0, 0.84, 0.0);
  cyl(0.05, 5.4, STEEL, [0, 0.72, -0.2], [0, 0, 1], 8);

  for (const z of AXLES) {
    cyl(0.08, 2.4, DARK, [0, 0.62, z], [1, 0, 0], 8);
    ball(0.25, STEEL, [0, 0.62, z]);
    for (const s of sides) {
      box(0.12, 0.07, 1.0, "#3a3f48", s * 0.65, 0.82, z);
      cyl(0.04, 0.55, YEL, [s * 0.85, 0.95, z + 0.22], [0, 1, 0.3], 6);
      cyl(0.05, 0.18, STEEL, [s * 0.85, 0.7, z + 0.1], [0, 1, 0.3], 6);
    }
  }

  // ------------------------------------------------------------------ wheels
  for (const z of AXLES) {
    const tp = tirePaint(z);
    for (const s of sides) {
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 14), tp, { at: [s * 1.15, 0.62, z], dir: [1, 0, 0], flat: true });
      decal(HUB, 0.8, 0.8, [s * 1.41, 0.62, z], [s, 0, 0]);
      lit(cyl(0.15, 0.08, CYAN, [s * 1.44, 0.62, z], [1, 0, 0], 8), 1.2);
    }
  }
  // fenders + mud plates over wheels
  const fenders: [number, number][] = [[2.4, 1.6], [-2.25, 2.7]];
  for (const [fz, fl] of fenders)
    for (const s of sides) {
      box(0.78, 0.1, fl, ARM3, s * 1.18, 1.38, fz);
      box(0.08, 0.42, fl, ARM, s * 1.55, 1.2, fz);
      box(0.78, 0.07, fl + 0.08, YEL, s * 1.18, 1.43, fz, { color: YEL });
      lit(box(0.03, 0.04, fl - 0.2, CYAN, s * 1.6, 1.35, fz));
    }

  // ------------------------------------------------------------------ cab
  const cabOutline: [number, number][] = [
    [1.0, 1.35], [3.5, 1.35], [3.55, 1.75], [2.95, 2.0], [2.3, 2.8], [1.0, 2.8],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, bevel: 0.05, color: ARM });
  box(2.1, 0.1, 1.45, ARM3, 0, 2.84, 1.65);
  // windshield
  decal(GLASS, 1.8, 0.92, [0, 2.42, 2.65], [0, 0.63, 0.78]);
  glow(b.part(new THREE.PlaneGeometry(1.8, 0.92), "#ffffff", { at: [0, 2.43, 2.66], dir: [0, 0.63, 0.78], axis: "z", texture: GLASS }), 0.5);
  for (const k of [-0.32, 0, 0.32]) {
    box(1.9, 0.045, 0.045, BLK, 0, 2.4 + k * 0.8 + 0.045, 2.625 - k * 0.65 + 0.04, { rotation: [-39, 0, 0] });
  }
  for (const s of sides) {
    box(0.06, 0.95, 0.06, BLK, s * 0.92, 2.4, 2.65, { rotation: [-39, 0, 0] });
    // side window
    box(0.03, 0.62, 1.04, BLK, s * 1.01, 2.45, 1.9);
    glow(b.part(new THREE.PlaneGeometry(0.96, 0.56), "#ffffff", { at: [s * 1.03, 2.45, 1.9], dir: [s, 0, 0], axis: "z", texture: GLASS }), 0.45);
    // door
    box(0.04, 1.2, 0.03, BLK, s * 1.02, 1.95, 1.2);
    box(0.04, 1.2, 0.03, BLK, s * 1.02, 1.95, 2.55);
    box(0.06, 0.07, 0.3, STEEL, s * 1.03, 1.95, 2.35);
    box(0.08, 0.5, 1.2, ARM3, s * 1.02, 1.62, 1.88);
    decal(EMBLEM, 0.4, 0.4, [s * 1.065, 1.75, 1.85], [s, 0, 0]);
    // mirrors
    box(0.3, 0.05, 0.05, DARK, s * 1.15, 2.3, 2.5);
    box(0.06, 0.3, 0.2, ARM3, s * 1.32, 2.3, 2.5);
    lit(ball(0.03, CYAN, [s * 1.36, 2.35, 2.58]));
    // exhaust stacks
    cyl(0.1, 1.8, GUN, [s * 1.14, 2.3, 1.12], [0, 1, 0], 8);
    cyl(0.13, 0.1, BLK, [s * 1.14, 3.2, 1.12], [0, 1, 0], 8);
    lit(cyl(0.107, 0.06, ORANGE, [s * 1.14, 2.9, 1.12], [0, 1, 0], 8), 1.4);
    lit(cyl(0.107, 0.04, ORANGE, [s * 1.14, 2.6, 1.12], [0, 1, 0], 8), 1.2);
    box(0.06, 0.1, 0.24, STEEL, s * 1.07, 2.0, 1.06);
    box(0.06, 0.1, 0.24, STEEL, s * 1.07, 2.7, 1.06);
    // headlights, fog lights
    lit(box(0.42, 0.12, 0.08, "#e8fcff", s * 0.74, 1.56, 3.55), 1.5);
    lit(box(0.18, 0.08, 0.08, YEL, s * 0.98, 1.5, 3.53));
    box(0.5, 0.04, 0.1, BLK, s * 0.74, 1.67, 3.55);
    // side armor spikes on bumper
    b.spike([s * 1.18, 1.0, 3.7], [0, 0, 1], 0.28, 0.07, { color: GUN });
    // front tow hooks
    box(0.08, 0.12, 0.3, YEL, s * 0.6, 0.75, 3.85);
  }
  // grille
  decal(GRILLE, 0.9, 0.3, [0, 1.55, 3.575], [0, 0, 1]);
  // hood vents
  for (const x of [-0.55, 0.55])
    for (const z of [3.28, 3.02]) {
      const y = 1.75 + (3.55 - z) * 0.4167 + 0.02;
      box(0.6, 0.03, 0.14, BLK, x, y, z, { rotation: [22.6, 0, 0] });
      lit(box(0.5, 0.02, 0.03, CYAN, x, y + 0.012, z + 0.01, { rotation: [22.6, 0, 0] }), 0.9);
    }
  // bumper + plow
  box(2.5, 0.4, 0.35, "#ffffff", 0, 1.0, 3.62, { texture: WARN });
  box(2.4, 0.12, 0.3, GUN, 0, 1.28, 3.62);
  b.extrude([[3.6, 0.5], [4.1, 0.42], [3.95, 1.1], [3.6, 1.1]], {
    at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.03, color: ARM3,
  });
  lit(box(2.0, 0.04, 0.04, MAG, 0, 0.5, 4.08), 1.3);
  // cab roof gear
  const lbCols = [CYAN, MAG, CYAN, MAG, CYAN, MAG, CYAN];
  lbCols.forEach((c, i) => lit(box(0.22, 0.1, 0.16, c, -0.7 + i * 0.233, 2.93, 2.1), 1.4));
  box(1.8, 0.06, 0.2, BLK, 0, 2.89, 2.1);
  for (const s of sides) {
    cyl(0.01, 1.5, DARK, [s * 0.85, 3.55, 1.1], [0, 1, 0], 4);
    lit(ball(0.03, s > 0 ? RED : CYAN, [s * 0.85, 4.3, 1.1]), 1.5);
    cyl(0.06, 0.1, STEEL, [s * 0.85, 2.9, 1.1], [0, 1, 0], 6);
    box(0.5, 0.08, 0.5, ARM3, s * 0.5, 2.92, 1.45);
    // searchlights
    box(0.2, 0.2, 0.22, GUN, s * 0.55, 3.0, 1.9);
    lit(cyl(0.08, 0.03, "#fff6c8", [s * 0.55, 3.0, 2.02], [0, 0, 1], 8), 1.6);
  }
  box(0.12, 0.2, 0.12, DARK, 0, 3.02, 1.7);
  ball(0.2, GUN, [0, 3.0, 1.55]);
  lit(cyl(0.05, 0.05, CYAN, [0, 3.0, 1.74], [0, 0, 1], 8), 1.5);
  // roof banner
  glow(b.part(new THREE.BoxGeometry(1.5, 0.5, 0.06), "#ffffff", { at: [0, 3.15, 0.62], texture: NEON }), 1.4);
  for (const s of sides) box(0.05, 0.4, 0.06, DARK, s * 0.7, 2.95, 0.62);

  // ------------------------------------------------------------------ cargo module
  const CZ = -1.325, CL = 4.35;
  box(2.5, 1.35, CL, ARM2, 0, 2.03, CZ);
  box(2.4, 0.06, CL - 0.1, ARM3, 0, 2.74, CZ);
  for (const s of sides) {
    box(0.34, 0.34, CL, ARM2, s * 1.2, 2.68, CZ, { rotation: [0, 0, 45] });
    box(0.34, 0.34, CL, ARM2, s * 1.2, 1.4, CZ, { rotation: [0, 0, 45] });
    for (let i = 0; i < 6; i++) box(0.07, 1.2, 0.12, GUN, s * 1.27, 2.03, -3.35 + i * 0.7);
    box(0.06, 0.1, CL - 0.3, YEL, s * 1.27, 1.55, CZ);
    lit(box(0.03, 0.04, CL - 0.5, CYAN, s * 1.285, 1.48, CZ), 1.2);
    decal(EMBLEM, 1.3, 1.3, [s * 1.32, 2.17, -1.25], [s, 0, 0]);
    glow(b.part(new THREE.PlaneGeometry(0.8, 0.4), "#ffffff", { at: [s * 1.32, 1.82, -2.75], dir: [s, 0, 0], axis: "z", texture: SCREEN }), 1.1);
    decal(STRIP, 1.2, 0.24, [s * 1.32, 2.55, -2.7], [s, 0, 0]);
    // vent fans
    for (const z of [-0.2, -3.2]) {
      cyl(0.17, 0.05, BLK, [s * 1.29, 2.1, z], [1, 0, 0], 10);
      for (let k = 0; k < 3; k++)
        box(0.02, 0.3, 0.03, STEEL, s * 1.32, 2.1, z, { rotation: [k * 60, 0, 0] });
    }
    // corner castings
    for (const z of [0.78, -3.43]) {
      box(0.22, 0.22, 0.22, GUN, s * 1.2, 1.42, z);
      box(0.22, 0.22, 0.22, GUN, s * 1.2, 2.72, z);
    }
    // fuel tanks + cage
    cyl(0.28, 1.5, TANK, [s * 0.88, 0.78, 0.0], [0, 0, 1], 10);
    for (const z of [-0.5, 0.5]) cyl(0.3, 0.06, YEL, [s * 0.88, 0.78, z], [0, 0, 1], 10);
    lit(box(0.04, 0.04, 2.2, MAG, s * 0.5, 0.7, 0.2), 1.4);
    // roof tool boxes
    box(0.5, 0.25, 0.9, GUN, s * 0.9, 2.9, -0.25);
    box(0.52, 0.04, 0.5, ORANGE, s * 0.9, 3.03, -0.25);
  }
  // roof rails & hatches
  for (const z of [-3.2, -1.9, -1.0]) box(2.2, 0.05, 0.05, BLK, 0, 2.8, z);
  cyl(0.28, 0.06, GUN, [0, 2.8, -2.3], [0, 1, 0], 8);
  cyl(0.06, 0.12, YEL, [0, 2.86, -2.3], [0, 1, 0], 6);
  // rear door
  box(2.2, 1.2, 0.08, ARM3, 0, 1.95, -3.53);
  decal(PLATE, 0.7, 0.28, [0, 1.35, -3.575], [0, 0, -1]);
  decal(EMBLEM, 0.7, 0.7, [0, 2.1, -3.575], [0, 0, -1]);
  for (const s of sides) {
    lit(box(0.34, 0.2, 0.06, RED, s * 0.95, 1.6, -3.58), 1.6);
    box(0.08, 1.1, 0.12, STEEL, s * 0.55, 1.95, -3.6);
    lit(box(0.34, 0.08, 0.06, ORANGE, s * 0.95, 1.38, -3.58), 1.2);
  }
  box(2.7, 0.3, 0.3, "#ffffff", 0, 1.1, -3.72, { texture: WARN });
  box(0.3, 0.14, 0.4, STEEL, 0, 1.0, -3.95);
  cyl(0.07, 0.3, STEEL, [0, 1.0, -4.05], [0, 0, 1], 6);

  // ------------------------------------------------------------------ turret
  cyl(0.6, 0.12, GUN, [0, 2.84, -0.8], [0, 1, 0], 12);
  cyl(0.5, 0.06, YEL, [0, 2.92, -0.8], [0, 1, 0], 12);
  box(1.0, 0.42, 1.1, ARM3, 0, 3.15, -0.8);
  b.extrude([[-0.5, 0], [0.5, 0], [0.4, 0.28], [-0.4, 0.28]], { at: [0, 3.36, -0.8], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, color: ARM3 });
  box(0.9, 0.06, 0.9, ARM, 0, 3.4, -0.85);
  for (const s of sides) {
    box(0.1, 0.34, 0.8, ARM, s * 0.55, 3.15, -0.8, { rotation: [0, s * 10, 0] });
    cyl(0.1, 1.0, DARK, [s * 0.22, 3.12, -0.1], [0, 0, 1], 8);
    cyl(0.05, 1.7, STEEL, [s * 0.22, 3.12, -0.15], [0, 0, 1], 8);
    box(0.14, 0.14, 0.2, BLK, s * 0.22, 3.12, 0.78);
    lit(box(0.05, 0.05, 0.03, ORANGE, s * 0.22, 3.12, 0.89), 1.5);
    box(0.28, 0.32, 0.4, YEL, s * 0.75, 3.1, -0.9);
    for (let k = 0; k < 3; k++) lit(box(0.02, 0.04, 0.1, MAG, s * 0.9, 3.0 + k * 0.1, -0.9), 1.0);
  }
  box(0.2, 0.2, 0.4, DARK, 0, 3.12, -0.5);
  // sensor ball + lidar
  cyl(0.12, 0.2, GUN, [0, 3.55, -1.0], [0, 1, 0], 8);
  ball(0.2, BLK, [0, 3.72, -1.0]);
  lit(ball(0.08, CYAN, [0, 3.74, -0.82]), 1.8);
  lit(cyl(0.21, 0.03, MAG, [0, 3.72, -1.0], [0, 1, 0], 10), 1.2);

  // ------------------------------------------------------------------ missile pods
  const pd = new THREE.Vector3(0, 0.55, 0.83).normalize();
  const q = aim(pd, undefined, "z");
  for (const s of sides) {
    const c = new THREE.Vector3(s * 0.8, 3.1, -2.7);
    box(0.4, 0.4, 0.8, GUN, s * 0.8, 2.9, -2.8);
    b.part(new THREE.BoxGeometry(0.55, 0.6, 0.95), ARM3, { at: c.toArray() as V, quat: q });
    for (const lx of [-0.13, 0.13])
      for (const ly of [-0.17, 0, 0.17]) {
        const tp = new THREE.Vector3(lx, ly, 0.47).applyQuaternion(q).add(c);
        b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 8), BLK, { at: tp.toArray() as V, dir: pd.toArray() as V, flat: true });
        const wp = new THREE.Vector3(lx, ly, 0.5).applyQuaternion(q).add(c);
        lit(b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 6), s > 0 ? ORANGE : RED, { at: wp.toArray() as V, dir: pd.toArray() as V, flat: true }), 1.2);
      }
    const stripe = new THREE.Vector3(0.28, 0, 0).applyQuaternion(q).add(c);
    box(0.02, 0.4, 0.6, YEL, stripe.x * (s > 0 ? 1 : 1), stripe.y, stripe.z, { quat: q });
  }

  // ------------------------------------------------------------------ radar + antennas
  cyl(0.06, 0.8, DARK, [0, 3.2, -3.1], [0, 1, 0], 6);
  box(0.4, 0.1, 0.4, GUN, 0, 2.82, -3.1);
  const rd = [0, 0.8, 0.6] as V;
  b.lathe([[0, 0], [0.34, 0.14], [0.37, 0.14], [0.04, 0.03]], {
    at: [0, 3.65, -3.1], axis: rd, segments: 12, color: STEEL,
  });
  b.rod([0, 3.65, -3.1], [0, 3.9, -2.93], 0.015, DARK);
  lit(ball(0.04, RED, [0, 3.95, -2.9]), 1.5);
  for (const s of sides) {
    cyl(0.012, 1.7, DARK, [s * 1.15, 3.5, -3.3], [0, 1, 0], 4);
    lit(ball(0.035, s > 0 ? MAG : CYAN, [s * 1.15, 4.36, -3.3]), 1.6);
    cyl(0.012, 1.2, DARK, [s * 1.05, 3.3, -1.7], [s * 0.1, 1, 0], 4);
  }

  // ------------------------------------------------------------------ underglow & greebles
  for (const s of sides) lit(box(0.05, 0.04, 6.0, MAG, s * 0.35, 0.78, -0.2), 1.5);
  const r = rng(7);
  for (let i = 0; i < 14; i++) {
    const x = (r() - 0.5) * 2.0;
    const z = -3.3 + r() * 4.2;
    box(0.1 + r() * 0.12, 0.05, 0.1 + r() * 0.12, i % 3 ? GUN : YEL, x, 2.79, z);
  }

  // hatch details on cab roof
  for (let i = 0; i < 3; i++) lit(box(0.12, 0.03, 0.12, i === 1 ? RED : CYAN, -0.3 + i * 0.3, 2.9, 1.3), 1.2);

  return b.root;
}
