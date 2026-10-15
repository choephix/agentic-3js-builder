// Ember Phoenix: a Genshin-style cel-shaded fire bird, wings spread, flame feather cards, gold filigree and a pyro gem.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ember Phoenix",
  description:
    "A cel-shaded phoenix with spread flame-feather wings, a long ocellus tail, gold collar, pyro gem and anime eyes.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Fr = ReturnType<typeof frame>;

// ---------------------------------------------------------------------------------------------------------------
// Drawings: layered flame feathers (outline, crimson, orange, gold, white-hot core), tongues, tassel.

const FEATHER_D =
  "M20 120 C5 100 3 70 6 48 C8 34 4 22 8 6 C12 20 16 22 20 0 C24 22 28 20 32 6 C36 22 32 34 34 48 C37 70 35 100 20 120 Z";
const TONGUE_D =
  "M20 120 C6 100 8 70 14 52 C18 40 12 26 22 0 C26 20 34 30 32 52 C36 76 34 100 20 120 Z";
const SCALES = [
  [1, 1],
  [0.84, 0.96],
  [0.64, 0.86],
  [0.42, 0.72],
  [0.2, 0.5],
];

const layered = (d: string, cols: string[], extra: string) => {
  const g = cols
    .map(
      (c, i) =>
        `<g transform="translate(20 120) scale(${SCALES[i][0]} ${SCALES[i][1]}) translate(-20 -120)"><path d="${d}" fill="${c}"/></g>`,
    )
    .join("");
  return svg(`<svg viewBox="0 0 40 120">${g}${extra}</svg>`, { size: 256 });
};

const barbs = (barb: string, vein: string) =>
  `<path d="M20 104 L8 86 M20 88 L7 68 M20 104 L32 86 M20 88 L33 68 M20 70 L11 52 M20 70 L29 52" stroke="${barb}" stroke-width="1.7" stroke-linecap="round" fill="none"/>` +
  `<path d="M20 118 L20 34" stroke="${vein}" stroke-width="2" stroke-linecap="round"/>`;

const OCELLUS =
  `<ellipse cx="20" cy="40" rx="7.5" ry="11" fill="#7a0f2a"/><ellipse cx="20" cy="40" rx="5.6" ry="9" fill="#27dccb"/>` +
  `<ellipse cx="20" cy="40" rx="3.4" ry="6" fill="#1a6fb0"/><ellipse cx="20" cy="38" rx="1.6" ry="3.5" fill="#fff6c8"/>`;

const F_A = layered(FEATHER_D, ["#7a0f2a", "#e22a1f", "#ff7a1c", "#ffc53a", "#fff2a8"], barbs("#d94a18", "#ffe9a0"));
const F_B = layered(FEATHER_D, ["#b3321a", "#ff6a1a", "#ffb02e", "#ffe27a", "#fffbe0"], barbs("#e0801c", "#fff6c0"));
const F_C = layered(FEATHER_D, ["#5a0c2e", "#b8152b", "#ee4a1a", "#ff9a2a", "#ffd878"], barbs("#c9301a", "#ffd88a"));
const F_TAIL = layered(
  FEATHER_D,
  ["#7a0f2a", "#e22a1f", "#ff7a1c", "#ffc53a", "#fff2a8"],
  barbs("#d94a18", "#ffe9a0") + OCELLUS,
);
const TONGUE = layered(TONGUE_D, ["#a3161f", "#ff4a1a", "#ff9a24", "#ffd24a", "#fff6c0"], "");
const TASSEL = svg(
  `<svg viewBox="0 0 20 80"><circle cx="10" cy="8" r="6" fill="#ff4d2a"/><rect x="5" y="13" width="10" height="6" fill="#d98a1c"/>` +
    `<path d="M10 19 L2 78 Q10 70 18 78 Z" fill="#ffd24a"/>` +
    `<path d="M10 22 L10 70 M6 26 L5 66 M14 26 L15 66" stroke="#d98a1c" stroke-width="1.4" fill="none"/></svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Palette (cel paints)

const COAT = cel(
  furEdge(furEdge("#d9261f", "#ff7a1c", { level: 0.3, teeth: 0.4, period: 0.07 }), "#ffc83a", {
    level: -0.25,
    teeth: 0.3,
    period: 0.055,
    ink: "#7a1030",
  }),
);
const HEAD = cel(furEdge("#e8401a", "#ffc83a", { level: -0.1, teeth: 0.3, period: 0.04, along: [1, 0, 0] }));
const GOLD = cel("#ffd24a", "#d98a1c");
const BEAK = cel("#ffd24a", "#d9901e");
const LEG = cel("#f5a021", "#c4601a");
const CLAW = cel("#4a2030", "#2b1220");
const GEM = "#ff3d1f";
const BEAD = "#ff4d2a";
const EMBER = "#ffb03a";

const lerp3 = (a: number[], c: number[], t: number) => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];
const spanPts = (a: number[], c: number[], n: number) =>
  Array.from({ length: n }, (_, i) => lerp3(a, c, n === 1 ? 0 : i / (n - 1)));

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(11);
  type J = typeof hips;

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.8, -0.2], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.2],
      [0, 0.9, 0.08],
      [0, 1.05, 0.26],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.05, 0.26],
      [0, 1.22, 0.34],
      [0, 1.38, 0.38],
      [0, 1.5, 0.46],
    ]),
    { parent: spine.joints[spine.joints.length - 1], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.5, 0.46], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, down: 0.04 }),
    aim: head.local({ forward: 0.25, down: 0.05 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.74, -0.4],
      [0, 0.68, -0.75],
      [0, 0.6, -1.1],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Generic card row: one card per frame with its own length, on a bone.
  type RowOpts = { bend?: number; flow?: number[]; lean?: number; glow?: number };
  const row = (
    frames: Fr[],
    tex: THREE.Texture[],
    width: number,
    len: (i: number) => number,
    bone: J | ((i: number) => J),
    o: RowOpts = {},
  ) => {
    frames.forEach((f, i) => {
      const meshes = b.cards([f], tex, {
        size: [width, len(i)],
        flow: o.flow ?? [0, 1, 0],
        bend: o.bend ?? 0,
        lean: o.lean ?? 0,
        bone: typeof bone === "function" ? bone(i) : bone,
        rng: rand,
        sink: 0.05,
        vary: 0.06,
      });
      if (o.glow) glow(meshes, o.glow);
    });
  };
  const fan = (s: number, pts: number[][], deg0: number, deg1: number, rise0: number, rise1: number, yoff = 0) =>
    pts.map((p, i) => {
      const t = pts.length > 1 ? i / (pts.length - 1) : 0;
      const th = (deg0 + (deg1 - deg0) * t) * DEG;
      return frame([p[0], p[1] + yoff, p[2]], [s * Math.cos(th), rise0 + (rise1 - rise0) * t, -Math.sin(th)]);
    });

  // ------------------------------------------------------------------------------------------------ body
  const bodyS = b.sweep(
    catmull([
      [0, 0.74, -0.5],
      [0, 0.8, -0.2],
      [0, 0.9, 0.08],
      [0, 1.05, 0.26],
      [0, 1.22, 0.34],
      [0, 1.38, 0.38],
      [0, 1.48, 0.45],
    ]),
    [0.07, 0.18, 0.25, 0.22, 0.12, 0.085, 0.07],
    { bone: [hips, spine, neck], color: COAT, sides: 10 },
  );
  b.sweep(tail, [0.1, 0.07, 0.04], { color: COAT, sides: 8 });
  const skin = b.surface(bodyS);

  // Breast and body feather coat.
  const coatHits = skin.scatter(260, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.y > -0.4 });
  b.cards(coatHits, [F_B, F_A, F_B, F_C], {
    size: [0.09, 0.16],
    lean: 62,
    bend: 12,
    vary: 0.25,
    spin: 20,
    rng: rng(6),
  });
  // Licking flame tongues along the back.
  const backHits = skin.scatter(40, { rng: rng(9), minDist: 0.12, filter: (h) => h.n.y > 0.5 && h.at.z < 0.2 });
  glow(
    b.cards(backHits, [TONGUE, F_A], {
      size: [0.12, 0.3],
      lean: 75,
      bend: 20,
      flow: [0, 0, -1],
      vary: 0.25,
      rng: rng(10),
    }),
    0.6,
  );

  // Gold collar with glowing beads, pyro gem and tassels.
  const collar = skin.loop(neck.joints[1], { lift: 0.02 });
  b.sweep(collar, 0.015, { color: GOLD });
  b.along(collar, 12, (at) =>
    glow(b.part(new THREE.OctahedronGeometry(0.022, 0), BEAD, { at: at.moved(at.local([0, 0.01, 0])), flat: true }), 1),
  );
  const gemHit = skin.nearest([0, 1.0, 0.8]);
  b.stick(new THREE.TorusGeometry(0.06, 0.014, 5, 8).rotateX(Math.PI / 2), GOLD, gemHit, { embed: 0.5 });
  glow(b.stick(new THREE.OctahedronGeometry(0.052, 0), GEM, gemHit, { embed: 0.2, flat: true }), 1.3);
  const gp = gemHit.at;
  b.cards(
    [-1, 0, 1].map((k) => frame([gp.x + k * 0.04, gp.y - 0.07, gp.z + 0.03], [0, 1, 0])),
    TASSEL,
    { size: [0.05, 0.26], lean: 180, flow: [0, 0, 1], vary: 0.1, rng: rand },
  );

  // ------------------------------------------------------------------------------------------------ head
  const HC = head.local({ forward: 0.07, up: 0.02 });
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEAD, {
    bone: head,
    at: HC,
    scale: [0.1, 0.095, 0.125],
  });
  const eye = animeEye({ iris: "#2fe0cc" });
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(skull.at).at(s * 40, 6);
    if (hit) b.decal(skullSkin, eye, { at: hit, size: [0.062, 0.085], mirror: s > 0 });
  }
  b.sweep(
    catmull([
      head.local({ forward: 0.15, up: 0.0 }),
      head.local({ forward: 0.25, up: 0.008 }),
      head.local({ forward: 0.33, down: 0.05 }),
    ]),
    [0.055, 0],
    { bone: head, color: BEAK, caps: { start: "flat", end: "point" }, sides: 8 },
  );
  b.sweep(
    catmull([
      head.local({ forward: 0.14, down: 0.045 }),
      head.local({ forward: 0.24, down: 0.052 }),
      head.local({ forward: 0.3, down: 0.038 }),
    ]),
    [0.042, 0],
    { bone: jaw, color: BEAK, caps: { start: "flat", end: "point" }, sides: 8 },
  );
  // Head crest and streamers.
  const crest: Fr[] = [
    frame(head.local({ forward: 0.04, up: 0.11 }), [0, 0.8, -0.6]),
    frame(head.local({ forward: -0.02, up: 0.1 }), [0, 0.5, -0.9]),
  ];
  const crestLen = [0.6, 0.78];
  row(crest, [F_A, F_B], 0.12, (i) => crestLen[i], head, { bend: 25, glow: 1 });
  for (const s of [1, -1]) {
    const side: Fr[] = [
      frame(head.local({ forward: 0.03, up: 0.1, left: s * 0.04 }), [s * 0.5, 0.45, -0.8]),
      frame(head.local({ forward: -0.01, up: 0.08, left: s * 0.06 }), [s * 0.7, 0.3, -0.8]),
    ];
    row(side, [F_B, F_C], 0.1, (i) => 0.45 - i * 0.07, head, { bend: 22, glow: 1 });
    row(
      [frame(head.local({ forward: -0.02, up: 0.05, left: s * 0.05 }), [s * 0.3, 0.12, -1])],
      [F_TAIL],
      0.1,
      () => 1.1,
      head,
      { bend: -18, glow: 1 },
    );
  }
  const cheek = b.surface(skull).scatter(40, {
    rng: rng(12),
    minDist: 0.035,
    filter: (h) => h.n.z < 0.3 && h.n.y > -0.4,
  });
  b.cards(cheek, [F_A, F_B], { size: [0.05, 0.1], lean: 65, vary: 0.2, rng: rng(13) });

  // ------------------------------------------------------------------------------------------------ wings
  const PRIM = [F_C, F_A, F_A];
  const primLen = [0.96, 1.02, 1.06, 1.08, 1.08, 1.05, 1.0, 0.94, 0.85, 0.72];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = [s * 0.2, 1.0, 0.12];
    const el = [s * 0.62, 1.1, -0.02];
    const wr = [s * 1.05, 1.18, -0.18];
    const hd = [s * 1.32, 1.2, -0.3];
    const wing = b.chain(`wing${S}`, catmull([sh, el, wr, hd]), {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.085, 0.06, 0.045, 0.03], { color: COAT, sides: 8 });
    const [jSh, jEl, jWr, jHd] = wing.joints;

    // Flight feathers: tertials, secondaries, primaries (back to front so the leading rows lie on top).
    row(fan(s, spanPts(sh, el, 8), 98, 88, 0, 0, -0.01), [F_B, F_A], 0.18, (i) => 0.7 - 0.12 * (i / 7), (i) => (i < 4 ? jSh : jEl), {
      bend: 8,
      glow: 0.7,
    });
    row(fan(s, spanPts(el, wr, 12), 84, 70, -0.02, -0.02, -0.005), [F_A, F_B], 0.17, (i) => 0.78 + 0.1 * (i / 11), (i) => (i < 6 ? jEl : jWr), {
      bend: 10,
      glow: 0.75,
    });
    row(fan(s, spanPts(wr, hd, 10), 62, -8, 0, 0.06), PRIM, 0.17, (i) => primLen[i], jHd, { bend: 14, glow: 0.8 });

    // Coverts: a middle row of gold-orange cards, then small lesser coverts on the leading edge.
    const mid = Array.from({ length: 14 }, (_, i) => wing.at(0.1 + (0.85 * i) / 13).at.toArray());
    row(fan(s, mid, 88, 50, 0, 0.03, 0.014), [F_B, F_A], 0.15, (i) => 0.5 - 0.18 * (i / 13), (i) => wing.joints[Math.min(3, Math.floor((0.1 + (0.85 * i) / 13) * 3))], {
      bend: 6,
      glow: 0.6,
    });
    const lead = Array.from({ length: 18 }, (_, i) => wing.at(0.05 + (0.92 * i) / 17).at.toArray());
    row(fan(s, lead, 80, 45, 0, 0.02, 0.03), [F_B, F_C, F_A], 0.1, () => 0.2, (i) => wing.joints[Math.min(3, Math.floor((0.05 + (0.92 * i) / 17) * 3))], {
      bend: 4,
    });
    // Flame tongues licking up from the leading edge.
    const tongues = Array.from({ length: 9 }, (_, i) => {
      const p = wing.at(0.12 + (0.84 * i) / 8).at;
      return frame([p.x, p.y + 0.05, p.z], [0, 1, 0]);
    });
    glow(
      b.cards(tongues, [TONGUE, F_A], {
        size: [0.08, 0.24],
        lean: 20,
        flow: [0, 0, -1],
        cross: true,
        vary: 0.25,
        rng: rand,
        bone: jWr,
      }),
      0.7,
    );

    // Gold cuffs on the arm.
    for (const [t, r] of [
      [0.34, 0.085],
      [0.64, 0.062],
    ] as const) {
      const ringed = b.ring(wing.at(t), { count: 8, radius: r }).items;
      b.sweep(catmull(ringed, { closed: true }), 0.013, { color: GOLD, sides: 6 });
    }

    // ------------------------------------------------------------------------------------------------ legs
    const hipPt = [s * 0.12, 0.74, -0.12];
    const fx = s * 0.13;
    const fz = 0.08;
    const pts = limb(
      hipPt,
      [fx, 0.026, fz],
      [0.3, 0.34, 0.3],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
      contact: [fx, 0, fz],
    });
    b.sweep(leg, [0.075, 0.055, 0.035, 0.028], { color: LEG, sides: 8 });
    const foot = leg.joints[leg.joints.length - 1];
    // Thigh puffs.
    for (const [t, r] of [
      [0.06, 0.09],
      [0.14, 0.075],
      [0.22, 0.062],
    ] as const) {
      const items = b.ring(leg.at(t), { count: 7, radius: r }).items;
      b.cards(items, [F_B, F_A, F_C], {
        size: [0.1, 0.17],
        lean: 70,
        flow: [0, -1, 0],
        vary: 0.2,
        rng: rand,
      });
    }
    // Gold anklet.
    b.sweep(catmull(b.ring(leg.at(0.82), { count: 8, radius: 0.045 }).items, { closed: true }), 0.01, {
      color: GOLD,
      sides: 6,
    });
    // Toes and talons.
    const toeY = 0.022;
    for (const deg of [-32, 0, 32]) {
      const sn = Math.sin(deg * DEG);
      const cs = Math.cos(deg * DEG);
      const end = [fx + sn * 0.2, toeY, fz + cs * 0.2];
      b.rod([fx, toeY, fz], end, [0.026, 0.02], { color: LEG, bone: foot, sides: 6 });
      b.spike(end, [sn, -0.3, cs], 0.075, 0.02, { color: CLAW, bone: foot, sides: 6 });
    }
    b.rod([fx, toeY, fz], [fx, toeY, fz - 0.13], [0.026, 0.02], { color: LEG, bone: foot, sides: 6 });
    b.spike([fx, toeY, fz - 0.13], [0, -0.3, -1], 0.07, 0.02, { color: CLAW, bone: foot, sides: 6 });
  }

  // ------------------------------------------------------------------------------------------------ tail
  const tailRoot = tail.at(0.05).at.toArray();
  const plumes: Fr[] = [];
  const plumeLen: number[] = [];
  for (let k = 0; k < 9; k++) {
    const u = (k - 4) / 4;
    const ang = u * 38 * DEG;
    plumes.push(
      frame(
        [tailRoot[0] + u * 0.05, tailRoot[1], tailRoot[2]],
        [Math.sin(ang), -0.12 + 0.1 * Math.abs(u), -Math.cos(ang)],
      ),
    );
    plumeLen.push(1.7 - 0.5 * Math.abs(u));
  }
  row(plumes, [F_TAIL, F_A, F_TAIL, F_B], 0.2, (i) => plumeLen[i], tail.joints[1], { bend: -22, glow: 0.8 });
  const under: Fr[] = [];
  for (let k = 0; k < 7; k++) {
    const u = (k - 3) / 3;
    const ang = u * 45 * DEG;
    under.push(frame([u * 0.05, tailRoot[1] - 0.02, tailRoot[2] + 0.1], [Math.sin(ang), -0.1, -Math.cos(ang)]));
  }
  row(under, [F_B, F_C], 0.2, () => 1.0, tail.joints[0], { bend: -14, glow: 0.7 });
  for (const s of [1, -1])
    row([frame([s * 0.04, tailRoot[1], tailRoot[2]], [s * 0.4, -0.02, -1])], [F_TAIL], 0.13, () => 2.1, tail.joints[1], {
      bend: -26,
      glow: 0.9,
    });

  // ------------------------------------------------------------------------------------------------ embers
  for (let i = 0; i < 16; i++) {
    const r = 0.015 + 0.02 * rand();
    glow(
      b.part(new THREE.OctahedronGeometry(r, 0), EMBER, {
        bone: hips,
        at: [(rand() - 0.5) * 4, 1.45 + rand() * 0.6, -1.2 + rand() * 1.8],
        flat: true,
      }),
      1,
    );
  }

  return b.root;
}
