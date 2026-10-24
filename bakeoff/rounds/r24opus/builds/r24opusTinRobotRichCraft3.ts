import * as THREE from "three";
import { createBuilder, polyline, arc, paint, noise, mix, smoothstep, svg, rng } from "../../../../src/index";
import { metal, gearTrain, gaugeTexture, coil } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Tin Wind-Up Robot",
  description:
    "A 1950s Japanese lithographed tin toy robot: candy-red chest with a sunburst plate and a gear window, teal head with glowing amber eyes, a spring-antenna pair and a caged bulb, accordion chrome arms with pincer claws, boxy blue legs on big red shoes, and a brass butterfly wind-up key in its back.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: printed tin colours, chrome and brass

type OP = [number, number] | [number, number, "sharp"];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const RED = "#d8352a";
const TEAL = "#2f8fae";
const BLUE = "#3157a8";
const NAVY = "#1f2d5c";
const CREAM = "#f2e6c2";
const YELLOW = "#f4c531";
const INKC = "#1a1420";
const SOLE = "#231a1e";

/** Lithographed tin: airbrushed light from above, a soft printing wobble and a little sheen on the tops. */
function tin(base: string, seed: number) {
  const hi = mix(base, "#fff4dc", 0.38);
  const lo = mix(base, "#120a26", 0.5);
  return paint((p, n) => {
    const light = n.y * 0.62 + n.z * 0.28 + n.x * 0.1;
    let c = mix(lo, base, smoothstep(-0.95, 0.15, light));
    c = mix(c, hi, smoothstep(0.4, 1, light) * 0.55);
    c = mix(c, lo, smoothstep(0.6, 0.82, noise(p, 0.014, seed)) * 0.16);
    const sheen = smoothstep(0.82, 1, n.y) * smoothstep(0.5, 0.75, noise(p, 0.005, seed + 9));
    return mix(c, "#ffffff", sheen * 0.4);
  });
}

const RED_TIN = tin(RED, 3);
const TEAL_TIN = tin(TEAL, 5);
const BLUE_TIN = tin(BLUE, 7);
const NAVY_TIN = tin(NAVY, 11);
const CHROME = metal("steel", { polish: 0.7, tarnish: 0.08, size: 0.025 });
const BRASS = metal("brass", { polish: 0.55, tarnish: 0.15, size: 0.02 });
const GILT = metal("gilt", { size: 0.02 });
const COPPER = metal("copper", { size: 0.02, verdigris: 0.15 });

// Key dimensions (meters)
const TY0 = 0.108; // torso bottom
const TD = 0.072; // torso depth
const TF = TD / 2; // torso front face z
const HY0 = 0.203; // head bottom
const HD = 0.072; // head depth
const HZ = 0.004; // head centre z
const HF = HZ + HD / 2; // head front face z
const HB = HZ - HD / 2; // head back face z
const KEY_Y = 0.152;
const WIN_Y = 0.158;

// Painted pinstripes on the tin bodies
const TORSO_PAINT = paint((p) =>
  Math.abs(p.y - 0.1135) < 0.0011 || Math.abs(p.y - 0.1785) < 0.0011 ? CREAM : RED_TIN,
);
const HEAD_PAINT = paint((p) =>
  Math.abs(p.y - 0.2085) < 0.0011 || Math.abs(p.y - 0.2595) < 0.0011 ? CREAM : TEAL_TIN,
);
const LEG_PAINT = paint((p) =>
  Math.abs(p.y - 0.083) < 0.0012 || Math.abs(p.y - 0.029) < 0.0012 ? CREAM : BLUE_TIN,
);
const FOOT_PAINT = paint((_p, _n, s) =>
  s[1] < 0.0045 ? SOLE : Math.abs(s[1] - 0.0105) < 0.0012 ? CREAM : RED_TIN,
);
const KEY_PAINT = paint((_p, n, s) => {
  if (Math.abs(n.x) < 0.5) return GILT;
  const d = Math.min(Math.hypot(s[0] - 0.02, s[1] - 0.014), Math.hypot(s[0] - 0.02, s[1] + 0.014));
  return d < 0.0058 && d > 0.0042 ? "#6b4a1a" : BRASS;
});

// ---------------------------------------------------------------------------------------------------------------
// Lithograph drawings

const f2 = (v: number) => v.toFixed(2);
const sRivet = (x: number, y: number, r = 1.2) =>
  `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="#7d8496"/><circle cx="${f2(x - r * 0.3)}" cy="${f2(y - r * 0.3)}" r="${f2(r * 0.45)}" fill="#ffffff"/>`;

function starPath(cx: number, cy: number, r1: number, r2: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? r2 : r1;
    pts.push(`${f2(cx + r * Math.cos(a))} ${f2(cy + r * Math.sin(a))}`);
  }
  return `M${pts.join(" L")} Z`;
}

const PLATE = "M5 0 H97 L102 5 V76 H0 V5 Z";
const FONT = `font-family="Arial Black, Impact, Arial, sans-serif" font-weight="900"`;

function faceTexture() {
  let vents = "";
  for (const y of [9, 12.5, 16]) vents += `<rect x="33.8" y="${y}" width="8.4" height="1.8" rx="0.9" fill="${NAVY}"/>`;
  let halos = "";
  for (const cx of [17, 59]) {
    halos += `<circle cx="${cx}" cy="17.5" r="16" fill="${RED}"/>`;
    halos += `<circle cx="${cx}" cy="17.5" r="14.8" fill="${YELLOW}"/>`;
    halos += `<circle cx="${cx}" cy="17.5" r="13.9" fill="${NAVY}"/>`;
  }
  let chin = "";
  for (let x = 16; x <= 60; x += 4.4) chin += `<circle cx="${f2(x)}" cy="49.6" r="0.9" fill="${RED}"/>`;
  return svg(
    `<svg viewBox="0 0 76 52">
<defs>
<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f1df"/><stop offset="1" stop-color="#d4c9ad"/></linearGradient>
<radialGradient id="ck" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#ff9c88"/><stop offset="1" stop-color="${RED}"/></radialGradient>
<linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3d78"/><stop offset="1" stop-color="#121a3a"/></linearGradient>
</defs>
<rect x="0.6" y="0.6" width="74.8" height="50.8" rx="5" fill="url(#f)" stroke="${NAVY}" stroke-width="1.2"/>
<path d="M2.5 22 Q2.5 34 9 40 M73.5 22 Q73.5 34 67 40" stroke="${TEAL}" stroke-width="1" fill="none"/>
${halos}
${vents}
<circle cx="8.5" cy="38.5" r="5" fill="url(#ck)" stroke="#9a1f18" stroke-width="0.6"/>
<circle cx="67.5" cy="38.5" r="5" fill="url(#ck)" stroke="#9a1f18" stroke-width="0.6"/>
<circle cx="7" cy="36.8" r="1.2" fill="#ffffff"/>
<circle cx="66" cy="36.8" r="1.2" fill="#ffffff"/>
<rect x="17" y="28.5" width="42" height="19" rx="3" fill="url(#m)" stroke="${YELLOW}" stroke-width="1"/>
<path d="M19 28.5 L22 26 L54 26 L57 28.5" fill="none" stroke="${NAVY}" stroke-width="0.9"/>
${chin}
</svg>`,
    { size: 512 },
  );
}

function eyeTexture() {
  let spokes = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    spokes += `<path d="M${f2(32 + 11 * Math.cos(a))} ${f2(32 + 11 * Math.sin(a))} L${f2(32 + 27 * Math.cos(a))} ${f2(32 + 27 * Math.sin(a))}" stroke="#9a3a12" stroke-width="1.5"/>`;
  }
  return svg(
    `<svg viewBox="0 0 64 64">
<defs><radialGradient id="g" cx="0.5" cy="0.55" r="0.5"><stop offset="0" stop-color="#fff7b0"/><stop offset="0.35" stop-color="#ffd23a"/><stop offset="0.75" stop-color="#ff8a1c"/><stop offset="1" stop-color="#c2301c"/></radialGradient></defs>
<circle cx="32" cy="32" r="32" fill="#2a1a12"/>
<circle cx="32" cy="32" r="29" fill="url(#g)"/>
${spokes}
<circle cx="32" cy="32" r="19.5" fill="none" stroke="#8a3412" stroke-width="1.8"/>
<circle cx="32" cy="32" r="10" fill="#1a0f0a"/>
<circle cx="32" cy="32" r="4.5" fill="#ff5a2a"/>
<ellipse cx="21" cy="20" rx="7.5" ry="4.5" fill="#ffffff" transform="rotate(-35 21 20)"/>
<circle cx="43" cy="44" r="2.8" fill="#ffffff"/>
</svg>`,
    { size: 256 },
  );
}

function mouthTexture() {
  let bars = "";
  for (let i = 0; i < 10; i++) bars += `<rect x="${f2(3 + i * 6.75)}" y="2" width="3.6" height="10" rx="1.2" fill="url(#c)"/>`;
  return svg(
    `<svg viewBox="0 0 72 14">
<defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f8fc"/><stop offset="0.55" stop-color="#b9c0d0"/><stop offset="1" stop-color="#6c7488"/></linearGradient>
<linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0e14"/><stop offset="0.5" stop-color="#8a1e1a"/><stop offset="1" stop-color="#3a0e14"/></linearGradient></defs>
<rect width="72" height="14" rx="2" fill="url(#d)"/>
${bars}
</svg>`,
    { size: 256 },
  );
}

function windowTexture() {
  const r = rng(7);
  let sparks = "";
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2;
    const d = 6 + r() * 19;
    const s = 0.9 + r() * 1.5;
    const x = 30 + Math.cos(a) * d;
    const y = 30 + Math.sin(a) * d;
    sparks += `<path d="M${f2(x)} ${f2(y - s * 2)} L${f2(x + s * 0.45)} ${f2(y - s * 0.45)} L${f2(x + s * 2)} ${f2(y)} L${f2(x + s * 0.45)} ${f2(y + s * 0.45)} L${f2(x)} ${f2(y + s * 2)} L${f2(x - s * 0.45)} ${f2(y + s * 0.45)} L${f2(x - s * 2)} ${f2(y)} L${f2(x - s * 0.45)} ${f2(y - s * 0.45)} Z" fill="#ffe27a"/>`;
  }
  return svg(
    `<svg viewBox="0 0 60 60">
<defs><radialGradient id="w" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffc35a"/><stop offset="0.22" stop-color="#e0541c"/><stop offset="0.55" stop-color="#3a1748"/><stop offset="1" stop-color="#0c0a1c"/></radialGradient></defs>
<circle cx="30" cy="30" r="30" fill="url(#w)"/>
<circle cx="30" cy="30" r="22" fill="none" stroke="#5a2a6a" stroke-width="0.8"/>
${sparks}
</svg>`,
    { size: 256 },
  );
}

function chestTexture() {
  let rays = "";
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    const R = 95;
    rays += `<path d="M51 30 L${f2(51 + R * Math.cos(a0))} ${f2(30 + R * Math.sin(a0))} L${f2(51 + R * Math.cos(a1))} ${f2(30 + R * Math.sin(a1))} Z" fill="${i % 2 ? "#f6d25a" : CREAM}"/>`;
  }
  let rv = "";
  for (let x = 6; x <= 96.5; x += 10.1) rv += sRivet(x, 73.2, 1.1);
  return svg(
    `<svg viewBox="0 0 102 76">
<defs><clipPath id="c"><path d="${PLATE}"/></clipPath></defs>
<g clip-path="url(#c)">
<rect width="102" height="76" fill="${CREAM}"/>
${rays}
<circle cx="51" cy="30" r="31" fill="${RED}"/>
<circle cx="51" cy="30" r="29.2" fill="${NAVY}"/>
<circle cx="13" cy="11" r="12.4" fill="${RED}"/>
<circle cx="89" cy="11" r="12.4" fill="${RED}"/>
<circle cx="13" cy="11" r="11" fill="${NAVY}"/>
<circle cx="89" cy="11" r="11" fill="${NAVY}"/>
<path d="${starPath(12, 44, 7, 3)}" fill="${RED}" stroke="${NAVY}" stroke-width="0.9"/>
<path d="M90 36 L84.5 45.5 L89 45.5 L86 53 L94.5 42.5 L90 42.5 L93.5 36 Z" fill="${YELLOW}" stroke="${NAVY}" stroke-width="0.9"/>
<rect x="15" y="61" width="72" height="17" rx="3" fill="${NAVY}"/>
<rect x="0" y="0" width="102" height="76" fill="none" stroke="${RED}" stroke-width="5.5"/>
${rv}
</g>
<path d="${PLATE}" fill="none" stroke="${NAVY}" stroke-width="1.4"/>
</svg>`,
    { size: 512 },
  );
}

function backTexture() {
  let rv = "";
  for (const [x, y] of [
    [6, 22],
    [96, 22],
    [6, 46],
    [96, 46],
  ])
    rv += sRivet(x, y, 1.3);
  return svg(
    `<svg viewBox="0 0 102 76">
<defs><clipPath id="c"><path d="${PLATE}"/></clipPath>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3d7a"/><stop offset="1" stop-color="${NAVY}"/></linearGradient></defs>
<g clip-path="url(#c)">
<rect width="102" height="76" fill="url(#bg)"/>
<rect x="0" y="0" width="102" height="16" fill="${RED}"/>
<text x="51" y="12" text-anchor="middle" ${FONT} font-size="9" textLength="74" lengthAdjust="spacingAndGlyphs" fill="${YELLOW}" stroke="${INKC}" stroke-width="0.5">SPACE ROBOT</text>
<circle cx="51" cy="36" r="15.5" fill="${CREAM}" stroke="${YELLOW}" stroke-width="1.6"/>
<path d="M62 36 A11 11 0 1 1 51 25" fill="none" stroke="${RED}" stroke-width="2.2"/>
<path d="M50.5 21.2 L56.2 25 L50.5 28.8 Z" fill="${RED}"/>
<circle cx="51" cy="36" r="7.6" fill="${INKC}"/>
<text x="51" y="58.5" text-anchor="middle" ${FONT} font-size="5.5" textLength="20" lengthAdjust="spacingAndGlyphs" fill="${YELLOW}">WIND</text>
<text x="51" y="69" text-anchor="middle" ${FONT} font-size="5.6" textLength="46" lengthAdjust="spacingAndGlyphs" fill="${CREAM}">MADE IN JAPAN</text>
<path d="M88 56.5 L95.5 64 L88 71.5 L80.5 64 Z" fill="${YELLOW}" stroke="${RED}" stroke-width="0.9"/>
<text x="88" y="66" text-anchor="middle" ${FONT} font-size="5" fill="${NAVY}">KT</text>
<path d="${starPath(14, 64, 5.5, 2.3)}" fill="${YELLOW}"/>
${rv}
<rect x="0" y="0" width="102" height="76" fill="none" stroke="${RED}" stroke-width="3.5"/>
</g>
<path d="${PLATE}" fill="none" stroke="${INKC}" stroke-width="1.2"/>
</svg>`,
    { size: 512 },
  );
}

function sideTexture() {
  let louvres = "";
  for (let i = 0; i < 6; i++) {
    const y = 7.5 + i * 6.3;
    louvres += `<rect x="7" y="${f2(y)}" width="28" height="3.6" rx="1.6" fill="${NAVY}"/>`;
    louvres += `<rect x="8" y="${f2(y + 3.8)}" width="26" height="0.9" rx="0.45" fill="#ff9a8a"/>`;
  }
  return svg(
    `<svg viewBox="0 0 58 50">
<rect x="0.8" y="0.8" width="56.4" height="48.4" rx="3" fill="${CREAM}" stroke="${NAVY}" stroke-width="1.6"/>
<rect x="4" y="4" width="34" height="42" rx="2.5" fill="${RED}"/>
${louvres}
<circle cx="48" cy="15" r="6.8" fill="${NAVY}" stroke="${YELLOW}" stroke-width="1.3"/>
<path d="M48 15 L51.5 10.5" stroke="${YELLOW}" stroke-width="1.3" stroke-linecap="round"/>
<circle cx="48" cy="15" r="1.3" fill="${YELLOW}"/>
<text x="48" y="33" text-anchor="middle" ${FONT} font-size="7.5" fill="${RED}">No.7</text>
<path d="M42 38 H54" stroke="${NAVY}" stroke-width="1.2"/>
${sRivet(48, 43.5, 1.4)}
</svg>`,
    { size: 384 },
  );
}

function beltTexture() {
  return svg(
    `<svg viewBox="0 0 88 14">
<rect width="88" height="14" rx="1.5" fill="${NAVY}"/>
<rect x="0" y="0" width="6" height="14" fill="${RED}"/>
<rect x="82" y="0" width="6" height="14" fill="${RED}"/>
<rect x="7" y="1" width="74" height="0.9" fill="${YELLOW}"/>
<rect x="7" y="12.1" width="74" height="0.9" fill="${YELLOW}"/>
<text x="44" y="10.1" text-anchor="middle" ${FONT} font-size="8" textLength="70" lengthAdjust="spacingAndGlyphs" fill="${YELLOW}" stroke="#7a1a12" stroke-width="0.35">ATOMIC ROBOT</text>
</svg>`,
    { size: 512 },
  );
}

function legTexture() {
  return svg(
    `<svg viewBox="0 0 32 30">
<rect x="0.8" y="0.8" width="30.4" height="28.4" rx="3" fill="${CREAM}" stroke="${NAVY}" stroke-width="1.4"/>
<path d="M5 5 L16 11 L27 5" stroke="${RED}" stroke-width="3" fill="none" stroke-linejoin="round"/>
<path d="M5 11.5 L16 17.5 L27 11.5" stroke="${RED}" stroke-width="3" fill="none" stroke-linejoin="round"/>
<circle cx="16" cy="23.5" r="3.6" fill="${NAVY}"/>
<path d="M13.6 23.5 H18.4" stroke="${CREAM}" stroke-width="1.1"/>
${sRivet(4.5, 25.5, 1.1)}${sRivet(27.5, 25.5, 1.1)}
</svg>`,
    { size: 256 },
  );
}

// Outlines
const TORSO: OP[] = [
  [-0.056, 0],
  [0.056, 0],
  [0.056, 0.074],
  [0.046, 0.086],
  [-0.046, 0.086],
  [-0.056, 0.074],
];
const HEAD: OP[] = [
  [-0.044, 0],
  [0.044, 0],
  [0.044, 0.054],
  [0.037, 0.062],
  [-0.037, 0.062],
  [-0.044, 0.054],
];
const FOOT: OP[] = [
  [0, 0, "sharp"],
  [0.082, 0, "sharp"],
  [0.086, 0.008],
  [0.08, 0.016],
  [0.05, 0.026],
  [0.004, 0.026],
  [0, 0.02],
];
const CLAW: OP[] = [
  [0, -0.003],
  [0.006, -0.004],
  [0.018, -0.003],
  [0.028, -0.006, "sharp"],
  [0.027, 0.0005],
  [0.02, 0.004],
  [0.008, 0.0058],
  [0, 0.005],
];
const BROW: OP[] = [
  [-0.013, 0, "sharp"],
  [0, 0.003],
  [0.013, 0, "sharp"],
  [0.011, 0.0045],
  [0, 0.0068],
  [-0.011, 0.0045],
];
const KEY: OP[] = [
  [0, -0.0035],
  [0.007, -0.0035],
  [0.009, -0.012],
  [0.015, -0.024],
  [0.025, -0.025],
  [0.03, -0.017],
  [0.028, -0.006],
  [0.024, 0],
  [0.028, 0.006],
  [0.03, 0.017],
  [0.025, 0.025],
  [0.015, 0.024],
  [0.009, 0.012],
  [0.007, 0.0035],
  [0, 0.0035],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "tinRobot" });
  type J = ReturnType<typeof b.joint>;

  const FACE = faceTexture();
  const EYE = eyeTexture();
  const MOUTH = mouthTexture();
  const WINDOW = windowTexture();
  const CHEST = chestTexture();
  const BACK = backTexture();
  const SIDE = sideTexture();
  const BELT = beltTexture();
  const LEG = legTexture();
  const GAUGE_A = gaugeTexture({ needle: 40, label: "PSI" });
  const GAUGE_B = gaugeTexture({ needle: -70, label: "VOLT", red: [95, 135] });

  // Small reusable placements
  const rivet = (bone: J, at: number[] | THREE.Vector3, r = 0.0014) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), CHROME, { bone, at });
  const plate = (
    bone: J,
    tex: THREE.Texture,
    w: number,
    h: number,
    at: number[] | THREE.Vector3,
    dir: number[] | THREE.Vector3,
  ) => b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.098, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.112, 0], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: [0, 0.15, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.194, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.205, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.2185, 0.034], dir: [0, 0, 1], role: "jaw" });
  const keyJ = b.joint("windKey", { parent: chest, at: [0, KEY_Y, -TF], dir: [0, 0, -1] });

  // ------------------------------------------------------------------ torso
  b.extrude(TORSO, { at: [0, TY0, 0], x: [1, 0, 0], thickness: TD, bevel: 0.004, color: TORSO_PAINT, bone: chest });
  plate(chest, CHEST, 0.102, 0.076, [0, 0.15, TF + 0.0008], [0, 0, 1]);
  plate(chest, BACK, 0.102, 0.076, [0, 0.15, -TF - 0.0008], [0, 0, -1]);
  for (const s of [1, -1]) plate(chest, SIDE, 0.056, 0.046, [s * (0.056 + 0.0008), 0.14, 0], [s, 0, 0]);

  // chrome lip under the torso, navy pelvis with its printed belt
  b.part(new THREE.BoxGeometry(0.114, 0.004, 0.074), CHROME, { bone: spine, at: [0, TY0, 0] });
  b.part(new THREE.BoxGeometry(0.096, 0.02, 0.064), NAVY_TIN, { bone: hips, at: [0, 0.098, 0] });
  plate(hips, BELT, 0.088, 0.014, [0, 0.098, 0.0328], [0, 0, 1]);
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.0062, 0.0062, 0.004, 10), CHROME, {
      bone: hips,
      at: [s * 0.049, 0.098, 0],
      dir: [s, 0, 0],
    });
    rivet(hips, [s * 0.0465, 0.098, 0.0325], 0.0013);
  }

  // chest plate rivets down both edges
  for (const s of [1, -1]) for (const y of [0.116, 0.134, 0.152]) rivet(chest, [s * 0.046, y, TF + 0.0009]);
  // back plate rivets
  for (const s of [1, -1]) for (const y of [0.117, 0.181]) rivet(chest, [s * 0.044, y, -TF - 0.0009]);

  // ---- gear window: glowing spark disc, meshing gears, chrome bezel and rivets
  glow(
    b.part(new THREE.CircleGeometry(0.0262, 24), "#ffffff", {
      bone: chest,
      at: [0, WIN_Y, TF + 0.0012],
      dir: [0, 0, 1],
      axis: "z",
      texture: WINDOW,
    }),
    0.9,
  );
  const drive = gearTrain(b, {
    at: [-0.004, 0.161, TF + 0.0028],
    axis: [0, 0, 1],
    module: 0.001,
    spin: "gear",
    bone: chest,
    group: "chest",
    color: [GILT, BRASS, COPPER],
    gears: [{ teeth: 20, spokes: 4, bore: 0.0008 }, { teeth: 12, angle: -70 }, { teeth: 10, from: 0, angle: 180 }],
  });
  drive.spin(14);
  b.part(new THREE.TorusGeometry(0.0265, 0.0028, 6, 28), CHROME, {
    bone: chest,
    at: [0, WIN_Y, TF + 0.003],
    dir: [0, 0, 1],
    axis: "z",
  });
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    rivet(chest, [0.0318 * Math.cos(a), WIN_Y + 0.0318 * Math.sin(a), TF + 0.001], 0.0013);
  }

  // ---- gauges
  for (const s of [1, -1]) {
    const at = V(s * 0.038, 0.177, TF);
    b.part(new THREE.CylinderGeometry(0.009, 0.0096, 0.004, 16), CHROME, {
      bone: chest,
      at: at.clone().add(V(0, 0, 0.002)),
      dir: [0, 0, 1],
    });
    b.part(new THREE.CircleGeometry(0.0078, 20), "#ffffff", {
      bone: chest,
      at: at.clone().add(V(0, 0, 0.0042)),
      dir: [0, 0, 1],
      axis: "z",
      texture: s > 0 ? GAUGE_A : GAUGE_B,
    });
    b.part(new THREE.TorusGeometry(0.0084, 0.0012, 4, 18), GILT, {
      bone: chest,
      at: at.clone().add(V(0, 0, 0.0042)),
      dir: [0, 0, 1],
      axis: "z",
    });
  }

  // ---- lamp strip with three glowing jewels
  b.part(new THREE.BoxGeometry(0.066, 0.012, 0.003), CHROME, { bone: chest, at: [0, 0.119, TF + 0.0015] });
  const LAMPS = ["#ff3b2f", "#ffd23a", "#5ef08a"];
  LAMPS.forEach((c, i) => {
    const at: number[] = [(i - 1) * 0.02, 0.119, TF + 0.003];
    glow(
      b.part(new THREE.SphereGeometry(0.0042, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), c, {
        bone: chest,
        at,
        dir: [0, 0, 1],
      }),
      1.3,
    );
    b.part(new THREE.TorusGeometry(0.0047, 0.001, 4, 14), GILT, { bone: chest, at, dir: [0, 0, 1], axis: "z" });
  });
  for (const s of [1, -1]) rivet(chest, [s * 0.03, 0.119, TF + 0.003], 0.0011);

  // ---- wind-up key in the back
  b.lathe(
    [
      [0, 0],
      [0.0075, 0],
      [0.0075, 0.0015],
      [0.0055, 0.003],
      [0, 0.003],
    ],
    { at: [0, KEY_Y, -TF], axis: [0, 0, -1], segments: 14, color: BRASS, bone: chest },
  );
  b.rod([0, KEY_Y, -TF + 0.002], [0, KEY_Y, -TF - 0.016], 0.0026, BRASS, { bone: keyJ });
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 10), GILT, {
    bone: keyJ,
    at: [0, KEY_Y, -TF - 0.009],
    dir: [0, 0, 1],
  });
  const KT = 0.0045;
  const keyHead = b.extrude(KEY, {
    at: [0, KEY_Y, -TF - 0.014],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: KT,
    bevel: 0.0012,
    smoothing: 2,
    color: KEY_PAINT,
    bone: keyJ,
  });
  for (const v of [0.014, -0.014])
    for (const side of [1, -1])
      b.part(new THREE.SphereGeometry(0.0022, 8, 5), GILT, {
        bone: keyJ,
        at: keyHead.local([0.02, v, (side * KT) / 2]),
      });

  // ------------------------------------------------------------------ neck and head
  b.lathe(
    [
      [0, 0],
      [0.021, 0],
      [0.021, 0.0018],
      [0.0175, 0.0028],
      [0.0195, 0.0048],
      [0.0165, 0.0058],
      [0.0185, 0.0078],
      [0.015, 0.0095],
      [0, 0.0105],
    ],
    { at: [0, 0.1935, 0], segments: 16, color: CHROME, bone: neck },
  );

  b.extrude(HEAD, { at: [0, HY0, HZ], x: [1, 0, 0], thickness: HD, bevel: 0.004, color: HEAD_PAINT, bone: head });
  plate(head, FACE, 0.076, 0.052, [0, 0.2315, HF + 0.0008], [0, 0, 1]);
  plate(head, SIDE, 0.058, 0.048, [0, 0.232, HB - 0.0008], [0, 0, -1]);
  for (const s of [1, -1]) for (const y of [0.2085, 0.2545]) rivet(head, [s * 0.0335, y, HF + 0.001], 0.0013);

  // ---- eyes: chrome bezels around glowing amber lenses, red tin brows
  for (const s of [1, -1]) {
    const ex = s * 0.021;
    b.lathe(
      [
        [0, 0],
        [0.0135, 0],
        [0.0135, 0.006],
        [0.0122, 0.0088],
        [0.0108, 0.008],
        [0.0105, 0.006],
        [0, 0.006],
      ],
      { at: [ex, 0.24, HF - 0.001], axis: [0, 0, 1], segments: 16, color: CHROME, bone: head },
    );
    glow(
      b.part(new THREE.CircleGeometry(0.0106, 20), "#ffffff", {
        bone: head,
        at: [ex, 0.24, HF + 0.0057],
        dir: [0, 0, 1],
        axis: "z",
        texture: EYE,
      }),
      1.3,
    );
    b.extrude(BROW, {
      at: [ex, 0.2545, HF + 0.0006],
      x: [1, 0.14 * s, 0],
      y: [-0.14 * s, 1, 0],
      thickness: 0.004,
      bevel: 0.001,
      smoothing: 1,
      color: RED_TIN,
      bone: head,
    });
  }
  // nose bolt
  b.part(new THREE.CylinderGeometry(0.003, 0.0032, 0.004, 6), CHROME, {
    bone: head,
    at: [0, 0.2325, HF + 0.001],
    dir: [0, 0, 1],
    flat: true,
  });

  // ---- mouth: upper grille on the head, lower grille on the jaw
  b.part(new THREE.BoxGeometry(0.036, 0.008, 0.006), CHROME, { bone: head, at: [0, 0.2235, HF + 0.002] });
  plate(head, MOUTH, 0.033, 0.0064, [0, 0.2235, HF + 0.0052], [0, 0, 1]);
  b.part(new THREE.BoxGeometry(0.036, 0.0075, 0.007), CHROME, { bone: jaw, at: [0, 0.2148, HF + 0.0025] });
  plate(jaw, MOUTH, 0.033, 0.006, [0, 0.2148, HF + 0.0061], [0, 0, 1]);
  b.part(new THREE.BoxGeometry(0.03, 0.0025, 0.004), RED_TIN, { bone: jaw, at: [0, 0.2105, HF + 0.003] });

  // ---- ears with spring antennas and glowing tips
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 16), CHROME, {
      bone: head,
      at: [s * 0.047, 0.236, HZ],
      dir: [s, 0, 0],
    });
    b.part(new THREE.ConeGeometry(0.0085, 0.011, 12), RED_TIN, {
      bone: head,
      at: [s * 0.0555, 0.236, HZ],
      dir: [s, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.0019, 6, 4), CHROME, { bone: head, at: [s * 0.0612, 0.236, HZ] });
    for (let k = 0; k < 6; k++) {
      const a = Math.PI / 6 + (k / 6) * Math.PI * 2;
      rivet(head, [s * 0.0443, 0.236 + 0.0166 * Math.cos(a), HZ + 0.0166 * Math.sin(a)], 0.0012);
    }

    const base = V(s * 0.047, 0.2475, HZ);
    const A = V(s * 0.35, 1, 0).normalize();
    const ant = b.joint(`antenna${S}`, { parent: head, at: base, dir: A });
    const p = (d: number) => base.clone().addScaledVector(A, d);
    b.rod(p(-0.002), p(0.04), 0.0012, CHROME, { bone: ant });
    b.sweep(coil(p(0.002), p(0.018), 0.003, 6), 0.0007, { color: CHROME, bone: ant, sides: 4 });
    b.part(new THREE.CylinderGeometry(0.0021, 0.0026, 0.003, 8), GILT, { bone: ant, at: p(0.0395), dir: A });
    glow(b.part(new THREE.SphereGeometry(0.0045, 10, 7), "#ff3b2f", { bone: ant, at: p(0.0445) }), 1.4);
  }

  // ---- crown: chrome cage over a glowing bulb
  b.lathe(
    [
      [0, 0],
      [0.019, 0],
      [0.019, 0.0025],
      [0.0165, 0.006],
      [0, 0.006],
    ],
    { at: [0, 0.2645, HZ], segments: 16, color: CHROME, bone: head },
  );
  b.part(new THREE.CylinderGeometry(0.0052, 0.0058, 0.004, 10), GILT, { bone: head, at: [0, 0.2725, HZ] });
  glow(b.part(new THREE.SphereGeometry(0.0078, 12, 8), "#ff4a2a", { bone: head, at: [0, 0.2765, HZ] }), 1.5);
  const cageC = V(0, 0.2705, HZ);
  b.sweep(arc(cageC, [0.016, 0.2705, HZ], [0, 0, 1], 180), 0.0011, { color: CHROME, bone: head, sides: 5 });
  b.sweep(arc(cageC, [0, 0.2705, HZ + 0.016], [-1, 0, 0], 180), 0.0011, { color: CHROME, bone: head, sides: 5 });
  b.part(new THREE.TorusGeometry(0.016, 0.0013, 4, 20), CHROME, {
    bone: head,
    at: [0, 0.2712, HZ],
    dir: [0, 1, 0],
    axis: "z",
  });
  b.part(new THREE.SphereGeometry(0.003, 8, 6), RED_TIN, { bone: head, at: [0, 0.2875, HZ] });

  // ------------------------------------------------------------------ arms (T-pose, slightly lowered)
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.lathe(
      [
        [0, 0],
        [0.0145, 0],
        [0.0145, 0.003],
        [0.012, 0.007],
        [0, 0.008],
      ],
      { at: [s * 0.056, 0.176, 0], axis: [s, 0, 0], segments: 14, color: CHROME, bone: chest },
    );
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      rivet(chest, [s * 0.0603, 0.176 + 0.0128 * Math.cos(a), 0.0128 * Math.sin(a)], 0.0011);
    }

    const sh = V(s * 0.068, 0.176, 0);
    const el = V(s * 0.106, 0.164, 0.003);
    const wr = V(s * 0.144, 0.152, 0.005);
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    const [shJ, elJ, hand] = arm.joints;

    b.part(new THREE.SphereGeometry(0.0105, 12, 8), RED_TIN, { bone: shJ, at: [s * 0.066, 0.176, 0] });
    b.sweep(arm, (t: number) => 0.0071 + 0.0018 * Math.pow(Math.abs(Math.cos(t * Math.PI * 11)), 0.5), {
      color: CHROME,
      sides: 8,
    });
    b.part(new THREE.SphereGeometry(0.0088, 10, 7), RED_TIN, { bone: elJ, at: el });

    const d = wr.clone().sub(el).normalize();
    const u = V(0, 1, 0).sub(d.clone().multiplyScalar(d.y)).normalize();
    const w = d.clone().cross(u).normalize();
    const along = (k: number) => wr.clone().addScaledVector(d, k);

    // cuff, ring, palm and pivot pin
    b.rod(along(-0.003), along(0.008), [0.0085, 0.0105], RED_TIN, { bone: hand });
    b.rod(along(0.0075), along(0.0095), 0.0112, CHROME, { bone: hand });
    const knuckle = along(0.0135);
    b.part(new THREE.SphereGeometry(0.0085, 10, 7), RED_TIN, { bone: hand, at: knuckle });
    b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.012, 8), CHROME, { bone: hand, at: knuckle, dir: w });

    // pincer claws on their own digit joints
    const up = b.joint(`clawUp${S}`, {
      parent: hand,
      at: knuckle.clone().addScaledVector(u, 0.006),
      dir: d.clone().addScaledVector(u, 0.2),
      role: "digit",
    });
    const dn = b.joint(`clawDn${S}`, {
      parent: hand,
      at: knuckle.clone().addScaledVector(u, -0.006),
      dir: d.clone().addScaledVector(u, -0.2),
      role: "digit",
    });
    b.extrude(CLAW, {
      at: knuckle.clone().addScaledVector(u, 0.0075).addScaledVector(d, 0.002),
      x: d,
      y: u,
      thickness: 0.005,
      bevel: 0.0012,
      color: CHROME,
      bone: up,
    });
    b.extrude(CLAW, {
      at: knuckle.clone().addScaledVector(u, -0.0075).addScaledVector(d, 0.002),
      x: d,
      y: u.clone().negate(),
      thickness: 0.005,
      bevel: 0.0012,
      color: CHROME,
      bone: dn,
    });
  }

  // ------------------------------------------------------------------ legs and shoes
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.028;
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [x, 0.094, 0],
        [x, 0.058, 0],
        [x, 0.024, 0],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [x, 0, 0.012] },
    );
    const [hipJ, kneeJ, ankle] = leg.joints;

    b.frustumBox([x, 0.097, 0], [x, 0.058, 0], [0.032, 0.036], [0.03, 0.036], { bone: hipJ, color: LEG_PAINT });
    for (const y of [0.07, 0.086]) rivet(hipJ, [s * 0.0442, y, 0], 0.0012);
    b.part(new THREE.CylinderGeometry(0.0088, 0.0088, 0.04, 12), CHROME, {
      bone: kneeJ,
      at: [x, 0.058, 0],
      dir: [1, 0, 0],
    });
    for (const k of [1, -1])
      b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.0015, 10), RED_TIN, {
        bone: kneeJ,
        at: [x + k * 0.0205, 0.058, 0],
        dir: [1, 0, 0],
      });
    b.frustumBox([x, 0.06, 0], [x, 0.024, 0], [0.034, 0.04], [0.04, 0.04], { bone: kneeJ, color: LEG_PAINT });
    plate(kneeJ, LEG, 0.03, 0.026, [x, 0.041, 0.0208], [0, 0, 1]);
    b.part(new THREE.BoxGeometry(0.044, 0.0035, 0.044), CHROME, { bone: ankle, at: [x, 0.0265, 0] });

    b.extrude(FOOT, {
      at: [x, 0, -0.03],
      x: [0, 0, 1],
      thickness: 0.046,
      bevel: 0.003,
      color: FOOT_PAINT,
      bone: ankle,
    });
    b.rod([x - 0.02, 0.0075, 0.0555], [x + 0.02, 0.0075, 0.0555], 0.0034, CHROME, { bone: ankle });
    for (const z of [-0.018, 0, 0.018]) rivet(ankle, [s * 0.0512, 0.0175, z], 0.0013);
  }

  return b.root;
}
