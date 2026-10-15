// Monster truck: pixel-art pickup on huge lugged tyres, flame paint job, coil-over suspension, roll cage and a roof light bar.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { spiral } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { glow } from "../../../../kits/glow";
import { cellPaint, pixelArt, pixelTexture, snapColor } from "../../../../kits/pixel";

export const meta = {
  name: "Monster Truck",
  description:
    "A blue pixel-art monster truck with flame paint, four-link suspension with blue coil-overs, roll cage, roof light bar and four huge lugged tyres on chrome rims.",
  style: "pixel art",
  commit: "88fc1f0",
};

type Fill = string | Paint;
type V = [number, number, number];

const BLUE = ["#0a2272", "#103aa8", "#1d58d8", "#4a8af0"].map((c) => snapColor(c, 32));
const TYRE = ["#0c0d10", "#17181d", "#25272e", "#373a44"].map((c) => snapColor(c, 32));
const FLAME_Y = "#ffd51f";
const FLAME_O = "#ff991a";
const FLAME_R = "#e63e1c";
const FLAME_D = "#9c1c10";
const CHROME = "#b4bac4";
const CHROME_D = "#6d737e";
const CHROME_L = "#e4e8ee";
const DARK = "#14151b";
const STEEL = "#3a3d47";
const SPRING = "#1f64e6";
const BLUE_TRIM = "#1d58d8";
const INTERIOR = "#20222b";
const SEAT = "#2e3242";

const bodyPaint = cellPaint(
  0.05,
  (c) => {
    const y = c.at.y;
    const z = c.at.z;
    const light = 0.5 + 0.3 * c.n.y + 0.12 * c.n.z;
    if (c.axis === 0 && y > 2.05 && y < 2.95 && z < 2.55) {
      const t = y - 2.1;
      const ph = (z * 5.2 + y * 3.2) / Math.PI;
      const k = Math.floor(ph);
      const f = ph - k;
      const tri = 1 - Math.abs(f * 2 - 1);
      const v = Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1;
      const tongue = (0.1 + 0.72 * tri * tri) * (0.75 + 0.25 * v);
      const r = t / tongue;
      if (r < 0.5) return FLAME_Y;
      if (r < 0.78) return FLAME_O;
      if (r < 0.94) return FLAME_R;
      if (r < 1.0) return FLAME_D;
    }
    return c.pick(BLUE, light + 0.05 * (noise(c.at, 0.3, 4) - 0.5));
  },
  { dither: true },
);

const lugGeo = (cx: number, cy: number, cz: number, R: number, count: number) => {
  const gs: THREE.BufferGeometry[] = [];
  const X = new THREE.Vector3(1, 0, 0);
  const Y = new THREE.Vector3(0, 1, 0);
  const one = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < count; i++) {
    const a = (2 * Math.PI * i) / count;
    const qx = new THREE.Quaternion().setFromAxisAngle(X, a);
    for (const sg of [1, -1]) {
      const qy = new THREE.Quaternion().setFromAxisAngle(Y, sg * 0.45);
      const q = qx.clone().multiply(qy);
      const pos = new THREE.Vector3(cx + sg * 0.22, cy + R * Math.cos(a), cz + R * Math.sin(a));
      const g = new THREE.BoxGeometry(0.46, 0.15, 0.26);
      g.applyMatrix4(new THREE.Matrix4().compose(pos, q, one));
      gs.push(g);
    }
  }
  return mergeGeometries(gs)!;
};

const studGeo = (cx: number, cy: number, cz: number, R: number, count: number, size: V, sides: number[]) => {
  const gs: THREE.BufferGeometry[] = [];
  const X = new THREE.Vector3(1, 0, 0);
  const one = new THREE.Vector3(1, 1, 1);
  for (const sx of sides)
    for (let i = 0; i < count; i++) {
      const a = (2 * Math.PI * i) / count;
      const q = new THREE.Quaternion().setFromAxisAngle(X, a);
      const pos = new THREE.Vector3(cx + sx, cy + R * Math.cos(a), cz + R * Math.sin(a));
      const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
      g.applyMatrix4(new THREE.Matrix4().compose(pos, q, one));
      gs.push(g);
    }
  return mergeGeometries(gs)!;
};

const glassTex = (w: number, h: number, seed: number) =>
  pixelTexture(w, h, (g) => {
    g.fill((_x, y) => (y < 2 ? "#2d4468" : "#16233b"));
    g.fill((x, y) => ((x + y * 2 + seed) % 9 < 2 ? "#3d5f92" : undefined));
    g.fill(() => "#080b12", [Math.floor(w * 0.18), h - 3, Math.max(2, Math.floor(w * 0.22)), 3]);
    g.fill(() => "#080b12", [Math.floor(w * 0.62), h - 3, Math.max(2, Math.floor(w * 0.22)), 3]);
    g.fill(() => "#080b12", [Math.floor(w * 0.2), h - 5, 2, 2]);
    g.fill(() => "#080b12", [Math.floor(w * 0.64), h - 5, 2, 2]);
  });

const GRILLE = pixelTexture(24, 10, (g) => {
  g.fill(() => "#0d0e13");
  g.fill(() => CHROME, [0, 0, 24, 1]);
  g.fill(() => CHROME_D, [0, 9, 24, 1]);
  g.fill(() => CHROME, [0, 0, 1, 10]);
  g.fill(() => CHROME, [23, 0, 1, 10]);
  for (const y of [2, 4, 6, 8]) g.fill(() => "#8b919c", [1, y, 22, 1]);
  g.fill(() => CHROME, [11, 1, 2, 8]);
  g.stamp(10, 4, ["bbbb"], { b: "#1d58d8" });
});

const HEADLIGHT = pixelArt(
  ["ssssssss", "swwwwwws", "swwyywws", "swyyyyws", "swwyywws", "swwwwwws", "ssssssss"],
  { s: "#7c828d", w: "#f4f8ff", y: "#fff1a0" },
);
const AMBER = pixelArt(["dddddd", "doOOod", "doOOod", "dddddd"], { d: "#5c3a10", o: "#ff9c1a", O: "#ffd27a" });
const TAIL = pixelArt(["dddddd", "drRRrd", "drRRrd", "drrrrd", "drrrrd", "dddddd"], {
  d: "#3a0c0c",
  r: "#ff2a2a",
  R: "#ff9a9a",
});
const LAMP = pixelArt(["sssss", "swyws", "wyyyw", "swyws", "sssss"], { s: "#9aa0aa", w: "#ffffff", y: "#fff3b0" });
const PLATE = pixelArt(
  ["wwwwwwwwwwww", "wbbbbbbbbbbw", "wwwwwwwwwwww", "wkkwkkwkkkww", "wkkwkkwkwkww", "wwwwwwwwwwww"],
  { w: "#e8e8d8", b: "#1d58d8", k: "#20222b" },
);
const VENT = pixelTexture(10, 5, (g) => {
  g.fill(() => "#0a0b10");
  for (const y of [1, 3]) g.fill(() => "#2f333d", [1, y, 8, 1]);
});

export default function build() {
  const b = createBuilder({ name: "monsterTruck" });

  const chassis = b.joint("chassis", { at: [0, 1.8, 0], role: "spine" });
  const FZ = 1.7;
  const RZ = -1.5;
  const WX = 1.45;
  const CY = 0.92;
  const axleF = b.joint("axleF", { parent: chassis, at: [0, CY, FZ], dir: [0, 0, 1], role: "hinge" });
  const axleR = b.joint("axleR", { parent: chassis, at: [0, CY, RZ], dir: [0, 0, 1], role: "hinge" });

  const box = (size: V, color: Fill, at: V, o: { bone?: Joint; rotation?: V } = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: o.bone ?? chassis,
      at,
      ...(o.rotation ? { rotation: o.rotation } : {}),
    });
  const rodC = (a: V, c: V, r: number, color: Fill, bone: Joint = chassis) =>
    b.rod(a, c, r, color, { bone, sides: 6 });
  const plane = (tex: THREE.Texture, size: [number, number], at: V, dir: V, bone: Joint = chassis) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", { texture: tex, bone, at, dir, axis: "z" });
  const ball = (r: number, color: Fill, at: V, bone: Joint = chassis) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { bone, at });

  // ---------------- Wheels ----------------
  const makeWheel = (name: string, x: number, z: number, parent: Joint, s: number) => {
    const wj = b.joint(name, { parent, at: [x, CY, z], dir: [s, 0, 0], role: "hinge" });
    const tyrePaint = cellPaint(
      0.045,
      (c) => {
        const r = Math.hypot(c.at.y - CY, c.at.z - z);
        if (c.axis === 0 && r > 0.56 && r < 0.61) return "#c8ccd4";
        const v = 0.28 + 0.3 * noise(c.at, 0.12, 5) + 0.18 * c.n.y + (c.random(2) < 0.07 ? 0.3 : 0);
        return c.pick(TYRE, v);
      },
      { dither: true },
    );
    const lugPaint = cellPaint(
      0.045,
      (c) => c.pick(TYRE, 0.45 + 0.35 * c.n.y + 0.15 * noise(c.at, 0.1, 8) + (c.random(4) < 0.08 ? 0.2 : 0)),
      { dither: true },
    );
    const at: V = [x, CY, z];
    b.lathe(
      [
        [0, -0.45],
        [0.52, -0.45],
        [0.76, -0.44],
        [0.84, -0.36],
        [0.86, -0.28],
        [0.86, 0.28],
        [0.84, 0.36],
        [0.76, 0.44],
        [0.52, 0.45],
        [0, 0.45],
      ],
      { at, axis: [1, 0, 0], bone: wj, color: tyrePaint, segments: 20 },
    );
    b.part(lugGeo(x, CY, z, 0.87, 18), lugPaint, { bone: wj, at: [0, 0, 0] });
    // Rim: chrome barrel with beadlock lips and a blue centre disc.
    b.lathe(
      [
        [0, -0.47],
        [0.5, -0.47],
        [0.5, -0.38],
        [0.44, -0.38],
        [0.44, 0.38],
        [0.5, 0.38],
        [0.5, 0.47],
        [0, 0.47],
      ],
      { at, axis: [1, 0, 0], bone: wj, color: CHROME, segments: 16 },
    );
    b.lathe(
      [
        [0, -0.485],
        [0.36, -0.485],
        [0.36, 0.485],
        [0, 0.485],
      ],
      { at, axis: [1, 0, 0], bone: wj, color: "#1d58d8", segments: 12 },
    );
    b.part(studGeo(x, CY, z, 0.26, 8, [0.06, 0.07, 0.07], [-0.5, 0.5]), CHROME_L, { bone: wj, at: [0, 0, 0] });
    b.part(studGeo(x, CY, z, 0.46, 16, [0.05, 0.05, 0.06], [-0.48, 0.48]), CHROME_D, { bone: wj, at: [0, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 1.04, 8), "#8b919c", { bone: wj, at, rotation: [0, 0, 90] });
    return wj;
  };
  const steerFL = b.joint("steerFL", { parent: axleF, at: [WX, CY, FZ], dir: [0, 1, 0], role: "hinge" });
  const steerFR = b.joint("steerFR", { parent: axleF, at: [-WX, CY, FZ], dir: [0, 1, 0], role: "hinge" });
  makeWheel("wheelFL", WX, FZ, steerFL, 1);
  makeWheel("wheelFR", -WX, FZ, steerFR, -1);
  makeWheel("wheelRL", WX, RZ, axleR, 1);
  makeWheel("wheelRR", -WX, RZ, axleR, -1);

  // ---------------- Axles, links, frame ----------------
  for (const [ax, z] of [
    [axleF, FZ],
    [axleR, RZ],
  ] as const) {
    rodC([-1.05, CY, z], [1.05, CY, z], 0.1, STEEL, ax);
    b.part(new THREE.SphereGeometry(0.27, 8, 6), "#4a4e5a", { bone: ax, at: [0, CY, z] });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 8), CHROME_D, {
      bone: ax,
      at: [0, CY, z + (z > 0 ? 0.24 : -0.24)],
      rotation: [90, 0, 0],
    });
    const inward = z > 0 ? -0.8 : 0.9;
    for (const s of [1, -1]) {
      rodC([s * 0.45, CY + 0.05, z], [s * 0.45, 1.78, z + inward], 0.045, SPRING, ax);
      rodC([s * 0.8, CY + 0.12, z + 0.0], [s * 0.55, 1.78, z + inward * 0.5], 0.04, SPRING, ax);
      // Coil-over shocks.
      const sx = s * 0.72;
      rodC([sx, 1.02, z], [sx, 1.62, z], 0.05, "#2b2e38");
      rodC([sx, 1.5, z], [sx, 2.02, z], 0.03, CHROME);
      ball(0.06, CHROME_D, [sx, 1.0, z], ax);
      box([0.16, 0.08, 0.2], STEEL, [sx, 2.05, z]);
      const path = spiral([sx, 1.06, z], [sx + 0.1, 1.06, z], [0, 1, 0], { turns: 6, r1: 0.1, pitch: 0.15 });
      b.sweep(path, 0.022, SPRING, { bone: chassis, sides: 5 });
    }
    // Panhard/steering link
    rodC([-0.95, CY + 0.18, z + (z > 0 ? 0.2 : -0.2)], [0.95, CY + 0.18, z + (z > 0 ? 0.2 : -0.2)], 0.035, CHROME_D, ax);
  }
  for (const s of [1, -1]) {
    box([0.2, 0.26, 4.7], DARK, [s * 0.55, 1.75, 0]);
    box([0.14, 0.06, 4.5], STEEL, [s * 0.55, 1.89, 0]);
    for (const z of [-1.9, 1.3, 2.3]) box([0.3, 0.2, 0.3], STEEL, [s * 0.55, 1.97, z]);
  }
  for (const z of [-2.2, -0.3, 0.9, 2.2]) box([1.3, 0.14, 0.2], DARK, [0, 1.75, z]);
  box([1.2, 0.06, 1.1], "#4a4e5a", [0, 1.58, 0.2]);
  box([0.7, 0.36, 0.6], "#2b2e38", [0, 1.72, 0.2]);
  // Driveshafts
  rodC([0, CY + 0.05, FZ - 0.1], [0, 1.68, 0.4], 0.06, CHROME_D);
  rodC([0, 1.68, 0.0], [0, CY + 0.05, RZ + 0.1], 0.06, CHROME_D);
  // Fuel tank and exhaust
  box([0.7, 0.3, 0.55], "#5a1f1a", [0.0, 1.75, -1.0]);
  for (const s of [1, -1]) rodC([s * 0.3, 1.7, 0.6], [s * 0.3, 1.7, -2.5], 0.05, CHROME_D);

  // ---------------- Body ----------------
  box([2.1, 0.7, 3.0], bodyPaint, [0, 2.45, 1.0]);
  box([0.14, 0.85, 1.9], bodyPaint, [1.0, 2.525, -1.45]);
  box([0.14, 0.85, 1.9], bodyPaint, [-1.0, 2.525, -1.45]);
  box([2.1, 0.85, 0.12], bodyPaint, [0, 2.525, -2.42]);
  box([1.9, 0.1, 1.9], "#1a1c23", [0, 2.22, -1.45]);
  for (const z of [-0.8, -1.2, -1.6, -2.0]) box([1.85, 0.03, 0.07], "#2a2d38", [0, 2.28, z]);
  box([1.92, 0.7, 0.08], "#16171d", [0, 2.6, -2.34]);
  for (const s of [1, -1]) {
    box([0.06, 0.62, 1.9], "#16171d", [s * 0.92, 2.58, -1.45]);
    box([0.18, 0.05, 1.96], CHROME_D, [s * 1.0, 2.98, -1.45]);
  }
  // Hood
  box([1.9, 0.16, 1.5], bodyPaint, [0, 2.88, 1.7]);
  box([0.78, 0.3, 0.72], "#0f2f94", [0, 3.08, 1.75]);
  plane(VENT, [0.6, 0.22], [0, 3.08, 2.116], [0, 0, 1]);
  box([0.82, 0.04, 0.76], "#0a1c60", [0, 3.24, 1.75]);
  for (const s of [1, -1]) {
    box([0.03, 0.02, 1.4], "#0a1c60", [s * 0.5, 2.97, 1.7]);
    for (const z of [1.1, 2.3]) box([0.05, 0.04, 0.05], CHROME, [s * 0.8, 2.97, z]);
  }
  // Cab
  box([1.9, 0.82, 0.1], bodyPaint, [0, 3.21, -0.45]);
  box([2.0, 0.1, 1.45], bodyPaint, [0, 3.65, 0.075]);
  box([0.5, 0.4, 0.04], "#16233b", [0, 3.3, -0.505]);
  plane(glassTex(14, 6, 3), [1.3, 0.4], [0, 3.3, -0.51], [0, 0, -1]);
  plane(glassTex(22, 9, 0), [1.8, 0.8], [0, 3.2, 0.835], [0, 0.29, 0.96]);
  box([0.5, 0.02, 0.02], DARK, [0, 2.84, 0.8]);
  for (const s of [1, -1]) {
    box([0.1, 0.9, 0.12], bodyPaint, [s * 0.94, 3.2, 0.83], { rotation: [-17, 0, 0] });
    box([0.1, 0.82, 0.12], bodyPaint, [s * 0.98, 3.21, 0.0]);
    box([0.1, 0.82, 0.3], bodyPaint, [s * 0.98, 3.21, -0.4]);
    box([0.1, 0.1, 1.4], bodyPaint, [s * 0.98, 3.6, 0.1]);
    plane(glassTex(16, 10, 5 + s), [0.7, 0.66], [s * 0.93, 3.21, 0.42], [s, 0, 0]);
    plane(glassTex(8, 8, 2), [0.24, 0.66], [s * 0.93, 3.21, -0.19], [s, 0, 0]);
    // wipers
    rodC([s * 0.1, 2.86, 0.98], [s * 0.7, 3.1, 0.82], 0.012, DARK);
    // Door seams, handles, mirrors
    box([0.02, 0.7, 0.03], "#0a1c60", [s * 1.052, 2.45, 0.92]);
    box([0.02, 0.7, 0.03], "#0a1c60", [s * 1.052, 2.45, -0.02]);
    box([0.02, 0.7, 0.03], "#0a1c60", [s * 1.052, 2.45, -0.5]);
    box([0.04, 0.05, 0.2], CHROME, [s * 1.065, 2.68, 0.08]);
    box([0.04, 0.05, 0.2], CHROME, [s * 1.065, 2.68, 0.84]);
    box([0.25, 0.04, 0.04], DARK, [s * 1.1, 3.2, 0.82]);
    box([0.06, 0.3, 0.2], CHROME, [s * 1.23, 3.25, 0.82]);
    box([0.07, 0.24, 0.14], "#6d9bd8", [s * 1.23, 3.25, 0.82]);
    // Wheel arches: trim and dark recess
    for (const z of [FZ, RZ]) {
      const outline = (r: number) => {
        const pts: [number, number][] = [];
        for (let k = 0; k <= 10; k++) {
          const a = Math.PI - (k * Math.PI) / 10;
          pts.push([r * Math.cos(a), r * Math.sin(a)]);
        }
        return pts;
      };
      b.extrude(outline(0.76), {
        at: [s * 1.05, 2.1, z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.05,
        color: BLUE_TRIM,
        bone: chassis,
      });
      b.extrude(outline(0.68), {
        at: [s * 1.07, 2.1, z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.04,
        color: "#0a0b10",
        bone: chassis,
      });
    }
    // Interior
    box([0.5, 0.12, 0.5], SEAT, [s * 0.4, 2.86, 0.05]);
    box([0.5, 0.58, 0.1], SEAT, [s * 0.4, 3.18, -0.25]);
    box([0.3, 0.18, 0.08], SEAT, [s * 0.4, 3.52, -0.25]);
    // Roll cage
    rodC([s * 0.85, 2.95, -1.3], [s * 0.85, 3.72, -1.3], 0.045, DARK);
    rodC([s * 0.85, 3.72, -1.3], [s * 0.85, 3.68, -0.6], 0.045, DARK);
    rodC([s * 0.85, 3.72, -1.3], [s * 0.4, 3.0, -0.7], 0.035, DARK);
    ball(0.065, DARK, [s * 0.85, 3.72, -1.3]);
    // Exhaust stacks
    rodC([s * 0.58, 2.3, -0.7], [s * 0.58, 3.55, -0.7], 0.06, CHROME);
    box([0.14, 0.05, 0.14], CHROME_D, [s * 0.58, 2.6, -0.7]);
    box([0.14, 0.05, 0.14], CHROME_D, [s * 0.58, 3.2, -0.7]);
    // Headlights, indicators, fog, tail lights
    b.part(new THREE.BoxGeometry(0.32, 0.26, 0.06), CHROME_D, { bone: chassis, at: [s * 0.8, 2.64, 2.53] });
    glow(plane(HEADLIGHT, [0.28, 0.22], [s * 0.8, 2.64, 2.564], [0, 0, 1]), 1.2);
    glow(plane(AMBER, [0.26, 0.13], [s * 0.8, 2.4, 2.504], [0, 0, 1]), 1);
    glow(plane(AMBER, [0.14, 0.1], [s * 0.7, 2.2, 2.785], [0, 0, 1]), 1);
    b.part(new THREE.BoxGeometry(0.24, 0.38, 0.06), CHROME_D, { bone: chassis, at: [s * 0.88, 2.58, -2.5] });
    glow(plane(TAIL, [0.2, 0.34], [s * 0.88, 2.58, -2.534], [0, 0, -1]), 1);
    box([0.08, 0.08, 0.12], "#d82a1e", [s * 0.55, 2.04, 2.86]);
    box([0.2, 0.1, 0.02], "#0a0b10", [s * 0.4, 2.2, 2.785]);
  }
  // Front fascia
  box([1.3, 0.55, 0.05], DARK, [0, 2.52, 2.52]);
  plane(GRILLE, [1.2, 0.5], [0, 2.52, 2.551], [0, 0, 1]);
  // Dash and wheel
  box([1.8, 0.2, 0.3], INTERIOR, [0, 2.92, 0.7]);
  b.part(new THREE.TorusGeometry(0.15, 0.025, 5, 10), "#101116", {
    bone: chassis,
    at: [0.4, 3.1, 0.5],
    rotation: [-35, 0, 0],
  });
  // Bumpers
  box([2.2, 0.3, 0.28], CHROME, [0, 2.2, 2.64]);
  box([2.2, 0.06, 0.3], CHROME_L, [0, 2.32, 2.64]);
  box([2.2, 0.3, 0.28], CHROME, [0, 2.2, -2.6]);
  box([2.2, 0.06, 0.3], CHROME_L, [0, 2.32, -2.6]);
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    rivets.push(new THREE.BoxGeometry(0.05, 0.05, 0.02).translate(-0.95 + i * 0.173, 2.14, 2.785));
    rivets.push(new THREE.BoxGeometry(0.05, 0.05, 0.02).translate(-0.95 + i * 0.173, 2.14, -2.745));
  }
  b.part(mergeGeometries(rivets)!, CHROME_D, { bone: chassis, at: [0, 0, 0] });
  plane(PLATE, [0.5, 0.25], [0, 2.2, -2.746], [0, 0, -1]);
  for (const y of [2.45, 2.7]) box([1.8, 0.05, 0.04], "#103aa8", [0, y, -2.49]);
  // Roof light bar
  box([1.7, 0.12, 0.22], DARK, [0, 3.73, 0.5]);
  for (const lx of [-0.6, -0.2, 0.2, 0.6]) {
    box([0.3, 0.26, 0.2], "#2a2c34", [lx, 3.87, 0.5]);
    glow(plane(LAMP, [0.24, 0.2], [lx, 3.87, 0.606], [0, 0, 1]), 1.2);
  }
  // Roll cage cross bars
  rodC([-0.85, 3.72, -1.3], [0.85, 3.72, -1.3], 0.045, DARK);
  rodC([-0.85, 3.2, -1.3], [0.85, 3.2, -1.3], 0.035, DARK);
  // Bed cargo
  box([0.5, 0.34, 0.36], "#d8302a", [-0.5, 2.44, -1.9]);
  box([0.52, 0.06, 0.38], "#f0f0f0", [-0.5, 2.64, -1.9]);
  box([0.28, 0.36, 0.14], "#4a7a2a", [0.5, 2.45, -2.0]);
  box([0.1, 0.06, 0.1], "#2a4a14", [0.5, 2.67, -2.0]);
  // Antenna
  rodC([0.9, 2.95, -2.25], [0.9, 4.2, -2.3], 0.012, DARK);
  box([0.28, 0.16, 0.012], FLAME_O, [0.76, 4.12, -2.3]);
  ball(0.025, FLAME_R, [0.9, 4.22, -2.3]);

  return b.root;
}
