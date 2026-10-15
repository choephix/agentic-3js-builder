// Elven ranger archer: high-fantasy anime. Cel-shaded paints (kits/toon), gold filigree trims, an emerald glow
// (kits/glow) in the bow riser, buckle and brooch. Slim 1.83 m elf, silver-blond hair, forest-green cloak,
// leather corset, tall boots, a recurved leaf-limbed bow in the left hand and a quiver of arrows on the back.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { offset, rng } from "../../../../src/math";
import type { FrameInput } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "Slender elven ranger in a forest-green cloak and tabard with gold leaf filigree, leather corset and straps, tall boots, a recurved leaf bow in hand and a quiver of fletched arrows.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const SKIN = cel("#f8dcc8", "#e7ae9d");
const GREEN = cel("#4b6b43", "#2f4a3a");
const GREEN_D = cel("#3a5636", "#25402f");
const LEATHER = cel("#7a4b2c", "#4e2e22");
const LEATHER_D = cel("#4a2c1c", "#2d1a1a");
const GOLD = cel("#e6bb4e", "#a97b24");
const CREAM = cel("#eadfc0", "#b9a583");
const PANTS = cel("#6b4a32", "#46302a");
const BOOT = cel("#5a3a26", "#38241e");
const BOW_G = cel("#3f6a4c", "#264636");
const HAIR = cel(
  paint((p) => (Math.sin(p.x * 140 + p.y * 34 + p.z * 60) > 0.55 ? "#f7f1dc" : "#e3dab9")),
  "#b3aa8a",
);
const STRING = "#efe7d0";
const SHAFT = "#a9784a";
const FEATHER = "#f4f0e2";
const FEATHER_G = "#7fa96a";
const GEM = "#6dffb2";
const DARKM = "#3a2418";
const ROSE = "#cc7b78";

// ---------------------------------------------------------------- textures
const leaves = (n: number) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const y = 26 + i * (92 / n);
    const w = 18 - i * 1.2;
    s += `<path d="M32 ${y} Q${32 + w} ${y - 4} ${32 + w + 6} ${y - 18} Q${32 + w - 4} ${y - 2} 32 ${y}Z" fill="#e6bb4e"/>`;
    s += `<path d="M32 ${y + 6} Q${32 - w} ${y + 2} ${32 - w - 6} ${y - 12} Q${32 - w + 4} ${y + 4} 32 ${y + 6}Z" fill="#e6bb4e"/>`;
  }
  return s;
};
const LEAF = svg(
  `<svg viewBox="0 0 64 128"><path d="M32 6 Q29 60 32 124" stroke="#e6bb4e" stroke-width="3.2" fill="none"/>${leaves(6)}<path d="M32 6 Q40 -2 46 -6 Q38 8 32 6Z" fill="#e6bb4e"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "elvenArcher" });
  const R = rng(7);
  const V = (v: readonly number[]) => new THREE.Vector3(v[0], v[1], v[2]);
  const torus = (at: FrameInput, r: number, t: number, color: typeof GOLD) =>
    b.part(new THREE.TorusGeometry(r, t, 5, 12), color, { frame: at, dir: at, axis: "z" });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.95, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, 0],
      [0, 1.1, 0.005],
      [0, 1.27, 0.015],
      [0, 1.42, 0.012],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.42, 0.012],
      [0, 1.52, 0.03],
      [0, 1.62, 0.05],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.62, 0.05], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.655, 0.045], aim: [0, 1.63, 0.13], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torsoPaint = cel(
    paint((p, n) => {
      const y = p.y;
      if (y > 1.09 && y < 1.34) {
        if (y < 1.115 || y > 1.315) return LEATHER_D;
        if (n.z > 0.4 && Math.abs(p.x) < 0.022 && (y * 90) % 2 < 0.7) return CREAM;
        if (n.z > 0.4 && Math.abs(Math.abs(p.x) - 0.075) < 0.004) return GOLD;
        return LEATHER;
      }
      if (y >= 1.34 && Math.abs(Math.abs(p.x) - 0.07) < 0.003 && n.z > 0) return GOLD;
      if (y <= 1.09 && y > 1.07) return GOLD;
      return GREEN;
    }),
  );
  const torso = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.31, h: 0.2 },
      { at: [0, 1.0, 0], w: 0.3, h: 0.19 },
      { at: [0, 1.12, 0.005], w: 0.24, h: 0.17 },
      { at: [0, 1.27, 0.015], w: 0.29, h: 0.21 },
      { at: [0, 1.41, 0.01], w: 0.33, h: 0.19 },
      { at: [0, 1.49, 0], w: 0.15, h: 0.12 },
    ],
    { bone: [spine, hips], color: torsoPaint },
  );
  const skin = b.surface(torso);

  // belts and straps
  const belt = skin.loop([0, 1.03, 0], { lift: 0.01 });
  b.sweep(belt, 0.016, LEATHER_D, { sides: 6 });
  b.along(belt, 16, (at) => b.stick(new THREE.SphereGeometry(0.008, 5, 4), GOLD, at));
  b.sweep(skin.loop([0, 0.96, 0], { lift: 0.008 }), 0.011, LEATHER, { sides: 5 });
  b.sweep(
    skin.drape(
      catmull([
        [0.12, 1.5, -0.05],
        [0.14, 1.46, 0.05],
        [0.06, 1.3, 0.12],
        [-0.06, 1.15, 0.14],
        [-0.16, 1.02, 0.08],
        [-0.18, 0.98, -0.02],
      ]),
      { lift: 0.012 },
    ),
    0.014,
    LEATHER,
    { sides: 5 },
  );
  b.sweep(
    skin.drape(
      catmull([
        [-0.12, 1.5, -0.05],
        [-0.1, 1.4, -0.1],
        [0.05, 1.2, -0.11],
        [0.15, 1.02, -0.06],
      ]),
      { lift: 0.012 },
    ),
    0.014,
    LEATHER_D,
    { sides: 5 },
  );
  b.part(new THREE.OctahedronGeometry(0.032, 0), GOLD, { at: [0, 1.04, 0.115], scale: [1, 1.2, 0.35], bone: hips });
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), GEM, { at: [0, 1.04, 0.126], bone: hips }), 1.4);
  b.part(new THREE.OctahedronGeometry(0.05, 0), GOLD, { at: [0, 1.49, 0.118], scale: [0.8, 1.2, 0.4], bone: chest });
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), GEM, { at: [0, 1.49, 0.13], bone: chest }), 1.4);

  // capelet and collar
  const capelet: OutlinePoint[] = [
    [0, 0.15],
    [0.12, 0.14],
    [0.23, 0.08],
    [0.28, -0.04],
    [0.255, -0.045],
    [0.2, 0.03],
    [0.11, 0.1],
    [0, 0.11],
  ];
  b.lathe(capelet, { at: [0, 1.36, 0], bone: chest, color: GREEN, segments: 14 });
  b.sweep(
    catmull(
      [
        [0.275, 1.325, 0],
        [0, 1.325, 0.275],
        [-0.275, 1.325, 0],
        [0, 1.325, -0.275],
      ],
      { closed: true },
    ),
    0.007,
    GOLD,
    { bone: chest, sides: 5 },
  );
  const collar: OutlinePoint[] = [
    [0.046, 0],
    [0.064, -0.004],
    [0.06, 0.055],
    [0.05, 0.05],
  ];
  b.lathe(collar, { at: [0, 1.5, 0.02], bone: neck.joints[0], color: GREEN_D, segments: 10 });

  // cape
  const capePaint = cel(
    paint((_p, _n, s) => {
      const u = s[0];
      const v = s[1];
      if (v > 0.955 || u < 0.012 || u > 0.988) return GOLD;
      if (Math.abs(v - (0.88 + 0.022 * Math.sin(u * 70))) < 0.007) return GOLD;
      if (v > 0.7 && v < 0.86 && Math.abs(Math.sin(u * 35)) > 0.93 && Math.abs(Math.cos(u * 70 + v * 20)) < 0.4)
        return GOLD;
      return v > 0.55 ? GREEN_D : GREEN;
    }),
  );
  const capeTop: number[][] = [
    [0.2, 1.47, -0.03],
    [0.14, 1.5, -0.09],
    [0.07, 1.51, -0.115],
    [0, 1.51, -0.12],
    [-0.07, 1.51, -0.115],
    [-0.14, 1.5, -0.09],
    [-0.2, 1.47, -0.03],
  ];
  const capeHem: number[][] = [
    [0.42, 0.4, -0.06],
    [0.3, 0.3, -0.2],
    [0.15, 0.37, -0.3],
    [0, 0.28, -0.34],
    [-0.15, 0.37, -0.3],
    [-0.3, 0.3, -0.2],
    [-0.42, 0.4, -0.06],
  ];
  b.membrane(capeTop, capeHem, { color: capePaint, thickness: 0.008, rows: 8, bone: chest });

  // tabard and side panels
  const tab: OutlinePoint[] = [
    [-0.1, 0],
    [-0.115, -0.2],
    [0, -0.38, "sharp"],
    [0.115, -0.2],
    [0.1, 0],
  ];
  const tabPaint = cel(
    paint((_p, _n, s) => {
      const [x, y] = s;
      const h = y > -0.2 ? 0.1 + 0.015 * (-y / 0.2) : 0.115 * ((0.38 + y) / 0.18);
      if (h - Math.abs(x) < 0.01 || y > -0.012) return GOLD;
      return GREEN;
    }),
  );
  b.extrude(tab, { at: [0, 1.0, 0.115], x: [1, 0, 0], thickness: 0.012, bevel: 0.002, color: tabPaint, bone: hips });
  b.part(new THREE.PlaneGeometry(0.15, 0.3), "#ffffff", {
    at: [0, 0.84, 0.123],
    dir: [0, 0, 1],
    axis: "z",
    texture: LEAF,
    bone: hips,
  });
  for (const s of [1, -1]) {
    b.extrude(tab, {
      at: [s * 0.145, 0.99, 0],
      x: [0, 0, 1],
      y: [s * 0.28, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: tabPaint,
      bone: hips,
    });
  }

  // pouch and dagger
  b.part(new THREE.BoxGeometry(0.06, 0.08, 0.045), LEATHER, { at: [-0.175, 0.96, 0.03], bone: hips });
  b.part(new THREE.BoxGeometry(0.064, 0.035, 0.05), LEATHER_D, { at: [-0.175, 0.99, 0.032], bone: hips });
  b.part(new THREE.SphereGeometry(0.008, 5, 4), GOLD, { at: [-0.175, 0.975, 0.058], bone: hips });
  b.rod([0.17, 1.02, 0.07], [0.22, 0.74, 0.13], [0.021, 0.012], LEATHER_D, { bone: hips, caps: { start: "flat", end: "point" } });
  b.rod([0.17, 1.02, 0.07], [0.14, 1.11, 0.05], 0.012, LEATHER, { bone: hips });
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.02), GOLD, { at: [0.165, 1.025, 0.068], bone: hips, rotation: [0, 0, -10] });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [0.138, 1.12, 0.048], bone: hips });

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.085, 0.93, 0], [s * 0.1, 0.09, 0], [0.44, 0.44], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.092, 0.086, 0.07, 0.06, 0.062, 0.052, 0.044], {
      bands: [
        [0.5, PANTS],
        [1, BOOT],
      ],
    });
    const ankle = leg.joints[2];
    const cuffAt = leg.at(0.56);
    b.part(new THREE.CylinderGeometry(0.078, 0.066, 0.1, 8), LEATHER, { frame: cuffAt, dir: cuffAt });
    torus(leg.at(0.61), 0.07, 0.006, GOLD);
    torus(leg.at(0.2), 0.082, 0.009, LEATHER_D);
    b.part(new THREE.BoxGeometry(0.02, 0.026, 0.01), GOLD, {
      at: offset(leg.at(0.2), [s, 0, 0.4], 0.085),
    });
    torus(leg.at(0.9), 0.05, 0.007, LEATHER_D);
    b.part(new THREE.OctahedronGeometry(0.05, 0), GOLD, {
      at: offset(leg.at(0.49), [0, 0, 1], 0.058),
      scale: [0.8, 1, 0.3],
    });
    b.part(new THREE.OctahedronGeometry(0.03, 0), GOLD, {
      at: offset(leg.at(0.66), [0, 0, 1], 0.058),
      scale: [0.8, 1, 0.3],
    });
    b.frustumBox([s * 0.1, 0.0475, -0.05], [s * 0.1, 0.0375, 0.2], [0.085, 0.095], [0.07, 0.075], {
      color: BOOT,
      bone: ankle,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), BOOT, { at: [s * 0.1, 0.04, 0.205], scale: [0.037, 0.036, 0.045], bone: ankle });
    b.part(new THREE.BoxGeometry(0.075, 0.012, 0.05), LEATHER_D, { at: [s * 0.1, 0.006, -0.045], bone: ankle });
    b.part(new THREE.OctahedronGeometry(0.02, 0), GOLD, { at: [s * 0.1, 0.095, 0.045], scale: [1, 1, 0.5], bone: ankle });
  }

  // ---------------------------------------------------------------- arms and hands
  const BOWX = 0.355;
  const wristOf = (s: number) => (s > 0 ? [0.34, 0.95, 0.09] : [-0.33, 0.93, 0.05]);
  let wristL = chest;
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const elbow = [s * 0.27, 1.17, -0.02];
    const wrist = wristOf(s);
    const arm = b.chain(`arm${S}`, [[s * 0.19, 1.43, 0], elbow, wrist], {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.052, 0.046, 0.04, 0.034, 0.03], {
      bands: [
        [0.52, CREAM],
        [0.55, GOLD],
        [0.93, LEATHER],
        [0.96, GOLD],
        [1, SKIN],
      ],
    });
    torus(arm.at(0.64), 0.04, 0.004, GOLD);
    torus(arm.at(0.8), 0.036, 0.004, GOLD);
    b.part(new THREE.OctahedronGeometry(0.022, 0), GOLD, {
      at: offset(arm.at(0.72), [s, 0.2, 0.5], 0.04),
      scale: [0.7, 1.4, 0.5],
    });
    const wj = arm.joints[2];
    if (s > 0) wristL = wj;
    const d = V(wrist).sub(V(elbow)).normalize();
    const palmC = V(wrist).addScaledVector(d, 0.05);
    b.part(new THREE.BoxGeometry(0.068, 0.09, 0.034), LEATHER_D, { at: palmC, dir: d, bone: wj });
    const base = V(wrist).addScaledVector(d, 0.09);
    const fj = b.joint(`fingers${S}`, { parent: wj, at: base, dir: [0, -0.7, 0.6], role: "digit" });
    const curl = s > 0 ? 0.04 : 0.025;
    for (let k = 0; k < 4; k++) {
      const P = base.clone().add(new THREE.Vector3((k - 1.5) * 0.0175, 0, 0));
      const len = 0.07 - 0.008 * Math.abs(k - 1.5);
      const E = P.clone().addScaledVector(d, len * 0.8).add(new THREE.Vector3(0, 0, curl));
      b.capsule(P, E, 0.0085, SKIN, { bone: fj, sides: 5 });
    }
    const TP = V(wrist).addScaledVector(d, 0.035).add(new THREE.Vector3(-s * 0.035, 0, 0.005));
    const tj = b.joint(`thumb${S}`, { parent: wj, at: TP, dir: d, role: "digit" });
    b.capsule(TP, TP.clone().addScaledVector(d, 0.05).add(new THREE.Vector3(-s * 0.008, 0, 0.03)), 0.0095, SKIN, {
      bone: tj,
      sides: 5,
    });
  }

  // ---------------------------------------------------------------- neck and head
  b.sweep(neck, [0.042, 0.036, 0.034], { color: SKIN });
  const HEAD_C: [number, number, number] = [0, 1.7, 0.055];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, {
    at: HEAD_C,
    scale: [0.088, 0.1, 0.095],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, { at: [0, 1.635, 0.085], scale: [0.052, 0.04, 0.052], bone: jaw });
  b.part(new THREE.SphereGeometry(1, 6, 4), ROSE, { at: [0, 1.65, 0.139], scale: [0.015, 0.0035, 0.006], bone: head });
  b.part(new THREE.ConeGeometry(0.008, 0.022, 5), SKIN, { at: [0, 1.676, 0.146], dir: [0, -0.25, 1], bone: head });
  const EYE = animeEye({ iris: "#6fbf6a" });
  const faceSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = faceSkin.around(HEAD_C).at(s * 27, 0);
    if (hit) b.decal(faceSkin, EYE, { at: hit, size: [0.036, 0.05], mirror: s > 0 });
    // long pointed ears
    const baseE: number[] = [s * 0.085, 1.7, 0.045];
    const tipE: number[] = [s * 0.2, 1.775, -0.012];
    b.sweep([baseE, tipE], (t) => [0.022 * (1 - t) + 0.003, 0.009], { color: SKIN, bone: head, caps: "point" });
    b.part(new THREE.TorusGeometry(0.012, 0.003, 4, 8), GOLD, {
      at: [s * 0.11, 1.715, 0.02],
      dir: [s, 0.4, -0.2],
      axis: "z",
      bone: head,
    });
    // leaf hair clips
    b.part(new THREE.OctahedronGeometry(0.02, 0), GOLD, {
      at: [s * 0.085, 1.77, 0.07],
      scale: [0.5, 1.5, 0.4],
      rotation: [0, 0, s * 35],
      bone: head,
    });
  }

  // hair
  b.part(new THREE.SphereGeometry(1, 14, 10), HAIR, { at: [0, 1.725, 0.03], scale: [0.096, 0.101, 0.1], bone: head });
  const N = 18;
  for (let i = 0; i < N; i++) {
    const a = (i / (N - 1) - 0.5) * 2;
    const x = a * 0.075;
    const sway = (R() - 0.5) * 0.04;
    const endY = 1.22 - 0.1 * R();
    b.sweep(
      catmull([
        [x, 1.79 - 0.03 * Math.abs(a), -0.02],
        [x * 1.15, 1.7, -0.115],
        [x * 1.35 + sway, 1.52, -0.165],
        [x * 1.6 - sway, (1.52 + endY) / 2, -0.185],
        [x * 1.7 + sway * 1.5, endY, -0.19 - 0.02 * Math.abs(a)],
      ]),
      [0.022, 0.031, 0.027, 0.015, 0],
      { color: HAIR, bone: head, sides: 5, caps: "point" },
    );
  }
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.1, 1.74, 0.06],
        [s * 0.125, 1.62, 0.1],
        [s * 0.17, 1.48, 0.15],
        [s * 0.2, 1.34, 0.2],
        [s * 0.19, 1.2, 0.19],
      ]),
      [0.016, 0.02, 0.02, 0.014, 0],
      { color: HAIR, bone: head, sides: 5, caps: "point" },
    );
    for (let k = 0; k < 4; k++) {
      b.sweep(
        catmull([
          [s * 0.01, 1.815, 0.07],
          [s * 0.04, 1.795, 0.105],
          [s * (0.075 + 0.01 * k), 1.745, 0.1],
          [s * (0.092 + 0.006 * k), 1.7, 0.09],
        ]),
        [0.012, 0.015, 0.01, 0],
        { color: HAIR, bone: head, sides: 5, caps: "point" },
      );
    }
  }

  // ---------------------------------------------------------------- quiver and arrows
  const QA = new THREE.Vector3(-0.06, 1.0, -0.27);
  const QB = new THREE.Vector3(-0.17, 1.52, -0.2);
  const qd = QB.clone().sub(QA);
  const qn = qd.clone().normalize();
  b.rod(QA, QB, [0.045, 0.058], LEATHER, { bone: chest, caps: "flat" });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), LEATHER_D, { at: QA, bone: chest, scale: [1, 0.7, 1] });
  for (const t of [0.06, 0.5, 0.97]) {
    b.part(new THREE.TorusGeometry(0.05 + 0.011 * t, 0.007, 5, 12), GOLD, {
      at: QA.clone().addScaledVector(qd, t),
      dir: qn,
      axis: "z",
      bone: chest,
    });
  }
  b.part(new THREE.OctahedronGeometry(0.03, 0), GOLD, {
    at: QA.clone().addScaledVector(qd, 0.3).add(new THREE.Vector3(0, 0, -0.045)),
    scale: [0.8, 1.3, 0.4],
    bone: chest,
  });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const ox = 0.03 * Math.cos(a);
    const oz = 0.03 * Math.sin(a);
    const start = QB.clone().addScaledVector(qn, -0.05).add(new THREE.Vector3(ox, 0, oz));
    const end = start.clone().addScaledVector(qn, 0.2).add(new THREE.Vector3(ox * 0.9, 0, oz * 0.9));
    b.rod(start, end, 0.0045, SHAFT, { bone: chest, sides: 4 });
    const fl = end.clone().addScaledVector(end.clone().sub(start).normalize(), -0.065);
    b.rod(fl, end, [0.012, 0.007], i % 2 ? FEATHER : FEATHER_G, { bone: chest, sides: 5 });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), DARKM, { at: end, bone: chest });
  }

  // ---------------------------------------------------------------- bow
  const bowPath = catmull([
    [BOWX, 0.12, -0.02],
    [BOWX, 0.3, 0.075],
    [BOWX, 0.62, 0.135],
    [BOWX, 0.9, 0.145],
    [BOWX, 1.18, 0.135],
    [BOWX, 1.5, 0.075],
    [BOWX, 1.68, -0.02],
  ]);
  const bow = b.sweep(bowPath, [0.006, 0.013, 0.019, 0.024, 0.019, 0.013, 0.006], {
    bone: wristL,
    bands: [
      [0.07, GOLD],
      [0.38, BOW_G],
      [0.44, GOLD],
      [0.56, LEATHER],
      [0.62, GOLD],
      [0.93, BOW_G],
      [1, GOLD],
    ],
  });
  const thorn = () => new THREE.OctahedronGeometry(0.014, 0);
  for (const [from, to] of [
    [0.08, 0.4],
    [0.6, 0.92],
  ] as const)
    b.along(bow, 5, (at) => b.stick(thorn(), GOLD, at, { scale: [0.6, 1.4, 0.6] }), { from, to });
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), GEM, { at: [BOWX, 0.99, 0.168], bone: wristL }), 1.4);
  b.part(new THREE.OctahedronGeometry(0.022, 0), GOLD, { at: [BOWX, 0.99, 0.166], scale: [0.7, 1.3, 0.5], bone: wristL });
  b.rod([BOWX, 1.68, -0.02], [BOWX, 0.12, -0.02], 0.0025, STRING, { bone: wristL, sides: 4 });

  return b.root;
}
