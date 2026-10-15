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
  cells,
  svg,
  toPoint,
} from "../../../../src/index";
import type { PointInput, ColorInput, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frostwolf Sentinel",
  description:
    "A chunky Warcraft-style gray wolf standing alert on a small snowy rock outcrop, with a notched ear, a layered ruff, a bushy tail, a glowing rune stone and ice crystals.",
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

const TUFT_C = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#a3a69c"/><stop offset=".6" stop-color="#cfd0c4"/><stop offset="1" stop-color="#eceee3"/>
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
  const FAWN = "#9a8462";
  const CREAM_COOL = "#d2d3c8";
  const CLAW = "#2a2420";
  const NOSE = "#15110f";
  const ROCK = patches("#262c3a", ["#48526a", "#394156", "#5b6682"], { size: 0.14, gap: 0.09, seed: 2 });
  const SNOW = mottle("#f6f9ff", "#cddff2", { size: 0.2, seed: 5 });

  // ---- fur paint: larger colour masses shared by body, legs, tail and head
  const q = new THREE.Vector3();
  const FUR = paint((p, n) => {
    const h = p.y - FLOOR;
    const big = noise(p, 0.3, 3);
    const streak = noise(q.set(p.x * 5, p.y * 1.5, p.z), 0.05, 9);
    let c = mix("#6b717b", "#81878f", big * 0.7 + streak * 0.03);
    // charcoal saddle: back, nape only
    const edge = n.y + (noise(p, 0.12, 5) - 0.5) * 0.25;
    c = mix(c, G_DARK, smoothstep(0.55, 0.9, edge) * smoothstep(0.55, 0.75, h) * 0.9);
    // faint warm tone low on the legs
    c = mix(c, FAWN, smoothstep(0.34, 0.12, h) * 0.3);
    // cool pale belly and throat
    const under = smoothstep(-0.1, -0.6, n.y) * smoothstep(-0.1, 0.3, p.z);
    // one connected chest marking: wide at the throat, tapering toward the belly
    const width = 0.03 + 0.13 * smoothstep(0.55, 0.95, h);
    const chest =
      smoothstep(width + 0.025, width - 0.025, Math.abs(p.x)) *
      smoothstep(0.05, 0.45, n.z - 0.3 * n.y) *
      smoothstep(0.5, 0.62, h) *
      smoothstep(0.18, 0.34, p.z);
    c = mix(c, CREAM_COOL, Math.max(under * 0.8, chest * 0.9));
    return mix(c, "#6a7690", smoothstep(0.1, -0.9, n.y) * 0.08);
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
    const sink = o.sink ?? 0.03;
    const L = o.len + sink;
    const base = toPoint(o.at).clone().addScaledVector(a, -sink);
    return b.extrude(bladeOutline(L, o.w, o.tips ?? 1), {
      at: base,
      x: [s.x, s.y, s.z],
      y: [a.x, a.y, a.z],
      thickness: [0.04, 0.006],
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
      const tuck = 0.05 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.05) / 0.5)));
      return [0.17 + 0.065 * smoothstep(0.3, 1, t), 0.19 - tuck + 0.055 * smoothstep(0.4, 1, t)];
    },
    { color: FUR, shift: (t: number): [number, number] => [0, -0.025 * smoothstep(0.4, 1, t)] },
  );
  const neckSweep = b.sweep(neck, [0.225, 0.19, 0.13], { color: FUR });
  const TAILC = gradient(FUR, "#26272e", tailPath.at(0.66), tailPath.at(1));
  const tailSweep = b.sweep(tail, [0.06, 0.1, 0.118, 0.092, 0.03], { color: TAILC });

  const blob = (at: PointInput, r: V, color: ColorInput, bone: Joint) =>
    b.part(new THREE.SphereGeometry(1, 9, 6), color, { at, bone, scale: r, flat: true });

  // withers: shoulder mass above and behind the foreleg roots
  for (const s of [1, -1]) blob(P(s * 0.07, 0.93, 0.3), [0.1, 0.075, 0.16], FUR, lastSpine);

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
    const fz = s > 0 ? 0.06 : -0.03; // forepaw stagger
    const hz = s > 0 ? 0.05 : -0.05; // hind paw stagger
    // front leg: nearly upright
    const fpts = [
      P(s * 0.15, 0.68, 0.4),
      P(s * 0.16, 0.4, 0.38 + fz * 0.4),
      P(s * 0.16, 0.1, 0.47 + fz),
      P(s * 0.16, 0.05, 0.49 + fz),
    ];
    const fleg = b.chain(`foreLeg${L}`, fpts, {
      parent: lastSpine,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`],
      role: "leg",
      contact: P(s * 0.16, 0, 0.52 + fz),
    });
    b.sweep(fleg, [0.088, 0.076, 0.064, 0.055, 0.05], { color: FUR });
    blob(P(s * 0.115, 0.7, 0.4), [0.1, 0.17, 0.14], FUR, fleg.joints[0]);
    paw(fleg.tip ?? fleg.joints[3], s * 0.16, 0.49 + fz);
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
    const hpts = limb(P(s * 0.15, 0.68, -0.38), P(s * 0.15, 0.05, -0.52 + hz), [0.31, 0.3, 0.24], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hleg = b.chain(`hindLeg${L}`, hpts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `hock${L}`, `foot${L}`],
      role: "leg",
      contact: P(s * 0.15, 0, -0.47 + hz),
    });
    b.sweep(hleg, [0.112, 0.1, 0.086, 0.07, 0.056, 0.05], { color: FUR });
    blob(P(s * 0.112, 0.67, -0.4), [0.105, 0.175, 0.16], FUR, hleg.joints[0]);
    paw(hleg.tip ?? hleg.joints[3], s * 0.15, -0.52 + hz);
    blade({
      at: hleg.joints[2],
      along: [s * 0.1, -0.3, -1],
      len: 0.1,
      w: 0.07,
      root: "#6c727c",
      tip: "#a9aeb4",
      bone: hleg.joints[2],
      tips: 2,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head

  const HEADP = hp(0, 0, 0);
  const eyeP = [1, -1].map((s) => hp(s * 0.115, 0.05, 0.11));
  const HEAD_FUR = paint((p, n) => {
    const dz = p.z - HEADP.z;
    let c = FUR.at(p, n);
    // gray cheeks carry into the muzzle root
    c = mix(c, "#858a92", smoothstep(0.0, 0.18, dz) * 0.55);
    // soft pale lips and muzzle sides toward the nose
    c = mix(c, "#cdcfc6", smoothstep(0.18, 0.3, dz) * smoothstep(0.35, -0.5, n.y) * 0.8);
    // jaw underside
    c = mix(c, CREAM_COOL, smoothstep(0.0, -0.6, n.y) * smoothstep(-0.05, 0.12, dz) * 0.9);
    // dark bridge
    c = mix(c, "#4a4d55", smoothstep(0.07, 0.015, Math.abs(p.x)) * smoothstep(0.05, 0.16, dz) * smoothstep(0.3, 0.8, n.y) * 0.75);
    // dark nose end
    c = mix(c, "#2a2623", smoothstep(0.27, 0.3, dz) * smoothstep(0.3, 0.8, n.z) * 0.6);
    for (const e of eyeP) c = mix(c, "#24212a", smoothstep(0.05, 0.027, p.distanceTo(e)) * 0.8);
    if (dz > 0.16 && dz < 0.28 && n.y < 0.5 && Math.abs(p.x - HEADP.x) > 0.015 && cells(p, 0.022, 4).d1 < 0.12)
      c = mix(c, "#33302d", 0.6);
    return c;
  });

  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), HEAD_FUR, {
    bone: head,
    at: hp(0, 0.01, 0.02),
    scale: [0.175, 0.145, 0.17],
    flat: true,
  });
  // cheek wedges: embedded in the skull, thickening backward into the ruff
  for (const s of [1, -1])
    b.sweep([hp(s * 0.1, -0.035, 0.12), hp(s * 0.14, -0.085, -0.07)], (t: number): [number, number] => [0.03 + 0.03 * t, 0.052 + 0.014 * t], {
      color: HEAD_FUR,
      bone: head,
      sides: 6,
      smooth: false,
      caps: "flat",
    });

  // one muzzle: broad root, slight downward break toward the nose
  b.sweep(
    catmull([hp(0, -0.01, 0.11), hp(0, -0.02, 0.22), hp(0, -0.05, 0.3)]),
    (t: number): [number, number] => [0.08 - 0.036 * t, 0.07 - 0.03 * t],
    { color: HEAD_FUR, bone: head, sides: 6, smooth: false, caps: "flat" },
  );
  // nose leather
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: hp(0, -0.035, 0.305),
    scale: [0.048, 0.03, 0.028],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#6a6672", {
    bone: head,
    at: hp(0.012, -0.015, 0.328),
    scale: [0.014, 0.008, 0.008],
  });
  // closed mouth: a firm lip seam between muzzle and lower jaw
  b.part(new THREE.BoxGeometry(0.06, 0.01, 0.2), "#2b0f14", { bone: head, at: hp(0, -0.088, 0.19) });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.09, 0.06),
    aim: hp(0, -0.104, 0.285),
    role: "jaw",
    group: "head",
  });
  b.frustumBox(hp(0, -0.085, 0.1), hp(0, -0.104, 0.285), [0.12, 0.028], [0.065, 0.026], {
    color: HEAD_FUR,
    bone: jaw,
  });
  blade({
    at: hp(0, -0.12, 0.2),
    along: [0, -0.5, -0.9],
    len: 0.06,
    w: 0.05,
    root: "#c4c7be",
    tip: "#e6e8de",
    bone: jaw,
    tips: 2,
  });

  // eyes and sloped brows merged into the forehead
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: hp(s * 0.115, 0.05, 0.11),
      dir: [s * 0.7, 0.15, 0.7],
      size: [0.082, 0.052],
      mirror: s > 0,
      segments: 10,
    });
    b.extrude(
      [
        [-0.04, -0.022],
        [0.036, -0.024],
        [0.042, 0.0],
        [-0.034, 0.016],
      ],
      {
        at: hp(s * 0.102, 0.072, 0.1),
        x: [s, 0, -0.35],
        y: [0, 1, 0],
        thickness: 0.045,
        color: "#3f424a",
        bone: head,
      },
    );
  }

  // ears: compact, broad, left one notched
  const EARO: Pt[] = [[-0.062, 0], [0.062, 0], [0.055, 0.08], [0.03, 0.15], [0, 0.225, "sharp"], [-0.03, 0.15], [-0.055, 0.08]];
  const EARN: Pt[] = [[-0.062, 0], [0.062, 0], [0.055, 0.08], [0.042, 0.115], [0.024, 0.125], [0.032, 0.165], [0, 0.225, "sharp"], [-0.03, 0.15], [-0.055, 0.08]];
  const EKX = 1.25 * 1.05;
  const EKY = 0.7;
  for (const s of [1, -1]) {
    const ex: V = [1, 0, 0];
    const ey: V = [s * 0.26, 1, 0.1];
    const normal = new THREE.Vector3(...ex).cross(new THREE.Vector3(...ey)).normalize();
    const base = hp(s * 0.095, 0.095, -0.02);
    b.extrude(scaleOutline(s > 0 ? EARN : EARO, EKX, EKY), {
      at: base,
      x: ex,
      y: ey,
      thickness: 0.024,
      bevel: 0.004,
      color: paint((_p, _n, c) => (c[1] > 0.14 ? "#2a2a31" : "#6c727c")),
      bone: head,
    });
    b.extrude(scaleOutline(EARO, EKX * 0.5, EKY * 0.5), {
      at: base.clone().addScaledVector(normal, 0.012).add(new THREE.Vector3(0, 0.016, 0)),
      x: ex,
      y: ey,
      thickness: 0.012,
      color: paint((_p, _n, c) => mix("#c9c3b2", "#7a7468", smoothstep(0, 0.1, c[1]))),
      bone: head,
    });
  }

  // cheek ruff: behind the eyes, flowing back
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      blade({
        at: hp(s * (0.125 + 0.004 * i), -0.045 - i * 0.034, -0.05),
        along: [s * 0.7, -0.15 - 0.12 * i, -0.7],
        side: [0, 1, 0],
        len: 0.1 - 0.008 * i,
        w: 0.08,
        root: "#7e848c",
        tip: i === 0 ? "#b9bdc2" : "#a4a9af",
        bone: head,
        tips: 2,
        sink: 0.03,
      });

  // ---------------------------------------------------------------------------------------------------------------
  // Fur masses: two-row ruff, back ridge, tail wedges

  const ruffRow = (t: number, radius: number, fromDeg: number | undefined, toDeg: number | undefined, tips: 2 | 3, len: number) => {
    const nf = neck.at(t);
    const ntan = nf.tangent.clone();
    b.ring(nf, { count: 7, radius, tilt: 0, ...(fromDeg !== undefined ? { fromDeg, toDeg } : {}) }, (it) => {
      const out = it.axis.clone();
      const along = out.clone().multiplyScalar(0.4).addScaledVector(ntan, -0.9);
      const side = new THREE.Vector3().crossVectors(out, ntan).normalize();
      const root = out.y > 0.45 ? G_DARK : out.y < -0.35 ? "#b3b5aa" : G_MID;
      const tip = out.y > 0.45 ? "#4a4d55" : out.y < -0.35 ? "#e6e7dc" : "#9aa0a8";
      blade({ at: it, along, side, len, w: 0.15, root, tip, tips, sink: 0.035 });
    });
  };
  ruffRow(0.2, 0.19, undefined, undefined, 3, 0.17);
  ruffRow(0.5, 0.15, 25.7, 334.3, 2, 0.15);

  const ridge = (sw: typeof bodySweep, ts: number[]) =>
    ts.forEach((t) => {
      const f = sw.at(t, 0);
      const dir = f.n.clone().multiplyScalar(0.3).addScaledVector(f.tangent, -1);
      blade({ at: f, along: dir, side: [1, 0, 0], len: 0.09, w: 0.15, root: G_DARK, tip: "#575b64", tips: 3, sink: 0.035 });
    });
  ridge(bodySweep, [0.25, 0.55, 0.85]);

  // tail: six large alternating wedges following the tail path
  [0.18, 0.32, 0.46, 0.6, 0.74, 0.88].forEach((t, i) => {
    const ang = i % 2 === 0 ? 80 : -80;
    const f = tailSweep.at(t, ang);
    const dir = f.n.clone().multiplyScalar(0.35).addScaledVector(f.tangent, 0.9);
    const dark = t > 0.6;
    blade({
      at: f,
      along: dir,
      side: [1, 0, 0],
      len: 0.2,
      w: 0.13,
      tips: 2,
      sink: 0.035,
      root: dark ? "#4a4d55" : "#686d76",
      tip: dark ? "#2a2c33" : "#98a0a8",
    });
  });

  // a few chest tufts whose roots vanish in the coat
  const chestHits = b
    .surface(bodySweep)
    .scatter(7, { rng: rng(13), minDist: 0.1, filter: (h) => h.at.z > 0.3 && h.n.y < -0.4 });
  b.cards(chestHits, TUFT_C, {
    size: [0.1, 0.13],
    lean: 75,
    flow: [0, -0.5, -1],
    bend: 25,
    vary: 0.2,
    rng: rng(14),
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Setting: compact snowy rock outcrop

  const OUT0: [number, number][] = [
    [-0.5, 1.2], [0, 1.36], [0.5, 1.22], [0.64, 0.7], [0.6, 0.0], [0.67, -0.7],
    [0.5, -1.2], [0, -1.34], [-0.55, -1.18], [-0.67, -0.6], [-0.58, 0.1], [-0.65, 0.8],
  ];
  const OUT = OUT0.map(([x, z]) => [x * 0.78, z * 0.8] as [number, number]);
  b.extrude(OUT, { at: [0, 0.05, OZ], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, bevel: 0.012, color: ROCK, bone: hips });
  b.extrude(
    OUT.map(([x, z]) => [x * 0.94, z * 0.94] as [number, number]),
    { at: [0, 0.1175, OZ], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.035, bevel: 0.012, color: SNOW, bone: hips },
  );
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

  // small rune stone, front left (~0.14 m tall)
  const sx: V = [0.97, 0, 0.26];
  const sy: V = [0, 1, -0.1];
  const sn = new THREE.Vector3(...sx).cross(new THREE.Vector3(...sy)).normalize();
  const stoneAt = new THREE.Vector3(0.34, FLOOR - 0.01, 0.74);
  const STONE: Pt[] = [[-0.16, 0], [0.16, 0], [0.19, 0.14], [0.13, 0.3], [0.02, 0.36], [-0.1, 0.31], [-0.18, 0.17]];
  b.extrude(scaleOutline(STONE, 0.5, 0.39), { at: stoneAt, x: sx, y: sy, thickness: 0.055, bevel: 0.008, color: ROCK, bone: hips });
  glow(
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
      bone: hips,
      at: stoneAt.clone().add(new THREE.Vector3(0, 0.07, 0)).addScaledVector(sn, 0.031),
      dir: sn,
      axis: "z",
      texture: RUNE,
    }),
    1.3,
  );

  // two ice crystals, outside the paws' silhouettes
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
  crystal(-0.35, 0.72, 0.2, 0.034, [-0.12, 1, 0.08], "#62d4ff");
  crystal(-0.29, 0.8, 0.12, 0.026, [0.3, 1, 0.25], "#8ae6ff");
  b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
    bone: hips,
    at: [-0.33, FLOOR - 0.005, 0.76],
    scale: [0.09, 0.035, 0.08],
    flat: true,
  });

  return b.root;
}
