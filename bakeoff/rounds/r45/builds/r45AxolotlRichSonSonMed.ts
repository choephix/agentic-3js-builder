import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, bezier, offset, catmull } from "../../../../src/index";

export const meta = {
  "name": "Chibi Axolotl",
  "description": "A chubby chibi axolotl with a huge round head, wide smile, bead eyes and three frilly pink gill fronds on each side, standing on four stubby webbed feet with a finned tail."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#f6bfce",
  skinLight: "#ffd9e3",
  skinShadow: "#e59db4",
  belly: "#fde8ec",
  freckle: "#d98aa3",
  cheekBlush: "#ff8fab",
  gillStalk: "#e8467a",
  gillFrond: "#ff7fa3",
  gillTip: "#ffb8cb",
  gillDark: "#c2345f",
  fin: "#f9a8bf",
  finEdge: "#ff7fa3",
  finRay: "#e98aa6",
  eye: "#24122c",
  eyeShine: "#ffffff",
  eyeRing: "#7a3d5c",
  mouthLine: "#b9456a",
  mouthInside: "#d9607f",
  tongue: "#ff90a8",
  nostril: "#a83a60",
  toe: "#ffd0dc",
  toeTip: "#fff0f4",
};
const M = {
  headCenter: [0, 0.125, 0.19] as [number, number, number],
  neckSeam: [0, 0.1, 0.1] as [number, number, number],
  jawHinge: [0, 0.06, 0.16] as [number, number, number],
  snoutTip: [0, 0.09, 0.31] as [number, number, number],
  eyeL: [0.085, 0.185, 0.25] as [number, number, number],
  eyeR: [-0.085, 0.185, 0.25] as [number, number, number],
  gillRootL1: [0.12, 0.19, 0.12] as [number, number, number],
  gillRootL2: [0.135, 0.14, 0.12] as [number, number, number],
  gillRootL3: [0.125, 0.09, 0.12] as [number, number, number],
  gillRootR1: [-0.12, 0.19, 0.12] as [number, number, number],
  gillRootR2: [-0.135, 0.14, 0.12] as [number, number, number],
  gillRootR3: [-0.125, 0.09, 0.12] as [number, number, number],
  shoulderL: [0.1, 0.065, 0.06] as [number, number, number],
  shoulderR: [-0.1, 0.065, 0.06] as [number, number, number],
  hipL: [0.1, 0.065, -0.08] as [number, number, number],
  hipR: [-0.1, 0.065, -0.08] as [number, number, number],
  handL: [0.19, 0.012, 0.11] as [number, number, number],
  handR: [-0.19, 0.012, 0.11] as [number, number, number],
  footL: [0.19, 0.012, -0.05] as [number, number, number],
  footR: [-0.19, 0.012, -0.05] as [number, number, number],
  backRidgeStart: [0, 0.185, 0.07] as [number, number, number],
  tailRoot: [0, 0.09, -0.12] as [number, number, number],
  tailTip: [0, 0.065, -0.4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const R = rng(11);

  // Head dome: squashed sphere, centre near headCenter
  const C: [number, number, number] = [0, 0.125, 0.19];
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), P.skin, {
    bone: head,
    at: C,
    scale: [0.15, 0.115, 0.12],
    flat: true,
  });
  // lower cheeks / base to rest on floor-ish and give width
  b.part(new THREE.SphereGeometry(1, 10, 6), P.skin, {
    bone: head,
    at: [0, 0.07, 0.19],
    scale: [0.148, 0.07, 0.12],
    flat: true,
  });
  // snout
  b.part(new THREE.SphereGeometry(1, 10, 7), P.skin, {
    bone: head,
    at: [0, 0.1, 0.25],
    scale: [0.1, 0.07, 0.06],
    flat: true,
  });
  // top cap
  b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.4), P.skinLight, {
    bone: head,
    at: [0, 0.165, 0.19],
    scale: [0.135, 0.08, 0.108],
    flat: true,
  });
  // neck collar
  b.part(new THREE.CylinderGeometry(0.1, 0.115, 0.05, 10), P.skinShadow, {
    bone: head,
    at: [0, 0.1, 0.1],
    dir: [0, 0, 1],
    scale: [1, 1, 1.0],
  });

  // upper lip
  b.part(new THREE.BoxGeometry(0.17, 0.014, 0.1), P.skin, { bone: head, at: [0, 0.078, 0.255] });
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.07), P.skinLight, { bone: head, at: [0, 0.09, 0.225] });

  // mouth cavity
  b.part(new THREE.BoxGeometry(0.15, 0.016, 0.09), P.mouthInside, { bone: head, at: [0, 0.066, 0.24] });
  b.part(new THREE.SphereGeometry(1, 8, 5), P.tongue, {
    bone: jaw,
    at: [0, 0.058, 0.23],
    scale: [0.04, 0.01, 0.04],
    flat: true,
  });

  // lower jaw
  b.part(new THREE.SphereGeometry(1, 10, 6), P.skin, {
    bone: jaw,
    at: [0, 0.04, 0.23],
    scale: [0.1, 0.027, 0.08],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), P.belly, {
    bone: jaw,
    at: [0, 0.024, 0.245],
    scale: [0.08, 0.016, 0.06],
    flat: true,
  });

  // smile line: curved sweep along the front
  const smile: [number, number, number][] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8 - 0.5;
    const x = t * 0.19;
    const z = 0.268 - 0.17 * (x * x) / 0.05 * 0.25 - Math.abs(t) * 0.04;
    smile.push([x, 0.062 + 0.09 * t * t * 1.2, z - 0.0]);
  }
  // build as small rods
  for (let i = 0; i < smile.length - 1; i++) {
    b.rod(smile[i], smile[i + 1], 0.0032, P.mouthLine, { bone: head, caps: "round" });
  }
  for (const s of [1, -1]) {
    // corner curls
    b.rod([s * 0.095, 0.072, smile[0][2]], [s * 0.106, 0.086, smile[0][2] - 0.012], 0.0032, P.mouthLine, { bone: head });
  }

  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.006, 6, 4), P.nostril, { bone: head, at: [s * 0.022, 0.126, 0.292] });
  }

  // eyes
  for (const s of [1, -1]) {
    const e: [number, number, number] = [s * 0.085, 0.185, 0.25];
    const dir: [number, number, number] = [s * 0.5, 0.25, 0.8];
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 10), P.eyeRing, {
      bone: head,
      at: [e[0] - s * 0.001, e[1] - 0.002, e[2] - 0.004],
      dir,
    });
    b.part(new THREE.SphereGeometry(0.019, 8, 6), P.eye, { bone: head, at: e });
    const sh = new THREE.Vector3(...dir).normalize();
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), P.eyeShine, {
      bone: head,
      at: [e[0] + sh.x * 0.015 - s * 0.004, e[1] + 0.008, e[2] + sh.z * 0.015],
    });
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), P.eyeShine, {
      bone: head,
      at: [e[0] + sh.x * 0.016 + s * 0.005, e[1] - 0.007, e[2] + sh.z * 0.016],
    });
    // brow lid
    b.part(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.skinShadow, {
      bone: head,
      at: [e[0], e[1] + 0.006, e[2] - 0.004],
      scale: [0.026, 0.016, 0.022],
      dir,
      flat: true,
    });
    // cheek blush
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 10), P.cheekBlush, {
      bone: head,
      at: [s * 0.136, 0.098, 0.215],
      dir: [s, 0.05, 0.25],
    });
  }

  // freckles on top of head
  for (let i = 0; i < 10; i++) {
    const x = (R() - 0.5) * 0.17;
    const z = 0.15 + R() * 0.12;
    const y = 0.125 + 0.115 * Math.sqrt(Math.max(0, 1 - (x / 0.15) ** 2 - ((z - 0.19) / 0.12) ** 2));
    if (y < 0.15) continue;
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.003, 6), P.freckle, { bone: head, at: [x, y - 0.001, z] });
  }

  // gill root bumps
  for (const s of [1, -1]) {
    for (const k of ["1", "2", "3"] as const) {
      const m = M[(s > 0 ? "gillRootL" : "gillRootR") + k];
      b.part(new THREE.SphereGeometry(0.02, 7, 5), P.skinShadow, {
        bone: head,
        at: [m[0] - s * 0.012, m[1], m[2]],
        scale: [0.8, 1, 1],
        flat: true,
      });
    }
  }
}
    return buildHead;
  })(),
  // gills
  (() => {
function buildGills({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const sides = [1, -1];
  const names = ["1", "2", "3"];
  // stalk tips per gill (left side, mirrored by x)
  const tips: [number, number, number][] = [
    [0.2, 0.28, 0.07],
    [0.25, 0.17, 0.07],
    [0.22, 0.07, 0.07],
  ];
  for (const s of sides) {
    const side = s > 0 ? "L" : "R";
    names.forEach((n, gi) => {
      const joint = J[`gill${side}${n}`];
      const root = M[`gillRoot${side}${n}`];
      const tip = [tips[gi][0] * s, tips[gi][1], tips[gi][2]];
      // curve control: bows outward and slightly up
      const mid = [
        (root[0] + tip[0]) / 2 + s * 0.012,
        (root[1] + tip[1]) / 2 + 0.014,
        (root[2] + tip[2]) / 2 + 0.005,
      ];
      const path = bezier(root, mid, tip);
      // stalk
      const stalk = b.sweep(path, [0.011, 0.005], {
        bone: joint,
        color: P.gillStalk,
        sides: 6,
        caps: { start: "round", end: "round" },
        sectors: [[110, 250, P.gillDark]],
      });
      // base knob
      b.part(new THREE.SphereGeometry(0.017, 7, 5), P.gillDark, { bone: joint, at: root });
      // filaments
      const count = 9;
      for (let i = 0; i < count; i++) {
        const t = 0.1 + (0.88 * i) / (count - 1);
        const pt = path.at(t);
        const tan = path.tangentAt(t);
        // length: longest in the middle
        const len = 0.028 + 0.03 * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.04)) * (1 - 0.25 * t);
        for (const k of [1, -1]) {
          const front = (i + (k > 0 ? 0 : 1)) % 2 === 0;
          // direction: perpendicular-ish to the stalk, up/down split, slightly back
          const d = [
            s * 0.25 + tan.x * 0.3,
            k * 0.85 + tan.y * 0.3,
            -0.35 + (front ? 0.45 : -0.1) + (R() - 0.5) * 0.2,
          ];
          const l = Math.hypot(d[0], d[1], d[2]);
          const dir = [d[0] / l, d[1] / l, d[2] / l];
          const base = [pt.x ?? pt.at?.x, 0, 0];
          const p0 = pt.at ?? pt;
          const bp = [p0.x, p0.y, p0.z];
          const r = 0.0048 * (1 - 0.35 * t);
          const stemLen = len * 0.72;
          b.spike(bp, dir, stemLen, r, { bone: joint, color: P.gillFrond, sides: 5 });
          const tp = [bp[0] + dir[0] * stemLen, bp[1] + dir[1] * stemLen, bp[2] + dir[2] * stemLen];
          b.spike(tp, dir, len * 0.42, r * 0.75, { bone: joint, color: P.gillTip, sides: 5 });
        }
      }
      // terminal tuft at the stalk tip
      const td = [s * 0.5, 0.7, -0.2];
      const tl = Math.hypot(td[0], td[1], td[2]);
      const tdir = [td[0] / tl, td[1] / tl, td[2] / tl];
      b.spike(tip, tdir, 0.04, 0.006, { bone: joint, color: P.gillFrond, sides: 5 });
      b.part(new THREE.SphereGeometry(0.008, 6, 4), P.gillTip, {
        bone: joint,
        at: [tip[0] + tdir[0] * 0.042, tip[1] + tdir[1] * 0.042, tip[2] + tdir[2] * 0.042],
      });
    });
  }
}
    return buildGills;
  })(),
  // body
  (() => {
function buildBody({ b, J, P, M }: Ctx) {
  const r = rng(11);
  // Body bean: loft from neck seam to tail root, belly on floor.
  const stations = [
    { at: [0, 0.088, 0.095], w: 0.15, h: 0.15 },
    { at: [0, 0.09, 0.06], w: 0.2, h: 0.18 },
    { at: [0, 0.09, 0.0], w: 0.21, h: 0.18 },
    { at: [0, 0.088, -0.06], w: 0.2, h: 0.176 },
    { at: [0, 0.085, -0.11], w: 0.15, h: 0.14 },
    { at: [0, 0.085, -0.14], w: 0.1, h: 0.1 },
  ];
  const body = b.loft(stations as any, {
    bone: [J.hips, J.spine1],
    color: P.skin,
    sectors: [[125, 235, P.belly], [-50, 50, P.skinLight]],
    detail: 0.8,
  } as any);
  const skin = b.surface(body);

  // Belly floor plate to guarantee a flat resting patch.
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.006, 10).scale(1, 1, 1.5), P.belly, {
    bone: J.hips, at: [0, 0.002, -0.01],
  });

  // Freckles scattered on back and flanks.
  const hits = skin.scatter(22, {
    rng: r, minDist: 0.03,
    filter: (h: any) => h.n.y > 0.1 && h.at.y > 0.07,
  });
  hits.forEach((h: any, i: number) => {
    const big = i % 3 === 0;
    b.stick(new THREE.CylinderGeometry(big ? 0.009 : 0.006, big ? 0.009 : 0.006, 0.004, 6),
      big ? P.skinShadow : P.freckle, h, { embed: 0.4 });
  });

  // Costal grooves behind the shoulders on both flanks.
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = 0.03 - i * 0.03;
      const a = skin.around([0, 0.09, z]).at(s * 90, 28);
      const c = skin.around([0, 0.09, z]).at(s * 80, -12);
      const d = skin.around([0, 0.09, z]).at(s * 85, 8);
      if (a && c && d) {
        b.sweep(catmull([a.moved([0, 0.002, 0]), d.moved([0, 0.002, 0]), c.moved([0, 0.002, 0])]) as any,
          0.0035, { color: P.skinShadow, bone: J.spine1, caps: "round", sides: 5 } as any);
      }
    }
  }

  // Dorsal fin ridge from backRidgeStart to tail root.
  const z0 = M.backRidgeStart[2];
  const z1 = M.tailRoot[2];
  const fin = [
    [0, 0.0], [0.03, 0.012], [0.07, 0.035], [0.13, 0.045], [0.19, 0.04],
    [0.24, 0.02], [0.24 - 0.0, 0.0],
  ].map(([u, v]) => [u * (z0 - z1) / 0.24 * -1 + 0, v] as [number, number]);
  const outline: any = [
    [0, 0], [0.03, 0.02], [0.08, 0.04], [0.13, 0.047], [0.19, 0.042], [0.23, 0.02], [0.24, 0],
  ];
  void fin;
  const finPart = b.extrude(outline, {
    at: [0, 0.182, z0], x: [0, 0, -1], thickness: 0.004, bevel: 0.001,
    color: P.fin, bone: J.spine1, smoothing: 1,
  } as any);
  // fin rim and rays
  b.sweep(catmull(outline.map(([u, v]: number[]) => [0, 0.182 + v + 0.001, z0 - u])) as any,
    0.003, { color: P.finEdge, bone: J.spine1, sides: 5 } as any);
  for (let i = 1; i < 6; i++) {
    const u = i * 0.04;
    const hgt = 0.04 * Math.sin((u / 0.24) * Math.PI) + 0.005;
    b.rod([0.003, 0.186, z0 - u], [0.003, 0.186 + hgt, z0 - u - 0.004], 0.0012,
      { color: P.finRay, bone: J.spine1, sides: 4 } as any);
    b.rod([-0.003, 0.186, z0 - u], [-0.003, 0.186 + hgt, z0 - u - 0.004], 0.0012,
      { color: P.finRay, bone: J.spine1, sides: 4 } as any);
  }
  void finPart;

  // Vent bump near tail root underside.
  b.part(new THREE.SphereGeometry(0.014, 7, 5).scale(1.2, 0.6, 1.4), P.skinShadow, {
    bone: J.hips, at: [0, 0.012, -0.115],
  });
  b.part(new THREE.SphereGeometry(0.007, 6, 4), P.freckle, { bone: J.hips, at: [0, 0.01, -0.12] });

  // Shoulder-line soft shading bands on upper back.
  b.part(new THREE.SphereGeometry(0.05, 8, 6).scale(1.3, 0.35, 1.7), P.skinLight, {
    bone: J.spine1, at: [0, 0.165, 0.0],
  });
}
    return buildBody;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const tailJoints = [J.tail1, J.tail2, J.tail3, J.tail4];
  const pts: number[][] = [
    [0, 0.09, -0.12],
    [0, 0.087, -0.19],
    [0, 0.082, -0.26],
    [0, 0.075, -0.33],
    [0, 0.068, -0.4],
  ];
  const path = catmull(pts);
  const rad = (t: number): [number, number] => {
    const k = 1 - t;
    return [0.045 * k + 0.02 * t * 0.9 + 0.003, 0.075 * k + 0.022 * t + 0.003];
  };
  const body = b.sweep(path, rad, {
    bone: tailJoints,
    color: P.skin,
    sides: 8,
    caps: "round",
    sectors: [
      [125, 235, P.belly],
      [-40, 40, P.skinLight, 0, 0.6],
    ],
  });

  // fins: dorsal and ventral membranes following the body outline
  const top = (t: number, lift: number) => {
    const p = path.at(t);
    const r = rad(t)[1];
    return [p.x, p.y + r + lift, p.z];
  };
  const dorsalA: number[][] = [];
  const dorsalB: number[][] = [];
  const ventA: number[][] = [];
  const ventB: number[][] = [];
  const N = 9;
  for (let i = 0; i <= N; i++) {
    const t = 0.02 + (0.96 * i) / N;
    const p = path.at(t);
    const r = rad(t)[1];
    const h = 0.05 * (1 - t * 0.55) * (i % 2 ? 0.92 : 1) + 0.012;
    dorsalA.push([0, p.y + r * 0.85, p.z]);
    dorsalB.push([0, p.y + r + h, p.z]);
    const hv = 0.035 * (1 - t * 0.5) * (i % 2 ? 0.9 : 1) + 0.008;
    ventA.push([0, p.y - r * 0.85, p.z]);
    ventB.push([0, p.y - r - hv, p.z]);
  }
  b.membrane(dorsalA, dorsalB, { color: P.fin, thickness: 0.005, bone: tailJoints[1], rows: 2 });
  b.membrane(ventA, ventB, { color: P.fin, thickness: 0.005, bone: tailJoints[1], rows: 2 });

  // rim lines
  b.sweep(catmull(dorsalB), 0.0035, { color: P.finEdge, bone: tailJoints[1], sides: 5 });
  b.sweep(catmull(ventB), 0.0032, { color: P.finEdge, bone: tailJoints[1], sides: 5 });

  // fin rays
  for (let i = 1; i < N; i++) {
    const a = dorsalA[i];
    const c = dorsalB[i];
    const bone = tailJoints[Math.min(3, Math.floor((i / N) * 4))];
    b.rod([0.004, a[1] + 0.004, a[2]], [0.004, c[1] - 0.003, c[2]], 0.0016, P.finRay, { bone });
    b.rod([-0.004, a[1] + 0.004, a[2]], [-0.004, c[1] - 0.003, c[2]], 0.0016, P.finRay, { bone });
    const va = ventA[i];
    const vc = ventB[i];
    b.rod([0.004, va[1] - 0.004, va[2]], [0.004, vc[1] + 0.003, vc[2]], 0.0015, P.finRay, { bone });
    b.rod([-0.004, va[1] - 0.004, va[2]], [-0.004, vc[1] + 0.003, vc[2]], 0.0015, P.finRay, { bone });
  }

  // tip bead of rim
  const tip = path.at(1);
  b.part(new THREE.SphereGeometry(0.008, 6, 4), P.finEdge, {
    bone: J.tail4,
    at: [0, tip.y, tip.z - 0.012],
  });

  // freckles on the sides, sparser toward the tip
  const skin = b.surface(body);
  for (const s of [1, -1]) {
    for (let i = 0; i < 11; i++) {
      const t = 0.06 + R() * 0.7 * (1 - i * 0.02);
      if (R() > 1 - t * 0.7) continue;
      const hit = body.at(t, s * (60 + R() * 35));
      b.stick(
        new THREE.CylinderGeometry(0.0045 + R() * 0.003, 0.0045, 0.003, 6),
        i % 3 === 0 ? P.skinShadow : P.freckle,
        hit,
        { embed: 0.4 },
      );
    }
  }
  void skin;
  void frame;
  void bezier;
}
    return buildTail;
  })(),
  // limbs
  (() => {
function buildLimbs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const SK = P.skin, SH = P.skinShadow, TOE = P.toe, TIP = P.toeTip, FR = P.freckle;
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // side s: +1 left (+X), -1 right
  const build = (s: number, front: boolean) => {
    const sideName = s > 0 ? "L" : "R";
    const root = front ? M["shoulder" + sideName] : M["hip" + sideName];
    const hand = front ? M["hand" + sideName] : M["foot" + sideName];
    const rootJ = front ? J["shoulder" + sideName] : J["hip" + sideName];
    const midJ = front ? J["elbow" + sideName] : J["knee" + sideName];

    const elbow: [number, number, number] = [
      root[0] + s * 0.06,
      0.032,
      root[2] + (front ? 0.02 : -0.02),
    ];
    const wrist: [number, number, number] = [hand[0] - s * 0.015, 0.024, hand[2] - (front ? 0.005 : 0)];

    // bulb covering the socket
    b.part(sph(0.04, 8, 6), SK, { bone: rootJ, at: [root[0] - s * 0.005, root[1], root[2]], scale: [1, 0.85, 1] });
    b.part(sph(0.026, 6, 5), P.skinLight, { bone: rootJ, at: [root[0] + s * 0.005, root[1] + 0.02, root[2]] });

    // upper segment
    b.capsule(root, elbow, [0.032, 0.027], SK, { bone: rootJ, sides: 8 });
    // lower segment
    b.capsule(elbow, wrist, [0.027, 0.022], SK, { bone: midJ, sides: 8 });
    b.part(sph(0.03, 8, 6), SK, { bone: midJ, at: elbow });

    // wrist crease
    b.part(new THREE.TorusGeometry(0.022, 0.003, 4, 8), SH, {
      bone: midJ,
      at: [wrist[0] - s * 0.012, wrist[1], wrist[2] - 0.005],
      dir: [s * 0.9, 0, 0.3],
      axis: "z",
    });

    // palm / sole pad
    const padR = front ? 0.03 : 0.036;
    const pad = b.part(new THREE.CylinderGeometry(padR, padR * 1.05, 0.016, 9), TOE, {
      bone: midJ,
      at: [hand[0], 0.008, hand[2]],
      scale: [1, 1, front ? 0.9 : 1.15],
    });
    void pad;
    b.part(new THREE.CylinderGeometry(padR * 0.55, padR * 0.55, 0.004, 8), P.skinLight, {
      bone: midJ,
      at: [hand[0], 0.017, hand[2]],
    });

    // digits
    const n = front ? 4 : 5;
    const spread = front ? 0.95 : 1.15;
    const baseYaw = front ? 0.35 : -0.35; // feet turn outward-ish
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5;
      const ang = t * spread; // fan angle around +Z
      const yaw = ang * s * -1 + (front ? 0 : 0.0) + (front ? 0 : baseYaw * 0 );
      const dx = Math.sin(ang * s + s * (front ? 0.45 : 0.5));
      const dz = Math.cos(ang * s + s * (front ? 0.45 : 0.5));
      void yaw;
      const len = (front ? 0.04 : 0.045) * (1 - Math.abs(t) * 0.25);
      const r0 = 0.0125, r1 = 0.0105;
      const bx = hand[0] + dx * padR * 0.6, bz = hand[2] + dz * padR * 0.6;
      const ex = bx + dx * len, ez = bz + dz * len;
      const y = 0.0125;
      b.capsule([bx, y, bz], [ex, y, ez], [r0, r1], TOE, { bone: midJ, sides: 6 });
      b.part(sph(0.0115, 6, 4), TIP, { bone: midJ, at: [ex + dx * 0.004, y, ez + dz * 0.004] });
    }

    // freckles on upper limb
    for (let i = 0; i < 4; i++) {
      const t = 0.2 + R() * 0.6;
      const px = root[0] + (elbow[0] - root[0]) * t;
      const pz = root[2] + (elbow[2] - root[2]) * t + (R() - 0.5) * 0.02;
      const py = root[1] + (elbow[1] - root[1]) * t + 0.028;
      b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.002, 6), FR, { bone: rootJ, at: [px, py, pz] });
    }
  };

  for (const s of [1, -1]) {
    build(s, true);
    build(s, false);
  }
}
    return buildLimbs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "chibiAxolotl" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.09,-0.06], dir: [0,0,1], role: "spine" });
  J["spine1"] = b.joint("spine1", { parent: J["hips"], at: [0,0.09,0.04], dir: [0,0,1], role: "spine" });
  J["head"] = b.joint("head", { parent: J["spine1"], at: [0,0.11,0.1], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.06,0.16], dir: [0,0,1], role: "jaw" });
  J["gillL1"] = b.joint("gillL1", { parent: J["head"], at: [0.12,0.19,0.12], dir: [0.6,0.7,-0.3], role: "fan", group: "gills" });
  J["gillL2"] = b.joint("gillL2", { parent: J["head"], at: [0.135,0.14,0.12], dir: [1,0.2,-0.3], role: "fan", group: "gills" });
  J["gillL3"] = b.joint("gillL3", { parent: J["head"], at: [0.125,0.09,0.12], dir: [0.8,-0.4,-0.3], role: "fan", group: "gills" });
  J["gillR1"] = b.joint("gillR1", { parent: J["head"], at: [-0.12,0.19,0.12], dir: [-0.6,0.7,-0.3], role: "fan", group: "gills" });
  J["gillR2"] = b.joint("gillR2", { parent: J["head"], at: [-0.135,0.14,0.12], dir: [-1,0.2,-0.3], role: "fan", group: "gills" });
  J["gillR3"] = b.joint("gillR3", { parent: J["head"], at: [-0.125,0.09,0.12], dir: [-0.8,-0.4,-0.3], role: "fan", group: "gills" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["spine1"], at: [0.1,0.065,0.06], dir: [1,-0.3,0.3], role: "arm", group: "legs" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.15,0.04,0.085], dir: [0.5,-0.5,0.7], role: "arm", group: "legs" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["spine1"], at: [-0.1,0.065,0.06], dir: [-1,-0.3,0.3], role: "arm", group: "legs" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.15,0.04,0.085], dir: [-0.5,-0.5,0.7], role: "arm", group: "legs" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.1,0.065,-0.08], dir: [1,-0.3,-0.3], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.16,0.04,-0.1], dir: [0.4,-0.5,0.8], role: "leg", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.1,0.065,-0.08], dir: [-1,-0.3,-0.3], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.16,0.04,-0.1], dir: [-0.4,-0.5,0.8], role: "leg", group: "legs" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.09,-0.12], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.087,-0.19], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.082,-0.26], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,0.075,-0.33], dir: [0,0,-1], role: "tail", group: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
