```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Island Diorama",
  description:
    "A cozy lighthouse diorama: striped tower with glowing lantern, keeper's cottage, jetty with rowboat, seagulls, flowers and turquoise water on a round base.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lighthouse_island" });
  b.joint("base", { at: [0, 0, 0] });
  const g = new THREE.Group();
  g.name = "diorama";
  b.root.add(g);

  const mats = new Map<string, THREE.MeshStandardMaterial>();
  function mat(color: string, o: { emissive?: string; ei?: number; double?: boolean; flat?: boolean } = {}) {
    const key = color + (o.emissive ?? "") + (o.double ? "d" : "") + (o.flat ? "f" : "");
    let m = mats.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.75,
        metalness: 0.04,
        flatShading: o.flat ?? true,
        side: o.double ? THREE.DoubleSide : THREE.FrontSide,
      });
      if (o.emissive) {
        m.emissive = new THREE.Color(o.emissive);
        m.emissiveIntensity = o.ei ?? 1;
      }
      mats.set(key, m);
    }
    return m;
  }
  function add(
    geo: THREE.BufferGeometry,
    color: string,
    pos: [number, number, number],
    parent: THREE.Object3D = g,
    rot: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1],
    o: { emissive?: string; ei?: number; double?: boolean } = {}
  ) {
    const m = new THREE.Mesh(geo, mat(color, o));
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.scale.set(...scale);
    parent.add(m);
    return m;
  }
  const R = rng(7);

  // ---------- base ----------
  add(new THREE.CylinderGeometry(1.65, 1.7, 0.14, 40), "#5a3b24", [0, 0.07, 0]);
  add(new THREE.CylinderGeometry(1.6, 1.65, 0.06, 40), "#8a5a35", [0, 0.17, 0]);
  add(new THREE.CylinderGeometry(1.5, 1.5, 0.1, 40), "#2fb7b5", [0, 0.22, 0]);
  add(new THREE.CylinderGeometry(1.52, 1.52, 0.03, 40), "#1d8fa0", [0, 0.155, 0]);
  const WATER = 0.27;
  // ripples
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2, d = 1.15 + R() * 0.3;
    add(new THREE.TorusGeometry(0.06 + R() * 0.05, 0.007, 4, 12), "#8fe3dc",
      [Math.cos(a) * d, WATER + 0.003, Math.sin(a) * d], g, [Math.PI / 2, 0, 0], [1.6, 1, 1]);
  }

  // ---------- island ----------
  const TOP = 0.55;
  add(new THREE.CylinderGeometry(0.95, 1.12, TOP - 0.2, 9), "#7d7a78", [0, (TOP + 0.2) / 2, 0]);
  add(new THREE.CylinderGeometry(0.88, 0.95, 0.06, 9), "#5fae45", [0, TOP - 0.01, 0]);
  add(new THREE.CylinderGeometry(0.8, 0.88, 0.04, 9), "#79c456", [0, TOP + 0.03, 0]);
  const rockCols = ["#6d6a6a", "#8b8886", "#58565a", "#9a9590"];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.3;
    const d = 0.95 + R() * 0.2;
    const s = 0.1 + R() * 0.12;
    add(new THREE.DodecahedronGeometry(s, 0), rockCols[i % 4],
      [Math.cos(a) * d, WATER + s * 0.4, Math.sin(a) * d], g,
      [R() * 3, R() * 3, R() * 3], [1, 0.75 + R() * 0.3, 1]);
  }
  // rocks poking in the water
  for (const [x, z, s] of [[-1.15, 0.5, 0.14], [1.2, -0.4, 0.12], [-0.6, -1.15, 0.16], [0.9, 0.95, 0.09]]) {
    add(new THREE.DodecahedronGeometry(s, 0), "#7a7777", [x, WATER + s * 0.4, z], g, [R(), R() * 3, R()], [1, 0.8, 1]);
  }
  // foam
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2;
    const d = 1.12 + Math.sin(i * 1.7) * 0.05;
    if (Math.abs(a - Math.PI / 2) < 0.18) continue; // gap for jetty
    add(new THREE.SphereGeometry(0.07 + R() * 0.05, 6, 4), "#ffffff",
      [Math.cos(a) * d, WATER, Math.sin(a) * d], g, [0, 0, 0], [1.3, 0.35, 1]);
  }
  for (const [x, z, s] of [[-1.15, 0.5, 0.14], [1.2, -0.4, 0.12], [-0.6, -1.15, 0.16]]) {
    add(new THREE.TorusGeometry(s + 0.05, 0.025, 5, 14), "#ffffff", [x, WATER + 0.005, z], g, [Math.PI / 2, 0, 0]);
  }

  // ---------- lighthouse ----------
  const LX = -0.3, LZ = -0.25;
  const lh = new THREE.Group();
  lh.position.set(LX, TOP + 0.04, LZ);
  g.add(lh);
  add(new THREE.CylinderGeometry(0.38, 0.42, 0.14, 12), "#8b8886", [0, 0.07, 0], lh);
  const rAt = (y: number) => 0.28 - 0.1 * ((y - 0.14) / 1.44);
  const bandH = 0.24;
  for (let i = 0; i < 6; i++) {
    const y0 = 0.14 + i * bandH;
    add(new THREE.CylinderGeometry(rAt(y0 + bandH), rAt(y0), bandH, 16),
      i % 2 === 0 ? "#d63a2f" : "#f6f1e7", [0, y0 + bandH / 2, 0], lh);
  }
  const topY = 0.14 + 6 * bandH; // 1.58
  // windows
  for (const i of [1, 3, 4]) {
    const y = 0.14 + i * bandH + bandH / 2;
    add(new THREE.BoxGeometry(0.06, 0.1, 0.03), "#2b3a4a", [0, y, rAt(y) - 0.005], lh);
    add(new THREE.BoxGeometry(0.09, 0.015, 0.04), "#3a3a3e", [0, y - 0.06, rAt(y) + 0.005], lh);
  }
  // gallery
  add(new THREE.CylinderGeometry(0.3, 0.2, 0.06, 16), "#1e1e22", [0, topY + 0.03, 0], lh);
  add(new THREE.CylinderGeometry(0.34, 0.34, 0.025, 16), "#26262b", [0, topY + 0.07, 0], lh);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    add(new THREE.BoxGeometry(0.015, 0.14, 0.015), "#1e1e22",
      [Math.cos(a) * 0.33, topY + 0.15, Math.sin(a) * 0.33], lh);
  }
  add(new THREE.TorusGeometry(0.33, 0.01, 4, 20), "#1e1e22", [0, topY + 0.22, 0], lh, [Math.PI / 2, 0, 0]);
  add(new THREE.TorusGeometry(0.33, 0.008, 4, 20), "#1e1e22", [0, topY + 0.14, 0], lh, [Math.PI / 2, 0, 0]);
  // lantern room
  const lanY = topY + 0.085;
  add(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 12), "#ffe48a", [0, lanY + 0.12, 0], lh, [0, 0, 0], [1, 1, 1],
    { emissive: "#ffcc44", ei: 1.3 });
  add(new THREE.SphereGeometry(0.06, 8, 6), "#fff6c8", [0, lanY + 0.12, 0], lh, [0, 0, 0], [1, 1, 1],
    { emissive: "#fff2a0", ei: 2 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    add(new THREE.BoxGeometry(0.018, 0.25, 0.018), "#1e1e22",
      [Math.cos(a) * 0.142, lanY + 0.125, Math.sin(a) * 0.142], lh);
  }
  add(new THREE.CylinderGeometry(0.17, 0.16, 0.03, 12), "#1e1e22", [0, lanY + 0.255, 0], lh);
  add(new THREE.ConeGeometry(0.19, 0.2, 12), "#d63a2f", [0, lanY + 0.37, 0], lh);
  add(new THREE.SphereGeometry(0.03, 6, 5), "#1e1e22", [0, lanY + 0.5, 0], lh);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 4), "#1e1e22", [0, lanY + 0.55, 0], lh);
  const glow = new THREE.PointLight("#ffd36a", 1.2, 3);
  glow.position.set(LX, TOP + 0.04 + lanY + 0.12, LZ);
  g.add(glow);

  // ---------- cottage ----------
  const cot = new THREE.Group();
  cot.position.set(0.5, TOP + 0.04, 0.05);
  cot.rotation.y = -0.5;
  g.add(cot);
  add(new THREE.BoxGeometry(0.56, 0.05, 0.4), "#8b8886", [0, 0.025, 0], cot);
  add(new THREE.BoxGeometry(0.5, 0.3, 0.34), "#f3ead6", [0, 0.2, 0], cot);
  add(new THREE.ConeGeometry(0.4, 0.24, 4), "#7a3d2b", [0, 0.47, 0], cot, [0, Math.PI / 4, 0], [1.0, 1, 0.78]);
  add(new THREE.BoxGeometry(0.56, 0.02, 0.04), "#5a2c20", [0, 0.36, 0.17], cot, [0.5, 0, 0]);
  // door
  add(new THREE.BoxGeometry(0.1, 0.18, 0.03), "#2f6fc9", [-0.1, 0.14, 0.175], cot);
  add(new THREE.BoxGeometry(0.13, 0.02, 0.04), "#6b4a2b", [-0.1, 0.235, 0.18], cot);
  add(new THREE.SphereGeometry(0.01, 5, 4), "#f2c14e", [-0.075, 0.14, 0.195], cot);
  add(new THREE.BoxGeometry(0.14, 0.02, 0.1), "#8b8886", [-0.1, 0.055, 0.22], cot);
  // windows
  for (const x of [0.12, 0.25]) {
    if (x > 0.2) continue;
    add(new THREE.BoxGeometry(0.11, 0.1, 0.02), "#ffd86b", [x, 0.22, 0.175], cot, [0, 0, 0], [1, 1, 1],
      { emissive: "#ffb830", ei: 0.9 });
    add(new THREE.BoxGeometry(0.13, 0.012, 0.03), "#2f6fc9", [x, 0.16, 0.185], cot);
    add(new THREE.BoxGeometry(0.012, 0.1, 0.025), "#f3ead6", [x, 0.22, 0.19], cot);
    add(new THREE.BoxGeometry(0.11, 0.012, 0.025), "#f3ead6", [x, 0.22, 0.19], cot);
  }
  add(new THREE.BoxGeometry(0.02, 0.1, 0.1), "#ffd86b", [0.255, 0.22, 0], cot, [0, 0, 0], [1, 1, 1],
    { emissive: "#ffb830", ei: 0.9 });
  // crooked chimney
  const chim: [number, number, number, number][] = [
    [0.14, 0.4, 0.0, 0.0], [0.145, 0.5, 0.0, -0.05], [0.155, 0.59, 0.0, -0.12],
  ];
  chim.forEach(([x, y, z, rz], i) => {
    add(new THREE.BoxGeometry(0.09 - i * 0.005, 0.12, 0.09 - i * 0.005), i === 2 ? "#a04a38" : "#b5573f",
      [x - i * 0.01, y, z], cot, [0, 0.1 * i, rz]);
  });
  add(new THREE.BoxGeometry(0.11, 0.03, 0.11), "#4a4a50", [0.12, 0.665, 0], cot, [0, 0.3, -0.18]);
  for (let i = 0; i < 3; i++) {
    add(new THREE.IcosahedronGeometry(0.035 + i * 0.015, 0), "#e9eef2",
      [0.1 - i * 0.04, 0.74 + i * 0.1, 0], cot, [i, i, 0], [1, 1, 1]);
  }
  // barrel & lamp
  add(new THREE.CylinderGeometry(0.04, 0.045, 0.08, 8), "#8a5a35", [0.2, 0.09, 0.26], cot);
  add(new THREE.TorusGeometry(0.043, 0.005, 4, 8), "#2b2b2f", [0.2, 0.09, 0.26], cot, [Math.PI / 2, 0, 0]);

  // path of stepping stones
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = THREE.MathUtils.lerp(0.2, 0.05, t) + Math.sin(t * 3) * 0.04;
    const z = THREE.MathUtils.lerp(0.35, 0.82, t);
    add(new THREE.CylinderGeometry(0.05, 0.055, 0.02, 6), "#b9b2a4", [x, TOP + 0.05, z], g, [0, R(), 0]);
  }

  // ---------- jetty ----------
  const jet = new THREE.Group();
  jet.position.set(0.05, 0, 0);
  g.add(jet);
  const deckY = 0.36;
  for (let i = 0; i < 9; i++) {
    const z = 0.9 + i * 0.065;
    add(new THREE.BoxGeometry(0.34, 0.02, 0.055), i % 2 ? "#a97a4c" : "#946a40", [0, deckY, z], jet);
  }
  for (const x of [-0.15, 0.15]) {
    add(new THREE.BoxGeometry(0.03, 0.02, 0.6), "#6b4a2b", [x, deckY - 0.02, 1.17], jet);
  }
  for (const [x, z] of [[-0.17, 0.95], [0.17, 0.95], [-0.17, 1.2], [0.17, 1.2], [-0.17, 1.46], [0.17, 1.46]]) {
    if (z > 1.45) continue;
    add(new THREE.CylinderGeometry(0.02, 0.022, 0.32, 6), "#5a3b24", [x, 0.28, z], jet);
  }
  add(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 6), "#5a3b24", [0.17, 0.42, 1.2], jet);
  // gull on post
  function gull(pos: [number, number, number], ry: number, flying: boolean) {
    const gr = new THREE.Group();
    gr.position.set(...pos);
    gr.rotation.y = ry;
    g.add(gr);
    add(new THREE.SphereGeometry(0.06, 8, 6), "#f7f7f5", [0, 0, 0], gr, [0, 0, 0], [0.8, 0.75, 1.5]);
    add(new THREE.SphereGeometry(0.035, 7, 6), "#f7f7f5", [0, 0.045, 0.085], gr);
    add(new THREE.ConeGeometry(0.012, 0.045, 4), "#f2a62b", [0, 0.04, 0.14], gr, [Math.PI / 2, 0, 0]);
    add(new THREE.SphereGeometry(0.006, 4, 3), "#111111", [0.02, 0.055, 0.11], gr);
    add(new THREE.SphereGeometry(0.006, 4, 3), "#111111", [-0.02, 0.055, 0.11], gr);
    add(new THREE.BoxGeometry(0.07, 0.015, 0.1), "#f0f0ee", [0, 0.0, -0.1], gr, [-0.2, 0, 0]);
    if (flying) {
      for (const s of [1, -1]) {
        add(new THREE.BoxGeometry(0.2, 0.012, 0.09), "#f7f7f5", [s * 0.12, 0.03, 0], gr, [0, 0, s * 0.35]);
        add(new THREE.BoxGeometry(0.1, 0.012, 0.08), "#5d6670", [s * 0.27, 0.07, 0], gr, [0, 0, s * 0.35]);
      }
    } else {
      for (const s of [1, -1]) {
        add(new THREE.BoxGeometry(0.02, 0.05, 0.12), "#b8bcc2", [s * 0.05, 0.0, -0.01], gr, [0, 0, s * 0.1]);
        add(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 4), "#f2a62b", [s * 0.02, -0.08, 0], gr);
      }
    }
  }
  gull([0.22, 0.52, 1.2], 0.9, false);
  gull([-0.7, 1.35, 0.5], 2.2, true);

  // ---------- rowboat ----------
  const boat = new THREE.Group();
  boat.position.set(0.42, WATER + 0.02, 1.15);
  boat.rotation.y = 0.12;
  g.add(boat);
  add(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), "#c8402f",
    [0, 0.1, 0], boat, [0, 0, 0], [0.15, 0.1, 0.32], { double: true });
  add(new THREE.TorusGeometry(1, 0.06, 4, 12), "#f6f1e7", [0, 0.1, 0], boat, [Math.PI / 2, 0, 0], [0.15, 0.32, 1]);
  for (const z of [-0.1, 0.1]) {
    add(new THREE.BoxGeometry(0.28, 0.015, 0.05), "#a97a4c", [0, 0.09, z], boat);
  }
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 4), "#a97a4c", [0.05, 0.14, 0.02], boat, [0, 0, 1.2]);
  // rope to post
  const rope = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.22, 0.41, 1.2), new THREE.Vector3(0.3, 0.33, 1.24), new THREE.Vector3(0.4, 0.28, 1.45),
  ]);
  add(new THREE.TubeGeometry(rope, 8, 0.006, 4), "#d9c08a", [0, 0, 0]);

  // ---------- grass & flowers ----------
  const grassCols = ["#4f9a3a", "#6bb84a", "#8ccf5c"];
  const flowerCols = ["#ffd23f", "#ff7aa8", "#ffffff", "#b78cf2", "#ff8a3d"];
  let placed = 0, tries = 0;
  while (placed < 26 && tries++ < 300) {
    const a = R() * Math.PI * 2, d = 0.25 + R() * 0.6;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.hypot(x - LX, z - LZ) < 0.45) continue;
    if (Math.hypot(x - 0.5, z - 0.05) < 0.45) continue;
    if (x > -0.05 && x < 0.3 && z > 0.5) continue;
    placed++;
    const base = TOP + 0.05;
    if (placed % 3 === 0) {
      // flower
      const h = 0.07 + R() * 0.05;
      add(new THREE.CylinderGeometry(0.004, 0.004, h, 4), "#3f8a35", [x, base + h / 2, z]);
      const c = flowerCols[placed % flowerCols.length];
      for (let k = 0; k < 5; k++) {
        const pa = (k / 5) * Math.PI * 2;
        add(new THREE.SphereGeometry(0.016, 5, 4), c, [x + Math.cos(pa) * 0.02, base + h, z + Math.sin(pa) * 0.02]);
      }
      add(new THREE.SphereGeometry(0.012, 5, 4), "#f2a62b", [x, base + h + 0.005, z]);
    } else {
      for (let k = 0; k < 5; k++) {
        const ka = (k / 5) * Math.PI * 2;
        add(new THREE.ConeGeometry(0.01, 0.07 + R() * 0.04, 3), grassCols[k % 3],
          [x + Math.cos(ka) * 0.015, base + 0.035, z + Math.sin(ka) * 0.015], g,
          [Math.sin(ka) * 0.35, 0, -Math.cos(ka) * 0.35]);
      }
    }
  }
  // small rocks on grass
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2, d = 0.6 + R() * 0.25;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.hypot(x - 0.5, z - 0.05) < 0.4 || (x > -0.05 && x < 0.3 && z > 0.5)) continue;
    add(new THREE.DodecahedronGeometry(0.05 + R() * 0.04, 0), rockCols[i % 4], [x, TOP + 0.06, z], g, [R(), R(), R()], [1, 0.7, 1]);
  }

  return b.root;
}
```