import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { mottle, noise, paint } from "../src/paint";
import type { ColorInput } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Desert Oasis",
  description:
    "A round sandstone plinth with a turquoise pool ringed by stones, two tall palms and a small palm, a striped tent with a glowing lantern and a pennant, a smaller blue tent, a standing camel with a striped blanket and panniers, a kneeling calf, and market clutter: jars, melons, a crate, a bucket, sacks, a cactus and a perched bird.",
  style: "low-poly whimsical mix",
  commit: "b816db2",
};

type V = [number, number, number];
type Xf = { x: number; z: number; yaw: number; s: number };

const G = 0.27; // sand surface height on the plinth
const UP = new THREE.Vector3(0, 1, 0);

// Flat colours (each distinct string is one of the 64 flat colours).
const BOWL = "#b8703a";
const STONE = ["#d8b08a", "#c2906a", "#e9cba4"];
const TRUNK_A = "#b98246";
const TRUNK_B = "#8b5a2b";
const FROND = ["#3c9e4a", "#6cc04a", "#2f7f3d"];
const COCO = "#5a3820";
const CLOTH_RED = "#e04b3a";
const CLOTH_CREAM = "#fff1d4";
const CLOTH_BLUE = "#2c6fb5";
const CLOTH_GOLD = "#f7c948";
const GOLD = "#f2c14e";
const INK = "#2b1b2e";
const ROPE = "#6b4a2b";
const WOOD = "#9c6b3a";
const FUR = "#e3a866";
const FUR_D = "#b7733f";
const BELLY = "#f4d7a8";
const CHEST = "#7d4a24";
const HOOF = "#4e3220";
const EYE_W = "#fff9f0";
const MUZZLE = "#fbe2b8";
const RED = "#d6402f";
const CACTUS = "#5fae5a";
const PINK = "#ff7eb6";
const GRASS = "#7fc248";
const GLOW = "#ffd166";
const BIRD = "#e4572e";
const BIRD_D = "#b5301e";
const BEAK = "#ffb020";
const SACK = "#e6d3a1";
const TERRA = "#c8643b";

// Paints (not counted as flat colours; baked into the shared sheet).
const SAND_L = "#f6d795";
const SAND_D = "#e9b96a";
const STRATA_A = "#d9955a";
const STRATA_B = "#eab072";
const WATER = "#2bb8c8";
const WATER_L = "#6fe3dc";
const FOAM = "#effffb";
const MELON_L = "#7fc04a";
const MELON_D = "#3e8a2e";
const CRATE = "#b07a3f";
const CRATE_D = "#8a5a2b";
const RUG_R = "#c0392b";
const RUG_Y = "#f2b134";
const BAG_A = "#e7a23a";
const BAG_B = "#c46f2b";

// Model-space helpers. Every geometry is built in meters, +Y up, with the ground at y = 0 before `place`.
function tube(a: V, c: V, r0: number, r1: number, sides = 6) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...c);
  const d = B.clone().sub(A);
  const g = new THREE.CylinderGeometry(r1, r0, d.length(), sides, 1, false);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()));
  return g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
}

function ell(c: V, rx: number, ry: number, rz: number, w = 8, h = 6) {
  return new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz).translate(c[0], c[1], c[2]);
}

function ball(c: V, r: number, w = 8, h = 6) {
  return ell(c, r, r, r, w, h);
}

function lerpV(a: V, c: V, t: number): V {
  return [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
}

function frondOutline(L: number): [number, number][] {
  const N = 9;
  const w = (t: number) => 0.17 * L * Math.pow(Math.sin(Math.PI * t), 0.8) * (1 - 0.2 * t);
  const droop = (t: number) => L * (0.14 * t - 0.55 * t * t);
  const top: [number, number][] = [];
  const bot: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const jag = i > 0 && i < N && i % 2 ? 0.012 * L : 0;
    top.push([L * t, droop(t) + w(t) + jag]);
  }
  for (let i = N - 1; i >= 1; i--) {
    const t = i / N;
    const jag = i % 2 ? 0.012 * L : 0;
    bot.push([L * t, droop(t) - w(t) - jag]);
  }
  return [...top, ...bot];
}

export default function build() {
  const b = createBuilder({ name: "desertOasisDioramaHaiku" });
  const root = b.joint("ground", { at: [0, 0, 0] });
  type Fill = Parameters<typeof b.part>[1];
  const add = (g: THREE.BufferGeometry, color: Fill, group: string) =>
    b.part(g, color, { bone: root, at: [0, 0, 0], flat: true, group });
  const place = (g: THREE.BufferGeometry, t: Xf) =>
    g.scale(t.s, t.s, t.s).rotateY(t.yaw).translate(t.x, G, t.z);

  // ---- Paints -------------------------------------------------------------
  const plinth = paint((p, n) => {
    if (n.y > 0.5) {
      const w = Math.sin(p.x * 22 + Math.sin(p.z * 9) * 1.6 + p.z * 3);
      return w > 0.5 ? SAND_D : SAND_L;
    }
    return Math.floor(p.y / 0.04) % 2 ? STRATA_A : STRATA_B;
  });
  const PX = 0.32;
  const PZ = -0.28;
  const water = paint((p) => {
    const d = Math.hypot(p.x - PX, p.z - PZ) / 0.38;
    if (d > 0.84) return FOAM;
    return noise(p, 0.09, 5) > 0.55 ? WATER_L : WATER;
  });
  const crate = paint((p) => (Math.abs(((p.y - G) * 6) % 1 - 0.5) < 0.07 ? CRATE_D : CRATE));
  const melon = paint((_p, _n, s) => (Math.floor(s[0] * 6) % 2 ? MELON_D : MELON_L));
  const blanket = paint((_p, _n, s) => (Math.floor(s[0] * 10) % 2 ? RUG_Y : RUG_R));
  const bag = paint((p) => (Math.floor(p.y * 16) % 2 ? BAG_A : BAG_B));
  const jar = paint((_p, _n, s) => (s[0] > 0.1 && s[0] < 0.14 ? GOLD : TERRA));
  const fur = mottle(FUR, FUR_D, { size: 0.16, seed: 3 });

  const rugTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32">
<rect width="48" height="32" fill="#c0392b"/>
<rect x="3" y="3" width="42" height="26" fill="#f2b134"/>
<rect x="6" y="6" width="36" height="20" fill="#2d6aa3"/>
<path d="M24 8 L34 16 L24 24 L14 16 Z" fill="#f2b134"/>
<path d="M24 12 L28 16 L24 20 L20 16 Z" fill="#c0392b"/>
<path d="M9 16 L12 13 L12 19 Z M39 16 L36 13 L36 19 Z" fill="#f2b134"/>
</svg>`,
    { size: 256 },
  );

  // ---- Plinth, sand and dunes --------------------------------------------
  b.lathe(
    [
      [0, 0],
      [1.5, 0],
      [1.5, 0.17],
      [1.45, 0.22],
      [1.4, 0.25],
      [1.36, G],
      [0, G],
    ],
    { at: [0, 0, 0], segments: 20, color: plinth, bone: root, group: "plinth" },
  );
  // A flowering bush at the back, between the calf and palm A.
  for (const [x, y, z, r] of [
    [0.5, 0.1, -1.1, 0.12],
    [0.62, 0.08, -1.02, 0.1],
    [0.42, 0.07, -1.0, 0.09],
  ] as [number, number, number, number][])
    add(ball([x, G + y, z], r, 6, 5), FROND[2], "bush");
  for (const [x, z] of [
    [0.5, -1.2],
    [0.62, -1.1],
    [0.44, -1.1],
  ] as [number, number][])
    add(ball([x, G + 0.2, z], 0.03, 4, 3), PINK, "bush");

  // ---- Oasis pool ----------------------------------------------------------
  add(new THREE.CylinderGeometry(0.46, 0.5, 0.06, 14).translate(PX, G - 0.02, PZ), BOWL, "pool");
  add(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 14).translate(PX, G + 0.01, PZ), water, "pool");
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.2;
    const r = 0.46 + 0.03 * ((k * 0.37) % 1);
    const sz = 0.065 + 0.02 * ((k * 0.61) % 1);
    const x = PX + r * Math.cos(a);
    const z = PZ + r * Math.sin(a);
    add(
      new THREE.IcosahedronGeometry(sz, 0).scale(1, 0.65, 0.9).rotateY(a).translate(x, G + 0.02, z),
      STONE[k % 3],
      "pool.stones",
    );
  }

  // Lily pads with a pink flower each, on the pool.
  for (const [x, z] of [
    [PX - 0.18, PZ + 0.12],
    [PX + 0.1, PZ - 0.2],
    [PX + 0.15, PZ + 0.18],
  ] as [number, number][]) {
    add(new THREE.CylinderGeometry(0.055, 0.055, 0.008, 7).translate(x, G + 0.024, z), FROND[1], "pool.lily");
    add(ball([x + 0.02, G + 0.04, z], 0.02, 5, 4), PINK, "pool.lily");
  }

  // Small sandstone rocks scattered over the sand, clear of the tents and camels.
  [
    [0.35, -1.28],
    [-1.3, -0.62],
    [1.2, -0.33],
    [0.12, 0.45],
  ].forEach(([x, z], k) => {
    const sz = 0.045 + 0.02 * ((k * 0.53) % 1);
    add(
      new THREE.IcosahedronGeometry(sz, 0).scale(1, 0.7, 0.9).rotateY(k * 1.3).translate(x, G + 0.01, z),
      STONE[(k + 1) % 3],
      "rock",
    );
  });

  // Grass tufts: three blades each.
  const tufts: [number, number][] = [
    [-0.1, 0.25],
    [0.5, 0.25],
    [0.98, -0.2],
    [0.25, -0.8],
  ];
  tufts.forEach(([x, z], i) => {
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + i;
      const h = 0.14 + 0.04 * k;
      add(tube([x, G, z], [x + Math.cos(a) * 0.04, G + h, z + Math.sin(a) * 0.04], 0.028, 0.004, 4), GRASS, "tuft");
    }
  });

  // ---- Palms ---------------------------------------------------------------
  const palm = (o: {
    bx: number;
    bz: number;
    dx: number;
    dz: number;
    h: number;
    s: number;
    n: number;
    seed: number;
    group: string;
  }) => {
    const { bx, bz, dx, dz, h, s, n, seed, group } = o;
    const P0: V = [bx, G, bz];
    const P2: V = [bx + dx, G + h, bz + dz];
    const P1: V = [bx + dx * 0.15, G + h * 0.55, bz + dz * 0.15];
    const at = (t: number): V => {
      const m = (i: number) => (1 - t) * (1 - t) * P0[i] + 2 * (1 - t) * t * P1[i] + t * t * P2[i];
      return [m(0), m(1), m(2)];
    };
    const SEG = 9;
    for (let i = 0; i < SEG; i++) {
      const t0 = i / SEG;
      const t1 = (i + 1) / SEG;
      add(tube(at(t0), at(t1), (0.13 - 0.06 * t0) * s, (0.13 - 0.06 * t1) * s, 7), i % 2 ? TRUNK_A : TRUNK_B, group);
    }
    add(ball([P2[0], P2[1] - 0.03 * s, P2[2]], 0.12 * s, 7, 5), TRUNK_B, group);
    for (let k = 0; k < n; k++) {
      const a = seed + (k / n) * Math.PI * 2 + (k % 2 ? 0.18 : -0.12);
      const L = (0.85 + 0.12 * ((k * 0.618) % 1)) * s;
      b.extrude(frondOutline(L), {
        at: [P2[0], P2[1] + 0.02 * s, P2[2]],
        x: [Math.cos(a), 0, Math.sin(a)],
        y: [0, 1, 0],
        thickness: 0.014,
        color: FROND[k % 3],
        bone: root,
        group,
      });
    }
    const cocos: V[] = [
      [0.07 * s, -0.1 * s, 0.05 * s],
      [-0.06 * s, -0.12 * s, -0.03 * s],
      [0.01 * s, -0.13 * s, -0.08 * s],
    ];
    for (const c of cocos) add(ball([P2[0] + c[0], P2[1] + c[1], P2[2] + c[2]], 0.055 * s, 6, 4), COCO, group);
  };
  palm({ bx: 0.92, bz: -0.92, dx: -0.3, dz: 0.15, h: 2.5, s: 1, n: 9, seed: 0.3, group: "palmA" });
  palm({ bx: -0.98, bz: -0.88, dx: 0.3, dz: 0.1, h: 2.6, s: 1, n: 9, seed: 1.1, group: "palmB" });
  palm({ bx: 1.28, bz: -0.55, dx: 0.05, dz: 0.12, h: 1.4, s: 0.7, n: 7, seed: 2.0, group: "palmC" });

  // A perched bird on palm A's crown.
  {
    const bx = 0.92 - 0.3 + 0.1;
    const by = G + 2.5 + 0.12;
    const bz = -0.92 + 0.15;
    add(ell([bx, by, bz], 0.05, 0.045, 0.075, 6, 5), BIRD, "bird");
    add(ball([bx, by + 0.04, bz + 0.07], 0.03, 6, 4), BIRD, "bird");
    add(tube([bx, by + 0.04, bz + 0.1], [bx, by + 0.03, bz + 0.15], 0.012, 0.001, 4), BEAK, "bird");
    add(tube([bx, by, bz - 0.06], [bx, by + 0.05, bz - 0.14], 0.03, 0.005, 4), BIRD_D, "bird");
    add(ell([bx + 0.04, by, bz], 0.01, 0.035, 0.05, 4, 3), BIRD_D, "bird");
    add(ell([bx - 0.04, by, bz], 0.01, 0.035, 0.05, 4, 3), BIRD_D, "bird");
  }

  // ---- Tents ---------------------------------------------------------------
  const tent = (o: {
    cx: number;
    cz: number;
    r: number;
    L: number;
    c1: ColorInput;
    c2: ColorInput;
    group: string;
    pennant?: boolean;
  }) => {
    const { cx, cz, r, L, c1, c2, group } = o;
    const front = cz + L / 2;
    const cloth = paint((_p, _n, s) => (Math.floor(s[0] * 6) % 2 ? c1 : c2));
    // Half-cylinder arch: a 6-facet semicircle over the ground, axis along z.
    const arch = new THREE.CylinderGeometry(r, r, L, 6, 1, false, Math.PI / 2, Math.PI)
      .rotateX(Math.PI / 2)
      .translate(cx, G, cz);
    add(arch, cloth, group);
    // Door: gold trim, then the dark opening on top of it.
    const dw = 0.3 * r;
    const dh = 0.72 * r;
    const ap = 0.92 * r;
    b.extrude(
      [
        [-dw - 0.02, 0],
        [dw + 0.02, 0],
        [dw + 0.02, dh + 0.03],
        [0, ap + 0.02, "sharp"],
        [-dw - 0.02, dh + 0.03],
      ],
      { at: [cx, G, front + 0.003], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, color: GOLD, bone: root, group },
    );
    b.extrude(
      [
        [-dw, 0],
        [dw, 0],
        [dw, dh],
        [0, ap, "sharp"],
        [-dw, dh],
      ],
      { at: [cx, G, front + 0.008], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, color: INK, bone: root, group },
    );
    // Gold hem along both ground edges.
    for (const sx of [-1, 1]) add(tube([cx + sx * r, G + 0.01, front], [cx + sx * r, G + 0.01, front - L], 0.018, 0.018, 4), CLOTH_GOLD, group);
    // Guy ropes and stakes, two a side.
    for (const sx of [-1, 1]) {
      for (const zz of [cz - L * 0.3, cz + L * 0.3]) {
        const A: V = [cx + sx * r * 0.8, G + r * 0.6, zz];
        const Q: V = [cx + sx * (r + 0.12), G, zz];
        add(tube(A, Q, 0.006, 0.006, 4), ROPE, group);
        add(tube(Q, [Q[0], G + 0.12, Q[2]], 0.02, 0.005, 5), WOOD, group);
      }
    }
    if (o.pennant) {
      add(tube([cx, G + r - 0.02, cz], [cx, G + r + 0.42, cz], 0.02, 0.014, 6), TRUNK_B, group);
      b.extrude(
        [
          [0, 0],
          [0.26, 0.05],
          [0.22, 0.11],
          [0.26, 0.17],
          [0, 0.2],
        ],
        { at: [cx, G + r + 0.24, cz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, color: CLOTH_RED, bone: root, group },
      );
    }
  };
  const TA = { cx: -0.76, cz: 0.0, r: 0.64, L: 0.88 };
  tent({ ...TA, c1: CLOTH_RED, c2: CLOTH_CREAM, group: "tentA", pennant: true });
  tent({ cx: 1.06, cz: 0.1, r: 0.34, L: 0.7, c1: CLOTH_BLUE, c2: CLOTH_GOLD, group: "tentB" });

  // Woven mat in front of tent A, a lantern post beside the door, and the lantern hung from a hinge.
  const frontA = TA.cz + TA.L / 2;
  b.part(new THREE.BoxGeometry(0.46, 0.012, 0.3).translate(TA.cx, G + 0.006, frontA + 0.32), "#ffffff", {
    bone: root,
    at: [0, 0, 0],
    flat: true,
    texture: rugTex,
    group: "tentA.mat",
  });
  const LX = TA.cx + 0.3;
  const LZ = frontA + 0.26;
  add(tube([LX, G, LZ], [LX, G + 0.72, LZ], 0.02, 0.016, 6), TRUNK_B, "lantern.post");
  const lamp = b.joint("lantern", { parent: root, at: [LX, G + 0.72, LZ], dir: [0, -1, 0], role: "hinge" });
  add(tube([LX, G + 0.72, LZ], [LX, G + 0.66, LZ], 0.008, 0.008, 4), GOLD, "lantern");
  glow(
    b.part(new THREE.CylinderGeometry(0.075, 0.06, 0.15, 7).translate(LX, G + 0.59, LZ), GLOW, {
      bone: lamp,
      at: [0, 0, 0],
      flat: true,
      group: "lantern.glass",
    }),
    1.4,
  );
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      add(
        tube([LX + sx * 0.055, G + 0.52, LZ + sz * 0.055], [LX + sx * 0.055, G + 0.66, LZ + sz * 0.055], 0.006, 0.006, 4),
        GOLD,
        "lantern.cage",
      );
  add(ball([LX, G + 0.68, LZ], 0.02, 5, 4), GOLD, "lantern");
  add(ell([1.1, G + 0.03, 0.62], 0.08, 0.035, 0.07, 6, 4), RED, "cushion");
  add(ell([1.2, G + 0.03, 0.66], 0.07, 0.03, 0.06, 6, 4), GOLD, "cushion");

  // ---- Camels ----------------------------------------------------------------
  const camel = (t: Xf, kneel: boolean, group: string) => {
    const dy = kneel ? -0.36 : 0;
    const Y = (y: number) => y + dy;
    const put = (g: THREE.BufferGeometry, col: Fill) => add(place(g, t), col, group);
    // Legs
    for (const sx of [-1, 1]) {
      const x = sx * 0.2;
      if (kneel) {
        put(tube([x, Y(0.9), 0.4], [x, 0.14, 0.62], 0.085, 0.06), FUR_D);
        put(ball([x, 0.12, 0.62], 0.07, 6, 4), FUR_D);
        put(tube([x, 0.12, 0.62], [x, 0.05, 0.42], 0.06, 0.05), FUR);
        put(ell([x, 0.04, 0.4], 0.07, 0.04, 0.1, 6, 4), HOOF);
        put(tube([x, Y(0.9), -0.4], [x, 0.12, -0.66], 0.09, 0.06), FUR_D);
        put(ball([x, 0.1, -0.66], 0.07, 6, 4), FUR_D);
        put(tube([x, 0.08, -0.66], [x, 0.04, -0.9], 0.06, 0.05), FUR);
        put(ell([x, 0.03, -0.92], 0.07, 0.04, 0.09, 6, 4), HOOF);
      } else {
        put(tube([x, Y(0.92), 0.42], [x, 0.42, 0.45], 0.085, 0.066), FUR_D);
        put(ball([x, 0.42, 0.45], 0.07, 6, 4), FUR_D);
        put(tube([x, 0.42, 0.45], [x, 0.1, 0.44], 0.062, 0.05), FUR);
        put(ell([x, 0.05, 0.45], 0.07, 0.05, 0.09, 6, 4), HOOF);
        put(tube([x, Y(0.92), -0.42], [x, 0.46, -0.5], 0.09, 0.066), FUR_D);
        put(ball([x, 0.46, -0.5], 0.066, 6, 4), FUR_D);
        put(tube([x, 0.46, -0.5], [x, 0.1, -0.46], 0.06, 0.05), FUR);
        put(ell([x, 0.05, -0.46], 0.07, 0.05, 0.09, 6, 4), HOOF);
      }
    }
    // Body, belly, hump with tufts, chest pad
    put(ell([0, Y(0.98), 0], 0.33, 0.3, 0.6, 8, 6), fur);
    put(ell([0, Y(0.78), 0.02], 0.28, 0.12, 0.42, 8, 4), BELLY);
    put(ell([0, Y(1.28), -0.12], 0.2, 0.26, 0.22, 8, 6), FUR_D);
    for (const x of [-0.06, 0, 0.06]) put(tube([x, Y(1.46), -0.12], [x * 1.4, Y(1.62), -0.16], 0.03, 0.002, 4), CHEST);
    put(ell([0, Y(0.9), 0.5], 0.2, 0.22, 0.16, 6, 5), CHEST);
    // Short thick neck with a dark mane along its top
    const N: V[] = kneel
      ? [
          [0, Y(1.0), 0.5],
          [0, Y(1.18), 0.72],
          [0, Y(1.3), 0.9],
          [0, Y(1.36), 1.0],
        ]
      : [
          [0, Y(1.1), 0.45],
          [0, Y(1.36), 0.62],
          [0, Y(1.54), 0.76],
          [0, Y(1.6), 0.86],
        ];
    const NR = [0.2, 0.18, 0.16, 0.14];
    for (let i = 0; i < 3; i++) {
      put(tube(N[i], N[i + 1], NR[i], NR[i + 1], 6), FUR);
      put(
        tube(
          [N[i][0], N[i][1] + NR[i] * 0.8, N[i][2] - 0.04],
          [N[i + 1][0], N[i + 1][1] + NR[i + 1] * 0.8, N[i + 1][2] - 0.04],
          0.035,
          0.03,
          5,
        ),
        CHEST,
      );
    }
    for (let i = 0; i < 4; i++) put(ball(N[i], NR[i] * 0.98, 6, 4), FUR);
    for (let k = 1; k <= 5; k++) {
      const p = lerpV(N[0], N[2], k / 6);
      put(ball([p[0], p[1], p[2] + 0.17], 0.024, 5, 4), GOLD);
    }
    // Head: big toy eyes, broad muzzle, ears, bridle
    const H: V = [0, N[3][1] + 0.02, N[3][2] + 0.12];
    put(ell(H, 0.15, 0.14, 0.23, 7, 5), FUR);
    put(ell([0, H[1] - 0.09, H[2] + 0.2], 0.12, 0.1, 0.16, 6, 5), MUZZLE);
    put(ell([0, H[1] - 0.05, H[2] + 0.38], 0.085, 0.08, 0.08, 6, 4), CHEST);
    put(ell([0, H[1] - 0.11, H[2] + 0.32], 0.06, 0.035, 0.07, 5, 3), MUZZLE);
    put(ell([0, H[1] + 0.13, H[2] + 0.12], 0.06, 0.035, 0.085, 5, 4), CHEST);
    put(ball([0, H[1] + 0.12, H[2] + 0.25], 0.035, 5, 4), RED);
    put(tube([-0.12, H[1] - 0.05, H[2] + 0.25], [0.12, H[1] - 0.05, H[2] + 0.25], 0.012, 0.012, 4), CHEST);
    for (const sx of [-1, 1]) {
      put(ball([sx * 0.04, H[1] - 0.04, H[2] + 0.43], 0.02, 4, 3), INK);
      put(ball([sx * 0.14, H[1] + 0.05, H[2] + 0.07], 0.05, 6, 4), EYE_W);
      put(ball([sx * 0.155, H[1] + 0.05, H[2] + 0.1], 0.028, 4, 3), INK);
      put(tube([sx * 0.14, H[1] + 0.09, H[2] + 0.04], [sx * 0.2, H[1] + 0.13, H[2]], 0.007, 0.003, 4), INK);
      put(tube([sx * 0.09, H[1] + 0.12, H[2] - 0.05], [sx * 0.17, H[1] + 0.24, H[2] - 0.15], 0.05, 0.012, 5), FUR_D);
      put(tube([sx * 0.14, H[1] + 0.02, H[2] + 0.02], [sx * 0.12, H[1] - 0.07, H[2] + 0.22], 0.012, 0.012, 4), CHEST);
    }
    // Tail with a tuft
    put(tube([0, Y(1.3), -0.6], [0, Y(1.0), -0.84], 0.05, 0.03, 5), FUR_D);
    put(ell([0, Y(0.92), -0.87], 0.07, 0.09, 0.06, 5, 4), CHEST);
    // Saddle blanket with gold tassels, panniers, bell
    put(ell([0, Y(1.3), 0.12], 0.36, 0.06, 0.4, 8, 4), blanket);
    for (const sx of [-1, 1]) {
      put(tube([sx * 0.34, Y(1.28), 0.36], [sx * 0.38, Y(1.1), 0.4], 0.012, 0.01, 4), GOLD);
      put(ball([sx * 0.38, Y(1.08), 0.4], 0.03, 5, 4), GOLD);
      put(ell([sx * 0.4, Y(1.0), 0.05], 0.1, 0.22, 0.16, 6, 5), bag);
    }
    put(ball([0, Y(0.95), 0.72], 0.03, 5, 4), GOLD);
  };
  camel({ x: 0.3, z: 0.9, yaw: -Math.PI / 2, s: 0.9 }, false, "camel");
  camel({ x: -0.25, z: -1.05, yaw: Math.PI / 2, s: 0.62 }, true, "calf");

  // ---- Clutter -----------------------------------------------------------------
  // Clay jars at the back of tent A
  const jarOutline: [number, number][] = [
    [0, 0],
    [0.09, 0],
    [0.12, 0.07],
    [0.13, 0.16],
    [0.08, 0.24],
    [0.06, 0.3],
    [0.08, 0.34],
    [0, 0.34],
  ];
  for (const [x, z] of [
    [-1.02, -0.52],
    [-0.86, -0.42],
  ] as [number, number][])
    b.lathe(jarOutline, { at: [x, G, z], segments: 7, color: jar, bone: root, group: "jar" });

  // Melon crate with melons on top
  add(new THREE.BoxGeometry(0.34, 0.26, 0.3).translate(-0.6, G + 0.13, -0.66), crate, "crate");
  for (const [x, z] of [
    [-0.66, -0.7],
    [-0.54, -0.62],
    [-0.6, -0.66],
  ] as [number, number][])
    add(ell([x, G + 0.26 + 0.085, z], 0.1, 0.085, 0.1, 8, 6), melon, "melon");

  // Water bucket and grain sacks by the pool
  b.lathe(
    [
      [0, 0.02],
      [0.1, 0.02],
      [0.12, 0.22],
      [0.105, 0.22],
      [0.09, 0.04],
      [0, 0.04],
    ],
    { at: [-0.24, G, -0.58], segments: 8, color: WOOD, bone: root, group: "bucket" },
  );
  for (const h of [0.07, 0.17])
    add(new THREE.TorusGeometry(0.113, 0.011, 4, 8).rotateX(Math.PI / 2).translate(-0.24, G + h, -0.58), GOLD, "bucket");
  add(ell([0.97, G + 0.1, -0.52], 0.13, 0.1, 0.11, 6, 5), SACK, "sack");
  add(tube([0.97, G + 0.2, -0.52], [0.97, G + 0.24, -0.52], 0.02, 0.02, 5), ROPE, "sack");
  add(ell([0.9, G + 0.09, -0.66], 0.12, 0.09, 0.1, 6, 5), SACK, "sack");

  // Cactus with two arms and a pink flower, in front of tent A's left corner
  const CX = -1.05;
  const CZ = 0.9;
  add(tube([CX, G, CZ], [CX, G + 0.3, CZ], 0.06, 0.05, 6), CACTUS, "cactus");
  add(tube([CX, G + 0.14, CZ], [CX - 0.1, G + 0.22, CZ], 0.035, 0.035, 5), CACTUS, "cactus");
  add(tube([CX - 0.1, G + 0.22, CZ], [CX - 0.1, G + 0.32, CZ], 0.035, 0.03, 5), CACTUS, "cactus");
  add(ball([CX, G + 0.32, CZ], 0.03, 5, 4), PINK, "cactus");

  return b.root;
}
