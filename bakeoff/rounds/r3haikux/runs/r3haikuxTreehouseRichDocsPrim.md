```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  lerp,
  catmull,
  mottle,
  stripes,
  scales,
  spots,
  grain,
  paint,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Oak treehouse",
  description:
    "A cosy red-roofed cabin with a round window in a thick old oak on a grassy round base, with a rope ladder, a swing, a lantern, a pennant, a bicycle and mushrooms.",
};

export default function build() {
  const b = createBuilder({ name: "oak-treehouse" });
  b.joint("ground", { at: [0, 0, 0] });

  // ---- flat colours
  const EARTH = "#7a5a3b", TRIM = "#f3e7c9", DARK_WOOD = "#5b3d24", ROPE = "#dcc592";
  const IRON = "#3c3a38", BRASS = "#d1a84f", GLOW = "#ffd66b", STEM = "#4f9b3d";
  const STONE = "#8e8c87", WHITE = "#fbf6ea", PINK = "#f28bab", RED = "#e2474c";
  const YELLOW = "#ffd43d", LILAC = "#b79cf2", BIKE = "#2f70b0", TIRE = "#222222";
  const SILVER = "#c6ccd3", SEAT = "#2a2a2c", WICKER = "#c99c5f", MUSH_STEM = "#f4ecd9";
  const ROOF_DARK = "#7b2418", FLAG_RED = "#c8382d", FLAG_YELLOW = "#f6c744";

  // ---- paints
  const grassPaint = mottle("#8cc65f", "#5c9c43", { size: 0.5, contrast: 0.8, seed: 2 });
  const bark = grain("#5d4130", "#8b6647", { size: 0.07, axis: "y", seed: 3 });
  const foliage = mottle("#55a84a", "#2c7035", { size: 0.7, contrast: 0.9, seed: 5 });
  const planks = stripes("#c58e5a", "#9a6839", { size: 0.16, axis: "x", seed: 1 });
  const boards = stripes("#d2a171", "#a36f43", { size: 0.2, axis: "z", seed: 6 });
  const shingles = scales("#c0412f", "#7d2317", { size: 0.1, seed: 4 });
  const capSpots = spots("#d9483b", "#f7f1e3", { size: 0.06, amount: 0.35, seed: 8 });
  const doorPaint = stripes("#7b4f2e", "#5c3b21", { size: 0.14, axis: "x", seed: 9 });
  const flagPaint = paint((_p, _n, s) => (s[1] < 0.12 ? FLAG_RED : FLAG_YELLOW));

  // ---- textures (white drawings take the paint they are tinted with)
  const leafTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
  <path fill="#ffffff" d="M16 1C18 4 19 6 22 7C20 9 25 11 26 13C22 15 27 17 25 19C23 21 28 23 25 26C22 28 23 31 20 33C18 35 17 37 16 39C15 37 14 35 12 33C9 31 10 28 7 26C4 23 9 21 7 19C5 17 10 15 6 13C7 11 12 9 10 7C13 6 14 4 16 1Z"/>
  <path fill="none" stroke="#b4b4b4" stroke-width="1.2" stroke-linecap="round" d="M16 3V37M16 12L9 9M16 12L23 9M16 22L8 18M16 22L24 18M16 31L11 28M16 31L21 28"/>
</svg>`,
    { size: 160 },
  );
  const tuftTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#ffffff" d="M1 24Q3 13 7 3Q8 13 10 24ZM8 24Q9 12 12 1Q13 12 15 24ZM13 24Q15 14 19 6Q18 15 20 24ZM17 24Q19 17 23 12Q21 18 22 24Z"/>
</svg>`,
    { size: 128 },
  );

  const G = 0.34; // grass top
  const FLOOR = 2.9; // platform top = cabin floor
  const EAVE = FLOOR + 1.8; // top of walls
  const RIDGE = EAVE + 1.0; // roof ridge
  const CZ = 0.75; // cabin centre z
  const DX = -0.45; // door x
  const BX = -1.35; // bicycle centre x
  const BZ = 2.1; // bicycle z

  // ---- 1. base: earth disc with a grassy top
  b.lathe([[0, 0], [3.0, 0], [3.0, 0.16], [2.9, 0.26], [0, 0.26]], {
    at: [0, 0, 0],
    segments: 24,
    color: EARTH,
  });
  const grass = b.lathe([[0, 0.25], [2.92, 0.25], [2.92, G], [0, G]], {
    at: [0, 0, 0],
    segments: 24,
    color: grassPaint,
  });

  // ---- 2. the oak: flared trunk, roots, limbs
  b.lathe(
    [[0, 0.1], [0.68, 0.1], [0.62, 0.34], [0.46, 0.72], [0.38, 1.5], [0.34, 2.8], [0.3, 4.0], [0.25, 4.7], [0.22, 5.2], [0, 5.2]],
    { at: [0, 0, 0], segments: 10, smoothing: 1, color: bark },
  );
  for (const deg of [115, 200, 300]) {
    const a = (deg * Math.PI) / 180;
    const p = (r: number, y: number) => [Math.cos(a) * r, y, Math.sin(a) * r];
    b.sweep(catmull([p(0.3, 0.3), p(0.72, 0.4), p(1.05, 0.33), p(1.32, 0.2)]), [0.1, 0.04], { color: bark });
  }
  b.sweep(catmull([[0.1, 4.2, -0.1], [0.9, 4.9, -0.5], [1.9, 5.6, -0.9], [2.6, 6.5, -1.0]]), [0.21, 0.07], { color: bark });
  b.sweep(catmull([[-0.1, 4.3, -0.2], [-0.9, 5.1, -0.6], [-1.8, 6.0, -0.9], [-2.3, 6.9, -0.9]]), [0.2, 0.06], { color: bark });
  b.sweep(catmull([[0, 5.0, -0.2], [0.1, 5.5, -0.45], [0.25, 6.3, -0.75], [0.3, 7.3, -0.9]]), [0.16, 0.05], { color: bark });
  // low limb that carries the swing
  b.sweep(catmull([[-0.15, 3.1, -0.2], [-1.0, 3.35, -0.55], [-1.9, 3.5, -0.6], [-2.9, 3.45, -0.6]]), [0.17, 0.07], { color: bark });

  // ---- 3. the crown: lumpy low-poly clumps, kept clear of the cabin and the flag
  const CR = rng(7);
  const lobes: ReturnType<typeof b.part>[] = [];
  for (let i = 0; i < 240; i++) {
    const x = CR() * 2 - 1;
    const y = CR() * 2 - 1;
    const z = CR() * 2 - 1;
    if (x * x + y * y + z * z > 1) continue;
    const k = 0.6 + 0.4 * CR();
    const px = x * 3.1 * k;
    const py = 6.6 + y * 1.6 * k;
    const pz = -0.7 + z * 2.2 * k;
    if (py < 5.0) continue;
    if (Math.abs(px) < 1.55 && py < 6.1 && pz > -0.55 && pz < 2.2) continue; // cabin and roof
    if (pz > 1.0 && py < 7.9 && Math.abs(px) < 2.4) continue; // keep the front and the flag clear
    const rad = 0.5 + 0.3 * CR();
    const geo = new THREE.IcosahedronGeometry(rad, 0).scale(1, 0.8 + 0.3 * CR(), 1);
    lobes.push(b.part(geo, foliage, { at: [px, py, pz], flat: true }));
  }
  // oak leaves as cut-out cards on the clumps
  const leafHits = b.surface(lobes).scatter(340, {
    rng: rng(9),
    minDist: 0.13,
    filter: (h) => h.n.y > -0.35,
  });
  b.cards(leafHits, leafTex, {
    size: [0.24, 0.28],
    lean: 35,
    bend: 25,
    vary: 0.25,
    spin: 25,
    rng: rng(10),
    color: foliage,
    flow: (f) => [f.axis.x, -0.5, f.axis.z],
  });

  // ---- 4. platform, braces and railing
  b.part(new THREE.BoxGeometry(2.8, 0.14, 2.4), boards, { at: [0, FLOOR - 0.07, CZ + 0.05] });
  for (const s of [1, -1]) b.rod([s * 0.25, 2.1, 0.1], [s * 1.2, 2.8, 0.6], 0.05, { color: DARK_WOOD });
  b.rod([-1.35, 3.35, 2.0], [0.3, 3.35, 2.0], 0.03, { color: DARK_WOOD });
  for (const s of [1, -1]) {
    b.rod([s * 1.35, 3.35, 2.0], [s * 1.35, 3.35, 0.0], 0.03, { color: DARK_WOOD });
    b.rod([s * 1.35, FLOOR, 2.0], [s * 1.35, 3.35, 2.0], 0.035, { color: DARK_WOOD });
    b.rod([s * 1.35, FLOOR, 0.0], [s * 1.35, 3.35, 0.0], 0.035, { color: DARK_WOOD });
  }
  b.rod([-1.35, FLOOR, 2.0], [-1.35, 3.35, 2.0], 0.035, { color: DARK_WOOD });
  b.rod([0.3, FLOOR, 2.0], [0.3, 3.35, 2.0], 0.035, { color: DARK_WOOD });

  // ---- 5. cabin walls, corner boards, door
  b.part(new THREE.BoxGeometry(2.2, 1.8, 1.9), planks, { at: [0, FLOOR + 0.9, CZ] });
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.12, 1.82, 0.12), TRIM, { at: [sx * 1.1, FLOOR + 0.9, CZ + sz * 0.95] });
    }
  }
  b.part(new THREE.BoxGeometry(0.62, 1.36, 0.06), doorPaint, { at: [DX, FLOOR + 0.68, 1.73] });
  b.part(new THREE.BoxGeometry(0.8, 0.09, 0.07), TRIM, { at: [DX, FLOOR + 1.4, 1.76] });
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.09, 1.36, 0.07), TRIM, { at: [DX + sx * 0.355, FLOOR + 0.68, 1.76] });
  }
  b.part(new THREE.SphereGeometry(0.035, 6, 4), BRASS, { at: [DX + 0.22, FLOOR + 0.72, 1.8] });

  // ---- 6. side windows with flower boxes
  for (const s of [1, -1]) {
    const x = s * 1.12;
    b.part(new THREE.BoxGeometry(0.04, 0.5, 0.5), GLOW, { at: [s * 1.11, 4.1, CZ] });
    b.part(new THREE.BoxGeometry(0.07, 0.07, 0.62), TRIM, { at: [x, 4.37, CZ] });
    b.part(new THREE.BoxGeometry(0.07, 0.07, 0.62), TRIM, { at: [x, 3.83, CZ] });
    b.part(new THREE.BoxGeometry(0.07, 0.6, 0.07), TRIM, { at: [x, 4.1, CZ - 0.285] });
    b.part(new THREE.BoxGeometry(0.07, 0.6, 0.07), TRIM, { at: [x, 4.1, CZ + 0.285] });
    b.part(new THREE.BoxGeometry(0.07, 0.03, 0.58), TRIM, { at: [s * 1.13, 4.1, CZ] });
    b.part(new THREE.BoxGeometry(0.07, 0.5, 0.03), TRIM, { at: [s * 1.13, 4.1, CZ] });
    b.part(new THREE.BoxGeometry(0.12, 0.14, 0.7), DARK_WOOD, { at: [s * 1.16, 3.62, CZ] });
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.SphereGeometry(0.06, 6, 4), [PINK, RED, YELLOW, LILAC][i], {
        at: [s * 1.16, 3.76, CZ - 0.27 + i * 0.18],
      });
    }
  }

  // ---- 7. front gable with the round window
  b.extrude([[-1.12, 0], [1.12, 0], [0, 1.04]], {
    at: [0, EAVE, 1.72],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.12,
    color: planks,
  });
  b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 12), GLOW, { at: [0, 5.0, 1.79], dir: [0, 0, 1] });
  b.part(new THREE.TorusGeometry(0.28, 0.04, 6, 14), TRIM, { at: [0, 5.0, 1.82] });
  b.part(new THREE.BoxGeometry(0.5, 0.04, 0.04), TRIM, { at: [0, 5.0, 1.83] });
  b.part(new THREE.BoxGeometry(0.04, 0.5, 0.04), TRIM, { at: [0, 5.0, 1.83] });

  // ---- 8. shingled roof, ridge cap, pennant
  const run = 1.25;
  const rise = 1.0;
  const ang = Math.atan2(rise, run);
  const angDeg = (ang * 180) / Math.PI;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(1.8, 0.1, 2.3), shingles, {
      at: [s * (run / 2 + Math.sin(ang) * 0.05), EAVE + rise / 2 + Math.cos(ang) * 0.05, CZ],
      rotation: [0, 0, -s * angDeg],
    });
  }
  b.part(new THREE.BoxGeometry(0.16, 0.1, 2.36), ROOF_DARK, { at: [0, RIDGE + 0.06, CZ] });

  b.rod([0, RIDGE + 0.05, 1.4], [0, 6.85, 1.4], 0.025, { color: IRON });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), BRASS, { at: [0, 6.87, 1.4] });
  b.extrude([[0, 0], [0.85, 0.17, "sharp"], [0, 0.34]], {
    at: [0, 6.35, 1.4],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    color: flagPaint,
  });

  // ---- 9. lantern beside the door
  b.rod([0.6, 3.98, 1.7], [0.6, 3.98, 2.05], 0.02, { color: IRON });
  b.rod([0.6, 3.98, 2.05], [0.6, 3.9, 2.05], 0.008, { color: IRON });
  b.part(new THREE.CylinderGeometry(0.1, 0.08, 0.22, 6), GLOW, { at: [0.6, 3.73, 2.05] });
  b.part(new THREE.CylinderGeometry(0.03, 0.12, 0.08, 6), IRON, { at: [0.6, 3.87, 2.05] });
  b.part(new THREE.CylinderGeometry(0.08, 0.11, 0.03, 6), IRON, { at: [0.6, 3.62, 2.05] });
  b.part(new THREE.SphereGeometry(0.025, 5, 4), IRON, { at: [0.6, 3.93, 2.05] });

  // ---- 10. rope ladder from the platform edge to the grass
  const topL = [0.72, 2.9, 2.02];
  const topR = [1.06, 2.9, 2.02];
  const botL = [0.7, 0.42, 2.7];
  const botR = [1.04, 0.42, 2.7];
  b.part(new THREE.BoxGeometry(0.5, 0.1, 0.1), DARK_WOOD, { at: [0.89, 2.93, 2.05] });
  b.rod(topL, botL, 0.014, { color: ROPE });
  b.rod(topR, botR, 0.014, { color: ROPE });
  for (let i = 1; i <= 8; i++) {
    const t = i / 9;
    b.rod(lerp(topL, botL, t), lerp(topR, botR, t), 0.02, { color: DARK_WOOD });
  }

  // ---- 11. wooden swing from the low limb
  b.part(new THREE.BoxGeometry(0.78, 0.045, 0.24), planks, { at: [-2.2, 1.32, -0.6] });
  for (const x of [-2.5, -1.9]) b.rod([x, 3.47, -0.6], [x, 1.36, -0.6], 0.012, { color: ROPE });

  // ---- 12. bicycle leaning at the foot of the tree
  const at3 = (dx: number, dy: number, dz = 0): [number, number, number] => [BX + dx, G + dy, BZ + dz];
  const rear = at3(-0.5, 0.33);
  const front = at3(0.5, 0.33);
  const bb = at3(-0.1, 0.33);
  const seatTop = at3(-0.33, 0.9);
  const headTop = at3(0.36, 0.95);
  const headBot = at3(0.42, 0.62);
  for (const hub of [rear, front]) {
    b.part(new THREE.TorusGeometry(0.3, 0.03, 6, 14), TIRE, { at: hub });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 8), SILVER, { at: hub, dir: [0, 0, 1] });
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      b.rod(hub, [hub[0] + 0.3 * Math.cos(a), hub[1] + 0.3 * Math.sin(a), hub[2]], 0.005, { color: SILVER });
    }
  }
  const tube = (p: number[], q: number[], r = 0.018) => b.rod(p, q, r, { color: BIKE });
  tube(bb, rear);
  tube(bb, seatTop);
  tube(seatTop, headTop);
  tube(bb, headBot);
  tube(headBot, headTop, 0.024);
  tube(headBot, front);
  tube(rear, seatTop);
  b.part(new THREE.BoxGeometry(0.22, 0.04, 0.1), SEAT, { at: at3(-0.36, 0.98) });
  b.rod(headTop, at3(0.39, 1.1), 0.02, { color: SILVER });
  b.rod(at3(0.38, 1.1, -0.24), at3(0.4, 1.1, 0.24), 0.016, { color: SEAT });
  b.part(new THREE.TorusGeometry(0.075, 0.008, 4, 10), SILVER, { at: at3(-0.1, 0.33, 0.06) });
  b.rod(at3(-0.1, 0.33, 0.07), at3(0.0, 0.2, 0.12), 0.012, { color: SILVER });
  b.part(new THREE.BoxGeometry(0.06, 0.03, 0.06), SEAT, { at: at3(0.0, 0.2, 0.13) });
  // wicker basket with a little bunch of flowers
  b.lathe(
    [[0, 0], [0.1, 0], [0.13, 0.13], [0.145, 0.15], [0.125, 0.15], [0.1, 0.03], [0, 0.03]],
    { at: at3(0.56, 0.84), segments: 10, color: WICKER },
  );
  b.rod(at3(0.39, 1.05), at3(0.56, 0.84), 0.012, { color: IRON });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), PINK, { at: at3(0.52, 1.0, 0.04) });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), YELLOW, { at: at3(0.58, 1.02, -0.05) });

  // ---- 13. mushrooms at the foot of the tree
  const mushroom = (x: number, z: number, s: number) => {
    b.lathe(
      [[0, 0], [0.03 * s, 0], [0.04 * s, 0.06 * s], [0.03 * s, 0.13 * s], [0, 0.13 * s]],
      { at: [x, G, z], segments: 7, color: MUSH_STEM },
    );
    const r = 0.1 * s;
    b.lathe(
      [[0, 0], [r, 0], [r * 1.08, r * 0.25], [r * 0.9, r * 0.62], [r * 0.5, r * 0.9], [0, r * 0.95]],
      { at: [x, G + 0.13 * s, z], segments: 9, smoothing: 1, color: capSpots },
    );
  };
  mushroom(0.95, 0.4, 1.0);
  mushroom(1.2, 0.12, 0.6);
  mushroom(0.72, 0.92, 0.7);
  mushroom(1.0, -0.7, 0.8);
  mushroom(-0.55, -1.0, 0.8);
  mushroom(-1.1, 0.35, 0.6);

  // ---- 14. stones, wildflowers and grass tufts
  for (const [x, z, r] of [[2.2, -1.1, 0.2], [-1.85, -1.5, 0.14], [2.35, 0.8, 0.12], [-0.2, 2.45, 0.1]]) {
    b.part(new THREE.IcosahedronGeometry(r, 0).scale(1, 0.6, 1), STONE, { at: [x, G, z], flat: true });
  }
  const FR = rng(41);
  for (let i = 0; i < 20; i++) {
    const a = FR() * Math.PI * 2;
    const d = 1.5 + FR() * 1.2;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const k = Math.floor(FR() * 5);
    if (Math.abs(x - BX) < 1.0 && Math.abs(z - BZ) < 0.8) continue; // bicycle
    if (x > 0.3 && z > 1.2 && x < 1.6) continue; // ladder
    if (x < -1.5 && z < 0.2 && z > -1.2) continue; // swing
    b.rod([x, G, z], [x, G + 0.16, z], 0.006, { color: STEM });
    b.part(new THREE.IcosahedronGeometry(0.045, 0), [PINK, YELLOW, LILAC, RED, WHITE][k], {
      at: [x, G + 0.18, z],
      flat: true,
    });
  }
  b.cards(
    b.surface(grass).scatter(260, {
      rng: rng(31),
      minDist: 0.12,
      filter: (h) => h.n.y > 0.7 && Math.hypot(h.at.x, h.at.z) > 0.8,
    }),
    tuftTex,
    { size: [0.16, 0.13], lean: 0, vary: 0.3, spin: 60, rng: rng(32), color: grassPaint },
  );

  return b.root;
}
```