import * as THREE from "three";
import { createBuilder, grain, stripes, mottle } from "../../../../src/index";

export const meta = {
  name: "Treehouse",
  description:
    "A stylized low-poly oak treehouse: a gabled plank cabin on a railed platform, with a ladder, rope swing, chimney, flag, lanterns and a faceted leafy canopy.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0] });

  const BARK = grain("#6b4a2f", "#4a3catch".length ? "#4d3522" : "#4d3522", { size: 0.14, axis: "y" });
  const WOOD = "#b98a55";
  const WOODD = "#7d5a38";
  const PLANK = stripes("#c9975e", "#a87a46", { size: 0.2, axis: "x", width: 0.5 });
  const FLOOR = stripes("#a67c4b", "#8a6338", { size: 0.22, axis: "z", width: 0.5 });
  const ROOF = stripes("#b5472f", "#8f3322", { size: 0.22, axis: "y", width: 0.5 });
  const GLASS = "#ffe9a6";
  const DOOR = "#3f6e8c";
  const STONE = mottle("#9a9a94", "#77777a", { size: 0.2 });
  const GRASS = mottle("#6aa84f", "#58903f", { size: 0.5 });
  const LEAVES = ["#3f8a3c", "#4fa346", "#2f7a38", "#62b44c"];
  const ROPE = "#d9c08a";

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });

  // ground
  b.part(new THREE.CylinderGeometry(4.6, 4.8, 0.12, 10), GRASS, { at: [0, -0.06, 0.2], flat: true });

  // trunk
  const trunkPath = [
    [0, -0.1, 0],
    [0, 1.5, 0],
    [0.08, 3.5, 0],
    [0, 5.5, 0],
    [-0.1, 7.4, 0],
  ];
  b.sweep(trunkPath, [0.78, 0.6, 0.52, 0.42, 0.2], { color: BARK, section: { ngon: 9 }, caps: "point" });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const c = Math.cos(a), s = Math.sin(a);
    b.spike([c * 0.5, 0.55, s * 0.5], [c, -0.35, s], 1.5, 0.28, { color: BARK, sides: 6 });
  }

  // branches
  const branch = (pts: number[][], r: [number, number]) =>
    b.sweep(pts, r, { color: BARK, sides: 6, caps: "point" });
  branch([[-0.2, 4.4, 0], [-1.4, 5.0, 0.2], [-2.9, 5.9, 0.4]], [0.3, 0.1]);
  branch([[0.1, 5.8, 0], [-0.8, 6.6, -0.8], [-1.5, 7.4, -1.1]], [0.22, 0.08]);
  branch([[0.1, 6.0, 0], [1.0, 7.0, -0.5], [1.9, 7.8, -0.9]], [0.2, 0.07]);
  branch([[0, 4.8, 0.1], [0.3, 5.6, 1.2], [0.2, 6.5, 2.0]], [0.2, 0.07]);

  // canopy
  const clumps: [number, number, number, number][] = [
    [-1.9, 6.7, 0.3, 1.7],
    [0, 8.0, 0, 1.8],
    [1.6, 8.3, -1.1, 1.6],
    [-0.7, 7.5, -1.9, 1.6],
    [-3.0, 6.3, 0.8, 1.2],
    [-1.6, 8.1, -1.0, 1.3],
    [0.3, 7.0, 2.1, 1.2],
    [2.9, 7.7, 0.5, 1.1],
    [0.3, 7.4, 1.0, 1.1],
  ];
  clumps.forEach((c, i) => {
    b.part(new THREE.IcosahedronGeometry(c[3], 1), LEAVES[i % LEAVES.length], {
      at: [c[0], c[1], c[2]],
      rotation: [i * 20, i * 37, 0],
      flat: true,
    });
  });

  // platform
  const px = 0.5;
  box(6.2, 0.18, 4.2, FLOOR, px, 3.0, 0);
  box(6.4, 0.1, 0.12, WOODD, px, 2.9, 2.1);
  box(6.4, 0.1, 0.12, WOODD, px, 2.9, -2.1);
  box(0.12, 0.1, 4.4, WOODD, px - 3.1, 2.9, 0);
  box(0.12, 0.1, 4.4, WOODD, px + 3.1, 2.9, 0);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      b.rod([sx * 0.3, 1.9, sz * 0.3], [px + sx * 2.6, 2.88, sz * 1.8], 0.08, { color: WOODD, sides: 6 });
    }
  b.rod([-0.3, 1.5, 0.3], [-2.0, 2.88, 0.3], 0.07, { color: WOODD, sides: 6 });

  // cabin
  const cx = 2.1, cy0 = 3.09, wallH = 2.0, cz = -0.3;
  box(2.4, wallH, 2.6, PLANK, cx, cy0 + wallH / 2, cz);
  // corner posts
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.12, wallH + 0.04, 0.12, WOODD, cx + sx * 1.2, cy0 + wallH / 2, cz + sz * 1.3);
  // base trim
  box(2.5, 0.1, 2.7, WOODD, cx, cy0 + 0.05, cz);
  box(2.5, 0.1, 2.7, WOODD, cx, cy0 + wallH, cz);

  // roof
  const ang = 39.8;
  const ridgeY = cy0 + wallH;
  for (const s of [-1, 1]) {
    box(1.95, 0.1, 3.3, ROOF, cx + s * 0.7, ridgeY + 0.5 + 0.08, cz, [0, 0, -s * ang]);
  }
  box(0.2, 0.14, 3.34, WOODD, cx, ridgeY + 1.12, cz);
  for (const z of [1.0, -1.6]) {
    b.extrude(
      [[-1.2, 0], [1.2, 0], [0, 1.0, "sharp"]],
      { at: [cx, ridgeY, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: PLANK },
    );
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 8), GLASS, {
      at: [cx, ridgeY + 0.42, z + (z > 0 ? 0.06 : -0.06)],
      rotation: [90, 0, 0],
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.24, 0.035, 5, 10), WOODD, {
      at: [cx, ridgeY + 0.42, z + (z > 0 ? 0.07 : -0.07)],
    });
  }

  // door (front)
  const dz = cz + 1.3;
  box(0.95, 1.7, 0.08, WOODD, cx - 0.3, cy0 + 0.9, dz + 0.02);
  box(0.8, 1.55, 0.08, DOOR, cx - 0.3, cy0 + 0.85, dz + 0.06);
  box(0.06, 1.55, 0.1, WOODD, cx - 0.3, cy0 + 0.85, dz + 0.08);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), "#e8c14a", { at: [cx - 0.12, cy0 + 0.85, dz + 0.14] });
  box(1.1, 0.08, 0.5, WOOD, cx - 0.3, cy0 + 0.02, dz + 0.3);

  // windows
  const win = (x: number, y: number, z: number, face: "x" | "z") => {
    const [fx, fz] = face === "x" ? [0.1, 0.9] : [0.9, 0.1];
    box(fx, 0.9, fz, WOODD, x, y, z);
    const [gx, gz] = face === "x" ? [0.14, 0.7] : [0.7, 0.14];
    box(gx, 0.7, gz, GLASS, x, y, z);
    box(face === "x" ? 0.16 : 0.06, 0.7, face === "x" ? 0.06 : 0.16, WOODD, x, y, z);
    box(face === "x" ? 0.16 : 0.7, 0.06, face === "x" ? 0.7 : 0.16, WOODD, x, y, z);
    // sill + flowers
    const ox = face === "x" ? 0.18 : 0;
    const oz = face === "z" ? 0.18 : 0;
    const sgn = face === "x" ? (x > cx ? 1 : -1) : z > cz ? 1 : -1;
    box(face === "x" ? 0.3 : 1.0, 0.1, face === "x" ? 1.0 : 0.3, WOOD, x + ox * sgn, y - 0.5, z + oz * sgn);
    const cols = ["#ff7a8a", "#ffd24a", "#ffffff", "#ff9a4a"];
    for (let i = 0; i < 4; i++) {
      const o = (i - 1.5) * 0.22;
      b.part(new THREE.IcosahedronGeometry(0.08, 0), cols[i], {
        at: [x + ox * sgn * 1.1 + (face === "z" ? o : 0), y - 0.38, z + oz * sgn * 1.1 + (face === "x" ? o : 0)],
        flat: true,
      });
    }
  };
  win(cx + 1.22, cy0 + 1.1, cz - 0.1, "x");
  win(cx - 1.22, cy0 + 1.1, cz - 0.1, "x");
  win(cx + 0.55, cy0 + 1.1, cz + 1.31, "z");
  win(cx, cy0 + 1.1, cz - 1.31, "z");

  // chimney
  box(0.45, 1.3, 0.45, STONE, 2.95, 6.0, -0.9);
  box(0.6, 0.12, 0.6, STONE, 2.95, 6.7, -0.9);

  // flag
  b.rod([cx, ridgeY + 1.15, cz + 1.4], [cx, ridgeY + 2.0, cz + 1.4], 0.03, { color: WOODD, sides: 5 });
  b.extrude([[0, 0], [0.7, 0.15], [0, 0.3]], {
    at: [cx, ridgeY + 1.7, cz + 1.4],
    x: [1, 0, 0],
    thickness: 0.03,
    color: "#e84a4a",
  });

  // railings
  const rail = (a: [number, number], c: [number, number]) => {
    const y0 = 3.09;
    const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const n = Math.max(1, Math.ceil(len / 0.9));
    for (let i = 0; i <= n; i++) {
      const x = a[0] + ((c[0] - a[0]) * i) / n;
      const z = a[1] + ((c[1] - a[1]) * i) / n;
      b.rod([x, y0, z], [x, y0 + 1.0, z], 0.05, { color: WOODD, sides: 5 });
    }
    b.rod([a[0], y0 + 1.0, a[1]], [c[0], y0 + 1.0, c[1]], 0.045, { color: WOOD, sides: 5 });
    b.rod([a[0], y0 + 0.55, a[1]], [c[0], y0 + 0.55, c[1]], 0.035, { color: WOOD, sides: 5 });
  };
  rail([-2.5, 2.0], [-1.6, 2.0]);
  rail([-0.6, 2.0], [0.0, 2.0]);
  rail([1.5, 2.0], [3.5, 2.0]);
  rail([-2.5, -2.0], [3.5, -2.0]);
  rail([-2.5, -2.0], [-2.5, 2.0]);
  rail([3.5, 1.5], [3.5, 2.0]);
  rail([3.5, -2.0], [3.5, -1.8]);
  // lanterns on front posts
  for (const lx of [-2.5, 3.5]) {
    b.part(new THREE.IcosahedronGeometry(0.14, 0), "#ffcf4a", { at: [lx, 4.35, 2.0], flat: true });
    b.part(new THREE.ConeGeometry(0.15, 0.12, 6), WOODD, { at: [lx, 4.53, 2.0], flat: true });
  }

  // ladder
  for (const lx of [-1.5, -0.7]) b.rod([lx, 3.2, 2.0], [lx, 0.0, 2.95], 0.045, { color: WOODD, sides: 5 });
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9;
    const y = 3.2 - 3.2 * t;
    const z = 2.0 + 0.95 * t;
    b.rod([-1.5, y, z], [-0.7, y, z], 0.035, { color: WOOD, sides: 5 });
  }

  // rope swing
  b.rod([-2.4, 5.5, 0.55], [-2.4, 1.0, 0.55], 0.025, { color: ROPE, sides: 5 });
  b.rod([-2.0, 5.5, 0.55], [-2.0, 1.0, 0.55], 0.025, { color: ROPE, sides: 5 });
  box(0.7, 0.07, 0.25, WOOD, -2.2, 0.98, 0.55);

  // barrel and crates on platform
  b.part(new THREE.CylinderGeometry(0.28, 0.24, 0.6, 8), "#8c5a35", { at: [0.9, 3.4, -1.6], flat: true });
  b.part(new THREE.TorusGeometry(0.27, 0.025, 4, 8), "#444", { at: [0.9, 3.5, -1.6], rotation: [90, 0, 0] });
  box(0.5, 0.5, 0.5, WOOD, -1.8, 3.34, -1.4);
  box(0.4, 0.4, 0.4, WOODD, -1.7, 3.78, -1.35, [0, 20, 0]);
  // sign
  b.rod([-1.9, 3.1, 1.7], [-1.9, 3.9, 1.7], 0.03, { color: WOODD, sides: 5 });
  box(0.6, 0.3, 0.05, WOOD, -1.9, 3.85, 1.7);

  // mushrooms and rocks at base
  const mush: [number, number, number][] = [[1.1, 0, 1.0], [1.4, 0, 0.8], [-1.1, 0, -1.0]];
  mush.forEach((m, i) => {
    b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 5), "#f1e6cf", { at: [m[0], 0.07, m[2]], flat: true });
    b.part(new THREE.ConeGeometry(0.12 + i * 0.02, 0.1, 6), "#d9473f", { at: [m[0], 0.18, m[2]], flat: true });
  });
  b.part(new THREE.IcosahedronGeometry(0.4, 0), "#8e8e88", { at: [-1.9, 0.12, 1.6], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.28, 0), "#a0a09a", { at: [-1.4, 0.05, 1.9], flat: true });

  return b.root;
}
