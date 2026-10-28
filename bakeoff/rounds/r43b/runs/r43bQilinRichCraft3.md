```ts
import * as THREE from "three";
import { createBuilder, frame, rng, limb, catmull, spiral, scales, countershade, paint, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "High-fantasy anime qilin: jade-scaled hooved chimera with golden antlers, a dragon head with whiskers, a billowing cloud mane and a flame-tuft tail.",
};

const GOLD = "#f2c14e";
const GOLD_D = "#b9801f";
const IVORY = "#fff4dc";
const HOOF = "#2b2140";
const DARK = "#12303b";
const PEARL = "#ffe3f3";
const GEM = "#ff6fb5";
const MANE = ["#f2fffb", "#c8f6ee", "#93e3e6", "#b5b4ff", "#e9a6ff", "#ff9fd0"];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const P = (v: THREE.Vector3, x: number, y: number, z: number) => v.clone().add(V(x, y, z));

const EYE = svg(
  `<svg viewBox="0 0 80 50">
  <path d="M2 30 Q38 -6 78 22 Q40 52 2 30Z" fill="#1a0c2a"/>
  <path d="M10 28 Q40 4 70 22 Q40 44 10 28Z" fill="#ffd36b"/>
  <circle cx="42" cy="24" r="15" fill="#ff7ec0"/>
  <circle cx="42" cy="18" r="15" fill="#c04fe0" opacity="0.55"/>
  <ellipse cx="42" cy="25" rx="4.5" ry="12" fill="#1a0c2a"/>
  <circle cx="35" cy="17" r="5" fill="#ffffff"/>
  <circle cx="49" cy="32" r="2.5" fill="#ffffff"/>
  <path d="M2 30 Q38 -6 78 22" stroke="#0b0614" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

const SWIRL = svg(
  `<svg viewBox="0 0 100 80"><g fill="none" stroke="#ffd36b" stroke-width="5" stroke-linecap="round">
  <path d="M20 55 C5 55 5 30 25 30 C40 30 42 48 30 50 C22 51 20 44 26 42"/>
  <path d="M30 64 C50 72 72 66 82 50 C92 35 78 22 65 28 C55 33 60 45 68 42"/>
  <path d="M40 22 C45 8 65 8 72 18"/>
  <path d="M8 70 C14 66 20 68 24 72"/></g></svg>`,
  { size: 256 },
);

const FLAME = svg(
  `<svg viewBox="0 0 40 100"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#7ff0e4"/><stop offset="0.5" stop-color="#e6fffa"/><stop offset="1" stop-color="#ff9fd8"/></linearGradient></defs>
  <path d="M20 99 C2 80 4 55 14 40 C16 30 12 15 22 2 C24 18 36 30 34 52 C38 72 32 90 20 99Z" fill="url(#g)" stroke="#5fc9d6" stroke-width="2"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "qilin" });
  const R = rng(11);

  // ---------- paints ----------
  const back = scales(["#1f8a96", "#2a9aa0", "#1b7a8c", "#2c8f86"], "#0d3f4f", { size: 0.045 });
  const belly = scales(["#fbeccb", "#f4dcab"], "#d6b27a", { size: 0.045, seed: 3 });
  const coat = countershade(back, belly, { level: -0.3, soft: 0.25 });
  const goldScale = scales(["#f2c556", "#e7b345"], "#9a6a1e", { size: 0.035, seed: 5 });
  const legPaint = paint((p) => (p.y < 0.33 ? goldScale : coat));

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.05, -0.5], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.05, -0.5],
      [0, 1.1, -0.1],
      [0, 1.15, 0.25],
      [0, 1.18, 0.5],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.18, 0.5],
      [0, 1.42, 0.68],
      [0, 1.62, 0.92],
    ]),
    { parent: spine.joints[2], count: 2, role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.62, 0.92],
    dir: [0, -0.2, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.06 }),
    aim: head.local({ forward: 0.3, down: 0.08 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.1, -0.72],
      [0, 1.15, -1.05],
      [0, 1.05, -1.4],
      [0, 0.88, -1.65],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );

  // ---------- body ----------
  const bodyPath = catmull([
    [0, 1.04, -0.78],
    [0, 1.07, -0.35],
    [0, 1.13, 0.1],
    [0, 1.17, 0.52],
  ]);
  const bodyR = (t: number): [number, number] => {
    const k = Math.sin(Math.PI * t);
    return [0.2 + 0.06 * k + 0.02 * t, 0.23 + 0.07 * k + 0.03 * t];
  };
  const body = b.sweep(bodyPath, bodyR, { bone: [hips, ...spine.joints], color: coat });
  const neckTube = b.sweep(neck, [0.18, 0.11], { color: coat });
  b.sweep(tail, [0.09, 0.05, 0.035, 0.03], { color: coat });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fl = limb(
      [s * 0.2, 1.0, 0.4],
      [s * 0.2, 0.07, 0.42],
      [0.42, 0.42, 0.2],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const hl = limb(
      [s * 0.22, 1.0, -0.5],
      [s * 0.22, 0.07, -0.62],
      [0.42, 0.4, 0.3],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const legs: [any, any, string[], number[]][] = [
      [fl, spine.joints[2], [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hoof${L}`], [0.1, 0.075, 0.052, 0.04, 0.05]],
      [hl, hips, [`hip${L}`, `knee${L}`, `hock${L}`, `hoofH${L}`], [0.13, 0.085, 0.05, 0.04, 0.05]],
    ];
    for (const [pts, parent, names, radii] of legs) {
      const leg = b.chain(`leg${names[0]}`, pts, { parent, names, role: "leg" });
      b.sweep(leg, radii, { color: legPaint });
      const tip = leg.tip!;
      for (const dx of [-0.026, 0.026]) {
        b.part(new THREE.CylinderGeometry(0.032, 0.04, 0.1, 6), HOOF, {
          bone: tip,
          at: [pts[3].x + dx, 0.05, pts[3].z + 0.012],
        });
      }
      b.part(new THREE.CylinderGeometry(0.058, 0.062, 0.025, 8), GOLD, {
        bone: tip,
        at: [pts[3].x, 0.115, pts[3].z],
      });
      b.ring(frame([pts[3].x, 0.2, pts[3].z], [0, -1, 0]), { count: 6, radius: 0.045, tilt: 40 }, (it: any) =>
        b.spike(it, it, 0.1, 0.016, { color: GOLD }),
      );
      // knee flame
      const j = leg.joints[1];
      flame(b, j.at, V(0, 0.15, -1), V(1, 0, 0), 0.24, 0.08, MANE[2]);
    }
    // shoulder / haunch mass
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, { at: [s * 0.2, 0.98, 0.38], scale: [0.14, 0.24, 0.2] });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, { at: [s * 0.22, 0.95, -0.52], scale: [0.16, 0.26, 0.24] });
  }

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(0.125, 12, 9), coat, {
    bone: head,
    at: head.local({ forward: 0.04 }),
    scale: [0.95, 0.9, 1.05],
  });
  b.frustumBox(head.local({ forward: 0.08 }), head.local({ forward: 0.36, down: 0.03 }), [0.19, 0.14], [0.13, 0.09], {
    bone: head,
    color: coat,
  });
  b.part(new THREE.SphereGeometry(0.052, 8, 6), "#1d5560", {
    bone: head,
    at: head.local({ forward: 0.37, down: 0.03 }),
    scale: [1.1, 0.8, 0.9],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), "#06151b", {
      bone: head,
      at: head.local({ left: s * 0.022, forward: 0.415, down: 0.03 }),
    });
    // jaw
    // fangs
    b.spike(head.local({ left: s * 0.045, forward: 0.3, down: 0.06 }), [0, -1, 0], 0.045, 0.01, { color: IVORY, bone: head });
    b.spike(jaw.local({ left: s * 0.035, forward: 0.24, up: 0.0 }), [0, 1, 0], 0.035, 0.008, { color: IVORY, bone: jaw });
    // eyes
    const eye = b.decal(skull, EYE, {
      at: head.local({ left: s * 0.095, up: 0.04, forward: 0.1 }),
      dir: [s, 0.15, 0.5],
      size: [0.085, 0.055],
      mirror: s < 0,
      segments: 8,
    });
    glow(eye, 0.9);
    // brow
    b.rod(
      head.local({ left: s * 0.06, up: 0.078, forward: 0.17 }),
      head.local({ left: s * 0.12, up: 0.07, forward: 0.0 }),
      0.016,
      { color: "#16596a", bone: head },
    );
    // ear fin
    b.extrude(
      [
        [0, 0],
        [0.1, 0.09],
        [0.22, 0.13, "sharp"],
        [0.12, 0.0],
        [0.2, -0.06, "sharp"],
        [0, -0.03],
      ],
      {
        at: head.local({ left: s * 0.1, up: 0.03, back: 0.03 }),
        x: [0, 0, -1],
        y: [s * 0.5, 1, 0],
        thickness: 0.012,
        color: "#2a9aa0",
        bone: head,
      },
    );
    // cheek fin
    b.extrude(
      [
        [0, 0],
        [0.08, 0.06],
        [0.2, 0.02, "sharp"],
        [0.1, -0.03],
        [0.17, -0.1, "sharp"],
        [0, -0.06],
      ],
      {
        at: head.local({ left: s * 0.1, down: 0.03, forward: 0.0 }),
        x: [0, 0, -1],
        y: [s * 0.7, 1, 0],
        thickness: 0.01,
        color: GOLD,
        bone: head,
      },
    );
    // whiskers
    const w0 = head.local({ left: s * 0.06, forward: 0.3, down: 0.0 });
    for (const [dy, k] of [
      [0.03, 1],
      [-0.03, 0.75],
    ] as [number, number][]) {
      glow(
        b.sweep(
          catmull([
            w0.clone().add(V(0, dy, 0)),
            P(w0, s * 0.12 * k, dy + 0.04, -0.08),
            P(w0, s * 0.26 * k, dy - 0.04, -0.3),
            P(w0, s * 0.3 * k, dy - 0.26, -0.58),
          ]),
          [0.011, 0.003],
          { bone: head, color: "#ffe9a8", caps: { end: "point" }, sides: 5 },
        ),
        0.6,
      );
    }
    // antlers
    const base = head.local({ left: s * 0.055, up: 0.1, back: 0.03 });
    const beam = catmull([
      base,
      P(base, s * 0.03, 0.12, -0.05),
      P(base, s * 0.08, 0.26, -0.13),
      P(base, s * 0.13, 0.4, -0.12),
    ]);
    b.sweep(beam, [0.028, 0.008], { bone: head, color: GOLD, caps: { end: "point" }, sides: 6 });
    for (const [t, d, len] of [
      [0.35, [0.04, 0.1, 0.08], 1],
      [0.55, [0.07, 0.1, -0.1], 1],
      [0.78, [0.05, 0.09, 0.07], 1],
    ] as [number, number[], number][]) {
      const q = beam.at(t);
      const tip = P(q, s * d[0] * len, d[1], d[2]);
      b.spike(q, tip, null, 0.014, { bone: head, color: GOLD });
      b.part(new THREE.IcosahedronGeometry(0.014, 0), PEARL, { bone: head, at: tip });
    }
    glow(b.part(new THREE.IcosahedronGeometry(0.02, 1), PEARL, { bone: head, at: beam.at(1) }), 1.2);
    b.part(new THREE.TorusGeometry(0.03, 0.01, 5, 8), GOLD_D, { bone: head, at: base, dir: [0, 1, 0], axis: "z" });
  }
  // lower jaw
  b.frustumBox(jaw.local({ forward: 0.02 }), jaw.local({ forward: 0.3 }), [0.15, 0.05], [0.09, 0.04], {
    bone: jaw,
    color: belly,
  });
  b.frustumBox(jaw.local({ forward: 0.03, up: 0.03 }), jaw.local({ forward: 0.28, up: 0.03 }), [0.12, 0.02], [0.07, 0.02], {
    bone: jaw,
    color: "#5a1830",
  });
  // chin beard
  for (const [dx, dz, len] of [
    [-0.03, 0.0, 0.16],
    [0, 0.04, 0.2],
    [0.03, 0.0, 0.16],
  ]) {
    flame(b, jaw.local({ forward: 0.2 + dz, down: 0.025, left: dx }), V(0, -1, -0.5), V(1, 0, 0), len, 0.05, GOLD, jaw);
  }
  // forehead gem
  glow(
    b.part(new THREE.OctahedronGeometry(0.026), GEM, {
      bone: head,
      at: head.local({ forward: 0.12, up: 0.108 }),
      scale: [0.8, 1.4, 0.8],
    }),
    1.4,
  );

  // ---------- mane (cloud puffs) ----------
  const stations: THREE.Vector3[] = [];
  const sizes: number[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = 1 - i / 8;
    const cp = neck.at(t).at;
    const r = 0.18 - 0.07 * t;
    stations.push(P(cp, 0, r + 0.02, -0.04));
    sizes.push(0.075 + 0.03 * Math.sin(i * 1.3));
  }
  for (let i = 1; i <= 8; i++) {
    const t = 0.1 + 0.1 * i;
    const p = bodyPath.at(t);
    stations.push(P(p, 0, bodyR(t)[1] * 0.92, 0));
    sizes.push(0.09 + 0.03 * Math.cos(i));
  }
  stations.forEach((p, i) => {
    const ci = Math.min(MANE.length - 1, Math.floor((i / stations.length) * MANE.length));
    const r = sizes[i];
    const mk = (q: THREE.Vector3, rr: number, c = ci) =>
      b.part(new THREE.IcosahedronGeometry(rr, 1), MANE[c], { at: q, flat: true });
    mk(p, r);
    mk(P(p, 0.06, -0.03, -0.02), r * 0.8);
    mk(P(p, -0.06, -0.03, -0.02), r * 0.8);
    mk(P(p, 0, 0.04, -0.07), r * 0.7, Math.min(MANE.length - 1, ci + 1));
    if (i % 3 === 1) flame(b, p, V(0, 0.2, -1), V(1, 0, 0), 0.22, 0.09, MANE[Math.min(5, ci + 1)]);
  });
  for (const [dx, dz] of [
    [0.05, -0.08],
    [-0.05, -0.08],
    [0, -0.12],
  ]) {
    b.part(new THREE.IcosahedronGeometry(0.06, 1), MANE[0], {
      bone: head,
      at: head.local({ left: dx, up: 0.1, back: -dz }),
      flat: true,
    });
  }
  // cloud curls
  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const c = P(neck.at(0.15 + 0.25 * k).at, s * 0.19, 0.04, -0.1);
      glow(
        b.sweep(spiral(c, P(c, 0, 0.08, 0), [1, 0, 0], { turns: -1.2, r1: 0.015 }), 0.012, {
          color: GOLD,
          sides: 5,
          caps: { end: "point" },
        }),
        0.7,
      );
    }
    for (const [x, y, z, sc] of [
      [0.3, 1.12, -0.05, 1],
      [0.3, 1.1, -0.55, 0.8],
    ]) {
      glow(
        b.decal(body, SWIRL, {
          at: [s * x, y, z],
          dir: [s, 0, 0],
          size: [0.38 * sc, 0.3 * sc],
          segments: 12,
        }),
        0.8,
      );
    }
  }

  // ---------- tail tuft ----------
  for (const [t, size, tilt] of [
    [1, [0.2, 0.6], 55],
    [0.82, [0.16, 0.42], 70],
  ] as [number, number[], number][]) {
    const ring = b.ring(tail.at(t), { count: 8, radius: 0.03, tilt });
    b.cards(ring.items, FLAME, { size, lean: 20, bend: 25, cross: true, vary: 0.25, rng: R });
  }

  // ---------- chest & collar ----------
  const collarLoop = b.surface(neckTube).loop(neck.at(0.12), { lift: 0.014 });
  b.sweep(collarLoop, 0.018, { color: GOLD, sides: 6 });
  const hit = b.surface(body).ray([0, 1.05, 2], [0, 0, -1]);
  if (hit) {
    glow(b.stick(new THREE.OctahedronGeometry(0.05), GEM, hit, { embed: 0.3, scale: [1, 1.3, 0.8] }), 1.3);
    b.stick(new THREE.TorusGeometry(0.06, 0.012, 5, 10), GOLD, hit, { embed: 0.2 });
  }

  return b.root;
}

// ---------- helpers ----------
function flame(
  b: any,
  at: THREE.Vector3,
  dir: THREE.Vector3,
  side: THREE.Vector3,
  len: number,
  w: number,
  color: string,
  bone?: any,
) {
  const opts: any = { at, x: side, y: dir.clone().normalize(), thickness: w * 0.2, color };
  if (bone) opts.bone = bone;
  return b.extrude(
    [
      [-w / 2, 0],
      [w / 2, 0],
      [w * 0.45, len * 0.35],
      [w * 0.1, len * 0.7],
      [0, len, "sharp"],
      [-w * 0.15, len * 0.55],
      [-w * 0.5, len * 0.3],
    ],
    opts,
  );
}
```