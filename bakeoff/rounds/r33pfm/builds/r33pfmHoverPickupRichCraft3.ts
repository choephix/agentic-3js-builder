import * as THREE from "three";
import { createBuilder, catmull, polyline, paint, noise, mix, smoothstep, stripes, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Hover Guard Pickup",
  description:
    "Militarized pickup converted to hover thrusters: four ducted fan pods, roof gun turret, bed missile racks, plow bumper and neon trim. Low-poly cyberpunk.",
};

// ---------- palette ----------
const NEON_C = "#2ff3ff";
const NEON_M = "#ff2bd6";
const NEON_Y = "#ffd62b";
const RED = "#ff2b3a";
const STEEL = "#4a5368";
const DARK = "#12141d";
const GUN = "#2a2f3d";
const GLASS = "#0f3f58";
const COPPER = "#b5683a";
const WHITE = "#e8f1ff";

// ---------- textures ----------
const GRILLE = svg(
  `<svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="98" height="28" rx="4" fill="#0c0e15" stroke="#2ff3ff" stroke-width="1.6"/>
  ${[6, 11, 16, 21, 26].map((y) => `<path d="M6 ${y} H94" stroke="#2b3c55" stroke-width="2.4"/>`).join("")}
  <path d="M50 3 L64 15 L50 27 L36 15Z" fill="#14091f" stroke="#ff2bd6" stroke-width="2"/>
  <path d="M50 8 L58 15 L50 22 L42 15Z" fill="#ff2bd6"/>
  <path d="M8 4 L18 4 M82 4 L92 4" stroke="#ffd62b" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const DOOR = svg(
  `<svg viewBox="0 0 150 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 6 H142 V54 H8Z" fill="none" stroke="#0a0c12" stroke-width="1.6"/>
  <rect x="112" y="14" width="20" height="4" rx="2" fill="#0a0c12"/>
  <path d="M14 46 L40 46 L48 38 L22 38Z" fill="#ffd62b"/>
  <path d="M26 46 L52 46 L60 38 L34 38Z" fill="#0a0c12" opacity="0.0"/>
  <path d="M52 46 L78 46 L86 38 L60 38Z" fill="#ff2bd6"/>
  <text x="18" y="30" font-family="monospace" font-weight="bold" font-size="22" fill="#e8f1ff" stroke="#0a0c12" stroke-width="1">07</text>
  <text x="62" y="26" font-family="monospace" font-weight="bold" font-size="9" fill="#2ff3ff">HVR-9 GUARD</text>
  <text x="62" y="35" font-family="monospace" font-size="6" fill="#e8f1ff">SECTOR 4 // NEON DIST.</text>
  <circle cx="122" cy="40" r="9" fill="#12141d" stroke="#2ff3ff" stroke-width="1.6"/>
  <path d="M122 33 L127 42 L117 42Z" fill="#ff2bd6"/>
  </svg>`,
  { size: 512 },
);

const HOOD = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="94" height="94" rx="6" fill="none" stroke="#0a0c12" stroke-width="2"/>
  <path d="M10 92 L50 55 L90 92 L90 80 L50 43 L10 80Z" fill="#ffd62b"/>
  <path d="M10 70 L50 33 L90 70 L90 58 L50 21 L10 58Z" fill="#ff2bd6"/>
  <circle cx="50" cy="14" r="8" fill="#12141d" stroke="#2ff3ff" stroke-width="2"/>
  <path d="M46 14 H54 M50 10 V18" stroke="#2ff3ff" stroke-width="1.6"/>
  </svg>`,
  { size: 256 },
);

const FAN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="#06222e"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315]
    .map(
      (a) =>
        `<path transform="rotate(${a} 50 50)" d="M50 50 L44 8 Q56 4 62 14 Z" fill="#2ff3ff" stroke="#e8ffff" stroke-width="1"/>`,
    )
    .join("")}
  <circle cx="50" cy="50" r="12" fill="#ff2bd6" stroke="#ffffff" stroke-width="2"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#9ffcff" stroke-width="2.5"/>
  </svg>`,
  { size: 256 },
);

const PLATE = svg(
  `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="58" height="28" rx="3" fill="#e8f1ff" stroke="#12141d" stroke-width="2"/>
  <rect x="3" y="3" width="54" height="7" fill="#2b3cff"/>
  <text x="30" y="9" text-anchor="middle" font-family="monospace" font-size="6" fill="#fff">NEO TOKYO</text>
  <text x="30" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#12141d">N1T-077</text>
  </svg>`,
  { size: 256 },
);

const TUBES = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="40" fill="#1a1d28"/>
  ${[0, 1, 2]
    .flatMap((i) =>
      [0, 1].map(
        (j) =>
          `<circle cx="${10 + i * 20}" cy="${10 + j * 20}" r="8" fill="#050608" stroke="#ffd62b" stroke-width="2"/><circle cx="${10 + i * 20}" cy="${10 + j * 20}" r="3.5" fill="#ff2b3a"/>`,
      ),
    )
    .join("")}
  </svg>`,
  { size: 256 },
);

// ---------- paints ----------
const BODY = paint((p, n) => {
  let c = mix("#27304a", "#3a4a6c", noise(p, 0.7, 3));
  c = mix(c, "#0a0c14", smoothstep(0.2, -0.9, n.y) * 0.5);
  c = mix(c, "#6a7fa8", smoothstep(0.6, 1, n.y) * 0.3);
  if (p.y < 0.85) c = mix(c, "#0c0d12", 0.35);
  // plating seams on the dominant face
  const ax = Math.abs(n.x), ay = Math.abs(n.y);
  const u = ax > ay && ax > Math.abs(n.z) ? p.z : p.x;
  const v = ay > ax && ay > Math.abs(n.z) ? p.z : p.y;
  const du = ((u / 0.55) % 1 + 1) % 1;
  const dv = ((v / 0.4) % 1 + 1) % 1;
  if (du * 0.55 < 0.01 || dv * 0.4 < 0.01) c = mix(c, "#07080d", 0.85);
  else if (du * 0.55 < 0.02 || dv * 0.4 < 0.02) c = mix(c, "#8fa4cc", 0.18);
  // magenta side stripe
  if (ax > 0.6 && Math.abs(p.y - 0.78) < 0.035) c = mix(c, "#ff2bd6", 0.95);
  // scuffs
  if (noise(p, 0.06, 9) > 0.8) c = mix(c, "#8795b3", 0.5);
  return c;
});
const POD = metal("iron", { tarnish: 0.5, polish: 0.2 });
const ARMOR = metal("blued", { tarnish: 0.3 });
const HAZARD = stripes("#ffd62b", "#14151b", { size: 0.14, axis: [1, 0, 1], width: 0.55, wobble: 0 });

export default function build() {
  const b = createBuilder({ name: "hover_pickup", paintSize: 2048 });

  const box = (w: number, h: number, d: number, at: number[], color: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: rot as any, flat: true });
  const cyl = (r: number, h: number, seg: number, at: number[], color: any, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at: at as any, rotation: rot as any, flat: true });
  const gbox = (w: number, h: number, d: number, at: number[], color: string, s = 1.2, rot?: number[]) =>
    glow(box(w, h, d, at, color, rot), s);
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: at as any, dir: dir as any, up: up as any, axis: "z", texture: tex });
  const sides = (fn: (s: number) => void) => [1, -1].forEach(fn);

  // ---------- body ----------
  b.extrude(
    [
      [-2.6, 0.55], [2.6, 0.55], [2.7, 0.8], [2.6, 1.15], [1.0, 1.25], [-2.55, 1.25], [-2.65, 0.9],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.02, color: BODY },
  );
  // cab
  b.extrude(
    [[-0.85, 1.25], [1.0, 1.25], [0.45, 1.9], [-0.8, 1.92]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.76, bevel: 0.02, color: BODY },
  );
  // side glass
  b.extrude(
    [[-0.68, 1.4], [0.78, 1.4], [0.38, 1.8], [-0.62, 1.83]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, color: GLASS },
  );
  // pillar between windows
  sides((s) => box(0.12, 0.45, 0.06, [s * 0.9, 1.62, 0.05], BODY));
  // windshield + rear window
  box(1.55, 0.03, 0.88, [0, 1.6, 0.74], GLASS, [40, 0, 0]);
  box(1.4, 0.4, 0.03, [0, 1.62, -0.83], GLASS);
  glow(box(1.3, 0.03, 0.03, [0, 1.84, -0.84], NEON_C), 1.4);

  // hood details
  decal(HOOD, 1.2, 1.3, [0, 1.215, 1.75], [0, 1, 0.06], [0, 0, 1]);
  b.part(new THREE.BoxGeometry(0.6, 0.1, 0.5), STEEL, { at: [0, 1.31, 1.05], flat: true });
  sides((s) => glow(box(0.05, 0.02, 0.5, [s * 0.5, 1.22, 1.9], NEON_M, 1.3)));
  sides((s) => box(0.05, 0.03, 0.03, [s * 0.5, 1.9, 0.7], STEEL));

  // front fascia
  decal(GRILLE, 1.0, 0.3, [0, 0.97, 2.665], [0, 0.27, 0.96]);
  sides((s) => {
    gbox(0.34, 0.14, 0.05, [s * 0.68, 1.0, 2.66], WHITE, 1.6, [-15, 0, 0]);
    gbox(0.1, 0.08, 0.05, [s * 0.9, 0.9, 2.68], NEON_M, 1.3);
  });
  // bumper + plow
  b.part(new THREE.BoxGeometry(2.05, 0.3, 0.25), HAZARD, { at: [0, 0.72, 2.75], flat: true });
  b.frustumBox([0, 0.7, 2.85], [0, 0.7, 3.2], [2.0, 0.34], [1.3, 0.16], { color: ARMOR });
  sides((s) => box(0.1, 0.4, 0.4, [s * 0.8, 0.9, 2.82], STEEL));
  gbox(0.8, 0.03, 0.03, [0, 0.58, 3.12], NEON_C);
  // winch
  cyl(0.07, 0.4, 8, [0, 0.68, 2.9], GUN, [0, 0, 90]);

  // ---------- rear ----------
  decal(PLATE, 0.5, 0.25, [0, 1.0, -2.68], [0, 0, -1]);
  gbox(1.6, 0.1, 0.04, [0, 1.12, -2.67], RED, 1.4);
  sides((s) => {
    cyl(0.17, 0.3, 8, [s * 0.65, 0.82, -2.75], DARK, [90, 0, 0]);
    glow(
      b.part(new THREE.CircleGeometry(0.13, 8), NEON_Y, { at: [s * 0.65, 0.82, -2.9], dir: [0, 0, -1], axis: "z" }),
      1.5,
    );
  });
  box(1.9, 0.3, 0.1, [0, 1.4, -2.6], ARMOR); // tailgate
  glow(box(1.7, 0.03, 0.03, [0, 1.56, -2.6], NEON_C), 1.4);

  // ---------- bed ----------
  sides((s) => {
    b.part(new THREE.BoxGeometry(0.1, 0.32, 1.75), BODY, { at: [s * 0.9, 1.41, -1.72], flat: true });
    glow(box(0.03, 0.03, 1.7, [s * 0.9, 1.58, -1.72], NEON_C), 1.3);
  });
  box(1.75, 0.3, 0.1, [0, 1.4, -0.95], ARMOR);
  // roll bar
  b.sweep(polyline([[0.82, 1.3, -1.05], [0.82, 2.05, -1.05], [-0.82, 2.05, -1.05], [-0.82, 1.3, -1.05]]), 0.04, {
    color: GUN,
    sides: 6,
  });
  // battery core
  box(0.5, 0.3, 0.9, [0, 1.4, -1.85], GUN);
  [-1.55, -1.85, -2.15].forEach((z) => {
    glow(cyl(0.075, 0.3, 6, [0, 1.7, z], NEON_C), 1.6);
    cyl(0.1, 0.04, 6, [0, 1.56, z], STEEL);
  });
  // missile racks
  sides((s) => {
    const c = new THREE.Vector3(s * 0.65, 1.62, -1.9);
    const zp = new THREE.Vector3(0, 0.5, 0.866);
    b.part(new THREE.BoxGeometry(0.46, 0.4, 0.9), ARMOR, { at: c.toArray() as any, rotation: [-30, 0, 0], flat: true });
    const f = c.clone().addScaledVector(zp, 0.456);
    decal(TUBES, 0.4, 0.34, f.toArray(), zp.toArray());
    box(0.12, 0.35, 0.12, [s * 0.65, 1.42, -2.2], GUN);
    gbox(0.04, 0.04, 0.5, [s * 0.4, 1.75, -1.9], NEON_M, 1.2, [-30, 0, 0]);
  });

  // ---------- roof ----------
  // light bar
  box(1.3, 0.1, 0.22, [0, 2.0, 0.05], DARK);
  glow(box(0.6, 0.07, 0.24, [0.32, 2.02, 0.05], NEON_M), 1.8);
  glow(box(0.6, 0.07, 0.24, [-0.32, 2.02, 0.05], NEON_C), 1.8);
  // turret
  cyl(0.22, 0.18, 8, [0, 2.1, -0.45], GUN);
  box(0.56, 0.3, 0.62, [0, 2.32, -0.45], ARMOR);
  box(0.4, 0.14, 0.5, [0, 2.12, -0.45], STEEL);
  sides((s) => {
    b.rod([s * 0.14, 2.32, -0.2], [s * 0.14, 2.32, 0.85], 0.035, GUN, { sides: 6 });
    box(0.1, 0.1, 0.16, [s * 0.14, 2.32, 0.88], STEEL);
    box(0.11, 0.2, 0.3, [s * 0.34, 2.34, -0.45], GUN);
  });
  box(0.4, 0.14, 0.4, [0, 2.32, 0.05], GUN);
  glow(box(0.1, 0.07, 0.04, [0, 2.4, -0.13], NEON_M), 2);
  // antennas + dish
  sides((s) => {
    b.rod([s * 0.6, 1.95, -0.65], [s * 0.7, 2.75, -0.7], 0.012, STEEL, { sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), s > 0 ? NEON_M : NEON_C, { at: [s * 0.7, 2.77, -0.7] }), 2);
  });
  b.lathe([[0, 0], [0.2, 0.06], [0.22, 0.08], [0, 0.03]], { at: [0.0, 2.2, -0.75], axis: [0, 0.8, -0.6], color: STEEL, segments: 8 });
  // mirrors
  sides((s) => {
    box(0.18, 0.04, 0.04, [s * 1.0, 1.55, 0.5], GUN);
    box(0.06, 0.2, 0.14, [s * 1.1, 1.55, 0.5], ARMOR);
    glow(box(0.02, 0.14, 0.1, [s * 1.1 + s * 0.035, 1.55, 0.5], NEON_C), 1);
  });

  // ---------- doors ----------
  sides((s) => {
    decal(DOOR, 1.5, 0.6, [s * 0.955, 0.95, 0.12], [s, 0, 0]);
    // skirt
    box(0.1, 0.22, 2.3, [s * 0.99, 0.68, 0.0], ARMOR);
    gbox(0.03, 0.04, 4.5, [s * 0.97, 0.52, 0], NEON_C, 1.3);
    // door handles
    box(0.04, 0.04, 0.16, [s * 0.96, 1.18, -0.2], STEEL);
  });

  // ---------- hover pods ----------
  const podX = 1.3;
  const podZ = 1.65;
  [1, -1].forEach((sx) =>
    [1, -1].forEach((sz) => {
      const x = sx * podX, z = sz * podZ;
      // outer duct shell
      b.lathe(
        [[0.4, 0], [0.52, 0.28], [0.47, 0.62], [0.3, 0.64], [0.34, 0.3], [0.3, 0.04]],
        { at: [x, 0, z], color: POD, segments: 8 },
      );
      // intake fan on top-less underside disc
      glow(b.part(new THREE.CircleGeometry(0.31, 8), "#ffffff", { at: [x, 0.1, z], dir: [0, -1, 0], axis: "z", texture: FAN }), 1.4);
      glow(b.part(new THREE.TorusGeometry(0.34, 0.025, 4, 10), NEON_M, { at: [x, 0.03, z], rotation: [90, 0, 0] }), 1.6);
      cyl(0.16, 0.12, 8, [x, 0.66, z], GUN);
      // fins on rim
      [0, 90, 180, 270].forEach((a) => {
        const r = (a * Math.PI) / 180;
        box(0.05, 0.28, 0.14, [x + Math.cos(r) * 0.5, 0.35, z + Math.sin(r) * 0.5], ARMOR, [0, -a, 0]);
      });
      // arm to body
      box(0.6, 0.18, 0.55, [sx * 1.1, 0.66, z], ARMOR);
      box(0.5, 0.06, 0.4, [sx * 1.1, 0.77, z], STEEL);
      glow(box(0.04, 0.04, 0.4, [sx * 1.3 + sx * 0.0, 0.76, z + sz * 0.0], NEON_Y), 1.2).position;
      // coolant pipe from body to pod
      b.sweep(
        catmull([[sx * 0.9, 0.95, z * 0.8], [sx * 1.05, 0.9, z * 0.9], [sx * 1.2, 0.74, z]]),
        0.035,
        { color: COPPER, sides: 6 },
      );
    }),
  );

  // underbody
  box(1.6, 0.1, 4.8, [0, 0.52, 0], DARK);
  box(0.5, 0.08, 1.4, [0, 0.46, 0.8], GUN);
  glow(box(0.4, 0.03, 1.2, [0, 0.4, 0.8], NEON_M), 1.2);

  return b.root;
}
