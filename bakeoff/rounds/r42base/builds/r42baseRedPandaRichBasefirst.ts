import * as THREE from "three";
import { type Builder, createBuilder, frame, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // head
  (() => {
function buildHead(b: Builder) {
  // The base source was not included in the prompt, so this part is placed in model space
  // inside its box and uses its own joint, headJaw, for the lower jaw.
  const ORANGE = "#d8641e", DEEP = "#a8421a", CREAM = "#fff1d6", WHITE = "#ffffff";
  const DARK = "#3a1e14", NOSE = "#16101a", IRIS = "#f0a020", IRIS2 = "#ffd35a";
  const C: [number, number, number] = [0, 0.95, 0.3];
  const p = (x: number, y: number, z: number): [number, number, number] => [C[0] + x, C[1] + y, C[2] + z];
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const ell = (color: string, at: [number, number, number], sc: [number, number, number], r = 1, rot?: [number, number, number]) =>
    b.part(sph(r), color, { at, scale: sc, rotation: rot });

  // cranium fur cap and forehead
  ell(ORANGE, p(0, 0.02, 0.01), [0.15, 0.13, 0.14]);
  ell(DEEP, p(0, 0.1, 0.07), [0.05, 0.02, 0.07]);

  // cheek ruffs: white, with tufted points
  const jaw = b.joint("headJaw", { at: p(0, -0.06, 0.1), aim: p(0, -0.07, 0.25) });
  for (const s of [1, -1]) {
    ell(CREAM, p(s * 0.13, -0.04, 0.05), [0.075, 0.075, 0.09]);
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry(0.03, 0.07, 5), WHITE, {
        at: p(s * (0.18 + i * 0.012), -0.02 - i * 0.04, 0.05),
        rotation: [0, 0, -s * (90 + i * 25)],
      });
    }
    // ears: orange shell, cream rim, dark inner
    const ex = s * 0.11, ey = 0.14;
    ell(ORANGE, p(ex, ey, -0.02), [0.06, 0.06, 0.03]);
    ell(CREAM, p(ex, ey + 0.002, -0.0), [0.062, 0.062, 0.018]);
    ell(DARK, p(ex, ey, 0.008), [0.04, 0.042, 0.012]);
    // eyes: dark base, iris, highlights
    const eyp = p(s * 0.065, 0.035, 0.125);
    ell(DARK, eyp, [0.034, 0.042, 0.02]);
    ell(IRIS, [eyp[0], eyp[1] - 0.004, eyp[2] + 0.012], [0.026, 0.034, 0.012]);
    ell(IRIS2, [eyp[0], eyp[1] - 0.02, eyp[2] + 0.016], [0.02, 0.012, 0.008]);
    ell(NOSE, [eyp[0], eyp[1] - 0.002, eyp[2] + 0.02], [0.012, 0.02, 0.006]);
    ell(WHITE, [eyp[0] - s * 0.01, eyp[1] + 0.015, eyp[2] + 0.024], [0.01, 0.012, 0.006]);
    // tear-line marks
    b.rod([eyp[0] + s * 0.005, eyp[1] - 0.04, eyp[2] + 0.01], p(s * 0.085, -0.075, 0.15), 0.006, DEEP);
    // brow tufts
    b.part(new THREE.ConeGeometry(0.014, 0.05, 5), CREAM, { at: [eyp[0], eyp[1] + 0.052, eyp[2] + 0.005], rotation: [-10, 0, -s * 25] });
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.rod(p(s * 0.08, -0.05 - i * 0.012, 0.19), p(s * 0.26, -0.03 - i * 0.035 + 0.02, 0.17 + (i - 1) * 0.03), 0.0025, WHITE);
    }
  }

  // muzzle, nose, mouth
  ell(CREAM, p(0, -0.05, 0.17), [0.065, 0.05, 0.065]);
  ell(NOSE, p(0, -0.025, 0.225), [0.02, 0.014, 0.013]);
  b.rod(p(0, -0.04, 0.225), p(0, -0.065, 0.22), 0.004, DARK);

  // lower jaw on its own joint
  b.part(new THREE.BoxGeometry(0.075, 0.025, 0.1), CREAM, { bone: jaw, at: p(0, -0.085, 0.16) });
  ell(DEEP, p(0, -0.072, 0.17), [0.03, 0.008, 0.045]);
  ell(CREAM, p(0, -0.09, 0.2), [0.034, 0.016, 0.03]);
}
    return buildHead;
  })(),
  // legsAndPaws
  (() => {
function buildLegsAndPaws(b: Builder) {
  // The base source was not available (the brief showed a placeholder), so joint positions are assumed.
  const FUR = "#4a2a1c";
  const FUR_DARK = "#2e1a12";
  const CUFF = "#f3e6cf";
  const BEAN = "#e8909a";
  const CLAW = "#efe4c8";
  const PAW_Y = 0.295;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const tag = (front ? "F" : "H") + side;
      const parent = (front ? "shoulder" : "hip") + side;
      const root: [number, number, number] = front ? [s * 0.13, 0.58, 0.2] : [s * 0.14, 0.52, -0.2];
      const knee: [number, number, number] = front ? [s * 0.2, 0.43, 0.25] : [s * 0.17, 0.4, -0.3];
      const paw: [number, number, number] = front ? [s * 0.26, PAW_Y, 0.31] : [s * 0.17, PAW_Y, -0.2];

      const chain = b.chain(`legsAndPaws_${tag}`, [root, knee, paw], {
        parent,
        names: [`legsAndPaws_upper${tag}`, `legsAndPaws_lower${tag}`, `legsAndPaws_paw${tag}`],
        role: "leg",
        contact: [paw[0], 0.27, paw[2]],
      });
      b.sweep(chain, front ? [0.055, 0.042] : [0.065, 0.044], { color: FUR });
      const tip = chain.tip ?? chain.joints[chain.joints.length - 1];

      // knee/elbow pad
      b.part(new THREE.SphereGeometry(0.048, 7, 5), FUR_DARK, { bone: chain.joints[1], at: knee });

      // fur cuff above the paw
      const cuffAt: [number, number, number] = [
        paw[0] + (knee[0] - paw[0]) * 0.22,
        PAW_Y + 0.07,
        paw[2] + (knee[2] - paw[2]) * 0.22,
      ];
      b.part(new THREE.CylinderGeometry(0.056, 0.064, 0.045, 8), CUFF, { bone: tip, at: cuffAt });
      b.part(new THREE.ConeGeometry(0.064, 0.03, 8), CUFF, {
        bone: tip,
        at: [cuffAt[0], cuffAt[1] - 0.034, cuffAt[2]],
        rotation: [180, 0, 0],
      });

      // paw
      b.part(new THREE.SphereGeometry(1, 8, 6), FUR_DARK, {
        bone: tip,
        at: [paw[0], PAW_Y, paw[2] + 0.015],
        scale: [0.05, 0.03, 0.065],
      });

      // toes with beans and claws
      for (const k of [-1, 0, 1]) {
        const tx = paw[0] + k * 0.03;
        const tz = paw[2] + 0.07 - Math.abs(k) * 0.01;
        b.part(new THREE.SphereGeometry(0.02, 6, 4), FUR_DARK, { bone: tip, at: [tx, PAW_Y - 0.003, tz] });
        b.part(new THREE.SphereGeometry(0.009, 5, 4), BEAN, { bone: tip, at: [tx, PAW_Y - 0.004, tz + 0.017] });
        b.spike([tx, PAW_Y + 0.004, tz + 0.015], [k * 0.15, -0.1, 1], 0.03, 0.007, {
          color: CLAW,
          bone: tip,
        });
      }
      // main pad bean
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BEAN, {
        bone: tip,
        at: [paw[0], PAW_Y - 0.012, paw[2] + 0.005],
        scale: [1.2, 0.5, 1],
      });
    }
  }
}
    return buildLegsAndPaws;
  })(),
  // tail
  (() => {
function buildTail(b: Builder) {
  const RUST = "#c4572a";
  const CREAM = "#f3deb4";
  const DARK = "#4a2316";
  const TUFT = "#e0763a";

  // Centreline curving up and back, inside the box.
  const pts: [number, number, number][] = [
    [0, 0.5, -0.3],
    [0, 0.5, -0.5],
    [0.02, 0.62, -0.7],
    [0.04, 0.85, -0.82],
    [0.02, 1.0, -0.78],
  ];
  const path = catmull(pts);
  const root = b.joint("tailRoot", { parent: "tailBase", at: pts[0], aim: pts[1], role: "tail" });
  const chain = b.chain("tail", path, { parent: root, count: 6, role: "tail" });

  const radius = (t: number) => {
    const r = 0.07 + 0.09 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.85) + 0.02;
    return Math.min(0.15, r * (1 - 0.35 * t * t));
  };
  const bands = 7;
  const colorAt = (t: number) => {
    if (t > 0.93) return DARK;
    return Math.floor(t * bands) % 2 === 0 ? RUST : CREAM;
  };
  const tube = b.sweep(chain, radius, { color: colorAt, sides: 8, caps: "round" });

  // Dark tip cap.
  const tip = path.at(1);
  b.part(new THREE.SphereGeometry(0.06, 6, 5), DARK, { at: tip, bone: chain.joints[chain.joints.length - 1] });

  // Fur tufts along the outside of the tail.
  b.along(tube, 8, (at) => {
    for (const ang of [90, -90, 0]) {
      const p = tube.at(at.t, ang);
      b.stick(new THREE.ConeGeometry(0.03, 0.09, 5), at.t * bands % 2 < 1 ? TUFT : CREAM, p, { embed: 0.3 });
    }
  });
}
    return buildTail;
  })(),
  // furAndAccessories
  (() => {
function buildFurAndAccessories(b: Builder) {
  const CREAM = "#fff1d0", CREAM2 = "#f4d9a8", RUST = "#d9561f", RUST2 = "#b8401a";
  const SCARF = "#2fa7a0", SCARF2 = "#1f7f7a", GOLD = "#f2c14e", GLOW = "#7ff3ff";
  const inBox = (p: THREE.Vector3) =>
    p.x > -0.34 && p.x < 0.34 && p.y > 0.46 && p.y < 0.99 && p.z > -0.39 && p.z < 0.44;
  const skin = b.surface(b.root);
  const ray = (o: number[], d: number[]) => {
    try { const h = skin.ray(o, d); return h && inBox(h.at) ? h : null; } catch { return null; }
  };

  // Chest fur tufts (cream) from the front
  const rng = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  for (let i = 0; i < 14; i++) {
    const x = (rng() - 0.5) * 0.22, y = 0.6 + rng() * 0.16;
    const h = ray([x, y, 0.8], [0, 0, -1]);
    if (!h) continue;
    b.stick(new THREE.ConeGeometry(0.022, 0.07, 5), i % 3 ? CREAM : CREAM2, h, { embed: 0.25, flow: [0, -1, 0] as any });
  }
  // Belly cream patch
  for (const [x, y, r] of [[0, 0.56, 0.07], [0.06, 0.54, 0.05], [-0.06, 0.54, 0.05]]) {
    const h = ray([x, y, 0.8], [0, 0, -1]);
    if (h) b.stick(new THREE.SphereGeometry(r, 7, 5), CREAM, h, { embed: 0.6, scale: [1, 0.35, 1] as any });
  }
  // Back fur tufts from above/behind
  for (let i = 0; i < 16; i++) {
    const x = (rng() - 0.5) * 0.24, z = -0.3 + rng() * 0.5;
    const h = ray([x, 1.2, z], [0, -1, 0]);
    if (!h) continue;
    b.stick(new THREE.ConeGeometry(0.02, 0.08, 5), i % 2 ? RUST : RUST2, h, { embed: 0.25 });
  }

  // Scarf loop around neck base
  let loopOk = false;
  try {
    const loop = skin.loop([0, 0.8, 0.12], { dir: [0, 1, 0], lift: 0.015 });
    b.sweep(loop, 0.03, { color: SCARF, bone: "neck" as any });
    loopOk = true;
    b.sweep(skin.loop([0, 0.76, 0.12], { dir: [0, 1, 0], lift: 0.012 }), 0.012, { color: GOLD, bone: "neck" as any });
  } catch { /* fallback below */ }
  if (!loopOk) b.part(new THREE.TorusGeometry(0.1, 0.03, 6, 12), SCARF, { at: [0, 0.8, 0.12], rotation: [90, 0, 0], bone: "neck" as any });

  // Ribbon tails hanging at the front-left
  for (const [dx, len, col] of [[0.05, 0.2, SCARF], [0.1, 0.15, SCARF2]] as [number, number, string][]) {
    const h = ray([dx, 0.75, 0.8], [0, 0, -1]);
    const at = h ? h.at.clone() : new THREE.Vector3(dx, 0.75, 0.2);
    at.z += 0.02;
    b.extrude([[-0.025, 0], [0.025, 0], [0.025, -len], [0, -len - 0.03, "sharp"], [-0.025, -len]],
      { at: [at.x, at.y, at.z], x: [1, 0, 0], thickness: 0.012, color: col, bone: "spine" as any });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [at.x, at.y - len - 0.03, at.z], bone: "spine" as any });
  }

  // Gold emblem and glowing charm at the throat
  const eh = ray([0, 0.76, 0.8], [0, 0, -1]);
  const ep = eh ? eh.at : new THREE.Vector3(0, 0.76, 0.2);
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), GOLD, { at: [ep.x, ep.y, ep.z + 0.02], dir: [0, 0, 1], bone: "neck" as any });
  b.part(new THREE.OctahedronGeometry(0.028), "#c9892a", { at: [ep.x, ep.y, ep.z + 0.032], bone: "neck" as any });
  glow(b.part(new THREE.OctahedronGeometry(0.02), GLOW, { at: [ep.x, ep.y - 0.075, ep.z + 0.03], scale: [0.8, 1.3, 0.8], bone: "neck" as any }), 1.6);
  b.rod([ep.x, ep.y - 0.03, ep.z + 0.025], [ep.x, ep.y - 0.062, ep.z + 0.03], 0.004, GOLD, { bone: "neck" as any });
}
    return buildFurAndAccessories;
  })(),
  // mossyStone
  (() => {
function buildMossyStone(b: Builder) {
  const MOSS = "#5f9a3a", MOSS2 = "#7fbf4a", DARK = "#3c6a2a";
  const PEB = "#8a8a86", PEB2 = "#6d6d6a", CRACK = "#2e2c30";
  const FERN = "#4aa04a", PETAL = "#9ff0ff", CORE = "#fff3a0";
  const R = 0.5, H = 0.3;
  // assumed dome height at (x,z)
  const hAt = (x: number, z: number) => {
    const d = Math.hypot(x, z) / R;
    return d >= 1 ? 0 : H * Math.sqrt(1 - d * d);
  };
  const glowMat = (p: any, s: number) => {
    const m = p.mesh.material as THREE.MeshStandardMaterial;
    const c = m.clone();
    c.emissive.copy(m.color);
    c.emissiveIntensity = s;
    p.mesh.material = c;
  };
  // moss caps
  const caps: [number, number, number][] = [
    [0, 0, 0.2], [0.18, 0.1, 0.13], [-0.2, 0.08, 0.14], [0.08, -0.22, 0.13],
    [-0.1, -0.15, 0.11], [0.28, -0.12, 0.09], [-0.3, -0.1, 0.08], [0.05, 0.28, 0.1], [-0.15, 0.27, 0.08],
  ];
  caps.forEach(([x, z, r], i) => {
    const y = hAt(x, z);
    b.part(new THREE.CylinderGeometry(r, r * 1.1, 0.025, 7), i % 2 ? MOSS2 : MOSS, {
      at: [x, Math.min(y + 0.004, H - 0.01), z], rotation: [0, i * 23, 0],
    });
  });
  // moss drips on sides
  for (let i = 0; i < 8; i++) {
    const a = i * 0.8 + 0.3, rr = 0.4;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    b.part(new THREE.SphereGeometry(0.05, 6, 4), DARK, {
      at: [x, hAt(x, z) * 0.9 + 0.02, z], scale: [1, 0.5, 1],
    });
  }
  // cracks
  for (let i = 0; i < 4; i++) {
    const a = 0.5 + i * 1.6, rr = 0.36;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    b.part(new THREE.BoxGeometry(0.012, 0.1, 0.012), CRACK, {
      at: [x, hAt(x, z) * 0.7 + 0.03, z], rotation: [0, -a * 57.3, 20],
    });
  }
  // pebbles
  const pebs: [number, number, number][] = [
    [0.52, 0.2, 0.05], [-0.5, 0.25, 0.04], [0.45, -0.38, 0.045], [-0.4, -0.42, 0.06],
    [0.1, 0.55, 0.04], [-0.2, 0.52, 0.035], [0.55, -0.05, 0.03],
  ];
  pebs.forEach(([x, z, r], i) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), i % 2 ? PEB : PEB2, {
      at: [x, r * 0.6, z], scale: [1, 0.7, 1], rotation: [0, i * 40, 0],
    }));
  // ferns
  const fernAt: [number, number][] = [[0.38, 0.22], [-0.4, -0.2], [-0.3, 0.3]];
  fernAt.forEach(([x, z], k) => {
    const y = hAt(x, z);
    for (let j = 0; j < 5; j++) {
      const a = (j / 5) * Math.PI * 2 + k;
      b.part(new THREE.ConeGeometry(0.018, 0.13, 4), FERN, {
        at: [x + Math.cos(a) * 0.03, y + 0.05, z + Math.sin(a) * 0.03],
        rotation: [Math.sin(a) * 40, 0, -Math.cos(a) * 40],
      });
    }
  });
  // glowing flowers
  const fl: [number, number][] = [[0.12, 0.2], [-0.25, 0.0], [0.3, -0.05], [-0.05, -0.3]];
  fl.forEach(([x, z]) => {
    const y = hAt(x, z);
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.04, 4), DARK, { at: [x, y + 0.02, z] });
    for (let j = 0; j < 5; j++) {
      const a = (j / 5) * Math.PI * 2;
      const p = b.part(new THREE.SphereGeometry(0.018, 5, 3), PETAL, {
        at: [x + Math.cos(a) * 0.02, y + 0.045, z + Math.sin(a) * 0.02], scale: [1, 0.5, 1],
      });
      glowMat(p, 1.4);
    }
    glowMat(b.part(new THREE.SphereGeometry(0.012, 5, 4), CORE, { at: [x, y + 0.05, z] }), 1.8);
  });
}
    return buildMossyStone;
  })(),
];

export const BASE_PARTS = [
  {
    id: "head",
    builds: "Red panda face: cream-rimmed round ears with dark inner ear, white cheek ruffs, tear-line markings, big anime eyes with highlights, nose, muzzle, open-able lower jaw, whiskers, brow tufts",
    box: [
      [-0.3, 0.72, 0.0],
      [0.3, 1.2, 0.5],
    ],
    attaches: "Head joint at the front-top of the torso; skull sphere is already built, details seat on its surface",
    joints: ["neck", "head", "jaw"],
    floor: false,
    budget: 200,
  },
  {
    id: "legsAndPaws",
    builds: "Four chunky dark-brown legs with joints, paws with toe beans and claws, balancing pose with arms slightly out, fur cuffs",
    box: [
      [-0.4, 0.25, -0.35],
      [0.4, 0.75, 0.4],
    ],
    attaches: "Shoulder joints at the front upper torso sides and hip joints at the rear lower torso sides; feet reach the stone top",
    joints: ["shoulderL", "shoulderR", "hipL", "hipR"],
    floor: false,
    budget: 200,
  },
  {
    id: "tail",
    builds: "Big bushy ringed tail with alternating rust and cream bands, fur tufts, darker tip, chain of tail joints curving up",
    box: [
      [-0.25, 0.3, -1.0],
      [0.25, 1.1, -0.2],
    ],
    attaches: "Tail root joint at the rear of the torso (tailBase)",
    joints: ["tailBase"],
    floor: false,
    budget: 160,
  },
  {
    id: "furAndAccessories",
    builds: "Fur tufts on chest, belly cream patch, back fur cards, Genshin-style trim: small scarf or ribbon with gold emblem and glowing charm at the neck",
    box: [
      [-0.35, 0.45, -0.4],
      [0.35, 1.0, 0.45],
    ],
    attaches: "Torso surface and neck base",
    joints: ["spine", "neck"],
    floor: false,
    budget: 150,
  },
  {
    id: "mossyStone",
    builds: "Mossy stone detail: moss caps on upward faces, small ferns, pebbles, cracks, small glowing flowers; the stone body itself is the base",
    box: [
      [-0.6, 0, -0.6],
      [0.6, 0.3, 0.6],
    ],
    attaches: "Top and sides of the base stone boulder",
    joints: [],
    floor: true,
    budget: 140,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });

  const STONE = "#8d9096";
  const STONE_DARK = "#6f737a";
  const RUST = "#c8502a";
  const RUST_DARK = "#a63c1e";
  const CREAM = "#f4e6c8";

  // Stone base: round boulder, top at y = 0.28
  const root = b.joint("hips", { at: [0, 0.62, -0.1] });
  const spine = b.joint("spine", { parent: root, at: [0, 0.62, -0.1], aim: [0, 0.72, 0.15] });
  const neck = b.joint("neck", { parent: spine, at: [0, 0.8, 0.12], aim: [0, 0.92, 0.22] });
  const head = b.joint("head", { parent: neck, at: [0, 0.92, 0.22], aim: [0, 0.95, 0.5] });
  b.joint("jaw", { parent: head, at: [0, 0.88, 0.36], aim: [0, 0.86, 0.48] });
  b.joint("tailBase", { parent: root, at: [0, 0.62, -0.3], aim: [0, 0.6, -0.6] });
  for (const [n, s] of [["L", 1], ["R", -1]] as const) {
    b.joint("shoulder" + n, { parent: spine, at: [s * 0.2, 0.62, 0.15], aim: [s * 0.22, 0.4, 0.2] });
    b.joint("hip" + n, { parent: root, at: [s * 0.2, 0.55, -0.3], aim: [s * 0.22, 0.4, -0.2] });
  }

  // Boulder
  b.part(new THREE.IcosahedronGeometry(0.62, 1), STONE, {
    at: [0, 0.0, 0], scale: [1, 0.46, 1], bone: root, flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.1, 8), STONE_DARK, {
    at: [0, 0.2, 0], bone: root, flat: true,
  });

  // Body: torso loft
  b.part(new THREE.SphereGeometry(0.27, 12, 9), RUST, {
    at: [0, 0.6, -0.1], scale: [1, 0.95, 1.5], bone: root,
  });
  b.part(new THREE.SphereGeometry(0.2, 10, 8), RUST, {
    at: [0, 0.68, 0.14], scale: [1, 1, 1.1], bone: spine,
  });
  b.part(new THREE.SphereGeometry(0.2, 10, 8), RUST_DARK, {
    at: [0, 0.5, -0.05], scale: [0.9, 0.7, 1.4], bone: root,
  });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), CREAM, {
    at: [0, 0.6, 0.3], scale: [1, 1.2, 0.6], bone: spine,
  });

  // Neck
  b.part(new THREE.CylinderGeometry(0.13, 0.17, 0.2, 8), RUST, {
    at: [0, 0.82, 0.18], bone: neck,
  });

  // Head: skull and muzzle
  b.part(new THREE.SphereGeometry(0.22, 12, 9), RUST, {
    at: [0, 0.95, 0.3], scale: [1.25, 0.95, 1], bone: head,
  });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), CREAM, {
    at: [0, 0.9, 0.48], scale: [1.2, 0.8, 1.1], bone: head,
  });

    for (const add of PARTS) add(b);
  return b.root;
}
