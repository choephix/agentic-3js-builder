import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { paint } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Ember Phoenix",
  description:
    "A flame-plumed phoenix hovering with wings spread: layered cel-shaded flight feathers, long trailing tail plumes, gold armour plates with ruby gems, anime eyes.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const RUBY = "#e0183c";
const CLAW = "#2b1a14";
const DEEP = cel("#9a1432");
const RED = cel("#e63a22");
const ORANGE = cel("#ff7f1e");
const GOLD = cel("#ffc62a");
const METAL = cel("#f0b834", "#b8701f");
const BROWN = cel("#7a4a2a");
const BEAK = cel("#f6c13a", "#c98a22");

const leaf = (base: string, tip: string, rib: string) =>
  svg(
    `<svg viewBox="0 0 40 80"><defs><clipPath id="c"><path d="M20 80 C3 62 2 30 20 1 C38 30 37 62 20 80Z"/></clipPath></defs><g clip-path="url(#c)"><rect width="40" height="80" fill="${base}"/><path d="M0 0H40V34L30 26L20 36L10 26L0 34Z" fill="${tip}"/><path d="M20 78V10" stroke="${rib}" stroke-width="2" fill="none"/></g></svg>`,
    { size: 128 },
  );

function planar(d: number[]) {
  const l = Math.hypot(d[0], d[1], d[2]) || 1;
  const y = d.map((v) => v / l);
  const h = Math.hypot(y[0], y[1]) || 1;
  return { y, x: [y[1] / h, -y[0] / h, 0] };
}

function featherOutline(L: number, w: number, c: number): OutlinePoint[] {
  return [
    [0, 0],
    [w * 0.35, L * 0.08],
    [w * 0.5 + c * 0.15, L * 0.35],
    [w * 0.42 + c * 0.5, L * 0.7],
    [c, L, "sharp"],
    [-w * 0.5 + c * 0.5, L * 0.72],
    [-w * 0.55 + c * 0.15, L * 0.36],
    [-w * 0.35, L * 0.08],
  ];
}

function featherPaint(L: number, c: number, s0: string, s1: string, s2: string) {
  return cel(
    paint((_p, _n, s) => {
      const f = s[1] / L;
      const rib = Math.abs(s[0] - c * Math.pow(Math.max(f, 0), 1.6)) < 0.005 && f > 0.05 && f < 0.88;
      const e = f + 0.05 * zigzag(s[0] / 0.035);
      if (rib) return "#7d0f2a";
      return e > 0.72 ? s2 : e > 0.4 ? s1 : s0;
    }),
  );
}

function plumePaint(a: string, b2: string, c: string, d: string) {
  return cel(
    paint((_p, _n, s) => {
      const e = s[0] + 0.035 * zigzag(s[1] / 50);
      return e > 0.82 ? d : e > 0.6 ? c : e > 0.3 ? b2 : a;
    }),
  );
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(7);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.3, -0.1], dir: [0, 1, 0.1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.3, -0.1],
      [0, 1.55, 0.0],
      [0, 1.8, 0.08],
      [0, 2.0, 0.15],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.0, 0.15],
      [0, 2.2, 0.28],
      [0, 2.33, 0.38],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 2.33, 0.38], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.31, 0.45], aim: [0, 2.3, 0.6], role: "jaw" });

  // ---------------------------------------------------------------- body
  const BODY = cel(
    furEdge("#ffc62a", "#e63a22", {
      axis: [0, 0, 1],
      level: 0.2,
      teeth: 0.3,
      period: 0.04,
      along: [1, 0, 0],
    }),
  );
  const bodyPath = catmull([
    [0, 1.22, -0.14],
    [0, 1.5, -0.02],
    [0, 1.78, 0.08],
    [0, 2.02, 0.17],
    [0, 2.2, 0.28],
    [0, 2.33, 0.38],
  ]);
  const body = b.sweep(bodyPath, [0.13, 0.21, 0.245, 0.17, 0.105, 0.085], BODY, {
    bone: [spine, neck],
    sides: 10,
    name: "body",
  });

  const FG = leaf("#ffc62a", "#ffe9a0", "#e8a21c");
  const FO = leaf("#ff7f1e", "#ffc62a", "#c04a14");
  const FR = leaf("#e63a22", "#ff7f1e", "#8f1230");
  const FD = leaf("#a01634", "#e63a22", "#6a0d24");
  const skin = b.surface(body);
  const front = skin.scatter(70, { rng: rng(11), minDist: 0.06, filter: (h) => h.n.z > 0.3 && h.at.y < 1.75 });
  b.cards(front, [FG, FO, FG], {
    size: [0.08, 0.14],
    lean: 58,
    bend: 18,
    flow: [0, -1, -0.25],
    vary: 0.25,
    spin: 12,
    rng: rng(12),
  });
  const rear = skin.scatter(110, { rng: rng(13), minDist: 0.06, filter: (h) => h.n.z <= 0.3 && h.at.y < 2.1 });
  b.cards(rear, [FR, FO, FD, FR], {
    size: [0.08, 0.14],
    lean: 58,
    bend: 18,
    flow: [0, -1, -0.25],
    vary: 0.25,
    spin: 12,
    rng: rng(14),
  });

  // neck ruff
  for (const [t, r, tex] of [
    [0.3, 0.12, FO],
    [0.75, 0.095, FG],
  ] as const) {
    const ringItems = b.ring(neck.at(t), { count: 10, radius: r }).items;
    b.cards(ringItems, tex, { size: [0.07, 0.12], lean: 60, flow: [0, -1, 0], vary: 0.2, rng: rng(15) });
  }

  // gold gorget with ruby
  const gorgetPath = skin.drape(
    catmull([
      [0.22, 2.0, 0.1],
      [0.13, 1.93, 0.28],
      [0, 1.85, 0.36],
      [-0.13, 1.93, 0.28],
      [-0.22, 2.0, 0.1],
    ]),
    { lift: 0.02 },
  );
  b.sweep(gorgetPath, 0.024, METAL, { name: "gorget" });
  const gh = skin.nearest([0, 1.86, 0.5]);
  const diamond = (hw: number, hl: number): OutlinePoint[] => [
    [0, -hl, "sharp"],
    [hw, 0, "sharp"],
    [0, hl, "sharp"],
    [-hw, 0, "sharp"],
  ];
  b.extrude(diamond(0.06, 0.11), {
    at: [0, gh.at.y - 0.0, gh.at.z + 0.012],
    x: [1, 0, 0],
    thickness: 0.016,
    bevel: 0.004,
    color: METAL,
    bone: spine.joints[2],
    name: "gorgetPlate",
  });
  glow(
    b.extrude(diamond(0.032, 0.062), {
      at: [0, gh.at.y, gh.at.z + 0.03],
      x: [1, 0, 0],
      thickness: 0.02,
      bevel: 0.006,
      color: RUBY,
      bone: spine.joints[2],
      name: "gorgetGem",
    }),
    1.2,
  );

  // ---------------------------------------------------------------- head
  const HEAD_C = [0, 2.35, 0.4];
  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 9),
    cel(furEdge("#ff7f1e", "#ffc62a", { axis: [0, 1, 0], level: -0.1, teeth: 0.35, period: 0.03, along: [1, 0, 0] })),
    { bone: head, at: HEAD_C, scale: [0.1, 0.095, 0.115], name: "skull" },
  );
  const headSkin = b.surface(skull);
  const EYE = animeEye({ iris: "#ffb01e", blush: false });
  for (const s of [1, -1]) {
    const hit = headSkin.around(HEAD_C).at(s * 52, 4)!;
    b.decal(headSkin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
  }
  b.sweep(
    bezier([0, 2.35, 0.48], [0, 2.36, 0.58], [0, 2.33, 0.64], [0, 2.27, 0.665]),
    (t) => [0.04 * (1 - t) + 0.004, 0.036 * (1 - t) + 0.004],
    BEAK,
    { bone: head, caps: { start: "flat", end: "point" }, sides: 6, name: "beakUpper" },
  );
  b.sweep(
    catmull([
      [0, 2.31, 0.46],
      [0, 2.3, 0.54],
      [0, 2.285, 0.6],
    ]),
    [0.03, 0.0],
    BEAK,
    { bone: jaw, caps: { start: "flat", end: "point" }, sides: 6, name: "beakLower" },
  );
  // crest
  const crestCols = [GOLD, ORANGE, RED, ORANGE, GOLD];
  for (let j = 0; j < 5; j++) {
    const dx = [-0.07, -0.035, 0, 0.035, 0.07][j];
    const h = [0.28, 0.4, 0.52, 0.4, 0.28][j];
    const bz = 0.38 - 0.02 * Math.abs(j - 2);
    b.sweep(
      bezier(
        [dx, 2.42, bz],
        [dx * 1.2, 2.42 + h * 0.5, bz - 0.02],
        [dx * 2, 2.42 + h * 0.9, bz - h * 0.4],
        [dx * 3, 2.42 + h * 0.85, bz - h * 0.9],
      ),
      (t) => [0.032 * Math.pow(1 - t, 0.7) + 0.002, 0.014 * (1 - t) + 0.002],
      crestCols[j],
      { bone: head, caps: { end: "point" }, sides: 6, name: `crest${j}` },
    );
  }
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.085, 2.38, 0.36],
        [s * 0.15, 2.41, 0.2],
        [s * 0.2, 2.5, 0.06],
      ]),
      [0.028, 0.0],
      GOLD,
      { bone: head, caps: { end: "point" }, sides: 6, name: "cheekPlume" },
    );
  }

  // ---------------------------------------------------------------- wings
  const rows: Array<{
    n: number;
    tA: number;
    tB: number;
    pA: number;
    pB: number;
    L: (u: number) => number;
    w: number;
    z: number;
    cols: [string, string, string];
    curl: number;
  }> = [
    {
      n: 9,
      tA: 0.08,
      tB: 1.0,
      pA: -80,
      pB: 58,
      L: (u) => 0.62 + 0.5 * Math.pow(u, 0.8),
      w: 0.19,
      z: -0.035,
      cols: ["#8f1230", "#e63a22", "#ffc62a"],
      curl: 0.06,
    },
    {
      n: 9,
      tA: 0.1,
      tB: 0.95,
      pA: -72,
      pB: 50,
      L: (u) => 0.45 + 0.42 * Math.pow(u, 0.8),
      w: 0.17,
      z: 0,
      cols: ["#c01f2c", "#ff6a1c", "#ffd24a"],
      curl: 0.05,
    },
    {
      n: 8,
      tA: 0.05,
      tB: 0.9,
      pA: -88,
      pB: 44,
      L: (u) => 0.26 + 0.24 * u,
      w: 0.13,
      z: 0.028,
      cols: ["#e63a22", "#ff8a24", "#ffe08a"],
      curl: 0.03,
    },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = catmull([
      [s * 0.22, 1.8, 0.05],
      [s * 0.66, 2.05, -0.02],
      [s * 1.05, 2.25, -0.1],
      [s * 1.3, 2.5, -0.15],
    ]);
    const wing = b.chain(`shoulder${side}`, arm, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "wing",
    });
    b.sweep(wing, [0.08, 0.06, 0.045, 0.03], RED, { name: `arm${side}` });
    for (const row of rows) {
      for (let k = 0; k < row.n; k++) {
        const u = k / (row.n - 1);
        const tr = row.tA + (row.tB - row.tA) * u;
        const phi = ((row.pA + (row.pB - row.pA) * u) * Math.PI) / 180;
        const L = row.L(u);
        const cc = row.curl * s;
        const { x, y } = planar([s * Math.cos(phi), Math.sin(phi), -0.12]);
        const p = arm.at(tr);
        b.extrude(featherOutline(L, row.w, cc), {
          at: [p.x, p.y, p.z + row.z],
          x,
          y,
          thickness: 0.012,
          bevel: 0.003,
          smoothing: 1,
          color: featherPaint(L, cc, row.cols[0], row.cols[1], row.cols[2]),
          bone: wing.jointAt(tr),
          name: `feather${side}`,
        });
      }
    }
    // gold leading edge band
    b.sweep(
      catmull([
        [s * 0.22, 1.88, 0.06],
        [s * 0.66, 2.13, -0.01],
        [s * 1.05, 2.33, -0.09],
        [s * 1.3, 2.58, -0.14],
      ]),
      [0.024, 0.012],
      METAL,
      { bone: wing, caps: { end: "point" }, sides: 6, name: `edge${side}` },
    );
    // plates and gems
    for (const t of [0.3, 0.62, 0.9]) {
      const p = arm.at(t);
      const T = arm.tangentAt(t);
      const { x, y } = planar([T.x, T.y, T.z]);
      const r = 0.08 - 0.05 * t;
      b.extrude(diamond(0.055, 0.11), {
        at: [p.x, p.y, p.z + r * 0.95 + 0.006],
        x,
        y,
        thickness: 0.016,
        bevel: 0.004,
        color: METAL,
        bone: wing.jointAt(t),
        name: `plate${side}`,
      });
      glow(
        b.extrude(diamond(0.028, 0.05), {
          at: [p.x, p.y, p.z + r + 0.022],
          x,
          y,
          thickness: 0.02,
          bevel: 0.006,
          color: RUBY,
          bone: wing.jointAt(t),
          name: `gem${side}`,
        }),
        1.2,
      );
    }
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.11, 1.28, 0.0],
        [s * 0.13, 1.1, 0.13],
        [s * 0.14, 0.9, 0.03],
        [s * 0.15, 0.72, 0.1],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        role: "leg",
      },
    );
    const thigh = b.sweep(leg, [0.075, 0.06, 0.034, 0.026], BROWN, {
      bands: [[0.45, RED]],
      name: `leg${side}`,
    });
    const lhits = b.surface(thigh).scatter(22, {
      rng: rng(21 + (s > 0 ? 0 : 5)),
      minDist: 0.045,
      filter: (h) => h.at.y > 0.98,
    });
    b.cards(lhits, [FR, FO], { size: [0.05, 0.09], lean: 50, flow: [0, -1, 0], vary: 0.2, rng: rng(25) });

    const foot: number[] = [s * 0.15, 0.72, 0.1];
    const footJoint = leg.joints[3];
    const toes = [-0.5, 0, 0.5, Math.PI];
    toes.forEach((a, idx) => {
      const len = a === Math.PI ? 0.14 : 0.2;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const mid = [foot[0] + 0.5 * len * dx, 0.69, foot[2] + 0.5 * len * dz];
      const end = [foot[0] + len * dx, 0.64, foot[2] + len * dz];
      const toe = b.chain(`toe${side}${idx}`, catmull([foot, mid, end]), {
        parent: footJoint,
        names: [`toe${side}${idx}a`, `toe${side}${idx}b`],
        role: "digit",
      });
      b.sweep(toe, [0.024, 0.018, 0.012], BROWN, { sides: 6, name: `toe${side}` });
      b.spike(end, [dx, -0.45, dz], 0.07, 0.014, CLAW, { bone: toe.joints[1], sides: 6, name: `claw${side}` });
    });
    const lp = leg.at(0.74);
    b.part(new THREE.CylinderGeometry(0.048, 0.044, 0.07, 8), METAL, { frame: lp, name: `anklet${side}` });
    glow(
      b.part(new THREE.OctahedronGeometry(0.028), RUBY, {
        at: [lp.at.x, lp.at.y, lp.at.z + 0.05],
        bone: leg.joints[2],
        scale: [0.8, 1.2, 0.8],
        name: `anklet gem${side}`,
      }),
      1.2,
    );
  }

  // ---------------------------------------------------------------- tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.22, -0.16],
      [0, 1.0, -0.4],
      [0, 0.76, -0.64],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const plumeWidth = (t: number) =>
    0.09 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 0.7) + 0.03 * Math.pow(1 - t, 3);
  const plume = (i: number, layer: number) => {
    const ia = Math.abs(i);
    const ty = 0.03 + ia * 0.16 + layer * 0.18;
    const tz = -0.9 - 0.12 * ia - layer * 0.04;
    const pts: number[][] = [
      [i * 0.02, 1.2, -0.17],
      [i * 0.07, 0.95, -0.42 - 0.03 * ia],
      [i * 0.2, 0.55 + ia * 0.05 + layer * 0.1, -0.72 - 0.06 * ia],
      [i * 0.3, ty, tz],
    ];
    if (ia >= 2) pts.push([i * 0.3 + Math.sign(i) * 0.14, ty + 0.16, tz - 0.06]);
    const path = catmull(pts);
    const colors: [string, string, string, string] =
      layer === 0 ? ["#7d1230", "#e63a22", "#ff7f1e", "#ffc62a"] : ["#a01634", "#ff5a1c", "#ffa52a", "#ffe08a"];
    const sw = b.sweep(path, (t) => [plumeWidth(t), 0.012 * (1 - t) + 0.004], plumePaint(...colors), {
      bone: tail.joints[1],
      caps: { end: "point" },
      sides: 8,
      name: "plume",
    });
    return { sw, path };
  };
  for (let i = -3; i <= 3; i++) {
    const { sw, path } = plume(i, 0);
    if (i === 0 || Math.abs(i) === 2) {
      const p = sw.at(0.62, 0, 0.004);
      const T = path.tangentAt(0.62);
      const { x, y } = planar([-T.x, -T.y, -T.z]);
      b.extrude(diamond(0.05, 0.1), {
        at: [p.at.x, p.at.y, p.at.z + 0.006],
        x,
        y,
        thickness: 0.014,
        bevel: 0.004,
        color: METAL,
        bone: tail.joints[1],
        name: "tailPlate",
      });
      glow(
        b.extrude(diamond(0.025, 0.048), {
          at: [p.at.x, p.at.y, p.at.z + 0.022],
          x,
          y,
          thickness: 0.018,
          bevel: 0.005,
          color: RUBY,
          bone: tail.joints[1],
          name: "tailGem",
        }),
        1.2,
      );
    }
  }
  for (let k = 0; k < 6; k++) plume(-2.5 + k, 1);

  void rand;
  return b.root;
}
