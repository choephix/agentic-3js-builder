import * as THREE from "three";
import { arc, catmull, createBuilder, mix, paint, polyline, rgb, rng, smoothstep, svg } from "../../../../src/index";
import type { ExtrudeOptions, Fill, PartOptions, Rgb } from "../../../../src/index";

export const meta = {
  name: "Starlite 45 Jukebox",
  description:
    "1950s diner jukebox: cream arch cabinet ringed by glowing red, amber and teal tubes with chrome trim, a domed glass " +
    "window over a stack of records and a swinging picker arm, a slanted deck of chrome selector buttons with title cards, " +
    "a coin slot, and a starburst speaker grille.",
};

const DEG = Math.PI / 180;
type P2 = [number, number];

const CREAM = "#efe3c2";
const CABINET = "#17676d";
const CHERRY = "#a3202a";
const DARK = "#17121f";
const PLINTH = "#241d2a";
const VINYL = "#16131b";
const GLASS = "#c6ecee";

/** Arch ("tombstone") outline in the front view: flat bottom, straight sides, semicircular top. */
function tomb(hw: number, y0: number, yc: number, segs: number): P2[] {
  const pts: P2[] = [
    [-hw, y0],
    [hw, y0],
    [hw, yc],
  ];
  for (let i = 1; i < segs; i++) {
    const a = (i / segs) * Math.PI;
    pts.push([hw * Math.cos(a), yc + hw * Math.sin(a)]);
  }
  pts.push([-hw, yc]);
  return pts;
}

/** Counter-clockwise rounded rectangle centred on the origin. */
function rrect(hw: number, hh: number, r: number, n = 3): P2[] {
  const pts: P2[] = [];
  const corners: Array<[number, number, number]> = [
    [hw - r, hh - r, 0],
    [-(hw - r), hh - r, 90],
    [-(hw - r), -(hh - r), 180],
    [hw - r, -(hh - r), 270],
  ];
  for (const [cx, cy, a0] of corners)
    for (let i = 0; i <= n; i++) {
      const a = (a0 + (90 * i) / n) * DEG;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  return pts;
}

const shift = (pts: P2[], dx: number, dy: number): P2[] => pts.map(([x, y]) => [x + dx, y + dy]);

/** Half-sunburst crest: alternating long and short points over a flat base. */
function fan(ro: number, ri: number, spikes: number): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i <= spikes * 2; i++) {
    const a = (Math.PI * i) / (spikes * 2);
    const r = i % 2 === 0 ? ro : ri;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

const scaled = (c: Rgb, k: number): Rgb => [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "jukebox", paintSize: 1024 });
  b.joint("root", { at: [0, 0, 0] });

  // ------------------------------------------------------------------ materials
  const glow = (hex: string, k = 0.75) => {
    const m = b.material(hex);
    m.emissive.set(hex);
    m.emissiveIntensity = k;
    return hex;
  };
  const RED = glow("#ff3326", 0.75);
  const AMBER = glow("#ffae1a", 0.75);
  const TEAL = glow("#16e0cf", 0.7);
  const RED_CORE = glow("#ffd9cf", 1);
  const AMBER_CORE = glow("#fff0b0", 1);
  const TEAL_CORE = glow("#d9fffb", 1);
  const shine = (hex: string) => {
    const m = b.material(hex);
    m.metalness = 0.6;
    m.roughness = 0.2;
    m.emissive.set("#2e373e");
    m.emissiveIntensity = 0.55;
    return hex;
  };
  const CHROME = shine("#e3eaee");
  const CHROME_D = shine("#a9b5bc");
  const glass = b.material(GLASS);
  glass.transparent = true;
  glass.opacity = 0.17;
  glass.depthWrite = false;
  glass.roughness = 0.05;
  glass.metalness = 0;
  const vinyl = b.material(VINYL);
  vinyl.roughness = 0.3;
  vinyl.metalness = 0.15;

  // ------------------------------------------------------------------ helpers
  const put = (g: THREE.BufferGeometry, color: Fill, o: PartOptions = {}) => b.part(g, color, { bone: "root", ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cylZ = (rt: number, rb: number, h: number, seg = 14) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg);
    g.rotateX(Math.PI / 2);
    return g;
  };
  const cylY = (rt: number, rb: number, h: number, seg = 14) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const slab = (outline: P2[], color: Fill, at: number[], thickness: number, o: Partial<ExtrudeOptions> = {}) =>
    b.extrude(outline, { x: [1, 0, 0], y: [0, 1, 0], bone: "root", ...o, color, at, thickness } as ExtrudeOptions);

  // ------------------------------------------------------------------ paints
  const GC_Y = 0.325;
  const CLOTH = rgb("#4a1219");
  const GOLD = rgb("#f2c14e");
  const GOLD_D = rgb("#b07d22");
  const CREAMY = rgb("#fbebc0");
  const TEALG = rgb("#27b8ae");
  const starburst = paint((p) => {
    const x = p.x;
    const y = p.y - GC_Y;
    const r = Math.hypot(x, y);
    const ang = Math.atan2(y, x);
    const weave = (Math.floor(p.x / 0.006) + Math.floor(p.y / 0.006)) % 2 === 0 ? 1 : 0.86;
    let c: Rgb = scaled(CLOTH, weave);
    const N = 24;
    const step = (Math.PI * 2) / N;
    const idx = Math.round(ang / step);
    const dAng = Math.abs(ang - idx * step);
    const k = ((idx % N) + N) % N;
    const long = k % 2 === 0;
    const len = long ? 0.32 : 0.17;
    const w0 = long ? 0.011 : 0.0085;
    const half = w0 * Math.max(0, 1 - r / len);
    const off = r * Math.sin(dAng);
    if (r > 0.05 && r < len && off < half) c = off > half - 0.0016 ? GOLD_D : long ? GOLD : CREAMY;
    if (r >= 0.06 && r <= 0.066) c = GOLD;
    if (r >= 0.104 && r <= 0.109) c = TEALG;
    if (r >= 0.166 && r <= 0.171) c = GOLD;
    if (r < 0.05) c = r < 0.012 ? CREAMY : r < 0.03 ? TEALG : r < 0.041 ? CLOTH : GOLD;
    const m = Math.min(0.345 - Math.abs(x), 0.17 - Math.abs(y));
    if (m < 0.0055) c = GOLD;
    else if (m < 0.0085) c = CLOTH;
    return c;
  });

  const sunPaint = paint((p) => {
    const x = p.x;
    const y = p.y - 0.99;
    const r = Math.hypot(x, y);
    const a = Math.atan2(y, x);
    const ray = smoothstep(0.35, 0.65, 0.5 + 0.5 * Math.sin(a * 14));
    const warm = mix("#ffd35c", "#e0401f", smoothstep(0.0, 0.16, r));
    const col = mix(warm, "#2b1646", smoothstep(0.1, 0.34, r));
    return scaled(col, 0.76 + 0.36 * ray);
  });

  // ------------------------------------------------------------------ svg textures
  const recTex = ["#d8352a", "#17a398", "#f0a31c"].map((label) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r="64" fill="#16131b"/>
        <circle cx="64" cy="64" r="61" fill="none" stroke="#2c2835" stroke-width="1.6"/>
        <circle cx="64" cy="64" r="56" fill="none" stroke="#2c2835" stroke-width="1.4"/>
        <circle cx="64" cy="64" r="51" fill="none" stroke="#2c2835" stroke-width="1.4"/>
        <circle cx="64" cy="64" r="46" fill="none" stroke="#2c2835" stroke-width="1.4"/>
        <circle cx="64" cy="64" r="41" fill="none" stroke="#2c2835" stroke-width="1.4"/>
        <circle cx="64" cy="64" r="36" fill="none" stroke="#2c2835" stroke-width="1.4"/>
        <path d="M14 46 A54 54 0 0 1 46 14" stroke="#4a4560" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M114 82 A54 54 0 0 1 82 114" stroke="#3a3548" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="64" cy="64" r="29" fill="${label}"/>
        <circle cx="64" cy="64" r="29" fill="none" stroke="#fbe9c0" stroke-width="2.5"/>
        <rect x="46" y="52" width="36" height="4" fill="#fff4d6"/>
        <rect x="52" y="60" width="24" height="3" fill="#fff4d6"/>
        <rect x="47" y="72" width="34" height="3" fill="#fff4d6"/>
        <rect x="55" y="79" width="18" height="3" fill="#fff4d6"/>
        <circle cx="64" cy="64" r="3.4" fill="#16131b"/>
      </svg>`,
      { size: 128 },
    ),
  );

  const cardDefs: Array<[string, string, string]> = [
    ["#d8352a", "CHERRY SODA", "The Dandy Cats"],
    ["#17a398", "HOT ROD BLUES", "Mel &amp; the Gears"],
    ["#f0a31c", "MOON DANCE BOP", "Lulu Starr"],
    ["#6b3fa0", "LOVE LANE", "The Velvettes"],
  ];
  const cardTex = cardDefs.map(([band, title, artist]) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 88">
        <rect width="160" height="88" fill="#f7edd2"/>
        <rect width="160" height="24" fill="${band}"/>
        <circle cx="14" cy="12" r="7" fill="#16131b"/>
        <circle cx="14" cy="12" r="2.6" fill="${band}"/>
        <text x="28" y="17" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#fff6e0">45 RPM</text>
        <text x="80" y="52" text-anchor="middle" textLength="${Math.min(140, title.length * 10.5)}" lengthAdjust="spacingAndGlyphs" font-family="Arial Black, Arial, sans-serif" font-size="17" font-weight="bold" fill="#241c2a">${title}</text>
        <text x="80" y="76" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="14" fill="#6b2a2a">${artist}</text>
        <rect x="1.5" y="1.5" width="157" height="85" fill="none" stroke="#c9b98f" stroke-width="2"/>
      </svg>`,
      { size: 256 },
    ),
  );

  const nameTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 40">
      <rect width="300" height="40" rx="7" fill="#0f3d42"/>
      <rect x="2.5" y="2.5" width="295" height="35" rx="5" fill="none" stroke="#e6ecef" stroke-width="2"/>
      <polygon points="22,20 27,12 32,20 27,28" fill="#f2c14e"/>
      <polygon points="278,20 273,12 268,20 273,28" fill="#f2c14e"/>
      <text x="150" y="29" text-anchor="middle" font-family="Brush Script MT, Snell Roundhand, Segoe Script, cursive" font-style="italic" font-size="28" fill="#f2c14e">Starlite 45</text>
    </svg>`,
    { size: 256 },
  );

  const coinTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4f8fa"/><stop offset="0.5" stop-color="#c3cdd3"/><stop offset="1" stop-color="#eef3f5"/>
      </linearGradient></defs>
      <rect width="100" height="140" fill="url(#g)"/>
      <rect x="4" y="4" width="92" height="132" rx="8" fill="none" stroke="#7d8a92" stroke-width="2"/>
      <g font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">
        <circle cx="22" cy="24" r="12" fill="#c98a2b"/><text x="22" y="29" font-size="13" fill="#fff4d6">5</text>
        <circle cx="50" cy="24" r="12" fill="#a9b3ba"/><text x="50" y="29" font-size="13" fill="#2a3338">10</text>
        <circle cx="78" cy="24" r="12" fill="#a9b3ba"/><text x="78" y="29" font-size="13" fill="#2a3338">25</text>
        <rect x="38" y="46" width="24" height="46" rx="12" fill="#d3dce1" stroke="#7d8a92" stroke-width="2"/>
        <text x="50" y="113" font-size="16" fill="#a3202a">INSERT</text>
        <text x="50" y="130" font-size="16" fill="#a3202a">COIN</text>
      </g>
    </svg>`,
    { size: 256 },
  );

  const stripTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 20">
      <rect width="440" height="20" fill="#f7edd2"/>
      <text x="220" y="15" text-anchor="middle" textLength="400" lengthAdjust="spacingAndGlyphs" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#a3202a">MAKE YOUR SELECTION  •  PLAY 3 FOR 10¢</text>
    </svg>`,
    { size: 512 },
  );

  const glintTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 100">
      <polygon points="8,100 28,0 40,0 20,100" fill="#f4fdff"/>
      <polygon points="46,100 58,38 64,38 52,100" fill="#f4fdff"/>
    </svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------------ base and cabinet
  put(box(0.86, 0.1, 0.56), PLINTH, { at: [0, 0.05, 0] });
  put(box(0.8, 0.03, 0.004), CHROME, { at: [0, 0.055, 0.282] });
  put(box(0.95, 0.014, 0.64), CHROME, { at: [0, 0.107, 0] });

  slab(shift(rrect(0.46, 0.25, 0.02, 3), 0, 0.35), CABINET, [0, 0, 0], 0.6, { bevel: 0.012, name: "cabinetLower" });
  slab(tomb(0.425, 0.55, 1.06, 16), CREAM, [0, 0, 0], 0.5, { bevel: 0.022, name: "cabinetUpper" });

  // chrome ledge and corner posts on the lower cabinet
  for (const sx of [1, -1]) {
    b.rod([sx * 0.452, 0.607, -0.28], [sx * 0.452, 0.607, 0.29], 0.006, { color: CHROME, bone: "root", caps: "round" });
    b.capsule([sx * 0.447, 0.128, 0.292], [sx * 0.447, 0.572, 0.292], 0.008, { color: CHROME, bone: "root" });
  }

  // ------------------------------------------------------------------ speaker grille
  slab(shift(rrect(0.375, 0.2, 0.03, 3), 0, GC_Y), CHROME, [0, 0, 0.3], 0.012, { bevel: 0.003, name: "grilleFrame" });
  slab(shift(rrect(0.345, 0.17, 0.02, 3), 0, GC_Y), starburst, [0, 0, 0.3], 0.02, { name: "speakerGrille" });
  const neonPts = shift(rrect(0.352, 0.177, 0.022, 4), 0, GC_Y).map(([x, y]) => [x, y, 0.307]);
  b.sweep(polyline(neonPts, { closed: true }), 0.0045, { color: TEAL, sides: 6, bone: "root", name: "grilleNeon" });

  // glowing amber flank tubes with chrome clamps
  for (const sx of [1, -1]) {
    b.capsule([sx * 0.42, 0.15, 0.306], [sx * 0.42, 0.5, 0.306], 0.0095, { color: AMBER, bone: "root", sides: 8 });
    b.capsule([sx * 0.42, 0.15, 0.314], [sx * 0.42, 0.5, 0.314], 0.0035, { color: AMBER_CORE, bone: "root", sides: 5 });
    for (const y of [0.16, 0.325, 0.49]) put(cylY(0.0135, 0.0135, 0.012, 12), CHROME, { at: [sx * 0.42, y, 0.306] });
  }

  // nameplate
  put(box(0.27, 0.046, 0.008), CHROME, { at: [0, 0.553, 0.302] });
  put(new THREE.PlaneGeometry(0.258, 0.0344), "#ffffff", { at: [0, 0.553, 0.3065], texture: nameTex });

  // ------------------------------------------------------------------ arch trough and glowing tubes
  const ARCH_Y = 1.06;
  const LEG_Y = 0.78;
  const TZ = 0.262;
  slab(tomb(0.412, 0.762, ARCH_Y, 18), DARK, [0, 0, 0.25], 0.01, { name: "archTrough" });

  const archPath = (R: number, z: number) =>
    polyline([
      [-R, LEG_Y, z],
      [-R, ARCH_Y, z],
    ])
      .concat(arc([0, ARCH_Y, z], [-R, ARCH_Y, z], [0, 0, -1], 180))
      .concat(
        polyline([
          [R, ARCH_Y, z],
          [R, LEG_Y, z],
        ]),
      );

  const tubes: Array<{ R: number; r: number; c: string; core?: string }> = [
    { R: 0.402, r: 0.008, c: CHROME },
    { R: 0.372, r: 0.019, c: RED, core: RED_CORE },
    { R: 0.34, r: 0.007, c: CHROME },
    { R: 0.308, r: 0.019, c: AMBER, core: AMBER_CORE },
    { R: 0.276, r: 0.007, c: CHROME },
    { R: 0.244, r: 0.019, c: TEAL, core: TEAL_CORE },
    { R: 0.209, r: 0.009, c: CHROME },
  ];
  for (const t of tubes) {
    b.sweep(archPath(t.R, TZ), t.r, { color: t.c, sides: t.core ? 10 : 8, bone: "root", name: "archTube" });
    if (t.core)
      b.sweep(archPath(t.R, TZ + t.r - 0.003), 0.0048, { color: t.core, sides: 6, bone: "root", name: "archCore" });
  }
  // cornice rail where the tubes land, and the window sill bar
  b.capsule([-0.44, 0.775, 0.264], [0.44, 0.775, 0.264], 0.016, { color: CHROME, bone: "root", sides: 10 });
  b.capsule([-0.2, 0.793, TZ], [0.2, 0.793, TZ], 0.009, { color: CHROME, bone: "root" });

  // ------------------------------------------------------------------ window: backdrop, glass, mechanism
  slab(tomb(0.2, 0.8, ARCH_Y, 14), sunPaint, [0, 0, 0.257], 0.006, { name: "windowBackdrop" });
  put(box(0.4, 0.012, 0.16), "#1d1727", { at: [0, 0.806, 0.335] });
  b.capsule([-0.19, 0.806, 0.412], [0.19, 0.806, 0.412], 0.007, { color: CHROME, bone: "root" });

  // record stack
  const CX = -0.035;
  const CY = 1.03;
  const RR = 0.092;
  const recGeo = cylZ(RR, RR, 0.005, 26);
  const faceGeo = new THREE.CircleGeometry(RR, 26);
  const rand = rng(11);
  for (let i = 0; i < 10; i++) {
    const raised = i === 6;
    const dx = raised ? 0 : (rand() - 0.5) * 0.008;
    const dy = raised ? 0.055 : (rand() - 0.5) * 0.006;
    const z = 0.285 + i * 0.0125;
    put(recGeo, VINYL, { at: [CX + dx, CY + dy, z], name: "record" });
    put(faceGeo, "#ffffff", { at: [CX + dx, CY + dy, z + 0.0031], texture: recTex[i % 3], name: "recordFace" });
  }
  // rack: rails and posts
  for (const sx of [-1, 1]) {
    const x = CX + sx * 0.04;
    b.rod([x, 0.936, 0.275], [x, 0.936, 0.41], 0.004, { color: CHROME, bone: "root", caps: "round" });
    for (const z of [0.278, 0.407]) b.rod([x, 0.812, z], [x, 0.936, z], 0.004, { color: CHROME_D, bone: "root" });
  }

  // turntable
  put(cylY(0.035, 0.04, 0.02, 14), CHROME_D, { at: [-0.035, 0.822, 0.335] });
  put(cylY(0.07, 0.07, 0.01, 22), CHROME, { at: [-0.035, 0.837, 0.335] });
  put(cylY(0.062, 0.062, 0.003, 22), VINYL, { at: [-0.035, 0.8435, 0.335] });
  const topFace = new THREE.CircleGeometry(0.062, 22);
  topFace.rotateX(-Math.PI / 2);
  put(topFace, "#ffffff", { at: [-0.035, 0.8453, 0.335], texture: recTex[0] });
  put(cylY(0.003, 0.003, 0.014, 6), CHROME, { at: [-0.035, 0.851, 0.335] });

  // tonearm
  b.joint("tonearm", {
    parent: "root",
    at: [-0.15, 0.84, 0.395],
    aim: [-0.045, 0.852, 0.345],
    up: [0, 1, 0],
    role: "hinge",
  });
  const TA = { bone: "tonearm" };
  put(cylY(0.012, 0.014, 0.02, 12), CHROME, { at: [-0.15, 0.822, 0.395], ...TA });
  put(cylY(0.008, 0.008, 0.008, 10), CHROME_D, { at: [-0.15, 0.838, 0.395], ...TA });
  b.rod([-0.15, 0.844, 0.395], [-0.088, 0.856, 0.372], 0.0035, { color: CHROME, bone: "tonearm", caps: "round" });
  b.rod([-0.088, 0.856, 0.372], [-0.045, 0.852, 0.345], 0.0032, { color: CHROME, bone: "tonearm", caps: "round" });
  put(box(0.016, 0.004, 0.01), CHROME_D, { at: [-0.043, 0.85, 0.344], ...TA });
  put(cylY(0.0015, 0.0004, 0.008, 5), CHROME, { at: [-0.043, 0.845, 0.344], ...TA });
  put(new THREE.SphereGeometry(0.01, 8, 6), CHROME_D, { at: [-0.168, 0.848, 0.402], ...TA });

  // picker arm, hinged low on the right and gripping the lifted record
  const PX = 0.15;
  const PY = 0.875;
  b.joint("pickerArm", { parent: "root", at: [PX, PY, 0.36], dir: [1, 0, 0], up: [0, 1, 0], role: "hinge" });
  const PA = { bone: "pickerArm" };
  const WX = CX + RR + 0.035;
  const WY = CY + 0.055;
  b.rod([PX, PY, 0.26], [PX, PY, 0.36], 0.008, { color: CHROME_D, bone: "root" });
  put(cylZ(0.02, 0.02, 0.014, 16), CHROME, { at: [PX, PY, 0.362], ...PA });
  put(cylZ(0.012, 0.012, 0.006, 12), CHERRY, { at: [PX, PY, 0.372], ...PA });
  b.rod([PX, PY, 0.36], [WX, WY, 0.36], 0.0055, { color: CHROME, bone: "pickerArm", caps: "round" });
  put(box(0.008, 0.016, 0.019), CHROME, { at: [WX, WY, 0.36], ...PA });
  put(box(0.04, 0.006, 0.004), CHROME, { at: [WX - 0.024, WY, 0.3545], ...PA });
  put(box(0.04, 0.006, 0.004), CHROME, { at: [WX - 0.024, WY, 0.3655], ...PA });
  put(new THREE.SphereGeometry(0.014, 10, 8), CHROME, { at: [PX + 0.0133, PY - 0.048, 0.36], ...PA });

  // domed glass over the whole mechanism, with painted-on glints
  slab(tomb(0.2, 0.8, ARCH_Y, 14), GLASS, [0, 0, 0.25], 0.34, { bevel: 0.07, detail: 2, name: "domeGlass" });
  put(new THREE.PlaneGeometry(0.07, 0.1), "#ffffff", { at: [-0.075, 1.1, 0.4212], texture: glintTex });

  // ------------------------------------------------------------------ selector deck
  slab(
    [
      [0.1, 0.58],
      [0.335, 0.58],
      [0.335, 0.6],
      [0.25, 0.762],
      [0.1, 0.762],
    ],
    CHERRY,
    [0, 0, 0],
    0.86,
    { x: [0, 0, 1], bevel: 0.006, name: "deck" },
  );
  put(box(0.87, 0.026, 0.006), CHROME, { at: [0, 0.59, 0.338] });
  for (const sx of [1, -1]) b.rod([sx * 0.432, 0.6, 0.335], [sx * 0.432, 0.762, 0.25], 0.006, { color: CHROME, bone: "root" });

  const A = Math.atan2(0.085, 0.162);
  const deck = b.region({ at: [0, 0.6, 0.335], quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-A, 0, 0)), bone: "root" });
  const dput = (g: THREE.BufferGeometry, c: Fill, o: PartOptions = {}) => deck.part(g, c, { bone: "root", ...o });

  const frameG = box(0.049, 0.029, 0.004);
  const cardG = new THREE.PlaneGeometry(0.044, 0.0242);
  const btnBase = cylZ(0.0125, 0.0125, 0.005, 14);
  const btnCap = cylZ(0.0085, 0.0105, 0.007, 14);
  const jewelG = cylZ(0.0055, 0.0065, 0.0025, 10);
  const jewelColors = [RED, AMBER, TEAL];
  for (let set = 0; set < 2; set++) {
    const by = set === 0 ? 0.11 : 0.042;
    const cy = by + 0.03;
    for (let k = 0; k < 8; k++) {
      const x = -0.355 + k * 0.06;
      dput(frameG, CHROME, { at: [x, cy, 0.002] });
      dput(cardG, "#ffffff", { at: [x, cy, 0.0042], texture: cardTex[(k + set * 2) % 4] });
      dput(btnBase, CHROME_D, { at: [x, by, 0.0025] });
      dput(btnCap, CHROME, { at: [x, by, 0.0085] });
      dput(jewelG, jewelColors[(k + set) % 3], { at: [x, by, 0.0133] });
    }
  }
  dput(new THREE.PlaneGeometry(0.4, 0.0182), "#ffffff", { at: [-0.145, 0.171, 0.0012], texture: stripTex });
  dput(box(0.004, 0.153, 0.004), CHROME, { at: [0.125, 0.09, 0.002] });

  // indicator jewels
  const domeG = new THREE.SphereGeometry(0.011, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  domeG.rotateX(Math.PI / 2);
  [
    [0.135, RED],
    [0.09, AMBER],
    [0.045, TEAL],
  ].forEach(([y, c]) => {
    dput(cylZ(0.0135, 0.0135, 0.004, 14), CHROME, { at: [0.165, y as number, 0.002] });
    dput(domeG, c as string, { at: [0.165, y as number, 0.004] });
  });

  // coin acceptor
  dput(box(0.1, 0.14, 0.006), CHROME_D, { at: [0.27, 0.09, 0.003] });
  dput(new THREE.PlaneGeometry(0.094, 0.1316), "#ffffff", { at: [0.27, 0.09, 0.0062], texture: coinTex });
  dput(box(0.016, 0.05, 0.0025), CHROME, { at: [0.27, 0.091, 0.0078] });
  dput(box(0.005, 0.038, 0.003), DARK, { at: [0.27, 0.091, 0.0085] });
  dput(box(0.04, 0.012, 0.01), DARK, { at: [0.27, 0.011, 0.005] });
  dput(cylZ(0.007, 0.007, 0.006, 10), CHROME, { at: [0.315, 0.011, 0.003] });

  // ------------------------------------------------------------------ sides
  for (const sx of [1, -1]) {
    slab(shift(rrect(0.215, 0.185, 0.025, 3), 0, 0.35), CHROME_D, [sx * 0.4625, 0, 0], 0.005, { x: [0, 0, -sx] });
    slab(shift(rrect(0.2, 0.17, 0.02, 3), 0, 0.35), CREAM, [sx * 0.466, 0, 0], 0.004, { x: [0, 0, -sx] });
    [
      [0.43, 0.3],
      [0.35, 0.22],
      [0.27, 0.14],
    ].forEach(([y, len]) =>
      b.capsule([sx * 0.472, y, 0.17], [sx * 0.472, y, 0.17 - len], 0.0075, { color: CHROME, bone: "root" }),
    );
    [
      [0.8, 0.34, AMBER],
      [0.86, 0.26, TEAL],
      [0.92, 0.18, RED],
    ].forEach(([y, len, c]) =>
      b.capsule([sx * 0.432, y as number, 0.19], [sx * 0.432, y as number, 0.19 - (len as number)], 0.0105, {
        color: c as string,
        bone: "root",
        sides: 8,
      }),
    );
    for (const y of [0.74, 0.98]) b.rod([sx * 0.428, y, -0.22], [sx * 0.428, y, 0.22], 0.004, { color: CHROME, bone: "root", caps: "round" });
  }

  // ------------------------------------------------------------------ crest
  slab(fan(0.075, 0.045, 4), CHROME, [0, 1.468, 0.2], 0.014, { bevel: 0.003, name: "crest" });
  put(new THREE.SphereGeometry(0.017, 10, 8), AMBER, { at: [0, 1.482, 0.212] });

  // ------------------------------------------------------------------ back: vents and power cord
  for (let i = 0; i < 6; i++) put(box(0.5, 0.014, 0.004), DARK, { at: [0, 0.2 + i * 0.035, -0.301] });
  put(cylZ(0.012, 0.012, 0.01, 10), CHROME_D, { at: [0.2, 0.2, -0.303] });
  const cord = catmull([
    [0.2, 0.2, -0.3],
    [0.2, 0.2, -0.335],
    [0.205, 0.13, -0.365],
    [0.22, 0.05, -0.39],
    [0.25, 0.008, -0.42],
    [0.29, 0.007, -0.46],
    [0.29, 0.007, -0.5],
  ]);
  b.sweep(cord, 0.007, { color: "#121014", sides: 6, bone: "root", name: "powerCord" });
  put(box(0.024, 0.018, 0.04), "#121014", { at: [0.29, 0.011, -0.52] });
  for (const sx of [-1, 1]) put(box(0.004, 0.012, 0.014), CHROME_D, { at: [0.29 + sx * 0.006, 0.011, -0.547] });

  // ------------------------------------------------------------------ finish
  const out = b.root;
  const sheet = b.ctx.paintMaterial();
  if (sheet.map) {
    sheet.emissiveMap = sheet.map;
    sheet.emissive.set("#ffffff");
    sheet.emissiveIntensity = 0.35;
    sheet.needsUpdate = true;
  }
  return out;
}
