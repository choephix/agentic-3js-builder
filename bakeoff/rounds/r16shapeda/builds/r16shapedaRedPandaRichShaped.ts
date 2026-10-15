import * as THREE from "three";
import {
  bezier,
  catmull,
  cells,
  createBuilder,
  frame,
  limb,
  noise,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import { cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A chibi cel-shaded red panda in a Genshin-style look, standing on its hind legs with arms and a ringed tail spread to balance on a mossy boulder, wearing a coin-and-tassel collar, with glowing blossoms on the rock.",
};

type Outline = [number, number][];

// Piecewise-linear key interpolation over t in 0..1.
const key = (ks: number[], t: number) => {
  const f = Math.min(Math.max(t, 0), 1) * (ks.length - 1);
  const i = Math.min(Math.floor(f), ks.length - 2);
  return ks[i] + (ks[i + 1] - ks[i]) * (f - i);
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every surface colour is a two-tone cel paint with a hand-picked shadow tone.
const RUST = cel("#f47a30", "#c8452c");
const RUST_DEEP = cel("#d9551f", "#a23222");
const RUST_LIGHT = cel("#ffa458", "#e2693a");
const CREAM = cel("#fff3dc", "#f0c9b0");
const BELLY = cel("#8f3f2a", "#5e2424");
const DARK = cel("#45262b", "#26141f");
const TEAR = cel("#7c2d1d", "#521a1a");
const RED_CORD = cel("#e0383e", "#9c2038");
const EAR_OUT = cel("#e96a2a", "#b73d2a");
const STONE_A = cel("#9aa2be", "#6c7499");
const STONE_B = cel("#7f88a8", "#59618a");
const CRACK = cel("#4a5070", "#343a58");
const MOSS_A = cel("#86d44a", "#3fa04a");
const MOSS_B = cel("#5db33e", "#2f8645");
const MOSS_C = cel("#b8ea62", "#62bc4a");

const NOSE = "#2a1620";
const CLAW = "#f6e8d0";
const GOLD = "#f0bf45";

// Tail rings: light and deep orange alternating, thin dark seams, dark tip.
const tailTone = (t: number) => {
  if (t > 0.91) return DARK;
  const k = Math.floor(t * 9);
  const f = t * 9 - k;
  if (k > 0 && f < 0.07) return BELLY;
  return k % 2 ? RUST_DEEP : RUST_LIGHT;
};

// Stone: moss on up-facing and damp low faces, cracked grey-blue rock elsewhere.
const stonePaint = paint((p, n) => {
  const w = noise(p, 0.11, 5);
  if (n.y + (w - 0.5) * 0.9 > 0.3 || (p.y < 0.06 && w > 0.4)) {
    const m = noise(p, 0.07, 8);
    return m > 0.62 ? MOSS_C : m > 0.3 ? MOSS_A : MOSS_B;
  }
  const c = cells(p, 0.2, 4);
  if (c.d2 - c.d1 < 0.1) return CRACK;
  return w > 0.5 ? STONE_A : STONE_B;
});

const mossLump = paint((p) => {
  const m = noise(p, 0.05, 12);
  return m > 0.62 ? MOSS_C : m > 0.35 ? MOSS_A : MOSS_B;
});

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const random = rng(7);

  // -------------------------------------------------------------------------------------------------------------
  // Drawings
  const EYE = svg(
    `<svg viewBox="0 0 64 80">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#4a1a10"/><stop offset="0.5" stop-color="#b8531e"/><stop offset="1" stop-color="#ffc660"/>
      </linearGradient></defs>
      <ellipse cx="32" cy="42" rx="29" ry="37" fill="#1e0f14"/>
      <ellipse cx="32" cy="45" rx="23.5" ry="31" fill="url(#g)"/>
      <ellipse cx="32" cy="43" rx="11" ry="17" fill="#1e0f14"/>
      <ellipse cx="22" cy="28" rx="9.5" ry="11.5" fill="#ffffff"/>
      <circle cx="43" cy="59" r="4.6" fill="#ffffff"/>
      <circle cx="46" cy="48" r="2.2" fill="#ffffff"/>
      <path d="M5 22 Q32 -4 59 22" stroke="#1e0f14" stroke-width="5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const BLUSH = svg(
    `<svg viewBox="0 0 64 40">
      <ellipse cx="32" cy="20" rx="30" ry="17" fill="#ff93ad"/>
      <path d="M18 28 l6 -14 M30 30 l6 -16 M42 28 l6 -14" stroke="#ff5f8a" stroke-width="3.4" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );

  const MOUTH = svg(
    `<svg viewBox="0 0 80 50">
      <path d="M40 0 L40 15" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
      <path d="M40 15 Q31 31 10 25" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
      <path d="M40 15 Q49 31 70 25" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
      <path d="M10 25 l-4 -5 M70 25 l4 -5" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const TUFT = svg(
    `<svg viewBox="0 0 32 64">
      <defs><linearGradient id="t" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#8e8e8e"/><stop offset="0.6" stop-color="#e0e0e0"/><stop offset="1" stop-color="#ffffff"/>
      </linearGradient></defs>
      <path d="M16 64 C2 50 6 26 16 1 C26 26 30 50 16 64Z" fill="url(#t)"/>
    </svg>`,
    { size: 128 },
  );

  const MOSS = svg(
    `<svg viewBox="0 0 64 48">
      <g stroke="#1f5a2a" stroke-width="1.6" stroke-linejoin="round">
        <path d="M6 48 C2 32 6 18 12 6 C16 20 18 34 18 48Z" fill="#3fa04a"/>
        <path d="M44 48 C46 34 52 22 60 12 C62 28 58 40 56 48Z" fill="#3fa04a"/>
        <path d="M16 48 C16 30 24 14 32 2 C38 16 40 34 40 48Z" fill="#86d44a"/>
        <path d="M28 48 C30 34 36 24 46 18 C46 30 44 40 42 48Z" fill="#5db33e"/>
        <path d="M2 48 C6 40 12 34 20 32 C20 40 18 44 16 48Z" fill="#b8ea62"/>
      </g>
    </svg>`,
    { size: 192 },
  );

  const FLOWER = svg(
    `<svg viewBox="0 0 48 48">
      <g transform="translate(24 24)" stroke="#3aa8c8" stroke-width="1.2">
        <ellipse cx="0" cy="-13" rx="6.5" ry="11" fill="#c8fbff"/>
        <ellipse cx="0" cy="-13" rx="6.5" ry="11" fill="#c8fbff" transform="rotate(72)"/>
        <ellipse cx="0" cy="-13" rx="6.5" ry="11" fill="#c8fbff" transform="rotate(144)"/>
        <ellipse cx="0" cy="-13" rx="6.5" ry="11" fill="#c8fbff" transform="rotate(216)"/>
        <ellipse cx="0" cy="-13" rx="6.5" ry="11" fill="#c8fbff" transform="rotate(288)"/>
        <circle cx="0" cy="0" r="6" fill="#fff6a8" stroke="#e8b84a"/>
      </g>
    </svg>`,
    { size: 128 },
  );

  const TASSEL = svg(
    `<svg viewBox="0 0 24 64">
      <circle cx="12" cy="5" r="4.5" fill="#f0bf45" stroke="#8a5a14" stroke-width="1.2"/>
      <path d="M12 8 L12 22" stroke="#9c2038" stroke-width="4"/>
      <path d="M6 22 L18 22 L21 62 L3 62Z" fill="#e0383e" stroke="#9c2038" stroke-width="1.4"/>
      <path d="M8 26 L7.5 60 M12 26 L12 62 M16 26 L16.5 60" stroke="#ff8a8a" stroke-width="1.4"/>
      <rect x="5" y="20" width="14" height="5" rx="2" fill="#f0bf45" stroke="#8a5a14" stroke-width="1"/>
    </svg>`,
    { size: 128 },
  );

  const COIN = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#f0bf45" stroke="#8a5a14" stroke-width="3"/>
      <circle cx="32" cy="32" r="24" fill="none" stroke="#b9822a" stroke-width="2"/>
      <path d="M32 12 C46 22 46 42 32 54 C18 42 18 22 32 12Z" fill="#5db33e" stroke="#1f5a2a" stroke-width="2"/>
      <path d="M32 18 L32 50 M32 30 L40 24 M32 38 L24 32" stroke="#1f5a2a" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const root = b.joint("root", { at: [0, 0, 0], group: "stone" });
  const hips = b.joint("hips", { parent: root, at: [0, 0.56, -0.05], role: "spine", group: "body" });
  const spinePath = catmull([
    [0, 0.58, -0.04],
    [0, 0.68, -0.02],
    [0, 0.79, 0.02],
    [0, 0.88, 0.05],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, role: "spine", group: "body" });
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 0.88, 0.05],
      [0, 0.95, 0.075],
    ],
    { parent: chest, names: ["neck"], role: "neck", group: "body" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.95, 0.075], dir: [0, 0.08, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.95, 0.13],
    aim: [0, 0.925, 0.24],
    role: "jaw",
    group: "head",
  });

  // -------------------------------------------------------------------------------------------------------------
  // The stone: a flat-topped boulder to balance on, a smaller one behind, pebbles, moss.
  const STONE_OUT: Outline = [
    [0, -0.012],
    [0.3, -0.012],
    [0.36, 0.05],
    [0.33, 0.14],
    [0.26, 0.22],
    [0.22, 0.27],
    [0, 0.27],
  ];
  const stoneMain = b.lathe(STONE_OUT, {
    at: [0, 0, 0],
    segments: 9,
    spin: 10,
    color: stonePaint,
    bone: root,
    group: "stone",
    name: "stone",
  });
  const stone2 = b.lathe(
    [
      [0, -0.012],
      [0.17, -0.012],
      [0.2, 0.05],
      [0.15, 0.14],
      [0.09, 0.18],
      [0, 0.185],
    ] as Outline,
    { at: [-0.31, 0, -0.24], segments: 7, spin: 20, color: stonePaint, bone: root, group: "stone", name: "stone2" },
  );
  const stone3 = b.lathe(
    [
      [0, -0.012],
      [0.12, -0.012],
      [0.14, 0.04],
      [0.1, 0.09],
      [0.05, 0.11],
      [0, 0.112],
    ] as Outline,
    { at: [0.36, 0, -0.14], segments: 6, spin: 5, color: stonePaint, bone: root, group: "stone", name: "stone3" },
  );
  for (const [x, z, r, rot] of [
    [0.3, 0.3, 0.05, 20],
    [-0.22, 0.34, 0.04, 60],
    [0.1, 0.4, 0.032, 10],
  ]) {
    b.part(new THREE.IcosahedronGeometry(1, 0), stonePaint, {
      bone: root,
      at: [x, r * 0.35, z],
      scale: [r, r * 0.75, r * 0.9],
      rotation: [rot, rot * 2, 0],
      flat: true,
      group: "stone",
    });
  }

  const rock = b.surface([stoneMain, stone2, stone3]);
  const offFeet = (h: { at: THREE.Vector3; n: THREE.Vector3 }) =>
    Math.hypot(h.at.x, h.at.z) > 0.225 && h.n.y > 0.2;
  // Chunky moss lumps on the rim and slopes.
  for (const hit of rock.scatter(16, { rng: random, minDist: 0.1, filter: offFeet })) {
    b.stick(new THREE.IcosahedronGeometry(0.05, 0), mossLump, hit, {
      embed: 0.45,
      scale: 0.7 + random() * 0.7,
      spin: random() * 360,
      flat: true,
      bone: root,
      group: "stone",
    });
  }
  // Grass-like moss tufts.
  const mossHits = rock.scatter(70, { rng: random, minDist: 0.055, filter: offFeet });
  b.cards(mossHits, MOSS, {
    size: [0.075, 0.065],
    lean: 15,
    bend: 20,
    cross: true,
    vary: 0.35,
    spin: 180,
    rng: random,
    bone: root,
  });
  // Glowing blossoms.
  const blossomHits = rock.scatter(8, {
    rng: rng(21),
    minDist: 0.16,
    filter: (h) => offFeet(h) && h.n.y > 0.4,
  });
  glow(
    b.cards(blossomHits, FLOWER, { size: 0.075, lean: 20, cross: true, vary: 0.25, rng: rng(22), bone: root }),
    1.2,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Body
  const BODY = furEdge(RUST, BELLY, {
    axis: [0, 0, 1],
    level: 0.3,
    teeth: 0.25,
    period: 0.045,
    along: [0, 1, 0],
    ink: "#4a1a1c",
    inkWidth: 0.05,
  });
  const body = b.sweep(spine, (t) => [key([0.125, 0.155, 0.145, 0.115], t), key([0.115, 0.145, 0.13, 0.1], t)], {
    color: BODY,
    group: "body",
  });

  // Collar: red cord round the chest, gold leaf coin and tassel.
  const collarLoop = b.surface(body).loop([0, 0.855, 0.045], { lift: 0.012 });
  b.sweep(collarLoop, 0.014, RED_CORD, { group: "neckwear" });
  const front = b.surface(body).ray([0, 0.8, 0.7], [0, 0, -1]);
  const coinZ = (front ? front.at.z : 0.17) + 0.03;
  const coinAt: [number, number, number] = [0, 0.8, coinZ];
  b.rod([0, 0.857, coinZ - 0.012], [0, 0.832, coinZ], 0.006, RED_CORD, { bone: chest, group: "neckwear" });
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.008, 14), GOLD, {
    bone: chest,
    at: coinAt,
    dir: [0, 0, 1],
    group: "neckwear",
  });
  b.part(new THREE.CircleGeometry(0.03, 14), "#ffffff", {
    bone: chest,
    at: [0, 0.8, coinZ + 0.0046],
    dir: [0, 0, 1],
    axis: "z",
    texture: COIN,
    group: "neckwear",
  });
  b.cards([frame([0, 0.766, coinZ], [0, 1, 0])], TASSEL, {
    size: [0.045, 0.1],
    lean: 180,
    flow: [0, 0, 1],
    bone: chest,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const HC: [number, number, number] = [0, 1.01, 0.09];
  const HEAD_PAINT = paint((p) => {
    const x = p.x;
    const ax = Math.abs(x);
    const y = p.y - HC[1];
    const z = p.z - HC[2];
    // Tear mark from the eye down the cheek.
    const ex = 0.066;
    const ey = -0.012;
    const dx = 0.088 - ex;
    const dy = -0.088 - ey;
    const t = Math.min(Math.max(((ax - ex) * dx + (y - ey) * dy) / (dx * dx + dy * dy), 0), 1);
    const d = Math.hypot(ax - (ex + dx * t), y - (ey + dy * t));
    if (z > 0.03 && d < 0.0075) return TEAR;
    if (z > -0.03 && y < -0.032 + 0.016 * zigzag(x / 0.03)) return CREAM;
    return RUST;
  });
  const skull = b.part(new THREE.SphereGeometry(1, 18, 12), HEAD_PAINT, {
    bone: head,
    at: HC,
    scale: [0.165, 0.14, 0.145],
    group: "head",
    name: "skull",
  });
  const skin = b.surface(skull);

  const MUZ: [number, number, number] = [0, 0.975, 0.205];
  const muzzle = b.part(new THREE.SphereGeometry(1, 14, 10), CREAM, {
    bone: head,
    at: MUZ,
    scale: [0.07, 0.047, 0.07],
    group: "head",
    name: "muzzle",
  });
  const lowerJaw = b.part(new THREE.SphereGeometry(1, 12, 8), CREAM, {
    bone: jaw,
    at: [0, 0.925, 0.205],
    scale: [0.052, 0.027, 0.052],
    group: "head",
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), NOSE, {
    bone: head,
    at: [0, 0.997, 0.262],
    scale: [0.028, 0.02, 0.02],
    group: "head",
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), "#ffffff", {
    bone: head,
    at: [0.008, 1.008, 0.278],
    group: "head",
    name: "noseShine",
  });
  const mouthHit = b.surface([muzzle, lowerJaw]).ray([0, 0.945, 0.7], [0, 0, -1]);
  if (mouthHit)
    b.decal([muzzle, lowerJaw], MOUTH, { at: mouthHit, size: [0.075, 0.047], group: "head", name: "mouth" });

  // Whisker dots.
  const muzzleSkin = b.surface(muzzle);
  for (const s of [1, -1])
    for (const [az, el] of [
      [28, -2],
      [20, 14],
      [42, 8],
    ]) {
      const h = muzzleSkin.around(MUZ).at(s * az, el);
      if (h) b.stick(new THREE.SphereGeometry(0.0065, 6, 4), INK, h, { embed: 0.4, bone: head, group: "head" });
    }

  // Eyes and blush (decals on the skull), cream brow spots.
  const brow = new THREE.SphereGeometry(0.02, 8, 6);
  brow.scale(1.5, 0.5, 1);
  for (const s of [1, -1]) {
    const eye = skin.around(HC).at(s * 27, 6);
    if (eye) b.decal(skin, EYE, { at: eye, size: [0.072, 0.09], group: "head", name: "eye" });
    const blush = skin.around(HC).at(s * 40, -16);
    if (blush) b.decal(skin, BLUSH, { at: blush, size: [0.05, 0.032], group: "head", name: "blush" });
    const bh = skin.around(HC).at(s * 30, 34);
    if (bh) b.stick(brow, CREAM, bh, { embed: 0.5, bone: head, group: "head" });
  }

  // Cheek ruffs: cream spikes flaring sideways and back.
  for (const s of [1, -1])
    for (const [el, down, len] of [
      [-2, 0.15, 0.085],
      [-20, 0.45, 0.09],
      [-38, 0.8, 0.075],
    ]) {
      const h = skin.around(HC).at(s * 66, el);
      if (h) b.spike(h, [s * 0.9, -down, -0.3], len, 0.032, CREAM, { bone: head, sides: 5, group: "head" });
    }
  // Fluffy cheek cards.
  const cheekHits = skin.scatter(34, {
    rng: rng(31),
    minDist: 0.03,
    filter: (h) => Math.abs(h.at.x) > 0.095 && h.at.y < HC[1] - 0.005 && h.at.z > HC[2] - 0.06,
  });
  b.cards(cheekHits, TUFT, {
    size: [0.04, 0.06],
    lean: 60,
    bend: 20,
    vary: 0.3,
    rng: rng(32),
    color: "#fff3dc",
    bone: head,
    flow: (_f, i) => [Math.sign(cheekHits[i].at.x), -0.25, -0.5],
  });

  // Ahoge: two curled rust tufts on the crown.
  const top = skin.around(HC).at(0, 78);
  if (top) {
    const p0 = top.at;
    for (const [dx, curl] of [
      [-0.018, -0.03],
      [0.02, 0.04],
    ])
      b.sweep(
        bezier(
          [p0.x + dx * 0.5, p0.y - 0.01, p0.z],
          [p0.x + dx, p0.y + 0.05, p0.z + 0.03],
          [p0.x + dx + curl, p0.y + 0.085, p0.z + 0.012],
        ),
        [0.022, 0.003],
        RUST,
        { bone: head, caps: { start: "flat", end: "point" }, sides: 6, group: "head" },
      );
  }

  // Ears: rounded rust triangles tilted outward with a cream inner.
  const EAR: Outline = [
    [-0.055, 0],
    [0.055, 0],
    [0.058, 0.035],
    [0.035, 0.075],
    [0, 0.095],
    [-0.035, 0.075],
    [-0.058, 0.035],
  ];
  const EAR_IN: Outline = [
    [-0.032, 0.012],
    [0.032, 0.012],
    [0.034, 0.035],
    [0.02, 0.062],
    [0, 0.076],
    [-0.02, 0.062],
    [-0.034, 0.035],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const earAt = new THREE.Vector3(s * 0.1, HC[1] + 0.1, HC[2] - 0.01);
    const earJoint = b.joint(`ear${S}`, {
      parent: head,
      at: earAt,
      dir: [s * 0.5, 1, 0.15],
      role: "hinge",
      group: "head",
    });
    const yd = new THREE.Vector3(s * 0.5, 1, 0.15).normalize();
    const xd = new THREE.Vector3(s, 0, 0);
    xd.addScaledVector(yd, -xd.dot(yd)).normalize();
    const zd = xd.clone().cross(yd);
    const fwd = zd.clone().multiplyScalar(Math.sign(zd.z) || 1);
    b.extrude(EAR, {
      at: earAt,
      x: xd,
      y: yd,
      thickness: 0.022,
      bevel: 0.005,
      smoothing: 1,
      color: EAR_OUT,
      bone: earJoint,
      group: "head",
      name: `ear${S}`,
    });
    b.extrude(EAR_IN, {
      at: earAt.clone().addScaledVector(fwd, 0.008),
      x: xd,
      y: yd,
      thickness: 0.016,
      smoothing: 1,
      color: CREAM,
      bone: earJoint,
      group: "head",
      name: `earInner${S}`,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs: stubby, dark, planted flat on the stone with toes forward.
  const LEG_PAINT = paint((p) => (p.y > 0.44 + 0.015 * zigzag((p.x + p.z) / 0.03) ? RUST : DARK));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.085, 0.55, -0.03], [s * 0.095, 0.305, 0.09], [0.16, 0.14, 0.1], [[0, 0, 1]], {
      sole: [0, 0, 1],
    });
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      group: "legs",
      contact: [s * 0.095, 0.265, 0.09],
    });
    b.sweep(leg, [0.066, 0.055, 0.046, 0.042], { color: LEG_PAINT, group: "legs" });
    const foot = leg.joints[leg.joints.length - 1];
    for (const k of [-1, 0, 1]) {
      const toe = foot.local({ forward: 0.034 - 0.007 * Math.abs(k), left: k * 0.027, down: 0.014 });
      b.part(new THREE.SphereGeometry(0.019, 8, 6), DARK, { bone: foot, at: toe, group: "legs" });
      b.spike(toe, [k * 0.12, -0.3, 1], 0.022, 0.007, CLAW, { bone: foot, sides: 5, group: "legs" });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms: held out to the sides for balance, dark forearms and paws.
  const ARM_PAINT = paint((p) => (Math.abs(p.x) > 0.27 + 0.018 * zigzag(p.z / 0.022) ? DARK : RUST));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      [
        [s * 0.1, 0.82, 0.03],
        [s * 0.23, 0.87, 0.05],
        [s * 0.35, 0.86, 0.065],
        [s * 0.43, 0.82, 0.08],
      ],
      {
        parent: chest,
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
        role: "arm",
        group: "arms",
      },
    );
    b.sweep(arm, [0.054, 0.05, 0.046, 0.043], { color: ARM_PAINT, group: "arms" });
    const hand = arm.joints[arm.joints.length - 1];
    for (const k of [-1, 0, 1]) {
      const finger = hand.local({ left: s * 0.036, forward: k * 0.024, down: 0.004 });
      b.part(new THREE.SphereGeometry(0.018, 8, 6), DARK, { bone: hand, at: finger, group: "arms" });
      b.spike(finger, [s, -0.15, k * 0.25], 0.024, 0.007, CLAW, { bone: hand, sides: 5, group: "arms" });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail: ringed, bushy, swung up behind as a counterweight.
  const tailPath = catmull([
    [0, 0.56, -0.1],
    [0, 0.52, -0.26],
    [0, 0.54, -0.44],
    [0, 0.66, -0.58],
    [0, 0.82, -0.64],
    [0, 0.94, -0.6],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail", group: "tail" });
  const tailSweep = b.sweep(tail, (t) => key([0.055, 0.085, 0.108, 0.105, 0.075, 0.028], t), {
    color: paint((_p, _n, s) => tailTone(s[0])),
    group: "tail",
  });
  const tailHits = b.surface(tailSweep).scatter(110, {
    rng: rng(11),
    minDist: 0.035,
    filter: (h) => h.n.y > -0.4,
  });
  b.cards(tailHits, TUFT, {
    size: [0.045, 0.085],
    lean: 60,
    bend: 25,
    vary: 0.3,
    rng: rng(12),
    color: paint((p) => tailTone(tailPath.closestT(p))),
    flow: (_f, i) => tailPath.tangentAt(tailPath.closestT(tailHits[i].at)),
  });

  return b.root;
}
