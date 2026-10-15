// Monster truck, pixel art: huge lugged tyres on a ladder frame with coilover shocks, a flame-painted pickup body,
// blower, roll bar with lights, flaming exhaust stacks and a driver. Hard square texels everywhere (kits/pixel).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelTexture } from "../../../../kits/pixel";

export const meta = {
  name: "Monster Truck",
  description:
    "A 3.6 m pixel-art monster truck: giant lugged tyres with beadlock rims, ladder frame, coilover shocks, flame-painted pickup body with working doors, hood and tailgate, supercharger, roll bar lights and flaming exhaust stacks.",
  style: "pixel art",
  commit: "88fc1f0",
};

type Vec = [number, number, number];
type Col = string | Paint;

const T = 0.04; // model texel in meters

const RED = ["#3d0b10", "#7a1218", "#b81d1d", "#e63a22", "#ff6a3a"];
const ORANGE = ["#b8420c", "#e8721a", "#ff9a2a"];
const YELLOW = ["#ffb62a", "#ffd84a", "#fff2a0"];
const RUBBER = ["#07070a", "#121217", "#1f1f27", "#2f2f3a"];
const MUD = ["#2a1b10", "#46301e", "#6a4a2c", "#8a6a40"];
const STEEL = ["#15171c", "#262a32", "#3a3f4a", "#585f6c"];
const CHROME = ["#586070", "#8c96a6", "#c6cfdb", "#f2f6fa"];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const parity = (k: number) => ((Math.floor(k) % 2) + 2) % 2;

// ---------------------------------------------------------------------------------------------------------------
// Paints

const BODY = cellPaint(
  T,
  (c) => {
    const { x, y, z } = c.at;
    const m = noise(c.at, 0.32, 5);
    if (y < 1.36 + 0.3 * m) return c.pick(MUD, 0.15 + 0.85 * clamp01((m - 0.2) * 1.4));
    if (c.axis === 0) {
      const yr = y - 1.3;
      const amp = 0.3 + 0.9 * clamp01((z + 1.2) / 3.4);
      const saw = (((z * 1.25 + yr * 0.9) % 1) + 1) % 1;
      const L = amp * (1 - saw);
      if (yr < L * 0.5) return c.pick(YELLOW, 0.15 + 0.85 * clamp01(yr / (L * 0.5 + 1e-3)));
      if (yr < L) return c.pick(ORANGE, 0.95 - 0.8 * clamp01(yr / (L + 1e-3)));
      if (yr < L + T * 1.3) return "#4a0a10";
    }
    if (c.axis === 1 && Math.abs(x) < 0.2) return Math.abs(x) < 0.12 ? "#f4f1e6" : "#14182a";
    const v = 0.5 + 0.3 * c.n.y + 0.08 * c.n.z + 0.16 * (c.random(1) - 0.5);
    return c.pick(RED, v);
  },
  { dither: true },
);

const TYRE = cellPaint(
  T,
  (c) => {
    const y = c.at.y;
    const m = noise(c.at, 0.3, 9);
    if (y < 0.5 + 0.35 * m && c.random(4) < 0.85) return c.pick(MUD, 0.1 + 0.9 * clamp01(m * 1.2));
    return c.pick(RUBBER, 0.35 + 0.35 * (noise(c.at, 0.1, 2) - 0.5) + 0.25 * c.n.y);
  },
  { dither: true },
);

const STEELP = cellPaint(
  T,
  (c) => c.pick(STEEL, 0.4 + 0.3 * (noise(c.at, 0.15, 4) - 0.5) + 0.25 * c.n.y + 0.12 * (c.random(2) - 0.5)),
  { dither: true },
);

const CHROMEP = cellPaint(
  T * 0.75,
  (c) => c.pick(CHROME, 0.55 + 0.4 * c.n.y - 0.25 * Math.abs(c.n.x) + 0.2 * (noise(c.at, 0.12, 6) - 0.5)),
  { dither: true },
);

const SPRING = cellPaint(T * 0.75, (c) => (parity(c.at.y / 0.05) === 0 ? "#ffb02a" : "#d9741a"));

const BUMP = cellPaint(
  T,
  (c) => {
    if ((c.axis === 2 && c.at.y > 1.55) || c.axis === 1)
      return parity((c.u + c.v) / 2) === 0 ? "#ffc83a" : "#15161b";
    return c.pick(STEEL, 0.35 + 0.3 * c.n.y + 0.15 * (c.random(3) - 0.5));
  },
  { dither: true },
);

const GATE = cellPaint(
  T,
  (c) => {
    const y = c.at.y;
    if (c.axis === 2) {
      if (y > 2.3) return parity(c.u + c.v) === 0 ? "#f4f1e6" : "#101216";
      if (y < 2.08 + 0.08 * noise(c.at, 0.2, 7)) return c.pick(MUD, 0.3 + 0.5 * noise(c.at, 0.2, 8));
    }
    return c.pick(RED, 0.5 + 0.3 * c.n.y + 0.16 * (c.random(1) - 0.5));
  },
  { dither: true },
);

const LINER = cellPaint(T, (c) =>
  c.pick(STEEL, parity(c.v / 2) === 0 ? 0.2 + 0.1 * c.random(1) : 0.45 + 0.1 * c.random(2)),
);

const FLAP = cellPaint(T, (c) => (c.axis === 2 && c.v % 5 === 0 ? "#ff9a1a" : c.pick(RUBBER, 0.4 + 0.3 * c.random(1))));

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

const WHEEL = pixelTexture(40, 40, (g) => {
  const rim = ["#2a2e36", "#454b57", "#6c7585", "#a9b3c2"];
  g.fill((x, y) => {
    const dx = x - 19.5;
    const dy = y - 19.5;
    const r = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx);
    if (r > 20) return undefined;
    const th = bayer(x, y);
    if (r >= 14.2) {
      if (r >= 19) return "#2c2c36";
      const dash = r > 15.6 && r < 17.4 && Math.floor((a + Math.PI) / (Math.PI / 20)) % 3 !== 0;
      if (dash) return "#e8e4d0";
      return pick(RUBBER, 0.25 + 0.2 * (((x * 7 + y * 3) % 5) / 5), th);
    }
    if (r >= 12.2) {
      const step = Math.PI / 8;
      const f = ((a + Math.PI) % step) / step;
      if (Math.abs(r - 13.2) < 1.0 && Math.abs(f - 0.5) * step * 13.2 < 1.0) return "#eef2f6";
      return "#23262d";
    }
    if (r >= 5.5) {
      if (r < 7.5) return "#8f98a8";
      if (Math.cos(5 * a) > 0.55) return pick(rim, 0.6 + 0.4 * (1 - r / 12.2), th);
      return "#1b1e25";
    }
    if (r >= 2.8) return th < 0.3 ? "#ff9a1a" : "#ffc02a";
    return r >= 1.2 ? "#e6ecf2" : "#262a30";
  });
});

const GLASS = pixelTexture(16, 8, (g) => {
  g.fill((x, y) => (bayer(x, y) < 0.2 ? "#1d4668" : undefined));
  g.fill((x, y) => (((x - y + 16) % 8 === 0 || ((x - y + 16) % 8 === 1 && y < 5)) && (x + y) % 3 !== 0 ? "#c4ecfa" : undefined));
});

const GRILLE = pixelTexture(30, 14, (g) => {
  g.fill((x, y) => {
    if (x < 1 || x > 28 || y < 1 || y > 12) return pick(CHROME, 0.9 - y / 14, bayer(x, y));
    const e = Math.abs(x - 14.5) + Math.abs(y - 6.5);
    if (e < 1.8) return "#ffc83a";
    if (e < 3.6) return "#e63a22";
    return y % 3 === 0 ? "#e9eef5" : y % 3 === 1 ? "#9aa3b0" : "#101216";
  });
});

const PLATE = pixelTexture(9, 7, (g) => {
  g.fill((x, y) => (x === 0 || x === 8 || y === 0 || y === 6 ? "#1a2a6a" : "#f4f1e6"));
  for (const [x, y] of [
    [0, 0],
    [8, 0],
    [0, 6],
    [8, 6],
  ])
    g.set(x, y, "");
  g.stamp(1, 1, ["###", "#.#", "#.#", "#.#", "###"], { "#": "#101114" });
  g.stamp(5, 1, ["###", "..#", ".#.", ".#.", ".#."], { "#": "#101114" });
});

const GAUGES = pixelTexture(18, 6, (g) => {
  g.fill(() => "#0c0e12");
  for (const cx of [3, 9, 15]) {
    for (let y = 0; y < 6; y++)
      for (let x = cx - 3; x <= cx + 2; x++) {
        const d = Math.hypot(x - cx + 0.5, y - 2.5);
        if (d < 2.6) g.set(x, y, d > 1.7 ? "#d8f0ff" : "#101820");
      }
    g.set(cx + 1, 1, "#ff3a2a");
  }
});

const FLAG = pixelTexture(8, 5, (g) => g.fill((x, y) => ((x + y) % 2 === 0 ? "#f4f4f0" : "#101010")));

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });
  const chassis = b.joint("chassis", { at: [0, 1.2, 0], dir: [0, 1, 0] });

  const box = (
    size: Vec,
    color: Col,
    at: Vec,
    o: { bone?: Joint; rot?: Vec; tex?: THREE.Texture } = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: o.bone ?? chassis,
      at,
      ...(o.rot ? { rotation: o.rot } : {}),
      ...(o.tex ? { texture: o.tex } : {}),
    });
  const cyl = (r: number, len: number, color: Col, at: Vec, dir: Vec, o: { bone?: Joint; seg?: number } = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, o.seg ?? 10), color, { bone: o.bone ?? chassis, at, dir });
  const rod = (a: Vec, c: Vec, r: number, color: Col, o: { bone?: Joint; box?: boolean } = {}) =>
    b.rod(a, c, r, color, { bone: o.bone ?? chassis, ...(o.box ? { section: "box" as const } : { sides: 6 }) });
  const lp = (a: Vec, c: Vec, t: number): Vec => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

  const WY = 0.85;
  const WX = 1.55;
  const WZ = 1.6;

  // ---- Frame, axles, suspension --------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    box([0.16, 0.22, 4.9], STEELP, [s * 0.5, 1.13, 0]);
    box([0.04, 0.12, 4.9], "#ffb02a", [s * 0.5, 1.13, 0]).mesh.scale.set(1, 1, 1);
  }
  for (const z of [-1.9, -0.7, 0.7, 1.9]) box([1.2, 0.14, 0.14], STEELP, [0, 1.1, z]);
  box([1.7, 0.08, 4.0], "#14161b", [0, 1.27, 0]); // belly pan
  cyl(0.07, 3.3, STEELP, [0, 0.95, 0], [0, 0, 1]); // drive shaft
  cyl(0.1, 0.3, CHROMEP, [0, 0.95, 0.0], [0, 0, 1]);

  for (const zA of [WZ, -WZ]) {
    cyl(0.11, 2.5, STEELP, [0, WY, zA], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.25, 8, 6), STEELP, { bone: chassis, at: [0, WY, zA] });
    cyl(0.15, 0.1, CHROMEP, [0, WY, zA + Math.sign(zA) * 0.24], [0, 0, 1], { seg: 8 });
    cyl(0.06, 0.3, STEELP, [0, WY + 0.04, zA - Math.sign(zA) * 0.3], [0, 0, 1], { seg: 6 });
    for (const s of [1, -1]) {
      // four-link
      rod([s * 0.4, 0.97, zA], [s * 0.5, 1.2, zA - Math.sign(zA) * 1.1], 0.04, CHROMEP);
      rod([s * 0.75, 0.78, zA], [s * 0.52, 1.05, zA - Math.sign(zA) * 1.25], 0.045, STEELP);
      for (const dz of [-0.34, 0.34]) {
        const z = zA + dz;
        const bot: Vec = [s * 1.06, 0.95, z];
        const top: Vec = [s * 1.0, 1.74, z + dz * 0.2];
        const mid = lp(bot, top, 0.62);
        rod(bot, mid, 0.1, SPRING);
        rod(mid, top, 0.04, CHROMEP);
        cyl(0.07, 0.22, STEELP, bot, [1, 0, 0], { seg: 6 });
        box([0.16, 0.08, 0.2], STEELP, [top[0], top[1] + 0.02, top[2]]);
      }
    }
  }
  rod([-1.2, 0.92, 1.95], [1.2, 0.92, 1.95], 0.04, CHROMEP); // track rod

  // ---- Wheels ---------------------------------------------------------------------------------------------------
  const lugs = (cx: number, cz: number) => {
    const list: THREE.BufferGeometry[] = [];
    const N = 18;
    const place = (g: THREE.BoxGeometry, ox: number, rad: number, th: number) => {
      g.applyMatrix4(
        new THREE.Matrix4().compose(
          new THREE.Vector3(cx + ox, WY + rad * Math.cos(th), cz + rad * Math.sin(th)),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), th),
          new THREE.Vector3(1, 1, 1),
        ),
      );
      list.push(g);
    };
    for (let k = 0; k < N; k++) {
      const th = (k * 2 * Math.PI) / N;
      const th2 = ((k + 0.5) * 2 * Math.PI) / N;
      place(new THREE.BoxGeometry(0.3, 0.12, 0.17), -0.16, 0.79, th);
      place(new THREE.BoxGeometry(0.3, 0.12, 0.17), 0.16, 0.79, th2);
      for (const s of [1, -1]) place(new THREE.BoxGeometry(0.05, 0.19, 0.14), s * 0.32, 0.7, s > 0 ? th : th2);
    }
    return mergeGeometries(list)!;
  };

  const mkWheel = (name: string, parent: Joint, s: number, z: number) => {
    const x = s * WX;
    const j = b.joint(name, { parent, at: [x, WY, z], dir: [0, 1, 0], role: "hinge" });
    b.part(new THREE.CylinderGeometry(0.78, 0.78, 0.7, 18), TYRE, { bone: j, at: [x, WY, z], dir: [1, 0, 0] });
    b.part(lugs(x, z), TYRE, { bone: j, at: [0, 0, 0] });
    for (const o of [1, -1])
      b.part(new THREE.CircleGeometry(0.6, 24), "#ffffff", {
        bone: j,
        at: [x + o * s * 0.358, WY, z],
        dir: [o * s, 0, 0],
        axis: "z",
        texture: WHEEL,
      });
    return j;
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const steer = b.joint(`steer${"F"}${side}`, {
      parent: chassis,
      at: [s * WX, WY, WZ],
      dir: [0, 1, 0],
      role: "hinge",
    });
    mkWheel(`wheelF${side}`, steer, s, WZ);
    cyl(0.2, 0.3, STEELP, [s * 1.3, WY, WZ], [1, 0, 0], { bone: steer, seg: 8 });
    mkWheel(`wheelR${side}`, chassis, s, -WZ);
    cyl(0.2, 0.3, STEELP, [s * 1.3, WY, -WZ], [1, 0, 0], { seg: 8 });
  }

  // ---- Body: tub, fenders ---------------------------------------------------------------------------------------
  box([1.9, 0.65, 4.5], BODY, [0, 1.625, 0.05]);
  for (const s of [1, -1])
    for (const zc of [WZ, -WZ]) {
      box([1.1, 0.2, 2.1], BODY, [s * 1.4, 1.9, zc]);
      box([0.06, 0.06, 2.14], CHROMEP, [s * 1.95, 1.82, zc]);
    }
  // mud flaps
  for (const s of [1, -1]) {
    box([0.7, 0.55, 0.03], FLAP, [s * 1.55, 1.52, -2.62]);
    box([0.7, 0.55, 0.03], FLAP, [s * 1.55, 1.52, 0.68]);
    rod([s * 1.2, 1.2, 0.0 - 0.0 + 0], [s * 1.2, 1.2, 0.0], 0.001, "#000000"); // placeholder-free no-op removed below
  }

  // ---- Front end ----------------------------------------------------------------------------------------------
  box([1.1, 0.62, 0.1], "#ffffff", [0, 1.92, 2.3], { tex: GRILLE });
  for (const s of [1, -1]) {
    box([0.4, 0.4, 0.08], CHROMEP, [s * 0.75, 1.95, 2.29]);
    glow(box([0.3, 0.3, 0.06], "#fff3b0", [s * 0.75, 1.95, 2.35]), 1.3);
    glow(box([0.14, 0.1, 0.04], "#fff3b0", [s * 0.65, 1.5, 2.54]), 1.2);
    cyl(0.04, 0.2, "#d8321e", [s * 0.82, 1.35, 2.5], [0, 0, 1], { seg: 6 }); // tow hooks
    rod([s * 0.45, 1.62, 2.45], [s * 0.45, 2.35, 2.45], 0.045, CHROMEP);
  }
  rod([-0.45, 2.35, 2.45], [0.45, 2.35, 2.45], 0.045, CHROMEP);
  rod([-0.45, 1.98, 2.45], [0.45, 1.98, 2.45], 0.035, CHROMEP);
  box([1.94, 0.32, 0.22], BUMP, [0, 1.5, 2.42]);
  b.part(new THREE.PlaneGeometry(0.4, 0.3), "#ffffff", {
    bone: chassis,
    at: [0, 1.46, 2.535],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLATE,
  });
  box([1.4, 0.1, 0.5], "#14161b", [0, 1.3, 2.35]); // skid plate

  // ---- Hood ---------------------------------------------------------------------------------------------------
  const hood = b.joint("hood", { parent: chassis, at: [0, 2.3, 0.85], dir: [0, 1, 0], role: "hinge" });
  box([1.8, 0.35, 1.4], BODY, [0, 2.125, 1.55], { bone: hood });
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) box([0.22, 0.02, 0.06], "#0c0d11", [s * 0.7, 2.31, 1.0 + i * 0.22], { bone: hood });
  box([0.62, 0.3, 0.7], CHROMEP, [0, 2.45, 1.5]);
  box([0.5, 0.2, 0.5], "#0c0d11", [0, 2.7, 1.5]);
  for (const s of [1, -1]) {
    box([0.56, 0.05, 0.05], CHROMEP, [0, 2.82, 1.5 + s * 0.27]);
    box([0.05, 0.05, 0.54], CHROMEP, [s * 0.27, 2.82, 1.5]);
    cyl(0.04, 0.4, CHROMEP, [s * 0.38, 2.3, 1.5], [0, 1, 0], { seg: 6 });
  }
  for (let i = 0; i < 4; i++) cyl(0.04, 0.14, CHROMEP, [-0.24 + i * 0.16, 2.62, 1.82], [0, 1, 0], { seg: 6 });

  // ---- Cab ----------------------------------------------------------------------------------------------------
  box([1.86, 0.6, 1.6], BODY, [0, 2.25, 0.05]);
  box([1.96, 0.1, 1.8], BODY, [0, 3.05, -0.02]);
  box([1.86, 0.05, 0.25], BODY, [0, 3.09, 0.9]); // visor
  box([0.3, 0.05, 0.4], "#14161b", [0, 3.13, -0.3]);
  box([1.76, 0.45, 0.05], "#14161b", [0, 2.78, -0.7]);
  box([1.5, 0.4, 0.03], "#ffffff", [0, 2.78, -0.74], { tex: GLASS });
  box([1.62, 0.47, 0.03], "#ffffff", [0, 2.78, 0.785], { tex: GLASS, rot: [-16, 0, 0] });
  for (const s of [1, -1]) {
    rod([s * 0.86, 2.55, 0.85], [s * 0.86, 3.02, 0.72], 0.05, BODY, { box: true });
    box([0.12, 0.45, 0.14], BODY, [s * 0.87, 2.78, -0.72]);
    box([0.07, 0.45, 0.1], BODY, [s * 0.9, 2.78, -0.18]);
    box([0.03, 0.4, 0.5], "#ffffff", [s * 0.93, 2.78, -0.45], { tex: GLASS });
  }

  // doors
  for (const s of [1, -1]) {
    const door = b.joint(s > 0 ? "doorL" : "doorR", {
      parent: chassis,
      at: [s * 0.955, 2.25, 0.8],
      dir: [0, 1, 0],
      role: "hinge",
    });
    box([0.05, 0.6, 0.95], BODY, [s * 0.955, 2.25, 0.325], { bone: door });
    box([0.03, 0.4, 0.8], "#ffffff", [s * 0.945, 2.78, 0.325], { tex: GLASS, bone: door });
    box([0.06, 0.05, 0.9], BODY, [s * 0.945, 3.0, 0.325], { bone: door });
    box([0.03, 0.05, 0.16], CHROMEP, [s * 0.99, 2.4, -0.05], { bone: door });
    box([0.012, 0.6, 0.02], "#14161b", [s * 0.982, 2.25, -0.15], { bone: door });
    b.part(new THREE.PlaneGeometry(0.4, 0.3), "#ffffff", {
      bone: door,
      at: [s * 0.986, 2.2, 0.3],
      dir: [s, 0, 0],
      axis: "z",
      texture: PLATE,
    });
    rod([s * 0.98, 2.7, 0.74], [s * 1.1, 2.75, 0.74], 0.025, "#14161b", { bone: door });
    box([0.06, 0.16, 0.12], "#14161b", [s * 1.14, 2.75, 0.74], { bone: door });
    box([0.02, 0.12, 0.09], CHROMEP, [s * 1.11, 2.75, 0.74], { bone: door });
  }

  // interior
  box([1.7, 0.2, 0.4], "#1e2128", [0, 2.65, 0.62]);
  b.part(new THREE.PlaneGeometry(0.5, 0.17), "#ffffff", {
    bone: chassis,
    at: [0.4, 2.67, 0.415],
    dir: [0, 0, -1],
    axis: "z",
    texture: GAUGES,
  });
  for (const s of [1, -1]) {
    box([0.5, 0.1, 0.5], "#2a2e38", [s * 0.4, 2.6, -0.15]);
    box([0.5, 0.5, 0.1], "#2a2e38", [s * 0.4, 2.82, -0.42]);
    box([0.26, 0.14, 0.06], "#d8321e", [s * 0.4, 3.0 - 0.02, -0.42]);
  }
  const wheelJ = b.joint("steeringWheel", {
    parent: chassis,
    at: [0.4, 2.8, 0.38],
    dir: [0, 0.5, -1],
    role: "hinge",
  });
  b.part(new THREE.TorusGeometry(0.13, 0.022, 4, 10), "#14161b", {
    bone: wheelJ,
    at: [0.4, 2.8, 0.38],
    dir: [0, 0.5, -1],
    axis: "z",
  });
  box([0.26, 0.03, 0.03], "#14161b", [0.4, 2.8, 0.38], { bone: wheelJ }).mesh.rotation.set(0, 0, 0);
  rod([0.4, 2.8, 0.38], [0.4, 2.62, 0.6], 0.03, "#14161b");
  // driver
  box([0.36, 0.32, 0.2], "#2f5fd0", [0.4, 2.72, -0.2]);
  box([0.26, 0.22, 0.26], "#ffd23a", [0.4, 2.87, -0.2]);
  box([0.2, 0.08, 0.04], "#10131a", [0.4, 2.87, -0.065]);
  box([0.05, 0.02, 0.01], "#ffffff", [0.46, 2.89, -0.043]);
  box([0.06, 0.02, 0.27], "#ffffff", [0.4, 2.985, -0.2]);
  for (const o of [-1, 1]) {
    rod([0.4 + o * 0.2, 2.78, -0.2], [0.4 + o * 0.12, 2.82, 0.3], 0.05, "#2f5fd0");
    box([0.08, 0.08, 0.08], "#14161b", [0.4 + o * 0.12, 2.82, 0.31]);
  }

  // roof: light bar, antenna
  box([1.7, 0.16, 0.16], "#14161b", [0, 3.2, 0.55]);
  for (let i = 0; i < 8; i++) glow(box([0.16, 0.12, 0.05], "#fff4c0", [-0.7 + 0.2 * i, 3.2, 0.64]), 1.3);
  rod([0.85, 3.1, -0.7], [0.85, 3.55, -0.7], 0.012, "#14161b");
  box([0.01, 0.16, 0.26], "#ffffff", [0.85, 3.47, -0.84], { tex: FLAG });

  // ---- Bed ----------------------------------------------------------------------------------------------------
  box([1.7, 0.06, 1.45], LINER, [0, 1.98, -1.5]);
  for (const s of [1, -1]) box([0.1, 0.45, 1.5], BODY, [s * 0.9, 2.175, -1.48]);
  box([1.9, 0.45, 0.1], BODY, [0, 2.175, -0.78]);
  const gate = b.joint("tailgate", { parent: chassis, at: [0, 1.99, -2.25], dir: [0, 1, 0], role: "hinge" });
  box([1.74, 0.42, 0.06], GATE, [0, 2.2, -2.25], { bone: gate });
  box([0.3, 0.06, 0.03], CHROMEP, [0, 2.25, -2.29], { bone: gate });
  for (const s of [1, -1]) {
    glow(box([0.14, 0.2, 0.04], "#ff2a2a", [s * 0.8, 2.15, -2.285], { bone: gate }), 1.2);
    glow(box([0.08, 0.08, 0.04], "#fff4e0", [s * 0.66, 2.15, -2.285], { bone: gate }), 1.1);
    cyl(0.12, 0.8, "#2b6fd9", [s * 0.4, 2.14, -1.45], [0, 0, 1]);
    cyl(0.125, 0.06, CHROMEP, [s * 0.4, 2.14, -1.2], [0, 0, 1]);
    cyl(0.125, 0.06, CHROMEP, [s * 0.4, 2.14, -1.7], [0, 0, 1]);
    cyl(0.05, 0.1, CHROMEP, [s * 0.4, 2.14, -1.0], [0, 0, 1], { seg: 6 });
  }
  box([0.5, 0.22, 0.3], "#d8321e", [0, 2.12, -2.0]);
  rod([-0.1, 2.25, -2.0], [0.1, 2.25, -2.0], 0.02, CHROMEP);
  box([1.9, 0.24, 0.2], STEELP, [0, 1.45, -2.35]);
  b.part(new THREE.SphereGeometry(0.06, 6, 4), CHROMEP, { bone: chassis, at: [0, 1.62, -2.35] });

  // roll bar + lights
  for (const s of [1, -1]) {
    rod([s * 0.8, 2.0, -1.0], [s * 0.8, 3.3, -1.0], 0.045, CHROMEP);
    rod([s * 0.55, 1.98, -1.25], [s * 0.55, 3.3, -1.25], 0.075, CHROMEP);
    cyl(0.09, 0.05, "#14161b", [s * 0.55, 2.4, -1.25], [0, 1, 0], { seg: 8 });
    cyl(0.09, 0.05, "#14161b", [s * 0.55, 2.9, -1.25], [0, 1, 0], { seg: 8 });
    cyl(0.1, 0.08, CHROMEP, [s * 0.55, 3.3, -1.25], [0, 1, 0], { seg: 8 });
    glow(b.part(new THREE.ConeGeometry(0.11, 0.32, 4), "#ff8a1f", { bone: chassis, at: [s * 0.55, 3.5, -1.25] }), 1.4);
    glow(b.part(new THREE.ConeGeometry(0.06, 0.22, 4), "#ffe27a", { bone: chassis, at: [s * 0.55, 3.45, -1.25] }), 1.6);
    rod([s * 0.8, 3.1, -0.9], [s * 0.8, 3.3, -1.0], 0.035, CHROMEP);
  }
  rod([-0.8, 3.3, -1.0], [0.8, 3.3, -1.0], 0.045, CHROMEP);
  rod([-0.8, 2.6, -1.0], [0.8, 2.6, -1.0], 0.04, CHROMEP);
  rod([-0.8, 2.1, -1.0], [0.8, 3.2, -1.0], 0.035, CHROMEP);
  for (const x of [-0.5, -0.17, 0.17, 0.5]) {
    cyl(0.09, 0.1, CHROMEP, [x, 3.43, -1.0], [0, 0, 1], { seg: 8 });
    glow(cyl(0.07, 0.04, "#fff4c0", [x, 3.43, -0.94], [0, 0, 1], { seg: 8 }), 1.3);
  }

  // side nerf rails
  for (const s of [1, -1]) {
    rod([s * 1.02, 1.45, -0.7], [s * 1.02, 1.45, 0.7], 0.04, CHROMEP);
    box([0.1, 0.06, 0.06], STEELP, [s * 0.98, 1.45, -0.7]);
    box([0.1, 0.06, 0.06], STEELP, [s * 0.98, 1.45, 0.7]);
  }

  return b.root;
}
