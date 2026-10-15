import * as THREE from "three";
import { createBuilder, limb, catmull, rng, noise, DEG } from "../../../../src/index";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  stepped,
  tileBox,
} from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Branch Stand",
  description:
    "A pixel-art koala sitting on a gum-tree branch and gripping it with both hands, mounted on a wooden stand with a brass plaque, leafy twigs and gumnuts.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette. One texel size (2 cm) is used for every box, paint and texture.
const TEXEL = 0.02;
const FUR = ["#3b3e48", "#575b66", "#747985", "#9399a5", "#b4b9c3"];
const CREAM = ["#b9ad94", "#d3c8ae", "#e8dfc6", "#f7f1e0"];
const DARK = "#2b2c35";
const CLAW = "#e9e1cf";
const BARK = ["#6f6c58", "#8e8c6e", "#aeaa88", "#cfc9a6", "#ebe5c6"];
const LEAFG = ["#27503f", "#386e52", "#54906a", "#82b488", "#b3d4a2"];
const WOOD = ["#3f281b", "#583826", "#76502f", "#946a3e"];
const TWIGC = "#7d5240";

type V = number[];
const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

// Fur tone: lit from above, mottled, with a few light and dark flecks.
const furTone = (c: Cell, seed: number, bias: number) => {
  const v = 0.5 + bias + 0.28 * c.n.y + 0.6 * (noise(c.at, 0.13, seed) - 0.5);
  const r = c.random(seed + 7);
  return c.pick(FUR, r < 0.06 ? v + 0.25 : r > 0.95 ? v - 0.25 : v);
};
const furPaint = (seed: number, bias = 0) => cellPaint(TEXEL, (c) => furTone(c, seed, bias), { dither: true });

const BODY = cellPaint(
  TEXEL,
  (c) => {
    const chest =
      c.n.z > 0.35 && Math.abs(c.at.x) < 0.17 + 0.03 * c.random(4) && c.at.y > 0.6 + 0.04 * c.random(5);
    if (chest) return c.pick(CREAM, 0.55 + 0.3 * c.n.y + 0.3 * (noise(c.at, 0.1, 6) - 0.5));
    return furTone(c, 1, 0);
  },
  { dither: true },
);
const LIMB = furPaint(2, -0.1);
const FURP = furPaint(3, 0);
const CREAMP = cellPaint(TEXEL, (c) => c.pick(CREAM, 0.5 + 0.3 * c.n.y + 0.4 * (noise(c.at, 0.08, 2) - 0.5)), {
  dither: true,
});

const bark = (vertical: boolean) =>
  cellPaint(
    TEXEL,
    (c) => {
      const q = vertical
        ? new THREE.Vector3(c.at.x * 3.5, c.at.y * 0.6, c.at.z * 3.5)
        : new THREE.Vector3(c.at.x * 0.6, c.at.y * 3.5, c.at.z * 3.5);
      const v = noise(q, 0.14, 4);
      if (c.random(2) < 0.035) return "#4f4c3b";
      if (c.random(8) < 0.03) return "#ece6c8";
      return c.pick(BARK, 0.25 + 0.7 * v + 0.1 * c.n.y);
    },
    { dither: true },
  );
const BARK_V = bark(true);
const BARK_H = bark(false);

const LEAFP = cellPaint(TEXEL, (c) => c.pick(LEAFG, 0.45 + 0.35 * c.n.y + 0.4 * (noise(c.at, 0.15, 9) - 0.5)), {
  dither: true,
});

// Leaf outlines: lanceolate staircases, centred on the stem line.
const LEAF_COLS: [number, number][] = [
  [-0.5, 0.5],
  [-1.5, 1.5],
  [-1.5, 1.5],
  [-1.5, 1.5],
  [-1.5, 1.5],
  [-1, 1],
  [-1, 1],
  [-0.5, 0.5],
];
const LEAF_L = stepped(LEAF_COLS, 0.02);
const LEAF_S = stepped(LEAF_COLS, 0.014);

// ---------------------------------------------------------------------------------------------------------------
// Textures
const NOSE = pixelArt([".mmmm.", "mhhmmm", "mhmmmm", "mmmmmm", "mnmmnm", "mmmmmm", ".mmmm."], {
  m: "#26252f",
  h: "#6d6b80",
  n: "#0a090d",
});
const EARIN = pixelArt(
  ["..wwww..", ".wccccw.", "wccddccw", "wcddddcw", "wcddddcw", "wccddccw", ".wccccw.", "..wwww.."],
  { w: "#fbf6ea", c: "#e8dcc2", d: "#b9a98c" },
);
const PLAQUE = pixelArt(
  [
    "bbbbbbbbbbbbbb",
    "bYYYYYYYYYYYYb",
    "bYYYYYYYYYGGYb",
    "bYYYYYYYGGGGYb",
    "bYYYYYGGGGgYYb",
    "bYYYGGGGgYYYYb",
    "bYYGGggYYYYYYb",
    "bYYdYYYYYYYYYb",
    "bbbbbbbbbbbbbb",
  ],
  { b: "#5a3c14", Y: "#e0b04a", G: "#2f6a3c", g: "#6faa5a", d: "#7a5420" },
);
const WOODT = pixelTexture(72, 40, (g) => {
  const rr = rng(21);
  g.fill((x, y) => {
    const row = Math.floor(y / 10);
    const ly = y % 10;
    if (ly === 0 || x === (row * 29 + 11) % 72) return WOOD[0];
    const v = 0.55 + 0.12 * Math.sin(x * 0.45 + row * 5 + ly * 0.3) + (rr() - 0.5) * 0.25 + (ly === 1 ? 0.15 : 0);
    return pick(WOOD, v, bayer(x, y));
  });
});

export default function build() {
  const b = createBuilder({ name: "koala_on_gum_branch" });
  const R = rng(7);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: stand (root) -> hips -> spine -> head -> jaw / ears, arms and legs with digits.
  const stand = b.joint("stand", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: stand, at: [0, 0.62, -0.03], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, -0.03],
      [0, 0.76, -0.02],
      [0, 0.88, 0.02],
      [0, 1.0, 0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 1.0, 0.05], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.985, 0.1], dir: [0, 0, 1], role: "jaw" });

  const put = (g: THREE.BufferGeometry, color: unknown, at: V, bone: unknown, extra: object = {}) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    b.part(g, color as any, { bone: bone as any, at, ...extra });

  // -------------------------------------------------------------------------------------------------------------
  // Stand: wooden base, eucalyptus trunk and the seat branch.
  const rBase = rng(3);
  put(tileBox([1.5, 0.04, 0.7], WOODT, TEXEL, { rand: rBase, step: [1, 10] }), "#ffffff", [0, 0.02, 0], stand, {
    texture: WOODT,
  });
  put(tileBox([1.4, 0.04, 0.6], WOODT, TEXEL, { rand: rBase, step: [1, 10] }), "#ffffff", [0, 0.06, 0], stand, {
    texture: WOODT,
  });
  put(bx(0.24, 0.07, 0.24), BARK_V, [-0.55, 0.1, 0], stand);

  const trunk = b.sweep(
    catmull([
      [-0.55, 0.07, 0],
      [-0.55, 0.55, 0],
      [-0.54, 1.05, 0],
      [-0.56, 1.55, 0],
    ]),
    [0.085, 0.055],
    { section: "box", color: BARK_V, bone: stand, caps: "flat" },
  );
  // Seat branch (the koala sits on it) and its brace.
  b.rod([-0.58, 0.5, 0], [0.6, 0.5, 0], [0.055, 0.035], BARK_H, { bone: stand, section: "box" });
  put(bx(0.025, 0.09, 0.09), "#d9d0a8", [0.607, 0.5, 0], stand);
  put(bx(0.07, 0.07, 0.07), BARK_H, [0.3, 0.535, -0.035], stand); // knot
  b.rod([-0.55, 0.26, 0], [-0.28, 0.465, 0], 0.025, BARK_H, { bone: stand, section: "box" });

  // Peeling bark strips on the trunk.
  const trunkSkin = b.surface(trunk);
  for (const h of trunkSkin.scatter(24, { rng: rng(12), minDist: 0.11, filter: (hh) => Math.abs(hh.n.y) < 0.3 })) {
    const col = ["#e4ddb9", "#c9c19a", "#6f6d56"][Math.floor(R() * 3)];
    b.stick(bx(0.04, 0.014, 0.16), col, h, { embed: 0.4, flow: [0, 1, 0] });
  }

  // Brass plaque.
  put(bx(0.28, 0.16, 0.03), "#ffffff", [0.45, 0.16, 0.27], stand, { texture: PLAQUE });

  // -------------------------------------------------------------------------------------------------------------
  // Torso: stacked blocks on the spine bones, painted as one fur field with a cream chest.
  const layers: [number, number, number, number, number, number][] = [
    [0.55, 0.66, 0.38, 0.3, -0.05, 0],
    [0.66, 0.76, 0.46, 0.36, -0.04, 0],
    [0.76, 0.86, 0.46, 0.36, -0.02, 1],
    [0.86, 0.94, 0.4, 0.32, 0.01, 2],
    [0.94, 1.0, 0.3, 0.26, 0.04, 2],
  ];
  const torso = layers.map(([y0, y1, w, d, zc, bi]) =>
    put(bx(w, y1 - y0, d), BODY, [0, (y0 + y1) / 2, zc], spine.joints[bi]),
  );

  // -------------------------------------------------------------------------------------------------------------
  // Helpers for digits.
  function digit(name: string, parent: unknown, a: V, t: V, w: number, th: number, claw = true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = b.joint(name, { parent: parent as any, at: a, aim: t, role: "digit" });
    const A = new THREE.Vector3(...(a as [number, number, number]));
    const T = new THREE.Vector3(...(t as [number, number, number]));
    const d = T.clone().sub(A);
    const len = d.length();
    const dir = d.clone().normalize();
    const m = A.clone().add(T).multiplyScalar(0.5);
    b.part(bx(w, len, th), DARK, { bone: j, at: m.toArray(), dir: dir.toArray() });
    if (claw)
      b.part(bx(w * 0.8, 0.022, th * 0.8), CLAW, {
        bone: j,
        at: T.clone().addScaledVector(dir, 0.01).toArray(),
        dir: dir.toArray(),
      });
    return j;
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs (hanging forward over the branch) and arms (gripping it).
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const hipP: V = [s * 0.15, 0.64, 0.0];
    const footP: V = [s * 0.19, 0.33, 0.22];
    const leg = b.chain(`leg${side}`, limb(hipP, footP, [0.24, 0.24], [0, 1, 1.5]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.085, 0.055], { section: "box", color: LIMB });
    put(bx(0.17, 0.15, 0.19), LIMB, hipP, leg.joints[0]);
    put(bx(0.11, 0.11, 0.11), LIMB, leg.joints[1].at.toArray(), leg.joints[1]);
    const ankle = leg.tip!;
    put(bx(0.13, 0.06, 0.15), DARK, [s * 0.19, 0.31, 0.27], ankle);
    for (let i = 0; i < 5; i++) {
      const x = s * 0.19 + (i - 2) * 0.026;
      digit(`toe${i + 1}${side}`, ankle, [x, 0.31, 0.34], [x, 0.3, 0.395], 0.024, 0.026);
    }

    const shP: V = [s * 0.19, 0.9, 0.03];
    const handP: V = [s * 0.37, 0.585, 0];
    const arm = b.chain(`arm${side}`, limb(shP, handP, [0.2, 0.2], [s, 0, -0.8]), {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.06, 0.045], { section: "box", color: LIMB });
    put(bx(0.13, 0.12, 0.13), LIMB, shP, arm.joints[0]);
    put(bx(0.09, 0.09, 0.09), LIMB, arm.joints[1].at.toArray(), arm.joints[1]);
    const wrist = arm.tip!;
    const X = s * 0.37;
    put(bx(0.11, 0.045, 0.13), DARK, [X, 0.565, 0], wrist);
    for (let i = -1; i <= 1; i++) {
      const x = X + i * 0.034;
      digit(`finger${i + 2}${side}`, wrist, [x, 0.56, 0.058], [x, 0.46, 0.056], 0.03, 0.026);
    }
    for (let j = 0; j < 2; j++) {
      const x = X + (j - 0.5) * 0.05;
      digit(`thumb${j + 1}${side}`, wrist, [x, 0.56, -0.058], [x, 0.47, -0.056], 0.034, 0.026);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: a pixel-painted skin box with a drawn face, plus nose, muzzle, jaw and ears.
  const layout = skinLayout({ head: [20, 16, 16] });
  const faces = layout.faces.head;
  const SHEET = pixelTexture(layout.size[0], layout.size[1], (g) => {
    const rf = rng(15);
    const kFor: Record<string, number> = { py: 0.72, ny: 0.22, px: 0.5, nx: 0.5, pz: 0.5, nz: 0.45 };
    for (const [face, rect] of Object.entries(faces)) {
      const k = kFor[face];
      g.fill((x, y) => pick(FUR, k + (rf() - 0.5) * 0.9, bayer(x, y)), rect);
    }
    // cheek fur on the sides
    for (const face of ["px", "nx"] as const) {
      g.fill((x, y, w) => {
        const e = face === "px" ? x : w - 1 - x;
        return y >= 8 && e <= 6 - (y - 8) * 0.5 ? pick(CREAM, 0.5 + (rf() - 0.5) * 0.6, bayer(x, y)) : undefined;
      }, faces[face]);
    }
    // front: cream cheeks, eye patches and eyes
    g.fill((x, y, w) => {
      const e = Math.min(x, w - 1 - x);
      return y >= 10 && e <= (y >= 13 ? 5 : 3) ? pick(CREAM, 0.5 + (rf() - 0.5) * 0.6, bayer(x, y)) : undefined;
    }, faces.pz);
    const [fx, fy] = faces.pz;
    const patch = ["dddd", "dddd", "dddd", "dddd", "dddd"];
    g.stamp(fx + 3, fy + 4, patch, { d: "#2c2e36" });
    g.stamp(fx + 13, fy + 4, patch, { d: "#2c2e36" });
    g.stamp(fx + 4, fy + 5, ["kw", "kk", "kk"], { k: "#101016", w: "#ffffff" });
    g.stamp(fx + 14, fy + 5, ["kw", "kk", "kk"], { k: "#101016", w: "#ffffff" });
  });
  const HC: V = [0, 1.12, 0.1];
  const skull = b.part(skinBox(SHEET, faces, TEXEL), "#ffffff", { texture: SHEET, bone: head, at: HC });

  put(bx(0.22, 0.11, 0.05), CREAMP, [0, 1.055, 0.27], head); // muzzle
  put(bx(0.12, 0.14, 0.07), "#ffffff", [0, 1.15, 0.285], head, { texture: NOSE });
  put(bx(0.1, 0.012, 0.012), DARK, [0, 1.0, 0.3], head); // mouth
  for (const s of [1, -1]) put(bx(0.012, 0.03, 0.012), DARK, [s * 0.05, 1.014, 0.3], head);
  put(bx(0.18, 0.05, 0.13), CREAMP, [0, 0.975, 0.22], jaw);

  // Ears: plus-shaped fur blocks with a drawn cream inner face and a fluffy rim.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, { parent: head, at: [s * 0.19, 1.24, 0.05], dir: [s * 0.5, 1, 0], role: "hinge" });
    const cx = s * 0.235;
    const cy = 1.31;
    const cz = 0.055;
    put(bx(0.22, 0.18, 0.05), FURP, [cx, cy, cz], ear);
    put(bx(0.18, 0.22, 0.05), FURP, [cx, cy, cz], ear);
    put(bx(0.16, 0.16, 0.02), "#ffffff", [cx, cy, cz + 0.025], ear, { texture: EARIN });
    for (let k = -2; k <= 2; k++)
      put(bx(0.036, 0.034, 0.034), CREAM[2 + (k & 1)], [cx + k * 0.04, cy + 0.108, cz + 0.02], ear);
    for (const j of [-1, 0, 1])
      put(bx(0.034, 0.036, 0.034), CREAM[3], [cx + s * 0.112, cy + j * 0.05, cz + 0.02], ear);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Fur tufts breaking up the silhouette.
  const tufts = (
    targets: Parameters<typeof b.surface>[0],
    count: number,
    seed: number,
    keep: (h: { n: THREE.Vector3; at: THREE.Vector3 }) => boolean,
    colorOf: (h: { n: THREE.Vector3; at: THREE.Vector3 }) => string,
    size: [number, number, number],
  ) => {
    const hits = b.surface(targets).scatter(count, { rng: rng(seed), minDist: 0.055, filter: keep });
    for (const h of hits) b.stick(bx(size[0], size[1], size[2]), colorOf(h), h, { embed: 0.4, flow: [0, -1, 0] });
  };
  tufts(
    torso,
    34,
    31,
    (h) => h.n.z < 0.7,
    (h) => (h.n.z > 0.4 && Math.abs(h.at.x) < 0.18 ? CREAM[1 + Math.floor(R() * 3)] : FUR[1 + Math.floor(R() * 4)]),
    [0.05, 0.06, 0.05],
  );
  tufts(
    skull,
    14,
    32,
    (h) => h.n.y > 0.7,
    () => FUR[2 + Math.floor(R() * 3)],
    [0.045, 0.05, 0.045],
  );
  tufts(
    skull,
    12,
    33,
    (h) => Math.abs(h.n.x) > 0.7 && h.at.y < 1.17,
    () => CREAM[1 + Math.floor(R() * 3)],
    [0.06, 0.07, 0.06],
  );

  // -------------------------------------------------------------------------------------------------------------
  // Foliage: flat stepped leaves on twigs, gumnuts.
  function leaf(at: V, yawDeg: number, droopDeg: number, small = false, roll = 0) {
    const yaw = yawDeg * DEG;
    const dr = droopDeg * DEG;
    const X = new THREE.Vector3(Math.sin(yaw) * Math.cos(dr), -Math.sin(dr), Math.cos(yaw) * Math.cos(dr));
    let Y = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const Z = new THREE.Vector3().crossVectors(X, Y);
    Y = Y.multiplyScalar(Math.cos(roll * DEG)).addScaledVector(Z, Math.sin(roll * DEG));
    b.extrude(small ? LEAF_S : LEAF_L, {
      at,
      x: X.toArray(),
      y: Y.toArray(),
      thickness: 0.012,
      color: LEAFP,
      bone: stand,
    });
  }
  function gum(p: V) {
    put(bx(0.035, 0.03, 0.035), "#6a5a40", p, stand);
    put(bx(0.045, 0.014, 0.045), "#9c8d62", [p[0], p[1] + 0.021, p[2]], stand);
    put(bx(0.01, 0.014, 0.01), "#4a3c28", [p[0], p[1] + 0.034, p[2]], stand);
  }
  function twig(a: V, e: V, n: number, withGum = false) {
    b.rod(a, e, [0.016, 0.01], TWIGC, { bone: stand, section: "box" });
    const dx = e[0] - a[0];
    const dy = e[1] - a[1];
    const dz = e[2] - a[2];
    const yaw0 = Math.atan2(dx, dz) / DEG;
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 0.5);
      const side = k % 2 ? 1 : -1;
      leaf(
        [a[0] + dx * t, a[1] + dy * t, a[2] + dz * t],
        yaw0 + side * (50 + R() * 25),
        12 + R() * 28,
        k < 2,
        side * (10 + R() * 15),
      );
    }
    leaf(e, yaw0, 8 + R() * 10);
    if (withGum) {
      const t = 0.45;
      const p = [a[0] + dx * t, a[1] + dy * t - 0.035, a[2] + dz * t];
      put(bx(0.008, 0.04, 0.008), TWIGC, [p[0], p[1] + 0.025, p[2]], stand);
      gum(p);
      gum([p[0] + 0.05, p[1] - 0.01, p[2] + 0.02]);
    }
  }

  // crown at the trunk top
  twig([-0.56, 1.55, 0], [-0.82, 1.78, 0.1], 5, true);
  twig([-0.56, 1.55, 0], [-0.3, 1.8, -0.04], 5);
  twig([-0.56, 1.55, 0], [-0.6, 1.88, -0.16], 4);
  twig([-0.56, 1.55, 0], [-0.6, 1.74, 0.22], 4, true);
  // side branch reaching over the koala's shoulder
  b.rod([-0.55, 1.1, 0], [-0.2, 1.46, -0.12], [0.032, 0.02], BARK_V, { bone: stand, section: "box" });
  twig([-0.2, 1.46, -0.12], [0.05, 1.62, -0.2], 5, true);
  twig([-0.2, 1.46, -0.12], [-0.28, 1.66, -0.05], 4);
  // back branch
  b.rod([-0.55, 0.8, 0], [-0.62, 0.92, -0.3], [0.03, 0.02], BARK_V, { bone: stand, section: "box" });
  twig([-0.62, 0.92, -0.3], [-0.7, 1.12, -0.5], 4);
  twig([-0.62, 0.92, -0.3], [-0.45, 1.1, -0.4], 3, true);
  // twigs sprouting from the branch tip
  twig([0.55, 0.52, 0], [0.62, 0.82, 0.04], 5, true);
  twig([0.5, 0.52, 0], [0.48, 0.85, -0.08], 4);

  return b.root;
}
