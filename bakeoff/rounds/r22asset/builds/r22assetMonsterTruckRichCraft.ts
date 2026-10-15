import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Joint } from "../../../../src/skeleton";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { bayer, cellPaint, pick, pixelArt, pixelTexture } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Monster Truck",
  description:
    "A pixel-art monster truck on 1.7 m mud tyres: flame-painted red pickup body on a lifted frame, chrome roll cage, blower, side stacks, light bar, opening doors and steering wheels.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.04;
const RED_RAMP = ["#4a0c14", "#7e1218", "#b81c20", "#e03a24", "#ff7a3a"];
const ORANGE = "#ff9a1e";
const YELLOW = "#ffd21f";
const CREAM = "#fff2a0";
const CHROME = "#cfd6e2";
const STEEL = "#2b2f38";
const DARK = "#15161c";
const TYRE = ["#0a0a0d", "#15161b", "#222329", "#30323a"];
const MUD = ["#3b2a1a", "#5a3f24", "#7a5a34"];

const GLASS = pixelTexture(16, 8, (g) =>
  g.fill((x, y) => {
    const d = (x + y * 2) % 9;
    if (d === 0 || d === 1) return "#bfe8ff";
    return pick(["#0c2a4a", "#16508a", "#2a82c8", "#58b4e8"], 1 - y / 8, bayer(x, y));
  }),
);
const GRILLE = pixelTexture(16, 8, (g) =>
  g.fill((x, y) => (y < 1 || y > 6 ? CHROME : x % 3 === 0 ? CHROME : "#0b0b0f")),
);
const SKULL = pixelTexture(13, 12, (g) => {
  g.fill(() => "#101014");
  g.stamp(
    1,
    1,
    [
      ".wwwwwwwww.",
      "wwwwwwwwwww",
      "wwwwwwwwwww",
      "wkkkwwwkkkw",
      "wkkkwwwkkkw",
      "wwwwwkwwwww",
      "wwwwkkkwwww",
      ".wwwwwwwww.",
      "..wkwkwkw..",
      "..wkwkwkw..",
    ],
    { w: "#f2efe2", k: "#101014" },
  );
});
const NUM = pixelTexture(11, 11, (g) => {
  g.fill((x, y) => {
    const d = (x - 5) ** 2 + (y - 5) ** 2;
    return d <= 30 ? (d > 22 ? YELLOW : "#101014") : "";
  });
  g.stamp(3, 2, ["yyyyy", "....y", "...y.", "..y..", "..y..", "..y..", "..y.."], { y: YELLOW });
});
const CHECK = pixelTexture(12, 8, (g) => g.fill((x, y) => ((x >> 1) + (y >> 1)) % 2 ? "#101014" : "#f4f4f4"));
const VENT = pixelArt(["kkkkkkkk", "gggggggg", "kkkkkkkk", "gggggggg", "kkkkkkkk"], { k: "#0b0b0f", g: "#5a6270" });

const BODY: Paint = cellPaint(
  TEXEL,
  (c) => {
    const y = c.at.y;
    const z = c.at.z;
    const shade = c.axis === 1 ? (c.n.y > 0 ? 0.85 : 0.2) : c.axis === 0 ? 0.6 : 0.5;
    const g = noise(c.at, 0.25, 3) - 0.5;
    const fy = y - 1.28;
    if (c.axis === 0 && fy < 0.88) {
      if (fy < 0.06) return "#2a0a0e";
      const w = Math.min(Math.max((z + 2.6) / 5.0, 0.25), 1);
      const k = (z + 3) * 2.2;
      const tooth = 1 - (k - Math.floor(k));
      const reach = (0.12 + 0.85 * tooth * tooth) * w;
      if (fy < reach) {
        if (fy < reach * 0.3) return CREAM;
        if (fy < reach * 0.62) return YELLOW;
        return ORANGE;
      }
    }
    return c.pick(RED_RAMP, shade + 0.25 * g);
  },
  { dither: true },
);

const tyrePaint = (cy: number, cz: number): Paint =>
  cellPaint(TEXEL, (c) => {
    const r = Math.hypot(c.at.y - cy, c.at.z - cz);
    const g = c.random(2);
    const m = noise(c.at, 0.3, 5) + (0.5 - c.at.y) * 0.8;
    if (c.axis === 0) {
      if (r < 0.5) return "#0a0a0d";
      if (r > 0.55 && r < 0.6) return g < 0.1 ? "#b8b8b8" : "#eeeeee";
      if (r > 0.7 && r < 0.73) return "#2c2d36";
    }
    if (m > 0.62) return c.pick(MUD, (m - 0.62) * 3 + 0.2 * g);
    return c.pick(TYRE, 0.25 + 0.5 * g);
  });

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });
  const chassis = b.joint("chassis", { at: [0, 1.2, 0], role: "spine" });

  const box = (
    size: [number, number, number],
    color: string | Paint,
    at: [number, number, number],
    bone: Joint = chassis,
    rotation?: [number, number, number],
  ) => b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, rotation });
  const bar = (a: [number, number, number], c: [number, number, number], r: number, color: string, bone: Joint = chassis) =>
    b.capsule(a, c, r, color, { bone, sides: 6 });
  const cyl = (
    r: number,
    h: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number],
    seg = 8,
    bone: Joint = chassis,
  ) => b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });

  // ---------------------------------------------------------------- wheels
  const R = 0.85;
  const TW = 0.9;
  const wheel = (s: number, cz: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const tag = `${front ? "F" : "R"}${side}`;
    const cx = s * 1.4;
    const cy = R;
    let parent = chassis;
    if (front) parent = b.joint(`steer${tag}`, { parent: chassis, at: [cx, cy, cz], dir: [0, 1, 0], role: "hinge" });
    const w = b.joint(`wheel${tag}`, { parent, at: [cx, cy, cz], dir: [s, 0, 0], role: "hinge" });
    const at: [number, number, number] = [cx, cy, cz];
    b.part(new THREE.CylinderGeometry(0.78, 0.78, TW, 16), tyrePaint(cy, cz), { bone: w, at, dir: [1, 0, 0] });
    const lugs: THREE.BufferGeometry[] = [];
    for (const [row, off, lw] of [
      [-0.29, 0, 0.3],
      [0, 0.5, 0.3],
      [0.29, 0, 0.3],
    ]) {
      for (let i = 0; i < 16; i++) {
        const a = ((i + off) / 16) * Math.PI * 2;
        lugs.push(
          new THREE.BoxGeometry(lw, 0.07, 0.2)
            .rotateX(a)
            .translate(row, 0.815 * Math.cos(a), 0.815 * Math.sin(a)),
        );
      }
    }
    const lug = mergeGeometries(lugs);
    if (lug) b.part(lug, "#232329", { bone: w, at });
    cyl(0.46, TW + 0.06, "#b9c0cc", at, [1, 0, 0], 12, w);
    cyl(0.36, TW + 0.08, "#5a6270", at, [1, 0, 0], 12, w);
    cyl(0.14, TW + 0.12, YELLOW, at, [1, 0, 0], 8, w);
    const nuts: THREE.BufferGeometry[] = [];
    for (const sx of [1, -1])
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        nuts.push(
          new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6)
            .rotateZ(Math.PI / 2)
            .translate(sx * 0.5, 0.26 * Math.cos(a), 0.26 * Math.sin(a)),
        );
      }
    const nutGeo = mergeGeometries(nuts);
    if (nutGeo) b.part(nutGeo, "#2a2f3a", { bone: w, at });
  };
  for (const s of [1, -1]) {
    wheel(s, 1.7, true);
    wheel(s, -1.7, false);
  }

  // ---------------------------------------------------------------- frame, axles, suspension
  for (const s of [1, -1]) {
    box([0.16, 0.22, 4.9], STEEL, [s * 0.5, 1.05, 0]);
    box([0.04, 0.16, 4.9], "#4a5160", [s * 0.59, 1.05, 0]);
  }
  for (const z of [-2.2, -0.6, 0.9, 2.2]) box([1.2, 0.14, 0.14], STEEL, [0, 1.05, z]);
  const springs: THREE.BufferGeometry[] = [];
  for (const z of [1.7, -1.7]) {
    box([2.0, 0.16, 0.16], "#3a3f4a", [0, 0.85, z]);
    box([0.5, 0.5, 0.5], "#4a5160", [0, 0.85, z]);
    box([0.3, 0.3, 0.04], "#262a32", [0, 0.85, z + (z > 0 ? 0.27 : -0.27)]);
    for (const s of [1, -1]) {
      bar([s * 0.72, 0.95, z], [s * 0.62, 1.28, z], 0.05, CHROME);
      box([0.2, 0.06, 0.3], STEEL, [s * 0.62, 1.29, z]);
      box([0.2, 0.06, 0.3], STEEL, [s * 0.72, 0.93, z]);
      for (let i = 0; i < 4; i++) {
        const t = 0.15 + i * 0.22;
        springs.push(
          new THREE.TorusGeometry(0.11, 0.025, 4, 8)
            .rotateX(Math.PI / 2)
            .translate(s * (0.72 - 0.1 * t), 0.95 + 0.33 * t, z),
        );
      }
      const dz = z > 0 ? -0.9 : 0.9;
      bar([s * 0.45, 0.85, z], [s * 0.45, 1.0, z + dz], 0.04, "#555c6b");
      bar([s * 0.25, 0.8, z], [s * 0.4, 1.0, z + dz * 0.8], 0.04, "#555c6b");
    }
  }
  const springGeo = mergeGeometries(springs);
  if (springGeo) b.part(springGeo, YELLOW, { bone: chassis, at: [0, 0, 0] });
  bar([-1.0, 0.8, 1.95], [1.0, 0.8, 1.95], 0.04, "#555c6b");
  bar([0, 0.9, -1.7], [0, 0.95, 1.7], 0.06, "#3a3f4a");
  box([0.5, 0.4, 0.8], "#3a3f4a", [0, 1.0, 0]);
  box([0.4, 0.3, 0.5], "#262a32", [0, 0.97, -0.9]);

  // ---------------------------------------------------------------- body shell
  box([1.76, 0.1, 4.8], STEEL, [0, 1.25, 0]);
  box([1.76, 0.62, 1.8], BODY, [0, 1.66, 1.5]);
  box([1.5, 0.08, 1.6], "#e8503a", [0, 2.0, 1.5]);
  box([1.7, 0.6, 0.1], "#1a1b22", [0, 1.65, 2.45]);
  box([0.7, 0.4, 0.02], "#ffffff", [0, 1.62, 2.51]).mesh.material = b.part(
    new THREE.BoxGeometry(0.7, 0.4, 0.02),
    "#ffffff",
    { bone: chassis, at: [0, 1.62, 2.512], texture: GRILLE },
  ).mesh.material;
  box([1.76, 0.7, 1.6], BODY, [0, 1.65, -0.2]);
  box([1.6, 0.62, 1.2], BODY, [0, 2.34, -0.35]);
  box([1.7, 0.08, 1.3], "#e8503a", [0, 2.69, -0.35]);
  box([1.4, 0.5, 0.03], "#ffffff", [0, 2.34, 0.265]).mesh.visible = false;
  b.part(new THREE.BoxGeometry(1.4, 0.5, 0.03), "#ffffff", { bone: chassis, at: [0, 2.34, 0.262], texture: GLASS });
  b.part(new THREE.BoxGeometry(1.3, 0.46, 0.03), "#ffffff", { bone: chassis, at: [0, 2.34, -0.962], texture: GLASS });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.46, 0.95), "#ffffff", { bone: chassis, at: [s * 0.812, 2.34, -0.35], texture: GLASS });
    box([0.2, 0.08, 2.2], STEEL, [s * 0.99, 1.22, -0.1]);
    box([0.2, 0.02, 2.2], "#7a8294", [s * 0.99, 1.265, -0.1]);
  }
  box([1.6, 0.06, 0.22], DARK, [0, 2.65, 0.32]);
  // bumpers
  box([1.9, 0.22, 0.22], CHROME, [0, 1.3, 2.62]);
  box([1.9, 0.22, 0.2], CHROME, [0, 1.3, -2.5]);
  box([0.5, 0.12, 0.3], "#555c6b", [0, 1.1, 2.55]);
  for (const s of [1, -1]) {
    bar([s * 0.6, 1.3, 2.72], [s * 0.6, 1.95, 2.72], 0.04, CHROME);
    box([0.1, 0.1, 0.18], "#d02020", [s * 0.9, 1.3, 2.78]);
    box([0.36, 0.3, 0.04], "#2a2f3a", [s * 0.62, 1.75, 2.52]);
    glow(box([0.28, 0.22, 0.03], "#fff3b0", [s * 0.62, 1.75, 2.545]), 1.5);
    glow(box([0.18, 0.2, 0.03], "#ff2a2a", [s * 0.7, 1.7, -2.41]), 1.2);
    box([0.05, 0.05, 0.14], "#2a2f3a", [s * 0.84, 1.44, 2.5]);
  }
  bar([-0.6, 1.95, 2.72], [0.6, 1.95, 2.72], 0.04, CHROME);
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 10; i++) bolts.push(new THREE.BoxGeometry(0.04, 0.04, 0.02).translate(-0.8 + i * 0.178, 1.3, 2.735));
  const boltGeo = mergeGeometries(bolts);
  if (boltGeo) b.part(boltGeo, "#7a8294", { bone: chassis, at: [0, 0, 0] });
  // hood: blower and injector stacks
  box([0.7, 0.32, 0.8], CHROME, [0, 2.2, 1.55]);
  box([0.6, 0.1, 0.6], "#111114", [0, 2.41, 1.55]);
  cyl(0.15, 0.1, "#7a8294", [0, 2.2, 1.12], [0, 0, 1], 10);
  const inj: THREE.BufferGeometry[] = [];
  for (const x of [-0.18, 0.18])
    for (let i = 0; i < 4; i++) inj.push(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 6).translate(x, 2.54, 1.3 + i * 0.16));
  const injGeo = mergeGeometries(inj);
  if (injGeo) b.part(injGeo, CHROME, { bone: chassis, at: [0, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.5, 0.02, 0.12), "#ffffff", { bone: chassis, at: [s * 0.52, 2.045, 2.1], texture: VENT });
    box([0.06, 0.04, 0.08], "#7a8294", [s * 0.8, 1.99, 2.3]);
  }
  // light bar
  box([1.3, 0.14, 0.2], DARK, [0, 2.8, 0]);
  for (let i = 0; i < 6; i++) glow(box([0.14, 0.1, 0.04], i % 2 ? "#ffb020" : "#fff0a0", [-0.55 + i * 0.22, 2.8, 0.105]), 1.4);
  bar([0.7, 2.7, -0.7], [0.7, 3.0, -0.7], 0.015, CHROME);
  box([0.06, 0.06, 0.06], "#d02020", [0.7, 3.04, -0.7]);
  // number and skull
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: chassis, at: [0, 2.69, 0.4], dir: [0, 1, 0], axis: "z", up: [0, 0, 1] }).mesh.visible = false;
  b.part(new THREE.PlaneGeometry(0.7, 0.64), "#ffffff", { bone: chassis, at: [0, 1.7, -2.405], dir: [0, 0, -1], axis: "z", texture: SKULL });

  // ---------------------------------------------------------------- bed
  box([1.76, 0.08, 1.4], "#1c1d24", [0, 1.33, -1.7]);
  for (const s of [1, -1]) box([0.08, 0.55, 1.4], BODY, [s * 0.84, 1.64, -1.7]);
  box([1.76, 0.55, 0.08], BODY, [0, 1.64, -2.36]);
  box([1.76, 0.06, 0.12], "#e8503a", [0, 1.94, -2.36]);
  for (const s of [1, -1]) {
    box([0.12, 0.06, 1.4], "#e8503a", [s * 0.84, 1.94, -1.7]);
    bar([s * 0.78, 1.37, -1.2], [s * 0.78, 2.55, -1.2], 0.045, CHROME);
    bar([s * 0.78, 2.55, -1.2], [s * 0.78, 1.94, -2.3], 0.04, CHROME);
    bar([s * 0.35, 1.35, -1.12], [s * 0.35, 3.0, -1.12], 0.07, CHROME);
    bar([s * 0.35, 3.0, -1.12], [s * 0.35, 3.18, -1.26], 0.07, CHROME);
    glow(b.spike([s * 0.35, 3.2, -1.27], [0, 1, -0.4], 0.2, 0.07, "#ff8a1e", { bone: chassis, sides: 6 }), 1.6);
    for (const y of [1.7, 2.2, 2.7]) cyl(0.09, 0.05, "#7a8294", [s * 0.35, y, -1.12], [0, 1, 0], 8);
  }
  bar([-0.78, 2.55, -1.2], [0.78, 2.55, -1.2], 0.045, CHROME);
  bar([-0.78, 1.94, -2.3], [0.78, 1.94, -2.3], 0.04, CHROME);
  box([0.5, 0.3, 0.35], "#2f6fd0", [-0.3, 1.52, -1.65]);
  box([0.52, 0.06, 0.37], "#e8e8e8", [-0.3, 1.69, -1.65]);
  box([0.12, 0.04, 0.05], DARK, [-0.3, 1.73, -1.65]);
  bar([-0.55, 1.37, -2.25], [-0.55, 3.3, -2.25], 0.02, CHROME);
  for (const sg of [1, -1])
    b.part(new THREE.PlaneGeometry(0.7, 0.46), "#ffffff", {
      bone: chassis,
      at: [-0.55 + sg * 0.004, 3.07, -2.25 - 0.36],
      dir: [sg, 0, 0],
      axis: "z",
      texture: CHECK,
    });
  bar([0.2, 2.7, -0.9], [0.2, 3.35, -1.0], 0.015, CHROME);

  // ---------------------------------------------------------------- doors
  for (const s of [1, -1]) {
    const door = b.joint(side(s), { parent: chassis, at: [s * 0.9, 1.3, 0.55], dir: [0, 1, 0], role: "hinge" });
    box([0.06, 0.66, 1.1], BODY, [s * 0.91, 1.65, 0], door);
    box([0.03, 0.05, 0.2], CHROME, [s * 0.95, 1.85, -0.35], door);
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: door, at: [s * 0.943, 1.55, 0.05], dir: [s, 0, 0], axis: "z", texture: NUM });
    bar([s * 0.93, 2.1, 0.45], [s * 1.12, 2.22, 0.5], 0.02, DARK, chassis);
    box([0.05, 0.2, 0.14], DARK, [s * 1.14, 2.22, 0.5]);
  }

  // ---------------------------------------------------------------- antenna
  bar([-0.7, 2.73, -0.8], [-0.7, 3.5, -0.9], 0.012, "#222");
  box([0.05, 0.05, 0.05], YELLOW, [-0.7, 3.52, -0.9]);

  return b.root;
}

function side(s: number) {
  return s > 0 ? "doorL" : "doorR";
}
