```ts
// STYLE: CLOISONNÉ ENAMEL. The lion dance costume is treated as a jewelled enamel object: every large surface is
// a mosaic of domed, jewel-toned enamel cells (vermilion, jade, cobalt, saffron) separated by raised gilt wire,
// with gold-outlined drawn fur blades, gilt-ringed eyes, a glowing bagua mirror and gold-wire medallions.
// Palette is flat saturated enamel plus gold; no soft or realistic shading anywhere.

import * as THREE from "three";
import {
  createBuilder,
  frame,
  line,
  lerp,
  offset,
  rng,
  catmull,
  bezier,
  limb,
  paint,
  cells,
  noise,
  mix,
  smoothstep,
  rgb,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cloisonné Lion Dance Leap",
  description:
    "A Southern lion dance costume mid-leap, rendered as cloisonné enamel: jewel-toned domed cells divided by gilt wire, a mirrored horned head with an opening jaw, fur blades, tassel hem and two dancers' legs caught in a stride.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const VERM = "#d9261c";
const DEEP = "#8f1219";
const SAFFRON = "#f39a1e";
const PINK = "#ec5b8e";
const JADE = "#10a37c";
const TEAL = "#0e8c9a";
const COBALT = "#1f43a8";
const INDIGO = "#161f5e";
const IVORY = "#f7f0da";
const GOLD = "#e9b23a";
const GOLD_L = "#ffe38f";
const GOLD_D = "#a4701a";
const INK = "#1b0e12";
const CYAN = "#a4ecff";

// ---------------------------------------------------------------------------------------------------------------
// Cloisonné paint: domed enamel cells (Worley) inside gilt wire borders.
function enamel(colors: readonly string[], size: number, seed: number, gap = 0.1) {
  const cols = colors.map((c) => rgb(c));
  return paint((p, n) => {
    const c = cells(p, size, seed);
    const e = c.d2 - c.d1;
    const lit = smoothstep(-0.7, 0.9, n.y);
    if (e < gap) return mix(GOLD_D, GOLD_L, 0.22 + 0.62 * lit * (0.75 + 0.25 * Math.min(1, e / gap * 2)));
    const base = cols[Math.min(Math.floor(c.id * cols.length), cols.length - 1)];
    const dome = 1 - Math.min(c.d1, 1);
    const k = 0.7 + 0.42 * lit;
    const sh: [number, number, number] = [
      Math.min(1, base[0] * k),
      Math.min(1, base[1] * k * 0.98),
      Math.min(1, base[2] * (k + 0.06)),
    ];
    let col = mix(sh, "#ffffff", 0.22 * dome * dome * (0.4 + 0.6 * lit));
    const edge = smoothstep(gap + 0.16, gap, e);
    col = mix(col, [sh[0] * 0.45, sh[1] * 0.45, sh[2] * 0.5], edge * 0.45);
    return col;
  });
}

const GOLDP = paint((p, n) =>
  mix(GOLD_D, GOLD_L, Math.min(1, 0.2 + 0.55 * smoothstep(-0.4, 0.9, n.y) + 0.25 * noise(p, 0.03, 3))),
);

const HEAD_E = enamel([VERM, VERM, DEEP, SAFFRON, PINK, VERM], 0.085, 1);
const MUZZLE_E = enamel([IVORY, SAFFRON, GOLD_L, PINK, IVORY], 0.06, 2);
const BODY_E = enamel([TEAL, JADE, JADE, COBALT, INDIGO, TEAL, VERM], 0.12, 3, 0.085);
const LEG_E = enamel([VERM, SAFFRON, DEEP, VERM], 0.06, 4);
const BOOT_E = enamel([INDIGO, COBALT, TEAL], 0.05, 5);
const JAW_E = enamel([VERM, DEEP, SAFFRON, VERM], 0.07, 6);
const EAR_E = enamel([JADE, TEAL, JADE], 0.04, 7, 0.12);
const TAIL_E = enamel([JADE, TEAL, COBALT, JADE], 0.07, 8);
const NECK_E = enamel([TEAL, COBALT, JADE], 0.08, 9);

// ---------------------------------------------------------------------------------------------------------------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lion_dance_leap", paintSize: 2048 });
  const rnd = rng(7);

  const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const unit = (v: THREE.Vector3) => v.clone().normalize();

  // -------------------------------------------------------------------------------------------------------------
  // Textures (cloisonné drawings: fills outlined in gilt wire)
  const flame = (root: string, tip: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${root}"/><stop offset="1" stop-color="${tip}"/></linearGradient></defs>
      <path d="M20 79 C4 62 3 30 20 2 C37 30 36 62 20 79Z" fill="url(#g)" stroke="${GOLD}" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M20 74 C20 50 20 30 20 12" stroke="${vein}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M20 62 C13 54 11 46 12 36 M20 62 C27 54 29 46 28 36" stroke="${vein}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,
      { size: 128 },
    );
  const FUR_RED = flame(DEEP, SAFFRON, GOLD_L);
  const FUR_GOLD = flame(SAFFRON, GOLD_L, GOLD_D);
  const FUR_JADE = flame(TEAL, "#7fe6bd", GOLD_L);
  const FUR_WHITE = flame("#f6efd8", "#cdeee4", GOLD);

  const strands = [3, 9, 15, 21, 27];
  const TASSEL = svg(
    `<svg viewBox="0 0 30 90" xmlns="http://www.w3.org/2000/svg">
      <g stroke-linecap="round" fill="none">
        ${strands.map((x) => `<path d="M15 78 C15 50 ${x} 30 ${x} 4" stroke="${GOLD}" stroke-width="6.5"/>`).join("")}
        ${strands.map((x) => `<path d="M15 78 C15 50 ${x} 30 ${x} 4" stroke="${VERM}" stroke-width="3.2"/>`).join("")}
      </g>
      <circle cx="15" cy="80" r="7.5" fill="${SAFFRON}" stroke="${GOLD}" stroke-width="2.6"/>
      <rect x="11" y="85" width="8" height="5" fill="${GOLD}"/>
    </svg>`,
    { size: 128 },
  );

  const IRIS = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="i" cx="0.4" cy="0.4" r="0.7"><stop offset="0" stop-color="#ffd25a"/><stop offset="1" stop-color="${SAFFRON}"/></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill="${GOLD}"/>
      <circle cx="50" cy="50" r="40" fill="url(#i)"/>
      <g stroke="${GOLD_D}" stroke-width="1.8" stroke-linecap="round">
        ${Array.from({ length: 12 }, (_, k) => `<path d="M50 50 L${(50 + 38 * Math.cos((k * Math.PI) / 6)).toFixed(1)} ${(50 + 38 * Math.sin((k * Math.PI) / 6)).toFixed(1)}"/>`).join("")}
      </g>
      <circle cx="50" cy="50" r="19" fill="${INK}" stroke="${GOLD}" stroke-width="3"/>
      <circle cx="38" cy="36" r="9" fill="#ffffff"/>
      <circle cx="62" cy="64" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  const bits = ["111", "011", "101", "001", "110", "010", "100", "000"];
  const MIRROR = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="${GOLD}"/>
      ${bits
        .map((bt, k) => {
          const bars = [7, 12, 17]
            .map((y, j) =>
              bt[j] === "1"
                ? `<rect x="42" y="${y}" width="16" height="3" fill="${INK}"/>`
                : `<rect x="42" y="${y}" width="6.4" height="3" fill="${INK}"/><rect x="51.6" y="${y}" width="6.4" height="3" fill="${INK}"/>`,
            )
            .join("");
          return `<g transform="rotate(${k * 45} 50 50)">${bars}</g>`;
        })
        .join("")}
      <circle cx="50" cy="50" r="30" fill="${CYAN}" stroke="${GOLD_D}" stroke-width="2.5"/>
      <path d="M26 40 Q34 26 50 24" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="15" fill="#ffffff" stroke="${GOLD}" stroke-width="2"/>
      <path d="M50 35 A15 15 0 0 1 50 65 A7.5 7.5 0 0 1 50 50 A7.5 7.5 0 0 0 50 35Z" fill="${TEAL}"/>
      <circle cx="50" cy="42.5" r="2.4" fill="#ffffff"/><circle cx="50" cy="57.5" r="2.4" fill="${TEAL}"/>
    </svg>`,
    { size: 192 },
  );

  const CLOUD = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 70 C6 70 4 52 18 50 C16 36 34 30 42 40 C48 26 72 28 72 44 C88 42 94 62 80 70 Z" fill="${TEAL}" stroke="${GOLD}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M30 58 C26 49 37 45 39 53 C40 59 33 61 32 56" stroke="${GOLD_L}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M58 54 C54 45 66 41 68 49 C69 55 62 57 61 52" stroke="${GOLD_L}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M18 70 Q8 82 24 86 Q36 88 40 78" stroke="${GOLD}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M20 70 Q12 80 24 83" stroke="${JADE}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const MEDAL = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="${COBALT}" stroke="${GOLD}" stroke-width="5"/>
      <circle cx="50" cy="50" r="37" fill="none" stroke="${GOLD_L}" stroke-width="2.4"/>
      ${Array.from({ length: 8 }, (_, k) => `<ellipse cx="50" cy="27" rx="8" ry="14" transform="rotate(${k * 45} 50 50)" fill="${k % 2 ? IVORY : SAFFRON}" stroke="${GOLD}" stroke-width="2.6"/>`).join("")}
      <circle cx="50" cy="50" r="12" fill="${VERM}" stroke="${GOLD}" stroke-width="3.4"/>
      <rect x="45" y="45" width="10" height="10" fill="${GOLD_L}" stroke="${GOLD_D}" stroke-width="1.6"/>
    </svg>`,
    { size: 256 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 1.52, -1.0], dir: [0, 0, 1], role: "spine" });
  const bodyPath = catmull([
    [0, 1.5, -1.35],
    [0, 1.52, -1.0],
    [0, 1.62, -0.45],
    [0, 1.82, 0.05],
    [0, 1.98, 0.42],
  ]);
  const rootT = bodyPath.closestT(hips.at);
  const spine = b.chain("spine", bodyPath.slice(rootT, 1), { parent: hips, count: 4, role: "spine" });
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.98, 0.42],
      [0, 2.1, 0.55],
      [0, 2.2, 0.66],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.2, 0.66], dir: [0, 0.28, 1], role: "head" });
  // head-space helper: l = toward the model's left, f = forward along the head, u = up
  const hp = (l: number, f: number, u: number) => head.local([-l, f, u]);
  const jaw = b.joint("jaw", { parent: head, at: hp(0, 0.02, -0.1), aim: hp(0, 0.6, -0.1), role: "jaw" });

  const hpart = (geo: THREE.BufferGeometry, color: any, l: number, f: number, u: number, o: any = {}) => {
    const opts: any = { bone: head, at: hp(l, f, u), ...o };
    if (!o.dir && !o.aim && !o.quat && !o.rotation) opts.quat = head.quat;
    return b.part(geo, color, opts);
  };

  // -------------------------------------------------------------------------------------------------------------
  // Body cloth
  const key = (arr: number[]) => (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (arr.length - 1);
    const i = Math.min(Math.floor(x), arr.length - 2);
    return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
  };
  const rxF = key([0.2, 0.36, 0.42, 0.43, 0.38, 0.3]);
  const ryF = key([0.22, 0.34, 0.42, 0.44, 0.38, 0.3]);
  const body = b.sweep(bodyPath, (t) => [rxF(t), ryF(t)], {
    bone: [spine, hips],
    color: BODY_E,
    shift: [0, -0.12],
    sides: 10,
    smooth: false,
  });
  const skin = b.surface(body);
  b.sweep(
    catmull([
      [0, 1.98, 0.42],
      [0, 2.1, 0.55],
      [0, 2.2, 0.66],
    ]),
    [0.27, 0.22],
    { bone: neck, color: NECK_E, sides: 8, smooth: false },
  );

  const sideAng = (s: number) => -s * 90;

  // gilt sashes round the body
  for (const t of [0.3, 0.55, 0.82]) {
    const lp = skin.loop(frame(bodyPath.at(t), bodyPath.tangentAt(t)), { lift: 0.012 });
    b.sweep(lp, 0.016, { color: GOLDP, sides: 6, smooth: false });
  }
  // hem trim and tassel fringe
  for (const s of [1, -1]) {
    b.sweep(body.line(s * 125, 0.008), 0.02, { bone: [spine, hips], color: GOLDP, sides: 6, smooth: false });
  }
  const fringe = (t0: number, t1: number, bone: any) => {
    const frames: ReturnType<typeof frame>[] = [];
    const n = 10;
    for (const s of [1, -1])
      for (let i = 0; i < n; i++) {
        const t = t0 + ((t1 - t0) * (i + 0.5)) / n;
        frames.push(frame(body.at(t, s * 126, 0.0).at, [0, 1, 0]));
      }
    b.cards(frames, TASSEL, { size: [0.075, 0.22], lean: 180, flow: [0, 0, 1], bone, vary: 0.15, rng: rnd, sink: 0.05 });
  };
  fringe(0.02, 0.36, hips);
  fringe(0.36, 0.68, spine.joints[1]);
  fringe(0.68, 0.98, spine.joints[3]);

  // dorsal pom-poms
  b.along(body, 8, (at) => {
    const k = Math.round(at.t * 8) % 3;
    b.stick(ball(0.065, 7, 5), k === 0 ? VERM : k === 1 ? IVORY : JADE, at, { embed: 0.3, flat: true });
    b.stick(cyl(0.03, 0.045, 0.03, 6), GOLDP, at, { embed: 0.6 });
  });
  // gilt coin bosses
  for (const hit of skin.scatter(16, { rng: rng(5), minDist: 0.2, filter: (h) => h.n.y > -0.1 && Math.abs(h.n.y) < 0.8 })) {
    b.stick(cyl(0.042, 0.042, 0.016, 10), GOLDP, hit, { embed: 0.45 });
    b.stick(new THREE.BoxGeometry(0.026, 0.02, 0.026), INK, hit, { embed: 0.25 });
  }
  // fur blades along the back
  const backHits = skin.scatter(70, { rng: rng(9), minDist: 0.1, filter: (h) => h.n.y > 0.5 });
  b.cards(backHits, [FUR_RED, FUR_GOLD, FUR_JADE, FUR_RED], {
    size: [0.1, 0.2],
    lean: 50,
    bend: 20,
    vary: 0.3,
    spin: 12,
    rng: rnd,
  });
  // flank emblems
  for (const s of [1, -1]) {
    b.decal(body, MEDAL, { at: body.at(0.5, sideAng(s)).at, dir: [s, 0, 0], size: [0.4, 0.4], segments: 8 });
    for (const t of [0.2, 0.8])
      b.decal(body, CLOUD, { at: body.at(t, sideAng(s)).at, dir: [s, 0, 0], size: [0.3, 0.28], mirror: s < 0, segments: 8 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.52, -1.0],
      [0, 1.55, -1.5],
      [0, 1.78, -1.85],
      [0, 2.1, -1.95],
      [0, 2.4, -1.8],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.11, 0.045], { color: TAIL_E, sides: 8, smooth: false });
  b.cards(b.surface(tailTube).scatter(28, { rng: rng(12), minDist: 0.08 }), [FUR_JADE, FUR_GOLD, FUR_RED], {
    size: [0.1, 0.22],
    lean: 45,
    bend: 25,
    rng: rnd,
    vary: 0.25,
  });
  const tailEnd = tail.at(1);
  const plume = b.ring(tailEnd, { count: 12, radius: 0.03, tilt: 25 }).items;
  b.cards(plume, [FUR_RED, FUR_GOLD, FUR_RED, FUR_WHITE], {
    size: [0.17, 0.46],
    lean: 15,
    bend: 40,
    rng: rnd,
    vary: 0.25,
    spin: 15,
  });
  b.part(ball(0.06, 7, 5), GOLDP, { bone: tail.joints[3], at: tailEnd.at, flat: true });

  // -------------------------------------------------------------------------------------------------------------
  // Dancers' legs
  const leg = (tag: string, parent: any, pts: THREE.Vector3[], toe: [number, number, number], sole: any) => {
    const chain = b.chain(`leg${tag}`, pts, {
      parent,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
      role: "leg",
    });
    b.sweep(chain, [0.115, 0.098, 0.088, 0.078], { color: LEG_E, sides: 8, smooth: false });
    const ankle = chain.joints[2];
    const knee = chain.joints[1];
    // fur cuffs at knee and ankle
    b.cards(b.ring(knee, { count: 9, radius: 0.09, tilt: 35 }).items, [FUR_GOLD, FUR_RED], {
      size: [0.07, 0.16],
      lean: 30,
      flow: [0, -1, 0],
      rng: rnd,
    });
    b.cards(b.ring(ankle, { count: 10, radius: 0.08, tilt: 40 }).items, [FUR_RED, FUR_GOLD, FUR_WHITE], {
      size: [0.07, 0.17],
      lean: 40,
      flow: [0, -1, 0],
      rng: rnd,
    });
    // boot
    const d = unit(new THREE.Vector3(toe[0], toe[1], toe[2]).sub(ankle.at));
    const len = 0.36;
    b.part(new THREE.BoxGeometry(0.13, len, 0.1), sole, {
      bone: ankle,
      at: offset(ankle.at, d, len * 0.38),
      dir: d,
      flat: true,
    });
    const tip = offset(ankle.at, d, len * 0.38 + len / 2);
    b.part(ball(0.07, 7, 5), GOLDP, { bone: ankle, at: offset(tip, d, -0.03), scale: [1.1, 1, 0.9], flat: true });
    for (const x of [-0.04, 0, 0.04])
      b.spike(offset(tip, [1, 0, 0], x), d, 0.075, 0.02, { bone: ankle, color: IVORY, sides: 5, smooth: false });
    return chain;
  };

  // rear dancer: right leg pushes off the floor, left leg kicks back
  const hipRL = new THREE.Vector3(0.13, 0.95, -0.95);
  const hipRR = new THREE.Vector3(-0.13, 0.95, -0.95);
  leg(
    "RL",
    hips,
    limb(hipRL, [0.18, 1.1, -1.75], [0.46, 0.46], [[0, -1, -0.2]]),
    [0.2, 0.98, -2.0],
    BOOT_E,
  );
  leg(
    "RR",
    hips,
    limb(hipRR, [-0.14, 0.3, -1.22], [0.46, 0.46], [[0, 0, 1]]),
    [-0.14, 0.04, -1.04],
    BOOT_E,
  );
  // front dancer: left leg strides out, right knee driven up
  leg(
    "FL",
    spine.joints[3],
    limb([0.14, 1.4, 0.3], [0.2, 0.88, 0.95], [0.45, 0.45], [[0, 0, 1]]),
    [0.22, 0.72, 1.2],
    BOOT_E,
  );
  leg(
    "FR",
    spine.joints[3],
    limb([-0.14, 1.4, 0.3], [-0.2, 1.0, 0.55], [0.45, 0.45], [[0, 0.3, 1]]),
    [-0.2, 0.78, 0.62],
    BOOT_E,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Head: skull, forehead, muzzle
  const skull = hpart(ball(1, 12, 8), HEAD_E, 0, 0.2, 0.1, { scale: [0.38, 0.36, 0.31], flat: true });
  hpart(ball(1, 10, 7), HEAD_E, 0, 0.38, 0.34, { scale: [0.26, 0.18, 0.14], flat: true });

  b.frustumBox(hp(0, 0.4, 0.02), hp(0, 0.84, 0.03), [0.54, 0.17], [0.46, 0.15], { bone: head, color: MUZZLE_E });
  // mouth interior
  hpart(new THREE.BoxGeometry(0.42, 0.62, 0.05), DEEP, 0, 0.45, -0.075);
  // gilt trim on the upper lip
  b.sweep(
    catmull([hp(-0.26, 0.5, -0.07), hp(-0.25, 0.85, -0.07), hp(0.25, 0.85, -0.07), hp(0.26, 0.5, -0.07)]),
    0.014,
    { bone: head, color: GOLDP, sides: 6, smooth: false },
  );
  // nose
  hpart(ball(0.075, 7, 5), GOLDP, 0, 0.8, 0.14, { scale: [1.35, 1, 0.9], flat: true });
  for (const s of [1, -1]) hpart(ball(0.017, 5, 4), INK, s * 0.04, 0.855, 0.135);

  // upper teeth
  for (let i = 0; i < 9; i++) {
    const big = i === 0 || i === 8;
    const h = big ? 0.1 : 0.06;
    hpart(cone(big ? 0.032 : 0.022, h, 5), IVORY, -0.2 + i * 0.05, 0.81, -0.07 - h / 2, {
      dir: head.dir([0, 0, -1]),
      flat: true,
    });
  }

  // lower jaw
  b.frustumBox(hp(0, 0.1, -0.17), hp(0, 0.72, -0.15), [0.44, 0.11], [0.38, 0.1], { bone: jaw, color: JAW_E });
  hpart(new THREE.BoxGeometry(0.2, 0.42, 0.025), "#e8607a", 0, 0.4, -0.108, { bone: jaw });
  hpart(ball(0.07, 6, 5), GOLDP, 0, 0.74, -0.15, { bone: jaw, scale: [1.8, 1, 0.9], flat: true });
  b.sweep(
    catmull([hp(-0.2, 0.2, -0.11), hp(-0.19, 0.72, -0.11), hp(0.19, 0.72, -0.11), hp(0.2, 0.2, -0.11)]),
    0.012,
    { bone: jaw, color: GOLDP, sides: 6, smooth: false },
  );
  for (const s of [1, -1]) {
    hpart(cone(0.026, 0.08, 5), IVORY, s * 0.14, 0.7, -0.07, { bone: jaw, dir: head.dir([0, 0, 1]), flat: true });
  }
  // chin beard
  const beard: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 9; i++) {
    const l = -0.18 + 0.045 * i;
    beard.push(frame(hp(l, 0.72 - 3.0 * l * l, -0.2), [0, 1, 0]));
    if (i % 2 === 0) beard.push(frame(hp(l, 0.56 - 3.0 * l * l, -0.2), [0, 1, 0]));
  }
  b.cards(beard, [FUR_WHITE, FUR_WHITE, FUR_JADE], {
    size: [0.12, 0.36],
    lean: 180,
    flow: [0, 0, 1],
    bone: jaw,
    vary: 0.2,
    rng: rnd,
    bend: 15,
  });

  // eyes
  for (const s of [1, -1]) {
    const eyeC = hp(s * 0.2, 0.5, 0.2);
    const ed = unit(head.dir([-s * 0.12, 1, 0.05]));
    b.part(ball(0.105, 9, 6), IVORY, { bone: head, at: eyeC, flat: true } as any);
    b.part(new THREE.TorusGeometry(0.088, 0.016, 5, 14), GOLDP, {
      bone: head,
      at: offset(eyeC, ed, 0.058),
      dir: ed,
      axis: "z",
    });
    glow(
      b.part(new THREE.CircleGeometry(0.066, 16), "#ffffff", {
        bone: head,
        at: offset(eyeC, ed, 0.082),
        dir: ed,
        axis: "z",
        texture: IRIS,
      }),
      0.6,
    );
    // eyelid dome
    b.part(new THREE.SphereGeometry(0.118, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2), HEAD_E, {
      bone: head,
      at: eyeC,
      dir: head.dir([-s * 0.15, 0.5, 0.85]),
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.112, 0.011, 4, 12, Math.PI), GOLDP, {
      bone: head,
      at: eyeC,
      dir: head.dir([-s * 0.15, 0.5, 0.85]),
      axis: "z",
      rotation: [0, 0, 0],
    });
  }

  // brows
  for (const s of [1, -1]) {
    b.sweep(
      bezier(hp(s * 0.06, 0.52, 0.33), hp(s * 0.22, 0.5, 0.46), hp(s * 0.42, 0.32, 0.52), hp(s * 0.64, 0.05, 0.46)),
      [0.052, 0.0],
      { bone: head, color: IVORY, caps: { start: "flat", end: "point" }, sides: 6, smooth: false },
    );
    b.sweep(
      bezier(hp(s * 0.1, 0.5, 0.29), hp(s * 0.3, 0.48, 0.37), hp(s * 0.5, 0.3, 0.38), hp(s * 0.68, 0.1, 0.27)),
      [0.034, 0.0],
      { bone: head, color: GOLD_L, caps: { start: "flat", end: "point" }, sides: 6, smooth: false },
    );
    b.sweep(
      bezier(hp(s * 0.12, 0.5, 0.265), hp(s * 0.3, 0.46, 0.3), hp(s * 0.5, 0.3, 0.3), hp(s * 0.7, 0.12, 0.2)),
      [0.02, 0.0],
      { bone: head, color: JADE, caps: { start: "flat", end: "point" }, sides: 5, smooth: false },
    );
  }

  // ears
  for (const s of [1, -1]) {
    const od = head.dir([-s * 0.9, -0.2, 0.45]);
    const ec = hp(s * 0.31, 0.06, 0.34);
    b.part(cyl(0.13, 0.13, 0.05, 10), GOLDP, { bone: head, at: ec, dir: od, flat: true });
    b.part(cyl(0.1, 0.1, 0.03, 10), EAR_E, { bone: head, at: offset(ec, unit(od), 0.02), dir: od, flat: true });
    b.part(ball(0.035, 6, 4), VERM, { bone: head, at: offset(ec, unit(od), 0.04), flat: true });
    // hanging bell
    const bp = hp(s * 0.4, 0.04, 0.12);
    b.rod(offset(ec, unit(od), 0.03), offset(bp, [0, 1, 0], 0.09), 0.006, { bone: head, color: VERM });
    b.lathe(
      [
        [0, 0.09],
        [0.03, 0.09],
        [0.055, 0.065],
        [0.07, 0.02],
        [0.08, 0],
        [0.0, 0.0],
      ],
      { at: bp, bone: head, color: GOLDP, segments: 8 },
    );
  }

  // horn and mirror
  const hornPts = [hp(0, 0.36, 0.5), hp(0, 0.42, 0.68), hp(0, 0.34, 0.84), hp(0, 0.18, 0.92)];
  b.sweep(catmull(hornPts), [0.05, 0.012], {
    bone: head,
    color: (t: number) => (Math.floor(t * 9) % 2 ? VERM : GOLD),
    caps: { start: "flat", end: "point" },
    sides: 6,
    smooth: false,
  });
  hpart(ball(0.075, 7, 5), GOLDP, 0, 0.36, 0.48, { flat: true });
  b.part(ball(0.05, 6, 5), IVORY, { bone: head, at: hp(0, 0.17, 0.93), flat: true });
  b.cards(b.ring(frame(hp(0, 0.17, 0.93), head.dir([0, -0.2, 1])), { count: 6, radius: 0.02, tilt: 30 }).items, [FUR_RED, FUR_GOLD], {
    size: [0.07, 0.2],
    lean: 20,
    bend: 30,
    bone: head,
    rng: rnd,
  });
  const md = unit(head.dir([0, 1, 0.2]));
  const mc = hp(0, 0.56, 0.36);
  b.part(cyl(0.092, 0.092, 0.03, 12), GOLDP, { bone: head, at: mc, dir: md, flat: true });
  glow(
    b.part(new THREE.CircleGeometry(0.082, 18), "#ffffff", {
      bone: head,
      at: offset(mc, md, 0.019),
      dir: md,
      axis: "z",
      texture: MIRROR,
    }),
    1.1,
  );

  // cheek decals
  for (const s of [1, -1]) {
    b.decal(skull, CLOUD, {
      at: hp(s * 0.34, 0.26, 0.08),
      dir: head.dir([-s, 0, 0.05]),
      size: [0.27, 0.25],
      mirror: s > 0,
      segments: 8,
    });
  }

  // whiskers
  for (const s of [1, -1]) {
    const w = catmull([hp(s * 0.22, 0.8, 0.0), hp(s * 0.4, 0.9, -0.05), hp(s * 0.62, 0.76, -0.2), hp(s * 0.76, 0.5, -0.42)]);
    b.sweep(w, [0.016, 0.004], { bone: head, color: IVORY, sides: 5, smooth: false });
    b.part(ball(0.03, 6, 4), GOLDP, { bone: head, at: w.at(1), flat: true });
  }

  // mane
  const maneAxis = line(hp(0, 0.05, 0.1), hp(0, 1, 0.1));
  b.cards(b.ring(maneAxis, { count: 22, radius: 0.3, fromDeg: -135, toDeg: 135, tilt: -50 }).items, [FUR_RED, FUR_GOLD, FUR_RED, FUR_JADE], {
    size: [0.16, 0.34],
    lean: 25,
    bend: 30,
    vary: 0.25,
    spin: 10,
    rng: rnd,
    bone: head,
  });
  const maneAxis2 = line(hp(0, -0.05, 0.1), hp(0, 1, 0.1));
  b.cards(b.ring(maneAxis2, { count: 18, radius: 0.34, fromDeg: -150, toDeg: 150, tilt: -60 }).items, [FUR_GOLD, FUR_JADE, FUR_RED], {
    size: [0.18, 0.44],
    lean: 30,
    bend: 35,
    vary: 0.2,
    rng: rnd,
    bone: head,
  });
  const cheekAxis = line(hp(0, 0.3, -0.02), hp(0, 1, -0.02));
  b.cards(
    [
      ...b.ring(cheekAxis, { count: 6, radius: 0.34, fromDeg: 70, toDeg: 130, tilt: -35 }).items,
      ...b.ring(cheekAxis, { count: 6, radius: 0.34, fromDeg: -130, toDeg: -70, tilt: -35 }).items,
    ],
    [FUR_WHITE, FUR_GOLD],
    { size: [0.12, 0.26], lean: 40, bend: 25, rng: rnd, bone: head },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Rest pose: open the mouth, then seat the model on the floor
  b.pose(jaw, { axis: [1, 0, 0], deg: 24 });

  const box = new THREE.Box3().setFromObject(b.root, true);
  if (Math.abs(box.min.y) > 0.004) b.root.position.y -= box.min.y;

  return b.root;
}
```