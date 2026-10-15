import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, noise, svg } from "../../../../src/index";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red panda on a mossy stone",
  description:
    "A cel-shaded, anime-styled red panda standing in a wide-pawed balance on a moss-covered boulder, ringed tail stretched out behind it. Big shiny anime eyes, white cheek ruffs, ringed tail and fur tufts.",
};

// ---------------------------------------------------------------------------------------------------------------
// Scale constants
const S = 0.22; // top of the stone: the panda's feet rest here
const STONE_C = new THREE.Vector3(0, 0, -0.04);
const HC = new THREE.Vector3(0, S + 0.3, 0.32); // skull centre
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const hv = (x: number, y: number, z: number) => V(HC.x + x, HC.y + y, HC.z + z); // a point in head units
const off = (p: THREE.Vector3, d: readonly number[], dist: number) =>
  p.clone().add(V(d[0], d[1], d[2]).normalize().multiplyScalar(dist));

// ---------------------------------------------------------------------------------------------------------------
// Palette (Genshin-ish cel shading: lit tone + hue-shifted shadow tone)
const ORANGE = cel("#f27b2b");
const DARK = cel("#3b2221");
const WHITE = cel("#fff6e6", "#e8cfc4");
const TEAR = cel("#b9471d");
const NOSE = cel("#2a1630", INK);
const TAIL_A = cel("#f07c2e");
const TAIL_B = cel("#b8461e");
const TAIL_TIP = cel("#46231f");
const EAR_BACK = cel("#33201f");

const MOSS_L = cel("#a2de55");
const MOSS_M = cel("#63b441");
const MOSS_D = cel("#3d8239");
const ROCK_A = cel("#aeb0cb");
const ROCK_B = cel("#8e92b3");
const ROCK_C = cel("#6f7497");
const CRACK = cel("#3a3d5a", "#2b2d44");

const COAT = furEdge(ORANGE, DARK, { level: -0.2, teeth: 0.22, period: 0.03, ink: INK, inkWidth: 0.05 });

const STONE = paint((p, n) => {
  const m = n.y + (noise(p, 0.16, 7) - 0.5) * 0.9;
  if (m > 0.56) return noise(p, 0.05, 3) > 0.6 ? MOSS_L : MOSS_M;
  if (m > 0.43) return MOSS_D;
  if (p.y < 0.04) return ROCK_C;
  if (Math.abs(noise(p, 0.07, 19) - 0.5) < 0.016) return CRACK;
  const v = noise(p, 0.1, 11);
  return v > 0.58 ? ROCK_A : v > 0.38 ? ROCK_B : ROCK_C;
});

const FACE = paint((p) => {
  const x = p.x - HC.x;
  const y = p.y - HC.y;
  const z = p.z - HC.z;
  const ax = Math.abs(x);
  if (z > 0.025 && y < -0.012 && y > -0.06) {
    const xe = 0.056 - (-y - 0.012) * 0.3;
    if (Math.abs(ax - xe) < 0.0045) return TEAR;
  }
  if (z > -0.04 && y < -0.006 - 0.012 * zigzag(ax / 0.02)) return WHITE;
  return ORANGE;
});

// Ringed tail: s = [t, deg]
const TAIL = paint((_p, _n, s) => {
  const t = s[0];
  if (t > 0.94) return TAIL_TIP;
  return Math.floor(t * 9) % 2 === 0 ? TAIL_A : TAIL_B;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2 C22 20 31 44 28 62 L4 62 C1 44 10 20 16 2Z" fill="#ffffff"/>
    <path d="M16 12 C16 30 16 46 16 60" stroke="#cfcfcf" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const GRASS = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 63 C6 40 8 20 4 4 C14 18 16 40 14 63Z" fill="#ffffff"/>
    <path d="M13 63 C13 40 16 14 17 1 C24 18 24 42 22 63Z" fill="#e4e4e4"/>
    <path d="M21 63 C22 44 24 28 29 14 C31 32 30 48 28 63Z" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 63 C24 50 24 40 24 30" stroke="#3d8239" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M24 48 C16 46 12 40 12 36 C18 36 22 40 24 46Z" fill="#5fae3e"/>
    <g fill="#fff3f6" stroke="#6a3a52" stroke-width="1.6">
      <ellipse cx="24" cy="14" rx="6.5" ry="10"/>
      <ellipse cx="36" cy="22" rx="6.5" ry="10" transform="rotate(70 36 22)"/>
      <ellipse cx="32" cy="35" rx="6.5" ry="10" transform="rotate(140 32 35)"/>
      <ellipse cx="16" cy="35" rx="6.5" ry="10" transform="rotate(-140 16 35)"/>
      <ellipse cx="12" cy="22" rx="6.5" ry="10" transform="rotate(-70 12 22)"/>
    </g>
    <circle cx="24" cy="26" r="6" fill="#ffc83a" stroke="#6a3a52" stroke-width="1.6"/>
  </svg>`,
  { size: 128 },
);
const EYE = animeEye({ iris: "#f0a030", irisLight: "#ffe08a", irisDark: "#9a4a14" });

// ---------------------------------------------------------------------------------------------------------------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda" });

  // ---- skeleton -------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, S + 0.185, -0.17], dir: [0, 0, 1] });

  const SPINE: number[][] = [
    [0, S + 0.17, -0.3],
    [0, S + 0.185, -0.17],
    [0, S + 0.19, 0],
    [0, S + 0.2, 0.15],
    [0, S + 0.21, 0.24],
  ];
  const spine = b.chain("spine", catmull(SPINE), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
  });
  const chest = spine.joints[3];

  const neck = b.chain(
    "neck",
    catmull([
      [0, S + 0.2, 0.2],
      [0, S + 0.235, 0.245],
      [0, S + 0.265, 0.28],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, S + 0.265, 0.28], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hv(0, -0.045, 0.04),
    aim: hv(0, -0.05, 0.11),
    role: "jaw",
  });

  const TAILPTS: number[][] = [
    [0, S + 0.19, -0.27],
    [0, S + 0.2, -0.43],
    [0, S + 0.25, -0.58],
    [0, S + 0.33, -0.69],
    [0, S + 0.44, -0.74],
  ];
  const tail = b.chain("tail", catmull(TAILPTS), {
    parent: spine.joints[0],
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });

  // ---- stone ----------------------------------------------------------------------------------------------
  const stone = b.lathe(
    [
      [0, 0],
      [0.4, 0],
      [0.45, 0.07],
      [0.42, 0.15],
      [0.36, 0.2],
      [0.3, 0.22],
      [0, 0.22],
    ],
    { at: STONE_C, segments: 9, spin: 12, color: STONE, bone: hips, name: "stone" },
  );
  for (const [x, z, r] of [
    [0.4, 0.1, 0.1],
    [-0.38, -0.24, 0.09],
  ]) {
    b.part(new THREE.IcosahedronGeometry(1, 1), STONE, {
      bone: hips,
      at: [x, r * 0.7 - 0.005, z],
      scale: [r, r * 0.7, r * 0.9],
      flat: true,
      name: "pebble",
    });
  }
  const stoneSkin = b.surface(stone);
  const radial = (h: { at: THREE.Vector3 }) => Math.hypot(h.at.x - STONE_C.x, h.at.z - STONE_C.z);

  // moss clumps
  const mossPaints = [MOSS_L, MOSS_M, MOSS_D];
  stoneSkin
    .scatter(18, { rng: rng(4), minDist: 0.08, filter: (h) => h.n.y > 0.15 && radial(h) > 0.33 })
    .forEach((hit, i) => {
      b.stick(new THREE.SphereGeometry(0.035, 6, 4), mossPaints[i % 3], hit, {
        embed: 0.5,
        scale: [1.2 + 0.3 * (i % 3), 0.7, 1.2],
        flat: true,
        bone: hips,
      });
    });
  // grass tufts
  const grassA = stoneSkin.scatter(26, { rng: rng(8), minDist: 0.06, filter: (h) => h.n.y > 0.2 && radial(h) > 0.32 });
  b.cards(grassA, GRASS, { size: [0.03, 0.075], lean: 20, bend: 20, vary: 0.35, rng: rng(9), color: "#86d548", bone: hips });
  const grassB = stoneSkin.scatter(18, { rng: rng(18), minDist: 0.07, filter: (h) => h.n.y > 0.2 && radial(h) > 0.32 });
  b.cards(grassB, GRASS, { size: [0.025, 0.06], lean: 35, bend: 20, vary: 0.3, rng: rng(19), color: "#4d9a3b", bone: hips });
  // little flowers
  const flowers = stoneSkin.scatter(8, { rng: rng(23), minDist: 0.1, filter: (h) => h.n.y > 0.3 && radial(h) > 0.33 });
  b.cards(flowers, FLOWER, { size: [0.04, 0.055], lean: 0, vary: 0.2, rng: rng(24), cross: true, bone: hips });
  // glowing dendro buds
  stoneSkin.scatter(5, { rng: rng(31), minDist: 0.12, filter: (h) => h.n.y > 0.4 && radial(h) > 0.33 }).forEach((hit) => {
    b.stick(new THREE.CylinderGeometry(0.002, 0.003, 0.05, 5), MOSS_D, hit, { embed: 0.3, bone: hips });
    glow(b.stick(new THREE.SphereGeometry(0.013, 6, 4), "#fff2a6", hit.moved([0, 0.05, 0]), { embed: 0.5, bone: hips }), 1.4);
  });

  // ---- body -----------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: SPINE[0], w: 0.12, h: 0.12 },
      { at: SPINE[1], w: 0.2, h: 0.19 },
      { at: SPINE[2], w: 0.2, h: 0.19 },
      { at: SPINE[3], w: 0.2, h: 0.21 },
      { at: SPINE[4], w: 0.14, h: 0.15 },
    ],
    { bone: spine, color: COAT },
  );
  b.sweep(neck, [0.075, 0.062], { color: COAT });

  // back fur tufts
  const bodySkin = b.surface(body);
  const backHits = bodySkin.scatter(55, { rng: rng(5), minDist: 0.035, filter: (h) => h.n.y > 0.35 });
  b.cards(backHits, TUFT, {
    size: [0.04, 0.06],
    lean: 60,
    bend: 25,
    flow: [0, -0.2, -1],
    vary: 0.3,
    rng: rng(6),
    color: ORANGE,
  });

  // ---- tail -----------------------------------------------------------------------------------------------
  b.sweep(tail, [0.05, 0.072, 0.082, 0.075, 0.05], { color: TAIL });

  // ---- legs -----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const root = front ? V(s * 0.08, S + 0.165, 0.12) : V(s * 0.085, S + 0.17, -0.19);
      const foot = front ? V(s * 0.1, S + 0.022, 0.17) : V(s * 0.105, S + 0.022, -0.27);
      const pts = limb(root, foot, [0.095, 0.095], [[0, 0, front ? -1 : 1]]);
      const ch = b.chain(front ? `arm${side}` : `leg${side}`, pts, {
        parent: front ? chest : hips,
        names: front ? [`shoulder${side}`, `elbow${side}`, `hand${side}`] : [`hip${side}`, `knee${side}`, `foot${side}`],
        role: front ? "arm" : "leg",
      });
      b.sweep(ch, [0.052, 0.034], { color: DARK });
      const tip = ch.tip!;
      b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
        bone: tip,
        at: foot.clone().add(V(0, 0, 0.014)),
        scale: [0.036, 0.023, 0.05],
      });
      for (const k of [-1, 0, 1]) {
        const tp = foot.clone().add(V(k * 0.017 + (s * k * 0.004), -0.003, 0.056));
        b.part(new THREE.SphereGeometry(0.0125, 6, 4), DARK, { bone: tip, at: tp });
        b.spike(tp.clone().add(V(0, 0, 0.008)), [0, -0.15, 1], 0.014, 0.0045, { color: "#f4e6cc", bone: tip, sides: 5 });
      }
    }
  }

  // ---- head -----------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), FACE, {
    bone: head,
    at: HC,
    scale: [0.105, 0.088, 0.092],
    name: "skull",
  });
  const skin = b.surface(skull);

  // muzzle, nose, jaw
  b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, {
    bone: head,
    at: hv(0, -0.03, 0.078),
    scale: [0.046, 0.036, 0.05],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: hv(0, -0.012, 0.127),
    scale: [0.019, 0.013, 0.012],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.0035, 5, 4), "#ffffff", { bone: head, at: hv(0.004, -0.006, 0.137) });
  b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, {
    bone: jaw,
    at: hv(0, -0.058, 0.085),
    scale: [0.03, 0.014, 0.036],
    name: "lowerJaw",
  });

  // anime eyes
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 40, 10);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.044, 0.06], mirror: s > 0 });
  }

  // cheek ruffs: broad white tufts
  for (const s of [1, -1]) {
    const spots: number[][] = [
      [72, -12],
      [86, -2],
      [82, -24],
      [68, -30],
      [94, -14],
    ];
    spots.forEach(([az, el], i) => {
      const hit = skin.around(HC).at(s * az, el);
      if (!hit) return;
      const tip = hit.at.clone().add(V(s * 0.045, -0.015 - 0.004 * i, -0.025));
      b.spike(hit, tip, null, 0.019, { color: WHITE, sides: 6 });
    });
  }

  // whiskers
  for (const s of [1, -1]) {
    for (const dy of [-0.012, 0, 0.012]) {
      b.rod(hv(s * 0.036, -0.03, 0.11), hv(s * 0.115, -0.03 + dy * 2.2, 0.125), 0.0015, "#fff6e6", {
        bone: head,
        sides: 4,
      });
    }
  }

  // ears: dark back, white front, white tufts
  for (const s of [1, -1]) {
    const base = hv(s * 0.068, 0.078, -0.004);
    const dir = [s * 0.5, 0.35, 0.8];
    b.part(new THREE.SphereGeometry(1, 10, 8), EAR_BACK, {
      bone: head,
      at: base,
      dir,
      axis: "z",
      scale: [0.05, 0.055, 0.022],
      name: "earBack",
    });
    const front = off(base, dir, 0.012);
    b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, {
      bone: head,
      at: front,
      dir,
      axis: "z",
      scale: [0.038, 0.043, 0.014],
      name: "earInner",
    });
    for (const k of [-1, 0, 1]) {
      const root = front.clone().add(V(s * k * 0.014, -0.032 + 0.004 * Math.abs(k), 0.006));
      b.spike(root, [s * k * 0.3, -0.5, 0.6], 0.024, 0.008, { color: WHITE, bone: head, sides: 5 });
    }
  }

  // forehead tuft
  for (const k of [-1, 0, 1]) {
    const p = hv(k * 0.02, 0.082, 0.03);
    b.spike(p, [k * 0.3, 0.7, 0.5], 0.03, 0.01, { color: ORANGE, bone: head, sides: 5 });
  }

  return b.root;
}
