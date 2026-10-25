```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { countershade, paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Nightwatch Raider 2077",
  description:
    "Low-poly cyberpunk militarized pickup: armoured wedge cab, roof railgun turret, glowing battery bed, rear thrusters, ram bumper and neon underglow.",
};

const BODY = panelled(countershade("#46536a", "#262d39"), { size: 0.4, rivets: 0.09 });
const BODY2 = "#313b4b";
const TRIM = "#12151b";
const DARK = "#0a0c10";
const STEEL = "#7b8494";
const TYRE = "#16171b";
const GLASS = "#12495c";
const CYAN = "#27f0ff";
const MAG = "#ff2fa8";
const AMBER = "#ffb02e";
const HAZ = "#e8c21a";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const decalTex = (inner: string, size = 256) =>
  svg(`<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`, { size });

const UNIT = decalTex(
  `<rect x="6" y="30" width="116" height="68" rx="6" fill="#0b0d12" stroke="#27f0ff" stroke-width="4"/>
   <text x="64" y="80" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="44" fill="#27f0ff">K-77</text>
   <path d="M12 38 h20 M96 90 h20" stroke="#ff2fa8" stroke-width="3"/>`,
);
const WARN = decalTex(
  `<path d="M64 8 L122 112 H6Z" fill="#e8c21a" stroke="#0a0c10" stroke-width="7" stroke-linejoin="round"/>
   <path d="M70 40 L50 74 H66 L58 100 L82 62 H66Z" fill="#0a0c10"/>`,
);
const HUD = decalTex(
  `<rect width="128" height="128" fill="#041a22"/>
   <circle cx="64" cy="58" r="30" fill="none" stroke="#27f0ff" stroke-width="3"/>
   <path d="M64 18 v80 M24 58 h80" stroke="#27f0ff" stroke-width="2"/>
   <circle cx="78" cy="46" r="5" fill="#ff2fa8"/>
   <rect x="10" y="104" width="70" height="8" fill="#27f0ff"/><rect x="84" y="104" width="30" height="8" fill="#ffb02e"/>
   <text x="10" y="14" font-family="monospace" font-size="11" fill="#27f0ff">SYS OK</text>`,
);
const CHEV = decalTex(
  `<rect width="128" height="128" fill="#0a0c10"/>
   <path d="M-20 128 L40 0 H70 L10 128Z M50 128 L110 0 H140 L80 128Z M-90 128 L-30 0 H0 L-60 128Z" fill="#e8c21a"/>`,
  128,
);
const SIGN = decalTex(
  `<rect width="128" height="128" fill="#12001a"/>
   <rect x="6" y="6" width="116" height="116" fill="none" stroke="#ff2fa8" stroke-width="5"/>
   <text x="64" y="58" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="34" fill="#ff2fa8">夜警</text>
   <text x="64" y="96" text-anchor="middle" font-family="monospace" font-size="18" fill="#27f0ff">2077</text>`,
);

export default function build() {
  const b = createBuilder({ name: "raider2077" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], dir: [0, 0, 1] });
  const P = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone: chassis, at, ...o });
  const rodC = (a: number[], c: number[], r: number, color: any, bone: any = chassis) =>
    b.rod(a, c, r, color, { bone });
  const tex = (t: THREE.Texture, w: number, h: number, at: number[], dir: number[], bone: any = chassis, g = false) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: t });
    return g ? glow(p) : p;
  };

  // ---------- Frame and running gear ----------
  for (const s of [1, -1]) {
    rodC([s * 0.55, 0.62, -2.5], [s * 0.55, 0.62, 2.4], 0.07, TRIM);
  }
  P(box(1.9, 0.14, 4.9), DARK, [0, 0.8, -0.1]);
  for (const z of [-1.6, 1.6]) {
    rodC([-1.0, 0.42, z], [1.0, 0.42, z], 0.08, TRIM);
    P(new THREE.SphereGeometry(0.2, 8, 6), STEEL, [0, 0.42, z], { scale: [1, 0.8, 1] }); // diff housing
  }
  // wheels
  const wheelJ: any[] = [];
  for (const s of [1, -1])
    for (const z of [1.6, -1.6]) {
      const n = `wheel${s > 0 ? "L" : "R"}${z > 0 ? "F" : "R"}`;
      const cx = s * 1.08;
      const j = b.joint(n, { parent: chassis, at: [cx, 0.42, z], dir: [s, 0, 0], role: "hinge" });
      wheelJ.push(j);
      b.part(cyl(0.39, 0.38, 12), TYRE, { bone: j, at: [cx, 0.42, z], dir: [1, 0, 0] });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const off = i % 2 ? 0.07 : -0.07;
        b.part(box(0.16, 0.07, 0.17), TYRE, {
          bone: j,
          at: [cx + off, 0.42 + Math.cos(a) * 0.405, z + Math.sin(a) * 0.405],
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      b.part(cyl(0.27, 0.05, 10), STEEL, { bone: j, at: [cx + s * 0.2, 0.42, z], dir: [1, 0, 0] });
      b.part(cyl(0.12, 0.09, 8), TRIM, { bone: j, at: [cx + s * 0.22, 0.42, z], dir: [1, 0, 0] });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.part(cyl(0.022, 0.04, 6), HAZ, {
          bone: j,
          at: [cx + s * 0.225, 0.42 + Math.cos(a) * 0.19, z + Math.sin(a) * 0.19],
          dir: [1, 0, 0],
        });
      }
      glow(
        b.part(new THREE.TorusGeometry(0.3, 0.014, 4, 16), CYAN, {
          bone: j,
          at: [cx + s * 0.225, 0.42, z],
          dir: [1, 0, 0],
          axis: "z",
        }),
        1.3,
      );
      // fender arch
      P(box(0.52, 0.08, 1.15), BODY, [s * 1.08, 0.96, z]);
      P(box(0.52, 0.2, 0.08), BODY, [s * 1.08, 0.88, z + 0.56], { rotation: [-20, 0, 0] });
      P(box(0.52, 0.2, 0.08), BODY, [s * 1.08, 0.88, z - 0.56], { rotation: [20, 0, 0] });
      P(box(0.04, 0.14, 1.1), TRIM, [s * 1.34, 0.95, z]);
    }

  // ---------- Cab ----------
  b.extrude(
    [
      [-0.9, 0.95],
      [-0.9, 2.0],
      [0.1, 2.12],
      [0.8, 1.76],
      [0.92, 0.95],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, bevel: 0.04, color: BODY, bone: chassis },
  );
  // windscreen
  P(box(1.6, 0.78, 0.03), GLASS, [0, 1.93, 0.46], { rotation: [26.6, 0, 0] });
  rodC([0, 1.95, 0.46], [0.0, 1.92, 0.5], 0.002, GLASS);
  for (const s of [1, -1]) {
    P(box(0.03, 0.4, 1.0), GLASS, [s * 0.905, 1.72, -0.15]);
    P(box(0.03, 0.04, 0.03), TRIM, [s * 0.915, 1.7, 0.36]);
    P(box(0.04, 0.7, 0.03), TRIM, [s * 0.915, 1.45, 0.34]); // door seam
    P(box(0.04, 0.7, 0.03), TRIM, [s * 0.915, 1.45, -0.62]);
    P(box(0.05, 0.05, 0.22), STEEL, [s * 0.93, 1.45, 0.2]); // handle
    P(box(0.04, 0.05, 0.9), TRIM, [s * 0.92, 1.1, -0.15]);
    // vision slit armour brows
    P(box(0.05, 0.05, 1.05), TRIM, [s * 0.915, 1.95, -0.15]);
    // mirrors
    rodC([s * 0.95, 1.55, 0.6], [s * 1.2, 1.7, 0.7], 0.018, TRIM);
    P(box(0.06, 0.2, 0.14), TRIM, [s * 1.24, 1.7, 0.72]);
    glow(P(box(0.02, 0.1, 0.08), CYAN, [s * 1.22, 1.7, 0.78]), 1.2);
    // door decals
    tex(UNIT, 0.5, 0.5, [s * 0.925, 1.25, -0.15], [s, 0, 0]);
  }
  tex(SIGN, 0.4, 0.4, [0.0, 1.55, 0.88 + 0.0], [0, 0.42, 0.9], chassis, true).position;
  // roof gear
  P(box(1.3, 0.1, 0.25), TRIM, [0, 2.17, 0.0]);
  for (let i = 0; i < 4; i++) glow(P(box(0.2, 0.07, 0.04), i % 2 ? MAG : CYAN, [-0.45 + i * 0.3, 2.19, 0.13]), 1.6);
  for (const s of [1, -1]) rodC([s * 0.85, 2.0, -0.85], [s * 0.85, 2.08, 0.05], 0.025, STEEL);
  // antenna
  P(cyl(0.05, 0.1, 8), TRIM, [0.8, 2.12, -0.8]);
  rodC([0.8, 2.15, -0.8], [0.8, 3.1, -0.8], 0.012, STEEL);
  glow(P(new THREE.SphereGeometry(0.03, 6, 4), MAG, [0.8, 3.12, -0.8]), 2);
  // dish
  P(cyl(0.03, 0.2, 6), TRIM, [-0.7, 2.2, -0.8]);
  b.lathe(
    [
      [0, 0],
      [0.18, 0.06],
      [0.16, 0.07],
      [0, 0.015],
    ],
    { at: [-0.7, 2.3, -0.8], axis: [0.3, 0.8, 0.4], color: STEEL, bone: chassis },
  );

  // ---------- Hood / nose ----------
  b.extrude(
    [
      [0.8, 0.9],
      [0.8, 1.55],
      [1.6, 1.42],
      [2.55, 1.12],
      [2.7, 0.95],
      [2.6, 0.9],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.04, color: BODY, bone: chassis },
  );
  P(box(0.12, 0.05, 1.5), TRIM, [0, 1.48, 1.7], { rotation: [-7, 0, 0] }); // ridge
  for (const s of [1, -1]) {
    // hood vents
    for (let i = 0; i < 4; i++) glow(P(box(0.3, 0.015, 0.06), AMBER, [s * 0.5, 1.47 - i * 0.045, 1.35 + i * 0.2], { rotation: [-7, 0, 0] }), 1.1);
    // ERA bricks
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++)
        P(box(0.16, 0.05, 0.2), r ? "#3a4252" : "#2c3340", [s * (0.28 + c * 0.2), 1.52 - r * 0.0 - (r ? 0.07 : 0.03) + 0.0, 1.0 + r * 0.25 + 0.5], { rotation: [-7, 0, 0] });
    // headlights
    glow(P(box(0.5, 0.08, 0.04), CYAN, [s * 0.62, 1.1, 2.66], { rotation: [-22, 0, 0] }), 2);
    P(box(0.55, 0.04, 0.08), TRIM, [s * 0.62, 1.16, 2.62]);
    glow(P(box(0.14, 0.14, 0.04), AMBER, [s * 0.92, 1.0, 2.55]), 1.4);
    // smoke launchers on fenders
    for (let i = 0; i < 3; i++) P(cyl(0.035, 0.28, 6), TRIM, [s * 1.1, 1.08, 1.45 + i * 0.1], { rotation: [75, 0, 0] });
  }
  // grille
  P(box(0.95, 0.3, 0.05), DARK, [0, 1.05, 2.62]);
  for (let i = 0; i < 5; i++) P(box(0.9, 0.02, 0.04), STEEL, [0, 0.95 + i * 0.055, 2.66]);
  glow(P(box(0.12, 0.12, 0.03), MAG, [0, 1.2, 2.66], { rotation: [0, 0, 45] }), 1.6);

  // ---------- Bumper & ram ----------
  P(box(2.25, 0.3, 0.26), TRIM, [0, 0.62, 2.62]);
  tex(CHEV, 1.4, 0.2, [0, 0.64, 2.755], [0, 0, 1]);
  for (let i = 0; i < 7; i++) {
    const x = -0.9 + i * 0.3;
    b.spike([x, 0.5, 2.7], [0, 0, 1], 0.28, 0.05, { color: STEEL, bone: chassis, sides: 4 });
  }
  for (const s of [1, -1]) {
    P(box(0.12, 0.3, 0.5), BODY2, [s * 1.1, 0.62, 2.55], { rotation: [0, s * 20, 0] });
    P(cyl(0.05, 0.12, 6), AMBER, [s * 0.4, 0.88, 2.75], { rotation: [90, 0, 0] });
  }
  // winch
  P(cyl(0.08, 0.5, 8), STEEL, [0, 0.8, 2.72], { dir: [1, 0, 0] });

  // ---------- Bed ----------
  P(box(1.9, 0.1, 1.9), BODY2, [0, 1.0, -1.85]);
  for (const s of [1, -1]) {
    P(box(0.1, 0.6, 1.95), BODY, [s * 0.95, 1.35, -1.85]);
    P(box(0.14, 0.05, 1.95), TRIM, [s * 0.95, 1.67, -1.85]);
    tex(WARN, 0.3, 0.3, [s * 1.004, 1.4, -2.2], [s, 0, 0]);
    // side plates
    for (let i = 0; i < 3; i++) P(box(0.04, 0.38, 0.5), BODY2, [s * 1.0, 1.35, -1.2 - i * 0.62]);
    // skirts
    for (let i = 0; i < 4; i++) P(box(0.06, 0.36, 0.48), BODY2, [s * 1.0, 0.72, -0.9 + i * 0.58 + 0.0 - 0.0 + 0.0 + 0.0 - 0.1 + 0.0 - 0.4 + 0.4 + 0.0 - 0.3 + 0.3], { rotation: [0, 0, s * 12] });
    rodC([s * 1.05, 0.53, -1.0], [s * 1.05, 0.53, 1.0], 0.025, MAG);
    glow(b.rod([s * 1.07, 0.5, -1.0], [s * 1.07, 0.5, 1.0], 0.02, MAG, { bone: chassis }), 2);
    // exhaust
    P(cyl(0.06, 0.3, 8), STEEL, [s * 0.55, 0.65, -2.75], { rotation: [90, 0, 0] });
  }
  P(box(1.9, 0.6, 0.1), BODY, [0, 1.35, -0.85]); // headboard
  tex(HUD, 0.7, 0.4, [0, 1.45, -0.795], [0, 0, 1], chassis, true);
  // tailgate
  P(box(1.9, 0.6, 0.1), BODY, [0, 1.35, -2.8]);
  tex(WARN, 0.4, 0.4, [0, 1.35, -2.855], [0, 0, -1]);
  for (const s of [1, -1]) glow(P(box(0.3, 0.06, 0.03), "#ff2a2a", [s * 0.65, 1.62, -2.86]), 2);
  // battery cells
  for (let i = 0; i < 4; i++) {
    const z = -1.3 - i * 0.38;
    for (const s of [1, -1]) {
      P(cyl(0.14, 0.5, 8), "#1d2735", [s * 0.4, 1.32, z]);
      glow(P(cyl(0.1, 0.04, 8), CYAN, [s * 0.4, 1.58, z]), 1.8);
      glow(P(cyl(0.09, 0.36, 8), CYAN, [s * 0.4, 1.3, z]), 0.5);
    }
    P(box(0.9, 0.04, 0.06), TRIM, [0, 1.52, z]);
  }
  // thrusters
  for (const s of [1, -1]) {
    P(cyl(0.3, 0.1, 10), TRIM, [s * 0.6, 1.35, -2.74], { dir: [0, 0, 1] });
    b.lathe(
      [
        [0.12, 0],
        [0.22, 0.04],
        [0.33, 0.3],
        [0.3, 0.3],
        [0.2, 0.06],
        [0.1, 0.0],
      ],
      { at: [s * 0.6, 1.35, -2.8], axis: [0, 0, -1], color: STEEL, bone: chassis, segments: 10 },
    );
    glow(P(cyl(0.12, 0.03, 10), "#6ad6ff", [s * 0.6, 1.35, -2.82], { dir: [0, 0, 1] }), 2.4);
  }
  // cables
  rodC([0.7, 1.7, -0.9], [0.95, 1.55, -1.7], 0.025, TRIM);
  rodC([-0.7, 1.7, -0.9], [-0.95, 1.55, -1.7], 0.025, TRIM);

  // ---------- Roof turret ----------
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.2, -0.5], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 2.5, -0.5], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.38, 0.12, 12), TRIM, { bone: yaw, at: [0, 2.2, -0.5] });
  b.part(cyl(0.3, 0.2, 10), BODY2, { bone: yaw, at: [0, 2.35, -0.5] });
  for (const s of [1, -1]) {
    b.part(box(0.07, 0.3, 0.45), BODY, { bone: yaw, at: [s * 0.22, 2.55, -0.5] });
    b.part(box(0.2, 0.22, 0.4), TRIM, { bone: pitch, at: [s * 0.4, 2.5, -0.5] }); // pod
    for (let i = 0; i < 2; i++) b.part(cyl(0.04, 0.1, 6), AMBER, { bone: pitch, at: [s * 0.4, 2.46 + i * 0.08, -0.28], dir: [0, 0, 1] });
  }
  b.part(box(0.3, 0.26, 0.55), BODY2, { bone: pitch, at: [0, 2.5, -0.35] });
  b.part(cyl(0.06, 1.4, 8), STEEL, { bone: pitch, at: [0, 2.5, 0.6], dir: [0, 0, 1] });
  b.part(cyl(0.09, 0.2, 8), TRIM, { bone: pitch, at: [0, 2.5, 1.25], dir: [0, 0, 1] });
  glow(b.part(cyl(0.065, 0.04, 8), CYAN, { bone: pitch, at: [0, 2.5, 1.36], dir: [0, 0, 1] }), 2);
  for (let i = 0; i < 5; i++) glow(b.part(cyl(0.085, 0.015, 8), CYAN, { bone: pitch, at: [0, 2.5, 0.2 + i * 0.2], dir: [0, 0, 1] }), 1.5);
  for (const s of [1, -1]) b.rod([s * 0.06, 2.45, -0.2], [s * 0.06, 2.45, 1.0], 0.02, TRIM, { bone: pitch });

  // underbody neon
  glow(rodC([-0.9, 0.7, -2.5], [0.9, 0.7, -2.5], 0.02, CYAN), 1.8);
  glow(rodC([-0.9, 0.7, 2.4], [0.9, 0.7, 2.4], 0.02, CYAN), 1.8);

  return b.root;
}
```