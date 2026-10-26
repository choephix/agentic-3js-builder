```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, svg, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A Final Fantasy style revolver gunblade standing tip-down: single-edged blade with fuller and runes, spine barrel, revolver chamber with brass rounds, gilt guard with a lion emblem, trigger and hammer, wrapped grip, glowing gems and a lion pendant on a chain.",
};

const GOLD_LO = "#a8741f";
const GOLD_HI = "#ffe28a";
const BRASS = "#d8a640";
const DARK = "#14161f";

export default function build() {
  const b = createBuilder({ name: "gunblade" });

  // ---------- paints ----------
  const gold = paint((p, n) =>
    mix(GOLD_LO, GOLD_HI, Math.min(1, smoothstep(-0.4, 1, n.y) * 0.75 + noise(p, 0.04, 3) * 0.3)),
  );
  const darkSteel = paint((p, n) =>
    mix("#2b3040", "#7a85a0", Math.min(1, smoothstep(-0.5, 1, n.y) * 0.6 + noise(p, 0.03, 5) * 0.4)),
  );
  const blade = paint((p, n, s) => {
    if (Math.abs(n.z) < 0.5) return "#f6fbff";
    const x = s[0];
    const y = s[1];
    let c = mix("#8e9bb4", "#e2ebf8", Math.min(1, smoothstep(-0.05, 0.065, x) * 0.8 + noise(p, 0.05, 1) * 0.25));
    if (x > 0.036) c = mix(c, "#ffffff", 0.65);
    if (x > -0.03 && x < 0.0 && y > 0.2 && y < 0.76) c = mix(c, "#4f5b75", 0.45);
    if (y < 0.05 + (x + 0.05) * 0.0) c = mix(c, "#ffffff", 0.3);
    return c;
  });
  const leather = paint((p) => {
    const a = Math.atan2(p.x, p.z);
    const w = (((p.y * 45 + a * 3.2) % 1) + 1) % 1;
    return w < 0.12 ? "#0a1230" : mix("#1e3a8a", "#2f56b8", noise(p, 0.02, 2));
  });

  // ---------- textures ----------
  let runes = "";
  for (let i = 0; i < 16; i++) {
    const y = 12 + i * 23;
    runes +=
      i % 3 === 0
        ? `<path d="M15 ${y} L5 ${y + 10} M15 ${y} L25 ${y + 10} M15 ${y} V${y + 16}" stroke="#2a3a6a" stroke-width="3" fill="none" stroke-linecap="round"/>`
        : i % 3 === 1
          ? `<path d="M6 ${y} H24 M15 ${y} V${y + 14} M6 ${y + 14} H24" stroke="#2a3a6a" stroke-width="3" fill="none" stroke-linecap="round"/>`
          : `<circle cx="15" cy="${y + 7}" r="6" stroke="#2a3a6a" stroke-width="3" fill="none"/><path d="M15 ${y + 1} V${y + 13}" stroke="#2a3a6a" stroke-width="3"/>`;
  }
  const RUNE = svg(`<svg viewBox="0 0 30 384">${runes}</svg>`, { size: 384 });

  let mane = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const a2 = a + Math.PI / 12;
    mane += `<path d="M${50 + Math.cos(a - 0.2) * 30} ${50 + Math.sin(a - 0.2) * 30} L${50 + Math.cos(a2) * 47} ${50 + Math.sin(a2) * 47} L${50 + Math.cos(a + 0.2) * 30} ${50 + Math.sin(a + 0.2) * 30}Z" fill="#7a4a10" stroke="#3a2008" stroke-width="2"/>`;
  }
  const LION = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#ffd978" stroke="#3a2008" stroke-width="4"/>${mane}
    <circle cx="50" cy="52" r="26" fill="#f2b84a" stroke="#3a2008" stroke-width="3"/>
    <path d="M32 30 L38 42 L28 42Z M68 30 L72 42 L62 42Z" fill="#f2b84a" stroke="#3a2008" stroke-width="2"/>
    <path d="M36 46 Q41 42 46 48 M64 46 Q59 42 54 48" stroke="#3a2008" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M50 50 V60 M42 66 Q50 72 58 66 M44 58 Q50 64 56 58" stroke="#3a2008" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M45 54 H55 L50 60Z" fill="#3a2008"/></svg>`,
    { size: 192 },
  );
  const WING = svg(
    `<svg viewBox="0 0 40 100"><path d="M20 98 Q2 70 8 40 Q12 14 20 2 Q28 14 32 40 Q38 70 20 98Z" fill="#fff3c8" stroke="#6a4a18" stroke-width="3"/>
     <path d="M20 90 V12 M20 70 Q10 56 11 40 M20 70 Q30 56 29 40" stroke="#6a4a18" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const gem = (x: number, y: number, z: number, r: number, color = "#4fc3ff") => {
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z] }), 1.6);
  };
  const decal = (tex: THREE.Texture, w: number, h: number, at: [number, number, number], back = false) => {
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir: [0, 0, back ? -1 : 1],
      axis: "z",
      texture: tex,
    });
  };

  // ---------- blade ----------
  const T = 0.014;
  b.extrude(
    [
      [-0.05, 0, "sharp"],
      [0.065, 0.2, "sharp"],
      [0.065, 0.82, "sharp"],
      [-0.05, 0.82, "sharp"],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: T, bevel: 0.003, color: blade, name: "blade" },
  );
  // spine bar
  b.part(new THREE.BoxGeometry(0.024, 0.72, 0.034), darkSteel, { at: [-0.05, 0.46, 0] });
  b.part(new THREE.ConeGeometry(0.0174, 0.04, 4), darkSteel, { at: [-0.05, 0.08, 0], rotation: [180, 45, 0] });
  // barrel along spine
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 8), "#3b4258", { at: [-0.066, 0.62, 0] });
  b.part(new THREE.TorusGeometry(0.015, 0.004, 4, 8), BRASS, { at: [-0.066, 0.37, 0], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.015, 0.004, 4, 8), BRASS, { at: [-0.066, 0.52, 0], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.03, 6), DARK, { at: [-0.066, 0.35, 0] }); // muzzle
  // front sight
  b.part(new THREE.BoxGeometry(0.006, 0.02, 0.01), "#cfd6e6", { at: [-0.066, 0.4, 0.014] });
  // engraved runes both faces
  decal(RUNE, 0.024, 0.3, [0.018, 0.52, T / 2 + 0.001]);
  decal(RUNE, 0.024, 0.3, [0.018, 0.52, -T / 2 - 0.001], true);
  // edge notch decoration: little brass studs on spine bar
  for (let i = 0; i < 5; i++) b.part(new THREE.SphereGeometry(0.006, 5, 4), BRASS, { at: [-0.05, 0.2 + i * 0.12, 0.017] });

  // ---------- guard ----------
  b.extrude(
    [
      [-0.085, 0.88],
      [0.115, 0.88],
      [0.13, 0.83],
      [0.07, 0.775],
      [-0.055, 0.775],
      [-0.1, 0.83],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.032, bevel: 0.006, smoothing: 0, color: gold, name: "guard" },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.07, -0.02],
        [0.09, 0.04],
        [0.03, 0.06],
      ],
      {
        at: [s > 0 ? 0.12 : -0.095, 0.845, 0],
        x: [s, 0, 0],
        thickness: 0.016,
        bevel: 0.003,
        color: gold,
        name: "guardWing",
      },
    );
  }
  b.part(new THREE.CircleGeometry(0.03, 14), "#ffffff", {
    at: [0.02, 0.83, 0.0175],
    dir: [0, 0, 1],
    axis: "z",
    texture: LION,
  });
  b.part(new THREE.CircleGeometry(0.03, 14), "#ffffff", {
    at: [0.02, 0.83, -0.0175],
    dir: [0, 0, -1],
    axis: "z",
    texture: LION,
  });
  gem(-0.06, 0.835, 0.018, 0.011);
  gem(0.1, 0.84, 0.018, 0.011);
  // feather ornaments
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.04, 0.1), "#ffffff", {
      at: [s > 0 ? 0.15 : -0.12, 0.88, 0.0],
      dir: [0, 0, 1],
      axis: "z",
      texture: WING,
      rotation: [0, 0, s * -20],
    });

  // ---------- chamber ----------
  const CY = 0.915;
  const CX = -0.02;
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.07, 12), darkSteel, { at: [CX, CY, 0], dir: [0, 0, 1], name: "cylinder" });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.008, 12), gold, { at: [CX, CY, s * 0.037], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), gold, { at: [CX, CY, s * 0.043], dir: [0, 0, 1] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const px = CX + Math.cos(a) * 0.036;
      const py = CY + Math.sin(a) * 0.036;
      b.part(new THREE.CylinderGeometry(0.0105, 0.0105, 0.006, 7), DARK, { at: [px, py, s * 0.042], dir: [0, 0, 1] });
      if (i % 2 === 0)
        b.part(new THREE.CylinderGeometry(0.0075, 0.0075, 0.008, 6), BRASS, { at: [px, py, s * 0.044], dir: [0, 0, 1] });
    }
  }
  // ferrule above chamber
  b.part(new THREE.BoxGeometry(0.085, 0.05, 0.05), gold, { at: [0, 0.975, 0] });
  b.part(new THREE.BoxGeometry(0.09, 0.008, 0.056), darkSteel, { at: [0, 0.998, 0] });

  // hammer
  b.extrude(
    [
      [0, 0],
      [0.02, 0],
      [0.014, 0.045],
      [-0.012, 0.055],
      [-0.024, 0.02],
    ],
    { at: [-0.1, 0.95, 0], x: [-1, 0, 0], thickness: 0.012, bevel: 0.002, color: darkSteel, name: "hammer" },
  );
  // trigger + guard loop
  b.part(new THREE.TorusGeometry(0.034, 0.005, 5, 12), gold, { at: [0.07, 0.945, 0], name: "triggerGuard" });
  b.extrude(
    [
      [0, 0],
      [0.012, 0],
      [0.004, -0.04],
      [-0.006, -0.04],
    ],
    { at: [0.062, 0.975, 0], x: [1, 0, 0], thickness: 0.008, color: "#b8c0d4", name: "trigger" },
  );

  // ---------- grip ----------
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.19, 8), leather, { at: [0, 1.095, 0], name: "grip" });
  for (const y of [1.003, 1.188]) b.part(new THREE.CylinderGeometry(0.029, 0.029, 0.012, 8), gold, { at: [0, y, 0] });
  b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.01, 8), BRASS, { at: [0, 1.095, 0] });
  // pommel
  b.lathe(
    [
      [0, 0],
      [0.032, 0],
      [0.038, 0.012],
      [0.032, 0.036],
      [0.014, 0.056],
      [0, 0.058],
    ],
    { at: [0, 1.194, 0], color: gold, segments: 8, name: "pommel" },
  );
  gem(0, 1.226, 0.026, 0.011, "#ff9a4f");
  gem(0, 1.226, -0.026, 0.011, "#ff9a4f");
  b.part(new THREE.TorusGeometry(0.012, 0.003, 4, 8), gold, { at: [0.04, 1.215, 0], rotation: [0, 90, 0] });

  // ---------- chain + lion pendant ----------
  const path = catmull(
    [
      [0.04, 1.215, 0.0],
      [0.1, 1.18, 0.03],
      [0.125, 1.08, 0.045],
      [0.12, 0.99, 0.045],
      [0.115, 0.95, 0.04],
    ],
  );
  b.along(path, 13, (at) => {
    const i = at.t * 13;
    b.part(new THREE.TorusGeometry(0.009, 0.0026, 4, 8), gold, {
      at,
      rotation: [0, Math.round(i) % 2 ? 90 : 0, 0],
      scale: [1, 1.4, 1],
    });
  });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 12), gold, { at: [0.113, 0.915, 0.04], dir: [0, 0, 1] });
  b.part(new THREE.CircleGeometry(0.026, 12), "#ffffff", {
    at: [0.113, 0.915, 0.0445],
    dir: [0, 0, 1],
    axis: "z",
    texture: LION,
  });
  b.part(new THREE.CircleGeometry(0.026, 12), "#ffffff", {
    at: [0.113, 0.915, 0.0355],
    dir: [0, 0, -1],
    axis: "z",
    texture: LION,
  });

  return b.root;
}
```