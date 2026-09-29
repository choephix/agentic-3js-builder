// Taisho Sanke koi (Cyprinus rubrofuscus), 70 cm from snout to tail tips.
// A swimming rest pose laid straight: one smooth skin runs from the tail base through the spine into the head.
// The white-red-black Sanke pattern is one paint in meters, and about a thousand scale cards read it at their roots,
// so the red and black edges step along the scale rows like a real koi's kiwa. Fins are painted with their rays,
// the pectorals carry black tejima stripes, and the eyes are SVG-drawn domes.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { rng, vec } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { ColorInput } from "../src/paint";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Koi Carp",
  builtBy: "Claude Opus 5.5",
  description:
    "A 70 cm Taisho Sanke koi in a straight swimming rest pose: snow-white body under stepped red hi and black sumi, a thousand scale cards that carry the pattern, rayed fins with black tejima stripes, thick lips over a separate lower jaw, two pairs of barbels and gold-ringed eyes.",
};

const WHITE = "#f6f3ec";
const BELLY = "#ebe4d8";
const HI = "#d4381e";
const HI_DEEP = "#b8240f";
const SUMI = "#15151a";
const LIP = "#e7b8a4";
const BARBEL = "#eac7b2";
const MOUTH = "#3a1c1c";
const FIN_ROOT = "#f4f0e8";
const FIN_WEB = "#d0d5d9";
const FIN_RAY = "#fbf9f4";
const GILL = "#b99a8e";
const NOSTRIL = "#4a2e2b";
const GLINT = "#ffffff";

/** Piecewise cosine interpolation through `[x, y]` keys sorted by x. */
function curve(keys: readonly (readonly [number, number])[]) {
  return (x: number) => {
    if (x <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [x1, y1] = keys[i];
      if (x <= x1) {
        const [x0, y0] = keys[i - 1];
        const s = (1 - Math.cos(((x - x0) / (x1 - x0)) * Math.PI)) / 2;
        return y0 + (y1 - y0) * s;
      }
    }
    return keys[keys.length - 1][1];
  };
}

/** In-plane coordinates `[u, v]` of a point on the plane through `at` spanned by `x` and (orthogonalised) `y`. */
function planar(at: V3, x: V3, y: V3) {
  const o = vec(at);
  const X = vec(x).normalize();
  const Y = vec(y).addScaledVector(X, -vec(y).dot(X)).normalize();
  const d = new Vector3();
  return (p: Vector3): [number, number] => {
    d.subVectors(p, o);
    return [d.dot(X), d.dot(Y)];
  };
}

// A scale: square at its covered root (the drawing's bottom), rounded where it shows, with a grey rim line.
const SCALE = svg(
  `<svg viewBox="0 0 64 64">
    <defs>
      <radialGradient id="g" cx="32" cy="64" r="64" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#e2e2e2"/>
        <stop offset="0.55" stop-color="#f6f6f6"/>
        <stop offset="0.86" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#ececec"/>
      </radialGradient>
    </defs>
    <path d="M3 64 L3 31 A29 29 0 0 1 61 31 L61 64 Z" fill="url(#g)"/>
    <path d="M6.5 31 A25.5 25.5 0 0 1 57.5 31" fill="none" stroke="#b4b0ac" stroke-width="2.6"/>
  </svg>`,
  { size: 128 },
);

// The eye as a lat-long map for a dome (pole to 90°) that looks out: pupil in the top rows, a gold fibred iris, a
// dark rim where the dome meets the orbit.
const EYE = svg(
  `<svg viewBox="0 0 128 64">
    <defs>
      <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6b4a12"/>
        <stop offset="0.35" stop-color="#d8ab44"/>
        <stop offset="0.75" stop-color="#efd489"/>
        <stop offset="1" stop-color="#9c7a3c"/>
      </linearGradient>
      <pattern id="fibre" width="6" height="64" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="1.4" height="64" fill="#7a5418" opacity="0.45"/>
        <rect x="3" y="0" width="0.9" height="64" fill="#fff4cf" opacity="0.4"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="128" height="64" fill="#1b1612"/>
    <rect x="0" y="14" width="128" height="24" fill="url(#iris)"/>
    <rect x="0" y="14" width="128" height="24" fill="url(#fibre)"/>
    <rect x="0" y="0" width="128" height="14.5" fill="#050507"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "koiCarp" });
  const random = rng(23);

  // ---------------------------------------------------------------- Profile
  // The spine axis runs level at Y0 from the tail base (z = -0.30) to the snout (z = 0.285, tip 0.305 with its cap);
  // the caudal fin reaches z = -0.40.
  const Y0 = 0.105;
  const NOSE_Z = 0.285;
  const TAIL_Z = -0.3;
  const NECK_Z = 0.19;
  const halfH = curve([
    [TAIL_Z, 0.01],
    [-0.285, 0.02],
    [-0.265, 0.026],
    [-0.245, 0.027],
    [-0.22, 0.032],
    [-0.18, 0.044],
    [-0.13, 0.058],
    [-0.07, 0.071],
    [0.0, 0.08],
    [0.06, 0.084],
    [0.12, 0.081],
    [0.17, 0.073],
    [0.21, 0.062],
    [0.245, 0.048],
    [0.27, 0.034],
    [NOSE_Z, 0.022],
  ]);
  const halfW = curve([
    [TAIL_Z, 0.004],
    [-0.285, 0.007],
    [-0.265, 0.011],
    [-0.245, 0.015],
    [-0.22, 0.019],
    [-0.18, 0.027],
    [-0.13, 0.036],
    [-0.07, 0.046],
    [0.0, 0.054],
    [0.06, 0.058],
    [0.12, 0.059],
    [0.17, 0.056],
    [0.21, 0.05],
    [0.245, 0.041],
    [0.27, 0.031],
    [NOSE_Z, 0.022],
  ]);
  const drop = curve([
    [-0.2, 0],
    [0.0, -0.004],
    [0.19, -0.004],
    [0.25, -0.008],
    [NOSE_Z, -0.012],
  ]);
  const cy = (z: number) => Y0 + drop(z);
  const centre = (z: number): V3 => [0, cy(z), z];
  const dorsalY = (z: number) => cy(z) + halfH(z);
  const bellyY = (z: number) => cy(z) - halfH(z);

  // ---------------------------------------------------------------- Skeleton
  const jointZ = [NECK_Z, 0.11, 0.03, -0.05, -0.13, -0.2, -0.255];
  const root = b.joint("root", { at: centre(NECK_Z), role: "spine", group: "body" });
  const spine = b.chain("spine", polyline([...jointZ, TAIL_Z].map(centre)), {
    parent: root,
    names: ["spine1", "spine2", "spine3", "tail1", "tail2", "tail3", "caudal"],
    role: "spine",
    group: "body",
  });
  const [spine1, , spine3, , , , caudal] = spine.joints;
  const head = b.joint("head", { parent: root, at: centre(NECK_Z), dir: [0, 0, 1], role: "head", group: "head" });
  const JAW_AT: V3 = [0, cy(0.262) - 0.028, 0.262];
  const JAW_TIP: V3 = [0, cy(0.298) - 0.037, 0.298];
  const jaw = b.joint("jaw", { parent: head, at: JAW_AT, aim: JAW_TIP, role: "jaw", group: "jaw" });

  // ---------------------------------------------------------------- Sanke pattern
  // `d` runs from -1 at the belly line to 1 at the dorsal line. Each hi patch is an ellipse in (z, d) that reaches
  // down the flank to `reach`, a little further on one side; sumi blots sit on the white and on the red.
  type Patch = { z: number; half: number; reach: number; skew: number; tilt: number };
  const PATCHES: Patch[] = [
    { z: 0.233, half: 0.046, reach: 0.42, skew: 0, tilt: 0 }, // head, leaving a white nose and cheeks
    { z: 0.118, half: 0.052, reach: -0.18, skew: 0.006, tilt: 0.12 },
    { z: -0.005, half: 0.045, reach: 0.02, skew: -0.01, tilt: -0.22 },
    { z: -0.135, half: 0.052, reach: 0.3, skew: 0.008, tilt: 0.15 },
  ];
  type Blot = { z: number; d: number; side: number; r: number };
  const BLOTS: Blot[] = [
    { z: 0.135, d: 0.72, side: 1, r: 0.024 },
    { z: 0.07, d: 0.3, side: -1, r: 0.018 },
    { z: 0.052, d: 0.98, side: 0, r: 0.02 },
    { z: -0.045, d: 0.5, side: 1, r: 0.026 },
    { z: -0.105, d: 0.95, side: 0, r: 0.017 },
    { z: -0.18, d: 0.6, side: -1, r: 0.016 },
  ];
  const skin = paint((p) => {
    const z = p.z;
    const h = halfH(z);
    const d = (p.y - cy(z)) / h;
    const s = p.x >= 0 ? 1 : -1;
    const wz = z + 0.016 * (noise(p, 0.035, 3) - 0.5);
    const wd = d + 0.26 * (noise(p, 0.03, 5) - 0.5);
    for (const blot of BLOTS) {
      if (blot.side !== 0 && blot.side !== s) continue;
      const dz = (wz - blot.z) / blot.r;
      const dd = ((wd - blot.d) * h) / (blot.r * 0.85);
      if (dz * dz + dd * dd < 1) return SUMI;
    }
    for (const patch of PATCHES) {
      const u = (wz - (patch.z + s * patch.skew)) / patch.half;
      if (Math.abs(u) >= 1) continue;
      const reach = patch.reach + s * patch.tilt;
      if (wd > 1 - (1 - reach) * Math.sqrt(1 - u * u)) return mix(HI, HI_DEEP, noise(p, 0.05, 9));
    }
    return mix(WHITE, BELLY, smoothstep(0.1, -0.8, d));
  });

  // ---------------------------------------------------------------- Body and head
  const bodyPath = catmull([centre(TAIL_Z), ...jointZ.slice().reverse().map(centre), centre(0.24), centre(NOSE_Z)]);
  const body = b.sweep(
    bodyPath,
    (t) => {
      const z = bodyPath.at(t).z;
      return [halfW(z), halfH(z)];
    },
    {
      bone: [spine, head],
      color: skin,
      sides: 12,
      caps: { start: "round", end: "round" },
      group: "body",
    },
  );
  const bodySurface = b.surface(body);
  const side = (z: number, d: number, s: number) => {
    const hit = bodySurface.ray([s * 0.3, cy(z) + d * halfH(z), z], [-s, 0, 0]);
    if (!hit) throw new Error(`koi: side ray missed the body at z=${z}, d=${d}`);
    return hit;
  };

  // Gill slit: the operculum's back edge, bowed backward, from the shoulder down under the throat.
  const gillZ = (d: number) => NECK_Z + 0.006 - 0.022 * Math.cos((d * Math.PI) / 2.2);

  // ---------------------------------------------------------------- Scales
  // Rows of scale cards run from behind the gill slit to the tail base, spaced evenly around the body by arc length
  // and offset by half a scale on every other row. Each lies almost flat, tipped up at its free edge. Rows lose
  // scales toward the tail (24 around the shoulder, 12 on the peduncle) so the scales shrink less than the body.
  let z = NECK_Z - 0.004;
  let row = 0;
  while (z > -0.276) {
    const t = bodyPath.closestT(centre(z));
    const ring = Array.from({ length: 121 }, (_, k) => body.at(t, k * 3).at.clone());
    const cum = [0];
    for (let k = 1; k < ring.length; k++) cum.push(cum[k - 1] + ring[k].distanceTo(ring[k - 1]));
    const perimeter = cum[cum.length - 1];
    const around = Math.min(24, Math.max(12, Math.round(perimeter / 0.0185)));
    const spacing = perimeter / around;
    const frames = [];
    for (let j = 0; j < around; j++) {
      const target = ((j + (row % 2) * 0.5) / around) * perimeter;
      let k = 1;
      while (k < cum.length - 1 && cum[k] < target) k++;
      const angle = (k - 1 + (target - cum[k - 1]) / Math.max(cum[k] - cum[k - 1], 1e-9)) * 3;
      const f = body.at(t, angle);
      const d = (f.at.y - cy(z)) / halfH(z);
      if (z > gillZ(Math.max(-1, Math.min(1, d))) - 0.006) continue;
      frames.push(f);
    }
    if (frames.length)
      b.cards(frames, SCALE, {
        size: [spacing * 1.06, spacing * 1.0],
        lean: 84,
        flow: [0, 0, -1],
        vary: 0.05,
        spin: 3,
        rng: random,
        color: skin,
        sink: 0.05,
        group: "scales",
        name: `scales${row + 1}`,
      });
    z -= spacing * 0.56;
    row++;
  }

  // Gill slit line, cast in from the side so it lies on the cheek.
  for (const s of [1, -1]) {
    const slit = Array.from({ length: 11 }, (_, i) => {
      const d = 0.72 - (1.6 * i) / 10;
      return side(gillZ(d), d, s);
    });
    // In short pieces: a single low-sided tube takes a ring only every 72° of bend, and its chords would sink
    // into the cheek.
    const line = bodySurface.drape(catmull(slit));
    for (let i = 0; i < 8; i++)
      b.sweep(line.slice(i / 8, (i + 1) / 8), 0.0012, { bone: head, color: GILL, sides: 5, group: "head" });
  }

  // ---------------------------------------------------------------- Mouth
  // A round mouth under the snout: an arched upper lip on the head, and a flattened lower jaw on its own bone with a
  // cupped lower lip, both around a dark mouth. `m` is the snout's centre height.
  const m = cy(NOSE_Z);
  b.sweep(
    catmull([
      [0.018, m - 0.024, 0.284],
      [0.013, m - 0.017, 0.296],
      [0, m - 0.014, 0.302],
      [-0.013, m - 0.017, 0.296],
      [-0.018, m - 0.024, 0.284],
    ]),
    0.005,
    { bone: head, color: LIP, sides: 6, group: "head" },
  );
  b.part(new SphereGeometry(1, 8, 5), MOUTH, {
    bone: head,
    at: [0, m - 0.024, 0.295],
    scale: [0.013, 0.008, 0.007],
    group: "head",
  });
  b.sweep([jaw, JAW_TIP], (t) => [0.018 - 0.005 * t, 0.006], {
    bone: jaw,
    color: skin,
    caps: { start: "round", end: "round" },
    group: "jaw",
  });
  b.sweep(
    catmull([
      [0.017, m - 0.026, 0.284],
      [0.011, m - 0.033, 0.297],
      [0, m - 0.036, 0.301],
      [-0.011, m - 0.033, 0.297],
      [-0.017, m - 0.026, 0.284],
    ]),
    0.0042,
    { bone: jaw, color: LIP, sides: 6, group: "jaw" },
  );

  for (const s of [1, -1]) {
    // Barbels: a short rostral pair on the upper lip and a longer maxillary pair hanging from the mouth corners.
    for (const [path, r] of [
      [
        [
          [s * 0.018, m - 0.025, 0.284],
          [s * 0.024, m - 0.032, 0.281],
          [s * 0.027, m - 0.044, 0.273],
        ],
        0.0017,
      ],
      [
        [
          [s * 0.012, m - 0.017, 0.298],
          [s * 0.017, m - 0.022, 0.303],
          [s * 0.019, m - 0.029, 0.305],
        ],
        0.0013,
      ],
    ] as const)
      b.sweep(catmull(path), [r, r * 0.4], {
        bone: head,
        color: BARBEL,
        caps: { start: "round", end: "round" },
        sides: 5,
        group: "head",
      });

    // Nostrils: a dark pit with a pale flap, ahead of each eye.
    for (const [nz, nd] of [
      [0.271, 0.42],
      [0.264, 0.46],
    ] as const) {
      const hit = side(nz, nd, s);
      b.stick(new SphereGeometry(0.0016, 5, 4), NOSTRIL, hit, { embed: 0.6, bone: head, group: "head" });
    }

    // Eye: a turned orbit rim in the skin's own paint, an SVG-mapped dome, and a catchlight.
    const eyeHit = side(0.247, 0.22, s);
    const gaze = eyeHit.n
      .clone()
      .add(new Vector3(0, 0.12, 0.2))
      .normalize();
    b.lathe(
      [
        [0.0068, -0.004],
        [0.0098, -0.004],
        [0.0098, 0.0005],
        [0.0084, 0.0022],
        [0.0068, 0.0012],
      ],
      { at: eyeHit, axis: gaze, bone: head, segments: 10, color: skin, group: "head" },
    );
    const EYE_R = 0.0072;
    // A dome from the pole to 90°, its drawing stretched over that span; starting a hair off the pole keeps its UVs
    // inside 0..1.
    const eye = b.part(new SphereGeometry(EYE_R, 12, 4, 0, Math.PI * 2, 1e-4, Math.PI / 2), "#ffffff", {
      bone: head,
      at: eyeHit.at.clone().addScaledVector(gaze, -0.5 * EYE_R),
      dir: gaze,
      texture: EYE,
      group: "head",
    });
    b.part(new SphereGeometry(0.0013, 4, 3), GLINT, {
      bone: head,
      at: eye.local([0.0022, 0.0048 + 0.5 * EYE_R - 0.0016, 0.0024]),
      group: "head",
    });
  }

  // ---------------------------------------------------------------- Fin paints
  /** Rays fanning from `focus` in a fin's plane: opaque white near the root, grey translucent web toward the rim. */
  const rayed = (
    uv: (p: Vector3) => [number, number],
    focus: [number, number],
    raysPerRadian: number,
    reach: number,
    stripe?: (ray: number, r: number, p: Vector3) => boolean,
  ) =>
    paint((p): ColorInput => {
      const [u, v] = uv(p);
      const du = u - focus[0];
      const dv = v - focus[1];
      const r = Math.hypot(du, dv);
      const k = Math.atan2(dv, du) * raysPerRadian;
      const off = Math.abs(k - Math.round(k));
      if (stripe && off < 0.4 && stripe(Math.round(k), r / reach, p)) return SUMI;
      const web = smoothstep(0.25, 1.0, r / reach);
      const ray = 1 - smoothstep(0.1, 0.24, off);
      return mix(mix(FIN_ROOT, FIN_WEB, web * 0.85), FIN_RAY, ray * (0.35 + 0.55 * web));
    });

  // ---------------------------------------------------------------- Paired fins
  for (const [s, sideName] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // Pectoral: a broad rounded paddle behind the gill slit, spread out and back, with black tejima rays.
    const pecAt: V3 = [s * 0.036, cy(0.168) - 0.052, 0.168];
    const pecDir: V3 = [s * 0.78, -0.34, -0.52];
    const pecUp: V3 = [0, 0.32, 1];
    const pectoral = b.joint(`pectoral${sideName}`, {
      parent: spine1,
      at: pecAt,
      dir: pecDir,
      role: "hinge",
      group: `pectoral${sideName}`,
    });
    const tejima = s > 0 ? [-3, -1, 2] : [-2, 1, 3];
    b.extrude(
      [
        [-0.004, -0.016],
        [-0.004, 0.016],
        [0.03, 0.036],
        [0.065, 0.044],
        [0.092, 0.034],
        [0.105, 0.01],
        [0.1, -0.016],
        [0.078, -0.032],
        [0.04, -0.03],
      ],
      {
        at: pecAt,
        bone: pectoral,
        x: pecDir,
        y: pecUp,
        thickness: 0.0035,
        bevel: 0.0012,
        smoothing: 1,
        detail: 0.34,
        color: rayed(
          planar(pecAt, pecDir, pecUp),
          [-0.012, 0],
          11,
          0.11,
          (ray, r, p) =>
            tejima.includes(ray) && r > 0.22 + 0.08 * noise(p, 0.01, ray + 20) && r < 0.72 + 0.1 * noise(p, 0.012, ray),
        ),
        group: `pectoral${sideName}`,
      },
    );

    // Pelvic: a smaller rounded fan under the belly, angled down and back until its rim meets the floor.
    const pelAt: V3 = [s * 0.022, bellyY(-0.035) + 0.012, -0.035];
    const pelTip: V3 = [s * 0.062, 0.004, -0.095];
    const pelvic = b.joint(`pelvic${sideName}`, {
      parent: spine3,
      at: pelAt,
      aim: pelTip,
      role: "hinge",
      group: `pelvic${sideName}`,
    });
    const pelUp: V3 = [s * 0.25, 0.1, 1];
    const pelReach = pelvic.at.distanceTo(vec(pelTip));
    b.extrude(
      [
        [-0.002, -0.011],
        [-0.002, 0.011],
        [pelReach * 0.45, 0.024],
        [pelReach * 0.85, 0.02],
        [pelReach, 0.004],
        [pelReach * 0.92, -0.012],
        [pelReach * 0.5, -0.017],
      ],
      {
        at: pelAt,
        bone: pelvic,
        x: pelvic,
        y: pelUp,
        thickness: 0.003,
        bevel: 0.001,
        smoothing: 1,
        detail: 0.34,
        color: rayed(
          planar(pelAt, vec(pelTip).sub(vec(pelAt)).toArray() as V3, pelUp),
          [-0.01, 0],
          12,
          pelReach + 0.01,
        ),
        group: `pelvic${sideName}`,
      },
    );
  }

  // ---------------------------------------------------------------- Median fins
  // Dorsal: a long fin from above the pelvics nearly to the peduncle, tall at its spine and falling away behind.
  // It is a membrane between a line on the back and a drawn top edge, so it bends with the spine.
  const DORSAL_FRONT = 0.07;
  const DORSAL_BACK = -0.135;
  const topLine = body.line(0, -0.004);
  const dorsalBase = topLine.slice(
    topLine.closestT([0, dorsalY(DORSAL_FRONT), DORSAL_FRONT]),
    topLine.closestT([0, dorsalY(DORSAL_BACK), DORSAL_BACK]),
  );
  const dorsalTop = catmull(
    (
      [
        [DORSAL_FRONT - 0.004, 0.012],
        [0.052, 0.068],
        [0.035, 0.066],
        [0.0, 0.05],
        [-0.05, 0.038],
        [-0.1, 0.028],
        [DORSAL_BACK - 0.012, 0.012],
      ] as const
    ).map(([zz, h]): V3 => [0, dorsalY(zz) + h, zz]),
  );
  const dorsalHeight = curve([
    [DORSAL_BACK - 0.012, 0.012],
    [-0.1, 0.028],
    [-0.05, 0.038],
    [0.0, 0.05],
    [0.035, 0.066],
    [0.052, 0.068],
    [DORSAL_FRONT, 0.03],
  ]);
  const dorsalFin = b.membrane(dorsalBase, dorsalTop, {
    thickness: 0.003,
    bone: spine,
    cols: 16,
    color: paint((p): ColorInput => {
      const hf = Math.max(0, (p.y - dorsalY(p.z)) / dorsalHeight(p.z));
      const q = (p.z + (p.y - dorsalY(p.z)) * 0.55) / 0.0105;
      const off = Math.abs(q - Math.round(q));
      const web = smoothstep(0.2, 1.0, hf);
      const ray = 1 - smoothstep(0.1, 0.25, off);
      const lead = smoothstep(DORSAL_FRONT - 0.03, DORSAL_FRONT - 0.012, p.z + (p.y - dorsalY(p.z)) * 0.55);
      return mix(mix(mix(FIN_ROOT, FIN_WEB, web * 0.85), FIN_RAY, ray * (0.35 + 0.55 * web)), FIN_ROOT, lead);
    }),
    group: "dorsal",
  });
  // The leading spine: a stiffer, whiter ray up the fin's front edge. Draped on the fin, it takes the fin's weights
  // there, so it bends exactly as the fin does.
  b.sweep(
    b.surface(dorsalFin).drape(
      catmull([
        [0, dorsalY(DORSAL_FRONT) + 0.004, DORSAL_FRONT - 0.002],
        [0, dorsalY(0.06) + 0.04, 0.058],
        [0, dorsalY(0.052) + 0.066, 0.051],
      ]),
    ),
    [0.0026, 0.0009],
    { color: FIN_RAY, caps: { start: "round", end: "round" }, sides: 6, group: "dorsal" },
  );

  // Anal: a small rounded fin behind the vent.
  const ANAL_FRONT = -0.125;
  const ANAL_BACK = -0.185;
  const bellyLine = body.line(180, -0.004);
  const analBase = bellyLine.slice(
    bellyLine.closestT([0, bellyY(ANAL_FRONT), ANAL_FRONT]),
    bellyLine.closestT([0, bellyY(ANAL_BACK), ANAL_BACK]),
  );
  const analTip = catmull(
    (
      [
        [ANAL_FRONT - 0.004, -0.01],
        [-0.14, -0.046],
        [-0.162, -0.048],
        [-0.18, -0.03],
        [ANAL_BACK - 0.006, -0.008],
      ] as const
    ).map(([zz, h]): V3 => [0, bellyY(zz) + h, zz]),
  );
  b.membrane(analBase, analTip, {
    thickness: 0.003,
    bone: spine,
    cols: 12,
    color: paint((p): ColorInput => {
      const depth = Math.max(0, (bellyY(p.z) - p.y) / 0.048);
      const q = (p.z + (bellyY(p.z) - p.y) * 0.5) / 0.009;
      const off = Math.abs(q - Math.round(q));
      const web = smoothstep(0.2, 1.0, depth);
      return mix(mix(FIN_ROOT, FIN_WEB, web * 0.85), FIN_RAY, (1 - smoothstep(0.1, 0.25, off)) * (0.35 + 0.55 * web));
    }),
    group: "anal",
  });

  // Caudal: a broad, shallowly forked tail with rounded lobes, rays fanning from the peduncle.
  const tailAt: V3 = [0, cy(-0.27), -0.27];
  const tailOutline: OutlinePoint[] = [
    [0.012, 0.024],
    [-0.04, 0.046],
    [-0.09, 0.078],
    [-0.122, 0.09],
    [-0.134, 0.074],
    [-0.12, 0.034],
    [-0.1, 0.0, "sharp"],
    [-0.12, -0.034],
    [-0.134, -0.074],
    [-0.122, -0.09],
    [-0.09, -0.078],
    [-0.04, -0.046],
    [0.012, -0.024],
  ];
  b.extrude(tailOutline, {
    at: tailAt,
    bone: caudal,
    thickness: 0.004,
    bevel: 0.0014,
    smoothing: 1,
    detail: 0.5,
    color: rayed(planar(tailAt, [0, 0, -1], [0, 1, 0]), [-0.03, 0], 16, 0.12),
    group: "tail",
    name: "caudalFin",
  });

  return b.root;
}
