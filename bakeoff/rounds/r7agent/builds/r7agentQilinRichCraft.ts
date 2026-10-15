import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "Jade-scaled hooved chimera of the mist: dragon head, branching gold antlers, a flowing cloud-flame mane and ox tail, gold filigree and glowing spirit wisps.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------- palette ----------
const VERM = "#e8403c";
const CORAL = "#ff8a52";
const GOLDHI = "#ffd75e";
const AQUA = "#6df0ff";
const PEARL = "#f3ffff";
const TOOTH = "#fff6e0";
const DARKMOUTH = "#5c1733";
const TONGUE = "#ff7a92";

const SCALE = scales(["#2cc3ad", "#21a897", "#38d1b9"], "#e6b640", { size: 0.055, width: 0.1, seed: 3 });
const SCALE_FINE = scales(["#2cc3ad", "#21a897", "#38d1b9"], "#e6b640", { size: 0.032, width: 0.11, seed: 3 });
const BELLY = scales(["#fff3d6", "#ffe8bd"], "#e8bb62", { size: 0.05, width: 0.1, seed: 5 });
const BELLY_FINE = scales(["#fff3d6", "#ffe8bd"], "#e8bb62", { size: 0.032, width: 0.11, seed: 5 });
const LOWLEG = scales(["#fbd366", "#ffe17f", "#f2bd48"], "#a8641b", { size: 0.04, width: 0.1, seed: 9 });

const BODY = cel(furEdge(SCALE, BELLY, { level: -0.34, teeth: 0.2, period: 0.05, ink: INK, inkWidth: 0.05 }));
const HEAD = cel(furEdge(SCALE_FINE, BELLY_FINE, { level: -0.45, teeth: 0.2, period: 0.03, ink: INK, inkWidth: 0.05 }));
const LEG = cel(
  furEdge(SCALE, LOWLEG, { by: "position", level: 0.56, teeth: 0.05, period: 0.05, along: [1, 0, 1], ink: INK }),
);
const GOLD = cel("#f6bf3a", "#bf7a24");
const GOLD_DARK = cel("#d99a2b", "#8d5120");
const CREAM = cel("#fff3d6", "#f1c98f");
const HORN = cel(
  paint((_p, _n, s) => (s[0] < 0.18 ? "#d9962c" : s[0] < 0.6 ? "#f7d98a" : s[0] < 0.85 ? "#fff0c4" : "#ffffff")),
  "#c98a3a",
);
const RED = cel(VERM, "#a8213f");
const JADE_DARK = cel("#14808a", "#0b4f6b");
const HOOF = cel("#f1b43a", "#a3641c");

// ---------- textures ----------
const tongueSvg = (outer: string, inner: string, vein: string, stroke: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100">
      <path d="M30 100 C8 82 6 54 24 38 C34 28 34 14 22 4 C46 6 58 24 48 44 C42 56 52 76 38 100 Z" fill="${outer}" stroke="${stroke}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M30 97 C16 80 18 58 30 46 C34 58 40 78 34 97 Z" fill="${inner}"/>
      <path d="M27 72 C26 62 31 55 34 49" stroke="${vein}" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
const MANE_RED = tongueSvg(VERM, "#ffb347", "#fff2a8", INK);
const MANE_GOLD = tongueSvg("#f6bf3a", "#fff0a8", "#ffffff", INK);
const MANE_CREAM = tongueSvg("#fff3d6", "#ffffff", "#ffd98a", "#c98a3a");
const WISP_AQUA = tongueSvg(AQUA, PEARL, "#ffffff", "#3fb8e8");

const CLOUD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 64">
    <path d="M6 54 C-2 40 8 28 20 32 C18 16 36 6 48 16 C60 8 76 18 70 32 C80 42 72 56 60 54 C52 62 38 58 34 54 C26 60 12 60 6 54 Z" fill="#fff6e4" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M22 44 C16 36 26 30 32 36 C36 40 30 46 27 42" stroke="#f0a64a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M46 30 C42 22 54 18 58 26 C60 32 52 36 50 32" stroke="#f0a64a" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const SWIRL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M52 52 C52 44 62 42 66 48 C72 58 60 68 50 66 C34 62 30 44 40 34 C52 22 74 28 78 44 C80 58 72 70 60 74" fill="none" stroke="#ffd75e" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M60 74 C52 80 40 80 30 74 C24 70 18 70 14 74" fill="none" stroke="#ffd75e" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M78 44 C86 40 92 32 90 24" fill="none" stroke="#ffd75e" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="52" cy="52" r="3.4" fill="#ff5a4a"/>
    <circle cx="88" cy="22" r="3" fill="#ffd75e"/>
    <circle cx="14" cy="74" r="3" fill="#ffd75e"/>
  </svg>`,
  { size: 256 },
);

const BROW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 24">
    <path d="M2 18 C14 6 38 4 62 12 C40 10 20 14 2 18 Z" fill="#ffd75e" stroke="${INK}" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const R = rng(11);

  // ======================= SKELETON =======================
  const hips = b.joint("hips", { at: [0, 1.2, -0.4], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.18, -0.1],
      [0, 1.2, 0.25],
      [0, 1.25, 0.5],
      [0, 1.3, 0.64],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chestJoint = spine.joints[2];
  const neckPath = catmull([
    [0, 1.3, 0.62],
    [0, 1.5, 0.8],
    [0, 1.72, 0.95],
    [0, 1.87, 1.1],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chestJoint, count: 3, role: "neck" });
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: neckPath.at(1),
    dir: [0, -0.2, 1],
    role: "head",
    group: "head",
  });
  const H = (forward: number, up: number, left: number) => head.local({ forward, up, left });
  const jaw = b.joint("jaw", { parent: head, at: H(0.1, -0.07, 0), aim: H(0.36, -0.12, 0), role: "jaw", group: "head" });

  const tailPath = catmull([
    [0, 1.26, -0.68],
    [0, 1.34, -1.0],
    [0, 1.34, -1.36],
    [0, 1.18, -1.68],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 5, role: "tail" });

  // ======================= BODY =======================
  const body = b.loft(
    [
      { at: [0, 1.2, -0.8], w: 0.22, h: 0.3 },
      { at: [0, 1.21, -0.58], w: 0.4, h: 0.54 },
      { at: [0, 1.18, -0.2], w: 0.37, h: 0.5 },
      { at: [0, 1.17, 0.2], w: 0.37, h: 0.52 },
      { at: [0, 1.2, 0.5], w: 0.37, h: 0.6 },
      { at: [0, 1.28, 0.7], w: 0.3, h: 0.46 },
    ],
    { bone: [hips, spine], color: BODY, detail: 0.9, name: "body" },
  );
  const bodySkin = b.surface(body);

  const neckTube = b.sweep(neck, [0.2, 0.17, 0.135, 0.11], { color: BODY, name: "neck" });

  const tailTube = b.sweep(tail, [0.085, 0.06, 0.042, 0.032], { color: BODY, name: "tail" });

  // gold back scutes
  b.along(
    body,
    9,
    (at) => b.stick(new THREE.ConeGeometry(0.03, 0.085, 4), GOLD, at, { embed: 0.25, flow: [0, 0, 1] }),
    { from: 0.08, to: 0.62 },
  );

  // ======================= LEGS =======================
  const hoofTips: Record<string, THREE.Vector3> = {};
  const legs: { chain: ReturnType<typeof b.chain>; sweep: ReturnType<typeof b.sweep>; s: number; front: boolean }[] = [];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // front legs
    const shoulder = [s * 0.18, 1.14, 0.5];
    const hoofF: [number, number, number] = [s * 0.18, 0.1, 0.55];
    const fpts = limb(shoulder, hoofF, [0.36, 0.36, 0.28, 0.1], [
      [0, 0, -1],
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const fleg = b.chain(`legF${sd}`, fpts, {
      parent: chestJoint,
      names: [`shoulder${sd}`, `elbow${sd}`, `knee${sd}`, `pasternF${sd}`, `hoofF${sd}`],
      role: "leg",
    });
    const fsweep = b.sweep(fleg, [0.12, 0.085, 0.06, 0.042, 0.036, 0.044], { color: LEG, name: `legF${sd}` });
    legs.push({ chain: fleg, sweep: fsweep, s, front: true });
    hoofTips[`F${sd}`] = new THREE.Vector3(...hoofF);

    // hind legs
    const hip = [s * 0.19, 1.12, -0.55];
    const hoofH: [number, number, number] = [s * 0.19, 0.1, -0.5];
    const hpts = limb(hip, hoofH, [0.38, 0.38, 0.32, 0.12], [
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const hleg = b.chain(`legH${sd}`, hpts, {
      parent: hips,
      names: [`hip${sd}`, `stifle${sd}`, `hock${sd}`, `pasternH${sd}`, `hoofH${sd}`],
      role: "leg",
    });
    const hsweep = b.sweep(hleg, [0.15, 0.1, 0.062, 0.042, 0.036, 0.044], { color: LEG, name: `legH${sd}` });
    legs.push({ chain: hleg, sweep: hsweep, s, front: false });
    hoofTips[`H${sd}`] = new THREE.Vector3(...hoofH);
  }

  // hooves, anklets, fins and tufts
  const tuftFrames: { f: ReturnType<typeof frame>; bone: THREE.Object3D | any }[] = [];
  for (const { chain, sweep, s, front } of legs) {
    const tip = chain.tip!;
    const target = hoofTips[`${front ? "F" : "H"}${s > 0 ? "L" : "R"}`];
    for (const k of [1, -1]) {
      b.extrude(
        [
          [-0.055, 0],
          [0.06, 0],
          [0.05, 0.04],
          [0.03, 0.1],
          [-0.035, 0.1],
          [-0.055, 0.05],
        ],
        {
          at: [target.x + k * 0.033, 0, target.z],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.055,
          bevel: 0.008,
          color: HOOF,
          bone: tip,
          name: "hoof",
        },
      );
    }
    // anklet + knee band
    for (const t of [0.66, 0.9]) {
      const sp = sweep.at(t);
      b.part(new THREE.TorusGeometry(sp.radius + 0.004, 0.009, 5, 10), GOLD, {
        at: chain.at(t).at,
        dir: chain.at(t).tangent,
        axis: "z",
        bone: chain.at(t).bone ?? undefined,
        name: "anklet",
      });
    }
    // dragon fin spur behind knee/hock
    const kp = chain.at(front ? 0.36 : 0.5);
    const backDir: [number, number, number] = [0, -0.25, -1];
    b.extrude(
      [
        [0, -0.04],
        [0.1, 0.02, "sharp"],
        [0.03, 0.04],
        [0.0, 0.08],
      ],
      {
        at: kp.at,
        x: backDir,
        y: [s * 0.0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: GOLD,
        bone: kp.bone ?? undefined,
        name: "spur",
      },
    );
    // tuft frames: knee/hock and ankle
    for (const [t, dx] of [
      [front ? 0.36 : 0.5, 0.045],
      [front ? 0.36 : 0.5, -0.045],
      [0.86, 0.03],
      [0.86, -0.03],
    ] as const) {
      const cp = chain.at(t);
      tuftFrames.push({ f: frame([cp.at.x + dx, cp.at.y, cp.at.z - 0.02], [0, 1, 0]), bone: cp.bone });
    }
  }
  for (const { f, bone } of tuftFrames) {
    b.cards([f], R() > 0.5 ? MANE_RED : MANE_GOLD, {
      size: [0.07, 0.17],
      lean: 125,
      bend: 20,
      flow: [0, -0.2, -1],
      cross: true,
      bone,
      rng: R,
    });
  }
  // aqua spirit wisps at the ankles
  for (const { chain } of legs) {
    const cp = chain.at(0.93);
    for (const dx of [0.03, -0.03]) {
      glow(
        b.cards([frame([cp.at.x + dx, cp.at.y + 0.02, cp.at.z], [0, 1, 0])], WISP_AQUA, {
          size: [0.06, 0.2],
          lean: 100,
          bend: 35,
          flow: [dx > 0 ? 1 : -1, -0.2, -0.6],
          bone: cp.bone ?? undefined,
        }),
        1,
      );
    }
  }

  // ======================= HEAD =======================
  const C = H(0.08, 0, 0);
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEAD, {
    bone: head,
    at: C,
    quat: head.quat,
    scale: [0.098, 0.16, 0.115],
    name: "skull",
  });
  const skin = b.surface(skull);

  // muzzle (upper jaw) and lower jaw
  const snoutA = H(0.16, -0.02, 0);
  const snoutB = H(0.4, -0.065, 0);
  b.sweep([snoutA, snoutB], (t) => [0.072 - 0.022 * t, 0.07 - 0.028 * t], {
    bone: head,
    color: HEAD,
    sides: 8,
    caps: "round",
    name: "muzzle",
  });
  b.sweep([H(0.1, -0.085, 0), H(0.38, -0.115, 0)], (t) => [0.052 - 0.014 * t, 0.03 - 0.008 * t], {
    bone: jaw,
    color: CREAM,
    sides: 8,
    caps: "round",
    name: "lowerJaw",
  });
  // tongue and mouth lining
  b.capsule(H(0.12, -0.088, 0), H(0.3, -0.1, 0), 0.02, { bone: jaw, color: TONGUE, sides: 6, name: "tongue" });
  b.capsule(H(0.14, -0.06, 0), H(0.34, -0.08, 0), 0.045, { bone: head, color: DARKMOUTH, sides: 6, name: "palate" });
  // nostril bulbs
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), JADE_DARK, {
      bone: head,
      at: H(0.385, -0.03, s * 0.04),
      name: "nostril",
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), INK, { bone: head, at: H(0.405, -0.035, s * 0.042), name: "nostrilHole" });
    // fangs
    b.spike(H(0.31, -0.092, s * 0.04), [0, -1, 0.15], 0.045, 0.01, { bone: head, color: TOOTH, name: "fang" });
    b.spike(H(0.34, -0.1, s * 0.038), [0, 1, 0.1], 0.03, 0.008, { bone: jaw, color: TOOTH, name: "tusk" });
    // tiny upper teeth row
    for (let i = 0; i < 4; i++)
      b.spike(H(0.2 + i * 0.03, -0.085, s * 0.05), [0, -1, 0], 0.014, 0.006, { bone: head, color: TOOTH, name: "tooth" });
  }

  // eyes
  const EYE = animeEye({ iris: "#ffb81f", irisLight: "#fff0a0", irisDark: "#c4421a" });
  for (const s of [1, -1]) {
    const hit = skin.around(C).at(s * 52, 8)!;
    b.decal(skin, EYE, { at: hit, size: [0.075, 0.102], mirror: s > 0, name: "eye" });
    // brow ridge
    const p0 = H(0.22, 0.075, s * 0.062);
    const p1 = H(0.15, 0.105, s * 0.085);
    const p2 = H(0.05, 0.095, s * 0.1);
    b.sweep(catmull([p0, p1, p2]), [0.004, 0.014, 0.003], {
      bone: head,
      color: GOLD,
      sides: 5,
      caps: "point",
      name: "brow",
    });
    // whisker (long, flowing)
    const w0 = H(0.36, -0.05, s * 0.05);
    const whisker = bezier(
      w0,
      [s * 0.2, 1.6, 1.55],
      [s * 0.52, 1.55, 1.1],
      [s * 0.42, 1.28, 0.78],
    );
    b.sweep(whisker, [0.01, 0.002], { bone: head, color: GOLD, sides: 5, caps: "round", name: "whisker" });
    b.part(new THREE.SphereGeometry(0.022, 7, 5), glowPearl(), { bone: head, at: whisker.at(1), name: "whiskerPearl" });
    // short second whisker
    const w1 = bezier(H(0.3, -0.06, s * 0.06), [s * 0.14, 1.52, 1.45], [s * 0.3, 1.42, 1.3], [s * 0.34, 1.3, 1.1]);
    b.sweep(w1, [0.007, 0.002], { bone: head, color: GOLDHI, sides: 5, caps: "round", name: "whisker" });
    // ears (swept fin leaves)
    const earBase = H(-0.02, 0.065, s * 0.075);
    b.extrude(
      [
        [0, -0.035],
        [0.08, -0.05],
        [0.17, 0.0],
        [0.27, 0.12, "sharp"],
        [0.15, 0.09],
        [0.06, 0.06],
        [0, 0.04],
      ],
      {
        at: earBase,
        x: [s * 0.65, 0.05, -0.75],
        y: [0, 1, 0],
        thickness: 0.016,
        bevel: 0.004,
        smoothing: 1,
        color: JADE_DARK,
        bone: head,
        name: "ear",
      },
    );
    b.extrude(
      [
        [0.02, -0.018],
        [0.09, -0.028],
        [0.16, 0.005],
        [0.22, 0.09, "sharp"],
        [0.13, 0.06],
        [0.05, 0.035],
      ],
      {
        at: H(-0.02, 0.066, s * 0.077),
        x: [s * 0.65, 0.05, -0.75],
        y: [0, 1, 0],
        thickness: 0.02,
        smoothing: 1,
        color: CORAL,
        bone: head,
        name: "earInner",
      },
    );
    // cheek frills
    b.extrude(
      [
        [0, 0.02],
        [0.1, 0.07, "sharp"],
        [0.06, 0.02],
        [0.16, 0.0, "sharp"],
        [0.07, -0.02],
        [0.12, -0.07, "sharp"],
        [0, -0.04],
      ],
      {
        at: H(0.03, -0.045, s * 0.085),
        x: [s * 0.5, -0.1, -1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: RED,
        bone: head,
        name: "cheekFrill",
      },
    );
  }

  // forehead gem on a gold bezel
  {
    const crown = skin.around(C).at(0, 62)!;
    b.stick(new THREE.CylinderGeometry(0.036, 0.042, 0.016, 8), GOLD, crown, { embed: 0.5, name: "gemBezel" });
    glow(
      b.stick(new THREE.OctahedronGeometry(0.03, 0), AQUA, crown.moved([0, 0.014, 0]), { embed: 0.3, name: "gem" }),
      1.4,
    );
  }
  // forelock wisps between the antlers
  b.cards(
    [
      frame(H(-0.01, 0.1, 0.0), [0, 1, 0]),
      frame(H(0.04, 0.11, 0.0), [0, 1, 0.2]),
      frame(H(-0.04, 0.09, 0.03), [0.3, 1, 0]),
      frame(H(-0.04, 0.09, -0.03), [-0.3, 1, 0]),
    ],
    [MANE_RED, MANE_GOLD],
    { size: [0.07, 0.2], lean: 50, bend: 30, flow: [0, -0.1, -1], bone: head, rng: R, cross: true },
  );
  // beard
  {
    const jawPts = [0.14, 0.2, 0.26, 0.32].map((f) => frame(H(f, -0.12, 0), [0, 1, 0]));
    b.cards(jawPts, [MANE_CREAM, MANE_GOLD], {
      size: [0.05, 0.2],
      lean: 165,
      bend: 15,
      flow: [0, 0, -1],
      cross: true,
      bone: jaw,
      rng: R,
    });
  }

  // ======================= ANTLERS =======================
  const pearls: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    const B = H(0.0, 0.1, s * 0.05);
    const pt = (x: number, y: number, z: number) => B.clone().add(new THREE.Vector3(s * x, y, z));
    const beam = catmull([pt(0, 0, 0), pt(0.04, 0.17, -0.07), pt(0.1, 0.35, -0.17), pt(0.13, 0.52, -0.3), pt(0.1, 0.66, -0.46)]);
    b.sweep(beam, [0.03, 0.006], { bone: head, color: HORN, sides: 6, caps: "point", name: "antler" });
    b.part(new THREE.CylinderGeometry(0.036, 0.05, 0.05, 8), GOLD, { bone: head, at: pt(0, 0.012, 0), name: "antlerCollar" });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), GOLD, {
      bone: head,
      at: beam.at(0.22),
      dir: beam.tangentAt(0.22),
      axis: "z",
      name: "antlerRing",
    });
    const tine = (t: number, out: [number, number, number], len: number, curl: [number, number, number]) => {
      const p0 = beam.at(t);
      const dir = new THREE.Vector3(s * out[0], out[1], out[2]).normalize();
      const tip = p0.clone().addScaledVector(dir, len).add(new THREE.Vector3(s * curl[0], curl[1], curl[2]));
      const ctrl = p0.clone().addScaledVector(dir, len * 0.55);
      b.sweep(bezier(p0, ctrl, tip), [0.017 * (1 - t * 0.5), 0.004], { bone: head, color: HORN, sides: 6, caps: "point", name: "tine" });
      pearls.push(new THREE.SphereGeometry(0.017, 6, 4).translate(tip.x, tip.y, tip.z));
    };
    tine(0.25, [0.2, 0.35, 1], 0.16, [0, 0.05, 0.02]); // brow tine
    tine(0.45, [1, 0.35, 0.1], 0.16, [0.02, 0.06, 0]); // outer tine
    tine(0.45, [-0.2, 0.3, 1], 0.12, [0, 0.05, 0.02]); // second forward
    tine(0.66, [0.9, 0.4, -0.3], 0.14, [0.02, 0.06, -0.03]);
    tine(0.82, [0.1, 0.5, 1], 0.1, [0, 0.05, 0.02]);
    const tp = beam.at(1);
    pearls.push(new THREE.SphereGeometry(0.019, 6, 4).translate(tp.x, tp.y + 0.01, tp.z));
  }
  {
    const pg = pearls[0];
    pearls.shift();
    // merge pearls into one glowing part
    const all = [pg, ...pearls];
    glow(
      b.part(mergeAll(all), AQUA, { bone: head, at: [0, 0, 0], name: "antlerPearls" }),
      1.3,
    );
  }

  // ======================= MANE =======================
  const maneBatch = (t0: number, t1: number, n: number, size: [number, number], deg: number, tex: THREE.Texture[]) => {
    const frames = [];
    for (let i = 0; i < n; i++) frames.push(neckTube.at(t0 + ((t1 - t0) * (i + 0.5)) / n, deg));
    b.cards(frames, tex, {
      size,
      lean: 62,
      bend: 35,
      flow: (f) => [Math.abs(f.at.x) < 0.02 ? 0 : Math.sign(f.at.x), -0.25, -0.8],
      vary: 0.25,
      spin: 10,
      rng: R,
      cross: deg === 0,
    });
  };
  for (const deg of [-40, 0, 40]) {
    maneBatch(0.05, 0.35, 6, [0.15, 0.34], deg, [MANE_RED, MANE_GOLD, MANE_RED]);
    maneBatch(0.35, 0.7, 7, [0.13, 0.28], deg, [MANE_RED, MANE_GOLD, MANE_RED]);
    maneBatch(0.7, 1.0, 6, [0.1, 0.22], deg, [MANE_RED, MANE_GOLD]);
  }
  for (const deg of [-75, 75]) maneBatch(0.1, 0.9, 10, [0.12, 0.24], deg, [MANE_GOLD, MANE_RED, MANE_CREAM]);
  // withers/back tuft row
  {
    const fr = [];
    for (let i = 0; i < 6; i++) fr.push(body.at(0.62 + i * 0.04, 0));
    b.cards(fr, [MANE_RED, MANE_GOLD], {
      size: [0.1, 0.22],
      lean: 70,
      bend: 30,
      flow: [0, -0.3, -1],
      cross: true,
      rng: R,
      vary: 0.2,
    });
  }
  // chest ruff (hanging cream/gold wisps)
  {
    const ruff = [];
    for (const dx of [-0.12, -0.06, 0, 0.06, 0.12])
      ruff.push(frame([dx, 1.0, 0.7 - Math.abs(dx) * 0.4], [0, 1, 0]));
    b.cards(ruff, [MANE_CREAM, MANE_GOLD], {
      size: [0.08, 0.22],
      lean: 168,
      bend: 15,
      flow: [0, 0, 1],
      cross: true,
      bone: chestJoint,
      rng: R,
    });
  }

  // ======================= COLLAR & PENDANT =======================
  {
    const collarLoop = b.surface(neckTube).loop(neck.at(0.2), { lift: 0.012 });
    b.sweep(collarLoop, 0.02, { color: GOLD, sides: 6, name: "collar" });
    b.along(collarLoop, 10, (at) => b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLDHI, { at, name: "collarStud" }));
    const pend = collarLoop.at(0.5);
    b.rod(pend, [pend.x, pend.y - 0.07, pend.z + 0.01], 0.006, { color: GOLD, sides: 4, name: "pendantChain" });
    glow(
      b.part(new THREE.OctahedronGeometry(0.04, 0), AQUA, {
        at: [pend.x, pend.y - 0.1, pend.z + 0.015],
        bone: neck.joints[0],
        scale: [1, 1.5, 0.7],
        name: "pendant",
      }),
      1.2,
    );
    b.cards([frame([pend.x, pend.y - 0.14, pend.z + 0.015], [0, 1, 0])], MANE_RED, {
      size: [0.05, 0.18],
      lean: 175,
      flow: [0, 0, 1],
      cross: true,
      bone: neck.joints[0],
    });
  }

  // ======================= BODY FILIGREE =======================
  for (const s of [1, -1]) {
    for (const [z, y, sz] of [
      [0.38, 1.17, 0.3],
      [-0.42, 1.2, 0.34],
    ]) {
      b.decal(bodySkin, SWIRL, {
        at: [s * 0.19, y, z],
        dir: [s, 0, 0],
        size: [sz, sz],
        mirror: s < 0,
        name: "filigree",
      });
    }
    // smaller swirls on the neck
    b.decal(b.surface(neckTube), SWIRL, {
      at: [s * 0.14, 1.55, 0.8],
      dir: [s, 0.15, 0.1],
      size: [0.16, 0.16],
      mirror: s < 0,
      name: "neckSwirl",
    });
  }
  // belly girth band with medallions
  {
    const girthLoop = bodySkin.loop([0, 1.17, 0.08], { dir: [0, 0, 1], lift: 0.012 });
    b.sweep(girthLoop, 0.016, { color: GOLD, sides: 6, name: "girth" });
    for (const s of [1, -1]) {
      const hit = bodySkin.nearest([s * 0.3, 1.0, 0.08]);
      b.stick(new THREE.CylinderGeometry(0.05, 0.055, 0.02, 10), GOLD, hit, { embed: 0.4, name: "medallion" });
      glow(b.stick(new THREE.OctahedronGeometry(0.03, 0), VERM, hit.moved([0, 0.014, 0]), { embed: 0.3, name: "medallionGem" }), 0.9);
      b.cards([frame(hit.moved([0, 0.01, 0]).at.clone().add(new THREE.Vector3(0, -0.02, 0)), [0, 1, 0])], MANE_RED, {
        size: [0.05, 0.2],
        lean: 178,
        flow: [s, 0, 0.2],
        cross: true,
      });
    }
  }

  // ======================= TAIL PLUME =======================
  {
    const E = tailPath.at(1);
    const ribbon = (ctrl1: number[], ctrl2: number[], tipPt: number[], w: number, color: any) => {
      const path = bezier(E, ctrl1, ctrl2, tipPt);
      b.sweep(path, (t) => [0.012 + w * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.05)) ** 0.7 * (1 - 0.35 * t), 0.006], {
        bone: tail.joints[4],
        color,
        sides: 4,
        caps: "point",
        name: "plume",
      });
    };
    const PL_RED = cel(paint((_p, _n, s) => (s[0] < 0.55 ? VERM : s[0] < 0.7 ? CORAL : GOLDHI)), "#a8213f");
    const PL_GOLD = cel(paint((_p, _n, s) => (s[0] < 0.5 ? "#f6bf3a" : s[0] < 0.75 ? GOLDHI : "#fff4c0")), "#bf7a24");
    ribbon([0, 1.15, -1.8], [0.2, 1.0, -2.0], [0.34, 0.78, -2.05], 0.07, PL_RED);
    ribbon([0, 1.15, -1.8], [-0.2, 1.0, -2.0], [-0.34, 0.78, -2.05], 0.07, PL_RED);
    ribbon([0, 1.2, -1.85], [0.06, 1.05, -2.1], [0.1, 0.66, -2.2], 0.085, PL_GOLD);
    ribbon([0, 1.2, -1.85], [-0.06, 1.05, -2.1], [-0.1, 0.66, -2.2], 0.085, PL_GOLD);
    ribbon([0, 1.22, -1.75], [0.3, 1.3, -1.9], [0.5, 1.05, -1.95], 0.06, PL_GOLD);
    ribbon([0, 1.22, -1.75], [-0.3, 1.3, -1.9], [-0.5, 1.05, -1.95], 0.06, PL_GOLD);
    ribbon([0, 1.25, -1.7], [0, 1.4, -1.95], [0, 1.2, -2.25], 0.07, PL_RED);
    // cloud cards along the tail
    const tf = [];
    for (let i = 0; i < 10; i++) tf.push(tailTube.at(0.15 + i * 0.085, i % 2 ? -60 : 60));
    b.cards(tf, [MANE_RED, MANE_GOLD], {
      size: [0.1, 0.22],
      lean: 55,
      bend: 30,
      flow: (f) => [Math.sign(f.at.x) || 1, -0.2, -0.8],
      rng: R,
      vary: 0.2,
    });
    const aq = [];
    for (let i = 0; i < 5; i++) aq.push(tailTube.at(0.5 + i * 0.1, 0));
    glow(
      b.cards(aq, WISP_AQUA, {
        size: [0.07, 0.24],
        lean: 50,
        bend: 30,
        flow: [0, -0.3, -1],
        cross: true,
        rng: R,
        vary: 0.2,
      }),
      1,
    );
  }

  // cloud puffs on the haunch and shoulder
  b.cards(
    [
      frame([0.2, 1.33, -0.45], [0.5, 1, 0]),
      frame([-0.2, 1.33, -0.45], [-0.5, 1, 0]),
      frame([0.18, 1.35, 0.25], [0.5, 1, 0]),
      frame([-0.18, 1.35, 0.25], [-0.5, 1, 0]),
    ],
    CLOUD,
    { size: [0.16, 0.13], lean: 75, bend: 10, flow: (f) => [Math.sign(f.at.x), -0.3, -0.4], rng: R },
  );

  // ======================= FINAL REST POSE =======================
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  return b.root;
}

function mergeAll(geos: THREE.BufferGeometry[]) {
  // merge by concatenating attribute arrays (all are indexed three.js primitives with the same attributes)
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  let off = 0;
  for (const g of geos) {
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    const u = g.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
      uv.push(u.getX(i), u.getY(i));
    }
    const ix = g.getIndex()!;
    for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
    off += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  out.setIndex(idx);
  return out;
}

function glowPearl() {
  return "#8ff3ff";
}
