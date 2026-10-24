import * as THREE from "three";
import { createBuilder, catmull, bezier, polyline, aim, paint, mix, smoothstep, noise, svg } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade: Lionheart",
  description:
    "A Final Fantasy style gunblade planted tip-down: a single-edged steel blade with glowing rune engravings, a revolver drum and barrel on the spine, a gold lion-mane guard with materia, a wrapped pistol grip, trigger loop, hammer and a lion pendant chain.",
};

type OP = [number, number] | [number, number, "sharp"];
const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------------------------------------------------------
// Drawings

function lionSvg(): string {
  const ring = (n: number, r0: number, r1: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const r = i % 2 ? r0 : r1;
      return `${(50 + r * Math.sin(a)).toFixed(1)},${(50 - r * Math.cos(a)).toFixed(1)}`;
    }).join(" ");
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${ring(28, 36, 49)}" fill="#e2a93a" stroke="#2a1806" stroke-width="3.5" stroke-linejoin="round"/>
    <polygon points="${ring(20, 30, 38)}" fill="#c98a24"/>
    <circle cx="31" cy="30" r="8" fill="#f3cf6a" stroke="#2a1806" stroke-width="3"/>
    <circle cx="69" cy="30" r="8" fill="#f3cf6a" stroke="#2a1806" stroke-width="3"/>
    <ellipse cx="50" cy="55" rx="22" ry="25" fill="#f7d98a" stroke="#2a1806" stroke-width="3.5"/>
    <path d="M33 44 L46 48 M67 44 L54 48" stroke="#2a1806" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M36 51 L45 53 L37 57Z M64 51 L55 53 L63 57Z" fill="#2a1806"/>
    <path d="M43 60 L57 60 L50 69Z" fill="#2a1806"/>
    <path d="M50 69 L50 74 M40 78 Q50 72 60 78" stroke="#2a1806" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`;
}

function drumSvg(): string {
  let holes = "";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = 50 + 28 * Math.sin(a);
    const y = 50 - 28 * Math.cos(a);
    holes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="#07080d" stroke="#c89a36" stroke-width="2.6"/>`;
    if (i % 2 === 0)
      holes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.6" fill="#d9a441" stroke="#7a5416" stroke-width="1.2"/>`;
    const b2 = a + Math.PI / 6;
    holes += `<path d="M${(50 + 40 * Math.sin(b2)).toFixed(1)} ${(50 - 40 * Math.cos(b2)).toFixed(1)} L${(50 + 46 * Math.sin(b2)).toFixed(1)} ${(50 - 46 * Math.cos(b2)).toFixed(1)}" stroke="#1d2336" stroke-width="2.4"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#5b6784" stroke="#e6b64e" stroke-width="4"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#2a3248" stroke-width="2"/>
    ${holes}
    <circle cx="50" cy="50" r="11" fill="#e6b64e" stroke="#2a1806" stroke-width="2"/>
    <path d="M50 42 L53 48 L58 50 L53 52 L50 58 L47 52 L42 50 L47 48Z" fill="#2a1806"/>
  </svg>`;
}

const RUNE = "#5fd3ff";
const RUNE_BACK = "#1b3a66";
const ENGRAVE = svg(
  `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">
    ${[
      [RUNE_BACK, 4.6],
      [RUNE, 2],
    ]
      .map(
        ([c, w]) => `<g fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 4 L20 116"/>
      <path d="M20 10 L31 21 L20 32 L9 21 Z"/>
      <path d="M20 38 L28 46 L20 54 L12 46 Z"/>
      <path d="M5 66 L20 78 L35 66"/>
      <path d="M5 78 L20 90 L35 78"/>
      <path d="M5 90 L20 102 L35 90"/>
      <path d="M6 58 L14 58 M26 58 L34 58"/>
    </g>`,
      )
      .join("")}
    <circle cx="20" cy="21" r="3.2" fill="${RUNE}"/>
    <circle cx="20" cy="46" r="2.4" fill="${RUNE}"/>
  </svg>`,
  { size: 320 },
);
const TRIM = svg(
  `<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="2" width="118" height="20" fill="#2a3248" stroke="#e6b64e" stroke-width="2.4"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M${4 + i * 11.5} 20 L${9.75 + i * 11.5} 5 L${15.5 + i * 11.5} 20Z" fill="#e6b64e" stroke="#2a1806" stroke-width="1.2" stroke-linejoin="round"/>`).join("")}
  </svg>`,
  { size: 384 },
);
const RUNE_STRIP = svg(
  `<svg viewBox="0 0 20 120" xmlns="http://www.w3.org/2000/svg">
    ${Array.from({ length: 7 }, (_, i) => `<path d="M4 ${6 + i * 16.5} L10 ${12 + i * 16.5} L16 ${6 + i * 16.5} M10 ${12 + i * 16.5} L10 ${18 + i * 16.5}" stroke="${RUNE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`).join("")}
  </svg>`,
  { size: 256 },
);
const LION = svg(lionSvg(), { size: 192 });
const DRUM = svg(drumSvg(), { size: 192 });

// ---------------------------------------------------------------------------------------------------------------
// Blade silhouette and paints

const BLADE: OP[] = [
  [0.06, 0, "sharp"],
  [0.035, 0.05],
  [0.0, 0.12],
  [-0.03, 0.22],
  [-0.05, 0.36],
  [-0.058, 0.55],
  [-0.058, 0.62],
  [-0.04, 0.655, "sharp"],
  [-0.058, 0.69],
  [-0.058, 0.87, "sharp"],
  [0.06, 0.87, "sharp"],
];
const EDGE_PTS = BLADE.slice(0, 10);
function edgeAt(y: number) {
  for (let i = 0; i < EDGE_PTS.length - 1; i++) {
    const [x0, y0] = EDGE_PTS[i];
    const [x1, y1] = EDGE_PTS[i + 1];
    if (y <= y1) return x0 + ((x1 - x0) * (y - y0)) / Math.max(y1 - y0, 1e-6);
  }
  return EDGE_PTS[EDGE_PTS.length - 1][0];
}

const BLADE_PAINT = paint((p, n, s) => {
  const [x, y] = s;
  const d = x - edgeAt(y);
  if (Math.abs(n.z) < 0.45) return "#eef3fb";
  if (d < 0.011) return mix("#ffffff", "#dde7f6", d / 0.011);
  const t = Math.min(1, d / 0.12);
  let c = mix("#cfdaec", "#6f82a6", t * t);
  if (x > 0.032 && x < 0.04 && y > 0.08 && y < 0.82) c = mix(c, "#3f5078", 0.7);
  if (x > 0.04 && x < 0.043 && y > 0.08 && y < 0.82) c = mix(c, "#ffffff", 0.5);
  c = mix(c, "#46567a", smoothstep(0.046, 0.06, x) * 0.6);
  c = mix(c, "#ffffff", 0.2 * smoothstep(0.55, 0.85, noise(p, 0.05, 3)));
  c = mix(c, "#8fb1e8", 0.3 * smoothstep(0.3, 0.0, y));
  return c;
});

const GOLD = metal("gilt", { tarnish: 0.15, polish: 0.5 });
const BRASS = metal("brass");
const BLUED = metal("blued", { polish: 0.5 });
const IRON = metal("iron", { polish: 0.45 });
const STEEL = metal("steel");
const WRAP = paint((_p, _n, s) => (fract(s[0] * 30 + s[1] / 360) < 0.55 ? "#1c2338" : "#33426b"));
const BLACK = "#06070c";

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const part = (geo: THREE.BufferGeometry, color: any, at: number[], o: Record<string, any> = {}) =>
    b.part(geo, color, { at, ...o });

  // ---- Blade -----------------------------------------------------------------------------------------------
  b.extrude(BLADE, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.004,
    color: BLADE_PAINT,
    name: "blade",
  });
  // engraved runes and trim, both faces
  for (const s of [1, -1]) {
    const dir: [number, number, number] = [0, 0, s];
    glow(
      b.part(new THREE.PlaneGeometry(0.04, 0.12), "#ffffff", {
        at: [-0.008, 0.66, s * 0.0078],
        dir,
        axis: "z",
        texture: ENGRAVE,
      }),
      1.3,
    );
    b.part(new THREE.PlaneGeometry(0.1, 0.02), "#ffffff", {
      at: [0.001, 0.79, s * 0.0078],
      dir,
      axis: "z",
      texture: TRIM,
    });
  }
  // spine strip below the barrel
  part(new THREE.BoxGeometry(0.012, 0.27, 0.02), IRON, [0.062, 0.165, 0]);

  // ---- Barrel along the spine ------------------------------------------------------------------------------
  const BX = 0.076;
  const barrel = b.rod([BX, 0.3, 0], [BX, 0.88, 0], 0.016, IRON, { name: "barrel" });
  for (const y of [0.38, 0.62, 0.76]) part(new THREE.CylinderGeometry(0.0195, 0.0195, 0.012, 10), GOLD, [BX, y, 0]);
  part(new THREE.CylinderGeometry(0.018, 0.0225, 0.03, 8), GOLD, [BX, 0.298, 0]);
  part(new THREE.CircleGeometry(0.0115, 8), BLACK, [BX, 0.2825, 0], { dir: [0, -1, 0], axis: "z" });
  part(new THREE.BoxGeometry(0.008, 0.024, 0.01), BLUED, [BX + 0.019, 0.345, 0]);
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) part(new THREE.BoxGeometry(0.014, 0.014, 0.004), BLACK, [BX, 0.44 + i * 0.03, s * 0.0158]);
  glow(
    b.decal(barrel, RUNE_STRIP, {
      at: [BX, 0.692, 0.016],
      dir: [0, 0, 1],
      size: [0.016, 0.11],
    }),
    1.2,
  );

  // ---- Hilt frame --------------------------------------------------------------------------------------------
  part(new THREE.BoxGeometry(0.13, 0.024, 0.028), GOLD, [0, 0.828, 0]);
  part(new THREE.BoxGeometry(0.14, 0.16, 0.026), BLUED, [0.025, 0.92, 0]);
  const PLATE: OP[] = [
    [0.095, 0.84],
    [0.095, 0.985],
    [0.055, 1.015],
    [-0.03, 1.015],
    [-0.06, 0.99],
    [-0.1, 0.95],
    [-0.14, 0.87, "sharp"],
    [-0.075, 0.885],
    [-0.04, 0.84],
  ];
  // gold mane spur between the plates
  const SPUR: OP[] = [
    [-0.05, 0.98],
    [-0.15, 0.955],
    [-0.22, 0.84, "sharp"],
    [-0.12, 0.855],
    [-0.06, 0.9],
  ];
  b.extrude(SPUR, { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.002, color: GOLD });
  const rivets: [number, number][] = [
    [0.08, 0.86],
    [0.08, 0.975],
    [-0.01, 0.995],
    [0.04, 0.995],
    [-0.02, 0.857],
  ];
  for (const s of [1, -1]) {
    b.extrude(PLATE, {
      at: [0, 0, s * 0.0175],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.01,
      bevel: 0.002,
      color: BLUED,
    });
    b.sweep(
      polyline(PLATE.map(([x, y]) => [x, y, s * 0.0226]), { closed: true }),
      0.0032,
      { color: GOLD },
    );
    for (const [x, y] of rivets) part(new THREE.SphereGeometry(0.0045, 6, 4), GOLD, [x, y, s * 0.0235]);
    b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
      at: [-0.07, 0.918, s * 0.0238],
      dir: [0, 0, s],
      axis: "z",
      texture: LION,
    });
    // materia in a gold socket
    glow(part(new THREE.IcosahedronGeometry(0.0125, 1), "#4fc3ff", [0.075, 0.955, s * 0.0238], { flat: true }), 1.4);
    part(new THREE.TorusGeometry(0.0155, 0.003, 5, 10), GOLD, [0.075, 0.955, s * 0.0238]);
  }

  // ---- Revolver drum ---------------------------------------------------------------------------------------
  const DC = [0.015, 0.925, 0];
  part(new THREE.CylinderGeometry(0.042, 0.042, 0.07, 12), STEEL, DC, { dir: [0, 0, 1], flat: true });
  part(new THREE.CylinderGeometry(0.0445, 0.0445, 0.012, 12), GOLD, DC, { dir: [0, 0, 1], flat: true });
  part(new THREE.CylinderGeometry(0.011, 0.011, 0.082, 8), GOLD, DC, { dir: [0, 0, 1] });
  for (const s of [1, -1])
    b.part(new THREE.CircleGeometry(0.0415, 24), "#ffffff", {
      at: [DC[0], DC[1], s * 0.0357],
      dir: [0, 0, s],
      axis: "z",
      texture: DRUM,
    });

  // ---- Hammer ------------------------------------------------------------------------------------------------
  const HAMMER: [number, number][] = [
    [0.012, 0],
    [-0.018, 0],
    [-0.03, 0.02],
    [-0.038, 0.045],
    [-0.026, 0.052],
    [-0.012, 0.03],
    [0.004, 0.012],
  ];
  b.extrude(HAMMER, { at: [-0.01, 0.995, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.011, bevel: 0.002, color: GOLD });

  // ---- Grip --------------------------------------------------------------------------------------------------
  const gripPath = catmull([
    [0.02, 0.99, 0],
    [0.016, 1.1, 0],
    [0.003, 1.2, 0],
    [-0.012, 1.295, 0],
  ]);
  b.sweep(gripPath, [0.021, 0.018], { color: WRAP, caps: "flat", name: "grip" });
  for (const [t, r] of [
    [0.05, 0.0255],
    [0.96, 0.0225],
  ] as [number, number][])
    b.part(new THREE.CylinderGeometry(r, r, 0.016, 10), GOLD, { at: gripPath.at(t), dir: gripPath.tangentAt(t) });
  // trigger loop and trigger
  b.sweep(
    catmull([
      [0.092, 0.995, 0],
      [0.142, 1.03, 0],
      [0.148, 1.085, 0],
      [0.11, 1.125, 0],
      [0.036, 1.145, 0],
    ]),
    0.0045,
    { color: GOLD, name: "triggerGuard" },
  );
  b.sweep(bezier([0.07, 1.125, 0], [0.075, 1.07, 0], [0.108, 1.04, 0]), [0.008, 0.003], { color: IRON, name: "trigger" });

  // ---- Pommel, gem, ring ------------------------------------------------------------------------------------
  const e = gripPath.at(1).clone();
  const ed = gripPath.tangentAt(1).clone().normalize();
  const POMMEL: [number, number][] = [
    [0, 0],
    [0.022, 0],
    [0.03, 0.012],
    [0.034, 0.03],
    [0.03, 0.048],
    [0.018, 0.062],
    [0.008, 0.068],
    [0, 0.068],
  ];
  b.lathe(POMMEL, { at: e.clone().addScaledVector(ed, -0.004), axis: ed, segments: 8, color: GOLD, name: "pommel" });
  glow(part(new THREE.IcosahedronGeometry(0.011, 1), "#6df0ff", [e.x, e.y + 0.03, e.z + 0.032], { flat: true }), 1.4);
  const R = e.clone().addScaledVector(ed, 0.078);
  part(new THREE.TorusGeometry(0.012, 0.0035, 5, 10), GOLD, [R.x, R.y, R.z]);

  // ---- Chain and lion pendant ------------------------------------------------------------------------------
  const offsets: [number, number, number][] = [
    [0, -0.012, 0],
    [-0.012, -0.035, 0.025],
    [-0.04, -0.085, 0.055],
    [-0.06, -0.16, 0.06],
    [-0.062, -0.24, 0.058],
  ];
  const chainPath = catmull(offsets.map((o) => R.clone().add(new THREE.Vector3(...o))));
  const yAxis = new THREE.Vector3(0, 1, 0);
  const LINKS = 22;
  for (let i = 0; i < LINKS; i++) {
    const t = (i + 0.5) / LINKS;
    const q = aim(chainPath.tangentAt(t)).multiply(
      new THREE.Quaternion().setFromAxisAngle(yAxis, i % 2 ? Math.PI / 2 : 0),
    );
    b.part(new THREE.TorusGeometry(0.0055, 0.0016, 4, 8), GOLD, { at: chainPath.at(t), quat: q, scale: [0.85, 1.5, 1] });
  }
  const end = chainPath.at(1);
  const pen = [end.x, end.y - 0.032, end.z];
  part(new THREE.TorusGeometry(0.007, 0.002, 4, 8), GOLD, [end.x, end.y - 0.004, end.z]);
  part(new THREE.CylinderGeometry(0.026, 0.026, 0.008, 14), BLUED, pen, { dir: [0, 0, 1] });
  part(new THREE.TorusGeometry(0.0265, 0.0032, 5, 14), GOLD, pen);
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.04, 0.04), "#ffffff", {
      at: [pen[0], pen[1], pen[2] + s * 0.0045],
      dir: [0, 0, s],
      axis: "z",
      texture: LION,
    });

  // BRASS reserved for small accents: pin through the drum hub
  part(new THREE.CylinderGeometry(0.004, 0.004, 0.09, 6), BRASS, [DC[0], DC[1], 0], { dir: [0, 0, 1] });

  return b.root;
}
