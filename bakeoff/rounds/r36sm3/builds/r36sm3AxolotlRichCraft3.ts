import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  countershade,
  spots,
  paint,
  mix,
  smoothstep,
  svg,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Chibi Axolotl",
  description: "A chibi axolotl with a big round head, wide smile, glossy eyes and three frilly pink gill fronds per side.",
};

// ---------- palette ----------
const PINK = "#f7b2c4";
const DOT = "#e58aa6";
const BELLY = "#fde6ea";
const GILL = "#e0456f";
const INK = "#3a1e33";
const WHITE = "#ffffff";

// ---------- textures ----------
function frond(stem: string, branch: string, tip: string) {
  let d = "";
  for (let j = 0; j < 6; j++) {
    const y = 58 - j * 9;
    const w = 15 - j * 1.6;
    d += `<path d="M20 ${y} Q${20 - w * 0.6} ${y - 4} ${20 - w} ${y - 13}" stroke="${branch}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`;
    d += `<path d="M20 ${y} Q${20 + w * 0.6} ${y - 4} ${20 + w} ${y - 13}" stroke="${branch}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`;
    d += `<circle cx="${20 - w}" cy="${y - 13}" r="2.2" fill="${tip}"/><circle cx="${20 + w}" cy="${y - 13}" r="2.2" fill="${tip}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 64 L20 6" stroke="${stem}" stroke-width="4.4" stroke-linecap="round" fill="none"/>
      ${d}<circle cx="20" cy="5" r="3.2" fill="${tip}"/></svg>`,
    { size: 192 },
  );
}
const FROND_A = frond("#d93a66", "#ff7aa0", "#ffd0de");
const FROND_B = frond("#e8527c", "#ff98b6", "#fff0f4");

const SMILE = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 10 Q50 44 92 10" stroke="${INK}" stroke-width="4.2" stroke-linecap="round" fill="none"/>
    <path d="M8 10 l-4 -5 M92 10 l4 -5" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="20" rx="26" ry="15" fill="#ff7fa3"/>
    <path d="M16 28 l6 -14 M28 30 l6 -16 M40 28 l6 -14" stroke="#ff5a88" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---------- paints ----------
const SKIN = countershade(spots(PINK, [DOT, "#ee9bb3"], { size: 0.035, amount: 0.3, seed: 4 }), BELLY, {
  level: -0.35,
  soft: 0.3,
});
const FIN = paint((p, _n, s) => {
  const rays = 0.5 + 0.5 * Math.sin(s[0] * 260);
  const base = mix("#fbc3d1", "#ea6a92", smoothstep(0.06, 0.14, p.y));
  return mix(base, "#e0527f", 0.18 * rays);
});

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const R = rng(5);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.056, -0.03], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.056, -0.03],
      [0, 0.06, 0.03],
      [0, 0.065, 0.085],
    ]),
    { parent: hips, names: ["spine1", "spine2", "neck"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine, at: [0, 0.07, 0.09], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.04, 0.09], aim: [0, 0.04, 0.18], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.056, -0.03],
      [0, 0.052, -0.1],
      [0, 0.05, -0.17],
      [0, 0.055, -0.24],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- body & tail ----------
  b.sweep(spine, (t) => [0.06 + 0.004 * t, 0.052], { color: SKIN, name: "body" });
  b.sweep(tail, (t) => [0.008 + 0.05 * Math.pow(1 - t, 1.6), 0.052 - 0.028 * t], { color: SKIN, name: "tailTube" });

  // tail / dorsal fin
  b.extrude(
    [
      [-0.04, 0.1],
      [-0.08, 0.128],
      [-0.13, 0.138],
      [-0.19, 0.128],
      [-0.24, 0.108],
      [-0.28, 0.07],
      [-0.27, 0.04],
      [-0.23, 0.028],
      [-0.17, 0.022],
      [-0.11, 0.025],
      [-0.06, 0.04],
      [-0.05, 0.07],
    ],
    {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      color: FIN,
      bone: tail.joints[1],
      name: "tailFin",
    },
  );

  // ---------- head ----------
  const HC: [number, number, number] = [0, 0.07, 0.12];
  const skull = b.part(new THREE.SphereGeometry(1, 18, 12), SKIN, {
    bone: head,
    at: HC,
    scale: [0.085, 0.06, 0.075],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, {
    bone: jaw,
    at: [0, 0.036, 0.125],
    scale: [0.07, 0.026, 0.06],
    name: "jawLower",
  });
  const skin = b.surface(skull);

  b.decal(skull, SMILE, { at: [0, 0.05, 0.188], dir: [0, -0.1, 1], size: [0.1, 0.04], bone: head });

  for (const s of [1, -1]) {
    // eyes
    const ex = s * 0.047;
    b.part(new THREE.SphereGeometry(0.021, 12, 9), INK, { bone: head, at: [ex, 0.097, 0.172], scale: [1, 1.05, 0.9] });
    b.part(new THREE.SphereGeometry(0.0065, 6, 5), WHITE, { bone: head, at: [ex - s * 0.004, 0.107, 0.188] });
    b.part(new THREE.SphereGeometry(0.0032, 6, 4), WHITE, { bone: head, at: [ex + s * 0.008, 0.088, 0.19] });
    // nostrils
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), INK, { bone: head, at: [s * 0.014, 0.078, 0.193] });
    // cheeks
    const cheek = skin.around(HC).at(s * 62, -8);
    if (cheek) b.decal(skull, BLUSH, { at: cheek, size: [0.036, 0.024], bone: head, roll: s * -8 });
  }

  // ---------- gills ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const dirs = [
      [s * 0.5, 0.85, -0.25],
      [s * 0.9, 0.4, -0.2],
      [s * 0.9, -0.1, -0.3],
    ];
    const ys = [0.088, 0.072, 0.056];
    dirs.forEach((dv, i) => {
      const d = new THREE.Vector3(dv[0], dv[1], dv[2]).normalize();
      const base: [number, number, number] = [s * 0.07, ys[i], 0.092];
      const tip: [number, number, number] = [base[0] + d.x * 0.095, base[1] + d.y * 0.095, base[2] + d.z * 0.095];
      const ctrl: [number, number, number] = [base[0] + d.x * 0.05, base[1] + d.y * 0.05 + 0.012, base[2] + d.z * 0.05 - 0.012];
      const gj = b.joint(`gill${side}${i + 1}`, { parent: head, at: base, aim: tip, role: "hinge" });
      const stalk = b.sweep(bezier(base, ctrl, tip), [0.011, 0.005], { bone: gj, color: GILL, name: `gillStalk${side}${i}` });
      const frames: any[] = [];
      for (let k = 0; k < 6; k++) {
        const t = 0.15 + k * 0.13;
        for (const ang of [-90, 90, 0]) frames.push(stalk.at(t, ang));
      }
      frames.push(stalk.at(0.98, 0), stalk.at(0.98, 180));
      b.cards(frames, [FROND_A, FROND_B], {
        size: [0.04, 0.05],
        lean: 55,
        bend: 25,
        vary: 0.2,
        spin: 15,
        rng: R,
        flow: (f: any) => f.tangent ?? [0, 1, 0],
      });
    });
  }

  // ---------- legs ----------
  const toes = (tip: any, fx: number, fz: number) => {
    for (const k of [-1.5, -0.5, 0.5, 1.5]) {
      const dx = k * 0.011;
      b.capsule(
        [fx + dx * 0.5, 0.009, fz + 0.006],
        [fx + dx * 1.3, 0.006, fz + 0.032 - Math.abs(k) * 0.004],
        [0.006, 0.0045],
        { color: SKIN, bone: tip },
      );
    }
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: tip, at: [fx, 0.009, fz + 0.008], scale: [0.017, 0.01, 0.02] });
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // arms
    const hand: [number, number, number] = [s * 0.108, 0.013, 0.085];
    const arm = b.chain(
      `arm${side}`,
      catmull([[s * 0.052, 0.05, 0.05], [s * 0.098, 0.034, 0.06], hand]),
      { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(arm, [0.022, 0.014], { color: SKIN, name: `arm${side}Tube` });
    toes(arm.tip, hand[0], hand[2]);
    // legs
    const foot: [number, number, number] = [s * 0.11, 0.013, -0.058];
    const leg = b.chain(
      `leg${side}`,
      catmull([[s * 0.056, 0.05, -0.06], [s * 0.1, 0.034, -0.082], foot]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `foot${side}`], role: "leg" },
    );
    b.sweep(leg, [0.024, 0.015], { color: SKIN, name: `leg${side}Tube` });
    toes(leg.tip, foot[0], foot[2]);
  }

  return b.root;
}
