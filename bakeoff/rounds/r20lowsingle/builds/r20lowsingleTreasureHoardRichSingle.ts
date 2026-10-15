import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { aim, rng } from "../../../../src/math";
import { arc, catmull } from "../../../../src/path";
import { grain, paint, patches, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "A glittering treasure hoard: an open iron-banded chest spilling pearls and a gem necklace, a mound of coins, a jewelled crown, goblets, ingots, a coin sack and a glowing crystal cluster, in a saturated glowing League of Legends look.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const GOLD = "#ffc933";
const GOLD_D = "#e0921c";
const GOLD_L = "#fff0a0";
const SILVER = "#d3def4";
const RUBY = "#ff2f5f";
const SAPPHIRE = "#2f86ff";
const EMERALD = "#1fe08a";
const AMETHYST = "#b45cff";
const TOPAZ = "#ffd23a";
const GEMS = [RUBY, SAPPHIRE, EMERALD, AMETHYST, TOPAZ];

const coinFace = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffd45a" stroke="#b9741a" stroke-width="4"/><circle cx="32" cy="32" r="22" fill="none" stroke="#f0a82e" stroke-width="3"/><path d="M32 14 L44 32 L32 50 L20 32Z" fill="#fff3b0" stroke="#b9741a" stroke-width="3"/><path d="M32 14 L32 50 M20 32 L44 32" stroke="#e0951f" stroke-width="2"/></svg>`,
  { size: 128 },
);
const gemEmblem = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 6 L56 26 L32 58 L8 26Z" fill="#ffd85a" stroke="#6b3a10" stroke-width="4" stroke-linejoin="round"/><path d="M8 26 H56 M20 26 L32 6 L44 26 L32 58 L20 26" fill="none" stroke="#6b3a10" stroke-width="3"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const rand = rng(11);
  const base = b.joint("base", { at: [0, 0, 0] });
  const lidHinge = b.joint("lidHinge", { parent: base, at: [0, 0.36, -0.85], dir: [1, 0, 0], role: "hinge" });

  const P = (g: THREE.BufferGeometry, color: string | ReturnType<typeof cel>, o: Record<string, unknown> = {}) =>
    b.part(g, color, { bone: base, ...o });

  // palette paints
  const CGOLD = cel(GOLD);
  const CGOLDL = cel(GOLD_L);
  const CSILVER = cel(SILVER);
  const STEEL = cel("#4d5a85");
  const WOODG = grain("#92502a", "#693619", { size: 0.02, axis: "x" });
  const PLANK = cel(paint((p) => (p.y % 0.09 < 0.007 ? "#3b1b0c" : WOODG)));
  const MOUND = cel(scales([GOLD, "#f2aa2a", "#ffdc5e"], "#a8620e", { size: 0.045 }));
  const STONE = cel(patches("#262238", ["#3d3858", "#4a4468", "#352f50"], { size: 0.2, gap: 0.08 }));

  // floor slab
  P(new THREE.CylinderGeometry(1.3, 1.35, 0.05, 14), STONE, { at: [0, 0.025, 0.1] });

  // coin mound
  const mound = b.lathe(
    [
      [0, 0],
      [0.95, 0],
      [0.92, 0.04],
      [0.75, 0.11],
      [0.5, 0.2],
      [0.27, 0.29],
      [0.1, 0.33],
      [0, 0.34],
    ],
    { at: [0, 0.02, 0.35], segments: 16, color: MOUND, bone: base },
  );
  const skin = b.surface(mound);
  const groundY = (x: number, z: number) => skin.ray([x, 2, z], [0, -1, 0])?.at.y ?? 0.05;
  const awayFromChest = (x: number, z: number) => z > -0.36 || Math.abs(x) > 0.45;

  // ---- coins (merged per colour)
  const coinsBy = new Map<string, THREE.BufferGeometry[]>();
  const pushCoin = (color: string, g: THREE.BufferGeometry) => {
    if (!coinsBy.has(color)) coinsBy.set(color, []);
    coinsBy.get(color)!.push(g);
  };
  const addCoin = (color: string, at: THREE.Vector3, n: THREE.Vector3) => {
    const q = aim(n).multiply(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rand() * 0.5 - 0.25, rand() * 6.28, rand() * 0.5 - 0.25),
      ),
    );
    const s = 0.8 + rand() * 0.4;
    const g = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 10);
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        at.clone().addScaledVector(n, 0.004),
        q,
        new THREE.Vector3(s, 1, s),
      ),
    );
    pushCoin(color, g);
  };
  const coinCols = [GOLD, GOLD, GOLD_D, GOLD_L, SILVER];
  for (const h of skin.scatter(280, {
    rng: rng(5),
    minDist: 0.055,
    filter: (h) => h.n.y > 0.25 && awayFromChest(h.at.x, h.at.z),
  }))
    addCoin(coinCols[Math.floor(rand() * coinCols.length)], h.at, h.n);

  const addStack = (x: number, z: number, color: string, count: number) => {
    const y0 = groundY(x, z) - 0.01;
    for (let i = 0; i < count; i++) {
      const g = new THREE.CylinderGeometry(0.045, 0.045, 0.011, 10);
      g.translate(x + (rand() - 0.5) * 0.006, y0 + 0.0055 + i * 0.011, z + (rand() - 0.5) * 0.006);
      pushCoin(color, g);
    }
  };
  addStack(0.12, 0.2, GOLD, 7);
  addStack(0.24, 0.12, GOLD_D, 4);
  addStack(-0.12, 0.3, SILVER, 5);
  addStack(0.2, 0.28, GOLD_L, 3);

  // hero flat coins with a drawn face
  for (const h of skin.scatter(6, {
    rng: rng(9),
    minDist: 0.22,
    filter: (h) => h.n.y > 0.6 && awayFromChest(h.at.x, h.at.z),
  })) {
    P(new THREE.CylinderGeometry(0.058, 0.058, 0.012, 12), GOLD_D, { at: h.at.clone().addScaledVector(h.n, 0.004), dir: h.n });
    P(new THREE.CircleGeometry(0.052, 14), "#ffffff", {
      at: h.at.clone().addScaledVector(h.n, 0.0105),
      dir: h.n,
      axis: "z",
      texture: coinFace,
    });
  }

  // standing coins leaning on the pile
  for (const [x, z] of [
    [0.05, 0.95],
    [0.62, 0.75],
    [-0.38, 0.5],
  ]) {
    const n = new THREE.Vector3(x * 0.2, 0.35, 0.94).normalize();
    const c = new THREE.Vector3(x, groundY(x, z) + 0.055, z);
    P(new THREE.CylinderGeometry(0.07, 0.07, 0.014, 14), GOLD, { at: c, dir: n });
    P(new THREE.CircleGeometry(0.062, 14), "#ffffff", {
      at: c.clone().addScaledVector(n, 0.0075),
      dir: n,
      axis: "z",
      texture: coinFace,
    });
  }

  // ---- chest
  const CZ = -0.6;
  P(new THREE.BoxGeometry(0.78, 0.36, 0.5), PLANK, { at: [0, 0.18, CZ] });
  P(new THREE.BoxGeometry(0.82, 0.03, 0.54), STEEL, { at: [0, 0.015, CZ] });
  for (const sx of [1, -1])
    for (const sz of [1, -1]) P(new THREE.BoxGeometry(0.045, 0.36, 0.045), STEEL, { at: [sx * 0.385, 0.18, CZ + sz * 0.245] });
  // top rim frame
  P(new THREE.BoxGeometry(0.8, 0.03, 0.03), STEEL, { at: [0, 0.355, CZ + 0.235] });
  P(new THREE.BoxGeometry(0.8, 0.03, 0.03), STEEL, { at: [0, 0.355, CZ - 0.235] });
  for (const sx of [1, -1]) P(new THREE.BoxGeometry(0.03, 0.03, 0.5), STEEL, { at: [sx * 0.385, 0.355, CZ] });
  // front straps + rivets
  const rivets: THREE.BufferGeometry[] = [];
  for (const x of [-0.27, 0, 0.27]) {
    P(new THREE.BoxGeometry(0.07, 0.34, 0.02), STEEL, { at: [x, 0.18, CZ + 0.255] });
    for (const y of [0.05, 0.12, 0.19, 0.26, 0.32])
      rivets.push(new THREE.SphereGeometry(0.01, 6, 4).translate(x + 0.0, y, CZ + 0.267));
  }
  // side straps
  for (const sx of [1, -1])
    for (const z of [-0.12, 0.12]) {
      P(new THREE.BoxGeometry(0.02, 0.34, 0.06), STEEL, { at: [sx * 0.395, 0.18, CZ + z] });
      for (const y of [0.06, 0.18, 0.3]) rivets.push(new THREE.SphereGeometry(0.01, 6, 4).translate(sx * 0.405, y, CZ + z));
    }
  P(mergeGeometries(rivets)!, GOLD_L, { at: [0, 0, 0] });
  // lock
  P(new THREE.BoxGeometry(0.11, 0.13, 0.03), CGOLD, { at: [0, 0.25, CZ + 0.265] });
  P(new THREE.BoxGeometry(0.014, 0.04, 0.01), "#2a1308", { at: [0, 0.235, CZ + 0.283] });
  P(new THREE.SphereGeometry(0.012, 6, 4), "#2a1308", { at: [0, 0.26, CZ + 0.283] });
  glow(P(new THREE.OctahedronGeometry(0.024, 0), RUBY, { at: [0, 0.325, CZ + 0.275], flat: true, scale: [1, 1.2, 0.8] }));
  // hinge barrels
  for (const sx of [1, -1])
    P(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 8), STEEL, { at: [sx * 0.25, 0.36, CZ - 0.255], rotation: [0, 0, 90] });

  // coin heap inside the chest
  P(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), MOUND, {
    at: [0, 0.355, CZ],
    scale: [0.36, 0.09, 0.22],
  });
  GEMS.forEach((c, i) => {
    const gx = -0.24 + i * 0.12;
    glow(
      P(new THREE.OctahedronGeometry(0.032, 0), c, {
        at: [gx, 0.425 - Math.abs(gx) * 0.2, CZ + (i % 2 ? 0.03 : -0.05)],
        flat: true,
        scale: [1, 1.4, 1],
        rotation: [0, i * 40, i % 2 ? 12 : -12],
      }),
    );
  });

  // lid (opened after build)
  b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 10, 1, false, 0, Math.PI), PLANK, {
    bone: lidHinge,
    at: [0, 0.36, CZ],
    rotation: [0, 0, 90],
  });
  b.part(new THREE.BoxGeometry(0.78, 0.02, 0.5), "#8a1636", { bone: lidHinge, at: [0, 0.36, CZ] });
  for (const x of [-0.27, 0, 0.27]) {
    const strap = arc([x, 0.36, CZ], [x, 0.36, CZ + 0.256], [1, 0, 0], -180);
    b.sweep(strap, () => [0.036, 0.012], { section: "box", caps: "flat", color: STEEL, bone: lidHinge });
    b.along(strap, 5, (at) => {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD_L, { bone: lidHinge, at });
    });
  }
  for (const sx of [1, -1])
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.52), STEEL, { bone: lidHinge, at: [sx * 0.39, 0.36, CZ] });

  // pearls and chain draped out of the chest
  const pearlPath = catmull([
    [0.13, 0.43, CZ],
    [0.13, 0.41, CZ + 0.14],
    [0.13, 0.385, CZ + 0.23],
    [0.13, 0.33, CZ + 0.275],
    [0.13, 0.24, CZ + 0.28],
    [0.13, 0.16, CZ + 0.33],
  ]);
  const pearls: THREE.BufferGeometry[] = [];
  for (let i = 0; i <= 18; i++) {
    const p = pearlPath.at(i / 18);
    pearls.push(new THREE.SphereGeometry(0.014, 7, 5).translate(p.x, p.y, p.z));
  }
  P(mergeGeometries(pearls)!, "#fff4ea", { at: [0, 0, 0] });
  b.sweep(pearlPath, 0.003, { color: GOLD_D, bone: base });
  const chain = catmull([
    [-0.15, 0.43, CZ],
    [-0.15, 0.41, CZ + 0.14],
    [-0.15, 0.385, CZ + 0.23],
    [-0.15, 0.32, CZ + 0.27],
    [-0.14, 0.24, CZ + 0.3],
    [-0.1, 0.18, CZ + 0.38],
  ]);
  b.sweep(chain, 0.005, { color: GOLD, bone: base });
  glow(P(new THREE.OctahedronGeometry(0.03, 0), EMERALD, { at: [-0.147, 0.265, CZ + 0.3], flat: true, scale: [1, 1.5, 0.8] }));

  // ---- crown
  {
    const gx = 0.38;
    const gz = 0.55;
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(gx, groundY(gx, gz) + 0.03, gz),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, 0.4, -0.18)),
      new THREE.Vector3(1, 1, 1),
    );
    const cp = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyMatrix4(m);
    const cdir = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).transformDirection(m);
    b.lathe(
      [
        [0.125, 0],
        [0.14, 0],
        [0.145, 0.075],
        [0.13, 0.075],
      ],
      { at: cp(0, 0, 0), axis: cdir(0, 1, 0), segments: 16, color: CGOLD, bone: base },
    );
    b.lathe(
      [
        [0, 0],
        [0.12, 0],
        [0.115, 0.03],
        [0.09, 0.075],
        [0.04, 0.1],
        [0, 0.105],
      ],
      { at: cp(0, 0.04, 0), axis: cdir(0, 1, 0), segments: 12, color: cel("#b5173f"), bone: base },
    );
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const tall = k % 2 === 0;
      const len = tall ? 0.12 : 0.07;
      const s = Math.sin(a);
      const c = Math.cos(a);
      b.spike(cp(0.138 * s, 0.07, 0.138 * c), cp(0.15 * s, 0.07 + len, 0.15 * c), null, 0.03, { color: CGOLD, sides: 5, bone: base });
      glow(
        P(new THREE.SphereGeometry(tall ? 0.017 : 0.012, 6, 4), tall ? RUBY : TOPAZ, {
          at: cp(0.15 * s, 0.07 + len + 0.01, 0.15 * c),
        }),
      );
    }
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      glow(
        P(new THREE.OctahedronGeometry(0.026, 0), k % 2 ? EMERALD : SAPPHIRE, {
          at: cp(0.147 * Math.sin(a), 0.037, 0.147 * Math.cos(a)),
          dir: cdir(Math.sin(a), 0, Math.cos(a)),
          flat: true,
          scale: [1, 0.7, 1.3],
        }),
      );
    }
    const ringPts = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return cp(0.145 * Math.sin(a), 0.075, 0.145 * Math.cos(a));
    });
    b.sweep(catmull(ringPts, { closed: true }), 0.008, { color: CGOLDL, bone: base });
    const ringLow = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return cp(0.142 * Math.sin(a), 0.008, 0.142 * Math.cos(a));
    });
    b.sweep(catmull(ringLow, { closed: true }), 0.007, { color: CGOLDL, bone: base });
  }

  // ---- goblets
  const GOBLET: Array<[number, number]> = [
    [0, 0],
    [0.055, 0],
    [0.055, 0.01],
    [0.02, 0.03],
    [0.014, 0.06],
    [0.026, 0.085],
    [0.014, 0.105],
    [0.02, 0.115],
    [0.05, 0.15],
    [0.06, 0.185],
    [0.055, 0.2],
    [0.048, 0.2],
    [0.053, 0.185],
    [0.043, 0.15],
    [0, 0.13],
  ];
  const goblet = (x: number, z: number, paintC: ReturnType<typeof cel>, gemC: string) => {
    const y0 = groundY(x, z) - 0.01;
    b.lathe(GOBLET, { at: [x, y0, z], segments: 12, color: paintC, bone: base });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      glow(P(new THREE.SphereGeometry(0.012, 6, 4), gemC, { at: [x + 0.058 * Math.sin(a), y0 + 0.17, z + 0.058 * Math.cos(a)] }));
    }
    const rim = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return new THREE.Vector3(x + 0.054 * Math.sin(a), y0 + 0.198, z + 0.054 * Math.cos(a));
    });
    b.sweep(catmull(rim, { closed: true }), 0.005, { color: GOLD_L, bone: base });
    glow(P(new THREE.OctahedronGeometry(0.014, 0), gemC, { at: [x, y0 + 0.085, z], flat: true, scale: [1.3, 1, 1.3] }));
  };
  goblet(-0.5, 0.2, CGOLD, RUBY);
  goblet(-0.62, 0.62, CSILVER, SAPPHIRE);
  // tipped goblet, coins spilling from its rim
  {
    const x = -0.4;
    const z = 0.82;
    const y0 = groundY(x, z) + 0.04;
    b.lathe(GOBLET, { at: [x, y0, z], axis: [0.94, 0.34, 0.05], segments: 12, color: CGOLD, bone: base });
    for (let i = 0; i < 7; i++) {
      const px = x + 0.2 + i * 0.045 + (rand() - 0.5) * 0.03;
      const pz = z + (rand() - 0.5) * 0.14;
      addCoin(i % 2 ? GOLD : GOLD_L, new THREE.Vector3(px, groundY(px, pz) + 0.005, pz), new THREE.Vector3(0, 1, 0));
    }
  }

  // ---- ingots
  {
    const ingot = [
      [-0.09, 0],
      [0.09, 0],
      [0.07, 0.045],
      [-0.07, 0.045],
    ] as Array<[number, number]>;
    const gx = 0.66;
    const gz = 0.28;
    const y0 = groundY(gx, gz) - 0.01;
    const yaw = 0.3;
    const X: [number, number, number] = [Math.cos(yaw), 0, -Math.sin(yaw)];
    const place = (dx: number, dy: number, color: ReturnType<typeof cel>) =>
      b.extrude(ingot, {
        at: [gx + dx * X[0], y0 + dy, gz + dx * X[2]],
        x: X,
        thickness: 0.07,
        bevel: 0.008,
        color,
        bone: base,
      });
    place(-0.1, 0, CGOLD);
    place(0.1, 0, CGOLD);
    place(0, 0.045, CSILVER);
  }

  // ring
  {
    const rx = -0.05;
    const rz = 0.72;
    const ry = groundY(rx, rz) + 0.03;
    P(new THREE.TorusGeometry(0.03, 0.007, 6, 12), GOLD, { at: [rx, ry, rz], rotation: [75, 20, 0] });
    glow(P(new THREE.OctahedronGeometry(0.015, 0), SAPPHIRE, { at: [rx + 0.004, ry + 0.03, rz - 0.008], flat: true }));
  }

  // ---- coin sack
  {
    const sx = 0.9;
    const sz = -0.6;
    b.lathe(
      [
        [0, 0],
        [0.15, 0],
        [0.2, 0.08],
        [0.18, 0.18],
        [0.1, 0.27],
        [0.05, 0.31],
        [0.05, 0.33],
        [0.11, 0.4],
        [0.09, 0.4],
        [0, 0.36],
      ],
      { at: [sx, 0, sz], segments: 12, color: cel("#a8662e"), bone: base },
    );
    const tie = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return new THREE.Vector3(sx + 0.056 * Math.sin(a), 0.325, sz + 0.056 * Math.cos(a));
    });
    b.sweep(catmull(tie, { closed: true }), 0.012, { color: GOLD, bone: base });
    b.spike([sx + 0.03, 0.325, sz + 0.06], [0.2, -1, 0.3], 0.07, 0.012, { color: GOLD, sides: 5, bone: base });
    b.spike([sx - 0.02, 0.325, sz + 0.06], [-0.2, -1, 0.3], 0.06, 0.012, { color: GOLD, sides: 5, bone: base });
    P(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", { at: [sx, 0.14, sz + 0.19], dir: [0, 0, 1], axis: "z", texture: gemEmblem });
  }

  // ---- crystal cluster
  {
    const cx = -0.85;
    const cz = -0.7;
    const list: Array<[number, number, number, number, number, number, string, string]> = [
      [0, 0, 0.7, 0.08, 0.1, 0.05, "#6a24e8", "#c99bff"],
      [0.12, 0.1, 0.5, 0.06, 0.4, 0.3, "#2f6dff", "#9fd0ff"],
      [-0.12, 0.08, 0.45, 0.055, -0.5, 0.2, "#8a30ff", "#d6a8ff"],
      [0.05, -0.14, 0.38, 0.05, 0.2, -0.6, "#1fb3ff", "#a6f0ff"],
      [-0.06, 0.18, 0.3, 0.045, -0.2, 0.7, "#c040ff", "#f0c0ff"],
      [0.2, -0.05, 0.28, 0.04, 0.8, 0.0, "#4a52ff", "#a8b0ff"],
    ];
    for (const [dx, dz, len, r, lx, lz, c0, c1] of list) {
      glow(
        b.spike([cx + dx, 0.04, cz + dz], [lx, 1, lz], len, r, {
          sides: 6,
          bands: [
            [0.6, c0],
            [1, c1],
          ],
          bone: base,
        }),
        1.1,
      );
    }
  }

  // ---- scattered gems
  skin.scatter(22, {
    rng: rng(21),
    minDist: 0.12,
    filter: (h) => h.n.y > 0.35 && h.at.y > 0.05 && awayFromChest(h.at.x, h.at.z),
  }).forEach((h, i) => {
    const s = 0.7 + rand() * 0.7;
    glow(
      P(new THREE.OctahedronGeometry(0.035 * s, 0), GEMS[i % 5], {
        at: h.at.clone().addScaledVector(h.n, 0.015),
        dir: h.n,
        flat: true,
        scale: [1, 1.4, 1],
      }),
    );
  });
  for (const [x, z, c] of [
    [0.3, 1.0, RUBY],
    [0.7, 0.55, SAPPHIRE],
    [-0.15, 1.0, EMERALD],
  ] as Array<[number, number, string]>)
    glow(
      P(new THREE.OctahedronGeometry(0.07, 0), c, {
        at: [x, groundY(x, z) + 0.06, z],
        flat: true,
        scale: [1, 1.3, 1],
        rotation: [10, x * 90, 8],
      }),
      1.3,
    );

  // merged coins
  for (const [color, geos] of coinsBy) P(mergeGeometries(geos)!, color, { at: [0, 0, 0] });

  b.pose(lidHinge, { axis: [1, 0, 0], deg: -105 });
  return b.root;
}
