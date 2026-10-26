```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, grain, catmull, polyline, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gunblade",
  description: "A Final Fantasy style revolver gunblade: steel blade with a gun spine, rune fuller, revolver chamber, gilt crossguard wing and a lion pendant on a chain.",
};

// ---------- palette ----------
const GILT = metal("gilt");
const GOLD_DARK = "#8a6420";
const STEEL_DARK = "#3a4150";
const GUN = "#262b36";
const LEATHER = grain("#3b2a22", "#21160f", { size: 0.02, axis: "y" });
const CLOTH = "#2a5fc0";
const CLOTH_DARK = "#1b3c86";
const CYAN = "#7fe9ff";

const BLADE = paint((_p, n, s) => {
  const base = mix("#aeb9ca", "#e8eef8", smoothstep(0.1, 0.9, noise(_p, 0.12, 4)));
  const edge = smoothstep(0.066, 0.074, s[0]);
  const grad = smoothstep(0.5, 1.3, s[1]) * 0.25;
  let c = mix(base, "#f6fbff", edge);
  c = mix(c, "#6f7f9c", grad * (1 - edge));
  if (Math.abs(s[0] - 0.07) < 0.002) c = mix(c, "#59647c", 0.7);
  const shade = 0.88 + 0.12 * n.y;
  return [c[0] * shade, c[1] * shade, c[2] * shade];
});

// ---------- textures ----------
function runeSvg() {
  let g = "";
  for (let i = 0; i < 9; i++) {
    const y = 6 + i * 10.5;
    const k = i % 3;
    g += `<g stroke="${CYAN}" stroke-width="1.8" stroke-linecap="round" fill="none">`;
    if (k === 0) g += `<path d="M5 ${y} L10 ${y + 7} L15 ${y} M10 ${y + 7} V${y - 3}"/>`;
    if (k === 1) g += `<path d="M5 ${y + 7} V${y} L15 ${y + 7} V${y}"/><circle cx="10" cy="${y + 3}" r="1.2"/>`;
    if (k === 2) g += `<path d="M5 ${y} H15 M10 ${y} V${y + 8} M6 ${y + 8} H14"/>`;
    g += `</g>`;
  }
  return svg(`<svg viewBox="0 0 20 100" xmlns="http://www.w3.org/2000/svg">${g}</svg>`, { size: 256 });
}
function lionSvg() {
  let mane = "";
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = i % 2 ? 36 : 48;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  mane = `<polygon points="${pts.join(" ")}" fill="#c9962f" stroke="#4a2f0a" stroke-width="3" stroke-linejoin="round"/>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${mane}
    <circle cx="50" cy="52" r="25" fill="#f2d27a" stroke="#4a2f0a" stroke-width="3"/>
    <circle cx="41" cy="46" r="3.4" fill="#2a1a08"/><circle cx="59" cy="46" r="3.4" fill="#2a1a08"/>
    <path d="M44 56 L56 56 L50 64 Z" fill="#4a2f0a"/>
    <path d="M50 64 V70 M42 72 Q50 78 58 72" stroke="#4a2f0a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M36 36 L42 30 M64 36 L58 30" stroke="#4a2f0a" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    { size: 192 },
  );
}
function chamberSvg() {
  let holes = "";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = 50 + 30 * Math.sin(a);
    const y = 50 - 30 * Math.cos(a);
    holes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="#0a0c10" stroke="#d9ae4a" stroke-width="2.4"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#b87333"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#3a4150" stroke="#e0b550" stroke-width="3"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#1b1f29" stroke-width="1.5" stroke-dasharray="3 3"/>
    ${holes}<circle cx="50" cy="50" r="9" fill="#d9ae4a" stroke="#6a4a12" stroke-width="2"/></svg>`,
    { size: 192 },
  );
}
const RUNE = runeSvg();
const LION = lionSvg();
const CHAMBER = chamberSvg();

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], zdir: number) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir: [0, 0, zdir], axis: "z", texture: tex });

  // ---------- pommel & grip ----------
  b.lathe(
    [[0, 0], [0.03, 0], [0.042, 0.02], [0.046, 0.045], [0.034, 0.07], [0, 0.07]],
    { at: [0, 0, 0], segments: 8, color: GILT },
  );
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 8), GOLD_DARK, { at: [0, 0.045, 0] });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.29, 8), LEATHER, { at: [0, 0.215, 0] });
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.CylinderGeometry(0.0245, 0.0245, 0.007, 8), i % 2 ? CLOTH_DARK : CLOTH, {
      at: [0, 0.1 + i * 0.045, 0],
    });
  }
  // ferrule
  b.part(new THREE.CylinderGeometry(0.032, 0.038, 0.045, 6), GILT, { at: [0, 0.3825, 0] });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 6), GOLD_DARK, { at: [0, 0.36, 0] });

  // ---------- trigger guard ----------
  const guard = catmull(
    [[0.03, 0.352, 0], [0.085, 0.345, 0], [0.105, 0.29, 0], [0.085, 0.235, 0], [0.04, 0.225, 0], [0.026, 0.26, 0]],
    { closed: true },
  );
  b.sweep(guard, 0.0065, { color: GILT, sides: 6 });
  b.extrude([[0, 0], [0.014, 0], [0.011, -0.035], [0.0, -0.05]], {
    at: [0.04, 0.345, 0], x: [1, 0, 0], thickness: 0.008, color: GOLD_DARK,
  });

  // ---------- revolver chamber ----------
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.062, 12), STEEL_DARK, { at: [0, 0.445, 0], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.054, 0.054, 0.012, 12), GILT, { at: [0, 0.445, 0], dir: [0, 0, 1] });
  for (const z of [1, -1]) {
    plane(0.098, 0.098, CHAMBER, [0, 0.445, z * 0.0325], z);
    glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), "#5cc8ff", { at: [0, 0.445, z * 0.036] }), 1.6);
  }
  // hammer
  b.extrude([[0, 0], [0.03, 0], [0.026, 0.03], [0.01, 0.046], [-0.016, 0.04]], {
    at: [-0.085, 0.47, 0], x: [1, 0, 0], thickness: 0.014, color: GUN,
  });
  box(0.03, 0.02, 0.03, GOLD_DARK, [-0.06, 0.47, 0]);

  // ---------- crossguard wing ----------
  b.extrude(
    [[-0.055, 0.4], [0.07, 0.4], [0.15, 0.41], [0.21, 0.45], [0.2, 0.505], [0.12, 0.48], [-0.055, 0.47]],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.026, bevel: 0.004, color: GILT },
  );
  // feather ridges on the wing
  for (const z of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.extrude([[0, 0], [0.05 - i * 0.004, 0.012], [0.05 - i * 0.004, 0.026], [0, 0.014]], {
        at: [0.08 + i * 0.03, 0.4 + i * 0.012, z * 0.0125], x: [1, 0, 0], thickness: 0.003, color: GOLD_DARK,
      });
    }
  }

  // ---------- blade ----------
  b.extrude(
    [[-0.035, 0.47], [0.09, 0.47], [0.09, 1.08], [0.02, 1.26], [-0.035, 1.34]],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.014, color: BLADE },
  );
  // fuller
  b.extrude([[0.0, 0.6], [0.04, 0.6], [0.04, 1.0], [0.02, 1.16], [0.0, 1.0]], {
    at: [0, 0, 0], x: [1, 0, 0], thickness: 0.0165, color: "#2f3a52",
  });
  for (const z of [1, -1]) {
    glow(plane(0.032, 0.36, RUNE, [0.02, 0.8, z * 0.0092], z), 1.3);
    plane(0.07, 0.07, LION, [0.03, 0.535, z * 0.0078], z);
  }

  // ---------- spine gun barrel ----------
  box(0.045, 0.74, 0.032, GUN, [-0.0575, 0.86, 0]);
  box(0.03, 0.2, 0.026, STEEL_DARK, [-0.0575, 1.22, 0]);
  box(0.034, 0.012, 0.036, GILT, [-0.0575, 1.12, 0]);
  for (let i = 0; i < 5; i++) {
    const y = 0.56 + i * 0.13;
    box(0.05, 0.016, 0.037, i % 2 ? GOLD_DARK : GILT, [-0.0575, y, 0]);
    for (const z of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.005, 5, 4), "#f1d27a", { at: [-0.0575, y, z * 0.019] });
      box(0.016, 0.04, 0.002, "#10131a", [-0.0575, y + 0.055, z * 0.0165]);
    }
  }
  // muzzle and sight
  b.part(new THREE.CylinderGeometry(0.015, 0.017, 0.03, 8), "#0d0f14", { at: [-0.0575, 1.325, 0] });
  box(0.012, 0.024, 0.012, GILT, [-0.055, 1.275, 0]);
  // edge notch accent
  for (const z of [1, -1]) {
    b.extrude([[0, 0], [0.012, 0.01], [0, 0.02]], { at: [0.09, 0.485, z * 0.004], x: [1, 0, 0], thickness: 0.004, color: GOLD_DARK });
  }

  // ---------- chain & lion pendant ----------
  const chain = polyline([[0.2, 0.455, 0], [0.2, 0.245, 0]]);
  const linkA = new THREE.TorusGeometry(0.008, 0.0022, 5, 8);
  const linkB = linkA.clone().rotateY(Math.PI / 2);
  let k = 0;
  b.along(chain, 7, (at) => {
    b.part(k++ % 2 ? linkB : linkA, GILT, { at: at.at, dir: [0, 1, 0] });
  });
  b.part(new THREE.TorusGeometry(0.024, 0.0045, 5, 10), GILT, { at: [0.2, 0.215, 0] });
  for (const z of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.0225, 12), "#ffffff", {
      at: [0.2, 0.215, z * 0.0025], dir: [0, 0, z], axis: "z", texture: LION,
    });
  }
  // blue ribbon tails off the guard wing
  for (const [x, len] of [[0.17, 0.12], [0.145, 0.09]] as const) {
    b.extrude([[0, 0], [0.012, 0], [0.012, -len], [0.006, -len + 0.015], [0, -len]], {
      at: [x, 0.405, 0], x: [1, 0, 0], thickness: 0.003, color: x > 0.16 ? CLOTH : CLOTH_DARK,
    });
  }

  return b.root;
}
```