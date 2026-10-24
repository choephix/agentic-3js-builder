```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  polyline,
  spiral,
  paint,
  mix,
  noise,
  smoothstep,
  countershade,
  mottle,
  rgb,
  svg,
  DEG,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Audrey II",
  description:
    "A giant man-eating Venus flytrap in a terracotta pot, Little Shop of Horrors style: fat red lips, cilia teeth, a drooling tongue, mini traps and a flower.",
};

type Vec = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- palette
const C_GD = rgb("#2a6428");
const C_GL = rgb("#7cc44a");
const C_PU = rgb("#7a2f86");
const C_RIM = rgb("#a2205e");
const PURPLE = "#7a2f86";
const TOOTH = "#f4ecc8";
const TOOTH_TIP = "#d4bf70";
const TONGUE = "#e2507f";
const THROAT = "#2a0a1f";

const shade = (c: readonly number[], f: number): [number, number, number] => [c[0] * f, c[1] * f, c[2] * f];

// Dome skin: green with purple ribs radiating from the pole, crimson near the lips.
const SKIN = paint((p, n, s) => {
  let c = mix(C_GD, C_GL, 0.25 + 0.6 * noise(p, 0.18, 4));
  const u = s[0] * 14;
  const d = Math.abs(u - Math.round(u));
  const w = 0.06 + 0.12 * (1 - s[1]);
  if (d < w) c = mix(c, C_PU, 0.75);
  c = mix(c, C_RIM, smoothstep(0.14, 0.02, s[1]));
  return shade(c, 0.78 + 0.22 * smoothstep(-0.7, 0.8, n.y));
});

// Stem: mottled green with purple ribs running up it.
const STEM = paint((p, n, s) => {
  let c = mix(C_GD, C_GL, 0.2 + 0.55 * noise(p, 0.22, 8));
  const a = ((s[1] % 360) + 360) % 360;
  const k = Math.abs(a / 30 - Math.round(a / 30));
  if (k < 0.07) c = mix(c, C_PU, 0.6);
  c = mix(c, C_PU, 0.5 * smoothstep(0.62, 0.8, noise(p, 0.12, 9)));
  return shade(c, 0.78 + 0.22 * smoothstep(-0.8, 0.8, n.y));
});

const POT = paint((p, n) => {
  let c = mix("#b04f28", "#e2824a", noise(p, 0.18, 3));
  const stripe = 0.5 + 0.5 * Math.sin(p.y * 90 + noise(p, 0.1, 2) * 4);
  c = mix(c, "#9c4322", 0.18 * stripe);
  if (p.y > 0.48) {
    c = mix(c, "#f0a46a", 0.55);
    if (Math.abs(p.y - 0.485) < 0.007) c = rgb("#6e2c14");
  }
  c = mix(c, "#e9dcc4", 0.45 * smoothstep(0.64, 0.82, noise(p, 0.08, 5)) * smoothstep(0.1, 0.5, p.y));
  c = mix(c, "#3c2a1e", 0.7 * smoothstep(0.18, 0.07, p.y));
  c = mix(c, "#5f8f3a", 0.5 * smoothstep(0.6, 0.9, n.y) * smoothstep(0.64, 0.8, noise(p, 0.1, 6)));
  return shade(c, 0.8 + 0.2 * smoothstep(-0.8, 0.8, n.y));
});

const SOIL = mottle("#3a2515", "#5e3e25", { size: 0.05, seed: 2 });
const LIPP = countershade("#ee3b7c", "#a3195a");
const CHEEK = countershade("#4a9a3a", "#2a6428");
const BULB = mottle("#2a6428", "#6fb544", { size: 0.15, seed: 4 });

export default function build() {
  const b = createBuilder({ name: "audrey_ii" });
  const R = rng(7);

  // ------------------------------------------------------------ textures
  const padLines = [...Array(9)]
    .map((_, i) => {
      const t = i / 8;
      const x = 8 + t * 112;
      return `<path d="M64 122 Q ${64 + (x - 64) * 0.35} 60 ${x} ${6 + Math.abs(t - 0.5) * 40}" stroke="#7a1040" stroke-width="2" fill="none" opacity="0.65"/>`;
    })
    .join("");
  const gl = rng(3);
  const glands = [...Array(30)]
    .map(() => {
      const a = gl() * Math.PI * 2;
      const r = Math.sqrt(gl()) * 48;
      const x = 64 + Math.cos(a) * r;
      const y = 58 + Math.sin(a) * r * 0.95;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.6 + gl() * 1.6).toFixed(1)}" fill="#ffc9dc" stroke="#a01a50" stroke-width="0.9"/>`;
    })
    .join("");
  const PAD = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="64" cy="122" r="100" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#2e0720"/><stop offset="0.22" stop-color="#a81c58"/>
        <stop offset="0.65" stop-color="#e9457f"/><stop offset="1" stop-color="#f58bae"/></radialGradient></defs>
      <rect width="128" height="128" fill="url(#g)"/>
      ${padLines}${glands}
      <path d="M30 80 Q64 62 98 80" stroke="#8b1450" stroke-width="2.4" fill="none" opacity="0.5"/>
      <path d="M38 52 Q64 36 90 52" stroke="#8b1450" stroke-width="2.4" fill="none" opacity="0.5"/>
      <circle cx="64" cy="64" r="62" fill="none" stroke="#8b1450" stroke-width="7"/>
    </svg>`,
    { size: 256 },
  );
  const PAD_S = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="32" cy="60" r="55" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#4a0d2e"/><stop offset="0.4" stop-color="#d63a74"/><stop offset="1" stop-color="#f58bae"/></radialGradient></defs>
      <rect width="64" height="64" fill="url(#g)"/>
      <path d="M32 60 L10 8 M32 60 L32 4 M32 60 L54 8" stroke="#7a1040" stroke-width="2" opacity="0.6"/>
      <circle cx="20" cy="30" r="2" fill="#ffc9dc"/><circle cx="44" cy="30" r="2" fill="#ffc9dc"/><circle cx="32" cy="18" r="2" fill="#ffc9dc"/>
    </svg>`,
    { size: 128 },
  );
  const zig = [...Array(10)].map((_, i) => `${14 + i * 12.2},${i % 2 ? 78 : 90}`).join(" ");
  const LABEL = svg(
    `<svg viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="144" height="94" rx="10" fill="#f6ecc8" stroke="#3b2a1a" stroke-width="3"/>
      <rect x="10" y="10" width="130" height="32" rx="4" fill="#c2185b" stroke="#3b2a1a" stroke-width="2.5"/>
      <text x="75" y="34" text-anchor="middle" font-family="Impact,'Arial Black',sans-serif" font-size="23" fill="#fff3c4" stroke="#3b2a1a" stroke-width="0.8">AUDREY II</text>
      <text x="75" y="70" text-anchor="middle" font-family="Impact,'Arial Black',sans-serif" font-size="22" fill="#2a6428" stroke="#16361a" stroke-width="0.8">FEED ME!</text>
      <polyline points="${zig}" fill="none" stroke="#c2185b" stroke-width="3" stroke-linejoin="round"/>
    </svg>`,
    { size: 384 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 63 C4 42 6 14 16 2 C26 14 28 42 16 63Z" fill="#4f9d3c" stroke="#1f4a1b" stroke-width="2"/>
      <path d="M16 60 L16 10" stroke="#a6dd6a" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const GLINT = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 44 Q30 8 78 10" stroke="#ffffff" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.9"/>
      <circle cx="90" cy="18" r="5" fill="#ffffff" opacity="0.9"/>
    </svg>`,
    { size: 256 },
  );
  const TAG = svg(
    `<svg viewBox="0 0 80 56" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="76" height="52" rx="5" fill="#e9d5a0" stroke="#4a3418" stroke-width="2.4"/>
      <circle cx="40" cy="8" r="3" fill="#4a3418"/>
      <text x="40" y="26" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#3b2a1a">SEYMOUR'S</text>
      <text x="40" y="37" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#c2185b">ODD PLANTS</text>
      <text x="40" y="49" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#2a6428">$3.99</text>
    </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------ skeleton root + pot
  const root = b.joint("root", { at: [0, 0.6, 0] });

  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.4, 0.06],
      [0.4, 0.075],
      [0.33, 0.05],
      [0, 0.05],
    ],
    { at: [0, 0, 0], segments: 16, color: POT, bone: root },
  );
  const pot = b.lathe(
    [
      [0, 0],
      [0.18, 0],
      [0.2, 0.02],
      [0.275, 0.4],
      [0.35, 0.43],
      [0.35, 0.54],
      [0.3, 0.54],
      [0.28, 0.5],
      [0, 0.5],
    ],
    { at: [0, 0.05, 0], segments: 16, color: POT, bone: root },
  );
  const soil = b.lathe(
    [
      [0, 0.54],
      [0.285, 0.54],
      [0.28, 0.6],
      [0.12, 0.64],
      [0, 0.65],
    ],
    { at: [0, 0, 0], segments: 12, color: SOIL, bone: root },
  );
  b.decal(pot, LABEL, { at: [0, 0.28, 0.25], dir: [0, 0.1, 1], size: [0.36, 0.24], segments: 14, bone: root });

  // sprouts in the soil
  const sprouts = b.surface(soil).scatter(12, { rng: rng(5), minDist: 0.07, filter: (h) => h.n.y > 0.5 });
  b.cards(sprouts, LEAF, { size: [0.05, 0.15], lean: 35, bend: 20, vary: 0.3, rng: rng(6), bone: root });

  // ------------------------------------------------------------ stem
  const H = V(0, 1.5, 0.2);
  const pitch = 10 * DEG;
  const FWD = V(0, Math.sin(pitch), Math.cos(pitch));
  const UPN = V(0, Math.cos(pitch), -Math.sin(pitch));

  const stem = b.chain("stem", catmull([[0, 0.6, 0], [0, 0.88, -0.15], [0, 1.2, -0.14], [0, 1.4, 0.0], [H.x, H.y, H.z]]), {
    parent: root,
    names: ["stem1", "stem2", "stem3", "stem4", "stemTip"],
    role: "spine",
  });
  const stemTube = b.sweep(stem, [0.15, 0.105, 0.09, 0.105, 0.16], { color: STEM, sides: 8 });
  b.along(stemTube, 7, (at) => b.spike(at, at, 0.08, 0.026, { color: PURPLE }));
  for (const hit of b.surface(stemTube).scatter(14, { rng: rng(9), minDist: 0.13 }))
    b.stick(new THREE.IcosahedronGeometry(0.03, 0), "#9b46a8", hit, { embed: 0.4, flat: true });

  // tendrils
  for (const sg of [1, -1]) {
    const cp = stem.at(sg > 0 ? 0.42 : 0.68);
    const st = cp.at.clone().add(V(sg * 0.11, 0, 0));
    const center = st.clone().add(V(0, 0.12, 0));
    const path = polyline([cp.at, st]).concat(spiral(center, st, [sg, 0, 0], { turns: 1.4, r1: 0.025, pitch: 0.02 }));
    b.sweep(path, [0.02, 0.006], { bone: stem.nearestJoint(cp.at), color: "#8a3fa0", sides: 5 });
  }

  // shop tag on a string
  const tagHit = b.surface(stemTube).ray([0, 0.97, 1], [0, 0, -1]);
  const strHit = b.surface(stemTube).ray([0, 1.08, 1], [0, 0, -1]);
  if (tagHit && strHit) {
    b.part(new THREE.PlaneGeometry(0.15, 0.105), "#ffffff", {
      bone: stem.joints[1],
      at: tagHit.at.clone().addScaledVector(tagHit.n, 0.014),
      dir: tagHit.n,
      axis: "z",
      up: [0, 1, 0],
      texture: TAG,
    });
    b.sweep(b.surface(stemTube).loop([0, 1.08, -0.14], { lift: 0.008 }), 0.006, { color: "#6b4a26", bone: stem.joints[1], sides: 5 });
    b.rod(strHit.at, tagHit.at.clone().add(V(0, 0.055, 0.012)), 0.004, { color: "#6b4a26", bone: stem.joints[1], sides: 4 });
  }

  // ------------------------------------------------------------ head
  const head = b.joint("head", { parent: stem.tip!, at: H, dir: FWD, role: "head" });
  b.part(new THREE.SphereGeometry(1, 10, 8), BULB, {
    bone: head,
    at: H.clone().addScaledVector(FWD, -0.03),
    scale: [0.24, 0.22, 0.22],
    flat: true,
  });

  type TrapOpts = {
    name: string;
    parent: any;
    hinge: Vec;
    fwd: Vec;
    up: Vec;
    open: number;
    a: number;
    w: number;
    thick: number;
    lip: number;
    teeth: number;
    tooth: number;
    big: boolean;
  };

  function trap(o: TrapOpts) {
    const fwd = o.fwd.clone().normalize();
    const upN = o.up.clone().addScaledVector(fwd, -o.up.dot(fwd)).normalize();
    const side = new THREE.Vector3().crossVectors(upN, fwd).normalize();
    const ang = o.open * DEG;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const dU = fwd.clone().multiplyScalar(c).addScaledVector(upN, s);
    const outU = upN.clone().multiplyScalar(c).addScaledVector(fwd, -s);
    const dL = fwd.clone().multiplyScalar(c).addScaledVector(upN, -s);
    const outL = upN.clone().multiplyScalar(-c).addScaledVector(fwd, -s);
    const jU = b.joint(o.name + "U", { parent: o.parent, at: o.hinge, dir: dU, role: "jaw" });
    const jL = b.joint(o.name + "L", { parent: o.parent, at: o.hinge, dir: dL, role: "jaw" });

    const lobe = (bone: any, dir: Vec, out: Vec, which: number) => {
      const a = o.a;
      const w = o.w;
      const cc = o.hinge.clone().addScaledVector(dir, a);
      const mouth = out.clone().negate();
      const ell = (phi: number, k = 1, lift = 0) =>
        cc
          .clone()
          .addScaledVector(side, w * k * Math.cos(phi))
          .addScaledVector(dir, a * k * Math.sin(phi))
          .addScaledVector(out, lift);

      const dome = b.part(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), SKIN, {
        bone,
        at: cc,
        dir: out,
        up: dir,
        scale: [w, o.thick, a],
        flat: true,
      });
      b.part(new THREE.CircleGeometry(1, 20), "#ffffff", {
        bone,
        at: cc.clone().addScaledVector(out, -0.004),
        dir: mouth,
        axis: "z",
        up: dir,
        scale: [w * 0.97, a * 0.97, 1],
        texture: o.big ? PAD : PAD_S,
      });

      // fat lips
      const N = o.big ? 20 : 14;
      const pts: Vec[] = [];
      for (let i = 0; i < N; i++) pts.push(ell(-Math.PI / 2 + (i * Math.PI * 2) / N, 1, -0.004));
      b.sweep(catmull(pts, { closed: true }), o.lip, { bone, color: LIPP, sides: 6 });

      // cilia teeth, interleaved between the two jaws
      const p0 = -10 * DEG;
      const p1 = 190 * DEG;
      for (let k = 0; k < o.teeth; k++) {
        const phi = p0 + ((p1 - p0) * (k + 0.5 * which + 0.25)) / o.teeth;
        const base = ell(phi, 1, 0).addScaledVector(mouth, o.lip * 0.25);
        const radial = side
          .clone()
          .multiplyScalar(Math.cos(phi) / w)
          .addScaledVector(dir, Math.sin(phi) / a)
          .normalize();
        const td = mouth.clone().multiplyScalar(0.9).addScaledVector(radial, 0.35).normalize();
        const len = o.tooth * (0.8 + 0.3 * Math.sin(((phi - p0) / (p1 - p0)) * Math.PI)) * (0.85 + 0.3 * R());
        if (o.big)
          b.spike(base, td, len, o.tooth * 0.17, {
            bone,
            bands: [
              [0.6, TOOTH],
              [1, TOOTH_TIP],
            ],
          });
        else b.spike(base, td, len, o.tooth * 0.17, { bone, color: TOOTH });
      }

      if (o.big) {
        // trigger hairs with glowing tips
        const hs: [number, number][] = [[-0.4, -0.2], [0.4, -0.2], [0, 0.25]];
        for (const [u, v] of hs) {
          const base = cc.clone().addScaledVector(side, w * u).addScaledVector(dir, a * v).addScaledVector(out, -0.006);
          const tip = base.clone().addScaledVector(mouth, 0.17).addScaledVector(dir, 0.03);
          b.rod(base, tip, [0.009, 0.004], { bone, color: "#c2467a", sides: 5 });
          glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), "#ff4a6a", { bone, at: tip }), 0.8);
        }
        // warts on the outside
        for (const h of b.surface(dome).scatter(7, {
          rng: rng(21 + which),
          minDist: 0.15,
          filter: (hh) => hh.n.dot(out) > 0.3,
        }))
          b.stick(new THREE.IcosahedronGeometry(0.035, 0), "#9b46a8", h, { embed: 0.4, bone, flat: true });
      }
      return { c: cc, dir, out, ell, dome, side, mouth };
    };

    const U = lobe(jU, dU, outU, 0);
    const L = lobe(jL, dL, outL, 1);
    return { U, L, jU, jL, side };
  }

  const big = trap({
    name: "jaw",
    parent: head,
    hinge: H,
    fwd: FWD,
    up: UPN,
    open: 32,
    a: 0.43,
    w: 0.36,
    thick: 0.27,
    lip: 0.042,
    teeth: 13,
    tooth: 0.12,
    big: true,
  });
  const { U, L } = big;

  // cheek webbing at the corners of the mouth
  for (const sg of [1, -1]) {
    const ea: Vec[] = [];
    const eb: Vec[] = [];
    for (let k = 1; k <= 9; k++) {
      const phi = -Math.PI / 2 + sg * k * 10 * DEG;
      ea.push(U.ell(phi, 0.97, -0.01));
      eb.push(L.ell(phi, 0.97, -0.01));
    }
    b.membrane(ea, eb, { color: CHEEK, thickness: 0.025, bone: head });
  }

  // throat plug, uvula, tongue
  b.part(new THREE.SphereGeometry(1, 10, 8), THROAT, {
    bone: head,
    at: H.clone().addScaledVector(FWD, 0.12),
    scale: [0.21, 0.2, 0.16],
    flat: true,
  });
  const uv1 = H.clone().addScaledVector(FWD, 0.24).addScaledVector(UPN, 0.12);
  b.capsule(uv1, uv1.clone().addScaledVector(UPN, -0.1), 0.026, { color: "#d43d73", bone: big.jU, sides: 6 });

  const tp = [0.1, 0.4, 0.75, 1.02, 1.14].map((d, i) =>
    H.clone().addScaledVector(L.dir, d).addScaledVector(L.mouth, [0.05, 0.06, 0.055, 0.04, 0.0][i]),
  );
  b.sweep(catmull(tp), (t) => [0.11 - 0.04 * t * t, 0.03], {
    bone: big.jL,
    color: TONGUE,
    sectors: [[-14, 14, "#b8355f"]],
    sides: 8,
  });

  // drool
  const drops: [typeof U, number, number, number][] = [
    [U, 62, 0.18, 0],
    [U, 118, 0.12, 0],
    [L, 112, 0.28, 0.03],
    [L, 70, 0.2, 0.03],
  ];
  for (const [lb, deg, len, out] of drops) {
    const st = lb.ell(deg * DEG, 1.0, out);
    const en = st.clone().add(V(0, -len, 0));
    const bone = lb === U ? big.jU : big.jL;
    b.capsule(st, en, 0.01, { color: "#bfe6f2", bone, sides: 5 });
    b.part(new THREE.SphereGeometry(0.026, 7, 5), "#cfeefa", { bone, at: en.clone().add(V(0, -0.01, 0)) });
  }

  // cartoon glint on the upper dome
  b.decal(U.dome, GLINT, {
    at: U.c.clone().addScaledVector(U.out, 0.23).addScaledVector(U.side, 0.12).addScaledVector(U.dir, -0.05),
    dir: U.out.clone().addScaledVector(U.side, 0.3).normalize(),
    up: U.dir,
    size: [0.22, 0.13],
    roll: 15,
    bone: big.jU,
  });

  // ------------------------------------------------------------ rosette leaves and baby traps
  const leafR = (t: number): [number, number] => {
    const u = Math.min(1, Math.max(0, (t - 0.18) / 0.82));
    const rx = (0.03 + 0.15 * Math.pow(Math.sin(Math.PI * u), 0.7)) * (1 - 0.85 * Math.max(0, (t - 0.9) / 0.1));
    return [rx, 0.012];
  };
  const rp: [number, number][] = [[0.07, 0.62], [0.2, 0.86], [0.4, 0.92], [0.53, 0.8], [0.6, 0.66]];
  for (let i = 0; i < 5; i++) {
    const ang = (36 + 72 * i) * DEG;
    const o = V(Math.sin(ang), 0, Math.cos(ang));
    const pts = rp.map(([r, y]) => [o.x * r, y, o.z * r]);
    const path = catmull(pts);
    const n = `leaf${i + 1}`;
    const ch = b.chain(n, path, { parent: root, names: [`${n}a`, `${n}b`, `${n}c`, `${n}d`, `${n}Tip`], role: "tentacle" });
    if (i % 2 === 0) {
      b.sweep(ch, (t) => [0.03 + 0.03 * t, 0.016], { color: "#5aa040", sides: 6, sectors: [[-12, 12, "#9bd25f"]] });
      trap({
        name: `trap${i + 1}`,
        parent: ch.tip!,
        hinge: path.at(1),
        fwd: V(o.x, 0.3, o.z),
        up: V(0, 1, 0),
        open: 26,
        a: 0.13,
        w: 0.095,
        thick: 0.075,
        lip: 0.014,
        teeth: 6,
        tooth: 0.055,
        big: false,
      });
    } else {
      b.sweep(ch, leafR, {
        color: "#4d9a3a",
        sectors: [[-10, 10, "#a8dc66"], [170, 190, "#2a5f27"]],
        sides: 8,
        caps: "point",
      });
    }
  }

  // ------------------------------------------------------------ flower on a tall stalk
  const fp = [V(-0.12, 0.62, -0.1), V(-0.16, 1.0, -0.2), V(-0.24, 1.45, -0.38), V(-0.3, 1.82, -0.45)];
  const fch = b.chain("flower", catmull(fp), {
    parent: root,
    names: ["flower1", "flower2", "flower3", "flowerTip"],
    role: "tentacle",
  });
  b.sweep(fch, [0.02, 0.011], { color: "#6fa845", sides: 5 });
  const T = fp[3];
  const petalPaint = paint((_p, _n, s) => (s[0] < 0.03 ? rgb("#b9d97a") : mix("#fff9ea", "#f9d9e4", 0.5 * (s[0] / 0.16))));
  const petal = (L2: number, W2: number): [number, number][] => [
    [0, 0],
    [0.04 * L2, 0.03 * W2],
    [0.1 * L2, 0.036 * W2],
    [0.15 * L2, 0],
    [0.1 * L2, -0.036 * W2],
    [0.04 * L2, -0.03 * W2],
  ];
  const ringDef: [number, number, number, number][] = [
    [7, 40, 1.2, 0],
    [6, 64, 0.9, 0.5],
  ];
  for (const [cnt, tiltDeg, sc, off] of ringDef) {
    for (let k = 0; k < cnt; k++) {
      const th = ((k + off) * Math.PI * 2) / cnt;
      const tl = tiltDeg * DEG;
      const rad = V(Math.cos(th), 0, Math.sin(th));
      const xd = rad.clone().multiplyScalar(Math.cos(tl)).add(V(0, Math.sin(tl), 0));
      const yd = V(-Math.sin(th), 0, Math.cos(th));
      b.extrude(petal(sc * 1.4, sc * 1.6), {
        at: T,
        x: xd,
        y: yd,
        thickness: 0.008,
        bevel: 0.003,
        smoothing: 1,
        color: petalPaint,
        bone: fch.tip!,
      });
    }
  }
  b.part(new THREE.SphereGeometry(0.03, 7, 5), "#f3d34a", { bone: fch.tip!, at: T.clone().add(V(0, 0.015, 0)) });
  for (let k = 0; k < 8; k++) {
    const th = (k * Math.PI * 2) / 8;
    const dirv = V(Math.cos(th) * 0.35, 1, Math.sin(th) * 0.35).normalize();
    b.spike(T.clone().add(V(Math.cos(th) * 0.015, 0.01, Math.sin(th) * 0.015)), dirv, 0.055, 0.006, {
      color: "#f3d34a",
      bone: fch.tip!,
    });
  }

  return b.root;
}
```