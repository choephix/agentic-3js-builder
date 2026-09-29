// Sprinter (Control arm): an athletic woman about 1.70 m tall in a crop top, running briefs and spikes, built with the
// plain SDK.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import type { Surface } from "../src/surface";
import { svg } from "../src/texture";

export const meta = {
  name: "Sprinter (Control)",
  description:
    "Athletic woman sprinter, 1.70 m: crop top with a race bib, running briefs, spikes, ankle socks, hair in a high ponytail. A-pose, full finger rig, ponytail joints.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const SKIN = "#d69f7a";
const LIP = "#c4626c";
const NAIL = "#efc4b8";
const HAIR = "#5a3222";
const BROW = "#3d2417";
const EYE_WHITE = "#f4f0e8";
const IRIS = "#4f8f6a";
const PUPIL = "#16161b";
const TOP = "#ff3f7f";
const TOP_TRIM = "#f7f4ee";
const BRIEF = "#22252f";
const SHOE = "#c6f03a";
const SOLE = "#22252f";
const SPIKE = "#c9ccd2";
const LACE = "#ffffff";
const SOCK = "#f7f4ee";

// ---------------------------------------------------------------------------------------------------------------
// Helpers

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Monotone cubic through `[u, a, b, ...]` keys: `f(u)` gives every channel, no overshoot between keys. */
function spline(keys: readonly number[][]) {
  const n = keys.length;
  const ch = keys[0].length - 1;
  const xs = keys.map((k) => k[0]);
  const slopes: number[][] = [];
  for (let c = 1; c <= ch; c++) {
    const ys = keys.map((k) => k[c]);
    const d = ys.slice(1).map((y, i) => (y - ys[i]) / (xs[i + 1] - xs[i]));
    const m = ys.map((_, i) =>
      i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2,
    );
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) m[i] = m[i + 1] = 0;
      else {
        const a = m[i] / d[i];
        const bb = m[i + 1] / d[i];
        const s = a * a + bb * bb;
        if (s > 9) {
          const tau = 3 / Math.sqrt(s);
          m[i] = tau * a * d[i];
          m[i + 1] = tau * bb * d[i];
        }
      }
    }
    slopes.push(m);
  }
  return (u: number) => {
    const x = Math.min(Math.max(u, xs[0]), xs[n - 1]);
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return slopes.map((m, c) => {
      const y0 = keys[i][c + 1];
      const y1 = keys[i + 1][c + 1];
      return (
        (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m[i + 1]
      );
    });
  };
}

/** A sweep radius / shift pair out of a spline sample `[rx, ry, shift]`. */
const rad = ([rx, ry]: number[]): [number, number] => [rx, ry];
const shf = ([, , z]: number[]): [number, number] => [0, z];

/** Orientation whose local x, y, z axes point along the given model-space directions. */
const basis = (x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));

/** `v` with its component along the unit vector `n` removed. */
const flat = (v: THREE.Vector3, n: THREE.Vector3) => v.clone().addScaledVector(n, -v.dot(n));

/** A unit sphere squashed to half axes (x, y, z): muscle bellies and pads for `stick`. */
const lump = (x: number, y: number, z: number, w = 10, h = 7) => new THREE.SphereGeometry(1, w, h).scale(x, y, z);

// The race bib drawing: pink header, big number, bars.
const BIB = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">
    <rect width="120" height="90" rx="4" fill="#ffffff"/>
    <rect width="120" height="22" rx="4" fill="#ff3f7f"/>
    <rect y="12" width="120" height="10" fill="#ff3f7f"/>
    <text x="60" y="17" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="13" text-anchor="middle" fill="#ffffff">SPRINT 100</text>
    <text x="60" y="70" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="44" text-anchor="middle" fill="#16161b">212</text>
    <rect x="10" y="78" width="100" height="5" fill="#16161b"/>
    <rect x="16" y="78" width="3" height="5" fill="#ffffff"/><rect x="30" y="78" width="2" height="5" fill="#ffffff"/>
    <rect x="46" y="78" width="4" height="5" fill="#ffffff"/><rect x="66" y="78" width="2" height="5" fill="#ffffff"/>
    <rect x="80" y="78" width="3" height="5" fill="#ffffff"/><rect x="98" y="78" width="2" height="5" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "sprinterControl" });
  const ball = (w = 10, h = 8) => new THREE.SphereGeometry(1, w, h);

  /** Seat a muscle belly on a skin surface: the first hit of a ray, oriented with its local Z along `flow`. */
  const onSkin = (
    surface: Surface,
    from: [number, number, number],
    dir: [number, number, number],
    geometry: THREE.BufferGeometry,
    color: string,
    options: { embed?: number; flow?: [number, number, number]; spin?: number; group?: string },
  ) => {
    const hit = surface.ray(from, dir);
    return hit ? b.stick(geometry, color, hit, options) : null;
  };

  // ---- skeleton spine, neck, head ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.875, 0] });
  const spine = b.chain(
    "spineChain",
    polyline([
      [0, 0.945, 0],
      [0, 1.055, 0],
      [0, 1.18, 0.004],
      [0, 1.375, -0.004],
    ]),
    { parent: hips, names: ["spine", "spine1", "spine2"], up: [0, 0, 1], role: "spine" },
  );
  const spine2 = spine.joints[2];
  const neckChain = b.chain(
    "neckChain",
    polyline([
      [0, 1.375, -0.004],
      [0, 1.485, 0.006],
    ]),
    { parent: spine2, names: ["neck"], up: [0, 0, 1], role: "neck" },
  );
  const neck = neckChain.joints[0];
  const head = b.joint("head", { parent: neck, at: [0, 1.485, 0.006], aim: [0, 1.7, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.555, -0.02], aim: [0, 1.495, 0.064], role: "jaw" });

  // ---- torso ----------------------------------------------------------------------------------------------
  // Section keys by height: [y, half width, half depth, forward shift of the section centre].
  const TY0 = 0.79;
  const TY1 = 1.4;
  const torsoAt = spline([
    [0.79, 0.095, 0.082, 0],
    [0.83, 0.135, 0.092, -0.004],
    [0.885, 0.155, 0.098, -0.005],
    [0.95, 0.148, 0.092, -0.002],
    [1.01, 0.124, 0.08, 0.004],
    [1.06, 0.113, 0.076, 0.006],
    [1.12, 0.122, 0.081, 0.008],
    [1.18, 0.135, 0.088, 0.01],
    [1.24, 0.144, 0.094, 0.01],
    [1.29, 0.146, 0.092, 0.006],
    [1.335, 0.125, 0.08, -0.004],
    [1.375, 0.075, 0.056, -0.01],
    [1.4, 0.04, 0.04, -0.012],
  ]);
  const torsoPath = catmull([
    [0, TY0, 0],
    [0, 0.95, 0],
    [0, 1.12, 0],
    [0, 1.28, 0],
    [0, TY1, 0],
  ]);
  const yOfT = (t: number) => TY0 + t * (TY1 - TY0);
  const torso = b.sweep(torsoPath, (t) => rad(torsoAt(yOfT(t))), {
    shift: (t) => shf(torsoAt(yOfT(t))),
    bone: [hips, spine, neck],
    color: SKIN,
    sides: 16,
    up: [0, 0, 1],
    group: "torso",
  });

  // neck
  const neckAt = spline([
    [0, 0.058, 0.055, -0.011],
    [0.4, 0.049, 0.047, -0.005],
    [1, 0.045, 0.045, 0.004],
  ]);
  const neckTube = b.sweep(
    catmull([
      [0, 1.34, -0.018],
      [0, 1.42, -0.005],
      [0, 1.5, 0.007],
    ]),
    (t) => rad(neckAt(t)),
    { shift: (t) => shf(neckAt(t)), bone: [spine2, neck, head], color: SKIN, sides: 10, up: [0, 0, 1], group: "neck" },
  );
  const neckSkin = b.surface(neckTube);
  for (const s of [1, -1])
    onSkin(neckSkin, [s * 0.026, 1.43, 0.6], [0, 0, -1], lump(0.009, 0.007, 0.05, 8, 5), SKIN, {
      embed: 0.55,
      flow: [-s * 0.35, -1, 0.2],
      group: "neck",
    });

  // ---- midriff and back -----------------------------------------------------------------------------------------
  const skin = b.surface(torso);
  for (const s of [1, -1]) {
    // lean abdominal wall: shallow blocks either side of the linea alba
    for (const y of [1.0, 1.045, 1.09, 1.135])
      onSkin(skin, [s * 0.0215, y, 0.6], [0, 0, -1], lump(0.0225, 0.011, 0.0195, 8, 6), SKIN, {
        embed: 0.55,
        flow: [0, -1, 0],
        group: "abdomen",
      });
    // hip bones
    onSkin(skin, [s * 0.112, 0.965, 0.6], [0, 0, -1], lump(0.012, 0.01, 0.034, 6, 5), SKIN, {
      embed: 0.55,
      flow: [-s * 0.6, -1, 0],
      group: "abdomen",
    });
    // back: shoulder blades, lats, erector spinae
    onSkin(skin, [s * 0.062, 1.3, -0.6], [0, 0, 1], lump(0.046, 0.014, 0.05, 10, 6), SKIN, {
      embed: 0.5,
      flow: [0, -1, 0],
      spin: s * 16,
      group: "back",
    });
    onSkin(skin, [s * 0.095, 1.2, -0.6], [0, 0, 1], lump(0.04, 0.012, 0.08, 10, 6), SKIN, {
      embed: 0.5,
      flow: [s * 0.35, -1, 0],
      group: "back",
    });
    onSkin(skin, [s * 0.024, 1.1, -0.6], [0, 0, 1], lump(0.017, 0.011, 0.09, 8, 6), SKIN, {
      embed: 0.55,
      flow: [0, -1, 0],
      group: "back",
    });
  }
  // navel
  const navel = skin.ray([0, 1.045, 0.6], [0, 0, -1]);
  if (navel) b.stick(lump(0.006, 0.004, 0.006, 6, 4), "#a8694c", navel, { embed: 0.5, group: "abdomen" });

  // glutes
  for (const s of [1, -1])
    b.part(ball(10, 8), SKIN, {
      bone: hips,
      at: [s * 0.064, 0.842, -0.05],
      scale: [0.081, 0.087, 0.078],
      group: "hips",
    });

  // ---- legs -------------------------------------------------------------------------------------------------
  const thigh = spline([
    [0, 0.068, 0.078, -0.004],
    [0.1, 0.08, 0.088, -0.003],
    [0.3, 0.078, 0.086, 0.003],
    [0.55, 0.069, 0.076, 0.005],
    [0.8, 0.057, 0.064, 0.002],
    [1, 0.05, 0.056, 0],
  ]);
  const shin = spline([
    [0, 0.05, 0.055, 0],
    [0.12, 0.054, 0.059, -0.005],
    [0.3, 0.056, 0.063, -0.012],
    [0.55, 0.043, 0.05, -0.009],
    [0.8, 0.032, 0.035, -0.004],
    [1, 0.027, 0.03, 0],
  ]);
  const SOLE_UP = 0.0085; // the shoe raises the foot: spikes touch the floor, the plate sits above them
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fx = s * 0.086;
    const hipP = V(s * 0.081, 0.87, 0);
    const kneeP = V(s * 0.084, 0.465, 0.009);
    const ankleP = V(fx, 0.09, -0.013);
    const path = catmull([hipP, kneeP, ankleP]);
    const chain = b.chain(`legChain${side}`, path, {
      parent: hips,
      names: [`upLeg${side}`, `leg${side}`],
      up: [0, 0, 1],
      role: "leg",
      contact: [fx, 0, 0.02],
    });
    const tKnee = path.closestT(kneeP);
    const at = (t: number) => (t < tKnee ? thigh(t / tKnee) : shin((t - tKnee) / (1 - tKnee)));
    const tube = b.sweep(chain, (t) => rad(at(t)), {
      shift: (t) => shf(at(t)),
      color: SKIN,
      sides: 14,
      group: `leg${side}`,
    });
    const legJoint = chain.joints[1];
    const footTip = V(fx, 0.032 + SOLE_UP, 0.12);
    const foot = b.joint(`foot${side}`, { parent: legJoint, at: ankleP, aim: footTip });
    const toe = b.joint(`toe${side}`, { parent: foot, at: footTip, aim: [fx, 0.02 + SOLE_UP, 0.23] });

    // calf heads and kneecap, seated on the skin so they bend with it
    const legSkin = b.surface(tube);
    const mu = { flow: [0, -1, 0] as [number, number, number], group: `leg${side}` };
    onSkin(legSkin, [s * 0.102, 0.31, -0.6], [0, 0, 1], lump(0.028, 0.017, 0.078), SKIN, { ...mu, embed: 0.6 });
    onSkin(legSkin, [s * 0.068, 0.318, -0.6], [0, 0, 1], lump(0.031, 0.019, 0.083), SKIN, { ...mu, embed: 0.6 });
    const knee = legSkin.ray([fx, 0.47, 0.6], [0, 0, -1]);
    if (knee) b.stick(lump(0.027, 0.015, 0.03, 8, 6), SKIN, knee, { ...mu, embed: 0.6 });

    // running briefs: the thigh tube again, a shade out, cut high on the thigh
    const tBrief = tKnee * 0.3;
    const outer = -s * 90;
    b.sweep(
      chain,
      (t) => {
        const [rx, ry] = at(t);
        return [rx + 0.006, ry + 0.006];
      },
      {
        shift: (t) => shf(at(t)),
        to: tBrief,
        caps: { start: "round", end: "flat" },
        bands: [
          [tBrief * 0.82, BRIEF],
          [tBrief, TOP_TRIM],
        ],
        sectors: [[outer - 12, outer + 12, TOP, 0, tBrief * 0.82]],
        sides: 14,
        group: "briefs",
      },
    );

    // ankle sock, a folded cuff at the top
    const tSock = path.closestT(V(fx, 0.155, -0.005));
    b.sweep(
      chain,
      (t) => {
        const [rx, ry] = at(t);
        return [rx + 0.004, ry + 0.004];
      },
      {
        shift: (t) => shf(at(t)),
        from: tSock,
        caps: { start: "flat", end: "round" },
        bands: [
          [tSock + (1 - tSock) * 0.16, SOCK],
          [1, SOCK],
        ],
        sides: 12,
        group: `foot${side}`,
      },
    );

    // foot inside the shoe, then the running spike itself: upper, toe box, sole plate, pins and laces
    const footAt = spline([
      [0, 0.028, 0.03],
      [0.3, 0.031, 0.042],
      [0.62, 0.036, 0.034],
      [0.9, 0.045, 0.025],
      [1, 0.043, 0.02],
    ]);
    b.sweep(
      catmull([
        [fx, 0.03 + SOLE_UP + 0.007, -0.044],
        [fx, 0.042 + SOLE_UP + 0.007, -0.018],
        [fx, 0.034 + SOLE_UP + 0.007, 0.046],
        [fx, 0.025 + SOLE_UP + 0.007, 0.108],
        [fx, 0.018 + SOLE_UP + 0.007, 0.138],
      ]),
      (t) => rad(footAt(t)),
      { bone: [foot, toe], color: SKIN, sides: 10, up: [0, 1, 0], group: `foot${side}` },
    );
    const upperAt = spline([
      [0, 0.035, 0.037],
      [0.28, 0.039, 0.05],
      [0.62, 0.044, 0.042],
      [0.9, 0.048, 0.032],
      [1, 0.047, 0.028],
    ]);
    const upper = b.sweep(
      catmull([
        [fx, 0.037 + SOLE_UP + 0.004, -0.05],
        [fx, 0.05 + SOLE_UP + 0.004, -0.02],
        [fx, 0.042 + SOLE_UP + 0.004, 0.045],
        [fx, 0.032 + SOLE_UP + 0.004, 0.106],
        [fx, 0.027 + SOLE_UP + 0.004, 0.135],
      ]),
      (t) => rad(upperAt(t)),
      { bone: [foot, toe], color: SHOE, sides: 12, up: [0, 1, 0], group: `foot${side}` },
    );
    const box = b.sweep(
      catmull([
        [fx, 0.028 + SOLE_UP + 0.004, 0.125],
        [fx, 0.024 + SOLE_UP + 0.004, 0.17],
        [fx, 0.019 + SOLE_UP + 0.004, 0.205],
      ]),
      (t) => [0.0455 - 0.0175 * t, 0.0285 - 0.009 * t],
      { bone: toe, color: SHOE, sides: 12, caps: { start: "flat", end: "round" }, up: [0, 1, 0], group: `foot${side}` },
    );
    void box;
    const plate = (z0: number, z1: number, bone: typeof foot) =>
      b.extrude(
        [
          [-0.03, z0],
          [0.03, z0],
          [0.04, (z0 + z1) / 2],
          [0.035, z1],
          [-0.035, z1],
          [-0.04, (z0 + z1) / 2],
        ],
        {
          at: [fx, SOLE_UP * 0.5 + 0.001, 0],
          x: [1, 0, 0],
          y: [0, 0, 1],
          thickness: 0.0075,
          smoothing: 1,
          color: SOLE,
          bone,
          group: `foot${side}`,
        },
      );
    plate(-0.053, 0.116, foot);
    // toe end of the plate, a rounded nose
    b.extrude(
      [
        [-0.038, 0.114],
        [0.038, 0.114],
        [0.044, 0.15],
        [0.036, 0.195],
        [0, 0.222],
        [-0.036, 0.195],
        [-0.044, 0.15],
      ],
      {
        at: [fx, SOLE_UP * 0.5 + 0.001, 0],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.0075,
        smoothing: 1,
        color: SOLE,
        bone: toe,
        group: `foot${side}`,
      },
    );
    for (const [dx, z] of [
      [-0.026, 0.13],
      [0.026, 0.13],
      [0, 0.15],
      [-0.024, 0.178],
      [0.024, 0.178],
      [0, 0.2],
    ])
      b.spike([fx + dx, 0.0125, z], [0, -1, 0], 0.0122, 0.0045, {
        bone: toe,
        color: SPIKE,
        sides: 5,
        group: `foot${side}`,
      });
    // laces across the instep, draped on the upper
    const shoeSkin = b.surface(upper);
    for (const z of [-0.012, 0.008, 0.028, 0.048]) {
      const top = shoeSkin.ray([fx, 0.4, z], [0, -1, 0]);
      if (!top) continue;
      const y = top.at.y;
      b.sweep(
        shoeSkin.drape(
          catmull([
            [fx - 0.022, y - 0.005, z],
            [fx, y + 0.008, z],
            [fx + 0.022, y - 0.005, z],
          ]),
          { lift: 0.0015 },
        ),
        0.0026,
        { bone: foot, color: LACE, sides: 4, group: `foot${side}` },
      );
    }
    // ankle bones under the sock
    for (const o of [-1, 1])
      b.part(ball(8, 6), SOCK, {
        bone: foot,
        at: [fx + o * 0.0285, 0.084, -0.017],
        scale: [0.0105, 0.0145, 0.0145],
        group: `foot${side}`,
      });
  }

  // ---- arms and hands ---------------------------------------------------------------------------------------
  const armAt1 = spline([
    [0, 0.043, 0.043, 0],
    [0.15, 0.047, 0.049, 0.002],
    [0.5, 0.045, 0.051, 0.004],
    [0.8, 0.039, 0.043, 0.002],
    [1, 0.034, 0.037, 0],
  ]);
  const armAt2 = spline([
    [0, 0.034, 0.037, 0],
    [0.15, 0.039, 0.04, 0],
    [0.35, 0.039, 0.037, 0],
    [0.65, 0.03, 0.028, 0],
    [0.9, 0.025, 0.02, 0],
    [1, 0.023, 0.017, 0],
  ]);
  const palmAt = spline([
    [0, 0.023, 0.017, 0],
    [0.3, 0.029, 0.0135, 0],
    [0.7, 0.034, 0.0115, 0],
    [1, 0.035, 0.01, 0],
  ]);
  const FINGERS = [
    { n: "index", off: 0.0255, ang: 7, len: [0.036, 0.022, 0.019], r: 0.0082 },
    { n: "middle", off: 0.0088, ang: 1, len: [0.04, 0.025, 0.02], r: 0.0086 },
    { n: "ring", off: -0.0088, ang: -5, len: [0.037, 0.024, 0.019], r: 0.0079 },
    { n: "pinky", off: -0.0248, ang: -12, len: [0.028, 0.017, 0.017], r: 0.0067 },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder = b.joint(`shoulder${side}`, {
      parent: spine2,
      at: [s * 0.018, 1.378, 0.062],
      aim: [s * 0.15, 1.382, 0],
    });
    const S = V(s * 0.16, 1.345, 0);
    const a1 = V(s * 0.7, -0.7, 0.05).normalize();
    const E = S.clone().addScaledVector(a1, 0.275);
    const a2 = V(s * 0.7, -0.68, 0.16).normalize();
    const Wr = E.clone().addScaledVector(a2, 0.245);
    const d = a2.clone();
    const K = Wr.clone().addScaledVector(d, 0.09);
    // palm normal: down and a little forward; w runs across the palm toward the thumb
    const n = flat(V(0, -1, 0.28), d).normalize();
    const w = new THREE.Vector3().crossVectors(d, n).normalize();
    if (w.z < 0) w.negate();
    // roll from "biceps forward" to the palm normal, about the arm
    const n0 = flat(V(0, 0, 1), d).normalize();
    const twist = (Math.atan2(d.dot(new THREE.Vector3().crossVectors(n0, n)), n0.dot(n)) * 180) / Math.PI;
    const path = catmull([S, E, Wr, K]);
    const tE = path.closestT(E);
    const tW = path.closestT(Wr);
    const arm = b.chain(`armChain${side}`, path, {
      parent: shoulder,
      names: [`upperArm${side}`, `lowerArm${side}`, `hand${side}`],
      up: [0, 0, 1],
      twist: (t) => twist * Math.min(Math.max((t - tE * 0.9) / (tW - tE * 0.9), 0), 1),
      role: "arm",
    });
    const armAtT = (t: number) =>
      t < tE ? armAt1(t / tE) : t < tW ? armAt2((t - tE) / (tW - tE)) : palmAt((t - tW) / (1 - tW));
    const armTube = b.sweep(arm, (t) => rad(armAtT(t)), {
      shift: (t) => shf(armAtT(t)),
      color: SKIN,
      sides: 12,
      group: `arm${side}`,
    });
    const [upperArm, , hand] = arm.joints;

    // lean biceps, triceps and forearm muscle, seated on the skin
    const armSkin = b.surface(armTube);
    const f1: [number, number, number] = [a1.x, a1.y, a1.z];
    const f2: [number, number, number] = [a2.x, a2.y, a2.z];
    const belly = (at: THREE.Vector3, dir: number, size: [number, number, number], flow: [number, number, number]) =>
      onSkin(armSkin, [at.x, at.y, dir * 0.6], [0, 0, -dir], lump(...size), SKIN, {
        embed: 0.55,
        flow,
        group: `arm${side}`,
      });
    belly(S.clone().addScaledVector(a1, 0.14), 1, [0.026, 0.016, 0.085], f1);
    belly(S.clone().addScaledVector(a1, 0.13), -1, [0.028, 0.017, 0.09], f1);
    belly(E.clone().addScaledVector(a2, 0.065), 1, [0.02, 0.014, 0.075], f2);
    belly(E.clone().addScaledVector(a2, 0.078), -1, [0.024, 0.014, 0.085], f2);

    // deltoid, along the upper arm; trapezius and clavicle
    const across = flat(V(0, 0, 1), a1).normalize();
    b.part(ball(12, 9), SKIN, {
      bone: upperArm,
      at: S.clone()
        .addScaledVector(a1, 0.035)
        .add(V(s * 0.005, 0.005, 0)),
      quat: basis(new THREE.Vector3().crossVectors(a1, across).normalize(), a1, across),
      scale: [0.05, 0.068, 0.054],
      group: `arm${side}`,
    });
    b.sweep(
      catmull([
        [s * 0.034, 1.412, -0.026],
        [s * 0.1, 1.397, -0.017],
        [s * 0.163, 1.378, -0.004],
      ]),
      [0.026, 0.021],
      { bone: shoulder, color: SKIN, sides: 8, group: "neck" },
    );
    onSkin(skin, [s * 0.07, 1.372, 0.6], [0, 0, -1], lump(0.009, 0.007, 0.06, 8, 5), SKIN, {
      embed: 0.55,
      flow: [s, 0.15, -0.3],
      group: "chest",
    });

    // thenar pad
    b.part(ball(8, 6), SKIN, {
      bone: hand,
      at: Wr.clone().addScaledVector(d, 0.03).addScaledVector(w, 0.018).addScaledVector(n, 0.006),
      quat: basis(w, n, d),
      scale: [0.019, 0.013, 0.028],
      group: `hand${side}`,
    });

    // fingers
    for (const f of FINGERS) {
      const rad3 = (f.ang * Math.PI) / 180;
      const dir = d.clone().multiplyScalar(Math.cos(rad3)).addScaledVector(w, Math.sin(rad3)).normalize();
      const p0 = K.clone().addScaledVector(w, f.off).addScaledVector(d, -0.005);
      const p1 = p0.clone().addScaledVector(dir, f.len[0]);
      const p2 = p1.clone().addScaledVector(dir, f.len[1]);
      const p3 = p2.clone().addScaledVector(dir, f.len[2]);
      const chain = b.chain(`${f.n}Chain${side}`, polyline([p0, p1, p2, p3]), {
        parent: hand,
        names: [1, 2, 3].map((i) => `${f.n}${i}${side}`),
        up: n,
        role: "digit",
      });
      b.sweep(chain, (t) => [f.r * (1 - 0.22 * t), f.r * 0.92 * (1 - 0.22 * t)], {
        color: SKIN,
        sides: 6,
        group: `hand${side}`,
      });
      b.part(ball(6, 4), NAIL, {
        bone: chain.joints[2],
        at: p3
          .clone()
          .addScaledVector(dir, -0.006)
          .addScaledVector(n, -f.r * 0.62),
        quat: basis(w, n, dir),
        scale: [0.005, 0.0016, 0.0068],
        group: `hand${side}`,
      });
    }
    // thumb, apart from the fingers
    const dt = d
      .clone()
      .multiplyScalar(Math.cos(0.5))
      .addScaledVector(w, Math.sin(0.5))
      .addScaledVector(n, 0.2)
      .normalize();
    const t0 = Wr.clone().addScaledVector(d, 0.024).addScaledVector(w, 0.016).addScaledVector(n, 0.005);
    const t1 = t0.clone().addScaledVector(dt, 0.04);
    const dt2 = dt.clone().addScaledVector(n, 0.12).normalize();
    const t2 = t1.clone().addScaledVector(dt2, 0.028);
    const t3 = t2.clone().addScaledVector(dt2, 0.024);
    const thumb = b.chain(`thumbChain${side}`, polyline([t0, t1, t2, t3]), {
      parent: hand,
      names: [1, 2, 3].map((i) => `thumb${i}${side}`),
      up: n,
      role: "digit",
    });
    b.sweep(thumb, (t) => [0.0112 * (1 - 0.3 * t), 0.0104 * (1 - 0.3 * t)], {
      color: SKIN,
      sides: 7,
      group: `hand${side}`,
    });
    b.part(ball(6, 4), NAIL, {
      bone: thumb.joints[2],
      at: t3.clone().addScaledVector(dt2, -0.007).addScaledVector(n, -0.0068),
      quat: basis(w, n, dt2),
      scale: [0.006, 0.0018, 0.008],
      group: `hand${side}`,
    });
  }

  // ---- head -------------------------------------------------------------------------------------------------
  const HY0 = 1.523;
  const HY1 = 1.658;
  const skullAt = spline([
    [1.523, 0.05, 0.067, 0.004],
    [1.55, 0.061, 0.077, 0.004],
    [1.578, 0.069, 0.085, 0],
    [1.61, 0.071, 0.089, -0.007],
    [1.635, 0.068, 0.085, -0.011],
    [1.65, 0.055, 0.07, -0.013],
    [1.658, 0.037, 0.046, -0.013],
  ]);
  b.sweep(
    polyline([
      [0, HY0, 0],
      [0, HY1, 0],
    ]),
    (t) => rad(skullAt(HY0 + t * (HY1 - HY0))),
    {
      shift: (t) => shf(skullAt(HY0 + t * (HY1 - HY0))),
      bone: head,
      color: SKIN,
      sides: 14,
      caps: { start: "round", end: "flat" },
      up: [0, 0, 1],
      group: "head",
    },
  );
  // lower face and chin on the jaw bone: a softer, narrower jaw
  const jawAt = spline([
    [0, 0.053, 0.023, 0],
    [0.5, 0.045, 0.025, 0],
    [0.8, 0.03, 0.025, 0],
    [1, 0.019, 0.023, 0],
  ]);
  b.sweep(
    catmull([
      [0, 1.539, -0.028],
      [0, 1.52, 0.017],
      [0, 1.503, 0.053],
    ]),
    (t) => rad(jawAt(t)),
    { bone: jaw, color: SKIN, sides: 10, up: [0, 1, 0], group: "head" },
  );
  // brow ridge, nose, cheeks, ears
  b.sweep(
    catmull([
      [-0.052, 1.628, 0.058],
      [-0.027, 1.632, 0.073],
      [0, 1.63, 0.077],
      [0.027, 1.632, 0.073],
      [0.052, 1.628, 0.058],
    ]),
    0.0068,
    { bone: head, color: SKIN, sides: 8, group: "head" },
  );
  const nose = b.sweep(
    catmull([
      [0, 1.618, 0.074],
      [0, 1.593, 0.084],
      [0, 1.568, 0.092],
    ]),
    (t) => [0.0072 + 0.0042 * t, 0.0068 + 0.004 * t],
    { bone: head, color: SKIN, sides: 8, up: [0, 0, 1], group: "head" },
  );
  void nose;
  b.part(ball(8, 6), SKIN, { bone: head, at: [0, 1.562, 0.0955], scale: [0.0112, 0.0105, 0.0115], group: "head" });
  for (const s of [1, -1]) {
    b.part(ball(8, 6), SKIN, {
      bone: head,
      at: [s * 0.0125, 1.561, 0.083],
      scale: [0.0095, 0.0088, 0.009],
      group: "head",
    });
    b.part(ball(6, 4), "#3a2a26", {
      bone: head,
      at: [s * 0.007, 1.554, 0.09],
      scale: [0.0034, 0.0022, 0.0034],
      group: "head",
    });
    // cheekbones
    b.part(ball(8, 6), SKIN, {
      bone: head,
      at: [s * 0.051, 1.588, 0.036],
      dir: [0, -0.3, 1],
      axis: "z",
      scale: [0.011, 0.0095, 0.022],
      group: "head",
    });
    // ear
    b.extrude(
      [
        [0.003, 0.025],
        [-0.009, 0.03],
        [-0.021, 0.022],
        [-0.027, 0.005],
        [-0.023, -0.013],
        [-0.013, -0.025],
        [-0.003, -0.027],
        [0.003, -0.018],
        [0.005, 0],
      ],
      {
        at: [s * 0.0685, 1.61, -0.005],
        x: [-s * 0.3, 0, 1],
        thickness: 0.009,
        bevel: 0.0025,
        smoothing: 1,
        color: SKIN,
        bone: head,
        group: "head",
      },
    );
    // eye: ball, iris, pupil, lids, and a dark lash line along the upper lid
    const eye = V(s * 0.0305, 1.62, 0.0575);
    const R = 0.0155;
    b.part(ball(10, 8), EYE_WHITE, { bone: head, at: eye, scale: R, group: "head" });
    b.part(new THREE.CircleGeometry(0.0085, 10), IRIS, {
      bone: head,
      at: eye.clone().add(V(0, -0.0006, R - 0.0006)),
      dir: [0, 0, 1],
      axis: "z",
      group: "head",
    });
    b.part(new THREE.CircleGeometry(0.0045, 8), PUPIL, {
      bone: head,
      at: eye.clone().add(V(0, -0.0006, R - 0.0002)),
      dir: [0, 0, 1],
      axis: "z",
      group: "head",
    });
    b.part(new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, 1.05), SKIN, {
      bone: head,
      at: eye,
      scale: R * 1.08,
      rotation: [-25, 0, 0],
      group: "head",
    });
    b.part(new THREE.SphereGeometry(1, 10, 3, 0, Math.PI * 2, 0, 0.5), SKIN, {
      bone: head,
      at: eye,
      scale: R * 1.05,
      rotation: [155, 0, 0],
      group: "head",
    });
    const lash = [
      [-46, 6],
      [-22, 24],
      [12, 27],
      [44, 12],
    ].map(([phi, theta]) => {
      const p = (phi * Math.PI) / 180;
      const t = (theta * Math.PI) / 180;
      return eye
        .clone()
        .add(V(s * R * 1.1 * Math.cos(t) * Math.sin(p), R * 1.1 * Math.sin(t), R * 1.1 * Math.cos(t) * Math.cos(p)));
    });
    b.sweep(catmull(lash), [0.0011, 0.0018], { bone: head, color: PUPIL, sides: 4, group: "head" });
    // eyebrow: slim and arched
    b.sweep(
      catmull([
        [s * 0.011, 1.64, 0.077],
        [s * 0.03, 1.646, 0.075],
        [s * 0.05, 1.641, 0.064],
      ]),
      [0.0046, 0.0032],
      { bone: head, color: BROW, sides: 5, group: "head" },
    );
  }
  // mouth: fuller lips, upper on the head, lower on the jaw, a dark seam between
  b.sweep(
    catmull([
      [-0.023, 1.53, 0.066],
      [-0.011, 1.5345, 0.075],
      [0, 1.5325, 0.0765],
      [0.011, 1.5345, 0.075],
      [0.023, 1.53, 0.066],
    ]),
    0.0045,
    { bone: head, color: LIP, sides: 6, group: "head" },
  );
  b.sweep(
    catmull([
      [-0.02, 1.52, 0.068],
      [0, 1.518, 0.0755],
      [0.02, 1.52, 0.068],
    ]),
    0.0056,
    { bone: jaw, color: LIP, sides: 6, group: "head" },
  );
  b.sweep(
    catmull([
      [-0.025, 1.527, 0.064],
      [0, 1.5245, 0.0735],
      [0.025, 1.527, 0.064],
    ]),
    0.002,
    { bone: jaw, color: "#8a3440", sides: 4, group: "head" },
  );

  // ---- hair: a smooth cap pulled back, and a high ponytail on its own joints ---------------------------------------
  b.part(new THREE.SphereGeometry(1, 16, 9, 0, Math.PI * 2, 0, 1.85), HAIR, {
    bone: head,
    at: [0, 1.625, -0.013],
    scale: [0.074, 0.078, 0.096],
    rotation: [-16, 0, 0],
    group: "hair",
  });
  const tail = b.chain(
    "ponytailChain",
    catmull([
      [0, 1.668, -0.078],
      [0, 1.7, -0.118],
      [0, 1.69, -0.178],
      [0, 1.63, -0.215],
      [0, 1.52, -0.208],
    ]),
    { parent: head, names: [1, 2, 3, 4].map((i) => `ponytail${i}`), up: [0, 0, 1], role: "tail" },
  );
  b.sweep(tail, [0.02, 0.026, 0.03, 0.024, 0.017, 0.005], {
    color: HAIR,
    sides: 10,
    caps: { start: "round", end: "point" },
    group: "hair",
  });
  // hair tie
  b.part(new THREE.TorusGeometry(0.02, 0.0055, 6, 12), TOP, {
    bone: tail.joints[0],
    at: V(0, 1.677, -0.089),
    dir: [0, 0.6, -0.8],
    axis: "z",
    group: "hair",
  });

  // ---- crop top with cups and straps, race bib, briefs waistband --------------------------------------------------
  const TT0 = 1.15;
  const TT1 = 1.305;
  const topAt = (t: number) => torsoAt(TT0 + t * (TT1 - TT0));
  b.sweep(
    catmull([
      [0, TT0, 0],
      [0, 1.23, 0],
      [0, TT1, 0],
    ]),
    (t) => {
      const [rx, ry] = topAt(t);
      return [rx + 0.006, ry + 0.006];
    },
    {
      shift: (t) => shf(topAt(t)),
      bone: [hips, spine, neck],
      caps: "flat",
      bands: [
        [0.12, TOP_TRIM],
        [1, TOP],
      ],
      sides: 16,
      up: [0, 0, 1],
      group: "top",
    },
  );
  for (const s of [1, -1]) {
    onSkin(skin, [s * 0.066, 1.235, 0.6], [0, 0, -1], lump(0.06, 0.04, 0.058, 12, 8), TOP, {
      embed: 0.3,
      flow: [0, -1, 0],
      group: "top",
    });
    b.sweep(
      skin.drape(
        catmull([
          [s * 0.052, 1.285, 0.09],
          [s * 0.085, 1.372, 0.012],
          [s * 0.06, 1.29, -0.085],
        ]),
        { lift: 0.004 },
      ),
      [0.011, 0.0035],
      { bone: spine2, color: TOP, section: "box", sides: 4, group: "top" },
    );
  }
  // bib: a shallow curved sheet with the drawing on it, and four pins
  const bibR = 0.12;
  const bibZ = 0.152 - bibR;
  b.part(new THREE.CylinderGeometry(bibR, bibR, 0.105, 14, 1, true, -0.58, 1.16), "#ffffff", {
    bone: spine2,
    at: [0, 1.225, bibZ],
    texture: BIB,
    group: "bib",
  });
  for (const [x, y] of [
    [-0.06, 1.267],
    [0.06, 1.267],
    [-0.06, 1.183],
    [0.06, 1.183],
  ])
    b.part(ball(6, 4), SPIKE, {
      bone: spine2,
      at: [x, y, bibZ + Math.sqrt(bibR * bibR - x * x) + 0.001],
      scale: 0.0045,
      group: "bib",
    });
  const BT0 = 0.8;
  const BT1 = 0.96;
  const briefAt = (t: number) => torsoAt(BT0 + t * (BT1 - BT0));
  b.sweep(
    catmull([
      [0, BT0, 0],
      [0, 0.88, 0],
      [0, BT1, 0],
    ]),
    (t) => {
      const [rx, ry] = briefAt(t);
      return [rx + 0.006, ry + 0.006];
    },
    {
      shift: (t) => shf(briefAt(t)),
      bone: [hips, spine, neck],
      bands: [
        [0.86, BRIEF],
        [1, TOP_TRIM],
      ],
      sides: 16,
      up: [0, 0, 1],
      group: "briefs",
    },
  );
  for (const s of [1, -1])
    b.part(ball(10, 8), BRIEF, {
      bone: hips,
      at: [s * 0.064, 0.842, -0.05],
      scale: [0.088, 0.094, 0.085],
      group: "briefs",
    });

  return b.root;
}
