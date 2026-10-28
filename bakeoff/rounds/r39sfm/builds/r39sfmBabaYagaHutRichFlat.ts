import * as THREE from "three";
import { createBuilder, rng, limb, catmull, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description:
    "Slavic folk-art diorama: a log izba on two giant scaly chicken legs, with a fish-scale painted roof, a horse-head ridge carving, kokoshnik door and window frames, a glowing sun window, and a skull fence.",
};

type V = [number, number, number];
type O = { dir?: V; axis?: "x" | "y" | "z"; rotation?: V; scale?: V };

// Folk palette
const RED = "#c4281f";
const BLUE = "#2a4fa8";
const DEEP = "#1b2f6b";
const GOLD = "#e8b020";
const CREAM = "#f6ecd2";
const GREEN = "#2e8b57";
const WOODS = ["#8a5a34", "#7a4c2c", "#9b6a3c", "#6e4326"];
const DARKWOOD = "#4d311d";
const PLANK = "#a9753f";
const YEL = "#e8b830";
const YEL2 = "#c98f1c";
const CLAW = "#3b2a1c";
const IRON = "#2c2a33";
const BONE = "#efe6cf";
const GY = 0.16; // ground top

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

export default function build() {
  const b = createBuilder({ name: "baba_yaga_hut" });
  const hut = b.joint("hut", { at: [0, 2.0, 0], role: "spine" });

  const P = (g: THREE.BufferGeometry, c: string, at: V, o: O = {}) => b.part(g, c, { bone: hut, at, ...o });
  const log = (c: V, axis: "x" | "z", len: number, r: number, col: string) =>
    P(cyl(r, len, 8), col, c, { dir: axis === "x" ? [1, 0, 0] : [0, 0, 1] });

  // A folk flower: ring of squashed petals round a centre, lying on a plane with normal n.
  const bloom = (c: V, n: V, u: V, v: V, r: number, pet: string, mid: string, bone = hut, k = 6) => {
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2;
      const cs = Math.cos(a) * r * 0.62;
      const sn = Math.sin(a) * r * 0.62;
      b.part(sph(r * 0.42, 6, 4), pet, {
        bone,
        at: [c[0] + u[0] * cs + v[0] * sn, c[1] + u[1] * cs + v[1] * sn, c[2] + u[2] * cs + v[2] * sn],
        dir: n,
        scale: [1, 0.4, 1],
      });
    }
    b.part(cyl(r * 0.34, r * 0.2, 8), mid, {
      bone,
      at: [c[0] + n[0] * r * 0.1, c[1] + n[1] * r * 0.1, c[2] + n[2] * r * 0.1],
      dir: n,
    });
  };

  // ------------------------------------------------------------------ ground diorama base
  b.lathe(
    [[0, 0], [3.4, 0], [3.4, 0.1], [0, 0.1]],
    { at: [0, 0, 0], bone: hut, color: "#4e3622", segments: 20 },
  );
  b.lathe(
    [[0, 0.08], [3.4, 0.08], [3.3, GY], [0, GY]],
    { at: [0, 0, 0], bone: hut, color: "#4f8a3a", segments: 20 },
  );
  const rg = rng(5);
  const greens = ["#3f7a2e", "#5a9a3c", "#2f6a2c", "#6aab45"];
  for (let i = 0; i < 38; i++) {
    const a = rg() * Math.PI * 2;
    const d = 0.9 + Math.sqrt(rg()) * 2.3;
    const h = 0.14 + rg() * 0.14;
    P(cone(0.035, h, 4), greens[i % 4], [Math.sin(a) * d, GY + h * 0.4, Math.cos(a) * d]);
  }
  const flowerCols = [RED, CREAM, GOLD, "#d86ab0"];
  for (let i = 0; i < 12; i++) {
    const a = rg() * Math.PI * 2;
    const d = 1.6 + rg() * 1.4;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    P(cyl(0.01, 0.2, 4), "#3f7a2e", [x, GY + 0.1, z]);
    P(sph(0.035, 6, 4), flowerCols[i % 4], [x, GY + 0.22, z]);
  }
  // mushrooms
  const mush: V[] = [[1.9, GY, 1.4], [2.15, GY, 1.0], [-1.9, GY, 1.7]];
  mush.forEach((m, i) => {
    const s = 1 + (i % 2) * 0.4;
    P(cyl(0.04 * s, 0.14 * s, 6), CREAM, [m[0], m[1] + 0.07 * s, m[2]]);
    P(new THREE.SphereGeometry(0.11 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), RED, [m[0], m[1] + 0.13 * s, m[2]]);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6;
      P(sph(0.017 * s, 4, 3), CREAM, [m[0] + Math.sin(a) * 0.06 * s, m[1] + 0.2 * s, m[2] + Math.cos(a) * 0.06 * s]);
    }
  });
  const rocks: [V, number][] = [[[-2.3, GY + 0.08, 0.8], 0.28], [[2.4, GY + 0.06, -0.5], 0.22], [[-1.6, GY + 0.05, -2.0], 0.2]];
  rocks.forEach(([p, r], i) =>
    P(new THREE.IcosahedronGeometry(r, 0), i % 2 ? "#6f6c76" : "#85828c", p, { scale: [1, 0.7, 1.1] }),
  );

  // ------------------------------------------------------------------ chicken legs
  const legInfo: { tip: ReturnType<typeof b.joint> }[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: V = [s * 0.75, 1.95, 0];
    const foot: V = [s * 0.95, GY + 0.1, 0.05];
    const pts = limb(hip, foot, [1.0, 0.95], [[0, 0, -1]]);
    const chain = b.chain(`leg${side}`, polyline(pts), {
      parent: hut,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const ankle = chain.tip!;
    legInfo.push({ tip: ankle });
    const tube = b.sweep(chain, [0.13, 0.075], { color: YEL, section: { ngon: 6 } });
    for (const t of [0.3, 0.5, 0.7, 0.88])
      for (const a of [-50, 0, 50])
        b.stick(box(0.1, 0.035, 0.07), YEL2, tube.at(t, a), { embed: 0.4 });
    b.part(sph(0.12, 7, 5), YEL2, { bone: chain.joints[1], at: [pts[1].x, pts[1].y, pts[1].z] });
    b.part(sph(0.1, 7, 5), YEL2, { bone: ankle, at: [pts[2].x, pts[2].y, pts[2].z] });
    // spur
    b.spike([pts[2].x, pts[2].y + 0.1, pts[2].z - 0.05], [0, -0.4, -1], 0.3, 0.05, { color: CLAW, bone: ankle });
    // toes
    const A = pts[2];
    const toes: [number, number][] = [[-38, 0.85], [0, 0.95], [38, 0.85], [180, 0.55]];
    for (const [deg, len] of toes) {
      const r = (deg * Math.PI) / 180;
      const dx = Math.sin(r);
      const dz = Math.cos(r);
      const mid: V = [A.x + dx * len * 0.5, GY + 0.11, A.z + dz * len * 0.5];
      const tip: V = [A.x + dx * len, GY + 0.07, A.z + dz * len];
      b.sweep(catmull([[A.x, A.y, A.z], mid, tip]), [0.075, 0.05], {
        bone: ankle,
        color: YEL,
        section: { ngon: 6 },
      });
      b.part(sph(0.07, 6, 4), YEL2, { bone: ankle, at: mid });
      b.spike(tip, [dx, -0.25, dz], 0.2, 0.045, { color: CLAW, bone: ankle });
    }
    // feathery trousers
    const hb = chain.joints[0];
    b.part(sph(0.3, 8, 6), "#f0dcae", { bone: hb, at: [hip[0], 1.85, 0], scale: [1, 1.2, 1.1] });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      b.spike([hip[0] + Math.cos(a) * 0.2, 1.9, Math.sin(a) * 0.2], [Math.cos(a) * 0.5, -1, Math.sin(a) * 0.5], 0.55, 0.08, {
        color: i % 2 ? "#e9c27a" : "#f0dcae",
        bone: hb,
      });
    }
  }
  // axle between the legs and under-beams
  P(cyl(0.07, 1.9, 6), DARKWOOD, [0, 1.95, 0], { dir: [1, 0, 0] });
  for (const z of [-0.8, 0.8]) P(cyl(0.09, 3.3, 8), WOODS[3], [0, 1.82, z], { dir: [1, 0, 0] });

  // ------------------------------------------------------------------ platform
  P(box(3.2, 0.2, 3.0), DARKWOOD, [0, 2.0, 0]);
  for (let i = 0; i < 10; i++) {
    const c = i % 2 ? CREAM : RED;
    P(box(0.3, 0.14, 0.04), c, [-1.44 + 0.32 * i, 2.0, 1.51]);
    P(box(0.3, 0.14, 0.04), c, [-1.44 + 0.32 * i, 2.0, -1.51]);
  }
  for (let i = 0; i < 9; i++) {
    const c = i % 2 ? CREAM : RED;
    P(box(0.04, 0.14, 0.3), c, [1.61, 2.0, -1.33 + 0.333 * i]);
    P(box(0.04, 0.14, 0.3), c, [-1.61, 2.0, -1.33 + 0.333 * i]);
  }

  // ------------------------------------------------------------------ log walls
  for (let i = 0; i < 9; i++) {
    const yF = 2.2 + 0.2 * i;
    const yS = yF + 0.1;
    const cF = WOODS[i % 4];
    const cS = WOODS[(i + 2) % 4];
    if (i <= 6) {
      for (const sx of [1, -1]) log([sx * 1.0, yF, 1.1], "x", 1.0, 0.11, cF);
    } else log([0, yF, 1.1], "x", 3.0, 0.11, cF);
    log([0, yF, -1.1], "x", 3.0, 0.11, cF);
    for (const sx of [1, -1]) {
      if (i >= 3 && i <= 6) {
        log([sx * 1.1, yS, -0.9], "z", 0.9, 0.11, cS);
        log([sx * 1.1, yS, 0.9], "z", 0.9, 0.11, cS);
      } else log([sx * 1.1, yS, 0], "z", 2.7, 0.11, cS);
    }
    for (const sx of [1, -1])
      for (const sz of [1.1, -1.1]) P(cyl(0.075, 0.03, 8), "#dcb87e", [sx * 1.51, yF, sz], { dir: [1, 0, 0] });
  }

  // ------------------------------------------------------------------ door
  const door = b.joint("door", { parent: hut, at: [0.46, 2.12, 1.1], dir: [0, 1, 0], role: "hinge" });
  const D = (g: THREE.BufferGeometry, c: string, at: V, o: O = {}) => b.part(g, c, { bone: door, at, ...o });
  D(box(0.92, 1.36, 0.07), BLUE, [0, 2.8, 1.08]);
  for (const x of [-0.23, 0, 0.23]) D(box(0.015, 1.3, 0.01), DEEP, [x, 2.8, 1.12]);
  for (const y of [2.4, 3.2]) {
    D(box(0.9, 0.09, 0.02), IRON, [0, y, 1.125]);
    for (let i = 0; i < 5; i++) D(sph(0.02, 5, 4), GOLD, [-0.36 + 0.18 * i, y, 1.14]);
  }
  bloom([0, 2.8, 1.14], [0, 0, 1], [1, 0, 0], [0, 1, 0], 0.3, RED, GOLD, door, 8);
  D(new THREE.TorusGeometry(0.055, 0.013, 5, 8), GOLD, [-0.3, 2.65, 1.15]);
  D(box(0.07, 0.14, 0.02), IRON, [-0.3, 2.65, 1.125]);
  for (const s of [1, -1]) {
    P(box(0.14, 1.5, 0.1), RED, [s * 0.58, 2.85, 1.2]);
    for (let i = 0; i < 4; i++) P(sph(0.025, 5, 4), CREAM, [s * 0.58, 2.3 + 0.32 * i, 1.255]);
  }
  b.extrude(
    [[-0.7, 0], [0.7, 0], [0.7, 0.1], [0.35, 0.3], [0, 0.42], [-0.35, 0.3], [-0.7, 0.1]],
    { at: [0, 3.55, 1.2], x: [1, 0, 0], thickness: 0.1, color: RED, bone: hut },
  );
  b.extrude(
    [[-0.5, 0], [0.5, 0], [0.5, 0.07], [0.25, 0.22], [0, 0.3], [-0.25, 0.22], [-0.5, 0.07]],
    { at: [0, 3.58, 1.26], x: [1, 0, 0], thickness: 0.04, color: CREAM, bone: hut },
  );
  bloom([0, 3.76, 1.3], [0, 0, 1], [1, 0, 0], [0, 1, 0], 0.1, BLUE, GOLD);
  // painted frieze beside the door
  for (const s of [1, -1]) {
    P(box(0.65, 0.2, 0.04), DEEP, [s * 1.075, 3.8, 1.235]);
    for (let i = 0; i < 2; i++) {
      P(box(0.1, 0.1, 0.03), RED, [s * (0.9 + 0.3 * i), 3.8, 1.26], { rotation: [0, 0, 45] });
      P(sph(0.025, 5, 4), GOLD, [s * (1.05 + 0.3 * i), 3.8, 1.26]);
    }
  }
  // ladder
  for (const s of [1, -1]) b.rod([s * 0.4, 2.12, 1.45], [s * 0.4, GY + 0.02, 2.5], 0.05, WOODS[1], { bone: hut });
  for (let i = 0; i < 8; i++) {
    const t = (i + 0.7) / 8.4;
    const y = 2.12 + (GY + 0.02 - 2.12) * t;
    const z = 1.45 + (2.5 - 1.45) * t;
    b.rod([-0.4, y, z], [0.4, y, z], 0.035, WOODS[2], { bone: hut });
  }

  // ------------------------------------------------------------------ side windows
  for (const s of [1, -1]) {
    glow(P(box(0.04, 0.72, 0.8), "#ffcf5a", [s * 1.05, 3.2, 0]), 1.3);
    P(box(0.06, 0.74, 0.05), IRON, [s * 1.09, 3.2, 0]);
    P(box(0.06, 0.05, 0.82), IRON, [s * 1.09, 3.2, 0]);
    for (const z of [-0.55, 0.55]) {
      P(box(0.08, 0.95, 0.12), RED, [s * 1.245, 3.2, z]);
      for (let i = 0; i < 3; i++) P(sph(0.022, 5, 4), CREAM, [s * 1.29, 2.95 + 0.25 * i, z]);
    }
    P(box(0.1, 0.07, 1.3), BLUE, [s * 1.25, 2.72, 0]);
    b.extrude(
      [[-0.62, 0], [0.62, 0], [0.62, 0.08], [0.3, 0.26], [0, 0.34], [-0.3, 0.26], [-0.62, 0.08]],
      { at: [s * 1.25, 3.66, 0], x: [0, 0, 1], thickness: 0.08, color: RED, bone: hut },
    );
    for (const z of [-0.84, 0.84]) {
      P(box(0.04, 0.82, 0.42), BLUE, [s * 1.27, 3.2, z]);
      bloom([s * 1.3, 3.2, z], [s, 0, 0], [0, 0, 1], [0, 1, 0], 0.14, RED, GOLD);
      P(box(0.02, 0.06, 0.42), DEEP, [s * 1.3, 2.85, z]);
      P(box(0.02, 0.06, 0.42), DEEP, [s * 1.3, 3.55, z]);
    }
  }

  // ------------------------------------------------------------------ roof
  const ang = Math.atan2(1.25, 1.7);
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const nOut = (s: number): V => [s * sa, ca, 0];
  const roofAt = (s: number, u: number, z: number, off: number): V => [
    s * 1.7 - s * ca * u + s * sa * off,
    4.05 + sa * u + ca * off,
    z,
  ];
  const FOLK = [RED, BLUE, GOLD, GREEN];
  for (const s of [1, -1]) {
    P(box(2.2, 0.12, 3.1), DARKWOOD, roofAt(s, 1.08, 0, -0.06), { dir: nOut(s) });
    for (let k = 0; k < 6; k++) {
      const odd = k % 2 === 1;
      const n = odd ? 7 : 8;
      const z0 = odd ? -1.2 : -1.4;
      for (let j = 0; j < n; j++) {
        P(cyl(0.19, 0.05, 8), FOLK[(j + k) % 4], roofAt(s, 0.18 + 0.35 * k, z0 + 0.4 * j, 0.03 + 0.012 * (5 - k)), {
          dir: nOut(s),
        });
      }
    }
    for (const e of [1, -1]) {
      P(box(2.2, 0.2, 0.07), BLUE, roofAt(s, 1.08, e * 1.6, -0.12), { dir: nOut(s) });
      for (let i = 0; i < 8; i++) {
        const u = 0.15 + 0.27 * i;
        const nv = nOut(s);
        P(cone(0.05, 0.14, 5), i % 2 ? GOLD : RED, roofAt(s, u, e * 1.6, -0.27), { dir: [-nv[0], -nv[1], 0] });
        P(cyl(0.045, 0.02, 8), GOLD, roofAt(s, u + 0.1, e * 1.6 + e * 0.04, -0.12), { dir: [0, 0, 1] });
      }
    }
  }
  P(cyl(0.1, 3.5, 8), WOODS[0], [0, 5.32, 0], { dir: [0, 0, 1] });
  for (const e of [1, -1]) P(sph(0.1, 6, 5), GOLD, [0, 5.32, e * 1.78]);
  // moss on the roof
  for (const [s, u, z] of [[1, 0.8, 0.6], [-1, 1.3, -0.7], [1, 1.6, -1.0]] as [number, number, number][])
    P(sph(0.2, 6, 4), "#5a8f3c", roofAt(s, u, z, 0.05), { scale: [1.5, 0.4, 1.1] });

  // gables with sun windows, and konyok horse heads
  const K = 1.5;
  const horse: [number, number][] = [
    [0, 0], [0.5, 0], [0.52, 0.18], [0.42, 0.34], [0.5, 0.46], [0.38, 0.58], [0.22, 0.5], [0.12, 0.36], [0, 0.2],
  ].map(([x, y]) => [x * K, y * K]);
  for (const e of [1, -1]) {
    b.extrude(
      [[-1.5, 0], [1.5, 0], [1.5, 0.18], [0, 1.27], [-1.5, 0.18]],
      { at: [0, 3.95, e * 1.1], x: [1, 0, 0], thickness: 0.12, color: PLANK, bone: hut },
    );
    const zz = e * 1.19;
    P(cyl(0.3, 0.04, 12), GOLD, [0, 4.4, zz], { dir: [0, 0, 1] });
    P(cyl(0.24, 0.05, 12), RED, [0, 4.4, zz], { dir: [0, 0, 1] });
    glow(P(cyl(0.19, 0.06, 12), "#ffd25a", [0, 4.4, zz + e * 0.01], { dir: [0, 0, 1] }), 1.3);
    P(box(0.4, 0.035, 0.03), IRON, [0, 4.4, zz + e * 0.04]);
    P(box(0.035, 0.4, 0.03), IRON, [0, 4.4, zz + e * 0.04]);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const ox = Math.sin(a);
      const oy = Math.cos(a);
      P(cone(0.055, 0.24, 5), i % 2 ? CREAM : RED, [ox * 0.42, 4.4 + oy * 0.42, zz], { dir: [ox, oy, 0] });
    }
    for (const x of [-0.5, 0, 0.5]) P(sph(0.03, 5, 4), x === 0 ? RED : BLUE, [x, 3.92 + 0.0, zz + e * 0.02]);
    const head = b.extrude(horse, {
      at: [0, 5.15, e * 1.0],
      x: [0, 0, e],
      thickness: 0.12,
      color: WOODS[2],
      bone: hut,
    });
    P(sph(0.03, 5, 4), IRON, head.local([0.37 * K, 0.5 * K, 0.07]));
    P(sph(0.03, 5, 4), RED, head.local([0.5 * K, 0.4 * K, 0.05]), { scale: [1, 1, 1] });
    for (const [x, y] of [[0.03, 0.12], [0.08, 0.28], [0.17, 0.43]])
      P(cone(0.055, 0.22, 5), GOLD, head.local([x * K, y * K, 0]), { dir: [0, 0.4, -e] });
    P(cone(0.045, 0.2, 5), RED, head.local([0.3 * K, 0.57 * K, 0]), { dir: [0, 1, 0] });
  }

  // chimney and smoke
  P(box(0.45, 1.3, 0.45), "#8c4a35", [-0.8, 5.0, -0.6]);
  for (const y of [4.6, 5.0, 5.4]) P(box(0.47, 0.05, 0.47), CREAM, [-0.8, y, -0.6]);
  P(box(0.6, 0.1, 0.6), IRON, [-0.8, 5.68, -0.6]);
  const smoke: [V, number][] = [[[-0.8, 5.95, -0.6], 0.2], [[-0.7, 6.35, -0.5], 0.28], [[-0.5, 6.85, -0.35], 0.36]];
  smoke.forEach(([p, r], i) => P(new THREE.IcosahedronGeometry(r, 1), i % 2 ? "#cfcfda" : "#e0e0ea", p));

  // ------------------------------------------------------------------ skull fence
  const posts = [35, 70, 105, 140, 180, -35, -70, -105, -140];
  for (const th of posts) {
    const a = (th * Math.PI) / 180;
    const ox = Math.sin(a);
    const oz = Math.cos(a);
    const R = 2.9;
    const px = ox * R;
    const pz = oz * R;
    const tx = oz;
    const tz = -ox;
    P(cyl(0.04, 1.1, 6), DARKWOOD, [px, GY + 0.5, pz]);
    P(sph(0.14, 8, 6), BONE, [px, GY + 1.2, pz], { scale: [1, 1.05, 1.1] });
    P(cyl(0.075, 0.07, 6), BONE, [px + ox * 0.04, GY + 1.07, pz + oz * 0.04]);
    for (const sd of [1, -1]) {
      glow(P(sph(0.032, 5, 4), "#ff8a1c", [px + ox * 0.11 + tx * 0.05 * sd, GY + 1.23, pz + oz * 0.11 + tz * 0.05 * sd]), 1.4);
    }
    P(sph(0.02, 4, 3), IRON, [px + ox * 0.14, GY + 1.15, pz + oz * 0.14]);
  }

  return b.root;
}
