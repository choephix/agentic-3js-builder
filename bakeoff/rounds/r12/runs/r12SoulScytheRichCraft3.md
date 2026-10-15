```ts
import * as THREE from "three";
import { createBuilder, frame, rng, mix, noise, paint, smoothstep, catmull, bezier, svg } from "agentic-3js-builder";
import type { ColorInput, Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering reaper's scythe: a vertebrae shaft with a glowing soul core, a snarling dragon skull clamped under a gilded heel, a curved dragon-bone spine with a ghostly spirit-flame blade, talon-caged soul orb at the butt, tattered banners and drifting souls.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const C = {
  teal: "#3df2dc",
  tealWhite: "#e6fffa",
  tealDeep: "#0f8f95",
  abyss: "#120d1f",
  plum: "#2b1d3f",
  plumLt: "#4a3366",
  violet: "#7b52b0",
  tooth: "#fff6dc",
  boneLt: "#f3ead2",
  gold: "#e0a93c",
  goldDk: "#8c5f1e",
  goldLt: "#ffe08a",
};

// Paints ------------------------------------------------------------------------------------------------------
const BONE_P = paint((p, n) => {
  const t = noise(p, 0.06, 3);
  let c = mix("#d6c49c", "#f7efda", smoothstep(0.25, 0.8, t));
  c = mix(c, "#98805a", 0.55 * smoothstep(0.6, 0.72, noise(p, 0.022, 9)));
  const up = smoothstep(-0.7, 0.8, n.y);
  return mix(mix(c, "#625c8c", 0.42), c, up);
});

const GOLD_P = paint((p, n) => {
  const t = noise(p, 0.04, 5);
  let c = mix("#b9791f", "#ffd77a", smoothstep(0.2, 0.85, t));
  c = mix(c, "#fff3b8", 0.5 * smoothstep(0.55, 1, n.y));
  return mix(c, "#5a3410", 0.3 * smoothstep(0.2, -0.8, n.y));
});

const WRAP_P = paint((_p, _n, s) => {
  const k = (((s[1] + s[0] * 5400) % 90) + 90) % 90;
  if (k < 9) return "#8a5cc4";
  if (k < 13) return "#e0a93c";
  return k % 38 < 19 ? "#2d1f45" : "#3a2860";
});

// ---------------------------------------------------------------------------------------------------------------
// Blade geometry (side view: f = forward, u = up, relative to the blade origin on top of the shaft)
const TY = 1.88;
const M = (f: number, u: number): [number, number, number] => [0, TY + u, f];
const TOP: [number, number][] = [
  [-0.06, 0.05],
  [0.1, 0.21],
  [0.38, 0.33],
  [0.7, 0.33],
  [1.0, 0.21],
  [1.22, 0.0],
  [1.36, -0.22],
  [1.43, -0.43],
];
const BOT: [number, number][] = [
  [0.06, -0.13],
  [0.16, -0.11],
  [0.35, 0.02],
  [0.6, 0.08],
  [0.85, 0.07],
  [1.08, 0.0],
  [1.28, -0.15],
  [1.43, -0.43],
];
const topPath = catmull(TOP.map(([f, u]) => M(f, u)));
const botPath = catmull(BOT.map(([f, u]) => M(f, u)));
const NS = 28;
const sample2 = (path: typeof topPath) =>
  Array.from({ length: NS + 1 }, (_, i) => {
    const v = path.at(i / NS);
    return new THREE.Vector2(v.z, v.y - TY);
  });
const topS = sample2(topPath);
const botS = sample2(botPath);
const outline = [...topS, ...botS.slice(0, NS).reverse()];
const minX = Math.min(...outline.map((v) => v.x));
const maxX = Math.max(...outline.map((v) => v.x));
const minY = Math.min(...outline.map((v) => v.y));
const maxY = Math.max(...outline.map((v) => v.y));

const spineR = (t: number) => 0.008 + 0.048 * Math.pow(1 - t, 1.15);

function spineFrame(t: number) {
  const p = topPath.at(t);
  const tg = topPath.tangentAt(t).normalize();
  const n = new THREE.Vector3(0, tg.z, -tg.y).normalize();
  return { p, tg, n };
}

function bladeGeometry() {
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(outline), {
    depth: 0.014,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geo.translate(0, 0, -0.007);
  const pos = geo.getAttribute("position");
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - minX) / (maxX - minX);
    uv[i * 2 + 1] = (pos.getY(i) - minY) / (maxY - minY);
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

function bladeTexture() {
  const W = 480;
  const H = Math.round((W * (maxY - minY)) / (maxX - minX));
  const px = W / (maxX - minX);
  const X = (v: THREE.Vector2) => (((v.x - minX) / (maxX - minX)) * W).toFixed(1);
  const Y = (v: THREE.Vector2) => ((1 - (v.y - minY) / (maxY - minY)) * H).toFixed(1);
  const pt = (v: THREE.Vector2) => `${X(v)} ${Y(v)}`;
  const mixv = (a: THREE.Vector2, b: THREE.Vector2, k: number) =>
    new THREE.Vector2(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k);
  const ks = [0, 0.1, 0.22, 0.36, 0.5, 0.64, 0.78, 0.9, 1];
  const cols = ["#0a3a66", "#0c5f86", "#0f8aa0", "#18b8b4", "#34dccf", "#6ff2e2", "#b2fff2", "#eafffb"];
  let bands = "";
  for (let j = 0; j < 8; j++) {
    const fwd = topS.map((t, i) => pt(mixv(t, botS[i], ks[j])));
    const back = topS.map((t, i) => pt(mixv(t, botS[i], ks[j + 1]))).reverse();
    bands += `<path d="M${fwd.join("L")}L${back.join("L")}Z" fill="${cols[j]}" stroke="${cols[j]}" stroke-width="1.2"/>`;
  }
  let flow = "";
  for (const k of [0.3, 0.55, 0.8]) {
    flow += `<path d="M${topS.map((t, i) => pt(mixv(t, botS[i], k))).join("L")}" fill="none" stroke="#ffffff" stroke-opacity="0.38" stroke-width="1.7" stroke-linecap="round"/>`;
  }
  let sigils = "";
  for (const i of [6, 12, 18]) {
    const c = mixv(topS[i], botS[i], 0.42);
    const r = topS[i].distanceTo(botS[i]) * px * 0.3;
    const cx = X(c);
    const cy = Y(c);
    sigils += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="#06304e" stroke-width="2.2"/>`;
    sigils += `<path d="M${cx} ${(Number(cy) - r * 0.7).toFixed(1)} L${(Number(cx) + r * 0.55).toFixed(1)} ${cy} L${cx} ${(Number(cy) + r * 0.7).toFixed(1)} L${(Number(cx) - r * 0.55).toFixed(1)} ${cy}Z" fill="none" stroke="#bffcf4" stroke-width="2"/>`;
  }
  let motes = "";
  for (let i = 3; i < NS - 2; i += 3) {
    const c = mixv(topS[i], botS[i], 0.8 + 0.1 * Math.sin(i));
    motes += `<circle cx="${X(c)}" cy="${Y(c)}" r="${(1.6 + (i % 4) * 0.5).toFixed(1)}" fill="#ffffff" fill-opacity="0.85"/>`;
  }
  return svg(`<svg viewBox="0 0 ${W} ${H}">${bands}${flow}${sigils}${motes}</svg>`, { size: 1024 });
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "soul-scythe" });
  const R = rng(11);

  // Skeleton ---------------------------------------------------------------------------------------------------
  const S: [number, number, number] = [0, 1.64, 0.06]; // skull centre
  const J: [number, number, number] = [0, 1.6, 0.07]; // jaw hinge
  const E: [number, number, number] = [0, 1.51, 0.29]; // jaw tip
  const root = b.joint("scythe", { at: [0, 0.9, 0], dir: [0, 1, 0] });
  const bladeJ = b.joint("blade", { parent: root, at: [0, TY, 0], dir: [0, 0, 1] });
  const skull = b.joint("skull", { parent: root, at: S, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: skull, at: J, aim: E, role: "jaw" });

  // Textures ---------------------------------------------------------------------------------------------------
  const BLADE_TEX = bladeTexture();
  const WISP = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M18 128 C2 104 10 78 26 62 C30 44 24 24 34 2 C40 28 48 38 50 58 C62 84 58 110 46 128 Z" fill="#17b8b6"/>
      <path d="M26 128 C14 108 20 88 31 74 C33 58 31 44 35 28 C40 48 44 58 45 74 C52 92 50 112 40 128 Z" fill="#7ff6e6"/>
      <path d="M31 128 C25 114 28 100 34 88 C36 78 36 70 37 60 C41 76 43 88 42 100 C42 112 39 120 37 128 Z" fill="#ffffff"/>
    </svg>`,
    { size: 192 },
  );
  const BANNER = svg(
    `<svg viewBox="0 0 64 160">
      <path d="M8 160 L56 160 L58 40 L52 22 L47 40 L40 6 L33 36 L27 14 L20 38 L12 20 L6 44 Z" fill="#2d1f45" stroke="#120d1f" stroke-width="3" stroke-linejoin="round"/>
      <path d="M52 154 L52 46 M12 154 L12 50 M12 154 L52 154" stroke="#e0a93c" stroke-width="3" fill="none"/>
      <path d="M32 120 L45 98 L32 76 L19 98 Z" fill="#120d1f" stroke="#e0a93c" stroke-width="2.6"/>
      <path d="M22 98 Q32 88 42 98 Q32 108 22 98 Z" fill="#3df2dc"/>
      <rect x="31" y="92" width="2.4" height="12" fill="#120d1f"/>
      <path d="M20 142 h24 M25 133 h14" stroke="#7b52b0" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  const glyphs = [
    "M12 2 V22 M12 8 L20 3 M12 14 L20 9",
    "M6 2 V22 M6 4 L18 12 L6 20",
    "M4 22 L12 2 L20 22 M7 15 H17",
    "M5 4 L19 20 M19 4 L5 20 M12 2 V22",
    "M6 2 V22 M18 2 V22 M6 12 H18",
    "M12 2 L20 12 L12 22 L4 12 Z",
    "M6 4 H18 L6 20 H18",
    "M12 2 V22 M5 9 L12 15 L19 9",
  ];
  const RUNES = svg(
    `<svg viewBox="0 0 256 40">
      <rect width="256" height="40" fill="#1a1030"/>
      <rect y="0" width="256" height="4" fill="#e0a93c"/><rect y="36" width="256" height="4" fill="#e0a93c"/>
      ${glyphs.map((g, i) => `<path transform="translate(${8 + i * 32} 8)" d="${g}" stroke="#58ffe6" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}
    </svg>`,
    { size: 768 },
  );
  const MEDALLION = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#e0a93c" stroke="#8c5f1e" stroke-width="3"/>
      <circle cx="50" cy="50" r="40" fill="#8c5f1e"/>
      <circle cx="50" cy="50" r="36" fill="#180f2a"/>
      <path d="M16 50 Q50 20 84 50 Q50 80 16 50 Z" fill="#38f0dc" stroke="#0a3d55" stroke-width="2"/>
      <ellipse cx="50" cy="50" rx="6" ry="15" fill="#0a0614"/>
      <circle cx="46" cy="44" r="3" fill="#ffffff"/>
      <path d="M50 4 V12 M50 88 V96 M4 50 H12 M88 50 H96" stroke="#5a3410" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  const ORB = svg(
    `<svg viewBox="0 0 256 128">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f8f95"/><stop offset="1" stop-color="#a6fff2"/></linearGradient></defs>
      <rect width="256" height="128" fill="url(#g)"/>
      <path d="M0 40 C40 10 80 70 128 36 S220 20 256 44" stroke="#ffffff" stroke-opacity="0.8" stroke-width="5" fill="none"/>
      <path d="M0 84 C50 60 90 112 140 80 S210 70 256 90" stroke="#e6fffa" stroke-opacity="0.85" stroke-width="6" fill="none"/>
      <circle cx="60" cy="64" r="9" fill="#ffffff"/><circle cx="180" cy="50" r="7" fill="#ffffff"/><circle cx="130" cy="100" r="6" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Helpers ----------------------------------------------------------------------------------------------------
  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const ringAround = (
    at: THREE.Vector3 | number[],
    dir: THREE.Vector3 | number[],
    Rr: number,
    r: number,
    color: ColorInput,
    bone: Joint,
  ) => b.part(new THREE.TorusGeometry(Rr, r, 5, 12), color, { at, dir, axis: "z", bone, flat: true });
  const tooth = (base: number[], dir: number[], len: number, r: number, bone: Joint) =>
    b.spike(base, dir, len, r, { color: C.tooth, bone, sides: 5 });
  const lerp3 = (a: number[], c: number[], t: number): [number, number, number] => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];

  // ===============================================================================================================
  // SHAFT
  const shaftPath = catmull([
    [0, 0.17, 0],
    [0, 0.6, -0.012],
    [0, 1.05, 0.01],
    [0, 1.5, -0.004],
    [0, 1.92, 0],
  ]);
  glow(b.sweep(shaftPath, 0.024, { color: C.teal, bone: root }), 1.2);

  const vertebra = () =>
    new THREE.LatheGeometry(
      (
        [
          [0.0, -0.024],
          [0.044, -0.022],
          [0.054, -0.01],
          [0.038, 0.0],
          [0.054, 0.01],
          [0.044, 0.022],
          [0.0, 0.024],
        ] as [number, number][]
      ).map(([x, y]) => new THREE.Vector2(x, y)),
      8,
    );
  const vertY = [0.375, 0.44, 0.505, 0.57, 1.165, 1.23, 1.295, 1.36, 1.425];
  for (const y of vertY) {
    const t = shaftPath.closestT([0, y, 0]);
    const c = shaftPath.at(t);
    const tg = shaftPath.tangentAt(t);
    const k = 1 - 0.14 * (y / 1.5);
    b.part(vertebra(), BONE_P, { at: c, dir: tg, bone: root, flat: true, scale: [k, 1, k] });
    for (const s of [1, -1]) {
      b.spike([c.x + s * 0.045 * k, c.y, c.z], [s, -0.35, 0], 0.065, 0.012, { color: BONE_P, bone: root, sides: 5 });
    }
    b.spike([c.x, c.y, c.z - 0.045 * k], [0, 0.25, -1], 0.05, 0.011, { color: BONE_P, bone: root, sides: 5 });
    if (y > 1.1) glow(b.part(sphere(0.008, 6, 4), C.teal, { at: [0, c.y, c.z + 0.053 * k], bone: root }), 1.3);
  }

  // Grip wrap with gold bands
  const g0 = shaftPath.closestT([0, 0.62, 0]);
  const g1 = shaftPath.closestT([0, 1.08, 0]);
  b.sweep(shaftPath.slice(g0, g1), 0.04, { color: WRAP_P, caps: "flat", bone: root });
  for (const y of [0.625, 0.78, 0.92, 1.075]) {
    const c = shaftPath.at(shaftPath.closestT([0, y, 0]));
    const big = y < 0.7 || y > 1.0;
    ringAround(c, [0, 1, 0], big ? 0.044 : 0.041, big ? 0.012 : 0.007, GOLD_P, root);
  }
  // Medallion
  {
    const c = shaftPath.at(shaftPath.closestT([0, 0.85, 0]));
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 12), GOLD_P, {
      at: [0, 0.85, c.z + 0.04],
      dir: [0, 0, 1],
      bone: root,
      flat: true,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.036, 16), "#ffffff", {
        at: [0, 0.85, c.z + 0.0475],
        dir: [0, 0, 1],
        axis: "z",
        texture: MEDALLION,
        bone: root,
      }),
      1.0,
    );
  }
  // Rune band
  {
    const c = shaftPath.at(shaftPath.closestT([0, 1.105, 0]));
    glow(
      b.part(new THREE.CylinderGeometry(0.0475, 0.0475, 0.05, 16, 1, true), "#ffffff", {
        at: c,
        dir: [0, 1, 0],
        texture: RUNES,
        bone: root,
      }),
      1.1,
    );
  }

  // Butt: gilt ferrule, talon cage and soul orb
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.06, 0.018],
      [0.05, 0.045],
      [0.034, 0.062],
      [0, 0.062],
    ],
    { at: [0, 0.3, 0], color: GOLD_P, bone: root, segments: 10 },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.05, 12, 8), "#ffffff", {
      at: [0, 0.13, 0],
      texture: ORB,
      rotation: [0, -90, 0],
      bone: root,
    }),
    1.4,
  );
  for (let i = 0; i < 3; i++) {
    const a = ((i * 120 + 30) * Math.PI) / 180;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const P = (r: number, y: number): [number, number, number] => [sx * r, y, cz * r];
    const path = bezier(P(0.03, 0.33), P(0.095, 0.28), P(0.09, 0.07), P(0.014, 0.0));
    b.sweep(path, [0.017, 0], { color: BONE_P, bone: root, caps: "point", sides: 6 });
    b.part(sphere(0.02, 6, 4), BONE_P, { at: P(0.03, 0.33), bone: root, flat: true });
    ringAround(path.at(0.16), path.tangentAt(0.16), 0.019, 0.006, GOLD_P, root);
    ringAround(path.at(0.5), path.tangentAt(0.5), 0.014, 0.005, GOLD_P, root);
  }

  // Neck collar + banner ring
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.072, 0.03],
      [0.062, 0.06],
      [0.046, 0.078],
      [0, 0.078],
    ],
    { at: [0, 1.5, 0], color: GOLD_P, bone: root, segments: 10 },
  );
  ringAround(new THREE.Vector3(0, 1.47, 0), [0, 1, 0], 0.052, 0.01, GOLD_P, root);
  const bannerAngles = [90, 270, 0, 180].map((d) => (d * Math.PI) / 180);
  b.cards(
    bannerAngles.map((a) => frame([Math.sin(a) * 0.056, 1.47, Math.cos(a) * 0.056], [0, 1, 0])),
    BANNER,
    {
      size: [0.08, 0.36],
      lean: 180,
      flow: (_f, i) => [Math.sin(bannerAngles[i]), 0, Math.cos(bannerAngles[i])],
      vary: 0.2,
      rng: R,
      bend: 10,
      bone: root,
    },
  );

  // ===============================================================================================================
  // DRAGON SKULL
  b.part(sphere(1, 10, 7), BONE_P, { at: [0, 1.66, 0.06], scale: [0.065, 0.06, 0.085], bone: skull, flat: true });
  // snout (upper jaw)
  b.frustumBox([0, 1.64, 0.12], [0, 1.615, 0.33], [0.1, 0.07], [0.055, 0.045], { color: BONE_P, bone: skull });
  b.part(sphere(0.026, 7, 5), BONE_P, { at: [0, 1.628, 0.325], bone: skull, flat: true, scale: [1.1, 0.8, 1] });
  // nostrils
  for (const s of [1, -1]) {
    glow(b.part(sphere(0.008, 5, 4), C.teal, { at: [s * 0.016, 1.63, 0.347], bone: skull }), 1.5);
    // brow ridges
    b.rod([s * 0.07, 1.69, 0.075], [s * 0.036, 1.67, 0.19], 0.016, BONE_P, { bone: skull });
    // eye sockets
    b.part(sphere(0.022, 7, 5), C.abyss, { at: [s * 0.047, 1.67, 0.12], bone: skull, flat: true });
    glow(b.part(sphere(0.013, 6, 4), C.teal, { at: [s * 0.05, 1.67, 0.133], bone: skull }), 1.8);
    // cheek bone
    b.rod([s * 0.06, 1.645, 0.1], [s * 0.04, 1.6, 0.19], 0.012, BONE_P, { bone: skull });
    // cheek spikes
    b.spike([s * 0.06, 1.63, 0.03], [s * 0.7, -0.15, -0.7], 0.12, 0.022, { color: BONE_P, bone: skull, sides: 6 });
    b.spike([s * 0.05, 1.61, 0.06], [s * 0.8, -0.5, -0.3], 0.08, 0.017, { color: BONE_P, bone: skull, sides: 6 });
    // horns
    const horn = bezier(
      [s * 0.045, 1.695, 0.03],
      [s * 0.09, 1.76, -0.04],
      [s * 0.15, 1.82, -0.15],
      [s * 0.15, 1.93, -0.3],
    );
    b.sweep(horn, [0.03, 0], { color: BONE_P, bone: skull, caps: "point", sides: 7 });
    for (const t of [0.28, 0.5]) ringAround(horn.at(t), horn.tangentAt(t), 0.03 * (1 - t) + 0.004, 0.006, GOLD_P, skull);
    // upper teeth
    for (let i = 0; i < 5; i++) {
      const z = 0.15 + i * 0.04;
      const k = (z - 0.12) / 0.21;
      const halfW = 0.05 - k * 0.0225;
      const by = 1.605 - k * 0.0125 + 0.004;
      tooth([s * halfW * 0.92, by, z], [0, -1, 0.15], i === 1 ? 0.065 : 0.032 - i * 0.002, i === 1 ? 0.01 : 0.007, skull);
    }
    // lower teeth
    for (let i = 0; i < 5; i++) {
      const u = 0.25 + i * 0.17;
      const p = lerp3(J, E, u);
      tooth([s * (0.0425 - u * 0.02) * 0.9, p[1] + 0.012, p[2]], [0, 1, -0.1], i === 3 ? 0.05 : 0.028, i === 3 ? 0.009 : 0.0065, jaw);
    }
  }
  for (const x of [-0.016, 0, 0.016]) tooth([x, 1.6, 0.335], [0, -1, 0.3], 0.03, 0.006, skull);
  // lower jaw
  b.frustumBox(J, E, [0.085, 0.03], [0.045, 0.025], { color: BONE_P, bone: jaw });
  b.spike([0, 1.5, 0.29], [0, -0.5, 1], 0.05, 0.012, { color: BONE_P, bone: jaw, sides: 5 });
  for (const s of [1, -1]) b.rod([s * 0.04, 1.6, 0.07], [s * 0.05, 1.655, 0.03], 0.012, BONE_P, { bone: jaw });
  // soul fire inside the mouth
  glow(b.part(sphere(1, 8, 5), C.teal, { at: [0, 1.562, 0.18], scale: [0.028, 0.008, 0.065], bone: jaw }), 1.4);
  // forehead gem and crest
  glow(
    b.part(new THREE.OctahedronGeometry(0.022), C.teal, { at: [0, 1.724, 0.09], bone: skull, flat: true, scale: [0.9, 1.3, 0.9] }),
    2,
  );
  ringAround(new THREE.Vector3(0, 1.716, 0.09), [0, 1, 0.1], 0.024, 0.006, GOLD_P, skull);
  [
    [0.04, 1.708, 0.07],
    [0.01, 1.69, 0.06],
    [-0.02, 1.67, 0.05],
  ].forEach(([z, y, len]) =>
    b.spike([0, y, z], [0, 1, -0.7], len, 0.014, { color: BONE_P, bone: skull, sides: 5 }),
  );

  // ===============================================================================================================
  // BLADE
  // Gilded heel plate with soul gems
  const plateOutline: [number, number][] = [
    [-0.08, 0.1],
    [0.04, 0.17],
    [0.17, 0.08],
    [0.2, -0.05],
    [0.12, -0.17],
    [0.0, -0.19],
    [-0.09, -0.08],
  ];
  b.extrude(plateOutline, {
    at: [0, TY, 0],
    thickness: 0.07,
    bevel: 0.01,
    smoothing: 1,
    color: GOLD_P,
    bone: bladeJ,
  });
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.03), C.teal, { at: [s * 0.04, TY - 0.01, 0.06], bone: bladeJ, flat: true, scale: [0.5, 1.2, 1] }),
      2,
    );
    plateOutline.forEach(([f, u], i) => {
      if (i % 2 === 0) b.part(sphere(0.009, 6, 4), C.goldLt, { at: [s * 0.036, TY + u * 0.8, f * 0.8 + 0.03], bone: bladeJ, flat: true });
    });
  }

  // The soul-fire blade itself
  glow(
    b.part(bladeGeometry(), "#ffffff", { at: [0, TY, 0], rotation: [0, -90, 0], texture: BLADE_TEX, bone: bladeJ }),
    1.3,
  );

  // Cutting edge, bright
  glow(b.sweep(botPath, [0.015, 0.004], { color: "#d8fff8", bone: bladeJ, caps: "point" }), 1.8);

  // Dragon-bone spine
  b.sweep(topPath, spineR, { color: BONE_P, bone: bladeJ, caps: { start: "round", end: "point" } });
  for (const t of [0.22, 0.45, 0.67]) {
    const { p } = spineFrame(t);
    b.part(sphere(spineR(t) + 0.014, 7, 5), BONE_P, { at: p, bone: bladeJ, flat: true });
    for (const s of [1, -1]) {
      glow(b.part(sphere(0.011, 6, 4), C.teal, { at: [s * (spineR(t) + 0.016), p.y, p.z], bone: bladeJ }), 1.6);
    }
  }
  for (const t of [0.1, 0.34, 0.56, 0.78]) {
    const { p, tg } = spineFrame(t);
    ringAround(p, tg, spineR(t) + 0.005, 0.009, GOLD_P, bladeJ);
  }
  // dorsal spikes
  for (let t = 0.08; t < 0.95; t += 0.1) {
    const { p, tg, n } = spineFrame(t);
    const base = p.clone().addScaledVector(n, spineR(t) * 0.8);
    const dir = n.clone().addScaledVector(tg, -0.6).normalize();
    b.spike(base, dir, 0.11 * (1 - 0.5 * t), 0.016, { color: BONE_P, bone: bladeJ, sides: 5 });
  }
  // wing-finger struts
  const struts: [number, number][] = [
    [0.05, 0.3],
    [0.2, 0.5],
    [0.4, 0.72],
    [0.6, 0.9],
  ];
  for (const [rt, et] of struts) {
    const a = botPath.at(rt);
    const c = topPath.at(et);
    const mid = a.clone().lerp(c, 0.5).add(new THREE.Vector3(0, 0.035, 0.0));
    b.sweep(bezier(a, mid, c), [0.017, 0.008], { color: BONE_P, bone: bladeJ, sides: 6 });
    b.part(sphere(0.02, 6, 4), BONE_P, { at: a, bone: bladeJ, flat: true });
  }
  // rear horn counterweight
  {
    const back = bezier([0, TY + 0.06, -0.04], [0, TY + 0.1, -0.2], [0, TY + 0.06, -0.35], [0, TY + 0.2, -0.47]);
    b.sweep(back, [0.042, 0], { color: BONE_P, bone: bladeJ, caps: "point", sides: 7 });
    for (const t of [0.25, 0.5]) ringAround(back.at(t), back.tangentAt(t), 0.04 * (1 - t) + 0.005, 0.008, GOLD_P, bladeJ);
    b.spike([0, TY + 0.07, -0.18], [0, 0.4, 1], 0.09, 0.017, { color: BONE_P, bone: bladeJ, sides: 5 });
  }

  // Spirit flames licking from the spine
  const wispFrames = [0.1, 0.2, 0.3, 0.42, 0.54, 0.66, 0.78, 0.88].map((t) => {
    const { p, n } = spineFrame(t);
    return frame(p.clone().addScaledVector(n, spineR(t) * 0.8), n);
  });
  glow(
    b.cards(wispFrames, WISP, {
      size: [0.07, 0.2],
      lean: 35,
      bend: 30,
      flow: [0, 0.2, -1],
      cross: true,
      vary: 0.4,
      rng: R,
      bone: bladeJ,
    }),
    1.2,
  );
  {
    const { p, tg } = spineFrame(0.99);
    glow(
      b.cards([frame(p, tg)], WISP, { size: [0.1, 0.32], lean: 20, bend: 25, flow: [0, 1, -0.3], cross: true, bone: bladeJ }),
      1.3,
    );
  }
  // mouth flame
  glow(
    b.cards([frame([0, 1.565, 0.2], [0, 1, 0])], WISP, {
      size: [0.05, 0.13],
      lean: 40,
      flow: [0, 0, 1],
      cross: true,
      bone: skull,
    }),
    1.2,
  );

  // Drifting souls under the cutting edge
  const moteSpec: [number, number, number][] = [
    [0.22, -0.1, 0.02],
    [0.4, -0.13, 0.025],
    [0.56, -0.09, 0.016],
    [0.72, -0.12, 0.02],
    [0.86, -0.1, 0.014],
  ];
  const moteFrames = moteSpec.map(([t, dy, r], i) => {
    const e = botPath.at(t);
    const pos = new THREE.Vector3(0, e.y + dy, e.z + 0.02 * (i % 2 ? 1 : -1));
    glow(b.part(sphere(r, 7, 5), C.tealWhite, { at: pos, bone: bladeJ }), 2);
    return frame(pos, [0, -1, 0]);
  });
  glow(
    b.cards(moteFrames, WISP, { size: [0.045, 0.13], lean: 0, bend: 20, flow: [0, 0, -1], cross: true, vary: 0.3, rng: R, bone: bladeJ }),
    1.2,
  );

  return b.root;
}
```