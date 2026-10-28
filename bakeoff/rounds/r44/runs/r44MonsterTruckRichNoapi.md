```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cellPaint, pixelArt, pixelTexture, pick, bayer } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Pixel Monster Truck",
  description: "Blocky pixel-art monster truck on huge lifted tyres with flame paint, light bar, grille and shocks.",
};

const TEXEL = 0.06;
const RED = ["#5c0f14", "#9a1620", "#d9261c", "#ff5a3a"];
const FLAME = ["#c2410c", "#ff8a1c", "#ffd23a"];
const BLACK = "#15131a";
const STEEL = "#8a93a6";
const STEEL_D = "#4b5263";
const CHROME = "#dfe6f2";
const YELLOW = "#ffd23a";

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 1024 });
  const chassis = b.joint("chassis", { at: [0, 1.3, 0], dir: [0, 0, 1], role: "spine" });

  const box = (w: number, h: number, d: number, color: any, at: [number, number, number], name: string, bone: any = chassis) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, name });

  // ---- paints
  const bodyPaint = cellPaint(
    TEXEL,
    (c) => {
      const y = c.at.y;
      const base = 0.25 + 0.55 * Math.max(0, c.n.y) + 0.2 * c.n.z * 0.5 + 0.2;
      // flames licking back along the lower body
      const tongue = 0.35 + 0.28 * Math.abs(((c.at.z * 1.4) % 1) * 2 - 1) + 0.12 * Math.sin(c.at.z * 5);
      const fy = y - 1.55;
      if (Math.abs(c.n.y) < 0.7 && fy < tongue * 1.25 && c.axis !== 1) {
        return pick(FLAME, 1 - fy / (tongue * 1.25) * 1.0, bayer(c.u, c.v));
      }
      if (c.random(3) < 0.03) return RED[3];
      return c.pick(RED, base);
    },
    { dither: true },
  );
  const tirePaint = cellPaint(0.05, (c) => (c.random(1) < 0.12 ? "#2a2832" : c.pick(["#0c0b10", "#1a1920", "#26252e"], 0.4 + 0.3 * c.n.y + 0.2 * c.random(2))));
  const mud = cellPaint(0.06, (c) => c.pick(["#3b2614", "#5a3a1e", "#7a5430"], c.random(4) * 0.5 + 0.3 + 0.2 * c.n.y));

  // ---- textures
  const GRILLE = pixelArt(
    [
      "kkkkkkkkkkkkkkkk",
      "kcccccccccccccck",
      "kdkdkdkdkdkdkdkk",
      "kcccccccccccccck",
      "kdkdkdkdkdkdkdkk",
      "kcccccccccccccck",
      "kdkdkdkdkdkdkdkk",
      "kkkkkkkkkkkkkkkk",
    ],
    { k: "#15131a", c: "#dfe6f2", d: "#4b5263" },
  );
  const GLASS = pixelTexture(16, 10, (g) => {
    g.fill((x, y) => pick(["#12304f", "#1d5a86", "#3a8cc0"], 1 - y / 10 + 0.1, bayer(x, y)));
    for (let i = 0; i < 4; i++) {
      g.set(10 + i, 1 + i * 2 > 9 ? 9 : 1 + i * 2, "#d6f2ff");
      g.set(11 + i, 1 + i * 2 > 9 ? 9 : 1 + i * 2, "#d6f2ff");
    }
    for (let x = 0; x < 16; x++) {
      g.set(x, 0, "#15131a");
      g.set(x, 9, "#15131a");
    }
    for (let y = 0; y < 10; y++) {
      g.set(0, y, "#15131a");
      g.set(15, y, "#15131a");
    }
  });
  const NUMBER = pixelArt(
    [
      "wwwwwwww",
      "wkkkkkkw",
      "wwwwwkkw",
      "wwwwkkww",
      "wwwkkwww",
      "wwkkwwww",
      "wwkkwwww",
      "wwwwwwww",
    ],
    { w: "#fff3d0", k: "#15131a" },
  );
  const SKULL = pixelArt(
    [
      "..wwwwww..",
      ".wwwwwwww.",
      "wwkkwwkkww",
      "wwkkwwkkww",
      "wwwwkkwwww",
      ".wwwwwwww.",
      "..wkwkwk..",
      "..wwwwww..",
    ],
    { w: "#fff3d0", k: "#15131a" },
  );
  const HEAD = pixelArt(["yyyyyy", "ywwwwy", "ywwwwy", "yyyyyy"], { y: "#ffe9a0", w: "#fffbe8" });
  const TAIL = pixelArt(["rrrrr", "rRRRr", "rrrrr"], { r: "#8a0f18", R: "#ff3a3a" });

  // ---- chassis rails, axles, shocks
  for (const s of [1, -1]) {
    box(0.22, 0.3, 5.0, STEEL_D, [s * 0.62, 0, 0], "rail");
    box(0.2, 0.08, 4.9, "#2a2e3a", [s * 0.62, -0.19, 0], "railLip");
  }
  for (const z of [-1.7, 1.7]) {
    box(0.3, 0.3, 0.3, "#2a2e3a", [0, 0, z + (z > 0 ? 0.6 : -0.6)], "cross");
    b.part(new THREE.BoxGeometry(2.5, 0.22, 0.26), STEEL_D, { bone: chassis, at: [0, -0.45, z], name: "axle" });
    b.part(new THREE.SphereGeometry(0.28, 6, 4), STEEL, { bone: chassis, at: [0, -0.45, z], name: "diff" });
    for (const s of [1, -1]) {
      // coil-over shock
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.75, 6), YELLOW, { bone: chassis, at: [s * 0.85, -0.05, z - 0.25], name: "shock" });
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.95, 6), CHROME, { bone: chassis, at: [s * 0.85, -0.05, z - 0.25], name: "shockRod" });
      // leaf spring stack
      for (let k = 0; k < 3; k++) box(0.14, 0.05, 1.4 - k * 0.3, STEEL_D, [s * 0.5, -0.36 + k * 0.05, z], "leaf");
      box(0.08, 0.5, 0.08, STEEL, [s * 0.5, -0.3, z - 0.5], "ubolt");
    }
  }
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 6), STEEL_D, { bone: chassis, at: [0, -0.4, 0], dir: [0, 0, 1], name: "driveshaft" });
  // mud on underside
  box(1.4, 0.18, 1.8, mud, [0, -0.2, -0.3], "skid");

  // ---- wheels
  const R = 0.85, W = 0.72;
  const wheelNames: Record<string, [number, number]> = { FL: [1, 1.7], FR: [-1, 1.7], RL: [1, -1.7], RR: [-1, -1.7] };
  for (const [id, [s, z]] of Object.entries(wheelNames)) {
    const c: [number, number, number] = [s * 1.28, R, z];
    const wj = b.joint(`wheel${id}`, { parent: chassis, at: c, dir: [s, 0, 0], role: "hinge" });
    b.part(new THREE.CylinderGeometry(0.8, 0.8, W, 14), tirePaint, { bone: wj, at: c, dir: [1, 0, 0], name: `tire${id}` });
    const blocks: THREE.BufferGeometry[] = [];
    const N = 14;
    for (let i = 0; i < N; i++) {
      for (const row of [-1, 1]) {
        const th = ((i + (row > 0 ? 0.5 : 0)) * 2 * Math.PI) / N;
        const g = new THREE.BoxGeometry(0.34, 0.1, 0.34);
        g.translate(row * 0.18, 0.8, 0);
        g.rotateX(th);
        blocks.push(g);
      }
    }
    b.part(mergeGeometries(blocks)!, "#0a0910", { bone: wj, at: c, name: `tread${id}` });
    // hub, rim, lug nuts
    b.part(new THREE.CylinderGeometry(0.42, 0.42, W + 0.04, 10), STEEL, { bone: wj, at: c, dir: [1, 0, 0], name: `rim${id}` });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, W + 0.1, 8), YELLOW, { bone: wj, at: c, dir: [1, 0, 0], name: `hubcap${id}` });
    const lugs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      lugs.push(new THREE.BoxGeometry(0.08, 0.08, 0.08).translate(s * (W / 2 + 0.07), Math.cos(a) * 0.36, Math.sin(a) * 0.36));
    }
    b.part(mergeGeometries(lugs)!, CHROME, { bone: wj, at: c, name: `lugs${id}` });
  }

  // ---- body
  // hood
  b.part(new THREE.BoxGeometry(1.9, 0.65, 1.7), bodyPaint, { bone: chassis, at: [0, 0.62, 1.65], name: "hood" });
  box(0.7, 0.2, 0.7, "#2a2e3a", [0, 1.04, 1.5], "scoop");
  box(0.5, 0.06, 0.12, BLACK, [0, 1.16, 1.78], "scoopMouth");
  // cab
  b.part(new THREE.BoxGeometry(2.0, 1.2, 1.9), bodyPaint, { bone: chassis, at: [0, 1.0, -0.1], name: "cab" });
  b.part(new THREE.BoxGeometry(1.8, 0.14, 1.7), bodyPaint, { bone: chassis, at: [0, 1.67, -0.1], name: "roof" });
  // bed
  b.part(new THREE.BoxGeometry(2.0, 0.55, 2.0), bodyPaint, { bone: chassis, at: [0, 0.4, -2.0], name: "bed" });
  box(1.6, 0.1, 1.7, "#2a2e3a", [0, 0.7, -2.0], "bedFloor");
  // roll bar
  for (const s of [1, -1]) box(0.08, 0.5, 0.08, CHROME, [s * 0.7, 1.0, -2.6], "rollPost");
  box(1.5, 0.08, 0.08, CHROME, [0, 1.25, -2.6], "rollBar");
  // fender flares
  for (const [id, [s, z]] of Object.entries(wheelNames)) {
    b.part(new THREE.BoxGeometry(0.5, 0.14, 1.5), bodyPaint, { bone: chassis, at: [s * 1.18, 0.62, z], name: `flare${id}` });
    box(0.1, 0.5, 1.3, "#2a2e3a", [s * 1.0, 0.45, z], `flareInner${id}`);
  }
  // front & rear bumpers
  box(2.3, 0.3, 0.22, CHROME, [0, -0.1, 2.62], "bumperF");
  box(2.0, 0.22, 0.2, STEEL_D, [0, -0.05, 2.62 + 0.0], "bumperCore");
  box(2.0, 0.3, 0.2, CHROME, [0, 0.0, -3.1], "bumperR");
  for (const s of [1, -1]) box(0.14, 0.45, 0.14, STEEL, [s * 1.0, 0.0, 2.7], "bullbar");
  // grille & headlights
  b.part(new THREE.PlaneGeometry(1.1, 0.55), "#ffffff", { bone: chassis, at: [0, 0.55, 2.505], dir: [0, 0, 1], axis: "z", texture: GRILLE, name: "grille" });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(0.38, 0.25), "#ffffff", { bone: chassis, at: [s * 0.7, 0.62, 2.508], dir: [0, 0, 1], axis: "z", texture: HEAD, name: "headlight" }), 1.6);
    glow(b.part(new THREE.PlaneGeometry(0.26, 0.2), "#ffffff", { bone: chassis, at: [s * 0.8, 0.6, -3.01], dir: [0, 0, -1], axis: "z", texture: TAIL, name: "taillight" }), 1.2);
  }
  // windows
  b.part(new THREE.PlaneGeometry(1.7, 0.85), "#ffffff", { bone: chassis, at: [0, 1.12, 0.862], dir: [0, 0, 1], axis: "z", texture: GLASS, name: "windshield" });
  b.part(new THREE.PlaneGeometry(1.5, 0.7), "#ffffff", { bone: chassis, at: [0, 1.12, -1.06], dir: [0, 0, -1], axis: "z", texture: GLASS, name: "rearGlass" });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.45, 0.7), "#ffffff", { bone: chassis, at: [s * 1.006, 1.12, -0.1], dir: [s, 0, 0], axis: "z", texture: GLASS, name: "sideWindow" });
    b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", { bone: chassis, at: [s * 1.006, 0.55, -0.1], dir: [s, 0, 0], axis: "z", texture: NUMBER, name: "number" });
    b.part(new THREE.PlaneGeometry(0.6, 0.48), "#ffffff", { bone: chassis, at: [s * 1.006, 0.5, -2.0], dir: [s, 0, 0], axis: "z", texture: SKULL, name: "skull" });
    box(0.22, 0.2, 0.14, BLACK, [s * 1.1, 1.1, 0.8], "mirror");
    box(0.06, 0.06, 0.3, STEEL_D, [s * 1.0, 1.1, 0.8], "mirrorArm");
    box(0.1, 0.1, 0.5, CHROME, [s * 1.05, 0.2, -0.1], "step");
    box(0.06, 0.18, 0.06, CHROME, [s * 1.03, 0.9, -0.4], "handle");
  }
  box(1.8, 0.1, 0.3, BLACK, [0, 1.6 + 0.0, 0.85], "visor");
  // light bar
  box(1.7, 0.16, 0.2, BLACK, [0, 1.84, 0.5], "lightBarBase");
  for (let i = 0; i < 6; i++) glow(box(0.24, 0.12, 0.08, i % 2 ? "#fff3b0" : "#ffd23a", [-0.65 + i * 0.26, 1.86, 0.62], "roofLamp"), 1.8);
  // exhaust stacks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 1.3, 6), CHROME, { bone: chassis, at: [s * 0.45, 1.3, 0.95], name: "stack" });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 6), BLACK, { bone: chassis, at: [s * 0.45, 1.96, 0.95], name: "stackTop" });
  }
  // antenna
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), BLACK, { bone: chassis, at: [-0.85, 2.15, -0.9], name: "antenna" });
  box(0.08, 0.08, 0.08, "#ff3a3a", [-0.85, 2.78, -0.9], "antennaTip");

  return b.root;
}
```