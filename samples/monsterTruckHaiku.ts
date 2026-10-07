import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, stepped } from "../kits/pixel";

export const meta = {
  name: "Monster Truck",
  description:
    "A four-wheel monster truck on huge knobby tyres: a red cab and hood with a flame decal, a checkered cab band, a roll cage, a roof light bar and jerry can, twin chrome exhaust stacks and mud-spattered tyres, in pixel art.",
  style: "pixel art",
  commit: "b816db2",
};

type Vec = [number, number, number];

/** One texel and one paint cell, in metres: the whole truck is about 90 pixels long. */
const T = 0.05;
/** Axle height: the tyre centre, so the lowest lug touches the floor. */
const HUB = 0.97;
/** Tyre centres sit this far out, so each tread runs from 0.65 m to 1.45 m. */
const TRACK = 1.05;

const LIGHT = new THREE.Vector3(0.35, 0.75, 0.55).normalize();
const shade = (n: THREE.Vector3) => 0.5 + 0.5 * n.dot(LIGHT);

const RED = ["#3d0a12", "#7a1420", "#b01f2c", "#d93a36", "#f76b4f"];
const YEL = ["#7a4a00", "#b87a00", "#f0a800", "#ffd23a", "#fff2a0"];
const INK = "#15151d";
const RUBBER = ["#0c0c10", "#17171d", "#24242c", "#34343e"];
const STEEL = ["#1d2430", "#3a4454", "#637086", "#94a0b4", "#c8d2e0"];
const MUD = ["#3f3120", "#5c4a31", "#73603f"];
const GLASS = ["#0b1d2e", "#14405e", "#2c6e96", "#5fb0d8", "#b8e8ff"];
const LUG = "#1e1e26";
const CREAM = "#fff3d6";

/**
 * Red panels with square shading (the floor keeps the rear and sides readable), dark seam lines every 1.2 m, a
 * yellow stripe along the lower sides and a checkered band round the cab.
 */
const body = cellPaint(T, (c) => {
  const k = shade(c.n);
  const y = c.at.y;
  if (c.axis === 0 && y > 1.49 && y < 1.65) return y < 1.53 || y > 1.61 ? INK : c.pick(YEL, k);
  if (c.axis === 0 && y > 2.95 && y < 3.12) return (((c.u + c.v) % 2) + 2) % 2 ? INK : CREAM;
  if ((((c.u % 24) + 24) % 24) === 0 || (((c.v % 24) + 24) % 24) === 0) return RED[0];
  return c.pick(RED, 0.3 + 0.65 * k);
});

/** Yellow and black diagonal hazard tape for bumpers and skirts. */
const hazard = cellPaint(T, (c) => (((c.u + c.v) % 6) + 6) % 6 < 3 ? YEL[2] : INK);

/** Dithered rubber with mud speckles low down and two rings on the sidewall. */
const tyre = (zc: number) =>
  cellPaint(
    T,
    (c) => {
      const dy = c.at.y - HUB;
      const r = Math.hypot(dy, c.at.z - zc);
      if (dy < -0.05 && c.random(3) < 0.16) return MUD[Math.floor(c.random(4) * MUD.length)];
      if (c.axis === 0) {
        if (r > 0.6 && r < 0.64) return STEEL[2];
        if (r > 0.76 && r < 0.8) return YEL[2];
      }
      return c.pick(RUBBER, 0.1 + 0.8 * shade(c.n));
    },
    { dither: true },
  );

/** Steel barrel with yellow five-spoke face and a bright lug ring. */
const rim = (zc: number) =>
  cellPaint(T, (c) => {
    if (c.axis !== 0) return c.pick(STEEL, shade(c.n));
    const dy = c.at.y - HUB;
    const dz = c.at.z - zc;
    const r = Math.hypot(dy, dz);
    if (r < 0.1) return YEL[3];
    const a = ((((Math.atan2(dz, dy) / (2 * Math.PI)) * 5) % 1) + 1) % 1;
    const near = a < 0.18 || a > 0.82;
    if (r > 0.26 && r < 0.34 && (a < 0.07 || a > 0.93)) return "#e8eef7";
    if (r < 0.42 && near) return YEL[2];
    return STEEL[1];
  });

const glass = (w: number, h: number, pillar: boolean) =>
  pixelTexture(w, h, (g) =>
    g.fill((x, y, W, H) => {
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) return INK;
      if (pillar && x === Math.floor(W / 2)) return INK;
      if ((x + y) % 9 === 3 || ((x + y) % 9 === 4 && y < H / 2)) return "#eaf9ff";
      return pick(GLASS, 0.85 - (0.7 * y) / H, bayer(x, y));
    }),
  );

/** Pixel flames, tips toward the front of the hood: red edge, orange body, yellow core. */
const flames = pixelTexture(34, 25, (g) =>
  g.fill((x, y, _W, H) => {
    const d = H - 1 - y;
    const len = H * (0.24 + 0.3 * (0.5 + 0.5 * Math.sin(x * 0.9 + 0.3)) + 0.07 * Math.sin(x * 2.3));
    if (d >= len) return undefined;
    const r = d / len;
    return r > 0.7 ? "#d62839" : r > 0.35 ? "#ff8c1a" : "#ffe03a";
  }),
);

const grille = pixelTexture(26, 10, (g) =>
  g.fill((x, y, W, H) => {
    if (y === 0 || y === H - 1 || x === 0 || x === W - 1) return STEEL[2];
    if (y % 3 === 1) return STEEL[3];
    return "#0c0c12";
  }),
);

const headlight = pixelArt(["iiiiii", "iwwwwi", "iwyyyi", "iiiiii"], { i: INK, w: "#ffffff", y: "#fff0a0" });
const taillight = pixelArt(["iiiiiiii", "irRRRRri", "irrrrrri", "iiiiiiii"], { i: INK, r: "#ff3347", R: "#ffb3bd" });
const plate = pixelTexture(12, 4, (g) =>
  g.fill((x, y, W, H) => {
    if (x === 0 || y === 0 || x === W - 1 || y === H - 1) return INK;
    if (y === 1 && (x === 3 || x === 8)) return INK;
    if (y === 2 && x >= 4 && x <= 7) return INK;
    return CREAM;
  }),
);
const seven = pixelArt(
  ["wwwwww", "wwwwww", ".....w", "....ww", "...ww.", "..ww..", ".ww...", ".ww...", "ww...."],
  { w: CREAM },
);
const star = pixelArt(["...y...", "..yyy..", "yyyyyyy", ".yyyyy.", "..yyy..", ".yy.yy.", "yy...yy"], {
  y: YEL[3],
});
const flag = pixelTexture(8, 5, (g) => g.fill((x, y) => ((x + y) % 2 ? "#d62839" : CREAM)));
const led = pixelTexture(32, 3, (g) =>
  g.fill((x, y) => (y === 1 ? ["#fff7d6", "#ff3347", "#fff7d6", "#3da5ff"][x % 4] : INK)),
);

/** Tyres: a stepped lathe profile (pixel-square sidewalls, flat tread) with 16 staggered knobby lugs each. */
const TYRE_PROFILE: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  const d = Math.abs(-7.5 + i);
  TYRE_PROFILE.push([10, d <= 5.5 ? 18 : d <= 6.5 ? 17 : 16]);
}
const TYRE_OUTLINE = stepped(TYRE_PROFILE, T, { rows: true, start: -8 });

const STACK: [number, number][] = [
  [0, 0],
  [0.13, 0],
  [0.13, 0.12],
  [0.09, 0.16],
  [0.09, 1.7],
  [0.13, 1.8],
  [0.13, 1.95],
  [0, 1.95],
];

const sides = [1, -1] as const;
const axles = [
  { z: 1.45, tag: "F" },
  { z: -1.5, tag: "R" },
] as const;

export default function build() {
  const b = createBuilder({ name: "monsterTruck" });

  const decal = (texture: THREE.Texture, w: number, h: number, at: Vec, dir: Vec, bone: Joint, up?: Vec) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { texture, at, dir, axis: "z", bone, up });

  // Joints: the chassis is the root, each front wheel steers from a kingpin, every wheel spins on its own hinge,
  // the hood lifts from its front edge and each door swings from its front edge.
  const chassis = b.joint("chassis", { at: [0, 1.25, 0], dir: [0, 0, 1], role: "spine" });
  const hood = b.joint("hood", { parent: chassis, at: [0, 2.0, 2.2], dir: [1, 0, 0], role: "hinge" });
  const doorBones = sides.map((s) =>
    b.joint(`door${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 0.91, 2.6, 0.55], dir: [0, 1, 0], role: "hinge" }),
  );

  // Chassis: ladder frame, cross members, leaf springs, live axles, differentials, driveshaft and skid plate.
  for (const s of sides) {
    b.part(new THREE.BoxGeometry(0.22, 0.2, 4.7), STEEL[1], { at: [s * 0.45, 1.25, 0], bone: chassis });
    for (const z of [1.45, -1.5])
      b.part(new THREE.BoxGeometry(0.16, 0.06, 1.0), STEEL[2], { at: [s * 0.5, 1.12, z], bone: chassis });
  }
  for (const z of [-1.6, -0.5, 0.6, 1.6])
    b.part(new THREE.BoxGeometry(1.7, 0.14, 0.14), STEEL[0], { at: [0, 1.25, z], bone: chassis });
  for (const z of [1.45, -1.5]) {
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 2.1, 10), STEEL[2], {
      at: [0, HUB, z],
      dir: [1, 0, 0],
      bone: chassis,
    });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12), STEEL[1], { at: [0, HUB, z], dir: [0, 0, 1], bone: chassis });
  }
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 2.95, 8), STEEL[1], {
    at: [0, 1.05, -0.025],
    dir: [0, 0, 1],
    bone: chassis,
  });
  b.part(new THREE.BoxGeometry(1.6, 0.05, 3.6), INK, { at: [0, 1.3, 0.2], bone: chassis });

  // Wheels: steering kingpins on the front, then each tyre, its lugs, its rim and its mud flap.
  for (const s of sides) {
    const side = s > 0 ? "L" : "R";
    for (const ax of axles) {
      const hubAt: Vec = [s * TRACK, HUB, ax.z];
      const parent =
        ax.tag === "F"
          ? b.joint(`steer${ax.tag}${side}`, {
              parent: chassis,
              at: [s * TRACK, 1.75, ax.z],
              dir: [0, 1, 0],
              role: "hinge",
            })
          : chassis;
      const hub = b.joint(`wheel${ax.tag}${side}`, { parent, at: hubAt, dir: [s, 0, 0], role: "hinge" });

      b.lathe(TYRE_OUTLINE, { at: hubAt, axis: [1, 0, 0], segments: 20, color: tyre(ax.z), bone: hub });
      // Staggered lugs: wide blocks alternate with narrow ones pushed to either side of the tread.
      for (let k = 0; k < 16; k++) {
        const th = (k / 16) * Math.PI * 2;
        const radial: Vec = [0, Math.cos(th), Math.sin(th)];
        const wide = k % 2 === 0;
        const xo = wide ? 0 : k % 4 === 1 ? 0.2 : -0.2;
        const at: Vec = [s * (TRACK + xo), HUB + 0.92 * Math.cos(th), ax.z + 0.92 * Math.sin(th)];
        b.part(new THREE.BoxGeometry(wide ? 0.78 : 0.36, 0.1, 0.17), LUG, { at, dir: radial, bone: hub });
      }
      b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.72, 18), rim(ax.z), { at: hubAt, dir: [1, 0, 0], bone: hub });
    }
    b.part(new THREE.BoxGeometry(0.44, 0.9, 0.04), INK, { at: [s * TRACK, 1.3, -2.48], bone: chassis });
  }

  // Lower body, fenders, skirts and bumpers.
  b.part(new THREE.BoxGeometry(2.0, 0.65, 4.2), body, { at: [0, 1.675, 0.2], bone: chassis });
  for (const s of sides) {
    b.part(new THREE.BoxGeometry(0.1, 0.16, 4.0), hazard, { at: [s * 1.0, 1.42, 0.2], bone: chassis });
    for (const z of [1.45, -1.5])
      b.part(new THREE.BoxGeometry(0.56, 0.12, 1.5), body, { at: [s * 1.13, 2.02, z], bone: chassis });
    for (const z of [1.45, -1.5])
      b.part(new THREE.BoxGeometry(0.5, 0.06, 1.4), INK, { at: [s * 1.13, 1.94, z], bone: chassis });
  }
  b.part(new THREE.BoxGeometry(2.1, 0.3, 0.26), hazard, { at: [0, 1.32, 2.43], bone: chassis });
  b.part(new THREE.BoxGeometry(2.1, 0.3, 0.26), hazard, { at: [0, 1.32, -2.0], bone: chassis });
  for (const s of sides) {
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 8), STEEL[4], {
      at: [s * 0.75, 1.1, 2.5],
      dir: [0, -1, 0],
      bone: chassis,
    });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10), "#fff0a0", {
      at: [s * 0.98, 1.32, 2.575],
      dir: [0, 0, 1],
      bone: chassis,
    });
  }

  // Hood: panel, louvred scoop, side vents, flame decal and hinge pin.
  b.part(new THREE.BoxGeometry(1.9, 0.18, 1.6), body, { at: [0, 2.09, 1.4], bone: hood });
  b.part(new THREE.BoxGeometry(0.5, 0.14, 0.3), INK, { at: [0, 2.25, 0.72], bone: hood });
  for (const z of [0.66, 0.74, 0.82])
    b.part(new THREE.BoxGeometry(0.42, 0.02, 0.03), STEEL[3], { at: [0, 2.335, z], bone: hood });
  for (const s of sides)
    for (const z of [1.0, 1.25, 1.5])
      b.part(new THREE.BoxGeometry(0.03, 0.05, 0.22), INK, { at: [s * 0.96, 2.12, z], bone: hood });
  decal(flames, 1.7, 1.25, [0, 2.2, 1.55], [0, 1, 0], hood, [0, 0, 1]);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 8), STEEL[3], {
    at: [0, 2.0, 2.2],
    dir: [1, 0, 0],
    bone: hood,
  });

  // Front grille, headlights, rear lights and number plate.
  decal(grille, 1.3, 0.5, [0, 1.72, 2.305], [0, 0, 1], chassis);
  for (const s of sides) {
    decal(headlight, 0.3, 0.2, [s * 0.8, 1.82, 2.305], [0, 0, 1], chassis);
    decal(taillight, 0.4, 0.2, [s * 0.8, 1.72, -1.906], [0, 0, -1], chassis);
  }
  decal(plate, 0.6, 0.2, [0, 1.72, -1.906], [0, 0, -1], chassis);

  // Cab: body, black roof, windscreen, rear window, roof vents and a star on the rear quarter.
  b.part(new THREE.BoxGeometry(1.8, 1.2, 2.1), body, { at: [0, 2.6, -0.45], bone: chassis });
  b.part(new THREE.BoxGeometry(1.84, 0.1, 2.14), INK, { at: [0, 3.25, -0.45], bone: chassis });
  for (const s of [0.4, -0.4])
    b.part(new THREE.BoxGeometry(0.36, 0.08, 0.32), STEEL[1], { at: [s, 3.34, -0.9], bone: chassis });
  decal(glass(32, 17, true), 1.6, 0.85, [0, 2.7, 0.607], [0, 0, 1], chassis);
  decal(glass(24, 10, false), 1.2, 0.5, [0, 2.85, -1.515], [0, 0, -1], chassis);
  for (const s of sides) decal(star, 0.35, 0.35, [s * 0.92, 2.5, -1.25], [s, 0, 0], chassis);

  // Doors: panel, window, number seven, handle and mirror, each on its own hinge.
  sides.forEach((s, i) => {
    const door = doorBones[i];
    b.part(new THREE.BoxGeometry(0.08, 1.2, 1.55), body, { at: [s * 0.94, 2.6, -0.225], bone: door });
    decal(glass(22, 10, false), 1.1, 0.5, [s * 0.982, 2.9, -0.3], [s, 0, 0], door);
    decal(seven, 0.3, 0.45, [s * 0.982, 2.2, -0.3], [s, 0, 0], door);
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.22), STEEL[4], { at: [s * 0.99, 2.45, -0.8], bone: door });
    b.part(new THREE.BoxGeometry(0.14, 0.22, 0.1), INK, { at: [s * 1.03, 2.95, 0.6], bone: door });
  });

  // Roll cage, light bar and jerry can on the roof.
  for (const s of sides) {
    for (const z of [0.65, -1.6])
      b.rod([s * 0.92, 2.0, z], [s * 0.92, 3.6, z], 0.035, { color: STEEL[4], bone: chassis });
    b.rod([s * 0.92, 3.6, 0.65], [s * 0.92, 3.6, -1.6], 0.035, { color: STEEL[4], bone: chassis });
  }
  for (const z of [0.65, -0.5, -1.6])
    b.rod([-0.92, 3.6, z], [0.92, 3.6, z], 0.035, { color: STEEL[4], bone: chassis });
  b.part(new THREE.BoxGeometry(1.7, 0.12, 0.14), INK, { at: [0, 3.7, 0.68], bone: chassis });
  decal(led, 1.6, 0.15, [0, 3.7, 0.757], [0, 0, 1], chassis);
  b.part(new THREE.BoxGeometry(0.3, 0.34, 0.22), "#e0a000", { at: [0.55, 3.42, -1.1], bone: chassis });
  b.part(new THREE.BoxGeometry(0.12, 0.03, 0.03), INK, { at: [0.55, 3.6, -1.1], bone: chassis });

  // Twin exhaust stacks with black caps, and the antenna with its flag.
  for (const s of sides) {
    b.lathe(STACK, { at: [s * 0.72, 2.0, -1.75], axis: [0, 1, 0], segments: 10, color: STEEL[4], bone: chassis });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 10), INK, {
      at: [s * 0.72, 3.975, -1.75],
      dir: [0, 1, 0],
      bone: chassis,
    });
  }
  b.rod([0.78, 3.3, -1.1], [0.78, 4.1, -1.1], 0.02, { color: INK, bone: chassis });
  decal(flag, 0.4, 0.25, [1.0, 3.92, -1.1], [0, 0, 1], chassis);

  return b.root;
}
