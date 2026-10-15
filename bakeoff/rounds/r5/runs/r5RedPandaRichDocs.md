```ts
import * as THREE from "three";
import { createBuilder, limb, catmull, bezier, mottle, countershade, gradient, paint, noise, svg } from "agentic-3js-builder";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "Stylized, Genshin-flavoured red panda balancing on a mossy boulder, one paw raised and ringed tail arched for balance. Gold-and-Dendro Vision pendant, teal ribbon, floating leaves and sparkles, glowing rune stone, mushrooms and flowers.",
};

const DEG = Math.PI / 180;
const FLOOR = 0.318; // top of the stone

// palette
const RED = "#cf5a24";
const RED_L = "#ea8438";
const RUST_D = "#a8441c";
const BELLY = "#3b211b";
const DARK = "#2a1814";
const TOE = "#4d2e25";
const CREAM = "#fbf0dc";
const NOSE = "#1d1214";
const TEAR = "#8a3a1e";
const GOLD = "#f2c455";
const GOLD_D = "#c48d2a";
const GEM = "#7fe04e";
const GEM_L = "#dcffa8";
const RIBBON = "#3fae86";
const MOSS = "#5b9c3a";
const MOSS_L = "#8cc650";
const MOSS_D = "#3f7a2c";
const STONE = "#8e969b";
const STONE_D = "#69727a";
const GRASS = "#6fb844";
const GRASS_L = "#9bd35a";
const CAP = "#e5574a";
const WHITE = "#ffffff";
const FLOWER_C = "#ffc940";
const TAIL_A = "#d2602a";
const TAIL_B = "#f1a465";

type V3 = [number, number, number];

const makeRand = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const sph = (rx: number, ry: number, rz: number, ws = 10, hs = 7) =>
  new THREE.SphereGeometry(1, ws, hs).scale(rx, ry, rz);

export default function build() {
  const b = createBuilder({ name: "redPandaMossyStone" });
  const rand = makeRand(17);

  // ------------------------------------------------------------ skeleton roots
  const root = b.joint("root", { at: [0, FLOOR, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.54, -0.17], dir: [0, 0.1, 1], role: "spine" });

  // ------------------------------------------------------------ paints
  const bodyPaint = countershade(mottle(RED, RED_L, { size: 0.1, seed: 2 }), BELLY, { level: -0.25, soft: 0.25 });
  const headPaint = countershade(mottle(RED, RED_L, { size: 0.08, seed: 5 }), CREAM, { level: -0.35, soft: 0.2 });
  const mossP = mottle(MOSS, MOSS_L, { size: 0.09, seed: 4 });
  const rockP = mottle(STONE, STONE_D, { size: 0.14, seed: 7 });
  const rockPaint = paint((p, n, _s) => {
    const wob = noise(p, 0.18, 11);
    const score = n.y * 0.9 + (p.y / FLOOR) * 0.5 + (wob - 0.5) * 0.8;
    return score > 0.85 ? mossP : rockP;
  });
  const groundPaint = mottle(GRASS, MOSS, { size: 0.12, seed: 3 });
  const tailCol = (t: number) => (t > 0.9 ? DARK : Math.floor(t * 9) % 2 === 0 ? TAIL_A : TAIL_B);
  const tailPaint = paint((_p, _n, s) => tailCol(s[0]));

  // ------------------------------------------------------------ ground + stone
  b.lathe(
    [
      [0, 0],
      [0.62, 0],
      [0.64, 0.015],
      [0.56, 0.045],
      [0.42, 0.055],
      [0, 0.055],
    ],
    { at: [0, 0, 0], segments: 11, color: groundPaint, bone: root, name: "ground" },
  );

  const stone = b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.4, 0.03],
      [0.43, 0.1],
      [0.38, 0.18],
      [0.4, 0.25],
      [0.36, 0.298],
      [0.26, FLOOR],
      [0, FLOOR],
    ],
    { at: [0, 0, 0], segments: 9, color: rockPaint, bone: root, name: "stone" },
  );

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + 0.25;
    const rad = 0.4 + rand() * 0.04;
    const size = 0.1 + rand() * 0.07;
    const y = 0.07 + rand() * 0.1;
    b.part(new THREE.DodecahedronGeometry(size, 0).scale(1, 0.8, 1), rockPaint, {
      bone: root,
      at: [Math.sin(a) * rad, y, Math.cos(a) * rad],
      rotation: [rand() * 60, rand() * 360, rand() * 60],
      flat: true,
      name: `rock${i}`,
    });
  }

  // moss cushions along the rim and dripping moss
  for (let i = 0; i < 9; i++) {
    const a = (i * Math.PI * 2) / 9 + 0.5;
    const rad = 0.31 + rand() * 0.03;
    const k = 0.05 + rand() * 0.035;
    b.part(sph(k, k * 0.55, k), i % 2 ? MOSS_L : MOSS, {
      bone: root,
      at: [Math.sin(a) * rad, FLOOR - 0.004, Math.cos(a) * rad],
      flat: true,
      name: `mossClump${i}`,
    });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + 0.1;
    b.spike([Math.sin(a) * 0.38, 0.285, Math.cos(a) * 0.38], [Math.sin(a) * 0.2, -1, Math.cos(a) * 0.2], 0.07 + rand() * 0.04, 0.02, {
      color: MOSS_D,
      bone: root,
      sides: 5,
    });
  }

  // glowing Dendro rune on the stone's front
  const rune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#a6ff72" stroke-width="3"/>
      <circle cx="32" cy="32" r="21" fill="none" stroke="#a6ff72" stroke-width="2.2"/>
      <path d="M32 12 C44 24 44 40 32 52 C20 40 20 24 32 12 Z" fill="none" stroke="#d9ffb4" stroke-width="3"/>
      <path d="M32 18 L32 48" stroke="#d9ffb4" stroke-width="2.6" fill="none"/>
      <path d="M32 29 L24 23 M32 35 L40 29 M32 42 L25 37" stroke="#d9ffb4" stroke-width="2.6" fill="none"/>
      <circle cx="32" cy="3.5" r="2.6" fill="#d9ffb4"/><circle cx="32" cy="60.5" r="2.6" fill="#d9ffb4"/>
      <circle cx="3.5" cy="32" r="2.6" fill="#d9ffb4"/><circle cx="60.5" cy="32" r="2.6" fill="#d9ffb4"/>
    </svg>`,
    { size: 256 },
  );
  b.decal(stone, rune, { at: [0, 0.17, 0.42], dir: [0, 0, 1], size: [0.17, 0.17], bone: root, name: "rune" });

  // ------------------------------------------------------------ panda: spine & body
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.54, -0.17],
      [0, 0.555, -0.06],
      [0, 0.57, 0.05],
      [0, 0.58, 0.15],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const body = b.sweep(
    spine,
    (t: number): [number, number] => {
      const s = Math.sin(Math.PI * t);
      return [0.1 + 0.035 * s, 0.095 + 0.035 * s];
    },
    { color: bodyPaint, name: "torso" },
  );
  const chestJ = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.58, 0.15],
      [0, 0.635, 0.22],
      [0, 0.67, 0.285],
    ]),
    { parent: chestJ, names: ["neck1", "neck2"], role: "neck" },
  );
  const neckTube = b.sweep(neck, [0.092, 0.085], { color: bodyPaint, name: "neckTube" });

  // ------------------------------------------------------------ head
  const HY = 0.67;
  const HZ = 0.285;
  const hp = (x: number, y: number, z: number): V3 => [x, HY + y, HZ + z];
  const head = b.joint("head", { parent: neck.joints[1], at: [0, HY, HZ], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.045, 0.06), aim: hp(0, -0.05, 0.17), role: "jaw" });

  const skull = b.part(sph(0.115, 0.095, 0.1, 12, 9), headPaint, { bone: head, at: hp(0, 0.005, 0.03), flat: true, name: "skull" });
  b.part(sph(0.036, 0.02, 0.045, 8, 6), CREAM, { bone: jaw, at: hp(0, -0.062, 0.1), flat: true, name: "chin" });
  const muzzle = b.part(sph(0.05, 0.04, 0.055, 9, 6), CREAM, { bone: head, at: hp(0, -0.025, 0.115), flat: true, name: "muzzle" });
  b.part(sph(0.02, 0.014, 0.016, 7, 5), NOSE, { bone: head, at: hp(0, -0.01, 0.168), flat: true, name: "nose" });
  b.part(new THREE.SphereGeometry(0.0045, 5, 4), WHITE, { bone: head, at: hp(-0.006, -0.0025, 0.182), name: "noseShine" });

  const cheeks: ReturnType<typeof b.part>[] = [];
  for (const s of [1, -1]) {
    cheeks.push(b.part(sph(0.05, 0.04, 0.055, 8, 6), CREAM, { bone: head, at: hp(s * 0.085, -0.035, 0.045), flat: true, name: "cheek" }));
    const tufts: [V3, V3][] = [
      [hp(s * 0.1, -0.01, 0.05), [s, 0.1, -0.2]],
      [hp(s * 0.1, -0.04, 0.04), [s, -0.15, -0.4]],
      [hp(s * 0.085, -0.06, 0.035), [s * 0.7, -0.5, -0.4]],
      [hp(s * 0.07, -0.07, 0.05), [s * 0.4, -0.7, -0.2]],
    ];
    for (const [base, dir] of tufts) b.spike(base, dir, 0.05, 0.02, { color: CREAM, bone: head, sides: 5 });

    // ears
    const ang = 22 * DEG * 1;
    const ex: V3 = [Math.cos(ang), -s * Math.sin(ang), 0];
    const ey: V3 = [s * Math.sin(ang), Math.cos(ang), 0];
    b.extrude(
      [
        [-0.048, -0.01],
        [0.048, -0.01],
        [0.044, 0.04],
        [0, 0.09, "sharp"],
        [-0.044, 0.04],
      ],
      { at: hp(s * 0.072, 0.066, 0.02), x: ex, y: ey, thickness: 0.02, bevel: 0.004, smoothing: 1, color: RUST_D, bone: head, name: "ear" },
    );
    b.extrude(
      [
        [-0.03, 0.0],
        [0.03, 0.0],
        [0.026, 0.035],
        [0, 0.068, "sharp"],
        [-0.026, 0.035],
      ],
      { at: hp(s * 0.072, 0.066, 0.028), x: ex, y: ey, thickness: 0.012, bevel: 0.003, smoothing: 1, color: CREAM, bone: head, name: "earInner" },
    );

    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod(hp(s * 0.04, -0.025, 0.14), hp(s * 0.15, -0.035 + k * 0.02, 0.125), 0.0025, WHITE, { bone: head });
    }
  }

  // eyes: big anime decals
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72">
      <ellipse cx="32" cy="36" rx="28" ry="34" fill="#25120f"/>
      <ellipse cx="32" cy="38" rx="22" ry="28" fill="#d8731c"/>
      <ellipse cx="32" cy="52" rx="17" ry="12" fill="#ffd25a"/>
      <ellipse cx="32" cy="38" rx="10" ry="16" fill="#2a120d"/>
      <circle cx="22" cy="21" r="8" fill="#ffffff"/>
      <circle cx="42" cy="53" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skullSurf.around(skull.at).at(s * 34, 4);
    if (eyeHit) {
      b.decal(skull, eyeTex, { at: eyeHit.at, dir: [s * 0.3, 0.05, 1], size: [0.05, 0.056], lift: 0.002, bone: head, name: "eye" });
    }
    const brow = skullSurf.around(skull.at).at(s * 32, 26);
    if (brow) b.stick(sph(0.017, 0.01, 0.014, 6, 4), CREAM, brow, { embed: 0.4 });
  }

  // tear marks and mouth, draped on the face
  const faceSurf = b.surface([skull, ...cheeks, muzzle]);
  for (const s of [1, -1]) {
    const tear = faceSurf.drape(
      catmull([hp(s * 0.052, -0.012, 0.118), hp(s * 0.06, -0.033, 0.12), hp(s * 0.052, -0.052, 0.128)]),
      { lift: 0.002 },
    );
    b.sweep(tear, [0.008, 0.003], { color: TEAR, bone: head });
  }
  const mSurf = b.surface(muzzle);
  b.sweep(mSurf.drape(catmull([hp(0, -0.022, 0.168), hp(0, -0.04, 0.158)]), { lift: 0.002 }), 0.0032, { color: NOSE, bone: head });
  for (const s of [1, -1]) {
    b.sweep(mSurf.drape(catmull([hp(0, -0.04, 0.158), hp(s * 0.022, -0.05, 0.15), hp(s * 0.045, -0.043, 0.13)]), { lift: 0.002 }), 0.0032, {
      color: NOSE,
      bone: head,
    });
  }

  // ahoge + dendro hairpin
  b.sweep(bezier(hp(0, 0.085, 0.03), hp(0, 0.14, 0.03), hp(0.015, 0.16, 0.08), hp(0.045, 0.15, 0.115)), [0.014, 0.002], {
    color: RED_L,
    bone: head,
    caps: { start: "none", end: "point" },
    sides: 6,
  });
  const pin = skullSurf.around(skull.at).at(30, 52);
  if (pin) {
    b.ring(pin, { count: 5, radius: 0.012, tilt: 65 }, (it) => b.spike(it, it, 0.03, 0.01, { color: GOLD, sides: 4 }));
    b.stick(new THREE.OctahedronGeometry(0.014, 0), GEM, pin, { embed: 0.1 });
  }

  // neck ruff
  b.ring(neck.at(0.42), { count: 10, radius: 0.085, tilt: -40 }, (it) => b.spike(it, it, 0.05, 0.02, { color: CREAM, sides: 5 }));

  // ------------------------------------------------------------ ribbon, strap, vision pendant
  for (const s of [1, -1]) {
    b.sweep(bezier([0, 0.69, 0.175], [s * 0.04, 0.75, 0.1], [s * 0.09, 0.73, -0.02], [s * 0.12, 0.78, -0.12]), (t: number): [number, number] => [0.022 - 0.01 * t, 0.004], {
      section: "box",
      caps: "flat",
      color: RIBBON,
      bands: [
        [0.82, RIBBON],
        [1, GOLD],
      ],
      bone: chestJ,
      name: "ribbon",
    });
  }
  b.part(new THREE.SphereGeometry(0.018, 7, 5), GOLD, { bone: chestJ, at: [0, 0.69, 0.175], flat: true, name: "ribbonKnot" });

  const strapSurf = b.surface([body, neckTube]);
  const strap = strapSurf.drape(
    catmull(
      [
        [0, 0.68, 0.19],
        [0.075, 0.66, 0.2],
        [0.11, 0.6, 0.21],
        [0.07, 0.55, 0.24],
        [0, 0.535, 0.25],
        [-0.07, 0.55, 0.24],
        [-0.11, 0.6, 0.21],
        [-0.075, 0.66, 0.2],
      ],
      { closed: true },
    ),
    { lift: 0.008 },
  );
  b.sweep(strap, 0.011, { color: RIBBON });

  const PX = 0;
  const PY = 0.465;
  const PZ = 0.258;
  b.extrude(
    [
      [0, 0.055, "sharp"],
      [0.018, 0.022],
      [0.04, 0.0, "sharp"],
      [0.018, -0.022],
      [0, -0.05, "sharp"],
      [-0.018, -0.022],
      [-0.04, 0.0, "sharp"],
      [-0.018, 0.022],
    ],
    { at: [PX, PY, PZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.002, color: GOLD, bone: chestJ, name: "visionFrame" },
  );
  b.extrude(
    [
      [0, 0.032, "sharp"],
      [0.02, 0, "sharp"],
      [0, -0.032, "sharp"],
      [-0.02, 0, "sharp"],
    ],
    { at: [PX, PY, PZ + 0.006], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: GEM, bone: chestJ, name: "visionGem" },
  );
  b.part(new THREE.SphereGeometry(0.005, 5, 4), WHITE, { bone: chestJ, at: [PX - 0.006, PY + 0.009, PZ + 0.014] });
  b.part(new THREE.TorusGeometry(0.012, 0.003, 5, 8), GOLD_D, { bone: chestJ, at: [PX, PY + 0.067, PZ], name: "visionHoop" });

  // ------------------------------------------------------------ legs
  const addPaw = (bone: ReturnType<typeof b.joint>, c: V3, rx: number, ry: number, rz: number, tiltDeg: number, toeZ: number) => {
    b.part(sph(rx, ry, rz, 8, 6), DARK, { bone, at: c, rotation: [tiltDeg, 0, 0], flat: true, name: "paw" });
    const axisX = new THREE.Vector3(1, 0, 0);
    for (const dx of [-1, 0, 1]) {
      const o = new THREE.Vector3(dx * rx * 0.5, -ry * 0.1, toeZ).applyAxisAngle(axisX, tiltDeg * DEG);
      b.part(new THREE.SphereGeometry(rx * 0.36, 6, 4), TOE, { bone, at: [c[0] + o.x, c[1] + o.y, c[2] + o.z], flat: true, name: "toe" });
    }
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // hind leg
    const hipP: V3 = [s * 0.09, 0.52, -0.15];
    const ankP: V3 = [s * 0.1, FLOOR + 0.035, -0.18];
    const hindPts = limb(hipP, ankP, [0.11, 0.105], [0, 0, 1]);
    const hind = b.chain(`leg${sd}`, hindPts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [ankP[0], FLOOR, ankP[2] + 0.03],
    });
    b.sweep(hind, [0.058, 0.04], { color: gradient(bodyPaint, DARK, hindPts[0], hindPts[1]), name: "hindLeg" });
    b.part(sph(0.075, 0.085, 0.1, 9, 6), bodyPaint, { bone: hind.joints[0], at: [s * 0.1, 0.52, -0.16], flat: true, name: "haunch" });
    const ankJ = hind.tip ?? hind.joints[hind.joints.length - 1];
    addPaw(ankJ, [ankP[0], FLOOR + 0.014, ankP[2] + 0.035], 0.036, 0.022, 0.055, 0, 0.08);

    // front leg (left one lifted to balance)
    const lifted = s > 0;
    const shP: V3 = [s * 0.09, 0.52, 0.14];
    const wrP: V3 = lifted ? [0.105, 0.47, 0.28] : [s * 0.095, FLOOR + 0.035, 0.17];
    const armPts = limb(shP, wrP, [0.1, 0.095], lifted ? [0, -1, 0] : [0, 0, -1]);
    const arm = b.chain(`arm${sd}`, armPts, {
      parent: chestJ,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    b.sweep(arm, [0.052, 0.036], { color: gradient(bodyPaint, DARK, armPts[0], armPts[1]), name: "foreLeg" });
    b.part(sph(0.065, 0.07, 0.075, 9, 6), bodyPaint, { bone: arm.joints[0], at: [s * 0.09, 0.53, 0.13], flat: true, name: "shoulderMass" });
    const wrJ = arm.tip ?? arm.joints[arm.joints.length - 1];
    if (lifted) addPaw(wrJ, [wrP[0], wrP[1] - 0.02, wrP[2] + 0.025], 0.036, 0.024, 0.05, 30, 0.05);
    else addPaw(wrJ, [wrP[0], FLOOR + 0.014, wrP[2] + 0.025], 0.036, 0.024, 0.05, 0, 0.05);
  }

  // ------------------------------------------------------------ tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.56, -0.22],
      [0, 0.57, -0.38],
      [0.05, 0.64, -0.52],
      [0.1, 0.79, -0.57],
      [0.07, 0.93, -0.5],
      [0.0, 1.0, -0.38],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.05, 0.07, 0.085, 0.09, 0.08, 0.04], { color: tailPaint, name: "tailTube" });
  for (let t = 0.1; t < 0.93; t += 0.07) {
    const off = Math.round((t - 0.1) / 0.07) % 2 ? 45 : 0;
    for (let k = 0; k < 4; k++) {
      const pt = tailTube.at(t, off + k * 90);
      b.spike(pt, pt, 0.042, 0.017, { color: tailCol(t), sides: 5 });
    }
  }

  // ------------------------------------------------------------ floating dendro leaves and sparkles
  const leaf = (at: V3, tilt: number, yaw: number, k: number, col: string) => {
    const rot = (v: THREE.Vector3) => v.applyAxisAngle(new THREE.Vector3(0, 0, 1), tilt * DEG).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw * DEG);
    const x = rot(new THREE.Vector3(1, 0, 0));
    const y = rot(new THREE.Vector3(0, 1, 0));
    b.extrude(
      [
        [0, 0],
        [0.03 * k, 0.03 * k],
        [0.024 * k, 0.072 * k],
        [0, 0.115 * k, "sharp"],
        [-0.024 * k, 0.072 * k],
        [-0.03 * k, 0.03 * k],
      ],
      { at, x: x.toArray(), y: y.toArray(), thickness: 0.006, bevel: 0.002, smoothing: 1, color: col, bone: root, name: "floatLeaf" },
    );
  };
  const leaves: [V3, number, number, number, string][] = [
    [[0.3, 0.66, 0.3], 20, 40, 1.0, GEM],
    [[0.38, 0.8, 0.1], -30, 120, 0.8, MOSS_L],
    [[0.25, 1.0, -0.5], 15, 200, 1.1, GRASS_L],
    [[-0.3, 0.9, -0.4], -20, 280, 0.9, GEM],
    [[-0.34, 0.72, 0.28], 25, 310, 0.8, MOSS_L],
    [[-0.22, 1.05, -0.12], 40, 70, 0.7, GRASS_L],
  ];
  for (const [at, tilt, yaw, k, col] of leaves) leaf(at, tilt, yaw, k, col);

  const sparkle = (at: V3, k: number) => {
    b.extrude(
      [
        [0, 0.03 * k, "sharp"],
        [0.006 * k, 0.006 * k],
        [0.03 * k, 0, "sharp"],
        [0.006 * k, -0.006 * k],
        [0, -0.03 * k, "sharp"],
        [-0.006 * k, -0.006 * k],
        [-0.03 * k, 0, "sharp"],
        [-0.006 * k, 0.006 * k],
      ],
      { at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.004, color: GEM_L, bone: root, name: "sparkle" },
    );
  };
  const sparks: [V3, number][] = [
    [[0.18, 0.62, 0.38], 1.0],
    [[0.42, 0.7, 0.2], 0.7],
    [[-0.28, 0.78, 0.18], 0.9],
    [[0.3, 0.95, -0.3], 0.8],
    [[-0.15, 0.95, -0.55], 0.7],
    [[0.0, 0.45, 0.4], 0.6],
  ];
  for (const [at, k] of sparks) sparkle(at, k);

  // ------------------------------------------------------------ scenery: grass, mushrooms, flowers
  for (let c = 0; c < 14; c++) {
    const a = (c / 14) * Math.PI * 2 + rand() * 0.3;
    const rad = 0.47 + rand() * 0.12;
    const cx = Math.sin(a) * rad;
    const cz = Math.cos(a) * rad;
    for (let k = 0; k < 4; k++) {
      const ka = (k / 4) * Math.PI * 2 + rand();
      b.spike(
        [cx + Math.cos(ka) * 0.014, 0.045, cz + Math.sin(ka) * 0.014],
        [Math.cos(ka) * 0.35, 1, Math.sin(ka) * 0.35],
        0.07 + rand() * 0.06,
        0.011,
        { color: (c + k) % 2 ? GRASS : GRASS_L, bone: root, sides: 4 },
      );
    }
  }

  const mushroom = (x: number, z: number, sc: number) => {
    b.rod([x, 0.045, z], [x, 0.045 + 0.05 * sc, z], 0.012 * sc, CREAM, { bone: root, sides: 6 });
    const y0 = 0.045 + 0.045 * sc;
    b.lathe(
      [
        [0, 0],
        [0.04 * sc, 0],
        [0.062 * sc, 0.012 * sc],
        [0.055 * sc, 0.035 * sc],
        [0.03 * sc, 0.055 * sc],
        [0, 0.062 * sc],
      ],
      { at: [x, y0, z], segments: 8, color: CAP, bone: root, name: "mushroomCap" },
    );
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6 + 0.4;
      b.part(new THREE.SphereGeometry(0.008 * sc, 5, 4), WHITE, {
        bone: root,
        at: [x + Math.cos(a) * 0.036 * sc, y0 + 0.045 * sc, z + Math.sin(a) * 0.036 * sc],
        flat: true,
      });
    }
  };
  mushroom(0.5, 0.26, 1.1);
  mushroom(0.44, 0.38, 0.75);
  mushroom(-0.52, 0.12, 0.9);

  const flower = (x: number, z: number) => {
    b.rod([x, 0.045, z], [x, 0.1, z], 0.0035, GRASS, { bone: root, sides: 4 });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.part(sph(0.012, 0.004, 0.008, 5, 4), CREAM, {
        bone: root,
        at: [x + Math.sin(a) * 0.014, 0.1, z + Math.cos(a) * 0.014],
        rotation: [0, a / DEG, 0],
        flat: true,
      });
    }
    b.part(new THREE.SphereGeometry(0.007, 5, 4), FLOWER_C, { bone: root, at: [x, 0.103, z], flat: true });
  };
  flower(-0.3, 0.5);
  flower(-0.48, -0.25);
  flower(0.25, -0.52);
  flower(0.1, 0.56);

  return b.root;
}
```