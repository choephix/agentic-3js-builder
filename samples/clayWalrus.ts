// Clay walrus. A 2.5 m bull walrus sitting up proudly, "sculpted" out of modelling plasticine and shot frame by frame:
// every form is a soft, chunky, slightly lumpy blob (noise-displaced ellipsoids pressed on, never perfect), every
// surface is a matte clay paint in a plain kit colour that smudges into its neighbour, with fingerprint whorls where a
// thumb pushed the clay about and short parallel tool-scratches where a modelling tool dragged over it. Details are
// rolled and flattened clay: sausage whiskers on two pressed-on pin-pricked pads, a fat ivory tusk pair rolled and
// grooved, ball eyes with a painted pupil under heavy clay lids and a rolled brow, a flat dark disc for the nose with
// two poked nostrils, flat nail discs on each digit. Rigged: pelvis, spine, neck, head, an openable jaw, two front
// and two hind flippers (arm/leg chains with five digit chains each) and a stubby tail.
import { BufferAttribute, BufferGeometry, SphereGeometry, TorusGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, mix, noise, paint, resolve, smoothstep, spots } from "../src/paint";
import type { ColorInput, Rgb } from "../src/paint";
import type { Chain, Joint } from "../src/skeleton";
import { interpolate } from "../src/sweep";

export const meta = {
  name: "Clay Walrus",
  description:
    "A 2.5 m bull walrus sitting up proudly, modelled in plasticine stop-motion style: lumpy soft blobs in plain kit-clay colours, fingerprint whorls and tool scratches baked into the paint, sausage-roll whiskers on pin-pricked pads, rolled ivory tusks, ball eyes with painted pupils under heavy lids, five-digit flippers with flat nail discs, and an openable jaw.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Kit colours: the plain solid colours of a modelling-clay box.
const BROWN = "#8e5734";
const BROWN_WARM = "#a86a3a";
const BROWN_DK = "#65402a";
const TAN = "#cf9d66";
const TAN_PALE = "#dfb98a";
const IVORY = "#f0e5c2";
const IVORY_DK = "#d8c79a";
const WHISKER_A = "#f4e6b8";
const WHISKER_B = "#e2c98e";
const WHISKER_C = "#f8efd2";
const PORE = "#7a4a30";
const NOSE = "#4a3038";
const NOSTRIL = "#211416";
const MOUTH = "#5a2530";
const INSIDE = "#6e2b3a";
const TONGUE = "#d9787f";
const BROW = "#54331f";
const NAIL = "#efdcb2";
const WHITE = "#f5f1e4";
const PUPIL = "#16100e";
const PELLET_A = "#b4753f";
const PELLET_B = "#7c4d2e";
const PELLET_C = "#c98d55";

// ---------------------------------------------------------------------------------------------------------------
// Lumpy clay geometry.

const key = (v: Vector3) => `${Math.round(v.x * 1e4)},${Math.round(v.y * 1e4)},${Math.round(v.z * 1e4)}`;

/** Smooth vertex normals across the seam and poles of an indexed geometry, keyed by position. */
function smooth(g: BufferGeometry) {
  const pos = g.attributes.position as BufferAttribute;
  const index = g.index!;
  const acc = new Map<string, Vector3>();
  const p = [new Vector3(), new Vector3(), new Vector3()];
  const face = new Vector3();
  const ab = new Vector3();
  for (let i = 0; i < index.count; i += 3) {
    for (let k = 0; k < 3; k++) p[k].fromBufferAttribute(pos, index.getX(i + k));
    face.subVectors(p[1], p[0]).cross(ab.subVectors(p[2], p[0]));
    for (let k = 0; k < 3; k++) {
      const kk = key(p[k]);
      const sum = acc.get(kk);
      if (sum) sum.add(face);
      else acc.set(kk, face.clone());
    }
  }
  const normals = new Float32Array(pos.count * 3);
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = acc.get(key(v))!.clone().normalize();
    normals.set([n.x, n.y, n.z], i * 3);
  }
  g.setAttribute("normal", new BufferAttribute(normals, 3));
  return g;
}

/** A soft lump of clay: an ellipsoid of half-extents (rx, ry, rz) pushed about by low noise. */
function blob(rx: number, ry: number, rz: number, amp: number, seed: number, ws = 14, hs = 10) {
  const g = new SphereGeometry(1, ws, hs);
  const pos = g.attributes.position as BufferAttribute;
  const v = new Vector3();
  const q = new Vector3();
  const size = Math.max(rx, ry, rz) * 1.15;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.set(v.x * rx, v.y * ry, v.z * rz);
    q.set(v.x + seed * 3.7, v.y + seed * 1.3, v.z - seed * 2.9);
    const k = 1 + amp * (noise(q, size, seed) * 2 - 1);
    pos.setXYZ(i, v.x * k, v.y * k, v.z * k);
  }
  g.computeBoundingBox();
  return smooth(g);
}

// ---------------------------------------------------------------------------------------------------------------
// Clay paint.

const UP = new Vector3(0, 1, 0);
const AXIS_X = new Vector3(1, 0, 0);

const shade = (c: Rgb, k: number): Rgb => [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)];

/** A tangent basis on the surface at normal `n`. */
function basis(n: Vector3): [Vector3, Vector3] {
  const t1 = new Vector3().crossVectors(n, Math.abs(n.y) < 0.9 ? UP : AXIS_X).normalize();
  return [t1, new Vector3().crossVectors(n, t1)];
}

type ClayOptions = {
  seed?: number;
  /** A second clay smudged and marbled into the base where the streaky noise says so. */
  smudge?: ColorInput;
  smudgeAmount?: number;
  /** Fingerprint whorls and tool scratches (default on). */
  marks?: boolean;
  /** Wrinkle grooves pressed round a tube at these source t's (sweeps only). */
  folds?: readonly number[];
};

/**
 * Plasticine: a plain colour that is never quite even (soft mottle, marbling with a second clay), with oval
 * fingerprint whorls where thumbs pressed and bundles of parallel scratches where a tool dragged over the surface.
 */
function clay(base: ColorInput, o: ClayOptions = {}) {
  const seed = o.seed ?? 1;
  const smudgeAmount = o.smudgeAmount ?? 0.7;
  const marks = o.marks ?? true;
  return paint((p, n, s) => {
    let c: Rgb = resolve(base, p, n);
    if (o.smudge) {
      const w = (a: number) => (noise(p, 0.3, seed + a) - 0.5) * 0.16;
      const q = new Vector3(p.x + w(5), p.y + w(6), p.z + w(7));
      const k = smoothstep(0.48, 0.68, noise(q, 0.14, seed + 11)) * smudgeAmount;
      c = mix(c, resolve(o.smudge, p, n), k);
    }
    c = shade(c, 1 + (noise(p, 0.07, seed + 2) - 0.5) * 0.08);

    if (marks) {
      // Thumbprints: oval whorls of ridges, one thumb wide about 17 cm on this animal.
      const pc = cells(p, 0.34, seed + 3);
      if (pc.id > 0.3) {
        const v = p.clone().sub(pc.center);
        const off = v.dot(n);
        const near = smoothstep(0.12, 0.05, Math.abs(off));
        if (near > 0) {
          const vt = v.addScaledVector(n, -off);
          const [t1, t2] = basis(n);
          const ang = pc.id * 40;
          const ca = Math.cos(ang);
          const sa = Math.sin(ang);
          const u = vt.dot(t1) * ca + vt.dot(t2) * sa;
          const wv = -vt.dot(t1) * sa + vt.dot(t2) * ca;
          const rr = Math.hypot(u * 0.72, wv) + (noise(p, 0.05, seed + 8) - 0.5) * 0.012;
          const mask = smoothstep(0.125, 0.1, rr) * near;
          if (mask > 0) {
            const ridge = smoothstep(0.3, 0.85, 0.5 + 0.5 * Math.cos((rr / 0.012) * Math.PI * 2));
            c = shade(c, 1 - 0.3 * ridge * mask + 0.05 * (1 - ridge) * mask);
          }
        }
      }
      // Tool marks: a patch of parallel scratches.
      const tc = cells(p, 0.38, seed + 21);
      if (tc.id > 0.55) {
        const v = p.clone().sub(tc.center);
        const off = v.dot(n);
        const near = smoothstep(0.1, 0.04, Math.abs(off));
        if (near > 0) {
          const vt = v.addScaledVector(n, -off);
          const [t1, t2] = basis(n);
          const ang = tc.id * 90;
          const ca = Math.cos(ang);
          const sa = Math.sin(ang);
          const along = vt.dot(t1) * ca + vt.dot(t2) * sa;
          const across = -vt.dot(t1) * sa + vt.dot(t2) * ca;
          const mask = smoothstep(0.12, 0.08, Math.abs(along)) * smoothstep(0.07, 0.045, Math.abs(across)) * near;
          if (mask > 0) {
            const f = (((across / 0.016) % 1) + 1) % 1;
            const line = smoothstep(0.16, 0.07, Math.abs(f - 0.5));
            c = shade(c, 1 - 0.32 * line * mask);
          }
        }
      }
    }

    if (o.folds) {
      for (const [i, t0] of o.folds.entries()) {
        const d = Math.abs(s[0] - t0 - 0.007 * Math.sin((s[1] * Math.PI) / 90 + i * 2.1));
        c = shade(
          c,
          1 - 0.34 * smoothstep(0.0055, 0.002, d) + 0.07 * smoothstep(0.005, 0.0095, d) * smoothstep(0.014, 0.0095, d),
        );
      }
    }
    return c;
  });
}

/** Rolled ivory: streaky, a pinker smudge at the root, tool grooves spiralling round it. */
function tuskClay(length: number) {
  return paint((p, n, s) => {
    const streak = noise(new Vector3(p.x * 4, p.y * 0.8, p.z * 4), 0.1, 3);
    let c = mix(IVORY, IVORY_DK, smoothstep(0.35, 0.7, streak));
    c = mix(c, TAN_PALE, smoothstep(0.3, 0.02, s[0]) * 0.8 + 0.1 * smoothstep(0.55, 0.8, noise(p, 0.05, 9)));
    const phase = (s[0] * length) / 0.055 + (s[1] / 360) * 0.7;
    const groove = smoothstep(0.14, 0.06, Math.abs((((phase % 1) + 1) % 1) - 0.5)) * smoothstep(0.03, 0.12, s[0]);
    // one thumb dent near the tip
    const dent = smoothstep(0.08, 0.05, Math.hypot(s[0] - 0.62, (((s[1] + 180) % 360) - 180) / 200)) * 0.12;
    void n;
    return shade(c, 1 - 0.2 * groove - dent);
  });
}

/** A ball eye: cream clay with a painted pupil looking along `gaze`. */
function eyeClay(gaze: Vector3) {
  return paint((p, n) => {
    const d = n.dot(gaze) + (noise(p, 0.03, 5) - 0.5) * 0.05;
    const pupil = smoothstep(0.84, 0.865, d);
    const white = shade(mix(WHITE, "#e8dcc0", smoothstep(0.55, 0.3, n.dot(gaze))), 1 + (noise(p, 0.02, 2) - 0.5) * 0.1);
    return mix(white, PUPIL, pupil);
  });
}

// ---------------------------------------------------------------------------------------------------------------

type FlipperCfg = {
  s: number;
  side: "L" | "R";
  prefix: string;
  group: string;
  parent: Joint;
  pts: [V3, V3, V3];
  jointNames: [string, string, string];
  role: "arm" | "leg";
  /** Half extents of the limb tube (sideways, thick) over its whole length. */
  tube: (t: number) => [number, number];
  /** Digit fan: azimuth of the middle digit from straight ahead/back (deg, outward positive), spread, lengths. */
  spread: number[];
  centre: number;
  back: boolean;
  lengths: number[];
  palm: number;
};

export default function build() {
  const b = createBuilder({ name: "clayWalrus", paintSize: 2048 });
  const r = rng(11);

  // ---- Paints ---------------------------------------------------------------------------------------------------
  const FRONT = new Vector3(0, -0.57, 0.82); // the belly faces forward and a little down while seated
  const skinBase = paint((p, n) => {
    const k = smoothstep(0.05, 0.75, n.dot(FRONT) + 0.5 * (noise(p, 0.3, 9) - 0.5));
    return mix(BROWN, TAN, k);
  });
  const SKIN = clay(skinBase, { smudge: BROWN_WARM, seed: 1 });
  const FLIPPER = clay(BROWN_DK, { smudge: BROWN, seed: 1, smudgeAmount: 0.55 });
  const PAD = clay(spots(TAN_PALE, PORE, { size: 0.028, amount: 0.62, seed: 4 }), { seed: 1, marks: false });

  // ---- Skeleton: the torso runs from the rump up the tilted chest to the neck ------------------------------------
  const torsoPts: V3[] = [
    [0, 0.44, -0.55],
    [0, 0.7, -0.4],
    [0, 1.0, -0.16],
    [0, 1.28, 0.04],
    [0, 1.48, 0.16],
    [0, 1.62, 0.27],
  ];
  const torso = catmull(torsoPts);
  const chestT = torso.closestT(torsoPts[3]);
  // The head is designed at one size and pressed up 18% bigger about this point: a chunky clay head.
  const HS = 1.18;
  const hp = (x: number, y: number, z: number): V3 => [x * HS, 1.55 + (y - 1.55) * HS, 0.3 + (z - 0.3) * HS];
  const pelvis = b.joint("pelvis", { at: torsoPts[0], dir: [0, 0.6, 0.4], role: "spine", group: "body" });
  const spine = b.chain("spine", torso.slice(0.1, chestT), { parent: pelvis, count: 3, role: "spine", group: "body" });
  const neck = b.chain("neck", torso.slice(chestT, 1), {
    parent: spine.joints[2],
    count: 2,
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: torsoPts[5],
    aim: hp(0, 1.7, 0.6),
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, 1.47, 0.38),
    aim: hp(0, 1.38, 0.66),
    role: "jaw",
    group: "head",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.2, -0.86],
      [0, 0.1, -0.97],
      [0, 0.06, -1.08],
    ]),
    { parent: pelvis, count: 2, role: "tail", group: "tail" },
  );

  // ---- Torso -------------------------------------------------------------------------------------------------------
  const girth = [0.415, 0.51, 0.535, 0.49, 0.415, 0.34];
  const girthT = [0, 0.18, 0.4, 0.62, 0.82, 1];
  const body = b.sweep(
    torso,
    (t) => {
      const lump = 1 + 0.035 * Math.sin(t * 19 + 0.7) * Math.sin(Math.PI * t) + 0.02 * Math.sin(t * 41);
      const rad = interpolate(girthT, girth, t) * lump;
      return [rad * 1.04, rad];
    },
    {
      bone: [pelvis, spine, neck],
      color: clay(skinBase, { smudge: BROWN_WARM, seed: 1, folds: [0.32, 0.4, 0.74, 0.8, 0.86] }),
      sides: 18,
      name: "torso",
      group: "body",
    },
  );
  b.sweep(tail, (t) => [0.14 - 0.04 * t, 0.045 - 0.008 * t], { color: FLIPPER, sides: 10, group: "tail" });

  // Shoulder humps, pressed on.
  for (const s of [1, -1])
    b.part(blob(0.2, 0.17, 0.24, 0.3, 5 + s, 14, 10), SKIN, {
      bone: spine.joints[2],
      at: [s * 0.34, 1.2, -0.13],
      name: "shoulderHump",
      group: "body",
    });

  // Pinched-on pellets of clay across the neck and shoulders: the warty walrus hide.
  const pelletHits = b.surface(body).scatter(40, {
    rng: rng(5),
    minDist: 0.14,
    filter: (h) => h.at.y > 1.12 && h.n.z > -0.35,
  });
  pelletHits.forEach((h, i) => {
    const col = [PELLET_A, PELLET_B, PELLET_C][i % 3];
    const k = 0.75 + 0.5 * r();
    b.stick(blob(0.042 * k, 0.024 * k, 0.042 * k, 0.25, 20 + i, 8, 6), col, h, {
      embed: 0.55,
      spin: r() * 180,
      group: "body",
    });
  });

  // ---- Head -----------------------------------------------------------------------------------------------------------
  const SK = hp(0, 1.7, 0.36);
  const skull = b.part(blob(0.3 * HS, 0.27 * HS, 0.29 * HS, 0.14, 2, 18, 12), SKIN, {
    bone: head,
    at: SK,
    name: "skull",
    group: "head",
  });
  const pads = [1, -1].map((s) =>
    b.part(blob(0.17 * HS, 0.15 * HS, 0.16 * HS, 0.12, 30 + s, 16, 12), SKIN, {
      bone: head,
      at: hp(s * 0.115, 1.55, 0.6),
      name: "muzzlePad",
      group: "head",
    }),
  );
  const bridge = b.part(blob(0.13 * HS, 0.14 * HS, 0.15 * HS, 0.1, 7, 12, 8), SKIN, {
    bone: head,
    at: hp(0, 1.62, 0.62),
    group: "head",
  });
  b.part(blob(0.23 * HS, 0.15 * HS, 0.2 * HS, 0.15, 8, 14, 10), SKIN, {
    bone: head,
    at: hp(0, 1.36, 0.3),
    name: "doubleChin",
    group: "head",
  });
  const muzzle = b.surface([...pads, bridge]);

  // The moustache: two flat pin-pricked discs of pale clay pressed on the front of the pads, bristling with short
  // rolled-sausage whiskers that droop.
  const discs = [1, -1].map((s) => {
    const hit = muzzle.nearest(hp(s * 0.1, 1.52, 0.9));
    return b.stick(blob(0.135 * HS, 0.045 * HS, 0.115 * HS, 0.08, 40 + s, 14, 8), PAD, hit, {
      embed: 0.5,
      bone: head,
      name: "whiskerPad",
      group: "head",
    });
  });
  const whiskerHits = b.surface(discs).scatter(96, {
    rng: rng(8),
    minDist: 0.04,
    filter: (h) => h.n.z > 0.3,
  });
  whiskerHits.forEach((h, i) => {
    const len = 0.11 + 0.09 * r();
    const side = Math.sign(h.at.x) || 1;
    const p0 = h.at;
    const n = h.n;
    const fwd = 0.25 + 0.3 * r();
    const flare = side * len * (0.05 + 0.22 * r());
    const mid = p0
      .clone()
      .addScaledVector(n, len * fwd * 0.9)
      .add(new Vector3(flare * 0.4, -len * 0.3, 0));
    const tip = p0
      .clone()
      .addScaledVector(n, len * fwd)
      .add(new Vector3(flare, -len * 0.95, 0));
    b.sprout(`whisker${i}`, h, catmull([p0, mid, tip]), [0.019, 0.014], {
      count: 0,
      color: [WHISKER_A, WHISKER_B, WHISKER_C][i % 3],
      sides: 6,
      bury: 0.02,
      group: "head",
    });
  });

  // Tusks: fat rolled ivory, grooved, with a blunt thumb-rounded tip.
  const tuskLen = 0.9;
  for (const s of [1, -1])
    b.sweep(bezier(hp(s * 0.125, 1.52, 0.64), hp(s * 0.19, 1.1, 0.8), hp(s * 0.11, 0.75, 0.76)), [0.077, 0.033], {
      bone: head,
      color: tuskClay(tuskLen),
      sides: 12,
      caps: { start: "flat", end: "round" },
      name: "tusk",
      group: "head",
    });

  // Nose: a flat dark disc with two poked nostrils.
  const noseHit = b.surface([bridge, ...pads]).nearest(hp(0, 1.79, 0.74));
  const nose = b.stick(blob(0.085 * HS, 0.03 * HS, 0.06 * HS, 0.08, 50, 12, 8), NOSE, noseHit, {
    embed: 0.55,
    bone: head,
    group: "head",
  });
  for (const s of [1, -1]) {
    const nh = b.surface(nose).nearest(nose.local([s * 0.038, 0.035, 0.005]));
    b.stick(blob(0.024, 0.015, 0.015, 0.1, 60 + s, 8, 6), NOSTRIL, nh, {
      embed: 0.5,
      bone: head,
      spin: s * 25,
      group: "head",
    });
  }

  // Mouth: a rolled dark line pressed along the lower rim of the muzzle, a plum inside, a flat pink tongue on the jaw.
  const mouthLine = muzzle.drape(
    catmull([hp(0.27, 1.5, 0.48), hp(0.2, 1.43, 0.7), hp(0, 1.41, 0.79), hp(-0.2, 1.43, 0.7), hp(-0.27, 1.5, 0.48)]),
    { lift: 0.002 },
  );
  b.sweep(mouthLine, 0.014, { bone: head, color: MOUTH, sides: 6, group: "head" });
  b.part(blob(0.11 * HS, 0.035 * HS, 0.13 * HS, 0.05, 61, 10, 6), INSIDE, {
    bone: head,
    at: hp(0, 1.43, 0.56),
    group: "head",
  });
  b.part(blob(0.15 * HS, 0.09 * HS, 0.17 * HS, 0.15, 62, 14, 10), SKIN, {
    bone: jaw,
    at: hp(0, 1.385, 0.55),
    name: "lowerJaw",
    group: "head",
  });
  b.part(blob(0.085 * HS, 0.03 * HS, 0.12 * HS, 0.1, 63, 10, 6), TONGUE, {
    bone: jaw,
    at: hp(0, 1.455, 0.56),
    group: "head",
  });

  // Eyes: cream ball, painted pupil, a rolled ring round the socket, a clay lid over the top, a rolled dark brow.
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around(SK).at(s * 52, 30);
    if (!hit) continue;
    const c = hit.at.clone().addScaledVector(hit.n, 0.03);
    const gaze = new Vector3(s * 0.4, 0.2, 1).normalize();
    b.part(new SphereGeometry(0.07, 14, 10), eyeClay(gaze), { bone: head, at: c, name: "eye", group: "head" });
    b.part(new TorusGeometry(0.07, 0.019, 6, 16), SKIN, {
      bone: head,
      at: c.clone().addScaledVector(hit.n, -0.02),
      dir: hit.n,
      axis: "z",
      name: "eyeSocket",
      group: "head",
    });
    b.part(new SphereGeometry(0.077, 14, 6, 0, Math.PI * 2, 0, 0.9), SKIN, {
      bone: head,
      at: c,
      dir: [s * 0.15, 1, 0.3],
      name: "eyelid",
      group: "head",
    });
    const brow = skullSurface.drape(
      catmull([
        c.clone().add(new Vector3(-s * 0.1, 0.05, -0.07)),
        c.clone().add(new Vector3(-s * 0.01, 0.1, -0.02)),
        c.clone().add(new Vector3(s * 0.09, 0.09, 0.06)),
      ]),
      { lift: 0.01 },
    );
    b.sweep(brow, [0.01, 0.022, 0.014], {
      bone: head,
      color: BROW,
      sides: 6,
      name: "brow",
      group: "head",
    });
  }

  // ---- Flippers --------------------------------------------------------------------------------------------------------
  function flipper(cfg: FlipperCfg): { chain: Chain; wrist: Joint } {
    const { s, side, prefix, group } = cfg;
    const [a, k, w] = cfg.pts;
    const dirs = cfg.spread.map((deg) => {
      const phi = ((cfg.centre + deg) * Math.PI) / 180;
      return new Vector3(s * Math.sin(phi), 0, (cfg.back ? -1 : 1) * Math.cos(phi));
    });
    const mean = dirs.reduce((acc, d) => acc.add(d), new Vector3()).normalize();
    const wArm = new Vector3(w[0], w[1] + 0.06, w[2]);
    const end = wArm.clone().addScaledVector(mean, cfg.palm);
    const chain = b.chain(cfg.jointNames[0].replace(/[LR]$/, "") + side, catmull([a, k, wArm, end]), {
      parent: cfg.parent,
      names: cfg.jointNames,
      up: UP,
      role: cfg.role,
      group,
    });
    b.sweep(chain, cfg.tube, { sides: 14, color: FLIPPER, group });
    const wristJoint = chain.joints[2];

    const digits = dirs.map((d, i) => {
      const tipPt = new Vector3(...w).addScaledVector(d, cfg.lengths[i]);
      const bend = tipPt.clone().addScaledVector(new Vector3(-s * d.z, 0, s * d.x), (i - 2) * 0.012);
      const mid = new Vector3(...w).addScaledVector(d, cfg.lengths[i] * 0.5);
      const c = b.chain(`${prefix}${i + 1}${side}`, catmull([w, mid, bend]), {
        parent: wristJoint,
        up: UP,
        role: "digit",
        count: 2,
        names: [`${prefix}${i + 1}${side}A`, `${prefix}${i + 1}${side}B`],
        group,
      });
      const tube = b.sweep(c, (t) => [0.06 - 0.014 * t, 0.04], {
        sides: 8,
        color: FLIPPER,
        up: UP,
        group,
      });
      b.stick(blob(0.03, 0.012, 0.038, 0.1, 70 + i + (s > 0 ? 0 : 7), 8, 5), NAIL, tube.at(0.9), {
        embed: 0.45,
        flow: d,
        group,
      });
      return c;
    });
    for (let i = 0; i < digits.length - 1; i++)
      b.membrane(digits[i], digits[i + 1], { thickness: 0.05, color: FLIPPER, rows: 2, group });
    return { chain, wrist: wristJoint };
  }

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    flipper({
      s,
      side,
      prefix: "finger",
      group: `foreflipper${side}`,
      parent: spine.joints[2],
      pts: [
        [s * 0.38, 0.95, 0.02],
        [s * 0.62, 0.5, 0.24],
        [s * 0.76, 0.04, 0.54],
      ],
      jointNames: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      tube: (t) => [0.22 - 0.07 * t, 0.04 + 0.14 * (1 - smoothstep(0.3, 0.9, t))],
      spread: [-40, -20, 0, 20, 40],
      centre: 15,
      back: false,
      lengths: [0.32, 0.4, 0.42, 0.38, 0.3],
      palm: 0.14,
    });
    flipper({
      s,
      side,
      prefix: "toe",
      group: `hindflipper${side}`,
      parent: pelvis,
      pts: [
        [s * 0.2, 0.3, -0.72],
        [s * 0.27, 0.13, -0.96],
        [s * 0.31, 0.04, -1.12],
      ],
      jointNames: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      tube: (t) => [0.19 - 0.06 * t, 0.04 + 0.1 * (1 - smoothstep(0.2, 0.8, t))],
      spread: [-30, -15, 0, 15, 30],
      centre: 10,
      back: true,
      lengths: [0.55, 0.45, 0.4, 0.45, 0.52],
      palm: 0.1,
    });
  }

  return b.root;
}
