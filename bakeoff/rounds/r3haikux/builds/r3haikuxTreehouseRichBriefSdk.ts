import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V = [number, number, number];

export const meta = {
  name: "Treehouse",
  description:
    "A cozy treehouse on a grassy round base: a thick old oak with a leafy crown, a wooden cabin with a red shingle roof and a round gable window, a pennant, a lantern by the door, a rope ladder, a swing, a bicycle and mushrooms at the roots.",
};

const C = {
  soil: "#6b4a2c",
  grass: "#86c456",
  grassDark: "#5b9e3a",
  bark: "#6e4a2e",
  barkDark: "#47301f",
  leafDeep: "#3b7a34",
  leafMid: "#57973f",
  leafLight: "#7db94e",
  leafPale: "#a4d266",
  autumnA: "#e0a030",
  autumnB: "#c9642c",
  plank: "#dba56b",
  plankDark: "#a9733f",
  trim: "#f7ecd6",
  roof: "#b93b2f",
  roofDark: "#7f2620",
  glass: "#ffe28a",
  door: "#7b4a2a",
  brass: "#e7b446",
  rope: "#d6b47e",
  steel: "#596069",
  tyre: "#232529",
  frame: "#3f8f86",
  basket: "#c98b3d",
  pink: "#f28fb3",
  yellow: "#ffd54f",
  white: "#fff6e8",
  mushRed: "#d8402f",
  mushBrown: "#b5733c",
  mushCream: "#f3e6c8",
  flag: "#f4c133",
  flagBlue: "#2f6fc0",
  stone: "#8d9196",
  chimney: "#9b5c48",
  lantern: "#ffcd66",
  dark: "#3b2d26",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });

  // y = 0 is the underside of the base. G is the grass surface.
  // P() takes heights measured above the grass.
  const G = 0.36;
  const P = (x: number, y: number, z: number): V => [x, y + G, z];
  const put = (geo: THREE.BufferGeometry, color: string, at: V) => {
    b.part(geo, color, { at });
  };
  const tube = (pts: V[], r: number, color: string) => {
    b.sweep(pts, r, { color });
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---------- Grassy round base ----------
  const R = 4.6;
  put(new THREE.CylinderGeometry(R, R * 0.94, 0.3, 36), C.soil, [0, 0.15, 0]);
  put(new THREE.CylinderGeometry(R * 1.01, R, 0.06, 36), C.grass, [0, 0.33, 0]);
  put(
    new THREE.TorusGeometry(R * 0.995, 0.09, 6, 36).rotateX(Math.PI / 2),
    C.grassDark,
    [0, 0.27, 0],
  );

  // ---------- Grass tufts, flowers, stones, fallen leaves ----------
  const BIKE = { x: -1.9, z: 1.7 };
  const shrooms: [number, number][] = [
    [1.15, 1.05],
    [0.8, 1.45],
    [1.5, 0.75],
    [-1.2, -1.0],
    [-0.5, 1.5],
  ];
  const N = 54;
  for (let i = 0; i < N; i++) {
    const r = R * 0.92 * Math.sqrt((i + 0.5) / N);
    const t = i * 2.39996;
    const x = r * Math.cos(t);
    const z = r * Math.sin(t);
    const blocked =
      r < 1.4 ||
      Math.hypot(x - BIKE.x, z - BIKE.z) < 1.7 ||
      Math.hypot(x - 1.45, z - 4.0) < 0.9 ||
      shrooms.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 0.6);
    if (blocked) continue;
    put(
      new THREE.ConeGeometry(0.09, 0.24, 5),
      i % 3 === 0 ? C.leafLight : C.grassDark,
      [x, G + 0.12, z],
    );
    if (i % 4 === 1) {
      put(
        new THREE.IcosahedronGeometry(0.05, 0),
        i % 8 === 1 ? C.pink : C.yellow,
        [x + 0.12, G + 0.26, z],
      );
    }
  }

  const stones: [number, number, number][] = [
    [-2.9, -2.6, 1.0],
    [3.1, -1.9, 0.8],
    [-3.6, 0.9, 0.7],
    [2.6, 3.4, 0.6],
  ];
  for (const [x, z, s] of stones) {
    put(
      new THREE.IcosahedronGeometry(0.26 * s, 0).scale(1, 0.6, 0.85),
      C.stone,
      [x, G + 0.05 * s, z],
    );
  }
  // stepping stone under the ladder
  put(new THREE.CylinderGeometry(0.24, 0.26, 0.05, 7), C.stone, [1.45, G + 0.02, 4.25]);

  const fallen: [number, number][] = [
    [-0.9, 1.9],
    [1.8, -0.6],
    [-1.6, -0.4],
    [0.3, -1.9],
    [2.3, 1.8],
  ];
  fallen.forEach(([x, z], i) => {
    put(
      new THREE.IcosahedronGeometry(0.12, 0).scale(1, 0.25, 0.7).rotateY(i * 1.3),
      i % 2 ? C.autumnA : C.autumnB,
      [x, G + 0.03, z],
    );
  });

  // ---------- Trunk and roots ----------
  const trunkSeg: [number, number, number, number][] = [
    [0, 1.2, 0.8, 0.72],
    [1.2, 2.4, 0.72, 0.63],
    [2.4, 3.5, 0.63, 0.55],
    [3.5, 4.9, 0.55, 0.4],
  ];
  trunkSeg.forEach(([y0, y1, rb, rt], i) => {
    put(
      new THREE.CylinderGeometry(rt, rb, y1 - y0, 8, 1).rotateY(i * 0.4),
      i === 0 ? C.barkDark : C.bark,
      P(0, (y0 + y1) / 2, 0),
    );
  });

  for (const deg of [-30, 200, 255]) {
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    tube(
      [P(c * 0.35, 0.9, s * 0.35), P(c * 0.8, 0.35, s * 0.8), P(c * 1.3, 0, s * 1.3)],
      0.12,
      C.bark,
    );
  }

  // ---------- Main limbs ----------
  tube([P(0, 4.1, 0), P(-1.2, 5.0, -0.4), P(-2.6, 5.9, -1.0), P(-3.4, 6.4, -1.6)], 0.2, C.bark);
  tube([P(0, 4.2, 0), P(1.2, 5.1, -0.5), P(2.6, 6.0, -1.2), P(3.3, 6.4, -1.6)], 0.2, C.bark);
  tube([P(0, 4.4, -0.1), P(0.1, 5.8, -1.4), P(0.1, 6.9, -2.5), P(0, 7.4, -3.2)], 0.18, C.bark);

  // ---------- Crown: faceted clumps with lit puffs ----------
  const crown: [number, number, number, number, string][] = [
    [0.0, 8.1, -0.6, 1.9, C.leafMid],
    [-1.7, 7.6, -0.7, 1.6, C.leafDeep],
    [1.8, 7.7, -0.9, 1.6, C.leafDeep],
    [0.1, 7.4, -2.4, 1.8, C.leafDeep],
    [0.0, 6.9, -1.0, 1.35, C.leafDeep],
    [-1.0, 5.9, -1.0, 1.0, C.leafMid],
    [1.2, 5.6, -1.2, 1.0, C.leafLight],
    [-2.7, 6.9, -1.6, 1.5, C.leafMid],
    [2.7, 6.9, -1.7, 1.5, C.leafMid],
    [-3.1, 6.0, -0.4, 1.25, C.leafLight],
    [3.1, 6.1, -0.5, 1.25, C.leafMid],
    [-1.1, 9.0, -1.4, 1.2, C.leafPale],
    [1.4, 9.0, -1.8, 1.1, C.leafLight],
    [-2.1, 8.4, 0.6, 1.2, C.leafLight],
    [2.3, 8.3, 0.7, 1.25, C.leafMid],
    [0.2, 6.9, -3.2, 1.3, C.leafDeep],
    [-3.4, 5.2, -2.0, 1.1, C.leafDeep],
    [3.4, 5.4, -1.8, 1.15, C.leafMid],
    [-0.6, 9.6, -0.3, 0.9, C.leafPale],
    [3.5, 6.7, 0.8, 0.95, C.leafLight],
    [-3.6, 6.6, 0.9, 0.95, C.leafMid],
    [0.0, 6.2, -3.6, 1.1, C.leafLight],
    [-2.2, 9.3, -2.5, 0.9, C.leafLight],
    [2.4, 9.4, -2.6, 0.95, C.leafMid],
    [-3.6, 4.4, 1.2, 0.9, C.leafDeep],
    [3.6, 4.5, 1.6, 0.9, C.leafDeep],
  ];
  crown.forEach(([x, y, z, r, c], i) => {
    put(new THREE.IcosahedronGeometry(r, 1).scale(1, 0.82, 1), c, P(x, y, z));
    for (let k = 0; k < 2; k++) {
      const th = i * 2.1 + k * 2.6 + 0.4;
      put(
        new THREE.IcosahedronGeometry(r * 0.42, 0),
        k === 0 ? C.leafPale : C.leafLight,
        P(x + Math.cos(th) * r * 0.7, y + r * 0.55, z + Math.sin(th) * r * 0.7),
      );
    }
  });

  // ---------- Deck, braces, railing, string lights ----------
  const FLOOR = 3.2;
  put(box(4.4, 0.16, 2.8), C.plankDark, P(0, FLOOR - 0.08, 2.0));
  tube([P(0.4, 2.6, 0.35), P(1.2, 2.8, 1.6), P(2.0, 2.98, 2.9)], 0.1, C.bark);
  tube([P(-0.4, 2.6, 0.35), P(-1.2, 2.8, 1.6), P(-2.0, 2.98, 2.9)], 0.1, C.bark);

  for (const sx of [-2.2, 2.2]) {
    put(box(0.06, 0.06, 2.8), C.trim, P(sx, FLOOR + 0.45, 2.0));
    for (const z of [0.8, 2.0]) put(box(0.06, 0.45, 0.06), C.trim, P(sx, FLOOR + 0.225, z));
  }
  put(box(3.15, 0.06, 0.06), C.trim, P(-0.625, FLOOR + 0.45, 3.34));
  put(box(0.25, 0.06, 0.06), C.trim, P(2.075, FLOOR + 0.45, 3.34));
  for (const x of [-2.2, -1.0, 0.95, 1.95, 2.2]) {
    put(box(0.06, 0.45, 0.06), C.trim, P(x, FLOOR + 0.225, 3.34));
  }

  // fairy lights sagging along the right railing
  tube([P(2.2, 3.62, 0.8), P(2.2, 3.5, 2.0), P(2.2, 3.62, 3.3)], 0.01, C.steel);
  for (const z of [1.4, 2.0, 2.6]) {
    put(new THREE.SphereGeometry(0.04, 6, 4), C.glass, P(2.2, z === 2.0 ? 3.46 : 3.56, z));
  }

  // ---------- Cabin ----------
  const WH = 2.3;
  const WY = FLOOR + WH / 2;
  // side walls run up under the eaves
  put(box(0.12, 2.5, 2.4), C.plank, P(-1.5, FLOOR + 1.25, 1.9));
  put(box(0.12, 2.5, 2.4), C.plank, P(1.5, FLOOR + 1.25, 1.9));
  put(box(3.0, WH, 0.12), C.plank, P(0, WY, 0.76));
  put(box(0.55, WH, 0.12), C.plank, P(-1.225, WY, 3.04));
  put(box(1.55, WH, 0.12), C.plank, P(0.725, WY, 3.04));
  put(box(0.9, 0.4, 0.12), C.plank, P(-0.5, 5.3, 3.04));
  for (const sx of [-1.5, 1.5]) {
    for (const z of [0.76, 3.04]) put(box(0.14, 2.5, 0.14), C.trim, P(sx, FLOOR + 1.25, z));
  }

  // door with trim and brass knob
  put(box(0.8, 1.9, 0.06), C.door, P(-0.5, FLOOR + 0.95, 3.13));
  put(new THREE.SphereGeometry(0.04, 8, 6), C.brass, P(-0.25, FLOOR + 0.95, 3.18));
  put(box(0.06, 1.97, 0.08), C.trim, P(-0.94, FLOOR + 0.985, 3.12));
  put(box(0.06, 1.97, 0.08), C.trim, P(-0.06, FLOOR + 0.985, 3.12));
  put(box(0.94, 0.06, 0.08), C.trim, P(-0.5, FLOOR + 1.97, 3.12));

  // square window with flower box on the front
  put(box(0.84, 0.94, 0.05), C.trim, P(0.75, 4.5, 3.13));
  put(box(0.7, 0.8, 0.03), C.glass, P(0.75, 4.5, 3.165));
  put(box(0.04, 0.8, 0.02), C.trim, P(0.75, 4.5, 3.18));
  put(box(0.7, 0.04, 0.02), C.trim, P(0.75, 4.5, 3.18));
  put(box(0.96, 0.16, 0.22), C.plankDark, P(0.75, 3.85, 3.22));
  for (let i = 0; i < 4; i++) {
    put(
      new THREE.IcosahedronGeometry(0.07, 0),
      [C.pink, C.yellow, C.white, C.pink][i],
      P(0.5 + i * 0.17, 3.98, 3.34),
    );
  }

  // side windows
  for (const sx of [-1, 1]) {
    put(box(0.05, 0.94, 0.84), C.trim, P(sx * 1.575, 4.5, 1.9));
    put(box(0.02, 0.8, 0.7), C.glass, P(sx * 1.6, 4.5, 1.9));
    put(box(0.02, 0.8, 0.04), C.trim, P(sx * 1.62, 4.5, 1.9));
    put(box(0.02, 0.04, 0.7), C.trim, P(sx * 1.62, 4.5, 1.9));
  }

  // gables: front one carries the round window, back one closes the eave gap
  const gable = new THREE.Shape();
  gable.moveTo(-1.56, 0);
  gable.lineTo(1.56, 0);
  gable.lineTo(1.56, 0.18);
  gable.lineTo(0, 1.12);
  gable.lineTo(-1.56, 0.18);
  gable.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gable, { depth: 0.12, bevelEnabled: false });
  put(gableGeo, C.plank, P(0, 5.5, 3.0));
  put(gableGeo.clone(), C.plank, P(0, 5.5, 0.7));

  put(new THREE.TorusGeometry(0.34, 0.05, 8, 18), C.trim, P(0, 5.95, 3.14));
  put(
    new THREE.CylinderGeometry(0.3, 0.3, 0.03, 16).rotateX(Math.PI / 2),
    C.glass,
    P(0, 5.95, 3.15),
  );
  put(box(0.56, 0.04, 0.03), C.trim, P(0, 5.95, 3.17));
  put(box(0.04, 0.56, 0.03), C.trim, P(0, 5.95, 3.17));

  // ---------- Roof: red slabs, shingle rows, ridge, fascia ----------
  const EAVE_X = 1.86;
  const EAVE_Y = 5.5;
  const RIDGE_Y = 6.62;
  const rise = RIDGE_Y - EAVE_Y;
  const a = Math.atan2(rise, EAVE_X);
  const slope = Math.hypot(EAVE_X, rise);
  const nx = Math.sin(a);
  const ny = Math.cos(a);
  for (const s of [-1, 1]) {
    put(
      box(slope + 0.25, 0.1, ROOF_D).rotateZ(-s * a),
      C.roof,
      P(s * (EAVE_X / 2 + 0.05 * nx), (EAVE_Y + RIDGE_Y) / 2 + 0.05 * ny, ROOF_Z),
    );
    for (const t of [0.3, 0.55, 0.8]) {
      put(
        box(0.1, 0.04, ROOF_D - 0.2).rotateZ(-s * a),
        C.roofDark,
        P(s * EAVE_X * (1 - t) + s * 0.12 * nx, EAVE_Y + t * rise + 0.12 * ny, ROOF_Z),
      );
    }
    put(box(0.12, 0.16, ROOF_D), C.trim, P(s * 1.94, 5.43, ROOF_Z));
  }
  put(box(0.22, 0.14, ROOF_D + 0.02), C.roofDark, P(0, RIDGE_Y + 0.1, ROOF_Z));

  // chimney
  put(box(0.42, 1.35, 0.42), C.chimney, P(1.05, 6.4, 1.1));
  put(box(0.52, 0.1, 0.52), C.roofDark, P(1.05, 7.1, 1.1));

  // ---------- Pennant on the roof ----------
  put(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), C.bark, P(0, 7.35, ROOF_Z));
  put(new THREE.SphereGeometry(0.05, 6, 4), C.brass, P(0, 8.02, ROOF_Z));
  const pennant = new THREE.Shape();
  pennant.moveTo(0, 0.24);
  pennant.lineTo(0, -0.24);
  pennant.lineTo(1.0, -0.02);
  pennant.closePath();
  put(
    new THREE.ExtrudeGeometry(pennant, { depth: 0.02, bevelEnabled: false }),
    C.flag,
    P(0, 7.7, ROOF_Z - 0.01),
  );
  const stripe = new THREE.Shape();
  stripe.moveTo(0, 0.12);
  stripe.lineTo(0, -0.12);
  stripe.lineTo(0.55, -0.02);
  stripe.closePath();
  put(
    new THREE.ExtrudeGeometry(stripe, { depth: 0.02, bevelEnabled: false }),
    C.flagBlue,
    P(0, 7.7, ROOF_Z + 0.01),
  );

  // ---------- Lantern beside the door ----------
  const LX = -1.25;
  const LZ = 3.5;
  put(box(0.04, 0.04, 0.4), C.steel, P(LX, 4.9, 3.3));
  tube([P(LX, 4.9, LZ), P(LX, 4.76, LZ)], 0.012, C.steel);
  put(box(0.24, 0.04, 0.24), C.dark, P(LX, 4.35, LZ));
  put(box(0.2, 0.26, 0.2), C.lantern, P(LX, 4.5, LZ));
  put(new THREE.ConeGeometry(0.17, 0.12, 4).rotateY(Math.PI / 4), C.dark, P(LX, 4.69, LZ));
  put(new THREE.SphereGeometry(0.03, 6, 4), C.brass, P(LX, 4.78, LZ));

  // ---------- Rope ladder from the deck edge ----------
  for (const x of [1.2, 1.7]) {
    tube([P(x, 3.0, 3.45), P(x, 0.2, 3.95)], 0.02, C.rope);
  }
  for (let i = 0; i < 8; i++) {
    const t = (i + 1) / 9;
    put(
      new THREE.CylinderGeometry(0.025, 0.025, 0.5, 5).rotateZ(Math.PI / 2),
      C.plankDark,
      P(1.45, 3.0 + (0.2 - 3.0) * t, 3.45 + 0.5 * t),
    );
  }

  // ---------- Swing from a low branch ----------
  const SX = -3.0;
  const SZ = 0.4;
  tube([P(-0.4, 3.5, 0.1), P(-1.5, 3.75, 0.25), P(SX, 3.9, SZ)], 0.13, C.bark);
  put(box(0.9, 0.06, 0.34), C.plankDark, P(SX, 1.2, SZ));
  for (const s of [-1, 1]) {
    for (const dz of [-0.12, 0.12]) {
      tube([P(SX + s * 0.1, 3.85, SZ), P(SX + s * 0.45, 1.23, SZ + dz)], 0.018, C.rope);
    }
  }

  // ---------- Bicycle parked at the roots ----------
  // Local frame: forward +X, wheels in the XY plane, rotated by PHI about Y.
  const BX = BIKE.x;
  const BZ = BIKE.z;
  const PHI = -0.6;
  const rot = new THREE.Matrix4().makeRotationY(PHI);
  const cs = Math.cos(PHI);
  const sn = Math.sin(PHI);
  const W = (x: number, y: number, z: number): V => [
    BX + x * cs + z * sn,
    y + G,
    BZ - x * sn + z * cs,
  ];
  const bikeTube = (pts: V[], r: number, color: string) => {
    tube(pts.map(([x, y, z]) => W(x, y, z)), r, color);
  };
  const bikePut = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number) => {
    put(geo.applyMatrix4(rot), color, W(x, y, z));
  };

  for (const x of [-0.52, 0.52]) {
    bikePut(new THREE.TorusGeometry(0.33, 0.035, 6, 20), C.tyre, x, 0.365, 0);
    bikePut(new THREE.TorusGeometry(0.3, 0.01, 4, 18), C.steel, x, 0.365, 0);
    bikePut(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 6).rotateX(Math.PI / 2), C.steel, x, 0.365, 0);
  }
  for (const s of [-1, 1]) {
    bikeTube([[-0.06, 0.4, s * 0.05], [-0.52, 0.365, s * 0.06]], 0.02, C.frame); // chainstay
    bikeTube([[-0.2, 0.85, s * 0.04], [-0.52, 0.365, s * 0.06]], 0.018, C.frame); // seatstay
    bikeTube([[0.46, 0.74, s * 0.03], [0.52, 0.365, s * 0.06]], 0.02, C.frame); // fork leg
  }
  bikeTube([[-0.06, 0.4, 0], [-0.2, 0.92, 0]], 0.024, C.frame); // seat tube
  bikeTube([[-0.2, 0.92, 0], [0.44, 0.94, 0]], 0.024, C.frame); // top tube
  bikeTube([[-0.06, 0.4, 0], [0.46, 0.74, 0]], 0.024, C.frame); // down tube
  bikeTube([[0.46, 0.74, 0], [0.44, 0.94, 0]], 0.03, C.frame); // head tube
  bikeTube([[0.44, 0.94, 0], [0.5, 1.0, 0]], 0.02, C.steel); // stem
  bikeTube(
    [[0.45, 1.04, -0.26], [0.5, 1.0, -0.1], [0.5, 1.0, 0.1], [0.45, 1.04, 0.26]],
    0.016,
    C.steel,
  );
  for (const s of [-1, 1]) {
    bikePut(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6).rotateX(Math.PI / 2), C.tyre, 0.45, 1.04, s * 0.29);
  }
  bikePut(new THREE.BoxGeometry(0.2, 0.05, 0.1), C.tyre, -0.22, 0.95, 0); // saddle
  bikePut(new THREE.TorusGeometry(0.09, 0.012, 4, 14), C.steel, -0.06, 0.4, 0.07); // chainring
  // front basket with flowers
  bikeTube([[0.5, 0.99, 0], [0.56, 0.97, 0]], 0.014, C.steel);
  bikePut(box(0.24, 0.14, 0.2), C.basket, 0.62, 0.9, 0);
  bikePut(new THREE.IcosahedronGeometry(0.04, 0), C.pink, 0.58, 0.99, -0.05);
  bikePut(new THREE.IcosahedronGeometry(0.04, 0), C.yellow, 0.66, 1.0, 0.04);
  bikePut(new THREE.IcosahedronGeometry(0.04, 0), C.white, 0.62, 1.02, 0);

  // ---------- Mushrooms at the foot of the tree ----------
  const mushroom = (x: number, z: number, s: number, cap: string, spotted: boolean) => {
    const stemH = 0.24 * s;
    const stemR = 0.07 * s;
    const capR = 0.18 * s;
    put(new THREE.CylinderGeometry(stemR * 0.8, stemR, stemH, 7), C.mushCream, P(x, stemH / 2, z));
    put(
      new THREE.SphereGeometry(capR, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2),
      cap,
      P(x, stemH, z),
    );
    if (spotted) {
      const spots: [number, number][] = [
        [0.5, 0.3],
        [0.75, 2.2],
        [0.4, 3.9],
        [1.0, 5.1],
        [0.9, 1.0],
      ];
      for (const [th, ph] of spots) {
        put(
          new THREE.SphereGeometry(0.035 * s, 5, 3),
          C.white,
          P(
            x + capR * Math.sin(th) * Math.cos(ph),
            stemH + capR * Math.cos(th),
            z + capR * Math.sin(th) * Math.sin(ph),
          ),
        );
      }
    }
  };
  mushroom(1.15, 1.05, 1.0, C.mushRed, true);
  mushroom(0.8, 1.45, 0.7, C.mushBrown, false);
  mushroom(1.5, 0.75, 0.5, C.mushRed, true);
  mushroom(-1.2, -1.0, 0.9, C.mushRed, true);
  mushroom(-0.5, 1.5, 0.6, C.mushBrown, false);

  return b.root;
}
