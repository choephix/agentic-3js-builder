import * as THREE from "three";
import { createBuilder, catmull, svg, paint, mix, noise, smoothstep, countershade } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier planted on four stabiliser legs, low-poly sci-fi military.",
};

const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cy = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const OLIVE = "#56603f", DARK = "#1d2024", STEEL = "#7b828a", GUN = "#2c3036";
const TYRE = "#17181a", AMBER = "#ffb23a", CYAN = "#6df3ff", HAZ = "#e8b920";

const HULL = panelled(
  paint((p, n) => {
    const t = noise(p, 0.9, 4);
    const base = mix(mix("#4a5436", "#68704a", t), "#3a3f32", smoothstep(0.6, 0.85, noise(p, 0.35, 9)) * 0.7);
    return mix(base, "#8a8f8a", Math.max(0, n.y) * 0.12);
  }),
  { size: 0.8, aspect: 0.6, rivets: 0.2 },
);
const ARMOUR = panelled(metal("iron", { tarnish: 0.5, size: 0.4 }), { size: 0.6, rivets: 0.15 });
const GUNMETAL = metal("blued", { polish: 0.5 });
const TRIM = countershade("#3b4034", "#1c1e1a");

const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${HAZ}"/>${[0, 16, 32, 48, 64]
    .map((x) => `<polygon points="${x},16 ${x + 8},16 ${x + 16},0 ${x + 8},0" fill="#111"/>`)
    .join("")}</svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="44" fill="#14161a" stroke="#e8e8e0" stroke-width="5"/><path d="M14 56 L82 40" stroke="${CYAN}" stroke-width="8"/><path d="M14 66 L82 50" stroke="${CYAN}" stroke-width="4"/><polygon points="70,24 90,40 66,42" fill="#e8e8e0"/><text x="48" y="86" font-family="Arial" font-weight="900" font-size="14" fill="#e8e8e0" text-anchor="middle">RG-6</text></svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#04141a"/><g stroke="#0f5565">${[30, 60, 90, 120]
    .map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`)
    .join("")}${[25, 50, 75].map((y) => `<line x1="0" y1="${y}" x2="160" y2="${y}"/>`).join("")}</g><circle cx="80" cy="50" r="24" fill="none" stroke="${CYAN}" stroke-width="3"/><line x1="48" y1="50" x2="112" y2="50" stroke="${CYAN}" stroke-width="2"/><line x1="80" y1="18" x2="80" y2="82" stroke="${CYAN}" stroke-width="2"/><text x="6" y="14" font-family="monospace" font-size="11" fill="${CYAN}">CHARGE 94%</text><rect x="6" y="86" width="100" height="7" fill="#0f5565"/><rect x="6" y="86" width="82" height="7" fill="${CYAN}"/></svg>`,
  { size: 320 },
);
const WARN = svg(
  `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="${HAZ}" stroke="#111" stroke-width="6"/><polygon points="52,28 36,56 48,56 42,78 62,46 50,46 56,28" fill="#111"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const chassis = b.joint("chassis", { at: [0, 1.0, 0], role: "spine" });

  // ---------- frame and hull
  for (const s of [1, -1]) b.part(bx(0.3, 0.36, 8.6), GUN, { bone: chassis, at: [s * 0.8, 1.0, -0.2] });
  for (const z of [3.9, 1.8, -0.6, -2.6, -4.4]) b.part(bx(2.0, 0.3, 0.3), GUN, { bone: chassis, at: [0, 0.95, z] });
  // lower hull
  b.part(bx(2.7, 0.7, 8.2), HULL, { bone: chassis, at: [0, 1.5, -0.3] });
  // rear deck, angled sides
  b.part(bx(2.9, 0.5, 5.4), HULL, { bone: chassis, at: [0, 2.0, -2.0] });
  for (const s of [1, -1]) {
    b.part(bx(0.12, 0.6, 5.2), ARMOUR, { bone: chassis, at: [s * 1.48, 1.75, -2.0], rotation: [0, 0, s * -8] });
    // wheel arches
    for (const z of [2.8, 0.5, -1.8]) {
      b.part(bx(0.6, 0.12, 1.7), TRIM, { bone: chassis, at: [s * 1.42, 1.38, z] });
      b.part(bx(0.1, 0.5, 1.7), ARMOUR, { bone: chassis, at: [s * 1.62, 1.12, z] });
    }
    // side storage lockers with hazard stripe
    b.part(bx(0.2, 0.5, 1.4), ARMOUR, { bone: chassis, at: [s * 1.58, 1.95, -3.2] });
    b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", {
      bone: chassis, at: [s * 1.69, 1.95, -3.2], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: HAZARD,
    });
    b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
      bone: chassis, at: [s * 1.5, 2.0, -0.6 + 0.0], dir: [s, 0, 0], axis: "z", texture: EMBLEM,
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
      bone: chassis, at: [s * 1.5, 1.6, 3.3], dir: [s, 0, 0], axis: "z", texture: WARN,
    });
    // grab rails and tow hooks
    b.rod([s * 1.5, 2.3, -4.2], [s * 1.5, 2.3, -0.2], 0.03, STEEL, { bone: chassis, sides: 6 });
    for (const z of [-4.2, -2.2, -0.2]) b.rod([s * 1.5, 2.25, z], [s * 1.5, 2.3, z], 0.03, STEEL, { bone: chassis, sides: 6 });
  }
  // rear deck top plating and hatches
  b.part(bx(2.5, 0.08, 5.0), ARMOUR, { bone: chassis, at: [0, 2.28, -2.0] });
  b.part(cy(0.55, 0.12, 12), STEEL, { bone: chassis, at: [0, 2.36, -1.3], flat: true }); // turret ring
  b.part(new THREE.TorusGeometry(0.58, 0.05, 6, 16), GUN, { bone: chassis, at: [0, 2.4, -1.3], rotation: [90, 0, 0] });
  for (const s of [1, -1]) {
    b.part(cy(0.2, 0.1, 8), STEEL, { bone: chassis, at: [s * 0.9, 2.37, -3.6], flat: true });
    b.part(bx(0.5, 0.06, 0.4), GUN, { bone: chassis, at: [s * 0.9, 2.35, -2.6] });
  }
  // rear power module: generator housing with vents
  b.part(bx(2.2, 0.8, 1.4), HULL, { bone: chassis, at: [0, 2.7, -4.0] });
  for (let i = 0; i < 6; i++) b.part(bx(1.5, 0.04, 0.05), DARK, { bone: chassis, at: [0, 2.5 + i * 0.1, -4.72] });
  glow(b.part(bx(0.6, 0.1, 0.04), AMBER, { bone: chassis, at: [0.6, 3.0, -4.72] }));
  for (const s of [1, -1]) {
    b.part(cy(0.12, 0.7, 8), STEEL, { bone: chassis, at: [s * 0.8, 3.25, -4.3] }); // exhaust stacks
    b.part(cy(0.15, 0.06, 8), DARK, { bone: chassis, at: [s * 0.8, 3.62, -4.3] });
  }
  // rear bumper
  b.part(bx(2.9, 0.3, 0.2), GUN, { bone: chassis, at: [0, 1.0, -4.7] });
  for (const s of [1, -1]) glow(b.part(bx(0.3, 0.12, 0.05), "#ff3a2a", { bone: chassis, at: [s * 1.1, 1.5, -4.43] }));

  // ---------- cab
  b.part(bx(2.7, 1.2, 1.9), HULL, { bone: chassis, at: [0, 2.3, 3.0] }); // cab block
  b.part(bx(2.5, 0.12, 1.5), ARMOUR, { bone: chassis, at: [0, 2.95, 2.9] }); // roof
  b.part(bx(2.7, 0.8, 1.3), HULL, { bone: chassis, at: [0, 1.5, 3.65] }); // nose
  b.part(bx(2.4, 0.9, 0.08), ARMOUR, { bone: chassis, at: [0, 1.6, 4.33], rotation: [-18, 0, 0] }); // glacis
  b.part(bx(2.2, 0.55, 0.06), "#2b4a56", { bone: chassis, at: [0, 2.55, 3.98], rotation: [-16, 0, 0] }); // windscreen
  b.part(bx(2.2, 0.06, 0.1), DARK, { bone: chassis, at: [0, 2.82, 3.95] });
  b.part(bx(0.06, 0.55, 0.1), DARK, { bone: chassis, at: [0, 2.55, 4.0] });
  for (const s of [1, -1]) {
    b.part(bx(0.05, 0.5, 1.2), "#2b4a56", { bone: chassis, at: [s * 1.36, 2.55, 3.0] }); // side windows
    b.part(bx(0.06, 0.8, 0.9), ARMOUR, { bone: chassis, at: [s * 1.38, 2.1, 3.2] }); // door armour
    b.part(bx(0.06, 0.06, 0.2), STEEL, { bone: chassis, at: [s * 1.42, 2.1, 2.7] });
    // mirrors
    b.rod([s * 1.35, 2.7, 3.7], [s * 1.75, 2.8, 3.8], 0.025, STEEL, { bone: chassis, sides: 5 });
    b.part(bx(0.06, 0.3, 0.2), DARK, { bone: chassis, at: [s * 1.78, 2.8, 3.8] });
    // headlights
    b.part(bx(0.55, 0.22, 0.12), DARK, { bone: chassis, at: [s * 0.9, 1.35, 4.3] });
    glow(b.part(bx(0.45, 0.12, 0.05), CYAN, { bone: chassis, at: [s * 0.9, 1.35, 4.37] }), 1.4);
    // bumper wings
    b.part(bx(0.4, 0.4, 0.4), GUN, { bone: chassis, at: [s * 1.3, 1.05, 4.3] });
  }
  // grille and bumper
  b.part(bx(1.4, 0.45, 0.1), DARK, { bone: chassis, at: [0, 1.4, 4.38] });
  for (let i = 0; i < 5; i++) b.part(bx(1.3, 0.025, 0.04), STEEL, { bone: chassis, at: [0, 1.25 + i * 0.09, 4.45] });
  b.part(bx(2.9, 0.3, 0.3), GUN, { bone: chassis, at: [0, 1.0, 4.4] });
  b.part(new THREE.PlaneGeometry(2.6, 0.2), "#ffffff", { bone: chassis, at: [0, 1.0, 4.56], dir: [0, 0, 1], axis: "z", texture: HAZARD });
  // roof gear: light bar, sensor dome, radar
  b.part(bx(1.6, 0.1, 0.2), DARK, { bone: chassis, at: [0, 3.06, 3.5] });
  for (const x of [-0.6, -0.2, 0.2, 0.6]) glow(b.part(bx(0.28, 0.06, 0.04), AMBER, { bone: chassis, at: [x, 3.08, 3.61] }));
  b.part(new THREE.SphereGeometry(0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), "#35525c", { bone: chassis, at: [0.8, 3.0, 2.5], flat: true });
  b.part(cy(0.35, 0.06, 10), GUN, { bone: chassis, at: [0.8, 3.0, 2.5], flat: true });
  b.rod([-0.9, 3.0, 2.3], [-0.9, 3.9, 2.3], 0.03, STEEL, { bone: chassis, sides: 5 }); // whip antenna
  b.part(new THREE.SphereGeometry(0.05, 6, 4), AMBER, { bone: chassis, at: [-0.9, 3.92, 2.3] });
  b.part(bx(0.9, 0.5, 0.05), GUN, { bone: chassis, at: [-0.4, 3.3, 2.0], rotation: [-10, 0, 0] }); // radar panel
  b.rod([-0.4, 3.0, 2.0], [-0.4, 3.1, 2.0], 0.05, STEEL, { bone: chassis, sides: 6 });

  // ---------- wheels
  const wz = [2.8, 0.5, -1.8];
  for (const s of [1, -1]) {
    wz.forEach((z, i) => {
      const side = s > 0 ? "L" : "R";
      const hub: [number, number, number] = [s * 1.45, 0.6, z];
      const w = b.joint(`wheel${side}${i}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" });
      const R = [0, 0, 90] as [number, number, number];
      b.part(cy(0.62, 0.55, 14), TYRE, { bone: w, at: hub, rotation: R, flat: true });
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        b.part(bx(0.58, 0.1, 0.16), TYRE, {
          bone: w, at: [hub[0], hub[1] + 0.64 * Math.cos(a), z + 0.64 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      b.part(cy(0.36, 0.58, 10), "#5a6068", { bone: w, at: hub, rotation: R, flat: true });
      b.part(cy(0.14, 0.64, 8), STEEL, { bone: w, at: [hub[0] + s * 0.03, hub[1], z], rotation: R });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        b.part(cy(0.025, 0.05, 6), DARK, {
          bone: w, at: [s * 1.76, hub[1] + 0.26 * Math.cos(a), z + 0.26 * Math.sin(a)], rotation: R,
        });
      }
      // axle and mudflap
      b.rod([0, 0.6, z], [s * 1.2, 0.6, z], 0.1, GUN, { bone: chassis, sides: 8 });
      b.part(bx(0.05, 0.4, 0.5), TYRE, { bone: chassis, at: [s * 1.62, 0.5, z - 0.8] });
    });
  }
  b.part(bx(1.0, 0.35, 0.6), GUN, { bone: chassis, at: [0, 0.65, 0.5] }); // diff housings
  b.part(bx(1.0, 0.35, 0.6), GUN, { bone: chassis, at: [0, 0.65, -1.8] });

  // ---------- stabiliser legs (4, deployed)
  for (const s of [1, -1])
    [1.7, -3.0].forEach((z, i) => {
      const side = s > 0 ? "L" : "R";
      const j = b.joint(`stabiliser${side}${i}`, { parent: chassis, at: [s * 1.4, 1.3, z], dir: [0, -1, 0], role: "leg" });
      b.part(bx(1.4, 0.3, 0.45), ARMOUR, { bone: j, at: [s * 2.0, 1.3, z] }); // outrigger beam
      b.part(bx(0.6, 0.5, 0.65), GUN, { bone: j, at: [s * 1.5, 1.3, z] }); // slide housing
      b.part(cy(0.24, 0.5, 8), GUN, { bone: j, at: [s * 2.6, 1.25, z] }); // leg socket
      b.rod([s * 2.6, 1.2, z], [s * 2.6, 0.4, z], 0.17, STEEL, { bone: j, sides: 8 }); // piston
      b.rod([s * 2.6, 1.0, z], [s * 2.6, 0.5, z], 0.2, GUN, { bone: j, sides: 8 }); // cylinder collar
      b.rod([s * 2.6, 0.5, z], [s * 2.6, 0.12, z], 0.1, "#b8bec6", { bone: j, sides: 8 });
      b.part(cy(0.5, 0.16, 8), GUN, { bone: j, at: [s * 2.6, 0.06, z], flat: true }); // foot pad
      b.part(new THREE.SphereGeometry(0.16, 8, 5), STEEL, { bone: j, at: [s * 2.6, 0.2, z], flat: true });
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + 0.4;
        b.part(cy(0.03, 0.04, 6), STEEL, { bone: j, at: [s * 2.6 + 0.38 * Math.cos(a), 0.15, z + 0.38 * Math.sin(a)] });
      }
      // diagonal brace and amber beacon
      b.rod([s * 1.9, 1.15, z], [s * 2.6, 0.65, z], 0.05, STEEL, { bone: j, sides: 6 });
      glow(b.part(cy(0.07, 0.1, 6), AMBER, { bone: j, at: [s * 2.6, 1.55, z] }), 1.5);
      b.part(new THREE.PlaneGeometry(0.8, 0.14), "#ffffff", { bone: j, at: [s * 2.0, 1.3, z + 0.23], dir: [0, 0, 1], axis: "z", texture: HAZARD });
    });

  // ---------- turret and railgun
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.42, -1.3], dir: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("railPitch", { parent: yaw, at: [0, 3.2, -1.3], dir: [0, 0, 1], role: "hinge" });
  b.part(cy(0.85, 0.5, 10), HULL, { bone: yaw, at: [0, 2.7, -1.3], flat: true });
  b.part(bx(2.5, 0.9, 1.9), HULL, { bone: yaw, at: [0, 3.2, -1.3] }); // turret body
  for (const s of [1, -1]) {
    b.part(bx(0.45, 1.5, 2.2), ARMOUR, { bone: yaw, at: [s * 1.15, 3.4, -1.3] }); // cheek towers
    b.part(bx(0.5, 0.1, 2.2), GUN, { bone: yaw, at: [s * 1.15, 4.18, -1.3] });
    // capacitor drums beside the turret
    for (const z of [-1.9, -0.7]) {
      b.part(cy(0.3, 0.9, 10), "#3a4a52", { bone: yaw, at: [s * 1.7, 3.1, z], flat: true });
      glow(b.part(new THREE.TorusGeometry(0.31, 0.03, 5, 10), CYAN, { bone: yaw, at: [s * 1.7, 3.3, z], rotation: [90, 0, 0] }), 1.3);
      glow(b.part(new THREE.TorusGeometry(0.31, 0.03, 5, 10), CYAN, { bone: yaw, at: [s * 1.7, 2.9, z], rotation: [90, 0, 0] }), 1.3);
    }
    b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", { bone: yaw, at: [s * 1.41, 3.6, -1.3], dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    b.rod([s * 1.6, 3.5, -0.4], [s * 0.9, 3.1, -0.2], 0.05, GUN, { bone: yaw, sides: 6 });
  }
  // gunner screen on the turret back
  b.part(bx(0.9, 0.55, 0.05), "#101214", { bone: yaw, at: [0, 3.35, -2.27] });
  glow(b.part(new THREE.PlaneGeometry(0.8, 0.45), "#ffffff", { bone: yaw, at: [0, 3.35, -2.31], dir: [0, 0, -1], axis: "z", texture: SCREEN }), 1.3);
  // railgun breech and cradle
  b.part(bx(1.1, 0.9, 1.1), GUN, { bone: pitch, at: [0, 3.5, -0.55] });
  b.part(bx(1.4, 0.15, 1.6), STEEL, { bone: pitch, at: [0, 3.0, -0.9] });
  for (const s of [1, -1]) {
    b.part(bx(0.18, 0.28, 6.4), GUNMETAL, { bone: pitch, at: [s * 0.22, 3.65, 2.9] }); // rails
    b.part(bx(0.22, 0.06, 6.4), STEEL, { bone: pitch, at: [s * 0.22, 3.82, 2.9] });
    b.part(bx(0.06, 0.2, 6.2), "#1a1d22", { bone: pitch, at: [s * 0.32, 3.65, 2.9] });
  }
  glow(b.part(bx(0.26, 0.05, 6.2), CYAN, { bone: pitch, at: [0, 3.65, 2.9] }), 1.8); // plasma gap
  for (let i = 0; i < 6; i++) {
    const z = 0.4 + i * 1.1;
    b.part(bx(0.82, 0.12, 0.16), STEEL, { bone: pitch, at: [0, 3.9, z] });
    b.part(bx(0.82, 0.12, 0.16), STEEL, { bone: pitch, at: [0, 3.4, z] });
    for (const s of [1, -1]) {
      b.part(bx(0.06, 0.5, 0.16), STEEL, { bone: pitch, at: [s * 0.42, 3.65, z] });
      glow(b.part(cy(0.04, 0.03, 6), CYAN, { bone: pitch, at: [s * 0.42, 3.9, z + 0.09], rotation: [90, 0, 0] }));
    }
  }
  b.part(bx(0.9, 0.5, 0.35), DARK, { bone: pitch, at: [0, 3.65, 6.2] }); // muzzle block
  b.part(new THREE.TorusGeometry(0.36, 0.05, 5, 8), STEEL, { bone: pitch, at: [0, 3.65, 6.35] });
  for (const s of [1, -1]) {
    b.rod([s * 0.5, 3.1, -0.1], [s * 0.5, 3.4, 1.8], 0.06, STEEL, { bone: pitch, sides: 6 }); // recoil rods
    b.part(cy(0.12, 0.9, 8), GUN, { bone: pitch, at: [s * 0.5, 3.15, 0.2], rotation: [90, 0, 0] });
  }
  // power cable from deck to breech
  b.sweep(
    catmull([[0.4, 2.5, -3.5], [0.5, 2.9, -2.8], [0.55, 3.3, -1.8], [0.3, 3.5, -0.8]]),
    0.05,
    DARK,
    { bone: yaw, sides: 6 },
  );
  b.sweep(
    catmull([[-0.4, 2.5, -3.5], [-0.5, 2.9, -2.8], [-0.55, 3.3, -1.8], [-0.3, 3.5, -0.8]]),
    0.05,
    "#2a3138",
    { bone: yaw, sides: 6 },
  );
  // travel rest on the cab roof
  b.part(bx(1.2, 0.2, 0.3), GUN, { bone: chassis, at: [0, 3.15, 3.0] });

  b.pose(pitch, { axis: [1, 0, 0], deg: -7 });
  return b.root;
}
