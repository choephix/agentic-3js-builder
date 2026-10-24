```ts
// STYLE: ALEBRIJE — Oaxacan carved-and-painted fantasy wood sculpture.
// The three-headed puppy is a chunky faceted "wood-carved" body in flat-shaded blocks, then painted
// edge to edge in neon alebrije colour: wavy ink-outlined bands, dot fields and dotted rings, hand-painted
// marigold, swirl and sun motifs, a marigold flower crown, and a flame-tipped tail. Each head gets its own
// palette, so the puppy reads as one creature with three personalities.

import * as THREE from "three";
import { createBuilder, frame, rng, catmull, limb, paint, mix, cells, smoothstep, rgb, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cerberito, alebrije three-headed puppy",
  description:
    "A chubby three-headed puppy carved in faceted blocks and painted like a Oaxacan alebrije: ink-outlined wavy bands, dot fields, marigold and swirl decals, a flame-tipped tail, one palette per head.",
};

type RGB = [number, number, number];
const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const C = {
  ink: "#2a1030",
  cream: "#fff1cf",
  white: "#ffffff",
  pink: "#ff2e88",
  hot: "#ff4f7b",
  teal: "#09b6b0",
  yellow: "#ffc400",
  orange: "#ff6a13",
  purple: "#6b2fd0",
  violet: "#7a3cf0",
  blue: "#2a5bff",
  green: "#3fbf3a",
  red: "#e8233b",
  lime: "#b6e22e",
  sand: "#ffe08a",
};

// ---------------------------------------------------------------------------------------------------------
// The alebrije paint: wavy ink-outlined bands, dot fields, dotted rings, a cool underside and a warm top.

type AleOpts = {
  base: string;
  band: string;
  dot: string;
  ring: string;
  size: number;
  seed: number;
  dir?: RGB;
  wave?: number;
  belly?: string;
};

function ale(o: AleOpts) {
  const dir = V3(...(o.dir ?? [0, 0, 1])).normalize();
  const wave = o.wave ?? 38;
  const cBase = rgb(o.base);
  const cBand = rgb(o.band);
  const cDot = rgb(o.dot);
  const cRing = rgb(o.ring);
  const cInk = rgb(C.ink);
  const cBelly = o.belly ? rgb(o.belly) : null;
  return paint((p, n) => {
    const w = p.dot(dir) / o.size + 0.2 * Math.sin((p.x + p.y * 0.7 + p.z * 0.4) * wave);
    const k = Math.floor(w);
    const f = w - k;
    const cl = cells(p, o.size * 0.42, o.seed);
    let c = cBase;
    if (cl.d1 < 0.17) c = cDot;
    else if (cl.d1 < 0.28 && (k & 1) === 1) c = cRing;
    if (f < 0.13) c = cBand;
    else if (f < 0.17) c = cInk;
    if (cBelly && n.y < -0.5 + 0.12 * Math.sin(p.z * 70)) c = n.y < -0.56 + 0.12 * Math.sin(p.z * 70) ? cBelly : cInk;
    const lit = 0.8 + 0.28 * smoothstep(-0.7, 0.9, n.y);
    const m = mix(c, "#4a2a8a", 0.28 * smoothstep(0.1, -0.8, n.y));
    return [m[0] * lit, m[1] * lit, m[2] * lit] as RGB;
  });
}

// ---------------------------------------------------------------------------------------------------------
// Hand-painted drawings

const eyeTex = (iris: string, rim: string) =>
  svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 30 L11 17 M36 21 L30 6 M50 18 L50 3 M64 21 L70 6 M78 30 L89 17" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="50" cy="57" r="40" fill="${C.ink}"/>
      <circle cx="50" cy="57" r="35" fill="#fffaf0"/>
      <circle cx="50" cy="59" r="29" fill="${rim}" stroke="${C.ink}" stroke-width="3"/>
      <circle cx="50" cy="59" r="23" fill="${iris}"/>
      <circle cx="50" cy="59" r="23" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-dasharray="3 4"/>
      <circle cx="50" cy="59" r="12" fill="${C.ink}"/>
      <circle cx="41" cy="48" r="8" fill="#ffffff"/>
      <circle cx="58" cy="68" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

const marigoldTex = () => {
  let petals = "";
  const cols = ["#ff9a1f", "#ffbd1a", "#ffe066"];
  for (let ring = 0; ring < 3; ring++) {
    const n = 14 - ring * 3;
    const r = 44 - ring * 11;
    const w = 11 - ring * 1.5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360 + ring * 13;
      petals += `<ellipse cx="50" cy="${(50 - r * 0.6).toFixed(1)}" rx="${w}" ry="${(r * 0.5).toFixed(1)}" fill="${cols[ring]}" stroke="${C.ink}" stroke-width="2.2" transform="rotate(${a.toFixed(1)} 50 50)"/>`;
    }
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${petals}
      <circle cx="50" cy="50" r="8" fill="#c2410c" stroke="${C.ink}" stroke-width="2"/>
      <circle cx="50" cy="50" r="3" fill="${C.ink}"/></svg>`,
    { size: 160 },
  );
};

const swirlTex = () => {
  let d = "";
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = t * 3.1 * Math.PI * 2;
    const r = 5 + t * 38;
    d += `${i ? "L" : "M"}${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="${d}" fill="none" stroke="${C.ink}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="${C.yellow}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="5" fill="${C.pink}" stroke="${C.ink}" stroke-width="2"/>
      <circle cx="87" cy="55" r="5" fill="${C.pink}" stroke="${C.ink}" stroke-width="2"/>
    </svg>`,
    { size: 192 },
  );
};

const sunTex = () => {
  let rays = "";
  for (let i = 0; i < 12; i++)
    rays += `<path d="M50 3 L59 28 L41 28Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round" transform="rotate(${i * 30} 50 50)"/>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${rays}
      <circle cx="50" cy="50" r="23" fill="#ff8a1c" stroke="${C.ink}" stroke-width="3"/>
      <circle cx="50" cy="50" r="15" fill="#ffe066" stroke="${C.ink}" stroke-width="2"/>
      <circle cx="50" cy="50" r="5.5" fill="${C.pink}" stroke="${C.ink}" stroke-width="1.6"/></svg>`,
    { size: 128 },
  );
};

const flameTex = () =>
  svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe066"/><stop offset="0.45" stop-color="#ff8a1c"/><stop offset="1" stop-color="#e8233b"/>
      </linearGradient></defs>
      <path d="M30 97 C8 91 2 64 18 46 C22 58 26 60 28 56 C26 36 34 18 38 3 C46 26 59 44 56 68 C54 86 44 95 30 97Z" fill="url(#fg)" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M30 92 C19 88 16 72 25 62 C27 70 31 70 32 66 C33 56 37 50 39 42 C45 56 46 74 42 82 C40 89 36 91 30 92Z" fill="#ffe066" stroke="#ff8a1c" stroke-width="1.5"/>
      <path d="M30 90 C25 86 25 79 30 74 C35 79 35 86 30 90Z" fill="#fffbe6"/>
    </svg>`,
    { size: 128 },
  );

const tuftTex = () =>
  svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 63 C2 42 5 15 16 2 C27 15 30 42 16 63Z" fill="#f4f4f4" stroke="#8a8a8a" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M16 56 C13 40 13 22 16 10" stroke="#b0b0b0" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

// ---------------------------------------------------------------------------------------------------------
// Head specs

type Pal = {
  base: string;
  band: string;
  accent: string;
  dot: string;
  ring: string;
  muzzle: string;
  jaw: string;
  collar: string;
  bead: string;
  cheek: string;
};

type HeadSpec = {
  id: string;
  neck: number[][];
  dir: RGB;
  S: number;
  yaw: number;
  pal: Pal;
  eye: THREE.Texture;
  fore: THREE.Texture;
  seed: number;
  open: number;
  tongue: number;
};

export default function build() {
  const b = createBuilder({ name: "cerberito" });
  type Joint = ReturnType<typeof b.joint>;
  type ColorLike = string | ReturnType<typeof ale>;

  const O = (pts: [number, number][], k = 1) => pts.map(([x, y]) => [x * k, y * k] as [number, number]);

  // Textures, made once
  const MARI = marigoldTex();
  const SWIRL = swirlTex();
  const SUN = sunTex();
  const FLAME = flameTex();
  const TUFT = tuftTex();

  // -------------------------------------------------------------------------------------------------------
  // Skeleton: hips, spine, tail, legs

  const hips = b.joint("hips", { at: [0, 0.3, -0.12] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.3, -0.12],
      [0, 0.31, -0.03],
      [0, 0.335, 0.07],
      [0, 0.35, 0.17],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chestJoint = spine.joints[2];

  // Body: faceted carved block, banded and dotted
  const body = b.sweep(spine, (t) => [0.118 + 0.03 * t, 0.108 + 0.028 * t], {
    color: ale({ base: C.teal, band: C.purple, dot: C.yellow, ring: C.cream, size: 0.07, seed: 3, belly: C.cream }),
    sides: 10,
    smooth: false,
    name: "body",
  });
  const bodySkin = b.surface(body);

  // Dorsal ridge of painted wedges
  const RIDGE = [C.pink, C.yellow, C.orange, C.violet];
  let ri = 0;
  b.along(
    body,
    6,
    (at) => {
      b.stick(new THREE.ConeGeometry(0.024, 0.075, 5), RIDGE[ri++ % RIDGE.length], at, { embed: 0.15, flat: true });
    },
    { from: 0.04, to: 0.72 },
  );

  // Marigolds and swirls laid on the flanks and shoulders
  const decalBody = (tex: THREE.Texture, origin: RGB, dir: RGB, size: number, roll = 0, up?: RGB) => {
    const h = bodySkin.ray(origin, dir);
    if (!h) return;
    const opts: Record<string, any> = { at: h, dir: h.n, size: [size, size], roll };
    if (up) opts.up = up;
    b.decal(body, tex, opts as any);
  };
  for (const s of [1, -1]) {
    decalBody(MARI, [s * 0.5, 0.33, -0.02], [-s, 0, 0], 0.125, 0);
    decalBody(SWIRL, [s * 0.5, 0.3, -0.175], [-s, 0, 0], 0.1, s * 20);
    decalBody(MARI, [s * 0.085, 0.8, -0.1], [0, -1, 0], 0.07, s * 25, [0, 0, 1]);
    decalBody(MARI, [s * 0.5, 0.31, 0.1], [-s, 0, 0], 0.075, 15);
  }

  // Chest fluff
  const chestHits = bodySkin.scatter(34, {
    rng: rng(3),
    minDist: 0.03,
    filter: (h) => h.at.z > 0.1 && h.n.y < 0.45 && h.n.z > 0.1,
  });
  if (chestHits.length)
    b.cards(chestHits, TUFT, {
      size: [0.036, 0.062],
      lean: 55,
      flow: [0, -1, 0.2],
      bend: 20,
      vary: 0.3,
      rng: rng(4),
      color: C.cream,
    });

  // Tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.31, -0.2],
      [0, 0.33, -0.3],
      [0, 0.4, -0.365],
      [0, 0.49, -0.37],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.042 - 0.02 * t, {
    color: ale({ base: C.orange, band: C.purple, dot: C.yellow, ring: C.cream, size: 0.04, seed: 9, dir: [0, 0.6, 1] }),
    sides: 8,
    smooth: false,
  });
  const tailTip = tail.at(1).at;
  b.part(new THREE.SphereGeometry(0.026, 8, 6), C.yellow, { bone: tail.joints[2], at: tailTip, flat: true });
  glow(
    b.cards([frame(tailTip, [0, 1, 0])], FLAME, {
      size: [0.11, 0.17],
      cross: true,
      lean: 0,
      flow: [0, 0, 1],
      sink: 0.25,
      bone: tail.joints[2],
    }),
    1.2,
  );

  // -------------------------------------------------------------------------------------------------------
  // Legs

  const LEGP = ale({ base: C.yellow, band: C.blue, dot: C.pink, ring: C.cream, size: 0.045, seed: 5, dir: [0, 1, 0] });
  const PAWP = ale({ base: C.pink, band: C.purple, dot: C.cream, ring: C.yellow, size: 0.03, seed: 8, dir: [0, 1, 0] });

  const paw = (bone: Joint, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), PAWP, {
      bone,
      at: [x, 0.04, z + 0.028],
      scale: [0.05, 0.04, 0.062],
      flat: true,
    });
    for (const k of [-1, 0, 1]) {
      const tx = x + k * 0.024;
      const tz = z + 0.083 - Math.abs(k) * 0.012;
      b.part(new THREE.SphereGeometry(0.017, 6, 4), C.cream, { bone, at: [tx, 0.03, tz], scale: [1, 0.8, 1.1], flat: true });
      b.part(new THREE.ConeGeometry(0.0065, 0.016, 4), C.ink, { bone, at: [tx, 0.028, tz + 0.02], dir: [0, 0, 1], flat: true });
    }
  };

  const cuff = (sweep: ReturnType<typeof b.sweep>, ch: ReturnType<typeof b.chain>, t: number) => {
    const loop = b.surface(sweep).loop(ch.at(t), { lift: 0.004 });
    b.sweep(loop, 0.011, { color: C.pink, sides: 6 });
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // Front leg: elbow back
    const fPts = limb([s * 0.1, 0.255, 0.115], [s * 0.1, 0.05, 0.145], [0.125, 0.125], [[0, 0, -1]]);
    const front = b.chain(`legF${sd}`, fPts, {
      parent: chestJoint,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "leg",
    });
    const fSweep = b.sweep(front, (t) => 0.058 - 0.02 * t, { color: LEGP, sides: 8, smooth: false });
    b.part(new THREE.SphereGeometry(1, 8, 6), LEGP, {
      bone: chestJoint,
      at: [s * 0.11, 0.27, 0.12],
      scale: [0.065, 0.085, 0.085],
      flat: true,
    });
    cuff(fSweep, front, 0.78);
    paw(front.tip!, s * 0.1, 0.145);

    // Hind leg: knee forward, hock back
    const hPts = limb([s * 0.105, 0.26, -0.14], [s * 0.105, 0.05, -0.12], [0.1, 0.1, 0.07], [[0, 0, 1], [0, 0, -1]]);
    const hind = b.chain(`legH${sd}`, hPts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `ankle${sd}`],
      role: "leg",
    });
    const hSweep = b.sweep(hind, (t) => 0.06 - 0.025 * t, { color: LEGP, sides: 8, smooth: false });
    b.part(new THREE.SphereGeometry(1, 8, 6), LEGP, {
      bone: hips,
      at: [s * 0.118, 0.265, -0.15],
      scale: [0.072, 0.098, 0.105],
      flat: true,
    });
    cuff(hSweep, hind, 0.86);
    paw(hind.tip!, s * 0.105, -0.12);
  }

  // -------------------------------------------------------------------------------------------------------
  // Heads

  const buildHead = (spec: HeadSpec) => {
    const { id, S, yaw, pal } = spec;
    const neck = b.chain(`neck_${id}`, catmull(spec.neck), {
      parent: chestJoint,
      names: [`neck_${id}1`, `neck_${id}2`],
      role: "neck",
    });
    const head = b.joint(`head_${id}`, {
      parent: neck.joints[1],
      at: neck.at(1).at,
      dir: V3(...spec.dir).normalize(),
      role: "head",
    });

    // Neck with collar, beads and a glowing sun medallion
    const neckSweep = b.sweep(neck, [0.06, 0.047], {
      color: ale({ base: pal.base, band: pal.band, dot: pal.dot, ring: pal.ring, size: 0.045, seed: spec.seed + 2, dir: [0, 1, 0.3] }),
      sides: 8,
      smooth: false,
    });
    const ns = b.surface(neckSweep);
    b.sweep(ns.loop(neck.at(0.4), { lift: 0.006 }), 0.013, { color: pal.collar, sides: 6 });
    const beadLoop = ns.loop(neck.at(0.4), { lift: 0.015 });
    b.along(beadLoop, 9, (at) => {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), pal.bead, { at, flat: true });
    });
    const mh = ns.around(neck.at(0.2).at).at(yaw * 0.6, -4);
    if (mh) glow(b.decal(neckSweep, SUN, { at: mh, dir: mh.n, size: [0.055, 0.055], lift: 0.012 }), 0.9);

    // Head-local helpers: left (+X), forward, up, in meters at scale S
    const P = (left: number, fwd: number, up: number) => head.local([-left * S, fwd * S, up * S]);
    const hp = (geo: THREE.BufferGeometry, color: ColorLike, pos: RGB, opts: Record<string, any> = {}) =>
      b.part(geo, color, { bone: head, at: P(pos[0], pos[1], pos[2]), dir: head.axis, ...opts });

    // Skull
    const skull = hp(
      new THREE.SphereGeometry(1, 12, 9),
      ale({ base: pal.base, band: pal.band, dot: pal.dot, ring: pal.ring, size: 0.045, seed: spec.seed, dir: [0, 1, 0.25], wave: 55 }),
      [0, 0.06, 0.03],
      { scale: [0.086 * S, 0.082 * S, 0.08 * S], flat: true },
    );
    const sk = b.surface(skull);
    const C0 = P(0, 0.06, 0.03);

    // Upper muzzle, nose, freckles and fangs
    b.frustumBox(P(0, 0.09, 0), P(0, 0.19, -0.012), [0.1 * S, 0.074 * S], [0.075 * S, 0.052 * S], {
      bone: head,
      color: ale({ base: pal.muzzle, band: pal.accent, dot: pal.band, ring: pal.dot, size: 0.03, seed: spec.seed + 4, dir: [0, 1, 0] }),
    });
    hp(new THREE.SphereGeometry(1, 8, 6), C.ink, [0, 0.192, 0.004], { scale: [0.03 * S, 0.02 * S, 0.022 * S], flat: true });
    hp(new THREE.SphereGeometry(1, 5, 4), C.white, [0.008, 0.2, 0.014], { scale: [0.007 * S, 0.005 * S, 0.004 * S] });
    for (const s of [1, -1])
      for (let k = 0; k < 3; k++)
        hp(new THREE.SphereGeometry(0.0055 * S, 5, 4), C.ink, [s * (0.02 + k * 0.004), 0.125 + k * 0.022, 0.022 - k * 0.002]);
    for (const s of [1, -1])
      hp(new THREE.ConeGeometry(0.0085 * S, 0.022 * S, 4), C.white, [s * 0.036, 0.172, -0.046], { dir: [0, -1, 0], flat: true });

    // Lower jaw on its own joint
    const jaw = b.joint(`jaw_${id}`, {
      parent: head,
      at: P(0, 0.07, -0.04),
      aim: P(0, 0.18, -0.048),
      role: "jaw",
    });
    b.frustumBox(P(0, 0.08, -0.052), P(0, 0.178, -0.05), [0.086 * S, 0.03 * S], [0.066 * S, 0.026 * S], {
      bone: jaw,
      color: pal.jaw,
    });
    for (const s of [1, -1])
      b.part(new THREE.ConeGeometry(0.006 * S, 0.014 * S, 4), C.cream, {
        bone: jaw,
        at: P(s * 0.018, 0.165, -0.032),
        dir: [0, 1, 0],
        flat: true,
      });
    if (spec.tongue > 0) {
      const L = spec.tongue * S;
      b.extrude(
        O(
          [
            [-0.02, 0],
            [0.02, 0],
            [0.024, spec.tongue * 0.6],
            [0, spec.tongue],
            [-0.024, spec.tongue * 0.6],
          ],
          S,
        ),
        {
          at: P(0, 0.1, -0.034),
          x: [1, 0, 0],
          y: [0, 0, 1],
          thickness: 0.008 * S,
          bevel: 0.002,
          smoothing: 1,
          bone: jaw,
          color: paint((_p, _n, s) => (Math.abs(s[0]) < 0.0025 * S && s[1] > 0.02 * S && s[1] < L * 0.85 ? "#c21f3a" : "#ff4a5a")),
        },
      );
    }
    if (spec.open) b.pose(jaw, { axis: [1, 0, 0], deg: spec.open });

    // Floppy ears with inner panel, each on its own joint
    const earOutline: [number, number][] = [
      [-0.032, 0.012],
      [0.034, 0.012],
      [0.052, -0.03],
      [0.05, -0.09],
      [0.024, -0.135],
      [-0.016, -0.14],
      [-0.046, -0.1],
      [-0.05, -0.04],
    ];
    const earIn: [number, number][] = earOutline.map(([u, v]) => [u * 0.6, (v + 0.06) * 0.62 - 0.06]);
    for (const s of [1, -1]) {
      const sd = s > 0 ? "L" : "R";
      const root = P(s * 0.07, 0.03, 0.045);
      const ear = b.joint(`ear${sd}_${id}`, {
        parent: head,
        at: root,
        dir: V3(s * 0.4, 0, -1).normalize(),
        role: "hinge",
      });
      const ey = V3(-s * 0.3, 1, 0).normalize();
      b.extrude(O(earOutline, S), {
        at: root,
        x: [0, 0, 1],
        y: ey,
        thickness: 0.012 * S,
        bevel: 0.003,
        smoothing: 1,
        bone: ear,
        color: ale({ base: pal.band, band: pal.accent, dot: pal.dot, ring: pal.base, size: 0.03, seed: spec.seed + 6, dir: [0, 1, 0] }),
      });
      b.extrude(O(earIn, S), {
        at: root,
        x: [0, 0, 1],
        y: ey,
        thickness: 0.017 * S,
        smoothing: 1,
        bone: ear,
        color: pal.accent,
      });
    }

    // Eyes (conformed decals), brows, forehead emblem
    for (const s of [1, -1]) {
      const eh = sk.around(C0).at(s * 48 + yaw, 30);
      if (eh) b.decal(skull, spec.eye, { at: eh, dir: eh.n, size: [0.066 * S, 0.066 * S] });
      const bh = sk.around(C0).at(s * 44 + yaw, 60);
      if (bh) b.stick(new THREE.SphereGeometry(0.012 * S, 6, 4), pal.accent, bh, { scale: [2.4, 0.5, 0.9], spin: s * 18, flat: true });
    }
    const fh = sk.around(C0).at(yaw, 40);
    if (fh) b.decal(skull, spec.fore, { at: fh, dir: fh.n, size: [0.042 * S, 0.042 * S] });

    // Cheek fluff
    const cheek = sk.scatter(16, {
      rng: rng(spec.seed + 1),
      minDist: 0.028,
      filter: (h) => Math.abs(h.n.x) > 0.6 && h.n.y < 0.1,
    });
    if (cheek.length)
      b.cards(cheek, TUFT, {
        size: [0.032 * S, 0.052 * S],
        lean: 70,
        flow: [0, -0.4, -1],
        bend: 25,
        vary: 0.25,
        rng: rng(spec.seed + 1),
        color: pal.cheek,
      });

    return { head, P, hp, skull };
  };

  // Mid head: pink, happy, crest, lolling tongue
  const mid = buildHead({
    id: "mid",
    neck: [
      [0, 0.38, 0.17],
      [0, 0.46, 0.245],
      [0, 0.545, 0.3],
    ],
    dir: [0, 0.12, 1],
    S: 1.1,
    yaw: 0,
    pal: {
      base: C.pink,
      band: C.purple,
      accent: C.yellow,
      dot: C.cream,
      ring: C.yellow,
      muzzle: C.cream,
      jaw: C.purple,
      collar: C.yellow,
      bead: C.pink,
      cheek: C.cream,
    },
    eye: eyeTex(C.teal, C.yellow),
    fore: MARI,
    seed: 21,
    open: 14,
    tongue: 0.13,
  });
  {
    const { head, P } = mid;
    const S = 1.1;
    b.extrude(
      O(
        [
          [-0.01, 0],
          [0.105, 0],
          [0.105, 0.07],
          [0.09, 0.12],
          [0.075, 0.09],
          [0.055, 0.15],
          [0.035, 0.105],
          [0.015, 0.14],
          [-0.005, 0.1],
          [-0.012, 0.06],
        ],
        S,
      ),
      {
        at: P(0, 0, 0.04),
        x: head.dir([0, 1, 0]),
        y: head.dir([0, 0, 1]),
        thickness: 0.013 * S,
        bevel: 0.002,
        bone: head,
        color: paint((_p, _n, s) => (s[1] > 0.075 * S ? C.yellow : s[1] > 0.045 * S ? C.orange : C.violet)),
      },
    );
  }

  // Left head: violet, horned, cheeky blep
  const left = buildHead({
    id: "left",
    neck: [
      [0.06, 0.37, 0.15],
      [0.15, 0.43, 0.19],
      [0.225, 0.49, 0.22],
    ],
    dir: [0.28, 0.1, 1],
    S: 0.98,
    yaw: 16,
    pal: {
      base: C.violet,
      band: C.teal,
      accent: C.lime,
      dot: C.yellow,
      ring: C.pink,
      muzzle: C.sand,
      jaw: C.teal,
      collar: C.lime,
      bead: C.pink,
      cheek: C.sand,
    },
    eye: eyeTex(C.hot, C.sand),
    fore: SWIRL,
    seed: 33,
    open: 0,
    tongue: 0.115,
  });
  {
    const { head, P } = left;
    const S = 0.98;
    for (const s of [1, -1]) {
      b.sweep(
        catmull([
          P(s * 0.04, 0.05, 0.085),
          P(s * 0.075, 0.035, 0.125),
          P(s * 0.088, 0.005, 0.17),
          P(s * 0.07, -0.025, 0.21),
        ]),
        [0.021 * S, 0.003],
        {
          bone: head,
          color: C.lime,
          bands: [
            [0.3, C.lime],
            [0.5, C.pink],
            [0.7, C.lime],
            [0.85, C.pink],
            [1, C.cream],
          ],
          caps: { start: "flat", end: "point" },
          sides: 6,
        },
      );
    }
  }

  // Right head: orange, calm, flower crown
  const right = buildHead({
    id: "right",
    neck: [
      [-0.06, 0.37, 0.15],
      [-0.15, 0.43, 0.19],
      [-0.225, 0.49, 0.22],
    ],
    dir: [-0.28, 0.1, 1],
    S: 0.98,
    yaw: -16,
    pal: {
      base: C.orange,
      band: C.blue,
      accent: C.green,
      dot: C.cream,
      ring: C.yellow,
      muzzle: C.cream,
      jaw: C.blue,
      collar: C.green,
      bead: C.yellow,
      cheek: C.cream,
    },
    eye: eyeTex(C.green, C.yellow),
    fore: SUN,
    seed: 47,
    open: 0,
    tongue: 0,
  });
  {
    const { head, P } = right;
    const S = 0.98;
    const centre = P(0, 0.035, 0.112);
    const cols = [C.pink, C.yellow];
    cols.forEach((c, i) => {
      b.ring(
        frame(P(0, 0.035, 0.108 + i * 0.006), [0, 1, 0]),
        { count: 8 - i * 2, radius: (0.012 - i * 0.004) * S, tilt: 30 + i * 25 },
        (it) => {
          b.spike(it, it, (0.045 - i * 0.012) * S, (0.015 - i * 0.004) * S, { color: c, sides: 5, bone: head });
        },
      );
    });
    b.part(new THREE.SphereGeometry(0.014 * S, 6, 5), C.orange, { bone: head, at: P(0, 0.035, 0.126), flat: true });
    b.part(new THREE.SphereGeometry(0.006 * S, 5, 4), C.ink, { bone: head, at: P(0, 0.035, 0.139) });
    void centre;
  }

  return b.root;
}
```