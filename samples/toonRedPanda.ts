// Toon red panda: a cel-shaded cartoon adventurer on all fours. Every surface colour is a two-tone paint (one lit tone,
// one crisp shadow tone picked by the surface normal against a fixed key light), zig-zag fur edges split rust from cream
// and plum, ink is drawn where it reads (eyes, brows, tear stripes, ear rims, mouth, whiskers) and the big shiny
// anime eyes are SVG drawings shrink-wrapped onto the skull. A brass-and-leather pair of goggles sits on the forehead,
// a tiny teal backpack with a bedroll rides the back, and the banded tail is the biggest shape on the model.
import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
} from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import type { Chain } from "../src/skeleton";
import type { Surface } from "../src/surface";
import { interpolate } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Toon Red Panda",
  description:
    "Cel-shaded cartoon red panda adventurer on all fours: big shiny anime eyes, brass goggles on the forehead, a tiny teal backpack with a bedroll and a fat banded tail.",
  builtBy: "Claude Sonnet 5.5",
};

// ---------------------------------------------------------------------------------------------------- cel palette
/** Every surface colour is a pair: the lit tone and the one hard shadow tone (hue shifted, never just darker). */
const LIGHT = new Vector3(0.35, 0.8, 0.5).normalize();
const cel = (lit: string, shade: string) => paint((_p, n) => (n.dot(LIGHT) > 0.1 ? lit : shade));

const RUST = cel("#ff6a2b", "#d63a2c");
const GOLD = cel("#ffb04a", "#f0803e");
const CREAM = cel("#fff6df", "#f8d2b4");
const DARK = cel("#82406a", "#47204a");
const INKC = cel("#3c2258", "#22112f");
const TEAL = cel("#22d9b4", "#0e8f9a");
const MINT = cel("#7af0cf", "#25b59e");
const BRASS = cel("#ffd93d", "#e79a14");
const LEATHER = cel("#c2632f", "#8a3524");
const GLASS = cel("#3fe6ff", "#1c8fe0");
const TIN = cel("#e2efff", "#98aee0");
const SUN = cel("#ffe94a", "#f2b02a");
const TONGUE = cel("#ff6d8e", "#d23b73");
const INK = "#22112f";
const PLUM = "#7a2350";
const WHITE = "#fffbea";

/** Triangle wave, period 1, range 0..1: the teeth of every zig-zag fur edge. */
const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

// -------------------------------------------------------------------------------------------------- drawings
// Drawn for the creature's left eye (seen from the front the outer corner is on the drawing's left); the right eye is
// the same drawing mirrored. Ink eye, two-tone chestnut iris, hard highlights, an upper lash flick, a brow and a blush.
const EYE = svg(
  `<svg viewBox="0 0 70 96">
    <defs><clipPath id="iris"><ellipse cx="39" cy="52" rx="22" ry="29"/></clipPath></defs>
    <ellipse cx="17" cy="85" rx="13" ry="7" fill="#ff7aa6"/>
    <path d="M9 89 l4 -7 M16 90 l4 -7 M23 89 l4 -7" stroke="#ff3f7f" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <ellipse cx="39" cy="50" rx="27" ry="35" fill="${INK}"/>
    <g clip-path="url(#iris)">
      <rect x="0" y="0" width="70" height="96" fill="#b8501c"/>
      <rect x="0" y="58" width="70" height="40" fill="#ffb43a"/>
      <ellipse cx="39" cy="22" rx="28" ry="15" fill="#6d2410"/>
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

/** Glints laid over the goggle glass: one fat slash, one thin, one dot, all hard white. */
const GLINT = svg(
  `<svg viewBox="0 0 64 64">
    <path d="M14 40 Q14 22 30 14 L36 18 Q24 24 22 42 Z" fill="#ffffff"/>
    <path d="M44 16 L50 20 Q52 26 50 32 L45 30 Q46 24 44 16 Z" fill="#ffffff"/>
    <circle cx="44" cy="46" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
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
      pos.push(...hit.at.clone().addScaledVector(hit.n, 0.0016).toArray());
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
  const b = createBuilder({ name: "toonRedPanda", paintSize: 2048 });

  // ------------------------------------------------------------------------------------------------- skeleton
  // One curve runs from the rump through hips, chest and neck to the skull; body and neck are one skinned tube.
  const spineStations = [
    { at: [0, 0.205, -0.19], r: [0.07, 0.078] },
    { at: [0, 0.21, -0.12], r: [0.088, 0.094] }, // hips
    { at: [0, 0.214, -0.04], r: [0.092, 0.098] },
    { at: [0, 0.218, 0.05], r: [0.096, 0.1] }, // chest
    { at: [0, 0.226, 0.12], r: [0.088, 0.09] },
    { at: [0, 0.248, 0.168], r: [0.068, 0.07] },
    { at: [0, 0.275, 0.212], r: [0.058, 0.06] },
  ] as const;
  const curve = catmull(spineStations.map((s) => [...s.at] as [number, number, number]));
  const hips = b.joint("hips", { at: spineStations[1].at, aim: spineStations[2].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(curve.knots[1], curve.knots[4]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", curve.slice(curve.knots[4], 1), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "body",
  });
  const HEAD_C = new Vector3(0, 0.3, 0.29);
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: spineStations[6].at,
    aim: [0, 0.29, 0.3],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.262, 0.285],
    aim: [0, 0.258, 0.38],
    role: "jaw",
    group: "head",
  });

  // ------------------------------------------------------------------------------------------ body and neck
  const coat = paint((p, n) => {
    if (n.z < -0.5) return RUST;
    const zig = tri(p.z / 0.03);
    const d = n.y - (-0.1 + 0.26 * zig);
    if (Math.abs(d) < 0.03) return INKC;
    if (d < 0) return DARK;
    // A zig-zag golden stripe down the spine.
    const saddle = n.y > 0.55 && p.z > -0.16 && p.z < 0.12 && Math.abs(p.x) < 0.008 + 0.012 * tri(p.z / 0.034);
    return saddle ? GOLD : RUST;
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
  const bodySkin = b.surface(body);

  // ------------------------------------------------------------------------------------------------- head
  const skullPaint = paint((p, n) => {
    const dx = Math.abs(p.x);
    const dy = p.y - HEAD_C.y;
    const dz = p.z - HEAD_C.z;
    // Cream lower face and cheeks with a zig-zag edge running up past the eyes.
    if (dz > -0.03 && dy < -0.004 + 0.016 * tri(dx / 0.022)) {
      // The rust tear stripe from the eye down to the mouth corner.
      const cx = 0.064 - (-dy - 0.012) * 0.2;
      if (dy < -0.014 && dy > -0.07 && dz > 0.02 && Math.abs(dx - cx) < 0.0055 && n.y < 0.5) return RUST;
      return CREAM;
    }
    // A cream brow patch between the eyes, pointing down the nose bridge.
    if (dz > 0.05 && dx < 0.012 + 0.008 * tri(dy / 0.02) && dy < 0.05) return CREAM;
    return RUST;
  });
  const skull = b.part(new SphereGeometry(1, 14, 10), skullPaint, {
    bone: head,
    at: HEAD_C,
    scale: [0.105, 0.088, 0.085],
    group: "head",
  });
  const skullSkin = b.surface(skull);

  // Upper muzzle: cream, with a plum mouth roof.
  const muzzlePaint = paint((_p, n) => (n.y < -0.55 ? PLUM : CREAM));
  const muzzle = b.sweep(
    [
      [0, 0.288, 0.335],
      [0, 0.28, 0.392],
    ],
    (t) => [0.05 - 0.026 * t, 0.04 - 0.02 * t],
    { bone: head, color: muzzlePaint, sides: 8, caps: { start: "flat", end: "round" }, group: "head" },
  );
  const noseTip = b.part(new SphereGeometry(1, 8, 6), INKC, {
    bone: head,
    at: [0, 0.29, 0.402],
    scale: [0.02, 0.0155, 0.0155],
    group: "head",
  });
  const shine = b.surface(noseTip).around(noseTip.at).at(0, 62);
  if (shine) b.stick(new SphereGeometry(0.0045, 5, 4), WHITE, shine, { embed: 0.5, bone: head, group: "head" });

  // Lower jaw: cream, with the tongue painted on its upper face. Hinged at the back of the cheeks.
  const jawPaint = paint((_p, n) => (n.y > 0.4 ? TONGUE : CREAM));
  b.sweep(
    [
      [0, 0.262, 0.29],
      [0, 0.257, 0.382],
    ],
    (t) => [0.043 - 0.022 * t, 0.016 - 0.005 * t],
    { bone: jaw, color: jawPaint, sides: 8, caps: { start: "round", end: "round" }, group: "head" },
  );
  for (const s of [1, -1]) {
    b.spike([s * 0.012, 0.272, 0.385], [0, -1, 0.1], 0.016, 0.0046, {
      bone: head,
      color: WHITE,
      sides: 4,
      group: "head",
    });
    b.spike([s * 0.011, 0.262, 0.372], [0, 1, 0.1], 0.013, 0.0038, {
      bone: jaw,
      color: WHITE,
      sides: 4,
      group: "head",
    });
  }

  // Ink: lip lines along the muzzle, whisker dots and whiskers.
  for (const s of [1, -1]) {
    b.sweep(muzzle.line(s * 116, 0.001), 0.0021, { bone: head, color: INK, sides: 4, caps: "round", group: "head" });
    const dotSkin = b.surface(muzzle);
    for (const [az, el] of [
      [s * 62, 8],
      [s * 70, -8],
      [s * 56, -24],
    ] as const) {
      const hit = dotSkin.around([0, 0.285, 0.36]).at(az, el);
      if (hit) b.stick(new SphereGeometry(0.0032, 5, 4), INK, hit, { embed: 0.5, bone: head, group: "head" });
    }
    for (const a of [0.006, -0.004, -0.014]) {
      b.sweep(
        catmull([
          [s * 0.032, 0.284 + a, 0.365],
          [s * 0.078, 0.288 + a * 2, 0.372],
          [s * 0.128, 0.294 + a * 2.6, 0.352],
        ]),
        [0.0021, 0.0007],
        { bone: head, color: INK, sides: 4, caps: { start: "flat", end: "point" }, group: "head" },
      );
    }
  }

  // Cheek fluff: big cream points sweeping back and out, and a rust forehead tuft between the ears.
  for (const s of [1, -1]) {
    for (const [az, el, len] of [
      [s * 78, 2, 0.05],
      [s * 88, -16, 0.056],
      [s * 98, -34, 0.048],
    ] as const) {
      const hit = skullSkin.around(HEAD_C).at(az, el);
      if (!hit) continue;
      b.spike(hit, new Vector3(s * 0.8, -0.2, -0.4).add(hit.n.clone().multiplyScalar(0.25)).normalize(), len, 0.024, {
        color: CREAM,
        sides: 4,
        group: "head",
      });
    }
    // Small cream brow tufts over the eyes.
    const brow = skullSkin.around(HEAD_C).at(s * 34, 36);
    if (brow)
      b.spike(brow, new Vector3(s * 0.5, 0.6, 0.1).add(brow.n).normalize(), 0.026, 0.011, {
        color: CREAM,
        sides: 4,
        group: "head",
      });
  }

  // Eyes: the drawing shrink-wrapped onto the skull, big enough to be the whole face.
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HEAD_C).at(s * 41, 2)!;
    b.part(decal(skullSkin, hit.at, hit.n, 0.034, 0.044, s > 0), "#ffffff", {
      bone: head,
      at: [0, 0, 0],
      texture: EYE,
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------------------------- goggles
  // A leather strap rides the head just above the eyes and dips below the ears round the back; two brass-framed lenses
  // are pushed up on the forehead, tilted to catch the light, with a brass bridge between them.
  const strapPoints: Vector3[] = [];
  for (let az = -180; az < 180; az += 30) {
    const el = 20 + 22 * Math.min(1, Math.max(0, (110 - Math.abs(az)) / 40));
    const hit = skullSkin.around(HEAD_C).at(az, el);
    if (hit) strapPoints.push(hit.at.clone().addScaledVector(hit.n, 0.005));
  }
  b.sweep(catmull(strapPoints, { closed: true }), 0.0075, {
    color: LEATHER,
    sides: 6,
    bone: head,
    group: "goggles",
  });
  const lensAt: Vector3[] = [];
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HEAD_C).at(s * 33, 56)!;
    const c = hit.at.clone().addScaledVector(hit.n, 0.004);
    lensAt.push(c);
    b.lathe(
      [
        [0.02, 0],
        [0.034, 0],
        [0.037, 0.008],
        [0.032, 0.016],
        [0.02, 0.016],
      ],
      { at: c, axis: hit.n, bone: head, segments: 10, color: BRASS, group: "goggles" },
    );
    b.lathe(
      [
        [0, 0.004],
        [0.022, 0.004],
        [0.021, 0.01],
        [0.013, 0.0145],
        [0, 0.016],
      ],
      { at: c, axis: hit.n, bone: head, segments: 10, color: GLASS, group: "goggles" },
    );
    b.part(new PlaneGeometry(0.04, 0.04), "#ffffff", {
      bone: head,
      at: c.clone().addScaledVector(hit.n, 0.0172),
      dir: hit.n,
      axis: "z",
      texture: GLINT,
      group: "goggles",
    });
  }
  b.capsule(lensAt[0], lensAt[1], 0.0075, { bone: head, color: BRASS, sides: 6, group: "goggles" });

  // ------------------------------------------------------------------------------------------------ ears
  // Two joints per ear: base and tip. Each ear is layered flat slabs (ink rim, rust back, ink line, cream inside) cut at
  // the tip joint into a lower and an upper piece; the upper overlaps the lower a little so the cut stays shut when bent.
  const EAR_CUT = 0.04;
  const earOutline: P2[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = (Math.PI * i) / 16;
    const c = Math.cos(a);
    earOutline.push([
      0.05 * Math.sign(c) * Math.abs(c) ** 1.25,
      0.092 * Math.sin(a) + (i === 0 || i === 16 ? 0.002 : 0),
    ]);
  }
  earOutline.push([-0.046, -0.02], [0.046, -0.02]);
  const scaled = (k: number): P2[] => earOutline.map(([x, y]): P2 => [x * k, 0.03 + (y - 0.03) * k]);

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const base = new Vector3(s * 0.064, 0.356, 0.262);
    const yD = new Vector3(s * 0.34, 1, -0.08).normalize();
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
      aim: base.clone().addScaledVector(yD, 0.092),
      role: "hinge",
      group: `ear${side}`,
    });
    const layer = (k: number, z0: number, z1: number, color: typeof RUST) => {
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
    layer(1, -0.0055, 0.0055, INKC);
    layer(0.93, -0.0068, 0.0068, RUST);
    layer(0.8, 0, 0.0082, INKC);
    layer(0.71, 0, 0.0096, CREAM);
  }

  // ------------------------------------------------------------------------------------------------- legs
  // Every leg is a smooth tube over shoulder/elbow/wrist/paw (or hip/knee/hock/foot); the paw is a flat capsule on the
  // last joint and three toe joints fan out from it, each with a toe capsule and a cream claw.
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
          [s * 0.066, 0.185, 0.085],
          [s * 0.074, 0.115, 0.07],
          [s * 0.07, 0.056, 0.1],
          [s * 0.07, 0.02, 0.118],
          [s * 0.07, 0.02, 0.148],
        ],
        {
          parent: chest,
          names: ["shoulder", "elbow", "wrist", "paw"].map((n) => `${n}F${side}`),
          role: "leg",
          contact: [s * 0.07, 0, 0.16],
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
          [s * 0.072, 0.2, -0.11],
          [s * 0.09, 0.125, -0.07],
          [s * 0.08, 0.068, -0.14],
          [s * 0.078, 0.02, -0.105],
          [s * 0.078, 0.02, -0.072],
        ],
        {
          parent: hips,
          names: ["hip", "knee", "hock", "foot"].map((n) => `${n}H${side}`),
          role: "leg",
          contact: [s * 0.078, 0, -0.06],
          group: `legH${side}`,
        },
      ),
    });
  }
  for (const { chain, front, side } of legs) {
    const [, t1, t2, t3] = chain.ts;
    const pts = chain.joints.map((j) => j.at);
    const heel = pts[3];
    const toeBase = chain.at(1).at;
    const cx = heel.x;
    const cut = front ? 0.125 : 0.135;
    const keys = front ? [0.042, 0.031, 0.025, 0.021] : [0.056, 0.037, 0.027, 0.022];
    const legRadius = (t: number): [number, number] => {
      const r = interpolate([0, t1, t2, t3], keys, t);
      return [r, r * (front ? 1 : 1.08)];
    };
    const sock = paint((p) => {
      const d = p.y - (cut + 0.018 * tri((p.x + p.z) / 0.034));
      if (Math.abs(d) < 0.0028) return INKC;
      return d > 0 ? RUST : DARK;
    });
    const F = front ? "F" : "H";
    b.sweep(chain, legRadius, {
      to: t3,
      color: sock,
      sides: 8,
      caps: { start: "round", end: "flat" },
      group: chain.name,
    });
    b.sweep(
      [
        [cx, 0.02, heel.z],
        [cx, 0.02, toeBase.z],
      ],
      (t) => [0.024 - 0.002 * t, 0.02],
      { bone: chain.joints[3], color: DARK, sides: 8, caps: { start: "round", end: "round" }, group: chain.name },
    );
    for (const k of [-1, 0, 1]) {
      const toe = b.joint(`toe${F}${k + 2}${side}`, {
        parent: chain.joints[3],
        at: [cx + k * 0.0135, 0.0105, toeBase.z],
        aim: [cx + k * 0.019, 0.0105, toeBase.z + (k === 0 ? 0.034 : 0.03)],
        role: "digit",
        group: chain.name,
      });
      const tipZ = toeBase.z + (k === 0 ? 0.034 : 0.03);
      b.capsule([cx + k * 0.0135, 0.0105, toeBase.z], [cx + k * 0.019, 0.0105, tipZ], [0.0118, 0.0105], {
        bone: toe,
        color: DARK,
        sides: 6,
        group: chain.name,
      });
      b.spike([cx + k * 0.019, 0.0085, tipZ + 0.006], [0, -0.35, 1], 0.014, 0.0052, {
        bone: toe,
        color: CREAM,
        sides: 4,
        group: chain.name,
      });
    }
  }

  // -------------------------------------------------------------------------------------------------- tail
  const tailPath = catmull([
    [0, 0.2, -0.14],
    [0, 0.208, -0.2],
    [0.008, 0.226, -0.27],
    [0.03, 0.252, -0.33],
    [0.055, 0.292, -0.39],
    [0.068, 0.338, -0.428],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 6, role: "tail", group: "tail" });
  const TAIL_BANDS = 8;
  const tailBand = (t: number) => (Math.floor(t * TAIL_BANDS) % 2 === 0 ? RUST : GOLD);
  const tailPaint = paint((_p, _n, s) => {
    const t = s[0] + 0.014 * tri(s[1] / 45);
    if (t > 0.945) return CREAM;
    if (t > 0.93) return INKC;
    const f = t * TAIL_BANDS - Math.floor(t * TAIL_BANDS);
    if (t > 0.06 && (f < 0.07 || f > 0.93)) return INKC;
    return tailBand(t);
  });
  const tailKeys = [0.05, 0.078, 0.1, 0.104, 0.092, 0.06];
  const tailSweep = b.sweep(
    tail,
    (t) =>
      interpolate(
        tailKeys.map((_, i) => i / (tailKeys.length - 1)),
        tailKeys,
        t,
      ),
    { color: tailPaint, sides: 10, group: "tail" },
  );
  for (const t of [0.42, 0.64, 0.84])
    for (const ang of [90, -90, 0]) {
      const f = tailSweep.at(t, ang);
      b.spike(f, f.n.clone().multiplyScalar(0.5).addScaledVector(f.tangent, 1.2).normalize(), 0.06, 0.03, {
        color: tailBand(t + 0.03),
        sides: 4,
        group: "tail",
      });
    }

  // -------------------------------------------------------------------------------------------- backpack
  // A tiny teal pack with a mint flap, brass buckle and a rolled yellow bedroll, held by two leather girth straps, with a
  // tin cup hanging off the side.
  const packBone = spine.joints[1];
  const PACK_AT = new Vector3(0, 0.285, -0.01);
  const packOutline: P2[] = [
    [-0.052, 0],
    [0.048, 0],
    [0.056, 0.04],
    [0.05, 0.09],
    [0.03, 0.108],
    [-0.03, 0.11],
    [-0.05, 0.095],
    [-0.058, 0.04],
  ];
  b.extrude(packOutline, {
    at: PACK_AT,
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.112,
    bevel: 0.012,
    smoothing: 1,
    color: TEAL,
    bone: packBone,
    group: "pack",
  });
  b.extrude(
    [
      [-0.057, 0.05],
      [-0.058, 0.096],
      [-0.03, 0.114],
      [0.03, 0.113],
      [0.056, 0.098],
      [0.064, 0.06],
      [0.066, 0.03],
      [0.05, 0.026],
      [0.03, 0.05],
    ],
    {
      at: PACK_AT,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.124,
      bevel: 0.008,
      smoothing: 1,
      color: MINT,
      bone: packBone,
      group: "pack",
    },
  );
  b.part(new BoxGeometry(0.032, 0.03, 0.01), BRASS, {
    bone: packBone,
    at: [0, PACK_AT.y + 0.036, PACK_AT.z + 0.067],
    group: "pack",
  });
  b.part(new BoxGeometry(0.014, 0.014, 0.004), INKC, {
    bone: packBone,
    at: [0, PACK_AT.y + 0.036, PACK_AT.z + 0.0735],
    group: "pack",
  });
  b.part(new CylinderGeometry(0.026, 0.026, 0.13, 8), SUN, {
    bone: packBone,
    at: [0, PACK_AT.y + 0.128, PACK_AT.z - 0.002],
    dir: [1, 0, 0],
    group: "pack",
  });
  for (const x of [-0.033, 0.033])
    b.part(new CylinderGeometry(0.0285, 0.0285, 0.014, 8), LEATHER, {
      bone: packBone,
      at: [x, PACK_AT.y + 0.128, PACK_AT.z - 0.002],
      dir: [1, 0, 0],
      group: "pack",
    });
  for (const z of [-0.06, 0.05]) {
    const ring: Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ring.push(new Vector3(0.14 * Math.sin(a), 0.215 + 0.14 * Math.cos(a), z));
    }
    b.sweep(bodySkin.drape(catmull(ring, { closed: true }), { lift: 0.003 }), 0.0065, {
      color: LEATHER,
      sides: 6,
      group: "pack",
    });
  }
  b.lathe(
    [
      [0, 0],
      [0.013, 0],
      [0.017, 0.032],
      [0.0148, 0.032],
      [0.0115, 0.006],
      [0, 0.006],
    ],
    {
      at: [0.076, PACK_AT.y + 0.022, PACK_AT.z - 0.01],
      axis: [0, 1, 0],
      bone: packBone,
      segments: 8,
      color: TIN,
      group: "pack",
    },
  );

  // ------------------------------------------------------------------------------------- open mouth pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 13 });
  return b.root;
}
