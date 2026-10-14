import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, grain, mottle, svg } from "../../../../src/index";

export const meta = {
  name: "Treehouse",
  description:
    "A stylized low-poly treehouse: a plank cabin with a shingled gable roof on a deck in an old oak, with a ladder, rope swing, pulley bucket, bunting, lantern, telescope and birdhouse.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "treehouse", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const r0: any = rng(42);
  const rand = (): number => (typeof r0 === "function" ? r0() : r0.next());
  const DEG = Math.PI / 180;

  // ---------- palette ----------
  const BARK = grain("#6e4a2c", "#4a301c", { size: 0.09, axis: "y" });
  const plankX = [
    grain("#c08a52", "#a26f3e", { size: 0.07, axis: "x" }),
    grain("#a8743f", "#8c5c30", { size: 0.07, axis: "x" }),
    grain("#cf9d62", "#b07f48", { size: 0.07, axis: "x" }),
  ];
  const plankZ = [
    grain("#c08a52", "#a26f3e", { size: 0.07, axis: "z" }),
    grain("#a8743f", "#8c5c30", { size: 0.07, axis: "z" }),
    grain("#cf9d62", "#b07f48", { size: 0.07, axis: "z" }),
  ];
  const GROUND = mottle("#78a845", "#5d8c38", { size: 0.7 });
  const DARKWOOD = "#6a4127";
  const TRIM = "#f1e4c3";
  const TEAL = "#2f8a8c";
  const TEAL_D = "#236b6d";
  const ROOFC = ["#c9533c", "#b4442f", "#d9683f"];
  const GLASS = "#ffd77a";
  const METAL = "#5f666e";
  const BRASS = "#d6a842";
  const ROPE = "#d8b77f";
  const LEAVES = ["#4f8a3a", "#5f9d40", "#3e7533", "#6aa846"];

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, rot ? { at, rotation: rot, flat: true } : { at, flat: true });
  const rod = (a: V, c: V, r: any, color: any, sq = false) =>
    b.rod(a, c, r, sq ? { color, section: "box" } : { color, sides: 6 });
  const cyl = (r: number, h: number, color: any, at: V, dir: V, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, flat: true });

  // ---------- ground ----------
  b.part(new THREE.CylinderGeometry(3.0, 3.15, 0.08, 16), GROUND, { at: [0.4, 0.04, 0.45], flat: true });

  // ---------- tree ----------
  const trunkPath = catmull([
    [0, -0.05, 0],
    [0.03, 1.5, 0],
    [0, 3, -0.02],
    [-0.15, 4.6, -0.1],
    [-0.25, 5.8, -0.05],
    [-0.2, 6.9, 0],
  ]);
  const trunk = b.sweep(trunkPath, [0.52, 0.4, 0.34, 0.3, 0.25, 0.18, 0.1], {
    color: BARK,
    sides: 10,
    caps: { start: "flat", end: "round" },
  });
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 + 15) * DEG;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const k = 1 + 0.15 * Math.sin(i * 2.3);
    b.sweep(
      bezier([0.18 * dx, 1.0, 0.18 * dz], [0.4 * dx, 0.45, 0.4 * dz], [0.75 * k * dx, 0.12, 0.75 * k * dz], [1.15 * k * dx, 0.02, 1.15 * k * dz]),
      [0.24, 0.05],
      { color: BARK, sides: 7, caps: { start: "round", end: "point" } },
    );
  }
  const branchPaths: { pts: V[]; r: [number, number] }[] = [
    { pts: [[-0.15, 4.6, -0.1], [0.5, 5.2, -0.3], [1.1, 5.7, -0.45], [1.6, 6.1, -0.5]], r: [0.17, 0.05] },
    { pts: [[-0.2, 5.0, -0.1], [-0.4, 5.5, -0.8], [-0.7, 6.0, -1.5]], r: [0.15, 0.05] },
    { pts: [[-0.2, 5.3, 0], [0.0, 5.7, 0.7], [0.3, 6.0, 1.3]], r: [0.13, 0.04] },
    { pts: [[-0.22, 5.6, -0.05], [-0.8, 6.1, 0.2], [-1.2, 6.4, 0.4]], r: [0.12, 0.04] },
  ];
  for (const bp of branchPaths) b.sweep(catmull(bp.pts), bp.r, { color: BARK, sides: 7 });

  // swing branch + rope swing
  const sb = catmull([
    [-0.05, 3.9, 0],
    [-0.9, 4.15, 0.25],
    [-1.8, 4.4, 0.4],
    [-2.5, 4.85, 0.4],
  ]);
  b.sweep(sb, [0.19, 0.06], { color: BARK, sides: 8 });
  const p1 = sb.at(0.55);
  const p2 = sb.at(0.75);
  const sx = (p1.x + p2.x) / 2;
  const sz = (p1.z + p2.z) / 2;
  const seatLen = Math.abs(p2.x - p1.x) + 0.14;
  for (const p of [p1, p2]) {
    const ex = p === p1 ? sx + seatLen / 2 - 0.07 : sx - seatLen / 2 + 0.07;
    rod([p.x, p.y, p.z], [ex, 0.64, sz], 0.016, ROPE);
    b.part(new THREE.IcosahedronGeometry(0.035, 0), ROPE, { at: [ex, 0.66, sz], flat: true });
    b.part(new THREE.TorusGeometry(0.1, 0.02, 4, 8), ROPE, { at: [p.x, p.y, p.z], rotation: [0, 90, 0], flat: true });
  }
  box(seatLen, 0.05, 0.26, "#d2553e", [sx, 0.61, sz]);

  // knothole
  const knot = b.surface(trunk).ray([0.1, 1.3, 3], [0, 0, -1]);
  if (knot) b.stick(new THREE.SphereGeometry(0.09, 7, 5), "#2e1c10", knot, { scale: [1, 0.35, 1.4], embed: 0.5 });

  // birdhouse
  const d45: V = [Math.SQRT1_2, 0, Math.SQRT1_2];
  const bh: V = [0.03 + d45[0] * 0.44, 1.9, d45[2] * 0.44];
  box(0.18, 0.22, 0.18, "#e9c46a", bh, [0, 45, 0]);
  b.part(new THREE.ConeGeometry(0.17, 0.13, 4), "#c9533c", { at: [bh[0], 2.075, bh[2]], flat: true });
  cyl(0.035, 0.03, "#2a1a10", [bh[0] + d45[0] * 0.09, 1.93, bh[2] + d45[2] * 0.09], d45, 8);
  rod([bh[0] + d45[0] * 0.09, 1.86, bh[2] + d45[2] * 0.09], [bh[0] + d45[0] * 0.16, 1.86, bh[2] + d45[2] * 0.16], 0.008, DARKWOOD);

  // ---------- platform ----------
  for (let i = 0; i < 13; i++) {
    const z = -1.0 + i * 0.2;
    box(3.1 + (rand() - 0.5) * 0.08, 0.06, 0.19, plankX[i % 3], [0.65 + (rand() - 0.5) * 0.04, 3.0 + (rand() - 0.5) * 0.008, z]);
  }
  for (const x of [-0.8, 0.65, 2.1]) box(0.12, 0.14, 2.7, DARKWOOD, [x, 2.9, 0.2]);
  for (const z of [-1.0, 1.4]) box(3.1, 0.12, 0.1, DARKWOOD, [0.65, 2.88, z]);
  for (const z of [-0.95, 1.35]) box(0.14, 2.95, 0.14, DARKWOOD, [2.05, 1.475, z]);
  rod([2.05, 0.4, -0.95], [2.05, 2.6, 1.35], 0.03, DARKWOOD, true);
  rod([2.05, 0.4, 1.35], [2.05, 2.6, -0.95], 0.03, DARKWOOD, true);
  rod([0.2, 2.0, 0], [1.9, 2.84, 0.1], 0.045, DARKWOOD, true);
  rod([-0.2, 2.2, 0.05], [-0.75, 2.84, 0.4], 0.045, DARKWOOD, true);
  rod([0, 2.2, -0.25], [0.3, 2.84, -0.95], 0.045, DARKWOOD, true);

  // railing
  const railRun = (ax: number, az: number, bx: number, bz: number) => {
    const len = Math.hypot(bx - ax, bz - az);
    const nP = Math.max(2, Math.round(len / 0.6) + 1);
    for (let i = 0; i < nP; i++) {
      const t = i / (nP - 1);
      box(0.08, 0.95, 0.08, DARKWOOD, [ax + (bx - ax) * t, 3.505, az + (bz - az) * t]);
    }
    rod([ax, 3.92, az], [bx, 3.92, bz], 0.035, plankX[2], true);
    rod([ax, 3.18, az], [bx, 3.18, bz], 0.025, plankX[1], true);
    const n = Math.floor(len / 0.14);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      box(0.035, 0.72, 0.035, plankX[0], [ax + (bx - ax) * t, 3.55, az + (bz - az) * t]);
    }
  };
  railRun(2.15, 1.45, -0.12, 1.45);
  railRun(-0.85, 1.0, -0.85, -1.05);
  railRun(-0.85, -1.05, 0.4, -1.05);
  railRun(2.15, 0.9, 2.15, 1.45);

  // sign
  const signTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 56"><rect width="160" height="56" rx="6" fill="#ecd9aa"/><rect x="4" y="4" width="152" height="48" rx="4" fill="none" stroke="#7a4c2a" stroke-width="4"/><text x="80" y="38" font-family="Verdana, sans-serif" font-size="26" font-weight="bold" text-anchor="middle" fill="#b0402c">CLUB HQ</text></svg>`,
    { size: 256 },
  );
  box(0.64, 0.25, 0.03, DARKWOOD, [0.9, 3.62, 1.49]);
  b.part(new THREE.PlaneGeometry(0.58, 0.2), "#ffffff", { at: [0.9, 3.62, 1.507], dir: [0, 0, 1], axis: "z", texture: signTex });

  // ladder
  for (const x of [-0.72, -0.28]) rod([x, 0.02, 2.4], [x, 3.55, 1.45], 0.035, DARKWOOD, true);
  for (let i = 0; i < 10; i++) {
    const y = 0.3 + i * 0.3;
    const z = 2.4 - (0.95 * y) / 3.55;
    rod([-0.74, y, z], [-0.26, y, z], 0.028, plankX[i % 3], true);
  }

  // ---------- cabin ----------
  const top = 4.535;
  for (let i = 0; i < 7; i++) {
    const y = 3.03 + 0.1075 + i * 0.215;
    const o = (i % 2) * 0.006;
    box(1.52, 0.22, 0.06, plankX[i % 3], [1.2, y, 0.85 + o]);
    box(1.52, 0.22, 0.06, plankX[(i + 1) % 3], [1.2, y, -0.95 - o]);
    box(0.06, 0.22, 1.86, plankZ[(i + 2) % 3], [0.45 - o, y, -0.05]);
    box(0.06, 0.22, 1.86, plankZ[i % 3], [1.95 + o, y, -0.05]);
  }
  for (const x of [0.45, 1.95]) for (const z of [0.85, -0.95]) box(0.11, 1.55, 0.11, DARKWOOD, [x, 3.8, z]);

  // door
  box(0.52, 1.1, 0.04, TEAL, [1.55, 3.58, 0.895]);
  for (const y of [3.25, 3.95]) box(0.48, 0.07, 0.03, TEAL_D, [1.55, y, 0.92]);
  box(0.06, 0.8, 0.03, TEAL_D, [1.55, 3.6, 0.92], [0, 0, 35]);
  b.part(new THREE.SphereGeometry(0.03, 6, 4), BRASS, { at: [1.36, 3.6, 0.935] });
  for (const x of [1.255, 1.845]) box(0.07, 1.16, 0.05, TRIM, [x, 3.61, 0.9]);
  box(0.66, 0.07, 0.05, TRIM, [1.55, 4.17, 0.9]);
  box(0.6, 0.04, 0.3, DARKWOOD, [1.55, 3.05, 1.08]); // step / mat
  box(0.42, 0.015, 0.22, "#c9533c", [1.55, 3.085, 1.12]);

  // porthole
  b.part(new THREE.TorusGeometry(0.17, 0.035, 6, 12), TRIM, { at: [0.85, 3.95, 0.9], flat: true });
  cyl(0.15, 0.03, GLASS, [0.85, 3.95, 0.885], [0, 0, 1], 12);
  box(0.3, 0.025, 0.02, TRIM, [0.85, 3.95, 0.905]);
  box(0.025, 0.3, 0.02, TRIM, [0.85, 3.95, 0.905]);

  // side window with shutters and flower box
  const wy = 3.85;
  const wz = -0.05;
  box(0.03, 0.5, 0.6, GLASS, [1.975, wy, wz]);
  for (const s of [1, -1]) {
    box(0.06, 0.06, 0.72, TRIM, [2.0, wy + s * 0.28, wz]);
    box(0.06, 0.62, 0.06, TRIM, [2.0, wy, wz + s * 0.33]);
    const hz = wz + s * 0.36;
    box(0.04, 0.56, 0.3, TEAL, [2.01 + Math.sin(20 * DEG) * 0.15, wy, hz + s * Math.cos(20 * DEG) * 0.15], [0, s * 20, 0]);
  }
  box(0.04, 0.5, 0.03, TRIM, [1.995, wy, wz]);
  box(0.04, 0.03, 0.6, TRIM, [1.995, wy, wz]);
  box(0.14, 0.14, 0.66, plankZ[1], [2.05, wy - 0.38, wz]);
  const FLOWERS = ["#ff6f91", "#ffd23f", "#ffffff", "#ff8c42", "#c77dff"];
  for (let i = 0; i < 7; i++) {
    const z = wz - 0.27 + i * 0.09;
    b.part(new THREE.IcosahedronGeometry(0.05, 0), "#4f8a3a", { at: [2.05, wy - 0.29, z], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.04, 0), FLOWERS[i % 5], { at: [2.06 + (rand() - 0.5) * 0.04, wy - 0.24 + rand() * 0.04, z], flat: true });
  }

  // roof
  const th = Math.atan2(0.65, 0.75);
  const thDeg = th / DEG;
  const ridge = new THREE.Vector3(1.2, top + 0.65, -0.05);
  for (const s of [1, -1]) {
    const d = new THREE.Vector3(s * Math.cos(th), -Math.sin(th), 0);
    const nrm = new THREE.Vector3(s * Math.sin(th), Math.cos(th), 0);
    const along = (u: number, off: number): V => {
      const p = ridge.clone().addScaledVector(d, u).addScaledVector(nrm, off);
      return [p.x, p.y, p.z];
    };
    box(1.27, 0.05, 2.2, DARKWOOD, along(0.635, 0), [0, 0, -s * thDeg]);
    for (let k = 0; k < 6; k++)
      box(0.25, 0.05, 2.24, ROOFC[(k + (s > 0 ? 0 : 1)) % 3], along(0.12 + k * 0.205, 0.045 + (k % 2) * 0.012), [0, 0, -s * thDeg + s * 3]);
  }
  box(0.17, 0.17, 2.26, "#8e3524", [1.2, top + 0.72, -0.05], [0, 0, 45]);
  const gable: [number, number, "sharp"][] = [
    [-0.75, 0, "sharp"],
    [0.75, 0, "sharp"],
    [0, 0.65, "sharp"],
  ];
  for (const z of [0.85, -0.95])
    b.extrude(gable, { at: [1.2, top, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, color: plankX[2] });
  cyl(0.09, 0.03, "#2a1a10", [1.2, 4.82, 0.885], [0, 0, 1], 10);
  b.part(new THREE.TorusGeometry(0.1, 0.025, 5, 10), TRIM, { at: [1.2, 4.82, 0.89], flat: true });

  // stovepipe
  cyl(0.07, 0.8, METAL, [0.8, 5.08, -0.5], [0, 1, 0], 8);
  cyl(0.09, 0.06, "#3f444a", [0.8, 5.3, -0.5], [0, 1, 0], 8);
  b.part(new THREE.ConeGeometry(0.14, 0.12, 8), "#3f444a", { at: [0.8, 5.56, -0.5], flat: true });

  // pennant
  rod([1.2, 5.2, 0.98], [1.2, 5.88, 0.98], 0.02, DARKWOOD);
  b.extrude(
    [
      [0, 0, "sharp"],
      [0.42, 0.1, "sharp"],
      [0, 0.2, "sharp"],
    ],
    { at: [1.21, 5.64, 0.98], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.015, color: "#f3a712" },
  );

  // lantern under the eave
  rod([2.05, 4.42, 1.0], [2.05, 4.16, 1.0], 0.01, METAL);
  b.part(new THREE.ConeGeometry(0.1, 0.09, 4), METAL, { at: [2.05, 4.12, 1.0], rotation: [0, 45, 0], flat: true });
  box(0.12, 0.16, 0.12, GLASS, [2.05, 3.995, 1.0]);
  box(0.15, 0.03, 0.15, METAL, [2.05, 3.905, 1.0]);
  for (const sx2 of [1, -1]) for (const sz2 of [1, -1]) rod([2.05 + sx2 * 0.065, 3.92, 1.0 + sz2 * 0.065], [2.05 + sx2 * 0.065, 4.08, 1.0 + sz2 * 0.065], 0.008, METAL);

  // telescope
  const tp: V = [-0.5, 3.6, -0.5];
  for (let k = 0; k < 3; k++) {
    const a = (k * 120 + 30) * DEG;
    rod(tp, [-0.5 + 0.25 * Math.cos(a), 3.03, -0.5 + 0.25 * Math.sin(a)], 0.015, DARKWOOD);
  }
  rod([-0.62, 3.52, -0.66], [-0.28, 3.95, -0.2], [0.045, 0.068], BRASS);
  cyl(0.075, 0.05, "#3f444a", [-0.3, 3.925, -0.23], [0.34, 0.43, 0.46], 8);
  rod([-0.62, 3.52, -0.66], [-0.67, 3.46, -0.73], 0.022, "#3f444a");

  // crane and bucket
  box(0.09, 1.3, 0.09, DARKWOOD, [2.12, 3.68, 1.42]);
  rod([2.12, 4.25, 1.36], [2.12, 4.25, 2.1], 0.035, DARKWOOD, true);
  rod([2.12, 3.85, 1.42], [2.12, 4.22, 1.8], 0.025, DARKWOOD, true);
  cyl(0.06, 0.04, METAL, [2.12, 4.17, 2.0], [1, 0, 0], 10);
  rod([2.12, 4.12, 2.0], [2.12, 2.115, 2.0], 0.012, ROPE);
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.16, 0.26],
      [0.145, 0.26],
      [0.12, 0.025],
      [0, 0.025],
    ],
    { at: [2.12, 1.7, 2.0], segments: 10, color: "#4f8fcf" },
  );
  b.part(new THREE.TorusGeometry(0.158, 0.012, 4, 10), "#2f5f8f", { at: [2.12, 1.86, 2.0], rotation: [90, 0, 0], flat: true });
  b.part(new THREE.TorusGeometry(0.155, 0.01, 4, 10, Math.PI), METAL, { at: [2.12, 1.96, 2.0], rotation: [0, 90, 0], flat: true });

  // bunting
  const apex: V = [1.2, 5.12, 1.08];
  const BUNT = ["#e4572e", "#f3a712", "#29a9a6", "#f6f0d8", "#7b5ea7"];
  const spans: [any, number][] = [
    [catmull([apex, [1.66, 4.55, 1.28], [2.12, 4.33, 1.42]]), 4],
    [catmull([apex, [0.54, 4.35, 1.3], [-0.12, 3.97, 1.45]]), 7],
  ];
  let fi = 0;
  for (const [path, n] of spans) {
    b.sweep(path, 0.008, { color: TRIM, sides: 4 });
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const p = path.at(t);
      const tg = path.tangentAt(t);
      const h = new THREE.Vector3(tg.x, 0, tg.z).normalize();
      b.extrude(
        [
          [-0.07, 0, "sharp"],
          [0.07, 0, "sharp"],
          [0, -0.15, "sharp"],
        ],
        { at: [p.x, p.y, p.z], x: [h.x, 0, h.z], y: [0, 1, 0], thickness: 0.012, color: BUNT[fi++ % BUNT.length] },
      );
    }
  }

  // ---------- foliage ----------
  const clusters: [V, number][] = [
    [[-0.2, 7.1, 0], 1.3],
    [[0.9, 6.6, 0.3], 1.0],
    [[-1.1, 6.5, 0.4], 1.0],
    [[1.6, 6.35, -0.5], 0.9],
    [[-0.7, 6.25, -1.5], 0.9],
    [[0.3, 6.15, 1.3], 0.85],
    [[-2.6, 5.0, 0.4], 0.8],
    [[-0.4, 7.9, -0.3], 0.8],
    [[0.6, 7.5, -0.6], 0.75],
  ];
  const leaves: any[] = [];
  clusters.forEach(([at, r], i) => {
    leaves.push(
      b.part(new THREE.IcosahedronGeometry(r, 1), LEAVES[i % LEAVES.length], {
        at,
        flat: true,
        scale: [1, 0.82, 1],
        rotation: [rand() * 60, rand() * 360, 0],
      }),
    );
  });
  const leafTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 2 C29 16 29 44 16 62 C3 44 3 16 16 2Z" fill="#ffffff"/><path d="M16 8 L16 60" stroke="#b8b8b8" stroke-width="2.5"/></svg>`,
    { size: 64 },
  );
  const canopy = b.surface(leaves);
  const leafHits = canopy.scatter(240, { rng: rng(5), minDist: 0.22, filter: (h: any) => h.n.y > -0.4 });
  b.cards(leafHits, leafTex, {
    size: [0.2, 0.32],
    lean: 55,
    bend: 20,
    vary: 0.3,
    spin: 30,
    rng: rng(6),
    color: mottle("#8cc256", "#4d8a3a", { size: 0.9 }),
  });
  for (const h of canopy.scatter(16, { rng: rng(9), minDist: 0.6, filter: (hh: any) => hh.n.y < 0.6 }))
    b.stick(new THREE.SphereGeometry(0.075, 6, 4), "#d8423a", h, { embed: 0.3 });

  // ---------- ground details ----------
  const mush: V[] = [
    [0.75, 0.08, 0.95],
    [0.95, 0.08, 0.7],
    [-1.0, 0.08, -0.6],
  ];
  mush.forEach((m, i) => {
    const h = 0.12 + i * 0.03;
    cyl(0.03, h, TRIM, [m[0], m[1] + h / 2, m[2]], [0, 1, 0], 6);
    b.part(new THREE.SphereGeometry(0.08 + i * 0.01, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#d8423a", {
      at: [m[0], m[1] + h - 0.01, m[2]],
      flat: true,
    });
    for (let k = 0; k < 3; k++) {
      const a = (k * 120 + i * 40) * DEG;
      b.part(new THREE.SphereGeometry(0.014, 5, 3), "#ffffff", {
        at: [m[0] + Math.cos(a) * 0.045, m[1] + h + 0.045, m[2] + Math.sin(a) * 0.045],
      });
    }
  });
  const rocks: V[] = [
    [1.6, 0.1, 2.3],
    [-1.6, 0.1, 1.6],
    [2.6, 0.1, -0.6],
    [-1.3, 0.1, -1.9],
  ];
  rocks.forEach((p, i) =>
    b.part(new THREE.DodecahedronGeometry(0.16 + i * 0.03, 0), i % 2 ? "#8d9399" : "#a3a8ad", {
      at: p,
      scale: [1, 0.6, 1.2],
      rotation: [0, i * 47, 0],
      flat: true,
    }),
  );
  for (let i = 0; i < 30; i++) {
    const a = rand() * Math.PI * 2;
    const r = 1.0 + rand() * 1.9;
    const h = 0.14 + rand() * 0.14;
    b.part(new THREE.ConeGeometry(0.045, h, 4), LEAVES[i % LEAVES.length], {
      at: [0.4 + Math.cos(a) * r, 0.08 + h / 2, 0.45 + Math.sin(a) * r],
      rotation: [(rand() - 0.5) * 20, rand() * 90, (rand() - 0.5) * 20],
      flat: true,
    });
  }

  return b.root;
}
