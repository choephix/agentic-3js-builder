```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "typewriter",
  description: "A teal portable typewriter with cream keys, a black platen, a sheet of paper and a return lever.",
};

const BODY = "#2f6b6e";
const PANEL = "#24282d";
const KEYS = "#f3eee0";
const ACCENT = "#c8412b";
const CHROME = "#c9ccd1";
const DARK = "#1d1f22";
const PLATEN = "#1e1e1e";

export default function build() {
  const b = createBuilder({ name: "typewriter" });

  // Skeleton: the frame, the carriage that carries the platen, and the return lever.
  const body = b.joint("body", { at: [0, 0, 0] });
  const carriage = b.joint("carriage", { parent: body, at: [0, 0.3, -0.11], role: "hinge" });
  const lever = b.joint("lever", { parent: body, at: [0.22, 0.13, -0.05], role: "hinge" });

  // Base: four feet and a silver base plate.
  for (const [x, z] of [
    [-0.19, -0.14],
    [0.19, -0.14],
    [-0.19, 0.11],
    [0.19, 0.11],
  ]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.03, 10), DARK, { bone: body, at: [x, 0.015, z] });
  }
  b.part(new THREE.BoxGeometry(0.44, 0.012, 0.34), CHROME, { bone: body, at: [0, 0.036, -0.02] });

  // Main case, a rear hump under the carriage, and the sloped key panel.
  b.part(new THREE.BoxGeometry(0.44, 0.08, 0.3), BODY, { bone: body, at: [0, 0.08, -0.02] });
  b.part(new THREE.BoxGeometry(0.42, 0.12, 0.14), BODY, { bone: body, at: [0, 0.12, -0.11] });

  const P: [number, number, number] = [0, 0.15, 0.06];
  const tilt = THREE.MathUtils.degToRad(12);
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  // A point on the panel: x across, h out of the surface, dz toward the operator.
  const onPanel = (x: number, h: number, dz: number): [number, number, number] => [
    x,
    P[1] + h * c - dz * s,
    P[2] + h * s + dz * c,
  ];

  b.part(new THREE.BoxGeometry(0.42, 0.02, 0.2), PANEL, { bone: body, at: P, rotation: [12, 0, 0] });

  // Keys: four staggered rows of ten, two in the accent colour.
  const rowsDz = [-0.06, -0.02, 0.02, 0.06];
  rowsDz.forEach((dz, r) => {
    for (let i = 0; i < 10; i++) {
      const x = (i - 4.5) * 0.033 + (r % 2) * 0.008;
      const accent = (r === 0 && i === 9) || (r === 3 && i === 0);
      b.part(new THREE.BoxGeometry(0.026, 0.016, 0.026), accent ? ACCENT : KEYS, {
        bone: body,
        at: onPanel(x, 0.022, dz),
        rotation: [12, 0, 0],
      });
    }
  });

  // Label plate on the front of the case.
  const label = svg(
    `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="40" rx="4" fill="#e8dcc0"/>
      <text x="80" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#2b2b2b">TYPEWRITER</text>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.16, 0.04), "#ffffff", {
    bone: body,
    at: [0, 0.08, 0.1315],
    dir: [0, 0, 1],
    axis: "z",
    texture: label,
  });

  // Typebasket: thin bars fanning from under the keys up to the platen.
  const bars = 13;
  for (let i = 0; i < bars; i++) {
    const t = i / (bars - 1) - 0.5;
    const pivot: [number, number, number] = [t * 0.3, 0.12, 0.04];
    const strike: [number, number, number] = [t * 0.26, 0.305, -0.068];
    b.rod(pivot, strike, 0.0035, { color: CHROME, bone: body });
  }

  // Carriage: two uprights, the black platen, its end knobs, and a sheet of paper.
  for (const x of [-0.2, 0.2]) {
    b.part(new THREE.BoxGeometry(0.025, 0.12, 0.06), CHROME, { bone: carriage, at: [x, 0.24, -0.11] });
  }
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 14), PLATEN, {
    bone: carriage,
    at: [0, 0.3, -0.11],
    dir: [1, 0, 0],
  });
  for (const x of [-0.245, 0.245]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 10), ACCENT, {
      bone: carriage,
      at: [x, 0.3, -0.11],
      dir: [1, 0, 0],
    });
  }

  const paper = svg(
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="#fbf9f1"/>
      <text x="10" y="16" font-family="serif" font-size="8" fill="#2b2b2b">Dear reader,</text>
      <text x="10" y="30" font-family="serif" font-size="7" fill="#444">I write this on a machine</text>
      <text x="10" y="40" font-family="serif" font-size="7" fill="#444">with cream keys and a bell.</text>
      <text x="10" y="54" font-family="serif" font-size="7" fill="#444">Every letter lands with</text>
      <text x="10" y="64" font-family="serif" font-size="7" fill="#444">a small decided thump.</text>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.3, 0.2), "#ffffff", {
    bone: carriage,
    at: [0, 0.4, -0.072],
    dir: [0, 0, 1],
    axis: "z",
    texture: paper,
  });

  // Return lever on the model's left side, hinged on the body.
  b.rod([0.22, 0.13, -0.05], [0.25, 0.24, -0.2], 0.008, { color: CHROME, bone: lever });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), ACCENT, { bone: lever, at: [0.25, 0.24, -0.2] });

  return b.root;
}
```