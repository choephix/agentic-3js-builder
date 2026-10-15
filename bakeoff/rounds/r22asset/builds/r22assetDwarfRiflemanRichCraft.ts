import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { countershade, grain, mottle, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stocky dwarf sharpshooter with a braided ginger beard, horned steel helm, plaid kilt, bandolier and a flared-muzzle blunderbuss, painted in a chunky Warcraft style.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type P = [number, number, number];
type Col = string | Paint;

export default function build() {
  const bd = createBuilder({ name: "dwarfRifleman" });

  // ---------- palette ----------
  const BLUE = "#2f64b8";
  const BLUE2 = "#3b78d0";
  const NAVY = "#1c2f6b";
  const TAN = "#d9b883";
  const TAN2 = "#c9a46c";
  const TANSH = "#8e6a3f";
  const SKIN = "#e8a77f";
  const SKIN2 = "#d98f66";
  const SKINSH = "#a85a44";
  const STEEL = "#aab4c6";
  const STEEL2 = "#8590a6";
  const STEELD = "#4a5368";
  const BRASS = "#e6b13a";
  const BRASSD = "#a8731c";
  const LEATHER = "#8a5430";
  const LEATHER2 = "#a06a3c";
  const LEATHERD = "#4b2c18";
  const BEARD = "#d4601f";
  const BEARD2 = "#f0902f";
  const BEARDSH = "#8e3414";
  const BONE = "#efe3c2";
  const WOOD = "#8c5a2e";
  const WOOD2 = "#a8723b";
  const WOODD = "#4f2f17";
  const FUR = "#d8c8a2";
  const NOSE = "#e08468";
  const CHEEK = "#ec8f76";
  const TROUSER = "#5d4a38";
  const TROUSER2 = "#74604a";
  const TROUSERSH = "#33281d";
  const DARK = "#1b1411";
  const WHITE = "#f4f0e4";
  const IRIS = "#3b9ae0";

  // ---------- paints ----------
  const coatBlue = countershade(mottle(BLUE, BLUE2, { size: 0.06, seed: 2, contrast: 0.8 }), NAVY, { level: -0.25, soft: 0.7 });
  const vestTan = countershade(mottle(TAN, TAN2, { size: 0.05, seed: 4 }), TANSH, { level: -0.25, soft: 0.7 });
  const coat = paint((p, n) => (Math.abs(p.x) < 0.075 + 0.012 * Math.sin(p.y * 60) && n.z > 0.2 ? vestTan : coatBlue));
  const skinP = countershade(mottle(SKIN, SKIN2, { size: 0.05, seed: 3, contrast: 0.8 }), SKINSH, { level: -0.2, soft: 0.8 });
  const leatherP = countershade(mottle(LEATHER, LEATHER2, { size: 0.04, seed: 9 }), LEATHERD, { level: -0.2, soft: 0.7 });
  const steelP = countershade(mottle(STEEL, STEEL2, { size: 0.04, contrast: 0.7, seed: 7 }), STEELD, { level: -0.2, soft: 0.7 });
  const brassP = countershade(BRASS, BRASSD, { level: -0.1, soft: 0.6 });
  const woodP = countershade(grain(WOOD, WOOD2, { size: 0.012, axis: "z" }), WOODD, { level: -0.2, soft: 0.7 });
  const beardP = countershade(grain(BEARD, BEARD2, { size: 0.012, axis: "y", seed: 5 }), BEARDSH, { level: -0.3, soft: 0.8 });
  const trouserP = countershade(mottle(TROUSER, TROUSER2, { size: 0.05, seed: 11 }), TROUSERSH, { level: -0.2, soft: 0.7 });
  const plaid = paint((p) => {
    const u = ((((Math.atan2(p.x, p.z) * 0.235) / 0.05) % 1) + 1) % 1;
    const v = (((p.y / 0.045) % 1) + 1) % 1;
    if (u < 0.12 || v < 0.12) return "#5a1a14";
    if ((u > 0.5 && u < 0.6) || (v > 0.5 && v < 0.58)) return "#e0b050";
    return "#b23a22";
  });
  const kiltP = countershade(plaid, "#4a1410", { level: -0.3, soft: 0.7 });

  const rune = svg(
    `<svg viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="9" fill="#e6b13a" stroke="#5a3a10" stroke-width="5"/><path d="M32 12 L32 52 M20 22 L32 33 L44 22 M20 37 L32 48 L44 37" stroke="#3a2208" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const ball = (r: number, at: P, color: Col, bone: Joint, scale: number | P = 1, seg = 8) =>
    bd.part(new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg * 0.7))), color, { at, bone, scale });
  const box = (w: number, h: number, d: number, at: P, color: Col, bone: Joint, rot?: P) =>
    bd.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, rotation: rot });
  const cyl = (r1: number, r2: number, h: number, at: P, color: Col, bone: Joint, rot?: P, seg = 8) =>
    bd.part(new THREE.CylinderGeometry(r1, r2, h, seg), color, { at, bone, rotation: rot });
  const torus = (R: number, t: number, at: P, color: Col, bone: Joint, rot: P = [90, 0, 0], seg = 14) =>
    bd.part(new THREE.TorusGeometry(R, t, 5, seg), color, { at, bone, rotation: rot });
  const mixp = (a: P, c: P, t: number): P => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

  // ---------- skeleton ----------
  const HY = 1.15; // head centre height
  const hips = bd.joint("hips", { at: [0, 0.54, 0], role: "spine" });
  const spineJ = bd.joint("spine", { parent: hips, at: [0, 0.56, 0], aim: [0, 0.9, 0], role: "spine" });
  const chestJ = bd.joint("chest", { parent: spineJ, at: [0, 0.9, 0], aim: [0, 1.0, 0.02], role: "spine" });
  const neckJ = bd.joint("neck", { parent: chestJ, at: [0, 1.0, 0.03], aim: [0, 1.08, 0.04], role: "neck" });
  const head = bd.joint("head", { parent: neckJ, at: [0, 1.08, 0.04], dir: [0, 1, 0], role: "head" });
  const jaw = bd.joint("jaw", { parent: head, at: [0, HY - 0.06, 0.05], aim: [0, HY - 0.08, 0.2], role: "jaw" });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const leg = bd.chain(
      `leg${sd}`,
      [
        [s * 0.12, 0.54, 0],
        [s * 0.125, 0.29, 0.04],
        [s * 0.12, 0.1, 0],
      ],
      { parent: hips, names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`], role: "leg" },
    );
    bd.sweep(leg, [0.11, 0.09, 0.078], { color: trouserP });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    // boot shaft
    bd.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.103, 0.18],
        [0.125, 0.21],
        [0.125, 0.235],
        [0, 0.235],
      ],
      { at: [s * 0.12, 0.02, 0.0], bone: knee, color: leatherP, segments: 10 },
    );
    torus(0.122, 0.03, [s * 0.12, 0.25, 0], FUR, knee, [90, 0, 0], 10);
    torus(0.107, 0.009, [s * 0.12, 0.12, 0], LEATHERD, knee, [90, 0, 0], 10);
    torus(0.107, 0.009, [s * 0.12, 0.18, 0], LEATHERD, knee, [90, 0, 0], 10);
    box(0.03, 0.035, 0.012, [s * 0.12, 0.12, 0.108], BRASS, knee);
    box(0.03, 0.035, 0.012, [s * 0.12, 0.18, 0.108], BRASS, knee);
    // foot
    box(0.17, 0.09, 0.3, [s * 0.12, 0.043, 0.07], leatherP, ankle);
    ball(0.085, [s * 0.12, 0.05, 0.19], leatherP, ankle, [1, 0.55, 0.9], 8);
    box(0.15, 0.04, 0.08, [s * 0.12, 0.02, -0.06], LEATHERD, ankle);
    box(0.18, 0.025, 0.32, [s * 0.12, 0.0125, 0.07], LEATHERD, ankle);
    // knee guard
    ball(0.055, [s * 0.125, 0.3, 0.09], steelP, knee, [1, 1, 0.6], 8);
    ball(0.013, [s * 0.125, 0.3, 0.125], BRASS, knee, 1, 5);
  }

  // ---------- torso ----------
  ball(1, [0, 0.54, 0], trouserP, hips, [0.19, 0.14, 0.17], 10);
  const bellyBody = ball(1, [0, 0.64, 0.03], coat, spineJ, [0.21, 0.19, 0.2], 12);
  const chestBody = ball(1, [0, 0.9, 0], coat, chestJ, [0.255, 0.2, 0.2], 12);
  // kilt and apron
  bd.lathe(
    [
      [0, 0],
      [0.24, 0],
      [0.245, 0.03],
      [0.215, 0.12],
      [0.175, 0.19],
      [0, 0.19],
    ],
    { at: [0, 0.4, 0], bone: hips, color: kiltP, segments: 16 },
  );
  torus(0.245, 0.012, [0, 0.405, 0], brassP, hips, [90, 0, 0], 16);
  box(0.16, 0.22, 0.02, [0, 0.47, 0.245], leatherP, hips);
  box(0.17, 0.02, 0.025, [0, 0.36, 0.245], brassP, hips);
  for (const sx of [-0.06, 0, 0.06]) ball(0.012, [sx, 0.52, 0.258], BRASS, hips, 1, 5);
  // belt
  const beltLoop = bd.surface(bellyBody).loop([0, 0.62, 0.03], { lift: 0.012 });
  bd.sweep(beltLoop, 0.024, { color: leatherP });
  bd.along(beltLoop, 16, (at) => bd.part(new THREE.SphereGeometry(0.01, 5, 4), BRASS, { at, bone: spineJ }));
  box(0.085, 0.07, 0.025, [0, 0.62, 0.252], brassP, spineJ);
  bd.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
    at: [0, 0.62, 0.266],
    dir: [0, 0, 1],
    axis: "z",
    texture: rune,
    bone: spineJ,
  });
  // buttons down the vest
  const frontZ = (y: number) =>
    Math.max(
      0.2 * Math.sqrt(Math.max(0, 1 - ((y - 0.9) / 0.2) ** 2)),
      0.03 + 0.2 * Math.sqrt(Math.max(0, 1 - ((y - 0.64) / 0.19) ** 2)),
    );
  for (const y of [0.99, 0.91, 0.83, 0.75]) ball(0.013, [0, y, frontZ(y) + 0.002], brassP, chestJ, 1, 5);
  // bandolier
  const torsoSkin = bd.surface([chestBody, bellyBody]);
  const band = torsoSkin.drape(
    catmull([
      [0.17, 1.04, -0.02],
      [0.11, 0.97, 0.17],
      [-0.03, 0.84, 0.24],
      [-0.17, 0.7, 0.2],
      [-0.22, 0.62, 0.05],
    ]),
    { lift: 0.014 },
  );
  bd.sweep(band, 0.026, { color: leatherP });
  bd.along(band, 7, (at) => {
    bd.part(new THREE.BoxGeometry(0.05, 0.065, 0.035), LEATHERD, { at, bone: chestJ, rotation: [0, 0, -40] });
    bd.part(new THREE.SphereGeometry(0.01, 5, 4), BRASS, { at, bone: chestJ });
  });
  // fur collar
  torus(0.1, 0.04, [0, 1.085, 0.02], FUR, chestJ, [90, 0, 0], 10);
  // pack straps
  const chestSkin = bd.surface(chestBody);
  for (const s of [1, -1]) {
    const strap = chestSkin.drape(
      catmull([
        [s * 0.13, 0.98, -0.15],
        [s * 0.15, 1.06, -0.02],
        [s * 0.14, 1.04, 0.12],
        [s * 0.12, 0.9, 0.2],
        [s * 0.1, 0.78, 0.19],
      ]),
      { lift: 0.012 },
    );
    bd.sweep(strap, 0.02, { color: leatherP });
  }
  // backpack
  box(0.3, 0.32, 0.14, [0, 0.88, -0.22], leatherP, chestJ);
  box(0.31, 0.12, 0.15, [0, 1.0, -0.22], LEATHERD, chestJ);
  box(0.04, 0.05, 0.012, [0, 0.98, -0.3], brassP, chestJ);
  cyl(0.065, 0.065, 0.38, [0, 1.1, -0.24], "#c9b27a", chestJ, [0, 0, 90], 10);
  for (const x of [-0.12, 0.12]) torus(0.067, 0.008, [x, 1.1, -0.24], LEATHERD, chestJ, [0, 90, 0], 10);
  cyl(0.07, 0.07, 0.04, [0.19, 0.8, -0.24], steelP, chestJ, [90, 0, 0], 10);
  cyl(0.02, 0.02, 0.02, [0.19, 0.8, -0.265], BRASS, chestJ, [90, 0, 0], 6);
  // pouch and powder horn
  box(0.07, 0.08, 0.05, [-0.14, 0.57, 0.2], leatherP, spineJ);
  box(0.072, 0.03, 0.054, [-0.14, 0.61, 0.2], LEATHERD, spineJ);
  ball(0.01, [-0.14, 0.6, 0.23], BRASS, spineJ, 1, 5);
  bd.sweep(
    [
      [0.1, 0.58, 0.24],
      [0.17, 0.52, 0.19],
      [0.22, 0.5, 0.12],
      [0.24, 0.52, 0.04],
    ],
    [0.03, 0.012],
    { color: BONE, bone: hips, bands: [[0.15, BRASS], [1, BONE]], caps: { start: "flat", end: "point" } },
  );

  // ---------- neck and head ----------
  bd.capsule([0, 0.98, 0.03], [0, HY - 0.05, 0.04], 0.07, skinP, { bone: neckJ });
  ball(1, [0, HY, 0.04], skinP, head, [0.15, 0.14, 0.14], 12);
  ball(1, [0, HY - 0.09, 0.1], skinP, jaw, [0.1, 0.06, 0.1], 8);
  ball(0.05, [0, HY - 0.035, 0.205], NOSE, head, [1, 0.9, 1], 8);
  for (const s of [1, -1]) {
    ball(0.045, [s * 0.085, HY - 0.045, 0.15], CHEEK, head, 1, 6);
    ball(1, [s * 0.155, HY - 0.03, 0.05], skinP, head, [0.03, 0.05, 0.04], 6);
    // eyes
    ball(0.022, [s * 0.058, HY + 0.01, 0.165], WHITE, head, 1, 7);
    ball(0.013, [s * 0.058, HY + 0.01, 0.182], IRIS, head, 1, 6);
    ball(0.007, [s * 0.058, HY + 0.01, 0.192], DARK, head, 1, 5);
    // brows
    bd.rod([s * 0.015, HY + 0.045, 0.178], [s * 0.1, HY + 0.055, 0.14], [0.024, 0.014], BEARD, { bone: head });
    // mustache
    bd.sweep(
      catmull([
        [0, HY - 0.04, 0.19],
        [s * 0.06, HY - 0.055, 0.19],
        [s * 0.12, HY - 0.05, 0.15],
        [s * 0.15, HY - 0.02, 0.12],
      ]),
      [0.03, 0.012],
      { color: beardP, bone: head },
    );
    // cheek beard
    ball(0.06, [s * 0.11, HY - 0.06, 0.1], beardP, head, [1, 1.3, 1], 7);
    // helm flaps and horns
    box(0.02, 0.09, 0.12, [s * 0.16, HY + 0.04, 0.03], steelP, head);
    bd.sweep(
      catmull([
        [s * 0.14, HY + 0.12, 0.04],
        [s * 0.22, HY + 0.13, 0.04],
        [s * 0.27, HY + 0.19, 0.04],
        [s * 0.25, HY + 0.26, 0.04],
      ]),
      [0.035, 0.006],
      { color: BONE, bone: head, bands: [[0.2, BRASS], [1, BONE]], caps: { start: "round", end: "point" } },
    );
  }
  bd.rod([-0.1, HY + 0.045, 0.15], [0.1, HY + 0.045, 0.15], 0.022, skinP, { bone: head });
  // helmet
  bd.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.17, 0.015],
      [0.15, 0.06],
      [0.11, 0.1],
      [0.06, 0.13],
      [0, 0.14],
    ],
    { at: [0, HY + 0.075, 0.04], bone: head, color: steelP, segments: 14 },
  );
  torus(0.17, 0.012, [0, HY + 0.078, 0.04], brassP, head, [90, 0, 0], 18);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ball(0.009, [Math.sin(a) * 0.168, HY + 0.1, 0.04 + Math.cos(a) * 0.168], BRASS, head, 1, 5);
  }
  box(0.022, 0.09, 0.012, [0, HY + 0.03, 0.207], steelP, head);
  bd.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
    at: [0, HY + 0.115, 0.207],
    dir: [0, 0.25, 1],
    axis: "z",
    texture: rune,
    bone: head,
  });
  bd.extrude(
    [
      [-0.14, -0.05],
      [-0.11, 0.0],
      [0, 0.045],
      [0.11, 0.0],
      [0.14, -0.05],
    ],
    { at: [0, HY + 0.185, 0.04], x: [0, 0, 1], thickness: 0.025, bevel: 0.005, color: brassP, bone: head },
  );
  // pipe
  bd.rod([-0.03, HY - 0.075, 0.18], [-0.1, HY - 0.08, 0.28], 0.008, WOODD, { bone: jaw });
  cyl(0.02, 0.016, 0.045, [-0.1, HY - 0.055, 0.29], DARK, jaw, undefined, 8);
  glow(
    bd.part(new THREE.CircleGeometry(0.014, 6), "#ff6a1a", {
      at: [-0.1, HY - 0.031, 0.29],
      dir: [0, 1, 0],
      axis: "z",
      bone: jaw,
    }),
  );

  // ---------- beard ----------
  const beardW = (t: number): [number, number] => [0.12 - 0.07 * t, 0.055];
  bd.sweep(
    catmull([
      [0, HY - 0.07, 0.1],
      [0, 0.98, 0.21],
      [0, 0.86, 0.25],
      [0, 0.72, 0.26],
    ]),
    beardW,
    { color: beardP, bone: chestJ, caps: { start: "round", end: "point" } },
  );
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const y = 1.0 - 0.06 * i;
      const t = (1.08 - y) / 0.36;
      const x = s * (0.12 - 0.07 * t) * 0.92;
      bd.part(new THREE.ConeGeometry(0.03, 0.1, 5), beardP, { at: [x, y - 0.04, 0.23 - 0.01 * i], bone: chestJ, rotation: [180, 0, s * 8] });
    }
  // braids
  for (const s of [1, -1]) {
    const path = catmull([
      [s * 0.07, 1.0, 0.18],
      [s * 0.08, 0.85, 0.27],
      [s * 0.08, 0.7, 0.29],
      [s * 0.07, 0.59, 0.28],
    ]);
    const n = 13;
    for (let i = 0; i <= n; i++) {
      const p = path.at(i / n);
      const sx = (i % 2 ? 1 : -1) * 0.011;
      ball(0.026, [p.x + sx, p.y, p.z], i % 2 ? BEARD : BEARD2, chestJ, [1, 1.25, 1], 6);
    }
    const tip = path.at(1);
    torus(0.024, 0.008, [tip.x, tip.y - 0.005, tip.z], BRASS, chestJ, [90, 0, 0], 8);
    bd.part(new THREE.ConeGeometry(0.03, 0.07, 5), beardP, { at: [tip.x, tip.y - 0.045, tip.z], bone: chestJ, rotation: [180, 0, 0] });
    const mid = path.at(0.45);
    torus(0.026, 0.007, [mid.x, mid.y, mid.z], BRASS, chestJ, [90, 0, 0], 8);
  }

  // ---------- arms ----------
  const armPts: Record<string, P[]> = {
    L: [
      [0.27, 0.95, 0],
      [0.4, 0.78, -0.03],
      [0.42, 0.6, 0.08],
    ],
    R: [
      [-0.27, 0.95, 0],
      [-0.42, 0.8, -0.1],
      [-0.36, 0.68, 0.06],
    ],
  };
  const hands: Record<string, Joint> = {};
  for (const sd of ["L", "R"]) {
    const s = sd === "L" ? 1 : -1;
    const pts = armPts[sd];
    const arm = bd.chain(`arm${sd}`, pts, {
      parent: chestJ,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    bd.sweep(arm, [0.09, 0.08, 0.07, 0.06], {
      color: skinP,
      bands: [
        [0.55, coatBlue],
        [1, skinP],
      ],
    });
    const sh = arm.joints[0];
    const el = arm.joints[1];
    const wr = arm.joints[2];
    hands[sd] = wr;
    // pauldrons
    ball(1, [s * 0.3, 1.03, 0], steelP, sh, [0.13, 0.08, 0.13], 10);
    ball(1, [s * 0.3, 1.075, 0], steelP, sh, [0.1, 0.05, 0.1], 10);
    torus(0.13, 0.012, [s * 0.3, 1.03, 0], brassP, sh, [90, 0, 0], 12);
    bd.part(new THREE.ConeGeometry(0.025, 0.09, 6), BRASS, { at: [s * 0.3, 1.14, 0], bone: sh });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ball(0.011, [s * 0.3 + Math.sin(a) * 0.135, 1.03, Math.cos(a) * 0.135], BRASS, sh, 1, 5);
    }
    // sleeve cuff and bracer
    torus(0.082, 0.013, mixp(pts[0], pts[1], 0.9), LEATHERD, el, [0, 0, 0], 10);
    bd.rod(mixp(pts[1], pts[2], 0.3), mixp(pts[1], pts[2], 0.85), [0.076, 0.067], steelP, { bone: el });
    bd.rod(mixp(pts[1], pts[2], 0.3), mixp(pts[1], pts[2], 0.34), 0.08, BRASS, { bone: el });
    bd.rod(mixp(pts[1], pts[2], 0.81), mixp(pts[1], pts[2], 0.85), 0.071, BRASS, { bone: el });
    // hand
    const c = pts[2];
    ball(0.062, c, skinP, wr, [1, 0.95, 1.15], 8);
    for (let i = 0; i < 4; i++) ball(0.021, [c[0] + s * 0.05, c[1] - 0.012, c[2] - 0.04 + i * 0.027], skinP, wr, [1, 1, 1.1], 6);
    bd.capsule([c[0] - s * 0.035, c[1] + 0.03, c[2] + 0.01], [c[0] - s * 0.04, c[1] + 0.035, c[2] + 0.075], 0.02, skinP, { bone: wr });
  }

  // ---------- blunderbuss (held in the right hand) ----------
  const hr = hands.R;
  const gx = -0.36;
  bd.frustumBox([gx, 0.7, -0.2], [gx, 0.72, 0.16], [0.05, 0.11], [0.045, 0.065], { color: woodP, bone: hr });
  box(0.055, 0.12, 0.012, [gx, 0.7, -0.205], brassP, hr);
  box(0.012, 0.05, 0.12, [gx - 0.027, 0.74, 0.1], steelP, hr);
  box(0.012, 0.05, 0.12, [gx + 0.027, 0.74, 0.1], steelP, hr);
  box(0.012, 0.06, 0.02, [gx - 0.03, 0.79, 0.07], STEELD, hr, [20, 0, 0]);
  box(0.016, 0.02, 0.03, [gx - 0.03, 0.765, 0.14], BRASS, hr);
  bd.rod([gx, 0.745, 0.1], [gx, 0.745, 0.58], [0.035, 0.028], STEELD, { bone: hr });
  for (const z of [0.2, 0.34, 0.48]) torus(0.034 - (z - 0.2) * 0.02, 0.007, [gx, 0.745, z], brassP, hr, [0, 0, 0], 10);
  bd.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.03, 0.03],
      [0.05, 0.09],
      [0.07, 0.14],
      [0, 0.14],
    ],
    { at: [gx, 0.745, 0.58], axis: [0, 0, 1], bone: hr, color: steelP, segments: 10 },
  );
  bd.part(new THREE.CircleGeometry(0.058, 10), DARK, { at: [gx, 0.745, 0.7215], dir: [0, 0, 1], axis: "z", bone: hr });
  torus(0.07, 0.007, [gx, 0.745, 0.718], BRASS, hr, [0, 0, 0], 12);
  bd.rod([gx, 0.703, 0.12], [gx, 0.703, 0.62], 0.008, WOODD, { bone: hr });
  bd.sweep(
    [
      [gx, 0.676, 0.0],
      [gx, 0.652, 0.05],
      [gx, 0.676, 0.1],
    ],
    0.006,
    { color: BRASS, bone: hr },
  );
  bd.rod([gx, 0.68, 0.045], [gx, 0.66, 0.05], 0.005, BRASSD, { bone: hr });
  bd.part(new THREE.ConeGeometry(0.008, 0.02, 5), BRASS, { at: [gx, 0.783, 0.56], bone: hr });
  box(0.03, 0.04, 0.012, [gx - 0.027, 0.7, -0.06], brassP, hr);

  return bd.root;
}
