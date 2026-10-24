import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Poseidon's Trident (black-figure)",
  description:
    "A tall three-tined trident dressed as an Attic black-figure vase: terracotta clay, glossy black slip, " +
    "incised lines, added purple-red and white. It carries a Greek-key band, a dolphin frieze, a tondo of three " +
    "dolphins round a rosette, a wave-and-fish boss, a ΠΟΣΕΙΔΩΝ inscription, flat dolphins and palmettes, and votive fillets.",
};

type Outline = ([number, number] | [number, number, "sharp"])[];
const O = (pts: [number, number][]): Outline => pts;

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------- palette
const CLAY = "#d97a35";
const CLAY_L = "#e8924a";
const CLAY_D = "#bd5c27";
const BLACK = "#17110f";
const RED = "#9a2f3c";
const WHITE = "#f1e7d0";

// clay body: warm, mottled, a little fired-dark in patches, lighter on top
const clayPaint = paint((p, n) => {
  let c = mix(CLAY_D, CLAY_L, 0.25 + 0.6 * noise(p, 0.11, 3));
  c = mix(c, "#f4a867", 0.28 * smoothstep(0.35, 1, n.y));
  c = mix(c, "#8f3d1c", 0.35 * smoothstep(0.62, 0.8, noise(p, 0.02, 11)));
  return c;
});

// glossy black slip with a brown fired sheen on upward faces
const blackPaint = paint((p, n) => {
  let c = mix("#120c0b", "#2b1e19", noise(p, 0.06, 5));
  c = mix(c, "#5a4238", 0.5 * smoothstep(0.6, 1, n.y) * (0.5 + noise(p, 0.03, 8)));
  return c;
});
type Fill = string | typeof blackPaint;

// ---------------------------------------------------------------- layout (meters, y up)
const SH = 1.3; // shaft top
const FY = SH + 0.02; // frieze drum base
const TY = FY + 0.14; // tongue band base
const LY = TY + 0.035; // lip base
const NY = LY + 0.02; // neck base
const DY = NY + 0.22; // tondo centre

// ---------------------------------------------------------------- shapes
const DOLPHIN: [number, number][] = [
  [100, 24], [92, 28], [85, 34], [74, 38], [60, 41], [48, 41], [42, 42], [34, 55], [31, 41], [20, 36],
  [12, 32], [6, 36], [0, 46], [6, 30], [0, 16], [12, 24], [24, 18], [36, 13], [50, 11], [60, 10],
  [56, -2], [72, 10], [84, 13], [92, 17], [98, 20],
];
const DPTS = DOLPHIN.map(([x, y]) => `${x},${y}`).join(" ");

function headOutline(k: number): Outline {
  const P: [number, number][] = [
    [0, 0.14], [-0.028, 0.07], [-0.052, -0.01], [-0.018, 0.02], [-0.01, -0.03],
    [0.01, -0.03], [0.018, 0.02], [0.052, -0.01], [0.028, 0.07],
  ];
  return P.map(([x, y]) => [x * k, y * k, "sharp"] as [number, number, "sharp"]);
}

function leafOutline(len: number, w: number): Outline {
  return [
    [0, -0.004], [w * 0.65, len * 0.22], [w, len * 0.55], [0, len, "sharp"], [-w, len * 0.55], [-w * 0.65, len * 0.22],
  ];
}

function palmetteOutline(R: number, tilt: number): Outline {
  const polar = (r: number, a: number): [number, number] => [r * Math.cos(a * DEG), r * Math.sin(a * DEG)];
  const pts: [number, number][] = [[0, 0], polar(0.42 * R, 0)];
  for (let k = 0; k < 5; k++) {
    pts.push(polar(R, 18 + 36 * k));
    if (k < 4) pts.push(polar(0.55 * R, 36 + 36 * k));
  }
  pts.push(polar(0.42 * R, 180));
  const th = -tilt * DEG;
  const c = Math.cos(th);
  const s = Math.sin(th);
  return pts.map(([x, y]) => [x * c - y * s, x * s + y * c, "sharp"] as [number, number, "sharp"]);
}

// ---------------------------------------------------------------- paints by place
const shaftPaint = paint((p, _n, s) => {
  const y = p.y;
  const turn = s[1] / 360;
  if (y < 0.105) {
    for (const r of [0.03, 0.058, 0.085]) if (Math.abs(y - r) < 0.0022) return clayPaint;
    return blackPaint;
  }
  if (y >= 0.675 && y < 0.935) {
    // grip: black with incised diamond hatching
    if (fract(turn * 8 + y / 0.04) < 0.1 || fract(turn * 8 - y / 0.04) < 0.1) return clayPaint;
    return blackPaint;
  }
  const bands: [number, number][] = [
    [0.105, 0.12], [0.18, 0.195], [0.585, 0.6], [0.66, 0.675], [0.935, 0.95], [1.07, 1.085], [1.205, 1.22], [1.28, 1.3],
  ];
  for (const [a, c] of bands)
    if (y >= a && y < c) return c - a > 0.012 && Math.abs(y - (a + c) / 2) < 0.0012 ? clayPaint : blackPaint;
  if (y >= 0.195 && y < 0.585) {
    const u = fract(turn * 2 - y / 0.35);
    if (u < 0.1) return Math.abs(u - 0.05) < 0.009 ? clayPaint : blackPaint;
    return clayPaint;
  }
  if (y >= 1.085 && y < 1.205) {
    // vertical fluting lines
    if (fract(turn * 12) < 0.07) return blackPaint;
    return clayPaint;
  }
  return clayPaint;
});

const neckPaint = paint((p) => {
  const dy = p.y - NY;
  for (const r of [0.034, 0.05, 0.125, 0.14]) if (Math.abs(dy - r) < 0.0012) return clayPaint;
  if (dy > 0.08 && dy < 0.1) return RED;
  return blackPaint;
});

function tinePaint(L: number) {
  return paint((_p, _n, s) => {
    const d = s[0] * L;
    const dd = Math.min(d, L - d);
    for (const [a, c] of [[0.04, 0.0425], [0.05, 0.0525], [0.075, 0.0775]]) if (dd >= a && dd < c) return clayPaint;
    if (dd >= 0.062 && dd < 0.07) return RED;
    if (dd >= 0.12 && dd < 0.15 && fract(dd / 0.006) < 0.3) return clayPaint;
    return blackPaint;
  });
}

const centralPaint = paint((p) => {
  const h = p.y - (DY + 0.02);
  const rings: [number, number, number][] = [
    [0.06, 0.0625, 0], [0.07, 0.0725, 0], [0.08, 0.1, 1], [0.105, 0.1075, 0], [0.115, 0.1175, 0], [0.26, 0.2625, 0],
  ];
  for (const [a, c, kind] of rings) if (h >= a && h < c) return kind ? RED : clayPaint;
  return blackPaint;
});

const headPaint = (k: number) =>
  paint((_p, _n, s) => {
    const u = s[0] / k;
    const v = s[1] / k;
    if (Math.abs(u) < 0.0017 && v > 0.005 && v < 0.115) return clayPaint;
    const q = 0.14 - v - 2.5 * Math.abs(u);
    if (v > 0.045 && (Math.abs(q - 0.016) < 0.0014 || Math.abs(q - 0.032) < 0.0014)) return clayPaint;
    return blackPaint;
  });

const palmettePaint = (R: number, tilt: number) =>
  paint((_p, _n, s) => {
    const rr = Math.hypot(s[0], s[1]);
    const a = Math.atan2(s[1], s[0]) / DEG + tilt;
    if (rr < 0.44 * R) return Math.abs(rr - 0.3 * R) < 0.0013 ? clayPaint : blackPaint;
    for (let k = 0; k < 5; k++) {
      const dist = Math.abs(a - (18 + 36 * k)) * DEG * rr;
      if (dist < 0.0013 && rr > 0.5 * R && rr < 0.92 * R) return clayPaint;
      if (k === 2 && dist < 0.0065 && rr > 0.5 * R) return RED;
    }
    return blackPaint;
  });

const dolphinPaint = (k: number) =>
  paint((_p, _n, s) => {
    const u = s[0] / k + 14;
    const v = s[1] / k + 28;
    const e = Math.hypot(u - 87, v - 27);
    if (e < 2.2) return WHITE;
    if (e < 3.4) return clayPaint;
    if (v > 33 && v < 36 && u > 26 && u < 66) return RED;
    if (u > 36 && u < 80 && Math.abs(v - 16) < 1.3 && fract(u / 8) < 0.5) return WHITE;
    if (v > 21 && v < 33 && ((u > 68 && u < 70.2) || (u > 73 && u < 75.2) || (u > 78 && u < 80))) return clayPaint;
    if (u > 16 && u < 58 && Math.abs(v - (30 + (u - 16) * 0.12)) < 0.9 && fract(u / 6) < 0.5) return clayPaint;
    return blackPaint;
  });

const leafPaint = paint((_p, _n, s) => (Math.abs(s[0]) < 0.0011 && s[1] > 0.008 ? blackPaint : RED));

const ribbonPaint = paint((_p, _n, s) => (fract(s[0] * 9) < 0.12 ? WHITE : RED));

// ---------------------------------------------------------------- textures (SVG drawings)
const dolphinSvg = (cx: number, cy: number, sc: number, rot: number) => `
<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sc} ${-sc}) translate(-50 -25)">
  <polygon points="${DPTS}" fill="${BLACK}" stroke="${BLACK}" stroke-width="1" stroke-linejoin="round"/>
  <path d="M32 18 Q56 12 82 18" stroke="${WHITE}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path d="M26 33 Q48 38 66 36" stroke="${RED}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M68 21 L70 33 M73 21 L75 32 M78 22 L79 31" stroke="${CLAY}" stroke-width="1.3" fill="none"/>
  <path d="M16 30 L58 35" stroke="${CLAY}" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/>
  <path d="M38 50 L34 43 M6 34 L1 42 M6 26 L2 18 M60 8 L58 2" stroke="${CLAY}" stroke-width="1.2" fill="none"/>
  <circle cx="87" cy="27" r="3.4" fill="${CLAY}"/><circle cx="87" cy="27" r="2.2" fill="${WHITE}"/>
  <circle cx="87.5" cy="27" r="1" fill="${BLACK}"/>
</g>`;

function friezeSvg() {
  let waves = "M0 126 q5 -8 10 0";
  for (let i = 0; i < 39; i++) waves += " t10 0";
  const rosette = (x: number, y: number) =>
    `<circle cx="${x}" cy="${y}" r="6.5" fill="${BLACK}"/><circle cx="${x}" cy="${y}" r="2.4" fill="${CLAY}"/>` +
    `<path d="M${x - 11} ${y} h3 M${x + 8} ${y} h3 M${x} ${y - 11} v3 M${x} ${y + 8} v3" stroke="${BLACK}" stroke-width="2.4"/>` +
    `<circle cx="${x}" cy="${y - 22}" r="2.2" fill="${BLACK}"/><circle cx="${x}" cy="${y + 22}" r="2.2" fill="${BLACK}"/>`;
  const rots = [-14, 8, -14];
  const dolphins = [67, 200, 333].map((x, i) => dolphinSvg(x, 68 + (i === 1 ? 0 : -3), 1.05, rots[i])).join("");
  const dots = [0, 133, 267, 400].map((x) => rosette(x, 68)).join("");
  const bubbles = [96, 229, 362]
    .map((x) => `<circle cx="${x}" cy="48" r="2.4" fill="${WHITE}"/><circle cx="${x + 6}" cy="40" r="1.6" fill="${WHITE}"/>`)
    .join("");
  return svg(
    `<svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="150" fill="${CLAY}"/>
      <rect width="400" height="11" fill="${BLACK}"/><rect y="15" width="400" height="2.6" fill="${BLACK}"/>
      <rect y="139" width="400" height="11" fill="${BLACK}"/>
      <path d="${waves}" stroke="${BLACK}" stroke-width="3.6" fill="none"/>
      ${dots}${dolphins}${bubbles}
    </svg>`,
    { size: 640 },
  );
}

function tondoSvg() {
  const C = 200;
  let tongues = "";
  for (let i = 0; i < 24; i++) {
    const a0 = (i - 0.5) * (TAU / 24);
    const a1 = (i + 0.5) * (TAU / 24);
    const am = i * (TAU / 24);
    const pt = (r: number, a: number) => `${(C + r * Math.sin(a)).toFixed(1)} ${(C - r * Math.cos(a)).toFixed(1)}`;
    tongues += `<path d="M${pt(170, a0)} L${pt(170, a1)} L${pt(142, am)}Z" fill="${i % 2 ? RED : BLACK}"/>`;
  }
  let dots = "";
  for (let i = 0; i < 24; i++) {
    const a = i * (TAU / 24) + TAU / 48;
    dots += `<circle cx="${(C + 188 * Math.sin(a)).toFixed(1)}" cy="${(C - 188 * Math.cos(a)).toFixed(1)}" r="3.6" fill="${WHITE}"/>`;
  }
  let dolphins = "";
  for (const a of [0, 120, 240])
    dolphins += `<g transform="translate(${C} ${C}) rotate(${a}) translate(0 -88) scale(0.95 -0.95) translate(-50 -25)">${
      dolphinSvg(50, 25, 1, 0).replace(/^\s*<g transform="[^"]*">/, "").replace(/<\/g>\s*$/, "")
    }</g>`;
  let petals = "";
  for (let i = 0; i < 8; i++)
    petals += `<ellipse cx="${C}" cy="${C - 20}" rx="6.5" ry="13" fill="${WHITE}" stroke="${BLACK}" stroke-width="1.5" transform="rotate(${i * 45} ${C} ${C})"/>`;
  return svg(
    `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="200" fill="${CLAY}"/>
      <circle cx="200" cy="200" r="188" fill="none" stroke="${BLACK}" stroke-width="22"/>
      <circle cx="200" cy="200" r="190" fill="none" stroke="${CLAY}" stroke-width="1.8"/>
      ${dots}${tongues}
      <circle cx="200" cy="200" r="138" fill="none" stroke="${BLACK}" stroke-width="4"/>
      ${dolphins}
      <circle cx="200" cy="200" r="34" fill="${BLACK}"/>${petals}
      <circle cx="200" cy="200" r="11" fill="${RED}"/><circle cx="200" cy="200" r="4" fill="${CLAY}"/>
    </svg>`,
    { size: 512 },
  );
}

function meanderSvg() {
  const unit = 74;
  const c = unit / 6;
  const y0 = 30;
  let d = "";
  for (let i = 0; i < 4; i++) {
    const P = (cx: number, cy: number) => `${(i * unit + cx * c).toFixed(1)} ${(y0 + cy * c).toFixed(1)}`;
    d += `M${P(0.6, 5)} L${P(0.6, 1.2)} L${P(3.2, 1.2)} L${P(3.2, 3.4)} L${P(1.8, 3.4)} `;
    d += `M${P(3.6, 0)} L${P(3.6, 3.8)} L${P(5.8, 3.8)} L${P(5.8, 1.6)} L${P(4.6, 1.6)} `;
  }
  return svg(
    `<svg viewBox="0 0 296 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="296" height="120" fill="${CLAY}"/>
      <rect y="2" width="296" height="11" fill="${BLACK}"/><rect y="107" width="296" height="11" fill="${BLACK}"/>
      <path d="M0 ${y0} H296 M0 ${y0 + 5 * c} H296" stroke="${BLACK}" stroke-width="6" fill="none"/>
      <path d="${d}" stroke="${BLACK}" stroke-width="6" fill="none" stroke-linejoin="miter"/>
      <path d="M0 18.5 H296 M0 101.5 H296" stroke="${BLACK}" stroke-width="2.4"/>
    </svg>`,
    { size: 512 },
  );
}

function wavesSvg() {
  let g = "";
  for (let i = 0; i < 4; i++) {
    const flip = i % 2 ? `translate(62 0) scale(-1 1)` : "";
    g += `<g transform="translate(${i * 62.5} 0)">
      <path d="M2 100 C10 100 14 72 30 64 C44 58 56 66 52 78 C49 86 39 85 39 77" stroke="${BLACK}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M2 108 C16 104 40 104 60 108" stroke="${BLACK}" stroke-width="3" fill="none"/>
      <g transform="translate(31 38) ${i % 2 ? "scale(-1 1)" : ""}">
        <ellipse rx="14" ry="6" fill="${BLACK}"/><path d="M-12 0 L-22 -7 L-22 7Z" fill="${BLACK}"/>
        <path d="M-1 -6 L3 -12 L8 -6Z" fill="${BLACK}"/>
        <path d="M-6 -3.5 L-6 3.5 M-2 -4 L-2 4 M2 -4 L2 4" stroke="${CLAY}" stroke-width="1.1"/>
        <circle cx="8" cy="-1" r="2" fill="${CLAY}"/><circle cx="8" cy="-1" r="1" fill="${BLACK}"/>
        <path d="M-8 3.5 Q0 6 10 2" stroke="${WHITE}" stroke-width="1.6" fill="none"/>
      </g>
      <circle cx="9" cy="58" r="2" fill="${BLACK}"/><circle cx="58" cy="46" r="2" fill="${BLACK}"/>
      <circle cx="${flip ? 6 : 6}" cy="30" r="1.6" fill="${WHITE}"/>
    </g>`;
  }
  return svg(
    `<svg viewBox="0 0 250 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="250" height="120" fill="${CLAY}"/>
      <rect width="250" height="9" fill="${BLACK}"/><rect y="111" width="250" height="9" fill="${BLACK}"/>
      <path d="M0 14 H250 M0 106 H250" stroke="${BLACK}" stroke-width="1.8"/>
      ${g}
    </svg>`,
    { size: 512 },
  );
}

function tonguesSvg() {
  let t = "";
  for (let i = 0; i < 20; i++)
    t += `<path d="M${i * 18 + 1} 6 h16 v16 a8 8 0 0 1 -16 0 z" fill="${i % 2 ? RED : BLACK}"/>
          <path d="M${i * 18 + 9} 9 v13" stroke="${CLAY}" stroke-width="1.2"/>`;
  return svg(
    `<svg viewBox="0 0 360 36" xmlns="http://www.w3.org/2000/svg">
      <rect width="360" height="36" fill="${CLAY}"/><rect width="360" height="5" fill="${BLACK}"/>${t}
    </svg>`,
    { size: 720 },
  );
}

function inscriptionSvg() {
  const letters = [
    `<path d="M2 44 V2 H24 V44"/>`,
    `<ellipse cx="13" cy="23" rx="11.5" ry="20.5"/>`,
    `<path d="M24 2 H3 L16 23 L3 44 H24"/>`,
    `<path d="M24 2 H3 V44 H24 M3 23 H18"/>`,
    `<path d="M13 2 V44"/>`,
    `<path d="M13 2 L2 44 H24 Z"/>`,
    `<path d="M2 44 H9 C-2 36 0 4 13 4 C26 4 28 36 17 44 H24"/>`,
    `<path d="M3 44 V2 L23 44 V2"/>`,
  ];
  const text = letters.map((l, i) => `<g transform="translate(${16 + 34 * i} 38)">${l}</g>`).join("");
  return svg(
    `<svg viewBox="0 0 296 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="296" height="120" fill="${CLAY}"/>
      <rect y="2" width="296" height="9" fill="${BLACK}"/><rect y="109" width="296" height="9" fill="${BLACK}"/>
      <g fill="none" stroke="${BLACK}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">${text}</g>
      <circle cx="6" cy="60" r="4" fill="${BLACK}"/><circle cx="290" cy="60" r="4" fill="${BLACK}"/>
      <circle cx="8" cy="30" r="2.4" fill="${RED}"/><circle cx="288" cy="90" r="2.4" fill="${RED}"/>
    </svg>`,
    { size: 512 },
  );
}

// ================================================================= build
export default function build() {
  const b = createBuilder({ name: "poseidon_trident", paintSize: 2048 });

  const MEANDER = meanderSvg();
  const INSCRIPTION = inscriptionSvg();
  const FRIEZE = friezeSvg();
  const TONDO = tondoSvg();
  const WAVES = wavesSvg();
  const TONGUES = tonguesSvg();

  // ---- small helpers
  const sph = (r: number) => new THREE.SphereGeometry(r, 6, 4);
  const ringAt = (y: number, r: number, tube: number, color: Fill) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 16), color, { at: [0, y, 0], dir: [0, 1, 0], axis: "z" });
  const beadRing = (y: number, r: number, n: number, rad: number, color: Fill, phase = 0) => {
    for (let i = 0; i < n; i++) {
      const a = phase + (i / n) * TAU;
      b.part(sph(rad), color, { at: [Math.sin(a) * r, y, Math.cos(a) * r] });
    }
  };
  const band = (tex: ReturnType<typeof svg>, y0: number, y1: number, rBot: number, rTop: number, seg = 12) =>
    b.part(new THREE.CylinderGeometry(rTop, rBot, y1 - y0, seg, 1, true), "#ffffff", {
      at: [0, (y0 + y1) / 2, 0],
      rotation: [0, 180, 0],
      texture: tex,
      flat: true,
    });

  // ---- shaft (turned lathe, butt cap flaring from a flat foot)
  b.lathe(
    O([[0, 0], [0.019, 0], [0.027, 0.012], [0.031, 0.05], [0.028, 0.09], [0.0225, 0.105], [0.0225, SH], [0, SH]]),
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 10, color: shaftPaint },
  );

  // painted bands: Greek key, inscription
  band(MEANDER, 0.12, 0.18, 0.0245, 0.0245);
  band(INSCRIPTION, 0.6, 0.66, 0.0245, 0.0245);
  band(MEANDER, 1.22, 1.28, 0.0245, 0.0245);

  // wave-and-fish boss
  const bossPts = [[0.0235, 0], [0.034, 0.018], [0.0405, 0.06], [0.034, 0.102], [0.0235, 0.12]].map(
    ([x, y]) => new THREE.Vector2(x, y),
  );
  b.part(new THREE.LatheGeometry(bossPts, 12), "#ffffff", {
    at: [0, 0.95, 0],
    rotation: [0, 180, 0],
    texture: WAVES,
    flat: true,
  });
  ringAt(0.952, 0.0262, 0.0032, RED);
  ringAt(1.068, 0.0262, 0.0032, RED);
  beadRing(0.953, 0.0285, 12, 0.0036, WHITE);
  beadRing(1.067, 0.0285, 12, 0.0036, WHITE, 0.26);

  // incised-looking rings on the shaft
  const shaftRings: [number, Fill, number][] = [
    [0.104, RED, 0.0028], [0.196, RED, 0.0028], [0.4, blackPaint, 0.0034], [0.586, RED, 0.0028],
    [0.676, RED, 0.0028], [0.936, RED, 0.0028], [1.086, RED, 0.0028], [1.206, RED, 0.0028], [1.296, RED, 0.0030],
  ];
  for (const [y, c, t] of shaftRings) ringAt(y, 0.0236, t, c);
  beadRing(0.69, 0.0238, 12, 0.0042, WHITE);
  beadRing(0.92, 0.0238, 12, 0.0042, WHITE, 0.26);
  beadRing(0.5, 0.0238, 12, 0.0036, WHITE, 0.13);
  beadRing(0.085, 0.0295, 8, 0.0045, WHITE);

  // ---- collar: foot ring, dolphin frieze drum, tongues, lip
  b.lathe(O([[0, 0], [0.04, 0], [0.046, 0.008], [0.046, 0.016], [0.036, 0.022], [0, 0.022]]), {
    at: [0, SH - 0.003, 0],
    axis: [0, 1, 0],
    segments: 14,
    color: blackPaint,
  });
  beadRing(SH + 0.006, 0.0465, 14, 0.0035, WHITE);
  const friezePts = [[0.035, 0], [0.056, 0.03], [0.063, 0.07], [0.058, 0.11], [0.046, 0.14]].map(
    ([x, y]) => new THREE.Vector2(x, y),
  );
  b.part(new THREE.LatheGeometry(friezePts, 14), "#ffffff", {
    at: [0, FY, 0],
    rotation: [0, 180, 0],
    texture: FRIEZE,
    flat: true,
  });
  band(TONGUES, TY, TY + 0.035, 0.048, 0.054, 14);
  b.lathe(O([[0, 0], [0.056, 0], [0.058, 0.008], [0.052, 0.02], [0, 0.02]]), {
    at: [0, LY, 0],
    axis: [0, 1, 0],
    segments: 14,
    color: blackPaint,
  });
  ringAt(LY + 0.004, 0.0585, 0.0034, RED);
  beadRing(LY + 0.012, 0.0575, 14, 0.0042, RED, 0.2);

  // ---- neck
  b.lathe(
    O([[0, 0], [0.032, 0], [0.024, 0.03], [0.021, 0.07], [0.021, 0.12], [0.026, 0.16], [0.034, 0.19], [0, 0.19]]),
    { at: [0, NY, 0], axis: [0, 1, 0], segments: 10, color: neckPaint },
  );
  ringAt(NY + 0.088, 0.0225, 0.0033, WHITE);

  // palmette fans front and back of the neck
  for (const zs of [1, -1])
    b.extrude(palmetteOutline(0.075, 0), {
      at: [0, NY + 0.01, zs * 0.027],
      x: [zs, 0, 0],
      thickness: 0.01,
      bevel: 0.002,
      color: palmettePaint(0.075, 0),
    });

  // flat leaping dolphins flanking the neck
  const K = 0.0021;
  const dolphinOutline: Outline = DOLPHIN.map(
    ([x, y], i) =>
      ([(x - 14) * K, (y - 28) * K, [7, 12, 14, 20, 12].includes(i) ? "sharp" : undefined] as unknown) as [number, number],
  ).map(([x, y]) => [x, y] as [number, number]);
  for (const s of [1, -1]) {
    const phi = 50 * DEG;
    b.extrude(dolphinOutline, {
      at: [s * 0.04, NY + 0.07, 0],
      x: [s * Math.cos(phi), Math.sin(phi), 0],
      y: [-s * Math.sin(phi), Math.cos(phi), 0],
      thickness: 0.016,
      bevel: 0.003,
      color: dolphinPaint(K),
    });
  }

  // ---- tondo: black disc with a three-dolphin medallion on both faces
  b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.058, 18), blackPaint, {
    at: [0, DY, 0],
    dir: [0, 0, 1],
    flat: true,
  });
  for (const zs of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.057, 24), "#ffffff", {
      at: [0, DY, zs * 0.0305],
      dir: [0, 0, zs],
      axis: "z",
      texture: TONDO,
    });
    b.part(new THREE.TorusGeometry(0.0615, 0.0042, 5, 24), RED, { at: [0, DY, zs * 0.029], dir: [0, 0, 1], axis: "z" });
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    b.part(sph(0.0042), WHITE, { at: [Math.sin(a) * 0.0645, DY + Math.cos(a) * 0.0645, 0] });
  }

  // ---- the fork: one U-shaped sweep through the disc, side tines rising
  const upts: [number, number][] = [
    [-0.168, 0.3], [-0.173, 0.22], [-0.155, 0.135], [-0.105, 0.07], [-0.05, 0.02], [0, 0],
    [0.05, 0.02], [0.105, 0.07], [0.155, 0.135], [0.173, 0.22], [0.168, 0.3],
  ];
  const U = catmull(upts.map(([x, y]) => [x, DY + y, 0] as [number, number, number]));
  const L = U.length;
  const uRadius = (t: number) => 0.0125 + 0.0095 * Math.sin(Math.PI * t);
  b.sweep(U, uRadius, { color: tinePaint(L), sides: 8 });

  // white added-colour beads on the front of the arms
  for (const dd of [0.1, 0.145, 0.19, 0.235, 0.28]) {
    for (const t of [dd / L, 1 - dd / L]) {
      const p = U.at(t);
      b.part(sph(0.0037), WHITE, { at: [p.x, p.y, p.z + uRadius(t) * 0.93] });
    }
  }

  // central tine
  const cBase = DY + 0.02;
  const cTop = DY + 0.375;
  b.sweep([[0, cBase, 0], [0, cTop, 0]], [0.021, 0.0125], { color: centralPaint, sides: 8 });
  for (let y = DY + 0.15; y < DY + 0.34; y += 0.045) {
    const r = 0.021 + (0.0125 - 0.021) * ((y - cBase) / (cTop - cBase));
    b.part(sph(0.0036), WHITE, { at: [0, y, r * 0.93] });
  }

  // spear heads with collars
  const spearHead = (base: THREE.Vector3, dirIn: THREE.Vector3, k: number) => {
    const d = dirIn.clone().normalize();
    b.extrude(headOutline(k), {
      at: base,
      x: new THREE.Vector3(d.y, -d.x, 0),
      y: new THREE.Vector3(d.x, d.y, 0),
      thickness: 0.011 + 0.004 * k,
      bevel: 0.0022,
      color: headPaint(k),
    });
    b.lathe(O([[0, 0], [0.0145, 0], [0.0215, 0.012], [0.017, 0.028], [0.0125, 0.036], [0, 0.036]]), {
      at: base.clone().addScaledVector(d, -0.024),
      axis: d,
      segments: 10,
      color: RED,
    });
    b.part(new THREE.TorusGeometry(0.0135, 0.0032, 5, 12), blackPaint, {
      at: base.clone().addScaledVector(d, 0.014),
      dir: d,
      axis: "z",
    });
  };
  spearHead(U.at(0).clone(), U.tangentAt(0).clone().negate(), 1);
  spearHead(U.at(1).clone(), U.tangentAt(1).clone(), 1);
  spearHead(new THREE.Vector3(0, cTop, 0), new THREE.Vector3(0, 1, 0), 1.35);

  // leaf spurs on the arms and the central tine
  for (const s of [1, -1]) {
    const arm = (dd: number, outward: number, len: number) => {
      const t = s > 0 ? 1 - dd / L : dd / L;
      const p = U.at(t);
      const d = new THREE.Vector3(s * outward, Math.sqrt(1 - outward * outward), 0);
      b.extrude(leafOutline(len, len * 0.2), {
        at: [p.x + s * outward * 0.01, p.y, p.z],
        x: new THREE.Vector3(d.y, -d.x, 0),
        y: d,
        thickness: 0.006,
        bevel: 0.0012,
        color: leafPaint,
      });
    };
    arm(0.15, 0.75, 0.07);
    arm(0.22, -0.7, 0.06);
    const d = new THREE.Vector3(s * 0.57, 0.82, 0);
    b.extrude(leafOutline(0.075, 0.016), {
      at: [s * 0.011, DY + 0.2, 0],
      x: new THREE.Vector3(d.y, -d.x, 0),
      y: d,
      thickness: 0.006,
      bevel: 0.0012,
      color: leafPaint,
    });
  }

  // ---- votive fillets (red woollen ribbons) tied below the fork
  b.part(new THREE.TorusGeometry(0.0245, 0.0045, 5, 14), RED, { at: [0, NY + 0.055, 0], dir: [0, 1, 0], axis: "z" });
  for (const s of [1, -1]) {
    const ribbons: [number, number, number][][] = [
      [
        [s * 0.026, NY + 0.055, 0.016], [s * 0.064, NY + 0.016, 0.032], [s * 0.084, TY - 0.01, 0.04],
        [s * 0.096, TY - 0.12, 0.05], [s * 0.084, TY - 0.23, 0.058],
      ],
      [
        [s * 0.026, NY + 0.05, -0.016], [s * 0.06, NY + 0.012, -0.034], [s * 0.078, TY - 0.02, -0.042],
        [s * 0.09, TY - 0.1, -0.05], [s * 0.08, TY - 0.18, -0.056],
      ],
    ];
    for (const pts of ribbons) {
      b.sweep(catmull(pts), (t) => [0.0135 - 0.002 * t, 0.0016], {
        section: "box",
        caps: "flat",
        color: ribbonPaint,
        twist: 35 * s,
      });
      b.part(sph(0.0075), RED, { at: pts[0] });
      const E = pts[pts.length - 1];
      b.part(sph(0.0065), WHITE, { at: [E[0], E[1] - 0.004, E[2]] });
      b.spike([E[0], E[1] - 0.006, E[2]], [0, -1, 0], 0.05, 0.011, { color: RED });
      for (const j of [-1, 0, 1])
        b.spike([E[0] + j * 0.005, E[1] - 0.012, E[2]], [j * 0.25, -1, 0], 0.06, 0.0028, { color: WHITE });
    }
  }

  return b.root;
}
