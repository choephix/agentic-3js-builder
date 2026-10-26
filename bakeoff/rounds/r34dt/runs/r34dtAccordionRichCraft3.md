```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Piano Accordion",
  description:
    "Italian mother-of-pearl piano accordion with a pearl-clad treble and bass case, gold trim, red pleated bellows, piano keys, pearl bass buttons and a shoulder strap.",
};

const GOLD = "#d9a93a";
const GOLD_D = "#a97c1e";
const RED = "#8e1325";
const RED_D = "#5d0a17";
const EBONY = "#1e1216";
const IVORY = "#fbf7ea";
const LEATHER = "#5a2f1a";

// Mother-of-pearl: warm white drifting through pink, aqua and lilac sheen.
const pearl = paint((p, n) => {
  let c = mix("#fbf6ec", "#f4d6e4", smoothstep(0.35, 0.7, noise(p, 0.06, 3)));
  c = mix(c, "#cdeee6", smoothstep(0.5, 0.8, noise(p, 0.03, 11)) * 0.7);
  c = mix(c, "#d8d0f4", smoothstep(0.6, 0.9, noise(p, 0.09, 5)) * 0.6);
  const l = 0.88 + 0.12 * Math.max(n.y, 0) + 0.04;
  return [Math.min(c[0] * l, 1), Math.min(c[1] * l, 1), Math.min(c[2] * l, 1)];
});

const EMBLEM = svg(
  `<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="98" height="198" rx="10" fill="#f8efe4" stroke="#a97c1e" stroke-width="3"/>
  <rect x="7" y="7" width="86" height="186" rx="7" fill="none" stroke="#d9a93a" stroke-width="1.5"/>
  <g fill="none" stroke="#e7a9c4" stroke-width="3" stroke-linecap="round">
    <path d="M15 40 C15 15 45 15 45 35 C45 48 30 48 30 38"/>
    <path d="M85 40 C85 15 55 15 55 35 C55 48 70 48 70 38"/>
    <path d="M15 160 C15 185 45 185 45 165 C45 152 30 152 30 162"/>
    <path d="M85 160 C85 185 55 185 55 165 C55 152 70 152 70 162"/>
  </g>
  <g fill="none" stroke="#7cc9c0" stroke-width="2"><path d="M20 70 Q50 55 80 70"/><path d="M20 130 Q50 145 80 130"/></g>
  <circle cx="50" cy="100" r="32" fill="#fff9ee" stroke="#d9a93a" stroke-width="3"/>
  <circle cx="50" cy="100" r="26" fill="none" stroke="#a97c1e" stroke-width="1.2"/>
  <g fill="#d9a93a">
    ${Array.from({ length: 12 }, (_, i) => `<ellipse cx="50" cy="${100 - 29}" rx="2.4" ry="4" transform="rotate(${i * 30} 50 100)"/>`).join("")}
  </g>
  <g fill="#2a1a10"><ellipse cx="42" cy="108" rx="6" ry="4.4"/><rect x="46.8" y="82" width="2.4" height="26"/><path d="M49 82 q12 4 8 18 q2 -10 -8 -12z"/></g>
  <g fill="#d9a93a"><circle cx="50" cy="40" r="3"/><circle cx="50" cy="160" r="3"/></g>
  </svg>`,
  { size: 256 },
);

const FRONT = svg(
  `<svg viewBox="0 0 40 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="40" height="200" fill="#1e1216"/>
  <rect x="3" y="3" width="34" height="194" fill="none" stroke="#d9a93a" stroke-width="1.6"/>
  <text x="0" y="0" transform="translate(27 100) rotate(-90)" text-anchor="middle" font-family="serif" font-style="italic" font-weight="bold" font-size="20" fill="#e8bb4a">Madreperla</text>
  <g fill="#d9a93a"><circle cx="20" cy="16" r="4"/><circle cx="20" cy="184" r="4"/></g>
  <path d="M10 30 Q20 22 30 30 M10 170 Q20 178 30 170" stroke="#e7a9c4" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 256 },
);

const GRILLE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#1d1410"/>
  <rect x="3" y="3" width="94" height="94" fill="none" stroke="#d9a93a" stroke-width="3"/>
  ${Array.from({ length: 9 }, (_, i) => `<rect x="12" y="${12 + i * 9}" width="76" height="3.6" rx="1.8" fill="#caa14a"/>`).join("")}
  <circle cx="50" cy="50" r="13" fill="#1d1410" stroke="#e7a9c4" stroke-width="2"/>
  <path d="M50 38 L53 47 L62 50 L53 53 L50 62 L47 53 L38 50 L47 47Z" fill="#fff0c2"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "accordion" });
  const box = (s: [number, number, number], c: any, at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at });
  const mergeAs = (geos: THREE.BufferGeometry[], c: any) => {
    if (geos.length) b.part(mergeGeometries(geos)!, c, { at: [0, 0, 0] });
  };

  const TH = 0.4; // case height
  const HD = 0.1; // half depth of cases

  const caseBody = (cx: number) => {
    box([0.2, TH, 0.2], pearl, [cx, TH / 2, 0]);
    // gold edge trim
    const geos: THREE.BufferGeometry[] = [];
    const g = (w: number, h: number, d: number, x: number, y: number, z: number) =>
      geos.push(new THREE.BoxGeometry(w, h, d).translate(x, y, z));
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) g(0.01, TH + 0.004, 0.01, cx + sx * 0.1, TH / 2, sz * HD);
    for (const sz of [-1, 1])
      for (const y of [0.004, TH - 0.004]) g(0.2, 0.01, 0.01, cx, y, sz * HD);
    for (const sx of [-1, 1])
      for (const y of [0.004, TH - 0.004]) g(0.01, 0.01, 0.2, cx + sx * 0.1, y, 0);
    mergeAs(geos, GOLD);
  };
  caseBody(0.2);
  caseBody(-0.2);

  // end caps with emblem
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.17, 0.34), "#ffffff", {
      at: [s * 0.3015, 0.2, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
    });
  }

  // ---- treble: keyboard ----
  box([0.112, 0.35, 0.003], EBONY, [0.22, 0.2, 0.1015]);
  b.part(new THREE.PlaneGeometry(0.045, 0.3), "#ffffff", {
    at: [0.125, 0.2, 0.1022],
    dir: [0, 0, 1],
    axis: "z",
    texture: FRONT,
  });
  const white: THREE.BufferGeometry[] = [];
  const black: THREE.BufferGeometry[] = [];
  const pitch = 0.0135;
  const y0 = 0.048;
  for (let i = 0; i < 24; i++) {
    const y = y0 + i * pitch;
    white.push(new THREE.BoxGeometry(0.1, 0.0122, 0.012).translate(0.222, y, 0.109));
    if (i < 23 && [0, 1, 3, 4, 5].includes(i % 7))
      black.push(new THREE.BoxGeometry(0.056, 0.0085, 0.008).translate(0.246, y + pitch / 2, 0.119));
  }
  mergeAs(white, IVORY);
  mergeAs(black, "#0d0810");
  // gold key rail
  box([0.006, 0.352, 0.016], GOLD, [0.281, 0.2, 0.108]);
  box([0.006, 0.352, 0.016], GOLD, [0.161, 0.2, 0.108]);

  // treble grille + register switches
  b.part(new THREE.PlaneGeometry(0.16, 0.12), "#ffffff", {
    at: [0.2, TH + 0.0012, -0.02],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    axis: "z",
    texture: GRILLE,
  });
  const sw: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) sw.push(new THREE.CylinderGeometry(0.0085, 0.0085, 0.012, 8).translate(0.14 + i * 0.03, TH + 0.006, 0.075));
  mergeAs(sw, pearl);
  const swc: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) swc.push(new THREE.CylinderGeometry(0.004, 0.004, 0.003, 6).translate(0.14 + i * 0.03, TH + 0.0135, 0.075));
  mergeAs(swc, GOLD_D);

  // ---- bass: buttons ----
  box([0.17, 0.35, 0.003], EBONY, [-0.2, 0.2, 0.1015]);
  const bw: THREE.BufferGeometry[] = [];
  const bm: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 8; j++) {
      const x = -0.265 + i * 0.026 + 0.0;
      const y = 0.06 + j * 0.037 + i * 0.0085;
      const g = new THREE.CylinderGeometry(0.0108, 0.0115, 0.011, 9).rotateX(Math.PI / 2).translate(x, y, 0.1085);
      (((i + j) % 3 === 0 && i < 2) ? bm : bw).push(g);
    }
  mergeAs(bw, pearl);
  mergeAs(bm, GOLD);
  // air valve and top lever
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 10), GOLD, { at: [-0.2, TH + 0.005, -0.06] });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.012, 8), pearl, { at: [-0.2, TH + 0.015, -0.06] });

  // ---- bellows ----
  box([0.012, 0.385, 0.18], pearl, [0.103, 0.2, 0]);
  box([0.012, 0.385, 0.18], pearl, [-0.103, 0.2, 0]);
  const N = 15;
  const pl = 0.2 / N;
  for (let i = 0; i < N; i++) {
    const big = i % 2 === 0;
    const x = -0.1 + pl * (i + 0.5);
    box([pl, big ? 0.37 : 0.335, big ? 0.17 : 0.135], big ? RED : RED_D, [x, 0.2, 0]);
  }
  // gold corner guards
  const cg: THREE.BufferGeometry[] = [];
  for (const sy of [-1, 1])
    for (const sz of [-1, 1]) cg.push(new THREE.BoxGeometry(0.2, 0.01, 0.01).translate(0, 0.2 + sy * 0.187, sz * 0.087));
  mergeAs(cg, GOLD);
  // pearl pleat edge dots
  const dots: THREE.BufferGeometry[] = [];
  for (let i = 0; i < N; i += 2) {
    const x = -0.1 + pl * (i + 0.5);
    for (const y of [0.09, 0.2, 0.31]) dots.push(new THREE.SphereGeometry(0.0045, 5, 4).translate(x, y, 0.0865));
  }
  mergeAs(dots, "#fff2dc");

  // bellows strap with buckle
  const sg: THREE.BufferGeometry[] = [];
  const sx = -0.06;
  for (const sy of [-1, 1]) sg.push(new THREE.BoxGeometry(0.022, 0.006, 0.18).translate(sx, 0.2 + sy * 0.1885, 0));
  for (const sz of [-1, 1]) sg.push(new THREE.BoxGeometry(0.022, 0.38, 0.006).translate(sx, 0.2, sz * 0.0885));
  mergeAs(sg, LEATHER);
  box([0.016, 0.024, 0.005], GOLD, [sx, 0.2, 0.093]);
  box([0.008, 0.014, 0.006], LEATHER, [sx, 0.2, 0.0935]);

  // shoulder strap over the back
  const arc = catmull([
    [0.2, TH, -0.06],
    [0.14, 0.47, -0.06],
    [0.0, 0.5, -0.06],
    [-0.14, 0.47, -0.06],
    [-0.2, TH, -0.06],
  ]);
  b.sweep(arc, () => [0.02, 0.004], { section: "box", color: LEATHER, caps: "flat" });
  for (const x of [0.2, -0.2]) {
    box([0.05, 0.012, 0.016], GOLD, [x, TH + 0.006, -0.06]);
  }

  return b.root;
}
```