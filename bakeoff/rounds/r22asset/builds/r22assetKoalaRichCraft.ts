import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, stepped, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description:
    "A chunky pixel-art koala hugging a eucalyptus trunk mounted on a wooden display base, with wrapped fingers and toes, big fluffy ears, a leathery nose and leafy branches.",
  style: "pixel art",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "koala", detail: 0.8 });
  const r = rng(7);
  const TEXEL = 0.02;

  // ---- palettes ----
  const FUR = ["#2f3339", "#444a52", "#5d646d", "#7b838b", "#9aa2a8", "#bcc2c4", "#dadedd"];
  const LIGHT = ["#aeb4b8", "#cfd4d4", "#e6e9e6", "#f4f4ee"];
  const BARKR = ["#3a2d25", "#54443a", "#74685a", "#968c78", "#b9b19a", "#d3cbb4"];
  const WOODR = ["#3b2616", "#5a3a20", "#7a5230", "#9a6c40"];
  const CLAW = "#2b2622";
  const NOSE = "#16130f";
  const CREAM = "#dcd5c6";

  const fur = (chest: number, seed: number) =>
    cellPaint(
      TEXEL,
      (c) => {
        const n = noise(c.at, 0.12, seed);
        let v = 0.4 + 0.55 * (n - 0.5) + 0.1 * c.n.y + chest * Math.max(0, c.n.z) * 0.5;
        if (c.random(5) < 0.05) v -= 0.22;
        if (c.random(6) > 0.96) v += 0.2;
        return c.pick(FUR, v);
      },
      { dither: true },
    );
  const BODY = fur(0.9, 2);
  const LIMB = fur(0.05, 4);
  const HEAD = fur(0.2, 6);
  const FLUFF = cellPaint(TEXEL, (c) => c.pick(LIGHT, 0.4 + 0.6 * noise(c.at, 0.08, 9)), { dither: true });
  const BARK: Paint = cellPaint(
    0.025,
    (c) => {
      const P = new THREE.Vector3(c.at.x * 3, c.at.y * 0.45, c.at.z * 3);
      let v = noise(P, 0.09, 1);
      if (noise(P, 0.35, 9) > 0.62) v = 0.75 + 0.2 * v;
      if (c.random(3) < 0.04) v = 0.05;
      return c.pick(BARKR, v);
    },
    { dither: true },
  );

  // ---- textures ----
  const WOOD = pixelTexture(32, 16, (g) => {
    g.fill((x, y) => (y % 8 === 0 ? "#2a1a0e" : pick(WOODR, 0.35 + 0.4 * r(), bayer(x, y))));
    g.fill((x, y) => (y % 8 === 1 ? "#b08050" : x === (y < 8 ? 10 : 24) ? "#2a1a0e" : undefined));
  });
  const EYE = pixelArt(["kkw", "kkk", "kkk"], { k: "#0b0b12", w: "#ffffff" });
  const leaf = (dark: string, mid: string, vein: string) =>
    pixelTexture(6, 16, (g) => {
      for (let y = 0; y < 16; y++) {
        const hw = Math.round(2.6 * Math.sin((Math.PI * (y + 0.6)) / 17));
        for (let x = 3 - hw; x < 3 + hw; x++) {
          const mid2 = x === 2 || x === 3;
          g.set(x, y, mid2 && y > 1 ? vein : x === 3 - hw || x === 2 + hw ? dark : mid);
        }
      }
    });
  const LEAF1 = leaf("#2f6a5e", "#5b9a8a", "#b4d8c0");
  const LEAF2 = leaf("#3a7452", "#7fb88a", "#cfe8c4");
  const TUFT = pixelArt(["..a.", "a.aa", "aaaa", "abaa", ".aab"], { a: "#f0f0f0", b: "#c4c4c4" });

  // ---- skeleton ----
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const hips = b.joint("hips", { parent: base, at: [0, 0.4, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, 0],
      [0, 0.55, 0.03],
      [0, 0.7, 0.06],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.joint("neck", { parent: spine, at: [0, 0.72, 0.06], aim: [0, 0.85, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.85, 0.1], aim: [0, 0.92, 0.16], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.85, 0.17], aim: [0, 0.85, 0.27], role: "jaw" });

  // ---- stand: base, trunk, branches ----
  b.part(tileBox([0.64, 0.06, 0.52], WOOD, TEXEL, { rand: r, step: [1, 8] }), "#ffffff", {
    texture: WOOD,
    bone: base,
    at: [0, 0.03, 0.2],
  });
  b.part(tileBox([0.5, 0.025, 0.4], WOOD, TEXEL, { rand: r, step: [1, 8] }), "#ffffff", {
    texture: WOOD,
    bone: base,
    at: [0, 0.0725, 0.34],
  });

  const trunk = b.sweep(
    catmull([
      [0, 0.08, 0.36],
      [0, 0.7, 0.358],
      [0, 1.32, 0.36],
    ]),
    [0.068, 0.05],
    { bone: base, color: BARK, sides: 8 },
  );
  for (const [t, a, w] of [
    [0.3, 160, 0.05],
    [0.55, 200, 0.04],
    [0.8, 150, 0.05],
    [0.42, 20, 0.035],
  ]) {
    b.stick(new THREE.BoxGeometry(w, 0.02, w * 0.8), "#2e231c", trunk.at(t, a), { embed: 0.4 });
  }
  const topFrames = [0.78, 0.9, 1].flatMap((t) => [0, 90, 180, 270].map((a) => trunk.at(t, a)));
  b.cards(topFrames, [LEAF1, LEAF2], {
    size: [0.05, 0.15],
    lean: 35,
    bend: 30,
    vary: 0.25,
    spin: 30,
    rng: rng(21),
    flow: [0, 0.6, 0.2],
  });

  const branch = (pts: number[][], rad: number[], seed: number, flow: number[]) => {
    const sw = b.sweep(catmull(pts), rad, { bone: base, color: BARK, sides: 6 });
    const fr = [] as ReturnType<typeof sw.at>[];
    for (const t of [0.35, 0.5, 0.65, 0.8, 0.92]) for (const a of [70, -70, 200]) fr.push(sw.at(t, a));
    fr.push(sw.at(1, 0));
    b.cards(fr, [LEAF1, LEAF2, LEAF1], {
      size: [0.05, 0.15],
      lean: 55,
      bend: 35,
      vary: 0.25,
      spin: 25,
      rng: rng(seed),
      flow,
    });
    for (const t of [0.45, 0.7]) {
      b.stick(new THREE.SphereGeometry(0.018, 6, 4), "#6b5a3a", sw.at(t, 180), { embed: 0.2 });
      b.stick(new THREE.CylinderGeometry(0.01, 0.014, 0.008, 6), "#4a3d28", sw.at(t, 180).moved([0, 0.012, 0]), {
        embed: 0,
      });
    }
  };
  branch(
    [
      [0, 0.98, 0.36],
      [0.2, 1.1, 0.4],
      [0.45, 1.18, 0.36],
    ],
    [0.026, 0.012],
    31,
    [1, -0.2, 0],
  );
  branch(
    [
      [0, 1.1, 0.36],
      [-0.2, 1.2, 0.33],
      [-0.42, 1.3, 0.38],
    ],
    [0.024, 0.01],
    32,
    [-1, -0.2, 0],
  );
  branch(
    [
      [0, 0.55, 0.36],
      [0.08, 0.6, 0.55],
      [0.2, 0.7, 0.72],
    ],
    [0.024, 0.01],
    33,
    [0.3, -0.3, 1],
  );
  b.cards(
    [
      [-0.26, 0.17],
      [0.28, 0.08],
      [0.22, 0.4],
      [-0.2, 0.42],
      [0.0, 0.46],
      [-0.28, 0.33],
      [0.3, 0.3],
      [-0.1, 0.0],
    ].map(([x, z]) => frame([x, 0.062, z], [0, 1, 0])),
    LEAF2,
    {
      size: [0.04, 0.11],
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3)],
      mirror: true,
      bone: base,
    },
  );

  // ---- koala body ----
  const body = b.sweep(spine, (t) => [0.15 + 0.02 * Math.sin(Math.PI * t) - 0.015 * t, 0.13], { color: BODY, sides: 10 });
  b.part(new THREE.SphereGeometry(0.1, 7, 5), BODY, { bone: hips, at: [0, 0.4, -0.1] });
  const furHits = b.surface(body).scatter(45, { rng: rng(3), minDist: 0.07, filter: (h) => h.n.y > -0.3 });
  b.cards(furHits, TUFT, { size: [0.05, 0.05], lean: 60, color: BODY, rng: rng(4), vary: 0.2 });

  // head
  b.part(new THREE.BoxGeometry(0.24, 0.2, 0.2), HEAD, { bone: head, at: [0, 0.9, 0.12] });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.16), HEAD, { bone: head, at: [0, 0.99, 0.12] });
  b.part(new THREE.BoxGeometry(0.12, 0.07, 0.05), FLUFF, { bone: head, at: [0, 0.875, 0.235] });
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.04), NOSE, { bone: head, at: [0, 0.918, 0.258] });
  b.part(new THREE.BoxGeometry(0.11, 0.035, 0.09), "#d9d2c4", { bone: jaw, at: [0, 0.835, 0.215] });
  b.part(new THREE.BoxGeometry(0.1, 0.008, 0.08), "#3a2a2a", { bone: jaw, at: [0, 0.854, 0.215] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.065, 0.93, 0.224],
    });
    b.part(new THREE.BoxGeometry(0.04, 0.08, 0.12), FLUFF, { bone: head, at: [s * 0.125, 0.86, 0.12] });
    b.part(new THREE.BoxGeometry(0.03, 0.012, 0.012), "#2f3339", { bone: head, at: [s * 0.065, 0.955, 0.224] });
    const ear = stepped(
      [
        [1, 3],
        [0, 4],
        [0, 4],
        [1, 3],
      ],
      0.03,
      { rows: true },
    );
    b.extrude(ear, { at: [s * 0.08, 0.93, 0.12], x: [s, 0, 0], thickness: 0.04, color: HEAD, bone: head });
    const inner = stepped(
      [
        [1, 2],
        [0, 3],
        [0, 3],
        [1, 2],
      ],
      0.02,
      { rows: true },
    );
    b.extrude(inner, { at: [s * 0.1, 0.95, 0.14], x: [s, 0, 0], thickness: 0.03, color: FLUFF, bone: head });
  }
  const headHits = b.surface(b.root).scatter(0, {});
  void headHits;

  // ---- limbs ----
  const CZ = 0.36;
  const RW = 0.075;
  const wrap = (name: string, parent: ReturnType<typeof b.joint>, s: number, y: number, p0: number, p1: number, rad: number[]) => {
    const pts = [0, 1, 2, 3].map((k) => {
      const a = ((p0 + ((p1 - p0) * k) / 3) * Math.PI) / 180;
      return [s * RW * Math.cos(a), y, CZ + RW * Math.sin(a)];
    });
    const ch = b.chain(name, catmull(pts), { parent, count: 2, role: "digit" });
    b.sweep(ch, rad, { color: LIMB, sides: 6 });
    b.spike(ch.at(1), ch.at(1), 0.03, 0.008, { color: CLAW });
  };

  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const wy = s > 0 ? 0.8 : 0.72;
    const arm = b.chain(
      `arm${k}`,
      catmull([
        [s * 0.13, 0.7, 0.07],
        [s * 0.2, 0.66 + (wy - 0.72) * 0.5, 0.22],
        [s * 0.085, wy, 0.35],
      ]),
      { parent: spine, names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`], role: "arm" },
    );
    b.sweep(arm, [0.05, 0.036, 0.032], { color: LIMB, sides: 8 });
    const wrist = arm.tip!;
    b.part(new THREE.SphereGeometry(0.04, 6, 5), LIMB, { bone: wrist, at: [s * 0.085, wy, 0.35] });
    for (let i = 0; i < 3; i++) wrap(`finger${k}${i}`, wrist, s, wy + (i - 1) * 0.03, 8, 62, [0.017, 0.011]);
    for (let j = 0; j < 2; j++) wrap(`thumb${k}${j}`, wrist, s, wy + (j - 0.5) * 0.04, -8, -70, [0.017, 0.012]);

    const ay = s > 0 ? 0.3 : 0.22;
    const leg = b.chain(
      `leg${k}`,
      catmull([
        [s * 0.1, 0.42, 0],
        [s * 0.21, ay + 0.08, 0.17],
        [s * 0.09, ay, 0.35],
      ]),
      {
        parent: hips,
        names: [`hip${k}`, `knee${k}`, `ankle${k}`],
        role: "leg",
        contact: [s * 0.09, ay, 0.35],
      },
    );
    b.sweep(leg, [0.07, 0.05, 0.035], { color: LIMB, sides: 8 });
    b.part(new THREE.SphereGeometry(0.085, 7, 5), LIMB, { bone: leg.joints[0], at: [s * 0.11, 0.42, 0.02] });
    const ankle = leg.tip!;
    b.part(new THREE.SphereGeometry(0.04, 6, 5), LIMB, { bone: ankle, at: [s * 0.09, ay, 0.35] });
    for (let i = 0; i < 4; i++) wrap(`toe${k}${i}`, ankle, s, ay + (i - 1.5) * 0.026, 8, 58, [0.015, 0.01]);
    wrap(`bigToe${k}`, ankle, s, ay, -8, -65, [0.02, 0.013]);
  }

  return b.root;
}
