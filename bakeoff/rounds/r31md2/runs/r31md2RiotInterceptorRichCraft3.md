```ts
import * as THREE from "three";
import { createBuilder, lerp, mix, noise, paint, smoothstep, svg, stripes, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { gaugeTexture, metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Riot-Control Interceptor",
  description:
    "Armored corporate riot-control truck with a roof-mounted water cannon, neon light bars, angry slit headlights and cyberpunk livery.",
};

const MAG = "#ff2a9d";
const CYAN = "#27f2ff";
const YEL = "#ffd400";
const RED = "#ff2236";
const DARK = "#0b0d14";
const ARMOR = "#232b3d";
const STEEL = "#7d8799";
const TIRE = "#121319";

// ---------------------------------------------------------------- textures
const hazardTex = (() => {
  let s = `<rect width="64" height="16" fill="#101014"/>`;
  for (let i = -2; i < 10; i++) s += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="${YEL}"/>`;
  return svg(`<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 256 });
})();

const sideTex = svg(
  `<svg viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 6 L40 6 L30 22 L4 22Z" fill="${YEL}"/><path d="M44 6 L60 6 L50 22 L34 22Z" fill="${YEL}"/>
  <text x="70" y="42" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="38" fill="${MAG}" opacity="0.9">NOVACORP</text>
  <text x="66" y="38" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="38" fill="#f4f7ff" stroke="${CYAN}" stroke-width="1.2">NOVACORP</text>
  <text x="68" y="60" font-family="Arial, sans-serif" font-weight="bold" font-size="14" letter-spacing="2" fill="#dfe6f5">CIVIL ORDER ENFORCEMENT</text>
  <rect x="68" y="66" width="188" height="3" fill="${CYAN}"/>
  <text x="8" y="60" font-family="monospace" font-weight="bold" font-size="22" fill="${CYAN}">U-77</text>
  <text x="68" y="78" font-family="monospace" font-size="9" fill="${MAG}">RIOT CONTROL // COMPLY OR BE WASHED</text>
</svg>`,
  { size: 1024 },
);

const windTex = svg(
  `<svg viewBox="0 0 100 45" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2a3a"/><stop offset="0.6" stop-color="#05080f"/><stop offset="1" stop-color="#1b0a2c"/></linearGradient></defs>
  <rect width="100" height="45" fill="url(#g)"/>
  <polygon points="10,45 28,0 40,0 22,45" fill="#6fe9ff" opacity="0.13"/>
  <polygon points="48,45 66,0 72,0 54,45" fill="#ff5cc0" opacity="0.12"/>
  <circle cx="50" cy="22" r="9" fill="none" stroke="${CYAN}" stroke-width="0.6" opacity="0.7"/>
  <path d="M50 10 V16 M50 28 V34 M38 22 H44 M56 22 H62" stroke="${CYAN}" stroke-width="0.6" opacity="0.7"/>
  <text x="4" y="6" font-family="monospace" font-size="3.4" fill="${CYAN}" opacity="0.8">THREAT 73%  CROWD 412</text>
  <text x="70" y="42" font-family="monospace" font-size="3.4" fill="${MAG}" opacity="0.8">HYDRO RDY</text>
</svg>`,
  { size: 512 },
);

const emblemTex = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill="#0d1018" stroke="${CYAN}" stroke-width="4"/>
  <polygon points="50,14 83,32 83,68 50,86 17,68 17,32" fill="none" stroke="${MAG}" stroke-width="2"/>
  <path d="M33 68 V32 L67 68 V32" fill="none" stroke="${YEL}" stroke-width="9" stroke-linejoin="miter"/>
</svg>`,
  { size: 256 },
);

const hubTex = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="#1b1f2b"/>
  ${[0, 72, 144, 216, 288].map((a) => `<rect x="44" y="6" width="12" height="40" fill="#8993a8" transform="rotate(${a} 50 50)"/>`).join("")}
  <circle cx="50" cy="50" r="12" fill="${MAG}"/><circle cx="50" cy="50" r="5" fill="#0b0d14"/>
</svg>`,
  { size: 128 },
);

const plateTex = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="50" rx="5" fill="${YEL}" stroke="#111" stroke-width="3"/>
  <text x="50" y="33" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#111">OPS-0451</text>
  <rect x="8" y="6" width="84" height="4" fill="#111"/>
</svg>`,
  { size: 256 },
);

const eyeTex = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="r"><stop offset="0" stop-color="#fff"/><stop offset="0.25" stop-color="#ff5a5a"/><stop offset="1" stop-color="#7a0010"/></radialGradient></defs>
  <circle cx="50" cy="50" r="50" fill="#0b0d14"/><circle cx="50" cy="50" r="38" fill="url(#r)"/>
  <circle cx="50" cy="50" r="14" fill="#220006"/><circle cx="40" cy="38" r="5" fill="#fff"/>
</svg>`,
  { size: 128 },
);

const grilleTex = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" fill="#07080d"/>
  ${[5, 13, 21, 29].map((y) => `<rect x="6" y="${y}" width="88" height="4" fill="${CYAN}" opacity="0.8"/>`).join("")}</svg>`,
  { size: 256 },
);

const gaugeTex = gaugeTexture({ label: "BAR", needle: 40 });

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "riot_interceptor", paintSize: 2048 });

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });
  const lamp = (w: number, h: number, d: number, color: string, at: number[], str = 1.6) =>
    glow(box(w, h, d, color, at), str);
  const decal = (w: number, h: number, tex: any, at: any, dir: number[], up?: number[], circle = false) =>
    b.part(circle ? new THREE.CircleGeometry(w / 2, 20) : new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir,
      up,
      axis: "z",
      texture: tex,
    });

  // paints
  const hullBase = paint((p, n) => {
    let c = mix("#161c2b", "#38435d", smoothstep(-0.2, 1, n.y));
    c = mix(c, "#2b2118", 0.75 * smoothstep(1.0, 0.45, p.y) * (0.4 + noise(p, 0.35, 3)));
    c = mix(c, "#7c869b", 0.55 * smoothstep(0.66, 0.8, noise(p, 0.12, 8)) * smoothstep(0.2, 1, n.y));
    return c;
  });
  const HULL = panelled(hullBase, { size: 0.6, aspect: 0.8, rivets: 0.07, seam: "#05060a" });
  const PLATE = panelled(metal("iron", { tarnish: 0.6 }), { size: 0.3, rivets: 0.05 });
  const TANK = stripes("#3d5877", "#1f2b3d", { size: 0.28, axis: "z", width: 0.25, wobble: 0.1 });

  // hull silhouette (z, y) extruded across the width
  b.extrude(
    [
      [-2.55, 0.5],
      [2.6, 0.5],
      [2.65, 1.1],
      [2.45, 1.55],
      [1.4, 1.65],
      [0.8, 2.3],
      [0.6, 2.4],
      [-2.4, 2.4],
      [-2.55, 2.2],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.05, color: HULL },
  );
  box(2.0, 0.2, 4.8, DARK, [0, 0.42, 0]); // undercarriage

  // wheels
  for (const s of [1, -1])
    for (const z of [1.7, -0.9, -1.9]) {
      b.part(new THREE.CylinderGeometry(0.52, 0.52, 0.42, 14), TIRE, { at: [s * 1.12, 0.5, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 10), "#2a3040", { at: [s * 1.12, 0.5, z], dir: [1, 0, 0] });
      glow(
        b.part(new THREE.TorusGeometry(0.33, 0.025, 4, 16), MAG, { at: [s * 1.378, 0.5, z], dir: [s, 0, 0], axis: "z" }),
        1.8,
      );
      decal(0.42, 0.42, hubTex, [s * 1.385, 0.5, z], [s, 0, 0], undefined, true);
      // fender
      box(0.55, 0.1, 1.3, PLATE, [s * 1.1, 1.08, z]);
      box(0.06, 0.22, 1.3, ARMOR, [s * 1.37, 1.0, z]);
    }

  // skirts, underglow, beltline neon
  for (const s of [1, -1]) {
    box(0.12, 0.5, 1.9, PLATE, [s * 1.12, 0.75, 0.35]);
    box(0.12, 0.5, 0.7, PLATE, [s * 1.12, 0.75, -1.4]);
    lamp(0.05, 0.05, 4.6, MAG, [s * 1.0, 0.46, 0], 2);
    lamp(0.03, 0.045, 4.3, CYAN, [s * 1.115, 1.0, -0.4], 2);
    lamp(0.03, 0.045, 0.9, CYAN, [s * 1.115, 1.0, 1.9], 2);
    // side livery
    decal(2.5, 0.77, sideTex, [s * 1.112, 1.58, -1.05], [s, 0, 0]);
    // door seams
    box(0.02, 0.9, 0.03, DARK, [s * 1.108, 1.2, 1.0]);
    box(0.02, 0.9, 0.03, DARK, [s * 1.108, 1.2, 2.2]);
    // armoured side window slit
    decal(0.8, 0.34, windTex, [s * 1.112, 1.95, 0.55], [s, 0, 0]);
    // mirror
    b.rod([s * 1.1, 1.8, 1.45], [s * 1.38, 1.95, 1.5], 0.025, STEEL);
    box(0.1, 0.28, 0.2, DARK, [s * 1.42, 1.95, 1.5]);
    lamp(0.02, 0.05, 0.12, YEL, [s * 1.475, 2.0, 1.5], 1.5);
    // tail lights
    lamp(0.14, 1.1, 0.04, RED, [s * 0.95, 1.5, -2.57], 1.8);
    // roof edge neon
    lamp(0.04, 0.04, 2.9, CYAN, [s * 1.07, 2.42, -1.0], 2);
    // speaker horns
    b.rod([s * 0.85, 2.6, -0.15], [s * 0.85, 2.66, 0.45], [0.09, 0.2], ARMOR);
    glow(b.part(new THREE.CircleGeometry(0.18, 10), "#ff9ad5", { at: [s * 0.85, 2.664, 0.455], dir: [0, 0.1, 1], axis: "z" }), 1.2);
    box(0.1, 0.12, 0.2, STEEL, [s * 0.85, 2.5, -0.15]);
    // antennae
    b.rod([s * 1.0, 2.4, -2.3], [s * 1.0, 3.7, -2.4], 0.018, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), s > 0 ? MAG : CYAN, { at: [s * 1.0, 3.72, -2.4] }), 2);
    // grille-guard bars
    for (const x of [0.45, 0.9]) b.rod([s * x, 0.95, 2.95], [s * x, 1.45, 2.55], 0.03, STEEL);
    // hoses
    b.sweep(
      catmull([
        [s * 0.4, 2.8, -1.6],
        [s * 0.6, 2.55, -1.3],
        [s * 0.5, 2.5, -0.95],
        [s * 0.3, 2.55, -0.7],
      ]),
      0.05,
      { color: "#181a22", sides: 6 },
    );
    // angry slit headlights
    glow(
      b.extrude(
        [
          [0, 0],
          [0.55, 0.11],
          [0.55, 0.2],
          [0, 0.1],
        ],
        { at: [s * 0.3, 0.97, 2.66], x: [s, 0, 0], thickness: 0.05, color: "#e8ffff" },
      ),
      2.2,
    );
    lamp(0.08, 0.08, 0.05, YEL, [s * 1.0, 1.3, 2.52], 1.6);
  }

  // front: grille, bumper, hood emblem
  decal(0.5, 0.2, grilleTex, [0, 1.02, 2.66], [0, 0, 1]);
  b.part(new THREE.BoxGeometry(2.3, 0.4, 0.3), "#ffffff", { at: [0, 0.7, 2.8], texture: hazardTex });
  decal(0.5, 0.25, plateTex, [0, 0.7, 2.955], [0, 0, 1]);
  decal(0.9, 0.9, emblemTex, [0, 1.615, 1.95], [0, 1, 0.1], [0, 0, -1]);
  lamp(1.9, 0.05, 0.05, MAG, [0, 1.52, 2.46], 1.8);

  // windshield + cage
  const wn = [0, 0.6, 0.65];
  decal(1.9, 0.885, windTex, [0, 1.985, 1.105], wn);
  for (const x of [-0.65, 0, 0.65]) b.rod([x, 1.68, 1.45], [x, 2.34, 0.83], 0.022, STEEL);
  box(2.0, 0.07, 0.07, ARMOR, [0, 1.67, 1.43]);

  // roof light bar
  box(2.0, 0.1, 0.34, DARK, [0, 2.45, 0.3]);
  [-0.8, -0.4, 0, 0.4, 0.8].forEach((x, i) => lamp(0.36, 0.1, 0.3, i % 2 ? CYAN : MAG, [x, 2.55, 0.3], 2.2));

  // water tank + gauge
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 1.1, 12), TANK, { at: [0, 2.8, -1.85], dir: [0, 0, 1] });
  for (const z of [-2.2, -1.5]) b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 12), STEEL, { at: [0, 2.8, z], dir: [0, 0, 1] });
  decal(0.52, 0.52, gaugeTex, [0, 2.8, -2.405], [0, 0, -1], undefined, true);
  for (const s of [1, -1]) lamp(0.04, 0.5, 0.06, CYAN, [s * 0.4, 2.8, -1.85], 1.5);
  box(0.9, 0.12, 1.4, ARMOR, [0, 2.46, -1.85]);

  // water cannon turret
  b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.5, 0.12],
      [0.35, 0.22],
      [0.3, 0.3],
      [0, 0.3],
    ],
    { at: [0, 2.4, -0.7], segments: 10, color: PLATE },
  );
  b.extrude(
    [
      [-0.45, 0],
      [0.45, 0],
      [0.45, 0.4],
      [0.2, 0.58],
      [-0.3, 0.58],
      [-0.45, 0.4],
    ],
    { at: [0, 2.72, -0.7], x: [0, 0, 1], thickness: 0.9, bevel: 0.03, color: HULL },
  );
  for (const s of [1, -1]) {
    lamp(0.03, 0.04, 0.8, YEL, [s * 0.455, 2.85, -0.7], 1.3);
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), STEEL, { at: [s * 0.46, 3.0, -0.35], dir: [1, 0, 0] });
  }
  // sensor pod
  box(0.3, 0.2, 0.3, DARK, [-0.25, 3.38, -0.75]);
  decal(0.15, 0.15, eyeTex, [-0.25, 3.38, -0.595], [0, 0, 1], undefined, true);
  glow(box(0.04, 0.04, 0.04, RED, [-0.12, 3.5, -0.75]), 2);

  // barrel
  const A = new THREE.Vector3(0, 3.0, -0.35);
  const B = new THREE.Vector3(0, 3.15, 1.35);
  const d = B.clone().sub(A).normalize();
  b.rod(A, lerp(A, B, 0.88), 0.14, "#9aa4b8");
  for (const t of [0.15, 0.4, 0.65]) {
    b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.07, 10), YEL, { at: lerp(A, B, t), dir: d });
  }
  b.rod(lerp(A, B, 0.86), B, [0.15, 0.23], ARMOR);
  glow(b.part(new THREE.CircleGeometry(0.17, 10), CYAN, { at: B.clone().addScaledVector(d, 0.004), dir: d, axis: "z" }), 2.2);
  for (const s of [1, -1]) {
    const off = new THREE.Vector3(s * 0.15, 0, 0);
    glow(b.rod(lerp(A, B, 0.2).add(off), lerp(A, B, 0.82).add(off), 0.014, CYAN), 2);
  }

  // rear: hazard door panel, bumper, plate
  b.part(new THREE.BoxGeometry(1.6, 0.4, 0.04), "#ffffff", { at: [0, 1.3, -2.57], texture: hazardTex });
  box(2.3, 0.3, 0.25, ARMOR, [0, 0.65, -2.65]);
  decal(0.5, 0.25, plateTex, [0, 0.65, -2.78], [0, 0, -1]);
  decal(0.7, 0.7, emblemTex, [0, 1.9, -2.56], [0, 0, -1]);
  lamp(1.9, 0.05, 0.05, RED, [0, 0.82, -2.79], 1.8);

  return b.root;
}
```