1. **Head silhouette:** Ears are rescaled with separate x/y factors (1.31 wide, 0.81 tall, about 0.18 m exposed) and their bases lowered to `hp(±0.085, 0.075, -0.02)`. The skull is now `[0.15, 0.13, 0.155]`. The muzzle is a six-sided tapered sweep ending at 0.34 m, with the nose and fangs moved to match.
2. **Eyes and expression:** Brows are tapered extruded wedges (0.075 × 0.016 × 0.035) seated above the eyes. The `EYE` decal is reprojected at `hp(±0.105, 0.045, 0.105)` with normals `[±0.7, 0.15, 0.7]` and glow 0.2. Cheek tufts moved down and back, the jaw pose is gone, and a short, raised lower jaw leaves an ~8 mm dark seam. The tongue and teeth are removed except two small canines.
3. **Anatomy and legs:** Shoulder and haunch blobs moved to x ±0.135 with the smaller radii. The chest is deeper (about [0.235, 0.27]) behind a belly tuck. Forelegs use your explicit control points, hind-leg IK and hocks are kept, and the paws are scaled 1.15×.
4. **Fur clumps:** `blade` now makes 1–3-tip clumps as tapered wedges (26 mm to 4 mm thick) with roots recessed 20 mm. The mane ring is 0.11–0.15 m, aimed backward, and the back ridge is 0.075 m lying along the coat. Card counts are 24 / 14 / 10, placed on the neck's rear edge, chest underside and tail. `TUFT_G`/`TUFT_C` are now outline-free three-tip gradients.
5. **Banner and base:** Banner is one double-sided card with two crossbar loops, gold cords to the cones, and a pole that runs into the spearhead. Rim stones only rotate about Y and are lifted, so nothing sinks below y = 0 by more than a few millimetres.
6. **Composition:** `OUT` is scaled 0.9 in x and 0.8 in z. The pine is removed, the rune stone and crystals are about 65% height, and the banner is 75% scale, set behind and clear of the haunch.
7. **Coat:** `FUR` has a continuous charcoal saddle, cool gray flanks, a connected pale throat and chest, fawn only on the lower legs, no snow patches and minimal streak. `HEAD_FUR` has gray cheeks carrying into the muzzle with a soft cream transition. Blade roots match the surface beneath them, and pale tips are kept to a few large ruff clumps.

```ts
import * as THREE from "three";
import {
  createBuilder,
  limb,
  catmull,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  gradient,
  patches,
  mottle,
  grain,
  cells,
  svg,
  frame,
  toPoint,
} from "agentic-3js-builder";
import type { PointInput, ColorInput, Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frostwolf Sentinel",
  description:
    "A chunky Warcraft-style gray wolf standing alert on a small snowy rock outcrop, with a notched ear, a flowing ruff, a Frostwolf clan banner, a glowing rune stone and ice crystals.",
};

type V = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];
type Vec = THREE.Vector3 | V;

const toV = (v: Vec) => (Array.isArray(v) ? new THREE.Vector3(v[0], v[1], v[2]) : v.clone());
const boneOf = (at: unknown): Joint | undefined => (at as { bone?: Joint | null }).bone ?? undefined;
const scaleOutline = (o: Pt[], kx: number, ky: number = kx): Pt[] =>
  o.map((p) => (p.length === 3 ? ([p[0] * kx, p[1] * ky, "sharp"] as Pt) : ([p[0] * kx, p[1] * ky] as Pt)));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const CLUMP = "M2 64 C2 44 6 26 10 6 C13 24 15 34 18 28 C19 20 21 12 24 0 C27 14 29 22 31 30 C34 26 36 16 38 8 C42 28 46 46 46 64 Z";

const TUFT_G = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#3a3d45"/><stop offset=".6" stop-color="#6c727c"/><stop offset="1" stop-color="#9aa0a8"/>
    </linearGradient></defs>
    <path d="${CLUMP}" fill="url(#g)"/>
  </svg>`,
  { size: 128 },
);

const TUFT_C = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#a8a392"/><stop offset=".6" stop-color="#d6cfbc"/><stop offset="1" stop-color="#f1ecdc"/>
    </linearGradient></defs>
    <path d="${CLUMP}" fill="url(#g)"/>
  </svg>`,
  { size: 128 },
);

const EYE = svg(
  `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="c"><path d="M7 14 Q38 4 73 33 Q40 46 7 14Z"/></clipPath></defs>
    <path d="M2 12 Q38 -5 78 34 Q40 52 2 12Z" fill="#120b06"/>
    <g clip-path="url(#c)">
      <rect width="80" height="50" fill="#f0a818"/>
      <ellipse cx="42" cy="30" rx="22" ry="20" fill="#ffd44a"/>
      <rect y="0" width="80" height="20" fill="#b8620c" opacity=".75"/>
      <circle cx="43" cy="27" r="9.5" fill="#0a0604"/>
      <circle cx="37" cy="21" r="3.4" fill="#ffffff"/>
      <circle cx="49" cy="33" r="1.6" fill="#fff3c0"/>
    </g>
    <path d="M2 12 Q38 -5 78 34" stroke="#0a0604" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H97V147L50 120L3 147Z" fill="#17407a" stroke="#e1ae3a" stroke-width="5" stroke-linejoin="round"/>
    <path d="M11 11H89V132L50 110L11 132Z" fill="none" stroke="#7fb4ea" stroke-width="2.4"/>
    <circle cx="50" cy="60" r="32" fill="#2a63aa" stroke="#e1ae3a" stroke-width="3.2"/>
    <path d="M27 30 L40 44 Q50 41 60 44 L73 30 L77 58 Q75 74 62 82 L55 95 Q50 99 45 95 L38 82 Q25 74 23 58 Z" fill="#eef3fa" stroke="#0d2144" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M31 57 L44 62 L33 67Z M69 57 L56 62 L67 67Z" fill="#59d8ff" stroke="#0d2144" stroke-width="1.4"/>
    <path d="M45 86 L55 86 L50 93Z" fill="#0d2144"/>
    <path d="M50 68 V84" stroke="#0d2144" stroke-width="2.6"/>
    <path d="M14 126 l7 -7 l7 7 l-7 7z M72 126 l7 -7 l7 7 l-7 7z" fill="#e1ae3a"/>
    <path d="M38 118 h24" stroke="#e1ae3a" stroke-width="3"/>
  </svg>`,
  { size: 320 },
);

const RUNE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="none" stroke="#8defff" stroke-width="4"/>
    <circle cx="50" cy="50" r="33" fill="none" stroke="#3fb8e8" stroke-width="2.4" stroke-dasharray="3 5"/>
    <path d="M38 24 V78 M38 42 L64 26 M38 60 L64 44" stroke="#c8f8ff" stroke-width="7" stroke-linecap="round" fill="none"/>
    <circle cx="68" cy="68" r="3.4" fill="#8defff"/>
    <circle cx="30" cy="30" r="2.6" fill="#8defff"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "frostwolf" });
  const R = rng(42);
  const FLOOR = 0.13; // top of the snow cap: the paws stand here
  const OZ = 0.04; // base is nudged forward so head and tail balance over it
  const P = (x: number, y: number, z: number): V => [x, y + FLOOR, z];

  // ---- palette
  const G_DARK = "#3a3d45";
  const G_MID = "#6c727c";
  const G_LIGHT = "#9aa0a8";
  const FAWN = "#9a8462";
  const CREAM = "#ddd6c3";
  const CLAW = "#2a2420";
  const NOSE = "#15110f";
  const GOLD = "#e1ae3a";
  const WOOD = grain("#4d3019", "#85582f", { size: 0.02, axis: "y", seed: 3 });
  const ROCK = patches("#262c3a", ["#48526a", "#394156", "#5b6682"], { size: 0.14, gap: 0.09, seed: 2 });
  const SNOW = mottle("#f6f9ff", "#cddff2", { size: 0.2, seed: 5 });

  // ---- fur paint: deliberate colour masses shared by body, legs, tail and head
  const q = new THREE.Vector3();
  const FUR = paint((p, n) => {
    const h = p.y - FLOOR;
    const big = noise(p, 0.3, 3);
    const streak = noise(q.set(p.x * 5, p.y * 1.5, p.z), 0.05, 9);
    let c = mix("#666c76", "#7b818b", big * 0.7 + streak * 0.08);
    // charcoal saddle: continuous along the back and upper neck
    const edge = n.y + (noise(p, 0.12, 5) - 0.5) * 0.3;
    c = mix(c, G_DARK, smoothstep(0.3, 0.72, edge) * smoothstep(0.42, 0.6, h) * 0.92);
    // warm fawn only low on the legs
    c = mix(c, FAWN, smoothstep(0.4, 0.16, h) * 0.75);
    // pale underside, throat and chest as one connected region
    const under = smoothstep(0.0, -0.55, n.y) * smoothstep(-0.2, 0.25, p.z);
    const front = smoothstep(0.15, 0.55, n.z - 0.4 * n.y) * smoothstep(0.42, 0.62, h) * smoothstep(0.2, 0.4, p.z);
    c = mix(c, CREAM, Math.max(under, front) * 0.9);
    // cool ambient from below
    return mix(c, "#6a7690", smoothstep(0.1, -0.9, n.y) * 0.1);
  });

  // ---- blade clumps: wedge-section fur clumps with 1–3 tips, roots recessed into the coat
  const bladePaints = new Map<string, ColorInput>();
  const bladeColor = (root: string, tip: string, len: number): ColorInput => {
    const key = `${root}${tip}${len.toFixed(3)}`;
    let c = bladePaints.get(key);
    if (!c) {
      c = paint((_p, _n, s) => mix(root, tip, smoothstep(0.01, len, s[1])));
      bladePaints.set(key, c);
    }
    return c;
  };
  const bladeOutline = (L: number, W: number, tips: 1 | 2 | 3): Pt[] => {
    if (tips === 3)
      return [
        [-W / 2, 0], [W / 2, 0], [W * 0.5, L * 0.35], [W / 3, L * 0.82, "sharp"], [W / 6, L * 0.5],
        [0, L, "sharp"], [-W / 6, L * 0.55], [-W / 3, L * 0.88, "sharp"], [-W * 0.5, L * 0.35],
      ];
    if (tips === 2)
      return [
        [-W / 2, 0], [W / 2, 0], [W * 0.46, L * 0.4], [W / 4, L, "sharp"], [0, L * 0.52],
        [-W / 4, L * 0.86, "sharp"], [-W * 0.46, L * 0.4],
      ];
    return [[-W / 2, 0], [W / 2, 0], [W * 0.34, L * 0.55], [0, L, "sharp"], [-W * 0.34, L * 0.55]];
  };

  const blade = (o: {
    at: PointInput;
    along: Vec;
    side?: Vec;
    len: number;
    w: number;
    root: string;
    tip: string;
    bone?: Joint;
    tips?: 1 | 2 | 3;
    sink?: number;
  }) => {
    const a = toV(o.along).normalize();
    const s = o.side ? toV(o.side) : new THREE.Vector3(1, 0, 0);
    s.addScaledVector(a, -s.dot(a));
    if (s.lengthSq() < 1e-5) s.set(0, 1, 0).addScaledVector(a, -a.y);
    s.normalize();
    const sink = o.sink ?? 0.02;
    const L = o.len + sink;
    const base = toPoint(o.at).clone().addScaledVector(a, -sink);
    return b.extrude(bladeOutline(L, o.w, o.tips ?? 1), {
      at: base,
      x: [s.x, s.y, s.z],
      y: [a.x, a.y, a.z],
      thickness: [0.026, 0.004],
      color: bladeColor(o.root, o.tip, L),
      bone: o.bone ?? boneOf(o.at),
    });
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton

  const hips = b.joint("hips", { at: P(0, 0.74, -0.42), dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([P(0, 0.74, -0.42), P(0, 0.75, -0.12), P(0, 0.77, 0.2), P(0, 0.8, 0.48)]),
    { parent: hips, role: "spine" },
  );
  const lastSpine = spine.joints[spine.joints.length - 1];
  const neckPath = catmull([P(0, 0.84, 0.4), P(0, 0.95, 0.6), P(0, 1.07, 0.84)]);
  const neck = b.chain("neck", neckPath, { parent: lastSpine, role: "neck", count: 3 });
  const head = b.joint("head", {
    parent: neck,
    at: neckPath.at(1),
    dir: [0, -0.08, 1],
    role: "head",
    group: "head",
  });
  const hp = (x: number, y: number, z: number) =>
    new THREE.Vector3().copy(head.local({ left: x, up: y, forward: z }));

  const tailPath = catmull([P(0, 0.8, -0.5), P(0, 0.74, -0.78), P(0, 0.58, -1.0), P(0, 0.4, -1.13)]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail", count: 5 });

  // ---------------------------------------------------------------------------------------------------------------
  // Body, neck, tail

  const bodySweep = b.sweep(
    spine,
    (t: number): [number, number] => {
      const tuck = 0.035 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.05) / 0.5)));
      return [0.17 + 0.065 * smoothstep(0.3, 1, t), 0.19 - tuck + 0.08 * smoothstep(0.4, 1, t)];
    },
    { color: FUR, shift: (t: number): [number, number] => [0, -0.05 * smoothstep(0.4, 1, t)] },
  );
  const neckSweep = b.sweep(neck, [0.225, 0.19, 0.15], { color: FUR });
  const TAILC = gradient(FUR, "#26272e", tailPath.at(0.66), tailPath.at(1));
  const tailSweep = b.sweep(tail, [0.06, 0.1, 0.118, 0.092, 0.03], { color: TAILC });

  const blob = (at: PointInput, r: V, color: ColorInput, bone: Joint) =>
    b.part(new THREE.SphereGeometry(1, 9, 6), color, { at, bone, scale: r, flat: true });

  // ---------------------------------------------------------------------------------------------------------------
  // Legs and paws (paws enlarged 15%)

  const PK = 1.15;
  const paw = (bone: Joint, x: number, z: number) => {
    blob(P(x, 0.045, z + 0.045 * PK), [0.062 * PK, 0.046 * PK, 0.098 * PK], FUR, bone);
    for (const dx of [-0.038 * PK, 0, 0.038 * PK]) {
      b.part(new THREE.SphereGeometry(1, 6, 5), FUR, {
        bone,
        at: P(x + dx, 0.038, z + 0.14 * PK),
        scale: [0.032 * PK, 0.03 * PK, 0.045 * PK],
        flat: true,
      });
      b.part(new THREE.ConeGeometry(0.011 * PK, 0.05 * PK, 5), CLAW, {
        bone,
        at: P(x + dx, 0.024, z + 0.19 * PK),
        dir: [0, -0.4, 1],
      });
    }
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // front leg: nearly upright
    const fpts = [P(s * 0.15, 0.68, 0.4), P(s * 0.16, 0.4, 0.38), P(s * 0.16, 0.1, 0.47), P(s * 0.16, 0.05, 0.49)];
    const fleg = b.chain(`foreLeg${L}`, fpts, {
      parent: lastSpine,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`],
      role: "leg",
      contact: P(s * 0.16, 0, 0.52),
    });
    b.sweep(fleg, [0.095, 0.072, 0.055, 0.05], { color: FUR });
    blob(P(s * 0.135, 0.7, 0.4), [0.105, 0.18, 0.145], FUR, fleg.joints[0]);
    paw(fleg.tip ?? fleg.joints[3], s * 0.16, 0.49);
    blade({
      at: fleg.joints[1],
      along: [s * 0.15, -0.35, -1],
      len: 0.1,
      w: 0.08,
      root: "#6c727c",
      tip: "#a2a8af",
      bone: fleg.joints[1],
      tips: 2,
    });

    // hind leg: angular hock
    const hpts = limb(P(s * 0.15, 0.68, -0.38), P(s * 0.15, 0.05, -0.52), [0.31, 0.3, 0.24], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hleg = b.chain(`hindLeg${L}`, hpts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `hock${L}`, `foot${L}`],
      role: "leg",
      contact: P(s * 0.15, 0, -0.47),
    });
    b.sweep(hleg, [0.115, 0.088, 0.058, 0.05], { color: FUR });
    blob(P(s * 0.135, 0.66, -0.4), [0.11, 0.2, 0.17], FUR, hleg.joints[0]);
    paw(hleg.tip ?? hleg.joints[3], s * 0.15, -0.52);
    blade({
      at: hleg.joints[2],
      along: [s * 0.1, -0.3, -1],
      len: 0.1,
      w: 0.07,
      root: "#7b7766",
      tip: "#b2ae9e",
      bone: hleg.joints[2],
      tips: 2,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head

  const HEADP = hp(0, 0, 0);
  const eyeP = [1, -1].map((s) => hp(s * 0.105, 0.045, 0.105));
  const HEAD_FUR = paint((p, n) => {
    const dz = p.z - HEADP.z;
    let c = FUR.at(p, n);
    // gray cheeks carry into the muzzle root
    c = mix(c, "#858a92", smoothstep(0.0, 0.18, dz) * 0.55);
    // soft pale lips and muzzle sides toward the nose
    c = mix(c, "#cdc6b3", smoothstep(0.2, 0.34, dz) * smoothstep(0.35, -0.5, n.y) * 0.8);
    // jaw underside
    c = mix(c, CREAM, smoothstep(0.0, -0.6, n.y) * smoothstep(-0.05, 0.12, dz) * 0.9);
    // dark bridge
    c = mix(c, "#4a4d55", smoothstep(0.07, 0.015, Math.abs(p.x)) * smoothstep(0.05, 0.16, dz) * smoothstep(0.3, 0.8, n.y) * 0.75);
    // dark nose end
    c = mix(c, "#2a2623", smoothstep(0.32, 0.345, dz) * smoothstep(0.3, 0.8, n.z) * 0.6);
    for (const e of eyeP) c = mix(c, "#24212a", smoothstep(0.05, 0.027, p.distanceTo(e)) * 0.8);
    if (dz > 0.18 && dz < 0.32 && n.y < 0.5 && Math.abs(p.x - HEADP.x) > 0.015 && cells(p, 0.022, 4).d1 < 0.12)
      c = mix(c, "#33302d", 0.6);
    return c;
  });

  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), HEAD_FUR, {
    bone: head,
    at: hp(0, 0.01, 0.02),
    scale: [0.15, 0.13, 0.155],
    flat: true,
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD_FUR, {
      bone: head,
      at: hp(s * 0.11, -0.05, 0.02),
      scale: [0.055, 0.07, 0.09],
      flat: true,
    });

  // tapered six-sided muzzle: broad at the cheeks, narrower at the nose
  b.sweep(
    [hp(0, -0.015, 0.1), hp(0, -0.045, 0.34)],
    (t: number): [number, number] => [0.074 - 0.03 * t, 0.07 - 0.027 * t],
    { color: HEAD_FUR, bone: head, sides: 6, smooth: false, caps: "flat" },
  );
  // nose leather
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: hp(0, -0.012, 0.345),
    scale: [0.048, 0.034, 0.036],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#6a6672", {
    bone: head,
    at: hp(0.012, 0.008, 0.365),
    scale: [0.014, 0.008, 0.01],
  });
  // closed mouth: a dark seam between muzzle and a raised, shortened lower jaw
  b.part(new THREE.BoxGeometry(0.06, 0.014, 0.23), "#2b0f14", { bone: head, at: hp(0, -0.092, 0.215) });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.1, 0.06),
    aim: hp(0, -0.114, 0.325),
    role: "jaw",
    group: "head",
  });
  b.frustumBox(hp(0, -0.116, 0.09), hp(0, -0.112, 0.325), [0.12, 0.04], [0.07, 0.032], {
    color: HEAD_FUR,
    bone: jaw,
  });
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.009, 0.03, 5), "#f2ecd8", {
      bone: head,
      at: hp(s * 0.042, -0.1, 0.3),
      dir: [0, -1, 0],
    });
  blade({
    at: hp(0, -0.125, 0.2),
    along: [0, -0.5, -0.9],
    len: 0.07,
    w: 0.05,
    root: "#c9c2b0",
    tip: "#ece6d4",
    bone: jaw,
    tips: 2,
  });

  // eyes and sculpted brows
  for (const s of [1, -1]) {
    const eye = b.decal(skull, EYE, {
      at: hp(s * 0.105, 0.045, 0.105),
      dir: [s * 0.7, 0.15, 0.7],
      size: [0.1, 0.064],
      mirror: s > 0,
      segments: 10,
    });
    glow(eye, 0.2);
    b.extrude(
      [
        [-0.0375, 0],
        [0.0375, 0],
        [0.0375, 0.016],
        [-0.0375, 0.006],
      ],
      {
        at: hp(s * 0.098, 0.074, 0.1),
        x: [s, 0, -0.35],
        y: [0, 1, 0],
        thickness: 0.035,
        color: "#3a3d45",
        bone: head,
      },
    );
  }

  // ears: compact, broad, left one notched
  const EARO: Pt[] = [[-0.062, 0], [0.062, 0], [0.05, 0.1], [0.02, 0.19], [0, 0.225, "sharp"], [-0.02, 0.19], [-0.05, 0.1]];
  const EARN: Pt[] = [[-0.062, 0], [0.062, 0], [0.05, 0.1], [0.04, 0.13], [0.022, 0.15], [0.03, 0.185], [0, 0.225, "sharp"], [-0.02, 0.19], [-0.05, 0.1]];
  const EKX = 1.25 * 1.05;
  const EKY = 1.25 * 0.65;
  for (const s of [1, -1]) {
    const ex: V = [1, 0, 0];
    const ey: V = [s * 0.26, 1, 0.1];
    const normal = new THREE.Vector3(...ex).cross(new THREE.Vector3(...ey)).normalize();
    const base = hp(s * 0.085, 0.075, -0.02);
    b.extrude(scaleOutline(s > 0 ? EARN : EARO, EKX, EKY), {
      at: base,
      x: ex,
      y: ey,
      thickness: 0.024,
      bevel: 0.004,
      color: paint((_p, _n, c) => (c[1] > 0.135 ? "#2a2a31" : FUR)),
      bone: head,
    });
    b.extrude(scaleOutline(EARO, EKX * 0.6, EKY * 0.6), {
      at: base.clone().addScaledVector(normal, 0.012).add(new THREE.Vector3(0, 0.014, 0)),
      x: ex,
      y: ey,
      thickness: 0.012,
      color: paint((_p, _n, c) => mix("#e9dfc8", "#8a7f6c", smoothstep(0, 0.12, c[1]))),
      bone: head,
    });
  }

  // cheek ruff: moved down and back, clear of the eyes
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      blade({
        at: hp(s * (0.108 + 0.004 * i), -0.04 - i * 0.032, -0.03),
        along: [s * 0.7, -0.15 - 0.12 * i, -0.7],
        side: [0, 1, 0],
        len: 0.1 - 0.008 * i,
        w: 0.075,
        root: "#7e848c",
        tip: i === 0 ? "#b9bdc2" : "#a4a9af",
        bone: head,
        tips: 2,
      });

  // ---------------------------------------------------------------------------------------------------------------
  // Fur clumps: ruff, back ridge, tail

  const nf = neck.at(0.3);
  const ntan = nf.tangent.clone();
  b.ring(nf, { count: 11, radius: 0.185, tilt: 0 }, (it) => {
    const out = it.axis.clone();
    const along = out.clone().multiplyScalar(0.45).addScaledVector(ntan, -0.9);
    const side = new THREE.Vector3().crossVectors(out, ntan).normalize();
    const big = it.i % 3 === 0;
    const root = out.y > 0.45 ? G_DARK : out.y < -0.35 ? "#b3ae9c" : G_MID;
    const tip = out.y > 0.45 ? "#4a4d55" : out.y < -0.35 ? "#eee8d6" : big ? "#b4b9bf" : "#858b94";
    blade({ at: it, along, side, len: big ? 0.15 : 0.11, w: 0.13, root, tip, tips: 3 });
  });

  const ridge = (sw: typeof bodySweep, ts: number[]) =>
    ts.forEach((t) => {
      const f = sw.at(t, 0);
      const dir = f.n.clone().multiplyScalar(0.3).addScaledVector(f.tangent, -1);
      blade({ at: f, along: dir, side: [1, 0, 0], len: 0.075, w: 0.12, root: G_DARK, tip: "#575b64", tips: 3 });
    });
  ridge(neckSweep, [0.3, 0.65]);
  ridge(bodySweep, [0.2, 0.5, 0.8]);

  for (const t of [0.25, 0.48, 0.68, 0.86])
    for (const ang of [75, -75, 180]) {
      const f = tailSweep.at(t, ang);
      const dir = f.n.clone().multiplyScalar(0.45).addScaledVector(f.tangent, 0.9);
      const under = ang === 180;
      const dark = t > 0.6;
      blade({
        at: f,
        along: dir,
        side: [1, 0, 0],
        len: 0.14,
        w: 0.1,
        tips: 3,
        root: under ? "#b3ae9c" : dark ? "#4a4d55" : "#686d76",
        tip: under ? "#e2dccb" : dark ? "#2a2c33" : "#9aa0a8",
      });
    }

  const ruffHits = b
    .surface(neckSweep)
    .scatter(24, { rng: rng(11), minDist: 0.05, filter: (h) => h.at.z < 0.74 && (h.n.y < -0.1 || h.at.z < 0.6) });
  b.cards(ruffHits, [TUFT_G, TUFT_G, TUFT_C], {
    size: [0.1, 0.13],
    lean: 70,
    flow: [0, -0.25, -1],
    bend: 25,
    vary: 0.25,
    rng: rng(12),
  });
  const chestHits = b
    .surface(bodySweep)
    .scatter(14, { rng: rng(13), minDist: 0.07, filter: (h) => h.at.z > 0.25 && h.n.y < -0.35 });
  b.cards(chestHits, TUFT_C, {
    size: [0.1, 0.13],
    lean: 75,
    flow: [0, -0.5, -1],
    bend: 25,
    vary: 0.25,
    rng: rng(14),
  });
  const tailHits = b.surface(tailSweep).scatter(10, { rng: rng(15), minDist: 0.08 });
  b.cards(tailHits, [TUFT_G, TUFT_G, TUFT_C], {
    size: [0.1, 0.14],
    lean: 70,
    flow: [0, -0.4, -1],
    bend: 20,
    vary: 0.25,
    rng: rng(16),
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Setting: compact snowy rock outcrop

  const OUT0: [number, number][] = [
    [-0.5, 1.2], [0, 1.36], [0.5, 1.22], [0.64, 0.7], [0.6, 0.0], [0.67, -0.7],
    [0.5, -1.2], [0, -1.34], [-0.55, -1.18], [-0.67, -0.6], [-0.58, 0.1], [-0.65, 0.8],
  ];
  const OUT = OUT0.map(([x, z]) => [x * 0.9, z * 0.8] as [number, number]);
  b.extrude(OUT, { at: [0, 0.05, OZ], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, bevel: 0.012, color: ROCK, bone: hips });
  b.extrude(
    OUT.map(([x, z]) => [x * 0.94, z * 0.94] as [number, number]),
    { at: [0, 0.1175, OZ], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.035, bevel: 0.012, color: SNOW, bone: hips },
  );
  // rim stones (only spun about Y and lifted so nothing dips below the floor) with snow caps
  OUT.forEach(([x, z], i) => {
    const r = 0.055 + R() * 0.04;
    b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
      bone: hips,
      at: [x * 0.97, 0.075, z * 0.97 + OZ],
      scale: [r * 1.2, r * 0.8, r],
      rotation: [0, R() * 360, 0],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), SNOW, {
      bone: hips,
      at: [x * 0.88, FLOOR - 0.005, z * 0.88 + OZ],
      scale: [r * (1.4 + (i % 3) * 0.2), r * 0.45, r * 1.1],
      flat: true,
    });
  });

  // Frostwolf banner: 75% size, behind and beside the haunch
  const bx = -0.44;
  const bz = -0.66;
  const barY = FLOOR + 0.72;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
      bone: hips,
      at: [bx + Math.cos(a) * 0.05, FLOOR + 0.015, bz + Math.sin(a) * 0.05],
      scale: [0.05, 0.04, 0.05],
      rotation: [0, i * 70, 0],
      flat: true,
    });
  }
  // pole runs into the spearhead
  b.rod([bx, FLOOR, bz], [bx, FLOOR + 0.79, bz], 0.015, { color: WOOD, bone: hips });
  b.part(new THREE.ConeGeometry(0.0225, 0.105, 6), GOLD, { bone: hips, at: [bx, FLOOR + 0.8225, bz], flat: true });
  b.rod([bx - 0.158, barY, bz], [bx + 0.158, barY, bz], 0.011, { color: WOOD, bone: hips });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.018, 7, 5), GOLD, { bone: hips, at: [bx + s * 0.16, barY, bz], flat: true });
    // loops hold the cloth to the crossbar
    b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 10), GOLD, {
      bone: hips,
      at: [bx + s * 0.085, barY, bz],
      rotation: [0, 90, 0],
      flat: true,
    });
  }
  // one double-sided cloth card
  b.cards([frame([bx, FLOOR + 0.31, bz + 0.018], [0, 1, 0])], EMBLEM, {
    size: [0.27, 0.405],
    lean: 0,
    flow: [0, 0, -1],
    mirror: true,
    sink: 0,
    bone: hips,
  });
  // cords tie the gold tassel cones to the cloth corners
  for (const s of [1, -1]) {
    const cx = bx + s * 0.12;
    b.rod([cx, FLOOR + 0.322, bz + 0.018], [cx, FLOOR + 0.285, bz + 0.018], 0.0035, { color: GOLD, bone: hips });
    b.part(new THREE.ConeGeometry(0.012, 0.05, 5), GOLD, {
      bone: hips,
      at: [cx, FLOOR + 0.26, bz + 0.018],
      dir: [0, -1, 0],
      flat: true,
    });
  }

  // rune stone, front left (65% scale)
  const sx: V = [0.97, 0, 0.26];
  const sy: V = [0, 1, -0.1];
  const sn = new THREE.Vector3(...sx).cross(new THREE.Vector3(...sy)).normalize();
  const stoneAt = new THREE.Vector3(0.38, FLOOR - 0.01, 0.7);
  const STONE: Pt[] = [[-0.16, 0], [0.16, 0], [0.19, 0.14], [0.13, 0.3], [0.02, 0.36], [-0.1, 0.31], [-0.18, 0.17]];
  b.extrude(scaleOutline(STONE, 0.65), { at: stoneAt, x: sx, y: sy, thickness: 0.065, bevel: 0.01, color: ROCK, bone: hips });
  glow(
    b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
      bone: hips,
      at: stoneAt.clone().add(new THREE.Vector3(0, 0.125, 0)).addScaledVector(sn, 0.036),
      dir: sn,
      axis: "z",
      texture: RUNE,
    }),
    1.3,
  );

  // ice crystals, front right (65% height)
  const crystal = (x: number, z: number, h: number, r: number, lean: V, col: string) => {
    const dir = new THREE.Vector3(...lean).normalize();
    const base = new THREE.Vector3(x, FLOOR - 0.01, z);
    glow(
      b.part(new THREE.CylinderGeometry(r * 0.85, r, h * 0.7, 6), col, {
        bone: hips,
        at: base.clone().addScaledVector(dir, h * 0.35),
        dir: lean,
        flat: true,
      }),
      1.2,
    );
    glow(
      b.part(new THREE.ConeGeometry(r * 0.85, h * 0.35, 6), col, {
        bone: hips,
        at: base.clone().addScaledVector(dir, h * 0.7 + h * 0.175),
        dir: lean,
        flat: true,
      }),
      1.5,
    );
  };
  crystal(-0.36, 0.66, 0.247, 0.04, [-0.12, 1, 0.08], "#62d4ff");
  crystal(-0.43, 0.62, 0.17, 0.032, [-0.45, 1, 0.1], "#8ae6ff");
  crystal(-0.31, 0.74, 0.143, 0.03, [0.35, 1, 0.25], "#46b8f0");
  crystal(-0.4, 0.77, 0.104, 0.025, [-0.2, 1, 0.55], "#a6f0ff");
  crystal(-0.3, 0.6, 0.091, 0.023, [0.3, 1, -0.3], "#62d4ff");
  b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
    bone: hips,
    at: [-0.37, FLOOR - 0.005, 0.69],
    scale: [0.11, 0.04, 0.095],
    flat: true,
  });

  return b.root;
}
```