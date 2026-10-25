import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup converted to four hover thrusters: armored low-poly cyberpunk body, roof railgun, rear missile rack, neon underglow and glowing details.",
};

// ---------- palette ----------
const HULL_HI = [0.25, 0.29, 0.36] as const;
const HULL_LO = [0.1, 0.12, 0.17] as const;
const CAMO = [0.12, 0.27, 0.3] as const;
const MAG = [1, 0.18, 0.62] as const;
const DARK = "#0d0f17";
const METAL = "#262c3a";
const METAL2 = "#3a4256";
const YELLOW = "#e8c21a";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2fa0";
const RED = "#ff2a2a";
const ORANGE = "#ff8a1c";
const GLASS = "#0b6a80";

const D2R = Math.PI / 180;

// ---------- paints ----------
const BODY = paint((p, n) => {
  let c = mix(HULL_LO as any, HULL_HI as any, smoothstep(0.55, 1.9, p.y));
  c = mix(c, CAMO as any, smoothstep(0.56, 0.64, noise(p, 0.55, 3)) * 0.7);
  c = mix(c, [0.05, 0.06, 0.08], smoothstep(0.85, 0.5, p.y) * 0.6 + smoothstep(0.6, 0.7, noise(p, 0.1, 9)) * 0.12);
  if (n.y > 0.6 && Math.abs(Math.abs(p.x) - 0.3) < 0.03) c = MAG as any;
  if (n.y > 0.6) c = mix(c, [0.55, 0.62, 0.72], 0.18);
  return c;
});
const ARMOR = paint((p, n) => {
  const stripe = Math.floor((p.z + p.y * 1.0) / 0.14) % 2 === 0;
  const base = stripe ? "#d9b414" : "#14161e";
  return mix(base, [0.05, 0.05, 0.08], smoothstep(0.55, 0.7, noise(p, 0.12, 4)) * 0.4 + (n.y < -0.5 ? 0.3 : 0));
});
const PLATE = paint((p, n) =>
  mix(METAL, METAL2, smoothstep(0.3, 0.8, noise(p, 0.2, 7)) * 0.8 + (n.y > 0.5 ? 0.2 : 0)),
);

// ---------- textures ----------
const GRILLE = svg(
  `<svg viewBox="0 0 100 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="24" fill="#07080d" stroke="#19f0ff" stroke-width="1.5"/>
  ${[4, 8, 12, 16, 20].map((y) => `<rect x="3" y="${y}" width="94" height="1.6" fill="#1a4a58"/>`).join("")}
  <polygon points="50,2 60,12 50,22 40,12" fill="#07080d" stroke="#ff2fa0" stroke-width="2"/>
  <circle cx="50" cy="12" r="2.6" fill="#ff2fa0"/>
  <path d="M6 2v20M94 2v20" stroke="#19f0ff" stroke-width="1"/>
</svg>`,
  { size: 256 },
);
const FAN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="#10131c" stroke="#19f0ff" stroke-width="3"/>
  ${[0, 1, 2, 3, 4, 5, 6]
    .map(
      (i) =>
        `<path d="M50 50 L52 8 Q74 14 70 34 Z" fill="#2c3a52" stroke="#6fe8ff" stroke-width="1.2" transform="rotate(${i * (360 / 7)} 50 50)"/>`,
    )
    .join("")}
  <circle cx="50" cy="50" r="11" fill="#0a0c12" stroke="#ff2fa0" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="4" fill="#19f0ff"/>
</svg>`,
  { size: 192 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,3 90,22 90,52 50,66 10,52 10,22" fill="#0a0c14" stroke="#19f0ff" stroke-width="4"/>
  <polygon points="50,11 82,26 82,48 50,59 18,48 18,26" fill="none" stroke="#ff2fa0" stroke-width="1.8"/>
  <path d="M54 16 L36 38 L48 38 L42 58 L66 30 L53 30 Z" fill="#ffe14a" stroke="#0a0c14" stroke-width="1.5" stroke-linejoin="round"/>
  <text x="50" y="78" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#19f0ff">07</text>
</svg>`,
  { size: 256 },
);
const BEDTEXT = svg(
  `<svg viewBox="0 0 170 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="170" height="40" fill="#0a0c14" opacity="0.92"/>
  ${[0, 1, 2, 3].map((i) => `<path d="M${6 + i * 14} 6 l10 14 l-10 14 h-8 l10 -14 l-10 -14z" fill="#e8c21a"/>`).join("")}
  <text x="70" y="25" font-family="monospace" font-weight="bold" font-size="17" fill="#19f0ff">HEX//SEC</text>
  <rect x="70" y="30" width="92" height="2.5" fill="#ff2fa0"/>
  <rect x="2" y="2" width="166" height="36" fill="none" stroke="#19f0ff" stroke-width="1.5"/>
</svg>`,
  { size: 512 },
);
const PLATE_TEX = svg(
  `<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="24" rx="3" fill="#0b1018" stroke="#ff2fa0" stroke-width="2"/>
  <text x="30" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#ffe14a">NX-2077</text>
</svg>`,
  { size: 256 },
);
const RADAR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#06231f" stroke="#19f0ff" stroke-width="3"/>
  <circle cx="50" cy="50" r="30" fill="none" stroke="#19f0ff" stroke-width="1.5" opacity="0.7"/>
  <circle cx="50" cy="50" r="14" fill="none" stroke="#19f0ff" stroke-width="1.5" opacity="0.7"/>
  <path d="M50 50 L90 30" stroke="#7dffb0" stroke-width="3"/>
  <circle cx="70" cy="62" r="4" fill="#ff2fa0"/><circle cx="34" cy="30" r="3" fill="#ffe14a"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hover_technical" });
  const chassis = b.joint("chassis", { at: [0, 0.8, 0] });
  const turret = b.joint("turretYaw", { parent: chassis, at: [0, 1.9, -0.15], dir: [0, 1, 0] });
  const gun = b.joint("gunPitch", { parent: turret, at: [0, 2.2, -0.15], dir: [0, 0, 1], role: "hinge" });

  // ---------- helpers ----------
  const bx = (w: number, h: number, d: number, at: number[], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone: chassis, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: number[], color: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, bone: chassis, ...o });
  const side = (outline: any[], x: number, color: any, thick: number, o: any = {}) =>
    b.extrude(outline, { at: [x, 0, 0], x: [0, 0, 1], thickness: thick, color, bone: chassis, ...o });
  const plane = (w: number, h: number, at: number[], dir: number[], tex: any, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, bone: chassis, ...o });
  const lamp = (w: number, h: number, d: number, at: number[], color: string, s = 1.4, o: any = {}) =>
    glow(bx(w, h, d, at, color, o), s);

  // ---------- chassis & body ----------
  bx(1.7, 0.3, 5.3, [0, 0.62, 0], DARK);
  bx(1.4, 0.12, 5.0, [0, 0.46, 0], METAL); // belly plate
  // hood
  side(
    [
      [0.75, 0.7],
      [2.7, 0.7],
      [2.73, 1.0],
      [2.35, 1.22],
      [0.75, 1.3],
    ],
    0,
    BODY,
    1.95,
  );
  // cab
  side(
    [
      [-0.9, 0.7],
      [0.8, 0.7],
      [0.8, 1.3],
      [0.4, 1.85],
      [-0.7, 1.85],
      [-0.9, 1.3],
    ],
    0,
    BODY,
    1.85,
  );
  // roof plate and rails
  bx(1.7, 0.05, 1.05, [0, 1.865, -0.15], PLATE);
  // windshield
  glow(bx(1.62, 0.7, 0.03, [0, 1.582, 0.61], GLASS, { rotation: [-36, 0, 0] }), 0.5);
  glow(bx(1.0, 0.3, 0.03, [0, 1.55, -0.915], GLASS), 0.5); // rear window
  const win = [
    [-0.62, 1.45],
    [0.5, 1.45],
    [0.36, 1.75],
    [-0.62, 1.75],
  ];
  for (const s of [1, -1]) {
    glow(side(win, s * 0.935, GLASS, 0.02), 0.5);
    // door emblem and door seam
    plane(0.5, 0.4, [s * 0.928, 1.05, -0.05], [s, 0, 0], EMBLEM, {});
    bx(0.02, 0.62, 0.025, [s * 0.928, 1.1, 0.4], DARK);
    bx(0.02, 0.62, 0.025, [s * 0.928, 1.1, -0.5], DARK);
    bx(0.03, 0.05, 0.22, [s * 0.93, 1.3, 0.2], METAL2); // handle
    // side mirror
    bx(0.07, 0.2, 0.16, [s * 1.0, 1.55, 0.55], DARK);
    bx(0.05, 0.05, 0.12, [s * 0.96, 1.5, 0.55], METAL);
    // bed wall
    bx(0.08, 0.56, 1.9, [s * 0.93, 1.0, -1.83], BODY);
    plane(1.7, 0.4, [s * 0.972, 1.02, -1.83], [s, 0, 0], BEDTEXT, {});
    bx(0.12, 0.05, 1.95, [s * 0.93, 1.3, -1.83], METAL2); // rail cap
    // armored side skirts
    bx(0.14, 0.24, 3.9, [s * 1.0, 0.56, 0.05], ARMOR);
    // underglow strips
    glow(bx(0.06, 0.04, 4.4, [s * 0.88, 0.4, 0], MAGENTA), 1.6);
    // headlights
    lamp(0.32, 0.14, 0.05, [s * 0.75, 0.88, 2.72], "#cffaff", 1.8);
    lamp(0.32, 0.03, 0.05, [s * 0.75, 1.0, 2.72], MAGENTA, 1.4);
    // taillights
    lamp(0.22, 0.12, 0.06, [s * 0.82, 1.15, -2.79], RED, 1.5);
    // rear jet ducts
    cyl(0.2, 0.22, 0.3, 8, [s * 0.45, 0.9, -2.9], METAL, { rotation: [90, 0, 0] });
    glow(cyl(0.15, 0.15, 0.03, 8, [s * 0.45, 0.9, -3.06], CYAN, { rotation: [90, 0, 0] }), 2);
    // fender armor wedges
    side(
      [
        [1.5, 0.7],
        [2.6, 0.7],
        [2.5, 1.0],
        [1.5, 1.05],
      ],
      s * 0.99,
      ARMOR,
      0.08,
    );
    // hood vents
    for (let i = 0; i < 4; i++) glow(bx(0.25, 0.02, 0.05, [s * 0.62, 1.275 - i * 0.003, 1.2 + i * 0.16], CYAN), 1.2);
    // roll cage uprights
    for (const z of [-1.0, -2.3]) b.rod([s * 0.9, 1.28, z], [s * 0.9, 1.9, z], 0.035, METAL2, { bone: chassis });
  }
  // roll cage cross bars & roof braces
  for (const z of [-1.0, -2.3]) b.rod([-0.9, 1.9, z], [0.9, 1.9, z], 0.035, METAL2, { bone: chassis });
  for (const s of [1, -1]) b.rod([s * 0.9, 1.9, -1.0], [s * 0.9, 1.9, -2.3], 0.03, METAL2, { bone: chassis });
  // bed floor, tailgate, plate
  bx(1.85, 0.1, 1.95, [0, 0.74, -1.83], METAL);
  bx(1.95, 0.56, 0.08, [0, 1.0, -2.75], BODY);
  bx(1.99, 0.05, 0.12, [0, 1.3, -2.75], METAL2);
  plane(0.5, 0.2, [0, 0.9, -2.795], [0, 0, -1], PLATE_TEX);
  bx(1.95, 0.5, 0.08, [0, 1.0, -0.92], PLATE); // bed headboard

  // hood details
  bx(0.55, 0.13, 0.65, [0, 1.33, 1.5], PLATE); // scoop
  glow(bx(0.4, 0.03, 0.04, [0, 1.395, 1.78], ORANGE), 1.4);
  glow(bx(0.4, 0.03, 0.04, [0, 1.395, 1.22], ORANGE), 1.4);
  // grille
  plane(1.0, 0.26, [0, 0.85, 2.735], [0, 0, 1], GRILLE);
  // splitter / prow
  side(
    [
      [2.5, 0.3],
      [3.0, 0.38],
      [3.0, 0.6],
      [2.5, 0.63],
    ],
    0,
    ARMOR,
    1.7,
  );
  glow(bx(1.5, 0.03, 0.04, [0, 0.43, 3.01], CYAN), 1.6);
  // roof light bar
  bx(1.5, 0.1, 0.16, [0, 1.93, 0.28], DARK);
  for (let i = 0; i < 6; i++) glow(bx(0.2, 0.07, 0.17, [-0.6 + i * 0.24, 1.935, 0.28], i % 2 ? CYAN : MAGENTA), 1.6);
  // antenna and radar dish
  b.rod([-0.75, 1.88, -0.6], [-0.75, 2.9, -0.6], [0.02, 0.01], DARK, { bone: chassis });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { at: [-0.75, 2.92, -0.6], bone: chassis }), 2);
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), "#ffffff", {
    at: [0.6, 2.05, -0.55],
    rotation: [-20, 0, 0],
    bone: chassis,
    texture: RADAR,
  });
  cyl(0.04, 0.05, 0.2, 6, [0.6, 1.95, -0.55], METAL2);
  // bed crates
  bx(0.6, 0.4, 0.5, [0.55, 1.0, -1.45], METAL2);
  glow(bx(0.5, 0.04, 0.04, [0.55, 1.22, -1.2], YELLOW), 1.2);
  bx(0.4, 0.3, 0.4, [-0.6, 0.95, -1.4], METAL);

  // ---------- missile rack ----------
  const tilt = new THREE.Euler(-20 * D2R, 0, 0);
  const rc = new THREE.Vector3(0, 1.25, -2.0);
  b.part(new THREE.BoxGeometry(1.2, 0.5, 1.0), PLATE, { at: rc.toArray(), rotation: [-20, 0, 0], bone: chassis });
  bx(0.9, 0.32, 0.5, [0, 0.98, -2.0], DARK);
  const tq = new THREE.Quaternion()
    .setFromEuler(tilt)
    .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)));
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++) {
      const off = new THREE.Vector3(-0.45 + i * 0.3, -0.12 + j * 0.24, 0.52).applyEuler(tilt).add(rc);
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), DARK, { at: off.toArray(), quat: tq, bone: chassis });
      const tip = off.clone().add(new THREE.Vector3(0, 0, 0.04).applyEuler(tilt));
      glow(b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 6), ORANGE, { at: tip.toArray(), quat: tq, bone: chassis }), 1.3);
    }

  // ---------- roof turret / railgun ----------
  b.part(new THREE.CylinderGeometry(0.36, 0.4, 0.12, 8), METAL2, { at: [0, 1.93, -0.15], bone: turret });
  b.part(new THREE.BoxGeometry(0.72, 0.4, 0.8), PLATE, { at: [0, 2.17, -0.2], bone: turret });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.5, 0],
        [0.4, 0.34],
        [0, 0.4],
      ],
      { at: [s * 0.37, 2.0, -0.25], x: [0, 0, 1], thickness: 0.05, color: ARMOR, bone: turret },
    );
    b.part(new THREE.BoxGeometry(0.22, 0.28, 0.34), METAL, { at: [s * 0.5, 2.2, -0.35], bone: turret }); // ammo
    glow(b.part(new THREE.BoxGeometry(0.02, 0.06, 0.2), YELLOW, { at: [s * 0.62, 2.2, -0.35], bone: turret }), 1.2);
    // railgun barrels
    b.rod([s * 0.14, 2.22, 0.15], [s * 0.14, 2.22, 1.95], 0.05, METAL2, { bone: gun, sides: 6 });
    glow(b.rod([s * 0.14, 2.22, 0.5], [s * 0.14, 2.22, 1.9], 0.025, CYAN, { bone: gun, sides: 4 }), 0.0 + 1.4);
    for (let k = 0; k < 4; k++)
      b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 6), METAL, {
        at: [s * 0.14, 2.22, 0.65 + k * 0.3],
        rotation: [90, 0, 0],
        bone: gun,
      });
    b.part(new THREE.BoxGeometry(0.14, 0.14, 0.2), DARK, { at: [s * 0.14, 2.22, 1.95], bone: gun });
    glow(b.part(new THREE.BoxGeometry(0.1, 0.1, 0.02), MAGENTA, { at: [s * 0.14, 2.22, 2.06], bone: gun }), 2);
  }
  b.part(new THREE.BoxGeometry(0.3, 0.26, 0.3), METAL2, { at: [0, 2.22, 0.25], bone: gun });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [0, 2.28, 0.42], bone: gun }), 2);
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.14), DARK, { at: [0, 2.28, 0.37], bone: gun });

  // ---------- hover pods ----------
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.3;
      const z = sz > 0 ? 1.8 : -1.85;
      cyl(0.46, 0.5, 0.62, 8, [x, 0.31, z], PLATE);
      cyl(0.52, 0.52, 0.08, 8, [x, 0.04, z], DARK);
      glow(cyl(0.38, 0.38, 0.02, 8, [x, 0.01, z], CYAN), 2.2);
      glow(cyl(0.25, 0.25, 0.025, 8, [x, 0.012, z], "#e8ffff"), 2.5);
      glow(b.part(new THREE.TorusGeometry(0.45, 0.025, 4, 8), MAGENTA, { at: [x, 0.58, z], rotation: [90, 22.5, 0], bone: chassis }), 1.5);
      b.part(new THREE.CircleGeometry(0.4, 12), "#ffffff", {
        at: [x, 0.625, z],
        dir: [0, 1, 0],
        up: [0, 0, -1],
        axis: "z",
        texture: FAN,
        bone: chassis,
      });
      // pylon and stabiliser
      bx(0.5, 0.22, 0.8, [sx * 0.98, 0.6, z], DARK);
      bx(0.04, 0.34, 0.62, [sx * 1.8, 0.36, z], ARMOR);
      glow(bx(0.05, 0.03, 0.62, [sx * 1.8, 0.55, z], CYAN), 1.4);
      // conduit
      b.sweep(
        [
          [sx * 1.05, 0.66, z - 0.15],
          [sx * 1.14, 0.82, z - 0.15],
          [sx * 1.0, 0.98, z - 0.15],
        ],
        0.03,
        { color: METAL2, bone: chassis, sides: 5 },
      );
      glow(b.sweep(
        [
          [sx * 1.05, 0.66, z + 0.15],
          [sx * 1.14, 0.82, z + 0.15],
          [sx * 1.0, 0.98, z + 0.15],
        ],
        0.02,
        { color: MAGENTA, bone: chassis, sides: 4 },
      ), 1.2);
    }

  return b.root;
}
