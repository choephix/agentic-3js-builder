import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  limb,
  countershade,
  gradient,
  grain,
  mottle,
  paint,
  noise,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Capybara with a Bird on its Head",
  description:
    "A chunky, sleepy-eyed capybara with a rosy-cheeked smile and a fluffy-tufted coat, calmly carrying a small crested blue bird perched on top of its head. Fully rigged (spine, neck, jaw, ears, four legs) with a rigged bird (head, beak, wings, tail).",
};

const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------------
// small helpers

/** An ellipsoid with the given half-extents, low-poly. */
const ell = (rx: number, ry: number, rz: number, w = 8, h = 6) => new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);

/** Smoothly interpolated profile through evenly spaced keys. */
function keyed(keys: number[]) {
  return (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(x), keys.length - 2);
    const f = x - i;
    const w = f * f * (3 - 2 * f);
    return keys[i] + (keys[i + 1] - keys[i]) * w;
  };
}

function must<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`missing surface hit: ${what}`);
  return v;
}

const scaled = (o: Pt[], k: number): Pt[] =>
  o.map((p) => (p.length === 3 ? [p[0] * k, p[1] * k, "sharp"] : [p[0] * k, p[1] * k]) as Pt);

// ---------------------------------------------------------------------------------------------------------------
// palette

const FUR_A = "#8e5c38";
const FUR_B = "#aa764b";
const FUR_D = "#6c4126";
const BELLY = "#dcb57f";
const MUZ_A = "#a97649";
const MUZ_B = "#bd8f5e";
const MUZ_BELLY = "#e3c394";
const CHIN = "#d4a874";
const EAR_OUT = "#68402a";
const EAR_IN = "#eaa396";
const PAWC = "#4d3120";
const TOEC = "#5f3d28";
const NAILC = "#2a1911";
const NOSEC = "#4a2e26";
const NOSE_HI = "#85604f";
const NOSTRIL = "#1a100c";
const GLAND = "#5c3b2d";
const SMILEC = "#3a2216";
const WHISK = "#3b2a20";

const BLUE = "#4aa8e6";
const BLUE2 = "#74c4f2";
const NAVY = "#2a4f9a";
const WINGB = "#3a6cc4";
const CREAM = "#fff0c8";
const CORAL = "#ff6f61";
const BEAK = "#ffa530";
const BEAK2 = "#f08a1c";
const PINK = "#ff9fb0";
const FEET = "#ff9a3c";

// ---------------------------------------------------------------------------------------------------------------
// outlines

const WING: Pt[] = [
  [0, 0.012],
  [0.03, 0.03],
  [0.07, 0.014],
  [0.105, -0.03, "sharp"],
  [0.07, -0.026],
  [0.035, -0.02],
  [0.005, -0.012],
];
const TAIL: Pt[] = [
  [0, -0.018],
  [0.05, -0.026],
  [0.095, -0.034, "sharp"],
  [0.1, -0.012],
  [0.085, 0, "sharp"],
  [0.1, 0.012],
  [0.095, 0.034, "sharp"],
  [0.05, 0.026],
  [0, 0.018],
];
const CREST: Pt[] = [
  [0, 0, "sharp"],
  [0.012, 0.012],
  [0.004, 0.035],
  [-0.012, 0.052, "sharp"],
  [-0.008, 0.03],
  [-0.012, 0.01],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const R = rng(7);

  // ---------------- textures ----------------
  const EYE = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><ellipse cx="32" cy="26" rx="22" ry="17"/></clipPath></defs>
      <ellipse cx="32" cy="26" rx="22" ry="17" fill="#24140d"/>
      <circle cx="23" cy="34" r="5.5" fill="#ffffff"/>
      <circle cx="41" cy="38" r="2.6" fill="#ffffff"/>
      <g clip-path="url(#c)"><path d="M0 0H64V21Q32 35 0 21Z" fill="#7a4a2a"/></g>
      <path d="M10 22Q32 36 54 22" fill="none" stroke="#24140d" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M52 19 l7 -4 M54 24 l8 -1" stroke="#24140d" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
  const BLUSH = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="20" rx="28" ry="16" fill="#ff8f9c"/>
      <path d="M18 14l-4 12M30 12l-4 14M42 14l-4 12" stroke="#e8566f" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const DOTS = svg(
    `<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
      ${[
        [8, 8],
        [20, 6],
        [32, 8],
        [44, 11],
        [12, 18],
        [24, 17],
        [36, 19],
        [8, 27],
        [20, 27],
        [31, 28],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#4a2e20"/>`)
        .join("")}
    </svg>`,
    { size: 160 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
      <path d="M4 64 C6 40 3 20 8 4 C12 22 14 36 16 64Z M12 64 C14 36 18 14 16 0 C22 16 24 40 22 64Z M18 64 C22 44 26 28 30 12 C30 36 28 52 28 64Z" fill="url(#g)"/>
    </svg>`,
    { size: 128 },
  );
  const BIRDEYE = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#1b1220"/>
      <circle cx="16" cy="16" r="13" fill="none" stroke="#fff1c9" stroke-width="2.2"/>
      <circle cx="11" cy="11" r="5" fill="#ffffff"/>
      <circle cx="21" cy="21" r="2.2" fill="#ffffff"/>
    </svg>`,
    { size: 96 },
  );
  const BREAST = svg(
    `<svg viewBox="0 0 64 56" xmlns="http://www.w3.org/2000/svg">
      ${[10, 24, 38, 52]
        .map((y, row) =>
          [0, 16, 32, 48, 64]
            .map((x) => `<path d="M${x - 8 + (row % 2) * 8} ${y} Q${x + (row % 2) * 8} ${y + 10} ${x + 8 + (row % 2) * 8} ${y}" fill="none" stroke="#e5bd78" stroke-width="3" stroke-linecap="round"/>`)
            .join(""),
        )
        .join("")}
    </svg>`,
    { size: 256 },
  );

  // ---------------- paints ----------------
  const furBase = mottle(grain(FUR_A, FUR_B, { size: 0.03, axis: "z", seed: 2 }), FUR_D, {
    size: 0.18,
    seed: 5,
    contrast: 0.6,
  });
  const COAT = countershade(furBase, BELLY, { level: -0.15, soft: 0.4 });
  const MUZZLE = countershade(mottle(MUZ_A, MUZ_B, { size: 0.05, seed: 9 }), MUZ_BELLY, { level: -0.1, soft: 0.4 });
  const HEADC = gradient(COAT, MUZZLE, [0, 0.5, 0.46], [0, 0.5, 0.66]);
  const LEGC = gradient(COAT, "#4a3020", [0, 0.18, 0], [0, 0.05, 0]);

  const BIRD_BACK = mottle(BLUE, BLUE2, { size: 0.03, seed: 4, contrast: 0.8 });
  const PLUMAGE = paint((p, n) => {
    const score = n.y - 0.35 * n.z + 0.14 * (noise(p, 0.022, 3) - 0.5);
    return score > -0.1 ? BIRD_BACK : CREAM;
  });
  const BIRD_HEAD = countershade(BIRD_BACK, CREAM, { level: -0.4, soft: 0.2 });
  const WINGP = paint((_p, _n, s) => {
    if (s[0] > 0.078) return NAVY;
    if (s[0] > 0.04 && s[0] < 0.053) return CREAM;
    return s[1] > 0.012 ? BLUE2 : WINGB;
  });
  const TAILP = paint((_p, _n, s) => (s[0] > 0.075 ? NAVY : s[0] > 0.065 ? CREAM : WINGB));

  // ---------------- skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.42, -0.32], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, -0.32],
      [0, 0.42, -0.12],
      [0, 0.43, 0.08],
      [0, 0.44, 0.28],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.44, 0.28],
      [0, 0.46, 0.36],
      [0, 0.48, 0.44],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.48, 0.44], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.39, 0.46], aim: [0, 0.35, 0.7], role: "jaw" });

  // ---------------- body ----------------
  const bodyPath = catmull([
    [0, 0.42, -0.48],
    [0, 0.42, -0.32],
    [0, 0.42, -0.12],
    [0, 0.43, 0.08],
    [0, 0.44, 0.28],
    [0, 0.45, 0.36],
  ]);
  const rxK = keyed([0.15, 0.2, 0.235, 0.245, 0.23, 0.17]);
  const ryK = keyed([0.19, 0.245, 0.265, 0.265, 0.25, 0.19]);
  const body = b.sweep(bodyPath, (t) => [rxK(t), ryK(t)], {
    bone: [hips, spine, neck],
    color: COAT,
    sides: 12,
  });

  // ---------------- head ----------------
  const skullPath = catmull([
    [0, 0.52, 0.3],
    [0, 0.52, 0.44],
    [0, 0.51, 0.54],
    [0, 0.5, 0.6],
  ]);
  const skull = b.sweep(skullPath, (t) => [0.158 - 0.032 * t * t, 0.125 + 0.012 * t], {
    bone: head,
    color: HEADC,
    sides: 10,
  });
  const skin = b.surface(skull);
  const C = new THREE.Vector3(0, 0.52, 0.52);

  // lower jaw: its own sweep on the jaw bone
  b.sweep(
    catmull([
      [0, 0.385, 0.46],
      [0, 0.365, 0.55],
      [0, 0.345, 0.64],
    ]),
    (t) => [0.1 - 0.018 * t, 0.042 - 0.004 * t],
    { bone: jaw, color: CHIN, sides: 8 },
  );

  // nose pad, nostrils, scent gland
  const NC = new THREE.Vector3(0, 0.545, 0.7);
  const pad = b.part(ell(0.09, 0.065, 0.05, 10, 8), NOSEC, { bone: head, at: NC });
  const padSkin = b.surface(pad);
  for (const [s] of SIDES) {
    const h = must(padSkin.around(NC).at(s * 26, 38), "nostril");
    b.stick(ell(0.016, 0.012, 0.022, 6, 4), NOSTRIL, h, { embed: 0.3 });
  }
  b.stick(ell(0.022, 0.008, 0.012, 6, 4), NOSE_HI, must(padSkin.around(NC).at(0, 68), "nose shine"), { embed: 0.4 });
  const gland = must(skin.ray([0, 1.2, 0.585], [0, -1, 0]), "gland");
  b.stick(ell(0.034, 0.012, 0.05, 8, 5), GLAND, gland, { embed: 0.35 });

  // ears (own hinge joints)
  const earHits: THREE.Vector3[] = [];
  for (const [s, S] of SIDES) {
    const e = new THREE.Vector3(s * 0.105, 0.625, 0.395);
    earHits.push(e);
    const ear = b.joint(`ear${S}`, { parent: head, at: e, dir: [s * 0.3, 1, 0], role: "hinge" });
    b.part(ell(0.02, 0.042, 0.04, 8, 6), EAR_OUT, { bone: ear, at: e, rotation: [0, 0, -s * 22], flat: true });
    b.part(ell(0.011, 0.03, 0.028, 8, 6), EAR_IN, {
      bone: ear,
      at: [e.x + s * 0.012, e.y + 0.002, e.z + 0.008],
      rotation: [0, 0, -s * 22],
      flat: true,
    });
  }

  // eyes, blush, whisker dots
  const eyeHits = SIDES.map(([s]) => must(skin.around(C).at(s * 60, 24), "eye"));
  SIDES.forEach(([s], i) => {
    b.decal(skull, EYE, { at: eyeHits[i], size: [0.062, 0.047], mirror: s > 0, segments: 12 });
    const bl = must(skin.around(C).at(s * 62, -8), "blush");
    b.decal(skull, BLUSH, { at: bl, size: [0.066, 0.042], mirror: s > 0 });
    const dt = must(skin.around(C).at(s * 31, -4), "dots");
    b.decal(skull, DOTS, { at: dt, size: [0.07, 0.047], mirror: s > 0 });
  });

  // a contented smile along the mouth line
  for (const [s] of SIDES) {
    const spec: [number, number][] = [
      [8, -37],
      [24, -38],
      [42, -36],
      [58, -31],
      [70, -25],
      [78, -17],
    ];
    const pts = spec.map(([az, el]) => {
      const h = must(skin.around(C).at(s * az, el), "smile");
      return h.at.clone().addScaledVector(h.n, 0.004);
    });
    b.sweep(catmull(pts), 0.0035, { color: SMILEC, bone: head });
  }

  // whiskers
  for (const [s] of SIDES) {
    for (let k = 0; k < 3; k++) {
      const h = must(skin.around(C).at(s * 36, 2 - k * 8), "whisker");
      const d = new THREE.Vector3(s * 0.75, 0.12 - 0.2 * k, 0.4).normalize();
      const p0 = h.at.clone();
      const p1 = p0.clone().addScaledVector(d, 0.08).add(new THREE.Vector3(0, 0.02, 0));
      const p2 = p0.clone().addScaledVector(d, 0.16).add(new THREE.Vector3(0, -0.02 - 0.015 * k, 0));
      b.sweep(bezier(p0, p1, p2), [0.003, 0.0008], { color: WHISK, bone: head, caps: { end: "point" }, sides: 5 });
    }
  }

  // ---------------- haunches and legs ----------------
  for (const [s] of SIDES) {
    b.part(ell(0.1, 0.13, 0.14, 10, 8), COAT, { bone: hips, at: [s * 0.21, 0.31, -0.36] });
  }

  const paw = (bone: Parameters<typeof b.part>[2]["bone"], x: number, z: number, n: number, spread: number, big: number) => {
    b.part(ell(0.05 * big, 0.032, 0.066 * big), PAWC, { bone, at: [x, 0.03, z + 0.02], flat: true });
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * spread;
      b.part(ell(0.0125 * big, 0.014, 0.022 * big, 6, 4), TOEC, { bone, at: [x + o, 0.017, z + 0.09 * big], flat: true });
      b.part(ell(0.009 * big, 0.007, 0.008 * big, 5, 4), NAILC, { bone, at: [x + o, 0.014, z + 0.108 * big], flat: true });
    }
  };

  for (const [s, S] of SIDES) {
    // forelegs
    const fp = limb([s * 0.17, 0.31, 0.17], [s * 0.17, 0.06, 0.2], [0.13, 0.13], [0, 0, -1]);
    const fl = b.chain(`legF${S}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "leg",
      contact: [s * 0.17, 0, 0.22],
    });
    b.sweep(fl, (t) => 0.08 - 0.036 * t, { color: LEGC, sides: 10 });
    paw(fl.tip, s * 0.17, 0.2, 4, 0.02, 1);

    // hind legs
    const hp = limb(
      [s * 0.21, 0.32, -0.34],
      [s * 0.21, 0.06, -0.3],
      [0.13, 0.12, 0.1],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
      contact: [s * 0.21, 0, -0.28],
    });
    b.sweep(hl, (t) => 0.095 - 0.052 * t, { color: LEGC, sides: 10 });
    paw(hl.tip, s * 0.21, -0.3, 3, 0.027, 1.1);
  }

  // ---------------- fur: coat, ruffs, nest ----------------
  const bodySkin = b.surface(body);
  const backHits = bodySkin.scatter(170, {
    rng: R,
    minDist: 0.05,
    filter: (h) => h.n.y > 0.05 && h.at.z < 0.3,
  });
  b.cards(backHits, TUFT, { size: [0.04, 0.07], lean: 70, bend: 25, vary: 0.3, spin: 25, rng: R, color: COAT });

  const topHit = skin.ray([0, 1.2, 0.47], [0, -1, 0]);
  const BP = topHit ? topHit.at.clone() : new THREE.Vector3(0, 0.638, 0.47);

  const ruffHits = skin.scatter(60, {
    rng: R,
    minDist: 0.035,
    filter: (h) =>
      h.at.z > 0.34 &&
      h.at.z < 0.5 &&
      h.n.y > -0.2 &&
      !eyeHits.some((e) => e.at.distanceTo(h.at) < 0.05) &&
      !earHits.some((e) => e.distanceTo(h.at) < 0.05) &&
      h.at.distanceTo(BP) > 0.075,
  });
  b.cards(ruffHits, TUFT, { size: [0.03, 0.05], lean: 60, bend: 20, vary: 0.3, spin: 20, rng: R, color: COAT });

  const nestHits = skin.scatter(16, {
    rng: R,
    minDist: 0.02,
    filter: (h) => {
      const d = h.at.distanceTo(BP);
      return d > 0.035 && d < 0.09 && h.n.y > 0.4;
    },
  });
  b.cards(nestHits, TUFT, { size: [0.025, 0.045], lean: 25, bend: 20, vary: 0.25, spin: 30, rng: R, color: COAT });

  // ---------------- the bird ----------------
  const birdBody = b.joint("birdBody", { parent: head, at: [BP.x, BP.y + 0.05, BP.z], dir: [0, 0.2, 1] });
  const birdHead = b.joint("birdHead", {
    parent: birdBody,
    at: [BP.x, BP.y + 0.108, BP.z + 0.03],
    dir: [0, 0, 1],
    role: "head",
  });
  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: [BP.x, BP.y + 0.098, BP.z + 0.058],
    aim: [BP.x, BP.y + 0.096, BP.z + 0.09],
    role: "jaw",
  });
  const birdTail = b.joint("birdTail", {
    parent: birdBody,
    at: [BP.x, BP.y + 0.06, BP.z - 0.045],
    dir: [0, -0.25, -1],
    role: "tail",
  });

  const bBody = b.part(ell(0.052, 0.05, 0.06, 10, 8), PLUMAGE, {
    bone: birdBody,
    at: [BP.x, BP.y + 0.055, BP.z],
    rotation: [-12, 0, 0],
  });
  const bHead = b.part(ell(0.037, 0.036, 0.037, 10, 8), BIRD_HEAD, {
    bone: birdHead,
    at: [BP.x, BP.y + 0.108, BP.z + 0.03],
  });

  // beak (upper on the head, lower on its own jaw bone, slightly open mid-chirp)
  b.spike([BP.x, BP.y + 0.107, BP.z + 0.062], [0, -0.12, 1], 0.032, 0.0115, { color: BEAK, bone: birdHead });
  b.spike([BP.x, BP.y + 0.098, BP.z + 0.06], [0, -0.05, 1], 0.024, 0.008, { color: BEAK2, bone: birdJaw });
  b.pose(birdJaw, { axis: [1, 0, 0], deg: 10 });

  // eyes, cheeks
  const bHeadSkin = b.surface(bHead);
  const bHeadC = new THREE.Vector3(BP.x, BP.y + 0.108, BP.z + 0.03);
  for (const [s] of SIDES) {
    const e = must(bHeadSkin.around(bHeadC).at(s * 66, 10), "bird eye");
    b.decal(bHead, BIRDEYE, { at: e, size: [0.02, 0.02], mirror: s > 0 });
    const ch = must(bHeadSkin.around(bHeadC).at(s * 70, -22), "bird cheek");
    b.stick(ell(0.009, 0.005, 0.009, 6, 4), PINK, ch, { embed: 0.3 });
  }

  // breast scallops
  const bBodySkin = b.surface(bBody);
  const breastHit = must(bBodySkin.around(new THREE.Vector3(BP.x, BP.y + 0.055, BP.z)).at(0, -16), "breast");
  b.decal(bBody, BREAST, { at: breastHit, size: [0.07, 0.06], segments: 10 });

  // crest
  for (const [dx, k] of [
    [-0.008, 0.8],
    [0, 1],
    [0.008, 0.8],
  ] as const) {
    b.extrude(scaled(CREST, k), {
      at: [BP.x + dx, BP.y + 0.137, BP.z + 0.025],
      x: [0, 0, 1],
      y: [dx * 15, 1, 0],
      thickness: 0.005,
      color: CORAL,
      bone: birdHead,
    });
  }

  // wings and tail
  for (const [s, S] of SIDES) {
    const wing = b.joint(`wing${S}`, {
      parent: birdBody,
      at: [BP.x + s * 0.045, BP.y + 0.09, BP.z + 0.03],
      dir: [0, -0.25, -1],
      role: "wing",
    });
    b.extrude(WING, {
      at: [BP.x + s * 0.047, BP.y + 0.09, BP.z + 0.03],
      x: [0, 0, -1],
      y: [-s * 0.25, 1, 0],
      thickness: 0.009,
      bevel: 0.003,
      smoothing: 1,
      color: WINGP,
      bone: wing,
    });
  }
  b.extrude(TAIL, {
    at: [BP.x, BP.y + 0.06, BP.z - 0.045],
    x: [0, -0.3, -1],
    y: [-1, 0, 0],
    thickness: 0.008,
    bevel: 0.002,
    color: TAILP,
    bone: birdTail,
  });

  // feet gripping the fur
  for (const [s] of SIDES) {
    const fx = BP.x + s * 0.02;
    b.part(ell(0.011, 0.005, 0.016, 6, 4), FEET, { bone: birdBody, at: [fx, BP.y + 0.006, BP.z + 0.02] });
    for (const dx of [-0.007, 0, 0.007]) {
      b.spike([fx + dx, BP.y + 0.006, BP.z + 0.03], [dx * 6, -0.03, 1], 0.017, 0.004, { color: FEET, bone: birdBody });
    }
  }

  return b.root;
}
