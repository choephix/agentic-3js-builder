import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, offset, bezier, limb, catmull, polyline } from "../../../../src/index";

export const meta = {
  "name": "Pip the Axolotl",
  "description": "A chibi axolotl with a huge round head, tiny smiling face and three pairs of frilly coral-pink gill frills fanning behind it, a chubby cream-bellied body on stubby legs and a long tail finished with a translucent dorsal fin."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#f7c9d6",
  skinShade: "#e3a8bb",
  belly: "#fff2e4",
  gill: "#ff6f9c",
  gillTip: "#ffb0c8",
  gillRoot: "#e0517f",
  ink: "#33202e",
  eyeWhite: "#ffffff",
  eyeShine: "#ffe9f2",
  blush: "#ff8fb0",
  fin: "#ffc9dd",
  finEdge: "#ff9dc0",
  mouth: "#8c3a56",
  freckle: "#d88aa6",
};
const M = {
  neckBase: [0, 0.13, 0.06] as [number, number, number],
  gillSeat: [0, 0.17, 0.09] as [number, number, number],
  rump: [0, 0.1, -0.18] as [number, number, number],
  legFront: [0.075, 0.06, 0.02] as [number, number, number],
  legHind: [0.08, 0.06, -0.12] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const neck = J.neck;
  const jaw = J.jaw;
  const HC: [number, number, number] = [0, 0.16, 0.15];
  const R = 0.105;
  const sph = (w = 12, h = 9) => new THREE.SphereGeometry(1, w, h);

  // Main skull: squashed sphere
  const skull = b.part(sph(18, 14), P.skin, {
    bone: head,
    at: HC,
    scale: [R * 1.05, R * 0.93, R * 1.0],
    name: "skull",
  });
  const skin = b.surface(skull);

  // Crown cap (darker dome on top, between gill roots)
  b.part(sph(12, 8), P.skinShade, {
    bone: head,
    at: [0, 0.16 + R * 0.93 - 0.012, 0.15 - 0.005],
    scale: [0.05, 0.016, 0.05],
    name: "crown",
  });

  // Neck stub back to neckBase
  b.capsule([0, 0.145, 0.1], [M.neckBase[0], M.neckBase[1], M.neckBase[2] - 0.005], 0.06, P.skinShade, {
    bone: neck,
    name: "neckStub",
  });

  // Muzzle bump
  b.part(sph(12, 9), P.belly, {
    bone: head,
    at: [0, 0.115, 0.238],
    scale: [0.055, 0.035, 0.04],
    name: "muzzle",
  });
  // Chin pad
  b.part(sph(10, 8), P.belly, {
    bone: jaw,
    at: [0, 0.088, 0.215],
    scale: [0.04, 0.018, 0.03],
    name: "chin",
  });
  // Throat crease-ish under chin
  b.part(sph(8, 6), P.skinShade, {
    bone: head,
    at: [0, 0.07, 0.15],
    scale: [0.05, 0.012, 0.04],
    name: "throatShade",
  });

  // Muzzle seam line (ink arc)
  b.sweep(
    [
      [-0.05, 0.135, 0.225],
      [-0.025, 0.14, 0.248],
      [0, 0.141, 0.252],
      [0.025, 0.14, 0.248],
      [0.05, 0.135, 0.225],
    ],
    0.0022,
    { color: P.ink, bone: head, caps: "round", name: "seam" },
  );

  // Mouth: smile curve
  const mouthPts: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = (t - 0.5) * 0.12;
    const y = 0.098 + 0.014 * Math.pow((t - 0.5) * 2, 2);
    const z = 0.236 - 0.032 * Math.pow((t - 0.5) * 2, 2) + 0.004;
    mouthPts.push([x, y, z]);
  }
  b.sweep(mouthPts, 0.0028, { color: P.mouth, bone: head, caps: "round", name: "mouth" });
  for (const s of [1, -1]) {
    const e = mouthPts[s > 0 ? 8 : 0];
    b.part(sph(6, 5), P.ink, {
      bone: head,
      at: [e[0] + s * 0.003, e[1] + 0.006, e[2] - 0.002],
      scale: [0.004, 0.0045, 0.004],
      name: "mouthCorner",
    });
  }

  // Nostrils
  for (const s of [1, -1]) {
    b.part(sph(6, 4), P.freckle, {
      bone: head,
      at: [s * 0.018, 0.133, 0.262],
      scale: [0.0065, 0.005, 0.004],
      name: "nostril",
    });
  }

  // Eyes, blush
  for (const s of [1, -1]) {
    const dir = new THREE.Vector3(s * 0.62, 0.12, 0.78).normalize();
    const hit = skin.ray([s * 0.0, 0.16 + 0.005, 0.15], dir.toArray() as [number, number, number]);
    const base = hit ? hit.at.clone() : new THREE.Vector3(s * 0.07, 0.17, 0.215);
    const n = hit ? hit.n.clone() : dir.clone();

    // sclera rim (slightly larger, offset down)
    const sc = base.clone().addScaledVector(n, 0.001).add(new THREE.Vector3(0, -0.004, 0));
    b.part(new THREE.CylinderGeometry(0.0305, 0.0305, 0.006, 16), P.eyeWhite, {
      bone: head,
      at: sc,
      dir: n.toArray() as [number, number, number],
      name: "sclera",
    });
    // ink disc
    const ic = base.clone().addScaledVector(n, 0.0035);
    b.part(new THREE.CylinderGeometry(0.0275, 0.0275, 0.006, 16), P.ink, {
      bone: head,
      at: ic,
      dir: n.toArray() as [number, number, number],
      name: "eye",
    });
    // shines
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(up, n).normalize();
    const up2 = new THREE.Vector3().crossVectors(n, side).normalize();
    const big = base.clone().addScaledVector(n, 0.0075).addScaledVector(side, -s * 0.0 + 0.009 * -1).addScaledVector(up2, 0.009);
    b.part(sph(8, 6), P.eyeWhite, {
      bone: head,
      at: big,
      scale: [0.0085, 0.0085, 0.004],
      dir: n.toArray() as [number, number, number],
      axis: "z",
      name: "shineBig",
    });
    const small = base.clone().addScaledVector(n, 0.0075).addScaledVector(side, 0.01).addScaledVector(up2, -0.011);
    b.part(sph(6, 5), P.eyeShine, {
      bone: head,
      at: small,
      scale: [0.0042, 0.0042, 0.003],
      dir: n.toArray() as [number, number, number],
      axis: "z",
      name: "shineSmall",
    });

    // blush cheek: below and behind eye
    const bd = new THREE.Vector3(s * 0.85, -0.3, 0.4).normalize();
    const bh = skin.ray([0, 0.16, 0.15], bd.toArray() as [number, number, number]);
    if (bh) {
      b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 14), P.blush, bh, { embed: 0.5, name: "blush" });
    }
  }
}
    return buildHead;
  })(),
  // gills
  (() => {
function buildGills({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const sides = [
    { n: "Top", s: 1, out: [0.8, 0.85, -0.5] },
    { n: "Mid", s: 1, out: [1, 0.45, -0.55] },
    { n: "Low", s: 1, out: [0.85, -0.15, -0.55] },
  ];
  const lens = { Top: 0.105, Mid: 0.12, Low: 0.1 } as Record<string, number>;
  for (const sd of [1, -1]) {
    for (const g of sides) {
      const name = "gill" + g.n + (sd > 0 ? "L" : "R");
      const j = J[name];
      const len = lens[g.n];
      const dir = new THREE.Vector3(sd * g.out[0], g.out[1], g.out[2]).normalize();
      const root = new THREE.Vector3(...(j.at as any)).addScaledVector(dir, -0.01);
      // curve: lifts up slightly and sweeps back
      const mid = root.clone().addScaledVector(dir, len * 0.55).add(new THREE.Vector3(0, 0.012, 0));
      const tip = root.clone().addScaledVector(dir, len).add(new THREE.Vector3(0, 0.025, -0.012));
      const path = bezier(root, mid, tip);
      b.sweep(path, [0.016, 0.004], {
        bone: j,
        color: P.gill,
        caps: { start: "flat", end: "round" },
        sides: 6,
      });
      // root cuff
      b.sphereLike
        ? null
        : b.part(new THREE.CylinderGeometry(0.019, 0.017, 0.012, 8), P.gillRoot, {
            bone: j,
            at: path.at(0.1),
            dir: path.tangentAt(0.1),
          });
      // tip nub
      b.part(new THREE.SphereGeometry(0.006, 6, 4), P.gillTip, { bone: j, at: path.at(1) });
      // frill blades
      const count = 4 + (g.n === "Mid" ? 2 : 1);
      for (let i = 0; i < count; i++) {
        const t = 0.18 + (0.8 * i) / (count - 1 || 1);
        const p = path.at(Math.min(t, 0.97));
        const tan = path.tangentAt(Math.min(t, 0.97));
        const last = i === count - 1;
        const L = (last ? 0.05 : i % 2 ? 0.032 : 0.04) * (1 - t * 0.3) + 0.012;
        const W = L * 0.42;
        const outline: [number, number, "sharp"?][] = [
          [0, -W * 0.5],
          [L * 0.55, -W * 0.8],
          [L, 0, "sharp"],
          [L * 0.55, W * 0.8],
          [0, W * 0.5],
        ] as any;
        // blade plane: contains stalk side; thickness across sideways direction
        const side = new THREE.Vector3(0, 1, 0).cross(tan).normalize();
        const up = new THREE.Vector3().crossVectors(tan, side).normalize();
        for (const k of [1, -1]) {
          const x = side.clone().multiplyScalar(k).add(up.clone().multiplyScalar(0.15)).normalize();
          b.extrude(outline as any, {
            at: p,
            x: [x.x, x.y, x.z],
            y: [tan.x, tan.y, tan.z],
            thickness: 0.003,
            smoothing: 1,
            bone: j,
            color: i % 2 ? P.gill : t > 0.6 ? P.gillTip : P.gill,
          });
          // pale edge tip
          const e = p.clone().addScaledVector(x, L * 0.95);
          b.part(new THREE.SphereGeometry(0.0045, 5, 4), P.gillTip, { bone: j, at: e });
        }
      }
    }
  }
}
    return buildGills;
  })(),
  // body
  (() => {
function buildBody({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const zF = M.neckBase[2]; // 0.06
  const zR = M.rump[2]; // -0.18
  const cy = 0.115; // axis height

  // Main torso: smooth tube, widest at the chest
  const path = [
    [0, cy, zR - 0.01],
    [0, cy, -0.1],
    [0, cy, -0.02],
    [0, cy + 0.005, zF - 0.01],
  ];
  const radii = (t: number): [number, number] => {
    const w = 0.07 + 0.03 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.5);
    return [w, w * 0.88];
  };
  const torso = b.sweep(path, radii, {
    bone: J.body,
    color: P.skin,
    sectors: [[125, 235, P.belly]],
    caps: "round",
    sides: 14,
  });

  // Rump cap closing the rear
  b.part(new THREE.SphereGeometry(0.066, 12, 8), P.skin, {
    bone: J.body,
    at: [0, cy, zR + 0.005],
    scale: [1, 0.88, 1],
  });
  // Cream rump underside
  b.part(new THREE.SphereGeometry(0.05, 10, 6), P.belly, {
    bone: J.body,
    at: [0, cy - 0.032, zR + 0.015],
    scale: [0.9, 0.7, 1],
  });

  // Seam lines each side between skin and belly
  for (const s of [1, -1]) {
    const pts = [-0.15, -0.09, -0.03, 0.02, 0.05].map((z) => {
      const t = (z - (zR - 0.01)) / (zF - 0.01 - (zR - 0.01));
      const w = 0.07 + 0.03 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.5);
      const a = (125 * Math.PI) / 180;
      return [s * w * Math.sin(a) * 1.0, cy - w * 0.88 * Math.cos(a) * -1 * 0 - w * 0.88 * 0.57 * 1.0, z] as number[];
    });
    const seamPts = pts.map((p) => [p[0] * 1.01, p[1], p[2]]);
    b.sweep(seamPts, 0.0035, { bone: J.body, color: P.skinShade, caps: "round", sides: 5 });
  }

  // Freckle spots along spine
  const hit = b.surface(torso);
  for (let i = 0; i < 5; i++) {
    const z = 0.04 - i * 0.047;
    const off = (r() - 0.5) * 0.012;
    const h = hit.ray([off, 0.3, z], [0, -1, 0]);
    if (h) {
      b.stick(new THREE.CylinderGeometry(0.0075 + r() * 0.003, 0.0075, 0.004, 7), P.freckle, h, { embed: 0.4 });
    }
  }
  // Tiny extra freckles flanking
  for (const s of [1, -1])
    for (let i = 0; i < 2; i++) {
      const h = hit.ray([s * 0.05, 0.3, -0.01 - i * 0.08], [0, -1, 0]);
      if (h) b.stick(new THREE.CylinderGeometry(0.005, 0.005, 0.003, 6), P.freckle, h, { embed: 0.4 });
    }

  // Shoulder bulges (chubby chest)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), P.skin, {
      bone: J.body,
      at: [s * 0.075, cy - 0.01, 0.02],
      scale: [0.8, 0.9, 1.1],
    });
  }

  // Throat crease where head meets chest (neck joint)
  const crease = [
    [-0.045, 0.085, 0.085],
    [0, 0.077, 0.095],
    [0.045, 0.085, 0.085],
  ];
  b.sweep(crease, 0.004, { bone: J.neck, color: P.skinShade, caps: "round", sides: 5 });
  // Belly chest cream bib at throat
  b.part(new THREE.SphereGeometry(0.05, 10, 6), P.belly, {
    bone: J.neck,
    at: [0, 0.095, 0.055],
    scale: [0.95, 0.5, 0.8],
  });
}
    return buildBody;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: any) {
  const legs: [string, number, number][] = [
    ["legFL", 1, 0],
    ["legFR", -1, 0],
    ["legHL", 1, 1],
    ["legHR", -1, 1],
  ];
  const FR = 0.028;
  for (const [name, s, hind] of legs) {
    const hipJ = J[name];
    const hx = s * (hind ? 0.08 : 0.075);
    const hz = hind ? -0.12 : 0.02;
    const hy = 0.06;
    const hip: [number, number, number] = [hx, hy, hz];
    const fx = hx + s * 0.035;
    const fz = hz + (hind ? -0.012 : 0.014);
    const foot: [number, number, number] = [fx, FR, fz];
    const pts = limb(hip, foot, [0.04, 0.03], [[s * 0.4, 0, hind ? -1 : 1]]);
    const knee = pts[1];
    const ankle = pts[2];
    b.capsule(hip, knee, 0.032, P.skin, { bone: hipJ });
    b.capsule(knee, ankle, [0.026, 0.024], P.skinShade, { bone: hipJ });
    // knee bead
    b.part(new THREE.SphereGeometry(0.03, 8, 6), P.skin, { bone: hipJ, at: knee });
    // foot: squashed sphere resting on floor
    const fc: [number, number, number] = [fx, FR * 0.9, fz];
    b.part(new THREE.SphereGeometry(FR, 10, 8), P.skin, {
      bone: hipJ,
      at: [fc[0], 0.0252, fc[2]],
      scale: [1.15, 0.9, 1.25],
    });
    // toe pad beneath
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 8), P.freckle, {
      bone: hipJ,
      at: [fx, 0.002, fz + 0.004],
    });
    // three toes
    for (let i = -1; i <= 1; i++) {
      const tx = fx + s * i * 0.017 * -1 + 0;
      const ty = 0.0085;
      const tz0 = fz + 0.018;
      const tz1 = fz + 0.046 - Math.abs(i) * 0.005;
      b.capsule([tx, ty, tz0], [tx, ty, tz1], 0.0085, P.skin, { bone: hipJ });
      b.part(new THREE.SphereGeometry(0.0062, 6, 5), P.gillTip, {
        bone: hipJ,
        at: [tx, ty, tz1 + 0.006],
      });
    }
  }
}
    return buildLegs;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P }: any) {
  const spine = catmull([
    [0, 0.1, -0.15],
    [0, 0.075, -0.2],
    [0, 0.045, -0.255],
    [0, 0.05, -0.3],
    [0, 0.075, -0.322],
  ]);
  const chain = b.chain("tailSeg", spine, {
    parent: J.tail1,
    names: ["tailSeg1", "tailSeg2", "tailSeg3"],
    role: "tail",
  });
  const tube = b.sweep(chain, [0.055, 0.045, 0.03, 0.016, 0.007], {
    color: P.skin,
    sectors: [[125, 235, P.belly, 0, 0.7]],
  });
  const last = chain.joints[chain.joints.length - 1];

  // tip nub
  b.part(new THREE.SphereGeometry(0.01, 8, 6), P.gillTip, { at: tube.at(1).at, bone: last });

  const up = (t: number, h: number, ang = 0, sign = 1): number[] => {
    const p = tube.at(t, ang).at;
    return [p.x, p.y + sign * h, p.z];
  };
  const surf = (t: number, ang = 0): number[] => {
    const p = tube.at(t, ang).at;
    return [p.x, p.y, p.z];
  };

  // dorsal fin
  const N = 14;
  const hTop = (t: number) => 0.105 * Math.pow(1 - t, 1.2) + 0.004;
  const lowA: number[][] = [];
  const topB: number[][] = [];
  for (let i = 0; i <= N; i++) {
    const t = 0.02 + (0.96 * i) / N;
    const s = tube.at(t, 0).at;
    lowA.push([s.x, s.y - 0.004, s.z]);
    topB.push(up(t, hTop(t)));
  }
  b.membrane(lowA, topB, { color: P.fin, thickness: 0.004, rows: 3, bone: chain });
  b.sweep(polyline(topB), 0.003, { color: P.finEdge, bone: chain, caps: "round" });

  // fin rays
  const rays = [0.1, 0.22, 0.34, 0.48];
  rays.forEach((t, i) => {
    const t0 = Math.min(t + 0.07, 0.95);
    const a = surf(t0);
    const top = up(t, hTop(t) * 0.82);
    a[1] += 0.002;
    b.rod(a, top, 0.0022, P.finEdge, { bone: chain, name: `tailRay${i}` });
  });

  // ventral fin
  const M = 8;
  const hv = (t: number) => 0.03 * Math.max(0, 1 - t / 0.55) + 0.002;
  const vA: number[][] = [];
  const vB: number[][] = [];
  for (let i = 0; i <= M; i++) {
    const t = 0.05 + (0.5 * i) / M;
    const s = tube.at(t, 180).at;
    vA.push([s.x, s.y + 0.004, s.z]);
    vB.push(up(t, hv(t), 180, -1));
  }
  b.membrane(vA, vB, { color: P.fin, thickness: 0.004, rows: 2, bone: chain });
  b.sweep(polyline(vB), 0.002, { color: P.finEdge, bone: chain, caps: "round" });
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "axolotlChibi" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.1,-0.02], dir: [0,0,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["body"], at: [0,0.12,0.06], dir: [0,0.15,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.16,0.15], dir: [0,0.25,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.1,0.22], dir: [0,-0.5,1], role: "jaw" });
  J["gillTopL"] = b.joint("gillTopL", { parent: J["head"], at: [0.075,0.235,0.11], dir: [0.8,0.85,-0.5], role: "tentacle" });
  J["gillTopR"] = b.joint("gillTopR", { parent: J["head"], at: [-0.075,0.235,0.11], dir: [-0.8,0.85,-0.5], role: "tentacle" });
  J["gillMidL"] = b.joint("gillMidL", { parent: J["head"], at: [0.095,0.175,0.1], dir: [1,0.45,-0.55], role: "tentacle" });
  J["gillMidR"] = b.joint("gillMidR", { parent: J["head"], at: [-0.095,0.175,0.1], dir: [-1,0.45,-0.55], role: "tentacle" });
  J["gillLowL"] = b.joint("gillLowL", { parent: J["head"], at: [0.085,0.115,0.11], dir: [0.85,-0.15,-0.55], role: "tentacle" });
  J["gillLowR"] = b.joint("gillLowR", { parent: J["head"], at: [-0.085,0.115,0.11], dir: [-0.85,-0.15,-0.55], role: "tentacle" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,0.1,-0.16], dir: [0,0,-1], role: "tail" });
  J["legFL"] = b.joint("legFL", { parent: J["body"], at: [0.075,0.06,0.02], dir: [0,-1,0], role: "leg" });
  J["legFR"] = b.joint("legFR", { parent: J["body"], at: [-0.075,0.06,0.02], dir: [0,-1,0], role: "leg" });
  J["legHL"] = b.joint("legHL", { parent: J["body"], at: [0.08,0.06,-0.12], dir: [0,-1,0], role: "leg" });
  J["legHR"] = b.joint("legHR", { parent: J["body"], at: [-0.08,0.06,-0.12], dir: [0,-1,0], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
