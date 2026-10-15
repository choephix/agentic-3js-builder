import * as THREE from "three";
import { createBuilder, catmull, polyline, paint, svg, offset, DEG } from "../../../../src/index";
import { metal, gaugeTexture, coil, gearGeometry } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Overwatch Chopper",
  description:
    "A custom chopper in a heroic hero-shooter style: raked springer fork, ape-hanger bars, teardrop flame tank, V-twin with a glowing energy core, hex-grid hubs, on a glowing hex stage.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "chopper" });
  const G = 0.05; // stage thickness; the bike stands on it
  const v = (x: number, y: number, z: number): V => [x, y + G, z];

  // ------------------------------------------------------------------ palette
  const ORANGE = "#f99e1a";
  const WHITE = "#eef2f6";
  const CYAN = "#46d4ff";
  const NAVY = "#232a3b";
  const NAVY_L = "#3a4560";
  const LEATHER = "#4a3426";
  const AMBER = "#ffb21c";
  const RED = "#ff3a2e";
  const GLASS = "#bfeaff";
  const SPOKE = "#c4cddc";
  const CHAIN = "#2b2f3a";
  const HOLO = "#7fe9ff";
  const CHROMEF = "#d3dae6";
  const INKC = "#16181f";

  const BODY = cel(ORANGE, "#cf5a14");
  const BODY_W = cel(WHITE, "#a9b8d8");
  const DARKP = cel(NAVY, "#171c29");
  const CHROME = metal("steel", { polish: 0.8, tarnish: 0.05 });
  const FRAME = metal("iron", { size: 0.05, polish: 0.4 });
  const BRASS = metal("brass", { polish: 0.5 });

  const TANK = cel(
    paint((p, n) => {
      if (n.y > 0.2 && Math.abs(p.x) < 0.017) return WHITE;
      if (n.y > 0.2 && Math.abs(p.x) < 0.029) return CYAN;
      if (n.y < -0.35) return NAVY_L;
      return ORANGE;
    }),
    "#cf5a14",
  );

  const SEAT = paint((p, n) => {
    if (n.y > 0.3 && (Math.abs(Math.abs(p.x) - 0.075) < 0.004 || Math.abs(p.x) < 0.0025)) return "#e9b66a";
    return n.y > 0.5 ? "#5a3f2e" : "#3b2a20";
  });

  const hexInfo = (x: number, z: number, s: number) => {
    const q = ((2 / 3) * x) / s;
    const r = (-x / 3 + (Math.sqrt(3) / 3) * z) / s;
    let rx = Math.round(q);
    let rz = Math.round(r);
    let ry = Math.round(-q - r);
    const dx = Math.abs(rx - q);
    const dy = Math.abs(ry + q + r);
    const dz = Math.abs(rz - r);
    if (dx > dy && dx > dz) rx = -ry - rz;
    else if (dy > dz) ry = -rx - rz;
    else rz = -rx - ry;
    const cx = s * 1.5 * rx;
    const cz = s * Math.sqrt(3) * (rz + rx / 2);
    const lx = Math.abs(x - cx);
    const lz = Math.abs(z - cz);
    const e = Math.max(lz / (0.866 * s), (0.866 * lx + 0.5 * lz) / (0.866 * s));
    return { e, id: (((rx - rz) % 3) + 3) % 3 };
  };
  const STAGE = paint((p, n) => {
    if (n.y < 0.7) return "#141926";
    const h = hexInfo(p.x, p.z, 0.15);
    if (h.e > 0.92) return "#3b4a6b";
    return ["#1c2232", "#222a3d", "#192030"][h.id];
  });

  const tirePaint = (c: V, ringR: number) =>
    paint((p, n, s) => {
      const r = Math.hypot(p.y - c[1], p.z - c[2]);
      if (Math.abs(n.x) > 0.7 && Math.abs(r - ringR) < 0.008) return ORANGE;
      if (Math.abs(n.x) < 0.5) return Math.floor(s[0] * 40) % 2 ? "#1d2029" : "#0f1116";
      return "#16181f";
    });

  // ------------------------------------------------------------------ textures
  const hexSvg = (line: string, fill: string, hot: string) => {
    const s = 11;
    const w = Math.sqrt(3) * s;
    let cells = "";
    for (let r = -5; r <= 5; r++)
      for (let q = -5; q <= 5; q++) {
        const cx = 50 + s * 1.5 * q;
        const cy = 50 + w * (r + q / 2);
        if (Math.hypot(cx - 50, cy - 50) > 52) continue;
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3;
          return `${(cx + s * 0.92 * Math.cos(a)).toFixed(1)},${(cy + s * 0.92 * Math.sin(a)).toFixed(1)}`;
        }).join(" ");
        const lit = (((q * 7 + r * 13) % 5) + 5) % 5 === 0;
        cells += `<polygon points="${pts}" fill="${lit ? hot : fill}" stroke="${line}" stroke-width="1.6"/>`;
      }
    return svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="${fill}"/>${cells}<circle cx="50" cy="50" r="47" fill="none" stroke="${line}" stroke-width="4"/></svg>`,
      { size: 256 },
    );
  };
  const HEX_CYAN = hexSvg("#46d4ff", "#0d1a2c", "#9af0ff");
  const HEX_ORANGE = hexSvg("#ffb13a", "#2a1204", "#ffe08a");

  const FLAME = svg(
    `<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
      <defs><path id="f" d="M0 70 C2 52 10 40 22 36 C26 28 24 20 34 8 C38 22 46 24 50 30 C56 22 62 18 74 14 C72 24 78 30 84 34 C92 32 100 34 108 40 C104 44 108 50 120 54 L120 70 Z"/></defs>
      <use href="#f" fill="#c9380f" stroke="#2a1008" stroke-width="3"/>
      <use href="#f" fill="#ff9a1c" transform="translate(0 21) scale(0.92 0.7)"/>
      <use href="#f" fill="#ffe27a" transform="translate(0 38.5) scale(0.82 0.45)"/>
    </svg>`,
    { size: 256 },
  );

  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#1d2331" stroke="#f99e1a" stroke-width="6"/>
      <path d="M20 66 L50 26 L80 66 L66 66 L50 44 L34 66Z" fill="#f99e1a" stroke="#0f121a" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M36 78 L50 62 L64 78Z" fill="#eef2f6"/>
    </svg>`,
    { size: 256 },
  );

  const LENS = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#bff4ff"/><stop offset="1" stop-color="#2aa8e0"/></radialGradient></defs>
      <circle cx="50" cy="50" r="50" fill="url(#g)"/>
      <g stroke="#7ad8ff" stroke-width="2.2" fill="none"><circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="14"/>
      <path d="M50 0V100M0 50H100M15 15L85 85M85 15L15 85" opacity="0.7"/></g>
    </svg>`,
    { size: 256 },
  );

  const CRATE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#2c3750"/>
      <rect x="4" y="4" width="92" height="92" fill="none" stroke="#f99e1a" stroke-width="5"/>
      <path d="M8 8L92 92M92 8L8 92" stroke="#3d4b6c" stroke-width="5"/>
      <rect x="14" y="38" width="72" height="24" fill="#1a2030"/>
      <text x="50" y="56" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="17" fill="#eef2f6">SUPPLY</text>
    </svg>`,
    { size: 192 },
  );

  const OILTAG = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" rx="5" fill="#eef2f6"/><rect x="3" y="3" width="54" height="34" rx="3" fill="none" stroke="#f99e1a" stroke-width="3"/><text x="30" y="27" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="#232a3b">OIL</text></svg>`,
    { size: 128 },
  );

  const GAUGE = gaugeTexture({ label: "KM/H", needle: 60 });

  // ------------------------------------------------------------------ skeleton
  const AXF = v(0, 0.34, 0.95);
  const AXR = v(0, 0.33, -0.75);
  const U = { y: Math.cos(38 * DEG), z: -Math.sin(38 * DEG) };
  const forkPt = (s: number, x = 0): V => [x, AXF[1] + U.y * s, AXF[2] + U.z * s];
  const UP: V = [0, U.y, U.z];

  const root = b.joint("frame", { at: v(0, 0.6, 0), role: "spine" });
  const steer = b.joint("steer", { parent: root, at: forkPt(0.8), aim: forkPt(0), role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXF, dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: root, at: AXR, dir: [1, 0, 0], role: "hinge" });
  const stand = b.joint("kickstand", { parent: root, at: v(0.17, 0.34, -0.08), dir: [0.5, -0.7, 0], role: "hinge" });

  const P = (geo: THREE.BufferGeometry, color: any, o: any = {}) => b.part(geo, color, { bone: root, ...o });
  const rod = (a: any, c: any, r: number, color: any, o: any = {}) => b.rod(a, c, r, color, { bone: root, ...o });
  const tube = (pts: number[][], r: any, color: any, o: any = {}) =>
    b.sweep(catmull(pts), r, { bone: root, color, sides: 8, ...o });

  // ------------------------------------------------------------------ stage
  const hz = 1.4;
  const hx = 0.66;
  const c = 0.3;
  const stageOutline: [number, number][] = [
    [-hz + c, -hx],
    [hz - c, -hx],
    [hz, -hx + c],
    [hz, hx - c],
    [hz - c, hx],
    [-hz + c, hx],
    [-hz, hx - c],
    [-hz, -hx + c],
  ];
  b.extrude(stageOutline, {
    at: [0, G / 2, 0.1],
    x: [0, 0, 1],
    y: [1, 0, 0],
    thickness: G,
    bevel: 0.006,
    color: STAGE,
    bone: root,
  });
  const trimPts = stageOutline.map(([z, x]) => [x * 0.93, G + 0.004, z * 0.95 + 0.1]);
  glow(b.sweep(polyline(trimPts, { closed: true }), 0.01, { bone: root, color: ORANGE, sides: 6 }), 1.3);
  for (const [z, x] of stageOutline)
    glow(P(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), ORANGE, { at: [x * 0.93, G + 0.01, z * 0.95 + 0.1] }), 1.2);

  // ------------------------------------------------------------------ wheels
  const wheel = (
    bone: any,
    ctr: V,
    o: { R: number; tr: number; sz: number; hubR: number; hubW: number; flange: number; hoop: number; n: number; rimR: number },
  ) => {
    const major = o.R - o.tr;
    b.part(new THREE.TorusGeometry(major, o.tr, 8, 22), tirePaint(ctr, major - 0.4 * o.tr), {
      bone,
      at: ctr,
      dir: [1, 0, 0],
      axis: "z",
      scale: [1, 1, o.sz],
    });
    for (const sg of [1, -1]) {
      b.part(new THREE.TorusGeometry(o.rimR, 0.013, 6, 26), CHROME, {
        bone,
        at: [ctr[0] + sg * o.hoop, ctr[1], ctr[2]],
        dir: [1, 0, 0],
        axis: "z",
      });
      glow(
        b.part(new THREE.TorusGeometry(o.hubR * 0.72, 0.006, 6, 18), CYAN, {
          bone,
          at: [ctr[0] + sg * (o.hubW + 0.001), ctr[1], ctr[2]],
          dir: [1, 0, 0],
          axis: "z",
        }),
        1.4,
      );
      b.part(new THREE.CylinderGeometry(o.hubR * 0.35, o.hubR * 0.35, 0.03, 8), CHROME, {
        bone,
        at: [ctr[0] + sg * (o.hubW + 0.012), ctr[1], ctr[2]],
        dir: [1, 0, 0],
      });
    }
    for (let i = 0; i < o.n; i++) {
      const sg = i % 2 ? 1 : -1;
      const a = (i / o.n) * Math.PI * 2;
      const a2 = a + sg * 0.16;
      const hubPt: V = [ctr[0] + sg * o.flange, ctr[1] + o.hubR * Math.sin(a), ctr[2] + o.hubR * Math.cos(a)];
      const rimPt: V = [ctr[0] + sg * o.hoop, ctr[1] + o.rimR * Math.sin(a2), ctr[2] + o.rimR * Math.cos(a2)];
      b.rod(hubPt, rimPt, 0.0045, SPOKE, { bone, sides: 4 });
    }
    const hw = o.hubW;
    const hr = o.hubR;
    b.lathe(
      [
        [0, -hw],
        [hr * 0.9, -hw],
        [hr, -hw + 0.01],
        [hr, hw - 0.01],
        [hr * 0.9, hw],
        [0, hw],
      ],
      { at: ctr, axis: [1, 0, 0], color: CHROME, bone },
    );
  };

  wheel(wheelF, AXF, { R: 0.34, tr: 0.045, sz: 1, hubR: 0.05, hubW: 0.05, flange: 0.035, hoop: 0.027, n: 16, rimR: 0.256 });
  wheel(wheelR, AXR, { R: 0.33, tr: 0.09, sz: 1.1, hubR: 0.075, hubW: 0.075, flange: 0.06, hoop: 0.06, n: 16, rimR: 0.15 });

  // front brake disc + caliper
  b.lathe(
    [
      [0.07, -0.004],
      [0.135, -0.004],
      [0.135, 0.004],
      [0.07, 0.004],
    ],
    { at: [AXF[0] + 0.068, AXF[1], AXF[2]], axis: [1, 0, 0], color: CHROME, bone: wheelF },
  );
  b.part(new THREE.BoxGeometry(0.03, 0.05, 0.07), NAVY, {
    bone: steer,
    at: [0.068, AXF[1] + 0.12 * Math.sin(150 * DEG), AXF[2] + 0.12 * Math.cos(150 * DEG)],
    rotation: [-60, 0, 0],
  });
  // rear hex turbine disc on the left, rear sprocket and brake on the right
  glow(
    b.part(new THREE.CircleGeometry(0.135, 18), "#ffffff", {
      bone: wheelR,
      at: [AXR[0] + 0.085, AXR[1], AXR[2]],
      dir: [1, 0, 0],
      axis: "z",
      texture: HEX_CYAN,
    }),
    1.1,
  );
  b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.012, 18), NAVY, {
    bone: wheelR,
    at: [AXR[0] + 0.078, AXR[1], AXR[2]],
    dir: [1, 0, 0],
  });
  b.part(gearGeometry({ teeth: 34, module: 0.0045, thickness: 0.008 }), CHROME, {
    bone: wheelR,
    at: [0.118, AXR[1], AXR[2]],
    dir: [1, 0, 0],
  });
  b.lathe(
    [
      [0.07, -0.004],
      [0.12, -0.004],
      [0.12, 0.004],
      [0.07, 0.004],
    ],
    { at: [AXR[0] - 0.085, AXR[1], AXR[2]], axis: [1, 0, 0], color: CHROME, bone: wheelR },
  );

  // chain
  const spr: V = v(0.118, 0.4, -0.08);
  P(gearGeometry({ teeth: 14, module: 0.006, thickness: 0.01 }), CHROME, { at: spr, dir: [1, 0, 0] });
  rod(v(0.118, 0.445, -0.08), v(0.118, 0.41, -0.75), 0.005, CHAIN, { sides: 4 });
  rod(v(0.118, 0.355, -0.08), v(0.118, 0.25, -0.75), 0.005, CHAIN, { sides: 4 });
  P(new THREE.BoxGeometry(0.02, 0.03, 0.6), BODY, { at: v(0.147, 0.48, -0.42), rotation: [-3, 0, 0] });

  // ------------------------------------------------------------------ fork
  for (const s of [1, -1]) {
    const x = s * 0.09;
    b.rod(forkPt(0, x), forkPt(0.5, x), 0.027, CHROME, { bone: steer, sides: 8 });
    b.rod(forkPt(0.5, x), forkPt(0.86, x), 0.017, CHROME, { bone: steer, sides: 8 });
    b.sweep(coil(forkPt(0.52, x), forkPt(0.78, x), 0.036, 6), 0.0065, { bone: steer, color: BRASS, sides: 4 });
    b.part(new THREE.BoxGeometry(0.03, 0.06, 0.06), NAVY_L, { bone: steer, at: forkPt(0.0, s * 0.075), dir: UP });
    // fork bridge to lamp
    b.rod(forkPt(0.66, x), v(s * 0.075, 0.86, 0.64), 0.011, CHROME, { bone: steer, sides: 6 });
  }
  b.part(new THREE.BoxGeometry(0.3, 0.05, 0.09), CHROME, { bone: steer, at: forkPt(0.82), dir: UP });
  b.part(new THREE.BoxGeometry(0.22, 0.04, 0.07), CHROME, { bone: steer, at: forkPt(0.48), dir: UP });
  // head tube on the frame
  rod(forkPt(0.52), forkPt(0.78), 0.045, FRAME, { sides: 10 });

  // front fender
  {
    const R2 = 0.385;
    const a0 = -5 * DEG;
    const pts: number[][] = [];
    for (let a = -5; a <= 113; a += 16)
      pts.push([0, AXF[1] + R2 * Math.sin(a * DEG), AXF[2] + R2 * Math.cos(a * DEG)]);
    b.sweep(catmull(pts), (_t: number) => [0.06, 0.007], {
      bone: steer,
      section: "box",
      up: [0, Math.sin(a0), Math.cos(a0)],
      caps: "flat",
      color: BODY,
      bands: [
        [0.12, WHITE],
        [1, BODY],
      ],
    });
    for (const s of [1, -1])
      b.rod([s * 0.06, pts[7][1], pts[7][2]], forkPt(0.36, s * 0.09), 0.01, CHROME, { bone: steer, sides: 6 });
  }

  // ------------------------------------------------------------------ headlamp (the face)
  const LC = v(0, 0.86, 0.7);
  b.lathe(
    [
      [0, -0.07],
      [0.075, -0.07],
      [0.088, -0.03],
      [0.088, 0.035],
      [0.08, 0.05],
      [0.074, 0.042],
      [0.074, 0.02],
      [0, 0.02],
    ],
    { at: LC, axis: [0, 0, 1], color: CHROME, bone: steer },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.072, 18), "#ffffff", {
      bone: steer,
      at: [LC[0], LC[1], LC[2] + 0.026],
      dir: [0, 0, 1],
      axis: "z",
      texture: LENS,
    }),
    1.6,
  );
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.07), BODY, {
    bone: steer,
    at: [LC[0], LC[1] + 0.098, LC[2] + 0.03],
    rotation: [20, 0, 0],
  });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.012, 0.03, 0.07), BODY_W, {
      bone: steer,
      at: [s * 0.098, LC[1] + 0.092, LC[2] + 0.025],
      rotation: [20, 0, 0],
    });

  // ------------------------------------------------------------------ handlebars
  const hc = forkPt(0.8);
  for (const s of [1, -1]) {
    const bp: number[][] = [
      [s * 0.05, 0.02, 0],
      [s * 0.2, 0.05, 0],
      [s * 0.34, 0.16, -0.01],
      [s * 0.41, 0.28, -0.05],
      [s * 0.41, 0.33, -0.12],
    ].map(([x, y, z]) => [hc[0] + x, hc[1] + y, hc[2] + z]);
    b.sweep(catmull(bp), 0.014, { bone: steer, color: CHROME, sides: 6 });
    const e = bp[4];
    b.rod(e, [e[0], e[1], e[2] - 0.15], 0.02, INKC, { bone: steer, sides: 8 });
    // lever + mirror
    b.rod([e[0], e[1] - 0.015, e[2] + 0.02], [e[0], e[1] - 0.07, e[2] + 0.08], 0.006, CHROMEF, { bone: steer, sides: 4 });
    b.rod([e[0] + s * 0.02, e[1], e[2] + 0.01], [e[0] + s * 0.06, e[1] + 0.13, e[2] + 0.03], 0.005, CHROMEF, { bone: steer, sides: 4 });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), CHROME, {
      bone: steer,
      at: [e[0] + s * 0.065, e[1] + 0.15, e[2] + 0.03],
      scale: [1, 1.25, 0.25],
    });
    b.part(new THREE.SphereGeometry(0.034, 8, 6), GLASS, {
      bone: steer,
      at: [e[0] + s * 0.065, e[1] + 0.15, e[2] + 0.021],
      scale: [1, 1.25, 0.15],
    });
    // turn-signal "eyes" at the bar ends
    glow(b.part(new THREE.SphereGeometry(0.028, 8, 6), AMBER, { bone: steer, at: [e[0], e[1], e[2] - 0.165] }), 1.5);
    b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.01, 8), CHROME, {
      bone: steer,
      at: [e[0], e[1], e[2] - 0.148],
      dir: [0, 0, 1],
    });
  }

  // ------------------------------------------------------------------ frame
  tube(
    [v(0, 0.86, 0.54), v(0, 0.88, 0.3), v(0, 0.88, 0.0), v(0, 0.83, -0.25), v(0, 0.75, -0.45)],
    0.03,
    FRAME,
  );
  for (const s of [1, -1]) {
    tube(
      [
        v(s * 0.03, 0.8, 0.57),
        v(s * 0.1, 0.6, 0.34),
        v(s * 0.17, 0.4, 0.2),
        v(s * 0.17, 0.33, 0.0),
        v(s * 0.15, 0.36, -0.25),
        v(s * 0.1, 0.6, -0.42),
        v(0, 0.75, -0.45),
      ],
      0.02,
      FRAME,
      { sides: 6 },
    );
    rod(v(s * 0.07, 0.76, -0.45), v(s * 0.165, 0.33, -0.75), 0.018, FRAME, { sides: 6 });
    rod(v(s * 0.15, 0.36, -0.25), v(s * 0.165, 0.33, -0.75), 0.02, FRAME, { sides: 6 });
    P(new THREE.BoxGeometry(0.03, 0.07, 0.1), NAVY_L, { at: v(s * 0.17, 0.33, -0.75) });
    P(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), CHROME, { at: v(s * 0.19, 0.33, -0.75), dir: [1, 0, 0] });
    // footpegs
    rod(v(s * 0.17, 0.36, 0.3), v(s * 0.3, 0.36, 0.3), 0.012, CHROME, { sides: 6 });
    P(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 8), INKC, { at: v(s * 0.32, 0.36, 0.3), dir: [1, 0, 0] });
  }

  // rear fender
  const fenderR = (() => {
    const R2 = 0.375;
    const pts: number[][] = [];
    for (let a = 40; a <= 150; a += 15) pts.push([0, AXR[1] + R2 * Math.sin(a * DEG), AXR[2] + R2 * Math.cos(a * DEG)]);
    return b.sweep(catmull(pts), (_t: number) => [0.12, 0.008], {
      bone: root,
      section: "box",
      up: [0, Math.sin(40 * DEG), Math.cos(40 * DEG)],
      caps: "flat",
      color: BODY,
    });
  })();
  b.decal(fenderR, EMBLEM, { at: v(0, 0.71, -0.75), dir: [0, 1, 0], up: [0, 0, 1], size: [0.14, 0.14] });
  for (const s of [1, -1]) rod(v(s * 0.1, 0.7, -0.75), v(s * 0.145, 0.55, -0.78), 0.01, CHROME, { sides: 6 });

  // kickstand (folded)
  b.rod(stand, v(0.29, 0.2, -0.06), 0.012, CHROME, { bone: stand, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 8), INKC, { bone: stand, at: v(0.29, 0.2, -0.06), dir: [0.3, 1, 0] });

  // ------------------------------------------------------------------ tank
  const tank = b.loft(
    [
      { at: v(0, 0.97, 0.44), w: 0.1, h: 0.12 },
      { at: v(0, 1.02, 0.34), w: 0.24, h: 0.24 },
      { at: v(0, 1.04, 0.16), w: 0.31, h: 0.28 },
      { at: v(0, 1.02, -0.02), w: 0.23, h: 0.22 },
      { at: v(0, 0.98, -0.16), w: 0.1, h: 0.1 },
    ],
    { bone: root, color: TANK },
  );
  const tankSurf = b.surface(tank);
  for (const s of [1, -1])
    b.decal(tank, FLAME, {
      at: v(s * 0.14, 0.99, 0.12),
      dir: [s, 0, 0],
      size: [0.3, 0.175],
      mirror: s < 0,
    });
  b.decal(tank, EMBLEM, { at: v(0, 1.17, 0.24), dir: [0, 1, 0], up: [0, 0, 1], size: [0.1, 0.1] });
  const capHit = tankSurf.ray([0, 2, 0.04], [0, -1, 0]);
  if (capHit) {
    b.stick(new THREE.CylinderGeometry(0.035, 0.04, 0.025, 10), CHROME, capHit, { embed: 0.3, bone: root });
    b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), NAVY, capHit.moved([0, 0.012, 0]), { embed: 0.2, bone: root });
  }
  for (const z of [0.27, -0.03]) {
    const lp = tankSurf.loop(v(0, 1.03, z), { dir: [0, 0, 1], lift: 0.006 });
    b.sweep(lp, 0.009, { bone: root, color: CHROME, sides: 6 });
  }
  // gauge
  const gd = new THREE.Vector3(0, 0.7, -0.7).normalize();
  const gc = v(0, 1.12, 0.4);
  rod(v(0, 1.04, 0.4), gc, 0.015, CHROME, { sides: 6 });
  P(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 14), CHROME, { at: gc, dir: gd.toArray() });
  b.part(new THREE.CircleGeometry(0.044, 18), "#ffffff", {
    bone: root,
    at: offset(gc, gd.toArray(), 0.0112),
    dir: gd.toArray(),
    axis: "z",
    texture: GAUGE,
  });

  // ------------------------------------------------------------------ engine
  const C = v(0, 0.5, 0.04);
  P(new THREE.BoxGeometry(0.3, 0.3, 0.4), DARKP, { at: v(0, 0.43, 0.04) });
  P(new THREE.BoxGeometry(0.32, 0.05, 0.3), CHROME, { at: v(0, 0.29, 0.04) });
  const dirs: [number, number, number][] = [
    [0, Math.cos(30 * DEG), Math.sin(30 * DEG)],
    [0, Math.cos(30 * DEG), -Math.sin(30 * DEG)],
  ];
  const finOutline: [number, number][] = [
    [0, 0],
    [0.07, 0],
    [0.07, 0.02],
  ];
  for (let i = 0; i < 6; i++) {
    const y = 0.02 + i * 0.025;
    finOutline.push([0.06, y], [0.088, y + 0.004], [0.088, y + 0.014], [0.06, y + 0.018]);
  }
  finOutline.push([0.068, 0.17], [0.078, 0.178], [0.078, 0.235], [0.05, 0.245], [0, 0.245]);
  dirs.forEach((d, k) => {
    const base: V = [C[0], C[1] + d[1] * 0.08, C[2] + d[2] * 0.08];
    b.lathe(finOutline, { at: base, axis: d, color: DARKP, bone: root });
    const top: V = [base[0] + d[0] * 0.255, base[1] + d[1] * 0.255, base[2] + d[2] * 0.255];
    P(new THREE.BoxGeometry(0.17, 0.045, 0.11), BODY, { at: top, dir: d });
    P(new THREE.BoxGeometry(0.17, 0.012, 0.11), BODY_W, { at: [top[0], top[1] + d[1] * 0.026, top[2] + d[2] * 0.026], dir: d });
    const plug: V = [0.082, base[1] + d[1] * 0.2, base[2] + d[2] * 0.2];
    rod(plug, [0.14, plug[1] + 0.03, plug[2]], 0.01, WHITE, { sides: 6 });
    P(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6), CHROME, { at: [0.15, plug[1] + 0.035, plug[2]], dir: [1, 0.2, 0] });
    // pushrod tube
    rod([-0.09, base[1] + d[1] * 0.02, base[2] + d[2] * 0.02], [-0.09, base[1] + d[1] * 0.24, base[2] + d[2] * 0.24], 0.01, CHROME, { sides: 6 });
    void k;
  });
  // primary cover with energy-core window
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.115, 0.02],
      [0.11, 0.045],
      [0.09, 0.05],
      [0, 0.05],
    ],
    { at: v(0.15, 0.47, -0.04), axis: [1, 0, 0], color: BODY, bone: root },
  );
  glow(
    P(new THREE.CircleGeometry(0.075, 18), "#ffffff", {
      at: v(0.2, 0.47, -0.04),
      dir: [1, 0, 0],
      axis: "z",
      texture: HEX_ORANGE,
    }),
    1.5,
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(new THREE.CylinderGeometry(0.008, 0.008, 0.01, 6), CHROME, {
      at: v(0.2, 0.47 + 0.093 * Math.sin(a), -0.04 + 0.093 * Math.cos(a)),
      dir: [1, 0, 0],
    });
  }
  // right-hand generator cover
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.08, 0.02],
      [0.07, 0.035],
      [0, 0.035],
    ],
    { at: v(-0.15, 0.46, 0.12), axis: [-1, 0, 0], color: BODY_W, bone: root },
  );
  // front energy core cell
  glow(P(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 6), ORANGE, { at: v(0, 0.45, 0.255), dir: [0, 0, 1] }), 1.4);
  P(new THREE.CylinderGeometry(0.048, 0.048, 0.058, 8), NAVY, { at: v(0, 0.45, 0.256), dir: [0, 0, 1] });
  glow(P(new THREE.CylinderGeometry(0.028, 0.028, 0.062, 6), CYAN, { at: v(0, 0.45, 0.257), dir: [0, 0, 1] }), 1.8);
  // air cleaner
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.1, 0.015],
      [0.1, 0.04],
      [0.07, 0.055],
      [0, 0.055],
    ],
    { at: v(0.1, 0.7, 0.04), axis: [1, 0, 0], color: CHROME, bone: root },
  );
  glow(P(new THREE.TorusGeometry(0.06, 0.006, 5, 14), CYAN, { at: v(0.158, 0.7, 0.04), dir: [1, 0, 0], axis: "z" }), 1.3);
  rod(v(0.1, 0.7, 0.04), v(0.04, 0.66, 0.04), 0.022, CHROME, { sides: 8 });

  // exhaust: two drag pipes on the right
  const pipes = [
    {
      pts: [v(-0.04, 0.66, 0.24), v(-0.12, 0.52, 0.3), v(-0.21, 0.38, 0.22), v(-0.23, 0.33, 0.0), v(-0.23, 0.31, -0.4), v(-0.23, 0.34, -0.82)],
      r: 0.028,
    },
    {
      pts: [v(-0.04, 0.66, -0.14), v(-0.15, 0.55, -0.22), v(-0.25, 0.44, -0.2), v(-0.27, 0.42, -0.4), v(-0.27, 0.45, -0.85)],
      r: 0.026,
    },
  ];
  for (const pp of pipes) {
    const path = catmull(pp.pts);
    b.sweep(path, pp.r, { bone: root, color: CHROME, sides: 8 });
    b.sweep(path.slice(0.5, 0.86), pp.r + 0.008, { bone: root, color: NAVY_L, sides: 8, caps: "flat" });
    b.along(path.slice(0.5, 0.86), 3, (at) =>
      P(new THREE.CylinderGeometry(pp.r + 0.013, pp.r + 0.013, 0.012, 8), CHROME, { frame: at }),
    );
    const tip = path.at(1);
    const T = path.tangentAt(1);
    P(new THREE.CylinderGeometry(0.052, 0.032, 0.12, 10), CHROME, { at: offset(tip, T, 0.05), dir: T });
    glow(P(new THREE.CircleGeometry(0.04, 10), ORANGE, { at: offset(tip, T, 0.111), dir: T, axis: "z" }), 1.4);
  }

  // ------------------------------------------------------------------ seat, sissy bar, tail light
  b.loft(
    [
      { at: v(0, 0.92, -0.05), w: 0.18, h: 0.06 },
      { at: v(0, 0.895, -0.25), w: 0.26, h: 0.07 },
      { at: v(0, 0.84, -0.45), w: 0.22, h: 0.06 },
    ],
    { bone: root, color: SEAT },
  );
  for (const s of [1, -1]) {
    tube([v(s * 0.09, 0.79, -0.5), v(s * 0.12, 0.95, -0.58), v(s * 0.12, 1.08, -0.64), v(s * 0.1, 1.12, -0.66)], 0.013, CHROME, { sides: 6 });
  }
  P(new THREE.BoxGeometry(0.22, 0.14, 0.05), LEATHER, { at: v(0, 1.12, -0.68), rotation: [-10, 0, 0] });
  P(new THREE.BoxGeometry(0.19, 0.012, 0.052), "#e9b66a", { at: v(0, 1.17, -0.675), rotation: [-10, 0, 0] });
  glow(P(new THREE.SphereGeometry(0.03, 8, 6), RED, { at: v(0, 1.12, -0.715), scale: [1.3, 1.3, 0.5] }), 1.6);
  P(new THREE.BoxGeometry(0.07, 0.07, 0.03), CHROME, { at: v(0, 0.78, -0.5) });

  // ------------------------------------------------------------------ props
  // supply crate (rear left)
  P(new THREE.BoxGeometry(0.3, 0.3, 0.3), "#ffffff", { at: [0.5, G + 0.15, -1.0], texture: CRATE });
  P(new THREE.BoxGeometry(0.32, 0.02, 0.32), BODY, { at: [0.5, G + 0.31, -1.0] });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      P(new THREE.CylinderGeometry(0.016, 0.016, 0.34, 6), CHROME, { at: [0.5 + sx * 0.15, G + 0.15, -1.0 + sz * 0.15] });
  // oil can + wrench (left side)
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), NAVY_L, { at: [0.55, G + 0.06, -0.25] });
  P(new THREE.CylinderGeometry(0.05, 0.04, 0.02, 10), CHROME, { at: [0.55, G + 0.13, -0.25] });
  rod([0.55, G + 0.14, -0.25], [0.6, G + 0.22, -0.25], 0.008, CHROME, { sides: 5 });
  P(new THREE.PlaneGeometry(0.07, 0.047), "#ffffff", { at: [0.55, G + 0.06, -0.2], dir: [0, 0, 1], axis: "z", texture: OILTAG });
  rod([0.42, G + 0.012, 0.1], [0.6, G + 0.012, 0.3], 0.012, CHROMEF, { sides: 6 });
  P(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 6), CHROMEF, { at: [0.42, G + 0.012, 0.1] });
  P(new THREE.CylinderGeometry(0.026, 0.026, 0.022, 6), CHROMEF, { at: [0.6, G + 0.012, 0.3] });
  // hologram post (rear right)
  P(new THREE.CylinderGeometry(0.07, 0.085, 0.04, 6), NAVY_L, { at: [-0.5, G + 0.02, -1.0] });
  glow(P(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 6), ORANGE, { at: [-0.5, G + 0.046, -1.0] }), 1.2);
  rod([-0.5, G + 0.04, -1.0], [-0.5, G + 0.38, -1.0], 0.012, CHROME, { sides: 6 });
  for (const sz of [1, -1])
    glow(
      P(new THREE.CircleGeometry(0.13, 16), "#ffffff", {
        at: [-0.5, G + 0.52, -1.0 + sz * 0.002],
        dir: [0, 0, sz],
        axis: "z",
        texture: EMBLEM,
      }),
      1.3,
    );
  glow(P(new THREE.TorusGeometry(0.16, 0.004, 4, 28), HOLO, { at: [-0.5, G + 0.52, -1.0], dir: [0, 0, 1], axis: "z" }), 1.4);
  for (const [dx, dy] of [
    [0.19, 0.12],
    [-0.19, 0.2],
    [0.1, -0.2],
  ])
    glow(P(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 6), HOLO, { at: [-0.5 + dx, G + 0.52 + dy, -1.0], dir: [0, 0, 1] }), 1.4);

  return b.root;
}
