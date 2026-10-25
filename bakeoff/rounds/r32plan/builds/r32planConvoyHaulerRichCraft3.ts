import * as THREE from "three";
import { createBuilder, svg, paint, mix, smoothstep } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured six-wheel hauler with a ram plow, roof turret and a sealed, neon-banded cargo pod.",
};

// ---------------------------------------------------------------- palette
const NAVY = "#252a38";
const PLATE = "#38425a";
const DARK = "#14161e";
const TIRE = "#101116";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const AMBER = "#ffb21a";
const RED = "#ff2638";
const BLUE = "#2a6bff";
const HAZ = "#ffd21a";
const STEEL = "#8a97b4";

// ---------------------------------------------------------------- textures
const WIND = svg(
  `<svg viewBox="0 0 100 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d4a66"/><stop offset="1" stop-color="#051a2c"/></linearGradient></defs>
  <rect width="100" height="40" fill="url(#g)"/>
  ${[6, 12, 18, 24, 30, 36].map((y) => `<rect x="0" y="${y}" width="100" height="1" fill="#19f0ff" opacity="0.18"/>`).join("")}
  <path d="M8 30 L30 12 L36 12 L14 30Z" fill="#fff" opacity="0.14"/>
  <rect x="62" y="8" width="28" height="3" fill="#19f0ff"/><rect x="62" y="14" width="18" height="3" fill="#ff2bd6"/>
  <circle cx="76" cy="27" r="6" fill="none" stroke="#19f0ff" stroke-width="1.5"/><circle cx="76" cy="27" r="1.5" fill="#19f0ff"/>
  <rect width="100" height="40" fill="none" stroke="#02070d" stroke-width="3"/></svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#0b0d13"/>
  ${[5, 15, 25, 35, 45].map((y) => `<rect x="4" y="${y - 2}" width="92" height="5" fill="#1d2230"/><rect x="4" y="${y + 3}" width="92" height="1.4" fill="#19f0ff"/>`).join("")}
  <rect x="42" y="14" width="16" height="22" fill="#14161e" stroke="#ff2bd6" stroke-width="2"/>
  <path d="M50 18 L55 27 L50 33 L45 27Z" fill="#ff2bd6"/>
  <rect width="100" height="50" fill="none" stroke="#38425a" stroke-width="4"/></svg>`,
  { size: 256 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 160 30"><rect width="160" height="30" fill="#ffd21a"/>
  ${Array.from({ length: 10 }, (_, i) => `<polygon points="${i * 20 - 6},30 ${i * 20 + 6},30 ${i * 20 + 22},0 ${i * 20 + 10},0" fill="#16171d"/>`).join("")}
  <rect width="160" height="30" fill="none" stroke="#16171d" stroke-width="3"/></svg>`,
  { size: 256 },
);
const HATCH = svg(
  `<svg viewBox="0 0 90 160"><rect width="90" height="160" fill="#161a26"/>
  <rect x="4" y="4" width="82" height="152" fill="none" stroke="#19f0ff" stroke-width="2.5"/>
  <polygon points="45,30 66,42 66,66 45,78 24,66 24,42" fill="#2a0f2f" stroke="#ff2bd6" stroke-width="3"/>
  <circle cx="45" cy="54" r="7" fill="#ff2bd6"/><path d="M45 38 V70 M31 46 L59 62 M59 46 L31 62" stroke="#161a26" stroke-width="2"/>
  <text x="45" y="104" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="15" fill="#ffd21a">SEALED</text>
  <text x="45" y="122" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#19f0ff">NO ENTRY / BIO-LOCK</text>
  <rect x="12" y="132" width="66" height="10" fill="#ffd21a"/>
  ${Array.from({ length: 6 }, (_, i) => `<polygon points="${12 + i * 12},142 ${18 + i * 12},142 ${24 + i * 12},132 ${18 + i * 12},132" fill="#16171d"/>`).join("")}
  </svg>`,
  { size: 256 },
);
const LOGO = svg(
  `<svg viewBox="0 0 180 90"><rect width="180" height="90" fill="#10131c"/>
  <rect x="3" y="3" width="174" height="84" fill="none" stroke="#ff2bd6" stroke-width="3"/>
  <path d="M14 20 L34 45 L14 70 L26 70 L46 45 L26 20Z" fill="#19f0ff"/><path d="M34 20 L54 45 L34 70 L40 70 L60 45 L40 20Z" fill="#ff2bd6"/>
  <text x="72" y="40" font-family="sans-serif" font-weight="bold" font-size="19" fill="#ffffff">NOMAD</text>
  <text x="72" y="62" font-family="sans-serif" font-weight="bold" font-size="15" fill="#19f0ff">FREIGHT</text>
  <text x="72" y="78" font-family="monospace" font-size="9" fill="#ffd21a">CONVOY 07 // ARMED</text></svg>`,
  { size: 256 },
);
const DOOR = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#232a3c"/><rect x="2" y="2" width="96" height="46" fill="none" stroke="#19f0ff" stroke-width="2"/>
  <text x="50" y="35" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff">C-07</text>
  <rect x="8" y="8" width="30" height="4" fill="#ff2bd6"/></svg>`,
  { size: 128 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#06243a"/><path d="M0 50 L40 0 L55 0 L15 50Z" fill="#19f0ff" opacity="0.2"/><rect width="100" height="50" fill="none" stroke="#02070d" stroke-width="5"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- paints
const HULL = panelled(
  paint((p, n) => {
    const base = mix("#2a2f3f", "#1f2230", smoothstep(0.2, 0.9, 0.5 + 0.5 * Math.sin(p.z * 3 + p.x * 2)));
    return mix(base, "#4a5778", Math.max(0, n.y) * 0.5);
  }),
  { size: 0.55, rivets: 0.12 },
);
const PODP = panelled(
  paint((p, n) => mix(mix("#2c4560", "#35567a", Math.sin(p.z * 5) * 0.5 + 0.5), "#6f8fb5", Math.max(0, n.y) * 0.45)),
  { size: 0.7, rivets: 0.14 },
);
const FRAME = metal("iron", { tarnish: 0.6, seed: 5 });

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0] });

  const box = (size: [number, number, number], at: [number, number, number], color: any, bone: any = chassis, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { bone, at, ...extra });
  const cyl = (r: number, h: number, seg: number, at: [number, number, number], dir: [number, number, number], color: any, bone: any = chassis) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });
  const lamp = (size: [number, number, number], at: [number, number, number], color: string, s = 1.2) =>
    glow(box(size, at, color), s);

  // -------- frame, deck
  box([2.1, 0.45, 9.2], [0, 0.98, -0.2], FRAME);
  box([2.7, 0.16, 5.5], [0, 1.3, -1.9], HULL);
  for (const s of [1, -1]) {
    box([0.12, 0.34, 5.5], [s * 1.33, 1.45, -1.9], PLATE);
    lamp([0.04, 0.04, 8.4], [s * 1.05, 0.78, -0.2], MAGENTA, 1.5); // underglow strip
  }

  // -------- wheels
  const axles: [string, number][] = [["F", 3.1], ["M", -1.6], ["R", -3.3]];
  for (const [id, z] of axles) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const X = s * 1.55;
      const w = b.joint(`wheel${id}${side}`, { parent: chassis, at: [X, 0.7, z], dir: [1, 0, 0] });
      cyl(0.7, 0.62, 12, [X, 0.7, z], [1, 0, 0], TIRE, w);
      cyl(0.72, 0.18, 12, [X, 0.7, z], [1, 0, 0], "#1a1c24", w);
      cyl(0.4, 0.66, 8, [X, 0.7, z], [1, 0, 0], STEEL, w);
      glow(cyl(0.17, 0.7, 8, [X, 0.7, z], [1, 0, 0], CYAN, w), 1.4);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.04, 0.72, 5, [X, 0.7 + Math.cos(a) * 0.28, z + Math.sin(a) * 0.28], [1, 0, 0], DARK, w);
      }
      // fender
      box([0.95, 0.14, 1.75], [X, 1.52, z], PLATE);
      box([0.12, 0.3, 1.75], [X + s * 0.42, 1.42, z], HULL);
    }
  }

  // -------- cab
  const cabOutline: [number, number][] = [
    [1.0, 1.2], [4.3, 1.2], [4.3, 2.0], [3.6, 2.9], [2.6, 3.1], [1.0, 3.1],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.06, color: HULL, bone: chassis });
  // windshield
  const wn = new THREE.Vector3(0, 0.9, 0.7).normalize();
  glow(
    b.part(new THREE.PlaneGeometry(2.1, 1.1), "#ffffff", {
      bone: chassis, at: [0, 2.45 + wn.y * 0.035, 3.95 + wn.z * 0.035], dir: [wn.x, wn.y, wn.z], axis: "z", texture: WIND,
    }),
    0.8,
  );
  box([2.3, 0.1, 0.5], [0, 2.98, 3.7], DARK, chassis, { rotation: [-52, 0, 0] });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(1.1, 0.55), "#ffffff", { bone: chassis, at: [s * 1.215, 2.5, 3.2], dir: [s, 0, 0], axis: "z", texture: SIDEWIN }), 0.7);
    b.part(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", { bone: chassis, at: [s * 1.215, 1.75, 2.2], dir: [s, 0, 0], axis: "z", texture: DOOR });
    // armour side plates
    box([0.14, 0.9, 1.6], [s * 1.25, 2.2, 1.7], PLATE);
    box([0.1, 0.12, 1.6], [s * 1.3, 1.7, 1.7], HAZ);
    // headlights
    lamp([0.5, 0.2, 0.1], [s * 0.95, 1.75, 4.33], "#e9fdff", 1.8);
    lamp([0.12, 0.5, 0.1], [s * 1.2, 1.7, 4.3], AMBER);
    // mirrors
    b.rod([s * 1.2, 2.5, 3.8], [s * 1.55, 2.6, 3.7], 0.035, DARK, { bone: chassis });
    box([0.08, 0.5, 0.3], [s * 1.6, 2.55, 3.7], DARK);
    glow(box([0.02, 0.4, 0.2], [s * 1.64, 2.55, 3.7], CYAN), 1);
    // exhaust stacks
    box([0.4, 0.4, 0.4], [s * 1.45, 1.55, 0.85], PLATE);
    cyl(0.12, 2.1, 8, [s * 1.45, 2.5, 0.85], [0, 1, 0], STEEL);
    cyl(0.16, 0.12, 8, [s * 1.45, 3.55, 0.85], [0, 1, 0], DARK);
    glow(cyl(0.09, 0.04, 8, [s * 1.45, 3.62, 0.85], [0, 1, 0], AMBER), 1.5);
    // fuel tanks
    cyl(0.35, 1.8, 8, [s * 1.3, 0.95, 1.2], [0, 0, 1], PLATE);
    box([0.1, 0.7, 0.12], [s * 1.3, 0.95, 0.55], DARK);
    box([0.1, 0.7, 0.12], [s * 1.3, 0.95, 1.85], DARK);
  }
  b.part(new THREE.PlaneGeometry(1.4, 0.7), "#ffffff", { bone: chassis, at: [0, 1.62, 4.312], dir: [0, 0, 1], axis: "z", texture: GRILLE });
  // bumper & plow
  box([2.8, 0.5, 0.4], [0, 1.0, 4.45], PLATE);
  b.extrude([[-1.6, 0], [1.6, 0], [1.4, 0.6], [-1.4, 0.6]], { at: [0, 0.4, 4.8], x: [1, 0, 0], thickness: 0.25, bevel: 0.03, color: DARK, bone: chassis });
  b.part(new THREE.PlaneGeometry(2.6, 0.42), "#ffffff", { bone: chassis, at: [0, 0.7, 4.93], dir: [0, 0, 1], axis: "z", texture: HAZARD });
  for (const s of [1, -1]) b.spike([s * 1.55, 0.75, 4.75], [0, 0, 1], 0.5, 0.1, { color: STEEL, bone: chassis });

  // roof: lightbar, sensor mast, antennas
  box([1.4, 0.14, 0.3], [0, 3.2, 2.95], DARK);
  lamp([0.62, 0.14, 0.32], [0.36, 3.22, 2.95], RED, 2);
  lamp([0.62, 0.14, 0.32], [-0.36, 3.22, 2.95], BLUE, 2);
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 3.1, 1.3], [s * 0.95, 4.7, 1.3], [0.04, 0.015], DARK, { bone: chassis });
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), s > 0 ? MAGENTA : CYAN, { bone: chassis, at: [s * 0.95, 4.72, 1.3] }), 2);
  }
  cyl(0.06, 0.6, 6, [-0.6, 3.4, 2.4], [0, 1, 0], DARK);
  b.part(new THREE.ConeGeometry(0.3, 0.14, 8), STEEL, { bone: chassis, at: [-0.6, 3.76, 2.4], dir: [0.3, 1, 0.5] });

  // -------- turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 3.1, 1.8], dir: [0, 1, 0] });
  const gun = b.joint("gun", { parent: yaw, at: [0, 3.5, 2.0], dir: [0, 0, 1] });
  cyl(0.55, 0.2, 10, [0, 3.2, 1.8], [0, 1, 0], DARK, yaw);
  b.part(new THREE.BoxGeometry(1.0, 0.5, 1.1), PLATE, { bone: yaw, at: [0, 3.5, 1.9] });
  b.part(new THREE.BoxGeometry(0.7, 0.2, 0.8), HULL, { bone: yaw, at: [0, 3.82, 1.85] });
  glow(b.part(new THREE.BoxGeometry(0.3, 0.12, 0.08), MAGENTA, { bone: yaw, at: [0, 3.55, 2.47] }), 2);
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 3.5, 2.3], [s * 0.3, 3.5, 3.7], 0.07, STEEL, { bone: gun });
    b.part(new THREE.BoxGeometry(0.2, 0.2, 0.3), DARK, { bone: gun, at: [s * 0.3, 3.5, 3.7] });
    box([0.16, 0.3, 0.5], [s * 0.3, 3.5, 2.3], DARK, gun);
    glow(box([0.04, 0.04, 0.9], [s * 0.52, 3.55, 2.0], CYAN), 1.5);
  }

  // -------- cargo pod
  b.lathe(
    [[0, 0], [0.8, 0.1], [1.2, 0.6], [1.2, 4.4], [0.8, 4.9], [0, 5.0]],
    { at: [0, 2.55, -4.3], axis: [0, 0, 1], segments: 8, color: PODP, bone: chassis },
  );
  for (const z of [-3.6, -1.8, 0.0]) {
    box([1.8, 0.3, 0.4], [0, 1.52, z], DARK); // cradle
    cyl(1.3, 0.34, 8, [0, 2.55, z], [0, 0, 1], DARK);
    glow(cyl(1.33, 0.05, 8, [0, 2.55, z - 0.22], [0, 0, 1], CYAN), 1.6);
    glow(cyl(1.33, 0.05, 8, [0, 2.55, z + 0.22], [0, 0, 1], CYAN), 1.6);
    for (const s of [1, -1]) box([0.2, 0.2, 0.3], [s * 1.3, 2.55, z], HAZ);
  }
  box([0.9, 0.1, 1.6], [0, 3.76, -1.8], DARK);
  b.part(new THREE.PlaneGeometry(0.9, 1.6), "#ffffff", { bone: chassis, at: [0, 3.82, -1.8], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: HATCH });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.9, 1.8), "#ffffff", { bone: chassis, at: [s * 1.25, 2.65, -1.8], texture: LOGO });
    box([0.08, 0.5, 0.5], [s * 1.2, 2.55, -3.9], PLATE);
    lamp([0.05, 0.08, 1.2], [s * 1.22, 2.0, -2.7], MAGENTA, 1.6);
  }
  // pod end beacons
  glow(b.part(new THREE.SphereGeometry(0.15, 6, 4), AMBER, { bone: chassis, at: [0, 3.2, 0.7] }), 2);
  glow(b.part(new THREE.SphereGeometry(0.15, 6, 4), AMBER, { bone: chassis, at: [0, 2.55, -4.3] }), 1.5);

  // -------- rear
  box([3.0, 0.4, 0.3], [0, 1.0, -4.75], PLATE);
  b.part(new THREE.PlaneGeometry(2.6, 0.3), "#ffffff", { bone: chassis, at: [0, 1.0, -4.91], dir: [0, 0, -1], axis: "z", texture: HAZARD });
  for (const s of [1, -1]) {
    lamp([0.6, 0.2, 0.1], [s * 1.1, 1.45, -4.62], RED, 2);
    box([0.1, 0.8, 0.1], [s * 1.5, 1.7, -4.55], DARK);
  }
  box([2.6, 0.12, 0.12], [0, 2.1, -4.55], DARK);

  return b.root;
}
