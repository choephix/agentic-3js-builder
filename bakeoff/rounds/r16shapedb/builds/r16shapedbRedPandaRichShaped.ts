import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Mossstep Red Panda",
  description:
    "A cel-shaded, Genshin-style red panda balancing on a mossy boulder: big anime eyes, ringed tail arched for balance, a teal scarf with a glowing charm, and glowing runes on the stone.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every colour is a lit tone and a hue-shifted shadow tone (toon kit).
const ST = 0.3; // height of the stone's top, where the paws stand

const RUST = cel(mottle("#e4642b", "#f27f3a", { size: 0.09, seed: 4, contrast: 1.4 }));
const RUST_PALE = cel("#f59a5e", "#dd6c38");
const RUST_DEEP = cel("#b9401d", "#8a2a1c");
const DARK = cel("#4d2521", "#2b1418");
const CREAM = cel("#fff3dc", "#f0c9aa");
const TEAL = cel("#27b9b8", "#1a809c");
const TEAL_DEEP = cel("#168a95", "#14587c");
const GOLD = cel("#f8d062", "#c98a2a");
const CLAW = "#fff0d6";
const NOSE = "#1b0f17";
const MOUTH = "#3b1620";
const WHISKER = "#fff8ea";

const STONE = cel(mottle("#7f8f96", "#a3b0ae", { size: 0.14, seed: 9, contrast: 1.2 }), "#4b5575");
const MOSS = cel(mottle("#62b03c", "#93d24c", { size: 0.08, seed: 2, contrast: 1.3 }), "#2f7a4a");
const MOSS_DEEP = cel("#3d8431", "#235a40");

// The rock: moss on the upward faces with ragged edges and patches creeping down the sides.
const ROCK = paint((p, n) => {
  const wob = noise(p, 0.12, 21);
  const m = n.y + (wob - 0.5) * 1.1;
  const patch = noise(p, 0.09, 33) > 0.7 && p.y > 0.08;
  if (m > 0.38 || patch) return m > 0.5 || patch ? MOSS : MOSS_DEEP;
  if (m > 0.3) return MOSS_DEEP;
  return STONE;
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const mossBlades = (cols: string[], w: number, h: number, n: number, seed: number) => {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * w + (r() - 0.5) * 4;
    const bh = h * (0.45 + 0.5 * r());
    const lean = (r() - 0.5) * 16;
    const c = cols[i % cols.length];
    out += `<path d="M${(x - 3.5).toFixed(1)} ${h} Q${(x - 1 + lean * 0.4).toFixed(1)} ${(h - bh * 0.6).toFixed(1)} ${(x + lean).toFixed(1)} ${(h - bh).toFixed(1)} Q${(x + 2.5 + lean * 0.5).toFixed(1)} ${(h - bh * 0.5).toFixed(1)} ${(x + 3.5).toFixed(1)} ${h} Z" fill="${c}" stroke="#1f5a34" stroke-width="0.8"/>`;
  }
  return out;
};
const MOSS_TUFT = svg(
  `<svg viewBox="0 0 64 48">${mossBlades(["#4f9e36", "#7cc443", "#a5df5a", "#5fae3b"], 64, 48, 9, 3)}</svg>`,
  { size: 128 },
);
const VINE = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M10 64 Q8 40 12 20 Q14 8 16 0 Q19 10 20 22 Q24 42 22 64 Z" fill="#5fae3b" stroke="#1f5a34" stroke-width="1"/>
    <path d="M12 50 Q4 46 2 38 Q10 40 13 46 Z M20 36 Q28 32 30 24 Q22 26 19 32 Z M13 26 Q6 22 5 14 Q12 16 14 22 Z" fill="#8fd04a" stroke="#1f5a34" stroke-width="0.8"/>
  </svg>`,
  { size: 128 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 40 56">
    <path d="M20 56 Q19 40 20 24" stroke="#2f7a3a" stroke-width="3" fill="none"/>
    <path d="M20 44 Q10 42 7 34 Q16 34 20 40 Z" fill="#5fae3b" stroke="#1f5a34" stroke-width="1"/>
    <g fill="#fff6f0" stroke="#d9a2b6" stroke-width="1.2">
      <ellipse cx="20" cy="9" rx="5.5" ry="8"/>
      <ellipse cx="31" cy="17" rx="5.5" ry="8" transform="rotate(72 31 17)"/>
      <ellipse cx="27" cy="29" rx="5.5" ry="8" transform="rotate(144 27 29)"/>
      <ellipse cx="13" cy="29" rx="5.5" ry="8" transform="rotate(216 13 29)"/>
      <ellipse cx="9" cy="17" rx="5.5" ry="8" transform="rotate(288 9 17)"/>
    </g>
    <circle cx="20" cy="19" r="5" fill="#ffd25a" stroke="#c98a2a" stroke-width="1.2"/>
  </svg>`,
  { size: 128 },
);
const TUFT = svg(
  `<svg viewBox="0 0 32 64">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b5b5b5"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <path d="M2 64 C5 42 10 20 16 0 C22 20 27 42 30 64 Z" fill="url(#g)"/>
  </svg>`,
  { size: 96 },
);
const RUNE = svg(
  `<svg viewBox="0 0 128 128">
    <g fill="none" stroke="#7ff7e6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="64" cy="64" r="56"/>
      <circle cx="64" cy="64" r="44" stroke-width="3"/>
      <path d="M64 24 C84 40 84 82 64 104 C44 82 44 40 64 24 Z"/>
      <path d="M64 36 L64 96" stroke-width="3"/>
      <path d="M64 56 L82 44 M64 70 L46 58 M64 82 L80 72" stroke-width="3.5"/>
    </g>
    <g fill="#ffffff"><circle cx="64" cy="64" r="5"/><circle cx="64" cy="8" r="4"/><circle cx="64" cy="120" r="4"/><circle cx="8" cy="64" r="4"/><circle cx="120" cy="64" r="4"/></g>
  </svg>`,
  { size: 256 },
);
const CHARM = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#2fe6d2"/>
    <path d="M32 8 C46 20 46 44 32 58 C18 44 18 20 32 8 Z" fill="#c9fff6"/>
    <path d="M32 18 L32 52 M32 32 L42 24 M32 42 L22 34" stroke="#1d9aa8" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const EYE = animeEye({ iris: "#2bd4c4", irisDark: "#157e8f", blush: "#ff9a86", brow: false });

const sph = (w = 12, h = 8) => new THREE.SphereGeometry(1, w, h);

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const rand = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const root = b.joint("root", { at: [0, 0, 0], group: "stone" });
  const spineP = catmull([
    [0, 0.5, -0.2],
    [0, 0.515, -0.05],
    [0, 0.53, 0.07],
    [0, 0.545, 0.17],
  ]);
  const spine = b.chain("spine", spineP, {
    parent: root,
    names: ["hips", "spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const hips = spine.joints[0];
  const chest = spine.tip!;
  const neckP = catmull([
    [0, 0.545, 0.17],
    [0, 0.58, 0.215],
    [0, 0.603, 0.26],
    [0, 0.607, 0.3],
  ]);
  const neck = b.chain("neck", neckP, { parent: chest, role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: neckP.at(1), dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.045 }),
    aim: head.local({ forward: 0.17, down: 0.045 }),
    role: "jaw",
    group: "head",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Paints that need the layout
  const HC = head.local({ forward: 0.06 }); // skull centre
  const tailP = catmull([
    [0, 0.52, -0.26],
    [0, 0.55, -0.4],
    [0, 0.64, -0.54],
    [0, 0.78, -0.63],
    [0, 0.93, -0.64],
    [0, 1.04, -0.56],
  ]);
  const ringColor = (t: number, deg: number) => {
    if (t > 0.94) return DARK;
    if (t < 0.07) return RUST;
    return Math.floor(t * 8.5 + 0.2 * zigzag(deg / 50)) % 2 === 0 ? RUST_PALE : RUST_DEEP;
  };
  const TAIL = paint((_p, _n, s) => ringColor(s[0], s[1]));
  const TAIL_CARD = paint((p) => ringColor(tailP.closestT(p), 0));
  const COAT = furEdge(RUST, DARK, { level: -0.28, teeth: 0.3, period: 0.032 });
  const LEG = paint((p) => (p.y > ST + 0.115 + 0.02 * zigzag((p.x + p.z) / 0.03) ? RUST : DARK));
  const SKULL = paint((p, n) => {
    const x = Math.abs(p.x - HC.x);
    const y = p.y - HC.y;
    const z = p.z - HC.z;
    if (z > 0 && n.z > -0.1) {
      const tx = 0.044 + (-0.004 - y) * 0.14;
      if (y < -0.006 && y > -0.06 && Math.abs(x - tx) < 0.0058 * (1 - (-0.006 - y) / 0.11)) return DARK;
      const bx = (x - 0.05) / 0.025;
      const by = (y - 0.05) / 0.0125;
      if (bx * bx + by * by < 1) return CREAM;
      if (y < -0.024 + 0.016 * zigzag(x / 0.024 + 0.25)) return CREAM;
    }
    return RUST;
  });

  // -------------------------------------------------------------------------------------------------------------
  // Stone (a prop: kept simpler than the panda, built to its footprint)
  const rockProfile = [
    [0, 0],
    [0.32, 0],
    [0.38, 0.06],
    [0.39, 0.15],
    [0.36, 0.24],
    [0.3, 0.288],
    [0.26, 0.3],
    [0, 0.3],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const boulder = b.part(new THREE.LatheGeometry(rockProfile, 9), ROCK, {
    bone: root,
    at: [0, 0, 0],
    scale: [1, 1, 1.25],
    flat: true,
    group: "stone",
    name: "boulder",
  });
  const lumps: Array<[number[], number[], number]> = [
    [[0.3, 0.115, 0.3], [0.17, 0.12, 0.15], 20],
    [[-0.28, 0.125, -0.26], [0.18, 0.13, 0.17], 50],
    [[-0.32, 0.06, 0.3], [0.1, 0.065, 0.1], 80],
    [[0.06, 0.1, -0.46], [0.2, 0.1, 0.13], 10],
    [[0.34, 0.05, -0.2], [0.1, 0.055, 0.12], 0],
  ];
  const rocks = [boulder];
  for (const [at, scale, rot] of lumps)
    rocks.push(
      b.part(new THREE.IcosahedronGeometry(1, 1), ROCK, {
        bone: root,
        at,
        scale,
        rotation: [0, rot, 0],
        flat: true,
        group: "stone",
      }),
    );
  const rockSkin = b.surface(rocks);

  // -------------------------------------------------------------------------------------------------------------
  // Body
  const bodyR = (t: number): [number, number] => [
    0.108 + 0.014 * Math.sin(Math.PI * Math.min(1, t * 1.15)),
    0.098 + 0.012 * Math.sin(Math.PI * t),
  ];
  const spineSweep = b.sweep(spine, bodyR, { color: COAT, shift: [0, -0.01], group: "body" });
  const neckSweep = b.sweep(neck, (t) => [0.104 - 0.02 * t, 0.096 - 0.02 * t], { color: COAT, group: "body" });
  for (const s of [1, -1]) {
    b.part(sph(12, 8), COAT, {
      bone: hips,
      at: [s * 0.1, 0.465, -0.17],
      scale: [0.07, 0.085, 0.105],
      group: "body",
    });
    b.part(sph(10, 8), COAT, {
      bone: chest,
      at: [s * 0.095, 0.47, 0.14],
      scale: [0.056, 0.07, 0.078],
      group: "body",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs: shoulders and hips, IK to paws planted on the stone
  const pawSpots: Array<[number, number]> = [];
  const buildPaw = (tip: ReturnType<typeof b.joint>, target: THREE.Vector3, s: number, L: string, tag: string) => {
    const c = V(target.x, target.y - 0.005, target.z + 0.016);
    b.part(sph(12, 8), DARK, { bone: tip, at: c, scale: [0.048, 0.033, 0.064], group: "legs", name: `paw${tag}${L}` });
    for (let k = 0; k < 4; k++) {
      const a = (-0.62 + 0.41 * k) * 0.85;
      const tp = V(c.x + Math.sin(a) * 0.036 + s * 0.002 * (k - 1.5), c.y - 0.006, c.z + 0.046 + Math.cos(a) * 0.012);
      b.part(sph(8, 6), DARK, { bone: tip, at: tp, scale: [0.0155, 0.0135, 0.0185], group: "legs" });
      b.spike(offset(tp, [0, 0, 1], 0.012), V(Math.sin(a) * 0.35, -0.3, 1), 0.026, [0.0058, 0], CLAW, {
        bone: tip,
        sides: 6,
        group: "legs",
      });
    }
    pawSpots.push([target.x, target.z]);
  };
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // front
    const fRoot = V(s * 0.088, 0.47, 0.145);
    const fFoot = V(s * 0.152, ST + 0.035, 0.185);
    const fPts = limb(fRoot, fFoot, [0.115, 0.105], [0, 0, -1]);
    const front = b.chain(`legF${L}`, fPts, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `hand${L}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(front, [0.054, 0.047, 0.04, 0.036], { color: LEG, group: "legs" });
    buildPaw(front.tip!, fFoot, s, L, "F");
    // hind
    const hRoot = V(s * 0.09, 0.47, -0.17);
    const hFoot = V(s * 0.145, ST + 0.035, -0.17);
    const hPts = limb(hRoot, hFoot, [0.1, 0.09, 0.05], [[0, 0, 1], [0, 0, -1]]);
    const hind = b.chain(`legH${L}`, hPts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(hind, [0.062, 0.05, 0.042, 0.038], { color: LEG, group: "legs" });
    buildPaw(hind.tip!, hFoot, s, L, "H");
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail: arched up and back for balance, ringed, with fluffy edge tufts
  const tail = b.chain("tail", tailP, { parent: hips, role: "tail", group: "tail" });
  const tailSweep = b.sweep(tail, [0.05, 0.072, 0.094, 0.103, 0.093, 0.07, 0.034], { color: TAIL, group: "tail" });
  const tailHits = b.surface(tailSweep).scatter(110, { rng: rng(31), minDist: 0.05 });
  b.cards(tailHits, TUFT, {
    size: [0.042, 0.08],
    lean: 62,
    bend: 25,
    vary: 0.3,
    spin: 25,
    rng: rng(32),
    color: TAIL_CARD,
    flow: (f) => tailP.tangentAt(tailP.closestT(f.at)),
    group: "tail",
  });

  // body fluff tufts break the silhouette
  const bodySkin = b.surface([spineSweep, neckSweep]);
  const fluff = bodySkin.scatter(90, {
    rng: rng(41),
    minDist: 0.05,
    filter: (h) => h.at.z < 0.2 && (h.n.y > 0.4 || h.n.y < -0.3),
  });
  b.cards(fluff, TUFT, {
    size: [0.034, 0.06],
    lean: 70,
    bend: 20,
    vary: 0.3,
    spin: 20,
    rng: rng(42),
    color: COAT,
    flow: [0, 0, -1],
    group: "body",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const skull = b.part(sph(18, 12), SKULL, {
    bone: head,
    at: HC,
    scale: [0.118, 0.102, 0.108],
    group: "head",
    name: "skull",
  });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.ray([s * 0.047, HC.y + 0.012, HC.z + 1], [0, 0, -1])!;
    b.decal(skin, EYE, {
      at: hit,
      dir: [s * 0.32, 0.05, 1],
      size: [0.054, 0.074],
      mirror: s > 0,
      lift: 0.0025,
      group: "head",
      name: `eye${s > 0 ? "L" : "R"}`,
    });
  }
  // muzzle: separate upper and lower jaw
  const snoutC = head.local({ forward: 0.148, down: 0.032 });
  const snout = b.part(sph(12, 8), CREAM, {
    bone: head,
    at: snoutC,
    scale: [0.052, 0.042, 0.058],
    group: "head",
    name: "snout",
  });
  const noseP = V(snoutC.x, snoutC.y + 0.013, snoutC.z + 0.053);
  b.part(sph(10, 7), NOSE, { bone: head, at: noseP, scale: [0.023, 0.016, 0.017], group: "head", name: "nose" });
  b.part(sph(6, 4), "#ffffff", {
    bone: head,
    at: V(noseP.x - 0.006, noseP.y + 0.01, noseP.z + 0.008),
    scale: [0.006, 0.003, 0.004],
    group: "head",
  });
  b.part(sph(10, 6), MOUTH, {
    bone: head,
    at: head.local({ forward: 0.15, down: 0.062 }),
    scale: [0.034, 0.012, 0.046],
    group: "head",
    name: "mouth",
  });
  b.part(sph(10, 6), CREAM, {
    bone: jaw,
    at: head.local({ forward: 0.15, down: 0.078 }),
    scale: [0.037, 0.018, 0.05],
    group: "head",
    name: "lowerJaw",
  });
  b.part(sph(8, 5), "#e0707a", {
    bone: jaw,
    at: head.local({ forward: 0.156, down: 0.068 }),
    scale: [0.02, 0.006, 0.03],
    group: "head",
    name: "tongue",
  });
  const snoutSkin = b.surface(snout);
  for (const s of [1, -1]) {
    const line = snoutSkin.drape(
      catmull([
        [0, snoutC.y - 0.004, snoutC.z + 0.056],
        [s * 0.018, snoutC.y - 0.026, snoutC.z + 0.046],
        [s * 0.036, snoutC.y - 0.034, snoutC.z + 0.016],
        [s * 0.046, snoutC.y - 0.028, snoutC.z - 0.012],
      ]),
      { lift: 0.0008 },
    );
    b.sweep(line, 0.0022, NOSE, { bone: head, sides: 4, group: "head" });
    // whiskers
    for (let k = 0; k < 3; k++) {
      const a = V(s * 0.034, snoutC.y + 0.006 - k * 0.011, snoutC.z + 0.022);
      const e = a.clone().add(V(s * 0.11, (k - 1) * 0.022 + 0.006, -0.03 - k * 0.015));
      b.rod(a, e, [0.0028, 0.0008], WHISKER, { bone: head, sides: 4, group: "head" });
    }
  }
  // ears with cream fluff
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const base = head.local({ left: s * 0.07, up: 0.068, forward: 0.045 });
    const axis = V(s * 0.5, 1, -0.15).normalize();
    const ear = b.joint(`ear${L}`, { parent: head, at: base, dir: axis, role: "hinge", group: "head" });
    const ec = offset(base, axis, 0.047);
    b.part(sph(12, 8), RUST, {
      bone: ear,
      at: ec,
      scale: [0.054, 0.068, 0.023],
      dir: axis,
      up: [0, 0, 1],
      group: "head",
      name: `ear${L}`,
    });
    b.part(sph(10, 8), CREAM, {
      bone: ear,
      at: offset(ec, [0, 0, 1], 0.012),
      scale: [0.037, 0.05, 0.012],
      dir: axis,
      up: [0, 0, 1],
      group: "head",
    });
    for (let k = -1; k <= 1; k++) {
      const p0 = offset(offset(base, axis, 0.012), [s, 0, 0], -k * 0.016).add(V(0, 0, 0.016));
      b.spike(p0, V(-k * s * 0.25 + s * 0.12, 1, 0.55), 0.052, 0.012, CREAM, { bone: ear, sides: 6, group: "head" });
    }
    // cheek ruff
    const ruff: OutlinePoint[] = [
      [0, 0.035],
      [0.03, 0.05],
      [0.028, 0.028],
      [0.065, 0.03, "sharp"],
      [0.038, 0.008],
      [0.075, -0.012, "sharp"],
      [0.036, -0.02],
      [0.055, -0.052, "sharp"],
      [0.012, -0.04],
      [0, -0.03],
    ];
    b.extrude(ruff, {
      at: head.local({ left: s * 0.088, down: 0.03, forward: 0.07 }),
      x: [s, 0, -0.2],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.012,
      color: CREAM,
      bone: head,
      group: "head",
      name: `cheek${L}`,
    });
  }
  // forehead tuft
  const crown = HC.clone().add(V(0, 0.092, 0.012));
  const tuftDirs: Array<[number, number, number]> = [
    [-0.03, 0.05, 0.05],
    [0, 0.065, 0.07],
    [0.03, 0.05, 0.05],
  ];
  tuftDirs.forEach(([dx, dy, dz], i) => {
    const p0 = crown.clone().add(V(dx * 0.3, 0, 0));
    b.sweep(bezier(p0, p0.clone().add(V(dx * 0.6, dy * 0.8, dz * 0.2)), p0.clone().add(V(dx * 1.6, dy, dz))), [0.02, 0], {
      color: i === 1 ? RUST_PALE : RUST,
      caps: { start: "flat", end: "point" },
      sides: 6,
      bone: head,
      group: "head",
    });
  });

  // -------------------------------------------------------------------------------------------------------------
  // Scarf with ribbons and a glowing charm
  const neckSkin = b.surface(neckSweep);
  const collarLoop = neckSkin.loop(neck.at(0.1), { lift: 0.014 });
  b.sweep(collarLoop, 0.025, { color: TEAL, group: "scarf" });
  for (const t of [0.03, 0.18]) {
    b.sweep(neckSkin.loop(neck.at(t), { lift: 0.022 }), 0.0065, { color: GOLD, group: "scarf" });
  }
  const nape = collarLoop.at(0);
  const front = collarLoop.at(collarLoop.closestT([0, 0.5, 0.3]));
  b.part(sph(10, 8), TEAL_DEEP, { bone: neck.joints[0], at: front, scale: [0.032, 0.03, 0.032], group: "scarf", name: "knot" });
  for (const s of [1, -1]) {
    const r0 = nape.clone().add(V(s * 0.03, 0.005, -0.012));
    const mk = (dy: number) =>
      bezier(
        r0.clone().add(V(0, dy, 0)),
        r0.clone().add(V(s * 0.04, 0.045 + dy, -0.12)),
        r0.clone().add(V(s * 0.1, 0.02 + dy, -0.26)),
        r0.clone().add(V(s * 0.17, 0.07 + dy * 1.5, -0.36)),
      );
    b.membrane(mk(-0.017), mk(0.017), {
      color: paint((_p, _n, st) => (st[0] > 0.86 || Math.abs(st[1] - 0.5) < 0.05 ? GOLD : TEAL)),
      thickness: 0.006,
      rows: 2,
      scallop: 0.2,
      bone: neck.joints[0],
      group: "scarf",
    });
  }
  // charm
  const charmAt = V(0, front.y - 0.052, front.z + 0.022);
  const charmDir = V(0, -0.25, 1).normalize();
  b.rod(front, charmAt, 0.0025, GOLD, { bone: chest, sides: 4, group: "scarf" });
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.034, 0.004],
      [0.034, 0.01],
      [0.028, 0.014],
      [0, 0.014],
    ],
    { at: charmAt, axis: charmDir, segments: 10, color: GOLD, bone: chest, group: "scarf", name: "charm" },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.024, 12), "#ffffff", {
      bone: chest,
      at: offset(charmAt, charmDir, 0.0162),
      dir: charmDir,
      axis: "z",
      texture: CHARM,
      group: "scarf",
      name: "charmGem",
    }),
    1.2,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Stone dressing: moss tufts, hanging moss, flowers, mushrooms, glowing runes
  const keepClear = (p: THREE.Vector3, r: number) => pawSpots.every(([x, z]) => Math.hypot(p.x - x, p.z - z) > r);
  const mossHits = rockSkin.scatter(170, {
    rng: rng(51),
    minDist: 0.038,
    filter: (h) => h.n.y > 0.4 && keepClear(h.at, 0.07),
  });
  b.cards(mossHits, MOSS_TUFT, {
    size: [0.065, 0.055],
    lean: 12,
    cross: true,
    vary: 0.35,
    spin: 180,
    rng: rng(52),
    bone: root,
    group: "stone",
  });
  const rim = rockSkin.loop([0, 0.255, 0], { lift: 0.03 });
  const vines: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 14; i++) {
    const p = rim.at((i + rand() * 0.6) / 14);
    vines.push(frame(p, [0, 1, 0]));
  }
  b.cards(vines, VINE, {
    size: [0.05, 0.12],
    lean: 180,
    flow: [0, 0, 1],
    vary: 0.3,
    rng: rng(53),
    bone: root,
    group: "stone",
  });
  const flowerHits = rockSkin.scatter(10, {
    rng: rng(54),
    minDist: 0.1,
    filter: (h) => h.n.y > 0.7 && h.at.y > 0.2 && keepClear(h.at, 0.085),
  });
  b.cards(flowerHits, FLOWER, {
    size: [0.04, 0.055],
    lean: 0,
    cross: true,
    vary: 0.25,
    spin: 180,
    rng: rng(55),
    bone: root,
    group: "stone",
  });
  // glowing mushrooms at the foot of the rock
  for (const [x, z, h] of [
    [0.4, 0.34, 0.06],
    [0.34, 0.42, 0.042],
    [-0.38, 0.36, 0.05],
  ] as const) {
    const hit = rockSkin.ray([x, 1, z], [0, -1, 0]);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.008, 0.012, h, 6), CLAW, hit, { bone: root, group: "stone" });
    const top = offset(hit.at, hit.n, h * 0.95);
    glow(
      b.lathe(
        [
          [0, 0],
          [0.034, 0],
          [0.036, 0.008],
          [0.028, 0.02],
          [0.014, 0.027],
          [0, 0.029],
        ],
        { at: top, axis: hit.n, segments: 8, color: "#6cf2e2", bone: root, group: "stone" },
      ),
      1.1,
    );
  }
  // runes carved into the stone
  const runeFront = rockSkin.ray([0, 0.13, 2], [0, 0, -1]);
  if (runeFront)
    glow(
      b.decal(rockSkin, RUNE, {
        at: runeFront,
        dir: [0, 0.1, 1],
        size: [0.2, 0.2],
        lift: 0.004,
        bone: root,
        group: "stone",
        name: "runeFront",
      }),
      1.2,
    );
  const runeSide = rockSkin.ray([2, 0.15, 0.02], [-1, 0, 0]);
  if (runeSide)
    glow(
      b.decal(rockSkin, RUNE, {
        at: runeSide,
        dir: [1, 0.1, 0],
        size: [0.15, 0.15],
        lift: 0.004,
        roll: 20,
        bone: root,
        group: "stone",
        name: "runeSide",
      }),
      1.2,
    );

  void INK;
  return b.root;
}
