```ts
import * as THREE from "three";
import { createBuilder, mix, paint, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Spitfire Blueprint",
  description: "Supermarine Spitfire Mk I as a cyanotype blueprint: deep Prussian-blue skin, white grid and panel lines, white roundels and stencils.",
};

// ---- cyanotype palette
const DEEP = "#0a2f7a";
const MID = "#1456b8";
const LIGHT = "#3b88e6";
const CHALK = "#eaf4ff";
const PALEBLUE = "#9cc8ff";
const TIRE = "#06214f";

const dist = (x: number, s: number) => {
  const f = ((x / s) % 1 + 1) % 1;
  return Math.min(f, 1 - f) * s;
};
const CHALK_RGB: [number, number, number] = [0.92, 0.96, 1];

// Blueprint skin: lit/shadow blue, a 3D drafting grid projected on the dominant face, optional panel rings.
function blueprint(tone: number, panels: boolean) {
  const a = mix(DEEP, MID, tone);
  const c = mix(MID, LIGHT, tone);
  return paint((p, n) => {
    const lit = smoothstep(-0.6, 0.9, n.y);
    let col = mix(a, c, lit);
    const ax = Math.abs(n.x), ay = Math.abs(n.y);
    const [u, v] = ay > 0.6 ? [p.x, p.z] : ax > 0.6 ? [p.z, p.y] : [p.x, p.y];
    if (Math.min(dist(u, 1), dist(v, 1)) < 0.014) col = mix(col, CHALK_RGB, 0.6);
    else if (Math.min(dist(u, 0.25), dist(v, 0.25)) < 0.009) col = mix(col, CHALK_RGB, 0.25);
    if (panels) {
      if (dist(p.z, 0.7) < 0.013) col = mix(col, CHALK_RGB, 0.85);
      if (ay < 0.7 && dist(p.y - 1.45, 0.38) < 0.01) col = mix(col, CHALK_RGB, 0.7);
    }
    return col;
  });
}
const SKIN = blueprint(1, true);
const WING = blueprint(0.9, false);
const TAIL = blueprint(0.8, false);

// ---- drawings
const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#eaf4ff" stroke-width="6"/>
  <circle cx="50" cy="50" r="29" fill="none" stroke="#eaf4ff" stroke-width="6"/><circle cx="50" cy="50" r="13" fill="#eaf4ff"/></svg>`,
  { size: 192 },
);
const CODE = svg(
  `<svg viewBox="0 0 200 80"><text x="100" y="62" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="64" fill="#eaf4ff" stroke="#eaf4ff" stroke-width="1">QV·K</text></svg>`,
  { size: 384 },
);
const FLASH = svg(
  `<svg viewBox="0 0 60 80"><rect x="2" y="4" width="14" height="72" fill="none" stroke="#eaf4ff" stroke-width="3"/>
  <rect x="22" y="4" width="14" height="72" fill="#eaf4ff"/><rect x="42" y="4" width="14" height="72" fill="none" stroke="#eaf4ff" stroke-width="3"/></svg>`,
  { size: 128 },
);

// Elliptical plan outline for a half wing: (span u, chord z).
function planOutline(half: number, rootChord: number, sweep: number, zoff: number, N = 14): [number, number][] {
  const le: [number, number][] = [];
  const te: [number, number][] = [];
  const u0 = half * 0.04;
  for (let i = 0; i <= N; i++) {
    const u = u0 + (half * 0.99 - u0) * (i / N);
    const k = u / half;
    const c = rootChord * Math.sqrt(Math.max(1 - k * k, 0.0001));
    const zm = zoff + sweep * k * k;
    le.push([u, zm + 0.62 * c]);
    te.push([u, zm - 0.38 * c]);
  }
  return [...le, ...te.reverse()];
}

export default function build() {
  const b = createBuilder({ name: "spitfire", paintSize: 2048 });
  const SIDES = [1, -1];

  // ---- fuselage
  const fus = b.loft(
    [
      { at: [0, 1.55, -4.5], w: 0.08, h: 0.2 },
      { at: [0, 1.55, -3.5], w: 0.3, h: 0.5 },
      { at: [0, 1.5, -2], w: 0.6, h: 0.85 },
      { at: [0, 1.45, -0.5], w: 0.8, h: 1.05 },
      { at: [0, 1.5, 1], w: 0.8, h: 1.0 },
      { at: [0, 1.6, 2.4], w: 0.66, h: 0.9 },
      { at: [0, 1.75, 3.6], w: 0.6, h: 0.8 },
      { at: [0, 1.85, 4.3], w: 0.5, h: 0.65 },
    ],
    { color: SKIN, sides: 12, name: "fuselage" },
  );

  // ---- wings
  const wingPlan = planOutline(5.6, 2.4, 0.5, 0.1);
  for (const s of SIDES) {
    b.extrude(wingPlan, { at: [0, 1.2, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.22, bevel: 0.05, color: WING, name: "wing" });
    // upper-wing roundel
    b.part(new THREE.PlaneGeometry(1.3, 1.3), "#ffffff", { at: [s * 3.5, 1.322, 0.5], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: ROUNDEL });
    // cannon / machine-gun barrels in the leading edge
    for (const x of [2.1, 2.6]) {
      b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.55, 6), CHALK, { at: [s * x, 1.2, 1.45 + (x - 2.1) * -0.2], dir: [0, 0, 1] });
    }
    // radiator / oil cooler pods
    const big = s > 0 ? 1 : 0.8;
    b.part(new THREE.SphereGeometry(1, 10, 8), blueprint(0.7, false), { at: [s * 2.7, 1.04, 0.35], scale: [0.3 * big, 0.17, 0.58] });
    b.part(new THREE.BoxGeometry(0.34 * big, 0.12, 0.03), CHALK, { at: [s * 2.7, 0.96, 0.9] });
    // landing gear
    b.rod([s * 1.6, 1.2, 0.45], [s * 2.0, 0.4, 0.35], 0.055, CHALK, { name: "gearLeg" });
    b.frustumBox([s * 1.7, 1.1, 0.5], [s * 1.95, 0.55, 0.43], [0.16, 0.05], [0.14, 0.05], { color: MID, name: "gearDoor" });
    b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.17, 14), TIRE, { at: [s * 2.0, 0.36, 0.35], dir: [1, 0, 0], name: "wheel" });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 10), CHALK, { at: [s * 2.0, 0.36, 0.35], dir: [1, 0, 0], name: "hub" });
    // exhaust stacks
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.17, 6), PALEBLUE, { at: [s * 0.3, 1.8, 2.5 + i * 0.2], dir: [s, 0.15, -0.5], name: "exhaust" });
    }
    // tailplane
    b.extrude(planOutline(1.8, 1.2, 0.2, -4.2), { at: [0, 1.52, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.02, color: TAIL, name: "tailplane" });
    // side markings
    b.decal(fus, ROUNDEL, { at: [s * 0.3, 1.5, -2.0], dir: [s, 0, 0], size: [0.6, 0.6], name: "fuseRoundel" });
    b.decal(fus, CODE, { at: [s * 0.4, 1.45, -0.2], dir: [s, 0, 0], size: [1.0, 0.4], name: "fuseCode" });
    // fin flash
    b.part(new THREE.PlaneGeometry(0.4, 0.55), "#ffffff", { at: [s * 0.045, 2.15, -3.7], dir: [s, 0, 0], up: [0, 1, 0], axis: "z", texture: FLASH });
  }
  // pitot on left wing
  b.rod([3.0, 1.1, 0.6], [3.0, 1.1, 1.3], 0.015, CHALK);

  // ---- fin & rudder
  b.extrude(
    [[-0.25, 0.05], [1.5, 0], [0.95, 0.95], [0.5, 1.6], [0.0, 1.55], [-0.25, 1.0]],
    { at: [0, 1.5, -4.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bevel: 0.02, smoothing: 1, color: TAIL, name: "fin" },
  );
  // rudder hinge line
  b.rod([0, 1.58, -4.05], [0, 3.0, -4.1], 0.012, CHALK);

  // tail wheel
  b.rod([0, 1.45, -3.9], [0, 0.16, -4.1], 0.035, CHALK);
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 10), TIRE, { at: [0, 0.13, -4.1], dir: [1, 0, 0], name: "tailWheel" });

  // ---- canopy
  const canopy = b.part(new THREE.SphereGeometry(1, 12, 8), PALEBLUE, { at: [0, 1.95, 0.1], scale: [0.34, 0.3, 1.0], name: "canopy" });
  glow(canopy, 0.35);
  for (const dz of [-0.55, 0.1, 0.75]) {
    const f = Math.sqrt(1 - dz * dz);
    b.part(new THREE.TorusGeometry(1, 0.045, 4, 12, Math.PI), CHALK, {
      at: [0, 1.95, 0.1 + dz],
      scale: [0.34 * f + 0.01, 0.3 * f + 0.01, 1],
      name: "canopyRib",
    });
  }
  // headrest + aerial mast + wire
  b.rod([0, 1.96, -1.1], [0, 2.5, -1.1], 0.015, CHALK);
  b.rod([0, 2.5, -1.1], [0, 3.0, -4.15], 0.008, CHALK);

  // ---- nose, spinner and propeller
  b.part(new THREE.ConeGeometry(0.27, 0.6, 12), CHALK, { at: [0, 1.85, 4.65], dir: [0, 0, 1], name: "spinner" });
  const bladeOutline: [number, number][] = [[0.15, -0.08], [1.0, -0.15], [1.6, -0.1], [1.62, 0.06], [1.0, 0.12], [0.15, 0.08]];
  for (let k = 0; k < 3; k++) {
    const a = (k * 120 + 15) * (Math.PI / 180);
    b.extrude(bladeOutline, {
      at: [0, 1.85, 4.4],
      x: [Math.cos(a), Math.sin(a), 0],
      y: [-Math.sin(a), Math.cos(a), 0],
      thickness: 0.04,
      color: CHALK,
      name: "blade",
    });
  }
  // blade tip bands
  for (let k = 0; k < 3; k++) {
    const a = (k * 120 + 15) * (Math.PI / 180);
    b.part(new THREE.BoxGeometry(0.2, 0.2, 0.05), MID, {
      at: [Math.cos(a) * 1.5, 1.85 + Math.sin(a) * 1.5, 4.4],
      dir: [Math.cos(a), Math.sin(a), 0],
      name: "bladeTip",
    });
  }
  // cowl intake lip ring
  b.part(new THREE.TorusGeometry(0.3, 0.025, 5, 14), CHALK, { at: [0, 1.85, 4.3], name: "cowlLip" });
  // belly chin radiator scoop
  b.part(new THREE.BoxGeometry(0.3, 0.14, 0.5), MID, { at: [0, 1.15, 2.2], name: "chinScoop" });

  return b.root;
}
```