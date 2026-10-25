```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, catmull, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "KV-9 Pacifier Riot Interceptor",
  description:
    "Corporate riot-control interceptor: armored six-wheel wedge hull, roof water cannon with tank, neon light bars, cage windshield and corporate livery in a Cyberpunk 2077 style.",
};

// ---------------------------------------------------------------- palette
const CYAN = "#29f3ff";
const MAG = "#ff2bd6";
const RED = "#ff2a4d";
const BLUE = "#2a7bff";
const YEL = "#ffd321";
const DARK = "#14161c";
const RUBBER = "#0d0e12";
const STEEL = "#6f7686";
const GUN = "#252a36";

// ---------------------------------------------------------------- textures
const wrap = (w: number, h: number, inner: string) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

const label = (text: string, fg: string, bg: string, border: string, fs = 34, w = 320, h = 60) =>
  svg(
    wrap(
      w,
      h,
      `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="6" fill="${bg}" stroke="${border}" stroke-width="3"/>
       <text x="${w / 2}" y="${h / 2 + fs * 0.35}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="${fs}" fill="${fg}">${text}</text>`,
    ),
    { size: 512 },
  );

const hazardStripes = (() => {
  let s = `<rect width="64" height="16" fill="${YEL}"/>`;
  for (let i = -2; i < 10; i++) s += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="#111"/>`;
  return svg(wrap(64, 16, s), { size: 128 });
})();

const EMBLEM = svg(
  wrap(
    100,
    100,
    `<circle cx="50" cy="50" r="47" fill="#0c0e14" stroke="${CYAN}" stroke-width="3"/>
     <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="${MAG}" stroke-width="3"/>
     <path d="M34 28 V72 M34 50 L66 28 M34 50 L66 72" stroke="${CYAN}" stroke-width="7" fill="none" stroke-linecap="round"/>
     <path d="M70 30 L78 50 L70 70" stroke="${YEL}" stroke-width="3" fill="none"/>
     <text x="50" y="97" text-anchor="middle" font-family="monospace" font-size="8" font-weight="bold" fill="#fff">KV-SEC</text>`,
  ),
  { size: 256 },
);

const WIND = svg(
  wrap(
    200,
    100,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16314a"/><stop offset="1" stop-color="#060b14"/></linearGradient></defs>
     <rect width="200" height="100" fill="url(#g)"/>
     <polygon points="20,100 60,0 78,0 38,100" fill="${CYAN}" opacity="0.28"/>
     <polygon points="110,100 150,0 160,0 120,100" fill="${MAG}" opacity="0.25"/>
     <g stroke="#0a0a10" stroke-width="3">
     <path d="M0 33H200M0 66H200"/><path d="M40 0V100M80 0V100M120 0V100M160 0V100"/></g>
     <rect x="1" y="1" width="198" height="98" fill="none" stroke="#0a0a10" stroke-width="4"/>`,
  ),
  { size: 512 },
);

const SIDEWIN = svg(
  wrap(
    200,
    50,
    `<rect width="200" height="50" fill="#0a1626"/>
     <polygon points="10,50 40,0 60,0 30,50" fill="${CYAN}" opacity="0.25"/>
     <polygon points="100,50 130,0 142,0 112,50" fill="${MAG}" opacity="0.22"/>
     <g stroke="#08080c" stroke-width="3"><path d="M0 25H200"/><path d="M50 0V50M100 0V50M150 0V50"/></g>
     <rect x="1" y="1" width="198" height="48" fill="none" stroke="#08080c" stroke-width="4"/>`,
  ),
  { size: 512 },
);

const REAR = svg(
  wrap(
    170,
    120,
    `<rect width="170" height="120" fill="#2a2f3c"/>
     <rect x="4" y="4" width="162" height="112" fill="none" stroke="#10121a" stroke-width="3"/>
     <path d="M85 4V116" stroke="#0a0b10" stroke-width="4"/>
     <rect x="4" y="100" width="162" height="16" fill="${YEL}"/>
     ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `<polygon points="${4 + i * 14},116 ${4 + i * 14 + 7},116 ${4 + i * 14 + 14},100 ${4 + i * 14 + 7},100" fill="#111"/>`).join("")}
     <rect x="72" y="50" width="8" height="18" rx="2" fill="${CYAN}"/><rect x="90" y="50" width="8" height="18" rx="2" fill="${CYAN}"/>
     <circle cx="42" cy="40" r="14" fill="none" stroke="${MAG}" stroke-width="3"/>
     <path d="M34 40H50M42 32V48" stroke="${MAG}" stroke-width="3"/>
     <rect x="110" y="30" width="46" height="22" fill="#e8e8ee"/>
     <text x="133" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#111">KV-9041</text>`,
  ),
  { size: 512 },
);

const SIDELABEL = label("RIOT SUPPRESSION UNIT 09", "#e9fbff", "#10131c", CYAN, 25);
const COMPLY = label("COMPLY", RED, "#17060c", RED, 40);
const BANNER = label("COMPLIANCE ENFORCED", YEL, "#0c0d12", YEL, 21);
const TANKLBL = label("AQUA-LOCK H2O", "#0b1a22", "#9fe8ff", "#10131c", 26);

// ---------------------------------------------------------------- builder & helpers
const b = createBuilder({ name: "riot_interceptor" });

const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
  b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], o: any = {}) =>
  b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...o });
const lit = <T,>(p: T, s = 1.4) => glow(p as any, s);
const plate = (tex: any, w: number, h: number, at: number[], dir: number[], up?: number[]) =>
  b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });

// ---------------------------------------------------------------- hull
const hull = panelled(
  paint((p, n) => {
    if (p.y < 0.95) return n.y > 0.5 ? "#2a2d36" : "#171920";
    if (n.y > 0.6 && p.y > 2.0) return mix("#d4dae6", "#9aa3b6", noise(p, 0.5, 3) * 0.6);
    const grime = smoothstep(1.5, 0.7, p.y) * 0.55 + noise(p, 0.3, 5) * 0.15;
    return mix("#3b4356", "#15171e", grime);
  }),
  { size: 0.6, aspect: 0.8, rivets: 0.12 },
);

b.extrude(
  [
    [-2.7, 0.55],
    [2.7, 0.55],
    [2.8, 1.1],
    [2.5, 1.5],
    [1.3, 1.7],
    [0.7, 2.35],
    [-2.0, 2.4],
    [-2.7, 2.25],
  ],
  { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.1, bevel: 0.04, color: hull },
);

// skid plate and underglow
box(1.9, 0.08, 4.8, DARK, [0, 0.58, 0]);
lit(box(1.7, 0.03, 4.4, MAG, [0, 0.53, 0]), 2);

// ---------------------------------------------------------------- wheels
for (const z of [1.75, -0.05, -1.85])
  for (const s of [1, -1]) {
    const x = s * 1.2;
    cyl(0.55, 0.55, 0.5, 14, RUBBER, [x, 0.55, z], { rotation: [0, 0, 90] });
    cyl(0.3, 0.3, 0.52, 10, STEEL, [x, 0.55, z], { rotation: [0, 0, 90] });
    cyl(0.18, 0.18, 0.06, 8, DARK, [s * 1.47, 0.55, z], { rotation: [0, 0, 90] });
    lit(
      b.part(new THREE.TorusGeometry(0.34, 0.03, 5, 16), MAG, { at: [s * 1.455, 0.55, z], rotation: [0, 90, 0] }),
      2,
    );
    // fender
    box(0.62, 0.08, 1.35, GUN, [x, 1.16, z]);
    box(0.08, 0.3, 1.35, GUN, [s * 1.52, 1.04, z]);
  }

// ---------------------------------------------------------------- side livery
for (const s of [1, -1]) {
  const x = s * 1.065;
  plate(SIDELABEL, 2.8, 0.53, [x, 1.45, -0.2], [s, 0, 0]);
  plate(SIDEWIN, 1.8, 0.45, [x, 1.98, -0.5], [s, 0, 0]);
  plate(EMBLEM, 0.55, 0.55, [x, 0.83, 0.85], [s, 0, 0]);
  lit(box(0.04, 0.04, 4.6, CYAN, [s * 1.07, 1.12, 0]), 2);
  box(0.06, 0.2, 0.14, DARK, [s * 1.08, 1.75, 0.65]); // door handle
  box(0.04, 0.5, 0.04, DARK, [s * 1.07, 1.0, 0.45]);
  // side step
  box(0.16, 0.05, 1.0, GUN, [s * 1.16, 0.62, 0.85]);
  // mirror
  b.rod([s * 1.05, 1.95, 1.15], [s * 1.38, 2.0, 1.4], 0.025, STEEL);
  box(0.06, 0.32, 0.2, DARK, [s * 1.42, 2.0, 1.4]);
  lit(box(0.02, 0.26, 0.14, CYAN, [s * 1.385, 2.0, 1.4]), 0.8);
}

// ---------------------------------------------------------------- front
const wn = new THREE.Vector3(0, 0.6, 0.65).normalize();
plate(WIND, 1.85, 0.85, [0, 2.03 + wn.y * 0.012, 1.0 + wn.z * 0.012], [0, 0.6, 0.65]);
// cage frame
box(1.95, 0.06, 0.06, DARK, [0, 1.7, 1.31]);
box(1.95, 0.06, 0.06, DARK, [0, 2.36, 0.69]);

// hood emblem
plate(EMBLEM, 0.7, 0.7, [0, 1.615, 1.9], [0, 1.2, 0.2], [0, 0, -1]);
// hood vents / neon eyebrow
for (const s of [1, -1]) {
  lit(b.part(new THREE.BoxGeometry(0.7, 0.04, 0.05), CYAN, { at: [s * 0.7, 1.64, 1.55], dir: [0, 1.2, 0.2] }), 2);
  lit(b.part(new THREE.BoxGeometry(0.6, 0.05, 0.14), "#e8fbff", { at: [s * 0.8, 1.31, 2.66], dir: [0, 0.6, 0.8] }), 2.4);
  lit(b.part(new THREE.BoxGeometry(0.6, 0.03, 0.05), MAG, { at: [s * 0.8, 1.18, 2.74], dir: [0, 0.6, 0.8] }), 2);
}
lit(b.part(new THREE.BoxGeometry(0.9, 0.04, 0.05), MAG, { at: [0, 1.4, 2.6], dir: [0, 0.6, 0.8] }), 2);

// bumper / ram
box(2.5, 0.45, 0.35, "#1c1f28", [0, 0.82, 2.95]);
box(2.3, 0.1, 0.1, STEEL, [0, 1.08, 3.0]);
b.part(new THREE.BoxGeometry(2.3, 0.12, 0.05), "#ffffff", { at: [0, 0.65, 3.14], texture: hazardStripes });
lit(box(1.9, 0.07, 0.04, CYAN, [0, 0.86, 3.14]), 2.4);
lit(box(0.9, 0.05, 0.04, MAG, [0, 0.96, 3.14]), 2.4);
plate(BANNER, 1.3, 0.24, [0, 1.17, 2.9], [0, 0.0, 1]);
for (const s of [1, -1]) {
  b.rod([s * 1.0, 0.6, 3.15], [s * 1.0, 1.45, 3.0], 0.05, STEEL);
  b.rod([s * 1.0, 1.45, 3.0], [s * 1.0, 1.45, 2.55], 0.05, STEEL);
  box(0.12, 0.12, 0.12, STEEL, [s * 1.1, 0.6, 3.1]);
  lit(box(0.1, 0.14, 0.06, "#fff1b0", [s * 1.15, 0.85, 3.15]), 2);
}

// ---------------------------------------------------------------- rear
plate(REAR, 1.7, 1.2, [0, 1.35, -2.71], [0, 0, -1]);
plate(COMPLY, 1.4, 0.26, [0, 2.1, -2.71], [0, 0, -1]);
box(2.3, 0.35, 0.3, "#1c1f28", [0, 0.75, -2.85]);
b.part(new THREE.BoxGeometry(2.2, 0.1, 0.04), "#ffffff", { at: [0, 0.75, -3.01], texture: hazardStripes });
for (const s of [1, -1]) {
  lit(box(0.14, 0.8, 0.06, RED, [s * 0.98, 1.35, -2.73]), 2);
  lit(box(0.4, 0.06, 0.04, RED, [s * 0.75, 0.95, -3.02]), 2);
  cyl(0.06, 0.06, 0.5, 6, STEEL, [s * 0.9, 2.1, -2.95], { rotation: [90, 0, 0] });
}

// ---------------------------------------------------------------- roof light bar & sensors
box(2.0, 0.1, 0.3, DARK, [0, 2.47, 0.25]);
const bars = [BLUE, RED, BLUE, RED, CYAN, MAG, CYAN, MAG, RED, BLUE, RED, BLUE];
bars.forEach((c, i) => {
  const x = -0.9 + (i + 0.5) * (1.8 / bars.length);
  lit(box(1.8 / bars.length - 0.02, 0.1, 0.2, c, [x, 2.57, 0.25]), 2.6);
});
for (const s of [1, -1]) {
  box(0.14, 0.2, 0.16, DARK, [s * 1.0, 2.45, 0.25]);
  lit(box(0.06, 0.12, 0.1, "#fff6c8", [s * 1.0, 2.55, 0.35]), 2.2);
}
// camera dome
cyl(0.03, 0.03, 0.22, 6, STEEL, [-0.6, 2.5, 0.55]);
b.part(new THREE.SphereGeometry(0.1, 8, 6), "#10131a", { at: [-0.6, 2.65, 0.55] });
lit(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { at: [-0.6, 2.67, 0.64] }), 2);
// antennas
for (const s of [1, -1]) {
  b.rod([s * 0.95, 2.3, -2.4], [s * 0.95, 3.2, -2.4], [0.02, 0.01], STEEL);
  lit(b.part(new THREE.SphereGeometry(0.04, 6, 4), s > 0 ? CYAN : MAG, { at: [s * 0.95, 3.22, -2.4] }), 2.4);
}

// ---------------------------------------------------------------- smoke / gas launcher pods
for (const s of [1, -1]) {
  box(0.4, 0.22, 0.55, GUN, [s * 0.85, 2.5, -0.95]);
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      const at = [s * (0.7 + i * 0.15), 2.7, -1.12 + j * 0.2];
      cyl(0.055, 0.055, 0.3, 6, DARK, at, { dir: [s * 0.3, 0.8, 0.3] });
      lit(b.part(new THREE.CircleGeometry(0.035, 6), YEL, { at: [at[0] + s * 0.065, at[1] + 0.14, at[2] + 0.06], dir: [s * 0.3, 0.8, 0.3], axis: "z" }), 1.6);
    }
}

// ---------------------------------------------------------------- water tank
const tankPaint = countershadeTank();
function countershadeTank() {
  return paint((p, n) => mix("#cfe9f3", "#6a8da0", smoothstep(0.7, -0.6, n.y) * 0.7 + noise(p, 0.2, 9) * 0.1));
}
b.capsule([0, 2.9, -2.05], [0, 2.9, -1.05], 0.46, tankPaint);
for (const z of [-1.8, -1.3]) b.part(new THREE.TorusGeometry(0.47, 0.03, 5, 14), STEEL, { at: [0, 2.9, z] });
for (const s of [1, -1]) {
  lit(box(0.03, 0.5, 0.7, CYAN, [s * 0.455, 2.85, -1.55]), 1.8);
  plate(TANKLBL, 0.62, 0.12, [s * 0.462, 3.15 - 0.05, -1.55], [s, 0, 0]);
}
box(0.5, 0.14, 0.5, DARK, [0, 3.38, -1.55]);
lit(box(0.3, 0.04, 0.3, CYAN, [0, 3.46, -1.55]), 1.6);
// hoses
for (const s of [1, -1]) {
  b.sweep(
    catmull([
      [s * 0.3, 2.75, -1.0],
      [s * 0.42, 2.5, -0.75],
      [s * 0.32, 2.58, -0.5],
      [s * 0.26, 2.85, -0.35],
    ]),
    0.045,
    { color: "#15171c", sides: 6 },
  );
  lit(b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), CYAN, { at: [s * 0.42, 2.5, -0.75] }), 2);
}

// ---------------------------------------------------------------- water cannon turret
cyl(0.42, 0.46, 0.18, 12, GUN, [0, 2.49, -0.2]);
lit(b.part(new THREE.TorusGeometry(0.44, 0.025, 4, 16), CYAN, { at: [0, 2.6, -0.2], rotation: [90, 0, 0] }), 2.4);
box(0.58, 0.42, 0.8, "#2c3342", [0, 2.88, -0.2]);
box(0.62, 0.1, 0.84, "#c9d0dc", [0, 3.12, -0.2]);
for (const s of [1, -1]) {
  lit(box(0.02, 0.1, 0.5, MAG, [s * 0.3, 2.88, -0.2]), 2);
  box(0.12, 0.3, 0.3, DARK, [s * 0.35, 2.85, 0.05]);
}
const A = new THREE.Vector3(0, 3.0, 0.1);
const T = new THREE.Vector3(0, 3.14, 1.7);
const D = T.clone().sub(A).normalize();
b.rod(A, T, [0.14, 0.11], "#3a4254", { sides: 8 });
for (const t of [0.25, 0.55, 0.85]) {
  const q = A.clone().lerp(T, t);
  lit(b.part(new THREE.TorusGeometry(0.14, 0.022, 4, 10), t === 0.55 ? MAG : CYAN, { at: q.toArray(), dir: D.toArray(), axis: "z" }), 2.4);
}
const N = T.clone().addScaledVector(D, 0.12);
cyl(0.2, 0.12, 0.3, 8, STEEL, N.toArray(), { dir: D.toArray() });
lit(
  b.part(new THREE.CircleGeometry(0.15, 8), CYAN, { at: T.clone().addScaledVector(D, 0.275).toArray(), dir: D.toArray(), axis: "z" }),
  2.8,
);
// ammo/feed line from turret to barrel
b.rod([0, 2.95, -0.55], [0, 3.0, 0.1], 0.04, DARK);

export default function build() {
  return b.root;
}
```