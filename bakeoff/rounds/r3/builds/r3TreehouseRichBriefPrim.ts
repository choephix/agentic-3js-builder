import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Oak Treehouse Diorama",
  description:
    "A cozy round grassy diorama: an old oak with a leafy crown, a small cabin with a red shingle roof, round window, lantern and pennant, a rope ladder, a swing, mushrooms and a bicycle.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const root = b.joint("base", { at: [0, 0, 0] });

  // deterministic local random
  let seed = 1234567;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  let M = new THREE.Matrix4();
  const place = (geo: THREE.BufferGeometry, color: string) => {
    geo.applyMatrix4(M);
    b.part(geo, color, { at: [0, 0, 0], bone: root });
  };
  const rotM = (r: number[]) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r[0], r[1], r[2]));

  const box = (w: number, h: number, d: number, color: string, pos: number[], rot?: number[]) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rot) g.applyMatrix4(rotM(rot));
    g.translate(pos[0], pos[1], pos[2]);
    place(g, color);
  };
  const rod = (a: number[], c: number[], r1: number, r2: number, color: string, seg = 6) => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...c);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r2, r1, len, seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
    const m = va.clone().add(vb).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    place(g, color);
  };
  const ball = (r: number, color: string, pos: number[], detail = 0, sc: number[] = [1, 1, 1]) => {
    const g = new THREE.IcosahedronGeometry(r, detail);
    g.scale(sc[0], sc[1], sc[2]);
    g.translate(pos[0], pos[1], pos[2]);
    place(g, color);
  };
  const cone = (r: number, h: number, color: string, pos: number[], seg = 6) => {
    const g = new THREE.CylinderGeometry(0, r, h, seg);
    g.translate(pos[0], pos[1] + h / 2, pos[2]);
    place(g, color);
  };

  const WOOD = "#9a6a3c";
  const DARK = "#5b3a22";
  const BARK = "#6e4a2b";
  const RED = "#c23a2e";
  const ROPE = "#d8c08a";

  // ---------- base ----------
  {
    const g = new THREE.CylinderGeometry(3.0, 2.6, 0.18, 20);
    g.translate(0, 0.09, 0);
    place(g, "#6b4a2f");
    const g2 = new THREE.CylinderGeometry(3.25, 3.05, 0.14, 20);
    g2.translate(0, 0.25, 0);
    place(g2, "#5fa646");
    // grass rim lip
    const g3 = new THREE.CylinderGeometry(3.1, 3.2, 0.06, 20);
    g3.translate(0, 0.32, 0);
    place(g3, "#6fb94f");
  }
  const G = 0.35; // ground height

  // grass tufts and flowers
  const greens = ["#4f9a3b", "#7bc45a", "#5fa646"];
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const d = 0.9 + rand() * 2.1;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (x > 0.1 && x < 1.1 && z > 1.8) continue;
    if (x < -0.8 && x > -2.6 && z > 0.6 && z < 1.9) continue;
    cone(0.05 + rand() * 0.03, 0.15 + rand() * 0.12, greens[i % 3], [x, G - 0.03, z], 4);
  }
  const petals = ["#f4e04d", "#f7f7f0", "#f08fb0"];
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2;
    const d = 1.2 + rand() * 1.7;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (x > 0.1 && x < 1.1 && z > 1.8) continue;
    if (x < -0.8 && x > -2.6 && z > 0.6 && z < 1.9) continue;
    rod([x, G - 0.02, z], [x, G + 0.2, z], 0.012, 0.012, "#4f9a3b", 4);
    ball(0.055, petals[i % 3], [x, G + 0.22, z], 0);
  }
  // little stones
  ball(0.16, "#9a9a95", [-1.0, G + 0.03, -1.7], 0, [1.2, 0.6, 1]);
  ball(0.11, "#8a8a85", [-0.8, G + 0.02, -1.55], 0, [1, 0.6, 1]);
  ball(0.14, "#a2a29c", [1.9, G + 0.03, -1.2], 0, [1.2, 0.6, 1]);

  // ---------- tree ----------
  {
    const g = new THREE.CylinderGeometry(0.42, 0.66, 4.0, 9);
    g.translate(0, G + 2.0, 0);
    place(g, BARK);
    const g2 = new THREE.CylinderGeometry(0.34, 0.45, 1.4, 9);
    g2.translate(0, G + 4.4, 0);
    place(g2, BARK);
  }
  // roots
  for (let i = 0; i < 6; i++) {
    const a = i * (Math.PI / 3) + 0.3;
    rod([Math.cos(a) * 0.4, G + 0.5, Math.sin(a) * 0.4], [Math.cos(a) * 1.1, G - 0.02, Math.sin(a) * 1.1], 0.2, 0.07, BARK, 5);
  }
  // knot hole
  ball(0.12, "#3b2616", [-0.38, 1.4, 0.42], 0, [1, 1.4, 0.6]);

  // branches
  const branches: number[][][] = [
    [[0, 4.1, 0], [-1.7, 5.2, -0.5]],
    [[0, 4.3, 0], [1.4, 5.5, -0.6]],
    [[0, 4.5, -0.1], [0.1, 6.0, -0.5]],
    [[-0.1, 4.0, 0], [-1.9, 4.8, 0.3]],
    [[0.3, 3.3, -0.2], [2.35, 3.75, -0.2]], // swing branch
  ];
  branches.forEach((br, i) => rod(br[0], br[1], i === 4 ? 0.2 : 0.22, 0.09, BARK, 6));

  // crown
  const leaf = ["#3f8f3a", "#4fa43f", "#337a33", "#62b84a"];
  const blobs: [number, number, number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i * 40 * Math.PI) / 180;
    let z = -0.4 + Math.sin(a) * 1.7;
    let y = 5.0 + rand() * 0.5;
    const x = Math.cos(a) * 2.1;
    if (z > 0.5) {
      z = 0.5;
      y = 5.6;
    }
    blobs.push([x, y, z, 1.1 + rand() * 0.3]);
  }
  blobs.push([0, 5.5, -0.3, 1.6], [0, 6.4, -0.3, 1.4], [0.9, 6.1, 0.1, 1.1], [-0.9, 6.15, -0.6, 1.15], [-1.2, 5.9, 0.1, 1.0], [1.3, 5.8, -0.9, 1.1]);
  blobs.forEach((bl, i) => ball(bl[3], leaf[i % 4], [bl[0], bl[1], bl[2]], 1));
  // apples
  [[-1.5, 4.4, 0.4], [1.9, 4.7, -0.1], [0.6, 4.6, -1.6], [-0.7, 4.5, -1.5]].forEach((p) => ball(0.09, "#d8352a", p, 0));

  // ---------- platform & cabin ----------
  box(2.3, 0.12, 2.3, WOOD, [0, 2.44, 1.1]);
  // plank lines
  for (let i = 0; i < 5; i++) box(2.3, 0.02, 0.02, DARK, [0, 2.51, 0.2 + i * 0.45]);
  // beams below
  box(0.14, 0.14, 2.3, DARK, [-0.8, 2.3, 1.1]);
  box(0.14, 0.14, 2.3, DARK, [0.8, 2.3, 1.1]);
  // braces
  rod([-0.8, 2.3, 2.15], [-0.25, 1.4, 0.4], 0.07, 0.07, DARK);
  rod([0.8, 2.3, 2.15], [0.25, 1.4, 0.4], 0.07, 0.07, DARK);
  rod([-1.05, 2.3, 0.8], [-0.4, 1.7, 0.2], 0.06, 0.06, DARK);
  rod([1.05, 2.3, 0.8], [0.4, 1.7, 0.2], 0.06, 0.06, DARK);

  // walls
  box(1.6, 1.15, 1.4, "#c99a5b", [0, 3.075, 1.1]);
  // vertical siding boards on front
  for (let i = -3; i <= 3; i++) box(0.015, 1.15, 0.02, "#a67a42", [i * 0.2, 3.075, 1.81]);
  // corner posts
  [[-0.8, 0.4], [0.8, 0.4], [-0.8, 1.8], [0.8, 1.8]].forEach((c) => box(0.1, 1.2, 0.1, DARK, [c[0], 3.075, c[1]]));
  // gable prism
  {
    const s = new THREE.Shape();
    s.moveTo(-0.8, 0);
    s.lineTo(0.8, 0);
    s.lineTo(0, 0.6);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.4, bevelEnabled: false });
    g.translate(0, 3.65, 0.4);
    place(g, "#c99a5b");
  }
  // roof
  const ang = Math.atan2(0.6, 0.8);
  box(1.3, 0.08, 1.95, RED, [0.43, 3.99, 1.1], [0, 0, -ang]);
  box(1.3, 0.08, 1.95, RED, [-0.43, 3.99, 1.1], [0, 0, ang]);
  // shingle rows
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.2;
    const px = 0.8 * (1 - t) + 0.12;
    const py = 3.65 + 0.6 * t + 0.05;
    box(0.04, 0.05, 1.97, "#8e2a22", [px + 0.43 - 0.43 + 0.02, py + 0.03, 1.1], [0, 0, -ang]);
    box(0.04, 0.05, 1.97, "#8e2a22", [-px - 0.02, py + 0.03, 1.1], [0, 0, ang]);
  }
  // ridge cap
  box(0.14, 0.1, 2.0, "#8e2a22", [0, 4.3, 1.1], [0, 0, Math.PI / 4]);
  // chimney
  box(0.22, 0.5, 0.22, "#8a8178", [-0.4, 4.2, 0.65]);
  box(0.28, 0.06, 0.28, "#5f5850", [-0.4, 4.47, 0.65]);

  // door
  box(0.44, 0.88, 0.05, "#6a4226", [-0.3, 2.94, 1.82]);
  box(0.5, 0.05, 0.07, DARK, [-0.3, 3.4, 1.82]);
  box(0.05, 0.88, 0.07, DARK, [-0.54, 2.94, 1.82]);
  box(0.05, 0.88, 0.07, DARK, [-0.06, 2.94, 1.82]);
  ball(0.035, "#e6c14a", [-0.14, 2.9, 1.86], 0);
  // round window
  {
    const glass = new THREE.CylinderGeometry(0.26, 0.26, 0.05, 14);
    glass.rotateX(Math.PI / 2);
    glass.translate(0.38, 3.2, 1.82);
    place(glass, "#bfe6f2");
    const fr = new THREE.TorusGeometry(0.28, 0.04, 5, 16);
    fr.translate(0.38, 3.2, 1.84);
    place(fr, DARK);
    box(0.54, 0.035, 0.04, DARK, [0.38, 3.2, 1.85]);
    box(0.035, 0.54, 0.04, DARK, [0.38, 3.2, 1.85]);
    box(0.62, 0.06, 0.09, "#7a5230", [0.38, 2.88, 1.86]); // sill
    ball(0.07, "#e8546a", [0.25, 2.97, 1.88], 0);
    ball(0.07, "#f2c744", [0.45, 2.97, 1.88], 0);
  }
  // side round vent
  {
    const g = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 10);
    g.rotateZ(Math.PI / 2);
    g.translate(0.82, 3.2, 1.1);
    place(g, "#bfe6f2");
  }

  // railing
  const postsX = [-1.1, 1.1];
  postsX.forEach((x) => {
    [0.15, 2.15].forEach((z) => box(0.08, 0.6, 0.08, DARK, [x, 2.8, z]));
    box(0.06, 0.06, 2.1, WOOD, [x, 3.1, 1.15]);
    box(0.05, 0.05, 2.1, WOOD, [x, 2.85, 1.15]);
  });
  box(1.15, 0.06, 0.06, WOOD, [-0.55, 3.1, 2.15]);
  box(1.15, 0.05, 0.05, WOOD, [-0.55, 2.85, 2.15]);
  box(0.4, 0.06, 0.06, WOOD, [0.9, 3.1, 2.15]);

  // lantern on tall post
  rod([-1.1, 3.1, 2.15], [-1.1, 3.75, 2.15], 0.05, 0.05, DARK);
  rod([-1.1, 3.75, 2.15], [-0.78, 3.75, 2.15], 0.03, 0.03, DARK);
  rod([-0.78, 3.75, 2.15], [-0.78, 3.6, 2.15], 0.01, 0.01, "#333333", 4);
  box(0.16, 0.2, 0.16, "#ffd75a", [-0.78, 3.48, 2.15]);
  cone(0.13, 0.1, "#2f2f2f", [-0.78, 3.58, 2.15], 4);
  box(0.19, 0.04, 0.19, "#2f2f2f", [-0.78, 3.37, 2.15]);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((s) => box(0.02, 0.2, 0.02, "#2f2f2f", [-0.78 + s[0] * 0.08, 3.48, 2.15 + s[1] * 0.08]));

  // pennant flag on roof
  rod([0, 4.2, 1.92], [0, 5.0, 1.92], 0.03, 0.02, DARK);
  ball(0.045, "#e6c14a", [0, 5.03, 1.92], 0);
  {
    const s = new THREE.Shape();
    s.moveTo(0, 0.18);
    s.lineTo(0.75, 0.02);
    s.lineTo(0, -0.14);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false });
    g.translate(0.02, 4.8, 1.905);
    place(g, "#f2c030");
    const s2 = new THREE.Shape();
    s2.moveTo(0, 0.05);
    s2.lineTo(0.3, 0.02);
    s2.lineTo(0, -0.02);
    s2.closePath();
    const g2 = new THREE.ExtrudeGeometry(s2, { depth: 0.04, bevelEnabled: false });
    g2.translate(0.02, 4.8, 1.9);
    place(g2, RED);
  }

  // ---------- rope ladder ----------
  {
    const top = 2.42;
    const bot = G + 0.02;
    const zt = 2.25;
    const zb = 2.65;
    [0.45, 0.8].forEach((x) => rod([x, top, zt], [x, bot, zb], 0.025, 0.025, ROPE, 5));
    const n = 8;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const y = top + (bot - top) * t;
      const z = zt + (zb - zt) * t;
      rod([0.4, y, z], [0.85, y, z], 0.03, 0.03, WOOD, 5);
    }
    ball(0.045, ROPE, [0.45, 2.45, 2.25], 0);
    ball(0.045, ROPE, [0.8, 2.45, 2.25], 0);
  }

  // ---------- swing ----------
  {
    const seatY = 1.1;
    rod([1.4, 3.52, -0.2], [1.4, seatY, -0.2], 0.022, 0.022, ROPE, 5);
    rod([2.0, 3.66, -0.2], [2.0, seatY, -0.2], 0.022, 0.022, ROPE, 5);
    box(0.8, 0.07, 0.3, "#b57a3e", [1.7, seatY - 0.03, -0.2]);
    box(0.8, 0.02, 0.02, DARK, [1.7, seatY + 0.01, -0.12]);
    ball(0.04, ROPE, [1.4, 3.55, -0.2], 0);
    ball(0.04, ROPE, [2.0, 3.69, -0.2], 0);
  }

  // ---------- mushrooms ----------
  const mush = (x: number, z: number, s: number, capCol: string) => {
    const st = new THREE.CylinderGeometry(0.06 * s, 0.09 * s, 0.25 * s, 6);
    st.translate(x, G + 0.125 * s, z);
    place(st, "#efe6d0");
    const cap = new THREE.SphereGeometry(0.2 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    cap.translate(x, G + 0.22 * s, z);
    place(cap, capCol);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26;
      const e = i === 4 ? 0 : 0.8;
      const r = 0.2 * s;
      const dx = Math.cos(a) * Math.sin(e) * r * 1.0;
      const dz = Math.sin(a) * Math.sin(e) * r * 1.0;
      const dy = Math.cos(e) * r;
      ball(0.035 * s, "#fff6e0", [x + dx, G + 0.22 * s + dy, z + dz], 0);
    }
  };
  mush(-0.75, 0.75, 1.3, RED);
  mush(-1.05, 0.5, 0.9, "#e0702e");
  mush(-0.55, 0.45, 0.7, RED);
  mush(0.85, -0.85, 1.0, RED);
  mush(1.1, -0.65, 0.65, "#e0702e");

  // ---------- bicycle ----------
  {
    M = new THREE.Matrix4().makeTranslation(-1.7, G, 1.55).multiply(new THREE.Matrix4().makeRotationY(0.35));
    const wr = 0.34;
    const hubs = [-0.5, 0.5];
    hubs.forEach((x) => {
      const t = new THREE.TorusGeometry(wr, 0.03, 5, 18);
      t.translate(x, wr, 0);
      place(t, "#2b2b2e");
      const rim = new THREE.TorusGeometry(wr - 0.04, 0.012, 4, 18);
      rim.translate(x, wr, 0);
      place(rim, "#c8c8cc");
      ball(0.04, "#c8c8cc", [x, wr, 0], 0);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 4;
        rod([x - Math.cos(a) * (wr - 0.04), wr - Math.sin(a) * (wr - 0.04), 0], [x + Math.cos(a) * (wr - 0.04), wr + Math.sin(a) * (wr - 0.04), 0], 0.008, 0.008, "#c8c8cc", 3);
      }
    });
    const FR = "#2a9d8f";
    const bb = [0, 0.3, 0];
    const seatTop = [-0.15, 0.78, 0];
    const head = [0.36, 0.72, 0];
    rod([-0.5, wr, 0], bb, 0.02, 0.02, FR);
    rod(bb, seatTop, 0.025, 0.025, FR);
    rod(seatTop, head, 0.025, 0.025, FR);
    rod(bb, head, 0.028, 0.028, FR);
    rod([-0.5, wr, 0], seatTop, 0.02, 0.02, FR);
    rod(head, [0.5, wr, 0], 0.022, 0.022, "#c8c8cc");
    rod(head, [0.33, 0.9, 0], 0.02, 0.02, "#c8c8cc");
    rod([0.33, 0.9, -0.28], [0.33, 0.9, 0.28], 0.018, 0.018, "#2b2b2e");
    ball(0.035, "#2b2b2e", [0.33, 0.9, 0.29], 0);
    ball(0.035, "#2b2b2e", [0.33, 0.9, -0.29], 0);
    rod(seatTop, [-0.17, 0.86, 0], 0.014, 0.014, "#c8c8cc");
    box(0.26, 0.05, 0.12, "#3a2a22", [-0.18, 0.89, 0]);
    box(0.1, 0.03, 0.06, "#c8c8cc", [0, 0.22, 0.1]);
    box(0.1, 0.03, 0.06, "#c8c8cc", [0, 0.38, -0.1]);
    ball(0.05, "#f2c030", [0.4, 0.8, 0], 0); // headlamp
    // basket
    box(0.2, 0.14, 0.26, "#c99a5b", [0.45, 0.98, 0]);
    M = new THREE.Matrix4();
  }

  return b.root;
}
