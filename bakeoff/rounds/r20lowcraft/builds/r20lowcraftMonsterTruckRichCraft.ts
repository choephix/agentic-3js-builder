// Monster truck with huge tyres, pixel art: blocky pickup body on a tall chassis, 1.8 m mud-caked tyres with
// chunky tread lugs, painted flames and dithered paint, pixel-textured grille, rims, glass and plates.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { lerp } from "../../../../src/math";
import type { PartOptions } from "../../../../src/parts";
import { cellPaint, pixelArt, pixelTexture, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Monster Truck",
  description:
    "Pixel-art monster truck: 1.8 m mud-caked tyres, chrome blown engine, flame-painted blue pickup body, hinged doors and tailgate, steering and spinning wheels.",
  style: "pixel art",
  commit: "88fc1f0",
};

const BLUES = ["#0a2a78", "#123fa8", "#1f5fd0", "#4a8af0", "#8cb8ff"];
const MUD = ["#3a2616", "#55391f", "#74502a"];
const TIRE_RAMP = ["#0c0c10", "#17171d", "#22222b"];
const CHROME = "#c9ced8";
const STEEL = "#7a8090";
const DARK = "#15171d";
const YELLOW = "#f2b81c";
const RED = "#d8402c";

const BODY = cellPaint(
  0.06,
  (c) => {
    const h = c.at.y;
    if (h < 2.4 && c.random(1) < (2.4 - h) * 0.9) return c.pick(MUD, 0.3 + 0.7 * c.random(2));
    if (c.random(9) < 0.012) return "#dfe9ff";
    const lift = Math.min(1, Math.max(0, (h - 2.2) / 1.2));
    return c.pick(BLUES, 0.42 + 0.28 * c.n.y + 0.2 * lift + 0.12 * (c.random(3) - 0.5));
  },
  { dither: true },
);

const TIRE = cellPaint(
  0.05,
  (c) => {
    if (c.at.y < 0.7 + 0.3 * c.random(4) && c.random(6) < 0.55) return c.pick(MUD, 0.2 + 0.8 * c.random(7));
    return c.pick(TIRE_RAMP, 0.3 + 0.5 * c.random(3));
  },
  { dither: true },
);

function flameTexture(flip: boolean) {
  return pixelTexture(96, 12, (g) =>
    g.fill((x0, y0) => {
      const x = flip ? 95 - x0 : x0;
      const yb = 11 - y0;
      const taper = 1 - (x / 96) * 0.35;
      const v = (x % 24) / 24;
      const edge = Math.min(12, 11.5 * Math.pow(v, 0.5) * (1 - Math.pow(v, 3)) * 1.6 * taper);
      if (yb < 1.2) return "#c8321c";
      if (yb > edge) return "";
      if (yb > edge - 1.3) return "#d8402c";
      if (yb < edge * 0.5) return "#ffe04a";
      return "#ff8a1c";
    }),
  );
}

function wheelTexture() {
  return pixelTexture(32, 32, (g) =>
    g.fill((x, y) => {
      const dx = x + 0.5 - 16;
      const dy = y + 0.5 - 16;
      const d = Math.hypot(dx, dy);
      if (d > 16) return "";
      const ang = Math.atan2(dy, dx);
      if (d < 2.2) return "#e0b030";
      if (d < 3.4) return "#3b3f4a";
      if (d < 9) {
        for (let k = 0; k < 5; k++) {
          const bxp = 5.6 * Math.cos((k * 72 * Math.PI) / 180);
          const byp = 5.6 * Math.sin((k * 72 * Math.PI) / 180);
          const dd = Math.hypot(dx - bxp, dy - byp);
          if (dd < 1.5) return "#f2f4f8";
          if (dd < 2.1) return "#2a2d36";
        }
        if (d < 4.2) return "#6f7787";
        if (d < 7) return "#9aa2b4";
        return "#c7cddb";
      }
      if (d < 10.5) return Math.floor((ang + Math.PI) / (Math.PI / 12)) % 2 ? CHROME : "#6f7787";
      if (d < 11.5) return "#1c1f28";
      if (d >= 13.5 && d < 14.5) return "#e8e8f0";
      return (x + y) % 7 === 0 ? "#1d1e26" : "#14151b";
    }),
  );
}

const GRILLE = pixelTexture(32, 12, (g) =>
  g.fill((x, y) => {
    if (y === 0 || y === 11 || x === 0 || x === 31) return CHROME;
    if (y >= 5 && y <= 6) return x > 11 && x < 20 ? "#1f5fd0" : "#8f97a6";
    return x % 3 === 1 ? "#e8ecf2" : "#14161c";
  }),
);

const NUMBER = pixelTexture(12, 12, (g) => {
  g.fill((x, y) => (Math.hypot(x + 0.5 - 6, y + 0.5 - 6) < 6 ? "#f4f4f0" : ""));
  g.stamp(3, 3, ["#####", "....#", "...#.", "..#..", "..#..", "..#.."], { "#": "#10131a" });
});

const GLASS = pixelTexture(16, 16, (g) =>
  g.fill((x, y) => {
    const d = (x + y) % 16;
    if (d === 3 || d === 4) return "#d6efff";
    if (d === 9) return "#9fd0f0";
    return (x + y * 3) % 5 === 0 ? "#2c5d86" : "#265070";
  }),
);

const LINER = pixelTexture(16, 16, (g) =>
  g.fill((x, y) => {
    if (y % 4 === 0) return "#15171d";
    if (y % 4 === 1) return "#3a3f4c";
    return (x * 7 + y * 3) % 11 === 0 ? "#4a5060" : "#2b2f3a";
  }),
);

const PLATE = pixelArt(
  ["bbbbbbbbbbbb", "bwwwwwwwwwwb", "bwkwkkwkwkwb", "bwkwkkwkwkwb", "bwwwwwwwwwwb", "bbbbbbbbbbbb"],
  { b: "#2a3a8a", w: "#f4f4f0", k: "#20222a" },
);

const FACE = pixelArt(["kkkkkkkk", "kwkkkkwk", "kbkkkkbk", "kkkkkkkk", "kkrrrrkk"], {
  k: "#1a1c24",
  w: "#ffffff",
  b: "#2a6bd0",
  r: "#e04040",
});

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });
  const chassis = b.joint("chassis", { at: [0, 1.4, 0] });
  const doorL = b.joint("doorL", { parent: chassis, at: [0.985, 2.55, 0.58], dir: [0, 1, 0], role: "hinge" });
  const doorR = b.joint("doorR", { parent: chassis, at: [-0.985, 2.55, 0.58], dir: [0, 1, 0], role: "hinge" });
  const gate = b.joint("tailgate", { parent: chassis, at: [0, 2.3, -2.36], dir: [-1, 0, 0], role: "hinge" });
  const wheel = b.joint("steeringWheel", {
    parent: chassis,
    at: [0.45, 2.98, 0.42],
    dir: [0, 0.4, -1],
    role: "hinge",
  });

  const P = (geo: THREE.BufferGeometry, color: Fill, at: number[], o: PartOptions = {}) =>
    b.part(geo, color, { bone: chassis, ...o, at });
  const bx = (sz: number[], color: Fill, at: number[], o: PartOptions = {}) =>
    P(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), color, at, o);
  const cy = (rt: number, rb: number, len: number, color: Fill, at: number[], dir: number[], seg = 8, o: PartOptions = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, len, seg), color, at, { dir, ...o });
  const rodc = (a: number[], c: number[], r: number, color: Fill) =>
    b.rod(a, c, r, color, { bone: chassis, sides: 6 });

  // ---------------------------------------------------------------- chassis
  for (const s of [1, -1]) {
    bx([0.14, 0.22, 4.7], DARK, [s * 0.6, 1.45, 0]);
    bx([0.04, 0.16, 4.7], YELLOW, [s * 0.69, 1.45, 0]);
  }
  for (const z of [-2.1, -1.1, 0, 1.1, 2.1]) bx([1.4, 0.16, 0.18], YELLOW, [0, 1.45, z]);
  bx([0.9, 0.4, 1.0], STEEL, [0, 1.55, -1.55]);
  bx([0.92, 0.05, 0.2], DARK, [0, 1.55, -1.3]);
  bx([0.6, 0.35, 0.5], "#4a4f5c", [0, 1.45, 0.2]);

  // axles, diffs, links, shafts
  for (const z of [1.45, -1.45]) {
    cy(0.09, 0.09, 2.5, "#4a4f5c", [0, 0.9, z], [1, 0, 0], 8);
    P(new THREE.SphereGeometry(0.32, 10, 8), STEEL, [0, 0.88, z], { scale: [1, 0.9, 0.85] });
    bx([0.3, 0.3, 0.15], "#4a4f5c", [0, 0.88, z + (z > 0 ? 0.3 : -0.3)]);
    const f = z > 0 ? -1 : 1;
    for (const s of [1, -1]) {
      rodc([s * 0.5, 0.95, z], [s * 0.5, 1.4, z + f * 0.9], 0.055, "#4a4f5c");
      rodc([s * 0.3, 1.05, z], [s * 0.3, 1.55, z + f * 0.9], 0.045, "#4a4f5c");
      bx([0.12, 0.12, 0.12], YELLOW, [s * 0.5, 0.95, z]);
    }
  }
  rodc([0, 0.95, 1.45], [0, 1.25, 0.2], 0.05, "#4a4f5c");
  rodc([0, 1.25, -0.2], [0, 0.95, -1.45], 0.05, "#4a4f5c");
  rodc([-1.2, 0.8, 1.85], [1.2, 0.8, 1.85], 0.04, CHROME);

  // shocks with coil springs
  for (const s of [1, -1])
    for (const z of [1.5, -1.5]) {
      const lo = [s * 0.85, 0.98, z];
      const hi = [s * 0.8, 1.72, z];
      const dir = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
      const m = lerp(lo, hi, 0.55);
      b.rod(lo, m, 0.075, YELLOW, { bone: chassis, sides: 6 });
      b.rod(m, hi, 0.04, CHROME, { bone: chassis, sides: 6 });
      bx([0.16, 0.08, 0.16], DARK, lo);
      bx([0.16, 0.08, 0.16], DARK, hi);
      for (let k = 0; k < 7; k++)
        P(new THREE.TorusGeometry(0.12, 0.024, 4, 8), RED, lerp(lo, hi, 0.1 + 0.1 * k).toArray(), { dir, axis: "z" });
    }

  // ---------------------------------------------------------------- wheels
  const WHEEL = wheelTexture();
  for (const s of [1, -1])
    for (const z of [1.5, -1.5]) {
      const tag = `${z > 0 ? "F" : "R"}${s > 0 ? "L" : "R"}`;
      const cx = s * 1.45;
      const cyy = 0.9;
      const steer =
        z > 0
          ? b.joint(`steer${tag}`, { parent: chassis, at: [cx, cyy + 0.25, z], dir: [0, 1, 0], role: "hinge" })
          : chassis;
      const wj = b.joint(`wheel${tag}`, { parent: steer, at: [cx, cyy, z], dir: [s, 0, 0], role: "hinge" });
      const o: PartOptions = { bone: wj };
      cy(0.8, 0.8, 0.7, TIRE, [cx, cyy, z], [s, 0, 0], 16, o);
      for (let k = 0; k < 14; k++) {
        const a = (k * 360) / 14;
        const r = (a * Math.PI) / 180;
        const off = k % 2 ? 0.04 : -0.04;
        bx([0.62, 0.13, 0.24], TIRE, [cx + off, cyy + 0.85 * Math.cos(r), z + 0.85 * Math.sin(r)], {
          bone: wj,
          rotation: [a, 0, 0],
        });
      }
      P(new THREE.CircleGeometry(0.78, 32), "#ffffff", [cx + s * 0.353, cyy, z], {
        bone: wj,
        dir: [s, 0, 0],
        axis: "z",
        texture: WHEEL,
      });
      cy(0.14, 0.14, 0.1, "#e0b030", [cx + s * 0.4, cyy, z], [s, 0, 0], 8, o);
      cy(0.35, 0.35, 0.25, STEEL, [cx - s * 0.47, cyy, z], [s, 0, 0], 10, o);
    }

  // ---------------------------------------------------------------- body
  bx([2.0, 0.5, 4.7], BODY, [0, 2.0, 0]);
  bx([2.02, 0.1, 4.72], DARK, [0, 1.8, 0]);
  const FL = [flameTexture(false), flameTexture(true)];
  for (const s of [1, -1])
    P(new THREE.PlaneGeometry(4.608, 0.576), "#ffffff", [s * 1.012, 2.0, 0], {
      dir: [s, 0, 0],
      axis: "z",
      texture: FL[s > 0 ? 0 : 1],
    });
  // hood and engine
  bx([1.94, 0.36, 1.75], BODY, [0, 2.43, 1.55]);
  for (const s of [1, -1]) {
    bx([0.18, 0.012, 1.75], "#f4f4f0", [s * 0.62, 2.614, 1.55]);
    bx([0.012, 0.01, 1.75], DARK, [s * 0.96, 2.612, 1.55]);
    bx([0.18, 0.012, 1.3], "#f4f4f0", [s * 0.62, 3.612, -0.05]);
  }
  bx([1.9, 0.01, 0.012], DARK, [0, 2.612, 1.0]);
  bx([0.8, 0.35, 0.9], CHROME, [0, 2.78, 1.35]);
  bx([0.6, 0.06, 0.5], "#8f97a6", [0, 2.99, 1.35]);
  for (let i = 0; i < 4; i++)
    for (const s of [1, -1]) cy(0.07, 0.09, 0.22, CHROME, [s * 0.2, 3.07, 1.1 + i * 0.17], [0, 1, 0], 6);
  bx([0.5, 0.2, 0.3], "#1a1c24", [0, 2.75, 1.9]);
  // fascia, grille, bumper
  bx([1.94, 0.75, 0.12], BODY, [0, 2.27, 2.42]);
  P(new THREE.PlaneGeometry(1.2, 0.45), "#ffffff", [0, 2.22, 2.485], { dir: [0, 0, 1], axis: "z", texture: GRILLE });
  for (const s of [1, -1]) {
    glow(bx([0.34, 0.26, 0.06], "#fff3b0", [s * 0.72, 2.4, 2.485]), 1.4);
    bx([0.4, 0.32, 0.03], CHROME, [s * 0.72, 2.4, 2.47]);
    glow(bx([0.2, 0.08, 0.05], "#ffa030", [s * 0.72, 2.1, 2.485]), 1.2);
  }
  bx([2.1, 0.22, 0.25], CHROME, [0, 1.95, 2.52]);
  bx([1.7, 0.3, 0.14], DARK, [0, 1.75, 2.45]);
  bx([0.7, 0.18, 0.2], DARK, [0, 1.95, 2.7]);
  cy(0.07, 0.07, 0.62, STEEL, [0, 1.95, 2.8], [1, 0, 0], 8);
  for (const s of [1, -1]) bx([0.12, 0.1, 0.2], YELLOW, [s * 0.9, 1.9, 2.68]);
  // fender flares
  for (const s of [1, -1])
    for (const z of [1.5, -1.5]) {
      bx([0.95, 0.08, 1.9], BODY, [s * 1.475, 2.2, z]);
      bx([0.07, 0.35, 1.9], BODY, [s * 1.945, 2.03, z]);
      bx([0.95, 0.04, 1.94], DARK, [s * 1.475, 2.15, z]);
    }
  // cab
  bx([1.9, 0.6, 1.45], BODY, [0, 2.55, 0]);
  bx([1.8, 0.12, 1.3], BODY, [0, 3.6, -0.05]);
  bx([1.8, 0.69, 0.04], DARK, [0, 3.195, -0.7]);
  bx([1.7, 0.6, 0.05], "#ffffff", [0, 3.18, -0.735], { texture: GLASS });
  P(new THREE.BoxGeometry(1.8, 0.06, 0.808), "#ffffff", [0, 3.195, 0.51], {
    dir: [0, 0.69, -0.42],
    axis: "z",
    texture: GLASS,
  });
  bx([1.92, 0.06, 0.12], DARK, [0, 2.88, 0.7]);
  for (const s of [1, -1]) {
    bx([0.1, 0.69, 0.1], BODY, [s * 0.92, 3.195, 0.51], { rotation: [-31.3, 0, 0] });
    bx([0.14, 0.69, 0.2], BODY, [s * 0.9, 3.195, -0.63]);
  }
  // interior
  bx([1.8, 0.22, 0.3], "#2a2d36", [0, 2.96, 0.56]);
  for (const s of [1, -1]) {
    bx([0.5, 0.14, 0.5], "#3a3f4c", [s * 0.45, 2.92, -0.2]);
    bx([0.5, 0.55, 0.12], "#3a3f4c", [s * 0.45, 3.2, -0.5]);
  }
  bx([0.38, 0.38, 0.26], "#e0a020", [0.45, 3.1, -0.22]);
  bx([0.27, 0.27, 0.27], RED, [0.45, 3.4, -0.2]);
  P(new THREE.PlaneGeometry(0.22, 0.14), "#ffffff", [0.45, 3.37, -0.062], { dir: [0, 0, 1], axis: "z", texture: FACE });
  b.part(new THREE.TorusGeometry(0.15, 0.025, 4, 8), "#15171d", {
    bone: wheel,
    at: [0.45, 2.98, 0.42],
    dir: [0, 0.4, -1],
    axis: "z",
  });
  b.rod([0.45, 2.98, 0.42], [0.45, 2.85, 0.6], 0.03, "#15171d", { bone: wheel, sides: 6 });
  // doors
  for (const [s, d] of [
    [1, doorL],
    [-1, doorR],
  ] as const) {
    const o: PartOptions = { bone: d };
    const x = s * 0.985;
    bx([0.08, 0.6, 1.14], BODY, [x, 2.55, 0], o);
    bx([0.08, 0.06, 1.14], BODY, [x, 3.51, 0], o);
    bx([0.08, 0.69, 0.08], BODY, [x, 3.195, 0.53], o);
    bx([0.08, 0.69, 0.08], BODY, [x, 3.195, -0.53], o);
    bx([0.1, 0.14, 0.2], DARK, [s * 1.08, 3.1, 0.48], o);
    bx([0.1, 0.03, 0.12], DARK, [s * 1.04, 3.08, 0.5], o);
    bx([0.03, 0.05, 0.22], CHROME, [s * 1.04, 2.8, -0.35], o);
    bx([0.012, 0.6, 0.02], DARK, [s * 1.027, 2.55, 0.56], o);
    bx([0.012, 0.6, 0.02], DARK, [s * 1.027, 2.55, -0.56], o);
    P(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", [s * 1.03, 2.55, 0], { ...o, dir: [s, 0, 0], axis: "z", texture: NUMBER });
  }
  // bed
  P(tileBox([1.8, 0.1, 1.65], LINER, 0.05), "#ffffff", [0, 2.35, -1.52], { texture: LINER });
  bx([1.9, 0.6, 0.1], BODY, [0, 2.55, -0.8]);
  for (const s of [1, -1]) {
    bx([0.16, 0.6, 1.7], BODY, [s * 0.92, 2.55, -1.52]);
    bx([0.22, 0.06, 1.74], CHROME, [s * 0.92, 2.88, -1.52]);
  }
  bx([0.22, 0.06, 0.1], CHROME, [0, 2.88, -0.8]);
  bx([0.6, 0.24, 0.3], RED, [-0.4, 2.52, -1.2]);
  bx([0.62, 0.04, 0.32], CHROME, [-0.4, 2.65, -1.2]);
  bx([0.35, 0.3, 0.3], "#f4f4f0", [0.45, 2.5, -1.9]);
  bx([0.37, 0.05, 0.32], "#2a6bd0", [0.45, 2.66, -1.9]);
  for (let i = 0; i < 3; i++)
    cy(0.1, 0.16, 0.26, "#ff7a1c", [-0.4 + i * 0.3, 2.53, -1.85], [0, 1, 0], 6);
  // exhaust stacks
  for (const s of [1, -1]) {
    cy(0.07, 0.07, 1.0, CHROME, [s * 0.55, 3.35, -0.95], [0, 1, 0], 8);
    cy(0.12, 0.07, 0.15, CHROME, [s * 0.55, 3.92, -0.95], [0, 1, 0], 8);
    glow(cy(0.065, 0.065, 0.02, "#ff9a2a", [s * 0.55, 3.97, -0.95], [0, 1, 0], 6), 1.5);
    bx([0.18, 0.08, 0.05], DARK, [s * 0.55, 2.95, -0.9]);
    bx([0.18, 0.08, 0.05], DARK, [s * 0.55, 3.5, -0.9]);
  }
  // roof light bar
  bx([1.7, 0.12, 0.2], DARK, [0, 3.72, 0.3]);
  for (let i = 0; i < 6; i++) glow(bx([0.22, 0.14, 0.06], i % 2 ? "#fff3b0" : "#ffe080", [-0.72 + i * 0.288, 3.73, 0.42]), 1.4);
  // tailgate
  {
    const o: PartOptions = { bone: gate };
    bx([1.76, 0.55, 0.08], BODY, [0, 2.58, -2.36], o);
    bx([1.7, 0.06, 0.1], CHROME, [0, 2.88, -2.36], o);
    for (const s of [1, -1]) glow(bx([0.2, 0.2, 0.04], "#ff2a2a", [s * 0.74, 2.58, -2.41], o), 1.3);
    P(new THREE.BoxGeometry(0.36, 0.18, 0.02), "#ffffff", [0, 2.5, -2.405], { ...o, texture: PLATE });
  }
  bx([2.0, 0.2, 0.2], CHROME, [0, 1.95, -2.55]);
  bx([0.2, 0.12, 0.2], STEEL, [0, 1.75, -2.65]);
  for (const s of [1, -1]) bx([0.6, 0.5, 0.05], DARK, [s * 1.45, 1.3, -2.55]);
  for (const s of [1, -1]) bx([0.62, 0.06, 0.06], YELLOW, [s * 1.45, 1.4, -2.57]);

  return b.root;
}
