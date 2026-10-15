import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { cells, mottle, Paint, paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description:
    "A towering basalt golem built of cel-shaded stone plates over a molten core, with glowing seams, gold-trimmed pauldrons, a rune-lit chest diamond and ember eyes.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type P = readonly number[];
type Col = string | Paint;

export default function build() {
  const b = createBuilder({ name: "lavaGolem", paintSize: 2048 });
  const R = rng(77);

  // ---- palette -----------------------------------------------------------------------------------------------
  const crack = (base: Paint, seed: number) =>
    paint((p, n) => {
      const c = cells(p, 0.21, seed);
      return c.d2 - c.d1 < 0.03 ? "#ff8a2a" : base.at(p, n);
    });
  const ROCK_A = crack(cel(mottle("#6f4c43", "#58392f", { size: 0.25, seed: 3 })), 4);
  const ROCK_B = crack(cel(mottle("#4f3531", "#3b2828", { size: 0.18, seed: 5 })), 8);
  const ROCK_C = crack(cel(mottle("#84604d", "#6a463a", { size: 0.3, seed: 9 })), 12);
  const ROCKS: Col[] = [ROCK_A, ROCK_B, ROCK_C, ROCK_B];
  const GOLD = cel("#e6b44e", "#b8722f");
  const LAVA = "#ff5f16";
  const LAVA2 = "#ffb22c";
  const CORE = "#fff1a8";

  const RUNE = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M50 4 L96 60 L50 116 L4 60 Z" fill="#ff6a1a"/>
      <path d="M50 14 L86 60 L50 106 L14 60 Z" fill="#ff9a24"/>
      <path d="M50 24 L76 60 L50 96 L24 60 L50 34 L66 60 L50 84 L34 60 L50 46 L58 60 L50 70" stroke="#fff0a0" stroke-width="6" fill="none" stroke-linejoin="miter"/>
    </svg>`,
    { size: 256 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 60 80">
      <path d="M30 2 L58 40 L30 78 L2 40 Z" fill="#ff7a1c"/>
      <path d="M30 20 L44 40 L30 60 L16 40 Z" fill="#ffe27a"/>
      <path d="M30 30 L36 40 L30 50 L24 40 Z" fill="#ff7a1c"/>
    </svg>`,
    { size: 128 },
  );

  // ---- geometry kit ------------------------------------------------------------------------------------------
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const dod = new THREE.DodecahedronGeometry(1, 0);
  const box = new THREE.BoxGeometry(2, 2, 2);
  const GEOS = [ico, dod, dod, ico, box];
  const pickGeo = () => GEOS[Math.floor(R() * GEOS.length)];
  const pickRock = () => ROCKS[Math.floor(R() * ROCKS.length)];
  const V = (p: P) => new THREE.Vector3(p[0], p[1], p[2]);
  const arr = (v: THREE.Vector3) => [v.x, v.y, v.z];

  /** A rock chunk with random orientation. */
  const rock = (bone: Joint, at: P, half: P, col: Col, rot?: P) =>
    b.part(pickGeo(), col, {
      bone,
      at,
      scale: half,
      rotation: rot ?? [R() * 360, R() * 360, R() * 360],
      flat: true,
    });
  /** A plate: local y along `dir`, local z toward `up`; half extents [x, y, z]. */
  const plate = (bone: Joint, at: P, dir: P, up: P, half: P, col: Col) =>
    b.part(pickGeo(), col, { bone, at, dir, up, scale: half, flat: true });
  /** A spike from base along dir, length len. */
  const spike = (bone: Joint, base: P, dir: P, len: number, wx: number, wz: number, col: Col) => {
    const d = V(dir).normalize();
    const c = V(base).addScaledVector(d, len / 2);
    return b.part(ico, col, { bone, at: arr(c), dir: arr(d), up: [0, 0, 1], scale: [wx, len / 2, wz], flat: true });
  };
  const lava = <T extends Parameters<typeof glow>[0]>(t: T, k = 1.2) => glow(t, k);
  const ball = (bone: Joint, at: P, r: number, col = LAVA) =>
    lava(b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at }), 1.3);
  const core = (bone: Joint, a: P, c: P, r: number) =>
    lava(b.capsule(a, c, r, { color: LAVA, bone, sides: 6 }), 1.2);
  const cuff = (bone: Joint, at: P, dir: P, r: number, t: number) =>
    lava(b.part(new THREE.TorusGeometry(r, t, 5, 10), LAVA2, { bone, at, dir, axis: "z" }), 1.5);

  /** Plates around a limb segment; the molten core shows in the gaps. */
  const armor = (bone: Joint, a: P, c: P, r: number, n: number, k: number, goldP: number) => {
    const A = V(a);
    const ax = V(c).sub(A);
    const L = ax.length();
    ax.normalize();
    const ref = Math.abs(ax.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    const u = ref.clone().sub(ax.clone().multiplyScalar(ref.dot(ax))).normalize();
    const v = ax.clone().cross(u);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n + (R() - 0.5) * 0.05;
      for (let j = 0; j < k; j++) {
        const ang = i * 1.1 + (j * Math.PI * 2) / k + (R() - 0.5) * 0.5;
        const rad = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(v, Math.sin(ang));
        const pos = A.clone().addScaledVector(ax, L * t).addScaledVector(rad, r * (0.74 + R() * 0.12));
        const g = R() < goldP;
        plate(
          bone,
          arr(pos),
          arr(ax),
          arr(rad),
          [r * (0.42 + R() * 0.2), (L / n) * (0.5 + R() * 0.2) * (g ? 1.25 : 1), r * (g ? 0.36 : 0.3 + R() * 0.1)],
          g ? GOLD : pickRock(),
        );
      }
    }
  };

  /** Plates over an ellipsoid shell. */
  const shell = (
    bone: Joint,
    c: P,
    rx: number,
    ry: number,
    rz: number,
    rows: number,
    per: number,
    half: P,
    skip?: (nx: number, ny: number, nz: number) => boolean,
  ) => {
    for (let r = 0; r < rows; r++) {
      const phi = ((-78 + (156 * (r + 0.5)) / rows) * Math.PI) / 180;
      const cnt = Math.max(3, Math.round(per * Math.cos(phi)));
      for (let j = 0; j < cnt; j++) {
        const th = (j / cnt + ((r % 2) * 0.5) / cnt) * Math.PI * 2 + (R() - 0.5) * 0.2;
        const nx = Math.sin(th) * Math.cos(phi);
        const ny = Math.sin(phi);
        const nz = Math.cos(th) * Math.cos(phi);
        if (skip && skip(nx, ny, nz)) continue;
        const g = R() < 0.09;
        const s = 0.8 + R() * 0.4;
        plate(
          bone,
          [c[0] + rx * nx, c[1] + ry * ny, c[2] + rz * nz],
          [nx / rx, ny / ry, nz / rz],
          [0, 1, 0],
          [half[0] * s, half[1] * (g ? 1.3 : 0.9 + R() * 0.3), half[2] * s],
          g ? GOLD : pickRock(),
        );
      }
    }
  };

  // ---- skeleton ----------------------------------------------------------------------------------------------
  type Role = NonNullable<Parameters<typeof b.joint>[1]["role"]>;
  const J = (name: string, parent: Joint, at: P, to: P, role?: Role) => b.joint(name, { parent, at, aim: to, role });

  const hips = b.joint("hips", { at: [0, 1.6, 0], dir: [0, 1, 0], role: "spine" });
  const spine = J("spine", hips, [0, 1.8, 0], [0, 2.4, 0.1], "spine");
  const chest = J("chest", spine, [0, 2.4, 0.1], [0, 2.9, 0.15], "spine");
  const neck = J("neck", chest, [0, 2.9, 0.15], [0, 3.05, 0.25], "neck");
  const head = J("head", neck, [0, 3.05, 0.25], [0, 3.2, 0.6], "head");
  const jaw = J("jaw", head, [0, 3.0, 0.4], [0, 2.93, 0.7], "jaw");

  // ---- torso -------------------------------------------------------------------------------------------------
  b.part(new THREE.SphereGeometry(1, 10, 8), LAVA, { bone: chest, at: [0, 2.45, 0.05], scale: [0.68, 0.5, 0.46] });
  glow(b.part(new THREE.SphereGeometry(1, 8, 6), LAVA, { bone: spine, at: [0, 1.8, 0], scale: [0.45, 0.34, 0.32] }), 1.2);
  glow(b.part(new THREE.SphereGeometry(1, 8, 6), LAVA, { bone: hips, at: [0, 1.55, 0], scale: [0.5, 0.22, 0.35] }), 1.2);
  shell(chest, [0, 2.45, 0.05], 0.88, 0.62, 0.6, 5, 9, [0.27, 0.17, 0.21], (nx, _ny, nz) => nz > 0.6 && Math.abs(nx) < 0.32);
  shell(spine, [0, 1.8, 0], 0.62, 0.4, 0.44, 3, 8, [0.24, 0.15, 0.2]);
  shell(hips, [0, 1.55, 0], 0.66, 0.27, 0.48, 2, 8, [0.24, 0.13, 0.2]);

  // chest rune diamond
  b.extrude(
    [
      [0, 0.4, "sharp"],
      [0.31, 0, "sharp"],
      [0, -0.4, "sharp"],
      [-0.31, 0, "sharp"],
    ],
    { at: [0, 2.5, 0.56], x: [1, 0, 0], thickness: 0.12, bevel: 0.03, color: GOLD, bone: chest },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.46, 0.55), "#ffffff", { bone: chest, at: [0, 2.5, 0.623], dir: [0, 0, 1], axis: "z", texture: RUNE }),
    1.5,
  );
  // belt buckle shard and loincloth plates
  for (let i = -1; i <= 1; i++) {
    b.part(ico, GOLD, {
      bone: hips,
      at: [i * 0.27, 1.37 - Math.abs(i) * 0.03, 0.44],
      dir: [i * 0.15, -0.25, 1],
      up: [0, 1, 0],
      scale: [0.14, 0.035, 0.21],
      flat: true,
    });
  }
  // dorsal spikes
  for (let i = 0; i < 6; i++) {
    const y = 1.95 + i * 0.2;
    spike(y > 2.4 ? chest : spine, [0, y, -0.5 - (i > 2 ? 0.04 * (i - 2) : 0)], [0, 0.7, -1], 0.34 + (i % 3) * 0.08, 0.09, 0.1, i % 2 ? GOLD : ROCK_B);
  }

  // ---- neck and head -----------------------------------------------------------------------------------------
  ball(neck, [0, 2.95, 0.18], 0.2);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    rock(neck, [Math.sin(a) * 0.22, 2.97 + (i % 2) * 0.06, 0.18 + Math.cos(a) * 0.2], [0.12, 0.1, 0.12], pickRock());
  }
  rock(head, [0, 3.24, 0.3], [0.3, 0.26, 0.3], ROCK_B, [0, 0, 0]);
  rock(head, [0, 3.16, 0.52], [0.1, 0.17, 0.1], ROCK_A, [0, 0, 0]);
  rock(head, [0, 3.36, 0.38], [0.22, 0.1, 0.2], ROCK_C);
  rock(head, [0, 3.2, 0.06], [0.28, 0.24, 0.16], ROCK_A);
  for (const s of [1, -1]) {
    rock(head, [s * 0.2, 3.36, 0.5], [0.15, 0.06, 0.1], ROCK_A, [0, 0, s * -20]);
    rock(head, [s * 0.3, 3.1, 0.38], [0.1, 0.13, 0.15], ROCK_C);
    rock(head, [s * 0.32, 3.28, 0.22], [0.1, 0.14, 0.14], ROCK_B);
    b.part(ico, INK, { bone: head, at: [s * 0.17, 3.25, 0.565], scale: [0.11, 0.055, 0.045], rotation: [0, 0, s * -22], flat: true });
    glow(b.part(ico, LAVA2, { bone: head, at: [s * 0.17, 3.25, 0.595], scale: [0.08, 0.028, 0.03], rotation: [0, 0, s * -22], flat: true }), 2);
    glow(b.part(ico, CORE, { bone: head, at: [s * 0.16, 3.25, 0.61], scale: [0.04, 0.014, 0.016], rotation: [0, 0, s * -22], flat: true }), 2);
    spike(head, [s * 0.26, 3.4, 0.18], [s * 0.8, 1, -0.2], 0.62, 0.07, 0.1, GOLD);
  }
  for (let i = -2; i <= 2; i++) {
    const a = Math.abs(i);
    spike(head, [i * 0.12, 3.44 - a * 0.04, 0.24 - a * 0.02], [i * 0.25, 1, -0.15], 0.34 + (2 - a) * 0.12, 0.07, 0.09, pickRock());
  }
  glow(b.part(ico, LAVA2, { bone: head, at: [0, 2.99, 0.5], scale: [0.14, 0.045, 0.12], flat: true }), 1.6);
  rock(jaw, [0, 2.92, 0.5], [0.2, 0.08, 0.17], ROCK_B, [0, 0, 0]);
  spike(jaw, [0, 2.88, 0.62], [0, -0.4, 1], 0.2, 0.07, 0.07, GOLD);
  for (const s of [1, -1]) rock(jaw, [s * 0.2, 2.96, 0.4], [0.07, 0.09, 0.13], ROCK_A);
  for (let i = -2; i <= 2; i++) spike(jaw, [i * 0.065, 2.98, 0.6], [0, 1, 0.25], 0.07, 0.022, 0.022, "#ffe9a0");

  // ---- arms and hands ----------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const shP = [s * 1.0, 2.75, 0.05];
    const elP = [s * 1.25, 1.95, 0.12];
    const wrP = [s * 1.3, 1.15, 0.42];
    const sh = J(`shoulder${L}`, chest, shP, elP, "arm");
    const el = J(`elbow${L}`, sh, elP, wrP, "arm");
    const wr = J(`wrist${L}`, el, wrP, [s * 1.32, 0.92, 0.5], "arm");

    core(sh, shP, elP, 0.22);
    core(el, elP, wrP, 0.26);
    ball(sh, shP, 0.3);
    ball(el, elP, 0.3);
    armor(sh, shP, elP, 0.3, 4, 3, 0.1);
    armor(el, elP, wrP, 0.38, 4, 3, 0.1);
    cuff(el, wrP, [s * 0.05, -1, 0.3], 0.3, 0.04);
    cuff(sh, [s * 1.12, 2.32, 0.09], [s * 0.25, -1, 0.07], 0.3, 0.035);

    // pauldron
    rock(sh, [s * 1.08, 3.0, 0], [0.46, 0.32, 0.43], ROCK_A);
    rock(sh, [s * 0.82, 3.2, -0.12], [0.32, 0.25, 0.3], ROCK_C);
    rock(sh, [s * 1.3, 2.82, 0.1], [0.24, 0.3, 0.26], ROCK_B);
    rock(sh, [s * 1.0, 2.9, 0.38], [0.3, 0.2, 0.22], ROCK_B);
    spike(sh, [s * 1.1, 3.2, -0.02], [s * 0.35, 1, -0.15], 1.0, 0.2, 0.26, GOLD);
    spike(sh, [s * 0.85, 3.3, -0.12], [s * 0.1, 1, -0.2], 0.7, 0.14, 0.18, ROCK_B);
    spike(sh, [s * 1.35, 3.05, 0.05], [s * 1, 0.7, 0], 0.55, 0.12, 0.15, ROCK_A);
    glow(
      b.part(new THREE.PlaneGeometry(0.16, 0.22), "#ffffff", { bone: sh, at: [s * 1.2, 3.38, 0.1], dir: [s * 0.9, 0.5, 0.35], axis: "z", texture: GLYPH }),
      1.4,
    );
    // forearm bracer
    rock(el, [s * 1.62, 1.5, 0.28], [0.2, 0.45, 0.28], ROCK_B);
    b.part(ico, GOLD, { bone: el, at: [s * 1.78, 1.45, 0.32], scale: [0.09, 0.4, 0.2], flat: true });
    spike(el, [s * 1.45, 2.0, 0.0], [s * 1, 0.3, -0.5], 0.5, 0.11, 0.11, GOLD);
    rock(el, [s * 1.0, 1.55, 0.5], [0.2, 0.3, 0.2], ROCK_C);

    // hand
    const H = [s * 1.32, 0.95, 0.47];
    ball(wr, H, 0.22);
    rock(wr, H, [0.3, 0.28, 0.27], ROCK_A, [0, 0, 0]);
    rock(wr, [s * 1.32, 1.12, 0.33], [0.27, 0.12, 0.2], ROCK_B);
    spike(wr, [s * 1.45, 1.1, 0.5], [s * 0.3, 1, 0.3], 0.4, 0.08, 0.1, GOLD);
    for (let i = 0; i < 4; i++) {
      const x = s * 1.32 + (i - 1.5) * 0.16 * -s;
      const p0 = [x, 0.78, 0.63];
      const p1 = [x, 0.58, 0.72 + (i === 1 || i === 2 ? 0.03 : 0)];
      const p2 = [x, 0.42, 0.68];
      const f1 = J(`finger${L}${i + 1}a`, wr, p0, p1, "digit");
      const f2 = J(`finger${L}${i + 1}b`, f1, p1, p2, "digit");
      ball(f1, p0, 0.055, LAVA);
      ball(f2, p1, 0.05, LAVA);
      plate(f1, arr(V(p0).lerp(V(p1), 0.5)), arr(V(p1).sub(V(p0))), [0, 0, 1], [0.08, 0.14, 0.085], pickRock());
      plate(f2, arr(V(p1).lerp(V(p2), 0.5)), arr(V(p2).sub(V(p1))), [0, 0, 1], [0.07, 0.12, 0.075], pickRock());
      rock(f2, [x, 0.4, 0.68], [0.06, 0.06, 0.07], ROCK_B);
    }
    const t0 = [s * 1.02, 1.0, 0.58];
    const t1 = [s * 0.95, 0.82, 0.72];
    const t2 = [s * 0.95, 0.68, 0.8];
    const th1 = J(`thumb${L}1`, wr, t0, t1, "digit");
    const th2 = J(`thumb${L}2`, th1, t1, t2, "digit");
    ball(th1, t0, 0.05, LAVA);
    plate(th1, arr(V(t0).lerp(V(t1), 0.5)), arr(V(t1).sub(V(t0))), [0, 0, 1], [0.08, 0.14, 0.09], ROCK_C);
    plate(th2, arr(V(t1).lerp(V(t2), 0.5)), arr(V(t2).sub(V(t1))), [0, 0, 1], [0.065, 0.1, 0.07], ROCK_A);
  }

  // ---- legs --------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hipP = [s * 0.42, 1.6, 0];
    const knP = [s * 0.5, 0.88, 0.12];
    const anP = [s * 0.5, 0.28, -0.02];
    const hp = J(`hip${L}`, hips, hipP, knP, "leg");
    const kn = J(`knee${L}`, hp, knP, anP, "leg");
    const an = J(`ankle${L}`, kn, anP, [s * 0.5, 0.12, 0.5], "leg");

    core(hp, hipP, knP, 0.24);
    core(kn, knP, anP, 0.2);
    ball(kn, knP, 0.26);
    ball(an, anP, 0.22);
    armor(hp, hipP, knP, 0.36, 4, 3, 0.1);
    armor(kn, knP, anP, 0.31, 3, 3, 0.1);
    cuff(kn, [s * 0.5, 0.88, 0.12], [0, 1, 0.1], 0.3, 0.035);
    cuff(an, [s * 0.5, 0.4, -0.02], [0, 1, 0], 0.26, 0.035);
    rock(kn, [s * 0.5, 0.9, 0.34], [0.3, 0.26, 0.24], ROCK_C);
    spike(kn, [s * 0.5, 0.95, 0.5], [0, 0.25, 1], 0.4, 0.1, 0.12, GOLD);
    // outer gold diamond with glyph
    b.extrude(
      [
        [0, 0.24, "sharp"],
        [0.17, 0, "sharp"],
        [0, -0.24, "sharp"],
        [-0.17, 0, "sharp"],
      ],
      { at: [s * 0.8, 1.2, 0.08], x: [0, 0, 1], thickness: 0.06, bevel: 0.015, color: GOLD, bone: hp },
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.17, 0.23), "#ffffff", { bone: hp, at: [s * 0.834, 1.2, 0.08], dir: [s, 0, 0], axis: "z", texture: GLYPH }),
      1.4,
    );
    // hip side gold diamond
    b.extrude(
      [
        [0, 0.22, "sharp"],
        [0.15, 0, "sharp"],
        [0, -0.22, "sharp"],
        [-0.15, 0, "sharp"],
      ],
      { at: [s * 0.74, 1.72, 0.14], x: [0, 0, 1], thickness: 0.06, bevel: 0.015, color: GOLD, bone: hips },
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.15, 0.2), "#ffffff", { bone: hips, at: [s * 0.774, 1.72, 0.14], dir: [s, 0, 0], axis: "z", texture: GLYPH }),
      1.4,
    );

    // foot
    glow(b.part(ico, LAVA, { bone: an, at: [s * 0.5, 0.2, 0.25], scale: [0.26, 0.1, 0.36], flat: true }), 1.2);
    rock(an, [s * 0.5, 0.15, 0.2], [0.34, 0.17, 0.44], ROCK_A, [0, s * 5, 0]);
    rock(an, [s * 0.5, 0.2, -0.25], [0.28, 0.2, 0.22], ROCK_B, [0, s * -8, 0]);
    rock(an, [s * 0.5, 0.36, 0.26], [0.26, 0.12, 0.26], ROCK_C);
    for (let i = -1; i <= 1; i++) {
      rock(an, [s * 0.5 + i * 0.23, 0.1, 0.64], [0.1, 0.1, 0.17], i === 0 ? ROCK_C : ROCK_B, [0, i * 10, 0]);
      spike(an, [s * 0.5 + i * 0.23, 0.1, 0.78], [i * 0.1, 0.1, 1], 0.14, 0.05, 0.05, GOLD);
    }
    rock(an, [s * 0.74, 0.14, 0.1], [0.12, 0.13, 0.24], ROCK_B, [0, 0, 0]);
    rock(an, [s * 0.26, 0.14, 0.1], [0.12, 0.13, 0.24], ROCK_C, [0, 0, 0]);
  }

  // ---- drifting embers ---------------------------------------------------------------------------------------
  const sparks: P[] = [
    [-1.55, 3.3, 0.3],
    [1.6, 3.15, -0.2],
    [-0.5, 3.85, 0.1],
    [0.7, 3.7, -0.3],
    [-1.8, 2.2, 0.5],
    [1.85, 2.4, 0.4],
    [-0.9, 3.5, 0.6],
    [0.95, 3.45, 0.55],
  ];
  sparks.forEach((p, i) => glow(b.part(ico, i % 2 ? LAVA2 : LAVA, { bone: chest, at: p, scale: 0.025 + (i % 3) * 0.008, flat: true }), 2));

  return b.root;
}
