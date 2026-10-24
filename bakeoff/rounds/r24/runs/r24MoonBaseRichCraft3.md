```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  arc,
  catmull,
  cells,
  countershade,
  createBuilder,
  mix,
  noise,
  paint,
  polyline,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Luna Station One",
  description:
    "A 1950s retro-futurist moon base diorama: a lattice-glass biodome with an atom-lamp garden, riveted habitat tubes and lab pod, atomic-age fuel spheres, a candy-striped radio mast with dish and Sputnik beacon, a checkered finned rocket on its pad, a moon buggy, a fishbowl-helmet astronaut and a flag, all on a cratered regolith plinth.",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "luna-station-one", paintSize: 2048 });
  const rnd = rng(1957);
  const TAU = Math.PI * 2;
  const rad = (d: number) => (d * Math.PI) / 180;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const G = 0.1; // regolith surface height

  // ------------------------------------------------------------------ palette
  const TEAL = "#2eb3a6";
  const TEAL_D = "#15706c";
  const TEAL_L = "#8fe0d2";
  const CREAM = "#f3e9cf";
  const CORAL = "#e65a40";
  const CORAL_D = "#a63a2c";
  const MUSTARD = "#f2b134";
  const INK = "#23303a";
  const AMBER = "#ffb347";
  const GREEN = "#4fa66a";
  const GREEN_L = "#86d27c";
  const BROWN = "#7b4a2a";
  const AQUA = "#bfe9e6";
  const BRACE = "#eee6cf";
  const TYRE = "#2c3338";

  // ------------------------------------------------------------------ paints
  const CHROME_P = metal("steel", { polish: 0.8, tarnish: 0.05 });
  const STEEL_D = metal("iron", { polish: 0.3 });
  const CREAM_HULL = panelled(countershade(CREAM, "#cfc2a0", { level: -0.1 }), {
    size: 0.09,
    aspect: 0.8,
    rivets: 0.022,
    seam: "#8e8468",
  });
  const TEAL_HULL = panelled(countershade(TEAL, TEAL_D, { level: -0.1 }), {
    size: 0.09,
    aspect: 0.8,
    rivets: 0.022,
    seam: TEAL_D,
  });
  const CORAL_HULL = panelled(countershade(CORAL, CORAL_D, { level: -0.1 }), {
    size: 0.08,
    rivets: 0.02,
    seam: CORAL_D,
  });

  const REG = paint((p, n) => {
    const big = noise(p, 0.3, 3);
    const fine = noise(p, 0.035, 8);
    let c = mix("#8b8782", "#c2bcb0", smoothstep(0.3, 0.75, big) * 0.7 + fine * 0.3);
    const k = cells(p, 0.11, 5);
    if (k.id > 0.55) {
      c = mix(c, "#5f5b59", 0.55 * smoothstep(0.22, 0.14, k.d1));
      if (k.d1 > 0.2 && k.d1 < 0.3) c = mix(c, "#d8d2c4", 0.22);
    }
    return mix(c, "#6e6a68", 0.35 * smoothstep(0.7, 0.2, n.y));
  });
  const ROCK = paint((p, n) =>
    mix(mix("#6f6a66", "#a29c92", noise(p, 0.05, 2)), "#4c4845", 0.45 * smoothstep(0.5, -0.5, n.y)),
  );
  const PLINTH = paint((p) =>
    p.y < 0.012 ? INK : p.y < 0.03 ? TEAL : p.y < 0.037 ? CREAM : p.y < 0.05 ? CORAL : TEAL_D,
  );

  // ------------------------------------------------------------------ textures
  let domeLines = "";
  for (let k = 0; k < 12; k++) {
    const x = k * 20;
    domeLines += k % 2 ? `M${x} 53.3L${x + 20} 80` : `M${x} 80L${x + 20} 53.3`;
    domeLines += k % 2 ? `M${x} 26.7L${x + 20} 53.3` : `M${x} 53.3L${x + 20} 26.7`;
    domeLines += `M${x} 26.7L${x + 10} 3L${x + 20} 26.7`;
  }
  let glints = "";
  for (const k of [1, 4, 6, 9, 11]) {
    const x = k * 20;
    glints += `<path d="M${x + 5} 74L${x + 8} 72L${x + 13} 60L${x + 10} 61Z" fill="#eafcff"/>`;
    glints += `<path d="M${x + 12} 46L${x + 14} 45L${x + 17} 38L${x + 15} 38.5Z" fill="#eafcff"/>`;
  }
  const DOME = svg(
    `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
      <path d="${domeLines}" fill="none" stroke="#f3e9cf" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="0" y="76.5" width="240" height="3.5" fill="#f3e9cf"/>${glints}</svg>`,
    { size: 1440 },
  );

  const PORT = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="w" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff2b8"/><stop offset=".55" stop-color="#ffb347"/><stop offset="1" stop-color="#e5702f"/></radialGradient></defs>
      <circle cx="32" cy="32" r="31" fill="#f3e9cf" stroke="#23303a" stroke-width="2"/>
      <circle cx="32" cy="32" r="22" fill="url(#w)" stroke="#23303a" stroke-width="2.6"/>
      <path d="M26 46 Q32 29 38 46Z" fill="#7a3a1c"/>
      <path d="M20 24 Q26 17 35 16" stroke="#ffffff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <g fill="#8e8468"><circle cx="32" cy="4.5" r="1.8"/><circle cx="32" cy="59.5" r="1.8"/><circle cx="4.5" cy="32" r="1.8"/><circle cx="59.5" cy="32" r="1.8"/>
      <circle cx="12.5" cy="12.5" r="1.8"/><circle cx="51.5" cy="12.5" r="1.8"/><circle cx="12.5" cy="51.5" r="1.8"/><circle cx="51.5" cy="51.5" r="1.8"/></g></svg>`,
    { size: 192 },
  );

  const HATCH = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 79V30Q3 3 30 3Q57 3 57 30V79Z" fill="#15706c" stroke="#f3e9cf" stroke-width="3.4"/>
      <path d="M9 79V31Q9 9 30 9Q51 9 51 31V79Z" fill="#2eb3a6" stroke="#23303a" stroke-width="1.6"/>
      <circle cx="30" cy="30" r="9.5" fill="#ffb347" stroke="#f3e9cf" stroke-width="3"/>
      <path d="M26 27 Q28 24 32 24" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
      <g fill="none" stroke="#e65a40" stroke-width="3.2" stroke-linejoin="round"><path d="M16 52L30 44L44 52"/><path d="M16 64L30 56L44 64"/><path d="M16 76L30 68L44 76"/></g>
      <circle cx="44" cy="46" r="3" fill="#f2b134" stroke="#23303a" stroke-width="1"/></svg>`,
    { size: 256 },
  );

  const ATOM = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#e65a40" stroke="#f3e9cf" stroke-width="3"/>
      <g fill="none" stroke="#f3e9cf" stroke-width="2.6"><ellipse cx="32" cy="32" rx="22" ry="8.5"/>
      <ellipse cx="32" cy="32" rx="22" ry="8.5" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="22" ry="8.5" transform="rotate(120 32 32)"/></g>
      <circle cx="32" cy="32" r="5.5" fill="#f2b134" stroke="#23303a" stroke-width="1.4"/></svg>`,
    { size: 160 },
  );

  const PLAQUE = svg(
    `<svg viewBox="0 0 160 20" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="158" height="18" rx="2.5" fill="#d9a441" stroke="#7a5314" stroke-width="1.6"/>
      <rect x="4" y="4" width="152" height="12" rx="1.5" fill="none" stroke="#7a5314" stroke-width="0.7"/>
      <text x="80" y="10.4" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="8" fill="#3b2608" letter-spacing="1.2">LUNA STATION ONE</text>
      <text x="80" y="14.6" text-anchor="middle" font-family="Georgia, serif" font-size="3.6" fill="#3b2608" letter-spacing="0.6">INTERPLANETARY SOCIETY - EST. A.D. 1959</text></svg>`,
    { size: 1024 },
  );

  let star = "";
  for (let i = 0; i < 10; i++) {
    const a = rad(-90 + i * 36);
    const r = i % 2 ? 4.4 : 11;
    star += `${(32 + Math.cos(a) * r).toFixed(2)},${(32 + Math.sin(a) * r).toFixed(2)} `;
  }
  const ROUNDEL = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#e65a40" stroke="#23303a" stroke-width="2"/>
      <circle cx="32" cy="32" r="22" fill="#f3e9cf"/><circle cx="32" cy="32" r="16" fill="#2eb3a6"/>
      <polygon points="${star}" fill="#f3e9cf" stroke="#23303a" stroke-width="1"/></svg>`,
    { size: 192 },
  );

  const LUNA = svg(
    `<svg viewBox="0 0 24 100" xmlns="http://www.w3.org/2000/svg" font-family="Arial Black, Impact, sans-serif" font-weight="bold" font-size="22" text-anchor="middle" fill="#23303a">
      <text x="12" y="22">L</text><text x="12" y="46">U</text><text x="12" y="70">N</text><text x="12" y="94">A</text></svg>`,
    { size: 400 },
  );

  let rays = "";
  for (let i = 0; i < 16; i++) {
    const a = rad(i * 22.5);
    rays += `<path d="M50 32.5L${(50 + Math.cos(a) * 80).toFixed(1)} ${(32.5 + Math.sin(a) * 80).toFixed(1)}"/>`;
  }
  const FLAG = svg(
    `<svg viewBox="0 0 100 65" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="65" fill="#2eb3a6"/>
      <g stroke="#f2b134" stroke-width="2.6" opacity="1">${rays}</g>
      <rect width="100" height="65" fill="none" stroke="#f3e9cf" stroke-width="5"/>
      <circle cx="50" cy="32.5" r="19" fill="#f3e9cf" stroke="#23303a" stroke-width="2"/>
      <circle cx="50" cy="32.5" r="13" fill="#e65a40"/>
      <g fill="none" stroke="#f3e9cf" stroke-width="2"><ellipse cx="50" cy="32.5" rx="26" ry="7" transform="rotate(-25 50 32.5)"/></g>
      <circle cx="50" cy="32.5" r="3.4" fill="#f2b134"/></svg>`,
    { size: 512 },
  );

  const SCREEN = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="48" rx="4" fill="#07231c" stroke="#23303a" stroke-width="2"/>
      <g fill="none" stroke="#58f0a8" stroke-width="1.2"><circle cx="32" cy="24" r="8"/><circle cx="32" cy="24" r="15"/><circle cx="32" cy="24" r="21"/>
      <path d="M32 3V45M11 24H53"/></g>
      <path d="M32 24L56 12A27 27 0 0 1 58 24Z" fill="#2fbf82"/>
      <circle cx="44" cy="14" r="2" fill="#ffffff"/><circle cx="23" cy="33" r="1.8" fill="#ffffff"/><circle cx="38" cy="30" r="1.5" fill="#ffffff"/></svg>`,
    { size: 256 },
  );

  let solarGrid = "";
  for (let i = 1; i < 8; i++) solarGrid += `<path d="M${i * 8} 4V44"/>`;
  for (let j = 1; j < 6; j++) solarGrid += `<path d="M4 ${4 + j * 6.67}H60"/>`;
  const SOLAR = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="48" fill="#f3e9cf"/><rect x="3" y="3" width="58" height="42" fill="#1e3f8a"/>
      <path d="M3 45L30 3H44L17 45Z" fill="#3a66c2"/>
      <g stroke="#e8d27a" stroke-width="1.1">${solarGrid}</g></svg>`,
    { size: 256 },
  );

  const VISOR = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".55" stop-color="#e29a2a"/><stop offset=".56" stop-color="#7a4413"/><stop offset="1" stop-color="#4a280c"/></linearGradient></defs>
      <ellipse cx="32" cy="24" rx="30" ry="22" fill="url(#v)" stroke="#23303a" stroke-width="3.4"/>
      <path d="M14 18Q20 10 30 9" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="44" cy="15" r="2.6" fill="#ffffff"/></svg>`,
    { size: 192 },
  );

  // ------------------------------------------------------------------ helpers
  const part = (geo: THREE.BufferGeometry, color: ColorInput, at: Any, o: Any = {}) =>
    b.part(geo, color, { at, flat: true, ...o });
  const box = (w: number, h: number, d: number, color: ColorInput, at: Any, o: Any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: ColorInput, at: Any, o: Any = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const ball = (r: number, color: ColorInput, at: Any, o: Any = {}, ws = 10, hs = 7) =>
    part(new THREE.SphereGeometry(r, ws, hs), color, at, o);
  const rod = (a: Any, c: Any, r: number | [number, number], color: ColorInput, sides = 5) =>
    b.rod(a, c, r, { color, sides });
  const basis = (n: THREE.Vector3): [THREE.Vector3, THREE.Vector3] => {
    const nn = n.clone().normalize();
    const t = Math.abs(nn.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
    const u = t.clone().cross(nn).normalize();
    return [u, nn.clone().cross(u)];
  };
  const circlePath = (c: THREE.Vector3, nrm: THREE.Vector3, r: number, n = 16) => {
    const [u, v] = basis(nrm);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      pts.push(c.clone().addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r));
    }
    return catmull(pts, { closed: true });
  };
  const ringTube = (c: THREE.Vector3, nrm: THREE.Vector3, r: number, tube: number, color: ColorInput, n = 16) =>
    b.sweep(circlePath(c, nrm, r, n), tube, { color, sides: 5 });
  const band = (at: Any, axis: Any, r: number, w: number, h: number, color: ColorInput, seg = 12) =>
    b.lathe(
      [
        [r, -w / 2],
        [r + h, -w / 2],
        [r + h, w / 2],
        [r, w / 2],
      ],
      { at, axis, segments: seg, color },
    );

  // ------------------------------------------------------------------ plinth + regolith
  const plinth = b.lathe(
    [
      [0, 0],
      [0.69, 0],
      [0.69, 0.045],
      [0.655, 0.058],
      [0.645, 0.066],
      [0, 0.066],
    ],
    { at: [0, 0, 0], segments: 32, color: PLINTH },
  );
  band([0, 0.0285, 0], UP, 0.688, 0.008, 0.006, CHROME_P, 32);
  b.decal(plinth, PLAQUE, { at: [0, 0.022, 0.69], dir: [0, 0, 1], size: [0.28, 0.035] });

  b.lathe(
    [
      [0, 0.06],
      [0.625, 0.06],
      [0.625, 0.092],
      [0.57, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], segments: 36, color: REG },
  );

  // exclusion zones for scattered rocks (x, z, radius)
  const zones: [number, number, number][] = [
    [0, 0, 0.3],
    [0.52, 0, 0.17],
    [-0.43, 0, 0.11],
    [-0.47, 0.17, 0.11],
    [-0.36, 0.27, 0.1],
    [-0.28, -0.34, 0.15],
    [-0.23, -0.17, 0.09],
    [0.31, 0.31, 0.19],
    [-0.2, 0.4, 0.12],
    [-0.04, 0.44, 0.07],
    [0.15, 0.42, 0.1],
    [0.4, -0.3, 0.11],
  ];
  const blocked = (x: number, z: number, pad = 0) =>
    zones.some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r + pad) ||
    (Math.abs(z) < 0.09 && x > -0.45 && x < 0.6);

  const crater = (x: number, z: number, r: number) => {
    const prof = (
      [
        [0, 0],
        [1.0, 0],
        [0.94, 0.07],
        [0.78, 0.11],
        [0.45, 0.02],
        [0, 0.012],
      ] as [number, number][]
    ).map(([a, h]) => [a * r, h * r] as [number, number]);
    const pnt = paint((p) => {
      const d = Math.hypot(p.x - x, p.z - z) / r;
      return d < 0.55 ? "#5f5b59" : d > 0.8 ? "#cfc9bc" : "#8a8680";
    });
    return b.lathe(prof, { at: [x, G + 0.0005, z], segments: 14, color: pnt });
  };
  crater(0.0, -0.43, 0.09);
  crater(-0.46, -0.2, 0.05);
  crater(0.22, -0.45, 0.06);
  crater(0.5, 0.2, 0.045);

  const rock = (x: number, z: number, s: number, k: number) =>
    part(new THREE.IcosahedronGeometry(s, 0), ROCK, [x, G + s * 0.25, z], {
      scale: [1.25, 0.7, 0.95],
      rotation: [k * 20, k * 57, k * 13],
    });
  let placed = 0;
  for (let t = 0; t < 400 && placed < 8; t++) {
    const a = rnd() * TAU;
    const d = Math.sqrt(rnd()) * 0.55;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (blocked(x, z, 0.04)) continue;
    rock(x, z, 0.016 + rnd() * 0.022, rnd() * 6);
    placed++;
  }
  const pebbles: THREE.BufferGeometry[] = [];
  for (let t = 0; t < 900 && pebbles.length < 70; t++) {
    const a = rnd() * TAU;
    const d = Math.sqrt(rnd()) * 0.56;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (blocked(x, z, 0.02)) continue;
    const s = 0.004 + rnd() * rnd() * 0.014;
    const g = new THREE.IcosahedronGeometry(s, 0);
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        V(x, G + s * 0.2, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 6, rnd() * 3)),
        V(1.2, 0.7, 0.95),
      ),
    );
    pebbles.push(g);
  }
  const pebbleMerged = mergeGeometries(pebbles);
  if (pebbleMerged) b.part(pebbleMerged, ROCK, { at: [0, 0, 0] });

  // ================================================================== BIODOME
  const DR = 0.245; // glass radius
  const dc = V(0, G + 0.05, 0);
  const yF = G + 0.03; // dome floor
  const drumPaint = paint((p, n) =>
    n.y > 0.9 && p.y < G + 0.035
      ? (Math.floor(p.x / 0.03) + Math.floor(p.z / 0.03)) & 1
        ? TEAL_L
        : CREAM
      : CREAM_HULL,
  );
  const drum = b.lathe(
    [
      [0, 0],
      [0.265, 0],
      [0.265, 0.044],
      [0.253, 0.05],
      [0.24, 0.05],
      [0.238, 0.03],
      [0, 0.03],
    ],
    { at: [0, G, 0], segments: 32, color: drumPaint },
  );
  for (const a of [-60, -25, 25, 60, 150, 210]) {
    const d = V(Math.sin(rad(a)), 0, Math.cos(rad(a)));
    if (Math.abs(a) < 90)
      b.decal(drum, ATOM, {
        at: [d.x * 0.265, G + 0.022, d.z * 0.265],
        dir: [d.x, 0, d.z],
        size: [0.034, 0.034],
      });
  }
  // rim lights
  const bulbs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    bulbs.push(new THREE.SphereGeometry(0.0065, 6, 4).translate(Math.cos(a) * 0.262, G + 0.047, Math.sin(a) * 0.262));
  }
  const bulbMerged = mergeGeometries(bulbs);
  if (bulbMerged) glow(b.part(bulbMerged, AMBER, { at: [0, 0, 0] }), 1.3);

  // glass hemisphere (drawn lattice, transparent panes)
  b.part(new THREE.SphereGeometry(DR, 24, 8, 0, TAU, 0, Math.PI / 2), "#ffffff", {
    at: dc,
    texture: DOME,
    flat: true,
  });
  ringTube(dc.clone(), UP, DR + 0.004, 0.0085, CHROME_P, 24);
  for (const el of [30, 60]) {
    ringTube(
      dc.clone().add(V(0, Math.sin(rad(el)) * DR, 0)),
      UP,
      Math.cos(rad(el)) * (DR + 0.002),
      0.0038,
      CREAM,
      20,
    );
  }
  for (let k = 0; k < 12; k++) {
    const ang = (TAU * k) / 12;
    const dir = V(-Math.cos(ang), 0, Math.sin(ang));
    const axis = dir.clone().cross(UP);
    const from = dc.clone().addScaledVector(dir, DR + 0.003);
    b.sweep(arc(dc, from, axis, 90), 0.0052, { color: CREAM, sides: 5 });
  }
  const apex = dc.clone().add(V(0, DR + 0.003, 0));
  cyl(0.02, 0.028, 0.014, 8, CHROME_P, apex.clone().add(V(0, 0.002, 0)));
  part(new THREE.ConeGeometry(0.007, 0.06, 6), CHROME_P, apex.clone().add(V(0, 0.04, 0)));
  glow(ball(0.01, AMBER, apex.clone().add(V(0, 0.075, 0))), 1.6);

  // interior: atom tower, saucer, garden
  b.lathe(
    [
      [0, 0],
      [0.02, 0],
      [0.014, 0.04],
      [0.009, 0.11],
      [0.006, 0.16],
      [0, 0.16],
    ],
    { at: [0, yF, 0], segments: 8, color: TEAL_L },
  );
  b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.058, 0.006],
      [0.052, 0.012],
      [0.02, 0.017],
      [0, 0.017],
    ],
    { at: [0, yF + 0.09, 0], segments: 12, color: MUSTARD },
  );
  const atomC = V(0, yF + 0.18, 0);
  glow(ball(0.02, AMBER, atomC), 1.6);
  ringTube(atomC, V(1, 0, 0), 0.036, 0.0025, CORAL, 16);
  ringTube(atomC, V(0.5, 0.8, 0.3), 0.036, 0.0025, CREAM, 16);
  ringTube(atomC, V(-0.4, 0.7, 0.6), 0.036, 0.0025, MUSTARD, 16);
  [35, 140, 215, 300].forEach((deg, i) => {
    const x = Math.cos(rad(deg)) * 0.15;
    const z = Math.sin(rad(deg)) * 0.15;
    const h = 0.05 + (i % 2) * 0.025;
    cyl(0.026, 0.022, 0.014, 8, TEAL_D, [x, yF + 0.007, z]);
    cyl(0.004, 0.005, 0.03, 5, BROWN, [x, yF + 0.029, z]);
    part(new THREE.ConeGeometry(0.026, h, 7), GREEN, [x, yF + 0.04 + h / 2, z]);
    part(new THREE.ConeGeometry(0.018, h * 0.8, 7), GREEN_L, [x, yF + 0.04 + h * 0.85, z]);
  });
  // mini planters between the trees
  [85, 255].forEach((deg) => {
    const x = Math.cos(rad(deg)) * 0.12;
    const z = Math.sin(rad(deg)) * 0.12;
    box(0.04, 0.016, 0.02, CORAL, [x, yF + 0.008, z], { rotation: [0, -deg, 0] });
    ball(0.014, MUSTARD, [x, yF + 0.024, z], {}, 6, 4);
  });

  // ================================================================== HABITAT TUBES
  const PX = 0.52; // lab pod centre x
  const tubeY = G + 0.06;
  const tubeA = b.sweep(polyline([V(0.215, tubeY, 0), V(0.4, tubeY, 0)]), 0.06, {
    caps: "flat",
    sides: 12,
    smooth: false,
    color: CREAM_HULL,
  });
  band([0.255, tubeY, 0], [1, 0, 0], 0.058, 0.022, 0.014, CORAL);
  band([0.385, tubeY, 0], [1, 0, 0], 0.058, 0.022, 0.014, CORAL);
  band([0.32, tubeY, 0], [1, 0, 0], 0.058, 0.008, 0.006, MUSTARD);
  for (const x of [0.29, 0.35])
    glow(b.decal(tubeA, PORT, { at: [x, tubeY, 0.062], dir: [0, 0, 1], size: [0.032, 0.032] }), 0.9);

  const podPaint = paint((p) => (p.y > G + 0.108 ? TEAL_HULL : CREAM_HULL));
  const pod = b.lathe(
    [
      [0, 0],
      [0.135, 0],
      [0.135, 0.105],
      [0.122, 0.118],
      [0.07, 0.13],
      [0.04, 0.145],
      [0, 0.145],
    ],
    { at: [PX, G, 0], segments: 12, color: podPaint },
  );
  band([PX, G + 0.014, 0], UP, 0.133, 0.014, 0.006, CORAL);
  band([PX, G + 0.108, 0], UP, 0.123, 0.01, 0.014, MUSTARD);
  b.decal(pod, HATCH, { at: [PX, G + 0.045, 0.135], dir: [0, 0, 1], size: [0.055, 0.075] });
  for (const s of [1, -1]) {
    const d = V(s * 0.7071, 0, 0.7071);
    if (s > 0)
      glow(
        b.decal(pod, PORT, {
          at: [PX + d.x * 0.135, G + 0.075, d.z * 0.135],
          dir: [d.x, 0, d.z],
          size: [0.03, 0.03],
        }),
        0.9,
      );
  }
  box(0.1, 0.012, 0.05, CHROME_P, [PX, G + 0.006, 0.16]);
  box(0.07, 0.012, 0.03, CHROME_P, [PX, G + 0.002, 0.2]);
  // roof gear: radar bar, beacon
  cyl(0.006, 0.008, 0.045, 6, CHROME_P, [PX, G + 0.165, 0]);
  box(0.14, 0.012, 0.012, CORAL, [PX, G + 0.19, 0], { rotation: [0, 28, 0] });
  box(0.02, 0.01, 0.014, MUSTARD, [PX, G + 0.19, 0], { rotation: [0, 28, 0] });
  glow(ball(0.008, "#ff5b4a", [PX + 0.07, G + 0.14, 0.03]), 1.6);

  // tube B + hub
  const tubeBy = G + 0.05;
  const tubeB = b.sweep(polyline([V(-0.215, tubeBy, 0), V(-0.37, tubeBy, 0)]), 0.05, {
    caps: "flat",
    sides: 12,
    smooth: false,
    color: TEAL_HULL,
  });
  band([-0.255, tubeBy, 0], [1, 0, 0], 0.048, 0.02, 0.012, CREAM);
  band([-0.345, tubeBy, 0], [1, 0, 0], 0.048, 0.02, 0.012, CREAM);
  glow(b.decal(tubeB, PORT, { at: [-0.3, tubeBy, 0.052], dir: [0, 0, 1], size: [0.028, 0.028] }), 0.9);

  const hubPaint = paint((p) => (p.y > G + 0.13 ? CORAL_HULL : CREAM_HULL));
  const hub = b.lathe(
    [
      [0, 0],
      [0.08, 0],
      [0.08, 0.135],
      [0.065, 0.15],
      [0.03, 0.16],
      [0, 0.16],
    ],
    { at: [-0.43, G, 0], segments: 12, color: hubPaint },
  );
  band([-0.43, G + 0.02, 0], UP, 0.079, 0.012, 0.005, MUSTARD);
  glow(b.decal(hub, PORT, { at: [-0.43, G + 0.095, 0.08], dir: [0, 0, 1], size: [0.03, 0.03] }), 0.9);
  cyl(0.004, 0.004, 0.04, 5, CHROME_P, [-0.43, G + 0.18, 0]);
  glow(ball(0.007, "#ff5b4a", [-0.43, G + 0.205, 0]), 1.6);

  // fuel spheres
  const tank = (cx: number, cz: number, r: number, bandCol: ColorInput, hubSide: number) => {
    const cy = G + 0.045 + r;
    ball(r, CHROME_P, [cx, cy, cz], {}, 14, 10);
    band([cx, cy, cz], UP, r * 0.97, 0.014, r * 0.03 + 0.004, bandCol, 14);
    cyl(0.018, 0.022, 0.012, 8, CORAL, [cx, cy + r + 0.002, cz]);
    ball(0.007, MUSTARD, [cx, cy + r + 0.014, cz], {}, 6, 4);
    for (let k = 0; k < 4; k++) {
      const a = rad(45 + k * 90);
      const top = V(cx + Math.cos(a) * r * 0.707, cy - r * 0.707, cz + Math.sin(a) * r * 0.707);
      const foot = V(cx + Math.cos(a) * r * 0.95, G + 0.004, cz + Math.sin(a) * r * 0.95);
      rod(top, foot, 0.0045, CHROME_P);
      cyl(0.011, 0.012, 0.006, 6, STEEL_D, [foot.x, G + 0.003, foot.z]);
    }
    ringTube(V(cx, (cy - r * 0.707 + G + 0.004) / 2, cz), UP, r * 0.83, 0.003, CHROME_P, 12);
    // feed pipe from hub
    const pipe = catmull([
      V(-0.43 - hubSide * 0.02, G + 0.03, 0.078),
      V(cx * 0.4 - 0.43 * 0.6, G + 0.012, cz * 0.45 + 0.06),
      V(cx, G + 0.012, cz - r * 0.5),
      V(cx, G + 0.046, cz),
    ]);
    b.sweep(pipe, 0.0065, { color: MUSTARD, sides: 6 });
    b.sweep(pipe.slice(0.4, 0.45), 0.0095, { color: CORAL, sides: 6, caps: "flat" });
  };
  tank(-0.47, 0.17, 0.075, CORAL, 1);
  tank(-0.36, 0.27, 0.058, MUSTARD, 0);

  // ================================================================== RADIO MAST
  const AX = -0.28;
  const AZ = -0.34;
  const AY = G + 0.02;
  const MH = 0.66;
  b.lathe(
    [
      [0, 0],
      [0.125, 0],
      [0.125, 0.012],
      [0.1, 0.02],
      [0, 0.02],
    ],
    { at: [AX, G, AZ], segments: 6, color: TEAL_HULL },
  );
  const legAng = [90, 210, 330].map(rad);
  const legAt = (i: number, h: number) => {
    const r = 0.1 + (0.018 - 0.1) * (h / MH);
    return V(AX + Math.cos(legAng[i]) * r, AY + h, AZ + Math.sin(legAng[i]) * r);
  };
  const LEGP = paint((p) => ((Math.floor((p.y - AY) / 0.066) & 1) ? CREAM : CORAL));
  const L = [0, 0.13, 0.26, 0.39, 0.52, 0.66];
  for (let i = 0; i < 3; i++) {
    b.rod(legAt(i, 0), legAt(i, MH), [0.009, 0.005], { color: LEGP, sides: 5 });
    cyl(0.013, 0.015, 0.008, 6, STEEL_D, [legAt(i, 0).x, AY + 0.002, legAt(i, 0).z]);
  }
  L.forEach((h, j) => {
    for (let i = 0; i < 3; i++) {
      rod(legAt(i, h), legAt((i + 1) % 3, h), 0.0028, BRACE, 4);
      if (j < L.length - 1) rod(legAt(i, h), legAt((i + 1) % 3, L[j + 1]), 0.0026, BRACE, 4);
    }
  });
  // equipment deck
  b.lathe(
    [
      [0, 0],
      [0.064, 0],
      [0.064, 0.008],
      [0.046, 0.014],
      [0, 0.014],
    ],
    { at: [AX, AY + 0.39, AZ], segments: 6, color: MUSTARD },
  );
  // dish on a boom
  const Cd = V(AX + 0.156, AY + 0.47, AZ + 0.09);
  const D = V(0.45, 0.85, 0.35).normalize();
  const dishPaint = paint((p, n) => {
    if (n.dot(D) < -0.1) return CORAL_D;
    const v = p.clone().sub(Cd);
    const perp = v.clone().addScaledVector(D, -v.dot(D)).length();
    return Math.floor(perp / 0.03) & 1 ? TEAL_L : CREAM;
  });
  b.lathe(
    [
      [0, 0],
      [0.04, 0.0033],
      [0.08, 0.0133],
      [0.12, 0.03],
      [0.16, 0.0533],
      [0.16, 0.0473],
      [0.12, 0.024],
      [0.08, 0.0073],
      [0.04, -0.0027],
      [0, -0.006],
    ],
    { at: Cd, axis: D, segments: 14, color: dishPaint },
  );
  const hubPt = Cd.clone().addScaledVector(D, -0.012);
  ball(0.016, MUSTARD, hubPt, {}, 8, 6);
  rod(V(AX, AY + 0.42, AZ), hubPt, 0.008, CREAM);
  rod(V(AX, AY + 0.3, AZ), hubPt, 0.0045, BRACE);
  const feed = Cd.clone().addScaledVector(D, 0.12);
  rod(Cd, feed, 0.0035, CHROME_P);
  ball(0.01, CORAL, feed, {}, 8, 6);
  {
    const [u, v] = basis(D);
    for (let k = 0; k < 3; k++) {
      const a = rad(90 + k * 120);
      const rim = Cd.clone()
        .addScaledVector(u, Math.cos(a) * 0.155)
        .addScaledVector(v, Math.sin(a) * 0.155)
        .addScaledVector(D, 0.05);
      rod(rim, feed, 0.0022, CHROME_P, 4);
    }
  }
  // top: plate, sputnik, whips
  cyl(0.028, 0.03, 0.008, 8, MUSTARD, [AX, AY + MH + 0.004, AZ]);
  const sput = V(AX, AY + MH + 0.042, AZ);
  ball(0.024, CHROME_P, sput, {}, 12, 9);
  {
    const A = V(-0.5, 0.6, -0.4).normalize();
    const [u, v] = basis(A);
    for (let k = 0; k < 4; k++) {
      const a = rad(45 + k * 90);
      const dir = A.clone()
        .multiplyScalar(Math.cos(rad(30)))
        .addScaledVector(u, Math.cos(a) * Math.sin(rad(30)))
        .addScaledVector(v, Math.sin(a) * Math.sin(rad(30)));
      b.rod(sput.clone().addScaledVector(dir, 0.02), sput.clone().addScaledVector(dir, 0.17), [0.0022, 0.0012], {
        color: CHROME_P,
        sides: 4,
      });
    }
  }
  for (let k = 0; k < 3; k++) {
    const a = legAng[k] + rad(60);
    glow(ball(0.004, AMBER, [AX + Math.cos(a) * 0.022, AY + MH + 0.01, AZ + Math.sin(a) * 0.022], {}, 5, 4), 1.6);
  }
  // guy wires
  for (const deg of [150, 270]) {
    const a = rad(deg);
    const top = V(AX + Math.cos(a) * 0.022, AY + 0.55, AZ + Math.sin(a) * 0.022);
    const foot = V(AX + Math.cos(a) * 0.25, G + 0.003, AZ + Math.sin(a) * 0.25);
    b.rod(top, foot, 0.0016, { color: INK, sides: 3 });
    cyl(0.007, 0.009, 0.01, 5, STEEL_D, [foot.x, G + 0.004, foot.z]);
  }
  // equipment cabinet
  const CABx = AX + 0.05;
  const CABz = AZ + 0.17;
  const cab = box(0.09, 0.06, 0.055, TEAL_HULL, [CABx, G + 0.03, CABz]);
  box(0.098, 0.008, 0.063, CORAL, [CABx, G + 0.064, CABz]);
  glow(b.decal(cab, SCREEN, { at: [CABx - 0.012, G + 0.035, CABz + 0.0275], dir: [0, 0, 1], size: [0.04, 0.03] }), 1.1);
  for (let k = 0; k < 3; k++) box(0.014, 0.003, 0.002, INK, [CABx + 0.03, G + 0.022 + k * 0.007, CABz + 0.0277]);
  glow(ball(0.005, "#ff5b4a", [CABx + 0.03, G + 0.046, CABz + 0.0275], {}, 5, 4), 1.4);
  b.rod(V(CABx - 0.03, G + 0.015, CABz - 0.03), V(AX + 0.02, G + 0.02, AZ + 0.1), 0.005, { color: INK, sides: 5 });

  // ================================================================== ROCKET
  const RKX = 0.31;
  const RKZ = 0.31;
  const y0 = G + 0.07;
  const pad = paint((p) => {
    const d = Math.hypot(p.x - RKX, p.z - RKZ);
    return d > 0.118 && d < 0.13 ? CORAL : d > 0.1 && d < 0.108 ? CREAM : "#5c5a56";
  });
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.14, 0.005],
      [0, 0.005],
    ],
    { at: [RKX, G, RKZ], segments: 20, color: pad },
  );
  const rocketPaint = paint((p) => {
    const y = p.y - y0;
    if (y > 0.37) return CORAL;
    if (y > 0.2 && y < 0.28) {
      const a = Math.atan2(p.z - RKZ, p.x - RKX);
      return (Math.floor((a + Math.PI) / (Math.PI / 6)) + Math.floor(y / 0.04)) & 1 ? INK : CREAM;
    }
    if (y < 0.03) return STEEL_D;
    return (y > 0.17 && y < 0.2) || (y > 0.28 && y < 0.3) ? TEAL : CREAM_HULL;
  });
  const body = b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.062, 0.03],
      [0.062, 0.3],
      [0.05, 0.4],
      [0.03, 0.455],
      [0.012, 0.5],
      [0, 0.51],
    ],
    { at: [RKX, y0, RKZ], segments: 12, color: rocketPaint },
  );
  b.lathe(
    [
      [0, -0.035],
      [0.032, -0.035],
      [0.048, 0],
      [0, 0],
    ],
    { at: [RKX, y0, RKZ], segments: 10, color: STEEL_D },
  );
  rod(V(RKX, y0 + 0.5, RKZ), V(RKX, y0 + 0.55, RKZ), [0.004, 0.0015], CHROME_P);
  const finOutline: [number, number][] = [
    [-0.004, 0.0],
    [0.12, -0.035],
    [0.12, 0.012],
    [-0.004, 0.24],
  ];
  for (let k = 0; k < 4; k++) {
    const a = rad(45 + k * 90);
    const d = V(Math.cos(a), 0, Math.sin(a));
    b.extrude(finOutline, {
      at: [RKX + d.x * 0.055, y0, RKZ + d.z * 0.055],
      x: [d.x, 0, d.z],
      y: [0, 1, 0],
      thickness: 0.01,
      bevel: 0.002,
      color: CORAL_HULL,
    });
    // landing legs on the axes
    const la = rad(k * 90);
    const ld = V(Math.cos(la), 0, Math.sin(la));
    const top = V(RKX + ld.x * 0.05, y0 + 0.06, RKZ + ld.z * 0.05);
    const foot = V(RKX + ld.x * 0.12, G + 0.008, RKZ + ld.z * 0.12);
    rod(top, foot, 0.005, CHROME_P);
    rod(V(RKX + ld.x * 0.05, y0 + 0.012, RKZ + ld.z * 0.05), top.clone().lerp(foot, 0.55), 0.0035, CHROME_P, 4);
    cyl(0.021, 0.023, 0.008, 8, STEEL_D, [foot.x, G + 0.004, foot.z]);
  }
  glow(b.decal(body, PORT, { at: [RKX, y0 + 0.15, RKZ + 0.062], dir: [0, 0, 1], size: [0.034, 0.034] }), 0.9);
  b.decal(body, ROUNDEL, { at: [RKX, y0 + 0.325, RKZ + 0.062], dir: [0, 0, 1], size: [0.05, 0.05] });
  b.decal(body, LUNA, { at: [RKX + 0.062, y0 + 0.13, RKZ], dir: [1, 0, 0], size: [0.022, 0.092] });
  {
    const la = rad(202);
    const d = V(Math.cos(la), 0, Math.sin(la));
    const tg = V(-d.z, 0, d.x);
    b.decal(body, HATCH, {
      at: [RKX + d.x * 0.062, y0 + 0.16, RKZ + d.z * 0.062],
      dir: [d.x, 0, d.z],
      up: [0, 1, 0],
      size: [0.03, 0.04],
    });
    const base = V(RKX + d.x * 0.07, 0, RKZ + d.z * 0.07);
    for (const s of [1, -1])
      rod(V(base.x + tg.x * 0.012 * s, G + 0.005, base.z + tg.z * 0.012 * s), V(base.x + tg.x * 0.012 * s, y0 + 0.12, base.z + tg.z * 0.012 * s), 0.0028, CHROME_P, 4);
    for (let r = 0; r < 8; r++) {
      const y = G + 0.015 + r * 0.02;
      rod(V(base.x + tg.x * 0.012, y, base.z + tg.z * 0.012), V(base.x - tg.x * 0.012, y, base.z - tg.z * 0.012), 0.002, CHROME_P, 4);
    }
  }

  // ================================================================== ROVER
  const RX = -0.2;
  const RZ = 0.4;
  const YAW = rad(35);
  const qy = new THREE.Quaternion().setFromAxisAngle(UP, YAW);
  const RL = (lx: number, ly: number, lz: number) => V(lx, ly, lz).applyQuaternion(qy).add(V(RX, G, RZ));
  const axleDir = V(1, 0, 0).applyQuaternion(qy);
  box(0.07, 0.03, 0.14, CREAM_HULL, RL(0, 0.044, 0), { quat: qy });
  box(0.073, 0.008, 0.143, TEAL, RL(0, 0.04, 0), { quat: qy });
  const bubble = paint((_p, n) => mix("#8fd6d0", "#eafcfb", smoothstep(-0.2, 0.9, n.y)));
  part(new THREE.SphereGeometry(0.034, 10, 6, 0, TAU, 0, Math.PI / 2), bubble, RL(0, 0.059, 0.02), { quat: qy });
  box(0.06, 0.03, 0.04, TEAL_HULL, RL(0, 0.074, -0.05), { quat: qy });
  box(0.064, 0.005, 0.044, CORAL, RL(0, 0.091, -0.05), { quat: qy });
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const w = RL(sx * 0.049, 0.028, sz * 0.045);
      cyl(0.028, 0.028, 0.024, 10, TYRE, w, { dir: axleDir });
      cyl(0.015, 0.015, 0.027, 6, MUSTARD, w, { dir: axleDir });
    }
  for (const sz of [1, -1]) rod(RL(-0.045, 0.028, sz * 0.045), RL(0.045, 0.028, sz * 0.045), 0.004, CHROME_P);
  for (const sx of [1, -1]) glow(box(0.014, 0.01, 0.004, "#fff2b8", RL(sx * 0.02, 0.047, 0.071), { quat: qy }), 1.5);
  rod(RL(-0.025, 0.093, -0.05), RL(-0.025, 0.115, -0.05), 0.003, CHROME_P, 4);
  b.lathe(
    [
      [0, -0.003],
      [0.016, 0.0],
      [0.032, 0.009],
      [0.032, 0.0065],
      [0.016, -0.003],
      [0, -0.006],
    ],
    { at: RL(-0.025, 0.12, -0.05), axis: V(0.3, 1, 0.5).applyQuaternion(qy).normalize(), segments: 10, color: CREAM },
  );
  rod(RL(0.025, 0.093, -0.05), RL(0.025, 0.15, -0.05), 0.0018, CHROME_P, 3);
  glow(ball(0.005, "#ff5b4a", RL(0.025, 0.152, -0.05), {}, 5, 4), 1.5);
  rod(RL(0, 0.035, -0.07), RL(0, 0.03, -0.1), 0.004, STEEL_D);

  // ================================================================== ASTRONAUT
  const SX = -0.04;
  const SZ = 0.44;
  for (const s of [1, -1]) {
    box(0.016, 0.012, 0.026, INK, [SX + s * 0.01, G + 0.006, SZ + 0.004]);
    cyl(0.007, 0.008, 0.03, 6, CREAM, [SX + s * 0.01, G + 0.027, SZ]);
  }
  box(0.04, 0.036, 0.024, CREAM, [SX, G + 0.058, SZ]);
  box(0.022, 0.014, 0.003, TEAL, [SX, G + 0.062, SZ + 0.0125]);
  glow(ball(0.003, AMBER, [SX - 0.006, G + 0.062, SZ + 0.0145], {}, 4, 3), 1.6);
  glow(ball(0.003, "#ff5b4a", [SX + 0.006, G + 0.062, SZ + 0.0145], {}, 4, 3), 1.6);
  box(0.03, 0.038, 0.014, CHROME_P, [SX, G + 0.06, SZ - 0.019]);
  rod(V(SX + 0.01, G + 0.08, SZ - 0.024), V(SX + 0.02, G + 0.115, SZ - 0.03), 0.0015, CHROME_P, 3);
  b.capsule(V(SX - 0.024, G + 0.07, SZ), V(SX - 0.034, G + 0.052, SZ + 0.014), 0.0065, { color: CREAM, sides: 6 });
  b.capsule(V(SX + 0.024, G + 0.07, SZ), V(SX + 0.038, G + 0.098, SZ + 0.008), 0.0065, { color: CREAM, sides: 6 });
  ball(0.0075, MUSTARD, [SX - 0.035, G + 0.05, SZ + 0.015], {}, 6, 4);
  ball(0.0075, MUSTARD, [SX + 0.039, G + 0.101, SZ + 0.008], {}, 6, 4);
  cyl(0.016, 0.018, 0.006, 8, CHROME_P, [SX, G + 0.078, SZ]);
  const helmet = ball(0.021, "#fffaf0", [SX, G + 0.092, SZ], {}, 12, 8);
  b.decal(helmet, VISOR, { at: [SX, G + 0.092, SZ + 0.021], dir: [0, 0, 1], size: [0.03, 0.022] });

  // ================================================================== FLAG
  const FX = 0.1;
  const FZ = 0.42;
  rod(V(FX, G, FZ), V(FX, G + 0.2, FZ), 0.0032, CHROME_P);
  cyl(0.009, 0.011, 0.006, 6, STEEL_D, [FX, G + 0.003, FZ]);
  ball(0.0065, MUSTARD, [FX, G + 0.205, FZ], {}, 6, 4);
  rod(V(FX, G + 0.19, FZ), V(FX + 0.108, G + 0.19, FZ), 0.0022, CHROME_P, 4);
  box(0.1, 0.065, 0.003, "#ffffff", [FX + 0.056, G + 0.19 - 0.0345, FZ], { texture: FLAG });

  // ================================================================== SOLAR ARRAY
  const SOx = 0.4;
  const SOz = -0.3;
  cyl(0.008, 0.011, 0.1, 6, CHROME_P, [SOx, G + 0.05, SOz]);
  cyl(0.02, 0.024, 0.008, 8, STEEL_D, [SOx, G + 0.004, SOz]);
  rod(V(SOx - 0.15, G + 0.105, SOz), V(SOx + 0.15, G + 0.105, SOz), 0.005, CHROME_P);
  for (const s of [1, -1]) {
    box(0.13, 0.006, 0.1, "#ffffff", [SOx + s * 0.072, G + 0.14, SOz + 0.005], { texture: SOLAR, rotation: [40, 0, 0] });
    rod(V(SOx + s * 0.072, G + 0.105, SOz), V(SOx + s * 0.072, G + 0.14, SOz - 0.012), 0.003, CHROME_P, 4);
  }
  glow(ball(0.005, AMBER, [SOx, G + 0.104, SOz + 0.012], {}, 5, 4), 1.2);

  return b.root;
}
```