import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { DEG } from "../src/math";
import { bezier, catmull } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "King cobra, rearing",
  description:
    "A king cobra rearing up from a glowing floor sigil, hood spread: emerald body with lime chevrons and scale edges, cream throat, gold hood trim, collar and brows, glowing gold eyes, magic motes and a magenta forked tongue.",
  style: "League of Legends",
  commit: "b816db2",
};

// Palette: saturated emerald and lime against cream and gold, shaded with hard cel tones.
const EMERALD = "#0fa35f";
const SCALE_EDGE = "#0a6b43";
const LIME = "#d6f23a";
const CREAM = "#fff0a8";
const HOOD = "#0b7d4f";
const PALE = "#fff27a";
const GOLD = "#ffc83d";
const IVORY = "#fff7e0";
const MAGENTA = "#ff3fa4";
const MOTE = "#fff27a";

// Hood outline in its own plane (x sideways, y up), drawn round from the neck base.
const HOOD_OUTLINE: number[][] = [
  [0.0, 0.0],
  [0.07, 0.0],
  [0.15, 0.1],
  [0.2, 0.2],
  [0.22, 0.29],
  [0.17, 0.36],
  [0.08, 0.39],
  [0.0, 0.37],
  [-0.08, 0.39],
  [-0.17, 0.36],
  [-0.22, 0.29],
  [-0.2, 0.2],
  [-0.15, 0.1],
  [-0.07, 0.0],
];
const HOOD_AT: [number, number, number] = [0, 0.8, 0.12];
const HOOD_THICK = 0.035;

const EYE = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="50%" cy="40%" r="60%">
    <stop offset="0" stop-color="#fff6b0"/><stop offset="0.45" stop-color="#ffc83d"/><stop offset="1" stop-color="#e0751c"/>
  </radialGradient></defs>
  <ellipse cx="32" cy="40" rx="29" ry="37" fill="#22112f"/>
  <ellipse cx="32" cy="40" rx="24" ry="32" fill="url(#g)"/>
  <ellipse cx="32" cy="40" rx="6" ry="27" fill="#120818"/>
  <ellipse cx="25" cy="26" rx="5" ry="7" fill="#ffffff"/>
  <circle cx="40" cy="55" r="2.5" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);

// A summoning sigil on the floor under the coil: gold rings, a dashed ring and rune strokes.
const SIGIL = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ffd45a" stroke-linecap="round">
  <circle cx="128" cy="128" r="120" stroke-width="10"/>
  <circle cx="128" cy="128" r="100" stroke-width="5" stroke-dasharray="14 10"/>
  <circle cx="128" cy="128" r="78" stroke-width="4"/>
  <polygon points="128,36 210,176 46,176" stroke-width="5"/>
  <polygon points="128,220 46,80 210,80" stroke-width="5"/>
  <path d="M128 60 L128 196 M100 92 L128 70 L156 92 M100 164 L128 186 L156 164" stroke-width="4"/>
  <circle cx="128" cy="128" r="12" fill="#ffd45a" stroke="none"/>
</svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "kingCobra" });

  // Body centreline, tail tip to head: a 1.4-turn floor coil whose inner end rises at the front into a rearing neck.
  const pts: number[][] = [];
  const COIL_DEG = 510;
  for (let i = 0; i <= 56; i++) {
    const phi = (i / 56) * COIL_DEG;
    const th = (-60 + phi) * DEG;
    const R = 0.56 - 0.23 * (phi / COIL_DEG);
    const k = Math.max(0, 1 - phi / 70); // the tail tip lifts off the floor gently
    pts.push([R * Math.cos(th), 0.065 - 0.053 * k * k, R * Math.sin(th)]);
  }
  pts.push([0.03, 0.26, 0.31], [0.0, 0.52, 0.24], [0.0, 0.8, 0.15], [0.0, 1.04, 0.13], [0.0, 1.2, 0.14]);
  const body = catmull(pts);
  const BODY_LEN = body.length;

  // Skeleton: a root in the coil, a tail chain back, a neck chain up, then the head and a lower jaw.
  const core = b.joint("core", { at: body.at(0.4), role: "spine" });
  const rootT = body.closestT(core.at);
  const tail = b.chain("tail", body.slice(rootT, 0), { parent: core, count: 6, role: "tail" });
  const neck = b.chain("neck", body.slice(rootT, 1), { parent: core, count: 10, role: "neck" });
  const neckTip = neck.joints[neck.joints.length - 1];
  const hoodJoint = neck.joints[7];

  const head = b.joint("head", { parent: neckTip, at: [0, 1.2, 0.14], aim: [0, 1.14, 0.42], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, up: -0.08 }),
    aim: head.local({ forward: 0.3, up: -0.11 }),
    role: "jaw",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 }); // mouth gaping a little, fangs showing

  // Paints. Body: lime chevrons and a scale-edge grid over emerald, a narrow cream throat. Head: a lime crown stripe
  // and cream throat. Hood: gold-ringed spectacles and lime chevrons.
  const bodyPaint = paint((_p, _n, s) => {
    const [t, deg] = s;
    const rad = deg * DEG;
    if (Math.cos(rad) < -0.9) return CREAM;
    const u = (t * BODY_LEN) / 0.14 - 0.4 * Math.abs(Math.sin(rad));
    if (u - Math.floor(u) < 0.26) return LIME;
    // Scales: rows along the body, staggered, each cell outlined in a darker emerald.
    const along = (t * BODY_LEN) / 0.04;
    const row = Math.floor(along);
    const around = (deg / 360) * 14 + 0.5 * (row % 2);
    const fa = along - row;
    const fb = around - Math.floor(around);
    return fa < 0.12 || fb < 0.14 ? SCALE_EDGE : EMERALD;
  });
  const headPaint = paint((p, n) => {
    if (n.y < -0.35) return CREAM;
    return n.y > 0.5 && Math.abs(p.x) < 0.013 ? LIME : EMERALD;
  });
  const hoodPaint = paint((_p, _n, s) => {
    const [x, y] = s;
    for (const cx of [-0.1, 0.1]) {
      const r = Math.hypot((x - cx) / 0.06, (y - 0.22) / 0.085);
      if (r < 0.42) return PALE;
      if (r < 0.66) return INK;
      if (r < 0.9) return PALE;
    }
    const f = (y + 0.5 * Math.abs(x)) / 0.08;
    return Math.abs(x) > 0.1 && f - Math.floor(f) < 0.3 ? LIME : HOOD;
  });
  const SKIN = cel(bodyPaint);
  const HEADC = cel(headPaint);
  const HOODC = cel(hoodPaint);

  // Body: one tube over tail, root and neck.
  const skin = b.sweep(body, [0.012, 0.04, 0.062, 0.066, 0.066, 0.064, 0.06, 0.056, 0.054], {
    bone: [tail, core, neck],
    color: SKIN,
    sides: 10,
    caps: { start: "point", end: "round" },
  });
  b.along(skin, 34, (at) => b.spike(at, at, 0.03, 0.009, { color: LIME })); // dorsal ridge spines

  // Floor sigil under the coil: a glowing gold summoning ring.
  glow(
    b.part(new THREE.CircleGeometry(0.74, 56), "#ffffff", {
      at: [0, 0.002, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: SIGIL,
      name: "sigil",
    }),
    1.2,
  );

  // Gold collar just under the hood, a filigree ring on the neck.
  const collar = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    collar.push([0.066 * Math.cos(a), 0.73 + 0.012 * Math.sin(a * 3), 0.17 + 0.066 * Math.sin(a)]);
  }
  b.sweep(catmull(collar, { closed: true }), 0.011, { color: GOLD, bone: neck.joints[6] });

  // Magic motes: small glowing orbs drifting round the head, riding its bone.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const r = 0.3 + 0.05 * Math.sin(3 * a);
    glow(
      b.part(new THREE.SphereGeometry(0.016, 6, 4), MOTE, {
        bone: head,
        at: [r * Math.cos(a), 1.2 + 0.1 * Math.sin(a), 0.2 + 0.08 * Math.sin(2 * a)],
      }),
      2.5,
    );
  }

  // Head: a wedge skull from the neck to the snout, a lower jaw, fangs, glowing eyes, gold brows, a forked tongue.
  const skull = b.loft(
    [
      { at: head.local({ forward: -0.02 }), w: 0.15, h: 0.13 },
      { at: head.local({ forward: 0.08, up: 0.01 }), w: 0.18, h: 0.15 },
      { at: head.local({ forward: 0.17 }), w: 0.14, h: 0.11 },
      { at: head.local({ forward: 0.25, up: -0.02 }), w: 0.09, h: 0.08 },
    ],
    { bone: head, color: HEADC, detail: 0.75 },
  );
  b.part(new THREE.SphereGeometry(0.045, 10, 8), HEADC, {
    bone: head,
    at: head.local({ forward: 0.25, up: -0.02 }),
    scale: [1, 0.9, 1.1],
  });
  b.loft(
    [
      { at: jaw.local({ forward: -0.01 }), w: 0.1, h: 0.045 },
      { at: jaw.local({ forward: 0.09 }), w: 0.095, h: 0.038 },
      { at: jaw.local({ forward: 0.18, up: 0.01 }), w: 0.065, h: 0.034 },
      { at: jaw.local({ forward: 0.24, up: 0.02 }), w: 0.025, h: 0.025 },
    ],
    { bone: jaw, color: CREAM, detail: 0.6 },
  );
  for (const s of [1, -1]) {
    glow(
      b.decal(skull, EYE, {
        at: head.local({ left: s * 0.072, forward: 0.1, up: 0.03 }),
        dir: [s, 0.35, 0.5],
        size: [0.06, 0.08],
        mirror: s > 0,
      }),
      1.6,
    );
    b.sweep(
      bezier(
        head.local({ left: s * 0.085, forward: 0.02, up: 0.07 }),
        head.local({ left: s * 0.085, forward: 0.08, up: 0.1 }),
        head.local({ left: s * 0.07, forward: 0.15, up: 0.08 }),
      ),
      0.009,
      { bone: head, color: GOLD },
    );
    b.spike(head.moved({ left: s * 0.03, forward: 0.2, up: -0.03 }), head.dir([0, 0.25, -1]), 0.065, 0.009, {
      color: IVORY,
    });
  }
  const tongueRoot = jaw.local({ forward: 0.22, up: 0.0 });
  const tongueFork = jaw.local({ forward: 0.34, up: -0.02 });
  glow(
    b.sweep(bezier(tongueRoot, jaw.local({ forward: 0.28, up: 0.02 }), tongueFork), [0.007, 0.004], {
      bone: jaw,
      color: MAGENTA,
    }),
    1.2,
  );
  for (const s of [1, -1]) {
    const prong = bezier(
      tongueFork,
      jaw.local({ left: s * 0.006, forward: 0.38, up: -0.03 }),
      jaw.local({ left: s * 0.012, forward: 0.43, up: -0.035 }),
    );
    glow(b.sweep(prong, 0.0035, { bone: jaw, color: MAGENTA }), 1.2);
  }

  // Hood: a flat extruded plate behind the head, spectacles painted on its face, gold trim round the edge.
  const hood = b.extrude(HOOD_OUTLINE, {
    at: HOOD_AT,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: HOOD_THICK,
    bevel: 0.01,
    smoothing: 2,
    color: HOODC,
    bone: hoodJoint,
  });
  const trim = HOOD_OUTLINE.map(([x, y]) => hood.local([x, y, HOOD_THICK / 2 + 0.003]));
  b.sweep(catmull(trim, { closed: true }), 0.008, { color: GOLD, bone: hoodJoint });

  return b.root;
}
