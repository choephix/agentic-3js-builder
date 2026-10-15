import * as THREE from "three";
import { createBuilder, catmull, mix, noise, paint, rng, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf (alert)",
  description:
    "A Warcraft-style gray wolf standing alert: heavy shaggy mane, amber glowing eyes, battle-notched ear, scarred shoulder, chunky clawed paws, full rigged rest pose with jaw, ears and tail chain.",
};

// ---------------------------------------------------------------- palette
const G_DARK = "#33353d";
const G_MID = "#6c7078";
const G_LIGHT = "#a7abb2";
const FROST = "#c9ccd0";
const CREAM = "#dcd2ba";
const CREAM_W = "#e6dfcf";
const TAN = "#8b7a63";
const MUD = "#4a3f33";
const NOSE = "#15131a";
const NOSE_HI = "#3d3946";
const LIP = "#1c1418";
const IVORY = "#ece4cf";
const CLAW = "#2b2824";
const SPIKE_DARK = "#44464e";
const SPIKE_LIGHT = "#8d9198";

const Q = new THREE.Vector3();

// Fur coat: lit from above, cream belly, dark saddle, tan stockings, mud at the feet.
const coat = paint((p, n) => {
  const patch = noise(p, 0.11, 3);
  const streak = noise(Q.set(p.x * 3.5, p.y * 2.2, p.z * 0.6), 0.1, 8);
  let c = mix(G_MID, G_LIGHT, smoothstep(0.38, 0.78, patch) * 0.8);
  c = mix(c, G_DARK, smoothstep(0.52, 0.86, streak) * 0.55);
  const saddle =
    smoothstep(0.1, 0.8, n.y) * smoothstep(0.66, 0.92, p.y) * (0.55 + 0.45 * smoothstep(0.3, 0.7, patch));
  c = mix(c, G_DARK, saddle * 0.7);
  c = mix(c, CREAM, smoothstep(-0.05, -0.6, n.y) * 0.8);
  const bib = smoothstep(0.4, 0.55, p.z) * smoothstep(0.35, 0.65, n.z) * smoothstep(1.0, 0.8, p.y) * smoothstep(0.4, 0.6, p.y);
  c = mix(c, CREAM, bib * 0.7);
  const low = smoothstep(0.5, 0.2, p.y);
  c = mix(c, TAN, low * 0.55);
  c = mix(c, "#45382d", low * smoothstep(0.38, 0.5, p.z) * smoothstep(0.2, 0.7, n.z) * 0.8);
  c = mix(c, MUD, smoothstep(0.13, 0.0, p.y) * 0.7);
  const sh = 0.82 + 0.18 * smoothstep(-0.8, 0.5, n.y);
  return [c[0] * sh, c[1] * sh, c[2] * sh];
});

// Head: dark muzzle bridge and brow, pale cheeks and chin.
const headCoat = paint((p, n) => {
  let c = coat.at(p, n);
  const muzzle = smoothstep(0.95, 1.08, p.z);
  c = mix(c, "#57544f", muzzle * smoothstep(0.0, 0.6, n.y) * 0.65);
  c = mix(c, CREAM_W, smoothstep(0.0, -0.45, n.y) * smoothstep(0.9, 1.05, p.z) * 0.9);
  c = mix(c, FROST, smoothstep(0.045, 0.085, Math.abs(p.x)) * smoothstep(1.2, 1.1, p.y) * 0.55);
  c = mix(c, G_DARK, smoothstep(0.02, 0.0, Math.abs(p.x)) * smoothstep(0.3, 0.8, n.y) * smoothstep(1.0, 0.9, p.z) * 0.6);
  return c;
});

const tailCoat = paint((p, n) => {
  const c = coat.at(p, n);
  let r = mix(c, G_DARK, smoothstep(0.2, 0.9, n.y) * 0.5);
  r = mix(r, "#17181c", smoothstep(0.42, 0.28, p.y) * 0.9);
  return r;
});

const earOuter = paint((p, n, s) => mix(coat.at(p, n), "#2a2b31", smoothstep(0.07, 0.16, s[1])));
const earInner = paint((_p, _n, s) => mix("#eadfc8", "#7c6957", smoothstep(0.0, 0.15, s[1])));

const ell = (sx: number, sy: number, sz: number, w = 12, h = 8) => new THREE.SphereGeometry(1, w, h).scale(sx, sy, sz);

export default function build() {
  const b = createBuilder({ name: "gray_wolf" });
  const R = rng(7);
  type J = ReturnType<typeof b.joint>;

  // ------------------------------------------------------------ textures
  const TUFT_A = svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d2d2d2"/><stop offset="1" stop-color="#6e6e6e"/></linearGradient></defs>
    <path d="M3 64 C2 46 8 24 16 0 C23 24 30 46 29 64 Z" fill="url(#g)"/>
    <path d="M16 62 L16 12 M10 62 Q11 36 15 18 M22 62 Q21 36 17 18" stroke="#8a8a8a" stroke-width="1.8" fill="none" opacity="0.7"/></svg>`,
    { size: 128 },
  );
  const TUFT_B = svg(
    `<svg viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#dcdcdc"/><stop offset="1" stop-color="#7a7a7a"/></linearGradient></defs>
    <path d="M2 48 L7 22 L13 30 L21 3 L28 27 L37 12 L40 30 L46 48 Z" fill="url(#g)"/>
    <path d="M22 46 L21 14 M13 46 L13 32 M33 46 L36 20" stroke="#8c8c8c" stroke-width="1.8" fill="none" opacity="0.7"/></svg>`,
    { size: 128 },
  );
  const EYE = svg(
    `<svg viewBox="0 0 64 40"><defs><clipPath id="e"><path d="M4 31 Q24 9 61 10 Q46 34 4 31Z"/></clipPath>
    <radialGradient id="i" cx="0.55" cy="0.6" r="0.65"><stop offset="0" stop-color="#ffe680"/><stop offset="0.55" stop-color="#ffab1c"/><stop offset="1" stop-color="#b8560a"/></radialGradient></defs>
    <path d="M1 34 Q22 3 63 5 L60 11 Q46 38 4 33Z" fill="#14100c"/>
    <path d="M4 31 Q24 9 61 10 Q46 34 4 31Z" fill="url(#i)"/>
    <g clip-path="url(#e)"><ellipse cx="38" cy="21" rx="5" ry="10" fill="#120d09"/><path d="M0 8 L64 6 L64 17 Q34 11 0 20Z" fill="#14100c" opacity="0.55"/></g>
    <circle cx="33" cy="19" r="2.4" fill="#ffffff"/><circle cx="43" cy="26" r="1.2" fill="#fff4c8"/>
    <path d="M4 31 Q24 9 61 10" stroke="#0c0906" stroke-width="3" fill="none"/></svg>`,
    { size: 256 },
  );
  const FLICK = svg(
    `<svg viewBox="0 0 48 64"><path d="M9 62 Q7 38 14 5 Q21 38 18 62Z" fill="#383941"/><path d="M23 64 Q21 34 29 9 Q36 36 32 64Z" fill="#2a2b32"/><path d="M36 60 Q35 40 41 21 Q46 42 43 60Z" fill="#494a52"/></svg>`,
    { size: 128 },
  );
  const SCAR = svg(
    `<svg viewBox="0 0 40 64"><path d="M8 4 L30 60" stroke="#e8b9a8" stroke-width="5" stroke-linecap="round"/><path d="M16 4 L38 58" stroke="#d99d8c" stroke-width="4" stroke-linecap="round"/><path d="M2 14 L24 66" stroke="#e2ab9a" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M10 16 l6 -3 M14 28 l6 -3 M19 40 l6 -3 M24 52 l6 -3" stroke="#6a3a34" stroke-width="3" stroke-linecap="round"/></svg>`,
    { size: 160 },
  );
  const MARK = svg(
    `<svg viewBox="0 0 64 32"><g fill="#17161a"><circle cx="10" cy="8" r="3"/><circle cx="24" cy="6" r="3"/><circle cx="38" cy="8" r="3"/><circle cx="52" cy="10" r="3"/><circle cx="16" cy="19" r="3"/><circle cx="30" cy="18" r="3"/><circle cx="44" cy="20" r="3"/><circle cx="22" cy="28" r="2.6"/><circle cx="37" cy="28" r="2.6"/></g></svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.8, -0.28], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.12],
      [0, 0.81, 0.1],
      [0, 0.82, 0.3],
      [0, 0.82, 0.46],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.84, 0.44],
      [0, 1.0, 0.58],
      [0, 1.13, 0.72],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.19, 0.8], dir: [0, -0.08, 1], role: "head" });
  const hp = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.08, -0.06), aim: hp(0.33, -0.09), role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.76, -0.4],
      [0, 0.68, -0.6],
      [0, 0.52, -0.77],
      [0, 0.34, -0.89],
      [0, 0.2, -0.94],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  // ------------------------------------------------------------ torso, neck, tail
  const body = b.loft(
    [
      { at: [0, 0.78, -0.38], w: 0.2, h: 0.22 },
      { at: [0, 0.79, -0.24], w: 0.27, h: 0.33 },
      { at: [0, 0.79, -0.02], w: 0.25, h: 0.29 },
      { at: [0, 0.78, 0.22], w: 0.29, h: 0.38 },
      { at: [0, 0.74, 0.42], w: 0.33, h: 0.46 },
      { at: [0, 0.75, 0.54], w: 0.26, h: 0.38 },
    ],
    { bone: [hips, spine], color: coat, name: "torso" },
  );
  const neckTube = b.sweep(neck, [0.15, 0.125, 0.1], { color: coat, name: "neckTube" });
  const tailTube = b.sweep(tail, [0.05, 0.085, 0.1, 0.085, 0.04], { color: tailCoat, name: "tailTube" });

  // ------------------------------------------------------------ legs
  const frontTubes: ReturnType<typeof b.sweep>[] = [];
  const hindTubes: ReturnType<typeof b.sweep>[] = [];
  const paw = (bone: J, x: number, z: number) => {
    b.part(ell(0.058, 0.047, 0.1, 10, 7), coat, { bone, at: [x, 0.047, z] });
    for (let k = 0; k < 4; k++) {
      const dx = (k - 1.5) * 0.03;
      const f = Math.abs(k - 1.5) * 0.012;
      b.part(ell(0.02, 0.02, 0.036, 8, 6), coat, { bone, at: [x + dx, 0.021, z + 0.085 - f] });
      b.spike([x + dx * 1.15, 0.018, z + 0.108 - f], [dx * 0.8, -0.3, 1], 0.05, 0.011, { color: CLAW, bone, sides: 6 });
    }
  };
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const fl = b.chain(
      `legF${sd}`,
      catmull([
        [s * 0.17, 0.74, 0.4],
        [s * 0.16, 0.46, 0.33],
        [s * 0.15, 0.17, 0.4],
        [s * 0.15, 0.07, 0.46],
      ]),
      {
        parent: spine,
        names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `pawF${sd}`],
        role: "leg",
        contact: [s * 0.15, 0, 0.5],
      },
    );
    frontTubes.push(b.sweep(fl, [0.105, 0.088, 0.06, 0.052, 0.054], { color: coat, name: `foreleg${sd}` }));
    b.part(ell(0.095, 0.16, 0.14), coat, { bone: fl.joints[0], at: [s * 0.2, 0.68, 0.38] });
    paw(fl.tip!, s * 0.15, 0.49);

    const hl = b.chain(
      `legH${sd}`,
      catmull([
        [s * 0.17, 0.76, -0.3],
        [s * 0.2, 0.48, -0.13],
        [s * 0.15, 0.28, -0.43],
        [s * 0.15, 0.07, -0.36],
      ]),
      {
        parent: hips,
        names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `pawH${sd}`],
        role: "leg",
        contact: [s * 0.15, 0, -0.28],
      },
    );
    hindTubes.push(b.sweep(hl, [0.12, 0.088, 0.052, 0.042, 0.046], { color: coat, name: `hindleg${sd}` }));
    b.part(ell(0.1, 0.2, 0.17), coat, { bone: hl.joints[0], at: [s * 0.2, 0.64, -0.25] });
    paw(hl.tip!, s * 0.15, -0.29);
  }

  // ------------------------------------------------------------ head
  const skull = b.part(ell(0.105, 0.098, 0.12, 14, 10), headCoat, { bone: head, at: hp(0.1, 0), name: "skull" });
  const muzzle = b.loft(
    [
      { at: hp(0.14, -0.015), w: 0.15, h: 0.13 },
      { at: hp(0.26, -0.03), w: 0.108, h: 0.098 },
      { at: hp(0.35, -0.035), w: 0.085, h: 0.08 },
    ],
    { bone: head, color: headCoat, name: "muzzle" },
  );
  const jawLoft = b.loft(
    [
      { at: hp(0.08, -0.095), w: 0.1, h: 0.055 },
      { at: hp(0.2, -0.1), w: 0.085, h: 0.05 },
      { at: hp(0.32, -0.09), w: 0.065, h: 0.045 },
    ],
    { bone: jaw, color: headCoat, name: "lowerJaw" },
  );
  b.part(ell(0.042, 0.033, 0.036, 10, 7), NOSE, { bone: head, at: hp(0.375, -0.018), name: "nose" });
  b.part(ell(0.016, 0.008, 0.012, 6, 4), NOSE_HI, { bone: head, at: hp(0.38, -0.003), name: "noseShine" });
  for (const s of [1, -1]) {
    b.part(ell(0.01, 0.012, 0.008, 6, 4), "#050406", { bone: head, at: hp(0.405, -0.02, s * 0.018) });
  }

  const skullSkin = b.surface(skull);
  const muzzleSkin = b.surface(muzzle);
  const hc = hp(0.1, 0);

  for (const s of [1, -1]) {
    // eyes: glowing amber decals
    const eHit = skullSkin.around(hc).at(s * 50, 10)!;
    glow(
      b.decal(skull, EYE, { at: eHit, size: [0.088, 0.056], mirror: s < 0, segments: 8, lift: 0.002, bone: head }),
      0.9,
    );
    // heavy scowling brow
    const b1 = skullSkin.around(hc).at(s * 26, 40)!;
    const b2 = skullSkin.around(hc).at(s * 48, 34)!;
    const b3 = skullSkin.around(hc).at(s * 74, 24)!;
    b.sweep(catmull([b1.moved([0, 0.004, 0]), b2.moved([0, 0.008, 0]), b3.moved([0, 0.004, 0])]), [0.018, 0.015, 0.008], {
      bone: head,
      color: G_DARK,
      sides: 6,
    });
    // lips
    b.sweep(
      muzzleSkin.drape(
        catmull([hp(0.36, -0.05, s * 0.03), hp(0.27, -0.062, s * 0.05), hp(0.17, -0.062, s * 0.07), hp(0.1, -0.05, s * 0.085)]),
        { lift: 0.002 },
      ),
      0.005,
      LIP,
      { bone: head, sides: 5 },
    );
    // whisker pores
    b.decal(muzzle, MARK, { at: hp(0.27, -0.01, s * 0.05), dir: [s, 0, 0], size: [0.1, 0.05], mirror: s < 0, lift: 0.002, bone: head });
    // fangs and incisors
    b.spike(hp(0.31, -0.062, s * 0.03), [0, -1, 0.1], 0.056, 0.013, { color: IVORY, bone: head, sides: 6 });
    b.spike(hp(0.3, -0.078, s * 0.021), [0, 1, 0.05], 0.042, 0.011, { color: IVORY, bone: jaw, sides: 6 });
    for (let k = 0; k < 3; k++)
      b.spike(hp(0.365, -0.058, s * (0.008 + k * 0.012)), [0, -1, 0.2], 0.02, 0.0065, { color: IVORY, bone: head, sides: 5 });
    // whiskers
    for (let k = 0; k < 3; k++)
      b.rod(hp(0.3 - k * 0.015, -0.005 - k * 0.012, s * 0.045), hp(0.26 - k * 0.04, -0.03 - k * 0.025, s * 0.16), 0.003, CREAM_W, {
        bone: head,
        sides: 4,
      });
    // jagged cheek ruff blades
    const ruff: [number, number][] = [
      [100, 5],
      [106, -15],
      [124, -2],
      [126, -26],
      [146, -14],
    ];
    ruff.forEach(([az, el], i) => {
      const h = skullSkin.around(hc).at(s * az, el)!;
      b.spike(h, [s * 0.35, -0.35, -1], 0.11 + 0.02 * (i % 2), 0.032, {
        color: i % 2 ? FROST : SPIKE_LIGHT,
        bone: head,
        sides: 6,
      });
    });
    // ears: outer shell and inner fur
    const outline: [number, number][] =
      s < 0
        ? [[-0.056, 0], [-0.05, 0.07], [-0.012, 0.185], [0.02, 0.128], [0.003, 0.108], [0.035, 0.1], [0.058, 0]]
        : [[-0.056, 0], [-0.05, 0.07], [-0.012, 0.185], [0.03, 0.1], [0.058, 0]];
    b.extrude(outline, {
      at: hp(0.03, 0.058, s * 0.062),
      x: [s, 0, 0],
      y: [s * 0.22, 1, -0.12],
      thickness: 0.02,
      bevel: 0.005,
      color: earOuter,
      bone: head,
      name: "ear",
    });
    b.extrude(
      [[-0.034, 0.008], [-0.03, 0.07], [-0.006, 0.15], [0.018, 0.075], [0.034, 0.008]],
      {
        at: hp(0.043, 0.066, s * 0.062),
        x: [s, 0, 0],
        y: [s * 0.22, 1, -0.12],
        thickness: 0.006,
        color: earInner,
        bone: head,
        name: "earInner",
      },
    );
  }
  // cheek fur cards and chin beard
  b.cards(
    skullSkin.scatter(34, { rng: R, minDist: 0.028, filter: (h) => Math.abs(h.n.x) > 0.45 && h.at.y < head.at.y + 0.02 }),
    TUFT_B,
    { size: [0.055, 0.09], lean: 75, flow: [0, -0.4, -1], bend: 25, vary: 0.3, rng: R, color: CREAM_W },
  );
  b.cards(
    b.surface(jawLoft).scatter(14, { rng: R, minDist: 0.03, filter: (h) => h.n.y < -0.2 }),
    TUFT_A,
    { size: [0.03, 0.07], lean: 60, flow: [0, -1, 0], vary: 0.3, rng: R, color: CREAM },
  );

  // ------------------------------------------------------------ mane and neck ruff
  const maneRings: [number, number, number, number, number][] = [
    [0.12, 12, 0.13, 0.16, 0.048],
    [0.4, 11, 0.115, 0.14, 0.04],
    [0.7, 10, 0.1, 0.12, 0.034],
  ];
  for (const [t, count, radius, len, r] of maneRings) {
    b.ring(neck.at(t), { count, radius, tilt: -55 }, (it) => {
      const m = it.i % 3;
      b.spike(it, it, len, r, { color: m === 0 ? SPIKE_DARK : m === 1 ? coat : SPIKE_LIGHT, sides: 6 });
    });
  }
  const neckSkin = b.surface(neckTube);
  b.cards(neckSkin.scatter(120, { rng: R, minDist: 0.03, filter: (h) => h.n.y > -0.5 }), [TUFT_A, TUFT_A, TUFT_B], {
    size: [0.07, 0.15],
    lean: 62,
    flow: [0, -0.5, -1],
    bend: 28,
    vary: 0.3,
    rng: R,
    color: coat,
  });

  // dorsal ridge of dark fur
  const ridge = [
    ...Array.from({ length: 14 }, (_, i) => body.at(0.1 + i * 0.065, 0)),
    ...Array.from({ length: 8 }, (_, i) => neckTube.at(0.15 + i * 0.1, 0)),
  ];
  b.cards(ridge, TUFT_A, { size: [0.05, 0.12], lean: 35, flow: [0, -0.15, -1], bend: 25, vary: 0.3, rng: R, color: G_DARK, sink: 0.3 });

  // chest bib
  const bodySkin = b.surface(body);
  b.cards(
    bodySkin.scatter(60, { rng: R, minDist: 0.04, filter: (h) => h.at.z > 0.38 && h.n.z > 0.2 && h.n.y < 0.4 }),
    TUFT_B,
    { size: [0.06, 0.1], lean: 70, flow: [0, -1, -0.3], bend: 20, vary: 0.3, rng: R, color: CREAM },
  );

  // leg feathering and hock tufts
  for (const t of frontTubes)
    b.cards(
      b.surface(t).scatter(16, { rng: R, minDist: 0.04, filter: (h) => h.n.z < -0.3 && h.at.y > 0.15 }),
      TUFT_A,
      { size: [0.04, 0.1], lean: 55, flow: [0, -1, -0.2], vary: 0.3, rng: R, color: SPIKE_LIGHT },
    );
  for (const t of hindTubes)
    b.cards(
      b.surface(t).scatter(16, { rng: R, minDist: 0.04, filter: (h) => h.n.z < -0.3 && h.at.y > 0.2 }),
      TUFT_A,
      { size: [0.04, 0.1], lean: 55, flow: [0, -1, -0.2], vary: 0.3, rng: R, color: SPIKE_LIGHT },
    );

  // bushy tail
  b.cards(b.surface(tailTube).scatter(70, { rng: R, minDist: 0.04 }), [TUFT_A, TUFT_B], {
    size: [0.06, 0.13],
    lean: 50,
    flow: [0, -0.5, -1],
    bend: 20,
    vary: 0.3,
    cross: true,
    rng: R,
    color: tailCoat,
  });

  // ------------------------------------------------------------ painterly flicks and the scar
  const flickSpots: [number, number][] = [
    [-0.25, 0.8],
    [-0.2, 0.62],
    [-0.05, 0.85],
    [0.05, 0.7],
    [0.15, 0.86],
    [0.25, 0.72],
    [0.1, 0.6],
    [-0.3, 0.7],
  ];
  for (const s of [1, -1])
    for (const [z, y] of flickSpots) {
      const h = bodySkin.ray([s, y, z], [-s, 0, 0]);
      if (h)
        b.decal(body, FLICK, {
          at: h,
          size: [0.09 + R() * 0.03, 0.12 + R() * 0.04],
          up: [0, -0.3, -1],
          roll: (R() - 0.5) * 40,
          segments: 6,
        });
    }
  const sc = bodySkin.ray([1, 0.8, 0.3], [-1, 0, 0]);
  if (sc) b.decal(body, SCAR, { at: sc, size: [0.08, 0.2], roll: 25, lift: 0.004, segments: 8 });

  return b.root;
}
