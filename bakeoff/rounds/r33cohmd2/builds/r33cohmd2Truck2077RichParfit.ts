import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, noise, smoothstep, mix } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Warhound 77 Armored Truck",
  "description": "A low-poly cyberpunk militarized 6x6 truck from 2077 with armored cab, roof turret railgun, neon underglow and a modular cargo bed."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a414d",
  hullDark: "#22262e",
  hullLight: "#5b6574",
  trim: "#e7b814",
  black: "#0d0e12",
  rubber: "#16171b",
  steel: "#8a93a3",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb5",
  neonRed: "#ff3b30",
  glass: "#0f2a3a",
  lampWhite: "#fff4c8",
  olive: "#4d5a3c",
  rust: "#8a4a2a",
  ammo: "#b8a24a",
};
const M = {
  frameTop: [0, 1.2, 0] as [number, number, number],
  cabFloor: [0, 1.2, 1.9] as [number, number, number],
  hoodFront: [0, 1.5, 3.5] as [number, number, number],
  cabRoof: [0, 2.6, 1.7] as [number, number, number],
  turretRing: [0, 2.62, 0.55] as [number, number, number],
  bedFloor: [0, 1.2, -1.5] as [number, number, number],
  rearDeck: [0, 1.2, -3.8] as [number, number, number],
  axleFront: [0, 0.62, 2.6] as [number, number, number],
  axleMid: [0, 0.62, -0.6] as [number, number, number],
  axleRear: [0, 0.62, -2.9] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(77);

  // ---------- paints & textures ----------
  const IRON = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.22, rivets: 0.06 });
  const FRAME = paint((p, n) => {
    const base = mix(P.hullDark, P.hull, noise(p, 0.3, 2));
    const grime = smoothstep(0.1, -0.9, n.y) * 0.4;
    return mix(base, P.black, grime);
  });
  const SKIRT = panelled(P.hull, { size: 0.5, aspect: 0.5, rivets: 0.07 });
  const STEEL = metal("steel", { tarnish: 0.4 });
  const SPRING = metal("blued", { tarnish: 0.5 });
  const RUBBERISH = paint((p) => mix(P.rubber, P.hullDark, noise(p, 0.1, 5)));

  const chevron = svg(
    `<svg viewBox="0 0 128 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="24" fill="#0d0e12"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 16 - 6} 24 L${i * 16 + 4} 12 L${i * 16 - 6} 0 L${i * 16 + 4} 0 L${i * 16 + 14} 12 L${i * 16 + 4} 24Z" fill="#e7b814"/>`).join("")}
      <rect width="128" height="24" fill="none" stroke="#0d0e12" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="32" fill="#e7b814" stroke="#0d0e12" stroke-width="3"/>
      <path d="M12 26 L22 6 L32 26Z" fill="none" stroke="#0d0e12" stroke-width="3" stroke-linejoin="round"/>
      <rect x="21" y="12" width="2" height="7" fill="#0d0e12"/><rect x="21" y="21" width="2" height="2" fill="#0d0e12"/>
      <path d="M38 10h18M38 16h14M38 22h18" stroke="#0d0e12" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...extra });
  const cyl = (r0: number, r1: number, len: number, seg: number, color: any, at: number[], dir: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, seg), color, { bone: body, at, dir, ...extra });
  const bolt = (at: number[], dir: number[], r = 0.03) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.02, 6), P.steel, { bone: body, at, dir });

  const axleZ = [M.axleFront[2], M.axleMid[2], M.axleRear[2]];
  const AY = 0.62;

  // ---------- ladder frame rails ----------
  for (const s of [1, -1]) {
    box(0.22, 0.34, 7.4, FRAME, [s * 0.55, 1.0, -0.15]);
    // flanges
    box(0.34, 0.06, 7.4, P.hullDark, [s * 0.55, 1.19, -0.15]);
    box(0.34, 0.06, 7.4, P.hullDark, [s * 0.55, 0.83, -0.15]);
    // lightening holes drawn as dark inserts
    for (let i = 0; i < 12; i++) {
      const z = -3.3 + i * 0.58;
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), P.black, {
        bone: body,
        at: [s * 0.665, 1.0, z],
        dir: [s, 0, 0],
      });
    }
    // rivets on rail
    for (let i = 0; i < 14; i++) bolt([s * 0.665, 1.12, -3.5 + i * 0.52], [s, 0, 0], 0.022);
  }
  // cross-members
  const crossZ = [-3.7, -2.2, -1.2, 0.2, 1.3, 2.0, 3.3];
  for (const z of crossZ) {
    box(1.2, 0.2, 0.18, P.hullDark, [0, 0.98, z]);
    box(1.2, 0.05, 0.28, P.hull, [0, 0.86, z]);
  }
  // front tow bar / rear tow hitch
  box(0.8, 0.16, 0.25, P.hullDark, [0, 0.9, 3.5]);
  box(0.3, 0.16, 0.3, P.steel, [0, 0.9, -3.85]);

  // ---------- axles, differentials, suspension ----------
  axleZ.forEach((z, k) => {
    cyl(0.07, 0.07, 2.6, 8, STEEL, [0, AY, z], [1, 0, 0]);
    // differential: lathe pumpkin
    b.lathe(
      [
        [0, -0.2],
        [0.14, -0.18],
        [0.28, -0.05],
        [0.26, 0.1],
        [0.12, 0.2],
        [0, 0.2],
      ],
      { at: [0, AY, z], axis: [0, 0, 1], segments: 8, bone: body, color: STEEL, smoothing: 1 },
    );
    cyl(0.12, 0.12, 0.08, 8, P.hullDark, [0, AY, z + (k === 0 ? 0.22 : -0.22)], [0, 0, 1]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      bolt([Math.cos(a) * 0.17, AY + Math.sin(a) * 0.17, z + 0.2], [0, 0, 1], 0.016);
    }
    for (const s of [1, -1]) {
      // leaf springs: stacked flat bars
      for (let l = 0; l < 4; l++) {
        const len = 1.1 - l * 0.18;
        box(0.12, 0.025, len, SPRING, [s * 0.75, AY + 0.12 + l * 0.032, z]);
      }
      box(0.14, 0.07, 0.12, P.hullDark, [s * 0.75, AY + 0.28, z - 0.3]);
      box(0.14, 0.07, 0.12, P.hullDark, [s * 0.75, AY + 0.28, z + 0.3]);
      // U-bolt clamp
      box(0.17, 0.05, 0.09, P.steel, [s * 0.75, AY + 0.07, z]);
      // shock absorber (angled)
      b.rod([s * 0.95, AY + 0.1, z + 0.28], [s * 0.82, 1.05, z + 0.22], 0.035, P.black, { bone: body });
      b.rod([s * 0.9, AY + 0.35, z + 0.26], [s * 0.82, 1.05, z + 0.22], 0.022, P.steel, { bone: body });
      b.rod([s * 0.95, AY + 0.1, z + 0.28], [s * 0.93, AY + 0.35, z + 0.27], 0.045, P.hullDark, { bone: body });
      // brake line / spring coil accent
      b.part(new THREE.TorusGeometry(0.045, 0.012, 4, 6), P.neonMagenta, {
        bone: body,
        at: [s * 0.95, AY + 0.22, z + 0.28],
        dir: [0, 1, 0],
      });
    }
  });

  // ---------- drive shafts ----------
  const shaftSegs = [
    [2.6, 1.0],
    [0.9, -0.1],
    [-1.4, -1.8],
  ];
  b.rod([0, AY + 0.12, 2.6], [0, 0.78, 1.0], 0.05, P.steel, { bone: body });
  b.rod([0, 0.78, 1.0], [0, AY + 0.12, -0.55], 0.05, P.steel, { bone: body });
  b.rod([0, AY + 0.12, -0.65], [0, AY + 0.12, -2.85], 0.05, P.steel, { bone: body });
  void shaftSegs;
  for (const z of [1.0, -0.1, -1.7]) {
    b.part(new THREE.SphereGeometry(0.09, 6, 4), P.steel, { bone: body, at: [0, 0.78 - (z < 0 ? 0.12 : 0), z] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), P.trim, { bone: body, at: [0, z > 0.5 ? 0.78 : AY + 0.12, z], dir: [0, 0, 1] });
  }
  // gearbox & transfer case
  box(0.5, 0.4, 0.8, IRON, [0, 0.8, 1.4]);
  box(0.4, 0.3, 0.5, IRON, [0, 0.78, 0.3]);

  // ---------- fuel tanks ----------
  for (const s of [1, -1]) {
    const tank = cyl(0.3, 0.3, 1.5, 8, STEEL, [s * 1.0, 0.72, -1.7], [0, 0, 1]);
    void tank;
    for (const z of [-2.3, -1.1]) box(0.12, 0.62, 0.07, P.hullDark, [s * 1.0, 0.72, z]);
    for (const z of [-2.1, -1.3]) b.part(new THREE.TorusGeometry(0.31, 0.02, 4, 8), P.trim, { bone: body, at: [s * 1.0, 0.72, z], dir: [0, 0, 1], axis: "z" });
    cyl(0.07, 0.07, 0.1, 6, P.black, [s * 1.0, 0.98, -1.2], [0, 1, 0]);
    // fuel gauge glow
    glow(b.part(new THREE.BoxGeometry(0.02, 0.1, 0.2), P.neonCyan, { bone: body, at: [s * 1.31, 0.74, -1.7] }), 1.5);
  }

  // ---------- exhaust stacks ----------
  for (const s of [1, -1]) {
    const x = s * 1.12;
    b.rod([x, 0.8, 1.4], [x, 0.9, 0.9], 0.07, P.hullDark, { bone: body });
    cyl(0.085, 0.085, 0.5, 8, STEEL, [x, 1.08, 0.9], [0, 1, 0]);
    // heat shield bands
    for (let i = 0; i < 3; i++) cyl(0.1, 0.1, 0.05, 8, P.trim, [x, 0.88 + i * 0.2, 0.9], [0, 1, 0]);
    cyl(0.1, 0.07, 0.06, 8, P.black, [x, 1.31, 0.9], [0, 1, 0]);
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), P.rust, { bone: body, at: [x, 1.335, 0.9], dir: [0, 1, 0] });
  }

  // ---------- mudguard arches over each wheel ----------
  axleZ.forEach((z) => {
    for (const s of [1, -1]) {
      const pts: number[][] = [];
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI * (0.05 + (i / 8) * 0.9);
        pts.push([s * 1.3, AY + Math.sin(a) * 0.7, z + Math.cos(a) * 0.7]);
      }
      b.sweep(pts, { radius: [0.03, 0.03], section: "box", sides: 4, color: P.hull, bone: body, skin: "rigid" });
      // arch flange
      b.sweep(
        pts.map((p) => [p[0] + s * 0.0, p[1], p[2]]),
        { radius: (t: number) => [0.28, 0.025], section: "box", color: P.hullDark, bone: body, skin: "rigid" },
      );
    }
  });

  // ---------- belly skid plate ----------
  b.frustumBox([0, 0.42, -3.5], [0, 0.42, 3.2], [1.5, 0.08], [1.1, 0.08], { color: IRON, bone: body });
  for (let i = 0; i < 9; i++) {
    for (const s of [1, -1]) bolt([s * 0.55, 0.375, -3.2 + i * 0.75], [0, -1, 0], 0.035);
  }
  // skid ribs
  for (let i = 0; i < 6; i++) box(1.3, 0.05, 0.08, P.hullLight, [0, 0.37, -3.0 + i * 1.1]);
  // angled front skid
  b.extrude(
    [
      [-0.7, 0],
      [0.7, 0],
      [0.55, 0.3],
      [-0.55, 0.3],
    ],
    { at: [0, 0.4, 3.2], x: [1, 0, 0], y: [0, 0.3, 1], thickness: 0.08, color: IRON, bone: body },
  );

  // ---------- side skirts ----------
  for (const s of [1, -1]) {
    const x = s * 1.46;
    const out = s;
    // main armor panels, segmented between wheel arches
    const segs: [number, number][] = [
      [3.35, 1.95],
      [1.45, 0.3],
      [-1.5, -2.1],
      [-3.0, -3.8],
    ];
    segs.forEach(([a, c], i) => {
      const len = Math.abs(a - c);
      const mid = (a + c) / 2;
      b.part(new THREE.BoxGeometry(0.1, 0.5, len), SKIRT, { bone: body, at: [x, 0.78, mid] });
      // chamfer top plate
      box(0.16, 0.05, len, P.hullLight, [x + out * 0.02, 1.06, mid]);
      // cyan neon lower edge
      glow(box(0.05, 0.04, len - 0.1, P.neonCyan, [x + out * 0.07, 0.5, mid]), 1.8);
      // magenta underglow bar
      glow(box(0.05, 0.04, len - 0.2, P.neonMagenta, [x - out * 0.15, 0.38, mid]), 1.6);
      // hazard chevron strip
      const strip = b.part(new THREE.PlaneGeometry(len - 0.15, 0.13), "#ffffff", {
        bone: body,
        at: [x + out * 0.056, 0.86, mid],
        dir: [out, 0, 0],
        axis: "z",
        up: [0, 1, 0],
        texture: chevron,
      });
      void strip;
      // rivets
      for (let r = 0; r < Math.floor(len / 0.3); r++) {
        bolt([x + out * 0.055, 0.64, a - Math.sign(a - c) * (0.15 + r * 0.3)], [out, 0, 0], 0.022);
      }
      // mounting brackets to frame
      if (len > 0.9) {
        b.rod([x, 0.92, mid], [s * 0.66, 1.0, mid], 0.03, P.hullDark, { bone: body });
      }
      void i;
    });
    // warning label
    b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", {
      bone: body,
      at: [x + out * 0.056, 0.7, -1.8],
      dir: [out, 0, 0],
      axis: "z",
      texture: warn,
    });
    // glowing step lights between skirts
    for (const z of [1.7, -1.8, -0.05]) {
      glow(b.part(new THREE.BoxGeometry(0.06, 0.04, 0.14), P.neonCyan, { bone: body, at: [x + out * 0.06, 1.1, z] }), 1.4);
    }
    // underglow bar inboard along frame
    glow(box(0.06, 0.05, 6.4, P.neonMagenta, [s * 0.9, 0.34, -0.2]), 1.8);
  }

  // ---------- cross-frame details: wiring, hoses, cable runs ----------
  for (let i = 0; i < 4; i++) {
    b.sweep(
      [
        [-0.3, 0.74, -3.0 + i * 1.7],
        [-0.1, 0.7, -2.6 + i * 1.7],
        [0.2, 0.74, -2.2 + i * 1.7],
        [0.4, 0.7, -1.9 + i * 1.7],
      ],
      { radius: 0.018, color: i % 2 ? P.neonRed : P.neonCyan, bone: body, sides: 5 },
    );
  }
  // battery box
  box(0.5, 0.3, 0.7, IRON, [0.0, 0.72, -0.1]);
  glow(box(0.3, 0.04, 0.08, P.neonCyan, [0, 0.89, -0.1]), 1.6);
  // air tanks
  cyl(0.12, 0.12, 0.9, 8, STEEL, [-0.35, 0.68, 2.0], [0, 0, 1]);
  cyl(0.12, 0.12, 0.9, 8, STEEL, [0.35, 0.68, 2.0], [0, 0, 1]);

  // rear mud flap row & spare hooks
  for (const s of [1, -1]) {
    box(0.45, 0.4, 0.04, RUBBERISH, [s * 1.1, 0.5, -3.65]);
    box(0.48, 0.04, 0.06, P.trim, [s * 1.1, 0.7, -3.65]);
  }
  // front frame horns with tow eyes
  for (const s of [1, -1]) {
    box(0.2, 0.2, 0.3, P.hullDark, [s * 0.55, 0.95, 3.5]);
    b.part(new THREE.TorusGeometry(0.07, 0.022, 4, 6), P.trim, { bone: body, at: [s * 0.55, 0.95, 3.62], dir: [0, 0, 1], axis: "z" });
  }
  // scattered grime bolts on rails (random detail)
  for (let i = 0; i < 10; i++) {
    const s = R() > 0.5 ? 1 : -1;
    b.part(new THREE.OctahedronGeometry(0.035, 0), P.rust, {
      bone: body,
      at: [s * 0.67, 0.9 + R() * 0.2, -3.5 + R() * 6.8],
    });
  }
}
    return buildChassis;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P }: any) {
  const R = 0.62, W = 0.55;
  const rand = rng(77);
  const MUD = "#4a3a2a";
  const TYRE = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const base: [number, number, number] = [0.09, 0.09, 0.11];
    const mud: [number, number, number] = [0.29, 0.23, 0.16];
    const t = smoothstep(0.5, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.18, 3));
    return mix(base, mud, Math.min(1, t * 0.9));
  });
  const HUB = paint((p: THREE.Vector3, n: THREE.Vector3) =>
    mix("#6c7484", "#b4bccb", 0.5 * noise(p, 0.05, 9) + 0.4 * smoothstep(0.3, 1, n.y)));
  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0b2a30"/><circle cx="32" cy="32" r="26" fill="none" stroke="#2ff3ff" stroke-width="4"/><circle cx="32" cy="32" r="14" fill="#2ff3ff"/><path d="M32 8v10M32 46v10M8 32h10M46 32h10" stroke="#9ffaff" stroke-width="4"/><circle cx="32" cy="32" r="6" fill="#ffffff"/></svg>`,
    { size: 128 });
  const treadTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#2a2b31"/><path d="M0 0L32 32M32 0L0 32" stroke="#0d0e12" stroke-width="5"/></svg>`,
    { size: 64 });

  const wheels: [string, number][] = [
    ["wheelFL", 1], ["wheelFR", -1], ["wheelML", 1], ["wheelMR", -1], ["wheelRL", 1], ["wheelRR", -1],
  ];

  for (const [name, s] of wheels) {
    const j = J[name];
    const c = j.at.clone();
    const out = new THREE.Vector3(s, 0, 0);
    // Tyre: octagonal cylinder, axle along X
    b.part(new THREE.CylinderGeometry(R, R, W, 16), TYRE, { bone: j, at: c, dir: [1, 0, 0], flat: true });
    // sidewall shoulders (slightly narrower, bigger bevel)
    for (const k of [-1, 1])
      b.part(new THREE.CylinderGeometry(R - 0.08, R, 0.06, 16), P.rubber, {
        bone: j, at: [c.x + k * (W / 2 - 0.03), c.y, c.z], dir: [1, 0, 0], flat: true });
    // tread blocks around the ring
    const blocks = 16;
    for (let i = 0; i < blocks; i++) {
      const a = (i / blocks) * Math.PI * 2;
      const dy = Math.sin(a), dz = Math.cos(a);
      for (const k of [-1, 1]) {
        b.part(new THREE.BoxGeometry(0.22, 0.09, 0.14), P.black, {
          bone: j,
          at: [c.x + k * 0.13, c.y + dy * (R + 0.015), c.z + dz * (R + 0.015)],
          dir: [0, dy, dz], up: [1, 0, 0],
        });
      }
    }
    // Outer face (away from truck)
    const ox = c.x + s * 0.2;
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 8), HUB, { bone: j, at: [ox, c.y, c.z], dir: [1, 0, 0], flat: true });
    // hex hubcap
    b.part(new THREE.CylinderGeometry(0.27, 0.3, 0.1, 6), HUB, { bone: j, at: [ox + s * 0.03, c.y, c.z], dir: [1, 0, 0], flat: true });
    // bolt ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.steel, {
        bone: j, at: [ox + s * 0.04, c.y + Math.sin(a) * 0.35, c.z + Math.cos(a) * 0.35], dir: [1, 0, 0] });
    }
    // glowing cyan accent disc
    const disc = b.part(new THREE.CircleGeometry(0.2, 12), "#ffffff", {
      bone: j, at: [ox + s * 0.06, c.y, c.z], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: hubTex });
    if (disc.mesh) {
      const m = (disc.mesh.material as THREE.MeshStandardMaterial).clone();
      m.emissive = new THREE.Color("#2ff3ff"); m.emissiveMap = m.map; m.emissiveIntensity = 1.2;
      disc.mesh.material = m;
    }
    // inner side: brake disc + caliper
    const ix = c.x - s * (W / 2 + 0.06);
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 12), "#8a93a3", { bone: j, at: [ix, c.y, c.z], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 6), P.black, { bone: j, at: [ix, c.y, c.z], dir: [1, 0, 0] });
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.14), P.neonRed, {
      bone: j, at: [ix, c.y + 0.28, c.z + 0.08] });
    // inner axle stub
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), P.hullDark, {
      bone: j, at: [c.x - s * (W / 2 + 0.14), c.y, c.z], dir: [1, 0, 0] });
    // mud splatter lumps near bottom
    for (let i = 0; i < 3; i++) {
      const a = Math.PI + (rand() - 0.5) * 1.2;
      b.part(new THREE.IcosahedronGeometry(0.05 + rand() * 0.03, 0), MUD, {
        bone: j,
        at: [c.x + (rand() - 0.5) * 0.4, c.y + Math.sin(a) * R * 0.98, c.z + Math.cos(a) * R * 0.98],
        flat: true });
    }
  }
}
    return buildWheels;
  })(),
  // cabShell
  (() => {
function buildCabShell({ b, J, P }: Ctx) {
  const bone = J.body;
  const HULL = panelled(P.hull, { size: 0.32, rivets: 0.06 });
  const PLATE = panelled(metal("iron"), { size: 0.4, rivets: 0.07 });
  const WARM = "#2a1a10"; // own colour: interior leather
  const SCREEN = "#7dffb0"; // own colour: green screen

  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });

  // ---------- textures
  const glassTex = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#0f2a3a"/>
    <path d="M10 32 L34 0 L48 0 L24 32Z" fill="#2ff3ff" opacity="0.35"/>
    <path d="M56 32 L74 0 L80 0 L62 32Z" fill="#2ff3ff" opacity="0.25"/>
    <path d="M96 32 L112 0 L118 0 L102 32Z" fill="#ff2fb5" opacity="0.25"/></svg>`,
    { size: 256 },
  );
  const num77 = svg(
    `<svg viewBox="0 0 96 64"><rect x="2" y="2" width="92" height="60" rx="6" fill="#0d0e12" opacity="0.55" stroke="#e7b814" stroke-width="3"/>
    <text x="48" y="48" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="46" fill="#e7b814" stroke="#0d0e12" stroke-width="2">77</text></svg>`,
    { size: 256 },
  );
  const glyph = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#2ff3ff" stroke-width="4"/>
    <path d="M16 22H48M32 12V52M20 36H44M22 48L32 40L42 48M18 30L26 26M46 30L38 26" stroke="#2ff3ff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 192 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 160 20"><rect width="160" height="20" fill="#e7b814"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 16} 0 L${i * 16 + 8} 0 L${i * 16 + 16} 10 L${i * 16 + 8} 20 L${i * 16} 20 L${i * 16 + 8} 10Z" fill="#0d0e12"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const warn = svg(
    `<svg viewBox="0 0 48 40"><rect width="48" height="40" fill="#e7b814"/><path d="M24 5L42 35H6Z" fill="none" stroke="#0d0e12" stroke-width="3" stroke-linejoin="round"/>
    <rect x="22" y="14" width="4" height="12" fill="#0d0e12"/><rect x="22" y="28" width="4" height="4" fill="#0d0e12"/></svg>`,
    { size: 128 },
  );
  const eyeLens = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#0d0e12"/><circle cx="16" cy="16" r="9" fill="#2ff3ff"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>`,
    { size: 64 },
  );
  const screenTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#06201a"/><path d="M4 24L14 14L22 20L34 8L46 18L60 6" stroke="#7dffb0" stroke-width="2.5" fill="none"/>
    <rect x="4" y="4" width="14" height="3" fill="#7dffb0"/></svg>`,
    { size: 128 },
  );

  const merged = (pts: number[][], mk: () => THREE.BufferGeometry) =>
    mergeGeometries(pts.map((p) => mk().translate(p[0], p[1], p[2])))!;

  // ---------- main wedge shell (side silhouette extruded across)
  b.extrude(
    [
      [0.9, 1.2, "sharp"],
      [2.9, 1.2, "sharp"],
      [2.9, 1.95, "sharp"],
      [2.45, 2.6, "sharp"],
      [0.9, 2.6, "sharp"],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.64, color: HULL, bone, name: "cabShellCore" },
  );
  // roof plate + chamfer strips
  box(2.5, 0.07, 1.55, P.hullLight, [0, 2.63, 1.65]);
  box(2.64, 0.05, 0.1, P.trim, [0, 2.62, 0.95]);
  // lower belt trim and rear wall details
  box(2.7, 0.08, 2.0, P.hullDark, [0, 1.22, 1.9]);
  box(2.0, 0.9, 0.05, P.hullDark, [0, 1.95, 0.92]);
  box(1.6, 0.12, 0.06, P.neonRed, [0, 2.35, 0.9]);
  glow(box(1.6, 0.05, 0.07, P.neonRed, [0, 1.6, 0.9]), 1.2);

  // ---------- windshield on slope
  const nrm = [0, 0.82, 0.57];
  const wc = [0, 2.34, 2.63];
  b.part(new THREE.BoxGeometry(2.3, 0.04, 0.44), P.black, { bone, at: [wc[0], wc[1] + 0.005, wc[2] + 0.003], dir: nrm });
  b.part(new THREE.PlaneGeometry(2.1, 0.3), "#ffffff", {
    bone, at: [wc[0] + 0, wc[1] + 0.017, wc[2] + 0.012], dir: nrm, axis: "z", texture: glassTex,
  });
  // wiper bars and A-pillars
  for (const s of [1, -1]) {
    b.rod([s * 1.2, 1.97, 2.89], [s * 1.2, 2.58, 2.47], 0.05, P.hullDark, { bone, sides: 4 });
    b.rod([s * 0.55, 2.2, 2.7], [s * 0.1, 2.2, 2.7], 0.012, P.steel, { bone, sides: 4 });
  }
  // brow visor
  box(2.5, 0.06, 0.3, P.trim, [0, 2.62, 2.42], { rotation: [-34, 0, 0] });
  // lower nose armour inset
  box(2.4, 0.5, 0.05, PLATE, [0, 1.55, 2.92]);

  // ---------- sides
  const boltPts = (zs: number[], ys: number[]) => zs.flatMap((z) => ys.map((y) => [0, y, z]));
  for (const s of [1, -1]) {
    // armour plate
    box(0.06, 1.2, 1.9, PLATE, [s * 1.35, 1.85, 1.9]);
    box(0.06, 0.5, 0.35, PLATE, [s * 1.35, 1.5, 2.75], { rotation: [0, 0, 0] });
    // bolts
    const bolts = merged(boltPts([1.0, 1.55, 2.2, 2.75], [1.3, 2.5]), () =>
      new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6).rotateZ(Math.PI / 2),
    );
    bolts.translate(s * 1.385, 0, 0);
    b.part(bolts, P.steel, { bone, at: [0, 0, 0] });
    // door outline
    const dz0 = 1.15, dz1 = 2.3, dy0 = 1.4, dy1 = 2.4;
    const ox = s * 1.385;
    box(0.015, 0.025, dz1 - dz0, P.black, [ox, dy0, (dz0 + dz1) / 2]);
    box(0.015, 0.025, dz1 - dz0, P.black, [ox, dy1, (dz0 + dz1) / 2]);
    box(0.015, dy1 - dy0, 0.025, P.black, [ox, (dy0 + dy1) / 2, dz0]);
    box(0.015, dy1 - dy0, 0.025, P.black, [ox, (dy0 + dy1) / 2, dz1]);
    // handle
    box(0.05, 0.05, 0.25, P.steel, [s * 1.41, 2.05, 2.15]);
    box(0.05, 0.14, 0.04, P.steel, [s * 1.41, 2.05, 2.0]);
    // window frame + glass
    box(0.02, 0.38, 1.0, P.black, [ox, 2.22, 1.72]);
    b.part(new THREE.PlaneGeometry(0.92, 0.3), "#ffffff", {
      bone, at: [s * 1.397, 2.22, 1.72], dir: [s, 0, 0], axis: "z", texture: glassTex,
    });
    // decals: unit number, glyph, hazard, warning
    b.part(new THREE.PlaneGeometry(0.62, 0.42), "#ffffff", {
      bone, at: [s * 1.392, 1.8, 1.75], dir: [s, 0, 0], axis: "z", texture: num77,
    });
    b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
      bone, at: [s * 1.392, 1.8, 2.12], dir: [s, 0, 0], axis: "z", texture: glyph,
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
        bone, at: [s * 1.392, 1.8, 2.12], dir: [s, 0, 0], axis: "z", texture: glyph,
      }),
      1,
    );
    b.part(new THREE.PlaneGeometry(1.8, 0.12), "#ffffff", {
      bone, at: [s * 1.392, 1.3, 1.72], dir: [s, 0, 0], axis: "z", texture: hazard,
    });
    b.part(new THREE.PlaneGeometry(0.2, 0.17), "#ffffff", {
      bone, at: [s * 1.392, 1.62, 1.3], dir: [s, 0, 0], axis: "z", texture: warn,
    });
    // neon strip beside door
    glow(box(0.03, 0.03, 1.0, P.neonCyan, [s * 1.39, 1.4 - 0.08, 1.72]), 1.4);

    // mirror camera pod
    b.rod([s * 1.3, 2.4, 2.5], [s * 1.34, 2.43, 2.54], 0.02, P.hullDark, { bone, sides: 4 });
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.16), P.hullDark, { bone, at: [s * 1.34, 2.42, 2.58] });
    b.part(new THREE.BoxGeometry(0.08, 0.06, 0.1), P.trim, { bone, at: [s * 1.34, 2.54, 2.58] });
    glow(
      b.part(new THREE.CircleGeometry(0.05, 8), "#ffffff", {
        bone, at: [s * 1.34, 2.42, 2.665], dir: [0, 0, 1], axis: "z", texture: eyeLens,
      }),
      1.2,
    );

    // roof rack rails
    const rx = s * 1.0;
    for (const z of [1.1, 2.2]) b.rod([rx, 2.66, z], [rx, 2.8, z], 0.02, P.steel, { bone, sides: 4 });
    b.rod([rx, 2.8, 1.1], [rx, 2.8, 2.2], 0.025, P.steel, { bone, sides: 6 });
    // antenna array
    b.rod([s * 0.9, 2.64, 1.05], [s * 0.9 + s * 0.02, 2.95, 1.0], 0.012, P.black, { bone, sides: 4 });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.neonRed, { bone, at: [s * 0.92, 2.95, 1.0] }), 1.5);
    // front cheek lamps
    glow(box(0.03, 0.08, 0.3, P.lampWhite, [s * 1.33, 1.33, 2.75]), 0.8);
  }
  b.rod([0, 2.8, 1.1], [0, 2.8, 2.2], 0.02, P.steel, { bone, sides: 4 });
  b.rod([-1.0, 2.8, 1.65], [1.0, 2.8, 1.65], 0.02, P.steel, { bone, sides: 4 });

  // ---------- roof gear
  // hatch
  b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 8), P.hullLight, { bone, at: [0, 2.68, 1.85] });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), P.steel, { bone, at: [0, 2.74, 1.85] });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.06), P.trim, { bone, at: [0, 2.72, 1.85] });
  // sensor dome
  b.part(new THREE.CylinderGeometry(0.14, 0.16, 0.06, 8), P.hullDark, { bone, at: [-0.65, 2.69, 1.3] });
  glow(
    b.part(new THREE.SphereGeometry(0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.neonCyan, {
      bone, at: [-0.65, 2.72, 1.3],
    }),
    0.9,
  );
  // satellite panel
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 8), P.steel, {
    bone, at: [0.6, 2.8, 1.25], rotation: [-35, 0, 0],
  });
  b.rod([0.6, 2.64, 1.25], [0.6, 2.78, 1.25], 0.02, P.hullDark, { bone, sides: 4 });
  // emergency light bars
  box(1.5, 0.08, 0.14, P.black, [0, 2.7, 2.28]);
  glow(box(0.7, 0.07, 0.12, P.neonRed, [-0.38, 2.77, 2.28]), 1.8);
  glow(box(0.7, 0.07, 0.12, P.neonCyan, [0.38, 2.77, 2.28]), 1.8);
  for (const s of [1, -1]) box(0.06, 0.12, 0.14, P.trim, [s * 0.75, 2.72, 2.28]);
  // roof hazard strip
  b.part(new THREE.PlaneGeometry(2.0, 0.1), "#ffffff", {
    bone, at: [0, 2.668, 1.1], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: hazard,
  });

  // ---------- interior glimpse (dashboard, seats, screens)
  box(2.0, 0.18, 0.4, WARM, [0, 2.0, 2.45]);
  for (const s of [1, -1]) {
    box(0.5, 0.12, 0.5, WARM, [s * 0.5, 1.6, 1.8]);
    box(0.5, 0.55, 0.1, WARM, [s * 0.5, 1.9, 1.52]);
    box(0.3, 0.12, 0.08, P.hullDark, [s * 0.5, 2.25, 1.5]);
    glow(
      b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", {
        bone, at: [s * 0.5, 2.12, 2.26], dir: [0, 0.3, 1], axis: "z", texture: screenTex,
      }),
      1.1,
    );
  }
  b.rod([-0.5, 2.09, 2.4], [-0.5, 2.0, 2.2], 0.03, P.black, { bone, sides: 6 });
  glow(box(0.2, 0.01, 0.1, SCREEN, [0, 2.1, 2.45]), 1.2);

  // ---------- rear sensor eye & brake lights on cab back
  glow(
    b.part(new THREE.CircleGeometry(0.1, 8), "#ffffff", {
      bone, at: [0, 2.3, 0.89], dir: [0, 0, -1], axis: "z", texture: eyeLens,
    }),
    1.3,
  );
  // vertical rear armour ribs
  for (const x of [-1.1, -0.65, 0.65, 1.1]) box(0.08, 1.2, 0.06, P.hullLight, [x, 1.9, 0.93]);
}
    return buildCabShell;
  })(),
  // cabFront
  (() => {
function buildCabFront({ b, J, P }: Ctx) {
  const bone = J.body;
  const add = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---- textures
  const GRILLE = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="40" fill="#14060f"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 10} 0 L${i * 10 + 40} 40" stroke="#ff2fb5" stroke-width="2.2"/><path d="M${i * 10 + 40} 0 L${i * 10} 40" stroke="#2ff3ff" stroke-width="1.2"/>`).join("")}
    <rect x="2" y="2" width="116" height="36" fill="none" stroke="#2ff3ff" stroke-width="2.5"/>
    <ellipse cx="60" cy="18" rx="15" ry="14" fill="#0d0e12" stroke="#2ff3ff" stroke-width="2"/>
    <rect x="50" y="26" width="20" height="9" fill="#0d0e12" stroke="#2ff3ff" stroke-width="2"/>
    <ellipse cx="54" cy="17" rx="4" ry="5" fill="#ff3b30"/><ellipse cx="66" cy="17" rx="4" ry="5" fill="#ff3b30"/>
    <path d="M60 21 L57 26 L63 26Z" fill="#2ff3ff"/>
    <path d="M54 28v6M60 28v6M66 28v6" stroke="#2ff3ff" stroke-width="1.5"/>
  </svg>`,
    { size: 512 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="30" fill="#e7b814"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 12 - 6} 30 L${i * 12 + 6} 15 L${i * 12 - 6} 0 L${i * 12 + 0} 0 L${i * 12 + 12} 15 L${i * 12} 30Z" fill="#0d0e12"/>`).join("")}
    <rect width="100" height="30" fill="none" stroke="#0d0e12" stroke-width="3"/>
  </svg>`,
    { size: 256 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="24" fill="#e7b814"/>
    <path d="M6 20 L14 4 L22 20Z" fill="#0d0e12"/><rect x="13" y="9" width="2" height="6" fill="#e7b814"/>
    <text x="26" y="11" font-size="7" font-weight="bold" fill="#0d0e12" font-family="monospace">WINCH</text>
    <text x="26" y="19" font-size="6" fill="#0d0e12" font-family="monospace">5T-77</text></svg>`,
    { size: 128 },
  );

  const HULL = panelled(P.hull, { size: 0.35 });
  const DARK = panelled(metal("iron"), { size: 0.3 });

  // ---- main front body block and lower fascia
  add(box(2.6, 0.9, 1.0), HULL, [0, 1.0, 3.4]);
  add(box(2.8, 0.18, 1.1), P.hullDark, [0, 0.54, 3.4]); // skid
  add(box(2.2, 0.08, 0.7), P.black, [0, 0.5, 3.45]);

  // ---- hood (sloped) with ribs and vents
  const TILT = 8;
  const hoodY = (z: number) => 1.64 - (z - 3.3) * Math.tan((TILT * Math.PI) / 180);
  add(box(2.4, 0.18, 0.8), HULL, [0, 1.55, 3.3], { rotation: [TILT, 0, 0] });
  for (const s of [1, -1]) {
    add(box(0.07, 0.06, 0.78), P.hullLight, [s * 0.35, hoodY(3.3) + 0.02, 3.3], { rotation: [TILT, 0, 0] });
    add(box(0.07, 0.06, 0.78), P.hullLight, [s * 1.1, hoodY(3.3) + 0.02, 3.3], { rotation: [TILT, 0, 0] });
    for (let i = 0; i < 6; i++) {
      const z = 3.0 + i * 0.12;
      add(box(0.5, 0.025, 0.05), P.black, [s * 0.72, hoodY(z) + 0.01, z], { rotation: [TILT, 0, 0] });
    }
    // yellow hood-edge trim
    add(box(0.05, 0.05, 0.8), P.trim, [s * 1.2, hoodY(3.3) + 0.02, 3.3], { rotation: [TILT, 0, 0] });
  }
  add(box(0.5, 0.05, 0.3), P.trim, [0, hoodY(3.5) + 0.04, 3.5], { rotation: [TILT, 0, 0] }); // scoop base
  add(box(0.4, 0.14, 0.26), P.hullDark, [0, hoodY(3.5) + 0.09, 3.48], { rotation: [TILT, 0, 0] });
  glow(add(box(0.3, 0.03, 0.14), P.neonCyan, [0, hoodY(3.52) + 0.17, 3.54], { rotation: [TILT, 0, 0] }), 1.4);

  // ---- grille
  add(box(1.3, 0.42, 0.1), P.black, [0, 1.25, 3.92]);
  glow(
    add(new THREE.PlaneGeometry(1.2, 0.4), P.steel, [0, 1.25, 3.975], { dir: [0, 0, 1], axis: "z", texture: GRILLE }),
    1.3,
  );
  for (const s of [1, -1]) add(box(0.05, 0.46, 0.08), P.trim, [s * 0.68, 1.25, 3.93]);
  add(box(1.4, 0.05, 0.08), P.trim, [0, 1.5, 3.93]);
  add(box(1.4, 0.05, 0.08), P.trim, [0, 1.0, 3.93]);

  // ---- headlights, DRL, fenders
  for (const s of [1, -1]) {
    add(box(0.62, 0.34, 0.24), P.hullDark, [s * 1.0, 1.2, 3.82], { rotation: [0, s * -8, 0] });
    glow(add(new THREE.PlaneGeometry(0.46, 0.2), P.lampWhite, [s * 1.02, 1.24, 3.96], { dir: [0, 0, 1], axis: "z" }), 1.8);
    glow(add(box(0.5, 0.04, 0.03), P.neonCyan, [s * 1.0, 1.06, 3.95]), 1.5);
    glow(add(box(0.5, 0.025, 0.03), P.neonCyan, [s * 1.02, 1.4, 3.95]), 1.5);
    add(box(0.58, 0.04, 0.3), P.hullLight, [s * 1.0, 1.42, 3.82]); // brow
    // fog lamps
    add(cyl(0.1, 0.1, 0.05, 8), P.hullDark, [s * 0.75, 0.75, 3.985], { rotation: [90, 0, 0] });
    glow(add(cyl(0.07, 0.07, 0.03, 8), P.lampWhite, [s * 0.75, 0.75, 4.0], { rotation: [90, 0, 0] }), 1.6);
    // fender flare arch (front quarter) + slab
    add(new THREE.TorusGeometry(0.4, 0.06, 5, 8, Math.PI / 2), P.hullDark, [s * 1.3, 0.95, 3.2], {
      rotation: [0, -90, 0],
      flat: true,
    });
    add(box(0.64, 0.12, 0.5), HULL, [s * 1.3, 1.32, 3.1]);
    add(box(0.68, 0.06, 0.52), P.trim, [s * 1.3, 1.39, 3.1]);
    add(box(0.12, 0.5, 0.56), HULL, [s * 1.52, 1.1, 3.1]);
    // bolts on fender
    for (let i = 0; i < 3; i++) add(cyl(0.025, 0.025, 0.03, 6), P.steel, [s * 1.3, 1.395, 2.95 + i * 0.15]);
    // side neon + underglow bar
    glow(add(box(0.04, 0.04, 0.9), P.neonCyan, [s * 1.31, 0.52, 3.4]), 1.5);
    glow(add(box(0.3, 0.03, 0.8), P.neonMagenta, [s * 1.0, 0.45, 3.4]), 1.6);
    // radar/sensor plates & tow hooks
    add(new THREE.TorusGeometry(0.08, 0.02, 5, 8), P.steel, [s * 0.95, 0.52, 3.97], { flat: true });
  }
  glow(add(box(1.4, 0.03, 0.8), P.neonMagenta, [0, 0.455, 3.4]), 1.6);

  // ---- bumper
  add(box(3.0, 0.4, 0.3), DARK, [0, 0.75, 3.83]);
  for (const s of [1, -1]) {
    glow(
      add(new THREE.PlaneGeometry(0.95, 0.28), P.steel, [s * 1.0, 0.75, 3.987], { dir: [0, 0, 1], axis: "z", texture: HAZARD }),
      0.5,
    );
    add(box(0.12, 0.45, 0.34), P.hullDark, [s * 1.52, 0.75, 3.8]);
    for (const x of [0.8, 1.1, 1.4]) {
      add(new THREE.ConeGeometry(0.05, 0.17, 5), P.steel, [s * x, 1.04, 3.88], { flat: true });
    }
  }
  add(box(0.7, 0.4, 0.3), P.hullDark, [0, 0.75, 3.82]);
  add(new THREE.PlaneGeometry(0.2, 0.08), P.steel, [0, 0.58, 3.99], { dir: [0, 0, 1], axis: "z", texture: LABEL });

  // ---- winch drum, cable, hook
  add(cyl(0.09, 0.09, 0.62, 8), P.steel, [0, 0.8, 3.9], { rotation: [0, 0, 90] });
  for (const s of [1, -1]) {
    add(cyl(0.12, 0.12, 0.05, 8), P.trim, [s * 0.33, 0.8, 3.9], { rotation: [0, 0, 90] });
  }
  for (let i = 0; i < 5; i++) add(cyl(0.095, 0.095, 0.03, 8), P.black, [-0.2 + i * 0.1, 0.8, 3.9], { rotation: [0, 0, 90] });
  b.rod([0, 0.74, 3.99], [0, 0.6, 3.99], 0.012, P.black, { bone });
  add(new THREE.TorusGeometry(0.05, 0.014, 5, 8, Math.PI * 1.5), P.steel, [0, 0.54, 3.99], { flat: true });

  // ---- plow blade with teeth
  for (const s of [1, -1]) {
    const pts: [number, number][] = [];
    const n = 6;
    for (let i = 0; i <= n; i++) {
      const x = 0.4 + (i * 1.05) / n;
      pts.push([x, 0.02]);
      if (i < n) pts.push([x + 0.0875, 0.0]);
    }
    const out: [number, number][] = [];
    // teeth bottom, then top edge back
    for (let i = 0; i <= n; i++) {
      const x = 0.4 + (i * 1.05) / n;
      out.push([x, 0.1]);
      if (i < n) out.push([x + 0.0875, 0.0]);
    }
    out.push([1.45, 0.3], [0.4, 0.3]);
    b.extrude(out, { at: [s * 0, 0.45, 3.975], x: [s, 0, 0], thickness: 0.05, color: P.hullLight, bone });
  }

  // ---- antenna whip & radar plates
  b.rod([1.3, 1.5, 3.0], [1.2, 1.9, 2.95], [0.014, 0.006], P.black, { bone });
  add(cyl(0.04, 0.04, 0.08, 6), P.hullDark, [1.3, 1.5, 3.0]);
  glow(add(new THREE.SphereGeometry(0.025, 5, 4), P.neonRed, [1.2, 1.9, 2.95]), 2);
  add(box(0.4, 0.02, 0.28), P.hullDark, [-1.2, 1.62, 3.1], { rotation: [0, 0, -20] });
  add(cyl(0.015, 0.015, 0.14, 5), P.steel, [-1.2, 1.55, 3.1]);
  add(new THREE.ConeGeometry(0.08, 0.06, 6), P.steel, [-1.2, 1.7, 3.1], { rotation: [0, 0, -20] });
  glow(add(new THREE.SphereGeometry(0.025, 5, 4), P.neonCyan, [-1.2, 1.72, 3.1]), 2);
}
    return buildCabFront;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const [rx, ry, rz] = M.turretRing;

  // ---------- textures ----------
  const EYE = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1a0408"/><circle cx="32" cy="32" r="24" fill="#ff3b30"/><circle cx="32" cy="32" r="15" fill="#ff9a80"/><circle cx="32" cy="32" r="6" fill="#fff4c8"/><path d="M32 2V14M32 50V62M2 32H14M50 32H62" stroke="#0d0e12" stroke-width="4"/></svg>`,
    { size: 96 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#2ff3ff"/><circle cx="16" cy="16" r="7" fill="#e8ffff"/><circle cx="16" cy="16" r="14" fill="none" stroke="#0d0e12" stroke-width="2"/></svg>`,
    { size: 64 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#0d0e12"/><path d="M0 32L16 0H32L16 32ZM32 32L48 0H64L48 32ZM64 32L80 0H96L80 32ZM96 32L112 0H128L112 32Z" fill="#e7b814"/><rect width="128" height="32" fill="none" stroke="#e7b814" stroke-width="3"/></svg>`,
    { size: 192 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#e7b814"/><path d="M32 5L50 33H14Z" fill="none" stroke="#0d0e12" stroke-width="3"/><rect x="30" y="14" width="4" height="10" fill="#0d0e12"/><rect x="30" y="27" width="4" height="3" fill="#0d0e12"/><path d="M4 36h6M54 36h6" stroke="#0d0e12" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  // ---------- paints ----------
  const HULL = panelled(metal("iron", { tarnish: 0.2 }), { size: 0.2, rivets: 0.05 });
  const HULL_L = panelled(P.hullLight, { size: 0.16, rivets: 0.04 });
  const GUN = metal("steel", { tarnish: 0.3, polish: 0.4 });
  const DRUM = paint((p) => (Math.floor(p.x / 0.0001 + 0) !== 0 && Math.sin(p.z * 60) > 0.6 ? P.black : P.ammo));

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: yaw, at, ...opts });

  // ---------- ring base ----------
  b.lathe(
    [
      [0, 0],
      [0.6, 0],
      [0.62, 0.03],
      [0.62, 0.06],
      [0.54, 0.1],
      [0, 0.1],
    ],
    { at: [rx, ry, rz], bone: J.body, segments: 20, color: P.hullDark },
  );
  b.lathe(
    [
      [0, 0],
      [0.58, 0],
      [0.58, 0.06],
      [0.5, 0.1],
      [0, 0.1],
    ],
    { at: [rx, ry + 0.1, rz], bone: yaw, segments: 20, color: P.hull },
  );
  // gear teeth
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    box(0.07, 0.07, 0.06, P.steel, [rx + Math.sin(a) * 0.6, ry + 0.06, rz + Math.cos(a) * 0.6], {
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // yellow ring stripe
  b.lathe(
    [
      [0.575, 0],
      [0.595, 0],
      [0.595, 0.012],
      [0.575, 0.012],
    ],
    { at: [rx, ry + 0.115, rz], bone: yaw, segments: 20, color: P.trim },
  );

  // ---------- housing ----------
  b.extrude(
    [
      [-0.1, 2.72],
      [1.15, 2.72],
      [1.15, 2.9],
      [0.9, 3.05, "sharp"],
      [0.2, 3.05, "sharp"],
      [-0.1, 2.88],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 0.9, bevel: 0.025, bone: yaw, color: HULL },
  );
  // sloped cheek plates
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.0, 2.74],
        [1.0, 2.74],
        [1.0, 2.88],
        [0.8, 3.0],
        [0.25, 3.0],
        [0.0, 2.86],
      ],
      { at: [s * 0.455, 0, 0], x: [0, 0, 1], thickness: 0.05, bevel: 0.01, bone: yaw, color: HULL_L },
    );
    // trim stripes
    box(0.02, 0.035, 0.7, P.trim, [s * 0.485, 2.78, 0.5]);
    box(0.02, 0.035, 0.5, P.trim, [s * 0.485, 2.97, 0.55], { rotation: [0, 0, 0] });
    // bolts
    for (let k = 0; k < 4; k++)
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6), P.steel, {
        bone: yaw,
        at: [s * 0.49, 2.86, 0.15 + k * 0.25],
        dir: [s, 0, 0],
      });
  }
  // top plate and trim
  box(0.7, 0.02, 0.5, P.hullDark, [0, 3.058, 0.55]);
  box(0.94, 0.03, 0.04, P.trim, [0, 2.735, 1.14]);
  // vents
  for (let i = 0; i < 5; i++) box(0.3, 0.012, 0.03, P.black, [0.0, 3.07, 0.2 + i * 0.07]);
  // rear hazard label + decals
  b.part(new THREE.PlaneGeometry(0.6, 0.15), "#ffffff", {
    bone: yaw,
    at: [0, 2.8, -0.106],
    dir: [0, 0, -1],
    axis: "z",
    texture: HAZARD,
  });
  b.part(new THREE.PlaneGeometry(0.22, 0.14), "#ffffff", {
    bone: yaw,
    at: [-0.4, 2.98, 0.15],
    dir: [0, 0.2, -1],
    axis: "z",
    texture: LABEL,
  });
  // gun mantlet
  box(0.46, 0.26, 0.12, P.hullDark, [0, 2.93, 1.19]);

  // ---------- sensor eye cluster ----------
  b.part(new THREE.CylinderGeometry(0.11, 0.12, 0.08, 8), P.black, {
    bone: yaw,
    at: [-0.28, 2.82, 1.17],
    dir: [0, 0, 1],
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", {
      bone: yaw,
      at: [-0.28, 2.82, 1.215],
      dir: [0, 0, 1],
      axis: "z",
      texture: EYE,
    }),
    1.6,
  );
  for (const x of [0.02, 0.2]) {
    b.part(new THREE.CylinderGeometry(0.05, 0.055, 0.06, 6), P.black, {
      bone: yaw,
      at: [x, 2.79, 1.16],
      dir: [0, 0, 1],
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
        bone: yaw,
        at: [x, 2.79, 1.195],
        dir: [0, 0, 1],
        axis: "z",
        texture: LENS,
      }),
      1.3,
    );
  }
  // sensor visor brow
  box(0.76, 0.03, 0.12, P.trim, [-0.08, 2.935, 1.12]);

  // ---------- ammo box + belt ----------
  box(0.26, 0.28, 0.5, P.olive, [0.6, 2.86, 0.4]);
  box(0.28, 0.03, 0.52, P.hullDark, [0.6, 3.015, 0.4]);
  box(0.275, 0.04, 0.1, P.trim, [0.6, 2.93, 0.4]);
  b.part(new THREE.BoxGeometry(0.04, 0.06, 0.1), P.steel, { bone: yaw, at: [0.74, 2.88, 0.4] });
  const belt = b.sweep([[0.55, 2.98, 0.65], [0.45, 3.03, 0.85], [0.28, 3.0, 1.0], [0.16, 2.97, 1.12]], 0.028, {
    bone: yaw,
    color: P.ammo,
    section: "box",
    caps: "flat",
  });
  b.along(belt, 7, (at) => b.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 5), P.trim, at, { embed: 0.3 }));

  // ---------- twin ammo drums ----------
  for (const z of [0.3, 0.62]) {
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.2, 8), DRUM, {
      bone: yaw,
      at: [-0.59, 2.86, z],
      dir: [1, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.215, 6), P.steel, {
      bone: yaw,
      at: [-0.59, 2.86, z],
      dir: [1, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.025, 8), P.trim, {
      bone: yaw,
      at: [-0.69, 2.86, z],
      dir: [1, 0, 0],
    });
  }

  // ---------- antenna ----------
  b.rod([0.38, 3.05, 0.12], [0.5, 3.1, -0.35], 0.007, P.steel, { bone: yaw });
  b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonRed, { bone: yaw, at: [0.5, 3.1, -0.35] });
  glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), P.neonRed, { bone: yaw, at: [0.5, 3.1, -0.36] }), 1.5);

  // ---------- railgun (rides gunPitch) ----------
  const gy = 2.96;
  const g = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: pitch, at, ...opts });
  g(0.32, 0.2, 0.5, P.hullDark, [0, gy, 1.15]);
  g(0.34, 0.03, 0.4, P.trim, [0, gy + 0.11, 1.15]);
  for (const s of [1, -1]) {
    b.rod([s * 0.07, gy, 1.35], [s * 0.07, gy, 2.8], 0.035, GUN, { bone: pitch, sides: 6 });
    b.rod([s * 0.1, gy, 1.4], [s * 0.1, gy, 2.7], 0.012, P.neonCyan, { bone: pitch, sides: 4 });
  }
  glow(b.rod([0, gy, 1.4], [0, gy, 2.8], 0.018, P.neonCyan, { bone: pitch, sides: 4 }), 1.8);
  // coils
  for (let i = 0; i < 5; i++) {
    glow(
      b.part(new THREE.TorusGeometry(0.1, 0.022, 4, 8), P.neonCyan, {
        bone: pitch,
        at: [0, gy, 1.9 + i * 0.17],
        dir: [0, 0, 1],
        axis: "z",
      }),
      1.5,
    );
    g(0.04, 0.04, 0.05, P.steel, [0, gy - 0.12, 1.9 + i * 0.17]);
  }
  // heat fins
  for (let i = 0; i < 4; i++) {
    g(0.28, 0.2, 0.016, P.steel, [0, gy, 1.45 + i * 0.1]);
    g(0.05, 0.27, 0.016, P.hullLight, [0, gy, 1.45 + i * 0.1]);
  }
  // muzzle brake
  g(0.22, 0.14, 0.2, P.hullDark, [0, gy, 2.8]);
  for (let i = 0; i < 3; i++) g(0.24, 0.1, 0.018, P.black, [0, gy, 2.74 + i * 0.06]);
  g(0.12, 0.04, 0.2, P.trim, [0, gy + 0.09, 2.8]);
  glow(
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 6), P.neonCyan, {
      bone: pitch,
      at: [0, gy, 2.9],
      dir: [0, 0, 1],
    }),
    2,
  );
}
    return buildTurret;
  })(),
  // cargoBed
  (() => {
function buildCargoBed({ b, J, P, M }: any) {
  const DECK = 2.3;
  const R = rng(77);

  // ---------- textures ----------
  const hazardStripes = (() => {
    let s = `<rect width="64" height="16" fill="#e7b814"/>`;
    for (let x = -16; x < 72; x += 16) s += `<polygon points="${x},16 ${x + 8},16 ${x + 16},0 ${x + 8},0" fill="#0d0e12"/>`;
    return svg(`<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 256 });
  })();
  const chevrons = (() => {
    let s = `<rect width="120" height="30" fill="#0d0e12"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 8 + i * 20;
      s += `<polyline points="${x},4 ${x + 12},15 ${x},26" fill="none" stroke="#e7b814" stroke-width="7" stroke-linejoin="miter"/>`;
    }
    return svg(`<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 384 });
  })();
  const plateTex = svg(
    `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="58" height="28" rx="4" fill="#e8e8e0" stroke="#0d0e12" stroke-width="2"/>
      <rect x="3" y="3" width="8" height="24" rx="2" fill="#2ff3ff"/>
      <text x="36" y="21" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#0d0e12">WH-2077</text>
    </svg>`,
    { size: 256 },
  );
  const statusTex = svg(
    `<svg viewBox="0 0 50 36" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="48" height="34" rx="3" fill="#06161c" stroke="#2ff3ff" stroke-width="2"/>
      <rect x="6" y="7" width="30" height="4" fill="#2ff3ff"/>
      <rect x="6" y="14" width="22" height="4" fill="#2ff3ff"/>
      <rect x="6" y="21" width="36" height="4" fill="#2ff3ff"/>
      <circle cx="42" cy="9" r="3" fill="#2ff3ff"/>
      <text x="7" y="33" font-family="monospace" font-weight="bold" font-size="6" fill="#2ff3ff">SYS OK</text>
    </svg>`,
    { size: 256 },
  );
  const warnTex = svg(
    `<svg viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="48" height="38" rx="4" fill="#e7b814" stroke="#0d0e12" stroke-width="2"/>
      <polygon points="25,5 38,26 12,26" fill="none" stroke="#0d0e12" stroke-width="3" stroke-linejoin="round"/>
      <rect x="23.5" y="12" width="3" height="8" fill="#0d0e12"/><rect x="23.5" y="22" width="3" height="3" fill="#0d0e12"/>
      <text x="25" y="35" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="7" fill="#0d0e12">EXPLOSIVE</text>
    </svg>`,
    { size: 256 },
  );
  const crateTex = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#4d5a3c"/>
      <rect x="1.5" y="1.5" width="29" height="29" fill="none" stroke="#2f3825" stroke-width="3"/>
      <path d="M3 3 L29 29 M29 3 L3 29" stroke="#3a4430" stroke-width="2.5"/>
      <rect x="6" y="11" width="20" height="10" fill="#4d5a3c"/>
      <text x="16" y="19.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#d8d2a0">77</text>
      <circle cx="4.5" cy="4.5" r="1" fill="#b8a24a"/><circle cx="27.5" cy="4.5" r="1" fill="#b8a24a"/>
      <circle cx="4.5" cy="27.5" r="1" fill="#b8a24a"/><circle cx="27.5" cy="27.5" r="1" fill="#b8a24a"/>
    </svg>`,
    { size: 128 },
  );
  const glyphTex = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="38" height="38" rx="4" fill="#0d0e12" stroke="#ff2fb5" stroke-width="2"/>
      <g stroke="#ff2fb5" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M8 12 H32"/><path d="M20 6 V34"/><path d="M10 22 H30"/><path d="M12 30 L20 22 L28 30"/><rect x="12" y="14" width="16" height="6" stroke-width="2"/>
      </g>
    </svg>`,
    { size: 192 },
  );

  // ---------- paints ----------
  const baseHull = paint((p, n) =>
    mix(
      mix(P.hull, P.hullLight, smoothstep(0.2, 1, n.y) * 0.6),
      P.rust,
      smoothstep(1.7, 1.3, p.y) * 0.45 * noise(p, 0.25, 3),
    ),
  );
  const HULL = panelled(baseHull, { size: 0.55, aspect: 0.65, rivets: 0.07 });
  const HULLD = panelled(P.hullDark, { size: 0.35, aspect: 0.8, rivets: 0.05 });
  const DECKP = panelled(P.hullLight, { size: 0.45, aspect: 1, rivets: 0.06 });

  // ---------- helpers ----------
  const body = J.body;
  const part = (geo: any, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: body, at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], o: any = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], bone: any, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...o });
  const xf = (geo: THREE.BufferGeometry, p: number[], rot: number[] = [0, 0, 0], sc: number[] = [1, 1, 1]) => {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(p[0], p[1], p[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
      new THREE.Vector3(sc[0], sc[1], sc[2]),
    );
    return geo.applyMatrix4(m);
  };
  const flush = (list: THREE.BufferGeometry[], color: any, bone: any = body) => {
    if (!list.length) return;
    const g = mergeGeometries(list)!;
    b.part(g, color, { bone, at: [0, 0, 0], flat: true });
  };

  // ---------- main body: chamfered armored box ----------
  b.extrude(
    [
      [-1.35, 0], [1.35, 0], [1.47, 0.12], [1.47, 0.78], [1.38, 0.95],
      [-1.38, 0.95], [-1.47, 0.78], [-1.47, 0.12],
    ].map((p) => [p[0], p[1], "sharp"] as any),
    { at: [0, 1.3, -1.475], x: [1, 0, 0], y: [0, 1, 0], thickness: 4.65, color: HULL, bone: body },
  );
  box(2.7, 0.05, 4.55, DECKP, [0, DECK + 0.02, -1.55]);

  // raised command block under the turret ring, sloped rear
  b.extrude(
    [[-0.45, 0], [0.9, 0], [0.9, 0.3], [0.0, 0.3], [-0.45, 0.06]].map((p) => [p[0], p[1], "sharp"] as any),
    { at: [0, DECK, 0], x: [0, 0, 1], thickness: 2.6, color: HULL, bone: body },
  );
  cyl(0.4, 0.44, 0.04, 12, P.steel, [0, DECK + 0.3 + 0.02, 0.55]);
  for (const s of [1, -1]) {
    glow(box(0.03, 0.05, 0.6, P.neonCyan, [s * 1.31, DECK + 0.17, 0.35]), 1.2);
    box(0.05, 0.22, 0.2, P.trim, [s * 1.32, DECK + 0.1, 0.85]);
  }

  // corner armor posts + trim
  for (const s of [1, -1])
    for (const z of [-3.78, 0.83]) {
      box(0.2, 1.0, 0.2, P.hullLight, [s * 1.42, 1.78, z]);
      box(0.1, 0.08, 0.1, P.steel, [s * 1.42, 2.3, z]);
    }
  const hazardTrim = (len: number, at: number[], rot: number[]) =>
    part(new THREE.BoxGeometry(0.06, 0.06, len), P.trim, at, { rotation: rot });
  for (const s of [1, -1]) {
    box(0.04, 0.05, 4.5, P.trim, [s * 1.49, 2.12, -1.5]);
    glow(box(0.03, 0.035, 4.5, P.neonCyan, [s * 1.485, 1.47, -1.5]), 1.3);
    box(0.05, 0.06, 4.5, P.hullDark, [s * 1.49, 1.55, -1.5]);
  }
  hazardTrim(0.01, [0, -5, 0], [0, 0, 0]).mesh.visible = false;

  // ribs
  for (const s of [1, -1])
    for (let i = 0; i < 7; i++) {
      const z = -3.5 + 0.7 * i;
      box(0.07, 0.72, 0.12, HULLD, [s * 1.495, 1.8, z]);
    }

  // side decals / panels
  for (const s of [1, -1]) {
    for (const z of [-3.15, -1.75]) glow(plane(0.52, 0.36, statusTex, [s * 1.476, 1.88, z], [s, 0, 0], body), 1.2);
    for (const z of [-2.45, -0.35]) plane(0.5, 0.4, warnTex, [s * 1.476, 1.88, z], [s, 0, 0], body);
    glow(plane(0.4, 0.4, glyphTex, [s * 1.476, 1.88, -1.05], [s, 0, 0], body), 1);
    plane(0.5, 0.12, hazardStripes, [s * 1.476, 1.64, 0.35], [s, 0, 0], body);
  }

  // tie-down rings (merged)
  {
    const rings: THREE.BufferGeometry[] = [];
    for (const s of [1, -1]) {
      for (const z of [-3.2, -2.0, -0.8, 0.5])
        rings.push(xf(new THREE.TorusGeometry(0.06, 0.014, 4, 8), [s * 1.5, 1.4, z], [0, Math.PI / 2, 0]));
      for (const z of [-3.6, -0.75])
        rings.push(xf(new THREE.TorusGeometry(0.06, 0.014, 4, 8), [s * 1.37, DECK + 0.05, z], [Math.PI / 2, 0, 0]));
    }
    flush(rings, P.steel);
  }

  // ---------- deck hatches ----------
  const hatchJ = b.joint("cargoBedHatch", { parent: body, at: [0, DECK + 0.05, -2.68], dir: [-1, 0, 0], role: "hinge", group: "cargo" });
  box(0.92, 0.03, 0.72, P.trim, [0, DECK + 0.06, -2.35], { bone: hatchJ });
  box(0.8, 0.05, 0.6, P.hullDark, [0, DECK + 0.1, -2.35], { bone: hatchJ });
  part(new THREE.TorusGeometry(0.08, 0.016, 4, 8), P.steel, [0, DECK + 0.14, -2.35], { bone: hatchJ, rotation: [90, 0, 0] });
  glow(box(0.1, 0.02, 0.04, P.neonCyan, [0.3, DECK + 0.13, -2.1], { bone: hatchJ }), 1.3);
  for (const x of [-0.45, 0.45]) cyl(0.03, 0.03, 0.9 * 0 + 0.1, 6, P.steel, [x, DECK + 0.08, -2.68], { bone: hatchJ, rotation: [0, 0, 90] });
  // small side hatches
  for (const s of [1, -1]) {
    box(0.5, 0.03, 0.4, P.trim, [s * 0.9, DECK + 0.045, -3.0]);
    box(0.42, 0.05, 0.32, P.hullDark, [s * 0.9, DECK + 0.07, -3.0]);
  }

  // ---------- missile pods ----------
  for (const s of [1, -1]) {
    const base = new THREE.Matrix4().compose(
      new THREE.Vector3(s * 1.05, 2.5, -1.6),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0, 0)),
      new THREE.Vector3(0.5, 0.5, 0.5),
    );
    const fr: THREE.BufferGeometry[] = [], tu: THREE.BufferGeometry[] = [], hd: THREE.BufferGeometry[] = [],
      tp: THREE.BufferGeometry[] = [], tr: THREE.BufferGeometry[] = [];
    const add = (list: THREE.BufferGeometry[], g: THREE.BufferGeometry, x: number, y: number, z: number) =>
      list.push(g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(base, new THREE.Matrix4().makeTranslation(x, y, z))));
    add(fr, new THREE.BoxGeometry(0.64, 0.46, 1.3), 0, 0, 0);
    add(fr, new THREE.BoxGeometry(0.7, 0.06, 1.34), 0, 0.25, 0);
    add(tr, new THREE.BoxGeometry(0.66, 0.48, 0.12), 0, 0, 0.3);
    add(tr, new THREE.BoxGeometry(0.66, 0.48, 0.12), 0, 0, -0.35);
    for (const cx of [-0.15, 0.15])
      for (const cy of [-0.1, 0.1]) {
        add(tu, new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8).rotateX(Math.PI / 2), cx, cy, 0.66);
        add(hd, new THREE.ConeGeometry(0.075, 0.2, 6).rotateX(Math.PI / 2), cx, cy, 0.74);
        add(tp, new THREE.ConeGeometry(0.03, 0.08, 5).rotateX(Math.PI / 2), cx, cy, 0.88);
      }
    flush(fr, P.hullDark);
    flush(tu, P.black);
    flush(hd, P.olive);
    flush(tp, P.neonRed);
    flush(tr, P.trim);
    // pedestal and clamp
    box(0.5, 0.2, 0.9, HULLD, [s * 1.05, DECK + 0.1, -1.4]);
    box(0.62, 0.04, 0.1, P.steel, [s * 1.05, DECK + 0.02, -1.0]);
  }

  // ---------- crates & cans ----------
  const crate = (x: number, z: number, ry: number, h = 0.2) =>
    b.part(new THREE.BoxGeometry(0.5, h, 0.5), "#ffffff", {
      bone: body, at: [x, DECK + 0.045 + h / 2, z], rotation: [0, ry, 0], texture: crateTex,
    });
  crate(-0.3, -1.2, 6);
  crate(0.35, -1.25, -4);
  crate(0.02, -0.75, 0, 0.2);
  for (const [x, z, r] of [[-0.75, -1.2, 20], [0.8, -1.25, -15]] as number[][]) {
    box(0.3, 0.12, 0.14, P.ammo, [x, DECK + 0.045 + 0.06, z], { rotation: [0, r, 0] });
    part(new THREE.TorusGeometry(0.05, 0.01, 4, 6), P.black, [x, DECK + 0.045 + 0.13, z], { rotation: [0, r, 0] });
  }
  box(0.7, 0.04, 0.05, P.steel, [0.02, DECK + 0.3, -1.0], { rotation: [0, 8, 0] });
  cyl(0.09, 0.09, 0.2, 8, P.olive, [0.35, DECK + 0.145, -0.4]);
  cyl(0.095, 0.095, 0.03, 8, P.trim, [0.35, DECK + 0.12, -0.4]);

  // ---------- vent stacks (merged) ----------
  {
    const vb: THREE.BufferGeometry[] = [], vs: THREE.BufferGeometry[] = [], vc: THREE.BufferGeometry[] = [];
    const vents = [[0.62, -2.0], [-0.62, -2.0], [0.82, -3.0], [-0.82, -3.0]];
    for (const [x, z] of vents) {
      vb.push(xf(new THREE.BoxGeometry(0.2, 0.16, 0.2), [x, DECK + 0.1, z]));
      vc.push(xf(new THREE.BoxGeometry(0.26, 0.04, 0.26), [x, DECK + 0.2, z]));
      for (let k = 0; k < 3; k++) vs.push(xf(new THREE.BoxGeometry(0.16, 0.02, 0.02), [x, DECK + 0.06 + k * 0.045, z + 0.105]));
    }
    flush(vb, P.hullDark);
    flush(vc, P.trim);
    flush(vs, P.black);
  }

  // ---------- exhaust pair ----------
  {
    const clamps: THREE.BufferGeometry[] = [], caps: THREE.BufferGeometry[] = [], shield: THREE.BufferGeometry[] = [];
    for (const s of [1, -1]) {
      const x = s * 1.18, z = -3.55;
      cyl(0.08, 0.08, 0.26, 8, P.steel, [x, DECK + 0.15, z]);
      cyl(0.13, 0.15, 0.1, 8, P.rust, [x, DECK + 0.07, z]);
      for (const y of [0.1, 0.2]) clamps.push(xf(new THREE.CylinderGeometry(0.105, 0.105, 0.04, 8), [x, DECK + y, z]));
      caps.push(xf(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 8), [x, DECK + 0.28, z]));
      shield.push(xf(new THREE.BoxGeometry(0.22, 0.2, 0.03), [x, DECK + 0.12, z - 0.11]));
      shield.push(xf(new THREE.BoxGeometry(0.03, 0.2, 0.14), [x + s * 0.1, DECK + 0.12, z - 0.05]));
    }
    flush(clamps, P.trim);
    flush(caps, P.black);
    flush(shield, P.hullLight);
  }

  // ---------- spare tyre ----------
  {
    const sx = 0, sz = -3.3, sy = DECK + 0.045 + 0.1;
    cyl(0.4, 0.4, 0.2, 8, P.rubber, [sx, sy, sz]);
    const treads: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      treads.push(xf(new THREE.BoxGeometry(0.1, 0.22, 0.08), [sx + Math.cos(a) * 0.41, sy, sz + Math.sin(a) * 0.41], [0, -a, 0]));
    }
    flush(treads, P.black);
    cyl(0.2, 0.2, 0.22, 6, P.steel, [sx, sy, sz]);
    glow(cyl(0.09, 0.09, 0.02, 8, P.neonCyan, [sx, sy + 0.115, sz]), 1.4);
    box(0.1, 0.04, 0.9, P.hullDark, [sx, sy + 0.12, sz]);
    for (const dz of [-0.4, 0.4]) cyl(0.035, 0.035, 0.06, 6, P.steel, [sx, sy + 0.14, sz + dz]);
  }

  // ---------- antennas ----------
  for (const s of [1, -1]) {
    const bx = s * 1.33, bz = -0.65;
    cyl(0.07, 0.09, 0.1, 8, P.steel, [bx, DECK + 0.07, bz]);
    if (s === 1) {
      b.rod([bx, DECK + 0.12, bz], [bx + 0.08, DECK + 0.27, bz - 0.15], [0.016, 0.006], P.steel, { bone: body });
      glow(part(new THREE.SphereGeometry(0.03, 6, 4), P.neonRed, [bx + 0.08, DECK + 0.29, bz - 0.15]), 2);
    } else {
      b.rod([bx, DECK + 0.12, bz], [bx, DECK + 0.2, bz], 0.025, P.steel, { bone: body });
      part(new THREE.CylinderGeometry(0.14, 0.04, 0.05, 8), P.hullLight, [bx, DECK + 0.23, bz], { rotation: [-35, 0, 0] });
      glow(cyl(0.02, 0.02, 0.05, 6, P.neonCyan, [bx, DECK + 0.24, bz - 0.04], { rotation: [-35, 0, 0] }), 1.5);
    }
  }

  // ---------- tail lights ----------
  for (const s of [1, -1]) {
    box(0.3, 0.55, 0.12, P.hullDark, [s * 1.3, 1.75, -3.86]);
    glow(box(0.22, 0.14, 0.05, P.neonRed, [s * 1.3, 1.92, -3.91]), 1.8);
    glow(box(0.22, 0.14, 0.05, P.neonRed, [s * 1.3, 1.72, -3.91]), 1.4);
    glow(box(0.14, 0.1, 0.05, P.lampWhite, [s * 1.3, 1.54, -3.91]), 1.4);
  }

  // ---------- rear ramp ----------
  const ramp = J.rampHinge;
  const rb = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: ramp, at, ...o });
  rb(2.3, 1.0, 0.14, HULLD, [0, 1.82, -3.88]);
  // frame trim
  rb(2.34, 0.05, 0.16, P.trim, [0, 2.33, -3.88]);
  rb(2.34, 0.05, 0.16, P.trim, [0, 1.31, -3.88]);
  for (const s of [1, -1]) rb(0.05, 1.0, 0.16, P.trim, [s * 1.17, 1.82, -3.88]);
  plane(2.1, 0.3, chevrons, [0, 2.12, -3.957], [0, 0, -1], ramp);
  glow(plane(0.4, 0.4, glyphTex, [-0.65, 1.78, -3.957], [0, 0, -1], ramp), 1);
  plane(0.46, 0.37, warnTex, [0.65, 1.78, -3.957], [0, 0, -1], ramp);
  plane(0.5, 0.25, plateTex, [0, 1.55, -3.957], [0, 0, -1], ramp);
  glow(rb(2.1, 0.035, 0.02, P.neonMagenta, [0, 1.4, -3.96]), 1.6);
  glow(rb(2.1, 0.02, 0.02, P.neonMagenta, [0, 1.95, -3.96]), 1.2);
  // cross braces
  rb(2.1, 0.06, 0.04, P.hullLight, [0, 1.68, -3.96]);
  // hinge barrels
  for (const x of [-0.9, 0, 0.9])
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), P.steel, { bone: ramp, at: [x, 1.32, -3.92], rotation: [0, 0, 90] });
  // latches
  for (const x of [-0.9, 0.9]) {
    rb(0.14, 0.12, 0.08, P.steel, [x, 2.28, -3.97]);
    glow(rb(0.05, 0.03, 0.02, P.neonCyan, [x, 2.28, -4.0]), 1.5);
  }
  // bolts across ramp (merged)
  {
    const bolts: THREE.BufferGeometry[] = [];
    for (const x of [-1.05, 1.05])
      for (const y of [1.45, 1.8, 2.2]) bolts.push(xf(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), [x, y, -3.965], [Math.PI / 2, 0, 0]));
    flush(bolts, P.steel, ramp);
  }
  // hydraulic struts (body side)
  for (const s of [1, -1]) {
    b.rod([s * 1.2, 2.1, -3.78], [s * 1.2, 1.55, -3.7], 0.035, P.steel, { bone: body });
    b.rod([s * 1.2, 2.1, -3.78], [s * 1.2, 1.9, -3.75], 0.05, P.hullLight, { bone: body });
  }
  // rear bumper step
  box(2.7, 0.1, 0.12, P.hullLight, [0, 1.3, -3.9]);

  // ---------- front wall details ----------
  for (const s of [1, -1]) {
    box(0.1, 0.5, 0.1, P.trim, [s * 1.0, 1.9, 0.86]);
    glow(box(0.04, 0.3, 0.02, P.neonCyan, [s * 1.0, 1.9, 0.92]), 1.2);
  }
  void R; void M;
}
    return buildCargoBed;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhoundTruck" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.62,0.55], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,3,0.75], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.3,0.62,2.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.3,0.62,2.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.3,0.62,-0.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.3,0.62,-0.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.3,0.62,-2.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.3,0.62,-2.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["rampHinge"] = b.joint("rampHinge", { parent: J["body"], at: [0,1.3,-3.9], dir: [1,0,0], role: "hinge", group: "cargo" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
