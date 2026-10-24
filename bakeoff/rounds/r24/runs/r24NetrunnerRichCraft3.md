```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  mix,
  noise,
  paint,
  smoothstep,
  mottle,
  stripes,
  svg,
} from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Netrunner",
  description:
    "Cyberpunk netrunner: shaved-sided mohawk, glowing HUD visor, skull-port data cables into a back rack, chrome cyber-arm with a forearm deck and hologram, yellow-yoked jacket, neon-striped cargo pants and glowing-sole boots.",
};

const D = Math.PI / 180;

const C = {
  black: "#0d0d14",
  ink: "#171521",
  graphite: "#24222f",
  skinD: "#a8715a",
  lips: "#a04a5c",
  yellow: "#f7e533",
  cyan: "#19f1ff",
  magenta: "#ff2d8d",
  purple: "#6b2fd1",
  hair: "#1a1426",
  rubber: "#0b0b11",
  glass: "#0fb5d0",
  strap: "#2b2a36",
  white: "#e9ffff",
  boot: "#14121c",
};

export default function build() {
  const b = createBuilder({ name: "netrunner" });
  const R = rng(11);

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const N = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r0: number, r1: number, h: number, seg = 8) => new THREE.CylinderGeometry(r0, r1, h, seg);
  const ball = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
  const prof = (a: number[]) => (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (a.length - 1);
    const i = Math.min(Math.floor(x), a.length - 2);
    return a[i] + (a[i + 1] - a[i]) * (x - i);
  };
  const ringPath = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 12) => {
    const pts: number[][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.sin(a) * rx, cy, cz + Math.cos(a) * rz]);
    }
    return catmull(pts, { closed: true });
  };
  // a torus ring whose axis runs along `axis`
  const band = (pos: THREE.Vector3, axis: THREE.Vector3, bone: any, r: number, tube: number, color: any, seg = 12) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, seg), color, { bone, at: pos, dir: axis, axis: "z" });

  // ------------------------------------------------------------------ textures
  const HUD = svg(
    `<svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#04202c" stroke-width="2.6" stroke-linecap="round">
      <path d="M5 12V5H17M195 12V5H183M5 38V45H17M195 38V45H183"/>
      <path d="M22 25H44M156 25H178"/>
    </g>
    <g fill="none" stroke="#ff2d8d" stroke-width="3">
      <circle cx="64" cy="25" r="11"/><circle cx="136" cy="25" r="11"/>
      <path d="M64 9V15M64 35V41M48 25H54M74 25H80M136 9V15M136 35V41M120 25H126M146 25H152"/>
    </g>
    <circle cx="64" cy="25" r="3.2" fill="#ffffff"/><circle cx="136" cy="25" r="3.2" fill="#ffffff"/>
    <g fill="#04202c"><rect x="84" y="8" width="32" height="3.4"/><rect x="88" y="14" width="24" height="2.4"/><rect x="84" y="40" width="12" height="3"/><rect x="100" y="40" width="16" height="3"/></g>
    <text x="86" y="33" font-family="monospace" font-size="7" font-weight="bold" fill="#e9ffff">LINK//OK</text>
    <path d="M16 20H36M16 30H30" stroke="#e9ffff" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M164 20H184M170 30H184" stroke="#e9ffff" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
    { size: 512 },
  );

  let code = "";
  for (let i = 0; i < 13; i++) {
    const y = 24 + i * 5.2;
    const x = 5 + (i % 3) * 4;
    const w = 8 + R() * (40 - (i % 3) * 4);
    const c = i % 6 === 0 ? "#ff2d8d" : i % 4 === 0 ? "#f7e533" : "#19f1ff";
    code += `<rect x="${x}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="2.4" rx="1" fill="${c}"/>`;
  }
  const DECK = svg(
    `<svg viewBox="0 0 60 102" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="102" rx="3" fill="#021219"/>
    <rect x="3" y="3" width="54" height="13" fill="#f7e533"/>
    <text x="7" y="13" font-family="monospace" font-size="9" font-weight="bold" fill="#0d0d14">ICE//BRK</text>
    ${code}
    <rect x="5" y="92" width="50" height="5" fill="none" stroke="#19f1ff" stroke-width="1.2"/>
    <rect x="6.5" y="93.5" width="34" height="2" fill="#19f1ff"/>
  </svg>`,
    { size: 256 },
  );

  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#0d0d14" stroke="#f7e533" stroke-width="5" stroke-linejoin="round"/>
    <path d="M17 48 Q50 18 83 48 Q50 78 17 48Z" fill="none" stroke="#19f1ff" stroke-width="4.5" stroke-linejoin="round"/>
    <circle cx="50" cy="48" r="12" fill="#ff2d8d"/><circle cx="50" cy="48" r="5" fill="#0d0d14"/>
    <path d="M50 35V19M50 61V70M30 48H14M70 48H86" stroke="#f7e533" stroke-width="4.5" stroke-linecap="round"/>
    <text x="50" y="86" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#f7e533">NET//RUN</text>
  </svg>`,
    { size: 384 },
  );

  const TATTOO = svg(
    `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#19f1ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 6H16L22 12V28H34"/><path d="M4 22H12L16 26V40H26L30 44V54"/><path d="M34 6V16"/>
    </g>
    <g fill="#ff2d8d"><circle cx="34" cy="28" r="3"/><circle cx="30" cy="54" r="3"/><circle cx="34" cy="6" r="2.6"/></g>
  </svg>`,
    { size: 128 },
  );

  const PATCH = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="c"><rect x="2" y="2" width="60" height="60" rx="9"/></clipPath></defs>
    <rect x="2" y="2" width="60" height="60" rx="9" fill="#0d0d14"/>
    <g clip-path="url(#c)" fill="#f7e533">
      <polygon points="0,16 16,0 28,0 0,28"/><polygon points="0,40 40,0 52,0 0,52"/><polygon points="12,64 64,12 64,24 24,64"/><polygon points="36,64 64,36 64,48 48,64"/>
    </g>
    <rect x="14" y="20" width="36" height="26" rx="4" fill="#0d0d14"/>
    <text x="32" y="42" text-anchor="middle" font-family="monospace" font-size="22" font-weight="bold" fill="#ff2d8d">07</text>
    <rect x="2" y="2" width="60" height="60" rx="9" fill="none" stroke="#f7e533" stroke-width="3"/>
  </svg>`,
    { size: 192 },
  );

  const LOGO = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="58" height="38" rx="4" fill="#ff2d8d"/>
    <rect x="1" y="30" width="58" height="9" fill="#0d0d14"/>
    <text x="30" y="25" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="bold" fill="#ffffff">KIRO</text>
    <path d="M6 34H30M36 34H54" stroke="#f7e533" stroke-width="3"/>
  </svg>`,
    { size: 192 },
  );

  const HOLO = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#19f1ff" stroke-width="3.2" stroke-linejoin="round">
      <polygon points="50,6 88,28 88,72 50,94 12,72 12,28"/>
      <polygon points="50,22 74,36 74,64 50,78 26,64 26,36" stroke="#ff2d8d"/>
      <path d="M50 6V22M88 28L74 36M88 72L74 64M50 94V78M12 72L26 64M12 28L26 36"/>
    </g>
    <path d="M38 50H62M50 38V62" stroke="#e9ffff" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="6" fill="#f7e533"/>
  </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------ paints
  const CHROME = metal("steel", { polish: 0.8, tarnish: 0.1 });
  const IRONP = metal("iron");
  const RACK = panelled(metal("iron"), { size: 0.09, rivets: 0.025 });
  const SKINP = mottle("#c98f72", "#b97d62", { size: 0.06, seed: 3 });
  const BOOTP = mottle(C.boot, "#2a2735", { size: 0.05, seed: 9 });
  const CLOTH = mottle("#14121c", "#242131", { size: 0.04, seed: 5 });
  const PELV = mottle("#1b1a24", "#262432", { size: 0.05, seed: 2 });
  const hairP = paint((p) =>
    mix(mix(C.purple, C.magenta, smoothstep(1.8, 1.9, p.y)), C.cyan, smoothstep(1.92, 1.99, p.y)),
  );
  const jacketP = paint((p, n) => {
    const lit = 0.78 + 0.22 * smoothstep(-0.5, 0.9, n.y);
    const ax = Math.abs(p.x);
    const edge = Math.abs(((ax * 26) % 2) - 1) * 0.018;
    let base = "#1d1a28";
    if (p.y > 1.385 + edge) base = "#e2cf2a";
    else if (n.z > 0.2 && ax < 0.012 && p.y < 1.4) base = C.black;
    else if (Math.abs(p.y - 1.02) < 0.005) base = C.cyan;
    else if (ax > 0.1 && ax < 0.108 && Math.abs(n.z) > 0.5 && p.y > 1.05 && p.y < 1.38) base = C.magenta;
    const m = 0.93 + 0.14 * noise(p, 0.04, 4);
    return mix(base, "#000000", 1 - lit * m);
  });
  const pantsP = (s: number) =>
    paint((p, n) => {
      const lit = 0.8 + 0.2 * smoothstep(-0.6, 0.9, n.y);
      let base = "#1b1a24";
      if (n.x * s > 0.8 && p.y > 0.2 && p.y < 0.88) base = s > 0 ? "#13495a" : "#5a1340";
      else if (p.y < 0.22) base = "#141320";
      const m = 0.92 + 0.16 * noise(p, 0.05, 7);
      return mix(base, "#000000", 1 - lit * m);
    });

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.93, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.18, 0.01],
      [0, 1.34, 0.01],
      [0, 1.47, 0],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.47, 0],
      [0, 1.56, 0.01],
      [0, 1.66, 0.03],
    ]),
    { parent: spine, role: "neck", names: ["neck1", "neck2"] },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.66, 0.03], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.688, -0.03], aim: [0, 1.668, 0.08], role: "jaw" });

  // ------------------------------------------------------------------ torso
  const pelvis = b.loft(
    [
      { at: [0, 0.76, 0], w: 0.33, h: 0.22 },
      { at: [0, 0.88, 0], w: 0.35, h: 0.23 },
      { at: [0, 1.0, 0], w: 0.32, h: 0.21 },
    ],
    { bone: hips, color: PELV },
  );
  const jacket = b.loft(
    [
      { at: [0, 0.96, -0.005], w: 0.37, h: 0.27 },
      { at: [0, 1.1, 0], w: 0.36, h: 0.27 },
      { at: [0, 1.28, 0], w: 0.39, h: 0.26 },
      { at: [0, 1.42, 0], w: 0.44, h: 0.27 },
      { at: [0, 1.51, 0], w: 0.34, h: 0.2 },
    ],
    { bone: [hips, spine], color: jacketP },
  );
  const jacketSkin = b.surface(jacket);

  b.decal(jacket, EMBLEM, { at: [0, 1.25, -0.14], dir: [0, 0, -1], size: [0.22, 0.22], segments: 12 });
  b.decal(jacket, LOGO, { at: [0.11, 1.33, 0.14], dir: [0, 0, 1], size: [0.065, 0.043], segments: 8 });

  // neck + collar
  b.sweep(neck, [0.052, 0.05], { color: SKINP });
  const collar = b.lathe(
    [
      [0.1, 0],
      [0.125, 0],
      [0.145, 0.1],
      [0.135, 0.105],
      [0.112, 0.02],
      [0.1, 0.02],
    ],
    { at: [0, 1.47, 0], axis: [0, 1, 0], segments: 10, color: CLOTH, bone: neck.joints[0] },
  );
  void collar;
  glow(b.sweep(ringPath(0, 1.572, 0, 0.14, 0.14, 14), 0.005, { color: C.cyan, bone: neck.joints[0] }), 1.1);

  // belt and hip kit
  const pelSurf = b.surface(pelvis);
  const belt = pelSurf.loop([0, 0.93, 0], { lift: 0.012 });
  b.sweep(belt, 0.016, { color: C.strap, bone: hips });
  const buckle = pelSurf.around([0, 0.9, 0]).at(0, 0);
  if (buckle) {
    b.stick(box(0.055, 0.014, 0.045), C.yellow, buckle, { embed: 0.3 });
    glow(b.stick(box(0.02, 0.016, 0.012), C.magenta, buckle, { embed: 0.2 }), 1.2);
  }
  for (const s of [1, -1]) {
    const h = pelSurf.around([0, 0.9, 0]).at(s * 150, 0);
    if (h) {
      b.stick(box(0.07, 0.05, 0.09), C.graphite, h, { embed: 0.25, flow: [0, -1, 0] });
      b.stick(box(0.072, 0.012, 0.03), C.yellow, h, { embed: -0.05, flow: [0, -1, 0] });
    }
  }

  // ------------------------------------------------------------------ head
  const HC = V(0, 1.745, 0);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKINP, {
    bone: head,
    at: HC,
    scale: [0.086, 0.108, 0.097],
    flat: true,
  });
  const cap = b.part(new THREE.SphereGeometry(1, 12, 7, 0, Math.PI * 2, 0, 1.25), C.hair, {
    bone: head,
    at: [0, 1.742, -0.01],
    dir: [0, 1, -0.32],
    scale: [0.093, 0.116, 0.106],
    flat: true,
  });
  const face = b.frustumBox([0, 1.725, -0.02], [0, 1.715, 0.098], [0.158, 0.085], [0.12, 0.075], {
    bone: head,
    color: SKINP,
  });
  // nose, lips, jaw
  b.part(box(0.028, 0.045, 0.03), SKINP, { bone: head, at: [0, 1.702, 0.108], rotation: [-20, 0, 0] });
  b.part(box(0.036, 0.014, 0.02), C.skinD, { bone: head, at: [0, 1.682, 0.121] });
  b.part(box(0.052, 0.009, 0.012), C.lips, { bone: head, at: [0, 1.688, 0.094] });
  b.part(box(0.046, 0.003, 0.006), C.ink, { bone: head, at: [0, 1.6795, 0.0945] });
  b.frustumBox([0, 1.664, -0.035], [0, 1.654, 0.088], [0.152, 0.056], [0.07, 0.05], { bone: jaw, color: SKINP });
  b.part(box(0.054, 0.011, 0.012), C.lips, { bone: jaw, at: [0, 1.671, 0.092] });
  // chrome jaw plate with a glowing seam
  b.part(box(0.01, 0.036, 0.075), CHROME, { bone: jaw, at: [-0.07, 1.66, 0.025] });
  glow(b.part(box(0.004, 0.006, 0.07), C.cyan, { bone: jaw, at: [-0.0765, 1.66, 0.025] }), 1.2);
  // cheek tattoo
  b.decal(face, TATTOO, { at: [0.045, 1.695, 0.098], dir: [0.25, 0, 1], size: [0.034, 0.05], segments: 8 });

  // visor
  const visorPts: number[][] = [];
  for (let k = 0; k <= 8; k++) {
    const a = (-100 + k * 25) * D;
    visorPts.push([Math.sin(a) * 0.097, 1.738, Math.cos(a) * 0.108]);
  }
  const visor = b.sweep(catmull(visorPts), (t) => [0.012, 0.026 * (0.62 + 0.38 * Math.sin(Math.PI * t))], {
    section: "box",
    caps: "flat",
    bone: head,
    color: C.glass,
    up: [0, 1, 0],
  });
  glow(visor, 0.85);
  glow(b.decal(visor, HUD, { at: [0, 1.738, 0.12], dir: [0, 0, 1], size: [0.15, 0.042], segments: 14, lift: 0.002 }), 1);
  const rimPts: number[][] = [];
  for (let k = 0; k <= 6; k++) {
    const a = (-72 + k * 24) * D;
    rimPts.push([Math.sin(a) * 0.103, 1.71, Math.cos(a) * 0.114]);
  }
  glow(b.sweep(catmull(rimPts), 0.0028, { color: C.magenta, bone: head }), 1.2);
  const strapPts: number[][] = [];
  for (let k = 0; k <= 8; k++) {
    const a = (100 + k * 20) * D;
    strapPts.push([Math.sin(a) * 0.099, 1.738, Math.cos(a) * 0.118]);
  }
  b.sweep(catmull(strapPts), 0.006, { color: C.rubber, bone: head });

  // ears and cyber ear-cups
  for (const s of [1, -1]) {
    b.part(box(0.016, 0.05, 0.032), SKINP, { bone: head, at: [s * 0.087, 1.72, -0.012] });
    b.part(cyl(0.03, 0.03, 0.018, 8), C.graphite, { bone: head, at: [s * 0.106, 1.728, -0.015], dir: [s, 0, 0] });
    glow(band(V(s * 0.116, 1.728, -0.015), V(s, 0, 0), head, 0.03, 0.004, s > 0 ? C.cyan : C.magenta, 12), 1.2);
  }
  b.rod(V(0.108, 1.745, -0.03), V(0.132, 1.9, -0.06), 0.0035, C.rubber, { bone: head });
  glow(b.part(ball(0.009), C.magenta, { bone: head, at: [0.132, 1.905, -0.06] }), 1.4);

  // temple implants
  const headSkin = b.surface([skull, cap]);
  const temple = headSkin.around(HC).at(-82, 22);
  if (temple) {
    b.stick(box(0.05, 0.012, 0.07), CHROME, temple, { embed: 0.3 });
    glow(b.stick(box(0.036, 0.014, 0.006), C.magenta, temple, { embed: 0.1 }), 1.2);
  }

  // mohawk: crest silhouette + two side blades
  const crest: any[] = [
    [0.09, -0.06],
    [0.085, -0.01],
    [0.07, 0.06, "sharp"],
    [0.05, 0.0],
    [0.03, 0.1, "sharp"],
    [0.0, 0.01],
    [-0.03, 0.13, "sharp"],
    [-0.045, 0.02],
    [-0.08, 0.11, "sharp"],
    [-0.09, 0.0],
    [-0.13, 0.05, "sharp"],
    [-0.12, -0.06],
    [-0.1, -0.14],
    [0.0, -0.1],
    [0.05, -0.09],
  ];
  b.extrude(crest, { at: [0, 1.84, 0], x: [0, 0, 1], thickness: [0.05, 0.012], color: hairP, bone: head });
  const scaled = (k: number) => crest.map((q) => (q.length > 2 ? [q[0] * k, q[1] * k, q[2]] : [q[0] * k, q[1] * k]));
  for (const s of [1, -1])
    b.extrude(scaled(0.8) as any, {
      at: [s * 0.03, 1.835, -0.005],
      x: [0, 0, 1],
      thickness: [0.03, 0.008],
      color: hairP,
      bone: head,
    });

  // skull ports + data cables into the back rack
  const packC = V(0, 1.2, -0.215);
  b.part(box(0.27, 0.2, 0.09), RACK, { bone: chest, at: packC });
  b.part(box(0.24, 0.18, 0.03), IRONP, { bone: chest, at: [0, 1.2, -0.165] });
  glow(band(V(0, 1.19, -0.262), V(0, 0, 1), chest, 0.052, 0.006, C.cyan, 16), 1.2);
  for (let k = 0; k < 2; k++)
    b.part(box(0.1, 0.012, 0.004), C.graphite, { bone: chest, at: [0, 1.19, -0.262], rotation: [0, 0, 45 + k * 90] });
  for (let k = 0; k < 4; k++) b.part(box(0.1, 0.006, 0.004), C.ink, { bone: chest, at: [0, 1.12 + k * 0.014 - 0.0, -0.2625] });
  b.part(new THREE.PlaneGeometry(0.07, 0.047), "#ffffff", {
    bone: chest,
    at: [0.075, 1.26, -0.2615],
    dir: [0, 0, -1],
    axis: "z",
    texture: LOGO,
  });
  const xs = [-0.07, -0.035, 0, 0.035, 0.07];
  const els = [6, -6, 10, -6, 6];
  const cableCols = [C.cyan, C.magenta, C.yellow, C.cyan, C.magenta];
  xs.forEach((x, i) => {
    b.part(cyl(0.012, 0.014, 0.012, 8), IRONP, { bone: chest, at: [x, 1.305, -0.215] });
    const hit = headSkin.around(HC).at(180 - Math.asin(x / 0.105) / D, els[i]);
    if (!hit) return;
    b.stick(cyl(0.014, 0.016, 0.014, 8), CHROME, hit, { embed: 0.4 });
    const st = hit.at.clone().addScaledVector(hit.n, 0.012);
    const p1 = st.clone().addScaledVector(hit.n, 0.035).add(V(0, -0.01, 0));
    const pts = [st, p1, V(x * 1.5, 1.6, -0.19), V(x * 1.25, 1.5, -0.205), V(x, 1.4, -0.215), V(x, 1.34, -0.215)];
    b.sweep(catmull(pts), 0.011, {
      color: stripes(C.rubber, cableCols[i], { size: 0.045, axis: "y", width: 0.3, wobble: 0.1, seed: i }),
      bone: chest,
    });
    b.part(cyl(0.015, 0.015, 0.032, 8), CHROME, { bone: chest, at: [x, 1.325, -0.215] });
    glow(band(V(x, 1.34, -0.215), V(0, 1, 0), chest, 0.015, 0.003, cableCols[i], 8), 1.3);
  });

  // rack shoulder straps draped on the jacket
  for (const s of [1, -1]) {
    const rough = catmull([
      [s * 0.1, 1.33, -0.15],
      [s * 0.1, 1.5, -0.07],
      [s * 0.1, 1.47, 0.09],
      [s * 0.095, 1.3, 0.145],
      [s * 0.09, 1.12, 0.14],
    ]);
    b.sweep(jacketSkin.drape(rough, { lift: 0.007 }), () => [0.017, 0.006], { section: "box", color: C.strap });
  }

  // neck jack ports
  const neckSw = b.sweep(neck, [0.052, 0.05], { color: SKINP });
  const neckSkin = b.surface(neckSw);
  const portHits: any[] = [];
  for (const s of [1, -1]) {
    const h = neckSkin.around([0, 1.6, 0.015]).at(s * 62, 0);
    portHits.push(h);
    if (h) {
      b.stick(cyl(0.012, 0.014, 0.012, 8), CHROME, h, { embed: 0.3 });
      glow(b.stick(cyl(0.006, 0.006, 0.014, 6), s > 0 ? C.cyan : C.magenta, h, { embed: 0.1 }), 1.3);
    }
  }

  // ------------------------------------------------------------------ arms
  const armR = [0.062, 0.058, 0.052, 0.05, 0.044, 0.038, 0.034];
  const armF = prof(armR);
  const handFn = (
    s: number,
    S: string,
    wrist: any,
    w: THREE.Vector3,
    d: THREE.Vector3,
    skin: any,
    cyber: boolean,
  ) => {
    const inward = V(-s, 0, 0);
    const palmC = w.clone().addScaledVector(d, 0.045);
    b.part(box(0.03, 0.09, 0.082), skin, { bone: wrist, at: palmC, dir: d });
    b.part(box(0.008, 0.07, 0.072), cyber ? CHROME : C.graphite, {
      bone: wrist,
      at: palmC.clone().add(V(s * 0.018, 0, 0)),
      dir: d,
    });
    const names = ["index", "middle", "ring", "pinky"];
    const fz = [0.03, 0.01, -0.012, -0.034];
    const fl = [0.075, 0.085, 0.08, 0.066];
    names.forEach((nm, i) => {
      const base = w.clone().addScaledVector(d, 0.088);
      base.z += fz[i];
      const pts = [0, 0.4, 0.72, 1].map((f, k) =>
        base.clone().addScaledVector(d, fl[i] * f).addScaledVector(inward, 0.004 * k),
      );
      const ch = b.chain(`${nm}${S}`, catmull(pts), {
        parent: wrist,
        role: "digit",
        names: [`${nm}1${S}`, `${nm}2${S}`, `${nm}3${S}`],
      });
      b.sweep(ch, [0.0095, 0.0068], { color: skin });
      if (cyber) glow(b.part(ball(0.0072, 6, 4), C.cyan, { bone: ch.joints[2], at: pts[3] }), 1.4);
    });
    const tb = w.clone().addScaledVector(d, 0.03).add(V(0, 0, 0.04));
    const td = d.clone().multiplyScalar(0.45).add(V(0, 0, 0.8)).addScaledVector(inward, 0.15).normalize();
    const tpts = [0, 0.3, 0.7, 1].map((f) => tb.clone().addScaledVector(td, 0.07 * f));
    const th = b.chain(`thumb${S}`, catmull(tpts), {
      parent: wrist,
      role: "digit",
      names: [`thumb1${S}`, `thumb2${S}`, `thumb3${S}`],
    });
    b.sweep(th, [0.011, 0.0075], { color: skin });
    if (cyber) glow(b.part(ball(0.0078, 6, 4), C.cyan, { bone: th.joints[2], at: tpts[3] }), 1.4);
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.joint(`clavicle${S}`, { parent: chest, at: [s * 0.05, 1.46, 0], aim: [s * 0.2, 1.45, 0] });
    const sh = V(s * 0.21, 1.44, 0);
    const el = V(s * 0.4, 1.21, 0);
    const wr = V(s * 0.56, 1.01, 0.045);
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: `clavicle${S}`,
      role: "arm",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
    });
    const [jSh, jEl, jWr] = arm.joints;
    const fd = wr.clone().sub(el).normalize();
    const pos = (u: number) => el.clone().add(wr.clone().sub(el).multiplyScalar(u));

    const armSw = b.sweep(arm, armF, {
      bands:
        s > 0
          ? [
              [0.53, jacketP],
              [1, CHROME],
            ]
          : [
              [0.53, jacketP],
              [0.9, "#1a1822"],
              [1, "#15141c"],
            ],
    });
    // elbow + wrist rings
    band(el, fd, jEl, 0.06, 0.009, s > 0 ? IRONP : C.graphite, 10);
    glow(band(pos(0.93), fd, jEl, 0.04, 0.005, s > 0 ? C.cyan : C.magenta, 10), 1.3);

    // shoulder pads: left chrome, right graphite with patch
    const padDir = N(s * 0.5, 0.85, 0);
    const padC = V(s * 0.25, 1.47, 0);
    const pad = b.part(new THREE.SphereGeometry(0.115, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), s > 0 ? CHROME : C.graphite, {
      bone: jSh,
      at: padC,
      dir: padDir,
      scale: [1, 0.55, 1],
      flat: true,
    });
    band(padC, padDir, jSh, 0.115, 0.009, C.yellow, 14);
    b.part(new THREE.SphereGeometry(0.075, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), s > 0 ? IRONP : C.ink, {
      bone: jSh,
      at: padC.clone().addScaledVector(padDir, 0.03),
      dir: padDir,
      scale: [1, 0.6, 1],
      flat: true,
    });
    if (s < 0)
      b.decal(pad, PATCH, {
        at: padC.clone().add(V(-0.07, 0.04, 0.0)),
        dir: N(-0.7, 0.5, 0.3),
        size: [0.07, 0.07],
        segments: 8,
      });

    if (s > 0) {
      // cyber forearm: rings, glowing lines, deck, hologram
      for (const u of [0.25, 0.5, 0.75]) band(pos(u), fd, jEl, armF(0.53 + 0.47 * u) + 0.004, 0.005, IRONP, 10);
      const nF = N(0.15, 0.05, 1);
      nF.addScaledVector(fd, -nF.dot(fd)).normalize();
      const side = fd.clone().cross(nF).normalize();
      const aSkin = b.surface(armSw);
      for (const sg of [1, -1]) {
        const rough = catmull([0.08, 0.28, 0.5, 0.72, 0.92].map((u) => pos(u).addScaledVector(side, sg * 0.06)));
        glow(b.sweep(aSkin.drape(rough, { lift: 0.002 }), 0.0036, { color: C.cyan, bone: arm }), 1.3);
      }
      const deckC = pos(0.45).addScaledVector(nF, 0.056);
      b.part(box(0.1, 0.028, 0.17), IRONP, { bone: jEl, at: deckC, dir: nF, up: fd });
      glow(
        b.part(new THREE.PlaneGeometry(0.085, 0.145), "#ffffff", {
          bone: jEl,
          at: deckC.clone().addScaledVector(nF, 0.0146),
          dir: nF,
          axis: "z",
          up: fd.clone().negate(),
          texture: DECK,
        }),
        1.1,
      );
      for (let k = 0; k < 3; k++)
        b.part(cyl(0.007, 0.007, 0.01, 6), k === 1 ? C.magenta : C.yellow, {
          bone: jEl,
          at: deckC.clone().addScaledVector(side, 0.054).addScaledVector(fd, -0.04 + k * 0.04),
          dir: side,
        });
      b.rod(deckC.clone().addScaledVector(fd, 0.08), deckC.clone().addScaledVector(fd, 0.08).addScaledVector(nF, 0.09), 0.003, C.rubber, {
        bone: jEl,
      });
      glow(b.part(ball(0.007), C.magenta, { bone: jEl, at: deckC.clone().addScaledVector(fd, 0.08).addScaledVector(nF, 0.095) }), 1.4);
      // hologram glyph over the deck
      glow(
        b.cards([frame(deckC.clone().addScaledVector(nF, 0.02), nF)], HOLO, {
          size: [0.13, 0.13],
          flow: [0, 0, 1],
          bone: jEl,
        }),
        1.2,
      );
      // neck-to-deck cable
      const hitP = portHits[0];
      if (hitP) {
        const st = hitP.at.clone().addScaledVector(hitP.n, 0.012);
        const endP = deckC.clone().addScaledVector(fd, -0.09).addScaledVector(nF, 0.012);
        const appr = deckC.clone().addScaledVector(fd, -0.17).addScaledVector(nF, 0.05);
        b.sweep(catmull([st, V(0.11, 1.665, 0.035), V(0.2, 1.64, 0.08), V(0.32, 1.52, 0.14), V(0.39, 1.36, 0.14), appr, endP]), 0.009, {
          color: C.rubber,
          bone: chest,
        });
        b.part(cyl(0.012, 0.012, 0.028, 8), CHROME, { bone: jEl, at: endP, dir: fd });
        glow(band(endP.clone().addScaledVector(fd, -0.012), fd, jEl, 0.012, 0.003, C.cyan, 8), 1.3);
      }
      handFn(s, S, jWr, wr, fd, CHROME, true);
    } else {
      // right bracer + glove
      const bStart = pos(0.15);
      b.lathe(
        [
          [0.046, 0],
          [0.058, 0],
          [0.05, 0.14],
          [0.042, 0.14],
        ],
        { at: bStart, axis: fd, segments: 8, color: IRONP, bone: jEl },
      );
      band(bStart, fd, jEl, 0.056, 0.006, C.yellow, 10);
      glow(band(pos(0.84), fd, jEl, 0.038, 0.004, C.magenta, 10), 1.3);
      handFn(s, S, jWr, wr, fd, "#15141c", false);
    }
  }

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.105;
    const hipP = V(s * 0.1, 0.92, 0);
    const kneeP = V(x, 0.5, 0.045);
    const ankleP = V(x, 0.105, -0.01);
    const ballP = V(x, 0.045, 0.14);
    const legPath = catmull([hipP, kneeP, ankleP, ballP]);
    const leg = b.chain(`leg${S}`, legPath, {
      parent: hips,
      role: "leg",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`],
      contact: [x, 0, 0.1],
    });
    const [jHip, jKnee, jAnk] = leg.joints;
    const tA = legPath.closestT(ankleP);
    const rf = prof([0.1, 0.092, 0.078, 0.07, 0.068, 0.07, 0.06, 0.056]);
    const legSw = b.sweep(leg, (t) => rf(t / tA), { to: tA, color: pantsP(s) });

    // neon line down the outside of the leg
    const lSkin = b.surface(legSw);
    const rough = catmull([
      [s * 0.205, 0.85, 0.01],
      [s * 0.2, 0.6, 0.04],
      [s * 0.195, 0.35, 0.02],
      [s * 0.17, 0.16, -0.005],
    ]);
    glow(b.sweep(lSkin.drape(rough, { lift: 0.003 }), 0.0045, { color: s > 0 ? C.cyan : C.magenta, bone: leg }), 1.2);

    // knee pad, cargo pocket, straps
    b.part(box(0.1, 0.12, 0.04), C.graphite, { bone: jKnee, at: [x, 0.5, 0.115] });
    b.part(box(0.1, 0.014, 0.044), C.yellow, { bone: jKnee, at: [x, 0.445, 0.115] });
    b.part(box(0.03, 0.14, 0.11), panelled("#1f1e2a", { size: 0.07, rivets: 0.02 }), { bone: jHip, at: [s * 0.2, 0.72, 0.0] });
    b.part(box(0.034, 0.02, 0.114), C.strap, { bone: jHip, at: [s * 0.2, 0.77, 0.0] });
    const calfC = V(x, 0.3, 0.02);
    band(calfC, V(0, 1, 0), jKnee, 0.074, 0.008, C.strap, 12);
    glow(b.part(box(0.02, 0.018, 0.012), s > 0 ? C.cyan : C.magenta, { bone: jKnee, at: [x + s * 0.074, 0.3, 0.02] }), 1.2);

    // boots
    b.part(cyl(0.066, 0.071, 0.1, 10), BOOTP, { bone: jAnk, at: [x, 0.155, -0.012] });
    band(V(x, 0.2, -0.012), V(0, 1, 0), jAnk, 0.069, 0.007, C.yellow, 10);
    b.loft(
      [
        { at: [x, 0.062, -0.06], w: 0.1, h: 0.11 },
        { at: [x, 0.058, 0.05], w: 0.112, h: 0.095 },
        { at: [x, 0.046, 0.17], w: 0.098, h: 0.064 },
      ],
      { bone: jAnk, color: BOOTP },
    );
    b.part(box(0.125, 0.028, 0.31), C.ink, { bone: jAnk, at: [x, 0.014, 0.045] });
    glow(b.part(box(0.129, 0.007, 0.26), s > 0 ? C.cyan : C.magenta, { bone: jAnk, at: [x, 0.015, 0.045] }), 1.3);
    b.part(box(0.07, 0.02, 0.1), C.graphite, { bone: jAnk, at: [x, 0.108, 0.075], rotation: [-12, 0, 0] });
    for (const [z, y] of [
      [0.03, 0.118],
      [0.07, 0.113],
      [0.11, 0.104],
    ])
      b.part(box(0.085, 0.008, 0.012), C.yellow, { bone: jAnk, at: [x, y, z] });
  }

  return b.root;
}
```