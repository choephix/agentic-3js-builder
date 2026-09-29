// Toon fennec: a cel-shaded cartoon fox in the spirit of Wind Waker and modern anime games. Every colour is a
// two-tone paint (one lit tone, one crisp shadow tone, chosen by the surface normal against a fixed key light), zig-zag
// fur edges divide orange from cream, ink is drawn where it reads (eyes, brows, tear lines, ear insides, toes, tail tip,
// mouth) and the big shiny eyes are SVG drawings shrink-wrapped onto the skull.
import { BufferGeometry, Float32BufferAttribute, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import type { Paint } from "../src/paint";
import type { Chain } from "../src/skeleton";
import type { Surface } from "../src/surface";
import { interpolate } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Toon Fennec",
  description:
    "Cel-shaded cartoon fennec fox: enormous inked ears, big shiny anime eyes, a striped scarf and a bushy ink-tipped tail.",
  builtBy: "Claude Sonnet 5.5",
};

// ---------------------------------------------------------------------------------------------------- cel palette
/** Every surface colour is a pair: the lit tone and the one hard shadow tone (hue shifted, never just darker). */
const LIGHT = new Vector3(0.35, 0.8, 0.5).normalize();
const cel = (lit: string, shade: string) => paint((_p, n) => (n.dot(LIGHT) > 0.1 ? lit : shade));

const ORANGE = cel("#ffb036", "#ee7434");
const RUST = cel("#e8601c", "#b8371c");
const CREAM = cel("#fff4d2", "#f9d4a6");
const PINK = cel("#ff92b6", "#e0568f");
const TEAL = cel("#27dccb", "#1190a0");
const SUN = cel("#ffe94a", "#f2b02a");
const INKC = cel("#3c2258", "#22112f");
const TONGUE = cel("#ff6d8e", "#d23b73");
const INK = "#22112f";
const PLUM = "#7a2350";
const WHITE = "#fffbea";

/** Triangle wave, period 1, range 0..1: the teeth of every zig-zag fur edge. */
const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

// -------------------------------------------------------------------------------------------------- eye drawing
// Drawn for the creature's left eye (seen from the front the outer corner is on the drawing's left); the right eye is
// the same drawing mirrored. Ink eye, two-tone iris, hard highlights, an upper lash flick, a brow and a blush.
const EYE = svg(
  `<svg viewBox="0 0 70 96">
    <defs><clipPath id="iris"><ellipse cx="39" cy="52" rx="22" ry="29"/></clipPath></defs>
    <ellipse cx="17" cy="85" rx="13" ry="7" fill="#ff7aa6"/>
    <path d="M9 89 l4 -7 M16 90 l4 -7 M23 89 l4 -7" stroke="#ff3f7f" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <ellipse cx="39" cy="50" rx="27" ry="35" fill="${INK}"/>
    <g clip-path="url(#iris)">
      <rect x="0" y="0" width="70" height="96" fill="#ff8a1c"/>
      <rect x="0" y="60" width="70" height="40" fill="#ffd23c"/>
      <ellipse cx="39" cy="22" rx="28" ry="15" fill="#d95a12"/>
    </g>
    <ellipse cx="39" cy="52" rx="22" ry="29" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <ellipse cx="39" cy="54" rx="10.5" ry="18" fill="${INK}"/>
    <ellipse cx="29" cy="37" rx="8.5" ry="10.5" fill="#ffffff"/>
    <circle cx="48" cy="67" r="4.4" fill="#ffffff"/>
    <circle cx="52" cy="57" r="2" fill="#ffffff"/>
    <path d="M14 30 Q6 22 2 11" stroke="${INK}" stroke-width="5.5" stroke-linecap="round" fill="none"/>
    <path d="M13 43 Q6 42 1 37" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M29 9 Q44 1 62 11" stroke="${INK}" stroke-width="4.6" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 512 },
);

// ------------------------------------------------------------------------------------------------ 2D outline tools
type P2 = [number, number];

/** The part of a polygon on one side of the horizontal line y = c (Sutherland-Hodgman against one half-plane). */
const clipY = (poly: P2[], c: number, keepBelow: boolean): P2[] => {
  const out: P2[] = [];
  const inside = (p: P2) => (keepBelow ? p[1] <= c : p[1] >= c);
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    if (inside(p)) out.push(p);
    if (inside(p) !== inside(q)) {
      const t = (c - p[1]) / (q[1] - p[1]);
      out.push([p[0] + (q[0] - p[0]) * t, c]);
    }
  }
  return out;
};

/** A sheet of quads shrink-wrapped onto a surface by parallel rays along the gaze: a decal that follows the skull. */
function decal(skin: Surface, center: Vector3, gaze: Vector3, hw: number, hh: number, flip: boolean) {
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), gaze).normalize(); // the viewer's right
  const up = new Vector3().crossVectors(gaze, right).normalize();
  const cols = 8;
  const rows = 10;
  const pos: number[] = [];
  const uv: number[] = [];
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const v = j / rows;
      const origin = center
        .clone()
        .addScaledVector(right, (u - 0.5) * 2 * hw)
        .addScaledVector(up, (v - 0.5) * 2 * hh)
        .addScaledVector(gaze, 0.2);
      const hit = skin.ray(origin, gaze.clone().negate());
      if (!hit) throw new Error("decal(): a ray missed the skull");
      pos.push(...hit.at.clone().addScaledVector(hit.n, 0.0013).toArray());
      uv.push(flip ? 1 - u : u, v);
    }
  const index: number[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      index.push(a, a + 1, a + cols + 2, a, a + cols + 2, a + cols + 1);
    }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

export default function build() {
  const b = createBuilder({ name: "toonFennec", paintSize: 2048 });

  // ------------------------------------------------------------------------------------------------- skeleton
  // One curve runs from the rump through hips, chest and neck to the skull; body and neck are one skinned tube.
  const spineStations = [
    { at: [0, 0.168, -0.09], r: [0.047, 0.052] },
    { at: [0, 0.166, -0.045], r: [0.056, 0.062] }, // hips
    { at: [0, 0.172, 0.02], r: [0.05, 0.058] },
    { at: [0, 0.18, 0.075], r: [0.06, 0.066] }, // chest
    { at: [0, 0.212, 0.12], r: [0.046, 0.047] },
    { at: [0, 0.245, 0.165], r: [0.04, 0.04] },
  ] as const;
  const curve = catmull(spineStations.map((s) => [...s.at] as [number, number, number]));
  const hips = b.joint("hips", { at: spineStations[1].at, aim: spineStations[2].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(curve.knots[1], curve.knots[3]), {
    parent: hips,
    names: ["spine", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[1];
  const neck = b.chain("neck", curve.slice(curve.knots[3], 1), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "body",
  });
  const HEAD_C = new Vector3(0, 0.262, 0.185);
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: spineStations[5].at,
    aim: [0, 0.256, 0.26],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.222, 0.17],
    aim: [0, 0.212, 0.26],
    role: "jaw",
    group: "head",
  });

  // ------------------------------------------------------------------------------------------ body and neck
  const coat = paint((p, n) => {
    const zig = tri(p.z / 0.024);
    const belly = n.y < -0.22 + 0.22 * zig;
    const bib = p.z > 0.085 && n.z > 0.12 + 0.3 * tri(p.x / 0.02);
    if (belly || bib) return CREAM;
    // A zig-zag rust stripe down the spine.
    const saddle = n.y > 0.5 && p.z > -0.1 && p.z < 0.1 && Math.abs(p.x) < 0.006 + 0.009 * tri(p.z / 0.03);
    return saddle ? RUST : ORANGE;
  });
  const knots = curve.knots;
  const radius = (t: number): [number, number] => [
    interpolate(
      knots,
      spineStations.map((s) => s.r[0]),
      t,
    ),
    interpolate(
      knots,
      spineStations.map((s) => s.r[1]),
      t,
    ),
  ];
  const body = b.sweep(curve, radius, { bone: [hips, spine, neck], color: coat, sides: 10, group: "body" });

  // Chest fluff: cream points hanging under the scarf.
  const chestSkin = b.surface(body);
  for (const [az, el] of [
    [-24, -30],
    [-10, -38],
    [4, -34],
    [18, -40],
    [30, -28],
  ] as const) {
    const hit = chestSkin.around([0, 0.16, 0.05]).at(az, el);
    if (!hit) continue;
    b.spike(
      hit,
      hit.n
        .clone()
        .add(new Vector3(0, -0.7, 0.15))
        .normalize(),
      0.032,
      0.012,
      {
        color: CREAM,
        sides: 4,
        group: "body",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------- head
  const skullPaint = paint((p, n) => {
    const cheek = n.y < -0.12 + 0.3 * tri(p.x / 0.024) && p.z > 0.12;
    return cheek ? CREAM : ORANGE;
  });
  const skull = b.part(new SphereGeometry(1, 12, 9), skullPaint, {
    bone: head,
    at: HEAD_C,
    scale: [0.078, 0.066, 0.068],
    group: "head",
  });
  const skullSkin = b.surface(skull);

  // Upper muzzle: cream sides, an orange bridge, a plum mouth roof.
  const muzzlePaint = paint((_p, n) => {
    if (n.y < -0.55) return PLUM;
    return n.y > 0.55 ? ORANGE : CREAM;
  });
  const muzzle = b.sweep(
    [
      [0, 0.25, 0.19],
      [0, 0.241, 0.3],
    ],
    (t) => [0.036 - 0.024 * t, 0.03 - 0.019 * t],
    { bone: head, color: muzzlePaint, sides: 8, caps: { start: "flat", end: "round" }, group: "head" },
  );
  const noseTip = b.part(new SphereGeometry(1, 8, 6), INKC, {
    bone: head,
    at: [0, 0.246, 0.303],
    scale: [0.0145, 0.0115, 0.0115],
    group: "head",
  });
  const shine = b.surface(noseTip).around(noseTip.at).at(0, 62);
  if (shine) b.stick(new SphereGeometry(0.0034, 5, 4), WHITE, shine, { embed: 0.5, bone: head, group: "head" });

  // Lower jaw: cream, with the tongue painted on its upper face. Hinged at the back of the cheeks.
  const jawPaint = paint((_p, n) => (n.y > 0.4 ? TONGUE : CREAM));
  b.sweep(
    [
      [0, 0.219, 0.18],
      [0, 0.213, 0.283],
    ],
    (t) => [0.03 - 0.019 * t, 0.012 - 0.004 * t],
    { bone: jaw, color: jawPaint, sides: 8, caps: { start: "round", end: "round" }, group: "head" },
  );
  for (const s of [1, -1]) {
    b.spike([s * 0.009, 0.233, 0.285], [0, -1, 0.1], 0.013, 0.0034, {
      bone: head,
      color: WHITE,
      sides: 4,
      group: "head",
    });
    b.spike([s * 0.008, 0.224, 0.274], [0, 1, 0.1], 0.011, 0.003, { bone: jaw, color: WHITE, sides: 4, group: "head" });
  }

  // Ink: lip lines along the muzzle, whisker dots and whiskers.
  for (const s of [1, -1]) {
    b.sweep(muzzle.line(s * 116, 0.0008), 0.0017, { bone: head, color: INK, sides: 4, caps: "round", group: "head" });
    const dotSkin = b.surface(muzzle);
    for (const [az, el] of [
      [s * 62, 8],
      [s * 70, -8],
      [s * 56, -24],
    ] as const) {
      const hit = dotSkin.around([0, 0.244, 0.25]).at(az, el);
      if (hit) b.stick(new SphereGeometry(0.0026, 5, 4), INK, hit, { embed: 0.5, bone: head, group: "head" });
    }
    for (const a of [0.004, -0.004, -0.012]) {
      b.sweep(
        catmull([
          [s * 0.024, 0.238 + a, 0.262],
          [s * 0.05, 0.242 + a * 2, 0.264],
          [s * 0.078, 0.247 + a * 2.8, 0.252],
        ]),
        [0.0017, 0.0006],
        { bone: head, color: INK, sides: 4, caps: { start: "flat", end: "point" }, group: "head" },
      );
    }
  }

  // Cheek fluff and a forehead tuft.
  for (const s of [1, -1]) {
    for (const [az, el, len] of [
      [s * 84, -8, 0.04],
      [s * 92, -28, 0.036],
    ] as const) {
      const hit = skullSkin.around(HEAD_C).at(az, el);
      if (!hit) continue;
      b.spike(
        hit,
        new Vector3(s * 0.75, -0.15, -0.45).add(hit.n.clone().multiplyScalar(0.25)).normalize(),
        len,
        0.018,
        {
          color: CREAM,
          sides: 4,
          group: "head",
        },
      );
    }
  }
  for (const [az, el] of [
    [0, 66],
    [26, 60],
    [-26, 60],
  ] as const) {
    const hit = skullSkin.around(HEAD_C).at(az, el);
    if (hit)
      b.spike(hit, new Vector3(0, 0.55, -0.4).add(hit.n).normalize(), 0.04, 0.014, {
        color: ORANGE,
        sides: 4,
        group: "head",
      });
  }

  // Eyes: the drawing shrink-wrapped onto the skull, big enough to be the whole face.
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HEAD_C).at(s * 41, 2)!;
    b.part(decal(skullSkin, hit.at, hit.n, 0.025, 0.033, s > 0), "#ffffff", {
      bone: head,
      at: [0, 0, 0],
      texture: EYE,
      group: "head",
    });
  }

  // ------------------------------------------------------------------------------------------------ ears
  // Two joints per ear: base and tip. Each ear is layered flat slabs (ink rim, coat, ink line, pink inside) cut at the
  // tip joint into a lower and an upper piece; the upper overlaps the lower a little so the cut stays shut when bent.
  const EAR_W = 0.04;
  const EAR_H = 0.19;
  const EAR_CUT = 0.075;
  const earProfile: P2[] = [
    [-0.03, 0.8],
    [0, 0.86],
    [0.015, 1],
    [0.048, 1],
    [0.085, 0.88],
    [0.125, 0.66],
    [0.152, 0.45],
    [0.172, 0.27],
    [0.184, 0.1],
    [EAR_H, 0],
  ];
  const earOutline: P2[] = [
    ...earProfile.map(([y, w]): P2 => [w * EAR_W, y]),
    ...earProfile
      .slice(0, -1)
      .reverse()
      .map(([y, w]): P2 => [-w * EAR_W, y]),
  ];
  const scaled = (k: number): P2[] => earOutline.map(([x, y]): P2 => [x * k, 0.07 + (y - 0.07) * k]);
  const earCoat = paint((_p, _n, s) => (s[1] > 0.132 + 0.014 * tri(s[0] / 0.022) ? INKC : ORANGE));

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const base = new Vector3(s * 0.042, 0.285, 0.15);
    const yD = new Vector3(s * 0.3, 1, -0.1).normalize();
    const xD = new Vector3().crossVectors(yD, new Vector3(0, 0, 1)).normalize();
    const fD = new Vector3().crossVectors(xD, yD).normalize();
    const earBase = b.joint(`ear${side}`, {
      parent: head,
      at: base,
      aim: base.clone().addScaledVector(yD, EAR_CUT),
      role: "hinge",
      group: `ear${side}`,
    });
    const earTip = b.joint(`earTip${side}`, {
      parent: earBase,
      at: base.clone().addScaledVector(yD, EAR_CUT),
      aim: base.clone().addScaledVector(yD, EAR_H),
      role: "hinge",
      group: `ear${side}`,
    });
    const layer = (k: number, z0: number, z1: number, color: string | Paint) => {
      const poly = scaled(k);
      for (const [piece, bone] of [
        [clipY(poly, EAR_CUT, true), earBase],
        [clipY(poly, EAR_CUT - 0.004, false), earTip],
      ] as const)
        b.extrude(piece, {
          at: base.clone().addScaledVector(fD, (z0 + z1) / 2),
          x: xD,
          y: yD,
          thickness: z1 - z0,
          color,
          bone,
          group: `ear${side}`,
        });
    };
    layer(1, -0.004, 0.004, INKC);
    layer(0.92, -0.0052, 0.0052, earCoat);
    layer(0.8, 0, 0.0064, INKC);
    layer(0.7, 0, 0.0077, PINK);
  }

  // ------------------------------------------------------------------------------------------------- legs
  const legs: { side: string; front: boolean; s: number; chain: Chain }[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    legs.push({
      side,
      front: true,
      s,
      chain: b.chain(
        `legF${side}`,
        [
          [s * 0.048, 0.155, 0.07],
          [s * 0.055, 0.088, 0.055],
          [s * 0.052, 0.045, 0.085],
          [s * 0.052, 0.0135, 0.1],
          [s * 0.052, 0.0135, 0.135],
        ],
        {
          parent: chest,
          names: ["shoulder", "elbow", "wrist", "paw"].map((n) => n + side),
          role: "leg",
          contact: [s * 0.052, 0, 0.12],
          group: `legF${side}`,
        },
      ),
    });
    legs.push({
      side,
      front: false,
      s,
      chain: b.chain(
        `legH${side}`,
        [
          [s * 0.05, 0.165, -0.05],
          [s * 0.066, 0.105, -0.005],
          [s * 0.06, 0.062, -0.08],
          [s * 0.058, 0.0135, -0.05],
          [s * 0.058, 0.0135, -0.012],
        ],
        {
          parent: hips,
          names: ["hip", "knee", "hock", "foot"].map((n) => n + side),
          role: "leg",
          contact: [s * 0.058, 0, -0.03],
          group: `legH${side}`,
        },
      ),
    });
  }
  for (const { chain, front, s } of legs) {
    const [, t1, t2, t3] = chain.ts;
    const cx = s * (front ? 0.052 : 0.058);
    const cz = front ? 0.09 : -0.06;
    const keys = front ? [0.03, 0.021, 0.015, 0.0135] : [0.038, 0.025, 0.016, 0.0135];
    const legRadius = (t: number): [number, number] => {
      const r = interpolate([0, t1, t2, t3], keys, t);
      return [r, r * (front ? 1 : 1.1)];
    };
    const sock = paint((p) => (p.y < 0.075 + 0.016 * tri((p.x - cx) / 0.014 + (p.z - cz) / 0.014) ? CREAM : ORANGE));
    b.sweep(chain, legRadius, {
      to: t3,
      color: sock,
      sides: 8,
      caps: { start: "round", end: "flat" },
      group: chain.name,
    });
    const tip = chain.at(1).at;
    const ball = chain.at(t3).at;
    const toeZ = tip.z;
    const pawPaint = paint((p, n) => {
      const d = Math.abs(Math.abs(p.x - cx) - 0.0072);
      return p.z > toeZ - 0.022 && d < 0.0012 && n.y > -0.4 ? INKC : CREAM;
    });
    b.sweep(
      [
        [cx, 0.0135, ball.z - 0.012],
        [cx, 0.0135, tip.z],
      ],
      () => [0.02, 0.0135],
      { bone: chain.joints[3], color: pawPaint, sides: 8, caps: { start: "round", end: "round" }, group: chain.name },
    );
  }

  // -------------------------------------------------------------------------------------------------- tail
  const tailPath = catmull([
    [0, 0.17, -0.1],
    [0, 0.165, -0.17],
    [0, 0.14, -0.24],
    [0, 0.125, -0.31],
    [0, 0.14, -0.375],
    [0, 0.185, -0.42],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 5, role: "tail", group: "tail" });
  const tailPaint = paint((_p, n, s) => {
    const dorsal = Math.abs(((s[1] + 180) % 360) - 180);
    if (s[0] > 0.9 + 0.03 * tri(s[1] / 45)) return INKC;
    if (s[0] > 0.78 + 0.03 * tri(s[1] / 45)) return CREAM;
    if (s[0] < 0.7 && dorsal < 12 + 9 * tri(s[0] / 0.07)) return RUST;
    const under = n.y < -0.15 + 0.3 * tri(s[0] / 0.11);
    return under ? CREAM : ORANGE;
  });
  const tailKeys = [0.036, 0.056, 0.074, 0.077, 0.068, 0.046];
  const tailSweep = b.sweep(
    tail,
    (t) =>
      interpolate(
        tailKeys.map((_, i) => i / (tailKeys.length - 1)),
        tailKeys,
        t,
      ),
    {
      color: tailPaint,
      sides: 10,
      group: "tail",
    },
  );
  for (const t of [0.4, 0.55, 0.7, 0.85])
    for (const ang of [90, -90, 0]) {
      const f = tailSweep.at(t, ang);
      b.spike(f, f.n.clone().multiplyScalar(0.5).addScaledVector(f.tangent, 1.1).normalize(), 0.04, 0.018, {
        color: t > 0.8 ? CREAM : ORANGE,
        sides: 4,
        group: "tail",
      });
    }

  // ------------------------------------------------------------------------------------------------- scarf
  const scarfRing = paint((_p, _n, s) => (Math.floor(s[0] * 16) % 2 === 0 ? TEAL : SUN));
  const scarfBone = neck.joints[0];
  let knot = neck.at(0.22).at;
  for (const t of [0.22, 0.5]) {
    const band = b.ring(neck.at(t), { count: 12, radius: 0.05 });
    b.sweep(catmull(band.items, { closed: true }), 0.0165, {
      color: scarfRing,
      sides: 8,
      bone: scarfBone,
      group: "scarf",
    });
    if (t === 0.22) knot = band.items.reduce((m, it) => (it.at.x > m.at.x ? it : m)).at;
  }
  b.part(new SphereGeometry(0.024, 8, 6), TEAL, { bone: scarfBone, at: knot, group: "scarf" });
  const stripes = (count: number) => paint((_p, _n, s) => (Math.floor(s[0] * count) % 2 === 0 ? TEAL : SUN));
  b.sweep(
    catmull([knot, [0.082, 0.19, 0.06], [0.094, 0.2, 0.0], [0.094, 0.212, -0.06], [0.088, 0.232, -0.112]]),
    (t) => [0.0035, 0.022 + 0.008 * t],
    { section: "box", color: stripes(9), bone: scarfBone, caps: "flat", twist: 50, group: "scarf" },
  );
  b.sweep(catmull([knot, [0.062, 0.16, 0.122], [0.066, 0.125, 0.116]]), (t) => [0.016 + 0.004 * t, 0.0035], {
    section: "box",
    color: stripes(5),
    bone: scarfBone,
    caps: "flat",
    group: "scarf",
  });

  // ------------------------------------------------------------------------------------- open mouth pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 13 });
  return b.root;
}
