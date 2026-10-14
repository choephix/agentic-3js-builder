```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  vec,
  frame,
  paint,
  countershade,
  mottle,
  grain,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Red Panda",
  description:
    "A stylized, rigged red panda in a neutral standing rest pose: rusty mottled coat with a dark belly and legs, a white-masked face with tear marks, white-rimmed ears, cheek ruffs, glossy eyes and a bushy ringed tail.",
};

// palette
const RUST = "#c2461b";
const RUST2 = "#dc6a2c";
const RUST_DEEP = "#9a3414";
const DARK_RUST = "#6e2412";
const EAR_BACK = "#5b1f10";
const DARK = "#2a1712";
const DARK2 = "#3d261d";
const BUFF = "#e8a868";
const TIP = "#5e200f";
const WHITE = "#f6f0e6";
const CREAM = "#eadcc6";
const NOSE = "#151010";
const EYE = "#140c0a";
const INNER = "#5c2a1e";
const TOE = "#33201a";
const CLAW = "#d9cbb0";

function must<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`red panda: missing ${what}`);
  return v;
}

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const vx = bx - ax;
  const vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - ax - vx * t, py - ay - vy * t);
}

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  // ---------- textures ----------
  const tuft = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 64 C 3 44, 4 24, 8 4 C 11 22, 13 30, 16 0 C 19 30, 21 22, 24 4 C 28 24, 29 44, 26 64 Z" fill="#ffffff"/>
      <path d="M11 64 C 10 50, 11 36, 13 22 L16 40 L19 22 C 21 36, 22 50, 21 64 Z" fill="#cfcfcf"/>
    </svg>`,
    { size: 128 },
  );

  // ---------- paints ----------
  const coatBase = mottle(grain(RUST, RUST_DEEP, { size: 0.012, axis: "z", seed: 2 }), RUST2, {
    size: 0.09,
    contrast: 0.45,
    seed: 4,
  });
  const bodyPaint = countershade(coatBase, DARK, { level: -0.3 });
  const legPaint = grain(DARK, DARK2, { size: 0.008, axis: "y", seed: 9 });
  const headFur = countershade(mottle(RUST2, RUST, { size: 0.05, contrast: 0.5, seed: 3 }), DARK, { level: -0.8 });

  // ---------- skeleton: hips, tail, spine, neck, head ----------
  const hips = b.joint("hips", { at: [0, 0.255, -0.13], dir: [0, 0, 1], role: "spine" });

  const tailPath = catmull([
    [0, 0.255, -0.13],
    [0, 0.258, -0.27],
    [0, 0.245, -0.42],
    [0, 0.24, -0.56],
    [0, 0.252, -0.7],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 6, role: "tail" });

  const bodyPath = catmull([
    [0, 0.26, -0.25],
    [0, 0.255, -0.13],
    [0, 0.258, 0.0],
    [0, 0.27, 0.12],
    [0, 0.29, 0.21],
  ]);
  const rootT = bodyPath.closestT(hips.at);
  const spine = b.chain("spine", bodyPath.slice(rootT, 1), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.285, 0.19],
      [0, 0.315, 0.25],
      [0, 0.34, 0.3],
    ]),
    { parent: spine, count: 2, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.348, 0.32], dir: [0, -0.06, 1], role: "head" });

  // ---------- body ----------
  b.sweep(
    bodyPath,
    (t: number) => {
      const k = Math.sin(Math.PI * (0.12 + 0.78 * t));
      const r = 0.07 + 0.035 * k;
      return [r, r * 1.05];
    },
    {
      bone: [tail, hips, spine],
      color: bodyPaint,
      sides: 12,
      shift: (t: number) => [0, -0.012 * Math.sin(Math.PI * t)],
    },
  );
  b.sweep(neck, [0.068, 0.058], { color: bodyPaint, sides: 12 });

  // ---------- tail: ringed and bushy ----------
  const TAIL: [number, string][] = [
    [0.3, RUST],
    [0.36, BUFF],
    [0.44, RUST],
    [0.5, BUFF],
    [0.58, RUST],
    [0.64, BUFF],
    [0.72, RUST],
    [0.78, BUFF],
    [0.87, RUST_DEEP],
    [1, TIP],
  ];
  const bandAt = (t: number) => {
    for (const [e, c] of TAIL) if (t <= e) return c;
    return TIP;
  };
  const tailTube = b.sweep(tail, [0.045, 0.058, 0.066, 0.068, 0.064, 0.055, 0.042], {
    color: RUST,
    bands: TAIL,
    sides: 10,
  });
  const tailPaint = paint((p) => bandAt(tailPath.closestT(p)));
  const tailHits = b.surface(tailTube).scatter(130, {
    rng: rng(5),
    minDist: 0.028,
    filter: (h) => {
      const t = tailPath.closestT(h.at);
      return t > 0.3 && t < 0.97 && h.n.y > -0.5;
    },
  });
  b.cards(tailHits, tuft, {
    size: [0.05, 0.065],
    lean: 62,
    bend: 25,
    flow: [0, 0, -1],
    vary: 0.3,
    rng: rng(6),
    color: tailPaint,
    cross: true,
  });

  // ---------- head ----------
  const C = head.local({ forward: 0.01 });
  const headPaint = paint((p) => {
    const x = Math.abs(p.x - C.x);
    const y = p.y - C.y;
    const z = p.z - C.z;
    if (z > -0.02) {
      const eyeD = Math.hypot(x - 0.044, y - 0.018);
      if (z > 0.02 && (eyeD < 0.022 || segDist(x, y, 0.046, 0.0, 0.052, -0.08) < 0.011)) return DARK_RUST;
      if (z > 0.03 && ((x - 0.036) / 0.023) ** 2 + ((y - 0.054) / 0.014) ** 2 < 1) return WHITE;
      if (((x - 0.082) / 0.036) ** 2 + ((y + 0.03) / 0.042) ** 2 < 1) return WHITE;
      if (z > 0.03 && x < 0.038 && y < -0.018) return WHITE;
    }
    return headFur;
  });
  const cranGeo = new THREE.SphereGeometry(0.095, 12, 9).scale(1.2, 0.95, 0.92);
  const cranium = b.part(cranGeo, headPaint, { bone: head, at: C, name: "cranium" });
  const crSurf = b.surface(cranium);

  // muzzle (upper jaw, on the head)
  const muzzle = b.sweep(
    [
      [0, C.y - 0.018, C.z + 0.045],
      [0, C.y - 0.03, C.z + 0.118],
    ],
    (t: number) => [0.036 - 0.012 * t, 0.03 - 0.01 * t],
    { bone: head, color: WHITE, name: "muzzle" },
  );

  // lower jaw
  const JA: number[] = [0, C.y - 0.045, C.z + 0.04];
  const JB: number[] = [0, C.y - 0.058, C.z + 0.105];
  const jaw = b.joint("jaw", { parent: head, at: JA, aim: JB, role: "jaw" });
  b.sweep([JA, JB], (t: number) => [0.026 - 0.008 * t, 0.016 - 0.004 * t], {
    bone: jaw,
    color: CREAM,
    name: "lowerJaw",
  });

  // nose
  const noseHit = must(b.surface(muzzle).ray([0, C.y - 0.018, C.z + 0.4], [0, 0, -1]), "nose hit");
  b.stick(new THREE.SphereGeometry(0.014, 8, 6).scale(1.45, 0.8, 1.0), NOSE, noseHit, {
    embed: 0.3,
    bone: head,
    name: "nose",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // eyes with a highlight
    const eyeHit = must(crSurf.ray([C.x + s * 0.044, C.y + 0.018, C.z + 0.4], [0, 0, -1]), "eye hit");
    const eye = b.stick(new THREE.SphereGeometry(0.0145, 10, 8).scale(1, 0.75, 1.1), EYE, eyeHit, {
      embed: 0.35,
      bone: head,
      name: `eye${side}`,
    });
    const ep = vec(eye.at).add(new THREE.Vector3(0.004, 0.007, 0.02));
    b.stick(new THREE.SphereGeometry(0.0038, 6, 4), WHITE, b.surface(eye).nearest(ep), {
      embed: 0.4,
      bone: head,
      name: `eyeShine${side}`,
    });

    // whiskers
    for (let i = 0; i < 3; i++) {
      b.rod(
        [s * 0.024, C.y - 0.034 + i * 0.006, C.z + 0.1],
        [s * 0.085, C.y - 0.046 + i * 0.014, C.z + 0.088 - i * 0.008],
        0.0012,
        { color: CREAM, bone: head, sides: 3, name: `whisker${side}${i}` },
      );
    }

    // ears: white rim, dark inner, white tufts
    const earHit = must(crSurf.around(C).at(s * 38, 48), "ear hit");
    const ey = [s * 0.35, 1, -0.1];
    const ex = [s * 0.95, -0.3, -0.28];
    const earJ = b.joint(`ear${side}`, { parent: head, at: earHit, dir: ey });
    const EAR: OutlinePoint[] = [
      [-0.04, 0],
      [0.04, 0],
      [0.032, 0.045],
      [0, 0.078],
      [-0.032, 0.045],
    ];
    const earPaint = paint((_p, n) => (n.z < -0.35 ? EAR_BACK : WHITE));
    const ear = b.extrude(EAR, {
      at: earHit.moved([0, -0.02, 0]),
      x: ex,
      y: ey,
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 2,
      color: earPaint,
      bone: earJ,
      name: `ear${side}`,
    });
    const out = ear.axis.z > 0 ? 1 : -1;
    const INNER_EAR: OutlinePoint[] = EAR.map(([x, y]) => [x * 0.68, y * 0.62 + 0.018] as OutlinePoint);
    b.extrude(INNER_EAR, {
      at: ear.local([0, 0, out * 0.006]),
      x: ex,
      y: ey,
      thickness: 0.005,
      smoothing: 2,
      color: INNER,
      bone: earJ,
      name: `earInner${side}`,
    });
    b.cards(
      [-0.012, 0, 0.012].map((dx) => frame(ear.local([dx, 0.024, out * 0.009]), ey)),
      tuft,
      { size: [0.024, 0.038], lean: 15, flow: [s * 0.3, 0, 1], color: WHITE, bone: earJ, cross: true },
    );
  }

  // cheek ruffs
  const cheekHits = crSurf.scatter(60, {
    rng: rng(11),
    minDist: 0.012,
    filter: (h) =>
      Math.abs(h.at.x - C.x) > 0.075 &&
      h.at.y < C.y - 0.005 &&
      h.at.y > C.y - 0.078 &&
      h.at.z > C.z - 0.035 &&
      h.at.z < C.z + 0.06,
  });
  b.cards(cheekHits, tuft, {
    size: [0.028, 0.036],
    lean: 55,
    flow: (f) => [Math.sign(f.at.x - C.x) || 1, -0.6, -0.2],
    vary: 0.25,
    rng: rng(12),
    color: WHITE,
    cross: true,
    bone: head,
  });

  // ---------- legs ----------
  const legs = [
    {
      tag: "F",
      parent: chest,
      root: [0.07, 0.235, 0.13],
      target: [0.075, 0.02, 0.215],
      lengths: [0.115, 0.11, 0.055],
      bend: [0, 0, -1],
      names: ["shoulder", "elbow", "wrist", "hand"],
      r: [0.038, 0.03, 0.025, 0.022, 0.021, 0.021],
    },
    {
      tag: "H",
      parent: hips,
      root: [0.075, 0.225, -0.12],
      target: [0.08, 0.02, -0.04],
      lengths: [0.11, 0.105, 0.06],
      bend: [0, 0, 1],
      names: ["hip", "knee", "ankle", "foot"],
      r: [0.046, 0.034, 0.026, 0.022, 0.021, 0.021],
    },
  ];

  for (const L of legs) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const root = [s * L.root[0], L.root[1], L.root[2]];
      const target = [s * L.target[0], L.target[1], L.target[2]];
      const pts = limb(root, target, L.lengths, [L.bend], { sole: [0, 0, 1] });
      const chain = b.chain(`leg${L.tag}${side}`, pts, {
        parent: L.parent,
        names: L.names.map((n) => n + side),
        role: "leg",
        contact: [target[0], 0, target[2] - 0.03],
      });
      b.sweep(chain, L.r, { color: legPaint });
      const paw = chain.tip ?? chain.joints[chain.joints.length - 1];

      const toes: [number, number][] = [
        [-0.018, 0.011],
        [-0.006, 0.016],
        [0.006, 0.016],
        [0.018, 0.011],
      ];
      toes.forEach(([dx, dz], i) => {
        const tx = target[0] + dx;
        const tz = target[2] + dz;
        b.part(new THREE.SphereGeometry(0.011, 7, 5), TOE, {
          bone: paw,
          at: [tx, 0.011, tz],
          name: `toe${L.tag}${side}${i}`,
        });
        b.spike([tx, 0.012, tz + 0.007], [0, -0.45, 1], 0.014, 0.0032, {
          color: CLAW,
          bone: paw,
          name: `claw${L.tag}${side}${i}`,
        });
      });
    }
  }

  return b.root;
}
```