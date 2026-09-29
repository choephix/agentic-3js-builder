// Highland cow. A deep barrel body lofted from rump to poll over hips, spine and neck joints, on four short, straight
// legs with split black hooves and dewclaws. The whole animal is thatched in SVG hair cards: body tufts that shingle
// back and down, a heavier mane on the neck, a long fringe under the belly, feathered legs, a forelock (the dossan)
// falling over the eyes, a beard under the jaw and a hairy fringe round each horizontal ear. The cards are tinted by
// the same ginger coat paint the skin under them carries, so the colour runs on through the gaps. Sweeping horns
// are painted from amber roots through ivory to dark tips; the flat muzzle carries an SVG nose pad with nostrils,
// the left ear wears a yellow SVG ear tag, and a sprig of heather and some grass (crossed SVG cards) hang from the
// corner of the mouth.
import { BoxGeometry, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import type { V3 } from "../src/math";
import { countershade, gradient, grain, mix, mottle, paint, smoothstep } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Chain } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Highland Cow",
  description:
    "A shaggy ginger Highland cow with sweeping horns, a forelock over its eyes, a yellow ear tag and heather in its mouth.",
  builtBy: "Claude Opus 5.5",
};

const RUST = "#8f4a22";
const GINGER = "#b8662f";
const FLAME = "#d9955a";
const DEEP = "#5e2c14";
const MUZZLE = "#3a2a24";
const HOOF_DARK = "#221c1a";
const HOOF_LIGHT = "#4a3d36";
const HORN_ROOT = "#b88a52";
const IVORY = "#efe4c8";
const HORN_TIP = "#2f2620";
const EAR_IN = "#d9a27a";
const EYE = "#1a110e";
const GLINT = "#fff6e8";

/** Root and tip greys of four strand layers; the coat paint tints them, so white is the full coat colour. */
type Shades = readonly (readonly [string, string])[];
const MID: Shades = [
  ["#6f6158", "#a8988a"],
  ["#978577", "#cdbcab"],
  ["#b9a797", "#eee0d0"],
  ["#d4c4b4", "#ffffff"],
];
const SUN: Shades = [
  ["#978577", "#d8c8b8"],
  ["#b9a797", "#f0e4d6"],
  ["#d4c4b4", "#ffffff"],
  ["#e6dccf", "#ffffff"],
];
const SHADE: Shades = [
  ["#4d4038", "#86766a"],
  ["#6a5a4f", "#a89684"],
  ["#8a796b", "#c9b8a6"],
  ["#a8978a", "#e6d8c8"],
];

/** Tapered, wavy strands fanning up from the bottom edge (the card root), darker strands behind lighter ones. */
function hairSvg(seed: number, w: number, h: number, strands: number, curl: number, spread: number, shades = MID) {
  const r = rng(seed);
  const defs = shades
    .map(
      ([root, tip], i) =>
        `<linearGradient id="g${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${root}"/><stop offset="1" stop-color="${tip}"/></linearGradient>`,
    )
    .join("");
  let body = "";
  for (let i = 0; i < strands; i++) {
    const shade = Math.min(shades.length - 1, Math.floor((i / strands) * shades.length + r() * 0.8));
    const x0 = w / 2 + (r() - 0.5) * w * 0.4;
    const x1 = x0 + (r() - 0.5) * w * spread;
    const len = h * (0.6 + 0.4 * r());
    const amp = curl * w * 0.06 * (0.5 + r());
    const freq = 1.2 + 1.3 * r();
    const phase = r() * Math.PI * 2;
    const half = w * (0.035 + 0.03 * r());
    const left: string[] = [];
    const right: string[] = [];
    const steps = 14;
    for (let k = 0; k <= steps; k++) {
      const s = k / steps;
      const cx = x0 + (x1 - x0) * s * s + amp * Math.sin(freq * Math.PI * 2 * s + phase) * s;
      const cy = h + 1 - s * (len + 1);
      const hw = half * (1 - s) ** 0.8 + 0.15;
      left.push(`${(cx - hw).toFixed(2)},${cy.toFixed(2)}`);
      right.push(`${(cx + hw).toFixed(2)},${cy.toFixed(2)}`);
    }
    body += `<path d="M${left.join(" L")} L${right.reverse().join(" L")}Z" fill="url(#g${shade})"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
}

const NOSE_SVG = `<svg viewBox="0 0 200 148">
  <defs>
    <radialGradient id="pad" cx="0.5" cy="0.38" r="0.62">
      <stop offset="0" stop-color="#6e5550"/><stop offset="0.65" stop-color="#46342f"/><stop offset="1" stop-color="#2a1e1b"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="74" rx="97" ry="71" fill="url(#pad)"/>
  <g fill="#8a706a" opacity="0.7">
    <circle cx="74" cy="34" r="5"/><circle cx="126" cy="30" r="4"/><circle cx="98" cy="22" r="3.5"/>
    <circle cx="114" cy="96" r="4"/><circle cx="86" cy="102" r="3"/><circle cx="78" cy="62" r="3"/>
    <circle cx="124" cy="60" r="3.5"/><circle cx="104" cy="46" r="2.5"/><circle cx="92" cy="80" r="3"/>
  </g>
  <path d="M100 30 C97 60 100 95 100 132" stroke="#1d1412" stroke-width="5" fill="none"/>
  <path d="M100 118 C 84 134 66 136 50 128" stroke="#1d1412" stroke-width="4" fill="none"/>
  <path d="M100 118 C 116 134 134 136 150 128" stroke="#1d1412" stroke-width="4" fill="none"/>
  <path d="M66 48 C 40 30 8 52 16 84 C 22 108 50 114 64 100 C 50 98 36 88 38 72 C 40 58 56 56 66 48 Z" fill="#9b7a74"/>
  <path d="M62 52 C 40 38 14 56 21 83 C 26 102 48 108 58 98 C 46 94 32 86 34 71 C 36 60 52 58 62 52 Z" fill="#0c0807"/>
  <path d="M134 48 C 160 30 192 52 184 84 C 178 108 150 114 136 100 C 150 98 164 88 162 72 C 160 58 144 56 134 48 Z" fill="#9b7a74"/>
  <path d="M138 52 C 160 38 186 56 179 83 C 174 102 152 108 142 98 C 154 94 168 86 166 71 C 164 60 148 58 138 52 Z" fill="#0c0807"/>
  <ellipse cx="84" cy="30" rx="16" ry="6" fill="#a8908a" opacity="0.5"/>
</svg>`;

/** A sprig of heather: a woody stem with side twigs, tiny green needles and purple bells up its top two thirds. */
function heatherSvg(seed: number) {
  const r = rng(seed);
  const bells = ["#b65aa0", "#9a4a8e", "#d284c4", "#7e3a78"];
  let twigs = "";
  let marks = "";
  const spots: [number, number][] = [];
  for (let y = 12; y < 80; y += 3.2) spots.push([20 + (r() - 0.5) * 5, y]);
  for (const [y0, dir] of [
    [72, -1],
    [58, 1],
    [44, -1],
    [34, 1],
  ] as const) {
    const x1 = 20 + dir * (9 + r() * 6);
    const y1 = y0 - 16 - r() * 8;
    twigs += `<path d="M20 ${y0} Q ${20 + dir * 4} ${y0 - 6} ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="#5a4030" stroke-width="1.6" fill="none"/>`;
    for (let k = 0.25; k <= 1; k += 0.2) spots.push([20 + (x1 - 20) * k, y0 + (y1 - y0) * k]);
  }
  for (const [x, y] of spots) {
    marks += `<path d="M${x.toFixed(1)} ${(y + 1).toFixed(1)} l${(r() * 4 - 2).toFixed(1)} 4" stroke="#55703c" stroke-width="1.1"/>`;
    const fill = bells[Math.floor(r() * bells.length)];
    marks += `<ellipse cx="${(x + (r() - 0.5) * 4).toFixed(1)}" cy="${y.toFixed(1)}" rx="2.3" ry="2.9" fill="${fill}"/>`;
  }
  const stem = `<path d="M20 110 C 19 80 22 50 19 6" stroke="#5a4030" stroke-width="2.4" fill="none"/>`;
  return `<svg viewBox="0 0 40 110">${stem}${twigs}${marks}</svg>`;
}

/** A few grass blades and a seed head fanning from one root. */
const GRASS_SVG = `<svg viewBox="0 0 40 110">
  <path d="M19 110 Q 16 60 6 14 Q 14 58 22 110 Z" fill="#7c9a3e"/>
  <path d="M20 110 Q 22 60 34 20 Q 26 62 23 110 Z" fill="#9bb452"/>
  <path d="M18 110 Q 20 70 17 30 Q 23 70 22 110 Z" fill="#6b8a34"/>
  <path d="M21 110 Q 24 70 28 4" stroke="#c8b66a" stroke-width="1.6" fill="none"/>
  <ellipse cx="28" cy="10" rx="2.6" ry="7" fill="#d8c47a"/>
</svg>`;

const TAG_SVG = `<svg viewBox="0 0 60 96">
  <circle cx="30" cy="10" r="8" fill="#e7b416" stroke="#9c7608" stroke-width="2"/>
  <circle cx="30" cy="10" r="3" fill="#6b5105"/>
  <path d="M22 16 L38 16 L40 26 L54 30 Q58 31 58 36 L58 86 Q58 94 50 94 L10 94 Q2 94 2 86 L2 36 Q2 31 6 30 L20 26 Z" fill="#f4c81f" stroke="#a37b08" stroke-width="2"/>
  <rect x="8" y="38" width="44" height="3" fill="#d9ad10"/>
  <text x="30" y="58" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#1a1a1a" text-anchor="middle">UK</text>
  <text x="30" y="84" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#111" text-anchor="middle">042</text>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "highlandCow" });
  const random = rng(17);

  // Textures: hair cut-outs (body tufts in three tones, long locks, short hair), the nose pad and the ear tag.
  const tuft = svg(hairSvg(11, 48, 128, 16, 1, 0.5), { size: 256 });
  const tuftSun = svg(hairSvg(12, 48, 128, 15, 1.2, 0.6, SUN), { size: 256 });
  const tuftShade = svg(hairSvg(13, 48, 128, 15, 1.1, 0.55, SHADE), { size: 256 });
  const tufts = [tuft, tuft, tuftSun, tuftShade];
  const lock = svg(hairSvg(23, 40, 160, 12, 1.5, 0.35), { size: 256 });
  const lockSun = svg(hairSvg(24, 40, 160, 12, 1.6, 0.4, SUN), { size: 256 });
  const locks = [lock, lockSun];
  const short = svg(hairSvg(37, 48, 80, 14, 0.5, 0.6), { size: 128 });
  const noseTex = svg(NOSE_SVG, { size: 256 });
  const tagTex = svg(TAG_SVG, { size: 256 });

  // Paints: sun-bleached ginger on top, deeper rust underneath; the skin under the hair runs a shade darker.
  const coat = countershade(
    mottle(GINGER, FLAME, { size: 0.45, seed: 2, contrast: 0.8 }),
    mottle(RUST, GINGER, { size: 0.3, seed: 5 }),
    { level: -0.3, soft: 0.5 },
  );
  const under = countershade(
    grain(mottle(RUST, GINGER, { size: 0.35, seed: 3 }), "#7c3a1a", { size: 0.025, axis: [0, 1, 0.3] }),
    DEEP,
    { level: -0.6, soft: 0.3 },
  );
  const hoof = grain(HOOF_DARK, HOOF_LIGHT, { size: 0.008, seed: 4 });

  // Body profile from rump to the back of the skull: centre, full width and full height.
  const stations = [
    { at: [0, 0.92, -0.9], w: 0.3, h: 0.28 },
    { at: [0, 0.9, -0.74], w: 0.5, h: 0.44 },
    { at: [0, 0.84, -0.46], w: 0.6, h: 0.58 },
    { at: [0, 0.8, -0.12], w: 0.68, h: 0.64 },
    { at: [0, 0.82, 0.2], w: 0.64, h: 0.62 },
    { at: [0, 0.84, 0.46], w: 0.52, h: 0.6 },
    { at: [0, 0.86, 0.66], w: 0.4, h: 0.5 },
    { at: [0, 0.94, 0.84], w: 0.32, h: 0.4 },
    { at: [0, 0.99, 0.96], w: 0.26, h: 0.3 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[2];
  const withersT = curve.knots[5];
  const hips = b.joint("hips", { at: stations[2].at, group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, withersT), {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
    group: "body",
  });
  const neck = b.chain("neck", curve.slice(withersT, 1), {
    parent: spine.joints[3],
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "body",
  });
  const body = b.loft(stations, { bone: [hips, spine, neck], color: under, sides: 10, group: "body" });

  // Tail: from the top of the rump, hanging clear behind the hocks.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.04, -0.86],
      [0, 1.02, -0.98],
      [0, 0.82, -1.03],
      [0, 0.58, -1.05],
      [0, 0.36, -1.06],
    ]),
    { parent: hips, count: 5, role: "tail", group: "tail" },
  );
  const tailTube = b.sweep(tail, (t) => 0.042 * (1 - t) + 0.016, { color: under, sides: 6, group: "tail" });

  // Legs: short and straight under the body, each ending in a pastern that sets into a split hoof.
  const legs: { chain: Chain; front: boolean }[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const front = b.chain(
      `legF${side}`,
      [
        [s * 0.19, 0.86, 0.44],
        [s * 0.2, 0.56, 0.36],
        [s * 0.19, 0.3, 0.4],
        [s * 0.19, 0.12, 0.42],
        [s * 0.19, 0.05, 0.48],
      ],
      {
        parent: spine.joints[3],
        names: ["shoulder", "elbow", "wrist", "frontFetlock"].map((n) => n + side),
        role: "leg",
        contact: [s * 0.19, 0, 0.47],
        group: `legF${side}`,
      },
    );
    const hind = b.chain(
      `legH${side}`,
      [
        [s * 0.2, 0.86, -0.5],
        [s * 0.23, 0.6, -0.36],
        [s * 0.2, 0.42, -0.62],
        [s * 0.2, 0.12, -0.58],
        [s * 0.2, 0.05, -0.52],
      ],
      {
        parent: hips,
        names: ["hip", "knee", "hock", "hindFetlock"].map((n) => n + side),
        role: "leg",
        contact: [s * 0.2, 0, -0.53],
        group: `legH${side}`,
      },
    );
    legs.push({ chain: front, front: true }, { chain: hind, front: false });
  }

  const legTubes = legs.map(({ chain, front }) => {
    const [, t1, t2, t3] = chain.ts;
    const keys: [number, number, number][] = front
      ? [
          [0, 0.1, 0.12],
          [t1, 0.075, 0.085],
          [t2, 0.05, 0.055],
          [t3, 0.046, 0.05],
          [1, 0.04, 0.045],
        ]
      : [
          [0, 0.12, 0.15],
          [t1, 0.085, 0.1],
          [t2, 0.05, 0.06],
          [t3, 0.046, 0.05],
          [1, 0.04, 0.045],
        ];
    const radius = (t: number): [number, number] => {
      let i = 0;
      while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
      const [ta, xa, ya] = keys[i];
      const [tb, xb, yb] = keys[i + 1];
      const e = smoothstep(ta, tb, t);
      return [xa + (xb - xa) * e, ya + (yb - ya) * e];
    };
    const tube = b.sweep(chain, radius, { color: under, sides: 7, caps: { start: "round", end: "flat" } });

    // Two claws of the cloven hoof, flat on the floor, and two dewclaws behind the fetlock.
    const fetlock = chain.joints[3];
    const toe = chain.at(1).at;
    const heel = fetlock.at;
    for (const dx of [-1, 1]) {
      const x = toe.x + dx * 0.027;
      // Flat on the floor; the front wall slopes back as the claw narrows toward the coronet.
      b.sweep(
        [
          [x, 0, toe.z - 0.012],
          [x, 0.078, toe.z - 0.012],
        ],
        (t) => [0.025 - 0.004 * t, 0.065 - 0.027 * t],
        { section: "box", caps: "flat", shift: (t) => [0, 0.022 * t], bone: fetlock, color: hoof, group: chain.name },
      );
      b.part(new SphereGeometry(0.017, 5, 3), HOOF_DARK, {
        bone: fetlock,
        at: [heel.x + dx * 0.022, 0.105, heel.z - 0.032],
        scale: [1, 0.8, 1.4],
        group: chain.name,
      });
    }
    return tube;
  });

  // Head: a region on the skull joint, +Z along the face, +Y out of the forehead, +X to the left.
  const headDir: V3 = [0, -0.6, 0.8];
  const skull = b.joint("head", { parent: neck.joints[1], at: curve.at(1), dir: headDir, role: "head", group: "head" });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  const face = gradient(coat, MUZZLE, head.p([0, 0, 0.39]), head.p([0, 0, 0.46]));
  const cranium = b.loft(
    [
      { at: head.p([0, 0.0, -0.08]), w: 0.24, h: 0.22 },
      { at: head.p([0, 0.01, 0.05]), w: 0.3, h: 0.22 },
      { at: head.p([0, -0.01, 0.17]), w: 0.24, h: 0.19 },
      { at: head.p([0, -0.025, 0.29]), w: 0.2, h: 0.18 },
      { at: head.p([0, -0.04, 0.4]), w: 0.22, h: 0.19 },
      { at: head.p([0, -0.045, 0.46]), w: 0.21, h: 0.16 },
    ],
    { bone: skull, color: face, sides: 10, caps: { start: "round", end: "flat" }, group: "head" },
  );
  // The flat, dark nose pad with nostrils, drawn in SVG, on the flat front of the muzzle.
  b.part(new PlaneGeometry(0.2, 0.148), "#ffffff", {
    texture: noseTex,
    bone: skull,
    at: head.p([0, -0.045, 0.463]),
    dir: head.d([0, 0, 1]),
    axis: "z",
    up: head.d([0, 1, 0]),
    group: "head",
  });

  // Lower jaw, separate so the mouth opens.
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.09, 0.05],
    aim: [0, -0.12, 0.42],
    role: "jaw",
    group: "jaw",
  });
  const jawTube = b.loft(
    [
      { at: head.p([0, -0.085, 0.02]), w: 0.2, h: 0.1 },
      { at: head.p([0, -0.115, 0.22]), w: 0.16, h: 0.09 },
      { at: head.p([0, -0.125, 0.41]), w: 0.17, h: 0.07 },
    ],
    { bone: jaw, color: gradient(coat, MUZZLE, head.p([0, 0, 0.36]), head.p([0, 0, 0.44])), sides: 8, group: "jaw" },
  );

  // Eyes, set into the face by ray, a glint on each; the forelock falls over them.
  const faceSkin = b.surface(cranium);
  for (const s of [1, -1]) {
    const socket = faceSkin.ray(head.p([s * 0.4, 0.03, 0.12]), head.d([-s, 0, 0]));
    if (!socket) throw new Error("highlandCow: no face under the eye");
    const eye = b.part(new SphereGeometry(0.024, 7, 5), EYE, {
      bone: skull,
      at: socket.at,
      dir: socket.n,
      scale: [1, 0.7, 1.2],
      group: "head",
    });
    b.part(new SphereGeometry(0.006, 4, 3), GLINT, {
      bone: skull,
      at: eye.local([0.006, 0.014, 0.012]),
      group: "head",
    });
  }

  // Horns: out sideways and a little forward from the poll, then sweeping up; amber roots, ivory, dark tips.
  for (const s of [1, -1]) {
    const base = head.p([s * 0.1, 0.07, -0.03]);
    const tip = base.clone().add(new Vector3(s * 0.46, 0.3, 0.02));
    const path = bezier(
      base,
      base.clone().add(new Vector3(s * 0.22, -0.04, 0.06)),
      base.clone().add(new Vector3(s * 0.4, 0.04, 0.08)),
      tip,
    );
    const along = tip.clone().sub(base);
    const len2 = along.lengthSq();
    const hornPaint = paint((p) => {
      const t = Math.min(Math.max(p.clone().sub(base).dot(along) / len2, 0), 1);
      const body =
        t < 0.5 ? mix(HORN_ROOT, IVORY, smoothstep(0, 0.5, t)) : mix(IVORY, HORN_TIP, smoothstep(0.72, 1, t));
      const ridge = t < 0.3 ? smoothstep(0.55, 0.95, Math.sin(t * 150)) * (1 - t / 0.3) : 0;
      return mix(body, "#7a5a3a", ridge * 0.45);
    });
    b.sweep(path, (t) => 0.048 * (1 - t) ** 0.7 + 0.006, {
      bone: skull,
      color: hornPaint,
      sides: 6,
      caps: { start: "flat", end: "point" },
      extend: [0.04, 0],
      group: "head",
    });
  }

  // Ears: horizontal leaves under the horns, pale inside, each on its own hinge joint.
  const earOutline: [number, number][] = [
    [0, -0.035],
    [0.075, -0.062],
    [0.16, -0.045],
    [0.21, 0],
    [0.16, 0.05],
    [0.075, 0.068],
    [0, 0.04],
  ];
  const ears = [1, -1].map((s) => {
    const earDir = new Vector3(s, -0.25, -0.12).normalize();
    const earUp = new Vector3(0, 0.55, 1).normalize();
    const inward = earDir.clone().cross(earUp).normalize();
    if (inward.y > 0) inward.negate();
    const earJoint = head.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: skull,
      at: [s * 0.12, -0.02, -0.05],
      dir: earDir,
      role: "hinge",
      group: "head",
    });
    const ear = b.extrude(earOutline, {
      at: earJoint.at,
      x: earDir,
      y: earUp,
      thickness: 0.018,
      bevel: 0.006,
      smoothing: 1,
      detail: 0.34,
      color: paint((_p, n) => (n.dot(inward) > 0.5 ? EAR_IN : coat)),
      bone: earJoint,
      group: "head",
    });
    // A fringe of hair round the rim, radiating out of the leaf.
    const rim = catmull(
      earOutline.map(([u, v]) => ear.local([u, v, 0])),
      { closed: true },
    );
    const centre = ear.local([0.1, 0, 0]);
    const fringe = Array.from({ length: 34 }, (_, i) => {
      const p = rim.at((i + 0.5) / 34);
      return frame(p, p.clone().sub(centre));
    }).filter((f) => f.at.distanceTo(earJoint.at) > 0.045);
    b.cards(fringe, [lock, tuftSun], {
      size: [0.06, 0.13],
      lean: 25,
      flow: [0, -1, 0],
      bend: 30,
      vary: 0.25,
      spin: 20,
      rng: random,
      color: coat,
      bone: earJoint,
      group: "head",
    });
    // Hair over both faces of the leaf, combed out toward the tip.
    b.cards(b.surface(ear).scatter(40, { rng: rng(60 + s), minDist: 0.018 }), short, {
      size: [0.05, 0.08],
      lean: 65,
      bend: 20,
      flow: earDir,
      vary: 0.2,
      spin: 25,
      rng: rng(62 + s),
      color: coat,
      bone: earJoint,
      group: "head",
    });
    return { s, ear, earJoint };
  });

  // A yellow tag clipped through the left ear, hanging below the fringe.
  {
    const { ear, earJoint, s } = ears[0];
    const hole = ear.local([0.12, 0, 0]);
    b.part(new BoxGeometry(0.06, 0.096, 0.004), "#ffffff", {
      texture: tagTex,
      bone: earJoint,
      at: [hole.x, hole.y - 0.045, hole.z + 0.012],
      dir: [0, 1, 0],
      up: [s * 0.35, 0, 1],
      group: "head",
    });
  }

  // Hair. Body tufts shingle down from a parting along the spine; the neck mane and belly fringe hang longer.
  const bodyHits = b.surface(body).scatter(950, { rng: rng(3), minDist: 0.033 });
  const back: [typeof bodyHits, typeof bodyHits] = [[], []];
  const flank: [typeof bodyHits, typeof bodyHits] = [[], []];
  const mane: [typeof bodyHits, typeof bodyHits] = [[], []];
  const fringe: typeof bodyHits = [];
  for (const hit of bodyHits) {
    if (hit.at.z > 0.9) continue;
    const side = hit.at.x >= 0 ? 0 : 1;
    if (hit.n.y < -0.45) fringe.push(hit);
    else if (hit.at.z > 0.5) mane[side].push(hit);
    else if (hit.n.y > 0.8) back[side].push(hit);
    else flank[side].push(hit);
  }
  [1, -1].forEach((s, i) => {
    b.cards(back[i], tufts, {
      size: [0.085, 0.18],
      lean: 74,
      bend: 25,
      flow: [s * 0.7, -1, -0.4],
      vary: 0.3,
      spin: 25,
      rng: rng(50 + i),
      color: coat,
      group: "body",
    });
    b.cards(flank[i], tufts, {
      size: [0.085, 0.18],
      lean: 55,
      bend: 40,
      flow: [s * 0.7, -1, -0.4],
      vary: 0.3,
      spin: 25,
      rng: rng(5 + i),
      color: coat,
      group: "body",
    });
    b.cards(mane[i], [...locks, tuftSun], {
      size: [0.09, 0.24],
      lean: 55,
      bend: 45,
      flow: [s * 0.7, -1, -0.1],
      vary: 0.3,
      spin: 25,
      rng: rng(7 + i),
      color: coat,
      group: "body",
    });
  });
  b.cards(fringe, [lock, tuftShade], {
    size: [0.08, 0.24],
    lean: 20,
    bend: 25,
    flow: [0, -1, -0.2],
    vary: 0.3,
    spin: 30,
    rng: rng(9),
    color: coat,
    group: "body",
  });

  // Feathered legs: long hair above the knee and hock, shorter down the cannon, none on the pastern.
  legTubes.forEach((tube, i) => {
    const { chain } = legs[i];
    const hits = b.surface(tube).scatter(130, { rng: rng(20 + i), minDist: 0.028 });
    const upper = hits.filter((h) => h.at.y > 0.34 && h.at.y < 0.8);
    const lower = hits.filter((h) => h.at.y > 0.15 && h.at.y <= 0.34);
    b.cards(upper, tufts, {
      size: [0.07, 0.15],
      lean: 40,
      bend: 35,
      flow: [0, -1, 0],
      vary: 0.3,
      spin: 25,
      rng: rng(30 + i),
      color: coat,
      group: chain.name,
    });
    b.cards(lower, short, {
      size: [0.065, 0.085],
      lean: 40,
      bend: 25,
      flow: [0, -1, 0],
      vary: 0.25,
      spin: 25,
      rng: rng(40 + i),
      color: coat,
      group: chain.name,
    });
  });

  // Tail: a short coat down the dock, then a long switch.
  const tailHits = b.surface(tailTube).scatter(90, { rng: rng(10), minDist: 0.012 });
  b.cards(
    tailHits.filter((h) => h.at.y > 0.62),
    short,
    { size: [0.05, 0.07], lean: 50, bend: 20, flow: [0, -1, 0], vary: 0.2, rng: rng(11), color: coat, group: "tail" },
  );
  const switchFrames = [
    ...tailHits.filter((h) => h.at.y <= 0.62),
    ...[0, 72, 144, 216, 288].map((deg) => tailTube.at(0.97, deg)),
  ];
  b.cards(switchFrames, locks, {
    size: [0.07, 0.24],
    lean: 70,
    bend: 15,
    flow: [0, -1, 0],
    cross: true,
    vary: 0.25,
    spin: 20,
    rng: rng(12),
    color: coat,
    group: "tail",
  });

  // Head hair: the dossan falls forward over the eyes; short hair on the cheeks and down the face to the nose
  // leather; a beard under the jaw.
  const up = head.d([0, 1, 0]);
  const fwd = head.d([0, 0, 1]);
  const local = (p: Vector3) => {
    const rel = p.clone().sub(skull.at);
    return { y: rel.dot(up), z: rel.dot(fwd) };
  };
  const headHits = faceSkin.scatter(320, { rng: rng(13), minDist: 0.02 });
  const forelock = headHits.filter((h) => {
    const q = local(h.at);
    return q.y > 0.01 && q.z < 0.24;
  });
  const cheeks = headHits.filter((h) => {
    const q = local(h.at);
    return q.y <= 0.01 && q.z < 0.22;
  });
  const bridge = headHits.filter((h) => {
    const q = local(h.at);
    return q.z >= 0.22 && q.z < 0.4 && q.y > -0.1;
  });
  b.cards(forelock, [...locks, tuftSun], {
    size: [0.085, 0.27],
    lean: 70,
    bend: 25,
    flow: head.d([0, -0.35, 1]),
    vary: 0.25,
    spin: 30,
    rng: rng(14),
    color: coat,
    bone: skull,
    group: "head",
  });
  b.cards(cheeks, short, {
    size: [0.06, 0.09],
    lean: 60,
    bend: 25,
    flow: [0, -1, -0.4],
    vary: 0.25,
    spin: 25,
    rng: rng(15),
    color: coat,
    bone: skull,
    group: "head",
  });
  b.cards(bridge, short, {
    size: [0.05, 0.06],
    lean: 75,
    bend: 15,
    flow: fwd,
    vary: 0.2,
    spin: 20,
    rng: rng(16),
    color: coat,
    bone: skull,
    group: "head",
  });
  const jawHits = b.surface(jawTube).scatter(110, { rng: rng(17), minDist: 0.018 });
  const beard = jawHits.filter((h) => local(h.at).y < -0.13 && local(h.at).z < 0.34);
  const jowls = jawHits.filter((h) => local(h.at).y >= -0.13 && local(h.at).z < 0.34);
  b.cards(jowls, short, {
    size: [0.05, 0.08],
    lean: 60,
    bend: 20,
    flow: [0, -1, -0.4],
    vary: 0.2,
    spin: 25,
    rng: rng(19),
    color: coat,
    bone: jaw,
    group: "jaw",
  });
  b.cards(beard, locks, {
    size: [0.06, 0.15],
    lean: 25,
    bend: 20,
    flow: [0, -1, -0.3],
    vary: 0.25,
    spin: 25,
    rng: rng(18),
    color: coat,
    bone: jaw,
    group: "jaw",
  });

  // A sprig of heather and a few grass blades poking out of the left corner of the mouth.
  const corner = head.p([0.06, -0.105, 0.38]);
  b.cards([frame(corner, head.d([1, 0.15, 0.55]))], svg(heatherSvg(41), { size: 256 }), {
    size: [0.09, 0.26],
    cross: true,
    sink: 0.25,
    bone: jaw,
    group: "jaw",
  });
  b.cards([frame(corner, head.d([0.9, -0.5, 0.7]))], svg(GRASS_SVG, { size: 128 }), {
    size: [0.07, 0.2],
    cross: true,
    bend: 25,
    flow: [0, -1, 0],
    sink: 0.3,
    bone: jaw,
    group: "jaw",
  });

  return b.root;
}
