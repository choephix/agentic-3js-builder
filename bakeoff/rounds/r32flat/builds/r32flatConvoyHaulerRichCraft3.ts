import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured 8-wheel convoy hauler with a gun turret, neon trim and a sealed octagonal cargo pod.",
};

// ---------------------------------------------------------------- palette
const MAG = "#ff2d95";
const CYAN = "#2ef2ff";
const AMBER = "#ffb02e";
const RED = "#ff2a2a";
const ARM = "#303747";
const ARM2 = "#222735";
const FRAME = "#1b1e27";
const STEEL = "#8a94ac";
const TIRE = "#14161c";

// ---------------------------------------------------------------- paints
const hull = (a: string, c: string, seed: number) =>
  paint((p, n) => {
    let col = mix(a, c, noise(p, 0.7, seed));
    col = mix(col, "#8896b8", 0.16 * smoothstep(0.1, 0.95, n.y));
    col = mix(col, "#0b0c11", 0.55 * smoothstep(1.4, 0.35, p.y));
    const f = (((p.z / 0.85) % 1) + 1) % 1;
    if (f < 0.018 && Math.abs(n.x) > 0.5) col = mix(col, "#0b0c11", 0.8);
    const g = (((p.y / 0.6) % 1) + 1) % 1;
    if (g < 0.014 && Math.abs(n.x) > 0.5) col = mix(col, "#0b0c11", 0.7);
    if (noise(p, 0.05, seed + 4) > 0.8) col = mix(col, "#0b0c11", 0.4);
    return col;
  });
const CABP = hull("#2a3246", "#3a4663", 3);
const PODP = hull("#414a62", "#566280", 8);
const TANKP = paint((p, n) => {
  let col = mix("#7c869e", "#a7b1c8", noise(p, 0.3, 2));
  col = mix(col, "#2a2d36", 0.45 * smoothstep(0.1, -0.9, n.y));
  return col;
});
const PLATE = paint((p, n, s) => {
  const [u, v] = s;
  let col = mix("#505a74", "#3d465c", noise(p, 0.5, 5));
  const e = Math.min(u, 1 - u, v, 1 - v);
  if (e < 0.06) col = mix(col, "#1a1d27", 0.75);
  else if (e < 0.1) col = mix(col, "#9aa6c4", 0.25);
  for (const [ru, rv] of [[0.14, 0.14], [0.86, 0.14], [0.14, 0.86], [0.86, 0.86]])
    if (Math.hypot(u - ru, v - rv) < 0.035) col = "#b4bed6" as any;
  col = typeof col === "string" ? col : mix(col, "#0b0c11", 0.4 * smoothstep(2.6, 1.9, p.y) * (1 - Math.abs(n.y)));
  return col;
});
const RIM = paint((p) => mix("#4d566c", "#6d7892", noise(p, 0.15, 6)));

// ---------------------------------------------------------------- textures
const hazardSvg = () => {
  let d = "";
  for (let i = -2; i < 12; i++)
    d += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="#ffc400"/>`;
  return `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#15161b"/>${d}<rect x="1" y="1" width="62" height="14" fill="none" stroke="#15161b" stroke-width="2"/></svg>`;
};
const HAZARD = svg(hazardSvg(), { size: 256 });

const grilleSvg = () => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const c = i % 3 === 1 ? MAG : CYAN;
    const h = i % 2 ? 24 : 30;
    d += `<rect x="${9 + i * 11.5}" y="${20 - h / 2}" width="6" height="${h}" fill="${c}"/>`;
  }
  return `<svg viewBox="0 0 128 40" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="40" fill="#07080d"/><rect x="2" y="2" width="124" height="36" fill="none" stroke="#2a3040" stroke-width="3"/>${d}</svg>`;
};
const GRILLE = svg(grilleSvg(), { size: 256 });

const WIND = svg(
  `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d4468"/><stop offset="1" stop-color="#060a16"/></linearGradient></defs>
  <rect width="128" height="48" fill="url(#g)"/>
  <polygon points="22,0 46,0 26,48 2,48" fill="#a4ecff" opacity="0.14"/>
  <polygon points="62,0 72,0 52,48 42,48" fill="#a4ecff" opacity="0.1"/>
  <path d="M6 38 H122" stroke="#2ef2ff" stroke-width="1.5" opacity="0.7"/>
  <text x="10" y="45" font-family="monospace" font-size="6" fill="#2ef2ff">SPD 084 // LINK OK // C-07</text>
  <path d="M96 10 l8 0 l4 6 l-8 0 z" fill="none" stroke="#ff2d95" stroke-width="1.5"/>
  <rect x="1.5" y="1.5" width="125" height="45" fill="none" stroke="#0b0d12" stroke-width="4"/></svg>`,
  { size: 384 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 48 36" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a3d5e"/><stop offset="1" stop-color="#070b16"/></linearGradient></defs>
  <rect width="48" height="36" fill="url(#g)"/>
  <polygon points="8,0 18,0 8,36 0,36" fill="#a4ecff" opacity="0.15"/>
  <rect x="1" y="1" width="46" height="34" fill="none" stroke="#0b0d12" stroke-width="3"/></svg>`,
  { size: 128 },
);

const REARDOOR = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#262c3c"/>
  <polygon points="38,4 90,4 124,38 124,90 90,124 38,124 4,90 4,38" fill="#171b26" stroke="#0b0d12" stroke-width="4"/>
  ${[0, 1, 2, 3, 4, 5].map((k) => `<circle cx="${64 + 44 * Math.cos((k * Math.PI) / 3)}" cy="${60 + 44 * Math.sin((k * Math.PI) / 3)}" r="6" fill="#8a94ac" stroke="#0b0d12" stroke-width="2"/>`).join("")}
  <circle cx="64" cy="60" r="28" fill="#10131b" stroke="#8a94ac" stroke-width="4"/>
  <rect x="14" y="100" width="100" height="10" fill="#ffc400"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<polygon points="${14 + k * 12},110 ${20 + k * 12},110 ${26 + k * 12},100 ${20 + k * 12},100" fill="#15161b"/>`).join("")}
  <text x="64" y="121" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#ffc400">SEALED</text></svg>`,
  { size: 256 },
);
const REARGLOW = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="60" r="20" fill="none" stroke="#ff2d95" stroke-width="4"/>
  <polygon points="64,44 78,52 78,68 64,76 50,68 50,52" fill="none" stroke="#2ef2ff" stroke-width="3"/>
  <circle cx="64" cy="60" r="5" fill="#2ef2ff"/>
  ${[0, 1, 2, 3, 4, 5].map((k) => `<circle cx="${64 + 44 * Math.cos((k * Math.PI) / 3)}" cy="${60 + 44 * Math.sin((k * Math.PI) / 3)}" r="2.6" fill="#2ef2ff"/>`).join("")}
  </svg>`,
  { size: 256 },
);

const LABEL = svg(
  `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="124" height="92" rx="5" fill="#181b24" stroke="#ffc400" stroke-width="4"/>
  <g fill="none" stroke="#ffc400" stroke-width="4">
   <circle cx="34" cy="34" r="11"/><circle cx="23" cy="53" r="11"/><circle cx="45" cy="53" r="11"/></g>
  <circle cx="34" cy="46" r="5" fill="#ffc400"/>
  <text x="72" y="34" font-family="monospace" font-weight="bold" font-size="15" fill="#ffc400">SEALED</text>
  <text x="72" y="50" font-family="monospace" font-weight="bold" font-size="11" fill="#2ef2ff">CORE-07</text>
  <text x="14" y="76" font-family="monospace" font-size="8" fill="#ff2d95">DO NOT OPEN</text>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => `<rect x="${64 + k * 4.5}" y="64" width="${k % 3 === 0 ? 3 : 1.8}" height="22" fill="#e9e3d0"/>`).join("")}
  </svg>`,
  { size: 384 },
);
const DOORTAG = svg(
  `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="62" height="22" rx="3" fill="#080a10" stroke="#2ef2ff" stroke-width="2"/>
  <text x="32" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#2ef2ff">C-07</text>
  <rect x="6" y="19" width="12" height="2" fill="#ff2d95"/></svg>`,
  { size: 192 },
);
const TAIL = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#1c0406"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${3 + i * 8.6}" y="2" width="5" height="12" fill="#ff2a2a"/>`).join("")}</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  const chassis = b.joint("chassis", { at: [0, 0.7, -0.3] });

  const put = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (r: number, h: number, seg: number, c: any, at: number[], dir: number[], o: any = {}) =>
    put(new THREE.CylinderGeometry(r, r, h, seg), c, at, { dir, ...o });
  const neon = (w: number, h: number, d: number, c: string, at: number[], o: any = {}, k = 1.5) =>
    glow(box(w, h, d, c, at, o), k);
  const decal = (w: number, h: number, tex: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o });
  const rod = (a: number[], c: number[], r: number, col: any, o: any = {}) =>
    b.rod(a, c, r, col, { bone: chassis, sides: 6, smooth: false, ...o });
  const oct = (a: number): [number, number][] => {
    const R = a / Math.cos(Math.PI / 8);
    return Array.from({ length: 8 }, (_, k) => {
      const t = Math.PI / 8 + (k * Math.PI) / 4;
      return [R * Math.cos(t), R * Math.sin(t)] as [number, number];
    });
  };

  // ---- frame, deck, axles
  box(2.2, 0.4, 9.2, FRAME, [0, 0.7, -0.25]);
  box(2.6, 0.12, 6.85, ARM2, [0, 0.96, -1.425]);
  for (const s of [1, -1]) neon(0.05, 0.06, 7.2, MAG, [s * 1.12, 0.5, -0.9], {}, 1.6);
  const AX = [3.3, 1.9, -2.3, -3.7];
  for (const z of AX) {
    rod([-1.65, 0.7, z], [1.65, 0.7, z], 0.13, "#2a2e38");
    box(0.5, 0.4, 0.4, "#2a2e38", [0, 0.7, z]);
  }

  // ---- wheels (spin joints)
  for (const s of [1, -1]) {
    AX.forEach((z, i) => {
      const side = s > 0 ? "L" : "R";
      const x = s * 1.65;
      const w = b.joint(`wheel${side}${i + 1}`, { parent: chassis, at: [x, 0.7, z], dir: [s, 0, 0] });
      const P = (g: THREE.BufferGeometry, c: any, dx: number, o: any = {}) =>
        b.part(g, c, { bone: w, at: [x + s * dx, 0.7, z], dir: [s, 0, 0], flat: true, ...o });
      const C = (r: number, h: number, seg: number) => new THREE.CylinderGeometry(r, r, h, seg);
      P(C(0.7, 0.55, 10), TIRE, 0);
      P(C(0.62, 0.57, 10), "#242832", 0);
      P(C(0.45, 0.59, 10), RIM, 0);
      glow(P(C(0.3, 0.06, 10), CYAN, 0.29), 1.4);
      P(C(0.12, 0.1, 8), "#20232c", 0.32);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(C(0.032, 0.07, 6), "#aab4cc", {
          bone: w,
          at: [x + s * 0.31, 0.7 + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2],
          dir: [s, 0, 0],
          flat: true,
        });
      }
    });
  }
  // fenders and flaps
  for (const s of [1, -1])
    for (const z of AX) {
      box(0.8, 0.1, 1.38, ARM, [s * 1.65, 1.5, z]);
      box(0.1, 0.34, 1.38, ARM, [s * 2.0, 1.34, z]);
      neon(0.04, 0.04, 1.38, MAG, [s * 2.02, 1.53, z], {}, 1.6);
    }
  for (const s of [1, -1]) box(0.6, 0.45, 0.04, "#101217", [s * 1.65, 0.5, -4.5]);

  // ---- fuel tanks
  for (const s of [1, -1]) {
    put(new THREE.CapsuleGeometry(0.3, 1.8, 2, 8), TANKP, [s * 1.55, 0.82, -0.3], { dir: [0, 0, 1] });
    for (const z of [-0.9, -0.3, 0.3]) {
      cyl(0.32, 0.08, 8, "#1b1e27", [s * 1.55, 0.82, z], [0, 0, 1]);
      box(0.5, 0.1, 0.14, ARM2, [s * 1.3, 1.02, z]);
    }
  }

  // ---- cab
  const CAB: [number, number][] = [
    [2.0, 0.9], [4.35, 0.9], [4.45, 1.7], [3.95, 2.05], [3.3, 2.05], [3.1, 2.95], [2.05, 3.0], [2.0, 2.9],
  ];
  b.extrude(CAB, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, color: CABP, bone: chassis });
  box(2.7, 0.12, 1.15, ARM, [0, 3.04, 2.55]);
  box(2.7, 0.07, 0.5, ARM, [0, 3.0, 3.25]);
  // windshield, grille, headlights
  decal(2.3, 0.9, WIND, [0, 2.5 + 0.003, 3.2 + 0.012], [0, 0, 1], { rotation: [-12, 0, 0] });
  glow(decal(1.4, 0.6, GRILLE, [0, 1.3, 4.412], [0, 0, 1], { rotation: [7, 0, 0] }), 1.3);
  for (const s of [1, -1]) {
    neon(0.5, 0.24, 0.1, "#e8fbff", [s * 1.0, 1.62, 4.46], { rotation: [7, 0, 0] }, 1.8);
    box(0.6, 0.06, 0.14, FRAME, [s * 1.0, 1.78, 4.42]);
    // hood vents
  }
  for (const z of [3.45, 3.6, 3.75]) neon(1.5, 0.03, 0.06, MAG, [0, 2.06, z], {}, 1.4);
  // bumper
  b.extrude(
    [[-1.7, 0], [1.7, 0], [1.7, 0.25], [1.25, 0.58], [-1.25, 0.58], [-1.7, 0.25]],
    { at: [0, 0.85, 4.25], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.55, color: ARM, bone: chassis },
  );
  decal(2.3, 0.4, HAZARD, [0, 0.85, 4.835], [0, 0, 1]);
  for (const s of [1, -1]) {
    neon(0.2, 0.18, 0.1, AMBER, [s * 1.5, 0.85, 4.52], { rotation: [0, s * 35, 0] }, 1.6);
    box(0.1, 0.5, 0.1, FRAME, [s * 0.5, 1.1, 4.8]);
  }
  // side armour plates, windows, tags
  for (const s of [1, -1]) {
    b.extrude([[2.15, 1.1], [3.85, 1.1], [3.7, 1.75], [2.15, 1.78]], {
      at: [s * 1.34, 0, 0], x: [0, 0, 1], thickness: 0.08, color: ARM, bone: chassis,
    });
    neon(0.04, 0.04, 1.6, MAG, [s * 1.39, 1.78, 2.95], {}, 1.6);
    decal(0.9, 0.34, DOORTAG, [s * 1.385, 1.4, 2.75], [s, 0, 0]);
    glow(decal(0.9, 0.34, DOORTAG, [s * 1.386, 1.4, 2.75], [s, 0, 0]), 1.3);
    decal(0.85, 0.62, SIDEWIN, [s * 1.303, 2.45, 2.62], [s, 0, 0]);
    // mirror
    rod([s * 1.3, 2.4, 3.1], [s * 1.78, 2.55, 3.3], 0.025, FRAME);
    box(0.1, 0.5, 0.3, ARM2, [s * 1.82, 2.45, 3.3]);
    neon(0.04, 0.1, 0.2, AMBER, [s * 1.88, 2.5, 3.3], {}, 1.6);
    // exhaust stacks
    cyl(0.11, 2.1, 8, "#262a36", [s * 1.5, 2.55, 1.92], [0, 1, 0]);
    cyl(0.16, 0.16, 8, "#3a3f4e", [s * 1.5, 3.62, 1.92], [0, 1, 0]);
    glow(cyl(0.12, 0.05, 8, "#ff6a2a", [s * 1.5, 3.7, 1.92], [0, 1, 0]), 1.4);
    for (const y of [1.8, 2.6, 3.3]) box(0.3, 0.08, 0.16, FRAME, [s * 1.4, y, 1.95]);
  }
  // roof light bar
  const barCols = [MAG, CYAN, CYAN, MAG];
  [-0.75, -0.25, 0.25, 0.75].forEach((x, i) => neon(0.48, 0.1, 0.14, barCols[i], [x, 3.2, 3.05], {}, 1.8));
  for (const x of [-1.0, 0, 1.0]) box(0.1, 0.1, 0.1, FRAME, [x, 3.13, 3.05]);

  // ---- turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 3.1, 2.45], dir: [0, 1, 0] });
  const gun = b.joint("gunPitch", { parent: yaw, at: [0, 3.42, 2.8], dir: [0, 0, 1] });
  const ty = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: yaw, at, flat: true, ...o });
  ty(new THREE.CylinderGeometry(0.38, 0.42, 0.14, 8), ARM2, [0, 3.17, 2.45]);
  ty(new THREE.BoxGeometry(0.8, 0.36, 0.9), ARM, [0, 3.4, 2.45]);
  ty(new THREE.BoxGeometry(0.5, 0.16, 0.5), ARM2, [0, 3.62, 2.35]);
  glow(ty(new THREE.SphereGeometry(0.09, 6, 4), RED, [0, 3.45, 2.92]), 1.8);
  for (const s of [1, -1]) {
    ty(new THREE.BoxGeometry(0.2, 0.3, 0.36), "#1b1e27", [s * 0.5, 3.4, 2.4]);
    neon(0.05, 0.05, 0.2, AMBER, [s * 0.6, 3.46, 2.4], { bone: yaw });
  }
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 3.42, 2.8], [s * 0.2, 3.42, 4.15], 0.05, "#2a2e38", { bone: gun, sides: 6, smooth: false });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 6), "#1b1e27", {
      bone: gun, at: [s * 0.2, 3.42, 4.15], dir: [0, 0, 1], flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.35, 6), "#3a3f4e", {
      bone: gun, at: [s * 0.2, 3.42, 3.1], dir: [0, 0, 1], flat: true,
    });
  }
  b.part(new THREE.BoxGeometry(0.6, 0.24, 0.26), ARM, { bone: gun, at: [0, 3.42, 2.95], flat: true });

  // ---- cargo pod
  const POD_Z = -1.5;
  const POD_L = 5.6;
  const POD_Y = 2.35;
  b.extrude(oct(1.25), { at: [0, POD_Y, POD_Z], x: [1, 0, 0], thickness: POD_L, color: PODP, bone: chassis });
  for (const z of [0.7, -1.5, -3.7]) box(1.6, 0.34, 0.6, ARM2, [0, 1.15, z]);
  const BANDS = [1.15, -0.2, -1.5, -2.8, -4.15];
  for (const z of BANDS) {
    b.extrude(oct(1.34), { at: [0, POD_Y, z], x: [1, 0, 0], thickness: 0.2, color: "#20242f", bone: chassis });
    neon(0.7, 0.04, 0.21, MAG, [0, POD_Y + 1.345, z], {}, 1.6);
    for (const s of [1, -1]) neon(0.04, 0.5, 0.21, CYAN, [s * 1.345, POD_Y, z], {}, 1.3);
  }
  const TILES = [0.475, -0.85, -2.15, -3.475];
  TILES.forEach((zc, i) => {
    for (const s of [1, -1]) {
      box(0.08, 0.85, 1.0, PLATE, [s * 1.29, POD_Y, zc]);
      if (i === 2) decal(0.95, 0.71, LABEL, [s * 1.335, POD_Y, zc], [s, 0, 0]);
      else if (i === 1) glow(decal(0.9, 0.34, DOORTAG, [s * 1.335, POD_Y + 0.05, zc], [s, 0, 0]), 1.3);
      else decal(0.9, 0.22, HAZARD, [s * 1.335, POD_Y - 0.2, zc], [s, 0, 0]);
    }
    box(0.8, 0.08, 1.0, PLATE, [0, 3.64, zc]);
    box(0.8, 0.08, 1.0, PLATE, [0, 1.06, zc]);
  });
  // diagonal neon strips
  [45, 135, 225, 315].forEach((deg, i) => {
    const t = (deg * Math.PI) / 180;
    neon(0.12, 0.05, 5.0, i < 2 ? CYAN : MAG, [Math.cos(t) * 1.28, POD_Y + Math.sin(t) * 1.28, POD_Z], { rotation: [0, 0, deg - 90] }, 1.4);
  });
  // roof gear: sensor dome and dish
  glow(
    put(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), AMBER, [0, 3.68, -0.85]),
    1.4,
  );
  cyl(0.26, 0.06, 8, ARM2, [0, 3.7, -0.85], [0, 1, 0]);
  b.lathe([[0, 0], [0.34, 0.14], [0.34, 0.17], [0, 0.05]], {
    at: [0, 3.85, -3.475], axis: [0, 1, -0.5], segments: 8, color: "#9aa6c0", bone: chassis,
  });
  rod([0, 3.68, -3.475], [0, 3.88, -3.5], 0.04, FRAME);
  glow(put(new THREE.SphereGeometry(0.05, 6, 4), CYAN, [0, 4.02, -3.62]), 1.6);
  // rear door
  b.extrude(oct(1.08), { at: [0, POD_Y, -4.35], x: [1, 0, 0], thickness: 0.1, color: "#1b1e27", bone: chassis });
  decal(1.9, 1.9, REARDOOR, [0, POD_Y - 0.05, -4.404], [0, 0, -1]);
  glow(decal(1.9, 1.9, REARGLOW, [0, POD_Y - 0.05, -4.41], [0, 0, -1]), 1.6);
  // front cap: lock ring + hoses
  for (const x of [-0.6, 0.6]) {
    b.sweep(
      catmull([[x, 2.55, 2.0], [x * 0.9, 2.15, 1.72], [x * 0.9, 2.4, 1.3]]),
      0.07,
      { color: "#1b1e27", bone: chassis, sides: 6, smooth: false },
    );
    b.sweep(
      catmull([[x * 0.4, 2.2, 2.0], [x * 0.4, 1.95, 1.7], [x * 0.4, 2.1, 1.3]]),
      0.035,
      { color: x < 0 ? MAG : CYAN, bone: chassis, sides: 6, smooth: false },
    );
  }
  glow(put(new THREE.SphereGeometry(0.06, 6, 4), MAG, [0.6, 2.4, 1.3]), 1.5);
  glow(put(new THREE.SphereGeometry(0.06, 6, 4), CYAN, [-0.6, 2.4, 1.3]), 1.5);

  // ---- rear bumper and lights, antennas
  box(2.7, 0.35, 0.3, ARM, [0, 0.72, -4.9]);
  decal(1.0, 0.3, HAZARD, [0, 0.72, -5.055], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(decal(0.7, 0.18, TAIL, [s * 0.95, 0.74, -5.056], [0, 0, -1]), 1.5);
    rod([s * 1.15, 1.0, -4.6], [s * 1.15, 3.4, -4.7], 0.03, FRAME);
    glow(put(new THREE.SphereGeometry(0.06, 6, 4), s > 0 ? CYAN : MAG, [s * 1.15, 3.45, -4.7]), 1.8);
    box(0.2, 0.2, 0.2, ARM2, [s * 1.15, 1.05, -4.62]);
  }
  // roof whip antenna on the cab
  rod([0.9, 3.1, 2.2], [1.0, 4.0, 2.1], 0.02, FRAME);
  glow(put(new THREE.SphereGeometry(0.05, 6, 4), RED, [1.0, 4.03, 2.1]), 1.8);

  return b.root;
}
