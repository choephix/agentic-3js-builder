import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Chain, Joint } from "../../../../src/skeleton";
import { interpolate } from "../../../../src/sweep";
import type { Sweep } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "Hulking, mossy swamp troll with curved lower tusks, a red mohawk, braids, and a heap of bone fetishes: fang necklace, skull belt, spiked bracers and a rune totem.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const SKIN = "#5f8f6a";
const SKIN_D = "#3b6657";
const SKIN_L = "#8eb086";
const MOSS = "#6f8f2a";
const MOSS_L = "#a3c23e";
const BONE = "#ece0bc";
const BONE_D = "#c9b78a";
const RED = "#b3201e";
const RED_D = "#6e1216";
const LEATHER = "#6a4426";
const LEATHER_D = "#3b2415";
const HIDE = "#5b4630";
const CLAW = "#2a2130";
const TUSK = "#f2e8c8";
const MOUTH = "#6d2432";
const GOLD = "#d6a234";
const EYE = "#ffd23a";
const WOOD = "#7a5230";
const NOSE = "#b8706a";
const WART = "#74946a";
const WAR = "#a31d1d";

const MOSSP = mottle(MOSS, MOSS_L, { size: 0.05, seed: 1 });
const skinBase = countershade(
  mottle(SKIN, SKIN_D, { size: 0.3, seed: 2, contrast: 1.2 }),
  mottle(SKIN_L, SKIN, { size: 0.35, seed: 4 }),
  { level: -0.15, soft: 0.6 },
);
const SKINP = paint((p, n) => {
  if (n.y > 0.2 && noise(p, 0.16, 9) > 0.66) return MOSSP;
  if (noise(p, 0.05, 11) > 0.8) return SKIN_D;
  return skinBase;
});
const HEADP = paint((p, n) => {
  const ax = Math.abs(p.x);
  if (p.z > 0.55 && p.y > 2.36 && p.y < 2.5 && ax > 0.1 && ax < 0.25) {
    const k = p.y * 26 + ax * 16;
    if (k - Math.floor(k) < 0.24) return WAR;
  }
  return SKINP;
});
const BONEP = mottle(BONE, BONE_D, { size: 0.04, seed: 7, contrast: 1.5 });
const TUSKP = paint((_p, _n, s) => mix(BONE_D, TUSK, smoothstep(0, 0.45, s[0])));
const LEATHERP = mottle(LEATHER, LEATHER_D, { size: 0.03, seed: 5 });
const HIDEP = mottle(HIDE, "#3a2c1d", { size: 0.06, seed: 6 });
const RAGP = stripes(RED, RED_D, { size: 0.05, axis: "y", seed: 3 });

export default function build() {
  const b = createBuilder({ name: "swampTroll", paintSize: 2048 });
  const rand = rng(7);

  // ---- textures ----------------------------------------------------------------------------------------------
  const mossTex = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 48 C14 30 8 20 2 6 C12 16 16 24 17 34 C18 22 22 12 30 2 C26 18 20 30 20 48Z" fill="#6e9a2c"/><path d="M16 48 C15 36 14 28 14 20 C17 28 18 38 19 48Z" fill="#9bc43c"/></svg>`,
    { size: 64 },
  );
  const shardTex = svg(
    `<svg viewBox="0 0 24 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6e0f14"/><stop offset=".6" stop-color="#c2201c"/><stop offset="1" stop-color="#ff5a3a"/></linearGradient></defs><path d="M2 64 C4 40 8 18 12 0 C16 18 20 40 22 64Z" fill="url(#g)"/><path d="M12 64 C12 44 12 24 12 8" stroke="#4a0a10" stroke-width="1.8" fill="none"/></svg>`,
    { size: 128 },
  );
  const spiralTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#e9dcb4"/><circle cx="32" cy="32" r="27" fill="none" stroke="#8a6a3a" stroke-width="2"/><path d="M32 32 c0 -3 4 -4 6 -2 c3 3 0 9 -5 9 c-8 0 -11 -9 -7 -15 c5 -8 18 -6 20 4 c2 11 -9 18 -18 15" fill="none" stroke="#3a2415" stroke-width="3" stroke-linecap="round"/></svg>`,
    { size: 192 },
  );
  const totemTex = svg(
    `<svg viewBox="0 0 32 80"><rect width="32" height="80" fill="#7a5230"/><rect x="1.5" y="1.5" width="29" height="77" fill="none" stroke="#3b2415" stroke-width="3"/><path d="M8 10 L24 26 M24 10 L8 26" stroke="#e9dcb4" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="44" r="9" fill="none" stroke="#e9dcb4" stroke-width="3"/><path d="M16 44 c0 -3 3 -3 3 0 c0 4 -6 4 -6 -1" fill="none" stroke="#b3201e" stroke-width="2.4" stroke-linecap="round"/><path d="M16 56 L16 74 M9 64 L23 64" stroke="#b3201e" stroke-width="3" stroke-linecap="round"/></svg>`,
    { size: 160 },
  );

  // ---- skeleton ----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.2, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.2, 0],
      [0, 1.55, 0.06],
      [0, 1.95, 0.12],
      [0, 2.2, 0.12],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.2, 0.12],
      [0, 2.32, 0.26],
      [0, 2.42, 0.4],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.42, 0.4], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.36, 0.46], dir: [0, -0.08, 1], role: "jaw" });

  // ---- helpers -----------------------------------------------------------------------------------------------
  const keyed = (arr: number[], t: number) =>
    interpolate(
      arr.map((_, i) => i / (arr.length - 1)),
      arr,
      t,
    );
  const blob = (at: number[], scale: number[], color: string | Paint, bone: Joint) =>
    b.part(new THREE.SphereGeometry(1, 8, 6), color, { bone, at, scale });
  const cord = (pts: number[][], r: number, color: string | Paint, bone: Joint) =>
    b.sweep(catmull(pts), r, { color, bone, sides: 6 });
  const fang = (base: number[], dir: number[], len: number, r: number, bone: Joint) =>
    b.spike(base, dir, len, r, BONEP, { bone, sides: 6 });

  const skull = (c: number[], k: number, bone: Joint) => {
    const [x, y, z] = c;
    blob([x, y, z], [0.075 * k, 0.085 * k, 0.09 * k], BONEP, bone);
    b.frustumBox([x, y - 0.025 * k, z + 0.06 * k], [x, y - 0.1 * k, z + 0.15 * k], [0.08 * k, 0.075 * k], [0.055 * k, 0.055 * k], {
      bone,
      color: BONEP,
    });
    blob([x, y - 0.1 * k, z + 0.155 * k], [0.03 * k, 0.015 * k, 0.012 * k], CLAW, bone);
    for (const s of [1, -1]) {
      blob([x + s * 0.042 * k, y + 0.005 * k, z + 0.072 * k], [0.024 * k, 0.03 * k, 0.02 * k], CLAW, bone);
      b.spike([x + s * 0.065 * k, y + 0.045 * k, z], [s, 0.7, 0.1], 0.11 * k, 0.02 * k, BONEP, { bone, sides: 5 });
    }
  };

  // ---- torso -------------------------------------------------------------------------------------------------
  const TY0 = 1.18;
  const TY1 = 2.2;
  const TX = [0, 0.12, 0.35, 0.65, 0.9, 1];
  const RXs = [0.32, 0.43, 0.5, 0.58, 0.6, 0.5];
  const RYs = [0.28, 0.36, 0.42, 0.44, 0.38, 0.3];
  const tAt = (y: number) => Math.min(1, Math.max(0, (y - TY0) / (TY1 - TY0)));
  const zc = (y: number) => interpolate([1.18, 1.45, 1.85, 2.2], [0, 0.05, 0.12, 0.12], y);
  const rxAt = (y: number) => interpolate(TX, RXs, tAt(y));
  const ryAt = (y: number) => interpolate(TX, RYs, tAt(y));
  const torsoPt = (x: number, y: number, side: number, lift: number) => {
    const k = Math.sqrt(Math.max(0, 1 - (x / rxAt(y)) ** 2));
    return [x, y, zc(y) + side * (ryAt(y) * k + lift)];
  };

  const torso = b.sweep(
    catmull([
      [0, 1.18, 0],
      [0, 1.45, 0.05],
      [0, 1.85, 0.12],
      [0, 2.2, 0.12],
    ]),
    (t) => [interpolate(TX, RXs, t), interpolate(TX, RYs, t)],
    { bone: [hips, spine], color: SKINP, sides: 12 },
  );
  const bodySweeps: Sweep[] = [torso];

  b.sweep(neck, [0.3, 0.27, 0.25], { color: SKINP });
  for (const s of [1, -1]) {
    blob([s * 0.3, 2.2, 0.0], [0.28, 0.18, 0.25], SKINP, chest);
    blob([s * 0.26, 1.98, torsoPt(s * 0.26, 1.98, 1, 0)[2] - 0.04], [0.25, 0.2, 0.17], SKINP, chest);
  }
  blob([0, 1.5, torsoPt(0, 1.5, 1, 0)[2] - 0.1], [0.36, 0.3, 0.22], SKINP, spine.joints[0]);
  b.along(
    torso,
    7,
    (at) => {
      b.stick(new THREE.ConeGeometry(0.045, 0.11, 5), SKIN_D, at);
    },
    { from: 0.2, to: 0.95 },
  );

  // ---- belt, loincloth, belly fetishes -------------------------------------------------------------------------
  const ring = (y: number, rExtra: number, r: number, color: string | Paint) => {
    const pts: number[][] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push([(rxAt(y) + rExtra) * Math.cos(a), y, zc(y) + (ryAt(y) + rExtra) * Math.sin(a)]);
    }
    b.sweep(catmull(pts, { closed: true }), r, { color, bone: hips, sides: 6 });
  };
  ring(1.3, 0.05, 0.05, LEATHERP);
  ring(1.22, 0.04, 0.035, RAGP);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const x = (rxAt(1.3) + 0.1) * Math.cos(a);
    const z = zc(1.3) + (ryAt(1.3) + 0.1) * Math.sin(a);
    b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLD, { bone: hips, at: [x, 1.3, z] });
  }

  const flap = (x: number, len: number, wid: number, col: string | Paint, side: number) => {
    const y0 = 1.27;
    const a = Math.asin(Math.max(-0.9, Math.min(0.9, x / rxAt(y0))));
    const [px, , pz] = torsoPt(x, y0, side, 0.07 + (Math.abs(x) > 0.15 ? 0.05 : 0));
    b.extrude(
      [
        [-wid, 0],
        [wid, 0],
        [wid * 0.9, -len * 0.7],
        [wid * 0.3, -len, "sharp"],
        [-wid * 0.2, -len * 0.8],
        [-wid * 0.9, -len * 0.9],
      ],
      { at: [px, y0, pz], x: [Math.cos(a), 0, -side * Math.sin(a)], thickness: 0.02, color: col, bone: hips },
    );
  };
  const frontCols = [RAGP, HIDEP, LEATHERP, RAGP, HIDEP, RAGP, LEATHERP, HIDEP, RAGP];
  for (let i = 0; i < 9; i++) flap(-0.36 + i * 0.09, 0.42 + ((i * 37) % 5) * 0.05, 0.055, frontCols[i], 1);
  for (let i = 0; i < 7; i++) flap(-0.3 + i * 0.1, 0.5 + ((i * 53) % 4) * 0.06, 0.06, frontCols[(i + 3) % 9], -1);

  const fz = torsoPt(0, 1.3, 1, 0.12)[2];
  for (let i = -4; i <= 4; i++) {
    if (Math.abs(i) <= 1) continue;
    const bp = torsoPt(i * 0.09, 1.2, 1, 0.08);
    fang(bp, [0, -1, 0.25], 0.12 + (i % 2 ? 0.04 : 0), 0.026, hips);
  }
  skull([-0.08, 1.3, fz + 0.04], 1.5, hips);
  b.part(new THREE.TorusGeometry(0.06, 0.014, 5, 10), BONE, { bone: hips, at: [-0.26, 1.22, fz - 0.03] });
  cord(
    [
      [0.17, 1.3, fz - 0.02],
      [0.17, 1.2, fz + 0.06],
      [0.17, 1.14, fz + 0.1],
    ],
    0.01,
    LEATHER_D,
    hips,
  );
  b.part(new THREE.BoxGeometry(0.17, 0.41, 0.03), LEATHER_D, { bone: hips, at: [0.17, 0.93, fz + 0.1] });
  b.part(new THREE.PlaneGeometry(0.16, 0.4), "#ffffff", {
    bone: hips,
    at: [0.17, 0.93, fz + 0.118],
    dir: [0, 0, 1],
    axis: "z",
    texture: totemTex,
  });
  fang([0.17, 0.74, fz + 0.1], [0, -1, 0.1], 0.09, 0.02, hips);

  // ---- necklace ------------------------------------------------------------------------------------------------
  const neckPts = [
    [0.3, 2.3, 0.12],
    torsoPt(0.36, 2.27, 1, 0.05),
    torsoPt(0.33, 2.12, 1, 0.05),
    torsoPt(0.2, 1.95, 1, 0.05),
    torsoPt(0, 1.84, 1, 0.05),
    torsoPt(-0.2, 1.95, 1, 0.05),
    torsoPt(-0.33, 2.12, 1, 0.05),
    torsoPt(-0.36, 2.27, 1, 0.05),
    [-0.3, 2.3, 0.12],
  ];
  const necklace = catmull(neckPts);
  b.sweep(necklace, 0.017, { color: LEATHER_D, bone: chest, sides: 6 });
  let bead = 0;
  const beadCols = [RED, WOOD, BONE, GOLD];
  b.along(necklace, 19, (at) => {
    const i = bead++;
    if (i % 3 === 1) {
      fang(at.at.toArray(), [0, -1, 0.12], 0.13 + (i % 2) * 0.07, 0.034, chest);
    } else {
      b.part(new THREE.SphereGeometry(0.03, 6, 4), beadCols[i % 4], { bone: chest, at: at.at });
    }
  });
  const pz = torsoPt(0, 1.7, 1, 0)[2];
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 10), BONE_D, { bone: chest, at: [0, 1.78, pz + 0.05], dir: [0, 0, 1] });
  b.part(new THREE.CircleGeometry(0.07, 12), "#ffffff", {
    bone: chest,
    at: [0, 1.78, pz + 0.063],
    dir: [0, 0, 1],
    axis: "z",
    texture: spiralTex,
  });
  skull([0, 1.6, torsoPt(0, 1.6, 1, 0)[2] + 0.07], 1.3, chest);
  cord(
    [
      [0, 1.84, torsoPt(0, 1.84, 1, 0.05)[2]],
      [0, 1.7, pz + 0.04],
    ],
    0.01,
    LEATHER_D,
    chest,
  );

  // ---- arms ----------------------------------------------------------------------------------------------------
  const ARM_R = [0.2, 0.19, 0.15, 0.18, 0.15];
  const LEG_R = [0.23, 0.21, 0.17, 0.155, 0.14];
  const wrap = (
    ch: Chain,
    radii: number[],
    t: number,
    color: string | Paint,
    opts: { fangs?: number; rag?: number } = {},
  ) => {
    const cp = ch.at(t);
    const r = keyed(radii, t) + 0.02;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push(
        cp.at
          .clone()
          .addScaledVector(cp.normal, Math.cos(a) * r)
          .addScaledVector(cp.binormal, Math.sin(a) * r),
      );
    }
    const bone = ch.jointAt(t);
    b.sweep(catmull(pts, { closed: true }), 0.024, { color, bone, sides: 5 });
    const n = opts.fangs ?? 0;
    for (let k = 0; k < n; k++) {
      const a = ((k + 0.5) / n) * Math.PI * 2;
      const out = cp.normal
        .clone()
        .multiplyScalar(Math.cos(a))
        .addScaledVector(cp.binormal, Math.sin(a));
      const base = cp.at.clone().addScaledVector(out, r);
      b.spike(base, out, 0.11, 0.028, BONEP, { bone, sides: 5 });
    }
    if (opts.rag) {
      let low = pts[0];
      for (const p of pts) if (p.y < low.y) low = p;
      b.spike(low, [0, -1, 0], opts.rag, 0.035, RED, { bone, sides: 4 });
    }
  };

  const fingerSweeps: Sweep[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.62, 2.04, 0.1], [s * 1.04, 0.98, 0.3], [0.72, 0.72], [[s * 0.4, 0, -1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    bodySweeps.push(b.sweep(arm, ARM_R, { color: SKINP }));
    const shoulder = arm.joints[0];
    const wrist = arm.tip!;
    const W = wrist.at;
    const P = (dx: number, dy: number, dz: number) => [W.x + dx, W.y + dy, W.z + dz];

    // shoulder mass
    blob([s * 0.64, 2.06, 0.08], [0.27, 0.26, 0.26], SKINP, shoulder);

    // hand
    blob(P(0, -0.13, 0.04), [0.17, 0.18, 0.13], SKINP, wrist);
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 0.075 * s;
      const p0 = P(x, -0.2, 0.03);
      const p1 = P(x, -0.36, 0.07);
      const p2 = P(x, -0.47, 0.17);
      const f = b.chain(`finger${S}${i}`, catmull([p0, p1, p2]), {
        parent: wrist,
        names: [`finger${S}${i}a`, `finger${S}${i}b`],
        role: "digit",
      });
      fingerSweeps.push(b.sweep(f, [0.05, 0.035], { color: SKINP, sides: 6 }));
      blob(P(x, -0.2, 0.0), [0.055, 0.05, 0.05], SKINP, wrist);
      b.spike(p2, [0, -0.55, 0.8], 0.1, 0.032, CLAW, { bone: f.joints[1], sides: 5 });
    }
    {
      const p0 = P(-s * 0.1, -0.12, 0.05);
      const p1 = P(-s * 0.16, -0.22, 0.12);
      const p2 = P(-s * 0.14, -0.3, 0.21);
      const f = b.chain(`thumb${S}`, catmull([p0, p1, p2]), {
        parent: wrist,
        names: [`thumb${S}a`, `thumb${S}b`],
        role: "digit",
      });
      fingerSweeps.push(b.sweep(f, [0.055, 0.04], { color: SKINP, sides: 6 }));
      b.spike(p2, [0, -0.5, 0.8], 0.1, 0.035, CLAW, { bone: f.joints[1], sides: 5 });
    }

    // bracers
    wrap(arm, ARM_R, 0.6, LEATHERP);
    wrap(arm, ARM_R, 0.68, RAGP, { rag: 0.2 });
    wrap(arm, ARM_R, 0.77, LEATHERP, { fangs: 6 });
    wrap(arm, ARM_R, 0.86, HIDEP);
    wrap(arm, ARM_R, 0.93, LEATHERP);
    wrap(arm, ARM_R, 0.2, RAGP, { rag: 0.28 });
    wrap(arm, ARM_R, 0.27, LEATHERP, { fangs: 3 });

    if (s > 0) {
      // left shoulder: hide mantle with skulls and fur fringe
      const c = [0.64, 2.3, 0.06];
      blob(c, [0.31, 0.14, 0.3], HIDEP, shoulder);
      for (const [y, rad] of [
        [2.28, 0.3],
        [2.2, 0.26],
      ]) {
        const items = b.ring(frame([0.64, y, 0.06], [0, 1, 0]), { count: 18, radius: rad }).items;
        b.cards(
          items.map((it) => frame(it.at, [0, 1, 0])),
          mossTex,
          { size: [0.07, 0.28], lean: 180, flow: [0, 0, 1], vary: 0.4, rng: rand, bone: shoulder },
        );
      }
      skull([0.6, 2.46, 0.22], 1.0, shoulder);
      skull([0.84, 2.36, 0.04], 0.75, shoulder);
      b.ring(frame(c, [0, 1, 0]), { count: 8, radius: 0.28, tilt: 35 }, (it) =>
        b.spike(it, it, 0.14, 0.03, BONEP, { bone: shoulder, sides: 6 }),
      );
      // skull trinket on the forearm
      skull([W.x + 0.2, W.y + 0.02, W.z + 0.12], 0.7, wrist);
      b.rod([W.x + 0.1, W.y + 0.14, W.z + 0.06], [W.x + 0.2, W.y + 0.07, W.z + 0.12], 0.01, LEATHER_D, { bone: wrist });
    } else {
      // right shoulder: leather and bone spike pauldron
      blob([-0.64, 2.28, 0.06], [0.28, 0.12, 0.27], LEATHERP, shoulder);
      for (const [dx, dy, dz, len] of [
        [-0.2, 1, 0, 0.34],
        [-0.45, 1, 0.3, 0.26],
        [-0.45, 1, -0.3, 0.26],
      ])
        b.spike([-0.64 + dx * 0.5, 2.33, 0.06 + dz * 0.4], [dx, dy, dz], len, 0.06, BONEP, { bone: shoulder, sides: 7 });
      b.ring(frame([-0.64, 2.26, 0.06], [0, 1, 0]), { count: 10, radius: 0.27, tilt: 10 }, (it) => {
        b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, { bone: shoulder, at: it.at });
      });
      const items = b.ring(frame([-0.64, 2.22, 0.06], [0, 1, 0]), { count: 14, radius: 0.28 }).items;
      b.cards(
        items.map((it) => frame(it.at, [0, 1, 0])),
        mossTex,
        { size: [0.07, 0.22], lean: 180, flow: [0, 0, 1], vary: 0.4, rng: rand, bone: shoulder },
      );
    }
  }

  // ---- legs ----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.3, 1.2, 0], [s * 0.4, 0.22, 0], [0.6, 0.58], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.4, 0, 0.15],
    });
    bodySweeps.push(b.sweep(leg, LEG_R, { color: SKINP }));
    const knee = leg.joints[1];
    const ankle = leg.tip!;
    blob([knee.at.x, knee.at.y, knee.at.z + 0.14], [0.17, 0.17, 0.15], SKINP, knee);
    blob([knee.at.x, knee.at.y - 0.28, knee.at.z - 0.1], [0.17, 0.2, 0.15], SKINP, knee);
    // foot
    const fx = s * 0.4;
    blob([fx, 0.11, 0.13], [0.18, 0.11, 0.28], SKINP, ankle);
    for (const dx of [-0.13, -0.045, 0.045, 0.13]) {
      const x = fx + dx;
      blob([x, 0.07, 0.4 - Math.abs(dx) * 0.2], [0.06, 0.06, 0.1], SKINP, ankle);
      b.spike([x, 0.065, 0.47 - Math.abs(dx) * 0.2], [0, -0.1, 1], 0.1, 0.035, CLAW, { bone: ankle, sides: 5 });
    }
    blob([fx, 0.18, -0.04], [0.14, 0.12, 0.12], SKINP, ankle);
    wrap(leg, LEG_R, 0.74, LEATHERP);
    wrap(leg, LEG_R, 0.82, RAGP, { rag: 0.24 });
    wrap(leg, LEG_R, 0.9, LEATHERP, { fangs: 4 });
    wrap(leg, LEG_R, 0.97, HIDEP);
  }

  // ---- head ----------------------------------------------------------------------------------------------------
  blob([0, 2.54, 0.46], [0.27, 0.25, 0.27], HEADP, head);
  b.sweep(
    catmull([
      [-0.24, 2.6, 0.54],
      [-0.13, 2.63, 0.69],
      [0, 2.62, 0.73],
      [0.13, 2.63, 0.69],
      [0.24, 2.6, 0.54],
    ]),
    [0.05, 0.06, 0.065, 0.06, 0.05],
    { color: HEADP, bone: head, sides: 8 },
  );
  blob([0, 2.55, 0.78], [0.06, 0.08, 0.07], HEADP, head);
  blob([0, 2.43, 0.74], [0.19, 0.1, 0.17], HEADP, head);
  blob([0, 2.47, 0.9], [0.07, 0.055, 0.06], NOSE, head);
  b.part(new THREE.TorusGeometry(0.035, 0.009, 5, 10), GOLD, { bone: head, at: [0, 2.42, 0.945] });
  blob([0, 2.31, 0.66], [0.21, 0.085, 0.2], HEADP, jaw);
  blob([0, 2.28, 0.8], [0.14, 0.08, 0.1], HEADP, jaw);
  b.part(new THREE.BoxGeometry(0.32, 0.05, 0.3), MOUTH, { bone: head, at: [0, 2.375, 0.66] });
  b.sweep(
    catmull([
      [0.19, 2.37, 0.55],
      [0.16, 2.36, 0.72],
      [0.09, 2.358, 0.86],
      [0, 2.356, 0.9],
      [-0.09, 2.358, 0.86],
      [-0.16, 2.36, 0.72],
      [-0.19, 2.37, 0.55],
    ]),
    0.011,
    { color: MOUTH, bone: head, sides: 5 },
  );
  for (const s of [1, -1]) {
    blob([s * 0.19, 2.46, 0.62], [0.1, 0.1, 0.1], HEADP, head);
    blob([s * 0.16, 2.33, 0.55], [0.1, 0.1, 0.14], HEADP, jaw);
    blob([s * 0.12, 2.56, 0.7], [0.06, 0.05, 0.04], SKIN_D, head);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), EYE, { bone: head, at: [s * 0.12, 2.565, 0.715] }), 0.9);
    b.part(new THREE.SphereGeometry(0.012, 5, 4), CLAW, { bone: head, at: [s * 0.12, 2.565, 0.742] });
    blob([s * 0.12, 2.592, 0.718], [0.045, 0.027, 0.045], SKIN_D, head);
    blob([s * 0.03, 2.455, 0.945], [0.014, 0.012, 0.012], CLAW, head);
    // tusks
    b.sweep(
      catmull([
        [s * 0.12, 2.3, 0.8],
        [s * 0.19, 2.38, 0.9],
        [s * 0.21, 2.52, 0.95],
        [s * 0.15, 2.66, 0.93],
      ]),
      [0.055, 0.045, 0.03, 0.014, 0.004],
      { color: TUSKP, bone: jaw, sides: 8, caps: { start: "round", end: "point" } },
    );
    b.spike([s * 0.07, 2.38, 0.86], [0, -1, 0.2], 0.06, 0.02, TUSK, { bone: head, sides: 5 });
    // ears
    const X = [s, 0, 0];
    const Y = [0, 1, -0.35];
    const ear = [
      [0, -0.07],
      [0.14, -0.02],
      [0.34, 0.34, "sharp"],
      [0.12, 0.16],
      [0, 0.1],
    ] as Array<[number, number] | [number, number, "sharp"]>;
    b.extrude(ear, { at: [s * 0.25, 2.55, 0.38], x: X, y: Y, thickness: 0.022, color: SKINP, bone: head });
    b.extrude(
      [
        [0.03, -0.03],
        [0.12, 0.0],
        [0.26, 0.22, "sharp"],
        [0.11, 0.11],
        [0.03, 0.06],
      ],
      { at: [s * 0.255, 2.55, 0.38], x: X, y: Y, thickness: 0.032, color: "#a8403f", bone: head },
    );
    fang([s * 0.4, 2.62, 0.36], [s * 0.3, -1, 0], 0.1, 0.02, head);
    // braids
    const braid = catmull([
      [s * 0.2, 2.68, 0.28],
      [s * 0.3, 2.5, 0.2],
      [s * 0.33, 2.36, 0.18],
      [s * 0.33, 2.2, 0.2],
    ]);
    b.sweep(braid, 0.014, { color: RED_D, bone: head, sides: 5 });
    let bi = 0;
    b.along(braid, 5, (at) => {
      b.part(new THREE.SphereGeometry(0.024, 6, 4), beadCols[bi++ % 4], { bone: head, at: at.at });
    });
    fang([s * 0.33, 2.2, 0.2], [0, -1, 0], 0.09, 0.022, head);
  }
  for (const [x, z] of [
    [-0.09, 0.84],
    [-0.04, 0.88],
    [0.04, 0.88],
    [0.09, 0.84],
    [0.14, 0.78],
    [-0.14, 0.78],
  ])
    b.spike([x, 2.388, z], [0, 1, 0.1], 0.04, 0.014, TUSK, { bone: jaw, sides: 5 });

  // mohawk
  const mohawk = catmull([
    [0, 2.74, 0.64],
    [0, 2.8, 0.46],
    [0, 2.74, 0.26],
    [0, 2.6, 0.13],
    [0, 2.44, 0.14],
  ]);
  b.sweep(mohawk, 0.035, { color: RED_D, bone: head, sides: 6 });
  for (const [xo, size, tiltX] of [
    [0, 0.34, 0],
    [0.035, 0.26, 0.35],
    [-0.035, 0.26, -0.35],
  ]) {
    const frames = [];
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      const p = mohawk.at(t * 0.97);
      p.x += xo;
      frames.push(frame(p, [tiltX, 1, 0.35 - 1.3 * t]));
    }
    b.cards(frames, shardTex, {
      size: [0.09, size],
      lean: 20,
      bend: 30,
      vary: 0.35,
      spin: 12,
      cross: true,
      rng: rand,
      bone: head,
    });
  }

  // ---- skin dressing: moss and warts ----------------------------------------------------------------------------
  const skin = b.surface([...bodySweeps, ...fingerSweeps.slice(0, 0)]);
  const mossHits = skin.scatter(70, { rng: rng(11), minDist: 0.12, filter: (h) => h.n.y > 0.35 });
  b.cards(mossHits, mossTex, { size: [0.07, 0.11], lean: 25, vary: 0.4, spin: 40, rng: rng(12) });
  const wartHits = skin.scatter(40, { rng: rng(13), minDist: 0.1 });
  for (const h of wartHits) b.stick(new THREE.SphereGeometry(0.024, 5, 4), WART, h, { embed: 0.5 });

  return b.root;
}
