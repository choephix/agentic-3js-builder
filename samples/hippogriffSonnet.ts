import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { cells, countershade, gradient, mix, noise, paint, scales, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import { bezier, catmull, polyline } from "../src/path";
import type { Path } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Hippogriff",
  description:
    "A faceted low-poly hippogriff: eagle head, wings and taloned forelegs on a chestnut horse's barrel, hind legs and tail.",
  style: "low-poly",
  commit: "88fc1f0",
};

// Palette
const COAT = "#8d4b27";
const COAT_DK = "#5f301b";
const COAT_LT = "#a8602f";
const SOCK = "#efe6cf";
const BELLY = "#b9794b";
const MANE = "#2b1812";
const MANE_HI = "#4d2d1f";
const FEATHER = "#7b5230";
const FEATHER_MID = "#8d6038";
const FEATHER_DK = "#4a2f1e";
const RUST = "#a8622c";
const RUST_LT = "#c8803e";
const CREAM = "#efe2bd";
const CREAM_MID = "#f7eed3";
const CREAM_SH = "#cdb98a";
const FLIGHT = "#43302a";
const SLATE = "#52708f";
const BEAK = "#f2b61e";
const BEAK_DK = "#c58610";
const BEAK_TIP = "#3a2a18";
const CERE = "#ffd24a";
const EYE = "#ffcf3a";
const PUPIL = "#140c08";
const TALON = "#e3ac2c";
const TALON_DK = "#a8741a";
const CLAW = "#2c2420";
const HOOF = "#2a201c";
const HOOF_RIM = "#6a4a38";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const key = (t: number, keys: ReadonlyArray<readonly [number, number]>) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1];
      const [t1, c] = keys[i];
      return a + ((c - a) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};

export default function build() {
  const b = createBuilder({ name: "hippogriff", paintSize: 2048 });
  const rand = rng(11);
  const tube = (path: Parameters<typeof b.sweep>[0], radius: Parameters<typeof b.sweep>[1], o: Parameters<typeof b.sweep>[2] = {}) =>
    b.sweep(path, radius, { sides: 6, smooth: false, ...o });
  const gem = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);

  // Textures: feather and hair cards
  const featherTex = (base: string, hi: string, dark: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 48"><polygon points="12,0 19,9 22,24 17,40 12,48 7,40 2,24 5,9" fill="${dark}"/><polygon points="12,3 17,11 19,24 15,38 12,44 9,38 5,24 7,11" fill="${base}"/><polygon points="12,5 15,12 17,22 12,30 7,22 9,12" fill="${hi}"/><line x1="12" y1="2" x2="12" y2="47" stroke="${dark}" stroke-width="1.5"/></svg>`,
      { size: 96 },
    );
  const lockTex = (base: string, hi: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 48"><polygon points="8,0 12,10 14,26 11,42 8,48 5,42 2,26 4,10" fill="${base}"/><polygon points="8,4 10,14 9,30 8,40 7,30 6,14" fill="${hi}"/></svg>`,
      { size: 96 },
    );
  const texCream = featherTex(CREAM, CREAM_MID, CREAM_SH);
  const texTan = featherTex("#c9a56a", "#e4c88c", "#8a6a38");
  const texBrown = featherTex(FEATHER, FEATHER_MID, FEATHER_DK);
  const texRust = featherTex(RUST, RUST_LT, FEATHER_DK);
  const texLock = lockTex(MANE, MANE_HI);

  // Paints
  const foreBody = scales([FEATHER, FEATHER_MID, "#6b4528", RUST], FEATHER_DK, { size: 0.085, width: 0.012, seed: 3 });
  const dapple = paint((p, n) => {
    const c = cells(p, 0.11, 5);
    const field = noise(p, 0.3, 6);
    let col = mix(COAT, COAT_DK, smoothstep(0.35, 0.8, field) * 0.75);
    if (c.d1 < 0.2) col = mix(col, COAT_LT, 0.85);
    else if (c.d1 < 0.34) col = mix(col, COAT_DK, 0.55);
    if (n.y > 0.7 && Math.abs(p.x) < 0.04) col = mix(col, MANE, 0.7);
    return col;
  });
  const hindCoat = countershade(dapple, BELLY, { level: -0.4, soft: 0.5 });
  const bodyPaint = paint((p) => (p.z + (noise(p, 0.15, 5) - 0.5) * 0.24 > 0.14 ? foreBody : hindCoat));
  const headScales = scales([CREAM, CREAM_MID, "#e3d3a6"], CREAM_SH, { size: 0.05, width: 0.008, seed: 9 });
  const neckPaint = paint((p, _n, s) => (s[0] + (noise(p, 0.1, 2) - 0.5) * 0.3 > 0.5 ? headScales : foreBody));
  const tarsusPaint = scales([TALON, "#ecbc40", TALON_DK], TALON_DK, { size: 0.032, width: 0.006, seed: 4 });
  const toePaint = paint((_p, _n, s) => (((s[0] * 7) % 1) < 0.3 ? TALON_DK : TALON));
  const legDark = gradient(hindCoat, MANE, [0, 0.78, 0], [0, 0.5, 0]);
  const hindLeg = paint((p) => (p.y < 0.3 + (noise(p, 0.05, 4) - 0.5) * 0.09 ? SOCK : legDark));
  const armScales = scales([RUST, RUST_LT, FEATHER_MID], FEATHER_DK, { size: 0.06, width: 0.008, seed: 12 });

  const featherPaint = (L: number, base: string, tip: string, bar: string | null, edge = FEATHER_DK) =>
    paint((_p, _n, s) => {
      const x = s[0] / L;
      const y = Math.abs(s[1]);
      if (x > 0.03 && y < 0.0042) return CREAM_SH;
      if (x > 0.9) return tip;
      if (bar && x > 0.74 && x < 0.84) return bar;
      if (y > 0.04 && x < 0.9 && x > 0.12 && y > 0.0 && (y * 1000) % 13 < 1.2) return edge;
      return base;
    });

  // Skeleton: hips, spine, neck, head, jaw, tail
  const hips = b.joint("hips", { at: [0, 1.28, -0.66], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.28, -0.66],
      [0, 1.3, -0.15],
      [0, 1.33, 0.35],
      [0, 1.36, 0.78],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.46, 0.7],
      [0, 1.68, 0.86],
      [0, 1.9, 1.02],
      [0, 2.08, 1.2],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.12, 1], role: "head" });
  const K = 1.25; // head scale: a heroic, oversized eagle head
  const P = (f: number, u: number, l = 0) => head.local({ forward: f * K, up: u * K, left: l * K });
  const jaw = b.joint("jaw", { parent: head, at: P(0.06, -0.035), aim: P(0.3, -0.05), role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.3, -0.84],
      [0, 1.33, -1.04],
      [0, 1.22, -1.26],
      [0, 0.98, -1.38],
      [0, 0.72, -1.36],
      [0, 0.46, -1.31],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  // Body: horse barrel with eagle-feathered chest
  const bodyProf = {
    rx: [
      [0, 0.25],
      [0.3, 0.27],
      [0.65, 0.27],
      [1, 0.24],
    ] as const,
    ry: [
      [0, 0.3],
      [0.3, 0.31],
      [0.65, 0.34],
      [1, 0.33],
    ] as const,
  };
  const body = tube(spine, (t) => [key(t, bodyProf.rx), key(t, bodyProf.ry)], {
    sides: 8,
    color: bodyPaint,
    name: "barrel",
  });
  for (const s of [1, -1]) {
    // haunch and shoulder masses
    b.part(gem(1, 8, 6), hindCoat, {
      bone: hips,
      at: [s * 0.23, 1.2, -0.66],
      scale: [0.2, 0.3, 0.3],
      flat: true,
      name: `haunch${s > 0 ? "L" : "R"}`,
    });
    b.part(gem(1, 8, 6), foreBody, {
      bone: spine.joints[2],
      at: [s * 0.25, 1.26, 0.6],
      scale: [0.16, 0.27, 0.24],
      flat: true,
      name: `shoulder${s > 0 ? "L" : "R"}`,
    });
  }
  // chest keel
  b.part(gem(1, 8, 6), foreBody, {
    bone: spine.joints[2],
    at: [0, 1.17, 0.78],
    scale: [0.22, 0.22, 0.3],
    flat: true,
    name: "keel",
  });

  // Neck
  const neckProf = [
    [0, 0.25],
    [0.35, 0.19],
    [0.7, 0.155],
    [1, 0.125],
  ] as const;
  const neckTube = tube(neck, (t) => key(t, neckProf), { sides: 8, color: neckPaint, name: "neckTube" });

  // Head: skull, beak, eyes
  const skull = b.part(gem(0.13 * K, 8, 6), headScales, {
    bone: head,
    at: P(0.1, 0.03),
    scale: [0.95, 0.9, 1.18],
    flat: true,
    name: "skull",
  });
  const beakPath = bezier(P(0.12, 0.005), P(0.27, 0.012), P(0.34, -0.005), P(0.385, -0.1));
  tube(beakPath, (t) => [(0.052 * (1 - t) + 0.007) * K, (0.078 * (1 - t) + 0.009) * K], {
    bone: head,
    sides: 5,
    caps: "point",
    bands: [
      [0.28, CERE],
      [0.78, BEAK],
      [1, BEAK_DK],
    ],
    name: "beakUpper",
  });
  // beak ridge + hook shading
  tube(bezier(P(0.2, 0.052), P(0.28, 0.05), P(0.33, 0.032), P(0.375, -0.07)), [0.014 * K, 0.004 * K], {
    bone: head,
    sides: 4,
    color: BEAK_DK,
    caps: "none",
    name: "culmen",
  });
  const lowerPath = bezier(P(0.08, -0.05), P(0.2, -0.055), P(0.3, -0.055), P(0.345, -0.075));
  tube(lowerPath, (t) => [(0.044 * (1 - t) + 0.01) * K, (0.036 * (1 - t) + 0.01) * K], {
    bone: jaw,
    sides: 5,
    caps: "point",
    bands: [
      [0.8, BEAK],
      [1, BEAK_DK],
    ],
    name: "beakLower",
  });
  b.part(gem(0.03 * K, 6, 4), "#d9504a", {
    bone: jaw,
    at: P(0.17, -0.052),
    scale: [1.1, 0.5, 2.6],
    flat: true,
    name: "tongue",
  });
  for (const s of [1, -1]) {
    // mouth line along the gape
    b.rod(P(0.1, -0.03, s * 0.053), P(0.335, -0.058, s * 0.008), 0.0045 * K, {
      bone: head,
      color: BEAK_TIP,
      sides: 4,
      name: `gape${s}`,
    });
    // nostrils on the cere
    b.part(gem(0.012 * K, 5, 3), BEAK_TIP, {
      bone: head,
      at: P(0.185, 0.025, s * 0.03),
      scale: [0.8, 1.6, 0.8],
      flat: true,
      name: `nostril${s}`,
    });
    // eye: pale ring, amber iris, pupil, glint
    b.part(gem(0.04 * K, 6, 4), CREAM_SH, { bone: head, at: P(0.075, 0.045, s * 0.108), flat: true, name: `eyeRing${s}` });
    b.part(gem(0.031 * K, 6, 4), EYE, { bone: head, at: P(0.082, 0.045, s * 0.121), flat: true, name: `eye${s}` });
    b.part(gem(0.017 * K, 6, 4), PUPIL, { bone: head, at: P(0.09, 0.045, s * 0.146), flat: true, name: `pupil${s}` });
    b.part(gem(0.006 * K, 4, 3), "#fffbe0", { bone: head, at: P(0.101, 0.054, s * 0.147), name: `glint${s}` });
    // heavy brow ridge
    b.rod(P(0.03, 0.105, s * 0.07), P(0.145, 0.085, s * 0.11), [0.02 * K, 0.024 * K], {
      bone: head,
      color: FEATHER_MID,
      sides: 5,
      name: `brow${s}`,
    });
    b.rod(P(0.04, 0.1, s * 0.08), P(0.135, 0.075, s * 0.12), 0.011 * K, {
      bone: head,
      color: FEATHER_DK,
      sides: 5,
      name: `browLine${s}`,
    });
    // cheek ruff tufts
    b.spike(P(0.0, -0.03, s * 0.1), [0, -0.5, -0.8], 0.11 * K, 0.032 * K, {
      bone: head,
      color: CREAM,
      sides: 5,
      name: `cheek${s}`,
    });
    // swept ear-tuft feathers
    b.spike(P(0.0, 0.1, s * 0.07), [s * 0.3, 0.45, -1], 0.17 * K, 0.02 * K, {
      bone: head,
      color: FEATHER_DK,
      sides: 4,
      name: `tuft${s}`,
    });
  }
  // crest and nape cards
  const skullSurf = b.surface(skull);
  const skullHits = skullSurf.scatter(34, {
    rng: rand,
    minDist: 0.035 * K,
    filter: (h) => h.n.y > -0.2 && h.at.z < head.at.z + 0.12 + 0.1 * Math.max(0, h.n.y),
  });
  b.cards(skullHits, [texCream, texCream, texTan], {
    size: [0.05 * K, 0.12 * K],
    lean: 62,
    bend: 18,
    flow: [0, -0.35, -1],
    vary: 0.25,
    rng: rand,
    spin: 8,
  });
  // throat/neck contour feathers and hackle
  const neckHits = b.surface(neckTube).scatter(120, { rng: rand, minDist: 0.05, filter: (h) => h.n.y > -0.4 });
  b.cards(neckHits, [texCream, texTan, texBrown, texCream], {
    size: [0.075, 0.15],
    lean: 58,
    bend: 14,
    flow: [0, -1, -0.45],
    vary: 0.25,
    rng: rand,
    spin: 10,
  });
  const hackleFrames = [0.08, 0.17, 0.26, 0.35, 0.44, 0.53, 0.62, 0.71, 0.8, 0.88].map((t) => neckTube.at(t, 0));
  b.cards(hackleFrames, [texRust, texBrown], {
    size: [0.09, 0.22],
    lean: 40,
    bend: 25,
    flow: [0, -0.7, -1],
    vary: 0.2,
    rng: rand,
    cross: true,
  });
  // chest feathers over the horse transition
  const bodyHits = b.surface(body).scatter(170, {
    rng: rand,
    minDist: 0.075,
    filter: (h) => h.n.y > -0.55 && h.at.z > 0.0 + (noise(h.at, 0.2, 1) - 0.5) * 0.2 && h.at.z < 1.05,
  });
  b.cards(bodyHits, [texBrown, texTan, texRust, texCream, texBrown], {
    size: [0.1, 0.19],
    lean: 62,
    bend: 14,
    flow: [0, -1, -0.5],
    vary: 0.25,
    rng: rand,
    spin: 10,
  });
  // dorsal scapular feather row at the transition
  const dorsal = body.line(0).slice(0.52, 0.74);
  b.cards(
    [0, 0.14, 0.28, 0.42, 0.57, 0.71, 0.86, 1].map((t) => frame_on(dorsal, t)),
    [texBrown, texRust],
    { size: [0.1, 0.24], lean: 78, bend: 12, flow: [0, -0.2, -1], vary: 0.2, rng: rand },
  );
  function frame_on(path: Path, t: number) {
    return b.surface(body).nearest(path.at(t));
  }

  // Tail: dark horse tail with locks
  const tailProf = [
    [0, 0.055],
    [0.2, 0.085],
    [0.45, 0.115],
    [0.75, 0.095],
    [1, 0.04],
  ] as const;
  const tailTube = b.sweep(tail, (t) => key(t, tailProf), {
    section: { ngon: 6 },
    color: grainTail(),
    name: "tailTube",
  });
  function grainTail() {
    return paint((p) => (noise(p, 0.035, 8) > 0.55 ? MANE_HI : MANE));
  }
  const tailHits = b.surface(tailTube).scatter(70, { rng: rand, minDist: 0.07, filter: (h) => h.at.z < -0.95 });
  b.cards(tailHits, texLock, {
    size: [0.08, 0.26],
    lean: 50,
    bend: 25,
    flow: [0, -1, -0.15],
    vary: 0.3,
    rng: rand,
    spin: 12,
    color: "#ffffff",
  });
  b.cards(
    [0.9, 0.95, 1].map((t) => tailTube.at(t, 180)),
    texLock,
    { size: [0.1, 0.3], lean: 160, flow: [0, -1, -0.2], vary: 0.2, rng: rand },
  );

  // Hind legs: horse hooves
  const hindKeys = [
    [0, 0.19],
    [0.15, 0.18],
    [0.34, 0.115],
    [0.5, 0.09],
    [0.65, 0.105],
    [0.72, 0.066],
    [0.9, 0.06],
    [0.93, 0.074],
    [1, 0.055],
  ] as const;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const H = v(s * 0.21, 1.2, -0.7);
    const F = v(s * 0.2, 0.17, -0.76);
    const pts = limb(H, F, [0.52, 0.5, 0.4], [[0, 0, 1], [0, 0, -1]]);
    if (pts[pts.length - 1].distanceTo(F) > 1e-3) throw new Error("hind leg too short");
    const C = v(s * 0.2, 0.105, -0.71);
    const G = v(s * 0.2, 0.0, -0.665);
    const leg = b.chain(`legH${side}`, polyline([...pts, C]), {
      parent: hips,
      names: [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlock${side}`, `hoof${side}`],
      role: "leg",
      contact: [G.x, 0, G.z],
    });
    tube(leg, (t) => key(t, hindKeys), { color: hindLeg, name: `legHind${side}` });
    const hoofBone = leg.tip as Joint;
    // hock point
    b.part(gem(0.07, 6, 4), COAT_DK, { bone: leg.joints[2], at: pts[2].clone().add(v(0, 0.0, -0.045)), flat: true, name: `hockBump${side}` });
    b.part(gem(0.085, 7, 5), hindCoat, { bone: leg.joints[1], at: pts[1].clone().add(v(s * 0.03, 0.02, 0.05)), scale: [0.9, 1.0, 1.1], flat: true, name: `stifleBump${side}` });
    // hoof with rim
    const len = C.distanceTo(G);
    b.part(new THREE.CylinderGeometry(0.064, 0.086, len, 6), HOOF, {
      bone: hoofBone,
      at: C.clone().add(G).multiplyScalar(0.5),
      dir: C.clone().sub(G),
      flat: true,
      name: `hoof${side}`,
    });
    b.part(new THREE.CylinderGeometry(0.07, 0.066, 0.028, 6), HOOF_RIM, {
      bone: hoofBone,
      at: C.clone().add(v(0, 0.012, -0.004)),
      dir: C.clone().sub(G),
      flat: true,
      name: `coronet${side}`,
    });
    // fetlock feather tufts
    const tuft = b.ring(leg.joints[3], { count: 7, radius: 0.05 });
    b.cards(tuft.items, texLock, {
      size: [0.05, 0.1],
      lean: 70,
      bend: 15,
      flow: [0, -1, -0.2],
      rng: rand,
      vary: 0.2,
      color: "#6a4a38",
    });
  }

  // Forelegs: eagle legs, feathered thigh, scaled tarsus, talons
  const foreKeys = [
    [0, 0.15],
    [0.2, 0.15],
    [0.42, 0.105],
    [0.56, 0.068],
    [0.81, 0.058],
    [1, 0.064],
  ] as const;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S = v(s * 0.27, 1.2, 0.55);
    const A = v(s * 0.3, 0.115, 0.72);
    const pts = limb(S, A, [0.55, 0.5, 0.25], [[0, 0, -1], [0, 0, 1]]);
    if (pts[pts.length - 1].distanceTo(A) > 1e-3) throw new Error("foreleg too short");
    const leg = b.chain(`legF${side}`, polyline(pts), {
      parent: spine.joints[2],
      names: [`foreShoulder${side}`, `foreElbow${side}`, `foreWrist${side}`, `foreAnkle${side}`],
      role: "leg",
      contact: [A.x, 0, A.z + 0.1],
    });
    const foreTube = b.sweep(leg, (t) => key(t, foreKeys), {
      sides: 6,
      smooth: false,
      bands: [
        [0.5, foreBody],
        [1, tarsusPaint],
      ],
      name: `legFore${side}`,
    });
    const ankle = leg.tip as Joint;
    // thigh trousers
    const hits = b.surface(foreTube).scatter(46, { rng: rand, minDist: 0.06, filter: (h) => h.at.y > 0.6 && h.n.y > -0.7 });
    b.cards(hits, [texBrown, texRust, texTan], {
      size: [0.08, 0.17],
      lean: 70,
      bend: 12,
      flow: [0, -1, -0.15],
      vary: 0.25,
      rng: rand,
      spin: 10,
    });
    // ankle pad
    b.part(gem(0.062, 6, 4), TALON_DK, { bone: ankle, at: A.clone().add(v(0, -0.01, 0.02)), scale: [1, 0.8, 1.2], flat: true, name: `anklePad${side}` });
    // toes
    const toeSpecs: Array<{ name: string; ang: number; len: number }> = [
      { name: "toeOuter", ang: s * 30, len: 0.29 },
      { name: "toeMid", ang: 0, len: 0.33 },
      { name: "toeInner", ang: -s * 30, len: 0.29 },
    ];
    for (const ts of toeSpecs) {
      const d = v(Math.sin((ts.ang * Math.PI) / 180), 0, Math.cos((ts.ang * Math.PI) / 180));
      const p0 = A.clone().add(v(0, -0.01, 0));
      const p1 = A.clone().addScaledVector(d, ts.len * 0.5).setY(0.072);
      const p2 = A.clone().addScaledVector(d, ts.len).setY(0.032);
      const toe = b.chain(`${ts.name}${side}`, polyline([p0, p1, p2]), {
        parent: ankle,
        names: [`${ts.name}${side}1`, `${ts.name}${side}2`],
        role: "digit",
      });
      tube(toe, [0.036, 0.027], { color: toePaint, sides: 5, name: `${ts.name}Tube${side}` });
      b.part(gem(0.04, 6, 4), TALON, { bone: toe.joints[1], at: p1, flat: true, name: `knuckle${ts.name}${side}` });
      const end = p2.clone();
      b.sweep(
        bezier(end, end.clone().addScaledVector(d, 0.045).setY(0.036), end.clone().addScaledVector(d, 0.08).setY(0.0)),
        [0.026, 0.002],
        { bone: toe.joints[1], sides: 5, smooth: false, color: CLAW, caps: "point", name: `claw${ts.name}${side}` },
      );
    }
    // hallux behind
    const hd = v(s * 0.15, 0, -1).normalize();
    const h0 = A.clone().add(v(0, -0.02, -0.01));
    const h1 = A.clone().addScaledVector(hd, 0.13).setY(0.034);
    const hallux = b.chain(`hallux${side}`, polyline([h0, h1]), {
      parent: ankle,
      names: [`hallux${side}`],
      role: "digit",
    });
    tube(hallux, [0.036, 0.026], { color: toePaint, sides: 5, name: `halluxTube${side}` });
    b.sweep(
      bezier(h1, h1.clone().addScaledVector(hd, 0.04).setY(0.04), h1.clone().addScaledVector(hd, 0.075).setY(0.0)),
      [0.026, 0.002],
      { bone: hallux.joints[0], sides: 5, smooth: false, color: CLAW, caps: "point", name: `clawHallux${side}` },
    );
    // dewclaw spur behind the tarsus
    b.spike(pts[2].clone().add(v(0, -0.02, -0.04)), [0, -0.7, -0.7], 0.07, 0.016, { bone: leg.joints[2], color: CLAW, sides: 5, name: `spur${side}` });
  }

  // Wings
  const wingPalette = {
    primaryBase: FLIGHT,
    secondaryBase: "#5a3d2b",
  };
  const featherOutline = (L: number, w: number): Array<[number, number]> => [
    [0, -0.28 * w],
    [0.15 * L, -0.8 * w],
    [0.55 * L, -w],
    [0.85 * L, -0.78 * w],
    [L, -0.24 * w],
    [L, 0.24 * w],
    [0.85 * L, 0.78 * w],
    [0.55 * L, w],
    [0.15 * L, 0.8 * w],
    [0, 0.28 * w],
  ];
  const place = (
    bone: Joint,
    org: THREE.Vector3,
    dir: THREE.Vector3,
    L: number,
    w: number,
    color: Paint,
    name: string,
  ) => {
    const x = dir.clone().normalize();
    const y = new THREE.Vector3(0, 1, 0).cross(x).normalize();
    b.extrude(featherOutline(L, w), { at: org, x, y, thickness: 0.009, color, bone, name });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const Sp = v(s * 0.2, 1.64, 0.32);
    const Ep = v(s * 0.82, 1.8, 0.05);
    const Wp = v(s * 1.42, 1.86, 0.38);
    const Hp = v(s * 1.88, 1.88, 0.2);
    const wing = b.chain(`wing${side}`, polyline([Sp, Ep, Wp, Hp]), {
      parent: spine.joints[2],
      names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`, `wingTip${side}`],
      role: "arm",
    });
    const [jSh, jEl, jWr] = wing.joints as [Joint, Joint, Joint, Joint];
    const armTube = b.sweep(wing, (t) => key(t, [[0, 0.1], [0.3, 0.075], [0.55, 0.06], [0.75, 0.05], [1, 0.04]]), {
      sides: 6,
      smooth: false,
      color: paint((_p, _n, st) => (st[1] > 100 && st[1] < 260 ? FEATHER_DK : armScales)),
      name: `wingArm${side}`,
    });
    b.part(gem(0.115, 7, 5), foreBody, { bone: jSh, at: Sp.clone().add(v(0, -0.02, 0)), scale: [1, 0.9, 1.15], flat: true, name: `wingRoot${side}` });
    b.part(gem(0.06, 6, 4), RUST_LT, { bone: jWr, at: Wp, flat: true, name: `wristKnob${side}` });
    b.spike(Wp.clone().add(v(0, 0.01, 0.04)), [s * 0.2, 0.2, 1], 0.1, 0.022, { bone: jWr, color: CLAW, sides: 5, name: `alula${side}` });

    const lerpV = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);
    // wing base panel under the coverts
    b.slab(
      [Sp.clone().add(v(0, -0.01, 0)), Ep.clone().add(v(0, -0.01, 0)), Wp.clone().add(v(0, -0.01, 0)), Hp.clone().add(v(0, -0.01, -0.02)),
       Hp.clone().add(v(0, -0.02, -0.28)), Wp.clone().add(v(0, -0.02, -0.34)), Ep.clone().add(v(0, -0.02, -0.34)), Sp.clone().add(v(0, -0.02, -0.34))],
      { thickness: 0.016, color: foreBody, bone: jEl, name: `wingPanel${side}` },
    );

    // flight feathers
    const primL = [0.64, 0.72, 0.79, 0.85, 0.89, 0.9, 0.87, 0.8, 0.7];
    const primEnd = Hp.clone().add(v(s * 0.06, 0, 0.02));
    for (let i = 0; i < 9; i++) {
      const u = i / 8; // 0 inner .. 1 outer
      const ang = ((72 - 66 * u) * Math.PI) / 180;
      const dir = v(s * Math.cos(ang), -0.05 - 0.02 * (1 - u), -Math.sin(ang));
      const org = lerpV(Wp, primEnd, 0.06 + 0.94 * u).add(v(0, 0.006 * (i % 2), -0.03));
      const L = primL[i];
      place(jWr, org, dir, L, 0.05, featherPaint(L, wingPalette.primaryBase, CREAM, SLATE), `primary${i}${side}`);
    }
    for (let i = 0; i < 7; i++) {
      const u = i / 6; // 0 at wrist .. 1 at elbow
      const dir = v(s * (0.2 - 0.55 * u), -0.07, -1);
      const org = lerpV(Wp, Ep, 0.03 + 0.94 * u).add(v(0, 0.006 * (i % 2), -0.045));
      const L = 0.66 - 0.04 * u;
      place(jEl, org, dir, L, 0.068, featherPaint(L, wingPalette.secondaryBase, CREAM, SLATE), `secondary${i}${side}`);
    }
    for (let i = 0; i < 4; i++) {
      const u = i / 3;
      const dir = v(s * (-0.3 - 0.4 * u), -0.08, -1);
      const org = lerpV(Ep, Sp, 0.1 + 0.8 * u).add(v(0, 0.006 * (i % 2), -0.045));
      const L = 0.52 - 0.11 * u;
      place(jSh, org, dir, L, 0.075, featherPaint(L, "#6a4630", CREAM_SH, null), `tertial${i}${side}`);
    }
    // covert rows
    const covert = (
      bone: Joint,
      a: THREE.Vector3,
      c: THREE.Vector3,
      n: number,
      dirAt: (u: number) => THREE.Vector3,
      L: number,
      w: number,
      lift: number,
      fwd: number,
      base: string,
      tip: string,
      nm: string,
    ) => {
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n;
        const org = lerpV(a, c, u).add(v(0, lift + 0.004 * (i % 2), fwd));
        place(bone, org, dirAt(u), L * (1 - 0.1 * Math.abs(u - 0.5)), w, featherPaint(L, base, tip, null), `${nm}${i}${side}`);
      }
    };
    const secDir = (u: number) => v(s * (0.2 - 0.55 * (1 - u)), -0.05, -1);
    const tertDir = (u: number) => v(s * (-0.3 - 0.4 * u), -0.06, -1);
    const priDir = (u: number) => {
      const ang = ((72 - 66 * u) * Math.PI) / 180;
      return v(s * Math.cos(ang), -0.04, -Math.sin(ang));
    };
    covert(jWr, Wp, primEnd, 6, priDir, 0.24, 0.045, 0.012, 0.0, FEATHER, CREAM_SH, "primaryCovert");
    covert(jEl, Wp, Ep, 8, (u) => secDir(1 - u), 0.3, 0.06, 0.014, 0.0, FEATHER, RUST, "greaterCovert");
    covert(jSh, Ep, Sp, 4, tertDir, 0.28, 0.066, 0.014, 0.0, FEATHER, RUST, "greaterCovertIn");
    covert(jEl, Wp, Ep, 8, (u) => secDir(1 - u), 0.22, 0.055, 0.03, 0.03, RUST, RUST_LT, "medianCovert");
    covert(jSh, Ep, Sp, 4, tertDir, 0.2, 0.06, 0.03, 0.03, RUST, RUST_LT, "medianCovertIn");
    covert(jEl, Wp, Ep, 9, (u) => secDir(1 - u), 0.14, 0.05, 0.05, 0.06, RUST_LT, CREAM, "lesserCovert");
    covert(jSh, Ep, Sp, 4, tertDir, 0.14, 0.055, 0.05, 0.06, RUST_LT, CREAM, "lesserCovertIn");
    covert(jWr, Wp, primEnd, 6, priDir, 0.13, 0.04, 0.032, 0.04, RUST, RUST_LT, "handCovert");
    // leading-edge contour feathers over the arm
    const armHits = b.surface(armTube).scatter(36, { rng: rand, minDist: 0.075, filter: (h) => h.n.y > -0.2 });
    b.cards(armHits, [texRust, texBrown, texTan], {
      size: [0.07, 0.15],
      lean: 72,
      bend: 10,
      flow: [0, 0, -1],
      vary: 0.25,
      rng: rand,
      spin: 8,
    });
    // raise the wing: dihedral about the shoulder
    b.pose(jSh, { axis: [1, 0, 0], deg: 24 });
    b.pose(jSh, { axis: [0, 0, 1], deg: s * 18 });
  }

  return b.root;
}
