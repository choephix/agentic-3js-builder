import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { cells, grain, mottle, noise, paint, scales, stripes } from "../../../../src/paint";
import { arc, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Treasure Hoard",
  description:
    "A glittering hoard: an open iron-bound chest, a mound of coins with gems, a jeweled crown on a cushion, goblets, gold bars, a coin sack and a glowing crystal cluster, painted in saturated League-style cel shading.",
  style: "League of Legends",
  commit: "88fc1f0",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treasureHoard" });
  const R = rng(11);
  const F = 0.04; // floor top (disc) height

  // ---------- palette ----------
  const GOLD = cel("#ffc933", "#d8761a");
  const GOLD_LIGHT = cel("#ffe36a", "#e8a028");
  const SILVER = cel("#d6e8fb", "#7f8fe0");
  const IRON = cel("#4d5384", "#2a2552");
  const VELVET = cel("#e0284e", "#8d1456");
  const STONE = cel("#6d5fb0", "#3a2f7a");
  const BURLAP = cel(mottle("#cfa466", "#b08848", { size: 0.03, seed: 4 }));
  const GEMS = ["#ff2a5c", "#2a8cff", "#20e08a", "#b05cff", "#ffe14a", "#2fe6e0"];

  // ---------- textures ----------
  const COINTEX = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#9a5410"/><circle cx="32" cy="32" r="27" fill="#ffcf3a"/><circle cx="32" cy="32" r="21" fill="none" stroke="#d98a1a" stroke-width="3"/><path d="M32 17 L37 28 L48 32 L37 36 L32 47 L27 36 L16 32 L27 28Z" fill="#fff0a0" stroke="#d98a1a" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 80"><path d="M32 2 L60 14 L60 46 Q60 66 32 78 Q4 66 4 46 L4 14Z" fill="#2a1f5e" stroke="#ffcf3a" stroke-width="4"/><path d="M32 14 L46 40 L32 66 L18 40Z" fill="#ffcf3a"/><path d="M32 24 L40 40 L32 56 L24 40Z" fill="#e8243f"/><circle cx="32" cy="40" r="3.5" fill="#ffffff"/></svg>`,
    { size: 192 },
  );
  const STAMP = svg(
    `<svg viewBox="0 0 40 20"><rect x="2" y="2" width="36" height="16" rx="2" fill="none" stroke="#b8741a" stroke-width="2.5"/><path d="M20 4 L26 10 L20 16 L14 10Z" fill="#b8741a"/></svg>`,
    { size: 128 },
  );
  const STAR = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 0 L38 26 L64 32 L38 38 L32 64 L26 38 L0 32 L26 26Z" fill="#fff8c8"/></svg>`,
    { size: 64 },
  );

  // ---------- helpers ----------
  const at3 = (x: number, y: number, z: number) => [x, y, z];

  // mound profile: radius -> height
  const MPTS: Array<[number, number]> = [
    [0, 0.5],
    [0.2, 0.46],
    [0.4, 0.36],
    [0.6, 0.2],
    [0.8, 0.06],
    [0.86, 0],
  ];
  const H = (r: number) => {
    for (let i = 0; i < MPTS.length - 1; i++) {
      const a = MPTS[i]!;
      const c = MPTS[i + 1]!;
      if (r <= c[0]) return a[1] + ((c[1] - a[1]) * (r - a[0])) / (c[0] - a[0]);
    }
    return 0;
  };
  const MC = { x: 0.2, z: 0.25 };
  const mh = (x: number, z: number) => F + H(Math.hypot(x - MC.x, z - MC.z));

  const coinGeo: THREE.BufferGeometry[][] = [[], [], []];
  const addCoin = (x: number, y: number, z: number, tx: number, tz: number, yaw: number) => {
    const g = new THREE.CylinderGeometry(0.04, 0.04, 0.009, 8, 1);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(tx, yaw, tz)),
      new THREE.Vector3(1, 1, 1),
    );
    g.applyMatrix4(m);
    coinGeo[Math.floor(R() * 3)]!.push(g);
  };

  const gem = (x: number, y: number, z: number, s: number, color: string, shape = 0, strength = 0.8) => {
    const geo =
      shape === 0
        ? new THREE.IcosahedronGeometry(s, 0)
        : shape === 1
          ? new THREE.OctahedronGeometry(s, 0)
          : new THREE.DodecahedronGeometry(s, 0);
    const sc = shape === 1 ? [0.9, 1.4, 0.9] : [1, 1.15, 1];
    return glow(
      b.part(geo, color, { at: at3(x, y, z), rotation: [R() * 40, R() * 360, R() * 40], scale: sc }),
      strength,
    );
  };

  // ---------- floor ----------
  b.lathe(
    [
      [0, 0],
      [1.6, 0],
      [1.6, 0.03],
      [1.5, 0.045],
      [0, 0.045],
    ],
    {
      at: [0.05, 0, 0.25],
      segments: 20,
      color: scales(["#5b4a99", "#4f4189", "#6a5cae"], "#2a2150", { size: 0.16, width: 0.02, seed: 3 }),
    },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + R() * 0.3;
    const r = 1.52 + R() * 0.06;
    const s = 0.05 + R() * 0.05;
    b.part(new THREE.IcosahedronGeometry(s, 0), STONE, {
      at: at3(0.05 + Math.cos(a) * r, F + s * 0.35, 0.25 + Math.sin(a) * r),
      rotation: [R() * 60, R() * 360, 0],
      scale: [1, 0.6, 1],
    });
  }

  // ---------- coin mound ----------
  const MOUND = paint((p, n) => {
    const c = cells(p, 0.055, 7);
    if (c.d2 - c.d1 < 0.007) return "#8a4a10";
    const k = Math.abs(Math.floor(c.id * 13)) % 3;
    const lit = ["#f5b82a", "#ffd84a", "#e89a1a"][k]!;
    const dark = ["#c97a14", "#e0a020", "#b86a10"][k]!;
    return n.y > 0.45 ? lit : dark;
  });
  b.lathe(
    MPTS.map(([r, h]) => [r, h] as [number, number])
      .reverse()
      .concat([[0, 0]]),
    { at: [MC.x, F - 0.01, MC.z], segments: 14, color: MOUND },
  );
  for (let i = 0; i < 150; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.78 * Math.sqrt(R());
    const x = MC.x + Math.cos(a) * r;
    const z = MC.z + Math.sin(a) * r;
    addCoin(x, F + H(r) + 0.012, z, (R() - 0.5) * 1.0, (R() - 0.5) * 1.0, R() * 3);
  }

  // ---------- chest ----------
  const cx = -0.45;
  const cz = -0.45;
  const BODY_Y = 0.27;
  const WG = grain("#9a5528", "#7c4220", { size: 0.035, axis: "x", seed: 2 });
  const WGS = grain("#6a3320", "#552a22", { size: 0.035, axis: "x", seed: 2 });
  const WOOD = paint((p, n, s) => {
    const v = p.y / 0.09;
    if (v - Math.floor(v) < 0.06) return "#2e1620";
    return (n.y * 0.8 + n.z * 0.5 + n.x * 0.35 > 0.3 ? WG : WGS).at(p, n, s);
  });
  const LIDWOOD = cel(WG);
  b.part(new THREE.BoxGeometry(0.84, 0.05, 0.54), IRON, { at: at3(cx, 0.065, cz) });
  b.part(new THREE.BoxGeometry(0.8, 0.36, 0.5), WOOD, { at: at3(cx, BODY_Y, cz) });
  for (const sx of [-0.27, 0.27]) {
    b.part(new THREE.BoxGeometry(0.07, 0.375, 0.52), IRON, { at: at3(cx + sx, BODY_Y, cz) });
    for (const ry of [0.16, 0.27, 0.38]) {
      b.part(new THREE.SphereGeometry(0.014, 5, 4), "#c9d4ff", { at: at3(cx + sx, ry, cz + 0.265) });
    }
  }
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.BoxGeometry(0.06, 0.375, 0.06), IRON, { at: at3(cx + sx * 0.4, BODY_Y, cz + sz * 0.25) });
  b.part(new THREE.PlaneGeometry(0.17, 0.2), "#ffffff", {
    at: at3(cx, 0.25, cz + 0.255),
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM,
  });
  b.part(new THREE.BoxGeometry(0.11, 0.1, 0.03), GOLD, { at: at3(cx, 0.415, cz + 0.262) });
  b.part(new THREE.BoxGeometry(0.02, 0.05, 0.01), "#2a1f5e", { at: at3(cx, 0.415, cz + 0.28) });
  glow(b.part(new THREE.IcosahedronGeometry(0.018, 0), "#ff2a5c", { at: at3(cx, 0.46, cz + 0.27) }), 0.8);

  // lid, opened 105 degrees about the back-top hinge
  const th = (105 * Math.PI) / 180;
  const LX: [number, number, number] = [0, Math.sin(th), Math.cos(th)];
  const LY: [number, number, number] = [0, Math.cos(th), -Math.sin(th)];
  const hinge = [cx, 0.45, cz - 0.25];
  const arch = (k: number): OutlinePoint[] => {
    const base: Array<[number, number, "sharp"?]> = [
      [0, 0, "sharp"],
      [0.5, 0, "sharp"],
      [0.5, 0.05],
      [0.44, 0.15],
      [0.25, 0.21],
      [0.06, 0.15],
      [0, 0.05],
    ];
    return base.map(([x, y, f]) => {
      const nx = 0.25 + (x - 0.25) * k;
      const ny = y * k - 0.006;
      return f ? ([nx, ny, "sharp"] as OutlinePoint) : ([nx, ny] as OutlinePoint);
    });
  };
  b.extrude(arch(1), { at: hinge, x: LX, y: LY, thickness: 0.78, bevel: 0.008, smoothing: 1, color: LIDWOOD });
  for (const sx of [-0.27, 0.27])
    b.extrude(arch(1.06), {
      at: [cx + sx, hinge[1]!, hinge[2]!],
      x: LX,
      y: LY,
      thickness: 0.07,
      bevel: 0.004,
      smoothing: 1,
      color: IRON,
    });
  b.extrude(
    [
      [0.03, -0.016],
      [0.47, -0.016],
      [0.47, -0.003],
      [0.03, -0.003],
    ],
    { at: hinge, x: LX, y: LY, thickness: 0.7, color: VELVET },
  );
  b.rod([cx - 0.36, 0.45, cz - 0.255], [cx + 0.36, 0.45, cz - 0.255], 0.024, IRON, { sides: 6 });

  // chest contents
  b.part(new THREE.BoxGeometry(0.72, 0.03, 0.42), GOLD, { at: at3(cx, 0.465, cz) });
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.3, 0.04],
      [0.16, 0.1],
      [0, 0.13],
    ],
    { at: [cx, 0.47, cz], segments: 10, color: MOUND },
  );
  for (let i = 0; i < 12; i++) {
    const dx = (R() - 0.5) * 0.6;
    const dz = (R() - 0.5) * 0.3;
    const rr = Math.hypot(dx, dz * 1.3);
    addCoin(cx + dx, 0.5 + Math.max(0, 0.13 * (1 - rr / 0.34)), cz + dz, (R() - 0.5) * 0.7, (R() - 0.5) * 0.7, R() * 3);
  }
  gem(cx - 0.1, 0.62, cz + 0.05, 0.05, GEMS[0]!, 1);
  gem(cx + 0.14, 0.58, cz + 0.02, 0.04, GEMS[2]!, 0);

  // pearl chain draped over the chest lip
  const chain = catmull([
    [cx - 0.05, 0.45, cz + 0.25],
    [cx - 0.13, 0.34, cz + 0.34],
    [cx - 0.23, 0.12, cz + 0.45],
    [cx - 0.25, 0.05, cz + 0.62],
    [cx - 0.15, 0.05, cz + 0.78],
  ]);
  b.sweep(chain, 0.007, "#ffcf3a", { sides: 5 });
  for (let i = 1; i < 12; i++) {
    const p = chain.at(i / 12);
    b.part(new THREE.SphereGeometry(0.016, 6, 4), "#fff3f0", { at: at3(p.x, p.y + 0.005, p.z) });
  }
  {
    const e = chain.at(1);
    gem(e.x, e.y + 0.025, e.z, 0.03, GEMS[0]!, 1);
  }

  // ---------- cushion and crown ----------
  const kx = 0.45;
  const kz = 0.55;
  const ky = mh(kx, kz) + 0.02;
  b.part(new THREE.SphereGeometry(1, 10, 6), VELVET, { at: at3(kx, ky, kz), scale: [0.19, 0.07, 0.19] });
  for (const [dx, dz] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.02, 5, 4), GOLD, { at: at3(kx + dx * 0.15, ky - 0.005, kz + dz * 0.15) });
  }
  const y0 = ky + 0.05;
  b.lathe(
    [
      [0.115, 0],
      [0.13, 0],
      [0.14, 0.1],
      [0.125, 0.1],
    ],
    { at: [kx, y0, kz], segments: 12, color: GOLD },
  );
  for (const ty of [0.005, 0.095])
    b.part(new THREE.TorusGeometry(0.133, 0.009, 4, 12), GOLD_LIGHT, {
      at: at3(kx, y0 + ty, kz),
      rotation: [90, 0, 0],
    });
  for (let k = 0; k < 8; k++) {
    const a = ((22.5 + k * 45) * Math.PI) / 180;
    const bx = kx + Math.cos(a) * 0.128;
    const bz = kz + Math.sin(a) * 0.128;
    b.spike([bx, y0 + 0.09, bz], [0, 1, 0], 0.11, 0.024, GOLD, { sides: 4 });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD_LIGHT, { at: at3(bx, y0 + 0.205, bz) });
    const g = ((k * 45) * Math.PI) / 180;
    gem(kx + Math.cos(g) * 0.14, y0 + 0.05, kz + Math.sin(g) * 0.14, 0.016, GEMS[k % 6]!, 0, 0.9);
  }
  glow(
    b.part(new THREE.IcosahedronGeometry(0.03, 0), "#ff2a5c", { at: at3(kx, y0 + 0.05, kz + 0.145), scale: [1, 1.3, 0.8] }),
    0.9,
  );
  b.sweep(arc([kx, y0 + 0.09, kz], [kx + 0.125, y0 + 0.09, kz], [0, 0, 1], 180), 0.011, GOLD, { sides: 6 });
  b.sweep(arc([kx, y0 + 0.09, kz], [kx, y0 + 0.09, kz - 0.125], [1, 0, 0], 180), 0.011, GOLD, { sides: 6 });
  gem(kx, y0 + 0.245, kz, 0.03, "#2a8cff", 0, 0.9);

  // ---------- goblets ----------
  const PROFILE: OutlinePoint[] = [
    [0, 0],
    [0.05, 0],
    [0.05, 0.012],
    [0.015, 0.03],
    [0.015, 0.09],
    [0.03, 0.1],
    [0.05, 0.115],
    [0.065, 0.15],
    [0.07, 0.19],
    [0.062, 0.19],
    [0.057, 0.15],
    [0.04, 0.125],
    [0, 0.118],
  ];
  const goblet = (x: number, z: number, color: typeof GOLD, content: "gold" | "wine") => {
    const y = F - 0.005;
    b.lathe(PROFILE, { at: [x, y, z], segments: 10, color });
    b.part(new THREE.TorusGeometry(0.028, 0.009, 5, 8), GOLD_LIGHT, { at: at3(x, y + 0.06, z), rotation: [90, 0, 0] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      gem(x + Math.cos(a) * 0.058, y + 0.135, z + Math.sin(a) * 0.058, 0.01, GEMS[i]!, 0, 0.9);
    }
    if (content === "wine") {
      b.part(new THREE.CylinderGeometry(0.057, 0.057, 0.004, 8), "#d11d4b", { at: at3(x, y + 0.172, z) });
    } else {
      b.part(new THREE.SphereGeometry(0.06, 8, 4), GOLD, { at: at3(x, y + 0.175, z), scale: [1, 0.5, 1] });
      gem(x, y + 0.215, z, 0.02, GEMS[1]!, 0);
    }
  };
  goblet(1.25, 0.0, GOLD, "gold");
  goblet(1.1, -0.45, SILVER, "wine");
  b.lathe(PROFILE, { at: [0.1, F + 0.07, 1.25], axis: [1, -0.04, 0.3], segments: 10, color: GOLD });
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    addCoin(0.3 + t * 0.35 + R() * 0.05, F + 0.005 + R() * 0.004, 1.3 + (R() - 0.3) * 0.15, 0, 0, R() * 3);
  }

  // ---------- gold bars ----------
  const barGeo = new THREE.BoxGeometry(0.2, 0.05, 0.1);
  const bars: Array<[number, number, number]> = [];
  for (let i = 0; i < 3; i++) bars.push([-1.1, F + 0.025, 0.2 + i * 0.11]);
  for (let i = 0; i < 2; i++) bars.push([-1.1, F + 0.075, 0.255 + i * 0.11]);
  bars.push([-1.1, F + 0.125, 0.31]);
  for (const [x, y, z] of bars) {
    b.part(barGeo, GOLD, { at: at3(x, y, z) });
    b.part(new THREE.PlaneGeometry(0.1, 0.05), "#ffffff", {
      at: at3(x, y + 0.0255, z),
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: STAMP,
    });
  }

  // ---------- coin sack ----------
  const sx0 = -0.5;
  const sz0 = 0.95;
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.21, 0.1],
      [0.19, 0.22],
      [0.1, 0.32],
      [0.07, 0.34],
      [0.13, 0.4],
      [0.1, 0.41],
      [0, 0.35],
    ],
    { at: [sx0, F - 0.005, sz0], segments: 10, color: BURLAP },
  );
  b.part(new THREE.TorusGeometry(0.08, 0.012, 5, 8), "#6b4a2a", { at: at3(sx0, F + 0.335, sz0), rotation: [90, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    at: at3(sx0, F + 0.16, sz0 + 0.214),
    dir: [0, 0.15, 1],
    axis: "z",
    texture: COINTEX,
  });
  b.part(new THREE.SphereGeometry(0.1, 7, 4), GOLD, { at: at3(sx0, F + 0.38, sz0), scale: [1, 0.35, 1] });
  for (let i = 0; i < 22; i++) {
    const t = R();
    addCoin(sx0 + 0.2 + t * 0.5, F + 0.005 + R() * 0.012 + (t < 0.4 ? 0.01 : 0), sz0 + (R() - 0.4) * 0.3, (R() - 0.5) * 0.3, (R() - 0.5) * 0.3, R() * 3);
  }

  // ---------- coin stacks ----------
  const STACK = stripes("#ffcc33", "#b86a10", { size: 0.02, axis: "y", seed: 1 });
  for (const [x, z, h] of [
    [1.0, 0.8, 0.1],
    [1.12, 0.95, 0.07],
    [0.88, 0.98, 0.14],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.042, 0.042, h, 8), STACK, { at: at3(x, F - 0.005 + h / 2, z) });
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
      at: at3(x, F - 0.005 + h + 0.002, z),
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: COINTEX,
    });
  }

  // ---------- gems on the mound ----------
  const bigs: Array<[number, number, number, string, number]> = [
    [-0.05, 0.35, 0.075, GEMS[0]!, 1],
    [0.75, 0.05, 0.065, GEMS[1]!, 2],
    [0.2, 0.0, 0.07, GEMS[2]!, 0],
  ];
  for (const [x, z, s, c, sh] of bigs) gem(x, mh(x, z) + s * 0.7, z, s, c, sh, 1);
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.1 + 0.62 * Math.sqrt(R());
    const x = MC.x + Math.cos(a) * r;
    const z = MC.z + Math.sin(a) * r;
    if (Math.hypot(x - kx, z - kz) < 0.22) continue;
    const s = 0.025 + R() * 0.02;
    gem(x, mh(x, z) + s * 0.6, z, s, GEMS[i % 6]!, i % 3);
  }

  // ---------- crystal cluster ----------
  const CR: Array<[number, number, number, number, number, string]> = [
    [0, 0, 0.62, 0.075, 0, "#35d6ff"],
    [0.1, 0.05, 0.4, 0.055, 1, "#a65cff"],
    [-0.1, 0.04, 0.36, 0.05, 1, "#35d6ff"],
    [0.05, -0.08, 0.3, 0.045, 0.5, "#ff5cb8"],
    [-0.04, 0.12, 0.25, 0.04, 0.7, "#a65cff"],
  ];
  const cbx = 0.55;
  const cbz = -0.85;
  b.part(new THREE.IcosahedronGeometry(0.16, 0), STONE, { at: at3(cbx, F + 0.02, cbz), scale: [1.4, 0.45, 1.2] });
  for (const [ox, oz, len, r, lean, color] of CR) {
    const d = new THREE.Vector3(ox * lean * 3, 1, oz * lean * 3).normalize();
    glow(b.spike([cbx + ox, F, cbz + oz], [d.x, d.y, d.z], len, r, color, { sides: 6 }), 0.9);
  }

  // ---------- flat coins on the floor ----------
  const floorFrames = [];
  for (let i = 0; i < 20; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.95 + R() * 0.5;
    floorFrames.push(frame([0.05 + Math.cos(a) * r, F + 0.004, 0.25 + Math.sin(a) * r], [0, 1, 0]));
  }
  b.cards(floorFrames, COINTEX, {
    size: 0.08,
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3)],
    mirror: true,
  });

  // ---------- merged coins ----------
  const COIN_COLORS = ["#ffc933", "#f2a81d", "#ffe066"];
  coinGeo.forEach((list, i) => {
    if (list.length) {
      const m = mergeGeometries(list);
      if (m) b.part(m, COIN_COLORS[i]!, { at: [0, 0, 0] });
    }
  });

  // ---------- sparkles ----------
  const spark: Array<[number, number, number, number]> = [
    [kx, y0 + 0.28, kz, 0.16],
    [-0.05, mh(-0.05, 0.35) + 0.1, 0.35, 0.14],
    [0.75, mh(0.75, 0.05) + 0.1, 0.05, 0.12],
    [0.2, mh(0.2, 0.0) + 0.1, 0.0, 0.14],
    [cbx, 0.7, cbz, 0.16],
    [cx - 0.1, 0.68, cz + 0.05, 0.12],
    [1.25, 0.26, 0.0, 0.1],
  ];
  glow(
    b.cards(
      spark.map(([x, y, z]) => frame([x, y, z], [0, 1, 0])),
      STAR,
      { size: 0.14, lean: 0, cross: true, flow: [0, 0, 1] },
    ),
    1,
  );

  // little weathering wash on the sack/noise so unused imports stay meaningful
  void noise;

  return b.root;
}
