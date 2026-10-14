```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  paint,
  grain,
  mottle,
  spots,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Mossling",
  description:
    "A small forest spirit: a bark-and-moss body, a pale wooden mask face with glowing eyes, twig antlers with buds, leaf ears, a leaf collar and skirt, toadstools growing on its mossy hood. Rigged in a T-pose rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });

  // ---------- palette ----------
  const BARK = "#6e4b31";
  const BARK_D = "#46301f";
  const MOSS = "#8cbc47";
  const MOSS_D = "#557f2c";
  const MASK = "#efe4c8";
  const DARK = "#1c2620";
  const GLOW = "#d8ff6e";
  const LEAF = "#5f9e3a";
  const LEAF2 = "#3d7a35";
  const LEAF_L = "#b9dd73";
  const AUTUMN = "#e09a35";
  const RED = "#c8432f";
  const CREAM = "#f4ead2";
  const PINK = "#f2a7c3";
  const STEM = "#e8dcc0";

  const barkV = grain(BARK, BARK_D, { size: 0.035, axis: "y" });
  const barkH = grain(BARK, BARK_D, { size: 0.035, axis: "x" });
  const moss = mottle(MOSS, MOSS_D, { size: 0.05, seed: 3 });
  const bodyPaint = paint((_p, n) => (n.y > 0.5 ? moss : barkV));
  const armPaint = paint((_p, n) => (n.y > 0.55 ? moss : barkH));
  const legPaint = paint((_p, n) => (n.y > 0.6 ? moss : barkV));
  const capPaint = spots(RED, CREAM, { size: 0.025, amount: 0.3, seed: 5 });
  const earPaint = paint((_p, _n, st) =>
    Math.abs(st[1]) < 0.006 && st[0] > 0.01 ? LEAF_L : st[0] > 0.15 ? AUTUMN : LEAF,
  );

  const LEAVES = [LEAF, LEAF2, MOSS, LEAF, AUTUMN];
  const leafCol = (i: number) => LEAVES[i % LEAVES.length];

  type On = Parameters<typeof b.stick>[2];
  const leaf = (on: On, color: string, len = 1, spin = 0) =>
    b.stick(new THREE.SphereGeometry(0.04, 6, 4), color, on, {
      scale: [0.8 * len, 2.2 * len, 0.22 * len],
      embed: 0.15,
      flat: true,
      spin,
    });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.6, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.64, 0],
      [0, 0.82, 0.01],
      [0, 1.0, -0.01],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.0, -0.01], aim: [0, 1.12, 0.01], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.12, 0.01], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.01 }),
    aim: head.local({ forward: 0.2, down: 0.05 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.6, -0.08],
      [0, 0.55, -0.22],
      [0, 0.6, -0.34],
      [0, 0.72, -0.4],
    ]),
    { parent: hips, count: 3, role: "tail" },
  );

  // ---------- body ----------
  const bodyLoft = b.loft(
    [
      { at: [0, 0.5, 0], w: 0.22, h: 0.2 },
      { at: [0, 0.62, 0], w: 0.3, h: 0.26 },
      { at: [0, 0.78, 0.01], w: 0.32, h: 0.27 },
      { at: [0, 0.92, 0], w: 0.34, h: 0.24 },
      { at: [0, 1.02, -0.01], w: 0.16, h: 0.14 },
    ],
    { bone: [hips, spine], color: bodyPaint },
  );
  b.capsule([0, 0.99, -0.01], [0, 1.13, 0.01], 0.055, { bone: neck, color: bodyPaint });

  // chest glyph
  const glyph = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="26" fill="none" stroke="#d8ff6e" stroke-width="4"/>
      <path d="M32 12 C46 24 46 40 32 52 C18 40 18 24 32 12 Z" fill="#d8ff6e"/>
      <path d="M32 16 L32 50 M32 30 L40 24 M32 38 L24 32" stroke="#3c5a24" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  b.decal(bodyLoft, glyph, { at: [0, 0.76, 0.16], dir: [0, 0, 1], size: [0.13, 0.13] });

  // glowing moss flowers on the shoulders and back
  const bodySurf = b.surface(bodyLoft);
  bodySurf
    .scatter(16, { rng: rng(7), minDist: 0.06, filter: (h) => h.n.y > 0.35 })
    .forEach((h, i) => {
      b.stick(new THREE.SphereGeometry(0.014, 6, 4), i % 3 === 0 ? PINK : i % 3 === 1 ? GLOW : CREAM, h, {
        embed: 0.4,
        scale: [1, 0.6, 1],
      });
    });

  // leaf skirt and leaf collar
  b.ring(hips, { count: 14, radius: 0.14, tilt: -62 }, (it) => leaf(it, leafCol(it.i), 1.25));
  b.ring(neck, { count: 10, radius: 0.08, tilt: -55 }, (it) => leaf(it, leafCol(it.i + 2), 1.05));

  // tail with a leaf tuft
  b.sweep(tail, (t) => 0.045 * (1 - t) + 0.012, { color: barkV });
  const tp = tail.at(1);
  [
    [0, 1, -0.3],
    [0.6, 0.8, -0.4],
    [-0.6, 0.8, -0.4],
  ].forEach((d, i) => leaf(frame(tp, d), [LEAF, AUTUMN, LEAF2][i], 0.9));

  // ---------- head ----------
  const skullC = head.local({ up: 0.06 });
  const skull = b.part(new THREE.SphereGeometry(0.15, 12, 9), MASK, {
    bone: head,
    at: skullC,
    scale: [1.1, 0.95, 0.95],
    flat: true,
  });
  const hood = b.part(new THREE.SphereGeometry(0.162, 12, 8, Math.PI, Math.PI, 0, Math.PI * 0.72), moss, {
    bone: head,
    at: skullC,
    scale: [1.1, 0.95, 0.95],
    flat: true,
  });
  const headSurf = b.surface([skull, hood]);

  // face markings
  const faceTex = svg(
    `<svg viewBox="0 0 96 72" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 3 C57 9 57 18 48 25 C39 18 39 9 48 3 Z" fill="#6aa83c"/>
      <path d="M48 7 L48 22" stroke="#3d7a35" stroke-width="2.5"/>
      <path d="M19 41 C23 47 23 53 19 60 C15 53 15 47 19 41 Z" fill="#6aa83c"/>
      <path d="M77 41 C81 47 81 53 77 60 C73 53 73 47 77 41 Z" fill="#6aa83c"/>
      <ellipse cx="8" cy="44" rx="6" ry="4" fill="#f0a3a0"/>
      <ellipse cx="88" cy="44" rx="6" ry="4" fill="#f0a3a0"/>
    </svg>`,
    { size: 256 },
  );
  b.decal(skull, faceTex, { at: [0, skullC.y, 0.2], dir: [0, 0, 1], size: [0.24, 0.18] });

  // jaw, mouth, fangs
  b.part(new THREE.SphereGeometry(0.065, 8, 6), DARK, {
    bone: head,
    at: head.local({ forward: 0.1 }),
    scale: [1.1, 0.4, 0.7],
  });
  b.part(new THREE.SphereGeometry(0.1, 10, 6), MASK, {
    bone: jaw,
    at: jaw.local({ forward: 0.06, down: 0.02 }),
    scale: [1.0, 0.42, 0.85],
    flat: true,
  });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    b.part(new THREE.ConeGeometry(0.011, 0.024, 4), CREAM, {
      bone: jaw,
      at: jaw.local({ forward: 0.12, up: 0.025, left: s * 0.035 }),
      dir: [0, 1, 0],
      flat: true,
    });

    // eyes
    const eh = headSurf.around(skullC).at(s * 27, 4);
    if (eh) {
      b.stick(new THREE.SphereGeometry(0.036, 10, 8), DARK, eh, { embed: 0.55, scale: [1, 0.5, 1.25], bone: head });
      b.stick(new THREE.SphereGeometry(0.013, 6, 4), GLOW, eh.moved([0, 0.018, 0.008]), { embed: 0.3, bone: head });
    }

    // leaf ears
    b.extrude(
      [
        [0, 0],
        [0.07, 0.045],
        [0.2, 0, "sharp"],
        [0.07, -0.045],
      ],
      {
        at: head.local({ left: s * 0.14, up: 0.08 }),
        x: [s, 0.45, 0],
        y: [0, 0, 1],
        thickness: 0.012,
        bevel: 0.003,
        smoothing: 2,
        color: earPaint,
        bone: head,
      },
    );

    // antlers
    const ah = headSurf.around(skullC).at(s * 62, 48);
    if (ah) {
      const base = ah.at.clone();
      const add = (x: number, y: number, z: number) => base.clone().add(new THREE.Vector3(x, y, z));
      const ant = b.sprout(
        `antler${S}`,
        ah,
        catmull([base, add(s * 0.04, 0.1, -0.01), add(s * 0.1, 0.19, -0.04), add(s * 0.12, 0.29, -0.02)]),
        [0.024, 0.007],
        { count: 2, names: [`antler${S}1`, `antler${S}2`], color: barkV, caps: { end: "point" } },
      );
      const ch = ant.chain!;
      const tines: [number, number[], number, number][] = [
        [0.45, [s * 0.8, 0.7, 0.35], 0.09, 0.011],
        [0.72, [-s * 0.35, 0.8, 0.45], 0.075, 0.009],
      ];
      for (const [t, d, len, r] of tines) {
        const cp = ch.at(t);
        b.spike(cp, d, len, r, { color: barkV });
        const tip = cp.at.clone().add(new THREE.Vector3(d[0], d[1], d[2]).normalize().multiplyScalar(len));
        b.part(new THREE.SphereGeometry(0.014, 6, 4), GLOW, { at: tip, bone: ch.joints[ch.joints.length - 1] });
      }
      leaf(frame(ch.at(0.6), [s * 0.6, 0.4, 0.8]), LEAF, 0.7);
      leaf(frame(ch.at(1), [s * 0.3, 1, 0.3]), AUTUMN, 0.6);
    }

    // ---------- arms ----------
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.15, 0.94, 0],
        [s * 0.36, 0.93, 0],
        [s * 0.56, 0.92, 0],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" },
    );
    b.sweep(arm, [0.05, 0.032], { color: armPaint });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), moss, {
      bone: arm.joints[0],
      at: [s * 0.17, 0.96, 0],
      scale: [1.1, 0.65, 1],
      flat: true,
    });
    b.ring(arm.joints[1], { count: 6, radius: 0.035, tilt: 45 }, (it) => leaf(it, leafCol(it.i + 1), 0.55));

    const hand = arm.joints[2];
    b.part(new THREE.SphereGeometry(0.04, 8, 6), BARK, {
      bone: hand,
      at: [s * 0.59, 0.92, 0],
      scale: [1, 0.6, 1.1],
      flat: true,
    });
    const fingers = [
      { n: "index", mid: [s * 0.65, 0.92, 0.03], tip: [s * 0.7, 0.912, 0.05] },
      { n: "middle", mid: [s * 0.66, 0.92, 0], tip: [s * 0.72, 0.91, 0] },
      { n: "ring", mid: [s * 0.65, 0.92, -0.03], tip: [s * 0.7, 0.912, -0.05] },
      { n: "thumb", mid: [s * 0.6, 0.935, 0.05], tip: [s * 0.63, 0.95, 0.085] },
    ];
    for (const f of fingers) {
      const fc = b.chain(`${f.n}${S}`, polyline([[s * 0.6, 0.92, 0], f.mid, f.tip]), {
        parent: hand,
        names: [`${f.n}1${S}`, `${f.n}2${S}`],
        role: "digit",
      });
      b.sweep(fc, [0.014, 0.006], { color: BARK, caps: { end: "point" } });
    }

    // ---------- legs ----------
    const x = s * 0.1;
    const legC = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.09, 0.6, 0],
        [x, 0.34, 0.03],
        [x, 0.08, 0],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [x, 0, 0.03] },
    );
    b.sweep(legC, [0.06, 0.042], { color: legPaint });
    const ankle = legC.joints[2];
    b.part(new THREE.SphereGeometry(0.06, 8, 6), BARK, {
      bone: ankle,
      at: [x, 0.05, 0],
      scale: [1, 0.75, 1.1],
      flat: true,
    });
    for (const k of [-1, 0, 1]) {
      b.capsule([x + k * 0.025, 0.03, 0.03], [x + k * 0.05, 0.026, 0.14 - Math.abs(k) * 0.02], 0.026, {
        bone: ankle,
        color: barkV,
      });
    }
    // little knee leaf
    leaf(frame(legC.joints[1], [s * 0.3, 0.2, 1]), leafCol(s > 0 ? 4 : 1), 0.6);

    // toadstools on the hood
    const shrooms: [number, number, number][] = [
      [-s * 118, 42, s > 0 ? 1 : 0.7],
      [-s * 95, 30, s > 0 ? 0.6 : 0.45],
    ];
    for (const [az, el, k] of shrooms) {
      const mh = headSurf.around(skullC).at(az, el);
      if (!mh) continue;
      b.stick(new THREE.CylinderGeometry(0.012 * k, 0.017 * k, 0.06 * k, 6), STEM, mh, { embed: 0.3, bone: head });
      b.lathe(
        [
          [0, 0],
          [0.06 * k, 0],
          [0.064 * k, 0.012 * k],
          [0.045 * k, 0.04 * k],
          [0, 0.05 * k],
        ],
        { at: mh.moved([0, 0.038 * k, 0]), axis: mh, segments: 10, color: capPaint, bone: head },
      );
    }
  }

  return b.root;
}
```