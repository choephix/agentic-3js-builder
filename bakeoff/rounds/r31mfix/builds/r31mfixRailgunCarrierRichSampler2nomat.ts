import * as THREE from "three";
import { createBuilder, rng, svg, mix, noise, paint, patches, stripes, polyline, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "A 6x6 military carrier with a cab-over cab, a rotating railgun turret with glowing rails, and four deployed stabiliser legs. Low-poly sci-fi.",
};

// ---------------------------------------------------------------- palette
const OLIVE = "#5d6b47";
const DARKOL = "#3f4a30";
const SAND = "#8d8a5c";
const STEEL = "#6b7077";
const LSTEEL = "#9aa0a8";
const DARK = "#2a2d31";
const BLACK = "#17181b";
const YELLOW = "#e0b520";
const CYAN = "#4de8ff";
const GLASS = "#21404d";
const RED = "#c0332a";
const TYRE = "#1d1e20";
const MUD = "#5b4a35";

// ---------------------------------------------------------------- paints
const CAMO = patches(OLIVE, [DARKOL, "#7d8458", OLIVE], { size: 1.1, gap: 0.02, seed: 4 });
const HULL = panelled(CAMO, { size: 0.9, aspect: 0.6, rivets: 0.06 });
const DIRTY = paint((p, n) => (p.y < 0.95 + 0.25 * noise(p, 0.3, 4) ? MUD : HULL));
const DECK = panelled(stripes(DARKOL, "#34402a", { size: 0.4, axis: "x", wobble: 0.2 }), { size: 0.7, rivets: 0.08 });
const HAZARD = stripes(BLACK, YELLOW, { size: 0.14, axis: [1, 0, 1], width: 0.55, wobble: 0, seed: 2 });
const GUNMETAL = paint((p, n) => {
  const t = noise(p, 0.25, 9);
  return mix("#3b4048", "#6c737d", t * 0.7 + (n.y > 0.5 ? 0.25 : 0));
});

// ---------------------------------------------------------------- textures
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1c2216" stroke="#e0b520" stroke-width="4"/>
  <path d="M32 9 L38 26 L56 26 L42 37 L47 55 L32 44 L17 55 L22 37 L8 26 L26 26Z" fill="#e0b520"/>
  <path d="M10 32 H54" stroke="#4de8ff" stroke-width="3"/><path d="M28 32 H64" stroke="#4de8ff" stroke-width="0"/></svg>`,
  { size: 128 },
);
const MARK = svg(
  `<svg viewBox="0 0 128 48"><rect width="128" height="48" rx="4" fill="none"/>
  <text x="64" y="34" font-family="monospace" font-weight="bold" font-size="30" text-anchor="middle" fill="#e8e4c8">RC-06</text>
  <rect x="6" y="40" width="116" height="4" fill="#e0b520"/></svg>`,
  { size: 192 },
);
const WARN = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="4" fill="#e0b520" stroke="#17181b" stroke-width="4"/>
  <path d="M32 10 L56 52 H8Z" fill="none" stroke="#17181b" stroke-width="5" stroke-linejoin="round"/>
  <path d="M35 22 L26 36 H33 L29 47 L40 31 H33Z" fill="#17181b"/></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#06240f"/>
  <path d="M0 30 L10 26 L18 28 L28 14 L38 22 L48 8 L64 16" stroke="#6dff8a" stroke-width="2" fill="none"/>
  <circle cx="48" cy="8" r="3" fill="#ff5a4a"/>
  <path d="M0 10H64M0 20H64M0 30H64M16 0V40M32 0V40M48 0V40" stroke="#1f6e36" stroke-width="0.8"/>
  <rect x="4" y="33" width="24" height="4" fill="#6dff8a"/></svg>`,
  { size: 128 },
);
const BAND = svg(
  `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#17181b"/>
  <path d="M-8 32 L16 0 H28 L4 32Z M16 32 L40 0 H52 L28 32Z" fill="#e0b520"/></svg>`,
  { size: 64 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const R = rng(5);

  const chassis = b.joint("chassis", { at: [0, 1.0, 0], role: "spine" });

  // ---- geometry helpers
  const bx = (w: number, h: number, d: number, col: any, at: number[], bone: any = chassis, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...o });
  const cy = (r: number, h: number, col: any, at: number[], bone: any = chassis, axis = "y", sides = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), col, {
      bone,
      at,
      rotation: axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0],
      ...o,
    });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], bone: any = chassis) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ================================================================ hull
  bx(2.3, 0.5, 7.1, DIRTY, [0, 1.25, -1.15]); // lower hull
  bx(2.0, 0.1, 7.0, DARK, [0, 0.95, -1.15]); // belly plate
  for (const s of [1, -1]) {
    bx(0.12, 0.2, 7.2, HAZARD, [s * 1.16, 1.12, -1.15]); // hazard sill
    bx(0.14, 0.22, 7.0, DARK, [s * 1.0, 0.95, -1.15]); // frame rail
  }
  bx(2.3, 0.12, 7.1, DECK, [0, 1.56, -1.15]); // deck
  for (const s of [1, -1]) {
    bx(0.08, 0.18, 5.4, STEEL, [s * 1.16, 1.71, -1.9]); // deck rail
    for (let i = 0; i < 6; i++) bx(0.08, 0.3, 0.1, STEEL, [s * 1.16, 1.65, -4.4 + i * 1.0]); // stanchions
  }

  // ================================================================ cab
  b.extrude(
    [
      [2.4, 1.0],
      [4.55, 1.0],
      [4.55, 1.7],
      [4.0, 2.0],
      [3.5, 2.9],
      [2.4, 2.9],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.06, color: HULL, bone: chassis },
  );
  // windscreen (raked) and side glass
  b.slab(
    [
      [-0.95, 2.06, 3.97],
      [0.95, 2.06, 3.97],
      [0.95, 2.82, 3.55],
      [-0.95, 2.82, 3.55],
    ].map((p) => [p[0], p[1] + 0.012, p[2] + 0.02]),
    { color: GLASS, thickness: 0.05, bone: chassis },
  );
  bx(1.9, 0.05, 0.05, BLACK, [0, 2.44, 3.76], chassis, { rotation: [-60, 0, 0] });
  for (const s of [1, -1]) {
    bx(0.04, 0.55, 0.95, GLASS, [s * 1.17, 2.45, 3.0]);
    bx(0.06, 0.6, 0.06, BLACK, [s * 1.17, 2.45, 2.5]);
    plane(0.8, 0.8, EMBLEM, [s * 1.18, 1.55, 3.35], [s, 0, 0]);
    plane(1.1, 0.41, MARK, [s * 1.18, 1.25, 2.75], [s, 0, 0]);
    bx(0.05, 0.12, 0.3, LSTEEL, [s * 1.19, 1.9, 3.7]); // door handle
    // mirror
    b.rod([s * 1.15, 2.3, 3.8], [s * 1.5, 2.45, 3.9], 0.03, STEEL, { bone: chassis, sides: 6 });
    bx(0.08, 0.4, 0.26, DARK, [s * 1.52, 2.45, 3.92]);
    bx(0.02, 0.34, 0.2, GLASS, [s * 1.52, 2.45, 3.99]);
    // wheel fenders + flaps
    for (const z of [3.2, 0.5, -1.4]) {
      bx(0.75, 0.08, 1.7, HULL, [s * 1.45, 1.4, z]);
      bx(0.75, 0.08, 0.1, DARK, [s * 1.45, 1.3, z + 0.86], chassis, { rotation: [30, 0, 0] });
      bx(0.62, 0.5, 0.06, TYRE, [s * 1.45, 0.95, z - 0.95]); // mud flap
    }
    // headlights
    glow(bx(0.5, 0.2, 0.05, "#fff3b0", [s * 0.82, 1.55, 4.57]), 1.2);
    bx(0.6, 0.06, 0.1, DARK, [s * 0.82, 1.7, 4.57]);
    // tow hooks
    bx(0.14, 0.14, 0.3, RED, [s * 0.7, 0.95, 4.65]);
    // exhaust stack behind cab
    b.rod([s * 1.0, 1.6, 2.2], [s * 1.0, 3.35, 2.2], 0.1, DARK, { bone: chassis, sides: 8 });
    cy(0.14, 0.9, STEEL, [s * 1.0, 2.0, 2.2], chassis, "y", 8);
    cy(0.13, 0.08, BLACK, [s * 1.0, 3.38, 2.2]);
    // smoke launchers on the cab sides
    for (let i = 0; i < 3; i++) b.rod([s * 1.1, 2.7, 2.7 + i * 0.12], [s * 1.28, 2.9, 2.9 + i * 0.12], 0.045, DARK, { bone: chassis, sides: 6 });
  }
  // nose
  bx(2.2, 0.55, 0.12, DARK, [0, 1.35, 4.59]); // grille
  for (let i = 0; i < 6; i++) bx(1.7, 0.04, 0.05, LSTEEL, [0, 1.15 + i * 0.09, 4.66]);
  b.frustumBox([0, 0.95, 4.55], [0, 0.95, 4.95], [2.6, 0.4], [2.4, 0.22], { bone: chassis, color: STEEL });
  bx(2.6, 0.12, 0.1, HAZARD, [0, 1.15, 4.6]);
  // roof gear
  bx(1.8, 0.14, 0.3, DARK, [0, 3.0, 3.65]);
  for (let i = 0; i < 4; i++) glow(bx(0.34, 0.08, 0.05, "#ffe9a0", [-0.65 + i * 0.43, 3.0, 3.82]), 1.2);
  cy(0.3, 0.12, STEEL, [0.6, 3.0, 2.8], chassis, "y", 10);
  b.part(new THREE.SphereGeometry(0.25, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: chassis, at: [0.6, 3.05, 2.8], flat: true });
  b.spike([-0.8, 2.95, 2.6], [0, 1, 0], 1.4, 0.02, LSTEEL, { bone: chassis, sides: 5 });
  b.rod([-0.5, 2.95, 2.6], [-0.5, 3.2, 2.6], 0.03, STEEL, { bone: chassis, sides: 5 });
  // rear cab wall: pipes + armour plate
  bx(2.3, 0.2, 0.2, HAZARD, [0, 2.8, 2.35]);

  // ================================================================ wheels (6x6)
  const axles = [3.2, 0.5, -1.4];
  for (const s of [1, -1]) {
    axles.forEach((z, ai) => {
      const front = ai === 0;
      const hub = [s * 1.45, 0.6, z];
      const side = s > 0 ? "L" : "R";
      const steer = front
        ? b.joint(`steer${side}`, { parent: chassis, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" })
        : chassis;
      const spin = b.joint(`wheel${side}${ai + 1}`, { parent: steer, at: hub, dir: [s, 0, 0], role: "hinge" });
      // axle stub to hull
      cy(0.1, 0.5, DARK, [s * 1.2, 0.6, z], chassis, "x", 8);
      if (front) bx(0.2, 0.3, 0.3, DARK, [s * 1.2, 0.8, z], chassis);
      cy(0.62, 0.52, TYRE, hub, spin, "x", 16, { flat: true });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        for (const dx of [-0.13, 0.13])
          bx(0.22, 0.1, 0.32, TYRE, [hub[0] + dx, hub[1] + 0.64 * Math.cos(a), hub[2] + 0.64 * Math.sin(a)], spin, {
            rotation: [(a * 180) / Math.PI + (dx > 0 ? 8 : -8), 0, 0],
          });
      }
      cy(0.38, 0.56, STEEL, hub, spin, "x", 12, { flat: true }); // rim
      cy(0.3, 0.1, DARK, [hub[0] + s * 0.28, hub[1], hub[2]], spin, "x", 12, { flat: true });
      cy(0.12, 0.14, LSTEEL, [hub[0] + s * 0.34, hub[1], hub[2]], spin, "x", 8, { flat: true });
      glow(cy(0.05, 0.05, CYAN, [hub[0] + s * 0.42, hub[1], hub[2]], spin, "x", 6));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        cy(0.025, 0.05, LSTEEL, [hub[0] + s * 0.34, hub[1] + 0.22 * Math.cos(a), hub[2] + 0.22 * Math.sin(a)], spin, "x", 6);
      }
    });
  }

  // ================================================================ stabiliser legs
  const legSpots: [string, number, number][] = [
    ["FL", 1, 1.8],
    ["FR", -1, 1.8],
    ["RL", 1, -3.4],
    ["RR", -1, -3.4],
  ];
  for (const [nm, s, z] of legSpots) {
    const arm = b.joint(`outriggerArm${nm}`, { parent: chassis, at: [s * 1.1, 1.25, z], dir: [s, 0, 0], role: "hinge" });
    const leg = b.joint(`stab${nm}`, { parent: arm, at: [s * 2.0, 1.25, z], dir: [0, -1, 0], role: "leg" });
    bx(1.0, 0.36, 0.55, HULL, [s * 1.5, 1.25, z], arm); // beam housing
    bx(0.9, 0.06, 0.58, HAZARD, [s * 1.5, 1.45, z], arm);
    cy(0.07, 0.7, LSTEEL, [s * 1.6, 1.25, z + 0.34], arm, "x", 6); // ram
    // sleeve + piston
    cy(0.2, 0.7, DARK, [s * 2.0, 1.1, z], leg, "y", 8);
    cy(0.205, 0.22, "#ffffff", [s * 2.0, 1.28, z], leg, "y", 10, { texture: BAND });
    cy(0.13, 1.1, LSTEEL, [s * 2.0, 0.65, z], leg, "y", 8);
    b.part(new THREE.SphereGeometry(0.17, 6, 4), DARK, { bone: leg, at: [s * 2.0, 0.22, z], flat: true });
    cy(0.5, 0.14, STEEL, [s * 2.0, 0.07, z], leg, "y", 8, { flat: true }); // foot pad
    cy(0.5, 0.05, HAZARD, [s * 2.0, 0.16, z], leg, "y", 8, { flat: true });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      bx(0.16, 0.05, 0.12, DARK, [s * 2.0 + 0.4 * Math.cos(a), 0.0, z + 0.4 * Math.sin(a)], leg); // grousers
    }
    b.rod([s * 1.4, 1.0, z], [s * 2.0, 0.85, z + 0.12], 0.04, STEEL, { bone: leg, sides: 6 }); // brace
    glow(bx(0.05, 0.05, 0.05, CYAN, [s * 2.0, 1.5, z + 0.22], arm)); // status led
  }

  // ================================================================ rear power bank
  bx(2.0, 1.1, 1.3, HULL, [0, 2.2, -3.95]);
  bx(2.06, 0.08, 1.36, DARK, [0, 2.79, -3.95]);
  for (let i = 0; i < 6; i++) bx(1.8, 0.06, 0.14, STEEL, [0, 2.88, -4.5 + i * 0.2 + 0.2]); // cooling fins
  for (const s of [1, -1]) {
    glow(bx(0.04, 0.12, 0.9, CYAN, [s * 1.02, 2.4, -3.95]), 1.3);
    glow(bx(0.04, 0.12, 0.9, CYAN, [s * 1.02, 2.05, -3.95]), 1.3);
  }
  plane(0.7, 0.7, WARN, [0, 2.2, -4.61], [0, 0, -1]);
  for (const s of [1, -1]) glow(bx(0.3, 0.14, 0.05, RED, [s * 0.75, 1.75, -4.67]), 1.1);
  bx(0.4, 0.3, 0.3, DARK, [0, 1.3, -4.8]); // hitch
  b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), STEEL, { bone: chassis, at: [0, 1.3, -4.98] });
  // stowage and fuel
  for (const s of [1, -1]) {
    bx(0.3, 0.42, 1.0, DARK, [s * 1.05, 1.9, -2.1]);
    bx(0.32, 0.06, 1.02, HAZARD, [s * 1.05, 2.14, -2.1]);
  }

  // ================================================================ turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 1.62, -1.6], dir: [0, 1, 0], role: "hinge" });
  const P = [0, 3.4, -1.6];
  const pitch = b.joint("gunPitch", { parent: yaw, at: P, dir: [0, 0, 1], role: "hinge" });
  const recoil = b.joint("gunRecoil", { parent: pitch, at: P, dir: [0, 0, 1], role: "hinge" });
  // ring
  b.part(new THREE.TorusGeometry(1.1, 0.07, 5, 16), STEEL, { bone: chassis, at: [0, 1.66, -1.6], rotation: [90, 0, 0] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cy(0.04, 0.04, LSTEEL, [1.1 * Math.cos(a), 1.72, -1.6 + 1.1 * Math.sin(a)], chassis, "y", 6);
  }
  cy(1.05, 0.3, GUNMETAL, [0, 1.8, -1.6], yaw, "y", 12, { flat: true });
  bx(2.0, 0.9, 2.5, HULL, [0, 2.4, -1.6], yaw);
  bx(2.06, 0.1, 2.56, DARK, [0, 2.85, -1.6], yaw);
  bx(1.9, 0.55, 0.12, HULL, [0, 2.55, -0.28], yaw, { rotation: [-30, 0, 0] }); // sloped front armour
  bx(1.7, 0.7, 0.5, DARK, [0, 2.3, -2.95], yaw); // rear bustle
  for (const s of [1, -1]) {
    bx(0.18, 1.15, 1.7, HULL, [s * 0.72, 3.4, -1.6], yaw); // cheek plates
    bx(0.2, 0.08, 1.74, HAZARD, [s * 0.72, 3.98, -1.6], yaw);
    cy(0.2, 0.26, LSTEEL, [s * 0.84, 3.4, -1.6], yaw, "x", 10, { flat: true }); // trunnion cap
    plane(1.2, 0.45, MARK, [s * 1.02, 2.4, -1.6], [s, 0, 0], yaw);
    plane(0.3, 0.3, EMBLEM, [s * 1.02, 2.3, -0.8], [s, 0, 0], yaw);
    // sensor pod
    bx(0.3, 0.3, 0.4, DARK, [s * 0.95, 3.0, -0.65], yaw);
    glow(cy(0.07, 0.04, CYAN, [s * 0.95, 3.0, -0.43], yaw, "z", 8), 1.4);
    // elevation ram
    b.rod([s * 0.55, 2.75, -2.4], [s * 0.55, 3.2, -1.5], 0.07, STEEL, { bone: yaw, sides: 6 });
    // smoke dischargers
    for (let i = 0; i < 3; i++) cy(0.05, 0.3, DARK, [s * 1.0, 2.95, -2.3 - i * 0.14], yaw, "y", 6);
  }
  const screen = plane(0.7, 0.44, SCREEN, [0, 2.35, -2.88], [0, 0, 1], yaw);
  void screen;
  plane(0.7, 0.44, SCREEN, [0, 2.35, -2.9], [0, 0, -1], yaw); // placeholder rear display face
  // hatch
  cy(0.35, 0.1, STEEL, [0.45, 2.92, -2.2], yaw, "y", 12, { flat: true });
  b.rod([0.2, 2.97, -2.2], [0.7, 2.97, -2.2], 0.025, LSTEEL, { bone: yaw, sides: 5 });
  // cables from the power bank to the turret
  b.sweep(catmull([[0.5, 1.7, -3.4], [0.62, 1.95, -3.2], [0.4, 2.2, -3.05]]), 0.05, BLACK, { bone: yaw, sides: 6 });
  b.sweep(catmull([[-0.5, 1.7, -3.4], [-0.62, 1.95, -3.2], [-0.4, 2.2, -3.05]]), 0.05, BLACK, { bone: yaw, sides: 6 });

  // ---- railgun (relative to pivot P)
  const gz = (dz: number) => P[2] + dz;
  bx(0.9, 0.85, 1.5, GUNMETAL, [0, P[1], gz(-0.2)], pitch); // breech
  bx(0.7, 0.2, 1.1, HAZARD, [0, P[1] + 0.5, gz(-0.2)], pitch);
  cy(0.12, 1.6, LSTEEL, [0, P[1] - 0.5, gz(0.2)], pitch, "z", 8); // recoil buffer
  b.rod([0, P[1], gz(-1.0)], [0, P[1], gz(-1.5)], 0.18, DARK, { bone: pitch, sides: 8 }); // rear block
  glow(cy(0.16, 0.05, CYAN, [0, P[1], gz(-1.52)], pitch, "z", 10), 1.3);
  // rails
  for (const s of [1, -1]) {
    bx(0.24, 0.55, 7.4, GUNMETAL, [s * 0.2, P[1], gz(4.4)], recoil);
    bx(0.04, 0.5, 7.2, LSTEEL, [s * 0.33, P[1], gz(4.4)], recoil);
  }
  glow(bx(0.16, 0.34, 7.2, CYAN, [0, P[1], gz(4.4)], recoil), 1.6);
  // clamp frames
  for (let i = 0; i < 7; i++) {
    const dz = 1.0 + i * 1.1;
    bx(0.9, 0.1, 0.22, DARK, [0, P[1] + 0.33, gz(dz)], recoil);
    bx(0.9, 0.1, 0.22, DARK, [0, P[1] - 0.33, gz(dz)], recoil);
    for (const s of [1, -1]) bx(0.1, 0.6, 0.22, DARK, [s * 0.4, P[1], gz(dz)], recoil);
    glow(bx(0.5, 0.03, 0.05, CYAN, [0, P[1] + 0.39, gz(dz)], recoil), 1.2);
  }
  // capacitor drums with glow bands
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const dz = 1.6 + i * 1.3;
      cy(0.15, 1.0, GUNMETAL, [s * 0.58, P[1] - 0.08, gz(dz)], recoil, "z", 8);
      glow(b.part(new THREE.TorusGeometry(0.155, 0.03, 4, 8), CYAN, { bone: recoil, at: [s * 0.58, P[1] - 0.08, gz(dz)], rotation: [0, 0, 0] }), 1.3);
      b.rod([s * 0.58, P[1] - 0.08, gz(dz - 0.4)], [s * 0.35, P[1], gz(dz - 0.4)], 0.03, BLACK, { bone: recoil, sides: 5 });
    }
  // muzzle
  bx(1.1, 0.14, 0.34, DARK, [0, P[1] + 0.4, gz(8.15)], recoil);
  bx(1.1, 0.14, 0.34, DARK, [0, P[1] - 0.4, gz(8.15)], recoil);
  for (const s of [1, -1]) {
    bx(0.14, 0.9, 0.34, DARK, [s * 0.48, P[1], gz(8.15)], recoil);
    b.spike([s * 0.5, P[1] + 0.45, gz(8.2)], [s * 0.4, 0.3, 1], 0.4, 0.05, LSTEEL, { bone: recoil, sides: 5 });
  }
  glow(bx(0.7, 0.04, 0.05, CYAN, [0, P[1] + 0.34, gz(8.34)], recoil), 1.5);

  // ================================================================ final pose
  b.pose(pitch, { axis: [1, 0, 0], deg: -9 });
  void R;
  void polyline;
  void SAND;
  void RED;
  return b.root;
}
