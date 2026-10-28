import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { catmull } from "../../../../src/index";
import { mottle, paint, mix, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { DEG, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "A towering stylized kraken surfacing with eight spread tentacles: violet hide, coral suckers, glowing cyan orbs, a horned brow, a split beak and a spiked mantle.",
};

const VIOLET = "#6a47d6";
const VIOLET_D = "#3c2a92";
const INDIGO = "#2b2370";
const CORAL = "#ff8fa8";
const PINK = "#ffc2d1";
const MAGENTA = "#e0449c";
const CYAN = "#3ef2ff";
const YELLOW = "#ffd23a";
const BLACK = "#120a22";
const BEAK = "#2a1c3a";
const BEAK_L = "#6a5478";
const IVORY = "#f3e8c8";

const skinPaint = mottle(VIOLET, "#7d5ff0", { size: 0.6, seed: 4 });
const hidePaint = paint((p, n, s) => {
  const base = skinPaint.at(p, n);
  const shade = smoothstep(-0.8, 0.6, n.y);
  return [base[0] * (0.7 + 0.3 * shade), base[1] * (0.7 + 0.3 * shade), base[2] * (0.75 + 0.25 * shade)];
});
const tentPaint = paint((p, n, s) => {
  const d = ((s[1] % 360) + 360) % 360;
  const a = d > 180 ? 360 - d : d;
  if (s[0] > 0.9) return MAGENTA;
  if (a > 128) return mix(CORAL, PINK, smoothstep(150, 180, a));
  if (a > 118) return INDIGO;
  const stripe = Math.sin(s[0] * 40) > 0.75 ? 0.35 : 0;
  return mix(hidePaint.at(p, n), VIOLET_D, stripe);
});

const EYE_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#ffb21f"/>
    <circle cx="50" cy="50" r="38" fill="#ffe25a"/>
    <ellipse cx="50" cy="50" rx="9" ry="30" fill="#120a22"/>
    <circle cx="38" cy="36" r="7" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "kraken", paintSize: 2048 });
  const R = rng(9);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- skeleton
  const core = b.joint("core", { at: [0, 1.5, 0], dir: [0, 1, 0], role: "spine" });
  const mantle = b.joint("mantle", { parent: core, at: [0, 2.4, -0.4], dir: [0, 1, -0.4], role: "spine" });
  const head = b.joint("head", { parent: core, at: [0, 2.0, 0.3], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.55, 1.1], dir: [0, 0, 1], role: "jaw" });

  // ---- mantle and head
  const tilt = 25;
  const C = V(0, 3.2, -0.7);
  b.part(new THREE.SphereGeometry(1, 14, 10), hidePaint, {
    bone: mantle,
    at: C.toArray(),
    rotation: [-tilt, 0, 0],
    scale: [1.1, 1.75, 1.15],
  });
  b.part(new THREE.SphereGeometry(1.25, 14, 10), hidePaint, { bone: head, at: [0, 2.0, 0.2] });
  // brow band and cheek mass
  b.part(new THREE.SphereGeometry(1, 10, 7), VIOLET_D, {
    bone: head,
    at: [0, 1.55, 0.7],
    scale: [1.2, 0.5, 0.8],
  });

  // mantle crest spikes and glowing orbs
  const up = V(0, Math.cos(tilt * DEG), -Math.sin(tilt * DEG));
  const back = V(0, -Math.sin(tilt * DEG), -Math.cos(tilt * DEG));
  for (let i = 0; i < 6; i++) {
    const s = -0.1 + i * 0.16;
    const k = Math.sqrt(1 - s * s);
    const pt = C.clone().addScaledVector(up, 1.75 * s).addScaledVector(back, 1.15 * k * 0.95);
    const tip = pt.clone().addScaledVector(back, 0.45).addScaledVector(up, 0.4);
    b.spike(pt, tip, null, 0.17 - i * 0.012, { bone: mantle, color: IVORY, sides: 5 });
  }
  const orbGeo = new THREE.OctahedronGeometry(0.1, 0);
  for (let i = 0; i < 14; i++) {
    const s = -0.5 + (i % 7) * 0.15;
    const side = i < 7 ? 1 : -1;
    const k = Math.sqrt(1 - s * s);
    const ang = side * (60 + (i % 3) * 8) * DEG;
    const lateral = V(Math.sin(ang), 0, 0).multiplyScalar(1.12 * k);
    const pt = C.clone().addScaledVector(up, 1.75 * s).add(lateral).addScaledVector(back, 0.25 * k);
    glow(b.part(orbGeo, CYAN, { bone: mantle, at: pt.toArray(), scale: [1, 1.3, 1] }), 1.3);
  }
  // side fins
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), MAGENTA, {
      bone: mantle,
      at: [s * 1.25, 3.0, -0.75],
      rotation: [-tilt, 0, s * -25],
      scale: [0.16, 1.0, 0.65],
    });
  }

  // ---- face
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.34, 10, 8), YELLOW, { bone: head, at: [s * 0.72, 2.25, 1.0] });
    glow(
      b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", {
        bone: head,
        at: [s * 0.74, 2.25, 1.32],
        dir: [s * 0.2, 0, 1],
        axis: "z",
        texture: EYE_TEX,
      }),
      0.8,
    );
    // angry brow
    b.part(new THREE.BoxGeometry(0.85, 0.2, 0.4), INDIGO, {
      bone: head,
      at: [s * 0.72, 2.66, 1.0],
      rotation: [0, 0, s * -22],
    });
    // brow horn
    b.spike([s * 1.0, 2.8, 0.7], [s * 1.55, 3.55, 0.1], null, 0.14, { bone: head, color: IVORY, sides: 5 });
    // cheek barb
    b.spike([s * 1.1, 1.7, 0.6], [s * 1.7, 1.35, 0.45], null, 0.1, { bone: head, color: IVORY, sides: 5 });
    // nostril dots
    b.part(new THREE.SphereGeometry(0.06, 5, 4), BLACK, { bone: head, at: [s * 0.18, 1.95, 1.42] });
  }

  // beak: upper hooked, lower on jaw
  b.sweep(catmull([V(0, 1.85, 1.0), V(0, 1.75, 1.5), V(0, 1.45, 1.8)]), [0.36, 0.2, 0.0], {
    bone: head,
    color: BEAK,
    sides: 6,
    caps: "point",
  });
  b.sweep(catmull([V(0, 1.48, 1.0), V(0, 1.4, 1.5), V(0, 1.6, 1.8)]), [0.3, 0.17, 0.0], {
    bone: jaw,
    color: BEAK_L,
    sides: 6,
    caps: "point",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#a02b4c", {
    bone: jaw,
    at: [0, 1.5, 1.25],
    scale: [0.3, 0.1, 0.35],
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 22 });

  // ---- tentacles
  const suckerBig = new THREE.CylinderGeometry(0.1, 0.13, 0.05, 8);
  const suckerMid = new THREE.CylinderGeometry(0.07, 0.09, 0.04, 8);
  const suckerSm = new THREE.CylinderGeometry(0.045, 0.06, 0.035, 6);
  const dot = new THREE.CylinderGeometry(0.045, 0.045, 0.012, 6);

  for (let i = 0; i < 8; i++) {
    const raised = i === 3 || i === 4; // the two back tentacles reach for the sky
    const a = ((i * 45 + 22 + (raised ? 0 : 0)) * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const wob = 0.2 * (R() - 0.5);
    const rr = raised ? [0.8, 1.5, 2.2, 2.6, 2.2] : [0.8, 1.9, 3.3, 4.5, 5.3 + R() * 0.5];
    const hh = raised ? [1.4, 2.7, 3.9, 4.8, 5.4] : [1.4, 1.95, 1.0, 0.32, 0.1 + (i % 2) * 0.12];
    const pts = rr.map((r, k) => {
      const sway = wob * k;
      const px = dx * r + -dz * sway;
      const pz = dz * r + dx * sway;
      return V(px, hh[k], pz);
    });
    const path = catmull(pts);
    const name = `tentacle${i + 1}`;
    const ch = b.chain(name, path, { parent: core, count: raised ? 6 : 5, role: "tentacle" });
    const sw = b.sweep(ch, (t: number) => 0.48 * (1 - t) ** 1.1 + 0.05, {
      color: tentPaint,
      sides: 8,
      caps: "round",
    });
    for (let k = 0; k < 11; k++) {
      const t = 0.1 + k * 0.075;
      const hit = sw.at(t, 180);
      const geo = t < 0.35 ? suckerBig : t < 0.65 ? suckerMid : suckerSm;
      b.stick(geo, PINK, hit, { embed: 0.35 });
      b.stick(dot, MAGENTA, hit.moved([0, 0.02, 0]), { embed: 0 });
    }
  }

  return b.root;
}
