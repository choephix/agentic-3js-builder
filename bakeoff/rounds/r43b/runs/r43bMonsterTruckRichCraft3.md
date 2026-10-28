```ts
import * as THREE from "three";
import { createBuilder, line, rng } from "agentic-3js-builder";
import { pixelTexture, cellPaint, pick } from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Monster Truck",
  description: "Pixel-art monster truck with huge lugged tyres, flame paint job, blower, light bar and chrome stacks.",
};

const TEXEL = 0.06;
const R_TIRE = 0.8; // tyre core radius; lugs add ~0.07
const TIRE_W = 0.9;
const WX = 1.45; // wheel centre x
const WY = 0.86;
const WZ = 1.5;

// shaded pixel paint: a ramp picked by the surface normal with a little per-cell jitter
function shade(cols: string[], size = TEXEL, jitter = 0.12, seed = 1) {
  return cellPaint(
    size,
    (c) => c.pick(cols, 0.5 + 0.38 * c.n.y + 0.12 * c.n.z + jitter * (c.random(seed) - 0.5)),
    { dither: true },
  );
}

const RUBBER = shade(["#0c0c10", "#17171d", "#25252e", "#34343f"], 0.05, 0.3, 3);
const LUG = shade(["#07070a", "#111116", "#1d1d25", "#2c2c36"], 0.05, 0.25, 4);
const BODY = cellPaint(
  TEXEL,
  (c) => {
    if (c.at.y < 1.5) return c.pick(["#1a1a22", "#2a2a35", "#3c3c4a"], 0.5 + 0.4 * c.n.y);
    return c.pick(["#7a0f12", "#b3161b", "#df2a25", "#ff5a43"], 0.45 + 0.4 * c.n.y + 0.12 * c.n.z + 0.1 * (c.random(2) - 0.5));
  },
  { dither: true },
);
const BODY_DARK = shade(["#4a0a0d", "#7a0f12", "#a3151a"], TEXEL, 0.1, 5);
const CHROME = shade(["#4b5568", "#8a95a8", "#cfd8e6", "#ffffff"], 0.04, 0.2, 6);
const FRAME = shade(["#15171e", "#232734", "#353b4c", "#4a526a"], TEXEL, 0.2, 7);
const YELLOW = shade(["#a87a00", "#e0a800", "#ffd31a", "#fff08a"], 0.04, 0.1, 8);
const BLACK = shade(["#050507", "#0d0d12", "#181820"], TEXEL, 0.1, 9);
const GOLD = shade(["#8a6a14", "#c9a021", "#f2cf4a", "#fff0a0"], 0.03, 0.1, 10);

// ---------- textures ----------
const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

const SIDEWALL = pixelTexture(32, 32, (g) => {
  const bolts: [number, number][] = [];
  for (let i = 0; i < 6; i++) bolts.push([16 + 6.5 * Math.sin((i * Math.PI) / 3), 16 + 6.5 * Math.cos((i * Math.PI) / 3)]);
  g.fill((x, y) => {
    const dx = x + 0.5 - 16;
    const dy = y + 0.5 - 16;
    const d = Math.hypot(dx, dy);
    if (d > 16) return "";
    if (d < 2.8) return "#f2cf4a";
    if (bolts.some(([bx, by]) => Math.hypot(x + 0.5 - bx, y + 0.5 - by) < 1.3)) return "#e8eef7";
    if (d < 4.2) return "#6a7488";
    if (d < 9.6) return (dx + dy) % 7 < 2 ? "#dfe6f2" : "#9aa5b8";
    if (d < 10.6) return "#cfd8e6";
    if (d < 11.4) return "#2a2a34";
    if (d < 12.4) return Math.floor(Math.atan2(dy, dx) * 6) % 2 === 0 ? "#f0f0f0" : "#2a2a34";
    if (d < 14.2) return "#1f1f27";
    return d < 15 ? "#14141a" : "#0b0b0f";
  });
});

function flameTex(flip: boolean) {
  const W = 56;
  const H = 16;
  return pixelTexture(W, H, (g) => {
    g.fill((x, y) => {
      const xx = flip ? W - 1 - x : x;
      const tip = 12 + 40 * tri(y * 0.09 + 0.15) * (1 - 0.15 * Math.abs(y - 8) / 8);
      const env = 8 * (1 - xx / 66);
      if (xx >= tip || Math.abs(y - 7.5) > env + 1) return "";
      if (xx >= tip - 1.5 || Math.abs(y - 7.5) > env) return "#3a0800";
      const r = xx / tip;
      return r < 0.45 ? "#ff7a10" : r < 0.8 ? "#ffc21a" : "#fff58a";
    });
  });
}
const FLAME_L = flameTex(false);
const FLAME_R = flameTex(true);

function windowTex(w: number, h: number, pillar: number) {
  return pixelTexture(w, h, (g) => {
    g.fill((x, y) => {
      if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) return "#12151c";
      if (pillar && Math.abs(x - pillar) < 1.5) return "#12151c";
      if ((x + y) % 9 === 0 || (x + y) % 9 === 1) return "#d6f2ff";
      return y < h / 2 ? "#4aa8e6" : "#2f7fc4";
    });
  });
}
const WIND = windowTex(32, 12, 0);
const SIDEWIN = windowTex(26, 12, 15);

const GRILLE = pixelTexture(24, 10, (g) => {
  g.fill((x, y) => {
    if (x < 1 || y < 1 || x >= 23 || y >= 9) return "#cfd8e6";
    if (Math.abs(x - 11.5) < 2.5 && Math.abs(y - 4.5) < 2) return "#df2a25";
    return y % 2 === 0 ? "#aab4c6" : "#14161c";
  });
});

const HEADLIGHT = pixelTexture(8, 8, (g) => {
  g.fill((x, y) => {
    const d = Math.hypot(x - 3.5, y - 3.5);
    if (d > 4) return "";
    return d < 1.7 ? "#ffffff" : d < 3 ? "#fff3a0" : "#8a95a8";
  });
});

const SKULL = pixelTexture(10, 10, (g) => {
  g.stamp(0, 0, [
    "..wwwwww..",
    ".wwwwwwww.",
    "wwwwwwwwww",
    "wkkwwwwkkw",
    "wkkwwwwkkw",
    "wwwwkkwwww",
    ".wwwkkwww.",
    ".wwwwwwww.",
    "..wkwkwk..",
    "..wkwkwk..",
  ], { w: "#f4f0e0", k: "#15151c" });
});

// ---------- build ----------
export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });
  const R = rng(11);
  const chassis = b.joint("chassis", { at: [0, 1.2, 0], dir: [0, 0, 1] });

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at, ...opts });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex });
  const rodC = (a: number[], c: number[], r: number, color: any) => b.rod(a, c, r, color, { bone: chassis, sides: 8 } as any);

  // ---- wheels ----
  const lugGeo = new THREE.BoxGeometry(0.2, 0.14, 0.42);
  for (const s of [1, -1]) {
    for (const f of [1, -1]) {
      const name = `wheel${f > 0 ? "F" : "R"}${s > 0 ? "L" : "R"}`;
      const cx = s * WX;
      const cz = f * WZ;
      const wj = b.joint(name, { parent: chassis, at: [cx, WY, cz], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(R_TIRE, R_TIRE, TIRE_W, 16), RUBBER, {
        bone: wj, at: [cx, WY, cz], dir: [1, 0, 0],
      });
      for (const [off, start] of [[-0.225, 0], [0.225, 11.25]] as [number, number][]) {
        b.ring(
          line([cx + off, WY, cz], [cx + off + 1, WY, cz]),
          { count: 16, radius: R_TIRE, fromDeg: start, toDeg: start + 337.5 },
          (it) => b.stick(lugGeo, LUG, it, { embed: 0.5, bone: wj }),
        );
      }
      for (const o of [1, -1]) {
        const x = cx + s * o * (TIRE_W / 2 + 0.004);
        b.part(new THREE.CircleGeometry(0.8, 24), "#ffffff", {
          bone: wj, at: [x, WY, cz], dir: [s * o, 0, 0], axis: "z", texture: SIDEWALL,
        });
      }
      b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.1, 8), GOLD, {
        bone: wj, at: [cx + s * (TIRE_W / 2 + 0.05), WY, cz], dir: [s, 0, 0],
      });
    }
  }

  // ---- axles, diffs, suspension ----
  for (const f of [1, -1]) {
    const z = f * WZ;
    box(2.9, 0.24, 0.24, FRAME, [0, WY, z]);
    box(0.55, 0.5, 0.5, CHROME, [0, WY, z + f * 0.02]);
    box(0.7, 0.14, 0.14, FRAME, [0, WY + 0.3, z]);
    for (const s of [1, -1]) {
      const lo = [s * 0.8, WY + 0.1, z];
      const hi = [s * 0.62, 1.6, z];
      rodC(lo, hi, 0.05, CHROME);
      const n = 6;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.045, 8), YELLOW, {
          bone: chassis,
          at: [lo[0] + (hi[0] - lo[0]) * t, lo[1] + (hi[1] - lo[1]) * t, z],
          dir: [hi[0] - lo[0], hi[1] - lo[1], 0],
        });
      }
      box(0.22, 0.1, 0.22, FRAME, [s * 0.8, WY + 0.05, z]);
      rodC([s * 0.4, WY, z], [s * 0.55, 1.1, z - f * 0.9], 0.04, FRAME);
      rodC([s * 0.4, WY + 0.12, z], [s * 0.55, 1.15, z - f * 1.1], 0.035, CHROME);
    }
  }
  for (const s of [1, -1]) box(0.18, 0.28, 4.6, FRAME, [s * 0.55, 1.1, 0]);
  for (const z of [-1.8, -0.6, 0.6, 1.8]) box(1.28, 0.16, 0.16, FRAME, [0, 1.1, z]);
  rodC([0, 0.98, -1.5], [0, 0.98, 1.5], 0.06, CHROME);
  box(0.5, 0.35, 0.8, FRAME, [0, 1.0, 0]);

  // ---- body ----
  box(2.0, 0.7, 4.4, BODY, [0, 1.75, 0]);
  box(2.02, 0.12, 4.42, BLACK, [0, 1.46, 0]);
  box(2.0, 0.3, 1.7, BODY, [0, 2.25, 1.35]);
  box(1.8, 1.0, 1.7, BODY, [0, 2.6, -0.35]);
  box(2.0, 0.12, 1.9, BODY_DARK, [0, 3.16, -0.35]);
  // bed
  box(1.76, 0.04, 0.95, BLACK, [0, 2.12, -1.72]);
  for (const s of [1, -1]) box(0.12, 0.42, 1.0, BODY, [s * 0.94, 2.3, -1.7]);
  box(2.0, 0.42, 0.12, BODY, [0, 2.3, -2.14]);
  // fenders
  for (const s of [1, -1])
    for (const f of [1, -1]) {
      box(0.95, 0.1, 1.7, BODY_DARK, [s * 1.475, 2.0, f * WZ]);
      box(0.1, 0.34, 1.7, BODY, [s * 1.95, 1.85, f * WZ]);
      box(0.1, 0.3, 0.1, BLACK, [s * 1.95, 1.7, f * WZ + 0.9]);
      box(0.1, 0.3, 0.1, BLACK, [s * 1.95, 1.7, f * WZ - 0.9]);
    }
  // bumpers
  for (const f of [1, -1]) {
    box(2.2, 0.3, 0.25, CHROME, [0, 1.55, f * 2.34]);
    for (const s of [1, -1]) box(0.2, 0.2, 0.3, FRAME, [s * 0.8, 1.55, f * 2.2]);
  }
  rodC([-0.9, 1.7, 2.4], [-0.9, 2.2, 2.4], 0.05, CHROME);
  rodC([0.9, 1.7, 2.4], [0.9, 2.2, 2.4], 0.05, CHROME);
  rodC([-0.9, 2.2, 2.4], [0.9, 2.2, 2.4], 0.05, CHROME);

  // face + lights
  plane(1.0, 0.5, GRILLE, [0, 1.82, 2.206], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(plane(0.4, 0.4, HEADLIGHT, [s * 0.72, 1.85, 2.208], [0, 0, 1]), 1.4);
    glow(box(0.34, 0.2, 0.04, "#ff2a1a", [s * 0.76, 1.9, -2.215]), 1.2);
    plane(0.1, 0.1, HEADLIGHT, [s * 0.72, 2.25, 2.206], [0, 0, 1]);
  }
  // windows
  plane(1.55, 0.62, WIND, [0, 2.72, 0.505], [0, 0, 1]);
  plane(1.55, 0.62, WIND, [0, 2.72, -1.205], [0, 0, -1]);
  for (const s of [1, -1]) plane(1.4, 0.65, SIDEWIN, [s * 0.905, 2.72, -0.35], [s, 0, 0]);
  // decals
  plane(2.45, 0.7, FLAME_L, [1.005, 1.75, 0.9], [1, 0, 0]);
  plane(2.45, 0.7, FLAME_R, [-1.005, 1.75, 0.9], [-1, 0, 0]);
  for (const s of [1, -1]) plane(0.5, 0.5, SKULL, [s * 1.005, 1.8, -1.55], [s, 0, 0]);
  plane(0.6, 0.6, SKULL, [0, 2.3, -2.205], [0, 0, -1]);

  // hood blower
  box(0.6, 0.3, 0.7, CHROME, [0, 2.55, 1.2]);
  box(0.46, 0.06, 0.5, BLACK, [0, 2.73, 1.2]);
  for (const s of [1, -1]) box(0.08, 0.12, 0.5, CHROME, [s * 0.34, 2.5, 1.2]);
  for (const i of [-1, 0, 1]) b.spike([i * 0.15, 2.74, 1.2], [0, 1, 0], 0.18, 0.05, { color: CHROME, bone: chassis } as any);

  // light bar
  box(1.5, 0.14, 0.2, BLACK, [0, 3.29, 0.2]);
  for (const s of [1, -1]) rodC([s * 0.6, 3.22, 0.2], [s * 0.6, 3.29, 0.2], 0.05, FRAME);
  for (let i = -2; i <= 2; i++) glow(box(0.2, 0.1, 0.04, "#ffe24a", [i * 0.29, 3.29, 0.31]), 1.5);

  // stacks and roll hoop
  for (const s of [1, -1]) {
    rodC([s * 0.8, 2.1, -1.42], [s * 0.8, 3.5, -1.42], 0.08, CHROME);
    b.part(new THREE.ConeGeometry(0.12, 0.3, 6), "#ff8a10", { bone: chassis, at: [s * 0.8, 3.65, -1.42] });
    glow(b.part(new THREE.ConeGeometry(0.07, 0.22, 6), "#ffe14a", { bone: chassis, at: [s * 0.8, 3.65, -1.42] }), 1.4);
    box(0.14, 0.14, 0.14, CHROME, [s * 0.8, 3.55, -1.42]);
    rodC([s * 0.8, 2.1, -1.95], [s * 0.8, 3.05, -1.95], 0.045, CHROME);
    // mirrors
    rodC([s * 0.95, 2.7, 0.35], [s * 1.08, 2.85, 0.42], 0.03, BLACK);
    box(0.08, 0.26, 0.14, BLACK, [s * 1.12, 2.85, 0.42]);
  }
  rodC([-0.8, 3.05, -1.95], [0.8, 3.05, -1.95], 0.045, CHROME);

  // antenna with flag
  rodC([0.8, 3.22, -1.1], [0.8, 3.9, -1.1], 0.015, BLACK);
  box(0.02, 0.2, 0.36, YELLOW, [0.8, 3.8, -1.3]);

  // mud splatter specks on lower body
  const skin = b.surface(b.root);
  void skin;
  void R;
  void pick;

  return b.root;
}
```