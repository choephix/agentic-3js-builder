import * as THREE from "three";
import { createBuilder, catmull, bezier, spiral, limb, offset, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baku",
  description:
    "The dream-eating tapir spirit as an ukiyo-e woodblock print: indigo and cream tapir body with seigaiha wave discs, vermilion flame mane, gold curls, tiger paws, ox tail and glowing dream orbs.",
};

// Woodblock palette
const INDIGO = "#1f3262";
const PRUSSIAN = "#2f5a86";
const CREAM = "#f1e4bf";
const VERM = "#d8432b";
const GOLD = "#dca43c";
const SUMI = "#15141c";
const PALE = "#9bbdcd";
const PINK = "#e58f8a";

export default function build() {
  const b = createBuilder({ name: "baku" });
  const rand = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.85, -0.55], role: "spine" });
  const spinePath = catmull([
    [0, 0.85, -0.55],
    [0, 0.88, -0.15],
    [0, 0.92, 0.25],
    [0, 0.95, 0.55],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, role: "spine" });
  const chest = spine.joints[2];

  const neckPath = catmull([
    [0, 0.95, 0.55],
    [0, 1.06, 0.72],
    [0, 1.17, 0.88],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chest, role: "neck" });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neckPath.at(1),
    dir: [0, -0.1, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.12, down: 0.1 }),
    aim: head.local({ forward: 0.4, down: 0.11 }),
    role: "jaw",
  });

  // ---------- body ----------
  const body = b.sweep(spine, [0.29, 0.3, 0.31, 0.27], {
    color: INDIGO,
    bands: [
      [0.25, INDIGO],
      [0.75, CREAM],
      [1, INDIGO],
    ],
  });
  const neckTube = b.sweep(neck, [0.22, 0.19, 0.17], { color: INDIGO });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.18, 10, 8), INDIGO, {
    bone: head,
    at: head.local({ forward: 0.12 }),
    scale: [1, 0.95, 1.25],
  });
  b.frustumBox(head.local({ forward: 0.2, down: 0.0 }), head.local({ forward: 0.5, down: 0.02 }), [0.26, 0.22], [0.16, 0.14], {
    bone: head,
    color: INDIGO,
  });
  b.frustumBox(jaw.at, head.local({ forward: 0.42, down: 0.11 }), [0.2, 0.07], [0.12, 0.06], {
    bone: jaw,
    color: CREAM,
  });
  // nose pad
  b.part(new THREE.BoxGeometry(0.14, 0.03, 0.03), CREAM, { bone: head, at: head.local({ forward: 0.5, up: -0.045 }) });

  // trunk
  const trunkPath = catmull([
    head.local({ forward: 0.46, up: 0.0 }),
    head.local({ forward: 0.6, down: 0.05 }),
    head.local({ forward: 0.67, down: 0.17 }),
    head.local({ forward: 0.62, down: 0.3 }),
  ]);
  const trunk = b.chain("trunk", trunkPath, { parent: head, role: "tentacle" });
  const trunkTube = b.sweep(trunk, [0.085, 0.065, 0.048, 0.034], {
    color: INDIGO,
    bands: [
      [0.82, INDIGO],
      [1, VERM],
    ],
  });
  b.along(trunkTube, 5, (at: any) => {
    b.part(new THREE.TorusGeometry(at.radius * 1.03, 0.009, 4, 10), CREAM, {
      at: at.at,
      dir: at.tangent,
      axis: "z",
      bone: at.bone ?? undefined,
    });
  });

  // eyes, brows, ears, horns, whiskers
  for (const s of [1, -1]) {
    const ex = (o: number, f = 0.2) => head.local({ forward: f, up: 0.08, left: s * (0.14 + o) });
    b.part(new THREE.SphereGeometry(0.042, 8, 6), SUMI, { bone: head, at: ex(0), scale: [0.55, 1, 1.25] });
    b.part(new THREE.SphereGeometry(0.034, 8, 6), CREAM, { bone: head, at: ex(0.012), scale: [0.55, 1, 1.25] });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), VERM, { bone: head, at: ex(0.02, 0.215) });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), SUMI, { bone: head, at: ex(0.03, 0.222) });

    b.sweep(
      catmull([
        head.local({ forward: 0.13, up: 0.14, left: s * 0.12 }),
        head.local({ forward: 0.2, up: 0.155, left: s * 0.15 }),
        head.local({ forward: 0.28, up: 0.12, left: s * 0.14 }),
      ]),
      [0.012, 0.006],
      { bone: head, color: VERM },
    );

    // ear: cream rim, indigo, pink inner
    const earOutline = (k: number): [number, number][] =>
      (
        [
          [0, 0],
          [0.07, 0.02],
          [0.1, 0.1],
          [0.07, 0.18],
          [0, 0.2],
          [-0.07, 0.18],
          [-0.1, 0.1],
          [-0.07, 0.02],
        ] as [number, number][]
      ).map(([x, y]) => [x * k, y * k]);
    const earAt = head.local({ up: 0.1, left: s * 0.15, forward: 0.0 });
    const earY: [number, number, number] = [s * 0.45, 1, 0];
    [
      [1, 0.03, CREAM],
      [0.82, 0.045, INDIGO],
      [0.5, 0.058, PINK],
    ].forEach(([k, t, c]) =>
      b.extrude(earOutline(k as number), {
        at: earAt,
        x: [1, 0, 0],
        y: earY,
        thickness: t as number,
        smoothing: 1,
        color: c as string,
        bone: head,
      }),
    );

    // horns
    b.sweep(
      bezier(
        head.local({ up: 0.13, forward: 0.06, left: s * 0.05 }),
        head.local({ up: 0.27, forward: 0.02, left: s * 0.07 }),
        head.local({ up: 0.31, back: 0.12, left: s * 0.09 }),
      ),
      [0.03, 0.004],
      { bone: head, color: GOLD, caps: { end: "point" } },
    );

    // whiskers
    b.sweep(
      catmull([
        head.local({ forward: 0.4, up: 0.02, left: s * 0.07 }),
        head.local({ forward: 0.46, up: 0.04, left: s * 0.25 }),
        head.local({ forward: 0.3, up: 0.1, left: s * 0.45 }),
        head.local({ forward: 0.12, up: 0.0, left: s * 0.56 }),
      ]),
      [0.007, 0.003],
      { bone: head, color: GOLD },
    );

    // tusks
    b.spike(head.local({ forward: 0.42, down: 0.02, left: s * 0.05 }), [s * 0.15, -1, 0.35], 0.09, 0.016, {
      bone: head,
      color: CREAM,
    });
  }

  // forehead mark
  const markAt = head.local({ up: 0.168, forward: 0.1 });
  b.extrude(
    [
      [0, -0.06],
      [0.04, 0],
      [0, 0.06],
      [-0.04, 0],
    ],
    { at: markAt, x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, color: GOLD, bone: head },
  );
  b.extrude(
    [
      [0, -0.03],
      [0.02, 0],
      [0, 0.03],
      [-0.02, 0],
    ],
    { at: markAt, x: [1, 0, 0], y: [0, 0, 1], thickness: 0.032, color: VERM, bone: head },
  );

  // ---------- mane (flame blades) ----------
  const flameBase: [number, number][] = [
    [-0.05, 0],
    [0.08, 0],
    [0.12, 0.12],
    [0.05, 0.2],
    [0.12, 0.3],
    [-0.02, 0.22],
    [-0.06, 0.1],
  ];
  const flame = (at: any, k: number, color: string, thick: number, lift = 0) => {
    b.extrude(
      flameBase.map(([x, y]) => [x * k, y * k] as [number, number]),
      {
        at: offset(at, [0, 1, 0], -0.03 + lift),
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: thick,
        color,
        bone: at.bone ?? undefined,
      },
    );
  };
  b.along(neckTube, 5, (at: any) => {
    flame(at, 1.5, VERM, 0.04);
    flame(at, 0.9, GOLD, 0.055, 0.01);
    flame(at, 0.45, CREAM, 0.065, 0.02);
  });
  b.along(
    body,
    7,
    (at: any) => {
      flame(at, 1.0, VERM, 0.035);
      flame(at, 0.55, GOLD, 0.05, 0.01);
    },
    { from: 0.05, to: 0.85 },
  );

  // ---------- legs ----------
  const legBuild = (
    names: string[],
    parent: any,
    pts: THREE.Vector3[],
    radii: number[],
    x: number,
    zf: number,
  ) => {
    const leg = b.chain(names[0].replace(/\d+$/, "") + "Leg", pts, { parent, names, role: "leg" });
    b.sweep(leg, radii, { color: INDIGO });
    const tip = leg.tip ?? undefined;
    b.part(new THREE.SphereGeometry(0.08, 8, 6), CREAM, {
      bone: tip,
      at: [x, 0.055, zf + 0.04],
      scale: [0.95, 0.7, 1.35],
    });
    for (const k of [-1, 0, 1]) {
      b.spike([x + k * 0.038, 0.045, zf + 0.12], [k * 0.12, -0.25, 1], 0.045, 0.012, { bone: tip, color: SUMI });
      b.part(new THREE.BoxGeometry(0.008, 0.01, 0.07), SUMI, { bone: tip, at: [x + k * 0.02 + 0.0, 0.1, zf + 0.09] });
    }
    // gold shin band and vermilion ankle band
    const ring = (p: THREE.Vector3, q: THREE.Vector3, r: number, c: string) =>
      b.part(new THREE.TorusGeometry(r, 0.011, 4, 10), c, {
        bone: leg.joints[1],
        at: p,
        dir: q.clone().sub(pts[1]).normalize(),
        axis: "z",
      });
    ring(pts[1].clone().lerp(pts[2], 0.5), pts[2], 0.078, GOLD);
    ring(pts[2], pts[3], 0.066, VERM);
    return leg;
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hindPts = limb(
      [s * 0.2, 0.75, -0.5],
      [s * 0.2, 0.055, -0.56],
      [0.36, 0.34, 0.1],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    legBuild([`hip${L}`, `knee${L}`, `hock${L}`, `foot${L}`], hips, hindPts, [0.14, 0.095, 0.065, 0.052], s * 0.2, -0.56);

    const frontPts = limb(
      [s * 0.2, 0.78, 0.4],
      [s * 0.2, 0.055, 0.44],
      [0.36, 0.34, 0.1],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    legBuild(
      [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
      chest,
      frontPts,
      [0.12, 0.09, 0.065, 0.054],
      s * 0.2,
      0.44,
    );
  }

  // ---------- tail ----------
  const tailPath = catmull([
    [0, 0.88, -0.78],
    [0, 0.84, -1.05],
    [0, 0.78, -1.28],
    [0, 0.88, -1.46],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail" });
  b.sweep(tail, [0.07, 0.05, 0.04, 0.032], { color: INDIGO, bands: [[0.7, INDIGO], [1, CREAM]] });
  b.ring(tail.at(1), { count: 8, radius: 0.02, tilt: 40 }, (item: any) => {
    b.spike(item, item, 0.2, 0.04, { color: rand() > 0.5 ? VERM : GOLD });
  });

  // ---------- surface motifs ----------
  const skin = b.surface(body);
  const waveRings: [number, string][] = [
    [0.07, INDIGO],
    [0.057, PALE],
    [0.043, INDIGO],
    [0.029, PALE],
    [0.015, VERM],
  ];
  const hits = skin.scatter(16, {
    rng: rng(5),
    minDist: 0.13,
    filter: (h: any) => h.n.y > -0.2 && h.at.z > -0.25 && h.at.z < 0.2,
  });
  for (const h of hits)
    waveRings.forEach(([r, c], k) =>
      b.stick(new THREE.CylinderGeometry(r, r, 0.01, 10), c, h.moved([0, k * 0.004, 0]), { embed: 0.5 }),
    );

  // shoulder and hip gold curls
  for (const s of [1, -1]) {
    for (const [cz, cy] of [
      [0.4, 0.98],
      [-0.5, 0.95],
    ]) {
      const h = skin.around([0, cy - 0.05, cz]).at(s * 90, 15);
      if (!h) continue;
      const c = offset(h, h.n, 0.012);
      const from = offset(c, [0, 1, 0], 0.1);
      b.sweep(spiral(c, from, h.n, { turns: 1.6, r1: 0.015, pitch: 0 }), 0.011, {
        bone: h.bone ?? undefined,
        color: GOLD,
      });
    }
    // seal cartouche
    const sh = skin.around([0, 0.9, -0.3]).at(s * 90, 28);
    if (sh) {
      b.stick(new THREE.BoxGeometry(0.1, 0.012, 0.14), VERM, sh, { embed: 0.4 });
      b.stick(new THREE.BoxGeometry(0.07, 0.006, 0.1), CREAM, sh.moved([0, 0.005, 0]), { embed: 0.3 });
      b.stick(new THREE.BoxGeometry(0.035, 0.006, 0.06), SUMI, sh.moved([0, 0.009, 0]), { embed: 0.3 });
    }
  }

  // belly flame-edge trim: pale blue band under body
  b.sweep(skin.loop(chest, { lift: 0.004 }), 0.012, { color: GOLD });

  // ---------- dream orbs ----------
  const orbs: [number[], number][] = [
    [[0.28, 0.78, 1.6], 0.05],
    [[-0.22, 0.95, 1.78], 0.035],
    [[0.06, 0.62, 1.72], 0.03],
  ];
  for (const [p, r] of orbs) {
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), PALE, { bone: head, at: p }), 1.4);
    b.part(new THREE.TorusGeometry(r * 1.5, 0.004, 4, 12), CREAM, { bone: head, at: p, dir: [0, 0.3, 1], axis: "z" });
  }

  // darker prussian cloud-puff chest tufts for color depth
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.07, 6, 5), PRUSSIAN, {
      bone: chest,
      at: [s * 0.14, 0.7, 0.62],
      scale: [1, 0.8, 1],
    });

  return b.root;
}
