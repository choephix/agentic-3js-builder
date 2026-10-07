import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  paint,
  mottle,
  scales,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Keel-billed Toucan",
  description:
    "A stylized keel-billed toucan in a rig-ready rest pose. It has a glossy black body, a sunny yellow bib edged in red, and a rainbow bill. The wings are spread and layered with extruded feathers, the tail fans out, the jaw is hinged, and the zygodactyl feet are blue.",
};

const EDGE = "#1a1a20";
const RED = "#d8262d";
const GREEN = "#93d63f";
const ORANGE = "#ff8c1a";
const BILLRED = "#e3262e";
const TEAL = "#2fb6b0";
const BLUE = "#4d78db";
const CLAW = "#24242c";
const FEATHER = "#121217";
const SHEEN = "#2a2f48";
const SHAFT = "#3b3b4c";

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---------- paints ----------
  const black = scales("#17171d", "#09090c", { size: 0.016, seed: 3 });
  const yellow = mottle("#ffcf1a", "#ffe866", { size: 0.02, seed: 5 });
  const maroon = mottle("#4f1a26", "#2a1218", { size: 0.02, seed: 8 });
  const bodyPaint = paint((p, n) => {
    if (p.z < -0.045 && n.y < -0.25) return RED; // undertail
    const bibBottom = 0.198 + 6 * p.x * p.x;
    const onFront = n.z > 0.05;
    const cheek = p.y > 0.275 && p.y < 0.322 && p.z > 0.078 && Math.abs(n.x) > 0.3;
    if ((onFront && p.y > bibBottom && p.y < 0.322) || cheek) {
      if (onFront && p.y < bibBottom + 0.011) return RED;
      return yellow;
    }
    if (p.y > 0.25 && n.z < -0.1 && n.y > -0.3) return maroon;
    return black;
  });
  const upperPaint = paint((_p, _n, s) => {
    const t = s[0];
    const a = ((s[1] % 360) + 360) % 360;
    const d = Math.abs(a - 180);
    if (t < 0.13) return EDGE;
    if (t > 0.8) return BILLRED;
    if (t > 0.2 && t < 0.72 && d < 110 - (80 * (t - 0.2)) / 0.52) return ORANGE;
    if (t > 0.68) return TEAL;
    return GREEN;
  });
  const lowerPaint = paint((_p, _n, s) => {
    const t = s[0];
    if (t < 0.13) return EDGE;
    if (t > 0.78) return BILLRED;
    if (t > 0.6) return TEAL;
    return BLUE;
  });
  const legPaint = scales("#5f86d4", "#3d5ca6", { size: 0.006, seed: 11 });
  const tailPaint = paint((_p, _n, s) => {
    const a = ((s[1] % 360) + 360) % 360;
    return a < 5 || a > 355 ? SHAFT : FEATHER;
  });
  const featherPaint = (L: number) =>
    paint((_p, _n, s) =>
      Math.abs(s[1]) < 0.0011 && s[0] > 0.003 && s[0] < L * 0.9 ? SHAFT : s[0] > L * 0.72 ? SHEEN : FEATHER,
    );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.13, -0.03], aim: [0, 0.16, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.16, 0],
      [0, 0.21, 0.035],
      [0, 0.26, 0.06],
    ]),
    { parent: hips, names: ["spine1", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.26, 0.06],
      [0, 0.292, 0.08],
      [0, 0.32, 0.1],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.32, 0.1], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.3, 0.12], aim: [0, 0.296, 0.25], role: "jaw" });

  const tailPts = [
    [0, 0.115, -0.07],
    [0, 0.1, -0.15],
    [0, 0.088, -0.23],
    [0, 0.08, -0.3],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.105, -0.085], w: 0.045, h: 0.04 },
      { at: [0, 0.13, -0.03], w: 0.1, h: 0.105 },
      { at: [0, 0.185, 0.02], w: 0.125, h: 0.13 },
      { at: [0, 0.24, 0.055], w: 0.1, h: 0.105 },
      { at: [0, 0.285, 0.08], w: 0.07, h: 0.072 },
      { at: [0, 0.315, 0.095], w: 0.055, h: 0.056 },
    ],
    { bone: [hips, spine, neck], color: bodyPaint, name: "body" },
  );

  const headPart = b.part(new THREE.SphereGeometry(0.044, 10, 8), bodyPaint, {
    bone: head,
    at: head.local({ up: 0.008 }),
    scale: [0.9, 1, 1.12],
    name: "skull",
  });

  // ---------- bill ----------
  const upper = b.loft(
    [
      { at: [0, 0.327, 0.13], w: 0.032, h: 0.05 },
      { at: [0, 0.33, 0.17], w: 0.03, h: 0.045 },
      { at: [0, 0.325, 0.22], w: 0.022, h: 0.034 },
      { at: [0, 0.312, 0.26], w: 0.014, h: 0.022 },
      { at: [0, 0.293, 0.285], w: 0.006, h: 0.01 },
    ],
    { bone: head, color: upperPaint, name: "billUpper" },
  );
  b.loft(
    [
      { at: [0, 0.293, 0.13], w: 0.028, h: 0.022 },
      { at: [0, 0.296, 0.18], w: 0.024, h: 0.018 },
      { at: [0, 0.296, 0.23], w: 0.016, h: 0.012 },
      { at: [0, 0.292, 0.265], w: 0.007, h: 0.006 },
    ],
    { bone: jaw, color: lowerPaint, name: "billLower" },
  );
  for (const ang of [140, 220]) {
    const edge = upper.line(ang).slice(0.12, 0.9);
    b.sweep(edge, 0.0016, { bone: head, color: EDGE, sides: 5, name: "tomium" });
    b.along(edge, 9, (at) =>
      b.spike(at.at, [0, -1, 0.3], 0.005, 0.0017, { color: EDGE, bone: head, name: "serration" }),
    );
  }

  // ---------- eyes ----------
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M4 34 C6 14 26 4 40 8 C56 12 62 26 58 40 C54 56 30 62 16 54 C8 50 3 44 4 34Z" fill="#8fe03a"/>
      <path d="M12 33 C13 20 26 13 37 15 C49 17 54 27 52 38 C49 50 31 54 21 49 C15 46 11 40 12 33Z" fill="#62b82a"/>
      <circle cx="34" cy="32" r="13" fill="#1d2a16"/>
      <circle cx="34" cy="32" r="9.5" fill="#4a3a14"/>
      <circle cx="34" cy="32" r="5.5" fill="#050505"/>
      <circle cx="30" cy="27" r="3" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const headSurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const eyeHit = headSurf.around(head.at).at(s * 68, 18);
    b.decal(headPart, eyeTex, { at: eyeHit, size: [0.036, 0.032], mirror: s < 0, name: "eyeSkin" });
    b.stick(new THREE.SphereGeometry(0.0075, 8, 6), "#08080a", eyeHit, { embed: 0.55, name: "eyeball" });
    b.stick(new THREE.SphereGeometry(0.0022, 6, 4), "#ffffff", eyeHit.moved([0, 0.0055, 0.0028]), {
      embed: 0,
      name: "eyeGlint",
    });
  }

  // ---------- tail ----------
  for (let i = -2; i <= 2; i++) {
    const ai = Math.abs(i);
    const pts = tailPts.map((p, k) => [
      p[0] + i * 0.017 * (0.3 + (0.7 * k) / 3),
      p[1] + 0.004 - ai * 0.004,
      p[2] + ai * 0.014 * (k / 3),
    ]);
    b.sweep(catmull(pts), () => [0.013, 0.0035], {
      section: "box",
      caps: "flat",
      bone: tail,
      color: tailPaint,
      name: "tailFeather",
    });
  }
  b.sweep(
    catmull([
      [0, 0.118, -0.045],
      [0, 0.1, -0.1],
      [0, 0.092, -0.14],
    ]),
    (t) => [0.028 * (1 - 0.4 * t), 0.014 * (1 - 0.3 * t)],
    { bone: tail, color: RED, name: "undertail" },
  );

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      polyline([
        [s * 0.045, 0.225, 0.025],
        [s * 0.12, 0.23, 0.005],
        [s * 0.2, 0.23, 0.015],
        [s * 0.29, 0.225, 0.0],
      ]),
      {
        parent: spine.joints[1],
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `wingTip${S}`],
        role: "wing",
      },
    );
    b.sweep(wing, [0.018, 0.007], { color: FEATHER, name: "wingArm" });

    const feather = (t: number, L: number, w: number, lift: number, name: string) => {
      const cp = wing.at(t);
      const dx = s * 1.6 * t * t;
      const len = Math.hypot(dx, 1);
      const dir = [dx / len, -0.04, -1 / len];
      const perp = [1 / len, 0, dx / len];
      const at = new THREE.Vector3().copy(cp.at).add(new THREE.Vector3(0, lift, 0));
      b.extrude(
        [
          [0, -w * 0.6],
          [L * 0.7, -w],
          [L * 0.97, -w * 0.5],
          [L, w * 0.15],
          [L * 0.85, w],
          [0, w * 0.6],
        ],
        {
          at,
          x: dir,
          y: perp,
          thickness: 0.003,
          bevel: 0.001,
          smoothing: 1,
          color: featherPaint(L),
          bone: cp.bone,
          name,
        },
      );
    };
    const N = 12;
    for (let i = 0; i < N; i++) {
      const t = 0.05 + (0.95 * i) / (N - 1);
      feather(t, 0.08 + 0.07 * t, 0.013, -0.004 - (i % 2) * 0.004, "flightFeather");
    }
    for (let i = 0; i < 8; i++) {
      const t = 0.05 + (0.7 * i) / 7;
      feather(t, 0.05, 0.011, 0.004 + (i % 2) * 0.003, "covert");
    }
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const foot = [s * 0.042, 0.012, 0.022];
    const pts = limb([s * 0.035, 0.125, 0.0], foot, [0.045, 0.055, 0.035], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    b.sweep(leg, [0.013, 0.0075], { color: legPaint, name: "leg" });
    b.capsule(leg.joints[0], leg.joints[1], 0.02, { color: FEATHER, name: "thigh" });

    const F = leg.tip!.at;
    const toeDirs = [
      [s * 0.15, 1],
      [s * 0.6, 0.8],
      [s * 0.25, -1],
      [s * 0.65, -0.7],
    ];
    toeDirs.forEach((d, k) => {
      const l = Math.hypot(d[0], d[1]);
      const dx = d[0] / l;
      const dz = d[1] / l;
      const toe = b.chain(
        `toe${k + 1}${S}`,
        [
          [F.x, F.y, F.z],
          [F.x + dx * 0.018, 0.006, F.z + dz * 0.018],
          [F.x + dx * 0.036, 0.0052, F.z + dz * 0.036],
        ],
        { parent: leg.tip!, names: [`toe${k + 1}a${S}`, `toe${k + 1}b${S}`], role: "digit" },
      );
      b.sweep(toe, [0.0055, 0.004], { color: legPaint, name: "toe" });
      b.spike([F.x + dx * 0.036, 0.0052, F.z + dz * 0.036], [dx, -0.5, dz], 0.01, 0.0034, {
        color: CLAW,
        bone: toe.joints[1],
        name: "claw",
      });
    });
  }

  return b.root;
}
