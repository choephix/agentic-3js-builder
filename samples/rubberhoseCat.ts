// Rubber-hose alley cat, 1930s cartoon style: a 0.7 m black-ink cat strutting on his hind legs, chest out, hat bent
// over one ear. Noodle limbs with no elbow (one continuous tube on a bendy chain), white four-fingered gloves, big
// black shoes, a wide toothy grin under a cream muzzle, pie-cut eyes, a bandaged tail with a stitched patch.
//
// Style: black ink, cream paper and greys only. The ink is a paint with a fine film grain, the paper tones carry
// stains, dust specks and a faint vignette toward the edges of the sheet. Every cream shape (gloves, cuffs, muzzle,
// hat, sock rolls) is wrapped in a thick black outline: a second copy of the shape, a few millimetres larger and
// turned inside out, sits behind it, so the ink line follows the silhouette from every angle. The pie-cut eyes and the
// hat patch are hand-drawn; the tail patch and the bandage are paints with stitches and gauze lines.
// Skeleton: hips, three spine joints, neck, head, jaw, ears, arms (shoulder, elbow, wrist) with four two-joint
// fingers each, legs (hip, knee, ankle, toe) and a six-joint tail.
import { CapsuleGeometry, CircleGeometry, LatheGeometry, SphereGeometry, Vector2, Vector3 } from "three";
import type { BufferGeometry } from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import type { Path } from "../src/path";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import type { Fill } from "../src/context";
import { svg } from "../src/texture";

export const meta = {
  name: "Rubber-hose alley cat",
  description:
    "1930s cartoon alley cat strutting upright in ink black and cream: noodle limbs, gloved hands, pie-cut eyes, a toothy grin, a bent hat and a bandaged, patched tail.",
};

// Palette: ink, paper and greys.
const INK = "#0d0d0e";
const INK_RGB: Rgb = [0.05, 0.05, 0.055];
const CREAM = "#f0e8d2";
const PAPER_DK = "#d5cbb0";
const GREY = "#8b877c";
const GREY_LT = "#bdb8a8";
const FELT = "#cac5b4";
const FELT_DK = "#aaa594";

const OUTLINE = true;
const LINE = 0.0026; // thickness of the ink outline round cream shapes
const HEAD_C = new Vector3(0, 0.53, 0.015); // centre of the skull ellipsoid
const RX = 0.125;
const RY = 0.105;
const RZ = 0.108;
const MOUTH_Y = 0.466; // the plane where the jaw splits from the skull

const fract = (x: number) => x - Math.floor(x);
const tone = (c: Rgb, k: number): Rgb => [c[0] * k, c[1] * k, c[2] * k];
/** A faint vignette: the paper darkens a little toward the edges of the sheet. */
const vignette = (p: Vector3) => 1 - 0.2 * smoothstep(0.08, 0.34, Math.hypot(p.x, (p.y - 0.36) * 0.9));

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Black ink with a fine film grain and slow grey blooms. */
const inkPaint = paint((p) => {
  const fine = noise(p, 0.0016, 3);
  const soft = noise(p, 0.006, 4);
  const v =
    0.048 + 0.05 * smoothstep(0.5, 0.75, soft) * smoothstep(0.42, 0.68, fine) + 0.1 * smoothstep(0.7, 0.84, fine);
  return [v, v, v * 1.03];
});

/** Off-white paper: slow stains, dust specks, vignette. */
const creamPaint = paint((p) => {
  const stain = noise(p, 0.03, 21);
  const fine = noise(p, 0.0018, 22);
  let c = mix(CREAM, PAPER_DK, 0.55 * smoothstep(0.52, 0.78, stain));
  c = mix(c, GREY, 0.4 * smoothstep(0.7, 0.84, fine));
  return tone(c, vignette(p));
});

/** Grey felt for the hat. */
const feltPaint = paint((p) => {
  const stain = noise(p, 0.02, 31);
  const fine = noise(p, 0.0018, 32);
  let c = mix(FELT, FELT_DK, 0.6 * smoothstep(0.5, 0.78, stain));
  c = mix(c, INK_RGB, 0.25 * smoothstep(0.72, 0.85, fine));
  return tone(c, vignette(p));
});

/**
 * A stitched patch on a surface: `u`, `v` run -1..1 over it. Returns the cloth, its stitched border and X, or the
 * ink outline just outside; null off the patch.
 */
function patchCloth(u: number, v: number): Rgb | null {
  const m = Math.max(Math.abs(u), Math.abs(v));
  if (m > 1.14) return null;
  if (m > 1) return INK_RGB;
  const along = Math.abs(u) > Math.abs(v) ? v : u;
  if (m > 0.68 && m < 0.84 && fract(along * 3.4) < 0.58) return [0.17, 0.16, 0.16];
  if (Math.abs(Math.abs(u) - Math.abs(v)) < 0.13 && m < 0.6) return [0.17, 0.16, 0.16];
  return [0.66, 0.64, 0.6];
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

/** A pie-cut eye as a lat-long map for a dome that looks out: ink outline, a big ink pupil at the pole, and a white
 * wedge cut out of it. Columns run round the dome, rows from the pole (top) to the rim (bottom). */
function pieEye(wedge0: number, wedge1: number) {
  const W = 256;
  const white = "#f6f1e0";
  return svg(
    `<svg viewBox="0 0 ${W} 64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect width="${W}" height="64" fill="${white}"/>
      <rect y="40" width="${W}" height="10" fill="#e4dcc4"/>
      <rect width="${W}" height="25" fill="${INK}"/>
      <rect x="${wedge0 * W}" width="${(wedge1 - wedge0) * W}" height="26" fill="${white}"/>
      <rect y="51" width="${W}" height="13" fill="${INK}"/>
    </svg>`,
    { size: W },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers

function volume(g: BufferGeometry) {
  const pos = g.getAttribute("position");
  const idx = g.getIndex();
  if (!idx) throw new Error("solid geometry needs an index");
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  let v = 0;
  for (let i = 0; i < idx.count; i += 3) {
    a.fromBufferAttribute(pos, idx.getX(i));
    b.fromBufferAttribute(pos, idx.getX(i + 1));
    c.fromBufferAttribute(pos, idx.getX(i + 2));
    v += a.dot(b.cross(c));
  }
  return v / 6;
}

/** Turns a closed mesh inside out: reversed winding, negated normals. */
function invert(g: BufferGeometry) {
  const idx = g.getIndex()!;
  for (let i = 0; i < idx.count; i += 3) {
    const t = idx.getX(i + 1);
    idx.setX(i + 1, idx.getX(i + 2));
    idx.setX(i + 2, t);
  }
  const n = g.getAttribute("normal");
  for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  return g;
}

/** An outline shell is deliberately inside-out, and open where it is hidden: its last triangle (at the end of the shape that sits inside its neighbour) is left out. */
function openShell(g: BufferGeometry) {
  const idx = g.getIndex()!;
  g.setIndex(Array.from(idx.array).slice(0, idx.count - 3));
  return g;
}

/** The ink outline of a smooth solid: the shape pushed out along its normals and turned inside out. */
function shell(g: BufferGeometry, t: number) {
  const h = g.clone();
  const pos = h.getAttribute("position");
  const nor = h.getAttribute("normal");
  for (let i = 0; i < pos.count; i++)
    pos.setXYZ(i, pos.getX(i) + nor.getX(i) * t, pos.getY(i) + nor.getY(i) * t, pos.getZ(i) + nor.getZ(i) * t);
  return openShell(invert(h));
}

type Outline = Array<[number, number]>;

/** A lathe outline grown outward by `t` (mitred at every corner); points on the axis stay on it. */
function grow(outline: Outline, t: number): Outline {
  const n = outline.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = outline[i];
    const [x1, y1] = outline[(i + 1) % n];
    area += x0 * y1 - x1 * y0;
  }
  const s = area > 0 ? 1 : -1;
  const edge = (i: number) => {
    const [x0, y0] = outline[i];
    const [x1, y1] = outline[(i + 1) % n];
    const len = Math.hypot(x1 - x0, y1 - y0);
    return new Vector2((s * (y1 - y0)) / len, (-s * (x1 - x0)) / len);
  };
  return outline.map(([x, y], i) => {
    const a = edge((i + n - 1) % n);
    const b = edge(i);
    const k = t / Math.max(1 + a.dot(b), 0.3);
    const gx = x === 0 ? 0 : x + (a.x + b.x) * k;
    return [Math.max(gx, 0), y + (a.y + b.y) * k];
  });
}

export default function build() {
  const b = createBuilder({ name: "rubberhoseCat", paintSize: 1024 });
  type Placement = NonNullable<Parameters<typeof b.part>[2]>;

  /** A smooth solid part with its ink outline behind it. */
  const inked = (geo: BufferGeometry, color: Fill, options: Placement, t = LINE) => {
    const fill = b.part(geo, color, options);
    if (OUTLINE) b.part(shell(geo, t), INK, options);
    return fill;
  };
  /** A lathe with its ink outline behind it. */
  const inkedLathe = (
    outline: Outline,
    color: Fill,
    options: {
      at: Vector3;
      axis: Vector3;
      segments: number;
      bone: Parameters<typeof b.lathe>[1]["bone"];
      group: string;
    },
    t = LINE,
  ) => {
    const fill = b.lathe(outline, { ...options, color });
    if (OUTLINE) {
      const g = new LatheGeometry(
        grow(outline, t).map(([x, y]) => new Vector2(x, y)),
        options.segments,
      );
      if (volume(g) < 0) invert(g);
      b.part(openShell(invert(g)), INK, {
        at: options.at,
        dir: options.axis,
        bone: options.bone,
        group: options.group,
      });
    }
    return fill;
  };

  const sides = [
    [1, "L"],
    [-1, "R"],
  ] as const;

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.245, 0], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.27, 0.0],
      [0, 0.325, 0.008],
      [0, 0.375, 0.012],
      [0, 0.418, 0.008],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.418, 0.008],
    aim: [0, 0.445, 0.008],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.445, 0.008],
    aim: [0, 0.53, 0.01],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.474, -0.035],
    aim: [0, 0.458, 0.12],
    role: "jaw",
    group: "head",
  });
  const ears = sides.map(([s, side]) =>
    b.joint(`ear${side}`, { parent: head, at: [s * 0.098, 0.59, 0.0], aim: [s * 0.128, 0.685, 0.0], group: "head" }),
  );

  // Arms: one noodle each, shoulder -> elbow -> wrist and on into the hand.
  const armPts = (s: number): Array<[number, number, number]> => [
    [s * 0.05, 0.392, 0.008],
    [s * 0.112, 0.36, 0.066],
    [s * 0.182, 0.294, 0.004],
    [s * 0.224, 0.248, 0.02],
  ];
  const arms = sides.map(([s, side]) =>
    b.chain(`arm${side}`, catmull(armPts(s)), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    }),
  );

  // Legs: hip, knee, ankle, ball of the foot and the shoe's tip.
  const legPaths = sides.map(([s]) =>
    catmull([
      [s * 0.05, 0.238, 0.0],
      [s * 0.086, 0.152, 0.038],
      [s * 0.068, 0.064, -0.008],
      [s * 0.083, 0.03, 0.05],
      [s * 0.094, 0.03, 0.135],
    ]),
  );
  const legs = sides.map(([, side], i) =>
    b.chain(`leg${side}`, legPaths[i], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
      group: `leg${side}`,
    }),
  );

  // Tail: out of the rump, an S up behind the cat, hooked at the end.
  const tailPath = catmull([
    [0, 0.255, -0.05],
    [0, 0.248, -0.13],
    [0.035, 0.29, -0.2],
    [0.018, 0.365, -0.238],
    [-0.035, 0.435, -0.212],
    [-0.058, 0.5, -0.155],
    [-0.03, 0.545, -0.11],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 6, role: "tail", group: "tail" });
  const TAIL_LEN = tailPath.length;
  const tailRadius = (t: number) => 0.0215 - 0.0055 * t;

  // -------------------------------------------------------------------------------------------------------------
  // Body: a black pear with a cream belly, chest pushed out.
  const bellyInk = paint((p, n) => {
    const inside = (p.x / 0.046) ** 2 + ((p.y - 0.318) / 0.062) ** 2;
    if (n.z > 0.1 && inside < 1) return creamPaint;
    if (n.z > 0.1 && inside < 1.18) return INK_RGB;
    return inkPaint;
  });
  b.loft(
    [
      { at: [0, 0.225, -0.004], w: 0.098, h: 0.09 },
      { at: [0, 0.257, -0.006], w: 0.142, h: 0.118 },
      { at: [0, 0.312, 0.004], w: 0.148, h: 0.124 },
      { at: [0, 0.366, 0.012], w: 0.126, h: 0.104 },
      { at: [0, 0.41, 0.01], w: 0.09, h: 0.076 },
      { at: [0, 0.447, 0.008], w: 0.052, h: 0.05 },
    ],
    { bone: [hips, spine], color: bellyInk, sides: 10, group: "body" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Arms and gloves
  arms.forEach((arm, i) => {
    const [s, side] = sides[i];
    const [, , wrist] = arm.joints;
    b.sweep(arm, [0.0158, 0.0142, 0.0132], {
      to: arm.ts[2],
      sides: 7,
      color: inkPaint,
      group: `arm${side}`,
    });

    const P2 = new Vector3(...armPts(s)[2]);
    const a = new Vector3(...armPts(s)[3]).sub(P2).normalize(); // wrist -> hand
    const r = new Vector3(0, 0, 1).addScaledVector(a, -a.z).normalize(); // front, across the palm
    const out = new Vector3(s, 0, 0)
      .addScaledVector(a, -a.x * s)
      .addScaledVector(r, -r.x * s)
      .normalize(); // back of the hand
    const at = (o: number, ro = 0, w = 0) =>
      P2.clone().addScaledVector(a, o).addScaledVector(r, ro).addScaledVector(out, w);
    const group = `arm${side}`;

    // Flared cuff, its opening toward the sleeve.
    inkedLathe(
      [
        [0, -0.014],
        [0.027, -0.014],
        [0.019, 0.014],
        [0, 0.014],
      ],
      creamPaint,
      { at: at(0.004), axis: a, segments: 9, bone: wrist, group },
    );
    // Puffy palm.
    const palm = new SphereGeometry(1, 10, 7).scale(0.018, 0.026, 0.031);
    inked(palm, creamPaint, { at: at(0.037), dir: a, up: r, bone: wrist, group });
    // Three ink lines on the back of the glove.
    for (const ro of [-0.011, 0, 0.011])
      b.rod(at(0.028, ro, 0.0158), at(0.047, ro * 1.25, 0.0142), 0.0013, { sides: 4, bone: wrist, color: INK, group });

    // Fingers and thumb: two capsules each, one per joint.
    const digits: Array<{ name: string; base: Vector3; dir: Vector3; l1: number; l2: number; r: number }> = [
      {
        name: "index",
        base: at(0.058, 0.018),
        dir: a.clone().addScaledVector(r, 0.55),
        l1: 0.027,
        l2: 0.024,
        r: 0.0105,
      },
      {
        name: "middle",
        base: at(0.062, 0.0),
        dir: a.clone().addScaledVector(r, 0.04),
        l1: 0.031,
        l2: 0.027,
        r: 0.0107,
      },
      {
        name: "ring",
        base: at(0.058, -0.018),
        dir: a.clone().addScaledVector(r, -0.5),
        l1: 0.027,
        l2: 0.024,
        r: 0.0105,
      },
      {
        name: "thumb",
        base: at(0.024, 0.029),
        dir: r.clone().multiplyScalar(0.8).addScaledVector(a, 0.55).addScaledVector(out, -0.2),
        l1: 0.02,
        l2: 0.019,
        r: 0.0112,
      },
    ];
    for (const d of digits) {
      const d1 = d.dir.clone().normalize();
      const d2 = d1.clone().addScaledVector(out, -0.35).normalize();
      const mid = d.base.clone().addScaledVector(d1, d.l1);
      const tip = mid.clone().addScaledVector(d2, d.l2);
      const chain = b.chain(`${d.name}${side}`, [d.base, mid, tip], {
        parent: wrist,
        role: "digit",
        group,
      });
      const segs: Array<[Vector3, Vector3, number]> = [
        [d.base, mid, d.l1],
        [mid, tip, d.l2],
      ];
      segs.forEach(([from, to, len], k) => {
        const geo = new CapsuleGeometry(d.r * (k === 1 ? 0.94 : 1), len, 3, 8);
        inked(geo, creamPaint, { at: from.clone().lerp(to, 0.5), aim: to, bone: chain.joints[k], group });
      });
    }
  });

  // -------------------------------------------------------------------------------------------------------------
  // Legs, sock rolls and big shoes
  const shoePaint = paint((_p, n, sc) => {
    const [x, y] = sc;
    if (y < 0.0075) return GREY_LT;
    if (n.y > 0.15 && ((x - 0.148) / 0.026) ** 2 + ((y - 0.057) / 0.0075) ** 2 < 1) return creamPaint;
    return inkPaint;
  });
  const socks = paint((p) => {
    if (p.y > 0.128) return inkPaint;
    if ((p.y > 0.108 && p.y < 0.114) || (p.y > 0.119 && p.y < 0.124)) return INK_RGB;
    return creamPaint;
  });
  legs.forEach((leg, i) => {
    const [s, side] = sides[i];
    const [, knee, ankle, toe] = leg.joints;
    const group = `leg${side}`;
    b.sweep(leg, [0.0162, 0.0142, 0.0132], { to: leg.ts[2], sides: 7, color: socks, group });

    // Rolled sock: a cream ring with its ink outline.
    const path: Path = legPaths[i];
    let tRoll = 0.5;
    for (let t = 0; t < 1; t += 0.004)
      if (path.at(t).y < 0.1) {
        tRoll = t;
        break;
      }
    const rollAt = path.at(tRoll);
    const rollDir = path.tangentAt(tRoll);
    inkedLathe(
      [
        [0, -0.011],
        [0.0215, -0.011],
        [0.0215, 0.011],
        [0, 0.011],
      ],
      creamPaint,
      { at: rollAt, axis: rollDir, segments: 10, bone: knee, group },
    );

    // Shoe: heel and arch on the ankle, toe box on the toe joint. Toes point a little outward.
    const fwd = new Vector3(s * 0.13, 0, 1).normalize();
    const origin = new Vector3(ankle.at.x, 0, ankle.at.z).addScaledVector(fwd, -0.052);
    const common = {
      at: origin,
      x: fwd.toArray() as [number, number, number],
      y: [0, 1, 0] as [number, number, number],
    };
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.1, 0, "sharp"],
        [0.1, 0.06],
        [0.062, 0.079],
        [0.022, 0.078],
        [0, 0.052],
      ],
      { ...common, thickness: 0.07, bevel: 0.013, smoothing: 1, color: shoePaint, bone: ankle, group },
    );
    b.extrude(
      [
        [0.078, 0, "sharp"],
        [0.165, 0, "sharp"],
        [0.192, 0.014],
        [0.198, 0.032],
        [0.176, 0.054],
        [0.12, 0.067],
        [0.078, 0.068],
      ],
      { ...common, thickness: 0.078, bevel: 0.015, smoothing: 1, color: shoePaint, bone: toe, group },
    );
  });

  // -------------------------------------------------------------------------------------------------------------
  // Tail: ink, a cream tip, a stitched patch on each flank and a gauze bandage.
  const clockDiff = (deg: number, centre: number) => {
    const d = fract((deg - centre) / 360 + 0.5) * 360 - 180;
    return d;
  };
  const tailPaint = paint((_p, _n, sc) => {
    const [t, deg] = sc;
    if (t > 0.94) return INK_RGB;
    if (t > 0.9) return creamPaint;
    for (const centre of [90, 270]) {
      const u = ((t - 0.68) * TAIL_LEN) / 0.022;
      const v = (clockDiff(deg, centre) * Math.PI * tailRadius(t)) / 180 / 0.0135;
      const c = patchCloth(u, v);
      if (c) return c;
    }
    return inkPaint;
  });
  b.sweep(tail, tailRadius, { sides: 7, color: tailPaint, caps: "round", group: "tail" });

  const B0 = 0.3;
  const B1 = 0.43;
  const bandage = paint((_p, _n, sc) => {
    const [t, deg] = sc;
    const edge = Math.min(t - B0, B1 - t) * TAIL_LEN;
    if (edge < 0.0018) return INK_RGB;
    const wrap = fract((t * TAIL_LEN) / 0.0065 + deg / 75);
    if (wrap < 0.14) return GREY;
    return creamPaint;
  });
  b.sweep(tail, (t) => tailRadius(t) + 0.0036, {
    from: B0,
    to: B1,
    sides: 7,
    caps: "flat",
    color: bandage,
    group: "tail",
  });
  // The loose end of the gauze.
  {
    const end = tail.at(B1 - 0.012);
    b.spike(end, [0.5, 0.8, -0.3], 0.03, 0.006, { sides: 4, color: creamPaint, bone: tail.joints[2], group: "tail" });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: a wide black skull over a separate lower jaw, cream muzzle, ears, pie-cut eyes and a toothy grin.
  const phi = Math.acos((MOUTH_Y - HEAD_C.y) / RY);
  const k0 = Math.sqrt(1 - ((MOUTH_Y - HEAD_C.y) / RY) ** 2);
  const skullDome = new SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, phi)
    .scale(RX, RY, RZ)
    .translate(HEAD_C.x, HEAD_C.y, HEAD_C.z);
  const jawDome = new SphereGeometry(1, 16, 5, 0, Math.PI * 2, phi, Math.PI - phi)
    .scale(RX, RY, RZ)
    .translate(HEAD_C.x, HEAD_C.y, HEAD_C.z);
  const capUp = new CircleGeometry(1, 16)
    .rotateX(-Math.PI / 2)
    .scale(RX * k0, 1, RZ * k0)
    .translate(0, MOUTH_Y, HEAD_C.z);
  const capDown = new CircleGeometry(1, 16)
    .rotateX(Math.PI / 2)
    .scale(RX * k0, 1, RZ * k0)
    .translate(0, MOUTH_Y, HEAD_C.z);
  const O: [number, number, number] = [0, 0, 0];
  const skull = b.part(skullDome, inkPaint, { at: O, bone: head, group: "head" });
  b.part(capDown, INK, { at: O, bone: head, group: "head" });
  const chin = b.part(jawDome, inkPaint, { at: O, bone: jaw, group: "head" });
  b.part(capUp, INK, { at: O, bone: jaw, group: "head" });
  // Tongue.
  b.part(new SphereGeometry(1, 10, 6).scale(0.048, 0.012, 0.05), GREY, {
    at: [0, MOUTH_Y - 0.001, 0.035],
    bone: jaw,
    group: "head",
  });

  const skullZ = (x: number, y: number) =>
    HEAD_C.z + RZ * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2 - ((y - HEAD_C.y) / RY) ** 2));
  const skullNormal = (p: Vector3) =>
    new Vector3((p.x - HEAD_C.x) / RX ** 2, (p.y - HEAD_C.y) / RY ** 2, (p.z - HEAD_C.z) / RZ ** 2).normalize();
  const skullAt = (az: number, y: number) => {
    const k = Math.sqrt(Math.max(0, 1 - ((y - HEAD_C.y) / RY) ** 2));
    return new Vector3(Math.sin(az) * RX * k, y, HEAD_C.z + Math.cos(az) * RZ * k);
  };

  // Cream muzzle: two puffy whisker pads, a black nose between them.
  for (const [s] of sides)
    inked(new SphereGeometry(1, 12, 8).scale(0.034, 0.027, 0.03), creamPaint, {
      at: [s * 0.033, 0.518, 0.1],
      bone: head,
      group: "head",
    });
  b.part(new SphereGeometry(1, 10, 6).scale(0.02, 0.013, 0.013), INK, {
    at: [0, 0.532, 0.127],
    bone: head,
    group: "head",
  });
  b.rod([0, 0.524, 0.131], [0, 0.498, 0.128], 0.0016, { sides: 4, bone: head, color: INK, group: "head" });

  // Pie-cut eyes: domes on the skull, drawn as lat-long maps.
  const eyeTex = [pieEye(0.235, 0.385), pieEye(0.115, 0.265)];
  sides.forEach(([s], i) => {
    const x = s * 0.048;
    const y = 0.583;
    const surface = new Vector3(x, y, skullZ(x, y));
    const n = skullNormal(surface);
    b.part(new SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.034, 0.022, 0.041), "#ffffff", {
      at: surface.clone().addScaledVector(n, -0.009),
      dir: n,
      up: [0, 1, 0],
      texture: eyeTex[i],
      bone: head,
      group: "head",
    });
  });

  // Ears: black leaves with cream inners, each on its own joint.
  ears.forEach((ear, i) => {
    const [s] = sides[i];
    const base = new Vector3(s * 0.098, 0.588, 0.0);
    const lean: [number, number, number] = [s * 0.34, 1, 0];
    b.extrude(
      s < 0
        ? [
            // The alley cat's chewed right ear: a bite out of the tip.
            [-0.04, 0],
            [0.04, 0],
            [0.0, 0.108, "sharp"],
            [-0.006, 0.088, "sharp"],
            [0.006, 0.073, "sharp"],
            [-0.0165, 0.065, "sharp"],
          ]
        : [
            [-0.04, 0],
            [0.04, 0],
            [0.0, 0.108, "sharp"],
          ],
      {
        at: base,
        x: [1, 0, 0],
        y: lean,
        thickness: 0.02,
        bevel: 0.005,
        smoothing: 1,
        color: inkPaint,
        bone: ear,
        group: "head",
      },
    );
    b.extrude(
      [
        [-0.025, 0.012],
        [0.025, 0.012],
        [0.0, 0.066, "sharp"],
      ],
      {
        at: base.clone().add(new Vector3(0, 0, 0.0085)),
        x: [1, 0, 0],
        y: lean,
        thickness: 0.006,
        bevel: 0.002,
        smoothing: 1,
        color: creamPaint,
        bone: ear,
        group: "head",
      },
    );
  });

  // Cheek tufts: three ink spikes on each side.
  for (const [s] of sides)
    [
      [78, 0.508, 0.2],
      [85, 0.487, 0.05],
      [76, 0.466, 0.3],
    ].forEach(([azDeg, y, drop]) => {
      const p = skullAt((s * azDeg * Math.PI) / 180, y);
      b.spike(p.clone().addScaledVector(skullNormal(p), -0.006), [s * 0.85, -drop, -0.35], 0.042, 0.0135, {
        sides: 5,
        bone: head,
        color: INK,
        group: "head",
      });
    });

  // Whiskers: three noodles on each side.
  for (const [s] of sides)
    [0.022, 0.0, -0.022].forEach((d, k) => {
      b.sweep(
        catmull([
          [s * 0.05, 0.512 + d * 0.3, 0.117],
          [s * 0.105, 0.512 + d * 0.9, 0.132],
          [s * 0.165, 0.5 + d * 1.5 - 0.004 * k, 0.106],
        ]),
        [0.0028, 0.0012],
        { sides: 4, caps: { start: "flat", end: "point" }, bone: head, color: INK, group: "head" },
      );
    });

  // The grin: teeth bands draped on the skull (upper on the head, lower on the jaw), corners lifted.
  const AZ = (76 * Math.PI) / 180;
  const azs = Array.from({ length: 13 }, (_, k) => -AZ + (k * 2 * AZ) / 12);
  const smile = (az: number) => 0.04 * Math.sin(az) ** 2;
  const lip = (az: number) => 1 - 0.75 * (Math.abs(az) / AZ) ** 4;
  const grinSkin = b.surface([skull, chin]);
  const grinEdge = (up: number) =>
    grinSkin.drape(catmull(azs.map((az) => skullAt(az, MOUTH_Y + smile(az) + up * lip(az)))), { lift: 0.0022 });
  const teeth = (upper: boolean) =>
    paint((_p, _n, sc) => {
      const along = sc[0];
      const e = upper ? sc[1] : 1 - sc[1]; // 0 at the lip, 1 at the seam
      if (e < 0.2 || e > 0.92 || along < 0.04 || along > 0.96) return INK_RGB;
      const k = fract(along * 9 + (upper ? 0 : 0.5));
      if (k < 0.1 || k > 0.9) return INK_RGB;
      return creamPaint;
    });
  const grinOpts = { thickness: 0.0035, rows: 3, cols: 28, skin: "rigid" as const, group: "head" };
  b.membrane(grinEdge(0.02), grinEdge(0), { ...grinOpts, color: teeth(true), bone: head });
  b.membrane(grinEdge(0), grinEdge(-0.016), { ...grinOpts, color: teeth(false), bone: jaw });

  // -------------------------------------------------------------------------------------------------------------
  // The bent hat, tilted over one ear: brim, band, a crown and a flopped-over top with a darned patch.
  const HA = new Vector3(0.2, 1, 0.1).normalize();
  const HB = new Vector3(0.75, 0.22, 0.75).normalize();
  const HAT = new Vector3(0.004, 0.611, 0.022);
  const FB = HAT.clone().addScaledVector(HA, 0.05); // where the crown folds over
  const FN = new Vector3(0, 0, 1).addScaledVector(HB, -HB.z).normalize(); // across the flop, toward the front
  const FS = new Vector3().crossVectors(HB, FN).normalize();
  const patchAt = FB.clone().addScaledVector(HB, 0.038).addScaledVector(FN, 0.044);
  const flopPaint = paint((p, n) => {
    const d = p.clone().sub(patchAt);
    if (n.dot(FN) > 0.4) {
      const c = patchCloth(d.dot(FS) / 0.021, d.dot(HB) / 0.021);
      if (c) return c;
    }
    return feltPaint;
  });
  const hatBase = { bone: head, group: "hat", segments: 14 };
  inkedLathe(
    [
      [0, 0],
      [0.075, -0.004],
      [0.09, 0.002],
      [0.08, 0.01],
      [0, 0.012],
    ],
    feltPaint,
    { at: HAT, axis: HA, ...hatBase },
    0.0028,
  );
  inkedLathe(
    [
      [0, 0.004],
      [0.051, 0.004],
      [0.053, 0.02],
      [0.05, 0.05],
      [0, 0.052],
    ],
    feltPaint,
    { at: HAT, axis: HA, ...hatBase },
    0.0028,
  );
  b.lathe(
    [
      [0.0515, 0.008],
      [0.0558, 0.008],
      [0.0558, 0.024],
      [0.0515, 0.024],
    ],
    { at: HAT, axis: HA, segments: 14, color: INK, bone: head, group: "hat" },
  );
  inkedLathe(
    [
      [0, 0],
      [0.05, 0],
      [0.047, 0.02],
      [0.04, 0.05],
      [0.031, 0.07],
      [0.016, 0.081],
      [0, 0.083],
    ],
    flopPaint,
    { at: FB, axis: HB, ...hatBase },
    0.0028,
  );

  return b.root;
}
