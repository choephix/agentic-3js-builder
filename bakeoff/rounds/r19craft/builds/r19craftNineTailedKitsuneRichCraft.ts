// Nine-tailed kitsune: a large spirit fox in high-fantasy anime style (cel shading from kits/toon, spirit fire from
// kits/glow). Cream-and-peach coat with fur-edge zig-zags and ink lines, vermilion kumadori markings, plum stockings,
// gold ornaments and tassels, a shide-paper rope collar, a sash with a bow, nine fanned tails tipped with teal and
// violet kitsunebi, and floating hitodama flames. Faces +Z, left is +X, stands on y = 0.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, offset, rng } from "../../../../src/math";
import { gradient, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A towering spirit fox with nine fanned tails tipped in spirit flame, vermilion kumadori markings, gold tassels, a shide rope collar and floating hitodama fire, in cel-shaded high-fantasy anime style.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

/** Piecewise-linear section profile: keys are [t, rx, ry]. */
function profile(keys: ReadonlyArray<readonly [number, number, number]>) {
  return (t: number): [number, number] => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, x0, y0] = keys[i];
      const [t1, x1, y1] = keys[i + 1];
      if (t <= t1) {
        const k = (t - t0) / (t1 - t0);
        return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
      }
    }
    const last = keys[keys.length - 1];
    return [last[1], last[2]];
  };
}

/** Points of a circle around `c` spanned by unit vectors u and v. */
function circlePoints(c: THREE.Vector3, u: THREE.Vector3, v: THREE.Vector3, r: number, n = 10) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return c.clone().addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r);
  });
}

/** The direction along a surface that points most nearly up, for a drawing laid on a surface with normal n. */
function surfaceUp(n: THREE.Vector3) {
  return new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize();
}

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });
  const R = rng(11);

  // ---- palette -------------------------------------------------------------------------------------------------
  const CREAM = "#fff6e6";
  const PEACH = "#ffd9a6";
  const VERM = "#e63e2c";
  const DEEP = "#a3162f";
  const GOLD = "#f6c64a";
  const GOLDD = "#b7822a";
  const SOCK = "#46283f";
  const PINK = "#ffb7c4";
  const PINKD = "#f27a96";
  const TEAL = "#32e0d2";
  const VIOLET = "#8a6cff";
  const BONE = "#f4ead6";
  const NOSE = "#2b1730";
  const FUR_INK = "#e7a678";

  const C_CREAM = cel(CREAM);
  const C_COAT = cel(furEdge(PEACH, CREAM, { level: -0.2, teeth: 0.3, period: 0.04, ink: FUR_INK }));
  const C_HEAD = cel(
    furEdge(PEACH, CREAM, {
      by: "position",
      axis: [0, 1, 0],
      level: 1.205,
      teeth: 0.035,
      period: 0.035,
      along: [1, 0, 0],
      ink: FUR_INK,
    }),
  );
  const C_LEG = cel(
    furEdge(gradient(PEACH, CREAM, [0, 0.8, 0], [0, 0.45, 0]), SOCK, {
      by: "position",
      level: 0.3,
      teeth: 0.07,
      period: 0.045,
      along: [1, 0, 1],
    }),
  );
  const C_SOCK = cel(SOCK);
  const C_VERM = cel(VERM);
  const C_GOLD = cel(GOLD, GOLDD);

  // ---- textures --------------------------------------------------------------------------------------------------
  const EYE = animeEye({ iris: "#ffae1c", irisLight: "#fff1a8", blush: "#ff7aa6" });

  const flameTex = (outer: string, mid: string, core: string) =>
    svg(
      `<svg viewBox="0 0 64 128">
        <path d="M32 127 C8 120 2 94 14 72 C20 62 18 50 26 38 C30 30 28 16 36 2 C38 20 54 32 52 58 C60 70 62 86 56 100 C52 116 44 125 32 127 Z" fill="${outer}"/>
        <path d="M32 118 C16 112 12 94 20 78 C25 68 24 58 30 48 C33 54 36 46 38 40 C42 58 52 66 48 84 C46 104 42 114 32 118 Z" fill="${mid}"/>
        <path d="M32 110 C23 104 22 92 27 82 C30 76 30 70 33 64 C37 74 42 80 40 92 C39 102 36 108 32 110 Z" fill="${core}"/>
      </svg>`,
      { size: 128 },
    );
  const FLAME_A = flameTex("#1fcfc2", "#7ff4e6", "#ffffff");
  const FLAME_B = flameTex("#7a58ff", "#b9a0ff", "#f4ecff");

  const TUFT = svg(
    `<svg viewBox="0 0 32 64">
      <path d="M16 63 C3 46 6 22 16 1 C26 22 29 46 16 63 Z" fill="#ffffff"/>
      <path d="M16 60 C14 40 15 20 16 6" stroke="#e3d8ea" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 24 64">
      <polyline points="12,0 4,14 20,28 4,42 20,56 12,64" stroke="#fffaf0" stroke-width="7" fill="none" stroke-linejoin="miter"/>
      <polyline points="12,0 4,14 20,28 4,42 20,56 12,64" stroke="#e3d6c4" stroke-width="1.6" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 24 64">
      <circle cx="12" cy="6" r="5.5" fill="${GOLD}"/>
      <rect x="8.5" y="10" width="7" height="7" rx="2" fill="${GOLDD}"/>
      <path d="M12 17 L4 62 M12 17 L8 63 M12 17 L12 64 M12 17 L16 63 M12 17 L20 62" stroke="${VERM}" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      <rect x="7" y="22" width="10" height="3" fill="${GOLD}"/>
    </svg>`,
    { size: 128 },
  );
  const CHEEK = svg(
    `<svg viewBox="0 0 60 40">
      <path d="M2 6 C20 4 36 12 56 30" stroke="${VERM}" stroke-width="5.5" stroke-linecap="round" fill="none"/>
      <path d="M4 17 C20 17 32 23 46 36" stroke="${VERM}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
      <path d="M2 27 C12 27 20 30 28 38" stroke="${DEEP}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 192 },
  );
  const FOREHEAD = svg(
    `<svg viewBox="0 0 40 56">
      <path d="M20 2 C30 18 36 28 30 42 C27 50 13 50 10 42 C4 28 10 18 20 2 Z" fill="${VERM}"/>
      <path d="M20 12 C25 22 27 30 24 38 C22 42 18 42 16 38 C13 30 15 22 20 12 Z" fill="${DEEP}"/>
      <circle cx="20" cy="34" r="4.6" fill="${GOLD}"/>
    </svg>`,
    { size: 160 },
  );
  const SWIRL = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M50 8 C78 8 92 30 88 52 C84 74 62 90 40 84 C26 80 18 66 24 54 C30 42 46 44 48 54 C50 62 42 66 38 62" stroke="${VERM}" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M50 22 C68 22 78 36 75 50 C72 62 60 70 48 68" stroke="${DEEP}" stroke-width="3.4" stroke-linecap="round" fill="none" opacity="0.9"/>
      <circle cx="38" cy="62" r="5" fill="${GOLD}"/>
      <circle cx="50" cy="8" r="3.4" fill="${GOLD}"/>
      <circle cx="92" cy="40" r="2.6" fill="${GOLD}"/>
    </svg>`,
    { size: 256 },
  );

  // ---- skeleton --------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.79, -0.45] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.79, -0.45],
      [0, 0.8, -0.05],
      [0, 0.85, 0.35],
      [0, 0.89, 0.6],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.89, 0.6],
      [0, 1.0, 0.7],
      [0, 1.1, 0.84],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.1, 0.84], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.07, 0.95], aim: [0, 1.045, 1.17], role: "jaw" });

  // ---- torso and neck --------------------------------------------------------------------------------------------
  const torso = b.sweep(
    catmull([
      [0, 0.8, -0.68],
      [0, 0.79, -0.45],
      [0, 0.8, -0.05],
      [0, 0.85, 0.35],
      [0, 0.89, 0.6],
    ]),
    profile([
      [0, 0.07, 0.08],
      [0.12, 0.13, 0.15],
      [0.25, 0.15, 0.16],
      [0.5, 0.14, 0.15],
      [0.78, 0.15, 0.185],
      [1, 0.115, 0.14],
    ]),
    { bone: [hips, spine], color: C_COAT },
  );
  const neckTube = b.sweep(neck, (t) => [0.12 - 0.035 * t, 0.115 - 0.03 * t], { color: C_COAT });
  const torsoSkin = b.surface(torso);

  // flank swirl markings
  for (const s of [1, -1]) {
    b.decal(torsoSkin, SWIRL, {
      at: [s * 0.16, 0.86, 0.22],
      dir: [s, 0, 0],
      size: [0.27, 0.27],
      mirror: s < 0,
      segments: 14,
    });
    b.decal(torsoSkin, SWIRL, {
      at: [s * 0.16, 0.87, -0.34],
      dir: [s, 0, 0],
      size: [0.2, 0.2],
      mirror: s > 0,
      roll: s * 25,
      segments: 12,
    });
  }

  // neck ruff of fur cards
  for (const [t, radius] of [
    [0.2, 0.105],
    [0.55, 0.09],
  ] as const) {
    b.cards(b.ring(neck.at(t), { count: 16, radius }).items, TUFT, {
      size: [0.075, 0.13],
      lean: 62,
      bend: 30,
      vary: 0.25,
      spin: 8,
      rng: R,
      color: "#fff3e0",
    });
  }
  // chest ruff
  b.cards(
    torsoSkin.scatter(26, { rng: R, minDist: 0.07, filter: (h) => h.at.z > 0.42 && h.n.z > 0.2 }),
    TUFT,
    { size: [0.06, 0.12], lean: 55, bend: 25, vary: 0.25, flow: [0, -1, -0.3], rng: R, color: "#fff1dc" },
  );

  // ---- rope collar, shide paper, bell ----------------------------------------------------------------------------
  const neckSkin = b.surface(neckTube);
  const ropeCenter = neck.at(0.45).at;
  const rope = neckSkin.loop(neck.at(0.45), { lift: 0.012 });
  b.sweep(
    rope,
    0.014,
    { sides: 6, color: paint((_p, _n, s) => (Math.floor(s[0] * 40) % 2 === 0 ? VERM : CREAM)) },
  );
  b.along(rope, 9, (at) => {
    b.part(new THREE.SphereGeometry(0.013, 6, 4), C_GOLD, { at });
  });
  const shideFrames: ReturnType<typeof frame>[] = [];
  b.along(rope, 12, (at) => {
    if (at.at.z > ropeCenter.z + 0.03) shideFrames.push(frame(at, [0, 1, 0]));
  });
  b.cards(shideFrames, SHIDE, { size: [0.045, 0.15], lean: 180, flow: [0, 0, 1], vary: 0.2, rng: R });
  const bellPoint = neckTube.at(0.45, 180, 0.012);
  const bellFrame = bellPoint.moved([0, 0.035, 0]);
  b.part(new THREE.SphereGeometry(0.03, 8, 6), C_GOLD, { at: bellFrame });
  b.part(new THREE.TorusGeometry(0.008, 0.003, 4, 8), C_GOLD, { at: bellPoint.moved([0, 0.01, 0]), dir: bellPoint.axis, axis: "z" });
  b.part(new THREE.BoxGeometry(0.036, 0.004, 0.004), SOCK, {
    at: bellPoint.moved([0, 0.04, 0.0]).moved([0, 0, 0]),
    bone: neck.joints[1],
  });
  b.cards([frame(bellFrame.at.clone().add(new THREE.Vector3(0, -0.026, 0)), [0, 1, 0])], TASSEL, {
    size: [0.05, 0.14],
    lean: 180,
    flow: [0, 0, 1],
    bone: neck.joints[1],
  });

  // ---- sash with bow ----------------------------------------------------------------------------------------------
  b.sweep(torsoSkin.loop(spine.joints[1], { lift: 0.012 }), 0.024, { sides: 6, color: C_VERM });
  for (const z of [-0.025, 0.025 + 0.025]) {
    b.sweep(torsoSkin.loop([0, 0.8, z + 0.0], { dir: [0, 0, 1], lift: 0.016 }), 0.009, { sides: 5, color: C_GOLD });
  }
  const top = torsoSkin.ray([0, 1.5, -0.05], [0, -1, 0])!;
  const T = top.at;
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), C_VERM, {
      at: [s * 0.055, T.y + 0.012, T.z],
      scale: [0.055, 0.024, 0.034],
      rotation: [0, 0, s * 18],
      bone: spine.joints[1],
    });
    const ribbon = torsoSkin.drape(
      catmull([
        [0, T.y, T.z],
        [s * 0.06, T.y - 0.02, T.z - 0.1],
        [s * 0.12, T.y - 0.07, T.z - 0.19],
        [s * 0.15, T.y - 0.14, T.z - 0.26],
      ]),
      { lift: 0.014 },
    );
    b.sweep(ribbon, (t) => [0.024 - 0.012 * t, 0.005], { color: C_VERM, sides: 6 });
  }
  b.part(new THREE.SphereGeometry(0.024, 8, 6), C_GOLD, { at: [0, T.y + 0.012, T.z], bone: spine.joints[1] });

  // ---- head ------------------------------------------------------------------------------------------------------
  const SK: [number, number, number] = [0, 1.17, 0.94];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), C_HEAD, {
    bone: head,
    at: SK,
    scale: [0.122, 0.112, 0.13],
  });
  const skullSkin = b.surface(skull);
  const muzzle = b.sweep(
    [
      [0, 1.15, 1.0],
      [0, 1.105, 1.215],
    ],
    (t) => [0.066 - 0.032 * t, 0.054 - 0.02 * t],
    { bone: head, color: C_COAT },
  );
  b.sweep(
    [
      [0, 1.06, 0.97],
      [0, 1.045, 1.17],
    ],
    (t) => [0.046 - 0.02 * t, 0.024 - 0.01 * t],
    { bone: jaw, color: C_CREAM },
  );
  b.part(new THREE.SphereGeometry(0.02, 8, 6), NOSE, { bone: head, at: [0, 1.105, 1.228], scale: [1.1, 0.8, 0.8] });
  b.part(new THREE.SphereGeometry(0.005, 4, 3), "#ffffff", { bone: head, at: [0.006, 1.112, 1.243] });
  // mouth line draped on the muzzle underside
  for (const s of [1, -1]) {
    const mouth = b.surface(muzzle).drape(
      catmull([
        [0, 1.085, 1.2],
        [s * 0.03, 1.078, 1.12],
        [s * 0.052, 1.088, 1.03],
      ]),
      { lift: 0.002 },
    );
    b.sweep(mouth, 0.0035, { color: INK, sides: 4 });
  }
  // eyes and markings
  for (const s of [1, -1]) {
    const eyeHit = skullSkin.around(SK).at(s * 40, 6)!;
    b.decal(skullSkin, EYE, { at: eyeHit, size: [0.058, 0.08], mirror: s > 0, roll: s * 9, segments: 12 });
    const cheekHit = skullSkin.around(SK).at(s * 64, -8)!;
    b.decal(skullSkin, CHEEK, { at: cheekHit, size: [0.1, 0.066], mirror: s < 0, segments: 12 });
  }
  const foreHit = skullSkin.around(SK).at(0, 38)!;
  b.decal(skullSkin, FOREHEAD, { at: foreHit, size: [0.05, 0.07], segments: 10 });
  // gold crescent on the brow
  const cres: Array<[number, number]> = [];
  for (let j = 0; j <= 8; j++) {
    const th = (195 + (j * 150) / 8) * DEG;
    cres.push([0.034 * Math.cos(th), 0.034 * Math.sin(th)]);
  }
  for (let j = 8; j >= 0; j--) {
    const th = (195 + (j * 150) / 8) * DEG;
    cres.push([0.027 * Math.cos(th), 0.014 + 0.027 * Math.sin(th)]);
  }
  const crownHit = skullSkin.around(SK).at(0, 58)!;
  b.extrude(cres, {
    at: crownHit.moved([0, 0.003, 0]),
    x: [1, 0, 0],
    y: surfaceUp(crownHit.n).toArray(),
    thickness: 0.009,
    bevel: 0.002,
    color: C_GOLD,
    bone: head,
  });
  // cheek fur
  b.cards(
    skullSkin.scatter(40, { rng: R, minDist: 0.03, filter: (h) => h.at.y < 1.2 && Math.abs(h.at.x) > 0.07 }),
    TUFT,
    { size: [0.05, 0.09], lean: 70, bend: 25, vary: 0.25, flow: [0, -0.2, -1], rng: R, color: "#fff4e0" },
  );
  // whiskers
  for (const s of [1, -1])
    for (const j of [0, 1, 2])
      b.spike(
        [s * 0.045, 1.125, 1.1],
        [s * (0.2 + 0.01 * j), 1.16 + 0.02 * (j - 1), 1.03 - 0.03 * j],
        null,
        0.003,
        { color: "#fffaf0", bone: head, sides: 4 },
      );

  // ears
  const earOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.06, -0.015],
    [0.06, -0.015],
    [0.058, 0.05],
    [0.04, 0.12],
    [0.012, 0.2],
    [0.0, 0.235, "sharp"],
    [-0.016, 0.2],
    [-0.042, 0.12],
    [-0.06, 0.05],
  ];
  const earPaint = cel(
    paint((_p, n, s) => {
      const inner = n.z > 0.4 && s[1] > 0.03 && Math.abs(s[0]) < 0.036 * (1 - s[1] / 0.21);
      if (inner) return s[1] > 0.14 ? PINKD : PINK;
      return s[1] > 0.17 ? VERM : CREAM;
    }),
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.07, 1.255, 0.91],
      dir: [s * 0.28, 1, -0.22],
      role: "hinge",
    });
    b.extrude(earOutline, {
      at: [s * 0.07, 1.255, 0.91],
      x: [s, 0, 0],
      y: [s * 0.28, 1, -0.22],
      thickness: [0.03, 0.008],
      bevel: 0.004,
      smoothing: 1,
      color: earPaint,
      bone: ear,
    });
    // gold hoop and tassel
    const hoopC = new THREE.Vector3(s * 0.135, 1.262, 0.9);
    b.sweep(
      catmull(circlePoints(hoopC, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), 0.018), { closed: true }),
      0.0055,
      { color: C_GOLD, sides: 5, bone: ear },
    );
    b.cards([frame([s * 0.135, 1.244, 0.9], [0, 1, 0])], TASSEL, {
      size: [0.034, 0.1],
      lean: 180,
      flow: [0, 0, 1],
      bone: ear,
    });
  }

  // ---- legs ------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // forelegs
    const fp = limb([s * 0.13, 0.71, 0.42], [s * 0.12, 0.065, 0.45], [0.35, 0.33], [[0, 0, -1]]);
    const fl = b.chain(`foreleg${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    const foreTube = b.sweep(fl, [0.085, 0.06, 0.042, 0.034], { color: C_LEG });
    const wrist = fl.joints[fl.joints.length - 1];
    b.capsule([s * 0.12, 0.042, 0.44], [s * 0.12, 0.042, 0.53], 0.042, { color: C_SOCK, bone: wrist });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.017, 6, 4), C_SOCK, { bone: wrist, at: [s * 0.12 + k * 0.024, 0.026, 0.55] });
      b.spike([s * 0.12 + k * 0.024, 0.02, 0.565], [0, -0.1, 1], 0.03, 0.006, { color: BONE, bone: wrist, sides: 5 });
    }
    b.sweep(b.surface(foreTube).loop([s * 0.12, 0.22, 0.46], { lift: 0.008 }), 0.011, { color: C_GOLD, sides: 5 });
    b.sweep(b.surface(foreTube).loop([s * 0.12, 0.25, 0.46], { lift: 0.006 }), 0.007, { color: C_VERM, sides: 5 });

    // hind legs
    const hp = limb(
      [s * 0.14, 0.76, -0.42],
      [s * 0.15, 0.06, -0.55],
      [0.31, 0.3, 0.24],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`hindleg${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    const hindTube = b.sweep(hl, [0.115, 0.085, 0.05, 0.037, 0.034], { color: C_LEG });
    const foot = hl.joints[hl.joints.length - 1];
    b.capsule([s * 0.15, 0.042, -0.56], [s * 0.15, 0.042, -0.44], 0.042, { color: C_SOCK, bone: foot });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.017, 6, 4), C_SOCK, { bone: foot, at: [s * 0.15 + k * 0.024, 0.026, -0.425] });
      b.spike([s * 0.15 + k * 0.024, 0.02, -0.41], [0, -0.1, 1], 0.03, 0.006, { color: BONE, bone: foot, sides: 5 });
    }
    b.sweep(b.surface(hindTube).loop([s * 0.15, 0.22, -0.54], { lift: 0.008 }), 0.011, { color: C_GOLD, sides: 5 });
    b.sweep(b.surface(hindTube).loop([s * 0.15, 0.25, -0.54], { lift: 0.006 }), 0.007, { color: C_VERM, sides: 5 });
    b.cards(
      b.surface(hindTube).scatter(14, { rng: R, minDist: 0.05, filter: (h) => h.at.y > 0.5 }),
      TUFT,
      { size: [0.05, 0.1], lean: 45, bend: 20, vary: 0.25, flow: [0, -1, -0.3], rng: R, color: "#ffedd2" },
    );
  }

  // ---- nine tails --------------------------------------------------------------------------------------------------
  const tailPoints = (k: number) => {
    const a = Math.abs(k);
    const psi0 = k * 16 * DEG;
    const e0 = (58 - a * 9) * DEG;
    const bend = (24 + a * 3) * DEG;
    const length = 0.94 - a * 0.04;
    const p = new THREE.Vector3(k * 0.018, 0.84 - a * 0.012, -0.58);
    const pts = [p.clone()];
    const sub = 10;
    for (let seg = 0; seg < 5; seg++)
      for (let q = 0; q < sub; q++) {
        const u = (seg * sub + q + 0.5) / (5 * sub);
        const psi = psi0 * (1 + 0.35 * u) + 0.1 * Math.sin(u * Math.PI * 2 + k);
        const e = e0 + bend * Math.pow(u, 1.1);
        const d = new THREE.Vector3(Math.sin(psi) * Math.cos(e), Math.sin(e), -Math.cos(psi) * Math.cos(e));
        p.addScaledVector(d, length / (5 * sub));
        if (q === sub - 1) pts.push(p.clone());
      }
    return pts;
  };

  for (let i = 0; i < 9; i++) {
    const k = i - 4;
    const a = Math.abs(k);
    const n = i + 1;
    const pts = tailPoints(k);
    const path = catmull(pts);
    const chain = b.chain(`tail${n}`, path, {
      parent: hips,
      names: Array.from({ length: 5 }, (_, j) => `tail${n}_${j + 1}`),
      role: "tail",
    });
    const base = pts[0];
    const grad = gradient(gradient(PEACH, CREAM, path.at(0), path.at(0.4)), VERM, path.at(0.72), path.at(1));
    const coat = cel(
      paint((_p, _n, s) => {
        const t = s[0];
        if ((t > 0.52 && t < 0.545) || (t > 0.585 && t < 0.605)) return VERM;
        return grad;
      }),
    );
    const sc = 1 - a * 0.03;
    const tube = b.sweep(chain, [0.04, 0.085, 0.115, 0.105, 0.07, 0.022].map((r) => r * sc), { color: coat });
    const skin = b.surface(tube);
    b.cards(skin.scatter(26, { rng: R, minDist: 0.055 }), TUFT, {
      size: [0.05, 0.09],
      lean: 55,
      bend: 20,
      vary: 0.3,
      flow: (f) => f.at.clone().sub(base),
      rng: R,
      color: grad,
    });
    // gold ring and red band near the root
    b.sweep(skin.loop(chain.at(0.2), { lift: 0.01 }), 0.012, { color: C_GOLD, sides: 5 });
    b.sweep(skin.loop(chain.at(0.245), { lift: 0.008 }), 0.008, { color: C_VERM, sides: 5 });
    // spirit flames: one big flame on the tip, two wisps beside the tail
    const lastJoint = chain.joints[chain.joints.length - 1];
    const tex = i % 2 === 0 ? FLAME_A : FLAME_B;
    const alt = i % 2 === 0 ? FLAME_B : FLAME_A;
    glow(
      b.cards([frame(chain.at(1).at, [0, 1, 0])], tex, {
        size: [0.17 - a * 0.012, 0.32 - a * 0.02],
        cross: true,
        bone: lastJoint,
        sink: 0.25,
      }),
      1.3,
    );
    const w1 = chain.at(0.84);
    const w2 = chain.at(0.68);
    glow(
      b.cards(
        [frame(offset(w1.at, w1.normal, 0.14), [0, 1, 0]), frame(offset(w2.at, w2.binormal, -0.15), [0, 1, 0])],
        alt,
        { size: [0.07, 0.13], cross: true, bone: lastJoint },
      ),
      1.2,
    );
  }

  // ---- hitodama: floating spirit flames --------------------------------------------------------------------------------
  const orbs: Array<[number, number, number, number]> = [
    [0.62, 0.55, 0.62, 0],
    [-0.7, 0.95, 0.38, 1],
    [0.52, 1.35, 0.15, 1],
    [-0.58, 0.38, 0.72, 0],
    [0.78, 0.95, -0.12, 0],
    [-0.5, 1.4, -0.1, 0],
  ];
  for (const kind of [0, 1]) {
    const mine = orbs.filter((o) => o[3] === kind).map((o) => frame([o[0], o[1], o[2]], [0, 1, 0]));
    glow(b.cards(mine, kind === 0 ? FLAME_A : FLAME_B, { size: [0.1, 0.19], cross: true, bone: hips, vary: 0.15, rng: R }), 1.2);
  }

  return b.root;
}
