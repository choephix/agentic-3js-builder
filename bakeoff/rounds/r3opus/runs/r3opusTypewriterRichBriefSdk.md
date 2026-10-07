```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "A 1930s portable typewriter in glossy racing green: chrome-rimmed round keys with cream letters in four staggered rows, a semicircular basket of type bars, black platen with a half-typed sheet, chrome carriage return lever and a brass maker's badge.",
};

// ---------- palette ----------
const GREEN = "#0f4a2a";
const GREEN_DEEP = "#082717";
const CHROME = "#d6dbe0";
const CHROME_DARK = "#8d969e";
const CREAM = "#f2e3bd";
const KEYBLACK = "#121212";
const RUBBER = "#1d1d1d";
const BRASS = "#c99a35";
const BRASS_DARK = "#7d5d1c";
const PIN = "#d8b44a";
const PAPER = "#f6f1e3";
const INK = "#26262e";
const INK_RED = "#9c2321";
const FELT = "#5e1a1a";

// ---------- stroke font (unit box -1..1) ----------
type Seg = [number, number, number, number];
const BOX0: Seg[] = [[-1, 1, 1, 1], [-1, -1, 1, -1], [-1, 1, -1, -1], [1, 1, 1, -1]];
const FIVE: Seg[] = [[1, 1, -1, 1], [-1, 1, -1, 0], [-1, 0, 1, 0], [1, 0, 1, -1], [1, -1, -1, -1]];
const FONT: Record<string, Seg[]> = {
  "1": [[0, -1, 0, 1], [-0.5, 0.6, 0, 1], [-0.5, -1, 0.5, -1]],
  "2": [[-1, 1, 1, 1], [1, 1, 1, 0], [1, 0, -1, 0], [-1, 0, -1, -1], [-1, -1, 1, -1]],
  "3": [[-1, 1, 1, 1], [1, 1, 1, -1], [-0.4, 0, 1, 0], [-1, -1, 1, -1]],
  "4": [[-1, 1, -1, 0], [-1, 0, 1, 0], [0.6, 1, 0.6, -1]],
  "5": FIVE,
  "6": [[1, 1, -1, 1], [-1, 1, -1, -1], [-1, -1, 1, -1], [1, -1, 1, 0], [1, 0, -1, 0]],
  "7": [[-1, 1, 1, 1], [1, 1, -0.3, -1]],
  "8": [...BOX0, [-1, 0, 1, 0]],
  "9": [[-1, 1, 1, 1], [1, 1, 1, -1], [-1, 0, 1, 0], [-1, 1, -1, 0], [1, -1, -1, -1]],
  "0": BOX0,
  Q: [...BOX0, [0.2, -0.3, 1.1, -1.2]],
  W: [[-1, 1, -0.5, -1], [-0.5, -1, 0, 0.3], [0, 0.3, 0.5, -1], [0.5, -1, 1, 1]],
  E: [[-1, 1, -1, -1], [-1, 1, 1, 1], [-1, 0, 0.5, 0], [-1, -1, 1, -1]],
  R: [[-1, -1, -1, 1], [-1, 1, 1, 1], [1, 1, 1, 0], [1, 0, -1, 0], [-0.2, 0, 1, -1]],
  T: [[-1, 1, 1, 1], [0, 1, 0, -1]],
  Y: [[-1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, -1]],
  U: [[-1, 1, -1, -1], [-1, -1, 1, -1], [1, -1, 1, 1]],
  I: [[0, 1, 0, -1], [-0.6, 1, 0.6, 1], [-0.6, -1, 0.6, -1]],
  O: BOX0,
  P: [[-1, -1, -1, 1], [-1, 1, 1, 1], [1, 1, 1, 0], [1, 0, -1, 0]],
  A: [[-1, -1, 0, 1], [0, 1, 1, -1], [-0.5, 0, 0.5, 0]],
  S: FIVE,
  D: [[-1, 1, -1, -1], [-1, 1, 0.4, 1], [0.4, 1, 1, 0.3], [1, 0.3, 1, -0.3], [1, -0.3, 0.4, -1], [0.4, -1, -1, -1]],
  F: [[-1, 1, -1, -1], [-1, 1, 1, 1], [-1, 0, 0.5, 0]],
  G: [[1, 1, -1, 1], [-1, 1, -1, -1], [-1, -1, 1, -1], [1, -1, 1, 0], [1, 0, 0, 0]],
  H: [[-1, 1, -1, -1], [1, 1, 1, -1], [-1, 0, 1, 0]],
  J: [[1, 1, 1, -1], [1, -1, -1, -1], [-1, -1, -1, -0.3]],
  K: [[-1, 1, -1, -1], [-1, 0, 1, 1], [-1, 0, 1, -1]],
  L: [[-1, 1, -1, -1], [-1, -1, 1, -1]],
  Z: [[-1, 1, 1, 1], [1, 1, -1, -1], [-1, -1, 1, -1]],
  X: [[-1, 1, 1, -1], [-1, -1, 1, 1]],
  C: [[1, 1, -1, 1], [-1, 1, -1, -1], [-1, -1, 1, -1]],
  V: [[-1, 1, 0, -1], [0, -1, 1, 1]],
  B: [[-1, 1, -1, -1], [-1, 1, 0.5, 1], [0.5, 1, 0.5, 0], [-1, 0, 1, 0], [1, 0, 1, -1], [1, -1, -1, -1]],
  N: [[-1, -1, -1, 1], [-1, 1, 1, -1], [1, -1, 1, 1]],
  M: [[-1, -1, -1, 1], [-1, 1, 0, 0], [0, 0, 1, 1], [1, 1, 1, -1]],
  ",": [[0.1, -0.5, -0.3, -1.2]],
  ".": [[0, -0.75, 0, -1]],
  "^": [[0, 1, 0, -1], [0, 1, -0.8, 0.1], [0, 1, 0.8, 0.1]],
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const root = b.joint("body", { at: [0, 0, 0] });

  const R: any = rng(1930);
  const rand = (): number =>
    typeof R === "function" ? R() : R.next ? R.next() : R.float();

  const put = (geo: THREE.BufferGeometry, color: string, at: number[]) =>
    b.part(geo, color, { at: [at[0], at[1], at[2]], bone: root });

  // straight bar between two points (box or round), rotations baked into geometry
  const bar = (a: number[], c: number[], w: number, h: number, color: string, round = false) => {
    const dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
    const L = Math.hypot(dx, dy, dz);
    if (L < 1e-6) return;
    const geo = round
      ? new THREE.CylinderGeometry(w, w, L, 6).rotateX(Math.PI / 2)
      : new THREE.BoxGeometry(w, h, L);
    const e = Math.asin(THREE.MathUtils.clamp(dy / L, -1, 1));
    geo.rotateX(-e);
    geo.rotateY(Math.atan2(dx, dz));
    put(geo, color, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2]);
  };

  const glyph = (
    ch: string, cx: number, cy: number, cz: number, size: number,
    plane: "top" | "front", color: string, w: number, t: number,
  ) => {
    const segs = FONT[ch];
    if (!segs) return;
    const sx = size * 0.75;
    for (const [x1, y1, x2, y2] of segs) {
      const dx = (x2 - x1) * sx, dy = (y2 - y1) * size;
      const L = Math.hypot(dx, dy);
      const gx = ((x1 + x2) / 2) * sx, gy = ((y1 + y2) / 2) * size;
      const ang = Math.atan2(dy, dx);
      if (plane === "top") {
        put(new THREE.BoxGeometry(L + w, t, w).rotateY(ang), color, [cx + gx, cy, cz - gy]);
      } else {
        put(new THREE.BoxGeometry(L + w, w, t).rotateZ(ang), color, [cx + gx, cy + gy, cz]);
      }
    }
  };

  // ---------- base: feet + plinth ----------
  for (const fx of [-0.13, 0.13])
    for (const fz of [-0.115, 0.12])
      put(new THREE.CylinderGeometry(0.012, 0.013, 0.008, 10), RUBBER, [fx, 0.004, fz]);
  put(new THREE.BoxGeometry(0.31, 0.008, 0.275), KEYBLACK, [0, 0.01, 0.005]);

  // ---------- body shell (side profile extruded across X) ----------
  const prof: [number, number][] = [
    [0.14, 0.012], [0.14, 0.042], [0.03, 0.084], [0.01, 0.096],
    [-0.11, 0.1], [-0.13, 0.09], [-0.13, 0.012],
  ];
  const shape = new THREE.Shape();
  shape.moveTo(prof[0][0], prof[0][1]);
  for (let i = 1; i < prof.length; i++) shape.lineTo(prof[i][0], prof[i][1]);
  shape.closePath();
  const W = 0.3;
  const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: W, bevelEnabled: false });
  bodyGeo.rotateY(-Math.PI / 2);
  bodyGeo.translate(W / 2, 0, 0);
  put(bodyGeo, GREEN, [0, 0, 0]);

  const slopeY = (z: number) => 0.042 + ((0.14 - z) * 0.042) / 0.11;

  // chrome edge trim on the front lip, gold pinstripes on both flanks
  put(new THREE.BoxGeometry(0.302, 0.0028, 0.004), CHROME, [0, 0.0425, 0.139]);
  const pin: [number, number][] = [
    [0.126, 0.022], [0.126, 0.038], [0.032, 0.075], [0.006, 0.087],
    [-0.104, 0.091], [-0.118, 0.083], [-0.118, 0.022],
  ];
  for (const sx of [-1, 1]) {
    const x = sx * 0.1505;
    for (let i = 0; i < pin.length; i++) {
      const p = pin[i], q = pin[(i + 1) % pin.length];
      bar([x, p[1], p[0]], [x, q[1], q[0]], 0.0008, 0.0015, PIN);
    }
  }

  // keyboard well plate on the slope
  bar([0, slopeY(0.137) + 0.0012, 0.137], [0, slopeY(0.034) + 0.0012, 0.034], 0.28, 0.0024, GREEN_DEEP);

  // ---------- keys ----------
  const key = (x: number, z: number, ch: string, r = 0.0098) => {
    const ys = slopeY(z);
    const yk = ys + 0.018;
    const stemL = yk - ys + 0.003;
    put(new THREE.CylinderGeometry(0.0016, 0.0016, stemL, 6), KEYBLACK, [x, ys - 0.003 + stemL / 2, z]);
    put(new THREE.CylinderGeometry(r * 0.55, r * 0.7, 0.0025, 8), CHROME_DARK, [x, yk - 0.002, z]);
    put(new THREE.CylinderGeometry(r, r, 0.0035, 14), CHROME, [x, yk, z]);
    put(new THREE.CylinderGeometry(r - 0.0016, r - 0.0016, 0.001, 14), KEYBLACK, [x, yk + 0.0021, z]);
    glyph(ch, x, yk + 0.0028, z, 0.0041, "top", CREAM, 0.0011, 0.0004);
  };

  const S = 0.023;
  const rows = [
    { z: 0.12, chars: "ZXCVBNM,.", off: 0.012 },
    { z: 0.096, chars: "ASDFGHJKL", off: 0.006 },
    { z: 0.072, chars: "QWERTYUIOP", off: 0.0 },
    { z: 0.048, chars: "1234567890", off: -0.006 },
  ];
  for (const row of rows) {
    const n = row.chars.length;
    for (let i = 0; i < n; i++) key((i - (n - 1) / 2) * S + row.off, row.z, row.chars[i]);
  }
  // shift keys flanking the bottom row
  key(-0.115, 0.12, "^", 0.0108);
  key(0.137, 0.12, "^", 0.0108);

  // space bar
  put(new THREE.BoxGeometry(0.17, 0.006, 0.007), CHROME, [0, 0.054, 0.143]);
  put(new THREE.BoxGeometry(0.164, 0.0012, 0.004), KEYBLACK, [0, 0.0573, 0.143]);
  for (const sx of [-1, 1]) bar([sx * 0.07, 0.052, 0.141], [sx * 0.07, 0.044, 0.127], 0.0018, 0.0018, CHROME, true);

  // ---------- type basket ----------
  const GZ = -0.06;
  put(new THREE.CylinderGeometry(0.095, 0.095, 0.02, 20, 1, false, -Math.PI / 2, Math.PI), KEYBLACK, [0, 0.092, GZ]);
  put(new THREE.CylinderGeometry(0.052, 0.056, 0.014, 16, 1, false, -Math.PI / 2, Math.PI), CHROME_DARK, [0, 0.107, GZ]);
  put(new THREE.TorusGeometry(0.086, 0.0035, 4, 24, Math.PI).rotateX(Math.PI / 2), FELT, [0, 0.103, GZ]);
  const NB = 32;
  for (let j = 0; j < NB; j++) {
    const a = THREE.MathUtils.degToRad(-72 + (144 * j) / (NB - 1));
    const s = Math.sin(a), c = Math.cos(a);
    const piv = [s * 0.05, 0.1145, GZ + c * 0.05];
    const end = [s * 0.086, 0.107, GZ + c * 0.086];
    bar(piv, end, 0.0013, 0.003, CHROME);
    put(new THREE.BoxGeometry(0.003, 0.004, 0.006).rotateY(a), CHROME_DARK, [end[0], end[1] + 0.0005, end[2]]);
  }
  // type guide + ribbon vibrator
  put(new THREE.BoxGeometry(0.014, 0.01, 0.003), CHROME, [0, 0.121, -0.058]);
  put(new THREE.BoxGeometry(0.004, 0.004, 0.0032), KEYBLACK, [0, 0.122, -0.0565]);

  // ribbon spools
  for (const sx of [-1, 1]) {
    const x = sx * 0.118, z = -0.035;
    put(new THREE.CylinderGeometry(0.024, 0.024, 0.008, 16), CHROME, [x, 0.1, z]);
    put(new THREE.CylinderGeometry(0.018, 0.018, 0.009, 14), RUBBER, [x, 0.1085, z]);
    put(new THREE.CylinderGeometry(0.0225, 0.0225, 0.0015, 16), CHROME, [x, 0.1137, z]);
    put(new THREE.CylinderGeometry(0.005, 0.005, 0.004, 8), BRASS, [x, 0.116, z]);
    bar([sx * 0.1, 0.109, -0.042], [sx * 0.008, 0.121, -0.0575], 0.0008, 0.006, sx < 0 ? RUBBER : INK_RED);
  }

  // ---------- carriage ----------
  const PY = 0.14, PZ = -0.088, PR = 0.022;
  put(new THREE.BoxGeometry(0.33, 0.018, 0.05), GREEN, [0, 0.109, -0.09]);
  // margin scale on the carriage front
  put(new THREE.BoxGeometry(0.26, 0.006, 0.001), CREAM, [0, 0.112, -0.0647]);
  for (let i = 0; i <= 26; i++) {
    const tall = i % 5 === 0;
    put(new THREE.BoxGeometry(0.0006, tall ? 0.004 : 0.0022, 0.0006), INK,
      [-0.13 + i * 0.01, 0.112 + (tall ? 0.0008 : 0.0017), -0.0642]);
  }
  // platen
  put(new THREE.CylinderGeometry(PR, PR, 0.29, 16).rotateZ(Math.PI / 2), KEYBLACK, [0, PY, PZ]);
  for (const sx of [-1, 1]) {
    put(new THREE.BoxGeometry(0.008, 0.05, 0.055), GREEN, [sx * 0.15, 0.135, PZ]);
    put(new THREE.CylinderGeometry(0.0045, 0.0045, 0.014, 8).rotateZ(Math.PI / 2), CHROME, [sx * 0.16, PY, PZ]);
    put(new THREE.CylinderGeometry(0.017, 0.017, 0.016, 10).rotateZ(Math.PI / 2), KEYBLACK, [sx * 0.172, PY, PZ]);
    put(new THREE.CylinderGeometry(0.009, 0.009, 0.002, 12).rotateZ(Math.PI / 2), CHROME, [sx * 0.1805, PY, PZ]);
  }
  // rear paper table
  bar([0, 0.15, -0.112], [0, 0.205, -0.15], 0.25, 0.003, GREEN);
  put(new THREE.BoxGeometry(0.25, 0.003, 0.004), CHROME, [0, 0.2055, -0.151]);

  // paper wrapped round the platen front, then rising and leaning back
  put(new THREE.CylinderGeometry(PR + 0.0004, PR + 0.0004, 0.2, 10, 1, true, -Math.PI / 3, (75 * Math.PI) / 180)
    .rotateZ(Math.PI / 2), PAPER, [0, PY, PZ]);
  const tilt = (15 * Math.PI) / 180;
  const S0 = [0, PY + (PR + 0.0004) * Math.sin(tilt), PZ + (PR + 0.0004) * Math.cos(tilt)];
  const U = [0, Math.cos(tilt), -Math.sin(tilt)];
  const N = [0, Math.sin(tilt), Math.cos(tilt)];
  const SH = 0.24;
  const onSheet = (x: number, v: number, n: number) =>
    [x, S0[1] + U[1] * v + N[1] * n, S0[2] + U[2] * v + N[2] * n];
  put(new THREE.BoxGeometry(0.2, SH, 0.0006).rotateX(-tilt), PAPER, onSheet(0, SH / 2, 0));

  // typed text: title, date, salutation, paragraphs, last line half done
  const LM = -0.078, RM = 0.078, CW = 0.0021, LH = 0.0094;
  const word = (x0: number, letters: number, v: number, color = INK) => {
    const w = letters * CW;
    put(new THREE.BoxGeometry(w, 0.0032, 0.0004).rotateX(-tilt), color, onSheet(x0 + w / 2, v, 0.0005));
    return x0 + w + CW;
  };
  const textLine = (v: number, startX: number, endX: number) => {
    let x = startX;
    for (let g = 0; g < 14; g++) {
      const n = 2 + Math.floor(rand() * 8);
      if (x + n * CW > endX) break;
      x = word(x, n, v);
    }
  };
  let v = SH - 0.022;
  // title centred + red underline
  word(-0.022, 6, v); word(-0.022 + 7 * CW, 7, v);
  put(new THREE.BoxGeometry(0.03, 0.0008, 0.0004).rotateX(-tilt), INK_RED, onSheet(-0.0045 + 0.0015, v - 0.0032, 0.0005));
  v -= LH * 2;
  word(0.035, 4, v); word(0.035 + 5 * CW, 2, v); word(0.035 + 8 * CW, 4, v); // date
  v -= LH * 2;
  word(LM, 4, v); word(LM + 5 * CW, 6, v); // salutation
  v -= LH * 1.5;
  const paragraphs = [5, 4, 3];
  let lines = 0;
  for (let p = 0; p < paragraphs.length && v > 0.03; p++) {
    for (let l = 0; l < paragraphs[p] && v > 0.03; l++) {
      const last = l === paragraphs[p] - 1;
      const startX = l === 0 ? LM + 5 * CW : LM;
      const endX = last ? LM + 0.06 + rand() * 0.06 : RM;
      textLine(v, startX, endX);
      v -= LH;
      lines++;
    }
    v -= LH * 0.6;
  }
  // the line being typed right now, stopping mid-page
  textLine(Math.max(v, 0.03), LM, LM + 0.07);

  // paper bail with rollers
  const bail = [0, PY + 0.012, PZ + 0.028];
  put(new THREE.CylinderGeometry(0.0016, 0.0016, 0.25, 6).rotateZ(Math.PI / 2), CHROME, bail);
  for (const sx of [-0.06, 0.06])
    put(new THREE.CylinderGeometry(0.0042, 0.0042, 0.008, 10).rotateZ(Math.PI / 2), RUBBER, [sx, bail[1], bail[2]]);
  for (const sx of [-1, 1]) bar([sx * 0.125, bail[1], bail[2]], [sx * 0.146, PY + 0.006, PZ + 0.012], 0.0014, 0.0014, CHROME, true);

  // carriage return lever on the typist's left (-X)
  const l0 = [-0.155, 0.152, -0.078];
  const l1 = [-0.17, 0.163, -0.062];
  const l2 = [-0.174, 0.171, -0.02];
  const l3 = [-0.168, 0.176, 0.012];
  bar(l0, l1, 0.0032, 0.0032, CHROME, true);
  bar(l1, l2, 0.0028, 0.0028, CHROME, true);
  bar(l2, l3, 0.0028, 0.0028, CHROME, true);
  put(new THREE.SphereGeometry(0.0042, 8, 6), CHROME, l1);
  put(new THREE.SphereGeometry(0.0036, 8, 6), CHROME, l2);
  bar([l3[0], l3[1], l3[2] - 0.002], [l3[0] + 0.004, l3[1] + 0.003, l3[2] + 0.026], 0.013, 0.0035, CHROME);
  put(new THREE.CylinderGeometry(0.005, 0.005, 0.006, 10), CHROME_DARK, l0);

  // ---------- brass maker's badge ----------
  const BZ = 0.14;
  put(new THREE.CylinderGeometry(1, 1, 0.0012, 20).scale(0.027, 1, 0.0125).rotateX(Math.PI / 2), BRASS_DARK, [0, 0.027, BZ + 0.0006]);
  put(new THREE.CylinderGeometry(1, 1, 0.0022, 20).scale(0.0245, 1, 0.0105).rotateX(Math.PI / 2), BRASS, [0, 0.027, BZ + 0.0011]);
  const name = "ARDEN";
  for (let i = 0; i < name.length; i++)
    glyph(name[i], (i - 2) * 0.0072, 0.027, BZ + 0.0025, 0.003, "front", BRASS_DARK, 0.0008, 0.0005);
  for (const sx of [-1, 1]) {
    put(new THREE.SphereGeometry(0.0013, 6, 4), BRASS_DARK, [sx * 0.0205, 0.027, BZ + 0.0022]);
    // art-deco speed lines either side of the badge
    for (const [k, yy] of [0.021, 0.027, 0.033].entries()) {
      const x0 = sx * 0.031, x1 = sx * (0.13 - k * 0.012);
      put(new THREE.BoxGeometry(Math.abs(x1 - x0), 0.0011, 0.0006), PIN, [(x0 + x1) / 2, yy, BZ + 0.0003]);
    }
  }

  // ---------- finish: gloss on the lacquer, shine on the metal ----------
  const finish: Record<string, [number, number]> = {
    [GREEN]: [0.22, 0.12],
    [GREEN_DEEP]: [0.4, 0.05],
    [CHROME]: [0.18, 0.75],
    [CHROME_DARK]: [0.3, 0.7],
    [BRASS]: [0.28, 0.8],
    [BRASS_DARK]: [0.35, 0.7],
    [PIN]: [0.3, 0.6],
    [KEYBLACK]: [0.35, 0.05],
    [PAPER]: [0.95, 0.0],
  };
  const lookup = Object.entries(finish).map(([c, f]) => [new THREE.Color(c).getHex(), f] as const);
  b.root.traverse((o: any) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m || !m.isMeshStandardMaterial || m.map) continue;
      const hex = m.color.getHex();
      for (const [h, f] of lookup) if (h === hex) { m.roughness = f[0]; m.metalness = f[1]; }
    }
  });

  return b.root;
}
```