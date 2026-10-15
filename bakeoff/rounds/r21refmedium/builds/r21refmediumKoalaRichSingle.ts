import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { cellPaint, pixelArt, snapColor, stepped } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description:
    "A grey koala hugging a eucalyptus trunk mounted on a stump base, pixel-art style: dithered fur cells, fluffy ear fringes, wrapped clawed paws, hanging gum leaves.",
  style: "pixel art",
  commit: "88fc1f0",
};

const KX = -0.1;
/** Koala-local point (x relative to the koala's own centre line). */
const P = (x: number, y: number, z: number): [number, number, number] => [x + KX, y, z];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

type Wrap = (off: number, deg: number, r: number) => [number, number, number];

export default function build() {
  const b = createBuilder({ name: "koala" });
  const rand = rng(11);
  const snap = (c: string) => snapColor(c, 64);

  // ---------------------------------------------------------------------------------------------- palette
  const FUR = ["#4d5058", "#686c75", "#838890", "#9fa3aa", "#bcbfc4"].map(snap);
  const CREAM = ["#a79c88", "#c9bfa8", "#e4dcc8", "#f5eedd"].map(snap);
  const PINKS = ["#a8706a", "#c48a82", "#d9a69c", "#e8bfb4"].map(snap);
  const BARK = ["#3a2418", "#553420", "#704628", "#8a5a34", "#a67545"].map(snap);
  const WOOD = ["#8c5e34", "#b78650", "#d4a96c", "#e6c58e"].map(snap);
  const MOSS = ["#2c4a1c", "#3d6a28", "#58882f", "#7aa83e"].map(snap);
  const GREEN = ["#27442a", "#35603a", "#46804a", "#5f9a58", "#7db26a"].map(snap);
  const VEIN = "#b4c46a";
  const CLAW = "#1b1a20";
  const NOSE = "#202026";
  const TWIG = "#6a4a30";

  // ---------------------------------------------------------------------------------------------- paints
  const coat = cellPaint(
    0.02,
    (c) => {
      const nz = noise(c.at, 0.09, 3) - 0.5;
      const edge = (noise(c.at, 0.06, 9) - 0.5) * 0.05;
      const chest =
        c.n.z > 0.15 &&
        c.at.y > 0.6 + edge &&
        c.at.y < 0.84 + edge &&
        Math.abs(c.at.x - KX) < 0.095 + edge;
      if (c.random(5) < 0.07) return c.pick(FUR, 0.08);
      if (chest) return c.pick(CREAM, 0.55 + 0.9 * nz + 0.2 * c.n.y);
      return c.pick(FUR, 0.52 + 0.28 * c.n.y + 1.0 * nz + 0.1 * c.n.z);
    },
    { dither: true },
  );
  const creamFur = cellPaint(0.015, (c) => c.pick(CREAM, 0.55 + 0.3 * c.n.y + 0.8 * (noise(c.at, 0.04, 4) - 0.5)), {
    dither: true,
  });
  const pinkPaint = cellPaint(0.01, (c) => c.pick(PINKS, 0.45 + 0.6 * (noise(c.at, 0.03, 6) - 0.5)), { dither: true });
  const bark = cellPaint(
    0.016,
    (c) => {
      const streak = noise(V(c.at.x, c.at.y * 0.22, c.at.z), 0.05, 2);
      if (c.random(2) < 0.06) return BARK[0];
      return c.pick(BARK, 0.25 + 0.7 * streak + 0.15 * c.n.y);
    },
    { dither: true },
  );
  const stump = cellPaint(
    0.015,
    (c) => {
      if (c.n.y > 0.6) {
        const r = Math.hypot(c.at.x, c.at.z);
        if (noise(c.at, 0.12, 7) > 0.58 && r > 0.12) return c.pick(MOSS, 0.4 + 0.6 * noise(c.at, 0.04, 8));
        const ring = 0.5 + 0.5 * Math.sin(r * 110 + 3 * noise(c.at, 0.1, 4));
        return c.pick(WOOD, 0.2 + 0.6 * ring);
      }
      return c.pick(BARK, 0.3 + 0.6 * noise(V(c.at.x, c.at.y * 0.2, c.at.z), 0.05, 2));
    },
    { dither: true },
  );
  const leafPaint = cellPaint(
    0.006,
    (c) => {
      if (Math.abs(c.s[1]) < 0.0035) return VEIN;
      return c.pick(GREEN, 0.25 + 0.55 * noise(c.at, 0.03, 5) + 0.15 * c.n.y);
    },
    { dither: true },
  );

  // ---------------------------------------------------------------------------------------------- textures
  const EYE = pixelArt([".kkkk.", "kbbbbk", "kbwbbk", "kbbbbk", "kbbbbk", ".kkkk."], {
    k: "#16100d",
    b: "#4b2a17",
    w: "#ffffff",
  });
  const FUZZ = pixelArt([".w.w.", "wwwww", "wwwww", "wwwww"], { w: "#ffffff" });
  const GRASS = pixelArt(["..h..", "g.h.h", "g.hhg", "ggggg", "ggggg"], { g: "#4f7c34", h: "#7fb04a" });

  // ---------------------------------------------------------------------------------------------- skeleton
  const stand = b.joint("stand", { at: [0, 0.05, 0] });
  const hips = b.joint("hips", { parent: stand, at: P(0, 0.57, -0.05), role: "spine" });
  const spine = b.chain("spine", catmull([P(0, 0.57, -0.05), P(0, 0.66, -0.03), P(0.01, 0.76, 0.0)]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.tip!;
  const neck = b.chain("neck", [P(0.01, 0.76, 0.0), P(0.02, 0.83, 0.05)], {
    parent: chest,
    names: ["neck"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: P(0.02, 0.83, 0.05), dir: [0, 0.25, 1], role: "head" });
  const hx = P(0.025, 0.895, 0.1);
  const h = (dx: number, dy: number, dz: number): [number, number, number] => [hx[0] + dx, hx[1] + dy, hx[2] + dz];
  const jaw = b.joint("jaw", { parent: head, at: h(0, -0.045, 0.03), aim: h(0, -0.06, 0.1), role: "jaw" });

  // ---------------------------------------------------------------------------------------------- stand + trunk
  b.part(new THREE.CylinderGeometry(0.34, 0.36, 0.07, 14), stump, { bone: stand, at: [0, 0.035, 0] });

  const T0 = V(0.09, 0.04, -0.02);
  const T1 = V(0.15, 1.35, -0.05);
  const TAX = T1.clone().sub(T0).normalize();
  const trunkAt = (y: number) => T0.clone().lerp(T1, (y - T0.y) / (T1.y - T0.y));
  const trunkR = (y: number) => 0.066 - (0.018 * (y - T0.y)) / (T1.y - T0.y);

  const trunk = b.sweep([T0.toArray(), T1.toArray()], (t) => 0.066 - 0.018 * t, {
    color: bark,
    sides: 10,
    caps: "flat",
    bone: stand,
  });
  const cutPaint = cellPaint(0.008, (c) => c.pick(WOOD, 0.5 + 0.4 * Math.sin(c.at.distanceTo(T1) * 150)), {
    dither: true,
  });
  b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.01, 10), cutPaint, {
    bone: stand,
    at: T1.clone().addScaledVector(TAX, 0.004),
    dir: TAX,
  });

  // root flare
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 + 0.5;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    b.sweep(
      catmull([
        [T0.x + 0.03 * ca, 0.17, T0.z + 0.03 * sa],
        [T0.x + 0.08 * ca, 0.1, T0.z + 0.08 * sa],
        [T0.x + 0.17 * ca, 0.075, T0.z + 0.17 * sa],
      ]),
      [0.03, 0.013],
      { color: bark, sides: 6, bone: stand },
    );
  }

  // seat branch (the koala's bum rests on it, the right foot grips it)
  const A = V(0.105, 0.4, -0.028);
  const B = V(-0.3, 0.45, -0.075);
  b.sweep([A.toArray(), B.toArray()], [0.037, 0.026], { color: bark, sides: 8, bone: stand });

  // bark chunks on the trunk
  const chunks = b.surface(trunk).scatter(16, {
    rng: rand,
    minDist: 0.07,
    filter: (hit) => hit.at.y > 0.15 && hit.at.y < 1.3,
  });
  for (const hit of chunks) b.stick(new THREE.BoxGeometry(0.03, 0.018, 0.012), "#2e1d12", hit, { embed: 0.4 });

  // ---------------------------------------------------------------------------------------------- grip helper
  const wrapper = (center: THREE.Vector3, axis: THREE.Vector3, front: THREE.Vector3): Wrap => {
    const ax = axis.clone().normalize();
    const fro = front.clone().addScaledVector(ax, -front.dot(ax)).normalize();
    const side = ax.clone().cross(fro);
    return (off, deg, r) => {
      const a = (deg * Math.PI) / 180;
      const p = center
        .clone()
        .addScaledVector(ax, off)
        .addScaledVector(fro, r * Math.cos(a))
        .addScaledVector(side, r * Math.sin(a));
      return [p.x, p.y, p.z];
    };
  };
  const OFFS = [-0.027, -0.009, 0.009, 0.027];
  const fingers = (prefix: string, hand: Joint, wrap: Wrap, rad: number, degs: number[]) => {
    OFFS.forEach((o, i) => {
      const id = `${prefix}${i + 1}`;
      const ch = b.chain(
        id,
        catmull(degs.map((d) => wrap(o, d, rad))),
        { parent: hand, names: [`${id}a`, `${id}b`], role: "digit" },
      );
      b.sweep(ch, [0.0115, 0.0085], {
        bands: [
          [0.55, coat],
          [1, CLAW],
        ],
        sides: 6,
      });
    });
  };
  const GRIP = [-35, 15, 65];

  // ---------------------------------------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: P(0, 0.52, -0.06), w: 0.2, h: 0.2 },
      { at: P(0, 0.57, -0.05), w: 0.27, h: 0.26 },
      { at: P(0, 0.65, -0.035), w: 0.27, h: 0.25 },
      { at: P(0.005, 0.74, -0.01), w: 0.24, h: 0.21 },
      { at: P(0.01, 0.81, 0.02), w: 0.17, h: 0.15 },
    ],
    { bone: [hips, spine], color: coat, sides: 12 },
  );
  b.sweep(neck, 0.075, { color: coat, sides: 10 });

  // ---------------------------------------------------------------------------------------------- arms
  // left arm: reaches up and grips the trunk high
  const wrapHandL = wrapper(trunkAt(0.95), TAX, V(0, 0, 1));
  const lw = wrapHandL(0, -55, 0.085);
  const armL = b.chain("armL", catmull([[0.02, 0.74, 0.0], [0.07, 0.82, 0.1], lw]), {
    parent: chest,
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
  });
  b.sweep(armL, [0.058, 0.05, 0.04, 0.037], { color: coat, sides: 8 });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), coat, { bone: armL.tip!, at: lw, scale: [1.05, 1, 0.9] });
  fingers("handL", armL.tip!, wrapHandL, trunkR(0.95) + 0.011, GRIP);

  // right arm: crosses the chest and grips the trunk lower
  const wrapHandR = wrapper(trunkAt(0.74), TAX, V(0, 0, 1));
  const rw = wrapHandR(0, -55, 0.085);
  const armR = b.chain("armR", catmull([[-0.18, 0.73, 0.02], [-0.08, 0.64, 0.12], rw]), {
    parent: chest,
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
  });
  b.sweep(armR, [0.058, 0.05, 0.04, 0.037], { color: coat, sides: 8 });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), coat, { bone: armR.tip!, at: rw, scale: [1.05, 1, 0.9] });
  fingers("handR", armR.tip!, wrapHandR, trunkR(0.74) + 0.011, GRIP);

  // ---------------------------------------------------------------------------------------------- legs
  // left leg: foot clamps the trunk
  const wrapFootL = wrapper(trunkAt(0.5), TAX, V(0, 0, 1));
  const lf = wrapFootL(0, -55, 0.085);
  const legL = b.chain("legL", catmull([[-0.02, 0.53, 0.0], [0.0, 0.6, 0.13], lf]), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
  });
  b.sweep(legL, [0.07, 0.055, 0.045, 0.04], { color: coat, sides: 8 });
  b.part(new THREE.SphereGeometry(0.085, 8, 6), coat, { bone: legL.joints[0], at: [-0.03, 0.54, 0.04], scale: [0.8, 1, 1.1] });
  b.part(new THREE.SphereGeometry(0.042, 8, 6), coat, { bone: legL.tip!, at: lf, scale: [1.05, 0.95, 0.9] });
  fingers("footL", legL.tip!, wrapFootL, trunkR(0.5) + 0.011, GRIP);

  // right leg: foot grips the seat branch
  const stubC = A.clone().lerp(B, (-0.19 - A.x) / (B.x - A.x));
  const wrapFootR = wrapper(stubC, B.clone().sub(A), V(0, 0, 1));
  const rf = wrapFootR(0, -10, 0.07);
  const legR = b.chain("legR", catmull([[-0.18, 0.53, 0.0], [-0.2, 0.58, 0.13], rf]), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
  });
  b.sweep(legR, [0.07, 0.055, 0.045, 0.04], { color: coat, sides: 8 });
  b.part(new THREE.SphereGeometry(0.085, 8, 6), coat, { bone: legR.joints[0], at: [-0.17, 0.54, 0.04], scale: [0.8, 1, 1.1] });
  b.part(new THREE.SphereGeometry(0.042, 8, 6), coat, { bone: legR.tip!, at: rf, scale: [1.05, 0.95, 0.9] });
  fingers("footR", legR.tip!, wrapFootR, 0.03 + 0.011, [20, 70, 120]);

  // ---------------------------------------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(0.08, 12, 8), coat, { bone: head, at: h(0, 0, 0), scale: [1.1, 0.95, 1.0] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 8, 6), coat, { bone: head, at: h(s * 0.055, -0.03, 0.02) });
  }
  b.part(new THREE.SphereGeometry(0.045, 8, 6), creamFur, { bone: head, at: h(0, -0.025, 0.07), scale: [1.1, 0.85, 1.0] });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), NOSE, { bone: head, at: h(0, 0, 0.108), scale: [0.95, 1.2, 0.8] });
  b.part(new THREE.SphereGeometry(0.005, 4, 3), "#6a6a78", { bone: head, at: h(-0.008, 0.012, 0.126) });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.007, 0.007, 0.007), "#0a0a0e", { bone: head, at: h(s * 0.009, -0.014, 0.13) });
  }
  b.rod(h(-0.022, -0.043, 0.11), h(0.022, -0.043, 0.11), 0.0035, "#2a1e1e", { bone: head });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), creamFur, { bone: jaw, at: h(0, -0.062, 0.075), scale: [1.15, 0.6, 1.0] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.006), "#ffffff", {
      texture: EYE,
      bone: head,
      at: h(s * 0.043, 0.022, 0.07),
      dir: [0, 0, 1],
      axis: "z",
    });
  }

  // ears: big round fluffy discs with pink centres and white fringe cards
  for (const s of [1, -1]) {
    const rot = [0, -s * 28, -s * 14];
    const ear = b.part(new THREE.SphereGeometry(0.075, 10, 8), coat, {
      bone: head,
      at: h(s * 0.1, 0.07, -0.015),
      scale: [0.4, 1, 1],
      rotation: rot,
    });
    b.part(new THREE.SphereGeometry(0.058, 8, 6), pinkPaint, {
      bone: head,
      at: h(s * 0.114, 0.066, -0.0075),
      scale: [0.3, 0.9, 0.85],
      rotation: rot,
    });
    const rim = b.surface(ear).scatter(36, { rng: rand, minDist: 0.016, filter: (hit) => Math.abs(hit.n.x) < 0.5 });
    b.cards(rim, FUZZ, { size: [0.028, 0.034], vary: 0.3, rng: rand, color: "#f2eadb", cross: true, lean: 10 });
  }

  // fur cards: cheeks and body
  const cheeks = b.surface(skull).scatter(50, {
    rng: rand,
    minDist: 0.02,
    filter: (hit) => hit.n.z < 0.5 && hit.n.y > -0.2,
  });
  b.cards(cheeks, FUZZ, { size: [0.022, 0.028], lean: 55, vary: 0.25, rng: rand, color: coat });
  const bodyHits = b.surface(body).scatter(150, { rng: rand, minDist: 0.03, filter: (hit) => hit.n.y > -0.4 });
  b.cards(bodyHits, FUZZ, { size: [0.026, 0.032], lean: 60, vary: 0.25, rng: rand, color: coat });

  // ---------------------------------------------------------------------------------------------- eucalyptus foliage
  const LEAF = stepped(
    [
      [-1, 1],
      [-2, 2],
      [-3, 3],
      [-3, 3],
      [-4, 2],
      [-4, 2],
      [-5, 1],
      [-5, 1],
      [-5, 0],
      [-4, -1],
    ] as [number, number][],
    [0.0145, 0.005],
  );
  const leaf = (at: THREE.Vector3, d: THREE.Vector3, roll: number) => {
    const x = d.clone().normalize();
    const s = V(0, 0, 1).cross(x);
    if (s.lengthSq() < 1e-4) s.set(1, 0, 0);
    s.normalize().applyAxisAngle(x, roll);
    b.extrude(LEAF, {
      at: at.toArray(),
      x: x.toArray(),
      y: s.toArray(),
      thickness: 0.004,
      color: leafPaint,
      bone: stand,
    });
  };

  const twigSpecs: { y: number; out: [number, number, number]; n: number }[] = [
    { y: 1.04, out: [0.17, 0.05, 0.06], n: 4 },
    { y: 1.14, out: [0.15, 0.08, -0.07], n: 4 },
    { y: 1.24, out: [-0.17, 0.09, 0.03], n: 4 },
    { y: 0.64, out: [0.19, 0.0, 0.05], n: 3 },
    { y: 1.31, out: [0.1, 0.05, 0.04], n: 3 },
  ];
  for (const spec of twigSpecs) {
    const p0 = trunkAt(spec.y);
    const out = V(...spec.out);
    const p2 = p0.clone().add(out);
    const p1 = p0.clone().addScaledVector(out, 0.5).add(V(0, 0.025, 0));
    const path = catmull([p0.toArray(), p1.toArray(), p2.toArray()]);
    b.sweep(path, [0.012, 0.006], { color: TWIG, sides: 6, bone: stand });
    for (let k = 0; k < spec.n; k++) {
      const t = 0.4 + (0.6 * k) / (spec.n - 1);
      const base = path.at(t);
      const d = V(out.x * 0.6 + (rand() - 0.5) * 0.2, -0.85, out.z * 0.8 + (rand() - 0.5) * 0.4);
      leaf(base, d, (rand() - 0.5) * 1.4);
    }
    const nutAt = path.at(0.35);
    b.part(new THREE.SphereGeometry(0.011, 6, 4), "#7b5a38", { bone: stand, at: [nutAt.x, nutAt.y - 0.016, nutAt.z] });
    b.part(new THREE.BoxGeometry(0.014, 0.004, 0.014), "#a88457", { bone: stand, at: [nutAt.x, nutAt.y - 0.008, nutAt.z] });
  }
  for (const d of [V(-0.5, -0.6, 0.3), V(-0.3, -0.8, -0.2), V(-0.7, -0.2, 0.2)]) leaf(B, d, (rand() - 0.5) * 1.2);

  // ---------------------------------------------------------------------------------------------- stump dressing
  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + rand() * 0.3;
    const r = 0.2 + rand() * 0.11;
    tufts.push(frame([r * Math.cos(a), 0.068, r * Math.sin(a)], [0, 1, 0]));
  }
  b.cards(tufts, GRASS, { size: [0.055, 0.05], flow: [0, 0, 1], cross: true, vary: 0.3, rng: rand });
  const flat: [number, number, number][] = [
    [-0.22, 0.2, 0.5],
    [0.2, 0.18, 2.1],
    [-0.1, -0.24, 3.4],
    [0.26, -0.15, 4.7],
  ];
  for (const [x, z, a] of flat) {
    b.extrude(LEAF, {
      at: [x, 0.073, z],
      x: [Math.cos(a), 0, Math.sin(a)],
      y: [-Math.sin(a), 0, Math.cos(a)],
      thickness: 0.004,
      color: leafPaint,
      bone: stand,
    });
  }

  return b.root;
}
