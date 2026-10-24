```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, frame, rng, catmull, mix, noise, cells, paint, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Kintsugi Goldfish Bowl",
  description:
    "An indigo and ash-glazed Japanese bowl mended with gold lacquer seams, holding water with a rigged orange-and-white wakin goldfish swimming inside. Plum-branch brushwork, a potter's seal and a rippled water surface.",
};

export default function build() {
  const b = createBuilder({ name: "kintsugi_goldfish_bowl" });
  const R = rng(11);
  type J = ReturnType<typeof b.joint>;

  // ------------------------------------------------------------------------------------------------------------
  // Constants
  const YW = 0.102; // water level
  const rootJ = b.joint("root", { at: [0, 0.04, 0], dir: [0, 1, 0] });

  // ------------------------------------------------------------------------------------------------------------
  // Bowl profile (r, y)
  const OUT: [number, number][] = [
    [0.04, 0],
    [0.056, 0],
    [0.06, 0.011],
    [0.078, 0.022],
    [0.1, 0.05],
    [0.118, 0.08],
    [0.128, 0.104],
    [0.1325, 0.118],
    [0.1295, 0.1205],
    [0.1255, 0.1185],
    [0.1245, 0.104],
    [0.113, 0.08],
    [0.096, 0.056],
    [0.072, 0.034],
    [0.04, 0.021],
    [0, 0.017],
    [0, 0.006],
    [0.04, 0.006],
  ];
  // Visible surface, from the inside centre up the inner wall, over the rim, down the outside to the foot.
  const VP: [number, number][] = [
    [0, 0.017],
    [0.04, 0.021],
    [0.072, 0.034],
    [0.096, 0.056],
    [0.113, 0.08],
    [0.1245, 0.104],
    [0.1255, 0.1185],
    [0.1295, 0.1205],
    [0.1325, 0.118],
    [0.128, 0.104],
    [0.118, 0.08],
    [0.1, 0.05],
    [0.078, 0.022],
    [0.06, 0.011],
    [0.056, 0],
  ];
  const CUM: number[] = [0];
  for (let i = 1; i < VP.length; i++)
    CUM.push(CUM[i - 1] + Math.hypot(VP[i][0] - VP[i - 1][0], VP[i][1] - VP[i - 1][1]));
  const TOTAL = CUM[CUM.length - 1];

  function surf(u: number, th: number, lift = 0) {
    const uu = Math.min(Math.max(u, 0), TOTAL);
    let i = 0;
    while (i < VP.length - 2 && CUM[i + 1] < uu) i++;
    const [r0, y0] = VP[i];
    const [r1, y1] = VP[i + 1];
    const f = (uu - CUM[i]) / (CUM[i + 1] - CUM[i]);
    const r = r0 + (r1 - r0) * f;
    const y = y0 + (y1 - y0) * f;
    const dr = r1 - r0;
    const dy = y1 - y0;
    const len = Math.hypot(dr, dy);
    const nr = -dy / len;
    const ny = dr / len;
    const rr = r + nr * lift;
    const yy = y + ny * lift;
    return {
      p: new THREE.Vector3(rr * Math.sin(th), yy, rr * Math.cos(th)),
      n: new THREE.Vector3(nr * Math.sin(th), ny, nr * Math.cos(th)),
    };
  }
  function uOn(i0: number, i1: number, y: number) {
    for (let i = i0; i < i1; i++) {
      const ya = VP[i][1];
      const yb = VP[i + 1][1];
      if ((y - ya) * (y - yb) <= 0 && ya !== yb) return CUM[i] + ((y - ya) / (yb - ya)) * (CUM[i + 1] - CUM[i]);
    }
    return CUM[i0];
  }
  const uIn = (y: number) => uOn(0, 6, y);
  const uOut = (y: number) => uOn(8, 14, y);
  const uRim = (f: number) => CUM[6] + f * (CUM[8] - CUM[6]);
  const RW = surf(uIn(YW), 0, 0).p.z - 0.0012; // water disc radius

  // ------------------------------------------------------------------------------------------------------------
  // Palette and paints
  const GOLD = paint((p, n) => {
    const k = noise(p, 0.012, 3);
    const c = mix("#c98a2a", "#ffe28c", 0.3 + 0.55 * k);
    return mix(c, "#fff7cf", 0.4 * smoothstep(0.3, 1, n.y));
  });

  const GLAZE = paint((p, n) => {
    const th = Math.atan2(p.x, p.z);
    const rad = n.x * p.x + n.z * p.z;
    // Unglazed clay of the foot and underside.
    if (n.y < -0.9 && p.y < 0.009) {
      return mix("#9a6240", "#c48e62", noise(p, 0.012, 4));
    }
    // Iron-brown rim band.
    if (p.y > 0.1135 && n.y > 0.35) {
      return mix("#4a2f22", "#85583a", noise(p, 0.018, 8));
    }
    const inside = rad < -1e-7 || (n.y > 0.9 && p.y < 0.05);
    if (inside) {
      const sp = cells(p, 0.009, 5);
      if (p.y > YW + 0.0015) {
        let c = mix("#f0f0dc", "#d6e4cc", noise(p, 0.03, 6));
        if (sp.d1 < 0.1 && sp.id > 0.6) c = mix(c, "#6a8060", 0.7);
        return c;
      }
      if (Math.abs(p.y - YW) < 0.0026) return mix("#a9d9d3", "#ffffff", 0.35);
      const deep = smoothstep(0.1, 0.02, p.y);
      let c = mix(mix("#a4dccf", "#68b4b6", deep), mix("#5fa6ad", "#3f8a98", noise(p, 0.04, 9)), 0.35 * deep);
      const r = Math.hypot(p.x, p.z);
      if (n.y > 0.9 && Math.sin(r * 300) > 0.88) c = mix(c, "#2f7384", 0.5);
      if (sp.d1 < 0.09 && sp.id > 0.65) c = mix(c, "#2a5a5e", 0.7);
      return c;
    }
    // Exterior.
    const clayEdge = 0.012 + 0.004 * noise(p, 0.02, 12);
    if (p.y < clayEdge) return mix("#a56b46", "#7a4a30", smoothstep(0.004, 0.012, p.y) * 0.6);
    const drip =
      0.094 +
      0.012 * Math.sin(th * 3 + 0.6) +
      0.008 * Math.sin(th * 7 + 2) +
      0.03 * (noise(p, 0.045, 5) - 0.5);
    const d = p.y - drip;
    if (d > 0) {
      let c = mix("#f0e9d6", "#d9cdae", noise(p, 0.03, 4));
      const sp = cells(p, 0.008, 7);
      if (sp.d1 < 0.09 && sp.id > 0.55) c = mix(c, "#7a5a3a", 0.6);
      if (d < 0.003) c = mix(c, "#6f86b6", 0.7);
      return c;
    }
    let c = mix("#18223f", "#2e4a7c", smoothstep(0.35, 0.78, noise(p, 0.04, 2)));
    const sp = cells(p, 0.007, 6);
    if (sp.d1 < 0.09 && sp.id > 0.6) c = mix(c, "#6b8cc4", 0.55);
    if (sp.d1 < 0.07 && sp.id < 0.1) c = mix(c, "#7a4a2a", 0.6);
    if (d > -0.012) c = mix(c, "#4a68a0", 0.55 * smoothstep(-0.012, -0.001, d));
    c = mix(c, "#4a3a34", smoothstep(0.034, 0.016, p.y) * 0.6);
    return c;
  });

  const bowl = b.lathe(OUT, { at: [0, 0, 0], bone: rootJ, segments: 24, color: GLAZE });

  // ------------------------------------------------------------------------------------------------------------
  // Kintsugi: gold seams along the cracks
  type Ctl = [number, number];
  type CP = { u: number; th: number; p: THREE.Vector3; n: THREE.Vector3 };
  const DUST: THREE.BufferGeometry[] = [];

  function crack(ctl: Ctl[], jit = 0.02): CP[] {
    const out: CP[] = [];
    const add = (u: number, th: number) => {
      const s = surf(u, th, 0.0015);
      const last = out[out.length - 1];
      if (last && last.p.distanceTo(s.p) < 0.002) return;
      out.push({ u, th, p: s.p, n: s.n });
    };
    for (let i = 0; i < ctl.length - 1; i++) {
      const [t0, u0] = ctl[i];
      const [t1, u1] = ctl[i + 1];
      const dist = Math.hypot(u1 - u0, (t1 - t0) * 0.11);
      const N = Math.max(1, Math.ceil(dist / 0.0075));
      const fs: { f: number; v: boolean }[] = [];
      for (let j = 0; j <= N; j++) fs.push({ f: j / N, v: j === 0 || j === N });
      if (u1 !== u0)
        for (const c of CUM) {
          const f = (c - u0) / (u1 - u0);
          if (f > 0.02 && f < 0.98) fs.push({ f, v: true });
        }
      fs.sort((a, c) => a.f - c.f);
      for (const { f, v } of fs) {
        const j = v ? 0 : (R() - 0.5) * 2;
        add(u0 + (u1 - u0) * f + j * jit * 0.06, t0 + (t1 - t0) * f + j * jit);
      }
    }
    return out;
  }

  function lay(pts: CP[], w = 0.0024) {
    if (pts.length < 2) return;
    b.sweep(catmull(pts.map((c) => c.p)), (t: number) => 0.0008 + w * Math.min(1, t * 6, (1 - t) * 6), {
      bone: rootJ,
      color: GOLD,
      section: { ngon: 5 },
    });
    for (let i = 1; i < pts.length - 1; i += 2) {
      if (R() < 0.7) {
        const s = surf(pts[i].u + (R() - 0.5) * 0.01, pts[i].th + (R() - 0.5) * 0.07, 0.0004);
        DUST.push(new THREE.OctahedronGeometry(0.0008 + R() * 0.0011, 0).translate(s.p.x, s.p.y, s.p.z));
      }
    }
  }

  // A: front right, rim to foot, with two forks
  lay(
    crack([
      [0.84, uIn(0.092)],
      [0.9, uRim(0.5)],
      [0.95, uOut(0.098)],
      [0.9, uOut(0.082)],
      [1.0, uOut(0.066)],
      [0.96, uOut(0.05)],
      [1.04, uOut(0.036)],
      [1.0, uOut(0.022)],
      [1.05, uOut(0.013)],
    ]),
    0.0027,
  );
  lay(
    crack([
      [0.96, uOut(0.05)],
      [0.88, uOut(0.04)],
      [0.8, uOut(0.046)],
      [0.74, uOut(0.034)],
    ]),
    0.0018,
  );
  lay(
    crack([
      [1.0, uOut(0.066)],
      [1.1, uOut(0.06)],
      [1.17, uOut(0.066)],
      [1.26, uOut(0.056)],
    ]),
    0.0018,
  );
  // B: front left
  lay(
    crack([
      [-0.8, uIn(0.085)],
      [-0.78, uRim(0.5)],
      [-0.74, uOut(0.098)],
      [-0.82, uOut(0.082)],
      [-0.76, uOut(0.066)],
      [-0.84, uOut(0.052)],
      [-0.8, uOut(0.04)],
    ]),
    0.0024,
  );
  lay(
    crack([
      [-0.82, uOut(0.082)],
      [-0.92, uOut(0.088)],
      [-1.0, uOut(0.078)],
      [-1.08, uOut(0.082)],
    ]),
    0.0017,
  );
  // C: inside back right, floor to outside
  lay(
    crack([
      [2.4, uIn(0.022)],
      [2.45, uIn(0.038)],
      [2.38, uIn(0.058)],
      [2.48, uIn(0.078)],
      [2.42, uIn(0.098)],
      [2.46, uRim(0.5)],
      [2.5, uOut(0.104)],
      [2.44, uOut(0.088)],
      [2.52, uOut(0.07)],
    ]),
    0.0027,
  );
  lay(
    crack([
      [2.38, uIn(0.058)],
      [2.28, uIn(0.052)],
      [2.18, uIn(0.06)],
      [2.08, uIn(0.05)],
    ]),
    0.0018,
  );
  // D: inside back left
  lay(
    crack([
      [-2.7, uIn(0.03)],
      [-2.62, uIn(0.05)],
      [-2.72, uIn(0.07)],
      [-2.66, uIn(0.09)],
      [-2.7, uRim(0.5)],
      [-2.66, uOut(0.1)],
    ]),
    0.0024,
  );
  // E: across the floor
  lay(
    crack([
      [-2.6, CUM[1] * 0.45],
      [-2.6, 0],
      [0.5, 0],
      [0.5, CUM[1] * 0.4],
      [0.4, CUM[1] * 0.9],
      [0.55, CUM[2] * 0.8],
    ]),
    0.0022,
  );

  // Gold lip repair on the front rim
  {
    const lip: THREE.Vector3[] = [];
    for (let th = 0.18; th <= 0.58; th += 0.035) lip.push(surf(uRim(0.5), th, 0.0013).p);
    b.sweep(catmull(lip), 0.0034, { bone: rootJ, color: GOLD, section: { ngon: 6 } });
  }
  // Gold-filled chips
  const patch = (th: number, y: number, r: number) => {
    const s = surf(uOut(y), th, 0);
    b.stick(new THREE.CylinderGeometry(r * 0.85, r, 0.0035, 7), GOLD, frame(s.p, s.n), { bone: rootJ, embed: 0.45 });
  };
  patch(1.58, 0.072, 0.011);
  patch(1.52, 0.064, 0.0065);
  patch(1.66, 0.08, 0.005);
  patch(-2.1, 0.09, 0.007);

  b.part(mergeGeometries(DUST)!, GOLD, { bone: rootJ, at: [0, 0, 0], flat: true });

  // ------------------------------------------------------------------------------------------------------------
  // Bowl brushwork
  const blossom = (cx: number, cy: number, r: number) => {
    let s = "";
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 * Math.PI) / 180 - Math.PI / 2;
      s += `<circle cx="${(cx + Math.cos(a) * r * 0.62).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.62).toFixed(1)}" r="${(r * 0.52).toFixed(1)}" fill="#fbf3e4" stroke="#c9a58c" stroke-width="0.9"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.3).toFixed(1)}" fill="#d94a63"/>`;
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 * Math.PI) / 180;
      s += `<path d="M${cx} ${cy} L${(cx + Math.cos(a) * r * 0.5).toFixed(1)} ${(cy + Math.sin(a) * r * 0.5).toFixed(1)}" stroke="#f2c14e" stroke-width="0.9" stroke-linecap="round"/>`;
    }
    return s;
  };
  const PLUM = svg(
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 76 C26 70 44 58 60 46 S96 24 116 8" stroke="#2b1e2c" stroke-width="5.4" fill="none" stroke-linecap="round"/>
      <path d="M2 76 C26 70 44 58 60 46 S96 24 116 8" stroke="#eadfc6" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M34 64 C38 54 36 44 40 33" stroke="#eadfc6" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M62 45 C72 48 84 46 95 53" stroke="#eadfc6" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M90 28 C92 20 98 16 107 15" stroke="#eadfc6" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M48 56 C44 62 38 66 30 66" stroke="#eadfc6" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${blossom(40, 31, 7.5)}${blossom(96, 53, 7)}${blossom(108, 14, 6.5)}${blossom(74, 37, 6)}${blossom(22, 67, 6)}
      <circle cx="28" cy="58" r="2.6" fill="#e58aa0"/><circle cx="56" cy="38" r="2.4" fill="#e58aa0"/><circle cx="84" cy="24" r="2.6" fill="#e58aa0"/>
    </svg>`,
    { size: 640 },
  );
  const PETALS = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="14" cy="12" rx="6" ry="4" transform="rotate(-30 14 12)" fill="#fbf3e4" stroke="#c9a58c" stroke-width="0.9"/>
      <ellipse cx="38" cy="22" rx="6" ry="4" transform="rotate(25 38 22)" fill="#fbf3e4" stroke="#c9a58c" stroke-width="0.9"/>
      <ellipse cx="22" cy="31" rx="5" ry="3.4" transform="rotate(60 22 31)" fill="#f3d3d9" stroke="#c9a58c" stroke-width="0.9"/>
      <ellipse cx="50" cy="9" rx="5" ry="3.4" transform="rotate(-10 50 9)" fill="#f3d3d9" stroke="#c9a58c" stroke-width="0.9"/>
    </svg>`,
    { size: 256 },
  );
  const SEAL = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="36" rx="4" fill="#c9341f"/>
      <path d="M10 12 H30 M10 20 H30 M10 28 H30 M20 8 V32 M13 8 L13 14" stroke="#f6e6c8" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 160 },
  );
  b.decal(bowl, PLUM, {
    at: surf(uOut(0.062), -0.12).p,
    dir: [0, 0.05, 1],
    up: [0, 1, 0],
    size: [0.095, 0.063],
    bone: rootJ,
  });
  b.decal(bowl, SEAL, {
    at: surf(uOut(0.036), 0.58).p,
    dir: [Math.sin(0.58), 0.1, Math.cos(0.58)],
    up: [0, 1, 0],
    size: [0.015, 0.015],
    bone: rootJ,
  });
  for (const th of [-1.55, 2.9]) {
    const s = surf(uOut(0.07), th);
    b.decal(bowl, PETALS, {
      at: s.p,
      dir: [Math.sin(th), 0.15, Math.cos(th)],
      up: [0, 1, 0],
      size: [0.04, 0.027],
      bone: rootJ,
    });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Fish frame helpers: fish-local (x left, y up, z forward) -> model
  const HEADING = THREE.MathUtils.degToRad(52);
  const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), HEADING);
  const qYi = qY.clone().invert();
  const heading = new THREE.Vector3(0, 0, 1).applyQuaternion(qY);
  const FO = new THREE.Vector3(0, 0.06, 0).addScaledVector(heading, 0.022);
  const fp = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(qY).add(FO);
  const fd = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(qY);
  const fpv = (v: THREE.Vector3) => fp(v.x, v.y, v.z);
  const fdv = (v: THREE.Vector3) => fd(v.x, v.y, v.z);
  const fl = (p: THREE.Vector3) => p.clone().sub(FO).applyQuaternion(qYi);
  const bx = (z: number) => (z < 0 ? -0.012 * Math.pow(z / -0.046, 2) : 0);
  const bodyPt = (z: number) => fp(bx(z), 0, z);
  const ell = (rx: number, ry: number, rz: number, w = 8, h = 6) =>
    new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);

  // ------------------------------------------------------------------------------------------------------------
  // Fish textures
  const rays = (bxp: number, byp: number, tips: [number, number][], col = "#b8300f") =>
    `<path d="${tips.map(([x, y]) => `M${bxp} ${byp} L${x} ${y}`).join(" ")}" stroke="${col}" stroke-opacity="0.4" stroke-width="1.1" stroke-linecap="round" fill="none"/>`;
  const GRAD = `<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e03a14"/><stop offset="0.5" stop-color="#ff8a3c"/><stop offset="1" stop-color="#fff0dc"/></linearGradient></defs>`;

  const TAIL = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">${GRAD}
      <path d="M50 118 C46 100 34 92 22 78 C8 62 2 44 6 26 C8 14 16 6 22 12 C26 16 26 24 30 18 C34 8 40 2 46 6 C50 9 50 14 52 10 C56 2 64 2 70 8 C76 14 74 22 80 16 C86 8 94 10 96 22 C100 40 94 62 80 78 C68 92 56 102 50 118Z" fill="url(#g)" stroke="#c7340f" stroke-width="1.6" stroke-linejoin="round"/>
      ${rays(50, 112, [[14, 34], [24, 20], [38, 12], [52, 14], [64, 11], [78, 20], [90, 32], [30, 56], [70, 56]])}
    </svg>`,
    { size: 320 },
  );
  const dorsalBody = `<path d="M4 70 C10 52 18 36 30 28 C36 24 40 30 46 22 C54 12 60 14 66 8 C76 0 88 2 98 6 C94 28 90 50 88 70Z" fill="url(#g)" stroke="#c7340f" stroke-width="1.6" stroke-linejoin="round"/>${rays(46, 68, [[30, 34], [44, 28], [58, 20], [72, 12], [88, 12], [90, 40]])}`;
  const DORSAL = svg(`<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">${GRAD}${dorsalBody}</svg>`, { size: 256 });
  const DORSAL_B = svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">${GRAD}<g transform="translate(100 0) scale(-1 1)">${dorsalBody}</g></svg>`,
    { size: 256 },
  );
  const PECT = svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">${GRAD}
      <path d="M30 98 C22 80 8 66 6 46 C4 30 10 16 18 12 C22 24 24 10 30 4 C36 10 38 22 42 12 C50 16 56 30 54 46 C52 66 38 80 30 98Z" fill="url(#g)" stroke="#c7340f" stroke-width="1.5" stroke-linejoin="round"/>
      ${rays(30, 92, [[12, 48], [20, 24], [30, 12], [40, 24], [48, 48]])}
    </svg>`,
    { size: 192 },
  );
  const GILL = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6 C30 22 30 58 8 74" stroke="#b3300f" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M15 16 C27 29 27 51 15 64" stroke="#ffc08a" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Fish skeleton
  const core = b.joint("core", { parent: rootJ, at: fp(0, 0, 0), dir: fd(0, 0, 1), role: "spine" });
  const BODYZ = [-0.046, -0.036, -0.024, -0.012, 0, 0.012, 0.024, 0.034, 0.042];
  const body = catmull(BODYZ.map((z) => bodyPt(z)));
  const rootT = body.closestT(fp(0, 0, 0));
  const headAt = fp(0, 0, 0.03);
  const headT = body.closestT(headAt);
  const back = b.chain("tail", body.slice(rootT, 0), { parent: core, count: 4, role: "tail" });
  const front = b.chain("spine", body.slice(rootT, headT), { parent: core, count: 2, role: "spine" });
  const head = b.joint("head", {
    parent: front.joints[front.joints.length - 1],
    at: headAt,
    dir: fd(0, 0, 1),
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: fp(0, -0.003, 0.04), dir: fd(0, 0.02, 1), role: "jaw" });
  const tailEnd = back.joints[back.joints.length - 1];

  // ------------------------------------------------------------------------------------------------------------
  // Fish body
  const KEYS: [number, number, number][] = [
    [-0.046, 0.002, 0.0045],
    [-0.036, 0.0045, 0.0085],
    [-0.024, 0.0085, 0.0135],
    [-0.01, 0.013, 0.0185],
    [0.004, 0.0148, 0.0205],
    [0.016, 0.0148, 0.0195],
    [0.028, 0.0125, 0.016],
    [0.036, 0.0095, 0.0125],
    [0.042, 0.005, 0.0068],
  ];
  function prof(z: number): [number, number] {
    if (z <= KEYS[0][0]) return [KEYS[0][1], KEYS[0][2]];
    for (let i = 0; i < KEYS.length - 1; i++) {
      if (z <= KEYS[i + 1][0]) {
        let f = (z - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]);
        f = f * f * (3 - 2 * f);
        return [KEYS[i][1] + (KEYS[i + 1][1] - KEYS[i][1]) * f, KEYS[i][2] + (KEYS[i + 1][2] - KEYS[i][2]) * f];
      }
    }
    const k = KEYS[KEYS.length - 1];
    return [k[1], k[2]];
  }

  const FISH = paint((p, n) => {
    const l = fl(p);
    const z = l.z;
    let c = mix("#ff5d1f", "#ff8a3a", noise(l, 0.03, 2));
    c = mix(c, "#ffc58a", smoothstep(0.1, -0.7, n.y));
    c = mix(c, "#f2371a", smoothstep(0.024, 0.036, z) * 0.8);
    const pm = smoothstep(0.575, 0.62, noise(l, 0.04, 21)) * smoothstep(0.034, 0.02, z) * smoothstep(-0.04, -0.028, z);
    c = mix(c, "#fff5ea", pm);
    c = mix(c, "#d63a14", 0.25 * smoothstep(0.8, 0.95, n.y));
    const cl = cells(l, 0.0068, 5);
    const edge = 1 - smoothstep(0.03, 0.11, cl.d2 - cl.d1);
    return mix(c, "#b0502a", edge * 0.28);
  });

  const bodyTube = b.sweep(body, (t: number) => prof(fl(body.at(t)).z), {
    bone: [back, core, front, head],
    color: FISH,
    sides: 10,
  });

  for (const s of [1, -1]) {
    b.decal(bodyTube, GILL, {
      at: fp(s * 0.0135, -0.001, 0.021),
      dir: fd(s, 0, 0),
      up: fd(0, 1, 0),
      size: [0.012, 0.026],
      mirror: s < 0,
    });
  }

  // Eyes
  for (const s of [1, -1]) {
    const c = fp(s * 0.0118, 0.004, 0.03);
    const g = fd(s * 0.85, 0.12, 0.5).normalize();
    b.part(ell(0.0072, 0.0072, 0.0072, 10, 8), "#e0a22c", { bone: head, at: c });
    b.part(ell(0.0052, 0.0052, 0.0052, 8, 6), "#120d0a", { bone: head, at: c.clone().addScaledVector(g, 0.0032) });
    b.part(ell(0.0014, 0.0014, 0.0014, 5, 4), "#ffffff", {
      bone: head,
      at: c.clone().addScaledVector(g, 0.0068).addScaledVector(fd(0, 1, 0), 0.0018),
    });
  }
  // Mouth: separate upper lip and lower jaw
  b.part(ell(0.0035, 0.0016, 0.004, 6, 4), "#6e1a12", { bone: head, at: fp(0, -0.0006, 0.0488) });
  b.part(ell(0.0062, 0.0042, 0.0058), "#ff6a2c", { bone: head, at: fp(0, 0.0028, 0.0462), flat: true });
  b.part(ell(0.005, 0.003, 0.0058), "#ff7a38", { bone: jaw, at: fp(0, -0.004, 0.045), flat: true });
  // Nostril dots
  for (const s of [1, -1]) b.part(ell(0.0012, 0.0012, 0.0012, 4, 3), "#8a2208", { bone: head, at: fp(s * 0.0042, 0.0075, 0.042) });

  // ------------------------------------------------------------------------------------------------------------
  // Fins: back-to-back textured planes so each is seen from both sides
  function finPair(
    bone: J,
    baseL: THREE.Vector3,
    dirL: THREE.Vector3,
    normL: THREE.Vector3,
    w: number,
    h: number,
    texA: THREE.Texture,
    texB: THREE.Texture = texA,
  ) {
    const dir = dirL.clone().normalize();
    const nrm = normL.clone().addScaledVector(dir, -normL.dot(dir)).normalize();
    const c = baseL.clone().addScaledVector(dir, h / 2);
    for (const sg of [1, -1]) {
      const nL = nrm.clone().multiplyScalar(sg);
      b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
        bone,
        at: fpv(c.clone().addScaledVector(nL, 0.0005)),
        dir: fdv(nL),
        up: fdv(dir),
        axis: "z",
        texture: sg > 0 ? texA : texB,
      });
    }
  }
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Dorsal
  const dorsalJ = b.joint("dorsalFin", { parent: core, at: fp(0, 0.0125, -0.006), dir: fd(0, 0.97, -0.24), role: "fan" });
  finPair(dorsalJ, V(0, 0.0125, -0.006), V(0, 0.97, -0.24), V(1, 0, 0), 0.046, 0.03, DORSAL, DORSAL_B);
  // Pectorals and pelvics
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pec = b.joint(`pectoral${side}`, {
      parent: front.joints[1],
      at: fp(s * 0.0125, -0.0065, 0.013),
      dir: fd(s * 0.55, -0.12, -0.83),
      role: "fan",
    });
    finPair(pec, V(s * 0.0125, -0.0065, 0.013), V(s * 0.55, -0.12, -0.83), V(0, 1, 0), 0.017, 0.028, PECT);
    const pel = b.joint(`pelvic${side}`, {
      parent: core,
      at: fp(s * 0.0075, -0.0175, -0.006),
      dir: fd(s * 0.35, -0.3, -0.88),
      role: "fan",
    });
    finPair(pel, V(s * 0.0075, -0.0175, -0.006), V(s * 0.35, -0.3, -0.88), V(0, 1, 0), 0.012, 0.02, PECT);
  }
  // Anal fin
  const analJ = b.joint("analFin", { parent: back.joints[1], at: fp(bx(-0.028), -0.0105, -0.028), dir: fd(0, -0.45, -0.89), role: "fan" });
  finPair(analJ, V(bx(-0.028), -0.0105, -0.028), V(0, -0.45, -0.89), V(1, 0, 0), 0.014, 0.018, PECT);
  // Tail: a centre veil and two rolled lobes
  const tb = V(bx(-0.04), 0, -0.04);
  const tdir = V(-0.4, 0.03, -1);
  const lobes: [number, number, number][] = [
    [0, 0.046, 0.052],
    [38, 0.04, 0.047],
    [-38, 0.04, 0.047],
  ];
  for (const [deg, w, h] of lobes) {
    const a = THREE.MathUtils.degToRad(deg);
    finPair(tailEnd, tb, tdir, V(Math.cos(a), Math.sin(a), 0), w, h, TAIL);
  }

  // ------------------------------------------------------------------------------------------------------------
  // Water: ripple rings on a cut-out disc, plus a meniscus line at the wall
  const rc = fp(0.004, 0, -0.004);
  const cx = 50 + (rc.x / RW) * 50;
  const cy = 50 + (rc.z / RW) * 50;
  const ring = (r: number, dash: string, op: number) =>
    `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${((r / RW) * 50).toFixed(2)}" fill="none" stroke="#f2ffff" stroke-opacity="${op}" stroke-width="1.1" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
  const RIPPLE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${ring(0.012, "10 4 6 3", 0.95)}${ring(0.024, "26 7 14 5", 0.9)}${ring(0.037, "36 10 22 8", 0.85)}
      ${ring(0.052, "50 12 26 9", 0.8)}${ring(0.07, "70 16 30 12", 0.75)}${ring(0.09, "90 20 40 14", 0.7)}
      <circle cx="50" cy="50" r="48.4" fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="1.8"/>
      <path d="M22 26 Q28 20 36 18 M68 78 Q74 72 80 64 M76 30 Q80 34 82 40 M30 76 Q34 80 40 82" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.CircleGeometry(RW, 28), "#ffffff", {
    bone: rootJ,
    at: [0, YW + 0.0004, 0],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: RIPPLE,
  });
  {
    const wl: THREE.Vector3[] = [];
    const rr = RW + 0.0006;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      wl.push(new THREE.Vector3(rr * Math.sin(a), YW, rr * Math.cos(a)));
    }
    b.sweep(catmull(wl, { closed: true }), 0.0011, { bone: rootJ, color: "#dff6f2", sides: 6 });
  }

  return b.root;
}
```