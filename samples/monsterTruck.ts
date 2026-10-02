import * as THREE from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { rng } from "../src/math";
import { pixelArt, pixelTexture, tileBox, cellPaint } from "../kits/pixel";
const TEXEL = 0.035;
const INK = "#101522";
const STEEL = "#263449";
const STEEL_LIGHT = "#526276";
const RUBBER = "#171a23";
const RUBBER_HI = "#303746";
const YELLOW = "#f2bf32";
const YELLOW_DARK = "#a86b20";
const ORANGE = "#e36b2c";
const RED = "#b93836";
const TEAL = "#2d9c9a";
const GLASS = "#7bd3c7";
const LIGHT = "#ffe58b";
const BLUE_LIGHT = "#79d8e8";

const BODY_PAINT = cellPaint(TEXEL, (c) => {
  const band = ((c.v % 8) + 8) % 8;
  if (c.axis === 2 && band === 0) return YELLOW_DARK;
  if (c.axis === 2 && band === 1) return ORANGE;
  if (c.random(4) < 0.04) return ORANGE;
  return c.pick([YELLOW_DARK, YELLOW, YELLOW, ORANGE], 0.58 + 0.12 * c.n.y);
}, { dither: true });
const STEEL_PAINT = cellPaint(TEXEL, (c) => c.pick([INK, STEEL, STEEL_LIGHT], 0.38 + c.n.y * 0.25), { dither: true });

const BODY_TILE = pixelTexture(128, 64, (g) => {
  g.fill((x, y) => {
    const stripe = y % 16;
    if (stripe === 0 || stripe === 1) return ORANGE;
    if ((x + Math.floor(y / 4)) % 23 === 0) return YELLOW_DARK;
    return y % 8 < 4 ? YELLOW : YELLOW_DARK;
  });
  for (let x = 0; x < 128; x += 16) {
    g.set(x, 4, INK); g.set(x + 1, 4, INK); g.set(x, 5, INK); g.set(x + 1, 5, INK);
  }
});
const GLASS_TILE = pixelTexture(48, 32, (g) => {
  g.fill((x, y) => {
    if (x < 3 || y < 3 || x > 44 || y > 28) return INK;
    if ((x + y) % 9 === 0) return BLUE_LIGHT;
    return y < 14 ? GLASS : TEAL;
  });
  for (let x = 7; x < 44; x += 10) g.set(x, 7, LIGHT);
});
const NUMBER_EIGHT = pixelArt([
  "..kkkkkk..",
  ".kkwwwwkk.",
  "kkwwkkwwkk",
  "kkwwkkwwkk",
  ".kkwwwwkk.",
  "kkwwkkwwkk",
  "kkwwkkwwkk",
  ".kkwwwwkk.",
  "..kkkkkk..",
], { k: INK, w: LIGHT });
const HEADLIGHT = pixelArt([
  "kkkkkkkk",
  "kwwwwwwk",
  "kwllllwk",
  "kwllllwk",
  "kwwwwwwk",
  "kkkkkkkk",
], { k: INK, w: LIGHT, l: "#fff8c4" });

export const meta = {
  name: "Pixel Thunder Monster Truck",
  description: "A towering pixel-art monster truck with giant knobby tyres, a hot-rod cab, exposed suspension, and hand-built racing details.",
  style: "pixel art",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "monsterTruck", detail: 0.85, paintSize: 1024 });
  const chassis = b.joint("chassis", { at: [0, 1.18, 0], role: "spine" });

  const wheelPositions: Array<[number, number, string]> = [
    [1.42, 1.24, "wheelFL"],
    [-1.42, 1.24, "wheelFR"],
    [1.42, -1.26, "wheelRL"],
    [-1.42, -1.26, "wheelRR"],
  ];
  const wheels = wheelPositions.map(([x, z, name]) =>
    b.joint(name, { parent: chassis, at: [x, 0.84, z], dir: [1, 0, 0], role: "hinge" }),
  );

  const box = (size: [number, number, number], at: [number, number, number], color: Fill, name: string, texture?: Texture) =>
    b.part(texture ? tileBox(size, texture, TEXEL, { rand: rng(name.length + 7), step: [2, 4] }) : new THREE.BoxGeometry(...size), color, {
      at,
      name,
      flat: true,
      ...(texture ? { texture } : {}),
    });
  const cyl = (radius: number, height: number, at: [number, number, number], color: Fill, name: string, segments = 10, bone?: (typeof wheels)[number]) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      bone,
      rotation: [0, 0, 90],
      name,
      flat: true,
    });

  // The low chassis is a dense, dark pixel-painted mechanical slab.
  box([2.65, 0.28, 4.45], [0, 1.12, 0], STEEL, "frameRail", BODY_TILE);
  box([2.82, 0.15, 4.62], [0, 0.96, 0], INK, "bellySkid");
  box([2.45, 0.64, 3.72], [0, 1.49, 0], YELLOW, "lowerBody", BODY_TILE);
  box([2.22, 0.20, 3.92], [0, 1.78, -0.04], BODY_PAINT, "beltStripe");

  // Cab, hood, and rear bed: large crisp silhouettes with contrasting pixel tiles.
  box([2.08, 1.18, 1.62], [0, 2.19, 0.48], YELLOW, "cab", BODY_TILE);
  box([2.24, 0.16, 1.72], [0, 2.82, 0.48], ORANGE, "cabRoof");
  box([2.30, 0.52, 1.20], [0, 1.94, 1.82], YELLOW, "hood", BODY_TILE);
  box([2.34, 0.12, 1.30], [0, 2.22, 1.84], YELLOW_DARK, "hoodRidge");
  box([2.30, 0.76, 1.36], [0, 1.93, -1.17], YELLOW, "rearBed", BODY_TILE);
  box([2.42, 0.17, 1.50], [0, 2.34, -1.17], ORANGE, "bedRail");
  box([2.18, 0.08, 1.25], [0, 2.35, -1.17], INK, "bedInterior");

  // Pixel windows and their thick surrounding pillars.
  box([1.68, 0.55, 0.045], [0, 2.27, 1.305], TEAL, "windshield", GLASS_TILE);
  for (const s of [1, -1]) {
    box([0.045, 0.58, 0.76], [s * 1.065, 2.28, 0.44], TEAL, `sideWindow${s}`, GLASS_TILE);
    box([0.055, 0.66, 0.08], [s * 1.09, 2.28, 0.02], INK, `windowPillar${s}`);
    box([0.055, 0.07, 0.88], [s * 1.09, 2.57, 0.44], INK, `windowTopRail${s}`);
    box([0.055, 0.07, 0.88], [s * 1.09, 1.98, 0.44], INK, `windowBottomRail${s}`);
  }

  // Front grille, bumper, and squared headlights.
  box([2.74, 0.26, 0.24], [0, 1.07, 2.42], STEEL_PAINT, "frontBumper");
  box([1.64, 0.37, 0.055], [0, 1.72, 2.405], INK, "grillePanel");
  for (let x = -0.66; x <= 0.66; x += 0.22) box([0.055, 0.31, 0.07], [x, 1.72, 2.45], STEEL_LIGHT, `grilleBar${x}`);
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.40, 0.27, 0.045), LIGHT, {
      at: [s * 0.82, 2.08, 2.405], texture: HEADLIGHT, name: `headlamp${s}`, flat: true,
    });
    box([0.10, 0.31, 0.08], [s * 1.16, 1.97, 2.44], RED, `grilleCorner${s}`);
  }
  box([2.60, 0.26, 0.22], [0, 1.08, -2.04], STEEL_PAINT, "rearBumper");

  // Side number panels and chunky steps.
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.48, 0.52), LIGHT, {
      at: [s * 1.19, 1.60, 0.30], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: NUMBER_EIGHT,
      name: `raceNumber${s}`,
    });
    b.part(new THREE.PlaneGeometry(0.40, 0.40), LIGHT, {
      at: [s * 1.22, 2.06, -1.16], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: NUMBER_EIGHT,
      name: `bedNumber${s}`, flat: true,
    });
    b.rod([s * 1.30, 1.17, -0.55], [s * 1.30, 1.17, 1.02], 0.065, { color: INK, name: `sideStep${s}` });
    b.rod([s * 1.30, 1.10, -0.62], [s * 1.30, 1.10, -0.12], 0.038, { color: STEEL_LIGHT, name: `stepBracketA${s}` });
    b.rod([s * 1.30, 1.10, 0.62], [s * 1.30, 1.10, 0.14], 0.038, { color: STEEL_LIGHT, name: `stepBracketB${s}` });
    box([0.18, 0.22, 1.98], [s * 1.17, 1.64, -0.02], RED, `fenderFlare${s}`);
    box([0.22, 0.18, 1.72], [s * 1.20, 1.92, -0.04], YELLOW_DARK, `fenderTop${s}`);
  }

  // Roll cage and roof light bar.
  for (const s of [1, -1]) {
    b.rod([s * 0.90, 1.86, -0.34], [s * 0.90, 2.97, -0.34], 0.045, { color: INK, name: `cageRear${s}` });
    b.rod([s * 0.90, 2.97, -0.34], [s * 0.90, 2.97, 1.04], 0.045, { color: INK, name: `cageRoof${s}` });
    b.rod([s * 0.90, 1.88, 1.02], [s * 0.90, 2.95, 1.02], 0.045, { color: INK, name: `cageA${s}` });
  }
  b.rod([-1.13, 3.00, 0.60], [1.13, 3.00, 0.60], 0.06, { color: STEEL_LIGHT, name: "lightBar" });
  for (let x = -0.90; x <= 0.90; x += 0.45) cyl(0.095, 0.12, [x, 3.08, 0.60], x === 0 ? BLUE_LIGHT : LIGHT, `roofLamp${x}`, 8);

  // Twin exhaust stacks with pixel bands.
  for (const s of [1, -1]) {
    b.rod([s * 0.78, 2.42, -0.52], [s * 0.78, 3.36, -0.52], 0.075, { color: STEEL_PAINT, name: `exhaust${s}` });
    b.rod([s * 0.78, 3.28, -0.52], [s * 0.78, 3.40, -0.52], 0.11, { color: INK, name: `exhaustTip${s}` });
    box([0.20, 0.10, 0.20], [s * 0.78, 2.74, -0.52], ORANGE, `exhaustBand${s}`);
  }

  // Axles, differential pumpkins, and visible shocks.
  for (const z of [1.24, -1.26]) {
    b.rod([-1.42, 0.84, z], [1.42, 0.84, z], 0.10, { color: STEEL_PAINT, name: `axle${z}` });
    b.part(new THREE.SphereGeometry(0.21, 8, 6), STEEL_LIGHT, { at: [0, 0.84, z], name: `differential${z}`, flat: true });
    for (const s of [1, -1]) {
      b.rod([s * 1.12, 1.08, z], [s * 0.92, 1.72, z + (z > 0 ? -0.18 : 0.18)], 0.045, { color: RED, name: `shock${s}${z}` });
      b.rod([s * 1.15, 1.12, z], [s * 0.94, 1.67, z + (z > 0 ? 0.18 : -0.18)], 0.032, { color: LIGHT, name: `shockRod${s}${z}` });
    }
  }

  // Four huge pixel-knobby tyres and their hubs.
  wheels.forEach((wheel, i) => {
    const [x, z] = wheelPositions[i];
    b.part(new THREE.CylinderGeometry(0.78, 0.78, 0.52, 12), RUBBER, { bone: wheel, at: [x, 0.84, z], rotation: [0, 0, 90], name: `tire${i}`, flat: true });
    b.part(new THREE.CylinderGeometry(0.61, 0.61, 0.055, 12), RUBBER_HI, { bone: wheel, at: [x, 0.84, z], rotation: [0, 0, 90], name: `sidewall${i}`, flat: true });
    b.part(new THREE.CylinderGeometry(0.29, 0.29, 0.075, 10), STEEL_LIGHT, { bone: wheel, at: [x, 0.84, z], rotation: [0, 0, 90], name: `hub${i}`, flat: true });
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.09, 8), ORANGE, { bone: wheel, at: [x, 0.84, z], rotation: [0, 0, 90], name: `hubCap${i}`, flat: true });
    for (let lug = 0; lug < 5; lug++) {
      const a = (lug / 5) * Math.PI * 2;
      const yy = 0.84 + Math.cos(a) * 0.20;
      const zz = z + Math.sin(a) * 0.20;
      b.part(new THREE.BoxGeometry(0.11, 0.055, 0.055), LIGHT, { bone: wheel, at: [x + (x > 0 ? 0.29 : -0.29), yy, zz], rotation: [0, 0, 90], name: `lug${i}_${lug}`, flat: true });
    }
    for (let tread = 0; tread < 14; tread++) {
      const a = (tread / 14) * Math.PI * 2;
      const yy = 0.84 + Math.cos(a) * 0.80;
      const zz = z + Math.sin(a) * 0.80;
      b.part(new THREE.BoxGeometry(0.60, 0.16, 0.22), tread % 3 === 0 ? RUBBER_HI : RUBBER, {
        bone: wheel,
        at: [x, yy, zz],
        rotation: [a * 180 / Math.PI, 0, 0],
        name: `tread${i}_${tread}`,
        flat: true,
      });
    }
  });

  // Tiny pixel details that sell the arcade-machine surface treatment.
  for (const z of [-1.72, -1.40, -1.08, -0.76]) {
    box([1.72, 0.035, 0.035], [0, 2.43, z], LIGHT, `bedRivet${z}`);
  }
  for (const s of [1, -1]) {
    for (let z = -1.72; z <= 1.72; z += 0.43) {
      b.part(new THREE.SphereGeometry(0.035, 6, 4), LIGHT, { at: [s * 1.22, 1.82, z], name: `bodyRivet${s}_${z}`, flat: true });
    }
  }

  return b.root;
}
