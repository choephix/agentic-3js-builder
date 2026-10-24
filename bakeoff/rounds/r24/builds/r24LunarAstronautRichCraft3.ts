import * as THREE from "three";
import { createBuilder, rng, limb, catmull, paint, mottle, noise, mix, smoothstep, svg, vec } from "../../../../src/index";

export const meta = {
  name: "Apollo Astronaut Planting the Flag",
  description:
    "A 1969 lunar astronaut in a dust-stained A7L suit and PLSS backpack, gold-visored helmet down, gripping an American flag on its horizontal-rod pole. Archival NASA look, with Beta-cloth white, grey regolith dust, patches and hoses.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const METAL = "#b7bbc4";
const METAL_DK = "#6c707c";
const RING = "#9da2ad";
const SOLE = "#3a393c";
const TOECAP = "#5d5b58";
const HOSE = "#2f3033";
const BLUE = "#2a50b8";
const RED = "#c2312b";
const GOLD = "#d4a23a";
const SKIN = "#d6a687";
const HELMET = "#eeece5";
const GREY_BOX = "#8f8e8a";
const OPS_GREY = "#d8d6cd";
const DUST_C = "#8f8a80";
const POLE = "#c9ccd2";
const GRIP = "#232326";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// White Beta-cloth, stained by lunar dust that thickens toward the ground, lit warm on top and cool beneath.
const SUIT = paint((p, n) => {
  const low = smoothstep(0.8, 0.02, p.y);
  let d = low * (0.35 + 0.9 * noise(p, 0.07, 3));
  d += 0.2 * smoothstep(0.58, 0.78, noise(p, 0.11, 8));
  d += 0.1 * smoothstep(0.6, 0.8, noise(p, 0.03, 12));
  d = clamp01(d) * 0.92;
  const c = mix([0.94, 0.93, 0.89], [0.47, 0.44, 0.41], d);
  const k = 0.84 + 0.16 * smoothstep(-0.9, 0.7, n.y);
  return [Math.min(1, c[0] * k * (1 + 0.04 * n.y)), c[1] * k, c[2] * k * (1 - 0.04 * n.y)] as const;
});

// Backpack: same cloth with horizontal panel seams on the broad faces.
const PLSS = paint((p, n) => {
  const c = SUIT.at(p, n);
  const seam = Math.abs(n.z) > 0.6 && (((p.y / 0.185) % 1) + 1) % 1 < 0.03;
  return seam ? mix(c, [0.34, 0.33, 0.31], 0.7) : c;
});

const GLOVE = mottle("#dcd8cc", "#8a8377", { size: 0.04, seed: 11 });
const MOUND = mottle("#a19b90", "#5f5a52", { size: 0.05, seed: 4, contrast: 1.4 });

// ---------------------------------------------------------------------------------------------------------------
// Drawings

function starPath(cx: number, cy: number, R: number) {
  const r = R * 0.382;
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    d += `${i ? "L" : "M"}${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }
  return d + "Z";
}

function flagSvg(folds: boolean, border = false) {
  let s = `<svg viewBox="0 0 190 100" xmlns="http://www.w3.org/2000/svg">`;
  const sh = 100 / 13;
  for (let i = 0; i < 13; i++)
    s += `<rect x="0" y="${(i * sh).toFixed(2)}" width="190" height="${(sh + 0.05).toFixed(2)}" fill="${i % 2 ? "#efeadb" : "#b22234"}"/>`;
  s += `<rect width="76" height="${(7 * sh).toFixed(2)}" fill="#3c3b6e"/>`;
  let d = "";
  const rowH = (7 * sh) / 10;
  for (let r = 0; r < 9; r++) {
    const y = (r + 1) * rowH;
    if (r % 2 === 0) for (let c = 0; c < 6; c++) d += starPath(((c * 2 + 1) * 76) / 12, y, 2.2);
    else for (let c = 0; c < 5; c++) d += starPath(((c * 2 + 2) * 76) / 12, y, 2.2);
  }
  s += `<path d="${d}" fill="#f4f1e6"/>`;
  if (folds) {
    const ops = [0, 0.22, 0, 0.1, 0.26, 0, 0.18, 0, 0.24, 0.05, 0.2, 0, 0.12];
    s += `<defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="0">${ops
      .map((o, i) => `<stop offset="${(i / 12).toFixed(3)}" stop-color="#1a1208" stop-opacity="${o}"/>`)
      .join("")}</linearGradient></defs><rect width="190" height="100" fill="url(#f)"/>`;
  }
  if (border) s += `<rect x="1" y="1" width="188" height="98" fill="none" stroke="#f2efe6" stroke-width="5"/>`;
  return s + `</svg>`;
}

const FLAG_TEX = svg(flagSvg(true), { size: 768 });
const FLAG_PATCH = svg(flagSvg(false, true), { size: 192 });

const VISOR_TEX = svg(
  `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a2504"/><stop offset=".36" stop-color="#7d5410"/>
        <stop offset=".5" stop-color="#e8b83e"/><stop offset=".64" stop-color="#f6d673"/><stop offset="1" stop-color="#c58f26"/>
      </linearGradient>
      <radialGradient id="v" cx=".5" cy=".5" r=".75">
        <stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1500" stop-opacity=".6"/>
      </radialGradient>
      <radialGradient id="s"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="256" height="128" fill="url(#g)"/>
    <path d="M0 74 L36 69 L78 73 L122 66 L170 72 L218 68 L256 73 L256 128 L0 128Z" fill="#f3d98a" opacity=".92"/>
    <path d="M0 84 L60 80 L140 86 L256 80 L256 128 L0 128Z" fill="#d9b25a" opacity=".6"/>
    <g transform="translate(158 66)">
      <path d="M-10 -14 L10 -14 L12 -2 L-12 -2Z" fill="#f2e8c8"/><rect x="-7" y="-2" width="14" height="5" fill="#7a6a40"/>
      <path d="M-12 3 L-17 12 M12 3 L17 12 M0 3 L0 12" stroke="#4a3d22" stroke-width="2"/>
    </g>
    <g transform="translate(96 70)">
      <circle cx="0" cy="-17" r="5" fill="#f5f1e6"/><rect x="-6" y="-12" width="12" height="17" rx="3" fill="#f5f1e6"/>
      <rect x="-4" y="-9" width="8" height="5" fill="#3a3a3e"/><path d="M-4 5 L-5 15 M4 5 L5 15" stroke="#f5f1e6" stroke-width="3"/>
    </g>
    <circle cx="214" cy="24" r="22" fill="url(#s)"/><circle cx="214" cy="24" r="6" fill="#fff"/>
    <path d="M30 20 L110 6 L100 22 L36 34Z" fill="#fff" opacity=".12"/>
    <rect width="256" height="128" fill="url(#v)"/>
  </svg>`,
  { size: 512 },
);

const NASA_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#10347a" stroke="#f2efe6" stroke-width="4"/>
    <g fill="#ffffff"><circle cx="20" cy="30" r="1.3"/><circle cx="34" cy="16" r="1.1"/><circle cx="72" cy="20" r="1.3"/><circle cx="82" cy="40" r="1"/><circle cx="26" cy="74" r="1.1"/><circle cx="64" cy="82" r="1.2"/><circle cx="50" cy="12" r="1"/></g>
    <ellipse cx="50" cy="50" rx="42" ry="13" fill="none" stroke="#f2efe6" stroke-width="2" transform="rotate(-28 50 50)"/>
    <path d="M16 72 Q48 28 88 36 Q58 44 40 78Z" fill="#d22b24"/>
    <text x="50" y="60" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="bold" font-size="25" fill="#ffffff" stroke="#10347a" stroke-width=".6">NASA</text>
  </svg>`,
  { size: 192 },
);

const NAME_TEX = svg(
  `<svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="196" height="46" rx="6" fill="#1c3f84" stroke="#f2efe6" stroke-width="3"/>
    <text x="100" y="34" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="bold" font-size="25" letter-spacing="2" fill="#ffffff">ARMSTRONG</text>
  </svg>`,
  { size: 320 },
);

const RCU_TEX = svg(
  `<svg viewBox="0 0 190 95" xmlns="http://www.w3.org/2000/svg">
    <rect width="190" height="95" rx="6" fill="#2c2f35"/><rect x="5" y="5" width="180" height="85" rx="4" fill="#3b3f47" stroke="#6c707c" stroke-width="1.5"/>
    <rect x="12" y="12" width="52" height="24" rx="2" fill="#0d1210"/>
    <text x="38" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#9be8a4">03.5</text>
    <g fill="#d9d6cc"><circle cx="86" cy="24" r="7"/><circle cx="108" cy="24" r="7"/><circle cx="130" cy="24" r="7"/></g>
    <g stroke="#101214" stroke-width="3"><path d="M86 24 L86 17"/><path d="M108 24 L111 18"/><path d="M130 24 L130 31"/></g>
    <rect x="12" y="46" width="40" height="14" fill="#c2312b"/><rect x="58" y="46" width="40" height="14" fill="#e0b13a"/><rect x="104" y="46" width="40" height="14" fill="#2a50b8"/>
    <text x="95" y="82" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="bold" font-size="11" fill="#d9d6cc">O2   H2O   COMM</text>
  </svg>`,
  { size: 256 },
);

const PLSS_TEX = svg(
  `<svg viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg">
    <rect width="220" height="280" fill="#e6e3d8"/>
    <rect x="14" y="14" width="192" height="70" rx="6" fill="#cfccbf" stroke="#8b887d" stroke-width="2"/>
    <rect x="14" y="98" width="90" height="88" rx="6" fill="#d5d2c6" stroke="#8b887d" stroke-width="2"/>
    <rect x="116" y="98" width="90" height="88" rx="6" fill="#d5d2c6" stroke="#8b887d" stroke-width="2"/>
    <rect x="14" y="200" width="192" height="66" rx="6" fill="#cbc8bb" stroke="#8b887d" stroke-width="2"/>
    <g fill="#77746b">${[22, 60, 98, 136, 174, 198].map((x) => `<circle cx="${x}" cy="22" r="2.4"/><circle cx="${x}" cy="76" r="2.4"/><circle cx="${x}" cy="208" r="2.4"/><circle cx="${x}" cy="258" r="2.4"/>`).join("")}</g>
    <text x="110" y="58" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="bold" font-size="30" fill="#2b2b2e">PLSS</text>
    <text x="110" y="74" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="9" fill="#2b2b2e">PORTABLE LIFE SUPPORT SYSTEM</text>
    <path d="M22 106 L96 106 L96 122 L22 122Z M22 130 L96 130 L96 146 L22 146Z" fill="#e0a82e"/>
    <path d="M28 106 L40 122 M48 106 L60 122 M68 106 L80 122 M28 130 L40 146 M48 130 L60 146 M68 130 L80 146" stroke="#2b2b2e" stroke-width="5"/>
    <rect x="124" y="108" width="74" height="30" fill="#c2312b"/>
    <text x="161" y="127" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="bold" font-size="11" fill="#fff">REMOVE</text>
    <circle cx="161" cy="162" r="16" fill="#8d8c88" stroke="#4a4a4d" stroke-width="3"/><circle cx="161" cy="162" r="6" fill="#2b2b2e"/>
    <circle cx="59" cy="162" r="16" fill="#2a50b8" stroke="#4a4a4d" stroke-width="3"/><circle cx="59" cy="162" r="6" fill="#d9d6cc"/>
    <text x="110" y="240" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="bold" font-size="22" fill="#10347a">NASA</text>
    <text x="110" y="256" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="9" fill="#2b2b2e">UNITED STATES</text>
  </svg>`,
  { size: 384 },
);

// ---------------------------------------------------------------------------------------------------------------

function rrect(w: number, h: number): [number, number][] {
  return [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
}

export default function build() {
  const b = createBuilder({ name: "apollo_astronaut" });
  const rand = rng(1969);

  // Flag layout
  const PX = 0.35;
  const PZ = 0.325;
  const FW = 0.95;
  const FH = 0.5;
  const FTOP = 2.34;

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.92, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.92, 0],
      [0, 1.14, 0],
      [0, 1.34, 0.01],
      [0, 1.5, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.5, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.57, 0], dir: [0, 1, 0.05], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.64, 0.03], aim: [0, 1.62, 0.14], role: "jaw" });
  const pole = b.joint("flagpole", { parent: hips, at: [PX, 0, PZ], dir: [0, 1, 0] });

  const plate = (
    w: number,
    h: number,
    t: number,
    at: number[],
    color: any,
    bone: any,
    x: number[] = [1, 0, 0],
    y: number[] = [0, 1, 0],
  ) =>
    b.extrude(rrect(w, h), {
      at,
      x,
      y,
      thickness: t,
      bevel: Math.min(0.012, t * 0.35),
      smoothing: 1,
      color,
      bone,
    });

  // ------------------------------------------------------------------------------------------------ torso
  const torso = b.loft(
    [
      { at: [0, 0.86, 0], w: 0.34, h: 0.24 },
      { at: [0, 0.98, 0], w: 0.4, h: 0.28 },
      { at: [0, 1.14, 0.005], w: 0.43, h: 0.32 },
      { at: [0, 1.32, 0.01], w: 0.48, h: 0.35 },
      { at: [0, 1.47, 0], w: 0.54, h: 0.33 },
      { at: [0, 1.55, 0], w: 0.46, h: 0.3 },
    ],
    { bone: spine, color: SUIT, caps: "flat" },
  );
  const skinT = b.surface(torso);
  const zAt = (x: number, y: number) => skinT.ray([x, y, 1], [0, 0, -1])?.at.z ?? 0.17;

  // belts and bellows rings round the waist
  for (const [y, r, col] of [
    [0.98, 0.016, "#a9a79f"],
    [1.03, 0.012, "#c4c1b6"],
    [1.07, 0.012, "#b4b1a6"],
  ] as [number, number, string][])
    b.sweep(skinT.loop([0, y, 0], { lift: 0.01 }), r, { color: col });
  b.sweep(skinT.loop([0, 1.34, 0], { lift: 0.006 }), 0.008, { color: "#bdbaaf" });
  // buckle
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.02), METAL, { bone: hips, at: [0, 1.0, zAt(0, 1.0) + 0.012] });

  // neck ring with bolts and locks
  b.part(new THREE.CylinderGeometry(0.14, 0.15, 0.065, 14), METAL, { bone: neck, at: [0, 1.555, 0] });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 14), METAL_DK, { bone: neck, at: [0, 1.595, 0] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.01, 5, 4), METAL_DK, {
      bone: neck,
      at: [Math.sin(a) * 0.146, 1.558, Math.cos(a) * 0.146],
    });
  }
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 10), s > 0 ? BLUE : RED, {
      bone: neck,
      at: [s * 0.158, 1.555, 0.02],
      dir: [s, 0, 0],
    });

  // chest: remote control unit, connectors, patches
  const zR = zAt(0, 1.2);
  plate(0.2, 0.105, 0.05, [0, 1.2, zR + 0.018], "#2c2f35", chest);
  b.part(new THREE.PlaneGeometry(0.19, 0.095), "#ffffff", {
    bone: chest,
    at: [0, 1.2, zR + 0.0435],
    dir: [0, 0, 1],
    axis: "z",
    texture: RCU_TEX,
  });
  for (const s of [1, -1]) {
    const cz = zAt(s * 0.115, 1.34);
    b.part(new THREE.CylinderGeometry(0.032, 0.036, 0.04, 10), METAL, {
      bone: chest,
      at: [s * 0.115, 1.34, cz + 0.012],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 8), s > 0 ? BLUE : RED, {
      bone: chest,
      at: [s * 0.115, 1.34, cz + 0.04],
      dir: [0, 0, 1],
    });
    // hose over the shoulder to the backpack
    b.sweep(
      catmull([
        [s * 0.115, 1.37, cz + 0.035],
        [s * 0.15, 1.46, 0.17],
        [s * 0.17, 1.58, 0.1],
        [s * 0.19, 1.59, -0.02],
        [s * 0.17, 1.58, -0.13],
        [s * 0.14, 1.57, -0.2],
        [s * 0.14, 1.53, -0.25],
      ]),
      0.017,
      { bone: chest, color: HOSE, sides: 6 },
    );
    for (const t of [0.25, 0.5, 0.75])
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.014, 8), METAL_DK, {
        bone: chest,
        at: [s * (0.15 + 0.04 * Math.sin(t * 3)), 1.46 + t * 0.13, 0.17 - t * 0.2],
        dir: [0, 1, 0.2],
      });
  }
  b.decal(torso, NASA_TEX, { at: [0.125, 1.445, zAt(0.125, 1.445)], dir: [0, 0, 1], size: [0.075, 0.075] });
  b.decal(torso, NAME_TEX, { at: [-0.12, 1.445, zAt(-0.12, 1.445)], dir: [0, 0, 1], size: [0.15, 0.038] });

  // ------------------------------------------------------------------------------------------------ backpack (PLSS + OPS)
  plate(0.44, 0.56, 0.24, [0, 1.27, -0.29], PLSS, chest);
  plate(0.38, 0.1, 0.22, [0, 0.96, -0.285], GREY_BOX, chest);
  plate(0.36, 0.2, 0.19, [0, 1.64, -0.325], OPS_GREY, chest);
  b.part(new THREE.PlaneGeometry(0.4, 0.51), "#ffffff", {
    bone: chest,
    at: [0, 1.27, -0.4125],
    dir: [0, 0, -1],
    axis: "z",
    texture: PLSS_TEX,
  });
  for (const s of [1, -1]) {
    // side ribs and fill caps
    b.rod([s * 0.222, 1.0, -0.39], [s * 0.222, 1.53, -0.39], 0.01, METAL, { bone: chest });
    b.rod([s * 0.222, 1.0, -0.19], [s * 0.222, 1.53, -0.19], 0.01, METAL, { bone: chest });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), s > 0 ? BLUE : RED, {
      bone: chest,
      at: [s * 0.23, 1.12, -0.29],
      dir: [s, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), METAL, { bone: chest, at: [s * 0.14, 1.755, -0.33] });
  }
  // OPS fittings
  b.part(new THREE.BoxGeometry(0.1, 0.05, 0.04), METAL_DK, { bone: chest, at: [0, 1.7, -0.43] });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 8), GOLD, {
      bone: chest,
      at: [s * 0.1, 1.63, -0.43],
      dir: [0, 0, -1],
    });
  // whip antenna
  b.part(new THREE.CylinderGeometry(0.02, 0.026, 0.05, 8), METAL_DK, { bone: chest, at: [0.12, 1.755, -0.33] });
  b.sweep(
    catmull([
      [0.12, 1.77, -0.33],
      [0.15, 2.0, -0.34],
      [0.22, 2.3, -0.36],
    ]),
    [0.007, 0.0045],
    { bone: chest, color: METAL, sides: 6 },
  );
  b.part(new THREE.SphereGeometry(0.014, 6, 5), "#d9482e", { bone: chest, at: [0.22, 2.31, -0.36] });

  // ------------------------------------------------------------------------------------------------ helmet
  const HR = 0.185;
  const HC = [0, 1.69, 0.015];
  b.part(new THREE.SphereGeometry(1, 16, 11), HELMET, {
    bone: head,
    at: HC,
    scale: [HR, HR * 1.04, HR * 1.02],
  });
  // the gold visor, textured with a reflected lunar scene
  b.part(new THREE.SphereGeometry(1, 22, 12, Math.PI / 2 - 1.2, 2.4, 0.8, 1.4), "#ffffff", {
    bone: head,
    at: HC,
    scale: [HR * 1.05, HR * 1.09, HR * 1.07],
    texture: VISOR_TEX,
  });
  // sun-shade hood over the brow
  b.part(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, 0.74), HELMET, {
    bone: head,
    at: [0, 1.69, 0.02],
    scale: [HR * 1.1, HR * 1.1, HR * 1.12],
    rotation: [9, 0, 0],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.034, 10), METAL, {
      bone: head,
      at: [s * (HR + 0.002), 1.65, 0.0],
      dir: [s, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.045, 8), METAL_DK, {
      bone: head,
      at: [s * (HR + 0.008), 1.65, 0.0],
      dir: [s, 0, 0],
    });
  }
  // hidden face, so the jaw can move under the visor
  b.part(new THREE.SphereGeometry(0.085, 8, 6), SKIN, { bone: head, at: [0, 1.7, 0.03] });
  b.part(new THREE.BoxGeometry(0.1, 0.045, 0.1), SKIN, { bone: jaw, at: [0, 1.62, 0.07] });

  // ------------------------------------------------------------------------------------------------ legs and boots
  const legSweeps: Record<string, any> = {};
  const legJoints: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.115, 0.9, 0], [s * 0.14, 0.16, -0.02], [0.4, 0.39], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.14, 0, 0.04],
    });
    const ankle = leg.joints[2];
    legJoints[side] = leg.joints;
    const sweep = b.sweep(leg, [0.1, 0.096, 0.083, 0.07, 0.064], { color: SUIT });
    legSweeps[side] = sweep;

    // convolute rings at knee and thigh
    b.along(leg, 3, (at) => b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.016, 10), RING, { frame: at }), {
      from: 0.43,
      to: 0.57,
    });
    b.along(leg, 2, (at) => b.part(new THREE.CylinderGeometry(0.106, 0.106, 0.014, 10), "#bcb9ae", { frame: at }), {
      from: 0.1,
      to: 0.18,
    });

    // boot
    b.loft(
      [
        { at: [s * 0.14, 0.115, -0.05], w: 0.125, h: 0.23 },
        { at: [s * 0.14, 0.105, 0.0], w: 0.145, h: 0.21 },
        { at: [s * 0.14, 0.085, 0.07], w: 0.155, h: 0.17 },
        { at: [s * 0.14, 0.07, 0.13], w: 0.14, h: 0.14 },
      ],
      { bone: ankle, color: SUIT },
    );
    b.part(new THREE.BoxGeometry(0.16, 0.03, 0.33), SOLE, { bone: ankle, at: [s * 0.14, 0.012, 0.04] });
    for (let i = 0; i < 5; i++)
      b.part(new THREE.BoxGeometry(0.165, 0.008, 0.016), "#2a292b", {
        bone: ankle,
        at: [s * 0.14, -0.001, -0.07 + i * 0.05],
      });
    b.part(new THREE.CylinderGeometry(0.074, 0.08, 0.034, 10), RING, { bone: ankle, at: [s * 0.14, 0.222, -0.03] });
    const toe = b.joint(`toe${side}`, {
      parent: ankle,
      at: [s * 0.14, 0.05, 0.09],
      dir: [0, 0, 1],
      role: "digit",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), TOECAP, {
      bone: toe,
      at: [s * 0.14, 0.062, 0.145],
      scale: [0.072, 0.056, 0.075],
    });
    // instep strap
    b.sweep(
      [
        [s * 0.07, 0.1, 0.02],
        [s * 0.14, 0.19, 0.02],
        [s * 0.21, 0.1, 0.02],
      ],
      0.01,
      { bone: ankle, color: "#aaa89e", sides: 5 },
    );
    // regolith clumps clinging to the lower leg
    const hits = b.surface(sweep).scatter(14, { rng: rand, minDist: 0.05, filter: (h) => h.at.y < 0.5 });
    for (const h of hits)
      b.stick(new THREE.SphereGeometry(0.014, 5, 4), DUST_C, h, { embed: 0.4, scale: 0.8 + 0.7 * rand() });
  }

  // thigh pocket on the left leg
  {
    const hit = b.surface(legSweeps["L"]).ray([0.5, 0.7, 0.0], [-1, 0, 0]);
    const x = (hit ? hit.at.x : 0.21) + 0.012;
    const hipL = legJoints["L"][0];
    b.extrude(rrect(0.11, 0.15), {
      at: [x, 0.69, 0.0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 1,
      color: "#d8d5ca",
      bone: hipL,
    });
    b.extrude(rrect(0.115, 0.05), {
      at: [x + 0.004, 0.745, 0.0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.034,
      bevel: 0.006,
      smoothing: 1,
      color: "#c9c6b9",
      bone: hipL,
    });
    b.part(new THREE.SphereGeometry(0.01, 5, 4), METAL, { bone: hipL, at: [x + 0.02, 0.742, 0] });
  }

  // ------------------------------------------------------------------------------------------------ arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = [s * 0.3, 1.45, 0];
    const target = s > 0 ? [0.355, 1.22, 0.25] : [-0.5, 1.0, 0.14];
    const hint = s > 0 ? [0.4, -0.2, -1] : [-0.2, 0, -1];
    const pts = limb(sh, target, [0.28, 0.26], hint);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const wrist = arm.joints[2];
    const armSweep = b.sweep(arm, [0.07, 0.066, 0.06, 0.054, 0.05], { color: SUIT });
    b.part(new THREE.SphereGeometry(1, 8, 6), SUIT, {
      bone: arm.joints[0],
      at: sh,
      scale: [0.088, 0.085, 0.088],
    });
    b.along(arm, 3, (at) => b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.014, 10), RING, { frame: at }), {
      from: 0.44,
      to: 0.56,
    });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.045, 12), RING, { frame: wrist });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 12), METAL_DK, { frame: wrist, at: vec(target).add(vec([0, 0, 0])) });

    if (s > 0) {
      b.decal(armSweep, FLAG_PATCH, { at: [0.36, 1.4, 0.0], dir: [1, 0.25, 0], size: [0.075, 0.05] });
      // --- left fist gripping the flagpole
      const y0 = 1.22;
      b.capsule(target, [PX, y0, PZ - 0.045], [0.046, 0.05], { bone: wrist, color: GLOVE });
      b.part(new THREE.BoxGeometry(0.088, 0.104, 0.055), GLOVE, { bone: wrist, at: [PX, y0, PZ - 0.035] });
      for (let i = 0; i < 4; i++) {
        const y = y0 + (1.5 - i) * 0.022;
        const fj = b.joint(`fingerL${i + 1}`, { parent: wrist, at: [PX, y, PZ], dir: [1, 0, 0], role: "digit" });
        b.sweep(
          catmull([
            [PX + 0.046, y, PZ - 0.025],
            [PX + 0.042, y, PZ + 0.016],
            [PX + 0.005, y, PZ + 0.034],
            [PX - 0.04, y, PZ + 0.018],
          ]),
          0.0125,
          {
            bone: fj,
            sides: 6,
            color: GLOVE,
            bands: [
              [0.8, GLOVE],
              [1, "#58554f"],
            ],
          },
        );
      }
      const tj = b.joint("thumbL", { parent: wrist, at: [PX + 0.03, y0 + 0.05, PZ], dir: [-1, 0, 0.3], role: "digit" });
      b.capsule([PX + 0.04, y0 + 0.058, PZ - 0.03], [PX - 0.02, y0 + 0.052, PZ + 0.028], 0.014, {
        bone: tj,
        color: GLOVE,
        sides: 6,
      });
    } else {
      // --- right hand open and relaxed
      const wr = vec(pts[2]);
      const el = vec(pts[1]);
      const d = wr.clone().sub(el).normalize();
      const width = new THREE.Vector3().crossVectors(d, new THREE.Vector3(1, 0, 0)).normalize();
      const nrm = new THREE.Vector3(1, 0, 0);
      const at = (k: number, w: number, c = 0) =>
        wr.clone().addScaledVector(d, k).addScaledVector(width, w).addScaledVector(nrm, c);
      b.sweep([wr, at(0.09, 0)], () => [0.02, 0.046], { bone: wrist, color: GLOVE, sides: 8 });
      const names = ["index", "middle", "ring", "pinky"];
      const lens = [0.052, 0.058, 0.052, 0.042];
      names.forEach((nm, i) => {
        const w = (1.5 - i) * 0.022;
        const L = lens[i];
        const f = b.chain(`${nm}R`, [at(0.085, w), at(0.085 + L * 0.5, w, 0.004), at(0.085 + L, w, 0.014)], {
          parent: wrist,
          names: [`${nm}R1`, `${nm}R2`],
          role: "digit",
        });
        b.sweep(f, [0.0115, 0.0095], {
          sides: 6,
          color: GLOVE,
          bands: [
            [0.65, GLOVE],
            [1, "#58554f"],
          ],
        });
      });
      const th = b.chain(
        "thumbR",
        [
          at(0.03, 0.05),
          at(0.055, 0.075, 0.006),
          at(0.085, 0.095, 0.012),
        ],
        { parent: wrist, names: ["thumbR1", "thumbR2"], role: "digit" },
      );
      b.sweep(th, [0.0135, 0.0105], { sides: 6, color: GLOVE });
    }
  }

  // ------------------------------------------------------------------------------------------------ flag and pole
  b.part(new THREE.CylinderGeometry(1, 1, 1, 8), "#000000", { bone: pole, at: [PX, -5, PZ], scale: 0.0001 }); // placeholder removed by scale below
  b.rod([PX, 0, PZ], [PX, 2.42, PZ], 0.0125, POLE, { bone: pole, sides: 8 });
  b.rod([PX, 1.1, PZ], [PX, 1.36, PZ], 0.0148, GRIP, { bone: pole, sides: 8 });
  for (const y of [0.55, 0.95, 1.7, 2.1])
    b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.03, 8), "#8a8d95", { bone: pole, at: [PX, y, PZ] });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), METAL, { bone: pole, at: [PX, 2.43, PZ] });
  // T-joint and horizontal rod that holds the flag out
  b.part(new THREE.BoxGeometry(0.035, 0.035, 0.035), METAL_DK, { bone: pole, at: [PX, FTOP + 0.02, PZ] });
  b.rod([PX - 0.02, FTOP + 0.02, PZ], [PX + FW + 0.04, FTOP + 0.02, PZ], 0.007, POLE, { bone: pole, sides: 6 });
  b.part(new THREE.SphereGeometry(0.012, 6, 5), METAL, { bone: pole, at: [PX + FW + 0.045, FTOP + 0.02, PZ] });

  // the cloth, rippled and printed on both sides
  const flagGeo = new THREE.PlaneGeometry(FW, FH, 24, 10);
  const pos = flagGeo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = (x + FW / 2) / FW;
    const v = (FH / 2 - y) / FH;
    pos.setZ(i, 0.034 * Math.sin(u * Math.PI * 4.2 + v * 1.5) * Math.min(1, u * 5) * (0.35 + 0.65 * v));
    pos.setY(i, y - 0.015 * u * v);
  }
  flagGeo.translate(PX + 0.015 + FW / 2, FTOP - FH / 2, PZ);
  flagGeo.computeVertexNormals();
  const backGeo = flagGeo.clone();
  const idx = backGeo.getIndex()!;
  for (let i = 0; i < idx.count; i += 3) {
    const a1 = idx.getX(i + 1);
    idx.setX(i + 1, idx.getX(i + 2));
    idx.setX(i + 2, a1);
  }
  backGeo.translate(0, 0, -0.004);
  backGeo.computeVertexNormals();
  b.part(flagGeo, "#ffffff", { bone: pole, at: [0, 0, 0], texture: FLAG_TEX });
  b.part(backGeo, "#ffffff", { bone: pole, at: [0, 0, 0], texture: FLAG_TEX });
  // hoist sleeve
  b.rod([PX + 0.015, FTOP + 0.003, PZ], [PX + FW + 0.01, FTOP + 0.003, PZ], 0.006, "#d8d4c6", { bone: pole, sides: 5 });

  // planted base: a low heap of disturbed regolith
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.16, 0.022],
      [0.09, 0.045],
      [0.035, 0.058],
      [0, 0.06],
    ],
    { at: [PX, 0, PZ], axis: [0, 1, 0], segments: 10, smoothing: 1, color: MOUND, bone: pole },
  );

  return b.root;
}
