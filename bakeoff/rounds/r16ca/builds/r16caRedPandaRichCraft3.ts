import * as THREE from "three";
import { createBuilder, catmull, frame, gradient, limb, noise, offset, paint, rng, svg } from "../../../../src/index";
import { animeEye, cel, furEdge, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded, Genshin-style red panda balancing on a moss-covered boulder: ringed bushy tail, anime eyes, teal scarf with gold trim, glowing mushrooms and sweet flowers.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Layout constants
const ST = 0.22; // stone top height
const HC: V3 = [0, 0.57, 0.31]; // head centre
const hc = (x: number, y: number, z: number): V3 => [HC[0] + x, HC[1] + y, HC[2] + z];
const nrm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const arr = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];

// ---------------------------------------------------------------------------------------------------------------
// Palette (cel-shaded paints: lit tone + hue-shifted shadow tone)
const K = {
  rust: cel("#d9582b"),
  rustHi: cel("#f08a45"),
  cream: cel("#fff2da", "#f0c9a2"),
  dark: cel("#3d2322", "#2a1717"),
  earDark: cel("#6a2e24"),
  teal: cel("#34bfae", "#1f8aa0"),
  gold: cel("#f8cc52", "#d58f2c"),
  mossA: cel("#79bd3f"),
  mossB: cel("#56a034"),
  mossC: cel("#3f8a30"),
  pebble: cel("#a9aec2"),
};
const NOSE = "#2a1a20";
const WHISKER = "#fff6e6";
const CLAW = "#f3e6cf";

const COAT = cel(furEdge("#d9582b", "#4a2b2b", { level: -0.22, teeth: 0.22, period: 0.032, ink: "#7a2e17" }));
const LEGP = cel(gradient("#d9582b", "#3d2322", [0, 0.385, 0], [0, 0.33, 0]));
const HEADP = cel(
  furEdge("#d9582b", "#fff2da", {
    by: "position",
    axis: [0, 1, 0],
    level: HC[1] - 0.03,
    teeth: 0.02,
    period: 0.028,
    along: [1, 0, 0],
    ink: "#8a3a1e",
  }),
);
const TAILP = cel(
  paint((_p, _n, s) => {
    if (s[0] > 0.93) return "#4a2420";
    const t = s[0] * 9 + 0.3 * zigzag(s[1] / 100);
    return Math.floor(t) % 2 ? "#f08a45" : "#c4491f";
  }),
);

const ROCK_A = "#9aa0b4";
const ROCK_B = "#6f7590";
const stoneBase = paint((p, n) => {
  const wob = noise(p, 0.12, 4) - 0.5;
  const m = n.y * 0.9 + wob * 0.9 + (p.y - 0.11) * 1.6;
  if (m > 0.55) return noise(p, 0.05, 9) > 0.55 ? "#79bd3f" : "#56a034";
  if (m > 0.42) return "#3b7f2d";
  return noise(p, 0.07, 2) > 0.6 ? ROCK_A : ROCK_B;
});
const STONE = cel(stoneBase);

const RIBBON = paint((_p, _n, s) =>
  Math.abs(s[0]) > 0.0125 || s[1] > -0.012 || s[1] < -0.085 ? "#f8cc52" : "#34bfae",
);

// ---------------------------------------------------------------------------------------------------------------
// Textures
const GREY_TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M4 64 Q0 30 16 0 Q32 30 28 64Z" fill="#ffffff"/><path d="M16 60 Q15 34 16 12" stroke="#d4d4d4" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);
const GRASS = svg(
  `<svg viewBox="0 0 48 64"><path d="M6 64 Q8 30 2 6 Q16 28 20 64Z" fill="#ffffff"/><path d="M16 64 Q20 24 24 0 Q32 26 32 64Z" fill="#e6e6e6"/><path d="M28 64 Q36 34 46 12 Q44 42 42 64Z" fill="#cfcfcf"/></svg>`,
  { size: 128 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 40 64">
    <path d="M20 62 Q18 44 20 26" stroke="#3f8a30" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M19 48 Q8 44 6 36 Q16 38 19 48Z" fill="#56a034"/>
    <g fill="#fff8e8" stroke="#d9a878" stroke-width="1.4">
      <ellipse cx="20" cy="13" rx="6" ry="9"/><ellipse cx="20" cy="13" rx="6" ry="9" transform="rotate(72 20 22)"/>
      <ellipse cx="20" cy="13" rx="6" ry="9" transform="rotate(144 20 22)"/><ellipse cx="20" cy="13" rx="6" ry="9" transform="rotate(216 20 22)"/>
      <ellipse cx="20" cy="13" rx="6" ry="9" transform="rotate(288 20 22)"/>
    </g>
    <circle cx="20" cy="22" r="5" fill="#f4c542" stroke="#b9801c" stroke-width="1.2"/>
  </svg>`,
  { size: 192 },
);
const TEAR = svg(
  `<svg viewBox="0 0 40 80"><path d="M14 0 C32 6 30 40 22 80 C12 50 6 22 14 0Z" fill="#a8401f"/><path d="M16 6 C26 12 24 34 21 56" stroke="#7a2a14" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const MOUTH = svg(
  `<svg viewBox="0 0 64 40"><path d="M32 2 L32 14 M32 14 Q22 27 8 20 M32 14 Q42 27 56 20" stroke="#4a2325" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  { size: 192 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="29" fill="#f8cc52" stroke="#a86b1c" stroke-width="3.5"/>
    <circle cx="32" cy="32" r="23" fill="none" stroke="#d58f2c" stroke-width="2"/>
    <path d="M32 18 C46 18 50 34 39 40 C30 45 21 38 25 30 C28 24 37 26 36 32" stroke="#7a4a12" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);
const EYE = animeEye({ iris: "#b5651d", irisLight: "#ffd58a", blush: "#ff8f8f", size: 320 });

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers
const SPH = (w = 10, h = 8) => new THREE.SphereGeometry(1, w, h);

/** Low-poly lathe boulder with deterministic lumpy jitter; vertices in model space. */
function rockGeo(profile: [number, number][], segs: number, zStretch: number, jitter: number, seed: number) {
  const g = new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
    segs,
  );
  const pos = g.getAttribute("position");
  const topY = profile[profile.length - 1][1];
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    if (y > 0.015) {
      const k = 1 + jitter * Math.sin(x * 23 + seed) * Math.cos(z * 19 + y * 13 + seed * 2.1);
      x *= k;
      z *= k;
      if (y < topY - 0.001) y += jitter * 0.25 * Math.sin(x * 31 + z * 17 + seed);
    }
    pos.setXYZ(i, x, y, z);
  }
  g.scale(1, 1, zStretch);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "redPandaOnMossyStone" });
  const R = rng(77);

  // generic ellipsoid blob
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = (r: V3, color: any, at: V3, bone: any, extra: Record<string, unknown> = {}) =>
    b.part(SPH(10, 8), color, { at, bone, scale: r, ...extra });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tuft = (base: any, dir: V3, len: number, r: number, color: any, bone: any) =>
    b.spike(base, dir, len, r, { color, bone, sides: 6 });

  // =============================================================================================================
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.44, -0.2], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.44, -0.2],
      [0, 0.45, -0.085],
      [0, 0.455, 0.03],
      [0, 0.46, 0.14],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.46, 0.14],
      [0, 0.5, 0.2],
      [0, 0.535, 0.255],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.535, 0.255], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hc(0, -0.045, 0.03),
    aim: hc(0, -0.055, 0.14),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.44, -0.24],
      [0, 0.46, -0.42],
      [0, 0.5, -0.6],
      [0, 0.6, -0.73],
      [0, 0.74, -0.76],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // =============================================================================================================
  // The mossy stone
  const stoneGeo = rockGeo(
    [
      [0.004, 0],
      [0.3, 0],
      [0.37, 0.04],
      [0.385, 0.12],
      [0.34, 0.19],
      [0.285, ST],
      [0.004, ST],
    ],
    10,
    1.25,
    0.05,
    3.1,
  );
  const stone = b.part(stoneGeo, STONE, { bone: hips, at: [0, 0, 0], flat: true, name: "stone" });
  const stoneSkin = b.surface(stone);

  const lumps: { at: V3; s: V3; rot: V3 }[] = [
    { at: [0.37, 0.07, 0.3], s: [0.13, 0.085, 0.11], rot: [0, 25, 0] },
    { at: [-0.36, 0.06, -0.3], s: [0.11, 0.07, 0.1], rot: [0, -40, 0] },
    { at: [0.3, 0.04, 0.45], s: [0.06, 0.04, 0.055], rot: [0, 10, 0] },
    { at: [-0.4, 0.04, 0.22], s: [0.07, 0.045, 0.06], rot: [0, 60, 0] },
  ];
  for (const l of lumps)
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: hips,
      at: l.at,
      scale: l.s,
      rotation: l.rot,
      flat: true,
      name: "pebble",
    });

  // moss clumps along the rim
  const clumps = [K.mossA, K.mossB, K.mossC];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.3;
    const rr = 0.26;
    const hit = stoneSkin.ray([Math.cos(a) * rr, 1, Math.sin(a) * rr * 1.25], [0, -1, 0]);
    if (!hit) continue;
    const w = 0.035 + R() * 0.03;
    b.stick(SPH(7, 5), clumps[i % 3], hit, { embed: 0.35, scale: [w, w * 0.55, w * 0.9], bone: hips });
  }
  // moss blades on the top
  const mossHits = stoneSkin.scatter(70, {
    rng: rng(5),
    minDist: 0.035,
    filter: (h) => h.n.y > 0.55 && h.at.y > 0.19,
  });
  b.cards(mossHits, GRASS, {
    size: [0.05, 0.05],
    lean: 20,
    bend: 20,
    cross: true,
    vary: 0.4,
    rng: rng(6),
    color: "#66b03a",
    bone: hips,
  });
  b.cards(mossHits.filter((_h, i) => i % 3 === 0), GRASS, {
    size: [0.04, 0.045],
    lean: 30,
    cross: true,
    vary: 0.3,
    rng: rng(7),
    color: "#97d853",
    bone: hips,
  });
  // sweet flowers
  const flowerHits = stoneSkin
    .scatter(40, {
      rng: rng(21),
      minDist: 0.13,
      filter: (h) => h.n.y > 0.6 && h.at.y > 0.2 && Math.hypot(h.at.x, h.at.z / 1.25) > 0.215,
    })
    .slice(0, 5);
  b.cards(flowerHits, FLOWER, {
    size: [0.045, 0.075],
    lean: 8,
    cross: true,
    vary: 0.2,
    rng: rng(22),
    bone: hips,
  });
  // glowing mushrooms
  for (const m of [
    { az: 28, el: 24, h: 0.04, r: 0.022 },
    { az: 43, el: 16, h: 0.028, r: 0.016 },
    { az: 17, el: 12, h: 0.022, r: 0.013 },
  ]) {
    const hit = stoneSkin.around([0, 0.11, 0]).at(m.az, m.el);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(m.r * 0.4, m.r * 0.5, m.h, 6), K.cream, hit, { embed: 0.3, bone: hips });
    glow(
      b.stick(new THREE.SphereGeometry(m.r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#ffa24a", hit.moved([0, m.h * 0.85, 0]), {
        embed: 0,
        bone: hips,
      }),
      1.3,
    );
  }

  // =============================================================================================================
  // Body, neck, tail
  const body = b.sweep(
    spine,
    (t: number): [number, number] => [0.105 + 0.016 * Math.sin(Math.PI * t), 0.098 + 0.014 * Math.sin(Math.PI * t)],
    { color: COAT, sides: 12 },
  );
  b.sweep(neck, [0.088, 0.078], { color: K.rust, sides: 10 });
  const tailSweep = b.sweep(tail, [0.06, 0.08, 0.097, 0.088, 0.046], { color: TAILP, sides: 10 });

  // fur cards
  const bodyHits = b.surface(body).scatter(70, { rng: rng(3), minDist: 0.035, filter: (h) => h.n.y > -0.1 });
  b.cards(bodyHits, GREY_TUFT, {
    size: [0.04, 0.06],
    lean: 70,
    bend: 20,
    vary: 0.3,
    rng: rng(4),
    color: "#d4562a",
  });
  const tailHits = b.surface(tailSweep).scatter(60, { rng: rng(8), minDist: 0.03 });
  b.cards(tailHits, GREY_TUFT, {
    size: [0.04, 0.06],
    lean: 60,
    bend: 25,
    vary: 0.3,
    rng: rng(9),
    color: "#ea7a3a",
  });
  // tail tip tuft
  const tailEnd: V3 = [0, 0.745, -0.77];
  for (const d of [
    [0, 0.6, -0.5],
    [0.35, 0.5, -0.4],
    [-0.35, 0.5, -0.4],
    [0.2, 0.2, -0.8],
    [-0.2, 0.2, -0.8],
  ] as V3[])
    tuft(tailEnd, nrm(d), 0.07, 0.024, K.dark, tail.joints[3]);

  // =============================================================================================================
  // Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front leg
    const fPts = limb([s * 0.095, 0.395, 0.1], [s * 0.11, ST + 0.032, 0.17], [0.09, 0.09], [0, 0, -1]);
    const fl = b.chain(`legF${side}`, fPts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [s * 0.11, ST, 0.19],
    });
    b.sweep(fl, [0.056, 0.043, 0.037], { color: LEGP, sides: 8 });
    blob([0.062, 0.072, 0.072], K.rust, [s * 0.095, 0.395, 0.1], fl.joints[0]);
    const wr = fl.joints[fl.joints.length - 1];
    const fp: V3 = [s * 0.11, ST + 0.02, 0.19];
    blob([0.036, 0.022, 0.05], K.dark, fp, wr);

    // hind leg
    const hPts = limb(
      [s * 0.1, 0.4, -0.19],
      [s * 0.105, ST + 0.032, -0.14],
      [0.085, 0.08, 0.05],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hPts, {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.105, ST, -0.12],
    });
    b.sweep(hl, [0.06, 0.046, 0.04, 0.038], { color: LEGP, sides: 8 });
    blob([0.07, 0.085, 0.09], K.rust, [s * 0.1, 0.4, -0.19], hl.joints[0]);
    const ft = hl.joints[hl.joints.length - 1];
    const hp: V3 = [s * 0.105, ST + 0.02, -0.115];
    blob([0.036, 0.022, 0.06], K.dark, hp, ft);

    // toes and claws
    for (const [pw, pz, bone] of [
      [fp, 0.048, wr],
      [hp, 0.058, ft],
    ] as [V3, number, typeof wr][]) {
      for (const dx of [-0.017, 0, 0.017]) {
        blob([0.012, 0.01, 0.014], K.dark, [pw[0] + dx, ST + 0.011, pw[2] + pz], bone);
        tuft([pw[0] + dx, ST + 0.012, pw[2] + pz + 0.008], [0, -0.1, 1], 0.02, 0.0055, CLAW, bone);
      }
    }
  }

  // =============================================================================================================
  // Head
  const skull = b.part(SPH(16, 12), HEADP, { bone: head, at: HC, scale: [0.115, 0.092, 0.1], name: "skull" });
  const skin = b.surface(skull);

  // muzzle, nose, jaw
  const muzzle = blob([0.05, 0.04, 0.055], K.cream, hc(0, -0.03, 0.09), head);
  blob([0.017, 0.012, 0.012], NOSE, hc(0, -0.012, 0.143), head);
  blob([0.04, 0.02, 0.045], K.cream, hc(0, -0.073, 0.09), jaw);
  b.decal(muzzle, MOUTH, { at: hc(0, -0.04, 0.15), dir: [0, -0.15, 1], size: [0.055, 0.034], segments: 8 });

  // eyes, tear marks, brow spots
  for (const s of [1, -1]) {
    const eyeHit = skin.around(HC).at(s * 31, 9);
    if (eyeHit) b.decal(skull, EYE, { at: eyeHit, size: [0.046, 0.063], mirror: s > 0, segments: 8 });
    const tearHit = skin.around(HC).at(s * 22, -24);
    if (tearHit) b.decal(skull, TEAR, { at: tearHit, size: [0.026, 0.052], mirror: s > 0, segments: 6 });
    const browHit = skin.around(HC).at(s * 24, 42);
    if (browHit) b.stick(SPH(8, 6), K.cream, browHit, { embed: 0.3, scale: [0.026, 0.012, 0.018], bone: head });
  }

  // ears
  for (const s of [1, -1]) {
    const ec = hc(s * 0.078, 0.078, -0.012);
    const ed = nrm([s * 0.45, 0.4, 0.8]);
    blob([0.05, 0.054, 0.024], K.rust, ec, head, { dir: ed, axis: "z" });
    blob([0.036, 0.04, 0.014], K.cream, arr(offset(ec, ed, 0.014)), head, { dir: ed, axis: "z" });
    blob([0.018, 0.02, 0.008], K.earDark, arr(offset(ec, ed, 0.02)), head, { dir: ed, axis: "z" });
    for (const k of [-1, 0, 1])
      tuft(
        [ec[0] + s * k * 0.012, ec[1] - 0.02, ec[2] + 0.018],
        nrm([s * 0.1 + k * 0.15, 1, 0.5]),
        0.045,
        0.012,
        K.cream,
        head,
      );
  }

  // crown tufts
  for (const [x, z, dx] of [
    [0, 0.0, 0],
    [0.03, -0.01, 0.4],
    [-0.03, -0.01, -0.4],
  ] as [number, number, number][])
    tuft(hc(x, 0.082, z), nrm([dx, 1, -0.4]), 0.05, 0.02, K.rust, head);

  // cheek ruffs
  for (const s of [1, -1]) {
    for (const [az, el, len] of [
      [80, 6, 0.06],
      [82, -8, 0.075],
      [78, -22, 0.08],
      [72, -36, 0.075],
      [62, -48, 0.065],
    ] as [number, number, number][]) {
      const h = skin.around(HC).at(s * az, el);
      if (!h) continue;
      tuft(offset(h.at, h.n, -0.014), nrm([s * 0.8, -0.3, -0.5]), len, 0.032, K.cream, head);
    }
  }
  const cheekHits = skin.scatter(40, {
    rng: rng(15),
    minDist: 0.022,
    filter: (h) => Math.abs(h.n.x) > 0.55 && h.at.y < HC[1] - 0.015,
  });
  b.cards(cheekHits, GREY_TUFT, {
    size: [0.03, 0.05],
    lean: 65,
    vary: 0.3,
    rng: rng(16),
    color: "#fff2da",
    bone: head,
  });
  const crownHits = skin.scatter(24, {
    rng: rng(17),
    minDist: 0.025,
    filter: (h) => h.n.y > 0.5 && h.at.z < HC[2] + 0.03,
  });
  b.cards(crownHits, GREY_TUFT, {
    size: [0.028, 0.045],
    lean: 60,
    vary: 0.3,
    rng: rng(18),
    color: "#e0642e",
    bone: head,
  });

  // whiskers
  for (const s of [1, -1])
    for (const k of [-1, 0, 1])
      b.rod(hc(s * 0.045, -0.025 + k * 0.01, 0.11), hc(s * 0.15, -0.02 + k * 0.03, 0.115), 0.0025, WHISKER, { bone: head });

  // =============================================================================================================
  // Scarf with gold trim, knot, ribbons, emblem
  const nAt = new THREE.Vector3(0, 0.465, 0.175);
  const nDir = new THREE.Vector3(0, 0.33, 0.94).normalize();
  const loopOf = (center: THREE.Vector3, radius: number) => b.ring(frame(center, nDir), { count: 12, radius }).items;
  b.sweep(catmull(loopOf(nAt, 0.112), { closed: true }), 0.022, { color: K.teal, bone: neck.joints[0], sides: 8 });
  for (const d of [-0.03, 0.03])
    b.sweep(catmull(loopOf(nAt.clone().addScaledVector(nDir, d), 0.116), { closed: true }), 0.007, {
      color: K.gold,
      bone: neck.joints[0],
      sides: 6,
    });
  const upIn = new THREE.Vector3(0, 1, 0).addScaledVector(nDir, -nDir.y).normalize();
  const knot = nAt.clone().addScaledVector(upIn, -0.118);
  blob([0.032, 0.03, 0.03], K.teal, arr(knot), neck.joints[0]);
  b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
    bone: neck.joints[0],
    at: [knot.x, knot.y - 0.004, knot.z + 0.034],
    dir: [0, -0.1, 1],
    axis: "z",
    texture: EMBLEM,
  });
  for (const [s, k] of [
    [1, 1],
    [-1, 0.78],
  ] as [number, number][]) {
    const outline: [number, number][] = [
      [-0.016, 0],
      [0.016, 0],
      [0.019 * k, -0.11 * k],
      [0, -0.092 * k],
      [-0.019 * k, -0.11 * k],
    ];
    b.extrude(outline, {
      at: [knot.x + s * 0.022, knot.y - 0.012, knot.z + 0.004],
      x: [1, 0, 0],
      y: [0, 0.943, 0.33],
      thickness: 0.008,
      color: RIBBON,
      bone: neck.joints[0],
    });
    // gold tassel
    blob([0.009, 0.009, 0.009], K.gold, [knot.x + s * 0.022, knot.y - 0.012 - 0.11 * k * 0.943, knot.z - 0.11 * k * 0.33 + 0.012], neck.joints[0]);
  }

  return b.root;
}
