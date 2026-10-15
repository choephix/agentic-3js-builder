import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { grain, mottle, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { cel, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout dwarf with a braided copper beard, gold-trimmed blue helm and tunic, fur trims and a flared blunderbuss, in chunky hand-painted Blizzard/Warcraft style.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type Color = string | Paint;

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });

  // ---------------------------------------------------------------- palette
  const SKIN = cel(mottle("#e39a72", "#d98a62", { size: 0.05, seed: 1 }));
  const SKIN_HI = cel("#ee ac86".replace(" ", ""));
  const BEARD = cel(grain("#c4521f", "#a53d15", { size: 0.012, axis: "y", seed: 5 }));
  const BEARD_B = cel("#dc6e2c", "#b04a1a");
  const BEARD_D = cel("#8c2e10", "#661f0a");
  const GOLD = cel("#e6b43c", "#b0801f");
  const LEATHER = cel(mottle("#7d4a2a", "#6a3d21", { size: 0.04, seed: 3 }));
  const LEATHER_D = cel("#4b2d1a", "#33200f");
  const STEEL = cel("#808790", "#575c68");
  const STEEL_D = cel("#3c3f48", "#2a2c33");
  const FUR = cel(mottle("#d8cab0", "#b7a686", { size: 0.025, seed: 4 }));
  const WOOD = cel(grain("#96592f", "#744420", { size: 0.01, axis: "z", seed: 6 }));
  const TROUSER = cel("#3d4260", "#2c3049");
  const BLUE = cel(mottle("#3a4f8c", "#31437a", { size: 0.06, seed: 2 }));
  const BLUE_D = cel("#27345f", "#1b2444");
  const hemPaint = paint((p) => (p.y < 0.4 + 0.022 * zigzag((p.x + p.z) / 0.05) ? GOLD : BLUE));
  const SKIRT = cel(hemPaint);
  const torsoPaint = paint((p, n) =>
    Math.abs(p.x) < 0.19 + 0.03 * zigzag(p.y / 0.05) && n.z > 0.15 ? LEATHER_D : BLUE,
  );
  const TORSO = cel(torsoPaint);
  const BOOT = cel(mottle("#6e4126", "#58331d", { size: 0.035, seed: 7 }));

  // ---------------------------------------------------------------- textures
  const KNOT = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 3 L61 32 L32 61 L3 32 Z" fill="#2f3f73" stroke="#e6b43c" stroke-width="5"/><path d="M32 16 L48 32 L32 48 L16 32 Z" fill="none" stroke="#e6b43c" stroke-width="4"/><path d="M32 10 L32 54 M10 32 L54 32" stroke="#b0801f" stroke-width="2.5"/><circle cx="32" cy="32" r="5.5" fill="#e6b43c"/></svg>`,
    { size: 128 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 96 32"><path d="M2 28 L14 6 L26 28 L38 6 L50 28 L62 6 L74 28 L86 6 L94 20" fill="none" stroke="#e6b43c" stroke-width="4.5" stroke-linejoin="round"/><path d="M2 30 L94 30" stroke="#b0801f" stroke-width="3"/></svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------- helpers
  const ell = (at: number[], r: number[], color: Color, bone: Joint) =>
    b.part(new THREE.SphereGeometry(1, 8, 6), color, { at, bone, scale: r });
  const bx = (at: number[], size: number[], color: Color, bone: Joint, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, bone, ...(rot ? { rotation: rot } : {}) });
  const stud = (at: number[], bone: Joint, r = 0.012) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), GOLD, { at, bone });
  const ringPts = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 14) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [cx + Math.sin(a) * rx, cy, cz + Math.cos(a) * rz];
    });
  const hoop = (pts: number[][], rad: number, color: Color, bone: Joint) =>
    b.sweep(catmull(pts, { closed: true }), rad, { color, bone, sides: 6 });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.58, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.58, 0],
      [0, 0.8, 0.01],
      [0, 1.0, 0.02],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.05, 0.03], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.1, 0.04], dir: [0, 1, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.14, 0.09], dir: [0, -0.2, 1], role: "jaw" });

  // ---------------------------------------------------------------- gun frame
  const dGv = new THREE.Vector3(0, 0.06, 1).normalize();
  const dGa = dGv.toArray();
  const GP = (l: number) => [0, 0.9 + dGv.y * l, 0.2 + dGv.z * l];
  const gun = b.joint("blunderbuss", { parent: chest, at: GP(0), dir: dGa });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 0.58, 0], w: 0.38, h: 0.28 },
      { at: [0, 0.76, 0.01], w: 0.46, h: 0.3 },
      { at: [0, 0.95, 0.02], w: 0.56, h: 0.33 },
      { at: [0, 1.06, 0.03], w: 0.44, h: 0.28 },
    ],
    { bone: spine, color: TORSO, sides: 10 },
  );

  // skirt / kilt
  b.lathe(
    [
      [0, 0.02],
      [0.25, 0.02],
      [0.3, -0.215],
      [0.285, -0.23],
      [0, -0.23],
    ],
    { at: [0, 0.6, 0], bone: hips, color: SKIRT, segments: 14 },
  );
  hoop(ringPts(0, 0.372, 0, 0.3, 0.3, 16), 0.012, GOLD, hips);
  // tabard panel
  bx([0, 0.46, 0.295], [0.2, 0.28, 0.02], LEATHER, hips, [-13, 0, 0]);
  for (const s of [1, -1]) bx([s * 0.103, 0.46, 0.298], [0.016, 0.29, 0.024], GOLD, hips, [-13, 0, 0]);
  bx([0, 0.325, 0.325], [0.22, 0.016, 0.024], GOLD, hips, [-13, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    at: [0, 0.46, 0.312],
    dir: [0, -0.22, 1],
    axis: "z",
    texture: KNOT,
    bone: hips,
  });
  b.part(new THREE.PlaneGeometry(0.19, 0.063), "#ffffff", {
    at: [0, 0.37, 0.322],
    dir: [0, -0.22, 1],
    axis: "z",
    texture: RUNE,
    bone: hips,
  });
  // back flap
  bx([0, 0.46, -0.285], [0.2, 0.26, 0.02], LEATHER_D, hips, [13, 0, 0]);

  // belt
  hoop(ringPts(0, 0.64, 0, 0.205, 0.16), 0.028, LEATHER_D, hips);
  bx([0, 0.64, 0.19], [0.1, 0.085, 0.03], GOLD, hips);
  b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
    at: [0, 0.64, 0.206],
    dir: [0, 0, 1],
    axis: "z",
    texture: KNOT,
    bone: hips,
  });
  for (const s of [1, -1]) stud([s * 0.045, 0.64, 0.207], hips, 0.01);
  // dangling strap with diamond tag
  bx([0.07, 0.55, 0.3], [0.03, 0.12, 0.012], LEATHER_D, hips);
  bx([0.07, 0.47, 0.31], [0.06, 0.06, 0.014], GOLD, hips, [0, 0, 45]);

  // bandolier across the chest
  const skin = b.surface(torso);
  const strap = skin.drape(
    catmull([
      [-0.26, 1.08, 0.0],
      [-0.2, 0.95, 0.17],
      [0.0, 0.82, 0.2],
      [0.2, 0.68, 0.17],
      [0.27, 0.62, 0.0],
    ]),
    { lift: 0.012 },
  );
  b.sweep(strap, 0.024, { color: LEATHER, sides: 6 });
  b.along(
    strap,
    3,
    (at) => {
      const p = at.at.clone().add(new THREE.Vector3(0, 0, 0.03));
      bx([p.x, p.y, p.z], [0.06, 0.07, 0.04], LEATHER_D, chest);
      stud([p.x, p.y + 0.03, p.z + 0.021], chest, 0.008);
    },
    { from: 0.35, to: 0.9 },
  );

  // fur collar and neck
  hoop(ringPts(0, 1.06, 0.03, 0.23, 0.15, 16), 0.045, FUR, chest);
  b.capsule([0, 1.04, 0.03], [0, 1.12, 0.05], 0.07, { color: SKIN, bone: neck, sides: 8 });

  // back pack
  bx([0, 0.9, -0.2], [0.34, 0.3, 0.14], LEATHER, chest);
  bx([0, 1.03, -0.2], [0.36, 0.12, 0.16], LEATHER_D, chest);
  for (const s of [1, -1]) {
    bx([s * 0.1, 0.97, -0.285], [0.03, 0.16, 0.01], GOLD, chest);
    stud([s * 0.1, 0.9, -0.29], chest);
  }
  b.rod([-0.2, 0.74, -0.22], [0.2, 0.74, -0.22], 0.065, { color: BLUE_D, bone: hips, sides: 8 });
  for (const x of [-0.14, 0.14]) b.rod([x - 0.012, 0.74, -0.22], [x + 0.012, 0.74, -0.22], 0.068, LEATHER_D, { bone: hips, sides: 8 });
  hoop(ringPts(0, 0.9, -0.2, 0.16, 0.08, 10), 0.01, FUR, chest);

  // hip pouch and bedroll
  bx([-0.245, 0.5, 0.1], [0.1, 0.12, 0.06], LEATHER, hips, [0, -20, 0]);
  bx([-0.245, 0.565, 0.103], [0.11, 0.05, 0.068], LEATHER_D, hips, [0, -20, 0]);
  stud([-0.24, 0.545, 0.137], hips);
  const bedA = new THREE.Vector3(0.14, 0.5, 0.26);
  const bedB = new THREE.Vector3(0.4, 0.46, 0.12);
  b.rod(bedA, bedB, 0.075, { color: LEATHER, bone: hips, sides: 8 });
  for (const t of [0.2, 0.8]) {
    const p = bedA.clone().lerp(bedB, t);
    const d = bedB.clone().sub(bedA).normalize().multiplyScalar(0.012);
    b.rod(p.clone().sub(d), p.clone().add(d), 0.08, { color: GOLD, bone: hips, sides: 8 });
  }
  b.rod(bedA.clone().lerp(bedB, 0.02), bedA.clone().lerp(bedB, 0.04), 0.071, { color: BLUE_D, bone: hips, sides: 8 });

  // ---------------------------------------------------------------- legs
  const knotPlane = (w: number, at: number[], bone: Joint, dir: number[] = [0, 0, 1]) =>
    b.part(new THREE.PlaneGeometry(w, w), "#ffffff", { at, dir, axis: "z", texture: KNOT, bone });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.1, 0.55, 0], [s * 0.115, 0.09, 0.02], [0.25, 0.25], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.115, 0, 0.04],
    });
    b.sweep(leg, [0.09, 0.085, 0.075, 0.082, 0.088], {
      bands: [
        [0.52, TROUSER],
        [1, BOOT],
      ],
      sides: 8,
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    const k = pts[1];
    bx([k.x, k.y, k.z + 0.082], [0.125, 0.125, 0.02], GOLD, knee);
    bx([k.x, k.y, k.z + 0.09], [0.1, 0.1, 0.02], BLUE_D, knee);
    knotPlane(0.075, [k.x, k.y, k.z + 0.102], knee);
    // boot fur cuff and straps
    hoop(b.ring(leg.at(0.68), { count: 8, radius: 0.09 }).items as unknown as number[][], 0.03, FUR, knee);
    for (const t of [0.8, 0.9]) {
      const items = b.ring(leg.at(t), { count: 8, radius: 0.092 }).items;
      b.sweep(catmull(items, { closed: true }), 0.012, { color: LEATHER_D, sides: 6, bone: ankle });
      b.part(new THREE.BoxGeometry(0.03, 0.03, 0.012), GOLD, { at: items[0].at.clone().add(new THREE.Vector3(0, 0, 0.012)), bone: ankle });
    }
    // foot
    const fx = s * 0.115;
    ell([fx, 0.075, 0.07], [0.082, 0.062, 0.14], BOOT, ankle);
    ell([fx, 0.06, 0.16], [0.075, 0.048, 0.07], STEEL, ankle);
    bx([fx, 0.014, 0.05], [0.17, 0.03, 0.3], LEATHER_D, ankle);
    bx([fx, 0.1, 0.05], [0.12, 0.012, 0.1], LEATHER_D, ankle, [-12, 0, 0]);
    stud([fx, 0.1, 0.1], ankle, 0.012);
    stud([fx + s * 0.04, 0.08, 0.2], ankle, 0.01);
    stud([fx - s * 0.04, 0.08, 0.2], ankle, 0.01);
  }

  // ---------------------------------------------------------------- arms and hands
  const targets: Record<string, number[]> = {
    L: [0.045, GP(0.35)[1] - 0.052, GP(0.35)[2]],
    R: [-0.055, GP(0.17)[1] - 0.048, GP(0.17)[2]],
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tgt = targets[side];
    const shoulderAt = [s * 0.3, 1.0, 0];
    const pts = limb(shoulderAt, tgt, [0.32, 0.32], [s * 1, -0.7, -0.2]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.09, 0.085, 0.078, 0.07, 0.064], {
      bands: [
        [0.46, BLUE],
        [1, LEATHER],
      ],
      sides: 8,
    });
    const sh = arm.joints[0];
    const wrist = arm.joints[2];
    // pauldron
    ell([s * 0.31, 1.04, 0], [0.12, 0.085, 0.115], BLUE, sh);
    hoop(ringPts(s * 0.31, 1.035, 0, 0.122, 0.117, 14), 0.013, GOLD, sh);
    bx([s * 0.31, 1.122, 0], [0.065, 0.014, 0.065], GOLD, sh, [0, 45, 0]);
    stud([s * 0.31, 1.13, 0], sh, 0.014);
    for (const a of [0.9, 2.3, 3.9, 5.4]) stud([s * 0.31 + Math.sin(a) * 0.1, 1.07, Math.cos(a) * 0.097], sh, 0.01);
    // fur and gold bands
    hoop(b.ring(arm.at(0.42), { count: 8, radius: 0.092 }).items as unknown as number[][], 0.03, FUR, arm.joints[1]);
    const eb = b.ring(arm.at(0.62), { count: 8, radius: 0.078 }).items;
    b.sweep(catmull(eb, { closed: true }), 0.016, { color: GOLD, sides: 6, bone: arm.joints[1] });
    for (const t of [0.78, 0.9]) {
      const items = b.ring(arm.at(t), { count: 8, radius: 0.068 }).items;
      b.sweep(catmull(items, { closed: true }), 0.012, { color: LEATHER_D, sides: 6, bone: arm.joints[1] });
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { at: items[2].at, bone: arm.joints[1] });
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { at: items[6].at, bone: arm.joints[1] });
    }
    // glove + fingers
    ell(tgt, [0.07, 0.06, 0.075], LEATHER_D, wrist);
    const dir = -s;
    for (let i = 0; i < 4; i++) {
      const fz = tgt[2] - 0.025 + i * 0.022;
      b.sweep(
        catmull([
          [tgt[0] + dir * 0.005, tgt[1] + 0.02, fz],
          [tgt[0] + dir * 0.05, tgt[1] - 0.03, fz],
          [tgt[0] + dir * 0.095, tgt[1] + 0.03, fz],
        ]),
        0.017,
        { color: LEATHER_D, bone: wrist, sides: 6 },
      );
    }
    b.sweep(
      catmull([
        [tgt[0] + dir * 0.0, tgt[1] + 0.04, tgt[2] - 0.02],
        [tgt[0] + s * 0.0 + dir * 0.03, tgt[1] + 0.085, tgt[2] - 0.01],
        [tgt[0] + dir * 0.06, tgt[1] + 0.085, tgt[2]],
      ]),
      0.019,
      { color: LEATHER_D, bone: wrist, sides: 6 },
    );
  }

  // ---------------------------------------------------------------- head
  ell([0, 1.2, 0.06], [0.125, 0.14, 0.125], SKIN, head);
  ell([0, 1.17, 0.192], [0.04, 0.036, 0.04], SKIN_HI, head);
  for (const s of [1, -1]) {
    ell([s * 0.078, 1.16, 0.14], [0.036, 0.032, 0.03], cel("#ee9a80"), head);
    ell([s * 0.135, 1.19, 0.05], [0.02, 0.035, 0.025], SKIN, head);
    // eyes
    ell([s * 0.052, 1.213, 0.164], [0.02, 0.017, 0.016], "#f4efe2", head);
    ell([s * 0.052, 1.213, 0.177], [0.0105, 0.0105, 0.006], "#4a78b8", head);
    ell([s * 0.052, 1.213, 0.181], [0.0055, 0.0055, 0.004], INK, head);
    // angry brow
    b.capsule([s * 0.09, 1.25, 0.14], [s * 0.012, 1.234, 0.18], 0.019, { color: BEARD_D, bone: head, sides: 6 });
    // sideburn and moustache
    ell([s * 0.12, 1.15, 0.09], [0.04, 0.07, 0.05], BEARD, head);
    b.sweep(
      catmull([
        [s * 0.006, 1.145, 0.19],
        [s * 0.07, 1.135, 0.195],
        [s * 0.135, 1.1, 0.17],
        [s * 0.16, 1.06, 0.15],
      ]),
      [0.03, 0.026, 0.008],
      { color: BEARD_B, bone: head, sides: 6, caps: { start: "round", end: "point" } },
    );
    // helmet cheek plates
    bx([s * 0.141, 1.205, 0.06], [0.02, 0.1, 0.078], GOLD, head);
    bx([s * 0.15, 1.205, 0.06], [0.014, 0.082, 0.06], BLUE, head);
    stud([s * 0.16, 1.205, 0.06], head, 0.009);
  }
  bx([0, 1.143, 0.178], [0.05, 0.01, 0.012], INK, head);
  ell([0, 1.12, 0.1], [0.08, 0.04, 0.07], SKIN, jaw);
  ell([0, 1.2, -0.1], [0.1, 0.08, 0.06], BEARD, head);

  // helmet
  b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), BLUE, {
    at: [0, 1.27, 0.05],
    bone: head,
    scale: [0.145, 0.125, 0.145],
  });
  hoop(ringPts(0, 1.272, 0.05, 0.149, 0.149, 16), 0.014, GOLD, head);
  b.sweep(
    catmull([
      [0, 1.3, 0.19],
      [0, 1.4, 0.1],
      [0, 1.42, 0.0],
      [0, 1.36, -0.09],
    ]),
    0.013,
    { color: GOLD, bone: head, sides: 6 },
  );
  bx([0, 1.305, 0.194], [0.045, 0.045, 0.012], GOLD, head, [0, 0, 45]);
  b.part(new THREE.SphereGeometry(0.011, 6, 4), "#3a78c8", { at: [0, 1.305, 0.2], bone: head });
  for (const s of [1, -1]) stud([s * 0.1, 1.33, 0.1], head, 0.011);

  // ---------------------------------------------------------------- beard
  b.sweep(
    catmull([
      [0, 1.15, 0.13],
      [0, 1.05, 0.19],
      [0, 0.93, 0.23],
      [0, 0.84, 0.25],
    ]),
    (t) => [0.07 + 0.085 * Math.sin(Math.PI * Math.min(1, t * 1.1)), 0.075 - 0.02 * t],
    { color: BEARD, bone: head, sides: 10 },
  );
  for (const x of [-0.07, 0, 0.07]) {
    b.sweep(
      catmull([
        [x * 0.9, 1.08, 0.255],
        [x * 1.1, 0.96, 0.295],
        [x * 1.1, 0.86, 0.3],
      ]),
      [0.02, 0.024, 0.004],
      { color: BEARD_B, bone: head, sides: 6, caps: { start: "round", end: "point" } },
    );
  }
  const braid = (a: number[], z: number[], n: number) => {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = [a[0] + (z[0] - a[0]) * t, a[1] + (z[1] - a[1]) * t, a[2] + (z[2] - a[2]) * t];
      const w = i % 2 ? 0.014 : -0.014;
      ell([p[0] + w, p[1], p[2]], [0.03 - 0.008 * t, 0.026, 0.03 - 0.008 * t], i % 2 ? BEARD_B : BEARD, head);
    }
    b.spike([z[0], z[1] - 0.01, z[2]], [0, -1, 0], 0.09, 0.022, { color: BEARD, bone: head, sides: 6 });
    for (const t of [0.3, 0.78]) {
      const p = [a[0] + (z[0] - a[0]) * t, a[1] + (z[1] - a[1]) * t, a[2] + (z[2] - a[2]) * t];
      b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.028, 8), GOLD, { at: p, bone: head });
    }
  };
  braid([0, 0.9, 0.31], [0, 0.7, 0.335], 7);
  for (const s of [1, -1]) braid([s * 0.1, 0.98, 0.28], [s * 0.125, 0.76, 0.31], 6);

  // ---------------------------------------------------------------- blunderbuss
  // stock
  b.sweep(catmull([GP(-0.03), GP(0.12), GP(0.3), GP(0.44)]), [0.05, 0.045, 0.038, 0.034], {
    color: WOOD,
    bone: gun,
    sides: 8,
  });
  ell(GP(-0.04), [0.05, 0.08, 0.04], WOOD, gun);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      at: [s * 0.047, GP(0.22)[1], GP(0.22)[2]],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: KNOT,
      bone: gun,
    });
  }
  // barrel and forestock
  b.rod(GP(0.28), GP(0.58), [0.032, 0.034], STEEL, { bone: gun, sides: 8 });
  b.rod(GP(0.36), GP(0.56), 0.042, WOOD, { bone: gun, sides: 8 });
  b.rod([0, GP(0.36)[1] - 0.05, GP(0.36)[2]], [0, GP(0.6)[1] - 0.05, GP(0.6)[2]], 0.009, WOOD, { bone: gun, sides: 5 });
  // bell
  b.lathe(
    [
      [0.036, 0],
      [0.05, 0.07],
      [0.085, 0.17],
      [0.1, 0.22],
      [0.087, 0.22],
      [0.073, 0.17],
      [0.037, 0.07],
      [0.026, 0],
    ],
    { at: GP(0.56), axis: dGa, bone: gun, color: STEEL, segments: 14 },
  );
  b.part(new THREE.CircleGeometry(0.045, 10), INK, { at: GP(0.64), dir: dGa, axis: "z", bone: gun });
  const gunRing = (l: number, r: number, rad: number, color: Color) => {
    const items = b.ring(frame(GP(l), dGa), { count: 10, radius: r }).items;
    return b.sweep(catmull(items, { closed: true }), rad, { color, bone: gun, sides: 6 });
  };
  gunRing(0.78, 0.098, 0.017, GOLD);
  gunRing(0.56, 0.045, 0.016, GOLD);
  gunRing(0.46, 0.04, 0.012, GOLD);
  gunRing(0.34, 0.04, 0.012, GOLD);
  gunRing(0.3, 0.038, 0.01, STEEL_D);
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    at: [0, GP(0.67)[1] + 0.07, GP(0.67)[2]],
    dir: [0, 1, -0.2],
    up: [0, 0, 1],
    axis: "z",
    texture: KNOT,
    bone: gun,
  });
  b.spike(GP(0.5), [0, 1, 0], 0.03, 0.01, { color: STEEL_D, bone: gun, sides: 5 });
  // lock
  for (const s of [1, -1]) {
    bx([s * 0.042, GP(0.1)[1] + 0.012, GP(0.1)[2]], [0.014, 0.05, 0.11], STEEL, gun);
    stud([s * 0.05, GP(0.06)[1] + 0.012, GP(0.06)[2]], gun, 0.01);
    stud([s * 0.05, GP(0.14)[1] + 0.012, GP(0.14)[2]], gun, 0.01);
  }
  bx([0, GP(0.08)[1] + 0.045, GP(0.08)[2]], [0.04, 0.015, 0.04], GOLD, gun);
  const hammer = b.joint("hammer", { parent: gun, at: [0, GP(0.04)[1] + 0.045, GP(0.04)[2]], dir: [0, 1, -0.4], role: "hinge" });
  b.rod(hammer.at, [0, hammer.at.y + 0.045, hammer.at.z - 0.025], 0.011, STEEL_D, { bone: hammer, sides: 6 });
  bx([0, hammer.at.y + 0.05, hammer.at.z - 0.032], [0.016, 0.03, 0.03], STEEL, hammer);
  // trigger guard and trigger
  const gy = (l: number) => GP(l)[1];
  const gz = (l: number) => GP(l)[2];
  b.sweep(
    catmull([
      [0, gy(0.01) - 0.04, gz(0.01)],
      [0, gy(0.03) - 0.085, gz(0.03)],
      [0, gy(0.1) - 0.085, gz(0.1)],
      [0, gy(0.12) - 0.04, gz(0.12)],
    ]),
    0.008,
    { color: GOLD, bone: gun, sides: 6 },
  );
  bx([0, gy(0.06) - 0.055, gz(0.06)], [0.008, 0.04, 0.01], STEEL_D, gun, [15, 0, 0]);

  return b.root;
}
