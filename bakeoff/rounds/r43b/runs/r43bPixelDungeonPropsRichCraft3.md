```ts
import * as THREE from "three";
import { createBuilder, frame, rng, bezier } from "agentic-3js-builder";
import { pixelArt, pixelTexture, tileBox, cellPaint, pick, bayer } from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon prop group: iron-banded treasure chest with coins, two standing flame torches, a barrel cluster (one open, one tipped), a skull, crossed femurs and ribcage, and a bloodstained spike trap.",
};

export default function build() {
  const b = createBuilder({ name: "dungeon_props" });
  const R = rng(5);
  const T = 0.02; // one texel in meters

  // ---------- palette ----------
  const IRON = "#3a3d48";
  const IRON2 = "#23252d";
  const GOLD = "#f2c230";
  const GOLD2 = "#c9951c";
  const STEEL = "#aeb6c4";
  const DARK = "#120d10";
  const BLOOD = "#5a1420";
  const WHITE = "#ffffff";

  const WOODR = ["#24130a", "#43260f", "#65401f", "#85592b", "#a6743b"];
  const BONER = ["#7d7358", "#a99f82", "#d3cbae", "#efe8cf"];
  const STONER = ["#2c2a33", "#4a4852", "#6a6772", "#8a8794"];

  const hash = (n: number) => {
    const s = Math.sin(n * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };

  // ---------- paints ----------
  const WOOD = cellPaint(
    T,
    (c) => {
      const row = c.axis === 1 ? c.u : c.v;
      const plank = Math.floor(row / 4);
      if (((row % 4) + 4) % 4 === 0) return WOODR[0];
      const v = 0.3 + 0.35 * hash(plank + 3) + 0.22 * c.random(1) + 0.12 * c.n.y;
      return c.pick(WOODR, v);
    },
    { dither: true },
  );
  const STAVE = cellPaint(
    T,
    (c) => {
      const stave = Math.floor(c.u / 3);
      if (((c.u % 3) + 3) % 3 === 0) return WOODR[0];
      const v = 0.3 + 0.35 * hash(stave + 9) + 0.2 * c.random(2) + 0.1 * c.n.y;
      return c.pick(WOODR, v);
    },
    { dither: true },
  );
  const BONE = cellPaint(
    0.012,
    (c) => c.pick(BONER, 0.45 + 0.3 * c.n.y + 0.25 * (c.random(4) - 0.5)),
    { dither: true },
  );

  // ---------- textures ----------
  const STONE = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 8);
      const bx = (x + (row % 2) * 8) % 16;
      if (y % 8 === 0 || bx === 0) return "#1c1a22";
      const hl = y % 8 === 1 || bx === 1;
      const v = 0.35 + 0.3 * R() + (hl ? 0.22 : 0) - (y % 8 === 7 ? 0.15 : 0);
      return pick(STONER, v, bayer(x, y));
    });
  });
  const PLANKS = pixelTexture(32, 30, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 6);
      if (y % 6 === 0) return WOODR[0];
      const v = 0.3 + 0.3 * hash(row) + 0.25 * R() + (x % 7 === 0 ? -0.1 : 0);
      return pick(WOODR, v, bayer(x, y));
    });
    g.stamp(2, 2, ["n"], { n: "#17181d" });
    g.stamp(29, 8, ["n"], { n: "#17181d" });
  });
  const FLAME = pixelArt(
    [
      "....r.....",
      "...rr.....",
      "...rrr.r..",
      "..rrorrrr.",
      "..rroorrr.",
      ".rrooyorr.",
      ".rrooyyorr",
      ".roooyyoor",
      ".rooyyyyor",
      ".rooyywyor",
      ".rooyywyor",
      "..ooyyyyo.",
      "...ooyyo..",
      "....oooo..",
    ],
    { r: "#e23a1a", o: "#ff8a1c", y: "#ffd23a", w: "#fff6c0" },
  );
  const KEYHOLE = pixelArt(
    ["yyyyyyy", "yoooooy", "yooKooy", "yooKooy", "yoKKKoy", "yooKooy", "yoooooy", "yyyyyyy"],
    { y: "#f7d860", o: "#d8a428", K: "#2a1a08" },
  );
  const SKULLF = pixelArt(
    [
      "..wwwwww..",
      ".wwwwwwww.",
      "wwwwwwwwww",
      "wkkkwwkkkw",
      "wkkkwwkkkw",
      "wwkkwwkkww",
      "wwwwkkwwww",
      "wwwwkkwwww",
      ".wwwwwwww.",
    ],
    { w: "#e8e0c4", k: "#1a1410" },
  );
  const TEETH = pixelArt(["wwwwwwww", "wkwkwkwk"], { w: "#e8e0c4", k: "#2a2218" });

  // ---------- helpers ----------
  type V = [number, number, number];
  const box = (size: V, at: V, color: any, rotY = 0) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: [0, rotY, 0] });
  const tbox = (size: V, at: V, tex: any, rotY = 0) =>
    b.part(tileBox(size, tex, T, { rand: R }), WHITE, { at, texture: tex, rotation: [0, rotY, 0] });
  const rot2 = (ox: number, oz: number, yaw: number) => {
    const t = (yaw * Math.PI) / 180;
    return [ox * Math.cos(t) + oz * Math.sin(t), -ox * Math.sin(t) + oz * Math.cos(t)];
  };

  // ================= CHEST =================
  const cx = 0;
  const cz = -0.3;
  box([0.99, 0.06, 0.64], [cx, 0.03, cz], WOOD);
  box([0.95, 0.4, 0.6], [cx, 0.23, cz], WOOD);
  const arch: [number, number][] = [
    [-0.3, 0],
    [0.3, 0],
    [0.3, 0.07],
    [0.22, 0.16],
    [0.1, 0.21],
    [-0.1, 0.21],
    [-0.22, 0.16],
    [-0.3, 0.07],
  ];
  b.extrude(arch, { at: [cx, 0.43, cz], x: [0, 0, 1], thickness: 0.97, color: WOOD });
  const strap: [number, number][] = [
    [-0.315, 0],
    [0.315, 0],
    [0.315, 0.075],
    [0.23, 0.17],
    [0.105, 0.222],
    [-0.105, 0.222],
    [-0.23, 0.17],
    [-0.315, 0.075],
  ];
  for (const s of [1, -1]) {
    b.extrude(strap, { at: [cx + s * 0.3, 0.43, cz], x: [0, 0, 1], thickness: 0.075, color: IRON });
    box([0.08, 0.4, 0.63], [cx + s * 0.3, 0.23, cz], IRON);
    for (const z of [-1, 1]) {
      box([0.11, 0.12, 0.11], [cx + s * 0.47, 0.08, cz + z * 0.29], IRON2);
      box([0.11, 0.1, 0.11], [cx + s * 0.47, 0.4, cz + z * 0.29], IRON2);
      // gold hinge on the lid back / rivets on front
    }
    for (const y of [0.12, 0.34]) box([0.03, 0.03, 0.012], [cx + s * 0.3, y, cz + 0.306], GOLD);
    box([0.05, 0.05, 0.03], [cx + s * 0.3, 0.52, cz + 0.2], GOLD2);
  }
  box([0.95, 0.04, 0.04], [cx, 0.44, cz + 0.3], IRON);
  b.part(new THREE.BoxGeometry(0.13, 0.15, 0.03), WHITE, { at: [cx, 0.4, cz + 0.315], texture: KEYHOLE });
  for (const s of [1, -1]) box([0.12, 0.08, 0.04], [cx + s * 0.18, 0.46, cz - 0.3], GOLD2);

  // coins in front of the chest
  const coin = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8);
  for (let i = 0; i < 5; i++)
    b.part(coin, i % 2 ? GOLD2 : GOLD, {
      at: [0.62 + (i % 2) * 0.01, 0.006 + i * 0.012, 0.28 + (i % 3) * 0.005],
      rotation: [0, i * 20, 0],
    });
  for (let i = 0; i < 6; i++)
    b.part(coin, i % 2 ? GOLD : GOLD2, {
      at: [0.2 + R() * 0.7, 0.006, 0.18 + R() * 0.3],
      rotation: [R() * 12, R() * 90, R() * 12],
    });

  // ================= TORCHES =================
  const torch = (x: number, z: number) => {
    tbox([0.34, 0.12, 0.34], [x, 0.06, z], STONE);
    tbox([0.2, 0.1, 0.2], [x, 0.17, z], STONE);
    box([0.07, 1.0, 0.07], [x, 0.72, z], IRON);
    for (const y of [0.45, 0.75, 1.05]) box([0.1, 0.03, 0.1], [x, y, z], IRON2);
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.14, 0.15],
        [0, 0.15],
      ],
      { at: [x, 1.2, z], segments: 8, color: IRON },
    );
    box([0.1, 0.26, 0.1], [x, 1.37, z], WOOD);
    box([0.11, 0.05, 0.11], [x, 1.5, z], "#1a1210");
    glow(box([0.08, 0.03, 0.08], [x, 1.525, z], "#ff9a2a"), 1.5);
    glow(
      b.cards([frame([x, 1.5, z], [0, 1, 0])], FLAME, { size: [0.3, 0.42], cross: true, sink: 0, flow: [0, 0, 1] }),
      1.3,
    );
    for (let i = 0; i < 5; i++)
      glow(box([0.02, 0.02, 0.02], [x + (R() - 0.5) * 0.3, 1.95 + R() * 0.25, z + (R() - 0.5) * 0.3], "#ffc040"), 1.4);
  };
  torch(1.2, -0.75);
  torch(-1.2, -0.75);

  // ================= BARRELS =================
  const PROFILE: [number, number][] = [
    [0, 0],
    [0.26, 0],
    [0.31, 0.2],
    [0.33, 0.45],
    [0.31, 0.7],
    [0.26, 0.9],
    [0, 0.9],
  ];
  const rad = (h: number) => {
    for (let i = 1; i < PROFILE.length; i++) {
      const [x0, y0] = PROFILE[i - 1];
      const [x1, y1] = PROFILE[i];
      if (h <= y1 && y1 > y0) return x0 + ((x1 - x0) * (h - y0)) / (y1 - y0);
    }
    return 0.26;
  };
  const barrel = (px: number, pz: number, tipped: boolean, yaw: number, open: boolean) => {
    const A = tipped
      ? new THREE.Vector3(Math.cos((yaw * Math.PI) / 180), 0, Math.sin((yaw * Math.PI) / 180))
      : new THREE.Vector3(0, 1, 0);
    const C = new THREE.Vector3(px, tipped ? 0.325 : 0.45, pz);
    const start = C.clone().addScaledVector(A, -0.45);
    const along = (h: number) => start.clone().addScaledVector(A, h).toArray() as V;
    b.lathe(PROFILE, { at: start.toArray() as V, axis: A.toArray() as V, segments: 10, color: STAVE });
    for (const h of [0.1, 0.3, 0.6, 0.8]) {
      const r = rad(h) * 1.06 + 0.01;
      b.part(new THREE.CylinderGeometry(r, r, 0.045, 10), IRON, { at: along(h), dir: A.toArray() as V });
    }
    if (open && !tipped) {
      b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.01, 10), "#1d3b44", { at: along(0.86), dir: A.toArray() as V });
    } else {
      const ends = tipped ? [0.903, -0.003] : [0.903];
      for (const h of ends)
        b.part(new THREE.CircleGeometry(0.255, 10), WHITE, {
          at: along(h),
          dir: (h > 0.5 ? A : A.clone().negate()).toArray() as V,
          axis: "z",
          texture: PLANKS,
        });
    }
  };
  barrel(-1.7, -0.2, false, 0, false);
  barrel(-2.2, 0.3, false, 0, true);
  barrel(-1.55, 0.58, false, 0, false);
  barrel(-2.35, -0.95, true, 20, false);

  // ================= BONES =================
  const bone = (a: V, c: V, r = 0.02) => {
    b.rod(a, c, r, { section: "box", color: BONE });
    const dx = c[0] - a[0];
    const dz = c[2] - a[2];
    const l = Math.hypot(dx, dz) || 1;
    const px = (-dz / l) * 0.018;
    const pz = (dx / l) * 0.018;
    for (const e of [a, c])
      for (const s of [1, -1]) box([0.034, 0.034, 0.034], [e[0] + s * px, e[1], e[2] + s * pz], BONE);
  };
  const bx = 0.35;
  const bz = 1.0;
  bone([bx - 0.3, 0.03, bz - 0.28], [bx + 0.3, 0.03, bz + 0.28]);
  bone([bx - 0.3, 0.07, bz + 0.28], [bx + 0.3, 0.07, bz - 0.28]);
  // skull
  {
    const yaw = 25;
    const y0 = 0.09;
    const place = (ox: number, oy: number, oz: number): V => {
      const [x, z] = rot2(ox, oz, yaw);
      return [bx + x, y0 + oy, bz + z];
    };
    box([0.2, 0.18, 0.2], place(0, 0.15, 0), BONE, yaw);
    box([0.14, 0.06, 0.1], place(0, 0.09, 0.12), BONE, yaw);
    box([0.14, 0.04, 0.12], place(0, 0.04, 0.1), BONE, yaw);
    b.part(new THREE.PlaneGeometry(0.2, 0.18), WHITE, { at: place(0, 0.15, 0.102), rotation: [0, yaw, 0], texture: SKULLF });
    b.part(new THREE.PlaneGeometry(0.14, 0.035), WHITE, { at: place(0, 0.078, 0.172), rotation: [0, yaw, 0], texture: TEETH });
  }
  // ribcage lying on its side
  {
    const rx = -0.7;
    const rz = 1.1;
    b.rod([rx - 0.35, 0.03, rz], [rx + 0.35, 0.03, rz], 0.02, { section: "box", color: BONE });
    for (let i = 0; i < 7; i++) {
      const x = rx - 0.3 + i * 0.1;
      const k = 1 - Math.abs(i - 3) * 0.12;
      for (const s of [1, -1])
        b.sweep(
          bezier([x, 0.03, rz], [x, 0.22 * k, rz + s * 0.1 * k], [x, 0.04, rz + s * 0.24 * k]),
          0.014,
          { section: "box", color: BONE, caps: "flat" },
        );
    }
  }
  // stray bones
  for (let i = 0; i < 4; i++) {
    const x = -0.2 + R() * 1.2;
    const z = 1.3 + R() * 0.3;
    const a = R() * 3;
    bone([x, 0.02, z], [x + Math.cos(a) * 0.16, 0.02, z + Math.sin(a) * 0.16], 0.014);
  }

  // ================= SPIKE TRAP =================
  const tx = 1.95;
  const tz = 0.45;
  tbox([1.1, 0.1, 1.1], [tx, 0.05, tz], STONE);
  for (const s of [1, -1]) {
    tbox([1.1, 0.05, 0.1], [tx, 0.125, tz + s * 0.5], STONE);
    tbox([0.1, 0.05, 0.9], [tx + s * 0.5, 0.125, tz], STONE);
  }
  box([0.2, 0.004, 0.16], [tx - 0.3, 0.102, tz + 0.4], BLOOD);
  box([0.14, 0.004, 0.22], [tx + 0.32, 0.102, tz - 0.38], BLOOD);
  let k = 0;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      const px = tx + i * 0.28;
      const pz = tz + j * 0.28;
      box([0.14, 0.012, 0.14], [px, 0.106, pz], DARK);
      k++;
      if (k % 4 === 0) continue; // a retracted spike
      const h = 0.22 + 0.1 * hash(k);
      b.part(new THREE.ConeGeometry(0.045, h, 4), STEEL, { at: [px, 0.1 + h / 2 - 0.01, pz], rotation: [0, 45, 0] });
      if (k % 3 === 0)
        b.part(new THREE.ConeGeometry(0.022, h * 0.35, 4), BLOOD, {
          at: [px, 0.1 + h * 0.82 - 0.01, pz],
          rotation: [0, 45, 0],
        });
    }
  // a lone victim femur against the trap
  bone([tx - 0.75, 0.03, tz - 0.45], [tx - 0.95, 0.03, tz + 0.05], 0.018);

  return b.root;
}
```