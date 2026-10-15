import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { grain, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { animeEye, cel, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A tall elven ranger in a forest-green tunic, gold-trimmed cloak and quiver, a long braid and circlet, holding a gilded longbow. Cel-shaded with big anime eyes and glowing emerald gems.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const GOLD_HEX = "#ffd35a";
const mod = (x: number, m: number) => ((x % m) + m) % m;

export default function build() {
  const b = createBuilder({ name: "elvenArcher", paintSize: 2048 });

  // ---------------------------------------------------------------- palette
  const SKIN = cel("#f8dcc8", "#e6a89f");
  const HAIR = cel(grain("#f7f0d0", "#e8dca9", { size: 0.015, axis: "y" }));
  const HAIR_BRAID = cel(
    paint((_p, _n, s) => (Math.floor(s[0] * 90 + s[1] / 90) % 2 === 0 ? "#f5edc8" : "#dccf98")),
  );
  const GOLD = cel(GOLD_HEX, "#d08a1e");
  const LEATHER = cel(grain("#8d5c36", "#774a2b", { size: 0.012, axis: "y" }), "#5a3a28");
  const LEATHER_DARK = cel("#5d3c2a", "#3a2420");
  const BOOT = cel(grain("#7a4d2e", "#693f25", { size: 0.01, axis: "y" }), "#4a2d20");
  const LEGGING = cel("#5f5040", "#3d3330");
  const SLEEVE = cel("#2a8a58", "#1c5f5c");
  const WOOD = cel("#e0aa5e", "#a8672f");
  const TEAL_FEATHER = cel("#3fc7a8", "#2a8a9a");

  const tunicPaint = cel(
    paint((p, n) => {
      if (n.z > 0.15 && p.y > 1.28 && p.y < 1.5) {
        const edge = Math.abs(p.x) - (p.y - 1.28) * 0.55;
        if (Math.abs(edge) < 0.006) return GOLD_HEX;
        if (edge < 0) return "#efe6c8";
      }
      if (n.z > 0.15 && Math.abs(p.x) < 0.005 && p.y < 1.28) return GOLD_HEX;
      if (n.z > 0.15 && Math.abs(p.y - 1.17) < 0.004) return "#1c6a45";
      return "#2d9660";
    }),
  );

  const skirtPaint = cel(
    paint((p, n, s) => {
      const h = s[0];
      if (h < -0.255 - 0.022 * zigzag(s[1] / 12)) return GOLD_HEX;
      if (h < -0.215 && h > -0.228) return "#f3e9b6";
      if (h > -0.03) return "#1c6a45";
      if (n.z > 0 && p.z > 0 && Math.abs(p.x) < 0.04) return "#3fb877";
      return "#237a52";
    }),
  );

  const capeGrain = grain("#2b8a62", "#1f6a52", { size: 0.02, axis: "y" });
  const capePaint = cel(
    paint((_p, n, s) => {
      if (Math.abs(n.z) < 0.5) return GOLD_HEX;
      if (s[1] < -0.5 && s[1] > -0.525 && zigzag(s[0] / 0.05) > 0.45) return GOLD_HEX;
      return capeGrain;
    }),
  );

  const tabardPaint = cel(
    paint((_p, n, s) => {
      if (n.z < 0.5) return GOLD_HEX;
      const w = 0.085 + s[1] * 0.033;
      if (Math.abs(s[0]) > w - 0.01) return GOLD_HEX;
      const u = -s[1] - Math.abs(s[0]) * 0.8;
      if (mod(u, 0.07) < 0.011) return GOLD_HEX;
      if (Math.abs(s[0]) < 0.012 && mod(-s[1], 0.07) < 0.04) return "#3fb877";
      return "#f1e9cb";
    }),
  );

  const quiverPaint = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      if (t < 0.07 || (t > 0.84 && t < 0.89)) return GOLD_HEX;
      if (Math.abs(Math.sin(t * 34 + s[1] * 0.055)) < 0.06) return GOLD_HEX;
      return "#8d5c36";
    }),
  );

  const GLOW_GEM = "#6ff7c5";

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, 0],
      [0, 1.14, 0],
      [0, 1.3, 0.005],
      [0, 1.46, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[3];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.46, 0],
      [0, 1.57, 0.012],
      [0, 1.67, 0.03],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.67, 0.03], dir: [0, 1, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.72, 0.0], aim: [0, 1.7, 0.12], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 0.97, 0], w: 0.31, h: 0.2 },
      { at: [0, 1.08, 0], w: 0.27, h: 0.19 },
      { at: [0, 1.26, 0.005], w: 0.3, h: 0.21 },
      { at: [0, 1.42, 0], w: 0.36, h: 0.21 },
      { at: [0, 1.5, 0], w: 0.2, h: 0.15 },
    ],
    { bone: [hips, spine], color: tunicPaint, caps: { start: "round", end: "flat" } },
  );
  b.sweep(neck, 0.043, { color: SKIN });

  // belt, baldric, studs
  const skin = b.surface(torso);
  b.sweep(skin.loop([0, 1.065, 0], { lift: 0.012 }), 0.017, { color: LEATHER, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), GOLD, { bone: hips, at: [0, 1.065, 0.122], dir: [0, 0, 1] });
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), GLOW_GEM, { bone: hips, at: [0, 1.065, 0.13] }), 1.4);
  const strapPath = skin.drape(
    catmull(
      [
        [-0.16, 1.47, -0.02],
        [-0.12, 1.44, 0.1],
        [0.0, 1.28, 0.108],
        [0.14, 1.1, 0.1],
        [0.17, 1.04, 0.0],
        [0.1, 1.15, -0.1],
        [0.0, 1.3, -0.1],
        [-0.12, 1.43, -0.1],
      ],
      { closed: true },
    ),
    { lift: 0.01 },
  );
  b.sweep(strapPath, 0.017, { color: LEATHER_DARK, sides: 6 });
  b.along(strapPath, 8, (at) => b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at }));

  // chest brooch
  b.extrude(
    [
      [0, -0.034],
      [0.024, 0],
      [0, 0.034],
      [-0.024, 0],
    ],
    { at: [0, 1.4, 0.108], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, smoothing: 1, color: GOLD, bone: chest },
  );
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), GLOW_GEM, { bone: chest, at: [0, 1.4, 0.12] }), 1.4);

  // mantle collar
  const ringPts: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ringPts.push([0.135 * Math.sin(a), 1.505 - 0.015 * Math.cos(a), 0.115 * Math.cos(a)]);
  }
  b.sweep(catmull(ringPts, { closed: true }), 0.038, { color: capePaint, bone: chest, sides: 8 });
  const collarPts: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    collarPts.push([0.07 * Math.sin(a), 1.55, 0.065 * Math.cos(a) - 0.005]);
  }
  b.sweep(catmull(collarPts, { closed: true }), 0.028, { color: SLEEVE, bone: chest, sides: 6 });
  b.extrude(
    [
      [0, -0.03],
      [0.022, 0],
      [0, 0.03],
      [-0.022, 0],
    ],
    { at: [0, 1.485, 0.142], x: [1, 0, 0], thickness: 0.01, bevel: 0.003, smoothing: 1, color: GOLD, bone: chest },
  );
  glow(b.part(new THREE.SphereGeometry(0.01, 6, 4), GLOW_GEM, { bone: chest, at: [0, 1.485, 0.15] }), 1.4);

  // skirt + tabard
  b.lathe(
    [
      [0.14, 0],
      [0.19, -0.1],
      [0.24, -0.3],
      [0.23, -0.305],
      [0.18, -0.1],
      [0.13, 0],
    ],
    { at: [0, 1.06, 0], segments: 14, color: skirtPaint, bone: hips },
  );
  b.extrude(
    [
      [-0.085, 0],
      [0.085, 0],
      [0.075, -0.3],
      [0, -0.36, "sharp"],
      [-0.075, -0.3],
    ],
    { at: [0, 1.06, 0.162], x: [1, 0, 0], y: [0, 1, -0.3], thickness: 0.012, color: tabardPaint, bone: hips },
  );

  // cape, hood bunch
  b.extrude(
    [
      [-0.17, 0],
      [0.17, 0],
      [0.29, -0.5],
      [0.31, -0.72],
      [0.22, -0.92, "sharp"],
      [0.12, -0.77],
      [0, -0.97, "sharp"],
      [-0.12, -0.77],
      [-0.22, -0.92, "sharp"],
      [-0.31, -0.72],
      [-0.29, -0.5],
    ],
    { at: [0, 1.5, -0.125], x: [1, 0, 0], y: [0, 1, 0.18], thickness: 0.012, color: capePaint, bone: chest },
  );
  b.part(new THREE.SphereGeometry(1, 10, 7), capePaint, {
    bone: chest,
    at: [0, 1.56, -0.115],
    scale: [0.1, 0.075, 0.06],
  });

  // hip pouch and dagger
  b.part(new THREE.BoxGeometry(0.06, 0.08, 0.075), LEATHER, { bone: hips, at: [-0.185, 1.0, 0.04] });
  b.part(new THREE.BoxGeometry(0.066, 0.035, 0.082), LEATHER_DARK, { bone: hips, at: [-0.185, 1.03, 0.04] });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { bone: hips, at: [-0.22, 1.025, 0.04] });
  b.rod([0.19, 1.03, 0.04], [0.205, 0.8, 0.09], [0.022, 0.013], { color: LEATHER_DARK, bone: hips, sides: 6 });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone: hips, at: [0.205, 0.795, 0.09] });
  b.rod([0.19, 1.03, 0.04], [0.183, 1.1, 0.03], 0.013, { color: LEATHER_DARK, bone: hips, sides: 6 });
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.022), GOLD, { bone: hips, at: [0.188, 1.045, 0.038] });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone: hips, at: [0.182, 1.108, 0.03] });

  // ---------------------------------------------------------------- legs
  const legR = (t: number) =>
    t < 0.5 ? 0.082 - 0.06 * t : t < 0.62 ? 0.052 + 0.008 * ((t - 0.5) / 0.12) : 0.06 - 0.02 * ((t - 0.62) / 0.38);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.09, 0.95, 0], [s * 0.1, 0.078, -0.005], [0.46, 0.44], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, catmull(pts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.05],
    });
    const ankle = leg.joints[2];
    const legSweep = b.sweep(leg, legR, { bands: [[0.62, LEGGING], [1, BOOT]] });
    b.part(new THREE.CylinderGeometry(0.068, 0.064, 0.05, 8), LEATHER_DARK, { frame: leg.at(0.64) });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.012, 8), GOLD, { frame: leg.at(0.61) });
    for (let k = 0; k < 5; k++) {
      const t = 0.68 + k * 0.058;
      const sg = k % 2 === 0 ? 1 : -1;
      b.rod(legSweep.at(t, -35 * sg, 0.002), legSweep.at(t + 0.035, 35 * sg, 0.002), 0.004, {
        color: "#f1ead2",
        sides: 4,
      });
    }
    b.capsule([s * 0.1, 0.075, -0.01], [s * 0.1, 0.04, 0.19], [0.05, 0.036], { color: BOOT, bone: ankle, sides: 8 });
    b.spike([s * 0.1, 0.04, 0.2], [0, 0.3, 1], 0.07, 0.034, { color: BOOT, bone: ankle, sides: 8 });
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.3), LEATHER_DARK, { bone: ankle, at: [s * 0.1, 0.012, 0.07] });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 8), GOLD, { bone: ankle, at: [s * 0.1, 0.1, -0.005] });
    b.joint(`toe${side}`, { parent: ankle, at: [s * 0.1, 0.04, 0.12], aim: [s * 0.1, 0.035, 0.22] });
  }

  // ---------------------------------------------------------------- arms
  const wrists: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = [s * 0.2, 1.42, 0];
    const el = [s * 0.37, 1.19, -0.005];
    const wr = [s * 0.5, 0.95, 0.058];
    const arm = b.chain(`arm${side}`, catmull([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    wrists[side] = arm.joints[2];
    const armR = (t: number) => (t < 0.55 ? 0.05 - 0.018 * (t / 0.55) : 0.032 - 0.006 * ((t - 0.55) / 0.45));
    b.sweep(arm, armR, { bands: [[0.6, SLEEVE], [1, SKIN]] });
    b.part(new THREE.CylinderGeometry(0.05, 0.047, 0.022, 8), GOLD, { frame: arm.at(0.6) });
    b.part(new THREE.CylinderGeometry(0.04, 0.037, 0.12, 8), LEATHER_DARK, { frame: arm.at(0.8) });
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.011, 8), GOLD, { frame: arm.at(0.72) });
    b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.011, 8), GOLD, { frame: arm.at(0.9) });
    // shoulder: sleeve ball, leather pauldron dome, gold rim
    b.part(new THREE.SphereGeometry(0.062, 10, 7), SLEEVE, { bone: arm.joints[0], at: sh });
    const d = [s * 0.42, 0.91, 0];
    b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), LEATHER, {
      bone: arm.joints[0],
      at: [s * 0.215, 1.43, 0],
      dir: d,
      scale: [0.088, 0.055, 0.098],
    });
    b.part(new THREE.TorusGeometry(0.09, 0.0065, 5, 16), GOLD, {
      bone: arm.joints[0],
      at: [s * 0.215, 1.43, 0],
      dir: d,
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, {
      bone: arm.joints[0],
      at: [s * 0.215 + s * 0.02, 1.485, 0],
    });
  }

  // right hand: relaxed open fingers
  const wristR = wrists.R;
  const dR = [-0.49, -0.84, 0.22];
  const eR = [-0.537, 0.887, 0.075];
  b.capsule([-0.5, 0.95, 0.058], eR, [0.03, 0.027], { color: SKIN, bone: wristR, sides: 8 });
  for (let i = 0; i < 4; i++) {
    const k = [eR[0], eR[1], eR[2] + (i - 1.5) * 0.019];
    const len = 0.062 - Math.abs(i - 1.5) * 0.004;
    const p1 = [k[0] + dR[0] * 0.035 * (len / 0.06) + 0.006, k[1] + dR[1] * 0.035, k[2]];
    const p2 = [k[0] + dR[0] * len + 0.016, k[1] + dR[1] * len + 0.004, k[2]];
    b.sweep(catmull([k, p1, p2]), [0.0095, 0.006], { color: SKIN, bone: wristR, sides: 5 });
  }
  b.sweep(
    catmull([
      [-0.527, 0.918, 0.092],
      [-0.52, 0.9, 0.12],
      [-0.51, 0.882, 0.138],
    ]),
    [0.011, 0.007],
    { color: SKIN, bone: wristR, sides: 5 },
  );

  // left hand: fist around the bow grip
  const wristL = wrists.L;
  b.capsule([0.5, 0.95, 0.058], [0.5, 0.91, 0.075], [0.03, 0.028], { color: SKIN, bone: wristL, sides: 8 });
  for (const y of [0.945, 0.92, 0.895, 0.87]) {
    b.sweep(
      catmull([
        [0.52, y, 0.085],
        [0.525, y, 0.125],
        [0.495, y, 0.147],
        [0.47, y, 0.12],
      ]),
      0.0105,
      { color: SKIN, bone: wristL, sides: 5 },
    );
  }
  b.capsule([0.485, 0.955, 0.09], [0.47, 0.947, 0.13], 0.011, { color: SKIN, bone: wristL, sides: 5 });

  // ---------------------------------------------------------------- bow
  b.sweep(
    catmull([
      [0.5, 0.4, -0.07],
      [0.5, 0.6, 0.03],
      [0.5, 0.8, 0.1],
      [0.5, 0.97, 0.115],
      [0.5, 1.14, 0.1],
      [0.5, 1.34, 0.03],
      [0.5, 1.54, -0.07],
    ]),
    (t) => 0.009 + 0.011 * Math.sin(Math.PI * t),
    {
      bone: wristL,
      sides: 6,
      bands: [
        [0.07, GOLD],
        [0.28, WOOD],
        [0.31, GOLD],
        [0.69, WOOD],
        [0.72, GOLD],
        [0.93, WOOD],
        [1, GOLD],
      ],
    },
  );
  b.rod([0.5, 0.87, 0.115], [0.5, 1.07, 0.115], 0.019, { color: LEATHER_DARK, bone: wristL, sides: 6 });
  b.rod([0.5, 0.4, -0.07], [0.5, 1.54, -0.07], 0.0035, { color: "#f1ead2", bone: wristL, sides: 4, caps: "flat" });
  b.spike([0.5, 0.4, -0.07], [0, -0.3, -0.2], 0.035, 0.012, { color: GOLD, bone: wristL, sides: 6 });
  b.spike([0.5, 1.54, -0.07], [0, 0.3, -0.2], 0.035, 0.012, { color: GOLD, bone: wristL, sides: 6 });
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), GLOW_GEM, { bone: wristL, at: [0.5, 1.09, 0.125] }), 1.4);
  glow(b.part(new THREE.SphereGeometry(0.008, 6, 4), GLOW_GEM, { bone: wristL, at: [0.5, 0.74, 0.082] }), 1.2);
  glow(b.part(new THREE.SphereGeometry(0.008, 6, 4), GLOW_GEM, { bone: wristL, at: [0.5, 1.2, 0.068] }), 1.2);

  // ---------------------------------------------------------------- quiver + arrows
  const Qb = new THREE.Vector3(-0.02, 0.98, -0.3);
  const Qt = new THREE.Vector3(-0.12, 1.58, -0.23);
  const Qd = Qt.clone().sub(Qb).normalize();
  b.rod(Qb, Qt, [0.05, 0.06], { color: quiverPaint, bone: chest, sides: 8 });
  b.part(new THREE.SphereGeometry(0.05, 8, 5), GOLD, { bone: chest, at: Qb });
  b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.025, 8), GOLD, { bone: chest, at: Qt, dir: Qd });
  const arrow = (off: number[], feather: Paint) => {
    const a = Qb.clone().lerp(Qt, 0.7).add(new THREE.Vector3(off[0], 0, off[2]));
    const tip = Qt.clone().addScaledVector(Qd, 0.2).add(new THREE.Vector3(off[0] * 1.8, 0, off[2] * 1.8));
    const u = tip.clone().sub(a).normalize();
    b.rod(a, tip, 0.0055, { color: WOOD, bone: chest, sides: 5 });
    b.rod(tip.clone().addScaledVector(u, -0.09), tip.clone().addScaledVector(u, -0.015), [0.012, 0.007], {
      color: feather,
      bone: chest,
      sides: 5,
    });
    b.rod(tip.clone().addScaledVector(u, -0.015), tip, 0.007, { color: GOLD, bone: chest, sides: 5 });
  };
  arrow([0.02, 0, 0], TEAL_FEATHER);
  arrow([-0.02, 0, 0.01], cel("#f3ecd0", "#cfc29b"));
  arrow([0, 0, 0.022], TEAL_FEATHER);
  arrow([0.012, 0, -0.025], cel("#f3ecd0", "#cfc29b"));
  arrow([-0.026, 0, -0.01], TEAL_FEATHER);
  arrow([0.032, 0, 0.014], cel("#e6b04a", "#b87a25"));
  // quiver strap ring + stud
  b.part(new THREE.TorusGeometry(0.058, 0.008, 5, 12), GOLD, { bone: chest, at: Qb.clone().lerp(Qt, 0.62), dir: Qd, axis: "z" });

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, {
    bone: head,
    at: [0, 1.79, 0.03],
    scale: [0.088, 0.112, 0.098],
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), SKIN, { bone: jaw, at: [0, 1.7, 0.05], scale: [0.058, 0.05, 0.07] });
  b.spike([0, 1.752, 0.115], [0, -0.25, 1], 0.026, 0.0105, { color: SKIN, bone: head, sides: 5 });
  b.sweep(
    catmull([
      [-0.016, 1.711, 0.116],
      [0, 1.706, 0.122],
      [0.016, 1.711, 0.116],
    ]),
    0.0026,
    { color: "#c4636f", bone: jaw, sides: 4 },
  );
  const EYE = animeEye({ iris: "#47d68d", size: 256 });
  for (const s of [1, -1])
    b.decal(skull, EYE, {
      at: [s * 0.04, 1.78, 0.12],
      dir: [0, 0, 1],
      size: [0.05, 0.068],
      mirror: s > 0,
    });

  // ears
  const EAR: OutlinePoint[] = [
    [0, -0.03],
    [0.05, -0.026],
    [0.14, 0.055, "sharp"],
    [0.07, 0.026],
    [0, 0.035],
  ];
  for (const s of [1, -1]) {
    b.extrude(EAR, {
      at: [s * 0.083, 1.795, 0.01],
      x: [s * 0.8, 0, -0.6],
      thickness: [0.012, 0.004],
      smoothing: 1,
      color: SKIN,
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.012, 0.003, 5, 10), GOLD, {
      bone: head,
      at: [s * 0.1, 1.772, -0.002],
      rotation: [0, 90, 0],
    });
  }

  // hair
  b.part(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, 1.55), HAIR, {
    bone: head,
    at: [0, 1.8, 0.02],
    scale: [0.097, 0.12, 0.108],
    rotation: [-28, 0, 0],
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), HAIR, { bone: head, at: [0, 1.9, -0.005], scale: [0.075, 0.055, 0.085] });
  for (const x of [-0.06, -0.03, 0, 0.03, 0.06]) {
    b.sweep(
      catmull([
        [x * 0.6, 1.905, 0.075],
        [x, 1.885, 0.115],
        [x * 1.7, 1.84, 0.126],
      ]),
      [0.017, 0.003],
      { color: HAIR, bone: head, sides: 6, caps: { start: "flat", end: "point" } },
    );
  }
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.088, 1.84, 0.04],
        [s * 0.099, 1.76, 0.048],
        [s * 0.096, 1.68, 0.042],
        [s * 0.09, 1.6, 0.036],
      ]),
      [0.02, 0.004],
      { color: HAIR, bone: head, sides: 6, caps: { start: "flat", end: "point" } },
    );
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { bone: head, at: [s * 0.098, 1.7, 0.046] });
  }
  for (const x of [-0.09, -0.06, -0.03, 0]) {
    b.sweep(
      catmull([
        [x, 1.84, -0.07],
        [x * 1.2, 1.72, -0.115],
        [x * 1.4, 1.58, -0.14],
        [x * 1.5, 1.44, -0.17],
      ]),
      [0.03, 0.004],
      { color: HAIR, bone: head, sides: 6, caps: { start: "flat", end: "point" } },
    );
  }

  // braid
  const braid = b.chain(
    "braid",
    catmull([
      [0.04, 1.8, -0.07],
      [0.06, 1.68, -0.12],
      [0.07, 1.52, -0.165],
      [0.08, 1.34, -0.19],
      [0.08, 1.15, -0.225],
      [0.08, 0.98, -0.255],
    ]),
    { parent: head, names: ["braid1", "braid2", "braid3", "braid4", "braid5"], role: "tail" },
  );
  b.sweep(braid, (t) => 0.03 - 0.014 * t, { color: HAIR_BRAID, sides: 6 });
  for (const t of [0.3, 0.62, 0.9]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 6), GOLD, { frame: braid.at(t) });
  b.spike(braid.at(1), [0, -1, -0.1], 0.07, 0.022, { color: HAIR, sides: 6 });

  // circlet
  const cir: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cir.push([0.098 * Math.sin(a), 1.842, 0.015 + 0.104 * Math.cos(a)]);
  }
  b.sweep(catmull(cir, { closed: true }), 0.005, { color: GOLD, bone: head, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.011, 6, 4), GLOW_GEM, { bone: head, at: [0, 1.842, 0.122] }), 1.5);
  b.extrude(
    [
      [0, -0.022],
      [0.012, 0],
      [0, 0.02],
      [-0.012, 0],
    ],
    { at: [0.0, 1.868, 0.112], x: [1, 0, 0], thickness: 0.005, smoothing: 1, color: GOLD, bone: head },
  );

  // feather charm on right lock
  b.extrude(
    [
      [0, 0],
      [0.012, 0.03],
      [0.01, 0.08],
      [0, 0.12, "sharp"],
      [-0.012, 0.08],
      [-0.01, 0.03],
    ],
    { at: [-0.1, 1.72, 0.06], x: [1, 0, 0], y: [0, -1, 0], thickness: 0.004, smoothing: 1, color: TEAL_FEATHER, bone: head },
  );
  b.rod([-0.1, 1.72, 0.06], [-0.1, 1.6, 0.06], 0.0025, { color: GOLD, bone: head, sides: 4 });

  return b.root;
}
