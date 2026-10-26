```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, noise, mix, smoothstep, svg, rng, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Spitfire Blueprint",
  description: "Supermarine Spitfire fighter rendered as a cyanotype blueprint with white linework.",
};

const DEEP = "#0b2f6b";
const MID = "#1b55a8";
const LIGHT = "#3f82d0";
const LINE = "#e8f3ff";
const DARKL = "#071d45";
const PALE = "#9cc8f2";

export default function build() {
  const b = createBuilder({ name: "spitfire" });
  const R = rng(5);

  const hull = paint((p, n) => {
    const g = noise(p, 0.5, 3);
    let c = mix(mix(MID, LIGHT, 0.5 * g + 0.5 * smoothstep(-0.3, 1, n.y)), DEEP, smoothstep(0, -0.9, n.y) * 0.6);
    // panel lines
    const k = Math.abs(((p.z * 6) % 1) - 0.5);
    if (k > 0.485) c = mix(c, LINE, 0.7);
    return c;
  });
  const wingPaint = paint((p, n) => {
    let c = mix(MID, LIGHT, smoothstep(-0.5, 1, n.y) * 0.8 + noise(p, 0.4, 7) * 0.2);
    const k = Math.abs(((p.x * 5) % 1) - 0.5);
    if (k > 0.48) c = mix(c, LINE, 0.8);
    return c;
  });

  // skeleton
  const root = b.joint("fuselage", { at: [0, 1.2, 0], role: "spine" });
  const prop = b.joint("propeller", { parent: root, at: [0, 1.2, 3.35], dir: [0, 0, 1] });
  const rudder = b.joint("rudder", { parent: root, at: [0, 1.4, -4.1], dir: [0, 1, 0], role: "hinge" });
  const aileronL = b.joint("aileronL", { parent: root, at: [2.5, 1.12, -0.1], dir: [1, 0, 0], role: "hinge" });
  const aileronR = b.joint("aileronR", { parent: root, at: [-2.5, 1.12, -0.1], dir: [-1, 0, 0], role: "hinge" });
  const gearL = b.joint("gearL", { parent: root, at: [1.45, 1.0, 0.6], dir: [0, -1, 0], role: "leg" });
  const gearR = b.joint("gearR", { parent: root, at: [-1.45, 1.0, 0.6], dir: [0, -1, 0], role: "leg" });

  // fuselage loft
  const fus = b.loft(
    [
      { at: [0, 1.25, 3.0], w: 0.35, h: 0.4 },
      { at: [0, 1.25, 2.4], w: 0.7, h: 0.8 },
      { at: [0, 1.25, 1.2], w: 0.82, h: 0.95 },
      { at: [0, 1.25, 0], w: 0.78, h: 0.95 },
      { at: [0, 1.28, -1.5], w: 0.55, h: 0.7 },
      { at: [0, 1.34, -3.0], w: 0.28, h: 0.4 },
      { at: [0, 1.4, -4.0], w: 0.1, h: 0.2 },
    ],
    { color: hull, bone: root, sides: 8, name: "fuselage" },
  );

  // spinner
  b.part(new THREE.ConeGeometry(0.2, 0.55, 10), PALE, { bone: prop, at: [0, 1.25, 3.3], dir: [0, 0, 1] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.16, 1.5, 0.03), LINE, {
      bone: prop,
      at: [Math.sin(a) * 0.8, 1.25 + Math.cos(a) * 0.8, 3.1],
      rotation: [0, 0, -(a * 180) / Math.PI],
    });
  }

  // exhaust stacks
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 6), LINE, {
        bone: root,
        at: [s * 0.4, 1.35, 1.7 + i * 0.22],
        dir: [s, 0.2, 0],
      });

  // canopy
  b.part(new THREE.SphereGeometry(0.4, 10, 8), PALE, {
    bone: root,
    at: [0, 1.82, 0.4],
    scale: [0.8, 0.7, 2.0],
  });
  for (let i = 0; i < 3; i++)
    b.part(new THREE.BoxGeometry(0.62, 0.02, 0.02), LINE, { bone: root, at: [0, 1.95 - i * 0.02, -0.1 + i * 0.4], scale: [1, 1, 1] });

  // wings (elliptical outline)
  const wingOutline: [number, number][] = [
    [0, 0.0],
    [1.0, 0.0],
    [2.0, -0.1],
    [3.0, -0.35],
    [3.9, -0.7],
    [4.1, -0.85],
    [3.9, -1.05],
    [3.0, -1.0],
    [1.8, -1.0],
    [0.4, -1.2],
    [0, -1.2],
  ].map(([x, z]) => [x, -z] as [number, number]).reverse().map(([x, z]) => [x, z]);
  for (const s of [1, -1]) {
    const pts: [number, number][] = [
      [0, 1.0],
      [1.2, 0.95],
      [2.4, 0.6],
      [3.4, 0.2],
      [3.9, -0.15],
      [3.7, -0.45],
      [2.6, -0.5],
      [1.4, -0.85],
      [0, -0.9],
    ];
    const wing = b.extrude(pts, {
      at: [0, 1.1, 0],
      x: [s, 0, 0],
      y: [0, 0.0, 1],
      thickness: [0.14, 0.05],
      bevel: 0.02,
      smoothing: 1,
      color: wingPaint,
      bone: root,
    });
    // dihedral-ish: wing is flat; add cannons & roundels
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), LINE, { bone: root, at: [s * 1.5, 1.1, 1.1], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), LINE, { bone: root, at: [s * 1.9, 1.1, 0.95], dir: [0, 0, 1] });
    // aileron
    b.part(new THREE.BoxGeometry(1.3, 0.04, 0.3), LINE, {
      bone: s > 0 ? aileronL : aileronR,
      at: [s * 3.2, 1.12, -0.35],
    });
    // roundel on wing
    const ring = svg(
      `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#e8f3ff" stroke-width="4"/><circle cx="32" cy="32" r="18" fill="none" stroke="#e8f3ff" stroke-width="3"/><circle cx="32" cy="32" r="7" fill="#e8f3ff"/></svg>`,
      { size: 128 },
    );
    b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", {
      bone: root,
      at: [s * 2.5, 1.19, 0.2],
      dir: [0, 1, 0],
      axis: "z",
      texture: ring,
    });
    // landing gear
    const g = s > 0 ? gearL : gearR;
    b.rod([s * 1.45, 1.05, 0.6], [s * 1.45, 0.3, 0.6], 0.05, LINE, { bone: g });
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12), DARKL, { bone: g, at: [s * 1.45, 0.28, 0.6], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 8), LINE, { bone: g, at: [s * 1.45, 0.28, 0.6], dir: [1, 0, 0] });
    // tailplane
    b.extrude(
      [
        [0, 0.3],
        [0.9, 0.15],
        [1.4, -0.1],
        [1.2, -0.35],
        [0, -0.45],
      ],
      { at: [0, 1.38, -3.6], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.06, color: wingPaint, bone: root },
    );
  }

  // fin and rudder
  b.extrude(
    [
      [0, 0],
      [0.9, 0],
      [0.45, 0.9],
      [0.1, 0.95],
    ],
    { at: [0, 1.4, -3.9], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, color: wingPaint, bone: root },
  );
  b.extrude(
    [
      [0, 0],
      [0.45, 0],
      [0.3, 0.9],
      [0, 0.85],
    ],
    { at: [0, 1.4, -4.4], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, color: LINE, bone: rudder },
  );
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 8), LINE, { bone: root, at: [0, 1.0, -3.4], dir: [1, 0, 0] });

  // radiators under wings
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.4, 0.28, 0.5), DEEP, { bone: root, at: [s * 1.9, 0.92, 0.4] });

  // blueprint dimension cards: drawn grid lines + labels beside the model
  const sheet = svg(
    `<svg viewBox="0 0 200 60"><path d="M5 30H195M5 20V40M195 20V40" stroke="#e8f3ff" stroke-width="3" fill="none"/><text x="100" y="22" text-anchor="middle" font-family="monospace" font-size="16" fill="#e8f3ff">11.23 m</text></svg>`,
    { size: 512 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(2.4, 0.72), "#ffffff", { bone: root, at: [0, 1.2, 3.9], dir: [0, 0, 1], axis: "z", texture: sheet }),
    0.6,
  );

  // floor sink: wheels reach y≈0
  return b.root;
}
```