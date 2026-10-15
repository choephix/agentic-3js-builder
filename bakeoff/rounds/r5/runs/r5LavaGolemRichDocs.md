```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, polyline, limb, offset, paint, noise } from "agentic-3js-builder";

export const meta = {
  name: "Basalt Lava Golem",
  description:
    "A towering, hunched golem of stacked basalt plates held together by glowing molten seams, with a flame crest, a pyro-core in the chest, tiered pauldrons, clawed fists, and floating lava shards. Fully rigged in a rest pose.",
};

// ---------- palette ----------
const B1 = "#221f2b";
const B2 = "#312d3d";
const B3 = "#47435a";
const B4 = "#15131c";
const LAVA = "#ff5a14";
const HOT = "#ffc43a";
const EMBER = "#b8240f";
const TOOTH = "#ffe6a0";
const ASH = "#6d6679";

// ---------- paints ----------
const tone = (p: THREE.Vector3) => {
  const n = noise(p, 0.16, 4);
  return n > 0.64 ? B3 : n > 0.36 ? B2 : B1;
};
// basalt cut by contour-lines of noise: winding molten cracks
const rock = paint((p) => {
  const a = Math.abs(noise(p, 0.55, 1) - 0.5);
  const c = Math.abs(noise(p, 0.3, 7) - 0.5);
  if (a < 0.02 || c < 0.012) return HOT;
  if (a < 0.038 || c < 0.026) return LAVA;
  if (a < 0.052 || c < 0.036) return EMBER;
  return tone(p);
});
// armour plates: mostly dark, only hairline glow
const plate = paint((p) => {
  const a = Math.abs(noise(p, 0.4, 21) - 0.5);
  if (a < 0.008) return LAVA;
  if (a < 0.02) return EMBER;
  const n = noise(p, 0.12, 5);
  return n > 0.6 ? B3 : n > 0.3 ? B2 : B1;
});

const tipBands: [number, string][] = [
  [0.6, B3],
  [1, LAVA],
];
const clawBands: [number, string][] = [
  [0.72, B3],
  [1, LAVA],
];

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });

  // =====================================================
  // SKELETON
  // =====================================================
  const hips = b.joint("hips", { at: [0, 1.35, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.35, 0],
      [0, 1.72, 0.0],
      [0, 2.08, 0.04],
      [0, 2.45, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    polyline([
      [0, 2.42, 0.1],
      [0, 2.64, 0.2],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: neck.at(1), dir: [0, -0.08, 1], role: "head" });
  const H = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: H(-0.08, 0.06), aim: H(0.3, 0.06), role: "jaw" });

  // =====================================================
  // TORSO
  // =====================================================
  const torso = b.sweep(
    spine,
    (t) => {
      const k = Math.min(1, Math.max(0, (t - 0.25) / 0.6));
      const e = k * k * (3 - 2 * k);
      const top = 1 - 0.12 * Math.max(0, (t - 0.9) / 0.1);
      return [(0.33 + 0.2 * e) * top, 0.24 + 0.1 * e];
    },
    { section: "box", color: rock, caps: "flat" },
  );
  const skin = b.surface(torso);
  const front = (x: number, y: number) => {
    const h = skin.ray([x, y, 2], [0, 0, -1]);
    if (!h) throw new Error(`no torso hit at ${x},${y}`);
    return h;
  };

  // pelvis, belt, tassets
  b.part(new THREE.BoxGeometry(0.8, 0.3, 0.5), plate, { bone: hips, at: [0, 1.32, 0] });
  b.part(new THREE.BoxGeometry(0.72, 0.045, 0.52), LAVA, { bone: spine.joints[0], at: [0, 1.52, 0] });
  for (const k of [-1, 0, 1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.36, 0.07), plate, {
      bone: hips,
      at: [k * 0.27, 1.06, 0.27],
      rotation: [-8, 0, -k * 6],
    });
    b.part(new THREE.BoxGeometry(0.12, 0.03, 0.05), HOT, { bone: hips, at: [k * 0.27, 0.9, 0.3] });
  }

  // abdominal plates
  for (const y of [1.62, 1.76]) {
    for (const x of [-0.12, 0.12]) {
      b.stick(new THREE.BoxGeometry(0.2, 0.07, 0.11), plate, front(x, y), { embed: 0.3 });
    }
  }

  // chest plates
  for (const s of [1, -1]) {
    b.stick(new THREE.BoxGeometry(0.2, 0.09, 0.34), plate, front(s * 0.4, 2.2), { embed: 0.3 });
    b.stick(new THREE.BoxGeometry(0.2, 0.06, 0.1), B3, front(s * 0.4, 2.42), { embed: 0.3 });
  }

  // pyro core
  const coreHit = front(0, 2.12);
  b.stick(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 6), HOT, coreHit, { embed: 0.35 });
  b.stick(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 6), "#fff2c4", coreHit, { embed: 0.35 });
  const coreRing = b.ring(coreHit, { count: 12, radius: 0.18 }).items;
  b.sweep(catmull(coreRing, { closed: true }), 0.016, { color: LAVA });
  b.ring(coreHit, { count: 8, radius: 0.22 }, (it) =>
    b.stick(new THREE.ConeGeometry(0.035, 0.11, 4), B3, it, { embed: 0.3 }),
  );

  // upper-back hump with vents and crystals
  b.part(new THREE.BoxGeometry(0.9, 0.42, 0.3), plate, { bone: chest, at: [0, 2.3, -0.3] });
  for (const y of [2.2, 2.34]) {
    b.part(new THREE.BoxGeometry(0.5, 0.035, 0.02), LAVA, { bone: chest, at: [0, y, -0.452] });
  }
  for (const x of [-0.28, 0, 0.28]) {
    b.spike(v(x, 2.4, -0.42), [x * 0.8, 0.7, -0.8], 0.38, 0.07, { bone: chest, color: B3, bands: tipBands });
  }
  b.along(torso, 4, (at) => b.spike(at, at, 0.22, 0.055, { color: B3, bands: tipBands }), { from: 0.12, to: 0.65 });

  // trapezius
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.42, 0.18, 0.5), plate, {
      bone: chest,
      at: [s * 0.32, 2.5, 0.02],
      rotation: [0, 0, -22 * s],
    });
  }

  // neck
  b.sweep(neck, 0.2, { section: { ngon: 6 }, color: rock });

  // =====================================================
  // HEAD
  // =====================================================
  b.part(new THREE.BoxGeometry(0.52, 0.36, 0.46), rock, { bone: head, at: H(0.08, 0.22) });
  b.part(new THREE.BoxGeometry(0.34, 0.03, 0.28), HOT, { bone: head, at: H(0.16, 0.035) });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.46, 0.14, 0.36), plate, { bone: jaw, at: H(0.15, -0.01) });
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.1), B3, { bone: jaw, at: H(0.34, -0.03) });
  // teeth
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 0.065;
    b.part(new THREE.ConeGeometry(0.03, 0.09, 4), TOOTH, { bone: head, at: H(0.3, 0.0, x), dir: [0, -1, 0] });
    if (i % 2 === 0) {
      b.part(new THREE.ConeGeometry(0.03, 0.08, 4), TOOTH, { bone: jaw, at: H(0.33, 0.07, x * 0.9), dir: [0, 1, 0] });
    }
  }
  for (const s of [1, -1]) {
    // brows and eyes (angry slant)
    b.part(new THREE.BoxGeometry(0.28, 0.09, 0.14), B3, {
      bone: head,
      at: H(0.3, 0.33, s * 0.14),
      rotation: [0, 0, 18 * s],
    });
    b.part(new THREE.BoxGeometry(0.14, 0.045, 0.04), HOT, {
      bone: head,
      at: H(0.325, 0.25, s * 0.13),
      rotation: [0, 0, 18 * s],
    });
    // cheek spikes
    b.spike(H(0.1, 0.0, s * 0.2), [s, -0.2, 0.3], 0.2, 0.055, { bone: head, color: B3, bands: tipBands });
    // swept-back horns
    b.sweep(bezier(H(0, 0.36, s * 0.2), H(-0.25, 0.42, s * 0.38), H(-0.5, 0.6, s * 0.46), H(-0.62, 0.88, s * 0.4)), [0.075, 0], {
      bone: head,
      color: B3,
      bands: tipBands,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
  }
  // flame crest
  const flame: [number, number][] = [
    [-0.18, 0],
    [-0.2, 0.18],
    [-0.1, 0.14],
    [-0.14, 0.42],
    [0, 0.24],
    [0.05, 0.52],
    [0.12, 0.2],
    [0.22, 0.3],
    [0.2, 0],
  ];
  b.extrude(flame, { at: H(0.0, 0.4), bone: head, thickness: 0.05, color: LAVA });
  b.extrude(
    flame.map(([x, y]) => [x * 0.55, y * 0.6] as [number, number]),
    { at: H(0.02, 0.4), bone: head, thickness: 0.075, color: HOT },
  );

  // =====================================================
  // ARMS
  // =====================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.64, 2.28, 0],
      [s * 0.86, 1.62, 0.0],
      [s * 0.98, 0.98, 0.1],
    ];
    const arm = b.chain(`arm${side}`, polyline(pts), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const sh = arm.joints[0];
    const elbow = arm.joints[1];
    const hand = arm.joints[arm.joints.length - 1];
    b.sweep(arm, [0.2, 0.22, 0.19, 0.24, 0.25], { section: { ngon: 6 }, color: rock });

    // pauldron tiers
    const tiers: [number, number, number, number, number][] = [
      [0.66, 0.15, 0.62, -0.02, 0.0],
      [0.54, 0.14, 0.5, 0.14, 0.06],
      [0.4, 0.13, 0.38, 0.27, 0.1],
    ];
    tiers.forEach(([w, h, d, y, xo], i) => {
      b.part(new THREE.BoxGeometry(w, h, d), plate, {
        bone: sh,
        at: [s * (0.7 + xo), 2.32 + y, 0],
        rotation: [0, 0, -14 * s],
      });
      if (i < 2) {
        b.part(new THREE.BoxGeometry(w * 0.9, 0.05, d * 0.9), LAVA, {
          bone: sh,
          at: [s * (0.7 + xo + 0.01), 2.32 + y + h / 2 + 0.0, 0],
          rotation: [0, 0, -14 * s],
        });
      }
    });
    for (const k of [-1, 0, 1]) {
      b.spike(v(s * 0.82, 2.68, k * 0.14), [s * 0.3, 1, k * 0.4], 0.34 - Math.abs(k) * 0.08, 0.06, {
        bone: sh,
        color: B3,
        bands: tipBands,
      });
    }

    // elbow spike
    b.spike(v(s * 0.86, 1.64, -0.12), [s * 0.1, 0.1, -1], 0.34, 0.08, { bone: elbow, color: B3, bands: tipBands });

    // gauntlet band and knuckle spikes
    const bandItems = b.ring(arm.at(0.74), { count: 10, radius: 0.26 }).items;
    b.sweep(catmull(bandItems, { closed: true }), 0.022, { color: LAVA });
    b.ring(arm.at(0.9), { count: 6, radius: 0.22 }, (it) =>
      b.stick(new THREE.ConeGeometry(0.045, 0.16, 5), B3, it, { embed: 0.35 }),
    );

    // hand
    const w = pts[2];
    b.part(new THREE.BoxGeometry(0.36, 0.24, 0.34), plate, { bone: hand, at: [w[0], w[1] - 0.15, w[2] + 0.02] });
    b.part(new THREE.BoxGeometry(0.3, 0.03, 0.2), LAVA, { bone: hand, at: [w[0], w[1] - 0.04, w[2] + 0.14] });

    const fingerNames = ["index", "middle", "ring", "pinky"];
    const flen = [0.95, 1.1, 1.0, 0.8];
    fingerNames.forEach((fn, i) => {
      const xo = (1.5 - i) * 0.085;
      const f = flen[i];
      const base = [w[0] + xo, w[1] - 0.28, w[2] + 0.05];
      const p2 = [base[0] + xo * 0.35, base[1] - 0.15 * f, base[2] + 0.05];
      const p3 = [p2[0] + xo * 0.35, p2[1] - 0.14 * f, p2[2] + 0.08];
      const fc = b.chain(`${fn}${side}`, polyline([base, p2, p3]), {
        parent: hand,
        names: [`${fn}${side}1`, `${fn}${side}2`, `${fn}${side}3`],
        role: "digit",
      });
      b.sweep(fc, [0.045, 0.028], {
        section: { ngon: 5 },
        color: B2,
        bands: clawBands,
        caps: { start: "round", end: "point" },
      });
    });
    const tb = [w[0] - s * 0.15, w[1] - 0.2, w[2] + 0.08];
    const t2 = [tb[0] - s * 0.07, tb[1] - 0.1, tb[2] + 0.1];
    const t3 = [t2[0] - s * 0.03, t2[1] - 0.08, t2[2] + 0.09];
    const th = b.chain(`thumb${side}`, polyline([tb, t2, t3]), {
      parent: hand,
      names: [`thumb${side}1`, `thumb${side}2`, `thumb${side}3`],
      role: "digit",
    });
    b.sweep(th, [0.05, 0.03], { section: { ngon: 5 }, color: B2, bands: clawBands, caps: { start: "round", end: "point" } });
  }

  // =====================================================
  // LEGS
  // =====================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP: [number, number, number] = [s * 0.33, 1.3, 0];
    const foot: [number, number, number] = [s * 0.36, 0.21, 0.04];
    const pts = limb(hipP, foot, [0.62, 0.6], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    const legTube = b.sweep(leg, [0.25, 0.27, 0.22, 0.2, 0.2], { section: { ngon: 6 }, color: rock });
    const lskin = b.surface(legTube);

    // armour plates
    const thighP = pts[0].clone().lerp(pts[1], 0.5).add(v(0, 0.05, 0.4));
    b.stick(new THREE.BoxGeometry(0.26, 0.09, 0.34), plate, lskin.nearest(thighP), { embed: 0.3 });
    const shinP = pts[1].clone().lerp(pts[2], 0.5).add(v(0, 0, 0.4));
    b.stick(new THREE.BoxGeometry(0.24, 0.09, 0.4), plate, lskin.nearest(shinP), { embed: 0.3 });
    b.spike(offset(pts[1], [0, 0.1, 1], 0.12), [0, 0.15, 1], 0.3, 0.1, { bone: knee, color: B3, bands: tipBands });

    // foot
    b.part(new THREE.BoxGeometry(0.44, 0.2, 0.62), plate, { bone: ankle, at: [foot[0], 0.1, 0.14] });
    b.part(new THREE.BoxGeometry(0.36, 0.26, 0.36), rock, { bone: ankle, at: [foot[0], 0.26, 0.02] });
    b.part(new THREE.BoxGeometry(0.28, 0.02, 0.2), HOT, { bone: ankle, at: [foot[0], 0.205, 0.22] });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.BoxGeometry(0.13, 0.14, 0.22), plate, {
        bone: ankle,
        at: [foot[0] + s * k * 0.14, 0.07, 0.5],
        rotation: [0, s * k * 12, 0],
      });
      b.spike(v(foot[0] + s * k * 0.16, 0.08, 0.58), [s * k * 0.3, -0.05, 1], 0.15, 0.05, { bone: ankle, color: ASH });
    }
  }

  // =====================================================
  // FLOATING SHARDS & RUBBLE
  // =====================================================
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    const r = 1.55 + ((i * 7) % 3) * 0.12;
    const y = 0.9 + ((i * 5) % 8) * 0.28;
    const sz = 0.09 + ((i * 3) % 4) * 0.025;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    b.part(new THREE.OctahedronGeometry(1, 0).scale(sz, sz * 1.5, sz), B2, {
      bone: hips,
      at: [x, y, z],
      rotation: [(i * 23) % 40, i * 50, (i * 17) % 30],
      flat: true,
    });
    b.part(new THREE.ConeGeometry(sz * 0.65, sz * 1.8, 5), LAVA, {
      bone: hips,
      at: [x, y - sz * 1.9, z],
      dir: [0, -1, 0],
      flat: true,
    });
  }
  const rubble: [number, number, number][] = [
    [0.9, 0.9, 0.12],
    [-1.0, 0.6, 0.09],
    [0.5, -1.0, 0.13],
    [-0.7, -1.1, 0.1],
    [1.3, -0.4, 0.08],
    [-1.3, -0.2, 0.11],
  ];
  rubble.forEach(([x, z, r], i) => {
    b.part(new THREE.DodecahedronGeometry(r, 0), i % 3 === 0 ? LAVA : B2, {
      bone: hips,
      at: [x, r * 0.8, z],
      rotation: [i * 31, i * 47, i * 13],
      flat: true,
    });
  });

  // slightly open the mouth
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  return b.root;
}
```