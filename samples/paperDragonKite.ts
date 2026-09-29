// A Chinese dragon kite (long-jiao hua-ba style) as a creature, 2.5 m from snout to streamer tips, standing on its
// four small legs with the head reared up. Everything is paper and bamboo: a chain of sixteen-sided paper drums, each a
// hollow shell between two bamboo hoops, strung together with cord; a folded box-section head with a hinged jaw;
// layered cut-paper brows, eye sockets and mane; scale and flame shingles cut from printed paper. The paper carries
// a fibre grain from one paint; the scales, flames, clouds, eyes and forehead seal are SVG drawings with brush-wobbled
// ink edges.
import { CylinderGeometry, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { offset, rng } from "../src/math";
import { mix, noise, paint, smoothstep } from "../src/paint";
import { bezier, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Paper dragon kite",
  description:
    "A 2.5 m Chinese dragon kite: a chain of paper drums on bamboo hoops, a folded paper head with an open jaw, cut-paper brows, mane and scale shingles, four small clawed legs and a tail of paper streamers.",
};

// ---------------------------------------------------------------------------------------------------------------
// Printed-ink colours
const VERM = "#d2391f";
const VERM_DEEP = "#a3220f";
const GOLD = "#e8ac2c";
const GOLD_LT = "#f5d264";
const JADE = "#1f8a69";
const JADE_DK = "#115d48";
const INK = "#18120f";
const PAPER = "#f1e3c2";
const PAPER_SHADE = "#d6c39a";
const BAMBOO = "#cfa85a";
const BAMBOO_DK = "#8d6a30";
const CORD = "#6b4a28";
const TOOTH = "#f7f0d8";
const MOUTH_RED = "#8c1314";
const TONGUE = "#e2506a";
const GLINT = "#fffdf0";

// ---------------------------------------------------------------------------------------------------------------
// SVG drawing helpers: every outline is jittered a little so it reads as brushed, not vector-clean.
type Pt = [number, number];
const brushRng = rng(11);
const jit = (v: number, a: number) => v + (brushRng() - 0.5) * 2 * a;
const f = (n: number) => n.toFixed(1);
const wob = (pts: Pt[], a: number): Pt[] => pts.map(([x, y]) => [jit(x, a), jit(y, a)]);
const about = (k: number, cx: number, cy: number, ky = k) =>
  `transform="translate(${cx} ${cy}) scale(${k} ${ky}) translate(${-cx} ${-cy})"`;
const ring2 = (cx: number, cy: number, r: number, n: number): Pt[] =>
  Array.from({ length: n }, (_, i) => [
    cx + r * Math.cos((i / n) * Math.PI * 2),
    cy + r * Math.sin((i / n) * Math.PI * 2),
  ]);
const coil = (cx: number, cy: number, r0: number, turns: number, a0: number): Pt[] => {
  const n = Math.round(turns * 10);
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const a = a0 + t * turns * Math.PI * 2;
    const r = r0 * (1 - 0.8 * t);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
};

/** Catmull-Rom through points as cubic Béziers. */
function curve(pts: Pt[], closed = false) {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.min(Math.max(i, 0), n - 1)]);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

/** One brush stroke: a rounded line whose path wanders a little with its width. */
const stroke = (pts: Pt[], w: number, color: string) =>
  `<path d="${curve(wob(pts, w * 0.14))}" fill="none" stroke="${color}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** A scale: gold rim, a coloured field and two brushed arcs. Its root (the drawing's bottom) is hidden under the next row. */
const ARCH: Pt[] = [
  [3, 56],
  [2, 38],
  [6, 20],
  [16, 7],
  [24, 3],
  [32, 7],
  [42, 20],
  [46, 38],
  [45, 56],
];
function scaleTex(rim: string, field: string, arc: string) {
  const outline = curve(wob(ARCH, 0.6), true);
  return svg(
    `<svg viewBox="0 0 48 56">
      <path d="${outline}" fill="${INK}"/>
      <path d="${outline}" fill="${rim}" ${about(0.9, 24, 56, 0.92)}/>
      <path d="${outline}" fill="${field}" ${about(0.64, 24, 56, 0.62)}/>
      ${stroke(
        [
          [13, 51],
          [15, 36],
          [24, 25],
          [33, 36],
          [35, 51],
        ],
        1.8,
        arc,
      )}
      ${stroke(
        [
          [19, 51],
          [21, 42],
          [24, 37],
          [27, 42],
          [29, 51],
        ],
        1.5,
        INK,
      )}
      <circle cx="24" cy="15" r="2.3" fill="${arc}"/>
    </svg>`,
    { size: 128 },
  );
}

/** A cut-paper flame: ink outline under three nested layers of paper. */
const FLAME_PTS: Pt[] = [
  [5, 72],
  [3, 54],
  [8, 40],
  [5, 26],
  [11, 14],
  [16, 7],
  [21, 0],
  [20, 10],
  [24, 20],
  [29, 32],
  [27, 50],
  [27, 72],
];
function flameTex(outer: string, mid: string, core: string) {
  const o = curve(wob(FLAME_PTS, 0.5), true);
  return svg(
    `<svg viewBox="0 0 32 72">
      <path d="${o}" fill="${INK}"/>
      <path d="${o}" fill="${outer}" ${about(0.9, 16, 72)}/>
      <path d="${o}" fill="${mid}" ${about(0.66, 16, 72, 0.72)}/>
      <path d="${o}" fill="${core}" ${about(0.36, 16, 72, 0.5)}/>
      ${stroke(
        [
          [16, 68],
          [12, 50],
          [15, 34],
          [13, 20],
        ],
        1.1,
        INK,
      )}
    </svg>`,
    { size: 128 },
  );
}

/** An auspicious cloud: three gold scrolls on a wavering tail, over an inky shadow. */
function cloudTex(mirror: boolean) {
  const lines: Pt[][] = [
    coil(24, 22, 13, 1.4, Math.PI * 0.75),
    coil(48, 20, 10, 1.3, Math.PI * 0.7),
    coil(64, 26, 6.5, 1.2, Math.PI * 0.6),
    [
      [3, 39],
      [12, 33],
      [21, 38],
      [34, 41],
      [46, 36],
      [57, 41],
      [68, 37],
      [77, 33],
    ],
    [
      [24, 35],
      [22, 37],
      [21, 38],
    ],
    [
      [48, 30],
      [46, 33],
      [46, 36],
    ],
  ];
  const draw = (color: string, w: number, dx: number, dy: number) =>
    `<g transform="translate(${dx} ${dy})">${lines.map((l) => stroke(l, w, color)).join("")}</g>`;
  return svg(
    `<svg viewBox="0 0 80 48">
      <g ${mirror ? 'transform="translate(80 0) scale(-1 1)"' : ""}>
        ${draw(INK, 6.6, 1, 1.4)}
        ${draw(GOLD_LT, 4.4, 0, 0)}
      </g>
    </svg>`,
    { size: 256 },
  );
}

/** The dome of an eye as a lat-long map: pupil at the pole (top), gold spoked iris, ink ring, paper white with veins. */
function eyeTex() {
  const spokes = Array.from({ length: 26 }, (_, i) => {
    const x = (i + 0.5) * (128 / 26);
    return stroke(
      [
        [x, 11],
        [jit(x, 0.8), 27],
      ],
      1.6,
      i % 2 ? VERM : VERM_DEEP,
    );
  }).join("");
  const veins = Array.from({ length: 16 }, (_, i) => {
    const x = (i + 0.5) * 8;
    return stroke(
      [
        [x, 58],
        [jit(x, 2), 40 + brushRng() * 8],
      ],
      0.9,
      VERM,
    );
  }).join("");
  return svg(
    `<svg viewBox="0 0 128 64">
      <rect width="128" height="64" fill="${PAPER}"/>
      <rect width="128" height="30" fill="${GOLD}"/>
      <rect width="128" height="12" fill="${GOLD_LT}"/>
      ${spokes}
      <rect y="27" width="128" height="3.4" fill="${VERM_DEEP}"/>
      <rect y="30" width="128" height="4" fill="${INK}"/>
      ${veins}
      <rect width="128" height="11" fill="${INK}"/>
      <rect y="58" width="128" height="6" fill="${INK}"/>
    </svg>`,
    { size: 256 },
  );
}

/** The forehead seal: a gold disc under the brushed character 王, king of beasts. */
function sealTex() {
  const disc = curve(wob(ring2(24, 24, 23, 12), 0.5), true);
  const disc2 = curve(wob(ring2(24, 24, 20.4, 12), 0.5), true);
  return svg(
    `<svg viewBox="0 0 48 48">
      <path d="${disc}" fill="${INK}"/>
      <path d="${disc2}" fill="${GOLD}"/>
      <path d="${curve(wob(ring2(24, 24, 17.4, 14), 0.4), true)}" fill="none" stroke="${VERM}" stroke-width="1.3"/>
      ${stroke(
        [
          [13, 15],
          [24, 14],
          [35, 15],
        ],
        3.6,
        INK,
      )}
      ${stroke(
        [
          [15, 24],
          [24, 24.5],
          [33, 24],
        ],
        3.6,
        INK,
      )}
      ${stroke(
        [
          [11, 33],
          [24, 33.5],
          [37, 33],
        ],
        3.8,
        INK,
      )}
      ${stroke(
        [
          [24, 12.5],
          [24.4, 24],
          [24, 36],
        ],
        3.6,
        INK,
      )}
    </svg>`,
    { size: 128 },
  );
}

/** A flared nostril: gold ring, ink pit, a red brush flick above it. */
function nostrilTex() {
  return svg(
    `<svg viewBox="0 0 32 32">
      <path d="${curve(wob(ring2(16, 16, 15, 10), 0.6), true)}" fill="${INK}"/>
      <path d="${curve(wob(ring2(16, 16, 12.4, 10), 0.6), true)}" fill="${GOLD}"/>
      <ellipse cx="16" cy="17" rx="7" ry="5" fill="${INK}" transform="rotate(-25 16 17)"/>
      ${stroke(
        [
          [8, 10],
          [16, 7],
          [24, 11],
        ],
        1.7,
        VERM,
      )}
    </svg>`,
    { size: 64 },
  );
}

const SCALE_GOLD = scaleTex(GOLD, VERM, INK);
const SCALE_JADE = scaleTex(JADE, GOLD_LT, JADE_DK);
const FLAME_JADE = flameTex(JADE, GOLD_LT, VERM);
const FLAME_GOLD = flameTex(GOLD, VERM, GOLD_LT);
const FLAME_VERM = flameTex(VERM, GOLD, GOLD_LT);
const CLOUD = [cloudTex(false), cloudTex(true)];
const EYE = eyeTex();
const SEAL = sealTex();
const NOSTRIL = nostrilTex();

// ---------------------------------------------------------------------------------------------------------------
// Paper: every painted colour carries the same fibre grain.
const tint = (c: string, k: number) => mix(c, k > 0 ? "#ffffff" : "#000000", Math.abs(k));
const fibre = (p: Vector3) =>
  (noise(p, 0.05, 3) - 0.5) * 0.5 + (noise(p, 0.011, 4) - 0.5) * 0.9 + (noise(p, 0.0042, 5) - 0.5) * 0.9;
const paper = (c: string, p: Vector3, amp = 0.09) => tint(c, fibre(p) * amp);
const paperPaint = (c: string, amp = 0.09) => paint((p) => paper(c, p, amp));
const bambooPaint = (c = BAMBOO) =>
  paint((p) => tint(c, (noise(p, 0.022, 7) - 0.5) * 0.4 + (noise(p, 0.0052, 8) - 0.5) * 0.3));

const Y = new Vector3(0, 1, 0);

export default function build() {
  const b = createBuilder({ name: "paperDragonKite", paintSize: 2048 });
  const rand = rng(23);

  // ---------------------------------------------------------------- Body curve
  // Head end (v = 0) to tail end (v = 1): a gentle S in plan, the neck reared up, the tail lifted.
  const N_SEG = 15; // 14 drums and the tail cone
  const Z0 = 0.32;
  const Z1 = -1.02;
  const rAt = (v: number) => (0.172 - 0.117 * Math.pow(v, 1.15)) * (0.84 + 0.16 * smoothstep(0, 0.2, v));
  const riseAt = (v: number) => 0.3 * (1 - smoothstep(0, 0.24, v)) + 0.24 * Math.pow(smoothstep(0.6, 1, v), 1.3);
  const swayAt = (v: number) => 0.13 * Math.sin(v * Math.PI * 2.3 + 0.2) * smoothstep(0, 0.25, v);
  const bodyPts = Array.from({ length: 25 }, (_, k): [number, number, number] => {
    const v = k / 24;
    return [swayAt(v), rAt(v) + 0.05 + riseAt(v), Z0 + (Z1 - Z0) * v];
  });
  const bodyPath = catmull(bodyPts);

  // ---------------------------------------------------------------- Skeleton
  const root = b.joint("root", { at: bodyPath.at(0), dir: [0, 0, -1], group: "body" });
  const spine = b.chain("spine", bodyPath, { parent: root, count: N_SEG, role: "spine", group: "body" });
  const J = [...spine.joints.map((j) => j.at.clone()), bodyPath.at(1)];
  const H = J[0].clone();
  const hd = (x: number, y: number, z: number) => new Vector3(H.x + x, H.y + y, H.z + z);
  const head = b.joint("head", { parent: spine.joints[0], at: H, dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hd(0, -0.125, 0.04),
    aim: hd(0, -0.095, 0.64),
    role: "jaw",
    group: "jaw",
  });

  // ---------------------------------------------------------------- Drums
  type Drum = {
    a: Vector3;
    d: Vector3;
    L: number;
    ro: number;
    e1: Vector3;
    e2: Vector3;
    c: Vector3;
    joint: (typeof spine.joints)[number];
  };
  const drums: Drum[] = [];
  for (let i = 0; i < N_SEG - 1; i++) {
    const seg = J[i + 1].clone().sub(J[i]);
    const d = seg.clone().normalize();
    const a = J[i].clone().addScaledVector(d, 0.012);
    const L = seg.length() - 0.024;
    const e1 = new Vector3().crossVectors(d, Y).normalize();
    const e2 = new Vector3().crossVectors(e1, d);
    drums.push({
      a,
      d,
      L,
      ro: rAt((i + 0.5) / N_SEG),
      e1,
      e2,
      c: a.clone().addScaledVector(d, L / 2),
      joint: spine.joints[i],
    });
  }
  const rOut = (dr: Drum, ax: number) => dr.ro * (1 + 0.07 * (1 - Math.abs((2 * ax) / dr.L - 1)));
  const radial = (dr: Drum, phi: number) =>
    dr.e2.clone().multiplyScalar(Math.cos(phi)).addScaledVector(dr.e1, Math.sin(phi));

  const drumPaint = (dr: Drum) =>
    paint((p, n) => {
      const rx = p.x - dr.a.x;
      const ry = p.y - dr.a.y;
      const rz = p.z - dr.a.z;
      const ax = rx * dr.d.x + ry * dr.d.y + rz * dr.d.z;
      const qx = rx - dr.d.x * ax;
      const qy = ry - dr.d.y * ax;
      const qz = rz - dr.d.z * ax;
      if (n.x * qx + n.y * qy + n.z * qz < -1e-7) return paper(PAPER_SHADE, p, 0.1);
      const edge = Math.min(ax, dr.L - ax);
      if (edge < 0.0125) return paper(GOLD, p, 0.07);
      if (edge < 0.0155) return paper(INK, p, 0.04);
      if (qy / (Math.hypot(qx, qy, qz) + 1e-9) < -0.6) return paper(PAPER, p, 0.07);
      return mix(paper(VERM, p, 0.09), VERM_DEEP, 0.25 * smoothstep(0.25, 0.5, Math.abs(ax / dr.L - 0.5)));
    });

  drums.forEach((dr, i) => {
    const t = 0.004;
    const rm = dr.ro * 1.07;
    b.lathe(
      [
        [dr.ro - t, 0],
        [dr.ro, 0],
        [rm, dr.L / 2],
        [dr.ro, dr.L],
        [dr.ro - t, dr.L],
        [rm - t, dr.L / 2],
      ],
      { at: dr.a, axis: dr.d, segments: 16, bone: dr.joint, color: drumPaint(dr), group: "body", name: `drum${i + 1}` },
    );
    // Bamboo hoops at both rims.
    for (const ax of [0.002, dr.L - 0.002]) {
      const rc = dr.ro - 0.001;
      b.lathe(
        [
          [rc - 0.008, 0],
          [rc, -0.008],
          [rc + 0.008, 0],
          [rc, 0.008],
        ],
        {
          at: dr.a.clone().addScaledVector(dr.d, ax),
          axis: dr.d,
          segments: 16,
          bone: dr.joint,
          color: bambooPaint(),
          group: "frame",
          name: `hoop${i + 1}`,
        },
      );
    }
  });

  // ---------------------------------------------------------------- Tail cone and hub
  const tailD = J[N_SEG].clone().sub(J[N_SEG - 1]);
  const tailL = tailD.length();
  tailD.normalize();
  const tailJoint = spine.joints[N_SEG - 1];
  const tailStart = J[N_SEG - 1].clone();
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.058, tailL * 0.5],
      [0.046, tailL],
      [0, tailL],
    ],
    {
      at: tailStart,
      axis: tailD,
      segments: 12,
      bone: tailJoint,
      color: paint((p) => {
        const ax = p.clone().sub(tailStart).dot(tailD);
        if (ax < 0.014) return paper(GOLD, p, 0.07);
        if (ax < 0.018) return paper(INK, p, 0.04);
        return paper(VERM, p, 0.09);
      }),
      group: "tail",
      name: "tailCone",
    },
  );
  const hub = J[N_SEG].clone();
  b.lathe(
    [
      [0.038, 0],
      [0.045, -0.007],
      [0.052, 0],
      [0.045, 0.007],
    ],
    { at: hub, axis: tailD, segments: 14, bone: tailJoint, color: bambooPaint(), group: "frame", name: "tailHub" },
  );

  // ---------------------------------------------------------------- Strings between drums
  const rimPoint = (dr: Drum, ax: number, phi: number, r: number) =>
    dr.a.clone().addScaledVector(dr.d, ax).addScaledVector(radial(dr, phi), r);
  for (let i = 0; i < N_SEG - 1; i++) {
    const dr = drums[i];
    const nextA = i + 1 < drums.length ? drums[i + 1].a : tailStart.clone().addScaledVector(tailD, 0.0);
    const nextD = i + 1 < drums.length ? drums[i + 1].d : tailD;
    const nextRo = i + 1 < drums.length ? drums[i + 1].ro : 0.07;
    const nextE1 = i + 1 < drums.length ? drums[i + 1].e1 : new Vector3().crossVectors(tailD, Y).normalize();
    const nextE2 = i + 1 < drums.length ? drums[i + 1].e2 : new Vector3().crossVectors(nextE1, tailD);
    for (let k = 0; k < 4; k++) {
      const phi = (k * Math.PI) / 2 + i * 0.5;
      const from = rimPoint(dr, dr.L - 0.003, phi, dr.ro - 0.002);
      const to = nextA
        .clone()
        .addScaledVector(nextD, 0.003)
        .addScaledVector(nextE2, (nextRo - 0.002) * Math.cos(phi))
        .addScaledVector(nextE1, (nextRo - 0.002) * Math.sin(phi));
      b.rod(from, to, 0.0035, { bone: dr.joint, color: CORD, sides: 4, group: "frame", name: `string${i + 1}` });
    }
  }

  // ---------------------------------------------------------------- Scale shingles and dorsal flames
  drums.forEach((dr, i) => {
    const tex = i % 2 === 0 ? SCALE_GOLD : SCALE_JADE;
    const around = Math.max(9, Math.round((2 * Math.PI * dr.ro) / 0.056));
    for (const [row, ax0, off] of [
      [0, 0.06, 0],
      [1, 0.5, 0.5],
    ] as const) {
      const frames = [];
      for (let k = 0; k < around; k++) {
        const phi = -Math.PI + ((k + off + 0.5) * 2 * Math.PI) / around;
        if (Math.abs(phi) > 2.2) continue;
        const ax = dr.L * ax0;
        const rad = radial(dr, phi);
        frames.push(frame(dr.a.clone().addScaledVector(dr.d, ax).addScaledVector(rad, rOut(dr, ax)), rad));
      }
      b.cards(frames, tex, {
        size: [((2 * Math.PI * dr.ro) / around) * 1.3, dr.L * 0.52],
        lean: 76,
        flow: dr.d,
        bone: dr.joint,
        vary: 0.06,
        spin: 4,
        rng: rand,
        sink: 0.05,
        group: "scales",
        name: `scales${i + 1}_${row}`,
      });
    }
    // Dorsal flames: a pair of cut-paper tongues along the back, smaller toward the tail.
    const k = 1 - 0.55 * (i / (drums.length - 1));
    const flames = [-0.32, 0.32].map((phi) => {
      const ax = dr.L * 0.55;
      const rad = radial(dr, phi);
      return frame(dr.a.clone().addScaledVector(dr.d, ax).addScaledVector(rad, rOut(dr, ax)), rad);
    });
    b.cards(flames, i % 2 === 0 ? FLAME_JADE : FLAME_GOLD, {
      size: [0.08 * k, 0.19 * k],
      lean: 55,
      bend: 25,
      flow: dr.d,
      bone: dr.joint,
      vary: 0.1,
      rng: rand,
      group: "mane",
      name: `dorsal${i + 1}`,
    });
  });

  // ---------------------------------------------------------------- Head: a folded box-section skull and snout
  type Station = readonly [z: number, y: number, w: number, h: number];
  const SK: Station[] = [
    [-0.06, 0, 0.22, 0.26],
    [0.06, 0.02, 0.34, 0.34],
    [0.2, 0.03, 0.35, 0.32],
    [0.32, 0, 0.28, 0.2],
    [0.46, 0, 0.23, 0.15],
    [0.58, 0.02, 0.22, 0.15],
    [0.66, 0.06, 0.21, 0.13],
  ];
  const JW: Station[] = [
    [0.02, -0.13, 0.24, 0.055],
    [0.22, -0.135, 0.26, 0.055],
    [0.4, -0.115, 0.21, 0.055],
    [0.52, -0.1, 0.18, 0.055],
    [0.6, -0.1, 0.16, 0.05],
    [0.64, -0.095, 0.14, 0.05],
  ];
  /** y, width and height of a station table at z (linear between stations). */
  const at = (tab: Station[], z: number) => {
    let i = 0;
    while (i < tab.length - 2 && tab[i + 1][0] < z) i++;
    const k = Math.min(Math.max((z - tab[i][0]) / (tab[i + 1][0] - tab[i][0]), 0), 1);
    const g = (j: 1 | 2 | 3) => tab[i][j] + (tab[i + 1][j] - tab[i][j]) * k;
    return { y: g(1), w: g(2), h: g(3) };
  };

  const headPaint = paint((p, n) => {
    const qx = p.x - H.x;
    const qy = p.y - H.y;
    const qz = p.z - H.z;
    const s = at(SK, qz);
    const under = s.y - s.h / 2;
    if (n.y < -0.55) return qz > 0.3 ? paper(MOUTH_RED, p, 0.08) : paper(PAPER, p, 0.07);
    if (qy - under < 0.016 && qz > 0.28) return paper(GOLD, p, 0.07);
    if (qy - under < 0.02 && qz > 0.28) return paper(INK, p, 0.04);
    if (n.y > 0.5 && qz > 0.02 && Math.abs(qx) < 0.03) return paper(GOLD, p, 0.07);
    if (n.y > 0.5 && qz > 0.02 && Math.abs(qx) < 0.037) return paper(INK, p, 0.04);
    return mix(
      paper(VERM, p, 0.09),
      VERM_DEEP,
      0.3 * smoothstep(0.02, 0.16, Math.abs(qx)) * (1 - smoothstep(0.3, 0.45, qz)),
    );
  });
  const skull = b.loft(
    SK.map(([z, y, w, h]) => ({ at: hd(0, y, z), w, h })),
    { section: "box", caps: "flat", bone: head, color: headPaint, group: "head", name: "skull" },
  );
  const skullSurface = b.surface(skull);

  // Lower jaw, on its own bone.
  const jawPaint = paint((p, n) => {
    const qx = p.x - H.x;
    const qy = p.y - H.y;
    const qz = p.z - H.z;
    const s = at(JW, qz);
    if (n.y > 0.6) return paper(MOUTH_RED, p, 0.08);
    if (n.y < -0.6) return Math.abs(qx) < 0.02 ? paper(GOLD, p, 0.07) : paper(PAPER, p, 0.07);
    if (s.y + s.h / 2 - qy < 0.014) return paper(GOLD, p, 0.07);
    if (s.y + s.h / 2 - qy < 0.018) return paper(INK, p, 0.04);
    return paper(VERM, p, 0.09);
  });
  b.loft(
    JW.map(([z, y, w, h]) => ({ at: hd(0, y, z), w, h })),
    { section: "box", caps: "flat", bone: jaw, color: jawPaint, group: "jaw", name: "lowerJaw" },
  );

  // Tongue: a forked strip of red paper on the jaw floor.
  b.extrude(
    [
      [0, -0.045],
      [0.18, -0.05],
      [0.3, -0.04],
      [0.4, -0.055, "sharp"],
      [0.36, -0.015],
      [0.345, 0],
      [0.36, 0.015],
      [0.4, 0.055, "sharp"],
      [0.3, 0.04],
      [0.18, 0.05],
      [0, 0.045],
    ],
    {
      at: hd(0, -0.104, 0.14),
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.008,
      color: paperPaint(TONGUE),
      bone: jaw,
      group: "jaw",
      name: "tongue",
    },
  );

  // Teeth: paper pyramids along both lips, the big fangs first.
  for (const s of [1, -1]) {
    for (const [z, len, r] of [
      [0.34, 0.035, 0.011],
      [0.4, 0.075, 0.017],
      [0.47, 0.035, 0.011],
      [0.53, 0.03, 0.01],
      [0.585, 0.028, 0.009],
    ] as const) {
      const g = at(SK, z);
      b.spike(hd(s * (g.w / 2 - 0.014), g.y - g.h / 2 + 0.006, z), [0, -1, 0], len, r, {
        bone: head,
        color: TOOTH,
        sides: 4,
        group: "head",
        name: "upperTooth",
      });
    }
    for (const [z, len, r] of [
      [0.3, 0.03, 0.01],
      [0.43, 0.035, 0.011],
      [0.52, 0.055, 0.014],
      [0.585, 0.028, 0.009],
    ] as const) {
      const g = at(JW, z);
      b.spike(hd(s * (g.w / 2 - 0.014), g.y + g.h / 2 - 0.006, z), [0, 1, 0], len, r, {
        bone: jaw,
        color: TOOTH,
        sides: 4,
        group: "jaw",
        name: "lowerTooth",
      });
    }
  }

  // Forehead seal and cheek clouds, printed on the skull.
  const crown = skullSurface.ray(hd(0, 0.6, 0.15), [0, -1, 0]);
  if (crown)
    b.part(new PlaneGeometry(0.11, 0.11), "#ffffff", {
      bone: head,
      at: offset(crown, crown.n, 0.004),
      dir: crown.n,
      axis: "z",
      up: [0, 0, 1],
      texture: SEAL,
      group: "head",
      name: "seal",
    });
  // Cheek plates: layered cut paper (ink, gold, jade) under each eye, printed with an auspicious cloud.
  const PLATE: [number, number][] = [
    [0.03, -0.12],
    [0.01, -0.03],
    [0.1, 0],
    [0.25, -0.01],
    [0.3, -0.07],
    [0.22, -0.15],
  ];
  for (const s of [1, -1]) {
    for (const [layer, color, k] of [
      [0, INK, 1],
      [1, GOLD, 0.92],
      [2, JADE, 0.8],
    ] as const) {
      b.extrude(
        PLATE.map(([z, y]): [number, number] => [0.16 + (z - 0.16) * k, -0.07 + (y + 0.07) * k]),
        {
          at: hd(s * (0.166 + layer * 0.006), 0, 0),
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.008,
          smoothing: 2,
          color: paperPaint(color),
          bone: head,
          group: "head",
          name: "cheekPlate",
        },
      );
    }
    b.part(new PlaneGeometry(0.22, 0.132), "#ffffff", {
      bone: head,
      at: hd(s * 0.19, -0.07, 0.16),
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: CLOUD[s > 0 ? 0 : 1],
      group: "head",
      name: "cheekCloud",
    });
  }

  // Nose: two flared paper lobes with printed nostrils.
  for (const s of [1, -1]) {
    const lobe = hd(s * 0.09, 0.11, 0.6);
    b.part(new SphereGeometry(0.055, 6, 4), paperPaint(GOLD), {
      bone: head,
      at: lobe,
      scale: [1, 0.8, 1.1],
      group: "head",
      name: "noseLobe",
    });
    const out = new Vector3(s * 0.4, 0.15, 0.9).normalize();
    b.part(new PlaneGeometry(0.07, 0.07), "#ffffff", {
      bone: head,
      at: lobe.clone().addScaledVector(out, 0.05),
      dir: out,
      axis: "z",
      up: [0, 1, 0],
      texture: NOSTRIL,
      group: "head",
      name: "nostril",
    });
  }

  // ---------------------------------------------------------------- Eyes, sockets and brows
  const R_EYE = 0.058;
  for (const s of [1, -1]) {
    const ceye = hd(s * 0.16, 0.095, 0.2);
    const gaze = new Vector3(s * 0.8, 0.2, 0.55).normalize();
    // Socket: three stacked paper discs, ink under jade under gold.
    for (const [layer, color, outer] of [
      [0, INK, 0.028],
      [1, JADE, 0.02],
      [2, GOLD, 0.011],
    ] as const) {
      const z0 = -0.008 + layer * 0.004;
      b.lathe(
        [
          [R_EYE - 0.006, z0],
          [R_EYE + outer, z0],
          [R_EYE + outer, z0 + 0.008],
          [R_EYE - 0.006, z0 + 0.012],
        ],
        { at: ceye, axis: gaze, segments: 12, bone: head, color, group: "head", name: "socket" },
      );
    }
    b.part(new SphereGeometry(R_EYE, 12, 5, 0, Math.PI * 2, 1e-4, Math.PI / 2), "#ffffff", {
      bone: head,
      at: ceye.clone().addScaledVector(gaze, 0.012),
      dir: gaze,
      texture: EYE,
      group: "head",
      name: "eye",
    });
    const glint = ceye.clone().addScaledVector(
      gaze
        .clone()
        .add(new Vector3(0, 0.35, 0.25))
        .normalize(),
      R_EYE * 0.96 + 0.012,
    );
    b.part(new SphereGeometry(0.008, 6, 4), GLINT, { bone: head, at: glint, group: "head", name: "glint" });

    // Brow: three layers of cut paper (ink, jade, gold), each smaller and a paper's thickness further out.
    const BROW: [number, number][] = [
      [0.31, 0.1],
      [0.29, 0.16],
      [0.2, 0.195],
      [0.08, 0.2],
      [-0.05, 0.23],
      [0.04, 0.175],
      [0.15, 0.155],
      [0.24, 0.12],
    ];
    const cz = 0.14;
    const cy = 0.17;
    for (const [layer, color, k] of [
      [0, INK, 1],
      [1, JADE, 0.92],
      [2, GOLD, 0.7],
    ] as const) {
      const outline = BROW.map(([z, y], i): [number, number] | [number, number, "sharp"] => {
        const pt: [number, number] = [cz + (z - cz) * k, cy + (y - cy) * k];
        return i === 4 ? [pt[0], pt[1], "sharp"] : pt;
      });
      b.extrude(outline, {
        at: hd(s * (0.242 + layer * 0.007), 0, 0),
        x: [0, 0, 1],
        y: [-s * 0.45, 1, 0],
        thickness: 0.009,
        color: paperPaint(color),
        bone: head,
        group: "head",
        name: "brow",
      });
    }
  }

  // ---------------------------------------------------------------- Horns and mane
  for (const [sName, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const horn = bezier(
      hd(s * 0.08, 0.15, 0.05),
      hd(s * 0.1, 0.3, 0.05),
      hd(s * 0.15, 0.4, -0.08),
      hd(s * 0.21, 0.44, -0.32),
    );
    b.sweep(horn, [0.045, 0.008], {
      bone: head,
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      bands: [
        [0.2, bambooPaint(GOLD)],
        [0.22, BAMBOO_DK],
        [0.42, bambooPaint(GOLD)],
        [0.44, BAMBOO_DK],
        [0.64, bambooPaint(GOLD)],
        [0.66, BAMBOO_DK],
        [1, bambooPaint(GOLD)],
      ],
      group: "head",
      name: `horn${sName}`,
    });
    // Two prongs: one forward-up, one out and back.
    for (const [tt, prong, r0] of [
      [0.34, [s * 0.06, 0.1, 0.12], 0.026],
      [0.66, [s * 0.09, 0.05, -0.05], 0.02],
    ] as const) {
      const from = horn.at(tt);
      const tipAt = from.clone().add(new Vector3(prong[0], prong[1], prong[2]));
      const bendAt = from.clone().add(new Vector3(prong[0] * 0.3, prong[1] * 0.8, prong[2] * 0.3));
      b.sweep(bezier(from, bendAt, tipAt), [r0, 0.005], {
        bone: head,
        section: { ngon: 5 },
        caps: { start: "flat", end: "point" },
        color: bambooPaint(GOLD),
        group: "head",
        name: `prong${sName}`,
      });
    }
  }
  // A bamboo hoop at the nape and two collars of flames rooted on it.
  const napeLine = frame(hd(0, 0, -0.02), [0, 0, -1]);
  b.lathe(
    [
      [0.11, 0],
      [0.118, -0.007],
      [0.126, 0],
      [0.118, 0.007],
    ],
    {
      at: hd(0, 0, -0.02),
      axis: [0, 0, 1],
      segments: 16,
      bone: head,
      color: bambooPaint(),
      group: "frame",
      name: "napeHoop",
    },
  );
  const inner = b.ring(napeLine, { count: 18, radius: 0.12, tilt: 20 });
  b.cards(inner.items, FLAME_VERM, {
    size: [0.11, 0.34],
    lean: 42,
    bend: 30,
    flow: [0, 0, -1],
    bone: head,
    vary: 0.15,
    spin: 6,
    rng: rand,
    group: "mane",
    name: "maneInner",
  });
  const outer = b.ring(frame(hd(0, 0, 0.06), [0, 0, -1]), { count: 14, radius: 0.19, tilt: 45 });
  b.cards(outer.items, FLAME_JADE, {
    size: [0.13, 0.3],
    lean: 30,
    bend: 30,
    flow: [0, 0, -1],
    bone: head,
    vary: 0.15,
    spin: 6,
    rng: rand,
    group: "mane",
    name: "maneOuter",
  });
  // Beard: gold flames hanging from the chin.
  b.cards(
    [0.32, 0.4, 0.48, 0.55].flatMap((z) =>
      [-1, 1].map((s) => frame(hd(s * 0.05, at(JW, z).y - 0.02, z), [s * 0.3, -1, -0.2])),
    ),
    FLAME_GOLD,
    {
      size: [0.05, 0.14],
      lean: 25,
      bend: 20,
      flow: [0, -0.4, -1],
      bone: jaw,
      vary: 0.15,
      rng: rand,
      group: "jaw",
      name: "beard",
    },
  );

  // ---------------------------------------------------------------- Whiskers: bamboo root, flat paper ribbon
  const whiskerPaint = paint((p, _n, s) =>
    Math.abs(((s[0] * 14) % 1) - 0.5) < 0.09 ? paper(INK, p, 0.04) : paper(GOLD, p, 0.08),
  );
  for (const [sName, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const root = hd(s * 0.1, -0.05, 0.5);
    const tip = hd(s * 0.16, -0.035, 0.58);
    b.rod(root, tip, 0.0055, { bone: head, color: bambooPaint(), sides: 5, group: "head", name: "whiskerRoot" });
    const wk = b.chain(
      `whisker${sName}`,
      catmull([
        tip,
        hd(s * 0.26, -0.02, 0.64),
        hd(s * 0.42, 0.02, 0.55),
        hd(s * 0.55, -0.06, 0.36),
        hd(s * 0.62, -0.17, 0.14),
      ]),
      { parent: head, count: 3, role: "tentacle", up: [0, 1, 0], group: "whiskers" },
    );
    b.sweep(wk, (t) => [0.03 - 0.016 * t, 0.0016], {
      section: "box",
      caps: "flat",
      color: whiskerPaint,
      group: "whiskers",
      name: `whisker${sName}`,
    });
  }

  // ---------------------------------------------------------------- Legs: bamboo wrapped in paper, painted claws
  const FOOT_Y = 0.02;
  const legTop = paperPaint(VERM);
  const legLow = paperPaint(GOLD);
  for (const [tag, di, fwd] of [
    ["F", 4, 0.05],
    ["H", 10, -0.03],
  ] as const) {
    const dr = drums[di];
    for (const [sName, s] of [
      ["L", 1],
      ["R", -1],
    ] as const) {
      const hip = dr.c
        .clone()
        .addScaledVector(dr.e1, s * dr.ro * 0.82)
        .addScaledVector(Y, -0.025);
      const toe = new Vector3(dr.c.x + s * (dr.ro + 0.2), FOOT_Y, dr.c.z + fwd);
      const sole = new Vector3(s * 0.7, 0, 0.7).normalize();
      const pts = limb(hip, toe, [0.15, 0.15, 0.07], new Vector3(s * 0.3, 1, 0.2), { sole });
      const leg = b.chain(`leg${tag}${sName}`, polyline(pts), {
        parent: dr.joint,
        names: [`hip${tag}${sName}`, `knee${tag}${sName}`, `ankle${tag}${sName}`],
        role: "leg",
        contact: [toe.x, 0, toe.z],
        group: "legs",
      });
      b.sweep(leg, [0.034, 0.026, 0.021, 0.017], {
        section: { ngon: 5 },
        bands: [
          [0.5, legTop],
          [0.56, INK],
          [1, legLow],
        ],
        group: "legs",
        name: `leg${tag}${sName}`,
      });
      const ankle = leg.joints[2];
      b.part(new CylinderGeometry(0.034, 0.036, 0.04, 6), paperPaint(GOLD), {
        bone: ankle,
        at: toe,
        group: "legs",
        name: "paw",
      });
      for (const k of [-1, 0, 1]) {
        const dir = sole
          .clone()
          .applyAxisAngle(Y, (k * 34 * Math.PI) / 180)
          .add(new Vector3(0, -0.1, 0))
          .normalize();
        b.spike(toe.clone().addScaledVector(dir, 0.02), dir, 0.06, 0.011, {
          bone: ankle,
          color: TOOTH,
          sides: 4,
          group: "legs",
          name: "claw",
        });
      }
      b.cards([frame(pts[1], [s * 0.5, 0.8, -0.3])], FLAME_VERM, {
        size: [0.055, 0.11],
        lean: 40,
        bend: 25,
        flow: [0, 0, -1],
        bone: leg.joints[1],
        group: "legs",
        name: "kneeFlame",
      });
    }
  }

  // ---------------------------------------------------------------- Tail: paper streamers
  const t1 = new Vector3().crossVectors(tailD, Y).normalize();
  const t2 = new Vector3().crossVectors(t1, tailD);
  const NS = 8;
  const INKS: [string, string][] = [
    [VERM, GOLD_LT],
    [GOLD, VERM],
    [JADE, GOLD_LT],
  ];
  for (let k = 0; k < NS; k++) {
    const phi = (k / NS) * Math.PI * 2 + 0.3;
    const rad = t2.clone().multiplyScalar(Math.cos(phi)).addScaledVector(t1, Math.sin(phi));
    const start = hub.clone().addScaledVector(rad, 0.04);
    const dirK = tailD.clone().addScaledVector(rad, 0.35).normalize();
    const len = 0.42 + 0.07 * Math.sin(k * 2.1);
    const sway = new Vector3()
      .crossVectors(dirK, rad)
      .normalize()
      .multiplyScalar(k % 2 ? 0.09 : -0.09);
    const clampY = (v: Vector3) => v.setY(Math.max(v.y, 0.15));
    const pts = [
      start,
      clampY(
        start
          .clone()
          .addScaledVector(dirK, len * 0.3)
          .addScaledVector(sway, 0.3),
      ),
      clampY(
        start
          .clone()
          .addScaledVector(dirK, len * 0.65)
          .addScaledVector(sway, -0.8)
          .addScaledVector(Y, 0.02),
      ),
      clampY(start.clone().addScaledVector(dirK, len).addScaledVector(sway, 0.6).addScaledVector(Y, -0.04)),
    ];
    b.rod(hub, start, 0.004, {
      bone: tailJoint,
      color: bambooPaint(),
      sides: 4,
      group: "frame",
      name: "streamerSpoke",
    });
    b.part(new SphereGeometry(0.009, 5, 4), CORD, { bone: tailJoint, at: start, group: "frame", name: "streamerKnot" });
    const chain = b.chain(`streamer${k + 1}`, catmull(pts), {
      parent: tailJoint,
      count: 3,
      role: "tail",
      up: k % 2 ? rad : Y,
      twist: ((k % 3) - 1) * 50,
      group: "tail",
    });
    const [base, bar] = INKS[k % 3];
    const ribbon = paint((p, _n, s) => {
      const u = (s[0] * 8.5) % 1;
      if (Math.abs(u - 0.5) < 0.045) return paper(bar, p, 0.05);
      if (s[0] > 0.94 || s[0] < 0.04) return paper(INK, p, 0.03);
      return paper(base, p, 0.08);
    });
    b.sweep(chain, (t) => [0.048 * (1 - 0.12 * t) * (1 - 0.9 * smoothstep(0.86, 1, t)), 0.0016], {
      section: "box",
      caps: "flat",
      color: ribbon,
      group: "tail",
      name: `streamer${k + 1}`,
    });
  }

  // Open the mouth for the rest pose, once every jaw part is on its bone.
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}
