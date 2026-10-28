import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Revolver Gunblade",
  "description": "A Final Fantasy-style gunblade with a bright steel sword blade, a revolver mechanism at the hilt, a barrel along the spine, gold filigree, glowing sapphire and cyan accents, and a hanging lion pendant, standing upright on its pommel."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  steelBright: "#e3ebf3",
  steel: "#a9b8c9",
  steelShade: "#6f8095",
  steelDeep: "#3e4a5c",
  edgeWhite: "#fbfeff",
  gunmetal: "#2a2e37",
  gunmetalHi: "#4a515e",
  black: "#12141a",
  gold: "#e6b948",
  goldDeep: "#a8741f",
  goldPale: "#fbe08a",
  leather: "#4a3126",
  leatherDark: "#2e1d16",
  leatherHi: "#6d4a37",
  sapphire: "#2c6ee6",
  glowCyan: "#52e8ff",
  ruby: "#c1272f",
  chain: "#cfd6df",
  chainDark: "#7d8794",
  lionFace: "#f0c455",
};
const M = {
  pommelBase: [0, 0, 0] as [number, number, number],
  gripBottom: [0, 0.09, 0] as [number, number, number],
  gripTop: [0, 0.4, 0] as [number, number, number],
  guardPlate: [0, 0.42, 0] as [number, number, number],
  chainAnchor: [0.105, 0.4, -0.04] as [number, number, number],
  cylinderCenter: [0, 0.55, -0.02] as [number, number, number],
  triggerPivot: [0, 0.46, -0.085] as [number, number, number],
  hammerPivot: [0, 0.64, -0.15] as [number, number, number],
  guardLoopFront: [0, 0.47, -0.12] as [number, number, number],
  guardLoopRear: [0, 0.36, -0.04] as [number, number, number],
  bladeBase: [0, 0.7, 0] as [number, number, number],
  breechTop: [0, 0.7, -0.105] as [number, number, number],
  barrelBase: [0, 0.7, -0.105] as [number, number, number],
  muzzle: [0, 1.34, -0.105] as [number, number, number],
  bladeTip: [0, 1.5, 0.03] as [number, number, number],
  spineLine: [0, 0.7, -0.07] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // hilt
  (() => {
function buildHilt({ b, J, P, M }: any) {
  const bone = J.weapon;
  const R = rng(11);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const lathe = (pts: number[][], c: string, y: number, seg = 8) =>
    b.lathe(pts, { at: [0, y, 0], axis: [0, 1, 0], segments: seg, color: c, bone });

  // Pommel: lower dome (goldDeep), main cap (gold), flat base on y=0
  lathe([[0, 0], [0.034, 0], [0.046, 0.012], [0.05, 0.028], [0.046, 0.034], [0, 0.034]], P.goldDeep, 0, 10);
  lathe([[0, 0.034], [0.046, 0.034], [0.05, 0.05], [0.042, 0.072], [0.03, 0.088], [0, 0.09]], P.gold, 0, 10);
  // underside gem in the bottom face (sunk slightly)
  part(new THREE.OctahedronGeometry(0.02, 0), P.sapphire, [0, 0.004, 0], { scale: [1, 0.6, 1] });
  part(new THREE.OctahedronGeometry(0.008, 0), P.glowCyan, [0, 0.002, 0.004], { scale: [1, 0.5, 1] });
  // front gem on the rounded face
  part(new THREE.OctahedronGeometry(0.014, 0), P.sapphire, [0, 0.05, 0.047], { scale: [1, 1.2, 0.8] });
  part(new THREE.OctahedronGeometry(0.005, 0), P.glowCyan, [0, 0.053, 0.056]);
  // studs ring
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    part(new THREE.SphereGeometry(0.006, 6, 4), P.goldPale, [Math.sin(a) * 0.049, 0.03, Math.cos(a) * 0.049]);
  }
  // pommel highlight ring
  lathe([[0.043, 0.074], [0.047, 0.074], [0.047, 0.077], [0.043, 0.077]], P.goldPale, 0, 10);

  // Grip
  const y0 = 0.09, y1 = 0.4;
  b.rod([0, y0, 0], [0, y1, 0], 0.03, P.leather, { bone, section: "circle", sides: 8, caps: "flat" });
  // diagonal cord wrap: tilted thin rings
  for (let i = 0; i < 17; i++) {
    const y = 0.115 + i * 0.016;
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.0305, 0.0028, 4, 12));
    m.geometry.rotateX(Math.PI / 2);
    part(m.geometry, P.leatherDark, [0, y, 0], { rotation: [0, 0, 0] });
    // diagonal feel: a small tilt on alternating rings
    part(new THREE.BoxGeometry(0.008, 0.012, 0.008), P.leatherDark, [Math.sin(i * 0.9) * 0.03, y + 0.007, Math.cos(i * 0.9) * 0.03], {
      rotation: [0, (i * 0.9 * 180) / Math.PI, 20],
    });
  }
  // highlight strips on front and back
  for (const s of [1, -1])
    part(new THREE.BoxGeometry(0.008, 0.26, 0.004), P.leatherHi, [0.0, 0.25, s * 0.0305], { rotation: [0, 0, 0] });
  for (const s of [1, -1])
    part(new THREE.BoxGeometry(0.004, 0.26, 0.008), P.leatherHi, [s * 0.0305, 0.25, 0], {});

  // Bead band mid-grip
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    part(new THREE.SphereGeometry(0.0072, 6, 4), i % 2 ? P.ruby : P.sapphire, [Math.sin(a) * 0.032, 0.245, Math.cos(a) * 0.032]);
  }
  lathe([[0.03, 0.234], [0.034, 0.234], [0.034, 0.238], [0.03, 0.238]], P.goldDeep, 0, 8);
  lathe([[0.03, 0.252], [0.034, 0.252], [0.034, 0.256], [0.03, 0.256]], P.goldDeep, 0, 8);

  // Collars at bottom and top
  for (const [y, h] of [[0.09, 0.022], [0.378, 0.022]] as number[][]) {
    lathe([[0.027, y], [0.04, y], [0.04, y + h], [0.027, y + h]], P.gold, 0, 8);
    lathe([[0.027, y], [0.042, y], [0.042, y + 0.004], [0.027, y + 0.004]], P.goldDeep, 0, 8);
    lathe([[0.027, y + h - 0.004], [0.042, y + h - 0.004], [0.042, y + h], [0.027, y + h]], P.goldDeep, 0, 8);
    lathe([[0.027, y + 0.01], [0.0415, y + 0.01], [0.0415, y + 0.013], [0.027, y + 0.013]], P.goldPale, 0, 8);
  }

  // Rivets on grip front/back
  for (const z of [1, -1])
    for (const y of [0.15, 0.34])
      part(new THREE.SphereGeometry(0.005, 6, 4), P.gold, [0, y, z * 0.031]);
  for (const x of [1, -1])
    for (const y of [0.15, 0.34])
      part(new THREE.SphereGeometry(0.005, 6, 4), P.gold, [x * 0.031, y, 0]);
  void R; void frame; void M;
}
    return buildHilt;
  })(),
  // receiver
  (() => {
function buildReceiver({ b, J, P, M }: Ctx) {
  const W = J.weapon, CY = J.cylinder, TR = J.trigger, HA = J.hammer;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any = W, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r0: number, r1: number, h: number, seg: number, c: string, at: number[], dir: number[], bone: any = W) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), c, { bone, at, dir });
  const R = rng(5);

  // Frame housing (y 0.44-0.70)
  box(0.08, 0.26, 0.2, P.gunmetal, [0, 0.57, -0.04]);
  // chamfered front edge
  box(0.08, 0.26, 0.04, P.gunmetalHi, [0, 0.57, 0.075], W, [0, 0, 0]);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 4), P.gunmetalHi, { bone: W, at: [0, 0.57, 0.07], rotation: [0, 45, 0] });
  // top faces
  box(0.06, 0.008, 0.18, P.gunmetalHi, [0, 0.704, -0.04]);
  // side plates
  for (const s of [1, -1]) {
    box(0.008, 0.24, 0.18, P.steelDeep, [s * 0.044, 0.57, -0.04]);
    box(0.004, 0.006, 0.17, P.gold, [s * 0.049, 0.69, -0.04]);
    box(0.004, 0.006, 0.17, P.gold, [s * 0.049, 0.45, -0.04]);
    box(0.004, 0.22, 0.006, P.goldDeep, [s * 0.049, 0.57, 0.045]);
    for (const z of [-0.11, 0.03]) for (const y of [0.47, 0.67])
      cyl(0.006, 0.006, 0.006, 6, P.goldPale, [s * 0.05, y, z], [1, 0, 0]);
  }

  // Crossguard
  box(0.24, 0.02, 0.18, P.gold, [0, 0.42, 0.03]);
  box(0.24, 0.008, 0.18, P.goldDeep, [0, 0.408, 0.03]);
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.03, 0.09, 4), P.gold, { bone: W, at: [s * 0.13, 0.45, 0.03], rotation: [0, 0, -s * 12] });
    box(0.01, 0.03, 0.17, P.goldPale, [s * 0.118, 0.435, 0.03]);
    // filigree scrolls
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.TorusGeometry(0.014 - i * 0.002, 0.003, 4, 8), P.goldPale, {
        bone: W, at: [s * (0.06 + i * 0.026), 0.433, 0.07 - i * 0.02], rotation: [90, 0, 0] });
    }
    b.part(new THREE.TorusGeometry(0.012, 0.0035, 4, 8), P.goldDeep, { bone: W, at: [s * 0.09, 0.433, 0.1], rotation: [90, 0, 0] });
  }
  // lug ring at chainAnchor
  b.part(new THREE.TorusGeometry(0.014, 0.004, 6, 10), P.gold, { bone: W, at: [M.chainAnchor[0], 0.425, M.chainAnchor[2]], rotation: [0, 90, 0] });
  box(0.012, 0.012, 0.012, P.goldDeep, [0.105, 0.43, -0.04]);

  // Breech block
  box(0.07, 0.1, 0.08, P.gunmetal, [0, 0.65, -0.11]);
  box(0.05, 0.008, 0.07, P.gunmetalHi, [0, 0.703, -0.11]);
  b.part(new THREE.TorusGeometry(0.036, 0.007, 5, 10), P.gold, { bone: W, at: [0, 0.7, -0.105], rotation: [90, 0, 0] });

  // Blade collar
  box(0.07, 0.02, 0.17, P.gunmetal, [0, 0.69, 0.01]);
  box(0.075, 0.006, 0.175, P.gold, [0, 0.7, 0.01]);
  box(0.075, 0.004, 0.175, P.goldDeep, [0, 0.679, 0.01]);

  // Cylinder drum
  const cc = M.cylinderCenter;
  cyl(0.085, 0.085, 0.07, 10, P.gunmetal, cc, [1, 0, 0], CY);
  for (const s of [1, -1]) {
    cyl(0.088, 0.088, 0.008, 10, P.steelDeep, [s * 0.03, cc[1], cc[2]], [1, 0, 0], CY);
    cyl(0.03, 0.03, 0.006, 8, P.gold, [s * 0.037, cc[1], cc[2]], [1, 0, 0], CY);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const y = cc[1] + Math.cos(a) * 0.056, z = cc[2] + Math.sin(a) * 0.056;
      cyl(0.015, 0.015, 0.005, 8, P.black, [s * 0.037, y, z], [1, 0, 0], CY);
      cyl(0.008, 0.008, 0.007, 6, P.goldPale, [s * 0.038, y, z], [1, 0, 0], CY);
    }
  }
  const jewel = b.part(new THREE.OctahedronGeometry(0.016), P.sapphire, { bone: CY, at: [0.043, cc[1], cc[2]] });
  glow(jewel, 1.3);
  for (let i = 0; i < 10; i++) {
    const a = ((i + 0.5) / 10) * Math.PI * 2;
    box(0.05, 0.004, 0.012, P.black, [0, cc[1] + Math.cos(a) * 0.086, cc[2] + Math.sin(a) * 0.086], CY, [-(a * 180) / Math.PI + 90 - 90, 0, 0]);
  }

  // Trigger
  const tp = M.triggerPivot;
  cyl(0.008, 0.008, 0.02, 6, P.goldDeep, tp, [1, 0, 0], TR);
  b.part(new THREE.TorusGeometry(0.022, 0.006, 5, 8, Math.PI * 0.8), P.gold, { bone: TR, at: [0, tp[1] - 0.03, tp[2] - 0.012], rotation: [0, 90, 150] });

  // Trigger guard loop
  const f = M.guardLoopFront, r = M.guardLoopRear;
  const loop = [f, [0, 0.44, -0.15], [0, 0.39, -0.14], [0, 0.35, -0.1], [0, 0.34, -0.06], r];
  b.sweep(loop, 0.008, { bone: W, color: P.gold });
  b.sweep([[0, 0.352, -0.07], [0, 0.352, -0.035]], 0.006, { bone: W, color: P.goldDeep });

  // Hammer
  const hp = M.hammerPivot;
  cyl(0.014, 0.014, 0.05, 8, P.gold, hp, [1, 0, 0], HA);
  b.sweep([[0, hp[1], hp[2]], [0, hp[1] + 0.025, hp[2] - 0.05], [0, hp[1] + 0.05, hp[2] - 0.1]], [0.018, 0.012], { bone: HA, color: P.gunmetal });
  b.part(new THREE.ConeGeometry(0.012, 0.04, 5), P.gold, { bone: HA, at: [0, hp[1] + 0.065, hp[2] - 0.115], rotation: [-100, 0, 0] });
  box(0.03, 0.01, 0.03, P.goldDeep, [0, hp[1] + 0.058, hp[2] - 0.085], HA);
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.009, 6, 4), P.ruby, { bone: HA, at: [s * 0.026, hp[1], hp[2]] });
}
    return buildReceiver;
  })(),
  // blade
  (() => {
function buildBlade({ b, J, P, M }: Ctx) {
  const bone = J.weapon;
  const R = rng(5);
  // outline in (z, y) space, y measured from the blade base (0.70)
  const outline: [number, number, ("sharp")?][] = [
    [-0.07, 0],
    [0.09, 0],
    [0.098, 0.1],
    [0.09, 0.3],
    [0.075, 0.55],
    [0.05, 0.72],
    [0.03, 0.8, "sharp"],
    [-0.02, 0.77],
    [-0.07, 0.76],
  ] as any;
  const X: [number, number, number] = [0, 0, 1];
  const at = (x: number): [number, number, number] => [x, 0.7, 0];
  const body = b.extrude(outline as any, { at: at(0), x: X, y: [0, 1, 0], thickness: 0.036, bevel: 0.006, color: P.steelBright, bone });

  // bevel strip along the cutting edge (slightly thicker, thinner width)
  const bevel: any = [
    [0.05, 0.1],
    [0.087, 0.1],
    [0.08, 0.3],
    [0.066, 0.55],
    [0.043, 0.72],
    [0.03, 0.79, "sharp"],
    [0.03, 0.7],
    [0.045, 0.5],
    [0.05, 0.3],
  ];
  b.extrude(bevel, { at: at(0), x: X, thickness: 0.04, color: P.steelShade, bone });
  // sharp edge line
  const edge: any = [
    [0.083, 0.1],
    [0.097, 0.1],
    [0.089, 0.3],
    [0.074, 0.55],
    [0.05, 0.72],
    [0.03, 0.8, "sharp"],
    [0.034, 0.72],
    [0.06, 0.55],
    [0.078, 0.3],
  ];
  b.extrude(edge, { at: at(0), x: X, thickness: 0.042, color: P.edgeWhite, bone });

  // spine step line
  b.part(new THREE.BoxGeometry(0.042, 0.66, 0.008), P.steelDeep, { bone, at: [0, 1.1, -0.066] });
  b.part(new THREE.BoxGeometry(0.042, 0.62, 0.006), P.steel, { bone, at: [0, 1.1, -0.058] });

  // fuller grooves (both faces)
  for (const s of [1, -1]) {
    const fx = s * 0.0185;
    b.part(new THREE.BoxGeometry(0.004, 0.58, 0.026), P.steelDeep, { bone, at: [fx, 1.09, 0.0] });
    b.part(new THREE.BoxGeometry(0.0045, 0.58, 0.004), P.edgeWhite, { bone, at: [fx, 1.09, 0.015] });
    b.part(new THREE.BoxGeometry(0.0045, 0.012, 0.03), P.edgeWhite, { bone, at: [fx, 1.385, 0.0] });
    // ricasso
    b.part(new THREE.BoxGeometry(0.004, 0.12, 0.15), P.goldDeep, { bone, at: [s * 0.0185, 0.76, 0.01] });
    b.part(new THREE.BoxGeometry(0.0045, 0.105, 0.135), P.gold, { bone, at: [s * 0.019, 0.76, 0.01] });
    b.part(new THREE.BoxGeometry(0.005, 0.006, 0.14), P.goldPale, { bone, at: [s * 0.0195, 0.815, 0.01] });
    // star emblem: two crossed diamonds + hub
    const ep: [number, number, number] = [s * 0.0215, 0.76, 0.015];
    for (const a of [0, 45, 90, 135]) {
      b.part(new THREE.BoxGeometry(0.003, 0.05, 0.007), P.goldDeep, { bone, at: ep, rotation: [a, 0, 0] });
    }
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.004, 8), P.goldPale, { bone, at: ep, dir: [s, 0, 0] });
    // runes
    for (let i = 0; i < 6; i++) {
      const y = 0.86 + i * 0.09;
      const rp: [number, number, number] = [s * 0.0195, 1.0 + (i - 2.2) * 0.0 + (y - 1.0), 0.0];
      b.part(new THREE.BoxGeometry(0.003, 0.034, 0.02), P.black, { bone, at: rp });
      const k = R();
      const g1 = b.part(new THREE.BoxGeometry(0.0035, 0.026, 0.005), P.glowCyan, { bone, at: [rp[0] + s * 0.001, y, -0.004] });
      const g2 = b.part(new THREE.BoxGeometry(0.0035, 0.005, 0.014 + k * 0.004), P.glowCyan, { bone, at: [rp[0] + s * 0.001, y + (i % 2 ? 0.006 : -0.006), 0.003] });
      glow(g1, 1.5);
      glow(g2, 1.5);
    }
  }

  // edge notches / ridges
  for (let i = 0; i < 3; i++) {
    const y = 0.88 + i * 0.045;
    b.part(new THREE.BoxGeometry(0.04, 0.02, 0.014), i % 2 ? P.steelShade : P.steel, { bone, at: [0, y, 0.098 - i * 0.002] });
  }

  // gold clip band near tip
  b.part(new THREE.BoxGeometry(0.044, 0.02, 0.07), P.goldDeep, { bone, at: [0, 1.4, -0.02] });
  b.part(new THREE.BoxGeometry(0.046, 0.012, 0.066), P.gold, { bone, at: [0, 1.4, -0.02] });

  // tip highlight diagonal strip
  b.rod([0.0, 1.455, 0.015], [0.0, 1.495, 0.032], 0.0, P.edgeWhite, { bone, section: "box", caps: "none", radius: [0.003, 0.0015] } as any);
  b.part(new THREE.BoxGeometry(0.041, 0.006, 0.05), P.edgeWhite, { bone, at: [0, 1.472, 0.02], rotation: [28, 0, 0] });
}
    return buildBlade;
  })(),
  // barrel
  (() => {
function buildBarrel({ b, J, P, M }: Ctx) {
  const bone = J.weapon;
  const CX = 0, CZ = -0.105;
  const y0 = M.barrelBase[1], y1 = M.muzzle[1];
  const R = new (rng as any)(5);

  const cyl = (r0: number, r1: number, h: number, seg: number, color: string, y: number, z = CZ, x = 0, flat = true) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, seg), color, { bone, at: [x, y, z], flat });
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at });

  // main barrel (octagonal, tapering)
  b.part(new THREE.CylinderGeometry(0.034, 0.04, y1 - y0 - 0.02, 8), P.gunmetal, {
    bone, at: [CX, (y0 + y1 - 0.02) / 2, CZ], flat: true,
  });
  // highlight strips on top-facing (+Y not meaningful on vertical); put on back (-Z) and sides
  for (const s of [1, -1]) {
    box(0.006, 0.6, 0.006, P.gunmetalHi, [s * 0.03, 1.02, CZ - 0.02]);
    box(0.005, 0.6, 0.005, P.black, [s * 0.036, 1.02, CZ + 0.005]);
  }
  // shroud sleeve
  cyl(0.052, 0.052, 0.23, 8, P.gunmetal, 0.835);
  cyl(0.046, 0.046, 0.02, 8, P.gunmetalHi, 0.725);
  // cooling slots on both sides and back
  for (let i = 0; i < 7; i++) {
    const y = 0.75 + i * 0.03;
    for (const s of [1, -1]) box(0.006, 0.016, 0.03, P.black, [s * 0.05, y, CZ]);
    box(0.03, 0.016, 0.006, P.black, [0, y, CZ - 0.05]);
  }
  // glow cyan line along shroud
  glow(box(0.004, 0.2, 0.004, P.glowCyan, [0.019, 0.84, CZ - 0.051]), 1.2);
  glow(box(0.004, 0.2, 0.004, P.glowCyan, [-0.019, 0.84, CZ - 0.051]), 1.2);

  // gold bands
  for (const y of [0.72, 0.835, 0.95]) {
    cyl(0.056, 0.056, 0.016, 8, P.gold, y);
    cyl(0.058, 0.058, 0.004, 8, P.goldDeep, y - 0.01);
    cyl(0.057, 0.057, 0.003, 8, P.goldPale, y + 0.006);
  }

  // spine clamps bridging barrel to blade spine
  for (const y of [0.78, 1.0, 1.16, 1.28]) {
    box(0.05, 0.026, 0.05, P.steel, [0, y, -0.088]);
    box(0.054, 0.006, 0.054, P.gold, [0, y + 0.014, -0.088]);
    box(0.054, 0.006, 0.054, P.goldDeep, [0, y - 0.014, -0.088]);
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.004, 5, 4), P.goldPale, { bone, at: [s * 0.026, y, -0.07] });
  }

  // muzzle brake
  cyl(0.034, 0.05, 0.05, 8, P.gold, 1.31);
  cyl(0.05, 0.05, 0.012, 8, P.goldDeep, 1.335);
  cyl(0.052, 0.052, 0.006, 8, P.goldPale, 1.343);
  cyl(0.04, 0.04, 0.012, 8, P.gunmetal, 1.285);
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 8), P.black, { bone, at: [CX, 1.347, CZ] });
  glow(b.part(new THREE.TorusGeometry(0.03, 0.004, 4, 8), P.glowCyan, { bone, at: [CX, 1.347, CZ], rotation: [90, 0, 0] }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.006, 6, 4), P.sapphire, { bone, at: [CX, 1.32, CZ + 0.044] }), 1.4);
  // muzzle slots
  for (const s of [1, -1]) box(0.006, 0.02, 0.03, P.black, [s * 0.046, 1.31, CZ]);

  // front sight fin (back of muzzle)
  b.part(new THREE.ConeGeometry(0.014, 0.04, 4), P.gold, { bone, at: [CX, 1.34, CZ - 0.05], rotation: [-20, 45, 0] });
  box(0.008, 0.03, 0.016, P.goldDeep, [CX, 1.31, CZ - 0.046]);
  // rear sight notch near breech
  box(0.03, 0.014, 0.012, P.gunmetalHi, [CX, 0.76, CZ - 0.05]);
  box(0.008, 0.012, 0.014, P.black, [CX, 0.762, CZ - 0.052]);
  box(0.004, 0.2, 0.004, P.ruby, [CX, 1.1, CZ - 0.042]);

  // filigree vine along -Z side
  const zb = CZ - 0.044;
  for (let i = 0; i < 14; i++) {
    const y = 0.98 + i * 0.022;
    const x = Math.sin(i * 0.9) * 0.012;
    b.part(new THREE.TorusGeometry(0.007, 0.0017, 4, 8, Math.PI * 1.6), P.gold, {
      bone, at: [x, y, zb], rotation: [0, 0, i * 70],
    });
    if (i % 3 === 0) b.part(new THREE.OctahedronGeometry(0.004), P.goldPale, { bone, at: [x + 0.012, y + 0.01, zb - 0.002] });
  }
  box(0.003, 0.3, 0.003, P.goldDeep, [0, 1.12, zb - 0.002]);

  // rivets on shroud
  for (const y of [0.76, 0.91]) for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.004, 5, 4), P.goldPale, { bone, at: [s * 0.036, y, CZ + 0.038] });
}
    return buildBarrel;
  })(),
  // lionCharm
  (() => {
function buildLionCharm({ b, J, P, M }: Ctx) {
  const X = 0.105, Z = -0.04;
  const R = rng(5);

  // jump ring through the lug
  const ringGeo = new THREE.TorusGeometry(0.014, 0.003, 6, 12);
  b.part(ringGeo, P.gold, { bone: J.chain1, at: [X, 0.395, Z], dir: [1, 0, 0], axis: "z" });

  // chain links: alternate orientation and colour
  const ys = [0.375, 0.355, 0.335, 0.315, 0.295, 0.275, 0.255, 0.24];
  const bones = [J.chain1, J.chain1, J.chain2, J.chain2, J.chain3, J.chain3, J.chain3, J.chain3];
  ys.forEach((y, i) => {
    const g = new THREE.TorusGeometry(0.0085, 0.0028, 5, 8).scale(1, 1.5, 1);
    b.part(g, i % 2 ? P.chainDark : P.chain, {
      bone: bones[i],
      at: [X, y, Z],
      dir: i % 2 ? [1, 0, 0] : [0, 0, 1],
      axis: "z",
    });
  });

  // bail
  b.part(new THREE.TorusGeometry(0.012, 0.003, 6, 10), P.gold, { bone: J.pendant, at: [X, 0.232, Z], dir: [1, 0, 0], axis: "z" });

  const cy = 0.185; // medallion centre (kept inside box y>=0.16 with spikes)
  const pb = J.pendant;
  const place = (geo: THREE.BufferGeometry, color: string, p: number[], opt: any = {}) =>
    b.part(geo, color, { bone: pb, at: [X + p[0], cy + p[1], Z + p[2]], ...opt });

  // mane spikes
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const dx = Math.sin(a), dy = Math.cos(a);
    const r0 = 0.034;
    const long = i % 2 ? 0.02 : 0.026;
    place(new THREE.ConeGeometry(0.0085, long, 5), i % 2 ? P.goldDeep : P.gold,
      [dx * (r0 + long / 2 - 0.002), dy * (r0 + long / 2 - 0.002), 0],
      { dir: [dx, dy, 0] });
    place(new THREE.ConeGeometry(0.0045, long * 0.55, 4), P.goldPale,
      [dx * (r0 + long * 0.7), dy * (r0 + long * 0.7), 0.004],
      { dir: [dx, dy, 0] });
  }

  // back disc, rim and face
  place(new THREE.CylinderGeometry(0.04, 0.04, 0.016, 16), P.goldDeep, [0, 0, 0], { dir: [0, 0, 1] });
  place(new THREE.TorusGeometry(0.037, 0.0035, 5, 16), P.gold, [0, 0, 0.009]);
  place(new THREE.CylinderGeometry(0.032, 0.032, 0.014, 14), P.lionFace, [0, 0, 0.003], { dir: [0, 0, 1] });

  // ears
  for (const s of [1, -1]) {
    place(new THREE.SphereGeometry(0.009, 6, 4), P.gold, [s * 0.026, 0.026, 0.01]);
    place(new THREE.SphereGeometry(0.0048, 5, 4), P.goldDeep, [s * 0.026, 0.026, 0.017]);
  }

  // sapphire forehead gem
  place(new THREE.OctahedronGeometry(0.0065), P.sapphire, [0, 0.022, 0.014], { scale: [1, 1.3, 0.8] });

  // eyes
  for (const s of [1, -1]) {
    place(new THREE.SphereGeometry(0.0055, 6, 4), P.black, [s * 0.013, 0.008, 0.015], { scale: [1.2, 0.8, 0.6] });
    place(new THREE.SphereGeometry(0.0018, 4, 3), "#ffffff", [s * 0.012, 0.0095, 0.0185]);
    // brows
    place(new THREE.BoxGeometry(0.012, 0.0025, 0.003), P.goldDeep, [s * 0.013, 0.016, 0.014], { rotation: [0, 0, s * -15] });
  }

  // muzzle
  place(new THREE.SphereGeometry(0.014, 8, 6), P.gold, [0, -0.011, 0.012], { scale: [1.3, 0.9, 0.6] });
  place(new THREE.ConeGeometry(0.0055, 0.006, 3), P.black, [0, -0.004, 0.0195], { rotation: [0, 0, 180] });
  place(new THREE.BoxGeometry(0.0025, 0.007, 0.002), P.black, [0, -0.0105, 0.0195]);
  for (const s of [1, -1]) {
    place(new THREE.BoxGeometry(0.011, 0.0024, 0.002), P.black, [s * 0.0058, -0.0145, 0.0195], { rotation: [0, 0, s * 20] });
    // cheek dots
    place(new THREE.SphereGeometry(0.0013, 4, 3), P.goldDeep, [s * 0.009, -0.009 + R() * 0.001, 0.0195]);
  }

  // wings / feathers at the sides
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const len = 0.022 - k * 0.003;
      const ang = 20 + k * 22;
      const rad = (ang * Math.PI) / 180;
      const dx = s * Math.cos(rad), dy = Math.sin(rad) * -1 + 0.2;
      place(new THREE.ConeGeometry(0.004, len, 4), k === 1 ? P.goldPale : P.gold,
        [s * (0.04 + k * 0.004) + dx * len * 0.3, 0.012 - k * 0.012, -0.011],
        { dir: [dx, dy, 0] });
    }
  }
}
    return buildLionCharm;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "revolverGunblade" });
  const J: Record<string, Joint> = {};
  J["weapon"] = b.joint("weapon", { at: [0,0.4,0], dir: [0,1,0], role: "spine" });
  J["cylinder"] = b.joint("cylinder", { parent: J["weapon"], at: [0,0.55,-0.02], dir: [1,0,0], role: "hinge", group: "mechanism" });
  J["trigger"] = b.joint("trigger", { parent: J["weapon"], at: [0,0.46,-0.085], dir: [0,-0.6,-0.8], role: "hinge", group: "mechanism" });
  J["hammer"] = b.joint("hammer", { parent: J["weapon"], at: [0,0.64,-0.15], dir: [0,0.5,-0.85], role: "hinge", group: "mechanism" });
  J["chain1"] = b.joint("chain1", { parent: J["weapon"], at: [0.105,0.4,-0.04], dir: [0,-1,0], role: "tail", group: "charm" });
  J["chain2"] = b.joint("chain2", { parent: J["chain1"], at: [0.105,0.34,-0.04], dir: [0,-1,0], role: "tail", group: "charm" });
  J["chain3"] = b.joint("chain3", { parent: J["chain2"], at: [0.105,0.28,-0.04], dir: [0,-1,0], role: "tail", group: "charm" });
  J["pendant"] = b.joint("pendant", { parent: J["chain3"], at: [0.105,0.22,-0.04], dir: [0,-1,0], role: "tail", group: "charm" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
