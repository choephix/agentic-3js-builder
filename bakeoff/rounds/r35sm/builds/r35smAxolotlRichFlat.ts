import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, limb } from "../../../../src/index";

export const meta = {
  name: "Chibi Axolotl",
  description: "A chubby chibi axolotl with big frilly pink gills, tiny stubby toes, a finned tail and a happy smile.",
};

// palette
const SKIN = "#f8c9d4";
const SKIN_DEEP = "#f0aebf";
const BELLY = "#ffe8ea";
const FIN = "#f7a6bb";
const FIN_EDGE = "#ee86a3";
const GILL_STALK = "#ec5f86";
const GILL_FROND = "#ff8fb0";
const GILL_TIP = "#ff4f7d";
const SPECK = "#e594a8";
const EYE = "#241525";
const EYE_RIM = "#e9a0b4";
const SHINE = "#ffffff";
const BLUSH = "#ff93aa";
const MOUTH = "#b8476a";
const NOSTRIL = "#c9708a";
const TOE = "#f9b7c6";
const TOE_TIP = "#f28aa4";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "axolotl" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.06, -0.06], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.06, -0.06],
      [0, 0.062, 0.02],
      [0, 0.066, 0.08],
    ]),
    { parent: hips, names: ["spine1", "spine2", "neck"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine, at: [0, 0.07, 0.08], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.045, 0.13],
    aim: [0, 0.035, 0.23],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.06, -0.06],
      [0, 0.06, -0.14],
      [0, 0.062, -0.22],
      [0, 0.068, -0.32],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- body ----------
  const bodyPath = catmull([
    [0, 0.06, -0.1],
    [0, 0.06, 0],
    [0, 0.064, 0.09],
  ]);
  const body = b.sweep(bodyPath, (t) => [0.05 + 0.012 * Math.sin(Math.PI * t), 0.044 + 0.008 * Math.sin(Math.PI * t)], {
    bone: spine,
    color: SKIN,
    sectors: [[125, 235, BELLY]],
    sides: 12,
  });
  const tailTube = b.sweep(tail, (t) => [0.055 * (1 - t) + 0.01, 0.048 * (1 - t) + 0.02], {
    color: SKIN,
    sectors: [[130, 230, BELLY, 0, 0.5]],
    sides: 10,
  });

  // dorsal + tail fin (one long wavy sheet)
  const finOutline: [number, number][] = [
    [0, 0.05],
    [0.05, 0.068],
    [0.11, 0.085],
    [0.17, 0.088],
    [0.23, 0.072],
    [0.28, 0.042],
    [0.305, 0.01],
    [0.28, -0.028],
    [0.22, -0.042],
    [0.16, -0.048],
    [0.1, -0.048],
    [0.05, -0.045],
    [0, -0.04],
  ];
  const fin = b.extrude(finOutline, {
    at: [0, 0.062, -0.05],
    x: [0, 0, -1],
    thickness: 0.006,
    smoothing: 1,
    color: FIN,
    bone: tail.joints[0],
  });
  // fin ribs
  for (let i = 0; i < 9; i++) {
    const u = 0.07 + i * 0.024;
    const h = 0.05 + 0.028 * Math.sin(Math.min(1, (u - 0.04) / 0.2) * Math.PI * 0.8);
    b.rod([0, 0.07 + 0.03, -0.05 - u], [0, 0.062 + h * 0.92, -0.05 - u - 0.012], 0.0016, FIN_EDGE, {
      bone: tail.joints[1],
    });
  }
  void fin;

  // speckles
  const bodySkin = b.surface([body, tailTube]);
  for (const hit of bodySkin.scatter(46, { rng: R, minDist: 0.022, filter: (h) => h.n.y > 0.25 }))
    b.stick(new THREE.SphereGeometry(0.0045 + R() * 0.003, 5, 4), SPECK, hit, { embed: 0.5 });

  // ---------- head ----------
  const HC: [number, number, number] = [0, 0.075, 0.15];
  const skull = b.part(new THREE.SphereGeometry(1, 18, 14), SKIN, {
    bone: head,
    at: HC,
    scale: [0.085, 0.06, 0.08],
  });
  const lowerJaw = b.part(new THREE.SphereGeometry(1, 14, 10), BELLY, {
    bone: jaw,
    at: [0, 0.032, 0.165],
    scale: [0.068, 0.022, 0.062],
  });
  void lowerJaw;
  const skin = b.surface(skull);

  // smile
  const smile = skin.drape(
    catmull([
      [-0.058, 0.06, 0.18],
      [-0.035, 0.047, 0.215],
      [0, 0.043, 0.232],
      [0.035, 0.047, 0.215],
      [0.058, 0.06, 0.18],
    ]),
    { lift: 0.001 },
  );
  b.sweep(smile, 0.0022, { color: MOUTH, bone: head, caps: "round", sides: 5 });

  // nostrils + cheeks + head speckles
  for (const s of [1, -1]) {
    const n = skin.around(HC).at(s * 12, 8);
    if (n) b.stick(new THREE.SphereGeometry(0.0036, 5, 4), NOSTRIL, n, { embed: 0.4 });
    const c = skin.around(HC).at(s * 62, -12);
    if (c) b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 10), BLUSH, c, { embed: 0.5 });
  }
  for (const hit of skin.scatter(12, { rng: R, minDist: 0.03, filter: (h) => h.n.y > 0.5 }))
    b.stick(new THREE.SphereGeometry(0.0042, 5, 4), SPECK, hit, { embed: 0.5 });

  // eyes
  for (const s of [1, -1]) {
    const c: [number, number, number] = [s * 0.05, 0.111, 0.19];
    b.part(new THREE.SphereGeometry(0.0215, 10, 8), EYE_RIM, { bone: head, at: [c[0], c[1] - 0.002, c[2] - 0.003] });
    b.part(new THREE.SphereGeometry(0.0175, 12, 10), EYE, { bone: head, at: [c[0], c[1], c[2]] });
    b.part(new THREE.SphereGeometry(0.0062, 6, 5), SHINE, {
      bone: head,
      at: [c[0] - s * 0.005, c[1] + 0.008, c[2] + 0.0105],
    });
    b.part(new THREE.SphereGeometry(0.0028, 5, 4), SHINE, {
      bone: head,
      at: [c[0] + s * 0.006, c[1] - 0.006, c[2] + 0.0145],
    });
  }

  // ---------- gills ----------
  const bases = [0.1, 0.086, 0.072];
  const tipsOf = (s: number): [number, number, number][] => [
    [s * 0.15, 0.185, 0.075],
    [s * 0.2, 0.145, 0.06],
    [s * 0.2, 0.085, 0.045],
  ];
  for (const s of [1, -1]) {
    const tips = tipsOf(s);
    bases.forEach((by, k) => {
      const base: [number, number, number] = [s * 0.068, by, 0.11 - k * 0.004];
      const tip = tips[k];
      const ctrl: [number, number, number] = [
        base[0] + (tip[0] - base[0]) * 0.55,
        base[1] + (tip[1] - base[1]) * 0.45 + 0.02,
        base[2] - 0.02,
      ];
      const path = bezier(base, ctrl, tip);
      b.sweep(path, [0.0085, 0.0035], { color: GILL_STALK, bone: head, caps: "round", sides: 6 });
      const count = 7;
      for (let i = 0; i < count; i++) {
        const t = 0.18 + (0.8 * i) / (count - 1);
        const p = path.at(t);
        const tan = path.tangentAt(t).clone().normalize();
        const side = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 0, 1)).normalize();
        const len = 0.042 * (1 - t * 0.45);
        for (const d of [1, -1]) {
          const dir = side
            .clone()
            .multiplyScalar(0.85 * d)
            .addScaledVector(tan, 0.55)
            .add(new THREE.Vector3(0, 0, -0.2));
          b.spike(p, dir, len, 0.0042, { color: i % 2 ? GILL_FROND : GILL_TIP, bone: head, sides: 5 });
        }
      }
      b.spike(tip, path.tangentAt(1), 0.03, 0.0045, { color: GILL_TIP, bone: head, sides: 5 });
    });
  }

  // ---------- legs ----------
  const makeLeg = (s: number, front: boolean) => {
    const S = s > 0 ? "L" : "R";
    const tag = front ? "F" : "H";
    const z0 = front ? 0.05 : -0.055;
    const shoulder: [number, number, number] = [s * 0.05, 0.045, z0];
    const foot: [number, number, number] = [s * 0.1, 0.012, z0 + (front ? 0.025 : -0.02)];
    const pts = limb(shoulder, foot, [0.045, 0.035], [[s, 0.6, front ? -0.4 : 0.4]]);
    const leg = b.chain(`leg${tag}${S}`, pts, {
      parent: hips,
      names: [`hip${tag}${S}`, `knee${tag}${S}`, `foot${tag}${S}`],
      role: front ? "arm" : "leg",
    });
    b.sweep(leg, [0.021, 0.015], { color: SKIN, sides: 8 });
    const ft = leg.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 8), SKIN_DEEP, {
      bone: ft,
      at: [foot[0], 0.011, foot[2] + 0.004],
      scale: [0.026, 0.011, 0.03],
    });
    const n = front ? 4 : 5;
    for (let i = 0; i < n; i++) {
      const a = ((i - (n - 1) / 2) * 24 + (front ? 22 : 40)) * (Math.PI / 180);
      const dir = new THREE.Vector3(s * Math.sin(a), 0, Math.cos(a) * (front ? 1 : 0.6)).normalize();
      const start = new THREE.Vector3(foot[0], 0.008, foot[2] + 0.008).addScaledVector(dir, 0.012);
      const end = start.clone().addScaledVector(dir, 0.026);
      b.capsule(start, end, 0.0055, TOE, { bone: ft, sides: 6 });
      b.part(new THREE.SphereGeometry(0.0068, 6, 5), TOE_TIP, { bone: ft, at: end });
    }
  };
  for (const s of [1, -1]) {
    makeLeg(s, true);
    makeLeg(s, false);
  }

  return b.root;
}
