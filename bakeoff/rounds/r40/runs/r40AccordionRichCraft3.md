```ts
import * as THREE from "three";
import { createBuilder, rng, mix, noise, cells, paint, smoothstep, svg, offset } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Piano accordion",
  description:
    "Italian piano accordion lying on its back, keyboard toward +Z: mosaic mother-of-pearl celluloid shells, gold filigree grille and trim, rhinestones, ruby velvet bellows with gold-piped pleats, ivory and ebony keys, a 120-button pearl bass board and a Castelfidardo badge.",
};

type V = [number, number, number];
const TAU = Math.PI * 2;

// ------------------------------------------------------------------ layout constants
const Y0 = 0.008; // body rests on four chrome feet
const H = 0.3; // chest-to-grille depth, which is the height when lying on its back
const CY = Y0 + H / 2;
const TOP = Y0 + H;
const TA = 0.23; // treble box half width (x)
const TZ0 = 0.12;
const TZ1 = 0.3; // keyboard end face
const BA = 0.2; // bass box half width
const BZ0E = -0.36; // bass end face
const BZ1E = -0.18;
const BZ0 = -0.164; // bellows run
const BZ1 = 0.104;
const PLEATS = 14;
const PITCH = (BZ1 - BZ0) / PLEATS;
const CH = 0.13; // bellows half height
const aAt = (z: number) => 0.185 + (0.208 - 0.185) * ((z - BZ0) / (BZ1 - BZ0));

// ------------------------------------------------------------------ geometry helpers
/** Rounded rectangle section, counter-clockwise seen from +Z. */
function secPoints(a: number, c: number, r: number, k: number): [number, number][] {
  const pts: [number, number][] = [];
  const corners = [
    [a - r, c - r, 0],
    [-(a - r), c - r, 90],
    [-(a - r), -(c - r), 180],
    [a - r, -(c - r), 270],
  ];
  for (const [cx, cy, deg] of corners)
    for (let i = 0; i <= k; i++) {
      const t = ((deg + (90 * i) / k) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
  return pts;
}

type Ring = { z: number; a: number; c: number; r: number };
/** Open tube through rounded-rectangle rings (z non-decreasing), outward-facing. */
function tubeGeo(rings: Ring[], cy: number, k = 2): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  let N = 0;
  rings.forEach((rg, i) => {
    const pts = secPoints(rg.a, rg.c, rg.r, k);
    N = pts.length;
    pts.forEach(([x, y], j) => {
      pos.push(x, y + cy, rg.z);
      uv.push(j / N, i / (rings.length - 1));
    });
  });
  for (let i = 0; i < rings.length - 1; i++)
    for (let j = 0; j < N; j++) {
      const a = i * N + j;
      const b2 = i * N + ((j + 1) % N);
      const c = (i + 1) * N + j;
      const d = (i + 1) * N + ((j + 1) % N);
      idx.push(a, b2, c, b2, d, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ------------------------------------------------------------------ paints
const mul = (c: readonly [number, number, number], k: number): [number, number, number] => [
  Math.min(c[0] * k, 1),
  Math.min(c[1] * k, 1),
  Math.min(c[2] * k, 1),
];

/** Mosaic mother-of-pearl: iridescent chips with pale seams. */
const pearlPaint = (seed: number) =>
  paint((p, n) => {
    const c = cells(p, 0.055, seed);
    const e = c.d2 - c.d1;
    const broad = noise(p, 0.14, seed + 3);
    const fine = noise(p, 0.02, seed + 8);
    const ph = broad * 2.2 + c.id * 0.9 + fine * 0.3 + n.y * 0.22 + n.x * 0.18;
    const r = 0.91 + 0.085 * Math.cos(TAU * ph);
    const g = 0.9 + 0.085 * Math.cos(TAU * (ph + 0.33));
    const bl = 0.92 + 0.09 * Math.cos(TAU * (ph + 0.66));
    const shard = 0.96 + 0.07 * c.id;
    const base = mul([r, g, bl], shard);
    const seam = 1 - smoothstep(0.03, 0.1, e);
    const lit = mix(base, [0.78, 0.7, 0.68], seam * 0.55);
    return lit;
  });

const PEARL = pearlPaint(5);
const GOLD = metal("gilt", { polish: 0.5, tarnish: 0.08 });
const BRASS = metal("brass", { tarnish: 0.25 });
const CHROME = metal("steel", { polish: 0.7 });

const RED_HI = "#b3152b";
const RED_LO = "#43050f";
const GOLD_RGB = [0.96, 0.78, 0.34] as const;
const BELLOWS = paint((p) => {
  const f = (p.z - BZ0) / PITCH;
  const d = Math.abs(f - Math.round(f)); // 0 on a crest, 0.5 in a valley
  const fabric = noise(p, 0.012, 3);
  let c = mix(RED_HI, RED_LO, smoothstep(0.08, 0.5, d) * 0.85);
  c = mul(c, 0.92 + 0.16 * fabric);
  if (d < 0.07) c = mix(c, GOLD_RGB, 0.92);
  else if (d < 0.11) c = mix(c, [0.95, 0.9, 0.8], 0.35);
  return c;
});

// ------------------------------------------------------------------ colours
const IVORY = "#faf4e4";
const IVORY2 = "#f3ead3";
const IVORY_NOSE = "#e6dbc0";
const EBONY = "#15110f";
const BED = "#240a12";
const LEATHER = "#1d1311";
const BTN_PEARL = "#f7f1e6";
const BTN_BLACK = "#15100f";

export default function build() {
  const b = createBuilder({ name: "pianoAccordion" });
  const R = rng(11);

  // ---------------------------------------------------------------- small placement helpers
  const bx = (c: V, d: V, color: any, extra: object = {}) =>
    b.part(new THREE.BoxGeometry(d[0], d[1], d[2]), color, { at: c, ...extra });

  /** Frame of four bars lying in an XZ plane (a top face). */
  const rectXZ = (cx: number, y: number, cz: number, w: number, d: number, t: number, h: number, color: any) => {
    bx([cx, y, cz - d / 2], [w + t, h, t], color);
    bx([cx, y, cz + d / 2], [w + t, h, t], color);
    bx([cx - w / 2, y, cz], [t, h, d - t], color);
    bx([cx + w / 2, y, cz], [t, h, d - t], color);
  };
  /** Frame of four bars lying in an XY plane (a front or back face). */
  const rectXY = (cx: number, cy: number, z: number, w: number, h: number, t: number, dz: number, color: any) => {
    bx([cx, cy - h / 2, z], [w + t, t, dz], color);
    bx([cx, cy + h / 2, z], [w + t, t, dz], color);
    bx([cx - w / 2, cy, z], [t, h - t, dz], color);
    bx([cx + w / 2, cy, z], [t, h - t, dz], color);
  };
  /** Frame of four bars on a side face (ZY plane). */
  const rectZY = (x: number, cy: number, cz: number, d: number, h: number, t: number, dx: number, color: any) => {
    bx([x, cy - h / 2, cz], [dx, t, d + t], color);
    bx([x, cy + h / 2, cz], [dx, t, d + t], color);
    bx([x, cy, cz - d / 2], [dx, h - t, t], color);
    bx([x, cy, cz + d / 2], [dx, h - t, t], color);
  };

  /** Rhinestone in a gold bezel, seated on a face along `n`. */
  const gems = ["#ff4f86", "#4fe3d6", "#fff2f8"];
  let gemCount = 0;
  const gem = (at: V, n: V, r = 0.007, color?: string) => {
    const col = color ?? gems[gemCount++ % gems.length];
    b.part(new THREE.CylinderGeometry(r * 1.4, r * 1.55, r * 0.55, 8), GOLD, { at, dir: n });
    glow(
      b.part(new THREE.SphereGeometry(r, 6, 4), col, {
        at: offset(at, n, r * 0.3),
        dir: n,
        scale: [1, 0.62, 1],
      }),
      0.55,
    );
  };

  // ---------------------------------------------------------------- textures
  const GRILLE = (() => {
    const petals = Array.from(
      { length: 12 },
      (_, i) =>
        `<ellipse cx="0" cy="-17" rx="6" ry="12" transform="rotate(${i * 30})" fill="${i % 2 ? "#f6d9e4" : "#fffaf2"}" stroke="#b98a92" stroke-width="0.9"/>`,
    ).join("");
    const scroll = `<path d="M24 52 C24 22 66 18 74 40 C80 58 58 66 52 52 C48 42 60 36 64 44"/>
      <path d="M24 52 C24 76 54 86 80 78 C96 73 104 66 112 58"/>
      <path d="M30 28 C46 12 90 12 112 30"/>`;
    const side = (tf: string) => `<g transform="${tf}" fill="none" stroke-linecap="round">
      <g stroke="#5a3a10" stroke-width="5">${scroll}</g>
      <g stroke="#ffe9a6" stroke-width="2.2">${scroll}</g></g>`;
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e08e"/><stop offset="0.5" stop-color="#d4a23c"/><stop offset="1" stop-color="#a87422"/></linearGradient>
        <pattern id="h" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4.5" cy="4.5" r="2.2" fill="#3a0c1c"/></pattern>
      </defs>
      <rect x="1" y="1" width="318" height="98" rx="8" fill="url(#g)" stroke="#6b4512" stroke-width="2"/>
      <rect x="8" y="8" width="304" height="84" rx="5" fill="url(#g)" stroke="#fff0b8" stroke-width="1.5"/>
      <rect x="8" y="8" width="304" height="84" rx="5" fill="url(#h)"/>
      ${side("translate(0 0)")}
      ${side("translate(320 0) scale(-1 1)")}
      <circle cx="160" cy="50" r="37" fill="#2a0a16" stroke="#f8e08e" stroke-width="3"/>
      <circle cx="160" cy="50" r="33" fill="none" stroke="#a87422" stroke-width="1" stroke-dasharray="2 3"/>
      <g transform="translate(160 50)">${petals}
        <circle r="9" fill="#d4a23c" stroke="#6b4512" stroke-width="1"/>
        <circle r="5.5" fill="#e0305a" stroke="#fff0b8" stroke-width="1"/>
        <circle cx="-1.8" cy="-1.8" r="1.6" fill="#fff"/></g>
      <path d="M118 50 L128 42 L138 50 L128 58Z M202 50 L192 42 L182 50 L192 58Z" fill="#2a0a16" stroke="#f8e08e" stroke-width="2"/>
      </svg>`,
      { size: 768 },
    );
  })();

  const BADGE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
      <ellipse cx="100" cy="50" rx="98" ry="48" fill="#d9a63a"/>
      <ellipse cx="100" cy="50" rx="92" ry="42" fill="#190a10" stroke="#fff0b8" stroke-width="1.6"/>
      <ellipse cx="100" cy="50" rx="86" ry="37" fill="none" stroke="#a87422" stroke-width="1" stroke-dasharray="3 3"/>
      <rect x="82" y="15" width="12" height="5" fill="#1f9a4a"/><rect x="94" y="15" width="12" height="5" fill="#fbf6ea"/><rect x="106" y="15" width="12" height="5" fill="#d62828"/>
      <text x="100" y="56" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="bold" font-size="31" fill="#f4d37a" stroke="#7a521a" stroke-width="0.6">Fiorelli</text>
      <text x="100" y="75" text-anchor="middle" font-family="Georgia, serif" font-size="8.5" letter-spacing="2.4" fill="#f7efe0">CASTELFIDARDO · ITALIA</text>
      <path d="M22 50 l5 -4 l5 4 l-5 4z M168 50 l5 -4 l5 4 l-5 4z" fill="#f4d37a"/>
    </svg>`,
    { size: 512 },
  );

  const ROSETTE = (() => {
    const outer = Array.from(
      { length: 16 },
      (_, i) =>
        `<ellipse cx="0" cy="-33" rx="6.5" ry="11" transform="rotate(${i * 22.5})" fill="${i % 2 ? "#d6f0ee" : "#f7d6e2"}" stroke="#b98a92" stroke-width="0.8"/>`,
    ).join("");
    const inner = Array.from(
      { length: 8 },
      (_, i) =>
        `<ellipse cx="0" cy="-19" rx="6" ry="10.5" transform="rotate(${i * 45})" fill="#fffaf3" stroke="#c9a0a8" stroke-width="0.8"/>`,
    ).join("");
    const dots = Array.from(
      { length: 16 },
      (_, i) => `<circle cx="0" cy="-43" r="1.6" fill="#d9a63a" transform="rotate(${i * 22.5 + 11.25})"/>`,
    ).join("");
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="#c8952f"/>
      <circle cx="50" cy="50" r="45.5" fill="#fbf3ee" stroke="#8a5f1b" stroke-width="1.2"/>
      <g transform="translate(50 50)">${outer}${dots}${inner}
        <circle r="9" fill="#d4a23c" stroke="#6b4512" stroke-width="1"/>
        <circle r="5.5" fill="#e0305a" stroke="#fff0b8" stroke-width="1"/>
        <circle cx="-1.8" cy="-1.8" r="1.5" fill="#fff"/></g>
    </svg>`,
      { size: 384 },
    );
  })();

  const FILIGREE = (() => {
    let d1 = "";
    let d2 = "";
    for (let i = 0; i < 10; i++) {
      const x = i * 20 + 10;
      d1 += `M${x - 9} 12 Q${x - 4} 2 ${x + 1} 9 Q${x + 4} 14 ${x - 1} 14 Q${x - 4} 13 ${x - 3} 10 M${x + 1} 12 Q${x + 6} 21 ${x + 11} 12 `;
    }
    d2 = "M0 2.5 H200 M0 21.5 H200";
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 24">
      <g fill="none" stroke-linecap="round">
        <path d="${d1}" stroke="#7a521a" stroke-width="4.4"/><path d="${d2}" stroke="#7a521a" stroke-width="3.6"/>
        <path d="${d1}" stroke="#f3cf72" stroke-width="2.2"/><path d="${d2}" stroke="#f3cf72" stroke-width="2"/>
      </g></svg>`,
      { size: 640 },
    );
  })();

  const FLAG = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50">
      <path d="M2 2 H38 V28 Q38 44 20 49 Q2 44 2 28Z" fill="#d9a63a" stroke="#6b4512" stroke-width="1.2"/>
      <clipPath id="c"><path d="M5 5 H35 V28 Q35 41 20 46 Q5 41 5 28Z"/></clipPath>
      <g clip-path="url(#c)"><rect x="4" y="4" width="12" height="46" fill="#1f9a4a"/><rect x="15" y="4" width="11" height="46" fill="#fbf6ea"/><rect x="26" y="4" width="11" height="46" fill="#d62828"/></g>
    </svg>`,
    { size: 192 },
  );

  const SWITCHES = (() => {
    let s = "";
    for (let j = 0; j < 5; j++)
      for (const y of [19.5, 45.5]) {
        s += `<rect x="${10 + 30 * j - 9}" y="${y - 7}" width="18" height="14" rx="2" fill="#2a1a1e" stroke="#7a5a2a" stroke-width="1"/>`;
      }
    for (let j = 0; j < 5; j++)
      for (let d = -1; d <= 1; d++)
        s += `<circle cx="${10 + 30 * j + d * 4.5}" cy="32.5" r="1.5" fill="#f3e6c8"/>`;
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 65">
      <rect x="1" y="1" width="138" height="63" rx="4" fill="#0f0709" stroke="#d9a63a" stroke-width="2"/>${s}</svg>`,
      { size: 512 },
    );
  })();

  // ---------------------------------------------------------------- textured flat plate helper
  const plane = (tex: any, at: V, dir: V, up: V, w: number, h: number) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });
  const flatTop = (tex: any, x: number, y: number, z: number, w: number, h: number) =>
    plane(tex, [x, y, z], [0, 1, 0], [0, 0, -1], w, h);

  // ================================================================ FEET
  for (const [x, z] of [
    [0.17, 0.2],
    [-0.17, 0.2],
    [0.15, -0.27],
    [-0.15, -0.27],
  ])
    b.part(new THREE.CylinderGeometry(0.013, 0.015, 0.016, 10), CHROME, { at: [x, 0.008, z] });

  // ================================================================ SHELLS
  const trebleShell = b.extrude(secPoints(TA, H / 2, 0.03, 3), {
    at: [0, CY, (TZ0 + TZ1) / 2],
    x: [1, 0, 0],
    thickness: TZ1 - TZ0,
    bevel: 0.005,
    color: PEARL,
  });
  const bassShell = b.extrude(secPoints(BA, H / 2, 0.03, 3), {
    at: [0, CY, (BZ0E + BZ1E) / 2],
    x: [1, 0, 0],
    thickness: BZ1E - BZ0E,
    bevel: 0.005,
    color: PEARL,
  });

  // ================================================================ BELLOWS
  const rings: Ring[] = [];
  for (let i = 0; i <= PLEATS * 2; i++) {
    const z = BZ0 + ((BZ1 - BZ0) * i) / (PLEATS * 2);
    const ridge = i % 2 === 0;
    const inset = ridge ? 0 : 0.026;
    rings.push({ z, a: aAt(z) - inset, c: CH - inset, r: ridge ? 0.03 : 0.018 });
  }
  b.part(tubeGeo(rings, CY, 2), BELLOWS, { at: [0, 0, 0], flat: true });

  // gold end flanges where the pleats meet the boxes
  const flange = (zEdge: number, dir: 1 | -1) => {
    const a0 = aAt(dir === 1 ? BZ1 : BZ0);
    const big = (m: number): Ring[] => [m].map(() => ({ z: 0, a: 0, c: 0, r: 0 }));
    void big;
    const S = (extra: number, z: number): Ring => ({ z, a: a0 + extra, c: CH + extra, r: 0.03 + extra });
    const inner = dir === 1 ? zEdge - 0.016 : zEdge + 0.016;
    const rs =
      dir === 1
        ? [S(0, inner), S(0.007, inner), S(0.007, zEdge)]
        : [S(0.007, zEdge), S(0.007, inner), S(0, inner)];
    b.part(tubeGeo(rs, CY, 2), GOLD, { at: [0, 0, 0], flat: true });
  };
  flange(TZ0, 1);
  flange(BZ1E, -1);

  // corner rails and a stud on every crest
  const cr = 0.03;
  const off = cr * 0.2929;
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      b.rod(
        [sx * (aAt(BZ0) - off), CY + sy * (CH - off), BZ0],
        [sx * (aAt(BZ1) - off), CY + sy * (CH - off), BZ1],
        0.0045,
        GOLD,
      );
    }
  const studs: THREE.BufferGeometry[] = [];
  for (let k = 0; k <= PLEATS; k++) {
    const z = BZ0 + k * PITCH;
    for (const sx of [1, -1])
      for (const sy of [1, -1])
        studs.push(
          new THREE.SphereGeometry(0.0062, 6, 4).translate(sx * (aAt(z) - off), CY + sy * (CH - off), z),
        );
  }
  b.part(mergeGeometries(studs)!, GOLD, { at: [0, 0, 0], flat: true });

  // gold seam bands round both boxes, where the bellows frames meet them
  const trebleSkin = b.surface(trebleShell);
  b.sweep(trebleSkin.loop([0, CY, TZ0 + 0.006], { dir: [0, 0, 1], lift: 0.001 }), 0.003, { color: GOLD });
  const bassSkin = b.surface(bassShell);
  b.sweep(bassSkin.loop([0, CY, BZ1E - 0.006], { dir: [0, 0, 1], lift: 0.001 }), 0.003, { color: GOLD });

  // ================================================================ TREBLE BOX: KEYBOARD END (+Z)
  bx([0, 0.16, TZ1 + 0.001], [0.4, 0.19, 0.008], BED);
  const KP = 0.0176;
  const blackAfter = [0, 1, 3, 4, 5];
  for (let k = 0; k < 21; k++) {
    const x = (k - 10) * KP;
    const col = R() > 0.5 ? IVORY : IVORY2;
    bx([x, 0.16, 0.3115], [KP - 0.0016, 0.15, 0.011], col);
    bx([x, 0.094, 0.319], [KP - 0.0026, 0.016, 0.0035], IVORY_NOSE);
  }
  for (let k = 0; k < 20; k++)
    if (blackAfter.includes(k % 7)) {
      const x = (k - 10) * KP + KP / 2;
      bx([x, 0.189, 0.322], [0.0098, 0.092, 0.01], EBONY);
      bx([x, 0.15, 0.3275], [0.0068, 0.012, 0.002], "#2a2321"); // sheen strip on the black key nose
    }
  // slip rails and end blocks, gold on pearl
  bx([0, 0.0725, TZ1 + 0.004], [0.4, 0.004, 0.008], GOLD);
  bx([0, 0.2475, TZ1 + 0.004], [0.4, 0.004, 0.008], GOLD);
  for (const sx of [1, -1]) bx([sx * 0.199, 0.16, TZ1 + 0.005], [0.006, 0.18, 0.012], GOLD);
  // filigree bands, flag and gems on the margins
  for (const sx of [1, -1])
    for (const y of [0.036, 0.282])
      plane(FILIGREE, [sx * 0.11, y, TZ1 + 0.0009], [0, 0, 1], [0, 1, 0], 0.16, 0.019);
  plane(FLAG, [0, 0.283, TZ1 + 0.0012], [0, 0, 1], [0, 1, 0], 0.03, 0.0375);
  gem([0, 0.036, TZ1], [0, 0, 1], 0.0085, "#ff4f86");
  for (const sx of [1, -1])
    for (const y of [0.036, 0.282]) gem([sx * 0.212, y, TZ1], [0, 0, 1], 0.006);
  rectXY(0, 0.16, TZ1 + 0.0005, 0.412, 0.205, 0.003, 0.005, GOLD);

  // ================================================================ TREBLE TOP: GRILLE
  const gz = 0.2135;
  flatTop(GRILLE, 0, TOP + 0.0018, gz, 0.37, 0.1156);
  rectXZ(0, TOP + 0.0028, gz, 0.382, 0.12, 0.007, 0.0055, GOLD);
  for (const sx of [1, -1]) {
    gem([sx * 0.191, TOP + 0.003, gz - 0.06], [0, 1, 0], 0.0065);
    gem([sx * 0.191, TOP + 0.003, gz + 0.06], [0, 1, 0], 0.0065);
    gem([sx * 0.191, TOP + 0.003, gz], [0, 1, 0], 0.0075, "#fff2f8");
    flatTop(FILIGREE, sx * 0.105, TOP + 0.0009, 0.137, 0.116, 0.014);
    flatTop(FILIGREE, sx * 0.105, TOP + 0.0009, 0.2885, 0.116, 0.014);
  }
  gem([0, TOP + 0.003, 0.137], [0, 1, 0], 0.0065, "#4fe3d6");
  gem([0, TOP + 0.003, 0.2885], [0, 1, 0], 0.0065, "#4fe3d6");

  // ================================================================ TREBLE SIDES
  // +X end: register switches
  const PY = 0.235;
  bx([TA + 0.0005, PY, 0.21], [0.004, 0.072, 0.15], "#0f0709");
  plane(SWITCHES, [TA + 0.0027, PY, 0.21], [1, 0, 0], [0, 1, 0], 0.14, 0.065);
  rectZY(TA + 0.0035, PY, 0.21, 0.152, 0.074, 0.004, 0.005, GOLD);
  for (let k = 0; k < 5; k++)
    for (const y of [PY + 0.013, PY - 0.013]) {
      bx([TA + 0.0067, y, 0.15 + 0.03 * k], [0.008, 0.012, 0.015], k % 2 ? IVORY : IVORY2);
      bx([TA + 0.0112, y, 0.15 + 0.03 * k], [0.001, 0.003, 0.012], "#d9a63a");
    }
  // pearl rosette inlay on the lower half of the +X end
  plane(ROSETTE, [TA + 0.0012, 0.105, 0.21], [1, 0, 0], [0, 1, 0], 0.1, 0.1);
  // -X end: big rosette
  plane(ROSETTE, [-TA - 0.0012, CY, 0.21], [-1, 0, 0], [0, 1, 0], 0.15, 0.15);
  for (const dz of [-0.07, 0.07]) gem([-TA - 0.001, CY + 0.098, 0.21 + dz], [-1, 0, 0], 0.006);
  for (const dz of [-0.07, 0.07]) gem([-TA - 0.001, CY - 0.098, 0.21 + dz], [-1, 0, 0], 0.006);

  // ================================================================ BASS BOX
  const BPZ = BZ0E; // plate z
  bx([0, CY, BPZ], [0.356, 0.206, 0.006], "#16090d");
  rectXY(0, CY, BPZ - 0.0035, 0.364, 0.214, 0.005, 0.004, GOLD);

  const domesW: THREE.BufferGeometry[] = [];
  const domesB: THREE.BufferGeometry[] = [];
  const ringsG: THREE.BufferGeometry[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 20; c++) {
      const x = (c - 9.5) * 0.0165 + (r % 2 ? 0.00825 : 0) - 0.004;
      const y = CY + (r - 2.5) * 0.0275;
      const dome = new THREE.SphereGeometry(0.0068, 8, 4, 0, TAU, 0, Math.PI / 2)
        .scale(1, 0.6, 1)
        .rotateX(-Math.PI / 2)
        .translate(x, y, BPZ - 0.002);
      (r === 1 && c % 4 === 1 ? domesB : domesW).push(dome);
      ringsG.push(
        new THREE.CylinderGeometry(0.0088, 0.0088, 0.0024, 10).rotateX(-Math.PI / 2).translate(x, y, BPZ - 0.001),
      );
    }
  b.part(mergeGeometries(ringsG)!, GOLD, { at: [0, 0, 0], flat: true });
  b.part(mergeGeometries(domesW)!, BTN_PEARL, { at: [0, 0, 0], flat: true });
  b.part(mergeGeometries(domesB)!, BTN_BLACK, { at: [0, 0, 0], flat: true });

  // end-face margins
  for (const sx of [1, -1])
    for (const y of [0.0315, 0.2845])
      plane(FILIGREE, [sx * 0.1, y, BZ0E - 0.0009], [0, 0, -1], [0, 1, 0], 0.16, 0.019);
  gem([0, 0.0315, BZ0E], [0, 0, -1], 0.0085, "#ff4f86");
  gem([0, 0.2845, BZ0E], [0, 0, -1], 0.0085, "#ff4f86");
  for (const sx of [1, -1])
    for (const y of [0.0315, 0.2845]) gem([sx * 0.187, y, BZ0E], [0, 0, -1], 0.006);

  // bass top: Castelfidardo badge
  const badgeZ = -0.27;
  b.extrude(
    Array.from({ length: 24 }, (_, i) => [0.088 * Math.cos((i / 24) * TAU), 0.0455 * Math.sin((i / 24) * TAU)] as [number, number]),
    { at: [0, TOP + 0.0013, badgeZ], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.0026, color: GOLD },
  );
  flatTop(BADGE, 0, TOP + 0.0029, badgeZ, 0.172, 0.086);
  for (const sx of [1, -1]) {
    gem([sx * 0.127, TOP + 0.002, badgeZ], [0, 1, 0], 0.0075, "#fff2f8");
    gem([sx * 0.104, TOP + 0.002, badgeZ + 0.042], [0, 1, 0], 0.0055);
    gem([sx * 0.104, TOP + 0.002, badgeZ - 0.042], [0, 1, 0], 0.0055);
    flatTop(FILIGREE, sx * 0.1, TOP + 0.0009, -0.337, 0.116, 0.014);
    flatTop(FILIGREE, sx * 0.1, TOP + 0.0009, -0.2315 + 0.0, 0.0001, 0.0001); // hidden placeholder keeps order stable
  }

  // bass strap with a gold buckle
  const strapLoop = bassSkin.loop([0, CY, -0.205], { dir: [0, 0, 1], lift: 0.0035 });
  b.sweep(strapLoop, () => [0.011, 0.0035], { section: "box", color: LEATHER });
  const bp = strapLoop.at(0);
  rectXZ(bp.x, bp.y + 0.005, -0.205, 0.034, 0.026, 0.004, 0.004, GOLD);
  bx([bp.x, bp.y + 0.0065, -0.205], [0.003, 0.003, 0.025], GOLD);
  bx([bp.x + 0.03, bp.y + 0.0058, -0.205], [0.034, 0.002, 0.021], "#2a1d19");

  // bass sides: rosettes
  for (const sx of [1, -1]) {
    plane(ROSETTE, [sx * (BA + 0.0012), CY, -0.27], [sx, 0, 0], [0, 1, 0], 0.14, 0.14);
    gem([sx * (BA + 0.001), CY + 0.092, -0.27], [sx, 0, 0], 0.006);
    gem([sx * (BA + 0.001), CY - 0.092, -0.27], [sx, 0, 0], 0.006);
  }

  return b.root;
}
```