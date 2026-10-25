```ts
import * as THREE from "three";
import { createBuilder, patches, mottle, paint, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup truck converted to four ducted hover thrusters, low-poly cyberpunk.",
};

const CYAN = "#33f0ff";
const MAG = "#ff2fa8";
const DARK = "#14161c";
const STEEL = "#2a2e38";
const OLIVE = "#46563f";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  const camo = patches("#2b3329", ["#46563f", "#38452f", "#5a634a", "#2d3a30"], { size: 0.55, gap: 0.05, seed: 4 });
  const worn = paint((p, n, _s) => {
    const base = camo;
    return p.y < 0.75 && n.y < 0.3 ? "#1c1f1a" : base;
  });
  const armor = mottle("#2c313a", "#3b414d", { size: 0.3, seed: 2 });

  const box = (size: number[], color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, rotation: rot });

  // textures
  const emblem = svg(
    `<svg viewBox="0 0 128 64"><polygon points="20,4 44,4 54,32 44,60 20,60 10,32" fill="#10131a" stroke="#33f0ff" stroke-width="4"/>
     <text x="32" y="42" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#ff2fa8">7</text>
     <text x="92" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#33f0ff">HV-07</text>
     <rect x="64" y="40" width="56" height="5" fill="#ff2fa8"/><rect x="64" y="50" width="30" height="4" fill="#33f0ff"/></svg>`,
    { size: 256 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e8c21a"/>
     <path d="M-10 20 L20 -10 L34 -10 L-10 34Z M-10 52 L52 -10 L66 -10 L-10 66Z M30 74 L74 30 L74 44 L44 74Z M62 74 L74 62 L74 74Z" fill="#15151a"/></svg>`,
    { size: 128 },
  );
  const plate = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" rx="3" fill="#e9f3ff" stroke="#111" stroke-width="2"/>
     <text x="32" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#111">NX-4417</text></svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 64"><polygon points="32,6 60,56 4,56" fill="none" stroke="#ff2fa8" stroke-width="6"/><rect x="29" y="22" width="6" height="20" fill="#ff2fa8"/><rect x="29" y="46" width="6" height="6" fill="#ff2fa8"/></svg>`,
    { size: 128 },
  );

  // ---- body ----
  b.extrude(
    [[-2.6, 0.55], [2.7, 0.55], [2.78, 0.85], [2.4, 1.05], [1.35, 1.05], [-2.6, 1.05]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: worn },
  );
  // cab
  b.extrude(
    [[-0.6, 1.0], [1.4, 1.0], [1.4, 1.12], [0.72, 1.82], [-0.45, 1.82], [-0.6, 1.5]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, bevel: 0.04, color: worn },
  );
  // windshield & rear window
  glow(box([1.5, 0.02, 0.98], "#103a52", [0, 1.47, 1.05], [45, 0, 0]), 0.5);
  glow(box([1.4, 0.35, 0.02], "#103a52", [0, 1.55, -0.57]), 0.4);
  for (const s of [1, -1]) {
    glow(box([0.02, 0.4, 0.95], "#103a52", [s * 0.905, 1.5, 0.45]), 0.5);
    // door seam + handle
    box([0.015, 0.5, 0.02], DARK, [s * 0.905, 1.2, 0.0]);
    box([0.03, 0.04, 0.16], STEEL, [s * 0.91, 1.15, 0.15]);
    // side decals
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", { at: [s * 0.955, 0.8, 0.5], dir: [s, 0, 0], axis: "z", texture: emblem });
    // neon trim
    glow(box([0.03, 0.03, 4.9], s > 0 ? CYAN : MAG, [s * 0.955, 0.6, 0.05]), 1.2);
    // side mirrors
    box([0.2, 0.12, 0.05], STEEL, [s * 1.0, 1.55, 1.15]);
    box([0.14, 0.03, 0.03], DARK, [s * 0.93, 1.5, 1.15]);
    // bed walls
    box([0.1, 0.35, 2.05], worn, [s * 0.85, 1.225, -1.575]);
    glow(box([0.03, 0.03, 2.05], CYAN, [s * 0.85, 1.41, -1.575]), 1);
    // fender armor
    box([0.08, 0.2, 1.1], armor, [s * 0.96, 0.95, 2.0]);
    box([0.08, 0.2, 1.1], armor, [s * 0.96, 0.95, -1.7]);
  }
  box([1.8, 0.35, 0.1], worn, [0, 1.225, -2.55]);
  b.part(new THREE.PlaneGeometry(0.42, 0.16), "#ffffff", { at: [0, 1.12, -2.61], dir: [0, 0, -1], axis: "z", texture: plate });
  box([1.6, 0.02, 2.0], DARK, [0, 1.06, -1.55]);

  // hood armor + intake
  box([1.5, 0.07, 1.1], armor, [0, 1.08, 1.9]);
  box([0.5, 0.05, 0.5], DARK, [0, 1.13, 1.6]);
  b.part(new THREE.BoxGeometry(0.5, 0.012, 0.5), "#ffffff", { at: [0, 1.15, 2.1], texture: hazard });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { at: [0, 1.125, 1.62], dir: [0, 1, 0], axis: "z", texture: warn });
  // grille & bumper
  box([1.7, 0.3, 0.1], DARK, [0, 0.8, 2.78]);
  for (let i = -3; i <= 3; i++) box([0.03, 0.22, 0.04], STEEL, [i * 0.2, 0.8, 2.83]);
  box([1.9, 0.14, 0.2], armor, [0, 0.6, 2.75]);
  b.rod([-0.8, 0.5, 2.85], [-0.8, 1.1, 2.85], 0.04, STEEL);
  b.rod([0.8, 0.5, 2.85], [0.8, 1.1, 2.85], 0.04, STEEL);
  b.rod([-0.8, 1.1, 2.85], [0.8, 1.1, 2.85], 0.04, STEEL);
  b.rod([-0.8, 0.85, 2.88], [0.8, 0.85, 2.88], 0.03, STEEL);
  for (const s of [1, -1]) {
    glow(box([0.38, 0.12, 0.05], "#d8ffff", [s * 0.62, 0.92, 2.8]), 1.6);
    glow(box([0.3, 0.1, 0.05], "#ff1f4f", [s * 0.7, 0.95, -2.62]), 1.4);
  }
  glow(box([1.2, 0.04, 0.05], MAG, [0, 0.98, -2.62]), 1.4);

  // bed cargo
  b.part(new THREE.BoxGeometry(0.7, 0.45, 0.7), "#ffffff", { at: [-0.4, 1.3, -1.1], texture: hazard });
  box([0.7, 0.5, 0.5], "#3a4350", [0.35, 1.32, -1.9]);
  glow(box([0.5, 0.04, 0.02], CYAN, [0.35, 1.45, -1.64]), 1.2);
  // rocket pod
  box([0.5, 0.35, 0.7], STEEL, [0.4, 1.28, -0.95]);
  for (let i = 0; i < 6; i++) {
    const x = 0.27 + (i % 3) * 0.13;
    const y = 1.2 + Math.floor(i / 3) * 0.14;
    cyl(0.05, 0.05, 0.05, 6, MAG, [x, y, -0.58], [90, 0, 0]);
  }

  // roof gear
  glow(box([1.3, 0.07, 0.12], MAG, [0, 1.87, 0.6]), 1.5);
  box([1.3, 0.05, 0.9], STEEL, [0, 1.85, -0.05]);
  // turret
  cyl(0.28, 0.32, 0.1, 10, STEEL, [0, 1.93, 0.0]);
  box([0.5, 0.28, 0.5], armor, [0, 2.1, 0.0]);
  box([0.2, 0.18, 0.2], DARK, [0, 2.1, 0.28]);
  for (const s of [1, -1]) {
    cyl(0.04, 0.04, 0.9, 6, DARK, [s * 0.14, 2.1, 0.7], [90, 0, 0]);
    cyl(0.06, 0.06, 0.14, 6, STEEL, [s * 0.14, 2.1, 1.15], [90, 0, 0]);
    glow(cyl(0.025, 0.025, 0.02, 6, CYAN, [s * 0.14, 2.1, 1.23], [90, 0, 0]), 1.5);
  }
  glow(box([0.3, 0.05, 0.02], CYAN, [0, 2.15, 0.27]), 1.4);
  // antennas
  for (const [x, z, h] of [[-0.6, -0.35, 1.0], [0.6, -0.35, 0.7]]) {
    b.rod([x, 1.85, z], [x, 1.85 + h, z], 0.015, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), MAG, { at: [x, 1.87 + h, z] }), 2);
  }
  // sat dish
  b.lathe([[0, 0], [0.22, 0.1], [0.2, 0.11], [0, 0.03]], { at: [-0.5, 1.9, 0.25], axis: [0.3, 1, 0.3], color: STEEL });

  // ---- undercarriage, glow & skids ----
  glow(box([1.7, 0.04, 4.8], MAG, [0, 0.53, 0.0]), 1.4);
  box([1.5, 0.1, 4.6], DARK, [0, 0.5, 0.0]);
  for (const s of [1, -1]) {
    box([0.14, 0.1, 4.5], STEEL, [s * 0.55, 0.05, 0.0]);
    for (const z of [-1.4, 1.4]) box([0.12, 0.45, 0.2], STEEL, [s * 0.55, 0.3, z]);
    box([0.14, 0.1, 0.4], STEEL, [s * 0.55, 0.12, 2.3], [-30, 0, 0]);
  }

  // ---- hover pods ----
  const BLADE = 6;
  for (const s of [1, -1])
    for (const z of [1.75, -1.75]) {
      const x = s * 1.42;
      box([0.6, 0.14, 0.34], STEEL, [s * 1.15, 0.7, z]);
      box([0.12, 0.14, 0.6], armor, [s * 1.0, 0.62, z]);
      // duct
      b.lathe([[0.36, 0], [0.45, 0.04], [0.45, 0.36], [0.4, 0.4], [0.36, 0.36]], {
        at: [x, 0.26, z], axis: [0, 1, 0], segments: 8, color: armor,
      });
      // intake cover ring & hub
      glow(b.lathe([[0.37, 0], [0.4, 0], [0.4, 0.03], [0.37, 0.03]], { at: [x, 0.3, z], segments: 8, color: CYAN }), 1.6);
      glow(cyl(0.34, 0.34, 0.02, 8, "#1ad0ff", [x, 0.32, z]), 1.3);
      for (let i = 0; i < BLADE; i++)
        box([0.34, 0.012, 0.05], DARK, [x, 0.4, z], [0, i * (180 / BLADE), 0]);
      cyl(0.07, 0.07, 0.1, 8, STEEL, [x, 0.4, z]);
      // top cap & fins
      box([0.7, 0.05, 0.2], worn, [x, 0.68, z]);
      glow(box([0.05, 0.1, 0.4], MAG, [x + s * 0.3, 0.55, z]), 1.2);
    }

  // ---- rear thrusters ----
  for (const s of [1, -1]) {
    cyl(0.17, 0.2, 0.5, 8, STEEL, [s * 0.55, 0.95, -2.85], [90, 0, 0]);
    cyl(0.2, 0.2, 0.06, 8, DARK, [s * 0.55, 0.95, -3.12], [90, 0, 0]);
    glow(cyl(0.14, 0.14, 0.03, 8, "#6ffcff", [s * 0.55, 0.95, -3.15], [90, 0, 0]), 2);
    glow(b.spike([s * 0.55, 0.95, -3.17], [0, 0, -1], 0.5, 0.1, { color: "#2fd8ff" }), 1.5);
  }

  return b.root;
}
```