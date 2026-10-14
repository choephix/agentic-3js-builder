import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Lighthouse Island Diorama",
  description:
    "A cozy lighthouse on a tiny rocky island with a keeper's cottage, jetty, rowboat, seagulls, flowers and turquoise water on a round base.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  const root = b.root;
  const R = rng(7);
  const mats = new Map<string, THREE.Material>();
  const mat = (c: string, emissive = false, opacity = 1) => {
    const k = c + emissive + opacity;
    if (!mats.has(k)) {
      mats.set(
        k,
        new THREE.MeshStandardMaterial({
          color: c,
          flatShading: true,
          roughness: 0.8,
          metalness: 0.03,
          emissive: emissive ? c : "#000000",
          emissiveIntensity: emissive ? 0.9 : 0,
          transparent: opacity < 1,
          opacity,
          side: THREE.DoubleSide,
          depthWrite: opacity >= 1,
        })
      );
    }
    return mats.get(k)!;
  };
  const add = (
    geo: THREE.BufferGeometry,
    c: string,
    p: [number, number, number],
    o: { rot?: [number, number, number]; s?: [number, number, number]; em?: boolean; op?: number } = {}
  ) => {
    const m = new THREE.Mesh(geo, mat(c, !!o.em, o.op ?? 1));
    m.position.set(...p);
    if (o.rot) m.rotation.set(...o.rot);
    if (o.s) m.scale.set(...o.s);
    root.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---- base & water
  add(cyl(0.56, 0.58, 0.07, 32), "#5b3a24", [0, 0.035, 0]);
  add(cyl(0.57, 0.57, 0.02, 32), "#8a5a34", [0, 0.075, 0]);
  add(cyl(0.52, 0.52, 0.06, 32), "#2ec4c6", [0, 0.1, 0]);
  add(cyl(0.52, 0.52, 0.005, 32), "#7ee8e0", [0, 0.1305, 0], { op: 0.5 });
  // wave ridges
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2, r = 0.38 + R() * 0.12;
    add(box(0.07 + R() * 0.05, 0.008, 0.012), "#bff6f0", [Math.cos(a) * r, 0.133, Math.sin(a) * r], { rot: [0, -a + Math.PI / 2, 0] });
  }
  // foam
  add(new THREE.TorusGeometry(0.37, 0.018, 5, 24), "#ffffff", [0, 0.13, 0], { rot: [Math.PI / 2, 0, 0], s: [1, 1, 0.4] });
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2, r = 0.36 + R() * 0.04;
    add(new THREE.IcosahedronGeometry(0.02 + R() * 0.015, 0), "#f4ffff", [Math.cos(a) * r, 0.132, Math.sin(a) * r], { s: [1, 0.5, 1] });
  }

  // ---- island
  add(cyl(0.33, 0.37, 0.08, 9), "#7d7a78", [0, 0.16, 0]);
  add(cyl(0.3, 0.32, 0.05, 9), "#4fa84a", [0, 0.2, 0]);
  const rockC = ["#8b8886", "#6f6c6b", "#a19e9b", "#5f5d5e"];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.2, r = 0.31 + R() * 0.05;
    const sz = 0.04 + R() * 0.04;
    add(new THREE.DodecahedronGeometry(sz, 0), rockC[i % 4], [Math.cos(a) * r, 0.14 + R() * 0.03, Math.sin(a) * r], {
      s: [1, 0.7, 1],
      rot: [R(), R() * 3, R()],
    });
  }

  // ---- lighthouse
  const tx = -0.09, tz = -0.07, ty = 0.225;
  add(cyl(0.11, 0.115, 0.03, 12), "#6f6c6b", [tx, ty + 0.012, tz]);
  const segH = 0.1;
  for (let i = 0; i < 5; i++) {
    const rb = 0.1 - i * 0.0075, rt = 0.1 - (i + 1) * 0.0075;
    add(cyl(rt, rb, segH, 12), i % 2 === 0 ? "#d7332f" : "#fbf6ec", [tx, ty + 0.03 + segH * (i + 0.5), tz]);
  }
  const topY = ty + 0.03 + segH * 5;
  // tower windows & door
  add(box(0.03, 0.045, 0.01), "#2a6fd6", [tx, ty + 0.07, tz + 0.1]);
  add(box(0.02, 0.025, 0.01), "#ffd966", [tx, ty + 0.25, tz + 0.082], { em: true });
  add(box(0.02, 0.025, 0.01), "#ffd966", [tx, ty + 0.38, tz + 0.074], { em: true });
  // gallery
  add(cyl(0.085, 0.07, 0.015, 12), "#2b2b30", [tx, topY + 0.007, tz]);
  add(cyl(0.12, 0.12, 0.012, 12), "#2b2b30", [tx, topY + 0.02, tz]);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    add(cyl(0.003, 0.003, 0.05, 4), "#2b2b30", [tx + Math.cos(a) * 0.115, topY + 0.05, tz + Math.sin(a) * 0.115]);
  }
  add(new THREE.TorusGeometry(0.115, 0.004, 4, 16), "#2b2b30", [tx, topY + 0.075, tz], { rot: [Math.PI / 2, 0, 0] });
  // lantern room
  add(cyl(0.05, 0.05, 0.075, 8), "#ffe27a", [tx, topY + 0.06, tz], { em: true, op: 0.9 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    add(box(0.006, 0.08, 0.006), "#2b2b30", [tx + Math.cos(a) * 0.05, topY + 0.06, tz + Math.sin(a) * 0.05]);
  }
  add(cyl(0.062, 0.062, 0.008, 8), "#2b2b30", [tx, topY + 0.103, tz]);
  add(new THREE.ConeGeometry(0.065, 0.05, 8), "#d7332f", [tx, topY + 0.132, tz]);
  add(new THREE.SphereGeometry(0.01, 6, 5), "#2b2b30", [tx, topY + 0.162, tz]);
  add(cyl(0.002, 0.002, 0.03, 4), "#2b2b30", [tx, topY + 0.175, tz]);
  // light beams
  add(new THREE.ConeGeometry(0.07, 0.3, 8, 1, true), "#fff3b0", [tx + 0.18, topY + 0.06, tz], { rot: [0, 0, Math.PI / 2], op: 0.18 });
  add(new THREE.ConeGeometry(0.07, 0.3, 8, 1, true), "#fff3b0", [tx - 0.18, topY + 0.06, tz], { rot: [0, 0, -Math.PI / 2], op: 0.18 });

  // ---- cottage
  const cx = 0.16, cz = 0.06, cy = 0.225;
  add(box(0.2, 0.09, 0.14), "#f1e4c8", [cx, cy + 0.045, cz]);
  add(box(0.21, 0.015, 0.15), "#8d8579", [cx, cy + 0.006, cz]);
  const gs = new THREE.Shape();
  gs.moveTo(-0.085, 0); gs.lineTo(0.085, 0); gs.lineTo(0, 0.07); gs.closePath();
  const roofG = new THREE.ExtrudeGeometry(gs, { depth: 0.23, bevelEnabled: false });
  roofG.translate(0, 0, -0.115);
  roofG.rotateY(Math.PI / 2);
  add(roofG, "#7a3b2e", [cx, cy + 0.09, cz], { s: [1, 1, 1.1] });
  add(box(0.215, 0.008, 0.01), "#4d2419", [cx, cy + 0.158, cz]);
  // door
  add(box(0.032, 0.058, 0.008), "#2a6fd6", [cx - 0.02, cy + 0.032, cz + 0.07]);
  add(new THREE.SphereGeometry(0.003, 5, 4), "#ffd966", [cx - 0.01, cy + 0.03, cz + 0.076]);
  add(box(0.042, 0.006, 0.014), "#8d8579", [cx - 0.02, cy + 0.004, cz + 0.078]);
  // windows
  for (const wx of [0.04, 0.1]) {
    if (wx === 0.1) continue;
    add(box(0.035, 0.03, 0.006), "#ffd966", [cx + wx, cy + 0.055, cz + 0.07], { em: true });
    add(box(0.045, 0.006, 0.01), "#2a6fd6", [cx + wx, cy + 0.037, cz + 0.073]);
  }
  add(box(0.006, 0.03, 0.035), "#ffd966", [cx + 0.1, cy + 0.055, cz], { em: true });
  // crooked chimney
  add(box(0.03, 0.05, 0.03), "#a5503f", [cx + 0.06, cy + 0.145, cz - 0.02], { rot: [0, 0.2, 0.04] });
  add(box(0.034, 0.025, 0.034), "#8c4132", [cx + 0.064, cy + 0.18, cz - 0.02], { rot: [0.05, 0.4, 0.14] });
  add(box(0.038, 0.008, 0.038), "#5a2b21", [cx + 0.072, cy + 0.197, cz - 0.02], { rot: [0.05, 0.4, 0.14] });
  for (let i = 0; i < 3; i++)
    add(new THREE.IcosahedronGeometry(0.01 + i * 0.004, 0), "#eeeeee", [cx + 0.08 + i * 0.012, cy + 0.215 + i * 0.026, cz - 0.02], { op: 0.7 - i * 0.15 });
  // path
  for (let i = 0; i < 4; i++)
    add(cyl(0.012, 0.012, 0.004, 6), "#b8aa94", [cx - 0.02 - i * 0.02, cy + 0.027, cz + 0.11 + i * 0.01]);

  // ---- jetty
  const jx = -0.22;
  for (let i = 0; i < 9; i++) {
    add(box(0.09, 0.012, 0.026), i % 2 ? "#a07148" : "#b8825a", [jx, 0.2, 0.28 + i * 0.03]);
  }
  add(box(0.008, 0.01, 0.27), "#6b4528", [jx - 0.035, 0.19, 0.4]);
  add(box(0.008, 0.01, 0.27), "#6b4528", [jx + 0.035, 0.19, 0.4]);
  for (const [px, pz] of [[-0.04, 0.3], [0.04, 0.3], [-0.04, 0.5], [0.04, 0.5]] as const) {
    add(cyl(0.011, 0.011, 0.14, 6), "#5b3a24", [jx + px, 0.16, pz]);
  }
  add(cyl(0.011, 0.011, 0.04, 6), "#5b3a24", [jx + 0.045, 0.225, 0.52]);

  // ---- rowboat
  const bx = -0.33, bz = 0.46;
  const hull = new THREE.SphereGeometry(0.06, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  add(hull, "#c9462f", [bx, 0.15, bz], { s: [0.75, 1, 1.7] });
  add(new THREE.TorusGeometry(0.06, 0.005, 4, 12), "#f4ecd8", [bx, 0.15, bz], { rot: [Math.PI / 2, 0, 0], s: [0.75, 1.7, 1] });
  add(box(0.08, 0.008, 0.02), "#a07148", [bx, 0.125, bz]);
  add(box(0.08, 0.008, 0.02), "#a07148", [bx, 0.125, bz - 0.05]);
  add(cyl(0.004, 0.004, 0.13, 4), "#c9a36b", [bx + 0.03, 0.14, bz + 0.01], { rot: [0.2, 0, 1.2] });
  add(cyl(0.004, 0.004, 0.13, 4), "#c9a36b", [bx - 0.03, 0.14, bz + 0.01], { rot: [0.2, 0, -1.2] });
  add(cyl(0.003, 0.003, 0.14, 4), "#e8d9b0", [(bx + jx + 0.045) / 2 + 0.03, 0.17, 0.5], { rot: [0.25, 0, Math.PI / 2 - 0.1] });
  add(new THREE.TorusGeometry(0.075, 0.004, 4, 16), "#ffffff", [bx, 0.133, bz], { rot: [Math.PI / 2, 0, 0], s: [0.8, 1.7, 1] });

  // ---- seagulls
  const gull = (x: number, y: number, z: number, ry: number, fly: boolean) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    root.add(g);
    const part = (geo: THREE.BufferGeometry, c: string, p: [number, number, number], s?: [number, number, number], r?: [number, number, number]) => {
      const m = new THREE.Mesh(geo, mat(c));
      m.position.set(...p);
      if (s) m.scale.set(...s);
      if (r) m.rotation.set(...r);
      g.add(m);
    };
    part(new THREE.SphereGeometry(0.025, 7, 5), "#fbfbfb", [0, 0.03, 0], [0.8, 0.8, 1.4]);
    part(new THREE.SphereGeometry(0.015, 6, 5), "#fbfbfb", [0, 0.055, 0.032]);
    part(new THREE.ConeGeometry(0.006, 0.02, 4), "#ff9f1c", [0, 0.053, 0.05], undefined, [Math.PI / 2, 0, 0]);
    part(new THREE.SphereGeometry(0.003, 4, 3), "#111111", [0.008, 0.06, 0.042]);
    part(new THREE.SphereGeometry(0.003, 4, 3), "#111111", [-0.008, 0.06, 0.042]);
    part(new THREE.ConeGeometry(0.014, 0.03, 4), "#e8e8ee", [0, 0.03, -0.045], [1, 1, 0.4], [-Math.PI / 2 - 0.2, 0, 0]);
    for (const s of [1, -1]) {
      part(box(0.05, 0.004, 0.04), "#9aa3ad", [s * 0.04, 0.034 + (fly ? 0.02 : 0), -0.002], undefined, [0, 0, s * (fly ? 0.45 : -0.1)]);
      part(box(0.02, 0.004, 0.03), "#2b2b30", [s * (fly ? 0.075 : 0.062), 0.03 + (fly ? 0.04 : 0), -0.002], undefined, [0, 0, s * (fly ? 0.45 : -0.1)]);
      if (!fly) part(cyl(0.002, 0.002, 0.02, 4), "#ff9f1c", [s * 0.008, 0.01, 0]);
    }
  };
  gull(-0.26, 0.23, 0.52, 0.6, false);
  gull(cx + 0.02, cy + 0.185, cz, 1.2, false);
  gull(0.25, 0.75, 0.25, 0.8, true);

  // ---- grass & flowers
  const greens = ["#3f9a3f", "#5cc04f", "#2f7d34"];
  const tuft = (x: number, z: number, y = 0.225) => {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      add(new THREE.ConeGeometry(0.005, 0.035 + R() * 0.02, 3), greens[i % 3], [x + Math.cos(a) * 0.008, y + 0.015, z + Math.sin(a) * 0.008], {
        rot: [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3],
      });
    }
  };
  const flowerC = ["#ff6fa0", "#ffd23f", "#ffffff", "#a56bff", "#ff8a3d"];
  const flower = (x: number, z: number, c: string) => {
    const h = 0.03 + R() * 0.02;
    add(cyl(0.0015, 0.0015, h, 3), "#2f7d34", [x, 0.225 + h / 2, z]);
    add(new THREE.IcosahedronGeometry(0.008, 0), c, [x, 0.225 + h, z]);
    add(new THREE.SphereGeometry(0.003, 4, 3), "#ffcc00", [x, 0.225 + h + 0.006, z]);
  };
  let placed = 0, tries = 0;
  while (placed < 26 && tries < 400) {
    tries++;
    const a = R() * Math.PI * 2, r = 0.1 + R() * 0.2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x - tx, z - tz) < 0.13) continue;
    if (x > 0.04 && x < 0.28 && z > -0.04 && z < 0.2) continue;
    if (Math.abs(x - jx) < 0.07 && z > 0.2) continue;
    if (placed % 3 === 0) flower(x, z, flowerC[placed % 5]);
    else tuft(x, z);
    placed++;
  }

  return root;
}
