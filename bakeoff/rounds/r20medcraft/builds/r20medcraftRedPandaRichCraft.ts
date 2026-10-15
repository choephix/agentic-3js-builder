import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, gradient, mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda with big anime eyes, a ringed tail raised for balance, a gold bell collar and a dendro leaf mark, standing on a mossy blue-grey stone with glowing flowers and a rune.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const RUST = "#e2662a";
const RUST_HI = "#f6983f";
const RUST_DK = "#b9431f";
const CHEST = "#4b2223";
const PAW = "#3a1b1d";
const CREAM = "#fff3dc";
const TEAR = "#97391f";
const NOSE = "#2b1a35";
const GOLD = "#f2c14e";
const GOLD_HI = "#ffe38a";
const TASSEL = "#d6403a";
const LEAF = "#7dff9a";
const MOSS = "#5fb340";
const MOSS_HI = "#8fdc55";
const CRACK = "#56627a";
const STEM = "#3f9a3a";
const PINK = "#ff9fc4";

// ---------------------------------------------------------------- paints
const furCoat = cel(mottle(RUST, RUST_HI, { size: 0.06, contrast: 0.8, seed: 3 }));
const bodyCoat = cel(
  furEdge(mottle(RUST, RUST_HI, { size: 0.06, contrast: 0.8, seed: 3 }), CHEST, {
    level: -0.3,
    teeth: 0.22,
    period: 0.03,
    ink: "#7a2f1c",
    inkWidth: 0.05,
  }),
);
const legCoat = cel(gradient(mottle(RUST, RUST_HI, { size: 0.06, seed: 3 }), CHEST, [0, 0.34, 0], [0, 0.28, 0]));
const tailCoat = cel(
  paint((_p, _n, s) => {
    const t = s[0];
    if (t > 0.9) return CHEST;
    const k = Math.floor(t * 9 + 0.22 * zigzag(s[1] / 45));
    return k % 2 === 0 ? RUST : RUST_DK;
  }),
);
const creamPaint = cel(CREAM);
const goldPaint = cel(GOLD);
const pawPaint = cel(PAW);

const stoneBase = mottle("#8896ad", "#6c7a92", { size: 0.07, seed: 11 });
const stoneCoat = cel(
  paint((p, n) => {
    const edge = 0.5 + 0.28 * zigzag(p.x / 0.045 + p.z / 0.06) + 0.35 * (noise(p, 0.1, 5) - 0.5);
    if (n.y > edge) return noise(p, 0.03, 9) > 0.55 ? MOSS_HI : MOSS;
    const c = cells(p, 0.12, 4);
    if (c.d2 - c.d1 < 0.05) return CRACK;
    return stoneBase;
  }),
);
const mossCoat = cel(mottle(MOSS, MOSS_HI, { size: 0.03, seed: 2 }));

// ---------------------------------------------------------------- textures
const tuft = (fill: string, hi: string, line: string) =>
  svg(
    `<svg viewBox="0 0 32 64"><path d="M16 62 C6 44 4 22 16 2 C28 22 26 44 16 62Z" fill="${fill}"/>` +
      `<path d="M16 60 C11 44 11 26 16 9" stroke="${hi}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` +
      `<path d="M16 62 C6 44 4 22 16 2" stroke="${line}" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );
const TUFT_RUST = tuft(RUST, RUST_HI, "#8a2f1b");
const TUFT_HI = tuft(RUST_HI, "#ffc27a", "#b9431f");
const TUFT_DARK = tuft(RUST_DK, RUST, "#5a1f17");
const TUFT_CREAM = tuft(CREAM, "#ffffff", "#d9b48a");
const MOSS_TEX = svg(
  `<svg viewBox="0 0 64 48"><path d="M8 48 C6 30 10 14 16 6 C20 20 22 34 24 48Z" fill="#4a9a3a"/>` +
    `<path d="M22 48 C22 28 28 10 34 2 C38 18 40 34 42 48Z" fill="#6ec24a"/>` +
    `<path d="M38 48 C40 30 46 16 56 10 C54 26 52 38 54 48Z" fill="#8fdc55"/>` +
    `<path d="M34 46 C34 30 34 16 34 6" stroke="#b7f07a" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const GRASS_TEX = svg(
  `<svg viewBox="0 0 48 64"><path d="M6 64 C8 40 10 20 6 4 C16 22 20 44 20 64Z" fill="#3f9a3a"/>` +
    `<path d="M18 64 C20 36 24 16 26 0 C34 22 34 44 34 64Z" fill="#5fb340"/>` +
    `<path d="M32 64 C34 44 38 26 44 12 C46 30 44 50 44 64Z" fill="#7acb4a"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#8dff9e" stroke-width="5"/>` +
    `<circle cx="50" cy="50" r="35" fill="none" stroke="#8dff9e" stroke-width="3" stroke-dasharray="6 6"/>` +
    `<path d="M50 20 C70 36 70 62 50 80 C30 62 30 36 50 20Z" fill="none" stroke="#8dff9e" stroke-width="5" stroke-linejoin="round"/>` +
    `<path d="M50 28 L50 74 M50 50 L62 40 M50 60 L38 50" stroke="#8dff9e" stroke-width="4" stroke-linecap="round" fill="none"/>` +
    `<circle cx="50" cy="8" r="3.5" fill="#8dff9e"/><circle cx="50" cy="92" r="3.5" fill="#8dff9e"/>` +
    `<circle cx="8" cy="50" r="3.5" fill="#8dff9e"/><circle cx="92" cy="50" r="3.5" fill="#8dff9e"/></svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- head constants
const HS = 1.1; // head scale
const HC: [number, number, number] = [0, 0.4, 0.355];
const S = (v: number) => v * HS;
const H = (x: number, y: number, z: number): [number, number, number] => [
  HC[0] + x * HS,
  HC[1] + y * HS,
  HC[2] + z * HS,
];

const headCoat = cel(
  paint((p) => {
    const dx = Math.abs(p.x - HC[0]) / HS;
    const dy = (p.y - HC[1]) / HS;
    const dz = (p.z - HC[2]) / HS;
    const edge = -0.005 + 0.012 * zigzag(dz / 0.022 + dx / 0.05);
    if (dy < edge && dz > -0.03) {
      if (dx > 0.04 && dx < 0.062 && dy < -0.012 && dy > -0.07 && dz > 0.02) return TEAR;
      return CREAM;
    }
    if (dy > 0.026 && dy < 0.045 && dx > 0.025 && dx < 0.07 && dz > 0.04) return CREAM;
    return mottle(RUST, RUST_HI, { size: 0.05, seed: 7 });
  }),
);

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const R = rng(5);

  // ------------------------------------------------------------ skeleton
  const base = b.joint("base", { at: [0, 0.2, 0] });
  const hips = b.joint("hips", { parent: base, at: [0, 0.36, -0.2], dir: [0, 0.06, 1], role: "spine" });

  const bodyPts: Array<[number, number, number]> = [
    [0, 0.355, -0.23],
    [0, 0.37, -0.1],
    [0, 0.375, 0.05],
    [0, 0.375, 0.17],
    [0, 0.385, 0.25],
    [0, 0.385, 0.29],
  ];
  const body = catmull(bodyPts);
  const t1 = body.closestT(bodyPts[3]);
  const spine = b.chain("spine", body.slice(0, t1), { parent: hips, count: 4, role: "spine" });
  const spineEnd = spine.joints[spine.joints.length - 1];
  const neck = b.chain("neck", body.slice(t1, 1), { parent: spineEnd, count: 2, role: "neck" });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 0.385, 0.29],
    dir: [0, -0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.05, 0.02), aim: H(0, -0.065, 0.12), role: "jaw" });

  const tailPath = catmull([
    [0, 0.355, -0.22],
    [0, 0.36, -0.34],
    [0, 0.42, -0.46],
    [0, 0.53, -0.53],
    [0, 0.64, -0.52],
    [0, 0.71, -0.46],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 5, role: "tail" });

  // ------------------------------------------------------------ stone
  const profile = [
    [0, 0],
    [0.27, 0],
    [0.32, 0.05],
    [0.345, 0.12],
    [0.32, 0.18],
    [0.25, 0.2],
    [0, 0.2],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const stone = b.part(new THREE.LatheGeometry(profile, 10), stoneCoat, {
    bone: base,
    at: [0, 0, 0],
    scale: [1, 1, 1.18],
    flat: true,
    name: "stone",
  });
  const rock = (x: number, z: number, r: number, sx: number, sy: number, sz: number) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), stoneCoat, {
      bone: base,
      at: [x, r * sy - 0.003, z],
      scale: [sx, sy, sz],
      flat: true,
    });
  rock(0.4, 0.12, 0.09, 1, 0.7, 1.1);
  rock(-0.39, -0.1, 0.08, 1.1, 0.65, 0.9);
  rock(0.13, 0.47, 0.07, 1, 0.6, 1);
  rock(-0.25, 0.44, 0.06, 1, 0.7, 1);
  rock(0.33, -0.35, 0.055, 1, 0.8, 1);
  rock(-0.3, 0.33, 0.045, 1, 0.7, 1);
  for (const [x, z, r] of [
    [0.2, 0.12, 0.05],
    [-0.2, 0.1, 0.045],
    [0.2, -0.12, 0.05],
    [-0.2, -0.12, 0.045],
    [0.17, -0.2, 0.04],
    [-0.15, 0.24, 0.04],
    [0.14, 0.25, 0.035],
  ])
    b.part(new THREE.SphereGeometry(r, 7, 5), mossCoat, { bone: base, at: [x, 0.2, z], scale: [1, 0.5, 1] });

  // moss tufts and grass
  const stoneSkin = b.surface(stone);
  const mossHits = stoneSkin.scatter(70, {
    rng: R,
    minDist: 0.04,
    filter: (h) => h.n.y > 0.5 && h.at.y > 0.15 && (Math.abs(h.at.x) > 0.11 || Math.abs(h.at.z) > 0.27),
  });
  b.cards(mossHits, MOSS_TEX, { size: [0.045, 0.04], lean: 25, vary: 0.3, spin: 180, cross: true, rng: R, bone: base });
  const grassFrames = [];
  const grassDirs: Array<[number, number, number]> = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + 0.1 * Math.sin(i * 3.1);
    const rr = 0.3 + 0.03 * Math.sin(i * 2.3);
    grassFrames.push(frame([Math.cos(a) * rr, 0, Math.sin(a) * rr * 1.18], [0, 1, 0]));
    grassDirs.push([Math.cos(a), 0, Math.sin(a)]);
  }
  b.cards(grassFrames, GRASS_TEX, {
    size: [0.05, 0.1],
    lean: 18,
    bend: 25,
    vary: 0.3,
    flow: (_f, i) => grassDirs[i],
    rng: R,
    bone: base,
    sink: 0.05,
  });

  glow(
    b.decal(stone, RUNE, {
      at: [0, 0.11, 0.42],
      dir: [0, 0, 1],
      size: [0.15, 0.15],
      bone: base,
    }),
    1.2,
  );

  // glowing dendro flowers
  const flower = (x: number, z: number, h: number) => {
    const top: [number, number, number] = [x, 0.2 + h, z + 0.008];
    b.rod([x, 0.19, z], top, 0.004, STEM, { bone: base, sides: 4 });
    b.ring(frame(top, [0, 1, 0.3]), { count: 5, radius: 0.012 }, (item) =>
      b.stick(new THREE.SphereGeometry(0.01, 5, 4), PINK, item, { bone: base, scale: [1, 1, 0.5] }),
    );
    glow(b.part(new THREE.SphereGeometry(0.008, 6, 4), LEAF, { at: top, bone: base }));
  };
  flower(0.2, 0.0, 0.07);
  flower(-0.19, 0.04, 0.055);
  flower(-0.17, -0.2, 0.065);

  // ------------------------------------------------------------ body
  const bodySweep = b.sweep(body, [0.052, 0.082, 0.093, 0.092, 0.082, 0.07, 0.066], {
    bone: [spine, neck],
    color: bodyCoat,
  });
  const bodySkin = b.surface(bodySweep);

  // haunches and shoulders
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), furCoat, {
      bone: hips,
      at: [s * 0.075, 0.335, -0.17],
      scale: [0.045, 0.065, 0.075],
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), furCoat, {
      bone: spineEnd,
      at: [s * 0.075, 0.34, 0.15],
      scale: [0.04, 0.06, 0.065],
    });
  }

  // fur tufts on the back
  const backHits = bodySkin.scatter(130, { rng: R, minDist: 0.03, filter: (h) => h.n.y > -0.05 });
  b.cards(backHits, [TUFT_RUST, TUFT_HI, TUFT_RUST], {
    size: [0.032, 0.055],
    lean: 62,
    bend: 25,
    vary: 0.3,
    spin: 20,
    flow: [0, -0.2, -1],
    rng: R,
  });

  // ------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const specs = [
      {
        key: "H",
        root: [s * 0.07, 0.325, -0.17],
        foot: [s * 0.078, 0.228, -0.2],
        lens: [0.075, 0.075],
        bend: [0, 0, 1],
        parent: hips,
      },
      {
        key: "F",
        root: [s * 0.07, 0.335, 0.15],
        foot: [s * 0.078, 0.228, 0.205],
        lens: [0.08, 0.08],
        bend: [0, 0, -1],
        parent: spineEnd,
      },
    ];
    for (const sp of specs) {
      const pts = limb(sp.root, sp.foot, sp.lens, sp.bend);
      const leg = b.chain(`leg${sp.key}${side}`, pts, {
        parent: sp.parent,
        names: [`hip${sp.key}${side}`, `knee${sp.key}${side}`, `ankle${sp.key}${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.048, 0.04, 0.032], { color: legCoat });
      const foot = leg.joints[leg.joints.length - 1];
      const px = sp.foot[0];
      const pz = sp.foot[2] + 0.012;
      b.part(new THREE.SphereGeometry(1, 8, 6), pawPaint, {
        bone: foot,
        at: [px, 0.222, pz],
        scale: [0.036, 0.022, 0.05],
      });
      for (const dx of [-0.014, 0, 0.014]) {
        b.part(new THREE.SphereGeometry(1, 6, 4), pawPaint, {
          bone: foot,
          at: [px + dx, 0.213, pz + 0.04],
          scale: [0.012, 0.01, 0.014],
        });
        b.spike([px + dx, 0.21, pz + 0.05], [0, -0.2, 1], 0.017, 0.004, {
          color: creamPaint,
          bone: foot,
          sides: 4,
        });
      }
    }
  }

  // ------------------------------------------------------------ tail
  const tailSweep = b.sweep(tail, [0.045, 0.062, 0.078, 0.08, 0.068, 0.04], { color: tailCoat });
  const tailSkin = b.surface(tailSweep);
  const tailHits = tailSkin.scatter(80, { rng: R, minDist: 0.028 });
  b.cards(tailHits, [TUFT_RUST, TUFT_DARK, TUFT_DARK, TUFT_HI], {
    size: [0.04, 0.06],
    lean: 55,
    bend: 20,
    vary: 0.3,
    spin: 20,
    flow: [0, 0.6, -0.6],
    rng: R,
  });
  const tailBand = tailSkin.loop(tail.joints[2], { lift: 0.004 });
  b.sweep(tailBand, 0.008, { color: goldPaint, bone: tail.joints[2] });

  // ------------------------------------------------------------ head
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), headCoat, {
    bone: head,
    at: HC,
    scale: [S(0.095), S(0.082), S(0.09)],
    name: "skull",
  });
  const skullSkin = b.surface(skull);

  const EYE = animeEye({ iris: "#3fc47a", irisLight: "#b6ffcf" });
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 37, 3);
    if (hit) b.decal(skullSkin, EYE, { at: hit, size: [S(0.058), S(0.08)], mirror: s > 0 });
  }

  // dendro leaf mark on the forehead
  const leafOutline: OutlinePoint[] = [
    [0, -0.012],
    [0.008, -0.002],
    [0.0075, 0.01],
    [0, 0.024, "sharp"],
    [-0.0075, 0.01],
    [-0.008, -0.002],
  ];
  const markHit = skullSkin.around(HC).at(0, 42);
  if (markHit)
    glow(
      b.extrude(leafOutline, {
        at: markHit.moved([0, 0.0015, 0]),
        x: [1, 0, 0],
        y: [0, 0.77, -0.64],
        thickness: 0.004,
        smoothing: 1,
        color: LEAF,
        bone: head,
      }),
      1.3,
    );

  // muzzle, nose, jaw
  const muzzle = b.part(new THREE.SphereGeometry(1, 12, 8), creamPaint, {
    bone: head,
    at: H(0, -0.03, 0.085),
    scale: [S(0.05), S(0.04), S(0.055)],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: H(0, -0.01, 0.142),
    scale: [S(0.016), S(0.011), S(0.012)],
  });
  b.part(new THREE.SphereGeometry(1, 5, 4), "#ffffff", {
    bone: head,
    at: H(0.004, -0.0, 0.15),
    scale: [S(0.004), S(0.003), S(0.003)],
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), creamPaint, {
    bone: jaw,
    at: H(0, -0.062, 0.085),
    scale: [S(0.036), S(0.016), S(0.05)],
    name: "lowerJaw",
  });
  const smile = catmull([H(-0.032, -0.038, 0.1), H(-0.012, -0.043, 0.125), H(0.012, -0.043, 0.125), H(0.032, -0.038, 0.1)]);
  b.sweep(b.surface(muzzle).drape(smile, { lift: 0.002 }), 0.0022, { color: INK, sides: 4, bone: head });

  // ears: white rim, rust back, dark inner, cream tuft
  const earOutline = (k: number): OutlinePoint[] =>
    (
      [
        [-0.032, 0],
        [-0.039, 0.022],
        [-0.03, 0.044],
        [-0.012, 0.059],
        [0.012, 0.059],
        [0.03, 0.044],
        [0.039, 0.022],
        [0.032, 0],
      ] as Array<[number, number]>
    ).map(([x, y]) => [x * k * HS, y * k * HS] as [number, number]);
  for (const s of [1, -1]) {
    const o = H(s * 0.07, 0.052, -0.01);
    const layer = (k: number, dz: number, dy: number, thick: number, color: string | ReturnType<typeof cel>) =>
      b.extrude(earOutline(k), {
        at: [o[0], o[1] + dy * HS, o[2] + dz * HS],
        x: [1, -s * 0.5, 0],
        y: [s * 0.5, 1, 0],
        thickness: thick,
        bevel: 0.002,
        smoothing: 1,
        color,
        bone: head,
      });
    layer(1.2, 0, 0, 0.02, creamPaint);
    layer(0.95, -0.0045, 0.004, 0.014, furCoat);
    layer(0.7, 0.0105, 0.008, 0.004, cel("#5a2a2a"));
    layer(0.4, 0.0125, 0.004, 0.004, creamPaint);
  }

  // cheek ruffs
  for (const s of [1, -1]) {
    const dirs: Array<[number, number, number]> = [
      [s, -0.4, -0.3],
      [s, -0.1, -0.5],
      [s, -0.7, 0.0],
    ];
    dirs.forEach((d, i) =>
      b.spike(H(s * 0.072, -0.012 - i * 0.012, 0.025 - i * 0.012), d, S(0.07), S(0.028), {
        color: creamPaint,
        bone: head,
        sides: 5,
      }),
    );
    // whiskers
    for (let i = 0; i < 3; i++)
      b.spike(H(s * 0.04, -0.035 - i * 0.004, 0.12), [s, (i - 1) * 0.25, 0.25], 0.09, 0.0014, {
        color: "#fff6df",
        bone: head,
        sides: 3,
      });
  }
  const cheekHits = skullSkin.scatter(40, {
    rng: R,
    minDist: 0.03,
    filter: (h) => Math.abs(h.n.x) > 0.5 && h.at.y < HC[1] - 0.005 && h.at.z > HC[2] - 0.05,
  });
  b.cards(cheekHits, TUFT_CREAM, { size: [0.03, 0.045], lean: 70, bend: 20, vary: 0.25, flow: [0, -0.2, -1], rng: R, bone: head });

  // flower hairpin on the right ear base
  b.ring(frame(H(-0.07, 0.035, 0.035), [-0.7, 0.3, 0.6]), { count: 5, radius: 0.014 }, (item) =>
    b.stick(new THREE.SphereGeometry(0.01, 5, 4), PINK, item, { bone: head, scale: [1, 1, 0.5] }),
  );
  glow(b.part(new THREE.SphereGeometry(0.008, 6, 4), LEAF, { at: H(-0.077, 0.038, 0.04), bone: head }));

  // ------------------------------------------------------------ collar
  const collarJoint = neck.joints[0];
  const loop = bodySkin.loop(collarJoint, { lift: 0.004 });
  b.sweep(loop, 0.01, { color: goldPaint, bone: collarJoint });
  b.along(loop, 16, (at) =>
    b.part(new THREE.SphereGeometry(0.0075, 5, 4), GOLD_HI, { at, bone: collarJoint }),
  );
  const bellHit = bodySkin.around(collarJoint).at(0, -45);
  if (bellHit) {
    b.stick(new THREE.SphereGeometry(0.02, 8, 6), GOLD, bellHit, { embed: 0.3, bone: collarJoint });
    b.spike([bellHit.at.x, bellHit.at.y - 0.015, bellHit.at.z + 0.012], [0, -1, 0.1], 0.055, 0.012, {
      color: TASSEL,
      bone: collarJoint,
      sides: 6,
    });
  }
  const gemHit = bodySkin.around(collarJoint).at(0, -22);
  if (gemHit)
    glow(
      b.stick(new THREE.OctahedronGeometry(0.014, 0), LEAF, gemHit, { embed: 0.2, bone: collarJoint, scale: [1, 1.5, 1] }),
      1.3,
    );

  return b.root;
}
