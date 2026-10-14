```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  limb,
  frame,
  aim,
  paint,
  mottle,
  grain,
  spots,
  noise,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Moss Stag Spirit",
  description:
    "A small forest spirit: a river-stone deer body blanketed in moss, slender wooden legs on dark hooves, flowering antlers, a pale carved wooden mask with glowing green eyes, and fireflies circling its head.",
};

// Palette
const STONE_A = "#8f969c";
const STONE_B = "#686f76";
const MOSS_A = "#86b443";
const MOSS_B = "#4c7b2b";
const LICHEN = "#cfd88f";
const HOOF = "#33261f";
const MASK_A = "#f1e7cf";
const MASK_B = "#d8c7a2";
const MARK_G = "#3f8a4c";
const MARK_R = "#b4543a";
const SOCKET = "#14211a";
const EYE = "#7dff5a";
const EYE_CORE = "#eaffd8";
const EYE_HALO = "#a6ff86";
const PETAL = "#fbfbf4";
const POLLEN = "#f2c94c";
const STEM = "#5b8a34";
const GLOW = "#eeff5c";
const GLOW_DIM = "#c6dc48";
const BUG = "#2b2a22";
const WING = "#dfeefa";
const CREAM = "#efe6cf";
const CAP_RED = "#c8452f";
const NOSE = "#2a211c";

export default function build() {
  const b = createBuilder({ name: "mossStagSpirit" });

  // ---------- Paints ----------
  const stoneBase = mottle(STONE_A, STONE_B, { size: 0.07, seed: 2 });
  const mossBase = mottle(MOSS_A, MOSS_B, { size: 0.035, seed: 4 });
  const stonePaint = paint((p, n) => {
    const m = n.y + (noise(p, 0.08, 5) - 0.5) * 1.1;
    if (m > 0.45) return mossBase;
    if (noise(p, 0.025, 11) > 0.74) return LICHEN;
    return stoneBase;
  });
  const legWood = grain("#8b5d38", "#5a3b22", { size: 0.012, axis: "y" });
  const antlerWood = grain("#b38c60", "#7a5736", { size: 0.01, axis: "y" });
  const maskWood = grain(MASK_A, MASK_B, { size: 0.012, axis: "x" });
  const maskPaint = paint((_p, _n, s) => {
    const x = s[0];
    const y = s[1];
    if (Math.abs(x) < 0.0045 && y > 0.03) return MARK_G;
    if (Math.abs(Math.abs(x) - 0.032) < 0.004 && y < -0.004 && y > -0.042) return MARK_R;
    if (Math.abs(y - 0.054) < 0.0035 && Math.abs(x) > 0.012 && Math.abs(x) < 0.056) return MARK_G;
    return maskWood;
  });
  const leafPaint = paint((_p, _n, s) => (Math.abs(s[1]) < 0.0025 ? "#3d6e25" : MOSS_A));
  const capPaint = spots(CAP_RED, "#fff6e8", { size: 0.009, amount: 0.3, seed: 8 });

  // ---------- Textures ----------
  const tuft = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 32 L13 5 L18.5 32Z M10 32 L3 9 L13.5 32Z M22 32 L29 8 L18.5 32Z M7 32 L0 19 L11 32Z M25 32 L32 17 L21 32Z" fill="#ffffff"/><path d="M14.8 32 L14.5 13 L17.2 32Z" fill="#bdbdbd"/></svg>`,
    { size: 64 },
  );
  const leafTex = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 L16 58 C2 48 2 20 16 2 C30 20 30 48 16 58Z" fill="#6aa83e"/><path d="M16 61 L16 9" stroke="#3d6e25" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );

  // ---------- Skeleton ----------
  const bodyPts = [
    [0, 0.44, -0.29],
    [0, 0.445, -0.2],
    [0, 0.455, -0.04],
    [0, 0.47, 0.1],
    [0, 0.5, 0.2],
  ];
  const hips = b.joint("hips", { at: bodyPts[0] });
  const spine = b.chain("spine", catmull(bodyPts), { parent: hips, count: 3, role: "spine" });
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.49, 0.17],
      [0, 0.58, 0.235],
      [0, 0.67, 0.275],
    ]),
    { parent: spine, count: 2, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.67, 0.275], dir: [0, -0.2, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.06 }),
    aim: head.local({ forward: 0.16, down: 0.075 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.45, -0.28],
      [0, 0.49, -0.34],
      [0, 0.525, -0.37],
    ]),
    { parent: hips, count: 2, role: "tail" },
  );

  // ---------- Stone body ----------
  const widths = [
    [0.12, 0.1],
    [0.25, 0.21],
    [0.29, 0.24],
    [0.25, 0.23],
    [0.15, 0.15],
  ];
  const body = b.loft(
    bodyPts.map((at, i) => ({ at, w: widths[i][0], h: widths[i][1] })),
    { bone: spine, color: stonePaint, sides: 10, smooth: false, name: "bodyStone" },
  );
  const neckTube = b.sweep(neck, [0.07, 0.05], { color: stonePaint, sides: 9, smooth: false });
  const tailTube = b.sweep(tail, [0.04, 0.022], {
    sides: 7,
    smooth: false,
    bands: [
      [0.55, stonePaint],
      [1, LICHEN],
    ],
  });
  b.cards(
    [0, 120, 240].map((d) => tailTube.at(0.92, d)),
    leafTex,
    { size: [0.02, 0.035], lean: 35, flow: [0, 0.3, -1] },
  );

  // ---------- Legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const legs = [
      {
        root: [s * 0.075, 0.42, 0.12],
        foot: [s * 0.08, 0.025, 0.15],
        lens: [0.17, 0.14, 0.11],
        bends: [
          [0, 0, -1],
          [0, 0, 1],
        ],
        parent: spine.joints[2],
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hoofF${S}`],
        cname: `legF${S}`,
      },
      {
        root: [s * 0.075, 0.42, -0.17],
        foot: [s * 0.08, 0.025, -0.19],
        lens: [0.16, 0.15, 0.11],
        bends: [
          [0, 0, 1],
          [0, 0, -1],
        ],
        parent: spine.joints[0],
        names: [`hip${S}`, `knee${S}`, `hock${S}`, `hoofH${S}`],
        cname: `legH${S}`,
      },
    ];
    for (const L of legs) {
      const pts = limb(L.root, L.foot, L.lens, L.bends);
      const leg = b.chain(L.cname, pts, { parent: L.parent, names: L.names, role: "leg" });
      b.sweep(leg, [0.03, 0.02, 0.016, 0.012], { color: legWood, sides: 6 });
      b.part(new THREE.CylinderGeometry(0.013, 0.021, 0.034, 6), HOOF, {
        bone: leg.tip!,
        at: [L.foot[0], 0.017, L.foot[2]],
        flat: true,
      });
      // moss cuff at the lower joint
      const cuff = b.ring(leg.joints[2], { count: 6, radius: 0.012 }).items;
      b.cards(cuff, tuft, { size: [0.022, 0.026], lean: 55, bend: 20, color: mossBase, vary: 0.25, rng: rng(20 + s) });
    }
  }

  // ---------- Head ----------
  const cranium = b.part(new THREE.IcosahedronGeometry(0.075, 1), stonePaint, {
    bone: head,
    at: head.local({ up: 0.02 }),
    scale: [1.05, 0.9, 1.1],
    flat: true,
  });

  const xd = new THREE.Vector3().copy(head.dir([-1, 0, 0])); // model left
  const yd = new THREE.Vector3().copy(head.dir([0, 0, 1])); // head up
  const fwd = new THREE.Vector3().crossVectors(xd, yd).normalize();
  const mask = b.extrude(
    [
      [-0.07, 0.06],
      [0, 0.088],
      [0.07, 0.06],
      [0.066, 0.0],
      [0.036, -0.05],
      [0, -0.078, "sharp"],
      [-0.036, -0.05],
      [-0.066, 0.0],
    ],
    {
      at: head.local({ forward: 0.085, up: 0.01 }),
      x: xd,
      y: yd,
      thickness: 0.016,
      bevel: 0.005,
      smoothing: 1,
      color: maskPaint,
      bone: head,
      name: "mask",
    },
  );

  // muzzle (upper jaw) and lower jaw
  b.frustumBox(head.local({ forward: 0.07, down: 0.035 }), head.local({ forward: 0.16, down: 0.05 }), [0.07, 0.05], [0.045, 0.032], {
    bone: head,
    color: maskWood,
  });
  b.part(new THREE.SphereGeometry(0.013, 6, 4), NOSE, { bone: head, at: head.local({ forward: 0.162, down: 0.04 }), flat: true });
  b.frustumBox(jaw.at, jaw.local([0, 0.09, 0]), [0.058, 0.022], [0.036, 0.016], { bone: jaw, color: "#cdbb94" });
  b.cards(
    [0.02, 0.045, 0.07].map((f) => frame(jaw.local({ forward: f, down: 0.011 }), [0, 1, 0])),
    tuft,
    { size: [0.022, 0.032], lean: 180, flow: [0, 0, 1], bone: jaw, color: MOSS_B },
  );

  // glowing eyes
  for (const s of [1, -1]) {
    const c = mask.local([s * 0.032, 0.02, 0.0085]);
    b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.005, 10).scale(1.2, 1, 0.82), SOCKET, { bone: head, at: c, dir: fwd });
    b.part(new THREE.SphereGeometry(0.0125, 8, 6).scale(1.2, 0.55, 0.85), EYE, {
      bone: head,
      at: c.clone().addScaledVector(fwd, 0.002),
      dir: fwd,
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), EYE_CORE, { bone: head, at: c.clone().addScaledVector(fwd, 0.006) });
    b.part(new THREE.TorusGeometry(0.023, 0.0022, 4, 16).scale(1.2, 0.85, 1), EYE_HALO, {
      bone: head,
      at: c.clone().addScaledVector(fwd, 0.002),
      dir: fwd,
      axis: "z",
    });
  }

  // leaf ears
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.04, 0.022],
        [0.09, 0, "sharp"],
        [0.04, -0.022],
      ],
      {
        at: head.local({ left: s * 0.062, up: 0.045, back: 0.01 }),
        x: [s * 0.9, 0.4, -0.15],
        y: [0, 0.35, 0.94],
        thickness: 0.006,
        bevel: 0.002,
        smoothing: 2,
        color: leafPaint,
        bone: head,
      },
    );
  }

  // ---------- Flowers ----------
  const flower = (at: THREE.Vector3, dirIn: THREE.Vector3, bone: any, size = 1) => {
    const dir = dirIn.clone().normalize();
    const q = aim(dir);
    for (let i = 0; i < 5; i++) {
      const g = new THREE.SphereGeometry(0.0065 * size, 5, 3);
      g.scale(1, 0.35, 0.6);
      g.translate(0.008 * size, 0, 0);
      g.rotateY((i * Math.PI * 2) / 5);
      b.part(g, PETAL, { bone, at, quat: q, flat: true });
    }
    b.part(new THREE.SphereGeometry(0.0038 * size, 6, 4), POLLEN, { bone, at: at.clone().addScaledVector(dir, 0.002) });
  };

  // ---------- Antlers ----------
  const skull = b.surface(cranium);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const crest = skull.nearest(head.local({ left: s * 0.045, up: 0.08, back: 0.01 }));
    const base = new THREE.Vector3().copy(crest.at);
    const P = (dx: number, dy: number, dz: number) => base.clone().add(new THREE.Vector3(s * dx, dy, dz));
    const beam = catmull([base, P(0.035, 0.07, -0.015), P(0.085, 0.15, -0.03), P(0.1, 0.24, 0.0)]);
    const ant = b.sprout(`antler${S}`, crest, beam, [0.016, 0.006], {
      count: 2,
      names: [`antler${S}1`, `antler${S}2`],
      color: antlerWood,
      sides: 6,
      caps: { end: "round" },
    });
    const tines: { t: number; d: number[]; l: number }[] = [
      { t: 0.3, d: [s * 0.1, 0.7, 0.7], l: 0.08 },
      { t: 0.55, d: [s * 0.8, 0.6, -0.1], l: 0.065 },
      { t: 0.78, d: [-s * 0.2, 0.7, -0.6], l: 0.06 },
    ];
    for (const tn of tines) {
      const p0 = new THREE.Vector3().copy(beam.at(tn.t));
      const dir = new THREE.Vector3(tn.d[0], tn.d[1], tn.d[2]).normalize();
      const tip = p0.clone().addScaledVector(dir, tn.l);
      const ctrl = p0.clone().addScaledVector(dir, tn.l * 0.5).add(new THREE.Vector3(0, 0.015, 0));
      const j = ant.chain!.nearestJoint(p0);
      b.sweep(bezier(p0, ctrl, tip), [0.009, 0], {
        bone: j,
        color: antlerWood,
        sides: 5,
        caps: { start: "round", end: "point" },
      });
      flower(tip, dir, j);
    }
    const end = new THREE.Vector3().copy(beam.at(1));
    const endDir = new THREE.Vector3().copy(beam.tangentAt(1));
    flower(end.clone().addScaledVector(endDir, 0.006), endDir, ant.chain!.joints[1], 1.2);
    b.cards(
      [ant.sweep.at(0.18, s * 90), ant.sweep.at(0.45, -s * 90), ant.sweep.at(0.68, s * 70), ant.sweep.at(0.88, -s * 60)],
      leafTex,
      { size: [0.022, 0.036], lean: 45, flow: [0, 1, 0.3], vary: 0.2, rng: rng(30 + s) },
    );
  }

  // ---------- Moss coat ----------
  const coat = b.surface([body, neckTube]);
  const mossHits = coat.scatter(150, { rng: rng(3), minDist: 0.022, filter: (h) => h.n.y > 0.5 });
  b.cards(mossHits, tuft, {
    size: [0.03, 0.03],
    lean: 30,
    bend: 20,
    cross: true,
    vary: 0.35,
    spin: 40,
    rng: rng(4),
    color: mossBase,
  });
  // tiny flowers on the mossy back
  for (const idx of [5, 19, 33, 47]) {
    const h = mossHits[idx];
    if (!h) continue;
    const n = new THREE.Vector3().copy(h.n);
    const top = new THREE.Vector3().copy(h.at).addScaledVector(n, 0.022);
    b.rod(h.at, top, 0.0018, { bone: h.bone ?? spine.joints[1], color: STEM });
    flower(top, n, h.bone ?? spine.joints[1], 0.75);
  }

  // mushrooms on the rump
  const shroom = (p: number[], scale: number) => {
    const hit = b.surface(body).nearest(p);
    b.part(new THREE.CylinderGeometry(0.006 * scale, 0.008 * scale, 0.032 * scale, 6), CREAM, {
      frame: hit.moved([0, 0.012 * scale, 0]),
    });
    b.part(new THREE.SphereGeometry(0.019 * scale, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), capPaint, {
      frame: hit.moved([0, 0.026 * scale, 0]),
      flat: true,
    });
  };
  shroom([0.06, 0.62, -0.12], 1);
  shroom([0.09, 0.6, -0.08], 0.7);

  // ---------- Fireflies ----------
  const center = new THREE.Vector3().copy(head.local({ up: 0.16, back: 0.02 }));
  const heights = [0.0, 0.07, -0.05, 0.11];
  const Y = new THREE.Vector3(0, 1, 0);
  b.ring(
    frame(center, [0, 1, 0]),
    { count: 4, radius: 0.2, joints: 4, name: "firefly", parent: head },
    (f) => {
      const bone = f.bone ?? head;
      const pos = new THREE.Vector3().copy(f.local({ up: heights[f.i % 4] }));
      b.part(new THREE.SphereGeometry(0.009, 6, 4), GLOW, { bone, at: pos });
      const v = pos.clone().sub(center);
      const ahead = v.clone().applyAxisAngle(Y, 0.06).add(center);
      b.part(new THREE.SphereGeometry(0.005, 6, 4), BUG, { bone, at: ahead });
      for (const w of [1, -1]) {
        b.part(new THREE.SphereGeometry(0.008, 6, 3).scale(1, 0.25, 0.6), WING, {
          bone,
          at: ahead.clone().add(new THREE.Vector3(0, 0.006, 0)).addScaledVector(v.clone().normalize(), w * 0.008),
        });
      }
      for (let k = 1; k <= 3; k++) {
        const tp = v
          .clone()
          .applyAxisAngle(Y, -k * 0.16)
          .add(center)
          .add(new THREE.Vector3(0, -k * 0.006, 0));
        b.part(new THREE.SphereGeometry(0.0045 * (1 - k * 0.22), 5, 3), GLOW_DIM, { bone, at: tp });
      }
    },
  );

  return b.root;
}
```