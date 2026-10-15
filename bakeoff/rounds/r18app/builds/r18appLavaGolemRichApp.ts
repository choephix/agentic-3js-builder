// Lava golem: basalt plates over a molten core, gold filigree, glowing runes. Genshin-style cel shading (kits/toon)
// with elemental glow (kits/glow). Faces +Z, left is +X, stands on y = 0, about 3.3 m tall with its flame mane.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { JointRef } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { cells, mottle, noise, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { bezier, catmull, polyline } from "../../../../src/path";
import type { Surface } from "../../../../src/surface";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Lava Golem",
  description:
    "A three-metre basalt golem: cel-shaded violet stone plates riding a molten core, glowing seams and cracks, gold filigree trim, a rune-lit chest gem, obsidian horns and a mane of living flame.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const SEAM_HOT = "#ffe45e";
const SEAM = "#ff8a1e";
const SEAM_DEEP = "#e0401a";
const CRUST_A = cel("#4f4266");
const CRUST_B = cel("#463a5c");
const CRUST_C = cel("#5a4c74");
const OBS = cel("#3d2f50", "#1d1430");
const GOLD = cel("#ffd35c", "#c47c26");
const BONE = cel("#f4e6c8", "#c9a58a");
const MASK = cel("#2e2340", "#170f26");

/** Cracked basalt cells divided by glowing lava seams: one paint shared by every body part so the cracks run on. */
function lavaCrust(seed: number, size: number, width: number): Paint {
  return paint((p) => {
    const c = cells(p, size, seed);
    const e = c.d2 - c.d1;
    const w = width * (0.3 + 1.4 * noise(p, 0.55, seed + 5));
    if (e < w * 0.4) return SEAM_HOT;
    if (e < w) return SEAM;
    if (e < w * 1.45) return SEAM_DEEP;
    return c.id < 0.34 ? CRUST_A : c.id < 0.67 ? CRUST_B : CRUST_C;
  });
}

export default function build() {
  const b = createBuilder({ name: "lavaGolem", paintSize: 2048 });
  const R = rng(2025);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const CRUST = lavaCrust(7, 0.3, 0.1);
  let plateSeed = 0;

  // -------------------------------------------------------------------------------------------------------------
  // Textures
  const ticks = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `<path d="M${50 + Math.sin(a) * 37} ${50 - Math.cos(a) * 37} L${50 + Math.sin(a) * 42} ${50 - Math.cos(a) * 42}" stroke="#ffd23a" stroke-width="3" stroke-linecap="round"/>`;
  }).join("");
  const RUNE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#ff8a1e" stroke-width="5"/>
    <circle cx="50" cy="50" r="33" fill="none" stroke="#ffd23a" stroke-width="2.4"/>${ticks}
    <path d="M50 14 L58 42 L86 50 L58 58 L50 86 L42 58 L14 50 L42 42Z" fill="#ff8a1e"/>
    <path d="M50 27 L55 45 L73 50 L55 55 L50 73 L45 55 L27 50 L45 45Z" fill="#ffe45e"/>
    <circle cx="50" cy="50" r="5" fill="#fff6c8"/></svg>`,
    { size: 256 },
  );
  const FLAME = svg(
    `<svg viewBox="0 0 64 128">
    <path d="M32 1 C36 26 62 46 58 88 C56 112 44 127 32 127 C18 127 6 112 6 88 C4 60 24 44 32 1Z" fill="#e8401a"/>
    <path d="M32 24 C36 44 54 58 50 90 C48 108 40 122 32 122 C22 122 14 108 14 90 C12 66 28 54 32 24Z" fill="#ff8a1e"/>
    <path d="M32 58 C35 72 44 80 42 98 C41 110 37 120 32 120 C26 120 22 110 22 98 C21 82 30 74 32 58Z" fill="#ffe45e"/>
    </svg>`,
    { size: 128 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 24 64">
    <path d="M12 46 L3 3 L8 1 Z M12 46 L9 1 L15 1 Z M12 46 L16 1 L21 3 Z" fill="#e0401a"/>
    <path d="M12 46 L6 6 L9 5 Z M12 46 L15 5 L18 6 Z" fill="#ff8a1e"/>
    <rect x="5" y="26" width="14" height="4" fill="#ffd35c"/>
    <rect x="8" y="44" width="8" height="8" fill="#ffd35c"/><circle cx="12" cy="56" r="6" fill="#ffd35c"/>
    <circle cx="10" cy="54" r="2" fill="#fff0a0"/></svg>`,
    { size: 128 },
  );
  const EYE = svg(
    `<svg viewBox="0 0 100 60">
    <path d="M3 4 C30 8 72 22 97 46 C70 58 30 52 12 36 C6 28 3 16 3 4Z" fill="#ff7a1c"/>
    <path d="M11 13 C34 17 64 28 86 44 C64 50 34 46 20 34 C14 28 11 21 11 13Z" fill="#ffd23a"/>
    <path d="M25 24 C42 27 58 32 71 41 C56 44 38 41 30 34 C26 31 25 28 25 24Z" fill="#fff6c8"/>
    <ellipse cx="52" cy="37" rx="3.4" ry="8" fill="#8a2a0e"/></svg>`,
    { size: 256 },
  );
  const FILIGREE = svg(
    `<svg viewBox="0 0 120 90" fill="none" stroke="#ffd35c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 14 L14 6 L106 6 L114 14 L114 76 L106 84 L14 84 L6 76Z"/>
    <path d="M60 14 L84 45 L60 76 L36 45Z"/><path d="M60 26 L72 45 L60 64 L48 45Z" stroke="#fff0a0"/>
    <path d="M36 45 C20 45 12 32 22 24 C30 19 38 27 32 33"/><path d="M84 45 C100 45 108 32 98 24 C90 19 82 27 88 33"/>
    <path d="M36 45 C20 45 12 58 22 66 C30 71 38 63 32 57"/><path d="M84 45 C100 45 108 58 98 66 C90 71 82 63 88 57"/>
    <circle cx="60" cy="45" r="4" fill="#ff8a1e" stroke="none"/>
    <circle cx="22" cy="14" r="2" fill="#ffd35c" stroke="none"/><circle cx="98" cy="14" r="2" fill="#ffd35c" stroke="none"/>
    <circle cx="22" cy="76" r="2" fill="#ffd35c" stroke="none"/><circle cx="98" cy="76" r="2" fill="#ffd35c" stroke="none"/></svg>`,
    { size: 256 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 1.32, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.38, 0],
      [0, 1.72, 0.03],
      [0, 2.06, 0.07],
      [0, 2.38, 0.06],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.38, 0.06],
      [0, 2.48, 0.1],
      [0, 2.58, 0.14],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.58, 0.14], aim: [0, 2.8, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.6, 0.12], aim: [0, 2.6, 0.5], role: "jaw" });

  const SIDES = [1, -1] as const;
  const sideName = (s: number) => (s > 0 ? "L" : "R");
  const legs = SIDES.map((s) => {
    const S = sideName(s);
    const pts = limb(V(s * 0.3, 1.3, 0), V(s * 0.38, 0.27, 0.05), [0.56, 0.56], [[0, 0, 1]]);
    const chain = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.38, 0, 0.15],
    });
    return { s, S, pts, chain };
  });
  const arms = SIDES.map((s) => {
    const S = sideName(s);
    const pts = [V(s * 0.86, 2.2, 0), V(s * 1.2, 1.62, 0.06), V(s * 1.56, 1.04, 0.16)];
    const chain = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    return { s, S, pts, chain };
  });

  // -------------------------------------------------------------------------------------------------------------
  // Helpers
  const platePaint = (n: THREE.Vector3): Paint => {
    const seed = ++plateSeed;
    const face = cel(mottle("#8b7aa8", "#7a69a0", { size: 0.2, seed }));
    const rim = cel("#b3a5ce", "#8576a8");
    return paint((_p, nn) => (Math.abs(nn.dot(n)) < 0.55 ? rim : face));
  };
  const chamfer = (w: number, h: number, cut: number, jit: number): Array<[number, number]> => {
    const m = Math.min(w, h);
    const c = cut * m;
    const j = () => (R() - 0.5) * jit * m;
    const hw = w / 2;
    const hh = h / 2;
    return [
      [-hw + c, -hh + j()],
      [hw - c, -hh + j()],
      [hw + j(), -hh + c],
      [hw + j(), hh - c],
      [hw - c, hh + j()],
      [-hw + c, hh + j()],
      [-hw + j(), hh - c],
      [-hw + j(), -hh + c],
    ];
  };
  type PlateOpts = { up?: V3; cut?: number; jit?: number; outline?: Array<[number, number]>; color?: Paint | string };
  /** A basalt plate lying on a surface: normal `n` out, drawn `w` wide and `h` tall, `th` thick. */
  const plate = (at: V3, n: V3, w: number, h: number, th: number, bone: JointRef | undefined, o: PlateOpts = {}) => {
    const nn = vec(n).normalize();
    let u = vec(o.up ?? [0, 1, 0]);
    u.addScaledVector(nn, -u.dot(nn));
    if (u.lengthSq() < 1e-3) {
      u = V(0, 0, -1);
      u.addScaledVector(nn, -u.dot(nn));
    }
    u.normalize();
    const x = u.clone().cross(nn).normalize();
    return b.extrude(o.outline ?? chamfer(w, h, o.cut ?? 0.22, o.jit ?? 0.1), {
      at: vec(at).addScaledVector(nn, th * 0.2),
      x,
      y: u,
      thickness: th,
      bevel: Math.min(th * 0.35, 0.022),
      color: o.color ?? platePaint(nn),
      bone,
    });
  };
  const collar = (
    at: V3,
    dir: V3,
    rIn: number,
    rOut: number,
    h: number,
    bone: JointRef | undefined,
    color: Paint | string = GOLD,
    segments = 8,
  ) =>
    b.lathe(
      [
        [rIn, -h / 2],
        [rOut - h * 0.25, -h / 2],
        [rOut, -h * 0.25],
        [rOut, h * 0.25],
        [rOut - h * 0.25, h / 2],
        [rIn, h / 2],
      ],
      { at, axis: dir, segments, color, bone },
    );
  const spike = (base: V3, dir: V3, len: number, r: number, bone: JointRef | undefined, color: Paint | string = OBS) =>
    b.spike(base, dir, len, r, { color, section: { ngon: 6 }, bone });
  const magmaBall = (at: V3, r: number, bone: JointRef) =>
    glow(b.part(new THREE.IcosahedronGeometry(r, 1), SEAM, { at, bone, flat: true }));
  /** A glowing seam draped on a built surface: orange ridge with a hot yellow core. */
  const crack = (surf: Surface, pts: THREE.Vector3[], w: number) => {
    const path = polyline(pts);
    glow(b.sweep(surf.drape(path, { lift: 0.004 }), w, { color: SEAM, sides: 4, caps: "flat" }));
    glow(b.sweep(surf.drape(path, { lift: 0.011 }), w * 0.45, { color: SEAM_HOT, sides: 4, caps: "flat" }));
  };
  /** Points winding round a vertical-ish limb or body: height 0..1 along `center`, azimuth from `az0` to `az1`. */
  const wrap = (center: (t: number) => THREE.Vector3, t0: number, t1: number, az0: number, az1: number, r: number) => {
    const n = Math.max(4, Math.round(Math.abs(t1 - t0) * 22));
    return Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n;
      const jit = i > 0 && i < n ? (R() - 0.5) * 0.4 : 0;
      const az = ((az0 + (az1 - az0) * t) * Math.PI) / 180 + jit;
      const tt = t0 + (t1 - t0) * t + (i > 0 && i < n ? (R() - 0.5) * 0.03 : 0);
      return center(tt).add(V(Math.sin(az) * r, 0, Math.cos(az) * r));
    });
  };

  // cracks laid across the torso (center line runs up the spine)
  const torsoCenter = (t: number) => V(0, 1.45 + t * 0.9, 0.05);
  // -------------------------------------------------------------------------------------------------------------
  // Torso: a cracked magma-crust loft, then plates over it
  const torso = b.loft(
    [
      { at: [0, 1.36, 0], w: 0.8, h: 0.56 },
      { at: [0, 1.62, 0.01], w: 0.62, h: 0.46 },
      { at: [0, 1.92, 0.05], w: 1.02, h: 0.64 },
      { at: [0, 2.2, 0.07], w: 1.3, h: 0.74 },
      { at: [0, 2.42, 0.05], w: 0.92, h: 0.56 },
    ],
    { bone: [hips, spine], color: CRUST },
  );
  const tor = b.surface(torso);
  const front = (x: number, y: number) => tor.ray([x, y, 3], [0, 0, -1]);
  const back = (x: number, y: number) => tor.ray([x, y, -3], [0, 0, 1]);
  const side = (s: number, y: number, z: number) => tor.ray([s * 3, y, z], [-s, 0, 0]);
  const must = <T,>(h: T | null): T => {
    if (!h) throw new Error("surface miss");
    return h;
  };

  const chestHits = SIDES.map((s) => must(front(s * 0.3, 2.18)));
  const decorated: ReturnType<typeof plate>[] = [];
  for (const [i, s] of SIDES.entries()) {
    const hit = chestHits[i];
    // pecs
    const pec = plate(hit.at, [s * 0.3, 0.18, 1], 0.5, 0.42, 0.1, hit.bone ?? undefined, { cut: 0.28 });
    decorated.push(pec);
    // abs, two columns of three
    for (const [j, y] of [1.95, 1.79, 1.63].entries()) {
      const h = must(front(s * 0.15, y));
      plate(h.at, [s * 0.1, 0, 1], 0.2 - j * 0.015, 0.125, 0.06, h.bone ?? undefined, { cut: 0.3, jit: 0.06 });
    }
    // side lats
    const sd = must(side(s, 2.0, 0.08));
    plate(sd.at, [s, 0.05, 0.15], 0.42, 0.5, 0.08, sd.bone ?? undefined, { up: [0, 1, 0] });
    const sd2 = must(side(s, 1.66, 0.05));
    plate(sd2.at, [s, 0, 0.1], 0.3, 0.2, 0.06, sd2.bone ?? undefined);
    // scapulae and lower back
    const bk = must(back(s * 0.3, 2.12));
    plate(bk.at, [s * 0.25, 0.15, -1], 0.5, 0.46, 0.09, bk.bone ?? undefined, { cut: 0.28 });
    const bk2 = must(back(s * 0.2, 1.7));
    plate(bk2.at, [s * 0.1, 0, -1], 0.32, 0.3, 0.07, bk2.bone ?? undefined);
    // trapezius lump
    const tp = must(tor.ray([s * 0.28, 4, 0.06], [0, -1, 0]));
    plate(tp.at, [s * 0.5, 1, 0], 0.3, 0.4, 0.08, tp.bone ?? undefined, { up: [0, 0, 1] });
  }
  crack(tor, wrap(torsoCenter, 0.05, 0.32, 28, 60, 0.6), 0.011);
  crack(tor, wrap(torsoCenter, 0.05, 0.3, -30, -75, 0.6), 0.011);
  crack(tor, wrap(torsoCenter, 0.35, 0.8, 120, 95, 0.6), 0.01);
  crack(tor, wrap(torsoCenter, 0.3, 0.8, 220, 255, 0.6), 0.011);
  crack(tor, wrap(torsoCenter, 0.05, 0.3, 160, 200, 0.5), 0.011);
  // central molten strip down the abdomen
  const strip = must(front(0, 1.78));
  glow(
    b.part(new THREE.BoxGeometry(0.075, 0.56, 0.03), SEAM, {
      at: strip.at.clone().add(V(0, 0.02, 0.0)),
      bone: spine.joints[1],
    }),
  );
  glow(
    b.part(new THREE.BoxGeometry(0.03, 0.54, 0.034), SEAM_HOT, {
      at: strip.at.clone().add(V(0, 0.02, 0.003)),
      bone: spine.joints[1],
    }),
  );
  // sternum core: gem in a gold cage
  const sternum = must(front(0, 2.04));
  const gemAt = sternum.at.clone().add(V(0, 0, 0.05));
  collar(gemAt.clone().add(V(0, 0, -0.01)), [0, 0, 1], 0.12, 0.2, 0.06, chest, GOLD, 6);
  glow(
    b.part(new THREE.IcosahedronGeometry(0.115, 0), SEAM_HOT, {
      at: gemAt.clone().add(V(0, 0, 0.04)),
      bone: chest,
      scale: [1, 1.2, 0.8],
      flat: true,
    }),
    1.3,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.06, 0), "#fff6c8", {
      at: gemAt.clone().add(V(0, 0, 0.1)),
      bone: chest,
      scale: [1, 1.3, 0.7],
      flat: true,
    }),
    1.5,
  );
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const dirv = V(Math.sin(a), Math.cos(a), 0.15);
    spike(gemAt.clone().add(V(Math.sin(a) * 0.19, Math.cos(a) * 0.19, 0.0)), dirv, k % 2 ? 0.1 : 0.16, 0.026, chest, GOLD);
  }
  // runes: a ring of fire on the back
  const rune = must(back(0, 1.98));
  const runeRing = collar(rune.at.clone().add(V(0, 0, -0.01)), [0, 0, -1], 0.27, 0.33, 0.05, chest, GOLD, 12);
  runeRing.mesh.name = "runeRing";
  glow(
    b.decal(tor, RUNE, { at: rune.at, dir: [0, 0, -1], size: [0.52, 0.52], mirror: true, lift: 0.006 }),
  );

  // belt, buckle, loincloth tabards
  const belt = tor.loop([0, 1.5, 0.04], { lift: 0.022 });
  b.sweep(belt, 0.045, { color: GOLD, section: { ngon: 6 } });
  const belt2 = tor.loop([0, 1.44, 0.04], { lift: 0.012 });
  b.sweep(belt2, 0.028, { color: OBS, section: { ngon: 6 } });
  const buckleHit = must(front(0, 1.5));
  collar(buckleHit.at.clone().add(V(0, 0, 0.03)), [0, 0, 1], 0.0, 0.14, 0.05, hips, GOLD, 6);
  glow(b.part(new THREE.IcosahedronGeometry(0.06, 0), SEAM, { at: buckleHit.at.clone().add(V(0, 0, 0.07)), bone: hips, flat: true }));
  const tabard = (cx: number, y: number, z: number, nz: number, w: number, h: number, bone: JointRef) => {
    const outline: Array<[number, number]> = [
      [-w / 2, h / 2],
      [w / 2, h / 2],
      [w / 2 - 0.01, 0],
      [0, -h / 2],
      [-w / 2 + 0.01, 0],
    ];
    return plate([cx, y, z], [cx * 0.6, -0.12 * nz, nz], w, h, 0.06, bone, { outline });
  };
  tabard(0, 1.14, 0.27, 1, 0.3, 0.46, hips);
  tabard(0.0, 1.1, -0.27, -1, 0.34, 0.5, hips);
  for (const s of SIDES) {
    const p = tabard(s * 0.2, 1.17, 0.23, 1, 0.2, 0.34, hips);
    p.mesh.name = `tabard${sideName(s)}`;
    tabard(s * 0.24, 1.16, -0.22, -1, 0.2, 0.34, hips);
    plate([s * 0.48, 1.32, 0.0], [s, 0, 0], 0.34, 0.3, 0.07, hips, { up: [0, 1, 0] });
  }
  b.cards(
    [-0.3, -0.15, 0.15, 0.3].map((x) => frame([x, 1.46, 0.3], [0, 1, 0])),
    TASSEL,
    { size: [0.07, 0.24], lean: 180, flow: [0, 0, 1], vary: 0.15, rng: R },
  );
  decorated.push(plate([0, 1.14, 0.3], [0, -0.1, 1], 0.22, 0.28, 0.02, hips, { cut: 0.3 }));

  // spine ridge: obsidian spikes with molten bases
  for (const [i, y] of [1.62, 1.8, 1.98, 2.16, 2.34].entries()) {
    const h = must(back(0, y));
    const len = 0.17 + i * 0.03;
    const sk = b.spike(h.at.clone().add(V(0, 0, 0.02)), [0, 0.45, -1], len, 0.075 + i * 0.006, {
      color: OBS,
      section: { ngon: 6 },
      bone: h.bone ?? undefined,
    });
    sk.meshes[0].name = `ridge${i}`;
    glow(b.part(new THREE.CylinderGeometry(0.06 + i * 0.006, 0.07 + i * 0.006, 0.035, 6), SEAM, { at: h.at.clone().add(V(0, 0, -0.005)), dir: [0, 0.45, -1], bone: h.bone ?? undefined }));
  }

  // neck, collar, pendant
  const neckTube = b.sweep(neck, [0.2, 0.2, 0.19], { section: { ngon: 6 }, color: CRUST });
  collar([0, 2.5, 0.11], [0, 1, 0.3], 0.19, 0.3, 0.07, neck.joints[1], GOLD, 8);
  collar([0, 2.42, 0.08], [0, 1, 0.3], 0.24, 0.34, 0.05, neck.joints[0], OBS, 8);
  magmaBall([0, 2.42, 0.08], 0.2, neck.joints[0]);
  void neckTube;

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const hz = 0.18;
  const cranium = b.frustumBox([0, 2.56, hz - 0.02], [0, 2.96, hz], [0.46, 0.46], [0.58, 0.5], { bone: head, color: CRUST });
  const skull = b.surface(cranium);
  void skull;
  // mask, brow, cheeks
  const mask = plate([0, 2.74, 0.425], [0, 0.02, 1], 0.44, 0.34, 0.05, head, { color: MASK, cut: 0.2, jit: 0.04 });
  const brow = plate([0, 2.88, 0.45], [0, 0.55, 1], 0.58, 0.11, 0.1, head, { cut: 0.25 });
  void brow;
  for (const s of SIDES) {
    plate([s * 0.29, 2.72, 0.17], [s, 0, 0.15], 0.36, 0.32, 0.07, head, { cut: 0.28 });
    plate([s * 0.22, 2.64, 0.38], [s * 0.5, -0.1, 1], 0.16, 0.2, 0.05, head, { cut: 0.3 });
    // glowing eyes
    glow(
      b.decal(mask, EYE, {
        at: [s * 0.115, 2.775, 0.47],
        dir: [0, 0, 1],
        size: [0.17, 0.1],
        mirror: s > 0,
        lift: 0.004,
      }),
    );
    // horns
    const hornPath = bezier(V(s * 0.2, 2.86, 0.08), V(s * 0.52, 2.95, 0.0), V(s * 0.6, 3.3, -0.14), V(s * 0.46, 3.36, -0.28));
    b.sweep(hornPath, [0.085, 0.012], { section: { ngon: 6 }, color: OBS, caps: { start: "flat", end: "point" }, bone: head });
    const hb = hornPath.at(0.18);
    collar(hb, hornPath.tangentAt(0.18), 0.075, 0.115, 0.04, head, GOLD, 8);
    const hm = hornPath.at(0.55);
    collar(hm, hornPath.tangentAt(0.55), 0.04, 0.07, 0.035, head, GOLD, 8);
    glow(b.part(new THREE.IcosahedronGeometry(0.03, 0), SEAM_HOT, { at: hornPath.at(0.96), bone: head, flat: true }));
    // gold tassels off the horns
    b.cards([frame(hornPath.at(0.5).add(V(0, -0.04, 0)), [0, 1, 0])], TASSEL, { size: [0.05, 0.16], lean: 180, flow: [0, 0, 1], bone: head });
  }
  // gold brow band and gem
  b.sweep(
    catmull([V(-0.3, 2.94, 0.3), V(-0.15, 2.97, 0.5), V(0, 2.98, 0.54), V(0.15, 2.97, 0.5), V(0.3, 2.94, 0.3)]),
    0.02,
    { color: GOLD, section: { ngon: 6 }, bone: head },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.045, 0), SEAM, { at: [0, 2.96, 0.555], bone: head, scale: [1, 1.4, 0.7], flat: true }));
  // upper teeth
  for (const x of [-0.17, -0.1, -0.035, 0.035, 0.1, 0.17]) {
    b.spike([x, 2.62, 0.43], [0, -1, 0.1], 0.065, 0.02, { color: BONE, section: { ngon: 6 }, bone: head });
  }
  // lower jaw
  b.frustumBox([0, 2.6, 0.2], [0, 2.585, 0.5], [0.4, 0.1], [0.36, 0.09], { bone: jaw, color: CRUST });
  plate([0, 2.58, 0.5], [0, -0.05, 1], 0.34, 0.1, 0.05, jaw, { cut: 0.25 });
  glow(b.part(new THREE.BoxGeometry(0.3, 0.025, 0.28), SEAM, { at: [0, 2.635, 0.3], bone: jaw }));
  for (const x of [-0.14, -0.07, 0, 0.07, 0.14]) {
    b.spike([x, 2.64, 0.44], [0, 1, 0.1], 0.05, 0.016, { color: BONE, section: { ngon: 6 }, bone: jaw });
  }
  for (const s of SIDES) {
    b.spike([s * 0.17, 2.62, 0.48], [s * 0.15, 1, 0.25], 0.18, 0.04, { color: OBS, section: { ngon: 6 }, bone: jaw });
    b.cards([frame([s * 0.17, 2.56, 0.5], [0, 1, 0])], TASSEL, { size: [0.045, 0.13], lean: 180, flow: [0, 0, 1], bone: jaw });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // flame mane: from the back of the skull and between the shoulders
  const maneFrames = [
    ...Array.from({ length: 9 }, (_, i) => {
      const a = ((i - 4) / 4) * 0.9;
      return frame([Math.sin(a) * 0.3, 2.92 + Math.cos(a) * 0.02, -0.1 - Math.cos(a) * 0.12], [Math.sin(a) * 0.4, 1, -0.55]);
    }),
    ...Array.from({ length: 7 }, (_, i) => frame([(i - 3) * 0.12, 2.5 + (i % 2) * 0.05, -0.27], [(i - 3) * 0.12, 1, -0.7])),
  ];
  glow(b.cards(maneFrames, FLAME, { size: [0.17, 0.42], lean: 12, bend: 25, cross: true, vary: 0.35, spin: 25, rng: R, flow: [0, -0.2, -1] }));

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  for (const { s, S, pts, chain } of legs) {
    const hip = chain.joints[0];
    const knee = chain.joints[1];
    const ankle = chain.joints[2];
    const leg = b.sweep(chain, [0.29, 0.27, 0.25, 0.22, 0.2], { section: { ngon: 6 }, color: CRUST });
    const surf = b.surface(leg);
    const mid1 = pts[0].clone().lerp(pts[1], 0.5);
    const mid2 = pts[1].clone().lerp(pts[2], 0.5);
    // thigh plates
    for (const az of [0, 60, -60]) {
      const h = surf.around(mid1).at(az, 0);
      if (h) plate(h.at, h.n, 0.24, 0.36, 0.07, hip, { cut: 0.26 });
    }
    const outer = surf.around(mid1).at(s * 90, 0);
    if (outer) plate(outer.at, outer.n, 0.3, 0.36, 0.07, hip);
    const rear = surf.around(mid1).at(180, 0);
    if (rear) plate(rear.at, rear.n, 0.32, 0.34, 0.07, hip);
    // shin guard and calf
    for (const az of [-35, 35]) {
      const h = surf.around(mid2).at(az, 0);
      if (h) plate(h.at, h.n, 0.2, 0.4, 0.07, knee, { cut: 0.28 });
    }
    const calf = surf.around(mid2).at(180, 0);
    if (calf) plate(calf.at, calf.n, 0.3, 0.36, 0.07, knee);
    const shinOuter = surf.around(mid2).at(s * 90, 0);
    if (shinOuter) plate(shinOuter.at, shinOuter.n, 0.24, 0.32, 0.06, knee);
    // cracks
    const legCenter = (t: number) => (t < 0.5 ? pts[0].clone().lerp(pts[1], t * 2) : pts[1].clone().lerp(pts[2], (t - 0.5) * 2));
    crack(surf, wrap(legCenter, 0.04, 0.46, 20, -25, 0.3), 0.011);
    crack(surf, wrap(legCenter, 0.52, 0.95, 140, 190, 0.28), 0.011);
    crack(surf, wrap(legCenter, 0.1, 0.4, s * 90 + 10, s * 90 - 40, 0.3), 0.009);
    // kneecap, joints, rings
    const kneeFront = pts[1].clone().add(V(0, 0.02, 0.26));
    b.lathe(
      [
        [0, 0],
        [0.17, 0],
        [0.16, 0.05],
        [0.11, 0.1],
        [0, 0.12],
      ],
      { at: kneeFront.clone().add(V(0, 0, -0.08)), axis: [0, -0.15, 1], segments: 6, color: OBS, bone: knee },
    );
    collar(kneeFront.clone().add(V(0, 0, -0.07)), [0, -0.15, 1], 0.16, 0.2, 0.035, knee, GOLD, 6);
    glow(b.part(new THREE.IcosahedronGeometry(0.045, 0), SEAM, { at: kneeFront.clone().add(V(0, 0, 0.045)), bone: knee, flat: true }));
    magmaBall(pts[1], 0.25, knee);
    magmaBall(pts[0].clone().add(V(0, 0.02, 0)), 0.27, hip);
    collar(pts[2].clone().add(V(0, 0.15, 0)), [0, 1, 0], 0.2, 0.26, 0.07, ankle, GOLD, 8);
    collar(pts[0].clone().lerp(pts[1], 0.78), pts[1].clone().sub(pts[0]), 0.26, 0.31, 0.05, hip, GOLD, 8);
    // foot
    const fx = s * 0.38;
    b.frustumBox([fx, 0.1, -0.14], [fx, 0.1, 0.36], [0.46, 0.2], [0.42, 0.2], { bone: ankle, color: CRUST });
    plate([fx, 0.2, 0.1], [0, 1, 0.1], 0.4, 0.46, 0.06, ankle, { cut: 0.28, up: [0, 0, 1] });
    plate([fx + s * 0.2, 0.12, 0.08], [s, 0, 0], 0.4, 0.14, 0.05, ankle);
    plate([fx, 0.12, 0.38], [0, 0, 1], 0.4, 0.14, 0.05, ankle);
    for (const [i, off] of [-0.135, 0, 0.135].entries()) {
      const a = V(fx + off, 0.1, 0.34);
      const e = V(fx + off * 1.2, 0.09, 0.58);
      const toe = b.joint(`toe${i + 1}${S}`, { parent: ankle, at: a, aim: e, role: "digit" });
      b.rod(a, e, 0.07, { section: { ngon: 6 }, color: CRUST, bone: toe, caps: { start: "flat", end: "flat" } });
      spike(e, [0, -0.12, 1], 0.12, 0.062, toe, OBS);
      glow(b.part(new THREE.IcosahedronGeometry(0.022, 0), SEAM, { at: e.clone().add(V(0, 0.055, -0.005)), bone: toe, flat: true }));
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms
  for (const { s, S, pts, chain } of arms) {
    const shoulder = chain.joints[0];
    const elbow = chain.joints[1];
    const wrist = chain.joints[2];
    const arm = b.sweep(chain, [0.25, 0.24, 0.22, 0.26, 0.3, 0.26], { section: { ngon: 6 }, color: CRUST });
    const surf = b.surface(arm);
    const up1 = pts[0].clone().lerp(pts[1], 0.55);
    const up2 = pts[1].clone().lerp(pts[2], 0.55);
    const armCenter = (t: number) => (t < 0.5 ? pts[0].clone().lerp(pts[1], t * 2) : pts[1].clone().lerp(pts[2], (t - 0.5) * 2));
    for (const az of [-20, 70, 150]) {
      const h = surf.around(up1).at(s * 90 + az * -s, 0);
      if (h) plate(h.at, h.n, 0.22, 0.36, 0.07, shoulder);
    }
    for (const az of [0, 50, -50, 180]) {
      const h = surf.around(up2).at(az, 0);
      if (h) plate(h.at, h.n, 0.26, 0.4, 0.08, elbow, { cut: 0.26 });
    }
    const fo = surf.around(up2).at(s * 90, 0);
    if (fo) decorated.push(plate(fo.at, fo.n, 0.34, 0.44, 0.09, elbow, { cut: 0.26 }));
    crack(surf, wrap(armCenter, 0.04, 0.45, 40, -10, 0.28), 0.011);
    crack(surf, wrap(armCenter, 0.52, 0.94, 100, 160, 0.3), 0.011);
    crack(surf, wrap(armCenter, 0.08, 0.4, 200, 150, 0.26), 0.009);
    magmaBall(pts[1], 0.27, elbow);
    collar(pts[0].clone().lerp(pts[1], 0.08), pts[1].clone().sub(pts[0]), 0.25, 0.3, 0.05, shoulder, GOLD, 8);
    collar(pts[1].clone().lerp(pts[2], 0.14), pts[2].clone().sub(pts[1]), 0.25, 0.3, 0.06, elbow, GOLD, 8);
    collar(pts[1].clone().lerp(pts[2], 0.9), pts[2].clone().sub(pts[1]), 0.29, 0.34, 0.07, elbow, GOLD, 8);
    glow(b.part(new THREE.OctahedronGeometry(0.05, 0), SEAM, { at: pts[1].clone().lerp(pts[2], 0.9).add(V(s * 0.24, 0.02, 0.04)), bone: wrist, scale: [0.7, 1.3, 0.7], flat: true }));
    magmaBall(pts[2], 0.24, wrist);

    // pauldron: three shingled hex domes, gold rims, spikes
    const da = V(s * 0.5, 1, 0).normalize();
    const exv = da.clone().cross(V(0, 0, 1)).normalize();
    const ezv = exv.clone().cross(da).normalize();
    const base0 = V(s * 0.88, 2.06, 0);
    const tiers: Array<{ off: number; r: number; h: number }> = [
      { off: 0, r: 0.54, h: 0.22 },
      { off: 0.13, r: 0.45, h: 0.22 },
      { off: 0.27, r: 0.34, h: 0.22 },
    ];
    tiers.forEach((t, i) => {
      const c = base0.clone().addScaledVector(da, t.off);
      b.lathe(
        [
          [0, 0],
          [t.r, 0],
          [t.r * 0.97, t.h * 0.3],
          [t.r * 0.78, t.h * 0.75],
          [t.r * 0.45, t.h],
          [0, t.h * 1.02],
        ],
        { at: c, axis: da, segments: 6, spin: i * 12, color: i === 1 ? platePaint(da) : platePaint(da.clone().negate()), bone: shoulder },
      );
      collar(c, da, t.r * 0.9, t.r * 1.03, 0.04, shoulder, GOLD, 6);
      // rim spikes
      const count = 5 + i;
      for (let k = 0; k < count; k++) {
        const a = ((k + i * 0.5) / count) * Math.PI * 2;
        const radial = exv.clone().multiplyScalar(Math.cos(a)).addScaledVector(ezv, Math.sin(a));
        const root = c.clone().addScaledVector(radial, t.r * 0.92).addScaledVector(da, 0.03);
        spike(root, radial.clone().multiplyScalar(0.7).addScaledVector(da, 0.6), 0.14 - i * 0.015, 0.045, shoulder);
      }
    });
    const top = base0.clone().addScaledVector(da, 0.27 + 0.22);
    spike(top, da, 0.36, 0.1, shoulder);
    glow(b.part(new THREE.CylinderGeometry(0.075, 0.095, 0.04, 6), SEAM, { at: top.clone().addScaledVector(da, 0.02), dir: da, bone: shoulder }));
    // flame from the pauldron top and a tassel under the rim
    glow(
      b.cards(
        [-0.5, 0, 0.5].map((q) => frame(top.clone().addScaledVector(da, 0.12).add(V(q * 0.14, 0, q * 0.1)), [s * 0.2 + q * 0.4, 1, 0.1])),
        FLAME,
        { size: [0.13, 0.32], cross: true, vary: 0.3, rng: R, bone: shoulder, flow: [0, -0.2, -1] },
      ),
    );
    b.cards(
      [-0.3, 0, 0.3].map((q) => frame(V(s * 1.28, 2.0, q * 0.9), [0, 1, 0])),
      TASSEL,
      { size: [0.07, 0.22], lean: 180, flow: [0, 0, 1], vary: 0.15, rng: R, bone: shoulder },
    );
    // floating shards
    for (let k = 0; k < 3; k++) {
      const p = V(s * (1.35 + k * 0.12), 2.75 + k * 0.1 - (k === 1 ? 0.3 : 0), 0.35 - k * 0.38);
      b.part(new THREE.OctahedronGeometry(0.1, 0), OBS, { at: p, bone: chest, scale: [0.6, 1.5, 0.6], rotation: [k * 20, k * 50, s * 14], flat: true });
      glow(b.part(new THREE.OctahedronGeometry(0.045, 0), SEAM, { at: p, bone: chest, scale: [0.6, 1.5, 0.6], rotation: [k * 20, k * 50, s * 14], flat: true }));
      b.part(new THREE.TorusGeometry(0.1, 0.012, 4, 10), GOLD, { at: p, bone: chest, rotation: [90 + k * 20, 0, 0] });
    }

    // hand
    const dn = pts[2].clone().sub(pts[1]).normalize();
    const pEnd = pts[2].clone().addScaledVector(dn, 0.3);
    b.frustumBox(pts[2].clone().addScaledVector(dn, 0.02), pEnd, [0.2, 0.34], [0.25, 0.44], { bone: wrist, color: CRUST });
    plate(pts[2].clone().addScaledVector(dn, 0.17).add(V(s * 0.13, 0, 0.02)), [s, 0, 0.1], 0.38, 0.3, 0.07, wrist, { cut: 0.28 });
    plate(pts[2].clone().addScaledVector(dn, 0.17).add(V(-s * 0.12, 0, 0.02)), [-s, 0, 0.1], 0.38, 0.28, 0.06, wrist, { cut: 0.28 });
    const fingerLen = [0.9, 1.1, 1.05, 0.85];
    for (let i = 0; i < 4; i++) {
      const zo = (i - 1.5) * 0.105;
      const k0 = pEnd.clone().add(V(0, 0, zo));
      const L = fingerLen[i];
      const k1 = k0.clone().addScaledVector(dn, 0.15 * L).add(V(0, 0, 0.015));
      const k2 = k1.clone().addScaledVector(dn, 0.13 * L).add(V(s * 0.0, -0.02, 0.045));
      const fc = b.chain(`finger${i + 1}${S}`, [k0, k1, k2], {
        parent: wrist,
        names: [`finger${i + 1}${S}a`, `finger${i + 1}${S}b`],
        role: "digit",
      });
      b.sweep(fc, [0.055, 0.048, 0.034], { section: { ngon: 6 }, color: CRUST, caps: { start: "flat", end: "flat" } });
      const tipDir = k2.clone().sub(k1).normalize();
      spike(k2.clone().addScaledVector(tipDir, -0.01), tipDir, 0.1, 0.034, fc.joints[1], SEAM);
      glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), SEAM_HOT, { at: k2.clone().addScaledVector(tipDir, 0.1), bone: fc.joints[1], flat: true }));
      plate(k0.clone().add(V(s * 0.04, 0.0, 0)), [s, 0, 0.2], 0.1, 0.13, 0.04, fc.joints[0], { cut: 0.3 });
    }
    const t0 = pts[2].clone().addScaledVector(dn, 0.08).add(V(-s * 0.06, 0, 0.19));
    const t1 = t0.clone().add(V(-s * 0.03, -0.06, 0.12));
    const t2 = t1.clone().add(V(-s * 0.02, -0.08, 0.1));
    const th = b.chain(`thumb${S}`, [t0, t1, t2], { parent: wrist, names: [`thumb${S}a`, `thumb${S}b`], role: "digit" });
    b.sweep(th, [0.06, 0.052, 0.036], { section: { ngon: 6 }, color: CRUST, caps: { start: "flat", end: "flat" } });
    const tdir = t2.clone().sub(t1).normalize();
    spike(t2, tdir, 0.1, 0.036, th.joints[1], SEAM);
    glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), SEAM_HOT, { at: t2.clone().addScaledVector(tdir, 0.1), bone: th.joints[1], flat: true }));
  }

  // -------------------------------------------------------------------------------------------------------------
  // Gold filigree decals on the largest plates
  for (const p of decorated) {
    b.decal(p, FILIGREE, { at: p.at, dir: p.axis, size: [0.3, 0.225], lift: 0.004 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Embers drifting round the body: tiny glowing shards, merged per colour
  const embers = (color: string, n: number, size: number, seed: number) => {
    const r2 = rng(seed);
    const geos = Array.from({ length: n }, () => {
      const g = new THREE.TetrahedronGeometry(size * (0.6 + r2() * 0.8), 0);
      g.rotateX(r2() * 6);
      g.rotateY(r2() * 6);
      const a = r2() * Math.PI * 2;
      const rad = 0.7 + r2() * 0.9;
      g.translate(Math.sin(a) * rad, 1.3 + r2() * 2.1, Math.cos(a) * rad * 0.8);
      return g;
    });
    const merged = mergeGeometries(geos);
    if (merged) glow(b.part(merged, color, { bone: hips, at: [0, 0, 0] }));
  };
  embers(SEAM, 18, 0.03, 5);
  embers(SEAM_HOT, 12, 0.022, 9);

  return b.root;
}
