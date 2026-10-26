```ts
import * as THREE from "three";
import { createBuilder, frame, rng, lerp, catmull, polyline, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import type { Fill, JointRef } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A hunched, horned stone gargoyle crouched on a gothic cornice ledge: folded bat wings, glowing amber eyes, fanged jaw that opens, claws gripping the edge, mossy weathered stone, blind arcade tracery, pinnacles and trailing ivy.",
};

type P3 = [number, number, number];
const LEDGE_TOP = 0.3;
/** creature coordinates: y is measured from the ledge top */
const V = (x: number, y: number, z: number): P3 => [x, LEDGE_TOP + y, z];

const TOOTH = "#ddd6c2";
const CAVITY = "#25221f";
const CLAW = "#4a4642";
const DARK = "#3a3835";
const TONGUE = "#6a4741";
const VINE = "#3b5a2a";

// ---------------------------------------------------------------------------------------------------------------
// Stone paints: lit warm on top, cool underneath, pitted, rain-streaked, mossy on upward faces, damp at the foot.
function stone(lo: string, hi: string, seed: number, moss: number, soot: number) {
  return paint((p, n) => {
    const big = noise(p, 0.18, seed);
    const med = noise(p, 0.05, seed + 3);
    let c = mix(lo, hi, smoothstep(0.25, 0.75, big) * 0.7 + med * 0.3);
    c = mix(c, "#4b4a47", 0.35 * smoothstep(0.66, 0.8, noise(p, 0.018, seed + 6)));
    const streak = noise(new THREE.Vector3(p.x * 8, p.y * 0.9, p.z * 8), 0.12, seed + 11);
    c = mix(c, "#34332f", soot * 0.55 * smoothstep(0.6, 0.78, streak) * (1 - Math.abs(n.y)));
    const up = smoothstep(-0.7, 0.9, n.y);
    c = mix(mix(c, "#2a3350", 0.22), mix(c, "#fff2d6", 0.2), up);
    const m = moss * smoothstep(0.3, 0.75, n.y) * smoothstep(0.5, 0.68, noise(p, 0.07, seed + 9));
    c = mix(c, mix("#4f6a2e", "#7d9a45", noise(p, 0.03, seed + 2)), m);
    c = mix(c, "#3b4a2c", 0.55 * smoothstep(0.12, 0.0, p.y));
    return c;
  });
}

const BODY = stone("#827f78", "#b7b2a5", 1, 0.5, 0.5);
const LEDGE = stone("#6f6e6a", "#a29f94", 7, 0.8, 0.85);
const HORN = stone("#4d4a46", "#938e82", 3, 0.15, 0.2);
const DARKSTONE = stone("#4a4844", "#6d6a63", 5, 0.1, 0.3);
const WINGBASE = stone("#6b6963", "#9c978b", 13, 0.3, 0.4);
const WING = paint((_p, _n, s) => {
  const across = s[1];
  const rib = Math.abs(across - 0.5) < 0.018 || across < 0.04 || across > 0.96;
  const fan = Math.abs(((s[0] * 6) % 1) - 0.5) < 0.02 && across > 0.1 && across < 0.9;
  return rib || fan ? DARKSTONE : WINGBASE;
});

// ---------------------------------------------------------------------------------------------------------------
// SVG drawings
const EYE = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="e"><path d="M6 20 Q42 2 94 42 Q48 58 6 20Z"/></clipPath>
    <radialGradient id="g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff3a8"/><stop offset="0.55" stop-color="#ffb02e"/><stop offset="1" stop-color="#e5551a"/></radialGradient>
  </defs>
  <path d="M6 20 Q42 2 94 42 Q48 58 6 20Z" fill="#14110f"/>
  <g clip-path="url(#e)"><circle cx="52" cy="30" r="21" fill="url(#g)"/><ellipse cx="52" cy="30" rx="4" ry="16" fill="#1a0c06"/></g>
  <path d="M6 20 Q42 2 94 42" fill="none" stroke="#0e0c0b" stroke-width="6" stroke-linecap="round"/>
  <path d="M6 20 Q48 58 94 42" fill="none" stroke="#0e0c0b" stroke-width="3.5" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const arch = (i: number) =>
  `<g transform="translate(${i * 100} 0)">
    <path d="M12 60 V32 Q12 15 50 4 Q88 15 88 32 V60 Z" fill="#45423e" stroke="#25231f" stroke-width="3" stroke-linejoin="round"/>
    <path d="M19 60 V33 Q19 21 50 11 Q81 21 81 33 V60" fill="none" stroke="#8d8879" stroke-width="2.4"/>
    <path d="M50 22 l6 9 -6 9 -6 -9z" fill="#2c2a27" stroke="#bdb7a6" stroke-width="1.8"/>
    <path d="M30 60 V44 M70 60 V44" stroke="#2c2a27" stroke-width="3"/>
  </g>`;
const ARCADE = svg(
  `<svg viewBox="0 0 600 60" xmlns="http://www.w3.org/2000/svg">${[0, 1, 2, 3, 4, 5].map(arch).join("")}</svg>`,
  { size: 1536 },
);

const FRIEZE = svg(
  `<svg viewBox="0 0 600 18" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="600" height="2" fill="#2a2825"/><rect x="0" y="16" width="600" height="2" fill="#2a2825"/>
  ${Array.from({ length: 30 }, (_, i) => {
    const cx = 10 + i * 20;
    return `<circle cx="${cx}" cy="9" r="6.5" fill="#5d5a54" stroke="#2a2825" stroke-width="2"/><circle cx="${cx}" cy="9" r="2.6" fill="#2a2825"/><path d="M${cx - 4.5} 9 h9 M${cx} 4.5 v9" stroke="#b9b3a2" stroke-width="1.1"/>`;
  }).join("")}
</svg>`,
  { size: 1536 },
);

const SIGIL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="44" fill="none" stroke="#2e2c29" stroke-width="5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#cbc5b4" stroke-width="2.4"/>
  ${[
    [37, 50],
    [63, 50],
    [50, 37],
    [50, 63],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#4a4743" stroke="#2e2c29" stroke-width="4"/>`)
    .join("")}
  <path d="M50 38 L62 50 L50 62 L38 50Z" fill="#a9a393" stroke="#2e2c29" stroke-width="3"/>
  <path d="M50 2 v8 M50 90 v8 M2 50 h8 M90 50 h8" stroke="#2e2c29" stroke-width="4" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const CRACKS = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
    <g stroke="#bdb7a8" stroke-width="1.4" transform="translate(2.5 0)">
      <path d="M50 0 L46 18 L54 30 L47 46 L56 58 L50 74 L58 100"/><path d="M46 18 L30 26 L22 40"/><path d="M54 30 L72 36 L80 52"/><path d="M56 58 L70 66"/>
    </g>
    <g stroke="#2b2927" stroke-width="3.2">
      <path d="M50 0 L46 18 L54 30 L47 46 L56 58 L50 74 L58 100"/><path d="M46 18 L30 26 L22 40"/><path d="M54 30 L72 36 L80 52"/><path d="M56 58 L70 66"/>
    </g>
  </g>
</svg>`,
  { size: 256 },
);

const MOSS = svg(
  `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="12" cy="20" rx="11" ry="8" fill="#3e5a24"/><ellipse cx="28" cy="19" rx="11" ry="9" fill="#3e5a24"/>
  <ellipse cx="20" cy="14" rx="12" ry="10" fill="#5f8433"/><ellipse cx="10" cy="14" rx="7" ry="6" fill="#5f8433"/>
  <ellipse cx="22" cy="10" rx="8" ry="6" fill="#8eb04a"/><ellipse cx="31" cy="13" rx="5" ry="4" fill="#8eb04a"/>
</svg>`,
  { size: 128 },
);

const IVY = svg(
  `<svg viewBox="0 0 40 44" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 32 L20 44" stroke="#2a4a1e" stroke-width="2.6"/>
  <path d="M20 2 C34 10 40 26 30 36 C26 38 22 36 20 32 C18 36 14 38 10 36 C0 26 6 10 20 2Z" fill="#3f6b2d" stroke="#1f3a17" stroke-width="2"/>
  <path d="M20 32 V8 M20 24 L11 16 M20 24 L29 16 M20 18 L14 12 M20 18 L26 12" stroke="#8fbc5a" stroke-width="1.7" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  const sph = (r: number, w = 9, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ======================================================= skeleton
  const base = b.joint("base", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: base, at: V(0, 0.42, -0.3), aim: V(0, 0.5, -0.12), role: "spine" });
  const spine = b.chain("spine", catmull([V(0, 0.42, -0.3), V(0, 0.5, -0.12), V(0, 0.64, 0.04), V(0, 0.78, 0.14)]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([V(0, 0.78, 0.14), V(0, 0.86, 0.22), V(0, 0.92, 0.3)]), {
    parent: spine,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: V(0, 0.92, 0.3), dir: [0, -0.12, 1], role: "head" });
  const hp = (x: number, y: number, z: number) => head.local({ left: x, up: y, forward: z });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.05, 0.02), aim: hp(0, -0.065, 0.3), role: "jaw" });

  // ======================================================= helper: clawed digit on its own little chain
  const digit = (name: string, parent: JointRef, pts: [P3, P3, P3], r: number, clawDir: P3, clawLen: number) => {
    const ch = b.chain(name, polyline(pts), { parent, names: [`${name}a`, `${name}b`, `${name}c`], role: "digit" });
    b.sweep(ch, [r, r * 0.7], { color: BODY, sides: 6, smooth: false });
    b.spike(pts[2], clawDir, clawLen, r * 0.8, { bone: ch.tip!, color: CLAW, sides: 5 });
    return ch;
  };

  // ======================================================= ledge (cornice, arcade, pinnacles, ivy)
  const L = (g: THREE.BufferGeometry, at: P3, color: Fill = LEDGE) => b.part(g, color, { bone: base, at });
  L(box(1.62, 0.05, 1.3), [0, 0.025, -0.1]);
  L(box(1.5, 0.15, 1.2), [0, 0.125, -0.1]);
  L(box(1.52, 0.045, 1.22), [0, 0.2225, -0.1]);
  const cornice = L(box(1.64, 0.055, 1.34), [0, 0.2725, -0.1]);
  L(box(1.58, 0.018, 1.28), [0, 0.236, -0.1], DARKSTONE);

  const plane = (w: number, h: number, tex: THREE.Texture, at: P3, dir: P3) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: base, at, dir, axis: "z", texture: tex });
  plane(1.5, 0.15, ARCADE, [0, 0.125, 0.503], [0, 0, 1]);
  plane(1.5, 0.15, ARCADE, [0, 0.125, -0.703], [0, 0, -1]);
  plane(1.52, 0.045, FRIEZE, [0, 0.2225, 0.513], [0, 0, 1]);
  for (const s of [1, -1]) {
    plane(1.2, 0.15, ARCADE, [s * 0.753, 0.125, -0.1], [s, 0, 0]);
    plane(1.22, 0.045, FRIEZE, [s * 0.763, 0.2225, -0.1], [s, 0, 0]);
  }
  plane(0.22, 0.22, CRACKS, [-0.36, 0.13, 0.505], [0, 0, 1]);

  // pinnacles with crockets
  const spire = [
    [0, 0],
    [0.075, 0],
    [0.075, 0.03],
    [0.05, 0.045],
    [0.05, 0.12],
    [0.065, 0.125],
    [0.065, 0.14],
    [0, 0.27],
  ] as [number, number][];
  for (const [px, pz] of [
    [0.68, 0.43],
    [-0.68, 0.43],
    [0.68, -0.63],
    [-0.68, -0.63],
  ]) {
    b.lathe(spire, { at: [px, LEDGE_TOP, pz], bone: base, color: LEDGE, segments: 4, spin: 45 });
    b.part(sph(0.022, 6, 4), LEDGE, { bone: base, at: [px, LEDGE_TOP + 0.285, pz] });
    b.ring(frame([px, LEDGE_TOP + 0.12, pz], [0, 1, 0]), { count: 4, radius: 0.05, tilt: 40 }, (it) =>
      b.spike(it, it, 0.05, 0.016, { bone: base, color: LEDGE, sides: 4 }),
    );
  }

  // moss on the cornice top
  const ledgeSkin = b.surface(cornice);
  b.cards(
    ledgeSkin.scatter(34, { rng: rng(5), minDist: 0.085, filter: (h) => h.n.y > 0.7 && Math.abs(h.at.x) < 0.8 }),
    MOSS,
    { size: [0.06, 0.045], lean: 25, vary: 0.4, rng: rng(6), cross: true, bone: base },
  );

  // ivy trailing down the front-right
  const vine = catmull([
    [0.64, 0.3, 0.575],
    [0.64, 0.26, 0.582],
    [0.62, 0.2, 0.535],
    [0.55, 0.12, 0.524],
    [0.5, 0.05, 0.524],
    [0.46, 0.06, 0.526],
  ]);
  b.sweep(vine, 0.009, { bone: base, color: VINE, sides: 5 });
  const vineFrames = b.along(vine, 15, () => {}).map((a) => frame(a.at, [0, 0, 1]));
  b.cards(vineFrames, IVY, {
    size: [0.055, 0.06],
    lean: 78,
    flow: [0, -1, 0.1],
    vary: 0.3,
    spin: 40,
    rng: rng(8),
    bone: base,
  });

  // ======================================================= torso
  const torso = b.sweep(spine, (t: number): [number, number] => [0.19 + 0.08 * t, 0.18 + 0.05 * t], {
    color: BODY,
    sides: 8,
    smooth: false,
  });
  const skin = b.surface(torso);
  b.part(sph(1, 9, 6), BODY, { bone: hips, at: V(0, 0.43, -0.33), scale: [0.26, 0.2, 0.2] });
  for (const t of [0.3, 0.5, 0.7]) b.sweep(skin.loop(spine.at(t), { lift: 0.004 }), 0.011, { color: DARKSTONE, sides: 5 });
  b.along(torso, 6, (at) => b.spike(at, at, 0.07 + 0.05 * Math.sin(Math.PI * at.t), 0.026, { color: HORN, sides: 5 }), {
    from: 0.05,
    to: 0.95,
  });
  for (const s of [1, -1]) {
    const hit = skin.nearest(V(s * 0.12, 0.72, 0.45));
    b.stick(sph(0.1, 8, 6), BODY, hit, { embed: 0.45, scale: [1.2, 0.65, 1] });
  }
  b.decal(torso, SIGIL, { at: skin.nearest(V(0, 0.58, 0.45)), size: [0.14, 0.14] });
  b.decal(torso, CRACKS, { at: skin.nearest(V(0.32, 0.5, -0.12)), size: [0.2, 0.2], roll: 25 });

  // neck + mane
  b.sweep(neck, [0.115, 0.1], { color: BODY, sides: 8, smooth: false });
  b.ring(neck.at(0.45), { count: 7, radius: 0.12, fromDeg: -110, toDeg: 110, tilt: -45 }, (it) =>
    b.spike(it, it, 0.16, 0.04, { color: HORN, sides: 5 }),
  );
  b.ring(neck.at(0.12), { count: 7, radius: 0.16, fromDeg: -100, toDeg: 100, tilt: -50 }, (it) =>
    b.spike(it, it, 0.13, 0.035, { color: DARKSTONE, sides: 5 }),
  );

  // ======================================================= head
  const skull = b.part(sph(1, 10, 7), BODY, { bone: head, at: hp(0, 0.03, 0.04), scale: [0.165, 0.14, 0.15], flat: true });
  b.frustumBox(hp(0, 0.01, 0.08), hp(0, -0.005, 0.29), [0.13, 0.1], [0.1, 0.085], { bone: head, color: BODY });
  b.rod(hp(0, 0.05, 0.12), hp(0, 0.03, 0.29), 0.03, { bone: head, color: BODY });
  b.part(box(0.11, 0.012, 0.2), CAVITY, { bone: head, at: hp(0, -0.052, 0.17) });
  // lower jaw (own bone)
  b.frustumBox(hp(0, -0.065, 0.04), hp(0, -0.07, 0.27), [0.15, 0.05], [0.11, 0.05], { bone: jaw, color: BODY });
  b.part(box(0.09, 0.012, 0.2), CAVITY, { bone: jaw, at: hp(0, -0.042, 0.16) });
  b.part(box(0.1, 0.055, 0.05), BODY, { bone: jaw, at: hp(0, -0.085, 0.265) });
  b.extrude(
    [
      [-0.03, 0],
      [0.03, 0],
      [0.035, 0.1],
      [0.02, 0.16],
      [0.008, 0.2],
      [0, 0.14],
      [-0.008, 0.2],
      [-0.02, 0.16],
      [-0.035, 0.1],
    ],
    { at: hp(0, -0.038, 0.1), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.016, bone: jaw, color: TONGUE },
  );
  b.spike(hp(0, -0.1, 0.26), [0, -0.8, 0.35], 0.13, 0.03, { bone: jaw, color: HORN, sides: 5 });

  for (const s of [1, -1]) {
    // teeth
    [0.11, 0.15, 0.19, 0.23].forEach((z) => {
      b.spike(hp(s * 0.062, -0.042, z), [0, -1, 0], 0.035, 0.012, { bone: head, color: TOOTH, sides: 4 });
      b.spike(hp(s * 0.058, -0.052, z + 0.02), [0, 1, 0], 0.03, 0.011, { bone: jaw, color: TOOTH, sides: 4 });
    });
    b.spike(hp(s * 0.05, -0.04, 0.265), [0, -1, 0], 0.075, 0.017, { bone: head, color: TOOTH, sides: 5 });
    b.spike(hp(s * 0.045, -0.05, 0.255), [s * 0.1, 1, 0.1], 0.09, 0.018, { bone: jaw, color: TOOTH, sides: 5 });
    // nostrils, cheeks, brows
    b.part(sph(0.026, 6, 4), DARKSTONE, { bone: head, at: hp(s * 0.04, 0.038, 0.285), flat: true });
    b.part(sph(1, 7, 5), BODY, { bone: head, at: hp(s * 0.115, -0.025, 0.06), scale: [0.05, 0.05, 0.07], flat: true });
    b.rod(hp(s * 0.025, 0.088, 0.15), hp(s * 0.16, 0.1, 0.06), 0.03, { bone: head, color: BODY });
    b.spike(hp(s * 0.13, -0.02, 0.04), [s * 0.5, -0.15, -0.85], 0.1, 0.022, { bone: head, color: HORN, sides: 5 });
    b.spike(hp(s * 0.12, -0.05, 0.1), [s * 0.6, -0.4, -0.4], 0.07, 0.018, { bone: head, color: HORN, sides: 5 });
    // glowing eyes
    glow(
      b.decal(skull, EYE, { at: hp(s * 0.11, 0.04, 0.15), dir: [0, 0, 1], size: [0.08, 0.048], mirror: s > 0 }),
      1.3,
    );
    // ears
    const ex: P3 = [s * 0.92, -0.39, 0];
    const ey: P3 = [s * 0.39, 0.92, 0];
    const earOutline = [
      [0, 0],
      [0.08, 0],
      [0.13, 0.12],
      [0.12, 0.26, "sharp"],
      [0.06, 0.18],
      [0, 0.14],
    ] as [number, number, "sharp"?][];
    b.extrude(earOutline, { at: hp(s * 0.12, 0.08, -0.01), x: ex, y: ey, thickness: 0.02, bevel: 0.004, bone: head, color: BODY });
    b.extrude(
      [
        [0.02, 0.02],
        [0.07, 0.02],
        [0.1, 0.11],
        [0.1, 0.2, "sharp"],
        [0.06, 0.15],
        [0.02, 0.12],
      ] as [number, number, "sharp"?][],
      { at: hp(s * 0.12, 0.08, -0.01), x: ex, y: ey, thickness: 0.026, bone: head, color: DARKSTONE },
    );
    // horns with ridge rings
    const hornPath = catmull([hp(s * 0.08, 0.11, 0), hp(s * 0.15, 0.19, -0.08), hp(s * 0.19, 0.3, -0.12), hp(s * 0.13, 0.4, -0.06)]);
    b.sweep(hornPath, [0.055, 0.004], { bone: head, color: HORN, sides: 6, smooth: false, caps: { start: "flat", end: "point" } });
    b.along(
      hornPath,
      3,
      (at) =>
        b.part(new THREE.TorusGeometry(0.055 * (1 - at.t) + 0.004, 0.009, 4, 8), DARKSTONE, {
          bone: head,
          at: at.at,
          dir: at.axis,
          axis: "z",
        }),
      { from: 0.15, to: 0.75 },
    );
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 15 });

  // ======================================================= limbs, wings, tail
  const mossHits: ReturnType<typeof skin.scatter> = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // --- hind leg
    const hipP = V(s * 0.22, 0.47, -0.3);
    const kneeP = V(s * 0.36, 0.34, -0.02);
    const ankleP = V(s * 0.3, 0.1, -0.3);
    const toeP = V(s * 0.3, 0.045, -0.17);
    const leg = b.chain(`leg${S}`, polyline([hipP, kneeP, ankleP, toeP]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`],
      role: "leg",
      contact: V(s * 0.3, 0, -0.1),
    });
    const thigh = b.sweep(leg, [0.11, 0.09, 0.06, 0.045, 0.04], { color: BODY, sides: 8, smooth: false });
    b.part(sph(1, 9, 6), BODY, { bone: leg.joints[0], at: V(s * 0.26, 0.42, -0.22), scale: [0.12, 0.14, 0.15] });
    b.capsule(ankleP, toeP, 0.04, { bone: leg, color: BODY, sides: 6 });
    b.spike(kneeP, [s * 0.5, 0.2, 0.8], 0.07, 0.03, { bone: leg.joints[1], color: HORN, sides: 5 });
    b.spike(ankleP, [0, 0.3, -1], 0.1, 0.025, { bone: leg.joints[2], color: HORN, sides: 5 });
    [-0.05, 0, 0.05].forEach((dx, i) =>
      digit(
        `toe${S}${i}`,
        leg,
        [V(s * 0.3 + dx, 0.022, -0.17), V(s * 0.3 + dx, 0.022, -0.09), V(s * 0.3 + dx, 0.012, -0.045)],
        0.022,
        [0, -0.6, 1],
        0.05,
      ),
    );
    mossHits.push(...b.surface(thigh).scatter(4, { rng: rng(30 + s), minDist: 0.1, filter: (h) => h.n.y > 0.5 }));

    // --- foreleg planted on the edge
    const shoulderP = V(s * 0.25, 0.66, 0.08);
    const elbowP = V(s * 0.38, 0.34, 0.0);
    const wristP = V(s * 0.3, 0.1, 0.3);
    const arm = b.chain(`arm${S}`, polyline([shoulderP, elbowP, wristP]), {
      parent: spine,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.085, 0.07, 0.062], { color: BODY, sides: 8, smooth: false });
    b.part(sph(1, 9, 6), BODY, { bone: arm.joints[0], at: shoulderP, scale: [0.12, 0.11, 0.12] });
    b.spike(elbowP, [s * 0.7, 0.1, -0.7], 0.1, 0.03, { bone: arm.joints[1], color: HORN, sides: 5 });
    b.part(box(0.15, 0.09, 0.14), BODY, { bone: arm, at: V(s * 0.3, 0.055, 0.33) });
    [-0.06, -0.02, 0.02, 0.06].forEach((dx, i) =>
      digit(
        `finger${S}${i}`,
        arm,
        [V(s * 0.3 + dx, 0.022, 0.38), V(s * 0.3 + dx, 0.022, 0.52), V(s * 0.3 + dx, -0.005, 0.575)],
        0.02,
        [0, -1, -0.1],
        0.07,
      ),
    );

    // --- folded wing
    const wRoot = V(s * 0.2, 0.8, -0.04);
    const wElbow = V(s * 0.42, 0.93, -0.22);
    const wWrist = V(s * 0.38, 1.12, -0.26);
    const wing = b.chain(`wing${S}`, polyline([wRoot, wElbow, wWrist]), {
      parent: spine,
      names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.05, 0.035, 0.028], { color: HORN, sides: 6, smooth: false });
    b.part(sph(0.05, 7, 5), HORN, { bone: wing.joints[1], at: wElbow, flat: true });
    b.spike(wWrist, [s * 0.15, 1, -0.1], 0.15, 0.03, { bone: wing.tip!, color: HORN, sides: 5 });
    const tips: P3[] = [V(s * 0.66, 0.8, -0.5), V(s * 0.5, 0.52, -0.66), V(s * 0.28, 0.4, -0.64)];
    const fingers = tips.map((tip, k) => {
      const mid = lerp(wWrist, tip, 0.5).add(new THREE.Vector3(s * 0.04, 0.05, -0.02));
      const f = b.chain(`wingFinger${k + 1}${S}`, polyline([wWrist, mid, tip]), {
        parent: wing,
        names: [`wingFinger${k + 1}${S}a`, `wingFinger${k + 1}${S}b`, `wingFinger${k + 1}${S}c`],
        role: "digit",
      });
      b.sweep(f, [0.028, 0.008], { color: HORN, sides: 6, smooth: false });
      b.spike(tip, [s * 0.3, -0.8, -0.3], 0.06, 0.014, { bone: f.tip!, color: CLAW, sides: 4 });
      return f;
    });
    b.membrane(fingers[0], fingers[1], { color: WING, thickness: 0.018, scallop: 0.12 });
    b.membrane(fingers[1], fingers[2], { color: WING, thickness: 0.018, scallop: 0.12 });
    b.membrane(fingers[2], [wWrist, V(s * 0.26, 0.8, -0.3), V(s * 0.2, 0.52, -0.4)], {
      color: WING,
      thickness: 0.018,
      bone: spine,
    });
  }

  // tail curling round the ledge, ending in a spade
  const tail = b.chain(
    "tail",
    catmull([V(0, 0.36, -0.36), V(0, 0.22, -0.52), V(0.1, 0.065, -0.62), V(0.34, 0.055, -0.6), V(0.5, 0.05, -0.42), V(0.52, 0.04, -0.2)]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.085, 0.07, 0.056, 0.042, 0.03], { color: BODY, sides: 8, smooth: false });
  b.along(tailTube, 6, (at) => b.spike(at, at, 0.05, 0.02, { color: HORN, sides: 5 }), { from: 0.1, to: 0.75 });
  b.extrude(
    [
      [0, -0.02],
      [0.07, 0.05],
      [0, 0.2],
      [-0.07, 0.05],
    ],
    { at: V(0.52, 0.03, -0.2), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.04, bevel: 0.006, bone: tail.joints[4], color: HORN },
  );

  // moss on the gargoyle's shoulders and back
  mossHits.push(...skin.scatter(14, { rng: rng(21), minDist: 0.1, filter: (h) => h.n.y > 0.5 }));
  b.cards(mossHits, MOSS, { size: [0.05, 0.04], lean: 25, vary: 0.4, rng: rng(22), cross: true });

  return b.root;
}
```