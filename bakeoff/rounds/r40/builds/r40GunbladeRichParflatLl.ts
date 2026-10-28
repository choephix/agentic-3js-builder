import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Gunblade of the Lionheart Guard",
  "description": "A Final Fantasy style gunblade: a huge single-edged steel sword with a revolver chamber and trigger grip, gold filigree and a glowing cyan edge."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  steelDark: "#5b6577",
  steel: "#a9b4c6",
  steelLight: "#e8eef8",
  edge: "#f6fbff",
  gold: "#e2b13c",
  goldDark: "#8a6420",
  royalBlue: "#233a8c",
  leather: "#3a2418",
  black: "#16161d",
  cyanGlow: "#3ff2ff",
  red: "#b32030",
  chamberMetal: "#3c4352",
};
const M = {
  pommelBase: [0, 0, 0] as [number, number, number],
  gripTop: [0, 0.3, 0] as [number, number, number],
  chamberCenter: [0, 0.43, 0] as [number, number, number],
  guardLine: [0, 0.55, 0] as [number, number, number],
  bladeBase: [0, 0.55, 0] as [number, number, number],
  bladeTip: [0, 1.5, 0] as [number, number, number],
  triggerGuard: [0, 0.36, 0.05] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // grip
  (() => {
function buildGrip({ b, J, P, M }: Ctx) {
  const GOLD = P.gold, GD = P.goldDark, BLUE = P.royalBlue, LEA = P.leather, RED = P.red, BLK = P.black;
  const add = (g: THREE.BufferGeometry, c: string, at: [number, number, number], rot?: [number, number, number], scale?: [number, number, number]) =>
    b.part(g, c, { at, rotation: rot, scale, flat: true } as any);
  const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);

  // pommel: faceted gold
  add(cyl(0.03, 0.045, 0.02, 8), GD, [0, 0.012, 0]);
  add(new THREE.OctahedronGeometry(0.05, 0), GD, [0, 0.055, 0], undefined, [1, 0.8, 1]);
  add(new THREE.OctahedronGeometry(0.046, 0), GOLD, [0, 0.057, 0], undefined, [1, 0.8, 1]);
  add(cyl(0.05, 0.05, 0.012, 8), GOLD, [0, 0.092, 0]);
  add(cyl(0.052, 0.052, 0.004, 8), GD, [0, 0.1, 0]);

  // lion emblem on pommel front (+Z): dark outline, gold face, mane, eyes, nose
  const z = 0.044;
  add(new THREE.CircleGeometry(0.024, 8), BLK, [0, 0.058, z]);
  add(new THREE.CircleGeometry(0.02, 8), GD, [0, 0.058, z + 0.001]);
  add(new THREE.CircleGeometry(0.013, 8), GOLD, [0, 0.057, z + 0.002]);
  for (const s of [1, -1]) {
    add(new THREE.CircleGeometry(0.0025, 5), BLK, [s * 0.005, 0.062, z + 0.003]);
    add(new THREE.ConeGeometry(0.006, 0.01, 3), GD, [s * 0.015, 0.073, z + 0.001]);
  }
  add(new THREE.CircleGeometry(0.003, 5), RED, [0, 0.053, z + 0.003]);
  // red gem on top-back
  add(new THREE.OctahedronGeometry(0.012, 0), RED, [0, 0.057, -0.047]);

  // grip: octagonal leather
  add(cyl(0.03, 0.03, 0.2, 8), LEA, [0, 0.2, 0], [0, 22.5, 0].map((d) => d) as any);
  // blue cloth bands
  for (const y of [0.135, 0.2, 0.265]) {
    add(cyl(0.0335, 0.0335, 0.026, 8), BLUE, [0, y, 0]);
    add(cyl(0.0345, 0.0345, 0.004, 8), GOLD, [0, y + 0.015, 0]);
    add(cyl(0.0345, 0.0345, 0.004, 8), GD, [0, y - 0.015, 0]);
  }
  // leather wrap diagonal ridges
  for (let i = 0; i < 6; i++) {
    const y = 0.16 + i * 0.022 + (i > 1 ? 0.0 : 0);
    if (Math.abs(y - 0.2) < 0.02 || Math.abs(y - 0.265) < 0.02 || Math.abs(y - 0.135) < 0.02) continue;
    add(new THREE.TorusGeometry(0.031, 0.003, 4, 8), BLK, [0, y, 0], [90, 0, 0]);
  }

  // ferrules
  add(cyl(0.038, 0.034, 0.016, 8), GOLD, [0, 0.112, 0]);
  add(cyl(0.034, 0.04, 0.018, 8), GOLD, [0, 0.291, 0]);
  add(cyl(0.041, 0.041, 0.004, 8), GD, [0, 0.3, 0]);

  // tassel: loop, cord, blue strands, gold beads
  add(new THREE.TorusGeometry(0.012, 0.0035, 4, 8), GOLD, [0.0, 0.0, 0.052], [0, 0, 0]);
  const r = rng(5);
  add(cyl(0.004, 0.004, 0.012, 6), GOLD, [0, -0.0, 0.052]);
  add(new THREE.SphereGeometry(0.009, 6, 4), GOLD, [0, 0.0, 0.052]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const h = 0.05 + r() * 0.01;
    add(new THREE.ConeGeometry(0.006, h, 5), BLUE, [Math.cos(a) * 0.007, 0.0, 0.052 + Math.sin(a) * 0.007], [0, 0, 0], [1, 1, 1]);
  }
  add(new THREE.SphereGeometry(0.007, 6, 4), GD, [0, 0.0, 0.052]);
}
    return buildGrip;
  })(),
  // chamber
  (() => {
function buildChamber({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const cx = 0.0, cy = 0.43;
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // Housing (steelDark) behind the cylinder: spans tang area
  part(box(0.1, 0.2, 0.09), P.black, [cx, cy, 0]);
  part(box(0.092, 0.19, 0.082), P.steelDark, [cx, cy, 0]);
  part(box(0.07, 0.05, 0.088), P.steel, [cx, cy + 0.075, 0]);
  // tang slot highlight
  part(box(0.03, 0.26, 0.03), P.black, [cx, cy, 0]);

  // Cylinder: axis along Z, sits in front of housing on +X side (toward edge side offset)
  const ccx = 0.03, ccy = cy + 0.0, ccz = 0.0;
  part(cyl(0.085, 0.085, 0.07, 6), P.black, [ccx, ccy, ccz], { rotation: [90, 0, 0] });
  part(cyl(0.08, 0.08, 0.068, 6), P.chamberMetal, [ccx, ccy, ccz], { rotation: [90, 0, 0] });
  // gold rim rings front and back
  for (const s of [1, -1]) {
    part(cyl(0.088, 0.088, 0.008, 6), P.gold, [ccx, ccy, s * 0.036], { rotation: [90, 0, 0] });
    part(cyl(0.05, 0.05, 0.006, 6), P.goldDark, [ccx, ccy, s * 0.04], { rotation: [90, 0, 0] });
  }
  // six chambers with bullet tips on the front face
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = ccx + Math.cos(a) * 0.052, y = ccy + Math.sin(a) * 0.052;
    part(cyl(0.017, 0.017, 0.006, 8), P.black, [x, y, 0.039], { rotation: [90, 0, 0] });
    part(cyl(0.011, 0.013, 0.012, 8), P.gold, [x, y, 0.041], { rotation: [90, 0, 0] });
    part(new THREE.SphereGeometry(0.01, 6, 4), P.goldDark, [x, y, 0.047]);
    part(new THREE.SphereGeometry(0.004, 5, 4), P.steelLight, [x - 0.003, y + 0.003, 0.051]);
  }
  // hub
  part(cyl(0.016, 0.016, 0.012, 8), P.gold, [ccx, ccy, 0.04], { rotation: [90, 0, 0] });
  part(cyl(0.008, 0.008, 0.014, 6), P.black, [ccx, ccy, 0.041], { rotation: [90, 0, 0] });

  // Barrel-like housing on -X side
  part(cyl(0.028, 0.028, 0.2, 8), P.black, [-0.055, cy + 0.01, 0.0]);
  part(cyl(0.024, 0.024, 0.2, 8), P.steelDark, [-0.055, cy + 0.01, 0.0]);
  for (const y of [-0.07, 0, 0.07]) part(cyl(0.029, 0.029, 0.012, 8), P.gold, [-0.055, cy + 0.01 + y, 0]);
  part(box(0.008, 0.18, 0.01), P.steel, [-0.045, cy + 0.01, 0.02]);

  // Hammer at the rear/top (+X)
  part(box(0.02, 0.06, 0.02), P.black, [0.095, cy + 0.1, 0]);
  part(box(0.016, 0.055, 0.016), P.steel, [0.098, cy + 0.105, 0]);
  part(box(0.034, 0.016, 0.018), P.steel, [0.108, cy + 0.14, 0], { rotation: [0, 0, 25] });
  part(box(0.014, 0.04, 0.016), P.steelDark, [0.092, cy + 0.06, 0], { rotation: [0, 0, -15] });

  // Trigger guard: curved loop below, toward front (+Z) and the grip
  const loop: THREE.Vector3[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (i / 10);
    loop.push(new THREE.Vector3(0.0 + 0.0, 0.335 + 0.0 + Math.sin(a) * -0.0, 0));
  }
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (i / 10);
    const z = 0.04 + Math.sin(a) * 0.04, y = 0.335 - (1 - Math.cos(a)) * 0.0 + Math.cos(a) * 0.04;
    part(box(0.014, 0.012, 0.012), P.black, [0.03, y, z]);
    part(box(0.01, 0.01, 0.01), P.gold, [0.03, y, z + 0.0], { });
  }
  // guard sides
  part(box(0.016, 0.012, 0.07), P.gold, [0.03, 0.296, 0.035]);
  // trigger
  part(box(0.012, 0.034, 0.008), P.black, [0.03, 0.332, 0.03], { rotation: [-20, 0, 0] });
  part(box(0.008, 0.03, 0.006), P.steelLight, [0.03, 0.333, 0.032], { rotation: [-20, 0, 0] });

  // Filigree plates and rivets on both sides of housing
  for (const s of [1, -1]) {
    part(box(0.07, 0.1, 0.004), P.goldDark, [cx + 0.01, cy - 0.01, s * 0.047]);
    part(box(0.06, 0.09, 0.004), P.gold, [cx + 0.01, cy - 0.01, s * 0.049]);
    part(box(0.036, 0.01, 0.004), P.goldDark, [cx + 0.01, cy + 0.02, s * 0.052]);
    part(box(0.01, 0.05, 0.004), P.goldDark, [cx + 0.01, cy - 0.02, s * 0.052]);
    part(new THREE.SphereGeometry(0.008, 6, 4), P.goldDark, [cx + 0.01, cy - 0.06, s * 0.052]);
    for (const [x, y] of [[-0.02, 0.03], [0.04, 0.03], [-0.02, -0.05], [0.04, -0.05]])
      part(new THREE.SphereGeometry(0.0065, 6, 4), P.steelLight, [cx + x, cy + y, s * 0.053]);
  }
  // base and top collars
  part(box(0.11, 0.014, 0.1), P.goldDark, [cx, 0.29, 0]);
  part(box(0.105, 0.01, 0.095), P.gold, [cx, 0.297, 0]);
  part(box(0.11, 0.014, 0.1), P.goldDark, [cx, 0.553, 0]);
  part(box(0.105, 0.01, 0.095), P.gold, [cx, 0.545, 0]);

  // Glowing cyan indicator
  part(box(0.024, 0.02, 0.006), P.black, [0.05, 0.325, 0.0505]);
  const g = part(box(0.018, 0.014, 0.006), P.cyanGlow, [0.05, 0.325, 0.053]);
  if ((g as any).mesh?.material) {
    const m = (g as any).mesh.material.clone();
    m.emissive = new THREE.Color(P.cyanGlow);
    m.emissiveIntensity = 1.5;
    (g as any).mesh.material = m;
  }
  r();
}
    return buildChamber;
  })(),
  // guard
  (() => {
function buildGuard({ b, J, P, M }: any) {
  const Y = 0.56; // guard centre height
  const G = P.gold, GD = P.goldDark, BL = P.royalBlue, RED = P.red, ST = P.steelLight;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cone = (r: number, l: number, c: string, at: number[], dir: number[], seg = 6) =>
    b.part(new THREE.ConeGeometry(r, l, seg), c, { at, dir });
  const gem = (r: number, at: number[], c = RED) =>
    b.part(new THREE.OctahedronGeometry(r, 0), c, { at });

  // central block: outline, main, highlight
  box(0.1, 0.1, 0.1, GD, [0, Y, 0]);
  box(0.09, 0.09, 0.104, G, [0, Y, 0]);
  box(0.06, 0.012, 0.108, ST, [0, Y + 0.035, 0]);

  // wings, swept and layered, mirrored
  for (const s of [1, -1]) {
    const layers: [number, number, number, string][] = [
      [0.0, 0.032, 0.09, GD],
      [0.004, 0.026, 0.085, G],
    ];
    layers.forEach(([dz, h, d, c], i) => {
      const o = b.extrude(
        [[0, -h], [0.1, -h * 0.9], [0.17, h * 0.2 + 0.02], [0.14, h * 1.8, "sharp"], [0.06, h * 1.2], [0, h]],
        { at: [s * 0.04, Y + 0.005 - i * 0.0, -d / 2 + 0.0 + (i ? 0.008 : 0)], x: [s, 0, 0], y: [0, 1, 0], thickness: d - (i ? 0.016 : 0), color: c },
      );
      void o; void dz;
    });
    // wing tip spike and highlight
    cone(0.014, 0.05, G, [s * 0.185, Y + 0.03, 0], [s, 0.6, 0]);
    box(0.09, 0.006, 0.07, ST, [s * 0.1, Y + 0.022, 0], [0, 0, s * -8]);
    // blue cloth inlay
    box(0.08, 0.016, 0.092, BL, [s * 0.105, Y + 0.002, 0], [0, 0, s * -6]);
    box(0.08, 0.004, 0.094, GD, [s * 0.105, Y - 0.008, 0]);
    // lower spikes
    cone(0.012, 0.05, GD, [s * 0.1, Y - 0.05, 0.0], [s * 0.4, -1, 0]);
    // red gems on wings
    gem(0.012, [s * 0.145, Y + 0.012, 0.047]);
    gem(0.012, [s * 0.145, Y + 0.012, -0.047]);
    // chain of feather charm
    const cx = s * 0.15;
    for (let i = 0; i < 4; i++)
      b.part(new THREE.TorusGeometry(0.006, 0.0018, 4, 6), i % 2 ? GD : G, {
        at: [cx, Y - 0.03 - i * 0.011, 0.05],
        rotation: [0, i % 2 ? 90 : 0, 0],
      });
    // feather: outline, blue, highlight
    const fy = Y - 0.1;
    b.part(new THREE.OctahedronGeometry(0.02, 0), GD, { at: [cx, fy, 0.05], scale: [0.5, 2.2, 0.25] });
    b.part(new THREE.OctahedronGeometry(0.017, 0), BL, { at: [cx, fy, 0.054], scale: [0.5, 2.2, 0.2] });
    box(0.003, 0.05, 0.002, ST, [cx, fy, 0.057]);
    b.part(new THREE.SphereGeometry(0.007, 6, 4), G, { at: [cx, fy - 0.05, 0.05] });
  }

  // lion head emblem on front (+Z)
  const fz = 0.054;
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 8), GD, { at: [0, Y, fz], dir: [0, 0, 1] });
  // mane spikes
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cone(0.009, 0.026, G, [Math.cos(a) * 0.033, Y + Math.sin(a) * 0.033, fz + 0.002], [Math.cos(a), Math.sin(a), 0], 4);
  }
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.01, 8), G, { at: [0, Y, fz + 0.003], dir: [0, 0, 1] });
  b.part(new THREE.SphereGeometry(0.016, 6, 5), ST, { at: [0, Y - 0.002, fz + 0.01], scale: [1, 1.05, 0.6] });
  for (const s of [1, -1]) {
    cone(0.007, 0.012, G, [s * 0.013, Y + 0.018, fz + 0.012], [s * 0.4, 1, 0.2], 4);
    b.part(new THREE.SphereGeometry(0.004, 4, 3), P.black, { at: [s * 0.006, Y + 0.004, fz + 0.019] });
  }
  box(0.008, 0.01, 0.006, GD, [0, Y - 0.008, fz + 0.019]);
  box(0.016, 0.003, 0.004, P.black, [0, Y - 0.016, fz + 0.016]);
  gem(0.008, [0, Y + 0.026, fz + 0.012]);

  // back emblem plate
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 8), GD, { at: [0, Y, -fz], dir: [0, 0, -1] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 8), G, { at: [0, Y, -fz - 0.002], dir: [0, 0, -1] });

  // top/bottom collar rings
  for (const y of [Y + 0.052, Y - 0.052])
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.01, 8), y > Y ? G : GD, { at: [0, y, 0] });
}
    return buildGuard;
  })(),
  // blade
  (() => {
function buildBlade({ b, P }: any) {
  const R = rng(5);
  const Z = 0.03;
  // Blade outline in (x, y): -X is the edge, +X the spine. Tip swept toward -X.
  const outline: any[] = [
    [0.14, 0.55],
    [0.14, 1.3],
    [0.02, 1.5, "sharp"],
    [-0.17, 1.3],
    [-0.17, 0.55],
  ];
  const ext = (pts: any[], th: number, color: string, zc: number) =>
    b.extrude(pts, { at: [0, 0, zc], x: [1, 0, 0], y: [0, 1, 0], thickness: th, color });
  // dark outline slab, main body, highlights
  ext(
    [
      [0.145, 0.55],
      [0.145, 1.31],
      [0.02, 1.505, "sharp"],
      [-0.172, 1.3],
      [-0.172, 0.55],
    ],
    0.058,
    P.black,
    0,
  );
  ext(outline, 0.056, P.steel, 0);
  // bevelled edge strip (lighter) on -X
  ext(
    [
      [-0.17, 0.56],
      [-0.1, 0.56],
      [-0.1, 1.25],
      [-0.17, 1.3],
    ],
    0.058,
    P.steelLight,
    0,
  );
  // edge glow strip
  ext(
    [
      [-0.172, 0.6],
      [-0.162, 0.6],
      [-0.162, 1.28],
      [-0.172, 1.3],
    ],
    0.06,
    P.cyanGlow,
    0,
  );
  // spine
  ext(
    [
      [0.08, 0.55],
      [0.14, 0.55],
      [0.14, 1.3],
      [0.1, 1.33],
      [0.08, 1.3],
    ],
    0.06,
    P.steelDark,
    0,
  );
  // spine notches
  for (let i = 0; i < 6; i++) {
    const y = 0.7 + i * 0.1;
    b.part(new THREE.BoxGeometry(0.03, 0.025, 0.062), P.black, { at: [0.14, y, 0] });
  }
  // rivets along spine, both faces
  for (let i = 0; i < 8; i++) {
    const y = 0.62 + i * 0.085;
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.01, 6, 4), P.gold, { at: [0.11, y, s * 0.03] });
  }
  // fuller groove with gold inlay
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.62, 0.004), P.steelDark, { at: [0.0, 0.95, s * 0.0285] });
    b.part(new THREE.BoxGeometry(0.004, 0.64, 0.004), P.gold, { at: [-0.025, 0.95, s * 0.0305] });
    b.part(new THREE.BoxGeometry(0.004, 0.64, 0.004), P.gold, { at: [0.025, 0.95, s * 0.0305] });
    // gold line along the bevel
    b.part(new THREE.BoxGeometry(0.004, 0.6, 0.004), P.gold, { at: [-0.1, 0.9, s * 0.0305] });
    // cut-outs near base
    for (let k = 0; k < 3; k++)
      b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.004, 8), P.black, {
        at: [0.06, 0.62 + k * 0.045, s * 0.0295],
        dir: [0, 0, 1],
        axis: "y",
      });
    // lion emblem at base: gold disc, dark face, mane spikes
    const ez = s * 0.0305;
    b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.004, 12), P.goldDark, { at: [-0.04, 0.66, ez], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.005, 12), P.gold, { at: [-0.04, 0.66, ez], dir: [0, 0, 1] });
    b.part(new THREE.BoxGeometry(0.026, 0.028, 0.006), P.goldDark, { at: [-0.04, 0.66, ez] });
    for (const e of [-1, 1])
      b.part(new THREE.SphereGeometry(0.004, 4, 3), P.cyanGlow, { at: [-0.04 + e * 0.007, 0.668, ez + s * 0.003] });
    for (const e of [-1, 1])
      b.part(new THREE.ConeGeometry(0.008, 0.02, 4), P.gold, { at: [-0.04 + e * 0.022, 0.69, ez], rotation: [0, 0, -e * 40] });
    // cyan runes
    for (let k = 0; k < 6; k++) {
      const y = 0.8 + k * 0.1;
      const x = -0.05 + (R() - 0.5) * 0.01;
      b.part(new THREE.BoxGeometry(0.006, 0.03, 0.004), P.cyanGlow, { at: [x, y, ez] });
      b.part(new THREE.BoxGeometry(0.03, 0.006, 0.004), P.cyanGlow, { at: [x + (k % 2 ? 0.01 : -0.01), y + 0.008, ez] });
      b.part(new THREE.BoxGeometry(0.012, 0.012, 0.004), P.cyanGlow, { at: [x + 0.012, y - 0.012, ez], rotation: [0, 0, 45] });
    }
  }
  // gold tip cap near the point
  b.part(new THREE.ConeGeometry(0.012, 0.03, 4), P.edge, { at: [-0.015, 1.455, 0], rotation: [0, 0, 30] });
}
    return buildBlade;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "gunbladeLionheart" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
