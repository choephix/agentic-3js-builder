import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { countershade, mottle, scales } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Void Horror",
  description:
    "A carapaced void beast on eight curling tentacles, with one great magenta eye under a brow ridge, gold socket spikes, violet dome ribs, a crystal crown and a glowing summoning circle.",
  style: "League of Legends",
  commit: "b816db2",
};

const SHELL = "#2a1150";
const SHELL_EDGE = "#8a3fe0";
const SHELL_DEEP = "#120625";
const PLUM = "#4b1c7c";
const VIOLET = "#7d3bd1";
const GOLD = "#f2bf4b";
const MAGENTA = "#ff2fb8";
const CRYSTAL = "#d26bff";
const CYAN = "#3ff5ff";
const SCLERA = "#efe6ff";

// Radius of a tentacle tube at source t (0 at the root, 1 at the tip).
const tentacleRadius = (t: number) => 0.03 + 0.11 * Math.pow(1 - t, 1.5);

// Points on a ring round the eye centre (0, 1.5), lying in the plane z = z, from angle a0 to a1 in degrees.
const eyeArc = (r: number, z: number, n: number, a0: number, a1: number): number[][] =>
  Array.from({ length: n }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / (n - 1)) * Math.PI) / 180;
    return [Math.sin(a) * r, 1.5 + Math.cos(a) * r, z];
  });

// A point on a circle of radius r (in a 100-unit drawing) at angle ang (radians), for SVG markup.
const polar = (r: number, ang: number) => `${(50 + Math.cos(ang) * r).toFixed(2)} ${(50 + Math.sin(ang) * r).toFixed(2)}`;

// Eight tentacles: azimuth (0 = front, +Z), reach factor, sideways sway (-1..1).
const tentacles = [
  { az: 20, reach: 1.0, sway: 0.35 },
  { az: 65, reach: 1.15, sway: -0.3 },
  { az: 110, reach: 0.92, sway: 0.4 },
  { az: 150, reach: 1.2, sway: -0.35 },
  { az: 200, reach: 1.05, sway: 0.3 },
  { az: 245, reach: 0.95, sway: -0.4 },
  { az: 290, reach: 1.18, sway: 0.25 },
  { az: 335, reach: 1.0, sway: -0.3 },
];

export default function build() {
  const b = createBuilder({ name: "voidHorror" });
  const R = rng(11);

  // Textures.
  const IRIS = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><radialGradient id="g" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#fff3a8"/><stop offset="0.3" stop-color="#ff5cd6"/>
<stop offset="0.75" stop-color="#c020ff"/><stop offset="1" stop-color="#3a0a6e"/></radialGradient></defs>
<circle cx="50" cy="50" r="49.5" fill="url(#g)"/>
<g stroke="#ffe0f6" stroke-width="1.4" opacity="0.7">${Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return `<line x1="${(50 + Math.cos(a) * 16).toFixed(2)}" y1="${(50 + Math.sin(a) * 16).toFixed(2)}" x2="${(50 + Math.cos(a) * 47).toFixed(2)}" y2="${(50 + Math.sin(a) * 47).toFixed(2)}"/>`;
    }).join("")}</g>
<circle cx="50" cy="50" r="17" fill="none" stroke="#fff3a8" stroke-width="1.6"/>
<ellipse cx="50" cy="50" rx="7" ry="34" fill="#0b0214"/>
</svg>`,
    { size: 512 },
  );
  const VEINS = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + 0.1;
      return `<path d="M${polar(41, a)} Q${polar(46, a + 0.2)} ${polar(50, a + 0.06)}" fill="none" stroke="#b58cff" stroke-width="1.6"/>`;
    }).join("")}</svg>`,
    { size: 512 },
  );
  const FLOOR = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<circle cx="100" cy="100" r="98" fill="none" stroke="#ff2fb8" stroke-width="3"/>
<circle cx="100" cy="100" r="88" fill="none" stroke="#c77dff" stroke-width="1.5" stroke-dasharray="6 5"/>
<circle cx="100" cy="100" r="70" fill="none" stroke="#ff2fb8" stroke-width="2"/>
<circle cx="100" cy="100" r="40" fill="none" stroke="#c77dff" stroke-width="1.5"/>
${Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return `<line x1="${(100 + Math.cos(a) * 40).toFixed(2)}" y1="${(100 + Math.sin(a) * 40).toFixed(2)}" x2="${(100 + Math.cos(a) * 70).toFixed(2)}" y2="${(100 + Math.sin(a) * 70).toFixed(2)}" stroke="#c77dff" stroke-width="1.5"/>`;
    }).join("")}
${Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const x = 100 + Math.cos(a) * 80;
      const y = 100 + Math.sin(a) * 80;
      return `<path d="M${x.toFixed(2)} ${(y - 7).toFixed(2)} L${(x + 6).toFixed(2)} ${(y + 6).toFixed(2)} L${(x - 6).toFixed(2)} ${(y + 6).toFixed(2)} Z" fill="none" stroke="#ff9be0" stroke-width="2"/>`;
    }).join("")}
</svg>`,
    { size: 512 },
  );
  const RUNE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M32 6 L56 32 L32 58 L8 32 Z" fill="none" stroke="#ff4fd8" stroke-width="5"/>
<path d="M32 18 L32 46 M20 32 L44 32" stroke="#ff9be8" stroke-width="4"/>
<circle cx="32" cy="32" r="6" fill="#ffe6fb"/></svg>`,
    { size: 128 },
  );

  // Paints.
  const shellPaint = countershade(scales(SHELL, SHELL_EDGE, { size: 0.22 }), PLUM, { level: 0 });
  const tentPaint = countershade(mottle(VIOLET, PLUM, { size: 0.2 }), SHELL_DEEP, { level: 0 });

  // Skeleton: a root core at the chest, the spine up through the base, chest and brow to the crown.
  // The eye and its brow ride the chest; eight tentacles root on the core.
  const core = b.joint("core", { at: [0, 1.42, 0], role: "spine" });
  const body = b.chain(
    "body",
    catmull([
      [0, 0.95, 0],
      [0, 1.42, 0],
      [0, 1.86, -0.01],
      [0, 2.1, -0.03],
    ]),
    { parent: core, names: ["base", "chest", "brow", "crown"], role: "spine" },
  );
  const eyeC: [number, number, number] = [0, 1.5, 1.0];
  const eye = b.joint("eye", { parent: body.joints[1], at: eyeC, role: "head" });
  const lid = b.joint("lid", { parent: body.joints[1], at: eyeC, role: "hinge" });

  // Carapace: one dome skinned over the spine.
  const shell = b.sweep(body, [0.6, 0.97, 1.08, 1.0, 0.72, 0.18], { color: shellPaint });
  const skin = b.surface(shell);

  // Dome ribs: violet ridges running from the base up to the crown, draped onto the carapace.
  for (const az of [-150, -105, -60, 60, 105, 150]) {
    const a = (az * Math.PI) / 180;
    const ribPts = Array.from({ length: 9 }, (_, i) => {
      const s = i / 8;
      const r = 1.09 * Math.pow(Math.sin(Math.PI * (0.12 + 0.82 * s)), 0.7);
      return [Math.sin(a) * r, 0.95 + 1.15 * s, Math.cos(a) * r];
    });
    b.sweep(skin.drape(catmull(ribPts), { lift: 0.02 }), 0.03, { color: SHELL_EDGE });
  }

  // The great eye: pale sclera with veins, glowing magenta iris, gold socket, brow ridge on a hinge.
  const eyeball = b.part(new THREE.SphereGeometry(0.3, 18, 12), SCLERA, { bone: eye, at: eyeC });
  b.decal(eyeball, VEINS, { at: [0, 1.5, 1.3], dir: [0, 0, 1], size: [0.6, 0.6], lift: 0.0008 });
  glow(b.decal(eyeball, IRIS, { at: [0, 1.5, 1.3], dir: [0, 0, 1], size: [0.46, 0.46] }));
  b.sweep(skin.drape(catmull(eyeArc(0.38, 1.1, 16, 0, 360), { closed: true }), { lift: 0.02 }), 0.024, {
    color: GOLD,
  });
  glow(b.sweep(skin.drape(catmull(eyeArc(0.3, 1.1, 16, 0, 360), { closed: true }), { lift: 0.01 }), 0.01, { color: MAGENTA }));
  for (const p of eyeArc(0.42, 1.15, 12, 0, 360)) {
    const h = skin.nearest(p);
    b.spike(h, h, 0.2, 0.032, { color: GOLD });
  }
  b.sweep(skin.drape(eyeArc(0.52, 1.12, 9, -70, 70), { lift: 0.03 }), 0.055, {
    bone: lid,
    color: SHELL_EDGE,
    caps: { start: "round", end: "point" },
  });

  // Gold belt round the carapace with studs.
  const belt = skin.loop(body.at(0.25), { lift: 0.012 });
  b.sweep(belt, 0.026, { color: GOLD });
  b.along(belt, 20, (at) => {
    b.part(new THREE.SphereGeometry(0.034, 6, 4), GOLD, { at });
  });

  // Glowing gill ring round the dome's underside, where the tentacles leave it.
  const gill = skin.loop(body.at(0.1), { lift: 0.01 });
  glow(b.sweep(gill, 0.016, { color: MAGENTA }));
  for (let i = 0; i < 14; i++) {
    const tooth = skin.nearest(gill.at(i / 14));
    b.spike(tooth, tooth, 0.1, 0.03, { color: SCLERA });
  }

  // Crown of crystal shards.
  const crowns: [number, number, number][] = [
    [55, 58, 0.55],
    [-55, 60, 0.5],
    [135, 50, 0.5],
    [-135, 52, 0.52],
    [180, 78, 0.34],
    [90, 74, 0.3],
    [-90, 74, 0.3],
  ];
  for (const [az, el, len] of crowns) {
    const h = skin.around([0, 1.55, 0]).at(az, el);
    if (h) glow(b.spike(h, h, len, 0.075, { color: CRYSTAL }));
  }

  // Glowing runes scattered over the carapace, clear of the eye.
  const runes = skin.scatter(16, {
    rng: R,
    minDist: 0.28,
    filter: (h) => h.n.y > -0.1 && h.at.y > 1.15 && Math.hypot(h.at.x, h.at.y - 1.5) > 0.6,
  });
  glow(b.cards(runes, RUNE, { size: 0.17, lean: 70 }));

  // Eight tentacles from the underside, banded in gold, each with glowing suckers and a gold claw.
  for (const [k, c] of tentacles.entries()) {
    const a = (c.az * Math.PI) / 180;
    const u = [Math.sin(a), Math.cos(a)];
    const pv = [Math.cos(a), -Math.sin(a)];
    const spread = 0.78 * c.reach;
    const pt = (r: number, y: number, w: number) => [u[0] * r + pv[0] * w, y, u[1] * r + pv[1] * w];
    const path = catmull([
      pt(0.2, 0.66, 0),
      pt(0.62, 0.5, 0.06),
      pt(0.98 * spread, 0.3, 0.18 * c.sway),
      pt(1.3 * spread, 0.11, 0.3 * c.sway),
      pt(1.56 * spread, 0.027, 0.36 * c.sway),
      pt(1.66 * spread, 0.2, 0.3 * c.sway),
    ]);
    const chain = b.chain(`tent${k}`, path, { parent: core, count: 6, role: "tentacle" });
    const tube = b.sweep(chain, tentacleRadius, {
      bands: [
        [0.4, tentPaint],
        [0.44, GOLD],
        [0.7, tentPaint],
        [0.73, GOLD],
        [1, tentPaint],
      ],
    });
    for (let t = 0.1; t < 0.92; t += 0.06) {
      const r = tentacleRadius(t);
      glow(b.stick(new THREE.CylinderGeometry(r * 0.4, r * 0.4, r * 0.5, 8), CYAN, tube.at(t, 150)));
    }
    const tip = chain.at(1);
    b.spike(tip, tip, 0.13, 0.028, { color: GOLD });
  }

  // Summoning circle on the floor.
  glow(
    b.part(new THREE.CircleGeometry(1.9, 72), "#ffffff", {
      at: [0, 0.003, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: FLOOR,
    }),
  );

  return b.root;
}
