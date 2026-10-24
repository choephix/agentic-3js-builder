import * as THREE from "three";
import { createBuilder, mix, noise, cells, paint, smoothstep, mottle, stripes, polyline, rng, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { coil, gaugeTexture } from "../../../../kits/clockwork";

export const meta = {
  name: "Cardboard Robot Kid",
  description:
    "A grinning kid in a home-made cardboard-box robot costume: kraft box torso with a marker-drawn control panel, foil-wrapped tube sleeves, a box helmet with a face window, shoebox feet, a cereal-box jetpack and a spring antenna.",
};

type P3 = [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- palette
const SKIN = "#f1c59e";
const SKIN_PINK = "#e79b86";
const HAIR = "#5a3820";
const GLOVE = "#ffd23a";
const TAPE = "#e6d596";
const RED_TAPE = "#c9382d";
const BLUE_TAPE = "#2f5bb0";
const WEB = "#2f56a8";
const STEEL = "#7f8796";
const HOSE = "#9ea4b0";
const LID_RED = "#b8332b";
const MARKER = "#2a1d33";

// ---------------------------------------------------------------- paints
const kraftCache = new Map<string, ReturnType<typeof paint>>();
/** Kraft cardboard: `thin` is the panel's thin axis (its edges show corrugation flutes), `pat` the flute direction. */
function kraft(thin: number, pat: number) {
  const key = `${thin}/${pat}`;
  let k = kraftCache.get(key);
  if (!k) {
    k = paint((p, n) => {
      const a = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)];
      if (a[thin] !== undefined && a[thin] < 0.6) {
        const u = [p.x, p.y, p.z][pat] / 0.0115;
        const v = Math.abs((u - Math.floor(u)) * 2 - 1);
        return mix("#855a30", "#d6a96d", smoothstep(0.1, 0.9, v));
      }
      const big = noise(p, 0.16, 4);
      const fine = noise(p, 0.022, 7);
      let c = mix("#b2814b", "#d6a96e", big * 0.65 + fine * 0.35);
      c = mix(c, "#83592f", smoothstep(0.66, 0.8, noise(p, 0.07, 11)) * 0.55);
      c = mix(c, "#5f4125", smoothstep(0.55, 0.0, p.y) * 0.3);
      const sh = 0.86 + 0.14 * smoothstep(-0.6, 0.8, n.y);
      return [c[0] * sh, c[1] * sh * 0.99, c[2] * sh * 0.96];
    });
    kraftCache.set(key, k);
  }
  return k;
}
const KRAFT_SOLID = kraft(-1, 0);

const FOIL = paint((p, n) => {
  const c = cells(p, 0.028, 3);
  const c2 = cells(p, 0.011, 9);
  let l = 0.66 + 0.26 * c.id + 0.1 * (c2.id - 0.5) + 0.06 * (n.y - 0.2);
  if (c.d2 - c.d1 < 0.07) l *= 0.78;
  l = Math.min(1, l);
  const t = noise(p, 0.2, 5);
  return [l * (0.86 + 0.04 * t), l * (0.89 + 0.03 * t), l * 0.96];
});

const TUBE = paint((p, n, s) => {
  const sp = (((s[1] / 360 + s[0] / 0.06) % 1) + 1) % 1;
  if (sp < 0.035) return "#6f4b28";
  const c = mix("#b8874f", "#d9ad72", noise(p, 0.05, 2));
  const sh = 0.88 + 0.12 * smoothstep(-0.5, 0.8, n.y);
  return [c[0] * sh, c[1] * sh, c[2] * sh];
});

const SHIRT = stripes("#f4ead4", "#d9453a", { size: 0.032, axis: "x", width: 0.5, wobble: 0.05 });
const SHIRT_V = stripes("#f4ead4", "#d9453a", { size: 0.032, axis: "y", width: 0.5, wobble: 0.05 });
const JEANS = mottle("#3f5f9f", "#2e4a82", { size: 0.03 });
const HAZARD = stripes("#f2c61b", "#1c1a1f", { size: 0.03, axis: [1, 1, 0], width: 0.5, wobble: 0.02 });

// ---------------------------------------------------------------- textures
const FONT = "Comic Sans MS, Marker Felt, Segoe Print, cursive";

const PANEL = svg(
  `<svg viewBox="0 0 130 99" xmlns="http://www.w3.org/2000/svg">
  <text x="65" y="17" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="bold" fill="${MARKER}">ROBO-3000</text>
  <path d="M22 23 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0" stroke="#d6362b" stroke-width="2" fill="none" stroke-linecap="round"/>
  <rect x="8" y="28" width="46" height="30" rx="4" fill="#12313a" stroke="${MARKER}" stroke-width="2.4"/>
  <circle cx="22" cy="38" r="2.6" fill="#6bffb0"/><circle cx="40" cy="38" r="2.6" fill="#6bffb0"/>
  <path d="M20 47 Q31 55 42 47" stroke="#6bffb0" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <g stroke="${MARKER}" stroke-width="2" fill="#f6efd6" stroke-linecap="round">
    <circle cx="80" cy="42" r="12"/><circle cx="110" cy="42" r="12"/>
  </g>
  <g stroke="${MARKER}" stroke-width="1.6" stroke-linecap="round">
    <path d="M70 48 L72 46 M72 36 L74 38 M80 31 L80 34 M88 36 L86 38 M90 48 L88 46"/>
    <path d="M100 48 L102 46 M102 36 L104 38 M110 31 L110 34 M118 36 L116 38 M120 48 L118 46"/>
  </g>
  <path d="M80 42 L86 35" stroke="#d6362b" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M110 42 L103 37" stroke="#2b5fd0" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="80" cy="42" r="2" fill="${MARKER}"/><circle cx="110" cy="42" r="2" fill="${MARKER}"/>
  <path d="M10 71 H62" stroke="${MARKER}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M14 66 v10 M26 68 v6 M38 66 v10 M50 68 v6 M60 66 v10" stroke="${MARKER}" stroke-width="1.4"/>
  <rect x="30" y="64" width="10" height="14" rx="2" fill="#d6362b" stroke="${MARKER}" stroke-width="1.6"/>
  <g stroke="${MARKER}" stroke-width="1.8" fill="none"><circle cx="76" cy="74" r="6.5"/><circle cx="93" cy="74" r="6.5"/><circle cx="110" cy="74" r="6.5"/></g>
  <g font-family="${FONT}" font-size="7" font-weight="bold" fill="${MARKER}" text-anchor="middle"><text x="76" y="89">A</text><text x="93" y="89">B</text><text x="110" y="89">C</text></g>
  <g stroke="${MARKER}" stroke-width="1.8" fill="none"><circle cx="20" cy="89" r="7.5"/><circle cx="44" cy="89" r="7.5"/></g>
  <path d="M28 94 l4 -3 l-4 -3" stroke="#d6362b" stroke-width="1.6" fill="none"/>
</svg>`,
  { size: 512 },
);

const EYE = svg(
  `<svg viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="c"><path d="M7 32 Q30 10 53 32 Q30 49 7 32Z"/></clipPath></defs>
  <path d="M5 11 Q30 -1 55 10" stroke="#4a2e1a" stroke-width="4.6" fill="none" stroke-linecap="round"/>
  <path d="M7 32 Q30 10 53 32 Q30 49 7 32Z" fill="#ffffff"/>
  <g clip-path="url(#c)">
    <circle cx="30" cy="31" r="13.5" fill="#6b3f1e"/>
    <circle cx="30" cy="31" r="13.5" fill="none" stroke="#3a2010" stroke-width="2"/>
    <circle cx="30" cy="31" r="6.6" fill="#1a1020"/>
    <circle cx="24.5" cy="25.5" r="4.2" fill="#ffffff"/>
    <circle cx="35" cy="36.5" r="2.2" fill="#ffffff"/>
  </g>
  <path d="M5 32 Q30 7 55 32" stroke="${MARKER}" stroke-width="4.6" fill="none" stroke-linecap="round"/>
  <path d="M8 31 L2 24 M12 26 L7 18" stroke="${MARKER}" stroke-width="3" stroke-linecap="round"/>
  <path d="M10 33 Q30 47 50 33" stroke="${MARKER}" stroke-width="1.6" fill="none" opacity="0.7"/>
</svg>`,
  { size: 256 },
);

const MOUTH = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="m"><path d="M6 8 Q40 5 74 8 Q66 37 40 37 Q14 37 6 8Z"/></clipPath></defs>
  <path d="M6 8 Q40 5 74 8 Q66 37 40 37 Q14 37 6 8Z" fill="#7b2332"/>
  <g clip-path="url(#m)">
    <path d="M0 4 L80 4 L80 17 Q40 13 0 17Z" fill="#ffffff"/>
    <ellipse cx="40" cy="36" rx="16" ry="9" fill="#e56b7a"/>
    <path d="M26 5 v11 M40 5 v10 M54 5 v11" stroke="#d9cfc0" stroke-width="1.2"/>
  </g>
  <path d="M6 8 Q40 5 74 8 Q66 37 40 37 Q14 37 6 8Z" fill="none" stroke="#5a1a24" stroke-width="3" stroke-linejoin="round"/>
  <path d="M3 4 Q5 9 9 11 M77 4 Q75 9 71 11" stroke="#b9715c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const CHEEKS = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="20" cy="24" rx="17" ry="9" fill="#f08a7e" fill-opacity="0.75"/>
  <ellipse cx="100" cy="24" rx="17" ry="9" fill="#f08a7e" fill-opacity="0.75"/>
  <g fill="#b9724f">
    <circle cx="44" cy="13" r="1.5"/><circle cx="51" cy="9" r="1.4"/><circle cx="58" cy="12" r="1.5"/><circle cx="64" cy="9" r="1.4"/>
    <circle cx="71" cy="13" r="1.5"/><circle cx="76" cy="9" r="1.3"/><circle cx="48" cy="17" r="1.3"/><circle cx="73" cy="18" r="1.3"/>
    <circle cx="14" cy="21" r="1.4"/><circle cx="22" cy="27" r="1.4"/><circle cx="27" cy="20" r="1.3"/>
    <circle cx="94" cy="21" r="1.4"/><circle cx="101" cy="27" r="1.4"/><circle cx="107" cy="20" r="1.3"/>
  </g>
</svg>`,
  { size: 256 },
);

const FRAGILE = svg(
  `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="94" height="64" rx="7" fill="#f8f2e0" stroke="#c8302b" stroke-width="5"/>
  <text x="50" y="30" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#c8302b">FRAGILE</text>
  <g stroke="#2a1d33" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M42 36 Q42 46 50 47 Q58 46 58 36 Z"/><path d="M50 47 V58 M43 59 H57"/>
    <path d="M18 60 V38 M12 44 L18 38 L24 44"/><path d="M82 60 V38 M76 44 L82 38 L88 44"/>
  </g>
</svg>`,
  { size: 256 },
);

const SPEAKER = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="#ece3c6"/>
  <g fill="none" stroke="${MARKER}" stroke-width="3.4" stroke-linecap="round">
    <circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="31" stroke-dasharray="10 4"/><circle cx="50" cy="50" r="20"/>
  </g>
  <circle cx="50" cy="50" r="9" fill="#d6362b" stroke="${MARKER}" stroke-width="3"/>
</svg>`,
  { size: 128 },
);

const NAMETAG = svg(
  `<svg viewBox="0 0 80 52" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="76" height="48" rx="5" fill="#fbf7ea" stroke="#9a948a" stroke-width="2"/>
  <path d="M2 7 Q2 2 7 2 H73 Q78 2 78 7 V20 H2Z" fill="#d6362b"/>
  <text x="40" y="17" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#ffffff">HELLO</text>
  <text x="40" y="27" text-anchor="middle" font-family="Arial, sans-serif" font-size="6.5" fill="#d6362b">my name is</text>
  <text x="40" y="43" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="14" fill="#2b5fd0">ROBO-KID</text>
</svg>`,
  { size: 256 },
);

const GRILLE = svg(
  `<svg viewBox="0 0 200 30" xmlns="http://www.w3.org/2000/svg">
  <g stroke="${MARKER}" stroke-width="4.2" stroke-linecap="round">
    <path d="M40 7 V23 M54 5 V25 M68 4 V26 M82 3 V27 M96 3 V27 M110 3 V27 M124 3 V27 M138 4 V26 M152 5 V25 M166 7 V23"/>
  </g>
  <circle cx="15" cy="15" r="5" fill="#9aa0ab" stroke="${MARKER}" stroke-width="2"/>
  <circle cx="185" cy="15" r="5" fill="#9aa0ab" stroke="${MARKER}" stroke-width="2"/>
</svg>`,
  { size: 512 },
);

const CIRCUIT = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="${MARKER}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 90 H40 V62 H70 V30 H90"/><path d="M10 62 H24 V20 H56 V8"/><path d="M58 90 H88 V72"/><path d="M40 40 H52 V52"/>
  </g>
  <path d="M10 76 H30 V90" fill="none" stroke="#d6362b" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <g fill="#f4ead4" stroke="${MARKER}" stroke-width="2.6">
    <circle cx="90" cy="30" r="5"/><circle cx="56" cy="8" r="5"/><circle cx="88" cy="72" r="5"/><circle cx="10" cy="90" r="5"/><circle cx="40" cy="40" r="4"/>
  </g>
  <rect x="62" y="44" width="16" height="10" fill="#2b5fd0" stroke="${MARKER}" stroke-width="2.4"/>
</svg>`,
  { size: 256 },
);

const STAR = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <polygon points="32,4 40,24 62,26 45,40 51,61 32,49 13,61 19,40 2,26 24,24" fill="#ffd23a" stroke="#c97a1a" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M24 30 L36 22 M22 38 L40 30 M28 44 L42 38" stroke="#f3a51d" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3b2312"/><stop offset="1" stop-color="#8a5a34"/></linearGradient></defs>
  <path d="M2 64 Q3 30 8 4 Q15 30 14 64Z" fill="url(#g)"/>
  <path d="M10 64 Q12 24 18 0 Q25 28 23 64Z" fill="url(#g)" stroke="#3b2312" stroke-width="1"/>
  <path d="M19 64 Q21 34 28 10 Q31 36 29 64Z" fill="url(#g)"/>
</svg>`,
  { size: 128 },
);

const GAUGE = gaugeTexture({ needle: 55, label: "BOT" });

// ---------------------------------------------------------------- builder & skeleton
const b = createBuilder({ name: "cardboard-robot-kid", paintSize: 2048 });

const hips = b.joint("hips", { at: [0, 0.54, 0] });
const spine = b.chain(
  "spine",
  polyline([
    [0, 0.54, 0],
    [0, 0.66, 0],
    [0, 0.8, 0],
    [0, 0.93, 0],
  ]),
  { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
);
const chest = spine.joints[2];
const neckCh = b.chain(
  "neck",
  polyline([
    [0, 0.93, 0],
    [0, 1.0, 0.008],
  ]),
  { parent: chest, names: ["neck"], role: "neck" },
);
const neckJ = neckCh.joints[0];
const head = b.joint("head", { parent: neckJ, at: [0, 1.0, 0.008], dir: [0, 0, 1], role: "head" });
const jaw = b.joint("jaw", { parent: head, at: [0, 1.065, -0.03], dir: [0, 0, 1], role: "jaw" });

// ---------------------------------------------------------------- helpers
/** A box from min/max bounds; the thin axis shows corrugation on its edges unless a colour is given. */
function cb(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, bone: any, color?: any) {
  const [ax, bx] = [Math.min(x0, x1), Math.max(x0, x1)];
  const [ay, by] = [Math.min(y0, y1), Math.max(y0, y1)];
  const [az, bz] = [Math.min(z0, z1), Math.max(z0, z1)];
  const sz = [bx - ax, by - ay, bz - az];
  const thin = sz.indexOf(Math.min(...sz));
  const others = [0, 1, 2].filter((i) => i !== thin);
  const pat = sz[others[0]] >= sz[others[1]] ? others[0] : others[1];
  return b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), color ?? kraft(thin, pat), {
    bone,
    at: [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2],
  });
}

function tape(bone: any, at: P3, normal: P3, widthDir: P3, len: number, wid: number, color: any = TAPE) {
  return b.part(new THREE.BoxGeometry(len, wid, 0.0035), color, { bone, at, dir: normal, axis: "z", up: widthDir });
}

function plane(bone: any, tex: any, at: P3, normal: P3, w: number, h: number, up: P3 = [0, 1, 0]) {
  return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir: normal, axis: "z", up, texture: tex });
}

function disc(bone: any, tex: any, at: P3, normal: P3, r: number) {
  return b.part(new THREE.CircleGeometry(r, 18), "#ffffff", { bone, at, dir: normal, axis: "z", texture: tex });
}

/** A bottle cap: crimped dome, axis along dir. */
function cap(bone: any, at: P3, dir: P3, r: number, color: string) {
  return b.lathe(
    [
      [0, 0],
      [r, 0],
      [r * 1.08, r * 0.2],
      [r, r * 0.38],
      [r * 0.78, r * 0.5],
      [0, r * 0.52],
    ],
    { at, axis: dir, segments: 12, color, bone },
  );
}

/** A flat ring band round a tube. */
function band(bone: any, at: THREE.Vector3 | P3, dir: THREE.Vector3 | P3, r: number, w: number, color: any) {
  return b.lathe(
    [
      [r, 0],
      [r + 0.004, 0],
      [r + 0.004, w],
      [r, w],
    ],
    { at, axis: dir, segments: 10, color, bone },
  );
}

/** Dryer-vent hose: ribbed shell along dir. */
function hose(bone: any, at: THREE.Vector3 | P3, dir: THREE.Vector3 | P3, len: number, r: number) {
  const n = Math.max(2, Math.round(len / 0.011));
  const h = len / n;
  const o: [number, number][] = [[r, 0]];
  for (let i = 0; i < n; i++) o.push([r + 0.006, (i + 0.5) * h], [r, (i + 1) * h]);
  o.push([r - 0.007, len], [r - 0.007, 0]);
  return b.lathe(o, { at, axis: dir, segments: 10, color: HOSE, bone });
}

/** A hollow tube shell. */
function tube(bone: any, at: THREE.Vector3 | P3, dir: THREE.Vector3 | P3, len: number, r: number, color: any) {
  return b.lathe(
    [
      [r - 0.006, 0],
      [r, 0],
      [r, len],
      [r - 0.006, len],
    ],
    { at, axis: dir, segments: 10, color, bone },
  );
}

function brad(bone: any, at: P3, dir: P3, r = 0.005) {
  return b.part(new THREE.CylinderGeometry(r, r, 0.004, 6), "#b9bec9", { bone, at, dir });
}

// ---------------------------------------------------------------- torso: the cardboard box
const T = 0.01;
const X = 0.21;
const Z = 0.14;
const Y0 = 0.48;
const Y1 = 0.93;
// front, back
cb(-(X - T), X - T, Y0, Y1, Z - T, Z, chest);
cb(-(X - T), X - T, Y0, Y1, -Z, -(Z - T), chest);
// sides with arm holes (hole: y .78..0.90, z ±0.06)
for (const s of [1, -1]) {
  const xa = s * (X - T);
  const xb = s * X;
  cb(xa, xb, Y0, 0.78, -Z, Z, chest);
  cb(xa, xb, 0.9, Y1, -Z, Z, chest);
  cb(xa, xb, 0.78, 0.9, 0.06, Z, chest);
  cb(xa, xb, 0.78, 0.9, -Z, -0.06, chest);
}
// top frame with neck hole (±0.07)
cb(-(X - T), X - T, 0.92, Y1, 0.07, Z - T, chest);
cb(-(X - T), X - T, 0.92, Y1, -(Z - T), -0.07, chest);
cb(0.07, X - T, 0.92, Y1, -0.07, 0.07, chest);
cb(-(X - T), -0.07, 0.92, Y1, -0.07, 0.07, chest);

// hazard bands round the bottom edge
cb(-(X - T), X - T, 0.49, 0.525, Z, Z + 0.0025, chest, HAZARD);
cb(-(X - T), X - T, 0.49, 0.525, -Z - 0.0025, -Z, chest, HAZARD);
for (const s of [1, -1]) cb(s * X, s * (X + 0.0025), 0.49, 0.525, -Z, Z, chest, HAZARD);

// shoulder straps (blue webbing) over the top, down front and back
for (const s of [1, -1]) {
  const x0 = s * 0.132;
  const x1 = s * 0.168;
  cb(x0, x1, Y1, Y1 + 0.003, -Z, Z, chest, WEB);
  cb(x0, x1, 0.79, Y1 + 0.003, Z, Z + 0.003, chest, WEB);
  cb(x0, x1, 0.79, Y1 + 0.003, -Z - 0.003, -Z, chest, WEB);
  for (const zf of [1, -1]) for (const yy of [0.81, 0.85]) brad(chest, [s * 0.15, yy, zf * (Z + 0.0045)], [0, 0, zf], 0.005);
}

// control panel
const PCY = 0.7;
cb(-0.13, 0.13, PCY - 0.1, PCY + 0.1, Z, Z + 0.025, chest, FOIL);
const pz = Z + 0.0265;
plane(chest, PANEL, [0, PCY, pz], [0, 0, 1], 0.25, 0.19);
const pxy = (u: number, v: number): [number, number] => [((u - 65) / 130) * 0.25, PCY + ((49.5 - v) / 99) * 0.19];
[
  [76, "#ff3b30"],
  [93, "#ffd23a"],
  [110, "#3cff7a"],
].forEach(([u, c]) => {
  const [x, y] = pxy(u as number, 74);
  glow(b.part(new THREE.SphereGeometry(0.0085, 8, 6), c as string, { bone: chest, at: [x, y, pz + 0.002] }), 1.5);
});
{
  const [x1, y1] = pxy(20, 89);
  const [x2, y2] = pxy(44, 89);
  cap(chest, [x1, y1, pz], [0, 0, 1], 0.0135, "#2e7be0");
  cap(chest, [x2, y2, pz], [0, 0, 1], 0.0135, "#d6362b");
}
for (const sx of [1, -1]) for (const sy of [1, -1]) brad(chest, [sx * 0.122, PCY + sy * 0.092, pz], [0, 0, 1], 0.005);
// tape on the panel corners
tape(chest, [-0.11, PCY + 0.096, pz + 0.002], [0, 0, 1], [0.7, 0.7, 0], 0.06, 0.022);
tape(chest, [0.115, PCY - 0.094, pz + 0.002], [0, 0, 1], [-0.7, 0.7, 0], 0.06, 0.022);

// gauge and the big red button (lower chest)
b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.014, 10), FOIL, { bone: chest, at: [0.1, 0.55, Z + 0.007], dir: [0, 0, 1] });
disc(chest, GAUGE, [0.1, 0.55, Z + 0.0145], [0, 0, 1], 0.039);
b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.012, 10), RED_TAPE, { bone: chest, at: [-0.095, 0.55, Z + 0.006], dir: [0, 0, 1] });
cap(chest, [-0.095, 0.55, Z + 0.012], [0, 0, 1], 0.026, "#e8483a");

// sticker row on the upper chest
plane(chest, NAMETAG, [-0.04, 0.875, Z + 0.0015], [0, 0, 1], 0.1, 0.065, [0.08, 1, 0]);
plane(chest, STAR, [0.065, 0.872, Z + 0.0015], [0, 0, 1], 0.05, 0.05, [-0.2, 1, 0]);
tape(chest, [-0.04, 0.9, Z + 0.0015], [0, 0, 1], [0.1, 1, 0], 0.03, 0.014);

// sides: circuit scribbles
for (const s of [1, -1]) {
  plane(chest, CIRCUIT, [s * (X + 0.0015), 0.63, 0], [s, 0, 0], 0.22, 0.22);
  tape(chest, [s * (X + 0.002), 0.74, 0.1], [s, 0, 0], [0, 1, 0.5], 0.05, 0.02, s > 0 ? RED_TAPE : BLUE_TAPE);
}
// back: fragile sticker and torn tape
plane(chest, FRAGILE, [0, 0.72, -Z - 0.0015], [0, 0, -1], 0.13, 0.091);
tape(chest, [0.07, 0.86, -Z - 0.002], [0, 0, -1], [1, 1, 0], 0.07, 0.024, BLUE_TAPE);
tape(chest, [-0.09, 0.56, -Z - 0.002], [0, 0, -1], [-1, 1, 0], 0.07, 0.024);

// front torn tape pieces and a star
tape(chest, [-0.16, 0.6, Z + 0.0015], [0, 0, 1], [0.5, 1, 0], 0.06, 0.022);
tape(chest, [0.165, 0.9, Z + 0.0015], [0, 0, 1], [-0.7, 0.7, 0], 0.05, 0.02, RED_TAPE);

// body inside the box (shirt/jeans, rigged to the spine)
b.sweep(
  spine,
  (t: number) => {
    const k = smoothstep(0.78, 1, t);
    return [0.105 - 0.05 * k, 0.075 - 0.025 * k] as [number, number];
  },
  {
    bands: [
      [0.28, JEANS],
      [1, SHIRT_V],
    ],
    caps: { start: "round", end: "flat" },
    sides: 10,
  },
);
b.sweep(neckCh, 0.034, { color: SKIN, sides: 8, caps: { start: "flat", end: "flat" } });

// ---------------------------------------------------------------- jetpack: two foil rolls
for (const s of [1, -1]) {
  const cx = s * 0.115;
  const cz = -0.185;
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.28, 10), FOIL, { bone: chest, at: [cx, 0.7, cz] });
  b.part(new THREE.CylinderGeometry(0.04, 0.022, 0.045, 8), "#4a4d58", { bone: chest, at: [cx, 0.5375, cz] });
  band(chest, [cx, 0.62, cz], [0, 1, 0], 0.045, 0.02, s > 0 ? RED_TAPE : BLUE_TAPE);
  band(chest, [cx, 0.77, cz], [0, 1, 0], 0.045, 0.02, s > 0 ? RED_TAPE : BLUE_TAPE);
  cap(chest, [cx, 0.84, cz], [0, 1, 0], 0.03, s > 0 ? "#e8483a" : "#2e7be0");
  const flame = (k: number, color: string, dz: number) =>
    glow(
      b.extrude(
        [
          [-0.02 * k, 0],
          [-0.026 * k, -0.04 * k],
          [0, -0.125 * k, "sharp"],
          [0.026 * k, -0.04 * k],
          [0.02 * k, 0],
        ],
        { at: [cx, 0.516, cz + dz], x: [1, 0, 0], thickness: 0.004, smoothing: 1, color },
      ),
      1.3,
    );
  flame(1, "#e8483a", 0);
  flame(0.72, "#ff9a1f", 0.003);
  flame(0.4, "#ffe65a", 0.006);
}
// rolls strapped to the back panel
cb(-0.115, 0.115, 0.76, 0.79, -Z - 0.006, -Z, chest, BLUE_TAPE);
cb(-0.115, 0.115, 0.62, 0.65, -Z - 0.006, -Z, chest, BLUE_TAPE);

// ---------------------------------------------------------------- head
const SKC: P3 = [0, 1.1, -0.002];
const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, { bone: head, at: SKC, scale: [0.092, 0.09, 0.095] });
const jawPart = b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, { bone: jaw, at: [0, 1.045, 0.012], scale: [0.07, 0.05, 0.07] });
b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_PINK, { bone: head, at: [0, 1.08, 0.094], scale: [0.013, 0.012, 0.013] });
for (const s of [1, -1]) {
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: head, at: [s * 0.093, 1.095, -0.004], scale: [0.012, 0.022, 0.016] });
}
const faceSurf = b.surface([skull, jawPart]);
b.decal(faceSurf, CHEEKS, { at: [0, 1.07, 0.092], dir: [0, 0, 1], size: [0.13, 0.043], lift: 0.0012 });
for (const s of [1, -1]) {
  b.decal(skull, EYE, { at: [s * 0.037, 1.105, 0.094], dir: [0, 0, 1], size: [0.044, 0.037], mirror: s > 0, lift: 0.003 });
}
b.decal(faceSurf, MOUTH, { at: [0, 1.044, 0.083], dir: [0, 0, 1], size: [0.056, 0.028], lift: 0.003 });

// hair: crown cap and a fringe of tuft cards
const HC: P3 = [0, 1.103, -0.004];
const hairCap = b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), HAIR, {
  bone: head,
  at: HC,
  scale: [0.098, 0.096, 0.1],
});
const hairSurf = b.surface(hairCap);
const fringe: any[] = [];
for (let az = -52; az <= 52; az += 13) {
  const h = hairSurf.around(HC).at(az, 52);
  if (h) fringe.push(h);
}
for (let az = -40; az <= 40; az += 20) {
  const h = hairSurf.around(HC).at(az, 62);
  if (h) fringe.push(h);
}
b.cards(fringe, TUFT, { size: [0.03, 0.05], lean: 78, flow: [0, -1, 0.35], bend: 25, vary: 0.25, spin: 8, rng: rng(5), cross: false, bone: head });

// ---------------------------------------------------------------- helmet (open-faced cardboard box)
const HX = 0.14;
const HY0 = 0.945;
const HY1 = 1.225;
const HZ = 0.135;
cb(-HX, HX, HY1 - T, HY1, -HZ, HZ, head); // top
for (const s of [1, -1]) cb(s * (HX - T), s * HX, HY0, HY1 - T, -HZ, HZ, head); // sides
cb(-(HX - T), HX - T, HY0, HY1 - T, -HZ, -(HZ - T), head); // back
cb(-(HX - T), HX - T, 1.185, HY1 - T, HZ - T, HZ, head); // brow strip
cb(-(HX - T), HX - T, HY0, 0.985, HZ - T, HZ, head); // chin strip
for (const s of [1, -1]) cb(s * 0.1, s * (HX - T), 0.985, 1.185, HZ - T, HZ, head); // window sides
// hazard tape on window sides, grille on the chin strip
for (const s of [1, -1]) cb(s * 0.106, s * 0.124, 0.99, 1.18, HZ, HZ + 0.003, head, HAZARD);
plane(head, GRILLE, [0, 0.965, HZ + 0.0015], [0, 0, 1], 0.2, 0.03);
// bolts and tape
for (const s of [1, -1]) {
  cap(head, [s * 0.113, 1.2, HZ], [0, 0, 1], 0.011, s > 0 ? "#e8483a" : "#2e7be0");
  brad(head, [s * 0.113, 0.967 + 0.0, HZ + 0.0015], [0, 0, 1], 0.0045);
}
cb(-0.05, 0.05, HY1, HY1 + 0.003, -HZ, HZ, head, RED_TAPE);
tape(head, [-0.1, HY1 + 0.002, 0.07], [0, 1, 0], [1, 1, 0], 0.07, 0.024);
plane(head, STAR, [0.09, HY1 + 0.0015, -0.06], [0, 1, 0], 0.045, 0.045, [0, 0, 1]);
tape(head, [-0.1, 1.2, HZ + 0.002], [0, 0, 1], [0.5, 1, 0], 0.045, 0.02, BLUE_TAPE);
// ear cups
for (const s of [1, -1]) {
  b.part(new THREE.CylinderGeometry(0.054, 0.054, 0.032, 10), FOIL, { bone: head, at: [s * (HX + 0.016), 1.09, 0.0], dir: [s, 0, 0] });
  disc(head, SPEAKER, [s * (HX + 0.0335), 1.09, 0.0], [s, 0, 0], 0.045);
  band(head, [s * (HX - 0.002), 1.09, 0], [s, 0, 0], 0.054, 0.012, s > 0 ? RED_TAPE : BLUE_TAPE);
  brad(head, [s * (HX + 0.034), 1.14, -0.035], [s, 0, 0], 0.005);
}
plane(head, CIRCUIT, [0, 1.08, -HZ - 0.0015], [0, 0, -1], 0.13, 0.13);
// antenna
b.lathe(
  [
    [0, 0],
    [0.03, 0],
    [0.024, 0.014],
    [0.01, 0.022],
    [0, 0.022],
  ],
  { at: [0, HY1 + 0.003, 0], axis: [0, 1, 0], segments: 10, color: FOIL, bone: head },
);
b.sweep(coil([0, HY1 + 0.02, 0], [0, 1.335, 0], 0.014, 6), 0.0035, { bone: head, color: STEEL, sides: 5 });
b.part(new THREE.SphereGeometry(0.024, 10, 8), FOIL, { bone: head, at: [0, 1.355, 0] });
glow(b.part(new THREE.SphereGeometry(0.011, 8, 6), "#ff3b30", { bone: head, at: [0, 1.386, 0] }), 1.8);

// ---------------------------------------------------------------- arms
function buildHand(S: string, wrJ: any, el: THREE.Vector3, wr: THREE.Vector3) {
  const f = wr.clone().sub(el).normalize();
  const zz = V(0, 0, 1).sub(f.clone().multiplyScalar(f.z)).normalize();
  b.part(new THREE.SphereGeometry(1, 8, 6), GLOVE, {
    bone: wrJ,
    at: wr.clone().addScaledVector(f, 0.03),
    dir: f,
    up: [0, 0, 1],
    scale: [0.017, 0.036, 0.035],
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.034, 0.032, 8), GLOVE, { bone: wrJ, at: wr.clone().addScaledVector(f, -0.004), dir: f });
  const fingers: [string, number, number, number][] = [
    ["index", 0.026, 0.22, 0.042],
    ["middle", 0.009, 0.07, 0.046],
    ["ring", -0.009, -0.08, 0.042],
    ["pinky", -0.026, -0.24, 0.034],
  ];
  for (const [name, off, spread, len] of fingers) {
    const base = wr.clone().addScaledVector(f, 0.058).addScaledVector(zz, off);
    const d = f.clone().addScaledVector(zz, spread).normalize();
    const ch = b.chain(`${name}${S}`, polyline([base, base.clone().addScaledVector(d, len * 0.5), base.clone().addScaledVector(d, len)]), {
      parent: wrJ,
      names: [`${name}1${S}`, `${name}2${S}`, `${name}3${S}`],
      role: "digit",
    });
    b.sweep(ch, [0.0108, 0.0085], { color: GLOVE, sides: 6 });
  }
  const tb = wr.clone().addScaledVector(f, 0.022).addScaledVector(zz, 0.028);
  const td = f.clone().multiplyScalar(0.45).addScaledVector(zz, 0.9).add(V(0, -0.15, 0)).normalize();
  const th = b.chain(`thumb${S}`, polyline([tb, tb.clone().addScaledVector(td, 0.021), tb.clone().addScaledVector(td, 0.042)]), {
    parent: wrJ,
    names: [`thumb1${S}`, `thumb2${S}`, `thumb3${S}`],
    role: "digit",
  });
  b.sweep(th, [0.0125, 0.0095], { color: GLOVE, sides: 6 });
}

for (const s of [1, -1]) {
  const S = s > 0 ? "L" : "R";
  const sh = V(s * 0.14, 0.845, 0);
  const el = V(s * 0.303, 0.769, 0.015);
  const wr = V(s * 0.455, 0.69, 0.035);
  const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
    parent: chest,
    names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
    role: "arm",
  });
  const elbowJ = arm.joints[1];
  const wristJ = arm.joints[arm.joints.length - 1];
  b.sweep(arm, [0.033, 0.026], {
    bands: [
      [0.5, SHIRT],
      [1, SKIN],
    ],
    sides: 8,
  });
  const f = wr.clone().sub(el);
  const flen = f.length();
  f.normalize();
  hose(elbowJ, el.clone().addScaledVector(f, -0.03), f, 0.058, 0.047);
  const t0 = el.clone().addScaledVector(f, 0.032);
  const tl = flen - 0.032 - 0.02;
  tube(elbowJ, t0, f, tl, 0.047, FOIL);
  band(elbowJ, t0, f, 0.047, 0.012, s > 0 ? RED_TAPE : BLUE_TAPE);
  band(elbowJ, el.clone().addScaledVector(f, flen - 0.032), f, 0.047, 0.012, s > 0 ? RED_TAPE : BLUE_TAPE);
  // a marker arrow on the sleeve
  tape(elbowJ, el.clone().addScaledVector(f, 0.09).add(V(0, 0.047, 0)).toArray() as P3, [0, 1, 0], f.toArray() as P3, 0.04, 0.02, TAPE);
  buildHand(S, wristJ, el, wr);
}

// ---------------------------------------------------------------- legs
for (const s of [1, -1]) {
  const S = s > 0 ? "L" : "R";
  const hp = V(s * 0.065, 0.53, 0);
  const kn = V(s * 0.068, 0.31, 0.014);
  const an = V(s * 0.066, 0.105, 0);
  const leg = b.chain(`leg${S}`, polyline([hp, kn, an]), {
    parent: hips,
    names: [`hip${S}`, `knee${S}`, `ankle${S}`],
    role: "leg",
    contact: [s * 0.066, 0, 0.03],
  });
  const kneeJ = leg.joints[1];
  const ankleJ = leg.joints[2];
  const toe = b.joint(`toe${S}`, { parent: ankleJ, at: [s * 0.066, 0.04, 0.075], dir: [0, 0, 1], role: "digit" });
  b.sweep(leg, [0.052, 0.036], { color: JEANS, sides: 8 });
  const sd = an.clone().sub(kn);
  const slen = sd.length();
  sd.normalize();
  hose(kneeJ, kn.clone().addScaledVector(sd, -0.025), sd, 0.055, 0.054);
  const t0 = kn.clone().addScaledVector(sd, 0.032);
  const tl = slen - 0.032 + 0.0;
  tube(kneeJ, t0, sd, tl, 0.054, TUBE);
  band(kneeJ, t0, sd, 0.054, 0.012, s > 0 ? BLUE_TAPE : RED_TAPE);
  band(kneeJ, kn.clone().addScaledVector(sd, slen - 0.04), sd, 0.054, 0.014, TAPE);
  // shoebox foot: heel and toe, with red lids
  const cx = s * 0.066;
  const w = 0.0525;
  cb(cx - w, cx + w, -0.002, 0.062, -0.07, 0.066, ankleJ, KRAFT_SOLID);
  cb(cx - w - 0.004, cx + w + 0.004, 0.062, 0.086, -0.074, 0.07, ankleJ, LID_RED);
  cb(cx - w, cx + w, -0.002, 0.062, 0.066, 0.178, toe, KRAFT_SOLID);
  cb(cx - w - 0.004, cx + w + 0.004, 0.062, 0.086, 0.066, 0.182, toe, LID_RED);
  cb(cx - 0.012, cx + 0.012, 0.0, 0.088, -0.0, 0.0, ankleJ, TAPE); // placeholder-thin (hidden seam)
  tape(toe, [cx, 0.0875, 0.14], [0, 1, 0], [1, 0, 0], 0.11, 0.02, TAPE);
  plane(toe, STAR, [cx, 0.0875, 0.1], [0, 1, 0], 0.045, 0.045, [0.2 * s, 0, 1]);
  cb(cx - w - 0.001, cx + w + 0.001, -0.002, 0.012, 0.17, 0.178, toe, HAZARD);
  brad(ankleJ, [cx + s * 0.0, 0.0875, -0.05], [0, 1, 0], 0.005);
}

b.root.userData.note = "cardboard robot costume";
export default function build() {
  return b.root;
}
