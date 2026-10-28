import * as THREE from "three";
import { createBuilder, rng, catmull, bezier } from "../../../../src/index";

export const meta = {
  name: "Chibi Axolotl",
  description: "A chubby chibi axolotl with a big smiling head, pink feathery gill stalks, stubby toes and a finned tail.",
};

const PINK = "#f7bccb";
const BELLY = "#fde6e8";
const FIN = "#f3a2b8";
const STALK = "#ec7c9d";
const FRILL_A = "#ff5c8a";
const FRILL_B = "#ff86a9";
const SPOT = "#e79ab0";
const DARK = "#241624";
const MOUTH = "#c14f6b";
const BLUSH = "#ff9db5";
const TOE = "#fbd0da";
const WHITE = "#ffffff";

// head ellipsoid
const HC = [0, 0.056, 0.15];
const HR = [0.062, 0.042, 0.07];
const headY = (x: number, z: number) =>
  HC[1] + HR[1] * Math.sqrt(Math.max(0, 1 - (x / HR[0]) ** 2 - ((z - HC[2]) / HR[2]) ** 2));
const headZ = (x: number, y: number) =>
  HC[2] + HR[2] * Math.sqrt(Math.max(0, 1 - (x / HR[0]) ** 2 - ((y - HC[1]) / HR[1]) ** 2));

export default function build() {
  const b = createBuilder({ name: "axolotl" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.05, -0.02], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.05, -0.02],
      [0, 0.052, 0.05],
      [0, 0.05, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.05, 0.1], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.03, 0.12],
    aim: [0, 0.03, 0.22],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.05, -0.02],
      [0, 0.049, -0.095],
      [0, 0.046, -0.165],
      [0, 0.05, -0.235],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------- body ----------
  const body = b.sweep(spine, [0.046, 0.053, 0.05], {
    color: PINK,
    sectors: [[125, 235, BELLY]],
    sides: 12,
  });
  const tailTube = b.sweep(tail, [0.043, 0.032, 0.018, 0.008], {
    color: PINK,
    sectors: [[130, 230, BELLY]],
    sides: 10,
  });

  // tail fin
  b.extrude(
    [
      [0, 0.03],
      [0.05, 0.045],
      [0.12, 0.052],
      [0.19, 0.04],
      [0.235, 0.012, "sharp"],
      [0.235, -0.012, "sharp"],
      [0.19, -0.038],
      [0.12, -0.047],
      [0.05, -0.04],
      [0, -0.03],
    ],
    { at: [0, 0.05, -0.02], x: [0, 0, -1], thickness: 0.004, bevel: 0.0015, smoothing: 1, color: FIN, bone: tail.joints[1] },
  );
  // dorsal ridge
  b.extrude(
    [
      [0, 0],
      [0.1, 0],
      [0.092, 0.01],
      [0.055, 0.022],
      [0.02, 0.017],
    ],
    { at: [0, 0.096, 0.075], x: [0, 0, -1], thickness: 0.005, smoothing: 1, color: FIN, bone: spine.joints[0] },
  );

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), PINK, {
    bone: head,
    at: HC,
    scale: HR,
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), BELLY, {
    bone: jaw,
    at: [0, 0.027, 0.16],
    scale: [0.054, 0.021, 0.062],
  });
  // tongue
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTH, {
    bone: jaw,
    at: [0, 0.04, 0.17],
    scale: [0.026, 0.006, 0.03],
  });

  // smile
  const smile: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const x = -0.042 + (i * 0.084) / 8;
    const y = 0.038 + 0.014 * (x / 0.042) ** 2;
    smile.push([x, y, headZ(x, y) + 0.0015]);
  }
  b.sweep(catmull(smile), 0.0022, { bone: head, color: MOUTH, caps: { start: "round", end: "round" }, sides: 5 });
  for (const s of [1, -1]) {
    const y = 0.052;
    const x = s * 0.047;
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), MOUTH, { bone: head, at: [x, y, headZ(x, y) + 0.001] });
  }

  // nostrils, cheeks, eyes
  for (const s of [1, -1]) {
    const nx = s * 0.012;
    const nz = 0.212;
    b.part(new THREE.SphereGeometry(0.0033, 6, 4), DARK, { bone: head, at: [nx, headY(nx, nz) + 0.0005, nz] });

    const bx = s * 0.052;
    const by = 0.05;
    b.part(new THREE.SphereGeometry(1, 8, 6), BLUSH, {
      bone: head,
      at: [bx, by, headZ(bx, by) - 0.012],
      scale: [0.0035, 0.009, 0.011],
      aim: [s, 0, 0],
    });

    const ex = s * 0.04;
    const ez = 0.178;
    const ey = headY(ex, ez) + 0.002;
    b.part(new THREE.SphereGeometry(0.0135, 10, 8), DARK, { bone: head, at: [ex, ey, ez] });
    b.part(new THREE.SphereGeometry(0.0045, 6, 5), WHITE, { bone: head, at: [ex - s * 0.002, ey + 0.007, ez + 0.007] });
    b.part(new THREE.SphereGeometry(0.0022, 5, 4), WHITE, { bone: head, at: [ex + s * 0.004, ey - 0.004, ez + 0.011] });
    // soft eye ridge
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK, {
      bone: head,
      at: [ex, ey - 0.001, ez - 0.004],
      scale: [0.016, 0.01, 0.016],
    });
  }

  // ---------- gills ----------
  const stalks: { base: number[]; ctrl: number[]; tip: number[] }[] = [
    { base: [0.048, 0.084, 0.115], ctrl: [0.09, 0.115, 0.1], tip: [0.125, 0.145, 0.055] },
    { base: [0.056, 0.066, 0.108], ctrl: [0.105, 0.085, 0.1], tip: [0.16, 0.098, 0.06] },
    { base: [0.052, 0.05, 0.105], ctrl: [0.09, 0.05, 0.09], tip: [0.143, 0.04, 0.06] },
  ];
  for (const s of [1, -1]) {
    stalks.forEach((st, si) => {
      const m = (p: number[]): [number, number, number] => [p[0] * s, p[1], p[2]];
      const curve = bezier(m(st.base), m(st.ctrl), m(st.tip));
      b.sweep(curve, [0.0065, 0.0028], { bone: head, color: STALK, sides: 6, caps: { start: "flat", end: "round" } });
      b.part(new THREE.SphereGeometry(0.0085, 8, 6), STALK, { bone: head, at: m(st.base) });
      const N = 8;
      for (let k = 0; k < N; k++) {
        const t = 0.14 + k * 0.105;
        const pos = curve.at(t).clone();
        const T = curve.tangentAt(t).clone().normalize();
        const P = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 1, 0)).normalize();
        const Q = new THREE.Vector3().crossVectors(T, P).normalize();
        const len = 0.036 * (1 - 0.45 * t);
        for (const sg of [1, -1]) {
          const d = P.clone()
            .multiplyScalar(0.85 * sg)
            .addScaledVector(Q, k % 2 ? 0.45 : -0.3)
            .addScaledVector(T, 0.45)
            .normalize();
          const tip = pos.clone().addScaledVector(d, len);
          b.spike(pos, tip, null, 0.003, { bone: head, color: (k + si) % 2 ? FRILL_A : FRILL_B, sides: 5 });
        }
        if (k % 2) {
          const q = Q.clone().multiplyScalar(si % 2 ? 1 : -1).addScaledVector(T, 0.4).normalize();
          b.spike(pos, pos.clone().addScaledVector(q, len * 0.85), null, 0.0028, {
            bone: head,
            color: FRILL_B,
            sides: 5,
          });
        }
      }
      // tip tuft
      const end = curve.at(1).clone();
      const T = curve.tangentAt(1).clone().normalize();
      const P = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 1, 0)).normalize();
      for (const f of [-0.5, 0, 0.5]) {
        const d = T.clone().addScaledVector(P, f).normalize();
        b.spike(end, end.clone().addScaledVector(d, 0.03), null, 0.0028, { bone: head, color: FRILL_A, sides: 5 });
      }
    });
  }

  // ---------- legs ----------
  const limbs = (s: number, front: boolean) => {
    const S = s > 0 ? "L" : "R";
    const pts: number[][] = front
      ? [
          [s * 0.043, 0.04, 0.07],
          [s * 0.08, 0.022, 0.076],
          [s * 0.092, 0.013, 0.1],
        ]
      : [
          [s * 0.042, 0.04, -0.05],
          [s * 0.085, 0.022, -0.075],
          [s * 0.093, 0.013, -0.045],
        ];
    const nm = front ? "arm" : "leg";
    const chain = b.chain(`${nm}${S}`, catmull(pts), {
      parent: front ? spine.joints[1] : hips,
      names: front ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`] : [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: front ? "arm" : "leg",
    });
    b.sweep(chain, [0.018, 0.0125, 0.0105], { color: PINK, sides: 8 });
    const wrist = chain.joints[chain.joints.length - 1];
    const w = pts[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK, { bone: wrist, at: [w[0], 0.01, w[2]], scale: [0.013, 0.007, 0.013] });
    const n = front ? 4 : 5;
    const center = front ? 0.7 : 0.35;
    const step = front ? 0.32 : 0.28;
    for (let i = 0; i < n; i++) {
      const phi = center + (i - (n - 1) / 2) * step;
      const L = 0.026;
      const base: [number, number, number] = [w[0], 0.008, w[2]];
      const tip: [number, number, number] = [w[0] + s * Math.cos(phi) * L, 0.0075, w[2] + Math.sin(phi) * L];
      b.spike(base, tip, null, [0.0052, 0.004], { bone: wrist, color: TOE, sides: 6, caps: { end: "round" } });
    }
  };
  for (const s of [1, -1]) {
    limbs(s, true);
    limbs(s, false);
  }

  // ---------- freckles ----------
  const r = rng(11);
  const dots = (target: any, n: number, d: number, f: (h: any) => boolean) => {
    for (const hit of b.surface(target).scatter(n, { rng: r, minDist: d, filter: f })) {
      const rad = 0.004 + r() * 0.004;
      b.stick(new THREE.CylinderGeometry(rad, rad, 0.003, 6), SPOT, hit, { embed: 0.5 });
    }
  };
  dots(body, 22, 0.022, (h) => h.n.y > 0.35);
  dots(tailTube, 12, 0.02, (h) => h.n.y > 0.35);
  dots(skull, 7, 0.03, (h) => h.n.y > 0.5 && Math.abs(h.at.x) < 0.04 && h.at.z < 0.17);

  return b.root;
}
