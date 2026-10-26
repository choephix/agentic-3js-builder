import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, catmull, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Spitfire Blueprint",
  description: "Supermarine Spitfire Mk I fighter, cyanotype blueprint style: deep Prussian blue with white drafting lines.",
};

const DEEP = "#0a2f7a";
const MID = "#1d56b0";
const LIGHT = "#5a95e6";
const LINE = "#e6f0ff";
const DARK = "#061f50";
const GLASS = "#8fc2f5";

// Blueprint paint: lit tone by normal, grid lines in white on the dominant face plane.
const bp = (lo: string, hi: string, seed: number, cell = 0.25) =>
  paint((p, n) => {
    const lit = smoothstep(-0.6, 0.9, n.y);
    let c = mix(lo, hi, lit * 0.7 + noise(p, 0.6, seed) * 0.3);
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const fu = Math.abs(((u / cell) % 1 + 1) % 1 - 0.5);
    const fv = Math.abs(((v / cell) % 1 + 1) % 1 - 0.5);
    const major = Math.abs(((u / (cell * 4)) % 1 + 1) % 1 - 0.5) > 0.485 || Math.abs(((v / (cell * 4)) % 1 + 1) % 1 - 0.5) > 0.485;
    if (major) c = mix(c, LINE, 0.55);
    else if (fu > 0.488 || fv > 0.488) c = mix(c, LINE, 0.25);
    return c;
  });

const SKIN = bp(DEEP, MID, 3);
const WINGP = bp(MID, LIGHT, 5, 0.2);
const DARKP = bp(DARK, DEEP, 7);

const roundel = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#e6f0ff" stroke-width="4"/>
  <circle cx="50" cy="50" r="32" fill="none" stroke="#e6f0ff" stroke-width="4"/>
  <circle cx="50" cy="50" r="16" fill="#e6f0ff"/>
  <path d="M4 50H96M50 4V96" stroke="#e6f0ff" stroke-width="1.5" opacity="0.6"/></svg>`,
  { size: 128 },
);
const codeTex = svg(
  `<svg viewBox="0 0 200 60"><text x="100" y="42" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#e6f0ff">QJ-K</text>
  <path d="M5 54H195" stroke="#e6f0ff" stroke-width="2"/></svg>`,
  { size: 256 },
);
const dimTex = svg(
  `<svg viewBox="0 0 240 80"><path d="M6 50H234M6 38V62M234 38V62M6 50l14-7v14zM234 50l-14-7v14z" stroke="#e6f0ff" stroke-width="3" fill="#e6f0ff"/>
  <text x="120" y="32" text-anchor="middle" font-family="monospace" font-size="24" font-weight="bold" fill="#e6f0ff">5.6 m</text></svg>`,
  { size: 384 },
);
const titleTex = svg(
  `<svg viewBox="0 0 240 80"><rect x="3" y="3" width="234" height="74" fill="none" stroke="#e6f0ff" stroke-width="3"/>
  <path d="M3 40H237" stroke="#e6f0ff" stroke-width="2"/>
  <text x="120" y="31" text-anchor="middle" font-family="monospace" font-size="24" font-weight="bold" fill="#e6f0ff">SPITFIRE Mk I</text>
  <text x="120" y="66" text-anchor="middle" font-family="monospace" font-size="20" fill="#e6f0ff">MERLIN II / 1:1</text></svg>`,
  { size: 384 },
);
const finTex = svg(
  `<svg viewBox="0 0 100 100"><rect x="5" y="5" width="30" height="90" fill="none" stroke="#e6f0ff" stroke-width="5"/>
  <rect x="35" y="5" width="30" height="90" fill="#e6f0ff"/><rect x="65" y="5" width="30" height="90" fill="none" stroke="#e6f0ff" stroke-width="5"/></svg>`,
  { size: 128 },
);

// Elliptical plan outline (x = span, y = forward z).
function plan(span: number, chord: number, zoff: number) {
  const pts: [number, number][] = [];
  const back: [number, number][] = [];
  for (let i = 0; i <= 9; i++) {
    const x = 0.25 + ((span - 0.25) * i) / 9;
    const c = chord * Math.sqrt(Math.max(1 - (x / (span * 1.03)) ** 2, 0.02));
    pts.push([x, zoff + c * 0.45]);
    back.push([x, zoff - c * 0.55]);
  }
  return [...pts, ...back.reverse()];
}

export default function build() {
  const b = createBuilder({ name: "spitfire" });
  const NOSE_Y = 1.85;

  // Fuselage
  const fus = b.loft(
    [
      { at: [0, 1.85, 3.2], w: 0.7, h: 0.8 },
      { at: [0, 1.82, 2.0], w: 0.85, h: 0.95 },
      { at: [0, 1.74, 0.5], w: 0.8, h: 1.0 },
      { at: [0, 1.65, -1.0], w: 0.65, h: 0.9 },
      { at: [0, 1.55, -2.5], w: 0.45, h: 0.65 },
      { at: [0, 1.5, -4.0], w: 0.28, h: 0.45 },
      { at: [0, 1.5, -5.3], w: 0.1, h: 0.28 },
    ],
    { color: SKIN, section: { ngon: 8 }, caps: "flat" },
  );

  // Cowl band and spinner
  b.part(new THREE.TorusGeometry(0.4, 0.03, 5, 14), LINE, { at: [0, 1.85, 3.15], dir: [0, 0, 1], axis: "z", scale: [1, 1.1, 1] });
  b.lathe([[0, 0.65], [0.12, 0.55], [0.25, 0.25], [0.3, 0], [0, 0]], { at: [0, NOSE_Y, 3.2], axis: [0, 0, 1], segments: 10, color: bp(LIGHT, "#9cc4f5", 11, 0.15) });
  for (let k = 0; k < 3; k++) {
    const a = (k * 120 + 20) * (Math.PI / 180);
    b.extrude(
      [[0.2, -0.06], [0.5, -0.16], [1.4, -0.2], [1.62, -0.08], [1.62, 0.1], [1.2, 0.18], [0.4, 0.1]],
      { at: [0, NOSE_Y, 3.3], x: [Math.cos(a), Math.sin(a), 0], y: [-Math.sin(a), Math.cos(a), 0], thickness: 0.035, bevel: 0.008, color: DARKP },
    );
    b.rod([Math.cos(a) * 1.4, NOSE_Y + Math.sin(a) * 1.4, 3.33], [Math.cos(a) * 1.62, NOSE_Y + Math.sin(a) * 1.62, 3.33], 0.04, LINE, { sides: 4 });
  }

  // Wings
  for (const s of [1, -1]) {
    b.extrude(plan(5.6, 2.3, 0.15), { at: [0, 1.28, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.17, bevel: 0.03, color: WINGP });
    // aileron line
    b.rod([s * 3.2, 1.37, -0.75], [s * 5.3, 1.37, -0.5], 0.012, LINE, { sides: 4 });
    // guns
    for (const gx of [2.5, 3.0]) b.rod([s * gx, 1.3, 1.0], [s * gx, 1.3, 1.75], gx > 2.7 ? 0.04 : 0.025, LINE, { sides: 6 });
    // radiator / oil cooler
    b.part(new THREE.BoxGeometry(0.42, 0.28, 0.75), DARKP, { at: [s * 1.95, 1.08, -0.2] });
    b.part(new THREE.BoxGeometry(0.36, 0.2, 0.05), LINE, { at: [s * 1.95, 1.08, 0.2] });
    // roundel on upper wing
    b.part(new THREE.PlaneGeometry(1.2, 1.2), "#ffffff", { at: [s * 3.4, 1.375, -0.1], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: roundel });
    b.part(new THREE.PlaneGeometry(1.2, 1.2), "#ffffff", { at: [s * 3.4, 1.185, -0.1], dir: [0, -1, 0], up: [0, 0, 1], axis: "z", texture: roundel });
    // Landing gear
    b.rod([s * 1.5, 1.3, 0.55], [s * 1.7, 0.36, 0.7], 0.05, MID, { sides: 6 });
    b.rod([s * 1.5, 1.2, 0.2], [s * 1.68, 0.5, 0.68], 0.025, LINE, { sides: 4 });
    b.part(new THREE.CylinderGeometry(0.33, 0.33, 0.15, 14), DARK, { at: [s * 1.7, 0.33, 0.7], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.17, 10), LINE, { at: [s * 1.7, 0.33, 0.7], dir: [1, 0, 0] });
    b.part(new THREE.BoxGeometry(0.03, 0.8, 0.5), MID, { at: [s * 1.45, 0.85, 0.65] });
    // Tailplane
    b.extrude(plan(1.75, 1.0, -4.45), { at: [0, 1.52, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.06, bevel: 0.01, color: WINGP });
    // Exhaust stacks
    for (let i = 0; i < 6; i++) {
      const z = 2.9 - i * 0.2;
      b.rod([s * 0.36, 1.96, z], [s * 0.52, 1.98, z], 0.035, DARK, { sides: 5 });
    }
  }
  // Wing root fairing and wing walkway lines
  b.part(new THREE.BoxGeometry(1.5, 0.12, 1.8), MID, { at: [0, 1.28, 0.1] });

  // Chin radiator scoop
  b.part(new THREE.BoxGeometry(0.46, 0.28, 0.6), DARKP, { at: [0, 1.35, 2.2] });
  b.part(new THREE.BoxGeometry(0.34, 0.18, 0.04), LINE, { at: [0, 1.35, 2.52] });

  // Fin and rudder
  b.extrude([[0, 0], [1.6, 0], [1.45, 1.4], [1.0, 1.55], [0.5, 0.7]], { at: [0, 1.52, -3.3], x: [0, 0, -1], thickness: 0.07, bevel: 0.015, color: WINGP });
  b.extrude([[1.5, 0.0], [2.05, 0.05], [1.98, 0.9], [1.5, 1.4]], { at: [0, 1.52, -3.3], x: [0, 0, -1], thickness: 0.05, bevel: 0.01, color: MID });
  b.part(new THREE.PlaneGeometry(0.5, 0.7), "#ffffff", { at: [0.04, 2.1, -4.95], dir: [1, 0, 0], up: [0, 1, 0], axis: "z", texture: finTex });
  b.part(new THREE.PlaneGeometry(0.5, 0.7), "#ffffff", { at: [-0.04, 2.1, -4.95], dir: [-1, 0, 0], up: [0, 1, 0], axis: "z", texture: finTex });

  // Canopy
  b.part(new THREE.SphereGeometry(1, 10, 8), GLASS, { at: [0, 2.1, -0.1], scale: [0.34, 0.33, 1.05] });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.55), LIGHT, { at: [0, 2.2, 1.0], rotation: [-38, 0, 0] });
  b.part(new THREE.BoxGeometry(0.62, 0.22, 1.3), MID, { at: [0, 1.95, -1.55], rotation: [8, 0, 0] });
  for (const dz of [-0.75, -0.25, 0.25, 0.7]) {
    const k = Math.sqrt(Math.max(1 - ((dz) / 1.05) ** 2, 0.01));
    const pts: [number, number, number][] = [];
    for (let a = -80; a <= 80; a += 20) {
      const r = (a * Math.PI) / 180;
      pts.push([0.35 * Math.sin(r) * k, 2.1 + 0.335 * Math.cos(r) * k, -0.1 + dz]);
    }
    glow(b.sweep(catmull(pts), 0.012, { color: LINE }), 0.9);
  }
  for (const s of [1, -1]) glow(b.rod([s * 0.26, 2.2, -0.9], [s * 0.26, 2.2, 0.6], 0.012, LINE, { sides: 4 }), 0.9);

  // Antenna mast and wire
  b.rod([0, 2.38, -0.9], [0, 2.7, -0.9], 0.015, LINE, { sides: 4 });
  b.rod([0, 2.7, -0.9], [0, 1.7, -4.9], 0.006, LINE, { sides: 3 });

  // Tail wheel
  b.rod([0, 1.45, -4.5], [0, 0.14, -4.95], 0.035, MID, { sides: 5 });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 10), DARK, { at: [0, 0.13, -4.95], dir: [1, 0, 0] });

  // Decals on the fuselage
  for (const s of [1, -1]) {
    b.decal(fus, roundel, { at: [s * 0.3, 1.58, -2.7], dir: [s, 0, 0], size: [0.5, 0.5], mirror: s < 0 });
    b.decal(fus, codeTex, { at: [s * 0.3, 1.62, -1.7], dir: [s, 0, 0], size: [0.6, 0.18], mirror: s < 0 });
  }
  // Annotations on wing (blueprint callouts)
  b.part(new THREE.PlaneGeometry(2.4, 0.8), "#ffffff", { at: [2.9, 1.378, 0.75], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: dimTex });
  b.part(new THREE.PlaneGeometry(1.3, 0.43), "#ffffff", { at: [-2.5, 1.378, 0.6], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: titleTex });

  return b.root;
}
