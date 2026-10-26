import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cozy Animal Crossing style Dutch windmill: tapered octagonal tower on a brick base, red hooded cap, lattice sails with striped cloth, teal shutters, glowing windows, arched door with lantern and flower planters.",
};

// Palette
const BRICK = "#e2a090";
const BRICK_D = "#c9806f";
const CREAM = "#f8ecc8";
const CREAM_D = "#e8d6a4";
const ROOF = "#e0654f";
const ROOF_D = "#b94a3a";
const TEAL = "#6bb5a5";
const TEAL_D = "#468a7d";
const WOOD = "#c08a58";
const WOOD_D = "#8a5a38";
const CLOTH = "#fffaf0";
const CLOTH2 = "#f4c9c0";
const STONE = "#cfc7b8";
const GOLD = "#f2c14e";
const LIGHT = "#ffd37a";
const LEAF = "#6dbb5a";

const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "windmill" });
  const base = b.joint("base", { at: [0, 0, 0] });

  const TH = 7.6; // tower height
  const R = (y: number) => 2.5 - (y * 1.0) / TH; // tower vertex radius at height y
  const HUB: [number, number, number] = [0, 8.4, 3.3];
  const rotor = b.joint("rotor", { parent: base, at: HUB, dir: [0, 0, 1], role: "hinge" });

  const B = (g: THREE.BufferGeometry, color: string, o: Record<string, unknown> = {}) =>
    b.part(g, color, { bone: base, ...o });
  const Rt = (g: THREE.BufferGeometry, color: string, o: Record<string, unknown> = {}) =>
    b.part(g, color, { bone: rotor, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---------- Tower ----------
  const seg = (y0: number, y1: number, color: string) =>
    b.lathe(
      [
        [0, y0],
        [R(y0), y0],
        [R(y1), y1],
        [0, y1],
      ],
      { at: [0, 0, 0], segments: 8, spin: 22.5, color, bone: base },
    );
  const lower = seg(0, 1.7, BRICK);
  const upper = seg(1.7, TH, CREAM);
  const ringAt = (y: number, h: number, grow: number, color: string) =>
    b.lathe(
      [
        [R(y), y],
        [R(y) + grow, y],
        [R(y + h) + grow, y + h],
        [R(y + h), y + h],
      ],
      { at: [0, 0, 0], segments: 8, spin: 22.5, color, bone: base },
    );
  // brick courses
  for (const y of [0.55, 0.95, 1.35]) ringAt(y, 0.07, 0.04, BRICK_D);
  ringAt(1.7, 0.16, 0.1, STONE);
  ringAt(4.6, 0.14, 0.08, TEAL);
  ringAt(7.2, 0.2, 0.12, CREAM_D);

  // plinth
  b.lathe(
    [
      [0, 0],
      [2.85, 0],
      [2.85, 0.3],
      [2.6, 0.42],
      [0, 0.42],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STONE, bone: base },
  );

  const tower = b.surface([lower, upper]);

  // ---------- Cap ----------
  const CAP_Y = 7.55;
  const capProf: [number, number][] = [
    [1.8, 0],
    [1.8, 0.22],
    [1.6, 0.7],
    [1.25, 1.15],
    [0.8, 1.5],
    [0.35, 1.75],
    [0, 1.85],
  ];
  b.lathe([[0, 0], ...capProf].map(([r, h]) => [r, CAP_Y + h] as [number, number]), {
    at: [0, 0, 0],
    segments: 8,
    spin: 22.5,
    color: ROOF,
    bone: base,
  });
  const capR = (h: number) => {
    for (let i = 0; i < capProf.length - 1; i++) {
      const [r0, h0] = capProf[i];
      const [r1, h1] = capProf[i + 1];
      if (h >= h0 && h <= h1) return r0 + ((r1 - r0) * (h - h0)) / (h1 - h0 || 1);
    }
    return 0;
  };
  // shingle rings
  for (const h of [0.45, 0.8, 1.15, 1.45]) {
    const r = capR(h);
    b.lathe(
      [
        [r, CAP_Y + h],
        [r + 0.07, CAP_Y + h - 0.04],
        [r + 0.07, CAP_Y + h + 0.04],
        [r, CAP_Y + h + 0.08],
      ],
      { at: [0, 0, 0], segments: 8, spin: 22.5, color: ROOF_D, bone: base },
    );
  }
  // eave trim
  b.lathe(
    [
      [1.62, CAP_Y - 0.12],
      [1.86, CAP_Y - 0.12],
      [1.86, CAP_Y + 0.1],
      [1.62, CAP_Y + 0.1],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: CREAM, bone: base },
  );
  // finial
  B(new THREE.SphereGeometry(0.14, 8, 6), GOLD, { at: [0, CAP_Y + 1.92, 0] });
  B(new THREE.ConeGeometry(0.05, 0.4, 6), GOLD, { at: [0, CAP_Y + 2.2, 0] });
  // round cap window at the front
  {
    const hit = b.surface(b.root).ray([0, CAP_Y + 0.55, 8], [0, 0, -1]);
    if (hit) {
      b.stick(new THREE.CylinderGeometry(0.0, 0.0, 0.01, 3), CREAM, hit);
    }
  }

  // ---------- Tail pole ----------
  b.rod([0, 8.0, -1.6], [0, 0.75, -5.4], 0.09, WOOD_D, { bone: base });
  b.rod([0, 6.2, -1.9], [0, 3.0, -3.7], 0.05, WOOD, { bone: base });
  B(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 10), WOOD, { at: [0, 0.38, -5.4], dir: [1, 0, 0] });
  B(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 6), WOOD_D, { at: [0, 0.38, -5.4], dir: [1, 0, 0] });
  for (let i = 0; i < 4; i++) {
    B(box(0.05, 0.7, 0.05), WOOD_D, { at: [0, 0.38, -5.4], rotation: [i * 45, 0, 0] });
  }

  // ---------- Windows ----------
  const shutter = (hit: ReturnType<typeof tower.nearest>, s: number, y: number, h: number) =>
    b.stick(box(0.26, 0.1, h), TEAL, hit.moved([s * 0.5, 0, y]), { embed: 0.3 });

  const windowAt = (az: number, y: number) => {
    const hit = tower.around([0, y, 0]).at(az, 0);
    if (!hit) return;
    const w = 0.6;
    const h = 0.85;
    glow(b.stick(box(w, 0.1, h), LIGHT, hit, { embed: 0.5 }), 1.2);
    // frame
    b.stick(box(0.1, 0.16, h + 0.1), CREAM, hit.moved([w / 2 + 0.03, 0, 0]), { embed: 0.4 });
    b.stick(box(0.1, 0.16, h + 0.1), CREAM, hit.moved([-w / 2 - 0.03, 0, 0]), { embed: 0.4 });
    b.stick(box(w + 0.16, 0.16, 0.1), CREAM, hit.moved([0, 0, h / 2 + 0.03]), { embed: 0.4 });
    b.stick(box(w + 0.16, 0.16, 0.1), CREAM, hit.moved([0, 0, -h / 2 - 0.03]), { embed: 0.4 });
    // muntins
    b.stick(box(0.05, 0.18, h), CREAM, hit, { embed: 0.4 });
    b.stick(box(w, 0.18, 0.05), CREAM, hit, { embed: 0.4 });
    // shutters + sill
    shutter(hit, 1, 0, h + 0.1);
    shutter(hit, -1, 0, h + 0.1);
    b.stick(box(w + 0.5, 0.22, 0.1), TEAL_D, hit.moved([0, 0, -h / 2 - 0.12]), { embed: 0.3 });
  };
  windowAt(0, 4.2);
  windowAt(0, 6.2);
  for (const az of [90, -90, 180]) windowAt(az, 3.2);
  for (const az of [45, -45, 135, -135]) windowAt(az, 5.6);

  // ---------- Door ----------
  {
    const hit = tower.around([0, 1.2, 0]).at(0, 0);
    if (hit) {
      b.stick(box(1.2, 0.12, 1.5), CREAM, hit.moved([0, 0, 0.0]), { embed: 0.5 });
      b.stick(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 10), CREAM, hit.moved([0, 0, 0.75]), { embed: 0.5 });
      b.stick(box(0.95, 0.16, 1.45), TEAL, hit.moved([0, 0, -0.02]), { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(0.475, 0.475, 0.16, 10), TEAL, hit.moved([0, 0, 0.7]), { embed: 0.3 });
      for (const x of [-0.24, 0.24]) b.stick(box(0.04, 0.18, 1.8), TEAL_D, hit.moved([x, 0, 0.1]), { embed: 0.3 });
      b.stick(new THREE.SphereGeometry(0.06, 6, 4), GOLD, hit.moved([0.32, 0.06, 0]), { embed: 0.2 });
      // little round window in the door
      glow(b.stick(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 8), LIGHT, hit.moved([0, 0, 0.45]), { embed: 0.3 }), 1.2);
      // lantern
      b.stick(box(0.05, 0.05, 0.05), WOOD_D, hit.moved([0, 0.05, 1.35]), { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5), WOOD_D, hit.moved([0, 0.3, 1.2]), { embed: 0 });
      glow(b.stick(new THREE.SphereGeometry(0.11, 8, 6), LIGHT, hit.moved([0, 0.5, 1.4]), { embed: 0 }), 1.6);
    }
  }
  // step
  B(box(1.6, 0.3, 0.9), STONE, { at: [0, 0.15, 2.65] });
  B(box(1.3, 0.1, 0.5), BRICK_D, { at: [0, 0.34, 2.6] });

  // ---------- Flower planters ----------
  const r = rng(11);
  const FLOWERS = ["#ff8fb1", "#ffd84d", "#ff6f61", "#ffffff"];
  for (const s of [1, -1]) {
    const px = s * 1.45;
    B(box(0.9, 0.36, 0.4), WOOD, { at: [px, 0.2, 2.8] });
    B(box(0.94, 0.06, 0.44), WOOD_D, { at: [px, 0.4, 2.8] });
    B(box(0.82, 0.05, 0.32), "#5b3d2a", { at: [px, 0.4, 2.8] });
    for (let i = 0; i < 5; i++) {
      const fx = px - 0.34 + i * 0.17;
      const hgt = 0.35 + r() * 0.25;
      B(new THREE.CylinderGeometry(0.012, 0.012, hgt, 4), LEAF, { at: [fx, 0.42 + hgt / 2, 2.8 + (r() - 0.5) * 0.12] });
      B(new THREE.SphereGeometry(0.075, 6, 4), FLOWERS[i % 4], { at: [fx, 0.45 + hgt, 2.8] });
      B(new THREE.SphereGeometry(0.03, 5, 3), GOLD, { at: [fx, 0.5 + hgt, 2.84] });
    }
    B(new THREE.SphereGeometry(0.14, 7, 5), LEAF, { at: [px + s * 0.36, 0.5, 2.8] });
    B(new THREE.SphereGeometry(0.14, 7, 5), LEAF, { at: [px - s * 0.36, 0.5, 2.8] });
  }

  // ---------- Shaft and hub ----------
  Rt(new THREE.CylinderGeometry(0.2, 0.2, 2.6, 8), WOOD_D, { at: [0, HUB[1], 2.0], dir: [0, 0, 1] });
  Rt(new THREE.CylinderGeometry(0.5, 0.5, 0.36, 10), ROOF, { at: [0, HUB[1], HUB[2]], dir: [0, 0, 1] });
  Rt(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 10), GOLD, { at: [0, HUB[1], HUB[2] + 0.22], dir: [0, 0, 1] });
  Rt(new THREE.ConeGeometry(0.22, 0.45, 8), ROOF_D, { at: [0, HUB[1], HUB[2] + 0.5], dir: [0, 0, 1] });

  // ---------- Sails ----------
  const P = (a: number, u: number, v: number, z: number): [number, number, number] => [
    HUB[0] + Math.cos(a) * u - Math.sin(a) * v,
    HUB[1] + Math.sin(a) * u + Math.cos(a) * v,
    z,
  ];
  for (let k = 0; k < 4; k++) {
    const ad = 20 + k * 90;
    const a = ad * DEG;
    const rot: [number, number, number] = [0, 0, ad - 90];
    // main stock
    Rt(box(0.16, 5.0, 0.14), WOOD_D, { at: P(a, 3.0, 0, HUB[2] - 0.08), rotation: rot });
    // rails
    for (const v of [0.08, 1.12]) {
      Rt(box(0.07, 4.2, 0.07), WOOD, { at: P(a, 3.2, v, HUB[2] + 0.06), rotation: rot });
    }
    // cross bars
    for (let i = 0; i < 9; i++) {
      Rt(box(1.2, 0.07, 0.07), WOOD, { at: P(a, 1.2 + i * 0.5, 0.6, HUB[2] + 0.06), rotation: rot });
    }
    // cloth cells
    for (let i = 0; i < 8; i++) {
      Rt(box(0.96, 0.43, 0.04), i % 2 ? CLOTH2 : CLOTH, {
        at: P(a, 1.45 + i * 0.5, 0.6, HUB[2] + 0.0),
        rotation: rot,
      });
    }
    // tip cap
    Rt(box(0.22, 0.14, 0.18), ROOF, { at: P(a, 5.52, 0, HUB[2] - 0.08), rotation: rot });
    // stock bracket near hub
    Rt(box(0.3, 0.3, 0.18), WOOD, { at: P(a, 0.7, 0, HUB[2]), rotation: rot });
  }

  return b.root;
}
