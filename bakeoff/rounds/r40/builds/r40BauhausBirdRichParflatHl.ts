import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Bauhaus Songbird on a Branch",
  "description": "A life-size songbird perched on a gently curved branch, built from Bauhaus primary-colour geometry: a red sphere body, a yellow sphere head, blue half-disc wings, a black blade tail and a branch ringed in red, yellow and cream, with squares, circles and triangles for leaves."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  red: "#d7261e",
  redDeep: "#9f1a14",
  blue: "#1b4f9c",
  blueDeep: "#12356f",
  yellow: "#f4c20d",
  yellowDeep: "#d29a00",
  black: "#14141a",
  charcoal: "#2d2d36",
  cream: "#f2ead7",
  grey: "#8f949c",
};
const M = {
  perchTop: [0, 0.04, 0] as [number, number, number],
  branchAxisCenter: [0, 0.02, 0] as [number, number, number],
  footL: [0.026, 0.04, 0] as [number, number, number],
  footR: [-0.026, 0.04, 0] as [number, number, number],
  hipL: [0.026, 0.085, 0.005] as [number, number, number],
  hipR: [-0.026, 0.085, 0.005] as [number, number, number],
  bodyCenter: [0, 0.115, 0.005] as [number, number, number],
  neckBase: [0, 0.13, 0.045] as [number, number, number],
  headCenter: [0, 0.165, 0.062] as [number, number, number],
  beakRoot: [0, 0.155, 0.093] as [number, number, number],
  crownTop: [0, 0.198, 0.05] as [number, number, number],
  wingRootL: [0.05, 0.13, 0.015] as [number, number, number],
  wingRootR: [-0.05, 0.13, 0.015] as [number, number, number],
  tailRoot: [0, 0.105, -0.06] as [number, number, number],
  twigUpBase: [-0.15, 0.04, 0] as [number, number, number],
  twigForwardBase: [0.14, 0.04, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: any) {
  const body = J.body, chest = J.chest, neck = J.neck;
  const C = M.bodyCenter as number[];

  // Body ellipsoid (faceted)
  b.part(new THREE.SphereGeometry(1, 12, 9), P.red, {
    bone: body, at: C, scale: [0.055, 0.05, 0.075], flat: true,
  });

  // Cream belly oval on underside/chest
  b.part(new THREE.SphereGeometry(1, 12, 8), P.cream, {
    bone: body, at: [0, C[1] - 0.026, C[2] + 0.014], scale: [0.04, 0.032, 0.06], flat: true,
  });

  // Black dot at centre of belly oval (facing outward-down-forward)
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 10), P.black, {
    bone: body, at: [0, 0.0805, 0.02], dir: [0, -0.8, 0.45],
  });

  // Yellow triangle emblem on breast
  const tri = new THREE.Shape();
  tri.moveTo(-0.014, -0.012); tri.lineTo(0.014, -0.012); tri.lineTo(0, 0.016); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.004, bevelEnabled: false });
  b.part(triGeo, P.yellow, {
    bone: chest, at: [0, 0.121, 0.0775], dir: [0, 0.25, 1], axis: "z",
  });

  // Blue half-disc rump patch above tail root
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 12, 1, false, 0, Math.PI), P.blue, {
    bone: body, at: [0, 0.128, -0.066], dir: [0, 0.75, -0.65], rotation: undefined,
  });

  // Black collar ring at neck base
  b.part(new THREE.TorusGeometry(0.03, 0.0035, 5, 12), P.black, {
    bone: neck, at: M.neckBase, dir: [0, 0.6, 1], axis: "z",
  });

  // Short yellow neck cylinder
  b.part(new THREE.CylinderGeometry(0.027, 0.03, 0.04, 10), P.yellow, {
    bone: neck, at: [0, 0.147, 0.053], dir: [0, 0.6, 1],
  });

  // Flank trim: three cream squares per side under wing root
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = 0.03 - i * 0.026;
      const y = 0.104 - i * 0.002;
      // ellipsoid surface x at this height/z
      const nz = (z - C[2]) / 0.075, ny = (y - C[1]) / 0.05;
      const x = 0.055 * Math.sqrt(Math.max(0.05, 1 - nz * nz - ny * ny));
      b.part(new THREE.BoxGeometry(0.003, 0.012, 0.012), P.cream, {
        bone: body, at: [s * (x + 0.0004), y, z], dir: [s, 0, 0], axis: "x",
      });
    }
  }
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const hc = M.headCenter;
  const R = 0.036;
  const head = J.head, jaw = J.jaw, crest = J.crest;

  // skull
  b.part(new THREE.IcosahedronGeometry(R, 1), P.yellow, { bone: head, at: hc, flat: true });
  // yellow-deep neck ruff ring under head
  b.part(new THREE.CylinderGeometry(0.03, 0.026, 0.008, 10), P.yellowDeep, { bone: head, at: [0, 0.135, 0.058] });

  // disc helper: faces direction d, axis z
  const disc = (r: number, color: string, at: number[], d: number[], bone: any, seg = 12, t = 0.0015) =>
    b.part(new THREE.CylinderGeometry(r, r, t, seg), color, { bone, at, dir: d, axis: "y" });

  for (const s of [1, -1]) {
    const n = [s * 0.85, 0.15, 0.5];
    const ep = (k: number) => [s * (0.0265 + n[0] * k * 0.0), 0.172, 0.0795].map((v, i) => v + n[i] * k * 0.0) as number[];
    const base = [s * 0.0285, 0.172, 0.0775];
    const off = (k: number) => [base[0] + s * k * 0.85, base[1] + k * 0.15, base[2] + k * 0.5];
    void ep;
    disc(0.0125, P.black, off(0.0), n, head);
    disc(0.0095, P.cream, off(0.0012), n, head);
    disc(0.0058, P.black, off(0.0024), n, head, 10);
    disc(0.0022, P.yellow, off(0.0036), n, head, 8);
    // brow half ring
    b.part(new THREE.TorusGeometry(0.011, 0.0016, 4, 8, Math.PI), P.black, {
      bone: head, at: [s * 0.0285, 0.1855, 0.0775], dir: n, axis: "z",
    });
    // cheek disc
    disc(0.0085, P.red, [s * 0.0335, 0.1555, 0.0685], [s * 0.9, -0.1, 0.35], head, 10, 0.002);
  }

  // forehead dot
  disc(0.005, P.black, [0, 0.1935, 0.0735], [0, 0.55, 0.85], head, 10, 0.0015);

  // beak upper
  b.part(new THREE.ConeGeometry(0.0125, 0.027, 5), P.red, {
    bone: head, at: [0, 0.1585, 0.1045], dir: [0, 0, 1], flat: true,
  });
  // base ring
  b.part(new THREE.CylinderGeometry(0.0138, 0.0145, 0.004, 8), P.yellowDeep, {
    bone: head, at: [0, 0.155, 0.0925], dir: [0, 0, 1],
  });
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0017, 5, 4), P.black, { bone: head, at: [s * 0.0045, 0.1635, 0.101] });

  // lower beak on jaw
  b.part(new THREE.ConeGeometry(0.0095, 0.022, 5), P.redDeep, {
    bone: jaw, at: [0, 0.1495, 0.0975], dir: [0, 0, 1], flat: true,
  });
  // dividing line
  b.part(new THREE.BoxGeometry(0.019, 0.0013, 0.02), P.black, { bone: jaw, at: [0, 0.1527, 0.1], flat: true });

  // crest triangles, extruded in y-z profile, leaning back
  const cols = [P.red, P.blue, P.black];
  const hs = [0.03, 0.025, 0.02];
  cols.forEach((c, i) => {
    const h = hs[i];
    const tri: [number, number][] = [[0, 0], [0.022, 0], [-0.004 - i * 0.003, h]];
    b.extrude(tri, {
      at: [0.0 + (i - 1) * 0.0045, 0.194, 0.04 + i * 0.003],
      x: [0, 0, -1], y: [0, 1, 0],
      thickness: 0.0035, color: c, bone: crest,
    });
  });
  void frame; void rng;
}
    return buildHead;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const r = rng(5);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = M[s > 0 ? "wingRootL" : "wingRootR"];
    const wing = J["wing" + side];
    const mid = J["wingMid" + side];
    const tip = J["wingTip" + side];
    // local wing frame: origin at root, u runs back (-z) and outward, v up, thickness along x
    const base = new THREE.Vector3(root[0] + s * 0.004, root[1], root[2]);
    const back = new THREE.Vector3(s * 0.26, -0.05, -1).normalize();
    const upv = new THREE.Vector3(-s * 0.05, 1, 0).normalize();
    const thick = new THREE.Vector3().crossVectors(back, upv).normalize();
    const out = thick.dot(new THREE.Vector3(s, 0, 0)) > 0 ? 1 : -1;
    const at = (u: number, v: number, o: number) =>
      base.clone().addScaledVector(back, u).addScaledVector(upv, v).addScaledVector(thick, o * out);
    const plate = (pts: any[], color: string, o: number, th: number, bone: any, smoothing = 0) =>
      b.extrude(pts, {
        at: at(0, 0, o),
        x: back.toArray() as any,
        y: upv.toArray() as any,
        thickness: th,
        color,
        bone,
        smoothing,
      });
    // shoulder half-disc (flat edge along bottom... rounded on top)
    const half: any[] = [];
    for (let i = 0; i <= 6; i++) {
      const a = (Math.PI * i) / 6;
      half.push([0.035 - Math.cos(a) * 0.035, Math.sin(a) * 0.04 - 0.012]);
    }
    plate(half, P.blue, 0.0, 0.008, wing);
    // flight blade rounded rectangle
    plate(
      [
        [0.03, -0.028],
        [0.115, -0.022],
        [0.125, -0.008],
        [0.115, 0.012],
        [0.03, 0.02],
      ],
      P.blueDeep,
      0.006,
      0.006,
      mid,
      1,
    );
    // black bar
    plate(
      [
        [0.05, -0.03],
        [0.062, -0.03],
        [0.062, 0.022],
        [0.05, 0.022],
      ],
      P.black,
      0.011,
      0.004,
      mid,
    );
    // cream stripe
    plate(
      [
        [0.07, -0.03],
        [0.076, -0.03],
        [0.076, 0.02],
        [0.07, 0.02],
      ],
      P.cream,
      0.011,
      0.004,
      mid,
    );
    // red triangle tip
    plate(
      [
        [0.1, -0.026, "sharp"],
        [0.14, -0.012, "sharp"],
        [0.1, 0.012, "sharp"],
      ],
      P.red,
      0.011,
      0.004,
      tip,
    );
    // fanned feather blades at the tip
    const cols = [P.blue, P.blueDeep, P.black];
    cols.forEach((c, i) => {
      const a = (i - 1) * 0.18;
      const ca = Math.cos(a), sa = Math.sin(a);
      const o: [number, number][] = [
        [0, -0.008],
        [0.04, -0.008],
        [0.045, 0],
        [0.04, 0.008],
        [0, 0.008],
      ];
      const pts: any[] = o.map(([x, y]) => [x * ca - y * sa + 0.1, x * sa + y * ca - 0.012 - i * 0.003]);
      plate(pts, c, 0.002 - i * 0.0015, 0.004, tip);
    });
    // shoulder emblem dot
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 10), P.yellow, {
      bone: wing,
      at: at(0.035, 0.012, 0.0085),
      dir: thick.clone().multiplyScalar(out).toArray() as any,
    });
  }
}
    return buildWings;
  })(),
  // tailLegs
  (() => {
function buildTailLegs({ b, J, P, M }: any) {
  const BLACK = P.black, RED = P.red, YEL = P.yellow, CREAM = P.cream, RD = P.redDeep;

  // ---- Tail: three overlapping flat blades, fanned slightly
  const tailJ = [J.tail1, J.tail2, J.tail3];
  const slope = -0.15;
  const blade = (yaw: number, len: number, w: number, color: string, lift: number, bone: any) => {
    const cz = -0.06 - len / 2;
    const x = Math.sin(yaw) * len * 0.5;
    const z = -0.06 - Math.cos(yaw) * len * 0.5;
    const y = 0.105 + slope * (0.06 + Math.abs(z + 0.06)) * 0.5 + lift;
    return b.part(new THREE.BoxGeometry(w, 0.004, len), color, {
      bone,
      at: [x, y, z],
      rotation: [(-slope * 180) / Math.PI * 0.6, (yaw * 180) / Math.PI, 0],
    });
  };
  blade(0.22, 0.07, 0.026, BLACK, -0.002, J.tail1);
  blade(-0.22, 0.07, 0.026, BLACK, -0.002, J.tail1);
  blade(0, 0.07, 0.03, BLACK, 0.001, J.tail2);
  // red centre stripe
  b.part(new THREE.BoxGeometry(0.008, 0.0016, 0.062), RED, { bone: J.tail2, at: [0, 0.1055 - 0.012 + 0.0095, -0.094] });
  // yellow tip square
  b.part(new THREE.BoxGeometry(0.014, 0.0022, 0.012), YEL, { bone: J.tail3, at: [0, 0.0915, -0.124] });
  // cream squares at outer blade corners
  for (const s of [1, -1]) {
    const yaw = 0.22 * s;
    const x = Math.sin(yaw) * 0.065;
    const z = -0.06 - Math.cos(yaw) * 0.065;
    b.part(new THREE.BoxGeometry(0.008, 0.0022, 0.008), CREAM, { bone: J.tail3, at: [x, 0.0975 - 0.009, z] });
  }
  // tail base cap sphere
  b.part(new THREE.SphereGeometry(0.01, 8, 6), BLACK, { bone: J.tail1, at: [0, 0.105, -0.06] });

  // ---- Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = J["hip" + side], ankle = J["ankle" + side];
    const x = 0.026 * s;
    // thigh feather sphere
    b.part(new THREE.SphereGeometry(0.011, 8, 6), RD, { bone: hip, at: [x, 0.085, 0.005] });
    // tarsus
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.043, 7), BLACK, { bone: hip, at: [x, 0.0635, 0.003] });
    // ankle joint
    b.part(new THREE.SphereGeometry(0.0055, 7, 5), YEL, { bone: ankle, at: [x, 0.045, 0.004] });
    // toes
    const toes: [string, number, number][] = [
      ["toeInner" + side, -0.2 * s, 1],
      ["toeOuter" + side, 0.25 * s, 1],
      ["toeBack" + side, 0, -1],
    ];
    for (const [name, dx, dz] of toes) {
      const len = dz > 0 ? 0.03 : 0.02;
      const dir = new THREE.Vector3(dx * 0.4, 0, dz).normalize();
      const start = new THREE.Vector3(x, 0.044, 0.004);
      const end = start.clone().addScaledVector(dir, len);
      b.capsule(start.toArray(), end.toArray(), 0.0035, BLACK, { bone: J[name] });
      const tip = end.clone().addScaledVector(dir, 0.004);
      b.spike(end.toArray(), dir.toArray(), 0.01, 0.0032, { color: CREAM, bone: J[name] });
      void tip;
    }
  }
}
    return buildTailLegs;
  })(),
  // branch
  (() => {
function buildBranch({ b, J, P, M }: Ctx) {
  const root = J.root;
  const R = rng(5);
  const CH = P.charcoal;

  // axis height and radius along x
  const ay = (x: number) => 0.02 + 0.025 * Math.pow(Math.abs(x) / 0.25, 2);
  const rad = (x: number) => 0.02 - 0.007 * Math.pow(Math.abs(x) / 0.25, 1.5);

  const pts: number[][] = [];
  for (let i = 0; i <= 10; i++) {
    const x = -0.25 + 0.05 * i;
    pts.push([x, ay(x), 0]);
  }
  b.sweep(pts, (t: number) => rad(-0.25 + 0.5 * t), {
    color: CH,
    sides: 8,
    bone: root,
    caps: "flat",
    skin: "rigid",
  });

  const cyl = (r: number, h: number, seg: number) => new THREE.CylinderGeometry(r, r, h, seg);
  const side = [0, 0, 1]; // not used for orientation of tube-aligned discs
  void side;

  // end discs, cream
  for (const s of [1, -1]) {
    const x = s * 0.2505;
    b.part(cyl(rad(x) * 1.02, 0.004, 8), P.cream, { bone: root, at: [x, ay(x), 0], dir: [1, 0, 0] });
  }

  // ring bands
  const cols = [P.red, P.yellow, P.cream];
  let k = 0;
  for (let x = -0.225; x <= 0.226; x += 0.05) {
    if (Math.abs(x) < 0.05) continue;
    const xx = Math.round(x * 1000) / 1000;
    const slope = (ay(xx + 0.01) - ay(xx - 0.01)) / 0.02;
    b.part(cyl(rad(xx) * 1.14, 0.009, 8), cols[k++ % 3], {
      bone: root,
      at: [xx, ay(xx), 0],
      dir: [1, slope, 0],
    });
  }

  // generic twig with band and bud
  const twig = (base: number[], tip: number[], r: number, band: string) => {
    b.rod(base, tip, [r, r * 0.6], CH, { bone: root, sides: 6 } as any);
    const m = [0, 1, 2].map((i) => base[i] + (tip[i] - base[i]) * 0.35);
    const d = tip.map((v, i) => v - base[i]);
    b.part(cyl(r * 1.5, 0.007, 6), band, { bone: root, at: m, dir: d });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), P.red, { bone: root, at: tip });
  };

  // leaf helpers (flat shapes facing +Z)
  const leafShape = (outline: [number, number][], color: string, at: number[], rot = 0) => {
    b.extrude(outline, {
      at,
      x: [Math.cos(rot), Math.sin(rot), 0],
      y: [-Math.sin(rot), Math.cos(rot), 0],
      thickness: 0.004,
      color,
      bone: root,
    });
  };
  const sq = (s: number): [number, number][] => [[-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2]];
  const tri = (s: number): [number, number][] => [[-s / 2, -s / 2], [s / 2, -s / 2], [0, s / 2]];
  const disc = (r: number): [number, number][] =>
    Array.from({ length: 10 }, (_, i) => [r * Math.cos((i / 10) * Math.PI * 2), r * Math.sin((i / 10) * Math.PI * 2)]);

  // rising twig at x=-0.15
  const up0 = [-0.15, 0.04, 0];
  const up1 = [-0.16, 0.17, -0.02];
  twig([-0.15, 0.03, 0], up1, 0.006, P.yellow);
  // side stub twigs carrying leaves
  b.rod([-0.153, 0.1, -0.008], [-0.19, 0.13, -0.008], [0.004, 0.003], CH, { bone: root, sides: 6 } as any);
  b.rod([-0.157, 0.13, -0.014], [-0.125, 0.155, -0.014], [0.004, 0.003], CH, { bone: root, sides: 6 } as any);
  leafShape(sq(0.036), P.blue, [-0.2, 0.14, -0.008], 0.3);
  leafShape(disc(0.019), P.yellow, [-0.112, 0.162, -0.014]);
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.002, 8), P.black, {
    bone: root,
    at: [-0.112, 0.162, -0.0115],
    dir: [0, 0, 1],
  });
  leafShape(tri(0.036), P.red, [-0.165, 0.185, -0.025], -0.2);
  void up0;

  // forward twig at x=0.14
  const f1 = [0.14, 0.06, 0.1];
  twig([0.14, 0.035, 0.005], f1, 0.006, P.cream);
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.004, 10), P.red, { bone: root, at: [0.14, 0.075, 0.108], dir: [0, 0, 1] });
  leafShape(tri(0.034), P.blue, [0.165, 0.075, 0.098], 0.2);

  // back stub at x=0.2
  b.rod([0.2, 0.05, -0.005], [0.2, 0.075, -0.04], [0.005, 0.003], CH, { bone: root, sides: 6 } as any);
  b.part(new THREE.SphereGeometry(0.006, 6, 4), P.red, { bone: root, at: [0.2, 0.076, -0.042] });
  void R;
  void frame;
}
    return buildBranch;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bauhausSongbird" });
  const J: Record<string, Joint> = {};
  J["root"] = b.joint("root", { at: [0,0.04,0], dir: [0,0,1], role: "spine" });
  J["body"] = b.joint("body", { parent: J["root"], at: [0,0.105,-0.02], dir: [0,0.1,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["body"], at: [0,0.115,0.03], dir: [0,0.3,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,0.13,0.045], dir: [0,0.6,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.158,0.062], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.152,0.085], dir: [0,0,1], role: "jaw" });
  J["crest"] = b.joint("crest", { parent: J["head"], at: [0,0.196,0.05], dir: [0,0.5,-1], role: "hinge" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,0.105,-0.06], dir: [0,-0.15,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.097,-0.09], dir: [0,-0.15,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.088,-0.115], dir: [0,-0.15,-1], role: "tail" });
  J["wingL"] = b.joint("wingL", { parent: J["chest"], at: [0.05,0.13,0.015], dir: [0.3,-0.1,-1], role: "wing" });
  J["wingMidL"] = b.joint("wingMidL", { parent: J["wingL"], at: [0.065,0.122,-0.03], dir: [0.25,-0.1,-1], role: "wing" });
  J["wingTipL"] = b.joint("wingTipL", { parent: J["wingMidL"], at: [0.075,0.108,-0.075], dir: [0.2,-0.15,-1], role: "wing" });
  J["wingR"] = b.joint("wingR", { parent: J["chest"], at: [-0.05,0.13,0.015], dir: [-0.3,-0.1,-1], role: "wing" });
  J["wingMidR"] = b.joint("wingMidR", { parent: J["wingR"], at: [-0.065,0.122,-0.03], dir: [-0.25,-0.1,-1], role: "wing" });
  J["wingTipR"] = b.joint("wingTipR", { parent: J["wingMidR"], at: [-0.075,0.108,-0.075], dir: [-0.2,-0.15,-1], role: "wing" });
  J["hipL"] = b.joint("hipL", { parent: J["body"], at: [0.026,0.085,0.005], dir: [0,-1,0], role: "leg" });
  J["ankleL"] = b.joint("ankleL", { parent: J["hipL"], at: [0.026,0.058,0], dir: [0,-1,0], role: "leg" });
  J["toeInnerL"] = b.joint("toeInnerL", { parent: J["ankleL"], at: [0.026,0.045,0.004], dir: [-0.2,-0.1,1], role: "digit" });
  J["toeOuterL"] = b.joint("toeOuterL", { parent: J["ankleL"], at: [0.026,0.045,0.004], dir: [0.25,-0.1,1], role: "digit" });
  J["toeBackL"] = b.joint("toeBackL", { parent: J["ankleL"], at: [0.026,0.045,0], dir: [0,-0.05,-1], role: "digit" });
  J["hipR"] = b.joint("hipR", { parent: J["body"], at: [-0.026,0.085,0.005], dir: [0,-1,0], role: "leg" });
  J["ankleR"] = b.joint("ankleR", { parent: J["hipR"], at: [-0.026,0.058,0], dir: [0,-1,0], role: "leg" });
  J["toeInnerR"] = b.joint("toeInnerR", { parent: J["ankleR"], at: [-0.026,0.045,0.004], dir: [0.2,-0.1,1], role: "digit" });
  J["toeOuterR"] = b.joint("toeOuterR", { parent: J["ankleR"], at: [-0.026,0.045,0.004], dir: [-0.25,-0.1,1], role: "digit" });
  J["toeBackR"] = b.joint("toeBackR", { parent: J["ankleR"], at: [-0.026,0.045,0], dir: [0,-0.05,-1], role: "digit" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
