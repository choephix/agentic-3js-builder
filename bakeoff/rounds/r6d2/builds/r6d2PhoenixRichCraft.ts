import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  bezier,
  catmull,
  createBuilder,
  DEG,
  frame,
  lerp,
  limb,
  mix,
  noise,
  paint,
  rng,
  scales,
  svg,
} from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { cel, furEdge, shadowOf, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pyro Phoenix",
  description:
    "A cel-shaded flame phoenix with wings spread, glowing ribbon plumage, gilded trim and a Pyro emblem, perched on a rune-lit dais ringed by four brazier pillars.",
};

// ------------------------------------------------------------------ palette
const GOLD_L = "#ffe58a";
const GOLD = "#ffc02e";
const AMBER = "#ff8a24";
const ORANGE = "#ff6a1f";
const RED = "#e0301e";
const CRIMSON = "#a8142a";
const WINE = "#6e1f2c";
const CREAM = "#fff4cf";

type Col = string | readonly [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const lit = (n: THREE.Vector3) => n.x * 0.35 + n.y * 0.8 + n.z * 0.5 > 0.1;

// ------------------------------------------------------------------ textures
const EYE = svg(
  `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="c"><path d="M4 38 C14 14 40 6 60 14 C68 17 74 20 78 12 C78 28 68 44 44 50 C24 52 10 46 4 38Z"/></clipPath>
    <radialGradient id="i" cx="0.45" cy="0.7" r="0.75"><stop offset="0" stop-color="#fff6b0"/><stop offset="0.5" stop-color="#ffb62e"/><stop offset="1" stop-color="#e5481a"/></radialGradient>
  </defs>
  <path d="M4 38 C14 14 40 6 60 14 C68 17 74 20 78 12 C78 28 68 44 44 50 C24 52 10 46 4 38Z" fill="#3a0f1e"/>
  <g clip-path="url(#c)">
    <ellipse cx="38" cy="31" rx="19" ry="21" fill="url(#i)"/>
    <ellipse cx="38" cy="12" rx="28" ry="10" fill="#c8301c" opacity="0.6"/>
  </g>
  <ellipse cx="38" cy="31" rx="6.5" ry="13" fill="#2a0a14"/>
  <circle cx="30" cy="23" r="5.5" fill="#ffffff"/>
  <circle cx="46" cy="40" r="2.6" fill="#ffffff"/>
  <path d="M4 38 C14 14 40 6 60 14 C68 17 74 20 78 12" fill="none" stroke="#ff5a1f" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#4a0e22" stroke="#ffc02e" stroke-width="5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#ff8a24" stroke-width="2.5" stroke-dasharray="3 5"/>
  <path d="M50 14 C52 30 72 40 68 62 C66 76 58 84 50 86 C42 84 34 76 32 62 C30 50 40 46 42 34 C46 38 48 30 50 14Z" fill="#ff7a1f" stroke="#ffe58a" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M50 44 C54 56 62 62 60 72 C58 80 54 82 50 82 C46 82 42 80 40 72 C38 64 46 58 50 44Z" fill="#ffd24a"/>
</svg>`,
  { size: 256 },
);

const FLAME_DEFS = `<defs><linearGradient id="o" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffb52e"/><stop offset="0.55" stop-color="#ff6a1f"/><stop offset="1" stop-color="#d8261f"/></linearGradient></defs>`;
const FLAME = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">${FLAME_DEFS}
  <path d="M32 2 C36 28 58 44 56 78 C55 106 44 124 32 126 C20 124 9 106 8 78 C7 58 20 50 22 34 C26 40 28 32 32 2Z" fill="url(#o)"/>
  <path d="M32 40 C36 62 48 74 46 96 C45 112 38 122 32 122 C26 122 19 112 18 96 C17 80 28 72 32 40Z" fill="#ffc83d"/>
  <path d="M32 76 C36 90 40 98 38 110 C37 118 34 122 32 122 C30 122 27 118 26 110 C24 98 29 90 32 76Z" fill="#fff4c0"/>
</svg>`,
  { size: 256 },
);
const FLAME2 = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">${FLAME_DEFS}
  <path d="M34 2 C36 24 20 40 32 62 C46 84 58 100 50 114 C46 122 38 126 30 126 C18 126 8 114 10 96 C12 78 26 70 24 52 C22 38 32 28 34 2Z" fill="url(#o)"/>
  <path d="M30 56 C36 74 46 86 42 102 C40 114 34 122 30 122 C22 122 16 112 18 98 C20 84 30 76 30 56Z" fill="#ffc83d"/>
  <path d="M30 88 C34 98 36 104 34 112 C33 118 31 122 30 122 C28 122 26 118 25 112 C24 104 28 98 30 88Z" fill="#fff4c0"/>
</svg>`,
  { size: 256 },
);

const FLUFF = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffe58a"/><stop offset="0.6" stop-color="#ffb52e"/><stop offset="1" stop-color="#ff7a1f"/></linearGradient></defs>
  <path d="M20 63 C8 52 4 34 12 20 C15 12 18 6 20 1 C22 6 25 12 28 20 C36 34 32 52 20 63Z" fill="url(#g)" stroke="#e0701c" stroke-width="1.5"/>
  <path d="M20 60 L20 12" stroke="#fff0a8" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);
const FLUFF_R = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9a2e"/><stop offset="0.6" stop-color="#ee4a1e"/><stop offset="1" stop-color="#b3182c"/></linearGradient></defs>
  <path d="M20 63 C8 52 4 34 12 20 C15 12 18 6 20 1 C22 6 25 12 28 20 C36 34 32 52 20 63Z" fill="url(#g)" stroke="#7a1030" stroke-width="1.5"/>
  <path d="M20 60 L20 12" stroke="#ffc060" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const RUNE_MARKS = Array.from(
  { length: 12 },
  (_, i) =>
    `<g transform="rotate(${i * 30} 100 100)"><path d="M100 14 L106 24 L100 34 L94 24Z" fill="#ffc02e"/><path d="M100 42 L100 54" stroke="#ff8a24" stroke-width="3.5" stroke-linecap="round"/></g>`,
).join("");
const RUNES = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="96" fill="none" stroke="#ffb13a" stroke-width="4"/>
  <circle cx="100" cy="100" r="62" fill="none" stroke="#ff8a24" stroke-width="3"/>
  ${RUNE_MARKS}
  <path d="M100 46 L146 126 L54 126Z" fill="none" stroke="#ffb13a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M100 154 L54 74 L146 74Z" fill="none" stroke="#ffb13a" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="100" cy="100" r="15" fill="#ff6a1f"/>
  <circle cx="100" cy="100" r="7" fill="#ffe58a"/>
</svg>`,
  { size: 512 },
);

// ------------------------------------------------------------------ paints
const BODY = cel(furEdge(RED, "#ffd25a", { level: -0.05, teeth: 0.32, period: 0.05, along: [0, 0, 1] }));
const ARM = cel(furEdge(RED, AMBER, { level: -0.2, teeth: 0.3, period: 0.04, along: [1, 0, 0] }));
const LEG = cel(scales([GOLD, "#f0a420"], "#8a5412", { size: 0.03, width: 0.18 }));
const BEAK = cel("#ffd04a", "#e08a1c");
const GOLDM = cel("#ffc93a", "#d98a14");
const TALON = cel("#4a2318", "#2a1210");

const R_MAIN = [GOLD_L, "#ffb52e", ORANGE, "#d8261f"];
const R_HOT = ["#fff0a8", "#ffd24a", "#ff8a24", "#e8401f"];
const R_DEEP = ["#ff8a24", "#e8401f", "#c01e2a", "#8c1030"];
const ramp = (kind: number, t: number): string => {
  const r = kind === 1 ? R_HOT : kind === 2 ? R_DEEP : R_MAIN;
  return t < 0.16 ? r[0] : t < 0.42 ? r[1] : t < 0.7 ? r[2] : r[3];
};

const featherCache = new Map<string, Paint>();
function featherPaint(L: number, kind: number): Paint {
  const key = `${kind}:${Math.round(L * 20)}`;
  let p = featherCache.get(key);
  if (!p) {
    p = paint((_p, n, s) => {
      const t = clamp01(s[0] / L + 0.05 * zigzag(s[1] / 0.04));
      let c: Col = ramp(kind, t);
      if (Math.abs(s[1]) < 0.004 && s[0] > 0.04 && s[0] < L * 0.9) c = mix(c, CREAM, 0.45);
      return lit(n) ? c : shadowOf(c);
    });
    featherCache.set(key, p);
  }
  return p;
}

const ribbonCache = new Map<number, Paint>();
function ribbonPaint(kind: number): Paint {
  let p = ribbonCache.get(kind);
  if (!p) {
    p = paint((q, n, s) => {
      const t = clamp01(s[0] + 0.045 * zigzag((q.x + q.z) / 0.06));
      const c = ramp(kind, t);
      return lit(n) ? c : shadowOf(c);
    });
    ribbonCache.set(kind, p);
  }
  return p;
}

const STONE = paint((p, n, s) => {
  const h = s[0];
  const ang = (Math.atan2(p.x, p.z) / (Math.PI * 2)) * 12;
  let c: Col = mix("#cdb592", "#efe2c4", noise(p, 0.3, 3));
  if (Math.abs(h - 0.078) < 0.017 || Math.abs(h - 0.205) < 0.01) c = GOLD;
  else if (h > 0.105 && h < 0.165) {
    const k = zigzag(ang * 2);
    c = Math.abs(h - 0.135) < 0.028 * k ? GOLD : WINE;
  }
  return lit(n) ? c : shadowOf(c);
});

const PILLAR = paint((p, n, s) => {
  const h = s[0];
  let c: Col = mix("#8d7a8e", "#c4b3b8", noise(p, 0.2, 5));
  if ((h > 0.05 && h < 0.09) || (h > 0.5 && h < 0.56) || h > 0.66) c = GOLD;
  else if (h > 0.2 && h < 0.4 && Math.abs(Math.atan2(p.x, p.z) * 2.5 - Math.round(Math.atan2(p.x, p.z) * 2.5)) < 0.12) c = WINE;
  return lit(n) ? c : shadowOf(c);
});

// ------------------------------------------------------------------ shapes
type Outline = Array<[number, number] | [number, number, "sharp"]>;
function leaf(L: number, W: number): Outline {
  return [
    [0, -0.12 * W],
    [0.2 * L, -0.7 * W],
    [0.5 * L, -W],
    [0.78 * L, -0.7 * W],
    [L, 0, "sharp"],
    [0.8 * L, 0.62 * W],
    [0.5 * L, 0.95 * W],
    [0.2 * L, 0.65 * W],
    [0, 0.12 * W],
  ];
}

const DAIS: Outline = [
  [0, 0],
  [1.28, 0],
  [1.28, 0.06],
  [1.2, 0.1],
  [1.2, 0.17],
  [1.1, 0.2],
  [1.05, 0.22],
  [0, 0.22],
];
const PILLAR_PROFILE: Outline = [
  [0, 0],
  [0.17, 0],
  [0.17, 0.05],
  [0.11, 0.09],
  [0.1, 0.5],
  [0.15, 0.58],
  [0.2, 0.7],
  [0.17, 0.7],
  [0.12, 0.62],
  [0, 0.6],
];

// ------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "phoenix" });
  type Bone = ReturnType<typeof b.joint>;
  const R = rng(7);

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.86, -0.4], dir: [0, 0.3, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.4],
      [0, 0.92, -0.15],
      [0, 1.04, 0.1],
      [0, 1.18, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.18, 0.3],
      [0, 1.4, 0.42],
      [0, 1.6, 0.5],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.6, 0.5], dir: [0, 0.15, 1], role: "head" });
  const H = (f: number, u: number, l: number) => V(l, 1.6 + u, 0.5 + f);
  const jaw = b.joint("jaw", { parent: head, at: H(0.04, -0.05, 0), aim: H(0.3, -0.07, 0), role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.86, -0.4],
      [0, 0.86, -0.65],
      [0, 0.84, -0.92],
      [0, 0.8, -1.2],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const stage = b.joint("stage", { parent: hips, at: [0, 0.11, 0], dir: [0, 1, 0] });

  // ---------------- body, neck, tail stump
  const body = b.sweep(spine, [0.16, 0.28, 0.35, 0.38, 0.32, 0.23], { color: BODY, sides: 10 });
  const neckTube = b.sweep(neck, [0.19, 0.14, 0.115], { color: BODY, sides: 8 });
  b.sweep(tail, [0.13, 0.09, 0.05, 0.02], { color: BODY, sides: 8, caps: "point" });

  // golden collar with a pyro gem
  const collar = b.ring(neck.at(0.35), { count: 12, radius: 0.18 });
  b.sweep(catmull(collar.items, { closed: true }), 0.022, { color: GOLDM, bone: neck.joints[0] });
  const gem = b.stick(new THREE.IcosahedronGeometry(0.04, 0), "#ff5a2a", collar.items[0], { embed: 0.2 });
  glow(gem, 1.3);

  // chest emblem
  const chest = b.surface(body).nearest(V(0, 1.0, 0.6));
  glow(b.decal(body, EMBLEM, { at: chest, size: [0.22, 0.22] }), 0.7);

  // fluffy flame feathers over body and neck
  const skin = b.surface(body);
  const chestHits = skin.scatter(70, {
    rng: R,
    minDist: 0.06,
    filter: (h) => h.n.z > 0.2 && h.n.y < 0.7 && h.at.distanceTo(chest.at) > 0.24,
  });
  b.cards(chestHits, [FLUFF, FLUFF, FLUFF_R], {
    size: [0.1, 0.17],
    lean: 50,
    flow: [0, -1, -0.15],
    bend: 20,
    vary: 0.25,
    spin: 10,
    rng: R,
  });
  const backHits = skin.scatter(70, { rng: R, minDist: 0.07, filter: (h) => h.n.z < 0.3 && h.n.y > -0.4 });
  b.cards(backHits, [FLUFF_R, FLUFF_R, FLUFF], {
    size: [0.11, 0.2],
    lean: 65,
    flow: [0, -0.2, -1],
    bend: 20,
    vary: 0.25,
    rng: R,
  });
  const neckHits = b.surface(neckTube).scatter(34, { rng: R, minDist: 0.06, filter: (h) => h.n.z > -0.2 });
  b.cards(neckHits, [FLUFF, FLUFF_R], { size: [0.08, 0.14], lean: 55, flow: [0, -1, -0.2], bend: 15, vary: 0.2, rng: R });

  // ---------------- feather helpers
  const feather = (
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    L: number,
    W: number,
    kind: number,
    bone: Bone,
    core: boolean,
  ) => {
    const x = dir.clone().normalize();
    const nrm = UP.clone().addScaledVector(x, -UP.dot(x)).normalize();
    const y = new THREE.Vector3().crossVectors(nrm, x).normalize();
    b.extrude(leaf(L, W), {
      at: origin,
      x,
      y,
      thickness: 0.011,
      smoothing: 1,
      color: featherPaint(L, kind),
      bone,
    });
    if (core) {
      glow(
        b.extrude(leaf(L * 0.58, W * 0.24), {
          at: origin.clone().addScaledVector(x, L * 0.2),
          x,
          y,
          thickness: 0.016,
          color: "#ffd45a",
          bone,
        }),
        1.1,
      );
    }
  };

  const ribbon = (
    p0: THREE.Vector3,
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3,
    w: number,
    bone: Bone,
    kind = 0,
    thick = 0.011,
  ) => {
    const path = bezier(p0, p1, p2, p3);
    const wid = (t: number) =>
      Math.max(
        w * (0.34 + 0.66 * Math.sin(Math.PI * Math.min(0.06 + 0.86 * t, 1))) * (1 - Math.pow(t, 4)) * (1 + 0.1 * Math.sin(t * 16)),
        0.002,
      );
    b.sweep(path, (t) => [wid(t), thick], { section: "box", color: ribbonPaint(kind), bone, caps: "flat" });
    glow(
      b.sweep(path, (t) => [Math.max(wid(t) * 0.26, 0.0015), thick * 1.4], {
        section: "box",
        color: kind === 1 ? "#fff2b0" : "#ffd45a",
        bone,
        from: 0.1,
        to: 0.8,
        caps: "flat",
      }),
      1,
    );
    return path;
  };

  // ---------------- wings
  const flameTips: Record<string, ReturnType<typeof frame>[]> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.2, 1.12, 0.12);
    const el = V(s * 0.8, 1.27, -0.02);
    const wr = V(s * 1.38, 1.42, -0.1);
    const hd = V(s * 1.86, 1.55, -0.04);
    const armPath = catmull([sh, el, wr, hd]);
    const wing = b.chain(`wing${S}`, armPath, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.085, 0.065, 0.045, 0.03], { color: ARM, sides: 8 });

    const add = (o: THREE.Vector3, aDeg: number, rise: number, L: number, W: number, kind: number, lift: number, core: boolean) => {
      const d = V(s * Math.cos(aDeg * DEG), rise, -Math.sin(aDeg * DEG)).normalize();
      const origin = o.clone().add(V(0, lift, -0.03));
      feather(origin, d, L, W, kind, wing.jointAt(armPath.closestT(o)), core);
      return origin.clone().addScaledVector(d, L);
    };

    const tips: ReturnType<typeof frame>[] = [];
    // tertials (shoulder to elbow)
    for (let i = 0; i < 5; i++) {
      const u = i / 4;
      add(lerp(sh, el, (i + 0.5) / 5), 108 - 14 * u, -0.03, 0.62 + 0.1 * u, 0.085, 2, -0.004 * i, false);
    }
    // secondaries (elbow to wrist)
    for (let i = 0; i < 8; i++) {
      const u = i / 7;
      add(lerp(el, wr, (i + 0.5) / 8), 88 - 20 * u, -0.01, 0.74 + 0.14 * u, 0.11, 0, 0.002 + 0.003 * i, true);
    }
    // primaries (wrist to hand)
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const L = 0.82 + 0.3 * Math.sin(Math.PI * (0.15 + 0.7 * u));
      const tip = add(lerp(wr, hd, 0.12 + 0.88 * u), 62 - 54 * u, 0.04 + 0.1 * u, L, 0.092, 0, 0.012 + 0.003 * i, true);
      if (i >= 3) tips.push(frame(tip, [0, 1, 0]));
    }
    // coverts, three overlapping rows along the arm
    for (let i = 0; i < 12; i++) {
      const t = 0.04 + (0.92 * i) / 11;
      add(armPath.at(t), 100 - 85 * t, 0.02, 0.42 - 0.12 * t, 0.07, 1, 0.026, false);
    }
    for (let i = 0; i < 11; i++) {
      const t = 0.06 + (0.88 * i) / 10;
      add(armPath.at(t), 98 - 82 * t, 0.03, 0.28 - 0.08 * t, 0.06, 0, 0.04, false);
    }
    for (let i = 0; i < 9; i++) {
      const t = 0.1 + (0.8 * i) / 8;
      add(armPath.at(t).add(V(0, 0.03, 0.03)), 96 - 80 * t, 0.04, 0.18 - 0.04 * t, 0.05, 1, 0.052, false);
    }

    // wing claw, cuffs and leading-edge flames
    const wristJ = wing.joints[2];
    b.spike(wr, V(s * 0.25, 0.25, 1), 0.2, 0.03, { color: GOLDM, bone: wristJ });
    for (const t of [0.34, 0.68]) {
      b.part(new THREE.TorusGeometry(0.075 - 0.02 * t, 0.017, 5, 10), GOLDM, {
        at: armPath.at(t),
        dir: armPath.tangentAt(t),
        axis: "z",
        bone: wing.jointAt(t),
        flat: true,
      });
    }
    for (let t = 0.3; t < 0.96; t += 0.13) tips.push(frame(armPath.at(t).add(V(0, 0.08, 0.02)), [0, 1, 0]));
    flameTips[S] = tips;
    glow(
      b.cards(tips, [FLAME, FLAME2], {
        size: [0.15, 0.3],
        vary: 0.25,
        bend: 12,
        cross: true,
        rng: R,
        bone: wristJ,
      }),
      1,
    );
  }

  // ---------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = V(s * 0.17, 0.78, -0.05);
    const pts = limb(hip, V(s * 0.17, 0.245, 0.13), [0.2, 0.25, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.075, 0.055, 0.036, 0.03], { color: LEG, sides: 6 });
    b.part(new THREE.SphereGeometry(1, 10, 8), BODY, {
      bone: leg.joints[0],
      at: hip.clone().add(V(0, 0.0, 0)),
      scale: [0.11, 0.15, 0.14],
      flat: true,
    });
    const cp = leg.at(0.72);
    b.part(new THREE.TorusGeometry(0.044, 0.012, 5, 10), GOLDM, {
      at: cp.at,
      dir: cp.tangent,
      axis: "z",
      bone: leg.joints[2],
      flat: true,
    });
    const foot = pts[3];
    const fj = leg.tip ?? leg.joints[3];
    for (const a of [-26, 0, 26]) {
      const d = V(Math.sin(a * DEG), -0.02, Math.cos(a * DEG));
      b.spike(foot, d, 0.17, 0.024, { color: LEG, bone: fj });
      b.spike(foot.clone().addScaledVector(d, 0.16), V(d.x, -0.6, d.z), 0.07, 0.014, { color: TALON, bone: fj });
    }
    b.spike(foot, V(0, -0.02, -1), 0.1, 0.022, { color: LEG, bone: fj });
    b.spike(foot.clone().add(V(0, 0, -0.09)), V(0, -0.6, -1), 0.06, 0.013, { color: TALON, bone: fj });
  }

  // ---------------- head
  const skullC = H(0.07, 0.04, 0);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), BODY, {
    bone: head,
    at: skullC,
    scale: [0.15, 0.14, 0.17],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
    bone: jaw,
    at: H(0.1, -0.055, 0),
    scale: [0.07, 0.035, 0.1],
    flat: true,
  });
  b.sweep(bezier(H(0.15, 0.015, 0), H(0.3, 0.035, 0), H(0.38, 0, 0), H(0.43, -0.07, 0)), (t) => [0.054 * (1 - t) + 0.004, 0.047 * (1 - t) + 0.004], {
    color: BEAK,
    bone: head,
    caps: "point",
    sides: 6,
  });
  b.sweep(bezier(H(0.15, -0.045, 0), H(0.25, -0.05, 0), H(0.33, -0.05, 0)), [0.04, 0.004], {
    color: BEAK,
    bone: jaw,
    caps: "point",
    sides: 6,
  });
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around(skullC).at(s * 70, 6);
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.19, 0.14], mirror: s < 0 }), 0.8);
    b.rod(H(0.05, 0.105, s * 0.06), H(0.17, 0.085, s * 0.11), 0.014, { color: "#8c1030", bone: head });
    // swept ear plumes
    ribbon(H(-0.02, 0.04, s * 0.1), H(-0.15, 0.1, s * 0.18), H(-0.4, 0.02, s * 0.3), H(-0.75, -0.1, s * 0.4), 0.04, head, 1);
  }
  // crest of five flowing plumes
  for (let k = -2; k <= 2; k++) {
    const a = Math.abs(k);
    const lat = k * 0.03;
    ribbon(
      V(lat, 1.7, 0.5),
      V(lat * 2, 1.99 - 0.03 * a, 0.42),
      V(lat * 4, 2.02 - 0.08 * a, 0.1 - 0.05 * a),
      V(lat * 6, 1.74 - 0.12 * a, -0.35 - 0.12 * (2 - a)),
      0.04,
      head,
      a === 0 ? 1 : 0,
    );
  }
  // gilded circlet spikes and brow gem
  for (const lat of [-0.045, 0, 0.045]) {
    b.spike(H(0.1, 0.1, lat), V(lat * 3, 1, 0.25), 0.1, 0.02, { color: GOLDM, bone: head });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.03, 0), "#ff4a2a", { bone: head, at: H(0.16, 0.085, 0), flat: true }), 1.3);

  // ---------------- tail plumage
  const tailJ = tail.joints[0];
  const tailTips: ReturnType<typeof frame>[] = [];
  for (let k = -4; k <= 4; k++) {
    const a = Math.abs(k);
    const th = k * 8.5 * DEG;
    const ell = 1.55 - a * 0.1 + (a === 0 ? 0.15 : 0);
    const dir = V(Math.sin(th), 0, -Math.cos(th));
    const P0 = V(k * 0.012, 0.9 + 0.012 * (4 - a), -0.45);
    const P1 = P0.clone().addScaledVector(dir, ell * 0.3).add(V(0, 0.08, 0));
    const P2 = P0.clone().addScaledVector(dir, ell * 0.65).add(V(0, -0.1 - 0.015 * a, 0));
    const P3 = P0.clone().addScaledVector(dir, ell * 0.98).add(V(0, 0.12 - 0.015 * a, 0));
    const path = ribbon(P0, P1, P2, P3, 0.17 - 0.012 * a, tailJ, a % 2 === 0 ? 0 : 1);
    tailTips.push(frame(path.at(1), [0, 1, 0]));
  }
  for (const s of [1, -1]) {
    const th = s * 12.5 * DEG;
    const dir = V(Math.sin(th), 0, -Math.cos(th));
    const P0 = V(s * 0.02, 1.0, -0.45);
    const path = ribbon(
      P0,
      P0.clone().addScaledVector(dir, 0.7).add(V(0, 0.2, 0)),
      P0.clone().addScaledVector(dir, 1.4).add(V(s * 0.25, -0.05, 0)),
      P0.clone().addScaledVector(dir, 2.1).add(V(s * 0.5, 0.3, 0)),
      0.055,
      tailJ,
      1,
      0.01,
    );
    tailTips.push(frame(path.at(1), [0, 1, 0]));
  }
  glow(
    b.cards(tailTips, [FLAME, FLAME2], { size: [0.17, 0.32], vary: 0.2, bend: 12, cross: true, rng: R, bone: tailJ }),
    1,
  );

  // ---------------- stage: dais, runes, brazier pillars, embers
  b.lathe(DAIS, { at: [0, 0, 0], axis: [0, 1, 0], segments: 12, color: STONE, bone: stage });
  glow(
    b.part(new THREE.PlaneGeometry(1.9, 1.9), "#ffffff", {
      bone: stage,
      at: [0, 0.228, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: RUNES,
    }),
    0.9,
  );
  const braziers: ReturnType<typeof frame>[] = [];
  for (const a of [50, 130, 230, 310]) {
    const x = Math.sin(a * DEG) * 1.48;
    const z = Math.cos(a * DEG) * 1.48;
    b.lathe(PILLAR_PROFILE, { at: [x, 0, z], axis: [0, 1, 0], segments: 8, color: PILLAR, bone: stage });
    glow(b.part(new THREE.IcosahedronGeometry(0.1, 0), "#ff9a2e", { bone: stage, at: [x, 0.7, z], flat: true }), 1.2);
    braziers.push(frame([x, 0.72, z], [0, 1, 0]));
  }
  glow(
    b.cards(braziers, [FLAME, FLAME2], { size: [0.26, 0.5], vary: 0.2, bend: 10, cross: true, rng: R, bone: stage }),
    1,
  );

  // drifting embers
  const emberA: THREE.BufferGeometry[] = [];
  const emberB: THREE.BufferGeometry[] = [];
  let tries = 0;
  while (emberA.length + emberB.length < 46 && tries++ < 600) {
    const ang = R() * Math.PI * 2;
    const rad = 0.9 + R() * 1.7;
    const x = Math.sin(ang) * rad;
    const z = Math.cos(ang) * rad - 0.3;
    const y = 0.5 + R() * 2.2;
    const inWing = y > 1.0 && y < 1.95 && Math.abs(x) < 2.4 && z > -1.0 && z < 0.25;
    const inTail = z < -0.4 && y > 0.5 && y < 1.25 && Math.abs(x) < 1.3;
    const inBody = Math.abs(x) < 0.5 && z > -0.7 && z < 0.9 && y < 2.1;
    if (inWing || inTail || inBody) continue;
    const g = new THREE.OctahedronGeometry(0.016 + R() * 0.02, 0);
    g.scale(0.7, 1.5, 0.7);
    g.rotateY(R() * 3);
    g.rotateZ((R() - 0.5) * 0.8);
    g.translate(x, y, z);
    (emberA.length <= emberB.length ? emberA : emberB).push(g);
  }
  glow(b.part(mergeGeometries(emberA)!, "#ffd45a", { bone: stage, at: [0, 0, 0] }), 1.2);
  glow(b.part(mergeGeometries(emberB)!, "#ff7a2a", { bone: stage, at: [0, 0, 0] }), 1.2);

  return b.root;
}
