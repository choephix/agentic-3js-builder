import * as THREE from "three";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { grain, paint, scales } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Thunderbird",
  description:
    "A storm eagle of thunderbird lore, standing 2.5 m tall with a 5.6 m wingspan: armoured storm-slate plumage, gold beak and talons, and cyan lightning crackling from its crest, eyes, feather tips and the ground.",
  style: "Overwatch/League mix",
  commit: "b816db2",
};

// Palette: storm slate and cloud as the colour blocks, gold for trims, one electric cyan accent.
const STORM = "#2d4478";
const STORM_HI = "#4a6cb0";
const CLOUD = "#d6dfee";
const DARK = "#0b1020";
const GOLD = "#e8ac3f";
const GOLD_DK = "#a8711f";
const CYAN = "#3cf3ff";

type Pt = [number, number, number];

// Piecewise smooth key profile over t in [0, 1]: keys are [t, value] pairs.
const key = (t: number, keys: readonly (readonly [number, number])[]) => {
  for (let i = 1; i < keys.length; i++) {
    const [t0, v0] = keys[i - 1];
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
      return v0 + (v1 - v0) * u * u * (3 - 2 * u);
    }
  }
  return keys[keys.length - 1][1];
};

const TORSO_KEYS = [
  [0, 0.19],
  [0.45, 0.3],
  [0.8, 0.34],
  [1, 0.27],
] as const;

const plumage = scales([STORM, STORM_HI], DARK, { size: 0.1, width: 0.014, seed: 4 });
const belly = scales([CLOUD, "#bfcde3"], "#7d8db0", { size: 0.07, width: 0.01, seed: 9 });
const body = paint((_p, n) => (n.y < -0.25 ? belly : plumage));
const wingSkin = grain(STORM, STORM_HI, { size: 0.07, axis: "x", seed: 2 });
const scutes = paint((_p, _n, s) => (Math.floor(s[0] * 16) % 2 ? GOLD : GOLD_DK));

const COVERT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
    <path d="M16 1 C27 12 29 38 16 63 C3 38 5 12 16 1Z" fill="#3d4f7a"/>
    <path d="M16 3 C23 14 24 36 16 58 C8 36 9 14 16 3Z" fill="#27324f"/>
    <path d="M16 4 L16 60" stroke="#0c111d" stroke-width="1.6" fill="none"/>
    <path d="M16 14 L24 22 M16 24 L26 33 M16 34 L23 43 M16 14 L8 22 M16 24 L6 33 M16 34 L9 43"
      stroke="#4f6399" stroke-width="1.2" fill="none"/>
  </svg>`,
  { size: 128 },
);

const SPARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
    <path d="M16 1 C27 12 29 38 16 63 C3 38 5 12 16 1Z" fill="#3cf3ff"/>
    <path d="M16 4 L16 60" stroke="#eafdff" stroke-width="1.6" fill="none"/>
    <path d="M16 14 L22 20 M16 26 L23 33 M16 38 L8 46" stroke="#b8fbff" stroke-width="1.2" fill="none"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "thunderbird" });

  // ---------- skeleton: spine, neck, head, tail ----------
  const HIPS: Pt = [0, 1.22, -0.12];
  const MID: Pt = [0, 1.46, 0.06];
  const CHEST: Pt = [0, 1.68, 0.24];
  const NECK0: Pt = [0, 1.84, 0.36];
  const hips = b.joint("hips", { at: HIPS, aim: MID, role: "spine" });
  const spine = b.chain("spine", catmull([HIPS, MID, CHEST, NECK0]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([NECK0, [0, 1.99, 0.47], [0, 2.14, 0.53], [0, 2.25, 0.55]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 2.31, 0.6], aim: [0, 2.37, 1.2], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.07 }),
    aim: head.local({ forward: 0.4, up: -0.14 }),
    role: "jaw",
  });
  const tail = b.chain("tail", catmull([[0, 1.16, -0.2], [0, 0.98, -0.5], [0, 0.8, -0.84], [0, 0.7, -1.08]]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });

  // One bevelled flight feather: x runs along it from the root, y across, the normal sets the plane.
  // The electric tip is a second, glowing plate over its last fifth.
  const feather = (root: Pt, dir: THREE.Vector3, nrm: THREE.Vector3, L: number, W: number, bone: typeof hips) => {
    const x = dir.clone().normalize();
    const y = nrm.clone().cross(x).normalize();
    const outline: OutlinePoint[] = [
      [0, -W * 0.12],
      [L * 0.22, -W * 0.5],
      [L * 0.7, -W * 0.46],
      [L, -W * 0.06, "sharp"],
      [L * 0.94, W * 0.34],
      [L * 0.62, W * 0.5],
      [L * 0.22, W * 0.44],
      [0, W * 0.12],
    ];
    const tipOutline: OutlinePoint[] = [
      [L * 0.8, -W * 0.16],
      [L * 0.92, -W * 0.1],
      [L, -W * 0.03, "sharp"],
      [L * 0.92, W * 0.12],
      [L * 0.8, W * 0.16],
    ];
    // Dark tip, painted rachis down the middle, storm slate between.
    const color = paint((_p, _n, s) => (s[0] > L * 0.62 || Math.abs(s[1]) < 0.012 ? DARK : STORM_HI));
    b.extrude(outline, { at: root, x, y, bone, thickness: 0.022, bevel: 0.007, smoothing: 1, detail: 0.4, color });
    glow(b.extrude(tipOutline, { at: root, x, y, bone, thickness: 0.03, bevel: 0.008, smoothing: 1, detail: 0.4, color: CYAN }), 1.3);
  };

  // ---------- torso, neck, tail tube ----------
  const torso = b.sweep(spine, (t) => {
    const k = key(t, TORSO_KEYS);
    return [k * 1.15, k];
  }, { color: body });
  const neckTube = b.sweep(neck, (t) => 0.24 - 0.1 * t, { color: body });
  const tailTube = b.sweep(tail, (t) => 0.24 - 0.12 * t, { color: plumage });
  b.cards(b.surface(tailTube).scatter(26, { rng: rng(50), minDist: 0.07 }), COVERT, {
    size: [0.1, 0.17],
    lean: 40,
    bend: 12,
    vary: 0.2,
    rng: rng(51),
  });

  // gold collars round the neck and waist
  const neckSurf = b.surface(neckTube);
  b.sweep(neckSurf.loop(neck.joints[1], { lift: 0.012 }), 0.016, { color: GOLD });
  b.sweep(neckSurf.loop(neck.joints[2], { lift: 0.012 }), 0.016, { color: GOLD_DK });
  b.sweep(b.surface(torso).loop(hips, { lift: 0.014 }), 0.02, { color: GOLD_DK });

  // chest armour plate with a cyan light strip
  const chestOutline: OutlinePoint[] = [
    [-0.15, 0.14],
    [0.15, 0.14],
    [0.17, -0.02],
    [0, -0.2, "sharp"],
    [-0.17, -0.02],
  ];
  const chestHit = b.surface(torso).nearest([0, 1.56, 0.5]);
  const plate = chestHit.moved([0, 0.012, 0]);
  b.extrude(
    chestOutline.map(([x, y]) => [x * 1.12, y * 1.12] as OutlinePoint),
    {
      at: plate.moved([0, -0.006, 0]),
      x: plate.dir([1, 0, 0]),
      y: plate.dir([0, 0, 1]),
      thickness: 0.04,
      bevel: 0.012,
      color: GOLD,
      name: "chestRim",
    },
  );
  b.extrude(chestOutline, {
    at: plate,
    x: plate.dir([1, 0, 0]),
    y: plate.dir([0, 0, 1]),
    thickness: 0.05,
    bevel: 0.014,
    smoothing: 1,
    color: DARK,
    name: "chestPlate",
  });
  glow(
    b.extrude(
      chestOutline.map(([x, y]) => [x * 0.5, y * 0.5 - 0.02] as OutlinePoint),
      {
        at: plate.moved([0, 0.02, 0]),
        x: plate.dir([1, 0, 0]),
        y: plate.dir([0, 0, 1]),
        thickness: 0.03,
        bevel: 0.006,
        color: CYAN,
        name: "chestCore",
      },
    ),
    1.4,
  );

  // ---------- head ----------
  const headLoft = b.loft(
    [
      { at: head.local({ back: 0.1, up: 0.02 }), w: 0.26, h: 0.32 },
      { at: head.local({ forward: 0.02 }), w: 0.44, h: 0.42 },
      { at: head.local({ forward: 0.16, up: 0.02 }), w: 0.38, h: 0.36 },
      { at: head.local({ forward: 0.25, up: -0.03 }), w: 0.24, h: 0.22 },
    ],
    { bone: head, color: body },
  );

  // hooked gold beak with a dark tip, and a dark lower mandible on the jaw joint
  const beak = bezier(
    head.local({ forward: 0.12, up: 0.03 }),
    head.local({ forward: 0.36, up: 0.1 }),
    head.local({ forward: 0.44, up: -0.1 }),
  );
  b.sweep(beak, (t) => [0.072 - 0.03 * t, 0.06 - 0.03 * t], {
    bone: head,
    color: GOLD,
    bands: [
      [0.7, GOLD],
      [1, DARK],
    ],
    caps: { end: "point" },
  });
  b.sweep(
    bezier(
      jaw.local({ forward: 0.02, up: 0.02 }),
      jaw.local({ forward: 0.2, up: -0.01 }),
      jaw.local({ forward: 0.3, up: -0.05 }),
    ),
    (t) => [0.05 - 0.02 * t, 0.03 - 0.01 * t],
    { bone: jaw, color: GOLD_DK, caps: { end: "point" } },
  );

  // eyes: a dark socket and a bright cyan lens, both stuck to the head surface; brow ridge over each
  const headSurf = b.surface(headLoft);
  for (const s of [1, -1]) {
    const hit = headSurf.nearest(head.local({ left: s * 0.12, forward: 0.2, up: 0.03 }));
    b.stick(new THREE.SphereGeometry(0.06, 10, 8), DARK, hit, { embed: 0.5 });
    glow(b.stick(new THREE.SphereGeometry(0.045, 10, 8), CYAN, hit.moved([0, 0.02, 0]), { embed: 0.3 }), 1.8);
    b.sweep(
      bezier(
        head.local({ left: s * 0.05, forward: 0.14, up: 0.1 }),
        head.local({ left: s * 0.12, forward: 0.2, up: 0.13 }),
        head.local({ left: s * 0.15, forward: 0.26, up: 0.05 }),
      ),
      [0.035, 0.02],
      { bone: head, color: DARK, section: { ngon: 4 } },
    );
  }

  // lightning crest: five angular feathers sweeping back, each with a glowing tip
  for (let i = -2; i <= 2; i++) {
    const k = Math.abs(i);
    const path = bezier(
      head.local({ left: i * 0.05, up: 0.1, forward: 0 }),
      head.local({ left: i * 0.1, up: 0.36 - k * 0.03, back: 0.06 }),
      head.local({ left: i * 0.15, up: 0.48 - k * 0.07, back: 0.24 + k * 0.05 }),
    );
    b.sweep(path, [0.036 - k * 0.004, 0.004], {
      bone: head,
      color: STORM_HI,
      section: { ngon: 4 },
      caps: { end: "point" },
      detail: 0.5,
    });
    glow(b.sweep(path.slice(0.76, 1), [0.013, 0.002], { bone: head, color: CYAN, caps: { end: "point" } }), 1.4);
  }

  // ---------- legs and toes ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.19, 1.16, -0.1],
        [s * 0.24, 0.76, 0.12],
        [s * 0.2, 0.34, -0.05],
        [s * 0.2, 0.05, 0.2],
      ]),
      {
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
        role: "leg",
      },
    );
    const kneeT = leg.span(1)[0];
    const thigh = b.sweep(leg, (t) => 0.16 - 0.06 * (t / kneeT), { from: 0, to: kneeT, color: plumage });
    b.cards(b.surface(thigh).scatter(22, { rng: rng(40 + s), minDist: 0.07 }), COVERT, {
      size: [0.1, 0.16],
      lean: 30,
      bend: 10,
      vary: 0.2,
      rng: rng(41 + s),
    });
    b.sweep(leg, (t) => 0.07 - 0.03 * ((t - kneeT) / (1 - kneeT)), { from: kneeT, to: 1, color: scutes });

    const foot = leg.joints[3];
    const toes = [
      { n: "a", mid: [s * 0.2, 0.03, 0.3], tip: [s * 0.2, 0.03, 0.46] },
      { n: "b", mid: [s * 0.3, 0.03, 0.3], tip: [s * 0.37, 0.03, 0.4] },
      { n: "c", mid: [s * 0.12, 0.03, 0.3], tip: [s * 0.1, 0.03, 0.42] },
      { n: "d", mid: [s * 0.24, 0.03, 0.02], tip: [s * 0.26, 0.03, -0.08] },
    ];
    for (const toeDef of toes) {
      const toe = b.chain(`toe${S}${toeDef.n}`, catmull([[s * 0.2, 0.05, 0.2], toeDef.mid, toeDef.tip]), {
        parent: foot,
        names: [`toe${S}${toeDef.n}1`, `toe${S}${toeDef.n}2`],
        role: "digit",
      });
      b.sweep(toe, (u) => 0.035 - 0.012 * u, { color: GOLD });
      b.spike(toeDef.tip, [toeDef.tip[0], 0.0, toeDef.tip[2] + 0.04], null, 0.026, {
        bone: toe.joints[1],
        color: DARK,
      });
    }
  }

  // ---------- wings: arm, membrane, covert cards, flight feathers ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulder: Pt = [s * 0.2, 1.8, 0.12];
    const elbow: Pt = [s * 0.9, 2.04, -0.02];
    const wrist: Pt = [s * 1.7, 2.3, -0.26];
    const hand: Pt = [s * 2.3, 2.34, -0.6];
    const wing = b.chain(`wing${S}`, catmull([shoulder, elbow, wrist, hand]), {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "wing",
    });
    b.sweep(wing, (t) => 0.1 - 0.06 * t, {
      color: plumage,
      detail: 0.6,
      bands: [
        [0.3, plumage],
        [0.36, GOLD],
        [0.64, plumage],
        [0.7, GOLD],
        [1, plumage],
      ],
    });
    const skin = b.membrane(
      wing,
      [
        [s * 0.2, 1.5, -0.42],
        [s * 0.9, 1.7, -0.86],
        [s * 1.6, 1.9, -1.1],
        [s * 2.25, 2.0, -0.98],
      ],
      { color: wingSkin, thickness: 0.03 },
    );
    b.cards(
      b.surface(skin).scatter(46, { rng: rng(30 + s), minDist: 0.09, filter: (h) => h.n.y > 0.2 }),
      COVERT,
      { size: [0.12, 0.2], lean: 15, bend: 10, vary: 0.2, rng: rng(31 + s) },
    );

    const armDir = new THREE.Vector3(...hand).sub(new THREE.Vector3(...shoulder));
    const nrm = armDir.clone().cross(new THREE.Vector3(0, 0, -1));
    // secondaries: shorter feathers rooted along the forearm, trailing back over the membrane
    for (let i = 0; i < 5; i++) {
      const f = 0.1 + 0.8 * (i / 4);
      const root: Pt = [
        elbow[0] + (wrist[0] - elbow[0]) * f,
        elbow[1] + (wrist[1] - elbow[1]) * f,
        elbow[2] + (wrist[2] - elbow[2]) * f,
      ];
      feather(root, new THREE.Vector3(s * 0.35, -0.1, -1), nrm, 0.5 - 0.04 * i, 0.22, wing.joints[1]);
    }
    for (let i = 0; i < 7; i++) {
      const f = 0.2 + 0.8 * (i / 6);
      const root: Pt = [
        wrist[0] + (hand[0] - wrist[0]) * f,
        wrist[1] + (hand[1] - wrist[1]) * f,
        wrist[2] + (hand[2] - wrist[2]) * f,
      ];
      const a = i / 6;
      const dir = new THREE.Vector3(s * (1 - 0.5 * a), -0.1, -(0.2 + 0.8 * a));
      feather(root, dir, nrm, 0.62 - 0.03 * i, 0.26, wing.joints[2]);
    }
  }

  // ---------- tail fan ----------
  const tailTip: Pt = [0, 0.7, -1.08];
  for (let i = 0; i < 7; i++) {
    const th = (i - 3) * 0.2;
    const dir = new THREE.Vector3(Math.sin(th) * 0.9, -0.12, -1);
    feather(tailTip, dir, new THREE.Vector3(0, 1, 0), 0.72 - Math.abs(i - 3) * 0.06, 0.28, tail.joints[3]);
  }

  // ---------- storm cards and lightning arcs ----------
  const torsoSurf = b.surface(torso);
  b.cards(
    torsoSurf.scatter(110, {
      rng: rng(5),
      minDist: 0.075,
      filter: (h) => h.n.y > -0.4 && h.at.distanceTo(chestHit.at) > 0.28,
    }),
    COVERT,
    { size: [0.11, 0.2], lean: 35, bend: 14, vary: 0.25, rng: rng(6) },
  );
  b.cards(b.surface(neckTube).scatter(36, { rng: rng(8), minDist: 0.06 }), COVERT, {
    size: [0.08, 0.15],
    lean: 40,
    bend: 12,
    vary: 0.2,
    rng: rng(9),
  });
  glow(
    b.cards(torsoSurf.scatter(14, { rng: rng(12), minDist: 0.3 }), SPARK, {
      size: [0.07, 0.13],
      lean: 40,
      rng: rng(13),
    }),
    1.3,
  );

  const r = rng(21);
  const bolt = (a: number[], c: number[], n: number, amp: number, rad: number) => {
    const pts: number[][] = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const p = [a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      if (i > 0 && i < n) for (let k = 0; k < 3; k++) p[k] += (r() - 0.5) * amp;
      pts.push(p);
    }
    glow(b.sweep(polyline(pts), rad, { color: CYAN }), 1.6);
  };
  for (const s of [1, -1]) {
    bolt([s * 2.3, 2.34, -0.6], [s * 2.8, 2.8, -0.5], 6, 0.12, 0.011);
    bolt([s * 0.3, 0.03, 0.2], [s * 0.95, 0.02, 0.6], 6, 0.1, 0.01);
  }
  bolt([0.05, 2.8, 0.55], [0.4, 3.0, 0.3], 6, 0.1, 0.01);
  bolt([-0.05, 2.8, 0.5], [-0.35, 3.0, 0.2], 6, 0.1, 0.01);
  bolt([0, 0.68, -1.1], [0.25, 0.0, -1.35], 6, 0.12, 0.011);
  bolt([2.3, 2.6, -0.7], [1.0, 2.9, 0.2], 7, 0.16, 0.009);

  return b.root;
}
