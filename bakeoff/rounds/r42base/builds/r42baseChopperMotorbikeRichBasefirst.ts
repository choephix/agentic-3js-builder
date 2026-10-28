import * as THREE from "three";
import { type Builder, createBuilder, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // frontWheelFork
  (() => {
function buildFrontWheelFork(b: Builder) {
  const STEEL = "#b8bec8", DARK = "#1c1d22", TIRE = "#16161a", ORANGE = "#ff9a1a", GLOW = "#ffc060", RIM = "#d8dde6", RED = "#c8321e";
  const head = b.joint("frontWheelForkSteer", { at: [0, 0.95, 0.88], dir: [0, 0.4, 0.92] });
  const wheel = b.joint("frontWheelForkWheel", { parent: head, at: [0, 0.3, 1.5], dir: [1, 0, 0] });
  const WZ = 1.5, WY = 0.3;
  const cyl = (rt: number, rb: number, h: number, seg = 12) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const ax: [number, number, number] = [1, 0, 0];

  // tire
  b.part(new THREE.TorusGeometry(0.255, 0.045, 8, 28), TIRE, { bone: wheel, at: [0, WY, WZ], dir: ax, axis: "z" });
  // rim rings
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.2, 0.012, 6, 24), RIM, { bone: wheel, at: [s * 0.03, WY, WZ], dir: ax, axis: "z" });
  }
  b.part(cyl(0.2, 0.2, 0.05, 20), ORANGE, { bone: wheel, at: [0, WY, WZ], dir: ax }).mesh.visible = false;
  // hub
  b.part(cyl(0.05, 0.05, 0.1, 10), STEEL, { bone: wheel, at: [0, WY, WZ], dir: ax });
  b.part(cyl(0.025, 0.025, 0.18, 8), DARK, { bone: wheel, at: [0, WY, WZ], dir: ax });
  // spokes
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const y = Math.cos(a), z = Math.sin(a);
    for (const s of [1, -1]) {
      b.rod([s * 0.02, WY + y * 0.05, WZ + z * 0.05], [s * 0.035, WY + y * 0.2, WZ + z * 0.2], 0.005, STEEL, { bone: wheel });
    }
  }
  // brake disc with holes
  b.part(cyl(0.12, 0.12, 0.008, 18), "#8a909c", { bone: wheel, at: [0.05, WY, WZ], dir: ax });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(cyl(0.012, 0.012, 0.012, 6), DARK, { bone: wheel, at: [0.05, WY + Math.cos(a) * 0.08, WZ + Math.sin(a) * 0.08], dir: ax });
  }
  // caliper
  b.part(new THREE.BoxGeometry(0.03, 0.06, 0.05), RED, { bone: head, at: [0.08, WY + 0.12, WZ - 0.02] });

  // fork tubes: raked from hub up to the triple tree
  const top = [0.0, 1.0, 0.95];
  const tree = b.part(new THREE.BoxGeometry(0.2, 0.05, 0.08), STEEL, { bone: head, at: [0, 0.98, 0.93] });
  b.part(cyl(0.035, 0.035, 0.2, 8), DARK, { bone: head, at: [0, 1.08, 0.9] });
  b.part(new THREE.BoxGeometry(0.16, 0.035, 0.07), STEEL, { bone: head, at: [0, 0.8, 1.15] });
  for (const s of [1, -1]) {
    const x = s * 0.09;
    b.rod([x, 0.99, 0.94], [x, 0.58, 1.3], 0.022, STEEL, { bone: head });
    b.rod([x, 0.58, 1.3], [s * 0.075, WY + 0.02, WZ], 0.03, DARK, { bone: head });
    b.part(cyl(0.04, 0.04, 0.03, 8), ORANGE, { bone: head, at: [s * 0.085, WY, WZ], dir: ax });
    b.part(cyl(0.032, 0.032, 0.05, 8), STEEL, { bone: head, at: [s * 0.09, 0.6, 1.28], dir: [0, 0.6, 0.4] });
  }
  void tree;

  // fender
  b.part(new THREE.TorusGeometry(0.3, 0.07, 6, 16, Math.PI * 0.8), ORANGE, {
    bone: head, at: [0, WY, WZ], rotation: [0, 90, 0], scale: [1, 1, 0.7],
  }).mesh.visible = false;
  b.extrude([[0, 0], [0.5, 0], [0.5, 0.03], [0.3, 0.12], [0.1, 0.1], [0, 0.04]], {
    at: [0, 0.57, 1.2], x: [0, 0, 1], y: [0, 1, -0.0], thickness: 0.17, bevel: 0.01, bone: head, color: ORANGE,
  });

  // headlight
  const hl = [0, 0.86, 1.02];
  b.part(cyl(0.1, 0.1, 0.1, 14), DARK, { bone: head, at: hl, dir: [0, 0, 1] });
  b.part(cyl(0.085, 0.085, 0.02, 14), GLOW, { bone: head, at: [0, 0.86, 1.075], dir: [0, 0, 1] });
  // glow ring
  const ring = b.part(new THREE.TorusGeometry(0.115, 0.012, 6, 24), ORANGE, { bone: head, at: [0, 0.86, 1.06], dir: [0, 0, 1], axis: "z" });
  const m = ring.mesh.material as THREE.MeshStandardMaterial;
  const mat = m.clone(); mat.emissive.set(ORANGE); mat.emissiveIntensity = 1.5; ring.mesh.material = mat;
  const lens = b.part(cyl(0.07, 0.07, 0.01, 12), "#fff2c8", { bone: head, at: [0, 0.86, 1.09], dir: [0, 0, 1] });
  const lm = (lens.mesh.material as THREE.MeshStandardMaterial).clone(); lm.emissive.set("#fff2c8"); lm.emissiveIntensity = 1.2; lens.mesh.material = lm;
  void frame;
}
    return buildFrontWheelFork;
  })(),
  // rearWheelSwing
  (() => {
function buildRearWheelSwing(b: Builder) {
  const TIRE = "#17171c";
  const TIRE_WALL = "#2a2a32";
  const RIM = "#c9ced6";
  const RIM_DARK = "#6b7280";
  const HUB = "#f2a21d";
  const PLATE = "#2c3e5a";
  const PLATE_TRIM = "#f2a21d";
  const FENDER = "#e8e8ee";
  const GUARD = "#4a5568";
  const LIGHT = "#ff3b30";
  const LIGHT_GLOW = "#ffd0a0";

  const pivot = [0, 0.5, -0.4] as const;
  const R = 0.4;
  const axle = [0, R, -1.15] as const;
  const W = 0.27;

  const root = b.joint("rearWheelSwingRoot", { parent: "swingPivot", at: [...pivot], dir: [0, -0.1, -1] });
  const wheelJ = b.joint("rearWheelSwingWheel", { parent: root, at: [...axle], dir: [1, 0, 0] });

  const X = [0, 0, 1];
  const along = (g: THREE.BufferGeometry, color: string, at: readonly number[], bone: any, dirv: number[] = [1, 0, 0], axis: "x" | "y" | "z" = "y") =>
    b.part(g, color, { bone, at: [...at], dir: dirv, axis });

  // Tire
  along(new THREE.CylinderGeometry(R, R, W, 20), TIRE, axle, wheelJ, [1, 0, 0]);
  for (const s of [1, -1]) {
    along(new THREE.CylinderGeometry(R * 0.96, R * 0.88, 0.03, 20), TIRE_WALL, [s * (W / 2 - 0.005), axle[1], axle[2]], wheelJ, [s, 0, 0]);
    // rim
    along(new THREE.CylinderGeometry(R * 0.66, R * 0.66, 0.02, 16), RIM, [s * (W / 2 + 0.002), axle[1], axle[2]], wheelJ, [s, 0, 0]);
    along(new THREE.CylinderGeometry(R * 0.52, R * 0.52, 0.024, 16), RIM_DARK, [s * (W / 2 + 0.006), axle[1], axle[2]], wheelJ, [s, 0, 0]);
    // hub
    along(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 10), HUB, [s * (W / 2 + 0.02), axle[1], axle[2]], wheelJ, [s, 0, 0]);
  }
  // spokes
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const dy = Math.cos(a), dz = Math.sin(a);
    b.rod([0.0, axle[1] + dy * 0.06, axle[2] + dz * 0.06], [0.0, axle[1] + dy * R * 0.58, axle[2] + dz * R * 0.58], 0.025, RIM, { bone: wheelJ, sides: 4 } as any);
  }
  // tread blocks
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const g = new THREE.BoxGeometry(W * 0.9, 0.02, 0.05);
    b.part(g, TIRE_WALL, {
      bone: wheelJ,
      at: [0, axle[1] + Math.cos(a) * (R + 0.004), axle[2] + Math.sin(a) * (R + 0.004)],
      rotation: [(-a * 180) / Math.PI + 90 + 0, 0, 0],
    });
  }
  // sprocket on left side
  along(new THREE.CylinderGeometry(0.15, 0.15, 0.015, 14), RIM_DARK, [W / 2 + 0.05, axle[1], axle[2]], wheelJ, [1, 0, 0]);
  along(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 10), PLATE, [W / 2 + 0.055, axle[1], axle[2]], wheelJ, [1, 0, 0]);

  // Swingarm plates
  for (const s of [1, -1]) {
    const x = s * 0.17;
    b.rod([s * 0.1, pivot[1], pivot[2]], [x, axle[1] + 0.02, axle[2]], 0.04, PLATE, { bone: root, sides: 6 } as any);
    b.frustumBox([x, 0.5, -0.6], [x, axle[1] + 0.05, -1.05], [0.035, 0.16], [0.035, 0.1], { bone: root, color: PLATE } as any);
    b.part(new THREE.BoxGeometry(0.04, 0.03, 0.4), PLATE_TRIM, { bone: root, at: [x + s * 0.002, 0.6, -0.8] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 10), HUB, { bone: root, at: [x, axle[1], axle[2]], dir: [1, 0, 0] });
  }
  b.part(new THREE.BoxGeometry(0.34, 0.05, 0.05), PLATE, { bone: root, at: [0, 0.48, -0.55] });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 8), PLATE_TRIM, { bone: root, at: [0, 0.5, -0.4], dir: [1, 0, 0] });

  // Rear fender
  b.part(new THREE.BoxGeometry(0.3, 0.025, 0.42), FENDER, { bone: root, at: [0, 0.84, -1.15] });
  b.part(new THREE.BoxGeometry(0.3, 0.025, 0.3), FENDER, { bone: root, at: [0, 0.8, -1.38], rotation: [-35, 0, 0] });
  b.part(new THREE.BoxGeometry(0.32, 0.015, 0.12), PLATE_TRIM, { bone: root, at: [0, 0.848, -1.2] });
  for (const s of [1, -1]) b.rod([s * 0.1, 0.84, -1.0], [s * 0.1, 0.5, -0.8], 0.012, PLATE, { bone: root } as any);

  // Chain guard
  b.part(new THREE.BoxGeometry(0.03, 0.06, 0.6), GUARD, { bone: root, at: [0.2, 0.52, -0.8], rotation: [-8, 0, 0] });
  b.part(new THREE.BoxGeometry(0.035, 0.02, 0.6), PLATE_TRIM, { bone: root, at: [0.2, 0.555, -0.8], rotation: [-8, 0, 0] });

  // Tail light
  b.part(new THREE.BoxGeometry(0.1, 0.07, 0.08), GUARD, { bone: root, at: [0, 0.74, -1.56] });
  b.part(new THREE.BoxGeometry(0.08, 0.05, 0.03), LIGHT, { bone: root, at: [0, 0.74, -1.585] });
  b.part(new THREE.BoxGeometry(0.04, 0.02, 0.02), LIGHT_GLOW, { bone: root, at: [0, 0.745, -1.6] });
}
    return buildRearWheelSwing;
  })(),
  // engineExhaust
  (() => {
function buildEngineExhaust(b: Builder) {
  const BLACK = "#1a1c22", STEEL = "#8a909c", CHROME = "#dfe6f0", DARK = "#2c2f38";
  const GLOW = "#46d8ff", ORANGE = "#f29a1f", BRASS = "#b88a3a";
  const bone = "frame";
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: at as any, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], rot?: number[], seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: at as any, rotation: rot as any });
  const glowPart = (p: any, s = 1.5) => {
    const m: any = p.mesh.material.clone();
    m.emissive = new THREE.Color(m.color);
    m.emissiveIntensity = s;
    p.mesh.material = m;
    return p;
  };

  // crankcase and cradle
  box(0.26, 0.2, 0.3, DARK, [0, 0.4, 0.1]);
  box(0.3, 0.12, 0.2, BLACK, [0, 0.33, 0.1]);
  box(0.2, 0.16, 0.2, STEEL, [0, 0.38, -0.12]); // gearbox
  cyl(0.07, 0.07, 0.3, CHROME, [0, 0.4, 0.1], [0, 0, 90]); // primary cover
  cyl(0.045, 0.045, 0.32, STEEL, [0, 0.4, 0.1], [0, 0, 90], 8);
  box(0.06, 0.04, 0.5, BLACK, [0, 0.27, 0.1]); // cradle bar
  box(0.12, 0.2, 0.05, BLACK, [0, 0.5, -0.1]); // mount plate

  // cylinders
  const tilt = 32;
  for (const [sgn, z] of [[1, 0.2], [-1, 0.0]] as [number, number][]) {
    const a = sgn * tilt * Math.PI / 180;
    const cx = 0, cy = 0.5, cz = z;
    const dz = Math.sin(a) * 0.14, dy = Math.cos(a) * 0.14;
    const g = new THREE.Group();
    void g;
    const rot = [sgn * tilt, 0, 0];
    // finned barrel
    cyl(0.055, 0.06, 0.2, DARK, [cx, cy + dy, cz + dz], rot);
    for (let i = 0; i < 5; i++) {
      const t = 0.03 + i * 0.04;
      cyl(0.075, 0.075, 0.012, STEEL, [cx, cy + Math.cos(a) * t * 1.4 - 0.0, cz + Math.sin(a) * t * 1.4], rot, 12);
    }
    const hy = cy + Math.cos(a) * 0.27, hz = cz + Math.sin(a) * 0.27;
    box(0.13, 0.07, 0.11, BLACK, [cx, hy, hz], rot);
    cyl(0.04, 0.04, 0.15, CHROME, [cx, hy + 0.04, hz + sgn * 0.01], [sgn * tilt, 0, 90], 8); // rocker cover
    cyl(0.01, 0.01, 0.07, BRASS, [cx + 0.07, hy, hz], [0, 0, 90], 6); // spark plug
    glowPart(cyl(0.025, 0.025, 0.012, GLOW, [cx + 0.1, cy + Math.cos(a) * 0.14, cz + Math.sin(a) * 0.14 + 0.0], [0, 0, 90], 8), 2);
  }

  // air filter on the right side
  cyl(0.08, 0.08, 0.05, CHROME, [-0.15, 0.55, 0.12], [0, 0, 90], 14);
  cyl(0.06, 0.06, 0.055, ORANGE, [-0.17, 0.55, 0.12], [0, 0, 90], 12);

  // side exhaust pipes
  for (const s of [1, -1]) {
    const pts = [
      [s * 0.1, 0.62, 0.34], [s * 0.2, 0.48, 0.34], [s * 0.23, 0.36, 0.22],
      [s * 0.23, 0.32, 0.0], [s * 0.24, 0.3, -0.2], [s * 0.26, 0.31, -0.33],
    ];
    b.sweep(pts as any, [0.026, 0.03], { bone, color: CHROME, sides: 8, caps: "none" } as any);
    cyl(0.045, 0.03, 0.08, STEEL, [s * 0.26, 0.31, -0.335], [90, 0, 0]);
    box(0.02, 0.07, 0.2, BLACK, [s * 0.255, 0.35, -0.1]); // heat shield
    glowPart(cyl(0.032, 0.032, 0.012, GLOW, [s * 0.27, 0.31, -0.375], [90, 0, 0], 8), 1.8);
    // footpeg
    cyl(0.018, 0.018, 0.12, STEEL, [s * 0.3, 0.25, 0.05], [0, 0, 90], 8);
    cyl(0.024, 0.024, 0.07, BLACK, [s * 0.36, 0.25, 0.05], [0, 0, 90], 8);
    box(0.04, 0.05, 0.06, DARK, [s * 0.25, 0.27, 0.05]);
  }

  // kickstand, on the left (+X)
  box(0.02, 0.02, 0.12, STEEL, [0.2, 0.24, 0.3]);
  b.rod([0.2, 0.24, 0.34] as any, [0.33, 0.21, 0.36] as any, 0.012, STEEL, { bone } as any);
  box(0.06, 0.015, 0.05, BLACK, [0.35, 0.205, 0.37]);
  b.rod([0.2, 0.27, 0.28] as any, [0.28, 0.23, 0.3] as any, 0.006, BRASS, { bone } as any); // spring

  // pulse core on the primary cover
  glowPart(cyl(0.05, 0.05, 0.02, GLOW, [0.17, 0.4, 0.1], [0, 0, 90], 12), 2.2);
  glowPart(cyl(0.065, 0.065, 0.008, GLOW, [0.165, 0.4, 0.1], [0, 0, 90], 12), 1.2);
  void frame;
}
    return buildEngineExhaust;
  })(),
  // riderControls
  (() => {
function buildRiderControls(b: Builder) {
  const LEATHER = "#7a3b1e", LEATHER_D = "#4a2210", STITCH = "#e8c27a";
  const CHROME = "#c9d3dc", BLACK = "#16181c", RUBBER = "#222427";
  const ORANGE = "#ff9a1f", GLASS = "#8fd8ff", GAUGE = "#f4f0e0", RED = "#e23b2e";
  const steer = "steerHead", fr = "frame";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const sph = (r: number) => new THREE.SphereGeometry(r, 8, 6);
  const rodBetween = (a: number[], c: number[], r: number, col: string, bone: string) => {
    const va = new THREE.Vector3(...a), vc = new THREE.Vector3(...c);
    const len = va.distanceTo(vc);
    const m = va.clone().add(vc).multiplyScalar(0.5);
    b.part(cyl(r, len), col, { bone, at: [m.x, m.y, m.z], dir: vc.clone().sub(va).normalize().toArray() as number[] });
  };

  // Riser clamp block on steering head
  b.part(box(0.16, 0.06, 0.1), CHROME, { bone: steer, at: [0, 1.13, 0.85] });
  b.part(cyl(0.035, 0.1), BLACK, { bone: steer, at: [0, 1.2, 0.85] });

  for (const s of [1, -1]) {
    // Ape hanger: riser up and out, then grip outward
    rodBetween([s * 0.06, 1.15, 0.85], [s * 0.22, 1.5, 0.82], 0.016, CHROME, steer);
    rodBetween([s * 0.22, 1.5, 0.82], [s * 0.4, 1.52, 0.8], 0.016, CHROME, steer);
    b.part(sph(0.018), CHROME, { bone: steer, at: [s * 0.22, 1.5, 0.82] });
    // Grip
    rodBetween([s * 0.3, 1.52, 0.8], [s * 0.46, 1.53, 0.8], 0.026, RUBBER, steer);
    b.part(cyl(0.03, 0.012), BLACK, { bone: steer, at: [s * 0.465, 1.53, 0.8], dir: [1, 0, 0] });
    for (let i = 0; i < 4; i++)
      b.part(cyl(0.028, 0.006), BLACK, { bone: steer, at: [s * (0.33 + i * 0.03), 1.522, 0.8], dir: [1, 0, 0] });
    // Lever
    rodBetween([s * 0.3, 1.5, 0.83], [s * 0.2, 1.46, 0.96], 0.008, CHROME, steer);
    b.part(sph(0.014), ORANGE, { bone: steer, at: [s * 0.2, 1.46, 0.96] });
    b.part(box(0.04, 0.03, 0.04), BLACK, { bone: steer, at: [s * 0.3, 1.5, 0.82] });
    // Mirror
    rodBetween([s * 0.38, 1.53, 0.8], [s * 0.42, 1.6 - 0.02, 0.76], 0.007, CHROME, steer);
    b.part(cyl(0.05, 0.012, 12), BLACK, { bone: steer, at: [s * 0.42, 1.575, 0.74], dir: [0, 0.3, 1] });
    b.part(cyl(0.042, 0.004, 12), GLASS, { bone: steer, at: [s * 0.42, 1.576, 0.7465], dir: [0, 0.3, 1] });
    // Brake/clutch cable
    rodBetween([s * 0.3, 1.5, 0.82], [s * 0.1, 1.2, 0.86], 0.005, BLACK, steer);
  }

  // Throttle housing (right side = +x per brief mirrored; put on one grip)
  b.part(box(0.05, 0.04, 0.05), BLACK, { bone: steer, at: [-0.28, 1.5, 0.8] });
  b.part(cyl(0.012, 0.05), ORANGE, { bone: steer, at: [-0.28, 1.53, 0.8] });

  // Speed gauge on the riser
  b.part(cyl(0.065, 0.04, 14), BLACK, { bone: steer, at: [0, 1.28, 0.84], dir: [0, 0.5, 1] });
  b.part(cyl(0.052, 0.006, 14), GAUGE, { bone: steer, at: [0, 1.285, 0.862], dir: [0, 0.5, 1] });
  b.part(cyl(0.057, 0.006, 14), CHROME, { bone: steer, at: [0, 1.284, 0.858], dir: [0, 0.5, 1] });
  for (let i = 0; i < 9; i++) {
    const a = (-120 + i * 30) * Math.PI / 180;
    const x = Math.sin(a) * 0.04, y = Math.cos(a) * 0.04;
    b.part(box(0.004, i > 6 ? 0.012 : 0.01, 0.003), i > 6 ? RED : BLACK, { bone: steer, at: [x, 1.285 + y * 0.9, 0.866 + y * 0.45], rotation: [0, 0, -a * 180 / Math.PI] });
  }
  rodBetween([0, 1.285, 0.866], [0.025, 1.318, 0.882], 0.003, RED, steer);
  b.part(sph(0.007), BLACK, { bone: steer, at: [0, 1.285, 0.866] });

  // Seat trim on seat pan top (y 0.98)
  b.part(box(0.36, 0.05, 0.5), LEATHER, { bone: fr, at: [0, 1.0, -0.3] });
  b.part(box(0.38, 0.03, 0.52), LEATHER_D, { bone: fr, at: [0, 0.975, -0.3] });
  b.part(box(0.3, 0.07, 0.07), LEATHER_D, { bone: fr, at: [0, 1.04, -0.58] });
  b.part(box(0.2, 0.05, 0.1), LEATHER_D, { bone: fr, at: [0, 1.03, -0.02] });
  // Tuck-and-roll ribs
  for (let i = 0; i < 7; i++) {
    const z = -0.52 + i * 0.07;
    b.part(cyl(0.022, 0.34, 8), LEATHER, { bone: fr, at: [0, 1.032, z], dir: [1, 0, 0] });
    b.part(box(0.34, 0.004, 0.008), STITCH, { bone: fr, at: [0, 1.027, z + 0.035] });
    for (const s of [1, -1]) b.part(sph(0.008), STITCH, { bone: fr, at: [s * 0.1, 1.03, z + 0.035] });
  }
  // Piping edges and studs
  for (const s of [1, -1]) {
    b.part(box(0.012, 0.014, 0.5), STITCH, { bone: fr, at: [s * 0.185, 1.0, -0.3] });
    for (let i = 0; i < 5; i++) b.part(sph(0.01), CHROME, { bone: fr, at: [s * 0.19, 1.0, -0.5 + i * 0.1] });
  }
}
    return buildRiderControls;
  })(),
  // tankDecor
  (() => {
function buildTankDecor(b: Builder) {
  const BONE = "frame";
  const surf = b.surface(b.root);
  const DARK = "#1b2230", ORANGE = "#ff9c1a", WHITE = "#f4f7fa", BLUE = "#2a8cff", CYAN = "#5de6ff", CHROME = "#c9d3de";

  const top = (x: number, z: number) => surf.ray([x, 1.4, z], [0, -1, 0]);
  const side = (s: number, y: number, z: number) => surf.ray([s * 0.3, y, z], [-s, 0, 0]);

  const put = (geo: THREE.BufferGeometry, color: string, hit: any, fbAt: number[], fbDir: number[], lift = 0) => {
    if (hit) return b.stick(geo, color, hit, { embed: 0.3, bone: BONE });
    return b.part(geo, color, { bone: BONE, at: [fbAt[0] + fbDir[0] * lift, fbAt[1] + fbDir[1] * lift, fbAt[2] + fbDir[2] * lift], dir: fbDir });
  };

  // top centre stripes along the spine
  for (const [x, w, c] of [[0, 0.05, ORANGE], [0.07, 0.016, WHITE], [-0.07, 0.016, WHITE]] as [number, number, string][]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.2 + i * 0.13;
      const h = top(x, z);
      put(new THREE.BoxGeometry(w, 0.006, 0.11), c, h, [x, 1.2, z], [0, 1, 0]);
    }
  }

  // fuel cap
  const capHit = top(0, 0.55);
  put(new THREE.CylinderGeometry(0.05, 0.05, 0.018, 12), CHROME, capHit, [0, 1.25, 0.55], [0, 1, 0]);
  put(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8), DARK, capHit ? top(0, 0.55) : null, [0, 1.26, 0.55], [0, 1, 0], 0.01);
  put(new THREE.BoxGeometry(0.05, 0.008, 0.01), ORANGE, top(0, 0.55), [0, 1.265, 0.55], [0, 1, 0], 0.015);

  for (const s of [1, -1]) {
    // side hex emblem cluster
    const hexAt: [number, number][] = [[1.17, 0.4], [1.12, 0.46], [1.22, 0.46], [1.17, 0.52], [1.07, 0.4], [1.07, 0.52]];
    hexAt.forEach(([y, z], i) => {
      const h = side(s, y, z);
      const rim = put(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 6), DARK, h, [s * 0.17, y, z], [s, 0, 0]);
      const hh = side(s, y, z);
      put(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 6), i === 0 ? ORANGE : i % 2 ? BLUE : WHITE, hh, [s * 0.17, y, z], [s, 0, 0], 0.006);
    });
    // glowing energy vents
    for (let i = 0; i < 3; i++) {
      const z = 0.18 + i * 0.06, y = 1.05;
      const h = side(s, y, z);
      put(new THREE.BoxGeometry(0.012, 0.09, 0.03), DARK, h, [s * 0.17, y, z], [s, 0, 0]);
      const g = put(new THREE.BoxGeometry(0.01, 0.07, 0.016), CYAN, side(s, y, z), [s * 0.17, y, z], [s, 0, 0], 0.006);
      glow(g, 1.6);
    }
    // trim lines along tank side
    for (const [y, c] of [[0.98, ORANGE], [0.95, WHITE]] as [number, string][]) {
      for (let i = 0; i < 3; i++) {
        const z = 0.12 + i * 0.22;
        put(new THREE.BoxGeometry(0.008, 0.012, 0.19), c, side(s, y, z), [s * 0.17, y, z], [s, 0, 0]);
      }
    }
    // fender trim at rear
    for (let i = 0; i < 3; i++) {
      const z = 0.05 + i * 0.08;
      put(new THREE.BoxGeometry(0.012, 0.01, 0.05), i % 2 ? WHITE : ORANGE, side(s, 0.93, z), [s * 0.14, 0.93, z], [s, 0, 0]);
    }
  }
}
    return buildTankDecor;
  })(),
];

export const BASE_PARTS = [
  {
    id: "frontWheelFork",
    builds: "front wheel with tire, rim, spokes, hub and brake disc, long raked chopper fork tubes, triple-tree clamp, front fender, headlight and orange Overwatch-style glow ring",
    box: [
      [-0.3, 0, 0.95],
      [0.3, 1.2, 1.75],
    ],
    attaches: "steering head joint at the front of the frame neck (0, 0.95, 0.88)",
    joints: ["steerHead"],
    floor: true,
    budget: 200,
  },
  {
    id: "rearWheelSwing",
    builds: "fat rear wheel with tire, rim, hub, sprocket, swingarm plates, rear fender, chain guard and tail light",
    box: [
      [-0.3, 0, -1.6],
      [0.3, 0.85, -0.45],
    ],
    attaches: "swingarm pivot at the rear of the frame (0, 0.5, -0.4)",
    joints: ["swingPivot"],
    floor: true,
    budget: 180,
  },
  {
    id: "engineExhaust",
    builds: "V-twin engine cylinders with fins, cases, chrome pipes, side exhaust, kickstand and footpegs, pulse-core glow details",
    box: [
      [-0.4, 0.2, -0.35],
      [0.4, 0.75, 0.55],
    ],
    attaches: "engine cradle underneath the frame spine and tank bottom, centred at (0, 0.45, 0.1)",
    joints: ["frame"],
    floor: false,
    budget: 190,
  },
  {
    id: "riderControls",
    builds: "ape-hanger handlebars, grips, levers, mirrors, speed gauge, throttle details, stylised leather saddle trim, and a rider seat tuck-and-roll pattern",
    box: [
      [-0.5, 0.9, -0.7],
      [0.5, 1.6, 1.05],
    ],
    attaches: "handlebar riser on the steering head top (0, 1.1, 0.85) and the seat pan top (0, 0.98, -0.3)",
    joints: ["steerHead", "frame"],
    floor: false,
    budget: 170,
  },
  {
    id: "tankDecor",
    builds: "tank graphics, hex-pattern emblem stripes, side glowing energy vents, fuel cap, and decal trim along the tank and fender",
    box: [
      [-0.3, 0.9, 0.0],
      [0.3, 1.4, 0.8],
    ],
    attaches: "fuel tank shell surface on the top of the frame spine",
    joints: ["frame"],
    floor: false,
    budget: 160,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const frame = b.joint("frame", { at: [0, 0.7, 0] });
  b.joint("steerHead", { parent: frame, at: [0, 0.95, 0.88], dir: [0, 0.35, 0.94] });
  b.joint("swingPivot", { parent: frame, at: [0, 0.5, -0.4], dir: [0, 0, -1] });

  const STEEL = "#3a4252";
  const DARK = "#222833";
  const ORANGE = "#f28a1e";
  const BLUE = "#2f6fb5";
  const SEAT = "#2a2024";

  // Main spine: loft sweeping from rear to neck
  b.loft(
    [
      { at: [0, 0.78, -0.75], w: 0.14, h: 0.1 },
      { at: [0, 0.74, -0.2], w: 0.16, h: 0.12 },
      { at: [0, 0.8, 0.35], w: 0.18, h: 0.14 },
      { at: [0, 0.92, 0.8], w: 0.16, h: 0.16 },
    ],
    { bone: frame, color: STEEL },
  );
  // Neck / steering head tube
  b.rod([0, 0.82, 0.86], [0, 1.1, 0.8], 0.06, { bone: "steerHead", color: DARK });
  // Fuel tank
  b.part(new THREE.SphereGeometry(1, 12, 8), BLUE, {
    bone: frame,
    at: [0, 1.0, 0.3],
    scale: [0.2, 0.18, 0.4],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.04, 0.5), ORANGE, { bone: frame, at: [0, 1.18, 0.3] });
  // Seat pan
  b.part(new THREE.BoxGeometry(0.3, 0.08, 0.55), SEAT, { bone: frame, at: [0, 0.92, -0.35] });
  // Lower cradle tubes
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 0.78, 0.7], [s * 0.12, 0.42, 0.15], 0.03, { bone: frame, color: DARK });
    b.rod([s * 0.12, 0.42, 0.15], [s * 0.12, 0.45, -0.4], 0.03, { bone: frame, color: DARK });
    b.rod([s * 0.12, 0.45, -0.4], [s * 0.08, 0.76, -0.7], 0.03, { bone: frame, color: DARK });
  }
  // Engine block placeholder base
  b.part(new THREE.BoxGeometry(0.26, 0.24, 0.4), STEEL, { bone: frame, at: [0, 0.5, 0.1] });
  // Swingarm stubs
  for (const s of [1, -1]) {
    b.rod([s * 0.14, 0.5, -0.4], [s * 0.14, 0.42, -1.0], 0.03, { bone: "swingPivot", color: DARK });
  }
  // Fork stubs from head toward front axle height
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 1.0, 0.85], [s * 0.1, 0.8, 1.15], 0.028, { bone: "steerHead", color: STEEL });
  }
    for (const add of PARTS) add(b);
  return b.root;
}
