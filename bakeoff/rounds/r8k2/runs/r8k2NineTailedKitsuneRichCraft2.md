1. **Face:** The skull is now `[0.112H, 0.087H, 0.12H]`. The muzzle is one sweep from `hp(0.085, -0.025)` to `hp(0.2, -0.045)`, radii `[0.065H, 0.044H]` tapering to `[0.027H, 0.021H]`. The nose, jaw joint and sweep, mouth seams and whiskers were repositioned onto it, and the jowls are sunk into the transition. `ALMOND` is redrawn with a flatter lower curve in a 84×48 viewBox, and the decal is `0.076H × 0.043H`. The iris and highlights are kept.
2. **Tails:** A per-tail table sets run, three depths and three bends. Tip depths span about 0.29 m, the middles bow backward, and the outer pair sweep forward then curl up. The `k=0.36` and `k=0.7` knots differ per tail. The `P0` spread is narrower and the rump ellipsoid is smaller.
3. **Ears and forelock:** The ears are tapered wedge shells, `0.034H` at the base to `0.004H` at the tip. They sink `0.013H` into the skull, their openings turn inward about 10°, and the pink inset is a matching proud wedge. The forelock is three short (`0.07H`), broad blades swept back against the crown.
4. **Fur:** `blade()` is now a curved, tapered sweep with a full root and a hair-thin point. Cheek pieces are `0.06H` wide with roots buried in the jowls. The bib is one central mass with two side tufts. Neck tufts root inside the neck tube. Tail tufts are about 25% shorter, nearly tangent, and painted the same as the tail. The shadow tones are softened.
5. **Gold hardware:** Tail bands are `surface(ts).loop(chain.at(0.38), { lift: 0.002 })` with a 0.0055 m tube. The bell's top now overlaps its loop's bottom by 2.5 mm. Each shide's top extends into its rope knot.
6. **Shrine:** `PR` is 0.85, with the seal, rocks, grass and petals scaled to match. The lanterns are uniformly scaled to 0.7 and moved back to `(±0.48, -0.5)`, which keeps them on the smaller plinth top. The chest and ear foxfire is removed and two flames remain in clear space. The seal glow is lowered to 0.55.
7. **Flames:** `flame()` is four curved, six-sided tapered tongues with off-axis tips: a bright core at glow 2 and cyan or violet outer tongues at glow 0.6. Tail flames start 0.027 m before each tail's end.

```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  bezier,
  limb,
  paint,
  mix,
  noise,
  smoothstep,
  gradient,
  svg,
} from "agentic-3js-builder";
import { cel, furEdge, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kitsune of the Nine Spirit Flames",
  description:
    "An ivory nine-tailed fox in high-fantasy anime style: golden almond eyes, vermilion kumadori markings, a shimenawa collar with paper shide, a bell and tassel earrings. Nine flowing tails end in dimensional spirit flames. She stands on a restrained mossy shrine plinth with a glowing nine-point seal, two small stone lanterns and floating foxfire.",
};

type V3 = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];

const F = 0.08; // top of the shrine plinth
const H = 1.15; // head scale
const PR = 0.85; // plinth radius
const SC = PR / 0.95; // shrine scale factor

// ---------------------------------------------------------------- textures
const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(128 + r * Math.cos(a)).toFixed(1)} ${(128 + r * Math.sin(a)).toFixed(1)}`;
};
const nineStar = (r: number, step: number) =>
  "M" + Array.from({ length: 9 }, (_, i) => polar(r, -90 + i * step * 40)).join(" L") + " Z";
const magicSvg = () => {
  let dots = "";
  for (let i = 0; i < 9; i++) {
    const [x, y] = polar(112, -90 + i * 40).split(" ");
    dots += `<circle cx="${x}" cy="${y}" r="5.5" fill="#bff7ff"/>`;
    const [x2, y2] = polar(78, -90 + i * 40 + 20).split(" ");
    dots += `<circle cx="${x2}" cy="${y2}" r="3.2" fill="#b9a2ff"/>`;
  }
  let ticks = "";
  for (let i = 0; i < 36; i++)
    ticks += `<path d="M${polar(121, i * 10)} L${polar(i % 3 ? 117 : 112, i * 10)}" stroke="#8feaff" stroke-width="2.4"/>`;
  return `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="124" fill="none" stroke="#8feaff" stroke-width="3"/>
    <circle cx="128" cy="128" r="104" fill="none" stroke="#8feaff" stroke-width="2.4"/>
    ${ticks}
    <path d="${nineStar(100, 2)}" fill="none" stroke="#bff7ff" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="${nineStar(70, 4)}" fill="none" stroke="#b9a2ff" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="128" cy="128" r="46" fill="none" stroke="#8feaff" stroke-width="2.6"/>
    <circle cx="128" cy="128" r="14" fill="#bff7ff"/>
    <circle cx="128" cy="128" r="24" fill="none" stroke="#b9a2ff" stroke-width="2.2"/>
    ${dots}
  </svg>`;
};

// A narrow golden almond eye: flat lower lid, lifted outer corner (drawn as the creature's right eye)
const ALMOND = "M5 20 C18 7 42 2 60 6 C76 10 82 22 80 32 C62 42 30 44 14 36 C8 32 6 27 5 20 Z";
const EYE_SVG = `<svg viewBox="0 0 84 48" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="a"><path d="${ALMOND}"/></clipPath>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b8571a"/><stop offset="0.45" stop-color="#ffb12e"/><stop offset="1" stop-color="#fff08a"/>
    </linearGradient>
  </defs>
  <path d="${ALMOND}" fill="#2a1330"/>
  <g clip-path="url(#a)">
    <ellipse cx="46" cy="24" rx="20" ry="22" fill="url(#g)"/>
    <ellipse cx="46" cy="24" rx="5.5" ry="14" fill="#2a1330"/>
    <rect x="0" y="0" width="84" height="12" fill="#2a1330" opacity="0.4"/>
    <ellipse cx="39" cy="17" rx="4.4" ry="5" fill="#ffffff"/>
    <circle cx="54" cy="33" r="2.3" fill="#ffffff"/>
  </g>
  <path d="${ALMOND}" fill="none" stroke="#2a1330" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M8 20 L0 8 L15 14 Z" fill="#2a1330" stroke="#2a1330" stroke-width="2" stroke-linejoin="round"/>
  <path d="M30 4 Q48 0 66 6" stroke="#2a1330" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`;

const MARK_FORE = `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 2 L35 28 L20 62 L5 28 Z" fill="#e2363f" stroke="#3a1230" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M20 14 L28 28 L20 46 L12 28 Z" fill="#ff7a5a"/>
  <circle cx="20" cy="28" r="4.2" fill="#ffd35a" stroke="#3a1230" stroke-width="1.4"/>
</svg>`;
const MARK_CHEEK = `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
  <path d="M74 6 C52 8 30 16 4 34 C32 30 54 24 76 16 Z" fill="#e2363f" stroke="#3a1230" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M70 26 C52 30 36 38 20 48 C42 44 56 40 72 34 Z" fill="#e2363f" stroke="#3a1230" stroke-width="1.8" stroke-linejoin="round"/>
</svg>`;
const MARK_FLANK = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 72 C6 30 38 8 72 12 C50 20 36 34 36 50 C36 62 28 68 8 72 Z" fill="#e2363f" stroke="#3a1230" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M20 62 C20 40 38 26 58 22 C44 32 38 42 38 52 C36 58 30 60 20 62 Z" fill="#ff8a62"/>
  <circle cx="52" cy="52" r="7" fill="#ffd35a" stroke="#3a1230" stroke-width="2"/>
  <circle cx="52" cy="52" r="2.6" fill="#e2363f"/>
</svg>`;
const WINDOW = `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="38" height="46" rx="5" fill="#ff9a3c"/>
  <rect x="5" y="5" width="30" height="38" rx="4" fill="#ffd27a"/>
  <ellipse cx="20" cy="24" rx="10" ry="14" fill="#fff3c0"/>
  <path d="M20 5 V43 M5 24 H35" stroke="#7a3d12" stroke-width="3"/>
</svg>`;
const PETAL = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 31 C4 24 0 12 7 3 C11 6 14 8 16 12 C18 8 21 6 25 3 C32 12 28 24 16 31 Z" fill="#ffc2d6" stroke="#f08aaa" stroke-width="1.2"/>
  <path d="M16 28 V14" stroke="#f6a2bd" stroke-width="1.2"/>
</svg>`;
const GRASS = `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 64 C6 40 10 20 4 4 C16 20 20 42 20 64 Z" fill="#5da24e"/>
  <path d="M18 64 C20 36 26 14 24 0 C34 16 34 42 32 64 Z" fill="#7cc35e"/>
  <path d="M30 64 C32 44 40 28 44 14 C46 34 44 50 42 64 Z" fill="#4a8d46"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const R = rng(11);

  // ---------------------------------------------------------------- palette
  const WHITE = cel("#fffaf1", "#ddd7f3");
  const LAV = cel("#ece6fb", "#cdc5ee");
  const RED = cel("#e2363f", "#9c1f45");
  const GOLD = cel("#ffd35a", "#c78a2a");
  const INDIGO = cel("#34346f", "#1c1c48");
  const PINK = cel("#ffb7cb", "#e68aab");
  const DORSAL = cel("#f1ecfb", "#d3ccee");
  const BODY = furEdge(DORSAL, WHITE, { level: 0.6, teeth: 0.1, period: 0.05, along: [0, 0, 1] });
  const SOCKS = furEdge(WHITE, INDIGO, { by: "position", level: 0.25, teeth: 0.03, period: 0.034, along: [1, 0, 1] });
  const STONE = paint((p, n) => {
    const m = noise(p, 0.22, 3);
    let c = mix("#7d839c", "#a3a8bd", m);
    c = mix(c, "#5b6078", smoothstep(0.62, 0.8, noise(p, 0.07, 8)) * 0.6);
    const moss = smoothstep(0.52, 0.7, noise(p, 0.28, 5)) * smoothstep(0.55, 0.9, n.y);
    c = mix(c, "#6fae5a", moss * 0.85);
    return mix(c, "#4c5170", (1 - smoothstep(-0.2, 0.6, n.y)) * 0.35);
  });

  // ---------------------------------------------------------------- textures
  const EYE = svg(EYE_SVG, { size: 384 });
  const MAGIC = svg(magicSvg(), { size: 512 });
  const FOREMARK = svg(MARK_FORE, { size: 128 });
  const CHEEKMARK = svg(MARK_CHEEK, { size: 160 });
  const FLANKMARK = svg(MARK_FLANK, { size: 192 });
  const WINDOWTEX = svg(WINDOW, { size: 96 });
  const PETALTEX = svg(PETAL, { size: 64 });
  const GRASSTEX = svg(GRASS, { size: 96 });

  // ---------------------------------------------------------------- helpers
  const norm = (a: number[]): V3 => {
    const v = new THREE.Vector3(a[0], a[1], a[2]).normalize();
    return [v.x, v.y, v.z];
  };
  const orth = (a: number[], hint: number[]): V3 => {
    const av = new THREE.Vector3(a[0], a[1], a[2]).normalize();
    const h = new THREE.Vector3(hint[0], hint[1], hint[2]);
    h.addScaledVector(av, -h.dot(av));
    if (h.lengthSq() < 1e-8) {
      h.set(0, 0, 1);
      h.addScaledVector(av, -av.z);
    }
    h.normalize();
    return [h.x, h.y, h.z];
  };
  const planeY = (y: number[], hint: number[]) => ({ y: norm(y), x: orth(y, hint) });
  const toV = (p: any) =>
    Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : new THREE.Vector3(p.x, p.y, p.z);

  /**
   * A fur blade: a gently curved, tapered wedge. Full width at the root (which is buried in the support),
   * a paper-thin point at the tip. `hint` is the width direction; the thin axis curls toward `bias`.
   */
  const blade = (
    len: number,
    wid: number,
    at: any,
    dir: number[],
    hint: number[],
    color: any,
    bone: any,
    thick = 0.014,
    bias: number[] = [0, -1, -0.3],
    curl = 0.18,
  ) => {
    const A = toV(at);
    const D = toV(dir).normalize();
    let T = D.clone().cross(toV(hint));
    if (T.lengthSq() < 1e-6) T = D.clone().cross(new THREE.Vector3(1, 0, 0));
    T.normalize();
    if (T.dot(toV(bias)) < 0) T.negate();
    const mid = A.clone().addScaledVector(D, len * 0.55).addScaledVector(T, len * curl);
    const tip = A.clone().addScaledVector(D, len * 0.96).addScaledVector(T, len * curl * 0.35);
    return b.sweep(
      bezier(A, mid, tip),
      (t: number): [number, number] => [(wid / 2) * Math.pow(1 - t, 0.8), thick * 0.5 * Math.pow(1 - t, 1.3) + 0.0008],
      { color, bone, up: T, sides: 6, caps: "point" },
    );
  };

  const ellipsoid = (at: any, sc: V3, color: any, bone: any, seg: [number, number] = [10, 8]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { at, bone, scale: sc });

  /**
   * Spirit foxfire: a bright core tongue in front, flanked by shorter coloured tongues, all curved
   * and six-sided with off-axis tips. Emission is concentrated in the core.
   */
  const flame = (base: number[], h: number, w: number, kind: number, bone: any, lean: [number, number]) => {
    const out = kind ? "#8d63ff" : "#2f98ff";
    const out2 = kind ? "#b79bff" : "#63dcff";
    const prof = [1, 1.12, 0.8, 0.4, 0];
    const tongue = (ox: number, oz: number, ht: number, rw: number, lx: number, lz: number, col: string, gl: number) => {
      const sx = base[0] + ox;
      const sy = base[1];
      const sz = base[2] + oz;
      const path = bezier(
        [sx, sy, sz],
        [sx + lx * ht * 0.06, sy + ht * 0.38, sz + lz * ht * 0.06],
        [sx + lx * ht * 0.2, sy + ht * 0.72, sz + lz * ht * 0.2],
        [sx + lx * ht * 0.42, sy + ht, sz + lz * ht * 0.42],
      );
      glow(
        b.sweep(
          path,
          prof.map((r) => r * rw),
          { color: col, bone, sides: 6 },
        ),
        gl,
      );
    };
    tongue(0.38 * w, 0, 0.72 * h, 0.4 * w, lean[0] + 0.6, lean[1], out, 0.6);
    tongue(-0.38 * w, 0, 0.7 * h, 0.4 * w, lean[0] - 0.6, lean[1], out, 0.6);
    tongue(0, -0.22 * w, 0.62 * h, 0.42 * w, lean[0], lean[1] - 0.5, out2, 0.6);
    tongue(0, 0.1 * w, h, 0.36 * w, lean[0], lean[1], "#effdff", 2);
  };

  /** A small 3D tassel: gold cap and five tapered red strands hanging down. */
  const tassel = (at: THREE.Vector3, bone: any, len = 0.07) => {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { bone, at: [at.x, at.y + 0.002, at.z] });
    b.part(new THREE.CylinderGeometry(0.011, 0.014, 0.014, 8), GOLD, { bone, at: [at.x, at.y - 0.007, at.z] });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const x0 = Math.cos(a) * 0.006;
      const z0 = Math.sin(a) * 0.006;
      b.rod(
        [at.x + x0, at.y - 0.014, at.z + z0],
        [at.x + x0 * 1.7, at.y - 0.014 - len * (0.9 + 0.1 * (k % 2)), at.z + z0 * 1.7],
        [0.002, 0.0012],
        "#d62f45",
        { bone, sides: 4 },
      );
    }
  };

  // ---------------------------------------------------------------- skeleton
  const root = b.joint("root", { at: [0, F, 0] });
  const SP: V3[] = [
    [0, 0.52, -0.26],
    [0, 0.535, -0.06],
    [0, 0.555, 0.14],
    [0, 0.57, 0.3],
  ];
  const hips = b.joint("hips", { parent: root, at: SP[0], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain("spine", catmull(SP), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });
  const chest = spine.joints[3];
  const NECK_TOP: V3 = [0, 0.8, 0.46];
  const neck = b.chain("neck", catmull([SP[3], [0, 0.69, 0.4], NECK_TOP]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: NECK_TOP, dir: [0, 0, 1], role: "head" });
  const hp = (f: number, u: number, l = 0) => head.local({ forward: f * H, up: u * H, left: l * H });

  const jaw = b.joint("jaw", { parent: head, at: hp(0.06, -0.075, 0), aim: hp(0.2, -0.073, 0), role: "jaw" });
  const earJ: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    earJ[side] = b.joint(`ear${side}`, {
      parent: head,
      at: hp(0.0, 0.087, s * 0.075),
      dir: [s * 0.3, 1, -0.1],
      role: "hinge",
    });
  }

  // ---------------------------------------------------------------- the shrine plinth and scenery
  b.lathe(
    [
      [0, 0],
      [PR, 0],
      [PR, 0.045],
      [PR - 0.1, 0.062],
      [PR - 0.1, F],
      [0, F],
    ],
    { at: [0, 0, 0], bone: root, segments: 20, color: STONE },
  );
  const ringPath = (r: number, y: number, n = 20) =>
    catmull(
      Array.from({ length: n }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, y, Math.sin((i / n) * Math.PI * 2) * r]),
      { closed: true },
    );
  b.sweep(ringPath(PR - 0.16, F + 0.006), 0.01, { color: GOLD, bone: root, sides: 5 });
  b.sweep(ringPath(PR - 0.05, 0.046, 20), 0.007, { color: GOLD, bone: root, sides: 5 });

  glow(
    b.part(new THREE.CircleGeometry(0.76 * SC, 36), "#ffffff", {
      bone: root,
      at: [0, F + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: MAGIC,
    }),
    0.55,
  );

  // small stone lanterns, uniformly scaled
  const S = 0.7;
  const lantern = (x: number, z: number) => {
    const sc = (pts: number[][]) => pts.map(([r, y]) => [r * S, y * S]);
    b.lathe(
      sc([
        [0, 0],
        [0.085, 0],
        [0.085, 0.025],
        [0.045, 0.04],
        [0.045, 0.19],
        [0.085, 0.205],
        [0.088, 0.23],
        [0, 0.23],
      ]) as any,
      { at: [x, F, z], bone: root, segments: 6, color: STONE },
    );
    b.part(new THREE.BoxGeometry(0.12 * S, 0.12 * S, 0.12 * S), STONE, { bone: root, at: [x, F + 0.29 * S, z] });
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.075 * S, 0.09 * S), "#ffffff", {
          bone: root,
          at: [x + dx * 0.0615 * S, F + 0.29 * S, z + dz * 0.0615 * S],
          dir: [dx, 0, dz],
          axis: "z",
          texture: WINDOWTEX,
        }),
        1.3,
      );
    }
    b.lathe(
      sc([
        [0, 0],
        [0.165, 0],
        [0.15, 0.022],
        [0.07, 0.085],
        [0.035, 0.12],
        [0, 0.13],
      ]) as any,
      { at: [x, F + 0.35 * S, z], bone: root, segments: 6, color: STONE },
    );
    b.part(new THREE.SphereGeometry(0.02 * S, 8, 6), GOLD, { bone: root, at: [x, F + 0.5 * S, z] });
  };
  lantern(0.48, -0.5);
  lantern(-0.48, -0.5);

  // rocks
  for (const [x, z, r] of [
    [-0.64, -0.4, 0.075],
    [0.7, -0.48, 0.06],
    [-0.5, 0.62, 0.05],
    [0.46, 0.68, 0.045],
  ]) {
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: root,
      at: [x * SC, F + r * 0.35, z * SC],
      scale: [r, r * 0.7, r * 0.9],
      flat: true,
      rotation: [R() * 40, R() * 360, R() * 40],
    });
  }

  // grass in small clusters
  const grassFrames: any[] = [];
  for (const ca of [0.3, 1.0, 2.1, 2.9, 3.9, 4.6, 5.5]) {
    for (let k = 0; k < 3; k++) {
      const a = ca + (R() - 0.5) * 0.18;
      const rr = (0.62 + R() * 0.17) * SC;
      grassFrames.push(frame([Math.cos(a) * rr, F, Math.sin(a) * rr], [0, 1, 0]));
    }
  }
  b.cards(grassFrames, GRASSTEX, { size: [0.08, 0.14], cross: true, vary: 0.35, spin: 180, rng: R, bone: root });

  // fallen sakura petals
  const petalFrames = Array.from({ length: 28 }, () => {
    const a = R() * Math.PI * 2;
    const rr = (0.15 + R() * 0.62) * SC;
    return frame([Math.cos(a) * rr, F + 0.009, Math.sin(a) * rr], [0, 1, 0]);
  });
  b.cards(petalFrames, PETALTEX, {
    size: 0.05,
    lean: 90,
    flow: [1, 0, 0],
    mirror: true,
    spin: 180,
    vary: 0.3,
    rng: R,
    bone: root,
  });

  // ---------------------------------------------------------------- body (lean, tucked toward the hips)
  const tuck = (t: number) => 0.16 * Math.max(0, 1 - t / 0.6);
  const bodyRy = (t: number) => (0.13 + 0.045 * t + 0.02 * Math.sin(Math.PI * t)) * 0.88;
  const body = b.sweep(
    spine,
    (t) => [0.108 + 0.028 * Math.sin(Math.PI * t), bodyRy(t) * (1 - tuck(t))],
    {
      color: BODY,
      extend: [0.04, 0.0],
      shift: (t: number) => [0, bodyRy(t) * tuck(t) * 0.5],
    },
  );
  ellipsoid([0, 0.5, 0.29], [0.11, 0.15, 0.12], WHITE, spine.joints[2]);
  ellipsoid([0, 0.545, -0.39], [0.092, 0.095, 0.092], WHITE, hips);

  const neckTube = b.sweep(neck, [0.088, 0.066], { color: WHITE });

  // flank markings
  for (const s of [1, -1]) {
    b.decal(body, FLANKMARK, {
      at: [s * 0.13, 0.56, -0.02],
      dir: [s, 0, 0],
      size: [0.17, 0.17],
      mirror: s < 0,
      segments: 12,
    });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fz = s > 0 ? 0.37 : 0.33; // left forepaw staggered forward
    const fp = limb([s * 0.105, 0.5, 0.25], [s * 0.105, F + 0.03, fz], [0.23, 0.2], [[0, 0, -1]]);
    const fl = b.chain(`foreLeg${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.05, 0.038, 0.029], { color: SOCKS });
    ellipsoid([s * 0.095, 0.5, 0.235], [0.06, 0.1, 0.085], WHITE, spine.joints[2]);
    const fpaw = fl.joints[2];
    ellipsoid([s * 0.105, F + 0.029, fz + 0.015], [0.04, 0.03, 0.06], INDIGO, fpaw);
    for (const dx of [-1, 0, 1])
      ellipsoid(
        [s * 0.105 + dx * 0.02, F + 0.02, fz + 0.065 - Math.abs(dx) * 0.008],
        [0.013, 0.011, 0.015],
        INDIGO,
        fpaw,
        [6, 4],
      );
    blade(0.08, 0.05, [s * 0.1, 0.43, 0.22], [0, -0.35, -1], [1, 0, 0], WHITE, fl.joints[1], 0.016);

    // hind leg (digitigrade)
    const hpts = limb([s * 0.11, 0.5, -0.26], [s * 0.11, F + 0.03, -0.3], [0.2, 0.2, 0.16], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hl = b.chain(`hindLeg${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.06, 0.042, 0.03, 0.026], { color: SOCKS });
    ellipsoid([s * 0.1, 0.52, -0.255], [0.07, 0.12, 0.12], WHITE, hl.joints[0]);
    const hpaw = hl.joints[3];
    ellipsoid([s * 0.11, F + 0.029, -0.285], [0.04, 0.03, 0.06], INDIGO, hpaw);
    for (const dx of [-1, 0, 1])
      ellipsoid(
        [s * 0.11 + dx * 0.02, F + 0.02, -0.232 - Math.abs(dx) * 0.006],
        [0.013, 0.011, 0.015],
        INDIGO,
        hpaw,
        [6, 4],
      );
  }

  // ---------------------------------------------------------------- head (one continuous wedge)
  const SKC = hp(0.06, 0.05, 0);
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), WHITE, {
    bone: head,
    at: SKC,
    scale: [0.112 * H, 0.087 * H, 0.12 * H],
  });
  // jowls sunk into the skull-to-muzzle transition
  const jowls: any[] = [];
  for (const s of [1, -1])
    jowls.push(ellipsoid(hp(0.05, -0.035, s * 0.055), [0.04 * H, 0.04 * H, 0.05 * H], WHITE, head));

  // muzzle: broad, raised root tapering to the nose
  b.sweep([hp(0.085, -0.025), hp(0.2, -0.045)], (t) => [(0.065 - 0.038 * t) * H, (0.044 - 0.023 * t) * H], {
    bone: head,
    color: WHITE,
    sides: 10,
  });
  ellipsoid(hp(0.215, -0.043), [0.026 * H, 0.02 * H, 0.022 * H], INK, head, [8, 6]);
  // narrow lower jaw tucked under the muzzle
  b.sweep([jaw.at, hp(0.2, -0.073)], (t) => [(0.034 - 0.022 * t) * H, (0.02 - 0.01 * t) * H], {
    bone: jaw,
    color: WHITE,
    sides: 8,
  });
  // mouth seam
  for (const s of [1, -1])
    b.rod(hp(0.19, -0.052, s * 0.027), hp(0.1, -0.05, s * 0.054), 0.0025 * H, INK, { bone: head, sides: 4 });
  // short tapered whiskers
  for (const s of [1, -1])
    for (const k of [0, 1]) {
      b.spike(hp(0.17, -0.05 - 0.008 * k, s * 0.03), hp(0.15 - 0.012 * k, -0.05 - 0.022 * k, s * 0.095), null, 0.0028, {
        bone: head,
        color: "#eae6f7",
        sides: 4,
      });
    }

  // eyes and markings
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(SKC).at(s * 36, 8);
    if (hit)
      b.decal(skin, EYE, {
        at: hit,
        dir: [s * 0.3, 0, 1],
        size: [0.076 * H, 0.043 * H],
        mirror: s > 0,
        roll: s * 4,
        bone: head,
      });
  }
  const cheekSkin = b.surface([skull, ...jowls]);
  for (const s of [1, -1]) {
    const hit = cheekSkin.around(SKC).at(s * 62, -14);
    if (hit)
      b.decal(cheekSkin, CHEEKMARK, {
        at: hit,
        size: [0.085 * H, 0.054 * H],
        mirror: s > 0,
        bone: head,
      });
  }
  const foreHit = skin.around(SKC).at(0, 32);
  if (foreHit) b.decal(skin, FOREMARK, { at: foreHit, dir: [0, 0.35, 1], size: [0.04 * H, 0.064 * H], bone: head });

  // gold crescent crown
  const crownHit = skin.around(SKC).at(0, 60);
  if (crownHit) {
    const pl = planeY([0, 1, -0.55], [1, 0, 0]);
    const outline: Pt[] = [];
    const n = 6;
    const r1 = 0.05 * H;
    const r2 = 0.042 * H;
    const off = 0.012 * H;
    for (let i = 0; i <= n; i++) {
      const a = ((-80 + (160 * i) / n) * Math.PI) / 180;
      outline.push([r1 * Math.sin(a), -r1 * Math.cos(a)]);
    }
    for (let i = n; i >= 0; i--) {
      const a = ((-80 + (160 * i) / n) * Math.PI) / 180;
      outline.push([r2 * Math.sin(a), off - r2 * Math.cos(a)]);
    }
    b.extrude(outline, {
      at: offset(crownHit, pl.y, 0.034 * H),
      x: pl.x,
      y: pl.y,
      thickness: 0.014 * H,
      bevel: 0.003,
      color: GOLD,
      bone: head,
    });
    b.part(new THREE.OctahedronGeometry(0.014 * H), RED, {
      bone: head,
      at: offset(crownHit, [0, 0.5, 1], 0.012 * H),
    });
  }

  // ears: solid wedge shells (deep at the base, tapering to the tip), openings turned inward ~10 degrees
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ej = earJ[side];
    const pl = planeY([s * 0.3, 1, -0.1], [s, 0, 0.18]);
    const base = hp(0.0, 0.087, s * 0.075);
    const outer: Pt[] = [
      [-0.055 * H, 0],
      [0.055 * H, 0],
      [0.045 * H, 0.07 * H],
      [0.012 * H, 0.2 * H, "sharp"],
      [-0.028 * H, 0.1 * H],
    ];
    const earPaint = paint((_p, _n, c) => (c[1] > 0.14 * H ? INDIGO : WHITE));
    b.extrude(outer, {
      at: base,
      x: pl.x,
      y: pl.y,
      thickness: [0.034 * H, 0.004 * H],
      color: earPaint,
      bone: ej,
    });
    const inner: Pt[] = [
      [-0.034 * H, 0.012 * H],
      [0.034 * H, 0.012 * H],
      [0.026 * H, 0.07 * H],
      [0.008 * H, 0.15 * H, "sharp"],
      [-0.018 * H, 0.085 * H],
    ];
    b.extrude(inner, {
      at: offset(base, [0, 0, 1], 0.005 * H),
      x: pl.x,
      y: pl.y,
      thickness: [0.025 * H, 0.0046 * H],
      color: PINK,
      bone: ej,
    });
    // earring
    const ear = hp(0.01, 0.02, s * 0.105);
    b.part(new THREE.SphereGeometry(0.016 * H, 8, 6), GOLD, { bone: head, at: ear });
    tassel(offset(ear, [0, -1, 0], 0.02), head, 0.07);
  }

  // small swept forelock lying against the crown
  for (const k of [-1, 0, 1]) {
    blade(
      0.07 * H,
      0.07 * H,
      hp(0.075, 0.125, k * 0.024),
      [k * 0.2, -0.15, -1],
      [1, 0, 0],
      k === 0 ? LAV : WHITE,
      head,
      0.02,
    );
  }
  // cheek ruff: short, tapered, swept back, rooted inside the jowls
  for (const s of [1, -1])
    for (const k of [0, 1, 2]) {
      blade(
        0.11 * H,
        0.06 * H,
        hp(0.015 - 0.012 * k, -0.02 - 0.024 * k, s * (0.07 + 0.004 * k)),
        [s * 0.4, -0.2 - 0.12 * k, -1],
        [0, 1, 0],
        k === 1 ? LAV : WHITE,
        head,
        0.022,
        [-s, 0, 0],
      );
    }

  // ---------------------------------------------------------------- chest bib (one hanging mass, two side tufts) and neck tufts
  ellipsoid([0, 0.55, 0.4], [0.085, 0.13, 0.07], WHITE, chest);
  blade(0.2, 0.11, [0, 0.62, 0.44], [0, -1, 0.12], [1, 0, 0], WHITE, chest, 0.03, [0, 0, 1]);
  for (const s of [1, -1])
    blade(0.13, 0.065, [s * 0.055, 0.6, 0.43], [s * 0.35, -1, 0.0], [1, 0, 0], LAV, chest, 0.022, [0, 0, 1]);
  for (const s of [1, -1])
    for (const k of [0, 1])
      blade(
        0.11,
        0.06,
        [s * 0.05, 0.74 - 0.06 * k, 0.43],
        [s * 0.4, -0.6, -0.5],
        [0, 1, 0],
        k ? LAV : WHITE,
        neck.joints[1],
        0.02,
        [s, 0, 0],
      );

  // ---------------------------------------------------------------- shimenawa collar, bell, shide
  const nj = neck.joints[1];
  const neckSurf = b.surface(neckTube);
  const ropeC = new THREE.Vector3().copy(neck.at(0.62).at);
  const ropePath = neckSurf.loop(neck.at(0.62), { lift: 0.012 });
  b.sweep(ropePath, 0.019, { color: "#e8d28e", sides: 6 });
  const samples: THREE.Vector3[] = [];
  for (let k = 0; k < 72; k++) {
    const q = ropePath.at(k / 72);
    samples.push(new THREE.Vector3(q.x, q.y, q.z));
  }
  const front = samples.reduce((m, q) => (q.z > m.z ? q : m), samples[0]);
  // suspension loop pierces the rope; the bell's top overlaps the loop's bottom by 2.5 mm
  const loopC = new THREE.Vector3(front.x, front.y - 0.02, front.z + 0.016);
  b.part(new THREE.TorusGeometry(0.011, 0.0032, 5, 8), GOLD, {
    bone: nj,
    at: [loopC.x, loopC.y, loopC.z],
    rotation: [0, 35, 0],
  });
  const bellR = 0.028;
  const loopBottom = loopC.y - 0.011 - 0.0032;
  const bell = new THREE.Vector3(loopC.x, loopBottom + 0.0025 - bellR, loopC.z);
  b.part(new THREE.SphereGeometry(bellR, 9, 7), GOLD, { bone: nj, at: [bell.x, bell.y, bell.z] });
  b.part(new THREE.BoxGeometry(0.026, 0.004, 0.004), INK, { bone: nj, at: [bell.x, bell.y - 0.012, bell.z + 0.026] });
  tassel(new THREE.Vector3(bell.x, bell.y - 0.026, bell.z), nj, 0.06);
  // zigzag paper shide: the top extends into its rope knot
  const shide: Pt[] = [
    [-0.018, 0.012],
    [0.018, 0.012],
    [0.018, -0.04],
    [0.03, -0.06],
    [0.014, -0.08],
    [0.03, -0.1],
    [0.0, -0.13],
    [-0.03, -0.1],
    [-0.014, -0.08],
    [-0.03, -0.06],
    [-0.018, -0.04],
  ];
  for (const s of [1, -1]) {
    let pick: THREE.Vector3 | null = null;
    for (const q of samples) {
      if (q.z <= ropeC.z) continue;
      if (!pick || Math.abs(q.x - s * 0.05) < Math.abs(pick.x - s * 0.05)) pick = q;
    }
    if (!pick) continue;
    const knot = new THREE.Vector3(pick.x, pick.y, pick.z + 0.017);
    b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { bone: nj, at: [knot.x, knot.y, knot.z] });
    b.extrude(shide, {
      at: [knot.x, knot.y, knot.z + 0.002],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      color: "#ffffff",
      bone: nj,
    });
  }

  // ---------------------------------------------------------------- nine tails
  const tuftOn = (sw: any, chain: any, t: number, ang: number, len: number, color: any) => {
    const sp = sw.at(t, ang);
    const nn = new THREE.Vector3(sp.n.x, sp.n.y, sp.n.z);
    const tn = new THREE.Vector3(sp.tangent.x, sp.tangent.y, sp.tangent.z);
    const dir = tn.clone().addScaledVector(nn, 0.12);
    const hint = nn.clone().cross(tn);
    const base = new THREE.Vector3(sp.at.x, sp.at.y, sp.at.z).addScaledVector(nn, -0.025);
    return blade(
      len,
      len * 0.5,
      base,
      [dir.x, dir.y, dir.z],
      [hint.x, hint.y, hint.z],
      color,
      chain.jointAt(t),
      0.012,
      [nn.x, nn.y, nn.z],
      0.1,
    );
  };

  // deliberate per-tail gestures: run, depths (back from P0) at the three bends, lateral bends (share of length)
  const TAILS = [
    { run: 0.12, z: [0.1, 0.05, 0.01], bend: [0.03, 0.05, -0.06] },
    { run: 0.15, z: [0.18, 0.16, 0.14], bend: [0.05, 0.09, 0.0] },
    { run: 0.18, z: [0.2, 0.22, 0.24], bend: [0.03, 0.07, 0.1] },
    { run: 0.12, z: [0.15, 0.14, 0.1], bend: [0.04, 0.02, 0.06] },
    { run: 0.15, z: [0.22, 0.28, 0.3], bend: [0.02, 0.05, 0.0] },
    { run: 0.18, z: [0.24, 0.2, 0.17], bend: [0.05, 0.0, 0.07] },
    { run: 0.12, z: [0.14, 0.2, 0.26], bend: [0.04, 0.08, 0.03] },
    { run: 0.15, z: [0.2, 0.14, 0.12], bend: [0.07, 0.03, 0.09] },
    { run: 0.12, z: [0.1, 0.05, 0.01], bend: [0.04, 0.02, -0.07] },
  ];
  const K1 = [0.36, 0.33, 0.4, 0.35, 0.38, 0.32, 0.39, 0.34, 0.37];
  const K2 = [0.7, 0.66, 0.74, 0.68, 0.72, 0.65, 0.73, 0.69, 0.71];

  for (let i = 0; i < 9; i++) {
    const T = TAILS[i];
    const d = (i - 4) / 4;
    const a = d * 1.3;
    const sg = d < 0 ? -1 : 1;
    const L = 0.7 + 0.1 * (1 - Math.abs(d));
    const u = [Math.sin(a), Math.cos(a)];
    const w = [Math.cos(a) * sg, -Math.sin(a) * sg];
    const P0: V3 = [d * 0.035, 0.56 + 0.012 * (i % 2), -0.37];
    const P1: V3 = [P0[0] + d * 0.03, P0[1] + 0.02, P0[2] - T.run];
    const at = (k: number, bend: number, zBack: number): V3 => [
      P1[0] + u[0] * k * L + w[0] * bend * L,
      P1[1] + u[1] * k * L + w[1] * bend * L,
      P0[2] - zBack,
    ];
    const path = catmull([
      P0,
      P1,
      at(K1[i], T.bend[0], T.z[0]),
      at(K2[i], T.bend[1], T.z[1]),
      at(0.97, T.bend[2], T.z[2]),
    ]);
    const chain = b.chain(`tailChain${i + 1}`, path, {
      parent: hips,
      names: (j: number) => `tail${i + 1}_${j + 1}`,
      role: "tail",
    });
    const lit = gradient(
      gradient("#fffaf1", "#e8e0ff", path.at(0.3), path.at(0.7)),
      "#c0f0ff",
      path.at(0.74),
      path.at(1),
    );
    const shade = gradient(
      gradient("#e0d9f4", "#cdc3f2", path.at(0.3), path.at(0.7)),
      "#a8dff2",
      path.at(0.74),
      path.at(1),
    );
    const tipPaint = cel(lit, shade);
    const scale = 0.94 + 0.08 * (1 - Math.abs(d));
    const ts = b.sweep(chain, [0.028, 0.055, 0.078, 0.072, 0.044, 0.0].map((r) => r * scale), {
      color: tipPaint,
      sides: 9,
    });
    // snug gold band following this tail's own surface
    const band = b.surface(ts).loop(chain.at(0.38), { lift: 0.002 });
    b.sweep(band, 0.0055, { color: GOLD, sides: 5 });
    // a few short, near-tangent fur tufts
    tuftOn(ts, chain, 0.4, 60, 0.11, tipPaint);
    tuftOn(ts, chain, 0.52, -60, 0.11, tipPaint);
    tuftOn(ts, chain, 0.64, 20, 0.1, tipPaint);
    tuftOn(ts, chain, 0.74, -25, 0.09, tipPaint);
    // spirit flame seated over the last ~2.7 cm of the tail
    const fb = path.at(1 - 0.027 / path.length);
    const tg = path.tangentAt(1);
    flame(
      [fb.x, fb.y, fb.z],
      0.2,
      0.075,
      i % 2,
      chain.joints[chain.joints.length - 1],
      [tg.x * 0.7, tg.z * 0.5],
    );
  }

  // ---------------------------------------------------------------- floating foxfire (clean negative space)
  const orbs: { p: V3; h: number; w: number }[] = [
    { p: [-0.7, 0.5, 0.46], h: 0.2, w: 0.06 },
    { p: [-0.38, 0.3, 0.62], h: 0.15, w: 0.05 },
  ];
  orbs.forEach((o, i) => {
    glow(b.part(new THREE.IcosahedronGeometry(0.04, 1), "#d9fbff", { bone: root, at: o.p, flat: true }), 1.7);
    flame([o.p[0], o.p[1] + 0.02, o.p[2]], o.h, o.w, (i + 1) % 2, root, [0.25, 0.1]);
  });
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.45 + R() * 0.4;
    const col = i % 2 ? "#aef4ff" : "#d6c4ff";
    glow(
      b.part(new THREE.OctahedronGeometry(0.012 + R() * 0.008), col, {
        bone: root,
        at: [Math.cos(a) * rr, 0.35 + R() * 1.0, Math.sin(a) * rr],
        rotation: [R() * 90, R() * 90, 0],
      }),
      1.5,
    );
  }

  return b.root;
}
```