```ts
import * as THREE from "three";
import { createBuilder, paint, grain, cells, svg, polyline, catmull, frame } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Jukebox",
  description:
    "A golden-age arched jukebox: walnut cabinet, a glowing rainbow bubble-tube arch between chrome rails studded with marquee bulbs, a record showcase under a sunburst, a slanted title-strip console with selector buttons, and a lattice speaker grille under a chrome fan.",
};

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const mixC = (a: RGB, c: RGB, t: number): RGB => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];
const ramp = (stops: [number, string][], x: number): RGB => {
  if (x <= stops[0][0]) return hex(stops[0][1]);
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      return mixC(hex(c0), hex(c1), (x - t0) / (t1 - t0));
    }
  }
  return hex(stops[stops.length - 1][1]);
};
const clampC = (c: RGB): RGB => [Math.min(1, Math.max(0, c[0])), Math.min(1, Math.max(0, c[1])), Math.min(1, Math.max(0, c[2]))];

type Metal = { sky: [string, string, string]; ground: [string, string, string] };
const metalAt = (m: Metal, ny: number): RGB =>
  ny >= 0
    ? ramp([[0, m.sky[0]], [0.45, m.sky[1]], [1, m.sky[2]]], ny)
    : ramp([[-1, m.ground[0]], [-0.4, m.ground[1]], [0, m.ground[2]]], ny);
const CHROME_M: Metal = { sky: ["#9fb1c6", "#e8eef6", "#ffffff"], ground: ["#8e98a6", "#4b5462", "#232a35"] };
const GOLD_M: Metal = { sky: ["#c98f2c", "#ffd66c", "#fff4c6"], ground: ["#9a6a1e", "#6a420e", "#3b2405"] };

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "jukebox", paintSize: 2048 });
  b.joint("base", { at: [0, 0, 0] });

  // ---------- palette & paints ----------
  const CHROME = paint((_p, n) => metalAt(CHROME_M, n.y));
  const GOLD = paint((_p, n) => metalAt(GOLD_M, n.y));
  const WOOD = grain("#7c4226", "#4f2716", { size: 0.03, axis: "y", seed: 3 });
  const DARKWOOD = grain("#3b2117", "#22120b", { size: 0.03, axis: "x", seed: 5 });
  const BUBBLE = paint((p, n, s) => {
    const u = 1 - Math.abs(2 * s[0] - 1);
    let c = ramp(
      [
        [0, "#ff1f3d"],
        [0.3, "#ff7a12"],
        [0.62, "#ffd21f"],
        [0.85, "#9be22e"],
        [1, "#2fd6c4"],
      ],
      u,
    );
    const cl = cells(p, 0.028, 7);
    if (cl.d1 < 0.0065) c = mixC(c, [1, 1, 0.92], 0.45);
    else if (cl.d1 < 0.0088) c = mixC(c, [1, 1, 1], 0.85);
    const k = 0.72 + 0.38 * Math.max(0, n.z) + 0.15 * Math.max(0, n.y);
    return clampC([c[0] * k, c[1] * k, c[2] * k]);
  });
  const FAN = paint((_p, n, s) => {
    const a = Math.atan2(s[1], s[0]);
    const band = Math.floor(a / (Math.PI / 12));
    const base = metalAt(GOLD_M, n.y);
    return band % 2 === 0 ? base : mixC(base, hex("#7a4a10"), 0.35);
  });
  const PORT = paint((p) => {
    const d = Math.hypot(p.y - 1.05, p.z) / 0.075;
    return ramp(
      [
        [0, "#fff3b8"],
        [0.55, "#ffb52e"],
        [1, "#e0541c"],
      ],
      d,
    );
  });
  const IVORY = "#f4ead2";
  const RED = "#d0242c";
  const VINYL = "#121216";

  // ---------- textures ----------
  // speaker grille: gold lattice over maroon cloth
  let lattice = "";
  for (let k = -90; k <= 120; k += 9) {
    lattice += `<line x1="${k}" y1="0" x2="${k + 84}" y2="84" stroke="#c8963a" stroke-width="2.2"/>`;
    lattice += `<line x1="${k}" y1="84" x2="${k + 84}" y2="0" stroke="#c8963a" stroke-width="2.2"/>`;
  }
  const grilleTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116 84">
      <defs><linearGradient id="sh" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/>
      </linearGradient></defs>
      <rect width="116" height="84" fill="#5a0f1d"/>
      ${lattice}
      <rect width="116" height="84" fill="url(#sh)"/>
      <rect x="1.5" y="1.5" width="113" height="81" fill="none" stroke="#e2ae48" stroke-width="3"/>
    </svg>`,
    { size: 512 },
  );

  // sunburst behind the record showcase, cut to the arch window
  let wedges = "";
  const W = 32;
  for (let i = 0; i < W; i++) {
    const a0 = (i / W) * Math.PI * 2;
    const a1 = ((i + 1) / W) * Math.PI * 2;
    const x0 = 29 + 70 * Math.cos(a0);
    const y0 = 40 + 70 * Math.sin(a0);
    const x1 = 29 + 70 * Math.cos(a1);
    const y1 = 40 + 70 * Math.sin(a1);
    wedges += `<path d="M29,40 L${x0.toFixed(2)},${y0.toFixed(2)} L${x1.toFixed(2)},${y1.toFixed(2)} Z" fill="${i % 2 ? "#1a2a62" : "#2a4592"}"/>`;
  }
  let stars = "";
  for (let i = 0; i < 18; i++) {
    const a = i * 2.39996;
    const r = 8 + ((i * 7) % 19);
    const x = 29 + r * Math.cos(a);
    const y = 40 - Math.abs(r * Math.sin(a)) - 2;
    stars += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.35 + (i % 3) * 0.2).toFixed(2)}" fill="#fff6d8"/>`;
  }
  const windowTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 53">
      <defs>
        <clipPath id="c"><path d="M0,53 L0,29 A29,29 0 0 1 58,29 L58,53 Z"/></clipPath>
        <radialGradient id="g" cx="29" cy="40" r="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ffd27a" stop-opacity="0.95"/>
          <stop offset="0.35" stop-color="#ff7a3c" stop-opacity="0.4"/>
          <stop offset="1" stop-color="#ff7a3c" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g clip-path="url(#c)">
        <rect width="58" height="53" fill="#14204a"/>
        ${wedges}
        <rect width="58" height="53" fill="url(#g)"/>
        ${stars}
        <path d="M1,53 L1,29 A28,28 0 0 1 57,29 L57,53" fill="none" stroke="#e8b44c" stroke-width="1"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  // title strips
  const songs = [
    ["A1", "NEON HEARTBEAT", "The Starliners"],
    ["B1", "CHERRY COLA BOP", "Dottie Mae"],
    ["A2", "MIDNIGHT DINER", "Sal Romero Trio"],
    ["B2", "JITTERBUG MOON", "The Hi-Fis"],
    ["A3", "SATURDAY SPIN", "Johnny Velvet"],
    ["B3", "DOO-WOP DREAM", "The Crescents"],
    ["A4", "LUCKY NICKEL", "Big Ray Gibbs"],
    ["B4", "CHROME AND CANDY", "The Jukettes"],
  ];
  const FONT = `font-family="Arial, Helvetica, sans-serif"`;
  let strips = "";
  songs.forEach(([code, title, artist], i) => {
    const x = 6 + (i % 2) * 96;
    const y = 4 + Math.floor(i / 2) * 12.5;
    strips += `<rect x="${x}" y="${y}" width="92" height="11" fill="#fbf3dc"/>
      <rect x="${x}" y="${y}" width="92" height="1.4" fill="#d22b2b"/>
      <rect x="${x}" y="${y + 9.6}" width="92" height="1.4" fill="#d22b2b"/>
      <text x="${x + 3}" y="${y + 7.3}" ${FONT} font-weight="bold" font-size="4.6" fill="#b31d24">${code}</text>
      <text x="${x + 50}" y="${y + 5.7}" text-anchor="middle" ${FONT} font-weight="bold" font-size="3.6" fill="#1f1a2e">${title}</text>
      <text x="${x + 50}" y="${y + 8.9}" text-anchor="middle" ${FONT} font-size="2.6" fill="#5a5048">${artist}</text>`;
  });
  const titleTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 56">
      <rect width="200" height="56" fill="#2a0a10"/>${strips}
    </svg>`,
    { size: 1024 },
  );

  let rings = "";
  for (let r = 24; r <= 62; r += 2.6)
    rings += `<circle cx="64" cy="64" r="${r.toFixed(1)}" fill="none" stroke="${Math.abs(r - 44.8) < 1 ? "#4a4a56" : "#2c2c35"}" stroke-width="0.9"/>`;
  const grooveTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#0d0d10"/>${rings}
      <path d="M64,64 L128,8 L128,40 Z" fill="#ffffff" opacity="0.13"/>
      <path d="M64,64 L0,120 L0,88 Z" fill="#ffffff" opacity="0.13"/>
    </svg>`,
    { size: 256 },
  );
  const labelTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="#c81e2c"/>
      <circle cx="32" cy="32" r="27" fill="none" stroke="#f3c64a" stroke-width="1.6"/>
      <text x="32" y="24" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="10" fill="#f3c64a">JUKE</text>
      <text x="32" y="49" text-anchor="middle" ${FONT} font-weight="bold" font-size="6" fill="#fbe7b0">45 RPM</text>
      <circle cx="32" cy="32" r="3" fill="#111"/>
    </svg>`,
    { size: 128 },
  );
  const coinTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50">
      <defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.48" stop-color="#c9d2dd"/>
        <stop offset="0.52" stop-color="#5d6674"/><stop offset="1" stop-color="#aab4c0"/>
      </linearGradient></defs>
      <rect x="0" y="0" width="200" height="50" rx="10" fill="url(#m)"/>
      <rect x="4" y="4" width="192" height="42" rx="7" fill="none" stroke="#7a1520" stroke-width="2"/>
      <text x="62" y="32" text-anchor="middle" ${FONT} font-weight="bold" font-size="18" fill="#7a1520">PLAY 5¢</text>
      <rect x="128" y="17" width="44" height="9" rx="3" fill="#0b0b0e"/>
      <text x="150" y="40" text-anchor="middle" ${FONT} font-size="8" fill="#2a2a33">6 FOR 25¢</text>
    </svg>`,
    { size: 256 },
  );

  // ---------- cabinet ----------
  const CY = 1.08; // arch centre height
  const R = 0.42; // cabinet half-width
  const bodyOutline: OutlinePoint[] = [
    [-R, 0.1, "sharp"],
    [R, 0.1, "sharp"],
  ];
  const NA = 28;
  for (let i = 0; i <= NA; i++) {
    const a = (i / NA) * Math.PI;
    bodyOutline.push([R * Math.cos(a), CY + R * Math.sin(a)]);
  }
  b.extrude(bodyOutline, { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.56, bevel: 0.025, color: WOOD, name: "cabinet" });

  // plinth with chrome kick rails
  b.part(new THREE.BoxGeometry(0.9, 0.1, 0.6), DARKWOOD, { at: [0, 0.05, 0], name: "plinth" });
  for (const y of [0.03, 0.07]) b.rod([-0.445, y, 0.302], [0.445, y, 0.302], 0.007, { color: CHROME, sides: 6 });

  const archPts = (r: number, yBot: number, z: number): number[][] => {
    const pts: number[][] = [[r, yBot, z]];
    for (let i = 0; i <= NA; i++) {
      const a = (i / NA) * Math.PI;
      pts.push([r * Math.cos(a), CY + r * Math.sin(a), z]);
    }
    pts.push([-r, yBot, z]);
    return pts;
  };

  // chrome edge trims front and back
  for (const z of [0.268, -0.268]) b.sweep(polyline(archPts(0.412, 0.1, z)), 0.014, { color: CHROME, sides: 8, name: "edgeTrim" });

  // the glowing bubble-tube arch between two chrome rails
  b.sweep(polyline(archPts(0.35, 0.22, 0.3)), 0.032, { color: BUBBLE, sides: 10, name: "bubbleTube" });
  b.sweep(polyline(archPts(0.302, 0.18, 0.29)), 0.01, { color: CHROME, sides: 6, name: "innerRail" });
  b.sweep(polyline(archPts(0.39, 0.11, 0.29)), 0.011, { color: CHROME, sides: 6, name: "outerRail" });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.042, 0.036, 0.07, 10), CHROME, { at: [s * 0.35, 0.2, 0.3], name: "tubeCup" });

  // marquee bulbs on the outer rail
  const bulbGeo = () => new THREE.SphereGeometry(0.013, 8, 6);
  const NB = 13;
  for (let i = 0; i < NB; i++) {
    const a = ((12 + (156 * i) / (NB - 1)) * Math.PI) / 180;
    b.part(bulbGeo(), i % 2 ? "#ff9f43" : "#ffe066", { at: [0.39 * Math.cos(a), CY + 0.39 * Math.sin(a), 0.3], name: "bulb" });
  }
  for (const s of [1, -1])
    [0.3, 0.5, 0.7, 0.9].forEach((y, i) =>
      b.part(bulbGeo(), i % 2 ? "#ffe066" : "#ff9f43", { at: [s * 0.39, y, 0.3], name: "bulb" }),
    );

  // ---------- record showcase ----------
  b.part(new THREE.PlaneGeometry(0.58, 0.53), "#ffffff", { at: [0, 1.105, 0.284], dir: [0, 0, 1], axis: "z", texture: windowTex, name: "sunburst" });

  const RD = v(0, 0.2, 1).normalize();
  const Rc = v(0, 1.12, 0.312);
  const onRec = (d: number) => Rc.clone().addScaledVector(RD, d);
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.008, 32), VINYL, { at: Rc, dir: RD, name: "record" });
  b.part(new THREE.CircleGeometry(0.128, 32), "#ffffff", { at: onRec(0.0055), dir: RD, axis: "z", texture: grooveTex, name: "grooves" });
  b.part(new THREE.CircleGeometry(0.045, 24), "#ffffff", { at: onRec(0.0085), dir: RD, axis: "z", texture: labelTex, name: "recordLabel" });
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8), CHROME, { at: onRec(0.012), dir: RD, name: "spindle" });

  // tone arm
  b.part(new THREE.CylinderGeometry(0.028, 0.032, 0.03, 12), CHROME, { at: [0.205, 1.0, 0.3], dir: [0, 0, 1], name: "armBase" });
  b.sweep(
    catmull([
      [0.205, 1.0, 0.322],
      [0.185, 1.09, 0.33],
      [0.12, 1.148, 0.33],
      [0.08, 1.15, 0.325],
    ]),
    0.0065,
    { color: CHROME, sides: 6, name: "toneArm" },
  );
  b.part(new THREE.BoxGeometry(0.032, 0.018, 0.012), "#22222a", { at: [0.068, 1.148, 0.324], name: "headshell" });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), RED, { at: [0.205, 1.0, 0.322], name: "armKnob" });

  // record rack below the turntable
  b.part(new THREE.BoxGeometry(0.5, 0.012, 0.07), CHROME, { at: [0, 0.859, 0.31], name: "rackShelf" });
  const labelCols = ["#e33b2e", "#2e8ae3", "#f2c230", "#3cb371", "#e36fb0", "#ff8a1c", "#7b5ce0", "#e33b2e", "#2fd6c4"];
  for (let i = 0; i < 9; i++) {
    const at: number[] = [-0.2 + i * 0.05, 0.926, 0.31];
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.006, 20), VINYL, { at, dir: [1, 0, 0], name: "rackRecord" });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.009, 12), labelCols[i], { at, dir: [1, 0, 0], name: "rackLabel" });
  }

  // ---------- selector console ----------
  const N = v(0, 0.8, 0.6).normalize(); // slanted top normal
  const Yd = v(0, 0.6, -0.8); // up the slant, toward the back
  const C = v(0, 0.755, 0.335);
  b.part(new THREE.BoxGeometry(0.58, 0.18, 0.05), "#7d1a22", { at: C, dir: N, axis: "z", name: "console" });
  b.part(new THREE.PlaneGeometry(0.54, 0.15), "#ffffff", {
    at: C.clone().addScaledVector(N, 0.028),
    dir: N,
    axis: "z",
    texture: titleTex,
    name: "titleStrips",
  });
  const topFront = C.clone().addScaledVector(N, 0.025).addScaledVector(Yd, -0.09);
  const botFront = C.clone().addScaledVector(N, -0.025).addScaledVector(Yd, -0.09);
  b.rod(topFront.clone().setX(-0.29), topFront.clone().setX(0.29), 0.008, { color: CHROME, sides: 6 });
  b.rod(botFront.clone().setX(-0.29), botFront.clone().setX(0.29), 0.007, { color: CHROME, sides: 6 });
  for (const s of [1, -1]) {
    const a = topFront.clone().setX(s * 0.29);
    b.capsule(a, a.clone().addScaledVector(Yd, 0.165), 0.007, { color: CHROME, sides: 6 });
  }
  // selector buttons on the front face
  const faceC = C.clone().addScaledVector(Yd, -0.09);
  const faceN = Yd.clone().multiplyScalar(-1);
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const x = s * (0.07 + i * 0.045);
      b.stick(new THREE.BoxGeometry(0.034, 0.02, 0.026), IVORY, frame(faceC.clone().setX(x), faceN), { name: "selectButton" });
    }
  b.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10), RED, frame(faceC.clone(), faceN), { name: "playButton" });

  // coin plate under the console
  b.part(new THREE.PlaneGeometry(0.18, 0.045), "#ffffff", { at: [0, 0.645, 0.2845], dir: [0, 0, 1], axis: "z", texture: coinTex, name: "coinPlate" });

  // ---------- speaker grille ----------
  b.part(new THREE.PlaneGeometry(0.58, 0.42), "#ffffff", { at: [0, 0.39, 0.283], dir: [0, 0, 1], axis: "z", texture: grilleTex, name: "grille" });
  b.sweep(
    polyline(
      [
        [-0.282, 0.18, 0.288],
        [0.282, 0.18, 0.288],
        [0.282, 0.6, 0.288],
        [-0.282, 0.6, 0.288],
      ],
      { closed: true },
    ),
    0.009,
    { color: CHROME, sides: 6, name: "grilleFrame" },
  );
  // chrome fan rays from a gold hub
  const hub = v(0, 0.2, 0.292);
  for (let i = 0; i < 9; i++) {
    const a = ((-64 + i * 16) * Math.PI) / 180;
    const d = Math.min(0.37 / Math.cos(a), Math.abs(Math.sin(a)) > 1e-4 ? 0.262 / Math.abs(Math.sin(a)) : 1);
    b.rod(hub, [Math.sin(a) * d, 0.2 + Math.cos(a) * d, 0.292], 0.0055, { color: CHROME, sides: 6, name: "fanRay" });
  }
  b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.052, 0.012],
      [0.035, 0.026],
      [0, 0.032],
    ],
    { at: [0, 0.2, 0.284], axis: [0, 0, 1], segments: 16, color: GOLD, name: "fanHub" },
  );
  b.part(new THREE.SphereGeometry(0.016, 8, 6), RED, { at: [0, 0.2, 0.318], flat: true, name: "hubJewel" });

  // ---------- crest on top ----------
  const crest: OutlinePoint[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = (i * 15 * Math.PI) / 180;
    const r = i % 2 === 0 ? 0.12 : 0.1;
    crest.push([r * Math.cos(a), r * Math.sin(a), "sharp"]);
  }
  b.extrude(crest, { at: [0, 1.465, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.006, color: FAN, name: "crest" });
  b.part(new THREE.SphereGeometry(0.024, 8, 6), "#e01c34", { at: [0, 1.53, 0.022], flat: true, name: "crestJewel" });

  // ---------- side details ----------
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 18), PORT, { at: [s * 0.421, 1.05, 0], dir: [s, 0, 0], name: "porthole" });
    const ring: number[][] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ring.push([s * 0.428, 1.05 + 0.08 * Math.sin(a), 0.08 * Math.cos(a)]);
    }
    b.sweep(catmull(ring, { closed: true }), 0.01, { color: CHROME, sides: 6, name: "portRing" });
    [
      [0.45, -0.2],
      [0.5, -0.12],
      [0.55, -0.04],
    ].forEach(([y, zEnd]) =>
      b.capsule([s * 0.424, y, 0.22], [s * 0.424, y, zEnd], 0.008, { color: CHROME, sides: 6, name: "speedLine" }),
    );
  }

  return b.root;
}
```