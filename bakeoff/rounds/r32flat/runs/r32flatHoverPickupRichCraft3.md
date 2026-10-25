```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { patches, mottle } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup truck converted to four ducted hover thrusters, low-poly cyberpunk.",
};

const OLIVE = "#4b5a3a";
const DKGREEN = "#2c3a2b";
const TAN = "#8a7a52";
const STEEL = "#2a2d36";
const BLACK = "#14151b";
const GLASS = "#38e8ff";
const MAGENTA = "#ff2fb4";
const CYAN = "#2ff0ff";
const WHITE = "#fff6e0";
const RED = "#ff2a3a";
const AMBER = "#ffb02a";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  const camo = patches(OLIVE, [DKGREEN, TAN, OLIVE], { size: 0.7, gap: 0.02, seed: 4 });
  const camoPanel = panelled(camo, { size: 0.35, aspect: 0.8, rivets: 0.06 });
  const IRON = metal("iron", { tarnish: 0.5 });
  const BLUED = metal("blued");
  const dirt = mottle(STEEL, "#3b3a38", { size: 0.3, seed: 2 });

  const box = (sz: [number, number, number], color: any, at: [number, number, number], o: any = {}) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), color, { at, ...o });
  const cyl = (r: number, h: number, seg: number, color: any, at: [number, number, number], dir: [number, number, number], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, ...o });

  // ---------- Textures ----------
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#14151b" stroke="#ff2fb4" stroke-width="5"/>
    <path d="M50 14 L60 42 L88 42 L66 59 L74 86 L50 70 L26 86 L34 59 L12 42 L40 42Z" fill="#2ff0ff"/>
    <circle cx="50" cy="50" r="9" fill="#14151b"/></svg>`,
    { size: 128 },
  );
  const CHEVRON = svg(
    `<svg viewBox="0 0 100 60"><rect width="100" height="60" fill="#14151b"/>
    <path d="M0 60 L20 0 L40 0 L20 60Z M40 60 L60 0 L80 0 L60 60Z M80 60 L100 0 L100 30 L90 60Z" fill="#ffb02a"/></svg>`,
    { size: 128 },
  );
  const FAN = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0a2a3a"/>
    <g fill="#2ff0ff"><path d="M50 50 L46 4 Q50 0 54 4Z"/><path d="M50 50 L96 46 Q100 50 96 54Z"/>
    <path d="M50 50 L54 96 Q50 100 46 96Z"/><path d="M50 50 L4 54 Q0 50 4 46Z"/></g>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#9ff8ff" stroke-width="3"/>
    <circle cx="50" cy="50" r="10" fill="#e8ffff"/></svg>`,
    { size: 192 },
  );

  // ---------- Chassis ----------
  box([1.8, 0.22, 5.0], IRON, [0, 0.75, 0]);
  box([1.7, 0.03, 4.2], MAGENTA, [0, 0.62, 0]);
  glow(b.part(new THREE.BoxGeometry(1.7, 0.03, 4.2), MAGENTA, { at: [0, 0.605, 0] }), 1.6);
  box([1.4, 0.2, 2.2], dirt, [0, 0.55, -0.2]); // battery/reactor pack

  // ---------- Body ----------
  b.extrude(
    [[-2.7, 0.65], [2.7, 0.65], [2.75, 1.05], [2.3, 1.28], [-0.6, 1.28], [-0.6, 1.1], [-2.7, 1.1]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, color: camoPanel },
  );
  // cab
  b.extrude([[-0.7, 1.28], [1.15, 1.28], [0.6, 1.95], [-0.45, 1.95], [-0.7, 1.85]], {
    at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, color: camo,
  });
  const glass = b.extrude([[-0.55, 1.5], [1.07, 1.5], [0.72, 1.88], [-0.4, 1.88]], {
    at: [0, 0, 0], x: [0, 0, 1], thickness: 1.86, color: GLASS,
  });
  glow(glass, 0.5);
  box([1.2, 0.05, 1.2], BLACK, [0, 1.97, 0.05]); // roof plate
  // pillar between side windows
  box([1.9, 0.4, 0.07], camo, [0, 1.7, 0.2]);
  // light bar
  box([1.5, 0.1, 0.12], BLACK, [0, 2.05, 0.4]);
  for (let i = 0; i < 5; i++) glow(box([0.26, 0.07, 0.13], i % 2 ? CYAN : MAGENTA, [-0.6 + i * 0.3, 2.05, 0.4]), 1.5);

  // hood details
  b.part(new THREE.PlaneGeometry(0.9, 0.5), "#ffffff", { at: [0, 1.285, 1.8], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: CHEVRON });
  box([0.5, 0.12, 0.5], BLACK, [0, 1.33, 1.1]); // intake
  glow(box([0.4, 0.02, 0.06], CYAN, [0, 1.395, 1.1]), 1.5);

  // front: grille, lights, bull bar
  box([1.2, 0.3, 0.06], BLACK, [0, 0.9, 2.74]);
  for (let i = 0; i < 4; i++) box([1.15, 0.025, 0.08], STEEL, [0, 0.8 + i * 0.07, 2.76]);
  for (const s of [1, -1]) {
    glow(box([0.38, 0.14, 0.08], WHITE, [s * 0.75, 1.0, 2.74]), 1.6);
    box([0.04, 0.5, 0.1], BLUED, [s * 0.55, 0.95, 2.9]);
    box([0.04, 0.5, 0.1], BLUED, [s * 0.9, 0.95, 2.9]);
    glow(box([0.05, 0.05, 0.3], AMBER, [s * 0.98, 1.2, 2.55]), 1.2);
  }
  box([2.1, 0.08, 0.1], BLUED, [0, 0.76, 2.92]);
  box([2.1, 0.08, 0.1], BLUED, [0, 1.15, 2.92]);
  box([0.1, 0.4, 0.1], BLUED, [0, 0.95, 2.92]);

  // rear
  box([2.0, 0.22, 0.1], camo, [0, 1.24, -2.72]); // tailgate
  box([1.9, 0.2, 0.06], BLACK, [0, 0.8, -2.73]);
  for (const s of [1, -1]) {
    glow(box([0.4, 0.12, 0.06], RED, [s * 0.75, 0.82, -2.77]), 1.5);
    cyl(0.17, 0.3, 8, STEEL, [s * 0.45, 0.9, -2.85], [0, 0, 1]);
    glow(cyl(0.12, 0.04, 8, MAGENTA, [s * 0.45, 0.9, -3.0], [0, 0, 1]), 1.8);
  }
  box([0.5, 0.18, 0.02], "#d6d0b8", [0, 1.0, -2.76]);

  // bed
  for (const s of [1, -1]) box([0.1, 0.38, 2.1, ] as any, camo, [s * 0.95, 1.29, -1.65]);
  box([1.8, 0.4, 0.1], camo, [0, 1.3, -0.75]);
  box([1.8, 0.04, 1.9], BLACK, [0, 1.12, -1.7]);
  // roll bar
  for (const s of [1, -1]) b.rod([s * 0.85, 1.28, -0.9], [s * 0.85, 2.1, -1.05], 0.04, BLUED);
  b.rod([0.85, 2.1, -1.05], [-0.85, 2.1, -1.05], 0.04, BLUED);
  // missile launcher
  const el = (40 * Math.PI) / 180;
  const d: [number, number, number] = [0, Math.sin(el), Math.cos(el)];
  const upv = [0, Math.cos(el), -Math.sin(el)];
  const c: [number, number, number] = [0, 1.75, -1.75];
  cyl(0.18, 0.5, 8, STEEL, [0, 1.35, -1.75], [0, 1, 0]);
  b.part(new THREE.BoxGeometry(1.2, 0.6, 1.0), IRON, { at: c, dir: d, axis: "z" });
  for (let ix = 0; ix < 3; ix++)
    for (let iy = 0; iy < 2; iy++) {
      const ox = (ix - 1) * 0.36;
      const oy = (iy - 0.5) * 0.3;
      const p: [number, number, number] = [c[0] + ox + 0, c[1] + upv[1] * oy, c[2] + upv[2] * oy];
      cyl(0.13, 1.06, 8, BLACK, p, d);
      const tip: [number, number, number] = [p[0], p[1] + d[1] * 0.54, p[2] + d[2] * 0.54];
      glow(cyl(0.08, 0.02, 8, RED, tip, d), 1.4);
    }

  // side details
  for (const s of [1, -1]) {
    box([0.06, 0.45, 1.5], camoPanel, [s * 1.03, 0.95, 0.4]);
    glow(box([0.03, 0.05, 4.4], MAGENTA, [s * 1.02, 0.78, -0.1]), 1.6);
    glow(box([0.03, 0.04, 1.4], CYAN, [s * 0.92, 1.15, -1.7]), 1.3);
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [s * 0.915, 1.58, 0.45], dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    box([0.04, 0.02, 0.6], BLACK, [s * 0.905, 1.35, 0.2]); // door seam
    box([0.06, 0.04, 0.16], BLUED, [s * 0.92, 1.4, 0.0]); // handle
    // mirror
    b.rod([s * 0.9, 1.65, 0.95], [s * 1.12, 1.7, 1.0], 0.02, BLACK);
    box([0.06, 0.2, 0.15], BLACK, [s * 1.14, 1.7, 1.0]);
    // fender armor plates over thruster pylons
    box([0.5, 0.06, 1.3], BLUED, [s * 1.2, 0.9, 1.7]);
    box([0.5, 0.06, 1.3], BLUED, [s * 1.2, 0.9, -1.8]);
  }
  // antenna
  b.rod([-0.8, 1.28, -0.9], [-0.9, 3.0, -1.2], [0.025, 0.008], BLACK);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [-0.9, 3.02, -1.2] }), 2);

  // ---------- Hover thrusters ----------
  const pods: [number, number][] = [[1.4, 1.7], [-1.4, 1.7], [1.4, -1.8], [-1.4, -1.8]];
  for (const [px, pz] of pods) {
    const s = Math.sign(px);
    b.lathe([[0.4, 0], [0.58, 0.05], [0.58, 0.5], [0.42, 0.55]], {
      at: [px, 0, pz], axis: [0, 1, 0], segments: 8, color: BLUED,
    });
    // top cap with intake
    cyl(0.45, 0.08, 8, STEEL, [px, 0.58, pz], [0, 1, 0]);
    glow(cyl(0.12, 0.03, 8, MAGENTA, [px, 0.63, pz], [0, 1, 0]), 1.4);
    // fan disk, glowing, facing down
    glow(
      b.part(new THREE.CircleGeometry(0.4, 12), "#ffffff", {
        at: [px, 0.12, pz], dir: [0, -1, 0], axis: "z", up: [0, 0, 1], texture: FAN,
      }),
      1.4,
    );
    // vanes
    box([0.8, 0.03, 0.05], BLACK, [px, 0.2, pz]);
    box([0.05, 0.03, 0.8], BLACK, [px, 0.2, pz]);
    // ring accent
    glow(b.lathe([[0.575, 0.28], [0.6, 0.28], [0.6, 0.33], [0.575, 0.33]], {
      at: [px, 0, pz], axis: [0, 1, 0], segments: 8, color: CYAN,
    }), 1.6);
    // struts to chassis
    b.rod([s * 0.9, 0.72, pz], [px - s * 0.5, 0.5, pz], 0.07, IRON);
    box([0.5, 0.1, 0.18], STEEL, [s * 1.05, 0.6, pz]);
  }

  return b.root;
}
```