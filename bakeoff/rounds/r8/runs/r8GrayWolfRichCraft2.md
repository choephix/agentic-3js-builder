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
} from "agentic-3js-builder";
import type { PointInput, ColorInput, Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frostwolf Sentinel",
  description:
    "A chunky Warcraft-style gray wolf standing alert on a snowy rock outcrop, with a notched ear, a ruffed mane, a Frostwolf clan banner, a glowing rune stone and ice crystals.",
};

type V = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];
type Vec = THREE.Vector3 | V;

const toV = (v: Vec) => (Array.isArray(v) ? new THREE.Vector3(v[0], v[1], v[2]) : v.clone());
const scaleOutline = (o: Pt[], k: number): Pt[] =>
  o.map((p) => (p.length === 3 ? ([p[0] * k, p[1] * k, "sharp"] as Pt) : ([p[0] * k, p[1] * k] as Pt)));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const TUFT_G = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#34363f"/><stop offset=".55" stop-color="#7b7f88"/><stop offset="1" stop-color="#d4d8db"/>
    </linearGradient></defs>
    <path d="M16 1 C20 18 31 40 30 64 L2 64 C1 40 12 18 16 1Z" fill="url(#g)" stroke="#23252c" stroke-width="1.4"/>
    <path d="M16 10 L16 60 M9 32 L11 60 M23 32 L21 60" stroke="#23252c" stroke-opacity=".45" stroke-width="1.1" fill="none"/>
  </svg>`,
  { size: 128 },
);

const TUFT_C = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#7f7868"/><stop offset=".6" stop-color="#d3ccb8"/><stop offset="1" stop-color="#f7f2e2"/>
    </linearGradient></defs>
    <path d="M16 1 C21 18 31 42 30 64 L2 64 C1 42 11 18 16 1Z" fill="url(#g)" stroke="#5a5446" stroke-width="1.3"/>
    <path d="M16 12 L16 60 M10 34 L11 60 M22 34 L21 60" stroke="#5a5446" stroke-opacity=".4" stroke-width="1.1" fill="none"/>
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
  const P = (x: number, y: number, z: number): V => [x, y + FLOOR, z];

  // ---- palette
  const G_DARK = "#33353e";
  const G_MID = "#6d727b";
  const G_LIGHT = "#b4b8bb";
  const FAWN = "#9c8461";
  const CREAM = "#e0d9c6";
  const CLAW = "#2a2420";
  const NOSE = "#15110f";
  const GOLD = "#e1ae3a";
  const WOOD = grain("#4d3019", "#85582f", { size: 0.02, axis: "y", seed: 3 });
  const ROCK = patches("#262c3a", ["#48526a", "#394156", "#5b6682"], { size: 0.14, gap: 0.09, seed: 2 });
  const SNOW = mottle("#f6f9ff", "#cddff2", { size: 0.2, seed: 5 });

  // ---- fur paint, shared by body, legs, tail and head so the coat runs on across the model
  const q = new THREE.Vector3();
  const FUR = paint((p, n) => {
    const big = noise(p, 0.25, 3);
    const streak = noise(q.set(p.x * 5, p.y * 1.5, p.z), 0.05, 9);
    let c = mix(G_MID, G_LIGHT, smoothstep(0.3, 0.8, big) * 0.65 + streak * 0.35);
    const saddle = smoothstep(0.3, 0.8, n.y) * smoothstep(0.38, 0.62, noise(p, 0.14, 5));
    c = mix(c, G_DARK, saddle * 0.85);
    c = mix(c, FAWN, smoothstep(0.55, 0.22, p.y - FLOOR) * 0.55);
    c = mix(c, CREAM, smoothstep(-0.05, -0.75, n.y) * 0.8);
    c = mix(c, "#9db4d8", smoothstep(0.1, -0.9, n.y) * 0.18);
    const snow = smoothstep(0.82, 0.97, n.y) * smoothstep(0.52, 0.72, noise(p, 0.1, 21));
    return mix(c, "#f2f7ff", snow * 0.9);
  });

  // ---- cached blade colours (root to tip)
  const bladePaints = new Map<string, ColorInput>();
  const bladeColor = (root: string, tip: string, len: number): ColorInput => {
    const key = `${root}${tip}${len.toFixed(2)}`;
    let c = bladePaints.get(key);
    if (!c) {
      c = paint((_p, _n, s) => mix(root, tip, smoothstep(0, len, s[1])));
      bladePaints.set(key, c);
    }
    return c;
  };

  // A flat fur blade standing on `at`, growing along `along`, widening toward `side`.
  const blade = (o: {
    at: PointInput;
    along: Vec;
    side?: Vec;
    len: number;
    w: number;
    root: string;
    tip: string;
    bone?: Joint;
    thick?: number;
  }) => {
    const a = toV(o.along).normalize();
    const s = o.side ? toV(o.side) : new THREE.Vector3(1, 0, 0);
    s.addScaledVector(a, -s.dot(a));
    if (s.lengthSq() < 1e-5) s.set(0, 1, 0).addScaledVector(a, -a.y);
    s.normalize();
    const { len: L, w: W } = o;
    const outline: Pt[] = [
      [-W / 2, 0],
      [W / 2, 0],
      [W * 0.34, L * 0.55],
      [0, L, "sharp"],
      [-W * 0.34, L * 0.55],
    ];
    return b.extrude(outline, {
      at: o.at,
      x: [s.x, s.y, s.z],
      y: [a.x, a.y, a.z],
      thickness: o.thick ?? 0.012,
      bevel: 0.003,
      color: bladeColor(o.root, o.tip, L),
      bone: o.bone,
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
    (t: number): [number, number] => [
      0.17 + 0.04 * t,
      0.19 - 0.02 * Math.sin(Math.PI * t) + 0.06 * Math.pow(t, 2.2),
    ],
    { color: FUR, shift: (t: number): [number, number] => [0, -0.05 * smoothstep(0.4, 1, t)] },
  );
  const neckSweep = b.sweep(neck, [0.2, 0.172, 0.148], { color: FUR });
  const TAILC = gradient(FUR, "#26272e", tailPath.at(0.66), tailPath.at(1));
  const tailSweep = b.sweep(tail, [0.06, 0.1, 0.118, 0.092, 0.03], { color: TAILC });

  const blob = (at: PointInput, r: V, color: ColorInput, bone: Joint) =>
    b.part(new THREE.SphereGeometry(1, 9, 6), color, { at, bone, scale: r, flat: true });

  // ---------------------------------------------------------------------------------------------------------------
  // Legs and paws

  const paw = (bone: Joint, x: number, z: number) => {
    blob(P(x, 0.04, z + 0.04), [0.062, 0.046, 0.098], FUR, bone);
    for (const dx of [-0.038, 0, 0.038]) {
      b.part(new THREE.SphereGeometry(1, 6, 5), FUR, {
        bone,
        at: P(x + dx, 0.034, z + 0.125),
        scale: [0.032, 0.03, 0.045],
        flat: true,
      });
      b.part(new THREE.ConeGeometry(0.011, 0.05, 5), CLAW, {
        bone,
        at: P(x + dx, 0.02, z + 0.172),
        dir: [0, -0.4, 1],
      });
    }
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // front leg
    const fpts = limb(P(s * 0.15, 0.66, 0.4), P(s * 0.16, 0.05, 0.47), [0.27, 0.27, 0.17], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const fleg = b.chain(`foreLeg${L}`, fpts, {
      parent: lastSpine,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`],
      role: "leg",
      contact: P(s * 0.16, 0, 0.52),
    });
    b.sweep(fleg, [0.095, 0.078, 0.058, 0.05], { color: FUR });
    blob(P(s * 0.175, 0.7, 0.4), [0.125, 0.17, 0.2], FUR, fleg.joints[0]);
    paw(fleg.tip ?? fleg.joints[3], s * 0.16, 0.47);
    // elbow fur and wrist fur
    blade({ at: fleg.joints[1], along: [s * 0.15, -0.5, -1], len: 0.17, w: 0.08, root: "#6d727b", tip: "#c9ccce", bone: fleg.joints[1] });
    blade({ at: fleg.joints[1], along: [s * 0.4, -0.8, -0.7], len: 0.13, w: 0.07, root: "#5d6169", tip: "#b4b8bb", bone: fleg.joints[1] });

    // hind leg
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
    blob(P(s * 0.17, 0.66, -0.4), [0.125, 0.21, 0.22], FUR, hleg.joints[0]);
    paw(hleg.tip ?? hleg.joints[3], s * 0.15, -0.52);
    blade({ at: hleg.joints[2], along: [s * 0.1, -0.35, -1], len: 0.13, w: 0.07, root: "#6d727b", tip: "#c9ccce", bone: hleg.joints[2] });
    blade({ at: hleg.joints[0], along: [s * 0.3, -0.6, -0.8], len: 0.16, w: 0.09, root: "#6d727b", tip: "#d6d9da", bone: hleg.joints[0] });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head

  const HEADP = hp(0, 0, 0);
  const eyeP = [1, -1].map((s) => hp(s * 0.084, 0.044, 0.13));
  const browP = eyeP.map((e) => e.clone().add(new THREE.Vector3(0, 0.05, 0.01)));
  const HEAD_FUR = paint((p, n) => {
    let c = FUR.at(p, n);
    const dz = p.z - HEADP.z;
    const dy = p.y - HEADP.y;
    const muz = smoothstep(0.08, 0.2, dz) * smoothstep(0.55, -0.1, n.y);
    c = mix(c, "#ddd6c4", muz * 0.85);
    c = mix(
      c,
      "#d2cbb9",
      smoothstep(0.06, 0.1, Math.abs(p.x)) * smoothstep(0.08, -0.02, dz) * smoothstep(0.02, -0.06, dy) * 0.8,
    );
    c = mix(
      c,
      "#4a463f",
      smoothstep(0.05, 0.02, Math.abs(p.x)) * smoothstep(0.05, 0.12, dz) * smoothstep(0.4, 0.8, n.y) * 0.7,
    );
    for (const e of eyeP) c = mix(c, "#24212a", smoothstep(0.066, 0.032, p.distanceTo(e)) * 0.85);
    for (const e of browP) c = mix(c, "#efe9d8", smoothstep(0.03, 0.012, p.distanceTo(e)) * 0.9);
    if (dz > 0.18 && dz < 0.36 && n.y < 0.5 && cells(p, 0.022, 4).d1 < 0.13) c = mix(c, "#2a2623", 0.8);
    return c;
  });

  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), HEAD_FUR, {
    bone: head,
    at: hp(0, 0.01, 0.02),
    scale: [0.135, 0.12, 0.15],
    flat: true,
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD_FUR, {
      bone: head,
      at: hp(s * 0.1, -0.045, 0.03),
      scale: [0.05, 0.07, 0.085],
      flat: true,
    });
  b.frustumBox(hp(0, -0.015, 0.1), hp(0, -0.045, 0.4), [0.17, 0.15], [0.1, 0.085], {
    color: HEAD_FUR,
    bone: head,
  });
  // nose leather
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: hp(0, -0.012, 0.405),
    scale: [0.05, 0.034, 0.036],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#6a6672", {
    bone: head,
    at: hp(0.012, 0.008, 0.425),
    scale: [0.014, 0.008, 0.01],
  });
  // mouth interior and jaw
  b.part(new THREE.BoxGeometry(0.08, 0.03, 0.24), "#3a1018", { bone: head, at: hp(0, -0.085, 0.22) });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.075, 0.06),
    aim: hp(0, -0.108, 0.37),
    role: "jaw",
    group: "head",
  });
  b.frustumBox(hp(0, -0.11, 0.09), hp(0, -0.108, 0.37), [0.13, 0.045], [0.075, 0.04], {
    color: HEAD_FUR,
    bone: jaw,
  });
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.2), "#c4566a", { bone: jaw, at: hp(0, -0.09, 0.2) });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.014, 0.06, 6), "#f2ecd8", { bone: head, at: hp(s * 0.04, -0.105, 0.37), dir: [0, -1, 0] });
    b.part(new THREE.ConeGeometry(0.012, 0.05, 6), "#f2ecd8", { bone: jaw, at: hp(s * 0.036, -0.085, 0.36), dir: [0, 1, 0] });
    for (const z of [0.3, 0.26, 0.22])
      b.part(new THREE.ConeGeometry(0.008, 0.026, 5), "#efe8d2", {
        bone: head,
        at: hp(s * 0.048, -0.093, z),
        dir: [0, -1, 0],
      });
  }
  for (const dx of [-0.02, 0, 0.02])
    b.part(new THREE.ConeGeometry(0.006, 0.02, 5), "#efe8d2", { bone: head, at: hp(dx, -0.09, 0.4), dir: [0, -1, 0] });
  // chin tuft
  blade({ at: hp(0, -0.13, 0.28), along: [0, -0.6, -0.6], len: 0.09, w: 0.05, root: "#c9c2b0", tip: "#f2ecd8", bone: jaw });

  // eyes, brows
  for (const s of [1, -1]) {
    const eye = b.decal(skull, EYE, {
      at: hp(s * 0.084, 0.044, 0.13),
      dir: [s * 0.62, 0.28, 0.73],
      size: [0.088, 0.056],
      mirror: s > 0,
      segments: 8,
    });
    glow(eye, 0.55);
    b.part(new THREE.BoxGeometry(0.09, 0.024, 0.06), "#3b3d45", {
      bone: head,
      at: hp(s * 0.086, 0.066, 0.123),
      rotation: [0, s * 40, s * 20],
    });
  }

  // ears (the left one is notched)
  const EARO: Pt[] = [[-0.062, 0], [0.062, 0], [0.05, 0.1], [0.02, 0.19], [0, 0.225, "sharp"], [-0.02, 0.19], [-0.05, 0.1]];
  const EARN: Pt[] = [[-0.062, 0], [0.062, 0], [0.05, 0.1], [0.04, 0.13], [0.022, 0.15], [0.03, 0.185], [0, 0.225, "sharp"], [-0.02, 0.19], [-0.05, 0.1]];
  const EK = 1.25;
  for (const s of [1, -1]) {
    const ex: V = [1, 0, 0];
    const ey: V = [s * 0.22, 1, 0.18];
    const normal = new THREE.Vector3(...ex).cross(new THREE.Vector3(...ey)).normalize();
    const base = hp(s * 0.085, 0.085, -0.02);
    const outline = scaleOutline(s > 0 ? EARN : EARO, EK);
    b.extrude(outline, {
      at: base,
      x: ex,
      y: ey,
      thickness: 0.024,
      bevel: 0.004,
      color: paint((_p, _n, c) => (c[1] > 0.17 * EK ? "#2a2a31" : FUR)),
      bone: head,
    });
    b.extrude(scaleOutline(EARO, EK * 0.6), {
      at: base.clone().addScaledVector(normal, 0.012).add(new THREE.Vector3(0, 0.014, 0)),
      x: ex,
      y: ey,
      thickness: 0.012,
      color: paint((_p, _n, c) => mix("#e9dfc8", "#8a7f6c", smoothstep(0, 0.14, c[1]))),
      bone: head,
    });
  }

  // cheek ruff
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      blade({
        at: hp(s * (0.108 + 0.004 * i), -0.012 - i * 0.032, 0.0),
        along: [s * 0.7, -0.15 - 0.12 * i, -0.7],
        side: [0, 1, 0],
        len: 0.13 - 0.01 * i,
        w: 0.065,
        root: i % 2 ? "#a9a49a" : "#8b8f95",
        tip: i % 2 ? "#f2ecd8" : "#d7dadb",
        bone: head,
      });

  // ---------------------------------------------------------------------------------------------------------------
  // Fur details: mane ring, back ridge, tail fur, tuft cards

  const nf = neck.at(0.3);
  const ntan = nf.tangent.clone();
  b.ring(nf, { count: 11, radius: 0.15, tilt: -50 }, (it) => {
    const a = it.axis.clone();
    const side = new THREE.Vector3().crossVectors(a, ntan).normalize();
    const k = it.i % 2;
    blade({
      at: it,
      along: a,
      side,
      len: k ? 0.2 : 0.25,
      w: 0.1,
      root: "#565a63",
      tip: k ? "#c9ccce" : "#e6e8e8",
    });
  });

  const ridge = (sw: typeof bodySweep, ts: number[], len: number, w: number) =>
    ts.forEach((t, i) => {
      const f = sw.at(t, 0);
      const dir = f.n.clone().multiplyScalar(0.75).addScaledVector(f.tangent, -0.8);
      blade({ at: f, along: dir, side: [1, 0, 0], len: len * (0.85 + 0.3 * ((i * 7) % 3) / 2), w, root: "#2f3139", tip: "#8a8e96" });
    });
  ridge(neckSweep, [0.2, 0.45, 0.7, 0.92], 0.17, 0.08);
  ridge(bodySweep, [0.15, 0.35, 0.55, 0.75, 0.92], 0.15, 0.09);

  for (const t of [0.22, 0.42, 0.62, 0.8])
    for (const ang of [70, -70, 180]) {
      const f = tailSweep.at(t, ang);
      const dir = f.n.clone().multiplyScalar(0.6).addScaledVector(f.tangent, 0.9);
      blade({
        at: f,
        along: dir,
        side: [1, 0, 0],
        len: 0.13,
        w: 0.075,
        root: ang === 180 ? "#8a8470" : "#5d6169",
        tip: ang === 180 ? "#ede6d2" : "#b4b8bb",
      });
    }

  const ruffHits = b.surface(neckSweep).scatter(60, { rng: rng(11), minDist: 0.04, filter: (h) => h.n.y > -0.3 });
  b.cards(ruffHits, [TUFT_G, TUFT_G, TUFT_C], {
    size: [0.075, 0.15],
    lean: 70,
    flow: [0, -0.25, -1],
    bend: 25,
    vary: 0.25,
    rng: rng(12),
  });
  const bodyHits = b
    .surface(bodySweep)
    .scatter(46, { rng: rng(13), minDist: 0.05, filter: (h) => h.at.z > 0.2 && h.n.y > -0.6 });
  b.cards(bodyHits, [TUFT_G, TUFT_C, TUFT_C], {
    size: [0.07, 0.14],
    lean: 75,
    flow: [0, -0.5, -1],
    bend: 25,
    vary: 0.3,
    rng: rng(14),
  });
  const tailHits = b.surface(tailSweep).scatter(24, { rng: rng(15), minDist: 0.05 });
  b.cards(tailHits, [TUFT_G, TUFT_C], {
    size: [0.07, 0.13],
    lean: 70,
    flow: [0, -0.4, -1],
    bend: 20,
    vary: 0.3,
    rng: rng(16),
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Setting: snowy rock outcrop

  const OUT: [number, number][] = [
    [-0.5, 1.2], [0, 1.36], [0.5, 1.22], [0.64, 0.7], [0.6, 0.0], [0.67, -0.7],
    [0.5, -1.2], [0, -1.34], [-0.55, -1.18], [-0.67, -0.6], [-0.58, 0.1], [-0.65, 0.8],
  ];
  b.extrude(OUT, { at: [0, 0.05, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, bevel: 0.012, color: ROCK, bone: hips });
  b.extrude(
    OUT.map(([x, z]) => [x * 0.94, z * 0.94] as [number, number]),
    { at: [0, 0.1175, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.035, bevel: 0.012, color: SNOW, bone: hips },
  );
  // rim stones with snow caps
  OUT.forEach(([x, z], i) => {
    const r = 0.06 + R() * 0.06;
    b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
      bone: hips,
      at: [x * 0.97, 0.08, z * 0.97],
      scale: [r * 1.2, r * 0.8, r],
      rotation: [R() * 60, R() * 360, R() * 40],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), SNOW, {
      bone: hips,
      at: [x * 0.88, FLOOR - 0.005, z * 0.88],
      scale: [r * (1.4 + (i % 3) * 0.2), r * 0.45, r * 1.1],
      flat: true,
    });
  });

  // pine sapling at the rear left
  const pineX = 0.4;
  const pineZ = -0.9;
  b.rod([pineX, FLOOR - 0.01, pineZ], [pineX, FLOOR + 0.2, pineZ], 0.03, { color: WOOD, bone: hips });
  for (let i = 0; i < 3; i++) {
    const y0 = FLOOR + 0.1 + i * 0.17;
    const r = 0.2 - 0.045 * i;
    b.part(new THREE.ConeGeometry(r, 0.3, 7), i % 2 ? "#245a43" : "#1b4a38", {
      bone: hips,
      at: [pineX, y0 + 0.15, pineZ],
      flat: true,
    });
    b.part(new THREE.ConeGeometry(r * 0.8, 0.24, 7), "#f1f6ff", {
      bone: hips,
      at: [pineX, y0 + 0.2, pineZ],
      flat: true,
    });
  }

  // Frostwolf banner at the rear right
  const bx = -0.42;
  const bz = -0.72;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
      bone: hips,
      at: [bx + Math.cos(a) * 0.06, FLOOR + 0.02, bz + Math.sin(a) * 0.06],
      scale: [0.06, 0.05, 0.06],
      rotation: [i * 30, i * 70, 0],
      flat: true,
    });
  }
  b.rod([bx, FLOOR, bz], [bx, FLOOR + 1.02, bz], 0.02, { color: WOOD, bone: hips });
  b.rod([bx - 0.21, FLOOR + 0.96, bz], [bx + 0.21, FLOOR + 0.96, bz], 0.014, { color: WOOD, bone: hips });
  b.part(new THREE.ConeGeometry(0.03, 0.14, 6), GOLD, { bone: hips, at: [bx, FLOOR + 1.1, bz], flat: true });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.024, 7, 5), GOLD, { bone: hips, at: [bx + s * 0.22, FLOOR + 0.96, bz], flat: true });
  for (const dz of [0.003, -0.003]) {
    const f = dz > 0 ? 1 : -1;
    b.part(new THREE.PlaneGeometry(0.36, 0.54), "#ffffff", {
      bone: hips,
      at: [bx, FLOOR + 0.68, bz + dz],
      dir: [0.12 * f, 0, f],
      axis: "z",
      texture: EMBLEM,
    });
  }
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.014, 0.07, 5), GOLD, {
      bone: hips,
      at: [bx + s * 0.16, FLOOR + 0.35, bz],
      dir: [0, -1, 0],
    });

  // rune stone, front left (low, so the wolf's front stays clear)
  const sx: V = [0.97, 0, 0.26];
  const sy: V = [0, 1, -0.1];
  const sn = new THREE.Vector3(...sx).cross(new THREE.Vector3(...sy)).normalize();
  const stoneAt = new THREE.Vector3(0.4, FLOOR - 0.01, 0.8);
  b.extrude(
    [[-0.16, 0], [0.16, 0], [0.19, 0.14], [0.13, 0.3], [0.02, 0.36], [-0.1, 0.31], [-0.18, 0.17]],
    { at: stoneAt, x: sx, y: sy, thickness: 0.1, bevel: 0.015, color: ROCK, bone: hips },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone: hips,
      at: stoneAt.clone().add(new THREE.Vector3(0, 0.19, 0)).addScaledVector(sn, 0.056),
      dir: sn,
      axis: "z",
      texture: RUNE,
    }),
    1.3,
  );

  // ice crystals, front right
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
  crystal(-0.42, 0.72, 0.38, 0.05, [-0.12, 1, 0.08], "#62d4ff");
  crystal(-0.5, 0.66, 0.26, 0.04, [-0.45, 1, 0.1], "#8ae6ff");
  crystal(-0.34, 0.8, 0.22, 0.035, [0.35, 1, 0.25], "#46b8f0");
  crystal(-0.46, 0.84, 0.16, 0.03, [-0.2, 1, 0.55], "#a6f0ff");
  crystal(-0.36, 0.64, 0.14, 0.028, [0.3, 1, -0.3], "#62d4ff");
  b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
    bone: hips,
    at: [-0.42, FLOOR, 0.74],
    scale: [0.14, 0.05, 0.12],
    flat: true,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Rest pose touches

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
```