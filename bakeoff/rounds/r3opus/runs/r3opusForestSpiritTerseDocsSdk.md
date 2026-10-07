```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  offset,
  svg,
  countershade,
  mottle,
  grain,
  spots,
} from "agentic-3js-builder";

export const meta = {
  name: "Forest Spirit",
  description:
    "A small mossy forest spirit: a bark-and-moss body with a tree-ring belly, a pale mask face with glowing teal eyes, driftwood antlers sprouting leaves, a leaf mantle, an autumn leaf skirt and toadstools growing from its crown.",
};

const BARK = "#5a3d2b";
const BARK2 = "#3b281c";
const MOSS = "#5f8f3a";
const MOSS2 = "#8db84e";
const MASK = "#f0e7d0";
const MASK2 = "#dccfb0";
const ANTLER = "#cdb894";
const LEAF_DEEP = "#3f7a34";
const LEAF_LIGHT = "#8fc25a";
const LEAF_AMBER = "#d98a2b";
const LEAF_RUST = "#b8502a";
const GLOW = "#8ff7e0";
const BERRY = "#ffd36b";
const STEM = "#efe2c4";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });

  // ---------- textures ----------
  const leafTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
      <path d="M16 63 C 1 44, 2 18, 16 1 C 30 18, 31 44, 16 63 Z" fill="#ffffff"/>
      <path d="M16 62 L16 6" stroke="#8c8c8c" stroke-width="1.8" fill="none"/>
      <path d="M16 46 L8 38 M16 34 L7 26 M16 22 L10 15 M16 46 L24 38 M16 34 L25 26 M16 22 L22 15" stroke="#ababab" stroke-width="1.6" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80">
      <ellipse cx="32" cy="40" rx="29" ry="37" fill="#1c1a2e"/>
      <ellipse cx="32" cy="44" rx="17" ry="23" fill="#1f8f86"/>
      <ellipse cx="32" cy="46" rx="10" ry="14" fill="#7ff5df"/>
      <ellipse cx="22" cy="26" rx="7" ry="9" fill="#ffffff"/>
      <circle cx="40" cy="58" r="3.5" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const ringsTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
      <ellipse cx="50" cy="60" rx="48" ry="58" fill="#c99b63"/>
      <ellipse cx="50" cy="60" rx="39" ry="48" fill="none" stroke="#8a5a34" stroke-width="3"/>
      <ellipse cx="50" cy="61" rx="30" ry="37" fill="none" stroke="#8a5a34" stroke-width="3"/>
      <ellipse cx="50" cy="62" rx="21" ry="26" fill="none" stroke="#8a5a34" stroke-width="3"/>
      <ellipse cx="50" cy="62" rx="12" ry="15" fill="none" stroke="#8a5a34" stroke-width="3"/>
      <circle cx="50" cy="62" r="4" fill="#6b4226"/>
      <path d="M50 6 L54 26 L48 40" stroke="#6b4226" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const markTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80">
      <path d="M32 4 C 16 22, 16 40, 32 60 C 48 40, 48 22, 32 4 Z" fill="#e2803a"/>
      <path d="M32 12 L32 54" stroke="#f6c46a" stroke-width="4" fill="none"/>
      <circle cx="16" cy="70" r="5" fill="#e2803a"/>
      <circle cx="48" cy="70" r="5" fill="#e2803a"/>
    </svg>`,
    { size: 128 },
  );
  const blushTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#f2a08f"/>
      <circle cx="11" cy="12" r="3" fill="#f8c7bb"/>
    </svg>`,
    { size: 64 },
  );

  // ---------- paints ----------
  const barkP = grain(BARK, BARK2, { size: 0.03, axis: "y" });
  const bodyP = countershade(mottle(MOSS, MOSS2, { size: 0.06, seed: 3 }), barkP, { level: 0.45 });
  const maskP = mottle(MASK, MASK2, { size: 0.05, seed: 5 });
  const capP = spots("#d9472b", "#fff4e0", { size: 0.014, amount: 0.3, seed: 9 });
  const antlerP = grain(ANTLER, "#a8916c", { size: 0.02, axis: "y" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.46, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.46, 0],
      [0, 0.62, 0.015],
      [0, 0.8, 0],
    ]),
    { parent: hips, count: 3, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 0.8, 0],
      [0, 0.9, 0.02],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.9, 0.02], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.95, 0.02], aim: [0, 0.9, 0.17], role: "jaw" });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.4, 0], w: 0.3, h: 0.26 },
      { at: [0, 0.52, 0.02], w: 0.38, h: 0.32 },
      { at: [0, 0.68, 0.01], w: 0.36, h: 0.3 },
      { at: [0, 0.82, 0], w: 0.26, h: 0.22 },
    ],
    { bone: [hips, spine], color: bodyP },
  );
  b.sweep(neck, 0.06, { color: barkP });

  // tree-ring belly
  b.decal(body, ringsTex, { at: [0, 0.58, 0.18], dir: [0, 0, 1], size: [0.2, 0.24] });

  // glowing lichen
  const bodySurf = b.surface(body);
  for (const h of bodySurf.scatter(16, {
    rng: rng(7),
    minDist: 0.07,
    filter: (h) => h.n.z < 0.55 && h.n.y > -0.3,
  }))
    b.stick(new THREE.CylinderGeometry(0.013, 0.013, 0.006, 6), GLOW, h, { embed: 0.5 });

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(0.16, 12, 9), maskP, {
    bone: head,
    at: [0, 1.03, 0.02],
    scale: [1.08, 0.95, 0.95],
  });
  b.part(new THREE.SphereGeometry(0.115, 10, 7), maskP, {
    bone: jaw,
    at: [0, 0.9, 0.07],
    scale: [1, 0.55, 1],
  });

  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, { at: [s * 0.065, 1.04, 0.16], dir: [0, 0, 1], size: [0.07, 0.09], mirror: s > 0 });
    b.decal(skull, blushTex, { at: [s * 0.11, 0.98, 0.13], dir: [s * 0.5, 0, 1], size: [0.045, 0.045] });
  }
  b.decal(skull, markTex, { at: [0, 1.125, 0.14], dir: [0, 0.35, 1], size: [0.05, 0.065] });

  const skullSurf = b.surface(skull);
  const noseHit = skullSurf.ray([0, 0.985, 0.5], [0, 0, -1]);
  if (noseHit) b.stick(new THREE.SphereGeometry(0.014, 6, 4), BARK, noseHit, { embed: 0.4 });

  // antlers with leaves and berries
  const leafFrames: ReturnType<typeof frame>[] = [];
  const headC = v(0, 1.03, 0.02);
  for (const s of [1, -1]) {
    const h = skullSurf.around(headC).at(s * 45, 52);
    if (!h) continue;
    const base = offset(h, h, -0.02);
    const root = h.at.clone();
    const path = catmull([
      base,
      root.clone().add(v(s * 0.04, 0.09, -0.01)),
      root.clone().add(v(s * 0.12, 0.19, -0.03)),
      root.clone().add(v(s * 0.15, 0.31, 0.0)),
    ]);
    b.sweep(path, [0.028, 0.008], { bone: head, color: antlerP, caps: { end: "point" } });
    const tips: THREE.Vector3[] = [path.at(1)];
    const tines: [number, THREE.Vector3][] = [
      [0.45, v(s * 0.08, 0.06, 0.05)],
      [0.7, v(-s * 0.02, 0.09, -0.05)],
    ];
    for (const [t, d] of tines) {
      const p0 = path.at(t);
      const p1 = p0.clone().add(d.clone().multiplyScalar(0.5)).add(v(0, 0.02, 0));
      const p2 = p0.clone().add(d);
      b.sweep(catmull([p0, p1, p2]), [0.015, 0.004], { bone: head, color: antlerP, caps: { end: "point" } });
      tips.push(p2);
    }
    for (const tp of tips) b.part(new THREE.SphereGeometry(0.016, 6, 4), BERRY, { bone: head, at: tp });
    [0.3, 0.55, 0.82].forEach((t, k) => {
      leafFrames.push(frame(path.at(t), [s * 0.7, 0.4, k % 2 ? 0.6 : -0.6]));
    });
  }
  b.cards(leafFrames, leafTex, {
    size: [0.05, 0.09],
    lean: 30,
    bend: 20,
    flow: [0, 1, 0],
    bone: head,
    color: LEAF_LIGHT,
    vary: 0.2,
    rng: rng(11),
  });

  // toadstools on the crown
  const shroomSpots: [number, number, number][] = [
    [-150, 40, 1],
    [-120, 55, 0.8],
    [165, 45, 1.2],
  ];
  for (const [az, el, k] of shroomSpots) {
    const h = skullSurf.around(headC).at(az, el);
    if (!h) continue;
    const hgt = 0.045 * k;
    const stem = b.stick(new THREE.CylinderGeometry(0.008 * k, 0.011 * k, hgt, 6), STEM, h, {
      embed: 0.3,
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.026 * k, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), capP, {
      bone: head,
      at: stem.local([0, hgt * 0.45, 0]),
      dir: stem.axis,
    });
  }

  // ---------- leaf mantle ----------
  const mantleA = b.ring(frame([0, 0.83, 0], [0, 1, 0]), { count: 14, radius: 0.12 }).items;
  b.cards(mantleA, leafTex, {
    size: [0.13, 0.2],
    lean: 70,
    bend: 25,
    flow: [0, -1, 0],
    bone: chest,
    color: LEAF_DEEP,
    vary: 0.15,
    rng: rng(21),
  });
  const mantleB = b.ring(frame([0, 0.87, 0.01], [0, 1, 0]), { count: 11, radius: 0.09, fromDeg: 16, toDeg: 376 })
    .items;
  b.cards(mantleB, leafTex, {
    size: [0.1, 0.15],
    lean: 55,
    bend: 25,
    flow: [0, -1, 0],
    bone: chest,
    color: LEAF_LIGHT,
    vary: 0.15,
    rng: rng(22),
  });

  // autumn leaf skirt
  const skirt = b.ring(frame([0, 0.43, 0.01], [0, 1, 0]), { count: 16, radius: 0.15 }).items;
  b.cards(
    skirt.filter((_, i) => i % 2 === 0),
    leafTex,
    { size: [0.1, 0.17], lean: 72, bend: 20, flow: [0, -1, 0], bone: hips, color: LEAF_AMBER, vary: 0.2, rng: rng(31) },
  );
  b.cards(
    skirt.filter((_, i) => i % 2 === 1),
    leafTex,
    { size: [0.1, 0.15], lean: 66, bend: 20, flow: [0, -1, 0], bone: hips, color: LEAF_RUST, vary: 0.2, rng: rng(32) },
  );

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      [
        [s * 0.1, 0.42, 0],
        [s * 0.12, 0.24, 0.03],
        [s * 0.12, 0.08, 0],
      ],
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.12, 0, 0.03] },
    );
    b.sweep(leg, [0.06, 0.045], { color: barkP });
    const ankle = leg.tip!;
    b.capsule([s * 0.12, 0.05, -0.04], [s * 0.12, 0.05, 0.07], 0.05, { bone: ankle, color: BARK2 });
    for (const dx of [-0.03, 0, 0.03]) {
      b.spike([s * 0.12 + dx, 0.03, 0.1], [dx * 2.5, -0.1, 1], 0.07, 0.022, { bone: ankle, color: BARK });
    }
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      [
        [s * 0.16, 0.76, 0],
        [s * 0.36, 0.755, -0.01],
        [s * 0.54, 0.75, 0],
      ],
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(arm, [0.045, 0.03], { color: barkP });
    const wrist = arm.tip!;
    b.part(new THREE.SphereGeometry(0.04, 8, 6), BARK, { bone: wrist, at: [s * 0.55, 0.75, 0], scale: [1.2, 0.8, 1.1] });
    for (let i = 0; i < 3; i++) {
      const dz = (i - 1) * 0.5;
      const p0 = v(s * 0.56, 0.75, dz * 0.03);
      const p1 = p0.clone().add(v(s * 0.06, -0.005, dz * 0.045));
      const p2 = p1.clone().add(v(s * 0.05, 0.004, dz * 0.035));
      const finger = b.chain(`finger${i + 1}${S}`, [p0, p1, p2], {
        parent: wrist,
        names: [`finger${i + 1}${S}1`, `finger${i + 1}${S}2`, `finger${i + 1}${S}3`],
        role: "digit",
      });
      b.sweep(finger, [0.016, 0.007], { color: BARK, caps: { end: "point" } });
      b.part(new THREE.SphereGeometry(0.011, 6, 4), GLOW, { bone: finger.tip!, at: p2 });
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.42, -0.12],
      [0, 0.37, -0.25],
      [0, 0.45, -0.36],
      [0, 0.56, -0.34],
    ]),
    { parent: hips, count: 4, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.05 * (1 - t) + 0.014, { color: barkP });
  b.cards([tail.at(1), tail.at(0.85)], leafTex, {
    size: [0.08, 0.13],
    cross: true,
    bend: 20,
    lean: 15,
    color: LEAF_LIGHT,
    vary: 0.2,
    rng: rng(41),
  });

  return b.root;
}
```