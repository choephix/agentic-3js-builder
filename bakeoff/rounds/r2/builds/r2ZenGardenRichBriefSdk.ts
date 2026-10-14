import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Japanese Garden Diorama",
  description: "Square garden base with arched red bridge, koi pond, stone lantern, pine, cherry tree, raked gravel, mossy rocks and stepping stones.",
};

export default function build() {
  const b = createBuilder({ name: "garden" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);
  const add = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    geo.rotateX(rx); geo.rotateY(ry); geo.rotateZ(rz);
    geo.translate(x, y, z);
    return b.part(geo, color, { bone: root });
  };
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    add(new THREE.BoxGeometry(w, h, d), c, x, y, z, 0, ry, 0);
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    add(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z);
  const ball = (r: number, c: string, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => {
    const g = new THREE.IcosahedronGeometry(r, 1);
    g.scale(sx, sy, sz);
    return add(g, c, x, y, z);
  };

  // Base
  box(4, 0.12, 4, "#5a3a22", 0, 0.06, 0);
  box(3.84, 0.04, 3.84, "#7a5230", 0, 0.14, 0);
  // gravel top (y 0.16 .. 0.2)
  const G = 0.2;
  box(3.7, 0.06, 3.7, "#ece9e0", 0, 0.17, 0);
  // raked lines
  for (let i = 0; i < 9; i++) {
    const z = -1.7 + i * 0.1;
    box(1.4, 0.012, 0.025, "#cfcbc0", -1.1, G + 0.005, z + 0.9 + 0.0);
  }
  for (let i = 0; i < 7; i++) {
    box(0.025, 0.012, 1.2, "#cfcbc0", 0.9 + i * 0.1, G + 0.005, -1.1);
  }

  // Pond (sunk look: border stones + water)
  const px = 0, pz = 0.2;
  const pondBorder = new THREE.CylinderGeometry(1.35, 1.4, 0.07, 14);
  pondBorder.scale(1.15, 1, 0.8);
  add(pondBorder, "#7d7f80", px, G + 0.02, pz);
  const water = new THREE.CylinderGeometry(1.25, 1.25, 0.05, 14);
  water.scale(1.15, 1, 0.74);
  add(water, "#2f7f93", px, G + 0.06, pz);
  // lily pads
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7 + 0.5;
    cyl(0.09, 0.09, 0.01, "#4e9a47", Math.cos(a) * 0.9, G + 0.09, pz + Math.sin(a) * 0.5, 7);
  }
  ball(0.04, "#ffd0e0", 0.55, G + 0.11, pz + 0.3);
  // border rocks
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ball(0.11 + R() * 0.05, i % 3 ? "#8a8c8c" : "#6f7273", Math.cos(a) * 1.5, G + 0.07, pz + Math.sin(a) * 1.05, 1, 0.7, 1);
  }

  // Koi
  const koi = (x: number, z: number, ang: number, s: number, patch: string) => {
    const y = G + 0.095;
    const g = new THREE.Group();
    const bodyG = new THREE.IcosahedronGeometry(0.1, 1); bodyG.scale(0.8, 0.5, 2);
    const headG = new THREE.IcosahedronGeometry(0.07, 1); headG.scale(0.8, 0.55, 1); headG.translate(0, 0, 0.17);
    const patchG = new THREE.IcosahedronGeometry(0.06, 0); patchG.scale(0.9, 0.6, 1.5); patchG.translate(0, 0.035, -0.02);
    const tailG = new THREE.ConeGeometry(0.07, 0.17, 4); tailG.rotateX(-Math.PI / 2); tailG.scale(0.3, 1, 1); tailG.translate(0, 0, -0.27);
    const finG = new THREE.ConeGeometry(0.04, 0.1, 3); finG.rotateZ(Math.PI / 2);
    const fl = finG.clone(); fl.translate(0.1, -0.02, 0.05);
    const fr = finG.clone(); fr.rotateZ(Math.PI); fr.translate(-0.1, -0.02, 0.05);
    const place = (geo: THREE.BufferGeometry, c: string) => {
      geo.scale(s, s, s);
      geo.rotateY(ang);
      geo.translate(x, y, z);
      b.part(geo, c, { bone: root });
    };
    place(bodyG, "#ff8a2a"); place(headG, "#ffffff"); place(patchG, patch);
    place(tailG, "#ffb060"); place(fl, "#ffb060"); place(fr, "#ffb060");
    // eyes
    const e1 = new THREE.SphereGeometry(0.012, 5, 4); e1.translate(0.04, 0.03, 0.2);
    const e2 = new THREE.SphereGeometry(0.012, 5, 4); e2.translate(-0.04, 0.03, 0.2);
    place(e1, "#111111"); place(e2, "#111111");
    void g;
  };
  koi(-0.7, pz + 0.3, 0.6, 1.1, "#ffffff");
  koi(0.6, pz - 0.35, 3.6, 1.0, "#e8402a");
  koi(0.9, pz + 0.4, 2.2, 0.85, "#ffffff");

  // Bridge: arched along X over pond center
  const red = "#c42a1e", dark = "#8f1c14";
  const N = 9;
  const archY = (t: number) => G + 0.3 + 0.38 * (1 - Math.pow(2 * t - 1, 2));
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const x = -0.95 + t * 1.9;
    const y = archY(t);
    const slope = (0.38 * -2 * (2 * t - 1) * 2) / 1.9;
    const g = new THREE.BoxGeometry(0.26, 0.05, 0.55);
    g.rotateZ(Math.atan(slope));
    g.translate(x, y, pz);
    b.part(g, i % 2 ? red : "#b0301f", { bone: root });
    // underneath beam
  }
  // bridge sides: rails
  for (const sz of [-1, 1]) {
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const x = -0.95 + t * 1.9;
      const y = archY(t);
      if (i % 2 === 0) box(0.045, 0.2, 0.045, dark, x, y + 0.12, pz + sz * 0.27);
      if (i < N - 1) {
        const t2 = (i + 1) / (N - 1);
        const x2 = -0.95 + t2 * 1.9, y2 = archY(t2);
        const len = Math.hypot(x2 - x, y2 - y);
        const g = new THREE.BoxGeometry(len + 0.02, 0.04, 0.04);
        g.rotateZ(Math.atan2(y2 - y, x2 - x));
        g.translate((x + x2) / 2, (y + y2) / 2 + 0.22, pz + sz * 0.27);
        b.part(g, red, { bone: root });
      }
    }
    // gold caps
    ball(0.035, "#e8c050", -0.95, archY(0) + 0.24, pz + sz * 0.27);
    ball(0.035, "#e8c050", 0.95, archY(1) + 0.24, pz + sz * 0.27);
  }
  // bridge abutments
  box(0.3, 0.16, 0.6, "#8a8c8c", -1.08, G + 0.1, pz);
  box(0.3, 0.16, 0.6, "#8a8c8c", 1.08, G + 0.1, pz);

  // Stepping stones leading to bridge from front-left
  const steps: [number, number][] = [[-1.2, 1.9], [-1.35, 1.5], [-1.6, 1.15], [-1.55, 0.75], [-1.4, 0.4]];
  steps.forEach(([x, z], i) => {
    cyl(0.17 + R() * 0.03, 0.2, 0.07, i % 2 ? "#8f9190" : "#7a7c7c", x, G + 0.05, z, 8);
  });

  // Rocks with moss
  const rock = (x: number, z: number, s: number) => {
    ball(0.25 * s, "#74777a", x, G + 0.1 * s, z, 1.2, 0.8, 1);
    ball(0.2 * s, "#4f8a3a", x, G + 0.19 * s, z, 1.2, 0.5, 1);
    ball(0.08 * s, "#6aa84f", x + 0.12 * s, G + 0.2 * s, z + 0.08 * s, 1, 0.6, 1);
  };
  rock(1.3, 1.4, 1);
  rock(1.65, 1.0, 0.65);
  rock(-1.0, -1.45, 0.8);

  // Stone lantern (right-front)
  const lx = 1.35, lz = -0.95, st = "#9a9c98", st2 = "#80827f";
  cyl(0.15, 0.17, 0.06, st2, lx, G + 0.03, lz, 6);
  cyl(0.05, 0.06, 0.28, st, lx, G + 0.2, lz, 6);
  cyl(0.14, 0.09, 0.05, st2, lx, G + 0.37, lz, 6);
  cyl(0.1, 0.1, 0.14, "#f0c060", lx, G + 0.47, lz, 6);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    box(0.03, 0.14, 0.03, st, lx + Math.cos(a) * 0.1, G + 0.47, lz + Math.sin(a) * 0.1);
  }
  cyl(0.02, 0.2, 0.12, st, lx, G + 0.6, lz, 6);
  cyl(0.0, 0.2, 0.0, st, lx, G + 0.66, lz, 6);
  ball(0.045, st2, lx, G + 0.69, lz);

  // Pine tree (back-left)
  const tx = -1.3, tz = -1.1;
  const trunk = (pts: [number, number, number][], r: number) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], c = pts[i + 1];
      const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
      const g = new THREE.CylinderGeometry(r * 0.8, r, d.length(), 6);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      g.applyQuaternion(q);
      g.translate((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2);
      b.part(g, "#5b3b26", { bone: root });
      r *= 0.85;
    }
  };
  trunk([[tx, G, tz], [tx + 0.05, G + 0.3, tz], [tx - 0.1, G + 0.6, tz + 0.05], [tx, G + 0.85, tz]], 0.07);
  trunk([[tx - 0.05, G + 0.5, tz + 0.03], [tx + 0.3, G + 0.6, tz + 0.1]], 0.035);
  const cloud = (x: number, y: number, z: number, s: number) => {
    ball(0.2 * s, "#2f6b3a", x, y, z, 1.4, 0.55, 1.2);
    ball(0.14 * s, "#3c8147", x + 0.14 * s, y + 0.07 * s, z, 1.2, 0.6, 1);
    ball(0.14 * s, "#3c8147", x - 0.14 * s, y + 0.06 * s, z + 0.05, 1.2, 0.6, 1);
    ball(0.12 * s, "#4a9455", x, y + 0.11 * s, z - 0.04, 1.2, 0.6, 1);
  };
  cloud(tx - 0.05, G + 0.95, tz, 1.3);
  cloud(tx + 0.4, G + 0.7, tz + 0.1, 1);
  cloud(tx - 0.3, G + 0.65, tz + 0.1, 0.9);

  // Cherry tree (back-right)
  const cx = 0.9, cz = -0.2 - 0.9;
  trunk([[cx, G, cz], [cx - 0.05, G + 0.4, cz], [cx + 0.05, G + 0.8, cz - 0.05], [cx, G + 1.15, cz]], 0.1);
  trunk([[cx, G + 0.7, cz], [cx - 0.4, G + 1.0, cz + 0.1]], 0.04);
  trunk([[cx, G + 0.85, cz], [cx + 0.4, G + 1.1, cz + 0.05]], 0.04);
  trunk([[cx, G + 1.0, cz], [cx + 0.05, G + 1.3, cz + 0.3]], 0.035);
  const pinks = ["#f9a8c4", "#ffc2d6", "#f58bb0", "#ffd6e3"];
  const blossomCenters: [number, number, number, number][] = [
    [cx, G + 1.4, cz, 0.38], [cx - 0.45, G + 1.15, cz + 0.1, 0.28], [cx + 0.45, G + 1.2, cz + 0.05, 0.3],
    [cx + 0.05, G + 1.4, cz + 0.35, 0.26], [cx - 0.2, G + 1.6, cz - 0.1, 0.24], [cx + 0.25, G + 1.62, cz - 0.05, 0.22],
  ];
  blossomCenters.forEach(([x, y, z, r], i) => {
    ball(r, pinks[i % 4], x, y, z, 1, 0.8, 1);
    for (let k = 0; k < 6; k++) {
      ball(0.07 + R() * 0.04, pinks[(i + k) % 4], x + (R() - 0.5) * r * 1.8, y + (R() - 0.3) * r, z + (R() - 0.5) * r * 1.8);
    }
  });
  // falling petals
  for (let i = 0; i < 40; i++) {
    const x = cx + (R() - 0.5) * 2.2, z = cz + (R() - 0.2) * 2.2;
    const onGround = i < 24;
    const y = onGround ? G + 0.035 : G + 0.2 + R() * 1.2;
    const g = new THREE.CircleGeometry(0.028, 5);
    g.rotateX(onGround ? -Math.PI / 2 : -Math.PI / 2 + (R() - 0.5));
    g.rotateY(R() * 6);
    g.translate(Math.max(-1.8, Math.min(1.8, x)), y, Math.max(-1.8, Math.min(1.8, z)));
    b.part(g, pinks[i % 4], { bone: root });
  }
  // some petals on the water
  for (let i = 0; i < 6; i++) {
    const g = new THREE.CircleGeometry(0.03, 5);
    g.rotateX(-Math.PI / 2);
    g.translate(0.2 + R() * 0.8, G + 0.092, pz - 0.5 + R() * 0.9);
    b.part(g, "#ffc2d6", { bone: root });
  }

  return b.root;
}
