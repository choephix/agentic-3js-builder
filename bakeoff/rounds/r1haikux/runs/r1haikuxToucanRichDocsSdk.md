```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, limb, mottle, paint, rng, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed toucan on a mossy branch",
  description:
    "Glossy black keel-billed toucan with a lime, sky and orange rainbow bill tipped in cherry red, lime eye rings, a lemon bib, bright blue feet and a scarlet undertail, perched on a mossy stump branch beside a pink orchid.",
};

// The bird is laid out in design units and converted to metres once (K metres per unit).
const K = 0.6;
const P = (x: number, y: number, z: number): [number, number, number] => [x * K, y * K, z * K];
const R = (v: number): number => v * K;

// palette
const BLACK = "#16171c";
const WING = "#23263a";
const YELLOW = "#ffe327";
const LIME = "#9ee62b";
const SKY = "#38b8ff";
const ORANGE = "#ff8a1c";
const RED = "#d61b2d";
const BLUE = "#1d8ff5";
const PINK = "#ff7bbd";
const PINK_DEEP = "#ff58a6";
const LIP = "#ff2f8e";
const COLUMN = "#fff3f8";
const STEM = "#4f9b36";
const BARK = "#6e4b2e";
const BARK_DARK = "#442d19";
const MOSS = "#7bb53a";
const MOSS_DARK = "#2e6b26";

// the perch: branch axis height, radius and the orbit the toes wrap on
const BR_Y = 0.71;
const BR_R = 0.046;
const TOE_R = 0.009;
const ORBIT = BR_R + TOE_R;
const PERCH = BR_Y + ORBIT; // ankle height (design units)

const orbit = (x: number, deg: number): [number, number, number] => {
  const a = (deg * Math.PI) / 180;
  return P(x, BR_Y + ORBIT * Math.cos(a), ORBIT * Math.sin(a));
};

const HEAD = P(0, 1.27, 0.27);
const F = P(0.26, 1.0, 0.1); // orchid centre

const BEAK: [number, string][] = [
  [0.42, LIME],
  [0.6, SKY],
  [0.8, ORANGE],
  [1, RED],
];

const petalOutline = (len: number, wid: number): OutlinePoint[] => [
  [0, 0],
  [wid * 0.6, len * 0.15],
  [wid, len * 0.5],
  [wid * 0.7, len * 0.88],
  [0, len],
  [-wid * 0.7, len * 0.88],
  [-wid, len * 0.5],
  [-wid * 0.6, len * 0.15],
];

const LIP_OUTLINE: OutlinePoint[] = [
  [R(-0.014), 0],
  [R(0.014), 0],
  [R(0.02), R(0.03)],
  [R(0.03), R(0.055)],
  [R(0.012), R(0.05)],
  [0, R(0.072)],
  [R(-0.012), R(0.05)],
  [R(-0.03), R(0.055)],
  [R(-0.02), R(0.03)],
];

const WING_OUTLINE: OutlinePoint[] = [
  [R(0.14), R(0.07)],
  [R(0.02), R(0.1)],
  [R(-0.1), R(0.08)],
  [R(-0.22), 0, "sharp"],
  [R(-0.12), R(-0.06)],
  [0, R(-0.08)],
  [R(0.12), R(-0.05)],
];

const STUMP_OUTLINE: OutlinePoint[] = [
  [0, 0],
  [R(0.16), 0],
  [R(0.15), R(0.06)],
  [R(0.12), R(0.2)],
  [R(0.115), R(0.45)],
  [R(0.13), R(0.6)],
  [R(0.15), R(0.67)],
  [0, R(0.67)],
];

export default function build() {
  const b = createBuilder({ name: "keel-billed-toucan" });

  // ---------- spine: hips (root), back, chest, neck (tip) ----------
  const bodyStations = [
    { at: P(0, 0.99, -0.13), w: R(0.13), h: R(0.13) },
    { at: P(0, 1.03, 0), w: R(0.2), h: R(0.2) },
    { at: P(0, 1.1, 0.12), w: R(0.22), h: R(0.2) },
    { at: P(0, 1.2, 0.21), w: R(0.14), h: R(0.14) },
  ];
  const spine = b.chain("spine", catmull(bodyStations.map((st) => st.at)), {
    role: "spine",
    names: ["hips", "back", "chest", "neck"],
  });
  const hips = spine.joints[0];
  const back = spine.joints[1];
  const neck = spine.joints[3];

  // ---------- body: one loft over the spine, glossy black with a lemon bib and scarlet undertail ----------
  const bodyCoat = paint((p, n) => {
    const y = p.y / K;
    const z = p.z / K;
    if (n.z > 0.35 && y > 1.04 && y < 1.2) return YELLOW; // bib on throat and chest
    if (n.y < -0.3 && z < -0.02 && y < 1.02) return RED; // undertail coverts
    return BLACK;
  });
  b.loft(bodyStations, { bone: spine, color: bodyCoat });

  // ---------- tail, hanging behind the perch, red on its underside at the base ----------
  const tail = b.chain("tail", catmull([P(0, 0.99, -0.13), P(0, 0.93, -0.2), P(0, 0.86, -0.27), P(0, 0.8, -0.33)]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });
  const tailCoat = paint((_p, _n, s) => (s[0] < 0.3 && s[1] > 100 && s[1] < 260 ? RED : BLACK));
  b.sweep(tail, (t): [number, number] => [R(0.034 - 0.01 * t), R(0.014)], { color: tailCoat });

  // ---------- legs and zygodactyl feet wrapped round the branch ----------
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const x = side * 0.055;
    const leg = b.chain(
      `leg${tag}`,
      limb(P(x, 0.95, 0), P(x, PERCH, 0), [R(0.12), R(0.1)], [0, 0, 1]),
      { parent: hips, names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`], role: "leg" },
    );
    const ankle = leg.joints[2];
    b.sweep(leg, R(0.0135), { color: BLUE });
    for (const dx of [-0.012, 0.012]) {
      const tx = x + dx;
      b.sweep(catmull([0, 30, 60, 88].map((d) => orbit(tx, d))), R(TOE_R), { bone: ankle, color: BLUE, sides: 6 });
      b.sweep(catmull([0, -30, -62].map((d) => orbit(tx, d))), R(TOE_R), { bone: ankle, color: BLUE, sides: 6 });
      b.spike(orbit(tx, 88), [0, -1, 0], R(0.014), R(0.0035), { bone: ankle, color: BLACK });
      b.spike(orbit(tx, -62), [0, -0.87, -0.5], R(0.012), R(0.003), { bone: ankle, color: BLACK });
    }
  }

  // ---------- head, with a separate upper bill and a hinged lower jaw ----------
  const headJ = b.joint("head", { parent: neck, at: HEAD, role: "head" });
  const jaw = b.joint("jaw", { parent: headJ, at: P(0, 1.235, 0.29), role: "jaw" });
  const head = b.part(
    new THREE.SphereGeometry(R(0.088), 10, 8).scale(0.98, 0.95, 1.08).translate(HEAD[0], HEAD[1], HEAD[2]),
    BLACK,
    { bone: headJ, at: [0, 0, 0], flat: true },
  );

  // rainbow bill: upper mandible on the head, lower mandible on the jaw
  const upperBeak = b.sweep(
    catmull([P(0, 1.3, 0.3), P(0, 1.295, 0.4), P(0, 1.27, 0.5), P(0, 1.23, 0.56), P(0, 1.2, 0.6)]),
    (t): [number, number] => [R(0.045 * (1 - 0.55 * t)), R(0.058 * (1 - 0.85 * t))],
    { bone: headJ, sides: 10, smooth: false, color: LIME, bands: BEAK, caps: { start: "round", end: "point" } },
  );
  b.sweep(
    catmull([P(0, 1.24, 0.3), P(0, 1.225, 0.4), P(0, 1.205, 0.5), P(0, 1.19, 0.54)]),
    (t): [number, number] => [R(0.04 * (1 - 0.45 * t)), R(0.03 * (1 - 0.6 * t) + 0.004)],
    { bone: jaw, sides: 10, smooth: false, color: LIME, bands: BEAK, caps: { start: "round", end: "point" } },
  );

  // nostrils on the top of the bill
  const beakSurf = b.surface(upperBeak);
  for (const s of [1, -1]) {
    const hit = beakSurf.nearest(P(s * 0.012, 1.345, 0.37));
    b.stick(new THREE.SphereGeometry(R(0.008), 5, 4).scale(1.6, 0.5, 1), BLACK, hit, { embed: 0.3, flat: true });
  }

  // lime skin ring and dark eye, as decals on the head
  const eye = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#a6ea2c"/>
      <circle cx="32" cy="32" r="23" fill="#7ccc1e"/>
      <circle cx="32" cy="32" r="16" fill="#2a1a10"/>
      <circle cx="26" cy="25" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const headSurf = b.surface(head);
  for (const s of [1, -1]) {
    const hit = headSurf.around(HEAD).at(s * 68, 12);
    if (hit) b.decal(head, eye, { at: hit, size: [0.034, 0.034] });
  }

  // ---------- folded wings lying along the flanks ----------
  for (const s of [1, -1]) {
    b.extrude(WING_OUTLINE, {
      at: P(s * 0.108, 1.03, -0.02),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: R(0.018),
      bevel: R(0.004),
      smoothing: 1,
      color: WING,
      bone: back,
    });
  }

  // ---------- mossy branch and stump ----------
  const branchCoat = paint((_p, n) =>
    n.y > 0.45 ? mottle(MOSS, MOSS_DARK, { size: 0.03 }) : grain(BARK, BARK_DARK, { size: 0.02, axis: "x" }),
  );
  const branch = b.sweep(
    catmull([P(-0.44, 0.73, 0), P(-0.2, 0.716, 0), P(0, 0.71, 0), P(0.2, 0.715, 0), P(0.44, 0.76, 0.03)]),
    (t) => R(0.046 - 0.02 * Math.pow(Math.abs(t - 0.5) * 2, 3)),
    { bone: hips, sides: 10, smooth: false, color: branchCoat },
  );

  const stumpCoat = paint((p, n) => {
    if (n.y > 0.5 || (p.y > R(0.45) && n.y > 0.1)) return mottle(MOSS, MOSS_DARK, { size: 0.04 });
    return grain(BARK, BARK_DARK, { size: 0.03, axis: "y" });
  });
  b.lathe(STUMP_OUTLINE, { at: [0, 0, 0], segments: 9, color: stumpCoat, bone: hips });

  // moss clumps scattered on the branch top
  const branchSurf = b.surface(branch);
  const clumps = branchSurf.scatter(26, {
    rng: rng(21),
    minDist: 0.035,
    filter: (h) => h.n.y > 0.4 && Math.abs(h.at.x) > R(0.13),
  });
  clumps.forEach((hit, i) => {
    const geo =
      i % 2
        ? new THREE.IcosahedronGeometry(R(0.032), 0).scale(1.5, 0.5, 1.25)
        : new THREE.IcosahedronGeometry(R(0.024), 0).scale(1.3, 0.55, 1.4);
    b.stick(geo, i % 3 ? MOSS : MOSS_DARK, hit, { embed: 0.3, flat: true });
  });

  // ---------- pink orchid beside the bird ----------
  b.sweep(catmull([P(0.27, 0.752, 0), P(0.275, 0.86, 0.03), P(0.265, 0.95, 0.075), P(0.26, 0.99, 0.095)]), [R(0.007), R(0.005)], {
    bone: hips,
    color: STEM,
  });

  const petal = (deg: number, len: number, wid: number, color: string): void => {
    const a = (deg * Math.PI) / 180;
    b.extrude(petalOutline(len, wid), {
      at: F,
      x: [-Math.sin(a), Math.cos(a), 0],
      y: [Math.cos(a), Math.sin(a), 0],
      thickness: R(0.005),
      bevel: R(0.002),
      smoothing: 1,
      color,
      bone: hips,
    });
  };
  petal(90, R(0.085), R(0.03), PINK_DEEP); // dorsal sepal
  petal(28, R(0.082), R(0.042), PINK); // broad petals
  petal(152, R(0.082), R(0.042), PINK);
  petal(-28, R(0.085), R(0.03), PINK_DEEP); // lower sepals
  petal(208, R(0.085), R(0.03), PINK_DEEP);

  b.extrude(LIP_OUTLINE, {
    at: P(0.26, 1.0, 0.108),
    x: [1, 0, 0],
    y: [0, -1, 0],
    thickness: R(0.008),
    bevel: R(0.003),
    color: LIP,
    bone: hips,
  });

  b.part(new THREE.SphereGeometry(R(0.012), 6, 4).translate(F[0], F[1], F[2] + R(0.012)), COLUMN, {
    bone: hips,
    at: [0, 0, 0],
  });

  return b.root;
}
```