```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  limb,
  paint,
  mix,
  smoothstep,
  mottle,
  svg,
} from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { cel, furEdge, INK, animeEye } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Pyro Phoenix",
  description:
    "A cel-shaded Genshin-style phoenix with flame plumage, wings spread on a stone pedestal, with a glowing halo, braziers and drifting embers.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const D2R = Math.PI / 180;
/** Height of the pedestal top: everything standing on it is lifted by this much. */
const G = 0.12;
const P = (x: number, y: number, z: number): [number, number, number] => [x, y + G, z];
const PV = (x: number, y: number, z: number) => V(x, y + G, z);

type Pt2 = [number, number] | [number, number, "sharp"];
type Pal = { root: string; mid: string; tip: string; inner: string; rim: string };

const PAL_WING: Pal = { root: "#8f1226", mid: "#ff5a1f", tip: "#ffc23a", inner: "#ffe98a", rim: "#4e0c1c" };
const PAL_COVERT: Pal = { root: "#c4281f", mid: "#ff8a2a", tip: "#ffe27a", inner: "#fff3b0", rim: "#6a1420" };
const PAL_TAIL: Pal = { root: "#9c1426", mid: "#ff6422", tip: "#fff0a0", inner: "#ffe08a", rim: "#5a0f1e" };
const PAL_CREST: Pal = { root: "#c8231f", mid: "#ff7a25", tip: "#ffd45a", inner: "#fff0a8", rim: "#6a1420" };

const ramp = (pal: Pal, u: number) =>
  mix(mix(pal.root, pal.mid, smoothstep(0.05, 0.5, u)), pal.tip, smoothstep(0.45, 0.95, u));

const leafOutline = (L: number, w: number): Pt2[] => [
  [0, 0, "sharp"],
  [0.12 * L, 0.6 * w],
  [0.4 * L, w],
  [0.75 * L, 0.7 * w],
  [0.9 * L, 0.42 * w],
  [L, 0, "sharp"],
  [0.9 * L, -0.42 * w],
  [0.75 * L, -0.7 * w],
  [0.4 * L, -w],
  [0.12 * L, -0.6 * w],
];

const flameOutline = (L: number, w: number): Pt2[] => [
  [0, 0, "sharp"],
  [0.1 * L, 0.55 * w],
  [0.28 * L, 0.95 * w],
  [0.46 * L, 0.62 * w],
  [0.6 * L, w],
  [0.76 * L, 0.5 * w],
  [0.88 * L, 0.62 * w],
  [L, 0, "sharp"],
  [0.84 * L, -0.45 * w],
  [0.7 * L, -0.9 * w],
  [0.52 * L, -0.6 * w],
  [0.36 * L, -w],
  [0.2 * L, -0.62 * w],
  [0.08 * L, -0.5 * w],
];

function featherPaint(L: number, w: number, thick: THREE.Vector3, pal: Pal) {
  return paint((_p, n, s) => {
    if (Math.abs(n.dot(thick)) < 0.5) return pal.rim;
    const u = Math.min(Math.max(s[0] / L, 0), 1);
    let c = ramp(pal, u);
    const half = w * 0.55 * (1 - u * 0.6);
    if (Math.abs(s[1]) < half * 0.5 && u > 0.12) c = mix(c, pal.inner, 0.55);
    if (Math.abs(s[1]) > w * 0.8 * (1 - u * 0.7) && u < 0.7) c = mix(c, pal.rim, 0.3);
    return c;
  });
}

export default function build() {
  const b = createBuilder({ name: "phoenix", paintSize: 2048 });
  type Jt = ReturnType<typeof b.joint>;
  type Line = Parameters<typeof b.ring>[0];
  const pair = (a: number, c: number): [number, number] => [a, c];

  // ------------------------------------------------------------------------------------------------ textures
  const EYE = animeEye({ iris: "#ffb81f", irisLight: "#ffe27a", blush: false, brow: false, size: 384 });

  const flamePath =
    "M100 48 C88 72 70 86 72 112 C74 132 88 144 100 146 C114 144 128 132 128 112 C128 94 114 86 110 66 C106 74 103 82 100 48Z";
  const ring = (r: number, w: number, c: string, extra = "") =>
    `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" ${extra}/>`;
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    const r0 = i % 2 ? 90 : 84;
    ticks += `<path d="M${(100 + Math.sin(a) * r0).toFixed(1)} ${(100 - Math.cos(a) * r0).toFixed(1)} L${(100 + Math.sin(a) * 96).toFixed(1)} ${(100 - Math.cos(a) * 96).toFixed(1)}" stroke="#ffcf5a" stroke-width="2.4"/>`;
  }
  let star = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 * Math.PI) / 180;
    star += `<path d="M${(100 + Math.sin(a) * 56).toFixed(1)} ${(100 - Math.cos(a) * 56).toFixed(1)} L${(100 + Math.sin(a) * 78).toFixed(1)} ${(100 - Math.cos(a) * 78).toFixed(1)}" stroke="#ff8a2e" stroke-width="2.2"/>`;
  }
  const HALO = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      ${ring(97, 2.4, "#ffcf5a")}${ring(70, 1.6, "#ff8a2e", 'stroke-dasharray="3 5"')}${ring(50, 1.8, "#ffcf5a")}
      ${ticks}${star}
      <path d="${flamePath}" transform="translate(100 100) scale(0.5) translate(-100 -100)" fill="#ff7a2a" stroke="#ffe27a" stroke-width="3"/>
    </svg>`,
    { size: 768 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      ${ring(97, 2.6, "#ffcf5a")}${ring(88, 1.6, "#ff8a2e", 'stroke-dasharray="6 4"')}${ring(64, 2, "#ffcf5a")}
      ${star}
      <path d="${flamePath}" transform="translate(100 100) scale(0.62) translate(-100 -100)" fill="#ff6a22" stroke="#ffe27a" stroke-width="2.4"/>
      <path d="M100 100 C92 112 94 124 100 128 C106 124 108 112 100 100Z" fill="#ffe27a"/>
    </svg>`,
    { size: 768 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
      <path d="M16 63 C5 46 5 24 16 2 C27 24 27 46 16 63Z" fill="url(#g)"/>
      <path d="M16 58 L16 14" stroke="#6a6a6a" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );
  const FLAME = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 94 C8 84 6 58 20 40 C22 52 28 54 30 50 C26 34 34 16 42 2 C46 24 62 44 58 66 C56 84 46 92 32 94Z" fill="#ff5a1a"/>
      <path d="M32 90 C16 82 15 62 25 48 C27 58 31 58 33 54 C32 44 37 34 41 26 C46 44 54 56 50 68 C48 82 40 88 32 90Z" fill="#ffae2e"/>
      <path d="M32 86 C24 80 24 68 30 60 C32 66 36 66 36 62 C40 68 42 78 38 82 C36 85 34 86 32 86Z" fill="#fff2a8"/>
    </svg>`,
    { size: 192 },
  );
  const EMBER = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 1 L20 12 L31 16 L20 20 L16 31 L12 20 L1 16 L12 12Z" fill="#ffb53a"/>
      <circle cx="16" cy="16" r="5" fill="#fff4b8"/>
    </svg>`,
    { size: 64 },
  );
  const PENDANT = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 3 L58 30 L32 61 L6 30Z" fill="#ffc93c" stroke="#3a1420" stroke-width="3"/>
      <path d="M32 13 L49 30 L32 50 L15 30Z" fill="#b3182a" stroke="#3a1420" stroke-width="1.6"/>
      <path d="M32 20 C27 28 24 31 26 38 C28 44 31 45 32 45 C34 45 37 43 38 38 C39 32 35 29 34 25 C33 27 32 28 32 20Z" fill="#ffd35a"/>
    </svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------------------------------------------ palette
  const COAT = cel(
    furEdge(furEdge("#a8182c", "#ff6a22", { level: 0.4, teeth: 0.2, period: 0.032 }), "#ffd98a", {
      level: -0.3,
      teeth: 0.26,
      period: 0.03,
    }),
  );
  const HEADP = cel(furEdge("#ff6a22", "#ffd98a", { level: -0.15, teeth: 0.22, period: 0.026, along: [1, 0, 0] }));
  const ORANGE = cel("#ff7a25");
  const DEEP = cel("#8a1426");
  const SCALE_GOLD = cel("#ffc93c", "#d98a24");
  const METAL = cel("#ffd35a", "#d9962c");
  const BEAKP = cel("#ffd24a", "#e48c2a");
  const CLAWP = cel("#7a3b1a", "#4a2010");
  const TEAL = "#3be0cc";
  const LEGP = paint((p) => (p.y > 0.5 + G ? ORANGE : SCALE_GOLD));
  const STONE = cel(mottle("#8a7466", "#6c5a52", { size: 0.18, seed: 3 }), "#4e3f44");
  const STONE2 = cel(mottle("#9b8575", "#7a6658", { size: 0.12, seed: 8 }), "#55454a");

  // ------------------------------------------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: P(0, 0.8, -0.38) });
  const spine = b.chain(
    "spine",
    catmull([P(0, 0.8, -0.38), P(0, 0.84, -0.1), P(0, 0.95, 0.18), P(0, 1.06, 0.36)]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const neck = b.chain("neck", catmull([P(0, 1.06, 0.36), P(0, 1.22, 0.44), P(0, 1.4, 0.5)]), {
    parent: spine,
    role: "neck",
    names: ["neck1", "neck2"],
  });
  const head = b.joint("head", { parent: neck, at: P(0, 1.4, 0.5), dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, down: 0.05 }),
    aim: head.local({ forward: 0.24, down: 0.06 }),
    role: "jaw",
  });
  const tail = b.chain("tail", catmull([P(0, 0.84, -0.38), P(0, 0.82, -0.55), P(0, 0.78, -0.74)]), {
    parent: hips,
    role: "tail",
    names: ["tail1", "tail2"],
  });

  // ------------------------------------------------------------------------------------------------ helpers
  function feather(o: {
    at: THREE.Vector3;
    dir: THREE.Vector3;
    L: number;
    w: number;
    bone: Jt;
    pal?: Pal;
    color?: string;
    N?: THREE.Vector3;
    th?: number;
    flame?: boolean;
  }) {
    const d = o.dir.clone().normalize();
    const N = (o.N ?? UP).clone().normalize();
    const yv = N.clone().cross(d).normalize();
    const thick = d.clone().cross(yv).normalize();
    const outline = o.flame ? flameOutline(o.L, o.w) : leafOutline(o.L, o.w);
    const color: ColorInput = o.color ?? featherPaint(o.L, o.w, thick, o.pal ?? PAL_WING);
    return b.extrude(outline, { at: o.at, x: d, y: yv, thickness: o.th ?? 0.012, color, bone: o.bone });
  }

  function band(line: Line, r: number, tube: number, color: ColorInput, count = 8) {
    const rg = b.ring(line, { count, radius: r });
    b.sweep(catmull(rg.items, { closed: true }), tube, { color });
    return rg.items;
  }

  // ------------------------------------------------------------------------------------------------ pedestal
  b.lathe(
    [
      [0, 0],
      [1.4, 0],
      [1.4, 0.04],
      [1.34, 0.05],
      [1.34, 0.08],
      [1.26, 0.1],
      [1.26, G],
      [0, G],
    ],
    { at: [0, 0, -0.55], bone: root, color: STONE, segments: 40 },
  );
  b.part(new THREE.TorusGeometry(1.345, 0.013, 5, 56), METAL, {
    bone: root,
    at: [0, 0.065, -0.55],
    dir: [0, 1, 0],
    axis: "z",
  });
  glow(
    b.part(new THREE.CircleGeometry(1.15, 40), "#ffffff", {
      bone: root,
      at: [0, G + 0.003, -0.55],
      dir: [0, 1, 0],
      axis: "z",
      texture: GLYPH,
    }),
    0.9,
  );
  for (let i = 0; i < 20; i++) {
    const th = (i / 20) * Math.PI * 2;
    glow(
      b.part(new THREE.BoxGeometry(0.02, 0.008, i % 2 ? 0.06 : 0.04), "#ffcf5a", {
        bone: root,
        at: [Math.sin(th) * 1.2, G + 0.004, -0.55 + Math.cos(th) * 1.2],
        rotation: [0, (th * 180) / Math.PI, 0],
      }),
      1,
    );
  }

  // ------------------------------------------------------------------------------------------------ body
  const bodyR = (t: number) => {
    const k = Math.sin(Math.PI * (0.12 + 0.8 * t));
    return pair(0.07 + 0.12 * k, 0.08 + 0.15 * k);
  };
  const bodySw = b.sweep(spine, bodyR, { color: COAT });
  const neckSw = b.sweep(neck, pair(0.085, 0.06), { color: COAT });
  b.sweep(tail, pair(0.085, 0.04), { color: COAT });

  // ------------------------------------------------------------------------------------------------ head
  const HS = 1;
  const HC = head.local({ forward: 0.1 * HS, up: 0.04 * HS });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADP, {
    bone: head,
    at: HC,
    scale: [0.13 * HS, 0.12 * HS, 0.13 * HS],
  });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 42, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.07, 0.095], mirror: s > 0 });
  }

  // beak: separate upper and lower mandibles
  b.sweep(
    bezier(head.local({ forward: 0.17, down: 0 }), head.local({ forward: 0.31, up: 0.0 }), head.local({ forward: 0.39, down: 0.06 })),
    (t: number) => pair(0.05 - 0.044 * t, 0.04 - 0.035 * t),
    { bone: head, color: BEAKP, caps: { start: "flat", end: "point" }, sides: 6 },
  );
  b.sweep(
    bezier(head.local({ forward: 0.17, down: 0.06 }), head.local({ forward: 0.28, down: 0.065 }), head.local({ forward: 0.34, down: 0.05 })),
    (t: number) => pair(0.04 - 0.034 * t, 0.025 - 0.02 * t),
    { bone: jaw, color: BEAKP, caps: { start: "flat", end: "point" }, sides: 6 },
  );
  b.sweep(
    catmull([head.local({ forward: 0.17, down: 0.03 }), head.local({ forward: 0.27, down: 0.036 }), head.local({ forward: 0.35, down: 0.05 })]),
    0.004,
    { bone: head, color: INK },
  );
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.01, 5, 4), INK, {
      bone: head,
      at: head.local({ forward: 0.27, up: 0.02, left: s * 0.022 }),
    });

  // brows
  for (const s of [1, -1])
    feather({
      at: head.local({ left: s * 0.075, up: 0.122, forward: 0.12 }),
      dir: V(s * 0.45, 0.3, -0.85),
      L: 0.15,
      w: 0.026,
      bone: head,
      pal: PAL_CREST,
      flame: true,
      th: 0.01,
    });

  // crest
  for (let i = -2; i <= 2; i++) {
    const d = V(i * 0.33, 0.8, -0.5 - Math.abs(i) * 0.05);
    const dn = d.clone().normalize();
    const N = d
      .clone()
      .cross(V(1, 0, 0))
      .multiplyScalar(0.7)
      .add(d.clone().cross(UP).multiplyScalar(0.4 * (i >= 0 ? 1 : -1) * (i === 0 ? 0 : 1)));
    const L = [0.3, 0.38, 0.48, 0.38, 0.3][i + 2];
    const w = 0.045 - 0.004 * Math.abs(i);
    const at = head.local({ up: 0.14 * HS, forward: 0.03 * HS, left: i * 0.025 });
    feather({ at, dir: d, L, w, bone: head, pal: PAL_CREST, flame: true, N });
    glow(
      feather({
        at: at.clone().addScaledVector(dn, 0.68 * L).add(V(0, 0.002, 0)),
        dir: d,
        L: 0.34 * L,
        w: w * 0.5,
        bone: head,
        color: "#ffe27a",
        N,
        flame: true,
        th: 0.016,
      }),
      1.2,
    );
  }
  glow(
    b.part(new THREE.OctahedronGeometry(0.03), TEAL, {
      bone: head,
      at: head.local({ forward: 0.15, up: 0.15 }),
      flat: true,
    }),
    0.9,
  );

  // cheek tufts
  const tuftRng = rng(21);
  for (const s of [1, -1]) {
    const cc = head.local({ left: s * 0.11, forward: 0.06, down: 0.03 });
    const hits = skin.scatter(14, {
      rng: tuftRng,
      minDist: 0.028,
      filter: (h) => h.at.distanceTo(cc) < 0.075 && Math.abs(h.n.x) > 0.3 && h.n.z < 0.3,
    });
    b.cards(hits, TUFT, { size: [0.045, 0.09], lean: 60, flow: [0, -0.1, -1], bend: 20, color: "#ff8a2a", rng: tuftRng });
  }

  // ------------------------------------------------------------------------------------------------ collar + chest
  const nc = neck.at(0.42);
  const collar = band(nc, 0.098, 0.016, METAL, 12);
  let front = collar[0];
  for (const it of collar) if (it.at.z > front.at.z) front = it;
  for (const it of collar)
    if (it.at.z > nc.at.z + 0.05) b.spike(it, [0, -1, 0], 0.07, 0.016, { color: METAL });
  glow(b.stick(new THREE.OctahedronGeometry(0.034), TEAL, front, { embed: 0.1 }), 0.9);
  const mp = front.at.clone().add(V(0, -0.11, 0.03));
  b.decal(b.surface([bodySw, neckSw]), PENDANT, { at: mp, dir: [0, 0.15, 1], size: [0.1, 0.11] });

  const bodySkin = b.surface([bodySw, neckSw]);
  const chestHits = bodySkin.scatter(80, {
    rng: rng(5),
    minDist: 0.034,
    filter: (h) => h.n.z > 0.25 && h.at.z > 0.1 && h.at.distanceTo(mp) > 0.11 && h.at.y < 1.38 + G,
  });
  b.cards(chestHits, TUFT, { size: [0.045, 0.09], lean: 60, flow: [0, -1, -0.25], bend: 25, vary: 0.3, rng: rng(6), color: "#ffd070" });
  const manes = bodySkin.scatter(70, {
    rng: rng(7),
    minDist: 0.04,
    filter: (h) => h.n.y > 0.35 && h.at.z < 0.5 && h.at.z > -0.3,
  });
  b.cards(manes, TUFT, { size: [0.05, 0.11], lean: 58, flow: [0, -0.2, -1], bend: 28, vary: 0.35, rng: rng(8), color: "#ff5a22" });

  // ------------------------------------------------------------------------------------------------ tail streamers
  const R0 = PV(0, 0.84, -0.38);
  const ribbons: [number, number, number][] = [
    [0.08, 1.2, 0.11],
    [-0.14, 1.05, 0.1],
    [0.3, 0.95, 0.09],
    [-0.34, 0.85, 0.085],
    [0.55, 0.7, 0.08],
    [-0.58, 0.62, 0.075],
    [0.8, 0.5, 0.07],
    [-0.82, 0.45, 0.07],
  ];
  ribbons.forEach(([phi, L, w], k) => {
    const d0 = V(Math.sin(phi), 0, -Math.cos(phi));
    const p0 = R0.clone().add(V(0, (k - 4) * 0.012, 0));
    const p1 = p0.clone().addScaledVector(d0, L * 0.3).add(V(0, -0.06, 0));
    const p2 = p0.clone().addScaledVector(d0, L * 0.66).add(V(0, -0.3 * (L / 1.2), 0));
    const p3 = p0.clone().addScaledVector(d0, L).add(V(0, -0.1 + 0.12 * (k % 2), 0));
    const path = bezier(p0, p1, p2, p3);
    const rx = (t: number) =>
      Math.max(
        0.006,
        w * (1 - Math.pow(t, 1.7)) * (0.78 + 0.22 * Math.sin(t * 15 + k * 2)) * (0.4 + 0.6 * smoothstep(0, 0.15, t)),
      );
    const col = paint((_p, _n, s) => {
      const c = ramp(PAL_TAIL, s[0]);
      return Math.abs(Math.sin(s[1] * D2R)) > 0.8 ? mix(c, PAL_TAIL.rim, 0.55) : c;
    });
    b.sweep(path, (t: number) => pair(rx(t), 0.007), { section: "box", color: col, bone: tail.joints[0], caps: "flat" });
    if (k < 2)
      glow(
        b.sweep(path, (t: number) => pair(0.012 * (1 - t * 0.8), 0.011), {
          section: "box",
          color: "#ffe9a0",
          bone: tail.joints[0],
          from: 0.08,
          to: 0.85,
          caps: "flat",
        }),
        1.3,
      );
  });

  // ------------------------------------------------------------------------------------------------ wings
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const arm = b.chain(
      `wing${sd}`,
      catmull([P(s * 0.17, 1.03, 0.14), P(s * 0.52, 1.2, 0.16), P(s * 0.88, 1.28, 0.04), P(s * 1.12, 1.34, -0.06)]),
      { parent: spine.joints[1], role: "wing", names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`] },
    );
    b.sweep(arm, pair(0.07, 0.03), { color: DEEP });
    const Sp = arm.joints[0].at.clone();
    const Ep = arm.joints[1].at.clone();
    const Wp = arm.joints[2].at.clone();
    const Hp = arm.joints[3].at.clone();
    const dirFor = (a: number, rise: number) => V(s * Math.sin(a * D2R), rise, -Math.cos(a * D2R));

    // glowing gold leading edge
    const lead = [Sp, Ep, Wp, Hp].map((p, i) => p.clone().add(V(0, 0.025, [0.085, 0.07, 0.05, 0.04][i])));
    glow(b.sweep(catmull(lead), 0.014, { color: "#ffd45a", bone: arm }), 1.2);

    // tertials
    [0.3, 0.6, 0.9].forEach((u, i) => {
      feather({
        at: Sp.clone().lerp(Ep, u).add(V(0, i * 0.005 - 0.01, 0)),
        dir: dirFor(i * 6, 0.05),
        L: [0.36, 0.42, 0.46][i],
        w: 0.066,
        bone: arm.joints[0],
        pal: PAL_WING,
      });
    });

    // secondaries and their coverts
    const SL = [0.5, 0.52, 0.54, 0.54, 0.56, 0.58];
    for (let i = 0; i < 6; i++) {
      const base = Ep.clone().lerp(Wp, i / 5).add(V(0, i * 0.005, 0));
      const d = dirFor(12 + i * 4.5, 0.06);
      feather({ at: base, dir: d, L: SL[i], w: 0.066, bone: arm.joints[1], pal: PAL_WING });
      feather({
        at: base.clone().addScaledVector(d.clone().normalize(), 0.09).add(V(0, 0.02, 0)),
        dir: d,
        L: SL[i] * 0.5,
        w: 0.056,
        bone: arm.joints[1],
        pal: PAL_COVERT,
        flame: true,
      });
    }

    // primaries, glowing tips and coverts
    const PL = [0.58, 0.66, 0.72, 0.77, 0.78, 0.72, 0.6];
    for (let i = 0; i < 7; i++) {
      const base = Wp.clone().lerp(Hp, i / 6).add(V(0, i * 0.005, 0));
      const d = dirFor(36 + i * 7, 0.12 - i * 0.01);
      const dn = d.clone().normalize();
      const L = PL[i];
      const w = 0.062;
      feather({ at: base, dir: d, L, w, bone: arm.joints[2], pal: PAL_WING });
      glow(
        feather({
          at: base.clone().addScaledVector(dn, 0.72 * L).add(V(0, 0.003, 0)),
          dir: d,
          L: 0.3 * L,
          w: w * 0.5,
          bone: arm.joints[2],
          color: "#ffd757",
          flame: true,
          th: 0.016,
        }),
        1.2,
      );
      feather({
        at: base.clone().addScaledVector(dn, 0.09).add(V(0, 0.02, 0)),
        dir: d,
        L: L * 0.5,
        w: w * 0.85,
        bone: arm.joints[2],
        pal: PAL_COVERT,
        flame: true,
      });
    }

    // wrist band and gem
    const items = band(arm.at(0.6), 0.056, 0.012, METAL, 8);
    let top = items[0];
    for (const it of items) if (it.at.y > top.at.y) top = it;
    glow(b.stick(new THREE.OctahedronGeometry(0.026), TEAL, top, { embed: 0.1 }), 0.9);
  }

  // ------------------------------------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hipP = P(s * 0.15, 0.74, -0.15);
    const foot = P(s * 0.15, 0.065, 0.1);
    const pts = limb(hipP, foot, [0.3, 0.3, 0.26], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      role: "leg",
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `foot${sd}`],
      contact: [s * 0.15, G, 0.18],
    });
    b.sweep(leg, [0.085, 0.075, 0.04, 0.028, 0.024], { color: LEGP });
    b.part(new THREE.SphereGeometry(1, 10, 8), ORANGE, {
      bone: leg.joints[0],
      at: leg.joints[0].at.clone().lerp(leg.joints[1].at, 0.4),
      scale: [0.1, 0.15, 0.11],
    });
    const ft = leg.joints[leg.joints.length - 1];
    const A = ft.at.clone();
    b.part(new THREE.SphereGeometry(0.04, 8, 6), SCALE_GOLD, { bone: ft, at: A });
    const toes: [number, number][] = [
      [-0.38, 0.17],
      [0, 0.21],
      [0.38, 0.17],
      [Math.PI, 0.1],
    ];
    for (const [a, len] of toes) {
      const dir = V(Math.sin(a), 0, Math.cos(a));
      const tip = A.clone().addScaledVector(dir, len);
      tip.y = G + 0.028;
      b.capsule(A, tip, pair(0.03, 0.022), { color: SCALE_GOLD, bone: ft });
      b.spike(tip, V(dir.x, -0.35, dir.z).normalize(), 0.07, 0.022, { color: CLAWP, bone: ft });
    }
    const ank = band(leg.at(0.82), 0.04, 0.011, METAL, 8);
    let atop = ank[0];
    for (const it of ank) if (it.at.z > atop.at.z) atop = it;
    glow(b.stick(new THREE.OctahedronGeometry(0.018), TEAL, atop, { embed: 0.1 }), 0.8);
  }

  // ------------------------------------------------------------------------------------------------ halo
  const HZ = -1.75;
  const HY = 0.94;
  glow(b.part(new THREE.TorusGeometry(0.82, 0.022, 6, 44), "#ffcf5a", { bone: root, at: [0, HY, HZ] }), 1.1);
  glow(b.part(new THREE.TorusGeometry(0.72, 0.008, 4, 40), "#ff9a3c", { bone: root, at: [0, HY, HZ] }), 1);
  glow(
    b.part(new THREE.CircleGeometry(0.75, 36), "#ffffff", { bone: root, at: [0, HY, HZ + 0.004], texture: HALO }),
    1,
  );
  for (let i = 0; i < 16; i++) {
    const th = (i / 16) * Math.PI * 2;
    glow(
      b.part(new THREE.BoxGeometry(0.03, 0.07, 0.02), "#ffcf5a", {
        bone: root,
        at: [Math.sin(th) * 0.93, HY + Math.cos(th) * 0.93, HZ],
        rotation: [0, 0, -(th * 180) / Math.PI],
      }),
      1,
    );
  }
  b.part(new THREE.BoxGeometry(0.26, 0.09, 0.14), METAL, { bone: root, at: [0, 0.15, HZ], flat: true });

  // ------------------------------------------------------------------------------------------------ props
  const flameRng = rng(31);
  for (const s of [1, -1]) {
    const bx = s * 1.05;
    const bz = -1.05;
    b.lathe(
      [
        [0, 0],
        [0.16, 0],
        [0.16, 0.04],
        [0.09, 0.08],
        [0.09, 0.22],
        [0.2, 0.3],
        [0.2, 0.34],
        [0.17, 0.34],
        [0.15, 0.31],
        [0, 0.31],
      ],
      { at: [bx, G, bz], bone: root, color: STONE2, segments: 10 },
    );
    b.part(new THREE.TorusGeometry(0.185, 0.012, 4, 14), METAL, {
      bone: root,
      at: [bx, G + 0.325, bz],
      dir: [0, 1, 0],
      axis: "z",
    });
    glow(b.part(new THREE.SphereGeometry(0.15, 8, 6), "#ff7a22", { bone: root, at: [bx, G + 0.31, bz], scale: [1, 0.45, 1] }), 1);
    const ff: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ff.push(frame([bx + Math.sin(a) * 0.06, G + 0.32, bz + Math.cos(a) * 0.06], [0, 1, 0]));
    }
    glow(b.cards(ff, FLAME, { size: [0.15, 0.3], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.3, rng: flameRng, bone: root }), 1.2);
  }
  // broken pillars and a fallen drum
  b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.55, 8), STONE2, { bone: root, at: [-0.8, G + 0.275, -1.35], flat: true });
  b.part(new THREE.BoxGeometry(0.16, 0.12, 0.14), STONE2, { bone: root, at: [-0.78, G + 0.58, -1.35], rotation: [10, 25, 14], flat: true });
  b.part(new THREE.TorusGeometry(0.12, 0.014, 4, 12), METAL, { bone: root, at: [-0.8, G + 0.42, -1.35], dir: [0, 1, 0], axis: "z" });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), STONE, { bone: root, at: [0.85, G + 0.1, -1.3], rotation: [0, 30, 90], flat: true });
  b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.3, 8), STONE, { bone: root, at: [0.9, G + 0.15, -1.45], flat: true });

  // drifting embers
  const er = rng(11);
  const ef: ReturnType<typeof frame>[] = [];
  let tries = 0;
  while (ef.length < 26 && tries < 500) {
    tries++;
    const x = (er() - 0.5) * 3.4;
    const y = 0.4 + er() * 1.9;
    const z = -1.5 + er() * 2.3;
    if (Math.abs(x) < 0.55 && y < 1.75 && z > -0.7) continue;
    ef.push(frame([x, y, z], [0, 1, 0]));
  }
  glow(
    b.cards(ef, EMBER, { size: [0.07, 0.07], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.5, spin: 180, rng: rng(12), bone: root }),
    1.4,
  );

  return b.root;
}
```