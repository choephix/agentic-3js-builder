import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, noise, paint, resolve, scales, spots } from "../../../../src/paint";
import type { ColorInput, Rgb } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import type { SurfaceTarget } from "../../../../src/surface";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: bark-plated barrel chest, huge gnarled hands, a scowling carved face with glowing amber eyes, a leafy antler crown, bronze bracers and a glowing heart-rune.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const BARK = "#6b4a2f";
const BARK2 = "#5a3c25";
const BARK3 = "#7d5a38";
const BARK_D = "#3d2a1a";
const BARK_L = "#98744a";
const EDGE = "#26180e";
const MOSS = "#5f9130";
const MOSS_L = "#9acb44";
const ROOT = "#4d3522";
const ROOT_D = "#2e2014";
const LEAF = "#4f9e34";
const LEAF_D = "#2d6a2a";
const LEAF_L = "#b4dc4a";
const AMBER = "#ffb52e";
const BRONZE = "#b07a2a";
const BRONZE_D = "#6e4a1a";
const BRONZE_L = "#e3b756";
const CLAW = "#2a1c12";
const IVORY = "#e8d9a8";
const DARK = "#1c110a";
const RED = "#c8321e";
const CREAM = "#f3e6c4";
const ORANGE = "#e0802a";
const TWIG = "#7a5a34";
const EGG = "#8fd6e0";

const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const last = <T>(c: { joints: T[] }) => c.joints[c.joints.length - 1];

// Warm-from-above hand-painted shading wrapped around any colour or paint.
const shaded = (base: ColorInput) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const f = Math.min(1.12, Math.max(0.5, 0.78 + 0.28 * n.y + 0.08 * n.z));
    const out: Rgb = [Math.min(1, c[0] * f * 1.04), Math.min(1, c[1] * f), Math.min(1, c[2] * f * 0.94)];
    return out;
  });

const mossy = mottle(MOSS, MOSS_L, { size: 0.14, seed: 5 });
const mud = mottle("#3a2a1a", "#56402a", { size: 0.1, seed: 2 });
const coat = (plate: ColorInput, seed: number) =>
  shaded(paint((p, n) => (n.y > 0.5 && noise(p, 0.28, seed) > 0.42 ? mossy : p.y < 0.3 ? mud : plate)));

const plates = scales([BARK, BARK2, BARK3], EDGE, { size: 0.17, width: 0.24, seed: 3 });
const BODY_P = coat(plates, 9);
const LIMB_P = coat(grain(BARK, BARK_D, { size: 0.04, seed: 1 }), 4);
const HEAD_P = coat(grain(BARK_L, BARK, { size: 0.03, seed: 6 }), 6);
const ROOT_P = shaded(mottle(ROOT, ROOT_D, { size: 0.09, seed: 8 }));
const LEAF_P = shaded(mottle(LEAF, LEAF_L, { size: 0.18, seed: 7 }));
const CAP_P = spots(RED, CREAM, { size: 0.07, amount: 0.45, seed: 3 });

export default function build() {
  const b = createBuilder({ name: "ancientTreant" });

  // ---------- textures ----------
  const leafTex = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 47 C2 34 2 14 16 1 C30 14 30 34 16 47Z" fill="#3f8a2e" stroke="#1f4d1c" stroke-width="2"/><path d="M16 46 C26 34 26 16 16 3Z" fill="#6cb43a"/><path d="M16 46 L16 6" stroke="#c6ea66" stroke-width="2" fill="none"/><path d="M16 34 L7 24 M16 26 L25 17 M16 20 L9 13" stroke="#9fd64a" stroke-width="1.6" fill="none"/></svg>`,
    { size: 128 },
  );
  const leafTex2 = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 47 C2 34 2 14 16 1 C30 14 30 34 16 47Z" fill="#d98a2a" stroke="#7a3d14" stroke-width="2"/><path d="M16 46 C26 34 26 16 16 3Z" fill="#f0b840"/><path d="M16 46 L16 6" stroke="#fbe08a" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const mossTex = svg(
    `<svg viewBox="0 0 32 32"><path d="M4 32 Q6 14 2 2 Q12 12 14 32Z" fill="#4f8a2a"/><path d="M12 32 Q14 10 16 0 Q22 12 22 32Z" fill="#78b83a"/><path d="M20 32 Q24 16 30 6 Q30 20 28 32Z" fill="#3f7424"/></svg>`,
    { size: 96 },
  );
  const vineTex = svg(
    `<svg viewBox="0 0 24 64"><path d="M12 0 C8 20 16 40 12 62" stroke="#4a7a2a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="7" cy="20" rx="5" ry="3" fill="#6cb43a"/><ellipse cx="18" cy="34" rx="5" ry="3" fill="#5aa032"/><ellipse cx="7" cy="48" rx="5" ry="3" fill="#78b83a"/><ellipse cx="12" cy="61" rx="3" ry="3" fill="#9acb44"/></svg>`,
    { size: 128 },
  );
  const runeTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#9dffb4" stroke-width="3"/><circle cx="32" cy="32" r="21" fill="none" stroke="#5fe08a" stroke-width="2"/><path d="M32 52 L32 20 M32 40 L20 28 M32 34 L44 24 M32 28 L26 18 M32 23 L38 13" stroke="#c8ffd4" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M6 32 h6 M52 32 h6 M32 4 v6 M32 54 v6" stroke="#9dffb4" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
    { size: 256 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.45, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.45, 0],
      [0, 1.95, 0.03],
      [0, 2.5, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = last(spine);
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.55, 0.12],
      [0, 2.85, 0.3],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: last(neck), at: [0, 2.88, 0.3], dir: [0, 0.35, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.95, 0.35], aim: [0, 2.9, 0.75], role: "jaw" });

  // ---------- torso ----------
  const torso = b.sweep(
    spine,
    (t) => [0.46 + 0.34 * Math.pow(t, 1.2), 0.4 + 0.1 * t],
    { color: BODY_P },
  );
  b.part(new THREE.SphereGeometry(1, 10, 8), BODY_P, { bone: hips, at: [0, 1.38, 0], scale: [0.55, 0.3, 0.44] });
  const skin = b.surface(torso);

  // vertical bark ridges
  for (const a of [20, 60, 100, 140, -20, -60, -100, -140]) b.sweep(torso.line(a, 0.01), 0.035, { color: BARK_D, sides: 5 });
  // dorsal thorns
  b.along(torso, 6, (at) => {
    b.spike(at, at, 0.24, 0.07, { color: BARK_D, sides: 6 });
  });

  // belt and collar
  b.sweep(skin.loop([0, 1.55, 0.03], { lift: 0.02 }), 0.06, { color: BRONZE, sides: 6 });
  b.sweep(skin.loop([0, 2.42, 0.1], { lift: 0.02 }), 0.055, { color: BRONZE_D, sides: 6 });
  const buckle = skin.around([0, 1.55, 0.03]).at(0, 0);
  if (buckle) b.stick(new THREE.BoxGeometry(0.24, 0.06, 0.24), BRONZE_L, buckle, { embed: 0.3 });

  // glowing heart rune
  glow(
    b.decal(torso, runeTex, { at: [0, 2.15, 0.55], dir: [0, 0, 1], size: [0.52, 0.52] }),
    1.4,
  );

  // brackets and mushrooms on the right flank
  for (const [y, x, z] of [
    [1.9, -0.58, 0.15],
    [2.15, -0.62, -0.02],
  ])
    b.part(new THREE.SphereGeometry(1, 8, 5), ORANGE, { bone: spine.joints[1], at: [x, y, z], scale: [0.2, 0.05, 0.15] });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${sd}`,
      catmull([
        [s * 0.36, 1.4, 0],
        [s * 0.42, 0.8, 0.12],
        [s * 0.42, 0.22, 0.02],
      ]),
      { parent: hips, names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`], role: "leg" },
    );
    b.sweep(leg, [0.26, 0.22, 0.24], { color: LIMB_P });
    const ankle = last(leg);
    b.part(new THREE.SphereGeometry(1, 8, 6), LIMB_P, { bone: leg.joints[1], at: [s * 0.42, 0.8, 0.3], scale: 0.16 });
    b.part(new THREE.SphereGeometry(1, 10, 7), ROOT_P, { bone: ankle, at: [s * 0.42, 0.14, 0.08], scale: [0.32, 0.14, 0.42] });
    for (const deg of [-70, -35, 0, 35, 70, 180]) {
      const a = (deg * Math.PI) / 180;
      const ex = s * 0.42 + Math.sin(a) * 0.62;
      const ez = 0.05 + Math.cos(a) * 0.62;
      b.sweep(
        catmull([
          [s * 0.42, 0.2, 0.05],
          [s * 0.42 + Math.sin(a) * 0.3, 0.12, 0.05 + Math.cos(a) * 0.3],
          [ex, 0.06, ez],
        ]),
        [0.1, 0.03],
        { bone: ankle, color: ROOT_P, sides: 6, caps: { start: "flat", end: "point" } },
      );
    }
    mossCover(leg.joints[0], 6, 40 + (s > 0 ? 1 : 2));
  }

  // ---------- arms ----------
  const shoulderPads: SurfaceTarget[] = [];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = [s * 0.8, 2.5, 0.08];
    const el = [s * 1.3, 1.95, 0.25];
    const wr = [s * 1.45, 1.35, 0.5];
    const arm = b.chain(`arm${sd}`, catmull([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    b.sweep(arm, [0.3, 0.25, 0.3], { color: LIMB_P });
    const shJ = arm.joints[0];
    const elJ = arm.joints[1];
    const wrJ = last(arm);

    // shoulder pad
    const pad = b.part(new THREE.SphereGeometry(1, 10, 8), LIMB_P, { bone: shJ, at: [s * 0.88, 2.72, 0], scale: [0.45, 0.32, 0.42] });
    shoulderPads.push(pad);
    for (let k = 0; k < 5; k++) {
      const d = new THREE.Vector3(s * 0.6, 1, (k - 2) * 0.45).normalize();
      const base = new THREE.Vector3(s * 0.88, 2.72, 0).addScaledVector(d, 0.36);
      b.spike(base, d, 0.34, 0.07, { color: BARK_D, bone: shJ, sides: 6 });
    }

    // bronze bracers
    const band = (a: number[], c: number[], t: number, bone: Joint) => {
      const A = V(a);
      const C = V(c);
      const at = A.clone().lerp(C, t);
      const d = C.clone().sub(A).normalize();
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.14, 8), BRONZE, { at, dir: d, bone });
      b.ring(frame(at, d), { count: 6, radius: 0.35 }, (it) => {
        b.part(new THREE.SphereGeometry(0.03, 6, 4), BRONZE_L, { at: it });
      });
    };
    band(sh, el, 0.55, shJ);
    band(el, wr, 0.85, elJ);

    // hand
    const palm = [s * 1.47, 1.2, 0.52];
    b.part(new THREE.SphereGeometry(1, 10, 8), LIMB_P, { bone: wrJ, at: palm, scale: [0.27, 0.22, 0.2] });
    const finger = (nm: string, pts: number[][], r: number[]) => {
      const ch = b.chain(nm, catmull(pts), { parent: wrJ, names: [`${nm}1`, `${nm}2`, `${nm}3`], role: "digit" });
      b.sweep(ch, r, { color: LIMB_P, sides: 6 });
      const d = V(pts[2]).sub(V(pts[1])).normalize();
      b.spike(pts[2], d, 0.13, 0.045, { color: CLAW, bone: last(ch), sides: 6 });
    };
    for (let i = 0; i < 4; i++) {
      const x = s * 1.47 + (i - 1.5) * 0.115;
      finger(
        `f${i}${sd}`,
        [
          [x, 1.1, 0.56],
          [x, 0.86, 0.66],
          [x, 0.68, 0.8],
        ],
        [0.06, 0.045, 0.03],
      );
    }
    finger(
      `thumb${sd}`,
      [
        [s * 1.27, 1.2, 0.58],
        [s * 1.2, 1.04, 0.72],
        [s * 1.2, 0.94, 0.86],
      ],
      [0.07, 0.05, 0.035],
    );
    mossCover(arm.joints[0], 8, 60 + (s > 0 ? 1 : 2));
  }
  for (const pad of shoulderPads) mossCover(pad, 10, 70 + shoulderPads.indexOf(pad), 0.3);

  // mushrooms on left shoulder
  const mushroom = (at: number[], r: number, bone: Joint) => {
    b.part(new THREE.CylinderGeometry(r * 0.3, r * 0.38, r * 1.1, 6), CREAM, { at: [at[0], at[1] + r * 0.55, at[2]], bone });
    b.part(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CAP_P, { at: [at[0], at[1] + r * 1.05, at[2]], bone });
  };
  const shoulderLJ = b.surface(shoulderPads[0]).nearest([0.88, 3, 0]).bone ?? chest;
  mushroom([0.8, 3.0, 0.1], 0.09, shoulderLJ);
  mushroom([0.97, 2.98, -0.1], 0.07, shoulderLJ);
  mushroom([0.68, 2.97, -0.12], 0.06, shoulderLJ);

  // nest on right shoulder
  const shoulderRJ = b.surface(shoulderPads[1]).nearest([-0.88, 3, 0]).bone ?? chest;
  b.part(new THREE.TorusGeometry(0.15, 0.05, 5, 10), TWIG, { bone: shoulderRJ, at: [-0.88, 3.04, 0], rotation: [90, 0, 0] });
  for (const [x, z] of [
    [-0.84, 0.02],
    [-0.93, -0.02],
    [-0.88, 0.07],
  ])
    b.part(new THREE.SphereGeometry(0.05, 6, 5), EGG, { bone: shoulderRJ, at: [x, 3.06, z], scale: [1, 1.2, 1] });

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEAD_P, { bone: head, at: [0, 3.08, 0.36], scale: [0.34, 0.38, 0.34] });
  b.sweep(neck, [0.3, 0.24], { color: LIMB_P });
  b.part(new THREE.BoxGeometry(0.36, 0.18, 0.26), HEAD_P, { bone: head, at: [0, 3.03, 0.58] });
  b.part(new THREE.BoxGeometry(0.4, 0.05, 0.34), DARK, { bone: head, at: [0, 2.95, 0.55] });
  b.part(new THREE.BoxGeometry(0.5, 0.16, 0.4), HEAD_P, { bone: jaw, at: [0, 2.87, 0.5] });
  b.part(new THREE.SphereGeometry(1, 8, 6), HEAD_P, { bone: jaw, at: [0, 2.84, 0.72], scale: [0.2, 0.09, 0.14] });
  b.spike([0, 3.03, 0.7], [0, -0.2, 1], 0.2, 0.07, { color: BARK_L, bone: head, sides: 6 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD_P, { bone: head, at: [s * 0.27, 2.98, 0.45], scale: 0.1 });
    b.part(new THREE.BoxGeometry(0.28, 0.09, 0.16), BARK_D, { bone: head, at: [s * 0.14, 3.2, 0.62], rotation: [0, 0, s * 18] });
    b.part(new THREE.SphereGeometry(0.085, 8, 6), DARK, { bone: head, at: [s * 0.13, 3.1, 0.6] });
    glow(b.part(new THREE.SphereGeometry(0.055, 8, 6), AMBER, { bone: head, at: [s * 0.13, 3.1, 0.64] }), 1.6);
    b.spike([s * 0.15, 2.92, 0.66], [0, 1, 0.2], 0.16, 0.035, { color: IVORY, bone: jaw, sides: 6 });
    b.spike([s * 0.3, 3.12, 0.3], [s, 0.3, -0.2], 0.3, 0.05, { color: BARK_D, bone: head, sides: 6 });
  }
  mossCover(skull, 8, 90, 0.4);

  // beard of hanging vines
  b.cards(
    [-0.2, -0.13, -0.06, 0, 0.06, 0.13, 0.2].map((x, i) => frame([x, 2.82, 0.62 - Math.abs(x) * 0.5 + (i % 2) * 0.03], [0, 1, 0])),
    vineTex,
    { size: [0.12, 0.38], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(11), bone: jaw },
  );

  // ---------- foliage ----------
  const branch = (pts: number[][], r: [number, number], bone: Joint, leaves: number, size: number, seed: number) => {
    const sw = b.sweep(catmull(pts), r, { bone, color: LIMB_P, sides: 6, caps: { start: "flat", end: "point" } });
    const frames = Array.from({ length: leaves }, (_, i) => sw.at(0.25 + (0.75 * i) / Math.max(1, leaves - 1), (i * 97) % 360));
    b.cards(frames, [leafTex, leafTex, leafTex2], {
      size: [size * 0.7, size],
      lean: 45,
      bend: 25,
      flow: [0, 1, 0],
      vary: 0.25,
      spin: 40,
      rng: rng(seed),
    });
    b.part(new THREE.IcosahedronGeometry(size * 0.9, 0), LEAF_P, { bone, at: pts[pts.length - 1], flat: true });
  };
  for (const s of [1, -1]) {
    branch(
      [
        [s * 0.15, 3.38, 0.2],
        [s * 0.35, 3.8, 0.12],
        [s * 0.7, 4.2, 0.1],
      ],
      [0.07, 0.015],
      head,
      7,
      0.22,
      20 + s,
    );
    branch(
      [
        [s * 0.37, 3.82, 0.12],
        [s * 0.65, 3.9, 0.0],
        [s * 1.0, 4.08, -0.1],
      ],
      [0.045, 0.012],
      head,
      5,
      0.2,
      30 + s,
    );
    branch(
      [
        [s * 0.4, 2.7, -0.25],
        [s * 0.7, 3.2, -0.5],
        [s * 1.0, 3.8, -0.45],
        [s * 1.2, 4.2, -0.3],
      ],
      [0.13, 0.02],
      chest,
      10,
      0.3,
      40 + s,
    );
  }
  branch(
    [
      [0, 3.4, 0.15],
      [0, 3.9, 0.1],
      [0.05, 4.3, 0.05],
    ],
    [0.07, 0.015],
    head,
    7,
    0.24,
    50,
  );

  // ---------- helpers needing the builder ----------
  function mossCover(target: SurfaceTarget, count: number, seed: number, minY = 0.25) {
    const hits = b.surface(target).scatter(count, { rng: rng(seed), minDist: 0.09, filter: (h) => h.n.y > minY });
    b.cards(hits, mossTex, { size: [0.1, 0.16], lean: 25, bend: 25, vary: 0.35, spin: 180, rng: rng(seed + 1) });
  }
  mossCover(torso, 28, 80, 0.25);

  return b.root;
}
