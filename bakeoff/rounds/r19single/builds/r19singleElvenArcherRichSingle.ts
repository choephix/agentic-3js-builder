// Elven ranger archer: high-fantasy anime. Cel-shaded paints (kits/toon), gold filigree trims, a leaf-cut mantle,
// a long recurve bow in the left hand and a back quiver. Faces +Z, left is +X, about 1.8 m tall.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { bezier, catmull, polyline } from "../../../../src/path";
import { grain, paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { interpolate } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A slender elven ranger in a leaf-cut emerald mantle with gold filigree, long silver hair, amber anime eyes, a recurve bow and a back quiver of fletched arrows.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type P3 = [number, number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const mix3 = (a: P3, c: P3, t: number): P3 => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
const flat = (rx: number, ry: number) => (): [number, number] => [rx, ry];

export default function build() {
  const b = createBuilder({ name: "elvenArcher", paintSize: 2048 });
  const S = [1, -1] as const;
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ------------------------------------------------------------------------------------------------ palette
  const SKIN = cel("#ffe1cf", "#ecaaa6");
  const HAIR = cel(grain("#f7f4e2", "#e6dfc2", { size: 0.012, axis: "y" }), "#a6b3dc");
  const TUNIC = cel("#2fa06f", "#1c6b6a");
  const TUNIC_DEEP = cel("#1f7d5e", "#154f5c");
  const CAPE = cel("#2b9468", "#1b5c68");
  const LEGG = cel("#2c6b62", "#1d4561");
  const LEATH = cel("#a86b38", "#6e3f2f");
  const LEATH_D = cel("#6b4229", "#432838");
  const BOOT = cel("#8c5632", "#5a3235");
  const GOLD = cel("#ffd45c", "#d98a2e");
  const CREAM = cel("#fbf1d4", "#d6c0b6");
  const WOOD = cel("#f6ebcb", "#c8b39b");
  const SHAFT = cel("#e2c68c", "#b08a6a");
  const FLETCH_B = cel("#35b27a", "#1f7a74");
  const ROSE = cel("#f4a7a6", "#c97a8e");
  const GEM = "#62ffbd";

  // ------------------------------------------------------------------------------------------------ drawings
  let leaves = "";
  for (let i = 0; i < 6; i++) {
    const y = 108 - i * 18;
    const d = i % 2 ? 1 : -1;
    leaves += `<path d="M20 ${y} Q${20 + d * 14} ${y - 4} ${20 + d * 18} ${y - 16} Q${20 + d * 4} ${y - 12} 20 ${y}Z" fill="#ffd45c"/>`;
  }
  const vine = svg(
    `<svg viewBox="0 0 40 120"><path d="M20 118 C8 100 32 84 20 66 C8 48 32 32 20 8" stroke="#ffd45c" stroke-width="3" fill="none" stroke-linecap="round"/>${leaves}<circle cx="20" cy="7" r="4" fill="#ffd45c"/></svg>`,
    { size: 256 },
  );
  const tassel = svg(
    `<svg viewBox="0 0 24 80"><path d="M12 0 V16" stroke="#ffd45c" stroke-width="2.6"/><circle cx="12" cy="20" r="5" fill="#ffd45c"/><path d="M6 25 Q12 22 18 25 L22 76 L2 76Z" fill="#2fa06f"/><path d="M4 40 H20 M3 56 H21" stroke="#ffd45c" stroke-width="3"/><rect x="2" y="70" width="20" height="9" fill="#ffd45c"/></svg>`,
    { size: 160 },
  );
  const mouth = svg(
    `<svg viewBox="0 0 40 14"><path d="M5 4 Q20 11 35 4" stroke="#b5524f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M16 8.5 Q20 10.5 24 8.5" stroke="#f08a86" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 160 },
  );
  const EYE = animeEye({ iris: "#ffae2e" });

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.93, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, 0],
      [0, 1.06, 0.004],
      [0, 1.19, 0.012],
      [0, 1.33, 0.008],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const sp1 = spine.joints[0];
  const sp2 = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.32, 0.006],
      [0, 1.41, 0.018],
      [0, 1.5, 0.032],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neckTop"], role: "neck" },
  );
  const neckTop = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", { parent: neckTop, at: [0, 1.5, 0.032], aim: [0, 1.62, 0.05], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.585, 0.03], aim: [0, 1.545, 0.11], role: "jaw" });

  // ------------------------------------------------------------------------------------------------ legs
  for (const s of S) {
    const side = s > 0 ? "L" : "R";
    const hip: P3 = [s * 0.092, 0.93, 0];
    const knee: P3 = [s * 0.097, 0.5, 0.035];
    const ankle: P3 = [s * 0.098, 0.1, -0.012];
    const leg = b.chain(`leg${side}`, catmull([hip, knee, ankle]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.098, 0, 0.06],
    });
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[leg.joints.length - 1];
    const tk = leg.ts[1];
    const legR = (t: number) =>
      interpolate([0, 0.3, tk, tk + 0.15, 0.85, 1], [0.083, 0.074, 0.056, 0.06, 0.043, 0.038], t);
    b.sweep(leg, legR, {
      color: LEGG,
      bands: [
        [tk + 0.02, LEGG],
        [1, BOOT],
      ],
    });
    // gold-trimmed greave on the shin
    b.sweep(leg, (t) => legR(t) + 0.007, {
      from: tk + 0.1,
      to: 0.86,
      caps: "flat",
      color: LEATH_D,
      bands: [
        [tk + 0.13, GOLD],
        [0.82, LEATH_D],
        [0.86, GOLD],
      ],
    });
    // flared boot cuff below the knee
    const kp = leg.at(tk + 0.03);
    b.lathe(
      [
        [0.058, -0.025],
        [0.074, 0.035],
        [0.07, 0.04],
        [0.052, -0.02],
      ],
      {
        at: kp.at,
        axis: [-kp.tangent.x, -kp.tangent.y, -kp.tangent.z],
        bone: kneeJ,
        color: LEATH,
        segments: 8,
      },
    );
    // foot
    b.sweep(
      catmull([
        [s * 0.098, 0.085, -0.02],
        [s * 0.098, 0.058, 0.05],
        [s * 0.098, 0.04, 0.12],
      ]),
      [0.043, 0.041, 0.035],
      { color: BOOT, bone: ankleJ },
    );
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.27), LEATH_D, { bone: ankleJ, at: [s * 0.098, 0.0099, 0.065] });
    b.part(new THREE.BoxGeometry(0.082, 0.03, 0.07), LEATH_D, { bone: ankleJ, at: [s * 0.098, 0.03, -0.045] });
    const toe = b.joint(`toe${side}`, {
      parent: ankleJ,
      at: [s * 0.098, 0.04, 0.13],
      aim: [s * 0.098, 0.045, 0.21],
    });
    b.capsule([s * 0.098, 0.04, 0.125], [s * 0.098, 0.058, 0.2], [0.033, 0.011], { color: BOOT, bone: toe });
    // gold ankle band
    b.sweep(
      catmull(
        Array.from({ length: 8 }, (_, k): P3 => {
          const a = (k / 8) * Math.PI * 2;
          return [s * 0.098 + Math.sin(a) * 0.046, 0.115, -0.012 + Math.cos(a) * 0.046];
        }),
        { closed: true },
      ),
      0.006,
      { color: GOLD, bone: ankleJ },
    );
  }

  // ------------------------------------------------------------------------------------------------ torso
  const bodyPaint = paint((p, n) => {
    if (p.y < 0.985) return LEGG;
    if (n.z > -0.2) {
      const vy = p.y - 1.24;
      if (vy > 0) {
        const d = Math.abs(p.x) - vy * 0.75;
        if (Math.abs(d) < 0.0055) return GOLD;
        if (d < 0) return CREAM;
      }
      if (n.z > 0.3 && Math.abs(p.x) < 0.0045 && p.y < 1.24) return GOLD;
    }
    return TUNIC;
  });
  const TT = [0, 0.2, 0.45, 0.72, 0.9, 1];
  const RX = [0.15, 0.138, 0.118, 0.146, 0.14, 0.09];
  const RY = [0.095, 0.088, 0.08, 0.092, 0.088, 0.062];
  const torso = b.sweep(spine, (t): [number, number] => [interpolate(TT, RX, t), interpolate(TT, RY, t)], {
    color: bodyPaint,
  });
  const skin = b.surface(torso);
  for (const s of S)
    b.decal(skin, vine, { at: [s * 0.075, 1.14, 0.1], dir: [s * 0.2, 0, 1], size: [0.045, 0.135] });

  // shoulders
  for (const s of S) b.part(sph(0.058), TUNIC, { bone: chest, at: [s * 0.188, 1.335, 0] });

  // layered leaf pauldron on the bow arm, a small guard on the other shoulder
  for (let k = 0; k < 3; k++) {
    const at: P3 = [0.2 + 0.022 * k, 1.385 - 0.05 * k, 0];
    const dir: P3 = [0.55 + 0.12 * k, 0.8 - 0.18 * k, 0];
    const r = 0.092 + 0.008 * k;
    b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), LEATH, {
      bone: chest,
      at,
      dir,
      scale: [r, 0.055, r],
    });
    b.part(new THREE.TorusGeometry(r, 0.0045, 4, 12), GOLD, { bone: chest, at, dir, axis: "z" });
  }
  b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), LEATH_D, {
    bone: chest,
    at: [-0.2, 1.375, 0],
    dir: [-0.5, 0.85, 0],
    scale: [0.072, 0.045, 0.072],
  });
  b.part(new THREE.TorusGeometry(0.072, 0.004, 4, 12), GOLD, {
    bone: chest,
    at: [-0.2, 1.375, 0],
    dir: [-0.5, 0.85, 0],
    axis: "z",
  });

  // belt, buckle, baldric
  const belt = skin.loop([0, 1.0, 0], { lift: 0.012 });
  b.sweep(belt, flat(0.009, 0.027), { color: LEATH_D, section: "box", up: [0, 1, 0], bone: sp1 });
  b.sweep(skin.loop([0, 1.0, 0], { lift: 0.022 }), flat(0.004, 0.004), { color: GOLD, section: "box", up: [0, 1, 0], bone: sp1 });
  const buckle = skin.nearest([0, 1.0, 0.2]);
  b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), GOLD, buckle, { embed: 0.4 });
  glow(b.stick(new THREE.OctahedronGeometry(0.014), GEM, buckle.moved([0, 0.01, 0]), { embed: 0.3 }), 1.4);
  const sash = skin.drape(
    catmull(
      [
        [-0.1, 1.33, 0.06],
        [-0.02, 1.22, 0.095],
        [0.08, 1.08, 0.095],
        [0.15, 0.99, 0.03],
        [0.12, 1.02, -0.08],
        [0.03, 1.14, -0.1],
        [-0.07, 1.26, -0.09],
        [-0.13, 1.34, -0.03],
      ],
      { closed: true },
    ),
    { lift: 0.012 },
  );
  b.sweep(sash, flat(0.02, 0.011), { color: LEATH, bone: sp2 });

  // collar and clasp chain
  b.lathe(
    [
      [0.066, 0],
      [0.072, 0.028],
      [0.06, 0.056],
      [0.05, 0.053],
      [0.059, 0.028],
      [0.054, 0],
    ],
    {
      at: [0, 1.37, 0.012],
      bone: chest,
      segments: 12,
      color: paint((p) => (p.y > 1.415 ? GOLD : TUNIC_DEEP)),
    },
  );
  const clasp: ReturnType<typeof skin.nearest>[] = [];
  for (const s of S) {
    const hit = skin.nearest([s * 0.085, 1.355, 0.1]);
    clasp.push(hit);
    b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 8), GOLD, hit, { embed: 0.4 });
    glow(b.stick(new THREE.OctahedronGeometry(0.012), GEM, hit.moved([0, 0.007, 0]), { embed: 0.3 }), 1.4);
  }
  b.sweep(bezier(clasp[0], [0, 1.3, 0.13], clasp[1]), 0.004, { color: GOLD, bone: chest });

  // ------------------------------------------------------------------------------------------------ tabard, tails, belt gear
  const tabOutline = (w: number, L: number): OutlinePoint[] => [
    [-w, 0],
    [w, 0],
    [w, -(L - w)],
    [0, -L, "sharp"],
    [-w, -(L - w)],
  ];
  const tabPaint = (w: number, L: number) =>
    paint((_p, n, s) => {
      if (Math.abs(n.z) < 0.5) return GOLD;
      const y = s[1];
      const hw = y > -(L - w) ? w : w - (-y - (L - w));
      if (Math.abs(s[0]) > hw - 0.012 || y > -0.016) return GOLD;
      return TUNIC_DEEP;
    });
  const front = b.extrude(tabOutline(0.075, 0.43), {
    at: [0, 0.99, 0.12],
    x: [1, 0, 0],
    thickness: 0.012,
    bevel: 0.003,
    color: tabPaint(0.075, 0.43),
    bone: hips,
  });
  b.decal(front, vine, { at: [0, 0.79, 0.13], dir: [0, 0, 1], size: [0.05, 0.15] });
  const back = b.extrude(tabOutline(0.09, 0.5), {
    at: [0, 0.99, -0.118],
    x: [-1, 0, 0],
    thickness: 0.012,
    bevel: 0.003,
    color: tabPaint(0.09, 0.5),
    bone: hips,
  });
  b.decal(back, vine, { at: [0, 0.77, -0.13], dir: [0, 0, -1], size: [0.055, 0.17] });

  // dagger on the left hip
  const dg0: P3 = [0.205, 0.99, 0.025];
  const dg1: P3 = [0.222, 0.74, -0.05];
  b.rod(dg0, dg1, [0.02, 0.013], { color: LEATH_D, caps: { start: "flat", end: "round" }, bone: hips });
  b.rod(dg0, mix3(dg0, dg1, 0.1), [0.0235, 0.0225], { color: GOLD, bone: hips });
  b.rod(mix3(dg0, dg1, 0.55), mix3(dg0, dg1, 0.58), 0.0205, { color: GOLD, bone: hips });
  b.rod(mix3(dg0, dg1, 0.9), mix3(dg0, dg1, 0.98), [0.0155, 0.0125], { color: GOLD, bone: hips });
  b.rod(dg0, [0.2, 1.07, 0.032], 0.011, { color: CREAM, bone: hips });
  b.part(new THREE.BoxGeometry(0.02, 0.01, 0.07), GOLD, { bone: hips, at: [0.203, 1.005, 0.027] });
  glow(b.part(new THREE.OctahedronGeometry(0.014), GEM, { bone: hips, at: [0.2, 1.085, 0.033] }), 1.4);

  // pouch on the right hip
  b.part(new THREE.BoxGeometry(0.04, 0.08, 0.07), LEATH, { bone: hips, at: [-0.195, 0.945, 0.03] });
  b.part(new THREE.BoxGeometry(0.044, 0.032, 0.074), LEATH_D, { bone: hips, at: [-0.195, 0.985, 0.03] });
  b.part(sph(0.008), GOLD, { bone: hips, at: [-0.219, 0.972, 0.03] });

  // tassels on the belt
  b.cards(
    [frame([0.12, 0.99, 0.1], [0, 1, 0]), frame([0.16, 0.985, 0.06], [0, 1, 0]), frame([-0.08, 0.99, 0.11], [0, 1, 0])],
    tassel,
    { size: [0.03, 0.1], lean: 180, flow: [0, 0, 1], bone: hips },
  );

  // ------------------------------------------------------------------------------------------------ arms and hands
  const armR = (t: number) =>
    interpolate([0, 0.2, 0.38, 0.47, 0.52, 0.75, 1], [0.052, 0.05, 0.058, 0.062, 0.04, 0.034, 0.03], t);

  const relaxedHand = (s: number, side: string, wj: Joint, W: P3) => {
    b.part(sph(1, 8, 6), SKIN, { bone: wj, at: [W[0] + s * 0.006, W[1] - 0.05, W[2]], scale: [0.02, 0.056, 0.04] });
    const defs: Array<[string, number, number]> = [
      ["index", 0.026, 1.0],
      ["middle", 0.0085, 1.08],
      ["ring", -0.0095, 0.98],
      ["pinky", -0.027, 0.8],
    ];
    const L = [0.03, 0.022, 0.018];
    const ang = [10, 28, 42];
    for (const [nm, off, k] of defs) {
      let q: P3 = [W[0] + s * 0.012, W[1] - 0.092, W[2] + off];
      const pts: P3[] = [q];
      for (let i = 0; i < 3; i++) {
        const a = rad(ang[i]);
        q = [q[0] - s * Math.sin(a) * L[i] * k, q[1] - Math.cos(a) * L[i] * k, q[2] + 0.002];
        pts.push(q);
      }
      const ch = b.chain(`${nm}${side}`, catmull(pts), {
        parent: wj,
        names: [`${nm}1${side}`, `${nm}2${side}`, `${nm}3${side}`, `${nm}Tip${side}`],
        role: "digit",
      });
      b.sweep(ch, [0.0095 * (0.7 + 0.3 * k), 0.0068], { color: SKIN });
    }
    const t0: P3 = [W[0] - s * 0.004, W[1] - 0.035, W[2] + 0.034];
    const t1: P3 = [t0[0] - s * 0.011, t0[1] - 0.024, t0[2] + 0.015];
    const t2: P3 = [t1[0] - s * 0.012, t1[1] - 0.02, t1[2] + 0.011];
    const th = b.chain(`thumb${side}`, catmull([t0, t1, t2]), {
      parent: wj,
      names: [`thumb1${side}`, `thumb2${side}`, `thumbTip${side}`],
      role: "digit",
    });
    b.sweep(th, [0.0105, 0.0075], { color: SKIN });
  };

  for (const s of S) {
    const side = s > 0 ? "L" : "R";
    const sh: P3 = [s * 0.19, 1.34, 0];
    const elbow: P3 = [s * 0.28, 1.09, s > 0 ? 0.02 : 0];
    const wrist: P3 = s > 0 ? [0.36, 0.84, 0.075] : [-0.345, 0.84, 0.045];
    const arm = b.chain(`arm${side}`, catmull([sh, elbow, wrist]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const wj = arm.joints[arm.joints.length - 1];
    b.sweep(arm, armR, {
      color: SKIN,
      bands: [
        [0.44, TUNIC],
        [0.48, GOLD],
        [1, SKIN],
      ],
    });
    // gold-edged leather bracer
    b.sweep(arm, (t) => armR(t) + 0.007, {
      from: 0.56,
      to: 0.9,
      caps: "flat",
      color: LEATH,
      bands: [
        [0.58, GOLD],
        [0.85, LEATH],
        [0.9, GOLD],
      ],
    });
    if (s < 0) relaxedHand(s, side, wj, wrist);
    else {
      // left fist round the bow grip
      const BX = 0.375;
      b.part(sph(1, 8, 6), SKIN, { bone: wj, at: [0.372, 0.776, 0.108], scale: [0.03, 0.054, 0.028] });
      ["index", "middle", "ring", "pinky"].forEach((nm, k) => {
        const y = 0.806 - 0.022 * k;
        const pts: P3[] = [-35, 40, 125].map(
          (a): P3 => [BX + 0.031 * Math.cos(rad(a)), y, 0.15 + 0.031 * Math.sin(rad(a))],
        );
        const ch = b.chain(`${nm}L`, catmull(pts), {
          parent: wj,
          names: [`${nm}1L`, `${nm}2L`, `${nm}TipL`],
          role: "digit",
        });
        b.sweep(ch, [0.0095, 0.0075], { color: SKIN });
      });
      const th: P3[] = [190, 140, 95].map(
        (a): P3 => [BX + 0.031 * Math.cos(rad(a)), 0.829, 0.15 + 0.031 * Math.sin(rad(a))],
      );
      const thumb = b.chain("thumbL", catmull(th), {
        parent: wj,
        names: ["thumb1L", "thumb2L", "thumbTipL"],
        role: "digit",
      });
      b.sweep(thumb, [0.0105, 0.0078], { color: SKIN });

      // the bow
      const bowYZ: Array<[number, number]> = [
        [0.09, 0.07],
        [0.13, 0.065],
        [0.22, 0.075],
        [0.4, 0.1],
        [0.62, 0.135],
        [0.78, 0.15],
        [0.94, 0.135],
        [1.16, 0.1],
        [1.34, 0.075],
        [1.43, 0.065],
        [1.47, 0.07],
      ];
      const bowPaint = paint((p) => {
        const d = Math.abs(p.y - 0.78);
        if (d < 0.07) return LEATH_D;
        if (Math.abs(d - 0.085) < 0.006 || Math.abs(d - 0.3) < 0.005 || Math.abs(d - 0.5) < 0.006 || d > 0.64)
          return GOLD;
        return WOOD;
      });
      b.sweep(
        catmull(bowYZ.map(([y, z]): P3 => [BX, y, z])),
        (t) => 0.0065 + 0.0105 * (1 - Math.abs(2 * t - 1) ** 1.4),
        { color: bowPaint, bone: wj },
      );
      b.rod([BX, 0.092, 0.062], [BX, 1.468, 0.062], 0.0022, { color: "#fffbe8", bone: wj, sides: 4 });
      for (const y of [0.09, 1.47]) b.part(sph(0.009), GOLD, { bone: wj, at: [BX, y, 0.07] });
      const leaf: OutlinePoint[] = [
        [0, -0.1, "sharp"],
        [0.03, -0.03],
        [0.03, 0.03],
        [0, 0.1, "sharp"],
        [-0.03, 0.03],
        [-0.03, -0.03],
      ];
      for (const y of [0.94, 0.62]) {
        b.extrude(leaf, { at: [BX, y, 0.148], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, smoothing: 1, color: GOLD, bone: wj });
        glow(b.part(new THREE.OctahedronGeometry(0.009), GEM, { bone: wj, at: [BX, y, 0.158] }), 1.4);
      }
      glow(b.part(new THREE.OctahedronGeometry(0.011), GEM, { bone: wj, at: [BX, 0.858, 0.165] }), 1.4);
    }
  }

  // ------------------------------------------------------------------------------------------------ neck, head
  b.sweep(neck, [0.043, 0.036], { color: SKIN });
  const skull = b.part(sph(1, 16, 12), SKIN, {
    bone: head,
    at: [0, 1.625, 0.04],
    scale: [0.087, 0.098, 0.095],
  });
  const jawPart = b.part(sph(1, 12, 8), SKIN, { bone: jaw, at: [0, 1.556, 0.07], scale: [0.058, 0.052, 0.066] });
  b.part(new THREE.ConeGeometry(0.03, 0.04, 6), SKIN, { bone: jaw, at: [0, 1.512, 0.118], dir: [0, -0.9, 0.5] });
  b.part(new THREE.ConeGeometry(0.008, 0.026, 5), SKIN, { bone: head, at: [0, 1.598, 0.134], dir: [0, -0.35, 1] });
  const face = b.surface([skull, jawPart]);
  for (const s of S)
    b.decal(face, EYE, {
      at: [s * 0.044, 1.612, 0.13],
      dir: [s * 0.22, 0, 1],
      size: [0.054, 0.074],
      mirror: s > 0,
    });
  b.decal(face, mouth, { at: [0, 1.563, 0.14], dir: [0, 0, 1], size: [0.036, 0.0126] });

  // ears
  const earOutline: OutlinePoint[] = [
    [0, 0.03],
    [0.05, 0.06],
    [0.11, 0.095],
    [0.17, 0.125, "sharp"],
    [0.12, 0.055],
    [0.07, 0],
    [0.02, -0.04],
    [0, -0.02],
  ];
  const earInner: OutlinePoint[] = [
    [0.03, 0.02],
    [0.06, 0.04],
    [0.1, 0.065],
    [0.135, 0.082, "sharp"],
    [0.1, 0.035],
    [0.065, 0.005],
    [0.04, 0],
  ];
  for (const s of S) {
    const at: P3 = [s * 0.082, 1.615, 0.005];
    const x: P3 = [s * 0.6, 0, -0.8];
    b.extrude(earOutline, { at, x, thickness: 0.012, bevel: 0.002, color: SKIN, bone: head });
    b.extrude(earInner, { at, x, thickness: 0.018, color: ROSE, bone: head });
    const earPt = (u: number, v: number): P3 => [at[0] + s * 0.6 * u, at[1] + v, at[2] - 0.8 * u];
    for (const [u, v] of [
      [0.09, 0.083],
      [0.12, 0.1],
    ])
      b.part(new THREE.TorusGeometry(0.011, 0.0028, 4, 8), GOLD, {
        bone: head,
        at: earPt(u, v),
        dir: [s * 0.6 * 0.06, 0.035, -0.8 * 0.06],
        axis: "z",
      });
    b.part(sph(0.007), GOLD, { bone: head, at: [s * 0.089, 1.584, 0.0] });
    glow(b.part(new THREE.OctahedronGeometry(0.009), GEM, { bone: head, at: [s * 0.089, 1.566, 0.0] }), 1.4);
  }

  // hair cap, crown tufts, bangs
  b.part(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, rad(88)), HAIR, {
    bone: head,
    at: [0, 1.63, 0.035],
    rotation: [-25, 0, 0],
    scale: [0.095, 0.101, 0.101],
  });
  for (const [x, len] of [
    [-0.03, 0.08],
    [0, 0.1],
    [0.03, 0.08],
  ])
    b.spike([x, 1.712, 0.0], [x * 2, 1, -0.4], len, 0.02, { color: HAIR, bone: head });
  const skullZ = (x: number, y: number) =>
    0.04 + 0.095 * Math.sqrt(Math.max(0, 1 - (x / 0.087) ** 2 - ((y - 1.625) / 0.098) ** 2));
  const bangs: Array<[number, number]> = [
    [-0.074, 1.668],
    [-0.04, 1.648],
    [-0.012, 1.664],
    [0.018, 1.65],
    [0.048, 1.66],
    [0.076, 1.645],
  ];
  for (const [x, yEnd] of bangs) {
    const start: P3 = [x * 0.6, 1.7, skullZ(x * 0.6, 1.7) + 0.012];
    const ctrl: P3 = [x * 0.9, 1.69, skullZ(x * 0.9, 1.69) + 0.034];
    const end: P3 = [x, yEnd, skullZ(x, yEnd) + 0.014];
    b.sweep(bezier(start, ctrl, end), [0.022, 0], { color: HAIR, bone: head, caps: "point" });
  }

  // circlet
  const circ: P3[] = Array.from({ length: 12 }, (_, k): P3 => {
    const a = (k / 12) * Math.PI * 2;
    return [0.089 * Math.sin(a), 1.668 + 0.005 * Math.cos(a), 0.03 + 0.093 * Math.cos(a)];
  });
  b.sweep(catmull(circ, { closed: true }), 0.007, { color: GOLD, bone: head });
  glow(b.part(new THREE.OctahedronGeometry(0.014), GEM, { bone: head, at: [0, 1.673, 0.128] }), 1.4);

  // face-framing locks, with gold beads on the right one
  for (const s of S) {
    const pts: P3[] = [
      [s * 0.083, 1.668, 0.04],
      [s * 0.092, 1.63, 0.075],
      [s * 0.098, 1.57, 0.082],
      [s * 0.108, 1.49, 0.07],
      [s * 0.115, 1.41, 0.08],
      [s * 0.108, 1.345, 0.1],
    ];
    const path = catmull(pts);
    b.sweep(path, [0.014, 0.022, 0.022, 0.018, 0.012, 0], { color: HAIR, bone: head, caps: "point" });
    if (s < 0)
      b.along(path, 3, (at) => {
        b.part(new THREE.TorusGeometry(0.016, 0.0035, 4, 8), GOLD, { bone: head, at, dir: at, axis: "z" });
      });
  }

  // long hair down the back
  const hair = b.chain(
    "hair",
    catmull([
      [0, 1.645, -0.07],
      [0, 1.575, -0.13],
      [0, 1.45, -0.19],
      [0, 1.3, -0.218],
      [0, 1.15, -0.215],
    ]),
    { parent: head, names: ["hair1", "hair2", "hair3", "hair4"], role: "tail" },
  );
  const HT = [0, 0.25, 0.5, 0.8, 1];
  const HRX = [0.05, 0.075, 0.085, 0.07, 0];
  const HRY = [0.03, 0.036, 0.036, 0.03, 0.01];
  b.sweep(hair, (t): [number, number] => [interpolate(HT, HRX, t), interpolate(HT, HRY, t)], {
    color: HAIR,
    caps: "point",
  });
  const lock = (dx: number, endY: number, dz: number, r: number) => {
    const m = (1.45 + endY) / 2;
    const pts: P3[] = [
      [dx * 0.4, 1.645, -0.07],
      [dx * 0.8, 1.575, -0.13 + dz * 0.3],
      [dx, 1.45, -0.19 + dz],
      [dx * 1.1, m, -0.21 + dz],
      [dx * 0.9, endY, -0.2 + dz],
    ];
    b.sweep(catmull(pts), [r * 0.6, r, r, r * 0.7, 0], { color: HAIR, bone: hair, caps: "point" });
  };
  lock(0.07, 1.06, 0, 0.026);
  lock(-0.06, 1.02, 0, 0.026);
  lock(0.035, 0.96, -0.02, 0.028);
  lock(-0.03, 0.99, -0.02, 0.028);
  lock(0, 0.93, -0.035, 0.03);
  lock(0.09, 1.1, 0.01, 0.02);
  lock(-0.09, 1.12, 0.01, 0.02);

  // ------------------------------------------------------------------------------------------------ mantle
  const capeA = catmull([
    [0.2, 1.37, 0.05],
    [0.19, 1.39, -0.04],
    [0.1, 1.4, -0.115],
    [0, 1.405, -0.135],
    [-0.1, 1.4, -0.115],
    [-0.19, 1.39, -0.04],
    [-0.2, 1.37, 0.05],
  ]);
  const hem: P3[] = Array.from({ length: 13 }, (_, i): P3 => {
    const u = i / 12;
    const sn = Math.sin(Math.PI * u);
    return [0.19 * (1 - 2 * u), 1.15 - 0.12 * sn - (i % 2 ? 0.05 : 0), 0.04 - 0.215 * sn];
  });
  const capePaint = paint((p, n, s) => {
    if (s[1] > 0.945) return GOLD;
    if (s[1] > 0.9 && s[1] < 0.925) return TUNIC_DEEP;
    if (n.z < -0.1) {
      const dy = p.y - 1.215;
      const r = Math.hypot(p.x, dy);
      if (Math.abs(r - 0.085) < 0.0035 || Math.abs(r - 0.062) < 0.0025) return GOLD;
      const a = Math.atan2(dy, p.x);
      if (r > 0.02 && r < 0.056 && Math.abs(Math.cos(4 * a)) > 0.9) return GOLD;
    }
    return CAPE;
  });
  b.membrane(capeA, polyline(hem), { color: capePaint, thickness: 0.012, rows: 6, cols: 24, bone: chest });

  // ------------------------------------------------------------------------------------------------ quiver and arrows
  const Q0 = new THREE.Vector3(-0.1, 0.86, -0.165);
  const Q1 = new THREE.Vector3(-0.22, 1.22, -0.175);
  const qU = Q1.clone().sub(Q0).normalize();
  const qE1 = new THREE.Vector3(0, 0, 1).cross(qU).normalize();
  const qE2 = qU.clone().cross(qE1).normalize();
  const qLen = Q1.distanceTo(Q0);
  const tmp = new THREE.Vector3();
  const quiverPaint = paint((p) => {
    const d = tmp.copy(p).sub(Q0).dot(qU) / qLen;
    if (Math.abs(d - 0.18) < 0.018 || Math.abs(d - 0.8) < 0.018 || d > 0.97) return GOLD;
    return LEATH;
  });
  b.rod(Q0, Q1, [0.04, 0.055], { color: quiverPaint, caps: { start: "round", end: "flat" }, bone: sp2 });
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.006, 10), INK, {
    bone: sp2,
    at: Q1.clone().addScaledVector(qU, -0.004),
    dir: qU,
  });
  b.part(new THREE.TorusGeometry(0.055, 0.006, 5, 12), GOLD, { bone: sp2, at: Q1, dir: qU, axis: "z" });
  for (const d of [0.25, 0.7]) {
    const c = Q0.clone().addScaledVector(qU, qLen * d);
    const rr = 0.04 + 0.015 * d;
    b.part(new THREE.TorusGeometry(rr + 0.002, 0.005, 4, 10), LEATH_D, { bone: sp2, at: c, dir: qU, axis: "z" });
    const frontPt = c.clone().addScaledVector(qE1, 0).add(new THREE.Vector3(0, 0, rr));
    b.rod(frontPt, [c.x * 0.55, c.y, -0.09], 0.008, { color: LEATH_D, bone: sp2 });
  }
  glow(b.part(new THREE.OctahedronGeometry(0.012), GEM, {
    bone: sp2,
    at: Q0.clone().addScaledVector(qU, qLen * 0.5).add(new THREE.Vector3(0, 0, 0.05)),
  }), 1.2);

  const offs: Array<[number, number]> = [
    [0, 0],
    [0.022, 0.01],
    [-0.022, 0.01],
    [0.012, -0.02],
    [-0.012, -0.02],
    [0.03, -0.012],
    [-0.03, -0.012],
  ];
  offs.forEach(([a, c], i) => {
    const base = Q1.clone().addScaledVector(qE1, a).addScaledVector(qE2, c);
    const bot = base.clone().addScaledVector(qU, -0.12);
    const top = base.clone().addScaledVector(qU, 0.2 + 0.012 * i);
    b.rod(bot, top, 0.0045, { color: SHAFT, bone: sp2, sides: 5 });
    b.part(sph(0.006, 5, 4), GOLD, { bone: sp2, at: top });
    const fl = top.clone().addScaledVector(qU, -0.045);
    const color = i % 2 ? FLETCH_B : CREAM;
    b.part(new THREE.BoxGeometry(0.028, 0.07, 0.002), color, { bone: sp2, at: fl, dir: qU, up: qE1 });
    b.part(new THREE.BoxGeometry(0.028, 0.07, 0.002), color, { bone: sp2, at: fl, dir: qU, up: qE2 });
  });

  return b.root;
}
