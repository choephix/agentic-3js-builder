// Treasure hoard: an open chest brimming with coins, a jewelled crown, goblets, gems, pearls and a pendant.
// League of Legends look: exaggerated chunky shapes, cel-shaded paints with hue-shifted shadows, saturated gems
// that glow, sparkle stars, readable from a high top-down camera.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import type { PartOptions } from "../../../../src/parts";
import { aim, rng } from "../../../../src/math";
import { grain, mottle, paint, spots } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "An open sapphire-blue chest spilling gold coins, with a jewelled crown, two goblets, cut gems, a pearl strand and a sapphire pendant.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type V = [number, number, number];
const DEG = Math.PI / 180;

/** A local coordinate frame (origin + rotation + owning bone) so whole sub-assemblies can be authored upright. */
class Rig {
  constructor(
    readonly o: THREE.Vector3,
    readonly q: THREE.Quaternion,
    readonly bone: string,
  ) {}

  P(p: readonly number[]) {
    return new THREE.Vector3(p[0], p[1], p[2]).applyQuaternion(this.q).add(this.o);
  }

  D(d: readonly number[]) {
    return new THREE.Vector3(d[0], d[1], d[2]).applyQuaternion(this.q);
  }
}

type PutOpts = {
  dir?: V;
  axis?: "x" | "y" | "z";
  rot?: V;
  scale?: number | V;
  texture?: THREE.Texture;
  flat?: boolean;
  name?: string;
};

const poly = (pts: number[][]): OutlinePoint[] => pts.map((q) => [q[0], q[1]] as OutlinePoint);

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });

  // ---------------------------------------------------------------------------------------------------------
  // Palette
  const GOLD = cel(mottle("#ffd04a", "#ffbb2c", { size: 0.07, contrast: 0.8 }));
  const GOLD_D = cel("#d58a1c", "#a35a1a");
  const GOLD_L = cel("#ffe27a", "#f0b030");
  const MOUND = cel(mottle("#e6a42c", "#c9821e", { size: 0.09 }));
  const wood = grain("#2f58a6", "#2a4d96", { size: 0.012, axis: "x" });
  const BLUE = cel(
    paint((p) => {
      const k = p.y / 0.07;
      return k - Math.floor(k) < 0.05 ? "#17265c" : wood;
    }),
  );
  const VEL = cel("#b3203f", "#6b1233");
  const HY = 0.46;
  const HZ = -0.25;
  const TH = 100 * DEG;
  const quilt = paint((p) => {
    const zl = (p.y - HY) * Math.sin(TH) + (p.z - HZ) * Math.cos(TH);
    const a = (p.x + zl) / 0.11;
    const c = (p.x - zl) / 0.11;
    const fa = Math.abs(a - Math.floor(a) - 0.5);
    const fc = Math.abs(c - Math.floor(c) - 0.5);
    return fa > 0.465 || fc > 0.465 ? "#5a0e2a" : VEL;
  });
  const ERMINE = cel(spots("#f6f1e8", "#2b2630", { size: 0.035, amount: 0.35 }));
  const INK = "#2a1a3a";
  const PEARL = "#f3eee4";
  const RUBY = "#e0243c";
  const SAPH = "#2a5cff";
  const EMER = "#14b866";
  const AMET = "#9a3cf0";

  // ---------------------------------------------------------------------------------------------------------
  // Drawings
  const fleurTex = svg(
    `<svg viewBox="0 0 48 64">
      <g fill="#ffc531" stroke="#8a4a10" stroke-width="2.5" stroke-linejoin="round">
        <path d="M24 3 C32 14 32 28 24 40 C16 28 16 14 24 3Z"/>
        <path d="M21 36 C10 40 3 32 6 20 C13 22 17 27 20 31Z"/>
        <path d="M27 36 C38 40 45 32 42 20 C35 22 31 27 28 31Z"/>
        <rect x="14" y="38" width="20" height="6" rx="2"/>
        <path d="M19 46 H29 L32 60 H16Z"/>
      </g>
      <path d="M22 10 C19 18 19 26 21 32" stroke="#fff0a8" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
  const coinSvg = (bg: string, rim: string, mark: string, shine: string) =>
    svg(
      `<svg viewBox="0 0 64 64">
        <rect width="64" height="64" fill="${bg}"/>
        <circle cx="32" cy="32" r="29" fill="none" stroke="${rim}" stroke-width="4"/>
        <circle cx="32" cy="32" r="24" fill="none" stroke="${shine}" stroke-width="2"/>
        <g fill="${mark}">
          <path d="M32 12 C38 20 38 30 32 38 C26 30 26 20 32 12Z"/>
          <path d="M30 36 C22 40 14 34 16 24 C22 26 24 30 28 32Z"/>
          <path d="M34 36 C42 40 50 34 48 24 C42 26 40 30 36 32Z"/>
          <rect x="24" y="38" width="16" height="4" rx="1"/>
          <path d="M28 42 H36 L38 52 H26Z"/>
        </g>
      </svg>`,
      { size: 128 },
    );
  const coinA = coinSvg("#f6bb2e", "#ffe27a", "#c47c18", "#d89a22");
  const coinB = coinSvg("#e8a420", "#ffd860", "#b06a14", "#c98a1c");
  const starTex = svg(
    `<svg viewBox="0 0 64 64">
      <polygon points="32,0 38,26 64,32 38,38 32,64 26,38 0,32 26,26" fill="#fff6c8"/>
      <circle cx="32" cy="32" r="7" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------------------------------------
  // Skeleton: a root and the lid hinge
  const root = b.joint("root", { at: [0, 0, 0] });
  b.joint("lid", { parent: root, at: [0, HY, HZ], dir: [0, Math.sin(TH), Math.cos(TH)], role: "hinge" });

  const world = new Rig(new THREE.Vector3(0, 0, 0), new THREE.Quaternion(), "root");
  const lid = new Rig(
    new THREE.Vector3(0, HY, HZ),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -TH),
    "lid",
  );

  const put = (r: Rig, g: THREE.BufferGeometry, color: Fill, p: V, o: PutOpts = {}) => {
    const opt: PartOptions = { at: r.P(p), bone: r.bone };
    if (o.dir) {
      opt.dir = r.D(o.dir);
      if (o.axis) opt.axis = o.axis;
    } else {
      const rot = o.rot ?? [0, 0, 0];
      opt.quat = r.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)));
    }
    if (o.scale !== undefined) opt.scale = o.scale;
    if (o.texture) opt.texture = o.texture;
    if (o.flat) opt.flat = true;
    if (o.name) opt.name = o.name;
    return b.part(g, color, opt);
  };
  const lathe = (r: Rig, outline: number[][], color: Fill, p: V, segments = 12, axis: V = [0, 1, 0]) =>
    b.lathe(poly(outline), { at: r.P(p), axis: r.D(axis), segments, color, bone: r.bone });
  const ext = (r: Rig, outline: number[][], color: Fill, p: V, xl: V, yl: V, thickness: number, bevel = 0) =>
    b.extrude(poly(outline), {
      at: r.P(p),
      x: r.D(xl),
      y: r.D(yl),
      thickness,
      color,
      bone: r.bone,
      ...(bevel ? { bevel } : {}),
    });
  const box = (r: Rig, w: number, h: number, d: number, color: Fill, p: V, o: PutOpts = {}) =>
    put(r, new THREE.BoxGeometry(w, h, d), color, p, o);
  const cone = (r: Rig, rad: number, h: number, seg: number, color: Fill, p: V, o: PutOpts = {}) =>
    put(r, new THREE.ConeGeometry(rad, h, seg), color, p, o);
  const ball = (r: Rig, rad: number, color: Fill, p: V, o: PutOpts = {}) =>
    put(r, new THREE.SphereGeometry(rad, 8, 6), color, p, o);
  const cyl = (r: Rig, rt: number, rb: number, h: number, seg: number, color: Fill, p: V, o: PutOpts = {}) =>
    put(r, new THREE.CylinderGeometry(rt, rb, h, seg), color, p, o);

  const gemGeo = (rad: number, h: number) =>
    new THREE.LatheGeometry(
      [
        [0.0001, 0],
        [rad, 0.42 * h],
        [rad, 0.52 * h],
        [0.62 * rad, h],
        [0.0001, h],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      8,
    );
  /** A cut gem whose pavilion tip sits at `p`, table facing `dir`; glows softly in its own colour. */
  const gem = (r: Rig, p: V, color: string, rad: number, h: number, dir: V, scale?: V, strength = 0.45) =>
    glow(put(r, gemGeo(rad, h), color, p, { dir, flat: true, ...(scale ? { scale } : {}) }), strength);

  /** Merge many small same-colour pieces (given in model space) into one part. */
  const merged = (geos: THREE.BufferGeometry[], color: Fill, bone = "root", texture?: THREE.Texture) => {
    const g = mergeGeometries(geos);
    if (!g) throw new Error("treasureHoard: merge failed");
    return b.part(g, color, { at: [0, 0, 0], bone, ...(texture ? { texture } : {}) });
  };
  const spheresAt = (pts: THREE.Vector3[], rad: number, seg = 6) =>
    pts.map((q) => new THREE.SphereGeometry(rad, seg, Math.max(3, seg - 2)).translate(q.x, q.y, q.z));

  // ---------------------------------------------------------------------------------------------------------
  // Heaps
  const mound = (x: number, z: number) => {
    const u = (x / 0.9) ** 2 + ((z - 0.1) / 0.65) ** 2;
    return u < 1 ? 0.12 * Math.sqrt(1 - u) : 0;
  };
  const heap = (x: number, z: number) => {
    const u = (x / 0.4) ** 2 + (z / 0.21) ** 2;
    return u < 1 ? 0.44 + 0.14 * Math.sqrt(1 - u) : 0.44;
  };
  put(world, new THREE.SphereGeometry(1, 20, 6, 0, Math.PI * 2, 0, Math.PI / 2), MOUND, [0, 0, 0.1], {
    scale: [0.9, 0.12, 0.65],
    name: "floorMound",
  });
  put(world, new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), MOUND, [0, 0.44, 0], {
    scale: [0.4, 0.14, 0.21],
    name: "chestMound",
  });

  // ---------------------------------------------------------------------------------------------------------
  // Chest body
  box(world, 0.9, 0.03, 0.5, BLUE, [0, 0.045, 0], { name: "bodyFloor" });
  box(world, 0.9, 0.42, 0.03, BLUE, [0, 0.24, 0.235], { name: "bodyFront" });
  box(world, 0.9, 0.42, 0.03, BLUE, [0, 0.24, -0.235], { name: "bodyBack" });
  for (const s of [1, -1]) box(world, 0.03, 0.42, 0.5, BLUE, [s * 0.435, 0.24, 0], { name: "bodySide" });
  // red lining inside
  box(world, 0.82, 0.4, 0.01, VEL, [0, 0.25, -0.215], { name: "liningBack" });
  for (const s of [1, -1]) box(world, 0.01, 0.4, 0.42, VEL, [s * 0.415, 0.25, 0], { name: "liningSide" });

  // gold frame
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(world, 0.075, 0.46, 0.075, GOLD, [sx * 0.44, 0.245, sz * 0.24], { name: "post" });
      cone(world, 0.034, 0.075, 4, GOLD_L, [sx * 0.44, 0.52, sz * 0.24], { rot: [0, 45, 0], name: "postSpike" });
      box(world, 0.09, 0.05, 0.09, GOLD_D, [sx * 0.44, 0.06, sz * 0.24], { name: "postFoot" });
    }
  for (const sz of [1, -1]) {
    box(world, 0.95, 0.04, 0.06, GOLD, [0, 0.44, sz * 0.25], { name: "rimTopLong" });
    box(world, 0.95, 0.05, 0.06, GOLD, [0, 0.06, sz * 0.25], { name: "rimBottomLong" });
    box(world, 0.95, 0.025, 0.04, GOLD_D, [0, 0.25, sz * 0.265], { name: "midBand" });
  }
  for (const sx of [1, -1]) {
    box(world, 0.06, 0.04, 0.5, GOLD, [sx * 0.46, 0.44, 0], { name: "rimTopShort" });
    box(world, 0.06, 0.05, 0.5, GOLD, [sx * 0.46, 0.06, 0], { name: "rimBottomShort" });
  }

  // rivets along front rims
  const rivets: THREE.Vector3[] = [];
  for (let i = -4; i <= 4; i++) {
    rivets.push(new THREE.Vector3(i * 0.1, 0.443, 0.282));
    rivets.push(new THREE.Vector3(i * 0.1, 0.06, 0.282));
  }
  merged(spheresAt(rivets, 0.0085), "#ffe27a");

  // front: fleurs, lion plaque, knocker
  for (const s of [1, -1])
    put(world, new THREE.PlaneGeometry(0.1, 0.133), "#ffffff", [s * 0.33, 0.23, 0.2535], {
      dir: [0, 0, 1],
      axis: "z",
      texture: fleurTex,
      name: "fleurDecal",
    });
  const plaque = [
    [0, -0.11],
    [0.08, -0.06],
    [0.085, 0.07],
    [0, 0.125],
    [-0.085, 0.07],
    [-0.08, -0.06],
  ];
  const lion = new Rig(new THREE.Vector3(0, 0.27, 0.256), new THREE.Quaternion(), "root");
  ext(lion, plaque, GOLD, [0, 0, 0], [1, 0, 0], [0, 1, 0], 0.014, 0.004);
  ext(lion, plaque.map(([x, y]) => [x * 0.8, y * 0.8]), GOLD_D, [0, 0, 0.008], [1, 0, 0], [0, 1, 0], 0.012, 0.003);
  ball(lion, 0.046, GOLD_D, [0, 0, 0.022], { scale: [1, 1, 0.45], name: "mane" });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    cone(lion, 0.015, 0.045, 5, GOLD_L, [Math.cos(a) * 0.056, Math.sin(a) * 0.056, 0.028], {
      dir: [Math.cos(a), Math.sin(a), 0.3],
      name: "maneSpike",
    });
  }
  ball(lion, 0.032, GOLD_L, [0, 0.002, 0.035], { scale: [1, 1.05, 0.7], name: "lionFace" });
  ball(lion, 0.017, GOLD, [0, -0.013, 0.052], { scale: [1.25, 0.8, 0.85], name: "lionMuzzle" });
  box(lion, 0.012, 0.008, 0.006, INK, [0, -0.003, 0.064], { name: "lionNose" });
  for (const s of [1, -1]) {
    ball(lion, 0.006, INK, [s * 0.014, 0.012, 0.056], { name: "lionEye" });
    box(lion, 0.02, 0.005, 0.006, GOLD_D, [s * 0.015, 0.02, 0.055], { rot: [0, 0, s * 15], name: "lionBrow" });
    ball(lion, 0.011, GOLD_L, [s * 0.034, 0.036, 0.03], { name: "lionEar" });
  }
  put(lion, new THREE.TorusGeometry(0.034, 0.0075, 5, 14), GOLD, [0, -0.105, 0.012], { name: "knocker" });
  ball(lion, 0.014, GOLD_L, [0, -0.07, 0.014], { name: "knockerBoss" });

  // side plates and handle rings
  for (const s of [1, -1]) {
    box(world, 0.014, 0.12, 0.12, GOLD, [s * 0.462, 0.23, 0], { name: "sidePlate" });
    put(world, new THREE.TorusGeometry(0.05, 0.0095, 5, 14), GOLD_L, [s * 0.478, 0.19, 0], {
      dir: [s, 0, 0],
      axis: "z",
      name: "sideRing",
    });
    ball(world, 0.017, GOLD_D, [s * 0.472, 0.255, 0], { name: "sideBoss" });
  }

  // ---------------------------------------------------------------------------------------------------------
  // Lid (hinged, built upright in lid-local space, y = out of the lid, z = toward the front when closed)
  const lidPanel = (y0: number, z0: number, y1: number, z1: number) => {
    const len = Math.hypot(y1 - y0, z1 - z0);
    box(lid, 0.9, len, 0.03, BLUE, [0, (y0 + y1) / 2, (z0 + z1) / 2], { dir: [0, y1 - y0, z1 - z0], name: "lidPanel" });
  };
  lidPanel(0, 0, 0.05, 0);
  lidPanel(0.05, 0, 0.2, 0.1);
  lidPanel(0.2, 0.1, 0.2, 0.42);
  lidPanel(0.2, 0.42, 0.05, 0.52);
  lidPanel(0.05, 0.52, 0, 0.52);
  ext(
    lid,
    [
      [0.03, 0],
      [0.49, 0],
      [0.49, 0.04],
      [0.395, 0.17],
      [0.125, 0.17],
      [0.03, 0.04],
    ],
    quilt,
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    0.88,
  );
  // gold lip around the opening
  for (const z of [0.015, 0.505]) box(lid, 0.94, 0.03, 0.03, GOLD, [0, 0.012, z], { name: "lidLip" });
  for (const s of [1, -1]) box(lid, 0.04, 0.03, 0.52, GOLD, [s * 0.455, 0.012, 0.26], { name: "lidLipSide" });
  // end caps: blue plates inside gold borders
  const capOuter = [
    [-0.01, -0.005],
    [0.53, -0.005],
    [0.53, 0.052],
    [0.43, 0.21],
    [0.09, 0.21],
    [-0.01, 0.052],
  ];
  const capInner = [
    [0.025, 0.02],
    [0.495, 0.02],
    [0.495, 0.055],
    [0.405, 0.18],
    [0.115, 0.18],
    [0.025, 0.055],
  ];
  for (const s of [1, -1]) {
    ext(lid, capOuter, GOLD, [s * 0.465, 0, 0], [0, 0, 1], [0, 1, 0], 0.04, 0.008);
    ext(lid, capInner, BLUE, [s * 0.465, 0, 0], [0, 0, 1], [0, 1, 0], 0.05);
    // gold bands across the lid
    ext(
      lid,
      [
        [0, 0.02],
        [0.52, 0.02],
        [0.52, 0.06],
        [0.43, 0.225],
        [0.09, 0.225],
        [0, 0.06],
      ],
      GOLD,
      [s * 0.25, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
      0.04,
      0.006,
    );
    cyl(lid, 0.02, 0.02, 0.1, 8, GOLD_D, [s * 0.25, 0, -0.005], { dir: [1, 0, 0], name: "hingeBarrel" });
    // little spike stars on the lid shoulders
    cone(lid, 0.03, 0.07, 4, GOLD_L, [s * 0.465, 0.23, 0.1], { dir: [s * 0.3, 1, 0], name: "lidSpike" });
    cone(lid, 0.03, 0.07, 4, GOLD_L, [s * 0.465, 0.23, 0.42], { dir: [s * 0.3, 1, 0], name: "lidSpike" });
  }
  // top star plate with sapphire
  const star: number[][] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const rr = k % 2 === 0 ? 0.14 : 0.07;
    star.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  ext(lid, star, GOLD, [0, 0.222, 0.26], [1, 0, 0], [0, 0, 1], 0.016, 0.004);
  ball(lid, 0.05, GOLD_D, [0, 0.228, 0.26], { scale: [1, 0.4, 1], name: "lidBoss" });
  gem(lid, [0, 0.228, 0.26], SAPH, 0.04, 0.055, [0, 1, 0]);
  const lidRivets: THREE.Vector3[] = [];
  for (const s of [1, -1]) for (const z of [0.15, 0.26, 0.37]) lidRivets.push(lid.P([s * 0.25, 0.228, z]));
  merged(spheresAt(lidRivets, 0.009), "#ffe27a", "lid");

  // ---------------------------------------------------------------------------------------------------------
  // Crown
  const cr = new Rig(
    new THREE.Vector3(0.14, 0.55, -0.04),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0.35, 0.08)),
    "root",
  );
  lathe(
    cr,
    [
      [0.15, -0.035],
      [0.172, -0.035],
      [0.182, -0.01],
      [0.18, 0.02],
      [0.15, 0.025],
    ],
    ERMINE,
    [0, 0, 0],
    16,
  );
  lathe(
    cr,
    [
      [0.14, 0.025],
      [0.165, 0.025],
      [0.17, 0.04],
      [0.17, 0.08],
      [0.16, 0.09],
      [0.14, 0.09],
    ],
    GOLD,
    [0, 0, 0],
    16,
  );
  put(cr, new THREE.SphereGeometry(0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), VEL, [0, 0.08, 0], {
    scale: [1, 0.9, 1],
    name: "crownDome",
  });
  for (const a of [0, 90]) {
    const s = Math.sin(a * DEG);
    const c = Math.cos(a * DEG);
    const prof: number[][] = [
      [-1, 0.09],
      [-0.93, 0.15],
      [-0.7, 0.205],
      [-0.35, 0.24],
      [0, 0.252],
      [0.35, 0.24],
      [0.7, 0.205],
      [0.93, 0.15],
      [1, 0.09],
    ];
    b.sweep(
      catmull(prof.map(([u, y]) => cr.P([u * 0.16 * s, y, u * 0.16 * c]))),
      0.011,
      { color: GOLD, bone: cr.bone, sides: 6 },
    );
  }
  ball(cr, 0.027, GOLD_L, [0, 0.276, 0], { name: "crownOrb" });
  box(cr, 0.014, 0.065, 0.014, GOLD_L, [0, 0.33, 0], { name: "crownCrossV" });
  box(cr, 0.05, 0.014, 0.014, GOLD_L, [0, 0.34, 0], { name: "crownCrossH" });
  gem(cr, [0, 0.318, 0.006], RUBY, 0.008, 0.01, [0, 0, 1], undefined, 0.5);
  for (let k = 0; k < 4; k++) {
    const a = k * 90 * DEG;
    ball(cr, 0.017, GOLD_L, [Math.sin(a) * 0.16, 0.095, Math.cos(a) * 0.16], { name: "archFoot" });
  }
  for (let k = 0; k < 8; k++) {
    const a = (22.5 + k * 45) * DEG;
    const n: V = [Math.sin(a), 0, Math.cos(a)];
    const t: V = [Math.cos(a), 0, -Math.sin(a)];
    const base: V = [n[0] * 0.163, 0.09, n[2] * 0.163];
    cone(cr, 0.019, 0.08, 6, GOLD_L, [base[0], base[1] + 0.04, base[2]], { name: "fleurTip" });
    for (const s of [1, -1])
      cone(cr, 0.011, 0.045, 5, GOLD, [base[0] + t[0] * s * 0.016, base[1] + 0.02, base[2] + t[2] * s * 0.016], {
        dir: [t[0] * s * 0.7 + n[0] * 0.2, 1, t[2] * s * 0.7 + n[2] * 0.2],
        name: "fleurPetal",
      });
    ball(cr, 0.011, PEARL, [base[0], base[1] + 0.088, base[2]], { name: "fleurPearl" });
  }
  const jewelCols = [SAPH, EMER, PEARL];
  for (let k = 0; k < 12; k++) {
    const a = k * 30 * DEG;
    const n: V = [Math.sin(a), 0, Math.cos(a)];
    const at: V = [n[0] * 0.171, 0.058, n[2] * 0.171];
    if (k === 0) {
      cyl(cr, 0.034, 0.038, 0.014, 8, GOLD_D, at, { dir: n, scale: [1, 1, 1.35], name: "bezelBig" });
      gem(cr, [n[0] * 0.176, 0.058, n[2] * 0.176], RUBY, 0.033, 0.045, n, [1, 1, 1.35], 0.55);
    } else {
      const col = jewelCols[(k - 1) % 3];
      if (col === PEARL) ball(cr, 0.014, PEARL, at, { name: "bandPearl" });
      else {
        cyl(cr, 0.017, 0.02, 0.01, 6, GOLD_D, at, { dir: n, name: "bezel" });
        gem(cr, [n[0] * 0.173, 0.058, n[2] * 0.173], col, 0.016, 0.022, n);
      }
    }
  }

  // ---------------------------------------------------------------------------------------------------------
  // Goblets
  const goblet = (r: Rig) => {
    const cup = lathe(
      r,
      [
        [0, 0],
        [0.055, 0],
        [0.06, 0.008],
        [0.045, 0.02],
        [0.014, 0.045],
        [0.012, 0.08],
        [0.027, 0.095],
        [0.027, 0.108],
        [0.012, 0.122],
        [0.012, 0.135],
        [0.05, 0.16],
        [0.062, 0.2],
        [0.066, 0.25],
        [0.058, 0.25],
        [0.054, 0.2],
        [0.03, 0.175],
        [0, 0.168],
      ],
      GOLD,
      [0, 0, 0],
      12,
    );
    put(r, new THREE.TorusGeometry(0.0625, 0.0045, 5, 12), GOLD_L, [0, 0.25, 0], { rot: [90, 0, 0], name: "gobletRim" });
    put(r, new THREE.TorusGeometry(0.057, 0.004, 5, 12), GOLD_D, [0, 0.185, 0], { rot: [90, 0, 0], name: "gobletBand" });
    put(r, new THREE.TorusGeometry(0.048, 0.004, 5, 12), GOLD_D, [0, 0.005, 0], { rot: [90, 0, 0], name: "gobletFoot" });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const n: V = [Math.sin(a), 0, Math.cos(a)];
      gem(r, [n[0] * 0.061, 0.222, n[2] * 0.061], k % 2 ? RUBY : EMER, 0.011, 0.014, n);
    }
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      const n: V = [Math.sin(a), 0, Math.cos(a)];
      gem(r, [n[0] * 0.027, 0.102, n[2] * 0.027], RUBY, 0.007, 0.009, n);
    }
    return cup;
  };
  const gs = new Rig(new THREE.Vector3(-0.28, 0.53, 0.0), new THREE.Quaternion(), "root");
  const cupA = goblet(gs);
  b.decal(cupA, fleurTex, {
    at: gs.P([0, 0.2, 0.06]),
    dir: [0, 0, 1],
    size: [0.05, 0.067],
    segments: 6,
    bone: "root",
  });
  const gf = new Rig(new THREE.Vector3(0.6, 0.515, 0.14), aim([-1, 0.2, 0.15]), "root");
  goblet(gf);

  // ---------------------------------------------------------------------------------------------------------
  // Strands: pearls and a bead chain with a pendant
  const pearlPath = catmull([
    [-0.16, 0.5, 0.1],
    [-0.14, 0.49, 0.22],
    [-0.13, 0.475, 0.29],
    [-0.12, 0.4, 0.305],
    [-0.12, 0.3, 0.29],
    [-0.11, 0.19, 0.285],
  ]);
  const pearls: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i++) pearls.push(pearlPath.at(i / 20));
  merged(spheresAt(pearls, 0.016, 7), PEARL);
  b.sweep(pearlPath, 0.003, { color: "#8a6a3a", sides: 4, bone: "root" });

  const chainPath = catmull([
    [0.3, 0.5, 0.0],
    [0.25, 0.49, 0.2],
    [0.22, 0.47, 0.29],
    [0.21, 0.4, 0.31],
    [0.2, 0.31, 0.31],
  ]);
  const beads: THREE.Vector3[] = [];
  for (let i = 0; i <= 28; i++) beads.push(chainPath.at(i / 28));
  merged(spheresAt(beads, 0.0095), "#ffd24a");
  const pend = new Rig(new THREE.Vector3(0.2, 0.275, 0.315), new THREE.Quaternion(), "root");
  ext(
    pend,
    [
      [0, -0.055],
      [0.032, -0.02],
      [0.034, 0.01],
      [0, 0.04],
      [-0.034, 0.01],
      [-0.032, -0.02],
    ],
    GOLD,
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    0.012,
    0.003,
  );
  put(pend, new THREE.TorusGeometry(0.012, 0.0045, 5, 8), GOLD_L, [0, 0.048, 0], { name: "pendantBail" });
  gem(pend, [0, -0.005, 0.004], SAPH, 0.022, 0.03, [0, 0, 1], [0.8, 1, 1.5], 0.5);

  // ---------------------------------------------------------------------------------------------------------
  // Coins
  const coinGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 10, 1);
  const listA: THREE.BufferGeometry[] = [];
  const listB: THREE.BufferGeometry[] = [];
  let count = 0;
  const coin = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
      new THREE.Vector3(1, 1, 1),
    );
    (count++ % 2 ? listA : listB).push(coinGeo.clone().applyMatrix4(m));
  };
  const R = rng(7);
  // heap on the floor
  for (let i = 0; i < 260; i++) {
    const a = R() * Math.PI * 2;
    const rr = Math.sqrt(R());
    const x = 0.9 * rr * Math.cos(a);
    const z = 0.1 + 0.65 * rr * Math.sin(a);
    if (Math.abs(x) < 0.52 && z < 0.3 && z > -0.32) continue;
    coin(x, mound(x, z) + 0.008 + R() * 0.012, z, (R() - 0.5) * 0.8, R() * 6.28, (R() - 0.5) * 0.8);
  }
  // scattered on the floor
  let placed = 0;
  for (let i = 0; i < 500 && placed < 110; i++) {
    const a = R() * Math.PI * 2;
    const rr = Math.sqrt(R());
    const x = 1.25 * rr * Math.cos(a);
    const z = 0.1 + 0.9 * rr * Math.sin(a);
    const u = (x / 0.9) ** 2 + ((z - 0.1) / 0.65) ** 2;
    if (u < 0.95) continue;
    if (Math.abs(x) < 0.55 && z < 0.32 && z > -0.32) continue;
    coin(x, 0.006 + (placed % 3) * 0.004, z, (R() - 0.5) * 0.2, R() * 6.28, (R() - 0.5) * 0.2);
    placed++;
  }
  // heap inside the chest
  for (let i = 0; i < 120; i++) {
    const a = R() * Math.PI * 2;
    const rr = Math.sqrt(R());
    const x = 0.37 * rr * Math.cos(a);
    const z = 0.19 * rr * Math.sin(a);
    if (Math.hypot(x - 0.14, z + 0.04) < 0.18) continue;
    if (Math.hypot(x + 0.28, z) < 0.08) continue;
    if (x > 0.26 && z > 0.0) continue;
    coin(x, heap(x, z) + 0.006 + R() * 0.01, z, (R() - 0.5) * 1.0, R() * 6.28, (R() - 0.5) * 1.0);
  }
  // coins spilling from the fallen goblet
  for (const [x, y, z, rx, rz] of [
    [0.34, 0.5, 0.2, 0.5, 0.3],
    [0.3, 0.49, 0.12, -0.4, 0.6],
    [0.38, 0.5, 0.06, 0.2, -0.5],
    [0.28, 0.5, 0.16, 0.9, 0.2],
  ])
    coin(x, y, z, rx, R() * 6.28, rz);
  // stacks
  const stacks: Array<[number, number, number]> = [
    [-0.62, 0.36, 9],
    [-0.76, 0.2, 6],
    [0.68, 0.4, 10],
    [0.82, 0.22, 7],
    [-0.3, 0.68, 5],
    [0.45, 0.72, 6],
  ];
  for (const [sx, sz, n] of stacks)
    for (let i = 0; i < n; i++)
      coin(sx + (R() - 0.5) * 0.008, mound(sx, sz) + 0.007 + i * 0.0125, sz + (R() - 0.5) * 0.008, 0, R() * 6.28, 0);
  merged(listA, "#ffffff", "root", coinA);
  merged(listB, "#ffffff", "root", coinB);

  // ---------------------------------------------------------------------------------------------------------
  // Loose gems
  const floorGem = (x: number, z: number, col: string, rad: number, h: number, dir: V, lift = 0) =>
    gem(world, [x, mound(x, z) + lift + 0.005, z], col, rad, h, dir);
  floorGem(0.2, 0.62, RUBY, 0.08, 0.11, [0.3, 0.9, 0.5], 0.0);
  floorGem(-0.32, 0.56, EMER, 0.05, 0.07, [-0.4, 0.8, 0.5]);
  floorGem(-0.6, 0.5, AMET, 0.052, 0.07, [-0.3, 0.9, 0.5]);
  floorGem(0.02, 0.6, EMER, 0.036, 0.05, [0.2, 0.9, 0.6]);
  floorGem(0.78, 0.36, AMET, 0.045, 0.06, [0.4, 0.9, 0.3]);
  floorGem(0.6, 0.66, EMER, 0.05, 0.07, [0.2, 0.8, 0.6]);
  floorGem(-0.84, 0.4, SAPH, 0.04, 0.055, [-0.5, 0.8, 0.3]);
  floorGem(0.46, 0.48, SAPH, 0.04, 0.055, [0.3, 0.9, 0.4]);
  const heapGem = (x: number, z: number, col: string, rad: number, h: number, dir: V) =>
    gem(world, [x, heap(x, z) - 0.005, z], col, rad, h, dir);
  heapGem(-0.02, 0.16, SAPH, 0.06, 0.085, [0.1, 0.8, 0.6]);
  heapGem(0.24, 0.16, RUBY, 0.045, 0.065, [0.3, 0.8, 0.5]);
  heapGem(-0.14, -0.1, EMER, 0.04, 0.055, [-0.2, 0.9, 0.3]);
  heapGem(-0.3, 0.13, AMET, 0.04, 0.055, [-0.3, 0.9, 0.4]);
  heapGem(0.3, -0.05, EMER, 0.035, 0.05, [0.3, 0.9, 0.2]);

  // ---------------------------------------------------------------------------------------------------------
  // Sparkle stars (glowing cut-outs facing the front)
  const sparkle = (x: number, y: number, z: number, size: number) =>
    glow(
      put(world, new THREE.PlaneGeometry(size, size), "#ffffff", [x, y, z], {
        dir: [0, 0, 1],
        axis: "z",
        texture: starTex,
        name: "sparkle",
      }),
      1,
    );
  sparkle(0.26, 0.2, 0.7, 0.1);
  sparkle(0.24, 0.64, 0.2, 0.075);
  sparkle(-0.06, 0.68, 0.26, 0.06);
  sparkle(-0.3, 0.82, 0.08, 0.07);
  sparkle(-0.34, 0.12, 0.62, 0.06);
  sparkle(0.64, 0.14, 0.7, 0.05);

  return b.root;
}
