// Red lionfish (Pterois volitans), about 0.4 m from snout to tail tip, hovering with its lowest point
// (the belly) 0.25 m above the floor. A swimming rest pose: body level, pectoral fans spread to the
// sides, the thirteen venomous dorsal spines raised with frayed webs between them, feathery
// tentacles over the eyes, and the lower jaw as its own bone slightly agape. The body, tail and
// head are one smooth skin over the spine and tail chains, painted with bold red-brown and white
// vertical bands; the pectoral fans are thirteen spiny rays each with spotted webs between them,
// and the rounded caudal fin is a rayed extrude.
import { SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { offset, rng, vec } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { catmull, polyline } from "../src/path";
import type { Path } from "../src/path";
import type { Joint } from "../src/skeleton";
import { mix, noise, paint, smoothstep, spots } from "../src/paint";

export const meta = {
  name: "Red Lionfish · Ox",
  builtBy: "GLM 5.3 Flash",
  description:
    "A 0.4 m red lionfish hovering 0.25 m up: bold red-brown and white vertical bands, thirteen raised venomous dorsal spines with frayed webs, large fan-shaped pectoral fins of spiny rays and spotted membranes, feathery brow tentacles, a separate lower jaw and a rounded rayed tail fin.",
};

const RED = "#a03a22"; // the bold red-brown of the bands
const DARKRED = "#5e1c10"; // back, spine tips, shade
const WHITE = "#f2e7d4"; // the white stripes and webs
const CREAM = "#f4ecdc"; // belly
const WEB = "#e8cab9"; // dorsal web between the spines
const JAWC = "#c47a56"; // lower jaw
const DARK = "#2c120a"; // mouth, gill slit, eye bar shade
const EYE = "#180b06";
const GLINT = "#faf6ec";
const TIP = "#3f150e"; // venomous dark spine tips

/** Piecewise cosine interpolation through `[x, y]` keys sorted by x. */
function curve(keys: readonly (readonly [number, number])[]) {
  return (x: number) => {
    if (x <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [x1, y1] = keys[i];
      if (x <= x1) {
        const [x0, y0] = keys[i - 1];
        const u = (1 - Math.cos((Math.PI * (x - x0)) / (x1 - x0))) / 2;
        return y0 + (y1 - y0) * u;
      }
    }
    return keys[keys.length - 1][1];
  };
}

type Tup = readonly [number, number, number];
const norm = (v: readonly number[]): Tup => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const tup = (v: V3): Tup => {
  const q = vec(v);
  return [q.x, q.y, q.z];
};
const lerp3 = (a: Tup, b: Tup, t: number): Tup => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export default function build() {
  const b = createBuilder({ name: "redLionfishOx" });
  const random = rng(21);

  // ---------------------------------------------------------------- Skeleton
  // The spine axis runs level at Y0; the snout reaches z = 0.19, the peduncle ends z = -0.178.
  const Y0 = 0.306;
  const root = b.joint("root", { at: [0, Y0, 0], group: "body" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, Y0, 0.02],
      [0, Y0, 0.075],
      [0, Y0, 0.125],
      [0, Y0, 0.155],
    ]),
    { parent: root, names: ["spine1", "spine2", "spine3"], role: "spine", group: "body" },
  );
  const tail = b.chain(
    "tail",
    polyline([
      [0, Y0, -0.02],
      [0, Y0, -0.075],
      [0, Y0, -0.125],
      [0, Y0, -0.165],
    ]),
    { parent: root, names: ["tail1", "tail2", "tail3", "caudal"], role: "tail", group: "tail" },
  );
  const caudal = tail.tip;
  if (!caudal) throw new Error("redLionfishOx: tail chain has no tip");
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, Y0 + 0.004, 0.15],
    dir: [0, 0.18, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, Y0 - 0.04, 0.128],
    aim: [0, Y0 - 0.026, 0.185],
    role: "jaw",
    group: "jaw",
  });

  // ---------------------------------------------------------------- Body and head
  // One curve runs from the tail peduncle through the spine and into the blunt snout; half-height and
  // half-width are keyed by z. The deepest belly (halfH 0.056) sits exactly at 0.25 above the floor.
  const bodyPath = catmull([
    [0, Y0, -0.178],
    [0, Y0, -0.14],
    [0, Y0, -0.09],
    [0, Y0, -0.035],
    [0, Y0, 0.02],
    [0, Y0, 0.075],
    [0, Y0, 0.125],
    [0, Y0 + 0.002, 0.155],
    [0, Y0 + 0.002, 0.172],
    [0, Y0 - 0.004, 0.184],
  ]);
  const halfH = curve([
    [-0.178, 0.013],
    [-0.125, 0.024],
    [-0.075, 0.04],
    [-0.02, 0.052],
    [0.03, 0.056],
    [0.08, 0.055],
    [0.12, 0.05],
    [0.155, 0.034],
    [0.181, 0.018],
  ]);
  const halfW = curve([
    [-0.178, 0.009],
    [-0.125, 0.016],
    [-0.075, 0.028],
    [-0.02, 0.037],
    [0.03, 0.04],
    [0.08, 0.039],
    [0.12, 0.034],
    [0.155, 0.024],
    [0.181, 0.011],
  ]);

  // Bold red-brown vertical bands on white, five of them (one through the eye), with red mottling on
  // the white, a pale belly and a darker back.
  const BANDS = [0.155, 0.075, 0.0, -0.07, -0.14];
  const skin = paint((p, n) => {
    const z = p.z + (noise(p, 0.07, 5) - 0.5) * 0.02;
    let k = 1; // 1 = white, 0 = red band
    for (const c of BANDS) k = Math.min(k, smoothstep(0.014, 0.024, Math.abs(z - c)));
    let col = mix(RED, WHITE, k);
    col = mix(col, RED, smoothstep(0.6, 0.8, noise(p, 0.016, 9)) * 0.45 * k); // red mottling on white
    col = mix(col, CREAM, smoothstep(0.2, 0.6, -n.y) * 0.8); // pale belly
    col = mix(col, DARKRED, smoothstep(0.45, 0.9, n.y) * 0.45); // darker back
    return col;
  });

  const bodyTube = b.sweep(
    bodyPath,
    (u) => {
      const z = bodyPath.at(u).z;
      return [halfW(z), halfH(z)];
    },
    {
      bone: [tail, root, spine, head],
      color: skin,
      sides: 12,
      caps: "round",
      group: "body",
      name: "body",
    },
  );
  const skinSurface = b.surface(bodyTube);

  // Lower jaw: its own bone, a flattened wedge ending just short of the snout so the mouth hangs slightly open.
  b.sweep([jaw, [0, Y0 - 0.027, 0.186]], (t) => [0.018 * (1 - t) + 0.004, 0.01 * (1 - t) + 0.002], {
    bone: jaw,
    color: JAWC,
    bands: [[0.55, CREAM]],
    caps: { start: "round", end: "point" },
    sides: 8,
    group: "jaw",
    name: "lowerJaw",
  });
  // Dark interior of the mouth, visible in the gap.
  b.sweep(
    polyline([
      [0, Y0 - 0.024, 0.16],
      [0, Y0 - 0.019, 0.186],
    ]),
    0.006,
    { bone: head, color: DARK, sides: 5, group: "head", name: "mouth" },
  );

  for (const s of [1, -1]) {
    // Eye: a large dark ball proud of the cheek, with a glint, sitting in the front red band.
    const eyeHit = skinSurface.ray([s * 0.5, Y0 + 0.022, 0.132], [-s, 0, 0]);
    if (!eyeHit) throw new Error("redLionfishOx: eye ray missed the head");
    const eyeAt = offset(eyeHit.at, eyeHit.n, 0.006);
    b.part(new SphereGeometry(0.013, 8, 6), EYE, { bone: head, at: eyeAt, group: "head", name: `eye${s > 0 ? "L" : "R"}` });
    b.part(new SphereGeometry(0.0026, 5, 4), GLINT, {
      bone: head,
      at: offset(eyeAt, norm([s * 0.5, 0.35, 0.6]), 0.011),
      group: "head",
    });

    // Feathery tentacle above the eye: one tapered strand with tiny side branches.
    const brow = skinSurface.nearest([s * 0.024, Y0 + 0.055, 0.126]);
    const strand = catmull([brow.at, offset(brow.at, norm([s * 0.45, 0.85, 0.28]), 0.026), offset(brow.at, norm([s * 0.2, 0.9, 0.38]), 0.046)]);
    b.sweep(strand, [0.0026, 0.0006], {
      bone: head,
      color: RED,
      bands: [[0.65, WHITE]],
      caps: { start: "flat", end: "point" },
      sides: 5,
      group: "head",
      name: `tentacle${s > 0 ? "L" : "R"}`,
    });
    b.along(strand, 4, (at) => {
      const i = Math.round(at.t * 3);
      const side = i % 2 === 0 ? 1 : -1;
      b.rod(at.at, offset(at.at, norm([s * 0.55, 0.45, side * 0.7]), 0.009 + 0.003 * random()), 0.0008, {
        bone: head,
        color: RED,
        sides: 4,
        group: "head",
      });
    });

    // Head spikes: a short supraorbital spine behind the tentacle and two preopercular cheek spines.
    b.spike(skinSurface.nearest([s * 0.02, Y0 + 0.052, 0.108]), norm([s * 0.35, 0.85, 0.4]), 0.026, 0.0032, {
      bone: head,
      color: RED,
      sides: 5,
      group: "head",
    });
    b.spike(skinSurface.nearest([s * 0.036, Y0 - 0.018, 0.088]), norm([s * 0.5, -0.25, -0.82]), 0.022, 0.0028, {
      bone: head,
      color: RED,
      sides: 5,
      group: "head",
    });
    b.spike(skinSurface.nearest([s * 0.038, Y0 - 0.036, 0.07]), norm([s * 0.55, -0.45, -0.7]), 0.019, 0.0024, {
      bone: head,
      color: RED,
      sides: 5,
      group: "head",
    });

    // Gill slit: a dark curve draped on the cheek behind the head.
    const gill = skinSurface.drape(
      catmull([
        [s * 0.03, Y0 + 0.036, 0.062],
        [s * 0.044, Y0 + 0.004, 0.048],
        [s * 0.036, Y0 - 0.032, 0.056],
      ]),
      { lift: 0.0015 },
    );
    b.sweep(gill, 0.0022, { bone: head, color: DARK, sides: 4, group: "head", name: `gill${s > 0 ? "L" : "R"}` });
  }

  // ---------------------------------------------------------------- Dorsal spines
  // Thirteen venomous spines along the back, each a tapered sweep with a white warning band and a dark
  // tip; frayed webs connect the neighbours up to about half their height.
  const spineLen = curve([
    [0.09, 0.082],
    [0.02, 0.085],
    [-0.06, 0.07],
    [-0.11, 0.056],
    [-0.148, 0.046],
  ]);
  const spineDir = norm([0, 0.94, -0.34]);
  const spineZ: number[] = [];
  const spinePaths: Path[] = [];
  const spineBones: (Joint | null)[] = [];
  for (let i = 0; i < 13; i++) spineZ.push(0.09 - (i / 12) * 0.238);
  for (const z of spineZ) {
    const base = skinSurface.nearest([0, Y0 + halfH(z) + 0.012, z]);
    const L = spineLen(z);
    const tip = [
      base.at.x + spineDir[0] * L,
      base.at.y + spineDir[1] * L - 0.004,
      base.at.z + spineDir[2] * L - 0.004,
    ];
    const path = catmull([base.at, offset(base.at, spineDir, L * 0.55), tip]);
    spinePaths.push(path);
    spineBones.push(base.bone as typeof root);
    b.sweep(path, [0.0042, 0.0011], {
      bone: base.bone,
      color: RED,
      bands: [
        [0.28, WHITE],
        [0.62, RED],
        [1, TIP],
      ],
      caps: { start: "flat", end: "point" },
      sides: 5,
      group: "dorsal",
      name: `dorsalSpine${spinePaths.length}`,
    });
  }
  for (let i = 0; i + 1 < spinePaths.length; i++)
    b.membrane(spinePaths[i].slice(0, 0.72), spinePaths[i + 1].slice(0, 0.72), {
      thickness: 0.0016,
      color: WEB,
      scallop: 0.32,
      detail: 0.5,
      bone: spineBones[i] ?? undefined,
      group: "dorsal",
      name: `dorsalWeb${i + 1}`,
    });

  // ---------------------------------------------------------------- Pectoral fans
  // The lionfish signature: thirteen separated spiny rays per side fanning out of the flank, spotted
  // webs stretched between neighbours. Rays start buried in the body and curl back at the tips.
  const webPaint = spots(WHITE, RED, { size: 0.014, amount: 0.28, seed: 6 });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const finJoint = b.joint(`pectoral${side}`, {
      parent: spine.joints[1],
      at: [s * 0.042, Y0 - 0.004, 0.072],
      dir: [s * 0.85, -0.15, -0.5],
      role: "fan",
      group: `pectoral${side}`,
    });
    const frontDir = norm([s * 0.35, 0.8, 0.35]);
    const backDir = norm([s * 0.55, -0.35, -0.75]);
    const rayPaths: Path[] = [];
    for (let k = 0; k < 13; k++) {
      const t = k / 12;
      const d = norm(lerp3(frontDir, backDir, t));
      const L = 0.105 + 0.055 * Math.sin(Math.PI * (0.12 + 0.76 * t));
      const B = tup(finJoint.at);
      const base = lerp3(B, d, -0.016);
      const mid = offset(base, d, L * 0.45);
      const tip: V3 = [base[0] + d[0] * L, base[1] + d[1] * L - 0.009 * t, base[2] + d[2] * L - 0.016 * t];
      const path = catmull([base, mid, tip]);
      rayPaths.push(path);
      const even = k % 2 === 0;
      b.sweep(path, [0.0038, 0.001], {
        bone: finJoint,
        color: even ? RED : WHITE,
        bands: even ? [[0.45, WHITE], [0.8, RED]] : [[0.45, RED], [0.8, WHITE]],
        caps: { start: "flat", end: "point" },
        sides: 5,
        group: `pectoral${side}`,
        name: `pectoralRay${side}${k + 1}`,
      });
    }
    for (let k = 0; k + 1 < rayPaths.length; k++)
      b.membrane(rayPaths[k].slice(0.08, 0.97), rayPaths[k + 1].slice(0.08, 0.97), {
        thickness: 0.001,
        color: webPaint,
        scallop: 0.1,
        detail: 0.5,
        bone: finJoint,
        group: `pectoral${side}`,
        name: `pectoralWeb${side}${k + 1}`,
      });
  }

  // ---------------------------------------------------------------- Tail fin
  // A rounded caudal fan, rayed, banded by the same skin paint where it crosses the peduncle.
  const caudalOutline: OutlinePoint[] = [
    [0.012, 0.018],
    [0.013, 0.036],
    [0.028, 0.047],
    [0.05, 0.043],
    [0.061, 0.026],
    [0.065, 0.002],
    [0.061, -0.024],
    [0.05, -0.041],
    [0.028, -0.045],
    [0.013, -0.034],
    [0.012, -0.018],
  ];
  const caudalFin = b.extrude(caudalOutline, {
    at: caudal,
    bone: caudal,
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.008,
    bevel: 0.0025,
    smoothing: 1,
    detail: 0.5,
    color: skin,
    group: "tail",
    name: "caudalFin",
  });
  for (let k = 0; k < 5; k++) {
    const v = 0.03 - (k / 4) * 0.06;
    const even = k % 2 === 0;
    for (const side of [1, -1])
      b.rod(
        caudalFin.local([0.006, v * 0.3, side * 0.004]),
        caudalFin.local([0.052, v, side * 0.004]),
        [0.0018, 0.0006],
        { bone: caudal, color: even ? RED : WHITE, sides: 4, group: "tail" },
      );
  }

  return b.root;
}