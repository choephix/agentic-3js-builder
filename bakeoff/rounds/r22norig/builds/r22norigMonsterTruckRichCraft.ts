import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { cellPaint, pixelArt, pixelTexture, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Monster Truck",
  description:
    "A flame-painted red pickup on giant mud-caked lugged tyres, with blower, light bar, roll hoop and pixel-art decals.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.04;

// palette
const CHROME = "#c9d0d9";
const STEEL = "#8b939e";
const IRON = "#6a7380";
const DARK = "#1d1f26";
const FRAME = "#2a2c35";
const YELLOW = "#ffc61a";
const BLUE = "#2a64d6";
const BLACK = "#101014";
const AMBER = "#ffb21e";
const TAIL = "#ff2a2a";
const WARM = "#fff2b0";
const OLIVE = "#5a7a3a";
const RUBBERBLACK = "#17171d";

const RED = ["#6b0f12", "#9e1519", "#cf2024", "#ef3a2e"];
const RUBBER = ["#0d0d11", "#17171d", "#22222a", "#2e2e38"];
const MUD = ["#3a2514", "#53391f", "#6d4d2a"];

const GLYPH: Record<string, string[]> = {
  M: ["X.X", "XXX", "XXX", "X.X", "X.X"],
  E: ["XXX", "X..", "XX.", "X..", "XXX"],
  G: [".XX", "X..", "X.X", "X.X", ".XX"],
  A: [".X.", "X.X", "XXX", "X.X", "X.X"],
  T: ["XXX", ".X.", ".X.", ".X.", ".X."],
  U: ["X.X", "X.X", "X.X", "X.X", "XXX"],
  R: ["XX.", "X.X", "XX.", "X.X", "X.X"],
  B: ["XX.", "X.X", "XX.", "X.X", "XX."],
  O: ["XXX", "X.X", "X.X", "X.X", "XXX"],
};

function textTex(str: string, ink: string, edge: string) {
  const n = str.length;
  return pixelTexture(4 * n + 1, 7, (g) => {
    for (let i = 0; i < n; i++) {
      const rows = GLYPH[str[i]];
      for (let y = 0; y < 5; y++)
        for (let x = 0; x < 3; x++) {
          if (rows[y][x] !== "X") continue;
          const px = 1 + i * 4 + x;
          const py = 1 + y;
          if (edge)
            for (const [dx, dy] of [
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1],
              [1, 1],
              [-1, -1],
              [1, -1],
              [-1, 1],
            ])
              if (!g.get(px + dx, py + dy)) g.set(px + dx, py + dy, edge);
          g.set(px, py, ink);
        }
    }
  });
}

const GRILLE = pixelTexture(16, 6, (g) => {
  g.fill((x, y) =>
    y === 0 || y === 5 || x === 0 || x === 15 ? "#c9ced6" : x % 3 === 0 ? "#e8edf2" : "#15161c",
  );
});

const LENS = pixelArt(["bbbbbb", "bwwwwb", "bwyywb", "bwyywb", "bwwwwb", "bbbbbb"], {
  b: "#d6dbe2",
  w: "#fff8d8",
  y: "#ffffff",
});

const ROUNDEL = pixelTexture(13, 13, (g) => {
  g.fill((x, y) => {
    const d = Math.hypot(x - 6, y - 6);
    if (d > 6.4) return "";
    if (d > 5.2) return "#101014";
    return "#f4f1e6";
  });
  g.stamp(4, 3, ["XXXXX", "....X", "...X.", "..X..", "..X..", "..X..", "..X.."], { X: "#cf2024" });
});

const WHEELFACE = pixelTexture(24, 24, (g) => {
  g.fill((x, y) => {
    const dx = x - 11.5;
    const dy = y - 11.5;
    const d = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx);
    if (d > 12) return "";
    if (d > 11) return "#3a3f48";
    if (d > 9.2) {
      const k = Math.round(a / (Math.PI / 8));
      const near = Math.abs(a - (k * Math.PI) / 8) < 0.16 && d > 9.8;
      return near ? "#20242b" : d > 10.4 ? "#e3e8ee" : "#b4bcc7";
    }
    if (d > 3.6) {
      const sp = Math.sin(a * 5);
      return sp > 0.5 ? (d > 7 ? "#ffdd55" : "#f5c518") : d > 8 ? "#3b3f49" : "#262930";
    }
    return d < 1.6 ? "#555c68" : "#c8ced6";
  });
});

const GLASSTEX = pixelTexture(16, 8, (g) => {
  g.fill((x, y) => {
    const d = (x + y) % 8;
    if (d === 0 || d === 1) return "#8cc4ee";
    return y < 3 ? "#24507a" : y < 6 ? "#17314b" : "#0e1b2c";
  });
});

const LINER = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => (y % 4 === 0 ? "#050507" : (x + y * 3) % 9 === 0 ? "#2b2d36" : "#14151b"));
});

const PLATE = pixelTexture(14, 7, (g) => {
  g.fill((x, y) => {
    if (x === 0 || y === 0 || x === 13 || y === 6) return "#2a2a2a";
    if (y >= 2 && y <= 4 && x >= 2 && x <= 11 && (x * 7 + y * 3) % 5 < 3) return "#1a1a1a";
    return "#f0d54a";
  });
});

const TURBO = textTex("TURBO", "#fff3c4", "#2a0708");
const MEGA = textTex("MEGA", "#d9d9d9", "");

const FLAMES = (c: { y: number; f: number }) => {
  const t = Math.min(1, Math.max(0, (c.y - 1.95) / 0.8));
  const tri = Math.abs(((c.y * 4.0) % 1) - 0.5) * 2;
  const L = 3.9 * (1 - t) + 0.7 * tri * (1 - t * 0.5);
  return { L, d: L - c.f };
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });

  const box = (
    size: [number, number, number],
    color: string | Paint,
    at: number[],
    rotation?: number[],
    texture?: THREE.Texture,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...(rotation ? { rotation } : {}),
      ...(texture ? { texture } : {}),
    });
  const cyl = (
    r0: number,
    r1: number,
    h: number,
    seg: number,
    color: string | Paint,
    at: number[],
    dir: number[],
  ) => b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, dir, axis: "y" });

  // ---------- body paint ----------
  const BODY: Paint = cellPaint(
    0.04,
    (c) => {
      const y = c.at.y;
      const z = c.at.z;
      const x = c.at.x;
      const side = c.axis === 0;
      let v = 0.5 + 0.35 * c.n.y + (c.random(1) - 0.5) * 0.12;
      v = Math.min(1, Math.max(0, v));
      let col: string = c.pick(RED, v);
      if (side && y > 1.95 && y < 2.78) {
        const { L, d } = FLAMES({ y, f: 2.7 - z });
        if (d > 0) col = d < 0.18 ? "#ff6a13" : d < 0.45 ? "#ff9f1c" : "#ffe066";
        else if (d > -0.06) col = "#4a0c0e";
      }
      if (c.n.y > 0.5 && Math.abs(x) < 0.24) {
        col = Math.abs(x) < 0.1 ? "#f4f1e6" : Math.abs(x) < 0.2 ? "#ffc21a" : "#4a0c0e";
      }
      if (y < 2.15 && c.random(3) < (2.15 - y) * 2.2) col = c.pick(MUD, c.random(4));
      if (y < 1.95 && c.axis !== 1) col = c.pick(["#15161c", "#22232b"], c.random(6));
      if (c.random(9) > 0.992) col = "#d8d8dc";
      return col;
    },
    { dither: true },
  );

  const GLASS = cellPaint(0.04, (c) => {
    const d = (c.u + c.v) % 9;
    if (d === 0 || d === 1) return "#8cc4ee";
    return c.pick(["#0e1b2c", "#17314b", "#24507a"], (c.at.y - 2.8) / 0.5);
  });

  const tirePaint = (cz: number): Paint =>
    cellPaint(
      0.035,
      (c) => {
        const rad = Math.hypot(c.at.y - 0.85, c.at.z - cz);
        const low = 1 - Math.min(1, c.at.y / 1.6);
        const m = low * 0.7 + (noise(c.at, 0.35, 4) - 0.5) * 0.7 + (c.random(2) - 0.5) * 0.3;
        if (m > 0.62 && !(c.axis === 0 && rad < 0.5)) return c.pick(MUD, c.random(5));
        if (c.axis === 0) {
          if (rad > 0.745) return "#3a3a44";
          if (rad > 0.715) return "#d8dae0";
          return c.pick(RUBBER, 0.25 + 0.3 * c.random(0));
        }
        return c.pick(RUBBER, 0.3 + 0.5 * c.random(0));
      },
      { dither: true },
    );

  // ---------- body ----------
  const OUT: OutlinePoint[] = [
    [-2.7, 1.75],
    [2.6, 1.75],
    [2.7, 2.1],
    [2.6, 2.5],
    [0.85, 2.6],
    [0.45, 3.3],
    [-0.7, 3.35],
    [-0.95, 2.65],
    [-1.0, 2.6],
    [-2.7, 2.6],
  ];
  b.extrude(OUT, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.04, detail: 0.34, color: BODY });

  // glass
  box([1.7, 0.75, 0.03], "#ffffff", [0, 2.956, 0.66], [-29.7, 0, 0], GLASSTEX);
  box([1.3, 0.45, 0.03], "#ffffff", [0, 3.004, -0.836], [-160.4, 0, 0], GLASSTEX);
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.82, 2.8],
        [0.65, 2.8],
        [0.45, 3.2],
        [-0.7, 3.2],
      ],
      { at: [s * 0.962, 0, 0], x: [0, 0, 1], thickness: 0.024, color: GLASS },
    );
    // window pillar divider
    box([0.016, 0.42, 0.04], BLACK, [s * 0.962, 3.0, -0.08]);
    // door roundel, seams, handle
    b.part(new THREE.PlaneGeometry(0.44, 0.44), "#ffffff", {
      at: [s * 0.957, 2.3, 0.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: ROUNDEL,
    });
    box([0.012, 0.9, 0.012], "#3a0a0c", [s * 0.953, 2.28, 0.58]);
    box([0.012, 0.9, 0.012], "#3a0a0c", [s * 0.953, 2.28, -0.52]);
    box([0.012, 0.012, 1.1], "#3a0a0c", [s * 0.953, 2.76, 0.03]);
    box([0.03, 0.04, 0.16], CHROME, [s * 0.965, 2.6, -0.38]);
    // mirrors
    box([0.05, 0.05, 0.05], DARK, [s * 1.0, 2.9, 0.62]);
    box([0.1, 0.2, 0.15], DARK, [s * 1.07, 2.98, 0.6]);
    box([0.012, 0.16, 0.11], "#b9d8f0", [s * 1.125, 2.98, 0.6]);
    // bed side decal
    b.part(new THREE.PlaneGeometry(21 * TEXEL, 7 * TEXEL), "#ffffff", {
      at: [s * 0.956, 2.22, -1.85],
      dir: [s, 0, 0],
      axis: "z",
      texture: TURBO,
    });
    // running boards
    box([0.12, 0.05, 1.6], DARK, [s * 1.02, 1.88, 0]);
    box([0.12, 0.012, 1.6], "#9aa3ae", [s * 1.02, 1.915, 0]);
    box([0.05, 0.06, 0.06], FRAME, [s * 0.98, 1.84, 0.6]);
    box([0.05, 0.06, 0.06], FRAME, [s * 0.98, 1.84, -0.6]);
    // exhaust stacks
    b.rod([s * 1.04, 1.95, -0.92], [s * 1.04, 3.1, -0.92], 0.065, CHROME, { sides: 8 });
    b.rod([s * 1.04, 3.1, -0.92], [s * 1.04, 3.32, -0.92], [0.075, 0.115], CHROME, { sides: 8, caps: "flat" });
    cyl(0.09, 0.09, 0.02, 8, BLACK, [s * 1.04, 3.325, -0.92], [0, 1, 0]);
    for (const yy of [2.2, 2.7]) box([0.1, 0.06, 0.12], STEEL, [s * 0.99, yy, -0.92]);
    // headlights
    box([0.38, 0.34, 0.04], CHROME, [s * 0.7, 2.3, 2.655], [-14, 0, 0]);
    glow(box([0.3, 0.26, 0.05], "#ffffff", [s * 0.7, 2.3, 2.675], [-14, 0, 0], LENS), 1.2);
    // tail lights
    glow(box([0.3, 0.22, 0.04], TAIL, [s * 0.72, 2.3, -2.715]), 1.1);
    box([0.34, 0.26, 0.03], DARK, [s * 0.72, 2.3, -2.705]);
    glow(box([0.1, 0.1, 0.04], WARM, [s * 0.4, 2.12, -2.715]), 1);
    // bumper tow hooks and fog lamps
    box([0.1, 0.12, 0.2], TAIL, [s * 0.55, 1.88, 2.98]);
    glow(box([0.16, 0.12, 0.05], AMBER, [s * 0.85, 1.96, 2.93]), 1);
    // bull bar uprights
    b.capsule([s * 0.7, 1.95, 2.86], [s * 0.7, 2.55, 2.8], 0.045, DARK);
    // mud splash gap-fill stacks on running boards
    b.rod([s * 0.55, 1.77, 0.9], [s * 0.55, 1.9, 0.9], 0.04, FRAME);
  }
  // grille
  box([1.1, 0.36, 0.04], "#ffffff", [0, 2.3, 2.675], [-14, 0, 0], GRILLE);
  // front bumper
  box([2.0, 0.22, 0.24], CHROME, [0, 1.95, 2.84]);
  box([2.0, 0.04, 0.24], STEEL, [0, 1.83, 2.84]);
  b.capsule([-0.7, 2.55, 2.8], [0.7, 2.55, 2.8], 0.045, DARK);
  b.capsule([-0.7, 2.25, 2.88], [0.7, 2.25, 2.88], 0.035, DARK);
  cyl(0.12, 0.12, 0.14, 8, DARK, [0, 1.96, 2.99], [0, 0, 1]);
  b.rod([0, 1.96, 3.06], [0, 1.78, 3.06], 0.025, TAIL);
  // rear bumper and plate
  box([2.0, 0.24, 0.22], CHROME, [0, 1.95, -2.82]);
  box([0.5, 0.26, 0.02], "#ffffff", [0, 2.18, -2.712], undefined, PLATE);
  // hood details
  box([0.9, 0.28, 0.9], DARK, [0, 2.74, 1.5]);
  cyl(0.22, 0.22, 0.1, 8, CHROME, [0, 2.76, 2.0], [0, 0, 1]);
  cyl(0.15, 0.15, 0.11, 8, BLACK, [0, 2.76, 2.01], [0, 0, 1]);
  for (const sx of [-0.25, 0.25])
    for (const sz of [1.25, 1.75]) {
      b.rod([sx, 2.88, sz], [sx, 3.1, sz], [0.05, 0.085], CHROME, { sides: 8, caps: "flat" });
      cyl(0.075, 0.075, 0.02, 8, BLACK, [sx, 3.105, sz], [0, 1, 0]);
    }
  for (const sx of [-0.6, 0.6]) box([0.012, 0.012, 1.7], "#3a0a0c", [sx, 2.604, 1.72]);
  box([1.9, 0.012, 0.012], "#3a0a0c", [0, 2.604, 0.95]);
  for (const sx of [-0.8, 0.8]) box([0.06, 0.03, 0.06], CHROME, [sx, 2.615, 2.42]);
  // wipers
  for (const wx of [-0.65, 0.05])
    b.rod([wx, 2.685, 0.836], [wx + 0.65, 2.93, 0.696], 0.012, BLACK, { sides: 4 });
  // light bar
  box([1.5, 0.1, 0.16], DARK, [0, 3.405, 0.0]);
  for (const lx of [-0.6, -0.3, 0, 0.3, 0.6]) {
    box([0.22, 0.16, 0.03], CHROME, [lx, 3.46, 0.07]);
    glow(box([0.18, 0.12, 0.03], WARM, [lx, 3.46, 0.09]), 1.3);
  }
  for (const lx of [-0.6, 0.6]) box([0.06, 0.06, 0.06], FRAME, [lx, 3.36, 0.0]);

  // ---------- bed ----------
  b.part(tileBox([1.7, 0.03, 1.6], LINER, TEXEL), "#ffffff", { at: [0, 2.615, -1.85], texture: LINER });
  for (const s of [1, -1]) {
    box([0.12, 0.16, 1.6], BODY, [s * 0.88, 2.68, -1.85]);
    b.capsule([s * 0.82, 2.62, -1.45], [s * 0.82, 3.4, -1.45], 0.05, CHROME);
    glow(box([0.14, 0.1, 0.1], AMBER, [s * 0.82, 3.5, -1.45]), 1.2);
  }
  b.capsule([-0.82, 3.4, -1.45], [0.82, 3.4, -1.45], 0.05, CHROME);
  b.capsule([0, 3.4, -1.45], [0, 2.7, -1.12], 0.035, CHROME);
  box([1.7, 0.25, 0.08], BODY, [0, 2.74, -1.12]);
  box([1.8, 0.12, 0.1], BODY, [0, 2.68, -2.66]);
  // cargo
  box([0.3, 0.4, 0.16], OLIVE, [0.5, 2.82, -2.1]);
  box([0.12, 0.04, 0.12], DARK, [0.5, 3.04, -2.1]);
  b.rod([0.5, 3.02, -2.04], [0.5, 3.12, -2.0], 0.025, DARK);
  box([0.7, 0.3, 0.4], CHROME, [-0.45, 2.77, -2.35]);
  box([0.72, 0.03, 0.42], DARK, [-0.45, 2.93, -2.35]);
  box([0.08, 0.06, 0.04], YELLOW, [-0.45, 2.82, -2.14]);
  cyl(0.14, 0.14, 0.12, 8, DARK, [0.2, 2.68, -2.3], [0, 1, 0]);
  cyl(0.1, 0.1, 0.1, 8, YELLOW, [0.2, 2.78, -2.3], [0, 1, 0]);

  // ---------- chassis ----------
  for (const s of [1, -1]) {
    box([0.16, 0.22, 5.3], FRAME, [s * 0.55, 1.66, 0]);
    box([0.06, 0.04, 5.3], STEEL, [s * 0.55, 1.79, 0]);
    for (const zz of [-2.0, -0.4, 1.0, 2.2]) box([0.18, 0.08, 0.18], DARK, [s * 0.55, 1.8, zz]);
  }
  for (const zz of [-2.4, -1.2, 0, 1.2, 2.4]) box([1.1, 0.14, 0.14], FRAME, [0, 1.62, zz]);
  box([1.1, 0.06, 3.2], IRON, [0, 1.5, 0]);
  rodZ(b, [0, 0.95, 1.3], [0, 1.0, -1.3], 0.07, DARK);

  const springT = new THREE.TorusGeometry(0.085, 0.018, 4, 8);
  for (const zax of [1.7, -1.7]) {
    const sg = Math.sign(zax);
    // axle
    b.rod([-1.5, 0.85, zax], [1.5, 0.85, zax], 0.11, STEEL, { sides: 8 });
    box([0.4, 0.4, 0.5], IRON, [0, 0.85, zax]);
    cyl(0.17, 0.17, 0.06, 8, STEEL, [0, 0.85, zax + sg * 0.27], [0, 0, 1]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      box([0.035, 0.035, 0.03], CHROME, [0.14 * Math.cos(a), 0.85 + 0.14 * Math.sin(a), zax + sg * 0.3]);
    }
    for (const s of [1, -1]) {
      box([0.14, 0.5, 0.5], IRON, [s * 0.92, 0.85, zax]);
      // trailing and upper links
      b.rod([s * 0.5, 0.8, zax], [s * 0.5, 1.5, zax - sg * 1.1], 0.05, FRAME);
      b.rod([s * 0.3, 1.0, zax], [s * 0.35, 1.5, zax - sg * 0.9], 0.04, FRAME);
      box([0.14, 0.14, 0.14], DARK, [s * 0.5, 1.5, zax - sg * 1.1]);
      // shock
      const top = new THREE.Vector3(s * 0.72, 1.58, zax);
      const bot = new THREE.Vector3(s * 0.85, 1.0, zax);
      box([0.16, 0.1, 0.16], DARK, [top.x, top.y + 0.02, top.z]);
      box([0.16, 0.1, 0.16], DARK, [bot.x, bot.y - 0.04, bot.z]);
      const dir = top.clone().sub(bot);
      b.rod(bot, bot.clone().addScaledVector(dir, 0.5), 0.06, BLUE, { sides: 8 });
      b.rod(bot.clone().addScaledVector(dir, 0.5), top, 0.035, CHROME, { sides: 6 });
      for (let i = 0; i < 8; i++) {
        const p = bot.clone().addScaledVector(dir, 0.2 + i * 0.09);
        b.part(springT, YELLOW, { at: p, dir: dir.clone().normalize(), axis: "z" });
      }
    }
  }
  // steering link
  b.rod([-0.95, 0.62, 1.4], [0.95, 0.62, 1.4], 0.03, DARK);

  // ---------- wheels ----------
  const lugGeo = new THREE.BoxGeometry(0.44, 0.1, 0.14);
  const tireGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.9, 20);
  const rimGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.91, 20);
  for (const zc of [1.7, -1.7]) {
    const TP = tirePaint(zc);
    for (const s of [1, -1]) {
      const cx = s * 1.45;
      const cy = 0.85;
      b.part(tireGeo, TP, { at: [cx, cy, zc], dir: [1, 0, 0], axis: "y" });
      for (let row = 0; row < 2; row++)
        for (let i = 0; i < 20; i++) {
          const a = i * 18 + row * 9;
          const r = 0.8;
          const rad = (a * Math.PI) / 180;
          b.part(lugGeo, TP, {
            at: [cx + (row === 0 ? -0.225 : 0.225), cy + r * Math.sin(rad), zc + r * Math.cos(rad)],
            rotation: [90 - a, 0, 0],
          });
        }
      b.part(rimGeo, "#9aa3ae", { at: [cx, cy, zc], dir: [1, 0, 0], axis: "y" });
      b.part(new THREE.CircleGeometry(0.455, 24), "#ffffff", {
        at: [s * 1.908, cy, zc],
        dir: [s, 0, 0],
        axis: "z",
        texture: WHEELFACE,
      });
      b.part(new THREE.CircleGeometry(0.2, 12), "#444b57", {
        at: [s * 1.0 - s * 0.0, cy, zc],
        dir: [-s, 0, 0],
        axis: "z",
      });
      cyl(0.1, 0.1, 0.06, 8, CHROME, [s * 1.935, cy, zc], [1, 0, 0]);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        cyl(0.03, 0.03, 0.05, 6, STEEL, [s * 1.92, cy + 0.17 * Math.sin(a), zc + 0.17 * Math.cos(a)], [1, 0, 0]);
      }
      for (const up of [1, -1])
        b.part(new THREE.PlaneGeometry(15 * 0.03, 5 * 0.03 * (7 / 5)), "#ffffff", {
          at: [s * 1.904, cy + up * 0.63, zc],
          dir: [s, 0, 0],
          axis: "z",
          up: [0, up, 0],
          texture: MEGA,
        });
    }
  }
  void RUBBERBLACK;
  void YELLOW;

  return b.root;
}

// straight dark rod helper (kept at module level so it stays a plain function)
function rodZ(
  b: ReturnType<typeof createBuilder>,
  a: number[],
  c: number[],
  r: number,
  color: string,
) {
  return b.rod(a, c, r, color, { sides: 6 });
}
