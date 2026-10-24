```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  rng,
  paint,
  noise,
  mix,
  smoothstep,
  grain,
  scales,
  mottle,
  countershade,
  svg,
  catmull,
  frame,
} from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Ashcroft Manor Dollhouse",
  description:
    "A gothic Victorian dollhouse opened like a cutaway: four rooms, a creaky staircase, a watching portrait, a ghost girl in the attic, dust sheets, candlelight and a crow on the roof.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "ashcroft_dollhouse", paintSize: 2048 });
  const R = rng(1887);
  type V = number[];
  type O = { rot?: V; scale?: V; tex?: THREE.Texture; dir?: V; up?: V; axis?: "x" | "y" | "z"; smooth?: boolean };

  // ------------------------------------------------------------------ palette
  const K = {
    ink: "#0e0a14",
    plum0: "#1c1026",
    plum1: "#2c1a3d",
    plum2: "#46295c",
    plum3: "#6a4585",
    lav: "#a58ac4",
    green0: "#1f2c1a",
    green1: "#3a5230",
    glowG: "#b8ff72",
    mint: "#cdeedd",
    wood0: "#24150e",
    wood1: "#3d2415",
    wood2: "#6b4325",
    wood3: "#8d6236",
    bone: "#e9e2cc",
    candle: "#f2e6c0",
    flame: "#ffb340",
    ember: "#ff7a2a",
    velvet: "#5a2a6e",
    velvet2: "#3f1d4f",
    gold: "#c9a24a",
    porcelain: "#cdd8c6",
  };

  // ------------------------------------------------------------------ helpers
  const put = (geo: THREE.BufferGeometry, color: ColorInput, at: V, o: O = {}) => {
    const opts: Record<string, unknown> = { at, flat: !o.smooth };
    if (o.rot) opts.rotation = o.rot;
    if (o.scale) opts.scale = o.scale;
    if (o.tex) opts.texture = o.tex;
    if (o.dir) {
      opts.dir = o.dir;
      if (o.axis) opts.axis = o.axis;
      if (o.up) opts.up = o.up;
    }
    return b.part(geo, color, opts as never);
  };
  const bx = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: ColorInput, o: O = {}) =>
    put(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], o);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const beamXY = (x0: number, y0: number, x1: number, y1: number, thick: number, depth: number, zc: number, color: ColorInput) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    return put(new THREE.BoxGeometry(Math.hypot(dx, dy), thick, depth), color, [(x0 + x1) / 2, (y0 + y1) / 2, zc], {
      rot: [0, 0, (Math.atan2(dy, dx) * 180) / Math.PI],
    });
  };
  const plane = (w: number, h: number, at: V, dir: V, tex: THREE.Texture, o: { up?: V; u?: [number, number] } = {}) => {
    const g = new THREE.PlaneGeometry(w, h);
    if (o.u) {
      const uv = g.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setXY(i, o.u[0] + uv.getX(i) * (o.u[1] - o.u[0]), uv.getY(i));
    }
    return put(g, "#ffffff", at, { dir, axis: "z", up: o.up, tex });
  };
  const mergeAt = (geos: THREE.BufferGeometry[], color: ColorInput) => {
    if (!geos.length) return null;
    const m = mergeGeometries(geos);
    return m ? b.part(m, color, { at: [0, 0, 0], flat: true } as never) : null;
  };
  const rod = (p: V, q: V, r: number, color: ColorInput, sides = 5) => b.rod(p, q, r, { color, sides });

  // ------------------------------------------------------------------ constants
  const F0 = 0.06, C0 = 0.46, F1 = 0.5, C1 = 0.9, F2 = 0.94;
  const XI = 0.57, ZB = -0.22, ZF = 0.25;
  const EV = 0.68, EY = 0.9, RY = 1.49;
  const slopeY = (x: number) => RY - ((RY - EY) / EV) * Math.abs(x);

  // ------------------------------------------------------------------ textures
  const paper = (base: string, motif: string, tile: number, dado: string, rail: string, pool: [number, number, number, string]) => {
    const [px, py, pr, pc] = pool;
    let grooves = "";
    for (let x = 14; x < 560; x += 28) grooves += `<path d="M${x} 290 V392" stroke="#000" stroke-opacity="0.35" stroke-width="2"/>`;
    return svg(
      `<svg viewBox="0 0 560 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="m" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse">${motif}</pattern>
        <radialGradient id="p"><stop offset="0" stop-color="${pc}" stop-opacity="0.8"/><stop offset="1" stop-color="${pc}" stop-opacity="0"/></radialGradient>
        <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.5"/><stop offset="0.22" stop-color="#000" stop-opacity="0"/><stop offset="0.8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient>
      </defs>
      <rect width="560" height="400" fill="${base}"/>
      <rect width="560" height="400" fill="url(#m)"/>
      <ellipse cx="90" cy="50" rx="60" ry="34" fill="#000" opacity="0.16"/>
      <path d="M430 0 Q440 90 432 190" stroke="#1a2a14" stroke-opacity="0.35" stroke-width="12" fill="none"/>
      <rect y="280" width="560" height="120" fill="${dado}"/>
      ${grooves}
      <rect y="274" width="560" height="10" fill="${rail}"/>
      <rect width="560" height="14" fill="${rail}"/>
      <rect y="390" width="560" height="10" fill="#120a0a"/>
      <circle cx="${px}" cy="${py}" r="${pr}" fill="url(#p)"/>
      <rect width="560" height="400" fill="url(#v)"/>
    </svg>`,
      { size: 512 },
    );
  };
  const T = {
    parlour: paper(
      "#3a2148",
      `<path d="M35 6 C48 18 48 30 35 40 C22 30 22 18 35 6Z" fill="#5d3b78"/><path d="M35 40 C28 48 28 58 35 64 C42 58 42 48 35 40Z" fill="#35204a"/><circle cx="0" cy="35" r="6" fill="#4d2f66"/><circle cx="70" cy="35" r="6" fill="#4d2f66"/>`,
      70,
      "#24142e",
      "#8a6a34",
      [250, 300, 230, "#ff9a3c"],
    ),
    hall: paper(
      "#33432a",
      `<rect x="0" width="16" height="70" fill="#40562e"/><rect x="30" width="3" height="70" fill="#7a9a4a" opacity=".5"/><path d="M52 0 Q64 17 52 35 Q40 52 52 70" stroke="#5f7d3a" stroke-width="3" fill="none"/><circle cx="52" cy="35" r="4" fill="#9ab85a" opacity=".6"/>`,
      70,
      "#2a2218",
      "#7a6030",
      [270, 90, 200, "#ffb450"],
    ),
    bed: paper(
      "#4b3f5c",
      `<circle cx="18" cy="18" r="10" fill="#7d4f6e"/><circle cx="18" cy="18" r="5" fill="#5a3650"/><path d="M30 24 q12 -2 14 8 q-10 4 -14 -8Z" fill="#46603a"/><circle cx="52" cy="50" r="8" fill="#6d4562"/><circle cx="52" cy="50" r="4" fill="#4c2d44"/><path d="M14 40 q10 -2 10 10 q-8 2 -10 -10Z" fill="#46603a"/>`,
      64,
      "#2a1a2a",
      "#8a6a34",
      [330, 260, 210, "#ffa24a"],
    ),
    nursery: paper(
      "#3e5a4c",
      `<path d="M20 10 a14 14 0 1 0 16 20 a11 11 0 1 1 -16 -20Z" fill="#c6d68a" opacity=".8"/><path d="M52 52 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2Z" fill="#d9e6a0"/>`,
      70,
      "#233a30",
      "#8a6a34",
      [380, 260, 200, "#ffb055"],
    ),
    window: svg(
      `<svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8ff9a"/><stop offset="0.5" stop-color="#7fc46a"/><stop offset="1" stop-color="#2f5a48"/></linearGradient></defs>
      <path d="M6 220 V80 Q6 16 60 4 Q114 16 114 80 V220Z" fill="#2a1a12"/>
      <path d="M16 214 V80 Q16 26 60 14 Q104 26 104 80 V214Z" fill="url(#g)"/>
      <circle cx="80" cy="56" r="14" fill="#f4ffd8"/>
      <path d="M16 214 V160 Q30 150 34 128 Q40 108 30 92 M34 128 Q52 126 58 112 M30 150 Q10 140 16 132" stroke="#10201a" stroke-width="4" fill="none"/>
      <path d="M60 14 V214 M16 110 H104 M16 164 H104" stroke="#2a1a12" stroke-width="5"/>
    </svg>`,
      { size: 256 },
    ),
    portrait: svg(
      `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="bg" cx="0.5" cy="0.42" r="0.75"><stop offset="0" stop-color="#4a5a38"/><stop offset="1" stop-color="#0d120b"/></radialGradient></defs>
      <rect width="300" height="400" fill="url(#bg)"/>
      <path d="M0 0 H78 Q44 130 66 400 H0Z" fill="#4a1d4c"/>
      <path d="M20 0 Q8 150 28 400 M44 0 Q30 140 46 400" stroke="#2c0f2e" stroke-width="5" fill="none"/>
      <path d="M28 400 Q40 292 112 272 L188 272 Q260 292 272 400Z" fill="#14101a"/>
      <path d="M104 262 Q150 306 196 262 L208 290 Q150 336 92 290Z" fill="#e8e2d0"/>
      <path d="M98 292 Q150 340 202 292" stroke="#b9b09a" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <rect x="128" y="224" width="44" height="52" fill="#cdbfaa"/>
      <ellipse cx="150" cy="168" rx="55" ry="68" fill="#d9cbb6"/>
      <path d="M92 176 Q82 84 150 78 Q218 84 208 176 Q200 118 150 112 Q100 118 92 176Z" fill="#17101e"/>
      <circle cx="90" cy="196" r="17" fill="#17101e"/><circle cx="210" cy="196" r="17" fill="#17101e"/>
      <path d="M150 80 V118" stroke="#3a2c44" stroke-width="3"/>
      <path d="M100 148 Q116 138 134 147 M166 147 Q184 138 200 148" stroke="#2a1d26" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="116" cy="170" rx="19" ry="9" fill="#a89a98" opacity=".5"/><ellipse cx="184" cy="170" rx="19" ry="9" fill="#a89a98" opacity=".5"/>
      <path d="M150 174 L143 208 Q150 213 158 208" stroke="#a89880" stroke-width="3" fill="none"/>
      <path d="M130 230 Q150 238 170 230 Q150 224 130 230Z" fill="#6b2a3a"/>
      <ellipse cx="108" cy="206" rx="12" ry="7" fill="#c98a86" opacity=".35"/><ellipse cx="192" cy="206" rx="12" ry="7" fill="#c98a86" opacity=".35"/>
      <ellipse cx="150" cy="306" rx="11" ry="14" fill="#b08a3a"/><ellipse cx="150" cy="306" rx="7" ry="10" fill="#3b2a55"/>
      <path d="M30 40 L80 120 L60 200 M240 300 L270 360" stroke="#000" stroke-opacity=".35" stroke-width="1.5" fill="none"/>
    </svg>`,
      { size: 512 },
    ),
    eyes: (() => {
      let eyes = "";
      for (const cx of [36, 104])
        eyes += `<path d="M${cx - 15} 20 Q${cx} 8 ${cx + 15} 20 Q${cx} 32 ${cx - 15} 20Z" fill="#e9f6d2"/>
        <circle cx="${cx}" cy="20" r="7" fill="#58d048"/><circle cx="${cx}" cy="20" r="3.2" fill="#06120a"/>
        <circle cx="${cx - 2.5}" cy="17.5" r="1.6" fill="#ffffff"/>
        <path d="M${cx - 16} 20 Q${cx} 6 ${cx + 16} 20" stroke="#1a1220" stroke-width="2.6" fill="none"/>`;
      return svg(`<svg viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg">${eyes}</svg>`, { size: 256 });
    })(),
    ghostFace: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="48" rx="11" ry="14" fill="#06120d"/><ellipse cx="68" cy="48" rx="11" ry="14" fill="#06120d"/>
      <circle cx="34" cy="52" r="3.4" fill="#9dff6a"/><circle cx="70" cy="52" r="3.4" fill="#9dff6a"/>
      <path d="M30 62 Q28 76 32 88 M70 62 Q72 76 68 88" stroke="#06120d" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="80" rx="6" ry="8" fill="#06120d"/>
      <path d="M20 30 Q32 24 44 30 M56 30 Q68 24 80 30" stroke="#2a4a40" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </svg>`,
      { size: 256 },
    ),
    clock: (() => {
      const rom = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
      let nums = "";
      rom.forEach((r, i) => {
        const a = (i * 30 * Math.PI) / 180;
        nums += `<text x="${(50 + 35 * Math.sin(a)).toFixed(1)}" y="${(54 - 35 * Math.cos(a)).toFixed(1)}" text-anchor="middle" font-family="serif" font-size="9" font-weight="bold" fill="#2a1d10">${r}</text>`;
      });
      return svg(
        `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#e6dcc0" stroke="#b8923a" stroke-width="4"/>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#2a1d10" stroke-width="1.2"/>
        ${nums}
        <path d="M50 50 L50 18 M50 50 L45 27" stroke="#1c140c" stroke-width="3" stroke-linecap="round"/>
        <circle cx="50" cy="50" r="3.5" fill="#1c140c"/>
      </svg>`,
        { size: 160 },
      );
    })(),
    rug: svg(
      `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="#3a1a44"/>
      <rect x="10" y="10" width="280" height="180" fill="none" stroke="#c9a24a" stroke-width="4"/>
      <rect x="22" y="22" width="256" height="156" fill="#2a1233" stroke="#7a5a94" stroke-width="3"/>
      <path d="M150 34 L240 100 L150 166 L60 100Z" fill="#4b2a5f" stroke="#c9a24a" stroke-width="3"/>
      <path d="M150 62 L205 100 L150 138 L95 100Z" fill="#2c4a3a" stroke="#9ab85a" stroke-width="2"/>
      <path d="M150 80 a20 20 0 1 0 12 30 a15 15 0 1 1 -12 -30Z" fill="#d9e6a0"/>
      <path d="M0 0 V200 M300 0 V200" stroke="#c9b87a" stroke-width="6" stroke-dasharray="3 5"/>
    </svg>`,
      { size: 384 },
    ),
    plate: svg(
      `<svg viewBox="0 0 400 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="48" fill="#3a2a14"/><rect x="4" y="4" width="392" height="40" fill="none" stroke="#c9a24a" stroke-width="3"/>
      <text x="200" y="32" text-anchor="middle" font-family="serif" font-size="22" font-weight="bold" letter-spacing="3" fill="#d9b866">ASHCROFT MANOR · 1887</text>
    </svg>`,
      { size: 512 },
    ),
    web: (() => {
      let d = "M0 0 L100 0 M0 0 L97 25 M0 0 L87 50 M0 0 L70 70 M0 0 L50 87 M0 0 L25 97 M0 0 L0 100";
      for (const r of [28, 52, 76, 98]) {
        const pts = [0, 22.5, 45, 67.5, 90].map((a) => [r * Math.cos((a * Math.PI) / 180), r * Math.sin((a * Math.PI) / 180)]);
        d += ` M${pts[0][0]} ${pts[0][1]}`;
        for (let i = 1; i < pts.length; i++) {
          const mx = ((pts[i - 1][0] + pts[i][0]) / 2) * 0.86;
          const my = ((pts[i - 1][1] + pts[i][1]) / 2) * 0.86;
          d += ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
        }
      }
      return svg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="${d}" stroke="#dcdfe8" stroke-width="1.8" fill="none"/></svg>`, { size: 256 });
    })(),
  };

  // ------------------------------------------------------------------ paints
  const CLAP = paint((p) => {
    const row = p.y / 0.03;
    const f = row - Math.floor(row);
    let c = mix("#4b3a60", "#66507f", noise(p, 0.12, 3));
    c = mix(c, "#2c4a38", 0.5 * smoothstep(0.5, 0.8, noise(p, 0.05, 8)) * smoothstep(0.35, 0.06, p.y));
    if (f < 0.1) c = mix(c, "#1c1228", 0.75);
    else if (f > 0.9) c = mix(c, "#9a86b4", 0.25);
    return mix(c, "#150d1c", 0.35 * smoothstep(0.7, 1, noise(p, 0.03, 5)));
  });
  const SLABP = paint((p, n) => {
    if (n.y > 0.6) {
      const f = (((p.z / 0.028) % 1) + 1) % 1;
      const c = mix("#4a2c19", "#6b4326", noise(p, 0.05, 2));
      return f < 0.07 ? mix(c, "#170c06", 0.8) : c;
    }
    if (n.y < -0.6) return mix("#8a8296", "#6e6680", noise(p, 0.1, 6));
    return "#241630";
  });
  const PARTP = paint((p, n) => {
    if (Math.abs(n.x) < 0.5) return "#2a1a36";
    const h = p.y - (p.y < 0.48 ? F0 : F1);
    if (h < 0.11) return n.x < 0 ? "#2a1a2a" : "#2a2218";
    if (h < 0.125) return "#8a6a34";
    const st = Math.floor(p.z / 0.028) & 1;
    if (n.x < 0) return p.y < 0.48 ? (st ? "#3a2148" : "#46295c") : st ? "#4b3f5c" : "#56486a";
    return st ? "#33432a" : "#3f5233";
  });
  const WOODP = grain(K.wood1, K.wood2, { size: 0.012, axis: "y" });
  const DARKW = grain("#1d1009", "#3a2314", { size: 0.01, axis: "y" });
  const GILT = metal("gilt", { tarnish: 0.5 });
  const BRASS = metal("brass", { tarnish: 0.6, verdigris: 0.5, polish: 0.1 });
  const IRON = metal("iron");
  const MARBLE = mottle("#2d2838", "#585066", { size: 0.025 });
  const BRICK = scales(["#5b3a3e", "#4a2e36", "#6a4540"], "#1e1318", { size: 0.016, width: 0.14 });
  const SLATE = scales(["#3b2c55", "#46345f", "#2f3f45", "#33284a"], "#150d20", { size: 0.045, width: 0.12 });
  const ROOFB = mottle("#24182f", "#2e2440", { size: 0.06 });
  const SHEETP = paint((p, n) => {
    let c = mix("#c9c3d6", "#ece8f2", noise(p, 0.03, 4));
    const fold = Math.sin((p.x + p.z * 0.7) / 0.011) * 0.5 + 0.5;
    c = mix(c, "#9d97ae", 0.22 * fold * (1 - Math.max(n.y, 0)));
    return mix(c, "#8b8798", 0.5 * smoothstep(0.6, 0.9, noise(p, 0.02, 7)) * smoothstep(0.2, 0.9, n.y));
  });
  const CROWP = countershade("#3a2f52", "#120d1a", { level: 0.1 });

  // ------------------------------------------------------------------ small props
  const candle = (x: number, y: number, z: number, h = 0.035) => {
    put(cyl(0.0065, 0.0075, h, 6), K.candle, [x, y + h / 2, z]);
    put(cyl(0.0012, 0.0012, 0.006, 4), K.ink, [x, y + h + 0.003, z]);
    glow(put(cone(0.0055, 0.02, 6), K.flame, [x, y + h + 0.015, z]), 2.2);
  };
  const web = (cx: number, y: number, z: number, w: number, mirror = false) => {
    b.cards([frame([cx + (mirror ? -w / 2 : w / 2), y - w, z], [0, 1, 0])], T.web, {
      size: [w, w],
      lean: 0,
      flow: [0, 0, 1],
      mirror,
      sink: 0,
    });
  };
  const block = (cx: number, cz: number, y0: number, w: number, d: number, h: number, top = 0.8) => {
    const g = new THREE.CylinderGeometry(0.7071 * top, 0.7071, 1, 4, 1);
    g.rotateY(Math.PI / 4);
    return put(g, SHEETP, [cx, y0 + h / 2, cz], { scale: [w, h, d] });
  };
  const shroud = (cx: number, cz: number, y0: number, w: number, d: number, h: number, top = 0.8) => {
    const hem = new THREE.CylinderGeometry(0.7071, 0.7071, 1, 4, 1);
    hem.rotateY(Math.PI / 4);
    put(hem, SHEETP, [cx, y0 + 0.004, cz], { scale: [w + 0.02, 0.008, d + 0.02] });
    block(cx, cz, y0, w, d, h, top);
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const k = 0.8 + R() * 0.5;
      put(cone(0.012 * k, 0.05 * k, 4), SHEETP, [cx + sx * (w / 2 + 0.004), y0 + 0.025 * k, cz + sz * (d / 2 + 0.004)], {
        rot: [sz * 8, R() * 90, -sx * 8],
      });
    }
    put(ball(0.5, 6, 4), SHEETP, [cx, y0 + h, cz], { scale: [w * 0.7, 0.03, d * 0.7] });
  };
  const curtainRod = (x: number, y: number, z0: number, z1: number) => {
    rod([x, y, z0], [x, y, z1], 0.003, GILT);
    put(ball(0.006, 6, 4), GILT, [x, y, z0]);
    put(ball(0.006, 6, 4), GILT, [x, y, z1]);
  };

  // ================================================================== STRUCTURE
  bx(-0.7, 0.7, 0, 0.035, -0.34, 0.36, DARKW);
  bx(-0.66, 0.66, 0.035, F0, -0.3, 0.32, WOODP);
  plane(0.34, 0.026, [0, 0.0175, 0.3605], [0, 0, 1], T.plate);
  bx(-0.72, -0.68, 0.0, 0.02, 0.2, 0.36, GILT);
  bx(0.68, 0.72, 0.0, 0.02, 0.2, 0.36, GILT);

  // outer walls
  bx(-0.6, -XI, F0, F2, -0.25, 0.25, CLAP);
  bx(XI, 0.6, F0, F2, -0.25, 0.25, CLAP);
  b.extrude(
    [
      [-0.6, F0],
      [0.6, F0],
      [0.6, F2],
      [0, 1.44],
      [-0.6, F2],
    ],
    { at: [0, 0, -0.235], x: [1, 0, 0], thickness: 0.03, color: CLAP },
  );

  // floors / ceilings
  bx(-XI, XI, 0.055, 0.062, ZB, ZF, SLABP);
  bx(-XI, 0.1, C0, F1, ZB, ZF, SLABP);
  bx(0.1, XI, C0, F1, -0.06, ZF, SLABP);
  bx(0.5, XI, C0, F1, ZB, -0.06, SLABP);
  bx(-XI, XI, C1, F2, ZB, ZF, SLABP);
  // front trim: pilasters and string courses
  bx(-0.64, -XI, F0, F2, 0.25, 0.29, WOODP);
  bx(XI, 0.64, F0, F2, 0.25, 0.29, WOODP);
  bx(-0.64, 0.64, C0 - 0.005, F1 + 0.005, 0.25, 0.285, DARKW);
  bx(-0.64, 0.64, C1 - 0.005, F2 + 0.005, 0.25, 0.285, DARKW);
  bx(-0.64, 0.64, C0 + 0.015, C0 + 0.02, 0.285, 0.289, GILT);
  bx(-0.64, 0.64, C1 + 0.015, C1 + 0.02, 0.285, 0.289, GILT);

  // partitions with doorways (door z -0.05..0.12)
  for (const [y0, y1, lint] of [
    [F0, C0, 0.38],
    [F1, C1, 0.82],
  ]) {
    bx(-0.01, 0.01, y0, y1, ZB, -0.05, PARTP);
    bx(-0.01, 0.01, y0, y1, 0.12, ZF, PARTP);
    bx(-0.01, 0.01, lint, y1, -0.05, 0.12, PARTP);
    bx(-0.016, 0.016, y0, lint, -0.056, -0.046, GILT);
    bx(-0.016, 0.016, y0, lint, 0.116, 0.126, GILT);
    bx(-0.016, 0.016, lint - 0.01, lint, -0.056, 0.126, GILT);
  }
  // door ajar into the parlour
  bx(-0.002, 0.002, 0, 0.0, 0, 0, K.ink); // zero-volume guard removed below
  const doorBox = put(new THREE.BoxGeometry(0.012, 0.31, 0.17), DARKW, [-0.08, F0 + 0.155, 0.091], { rot: [0, 70, 0] });
  void doorBox;
  put(ball(0.006, 6, 4), GILT, [-0.115, F0 + 0.15, 0.0]);

  // wallpapers
  plane(0.56, 0.4, [-0.29, 0.26, ZB + 0.0015], [0, 0, 1], T.parlour);
  plane(0.56, 0.4, [0.29, 0.26, ZB + 0.0015], [0, 0, 1], T.hall);
  plane(0.56, 0.4, [-0.29, 0.7, ZB + 0.0015], [0, 0, 1], T.bed);
  plane(0.56, 0.4, [0.29, 0.7, ZB + 0.0015], [0, 0, 1], T.nursery);
  plane(0.47, 0.4, [-0.5685, 0.26, 0.015], [1, 0, 0], T.parlour, { u: [0, 0.84] });
  plane(0.47, 0.4, [-0.5685, 0.7, 0.015], [1, 0, 0], T.bed, { u: [0, 0.84] });
  plane(0.47, 0.4, [0.5685, 0.26, 0.015], [-1, 0, 0], T.hall, { u: [0, 0.84] });
  plane(0.47, 0.4, [0.5685, 0.7, 0.015], [-1, 0, 0], T.nursery, { u: [0, 0.84] });

  // ------------------------------------------------------------------ windows
  const windowAt = (sx: number, yc: number, z: number, interior: boolean) => {
    if (interior) {
      glow(plane(0.104, 0.19, [sx * 0.566, yc, z], [-sx, 0, 0], T.window), 0.85);
      bx(sx * 0.558, sx * 0.568, yc - 0.1, yc - 0.092, z - 0.062, z + 0.062, GILT);
      for (const k of [-1, 1]) {
        bx(sx * 0.545, sx * 0.565, yc - 0.1, yc + 0.1, z + k * 0.07 - 0.015, z + k * 0.07 + 0.015, K.velvet);
        bx(sx * 0.548, sx * 0.563, yc - 0.03, yc - 0.015, z + k * 0.05 - 0.018, z + k * 0.05 + 0.018, K.gold);
      }
      curtainRod(sx * 0.55, yc + 0.108, z - 0.088, z + 0.088);
    } else {
      glow(plane(0.104, 0.19, [sx * 0.6015, yc, z], [sx, 0, 0], T.window), 0.7);
    }
    if (!interior) {
      bx(sx * 0.6, sx * 0.616, yc - 0.1, yc - 0.092, z - 0.07, z + 0.07, DARKW);
      bx(sx * 0.6, sx * 0.608, yc + 0.095, yc + 0.108, z - 0.065, z + 0.065, DARKW);
      put(cone(0.07, 0.035, 4), DARKW, [sx * 0.606, yc + 0.126, z], { rot: [0, 45, 0], scale: [0.35, 1, 1] });
    }
  };
  for (const sx of [1, -1]) {
    windowAt(sx, 0.28, 0.165, true);
    windowAt(sx, 0.72, 0.165, true);
    windowAt(sx, 0.28, 0.165, false);
    windowAt(sx, 0.72, 0.165, false);
    windowAt(sx, 0.28, -0.1, false);
    windowAt(sx, 0.72, -0.1, false);
  }
  // attic window on gable
  glow(plane(0.104, 0.19, [0, 1.12, ZB + 0.0035], [0, 0, 1], T.window), 0.85);
  glow(plane(0.104, 0.19, [0, 1.12, -0.2515], [0, 0, -1], T.window), 0.7);
  bx(-0.058, 0.058, 1.012, 1.02, ZB, ZB + 0.012, GILT);

  // ================================================================== ROOF
  const L = Math.hypot(EV, RY - EY);
  for (const s of [1, -1]) {
    beamXY(s * EV, EY, -s * 0.012, RY + 0.0088, 0.03, 0.7, 0, ROOFB);
    const nx = (s * (RY - EY)) / L;
    const ny = EV / L;
    for (let k = 0; k < 9; k++) {
      const t = (k + 0.5) / 9;
      const px = s * EV * (1 - t);
      const py = EY + (RY - EY) * t;
      const off = 0.02 + (k % 2) * 0.003;
      beamXY(
        px + nx * off - (-s * 0.5) * 0,
        py + ny * off,
        px + nx * off + (s * -EV * 0.14) / 1,
        py + ny * off + ((RY - EY) * 0.14),
        0.008,
        0.69,
        0,
        SLATE,
      );
    }
    // fascia boards front and back
    for (const z of [0.352, -0.352]) beamXY(s * EV, EY - 0.02, 0, RY - 0.02, 0.07, 0.018, z, K.plum2);
    // pendants (gingerbread) merged
    const pend: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const t = 0.06 + (i / 11) * 0.86;
      const px = s * EV * (1 - t) - nx * 0.04;
      const py = EY - 0.02 + (RY - EY) * t - ny * 0.04 - 0.014;
      pend.push(new THREE.ConeGeometry(0.009, 0.03, 4).rotateX(Math.PI).translate(px, py, 0.352));
    }
    mergeAt(pend, GILT);
  }
  bx(-0.03, 0.03, RY - 0.012, RY + 0.03, -0.36, 0.36, K.plum1);
  put(ball(0.014, 6, 5), GILT, [0, RY + 0.045, 0.37]);
  b.spike([0, RY + 0.05, 0.37], [0, RY + 0.12, 0.37], null, 0.006, { color: GILT, sides: 4 });
  put(ball(0.012, 6, 5), GILT, [0, RY + 0.045, -0.37]);
  // chimneys
  const chimney = (x: number, z: number, h: number) => {
    const y0 = slopeY(Math.abs(x) + 0.04) - 0.005;
    bx(x - 0.034, x + 0.034, y0, y0 + h, z - 0.034, z + 0.034, BRICK);
    bx(x - 0.044, x + 0.044, y0 + h - 0.016, y0 + h, z - 0.044, z + 0.044, K.plum1);
    for (const k of [-1, 1]) put(cyl(0.011, 0.013, 0.04, 7), "#6b4a3a", [x + k * 0.017, y0 + h + 0.02, z]);
  };
  chimney(0.32, -0.1, 0.27);
  chimney(-0.36, 0.08, 0.3);
  // rafters + collar beams in the attic
  for (const z of [-0.2, -0.04, 0.2]) {
    for (const s of [1, -1]) beamXY(s * 0.57, slopeY(0.57) - 0.033, 0, slopeY(0) - 0.033, 0.02, 0.016, z, DARKW);
  }
  bx(-0.28, 0.28, 1.2, 1.218, -0.2, -0.186, DARKW);
  bx(-0.28, 0.28, 1.2, 1.218, -0.048, -0.032, DARKW);
  rod([0, 1.44, -0.115], [0, 1.34, -0.115], 0.002, IRON);

  // ================================================================== STAIRCASE
  const N = 9, SX0 = 0.12, SX1 = 0.5, SZ0 = -0.21, SZ1 = -0.07;
  const rise = (F1 - F0) / N;
  const run = (SX1 - SX0) / N;
  const noseY = (x: number) => F0 + rise + (rise / run) * (x - SX0);
  const HR = 0.135;
  const ZR = SZ1 + 0.004;
  const RUN = "#5b1f4a";
  for (let i = 0; i < N; i++) {
    const xa = SX0 + i * run;
    const top = F0 + (i + 1) * rise;
    const creak = i === 3;
    bx(xa - 0.008, xa + run, top - 0.01, top, SZ0, SZ1 + 0.006, creak ? "#2a1a10" : WOODP, creak ? { rot: [0, 0, -6] } : {});
    if (i !== 5) bx(xa - 0.004, xa + 0.004, top - rise, top - 0.01, SZ0, SZ1, DARKW);
    if (!creak) {
      bx(xa - 0.006, xa + run - 0.004, top, top + 0.003, SZ0 + 0.02, SZ1 - 0.02, RUN);
      bx(xa - 0.0068, xa - 0.004, top - rise, top - 0.01, SZ0 + 0.02, SZ1 - 0.02, RUN);
    }
    const xm = xa + run * 0.5;
    const len = noseY(xm) + HR - top;
    put(cyl(0.0022, 0.0022, len, 5), K.wood3, [xm, top + len / 2, ZR]);
  }
  // crack across the creaky step + glow through the missing riser
  bx(SX0 + 3 * run + 0.006, SX0 + 3 * run + 0.032, F0 + 4 * rise - 0.001, F0 + 4 * rise + 0.001, SZ0 + 0.02, SZ1 - 0.03, K.ink);
  glow(bx(SX0 + 5 * run - 0.003, SX0 + 5 * run + 0.001, F0 + 5 * rise, F0 + 6 * rise - 0.01, SZ0 + 0.03, SZ1 - 0.03, "#7fe06a"), 1.4);
  beamXY(SX0 - 0.02, noseY(SX0 - 0.02) - 0.035, 0.476, noseY(0.476) - 0.035, 0.05, 0.008, SZ1 + 0.001, DARKW);
  beamXY(SX0, noseY(SX0) + HR, 0.49, noseY(0.49) + HR, 0.012, 0.012, ZR, WOODP);
  for (const [nxp, base] of [
    [SX0 - 0.006, F0],
    [0.495, F1],
  ]) {
    const top = noseY(nxp) + HR + 0.022;
    put(cyl(0.009, 0.009, top - base, 6), WOODP, [nxp, (top + base) / 2, ZR]);
    put(ball(0.012, 6, 5), GILT, [nxp, top + 0.008, ZR]);
  }
  // first-floor guard rails at the stairwell
  bx(0.088, 0.098, F1 + 0.115, F1 + 0.127, -0.215, -0.07, WOODP);
  for (const z of [-0.21, -0.16, -0.11, -0.07]) put(cyl(0.003, 0.003, 0.115, 5), K.wood3, [0.093, F1 + 0.0575, z]);
  bx(0.1, 0.34, F1 + 0.115, F1 + 0.127, -0.068, -0.056, WOODP);
  for (const x of [0.12, 0.17, 0.22, 0.27, 0.32]) put(cyl(0.003, 0.003, 0.115, 5), K.wood3, [x, F1 + 0.0575, -0.062]);

  // ================================================================== GROUND FLOOR: PARLOUR
  // fireplace
  const FX = -0.3;
  bx(FX - 0.1, FX + 0.1, 0.255, 0.272, ZB, ZB + 0.058, MARBLE);
  bx(FX - 0.095, FX + 0.095, 0.232, 0.256, ZB, ZB + 0.042, MARBLE);
  bx(FX - 0.095, FX - 0.075, F0, 0.232, ZB, ZB + 0.042, MARBLE);
  bx(FX + 0.075, FX + 0.095, F0, 0.232, ZB, ZB + 0.042, MARBLE);
  bx(FX - 0.075, FX + 0.075, F0, 0.232, ZB, ZB + 0.012, K.ink);
  put(cyl(0.008, 0.008, 0.12, 5), K.wood0, [FX - 0.01, F0 + 0.012, ZB + 0.03], { rot: [0, 0, 90] });
  put(cyl(0.007, 0.007, 0.1, 5), K.wood1, [FX + 0.01, F0 + 0.025, ZB + 0.03], { rot: [0, 20, 90] });
  glow(put(ball(0.035, 6, 4), K.ember, [FX, F0 + 0.012, ZB + 0.03], { scale: [1.5, 0.3, 0.8] }), 1.6);
  for (const [dx, h] of [[-0.03, 0.07], [0, 0.1], [0.03, 0.06]]) glow(put(cone(0.014, h, 5), K.glowG, [FX + dx, F0 + 0.02 + h / 2, ZB + 0.03]), 1.8);
  candle(FX - 0.07, 0.272, ZB + 0.025);
  candle(FX + 0.07, 0.272, ZB + 0.025, 0.03);
  put(cyl(0.05, 0.05, 0.004, 12), GILT, [FX, 0.37, ZB + 0.004], { rot: [90, 0, 0], scale: [0.85, 1, 1.45] });
  put(cyl(0.043, 0.043, 0.004, 12), "#587a68", [FX, 0.37, ZB + 0.0065], { rot: [90, 0, 0], scale: [0.85, 1, 1.45] });
  // rug
  plane(0.34, 0.24, [-0.3, 0.0635, 0.02], [0, 1, 0], T.rug, { up: [0, 0, -1] });
  // sheeted sofa + chair
  shroud(-0.505, -0.05, F0, 0.12, 0.27, 0.07);
  block(-0.545, -0.05, F0, 0.05, 0.27, 0.15, 0.8);
  block(-0.505, -0.175, F0, 0.12, 0.035, 0.1, 0.85);
  block(-0.505, 0.075, F0, 0.12, 0.035, 0.1, 0.85);
  shroud(-0.1, -0.16, F0, 0.1, 0.09, 0.06);
  block(-0.1, -0.205, F0, 0.1, 0.03, 0.14, 0.85);
  block(-0.145, -0.16, F0, 0.02, 0.09, 0.09, 0.85);
  block(-0.055, -0.16, F0, 0.02, 0.09, 0.09, 0.85);
  // tea table with candelabra
  const TX = -0.3, TZ = 0.03, TY = F0 + 0.105;
  put(cyl(0.062, 0.06, 0.008, 10), K.wood2, [TX, TY, TZ]);
  put(cyl(0.01, 0.014, 0.1, 7), DARKW, [TX, F0 + 0.055, TZ]);
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 * Math.PI) / 180 + 0.5;
    rod([TX, F0 + 0.02, TZ], [TX + Math.sin(a) * 0.045, F0 + 0.002, TZ + Math.cos(a) * 0.045], 0.005, DARKW);
  }
  put(cyl(0.012, 0.016, 0.006, 8), BRASS, [TX, TY + 0.007, TZ]);
  put(cyl(0.003, 0.004, 0.04, 6), BRASS, [TX, TY + 0.028, TZ]);
  for (const k of [-1, 1]) {
    rod([TX, TY + 0.02, TZ], [TX + k * 0.028, TY + 0.034, TZ], 0.002, BRASS);
    put(cyl(0.006, 0.004, 0.006, 6), BRASS, [TX + k * 0.028, TY + 0.034, TZ]);
    candle(TX + k * 0.028, TY + 0.037, TZ, 0.028);
  }
  candle(TX, TY + 0.048, TZ, 0.03);
  put(ball(0.016, 8, 6), K.porcelain, [TX - 0.04, TY + 0.02, TZ + 0.03], { scale: [1, 0.85, 1] });
  rod([TX - 0.054, TY + 0.02, TZ + 0.03], [TX - 0.07, TY + 0.03, TZ + 0.03], 0.003, K.porcelain);
  put(cyl(0.007, 0.006, 0.008, 6), "#e8f0e4", [TX - 0.04, TY + 0.039, TZ + 0.03]);
  for (const [dx, dz] of [[0.035, 0.035], [0.04, -0.02]]) {
    put(cyl(0.008, 0.006, 0.009, 7), K.porcelain, [TX + dx, TY + 0.0085, TZ + dz]);
  }
  // chandelier
  rod([TX, C0, TZ], [TX, 0.375, TZ], 0.002, IRON);
  put(new THREE.TorusGeometry(0.05, 0.004, 5, 12), BRASS, [TX, 0.37, TZ], { rot: [90, 0, 0] });
  put(ball(0.01, 6, 5), BRASS, [TX, 0.37, TZ]);
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 * Math.PI) / 180;
    candle(TX + Math.sin(a) * 0.05, 0.372, TZ + Math.cos(a) * 0.05, 0.022);
  }
  // gothic details
  web(-XI, C0, ZB + 0.002, 0.14);
  web(-0.01, C0, ZB + 0.002, 0.11, true);
  web(-0.58 + 0.012, C0 - 0.0, 0.2, 0.0001); // negligible, keeps order stable

  // ================================================================== GROUND FLOOR: HALL
  // grandfather clock
  bx(0.015, 0.095, F0, 0.1, -0.21, -0.14, DARKW);
  bx(0.025, 0.085, 0.1, 0.26, -0.205, -0.145, DARKW);
  bx(0.02, 0.09, 0.26, 0.34, -0.21, -0.14, DARKW);
  b.extrude(
    [
      [0, 0],
      [0.075, 0],
      [0.0375, 0.034],
    ],
    { at: [0.0175, 0.34, -0.175], x: [1, 0, 0], thickness: 0.056, color: DARKW },
  );
  put(ball(0.008, 6, 5), GILT, [0.055, 0.382, -0.175]);
  plane(0.058, 0.058, [0.055, 0.3, -0.1385], [0, 0, 1], T.clock);
  bx(0.04, 0.07, 0.13, 0.23, -0.1455, -0.1445, "#0d0b14");
  glow(put(cyl(0.011, 0.011, 0.002, 10), "#c9a24a", [0.055, 0.15, -0.1425], { rot: [90, 0, 0] }), 0.6);
  rod([0.055, 0.225, -0.1425], [0.055, 0.153, -0.1425], 0.0015, GILT);
  // sconce
  rod([0.28, 0.4, ZB + 0.002], [0.28, 0.4, ZB + 0.032], 0.003, BRASS);
  put(cyl(0.012, 0.008, 0.005, 7), BRASS, [0.28, 0.4, ZB + 0.032]);
  candle(0.28, 0.4025, ZB + 0.032, 0.03);
  // console table + lamp
  bx(0.22, 0.38, F0 + 0.09, F0 + 0.1, 0.14, 0.2, WOODP);
  for (const [lx, lz] of [[0.23, 0.15], [0.37, 0.15], [0.23, 0.19], [0.37, 0.19]]) put(cyl(0.003, 0.004, 0.09, 5), DARKW, [lx, F0 + 0.045, lz]);
  put(cyl(0.012, 0.016, 0.014, 8), BRASS, [0.3, F0 + 0.107, 0.17]);
  glow(put(ball(0.017, 8, 6), K.glowG, [0.3, F0 + 0.13, 0.17], { scale: [1, 1.25, 1] }), 1.8);
  put(cyl(0.006, 0.01, 0.006, 8), BRASS, [0.3, F0 + 0.154, 0.17]);
  // sheeted hat stand
  b.lathe(
    [
      [0, 0.17],
      [0.01, 0.165],
      [0.016, 0.14],
      [0.02, 0.08],
      [0.03, 0.02],
      [0.036, 0],
      [0, 0],
    ],
    { at: [0.525, F0, 0.1], segments: 7, color: SHEETP },
  );
  web(XI, C0, ZB + 0.002, 0.13, true);
  web(0.01, C0, 0.0, 0.0001);
  // under-stair keyhole glow on the wall below the steps
  glow(bx(0.4, 0.405, F0 + 0.04, F0 + 0.05, ZB + 0.001, ZB + 0.004, "#8cff6a"), 1.5);

  // ================================================================== FIRST FLOOR: BEDROOM
  for (const [px, pz] of [[-0.555, -0.21], [-0.345, -0.21], [-0.555, 0.085], [-0.345, 0.085]]) {
    put(cyl(0.0075, 0.009, 0.32, 6), DARKW, [px, F1 + 0.16, pz]);
    put(ball(0.011, 6, 5), GILT, [px, F1 + 0.33, pz]);
  }
  bx(-0.565, -0.335, F1 + 0.025, F1 + 0.06, -0.215, 0.09, DARKW);
  bx(-0.565, -0.335, F1, F1 + 0.24, -0.22, -0.205, DARKW);
  put(ball(0.02, 6, 5), GILT, [-0.45, F1 + 0.255, -0.213]);
  bx(-0.565, -0.335, F1, F1 + 0.09, 0.078, 0.09, DARKW);
  shroud(-0.45, -0.06, F1 + 0.06, 0.2, 0.28, 0.035);
  block(-0.45, -0.17, F1 + 0.085, 0.16, 0.07, 0.04, 0.7);
  bx(-0.565, -0.335, F1 + 0.318, F1 + 0.326, -0.215, 0.09, K.velvet2);
  for (const z of [-0.15, -0.08, 0.0, 0.06]) bx(-0.564, -0.559, F1 + 0.326 - (0.17 + R() * 0.08), F1 + 0.326, z - 0.015, z + 0.015, K.velvet);
  for (const z of [-0.12, -0.03, 0.05]) bx(-0.341, -0.336, F1 + 0.326 - (0.14 + R() * 0.08), F1 + 0.326, z - 0.015, z + 0.015, K.velvet2);
  // dresser + nightstand
  shroud(-0.155, -0.17, F1, 0.13, 0.09, 0.12, 0.88);
  bx(-0.32, -0.26, F1, F1 + 0.08, -0.2, -0.14, DARKW);
  put(ball(0.004, 5, 4), GILT, [-0.29, F1 + 0.05, -0.139]);
  candle(-0.29, F1 + 0.08, -0.17, 0.032);
  candle(-0.12, F1 + 0.12, -0.17, 0.03);
  // portrait
  const PX = -0.155, PY = 0.72, PW = 0.174, PH = 0.232, PZ = ZB + 0.002;
  plane(PW, PH, [PX, PY, PZ + 0.003], [0, 0, 1], T.portrait);
  bx(PX - PW / 2 - 0.014, PX + PW / 2 + 0.014, PY + PH / 2, PY + PH / 2 + 0.014, PZ, PZ + 0.012, GILT);
  bx(PX - PW / 2 - 0.014, PX + PW / 2 + 0.014, PY - PH / 2 - 0.014, PY - PH / 2, PZ, PZ + 0.012, GILT);
  bx(PX - PW / 2 - 0.014, PX - PW / 2, PY - PH / 2, PY + PH / 2, PZ, PZ + 0.012, GILT);
  bx(PX + PW / 2, PX + PW / 2 + 0.014, PY - PH / 2, PY + PH / 2, PZ, PZ + 0.012, GILT);
  for (const [cx, cy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(ball(0.011, 6, 5), GILT, [PX + cx * (PW / 2 + 0.007), PY + cy * (PH / 2 + 0.007), PZ + 0.009]);
  put(ball(0.012, 6, 5), GILT, [PX, PY + PH / 2 + 0.02, PZ + 0.008]);
  bx(PX - 0.02, PX + 0.02, PY - PH / 2 - 0.03, PY - PH / 2 - 0.018, PZ, PZ + 0.006, GILT);
  glow(plane(140 * 0.00058, 40 * 0.00058, [PX, PY + 0.0186, PZ + 0.0045], [0, 0, 1], T.eyes), 1.25);
  rod([PX - 0.05, PY + PH / 2 + 0.07, PZ], [PX - PW / 2 - 0.007, PY + PH / 2 + 0.007, PZ + 0.008], 0.0015, IRON);
  rod([PX + 0.05, PY + PH / 2 + 0.07, PZ], [PX + PW / 2 + 0.007, PY + PH / 2 + 0.007, PZ + 0.008], 0.0015, IRON);
  // picture light
  bx(PX - 0.03, PX + 0.03, PY + PH / 2 + 0.03, PY + PH / 2 + 0.036, PZ + 0.008, PZ + 0.02, BRASS);
  glow(bx(PX - 0.027, PX + 0.027, PY + PH / 2 + 0.0295, PY + PH / 2 + 0.03, PZ + 0.009, PZ + 0.019, "#ffc766"), 1.8);
  web(-0.01, C1, ZB + 0.002, 0.13, true);
  web(-XI, C1, ZB + 0.002, 0.1);

  // ================================================================== FIRST FLOOR: NURSERY
  // bookcase on the right wall
  const BCX = 0.51, BCZ0 = -0.04, BCZ1 = 0.1;
  bx(0.565, XI, F1, F1 + 0.31, BCZ0, BCZ1, DARKW);
  bx(BCX, 0.565, F1, F1 + 0.31, BCZ0, BCZ0 + 0.008, DARKW);
  bx(BCX, 0.565, F1, F1 + 0.31, BCZ1 - 0.008, BCZ1, DARKW);
  for (let i = 0; i <= 4; i++) bx(BCX, 0.565, F1 + i * 0.075, F1 + i * 0.075 + 0.008, BCZ0, BCZ1, DARKW);
  bx(BCX - 0.008, XI, F1 + 0.31, F1 + 0.322, BCZ0 - 0.006, BCZ1 + 0.006, DARKW);
  const bookCols = ["#6b1d2e", "#2f4a5c", "#3f5a2a", "#5a2a6e", "#8a6a34"];
  const bookGeos: THREE.BufferGeometry[][] = bookCols.map(() => []);
  for (let s = 0; s < 4; s++) {
    let z = BCZ0 + 0.012;
    while (z < BCZ1 - 0.016) {
      const w = 0.006 + R() * 0.008;
      const h = 0.045 + R() * 0.022;
      const ci = Math.floor(R() * bookCols.length);
      if (R() > 0.1) bookGeos[ci].push(new THREE.BoxGeometry(0.04, h, w).translate(0.54, F1 + s * 0.075 + 0.008 + h / 2, z + w / 2));
      z += w + 0.001;
    }
  }
  bookGeos.forEach((g, i) => mergeAt(g, bookCols[i]));
  // rocking horse
  const HX = 0.17, HZ = 0.08, HY = F1;
  const rkY = (zl: number) => HY + 0.004 + 0.03 * Math.pow(zl / 0.075, 2);
  for (const k of [-1, 1]) {
    const pts: V[] = [];
    for (let i = 0; i <= 6; i++) {
      const zl = -0.075 + (i / 6) * 0.15;
      pts.push([HX + k * 0.024, rkY(zl) + 0.003, HZ + zl]);
    }
    b.sweep(catmull(pts), 0.004, { color: DARKW, sides: 5 });
    for (const zl of [0.045, -0.04]) rod([HX + k * 0.013, HY + 0.065, HZ + zl * 0.6], [HX + k * 0.022, rkY(zl) + 0.003, HZ + zl], 0.004, K.wood2);
  }
  const HC = "#8d8a98";
  b.sweep(catmull([[HX, HY + 0.07, HZ - 0.045], [HX, HY + 0.075, HZ], [HX, HY + 0.075, HZ + 0.03]]), [0.02, 0.024, 0.02], { color: HC, sides: 6 });
  b.sweep(catmull([[HX, HY + 0.08, HZ + 0.03], [HX, HY + 0.115, HZ + 0.05]]), [0.017, 0.012], { color: HC, sides: 6 });
  put(ball(0.013, 7, 5), HC, [HX, HY + 0.125, HZ + 0.058], { scale: [0.8, 1, 1.2] });
  b.sweep(catmull([[HX, HY + 0.12, HZ + 0.062], [HX, HY + 0.107, HZ + 0.086]]), [0.011, 0.009], { color: HC, sides: 6 });
  for (const k of [-1, 1]) {
    put(cone(0.005, 0.014, 4), HC, [HX + k * 0.008, HY + 0.145, HZ + 0.052]);
    put(ball(0.0035, 5, 4), K.ink, [HX + k * 0.01, HY + 0.128, HZ + 0.066]);
  }
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    b.spike([HX, HY + 0.082 + t * 0.04, HZ + 0.034 + t * 0.016], [HX, HY + 0.095 + t * 0.04, HZ + 0.02 + t * 0.012], null, 0.006, { color: K.plum3, sides: 4 });
  }
  b.sweep(catmull([[HX, HY + 0.075, HZ - 0.05], [HX, HY + 0.062, HZ - 0.09], [HX, HY + 0.03, HZ - 0.095]]), [0.009, 0.003], { color: K.plum3, sides: 4 });
  bx(HX - 0.015, HX + 0.015, HY + 0.093, HY + 0.1, HZ - 0.01, HZ + 0.02, K.velvet);
  // table, book, candle
  const NX = 0.36, NZ = 0.185, NY = F1 + 0.09;
  bx(NX - 0.055, NX + 0.055, NY - 0.008, NY, NZ - 0.04, NZ + 0.04, WOODP);
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(cyl(0.004, 0.003, 0.082, 5), DARKW, [NX + lx * 0.05, F1 + 0.041, NZ + lz * 0.035]);
  bx(NX - 0.045, NX - 0.003, NY, NY + 0.004, NZ - 0.025, NZ + 0.02, K.bone);
  bx(NX + 0.003, NX + 0.045, NY, NY + 0.004, NZ - 0.025, NZ + 0.02, K.bone);
  bx(NX - 0.003, NX + 0.003, NY, NY + 0.006, NZ - 0.025, NZ + 0.02, "#6b1d2e");
  candle(NX + 0.035, NY, NZ + 0.03, 0.03);
  // sheeted chair + toy blocks
  shroud(0.455, 0.1, F1, 0.06, 0.06, 0.07, 0.85);
  block(0.478, 0.1, F1, 0.018, 0.06, 0.13, 0.85);
  const toy: [number, number, number, number, string][] = [[0.27, 0.15, 0.022, 20, "#6b1d2e"], [0.3, 0.17, 0.022, -15, "#2f4a5c"], [0.285, 0.16, 0.022, 40, "#3f5a2a"]];
  toy.forEach(([tx, tz, s, rr, c], i) => put(new THREE.BoxGeometry(s, s, s), c, [tx, F1 + s / 2 + (i === 2 ? s : 0), tz], { rot: [0, rr, 0] }));
  web(0.01, C1, ZB + 0.002, 0.13);
  web(XI, C1, ZB + 0.002, 0.12, true);

  // ================================================================== ATTIC
  // trunk, dress form, lantern, motes
  block(-0.36, -0.12, F2, 0.14, 0.09, 0.05, 1);
  bx(-0.43, -0.29, F2, F2 + 0.05, -0.165, -0.075, "#4a2c19");
  put(cyl(0.7071 * 0.6, 0.7071, 1, 4), "#5a3820", [-0.36, F2 + 0.065, -0.12], { rot: [0, 45, 0], scale: [0.14, 0.03, 0.09] });
  for (const x of [-0.41, -0.31]) bx(x - 0.004, x + 0.004, F2, F2 + 0.06, -0.166, -0.074, IRON);
  put(cyl(0.005, 0.005, 0.004, 6), GILT, [-0.36, F2 + 0.045, -0.073], { rot: [90, 0, 0] });
  b.lathe(
    [
      [0, 0.17],
      [0.008, 0.166],
      [0.018, 0.155],
      [0.03, 0.12],
      [0.026, 0.09],
      [0.034, 0.06],
      [0.05, 0.02],
      [0.05, 0.0],
      [0, 0],
    ],
    { at: [0.32, F2 + 0.07, -0.1], segments: 8, color: "#4c6b3a" },
  );
  rod([0.32, F2, -0.1], [0.32, F2 + 0.07, -0.1], 0.004, DARKW);
  put(cyl(0.035, 0.04, 0.008, 6), DARKW, [0.32, F2 + 0.004, -0.1]);
  put(ball(0.01, 6, 5), K.bone, [0.32, F2 + 0.25, -0.1]);
  // hanging green lantern
  put(cyl(0.012, 0.014, 0.004, 6), IRON, [0.0, 1.318, -0.115]);
  glow(put(cyl(0.011, 0.011, 0.028, 6), K.glowG, [0.0, 1.298, -0.115]), 1.8);
  put(cone(0.016, 0.014, 6), IRON, [0.0, 1.325, -0.115]);
  // cobwebs under the roof
  web(0, 1.44, ZB + 0.002, 0.14);
  web(0, 1.44, ZB + 0.002, 0.14, true);
  web(-0.52, 1.12, ZB + 0.002, 0.1);
  web(0.52, 1.12, ZB + 0.002, 0.1, true);
  // dust motes
  const motes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 46; i++) {
    const room = Math.floor(R() * 5);
    const x = (room % 2 === 0 ? -1 : 1) * (0.05 + R() * 0.48);
    const y = room < 2 ? 0.12 + R() * 0.3 : room < 4 ? 0.56 + R() * 0.3 : 1.0 + R() * 0.25;
    const z = -0.18 + R() * 0.38;
    motes.push(new THREE.OctahedronGeometry(0.0018 + R() * 0.0012, 0).translate(room === 4 ? x * 0.5 : x, y, z));
  }
  const moteMesh = mergeAt(motes, "#e9f6c0");
  if (moteMesh) glow(moteMesh, 1.2);

  // ================================================================== GHOST GIRL
  const GX = 0.0, GZ = 0.02, GB = F2 + 0.03;
  const GHOST = "#cfeee0";
  glow(put(cyl(0.075, 0.075, 0.002, 14), "#6fd08a", [GX, F2 + 0.001, GZ]), 0.9);
  glow(
    b.lathe(
      [
        [0, 0.115],
        [0.014, 0.113],
        [0.02, 0.1],
        [0.028, 0.07],
        [0.046, 0.022],
        [0.052, 0],
        [0, 0],
      ],
      { at: [GX, GB + 0.05, GZ], segments: 10, color: GHOST },
    ),
    0.9,
  );
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 * Math.PI) / 180;
    const tip = 0.02 + (i % 3) * 0.012;
    glow(
      b.spike(
        [GX + Math.sin(a) * 0.044, GB + 0.056, GZ + Math.cos(a) * 0.044],
        [GX + Math.sin(a) * 0.056, GB - 0.02 + tip * 0.2 + (i % 2) * 0.01, GZ + Math.cos(a) * 0.056],
        null,
        0.011,
        { color: GHOST, sides: 4 },
      ),
      0.9,
    );
  }
  glow(put(cyl(0.03, 0.017, 0.012, 8), "#f0fff6", [GX, GB + 0.172, GZ]), 1);
  for (const k of [-1, 1]) {
    const hand = k > 0 ? [GX + 0.052, GB + 0.2, GZ + 0.07] : [GX - 0.042, GB + 0.12, GZ + 0.018];
    glow(rod([GX + k * 0.022, GB + 0.163, GZ], [hand[0], hand[1], hand[2]], 0.007, GHOST, 5), 0.9);
    glow(put(ball(0.009, 6, 4), GHOST, hand), 1);
  }
  const head = put(ball(0.031, 9, 7), "#e4fbef", [GX, GB + 0.208, GZ], { scale: [1, 1.05, 1] });
  glow(head, 1);
  b.decal(head, T.ghostFace, { at: [GX, GB + 0.208, GZ + 0.03], dir: [0, 0, 1], size: [0.054, 0.054], segments: 8 });
  put(new THREE.SphereGeometry(0.0345, 9, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), "#233a35", [GX, GB + 0.21, GZ - 0.001], { rot: [-35, 0, 0], scale: [1, 1.05, 1] });
  for (const k of [-1, 1]) {
    b.sweep(catmull([[GX + k * 0.03, GB + 0.205, GZ - 0.004], [GX + k * 0.05, GB + 0.18, GZ], [GX + k * 0.056, GB + 0.14, GZ + 0.004]]), [0.009, 0.003], {
      color: "#233a35",
      sides: 5,
      caps: { end: "point" },
    });
    put(cone(0.009, 0.016, 4), "#9a3a5a", [GX + k * 0.032, GB + 0.226, GZ - 0.002], { rot: [0, 0, -k * 70] });
    put(ball(0.004, 5, 4), "#9a3a5a", [GX + k * 0.032, GB + 0.226, GZ - 0.002]);
  }
  // trailing ectoplasm swirl
  glow(
    b.sweep(catmull([[GX - 0.03, GB + 0.01, GZ + 0.04], [GX - 0.09, GB - 0.005, GZ + 0.06], [GX - 0.14, GB + 0.02, GZ + 0.02], [GX - 0.17, GB + 0.05, GZ - 0.03]]), [0.008, 0.001], {
      color: "#9fe8c0",
      sides: 5,
      caps: { end: "point" },
    }),
    0.8,
  );
  // teddy bear
  const TB = "#8a7a6a";
  put(ball(0.016, 7, 5), TB, [-0.12, F2 + 0.016, 0.07], { scale: [1, 1.1, 0.9] });
  put(ball(0.012, 7, 5), TB, [-0.12, F2 + 0.04, 0.072]);
  for (const k of [-1, 1]) {
    put(ball(0.005, 5, 4), TB, [-0.12 + k * 0.01, F2 + 0.05, 0.07]);
    put(ball(0.005, 5, 4), TB, [-0.12 + k * 0.018, F2 + 0.02, 0.078]);
    put(ball(0.0028, 5, 4), K.ink, [-0.12 + k * 0.005, F2 + 0.042, 0.083]);
  }

  // ================================================================== CROW
  const CX = 0.0, CY = RY + 0.03, CZ = 0.22;
  const yaw = 38;
  const ya = (yaw * Math.PI) / 180;
  const cp = (x: number, y: number, z: number): V => [CX + x * Math.cos(ya) + z * Math.sin(ya), CY + y, CZ - x * Math.sin(ya) + z * Math.cos(ya)];
  const cd = (x: number, y: number, z: number): V => [x * Math.cos(ya) + z * Math.sin(ya), y, -x * Math.sin(ya) + z * Math.cos(ya)];
  b.sweep(catmull([cp(0, 0.047, -0.045), cp(0, 0.05, -0.005), cp(0, 0.056, 0.03)]), [0.018, 0.028, 0.022], { color: CROWP, sides: 7 });
  put(ball(0.026, 8, 6), CROWP, cp(0, 0.054, 0.022), { rot: [0, yaw, 0], scale: [1, 1, 1.1] });
  put(ball(0.02, 8, 6), CROWP, cp(0, 0.085, 0.043));
  b.spike(cp(0, 0.084, 0.058), cp(0, 0.079, 0.095), null, 0.0095, { color: "#4a4650", sides: 5 });
  b.spike(cp(0, 0.077, 0.058), cp(0, 0.066, 0.086), null, 0.0062, { color: "#2c2a34", sides: 5 });
  for (const k of [-1, 1]) {
    glow(put(ball(0.0048, 6, 4), "#d9ff7a", cp(k * 0.0145, 0.09, 0.05)), 2);
    put(ball(0.0022, 5, 4), K.ink, cp(k * 0.0175, 0.09, 0.053));
    b.extrude(
      [
        [0, 0],
        [0.012, 0.012],
        [0.04, 0.012],
        [0.075, -0.004],
        [0.092, -0.02],
        [0.06, -0.018],
        [0.03, -0.026],
        [0.005, -0.026],
      ],
      { at: cp(k * 0.026, 0.066, 0.025), x: cd(0, 0, -1), thickness: 0.007, color: "#2a2038", smoothing: 1 },
    );
    rod(cp(k * 0.011, 0.036, 0), cp(k * 0.01, 0.0, 0.004), 0.0025, "#2c2a34", 4);
    for (const t of [-1, 0, 1]) b.spike(cp(k * 0.01, 0.002, 0.004), cp(k * 0.01 + t * 0.006, 0.0, 0.02), null, 0.0022, { color: "#2c2a34", sides: 4 });
  }
  b.extrude(
    [
      [-0.008, 0],
      [0.008, 0],
      [0.026, 0.07],
      [0.012, 0.08],
      [0, 0.074],
      [-0.012, 0.08],
      [-0.026, 0.07],
    ],
    { at: cp(0, 0.046, -0.042), x: cd(1, 0, 0), y: cd(0, 0, -1), thickness: 0.006, color: "#241b32" },
  );

  return b.root;
}
```