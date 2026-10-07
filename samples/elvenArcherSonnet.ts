// Elven ranger archer: slender silver-haired elf in a leaf-green tunic and a flowing forest cloak, gold-trimmed,
// bow in her left hand, quiver on her back. High-fantasy anime: cel-shaded paints, gold filigree, glowing leaf gems.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { paint } from "../src/paint";
import type { Chain, Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { animeEye, cel } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A tall elven ranger in cel-shaded anime style: silver hair with braids, leaf-green gold-trimmed tunic, flowing forest cloak, quiver of teal-fletched arrows and a recurve bow with a glowing leaf gem.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type V3t = [number, number, number];
type Arm = { pts: THREE.Vector3[]; arm: Chain; wrist: Joint };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Palette (every colour a lit tone and a hue-shifted shadow)

const SKIN = cel("#ffe6d6", "#f5bdb8", { threshold: -0.12 });
const HAIR = cel("#f4fbf7", "#c3d6ee");
const HAIR_MID = cel("#dbeaf6", "#a3bde0");
const HAIR_HI = cel("#ffffff", "#d8e8f7");
const HAIR_TIP = cel("#a4ecd2", "#6cbdcc");
const CREAM = cel("#f3f8ef", "#b8d0d8");
const LEAF = cel("#3fb066", "#27857a");
const LEAF_D = cel("#2b8c5a", "#1f6a72");
const LEAF_L = cel("#8be08a", "#48ad92");
const FOREST = cel("#2f8a5a", "#216e72");
const TEALC = cel("#2a9a9a", "#1f6b88");
const LINING = cel("#4fc2a8", "#2f8f9c");
const GOLD = cel("#ffd75c", "#e2912f");
const GOLD_D = cel("#d99a2c", "#a85a2e");
const LEATHER = cel("#ab7248", "#8a5a56");
const LEATHER_D = cel("#6a4637", "#523a4c");
const LEG = cel("#2e6464", "#1f4a62");
const WOOD = cel("#f6e0ab", "#d3a587");
const STRING = "#fff6dd";
const GEM = "#7dffd6";
const SHAFT = cel("#e8c58b", "#b98a74");

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

function ramp(keys: readonly (readonly [number, number])[]) {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const k = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * k;
      }
    }
    return keys[keys.length - 1][1];
  };
}

function table(rows: readonly (readonly number[])[], y: number): number[] {
  if (y <= rows[0][0]) return rows[0].slice(1);
  for (let i = 1; i < rows.length; i++) {
    if (y <= rows[i][0]) {
      const k = (y - rows[i - 1][0]) / (rows[i][0] - rows[i - 1][0]);
      return rows[i].slice(1).map((v, j) => rows[i - 1][j + 1] + (v - rows[i - 1][j + 1]) * k);
    }
  }
  return rows[rows.length - 1].slice(1);
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const VINE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80"><g fill="#ffd75c" stroke="#ffd75c" stroke-linecap="round" stroke-linejoin="round">
  <path d="M30 3 C25 18 35 32 30 48 C27 60 32 70 30 77" fill="none" stroke-width="2.2"/>
  <path d="M30 16 C20 9 11 15 9 25 C19 25 26 23 30 16Z" stroke-width="0.8"/>
  <path d="M30 16 C40 9 49 15 51 25 C41 25 34 23 30 16Z" stroke-width="0.8"/>
  <path d="M30 36 C21 31 14 35 13 43 C21 43 27 41 30 36Z" stroke-width="0.8"/>
  <path d="M30 36 C39 31 46 35 47 43 C39 43 33 41 30 36Z" stroke-width="0.8"/>
  <path d="M30 56 C24 52 19 55 18 61 C24 61 28 60 30 56Z" stroke-width="0.8"/>
  <path d="M30 56 C36 52 41 55 42 61 C36 61 32 60 30 56Z" stroke-width="0.8"/>
  <path d="M30 30 C16 28 8 36 11 46 C14 52 22 50 20 44" fill="none" stroke-width="1.8"/>
  <path d="M30 30 C44 28 52 36 49 46 C46 52 38 50 40 44" fill="none" stroke-width="1.8"/>
  </g></svg>`,
  { size: 480 },
);

const SPRIG = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80"><g fill="#ffd75c" stroke="#ffd75c" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 76 C10 56 20 40 22 4" fill="none" stroke-width="2.2"/>
  <path d="M10 62 C20 56 30 60 33 68 C24 70 14 68 10 62Z" stroke-width="0.8"/>
  <path d="M13 46 C4 38 5 28 12 24 C16 32 16 40 13 46Z" stroke-width="0.8"/>
  <path d="M16 32 C26 28 34 32 36 40 C28 42 20 40 16 32Z" stroke-width="0.8"/>
  <path d="M19 20 C12 14 12 8 17 4 C20 10 21 15 19 20Z" stroke-width="0.8"/>
  <circle cx="22" cy="5" r="2.3"/>
  </g></svg>`,
  { size: 360 },
);

const LACING = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 96"><g fill="none" stroke="#ffd75c" stroke-width="1.6" stroke-linecap="round">
  <path d="M12 2 V94" stroke-width="1.2"/>
  <path d="M4 6 L20 18 M20 6 L4 18 M4 22 L20 34 M20 22 L4 34 M4 38 L20 50 M20 38 L4 50 M4 54 L20 66 M20 54 L4 66 M4 70 L20 82 M20 70 L4 82"/>
  </g><g fill="#ffd75c"><circle cx="4" cy="6" r="1.8"/><circle cx="20" cy="6" r="1.8"/><circle cx="4" cy="22" r="1.8"/><circle cx="20" cy="22" r="1.8"/><circle cx="4" cy="38" r="1.8"/><circle cx="20" cy="38" r="1.8"/><circle cx="4" cy="54" r="1.8"/><circle cx="20" cy="54" r="1.8"/><circle cx="4" cy="70" r="1.8"/><circle cx="20" cy="70" r="1.8"/></g></svg>`,
  { size: 384 },
);

const FEATHER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64"><path d="M12 63 C1 52 1 22 12 1 C23 22 23 52 12 63Z" fill="#43d9b8"/>
  <path d="M12 63 C6 52 5 24 12 1 C13 24 13 52 12 63Z" fill="#b8fff0"/>
  <path d="M12 60 V4" stroke="#ffffff" stroke-width="1.6" fill="none"/>
  <path d="M12 52 L21 44 M12 42 L22 33 M12 32 L21 23 M12 52 L3 44 M12 42 L2 33 M12 32 L3 23" stroke="#1f9f9a" stroke-width="1.2" fill="none"/></svg>`,
  { size: 256 },
);

const MOUTH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 16"><path d="M9 6 Q20 12 31 6" stroke="#b4535e" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M17 9.5 Q20 11.5 23 9.5" stroke="#f08b93" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
  { size: 320 },
);

const FACEMARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32"><path d="M12 2 C4 10 4 22 12 30 C20 22 20 10 12 2Z" fill="#6fe9c9"/><path d="M12 6 V27" stroke="#ffffff" stroke-width="1.4"/></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------

const PLEAT = cel("#e2efe6", "#aac3cf");

export default function build() {
  const b = createBuilder({ name: "elvenArcher", paintSize: 2048 });

  // ============================================================ skeleton
  const hips = b.joint("hips", { at: [0, 0.93, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.15, 0.008],
      [0, 1.31, 0.02],
      [0, 1.47, 0.005],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.47, 0.005],
      [0, 1.56, 0.015],
      [0, 1.64, 0.03],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.64, 0.03], dir: [0, 1, 0.12], role: "head" });
  const HC = head.local({ up: 0.095, forward: 0.012 });
  const hcx = HC.x;
  const hcy = HC.y;
  const hcz = HC.z;
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ up: 0.055, forward: -0.005 }),
    aim: [hcx, hcy - 0.1, hcz + 0.04],
    role: "jaw",
  });

  // ============================================================ torso
  const TORSO_T = [
    [0.93, 0.125, 0.085],
    [1.0, 0.135, 0.092],
    [1.08, 0.118, 0.082],
    [1.16, 0.103, 0.073],
    [1.26, 0.111, 0.081],
    [1.34, 0.127, 0.092],
    [1.41, 0.14, 0.09],
    [1.46, 0.153, 0.082],
    [1.495, 0.14, 0.07],
    [1.525, 0.085, 0.058],
    [1.55, 0.05, 0.05],
  ];
  const torsoPath = catmull([
    [0, 0.93, 0],
    [0, 1.02, 0.0],
    [0, 1.16, 0.01],
    [0, 1.31, 0.02],
    [0, 1.46, 0.0],
    [0, 1.55, 0.0],
  ]);
  const TORSO = paint((p, n) => {
    const y = p.y;
    if (y > 1.468) return Math.abs(y - 1.468) < 0.004 ? GOLD : FOREST;
    if (y > 1.27 && n.z > 0.05 && Math.abs(p.x) < (y - 1.265) * 0.36) return CREAM;
    if (y > 1.045 && y < 1.2) return Math.abs(y - 1.045) < 0.012 || Math.abs(y - 1.2) < 0.01 ? GOLD_D : LEATHER;
    if (y < 0.96) return LEAF_D;
    return LEAF;
  });
  const torso = b.sweep(
    torsoPath,
    (t) => {
      const [rx, ry] = table(TORSO_T, torsoPath.at(t).y);
      return [rx, ry];
    },
    { bone: [hips, spine, neck], color: TORSO, caps: { start: "round", end: "round" }, sides: 14 },
  );
  const torsoSkin = b.surface(torso);

  // belt, buckle, studs
  b.sweep(torsoSkin.loop([0, 1.035, 0], { lift: 0.006 }), () => [0.024, 0.009], { color: LEATHER_D, bone: hips });
  b.sweep(torsoSkin.loop([0, 1.062, 0], { lift: 0.004 }), 0.0035, { color: GOLD, bone: hips });
  b.sweep(torsoSkin.loop([0, 1.01, 0], { lift: 0.004 }), 0.0035, { color: GOLD, bone: hips });
  b.extrude(
    [
      [0, 0.04],
      [0.03, 0],
      [0, -0.04],
      [-0.03, 0],
    ],
    { at: [0, 1.036, 0.103], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.004, smoothing: 1, color: GOLD, bone: hips },
  );
  glow(b.part(new THREE.SphereGeometry(0.011, 6, 4), GEM, { bone: hips, at: [0, 1.036, 0.116] }), 1.2);

  // corset lacing decal, chest sprigs
  b.decal(torso, LACING, { at: [0, 1.122, 0.1], dir: [0, 0, 1], size: [0.036, 0.15], segments: 12 });
  for (const s of [1, -1]) {
    b.decal(torso, SPRIG, { at: [s * 0.088, 1.355, 0.1], dir: [0, 0, 1], size: [0.05, 0.1], mirror: s > 0, segments: 10 });
  }

  // ============================================================ panels hanging from the belt
  function leafPaint(len: number, wid: number, base: typeof LEAF, trim: typeof GOLD, vein: typeof GOLD) {
    const shoulder = len * 0.45;
    const half = (y: number) => {
      const d = -y;
      if (d < shoulder) return wid / 2 + (wid * 0.58 - wid / 2) * (d / shoulder);
      return Math.max(0.001, wid * 0.58 * (1 - (d - shoulder) / (len - shoulder)));
    };
    return paint((_p, _n, s) => {
      const x = Math.abs(s[0]);
      const y = s[1];
      if (y > -0.012) return trim;
      if (x > half(y) - 0.0065) return trim;
      if (x < 0.0025 && y < -0.02 && y > -len * 0.82) return vein;
      return base;
    });
  }
  function panel(theta: number, len: number, wid: number, flare: number, scale: number, y0: number, color: typeof LEAF) {
    const rad = V(Math.sin(theta), 0, Math.cos(theta));
    const tan = V(Math.cos(theta), 0, -Math.sin(theta));
    const up = V(0, 1, 0).multiplyScalar(Math.cos(flare)).addScaledVector(rad, -Math.sin(flare));
    const root: V3t = [0.148 * scale * Math.sin(theta), y0, 0.108 * scale * Math.cos(theta)];
    return b.extrude(
      [
        [-wid / 2, 0],
        [wid / 2, 0],
        [wid * 0.58, -len * 0.45],
        [0, -len, "sharp"],
        [-wid * 0.58, -len * 0.45],
      ],
      { at: root, x: tan.toArray(), y: up.toArray(), thickness: 0.007, bevel: 0.0018, smoothing: 1, color, bone: hips },
    );
  }
  const backPanel = leafPaint(0.27, 0.115, LEAF_D, GOLD, GOLD_D);
  const frontPanel = leafPaint(0.23, 0.108, LEAF, GOLD, LEAF_L);
  for (let i = 0; i < 12; i++) {
    const th = i * 30 * D2R;
    panel(th, Math.cos(th) > 0.3 ? 0.285 : 0.27, 0.118, 0.2 + 0.05 * Math.abs(Math.sin(th)), 1.0, 1.03, backPanel);
  }
  for (let i = 0; i < 12; i++) {
    const th = (i * 30 + 15) * D2R;
    panel(th, 0.225, 0.108, 0.3, 1.075, 1.025, frontPanel);
  }
  // long front tabard
  const tabardPaint = paint((_p, _n, s) => {
    const x = Math.abs(s[0]);
    const y = s[1];
    const half = y > -0.18 ? 0.055 + 0.01 * (-y / 0.18) : Math.max(0.002, 0.065 * (1 - (-y - 0.18) / 0.2));
    if (y > -0.012 || x > half - 0.007) return GOLD;
    if (-y > 0.37) return GOLD;
    return CREAM;
  });
  const tabard = b.extrude(
    [
      [-0.055, 0],
      [0.055, 0],
      [0.065, -0.18],
      [0, -0.4, "sharp"],
      [-0.065, -0.18],
    ],
    { at: [0, 1.03, 0.126], x: [1, 0, 0], y: [0, 1, 0.15], thickness: 0.008, bevel: 0.002, smoothing: 1, color: tabardPaint, bone: hips },
  );
  b.decal(tabard, VINE, { at: [0, 0.9, 0.158], dir: [0, 0.15, 1], size: [0.065, 0.1], segments: 8 });

  // ============================================================ legs and boots
  const BOOT = paint((p, n) => {
    if (p.y < 0.016 && n.y < 0.3) return LEATHER_D;
    return LEATHER;
  });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP: V3t = [s * 0.09, 0.93, 0];
    const ankleP: V3t = [s * 0.115, 0.098, -0.005];
    const pts = limb(hipP, ankleP, [0.435, 0.42], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.12, 0, 0.1],
    });
    const ankle = leg.tip!;
    const foot = b.chain(
      `foot${side}`,
      [
        [s * 0.12, 0.045, 0.12],
        [s * 0.122, 0.035, 0.2],
      ],
      { parent: ankle, names: [`ball${side}`, `toe${side}`], role: "digit" },
    );
    const legR = ramp([
      [0, 0.08],
      [0.18, 0.07],
      [0.42, 0.052],
      [0.5, 0.047],
      [0.64, 0.05],
      [0.88, 0.04],
      [1, 0.036],
    ]);
    b.sweep(leg, legR, { color: LEG, sides: 10 });
    // boot shaft with folded gold cuff
    const boot = b.sweep(leg, (t) => legR(t) + 0.006, {
      from: 0.34,
      to: 1,
      color: BOOT,
      sides: 10,
      caps: { start: "flat", end: "round" },
    });
    b.sweep(leg, (t) => legR(t) + 0.013, { from: 0.325, to: 0.375, color: GOLD, sides: 10, caps: "flat" });
    b.sweep(leg, (t) => legR(t) + 0.011, { from: 0.375, to: 0.41, color: LEATHER_D, sides: 10, caps: "flat" });
    b.decal(boot, LACING, { at: [s * 0.1, 0.3, 0.075], dir: [0, 0, 1], size: [0.045, 0.28], segments: 14 });
    for (const t of [0.6, 0.76]) {
      const cp = leg.at(t);
      b.sweep(leg, (u) => legR(u) + 0.0105, { from: t - 0.012, to: t + 0.012, color: LEATHER_D, sides: 10, caps: "flat" });
      b.part(new THREE.BoxGeometry(0.022, 0.018, 0.008), GOLD, {
        frame: cp,
        at: [cp.at.x, cp.at.y, cp.at.z + legR(t) + 0.013],
        dir: [0, 0, 1],
        axis: "z",
      });
    }
    const kneeAt = pts[1];
    b.extrude(
      [
        [0, 0.045],
        [0.028, 0.012],
        [0.022, -0.03],
        [0, -0.06, "sharp"],
        [-0.022, -0.03],
        [-0.028, 0.012],
      ],
      { at: [kneeAt.x, kneeAt.y + 0.012, kneeAt.z + 0.054], x: [1, 0, 0], y: [0, 1, 0.1], thickness: 0.01, bevel: 0.003, smoothing: 1, color: GOLD, bone: leg.joints[1] },
    );
    b.extrude(
      [
        [0, 0.032],
        [0.018, 0.008],
        [0.014, -0.022],
        [0, -0.044, "sharp"],
        [-0.014, -0.022],
        [-0.018, 0.008],
      ],
      { at: [kneeAt.x, kneeAt.y + 0.012, kneeAt.z + 0.0595], x: [1, 0, 0], y: [0, 1, 0.1], thickness: 0.006, bevel: 0.002, smoothing: 1, color: LEAF_D, bone: leg.joints[1] },
    );
    // foot / toe
    const footPath = catmull([
      [s * 0.115, 0.05, -0.08],
      [s * 0.116, 0.047, -0.01],
      [s * 0.12, 0.04, 0.11],
      [s * 0.122, 0.03, 0.2],
    ]);
    b.sweep(footPath, ramp([[0, 0.036], [0.5, 0.042], [1, 0.028]]), {
      bone: [leg, foot],
      color: BOOT,
      sides: 10,
      caps: { start: "round", end: "point" },
    });
    b.part(new THREE.BoxGeometry(0.066, 0.03, 0.055), LEATHER_D, { bone: ankle, at: [s * 0.115, 0.015, -0.062] });
    b.sweep(
      polyline([
        [s * 0.122, 0.042, 0.205],
        [s * 0.125, 0.07, 0.235],
      ]),
      [0.011, 0.002],
      { bone: foot, color: GOLD, caps: { start: "round", end: "point" } },
    );
    b.sweep(
      catmull([
        [s * 0.086, 0.068, 0.034],
        [s * 0.115, 0.086, 0.054],
        [s * 0.146, 0.068, 0.034],
      ]),
      0.006,
      { bone: ankle, color: GOLD },
    );
  }

  // ============================================================ head
  const SKULL_SCALE: V3t = [0.088, 0.1, 0.098];
  const skull = b.part(new THREE.SphereGeometry(1, 18, 14), SKIN, { bone: head, at: [hcx, hcy, hcz], scale: SKULL_SCALE });
  const chin = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, {
    bone: jaw,
    at: [hcx, hcy - 0.07, hcz + 0.036],
    scale: [0.042, 0.045, 0.052],
  });
  const face = b.surface([skull, chin]);
  const EYE = animeEye({ iris: "#f4a93a", irisDark: "#9a5a1c", blush: "#ff9db4" });
  for (const s of [1, -1]) {
    const hit = face.around([hcx, hcy, hcz]).at(s * 24, -4);
    if (hit) b.decal(face, EYE, { at: hit, dir: [s * 0.18, 0, 1], size: [0.057, 0.078], mirror: s > 0, segments: 12 });
    const mark = face.around([hcx, hcy, hcz]).at(s * 30, -24);
    if (mark) b.decal(face, FACEMARK, { at: mark, dir: [s * 0.3, 0, 1], size: [0.011, 0.015], segments: 4 });
  }
  const mouthHit = face.around([hcx, hcy, hcz]).at(0, -37);
  if (mouthHit) b.decal(face, MOUTH, { at: mouthHit, dir: [0, -0.1, 1], size: [0.034, 0.0136], segments: 6 });
  b.part(new THREE.ConeGeometry(0.0075, 0.02, 5), SKIN, {
    bone: head,
    at: [hcx, hcy - 0.03, hcz + 0.099],
    dir: [0, -0.3, 1],
    axis: "y",
  });

  // elf ears: long, swept back and up
  for (const s of [1, -1]) {
    const earRoot: V3t = [hcx + s * 0.082, hcy + 0.0, hcz - 0.012];
    const earTip: V3t = [hcx + s * 0.18, hcy + 0.09, hcz - 0.1];
    const ear = b.sweep(
      bezier(earRoot, [hcx + s * 0.13, hcy + 0.01, hcz - 0.03], earTip),
      (t) => [0.0045, 0.027 * Math.sin(Math.PI * (0.06 + 0.86 * t)) + 0.002],
      { bone: head, color: SKIN, caps: { start: "round", end: "point" }, sides: 6 },
    );
    b.sweep(
      bezier(
        [hcx + s * 0.087, hcy + 0.004, hcz - 0.018],
        [hcx + s * 0.128, hcy + 0.015, hcz - 0.036],
        [hcx + s * 0.158, hcy + 0.06, hcz - 0.085],
      ),
      (t) => [0.0052, 0.012 * Math.sin(Math.PI * (0.1 + 0.8 * t)) + 0.001],
      { bone: head, color: cel("#ffb7b3", "#e98aa0"), caps: "round", sides: 6 },
    );
    b.stick(new THREE.TorusGeometry(0.011, 0.0028, 5, 10), GOLD, ear.at(0.38, 90), { embed: 0 });
    glow(b.part(new THREE.SphereGeometry(0.006, 6, 4), GEM, { bone: head, at: [hcx + s * 0.124, hcy - 0.012, hcz - 0.0] }), 1.1);
    b.sweep(
      polyline([
        [hcx + s * 0.086, hcy - 0.02, hcz - 0.004],
        [hcx + s * 0.088, hcy - 0.052, hcz - 0.004],
      ]),
      [0.0022, 0.0022],
      { bone: head, color: GOLD },
    );
    b.part(new THREE.OctahedronGeometry(0.011), GOLD, { bone: head, at: [hcx + s * 0.088, hcy - 0.06, hcz - 0.004], scale: [0.6, 1.5, 0.6] });
  }

  // ---- hair: crown cap, back shell, bangs, side locks, ponytail, braids
  const HAIR_P = paint((p) => (p.y - hcy > 0.05 && p.y - hcy < 0.074 ? HAIR_HI : HAIR));
  const HAIR_TIP_D = cel("#7fdcc4", "#4fa0b8");
  const STRAND = paint((_p, _n, s) => (((s[1] % 40) + 40) % 40 < 7 ? HAIR_MID : HAIR));
  const STRAND_TIP = paint((_p, _n, s) => (((s[1] % 40) + 40) % 40 < 7 ? HAIR_TIP_D : HAIR_TIP));
  b.part(new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.31), HAIR_P, {
    bone: head,
    at: [hcx, hcy, hcz],
    scale: [SKULL_SCALE[0] * 1.12, SKULL_SCALE[1] * 1.12, SKULL_SCALE[2] * 1.13],
  });
  b.part(new THREE.SphereGeometry(1, 18, 10, Math.PI * 0.81, Math.PI * 1.38, 0, Math.PI * 0.66), HAIR_P, {
    bone: head,
    at: [hcx, hcy - 0.004, hcz - 0.004],
    scale: [SKULL_SCALE[0] * 1.13, SKULL_SCALE[1] * 1.1, SKULL_SCALE[2] * 1.13],
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), HAIR, {
    bone: head,
    at: [hcx, hcy - 0.03, hcz - 0.03],
    scale: [0.083, 0.082, 0.083],
  });

  const bangSpecs: { r: V3t; c: V3t; t: V3t; w: number }[] = [
    { r: [0.004, 0.104, 0.036], c: [0.022, 0.09, 0.118], t: [0.03, 0.04, 0.114], w: 0.034 },
    { r: [0.03, 0.1, 0.028], c: [0.065, 0.09, 0.114], t: [0.075, 0.018, 0.103], w: 0.036 },
    { r: [0.056, 0.092, 0.008], c: [0.098, 0.076, 0.086], t: [0.106, -0.04, 0.062], w: 0.034 },
  ];
  const lockW = (k: number) => (t: number) => [k * Math.sin(Math.PI * (0.2 + 0.8 * t)) ** 0.8 + 0.002, 0.008] as [number, number];
  for (const s of [1, -1]) {
    for (const k of bangSpecs) {
      b.sweep(
        bezier(
          [hcx + s * k.r[0], hcy + k.r[1], hcz + k.r[2]],
          [hcx + s * k.c[0], hcy + k.c[1], hcz + k.c[2]],
          [hcx + s * k.t[0], hcy + k.t[1], hcz + k.t[2]],
        ),
        lockW(k.w),
        { bone: head, color: STRAND, caps: { start: "round", end: "point" }, sides: 6 },
      );
    }
    // two wavy face-framing locks per side with mint tips
    for (const [i, off] of [0, 0.014].entries()) {
      const pts: V3t[] = [
        [s * (0.086 + off), 0.045, 0.0],
        [s * (0.112 + off), -0.02, 0.03],
        [s * (0.1 + off * 1.4), -0.09, 0.066],
        [s * (0.12 + off * 1.5), -0.16, 0.07],
        [s * (0.108 + off), -0.225 - i * 0.025, 0.09],
      ];
      b.sweep(
        catmull(pts.map((q): V3t => [hcx + q[0], hcy + q[1], hcz + q[2]])),
        lockW(0.026 - i * 0.004),
        { bone: head, color: STRAND, bands: [[0.74, STRAND], [1, STRAND_TIP]], caps: { start: "round", end: "point" }, sides: 6 },
      );
    }
  }
  // circlet with teardrop gem
  b.sweep(
    catmull(
      [
        [0, 0.066, 0.1],
        [0.066, 0.058, 0.07],
        [0.094, 0.05, 0.0],
        [0.07, 0.048, -0.075],
        [0, 0.05, -0.1],
        [-0.07, 0.048, -0.075],
        [-0.094, 0.05, 0.0],
        [-0.066, 0.058, 0.07],
      ].map((q) => [hcx + q[0], hcy + q[1], hcz + q[2]]),
      { closed: true },
    ),
    [0.0045, 0.0045],
    { bone: head, color: GOLD, sides: 6 },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.014), GEM, {
      bone: head,
      at: [hcx, hcy + 0.046, hcz + 0.108],
      scale: [0.62, 1.3, 0.5],
      flat: true,
    }),
    1.3,
  );
  b.part(new THREE.OctahedronGeometry(0.0085), GOLD, { bone: head, at: [hcx, hcy + 0.069, hcz + 0.103], scale: [1, 0.8, 0.6] });
  for (const s of [1, -1]) {
    b.part(new THREE.OctahedronGeometry(0.0075), GOLD, {
      bone: head,
      at: [hcx + s * 0.04, hcy + 0.065, hcz + 0.092],
      scale: [1, 0.9, 0.55],
    });
  }

  // ponytail, swept to her left
  const pony = b.chain(
    "pony",
    catmull([
      [0, 1.79, -0.09],
      [0, 1.76, -0.16],
      [0.03, 1.69, -0.23],
      [0.07, 1.59, -0.28],
      [0.1, 1.45, -0.285],
      [0.1, 1.24, -0.25],
    ]),
    { parent: head, count: 5, role: "tail" },
  );
  const ponyR = ramp([[0, 0.026], [0.15, 0.04], [0.6, 0.04], [0.9, 0.02], [1, 0.003]]);
  b.sweep(pony, (t) => [ponyR(t), 0.02], {
    color: STRAND,
    bands: [[0.66, STRAND], [1, STRAND_TIP]],
    caps: { start: "round", end: "point" },
    sides: 8,
  });
  for (const s of [1, -1]) {
    b.sweep(pony, (t) => [ponyR(t) * 0.62, 0.017], {
      shift: (t) => [s * (0.012 + 0.032 * Math.sin(Math.PI * Math.min(1, t * 1.05))), 0.012],
      from: 0.05,
      to: 0.97,
      color: STRAND,
      bands: [[0.6, STRAND], [1, STRAND_TIP]],
      caps: { start: "round", end: "point" },
      sides: 6,
    });
  }
  b.sweep(pony, (t) => [ponyR(t) * 0.5, 0.012], {
    shift: [0, -0.012],
    from: 0.1,
    to: 0.99,
    color: HAIR_TIP,
    caps: { start: "round", end: "point" },
    sides: 6,
  });
  const tieAt = pony.at(0.05);
  b.stick(new THREE.TorusGeometry(0.034, 0.008, 5, 12), GOLD, tieAt, { embed: 0.5 });
  b.part(new THREE.SphereGeometry(0.013, 6, 5), GEM, { bone: head, at: tieAt.at });
  b.stick(new THREE.TorusGeometry(0.041, 0.0045, 5, 12), GOLD, pony.at(0.5), { embed: 0.5 });
  for (const k of [1, -1]) {
    const rib = b.sweep(
      catmull([
        [0, 1.79, -0.09],
        [k * 0.05, 1.73, -0.2],
        [k * 0.13, 1.64, -0.3],
        [k * 0.21, 1.55, -0.34],
        [k * 0.27, 1.45, -0.32],
      ]),
      (t) => [0.022 * (1 - 0.3 * t) + 0.002, 0.0035],
      { bone: head, color: TEALC, caps: { start: "round", end: "point" }, sides: 4 },
    );
    b.stick(new THREE.OctahedronGeometry(0.012), GOLD, rib.at(0.97, 0), { embed: 0 });
  }
  for (const t of [0.3, 0.62, 0.84]) {
    const cp = pony.at(t);
    b.part(new THREE.OctahedronGeometry(0.012), LEAF_L, { frame: cp, scale: [0.8, 1.5, 0.5], flat: true });
  }

  // front braids, each a chain with woven beads
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const braid = b.chain(
      `braid${side}`,
      catmull([
        [s * 0.09, 1.78, -0.01],
        [s * 0.112, 1.69, -0.02],
        [s * 0.128, 1.58, 0.03],
        [s * 0.142, 1.49, 0.1],
        [s * 0.128, 1.38, 0.128],
        [s * 0.12, 1.25, 0.128],
      ]),
      { parent: head, count: 5, role: "tail" },
    );
    b.sweep(braid, (t) => 0.011 * (1 - 0.6 * t) + 0.004, { color: HAIR, sides: 6, caps: { start: "round", end: "point" } });
    for (let i = 0; i < 14; i++) {
      const t = 0.03 + (0.93 * i) / 13;
      const cp = braid.at(t);
      const k = i % 2 === 0 ? 1 : -1;
      const r = 0.0165 * (1 - 0.35 * t);
      const dir = cp.tangent.clone().addScaledVector(cp.binormal, k * 0.55).normalize();
      const pos = cp.at.clone().addScaledVector(cp.binormal, k * 0.006);
      b.part(new THREE.SphereGeometry(r, 6, 5), i % 4 < 2 ? HAIR : HAIR_MID, {
        frame: cp,
        at: pos.toArray() as V3t,
        dir: dir.toArray() as V3t,
        scale: [1.0, 1.6, 0.9],
      });
    }
    const endP = braid.at(0.97);
    b.stick(new THREE.TorusGeometry(0.0125, 0.0045, 5, 10), GOLD, endP, { embed: 0.5 });
    b.sweep(bezier(endP.at, [s * 0.12, 1.2, 0.13], [s * 0.114, 1.145, 0.132]), [0.014, 0.002], {
      bone: braid.joints[braid.joints.length - 1],
      color: HAIR_TIP,
      caps: { start: "round", end: "point" },
      sides: 6,
    });
    b.part(new THREE.OctahedronGeometry(0.011), GOLD, { bone: braid.joints[0], at: [s * 0.1, 1.756, -0.012], scale: [0.8, 1.3, 0.6] });
  }

  // ============================================================ neck, collar, clasp
  b.sweep(neck, ramp([[0, 0.034], [0.5, 0.029], [1, 0.03]]), { color: SKIN, sides: 8 });
  b.sweep(
    catmull(
      [
        [0.034, 1.585, 0.0],
        [0.0, 1.575, 0.036],
        [-0.034, 1.585, 0.0],
        [0, 1.6, -0.033],
      ],
      { closed: true },
    ),
    0.0045,
    { bone: neck.joints[1], color: LEATHER_D, sides: 6 },
  );
  b.part(new THREE.OctahedronGeometry(0.012), GOLD, { bone: neck.joints[1], at: [0, 1.572, 0.04], scale: [0.9, 1.2, 0.6] });
  // stand-up mantle collar
  const collarPts: V3t[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    collarPts.push([0.062 * Math.sin(a), 1.535 + 0.01 * Math.cos(a), 0.012 + 0.056 * Math.cos(a)]);
  }
  b.sweep(catmull(collarPts, { closed: true }), [0.014, 0.016], { bone: chest, color: FOREST, sides: 8 });
  b.sweep(catmull(collarPts.map((q): V3t => [q[0], q[1] + 0.014, q[2]]), { closed: true }), 0.004, {
    bone: chest,
    color: GOLD,
    sides: 5,
  });
  // chain across the throat with leaf brooch
  b.sweep(
    catmull([
      [-0.13, 1.482, 0.055],
      [-0.07, 1.45, 0.1],
      [0, 1.44, 0.108],
      [0.07, 1.45, 0.1],
      [0.13, 1.482, 0.055],
    ]),
    0.0028,
    { bone: chest, color: GOLD, sides: 5 },
  );
  b.extrude(
    [
      [0, 0.032],
      [0.02, 0.005],
      [0.014, -0.02],
      [0, -0.034, "sharp"],
      [-0.014, -0.02],
      [-0.02, 0.005],
    ],
    { at: [0, 1.44, 0.114], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, bevel: 0.003, smoothing: 1, color: GOLD, bone: chest },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.012), GEM, { bone: chest, at: [0, 1.443, 0.124], scale: [0.7, 1.3, 0.5], flat: true }), 1.3);

  // ============================================================ cloak
  const cloakChains: Chain[] = [];
  for (let i = -4; i <= 4; i++) {
    const xt = i * 0.05;
    const zt = -0.095 + 0.065 * (Math.abs(i) / 4) ** 2;
    const alt = i % 2 === 0 ? -0.05 : 0.02;
    const shiftX = 0.07;
    const pts: V3t[] = [
      [xt, 1.51, zt],
      [xt * 1.25 + shiftX * 0.2, 1.27, zt - 0.045],
      [xt * 1.8 + shiftX * 0.5, 0.95, zt - 0.1 - 0.02 * (1 - Math.abs(i) / 4)],
      [i * 0.115 + shiftX, 0.58 + alt, -0.33 + 0.06 * (Math.abs(i) / 4) ** 2],
    ];
    cloakChains.push(b.chain(`cloak${i + 4}`, catmull(pts), { parent: chest, count: 3 }));
  }
  const cloakPaint = (edgeA: boolean, edgeB: boolean) => paint((_p, n, s) => {
    if ((edgeA && s[1] < 0.04) || (edgeB && s[1] > 0.96)) return GOLD;
    if (n.z > 0.15) {
      if (s[0] > 0.955) return GOLD;
      if (Math.abs(s[1] - 0.5) < 0.025) return LEAF_L;
      return LINING;
    }
    const along = s[0];
    const across = s[1];
    if (along > 0.955) return GOLD;
    if (along > 0.92) return TEALC;
    const hemLine = 0.58 + 0.07 * Math.abs(((across * 2) % 1) - 0.5) * 2;
    if (along > hemLine) {
      if (Math.abs(across - 0.5) < 0.02) return LEAF_L;
      return TEALC;
    }
    const dv = Math.abs(across - 0.5);
    if (dv < 0.02 && along > 0.05) return LEAF_D;
    const diag = (along * 9 + dv * 5) % 1;
    if (diag > 0.9 && dv > 0.03 && along > 0.12) return LEAF_D;
    return FOREST;
  });
  const cloakMeshes = [];
  for (let i = 0; i < 8; i++) {
    cloakMeshes.push(b.membrane(cloakChains[i], cloakChains[i + 1], { color: cloakPaint(i === 0, i === 7), thickness: 0.01, rows: 3, scallop: 0.14 }));
  }
  b.decal(cloakMeshes, VINE, { at: [0.045, 1.0, -0.26], dir: [0, 0, -1], size: [0.3, 0.45], segments: 20 });
  // hood bunched on the back
  b.sweep(
    catmull([
      [-0.14, 1.52, -0.035],
      [-0.1, 1.48, -0.12],
      [0, 1.45, -0.15],
      [0.1, 1.48, -0.12],
      [0.14, 1.52, -0.035],
    ]),
    [0.042, 0.028],
    { bone: chest, color: FOREST, sides: 8, skin: "rigid" },
  );
  b.sweep(
    polyline([
      [0, 1.46, -0.14],
      [0.004, 1.3, -0.165],
    ]),
    [0.05, 0.004],
    { bone: chest, color: FOREST, sides: 8, caps: { start: "round", end: "point" } },
  );
  b.sweep(
    polyline([
      [0, 1.446, -0.17],
      [0.004, 1.3, -0.172],
    ]),
    0.006,
    { bone: chest, color: GOLD, sides: 5 },
  );

  // ============================================================ arms
  const sleeveR = ramp([[0, 0.046], [0.25, 0.042], [0.5, 0.036], [0.75, 0.032], [1, 0.028]]);
  const BRACER = paint((_p, _n, s) => {
    const t = s[0];
    if (t < 0.05 || t > 0.95) return GOLD;
    if (Math.abs(t - 0.5) < 0.03) return GOLD_D;
    return LEATHER;
  });
  const WRIST_TARGET: Record<string, V3t> = { L: [0.36, 1.115, 0.22], R: [-0.5, 1.0, 0.06] };
  const armParts: Record<string, Arm> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const clav = b.joint(`clavicle${side}`, { parent: chest, at: [s * 0.03, 1.48, 0], aim: [s * 0.19, 1.465, 0] });
    b.sweep(
      polyline([
        [s * 0.03, 1.5, -0.005],
        [s * 0.155, 1.482, 0],
      ]),
      [0.034, 0.038],
      { bone: clav, color: FOREST, sides: 8 },
    );
    const pts = limb([s * 0.19, 1.46, 0], WRIST_TARGET[side], [0.31, 0.27], s > 0 ? [0.3, -0.25, -1] : [0, 0, -1]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: clav,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const wrist = arm.tip!;
    armParts[side] = { pts, arm, wrist };
    const SLEEVE = paint((_p, _n, sc) => (((sc[1] % 40) + 40) % 40 < 5 ? PLEAT : CREAM));
    b.sweep(arm, sleeveR, { color: SLEEVE, sides: 10, caps: { start: "round", end: "flat" } });
    b.part(new THREE.SphereGeometry(0.054, 10, 8), FOREST, { bone: arm.joints[0], at: [s * 0.19, 1.462, 0], scale: [1, 0.95, 0.98] });
    b.sweep(arm, (t) => sleeveR(t) + 0.008, { from: 0.32, to: 0.36, color: GOLD, sides: 10, caps: "flat" });
    const bracer = b.sweep(arm, (t) => sleeveR(t) + 0.0075, { from: 0.6, to: 0.93, color: BRACER, sides: 10, caps: "flat" });
    const fore = pts[2].clone().sub(pts[1]).normalize();
    b.decal(bracer, SPRIG, {
      at: arm.at(0.77).at.toArray() as V3t,
      dir: s > 0 ? [0.5, 0.85, 0.1] : [-0.6, 0.2, 0.75],
      up: fore.toArray() as V3t,
      size: [0.04, 0.085],
      segments: 8,
    });
    b.sweep(arm, (t) => sleeveR(t) + 0.011, { from: 0.58, to: 0.61, color: GOLD, sides: 10, caps: "flat" });
    b.sweep(arm, (t) => sleeveR(t) + 0.011, { from: 0.925, to: 0.95, color: GOLD, sides: 10, caps: "flat" });
    b.sweep(arm, (t) => sleeveR(t) + 0.012, { from: 0.955, to: 0.99, color: CREAM, sides: 10, caps: "round" });
    const gp = arm.at(0.77);
    glow(
      b.part(new THREE.SphereGeometry(0.009, 6, 4), GEM, {
        frame: gp,
        at: gp.at.clone().addScaledVector(gp.normal, sleeveR(0.77) + 0.012).toArray() as V3t,
      }),
      1.2,
    );
  }

  // ---- right hand: relaxed and open
  {
    const { pts, wrist } = armParts.R;
    const W = pts[2];
    const d = W.clone().sub(pts[1]).normalize();
    const C = W.clone().addScaledVector(d, 0.045);
    b.part(new THREE.BoxGeometry(0.028, 0.09, 0.074), SKIN, { bone: wrist, at: C.toArray() as V3t, dir: d.toArray() as V3t, up: [0, 0, 1] });
    const inward = V(1, 0, 0);
    const fingers = [
      { n: "index", z: 0.026, lens: [0.03, 0.021, 0.017], curl: 14 },
      { n: "middle", z: 0.009, lens: [0.034, 0.024, 0.019], curl: 20 },
      { n: "ring", z: -0.009, lens: [0.031, 0.022, 0.018], curl: 24 },
      { n: "pinky", z: -0.026, lens: [0.025, 0.017, 0.014], curl: 30 },
    ];
    for (const f of fingers) {
      const base = C.clone().addScaledVector(d, 0.04).add(V(0, 0, f.z));
      const p = [base.clone()];
      let cur = base.clone();
      f.lens.forEach((len, i) => {
        const a = f.curl * (i + 1) * D2R;
        const dir = d.clone().multiplyScalar(Math.cos(a)).addScaledVector(inward, Math.sin(a)).add(V(0, 0, f.z * 0.6)).normalize();
        cur = cur.clone().addScaledVector(dir, len);
        p.push(cur);
      });
      const ch = b.chain(`${f.n}R`, catmull(p), {
        parent: wrist,
        names: [`${f.n}R1`, `${f.n}R2`, `${f.n}R3`],
        role: "digit",
      });
      b.sweep(ch, [0.0085, 0.0058], { color: SKIN, sides: 6, caps: { start: "round", end: "round" } });
    }
    const tb = C.clone().add(V(0.0, 0, 0.035)).addScaledVector(d, -0.005);
    const tdir = d.clone().add(V(0, 0, 0.9)).add(V(0.35, 0, 0)).normalize();
    const tdir2 = d.clone().add(V(0, 0, 0.5)).add(V(0.5, 0, 0)).normalize();
    const t1 = tb.clone().addScaledVector(tdir, 0.03);
    const t2 = t1.clone().addScaledVector(tdir2, 0.026);
    const t3 = t2.clone().addScaledVector(tdir2, 0.02);
    const th = b.chain("thumbR", catmull([tb, t1, t2, t3]), { parent: wrist, names: ["thumbR1", "thumbR2", "thumbR3"], role: "digit" });
    b.sweep(th, [0.0095, 0.006], { color: SKIN, sides: 6 });
  }

  // ---- left hand: gripping the bow
  const Lw = armParts.L;
  const LW = Lw.pts[2];
  const Ld = LW.clone().sub(Lw.pts[1]).normalize();
  const LC = LW.clone().addScaledVector(Ld, 0.045);
  const GRIP = LC.clone().add(V(-0.029, 0, 0.012));
  {
    b.part(new THREE.BoxGeometry(0.03, 0.075, 0.09), SKIN, {
      bone: Lw.wrist,
      at: LC.toArray() as V3t,
      dir: Ld.toArray() as V3t,
      axis: "z",
      up: [0, 1, 0],
    });
    const fingers = [
      { n: "pinky", y: -0.027, k: 0.82 },
      { n: "ring", y: -0.009, k: 0.95 },
      { n: "middle", y: 0.009, k: 1.0 },
      { n: "index", y: 0.027, k: 0.95 },
    ];
    for (const f of fingers) {
      const rel: V3t[] = [
        [-0.004, 0, 0.043],
        [-0.029, 0, 0.038],
        [-0.053, 0, 0.016],
        [-0.042, 0, -0.007],
      ];
      const pts = rel.map((r) => [LC.x + r[0], LC.y + f.y, LC.z + r[2]]);
      const ch = b.chain(`${f.n}L`, catmull(pts), {
        parent: Lw.wrist,
        names: [`${f.n}L1`, `${f.n}L2`, `${f.n}L3`],
        role: "digit",
      });
      b.sweep(ch, [0.0088 * f.k, 0.0062 * f.k], { color: SKIN, sides: 6, caps: { start: "round", end: "round" } });
    }
    const rel: V3t[] = [
      [-0.008, 0.032, -0.03],
      [-0.012, 0.05, -0.002],
      [-0.028, 0.056, 0.026],
      [-0.04, 0.052, 0.034],
    ];
    const th = b.chain(
      "thumbL",
      catmull(rel.map((r) => [LC.x + r[0], LC.y + r[1], LC.z + r[2]])),
      { parent: Lw.wrist, names: ["thumbL1", "thumbL2", "thumbL3"], role: "digit" },
    );
    b.sweep(th, [0.0098, 0.0065], { color: SKIN, sides: 6 });
  }

  // ---- shoulder guard (left): stacked leaf lames that hug the bow shoulder
  {
    const shoulderL = Lw.arm.joints[0];
    for (let i = 0; i < 3; i++) {
      const R = 0.064 + i * 0.011;
      const cx = 0.19 + i * 0.016;
      const cy = 1.462 - i * 0.028;
      const path = catmull(
        [0, 0.25, 0.5, 0.75, 1].map((u) => {
          const ang = (150 - u * 140) * D2R;
          return [cx + R * Math.cos(ang), cy + R * Math.sin(ang) * 0.78, 0] as V3t;
        }),
      );
      const LAME = paint((_p, _n, s) => (s[0] > 0.88 || s[0] < 0.04 ? GOLD : i === 1 ? LEAF_D : LEAF));
      b.sweep(path, (t) => [0.05 * (0.6 + 0.4 * Math.sin(Math.PI * t)) - 0.004 * i, 0.0055], {
        bone: shoulderL,
        color: LAME,
        sides: 8,
        caps: "flat",
      });
    }
    glow(b.part(new THREE.OctahedronGeometry(0.012), GEM, { bone: shoulderL, at: [0.19, 1.54, 0.0], scale: [0.6, 1.2, 0.5], flat: true }), 1.2);
  }

  // ============================================================ bow (in the left hand)
  {
    const wristL = Lw.wrist;
    const phi = 38 * D2R; // the bow is carried turned out so the string clears the forearm
    const basis = (v: V3t | number[]) => V(v[0], v[1], v[2]).applyAxisAngle(V(0, 1, 0), -phi);
    const W = (v: V3t | number[]) => basis(v).add(GRIP).toArray() as V3t;
    const upperLimb: V3t[] = [
      [0, 0.09, 0],
      [0, 0.26, -0.024],
      [0, 0.46, -0.09],
      [0, 0.62, -0.17],
      [0, 0.7, -0.2],
      [0, 0.745, -0.183],
    ];
    const BOW = paint((_p, _n, s) => {
      const t = s[0];
      const deg = Math.abs(s[1]);
      if (t > 0.94) return GOLD;
      if (Math.abs(t - 0.2) < 0.012 || Math.abs(t - 0.62) < 0.012) return GOLD_D;
      if (deg < 22 && t > 0.05 && t < 0.92) return LEAF_L;
      return WOOD;
    });
    const bowR = (t: number) => [0.016 * (1 - 0.55 * t) + 0.003, 0.0105 * (1 - 0.45 * t) + 0.002] as [number, number];
    for (const sy of [1, -1]) {
      const pts = upperLimb.map((p) => W([p[0], sy * p[1], p[2]]));
      b.sweep(catmull(pts), bowR, { bone: wristL, color: BOW, caps: { start: "round", end: "round" }, sides: 6 });
      b.part(new THREE.SphereGeometry(0.0095, 6, 5), GOLD, { bone: wristL, at: pts[pts.length - 1] });
      b.sweep(
        catmull([W([0, sy * 0.1, 0.012]), W([0, sy * 0.2, 0.0]), W([0, sy * 0.31, -0.034])]),
        (t) => [0.011 * Math.sin(Math.PI * (0.05 + 0.9 * t)) + 0.002, 0.004],
        { bone: wristL, color: GOLD, caps: { start: "round", end: "point" }, sides: 4 },
      );
    }
    b.sweep(polyline([W([0, -0.085, 0]), W([0, 0.085, 0])]), 0.0155, {
      bone: wristL,
      color: paint((p) => (Math.abs(((p.y - GRIP.y) * 70) % 1) < 0.14 ? LEATHER_D : LEAF)),
      sides: 8,
      caps: "round",
    });
    b.sweep(polyline([W([0, 0.09, 0]), W([0, 0.115, -0.001])]), 0.019, { bone: wristL, color: GOLD, sides: 8, caps: "flat" });
    b.sweep(polyline([W([0, -0.09, 0]), W([0, -0.115, -0.001])]), 0.019, { bone: wristL, color: GOLD, sides: 8, caps: "flat" });
    glow(b.part(new THREE.OctahedronGeometry(0.016), GEM, { bone: wristL, at: W([0, 0.125, 0.02]), scale: [0.55, 1.4, 0.55], flat: true }), 1.4);
    // string
    const tipU = W(upperLimb[5]);
    const tipL = W([0, -upperLimb[5][1], upperLimb[5][2]]);
    b.sweep(polyline([tipU, tipL]), 0.0016, { bone: wristL, color: STRING, sides: 4, caps: "round" });
    b.sweep(polyline([W([0, 0.03, -0.2]), W([0, -0.04, -0.2])]), 0.0032, { bone: wristL, color: LEATHER_D, sides: 5, caps: "round" });
    // tassel hanging from the lower riser
    b.sweep(bezier(W([0, -0.115, 0.012]), W([0.012, -0.15, 0.016]), W([0.008, -0.18, 0.012])), 0.0025, { bone: wristL, color: GOLD, sides: 4 });
    b.part(new THREE.SphereGeometry(0.012, 6, 5), GOLD, { bone: wristL, at: W([0.008, -0.19, 0.012]) });
    for (const k of [-1, 0, 1]) {
      b.sweep(
        bezier(
          W([0.008, -0.195, 0.012]),
          W([0.008 + k * 0.012, -0.25, 0.012 + k * 0.005]),
          W([0.008 + k * 0.022, -0.31 - (k === 0 ? 0.03 : 0), 0.004]),
        ),
        [0.009, 0.002],
        { bone: wristL, color: k === 0 ? LEAF_L : HAIR_TIP, sides: 5, caps: { start: "round", end: "point" } },
      );
    }
  }

  // ============================================================ quiver, arrows, strap
  {
    const A0 = V(0.075, 1.02, -0.245);
    const A1 = V(-0.095, 1.6, -0.2);
    const ad = A1.clone().sub(A0).normalize();
    const ux = V(1, 0, 0).sub(ad.clone().multiplyScalar(ad.x)).normalize();
    const uz = ad.clone().cross(ux).normalize();
    const QUIVER = paint((_p, _n, s) => {
      const t = s[0];
      const deg = s[1];
      if (t < 0.04 || t > 0.94) return GOLD;
      if (Math.abs(t - 0.86) < 0.018 || Math.abs(t - 0.14) < 0.014) return GOLD_D;
      if (Math.abs(deg - 180) < 5) return LEATHER_D;
      if (t > 0.5 && t < 0.82 && (deg + 360) % 90 < 6) return LEAF;
      return LEATHER;
    });
    b.sweep(polyline([A0.toArray(), A1.toArray()]), [0.042, 0.054], { bone: chest, color: QUIVER, sides: 10, caps: { start: "round", end: "flat" } });
    b.sweep(polyline([A1.toArray(), A1.clone().addScaledVector(ad, 0.012).toArray()]), 0.057, {
      bone: chest,
      color: GOLD,
      sides: 10,
      caps: "flat",
    });
    b.part(new THREE.ConeGeometry(0.04, 0.07, 8), LEATHER_D, {
      bone: chest,
      at: A0.clone().addScaledVector(ad, -0.045).toArray() as V3t,
      dir: ad.clone().negate().toArray() as V3t,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.013), GEM, {
        bone: chest,
        at: A0.clone().addScaledVector(ad, 0.43).addScaledVector(uz, -0.058).toArray() as V3t,
        scale: [0.6, 1.3, 0.5],
        flat: true,
      }),
      1.2,
    );
    const rr = rng(21);
    const feathers = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const rad = 0.026 * (0.35 + 0.65 * rr());
      const off = ux.clone().multiplyScalar(Math.cos(a) * rad).addScaledVector(uz, Math.sin(a) * rad);
      const fan = off.clone().normalize().multiplyScalar(0.08 * (0.5 + rr()));
      const start = A1.clone().addScaledVector(ad, -0.14).add(off);
      const len = 0.3 + 0.07 * rr();
      const dirA = ad.clone().add(fan).normalize();
      const end = start.clone().addScaledVector(dirA, len);
      b.sweep(polyline([start.toArray(), end.toArray()]), 0.0042, { bone: chest, color: SHAFT, sides: 5, caps: "round" });
      b.part(new THREE.SphereGeometry(0.0065, 5, 4), GOLD_D, { bone: chest, at: end.toArray() as V3t });
      feathers.push(frame(end.clone().addScaledVector(dirA, -0.095).toArray() as V3t, dirA.toArray() as V3t));
    }
    b.cards(feathers, FEATHER, { size: [0.03, 0.1], flow: [0, 0, 1], cross: true, bone: chest });

    // chest strap from right shoulder to left hip, with a gold buckle
    const strapLoop = catmull(
      [
        [-0.125, 1.505, 0.04],
        [-0.02, 1.37, 0.108],
        [0.09, 1.2, 0.098],
        [0.145, 1.1, 0.035],
        [0.12, 1.15, -0.085],
        [0.0, 1.33, -0.11],
        [-0.12, 1.505, -0.04],
        [-0.155, 1.52, 0.0],
      ],
      { closed: true },
    );
    b.sweep(torsoSkin.drape(strapLoop, { lift: 0.007 }), [0.019, 0.006], { bone: chest, color: LEATHER_D, sides: 6 });
    b.extrude(
      [
        [-0.02, 0.018],
        [0.02, 0.018],
        [0.02, -0.018],
        [-0.02, -0.018],
      ],
      { at: [-0.02, 1.37, 0.12], x: [1, 0, 0], y: [0.3, 1, 0], thickness: 0.008, bevel: 0.002, color: GOLD, bone: chest },
    );
    glow(b.part(new THREE.SphereGeometry(0.008, 6, 4), GEM, { bone: chest, at: [-0.02, 1.37, 0.128] }), 1.2);
  }

  // ============================================================ belt kit: pouch, dagger, tassels
  {
    const th = -66 * D2R;
    const px = 0.17 * Math.sin(th);
    const pz = 0.125 * Math.cos(th);
    const out = V(Math.sin(th), 0, Math.cos(th));
    b.part(new THREE.BoxGeometry(0.075, 0.085, 0.045), LEATHER, { bone: hips, at: [px, 0.965, pz], dir: out.toArray() as V3t, axis: "z", up: [0, 1, 0] });
    b.part(new THREE.BoxGeometry(0.082, 0.04, 0.05), LEATHER_D, {
      bone: hips,
      at: [px + out.x * 0.004, 1.0, pz + out.z * 0.004],
      dir: out.toArray() as V3t,
      axis: "z",
      up: [0, 1, 0],
    });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { bone: hips, at: [px + out.x * 0.03, 0.985, pz + out.z * 0.03] });
    // dagger on the left hip
    const th2 = 58 * D2R;
    const base = V(0.165 * Math.sin(th2), 1.0, 0.123 * Math.cos(th2) + 0.01);
    const tip = base.clone().add(V(0.05, -0.26, 0.04));
    const sd = tip.clone().sub(base).normalize();
    b.sweep(polyline([base.toArray(), tip.toArray()]), [0.02, 0.008], { bone: hips, color: LEATHER_D, sides: 6, caps: { start: "flat", end: "round" } });
    b.sweep(polyline([base.clone().addScaledVector(sd, 0.03).toArray(), base.clone().addScaledVector(sd, 0.055).toArray()]), 0.0225, {
      bone: hips,
      color: GOLD,
      sides: 6,
      caps: "flat",
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { bone: hips, at: tip.toArray() as V3t });
    b.sweep(polyline([base.toArray(), [base.x + 0.005, base.y + 0.075, base.z - 0.004]]), 0.012, { bone: hips, color: LEAF, sides: 6, caps: "round" });
    b.sweep(
      polyline([
        [base.x - 0.026, base.y - 0.004, base.z],
        [base.x + 0.026, base.y - 0.004, base.z],
      ]),
      0.006,
      { bone: hips, color: GOLD, sides: 5, caps: "round" },
    );
    b.part(new THREE.SphereGeometry(0.011, 6, 5), GOLD, { bone: hips, at: [base.x + 0.005, base.y + 0.082, base.z - 0.004] });
    // hanging tassels at the front of the belt
    for (const x of [-0.06, 0.0, 0.06]) {
      b.sweep(bezier([x, 1.0, 0.118], [x, 0.93, 0.15], [x * 1.1, 0.85, 0.15]), [0.008, 0.002], {
        bone: hips,
        color: x === 0 ? LEAF_L : GOLD,
        sides: 5,
        caps: { start: "round", end: "point" },
      });
    }
  }

  // glowing tonic vial on the belt, feather charms on the braids
  {
    const vx = -0.098;
    const vz = 0.128;
    glow(
      b.sweep(
        polyline([
          [vx, 0.922, vz],
          [vx, 0.978, vz],
        ]),
        0.0135,
        { bone: hips, color: "#8ff0d6", sides: 8, caps: "round" },
      ),
      1.2,
    );
    b.sweep(
      polyline([
        [vx, 0.985, vz],
        [vx, 1.0, vz],
      ]),
      0.011,
      { bone: hips, color: GOLD, sides: 8, caps: "flat" },
    );
    b.sweep(
      polyline([
        [vx, 0.935, vz],
        [vx, 0.945, vz],
      ]),
      0.0155,
      { bone: hips, color: GOLD, sides: 8, caps: "flat" },
    );
    for (const s of [1, -1]) {
      b.cards([frame([s * 0.117, 1.135, 0.134], [0, 1, 0])], FEATHER, {
        size: [0.028, 0.085],
        lean: 180,
        flow: [0, 0, 1],
        bone: head,
      });
    }
  }

  return b.root;
}
