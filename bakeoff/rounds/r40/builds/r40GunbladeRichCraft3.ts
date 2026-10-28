import * as THREE from "three";
import { createBuilder, frame, rng, paint, mix, noise, smoothstep, mottle, spiral, catmull, svg } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Revolver Gunblade",
  description:
    "A Final Fantasy style gunblade standing on its pommel: silver single-edged blade with glowing runic fuller and spine barrel, ether-cartridge cylinder, gilt winged guard, lion crest frame, trigger and hammer, wrapped grip, and a lion medallion chain with feather and tassel.",
};

type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------- palette
const GOLD = "#e8b53a";
const GOLD_PALE = "#ffd966";
const NAVY = "#121a44";
const CYAN = "#59f0ff";
const STEEL = "#c3cddd";
const CORD = "#caa24b";
const RED = "#c2263a";
const BLACK = "#08080e";
const FULLER = "#16214c";

// ---------------------------------------------------------------- textures
function runeTexture() {
  const r = rng(11);
  let g = "";
  for (let i = 0; i < 11; i++) {
    const y = 24 + i * 40;
    const k = Math.floor(r() * 5);
    const paths = [
      `M12 ${y - 14} L12 ${y + 14} M12 ${y - 6} L20 ${y - 12} M12 ${y + 2} L20 ${y - 4}`,
      `M12 ${y - 14} L12 ${y + 14} M4 ${y - 10} L12 ${y - 2} L20 ${y - 10}`,
      `M5 ${y - 14} L19 ${y + 14} M19 ${y - 14} L5 ${y + 14}`,
      `M12 ${y - 14} L5 ${y} L12 ${y + 14} L19 ${y} Z`,
      `M6 ${y - 14} L6 ${y + 14} L18 ${y + 14} M6 ${y} L16 ${y - 8}`,
    ];
    g += `<path d="${paths[k]}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 24 480" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#1b86c9" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">${g}</g>
      <g fill="none" stroke="#c9fdff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">${g}</g>
    </svg>`,
    { size: 720 },
  );
}

function lionTexture() {
  let mane = "";
  const N = 14;
  for (let i = 0; i < N * 2; i++) {
    const a = (i / (N * 2)) * Math.PI * 2;
    const rr = i % 2 ? 37 : 49;
    mane += `${(50 + Math.sin(a) * rr).toFixed(1)},${(50 - Math.cos(a) * rr).toFixed(1)} `;
  }
  const O = "#2b1806";
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="${mane}" fill="#c98a2b" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="33" fill="#e2a638" stroke="${O}" stroke-width="2"/>
      <circle cx="29" cy="26" r="8" fill="#e9b13c" stroke="${O}" stroke-width="2"/>
      <circle cx="71" cy="26" r="8" fill="#e9b13c" stroke="${O}" stroke-width="2"/>
      <circle cx="29" cy="26" r="3.6" fill="#8a4a1a"/>
      <circle cx="71" cy="26" r="3.6" fill="#8a4a1a"/>
      <path d="M30 42 Q50 28 70 42 L68 66 Q50 82 32 66Z" fill="#f7d466" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="50" cy="64" rx="12" ry="9" fill="#fff0b8" stroke="${O}" stroke-width="1.6"/>
      <path d="M43 56 L57 56 L50 65Z" fill="#3a1a10"/>
      <path d="M50 65 L50 70 M41 72 Q50 78 59 72" stroke="${O}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M32 46 L46 49 L43 55 L34 52Z" fill="#241022"/>
      <path d="M68 46 L54 49 L57 55 L66 52Z" fill="#241022"/>
      <path d="M34 50 L38 50" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M66 50 L62 50" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M30 40 L46 44 M70 40 L54 44" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
}

function engravingTexture() {
  return svg(
    `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#25346e" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 14 L50 124"/>
        <path d="M50 34 C20 30 10 56 30 64 C42 69 48 58 40 52"/>
        <path d="M50 34 C80 30 90 56 70 64 C58 69 52 58 60 52"/>
        <path d="M50 76 C24 76 16 98 34 106 C46 110 50 102 44 96"/>
        <path d="M50 76 C76 76 84 98 66 106 C54 110 50 102 56 96"/>
      </g>
      <circle cx="50" cy="14" r="6" fill="#d9a62e" stroke="#25346e" stroke-width="2"/>
      <circle cx="30" cy="64" r="3" fill="#d9a62e"/><circle cx="70" cy="64" r="3" fill="#d9a62e"/>
    </svg>`,
    { size: 256 },
  );
}

function trimTexture() {
  let tri = "";
  for (let i = 0; i < 12; i++) tri += `M${i * 10 + 1} 15 L${i * 10 + 5} 3 L${i * 10 + 9} 15Z `;
  return svg(
    `<svg viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="16" fill="#ffffff"/>
      <path d="${tri}" fill="#555555"/>
      <rect y="0" width="120" height="1.6" fill="#8a8a8a"/><rect y="14.4" width="120" height="1.6" fill="#8a8a8a"/>
    </svg>`,
    { size: 240 },
  );
}

function featherTexture() {
  return svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
      <path d="M20 2 C38 18 42 52 22 84 L20 98 L18 84 C-2 52 2 18 20 2Z" fill="url(#f)" stroke="#2a3f7a" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M20 8 L20 96" stroke="#2a3f7a" stroke-width="2.2"/>
      <path d="M20 30 L8 22 M20 44 L6 34 M20 58 L9 48 M20 30 L32 22 M20 44 L34 34 M20 58 L31 48" stroke="#5f86c8" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
}

function tasselTexture() {
  let strands = "";
  for (let i = 0; i < 7; i++) {
    const x = 4 + i * 3.7;
    strands += `<path d="M15 60 L${x} 4" stroke="${i % 2 ? "#a81d30" : "#d8344a"}" stroke-width="4.2" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 30 80" xmlns="http://www.w3.org/2000/svg">
      ${strands}
      <path d="M9 64 L21 64 L19 56 L11 56Z" fill="#e8b53a" stroke="#6a4510" stroke-width="1.2"/>
      <rect x="11" y="66" width="8" height="12" rx="3" fill="#e8b53a" stroke="#6a4510" stroke-width="1.2"/>
    </svg>`,
    { size: 160 },
  );
}

// ---------------------------------------------------------------- helpers
const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
const disc = (r: number, n: number): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * r, Math.sin(a) * r] as Pt;
  });

export default function build() {
  const b = createBuilder({ name: "gunblade" });

  // paints
  const GILT = metal("gilt", { tarnish: 0.12 });
  const SILVER = metal("steel", { polish: 0.6 });
  const BLUED = metal("blued", { tarnish: 0.1 });
  const IRON = metal("iron");
  const LEATHER = mottle("#12121c", "#292942", { size: 0.012 });

  const BLADE = paint((p, n, s) => {
    const x = s[0];
    const y = s[1];
    const edge = smoothstep(0.034, 0.052, x);
    const spine = smoothstep(-0.03, -0.045, x);
    let c = mix("#a9b9d3", "#e3ecfc", edge);
    c = mix(c, "#5d6b8c", spine * 0.8);
    const streak = ((((y * 0.6 + x * 1.1) % 0.22) + 0.22) % 0.22);
    if (streak < 0.012) c = mix(c, "#ffffff", 0.35);
    c = mix(c, "#6f7fa6", 0.3 * smoothstep(0.12, 0, y));
    c = mix(c, "#f4f9ff", 0.35 * smoothstep(0.7, 0.8, y));
    c = mix(c, "#8fa0c4", 0.12 * noise(p, 0.04, 3));
    if (Math.abs(n.z) < 0.5) c = mix(c, "#ffffff", 0.55);
    return c;
  });

  // textures
  const RUNES = runeTexture();
  const LION = lionTexture();
  const ENGRAVE = engravingTexture();
  const TRIM = trimTexture();
  const FEATHER = featherTexture();
  const TASSEL = tasselTexture();

  const face = (tex: THREE.Texture, w: number, h: number, x: number, y: number, z: number, color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at: [x, y, z], dir: [0, 0, z < 0 ? -1 : 1], axis: "z", texture: tex });

  const gem = (at: number[], dir: number[], r = 0.008) => {
    b.part(cyl(r * 1.55, r * 1.65, 0.004, 8), GILT, { at, dir });
    return glow(b.part(sph(r), CYAN, { at, dir, scale: [1, 0.55, 1] }), 1.4);
  };

  // ---------------------------------------------------------------- pommel & grip
  b.lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.03, 0.01],
      [0.031, 0.03],
      [0.026, 0.05],
      [0.021, 0.062],
      [0.0245, 0.066],
      [0.0245, 0.076],
      [0, 0.076],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 10, color: GILT, name: "pommel" },
  );
  gem([0, 0.034, 0.0305], [0, 0, 1], 0.009);
  for (let i = 0; i < 4; i++) {
    const a = ((45 + i * 90) * Math.PI) / 180;
    const sn = Math.sin(a);
    const cs = Math.cos(a);
    b.spike([sn * 0.028, 0.026, cs * 0.028], [sn * 0.8, -0.25, cs * 0.8], 0.03, 0.007, { color: GILT, sides: 4 });
  }

  b.lathe(
    [
      [0, 0.07],
      [0.02, 0.07],
      [0.0215, 0.12],
      [0.0225, 0.18],
      [0.0215, 0.24],
      [0.0235, 0.295],
      [0.0235, 0.3],
      [0, 0.3],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 10, color: LEATHER, name: "grip" },
  );
  b.sweep(spiral([0, 0.085, 0], [0.0207, 0.085, 0], [0, 1, 0], { turns: 11, r1: 0.0235, pitch: 0.0182 }), 0.0028, {
    color: CORD,
    sides: 5,
    name: "gripCord",
  });
  for (const y of [0.078, 0.29]) b.part(cyl(0.0262, 0.0262, 0.01, 10), GILT, { at: [0, y, 0] });

  // heel collar
  b.lathe(
    [
      [0, 0.29],
      [0.03, 0.29],
      [0.034, 0.296],
      [0.034, 0.308],
      [0.028, 0.314],
      [0, 0.314],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 10, color: GILT, name: "collar" },
  );

  // ---------------------------------------------------------------- frame (receiver)
  const FY = 0.3;
  b.extrude(
    [
      [-0.045, 0],
      [0.045, 0],
      [0.056, 0.06],
      [0.05, 0.105],
      [-0.05, 0.105],
      [-0.056, 0.06],
    ],
    { at: [0, FY, 0], x: [1, 0, 0], thickness: 0.05, bevel: 0.006, color: BLUED, name: "frame" },
  );
  const PY = 0.3525;
  b.extrude(disc(0.038, 12), { at: [0, PY, 0], x: [1, 0, 0], thickness: 0.0524, bevel: 0.003, color: NAVY, name: "crestPlate" });
  for (const z of [1, -1]) {
    face(LION, 0.066, 0.066, 0, PY, z * 0.0268);
    const pts: number[][] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push([Math.cos(a) * 0.0385, PY + Math.sin(a) * 0.0385, z * 0.0262]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.0032, { color: GILT, sides: 5 });
    for (const [rx, ry] of [
      [-0.041, 0.318],
      [0.041, 0.318],
      [-0.041, 0.39],
      [0.041, 0.39],
      [-0.05, 0.354],
      [0.05, 0.354],
    ])
      b.part(sph(0.0036), GOLD, { at: [rx, ry, z * 0.0254] });
  }

  // trigger guard + trigger
  b.sweep(
    catmull([
      [0.05, 0.392, 0],
      [0.085, 0.386, 0],
      [0.105, 0.352, 0],
      [0.09, 0.312, 0],
      [0.05, 0.306, 0],
    ]),
    0.005,
    { color: GILT, sides: 6, smooth: false, name: "triggerGuard" },
  );
  b.sweep(
    catmull([
      [0.05, 0.376, 0],
      [0.065, 0.356, 0],
      [0.064, 0.33, 0],
    ]),
    [0.0065, 0.0025],
    { color: SILVER, sides: 5, name: "trigger" },
  );

  // hammer
  const HAMMER: Pt[] = [
    [0, -0.012],
    [0.025, -0.004],
    [0.045, 0.02],
    [0.052, 0.048, "sharp"],
    [0.04, 0.046],
    [0.03, 0.032],
    [0.012, 0.022],
    [0, 0.025],
  ];
  b.extrude(HAMMER, { at: [-0.05, 0.34, 0], x: [-1, 0, 0], thickness: 0.016, bevel: 0.002, color: SILVER, name: "hammer" });
  b.part(cyl(0.0065, 0.0065, 0.021, 8), GILT, { at: [-0.05, 0.34, 0], dir: [0, 0, 1] });
  for (const z of [1, -1]) b.part(sph(0.0045), CYAN, { at: [-0.05, 0.34, z * 0.0105] }) && glow(b.part(sph(0.0035), CYAN, { at: [-0.05, 0.34, z * 0.0112] }), 1.2);

  // chain lug, chain, medallion, feather
  b.rod([-0.046, 0.306, 0], [-0.056, 0.3, 0], 0.003, { color: GILT });
  b.part(new THREE.TorusGeometry(0.007, 0.0016, 4, 8), GILT, { at: [-0.057, 0.298, 0] });
  for (let i = 0; i < 8; i++)
    b.part(new THREE.TorusGeometry(0.0062, 0.0016, 4, 8), STEEL, {
      at: [-0.058, 0.283 - i * 0.0105, 0],
      rotation: [0, i % 2 ? 90 : 0, 0],
      scale: [1, 1.5, 1],
    });
  b.part(new THREE.TorusGeometry(0.007, 0.0017, 4, 8), GILT, { at: [-0.058, 0.19, 0], rotation: [0, 90, 0] });
  b.part(cyl(0.026, 0.026, 0.006, 12), NAVY, { at: [-0.058, 0.163, 0], dir: [0, 0, 1], name: "medallion" });
  b.part(new THREE.TorusGeometry(0.026, 0.0025, 4, 12), GILT, { at: [-0.058, 0.163, 0] });
  for (const z of [1, -1]) face(LION, 0.044, 0.044, -0.058, 0.163, z * 0.0034);
  b.cards([frame([-0.058, 0.139, 0], [0, 1, 0])], FEATHER, { size: [0.036, 0.09], lean: 180, flow: [0, 0, 1], cross: true });

  // tassel on trigger guard
  b.part(sph(0.006), GOLD, { at: [0.09, 0.307, 0] });
  b.cards([frame([0.09, 0.304, 0], [0, 1, 0])], TASSEL, { size: [0.034, 0.09], lean: 180, flow: [0, 0, 1], cross: true });

  // ---------------------------------------------------------------- cylinder (ether chamber)
  const CY = 0.47;
  b.part(cyl(0.055, 0.055, 0.13, 6), BLUED, { at: [0, CY, 0], rotation: [0, 30, 0], flat: true, name: "cylinder" });
  for (const y of [0.412, 0.528]) {
    b.part(cyl(0.06, 0.06, 0.014, 6), GILT, { at: [0, y, 0], rotation: [0, 30, 0], flat: true, name: "cylRing" });
    for (const z of [1, -1]) face(TRIM, 0.06, 0.011, 0, y, z * 0.0524, GOLD_PALE);
  }
  for (let k = 0; k < 6; k++) {
    const a = k * 60;
    const ar = (a * Math.PI) / 180;
    const R = 0.0476 + 0.0005;
    glow(
      b.part(new THREE.BoxGeometry(0.012, 0.07, 0.006), CYAN, {
        at: [Math.sin(ar) * R, CY, Math.cos(ar) * R],
        rotation: [0, a, 0],
        name: "etherSlot",
      }),
      1.3,
    );
    const av = ((30 + a) * Math.PI) / 180;
    b.part(cyl(0.004, 0.004, 0.1, 4), GILT, { at: [Math.sin(av) * 0.055, CY, Math.cos(av) * 0.055] });
  }

  // blade collar
  b.part(new THREE.BoxGeometry(0.104, 0.016, 0.028), GILT, { at: [0.0025, 0.545, 0], name: "bladeCollar" });

  // ---------------------------------------------------------------- guard wings
  const WING_A: Pt[] = [
    [0, -0.012],
    [0.03, -0.012],
    [0.06, 0],
    [0.085, 0.03],
    [0.098, 0.07, "sharp"],
    [0.07, 0.055],
    [0.045, 0.04],
    [0, 0.035],
  ];
  const WING_B: Pt[] = [
    [0, 0.002],
    [0.03, 0],
    [0.055, 0.018],
    [0.07, 0.045, "sharp"],
    [0.05, 0.037],
    [0.03, 0.028],
    [0, 0.028],
  ];
  for (const s of [1, -1]) {
    b.extrude(WING_A, { at: [s * 0.05, 0.53, 0], x: [s, 0, 0], thickness: 0.018, bevel: 0.003, color: GILT, name: "wingGilt" });
    b.extrude(WING_B, { at: [s * 0.05, 0.533, 0], x: [s, 0, 0], thickness: 0.026, bevel: 0.004, color: SILVER, name: "wingSilver" });
    for (const z of [1, -1]) gem([s * 0.09, 0.553, z * 0.0135], [0, 0, z], 0.007);
  }

  // ---------------------------------------------------------------- blade
  const BY = 0.52;
  const BLADE_OUTLINE: Pt[] = [
    [-0.045, 0],
    [0.05, 0],
    [0.055, 0.45],
    [0.054, 0.62],
    [0.036, 0.76],
    [0.012, 0.82, "sharp"],
    [-0.022, 0.775],
    [-0.045, 0.69],
  ];
  b.extrude(BLADE_OUTLINE, { at: [0, BY, 0], x: [1, 0, 0], thickness: 0.016, bevel: 0.004, color: BLADE, name: "blade" });

  const FULLER_OUTLINE: Pt[] = [
    [-0.027, 0.19],
    [-0.009, 0.19],
    [-0.009, 0.58],
    [-0.018, 0.66, "sharp"],
    [-0.027, 0.58],
  ];
  b.extrude(FULLER_OUTLINE, { at: [0, BY, 0], x: [1, 0, 0], thickness: 0.0168, color: FULLER, name: "fuller" });
  for (const z of [1, -1]) {
    glow(face(RUNES, 0.022, 0.44, -0.018, 0.905, z * 0.0087), 1.3);
    face(ENGRAVE, 0.08, 0.104, 0.0025, 0.62, z * 0.0087);
  }

  // spine barrel
  b.rod([-0.044, 0.52, 0], [-0.044, 0.93, 0], 0.0125, { color: IRON, sides: 6, smooth: false, name: "barrel" });
  for (const y of [0.58, 0.7, 0.82]) b.part(cyl(0.0165, 0.0165, 0.012, 8), GILT, { at: [-0.044, y, 0] });
  for (const y of [0.64, 0.76, 0.875])
    for (const z of [1, -1])
      glow(b.part(new THREE.BoxGeometry(0.007, 0.04, 0.004), CYAN, { at: [-0.044, y, z * 0.0128] }), 1.3);
  b.part(cyl(0.0195, 0.0155, 0.028, 8), GILT, { at: [-0.044, 0.944, 0], name: "muzzle" });
  b.part(new THREE.CircleGeometry(0.0085, 8), BLACK, { at: [-0.044, 0.9585, 0], dir: [0, 1, 0], axis: "z" });
  b.extrude(
    [
      [0, 0],
      [0.012, 0],
      [0.006, 0.018, "sharp"],
    ],
    { at: [-0.05, 0.955, 0], x: [1, 0, 0], thickness: 0.004, color: STEEL, name: "sight" },
  );

  return b.root;
}
