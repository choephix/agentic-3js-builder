```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  limb,
  countershade,
  paint,
  spots,
  stripes,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "Oaxacan alebrije painted-wood fantasy beast: a rosette-spotted jaguar body with an eagle's hooked beak, crest, ruff, striped talon-paws, fanned wings and a curled feather-fan tail, covered in dots, flowers and swirls.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: saturated alebrije enamel colours
const ORANGE = "#f28c1c";
const YELLOW = "#ffd23a";
const MAGENTA = "#d6246e";
const PINK = "#ff6fa8";
const TEAL = "#12a8b0";
const TURQ = "#2ad0d0";
const INDIGO = "#2b2f8f";
const LIME = "#9bd63a";
const GREEN = "#2f9e4f";
const RED = "#e0322b";
const CREAM = "#fff0cf";
const INK = "#1d1530";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;
const tryDo = (f: () => void) => {
  try {
    f();
  } catch (e) {
    /* optional decoration */
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings)
const featherSvg = (a: string, c2: string, c3: string) =>
  svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
<path d="M20 99 C3 78 1 38 20 2 C39 38 37 78 20 99Z" fill="${a}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
<path d="M20 82 L7 68 M20 82 L33 68 M20 62 L9 49 M20 62 L31 49 M20 42 L12 31 M20 42 L28 31" stroke="${c2}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
<path d="M20 98 L20 8" stroke="${INK}" stroke-width="2.6"/>
<circle cx="20" cy="22" r="3.4" fill="${c3}"/><circle cx="12" cy="76" r="2.6" fill="${c3}"/><circle cx="28" cy="76" r="2.6" fill="${c3}"/>
</svg>`,
    { size: 128 },
  );
const FEATHERS = [
  featherSvg(TEAL, MAGENTA, YELLOW),
  featherSvg(MAGENTA, YELLOW, TURQ),
  featherSvg(YELLOW, INDIGO, PINK),
];

let eyeDots = "";
for (let i = 0; i < 12; i++) {
  const a = rad(i * 30);
  eyeDots += `<circle cx="${(50 + 30.5 * Math.cos(a)).toFixed(1)}" cy="${(50 + 30.5 * Math.sin(a)).toFixed(1)}" r="3.4" fill="#ffffff"/>`;
}
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="50" r="49" fill="${INK}"/><circle cx="50" cy="50" r="43" fill="${YELLOW}"/>
<circle cx="50" cy="50" r="37" fill="${MAGENTA}"/>${eyeDots}
<circle cx="50" cy="50" r="24" fill="${TEAL}"/><circle cx="50" cy="50" r="15" fill="${INK}"/>
<circle cx="44" cy="43" r="5.5" fill="#ffffff"/><circle cx="55" cy="56" r="2.4" fill="#ffffff"/></svg>`,
  { size: 192 },
);

let petals = "";
let leaves = "";
for (let i = 0; i < 8; i++) {
  leaves += `<ellipse cx="50" cy="11" rx="7" ry="11" transform="rotate(${i * 45 + 22.5} 50 50)" fill="${TEAL}" stroke="${INK}" stroke-width="2"/>`;
  petals += `<ellipse cx="50" cy="29" rx="11" ry="19" transform="rotate(${i * 45} 50 50)" fill="${i % 2 ? PINK : MAGENTA}" stroke="${INK}" stroke-width="2.4"/>`;
}
const FLOWER = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${leaves}${petals}
<circle cx="50" cy="50" r="13" fill="${YELLOW}" stroke="${INK}" stroke-width="2.5"/>
<circle cx="50" cy="50" r="5" fill="${ORANGE}"/>
<circle cx="45" cy="45" r="2" fill="${INK}"/><circle cx="55" cy="45" r="2" fill="${INK}"/><circle cx="45" cy="55" r="2" fill="${INK}"/><circle cx="55" cy="55" r="2" fill="${INK}"/></svg>`,
  { size: 192 },
);

let spiral = "";
let spiralDots = "";
for (let i = 0; i <= 44; i++) {
  const th = (i / 44) * Math.PI * 4.2;
  const r = 4 + th * 3.2;
  spiral += `${i ? "L" : "M"}${(50 + r * Math.cos(th)).toFixed(1)} ${(50 + r * Math.sin(th)).toFixed(1)} `;
  if (i % 6 === 3) {
    const r2 = r + 7;
    spiralDots += `<circle cx="${(50 + r2 * Math.cos(th)).toFixed(1)}" cy="${(50 + r2 * Math.sin(th)).toFixed(1)}" r="3.6" fill="${i % 12 === 3 ? MAGENTA : YELLOW}" stroke="${INK}" stroke-width="1.4"/>`;
  }
}
const SWIRL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="${spiral}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${spiral}" fill="none" stroke="${TURQ}" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>
${spiralDots}<circle cx="50" cy="50" r="5.5" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/></svg>`,
  { size: 192 },
);

let rays = "";
for (let i = 0; i < 16; i++) {
  const a = rad(i * 22.5);
  const w = rad(9);
  const tipR = i % 2 ? 40 : 48;
  const p = (r: number, ang: number) => `${(50 + r * Math.cos(ang)).toFixed(1)},${(50 + r * Math.sin(ang)).toFixed(1)}`;
  rays += `<polygon points="${p(26, a - w)} ${p(tipR, a)} ${p(26, a + w)}" fill="${i % 2 ? ORANGE : YELLOW}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
}
const SUN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${rays}
<circle cx="50" cy="50" r="26" fill="${MAGENTA}" stroke="${INK}" stroke-width="2.5"/>
<circle cx="50" cy="50" r="18" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/>
<circle cx="50" cy="50" r="9" fill="${TEAL}" stroke="${INK}" stroke-width="2"/>
<circle cx="50" cy="50" r="3" fill="${INK}"/></svg>`,
  { size: 160 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const featherPaint = (main: string, acc: string, dot: string) =>
  paint((_p, _n, s) => {
    const x = s[0];
    const y = s[1];
    if (Math.abs(x) < 0.004) return INK;
    const m = ((y % 0.1) + 0.1) % 0.1;
    if (Math.hypot(Math.abs(x) - 0.028, m - 0.05) < 0.012) return dot;
    return Math.floor(y / 0.1) % 2 === 0 ? main : acc;
  });
const FP = [
  featherPaint(TEAL, MAGENTA, YELLOW),
  featherPaint(MAGENTA, YELLOW, TURQ),
  featherPaint(YELLOW, INDIGO, PINK),
  featherPaint(ORANGE, TEAL, CREAM),
  featherPaint(LIME, MAGENTA, YELLOW),
  featherPaint(INDIGO, PINK, YELLOW),
];

const BODY = countershade(
  spots(ORANGE, [INDIGO, MAGENTA, TEAL], { size: 0.14, amount: 0.6, rosette: true, seed: 4 }),
  spots(CREAM, PINK, { size: 0.06, amount: 0.45, seed: 9 }),
  { level: -0.25 },
);
const HEAD = spots(YELLOW, [MAGENTA, TEAL, ORANGE], { size: 0.05, amount: 0.55, seed: 2 });
const LEG = stripes(ORANGE, [TEAL, MAGENTA, INDIGO], { size: 0.075, axis: "y", width: 0.34, wobble: 0.15, seed: 3 });
const PAW = spots(PINK, [YELLOW, TEAL], { size: 0.04, amount: 0.5, seed: 12 });
const TAIL = paint((_p, _n, s) => {
  const k = Math.floor(s[0] * 15);
  const c = [INDIGO, ORANGE, TEAL, MAGENTA][k % 4];
  const f = s[0] * 15 - k;
  return Math.abs(f - 0.5) < 0.12 ? YELLOW : c;
});
const BEAK_UP = paint((_p, _n, s) => {
  const ang = ((((s[1] + 180) % 360) + 360) % 360) - 180;
  if (s[0] > 0.82) return RED;
  if (Math.abs(ang) < 16) return INDIGO;
  return s[0] < 0.3 ? YELLOW : ORANGE;
});
const BEAK_LO = paint((_p, _n, s) => (s[0] > 0.85 ? RED : s[0] < 0.4 ? YELLOW : ORANGE));
const WINGARM = spots(MAGENTA, [YELLOW, TURQ], { size: 0.06, amount: 0.55, seed: 21 });

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "alebrije_jaguar_eagle" });

  // A flat painted feather blade lying along `dir`, broad face toward plane normal `N`.
  function blade(
    base: THREE.Vector3,
    dir: THREE.Vector3,
    N: THREE.Vector3,
    len: number,
    wid: number,
    i: number,
    bone: any,
    thick = 0.012,
  ) {
    const d = dir.clone().normalize();
    const Ne = N.clone().addScaledVector(d, -N.dot(d)).normalize();
    const x = Ne.clone().cross(d).normalize();
    const w = wid;
    const L = len;
    const outline: any[] = [
      [0, 0],
      [w * 0.32, L * 0.05],
      [w * 0.5, L * 0.35],
      [w * 0.46, L * 0.7],
      [w * 0.2, L * 0.95],
      [0, L, "sharp"],
      [-w * 0.2, L * 0.95],
      [-w * 0.46, L * 0.7],
      [-w * 0.5, L * 0.35],
      [-w * 0.32, L * 0.05],
    ];
    return b.extrude(outline, {
      at: base,
      x: [x.x, x.y, x.z],
      y: [d.x, d.y, d.z],
      thickness: thick,
      bevel: 0.003,
      smoothing: 1,
      color: FP[i % FP.length],
      bone,
    });
  }

  // ---- skeleton: root, spine, neck, head, jaw, tail
  const hips = b.joint("hips", { at: [0, 0.8, -0.5] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.5],
      [0, 0.82, -0.05],
      [0, 0.86, 0.42],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.38],
      [0, 1.03, 0.55],
      [0, 1.17, 0.7],
    ]),
    { parent: spine, count: 3, role: "neck" },
  );
  const neckEnd = neck.at(1).at.clone();
  const head = b.joint("head", { parent: neck, at: neckEnd, dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, up: -0.07 }),
    aim: head.local({ forward: 0.3, up: -0.08 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.8, -0.55],
      [0, 0.72, -0.95],
      [0, 0.7, -1.3],
      [0, 0.86, -1.55],
      [0, 1.05, -1.5],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );

  // ---- body & neck & tail tubes
  const body = b.sweep(spine, (t: number): [number, number] => [0.19 + 0.06 * t, 0.2 + 0.07 * t], {
    color: BODY,
    shift: [0, -0.04],
  });
  const neckTube = b.sweep(neck, (t: number) => 0.175 - 0.045 * t, { color: BODY });
  b.sweep(tail, (t: number) => 0.085 * (1 - t) + 0.04, { color: TAIL });

  // ---- tail fan (peacock-like feather disc) on the last tail joint
  const tailBone = tail.joints[tail.joints.length - 1];
  const tailEnd = tail.at(1).at.clone();
  b.part(new THREE.SphereGeometry(0.06, 8, 6), MAGENTA, { bone: tailBone, at: tailEnd, flat: true });
  for (let q = 0; q < 9; q++) {
    const a = rad(-72 + (144 * q) / 8);
    const d = V(Math.sin(a), Math.cos(a), -0.18);
    const base = tailEnd.clone().add(V(Math.sin(a) * 0.03, Math.cos(a) * 0.03, 0.001 * q));
    blade(base, d, V(0, 0, 1), 0.3 + 0.14 * Math.cos(a), 0.12, q, tailBone, 0.012);
  }
  for (let q = 0; q < 7; q++) {
    const a = rad(-60 + (120 * q) / 6);
    const d = V(Math.sin(a), Math.cos(a), -0.3);
    blade(tailEnd.clone().add(V(0, 0, 0.012)), d, V(0, 0, 1), 0.2 + 0.07 * Math.cos(a), 0.09, q + 3, tailBone, 0.012);
  }

  // ---- body ornaments
  let n = 0;
  for (let i = 0; i < 11; i++) {
    const t = 0.05 + i * 0.085;
    const dorsal = t < 0.5 || t > 0.9;
    if (dorsal) {
      const col = [YELLOW, TURQ, PINK][n++ % 3];
      tryDo(() => b.stick(new THREE.SphereGeometry(0.024, 6, 4), col, body.at(t, 0), { embed: 0.4 }));
    }
    for (const ang of [62, -62]) {
      const col = [MAGENTA, LIME, YELLOW][(n++ + i) % 3];
      tryDo(() => b.stick(new THREE.SphereGeometry(0.02, 6, 4), col, body.at(t, ang), { embed: 0.4 }));
    }
  }
  // mane of feather cards down the back
  tryDo(() => {
    const hits = b.surface(body).scatter(30, {
      rng: rng(31),
      minDist: 0.09,
      filter: (h: any) => h.n.y > 0.55 && h.at.z < -0.08,
    });
    b.cards(hits, FEATHERS, { size: [0.075, 0.17], lean: 50, bend: 20, vary: 0.25, rng: rng(32), spin: 15 });
  });

  // decals: flowers on flanks, sun on chest
  for (const s of [1, -1]) {
    tryDo(() => {
      const hit = b.surface(body).nearest(V(s * 0.4, 0.84, -0.12));
      b.decal(body, FLOWER, { at: hit.at, dir: [s, 0, 0], size: [0.22, 0.22] });
    });
  }
  tryDo(() => {
    const hit = b.surface(body).nearest(V(0, 0.74, 0.75));
    b.decal(body, SUN, { at: hit.at, dir: [0, -0.15, 1], size: [0.24, 0.24] });
  });

  // beaded collar on the neck
  tryDo(() => {
    const loop = b.surface(neckTube).loop(neck.joints[1], { lift: 0.012 });
    b.sweep(loop, 0.014, { color: INDIGO });
    let k = 0;
    b.along(b.surface(neckTube).loop(neck.joints[1], { lift: 0.03 }), 16, (at: any) => {
      b.part(new THREE.SphereGeometry(0.022, 6, 4), [YELLOW, MAGENTA, TURQ, PINK][k++ % 4], { at });
    });
  });

  // eagle ruff around the neck
  tryDo(() => {
    const hits = b.surface(neckTube).scatter(52, { rng: rng(5), minDist: 0.035, filter: (h: any) => h.n.y > -0.5 });
    b.cards(hits, FEATHERS, { size: [0.085, 0.17], lean: 55, bend: 22, vary: 0.25, rng: rng(6), spin: 20 });
  });

  // ---- legs
  const makePaw = (foot: any, fp: THREE.Vector3, front: boolean) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), PAW, {
      bone: foot,
      at: fp.clone().add(V(0, -0.005, 0.045)),
      scale: [0.078, 0.058, 0.105],
    });
    const xs = [-0.055, -0.019, 0.019, 0.055];
    const zs = [0.1, 0.128, 0.128, 0.1];
    xs.forEach((dx, i) => {
      const tp = fp.clone().add(V(dx, -0.03, zs[i] + 0.02));
      b.part(new THREE.SphereGeometry(0.03, 6, 4), [TEAL, MAGENTA, YELLOW, TURQ][i], { bone: foot, at: tp, flat: true });
      b.spike(tp.clone().add(V(0, -0.003, 0.02)), [0, -0.3, 1], front ? 0.11 : 0.08, front ? 0.013 : 0.011, {
        color: CREAM,
        bone: foot,
        sides: 5,
      });
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front leg (eagle-footed jaguar arm)
    const shoulder = V(s * 0.19, 0.72, 0.4);
    const fFoot = V(s * 0.2, 0.065, 0.5);
    const fp = limb(shoulder, fFoot, [0.4, 0.4], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "leg",
    });
    const fSweep = b.sweep(fLeg, (t: number) => 0.105 - 0.05 * t, { color: LEG });
    b.part(new THREE.SphereGeometry(1, 9, 7), BODY, {
      bone: fLeg.joints[0],
      at: shoulder.clone().add(V(0, -0.02, 0)),
      scale: [0.13, 0.17, 0.17],
    });
    makePaw(fLeg.joints[fLeg.joints.length - 1], fp[fp.length - 1], true);
    tryDo(() => {
      const hits = b.surface(fSweep).scatter(12, { rng: rng(40 + (s > 0 ? 1 : 2)), minDist: 0.06, filter: (h: any) => h.at.y > 0.3 });
      b.cards(hits, FEATHERS, { size: [0.07, 0.14], lean: 60, bend: 15, vary: 0.2, rng: rng(41) });
    });

    // hind leg
    const hipP = V(s * 0.2, 0.76, -0.45);
    const hFoot = V(s * 0.2, 0.065, -0.32);
    const hp = limb(hipP, hFoot, [0.36, 0.34, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const hLeg = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hLeg, (t: number) => 0.115 - 0.065 * t, { color: LEG });
    const thigh = b.part(new THREE.SphereGeometry(1, 9, 7), BODY, {
      bone: hLeg.joints[0],
      at: hipP.clone().add(V(s * 0.01, -0.06, -0.03)),
      scale: [0.15, 0.2, 0.2],
    });
    makePaw(hLeg.joints[hLeg.joints.length - 1], hp[hp.length - 1], false);
    tryDo(() => {
      const hit = b.surface(thigh).nearest(thigh.at.clone().add(V(s * 0.3, 0, 0)));
      b.decal(thigh, SWIRL, { at: hit.at, dir: [s, 0, 0], size: [0.24, 0.24] });
    });
  }

  // ---- wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const P = [V(s * 0.14, 1.0, 0.18), V(s * 0.5, 1.2, -0.05), V(s * 0.85, 1.3, 0.12), V(s * 1.05, 1.34, 0.06)];
    const wing = b.chain(`wing${side}`, catmull(P.map((p) => [p.x, p.y, p.z])), {
      parent: spine.joints[1],
      names: [`wingArm${side}`, `wingFore${side}`, `wingHand${side}`, `wingTip${side}`],
      role: "wing",
    });
    const [arm, fore, hand] = wing.joints;
    const N = V(0, 1, 0);

    b.sweep(wing, (t: number) => 0.075 * (1 - t) + 0.03, { color: WINGARM });
    b.part(new THREE.SphereGeometry(0.085, 8, 6), WINGARM, { bone: arm, at: P[0] });

    // primaries
    const plen = [0.52, 0.62, 0.66, 0.64, 0.58, 0.52, 0.46];
    for (let j = 0; j < 7; j++) {
      const u = j / 6;
      const pos = new THREE.Vector3().lerpVectors(P[3], P[2], u);
      pos.y += 0.003 * j;
      const a = rad(-8 + 62 * u);
      blade(pos, V(s * Math.cos(a), 0.1 - 0.1 * u, -Math.sin(a)), N, plen[j], 0.135, j, hand);
    }
    // secondaries
    for (let k = 0; k < 6; k++) {
      const u = k / 5;
      const pos = new THREE.Vector3().lerpVectors(P[2], P[1], u);
      pos.y -= 0.004 + 0.002 * k;
      const a = rad(58 + 28 * u);
      blade(pos, V(s * Math.cos(a), 0.05, -Math.sin(a)), N, 0.5 - 0.1 * u, 0.135, k + 2, fore);
    }
    // tertials
    for (let m = 0; m < 3; m++) {
      const pos = new THREE.Vector3().lerpVectors(P[1], P[0], 0.15 + 0.3 * m);
      pos.y -= 0.008;
      const a = rad(88 + 8 * m);
      blade(pos, V(s * Math.cos(a), 0.0, -Math.sin(a)), N, 0.36, 0.125, m + 4, arm);
    }
    // coverts, two rows
    for (let r = 0; r < 2; r++) {
      for (let q = 0; q < 8; q++) {
        const t = 0.08 + q * 0.12;
        const pt = wing.at(t);
        const a = rad(66 + 6 * r);
        const d = V(s * Math.cos(a), 0, -Math.sin(a));
        const pos = pt.at.clone().add(V(0, 0.022 + 0.008 * r, 0)).addScaledVector(d, 0.1 * r);
        blade(pos, d, N, 0.2 + 0.03 * r, 0.1, q + r * 2 + 1, pt.bone, 0.01);
      }
    }
  }

  // ---- head
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEAD, {
    bone: head,
    at: head.local({ forward: 0.04, up: 0.03 }),
    scale: [0.14, 0.13, 0.15],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), YELLOW, {
    bone: head,
    at: head.local({ forward: 0.14, up: -0.015 }),
    scale: [0.08, 0.07, 0.07],
  });

  // beaks
  const beakUp = bezier(
    head.local({ forward: 0.15, up: 0.0 }),
    head.local({ forward: 0.26, up: 0.025 }),
    head.local({ forward: 0.34, up: 0.0 }),
    head.local({ forward: 0.31, up: -0.12 }),
  );
  b.sweep(beakUp, (t: number): [number, number] => [0.058 * (1 - t) + 0.008, 0.064 * (1 - t) + 0.008], {
    bone: head,
    color: BEAK_UP,
    sides: 6,
  });
  b.sweep(
    catmull([
      head.local({ forward: 0.1, up: -0.072 }),
      head.local({ forward: 0.2, up: -0.082 }),
      head.local({ forward: 0.29, up: -0.065 }),
    ]),
    [0.048, 0.012],
    { bone: jaw, color: BEAK_LO, sides: 6 },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
    bone: jaw,
    at: head.local({ forward: 0.07, up: -0.08 }),
    scale: [0.075, 0.045, 0.085],
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), RED, {
    bone: jaw,
    at: head.local({ forward: 0.17, up: -0.062 }),
    scale: [0.03, 0.012, 0.07],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, 5, 4), INK, {
      bone: head,
      at: head.local({ forward: 0.19, up: 0.022, left: s * 0.032 }),
    });
  }

  // eyes, brows, ears
  const surfSkull = b.surface(skull);
  for (const s of [1, -1]) {
    const e = head.local({ forward: 0.1, up: 0.06, left: s * 0.105 });
    const ball = b.part(new THREE.SphereGeometry(0.05, 10, 8), YELLOW, { bone: head, at: e });
    const dir = V(s * 0.55, 0.05, 0.83).normalize();
    tryDo(() => {
      const hit = b.surface(ball).nearest(e.clone().addScaledVector(dir, 0.06));
      const dec = b.decal(ball, EYE, { at: hit.at, dir: [dir.x, dir.y, dir.z], size: [0.082, 0.082] });
      tryDo(() => glow(dec, 0.5));
    });
    b.sweep(
      catmull([
        head.local({ forward: 0.18, up: 0.078, left: s * 0.045 }),
        head.local({ forward: 0.1, up: 0.112, left: s * 0.1 }),
        head.local({ forward: 0.0, up: 0.1, left: s * 0.135 }),
      ]),
      0.021,
      { bone: head, color: INDIGO, sides: 6 },
    );
    // ears (jaguar)
    const ep = head.local({ forward: -0.05, up: 0.145, left: s * 0.088 });
    const ed = V(s * 0.4, 0.3, 0.85).normalize();
    b.part(new THREE.SphereGeometry(1, 10, 8), BODY, {
      bone: head,
      at: ep,
      scale: [0.058, 0.062, 0.03],
      dir: [ed.x, ed.y, ed.z],
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK, {
      bone: head,
      at: ep.clone().addScaledVector(ed, 0.014),
      scale: [0.04, 0.044, 0.02],
      dir: [ed.x, ed.y, ed.z],
      axis: "z",
    });
  }
  void surfSkull;

  // crest of feather blades
  for (let q = 0; q < 9; q++) {
    const a = rad(-55 + (110 * q) / 8);
    const d = V(Math.sin(a) * 0.8, 1, -0.5);
    const base = head.local({ forward: -0.06, up: 0.115, left: Math.sin(a) * 0.065 });
    blade(base, d, V(0, 0, 1), 0.2 + 0.14 * Math.cos(a), 0.09, q, head, 0.012);
  }
  for (let q = 0; q < 6; q++) {
    const a = rad(-45 + (90 * q) / 5);
    const d = V(Math.sin(a) * 0.9, 0.7, -0.7);
    const base = head.local({ forward: -0.08, up: 0.1, left: Math.sin(a) * 0.06 });
    blade(base, d, V(0, 0, 1), 0.16 + 0.06 * Math.cos(a), 0.08, q + 3, head, 0.01);
  }
  // cheek feather cards
  tryDo(() => {
    const hits = surfSkull.scatter(20, {
      rng: rng(51),
      minDist: 0.04,
      filter: (h: any) => h.n.z < 0.15 && h.n.y < 0.6,
    });
    b.cards(hits, FEATHERS, { size: [0.06, 0.11], lean: 60, bend: 15, vary: 0.2, rng: rng(52) });
  });

  return b.root;
}
```