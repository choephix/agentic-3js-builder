```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  frame,
  grain,
  limb,
  line,
  mottle,
  offset,
  paint,
  rng,
  scales,
  spots,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Forest spirit",
  description:
    "A stag-antlered wood spirit: bark body with a moss yoke, leaf mantle and skirt, moss beard, root feet, and a staff crowned with a glowing seed pod.",
};

const BARK = "#3d2a1d";
const BARK_MID = "#6b4a31";
const BARK_PALE = "#b78b5b";
const KNOT = "#2a1b12";
const MOSS = "#66a642";
const MOSS_DEEP = "#2e5f2a";
const ANTLER = "#e4d4a8";
const EYE_DARK = "#1b130d";
const CAP = "#c8432b";
const CAP_SPOT = "#f6eedb";
const STEM = "#efe2c4";
const POD = "#ffc94a";

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });

  // Drawn textures: two leaves, an amber eye, and hanging moss strands.
  const leafA = svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 1 C 39 18 41 44 20 63 C -1 44 1 18 20 1 Z" fill="#8fd150"/>
      <path d="M20 7 C 23 24 23 42 20 57" fill="none" stroke="#2c6b2b" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const leafB = svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 1 C 36 16 38 46 20 63 C 2 46 4 16 20 1 Z" fill="#5fae3d"/>
      <path d="M20 7 C 22 24 22 42 20 57" fill="none" stroke="#d6ef8a" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const leaves = [leafA, leafB];
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="32" rx="29" ry="22" fill="#ffb53a"/>
      <ellipse cx="32" cy="32" rx="29" ry="22" fill="none" stroke="#5a3210" stroke-width="3"/>
      <ellipse cx="33" cy="33" rx="7" ry="17" fill="#1b130d"/>
      <circle cx="26" cy="23" r="4" fill="#fff6d8"/>
    </svg>`,
    { size: 128 },
  );
  const mossTex = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#9cc45c" stroke-width="3" stroke-linecap="round">
        <path d="M7 0 C 3 20 11 40 5 63"/>
        <path d="M16 0 C 20 22 12 42 17 63"/>
        <path d="M25 0 C 22 18 28 38 24 56"/>
      </g>
    </svg>`,
    { size: 128 },
  );

  // Paints: bark plates with moss patches up top, grained limbs, a mossy crown, spotted caps.
  const torsoPaint = paint((p, _n, _s) =>
    p.y > 1.16
      ? mottle(MOSS, MOSS_DEEP, { size: 0.08 })
      : scales(BARK_MID, BARK, { size: 0.09, width: 0.012 }),
  );
  const limbPaint = grain(BARK_MID, BARK, { size: 0.03, axis: "y" });
  const headPaint = countershade(MOSS, BARK_PALE, { level: 0.35 });
  const capPaint = spots(CAP, CAP_SPOT, { size: 0.03, amount: 0.3 });

  // ---- Skeleton: hips -> spine -> neck -> head -> jaw ----
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, 0],
      [0, 1.14, 0.01],
      [0, 1.3, 0.02],
      [0, 1.42, 0.02],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.42, 0.02],
      [0, 1.54, 0.05],
      [0, 1.63, 0.08],
    ]),
    { parent: spine, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.7, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.64, 0.03], role: "jaw" });

  // ---- Trunk: a bark tube that swells at the hips and chest ----
  const torso = b.sweep(spine, [0.13, 0.095, 0.15, 0.12], { color: torsoPaint });
  const torsoSurf = b.surface(torso);
  b.sweep(neck, [0.056, 0.05], { color: limbPaint });

  // ---- Head: faceted pale wood with a moss crown, a carved chin and a knot nose ----
  const headPart = b.part(new THREE.SphereGeometry(1, 10, 7).scale(0.115, 0.13, 0.135), headPaint, {
    bone: head,
    at: [0, 1.7, 0.1],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 8, 5).scale(0.07, 0.035, 0.095), BARK_PALE, {
    bone: jaw,
    at: [0, 1.615, 0.15],
    flat: true,
  });
  b.spike([0, 1.73, 0.21], [0, 1.69, 0.26], null, 0.02, { color: BARK_PALE, bone: head });

  const face = b.surface(headPart);
  for (const s of [1, -1]) {
    const eye = face.around([0, 1.7, 0.1]).at(s * 24, 6);
    if (eye) {
      b.decal(headPart, eyeTex, {
        at: eye,
        dir: [s * 0.3, 0.05, 1],
        size: [0.06, 0.045],
        mirror: s > 0,
        bone: head,
      });
    }
    const brow = face.around([0, 1.7, 0.1]).at(s * 26, 32);
    if (brow) {
      b.cards([frame(brow, [s * 0.4, 1, 0.5])], leaves, {
        size: [0.05, 0.07],
        lean: 40,
        rng: rng(70 + s),
        bone: head,
      });
    }
  }
  const mouth = face.drape(
    catmull([
      [-0.055, 1.665, 0.19],
      [-0.03, 1.65, 0.212],
      [0, 1.645, 0.218],
      [0.03, 1.65, 0.212],
      [0.055, 1.665, 0.19],
    ]),
    { lift: 0.002 },
  );
  b.sweep(mouth, 0.0055, { color: EYE_DARK });

  // Moss beard hanging from the chin (cards on the jaw).
  const beard = [
    [-0.035, 1.588, 0.2],
    [0, 1.583, 0.215],
    [0.035, 1.588, 0.2],
  ].map((p) => frame(p, [0, 1, 0]));
  b.cards(beard, mossTex, { size: [0.06, 0.12], lean: 180, flow: [0, 0, 1], bone: jaw });

  // ---- Antlers: a pale beam per side, two sprouted tines, leaves on every tip ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const stem = catmull([
      [s * 0.06, 1.78, 0.06],
      [s * 0.14, 1.93, 0.045],
      [s * 0.27, 2.03, 0],
      [s * 0.38, 2.09, -0.05],
    ]);
    const beam = b.sweep(stem, [0.03, 0.011], { bone: head, color: ANTLER });
    const tines: { t: number; dir: [number, number, number]; len: number }[] = [
      { t: 0.4, dir: [s * 0.35, 1, 0.45], len: 0.2 },
      { t: 0.72, dir: [s * 0.7, 1, -0.15], len: 0.17 },
    ];
    tines.forEach((tn, i) => {
      const d = new THREE.Vector3(...tn.dir).normalize();
      const tip = offset(stem.at(tn.t), d, tn.len);
      b.sprout(`antler${side}${i}`, beam.at(tn.t), tip, [0.017, 0.005], {
        count: 0,
        color: ANTLER,
        caps: { end: "point" },
      });
      b.cards([frame(tip, d)], leaves, {
        size: [0.1, 0.14],
        lean: 30,
        cross: true,
        rng: rng(40 + i),
        bone: head,
      });
    });
    b.cards([frame(stem.at(1), [s * 0.5, 0.4, -0.1])], leaves, {
      size: [0.11, 0.15],
      lean: 35,
      cross: true,
      rng: rng(44),
      bone: head,
    });
  }

  // ---- Leaf mantle over the shoulders and chest ----
  const mantle = torsoSurf.scatter(40, {
    rng: rng(11),
    minDist: 0.055,
    filter: (h) => h.at.y > 1.18,
  });
  b.cards(mantle, leaves, {
    size: [0.085, 0.12],
    lean: 50,
    flow: [0, -1, 0],
    bend: 20,
    vary: 0.25,
    rng: rng(12),
  });

  // ---- Bark knots and mushrooms on the trunk ----
  for (const az of [0, -38, 150]) {
    const hit = torsoSurf.around([0, 1.25, 0]).at(az, 10);
    if (hit) {
      b.stick(new THREE.SphereGeometry(1, 6, 4).scale(0.024, 0.03, 0.02), KNOT, hit, { embed: 0.4 });
    }
  }
  const shrooms: [number, number][] = [
    [70, -12],
    [-110, 20],
  ];
  for (const [az, el] of shrooms) {
    const hit = torsoSurf.around([0, 1.2, 0]).at(az, el);
    if (!hit) continue;
    b.lathe(
      [
        [0, 0],
        [0.016, 0],
        [0.013, 0.05],
        [0, 0.05],
      ],
      { at: hit, axis: hit, color: STEM },
    );
    b.lathe(
      [
        [0, 0.044],
        [0.03, 0.044],
        [0.058, 0.052],
        [0.062, 0.064],
        [0.05, 0.076],
        [0, 0.08],
      ],
      { at: hit, axis: hit, color: capPaint },
    );
  }

  // ---- Leaf skirt hung from the hips ----
  const skirt = b.ring(line([0, 1.06, 0], [0, 0.9, 0]), {
    count: 7,
    radius: 0.14,
    fromDeg: -70,
    toDeg: 70,
    tilt: 60,
  });
  b.cards(skirt.items, leaves, {
    size: [0.1, 0.16],
    lean: 15,
    bend: 20,
    rng: rng(51),
    bone: hips,
  });

  // ---- Arms, legs, root hands and root feet ----
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    const arm = b.chain(
      `arm${L}`,
      catmull([
        [s * 0.14, 1.37, 0],
        [s * 0.3, 1.1, 0.05],
        [s * 0.36, 0.84, 0.12],
      ]),
      { parent: spine, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" },
    );
    b.sweep(arm, [0.056, 0.04, 0.032], { color: limbPaint });
    b.part(new THREE.SphereGeometry(1, 7, 5).scale(0.045, 0.055, 0.04), limbPaint, {
      bone: arm,
      at: [s * 0.36, 0.8, 0.13],
      flat: true,
    });
    for (const k of [-1, 0, 1]) {
      b.spike(
        [s * (0.355 + k * 0.012), 0.78, 0.15],
        [s * (0.36 + k * 0.03), 0.66, 0.17],
        null,
        0.011,
        { color: BARK, bone: arm },
      );
    }

    const leg = b.chain(
      `leg${L}`,
      limb([s * 0.11, 0.93, 0], [s * 0.13, 0.03, 0.05], [0.46, 0.46], [[0, 0, 1]]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" },
    );
    b.sweep(leg, [0.075, 0.05, 0.036], { color: limbPaint });
    b.part(new THREE.SphereGeometry(1, 8, 5).scale(0.06, 0.03, 0.11), BARK, {
      bone: leg,
      at: [s * 0.13, 0.03, 0.05],
      flat: true,
    });
    for (const k of [-1, 0, 1]) {
      b.spike(
        [s * (0.13 + k * 0.03), 0.025, 0.13],
        [s * (0.13 + k * 0.07), 0, 0.2],
        null,
        0.012,
        { color: BARK_MID, bone: leg },
      );
    }
  }

  // ---- Staff: a knotted branch in the right hand, crowned with a seed pod and leaves ----
  const staff = b.sweep(
    catmull([
      [-0.5, 0.004, 0.18],
      [-0.45, 0.42, 0.155],
      [-0.37, 0.84, 0.125],
      [-0.31, 1.2, 0.1],
      [-0.27, 1.5, 0.09],
    ]),
    [0.024, 0.017],
    { bone: "handR", color: BARK_MID, caps: { start: "flat", end: "round" } },
  );
  b.stick(new THREE.SphereGeometry(1, 6, 4).scale(0.03, 0.04, 0.03), BARK, staff.at(0.3), {
    embed: 0.3,
  });
  b.spike(staff.at(0.62, 90), staff.at(0.62, 90), 0.08, 0.008, { color: BARK_MID });
  b.lathe(
    [
      [0, 0],
      [0.03, 0.012],
      [0.042, 0.06],
      [0.03, 0.12],
      [0.012, 0.142],
      [0, 0.15],
    ],
    { at: [-0.27, 1.5, 0.09], color: POD, smoothing: 1, bone: "handR" },
  );
  const crown = b.ring(line([-0.27, 1.6, 0.09], [-0.27, 1.8, 0.09]), {
    count: 6,
    radius: 0.035,
    tilt: 40,
  });
  b.cards(crown.items, leaves, {
    size: [0.08, 0.12],
    lean: 20,
    rng: rng(61),
    bone: "handR",
  });

  return b.root;
}
```