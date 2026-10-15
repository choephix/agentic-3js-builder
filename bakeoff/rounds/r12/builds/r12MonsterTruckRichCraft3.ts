import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, aim, noise } from "../../../../src/index";
import type { ColorInput, Joint, V3 } from "../../../../src/index";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, stepped } from "../../../../kits/pixel";
import { coil } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Skull Crusher Monster Truck",
  description:
    "Pixel-art monster truck: lime-green pickup body with flame decals and skull emblems, supercharged hood, coil-over suspension, solid axles and four huge lugged tyres with beadlock rims.",
};

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters)
const BW = 1.05; // body half width
const Y0 = 1.78; // body underside
const Y1 = 2.6; // top of the lower body / cab floor
const ZF = 2.6; // body front
const ZB = -2.65; // body rear
const ZC = -0.95; // cab / bed split
const WX = 1.55; // wheel centre x
const WZ = 1.65; // wheel centre |z|
const WY = 0.85; // wheel centre height
const WW = 0.9; // tyre width

// ---------------------------------------------------------------------------------------------------------------
// Paints: square cells, ordered dither, ramps lit by one key light
const KEY = new THREE.Vector3(0.4, 0.8, 0.5).normalize();
const lightOf = (n: THREE.Vector3) => 0.5 + 0.5 * n.dot(KEY);
const shaded = (ramp: string[], size = 0.05, grit = 0.14) =>
  cellPaint(size, (c) => c.pick(ramp, lightOf(c.n) * 0.9 + 0.05 + (c.random(1) - 0.5) * grit), { dither: true });

const GREENS = ["#0b3a1c", "#14692a", "#1fa13a", "#46d445", "#a4f56b"];
const MUD = ["#2a1a0d", "#4a3018", "#6b4826", "#8a6535"];
const TRIM_R = ["#050507", "#0d0d11", "#191920", "#2a2a33"];
const STRIPE_Y = "#ffd21e";

const BODY = cellPaint(
  0.05,
  (c) => {
    const y = c.at.y;
    const z = c.at.z;
    const vertical = Math.abs(c.n.y) < 0.6;
    if (vertical && y < 1.84) return c.pick(TRIM_R, 0.2 + 0.6 * c.random(2));
    if (vertical && y < 1.91) return c.pick(["#b88a00", STRIPE_Y, "#fff07a"], 0.4 + 0.5 * c.random(7));
    const mudTop = 1.93 + (z < -0.8 ? 0.38 : 0.08) * noise(c.at, 0.45, 3);
    if (vertical && y < mudTop && c.random(5) < 0.65) return c.pick(MUD, c.random(6));
    return c.pick(GREENS, lightOf(c.n) * 0.85 + 0.08 + (c.random(1) - 0.5) * 0.12);
  },
  { dither: true },
);

const RUBBER_R = ["#060608", "#101015", "#1b1b22", "#2a2a33"];
const RUBBER = cellPaint(
  0.05,
  (c) => {
    if (c.at.y < 0.12 + 0.5 * noise(c.at, 0.3, 8) && c.random(3) < 0.7) return c.pick(MUD, c.random(4));
    return c.pick(RUBBER_R, lightOf(c.n) * 0.8 + 0.1 + (c.random(1) - 0.5) * 0.2);
  },
  { dither: true },
);

const STEEL = shaded(["#101216", "#1e222a", "#323844", "#4e586a"]);
const CHROME = shaded(["#38405a", "#7a86a6", "#c4cee6", "#f6f9ff"], 0.04, 0.1);
const SPRING = shaded(["#6a4a00", "#bf8f00", "#ffcf12", "#fff08a"], 0.03, 0.1);
const SHOCK = shaded(["#3a0606", "#8a1010", "#d02020", "#ff6a5a"], 0.04, 0.1);
const TRIM = shaded(TRIM_R, 0.05, 0.1);
const NITRO = shaded(["#0a1c4a", "#123a96", "#2468e0", "#7ab0ff"], 0.04, 0.1);
const LINER = shaded(["#08080a", "#121216", "#1c1c22"], 0.05, 0.3);
const BRASS = shaded(["#4a3208", "#9a6c14", "#e0a830", "#ffe27a"], 0.04, 0.1);

// ---------------------------------------------------------------------------------------------------------------
// Textures
const SKY = ["#0b1428", "#14284a", "#24457a", "#3f74b0", "#86c4ea"];
function glassTex(w: number, h: number) {
  return pixelTexture(w, h, (g) => {
    g.fill((x, y) => {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return "#0a0c10";
      let c = pick(SKY, 0.15 + 0.55 * (1 - y / h), bayer(x, y));
      const d = (x + y * 2 + 5) % 18;
      if (d < 2) c = SKY[4];
      else if (d < 4) c = SKY[3];
      return c;
    });
  });
}
const GLASS_S = glassTex(17, 8);
const GLASS_W = glassTex(32, 15);
const GLASS_R = glassTex(28, 11);

const GRILLE = pixelTexture(20, 10, (g) => {
  g.fill((x, y) => {
    if (x === 0 || x === 19 || y === 0 || y === 9) return "#cfd6e6";
    if (y === 1 || y === 8) return "#5b6379";
    if (x % 3 === 1) return pick(["#7d88a6", "#c6d0e6", "#ffffff"], 0.2 + y / 12, bayer(x, y));
    return "#0b0b10";
  });
  g.stamp(8, 3, ["yyyy", "ykky", "yyyy"], { y: "#ffd21e", k: "#1a1208" });
});

const HEADLIGHT = pixelArt([".oooo.", "oyyyyo", "oyhhyo", "oyhhyo", "oyyyyo", ".oooo."], {
  o: "#8a6a10",
  y: "#ffe14a",
  h: "#ffffff",
});
const TAIL = pixelArt(["dddddddd", "drrrrrrd", "drrhhrrd", "dddddddd"], { d: "#5a0508", r: "#ff2a2a", h: "#ffb0a0" });
const LIGHTBAR = pixelTexture(28, 3, (g) =>
  g.fill((x, y) => (x % 4 === 3 ? "#3a3a40" : y === 1 ? "#ffffff" : "#ffe07a")),
);
const PLATE = pixelArt(
  ["bbbbbbbbbb", "bwwwwwwwwb", "bwkkwkwkkb", "bwwwwwwwwb", "bbbbbbbbbb"],
  { b: "#1c3f9a", w: "#f2eedd", k: "#161616" },
);

const SKULL_ROWS = [
  "...kkkkkkkk...",
  "..kwwwwwwwwk..",
  ".kwwwwwwwwwwk.",
  ".kwwwwwwwwwwk.",
  "kwwkkkwwkkkwwk",
  "kwwkkkwwkkkwwk",
  "kwwwkkwwkkwwwk",
  ".kwwwwkkwwwwk.",
  "..kwwwkkwwwk..",
  "..kwwwwwwwwk..",
  "..kwkwkkwkwk..",
  "...kkwkkwkk...",
].map((r, i) => (i >= 8 ? r.replace(/w/g, "s") : r));
const SKULL = pixelArt(SKULL_ROWS, { k: "#140a0c", w: "#f4efd8", s: "#c2b896" });

function flameTex(mirror: boolean) {
  const W = 68;
  const H = 13;
  return pixelTexture(W, H, (g) => {
    for (let gx = 0; gx < W; gx++) {
      const x = mirror ? W - 1 - gx : gx;
      const f = (x % 11) / 11;
      const amp = 4 + 9 * (1 - x / W);
      const top = Math.min(H, Math.round(1.5 + amp * Math.pow(1 - f, 1.2)));
      for (let yb = 0; yb < top; yb++) {
        const depth = top - 1 - yb;
        const col =
          depth < 1 ? "#3a0608" : depth < 3 ? "#d4181c" : depth < 5 ? "#ff7a12" : yb < 2 ? "#fff0a0" : "#ffd024";
        g.set(gx, H - 1 - yb, col);
      }
    }
  });
}
const FLAME_L = flameTex(false); // left (+X) side: front is on the viewer's left
const FLAME_R = flameTex(true);

const SIDEWALL = pixelTexture(30, 30, (g) => {
  g.fill((x, y) => {
    const dx = x - 14.5;
    const dy = y - 14.5;
    const d = Math.hypot(dx, dy);
    if (d > 14.9) return "";
    const ang = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI);
    if (d > 13) return (x + y) % 5 === 0 ? "#18181e" : "#0c0c10";
    if (d > 10.4) {
      const seg = Math.floor(ang * 24);
      if (d > 11.4 && d < 12.8 && seg % 2 === 0 && seg % 8 !== 0) return "#e9e4d0";
      return dy < 0 ? "#1e1e25" : "#131318";
    }
    if (d > 9.2) return "#3a3f4c";
    if (d > 6.8) {
      const t = ang * 16;
      const f = Math.abs(t - Math.round(t));
      if (f * ((Math.PI * 2 * d) / 16) < 0.8) return "#1b1e27";
      return dx + dy < 0 ? "#f0f4ff" : "#9aa5c4";
    }
    if (d > 3.2) {
      if (Math.floor(ang * 10) % 2 === 0 && d > 4.4 && d < 6.2) return "#a85a04";
      return pick(["#b86b06", "#ffb41c", "#ffd24a"], 0.55 - (dx + dy) / 22, bayer(x, y));
    }
    return d > 1.6 ? "#d6ddf0" : "#2a2d38";
  });
});

// ---------------------------------------------------------------------------------------------------------------
type Opt = { bone?: Joint; dir?: V3; up?: V3; axis?: "x" | "y" | "z"; texture?: THREE.Texture; name?: string };
const UPY = new THREE.Vector3(0, 1, 0);

/** Staggered chevron tread lugs for one tyre, merged into one geometry in model space. */
function lugs(center: THREE.Vector3, sx: number) {
  const list: THREE.BufferGeometry[] = [];
  const m = new THREE.Matrix4();
  for (const row of [-1, 1]) {
    for (let i = 0; i < 18; i++) {
      const a = ((i * 20 + (row > 0 ? 10 : 0)) * Math.PI) / 180;
      const radial = new THREE.Vector3(0, Math.cos(a), Math.sin(a));
      const q = aim(radial, [sx, 0, 0]).multiply(new THREE.Quaternion().setFromAxisAngle(UPY, row * 0.35));
      const pos = center
        .clone()
        .addScaledVector(radial, 0.8)
        .add(new THREE.Vector3(sx * row * 0.22, 0, 0));
      const g = new THREE.BoxGeometry(0.22, 0.14, 0.4);
      g.applyMatrix4(m.compose(pos, q, new THREE.Vector3(1, 1, 1)));
      list.push(g);
    }
  }
  return mergeGeometries(list)!;
}

export default function build() {
  const b = createBuilder({ name: "monster-truck" });
  const chassis = b.joint("chassis", { at: [0, 1.4, 0] });

  const box = (w: number, h: number, d: number, color: ColorInput, x: number, y: number, z: number, o: Opt = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at: [x, y, z], ...o });
  const cyl = (r: number, h: number, sides: number, color: ColorInput, at: V3, dir: V3, o: Opt = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone: chassis, at, dir, ...o });
  const decal = (tex: THREE.Texture, w: number, h: number, at: V3, dir: V3, o: Opt = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, up: [0, 1, 0], axis: "z", texture: tex, ...o });
  const studs = (pts: number[][], size: number, color: ColorInput) =>
    b.part(
      mergeGeometries(pts.map(([x, y, z]) => new THREE.BoxGeometry(size, size, size).translate(x, y, z)))!,
      color,
      { bone: chassis, at: [0, 0, 0] },
    );

  // ===== Chassis frame ===========================================================================================
  for (const s of [1, -1]) {
    box(0.16, 0.3, 5.2, STEEL, s * 0.5, 1.42, 0, { name: "rail" });
    for (const z of [-2.2, -0.9, 0.9, 2.2]) box(0.24, 0.2, 0.24, TRIM, s * 0.5, 1.68, z, { name: "bodyMount" });
  }
  for (const z of [-2.4, -1.2, 0.2, 1.3, 2.4]) box(0.9, 0.14, 0.16, STEEL, 0, 1.4, z, { name: "crossMember" });
  box(0.5, 0.3, 0.7, STEEL, 0, 1.3, 0, { name: "transferCase" });

  // ===== Axles, links, shocks, wheels ============================================================================
  for (const sz of [1, -1]) {
    const zz = sz * WZ;
    box(2.3, 0.24, 0.24, STEEL, 0, WY, zz, { name: "axleBeam" });
    b.part(new THREE.SphereGeometry(0.3, 8, 6), STEEL, { bone: chassis, at: [0, WY, zz + 0.1], scale: [1, 0.9, 0.9] as unknown as undefined });
    cyl(0.1, 0.5, 8, CHROME, [0, WY + 0.05, zz + 0.38], [0, 0, 1], { name: "diffNose" });
    for (const s of [1, -1]) {
      cyl(0.24, 0.3, 8, STEEL, [s * 0.95, WY, zz], [s, 0, 0], { name: "planetary" });
      b.rod([s * 0.55, 0.74, zz], [s * 0.5, 1.3, zz - sz * 1.2], 0.045, STEEL, { bone: chassis, sides: 6 });
      b.rod([s * 0.3, 1.02, zz], [s * 0.5, 1.46, zz - sz * 0.9], 0.04, STEEL, { bone: chassis, sides: 6 });
    }
    b.rod([0, 1.28, sz * 0.35], [0, 0.98, sz * 1.5], 0.05, STEEL, { bone: chassis, sides: 6 });
  }

  const tyres: Joint[] = [];
  const wheelDefs: [number, number, string][] = [
    [1, 1, "FL"],
    [-1, 1, "FR"],
    [1, -1, "RL"],
    [-1, -1, "RR"],
  ];
  for (const [sx, sz, tag] of wheelDefs) {
    const cx = sx * WX;
    const cz = sz * WZ;
    const w = b.joint(`wheel${tag}`, { parent: chassis, at: [cx, WY, cz], dir: [sx, 0, 0] });
    tyres.push(w);
    const center = new THREE.Vector3(cx, WY, cz);
    b.part(new THREE.CylinderGeometry(0.74, 0.74, WW, 20), RUBBER, { bone: w, at: center, dir: [sx, 0, 0], name: `tyre${tag}` });
    b.part(lugs(center, sx), RUBBER, { bone: w, at: [0, 0, 0], name: `tread${tag}` });
    for (const f of [1, -1]) {
      b.part(new THREE.CircleGeometry(0.72, 24), "#ffffff", {
        bone: w,
        at: [cx + sx * f * (WW / 2 + 0.006), WY, cz],
        dir: [sx * f, 0, 0],
        up: [0, 1, 0],
        axis: "z",
        texture: SIDEWALL,
        name: `sidewall${tag}`,
      });
      b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 8), BRASS, {
        bone: w,
        at: [cx + sx * f * (WW / 2 + 0.04), WY, cz],
        dir: [sx, 0, 0],
        name: `hubcap${tag}`,
      });
    }

    // coil-over shock inboard of the tyre
    const x = sx * 0.82;
    b.sweep(coil([x, 1.0, cz], [x, 1.52, cz], 0.1, 6), 0.022, { bone: chassis, color: SPRING, sides: 4 });
    b.rod([x, 0.98, cz], [x, 1.3, cz], 0.05, SHOCK, { bone: chassis, sides: 6 });
    b.rod([x, 1.3, cz], [x, 1.55, cz], 0.028, CHROME, { bone: chassis, sides: 6 });
    box(0.2, 0.08, 0.2, STEEL, x, 0.97, cz, { name: "shockFoot" });
    box(0.34, 0.08, 0.18, STEEL, sx * 0.66, 1.58, cz, { name: "shockBracket" });
  }

  // ===== Underglow ===============================================================================================
  for (const s of [1, -1]) glow(box(0.05, 0.05, 3.8, "#7dff4a", s * (BW - 0.1), 1.755, 0.2, { name: "neon" }), 1.2);
  glow(box(1.9, 0.05, 0.05, "#7dff4a", 0, 1.755, 2.5, { name: "neonFront" }), 1.2);

  // ===== Body ====================================================================================================
  box(2 * BW, Y1 - Y0, ZF - ZC, BODY, 0, (Y0 + Y1) / 2, (ZF + ZC) / 2, { name: "bodyFront" });
  box(2 * BW, 0.32, ZC - ZB, BODY, 0, 1.94, (ZC + ZB) / 2, { name: "bedFloor" });
  for (const s of [1, -1]) {
    box(0.14, 0.55, ZC - ZB, BODY, s * (BW - 0.07), 2.375, (ZC + ZB) / 2, { name: "bedWall" });
    box(0.2, 0.05, ZC - ZB, TRIM, s * (BW - 0.07), 2.675, (ZC + ZB) / 2, { name: "bedCap" });
  }
  box(2 * BW, 0.55, 0.14, BODY, 0, 2.375, ZB + 0.07, { name: "tailgate" });
  box(2 * BW, 0.05, 0.2, TRIM, 0, 2.675, ZB + 0.07, { name: "tailgateCap" });
  box(2 * BW - 0.3, 0.02, 1.52, LINER, 0, 2.11, -1.8, { name: "bedLiner" });
  for (let i = 0; i < 8; i++) box(1.76, 0.025, 0.06, TRIM, 0, 2.125, -2.45 + i * 0.2, { name: "linerRib" });

  // hood with power bulge
  box(1.9, 0.08, 1.62, BODY, 0, 2.64, 1.78, { name: "hood" });
  box(1.0, 0.05, 1.5, BODY, 0, 2.705, 1.75, { name: "hoodBulge" });
  studs(
    [-0.92, 0.92].flatMap((x) => [1.05, 1.3, 1.55, 1.8, 2.05, 2.3, 2.5].map((z) => [x, 2.69, z])),
    0.05,
    CHROME,
  );

  // cab greenhouse
  b.extrude(
    [
      [0, 0, "sharp"],
      [1.55, 0, "sharp"],
      [1.0, 0.7, "sharp"],
      [0.1, 0.7, "sharp"],
    ],
    { at: [0, Y1, ZC], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.8, color: BODY, bone: chassis, name: "cab" },
  );
  box(1.9, 0.05, 0.36, BODY, 0, 3.3, 0.2, { name: "sunVisor" });
  box(1.9, 0.02, 0.36, TRIM, 0, 3.275, 0.2, { name: "sunVisorUnder" });
  for (const s of [1, -1]) decal(GLASS_S, 0.85, 0.4, [s * 0.908, 2.97, -0.325], [s, 0, 0]);
  decal(GLASS_W, 1.6, 0.75, [0, 2.9574, 0.3344], [0, 0.618, 0.786]);
  decal(GLASS_R, 1.4, 0.55, [0, 2.95, -0.912], [0, 0.14, -0.99]);

  // roof light bar
  for (const s of [1, -1]) box(0.08, 0.1, 0.12, TRIM, s * 0.55, 3.34, -0.3, { name: "barPost" });
  box(1.5, 0.16, 0.2, TRIM, 0, 3.43, -0.3, { name: "lightBar" });
  glow(decal(LIGHTBAR, 1.4, 0.15, [0, 3.43, -0.194], [0, 0, 1]), 1.3);

  // doors, flames, skulls
  for (const s of [1, -1]) {
    decal(s > 0 ? FLAME_L : FLAME_R, 3.4, 0.65, [s * (BW + 0.004), 2.245, 0.85], [s, 0, 0], { name: "flames" });
    decal(SKULL, 0.7, 0.6, [s * (BW + 0.016), 2.25, 0.0], [s, 0, 0], { name: "doorSkull" });
    decal(SKULL, 0.56, 0.48, [s * (BW + 0.01), 2.37, -1.8], [s, 0, 0], { name: "bedSkull" });
    for (const z of [0.93, -0.93]) box(0.025, 0.7, 0.03, TRIM, s * (BW + 0.02), 2.26, z, { name: "doorSeam" });
    box(0.05, 0.04, 0.16, CHROME, s * (BW + 0.03), 2.45, -0.7, { name: "doorHandle" });
    // mirror
    b.rod([s * BW, 2.82, 0.5], [s * (BW + 0.22), 2.9, 0.52], 0.025, TRIM, { bone: chassis, sides: 4 });
    box(0.1, 0.28, 0.2, BODY, s * (BW + 0.27), 2.9, 0.5, { name: "mirror" });
    box(0.08, 0.22, 0.02, CHROME, s * (BW + 0.27), 2.9, 0.39, { name: "mirrorGlass" });
    // side step
    box(0.34, 0.06, 1.0, STEEL, s * (BW + 0.12), 1.76, 0, { name: "sideStep" });
    box(0.1, 0.1, 0.1, STEEL, s * (BW + 0.2), 1.7, 0.4, { name: "stepStud" });
    box(0.1, 0.1, 0.1, STEEL, s * (BW + 0.2), 1.7, -0.4, { name: "stepStud" });
  }
  decal(SKULL, 0.56, 0.48, [0, 2.737, 2.1], [0, 1, 0], { up: [0, 0, 1], name: "hoodSkull" });

  // ===== Supercharger & exhaust ===================================================================================
  box(0.7, 0.28, 0.72, CHROME, 0, 2.87, 1.3, { name: "blower" });
  box(0.5, 0.2, 0.4, TRIM, 0, 3.07, 1.28, { name: "intake" });
  for (let i = 0; i < 4; i++) box(0.46, 0.03, 0.04, CHROME, 0, 3.0 + i * 0.05, 1.5, { name: "intakeSlat" });
  cyl(0.15, 0.08, 8, BRASS, [0, 2.87, 1.69], [0, 0, 1], { name: "blowerPulley" });
  cyl(0.06, 0.1, 6, CHROME, [0, 2.87, 1.73], [0, 0, 1], { name: "pulleyCap" });
  studs(
    [-0.3, -0.15, 0, 0.15, 0.3].flatMap((x) => [[x, 3.02, 1.0], [x, 3.02, 1.6]]).filter(([x]) => Math.abs(x) < 0.25 || true),
    0.04,
    CHROME,
  );
  for (const s of [1, -1]) {
    cyl(0.07, 0.6, 8, CHROME, [s * 0.75, 2.95, 1.1], [0, 1, 0], { name: "stack" });
    box(0.2, 0.06, 0.2, CHROME, s * 0.75, 2.66, 1.1, { name: "stackBase" });
    cyl(0.09, 0.05, 8, TRIM, [s * 0.75, 3.27, 1.1], [0, 1, 0], { name: "stackCap" });
    glow(b.spike([s * 0.75, 3.29, 1.1], [0, 1, 0], 0.24, 0.06, { color: "#ff8a1c", bone: chassis, sides: 4 }), 1.6);
  }

  // ===== Front end ================================================================================================
  box(1.9, 0.6, 0.05, TRIM, 0, 2.2, 2.62, { name: "frontBezel" });
  decal(GRILLE, 1.0, 0.5, [0, 2.2, 2.652], [0, 0, 1], { name: "grille" });
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.3, 0.3, 0.08), "#ffffff", {
        bone: chassis,
        at: [s * 0.72, 2.2, 2.66],
        texture: HEADLIGHT,
        name: "headlight",
      }),
      1.5,
    );
  }
  // bumper
  box(2.2, 0.16, 0.16, CHROME, 0, 1.97, 2.86, { name: "bumper" });
  for (const s of [1, -1]) {
    box(0.12, 0.3, 0.12, CHROME, s * 1.0, 2.1, 2.86, { name: "bumperPost" });
    box(0.14, 0.14, 0.3, STEEL, s * 0.8, 1.97, 2.72, { name: "bumperArm" });
    glow(box(0.16, 0.12, 0.05, "#ffb347", s * 0.6, 1.97, 2.95, { name: "fogLamp" }), 1.3);
    box(0.08, 0.08, 0.08, SHOCK, s * 0.4, 1.8, 2.9, { name: "towHook" });
  }
  box(0.56, 0.22, 0.22, STEEL, 0, 1.97, 3.0, { name: "winch" });
  cyl(0.09, 0.5, 8, CHROME, [0, 1.97, 3.0], [1, 0, 0], { name: "winchDrum" });
  box(0.08, 0.2, 0.05, SHOCK, 0, 1.8, 3.12, { name: "winchHook" });
  studs([-0.9, -0.6, 0.6, 0.9].map((x) => [x, 2.0, 2.95]), 0.04, STEEL);

  // ===== Rear end =================================================================================================
  for (const s of [1, -1])
    glow(decal(TAIL, 0.4, 0.2, [s * 0.75, 2.3, ZB - 0.006], [0, 0, -1], { name: "tailLight" }), 1.3);
  decal(PLATE, 0.5, 0.25, [0, 2.2, ZB - 0.006], [0, 0, -1], { name: "plate" });
  box(2.2, 0.18, 0.2, CHROME, 0, 1.97, ZB - 0.12, { name: "rearBumper" });
  box(0.2, 0.2, 0.3, STEEL, 0, 1.95, ZB - 0.3, { name: "hitch" });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), CHROME, { bone: chassis, at: [0, 2.08, ZB - 0.3] });

  // ===== Bed gear: roll hoop, nitrous bottles, antenna flag ======================================================
  for (const s of [1, -1]) {
    box(0.08, 0.8, 0.08, CHROME, s * 0.85, 3.05, -1.2, { name: "hoopPost" });
    b.rod([s * 0.85, 3.45, -1.2], [s * 0.85, 2.15, -2.2], 0.04, CHROME, { bone: chassis, sides: 4 });
    glow(box(0.5, 0.1, 0.1, "#fff3b0", s * 0.4, 3.45, -1.27, { name: "hoopLamp" }), 1.3);
  }
  box(1.78, 0.08, 0.08, CHROME, 0, 3.45, -1.2, { name: "hoopBar" });
  for (const z of [-1.55, -1.85]) {
    cyl(0.12, 1.2, 8, NITRO, [0, 2.24, z], [1, 0, 0], { name: "nitroBottle" });
    for (const s of [1, -1]) {
      cyl(0.07, 0.12, 6, CHROME, [s * 0.65, 2.24, z], [1, 0, 0], { name: "nitroHead" });
      box(0.06, 0.27, 0.27, TRIM, s * 0.3, 2.24, z, { name: "nitroStrap" });
    }
  }
  b.rod([-0.88, 2.65, -1.02], [-0.88, 4.0, -1.02], 0.015, TRIM, { bone: chassis, sides: 4 });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), "#ffd21e", { bone: chassis, at: [-0.88, 4.02, -1.02] });
  b.extrude(
    stepped(
      [
        [0, 11],
        [0, 9],
        [0, 7],
        [0, 5],
        [0, 3],
      ],
      0.06,
      { rows: true },
    ),
    { at: [-0.88, 3.65, -1.02], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.02, color: "#e5252a", bone: chassis, name: "flag" },
  );

  return b.root;
}
