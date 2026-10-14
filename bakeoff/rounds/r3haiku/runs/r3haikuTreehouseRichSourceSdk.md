```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  grain,
  gradient,
  mottle,
  rng,
  scales,
  spots,
  stripes,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Treehouse diorama",
  description:
    "A round grassy base with a thick old oak, a red-shingled treehouse with a round window, a rope ladder, a swing, a pennant, a lantern, mushrooms and a bicycle.",
};

const leafTexture = (fill: string, vein: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<path d="M50 3 C94 26 92 76 50 97 C8 76 6 26 50 3Z" fill="${fill}"/>` +
      `<path d="M50 12 Q57 50 50 88" stroke="${vein}" stroke-width="5" fill="none" stroke-linecap="round"/>` +
      `</svg>`,
    { size: 128 },
  );

export default function treehouse() {
  const b = createBuilder({ name: "treehouse", paintSize: 2048 });
  const rand = rng(11);
  const root = b.joint("root", { at: [0, 0, 0] });
  const rope = "#d8b27a";
  const plankBrown = "#8a5a34";
  const rod = (p: number[], q: number[], r: number, color: string) => b.rod(p, q, r, { color });

  // ---- Ground: soil drum with a grassy lid -------------------------------------------------------------
  const soil = mottle("#7a5234", "#4a301d", { size: 0.22, contrast: 1.2 });
  const grass = mottle("#4f9a3a", "#86c852", { size: 0.3 });
  b.part(new THREE.CylinderGeometry(2.3, 2.2, 0.22, b.segments(32)), soil, { at: [0, 0.11, 0], bone: root });
  b.part(new THREE.CylinderGeometry(2.36, 2.3, 0.08, b.segments(32)), grass, { at: [0, 0.26, 0], bone: root });

  // ---- The oak -----------------------------------------------------------------------------------------
  const bark = grain("#8b5b36", "#5a3921", { size: 0.07, axis: "y" });
  const trunkPath = catmull([
    [0, 0.1, 0],
    [0.02, 1.2, 0.02],
    [-0.02, 2.2, 0.0],
    [-0.06, 3.1, 0.0],
  ]);
  const trunk = b.sweep(trunkPath, {
    radius: (t: number) => 0.3 - 0.13 * t,
    color: bark,
    sides: 10,
    name: "trunk",
  });

  const limb = (name: string, t: number, deg: number, tip: number[], lift = 0.35, r: [number, number] = [0.1, 0.04]) => {
    const on = trunk.at(t, deg);
    const start = on.at;
    const mid = start.clone().lerp(new THREE.Vector3(...tip), 0.5).add(new THREE.Vector3(0, lift, 0));
    return b.sprout(name, on, catmull([start, mid, tip]), r, { color: bark, sides: 7 });
  };
  limb("limbA", 0.55, 60, [-1.5, 3.1, -0.3]);
  limb("limbB", 0.7, 200, [1.6, 3.5, -0.4]);
  limb("limbC", 0.92, 180, [-0.2, 4.3, -0.5]);
  limb("limbD", 0.8, 90, [-1.0, 3.8, 0.8]);
  limb("limbE", 0.9, 0, [0.6, 4.7, -0.3]);
  // The swing's branch, out to the left.
  limb("limbS", 0.45, 240, [-1.8, 2.6, 0.35], 0.1, [0.07, 0.03]);

  // ---- Crown: blobs under a skirt of leaf cards ---------------------------------------------------------
  const leafA = leafTexture("#4fa53a", "#2c6e2a");
  const leafB = leafTexture("#7cc453", "#3f8a35");
  const foliage = mottle("#2f6e33", "#4f9a40", { size: 0.35 });
  const inCabin = (p: number[]) => p[0] > 0.1 && p[0] < 2.1 && p[1] > 2.4 && p[1] < 4.9 && p[2] > -0.6 && p[2] < 1.25;
  const crowns: number[][] = [
    [-1.5, 3.2, -0.4, 0.95],
    [1.7, 3.6, -0.5, 1.0],
    [-0.2, 4.4, -0.6, 1.1],
    [-1.0, 3.9, 0.9, 0.85],
    [0.6, 4.9, -0.3, 0.8],
  ];
  for (const [x, y, z, R] of crowns) {
    b.part(new THREE.IcosahedronGeometry(R * 0.9, 1), foliage, { at: [x, y, z] });
    const frames = [] as ReturnType<typeof frame>[];
    for (let i = 0; i < 60; i++) {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const dir = [s * Math.cos(a), u, s * Math.sin(a)];
      const d = R * (0.75 + 0.3 * rand());
      const at = [x + dir[0] * d, y + dir[1] * d, z + dir[2] * d];
      if (at[1] < 2.5 || inCabin(at)) continue;
      frames.push(frame(at, dir));
    }
    b.cards(frames, [leafA, leafB], { size: 0.36, lean: 30, spin: 180, vary: 0.25, cross: true, rng: rand });
  }

  // ---- Treehouse ---------------------------------------------------------------------------------------
  const cx = 1.1;
  const cz = 0.2;
  const base = 2.51;
  const wall = stripes("#e2aa6c", ["#c98c52"], { size: 0.16, axis: "x", width: 0.45 });
  const roof = scales(["#d24b3c", "#b53a2e"], "#6e2019", { size: 0.16, width: 0.16 });

  // Platform and its brace to the trunk.
  b.part(new THREE.BoxGeometry(1.6, 0.12, 2.0), "#a8703f", { at: [cx, base - 0.06, cz] });
  rod([0.15, 1.95, 0.05], [0.9, 2.44, 0.1], 0.035, plankBrown);

  // Walls and gable.
  b.part(new THREE.BoxGeometry(1.8, 1.3, 1.5), wall, { at: [cx, base + 0.65, cz] });
  b.extrude(
    [
      [-0.9, 0],
      [0.9, 0],
      [0, 0.75],
    ],
    { color: wall, at: [cx, base + 1.3, cz], x: [1, 0, 0], y: [0, 1, 0], thickness: 1.5 },
  );

  // Roof: two shingled slopes meeting at the ridge.
  const pitch = Math.atan2(0.8, 1.15);
  const slope = Math.hypot(1.15, 0.8) + 0.1;
  const deg = (r: number) => (r * 180) / Math.PI;
  const roofY = base + 1.3 + 0.45;
  b.part(new THREE.BoxGeometry(slope, 0.06, 2.1), roof, {
    at: [cx + 0.575 + 0.023, roofY + 0.033, cz],
    rotation: [0, 0, -deg(pitch)],
  });
  b.part(new THREE.BoxGeometry(slope, 0.06, 2.1), roof, {
    at: [cx - 0.575 - 0.023, roofY + 0.033, cz],
    rotation: [0, 0, deg(pitch)],
  });

  // Round window in the gable, with a cross of mullions.
  const winZ = cz + 0.76;
  const winY = base + 1.3 + 0.37;
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, b.segments(14)), plankBrown, {
    at: [cx, winY, winZ],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.05, b.segments(14)), "#ffd66b", {
    at: [cx, winY, winZ + 0.03],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.34, 0.03, 0.03), plankBrown, { at: [cx, winY, winZ + 0.05] });
  b.part(new THREE.BoxGeometry(0.03, 0.34, 0.03), plankBrown, { at: [cx, winY, winZ + 0.05] });

  // Door and knob.
  b.part(new THREE.BoxGeometry(0.42, 0.92, 0.05), "#7a4a2a", { at: [cx - 0.4, base + 0.46, cz + 0.8] });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), "#f3c94c", { at: [cx - 0.3, base + 0.46, cz + 0.84] });

  // Lantern on a post beside the door.
  const lanternAt = [0.35, 3.52, 1.1];
  b.part(new THREE.BoxGeometry(0.06, 1.0, 0.06), plankBrown, { at: [0.35, base + 0.5, 1.1] });
  b.lathe(
    [
      [0, 0],
      [0.1, 0.02],
      [0.12, 0.13],
      [0.1, 0.22],
      [0, 0.24],
    ],
    {
      color: gradient("#ffe08a", "#ff9e3d", [0.35, 3.5, 1.1], [0.35, 3.76, 1.1]),
      at: lanternAt,
    },
  );
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.05, 0.1],
      [0, 0.12],
    ],
    { color: "#3a2a20", at: [0.35, 3.76, 1.1] },
  );

  // Pennant on the ridge.
  rod([cx, 4.62, cz], [cx, 5.5, cz], 0.02, plankBrown);
  b.slab(
    [
      [cx + 0.01, 5.48, cz],
      [cx + 0.55, 5.36, cz],
      [cx + 0.01, 5.2, cz],
    ],
    { color: stripes("#d9473b", ["#f3d04a"], { size: 0.12, axis: "x" }), thickness: 0.02 },
  );

  // Rope ladder down the right side of the platform.
  rod([1.35, 0.24, 1.25], [1.35, 2.5, 1.25], 0.016, rope);
  rod([1.62, 0.24, 1.25], [1.62, 2.5, 1.25], 0.016, rope);
  for (let i = 0; i < 11; i++) {
    const y = 0.45 + i * 0.19;
    rod([1.35, y, 1.25], [1.62, y, 1.25], 0.012, plankBrown);
  }

  // Wooden swing hanging from the left branch.
  rod([-2.0, 2.6, 0.35], [-1.6, 2.6, 0.35], 0.035, plankBrown);
  rod([-1.95, 2.58, 0.35], [-1.95, 1.52, 0.35], 0.012, rope);
  rod([-1.65, 2.58, 0.35], [-1.65, 1.52, 0.35], 0.012, rope);
  b.part(new THREE.BoxGeometry(0.5, 0.04, 0.2), "#b07a45", { at: [-1.8, 1.5, 0.35] });

  // ---- Bicycle at the foot of the tree -----------------------------------------------------------------
  const bx = -0.7;
  const bz = -1.1;
  const hubY = 0.57;
  const tyre = new THREE.TorusGeometry(0.28, 0.03, 6, 16).rotateY(Math.PI / 2);
  b.part(tyre, "#1d1d1d", { at: [bx, hubY, bz - 0.5] });
  b.part(tyre, "#1d1d1d", { at: [bx, hubY, bz + 0.5] });
  const bikeBlue = "#2a7fd0";
  const R = [bx, hubY, bz - 0.5];
  const F = [bx, hubY, bz + 0.5];
  const BB = [bx, 0.6, bz - 0.05];
  const S = [bx, 0.98, bz - 0.3];
  const H = [bx, 0.95, bz + 0.36];
  b.rod(R, BB, 0.02, { color: bikeBlue });
  b.rod(BB, S, 0.02, { color: bikeBlue });
  b.rod(S, H, 0.02, { color: bikeBlue });
  b.rod(BB, H, 0.02, { color: bikeBlue });
  b.rod(R, S, 0.015, { color: bikeBlue });
  b.rod(F, H, 0.02, { color: bikeBlue });
  b.rod([bx - 0.14, 1.0, bz + 0.42], [bx + 0.14, 1.0, bz + 0.42], 0.018, "#222222");
  b.part(new THREE.BoxGeometry(0.1, 0.04, 0.22), "#222222", { at: [bx, 1.02, bz - 0.3] });

  // ---- Mushrooms ---------------------------------------------------------------------------------------
  const capSpots = spots("#d8352a", ["#fff4dc"], { size: 0.09, amount: 0.45 });
  const mushroom = (x: number, z: number, s: number) => {
    const at = [x, 0.26, z];
    b.lathe(
      [
        [0, 0],
        [0.045 * s, 0],
        [0.035 * s, 0.12 * s],
        [0, 0.13 * s],
      ],
      { color: "#f1e4c8", at },
    );
    b.lathe(
      [
        [0, 0.1 * s],
        [0.13 * s, 0.1 * s],
        [0.15 * s, 0.16 * s],
        [0.1 * s, 0.2 * s],
        [0, 0.19 * s],
      ],
      { color: capSpots, at },
    );
  };
  mushroom(0.75, -0.9, 1.0);
  mushroom(1.0, -0.55, 0.8);
  mushroom(-0.35, -1.25, 0.9);

  return b.root;
}
```