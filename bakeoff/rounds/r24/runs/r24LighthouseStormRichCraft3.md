```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, frame, rng, catmull, mix, noise, paint, rgb, smoothstep, grain, scales, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Stormwatch Lighthouse",
  description:
    "A chunky Sea-of-Thieves style lighthouse on a wave-battered cliff in a thunderstorm: striped tower, glowing lantern with sweeping beams, rope-railed stairs and dock, pirate flag, rain, lightning and brooding clouds.",
};

type C3 = readonly [number, number, number];
const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "stormwatch_lighthouse", paintSize: 2048 });
  const R = rng(2024);
  const rr = (a: number, c: number) => a + (c - a) * R();

  // ------------------------------------------------------------------ geometry shorthands
  const ico = (d = 0) => new THREE.IcosahedronGeometry(1, d);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s, 1);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const radial = (az: number) => V(Math.sin(az), 0, Math.cos(az));

  // ------------------------------------------------------------------ constants
  const SEA_TOP = 0.95;
  const T0 = 5.22; // tower base
  const TH = 5.4; // tower height
  const TOP = T0 + TH; // gallery level
  const GL0 = TOP + 0.26; // glass bottom
  const GH = 1.0;
  const ROOF0 = GL0 + GH + 0.14;

  // ------------------------------------------------------------------ palette (flat)
  const FOAM = "#f1fbf8";
  const SEA_RIDGE = "#2f9aa0";
  const IRON = "#3a3f48";
  const IRON_L = "#59606b";
  const ROPE = "#d9c08a";
  const WOOD_D = "#4d3019";
  const LAMP = "#ffd36b";
  const GOLD = "#e0ae4c";
  const RAIN = "#cfe6f2";
  const BEAM = "#fff1ae";
  const BEAM_CORE = "#fffbe6";
  const BOLT = "#fbf8d0";
  const BOLT_HALO = "#9fd8ff";
  const GALLERY = "#4a5059";

  // ------------------------------------------------------------------ paints
  const shade = (c: C3, n: THREE.Vector3, amt = 0.2): C3 => {
    const up = Math.max(n.y, 0);
    const dn = Math.max(-n.y, 0);
    const k = 1 + amt * (up - 0.5 * dn) - amt * 0.35;
    return [
      Math.min(1, c[0] * k * (1 + 0.05 * up)),
      Math.min(1, c[1] * k),
      Math.min(1, c[2] * k * (1 - 0.04 * up + 0.06 * dn)),
    ];
  };
  const tmp = new THREE.Vector3();

  const rockPaint = paint((p, n) => {
    const big = noise(p, 1.4, 4);
    const strata = 0.5 + 0.5 * Math.sin(p.y * 6.0 + big * 5);
    let c: C3 = mix("#4f463f", "#9a8a76", 0.2 + 0.28 * strata + 0.4 * noise(p, 0.55, 2));
    c = mix(c, "#a9774a", 0.32 * smoothstep(0.55, 0.8, noise(p, 0.9, 7)));
    c = mix(c, "#2c343d", 0.55 * smoothstep(2.7, 1.0, p.y));
    c = mix(c, "#2f5a3e", 0.65 * smoothstep(1.4, 0.95, p.y) * smoothstep(0.4, 0.7, noise(p, 0.35, 9)));
    c = mix(
      c,
      "#587a36",
      0.7 * smoothstep(0.55, 0.85, n.y) * smoothstep(0.35, 0.65, noise(p, 0.6, 5)) * smoothstep(1.3, 2.5, p.y),
    );
    const grass = smoothstep(0.35, 0.7, n.y) * smoothstep(4.5, 4.85, p.y);
    c = mix(c, mix("#3f7a2a", "#7db83f", noise(p, 0.5, 3)), grass);
    return shade(c, n, 0.22);
  });

  const seaPaint = paint((p, n) => {
    if (n.y > 0.7) {
      let c: C3 = mix("#14535f", "#1f7f86", smoothstep(0.3, 0.7, noise(p, 1.6, 21)));
      c = mix(c, "#38b3ae", 0.55 * smoothstep(0.6, 0.8, noise(p, 0.7, 5)));
      const r = Math.hypot(p.x, p.z);
      c = mix(c, "#4cc4b8", 0.45 * smoothstep(7.2, 4.4, r));
      c = mix(c, FOAM, 0.7 * smoothstep(0.72, 0.8, noise(p, 0.3, 8)));
      return c;
    }
    let c: C3 = mix("#0b3440", "#1b7079", smoothstep(0.0, 0.9, p.y));
    c = mix(c, FOAM, 0.7 * smoothstep(0.86, 0.94, p.y));
    return c;
  });

  const TW_RED = "#c3432b";
  const TW_CREAM = "#f0e3c4";
  const towerPaint = paint((p, n) => {
    const h = p.y - T0;
    const band = Math.floor(h / 1.8);
    let c: C3 = rgb(band % 2 === 0 ? TW_RED : TW_CREAM);
    c = mix(c, "#6d4a3a", 0.16 * noise(p, 0.45, 3));
    tmp.set(p.x * 5, p.y * 0.6, p.z * 5);
    c = mix(c, "#3b2c28", 0.28 * smoothstep(0.6, 0.75, noise(tmp, 0.5, 12)));
    c = mix(c, "#33403f", 0.5 * smoothstep(1.1, 0.0, h));
    c = mix(c, "#ffffff", 0.18 * smoothstep(0.62, 0.8, noise(p, 0.25, 17)) * (band % 2 === 0 ? 1 : 0));
    const edge = Math.abs(h - band * 1.8);
    if (band > 0 && edge < 0.035) c = mix(c, "#3a1d15", 0.85);
    return shade(c, n, 0.2);
  });

  const roofPaint = paint((p, n) => {
    let c: C3 = mix("#3b8f7f", "#5db39c", noise(p, 0.5, 3));
    c = mix(c, "#b5683a", 0.5 * smoothstep(0.62, 0.8, noise(p, 0.3, 8)));
    return shade(c, n, 0.25);
  });

  const cloudPaint = paint((p, n) => {
    const t = smoothstep(-0.7, 0.9, n.y);
    let c: C3 = mix("#232a3a", "#6c7893", t);
    c = mix(c, "#3c4b5c", 0.35 * noise(p, 1.6, 3));
    c = mix(c, "#3f6a68", 0.3 * smoothstep(0.2, -0.8, n.y));
    return c;
  });

  const plank = grain("#a67444", "#6d4624", { size: 0.035, axis: "z" });
  const plankX = grain("#a67444", "#6d4624", { size: 0.035, axis: "x" });
  const postWood = grain("#8a5c32", "#523218", { size: 0.04, axis: "y" });
  const stonePaint = scales(["#9a948a", "#8a857c", "#a39d92"], "#4a463f", { size: 0.3, width: 0.14 });

  // ------------------------------------------------------------------ textures
  const WIN_FRAME = svg(
    `<svg viewBox="0 0 48 80" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" fill="#9b9183" stroke="#3b342d" stroke-width="1.6" stroke-linejoin="round"
        d="M2 80 V28 A22 22 0 0 1 46 28 V80 Z M10 72 V28 A14 14 0 0 1 38 28 V72 Z"/>
      <path d="M24 6 L27 15 L21 15Z" fill="#c4baa8" stroke="#3b342d" stroke-width="1"/>
      <path d="M6 20 L12 26 M14 9 L18 17 M42 20 L36 26 M34 9 L30 17 M3 36 H10 M38 36 H45 M3 50 H10 M38 50 H45" stroke="#5c5448" stroke-width="1"/>
      <rect x="0" y="72" width="48" height="8" fill="#7d7366" stroke="#3b342d" stroke-width="1.4"/>
    </svg>`,
    { size: 192 },
  );
  const WIN_GLOW = svg(
    `<svg viewBox="0 0 48 80" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeaa0"/><stop offset="1" stop-color="#ff9a38"/></linearGradient></defs>
      <path d="M9.4 72.6 V28 A14.6 14.6 0 0 1 38.6 28 V72.6 Z" fill="url(#w)"/>
      <path d="M24 14 V72 M10 42 H38" stroke="#4a2e18" stroke-width="2.2"/>
      <path d="M14 70 L34 70" stroke="#ffd070" stroke-width="2"/>
    </svg>`,
    { size: 192 },
  );
  const DOOR = svg(
    `<svg viewBox="0 0 60 88" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="d"><path d="M9 88 V36 A21 21 0 0 1 51 36 V88Z"/></clipPath></defs>
      <path d="M2 88 V36 A28 28 0 0 1 58 36 V88 Z" fill="#9b9183" stroke="#3b342d" stroke-width="2" stroke-linejoin="round"/>
      <path d="M30 4 L35 14 L25 14Z" fill="#c4baa8" stroke="#3b342d" stroke-width="1"/>
      <path d="M9 88 V36 A21 21 0 0 1 51 36 V88Z" fill="#7a4a24" stroke="#2e1a0c" stroke-width="2"/>
      <g clip-path="url(#d)">
        <path d="M16 10 V88 M23 10 V88 M30 10 V88 M37 10 V88 M44 10 V88" stroke="#4a2a12" stroke-width="1.3"/>
        <rect x="6" y="42" width="48" height="5" fill="#2b2d33"/><rect x="6" y="68" width="48" height="5" fill="#2b2d33"/>
        <path d="M30 12 V88" stroke="#2e1a0c" stroke-width="2"/>
        <g fill="#8d93a0"><circle cx="13" cy="44.5" r="1.2"/><circle cx="21" cy="44.5" r="1.2"/><circle cx="39" cy="44.5" r="1.2"/><circle cx="47" cy="44.5" r="1.2"/>
        <circle cx="13" cy="70.5" r="1.2"/><circle cx="21" cy="70.5" r="1.2"/><circle cx="39" cy="70.5" r="1.2"/><circle cx="47" cy="70.5" r="1.2"/></g>
      </g>
      <circle cx="39" cy="58" r="3.6" fill="none" stroke="#e0b24f" stroke-width="1.6"/>
      <circle cx="39" cy="54" r="1.6" fill="#e0b24f"/>
    </svg>`,
    { size: 256 },
  );
  const LIFEBUOY = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" fill="none" stroke="#fdf6e6" stroke-width="15"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#d6362a" stroke-width="15" stroke-dasharray="34.5 34.5"/>
      <circle cx="32" cy="32" r="29.6" fill="none" stroke="#2c2220" stroke-width="1.6"/>
      <circle cx="32" cy="32" r="14.4" fill="none" stroke="#2c2220" stroke-width="1.6"/>
      <circle cx="32" cy="32" r="31" fill="none" stroke="#d9c08a" stroke-width="1.6" stroke-dasharray="3 2.4"/>
    </svg>`,
    { size: 192 },
  );
  const paneRects = [...Array(8).keys()]
    .map(
      (k) => `<rect x="${k * 20 + 1.5}" y="1" width="17" height="38" rx="2" fill="url(#g)"/>
      <path d="M${k * 20 + 4} 12 H${k * 20 + 16} M${k * 20 + 4} 28 H${k * 20 + 16}" stroke="#d9861c" stroke-width="1.2" opacity=".55"/>
      <ellipse cx="${k * 20 + 10}" cy="20" rx="4" ry="9" fill="#ffffff" opacity=".65"/>`,
    )
    .join("");
  const LANTERN = svg(
    `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#fffbe0"/><stop offset=".55" stop-color="#ffd966"/><stop offset="1" stop-color="#ff9f2e"/></radialGradient></defs>
      <rect width="160" height="40" fill="#5a3b14"/>${paneRects}
    </svg>`,
    { size: 512 },
  );
  const SKULL = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 52 L54 16 M54 52 L10 16" stroke="#17181d" stroke-width="8.5" stroke-linecap="round"/>
      <path d="M10 52 L54 16 M54 52 L10 16" stroke="#f0ead8" stroke-width="5" stroke-linecap="round"/>
      <path d="M32 9 C47 9 53 20 51 31 C50 36 47 38 45 40 V47 H19 V40 C17 38 14 36 13 31 C11 20 17 9 32 9Z" fill="#f4eedc" stroke="#17181d" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="24" cy="29" r="5.8" fill="#17181d"/><circle cx="40" cy="29" r="5.8" fill="#17181d"/>
      <path d="M32 34 L28.5 41 H35.5Z" fill="#17181d"/>
      <path d="M25.5 41 V47 M32 42 V47 M38.5 41 V47" stroke="#17181d" stroke-width="1.6"/>
    </svg>`,
    { size: 192 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 100 44" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="98" height="42" rx="4" fill="#8a5a2e" stroke="#3a2410" stroke-width="2"/>
      <path d="M2 15 H98 M2 29 H98" stroke="#5a3a1a" stroke-width="1"/>
      <text x="50" y="19" text-anchor="middle" font-family="serif" font-weight="bold" font-size="12" fill="#f5e2b0" stroke="#3a2410" stroke-width="0.6">LANTERN'S REACH</text>
      <text x="50" y="35" text-anchor="middle" font-family="serif" font-weight="bold" font-size="7" fill="#e3c07a">KEEP OFF THE ROCKS</text>
      <g fill="#2c2c30"><circle cx="6" cy="6" r="1.6"/><circle cx="94" cy="6" r="1.6"/><circle cx="6" cy="38" r="1.6"/><circle cx="94" cy="38" r="1.6"/></g>
    </svg>`,
    { size: 320 },
  );
  const FOAMTEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="#9fd6d2" stroke="#9fd6d2" stroke-width="5">
        <circle cx="50" cy="50" r="28"/><circle cx="28" cy="60" r="16"/><circle cx="72" cy="62" r="18"/>
        <circle cx="55" cy="26" r="15"/><circle cx="25" cy="36" r="11"/><circle cx="78" cy="34" r="12"/><circle cx="40" cy="80" r="10"/>
      </g>
      <g fill="#ffffff">
        <circle cx="50" cy="50" r="28"/><circle cx="28" cy="60" r="16"/><circle cx="72" cy="62" r="18"/>
        <circle cx="55" cy="26" r="15"/><circle cx="25" cy="36" r="11"/><circle cx="78" cy="34" r="12"/><circle cx="40" cy="80" r="10"/>
      </g>
      <g fill="none" stroke="#bfe6e3" stroke-width="1.6"><circle cx="45" cy="45" r="7"/><circle cx="64" cy="58" r="5"/><circle cx="34" cy="62" r="4"/></g>
    </svg>`,
    { size: 192 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="gr" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2f5f1d"/><stop offset="1" stop-color="#93c94c"/></linearGradient></defs>
      <g fill="url(#gr)" stroke="#244515" stroke-width="1" stroke-linejoin="round">
        <path d="M10 64 Q8 34 2 6 Q16 30 17 64Z"/>
        <path d="M16 64 Q16 30 14 2 Q25 28 23 64Z"/>
        <path d="M22 64 Q26 34 34 4 Q31 34 29 64Z"/>
        <path d="M27 64 Q33 44 39 24 Q35 48 33 64Z"/>
        <path d="M5 64 Q4 50 0 38 Q9 50 11 64Z"/>
      </g>
    </svg>`,
    { size: 160 },
  );

  // ------------------------------------------------------------------ SEA
  b.part(new THREE.CylinderGeometry(10.2, 10, SEA_TOP, 16, 1), seaPaint, {
    at: [0, SEA_TOP / 2, 0],
    flat: true,
    name: "sea",
  });

  // swell ridges
  for (let i = 0; i < 20; i++) {
    const a0 = (i / 20) * Math.PI * 2 + rr(-0.1, 0.1);
    const rad = 5.3 + (i % 4) * 1.15 + rr(0, 0.5);
    const span = rr(0.35, 0.7) * (6.5 / rad);
    const w = rr(0.16, 0.28);
    const h = rr(0.1, 0.2);
    const pts: number[][] = [];
    for (let k = 0; k <= 5; k++) {
      const a = a0 + span * (k / 5 - 0.5);
      const r = rad + rr(-0.2, 0.2);
      pts.push([Math.sin(a) * r, SEA_TOP - 0.02, Math.cos(a) * r]);
    }
    b.sweep(
      catmull(pts),
      (t: number) => {
        const e = Math.pow(Math.sin(Math.PI * t), 0.7);
        return [w * e + 0.01, h * e + 0.01];
      },
      {
        color: SEA_RIDGE,
        sides: 6,
        smooth: false,
        shift: [0, -0.03],
        sectors: [[-55, 55, FOAM]],
        name: "swell",
      },
    );
  }

  function foamRing(cx: number, cz: number, r: number, w: number, seed: number) {
    const pts: number[][] = [];
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rad = r * (1 + 0.07 * Math.sin(a * 3 + seed) + rr(-0.03, 0.03));
      pts.push([cx + Math.sin(a) * rad, SEA_TOP + 0.01, cz + Math.cos(a) * rad]);
    }
    b.sweep(catmull(pts, { closed: true }), () => [w, 0.07], {
      color: FOAM,
      sides: 6,
      smooth: false,
      name: "foamring",
    });
  }

  // ------------------------------------------------------------------ CLIFF
  const cliffParts: ReturnType<typeof b.part>[] = [];
  const LAYERS = [
    { y0: 0.3, y1: 1.8, r0: 4.1, r1: 3.65, cx: 0, cz: 0, rot: 10, sz: 0.94 },
    { y0: 1.8, y1: 3.1, r0: 3.5, r1: 3.1, cx: 0.2, cz: -0.15, rot: 33, sz: 0.97 },
    { y0: 3.1, y1: 4.2, r0: 3.15, r1: 2.95, cx: 0.05, cz: 0.1, rot: 8, sz: 1.0 },
    { y0: 4.2, y1: 4.9, r0: 2.9, r1: 2.7, cx: 0, cz: 0, rot: 24, sz: 1.0 },
  ];
  LAYERS.forEach((L) => {
    cliffParts.push(
      b.part(cyl(L.r1, L.r0, L.y1 - L.y0, 9), rockPaint, {
        at: [L.cx, (L.y0 + L.y1) / 2, L.cz],
        rotation: [0, L.rot, 0],
        scale: [1, 1, L.sz],
        flat: true,
        name: "cliff",
      }),
    );
    for (let k = 0; k < 6; k++) {
      const a = rr(0, Math.PI * 2);
      const rad = ((L.r0 + L.r1) / 2) * 0.97;
      const s = rr(0.5, 0.85);
      cliffParts.push(
        b.part(ico(0), rockPaint, {
          at: [L.cx + Math.sin(a) * rad, L.y0 + 0.25 + rr(0, 0.55), L.cz + Math.cos(a) * rad],
          scale: [s * 1.1, s * 0.75, s],
          rotation: [rr(0, 60), rr(0, 180), rr(0, 60)],
          flat: true,
          name: "ledge",
        }),
      );
    }
  });
  // base boulders in the surf
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2 + rr(-0.2, 0.2);
    const rad = 3.95 + rr(-0.1, 0.35);
    const s = rr(0.8, 1.25);
    cliffParts.push(
      b.part(ico(1), rockPaint, {
        at: [Math.sin(a) * rad, 0.85 + rr(0, 0.25), Math.cos(a) * rad],
        scale: [s * 1.15, s * 0.8, s],
        rotation: [rr(0, 50), rr(0, 180), rr(0, 50)],
        flat: true,
        name: "boulder",
      }),
    );
  }
  const cap = b.part(cyl(2.8, 2.75, 0.25, 9), rockPaint, {
    at: [0, 4.93, 0],
    rotation: [0, 12, 0],
    flat: true,
    name: "cliffcap",
  });
  cliffParts.push(cap);

  // sea stacks
  function stack(x: number, z: number, h: number, r: number) {
    let y = 0.4;
    const hh = h / 3;
    const radii = [r, r * 0.78, r * 0.55, r * 0.36];
    for (let i = 0; i < 3; i++) {
      b.part(cyl(radii[i + 1], radii[i], hh, 7), rockPaint, {
        at: [x + rr(-0.08, 0.08), y + hh / 2, z + rr(-0.08, 0.08)],
        rotation: [0, rr(0, 90), rr(-4, 4)],
        flat: true,
        name: "stack",
      });
      y += hh * 0.92;
    }
    foamRing(x, z, r * 1.2, 0.17, x);
  }
  stack(6.3, -1.6, 3.4, 0.95);
  stack(-5.7, -3.8, 2.6, 0.85);
  stack(3.8, 6.1, 1.9, 0.7);

  foamRing(0, 0, 4.35, 0.26, 1);
  foamRing(0, 0, 4.95, 0.15, 3);

  // foam splats
  {
    const frames = [];
    const flows: number[][] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2 + rr(-0.1, 0.1);
      const rad = 4.5 + rr(-0.2, 0.5);
      frames.push(frame([Math.sin(a) * rad, SEA_TOP + 0.03, Math.cos(a) * rad], [0, 1, 0]));
      flows.push([Math.sin(a), 0, Math.cos(a)]);
    }
    b.cards(frames, FOAMTEX, {
      size: [1.0, 1.0],
      lean: 90,
      flow: (_f: unknown, i: number) => flows[i],
      mirror: true,
      vary: 0.3,
      rng: rng(8),
      spin: 180,
    });
  }

  // ------------------------------------------------------------------ DOCK
  const dockAz = -85 * DEG;
  const dockDir = radial(dockAz);
  const dockY = 1.15;
  for (let i = 0; i < 8; i++) {
    const r = 3.4 + i * 0.42;
    b.part(box(1.5, 0.09, 0.38), plank, {
      at: [dockDir.x * r, dockY, dockDir.z * r],
      dir: dockDir,
      axis: "z",
      name: "dockplank",
    });
  }
  for (const s of [1, -1]) {
    const tang = V(Math.cos(dockAz), 0, -Math.sin(dockAz));
    const cx = dockDir.x * 5.0 + tang.x * s * 0.6;
    const cz = dockDir.z * 5.0 + tang.z * s * 0.6;
    b.part(box(0.12, 0.14, 3.6), postWood, { at: [cx, dockY - 0.12, cz], dir: dockDir, axis: "z", name: "stringer" });
    for (const rd of [3.9, 5.9]) {
      const px = dockDir.x * rd + tang.x * s * 0.78;
      const pz = dockDir.z * rd + tang.z * s * 0.78;
      b.part(cyl(0.09, 0.1, 1.3, 6), postWood, { at: [px, 1.05, pz], name: "dockpost" });
      b.part(ico(0), IRON_L, { at: [px, 1.72, pz], scale: 0.1, flat: true });
      if (s === 1 && rd === 5.9) {
        // lantern on the dock head
        lantern(px, 1.7, pz);
      }
    }
  }

  function lantern(x: number, y: number, z: number) {
    b.part(cyl(0.11, 0.11, 0.04, 6), IRON, { at: [x, y + 0.02, z], flat: true });
    glow(b.part(cyl(0.08, 0.08, 0.2, 6), LAMP, { at: [x, y + 0.14, z], flat: true }), 1.8);
    b.part(new THREE.ConeGeometry(0.14, 0.1, 6), IRON, { at: [x, y + 0.29, z], flat: true });
    b.part(ico(0), GOLD, { at: [x, y + 0.36, z], scale: 0.035, flat: true });
    for (let k = 0; k < 4; k++) {
      const a = k * 90 * DEG + Math.PI / 4;
      b.part(cyl(0.012, 0.012, 0.22, 4), IRON, { at: [x + Math.sin(a) * 0.085, y + 0.14, z + Math.cos(a) * 0.085] });
    }
  }

  // ------------------------------------------------------------------ STAIRS
  {
    const surf = b.surface(cliffParts);
    const N = 15;
    const tops: THREE.Vector3[] = [];
    const lows: THREE.Vector3[] = [];
    for (let k = 0; k < N; k++) {
      const y = 1.45 + k * 0.235;
      const az = (-80 + k * (105 / (N - 1))) * DEG;
      const out = radial(az);
      const hit = surf.ray([out.x * 9, y, out.z * 9], [-out.x, 0, -out.z]);
      if (!hit) continue;
      const pos = hit.at.clone().addScaledVector(out, 0.12);
      b.part(box(0.9, 0.1, 0.62), plankX, { at: [pos.x, y - 0.04, pos.z], dir: out, axis: "z", name: "step" });
      b.part(box(0.8, 0.32, 0.4), postWood, {
        at: [pos.x - out.x * 0.12, y - 0.23, pos.z - out.z * 0.12],
        dir: out,
        axis: "z",
        name: "stepsupport",
      });
      if (k % 2 === 0) {
        const px = pos.x + out.x * 0.33;
        const pz = pos.z + out.z * 0.33;
        b.part(cyl(0.045, 0.055, 0.9, 6), postWood, { at: [px, y + 0.38, pz], name: "railpost" });
        b.part(ico(0), GOLD, { at: [px, y + 0.86, pz], scale: 0.06, flat: true });
        tops.push(V(px, y + 0.8, pz));
        lows.push(V(px, y + 0.42, pz));
        if (k === 0 || k === N - 1) lantern(px, y + 0.9, pz);
      }
    }
    const rope = (pts: THREE.Vector3[], r: number) => {
      if (pts.length < 2) return;
      const path: number[][] = [];
      for (let i = 0; i < pts.length; i++) {
        path.push([pts[i].x, pts[i].y, pts[i].z]);
        if (i < pts.length - 1) {
          const m = pts[i].clone().add(pts[i + 1]).multiplyScalar(0.5);
          path.push([m.x, m.y - 0.08, m.z]);
        }
      }
      b.sweep(catmull(path), r, { color: ROPE, sides: 5, smooth: false, name: "rope" });
    };
    rope(tops, 0.03);
    rope(lows, 0.024);
  }

  // sign post at the top of the stairs
  {
    const a = 38 * DEG;
    const x = Math.sin(a) * 2.3;
    const z = Math.cos(a) * 2.3;
    b.part(cyl(0.07, 0.09, 1.3, 6), postWood, { at: [x, 5.65, z], name: "signpost" });
    b.part(box(1.0, 0.44, 0.06), "#ffffff", {
      at: [x, 6.05, z + 0.08],
      rotation: [0, 15, 0],
      texture: SIGN,
      name: "sign",
    });
    b.part(ico(0), GOLD, { at: [x, 6.34, z], scale: 0.09, flat: true });
  }

  // ------------------------------------------------------------------ LIGHTHOUSE
  // plinth + steps
  b.part(cyl(1.7, 2.0, 0.22, 10), stonePaint, { at: [0, 5.13, 0], flat: true, name: "plinth" });
  b.part(box(1.5, 0.1, 0.5), stonePaint, { at: [0, 5.29, 1.78], name: "doorstep" });
  b.part(box(1.15, 0.1, 0.45), stonePaint, { at: [0, 5.39, 1.58], name: "doorstep" });

  const TP: [number, number][] = [
    [1.5, 0],
    [1.42, 1.2],
    [1.28, 2.9],
    [1.14, 4.4],
    [1.06, 5.4],
  ];
  const towerR = (y: number) => {
    const h = Math.min(Math.max(y - T0, 0), TH);
    for (let i = 0; i < TP.length - 1; i++) {
      const [r0, h0] = TP[i];
      const [r1, h1] = TP[i + 1];
      if (h <= h1) return r0 + ((r1 - r0) * (h - h0)) / (h1 - h0);
    }
    return TP[TP.length - 1][0];
  };
  const tower = b.lathe([[0, 0], ...TP, [0, TH]], {
    at: [0, T0, 0],
    segments: 10,
    color: towerPaint,
    name: "tower",
  });

  function onTower(tex: THREE.Texture, az: number, y: number, w: number, h: number, lift: number) {
    const d = radial(az);
    const r = towerR(y);
    return b.decal(tower, tex, {
      at: [d.x * r, y, d.z * r],
      dir: [d.x, 0, d.z],
      size: [w, h],
      lift,
      segments: 8,
    });
  }
  // door
  onTower(DOOR, 0, T0 + 0.72, 0.95, 1.4, 0.004);
  // windows
  const windows: [number, number][] = [
    [18, 1.5],
    [-32, 2.8],
    [28, 4.1],
  ];
  for (const [az, h] of windows) {
    onTower(WIN_GLOW, az * DEG, T0 + h, 0.5, 0.83, 0.0025);
    glow(onTower(WIN_GLOW, az * DEG, T0 + h, 0.5, 0.83, 0.0025), 1.4);
    onTower(WIN_FRAME, az * DEG, T0 + h, 0.5, 0.83, 0.005);
  }
  // lifebuoy
  onTower(LIFEBUOY, 78 * DEG, T0 + 1.9, 0.72, 0.72, 0.004);

  // gallery
  b.lathe(
    [
      [0, -0.35],
      [1.15, -0.35],
      [1.95, 0],
      [1.95, 0.12],
      [0, 0.12],
    ],
    { at: [0, TOP, 0], segments: 14, color: GALLERY, name: "gallery" },
  );
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    b.part(box(0.26, 0.42, 0.42), stonePaint, {
      at: [Math.sin(a) * 1.32, TOP - 0.22, Math.cos(a) * 1.32],
      dir: radial(a),
      axis: "z",
      name: "corbel",
    });
  }
  {
    const base = TOP + 0.12;
    const hi: number[][] = [];
    const mid: number[][] = [];
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.sin(a) * 1.82;
      const z = Math.cos(a) * 1.82;
      b.part(cyl(0.035, 0.035, 0.62, 5), IRON, { at: [x, base + 0.31, z], name: "rail" });
      b.part(ico(0), GOLD, { at: [x, base + 0.64, z], scale: 0.05, flat: true });
      hi.push([x, base + 0.62, z]);
      mid.push([x, base + 0.32, z]);
    }
    b.sweep(catmull(hi, { closed: true }), 0.04, { color: IRON, sides: 5, smooth: false, name: "toprail" });
    b.sweep(catmull(mid, { closed: true }), 0.028, { color: IRON, sides: 5, smooth: false, name: "midrail" });
  }

  // lantern room
  b.part(cyl(1.0, 1.08, 0.16, 8), IRON, { at: [0, TOP + 0.2, 0], flat: true, name: "sill" });
  glow(
    b.part(new THREE.CylinderGeometry(0.95, 0.95, GH, 8, 1, true), "#ffffff", {
      at: [0, GL0 + GH / 2, 0],
      texture: LANTERN,
      flat: true,
      name: "glass",
    }),
    1.6,
  );
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    b.part(box(0.075, GH + 0.02, 0.075), IRON, {
      at: [Math.sin(a) * 0.96, GL0 + GH / 2, Math.cos(a) * 0.96],
      dir: radial(a),
      axis: "z",
      name: "mullion",
    });
  }
  b.part(cyl(1.08, 1.0, 0.16, 8), IRON, { at: [0, GL0 + GH + 0.06, 0], flat: true, name: "lanternring" });
  // hot lamp core visible from the top glow
  glow(b.part(ico(1), "#fff6c8", { at: [0, GL0 + GH / 2, 0], scale: 0.45, flat: true }), 2);

  // roof
  b.lathe(
    [
      [0, 0],
      [1.3, 0],
      [1.3, 0.1],
      [1.12, 0.2],
      [0.85, 0.55],
      [0.5, 0.88],
      [0.22, 1.08],
      [0, 1.12],
    ],
    { at: [0, ROOF0, 0], segments: 8, color: roofPaint, name: "roof" },
  );
  b.part(cyl(1.34, 1.34, 0.08, 8), GOLD, { at: [0, ROOF0 + 0.05, 0], flat: true, name: "eavetrim" });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    b.rod([Math.sin(a) * 1.25, ROOF0 + 0.1, Math.cos(a) * 1.25], [Math.sin(a) * 0.12, ROOF0 + 1.1, Math.cos(a) * 0.12], 0.03, {
      color: "#2f6f62",
      sides: 4,
      name: "roofrib",
    });
  }
  const APEX = ROOF0 + 1.12;
  b.part(ico(1), GOLD, { at: [0, APEX + 0.05, 0], scale: 0.17, flat: true, name: "finialball" });
  b.rod([0, APEX, 0], [0, APEX + 1.6, 0], 0.04, { color: IRON, sides: 6, name: "pole" });
  // weathervane
  const VY = APEX + 1.2;
  b.rod([0, VY, -0.4], [0, VY, 0.4], 0.025, { color: IRON, sides: 4 });
  b.rod([-0.3, VY, 0], [0.3, VY, 0], 0.025, { color: IRON, sides: 4 });
  for (const [x, z] of [[0, 0.4], [0, -0.4], [0.3, 0], [-0.3, 0]]) {
    b.part(ico(0), GOLD, { at: [x, VY, z], scale: 0.05, flat: true });
  }
  b.extrude(
    [
      [-0.55, -0.14],
      [-0.3, -0.03],
      [0.4, -0.03],
      [0.4, -0.12],
      [0.7, 0],
      [0.4, 0.12],
      [0.4, 0.03],
      [-0.3, 0.03],
      [-0.55, 0.14],
      [-0.45, 0],
    ],
    { at: [0, VY + 0.3, 0], x: [-1, 0, 0], y: [0, 0, 1], thickness: 0.03, color: GOLD, name: "vane" },
  );
  b.spike([0, APEX + 1.55, 0], [0, 1, 0], 0.3, 0.035, { color: IRON_L, sides: 5 });

  // pirate flag streaming in the wind (+X)
  const FY = APEX + 0.28;
  b.extrude(
    [
      [0, 0],
      [0.4, 0.04],
      [0.9, -0.03],
      [1.4, 0.03],
      [1.2, 0.22],
      [1.55, 0.38],
      [1.25, 0.55],
      [1.45, 0.72],
      [1.0, 0.82],
      [0.5, 0.76],
      [0, 0.8],
    ],
    { at: [0.04, FY, 0], x: [1, 0, 0], thickness: 0.03, color: "#17181d", name: "flag" },
  );
  for (const [zs, dz] of [[1, 0.021], [-1, -0.021]] as [number, number][]) {
    b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", {
      at: [0.7, FY + 0.4, dz],
      dir: [0, 0, zs],
      axis: "z",
      texture: SKULL,
      name: "skull",
    });
  }

  // ------------------------------------------------------------------ BEAMS
  {
    const cy = GL0 + GH / 2;
    const wedge = (w0: number, w1: number, len: number): number[][] => [
      [0.7, -w0],
      [len, -w1],
      [len, w1],
      [0.7, w0],
    ];
    for (const az of [55 * DEG, 235 * DEG]) {
      const d = radial(az);
      const side: [number, number, number] = [-d.z, 0, d.x];
      glow(
        b.extrude(wedge(0.2, 1.0, 7), { at: [0, cy, 0], x: d, y: [0, 1, 0], thickness: 0.04, color: BEAM, name: "beam" }),
        1.3,
      );
      glow(
        b.extrude(wedge(0.2, 1.0, 7), { at: [0, cy, 0], x: d, y: side, thickness: 0.04, color: BEAM, name: "beam" }),
        1.3,
      );
      glow(
        b.extrude(wedge(0.08, 0.42, 7), { at: [0, cy, 0], x: d, y: [0, 1, 0], thickness: 0.06, color: BEAM_CORE, name: "beamcore" }),
        1.6,
      );
      glow(
        b.extrude(wedge(0.08, 0.42, 7), { at: [0, cy, 0], x: d, y: side, thickness: 0.06, color: BEAM_CORE, name: "beamcore" }),
        1.6,
      );
    }
  }

  // ------------------------------------------------------------------ CLOUDS
  function cloud(cx: number, cy: number, cz: number, sc: number, n: number) {
    for (let i = 0; i < n; i++) {
      const s = sc * rr(0.55, 1.05);
      b.part(ico(1), cloudPaint, {
        at: [cx + rr(-1, 1) * sc * 1.1, cy + rr(-0.35, 0.35) * sc, cz + rr(-1, 1) * sc * 0.9],
        scale: [s * 1.3, s * 0.75, s],
        rotation: [rr(0, 40), rr(0, 180), rr(0, 40)],
        flat: true,
        name: "cloud",
      });
    }
  }
  for (let k = 0; k < 8; k++) {
    const a = k * 45 * DEG + 0.2;
    cloud(Math.sin(a) * 8, 13.4 + rr(-0.3, 0.5), Math.cos(a) * 8, 1.7, 6);
  }
  for (let k = 0; k < 6; k++) {
    const a = k * 60 * DEG + 0.5;
    cloud(Math.sin(a) * 5.8, 14.8 + rr(-0.2, 0.4), Math.cos(a) * 5.8, 1.8, 6);
  }
  for (let k = 0; k < 5; k++) {
    const a = k * 72 * DEG + 20 * DEG;
    cloud(Math.sin(a) * 3.6, 16.0 + rr(0, 0.5), Math.cos(a) * 3.6, 1.9, 6);
  }
  cloud(0, 17.0, 0, 2.2, 7);

  // ------------------------------------------------------------------ LIGHTNING
  {
    const bx = 5.3;
    const bz = 2.9;
    const ys = [13.0, 11.6, 10.2, 8.8, 7.4, 6.0, 4.6, 3.2, 1.8, SEA_TOP];
    const xs = [0, 0.55, -0.4, 0.65, -0.5, 0.5, -0.35, 0.4, -0.2, 0.1];
    const bolt = (grow: number, color: string, th: number, dz: number, str: number) => {
      const L: number[][] = [];
      const Rr: number[][] = [];
      ys.forEach((y, i) => {
        const w = (0.2 - i * 0.012) + grow;
        L.push([xs[i] - w, y]);
        Rr.push([xs[i] + w, y]);
      });
      glow(
        b.extrude([...L, ...Rr.reverse()], {
          at: [bx, 0, bz + dz],
          x: [1, 0, 0],
          thickness: th,
          color,
          name: "lightning",
        }),
        str,
      );
    };
    bolt(0.12, BOLT_HALO, 0.1, -0.04, 1.2);
    bolt(0, BOLT, 0.12, 0, 2.2);
    // fork
    glow(
      b.extrude(
        [
          [0, 0],
          [0.9, -1.1],
          [1.5, -1.1],
          [0.7, 0.15],
          [0.15, 0.15],
        ],
        { at: [bx - 0.3 + 0.0, 8.8, bz], x: [1, 0, 0], thickness: 0.08, color: BOLT, name: "fork" },
      ),
      2,
    );
  }

  // ------------------------------------------------------------------ RAIN
  {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; geos.length < 420 && i < 6000; i++) {
      const r = Math.sqrt(R()) * 9.8;
      const a = R() * Math.PI * 2;
      const y = 1.5 + R() * 11;
      if (r < 4.4 && y < 5.6) continue;
      if (r < 2.4) continue;
      const g = new THREE.BoxGeometry(0.022, 0.75, 0.022);
      g.rotateZ(0.22);
      g.translate(Math.sin(a) * r, y, Math.cos(a) * r);
      geos.push(g);
    }
    const merged = mergeGeometries(geos);
    if (merged) b.part(merged, RAIN, { at: [0, 0, 0], name: "rain" });
  }

  // ------------------------------------------------------------------ GRASS (wind-bent)
  {
    const hits = b.surface(cap).scatter(70, {
      rng: rng(5),
      minDist: 0.28,
      filter: (h: { n: THREE.Vector3; at: THREE.Vector3 }) => h.n.y > 0.6 && Math.hypot(h.at.x, h.at.z) > 2.0,
    });
    b.cards(hits, GRASS, {
      size: [0.32, 0.5],
      lean: 40,
      flow: [1, 0, 0.2],
      bend: 25,
      cross: true,
      vary: 0.3,
      rng: rng(6),
      name: "grass",
    });
  }

  return b.root;
}
```