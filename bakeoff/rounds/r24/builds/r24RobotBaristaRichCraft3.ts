import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  limb,
  paint,
  mix,
  noise,
  smoothstep,
  stripes,
  grain,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Robot Barista",
  description:
    "An Aperture Science enrichment-centre barista android: glossy white panels, black joints, orange trim, amber eyes, an espresso-boiler backpack with steam wand, a coffee cup in one hand and the cake in the other.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const INK = "#15171b";
const CHAR = "#2b2f36";
const WHITE = "#eef0f2";
const ORANGE = "#ff8a1f";
const AMBER = "#ffc14a";
const STEEL = "#9aa3ad";
const BRASS = "#d1a24a";
const CREAM = "#f3ead6";
const CHOC = "#4a2a1a";
const ICING = "#f7f2e6";
const CUP = "#f4f1ea";
const CHERRY = "#c8202a";
const BLUE = "#4fb6ff";
const COFFEE = "#5b341c";

const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------------------------------------------------------
// Paints
function whiteShade(p: THREE.Vector3, n: THREE.Vector3) {
  let c = mix("#eceff2", "#c3ccd9", smoothstep(0.1, -0.9, n.y));
  c = mix(c, "#fff4e0", smoothstep(0.4, 1, n.y) * 0.55);
  c = mix(c, "#c4c6c9", smoothstep(0.58, 0.9, noise(p, 0.1, 4)) * 0.4);
  c = mix(c, "#9a9288", smoothstep(0.25, 0.0, p.y) * 0.5);
  return c;
}

function panelPaint(size: number, aspect: number, seed = 1) {
  const cu = size;
  const cv = size * aspect;
  return paint((p, n) => {
    const c = whiteShade(p, n);
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    let u = p.x;
    let v = p.y;
    if (ax >= ay && ax >= az) {
      u = p.z;
      v = p.y;
    } else if (ay >= ax && ay >= az) {
      u = p.x;
      v = p.z;
    }
    u += seed * 0.037;
    v += seed * 0.021;
    const iu = Math.floor(u / cu);
    const iv = Math.floor(v / cv);
    const du = fract(u / cu) * cu;
    const dv = fract(v / cv) * cv;
    const m = Math.min(du, cu - du, dv, cv - dv);
    if (m < 0.0022) return mix(c, "#3d424c", 0.8);
    if (m < 0.005) return mix(c, "#ffffff", 0.25);
    const h = (Math.abs(iu * 73 + iv * 151) % 7) / 7;
    return mix(c, "#b4bbc6", h * 0.14);
  });
}

const HC = [0, 1.585, 0.01];
const hp = (x: number, y: number, z: number) => [HC[0] + x, HC[1] + y, HC[2] + z];

const headPaint = paint((p, n) => {
  const c = whiteShade(p, n);
  const dx = p.x - HC[0];
  const dy = p.y - HC[1];
  const dz = p.z - HC[2];
  const hor = Math.hypot(dx, dz);
  const lat = Math.atan2(dy, hor);
  const lon = Math.atan2(dx, dz);
  if (Math.abs(lat - 0.62) * 0.18 < 0.0022) return mix(c, "#3d424c", 0.8);
  if (lat > 0.62 && Math.abs(Math.sin(lon * 2)) * 0.5 * hor < 0.0022) return mix(c, "#3d424c", 0.8);
  if (Math.abs(lon) > 1.45 && Math.abs(lon) < 1.7 && Math.abs(lat) < 0.5 && Math.abs(Math.abs(lon) - 1.57) < 0.02)
    return mix(c, "#3d424c", 0.7);
  return c;
});

const PANEL = panelPaint(0.12, 0.8, 1);
const PANEL_S = panelPaint(0.06, 0.8, 2);
const COPPER = grain("#b5653a", "#e39a64", { size: 0.012, axis: "x" });
const HAZARD = stripes(ORANGE, INK, { size: 0.045, axis: [1, 0, 0], width: 0.5, wobble: 0 });

// ---------------------------------------------------------------------------------------------------------------
// Textures
const logoInner = (c: string) => {
  let blades = "";
  for (let i = 0; i < 6; i++)
    blades += `<path transform="rotate(${i * 60} 50 50)" d="M50 17 C64 17 78 25 84 38 L74 38 C70 30 60 27 50 27 Z" fill="${c}"/>`;
  return `<circle cx="50" cy="50" r="45" fill="none" stroke="${c}" stroke-width="7"/>${blades}`;
};
const logoTex = (c: string) =>
  svg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${logoInner(c)}</svg>`, { size: 192 });
const LOGO_O = logoTex(ORANGE);
const LOGO_D = logoTex(CHAR);

const EYE = (() => {
  let blades = "";
  for (let i = 0; i < 8; i++)
    blades += `<line x1="50" y1="50" x2="50" y2="13" transform="rotate(${i * 45} 50 50)" stroke="#c4600a" stroke-width="1.6"/>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff3b0"/><stop offset="0.55" stop-color="#ffc14a"/><stop offset="1" stop-color="#ff8a1f"/></radialGradient></defs>
    <circle cx="50" cy="50" r="48" fill="#0b0c10"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#ff8a1f" stroke-width="3"/>
    <circle cx="50" cy="50" r="40" fill="url(#g)"/>
    ${blades}
    <circle cx="50" cy="50" r="40" fill="none" stroke="#b85a08" stroke-width="2"/>
    <circle cx="50" cy="50" r="13" fill="#3a1a00"/>
    <circle cx="50" cy="50" r="13" fill="none" stroke="#ffdf8a" stroke-width="2"/>
    <circle cx="35" cy="34" r="6" fill="#ffffff"/>
    <circle cx="62" cy="66" r="3" fill="#ffffff"/>
  </svg>`,
    { size: 256 },
  );
})();

const APRON = svg(
  `<svg viewBox="0 0 75 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c525e"/><stop offset="1" stop-color="#2b2f36"/></linearGradient></defs>
  <path d="M20 2 L55 2 L58 30 L73 36 L73 98 L2 98 L2 36 L17 30 Z" fill="url(#a)" stroke="#15171b" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M21.5 6 L53.5 6 L56 32 L69 37.5 L69 94 L6 94 L6 37.5 L19 32 Z" fill="none" stroke="#ff8a1f" stroke-width="1.4" stroke-dasharray="4 2.5"/>
  <g transform="translate(26.5 8) scale(0.22)">${logoInner(ORANGE)}</g>
  <text x="37.5" y="40" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="5" fill="#ffb25a">CAFE SCIENCE</text>
  <path d="M18 62 L57 62 L57 88 Q57 90 55 90 L20 90 Q18 90 18 88 Z" fill="#383d47" stroke="#15171b" stroke-width="1.6"/>
  <path d="M20.5 64.5 L54.5 64.5 L54.5 87.5 L20.5 87.5 Z" fill="none" stroke="#ff8a1f" stroke-width="0.9" stroke-dasharray="2.5 1.8"/>
  <text x="37.5" y="75" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="5.2" fill="#e8ecf2">TASTE:</text>
  <text x="37.5" y="82" text-anchor="middle" font-family="sans-serif" font-size="4.4" fill="#ffb25a">*neurotoxin free</text>
</svg>`,
  { size: 384 },
);

const TAG = svg(
  `<svg viewBox="0 0 60 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="58" height="34" rx="5" fill="#f4f1ea" stroke="#15171b" stroke-width="2"/>
  <path d="M3 3 H57 V12 H3 Z" fill="#ff8a1f"/>
  <text x="30" y="10" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="6" fill="#ffffff">HELLO, I AM</text>
  <text x="30" y="27" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#15171b">CAFFY</text>
  <text x="30" y="33" text-anchor="middle" font-family="sans-serif" font-size="3.6" fill="#555">Unit 0.7 / Barista</text>
</svg>`,
  { size: 256 },
);

const GAUGE = (() => {
  const pt = (r: number, a: number) =>
    `${(50 + r * Math.sin((a * Math.PI) / 180)).toFixed(2)} ${(50 - r * Math.cos((a * Math.PI) / 180)).toFixed(2)}`;
  let ticks = "";
  for (let i = 0; i <= 10; i++) {
    const a = -135 + i * 27;
    ticks += `<path d="M${pt(42, a)} L${pt(i % 2 ? 36 : 32, a)}" stroke="#2a1d10" stroke-width="${i % 2 ? 2 : 3}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#efe3c2" stroke="#3a2a14" stroke-width="2.5"/>
    <path d="M${pt(40, 81)} A40 40 0 0 1 ${pt(40, 135)}" stroke="#b3261e" stroke-width="7" fill="none"/>
    ${ticks}
    <text x="50" y="72" text-anchor="middle" font-family="serif" font-weight="bold" font-size="11" fill="#2a1d10">BAR</text>
    <path d="M${pt(4, -50)} L${pt(38, 40)} L${pt(4, 130)} L${pt(10, 220)} Z" fill="#b3261e"/>
    <circle cx="50" cy="50" r="4" fill="#2a1d10"/>
  </svg>`,
    { size: 192 },
  );
})();

const GRILLE = (() => {
  let slits = "";
  for (let i = 0; i < 5; i++)
    slits += `<rect x="${10 + (i === 2 ? 0 : 4)}" y="${6 + i * 6.4}" width="${80 - (i === 2 ? 0 : 8)}" height="3" rx="1.5" fill="#ffb040"/>`;
  return svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="98" height="38" rx="12" fill="#1b1e24" stroke="#0b0c10" stroke-width="2"/>
    ${slits}
  </svg>`,
    { size: 192 },
  );
})();

const LABEL = svg(
  `<svg viewBox="0 0 110 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="108" height="34" rx="4" fill="#ff8a1f" stroke="#15171b" stroke-width="2"/>
  <rect x="5" y="5" width="100" height="20" rx="2" fill="#15171b"/>
  <text x="55" y="16" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="#ffffff">CAFFEINE ENRICHMENT</text>
  <text x="55" y="22.5" text-anchor="middle" font-family="sans-serif" font-size="4.6" fill="#ffc14a">PRESSURE VESSEL - DO NOT SHAKE</text>
  <path d="M5 28 L13 28 L9 33 L1 33 Z M17 28 L25 28 L21 33 L13 33 Z M29 28 L37 28 L33 33 L25 33 Z M41 28 L49 28 L45 33 L37 33 Z M53 28 L61 28 L57 33 L49 33 Z M65 28 L73 28 L69 33 L61 33 Z M77 28 L85 28 L81 33 L73 33 Z M89 28 L97 28 L93 33 L85 33 Z" fill="#15171b"/>
</svg>`,
  { size: 320 },
);

const STEAM = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 78 C3 60 37 46 20 28 C9 15 26 9 20 3" fill="none" stroke="#eef3f9" stroke-width="8" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
const glowCache = new Map<string, THREE.MeshStandardMaterial>();
function glow<T extends { mesh: THREE.Mesh }>(part: T, k = 1): T {
  const src = part.mesh.material as THREE.MeshStandardMaterial;
  const key = `${src.uuid}:${k}`;
  let m = glowCache.get(key);
  if (!m) {
    m = src.clone();
    m.emissive.copy(src.color);
    m.emissiveMap = src.map;
    m.emissiveIntensity = k;
    glowCache.set(key, m);
  }
  part.mesh.material = m;
  return part;
}

const lerpKeys = (t: number, a: number[]) => {
  const x = Math.min(Math.max(t, 0), 1) * (a.length - 1);
  const i = Math.min(Math.floor(x), a.length - 2);
  return a[i] + (a[i + 1] - a[i]) * (x - i);
};

export default function build() {
  const b = createBuilder({ name: "robotBarista", paintSize: 2048 });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ball = (seg = 10, rows = 7) => new THREE.SphereGeometry(1, seg, rows);
  const cyl = (rt: number, rb: number, h: number, seg = 12) => new THREE.CylinderGeometry(rt, rb, h, seg);

  // A thin ring (lathe of a rectangle) round any axis: cuffs, stripes, collars.
  const band = (at: any, axis: any, r: number, h: number, t: number, color: any, bone: any) =>
    b.lathe(
      [
        [r, -h / 2],
        [r + t, -h / 2],
        [r + t, h / 2],
        [r, h / 2],
      ] as [number, number][],
      { at, axis, segments: 10, color, bone },
    );

  // ------------------------------------------------------------------------------------------------ skeleton
  const HIP_Y = 0.88;
  const hips = b.joint("hips", { at: [0, HIP_Y, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, HIP_Y, 0],
      [0, 1.05, 0],
      [0, 1.2, 0],
      [0, 1.33, 0],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    [
      [0, 1.33, 0],
      [0, 1.38, 0],
      [0, 1.43, 0.005],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.43, 0.005], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.09, 0.02),
    aim: hp(0, -0.09, 0.2),
    role: "jaw",
  });

  // ------------------------------------------------------------------------------------------------ torso
  const RX = [0.17, 0.155, 0.165, 0.2, 0.22];
  const RZ = [0.105, 0.1, 0.105, 0.115, 0.12];
  const torso = b.sweep(spine, (t: number): [number, number] => [lerpKeys(t, RX), lerpKeys(t, RZ)], {
    sides: 8,
    smooth: false,
    caps: "flat",
    color: PANEL,
    name: "torso",
  });
  const torsoSkin = b.surface(torso);
  b.part(box(0.31, 0.1, 0.2), CHAR, { bone: hips, at: [0, 0.86, 0], name: "pelvis" });

  // neck, collar
  b.sweep(neck, 0.055, { color: CHAR });
  band([0, 1.335, 0], [0, 1, 0], 0.056, 0.03, 0.02, WHITE, chest);
  band([0, 1.37, 0], [0, 1, 0], 0.054, 0.012, 0.008, ORANGE, neck.joints[1]);

  // apron, as a drawing laid over the chest
  b.decal(torso, APRON, { at: [0, 1.13, 0.115], dir: [0, 0, 1], size: [0.27, 0.36], segments: 18, lift: 0.002, name: "apron" });
  b.decal(torso, TAG, { at: [0.155, 1.25, 0.1], dir: [0.25, 0, 1], size: [0.07, 0.042], segments: 8, lift: 0.005, name: "nameTag" });

  // apron neck straps over the shoulders, tie and belt
  for (const s of [1, -1]) {
    const strap = torsoSkin.drape(
      catmull([
        [s * 0.07, 1.29, 0.12],
        [s * 0.11, 1.332, 0.05],
        [s * 0.13, 1.31, -0.06],
        [s * 0.12, 1.2, -0.115],
      ]),
      { lift: 0.006 },
    );
    b.sweep(strap, 0.011, { color: CHAR, bone: chest });
  }
  const tie = torsoSkin.loop([0, 1.0, 0], { lift: 0.008 });
  b.sweep(tie, 0.01, { color: CHAR });
  const belt = torsoSkin.loop([0, 0.93, 0], { lift: 0.014 });
  b.sweep(belt, 0.022, { color: HAZARD });
  b.along(belt, 18, (at: any) => b.part(new THREE.SphereGeometry(0.008, 5, 4), STEEL, { at }));
  const buckleHit = torsoSkin.around([0, 0.93, 0]).at(0, 0)!;
  b.stick(box(0.07, 0.012, 0.045), STEEL, buckleHit, { embed: 0.1 });
  b.stick(box(0.04, 0.012, 0.022), ORANGE, buckleHit.moved([0, 0.006, 0]), { embed: 0.1 });

  // shoulder pauldrons with logos
  for (const s of [1, -1]) {
    const pa = b.part(ball(12, 8), PANEL_S, { bone: chest, at: [s * 0.27, 1.31, 0], scale: [0.085, 0.062, 0.08], name: "pauldron" });
    b.decal(pa, LOGO_O, { at: [s * 0.352, 1.32, 0], dir: [s, 0.25, 0], up: [0, 1, 0], size: [0.07, 0.07], segments: 8, lift: 0.002 });
    b.part(cyl(0.012, 0.012, 0.03, 8), STEEL, { bone: chest, at: [s * 0.2, 1.345, -0.02] });
  }

  // ------------------------------------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.11;
    const pts = limb([s * 0.1, HIP_Y, 0], [x, 0.105, 0], [0.392, 0.392], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [x, 0, 0.06],
    });
    const thighJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ank = leg.joints[2];
    const kn = pts[1] as THREE.Vector3;

    b.sweep(leg, [0.07, 0.062, 0.052, 0.046, 0.04], { color: PANEL, name: `leg${side}` });
    b.part(ball(10, 7), CHAR, { bone: thighJ, at: [s * 0.1, 0.87, 0], scale: [0.068, 0.068, 0.068], name: `hipBall${side}` });
    b.part(ball(10, 7), CHAR, { bone: kneeJ, at: [kn.x, kn.y, kn.z], scale: [0.064, 0.064, 0.064], name: `kneeBall${side}` });
    b.part(ball(10, 7), CHAR, { bone: ank, at: [x, 0.105, 0], scale: [0.05, 0.05, 0.05], name: `ankleBall${side}` });

    // knee cap + stripes
    b.part(ball(8, 6), PANEL_S, { bone: kneeJ, at: [kn.x, kn.y + 0.01, kn.z + 0.045], scale: [0.04, 0.045, 0.03] });
    const c1 = leg.at(0.2);
    band(c1.at, c1.tangent, 0.07 * 1.07, 0.03, 0.006, ORANGE, thighJ);
    const c2 = leg.at(0.82);
    band(c2.at, c2.tangent, 0.043 * 1.09, 0.03, 0.006, ORANGE, kneeJ);
    const c3 = leg.at(0.88);
    band(c3.at, c3.tangent, 0.042 * 1.09, 0.012, 0.006, CHAR, kneeJ);

    // hydraulic assist behind the knee
    const top = [x, kn.y + 0.13, kn.z - 0.085];
    const mid = [x, kn.y + 0.0, kn.z - 0.09];
    const low = [x, kn.y - 0.12, kn.z - 0.07];
    b.rod(top, mid, 0.016, CHAR, { bone: thighJ });
    b.rod(mid, low, 0.009, STEEL, { bone: kneeJ });
    b.part(ball(6, 4), STEEL, { bone: thighJ, at: top, scale: [0.02, 0.02, 0.02] });
    b.part(ball(6, 4), STEEL, { bone: kneeJ, at: low, scale: [0.018, 0.018, 0.018] });

    // foot
    b.part(box(0.125, 0.026, 0.29), CHAR, { bone: ank, at: [x, 0.013, 0.06], name: `sole${side}` });
    b.part(box(0.11, 0.05, 0.2), PANEL_S, { bone: ank, at: [x, 0.051, 0.03], name: `shoe${side}` });
    b.part(ball(10, 6), PANEL_S, { bone: ank, at: [x, 0.05, 0.135], scale: [0.058, 0.04, 0.075], name: `toe${side}` });
    b.part(box(0.09, 0.03, 0.014), ORANGE, { bone: ank, at: [x, 0.045, -0.072] });
    b.part(box(0.116, 0.008, 0.026), ORANGE, { bone: ank, at: [x, 0.031, 0.19] });
  }

  // ------------------------------------------------------------------------------------------------ arms and hands
  const WR: Record<string, number[]> = {};
  const ARM: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = [s * 0.27, 1.26, 0];
    const el = [s * 0.34, 1.03, -0.03];
    const wr = [s * 0.3, 1.04, 0.24];
    WR[side] = wr;
    const arm = b.chain(`arm${side}`, [sh, el, wr], {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    ARM[side] = arm;
    b.sweep(arm, [0.05, 0.044, 0.038], {
      bands: [
        [0.8, PANEL],
        [1, CHAR],
      ],
      name: `arm${side}`,
    });
    b.part(ball(10, 7), CHAR, { bone: arm.joints[0], at: [sh[0], sh[1] - 0.005, sh[2]], scale: [0.057, 0.057, 0.057] });
    b.part(ball(10, 7), CHAR, { bone: arm.joints[1], at: el, scale: [0.055, 0.055, 0.055] });
    const u = arm.at(0.2);
    band(u.at, u.tangent, 0.049 * 1.09, 0.03, 0.006, ORANGE, arm.joints[0]);
    const f = arm.at(0.66);
    band(f.at, f.tangent, 0.0405 * 1.09, 0.02, 0.006, ORANGE, arm.joints[1]);
    const f2 = arm.at(0.9);
    band(f2.at, f2.tangent, 0.038 * 1.09, 0.012, 0.006, STEEL, arm.joints[1]);

    // hand: palm up, fingers separated and slightly curled
    const wrist = arm.joints[2];
    const [wx, wy, wz] = wr;
    b.part(box(0.088, 0.028, 0.095), PANEL_S, { bone: wrist, at: [wx, wy, wz + 0.055], name: `palm${side}` });
    b.part(box(0.09, 0.02, 0.02), CHAR, { bone: wrist, at: [wx, wy + 0.002, wz + 0.105] });
    [-0.03, 0, 0.03].forEach((dx, i) => {
      const fx = wx + dx;
      const fc = b.chain(
        `finger${i + 1}${side}`,
        [
          [fx, wy + 0.004, wz + 0.1],
          [fx, wy + 0.012, wz + 0.138],
          [fx, wy + 0.034, wz + 0.166],
        ],
        { parent: wrist, names: [`finger${i + 1}${side}a`, `finger${i + 1}${side}b`], role: "digit" },
      );
      b.sweep(fc, [0.0125, 0.009], { color: CHAR });
      b.part(ball(5, 4), ORANGE, { bone: fc.joints[1], at: [fx, wy + 0.034, wz + 0.168], scale: [0.009, 0.009, 0.009] });
    });
    const tx = wx + s * 0.045;
    const th = b.chain(
      `thumb${side}`,
      [
        [tx, wy, wz + 0.05],
        [wx + s * 0.07, wy + 0.012, wz + 0.088],
        [wx + s * 0.078, wy + 0.034, wz + 0.118],
      ],
      { parent: wrist, names: [`thumb${side}a`, `thumb${side}b`], role: "digit" },
    );
    b.sweep(th, [0.0135, 0.01], { color: CHAR });
  }

  // ---- right hand: coffee cup
  {
    const [wx, wy, wz] = WR.R;
    const wrist = ARM.R.joints[2];
    const cx = wx;
    const cy = wy + 0.017;
    const cz = wz + 0.07;
    b.lathe(
      [
        [0, 0],
        [0.027, 0],
        [0.038, 0.1],
        [0.043, 0.104],
        [0.043, 0.112],
        [0.034, 0.114],
        [0.026, 0.124],
        [0, 0.126],
      ] as [number, number][],
      { at: [cx, cy, cz], segments: 14, color: CUP, bone: wrist, name: "cup" },
    );
    const sleeve = b.lathe(
      [
        [0.0308, 0.035],
        [0.0335, 0.035],
        [0.0385, 0.08],
        [0.0358, 0.08],
      ] as [number, number][],
      { at: [cx, cy, cz], segments: 14, color: ORANGE, bone: wrist, name: "sleeve" },
    );
    b.decal(sleeve, LOGO_D, { at: [cx, cy + 0.0575, cz + 0.036], dir: [0, 0, 1], size: [0.03, 0.03], segments: 6, lift: 0.001, bone: wrist });
    b.part(cyl(0.011, 0.011, 0.012, 8), COFFEE, { bone: wrist, at: [cx, cy + 0.12, cz + 0.007] });
    const wisps = [-0.012, 0.012].map((dx, i) => frame([cx + dx, cy + 0.13, cz + (i ? 0.005 : -0.005)], [0, 1, 0]));
    b.cards(wisps, STEAM, { size: [0.04, 0.09], lean: 0, flow: [0, 0, 1], cross: true, bone: wrist, color: "#ffffff" });
  }

  // ---- left hand: plate with the cake (it is not a lie)
  {
    const [wx, wy, wz] = WR.L;
    const wrist = ARM.L.joints[2];
    const y0 = wy + 0.017;
    const pz = wz + 0.065;
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.07, 0.014],
        [0.072, 0.018],
        [0.062, 0.016],
        [0.04, 0.007],
        [0, 0.007],
      ] as [number, number][],
      { at: [wx, y0, pz], segments: 16, color: CUP, bone: wrist, name: "plate" },
    );
    b.lathe(
      [
        [0.0705, 0.0145],
        [0.0735, 0.0145],
        [0.0735, 0.0185],
        [0.0715, 0.0185],
      ] as [number, number][],
      { at: [wx, y0, pz], segments: 16, color: ORANGE, bone: wrist },
    );
    const slice = (dy: number, th: number, color: string, k = 1) =>
      b.extrude(
        [
          [-0.034 * k, -0.036 * k],
          [0.034 * k, -0.036 * k],
          [0, 0.05 * k, "sharp"],
        ],
        { at: [wx, y0 + dy, pz], x: [1, 0, 0], y: [0, 0, 1], thickness: th, smoothing: 1, color, bone: wrist },
      );
    slice(0.017, 0.02, CHOC);
    slice(0.03, 0.006, CREAM, 0.99);
    slice(0.043, 0.02, CHOC);
    slice(0.057, 0.008, ICING, 1.05);
    b.part(ball(7, 5), CHERRY, { bone: wrist, at: [wx, y0 + 0.07, pz + 0.022], scale: [0.011, 0.011, 0.011], name: "cherry" });
    b.part(cyl(0.0045, 0.0045, 0.04, 6), CREAM, { bone: wrist, at: [wx, y0 + 0.081, pz - 0.012], name: "candle" });
    glow(b.part(new THREE.ConeGeometry(0.006, 0.02, 6), AMBER, { bone: wrist, at: [wx, y0 + 0.111, pz - 0.012], name: "flame" }), 1.6);
  }

  // ------------------------------------------------------------------------------------------------ head
  const skull = b.part(ball(16, 12), headPaint, { bone: head, at: hp(0, 0, 0), scale: [0.18, 0.17, 0.175], name: "skull" });
  void skull;
  const vc = hp(0, 0.01, 0.12);
  const visor = b.part(ball(14, 10), INK, { bone: head, at: vc, scale: [0.145, 0.085, 0.075], name: "visor" });
  const vs = b.surface(visor);
  const eyeHits: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = vs.around(vc).at(s * 42, 6)!;
    eyeHits[side] = hit;
    glow(
      b.decal(visor, EYE, { at: hit, size: [0.092, 0.092], lift: 0.003, segments: 12, name: `eye${side}` }),
      1.3,
    );
  }
  // glowing eyebrows draped over the visor
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const e = eyeHits[side].at as THREE.Vector3;
    const path = vs.drape(
      catmull([
        [e.x - s * 0.03, e.y + 0.056, e.z],
        [e.x, e.y + 0.066, e.z],
        [e.x + s * 0.03, e.y + 0.056, e.z],
      ]),
      { lift: 0.004 },
    );
    glow(b.sweep(path, 0.006, { color: ORANGE, bone: head }), 1);
  }
  // white brow ridge over the visor
  const ridge = vs.drape(
    catmull([
      hp(-0.14, 0.05, 0.1),
      hp(-0.08, 0.1, 0.14),
      hp(0, 0.108, 0.17),
      hp(0.08, 0.1, 0.14),
      hp(0.14, 0.05, 0.1),
    ]),
    { lift: 0.012 },
  );
  b.sweep(ridge, 0.011, { color: WHITE, bone: head });

  // jaw: chin plate with a speaker grille, upper lip fixed on the head
  const chin = b.part(ball(12, 8), PANEL_S, { bone: jaw, at: hp(0, -0.128, 0.08), scale: [0.07, 0.032, 0.06], name: "chin" });
  const chinHit = b.surface(chin).around(hp(0, -0.128, 0.08)).at(0, 8)!;
  glow(b.decal(chin, GRILLE, { at: chinHit, size: [0.075, 0.03], segments: 8, lift: 0.002, bone: jaw, name: "grille" }), 0.7);
  b.part(ball(10, 6), CHAR, { bone: head, at: hp(0, -0.092, 0.14), scale: [0.075, 0.012, 0.04], name: "upperJaw" });

  // ear speakers
  for (const s of [1, -1]) {
    const at = hp(s * 0.178, -0.005, -0.005);
    b.part(cyl(0.065, 0.065, 0.045, 14), CHAR, { bone: head, at, dir: [s, 0, 0], name: "earCup" });
    glow(b.part(cyl(0.046, 0.046, 0.05, 14), ORANGE, { bone: head, at, dir: [s, 0, 0] }), 0.8);
    b.part(cyl(0.026, 0.026, 0.056, 10), CHAR, { bone: head, at, dir: [s, 0, 0] });
    b.part(cyl(0.012, 0.012, 0.06, 8), STEEL, { bone: head, at, dir: [s, 0, 0] });
  }

  // antenna with beacon
  const antPts = [hp(0, 0.16, -0.04), hp(0, 0.22, -0.05), hp(0.03, 0.27, -0.03)];
  b.part(cyl(0.02, 0.026, 0.02, 8), CHAR, { bone: head, at: hp(0, 0.168, -0.04) });
  b.sweep(catmull(antPts), [0.008, 0.005], { color: CHAR, bone: head });
  glow(b.part(ball(8, 6), ORANGE, { bone: head, at: hp(0.03, 0.285, -0.03), scale: [0.02, 0.02, 0.02], name: "beacon" }), 1.5);

  // ------------------------------------------------------------------------------------------------ espresso backpack
  const packZ = -0.16;
  b.part(box(0.3, 0.3, 0.12), PANEL, { bone: chest, at: [0, 1.15, packZ], name: "pack" });
  b.part(box(0.31, 0.03, 0.13), ORANGE, { bone: chest, at: [0, 1.315, packZ] });
  b.part(box(0.31, 0.025, 0.13), CHAR, { bone: chest, at: [0, 0.99, packZ] });
  b.part(new THREE.PlaneGeometry(0.22, 0.07), "#ffffff", {
    texture: LABEL,
    bone: chest,
    at: [0, 1.255, packZ - 0.0615],
    dir: [0, 0, -1],
    axis: "z",
    name: "packLabel",
  });
  // boiler
  const boilerAt = [0, 1.11, -0.275];
  b.part(cyl(0.055, 0.055, 0.26, 14), COPPER, { bone: chest, at: boilerAt, dir: [1, 0, 0], name: "boiler" });
  for (const s of [1, -1]) {
    b.part(cyl(0.06, 0.06, 0.022, 14), BRASS, { bone: chest, at: [s * 0.13, 1.11, -0.275], dir: [1, 0, 0] });
    b.part(cyl(0.018, 0.018, 0.03, 8), STEEL, { bone: chest, at: [s * 0.15, 1.11, -0.275], dir: [1, 0, 0] });
    // gauges on the pack sides
    b.part(cyl(0.047, 0.047, 0.007, 16), BRASS, { bone: chest, at: [s * 0.1535, 1.2, packZ], dir: [s, 0, 0] });
    b.part(new THREE.CircleGeometry(0.04, 20), "#ffffff", {
      texture: GAUGE,
      bone: chest,
      at: [s * 0.1575, 1.2, packZ],
      dir: [s, 0, 0],
      axis: "z",
    });
    // side vents
    for (let i = 0; i < 4; i++) b.part(box(0.004, 0.012, 0.08), CHAR, { bone: chest, at: [s * 0.1505, 1.03 + i * 0.022, packZ] });
    // status light
    glow(b.part(box(0.03, 0.016, 0.008), BLUE, { bone: chest, at: [s * 0.09, 1.315, packZ - 0.066] }), 1.4);
    // boiler straps
    b.part(cyl(0.058, 0.058, 0.018, 14), CHAR, { bone: chest, at: [s * 0.07, 1.11, -0.275], dir: [1, 0, 0] });
  }
  // valve wheel on boiler
  b.part(cyl(0.006, 0.006, 0.03, 6), STEEL, { bone: chest, at: [0.03, 1.18, -0.275] });
  b.part(new THREE.TorusGeometry(0.022, 0.005, 5, 10), ORANGE, { bone: chest, at: [0.03, 1.197, -0.275], dir: [0, 1, 0], axis: "z" });
  // exhaust stack with steam
  b.sweep(
    [
      [0.09, 1.16, -0.275],
      [0.09, 1.3, -0.275],
      [0.09, 1.41, -0.275],
    ],
    0.014,
    { color: COPPER, bone: chest, caps: "flat" },
  );
  b.part(cyl(0.02, 0.02, 0.012, 8), BRASS, { bone: chest, at: [0.09, 1.415, -0.275] });
  b.cards(
    [frame([0.09, 1.42, -0.275], [0, 1, 0]), frame([0.095, 1.42, -0.27], [0, 1, 0])],
    STEAM,
    { size: [0.06, 0.14], lean: 0, flow: [0, 0, 1], cross: true, bone: chest, color: "#ffffff" },
  );
  // steam wand over the right shoulder
  const wand = [
    [-0.09, 1.16, -0.275],
    [-0.09, 1.42, -0.26],
    [-0.17, 1.46, -0.14],
    [-0.23, 1.41, 0.0],
    [-0.255, 1.385, 0.12],
  ];
  b.sweep(catmull(wand), 0.01, { color: COPPER, bone: chest, caps: "flat" });
  b.spike(wand[4], [-0.02, -0.03, 0.12], 0.045, 0.015, { color: STEEL, bone: chest });
  glow(b.part(ball(6, 4), "#ffe9b8", { bone: chest, at: [-0.262, 1.351, 0.163], scale: [0.007, 0.007, 0.007] }), 1.2);
  b.part(ball(6, 4), BRASS, { bone: chest, at: wand[1], scale: [0.016, 0.016, 0.016] });
  b.part(ball(6, 4), BRASS, { bone: chest, at: wand[2], scale: [0.014, 0.014, 0.014] });

  return b.root;
}
