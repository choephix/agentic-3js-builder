import * as THREE from "three";
import { createBuilder, catmull, polyline, rng, countershade, scales } from "../../../../src/index";

export const meta = {
  name: "Phoenix",
  description:
    "A rigged fire-bird in rest pose: wings spread with layered red-orange-gold feathers, a long ribbon tail, flame crest, hooked beak with a separate jaw, and scaly talons.",
};

const RED_DEEP = "#b3130e";
const RED = "#e02a14";
const EMBER = "#8a1008";
const ORANGE = "#ff6a1a";
const AMBER = "#ff9d1f";
const GOLD = "#ffc93a";
const YELLOW = "#fff08a";
const BEAK = "#f2a81d";
const BEAK2 = "#d8841a";
const SCALEY = "#d99a1e";
const BLACK = "#1a0a05";
const EYE = "#ffe066";
const DARK = "#3a1208";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "phoenix" });

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.8, -0.1], dir: [0, 0, 1] });
  const spine = b.chain("spine", catmull([[0, 0.78, -0.25], [0, 0.85, 0], [0, 1.0, 0.22]]), {
    parent: "root",
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.0, 0.22], [0, 1.22, 0.34], [0, 1.42, 0.42]]), {
    parent: "spine2",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.joint("head", { parent: "neck2", at: [0, 1.45, 0.42], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.42, 0.5], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain("tail", catmull([[0, 0.8, -0.3], [0, 0.62, -1.0], [0, 0.34, -1.8], [0, 0.22, -2.5]]), {
    parent: "root",
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });

  // ---------- body ----------
  const backP = scales(["#e8381a", "#f0501a", "#d82a14"], "#9a0e0a", { size: 0.06, seed: 3 });
  const bellyP = scales(["#ffb52e", "#ffc93a", "#ffa626"], "#d9781a", { size: 0.06, seed: 5 });
  const bodyPaint = countershade(backP, bellyP, { level: 0.1, soft: 0.4 });
  const body = b.loft(
    [
      { at: [0, 0.75, -0.35], w: 0.2, h: 0.2 },
      { at: [0, 0.8, -0.1], w: 0.42, h: 0.42 },
      { at: [0, 0.9, 0.15], w: 0.46, h: 0.46 },
      { at: [0, 1.05, 0.28], w: 0.34, h: 0.36 },
      { at: [0, 1.25, 0.38], w: 0.18, h: 0.2 },
      { at: [0, 1.42, 0.45], w: 0.16, h: 0.16 },
    ],
    { color: bodyPaint, bone: [spine, neck], name: "body" },
  );

  // body feather scales
  const cone = new THREE.ConeGeometry(0.04, 0.13, 4);
  cone.translate(0, 0.065, 0);
  cone.scale(1, 1, 0.35);
  cone.rotateX(1.0);
  const surf = b.surface(body);
  const hits = surf.scatter(70, { rng: rng(5), minDist: 0.07 });
  const plume = [ORANGE, AMBER, GOLD, RED];
  hits.forEach((h, i) => {
    b.stick(cone, plume[i % plume.length], h, { flow: [0, -0.3, -1], embed: 0.3 });
  });

  // ---------- head ----------
  const headGeo = new THREE.SphereGeometry(0.11, 10, 8);
  b.part(headGeo, ORANGE, { at: [0, 1.46, 0.46], bone: "head", scale: [0.9, 1, 1.15] });
  // cheek patches
  for (const S of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.04, 6, 5), GOLD, { at: [S * 0.075, 1.43, 0.5], bone: "head", scale: [0.6, 1, 1.2] });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), EYE, { at: [S * 0.088, 1.49, 0.52], bone: "head" });
    b.part(new THREE.SphereGeometry(0.016, 6, 5), BLACK, { at: [S * 0.108, 1.49, 0.535], bone: "head" });
  }
  // beak: upper on head, lower on jaw
  b.sweep(
    [V(0, 1.475, 0.52), V(0, 1.468, 0.64), V(0, 1.43, 0.76)],
    (t: number) => [0.04 * (1 - t) + 0.003, 0.048 * (1 - t) + 0.003],
    { color: BEAK, bone: "head", caps: { start: "flat", end: "point" }, name: "beakUpper" },
  );
  b.sweep(
    [V(0, 1.41, 0.5), V(0, 1.412, 0.62), V(0, 1.42, 0.71)],
    (t: number) => [0.032 * (1 - t) + 0.003, 0.028 * (1 - t) + 0.003],
    { color: BEAK2, bone: "jaw", caps: { start: "flat", end: "point" }, name: "beakLower" },
  );
  // crest plumes
  for (let i = 0; i < 5; i++) {
    const o = i - 2;
    const ao = Math.abs(o);
    b.sweep(
      catmull([
        V(o * 0.02, 1.54, 0.43),
        V(o * 0.05, 1.7 - ao * 0.02, 0.33 - ao * 0.02),
        V(o * 0.12, 1.8 - ao * 0.1, 0.05 - ao * 0.04 - 0.1),
      ]),
      (t: number) => 0.017 * Math.pow(1 - t, 0.8) + 0.002,
      {
        bone: "head",
        bands: [[0.5, i % 2 ? RED : RED_DEEP], [0.8, ORANGE], [1, GOLD]],
        name: "crest" + i,
      },
    );
  }

  // ---------- feather helper ----------
  const leaf = (len: number, w: number): any[] => [
    [0, -0.25 * w],
    [0.25 * len, -0.5 * w],
    [0.7 * len, -0.42 * w],
    [len, 0, "sharp"],
    [0.7 * len, 0.42 * w],
    [0.25 * len, 0.5 * w],
    [0, 0.25 * w],
  ];
  const up = V(0, 1, 0);
  const feather = (base: THREE.Vector3, dir: THREE.Vector3, len: number, wid: number, cols: string[], bone: string, y0: number) => {
    const lens = [1, 0.8, 0.55];
    const wids = [1, 0.68, 0.4];
    const offs = [0, 0.04, 0.12];
    const yAxis = up.clone().cross(dir).normalize();
    for (let i = 0; i < 3; i++) {
      const at = base.clone().addScaledVector(dir, len * offs[i]);
      at.y += y0 + i * 0.006;
      b.extrude(leaf(len * lens[i], wid * wids[i]), {
        color: cols[i],
        at,
        x: dir,
        y: yAxis,
        thickness: 0.008,
        bone,
      });
    }
  };

  // ---------- wings ----------
  for (const S of [1, -1]) {
    const side = S === 1 ? "L" : "R";
    const pts = [V(S * 0.25, 1.05, 0.08), V(S * 0.65, 1.12, -0.02), V(S * 1.05, 1.15, 0.05), V(S * 1.3, 1.14, 0)];
    const arm = b.chain("wing" + side, polyline(pts), {
      parent: "spine2",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "wing",
    });
    b.sweep(arm, [0.075, 0.06, 0.045, 0.03], { color: RED, name: "wingArm" + side });
    const armPoint = (u: number) => {
      const i = Math.min(Math.floor(u), pts.length - 2);
      return pts[i].clone().lerp(pts[i + 1], u - i);
    };
    const boneAt = (u: number) => ["shoulder", "elbow", "wrist"][Math.min(Math.floor(u), 2)] + side;
    const dirOf = (a: number) => V(S * Math.cos((a * Math.PI) / 180), 0, -Math.sin((a * Math.PI) / 180)).normalize();
    const colsA = [RED_DEEP, ORANGE, GOLD];
    const colsB = [RED, AMBER, YELLOW];

    // secondaries
    for (let k = 0; k < 9; k++) {
      const u = 0.6 + (1.4 * k) / 8;
      const base = armPoint(u);
      base.z -= 0.02;
      feather(base, dirOf(80 - (18 * k) / 8), 0.5 + (0.12 * k) / 8, 0.11, k % 2 ? colsB : colsA, boneAt(u), -0.012 + (k % 2) * 0.004);
    }
    // primaries (k=0 outermost)
    for (let k = 0; k < 9; k++) {
      const u = 2.95 - (0.9 * k) / 8;
      feather(armPoint(u), dirOf(4 + (44 * k) / 8), 0.78 - (0.18 * k) / 8, 0.095, k % 2 ? colsB : colsA, `wrist${side}`, -0.02 + (k % 2) * 0.004);
    }
    // coverts
    for (let k = 0; k < 11; k++) {
      const u = 0.4 + (2.5 * k) / 10;
      feather(armPoint(u), dirOf(85 - (25 * k) / 10), 0.3, 0.085, [ORANGE, AMBER, GOLD], boneAt(u), 0.012 + (k % 2) * 0.004);
    }
    for (let k = 0; k < 12; k++) {
      const u = 0.3 + (2.6 * k) / 11;
      feather(armPoint(u), dirOf(88 - (30 * k) / 11), 0.17, 0.07, [AMBER, GOLD, YELLOW], boneAt(u), 0.026 + (k % 2) * 0.003);
    }
    for (let k = 0; k < 6; k++) {
      const u = 2.1 + (0.8 * k) / 5;
      feather(armPoint(u), dirOf(5 + (35 * (5 - k)) / 5), 0.34, 0.075, [RED, ORANGE, AMBER], `wrist${side}`, 0.036);
    }
  }

  // ---------- tail ----------
  for (let k = -4; k <= 4; k++) {
    const a = k / 4;
    const f = 1.1 - 0.35 * Math.abs(a);
    const y = (k % 2 === 0 ? 0 : 0.012);
    const pts = [
      V(a * 0.05, 0.8 + y, -0.3),
      V(a * 0.3, 0.63 + y, -1.0 * f),
      V(a * 0.75, 0.38 + y, -1.8 * f),
      V(a * 1.15, 0.24 + y + Math.abs(a) * 0.08, -2.5 * f),
    ];
    const bands: Array<[number, string]> =
      k % 2 === 0
        ? [[0.4, RED], [0.7, ORANGE], [1, GOLD]]
        : [[0.45, EMBER], [0.75, AMBER], [1, YELLOW]];
    b.sweep(
      catmull(pts),
      (t: number) => [0.075 * Math.max(Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * t)), 0.7), 0.02), 0.005],
      { section: "box", caps: "flat", bands, bone: tail, up: [0, 1, 0], name: "tailFeather" + (k + 4) },
    );
  }

  // ---------- legs ----------
  for (const S of [1, -1]) {
    const side = S === 1 ? "L" : "R";
    const hip = V(S * 0.15, 0.72, 0.0);
    const ball = V(S * 0.17, 0.02, 0.05);
    const leg = b.chain("leg" + side, polyline([hip, V(S * 0.17, 0.52, 0.17), V(S * 0.17, 0.24, -0.03), ball]), {
      parent: "root",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.075, 0.05, 0.032, 0.026], {
      bands: [[0.38, RED], [1, SCALEY]],
      name: "leg" + side,
    });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), ORANGE, {
      at: [S * 0.15, 0.68, 0.03],
      bone: `hip${side}`,
      scale: [1, 1.5, 1.1],
    });
    const toes: Array<[number, number, number]> = [[1, 0, 0.17], [2, 28, 0.15], [3, -28, 0.15], [4, 180, 0.12]];
    for (const [idx, ang, len] of toes) {
      const r = (ang * Math.PI) / 180;
      const d = V(S * Math.sin(r), 0, Math.cos(r));
      const pA = ball.clone();
      const pB = ball.clone().addScaledVector(d, len * 0.5);
      const pC = ball.clone().addScaledVector(d, len);
      const nameA = `toe${idx}a${side}`;
      const nameB = `toe${idx}b${side}`;
      const toe = b.chain(`toe${idx}${side}`, polyline([pA, pB, pC]), {
        parent: `foot${side}`,
        names: [nameA, nameB],
        role: "digit",
      });
      b.sweep(toe, [0.02, 0.016, 0.011], { color: SCALEY, name: `toe${idx}${side}` });
      b.spike(pC.clone().addScaledVector(d, -0.01), [d.x, -0.15, d.z], 0.075, 0.014, { color: DARK, bone: nameB });
    }
  }

  return b.root;
}
