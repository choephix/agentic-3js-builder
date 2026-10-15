// Elven ranger archer: high-fantasy anime. Slender, long-limbed proportions, cel-shaded silver hair, ornate gold trim,
// glowing teal gems, a recurved bow held in the left fist and a quiver of fletched arrows on the back.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { catmull } from "../../../../src/path";
import { gradient, grain, mottle, paint } from "../../../../src/paint";
import { animeEye, cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A tall elven ranger in forest green with a gold-trimmed tabard and cape, silver hair, long pointed ears, anime eyes, a glowing-gem circlet, a recurved bow in hand and a fletched quiver on her back.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const nrm = (v: THREE.Vector3) => v.clone().normalize();

// ---------------------------------------------------------------- palette
const GOLD_HEX = "#f4c95d";
const GOLD = cel(GOLD_HEX, "#c98a2b");
const SKIN = cel("#f8decb", "#e3a79e");
const HAIR = cel(gradient("#f6f8fc", "#c9d3f0", V(0, 1.85, 0), V(0, 0.95, 0)), "#9aa6d6");
const HAIR_DK = cel("#c3cdea", "#7f8bc0");
const TEAL = cel("#2bb7a0", "#1e8a8c");
const TEAL_HEX = "#38f0d2";
const CREAM = cel("#f3ead0", "#d9c79c");

const TUNIC_BASE = mottle("#34986a", "#2c8460", { size: 0.06, seed: 5 });
const TUNIC = cel(
  paint((p, n) => {
    const vTrim = Math.abs(Math.abs(p.x) - (p.y - 1.18) * 0.3);
    if (n.z > 0.2 && p.y > 1.18 && vTrim < 0.007) return GOLD_HEX;
    return TUNIC_BASE;
  }),
);
const SKIRT = cel(
  paint((_p, _n, s) => {
    const tri = Math.abs(((s[1] / 22) % 1) * 2 - 1);
    if (s[0] < 0.03 + 0.028 * tri) return GOLD_HEX;
    if (s[0] < 0.075 && s[0] > 0.062 + 0.02 * tri) return "#e9b44c";
    return TUNIC_BASE;
  }),
);
const CAPE_BASE = mottle("#1f5a47", "#1a4a3b", { size: 0.12, seed: 2 });
const CAPE = cel(
  paint((p, n, s) => {
    if (s[0] > 0.955) return GOLD_HEX;
    if (s[0] > 0.9 && Math.abs(Math.sin(p.x * 70)) < 0.35) return GOLD_HEX;
    if (n.z > 0.5) return "#4fa88a";
    return CAPE_BASE;
  }),
);
const TABARD = cel(
  paint((_p, _n, s) => {
    const x = Math.abs(s[0]);
    const y = s[1];
    if (x > 0.06 && y > -0.31) return GOLD_HEX;
    if (x < 0.004 && y > -0.3) return GOLD_HEX;
    const c = (y + x * 0.9) / 0.045;
    if (x < 0.05 && y > -0.3 && c - Math.floor(c) < 0.14) return "#e9b44c";
    return "#2a7a5a";
  }),
);
const LEATHER_BASE = grain("#935f38", "#7d4d2d", { size: 0.012, axis: "y" });
const LEATHER = cel(LEATHER_BASE);
const LEATHER_D = cel("#5b3823", "#3d2417");
const BOOT = cel(LEATHER_BASE);
const FOOT = cel(paint((p) => (p.y < 0.016 ? "#3a2417" : LEATHER_BASE)));
const WOOD = cel(grain("#d49a58", "#a8693a", { size: 0.01, axis: "y" }));
const LEGG = cel("#2e4d52", "#243b4a");

function build() {
  const b = createBuilder({ name: "elvenArcher" });

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.98, 0] });
  const spine = b.chain(
    "spine",
    catmull([V(0, 1.0, 0), V(0, 1.14, 0.004), V(0, 1.3, 0.014), V(0, 1.47, 0.012)]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([V(0, 1.47, 0.012), V(0, 1.545, 0.025), V(0, 1.62, 0.04)]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.62, 0.04], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.69, 0.0], aim: [0, 1.65, 0.1], role: "jaw" });

  // ------------------------------------------------------------ torso, pelvis
  b.part(new THREE.SphereGeometry(1, 12, 8), LEGG, { bone: hips, at: [0, 0.99, 0], scale: [0.14, 0.085, 0.1] });
  const torso = b.loft(
    [
      { at: V(0, 1.0, 0), w: 0.27, h: 0.18 },
      { at: V(0, 1.14, 0), w: 0.235, h: 0.17 },
      { at: V(0, 1.3, 0.012), w: 0.285, h: 0.2 },
      { at: V(0, 1.44, 0.015), w: 0.33, h: 0.2 },
      { at: V(0, 1.52, 0.02), w: 0.2, h: 0.15 },
    ],
    { bone: spine, color: TUNIC, sides: 10 },
  );
  const torsoSkin = b.surface(torso);

  // neck
  b.sweep(neck, 0.033, { color: SKIN, sides: 8 });
  b.part(new THREE.TorusGeometry(0.056, 0.012, 6, 12), cel("#1f6a4d", "#17503b"), {
    bone: chest,
    at: [0, 1.5, 0.02],
    dir: [0, 1, 0],
    axis: "z",
  });

  // belt, studs and buckle
  const beltPath = torsoSkin.loop(V(0, 1.07, 0), { lift: 0.012 });
  b.sweep(beltPath, (): [number, number] => [0.013, 0.024], { color: LEATHER_D, sides: 8 });
  b.along(torsoSkin.loop(V(0, 1.07, 0), { lift: 0.03 }), 14, (at) =>
    b.part(new THREE.SphereGeometry(0.0075, 5, 4), GOLD, { at }),
  );
  const hitAt = (az: number) => torsoSkin.around(V(0, 1.07, 0)).at(az, 0)!;
  const front = hitAt(0);
  b.stick(new THREE.BoxGeometry(0.055, 0.016, 0.05), GOLD, front.moved([0, 0.014, 0]), { embed: 0.1 });
  glow(
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), TEAL_HEX, front.moved([0, 0.03, 0]), { embed: 0.1 }),
    1.2,
  );
  // pouch on the left hip
  const pouch = hitAt(72);
  b.stick(new THREE.BoxGeometry(0.075, 0.048, 0.075), LEATHER, pouch, { embed: 0.3 });
  b.stick(new THREE.BoxGeometry(0.08, 0.016, 0.045), LEATHER_D, pouch.moved([0, 0.032, 0.014]), { embed: 0.1 });
  b.stick(new THREE.SphereGeometry(0.011, 6, 4), GOLD, pouch.moved([0, 0.05, 0.026]), { embed: 0.1 });
  // dagger on the right hip
  b.rod(V(-0.172, 1.07, 0.0), V(-0.26, 0.76, 0.02), 0.019, { color: LEATHER_D, bone: spine1, sides: 6 });
  b.rod(V(-0.172, 1.07, 0.0), V(-0.168, 1.075, 0.0), 0.021, { color: GOLD, bone: spine1, sides: 6 });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { bone: spine1, at: [-0.262, 0.745, 0.02] });
  b.rod(V(-0.172, 1.07, 0.0), V(-0.165, 1.16, 0.0), 0.012, { color: LEATHER_D, bone: spine1, sides: 6 });
  b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, { bone: spine1, at: [-0.164, 1.175, 0.0] });
  b.part(new THREE.BoxGeometry(0.012, 0.012, 0.065), GOLD, { bone: spine1, at: [-0.17, 1.085, 0.0] });
  b.rod(V(-0.2, 0.98, 0.012), V(-0.236, 0.86, 0.02), 0.021, { color: INK, bone: spine1, sides: 6 });

  // chest strap (quiver baldric)
  const strapPath = torsoSkin.drape(
    catmull(
      [
        V(-0.11, 1.5, 0.0),
        V(-0.05, 1.4, 0.115),
        V(0.06, 1.26, 0.115),
        V(0.135, 1.12, 0.07),
        V(0.14, 1.1, -0.02),
        V(0.07, 1.2, -0.09),
        V(-0.04, 1.36, -0.095),
        V(-0.11, 1.47, -0.05),
      ],
      { closed: true },
    ),
    { lift: 0.012 },
  );
  b.sweep(strapPath, 0.015, { color: LEATHER_D, sides: 6 });
  b.along(strapPath, 7, (at) => b.part(new THREE.SphereGeometry(0.01, 5, 4), GOLD, { at }));

  // brooch at the collar
  const brooch = b.extrude(
    [
      [0, -0.032],
      [0.02, 0],
      [0, 0.032],
      [-0.02, 0],
    ],
    { at: [0, 1.452, 0.123], x: [1, 0, 0], thickness: 0.01, bevel: 0.002, color: GOLD, bone: chest },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.0115, 6, 4), TEAL_HEX, { bone: chest, at: [0, 1.452, 0.132] }),
    1.3,
  );
  void brooch;

  // ------------------------------------------------------------ skirt, tabard, legs
  b.lathe(
    [
      [0.15, 0.42],
      [0.236, 0.0],
      [0.222, 0.0],
      [0.136, 0.41],
    ],
    { at: [0, 0.62, 0], bone: hips, color: SKIRT, segments: 12 },
  );
  const tabardDir = nrm(V(0, 1, -0.25));
  b.extrude(
    [
      [-0.07, 0],
      [0.07, 0],
      [0.065, -0.3],
      [0, -0.4, "sharp"],
      [-0.065, -0.3],
    ],
    { at: [0, 1.07, 0.14], x: [1, 0, 0], y: tabardDir.toArray(), thickness: 0.012, bevel: 0.002, color: TABARD, bone: hips },
  );
  b.part(new THREE.SphereGeometry(0.013, 6, 4), GOLD, { bone: hips, at: [0, 0.675, 0.24] });
  b.spike(V(0, 0.6, 0.242), [0, 1, 0], 0.07, 0.017, { color: TEAL, bone: hips, sides: 8 });

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const legPts = limb(V(s * 0.09, 0.96, 0), V(s * 0.1, 0.09, 0), [0.45, 0.43], [0, 0, 1]);
    const leg = b.chain(`leg${sd}`, legPts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.05],
    });
    const ankle = leg.tip!;
    b.sweep(leg, [0.074, 0.068, 0.054, 0.047, 0.04], { color: LEGG, sides: 10 });
    const boot = b.sweep(leg, [0.067, 0.06, 0.053, 0.049, 0.0445], {
      from: 0.4,
      color: BOOT,
      sides: 10,
      caps: { start: "flat", end: "round" },
    });
    b.sweep(leg, 0.071, { from: 0.4, to: 0.47, color: LEATHER_D, sides: 10, caps: "flat" });
    b.sweep(leg, 0.0735, { from: 0.465, to: 0.48, color: GOLD, sides: 10, caps: "flat" });
    for (const t of [0.52, 0.6, 0.68, 0.76, 0.84])
      b.part(new THREE.BoxGeometry(0.056, 0.004, 0.007), "#efe3c0", { frame: boot.at(t, 0, 0.001) });
    // knee cop
    b.part(new THREE.SphereGeometry(1, 8, 6), GOLD, {
      bone: leg.joints[1],
      at: [s * 0.1, leg.joints[1].at.y, leg.joints[1].at.z + 0.052],
      scale: [0.04, 0.046, 0.022],
    });
    // foot
    b.capsule(V(s * 0.1, 0.047, -0.045), V(s * 0.1, 0.042, 0.085), [0.047, 0.04], { color: FOOT, bone: ankle, sides: 8 });
    const toe = b.joint(`toe${sd}`, { parent: ankle, at: [s * 0.1, 0.04, 0.09], aim: [s * 0.1, 0.04, 0.15], role: "hinge" });
    b.capsule(V(s * 0.1, 0.04, 0.085), V(s * 0.1, 0.04, 0.145), [0.04, 0.032], { color: FOOT, bone: toe, sides: 8 });
    b.spike(V(s * 0.1, 0.045, 0.14), V(s * 0.1, 0.09, 0.235), null, 0.03, { color: FOOT, bone: toe, sides: 6 });
  }

  // ------------------------------------------------------------ cape
  const cape = b.chain(
    "cape",
    catmull([V(0, 1.5, -0.105), V(0, 1.15, -0.15), V(0, 0.8, -0.2), V(0, 0.5, -0.245)]),
    { parent: chest, names: ["cape1", "cape2", "cape3"] },
  );
  b.sweep(cape, (t: number): [number, number] => [0.15 + 0.12 * t, 0.009], {
    section: "box",
    caps: "flat",
    color: CAPE,
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), CAPE, { bone: chest, at: [0, 1.51, -0.085], scale: [0.105, 0.06, 0.07] });

  // ------------------------------------------------------------ arms
  const hand = (
    s: number,
    sd: string,
    wristJ: NonNullable<ReturnType<typeof b.chain>["tip"]>,
    W: THREE.Vector3,
    E: THREE.Vector3,
    fist: boolean,
  ) => {
    const d = nrm(W.clone().sub(E));
    const inw = V(-s, 0, 0);
    const thumbDir = fist ? V(0, 1, 0) : V(0, 0, 1);
    const across = nrm(thumbDir.clone().addScaledVector(d, -thumbDir.dot(d)));
    const palmEnd = W.clone().addScaledVector(d, 0.08);
    b.sweep([W, palmEnd], (t: number): [number, number] => [0.017, 0.032 + 0.004 * t], {
      caps: "round",
      color: SKIN,
      bone: wristJ,
      sides: 8,
    });
    const specs = [
      ["pinky", -0.027, 0.05],
      ["ring", -0.009, 0.06],
      ["middle", 0.009, 0.066],
      ["index", 0.027, 0.06],
    ] as const;
    for (const [name, off, L] of specs) {
      const base = palmEnd.clone().addScaledVector(across, off);
      const p1 = base.clone().addScaledVector(d, L * 0.36);
      const dir2 = fist
        ? d.clone().multiplyScalar(0.2).addScaledVector(inw, 0.9)
        : d.clone().multiplyScalar(0.8).addScaledVector(inw, 0.4);
      const p2 = p1.clone().addScaledVector(nrm(dir2), L * 0.33);
      const dir3 = fist
        ? d.clone().multiplyScalar(-0.7).addScaledVector(inw, 0.55)
        : d.clone().multiplyScalar(0.5).addScaledVector(inw, 0.8);
      const p3 = p2.clone().addScaledVector(nrm(dir3), L * 0.3);
      const f = b.chain(`${name}${sd}`, [base, p1, p2, p3], {
        parent: wristJ,
        names: [`${name}${sd}1`, `${name}${sd}2`, `${name}${sd}3`],
        role: "digit",
      });
      b.sweep(f, [0.0095, 0.0065], { color: SKIN, sides: 6 });
    }
    const tb = W.clone().addScaledVector(d, 0.03).addScaledVector(across, 0.036);
    const t1 = fist
      ? nrm(d.clone().multiplyScalar(0.9).addScaledVector(inw, 0.1))
      : nrm(d.clone().multiplyScalar(0.75).addScaledVector(across, 0.35));
    const tp1 = tb.clone().addScaledVector(t1, 0.03);
    const t2 = fist
      ? nrm(d.clone().multiplyScalar(0.3).addScaledVector(inw, 0.95))
      : nrm(d.clone().multiplyScalar(0.8).addScaledVector(across, 0.2).addScaledVector(inw, 0.2));
    const tp2 = tp1.clone().addScaledVector(t2, 0.027);
    const th = b.chain(`thumb${sd}`, [tb, tp1, tp2], {
      parent: wristJ,
      names: [`thumb${sd}1`, `thumb${sd}2`],
      role: "digit",
    });
    b.sweep(th, [0.0115, 0.0075], { color: SKIN, sides: 6 });
    return W.clone().addScaledVector(d, 0.045).addScaledVector(inw, 0.04);
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = V(s * 0.185, 1.47, 0);
    const target = s > 0 ? V(0.3, 1.07, 0.255) : V(-0.335, 0.96, 0.05);
    const bend = s > 0 ? [0, -0.3, -1] : [0, 0, -1];
    const pts = limb(sh, target, [0.29, 0.265], bend);
    const arm = b.chain(`arm${sd}`, pts, {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    const wrist = arm.tip!;
    b.part(new THREE.SphereGeometry(0.058, 8, 6), TUNIC_BASE, { bone: arm.joints[0], at: sh });
    b.sweep(arm, [0.047, 0.044, 0.04, 0.035, 0.028], { color: SKIN, sides: 8 });
    b.sweep(arm, [0.056, 0.055, 0.052, 0.058], { to: 0.5, color: TUNIC_BASE, sides: 8 });
    b.sweep(arm, 0.06, { from: 0.47, to: 0.52, color: GOLD, sides: 8, caps: "flat" });
    b.sweep(arm, [0.041, 0.038, 0.034], { from: 0.6, to: 0.96, color: LEATHER, sides: 8, caps: "flat" });
    b.sweep(arm, 0.043, { from: 0.6, to: 0.635, color: GOLD, sides: 8, caps: "flat" });
    b.sweep(arm, 0.0385, { from: 0.9, to: 0.935, color: GOLD, sides: 8, caps: "flat" });
    const grip = hand(s, sd, wrist, pts[2], pts[1], s > 0);

    // pauldron plates
    for (let i = 0; i < 3; i++) {
      const r = 0.082 - i * 0.009;
      const c = V(s * (0.2 + i * 0.03), 1.49 - i * 0.04, 0);
      const col = s > 0 ? GOLD : LEATHER;
      b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), col, {
        bone: arm.joints[0],
        at: c,
        scale: [r, r * 0.62, r * 1.05],
        rotation: [0, 0, -s * 22],
      });
      b.part(new THREE.TorusGeometry(r * 1.02, 0.0055, 5, 14), s > 0 ? TEAL : GOLD, {
        bone: arm.joints[0],
        at: c,
        dir: [-s * Math.sin(0.38), Math.cos(0.38), 0],
        axis: "z",
        scale: [1, 1.05, 1],
      });
    }

    if (s > 0) {
      // bow
      const bow = b.joint("bow", { parent: wrist, at: grip, dir: [0, 1, 0] });
      const dys = [-0.74, -0.48, -0.24, 0, 0.24, 0.48, 0.74];
      const dzs = [-0.15, -0.085, -0.025, 0, -0.025, -0.085, -0.15];
      const bowPath = catmull(dys.map((dy, i) => V(grip.x, grip.y + dy, grip.z + dzs[i])));
      b.sweep(bowPath, [0.007, 0.012, 0.017, 0.021, 0.017, 0.012, 0.007], {
        color: GOLD,
        bands: [
          [0.04, GOLD],
          [0.2, WOOD],
          [0.215, GOLD],
          [0.43, WOOD],
          [0.57, LEATHER_D],
          [0.785, WOOD],
          [0.8, GOLD],
          [0.96, WOOD],
        ],
        bone: bow,
        sides: 8,
      });
      b.rod(bowPath.at(0), bowPath.at(1), 0.0028, { color: "#efe6c8", bone: bow, sides: 4 });
      b.part(new THREE.SphereGeometry(0.007, 5, 4), GOLD, { bone: bow, at: [grip.x, grip.y + 0.04, grip.z - 0.15] });
      glow(
        b.part(new THREE.SphereGeometry(0.013, 6, 4), TEAL_HEX, {
          bone: bow,
          at: [grip.x, grip.y + 0.17, grip.z + 0.012],
        }),
        1.3,
      );
      b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { bone: bow, at: [grip.x, grip.y + 0.155, grip.z] });
      // tassel
      const P0 = V(grip.x, grip.y - 0.105, grip.z);
      const T = P0.clone().add(V(0, -0.1, 0.01));
      b.rod(P0, T, 0.003, { color: "#c9ecd8", bone: bow, sides: 4 });
      b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { bone: bow, at: T.clone().add(V(0, -0.02, 0)) });
      b.spike(T.clone().add(V(0, -0.15, 0)), [0, 1, 0], 0.12, 0.02, { color: TEAL, bone: bow, sides: 8 });
    }
  }

  // ------------------------------------------------------------ quiver and arrows
  const Qb = V(-0.16, 0.98, -0.235);
  const Qt = V(-0.09, 1.5, -0.17);
  const qa = nrm(Qt.clone().sub(Qb));
  b.sweep([Qb, Qt], [0.048, 0.062], {
    color: LEATHER_D,
    bands: [
      [0.07, LEATHER_D],
      [0.1, GOLD],
      [0.5, LEATHER],
      [0.53, GOLD],
      [0.86, LEATHER],
      [0.9, GOLD],
    ],
    caps: { start: "round", end: "flat" },
    bone: chest,
    sides: 10,
  });
  b.part(new THREE.CircleGeometry(0.058, 10), "#1a1008", {
    bone: chest,
    at: Qt.clone().addScaledVector(qa, 0.002),
    dir: qa,
    axis: "z",
  });
  const u0 = nrm(V(1, 0, 0).addScaledVector(qa, -qa.x));
  const offs = [
    [-0.03, -0.012],
    [0.0, 0.02],
    [0.03, -0.01],
    [-0.015, -0.03],
    [0.015, 0.004],
    [0.0, -0.022],
  ];
  const lens = [0.2, 0.24, 0.17, 0.22, 0.27, 0.15];
  const feathers = ["#2fc4a8", "#f3efe0", "#2fc4a8", "#f3efe0", "#2fc4a8", "#f3efe0"];
  offs.forEach(([dx, dz], i) => {
    const top = Qt.clone().add(V(dx, 0, dz)).addScaledVector(qa, lens[i]);
    const bottom = Qt.clone().add(V(dx, 0, dz)).addScaledVector(qa, -0.15);
    b.rod(bottom, top, 0.0055, { color: WOOD, bone: chest, sides: 5 });
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), CREAM, { bone: chest, at: top });
    for (let k = 0; k < 3; k++) {
      const u = u0.clone().applyAxisAngle(qa, (k * 2 * Math.PI) / 3);
      b.extrude(
        [
          [0, 0.002],
          [0.062, 0.002],
          [0.078, 0.017],
          [0.014, 0.017],
        ],
        {
          at: top.clone().addScaledVector(qa, -0.095),
          x: qa,
          y: u,
          thickness: 0.003,
          color: feathers[i],
          bone: chest,
        },
      );
    }
  });

  // ------------------------------------------------------------ head
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, {
    bone: head,
    at: [0, 1.72, 0.02],
    scale: [0.095, 0.11, 0.1],
  });
  const skin = b.surface(skull);
  b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, { bone: jaw, at: [0, 1.645, 0.05], scale: [0.066, 0.052, 0.066] });
  b.rod(V(-0.013, 1.664, 0.111), V(0.013, 1.664, 0.111), 0.0022, { color: "#a8504f", bone: jaw, sides: 4 });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), SKIN, { bone: head, at: [0, 1.693, 0.122] });
  const EYE = animeEye({ iris: "#2fd0b0", irisLight: "#b8fff0" });
  for (const s of [1, -1])
    b.decal(skin, EYE, {
      at: [s * 0.047, 1.718, 0.115],
      dir: [0, 0, 1],
      size: [0.05, 0.068],
      mirror: s > 0,
    });

  // ears with gold earrings
  for (const s of [1, -1]) {
    const ex = nrm(V(s, 0, -0.55));
    b.extrude(
      [
        [0, -0.022],
        [0.05, -0.012],
        [0.13, 0.06, "sharp"],
        [0.07, 0.032],
        [0, 0.03],
      ],
      { at: [s * 0.092, 1.71, -0.002], x: ex, thickness: 0.012, bevel: 0.002, color: SKIN, bone: head },
    );
    b.extrude(
      [
        [0.005, -0.012],
        [0.05, -0.004],
        [0.095, 0.04, "sharp"],
        [0.065, 0.024],
        [0.005, 0.022],
      ],
      { at: [s * 0.092, 1.71, -0.002], x: ex, thickness: 0.016, color: cel("#f2a7a9", "#d98593"), bone: head },
    );
    b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { bone: head, at: [s * 0.099, 1.688, -0.004] });
    b.spike(V(s * 0.099, 1.688, -0.004), [0, -1, 0], 0.055, 0.007, { color: GOLD, bone: head, sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.007, 5, 4), TEAL_HEX, { bone: head, at: [s * 0.099, 1.628, -0.004] }), 1.2);
  }

  // hair: caps, bangs, side locks, ponytail
  b.part(new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, 1.45), HAIR, {
    bone: head,
    at: [0, 1.735, 0.01],
    scale: [0.104, 0.114, 0.112],
  });
  b.part(new THREE.SphereGeometry(1, 14, 10, Math.PI, Math.PI, 0, 2.3), HAIR, {
    bone: head,
    at: [0, 1.735, 0.01],
    scale: [0.107, 0.117, 0.115],
  });
  for (let i = -3; i <= 3; i++) {
    const a = Math.abs(i);
    const x = i * 0.022;
    const tipY = 1.772 - 0.004 * a - (a % 2 ? 0.006 : 0);
    b.sweep(
      catmull([V(x * 0.7, 1.845, 0.035), V(x * 1.0, 1.822, 0.098 - 0.01 * a), V(x * 1.1, tipY, 0.118 - 0.012 * a)]),
      [0.014, 0.003],
      { color: a % 2 ? HAIR : HAIR_DK, bone: head, sides: 6, caps: { start: "round", end: "point" } },
    );
  }
  for (const s of [1, -1]) {
    b.sweep(
      catmull([V(s * 0.1, 1.78, 0.03), V(s * 0.108, 1.68, 0.06), V(s * 0.115, 1.57, 0.095), V(s * 0.105, 1.47, 0.115)]),
      [0.012, 0.02, 0.018, 0.012, 0.004],
      { color: HAIR, bone: head, sides: 6, caps: { start: "round", end: "point" } },
    );
    b.sweep(
      catmull([V(s * 0.108, 1.74, 0.04), V(s * 0.118, 1.64, 0.07), V(s * 0.124, 1.55, 0.1)]),
      [0.008, 0.012, 0.003],
      { color: HAIR_DK, bone: head, sides: 5, caps: { start: "round", end: "point" } },
    );
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { bone: head, at: [s * 0.107, 1.5, 0.108] });
  }
  const ponyPts = [
    V(0, 1.8, -0.095),
    V(0, 1.76, -0.21),
    V(0, 1.58, -0.26),
    V(0, 1.38, -0.27),
    V(0, 1.18, -0.25),
    V(0, 1.02, -0.23),
  ];
  const pony = b.chain("hair", catmull(ponyPts), {
    parent: head,
    names: ["hair1", "hair2", "hair3", "hair4", "hair5"],
  });
  b.sweep(pony, [0.028, 0.05, 0.056, 0.05, 0.036, 0.012], { color: HAIR, sides: 8, caps: { start: "round", end: "point" } });
  for (const dx of [-0.03, 0.03]) {
    b.sweep(catmull(ponyPts.map((p, i) => V(p.x + dx * (i > 0 ? 1 : 0.3), p.y, p.z - (i > 0 ? 0.012 : 0)))), [0.012, 0.024, 0.026, 0.022, 0.016, 0.004], {
      color: HAIR_DK,
      bone: pony,
      sides: 6,
      caps: { start: "round", end: "point" },
    });
  }
  b.part(new THREE.TorusGeometry(0.032, 0.011, 6, 10), GOLD, {
    bone: head,
    at: [0, 1.785, -0.11],
    dir: [0, -0.35, -1],
    axis: "z",
  });

  // circlet
  b.part(new THREE.TorusGeometry(0.108, 0.0055, 6, 16), GOLD, {
    bone: head,
    at: [0, 1.793, 0.012],
    dir: [0, 1, 0.18],
    axis: "z",
  });
  glow(b.part(new THREE.SphereGeometry(0.0145, 6, 4), TEAL_HEX, { bone: head, at: [0, 1.775, 0.126] }), 1.4);
  b.extrude(
    [
      [0, -0.022],
      [0.014, 0],
      [0, 0.022],
      [-0.014, 0],
    ],
    { at: [0, 1.803, 0.118], x: [1, 0, 0], thickness: 0.006, color: GOLD, bone: head },
  );

  return b.root;
}

export default build;
