import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { cells, noise } from "../../../../src/paint";
import { arc, catmull } from "../../../../src/path";
import { cellPaint, pixelArt, pixelTexture, stepped } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Stand",
  description:
    "A pixel-art koala sitting in the crook of a eucalyptus branch, back against the trunk, hands wrapped round the bark and feet clasping the limb, on a turfed stone stand.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.016;
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Palette (ramps run dark to light)
const FUR = ["#3d4048", "#565a63", "#70757f", "#8e949c", "#adb2b8", "#c9ccce"];
const FUR_DARK = ["#33363d", "#464a52", "#5c616a", "#737982", "#8e949c"];
const BELLY = ["#a39e91", "#c2bdae", "#dcd8c9", "#eeebe0", "#f8f6ee"];
const WHITE = ["#cfcabb", "#e4e0d2", "#f2efe5", "#fdfcf7"];
const RUMP = ["#5f5047", "#7a675c", "#94806f", "#aa9784"];
const NOSE = ["#0b0b10", "#17171e", "#2a2a35", "#4a4a58"];
const CLAW = "#e0d6b8";
const CLAW_DARK = "#8a7d62";
const PAD = "#4b4650";
const BARK_TAN = ["#4a4538", "#6a6452", "#8d8670", "#b1a98e", "#d3ccb0", "#e6dfc7"];
const BARK_GREEN = ["#464c38", "#626a4c", "#818a68", "#a0aa84", "#bfc8a2"];
const BARK_PINK = ["#5e4338", "#7e5b4c", "#a07766", "#c39a86", "#dcb9a4"];
const MOSS = ["#1f3d1a", "#2f5a24", "#437c30", "#5f9f3f", "#85c24f"];
const DIRT = ["#3b2a20", "#523b2c", "#6c4e3a", "#876549"];
const STONE = ["#4a4d55", "#686c75", "#868b94", "#a5aab2", "#c3c7cc"];

export default function build() {
  const b = createBuilder({ name: "koalaSonnet", paintSize: 2048 });
  const R = rng(11);

  // =============================================================================================================
  // Skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.66, 0.09], dir: [0, 1, 0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, 0.09],
      [0, 0.74, 0.105],
      [0, 0.82, 0.125],
      [0, 0.9, 0.15],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.joint("neck", {
    parent: spine.joints[2],
    at: [0, 0.9, 0.15],
    aim: [0, 0.96, 0.17],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 0.93, 0.16], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.12, up: -0.02 }),
    aim: head.local({ forward: 0.3, up: -0.025 }),
    role: "jaw",
  });

  // =============================================================================================================
  // The stand: stone plinth, trunk, limbs
  const trunkX = (y: number) => -0.012 * y * y;
  const trunkZ = (y: number) => -0.15 + 0.012 * y * y;
  const trunkR = (y: number) => 0.1 - 0.035 * y;
  const trunkAt = (y: number) => V(trunkX(y), y, trunkZ(y));

  const barkPaint = cellPaint(TEXEL, (c) => {
    const q = V(c.at.x * 2.6, c.at.y * 0.4, c.at.z * 2.6);
    const tone = noise(c.at, 0.22, 4);
    const ramp = tone > 0.62 ? BARK_GREEN : tone < 0.34 ? BARK_PINK : BARK_TAN;
    const streak = (hash(c.u * 5.1 + c.axis * 2.3 + c.depth * 1.7) - 0.5) * 0.38;
    let v = 0.2 + 0.85 * (noise(q, 0.09, 2) - 0.2) + streak;
    const w = cells(q, 0.2, 5);
    if (w.d2 - w.d1 < 0.08) v -= 0.3; // peel lines
    if (c.random(4) < 0.05) v -= 0.25;
    return c.pick(ramp, v);
  });
  const barkDark = cellPaint(TEXEL * 0.75, (c) => c.pick(BARK_TAN, 0.15 + 0.2 * c.random(2)));

  const baseOutline: [number, number][] = [
    [0, 0],
    [0.66, 0],
    [0.66, 0.07],
    [0.58, 0.07],
    [0.58, 0.15],
    [0, 0.15],
  ];
  const plinthPaint = cellPaint(TEXEL, (c) => {
    const topY = c.at.y;
    if (c.n.y > 0.7) {
      // grass tops
      const r = Math.hypot(c.at.x, c.at.z);
      if (topY > 0.1) {
        const v = 0.5 + 0.9 * (noise(c.at, 0.12, 8) - 0.5) + 0.12 * (c.random(3) - 0.5);
        if (r > 0.52 && c.random(9) < 0.45) return c.pick(DIRT, 0.7);
        return c.pick(MOSS, v);
      }
      // stone ledge
      return c.pick(STONE, 0.45 + 0.8 * (noise(c.at, 0.1, 3) - 0.5));
    }
    if (topY > 0.15 - 0.025 - 0.035 * noise(c.at, 0.06, 1) && c.n.y > -0.3 && Math.hypot(c.at.x, c.at.z) < 0.6) {
      return c.pick(MOSS, 0.55 + 0.4 * c.random(2));
    }
    if (topY > 0.07 && topY < 0.15) {
      const v = 0.5 + 0.7 * (noise(c.at, 0.07, 6) - 0.5);
      return c.pick(DIRT, v - 0.15 * (c.random(5) < 0.1 ? 1 : 0));
    }
    const w = cells(c.at, 0.13, 2);
    if (w.d2 - w.d1 < 0.09) return STONE[0];
    return c.pick(STONE, 0.35 + 0.55 * w.id + 0.25 * (noise(c.at, 0.06, 7) - 0.5) + 0.2 * c.n.y);
  });
  b.lathe(baseOutline, { at: [0, 0, 0], bone: root, color: plinthPaint, segments: 16, name: "plinth" });

  const trunkPts = [0.1, 0.4, 0.7, 1.0, 1.3, 1.6, 1.92].map((y) => trunkAt(y));
  const trunkPath = catmull(trunkPts);
  const trunk = b.sweep(trunkPath, (t) => trunkR(0.1 + 1.82 * t), {
    bone: root,
    color: barkPaint,
    sides: 10,
    caps: "round",
    name: "trunk",
  });

  // seat limb: sticks out from the trunk, forward and slightly up
  const seatPath = catmull([
    trunkAt(0.4).toArray(),
    [0, 0.47, 0.09],
    [0, 0.55, 0.32],
    [0, 0.64, 0.58],
    [0.02, 0.71, 0.76],
  ]);
  const seat = b.sweep(seatPath, [0.058, 0.026], { bone: root, color: barkPaint, sides: 8, name: "seatLimb" });

  const limbDefs: [string, number[][], [number, number]][] = [
    [
      "limbA",
      [
        trunkAt(1.2).toArray(),
        [0.12, 1.38, -0.12],
        [0.3, 1.58, -0.07],
        [0.45, 1.76, -0.02],
        [0.54, 1.96, 0.02],
      ],
      [0.042, 0.011],
    ],
    [
      "limbB",
      [
        trunkAt(1.55).toArray(),
        [-0.14, 1.7, -0.12],
        [-0.27, 1.88, -0.1],
        [-0.35, 2.08, -0.05],
      ],
      [0.032, 0.01],
    ],
    [
      "limbC",
      [
        trunkAt(0.98).toArray(),
        [-0.16, 1.06, -0.1],
        [-0.34, 1.12, 0.0],
        [-0.5, 1.04, 0.12],
      ],
      [0.04, 0.011],
    ],
  ];
  const limbs = limbDefs.map(([name, pts, rad]) =>
    b.sweep(catmull(pts), rad, { bone: root, color: barkPaint, sides: 8, name }),
  );
  const [limbA, limbB, limbC] = limbs;

  // twig stubs on the seat limb and trunk
  for (const [t, ang, len] of [
    [0.5, 140, 0.16],
    [0.72, -120, 0.14],
  ] as const) {
    const p = seat.at(t, ang);
    b.spike(p, p, len, 0.014, { color: barkDark, bone: root, sides: 5 });
  }

  // knots and a dark hollow on the trunk
  for (const [y, ang, r] of [
    [1.12, 160, 0.028],
    [0.3, -140, 0.03],
    [1.45, 120, 0.02],
  ] as const) {
    const p = trunk.at((y - 0.1) / 1.82, ang);
    b.stick(new THREE.SphereGeometry(r, 7, 5), barkDark, p, { embed: 0.45, scale: [1, 0.55, 1], bone: root });
  }
  {
    const p = trunk.at((0.62 - 0.1) / 1.82, -150);
    const hole = cellPaint(0.008, (c) => {
      const d = Math.hypot(c.at.x - p.at.x, (c.at.y - p.at.y) * 0.7);
      return d < 0.015 ? "#14100d" : "#3a2f24";
    });
    b.stick(new THREE.SphereGeometry(0.032, 8, 5), hole, p, { embed: 0.5, scale: [0.8, 1.25, 0.6], bone: root });
  }

  // ---- peeling bark strips
  const BARK_STRIP = pixelArt(
    ["bbb", "bcb", "bcb", "bcb", "bdb", "bdb", "bcb", "bcb", "bdb", "ecb", "eeb", ".eb", ".e.", ".e."],
    { b: "#8f8668", c: "#c9c0a2", d: "#b7ad8f", e: "#d9d1b6" },
  );
  b.cards(
    [0.2, 0.34, 0.47, 0.58, 0.7, 0.8].flatMap((t, i) => [trunk.at(t, -70 + i * 55), trunk.at(t + 0.04, 110 + i * 40)]),
    BARK_STRIP,
    { size: [0.048, 0.2], lean: 72, flow: [0, -1, 0], bend: 20, vary: 0.25, rng: R, bone: root },
  );

  // ---- leaves, blossoms and gumnuts
  const leafTex = (dark: string, mid: string, light: string, rib: string) =>
    pixelTexture(6, 16, (g) => {
      for (let y = 0; y < 16; y++) {
        const hw = Math.round(2.7 * Math.pow(Math.sin((Math.PI * (y + 0.6)) / 16.4), 0.75));
        const shift = Math.round(Math.sin((y / 16) * Math.PI) * 0.4);
        for (let x = -hw; x < hw; x++) {
          const px = 3 + x + shift;
          g.set(px, 15 - y, x < 0 ? (y % 5 === 2 ? mid : dark) : y % 4 === 1 ? light : mid);
        }
        if (hw > 0) g.set(3 + shift, 15 - y, rib);
      }
    });
  const LEAF_A = leafTex("#2d6a5c", "#4b9488", "#79b8a5", "#a6d6c0");
  const LEAF_B = leafTex("#3a6b4a", "#5c9a68", "#8ec286", "#bde0a6");
  const LEAF_C = leafTex("#2a5f64", "#44888f", "#6fb3b0", "#a0d4cc");
  const leafOpts = (flow: [number, number, number]) => ({
    size: [0.075, 0.21] as [number, number],
    lean: 62,
    flow,
    bend: 30,
    vary: 0.3,
    spin: 20,
    rng: R,
    bone: root,
  });
  const leafFrames = (sw: typeof seat, from: number, to: number, n: number, bias = 0) =>
    Array.from({ length: n }, (_, i) => {
      const t = from + ((to - from) * (i + 0.5)) / n;
      return sw.at(t, bias + (i % 2 ? 1 : -1) * (40 + 90 * R()) + 360 * Math.floor(i / 2) * 0.17);
    });
  const leaves = [
    { sw: limbA, f: leafFrames(limbA, 0.35, 1, 18), flow: [0.2, -1, 0.1] as [number, number, number] },
    { sw: limbB, f: leafFrames(limbB, 0.3, 1, 14), flow: [-0.2, -1, 0.1] as [number, number, number] },
    { sw: limbC, f: leafFrames(limbC, 0.3, 1, 14), flow: [-0.3, -1, 0.3] as [number, number, number] },
    { sw: seat, f: leafFrames(seat, 0.78, 1, 8), flow: [0, -1, 0.3] as [number, number, number] },
    { sw: trunk, f: leafFrames(trunk, 0.86, 1, 10), flow: [0, -1, 0.2] as [number, number, number] },
  ];
  for (const set of leaves) b.cards(set.f, [LEAF_A, LEAF_B, LEAF_C, LEAF_A], leafOpts(set.flow));

  // gumnuts and blossoms
  const nutGeos: THREE.BufferGeometry[] = [];
  const nutCapGeos: THREE.BufferGeometry[] = [];
  const blossomGeos: THREE.BufferGeometry[] = [];
  const stamenGeos: THREE.BufferGeometry[] = [];
  for (const [sw, t, ang] of [
    [limbA, 0.55, 20],
    [limbA, 0.58, -150],
    [limbA, 0.82, 170],
    [limbB, 0.55, 30],
    [limbC, 0.5, 180],
    [limbC, 0.52, 20],
    [limbC, 0.8, -170],
    [seat, 0.88, 160],
    [trunk, 0.9, 150],
  ] as [typeof seat, number, number][]) {
    const p = sw.at(t, ang);
    const pos = p.at.clone().addScaledVector(p.n, 0.012);
    nutGeos.push(new THREE.SphereGeometry(0.017, 6, 4).translate(pos.x, pos.y, pos.z));
    const cap = pos.clone().addScaledVector(p.n, 0.014);
    nutCapGeos.push(new THREE.CylinderGeometry(0.008, 0.012, 0.008, 6).translate(cap.x, cap.y, cap.z));
  }
  for (const [sw, t, ang] of [
    [limbB, 0.9, 0],
    [limbB, 0.72, 100],
    [limbB, 0.8, -90],
    [limbA, 0.93, 60],
    [limbA, 0.7, -60],
    [limbC, 0.92, 90],
  ] as [typeof seat, number, number][]) {
    const p = sw.at(t, ang);
    const pos = p.at.clone().addScaledVector(p.n, 0.03);
    blossomGeos.push(new THREE.SphereGeometry(0.03, 7, 5).translate(pos.x, pos.y, pos.z));
    for (let k = 0; k < 5; k++) {
      const d = V(R() - 0.5, R() - 0.2, R() - 0.5).normalize().multiplyScalar(0.038);
      const q = pos.clone().add(d);
      stamenGeos.push(new THREE.SphereGeometry(0.0075, 4, 3).translate(q.x, q.y, q.z));
    }
  }
  b.part(mergeGeometries(nutGeos)!, "#7a5a3a", { bone: root, at: [0, 0, 0], name: "gumnuts" });
  b.part(mergeGeometries(nutCapGeos)!, "#4f3b27", { bone: root, at: [0, 0, 0], name: "gumnutCaps" });
  b.part(
    mergeGeometries(blossomGeos)!,
    cellPaint(0.01, (c) => c.pick(["#d9c6a2", "#ecd9b8", "#f6e8cf", "#fff4e2"], 0.35 + 0.7 * c.random(1))),
    { bone: root, at: [0, 0, 0], name: "blossoms" },
  );
  b.part(mergeGeometries(stamenGeos)!, "#e8a8a0", { bone: root, at: [0, 0, 0], name: "stamens" });

  // ---- plinth dressing: grass, fallen leaves, pebbles, mushrooms, sign
  const GRASS = pixelArt(["..g..g", ".gG.gG", ".gGgGg", "gGGgGg", "gGgGGg", "GggGgG"], {
    g: "#5f9f3f",
    G: "#437c30",
  });
  const grassFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 46; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.2 + 0.36 * Math.sqrt(R());
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.hypot(x, z + 0.15) < 0.13) continue;
    grassFrames.push(frame([x, 0.145, z], [0, 1, 0]));
  }
  b.cards(grassFrames, GRASS, {
    size: [0.07, 0.09],
    lean: 12,
    flow: (_f, i) => [Math.cos(i * 2.3), -0.2, Math.sin(i * 2.3)],
    vary: 0.3,
    cross: true,
    rng: R,
    bone: root,
  });
  // fallen leaves lie flat
  const fallenFrames = Array.from({ length: 9 }, () => {
    const a = R() * Math.PI * 2;
    const r = 0.22 + 0.3 * Math.sqrt(R());
    return frame([Math.cos(a) * r, 0.152, Math.sin(a) * r], [0, 1, 0]);
  });
  b.cards(fallenFrames, [LEAF_A, LEAF_B], {
    size: [0.07, 0.2],
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
    mirror: true,
    rng: R,
    bone: root,
  });
  // pebbles
  {
    const pebs: THREE.BufferGeometry[] = [];
    for (const [x, z, r] of [
      [0.36, 0.3, 0.05],
      [0.43, 0.2, 0.03],
      [-0.4, 0.28, 0.045],
      [0.3, -0.35, 0.04],
      [-0.28, -0.42, 0.03],
      [0.1, 0.5, 0.025],
    ]) {
      pebs.push(
        new THREE.SphereGeometry(r, 6, 4)
          .scale(1, 0.6, 1.15)
          .rotateY(x * 9)
          .translate(x, 0.15 + r * 0.25, z),
      );
    }
    b.part(
      mergeGeometries(pebs)!,
      cellPaint(0.01, (c) => c.pick(STONE, 0.35 + 0.5 * c.random(1) + 0.3 * c.n.y)),
      { bone: root, at: [0, 0, 0], name: "pebbles" },
    );
  }
  // mushrooms
  {
    const caps: THREE.BufferGeometry[] = [];
    const stems: THREE.BufferGeometry[] = [];
    const dots: THREE.BufferGeometry[] = [];
    for (const [x, z, s] of [
      [-0.4, 0.15, 1],
      [-0.46, 0.06, 0.7],
      [0.5, -0.05, 0.8],
    ]) {
      stems.push(new THREE.CylinderGeometry(0.014 * s, 0.018 * s, 0.05 * s, 6).translate(x, 0.15 + 0.025 * s, z));
      caps.push(
        new THREE.SphereGeometry(0.04 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2)
          .scale(1, 0.75, 1)
          .translate(x, 0.15 + 0.05 * s, z),
      );
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1 + x * 7;
        dots.push(
          new THREE.BoxGeometry(0.01 * s, 0.006, 0.01 * s).translate(
            x + Math.cos(a) * 0.022 * s,
            0.15 + 0.078 * s - 0.01 * s * Math.abs(Math.cos(a)),
            z + Math.sin(a) * 0.022 * s,
          ),
        );
      }
    }
    b.part(mergeGeometries(caps)!, "#c0392b", { bone: root, at: [0, 0, 0], name: "mushCaps" });
    b.part(mergeGeometries(stems)!, "#efe6d0", { bone: root, at: [0, 0, 0], name: "mushStems" });
    b.part(mergeGeometries(dots)!, "#fdf6e6", { bone: root, at: [0, 0, 0], name: "mushDots" });
  }
  // little sign
  {
    const SIGN = pixelArt(
      [
        "kkkkkkkkkkkkkkkkkkkkkkkkkk",
        "kyyyyyyyyyyyyyyyyyyyyyyyyk",
        "kyddyyyyyyyyyyyyyyyyyyyyyk",
        "kydgyyyyyyyyyyyyyyyyyyyyyk",
        "kygGgyybbbbbyybbbbbbbbyyyk",
        "kyyGgyyyyyyyyyyyyyyyyyyyyk",
        "kyyyGyyybbbbyybbbbbbyyyyyk",
        "kyyyyyyyyyyyyyyyyyyyyyyyyk",
        "kyyyyyybbbbbbbbbbyyyyyyyyk",
        "kyyyyyyyyyyyyyyyyyyyyyyyyk",
        "kkkkkkkkkkkkkkkkkkkkkkkkkk",
      ],
      { k: "#4a3220", y: "#c99d63", d: "#a8793f", b: "#5a3d24", g: "#4b9a58", G: "#2f6a3a" },
    );
    const sx = -0.3;
    const sz = 0.4;
    for (const dx of [-0.1, 0.1]) b.rod([sx + dx, 0.14, sz - 0.01], [sx + dx, 0.2, sz - 0.01], 0.012, { bone: root, color: "#5a3d24" });
    b.part(new THREE.BoxGeometry(0.26, 0.12, 0.02), "#ffffff", {
      texture: SIGN,
      bone: root,
      at: [sx, 0.225, sz],
      rotation: [-52, 0, 0],
      name: "sign",
    });
  }

  // =============================================================================================================
  // Koala
  const bodyFur = (dither = true) =>
    cellPaint(
      TEXEL,
      (c) => {
        const nz = noise(c.at, 0.09, 3);
        let v = 0.5 + 0.28 * c.n.y + 0.85 * (nz - 0.5) + 0.2 * (hash(c.u * 3 + c.depth * 7 + c.axis) - 0.5);
        if (c.n.z < -0.4) v -= 0.1;
        const chestness = c.n.z + 0.5 * (noise(c.at, 0.05, 9) - 0.5);
        if (chestness > 0.45 && c.at.y > 0.52 && c.at.y < 0.95) return c.pick(BELLY, 0.45 + 0.5 * c.n.y + 0.5 * (nz - 0.5));
        if (c.at.y < 0.7 && c.n.z < 0.3 && noise(c.at, 0.07, 5) > 0.45) return c.pick(RUMP, 0.5 + 0.7 * (nz - 0.5));
        if (c.random(1) < 0.05) v += 0.3;
        else if (c.random(1) > 0.96) v -= 0.3;
        return c.pick(FUR, v);
      },
      { dither },
    );
  const furBody = bodyFur();
  const limbFur = cellPaint(
    TEXEL,
    (c) => {
      const nz = noise(c.at, 0.08, 6);
      let v = 0.45 + 0.28 * c.n.y + 0.8 * (nz - 0.5) + 0.2 * (hash(c.u * 3 + c.depth * 7) - 0.5);
      if (c.random(2) < 0.05) v += 0.3;
      return c.pick(FUR_DARK, v);
    },
    { dither: true },
  );

  b.sweep(
    spine,
    (t) => [0.165 + 0.012 * Math.sin(Math.PI * t) - 0.055 * t * t, 0.15 - 0.045 * t],
    { color: furBody, sides: 10, name: "torso" },
  );

  // ---- head
  const SK = V(0, 0.99, 0.235);
  const headFur = cellPaint(
    TEXEL,
    (c) => {
      const rel = c.at.clone().sub(SK);
      const nz = noise(c.at, 0.08, 4);
      let v = 0.55 + 0.3 * c.n.y + 0.8 * (nz - 0.5) + 0.18 * (hash(c.u * 3 + c.depth * 7 + c.axis) - 0.5);
      if (rel.y < -0.055 + 0.02 * (nz - 0.5) && c.n.z > -0.2) return c.pick(BELLY, 0.55 + 0.6 * (nz - 0.5));
      if (Math.abs(rel.x) > 0.115 && rel.y < 0.02 && c.n.z > -0.3) return c.pick(WHITE, 0.45 + 0.9 * (nz - 0.5));
      if (rel.y > 0.08) v -= 0.12;
      if (c.random(1) < 0.05) v += 0.3;
      return c.pick(FUR, v);
    },
    { dither: true },
  );
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), headFur, {
    bone: head,
    at: SK,
    scale: [0.17, 0.135, 0.15],
    name: "skull",
  });
  const cheekFur = cellPaint(
    TEXEL,
    (c) => c.pick(WHITE, 0.5 + 0.35 * c.n.y + 0.8 * (noise(c.at, 0.05, 2) - 0.5)),
    { dither: true },
  );
  const cheeks: ReturnType<typeof b.part>[] = [];
  for (const s of [1, -1]) {
    cheeks.push(
      b.part(new THREE.SphereGeometry(1, 9, 6), cheekFur, {
        bone: head,
        at: SK.clone().add(V(s * 0.115, -0.045, 0.03)),
        scale: [0.065, 0.06, 0.07],
        name: s > 0 ? "cheekL" : "cheekR",
      }),
    );
  }
  const muzzleFur = cellPaint(
    TEXEL * 0.75,
    (c) => c.pick(BELLY, 0.45 + 0.45 * c.n.y + 0.9 * (noise(c.at, 0.05, 7) - 0.5)),
    { dither: true },
  );
  b.part(new THREE.SphereGeometry(1, 10, 7), muzzleFur, {
    bone: head,
    at: SK.clone().add(V(0, -0.045, 0.095)),
    scale: [0.075, 0.056, 0.062],
    name: "muzzle",
  });
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 9, 6), muzzleFur, {
    bone: jaw,
    at: SK.clone().add(V(0, -0.082, 0.07)),
    scale: [0.058, 0.034, 0.058],
    name: "lowerJaw",
  });
  // nose: big, dark, with a highlight
  const noseTex = cellPaint(
    0.008,
    (c) => {
      const lift = c.n.y * 0.6 + c.n.x * 0.25 * Math.sign(c.at.x || 1) * -1;
      if (c.n.z > 0.6 && c.n.y > 0.1 && c.random(4) < 0.35) return NOSE[3];
      return c.pick(NOSE, 0.25 + 0.35 * lift + 0.25 * c.random(3));
    },
    { dither: true },
  );
  b.part(new THREE.SphereGeometry(1, 10, 7), noseTex, {
    bone: head,
    at: SK.clone().add(V(0, -0.02, 0.145)),
    scale: [0.052, 0.04, 0.038],
    name: "nose",
  });
  // mouth line, philtrum
  for (const s of [1, -1]) {
    b.capsule(SK.clone().add(V(s * 0.004, -0.088, 0.155)), SK.clone().add(V(s * 0.05, -0.1, 0.12)), 0.0055, {
      bone: head,
      color: "#2a2228",
      sides: 4,
    });
  }
  b.rod(SK.clone().add(V(0, -0.05, 0.178)), SK.clone().add(V(0, -0.09, 0.158)), 0.005, {
    bone: head,
    color: "#2a2228",
    sides: 4,
  });
  // eyes
  const EYE = pixelArt([".kkk.", "kkkkk", "kwkkk", "kkkkk", ".kkk."], { k: "#0d0d12", w: "#ffffff" });
  const BROW = pixelArt(["..ddddd.", ".ddddddd", "dd......"], { d: "#3d4048" });
  const eyeRing = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = eyeRing.around(SK).at(s * 41, 12);
    if (!hit) throw new Error("no eye hit");
    b.decal(skull, EYE, { at: hit, size: [0.05, 0.05], bone: head, name: s > 0 ? "eyeL" : "eyeR" });
    const hb = eyeRing.around(SK).at(s * 43, 27);
    if (hb) b.decal(skull, BROW, { at: hb, size: [0.064, 0.024], mirror: s > 0, bone: head, name: s > 0 ? "browL" : "browR" });
  }
  // forehead tufts + cheek ruff cards
  const TUFT = pixelArt(["..w.", "w.ww", "wwwc", "wwcc"], { w: "#f6f3ea", c: "#d4cfc0" });
  const TUFT_G = pixelArt(["..g.", "g.gg", "gggd", "ggdd"], { g: "#9aa0a8", d: "#6c717a" });
  for (const [cheek, s] of [
    [cheeks[0], 1],
    [cheeks[1], -1],
  ] as const) {
    const hits = b.surface(cheek).scatter(11, { rng: R, minDist: 0.03, filter: (h) => h.n.z > -0.1 && Math.abs(h.n.x * s) > 0.3 });
    b.cards(hits, TUFT, { size: [0.058, 0.058], lean: 62, flow: [s * 0.4, -1, 0.1], bend: 10, vary: 0.2, rng: R });
  }
  {
    const hits = b.surface(skull).scatter(30, { rng: R, minDist: 0.032, filter: (h) => h.n.y > 0.55 && h.n.z > -0.4 });
    b.cards(hits, TUFT_G, { size: [0.05, 0.05], lean: 55, flow: [0, -0.2, -1], vary: 0.25, rng: R });
  }
  // chin whiskers of fluff on the chest
  {
    const hits = b.surface(spine.joints).scatter(34, {
      rng: R,
      minDist: 0.035,
      filter: (h) => h.n.z > 0.5 && h.at.y > 0.62 && h.at.y < 0.88,
    });
    b.cards(hits, TUFT, { size: [0.06, 0.06], lean: 60, flow: [0, -1, 0.2], bend: 10, vary: 0.2, rng: R });
  }

  // ---- ears
  const EAR_R = 5;
  const earOutline = stepped(
    Array.from({ length: EAR_R * 2 }, (_, i) => {
      const y = i - EAR_R + 0.5;
      const hw = Math.max(1, Math.round(Math.sqrt(EAR_R * EAR_R + 0.4 - y * y)));
      return [-hw, hw] as [number, number];
    }),
    0.0145,
    { rows: true },
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earC = head.local({ left: s * 0.135, up: 0.135, forward: -0.01 });
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: earC.clone().add(V(0, -0.04, 0)),
      aim: earC.clone().add(V(s * 0.02, 0.05, 0)),
      role: "hinge",
    });
    const xd: [number, number, number] = [s * 0.95, 0, -0.3];
    const fdir = V(s * 0.3, 0, 0.95);
    const earPaint = cellPaint(
      0.0145,
      (c) => {
        const rel = c.at.clone().sub(earC);
        const d = Math.hypot(rel.x * 0.95, rel.y) / (EAR_R * 0.0145);
        const nz = noise(c.at, 0.04, 3);
        if (c.n.dot(fdir) > 0.5) {
          if (d > 0.62 || nz > 0.82) return c.pick(WHITE, 0.4 + 0.6 * c.random(2));
          return c.pick(WHITE, 0.7 + 0.5 * c.random(2));
        }
        return c.pick(FUR_DARK, 0.5 + 0.7 * (nz - 0.5));
      },
      { dither: true },
    );
    b.extrude(earOutline, {
      at: earC,
      x: xd,
      y: [0, 1, 0],
      thickness: 0.04,
      color: earPaint,
      bone: ear,
      name: `ear${side}Disc`,
    });
    // rim of grey fur around the front of each ear
    const rim = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const p = earC.clone().add(V(Math.cos(a) * s * 0.07 * 0.95, Math.sin(a) * 0.07, Math.cos(a) * -0.07 * 0.3 * s * s));
      return frame(p, [Math.cos(a) * s * 0.95, Math.sin(a), 0]);
    });
    b.cards(rim, TUFT, { size: [0.05, 0.05], lean: 0, flow: [0, 0, 1], vary: 0.2, rng: R, bone: ear });
  }

  // ---- arms (palm on the trunk, fingers wrapped round it)
  const palmY = 0.79;
  const palmAng = (55 * Math.PI) / 180;
  const handDigits: { name: string; y: number; len: number; sweepDeg: number; thumb: boolean }[] = [
    { name: "thumbA", y: 0.034, len: 0, sweepDeg: -42, thumb: true },
    { name: "thumbB", y: 0.014, len: 0, sweepDeg: -48, thumb: true },
    { name: "fingerA", y: -0.006, len: 0, sweepDeg: 88, thumb: false },
    { name: "fingerB", y: -0.026, len: 0, sweepDeg: 92, thumb: false },
    { name: "fingerC", y: -0.046, len: 0, sweepDeg: 84, thumb: false },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tc = trunkAt(palmY);
    const rad = trunkR(palmY);
    const palm = V(tc.x + s * Math.sin(palmAng) * (rad + 0.026), palmY, tc.z + Math.cos(palmAng) * (rad + 0.026));
    const shoulder: [number, number, number] = [s * 0.135, 0.83, 0.09];
    const pts = limb(shoulder, palm, [0.16, 0.14], [s * 0.9, -0.6, 0.1]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.062, 0.052, 0.045], { color: limbFur, sides: 8, name: `arm${side}Tube` });
    // palm pad and fur cuff
    b.capsule(palm.clone().add(V(0, 0.045, 0)), palm.clone().add(V(0, -0.055, 0)), 0.03, {
      bone: arm.tip!,
      color: cellPaint(0.008, (c) => c.pick(FUR_DARK, 0.35 + 0.3 * c.random(1))),
      sides: 8,
      name: `palm${side}`,
    });
    for (const d of handDigits) {
      const y = palmY + d.y;
      const c0 = trunkAt(y);
      const r = trunkR(y) + 0.011;
      const from = V(c0.x + s * Math.sin(palmAng) * r, y, c0.z + Math.cos(palmAng) * r);
      const path = arc(c0.clone().setY(y), from, [0, 1, 0], s * d.sweepDeg);
      const digit = b.chain(`${d.name}${side}`, path, { parent: arm.tip!, count: 2, role: "digit" });
      b.sweep(digit, d.thumb ? [0.0125, 0.01] : [0.0135, 0.0105], {
        bands: [
          [0.66, "#5a5a63"],
          [1, CLAW],
        ],
        sides: 5,
        caps: "point",
        name: `${d.name}${side}Tube`,
      });
    }
  }

  // ---- legs (feet clasp the seat limb)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tSeat = seatPath.closestT(V(0, 0.56, 0.33));
    const cen = seatPath.at(tSeat);
    const T = seatPath.tangentAt(tSeat).clone().normalize();
    const up = V(0, 1, 0).addScaledVector(T, -T.y).normalize();
    const rr = 0.058 - (0.058 - 0.026) * tSeat * 0.9 + 0.013;
    const dir0 = up.clone().applyAxisAngle(T, -s * (40 * Math.PI) / 180);
    const p0 = cen.clone().addScaledVector(dir0, rr);
    const ankleT = p0.clone().add(V(s * 0.055, 0.03, -0.075));
    const hipP: [number, number, number] = [s * 0.13, 0.65, 0.09];
    const pts = limb(hipP, ankleT, [0.2, 0.14], [s * 0.7, 1, 0.1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.086, 0.07, 0.052], { color: limbFur, sides: 8, name: `leg${side}Tube` });
    // foot pad
    b.capsule(p0.clone().addScaledVector(T, -0.045), p0.clone().addScaledVector(T, 0.075), 0.027, {
      bone: leg.tip!,
      color: cellPaint(0.008, (c) => c.pick(FUR_DARK, 0.35 + 0.3 * c.random(1))),
      sides: 8,
      name: `foot${side}`,
    });
    b.capsule(ankleT, p0, 0.032, { bone: leg.tip!, color: limbFur, sides: 8, name: `heel${side}` });
    const toes = [
      { name: "toeBig", off: -0.04, deg: 70 },
      { name: "toeA", off: -0.012, deg: 118 },
      { name: "toeB", off: 0.014, deg: 125 },
      { name: "toeC", off: 0.04, deg: 115 },
      { name: "toeD", off: 0.066, deg: 105 },
    ];
    for (const d of toes) {
      const c0 = cen.clone().addScaledVector(T, d.off);
      const from = c0.clone().addScaledVector(dir0, rr);
      const path = arc(c0, from, T, -s * d.deg);
      const digit = b.chain(`${d.name}${side}`, path, { parent: leg.tip!, count: 2, role: "digit" });
      b.sweep(digit, [0.0135, 0.0105], {
        bands: [
          [0.68, "#5a5a63"],
          [1, d.name === "toeBig" ? "#5a5a63" : CLAW],
        ],
        sides: 5,
        caps: "point",
        name: `${d.name}${side}Tube`,
      });
    }
  }

  void jaw;
  void barkDark;
  return b.root;
}
