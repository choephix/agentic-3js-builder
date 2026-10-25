import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Hoverbed Raider",
  "description": "A militarized pickup truck converted to ride on four cyan-glowing hover thrusters, in low-poly cyberpunk style with neon trim, armor plates and a roof-mounted gun."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4150",
  hullDark: "#1f242e",
  armor: "#566048",
  armorLight: "#7a8665",
  trim: "#e7b814",
  metal: "#8a919c",
  glass: "#14313f",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  headlight: "#fff3b0",
  tail: "#ff3030",
  rubber: "#15171c",
  rust: "#7a4a2a",
  bedLiner: "#2a2e36",
  warn: "#ff7a1a",
};
const M = {
  groundLevel: [0, 0, 0] as [number, number, number],
  chassisTop: [0, 1.15, 0] as [number, number, number],
  cabFloor: [0, 1.15, 0.2] as [number, number, number],
  cabRear: [0, 1.15, -0.7] as [number, number, number],
  bedFloor: [0, 1.1, -2] as [number, number, number],
  hoodFront: [0, 1.2, 1.5] as [number, number, number],
  gunPivot: [0, 1.6, -1.6] as [number, number, number],
  thrusterFL: [1.05, 0.55, 1.75] as [number, number, number],
  thrusterFR: [-1.05, 0.55, 1.75] as [number, number, number],
  thrusterBL: [1.05, 0.55, -1.75] as [number, number, number],
  thrusterBR: [-1.05, 0.55, -1.75] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...extra, flat: true });

  // Main slab: faceted loft
  b.loft(
    [
      { at: [0, 0.78, -2.7], w: 2.1, h: 0.62 },
      { at: [0, 0.75, -1.5], w: 2.4, h: 0.7 },
      { at: [0, 0.75, 1.5], w: 2.4, h: 0.7 },
      { at: [0, 0.72, 2.55], w: 2.0, h: 0.55 },
    ],
    { bone, color: P.hull, section: "box" } as any,
  );
  // Top deck plate
  box(2.3, 0.05, 5.1, P.hullDark, [0, 1.12, 0]);
  // Angled armor chamfers on sides
  for (const s of [1, -1]) {
    box(0.12, 0.5, 4.6, P.hull, [s * 1.22, 0.8, 0], { rotation: [0, 0, s * 8] });
    // sills with neon
    box(0.1, 0.12, 3.0, P.hullDark, [s * 1.27, 0.5, 0]);
    box(0.04, 0.05, 2.9, P.neonMagenta, [s * 1.33, 0.52, 0]);
    box(0.04, 0.04, 2.9, P.neonCyan, [s * 1.33, 0.44, 0]);
    // side seams and bolts
    for (let i = 0; i < 6; i++) {
      const z = -1.3 + i * 0.55;
      box(0.02, 0.5, 0.025, P.hullDark, [s * 1.285, 0.82, z]);
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone, at: [s * 1.3, 0.95, z + 0.12] });
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone, at: [s * 1.3, 0.68, z + 0.12] });
    }
    // fender arches around thruster mounts
    for (const zz of [1.75, -1.75]) {
      const arch = b.lathe(
        [[0.5, 0], [0.62, 0], [0.62, 0.14], [0.5, 0.14]],
        { at: [s * 1.05, 0.95, zz], axis: [0, 1, 0], segments: 6, bone, color: P.hullDark },
      );
      void arch;
      box(0.9, 0.08, 0.9, P.hull, [s * 1.05, 1.1, zz]);
      cyl(0.62, 0.62, 0.05, 6, P.trim, [s * 1.05, 1.06, zz]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(new THREE.SphereGeometry(0.03, 5, 4), P.metal, {
          bone,
          at: [s * 1.05 + Math.cos(a) * 0.56, 1.1, zz + Math.sin(a) * 0.56],
        });
      }
    }
  }
  // Skid plate with chevrons
  box(1.9, 0.07, 4.6, P.hullDark, [0, 0.38, 0]);
  for (let i = 0; i < 9; i++) {
    const z = -1.8 + i * 0.45;
    for (const s of [1, -1])
      box(0.5, 0.02, 0.1, P.trim, [s * 0.28, 0.335, z], { rotation: [0, s * 30, 0] });
  }
  // Underbody glow panel
  box(1.3, 0.03, 3.2, P.neonCyan, [0, 0.31, 0]);
  box(1.4, 0.02, 0.06, P.hullDark, [0, 0.305, 0.6]);
  box(1.4, 0.02, 0.06, P.hullDark, [0, 0.305, -0.6]);

  // Front bumper
  box(2.3, 0.5, 0.35, P.hullDark, [0, 0.62, 2.65]);
  box(2.0, 0.34, 0.12, P.hull, [0, 0.66, 2.84], { rotation: [-10, 0, 0] });
  for (const s of [1, -1]) {
    box(0.3, 0.52, 0.4, P.hull, [s * 1.1, 0.62, 2.68], { rotation: [0, s * 15, 0] });
    box(0.28, 0.1, 0.02, P.trim, [s * 1.1, 0.88, 2.9]);
  }
  // Grille
  box(1.1, 0.3, 0.05, P.rubber, [0, 0.72, 2.9]);
  for (let i = 0; i < 7; i++) box(0.02, 0.28, 0.03, P.metal, [-0.45 + i * 0.15, 0.72, 2.93]);
  box(1.1, 0.04, 0.05, P.neonCyan, [0, 0.52, 2.92]);
  box(1.0, 0.03, 0.2, P.neonCyan, [0, 0.4, 2.85]);
  // Bullbar
  for (const s of [1, -1]) {
    b.rod([s * 0.55, 0.45, 2.95], [s * 0.55, 1.0, 2.95], 0.045, P.metal, { bone } as any);
    b.rod([s * 0.9, 0.5, 2.85], [s * 0.9, 0.95, 2.85], 0.04, P.metal, { bone } as any);
  }
  b.rod([-0.95, 0.98, 2.88], [0.95, 0.98, 2.88], 0.05, P.metal, { bone } as any);
  b.rod([-0.95, 0.55, 2.88], [0.95, 0.55, 2.88], 0.04, P.metal, { bone } as any);
  box(1.9, 0.1, 0.1, P.trim, [0, 1.06, 2.82]);
  // Winch
  box(0.5, 0.2, 0.2, P.hullDark, [0, 0.4, 2.92]);
  cyl(0.07, 0.07, 0.4, 8, P.metal, [0, 0.4, 2.95], { rotation: [0, 0, 90] });
  b.part(new THREE.TorusGeometry(0.06, 0.015, 5, 8), P.metal, { bone, at: [0, 0.33, 3.05] });
  // Bumper bolts
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone, at: [-1.0 + i * 0.285, 0.88, 2.84] });
  }

  // Rear bumper
  box(2.3, 0.42, 0.3, P.hullDark, [0, 0.7, -2.72]);
  box(2.1, 0.08, 0.32, P.trim, [0, 0.93, -2.73]);
  for (const s of [1, -1]) {
    box(0.4, 0.2, 0.06, P.tail, [s * 0.8, 0.72, -2.9]);
    box(0.3, 0.1, 0.02, "#ffb0b0", [s * 0.8, 0.72, -2.94]);
    box(0.3, 0.04, 0.3, P.hull, [s * 0.8, 0.9, -2.72]);
  }
  // Tow hitch
  box(0.25, 0.12, 0.3, P.metal, [0, 0.55, -2.95]);
  cyl(0.05, 0.05, 0.2, 8, P.metal, [0, 0.62, -3.05]);
  b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.metal, { bone, at: [0, 0.7, -3.05], rotation: [90, 0, 0] });
  box(1.2, 0.03, 0.04, P.neonMagenta, [0, 0.55, -2.88]);

  // Panel rivets on top deck
  for (let i = 0; i < 20; i++) {
    const side = i % 2 ? 1 : -1;
    b.part(new THREE.SphereGeometry(0.02, 4, 3), P.metal, {
      bone,
      at: [side * (1.05 + R() * 0.05), 1.15, -2.5 + i * 0.26],
    });
  }
  // Cross seams on deck
  for (let i = 0; i < 5; i++) box(2.2, 0.01, 0.025, P.rubber, [0, 1.15, -2 + i * 1.0]);
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (
    w: number, h: number, d: number, color: string,
    x: number, y: number, z: number,
    rx = 0, ry = 0, rz = 0,
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], rotation: [rx, ry, rz] });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], rot: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, rotation: rot, flat: true });

  const CAMO_Z = [-0.45, 0.05, 0.55];

  // ---------- Hood ----------
  box(1.95, 0.38, 1.75, P.armor, 0, 1.36, 1.85, 5);
  box(1.95, 0.1, 1.75, P.hullDark, 0, 1.2, 1.85);
  // camo patches
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? 1 : -1;
    box(0.35 + R() * 0.3, 0.012, 0.3 + R() * 0.3, P.armorLight, s * (0.35 + R() * 0.4), 1.555 - (1.2 + i * 0.25 - 1.2) * 0.0875 * 0.5 + 0.0, 1.15 + i * 0.28, 5);
  }
  // center ridge
  box(0.14, 0.07, 1.6, P.hull, 0, 1.58, 1.85, 5);
  box(0.06, 0.02, 1.5, P.trim, 0, 1.625, 1.85, 5);
  // vents
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      box(0.36, 0.02, 0.05, P.hullDark, s * 0.55, 1.575 - i * 0.012, 1.3 + i * 0.12, 5);
    }
  // scoop
  box(0.5, 0.14, 0.4, P.hullDark, 0, 1.64, 1.35, -10);
  box(0.4, 0.04, 0.3, P.neonCyan, 0, 1.655, 1.37, -10);
  glow(b.part(new THREE.BoxGeometry(0.34, 0.012, 0.22), P.neonCyan, { bone, at: [0, 1.72, 1.36], rotation: [-10, 0, 0] }), 1);
  // front fascia
  box(1.9, 0.42, 0.1, P.hull, 0, 1.38, 2.72);
  box(1.3, 0.2, 0.04, P.hullDark, 0, 1.3, 2.78);
  for (let i = 0; i < 5; i++) box(1.2, 0.015, 0.02, P.metal, 0, 1.24 + i * 0.04, 2.805);
  // hood corner armor wedges
  for (const s of [1, -1]) {
    box(0.18, 0.3, 1.5, P.armorLight, s * 1.0, 1.38, 1.9);
    box(0.2, 0.05, 1.5, P.trim, s * 1.0, 1.54, 1.9);
    // headlight cluster
    box(0.38, 0.2, 0.06, P.hullDark, s * 0.68, 1.4, 2.78);
    glow(box(0.3, 0.13, 0.04, P.headlight, s * 0.68, 1.4, 2.82), 1.4);
    glow(box(0.1, 0.05, 0.04, P.warn, s * 0.95, 1.4, 2.8), 1);
  }

  // ---------- Cabin lower body ----------
  box(2.1, 0.42, 1.8, P.armor, 0, 1.36, 0.1);
  box(2.1, 0.07, 1.8, P.trim, 0, 1.17, 0.1);
  box(1.96, 0.1, 0.1, P.hull, 0, 1.54, 1.0);
  // camo panels + door seams per side
  for (const s of [1, -1]) {
    box(0.04, 0.3, 0.7, P.armorLight, s * 1.06, 1.36, 0.58);
    box(0.04, 0.2, 0.55, P.armorLight, s * 1.06, 1.33, -0.4);
    for (const z of [1.0, 0.2, -0.65]) box(0.045, 0.4, 0.02, P.hullDark, s * 1.065, 1.36, z);
    box(0.045, 0.02, 0.8, P.hullDark, s * 1.065, 1.2, 0.6);
    // handles
    box(0.05, 0.04, 0.16, P.metal, s * 1.08, 1.5, 0.3);
    box(0.05, 0.04, 0.16, P.metal, s * 1.08, 1.5, -0.35);
    // hazard stripes
    for (let i = 0; i < 4; i++) box(0.045, 0.05, 0.1, P.trim, s * 1.07, 1.26, 0.85 - i * 0.2 + 0.0, 0, 0, 0);
    // door number
    box(0.045, 0.14, 0.03, P.hullDark, s * 1.075, 1.38, 0.64);
    box(0.045, 0.03, 0.12, P.trim, s * 1.075, 1.42, 0.7);
    box(0.045, 0.14, 0.03, P.trim, s * 1.08, 1.38, 0.76);
    // emblem: ring + chevron
    box(0.045, 0.2, 0.2, P.hullDark, s * 1.07, 1.37, -0.05);
    box(0.05, 0.12, 0.12, P.trim, s * 1.075, 1.37, -0.05, 45, 0, 0);
    box(0.055, 0.05, 0.05, P.neonCyan, s * 1.078, 1.37, -0.05);
  }

  // ---------- Greenhouse ----------
  // pillars
  for (const s of [1, -1]) {
    box(0.1, 0.5, 0.1, P.hull, s * 0.98, 1.8, -0.62);
    box(0.1, 0.52, 0.1, P.hull, s * 0.98, 1.77, 0.15);
    box(0.1, 0.5, 0.1, P.hull, s * 0.95, 1.78, 0.92, -30);
    // side glass
    box(0.03, 0.36, 0.7, P.glass, s * 0.98, 1.78, -0.25);
    box(0.03, 0.36, 0.7, P.glass, s * 0.98, 1.78, 0.55);
    // half-open shutters
    box(0.05, 0.14, 0.72, P.armor, s * 1.03, 1.9, -0.25, 0, 0, s * -18);
    box(0.05, 0.14, 0.72, P.armor, s * 1.03, 1.9, 0.55, 0, 0, s * -18);
    box(0.055, 0.03, 0.72, P.trim, s * 1.06, 1.97, 0.55, 0, 0, s * -18);
    // mirrors
    box(0.06, 0.06, 0.24, P.metal, s * 1.15, 1.55, 0.95, 0, 0, 0).rotation.y = 0;
    box(0.04, 0.2, 0.14, P.hullDark, s * 1.22, 1.63, 0.95);
    box(0.02, 0.15, 0.1, P.glass, s * 1.245, 1.63, 0.95);
  }
  // windshield
  box(1.9, 0.62, 0.06, P.glass, 0, 1.78, 1.0, -30);
  box(1.96, 0.07, 0.07, P.hull, 0, 2.06 - 0.0, 0.84, -30).position.y = 2.04;
  box(1.96, 0.07, 0.07, P.hull, 0, 1.5, 1.14, -30);
  box(0.06, 0.55, 0.06, P.hull, 0, 1.78, 1.0, -30);
  // rear window
  box(1.8, 0.34, 0.04, P.glass, 0, 1.76, -0.68);
  box(1.9, 0.06, 0.06, P.hull, 0, 1.57, -0.7);
  // roof plate
  box(2.0, 0.07, 1.65, P.armor, 0, 2.0, 0.17);
  box(1.4, 0.015, 1.1, P.armorLight, 0, 2.045, 0.17);
  box(2.04, 0.04, 0.1, P.trim, 0, 2.0, 1.0, 0);
  for (let i = 0; i < 5; i++) box(0.06, 0.02, 0.1, P.hullDark, -0.8 + i * 0.4, 2.025, 1.0);

  // roll cage on roof
  const cage = [
    [0.8, -0.55], [-0.8, -0.55], [0.8, 0.65], [-0.8, 0.65],
  ];
  for (const [x, z] of cage) cyl(0.025, 0.025, 0.14, 6, P.metal, [x, 2.1, z]);
  b.rod([0.8, 2.17, -0.55], [-0.8, 2.17, -0.55], 0.025, P.metal, { bone });
  b.rod([0.8, 2.17, 0.65], [-0.8, 2.17, 0.65], 0.025, P.metal, { bone });
  b.rod([0.8, 2.17 - 0.0, -0.55], [0.8, 2.17, 0.65], 0.025, P.metal, { bone });
  b.rod([-0.8, 2.17, -0.55], [-0.8, 2.17, 0.65], 0.025, P.metal, { bone });
  b.rod([0.8, 2.17, -0.55], [-0.8, 2.17, 0.65], 0.018, P.metal, { bone });

  // light bar on top
  box(1.5, 0.1, 0.12, P.hullDark, 0, 2.13, 0.8);
  for (let i = 0; i < 6; i++) glow(box(0.2, 0.06, 0.04, i % 2 ? P.neonCyan : P.headlight, -0.6 + i * 0.24, 2.13, 0.87), 1.3);

  // antennas
  for (const [x, h, c] of [[-0.9, 0.7, P.metal], [0.9, 0.5, P.metal]] as [number, number, string][]) {
    cyl(0.07, 0.07, 0.06, 6, P.hullDark, [x, 2.06, -0.5]);
    b.rod([x, 2.08, -0.5], [x + (x < 0 ? -0.04 : 0.04), 2.08 + h, -0.5], [0.012, 0.005], c, { bone });
  }
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.warn, { bone, at: [-0.94, 2.8 - 0.0, -0.5] }), 1);
  box(0.02, 0.02, 0.02, P.warn, -0.94, 2.78, -0.5);

  // ---------- Interior ----------
  box(1.9, 0.06, 1.7, P.hullDark, 0, 1.2, 0.05);
  // dash
  box(1.8, 0.2, 0.3, P.hullDark, 0, 1.58, 0.95, -10);
  box(0.4, 0.08, 0.04, P.neonCyan, 0.45, 1.64, 0.8);
  glow(box(0.3, 0.05, 0.02, P.neonCyan, 0.5, 1.66, 0.8), 1);
  // steering wheel
  b.part(new THREE.TorusGeometry(0.13, 0.017, 5, 10), P.rubber, { bone, at: [-0.45, 1.68, 0.72], rotation: [-55, 0, 0], flat: true });
  cyl(0.02, 0.02, 0.2, 6, P.metal, [-0.45, 1.62, 0.8], [-55, 0, 0]);
  // seats: front row + rear row
  for (const [z, ys] of [[0.4, 0], [-0.3, 0.03]] as [number, number][])
    for (const x of [-0.5, 0.5]) {
      box(0.5, 0.12, 0.5, P.rubber, x, 1.3 + ys, z);
      box(0.5, 0.5, 0.1, P.rubber, x, 1.55 + ys, z - 0.22, 8);
      box(0.3, 0.14, 0.08, P.hull, x, 1.88 + ys - 0.0, z - 0.26, 8);
      box(0.52, 0.03, 0.1, P.trim, x, 1.3 + ys + 0.07, z + 0.2);
    }
  // center console
  box(0.2, 0.15, 0.7, P.hullDark, 0, 1.3, 0.35);
  glow(box(0.1, 0.02, 0.2, P.neonMagenta, 0, 1.385, 0.4), 1);

  // magenta/cyan accent strips under hood edges & cabin roof edge
  for (const s of [1, -1]) {
    glow(box(0.03, 0.03, 1.5, P.neonCyan, s * 0.98, 1.2, 1.9), 1.2);
    glow(box(0.03, 0.03, 1.5, P.neonMagenta, s * 1.02, 1.5, 0.35 - 0.0 - 0.2).position.set(s * 1.07, 1.2, 0.2) as any, 1);
  }
  void CAMO_Z;
  void M;
}
    return buildCab;
  })(),
  // bed
  (() => {
function buildBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...opt });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], opt: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...opt });
  const neon = (w: number, h: number, d: number, color: string, at: [number, number, number], s = 1.4) =>
    glow(box(w, h, d, color, at), s);

  const zc = -1.75; // bed centre z
  const zl = 2.1; // bed length
  const floorY = 1.1;

  // floor
  box(2.3, 0.08, zl, P.bedLiner, [0, floorY + 0.04, zc]);
  // floor ribs
  for (let i = 0; i < 9; i++) box(2.2, 0.02, 0.05, P.hullDark, [0, floorY + 0.09, -0.85 - i * 0.22]);

  // side walls (angled outward) with trim tops and rivets
  for (const s of [1, -1]) {
    const wall = box(0.1, 0.55, zl, P.armor, [s * 1.12, floorY + 0.32, zc], { rotation: [0, 0, s * -6] });
    void wall;
    box(0.14, 0.06, zl + 0.04, P.hullDark, [s * 1.15, floorY + 0.62, zc], { rotation: [0, 0, s * -6] });
    // hazard stripes on top
    for (let i = 0; i < 10; i++)
      box(0.15, 0.02, 0.1, i % 2 ? P.hullDark : P.trim, [s * 1.15, floorY + 0.66, -0.76 - i * 0.2], { rotation: [0, 0, s * -6] });
    // armor plates on outer face
    for (let i = 0; i < 3; i++) {
      box(0.04, 0.38, 0.55, i % 2 ? P.armorLight : P.armor, [s * 1.2, floorY + 0.32, -1.1 - i * 0.62], { rotation: [0, 0, s * -6] });
      for (const dz of [-0.2, 0.2])
        for (const dy of [-0.12, 0.12])
          cyl(0.025, 0.025, 0.03, 6, P.metal, [s * 1.23, floorY + 0.32 + dy, -1.1 - i * 0.62 + dz], { dir: [s, 0, 0] });
    }
    // wheel-well humps
    box(0.4, 0.2, 0.6, P.hullDark, [s * 0.9, floorY + 0.18, -2.35]);
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 6, 1, false, 0, Math.PI), P.hull, {
      bone, at: [s * 0.9, floorY + 0.1, -2.35], rotation: [0, 0, 90], scale: [1, 1, 1.0],
    });
    // inner neon edge
    neon(0.03, 0.03, zl - 0.1, P.neonCyan, [s * 1.04, floorY + 0.12, zc], 1.2);
    // tie-down rings
    for (const z of [-1.1, -1.9, -2.6]) {
      b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.metal, { bone, at: [s * 1.07, floorY + 0.5, z], dir: [s, 0, 0], axis: "z" });
      box(0.05, 0.05, 0.05, P.metal, [s * 1.09, floorY + 0.5, z]);
    }
  }

  // tailgate
  box(2.3, 0.6, 0.1, P.armor, [0, floorY + 0.38, -2.76]);
  box(2.36, 0.07, 0.14, P.hullDark, [0, floorY + 0.7, -2.76]);
  for (let i = 0; i < 12; i++)
    box(0.1, 0.02, 0.15, i % 2 ? P.hullDark : P.trim, [-1.1 + i * 0.2, floorY + 0.74, -2.76]);
  for (const x of [-0.9, -0.3, 0.3, 0.9]) {
    box(0.4, 0.4, 0.03, P.armorLight, [x, floorY + 0.38, -2.83]);
    for (const dx of [-0.15, 0.15]) for (const dy of [-0.14, 0.14])
      cyl(0.022, 0.022, 0.03, 6, P.metal, [x + dx, floorY + 0.38 + dy, -2.86], { dir: [0, 0, -1] });
  }
  for (const s of [1, -1]) box(0.1, 0.1, 0.12, P.metal, [s * 1.0, floorY + 0.1, -2.72]); // latches
  // cyan cargo strip under gate top
  neon(1.9, 0.04, 0.03, P.neonCyan, [0, floorY + 0.62, -2.82], 1.6);

  // front wall / roll bar behind cab
  box(2.3, 0.5, 0.08, P.hullDark, [0, floorY + 0.3, -0.76]);
  const rbY = floorY + 1.0;
  for (const s of [1, -1]) {
    cyl(0.045, 0.045, 0.95, 8, P.hullDark, [s * 1.0, floorY + 0.5, -0.82]);
    neon(0.02, 0.9, 0.02, P.neonCyan, [s * 1.0, floorY + 0.5, -0.78], 1.5);
  }
  cyl(0.045, 0.045, 2.05, 8, P.hullDark, [0, rbY - 0.05, -0.82], { rotation: [0, 0, 90] });
  neon(2.0, 0.02, 0.02, P.neonCyan, [0, rbY - 0.05, -0.77], 1.5);
  cyl(0.035, 0.035, 2.0, 6, P.hullDark, [0, floorY + 0.55, -0.82], { rotation: [0, 0, 90] });
  for (const s of [1, -1]) box(0.14, 0.04, 0.14, P.trim, [s * 1.0, floorY + 0.1, -0.82]);

  // fuel drum (left rear)
  cyl(0.26, 0.26, 0.6, 12, P.rust, [0.65, floorY + 0.38, -1.15]);
  for (const dy of [-0.15, 0.15]) cyl(0.27, 0.27, 0.04, 12, P.hullDark, [0.65, floorY + 0.38 + dy, -1.15]);
  cyl(0.2, 0.2, 0.03, 12, P.metal, [0.65, floorY + 0.69, -1.15]);
  cyl(0.05, 0.05, 0.05, 6, P.warn, [0.72, floorY + 0.72, -1.1]);
  box(0.2, 0.2, 0.01, P.warn, [0.65, floorY + 0.38, -0.89]);

  // ammo crates right side
  const crates: [number, number, number, string][] = [
    [-0.7, -1.05, 0, P.warn],
    [-0.7, -1.5, 0, P.rust],
    [-0.7, -1.05, 1, P.rust],
  ];
  for (const [x, z, lvl, c] of crates) {
    const y = floorY + 0.2 + lvl * 0.34;
    box(0.5, 0.32, 0.38, c, [x, y, z]);
    box(0.52, 0.04, 0.4, P.hullDark, [x, y + 0.16, z]);
    box(0.06, 0.34, 0.4, P.hullDark, [x - 0.15, y, z]);
    box(0.06, 0.34, 0.4, P.hullDark, [x + 0.15, y, z]);
    box(0.1, 0.06, 0.02, P.metal, [x, y + 0.05, z + 0.2]);
  }

  // strapping over crates
  box(0.52, 0.02, 0.05, P.trim, [-0.7, floorY + 0.54 + 0.34 * 0 + 0.17, -1.05]);

  // crate stack with antenna dish at rear
  box(0.7, 0.36, 0.5, P.hullDark, [0.55, floorY + 0.22, -2.4]);
  box(0.5, 0.3, 0.4, P.armor, [0.55, floorY + 0.55, -2.4]);
  box(0.72, 0.04, 0.04, P.trim, [0.55, floorY + 0.22, -2.14]);
  cyl(0.02, 0.02, 0.25, 6, P.metal, [0.55, floorY + 0.82, -2.4]);
  b.part(new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.2), P.armorLight, {
    bone, at: [0.55, floorY + 0.98, -2.4], rotation: [-110, 0, 0],
  });
  cyl(0.015, 0.015, 0.18, 5, P.metal, [0.55, floorY + 1.0, -2.28], { rotation: [-70, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonCyan, { bone, at: [0.55, floorY + 1.05, -2.22] }), 1.6);

  // floor cargo light strips
  neon(0.04, 0.02, 1.6, P.neonCyan, [-0.3, floorY + 0.1, zc], 1.4);
  neon(0.04, 0.02, 1.6, P.neonCyan, [0.3, floorY + 0.1, zc], 1.4);

  // gun mount plate at gunPivot (clear pedestal base ring from gun part)
  cyl(0.35, 0.38, 0.03, 12, P.metal, [0, floorY + 0.1, -1.6]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    cyl(0.025, 0.025, 0.03, 6, P.hullDark, [Math.sin(a) * 0.3, floorY + 0.13, -1.6 + Math.cos(a) * 0.3]);
  }

  // scattered rust / grime flecks
  for (let i = 0; i < 8; i++)
    box(0.08 + R() * 0.1, 0.01, 0.06 + R() * 0.1, P.hullDark, [(R() - 0.5) * 1.6, floorY + 0.09, -0.9 - R() * 1.7]);
}
    return buildBed;
  })(),
  // thrusters
  (() => {
function buildThrusters({ b, J, P, M }: any) {
  const rand = rng(11);
  const hexRing = (ro: number, ri: number, h: number) => {
    const pts = (r: number) =>
      Array.from({ length: 6 }, (_, k) => new THREE.Vector2(r * Math.cos((k * Math.PI) / 3), r * Math.sin((k * Math.PI) / 3)));
    const s = new THREE.Shape(pts(ro));
    s.holes.push(new THREE.Path(pts(ri).reverse()));
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return g;
  };
  const corners: [string, number, number, number][] = [
    ["thrusterFL", 1, 1, 0],
    ["thrusterFR", -1, 1, 1],
    ["thrusterBL", 1, -1, 2],
    ["thrusterBR", -1, -1, 3],
  ];
  for (const [name, sx, sz] of corners.map((c) => [c[0], c[1], c[2]] as [string, number, number])) {
    const bone = J[name];
    const m = M[name] as number[];
    const cx = m[0];
    const cz = m[2];
    const add = (geo: THREE.BufferGeometry, color: string, at: number[], rot?: number[], glowing = 0) => {
      const p = b.part(geo, color, { bone, at, rotation: rot, flat: true });
      if (glowing) glow(p, glowing);
      return p;
    };
    const R = 0.52;
    const ap = R * Math.cos(Math.PI / 6);
    // shell and rims
    add(hexRing(R, 0.36, 0.6), P.hullDark, [cx, 0, cz]);
    add(hexRing(0.55, 0.38, 0.06), P.metal, [cx, 0.6, cz]);
    add(hexRing(0.54, 0.38, 0.05), P.metal, [cx, 0, cz]);
    add(hexRing(0.535, 0.4, 0.07), P.trim, [cx, 0.28, cz]);
    add(hexRing(0.375, 0.345, 0.025), P.neonCyan, [cx, 0.575, cz], undefined, 1.5);
    add(hexRing(0.355, 0.33, 0.03), P.rubber, [cx, 0.2, cz]);
    // faces: decor
    for (let k = 0; k < 6; k++) {
      const phi = ((30 + 60 * k) * Math.PI) / 180;
      const ox = Math.cos(phi);
      const oz = -Math.sin(phi);
      const yaw = (Math.atan2(ox, oz) * 180) / Math.PI;
      const px = cx + (ap + 0.01) * ox;
      const pz = cz + (ap + 0.01) * oz;
      add(new THREE.BoxGeometry(0.24, 0.035, 0.03), P.neonMagenta, [px, 0.48, pz], [0, yaw, 0], 1.4);
      add(new THREE.BoxGeometry(0.05, 0.05, 0.03), P.metal, [cx + (ap + 0.01) * ox + 0.0, 0.12, cz + (ap + 0.01) * oz], [0, yaw, 0]);
      if (k === 1 || k === 4) {
        for (let v = 0; v < 3; v++)
          add(new THREE.BoxGeometry(0.26, 0.025, 0.03), P.rubber, [px, 0.1 + v * 0.045 + 0.0, pz], [0, yaw, 0]);
        add(new THREE.BoxGeometry(0.3, 0.16, 0.02), P.hullDark, [px, 0.14, pz], [0, yaw, 0]);
      }
    }
    // bolts on top rim
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      add(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.rubber, [cx + 0.47 * Math.cos(a), 0.675, cz - 0.47 * Math.sin(a)]);
    }
    // fan
    add(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 8), P.metal, [cx, 0.3, cz]);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 6), P.neonCyan, [cx, 0.3, cz], undefined, 1.2);
    for (let i = 0; i < 8; i++) {
      const a = (i * 360) / 8;
      const r = 0.2;
      const x = cx + r * Math.sin((a * Math.PI) / 180);
      const z = cz + r * Math.cos((a * Math.PI) / 180);
      add(new THREE.BoxGeometry(0.07, 0.015, 0.2), i % 2 ? P.metal : P.hullDark, [x, 0.32, z], [0, a, 22]);
    }
    for (let i = 0; i < 3; i++) {
      const a = (i * 120 + 30) * (Math.PI / 180);
      add(new THREE.BoxGeometry(0.03, 0.03, 0.3), P.metal, [cx + 0.2 * Math.sin(a), 0.45, cz + 0.2 * Math.cos(a)], [0, (a * 180) / Math.PI, 0]);
    }
    // core discs facing down
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 12), P.neonCyan, [cx, 0.08, cz], undefined, 2);
    add(new THREE.CylinderGeometry(0.34, 0.34, 0.02, 12), P.rubber, [cx, 0.055, cz]);
    add(new THREE.CylinderGeometry(0.14, 0.14, 0.035, 8), "#d8ffff", [cx, 0.07, cz], undefined, 2.5);
    // struts toward body
    const inX = -sx;
    for (const d of [-0.3, 0.3]) {
      const z0 = cz + d;
      b.rod([cx + inX * 0.1, 0.64, z0], [cx + inX * 0.35, 0.9, z0 * 0.97], 0.04, P.metal, { bone });
      add(new THREE.SphereGeometry(0.06, 6, 4), P.hullDark, [cx + inX * 0.1, 0.64, z0]);
    }
    b.rod([cx + inX * 0.1, 0.64, cz - 0.3], [cx + inX * 0.35, 0.9, cz + 0.3], 0.025, P.rubber, { bone });
    b.rod([cx + inX * 0.1, 0.64, cz + 0.3], [cx + inX * 0.35, 0.9, cz - 0.3], 0.025, P.rubber, { bone });
    add(new THREE.BoxGeometry(0.26, 0.05, 0.8), P.hullDark, [cx + inX * 0.35, 0.89, cz]);
    for (let i = 0; i < 4; i++) {
      const dz = i < 2 ? -0.3 : 0.3;
      const dx = i % 2 ? 0.08 : -0.08;
      add(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.metal, [cx + inX * 0.35 + dx, 0.925, cz + dz + (rand() - 0.5) * 0.02]);
    }
    // hazard end ticks on the band
    for (const side of [1, -1])
      add(new THREE.BoxGeometry(0.04, 0.09, 0.04), P.rubber, [cx + side * 0.36, 0.31, cz + sz * 0.46]);
  }
}
    return buildThrusters;
  })(),
  // gun
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildGun({ b, J, P, M }: Ctx) {
  const body = J.body, yaw = J.gunYaw, pitch = J.gunPitch;
  const floorY = M.bedFloor[1];
  const gx = M.gunPivot[0], gz = M.gunPivot[2];

  const box = (w: number, h: number, d: number, color: string, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: string, at: number[], bone: any, dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { bone, at, dir });

  // ---- Pedestal (body) ----
  cyl(0.28, 0.34, 0.1, 8, P.hullDark, [gx, floorY + 0.05, gz], body);
  cyl(0.12, 0.15, 0.4, 8, P.metal, [gx, floorY + 0.3, gz], body);
  cyl(0.22, 0.22, 0.06, 8, P.trim, [gx, floorY + 0.12, gz], body);
  cyl(0.2, 0.2, 0.05, 8, P.hullDark, [gx, floorY + 0.53, gz], body);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    glow(b.part(new THREE.SphereGeometry(0.018, 5, 4), P.neonCyan, { bone: body, at: [gx + Math.cos(a) * 0.3, floorY + 0.11, gz + Math.sin(a) * 0.3] }));
    box(0.04, 0.04, 0.04, P.metal, [gx + Math.cos(a) * 0.19, floorY + 0.57, gz + Math.sin(a) * 0.19], body);
  }

  // ---- Yaw mount ----
  const my = M.gunPivot[1];
  cyl(0.24, 0.24, 0.06, 8, P.armor, [gx, my - 0.03, gz], yaw);
  box(0.1, 0.22, 0.1, P.metal, [gx, my + 0.08, gz], yaw);
  for (const s of [1, -1]) {
    box(0.06, 0.26, 0.26, P.hullDark, [gx + s * 0.2, my + 0.2, gz], yaw);
    box(0.07, 0.07, 0.07, P.metal, [gx + s * 0.235, my + 0.2, gz], yaw);
  }
  // seat bracket
  box(0.1, 0.05, 0.22, P.hullDark, [gx, my + 0.02, gz - 0.28], yaw);
  box(0.3, 0.05, 0.2, P.hullDark, [gx, my + 0.2, gz - 0.42], yaw);
  box(0.3, 0.22, 0.04, P.rubber || P.hullDark, [gx, my + 0.32, gz - 0.52], yaw);
  box(0.04, 0.2, 0.04, P.metal, [gx, my + 0.1, gz - 0.3], yaw);
  // shield plates
  box(0.84, 0.46, 0.05, P.armor, [gx, my + 0.52, gz + 0.3], yaw, { rotation: [-12, 0, 0] });
  for (const s of [1, -1]) {
    box(0.05, 0.4, 0.3, P.armor, [gx + s * 0.4, my + 0.48, gz + 0.16], yaw, { rotation: [0, s * 18, 0] });
    box(0.08, 0.06, 0.2, P.trim, [gx + s * 0.4, my + 0.7, gz + 0.14], yaw);
  }
  box(0.84, 0.05, 0.06, P.trim, [gx, my + 0.76, gz + 0.3], yaw);
  box(0.5, 0.18, 0.04, P.armorLight, [gx, my + 0.44, gz + 0.335], yaw, { rotation: [-12, 0, 0] });
  for (const s of [1, -1]) for (const t of [-1, 1]) box(0.035, 0.035, 0.03, P.metal, [gx + s * 0.36, my + 0.52 + t * 0.15, gz + 0.34], yaw);

  // ---- Autocannon (pitch) ----
  const py = M.gunPivot[1] + 0.25;
  cyl(0.05, 0.05, 0.46, 8, P.metal, [gx, py, gz], pitch, [1, 0, 0]);
  box(0.26, 0.24, 0.5, P.hullDark, [gx, py, gz + 0.05], pitch);
  box(0.28, 0.06, 0.4, P.armor, [gx, py + 0.14, gz + 0.05], pitch);
  box(0.1, 0.04, 0.3, P.trim, [gx, py + 0.18, gz + 0.05], pitch);
  // ammo drum and belt
  cyl(0.15, 0.15, 0.18, 10, P.armor, [gx + 0.22, py - 0.04, gz - 0.08], pitch, [1, 0, 0]);
  cyl(0.16, 0.16, 0.03, 10, P.trim, [gx + 0.32, py - 0.04, gz - 0.08], pitch, [1, 0, 0]);
  for (let i = 0; i < 6; i++) {
    box(0.1, 0.045, 0.04, i % 2 ? P.trim : P.metal, [gx + 0.14 - i * 0.002, py - 0.13 + i * 0.012, gz + 0.06 - i * 0.03], pitch, { rotation: [0, 0, 20] });
  }
  box(0.02, 0.0 + 0.1, 0.1, P.hullDark, [gx + 0.12, py - 0.1, gz - 0.02], pitch);
  // barrels
  for (const s of [1, -1]) {
    const x = gx + s * 0.075;
    cyl(0.04, 0.04, 0.9, 8, P.metal, [x, py, gz + 0.7], pitch, [0, 0, 1]);
    cyl(0.062, 0.062, 0.42, 8, P.hullDark, [x, py, gz + 0.46], pitch, [0, 0, 1]);
    for (let v = 0; v < 3; v++) box(0.05, 0.015, 0.05, P.neonCyan === "" ? P.metal : P.metal, [x, py + 0.065, gz + 0.34 + v * 0.1], pitch);
    cyl(0.07, 0.07, 0.12, 6, P.trim, [x, py, gz + 1.18], pitch, [0, 0, 1]);
    cyl(0.045, 0.045, 0.05, 6, P.rubber || P.hullDark, [x, py, gz + 1.26], pitch, [0, 0, 1]);
    for (let r = 0; r < 3; r++) {
      glow(b.part(new THREE.TorusGeometry(0.08, 0.012, 5, 10), P.neonMagenta, { bone: pitch, at: [x, py, gz + 0.68 + r * 0.12] }), 1.3);
    }
  }
  // sight
  box(0.1, 0.1, 0.16, P.hullDark, [gx - 0.17, py + 0.2, gz + 0.1], pitch);
  box(0.03, 0.12, 0.03, P.metal, [gx - 0.17, py + 0.14, gz + 0.05], pitch);
  cyl(0.04, 0.04, 0.08, 8, P.metal, [gx - 0.17, py + 0.2, gz + 0.22], pitch, [0, 0, 1]);
  glow(b.part(new THREE.CircleGeometry(0.032, 8), P.neonCyan, { bone: pitch, at: [gx - 0.17, py + 0.2, gz + 0.265], dir: [0, 0, 1], axis: "z" }), 1.6);

  // ---- Roof missile pod (on body) ----
  const rx = 0, ry = 2.0, rz = 0.5;
  box(0.9, 0.06, 0.8, P.hullDark, [rx, ry, rz], body);
  box(0.9, 0.025, 0.1, P.trim, [rx, ry + 0.04, rz - 0.38], body);
  for (const s of [1, -1]) box(0.06, 0.1, 0.1, P.metal, [rx + s * 0.35, ry - 0.0, rz + 0.3], body);
  box(0.8, 0.3, 0.7, P.armor, [rx, ry + 0.2, rz - 0.02], body);
  for (const sx of [1, -1]) for (const sy of [1, -1]) {
    const x = rx + sx * 0.19, y = ry + 0.2 + sy * 0.07;
    cyl(0.1, 0.1, 0.1, 8, P.hullDark, [x, y, rz + 0.37], body, [0, 0, 1]);
    cyl(0.07, 0.07, 0.02, 8, P.rubber || P.hullDark, [x, y, rz + 0.43], body, [0, 0, 1]);
    b.part(new THREE.ConeGeometry(0.06, 0.12, 8), P.warn, { bone: body, at: [x, y, rz + 0.44], dir: [0, 0, 1] });
  }
  box(0.82, 0.04, 0.72, P.armorLight, [rx, ry + 0.37, rz - 0.02], body);
  box(0.84, 0.03, 0.05, P.trim, [rx, ry + 0.22, rz + 0.1], body);
  glow(box(0.5, 0.02, 0.03, P.neonMagenta, [rx, ry + 0.4, rz - 0.3], body), 1.2);
}
    return buildGun;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverRaider" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.9,0], dir: [0,0,1], role: "spine" });
  J["gunYaw"] = b.joint("gunYaw", { parent: J["body"], at: [0,1.6,-1.6], dir: [0,1,0], role: "hinge", group: "gun" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["gunYaw"], at: [0,1.85,-1.6], dir: [0,0,1], role: "hinge", group: "gun" });
  J["thrusterFL"] = b.joint("thrusterFL", { parent: J["body"], at: [1.05,0.55,1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterFR"] = b.joint("thrusterFR", { parent: J["body"], at: [-1.05,0.55,1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterBL"] = b.joint("thrusterBL", { parent: J["body"], at: [1.05,0.55,-1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterBR"] = b.joint("thrusterBR", { parent: J["body"], at: [-1.05,0.55,-1.75], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
