import * as THREE from "three";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, mix, noise, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Coiled Leviathan",
  description:
    "A sea-serpent leviathan rising out of a rock mound, its body stacked in a helical coil on boulders, with a horned, armoured head, gold-banded neck, coral sail and painted teal scales.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

// Palette: teal hide, cream belly, worn gold trim, bone horns, coral sail, earth and rock.
const TEAL = "#17807a";
const TEAL_L = "#2fb3a0";
const TEAL_D = "#0a4a4f";
const JADE = "#7be3c4";
const BELLY = "#f6e7b0";
const GOLD = "#e9b43e";
const GOLD_HI = "#fff0a6";
const BONE = "#f3e8c9";
const TOOTH = "#fff8ea";
const STEEL = "#aab2bc";
const INK = "#1d1424";
const MOUTH = "#6e1830";
const CORAL = "#e4574a";
const CORAL_D = "#8f2a3a";
const EARTH_D = "#4a3a2a";
const EARTH_L = "#8f7050";
const MOSS = "#5c9a3a";
const ROCK_D = "#4f4a48";
const ROCK_L = "#9d9489";

const EYE_SVG = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 56">
<path d="M2 28 Q50 -8 98 28 Q50 64 2 28Z" fill="#1a0c06"/>
<path d="M9 28 Q50 2 91 28 Q50 54 9 28Z" fill="#f2a71f"/>
<path d="M9 28 Q50 2 91 28 Q50 34 9 28Z" fill="#ffd45a"/>
<ellipse cx="50" cy="28" rx="6.5" ry="20" fill="#120500"/>
<ellipse cx="45" cy="17" rx="7" ry="3" fill="#fff6d6"/>
</svg>`,
  { size: 256 },
);

const TUFT_SVG = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
<path d="M20 60 Q14 30 4 12 Q16 26 19 60Z" fill="#2f6228"/>
<path d="M22 60 Q24 28 36 8 Q28 30 24 60Z" fill="#3f7d31"/>
<path d="M18 60 Q18 26 18 4 Q24 28 22 60Z" fill="#5c9a3a"/>
</svg>`,
  { size: 128 },
);

const sm = (x: number) => {
  const t = Math.min(Math.max(x, 0), 1);
  return t * t * (3 - 2 * t);
};

// A boulder standing on the floor: `h` tall, `r` across, squashed from a dodecahedron.
function boulder(r: number, h: number, rot: number) {
  const g = new THREE.DodecahedronGeometry(r, 0);
  g.computeBoundingBox();
  const bb = g.boundingBox as THREE.Box3;
  const sy = h / (bb.max.y - bb.min.y);
  g.scale(1, sy, 1);
  g.translate(0, -bb.min.y * sy, 0);
  g.rotateY(rot);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "leviathan", paintSize: 2048 });
  const v = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  // ---- Paints -------------------------------------------------------------
  // Hand-painted scales: a soft key light gives a diffuse gradient, cell rims shade
  // darker, the centre of each cell catches a jade highlight, and the underside
  // fades to the cream belly.
  const hide = paint((p, n, s) => {
    const c = cells(p, 0.1, 7);
    const rim = smoothstep(0, 0.3, c.d2 - c.d1); // 0 on a scale edge
    const lam = 0.4 * n.x + 0.8 * n.y + 0.5 * n.z; // key light from above, front-left
    let col = mix(TEAL, TEAL_L, smoothstep(0.3, 0.7, noise(p, 0.6, 3)));
    col = mix(TEAL_D, col, (0.3 + 0.7 * rim) * (0.45 + 0.55 * smoothstep(-0.3, 0.8, lam)));
    col = mix(col, JADE, 0.35 * (1 - rim) * smoothstep(0.2, 0.9, n.y));
    const ridge = smoothstep(0.8, 0.97, Math.cos((s[1] * Math.PI) / 180)); // painted spine stripe on the back
    col = mix(col, "#9ff0d4", 0.5 * ridge);
    return mix(col, BELLY, 0.85 * smoothstep(-0.3, -0.9, n.y));
  });
  // Worn gold: patches of bright, rubbed metal over the trim.
  const trim = paint((p) => mix(GOLD, GOLD_HI, 0.5 * smoothstep(0.6, 0.85, noise(p, 0.035, 9))));
  // Coral sail with gold fin rays running across it.
  const sail = paint((_p, _n, s) => (((s[0] * 14) % 1) < 0.1 ? GOLD : mix(CORAL_D, CORAL, s[1])));
  // Frill fins: radiating gold rays on coral.
  const frill = paint((_p, _n, s) => {
    const a = Math.atan2(s[1] + 0.05, s[0] + 0.05);
    return Math.abs(Math.sin(a * 8)) < 0.12 ? GOLD : mix(CORAL_D, CORAL, smoothstep(0, 0.6, s[1]));
  });
  // Lower jaw: the inside of the mouth is dark red, its outside pale.
  const jawPaint = paint((_p, n) => (n.y > 0.45 ? MOUTH : BELLY));
  const earth = paint((p, n) => {
    const col = mix(EARTH_D, EARTH_L, smoothstep(0.3, 0.75, noise(p, 0.3, 4)));
    return mix(col, MOSS, 0.35 * smoothstep(0.6, 0.9, n.y));
  });
  const rock = paint((p, n) => {
    const col = mix(ROCK_D, ROCK_L, smoothstep(0.35, 0.7, noise(p, 0.18, 8)));
    return mix(col, "#d8d0c0", 0.4 * smoothstep(0.4, 0.95, n.y));
  });

  // ---- Skeleton: a helical coil that rises out of the mound -----------------
  // Angle th runs from the tail (inside the mound) round two turns and up into the neck.
  const TH0 = -0.4;
  const TH1 = 4 * Math.PI + 0.3;
  const coil = (th: number): [number, number, number] => {
    const s = (th - TH0) / (TH1 - TH0);
    const R = 2.45 - 1.4 * s;
    return [R * Math.cos(th), 0.3 + 1.6 * s, R * Math.sin(th)];
  };
  const SAMPLES = 30;
  const pts: [number, number, number][] = [];
  const radii: number[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const th = TH0 + ((TH1 - TH0) * i) / SAMPLES;
    pts.push(coil(th));
    const taper = 0.06 + 0.25 * sm((th - TH0) / 0.9);
    const thin = 1 - 0.16 * sm((th - (TH1 - 1.4)) / 1.4);
    radii.push(taper * thin);
  }
  const NECK: [[number, number, number], number][] = [
    [[0.85, 2.62, 0.85], 0.27],
    [[0.35, 3.22, 1.55], 0.24],
    [[0.0, 3.5, 2.05], 0.21],
  ];
  for (const [p, r] of NECK) {
    pts.push(p);
    radii.push(r);
  }

  const body = catmull(pts);
  const keys = pts.map((p, i) => [body.closestT(v(p)), radii[i]] as const);
  const radiusAt = (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t0, r0] = keys[i - 1];
      const [t1, r1] = keys[i];
      if (t <= t1) return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
    }
    return keys[keys.length - 1][1];
  };

  const rootT = body.closestT(v(coil(2 * Math.PI)));
  const hips = b.joint("hips", { at: body.at(rootT), role: "spine" });
  const tail = b.chain("tail", body.slice(rootT, 0), {
    parent: hips,
    count: 12,
    names: (i) => `tail${i + 1}`,
    role: "tail",
  });
  const neck = b.chain("neck", body.slice(rootT, 1), {
    parent: hips,
    count: 12,
    names: (i) => `neck${i + 1}`,
    role: "neck",
  });
  const neckEnd = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", {
    parent: neckEnd,
    at: NECK[2][0],
    aim: [0, 3.2, 3.1],
    role: "head",
  });
  // The head is built 1.2x its nominal size: every head offset passes through H().
  const K = 1.2;
  const H = (f: number, u: number, l = 0) => head.local({ forward: f * K, up: u * K, left: l * K });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H(-0.05, -0.3),
    aim: H(1.0, -0.42),
    role: "jaw",
  });
  const J = (f: number, u: number, l = 0) => jaw.local({ forward: f * K, up: u * K, left: l * K });

  // ---- Body ----------------------------------------------------------------
  const bodyTube = b.sweep(body, radiusAt, {
    bone: [tail, hips, neck],
    color: hide,
    sides: 12,
  });

  // Dorsal spines along the coil, growing toward the neck.
  const tN1 = body.closestT(v(NECK[0][0]));
  b.along(
    bodyTube,
    30,
    (at) => {
      const len = 0.2 + 0.12 * at.t;
      b.spike(at, at, len, 0.04, { color: BONE });
    },
    { from: 0.14, to: tN1 },
  );

  // Coral sail along the neck, its fin rays in gold, with a row of gold spines on its crest.
  const top = bodyTube.line(0);
  const crest = bodyTube.line(0, 0.36);
  const sailA = top.closestT(v(NECK[0][0]));
  const sailB = top.closestT(v(NECK[2][0]));
  b.membrane(top.slice(sailA, sailB), crest.slice(crest.closestT(v(NECK[0][0])), crest.closestT(v(NECK[2][0]))), {
    color: sail,
    thickness: 0.02,
    bone: neck,
  });
  b.along(crest.slice(crest.closestT(v(NECK[0][0])), crest.closestT(v(NECK[2][0]))), 8, (at) =>
    b.spike(at, [0, 1, 0], 0.12, 0.024, { color: GOLD, bone: neck }),
  );

  // Worn gold armour bands with steel rivets, wrapped round the body.
  const surf = b.surface(bodyTube);
  const bandJoints = [tail.joints[2], tail.joints[5], tail.joints[8], neck.joints[1], neck.joints[4], neck.joints[7]];
  for (const j of bandJoints) {
    const band = surf.loop(j, { lift: 0.016 });
    b.sweep(band, 0.04, { color: trim });
    b.along(band, 20, (at) => b.part(new THREE.SphereGeometry(0.024, 6, 4), STEEL, { at }));
  }

  // ---- Head ----------------------------------------------------------------
  const skull = b.loft(
    [
      { at: H(-0.35, 0.0), w: 0.62 * K, h: 0.6 * K },
      { at: H(-0.05, 0.12), w: 0.82 * K, h: 0.78 * K },
      { at: H(0.3, 0.05), w: 0.66 * K, h: 0.56 * K },
      { at: H(0.62, -0.04), w: 0.5 * K, h: 0.4 * K },
      { at: H(0.85, -0.1), w: 0.36 * K, h: 0.3 * K },
    ],
    { bone: head, color: hide },
  );

  // The lower jaw: a loft of four stations, drooping so the mouth gapes at the tip.
  b.loft(
    [
      { at: J(0.0, -0.02), w: 0.44 * K, h: 0.14 * K },
      { at: J(0.4, -0.05), w: 0.34 * K, h: 0.12 * K },
      { at: J(0.75, -0.1), w: 0.2 * K, h: 0.1 * K },
      { at: J(0.92, -0.14), w: 0.1 * K, h: 0.08 * K },
    ],
    { bone: jaw, color: jawPaint },
  );

  // Painted eyes on the skull sides.
  for (const s of [1, -1]) {
    b.decal(skull, EYE_SVG, {
      at: H(0.02, 0.12, s * 0.36),
      dir: [s, 0.15, 0.55],
      size: [0.28, 0.157],
    });
  }

  // Armoured brow plates over each eye, with rivets.
  const brow: OutlinePoint[] = [
    [-0.18, 0],
    [0.17, 0.012],
    [0.2, 0.06],
    [0.024, 0.12],
    [-0.18, 0.06],
  ];
  for (const s of [1, -1]) {
    b.extrude(brow, {
      at: H(0.02, 0.22, s * 0.38),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.06,
      bevel: 0.014,
      detail: 0.5,
      smoothing: 1,
      color: trim,
      bone: head,
    });
    for (const f of [-0.12, 0.08, 0.2]) {
      b.part(new THREE.SphereGeometry(0.02, 6, 4), STEEL, {
        bone: head,
        at: H(f, 0.22 + 0.02 * f, s * 0.4),
      });
    }
  }

  // Horns: bone, sweeping back from the crown, with gold rings at the root and mid-length.
  for (const s of [1, -1]) {
    b.sweep(bezier(H(-0.12, 0.34, s * 0.2), H(-0.42, 0.85, s * 0.42), H(-0.9, 0.9, s * 0.66)), [0.1, 0.014], {
      bone: head,
      color: BONE,
      bands: [
        [0.18, trim],
        [0.3, BONE],
        [0.42, trim],
        [1, BONE],
      ],
      caps: { start: "round", end: "point" },
    });
  }

  // Frill fins at the back of the head, rays in gold.
  const frillOutline: OutlinePoint[] = [
    [0, -0.3],
    [0.26, -0.36],
    [0.66, -0.06],
    [0.82, 0.36, "sharp"],
    [0.5, 0.24],
    [0.6, 0.62, "sharp"],
    [0.24, 0.43],
    [-0.06, 0.36],
  ];
  for (const s of [1, -1]) {
    b.extrude(frillOutline, {
      at: H(-0.26, 0.02, s * 0.36),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.06,
      bevel: 0.014,
      detail: 0.5,
      smoothing: 1,
      color: frill,
      bone: head,
    });
  }

  // Crest spines on the crown.
  for (const [f, u] of [
    [-0.32, 0.3],
    [-0.12, 0.5],
    [0.1, 0.46],
    [0.3, 0.33],
  ] as const) {
    b.spike(H(f, u), [0, 1, -0.25], 0.2, 0.046, { color: BONE, bone: head });
  }

  // Snout ridge: three small spines along the top of the muzzle.
  for (const [f, u] of [
    [0.4, 0.2],
    [0.6, 0.16],
    [0.8, 0.06],
  ] as const) {
    b.spike(H(f, u), [0, 1, -0.2], 0.1, 0.025, { color: BONE, bone: head });
  }

  // Nostrils.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.036, 6, 4), INK, { bone: head, at: H(0.78, 0.04, s * 0.1) });
  }

  // Teeth: upper ones point down from the snout, lower ones up from the jaw.
  for (const s of [1, -1]) {
    for (const f of [0.38, 0.55, 0.72]) {
      b.spike(H(f, -0.22, s * 0.13), [0, -1, 0], 0.13, 0.028, { color: TOOTH, bone: head });
    }
    for (const f of [0.3, 0.5, 0.7]) {
      b.spike(J(f, 0.0, s * 0.1), [0, 1, 0], 0.12, 0.028, { color: TOOTH, bone: jaw });
    }
  }
  for (const f of [0.45, 0.65]) {
    b.spike(H(f, -0.22, 0), [0, -1, 0], 0.13, 0.028, { color: TOOTH, bone: head });
  }

  // Curved sabre tusks beside the snout, rising from the lower jaw.
  for (const s of [1, -1]) {
    b.sweep(bezier(J(0.45, -0.02, s * 0.3), J(0.55, 0.12, s * 0.34), J(0.5, 0.26, s * 0.3)), [0.05, 0.01], {
      bone: jaw,
      color: BONE,
      caps: { start: "round", end: "point" },
      sides: 6,
    });
  }

  // Chin spines.
  for (const s of [1, -1]) {
    b.spike(J(0.9, -0.12, s * 0.06), [0, -1, 0.35], 0.12, 0.03, { color: BONE, bone: jaw });
  }

  // ---- Ground: mound, boulders, rocks, bones, tufts ------------------------
  const mound = b.lathe(
    [
      [0, 0],
      [1.15, 0],
      [1.2, 0.1],
      [1.0, 0.3],
      [0.6, 0.48],
      [0.28, 0.58],
      [0, 0.6],
    ],
    { at: [2.35, 0, -0.45], color: earth, smoothing: 1, bone: hips },
  );

  // Boulders carry the coil where it lifts off the ground.
  for (const th of [1.4, 2.8, 4.2]) {
    const [cx, cy, cz] = coil(th);
    const h = cy - 0.22;
    b.part(boulder(0.3, h, th), rock, { bone: hips, at: [cx, 0, cz] });
  }
  const rocks: [number, number, number, number, number][] = [
    [3.25, 0.0, 0.6, 0.3, 0.4],
    [3.0, 0.0, -1.25, 0.22, 1.2],
    [1.5, 0.0, -1.45, 0.26, 2.0],
    [2.0, 0.0, 1.0, 0.2, 0.8],
    [3.55, 0.0, 0.2, 0.18, 0.3],
    [-0.1, 0.0, -1.9, 0.2, 2.5],
    [2.9, 0.0, -1.6, 0.16, 1.7],
  ];
  for (const [x, y, z, r, rot] of rocks) {
    b.part(boulder(r, r * 1.1, rot), rock, { bone: hips, at: [x, y, z] });
  }

  // Old prey ribs, half-buried in the mound.
  b.sweep(
    bezier([3.3, 0.0, -0.05], [3.85, 0.7, -0.35], [3.5, 0.0, -0.85]),
    [0.045, 0.03],
    { bone: hips, color: BONE, caps: { start: "round", end: "point" } },
  );
  b.sweep(
    bezier([1.7, 0.0, -1.25], [1.95, 0.55, -1.7], [1.55, 0.0, -1.6]),
    [0.045, 0.03],
    { bone: hips, color: BONE, caps: { start: "round", end: "point" } },
  );

  // Grass tufts on the mound.
  const tufts = b.surface(mound).scatter(50, { rng: rng(5), minDist: 0.14, filter: (h) => h.n.y > 0.4 });
  b.cards(tufts, TUFT_SVG, { size: [0.16, 0.22], vary: 0.3, rng: rng(9) });

  return b.root;
}
