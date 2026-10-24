```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, arc, catmull, limb, mottle, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { cel, inkLines } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Sir Columbus the Pigeon Knight",
  description:
    "An upright pigeon in plate armour, drawn as medieval manuscript marginalia: lapis and vermilion per-pale surcoat with gold diaper, " +
    "ink-outlined silver plate, gold-leaf trim, barred wing feathers for hands, a heraldic shield, a plumed bascinet and a dagged skirt.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: ink, vellum, vermilion, lapis, gold leaf, verdigris, pigeon greys
const INK = "#2a1912";
const PARCH = "#f1e3b8";
const VERM = "#cf3a22";
const LAPIS = "#2d4fa8";
const GOLD = "#e0aa2c";
const GOLD_D = "#9a6e17";
const VERD = "#4d8062";
const PG = "#9aa6bd";
const PG_D = "#58627f";
const PG_L = "#cdd4e2";
const LEG = "#d8645a";
const BEAK = "#5a4338";
const LEATHER = "#6b3d2a";

const D = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const arr = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];
const lp = (a: number[], c: number[], t: number): [number, number, number] => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];
const fract = (x: number) => x - Math.floor(x);
type Pt = [number, number] | [number, number, "sharp"];
const out = (...p: Pt[]) => p;

export default function build() {
  const b = createBuilder({ name: "pigeon_knight", paintSize: 2048 });

  // -------------------------------------------------------------------------------------------------------------
  // Paints
  const inked = (c: ReturnType<typeof cel>) => inkLines(c, { levels: [0], width: 0.2, axis: [0, 0, 1], ink: INK });

  const STEEL = inked(cel(mottle("#d3dae6", "#aeb9cc", { size: 0.1, seed: 2, contrast: 0.8 }), "#6c7897"));
  const GOLDP = inked(cel(mottle(GOLD, "#f5d06c", { size: 0.05, seed: 7 }), GOLD_D));
  const HEADP = inked(cel("#a3aec6", "#6f7aa0"));
  const LEAF = "#efc14e";

  const surcoatRaw = paint((p, n) => {
    const front = Math.abs(n.z) >= Math.abs(n.x);
    const u = front ? p.x : p.z;
    const per = 0.075;
    const a = (u + p.y) / per;
    const c = (u - p.y) / per;
    const da = Math.abs(a - Math.round(a)) * per * 0.7071;
    const dc = Math.abs(c - Math.round(c)) * per * 0.7071;
    const left = p.x >= 0;
    if (p.y > 0.425 && p.y < 0.437) return LEAF;
    if (p.y >= 0.437 && p.y < 0.447) return INK;
    if (front && Math.abs(p.x) < 0.006) return INK;
    if (front && Math.abs(p.x) < 0.016) return LEAF;
    if (Math.hypot(da, dc) < 0.0075) return LEAF;
    if (da < 0.0016 || dc < 0.0016) return left ? "#7b95dc" : "#f59470";
    return left ? LAPIS : VERM;
  });
  const SURCOAT = inked(cel(surcoatRaw));

  const IRID = paint((p, n) => {
    const t = noise(p, 0.07, 5) * 0.6 + 0.4 * (0.5 + 0.5 * n.x);
    const green = mix("#2f9a7e", "#41b8a4", smoothstep(-0.2, 0.9, n.y));
    return mix(green, "#8a4ea8", smoothstep(0.42, 0.7, t));
  });

  const MAIL = paint((p) => {
    const u = (p.x + p.z) / 0.016;
    const v = p.y / 0.016 + (Math.floor(u) & 1) * 0.5;
    const d = Math.hypot(fract(u) - 0.5, fract(v) - 0.5);
    return d < 0.17 ? "#3f465e" : d < 0.44 ? "#c9d0de" : "#8993aa";
  });

  const BLADE = paint((_p, _n, s) =>
    Math.abs(s[0]) < 0.006 ? "#7d89a5" : Math.abs(s[0]) > 0.027 ? "#f4f7fc" : "#c5cddc",
  );

  // -------------------------------------------------------------------------------------------------------------
  // Textures (SVG drawings)
  const barbs = (n: number, cx: number, y0: number, step: number, spread: number, col: string) => {
    let s = "";
    for (let i = 0; i < n; i++) {
      const y = y0 - i * step;
      s += `<path d="M${cx} ${y} L${cx - spread} ${y - step * 1.1} M${cx} ${y} L${cx + spread} ${y - step * 1.1}"/>`;
    }
    return `<g stroke="${col}" stroke-width="1.1" opacity="0.5" fill="none">${s}</g>`;
  };

  const FSH = "M20 118 C9 100 4 62 8 32 C10 14 15 6 20 3 C25 6 30 14 32 32 C36 62 31 100 20 118 Z";
  const WING_TEX = svg(
    `<svg viewBox="0 0 40 122" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><path d="${FSH}"/></clipPath></defs>
      <path d="${FSH}" fill="${PG}"/>
      <g clip-path="url(#c)">
        <rect x="0" y="0" width="40" height="18" fill="${PG_D}"/>
        <rect x="0" y="44" width="40" height="9" fill="${PG_D}"/>
        <rect x="0" y="86" width="40" height="40" fill="${PG_L}" opacity="0.45"/>
        ${barbs(9, 20, 112, 11, 12, PG_D)}
      </g>
      <path d="M20 118 L20 8" stroke="#eef2f8" stroke-width="2.2" stroke-linecap="round"/>
      <path d="${FSH}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );

  const TSH = "M22 136 C8 120 3 80 6 44 C8 22 14 10 22 6 C30 10 36 22 38 44 C41 80 36 120 22 136 Z";
  const TAIL_TEX = svg(
    `<svg viewBox="0 0 44 140" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><path d="${TSH}"/></clipPath></defs>
      <path d="${TSH}" fill="#8f96b2"/>
      <g clip-path="url(#c)">
        <rect x="0" y="0" width="44" height="40" fill="#3b425e"/>
        <rect x="0" y="40" width="44" height="10" fill="#d9d5e2"/>
        <rect x="0" y="100" width="44" height="40" fill="#b7bdd2" opacity="0.5"/>
        ${barbs(10, 22, 130, 12, 13, "#434b69")}
      </g>
      <path d="M22 134 L22 10" stroke="#e6e9f2" stroke-width="2.2" stroke-linecap="round"/>
      <path d="${TSH}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );

  const plumeTex = (main: string, alt: string) =>
    svg(
      `<svg viewBox="0 0 50 140" xmlns="http://www.w3.org/2000/svg">
        <defs><clipPath id="c"><path d="M25 136 C10 110 4 70 12 40 C16 22 22 10 26 4 C30 14 40 30 44 52 C48 84 40 114 25 136 Z"/></clipPath></defs>
        <path d="M25 136 C10 110 4 70 12 40 C16 22 22 10 26 4 C30 14 40 30 44 52 C48 84 40 114 25 136 Z" fill="${main}"/>
        <g clip-path="url(#c)">
          <path d="M0 44 L25 58 L50 44 L50 56 L25 70 L0 56Z" fill="${alt}"/>
          <path d="M0 82 L25 96 L50 82 L50 94 L25 108 L0 94Z" fill="${alt}"/>
          ${barbs(10, 25, 128, 12, 14, INK)}
        </g>
        <path d="M25 136 C24 100 25 60 26 8" stroke="${PARCH}" stroke-width="2" fill="none"/>
        <path d="M25 136 C10 110 4 70 12 40 C16 22 22 10 26 4 C30 14 40 30 44 52 C48 84 40 114 25 136 Z" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      </svg>`,
      { size: 256 },
    );
  const PLUME_R = plumeTex(VERM, PARCH);
  const PLUME_B = plumeTex(LAPIS, LEAF);

  // The left eye as seen from the front: orange iris, black pupil, a heavy determined lid sloping to the beak.
  const EYE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="e"><circle cx="50" cy="50" r="46"/></clipPath>
        <radialGradient id="i" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#ffd24a"/><stop offset="1" stop-color="#ee7c14"/></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#e0705a"/>
      <circle cx="50" cy="50" r="36" fill="url(#i)" stroke="${INK}" stroke-width="3"/>
      <circle cx="50" cy="52" r="17" fill="#0e0907"/>
      <circle cx="41" cy="41" r="7" fill="#ffffff"/>
      <circle cx="60" cy="62" r="3" fill="#ffffff"/>
      <g clip-path="url(#e)">
        <path d="M0 0 H100 V27 L0 47 Z" fill="#e0705a"/>
        <path d="M0 47 L100 27" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      </g>
      <circle cx="50" cy="50" r="45" fill="none" stroke="${INK}" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const DOVE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="${VERM}" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="50" cy="50" r="41" fill="none" stroke="${LEAF}" stroke-width="3.2" stroke-dasharray="0.5 5.8" stroke-linecap="round"/>
      <polygon points="66,52 90,43 86,55 91,67 66,63" fill="#f7f0dc" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cx="50" cy="55" rx="23" ry="13" transform="rotate(-8 50 55)" fill="#f7f0dc" stroke="${INK}" stroke-width="2"/>
      <circle cx="29" cy="44" r="9.5" fill="#f7f0dc" stroke="${INK}" stroke-width="2"/>
      <polygon points="21,42 10,45.5 21,49" fill="${GOLD}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M40 54 Q47 28 72 33 Q66 55 44 62 Z" fill="#e3dac0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 50 Q58 42 66 40 M48 56 Q58 50 68 46" stroke="${INK}" stroke-width="1.3" fill="none"/>
      <circle cx="27" cy="42" r="1.8" fill="${INK}"/>
      <path d="M44 68 L42 76 M54 68 L55 76" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const VINE = svg(
    `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 3 L97 65 L50 127 L3 65 Z" fill="${VERM}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M50 13 L88 65 L50 117 L12 65 Z" fill="none" stroke="${LEAF}" stroke-width="2.6"/>
      <path d="M50 108 C26 94 30 72 50 66 C70 60 74 40 50 24" stroke="${LEAF}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path d="M50 66 C36 60 28 46 36 36" stroke="${LEAF}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M50 88 C62 86 70 78 68 68" stroke="${LEAF}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M36 36 C27 31 29 21 38 21 C45 25 43 32 36 36Z" fill="${VERD}" stroke="${INK}" stroke-width="1.6"/>
      <path d="M50 24 C44 14 52 10 58 14 C58 20 54 24 50 24Z" fill="${VERD}" stroke="${INK}" stroke-width="1.6"/>
      <path d="M68 68 C76 64 82 70 78 77 C72 78 68 74 68 68Z" fill="${VERD}" stroke="${INK}" stroke-width="1.6"/>
      <path d="M32 80 C24 76 24 68 31 66 C37 69 37 76 32 80Z" fill="${VERD}" stroke="${INK}" stroke-width="1.6"/>
      <circle cx="50" cy="66" r="4.2" fill="${LAPIS}" stroke="${INK}" stroke-width="1.5"/>
      <circle cx="50" cy="104" r="2.8" fill="${LEAF}"/><circle cx="36" cy="20" r="2.2" fill="${LEAF}"/>
      <circle cx="82" cy="65" r="2.4" fill="${LEAF}"/><circle cx="18" cy="65" r="2.4" fill="${LEAF}"/>
    </svg>`,
    { size: 256 },
  );

  const SH = "M2 2 H68 V50 Q68 82 35 98 Q2 82 2 50 Z";
  let diaper = "";
  for (let i = -6; i < 12; i++)
    diaper += `<path d="M${i * 11} 0 L${i * 11 + 100} 100 M${i * 11 + 100} 0 L${i * 11} 100"/>`;
  const bezant = (x: number, y: number) =>
    `<circle cx="${x}" cy="${y}" r="8" fill="${LEAF}" stroke="${INK}" stroke-width="1.8"/><circle cx="${x}" cy="${y}" r="4.6" fill="none" stroke="${GOLD_D}" stroke-width="1.4"/>`;
  const SHIELD_TEX = svg(
    `<svg viewBox="0 0 70 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="s"><path d="${SH}"/></clipPath></defs>
      <path d="${SH}" fill="${LAPIS}"/>
      <g clip-path="url(#s)">
        <g stroke="#6d89d6" stroke-width="0.9" opacity="0.7" fill="none">${diaper}</g>
        <path d="M-2 62 L35 34 L72 62 L72 78 L35 50 L-2 78 Z" fill="${VERM}" stroke="${INK}" stroke-width="2"/>
        <path d="M-2 66 L35 38 L72 66" fill="none" stroke="${LEAF}" stroke-width="2"/>
        ${bezant(15, 20)}${bezant(55, 20)}${bezant(35, 79)}
      </g>
      <path d="${SH}" fill="none" stroke="${LEAF}" stroke-width="4.5"/>
      <path d="${SH}" fill="none" stroke="${INK}" stroke-width="1.8"/>
    </svg>`,
    { size: 320 },
  );

  const INSCR = svg(
    `<svg viewBox="0 0 12 150" xmlns="http://www.w3.org/2000/svg">
      <text transform="translate(9.2,146) rotate(-90)" font-size="8.6" font-family="serif" font-weight="bold" fill="${GOLD_D}" letter-spacing="1.2">+ COLUMBA FORTIS +</text>
    </svg>`,
    { size: 600 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Helpers
  const plane2 = (tex: THREE.Texture, w: number, l: number, at: number[], dir: number[], bone: Joint, up: number[]) => {
    const g = new THREE.PlaneGeometry(w, l).translate(0, l / 2, 0);
    const g2 = new THREE.PlaneGeometry(w, l).translate(0, l / 2, 0).rotateY(Math.PI);
    const opt = { bone, at, dir, up, texture: tex };
    b.part(g, "#ffffff", opt);
    b.part(g2, "#ffffff", opt);
  };

  const studs = (pts: number[][], r: number, color: string, bone: Joint) => {
    const gs = pts.map((p) => new THREE.SphereGeometry(r, 6, 4).translate(p[0], p[1], p[2]));
    b.part(mergeGeometries(gs)!, color, { bone, at: [0, 0, 0] });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.55, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.58, 0],
      [0, 0.74, 0.02],
      [0, 0.9, 0.04],
      [0, 1.02, 0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.02, 0.05],
      [0, 1.1, 0.07],
      [0, 1.18, 0.09],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.18, 0.09], dir: [0, 0.35, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.235, 0.19], dir: [0, 0, 1], role: "jaw" });

  const band = (ch: ReturnType<typeof b.chain>, t: number, rad: number, th: number, color: string) => {
    const items = b.ring(ch.at(t), { count: 10, radius: rad }).items;
    return b.sweep(catmull(items, { closed: true }), th, { color });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Torso, surcoat, belt, skirt
  const torso = b.loft(
    [
      { at: [0, 0.5, 0.0], w: 0.3, h: 0.26 },
      { at: [0, 0.62, 0.01], w: 0.36, h: 0.31 },
      { at: [0, 0.78, 0.03], w: 0.44, h: 0.38 },
      { at: [0, 0.93, 0.05], w: 0.44, h: 0.38 },
      { at: [0, 1.03, 0.05], w: 0.31, h: 0.27 },
      { at: [0, 1.09, 0.05], w: 0.2, h: 0.2 },
    ],
    { bone: [hips, spine], color: SURCOAT },
  );

  b.decal(torso, DOVE, { at: [0, 0.87, 0.3], dir: [0, 0, 1], size: [0.21, 0.21] });
  b.decal(torso, VINE, { at: [0, 0.9, -0.3], dir: [0, 0, -1], size: [0.2, 0.26] });

  const tSurf = b.surface(torso);
  b.sweep(tSurf.loop([0, 0.655, 0], { lift: 0.012 }), 0.022, { color: GOLD });
  const buckleHit = tSurf.ray([0, 0.655, 1.2], [0, 0, -1])!;
  glow(b.stick(new THREE.BoxGeometry(0.085, 0.03, 0.065), GOLD, buckleHit, { embed: 0.3 }), 0.35);
  b.stick(new THREE.BoxGeometry(0.04, 0.034, 0.03), LAPIS, buckleHit.moved([0, 0.012, 0]), { embed: 0.1 });

  // Skirt: a flared shell with a dagged hem.
  b.lathe(
    [
      [0.215, 0.645],
      [0.3, 0.42],
      [0.282, 0.42],
      [0.195, 0.6],
    ],
    { at: [0, 0, 0], bone: hips, color: SURCOAT, segments: 16 },
  );
  const DAGS = 16;
  for (let i = 0; i < DAGS; i++) {
    const a = ((i + 0.5) / DAGS) * Math.PI * 2;
    b.extrude(out([-0.059, 0], [0.059, 0], [0, -0.075, "sharp"]), {
      at: [Math.sin(a) * 0.3, 0.432, Math.cos(a) * 0.3],
      x: [Math.cos(a), 0, -Math.sin(a)],
      thickness: 0.01,
      color: SURCOAT,
      bone: hips,
    });
  }

  // Gorget and mail collar
  b.lathe(
    [
      [0.17, 0.99],
      [0.185, 1.04],
      [0.14, 1.09],
      [0.115, 1.11],
      [0.095, 1.105],
      [0.115, 1.03],
    ],
    { at: [0, 0, 0.045], bone: chest, color: STEEL, segments: 14 },
  );
  b.part(new THREE.TorusGeometry(0.178, 0.011, 5, 16), GOLD, { at: [0, 1.012, 0.045], dir: [0, 1, 0], axis: "z", bone: chest });
  b.part(new THREE.TorusGeometry(0.112, 0.009, 5, 14), GOLD, { at: [0, 1.108, 0.045], dir: [0, 1, 0], axis: "z", bone: chest });
  b.lathe(
    [
      [0.1, 1.215],
      [0.12, 1.215],
      [0.158, 1.115],
      [0.14, 1.11],
    ],
    { at: [0, 0, 0.07], bone: head, color: MAIL, segments: 14 },
  );

  // Neck
  b.sweep(neck, [0.095, 0.078], { color: IRID });

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const HC = [0, 1.27, 0.1];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADP, {
    bone: head,
    at: HC,
    scale: [0.122, 0.118, 0.128],
  });

  const sk = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = sk.around(HC).at(s * 48, 0)!;
    b.decal(skull, EYE, { at: hit, size: [0.078, 0.078], mirror: s < 0, lift: 0.002 });
  }

  // Beak, cere, lower jaw
  b.sweep(
    [
      [0, 1.262, 0.2],
      [0, 1.246, 0.35],
    ],
    (t) => [0.027 * (1 - t) + 0.005, 0.021 * (1 - t) + 0.005],
    { bone: head, color: BEAK, caps: "point" },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), "#f4ecd8", { bone: head, at: [0, 1.283, 0.213], scale: [0.027, 0.02, 0.03] });
  b.sweep(
    [
      [0, 1.232, 0.19],
      [0, 1.226, 0.325],
    ],
    (t) => [0.02 * (1 - t) + 0.004, 0.014 * (1 - t) + 0.004],
    { bone: jaw, color: "#4a362d", caps: "point" },
  );

  // Helm: dome, brow ring, rear band, comb, rivets
  b.lathe(
    [
      [0, 0],
      [0.152, 0],
      [0.158, 0.025],
      [0.152, 0.07],
      [0.13, 0.115],
      [0.09, 0.15],
      [0.04, 0.172],
      [0, 0.18],
    ],
    { at: [0, 1.32, 0.095], bone: head, color: STEEL, segments: 14 },
  );
  b.part(new THREE.TorusGeometry(0.157, 0.011, 5, 18), GOLD, { at: [0, 1.322, 0.095], dir: [0, 1, 0], axis: "z", bone: head });
  const HR = 0.156;
  const hc = [0, 1.285, 0.095];
  b.sweep(
    arc(hc, [HR * Math.sin(75 * D), hc[1], hc[2] + HR * Math.cos(75 * D)], [0, 1, 0], 210),
    () => [0.012, 0.05],
    { bone: head, color: STEEL, section: "box", caps: "flat" },
  );
  b.extrude(
    out([-0.14, 0.07], [-0.1, 0.14], [-0.04, 0.178], [0.04, 0.178], [0.1, 0.14], [0.14, 0.07], [0.12, 0.15], [0.04, 0.215], [-0.04, 0.215], [-0.12, 0.15]),
    { at: [0, 1.32, 0.095], x: [0, 0, 1], thickness: 0.014, bevel: 0.003, color: GOLDP, bone: head },
  );
  const rivets: number[][] = [];
  for (let th = 85; th <= 275; th += 15) {
    const r = 0.169;
    rivets.push([r * Math.sin(th * D), 1.256, 0.095 + r * Math.cos(th * D)]);
    rivets.push([r * Math.sin(th * D), 1.314, 0.095 + r * Math.cos(th * D)]);
  }
  studs(rivets, 0.0085, GOLD, head);

  // Plume
  glow(b.part(new THREE.CylinderGeometry(0.03, 0.042, 0.055, 8), GOLD, { bone: head, at: [0, 1.505, 0.075] }), 0.3);
  const fan = [-62, -38, -16, 0, 16, 38, 62];
  fan.forEach((a, i) => {
    const d = V(Math.sin(a * D) * 0.85, Math.cos(a * D), -0.5 * Math.cos(a * D)).normalize();
    const len = 0.31 - (Math.abs(a) / 62) * 0.08;
    plane2(i % 2 ? PLUME_B : PLUME_R, 0.08, len, [0, 1.52, 0.085 + 0.004 * (3 - Math.abs(i - 3))], arr(d), head, [0, 0, 1]);
  });
  [-0.38, 0.38, 0].forEach((sx, i) => {
    const d = V(sx, 0.28, -1).normalize();
    plane2(i === 1 ? PLUME_B : PLUME_R, 0.08, 0.3, [sx * 0.05, 1.515, 0.06], arr(d), head, [0, 1, 0]);
  });

  // Mantling ribbons trailing from the helm
  for (const s of [1, -1]) {
    b.extrude(out([-0.032, 0], [0.032, 0], [0.034, -0.25], [0, -0.2, "sharp"], [-0.034, -0.25]), {
      at: [s * 0.05, 1.285, -0.082],
      x: [1, 0, 0],
      y: arr(V(0, 1, 0.3).normalize()),
      thickness: 0.01,
      color: s > 0 ? LAPIS : VERM,
      bone: head,
    });
    b.part(new THREE.BoxGeometry(0.076, 0.014, 0.022), GOLD, { bone: head, at: [s * 0.05, 1.282, -0.08] });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  const sides = [
    { s: 1, n: "L" },
    { s: -1, n: "R" },
  ];
  for (const { s, n } of sides) {
    const x = s * 0.1;
    const pts = limb([x, 0.55, 0], [x, 0.05, 0.03], [0.27, 0.27], [0, 0, 1]);
    const leg = b.chain(`leg${n}`, pts, {
      parent: hips,
      names: [`hip${n}`, `knee${n}`, `ankle${n}`],
      role: "leg",
      contact: [x, 0, 0.12],
    });
    b.sweep(leg, (t) => 0.07 - 0.02 * Math.min(t / 0.5, 1), { from: 0.02, to: 0.5, color: STEEL, caps: "flat" });
    b.sweep(leg, (t) => 0.05 - 0.012 * ((t - 0.5) / 0.3), { from: 0.5, to: 0.8, color: STEEL, caps: "flat" });
    b.sweep(leg, (t) => 0.026 - 0.006 * ((t - 0.45) / 0.55), { from: 0.45, to: 1, color: LEG });
    band(leg, 0.5, 0.054, 0.012, GOLD);
    band(leg, 0.8, 0.044, 0.011, GOLD);

    const knee = arr(pts[1]);
    b.part(new THREE.SphereGeometry(0.066, 8, 6), GOLDP, { bone: leg.joints[1], at: knee, scale: [1, 0.9, 1.05] });
    b.spike([knee[0], knee[1], knee[2] + 0.05], [0, 0.12, 1], 0.08, 0.03, { color: GOLD, bone: leg.joints[1] });

    // Foot: pad, four toes with claws
    const ank = leg.tip!;
    b.part(new THREE.SphereGeometry(0.032, 7, 5), LEG, { bone: ank, at: [x, 0.032, 0.04], scale: [1, 1, 1.3] });
    const toes: [string, number[], number[]][] = [
      [`toeIn${n}`, [x, 0.05, 0.04], [x - s * 0.045, 0.017, 0.2]],
      [`toeMid${n}`, [x, 0.05, 0.04], [x, 0.017, 0.23]],
      [`toeOut${n}`, [x, 0.05, 0.04], [x + s * 0.045, 0.017, 0.2]],
      [`toeBack${n}`, [x, 0.05, 0.01], [x, 0.017, -0.08]],
    ];
    for (const [name, base, tip] of toes) {
      const j = b.joint(name, { parent: ank, at: base, aim: tip, role: "digit" });
      b.capsule(base, tip, 0.017, { bone: j, color: LEG });
      const d = V(tip[0] - base[0], -0.12, tip[2] - base[2]).normalize();
      b.spike(tip, arr(d), 0.042, 0.011, { color: INK, bone: j });
    }
    b.spike([x, 0.075, -0.02], [0, 0.2, -1], 0.05, 0.012, { color: GOLD, bone: ank });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms (wings in armour), sword and shield
  for (const { s, n } of sides) {
    const SHp = [s * 0.25, 0.97, 0.0];
    const ELp = [s * 0.4, 0.82, 0.01];
    const WRp = [s * 0.54, 0.68, 0.06];
    const arm = b.chain(`arm${n}`, [SHp, ELp, WRp], {
      parent: chest,
      names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`],
      role: "arm",
    });
    const wrist = arm.tip!;
    const fore = arm.joints[1];
    const upper = arm.joints[0];

    b.sweep(arm, [0.052, 0.042], { color: PG });
    b.sweep(arm, (t) => 0.066 - 0.008 * (t / 0.5), { from: 0.08, to: 0.48, color: STEEL, caps: "flat" });
    b.sweep(arm, (t) => 0.058 - 0.012 * ((t - 0.52) / 0.41), { from: 0.52, to: 0.93, color: STEEL, caps: "flat" });
    band(arm, 0.5, 0.062, 0.012, GOLD);
    band(arm, 0.93, 0.05, 0.012, GOLD);
    b.part(new THREE.SphereGeometry(0.05, 8, 6), GOLDP, { bone: fore, at: ELp, scale: [1, 0.9, 1] });
    b.spike(ELp, [s, 0.05, -0.35], 0.075, 0.024, { color: GOLD, bone: fore });

    // Pauldron: two lames, a gold rim and a boss
    const axisV = V(s * 0.55, 0.8, 0.05).normalize();
    const c = V(s * 0.255, 0.985, 0).addScaledVector(axisV, -0.035);
    b.lathe(
      [[0, 0], [0.118, 0], [0.124, 0.02], [0.108, 0.062], [0.072, 0.098], [0.032, 0.115], [0, 0.118]],
      { at: arr(c), axis: arr(axisV), bone: upper, color: STEEL, segments: 12 },
    );
    const c2 = c.clone().addScaledVector(axisV, 0.05);
    b.lathe(
      [[0, 0], [0.085, 0], [0.09, 0.02], [0.07, 0.055], [0.035, 0.075], [0, 0.078]],
      { at: arr(c2), axis: arr(axisV), bone: upper, color: STEEL, segments: 10 },
    );
    b.part(new THREE.TorusGeometry(0.122, 0.011, 5, 14), GOLD, { at: arr(c), dir: arr(axisV), axis: "z", bone: upper });
    b.part(new THREE.ConeGeometry(0.03, 0.075, 6), GOLD, {
      at: arr(c.clone().addScaledVector(axisV, 0.155)),
      dir: arr(axisV),
      bone: upper,
    });

    // Gauntlet cuff at the wrist
    const fdir = V(WRp[0] - ELp[0], WRp[1] - ELp[1], WRp[2] - ELp[2]).normalize();
    b.part(new THREE.CylinderGeometry(0.046, 0.052, 0.07, 8), STEEL, { bone: wrist, at: WRp, dir: arr(fdir) });

    // Primary feathers: separated digits fanning from the wrist
    const D0 = V(s * 0.5, -1, 0).normalize();
    const fanA = [-34, -17, 0, 17, 34];
    const lens = [0.2, 0.25, 0.28, 0.25, 0.2];
    fanA.forEach((a, i) => {
      const ca = Math.cos(a * D);
      const sa = Math.sin(a * D);
      const d = V(D0.x * ca - D0.y * sa, D0.x * sa + D0.y * ca, 0);
      const base = [WRp[0], WRp[1] + 0.01, WRp[2] + 0.004 * (2 - Math.abs(i - 2))];
      const j = b.joint(`primary${i + 1}${n}`, { parent: wrist, at: base, dir: arr(d), role: "digit" });
      plane2(WING_TEX, 0.075, lens[i], base, arr(d), j, [0, 0, 1]);
    });

    // Secondaries hanging behind the forearm
    for (let i = 0; i < 6; i++) {
      const base = lp(ELp, WRp, 0.12 + i * 0.14);
      base[1] -= 0.035;
      base[2] -= 0.04 + 0.004 * i;
      const d = V(s * (0.42 - i * 0.04), -1, 0).normalize();
      plane2(WING_TEX, 0.07, 0.15 + 0.022 * i, base, arr(d), fore, [0, 0, 1]);
    }

    if (s < 0) {
      // Sword
      const dirS = V(-0.06, 1, 0.16).normalize();
      const along = (d: number) => [WRp[0] + dirS.x * d, WRp[1] + dirS.y * d, WRp[2] + dirS.z * d];
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.15, 8), LEATHER, { bone: wrist, at: along(0), dir: arr(dirS) });
      glow(b.part(new THREE.SphereGeometry(0.032, 8, 6), GOLD, { bone: wrist, at: along(-0.09) }), 0.3);
      glow(b.part(new THREE.BoxGeometry(0.2, 0.026, 0.03), GOLD, { bone: wrist, at: along(0.085), dir: arr(dirS) }), 0.3);
      studs([[WRp[0] + 0.1, 0, 0], [WRp[0] - 0.1, 0, 0]].map((q, k) => {
        const p = along(0.085);
        return [p[0] + (k ? -0.1 : 0.1), p[1], p[2]];
      }), 0.02, GOLD, wrist);
      const side = dirS.clone().cross(V(0, 0, 1)).normalize();
      const blade = b.extrude(out([-0.03, 0], [0.03, 0], [0.032, 0.38], [0, 0.52, "sharp"], [-0.032, 0.38]), {
        at: along(0.1),
        x: arr(side),
        y: arr(dirS),
        thickness: 0.014,
        bevel: 0.004,
        color: BLADE,
        bone: wrist,
      });
      b.part(new THREE.PlaneGeometry(0.024, 0.3), "#ffffff", {
        at: blade.local([0, 0.22, 0.0085]),
        dir: arr(blade.axis),
        axis: "z",
        up: arr(dirS),
        texture: INSCR,
        bone: wrist,
      });
    } else {
      // Shield strapped to the forearm
      const sy = 18 * D;
      const SC = [0.43, 0.72, 0.17];
      const shield = b.extrude(
        out([-0.17, 0.16, "sharp"], [0.17, 0.16, "sharp"], [0.17, -0.02], [0.11, -0.18], [0, -0.3, "sharp"], [-0.11, -0.18], [-0.17, -0.02]),
        { at: SC, x: [Math.cos(sy), 0, -Math.sin(sy)], thickness: 0.03, bevel: 0.006, smoothing: 1, color: GOLDP, bone: wrist },
      );
      b.part(new THREE.PlaneGeometry(0.3, 0.42), "#ffffff", {
        at: shield.local([0, -0.07, 0.0158]),
        dir: arr(shield.axis),
        axis: "z",
        up: [0, 1, 0],
        texture: SHIELD_TEX,
        bone: wrist,
      });
      const sp: number[][] = [
        [-0.15, 0.14], [0.15, 0.14], [0, 0.147], [-0.158, -0.02], [0.158, -0.02], [-0.1, -0.17], [0.1, -0.17],
      ].map(([u, v]) => arr(shield.local([u, v, 0.019])));
      studs(sp, 0.012, GOLD, wrist);
      b.rod(lp(ELp, WRp, 0.3), arr(shield.local([0, 0.05, -0.016])), 0.012, LEATHER, { bone: fore });
      b.rod(lp(ELp, WRp, 0.75), arr(shield.local([0.03, -0.1, -0.016])), 0.012, LEATHER, { bone: fore });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail fan
  const tail = b.chain(
    "tail",
    [
      [0, 0.68, -0.14],
      [0, 0.67, -0.3],
      [0, 0.64, -0.46],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, [0.06, 0.045], { color: PG });
  const TN = 9;
  for (let i = 0; i < TN; i++) {
    const a = (-48 + (96 * i) / (TN - 1)) * D;
    const P = 14 * D;
    const d = V(Math.sin(a) * Math.cos(P), -Math.sin(P), -Math.cos(a) * Math.cos(P)).normalize();
    const len = 0.42 - (Math.abs(a / D) / 48) * 0.06;
    const base = [0, 0.69 + 0.005 * (4 - Math.abs(i - 4)), -0.185];
    plane2(TAIL_TEX, 0.1, len, base, arr(d), tail.joints[i % 2], [0, 1, 0]);
  }

  return b.root;
}
```