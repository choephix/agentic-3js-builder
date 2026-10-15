```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, frame, limb, mix, mottle, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";
import type { Builder, Joint } from "agentic-3js-builder";
import { animeEye, cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Oasis diorama",
  description:
    "A round desert plinth: a palm-ringed pool with rocks and grass, two striped tents with lanterns, and two camels.",
};

type Pt = [number, number, number];
type Tex = ReturnType<typeof textures>;
type Pose = { x: number; z: number; yaw: number };

// Layout, in metres. +Y up, the front of the diorama faces +Z.
const R = 2.9; // radius of the sand
const GROUND = 0.42; // top of the sand: everything stands here
const POOL = { x: 0, z: -0.4, r: 0.7 };

// Palette
const WOOD = cel("#8a5a3a");
const WATER = "#4fd8ea";
const BRASS = "#e7b04a";
const RED = "#e4553e";
const TEAL = "#2aa6a0";
const CANVAS = "#fff1d6";
const GOLD = "#ffd36b";
const STEM = "#4f8f3a";
const COCO = "#6b4226";
const HOOF = "#3d2a22";
const NOSE = "#3b2433";
const TUFT = "#7a4a2a";

// Paints. Every surface is cel-shaded; the lit tone and the hue-shifted shadow come from the toon kit.
const SAND = cel(
  paint((p, n) => {
    const base = mix("#f2bb7a", "#ffd9a2", smoothstep(0.3, 0.7, noise(p, 0.9, 2)));
    const ridge = 0.5 + 0.5 * Math.sin(p.x * 3.2 + p.z * 1.1 + noise(p, 0.7, 6) * 5);
    const streak = smoothstep(0.82, 0.96, ridge) * n.y;
    return mix(base, "#e8955f", 0.45 * streak);
  }),
);
const ROCK = cel(mottle("#d7aa80", "#9a6f58", { size: 0.16, seed: 3 }));
const TRUNK = cel(paint((_p, _n, s) => (Math.floor(s[0] * 13) % 2 ? "#6e4727" : "#a06f40")));
const LEAF = cel(paint((_p, _n, s) => (Math.floor(s[0] * 8) % 2 ? "#2f9e4f" : "#5cc96a")));
const COAT = cel(countershade("#e9a866", "#fbdcae", { level: -0.2, soft: 0.3 }));
const COAT_LOW = cel(countershade("#d89452", "#f3c88f", { level: -0.2, soft: 0.3 }));

/** A tent: two colours in vertical stripes around the sides, a red skirt and a gold peak. */
function tentPaint(a: string, b: string, k: number) {
  return cel(
    paint((_p, _n, s) => {
      if (s[0] < 0.2 * k) return RED;
      if (s[0] > 1.3 * k) return GOLD;
      return Math.floor(s[1] / 30) % 2 ? a : b;
    }),
  );
}

// Drawings. Every texture comes from one place so the atlas holds each once.
function trimSvg() {
  let s = `<svg viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="16" fill="${TEAL}"/>`;
  for (let i = 0; i < 12; i++) s += `<path d="M${i * 10} 16 L${i * 10 + 5} 3 L${i * 10 + 10} 16 Z" fill="${CANVAS}"/>`;
  return s + `<rect y="13" width="120" height="3" fill="${RED}"/></svg>`;
}

function rugSvg() {
  let s = `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="80" fill="${RED}"/><rect x="6" y="6" width="108" height="68" fill="${TEAL}"/>`;
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 6; i++) {
      const cx = 16 + i * 17.6;
      const cy = 14 + j * 16.7;
      s += `<path d="M${cx} ${cy - 6} L${cx + 6} ${cy} L${cx} ${cy + 6} L${cx - 6} ${cy} Z" fill="${GOLD}"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="1.8" fill="${RED}"/>`;
    }
  return s + `</svg>`;
}

function blanketSvg() {
  let s = `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="${RED}"/><rect width="64" height="5" fill="${TEAL}"/><rect y="27" width="64" height="5" fill="${TEAL}"/>`;
  for (let i = 0; i < 8; i++) {
    s += `<path d="M${i * 8} 26 L${i * 8 + 4} 11 L${i * 8 + 8} 26 Z" fill="${GOLD}"/>`;
    s += `<circle cx="${i * 8 + 4}" cy="16" r="1.4" fill="${CANVAS}"/>`;
  }
  return s + `</svg>`;
}

function textures() {
  return {
    eye: animeEye({ iris: "#ffb13b", size: 512 }),
    grass: svg(
      `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 64 Q12 30 4 8 Q20 30 22 64 Z" fill="#2f8f4a"/>
        <path d="M20 64 Q22 22 34 2 Q34 30 40 64 Z" fill="#48b25c"/>
        <path d="M36 64 Q40 34 58 16 Q48 40 50 64 Z" fill="#2f8f4a"/>
        <path d="M26 64 Q28 42 24 30 Q36 44 33 64 Z" fill="#9ada72"/>
      </svg>`,
      { size: 128 },
    ),
    door: svg(
      `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 56 V22 Q20 0 37 22 V56 Z" fill="#2b1b33"/>
        <path d="M7 56 V23 Q20 6 33 23 V56" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
        <path d="M4 40 H36" stroke="${RED}" stroke-width="3"/>
      </svg>`,
      { size: 256 },
    ),
    trim: svg(trimSvg(), { size: 256 }),
    rug: svg(rugSvg(), { size: 256 }),
    blanket: svg(blanketSvg(), { size: 256 }),
    plaque: svg(
      `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="196" height="56" rx="10" fill="#4a2c1a" stroke="${GOLD}" stroke-width="4"/>
        <text x="100" y="42" text-anchor="middle" font-family="serif" font-weight="bold" font-size="38" fill="${GOLD}">OASIS</text>
      </svg>`,
      { size: 256 },
    ),
  };
}

const EAR: [number, number][] = [
  [-0.045, 0],
  [0.045, 0],
  [0.07, 0.14],
  [0.03, 0.3],
  [-0.03, 0.3],
  [-0.07, 0.14],
];

/**
 * A dromedary in its rest pose. Local space: +Z forward, +X the camel's left, standing on the sand. Its spine is a chain
 * (hips, back, withers, chest) that carries the body loft, legs, tail and neck; the neck carries the head, and the head
 * carries the upper head loft, a separate jaw, big eyes and ears.
 */
function camel(b: Builder, root: Joint, tex: Tex, id: string, at: Pose, turn: number) {
  const P = (x: number, y: number, z: number): Pt => {
    const s = Math.sin(at.yaw);
    const c = Math.cos(at.yaw);
    return [at.x + x * c + z * s, GROUND + y, at.z - x * s + z * c];
  };

  const spine = b.chain(
    `${id}Spine`,
    catmull([P(0, 1.0, -0.8), P(0, 1.06, -0.4), P(0, 1.12, 0), P(0, 1.2, 0.34)]),
    { parent: root, names: [`${id}Hips`, `${id}Back`, `${id}Withers`, `${id}Chest`], role: "spine" },
  );
  const hips = spine.joints[0];
  const withers = spine.joints[2];
  const chest = spine.joints[3];

  // Body: a loft that skins along the spine, a hump and a saddle blanket.
  b.loft(
    [
      { at: P(0, 0.98, -0.78), w: 0.48, h: 0.46 },
      { at: P(0, 1.06, -0.42), w: 0.74, h: 0.66 },
      { at: P(0, 1.12, -0.02), w: 0.8, h: 0.74 },
      { at: P(0, 1.2, 0.32), w: 0.66, h: 0.6 },
    ],
    { bone: spine, color: COAT },
  );
  b.part(new THREE.SphereGeometry(0.32, 8, 6), COAT, {
    bone: spine.joints[1],
    at: P(0, 1.42, -0.12),
    scale: [0.9, 1.1, 0.95],
  });
  b.part(new THREE.BoxGeometry(0.8, 0.34, 0.44), "#ffffff", {
    bone: spine.joints[1],
    at: P(0, 1.2, -0.5),
    texture: tex.blanket,
  });

  // Neck and head.
  const neck = b.chain(`${id}Neck`, catmull([P(0, 1.2, 0.34), P(0, 1.52, 0.6), P(0, 1.88, 0.86)]), {
    parent: chest,
    names: [`${id}Neck1`, `${id}Neck2`, `${id}Head`],
    role: "neck",
  });
  b.sweep(neck, (t) => 0.2 - 0.07 * t, { color: COAT });
  const head = neck.joints[2];
  const skull = b.loft(
    [
      { at: P(0, 1.9, 0.72), w: 0.26, h: 0.28 },
      { at: P(0, 1.94, 0.86), w: 0.34, h: 0.34 },
      { at: P(0, 1.9, 1.0), w: 0.28, h: 0.25 },
      { at: P(0, 1.82, 1.14), w: 0.18, h: 0.16 },
    ],
    { bone: head, color: COAT },
  );

  // Big anime eyes, conformed to the skull. The left eye (+X) is the mirrored drawing.
  const center = P(0, 1.94, 0.86);
  for (const s of [1, -1]) {
    const hit = b.surface(skull).around(center).at(s * 42, 6);
    if (hit) b.decal(skull, tex.eye, { at: hit, size: [0.115, 0.158], mirror: s > 0 });
  }
  for (const s of [1, -1]) {
    b.extrude(EAR, {
      at: head.local({ left: s * 0.13, up: 0.14, back: 0.02 }),
      x: [0, 0, 1],
      y: [0, 0.92, -0.4],
      thickness: 0.035,
      smoothing: 1,
      color: COAT,
      bone: head,
    });
  }
  b.part(new THREE.SphereGeometry(0.065, 7, 5), NOSE, { bone: head, at: P(0, 1.8, 1.17), scale: [1, 0.8, 1.1] });

  // A separate lower jaw, so the mouth can open.
  const jaw = b.joint(`${id}Jaw`, { parent: head, at: P(0, 1.8, 0.92), aim: P(0, 1.74, 1.16), role: "jaw" });
  b.capsule(P(0, 1.8, 0.9), P(0, 1.77, 1.1), 0.05, { color: COAT_LOW, bone: jaw });

  // A brass bell and a red tassel on the neck.
  b.part(new THREE.SphereGeometry(0.05, 7, 5), BRASS, { bone: neck.joints[1], at: P(0, 1.46, 0.6) });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { bone: neck.joints[1], at: P(0, 1.38, 0.6) });

  // Legs: two-bone IK planted on the sand. Fronts bend forward, hinds bend back at the hock.
  const leg = (name: string, hip: Pt, foot: Pt, parent: Joint, bend: [number, number, number]) => {
    const pts = limb(hip, foot, [0.56, 0.56], bend);
    const ch = b.chain(`${id}${name}`, pts, {
      parent,
      names: [`${id}${name}Hip`, `${id}${name}Knee`, `${id}${name}Foot`],
      role: "leg",
    });
    b.sweep(ch, [0.11, 0.055], { color: COAT_LOW });
    b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.08, 8), HOOF, {
      bone: ch.joints[ch.joints.length - 1],
      at: [foot[0], GROUND + 0.04, foot[2]],
    });
  };
  leg("FL", P(0.24, 1.14, 0.3), P(0.24, 0.06, 0.36), withers, [0, 0, 1]);
  leg("FR", P(-0.24, 1.14, 0.3), P(-0.24, 0.06, 0.36), withers, [0, 0, 1]);
  leg("HL", P(0.26, 1.0, -0.62), P(0.26, 0.06, -0.66), hips, [0, 0, -1]);
  leg("HR", P(-0.26, 1.0, -0.62), P(-0.26, 0.06, -0.66), hips, [0, 0, -1]);

  // Tail with a tuft.
  const tail = b.chain(`${id}Tail`, catmull([P(0, 1.1, -0.9), P(0, 0.98, -1.06), P(0, 0.84, -1.12)]), {
    parent: hips,
    names: [`${id}Tail1`, `${id}Tail2`, `${id}TailTip`],
    role: "tail",
  });
  b.sweep(tail, (t) => 0.07 - 0.03 * t, { color: COAT });
  b.part(new THREE.SphereGeometry(0.06, 6, 5), TUFT, { bone: tail.joints[2], at: P(0, 0.8, -1.13) });

  // Turn the head a little, so the camel looks about.
  b.pose(neck.joints[0], { axis: [0, 1, 0], deg: turn });
}

/** A palm: a tapered trunk with ringed bark, a coconut cluster and eight leaves of zig-zag membrane. */
function palm(
  b: Builder,
  root: Joint,
  id: string,
  base: [number, number],
  h: number,
  lean: [number, number],
  rnd: () => number,
) {
  const G = GROUND;
  const [x, z] = base;
  const top: Pt = [x + lean[0], G + h, z + lean[1]];
  const trunk = b.chain(
    `${id}Trunk`,
    catmull([
      [x, G, z],
      [x + lean[0] * 0.3, G + h * 0.35, z + lean[1] * 0.3],
      [x + lean[0] * 0.7, G + h * 0.7, z + lean[1] * 0.7],
      top,
    ]),
    { parent: root, names: [`${id}Lo`, `${id}Mid`, `${id}Hi`, `${id}Crown`] },
  );
  b.sweep(trunk, (t) => 0.1 + 0.06 * (1 - t) + 0.07 * Math.max(0, 1 - t * 7), { color: TRUNK });
  const crown = trunk.joints[3];

  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + rnd() * 0.5;
    b.part(new THREE.SphereGeometry(0.09, 6, 5), COCO, {
      bone: crown,
      at: [top[0] + Math.cos(a) * 0.08, top[1] - 0.14, top[2] + Math.sin(a) * 0.08],
    });
  }

  const up = new THREE.Vector3(0, 1, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + (rnd() - 0.5) * 0.4;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const L = 0.9 + rnd() * 0.25;
    const q = (out: number, lift: number): Pt => [top[0] + dx * out * L, top[1] + lift, top[2] + dz * out * L];
    const curve = catmull([q(0.1, 0.05), q(0.35, 0.16), q(0.75, 0.34), q(1.12, 0.22), q(1.5, -0.12)]);
    const frond = b.chain(`${id}F${k}`, curve, { parent: crown, count: 3 });
    b.sweep(frond, (t) => 0.024 - 0.012 * t, { color: STEM });

    // Leaflets: the two edges zig-zag, and the arch lifts them into a V.
    const left: Pt[] = [];
    const right: Pt[] = [];
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      const c = curve.at(t);
      const tan = curve.tangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const wBase = 0.2 * Math.pow(Math.sin(Math.PI * (0.06 + 0.88 * t)), 0.8);
      const w = wBase * (i % 2 ? 0.5 : 1);
      const lift = 0.22 * wBase;
      left.push([c.x + side.x * w, c.y + lift, c.z + side.z * w]);
      right.push([c.x - side.x * w, c.y + lift, c.z - side.z * w]);
    }
    b.membrane(left, right, { color: LEAF, bone: frond, thickness: 0.012 });
  }
}

/** A striped tent: a square lathe with a gold peak, a trim band, a drawn door, a pole and a pennant. */
function tent(b: Builder, root: Joint, tex: Tex, c: [number, number], k: number, colours: [string, string]) {
  const G = GROUND;
  const [x, z] = c;
  b.lathe([[0, 0], [1.75 * k, 0], [1.0 * k, 1.0 * k], [0, 1.6 * k]], {
    at: [x, G, z],
    segments: 4,
    spin: 45,
    color: tentPaint(colours[0], colours[1], k),
    bone: root,
  });
  // The front faces +Z (its normal leans up: about [0, 0.47, 0.88]).
  const tentBody = b.surface(root); // placeholder to keep the surface type in scope; the decals target the lathe below
  void tentBody;
  const body = b.lathe([[0, 0], [1.75 * k, 0], [1.0 * k, 1.0 * k], [0, 1.6 * k]], {
    at: [x, G, z],
    segments: 4,
    spin: 45,
    color: tentPaint(colours[0], colours[1], k),
    bone: root,
  });
  b.decal(body, tex.door, {
    at: [x, G + 0.33 * k, z + 1.12 * k],
    dir: [0, 0.47, 0.88],
    size: [0.44 * k, 0.62 * k],
  });
  b.decal(body, tex.trim, {
    at: [x, G + 0.82 * k, z + 0.84 * k],
    dir: [0, 0.47, 0.88],
    size: [1.3 * k, 0.17 * k],
  });
  b.rod([x, G + 1.6 * k, z], [x, G + 1.95 * k, z], 0.025, BRASS, { bone: root });
  b.extrude(
    [
      [0, 0],
      [0.5, 0.07],
      [0.42, 0.15],
      [0.5, 0.22],
      [0, 0.22],
    ],
    { at: [x, G + 1.7 * k, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: colours[1] === CANVAS ? RED : TEAL, bone: root },
  );
  b.part(new THREE.PlaneGeometry(1.0 * k * 1.2, 0.8 * k), "#ffffff", {
    bone: root,
    at: [x, G + 0.012, z + 1.5 * k],
    dir: [0, 1, 0],
    axis: "z",
    texture: tex.rug,
  });
}

/** A brass staff with a glowing lantern. */
function lantern(b: Builder, root: Joint, x: number, z: number) {
  const G = GROUND;
  b.rod([x, G, z], [x, G + 1.0, z], 0.02, BRASS, { bone: root });
  glow(
    b.part(new THREE.SphereGeometry(0.1, 8, 6), "#ffc65c", {
      bone: root,
      at: [x, G + 1.12, z],
      scale: [1, 1.2, 1],
    }),
    1.6,
  );
  b.part(new THREE.CylinderGeometry(0.09, 0.12, 0.05, 8), BRASS, { bone: root, at: [x, G + 1.25, z] });
}

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const tex = textures();
  const root = b.joint("oasis", { at: [0, 0, 0] });
  const rnd = rng(11);

  // Plinth with a painted sand top and a plaque on its front.
  const plinth = b.part(new THREE.CylinderGeometry(R + 0.12, R + 0.22, 0.3, 30), WOOD, {
    bone: root,
    at: [0, 0.15, 0],
  });
  b.decal(plinth, tex.plaque, { at: [0, 0.15, R + 0.2], dir: [0, 0, 1], size: [0.9, 0.27] });
  b.part(new THREE.CylinderGeometry(R, R, 0.12, 30), SAND, { bone: root, at: [0, 0.36, 0] });

  // The pool, ringed with rocks and tufts of grass.
  glow(
    b.part(new THREE.CylinderGeometry(POOL.r, POOL.r, 0.03, 26), WATER, {
      bone: root,
      at: [POOL.x, GROUND + 0.005, POOL.z],
    }),
    0.35,
  );
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + (rnd() - 0.5) * 0.3;
    const r = POOL.r + 0.17 + rnd() * 0.06;
    const sc = 0.8 + rnd() * 0.5;
    b.part(new THREE.DodecahedronGeometry(0.15 * sc), ROCK, {
      bone: root,
      at: [POOL.x + Math.cos(a) * r, GROUND + 0.03, POOL.z + Math.sin(a) * r],
      scale: [1.25, 0.75, 1.0],
      rotation: [rnd() * 40, rnd() * 180, rnd() * 40],
    });
  }
  const tufts = [];
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2;
    const r = POOL.r + 0.3 + rnd() * 0.5;
    tufts.push(frame([POOL.x + Math.cos(a) * r, GROUND, POOL.z + Math.sin(a) * r], [0, 1, 0]));
  }
  b.cards(tufts, tex.grass, { size: [0.2, 0.3], vary: 0.3, rng: rng(5), bone: root });

  // Palms around the back of the oasis.
  palm(b, root, "pA", [-2.0, -1.6], 4.2, [0.25, 0.1], rnd);
  palm(b, root, "pB", [1.9, -1.8], 3.8, [-0.3, 0.1], rnd);
  palm(b, root, "pC", [-0.7, -2.35], 4.5, [0.2, -0.2], rnd);
  palm(b, root, "pE", [1.0, -2.45], 3.0, [-0.1, 0], rnd);

  // Two tents, each with a lantern on a staff.
  tent(b, root, tex, [-1.5, 0.3], 0.85, [CANVAS, RED]);
  tent(b, root, tex, [1.45, 0.2], 0.85, [TEAL, CANVAS]);
  lantern(b, root, -2.35, 1.3);
  lantern(b, root, 2.3, 1.2);

  // Two camels: one turns its head over the pool, the other looks back at the palms.
  camel(b, root, tex, "cA", { x: -0.05, z: 1.7, yaw: Math.PI }, 25);
  camel(b, root, tex, "cB", { x: -0.5, z: -1.5, yaw: 1.8 }, -15);

  return b.root;
}
```