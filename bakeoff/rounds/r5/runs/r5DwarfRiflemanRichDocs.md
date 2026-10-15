```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, bezier, limb, mottle, grain, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "Stocky Ironforge-style dwarf rifleman with a braided ginger beard, goggled steel helm, big pauldrons and a brass-flared blunderbuss. Rigged in a relaxed A-pose with a jaw, finger chains and braid chains.",
};

// palette
const SKIN = "#e8a983";
const SKIN_D = "#d98765";
const NOSE = "#e58f6f";
const BEARD = "#c9601f";
const BEARD_D = "#9a3f12";
const BLUE = "#2b5fb4";
const BLUE_D = "#1d4285";
const GOLD = "#e8b730";
const BRASS = "#c58a2c";
const STEEL = "#a3afbc";
const STEEL_D = "#6c7886";
const STEEL_DD = "#3f4752";
const LEATHER = "#7b4a27";
const LEATHER_D = "#4a2c17";
const GLOVE = "#5a3720";
const WOOD = "#8a5528";
const WOOD_D = "#5c3517";
const BONE = "#e9dfc4";
const FUR = "#efe6d2";
const PANTS = "#4a3d33";
const RED = "#b8321e";
const WHITE = "#f4f1ea";
const EYE = "#3c8fd8";
const BLACK = "#1b1410";
const GLASS = "#8fd6f0";
const TAN = "#b79a62";

const EMBLEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="29" fill="#1a3a78" stroke="#e8b730" stroke-width="5"/>
<path d="M13 24 H49 Q51 24 51 27 Q51 31 45 31 H40 L38 37 H43 V45 H21 V37 H26 L24 31 H20 Q13 31 13 24 Z" fill="#f0c540"/>
<circle cx="32" cy="15" r="3.5" fill="#d83a2a"/>
</svg>`;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dwarfRifleman" });

  // ---------- helpers ----------
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ell = (rx: number, ry: number, rz: number, ws = 10, hs = 7) => {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.scale(rx, ry, rz);
    return g;
  };
  const cyl = (r0: number, r1: number, h: number, seg = 8) => new THREE.CylinderGeometry(r0, r1, h, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const lerpStops = (st: number[][], t: number): [number, number] => {
    for (let i = 1; i < st.length; i++) {
      if (t <= st[i][0]) {
        const a = st[i - 1];
        const c = st[i];
        const k = (t - a[0]) / (c[0] - a[0]);
        return [a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];
      }
    }
    const l = st[st.length - 1];
    return [l[1], l[2]];
  };

  // paints
  const tunic = mottle(BLUE, BLUE_D, { size: 0.06 });
  const steelPaint = mottle(STEEL, "#c5ced8", { size: 0.06 });
  const pantsPaint = mottle(PANTS, "#3a2f27", { size: 0.07 });
  const bootPaint = mottle(LEATHER_D, "#5d3a20", { size: 0.04 });
  const beardPaint = grain(BEARD, BEARD_D, { size: 0.022, axis: "y" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.55, 0], role: "spine" });
  const spine = b.chain(
    "spineChain",
    catmull([
      [0, 0.6, 0],
      [0, 0.8, 0.02],
      [0, 1.0, 0.04],
    ]),
    { parent: hips, names: ["spine", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neckC = b.chain(
    "neckChain",
    polyline([
      [0, 1.0, 0.04],
      [0, 1.12, 0.07],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const neckJ = neckC.joints[0];
  const head = b.joint("head", { parent: neckJ, at: [0, 1.12, 0.07], dir: [0, 1, 0.25], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.175, 0.06], aim: [0, 1.12, 0.2], role: "jaw" });

  // ---------- torso ----------
  const torsoPath = catmull([
    [0, 0.5, 0],
    [0, 0.66, 0],
    [0, 0.84, 0.03],
    [0, 1.0, 0.04],
  ]);
  const prof = [
    [0, 0.18, 0.15],
    [0.1, 0.2, 0.165],
    [0.35, 0.235, 0.19],
    [0.6, 0.225, 0.18],
    [0.82, 0.27, 0.17],
    [1, 0.2, 0.12],
  ];
  const torso = b.sweep(torsoPath, (t: number) => lerpStops(prof, t), {
    bone: [hips, spine],
    color: tunic,
    sides: 12,
    caps: { start: "round", end: "flat" },
  });
  const cuirassPaint = paint((_p, _n, s) => (s[0] < 0.52 || s[0] > 0.965 ? GOLD : steelPaint));
  const cuirass = b.sweep(
    torsoPath,
    (t: number) => {
      const r = lerpStops(prof, t);
      return [r[0] + 0.018, r[1] + 0.018] as [number, number];
    },
    { from: 0.45, to: 1, bone: [hips, spine], color: cuirassPaint, sides: 12, caps: "flat" },
  );
  b.sweep(neckC, 0.085, { color: SKIN, sides: 8 });
  // fur collar
  {
    const g = new THREE.TorusGeometry(0.16, 0.036, 5, 12);
    g.rotateX(Math.PI / 2);
    g.scale(1.28, 1, 0.8);
    b.part(g, FUR, { at: [0, 1.005, 0.04], bone: chest, flat: true });
  }

  // cuirass emblem and rivets
  b.decal(cuirass, svg(EMBLEM_SVG, { size: 128 }), { at: [0, 0.84, 0.24], dir: [0, 0, 1], size: [0.13, 0.13] });
  {
    const cs = b.surface(cuirass);
    const rivetLoop = cs.loop([0, 0.78, 0.0], { lift: 0.004 });
    b.along(rivetLoop, 20, (at) => {
      b.part(ell(0.011, 0.011, 0.011, 6, 4), BRASS, { at });
    });
  }

  // belt, buckle, pouches
  const skin = b.surface(torso);
  b.sweep(skin.loop([0, 0.6, 0], { lift: 0.012 }), 0.026, { color: LEATHER });
  const front = skin.ray([0, 0.6, 1.5], [0, 0, -1]);
  if (front) {
    b.stick(box(0.1, 0.03, 0.085), BRASS, front.moved([0, 0.026, 0]), { embed: 0.3 });
    b.stick(box(0.055, 0.034, 0.045), LEATHER_D, front.moved([0, 0.034, 0]), { embed: 0.3 });
  }
  for (const s of [1, -1]) {
    const h = skin.ray([s * 1, 0.56, 0.12], [-s, 0, 0]);
    if (h) {
      b.stick(box(0.09, 0.06, 0.085), LEATHER_D, h.moved([0, 0.02, 0]), { embed: 0.3 });
      b.stick(ell(0.013, 0.013, 0.013, 6, 4), BRASS, h.moved([0, 0.065, 0]), { embed: 0.2 });
    }
  }

  // bandolier
  {
    const sk2 = b.surface([torso, cuirass]);
    const rough = catmull(
      [
        V(-0.2, 1.06, 0.05),
        V(-0.12, 0.95, 0.34),
        V(0.0, 0.84, 0.36),
        V(0.14, 0.72, 0.34),
        V(0.3, 0.62, 0.12),
        V(0.3, 0.64, -0.1),
        V(0.14, 0.74, -0.32),
        V(-0.1, 0.92, -0.3),
        V(-0.22, 1.04, -0.1),
      ],
      { closed: true },
    );
    const strap = sk2.drape(rough, { lift: 0.014 });
    b.sweep(strap, 0.02, { color: LEATHER });
    const t0 = strap.closestT(V(-0.12, 0.95, 0.34));
    const t1 = strap.closestT(V(0.3, 0.62, 0.12));
    if (t1 > t0) {
      b.along(strap.slice(t0, t1), 7, (at) => {
        b.part(cyl(0.017, 0.017, 0.07, 6), BRASS, { at, dir: [0, 1, 0] });
        b.part(cyl(0.011, 0.011, 0.025, 6), RED, { at: at.moved({ up: 0.045 }), dir: [0, 1, 0] });
      });
    }
  }

  // powder horn on left hip
  b.sweep(bezier(V(0.25, 0.64, -0.04), V(0.34, 0.56, -0.1), V(0.33, 0.42, -0.2), V(0.24, 0.34, -0.26)), [0.045, 0.012], {
    bone: hips,
    color: BONE,
    sides: 8,
  });
  b.part(cyl(0.05, 0.05, 0.03, 8), BRASS, { at: [0.25, 0.65, -0.04], dir: [0.1, 1, 0.3], bone: hips });

  // tabards
  const tabOutline: [number, number, string?][] = [];
  void tabOutline;
  const tabPaint = paint((_p, _n, s) =>
    s[1] > -0.025 || s[1] < -0.21 || Math.abs(s[0]) > 0.092 ? GOLD : BLUE,
  );
  const tab = b.extrude(
    [
      [-0.11, 0],
      [0.11, 0],
      [0.105, -0.2],
      [0, -0.27, "sharp"],
      [-0.105, -0.2],
    ],
    { at: [0, 0.6, 0.2], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, color: tabPaint, bone: hips },
  );
  b.decal(tab, svg(EMBLEM_SVG, { size: 128 }), { at: [0, 0.47, 0.207], dir: [0, 0, 1], size: [0.09, 0.09] });
  b.extrude(
    [
      [-0.11, 0],
      [0.11, 0],
      [0.1, -0.22],
      [0, -0.28, "sharp"],
      [-0.1, -0.22],
    ],
    { at: [0, 0.6, -0.19], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, color: BLUE_D, bone: hips },
  );

  // backpack
  b.part(box(0.34, 0.34, 0.17), LEATHER, { at: [0, 0.86, -0.23], bone: chest });
  b.part(box(0.35, 0.07, 0.19), LEATHER_D, { at: [0, 1.0, -0.23], bone: chest });
  b.part(box(0.06, 0.05, 0.02), BRASS, { at: [0, 0.97, -0.33], bone: chest });
  b.part(cyl(0.075, 0.075, 0.4, 10), TAN, { at: [0, 1.1, -0.23], dir: [1, 0, 0], bone: chest });
  for (const s of [1, -1]) {
    b.part(cyl(0.08, 0.08, 0.03, 10), LEATHER_D, { at: [s * 0.12, 1.1, -0.23], dir: [1, 0, 0], bone: chest });
    b.part(cyl(0.06, 0.06, 0.01, 10), BLUE, { at: [s * 0.201, 1.1, -0.23], dir: [1, 0, 0], bone: chest });
  }
  b.part(cyl(0.06, 0.055, 0.09, 8), STEEL_D, { at: [-0.19, 0.74, -0.34], bone: chest });
  b.part(cyl(0.062, 0.062, 0.015, 8), STEEL_DD, { at: [-0.19, 0.79, -0.34], bone: chest });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.11, 0.5, 0], [s * 0.115, 0.07, 0.015], [0.23, 0.22], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.115, 0, 0.07],
    });
    b.sweep(leg, [0.105, 0.097, 0.086, 0.078, 0.07, 0.064], { color: pantsPaint, sides: 10 });
    const knee = leg.joints[1];
    const ank = leg.joints[2];
    const kneeP = pts[1];
    const ankP = pts[2];
    const fx = s * 0.115;

    // boot
    b.part(box(0.17, 0.075, 0.27), bootPaint, { at: [fx, 0.0675, 0.07], bone: ank });
    b.part(box(0.18, 0.03, 0.29), LEATHER_D, { at: [fx, 0.015, 0.075], bone: ank });
    b.part(ell(0.08, 0.055, 0.075, 8, 6), STEEL_D, { at: [fx, 0.058, 0.175], bone: ank, flat: true });
    const shaftTop = ankP.clone().lerp(kneeP, 0.64);
    b.rod(ankP.clone().add(V(0, -0.015, 0)), shaftTop, [0.088, 0.098], bootPaint, { bone: ank, sides: 8 });
    b.rod(ankP.clone().lerp(kneeP, 0.54), ankP.clone().lerp(kneeP, 0.7), 0.108, FUR, { bone: ank, sides: 8 });
    b.part(box(0.045, 0.045, 0.014), BRASS, { at: [fx, shaftTop.y - 0.04, shaftTop.z + 0.095], bone: ank });
    // knee guard
    b.part(cyl(0.064, 0.07, 0.045, 8), STEEL_D, {
      at: [kneeP.x, kneeP.y + 0.01, kneeP.z + 0.075],
      dir: [0, 0.15, 1],
      bone: knee,
    });
    b.part(ell(0.016, 0.016, 0.016, 6, 4), BRASS, {
      at: [kneeP.x, kneeP.y + 0.012, kneeP.z + 0.102],
      bone: knee,
    });
  }

  // ---------- gun frame (blunderbuss held in right hand) ----------
  const tilt = (14 * Math.PI) / 180;
  const gdir = V(0, Math.sin(tilt), Math.cos(tilt));
  const gup = V(0, Math.cos(tilt), -Math.sin(tilt));
  const gripC = V(-0.31, 0.63, 0.315);
  const O = gripC.clone().addScaledVector(gdir, 0.04).addScaledVector(gup, 0.055);
  const G = (u: number, v: number, w = 0) => O.clone().addScaledVector(gdir, u).addScaledVector(gup, v).add(V(w, 0, 0));

  const mkFinger = (name: string, parent: any, pts: THREE.Vector3[], r0: number, r1: number, color: any) => {
    const f = b.chain(name, polyline(pts), { parent, names: [`${name}a`, `${name}b`], role: "digit" });
    b.sweep(f, [r0, r1], { color, sides: 6 });
  };

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderP = V(s * 0.33, 0.97, 0);
    const elbowP = s > 0 ? V(0.415, 0.74, 0.025) : V(-0.41, 0.75, 0.0);
    const wristP = s > 0 ? V(0.47, 0.545, 0.125) : V(-0.36, 0.66, 0.24);
    const arm = b.chain(`arm${side}`, polyline([shoulderP, elbowP, wristP]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const sh = arm.joints[0];
    const wrist = arm.joints[2];
    const sp = arm.span(1);
    const split = sp[0];
    b.sweep(arm, [0.088, 0.082, 0.078, 0.074, 0.066, 0.058, 0.052], {
      color: paint((_p, _n, st) => (st[0] < split ? tunic : SKIN)),
      sides: 10,
    });
    // bracer
    const f0 = sp[0] + (sp[1] - sp[0]) * 0.35;
    const f1 = sp[0] + (sp[1] - sp[0]) * 0.97;
    b.sweep(arm, (t: number) => 0.072 + 0.015 * ((t - f0) / (f1 - f0)), {
      from: f0,
      to: f1,
      caps: "flat",
      color: LEATHER_D,
      sides: 8,
    });
    b.sweep(arm, 0.092, { from: f1 - 0.03, to: f1, caps: "flat", color: GOLD, sides: 8 });
    // elbow rivet
    b.part(ell(0.02, 0.02, 0.02, 6, 4), BRASS, { at: elbowP.clone().add(V(s * 0.07, 0, -0.02)), bone: arm.joints[1] });

    // pauldron
    const aN = V(s * 0.5, 0.85, 0).normalize();
    const pc = V(s * 0.335, 0.985, 0);
    b.lathe(
      [
        [0, 0],
        [0.15, 0],
        [0.16, 0.02],
        [0.14, 0.07],
        [0.09, 0.115],
        [0, 0.135],
      ],
      { at: pc, axis: aN, segments: 10, color: steelPaint, bone: sh },
    );
    b.lathe(
      [
        [0.15, -0.005],
        [0.172, -0.005],
        [0.172, 0.025],
        [0.15, 0.025],
      ],
      { at: pc, axis: aN, segments: 10, color: GOLD, bone: sh },
    );
    b.lathe(
      [
        [0, 0],
        [0.11, 0],
        [0.115, 0.015],
        [0.09, 0.05],
        [0.05, 0.075],
        [0, 0.085],
      ],
      { at: pc.clone().addScaledVector(aN, 0.085), axis: aN, segments: 10, color: STEEL_D, bone: sh },
    );
    b.part(new THREE.ConeGeometry(0.03, 0.1, 6), BRASS, {
      at: pc.clone().addScaledVector(aN, 0.19),
      dir: aN,
      bone: sh,
    });

    if (s > 0) {
      // ----- left hand: open, fingers spread -----
      const hd = wristP.clone().sub(elbowP).normalize();
      const wv = V(0, 0, 1).addScaledVector(hd, -hd.z).normalize();
      const inw = V(-s, 0, 0);
      b.part(box(0.045, 0.1, 0.105), GLOVE, {
        at: wristP.clone().addScaledVector(hd, 0.05),
        dir: hd,
        up: wv,
        bone: wrist,
      });
      const offs = [0.04, 0.014, -0.012, -0.038];
      const lens = [0.058, 0.066, 0.062, 0.05];
      offs.forEach((off, i) => {
        const base = wristP.clone().addScaledVector(hd, 0.095).addScaledVector(wv, off);
        const mid = base.clone().addScaledVector(hd, lens[i] * 0.55).addScaledVector(inw, 0.005);
        const tip = mid
          .clone()
          .addScaledVector(hd, lens[i] * 0.45)
          .addScaledVector(inw, 0.014)
          .addScaledVector(wv, off * 0.3);
        mkFinger(`finger${side}${i}`, wrist, [base, mid, tip], 0.0185, 0.013, GLOVE);
      });
      const tb = wristP.clone().addScaledVector(hd, 0.04).addScaledVector(wv, 0.055).addScaledVector(inw, 0.012);
      const tm = tb.clone().addScaledVector(wv, 0.02).addScaledVector(hd, 0.035);
      const tt = tm.clone().addScaledVector(wv, 0.012).addScaledVector(hd, 0.035).addScaledVector(inw, 0.01);
      mkFinger(`thumb${side}`, wrist, [tb, tm, tt], 0.022, 0.015, GLOVE);
    } else {
      // ----- right hand gripping the blunderbuss -----
      const hand = wrist;
      const gpart = (geo: THREE.BufferGeometry, color: any, u: number, v: number, w = 0) =>
        b.part(geo, color, { at: G(u, v, w), dir: gdir, up: gup, bone: hand });

      // palm and fingers
      gpart(box(0.045, 0.08, 0.115), GLOVE, -0.04, -0.055, -0.05);
      for (let k = 0; k < 4; k++) {
        const v = -0.03 - k * 0.026;
        mkFinger(`finger${side}${k}`, hand, [G(-0.025, v, -0.05), G(-0.005, v, -0.012), G(-0.03, v, 0.032)], 0.016, 0.012, GLOVE);
      }
      mkFinger(`thumb${side}`, hand, [G(-0.045, -0.005, -0.05), G(-0.072, -0.005, 0.0), G(-0.05, -0.005, 0.032)], 0.019, 0.013, GLOVE);

      // grip + receiver
      gpart(box(0.05, 0.05, 0.11), WOOD_D, -0.04, -0.055);
      gpart(box(0.07, 0.17, 0.09), BRASS, 0.01, 0.03);
      for (const w of [-1, 1]) gpart(box(0.012, 0.11, 0.06), STEEL_DD, 0.0, 0.035, w * 0.04);
      gpart(box(0.016, 0.022, 0.06), STEEL_DD, -0.045, 0.1);
      // stock
      b.frustumBox(G(-0.07, 0.035), G(-0.38, -0.03), [0.06, 0.085], [0.07, 0.15], {
        bone: hand,
        color: grain(WOOD, WOOD_D, { size: 0.014, axis: [gdir.x, gdir.y, gdir.z] }),
      });
      gpart(box(0.074, 0.02, 0.16), BRASS, -0.39, -0.033);
      for (const w of [-1, 1]) {
        const g = cyl(0.02, 0.02, 0.006, 8);
        g.rotateZ(Math.PI / 2);
        gpart(g, BRASS, -0.2, 0.0, w * 0.033);
      }
      // barrel, forestock, bands, ramrod
      b.rod(G(0.07, 0.04), G(0.5, 0.04), [0.033, 0.028], STEEL_D, { bone: hand, sides: 8 });
      gpart(box(0.05, 0.23, 0.04), WOOD, 0.185, 0.0);
      for (const u of [0.09, 0.2, 0.33, 0.45]) {
        gpart(cyl(0.04, 0.04, 0.03, 8), BRASS, u, 0.04);
      }
      b.rod(G(0.12, -0.002), G(0.46, -0.002), 0.008, STEEL, { bone: hand, sides: 5 });
      gpart(ell(0.014, 0.014, 0.014, 6, 4), STEEL, 0.465, -0.002);
      // flared muzzle
      b.lathe(
        [
          [0.034, 0],
          [0.037, 0.06],
          [0.06, 0.14],
          [0.092, 0.2],
          [0.074, 0.2],
          [0.046, 0.14],
          [0.026, 0.06],
          [0.026, 0],
        ],
        { at: G(0.5, 0.04), axis: gdir, segments: 10, color: BRASS, bone: hand },
      );
      // sight, trigger guard and trigger
      b.spike(G(0.46, 0.066), gup.clone(), 0.03, 0.01, { color: BRASS, bone: hand });
      b.sweep(bezier(G(0.08, 0.0), G(0.08, -0.05), G(0.025, -0.05), G(0.025, 0.0)), 0.006, {
        color: BRASS,
        bone: hand,
        sides: 5,
      });
      b.spike(G(0.045, 0.0), gup.clone().negate(), 0.03, 0.007, { color: STEEL, bone: hand });
    }
  }

  // ---------- head ----------
  const HC = V(0, 1.24, 0.09);
  b.part(ell(0.145, 0.15, 0.15, 12, 9), SKIN, { at: HC, bone: head, flat: true });
  b.part(ell(0.07, 0.04, 0.08, 8, 5), BLACK, { at: [0, 1.15, 0.14], bone: head, flat: true });
  b.part(ell(0.11, 0.065, 0.1, 10, 7), SKIN, { at: [0, 1.15, 0.14], bone: jaw, flat: true });
  b.part(ell(0.036, 0.034, 0.04, 8, 6), NOSE, { at: [0, 1.208, 0.262], bone: head, flat: true });
  b.part(ell(0.125, 0.027, 0.05, 10, 5), SKIN_D, { at: [0, 1.292, 0.205], bone: head, flat: true });

  for (const s of [1, -1]) {
    // eyes
    b.part(ell(0.022, 0.02, 0.02, 6, 5), WHITE, { at: [s * 0.06, 1.265, 0.213], bone: head });
    b.part(ell(0.013, 0.013, 0.01, 6, 4), EYE, { at: [s * 0.06, 1.265, 0.229], bone: head });
    b.part(ell(0.007, 0.007, 0.006, 5, 4), BLACK, { at: [s * 0.06, 1.265, 0.236], bone: head });
    b.part(ell(0.004, 0.004, 0.003, 4, 3), WHITE, { at: [s * 0.0635, 1.27, 0.241], bone: head });
    b.part(ell(0.026, 0.012, 0.024, 6, 4), SKIN_D, { at: [s * 0.06, 1.28, 0.214], bone: head });
    // brows
    b.sweep(catmull([V(s * 0.015, 1.305, 0.256), V(s * 0.06, 1.31, 0.25), V(s * 0.1, 1.295, 0.2)]), [0.02, 0.01], {
      bone: head,
      color: BEARD,
      sides: 6,
    });
    // ears, cheeks, side beard
    b.part(ell(0.02, 0.04, 0.03, 6, 5), SKIN, { at: [s * 0.147, 1.25, 0.06], bone: head, flat: true });
    b.part(ell(0.045, 0.04, 0.04, 6, 5), NOSE, { at: [s * 0.08, 1.19, 0.2], bone: head, flat: true });
    b.part(ell(0.06, 0.09, 0.09, 8, 6), beardPaint, { at: [s * 0.105, 1.15, 0.12], bone: head, flat: true });
    // mustache
    b.sweep(
      catmull([V(s * 0.012, 1.178, 0.262), V(s * 0.06, 1.168, 0.255), V(s * 0.11, 1.15, 0.225), V(s * 0.14, 1.178, 0.19)]),
      [0.035, 0.03, 0.022, 0.008],
      { bone: head, color: beardPaint, sides: 7 },
    );
    // nostrils
    b.part(ell(0.007, 0.005, 0.005, 4, 3), BLACK, { at: [s * 0.016, 1.192, 0.292], bone: head });
  }

  // chin beard and main beard mass
  b.part(ell(0.1, 0.08, 0.09, 8, 6), beardPaint, { at: [0, 1.1, 0.2], bone: jaw, flat: true });
  const beardStops = [
    [0, 0.1, 0.08],
    [0.3, 0.14, 0.1],
    [0.65, 0.12, 0.09],
    [1, 0.04, 0.04],
  ];
  b.sweep(
    bezier(V(0, 1.16, 0.19), V(0, 1.06, 0.27), V(0, 0.98, 0.28), V(0, 0.91, 0.25)),
    (t: number) => lerpStops(beardStops, t),
    { bone: jaw, color: beardPaint, caps: { start: "round", end: "point" }, sides: 10 },
  );

  // braids
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const bp = catmull([
      V(s * 0.07, 0.96, 0.255),
      V(s * 0.082, 0.86, 0.285),
      V(s * 0.078, 0.75, 0.285),
      V(s * 0.07, 0.65, 0.27),
    ]);
    const braid = b.chain(`braid${side}`, bp, {
      parent: jaw,
      names: [`braid${side}1`, `braid${side}2`, `braid${side}3`, `braid${side}4`],
      role: "tentacle",
    });
    b.sweep(braid, [0.022, 0.015], { color: BEARD_D, sides: 6 });
    let k = 0;
    b.along(braid, 14, (at) => {
      const sc = 1 - 0.3 * at.t;
      const g = new THREE.CapsuleGeometry(0.024, 0.022, 2, 6);
      g.rotateZ((k % 2 ? 1 : -1) * 0.6);
      g.scale(sc, sc, sc);
      b.part(g, k % 2 ? BEARD : BEARD_D, { frame: at, flat: true });
      k++;
    });
    const tipF = braid.at(1);
    const ringG = new THREE.TorusGeometry(0.02, 0.008, 5, 8);
    ringG.rotateX(Math.PI / 2);
    b.part(ringG, BRASS, { frame: tipF });
    const tuft = new THREE.ConeGeometry(0.028, 0.075, 6);
    tuft.translate(0, 0.0375, 0);
    b.part(tuft, BEARD, { frame: tipF, flat: true });
    const ring2 = new THREE.TorusGeometry(0.03, 0.009, 5, 8);
    ring2.rotateX(Math.PI / 2);
    b.part(ring2, GOLD, { frame: braid.at(0.2) });
  }

  // ---------- helmet ----------
  const Y0 = 1.295;
  b.lathe(
    [
      [0, 0],
      [0.168, 0],
      [0.172, 0.02],
      [0.16, 0.07],
      [0.12, 0.125],
      [0.06, 0.152],
      [0, 0.16],
    ],
    { at: [0, Y0, 0.09], axis: [0, 1, 0], segments: 10, color: steelPaint, bone: head },
  );
  b.lathe(
    [
      [0.164, -0.002],
      [0.18, -0.002],
      [0.18, 0.035],
      [0.164, 0.035],
    ],
    { at: [0, Y0, 0.09], axis: [0, 1, 0], segments: 10, color: GOLD, bone: head },
  );
  b.extrude(
    [
      [-0.15, 0],
      [0.15, 0],
      [0.12, 0.07],
      [0.05, 0.12],
      [-0.05, 0.13],
      [-0.13, 0.08],
    ],
    { at: [0, Y0 + 0.08, 0.09], thickness: 0.026, bevel: 0.005, smoothing: 1, color: BRASS, bone: head },
  );
  // goggles
  b.lathe(
    [
      [0.15, 0.05],
      [0.178, 0.05],
      [0.178, 0.09],
      [0.15, 0.09],
    ],
    { at: [0, Y0, 0.09], axis: [0, 1, 0], segments: 10, color: LEATHER_D, bone: head },
  );
  for (const s of [1, -1]) {
    const tg = new THREE.TorusGeometry(0.036, 0.01, 5, 10);
    b.part(tg, BRASS, { at: [s * 0.058, Y0 + 0.07, 0.272], dir: [0, 0.15, 1], axis: "z", bone: head });
    b.part(new THREE.CircleGeometry(0.032, 10), GLASS, {
      at: [s * 0.058, Y0 + 0.07, 0.2745],
      dir: [0, 0.15, 1],
      axis: "z",
      bone: head,
    });
  }
  b.rod([-0.022, Y0 + 0.07, 0.273], [0.022, Y0 + 0.07, 0.273], 0.008, BRASS, { bone: head, sides: 5 });
  // plume
  b.sweep(
    bezier(V(0, 1.47, 0.04), V(0, 1.57, -0.04), V(0, 1.55, -0.14), V(0, 1.42, -0.2)),
    (t: number) => [0.01 + 0.03 * Math.sin(Math.PI * Math.min(t * 1.2, 1)), 0.012] as [number, number],
    { bone: head, color: RED, sides: 6 },
  );

  return b.root;
}
```