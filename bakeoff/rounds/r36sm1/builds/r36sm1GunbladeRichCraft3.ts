import * as THREE from "three";
import { createBuilder, catmull, polyline, paint, mix, smoothstep, noise, stripes, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A Final Fantasy style revolver gunblade standing upright on its pommel: broad notched blade with glowing runes, a six-chamber cylinder, hammer, trigger guard and gilded fittings.",
};

const GOLD = "#d9a93c";
const GOLD_D = "#8a6420";
const DARK = "#2a2e3a";
const LEATHER = "#3b2a24";
const LEATHER_D = "#1f1512";
const CYAN = "#58e0ff";

export default function build() {
  const b = createBuilder({ name: "gunblade" });

  // ---------- paints ----------
  const bladePaint = paint((p, n) => {
    const t = smoothstep(0.45, 1.3, p.y);
    let c = mix("#9aa6ba", "#e6edf7", t * 0.7 + noise(p, 0.05, 3) * 0.3);
    if (p.x < -0.035) c = mix(c, "#4a5164", smoothstep(-0.035, -0.06, p.x));
    if (p.x > 0.055) c = mix(c, "#ffffff", smoothstep(0.055, 0.085, p.x) * 0.9);
    const sh = 0.85 + 0.15 * smoothstep(-0.5, 0.8, n.y);
    return [c[0] * sh, c[1] * sh, c[2] * sh];
  });
  const gripPaint = stripes(LEATHER, LEATHER_D, { size: 0.016, axis: "y", wobble: 0.1, width: 0.45 });
  const darkMetal = paint((p) => mix("#2a2e3a", "#4b5266", noise(p, 0.04, 8)));
  const goldPaint = paint((p, n) => {
    const c = mix(GOLD_D, "#ffe08a", smoothstep(-0.5, 1, n.y) * 0.6 + noise(p, 0.03, 5) * 0.4);
    return c;
  });

  // ---------- textures ----------
  const runes = svg(
    `<svg viewBox="0 0 60 400" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 6 L30 394" stroke="#1c2433" stroke-width="7"/>
      <path d="M30 6 L30 394" stroke="#58e0ff" stroke-width="2.6"/>
      ${Array.from({ length: 9 }, (_, i) => {
        const y = 40 + i * 40;
        return `<path d="M12 ${y} L30 ${y - 12} L48 ${y}" stroke="#1c2433" stroke-width="6" fill="none" stroke-linejoin="round"/>
        <path d="M12 ${y} L30 ${y - 12} L48 ${y}" stroke="#58e0ff" stroke-width="2" fill="none" stroke-linejoin="round"/>`;
      }).join("")}
    </svg>`,
    { size: 512 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8 L58 30 L50 52 L42 30Z" fill="#d9a93c" stroke="#3a2808" stroke-width="3"/>
      <path d="M44 28 Q26 10 4 16 Q18 26 12 40 Q30 36 44 36Z" fill="#f0d27a" stroke="#3a2808" stroke-width="3"/>
      <path d="M56 28 Q74 10 96 16 Q82 26 88 40 Q70 36 56 36Z" fill="#f0d27a" stroke="#3a2808" stroke-width="3"/>
      <circle cx="50" cy="30" r="4" fill="#58e0ff" stroke="#3a2808" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );
  const chambers = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#3a4052" stroke="#d9a93c" stroke-width="5"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#1a1d27" stroke-width="2"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        const x = 50 + Math.sin(a) * 26;
        const y = 50 - Math.cos(a) * 26;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="#0b0c12" stroke="#c9a04a" stroke-width="2.5"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#b87333"/>`;
      }).join("")}
      <circle cx="50" cy="50" r="8" fill="#d9a93c" stroke="#3a2808" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  // ---------- pommel & grip ----------
  b.lathe(
    [[0, 0], [0.03, 0], [0.045, 0.018], [0.05, 0.04], [0.036, 0.07], [0, 0.07]],
    { at: [0, 0, 0], color: goldPaint, segments: 8 },
  );
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), CYAN, { at: [0, 0.036, 0.046] }), 1.4);
  b.lathe(
    [[0, 0.07], [0.024, 0.07], [0.029, 0.12], [0.027, 0.19], [0.03, 0.26], [0.026, 0.31], [0, 0.31]],
    { at: [0, 0, 0], color: gripPaint, segments: 10 },
  );
  for (const y of [0.075, 0.18, 0.285]) {
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.012, 10), GOLD, { at: [0, y, 0] });
  }

  // ---------- guard ----------
  b.extrude(
    [[-0.12, 0.315], [-0.075, 0.285], [0.075, 0.285], [0.125, 0.325], [0.075, 0.345], [-0.075, 0.345]],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.05, bevel: 0.006, color: goldPaint },
  );

  // ---------- receiver, cylinder ----------
  b.part(new THREE.BoxGeometry(0.15, 0.15, 0.058), darkMetal, { at: [-0.015, 0.4, 0] });
  b.part(new THREE.BoxGeometry(0.17, 0.028, 0.066), goldPaint, { at: [-0.005, 0.49, 0] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.088, 12), "#444b5e", {
    at: [0.005, 0.405, 0],
    dir: [0, 0, 1],
    flat: true,
  });
  b.part(new THREE.CircleGeometry(0.058, 20), "#ffffff", {
    at: [0.005, 0.405, 0.0455],
    dir: [0, 0, 1],
    axis: "z",
    texture: chambers,
  });
  b.part(new THREE.CircleGeometry(0.058, 20), "#ffffff", {
    at: [0.005, 0.405, -0.0455],
    dir: [0, 0, -1],
    axis: "z",
    texture: chambers,
  });

  // ---------- trigger guard, trigger, hammer ----------
  b.sweep(
    catmull([[-0.05, 0.325, 0], [-0.11, 0.3, 0], [-0.118, 0.24, 0], [-0.075, 0.2, 0], [-0.03, 0.208, 0]]),
    0.007,
    { color: GOLD, sides: 6 },
  );
  b.rod([-0.058, 0.33, 0], [-0.08, 0.255, 0], [0.011, 0.004], { color: "#c0c8d6", sides: 6 });
  b.extrude([[0, 0], [0.035, 0], [0.028, 0.05], [-0.03, 0.075], [-0.05, 0.035]], {
    at: [-0.11, 0.455, 0],
    x: [1, 0, 0],
    thickness: 0.022,
    bevel: 0.003,
    color: darkMetal,
  });

  // ---------- blade ----------
  b.extrude(
    [
      [-0.06, 0.46],
      [0.09, 0.46],
      [0.09, 0.6],
      [0.06, 0.645],
      [0.085, 0.7],
      [0.085, 1.05],
      [0.01, 1.32, "sharp"],
      [-0.06, 1.2],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: [0.022, 0.014], bevel: 0.003, color: bladePaint },
  );
  // spine barrel
  b.rod([-0.068, 0.5, 0], [-0.068, 1.16, 0], 0.012, { color: DARK, sides: 6 });
  b.along(polyline([[-0.068, 0.55, 0.0], [-0.068, 1.1, 0.0]]), 6, (at) =>
    b.part(new THREE.BoxGeometry(0.03, 0.014, 0.032), GOLD, { at }),
  );
  b.part(new THREE.SphereGeometry(0.012, 6, 4), "#111", { at: [-0.068, 1.17, 0] });

  // blade engravings
  for (const s of [1, -1]) {
    const g = glow(
      b.part(new THREE.PlaneGeometry(0.1, 0.43), "#ffffff", {
        at: [0.015, 0.84, s * 0.0116],
        dir: [0, 0, s],
        axis: "z",
        texture: runes,
      }),
      0.8,
    );
    void g;
    b.part(new THREE.PlaneGeometry(0.07, 0.042), "#ffffff", {
      at: [0.015, 0.565, s * 0.0116],
      dir: [0, 0, s],
      axis: "z",
      texture: emblem,
    });
  }

  return b.root;
}
