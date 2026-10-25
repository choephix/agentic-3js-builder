import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Riot Interceptor RC-07",
  description:
    "Corporate riot-control armoured interceptor with a roof-mounted water cannon, tank, strobe bars and neon underglow, in a Cyberpunk 2077 style.",
};

type V = [number, number, number];

// ---------- palette ----------
const MAG = "#ff2a8a";
const CYAN = "#19e6ff";
const YEL = "#ffe21a";
const RED = "#ff2438";
const BLUE = "#2a5cff";
const DARK = "#161924";
const DARK2 = "#222736";
const STEEL = "#8e98b0";
const GLASS = "#0d3a52";
const TIRE = "#101116";

// ---------- paints ----------
const HULL = paint((p, n) => {
  const g = noise(p, 0.3, 3);
  let c = p.y > 1.25 ? mix("#d5dbe7", "#aeb7ca", g) : mix("#262b3b", "#171a25", g);
  if (p.y > 1.2 && p.y < 1.29) c = mix("#e0207a", "#ff4aa0", g);
  if (Math.abs(n.x) > 0.5) {
    const k = (((p.z % 0.95) + 0.95) % 0.95);
    if (k < 0.012) c = mix(c, "#07080c", 0.85);
  }
  if (n.y > 0.8) c = mix(c, "#ffffff", 0.12);
  const grime = smoothstep(0.95, 0.55, p.y) * (0.4 + 0.5 * noise(p, 0.15, 9));
  return mix(c, "#0a0b10", grime);
});
const FLARE = paint((p) => mix(DARK, DARK2, noise(p, 0.2, 5)));
const TANK = paint((p, n) => {
  let c = mix("#c9d3e2", "#8fa0bb", noise(p, 0.25, 2));
  if (Math.abs(p.z + 1.55) < 0.55 && n.y > 0.4 && Math.abs(p.x) < 0.04) c = mix(c, CYAN, 0.7);
  return mix(c, "#1c2030", smoothstep(0.2, -0.9, n.y) * 0.6);
});
const treadAt = (zc: number) =>
  paint((p) => {
    const a = Math.atan2(p.y - 0.5, p.z - zc);
    return Math.floor(a / (Math.PI / 10)) % 2 === 0 ? "#101116" : "#1e2028";
  });

// ---------- textures ----------
const LOGO = svg(
  `<svg viewBox="0 0 160 56" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="158" height="54" rx="4" fill="#0e111a" stroke="#ff2a8a" stroke-width="2"/>
  <polygon points="28,8 46,18 46,38 28,48 10,38 10,18" fill="none" stroke="#19e6ff" stroke-width="3"/>
  <polygon points="28,17 38,23 38,33 28,39 18,33 18,23" fill="#ff2a8a"/>
  <path d="M22 28 L28 22 L34 28 L28 34Z" fill="#0e111a"/>
  <text x="56" y="30" font-family="monospace" font-weight="bold" font-size="22" fill="#f4f6fb" textLength="94">VANTAGE</text>
  <text x="56" y="44" font-family="monospace" font-size="8.5" fill="#19e6ff" textLength="94">CIVIL ORDER DIVISION</text>
  <path d="M56 8 h94 v5 h-94Z" fill="#ffe21a"/>
  </svg>`,
  { size: 512 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="20" fill="#0a0c12"/>
  ${Array.from({ length: 11 }, (_, i) => `<rect x="${4 + i * 8.6}" y="3" width="4" height="14" fill="${i % 2 ? "#19e6ff" : "#ff2a8a"}"/>`).join("")}
  <rect x="0" y="0" width="100" height="2" fill="#2a2f42"/><rect x="0" y="18" width="100" height="2" fill="#2a2f42"/>
  </svg>`,
  { size: 400 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="16" fill="#ffe21a"/>
  ${Array.from({ length: 16 }, (_, i) => `<polygon points="${i * 10 - 8},16 ${i * 10},0 ${i * 10 + 5},0 ${i * 10 - 3},16" fill="#0c0d12"/>`).join("")}
  </svg>`,
  { size: 480 },
);
const REAR = svg(
  `<svg viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="40" fill="#0c0e15" stroke="#ffe21a" stroke-width="2"/>
  <text x="90" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#ff2a8a" textLength="160">COMPLY OR BE</text>
  <text x="90" y="34" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#19e6ff" textLength="160">WASHED AWAY</text>
  </svg>`,
  { size: 512 },
);
const PLATE = svg(
  `<svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="20" rx="2" fill="#f4e04a"/><rect x="1" y="1" width="58" height="18" rx="2" fill="none" stroke="#111" stroke-width="1"/>
  <text x="30" y="14.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#111" textLength="52">NC-4471</text>
  </svg>`,
  { size: 256 },
);
const LENS = svg(
  `<svg viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="16" fill="#ffffff"/><rect x="2" y="2" width="36" height="12" fill="#e8f6ff"/>
  ${[8, 16, 24, 32].map((x) => `<rect x="${x}" y="2" width="1.5" height="12" fill="#9cc"/>`).join("")}
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0] });

  const box = (size: V, color: any, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: chassis, at, ...o });
  const neon = (a: V, c: V, r: number, col: string, s = 1.4) =>
    glow(b.rod(a, c, r, col, { bone: chassis, sides: 6 }), s);
  const lamp = (size: V, col: string, at: V, s = 1.5, o: any = {}) => glow(box(size, col, at, o), s);

  // ---------- hull ----------
  const side: [number, number][] = [
    [-2.5, 0.55], [2.6, 0.55], [2.68, 0.95], [2.25, 1.28],
    [1.3, 1.58], [0.7, 2.18], [-2.35, 2.22], [-2.52, 1.9],
  ];
  b.extrude(side, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.07, color: HULL, bone: chassis });

  // underglow + skirt
  lamp([1.7, 0.04, 4.6], MAG, [0, 0.52, 0], 1.3);
  box([2.04, 0.08, 4.9], DARK, [0, 0.58, 0]);

  // ---------- wheels ----------
  for (const s of [1, -1]) {
    for (const [z, tag] of [[1.7, "F"], [-1.6, "R"]] as [number, string][]) {
      const j = b.joint(`wheel${tag}${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 1.05, 0.5, z], dir: [s, 0, 0] });
      const ax = [1, 0, 0] as V;
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.42, 16), treadAt(z), { bone: j, at: [s * 1.05, 0.5, z], dir: ax });
      b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.46, 10), STEEL, { bone: j, at: [s * 1.05, 0.5, z], dir: ax });
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), DARK2, { bone: j, at: [s * 1.07, 0.5, z], dir: ax });
      glow(
        b.part(new THREE.TorusGeometry(0.25, 0.02, 4, 16), tag === "F" ? CYAN : MAG, {
          bone: j, at: [s * 1.29, 0.5, z], dir: [s, 0, 0], axis: "z",
        }),
        1.6,
      );
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5), "#d9deea", {
          bone: j, at: [s * 1.1, 0.5 + Math.cos(a) * 0.14, z + Math.sin(a) * 0.14], dir: ax,
        });
      }
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.52, 6), "#d9deea", { bone: j, at: [s * 1.1, 0.5, z], dir: ax });
      // fender flare
      box([0.2, 0.09, 1.3], FLARE, [s * 1.15, 1.04, z]);
      box([0.2, 0.3, 0.09], FLARE, [s * 1.15, 0.88, z + 0.62]);
      box([0.2, 0.3, 0.09], FLARE, [s * 1.15, 0.88, z - 0.62]);
      neon([s * 1.26, 1.1, z - 0.6], [s * 1.26, 1.1, z + 0.6], 0.015, YEL, 1.2);
    }
    // side step + neon
    box([0.2, 0.08, 2.2], DARK, [s * 1.1, 0.62, 0.05]);
    neon([s * 1.21, 0.62, -1.0], [s * 1.21, 0.62, 1.1], 0.02, MAG, 1.8);
    // roofline neon
    neon([s * 0.99, 2.22, -2.3], [s * 0.99, 2.2, 0.7], 0.018, CYAN, 1.6);
    neon([s * 1.01, 1.25, -2.4], [s * 1.01, 1.25, 0.2], 0.012, YEL, 1.1);
    // hood edge neon
    neon([s * 0.97, 1.56, 1.3], [s * 0.97, 1.3, 2.25], 0.02, CYAN, 1.8);
    neon([s * 0.97, 1.3, 2.25], [s * 0.97, 0.98, 2.68], 0.02, CYAN, 1.8);

    // side glass + bars
    glow(box([0.03, 0.5, 0.72], GLASS, [s * 1.02, 1.8, 0.36]), 0.4);
    for (let k = 0; k < 7; k++) box([0.04, 0.54, 0.025], DARK, [s * 1.045, 1.8, 0.04 + k * 0.115]);
    box([0.05, 0.03, 0.78], DARK, [s * 1.045, 2.06, 0.37]);
    box([0.05, 0.03, 0.78], DARK, [s * 1.045, 1.54, 0.37]);

    // door handle + emblem
    box([0.04, 0.05, 0.22], STEEL, [s * 1.02, 1.42, -0.15]);
    b.part(new THREE.PlaneGeometry(1.7, 0.6), "#ffffff", {
      bone: chassis, at: [s * 1.012, 1.62 - 0.22, -1.25], dir: [s, 0, 0], axis: "z", texture: LOGO,
    });
    // vents
    for (let k = 0; k < 4; k++) box([0.03, 0.035, 0.45], "#07080c", [s * 1.012, 0.85 + k * 0.07, -0.2 + 0.0]);

    // mirrors
    box([0.3, 0.025, 0.025], DARK, [s * 1.14, 1.72, 0.75]);
    box([0.07, 0.28, 0.16], DARK2, [s * 1.3, 1.72, 0.75]);
    lamp([0.02, 0.05, 0.14], CYAN, [s * 1.3, 1.6, 0.75], 1.5);

    // headlights & DRL
    lamp([0.4, 0.1, 0.06], "#f4fbff", [s * 0.8, 0.93, 2.66], 2.2);
    lamp([0.4, 0.025, 0.06], MAG, [s * 0.8, 0.84, 2.68], 1.6);
    // rear lights
    lamp([0.15, 0.7, 0.05], RED, [s * 0.9, 1.3, -2.53], 1.5);
    // push bar posts
    box([0.07, 0.4, 0.07], DARK, [s * 0.6, 0.8, 2.74]);
    // stabilizer feet
    box([0.1, 0.1, 0.5], DARK2, [s * 0.9, 0.62, -2.3]);
  }

  // ---------- windshield ----------
  glow(
    b.part(new THREE.BoxGeometry(1.84, 0.85, 0.04), GLASS, {
      bone: chassis, at: [0, 1.87, 1.02], rotation: [-45, 0, 0],
    }),
    0.45,
  );
  box([1.9, 0.05, 0.08], DARK, [0, 1.55, 1.28], { rotation: [-45, 0, 0] });
  box([1.9, 0.05, 0.08], DARK, [0, 2.17, 0.7]);
  // wire cage on windshield
  for (let k = -3; k <= 3; k++) box([0.025, 0.86, 0.03], DARK, [k * 0.28, 1.88, 1.04], { rotation: [-45, 0, 0] });
  // wipers
  for (const x of [-0.45, 0.35]) box([0.5, 0.025, 0.025], "#05060a", [x, 1.66, 1.2], { rotation: [-45, 0, 10] });

  // ---------- front end ----------
  box([2.12, 0.24, 0.3], DARK, [0, 0.64, 2.7]);
  b.part(new THREE.PlaneGeometry(2.0, 0.2), "#ffffff", {
    bone: chassis, at: [0, 0.64, 2.856], dir: [0, 0, 1], axis: "z", texture: HAZARD,
  });
  b.part(new THREE.PlaneGeometry(1.0, 0.2), "#ffffff", {
    bone: chassis, at: [0, 0.86, 2.675], dir: [0, 0, 1], axis: "z", texture: GRILLE,
  });
  box([1.4, 0.07, 0.08], DARK, [0, 1.0, 2.76]);
  box([1.3, 0.07, 0.08], DARK, [0, 0.8, 2.78]);
  b.part(new THREE.PlaneGeometry(0.32, 0.11), "#ffffff", {
    bone: chassis, at: [0, 0.52, 2.86], dir: [0, 0, 1], axis: "z", texture: PLATE,
  });
  // hood vents & scoop
  for (let k = 0; k < 4; k++) box([0.5, 0.02, 0.05], "#07080c", [s2(k), 1.43 - k * 0.0, 1.85 + 0.0], {});
  function s2(k: number) {
    return k < 2 ? -0.5 + 0 * k : 0.5;
  }
  box([0.9, 0.04, 0.5], DARK2, [0, 1.46, 1.75], { rotation: [-14, 0, 0] });
  for (let k = 0; k < 4; k++) lamp([0.8, 0.012, 0.03], CYAN, [0, 1.49 + 0.0, 1.58 + k * 0.1], 1.2, { rotation: [-14, 0, 0] });

  // ---------- roof strobe bar ----------
  box([1.85, 0.1, 0.34], DARK, [0, 2.27, 0.28]);
  const bars = [RED, BLUE, RED, BLUE, RED, BLUE];
  bars.forEach((c, i) => {
    lamp([0.27, 0.12, 0.28], c, [-0.77 + i * 0.308, 2.38, 0.28], 2.0);
    box([0.28, 0.02, 0.3], "#e8f6ff", [-0.77 + i * 0.308, 2.45, 0.28], { texture: LENS });
  });
  box([0.05, 0.14, 0.34], DARK, [-0.93, 2.35, 0.28]);
  box([0.05, 0.14, 0.34], DARK, [0.93, 2.35, 0.28]);
  // flood lamps
  for (const x of [-0.5, 0.5]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.07, 0.16, 8), DARK2, { bone: chassis, at: [x, 2.3, 0.55], dir: [0, 0.3, 1] });
    glow(b.part(new THREE.CircleGeometry(0.075, 8), "#f6feff", { bone: chassis, at: [x, 2.31, 0.64], dir: [0, 0.3, 1], axis: "z" }), 2.2);
  }

  // ---------- water tank ----------
  const TZ = -1.6;
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 1.3, 12), TANK, { bone: chassis, at: [0, 2.62, TZ], dir: [0, 0, 1] });
  for (const e of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.4, 12, 6), TANK, { bone: chassis, at: [0, 2.62, TZ + e * 0.65], scale: [1, 1, 0.45] });
    b.part(new THREE.CylinderGeometry(0.415, 0.415, 0.08, 12), DARK, { bone: chassis, at: [0, 2.62, TZ + e * 0.45], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.415, 0.415, 0.08, 12), DARK, { bone: chassis, at: [0, 2.62, TZ + e * 0.0], dir: [0, 0, 1] });
    glow(box([0.02, 0.2, 0.8], "#1fb6ff", [e * 0.405, 2.62, TZ]), 1.4);
    box([0.04, 0.04, 0.86], DARK, [e * 0.405, 2.74, TZ]);
    box([0.04, 0.04, 0.86], DARK, [e * 0.405, 2.5, TZ]);
    box([0.1, 0.25, 0.15], DARK2, [e * 0.3, 2.3, TZ - 0.45]);
    box([0.1, 0.25, 0.15], DARK2, [e * 0.3, 2.3, TZ + 0.45]);
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), STEEL, { bone: chassis, at: [0, 3.03, TZ - 0.1] });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), YEL, { bone: chassis, at: [0, 3.08, TZ - 0.1] });
  b.rod([0, 2.55, TZ + 0.75], [0, 2.5, -0.2], 0.055, STEEL, { bone: chassis, sides: 6 });
  neon([0, 2.62, TZ + 0.8], [0, 2.5, -0.12], 0.012, CYAN, 1.5);

  // ---------- water cannon ----------
  const PIV: V = [0, 2.66, -0.05];
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.2, -0.05], dir: [0, 1, 0] });
  const CD = new THREE.Vector3(0, 0.2, 1).normalize();
  const cannon = b.joint("cannon", { parent: turret, at: PIV, dir: [CD.x, CD.y, CD.z] });
  const cp = (d: number): V => [PIV[0] + CD.x * d, PIV[1] + CD.y * d, PIV[2] + CD.z * d];
  b.part(new THREE.CylinderGeometry(0.3, 0.34, 0.12, 10), DARK, { bone: turret, at: [0, 2.26, -0.05] });
  b.part(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 10), DARK2, { bone: turret, at: [0, 2.43, -0.05] });
  glow(b.part(new THREE.TorusGeometry(0.28, 0.015, 4, 16), MAG, { bone: turret, at: [0, 2.31, -0.05], dir: [0, 1, 0], axis: "z" }), 1.8);
  b.part(new THREE.BoxGeometry(0.62, 0.3, 0.4), "#c9d1e0", { bone: turret, at: [0, 2.62, -0.1] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.34, 0.32), DARK2, { bone: turret, at: [s * 0.3, 2.66, -0.05] });
    b.part(new THREE.BoxGeometry(0.12, 0.12, 0.14), DARK, { bone: turret, at: [s * 0.38, 2.7, 0.08] });
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { bone: turret, at: [s * 0.38, 2.7, 0.16] }), 2);
  }
  b.part(new THREE.BoxGeometry(0.34, 0.32, 0.5), DARK2, { bone: cannon, at: cp(0.05), dir: [CD.x, CD.y, CD.z], axis: "z" });
  const along = [CD.x, CD.y, CD.z] as V;
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 1.25, 10), STEEL, { bone: cannon, at: cp(0.75), dir: along });
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 10), DARK2, { bone: cannon, at: cp(0.42), dir: along });
  for (const d of [0.22, 0.62]) {
    glow(b.part(new THREE.TorusGeometry(0.165, 0.014, 4, 14), CYAN, { bone: cannon, at: cp(d), dir: along, axis: "z" }), 1.8);
  }
  b.part(new THREE.CylinderGeometry(0.2, 0.1, 0.28, 10), "#c9d1e0", { bone: cannon, at: cp(1.45), dir: along });
  b.part(new THREE.TorusGeometry(0.2, 0.025, 4, 14), YEL, { bone: cannon, at: cp(1.58), dir: along, axis: "z" });
  glow(b.part(new THREE.CircleGeometry(0.13, 10), "#8ff0ff", { bone: cannon, at: cp(1.585), dir: along, axis: "z" }), 2.2);
  // optic on top
  b.part(new THREE.BoxGeometry(0.14, 0.12, 0.3), DARK, { bone: cannon, at: [PIV[0], PIV[1] + 0.2, PIV[2] + 0.15] });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), CYAN, { bone: cannon, at: [PIV[0], PIV[1] + 0.2, PIV[2] + 0.33] }), 2);

  // ---------- rear ----------
  box([2.1, 0.22, 0.3], DARK, [0, 0.66, -2.6]);
  lamp([1.7, 0.07, 0.05], RED, [0, 0.9, -2.55], 1.6);
  box([0.025, 1.1, 0.03], "#07080c", [0, 1.45, -2.52]);
  b.part(new THREE.PlaneGeometry(1.5, 0.34), "#ffffff", {
    bone: chassis, at: [0, 1.6, -2.525], dir: [0, 0, -1], axis: "z", texture: REAR,
  });
  b.part(new THREE.PlaneGeometry(0.4, 0.13), "#ffffff", {
    bone: chassis, at: [0, 1.1, -2.535], dir: [0, 0, -1], axis: "z", texture: PLATE,
  });
  for (const x of [-0.5, 0.5]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.25, 8), "#444a5c", { bone: chassis, at: [x, 0.7, -2.78], dir: [0, 0, 1] });
  }
  // tail strobe
  lamp([0.6, 0.05, 0.05], BLUE, [0, 2.1, -2.38], 2);
  // antennas
  b.spike([-0.85, 2.2, -2.1], [0, 1, 0], 1.0, 0.016, { color: DARK, bone: chassis });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { bone: chassis, at: [-0.85, 3.2, -2.1] }), 2.5);
  b.spike([0.85, 2.2, -2.2], [0.1, 1, 0], 0.6, 0.012, { color: DARK, bone: chassis });
  // camera dome
  b.part(new THREE.SphereGeometry(0.15, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), DARK2, { bone: chassis, at: [0.7, 2.22, -0.4] });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), CYAN, { bone: chassis, at: [0.7, 2.34, -0.33] }), 2);
  // roof rack rails
  for (const s of [1, -1]) b.rod([s * 0.8, 2.26, -2.2], [s * 0.8, 2.26, -0.4], 0.02, STEEL, { bone: chassis, sides: 5 });

  return b.root;
}
