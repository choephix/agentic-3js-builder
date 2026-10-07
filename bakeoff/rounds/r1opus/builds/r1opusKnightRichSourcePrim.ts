import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  rng,
  svg,
  catmull,
  mottle,
  scales,
} from "../../../../src/index";

export const meta = {
  name: "Battle-worn Knight",
  description:
    "A fantasy knight in dented, scratched plate: great helm with a narrow eye slit and tall crimson plume, gold-filigreed layered pauldrons, deep-blue surcoat with a silver griffin, griffin kite shield, broadsword and a torn crimson cape.",
};

// Palette
const STEEL_A = "#8f99a4";
const STEEL_B = "#c3cad1";
const STEEL_DENT = "#4f5761";
const SCRATCH = "#eef2f5";
const BLUE_A = "#1b3878";
const BLUE_B = "#132a5c";
const GOLD = "#d9a93f";
const GOLD_D = "#8c6420";
const CRIMSON = "#a8142b";
const CRIMSON_D = "#5c0915";
const LEATHER = "#4b2f1d";
const DARK = "#08090c";

/** Mottled base with dents (dark pits with a bright rim) and fine scratches. */
function weathered(
  a: string,
  b: string,
  dent: string,
  scratch: string,
  seed: number,
  opts: { size?: number; dents?: number; scratches?: number } = {},
) {
  const size = opts.size ?? 0.12;
  const dents = opts.dents ?? 0.2;
  const sc = opts.scratches ?? 1;
  const q = new THREE.Vector3();
  const q2 = new THREE.Vector3();
  return paint((p) => {
    let c = mix(a, b, smoothstep(0.32, 0.68, noise(p, size, seed)));
    const d = cells(p, 0.07, seed + 5);
    if (d.id < dents) {
      c = mix(c, dent, smoothstep(0.42, 0.05, d.d1) * 0.6);
      const rim = smoothstep(0.38, 0.46, d.d1) * smoothstep(0.56, 0.46, d.d1);
      c = mix(c, scratch, rim * 0.35);
    }
    if (sc > 0) {
      q.set(p.x + p.z * 0.4, p.y * 6, p.z - p.x * 0.3);
      const s1 = Math.abs(noise(q, 0.35, seed + 9) - 0.5);
      q2.set(p.x * 6, p.y + p.x * 0.5, p.z * 6);
      const s2 = Math.abs(noise(q2, 0.35, seed + 21) - 0.5);
      const mask = smoothstep(0.52, 0.66, noise(p, 0.18, seed + 13)) * sc;
      const line = Math.max(smoothstep(0.012, 0.004, s1), smoothstep(0.01, 0.003, s2));
      if (line * mask > 0) c = mix(c, scratch, Math.min(1, line * mask * 0.9));
    }
    return c;
  });
}

const GRIFFIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
<path d="M122,165 C165,185 182,150 170,118" fill="none" stroke="#1b2233" stroke-width="13" stroke-linecap="round"/>
<path d="M122,165 C165,185 182,150 170,118" fill="none" stroke="#dfe4ea" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="170" cy="110" rx="10" ry="16" fill="#dfe4ea" stroke="#1b2233" stroke-width="4"/>
<path d="M108,170 L96,212 L78,222 M128,166 L138,210 L156,220" fill="none" stroke="#1b2233" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M108,170 L96,212 L78,222 M128,166 L138,210 L156,220" fill="none" stroke="#dfe4ea" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M96,100 C104,48 140,18 188,8 C180,26 186,40 174,50 C184,58 176,74 162,78 C170,90 156,102 142,102 C146,112 128,118 118,112 Z" fill="#dfe4ea" stroke="#1b2233" stroke-width="5" stroke-linejoin="round"/>
<path d="M110,92 L170,30 M118,100 L176,52 M128,106 L160,80" stroke="#1b2233" stroke-width="3" fill="none"/>
<ellipse cx="104" cy="132" rx="30" ry="54" transform="rotate(-22 104 132)" fill="#dfe4ea" stroke="#1b2233" stroke-width="5"/>
<ellipse cx="80" cy="82" rx="18" ry="27" transform="rotate(-30 80 82)" fill="#dfe4ea" stroke="#1b2233" stroke-width="5"/>
<path d="M86,112 L56,104 L40,88 M92,130 L60,140 L46,128" fill="none" stroke="#1b2233" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M86,112 L56,104 L40,88 M92,130 L60,140 L46,128" fill="none" stroke="#dfe4ea" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M40,88 l-11,-4 M40,88 l-6,-11 M40,88 l2,-12 M46,128 l-12,-3 M46,128 l-7,-10 M46,128 l1,-12" stroke="#1b2233" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="72" cy="56" r="22" fill="#dfe4ea" stroke="#1b2233" stroke-width="5"/>
<path d="M80,36 L96,14 L88,44 Z" fill="#dfe4ea" stroke="#1b2233" stroke-width="4" stroke-linejoin="round"/>
<path d="M54,48 C40,46 30,54 28,68 C36,62 44,64 54,68 Z" fill="#e2b64a" stroke="#1b2233" stroke-width="4" stroke-linejoin="round"/>
<path d="M50,64 l-16,12" stroke="#b3142c" stroke-width="3" stroke-linecap="round"/>
<circle cx="66" cy="52" r="4" fill="#1b2233"/>
</svg>`;

const FEATHER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120">
<path d="M20,118 C10,96 4,60 8,30 C10,14 16,4 20,2 C24,4 30,14 32,30 C36,60 30,96 20,118 Z" fill="#ffffff"/>
<path d="M20,30 L10,40 M20,50 L8,62 M20,70 L10,84 M20,40 L31,50 M20,60 L32,72 M20,82 L30,94" stroke="#c4c4c4" stroke-width="1.5" fill="none"/>
<path d="M20,116 L20,8" stroke="#8a8a8a" stroke-width="2" fill="none"/>
</svg>`;

type Pt = (number | "sharp")[];

export default function build() {
  const b = createBuilder({ name: "knight", paintSize: 2048 });

  // ---------------- Paints
  const steel = weathered(STEEL_A, STEEL_B, STEEL_DENT, SCRATCH, 1);
  const brightSteel = weathered("#b3bcc5", "#dfe5ea", "#6a737d", "#ffffff", 12, { dents: 0.08, scratches: 0.7 });
  const goldP = weathered(GOLD, "#f0cd6a", GOLD_D, "#fff1c0", 3, { dents: 0.1, scratches: 0.5 });
  const blueCloth = weathered(BLUE_A, BLUE_B, "#0c1b3d", "#3a5aa0", 4, { size: 0.08, dents: 0.12, scratches: 0.4 });
  const mail = scales(["#6f7882", "#8f98a1"], "#2a3036", { size: 0.014 });

  const surcoat = paint((p, n) => {
    let c = blueCloth.at(p, n);
    c = mix(c, "#0a1430", smoothstep(1.1, 0.86, p.y) * 0.35);
    if (p.y > 1.415 || Math.abs(p.y - 0.895) < 0.012) c = mix(GOLD, GOLD_D, 0.35 * noise(p, 0.03, 2));
    return c;
  });

  const panelPaint = paint((p, n, s) => {
    const x = s[0];
    const y = s[1];
    const hw = 0.16 + 0.03 * Math.min(1, Math.max(0, -y / 0.38));
    if ((Math.abs(x) > hw - 0.022 && y > -0.37) || (y < -0.3 && y > -0.325))
      return mix(GOLD, GOLD_D, noise(p, 0.02, 8) * 0.6);
    return mix(blueCloth.at(p, n), "#0a1430", smoothstep(-0.2, -0.45, y) * 0.4);
  });

  const capePaint = paint((p) => {
    const fold = 0.5 + 0.5 * Math.sin(p.x * 30 + 3 * noise(p, 0.3, 4));
    let c = mix(CRIMSON_D, CRIMSON, 0.35 + 0.65 * fold);
    c = mix(c, "#2e1410", smoothstep(0.6, 0.1, p.y) * 0.55);
    const d = cells(p, 0.06, 17);
    if (d.id < 0.1) c = mix(c, "#3a070f", smoothstep(0.35, 0.1, d.d1) * 0.6);
    if (p.y > 1.39) c = mix(GOLD, GOLD_D, 0.4 * noise(p, 0.02, 5));
    return c;
  });

  const filigree = (cx: number, cy: number, cz: number, band: number | null) =>
    paint((p, n) => {
      const goldHere = mix(GOLD, GOLD_D, noise(p, 0.02, 2) * 0.7);
      if (band !== null && Math.abs(n.x) > 0.7) return goldHere;
      const dx = p.x - cx;
      if (band !== null && Math.abs(dx) > band) return goldHere;
      const a = Math.atan2(p.y - cy, p.z - cz);
      const w = Math.sin(a * 10 + 2.5 * Math.sin(dx * 90 + a * 4));
      const leaf = Math.sin(a * 20 + dx * 160);
      const line = smoothstep(0.17, 0.08, Math.abs(w));
      const dots = Math.abs(w) > 0.86 && leaf > 0.75 ? 1 : 0;
      return mix(steel.at(p, n), goldHere, Math.max(line, dots) * 0.95);
    });

  const shieldBase = weathered("#1f4192", "#2a54b0", "#0f2350", "#c9d3e6", 7, { dents: 0.25, size: 0.1 });
  const gouges = [
    [0.45, 1.62, 0.56, 1.49],
    [0.75, 0.98, 0.87, 1.13],
    [0.49, 1.16, 0.55, 1.05],
    [0.8, 1.6, 0.86, 1.52],
  ];
  const shieldPaint = paint((p, n) => {
    let c = shieldBase.at(p, n);
    for (const [x0, y0, x1, y1] of gouges) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const f = Math.min(1, Math.max(0, ((p.x - x0) * dx + (p.y - y0) * dy) / (dx * dx + dy * dy)));
      const d = Math.hypot(p.x - x0 - dx * f, p.y - y0 - dy * f);
      if (d < 0.0035) c = mix("#d8dde4", "#9aa4b0", f);
      else if (d < 0.008) c = mix(c, "#0a1228", 0.75);
    }
    return c;
  });

  const bladePaint = paint((p, n) => {
    let c = brightSteel.at(p, n);
    if (Math.abs(p.z) < 0.0045 && p.y < 1.27 && p.y > 0.7) c = mix(c, "#59626c", 0.7);
    return c;
  });

  const plumePaint = paint((p, n, s) => {
    const t = s[0];
    let c = mix(CRIMSON_D, CRIMSON, smoothstep(0, 0.35, t));
    c = mix(c, "#e0405a", smoothstep(0.65, 1, t) * 0.45);
    return mix(c, CRIMSON_D, smoothstep(0.55, 0.8, noise(p, 0.03, 6)) * 0.5);
  });

  const griffinTex = svg(GRIFFIN_SVG, { size: 512 });
  const featherTex = svg(FEATHER_SVG, { size: 128 });

  // ---------------- Skeleton
  b.joint("hips", { at: [0, 0.95, 0], dir: [0, 1, 0] });
  const spine = b.chain("spine", [[0, 0.98, 0], [0, 1.2, 0], [0, 1.42, 0]], {
    parent: "hips",
    names: ["spine", "chest"],
    role: "spine",
  });
  b.chain("neck", [[0, 1.44, 0], [0, 1.53, 0]], { parent: "chest", names: ["neck"], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.53, 0], dir: [0, 1, 0], role: "head" });
  b.joint("visor", { parent: "head", at: [0, 1.6, 0.06], dir: [0, 0, 1], role: "hinge" });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.chain(
      `arm${S}`,
      [[0.07 * s, 1.41, 0], [0.21 * s, 1.4, 0], [0.47 * s, 1.39, 0], [0.72 * s, 1.38, 0], [0.86 * s, 1.38, 0]],
      { parent: "chest", names: [`clavicle${S}`, `shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" },
    );
    b.chain(`leg${S}`, [[0.1 * s, 0.95, 0], [0.12 * s, 0.52, 0.02], [0.12 * s, 0.1, -0.01], [0.12 * s, 0.03, 0.17]], {
      parent: "hips",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`],
      role: "leg",
    });
  }

  const capeChain = b.chain("cape", [[0, 1.43, -0.16], [0, 0.92, -0.245], [0, 0.42, -0.33]], {
    parent: "chest",
    count: 3,
  });
  const plumeChain = b.chain(
    "plume",
    catmull([[0, 1.86, 0], [0, 2.0, -0.01], [0, 2.12, -0.1], [0, 2.16, -0.25], [0, 2.08, -0.4], [0, 1.94, -0.48]]),
    { parent: "head", count: 4 },
  );

  // ---------------- Torso: surcoat, gorget, belt, mail skirt, panels
  const torso = b.loft(
    [
      { at: [0, 0.86, 0], w: 0.33, h: 0.23 },
      { at: [0, 1.0, 0], w: 0.31, h: 0.22 },
      { at: [0, 1.18, 0.005], w: 0.37, h: 0.26 },
      { at: [0, 1.34, 0], w: 0.42, h: 0.27 },
      { at: [0, 1.46, 0], w: 0.28, h: 0.2 },
    ],
    { color: surcoat, bone: spine, sides: 10, caps: "flat", name: "surcoat" },
  );
  b.decal(torso, griffinTex, { at: [0, 1.22, 0.14], dir: [0, 0, 1], size: [0.22, 0.27], name: "chestGriffin" });

  b.part(new THREE.CylinderGeometry(0.1, 0.165, 0.09, 10), steel, { at: [0, 1.47, 0], bone: "neck", flat: true, name: "gorget" });
  b.part(new THREE.CylinderGeometry(0.15, 0.2, 0.04, 10), steel, { at: [0, 1.435, 0], bone: "chest", flat: true, name: "gorgetLame" });

  b.part(new THREE.TorusGeometry(0.175, 0.026, 4, 12), LEATHER, {
    at: [0, 0.965, 0],
    rotation: [90, 0, 0],
    scale: [1, 0.8, 1],
    bone: "hips",
    flat: true,
    name: "belt",
  });
  b.part(new THREE.BoxGeometry(0.055, 0.05, 0.02), goldP, { at: [0, 0.965, 0.165], bone: "hips", name: "buckle" });

  b.lathe([[0, 0.44], [0.14, 0.44], [0.17, 0.2], [0.19, 0], [0, 0]], {
    color: mail,
    at: [0, 0.58, 0],
    segments: 10,
    bone: "hips",
    name: "mailSkirt",
  });

  const panel: Pt[] = [
    [-0.16, 0.03], [0.16, 0.03], [0.19, -0.38], [0.17, -0.44], [0.12, -0.4], [0.08, -0.46], [0.03, -0.41],
    [-0.02, -0.45], [-0.07, -0.39], [-0.11, -0.44], [-0.15, -0.41], [-0.19, -0.38],
  ];
  b.extrude(panel, { color: panelPaint, at: [0, 0.97, 0.16], x: [1, 0, 0], y: [0, 1, -0.22], thickness: 0.014, bone: "hips", name: "tabardFront" });
  b.extrude(panel, { color: panelPaint, at: [0, 0.97, -0.15], x: [-1, 0, 0], y: [0, 1, 0.22], thickness: 0.014, bone: "hips", name: "tabardBack" });

  // Cape clasps and chain across the chest
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), goldP, { at: [0.14 * s, 1.37, 0.148], rotation: [90, 0, 0], bone: "chest", flat: true });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), "#b0102a", { at: [0.14 * s, 1.37, 0.157], bone: "chest", flat: true });
  }
  b.sweep(catmull([[0.14, 1.37, 0.152], [0, 1.325, 0.16], [-0.14, 1.37, 0.152]]), 0.006, { color: GOLD, sides: 5, bone: "chest", name: "claspChain" });

  // Empty scabbard on the left hip
  b.rod([0.21, 0.93, 0.03], [0.3, 0.32, -0.1], [0.028, 0.022], { color: LEATHER, bone: "hips", sides: 6, name: "scabbard" });
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.04, 6), goldP, { at: [0.215, 0.89, 0.022], dir: [0.09, -0.61, -0.13], bone: "hips", flat: true });
  b.part(new THREE.ConeGeometry(0.025, 0.07, 6), goldP, { at: [0.302, 0.3, -0.105], dir: [0.09, -0.61, -0.13], bone: "hips", flat: true });

  // ---------------- Limbs
  const arcOutline = (R: number, r: number): Pt[] => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = ((-35 + (250 * i) / 8) * Math.PI) / 180;
      pts.push([R * Math.cos(a), R * Math.sin(a)]);
    }
    for (let i = 8; i >= 0; i--) {
      const a = ((-35 + (250 * i) / 8) * Math.PI) / 180;
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    return pts;
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Pauldron: filigreed dome plus three layered lames
    b.part(new THREE.SphereGeometry(0.13, 10, 6), filigree(0.22 * s, 1.455, 0, null), {
      at: [0.22 * s, 1.455, 0],
      scale: [1, 0.72, 1.05],
      rotation: [0, 0, -15 * s],
      bone: `clavicle${S}`,
      flat: true,
      name: `pauldron${S}`,
    });
    for (let k = 0; k < 3; k++) {
      const x = (0.3 + 0.045 * k) * s;
      const y = 1.395 - 0.008 * k;
      const R = 0.1 - 0.009 * k;
      b.extrude(arcOutline(R, R - 0.016), {
        color: filigree(x, y, 0, 0.021),
        at: [x, y, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.058,
        bone: `shoulder${S}`,
        name: `pauldronLame${S}${k + 1}`,
      });
    }

    // Arm
    b.rod([0.21 * s, 1.4, 0], [0.47 * s, 1.39, 0], [0.055, 0.05], { color: steel, bone: `shoulder${S}`, sides: 8, name: `rerebrace${S}` });
    b.part(new THREE.SphereGeometry(0.058, 8, 6), steel, { at: [0.47 * s, 1.395, -0.02], bone: `elbow${S}`, flat: true, name: `couter${S}` });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), goldP, { at: [0.47 * s, 1.39, -0.07], rotation: [90, 0, 0], bone: `elbow${S}`, flat: true, name: `couterFan${S}` });
    b.rod([0.47 * s, 1.39, 0], [0.72 * s, 1.38, 0], [0.048, 0.042], { color: steel, bone: `elbow${S}`, sides: 8, name: `vambrace${S}` });
    b.part(new THREE.CylinderGeometry(0.045, 0.064, 0.09, 8), steel, { at: [0.735 * s, 1.38, 0], dir: [s, 0, 0], bone: `wrist${S}`, flat: true, name: `cuff${S}` });
    b.part(new THREE.BoxGeometry(0.1, 0.075, 0.09), steel, { at: [0.8 * s, 1.375, 0], bone: `wrist${S}`, name: `fist${S}` });
    b.part(new THREE.BoxGeometry(0.016, 0.02, 0.094), goldP, { at: [0.84 * s, 1.413, 0], bone: `wrist${S}`, name: `knuckles${S}` });
    b.part(new THREE.BoxGeometry(0.05, 0.03, 0.03), steel, { at: [0.78 * s, 1.39, 0.055], bone: `wrist${S}`, name: `thumb${S}` });

    // Leg
    b.rod([0.1 * s, 0.95, 0], [0.12 * s, 0.52, 0.02], [0.07, 0.062], { color: steel, bone: `hip${S}`, sides: 8, name: `cuisse${S}` });
    b.part(new THREE.SphereGeometry(0.065, 8, 6), steel, { at: [0.12 * s, 0.53, 0.04], bone: `knee${S}`, flat: true, name: `poleyn${S}` });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), goldP, { at: [0.18 * s, 0.53, 0.02], scale: [0.35, 1, 1], bone: `knee${S}`, flat: true, name: `kneeFan${S}` });
    b.rod([0.12 * s, 0.52, 0.02], [0.12 * s, 0.1, -0.01], [0.058, 0.048], { color: steel, bone: `knee${S}`, sides: 8, name: `greave${S}` });
    b.part(new THREE.BoxGeometry(0.014, 0.34, 0.014), steel, { at: [0.12 * s, 0.31, 0.062], rotation: [4, 0, 0], bone: `knee${S}`, name: `greaveRidge${S}` });
    b.part(new THREE.CylinderGeometry(0.055, 0.066, 0.05, 8), steel, { at: [0.12 * s, 0.12, -0.01], bone: `ankle${S}`, flat: true });
    b.part(new THREE.BoxGeometry(0.11, 0.08, 0.24), steel, { at: [0.12 * s, 0.045, 0.04], bone: `ankle${S}`, name: `sabaton${S}` });
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.06), steel, { at: [0.12 * s, 0.09, 0.09], bone: `ankle${S}` });
    b.part(new THREE.BoxGeometry(0.095, 0.03, 0.06), steel, { at: [0.12 * s, 0.07, 0.14], bone: `ankle${S}` });
    b.part(new THREE.BoxGeometry(0.085, 0.045, 0.07), steel, { at: [0.12 * s, 0.03, 0.19], bone: `toe${S}`, name: `toecap${S}` });
    b.part(new THREE.BoxGeometry(0.115, 0.012, 0.3), "#2a1a10", { at: [0.12 * s, 0.006, 0.06], bone: `ankle${S}`, name: `sole${S}` });

    // Tassets over the hips
    b.part(new THREE.BoxGeometry(0.035, 0.12, 0.17), steel, { at: [0.19 * s, 0.9, 0], rotation: [0, 0, 8 * s], bone: "hips", flat: true });
    b.part(new THREE.BoxGeometry(0.035, 0.12, 0.18), steel, { at: [0.205 * s, 0.8, 0], rotation: [0, 0, 12 * s], bone: "hips", flat: true });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), goldP, { at: [0.21 * s, 0.93, 0.05], bone: "hips", flat: true });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), goldP, { at: [0.21 * s, 0.93, -0.05], bone: "hips", flat: true });
  }

  // ---------------- Great helm
  b.part(new THREE.CylinderGeometry(0.118, 0.128, 0.3, 12), steel, { at: [0, 1.67, 0], bone: "head", flat: true, name: "helm" });
  b.part(new THREE.CylinderGeometry(0.035, 0.118, 0.045, 12), steel, { at: [0, 1.8425, 0], bone: "head", flat: true, name: "helmTop" });
  b.part(new THREE.CylinderGeometry(0.121, 0.122, 0.022, 12), goldP, { at: [0, 1.805, 0], bone: "head", flat: true, name: "helmCrown" });
  b.part(new THREE.CylinderGeometry(0.13, 0.131, 0.022, 12), goldP, { at: [0, 1.531, 0], bone: "head", flat: true, name: "helmRim" });
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.007, 5, 3), GOLD_D, { at: [0.133 * Math.sin(a), 1.531, 0.133 * Math.cos(a)], bone: "head" });
  }
  b.part(new THREE.BoxGeometry(0.026, 0.085, 0.02), goldP, { at: [0, 1.77, 0.118], bone: "head", name: "helmCrossTop" });
  b.part(new THREE.BoxGeometry(0.026, 0.12, 0.02), goldP, { at: [0, 1.63, 0.131], bone: "head", name: "helmCrossLow" });
  // Eye slit: a dark recess between two steel lips on the two front facets
  for (const s of [1, -1]) {
    const nrm = new THREE.Vector3(Math.sin((15 * Math.PI) / 180) * s, 0, Math.cos((15 * Math.PI) / 180));
    const at = (d: number, y: number) => [nrm.x * d, y, nrm.z * d];
    b.part(new THREE.BoxGeometry(0.06, 0.016, 0.006), DARK, { at: at(0.1185, 1.705), rotation: [0, 15 * s, 0], bone: "head", name: `eyeSlit${s > 0 ? "L" : "R"}` });
    b.part(new THREE.BoxGeometry(0.062, 0.011, 0.014), steel, { at: at(0.121, 1.7185), rotation: [0, 15 * s, 0], bone: "head" });
    b.part(new THREE.BoxGeometry(0.062, 0.011, 0.014), steel, { at: at(0.121, 1.6915), rotation: [0, 15 * s, 0], bone: "head" });
  }
  // Breath plate (hinged) with breathing holes on the wearer's right
  b.part(new THREE.CylinderGeometry(0.1315, 0.1335, 0.12, 4, 1, true, -Math.PI / 3, (2 * Math.PI) / 3), steel, {
    at: [0, 1.6, 0],
    bone: "visor",
    flat: true,
    name: "breathPlate",
  });
  for (const y of [1.57, 1.595, 1.62, 1.645])
    for (const deg of [-50, -40, -30, -20]) {
      if ((y === 1.57 || y === 1.645) && (deg === -50 || deg === -20)) continue;
      const a = (deg * Math.PI) / 180;
      b.part(new THREE.SphereGeometry(0.0055, 5, 3), DARK, { at: [0.1335 * Math.sin(a), y, 0.1335 * Math.cos(a)], bone: "visor" });
    }

  // ---------------- Plume
  b.part(new THREE.CylinderGeometry(0.02, 0.03, 0.05, 8), goldP, { at: [0, 1.875, 0], bone: "head", flat: true, name: "plumeHolder" });
  const plume = b.sweep(
    plumeChain,
    (t: number) => {
      const r = 0.018 + 0.045 * Math.sin(Math.PI * Math.min(1, Math.pow(t, 0.6)));
      return [r, r * 0.8] as const;
    },
    { color: plumePaint, sides: 7, name: "plume" },
  );
  const featherHits = b.surface(plume).scatter(80, { rng: rng(5), minDist: 0.016 });
  b.cards(featherHits, featherTex, {
    size: [0.045, 0.16],
    lean: 60,
    flow: [0, -0.4, -1],
    bend: 40,
    vary: 0.3,
    spin: 25,
    rng: rng(6),
    color: mottle("#c41d38", "#7d0b1d", { size: 0.05, seed: 3 }),
    name: "plumeFeathers",
  });

  // ---------------- Cape
  b.membrane([[0.2, 1.43, -0.16], [0.36, 0.42, -0.33]], [[-0.2, 1.43, -0.16], [-0.36, 0.42, -0.33]], {
    color: capePaint,
    thickness: 0.012,
    bone: capeChain,
    rows: 6,
    name: "cape",
  });
  const tatters: Pt[] = [
    [-0.36, 0.04], [0.36, 0.04], [0.37, -0.12], [0.33, -0.28], [0.29, -0.14], [0.24, -0.33], [0.19, -0.18],
    [0.15, -0.22], [0.11, -0.12], [0.07, -0.3], [0.02, -0.2], [-0.03, -0.34], [-0.08, -0.17], [-0.12, -0.26],
    [-0.17, -0.13], [-0.22, -0.31], [-0.27, -0.16], [-0.31, -0.24], [-0.37, -0.1],
  ];
  b.extrude(tatters, {
    color: capePaint,
    at: [0, 0.42, -0.33],
    x: [1, 0, 0],
    y: [0, 0.5, 0.085],
    thickness: 0.014,
    bone: "cape3",
    name: "capeTatters",
  });

  // ---------------- Kite shield on the left forearm
  const shieldBaseOutline: Pt[] = [
    [-0.29, 0.4], [-0.15, 0.45], [0, 0.47], [0.15, 0.45], [0.29, 0.4], [0.28, 0.12], [0.22, -0.15],
    [0.12, -0.36], [0, -0.55, "sharp"], [-0.12, -0.36], [-0.22, -0.15], [-0.28, 0.12],
  ];
  const goldOutline: Pt[] = [
    [-0.29, 0.4], [-0.15, 0.45], [0, 0.47], [0.15, 0.45],
    [0.19, 0.437, "sharp"], [0.205, 0.405, "sharp"], [0.225, 0.43, "sharp"],
    [0.29, 0.4], [0.28, 0.12], [0.22, -0.15], [0.12, -0.36], [0, -0.55, "sharp"],
    [-0.12, -0.36], [-0.22, -0.15], [-0.28, 0.12],
  ];
  const scaled = (pts: Pt[], k: number): Pt[] =>
    pts.map((p) => (p.length === 3 ? [(p[0] as number) * k, (p[1] as number) * k, "sharp"] : [(p[0] as number) * k, (p[1] as number) * k]));
  const SX = 0.66;
  const SY = 1.3;
  b.extrude(scaled(goldOutline, 1.06), {
    color: goldP,
    at: [SX, SY, 0.1],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.006,
    smoothing: 1,
    bone: "elbowL",
    name: "shieldRim",
  });
  const face = b.extrude(scaled(shieldBaseOutline, 0.92), {
    color: shieldPaint,
    at: [SX, SY, 0.118],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.008,
    smoothing: 1,
    bone: "elbowL",
    name: "shieldFace",
  });
  b.decal(face, griffinTex, { at: [SX, 1.34, 0.133], dir: [0, 0, 1], size: [0.42, 0.5], bone: "elbowL", name: "shieldGriffin" });
  // Rivets round the rim
  for (let i = 0; i < shieldBaseOutline.length; i++) {
    const a = shieldBaseOutline[i];
    const c = shieldBaseOutline[(i + 1) % shieldBaseOutline.length];
    for (const f of [0, 0.5]) {
      const x = ((a[0] as number) * (1 - f) + (c[0] as number) * f) * 0.99;
      const y = ((a[1] as number) * (1 - f) + (c[1] as number) * f) * 0.99;
      if (x > 0.15 && y > 0.38) continue;
      if (y < -0.5) continue;
      b.part(new THREE.SphereGeometry(0.01, 6, 4), "#b8862c", { at: [SX + x, SY + y, 0.117], bone: "elbowL", flat: true });
    }
  }
  // Enarmes (straps) from the forearm to the shield's back
  for (const x of [0.56, 0.68]) {
    b.part(new THREE.BoxGeometry(0.035, 0.03, 0.09), LEATHER, { at: [x, 1.385, 0.045], bone: "elbowL" });
  }

  // ---------------- Broadsword in the right fist, blade hanging down
  const SWX = -0.8;
  b.part(new THREE.SphereGeometry(0.03, 8, 6), goldP, { at: [SWX, 1.5, 0], bone: "wristR", flat: true, name: "pommel" });
  b.rod([SWX, 1.475, 0], [SWX, 1.325, 0], 0.016, { color: LEATHER, bone: "wristR", sides: 6, name: "grip" });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.27), goldP, { at: [SWX, 1.315, 0], bone: "wristR", name: "crossguard" });
  for (const z of [0.135, -0.135])
    b.part(new THREE.SphereGeometry(0.02, 6, 4), goldP, { at: [SWX, 1.315, z], bone: "wristR", flat: true });
  b.extrude(
    [
      [-0.028, 0], [0.028, 0], [0.026, -0.3], [0.021, -0.31, "sharp"], [0.025, -0.33], [0.023, -0.66], [0.012, -0.8],
      [0, -0.88, "sharp"], [-0.012, -0.8], [-0.022, -0.6], [-0.024, -0.45], [-0.018, -0.465, "sharp"], [-0.023, -0.48],
    ],
    {
      color: bladePaint,
      at: [SWX, 1.3, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.004, 0.014],
      bone: "wristR",
      name: "blade",
    },
  );

  return b.root;
}
