import * as THREE from "three";
import { type Builder, createBuilder, frame, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // bladeBone
  (() => {
function buildBladeBone(b: Builder) {
  const BONE = "#efe6d0", BONE_D = "#c9b998", TEAL = "#38f0d0", DARK = "#2a3b3a";
  const bone = "headSocket";
  const spineP: [number, number, number][] = [
    [0, 2.12, 0.05], [0, 2.3, 0.3], [0, 2.46, 0.62], [0, 2.54, 0.95], [0, 2.46, 1.2],
  ];
  const spine = catmull(spineP);
  const P = (t: number) => spine.at(t);

  // collar
  b.part(new THREE.CylinderGeometry(0.075, 0.095, 0.1, 8), BONE_D, { at: [0, 2.1, 0.02], bone });
  b.part(new THREE.TorusGeometry(0.085, 0.015, 5, 8), TEAL, { at: [0, 2.14, 0.02], rotation: [90, 0, 0], bone });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), TEAL, { at: [0, 2.12, 0.1], bone });

  // blade body
  b.sweep(spine, [0.1, 0.01], { color: BONE, section: { ngon: 4 }, caps: "point", bone,
    sectors: [[100, 260, BONE_D]] });
  // glowing vein
  const vein = spineP.map((p) => [p[0], p[1] - 0.025, p[2] + 0.02]);
  b.sweep(catmull(vein.slice(1)), [0.018, 0.006], { color: TEAL, bone, caps: "point", section: { ngon: 5 } });
  b.sweep(catmull(spineP.slice(1).map((p) => [p[0] + 0.0, p[1] + 0.03, p[2]])), [0.012, 0.004], { color: TEAL, bone, caps: "point", section: { ngon: 5 } });

  // vertebra ridges along spine (outer edge)
  for (let i = 0; i < 9; i++) {
    const t = 0.05 + i * 0.1;
    const p = P(t), tg = spine.tangentAt(t);
    const r = 0.04 * (1 - t * 0.7) + 0.015;
    b.part(new THREE.SphereGeometry(r, 6, 4), BONE_D, { at: [0, p.y + 0.07 * (1 - t) + 0.03, p.z], bone, scale: [0.9, 0.8, 1.2] });
    void tg;
  }
  // serrated inner edge
  for (let i = 0; i < 8; i++) {
    const t = 0.18 + i * 0.1;
    const p = P(t);
    const len = 0.1 * (1 - t * 0.6);
    b.spike([0, p.y - 0.06 * (1 - t * 0.5), p.z], [0.0, -0.5, 0.45], len, 0.022, { color: BONE, bone });
  }
  // rib barbs on outer edge
  for (let i = 0; i < 3; i++) {
    const t = 0.3 + i * 0.22;
    const p = P(t);
    b.spike([0, p.y + 0.06, p.z], [0, 0.8, -0.5], 0.17 - i * 0.03, 0.02, { color: BONE_D, bone });
  }
  // tip hook
  b.sweep(catmull([[0, 2.46, 1.2], [0, 2.4, 1.22], [0, 2.3, 1.2], [0, 2.24, 1.14]]), [0.022, 0.004], { color: BONE, bone, caps: "point" });
  b.part(new THREE.SphereGeometry(0.02, 5, 4), TEAL, { at: [0, 2.42, 1.17], bone });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.1), DARK, { at: [0, 2.16, 0.12], bone });
}
    return buildBladeBone;
  })(),
  // dragonSkullPommel
  (() => {
function buildDragonSkullPommel(b: Builder) {
  // The base source was not included in the prompt, so this is placed from the stated
  // attachment: the buttCap joint near [0, 0.28, 0].
  const BONE = "#e8dcc0";
  const BONE_D = "#b9a98a";
  const DARK = "#1a1420";
  const GLOW = "#5cf2ff";
  const GOLD = "#c9a24a";
  const bone = "buttCap";

  const jaw = b.joint("dragonSkullPommelJaw", {
    parent: bone,
    at: [0, 0.14, 0.0],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const P = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });

  // Cranium and brow
  P(new THREE.SphereGeometry(0.085, 8, 6), BONE, [0, 0.2, -0.03]);
  P(new THREE.BoxGeometry(0.15, 0.025, 0.07), BONE_D, [0, 0.235, 0.03]);
  // Upper snout
  P(new THREE.BoxGeometry(0.085, 0.055, 0.13), BONE, [0, 0.17, 0.09]);
  P(new THREE.BoxGeometry(0.07, 0.03, 0.04), BONE_D, [0, 0.195, 0.14]);
  // Nostrils
  for (const s of [1, -1]) P(new THREE.SphereGeometry(0.008, 5, 4), DARK, [s * 0.02, 0.19, 0.162]);

  // Eye sockets with glowing eyes
  for (const s of [1, -1]) {
    P(new THREE.SphereGeometry(0.03, 7, 5), DARK, [s * 0.052, 0.205, 0.035]);
    glow(P(new THREE.SphereGeometry(0.017, 6, 4), GLOW, [s * 0.058, 0.205, 0.05]), 1.6);
  }

  // Horns sweeping back and up
  for (const s of [1, -1]) {
    P(new THREE.ConeGeometry(0.026, 0.14, 6), BONE_D, [s * 0.1, 0.25, -0.1], { dir: [s * 0.55, 0.45, -0.75] });
    P(new THREE.ConeGeometry(0.014, 0.08, 5), BONE_D, [s * 0.075, 0.15, -0.17], { dir: [s * 0.5, -0.1, -0.85] });
  }

  // Upper fangs
  for (const s of [1, -1]) {
    P(new THREE.ConeGeometry(0.011, 0.05, 5), "#ffffff", [s * 0.034, 0.12, 0.13], { dir: [0, -1, 0] });
    for (const z of [0.085, 0.045])
      P(new THREE.ConeGeometry(0.006, 0.022, 4), "#ffffff", [s * 0.036, 0.138, z], { dir: [0, -1, 0] });
  }

  // Lower jaw (on its own joint)
  b.part(new THREE.BoxGeometry(0.07, 0.022, 0.11), BONE_D, { bone: jaw, at: [0, 0.122, 0.085] });
  b.part(new THREE.BoxGeometry(0.05, 0.02, 0.03), BONE_D, { bone: jaw, at: [0, 0.122, 0.15] });
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.009, 0.036, 5), "#ffffff", {
      bone: jaw,
      at: [s * 0.026, 0.148, 0.14],
      dir: [0, 1, 0],
    });
  b.part(new THREE.BoxGeometry(0.06, 0.008, 0.08), "#7a1f2b", { bone: jaw, at: [0, 0.137, 0.09] });

  // Spike ferrule under the skull
  P(new THREE.CylinderGeometry(0.03, 0.022, 0.025, 8), GOLD, [0, 0.105, -0.03]);
  P(new THREE.CylinderGeometry(0.036, 0.036, 0.01, 8), GOLD, [0, 0.09, -0.03]);
  P(new THREE.ConeGeometry(0.022, 0.09, 8), "#9aa3b2", [0, 0.045, -0.03], { dir: [0, -1, 0] });
  // Soul flame in the skull's brain case
  glow(P(new THREE.SphereGeometry(0.02, 6, 4), GLOW, [0, 0.225, -0.05]), 1.2);
}
    return buildDragonSkullPommel;
  })(),
  // gripWraps
  (() => {
function buildGripWraps(b: Builder) {
  const LEATHER = "#5a3a24";
  const LEATHER2 = "#7a5233";
  const SINEW = "#d8c7a0";
  const BONE = "#ece2c8";
  const RUNE = "#52f0d0";
  const RIBBON = "#7a1fa8";
  const RIBBON2 = "#c23b8a";
  const DARK = "#2a1a12";
  const R = 0.04; // assumed shaft radius
  const bone = "shaft";

  const place = (geo: THREE.BufferGeometry, color: string, at: [number, number, number], opts: any = {}) =>
    b.part(geo, color, { bone, at, ...opts });

  // leather wrap bands: stacked, slightly tilted torus-like rings
  const wraps = (y0: number, y1: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const y = y0 + ((y1 - y0) * i) / (n - 1);
      const c = i % 2 ? LEATHER : LEATHER2;
      place(new THREE.CylinderGeometry(R + 0.009, R + 0.009, (y1 - y0) / n * 0.9, 8), c, [0, y, 0], {
        rotation: [i % 2 ? 3 : -3, i * 20, 0],
      });
    }
  };
  wraps(0.45, 0.95, 14);
  wraps(1.12, 1.4, 8);

  // sinew cross-binding: thin diagonal strands
  for (let i = 0; i < 10; i++) {
    const y = 0.5 + i * 0.045;
    place(new THREE.BoxGeometry(0.004, 0.05, 0.004), SINEW, [R + 0.011, y, 0], { rotation: [0, 0, 30] });
    place(new THREE.BoxGeometry(0.004, 0.05, 0.004), SINEW, [-R - 0.011, y, 0], { rotation: [0, 0, -30] });
  }

  // bone rings with rune bands
  const ring = (y: number, h: number) => {
    place(new THREE.CylinderGeometry(R + 0.018, R + 0.018, h, 8), BONE, [0, y, 0]);
    place(new THREE.CylinderGeometry(R + 0.02, R + 0.02, h * 0.25, 8), DARK, [0, y + h * 0.5, 0]);
    place(new THREE.CylinderGeometry(R + 0.02, R + 0.02, h * 0.25, 8), DARK, [0, y - h * 0.5, 0]);
  };
  [0.42, 0.98, 1.08, 1.44].forEach((y) => ring(y, 0.035));

  // rune-carved band
  const runeY = 1.02;
  place(new THREE.CylinderGeometry(R + 0.014, R + 0.014, 0.07, 8), DARK, [0, runeY, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.sin(a) * (R + 0.016);
    const z = Math.cos(a) * (R + 0.016);
    place(new THREE.BoxGeometry(0.008, 0.045, 0.004), RUNE, [x, runeY, z], { rotation: [0, (a * 180) / Math.PI, i % 2 ? 20 : -20] });
    place(new THREE.BoxGeometry(0.02, 0.006, 0.004), RUNE, [x, runeY + 0.01, z], { rotation: [0, (a * 180) / Math.PI, 0] });
  }

  // tassel with ribbons hanging from the knot at y 0.96
  const knotY = 0.97;
  place(new THREE.SphereGeometry(0.03, 8, 6), LEATHER2, [0.055, knotY, 0.02]);
  place(new THREE.TorusGeometry(0.03, 0.006, 5, 10), BONE, [0.055, knotY, 0.02], { rotation: [90, 0, 0] });
  const ribbons: [number, string, number][] = [
    [0.03, RIBBON, 0.3],
    [0.055, RIBBON2, 0.36],
    [0.08, RIBBON, 0.26],
  ];
  ribbons.forEach(([x, c, len], i) => {
    place(new THREE.BoxGeometry(0.018, len, 0.004), c, [x, knotY - 0.03 - len / 2, 0.02 + i * 0.004], {
      rotation: [0, 0, (i - 1) * 4],
    });
    place(new THREE.ConeGeometry(0.014, 0.03, 4), c, [x + (i - 1) * len * 0.07, knotY - 0.03 - len - 0.012, 0.02 + i * 0.004], {
      rotation: [180, 45, 0],
    });
  });
  // tassel threads
  for (let i = 0; i < 5; i++) {
    place(new THREE.CylinderGeometry(0.002, 0.002, 0.14, 4), SINEW, [0.04 + i * 0.01, knotY - 0.1, 0.03], {});
  }
  // charms: bone fang and skull bead on cords
  place(new THREE.CylinderGeometry(0.002, 0.002, 0.08, 4), DARK, [-0.06, 1.2, 0.02]);
  place(new THREE.ConeGeometry(0.014, 0.07, 6), BONE, [-0.06, 1.12, 0.02], { rotation: [180, 0, 0] });
  place(new THREE.SphereGeometry(0.022, 8, 6), BONE, [-0.06, 1.2, 0.02]);
  place(new THREE.BoxGeometry(0.008, 0.01, 0.004), DARK, [-0.067, 1.2, 0.04]);
  place(new THREE.BoxGeometry(0.008, 0.01, 0.004), DARK, [-0.053, 1.2, 0.04]);
  place(new THREE.SphereGeometry(0.012, 6, 4), RUNE, [-0.06, 1.02, 0.02]);
}
    return buildGripWraps;
  })(),
  // soulCage
  (() => {
function buildSoulCage(b: Builder) {
  const BONE = "#e8dcc0", BONE_D = "#b8a888", GOLD = "#d9a83a", GOLD_D = "#8a6420";
  const SOUL = "#5cf2d6", SOUL_L = "#d8fff4", RUNE = "#7af0ff", DARK = "#2a2230";
  const C = new THREE.Vector3(0, 2.0, 0);
  const cageJoint = b.joint("soulCageRoot", { at: [0, 1.7, 0], dir: [0, 1, 0] });
  const bone = { bone: cageJoint };

  const ball = (r: number, col: string, p: number[], s: [number, number, number] = [1, 1, 1], seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, 6), col, { ...bone, at: p as any, scale: s });

  // lower gilded collar + upper rim
  for (const [y, r, h] of [[1.66, 0.12, 0.05], [1.72, 0.1, 0.03]] as number[][]) {
    b.part(new THREE.CylinderGeometry(r, r + 0.02, h, 10), GOLD, { ...bone, at: [0, y, 0] });
  }
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 12), GOLD, { ...bone, at: [0, 2.32, 0] });
  b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.02, 12), GOLD_D, { ...bone, at: [0, 2.3, 0] });
  b.part(new THREE.ConeGeometry(0.05, 0.1, 6), GOLD, { ...bone, at: [0, 2.39, 0] });

  // ribs: curved bone arcs from lower collar to upper rim
  const N = 6;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const dx = Math.sin(a), dz = Math.cos(a);
    const pts: number[][] = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const y = 1.72 + t * 0.58;
      const r = 0.1 + 0.15 * Math.sin(t * Math.PI);
      pts.push([dx * r, y, dz * r]);
    }
    for (let k = 0; k < 6; k++) {
      const w = 0.022 - k * 0.0015;
      b.rod(pts[k], pts[k + 1], [w + 0.002, w], BONE, { bone: cageJoint });
    }
    // gilded band and knuckle on each rib
    const m = pts[3];
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), GOLD, { ...bone, at: [m[0], m[1], m[2]] as any });
    ball(0.03, BONE_D, pts[1], [1, 1, 1], 6);
    // rune plate on alternate ribs
    if (i % 2 === 0) {
      const o = [dx * 0.255, 2.0, dz * 0.255];
      b.part(new THREE.BoxGeometry(0.06, 0.1, 0.012), GOLD_D, { ...bone, at: o as any, rotation: [0, (a * 180) / Math.PI, 0] });
      b.part(new THREE.BoxGeometry(0.03, 0.07, 0.006), RUNE, {
        ...bone, at: [dx * 0.263, 2.0, dz * 0.263] as any, rotation: [0, (a * 180) / Math.PI, 0],
      });
    }
  }

  // soul orb: dark inner shell, glowing core, highlight
  ball(0.1, SOUL, [0, 2.0, 0], [1, 1, 1], 12);
  ball(0.065, SOUL_L, [0, 2.0, 0], [1, 1, 1], 8);
  ball(0.02, "#ffffff", [0.04, 2.05, 0.06], [1, 1, 1], 5);
  b.part(new THREE.TorusGeometry(0.13, 0.008, 5, 16), GOLD, { ...bone, at: [0, 2.0, 0], rotation: [70, 0, 20] });

  // wisps: curling tapered tails rising around the orb
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const p0 = [Math.sin(a) * 0.1, 2.0 + 0.02 * i, Math.cos(a) * 0.1];
    const p1 = [Math.sin(a + 0.8) * 0.17, 2.1 + 0.04 * i, Math.cos(a + 0.8) * 0.17];
    const p2 = [Math.sin(a + 1.5) * 0.1, 2.22 + 0.03 * i, Math.cos(a + 1.5) * 0.1];
    b.sweep([p0, p1, p2], [0.016, 0], { ...bone, color: i % 2 ? SOUL : SOUL_L, caps: { end: "point" } });
    ball(0.012, SOUL_L, p2 as number[], [1, 1, 1], 5);
  }

  // dark socket ring tying the cage to the shaft
  b.part(new THREE.TorusGeometry(0.075, 0.015, 5, 10), DARK, { ...bone, at: [0, 1.62, 0], rotation: [90, 0, 0] });
}
    return buildSoulCage;
  })(),
];

export const BASE_PARTS = [
  {
    id: "bladeBone",
    builds: "The great curved dragonbone blade sweeping from the head socket: bone-white crescent blade with serrated inner edge, vertebra ridges along the spine, glowing teal soul-fire veins, tip hook and a few rib-like barbs",
    box: [
      [-0.12, 1.95, -0.2],
      [0.12, 2.75, 1.25],
    ],
    attaches: "The blade root collar at the top of the shaft head socket (headSocket joint at about [0, 2.1, 0.0]), the blade sweeps toward +Z",
    joints: ["headSocket"],
    floor: false,
    budget: 300,
  },
  {
    id: "dragonSkullPommel",
    builds: "A small dragon skull with horns, fangs, glowing eye sockets and jaw, sitting at the butt of the shaft, plus a spike ferrule",
    box: [
      [-0.2, 0, -0.25],
      [0.2, 0.3, 0.25],
    ],
    attaches: "The shaft butt cap at the bottom end (buttCap joint near [0, 0.28, 0])",
    joints: ["buttCap"],
    floor: true,
    budget: 150,
  },
  {
    id: "gripWraps",
    builds: "Leather and sinew grip wraps, bone rings, tassels with ribbons, rune-carved bands and charms along the lower and mid shaft",
    box: [
      [-0.14, 0.4, -0.14],
      [0.14, 1.6, 0.14],
    ],
    attaches: "The surface of the shaft between y 0.4 and y 1.6 (shaft joint)",
    joints: ["shaft"],
    floor: false,
    budget: 150,
  },
  {
    id: "soulCage",
    builds: "Ribcage-like bone cage near the head holding a floating glowing soul orb with wisps, plus gilded rim fittings and rune plates",
    box: [
      [-0.3, 1.6, -0.3],
      [0.3, 2.4, 0.3],
    ],
    attaches: "The head socket collar and upper shaft, around headSocket joint",
    joints: ["headSocket"],
    floor: false,
    budget: 200,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const BONE = "#e8dfc8";
  const BONE_D = "#b9ab8a";
  const GOLD = "#c8962e";
  const DARK = "#2a2230";

  const butt = b.joint("buttCap", { at: [0, 0.28, 0], role: "spine" });
  const shaft = b.joint("shaft", { parent: butt, at: [0, 0.28, 0], aim: [0, 2.0, 0], role: "spine" });
  const head = b.joint("headSocket", { parent: shaft, at: [0, 2.0, 0], aim: [0, 2.3, 0.1], role: "spine" });

  // Main shaft: a straight faceted dragonbone pole, slightly tapered
  b.rod([0, 0.28, 0], [0, 2.05, 0], [0.04, 0.035], BONE, { bone: shaft, sides: 8 });

  // Butt cap: gold ferrule and a stout cone so it rests on y=0
  b.part(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 8), GOLD, { bone: butt, at: [0, 0.23, 0] });
  b.part(new THREE.ConeGeometry(0.05, 0.18, 8), DARK, { bone: butt, at: [0, 0.09, 0], rotation: [180, 0, 0] });

  // Mid shaft knuckle joints (bone swellings)
  for (const y of [0.7, 1.1, 1.5]) {
    b.part(new THREE.SphereGeometry(0.058, 8, 6), BONE_D, { bone: shaft, at: [0, y, 0], scale: [1, 0.7, 1] });
  }

  // Head socket: collar, mount block, and base of the blade
  b.part(new THREE.CylinderGeometry(0.075, 0.06, 0.14, 8), GOLD, { bone: head, at: [0, 2.0, 0] });
  b.part(new THREE.CylinderGeometry(0.06, 0.075, 0.1, 8), BONE_D, { bone: head, at: [0, 2.11, 0] });
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.2), BONE, { bone: head, at: [0, 2.16, 0.07] });
  b.part(new THREE.BoxGeometry(0.07, 0.07, 0.16), BONE_D, { bone: head, at: [0, 2.2, 0.2] });

    for (const add of PARTS) add(b);
  return b.root;
}
