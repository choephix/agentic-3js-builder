```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description: "A perched blue-green darner dragonfly with four veined wings, banded abdomen, compound eyes, six legs and a jointed jaw.",
};

export default function build() {
  const b = createBuilder({ name: "dragonfly" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  const thorax = b.joint("thorax", { at: [0, 0.028, 0] });
  const head = b.joint("head", { at: [0, 0.029, 0.011], parent: thorax });
  const jaw = b.joint("jaw", { at: [0, 0.0268, 0.0185], parent: head });

  const abd: any[] = [];
  const N = 10;
  const z0 = -0.008, step = 0.0052;
  for (let i = 0; i <= N; i++) {
    abd.push(b.joint(`tail${i + 1}`, { at: [0, 0.028, z0 - step * i], parent: i ? abd[i - 1] : thorax }));
  }

  const wings: Record<string, any> = {};
  const wingDefs = [
    ["FL", 1, 0.004], ["FR", -1, 0.004], ["HL", 1, -0.0025], ["HR", -1, -0.0025],
  ] as const;
  for (const [n, s, z] of wingDefs) {
    wings[n] = b.joint(`wing${n}`, { at: [s * 0.004, 0.0345, z], parent: thorax });
  }

  // ---------- helpers ----------
  const seg = (a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, color: string, bone: any, rs = 6) => {
    const dir = c.clone().sub(a);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, rs, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
    const m = new THREE.Matrix4().compose(a.clone().add(c).multiplyScalar(0.5), q, V(1, 1, 1));
    g.applyMatrix4(m);
    b.part(g, color, { bone });
  };
  const ball = (p: THREE.Vector3, sx: number, sy: number, sz: number, color: string, bone: any, w = 8, h = 6) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(sx, sy, sz);
    g.translate(p.x, p.y, p.z);
    b.part(g, color, { bone });
  };
  const box = (p: THREE.Vector3, sx: number, sy: number, sz: number, color: string, bone: any) => {
    const g = new THREE.BoxGeometry(sx, sy, sz);
    g.translate(p.x, p.y, p.z);
    b.part(g, color, { bone });
  };

  // ---------- thorax ----------
  ball(V(0, 0.0285, 0.0), 0.0072, 0.0075, 0.0105, "#4f8f3a", thorax);
  ball(V(0, 0.0275, 0.0), 0.0075, 0.0068, 0.0085, "#3d7a33", thorax);
  // dark humeral stripes
  for (const s of [1, -1]) {
    box(V(s * 0.0068, 0.029, 0.0025), 0.0007, 0.0085, 0.0012, "#1d2a1a", thorax);
    box(V(s * 0.0070, 0.029, -0.0025), 0.0007, 0.0085, 0.0012, "#1d2a1a", thorax);
  }
  box(V(0, 0.0358, 0.0), 0.0016, 0.0016, 0.012, "#1d2a1a", thorax); // dorsal ridge

  // ---------- head ----------
  ball(V(0, 0.0292, 0.0135), 0.0048, 0.0048, 0.0042, "#6fae45", head);
  for (const s of [1, -1]) {
    ball(V(s * 0.0043, 0.0312, 0.0138), 0.0042, 0.0045, 0.0045, "#2c6fd1", head, 8, 6);
    ball(V(s * 0.0047, 0.0318, 0.0152), 0.0026, 0.0028, 0.0022, "#163f86", head, 6, 5);
    ball(V(s * 0.0022, 0.0267, 0.0178), 0.0012, 0.0012, 0.0012, "#171717", head, 5, 4); // mandible base
  }
  ball(V(0, 0.0332, 0.0172), 0.0022, 0.0016, 0.0016, "#e8e04a", head, 6, 4); // ocelli bump
  box(V(0, 0.0279, 0.0187), 0.0058, 0.0016, 0.0016, "#d9c94a", head); // upper lip/clypeus
  box(V(0, 0.0, 0.0), 0.00001, 0.00001, 0.00001, "#6fae45", head);
  box(V(0, 0.0258, 0.0192), 0.005, 0.0013, 0.0020, "#e8dc8a", jaw); // lower lip
  for (const s of [1, -1]) box(V(s * 0.0022, 0.0262, 0.0198), 0.0011, 0.0011, 0.0016, "#2a2a2a", jaw);
  // antennae
  for (const s of [1, -1]) {
    seg(V(s * 0.0018, 0.0332, 0.0165), V(s * 0.0024, 0.0372, 0.0190), 0.00022, 0.00014, "#222222", head, 4);
  }

  // ---------- abdomen ----------
  const radii = [0.0044, 0.0038, 0.0030, 0.0027, 0.0026, 0.0026, 0.0026, 0.0025, 0.0023, 0.0020, 0.0018];
  for (let i = 0; i < N; i++) {
    const a = V(0, 0.028, z0 - step * i);
    const c = V(0, 0.028, z0 - step * (i + 1));
    const col = i < 2 ? "#3d7a33" : i % 2 ? "#1d2a3a" : "#2c7fd1";
    seg(a, c, radii[i], radii[i + 1], col, abd[i], 7);
    // pale joint ring
    if (i > 1) {
      const ring = new THREE.CylinderGeometry(radii[i] * 1.06, radii[i] * 1.06, 0.0006, 7);
      ring.rotateX(Math.PI / 2);
      ring.translate(0, 0.028, a.z - 0.0001);
      b.part(ring, "#e6efe0", { bone: abd[i] });
    }
    // dorsal stripe
    box(V(0, 0.028 + radii[i] * 0.9, (a.z + c.z) / 2), 0.0008, 0.0006, step * 0.8, "#101820", abd[i]);
  }
  // cerci (claspers)
  for (const s of [1, -1]) {
    const e = V(0, 0.028, z0 - step * N);
    seg(e, V(s * 0.0014, 0.0285, e.z - 0.0042), 0.0008, 0.0003, "#1a1a1a", abd[N], 4);
  }

  // ---------- legs ----------
  const legZ = [0.0065, 0.001, -0.0035];
  const spread = [0.011, 0.015, 0.014];
  const legJoints: any[] = [];
  legZ.forEach((z, i) => {
    for (const [side, s] of [["L", 1], ["R", -1]] as const) {
      const hipP = V(s * 0.0035, 0.0235, z);
      const kneeP = V(s * (0.0075 + i * 0.001), 0.0225 + (i === 0 ? 0.0 : 0.002), z + (i === 0 ? 0.004 : i === 2 ? -0.004 : 0));
      const footP = V(s * spread[i], 0.0, z + (i === 0 ? 0.0075 : i === 2 ? -0.009 : 0.0));
      const hip = b.joint(`hip${side}${i + 1}`, { at: hipP.toArray() as any, parent: thorax });
      const knee = b.joint(`knee${side}${i + 1}`, { at: kneeP.toArray() as any, parent: hip });
      const foot = b.joint(`foot${side}${i + 1}`, { at: footP.toArray() as any, parent: knee });
      legJoints.push(hip, knee, foot);
      seg(hipP, kneeP, 0.0009, 0.0007, "#2a2f22", hip, 5);
      seg(kneeP, footP, 0.0007, 0.0004, "#1f221a", knee, 5);
      ball(kneeP, 0.0010, 0.0010, 0.0010, "#3d7a33", knee, 5, 4);
      box(V(footP.x, 0.0003, footP.z + 0.0008), 0.0008, 0.0006, 0.0025, "#111111", foot); // tarsus
    }
  });

  // ---------- wings ----------
  const makeWing = (s: number, zRoot: number, y: number, fore: boolean, bone: any) => {
    const span = fore ? 0.040 : 0.038;
    const ch = fore ? 0.0085 : 0.0115;
    // outline in (x along span, v = -z)
    const pts: [number, number][] = fore
      ? [[0, 0.002], [0.008, 0.0035], [0.025, 0.0042], [span, 0.0030], [span + 0.002, 0.0005], [0.032, -0.0030], [0.018, -ch + 0.003], [0.006, -ch + 0.004], [0.0, -0.003]]
      : [[0, 0.002], [0.008, 0.0030], [0.026, 0.0035], [span, 0.0020], [span + 0.002, -0.0010], [0.033, -0.0060], [0.020, -ch], [0.008, -ch + 0.0015], [0.0, -0.005]];
    const sp = pts.map(([x, v]) => new THREE.Vector2(s * x, v));
    if (s < 0) sp.reverse();
    const shape = new THREE.Shape(sp);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.0003, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); // v -> -z... plane now XZ
    // after rotate: z' = -y_old ; we defined v as -z so flip to make front +z
    g.scale(1, 1, -1);
    // scale with negative flips winding; fix by reversing triangles
    const idx = g.index;
    if (idx) {
      const a = idx.array as any;
      for (let i = 0; i < a.length; i += 3) { const t = a[i]; a[i] = a[i + 2]; a[i + 2] = t; }
      idx.needsUpdate = true;
    }
    g.computeVertexNormals();
    g.translate(s * 0.004, y, zRoot);
    b.part(g, fore ? "#d6ecf1" : "#c9e3ea", { bone });
    // veins: leading edge and longitudinals
    const xs = (x: number) => s * 0.004 + s * x;
    seg(V(xs(0.0), y + 0.0002, zRoot + 0.0020), V(xs(span), y + 0.0002, zRoot + 0.0028), 0.0003, 0.00025, "#2b3a2a", bone, 4);
    for (let k = 1; k <= 3; k++) {
      const zz = zRoot - 0.002 * k - (fore ? 0 : 0.0005 * k);
      seg(V(xs(0.002), y + 0.0002, zz), V(xs(span * (0.95 - k * 0.1)), y + 0.0002, zz + 0.0005 - 0.0005 * k), 0.00016, 0.00012, "#4a5a48", bone, 3);
    }
    for (let k = 1; k <= 4; k++) {
      const x = 0.006 + k * 0.0065;
      seg(V(xs(x), y + 0.0002, zRoot + 0.0025), V(xs(x + 0.001), y + 0.0002, zRoot - ch * 0.75), 0.0001, 0.0001, "#5a6a58", bone, 3);
    }
    // pterostigma
    box(V(xs(span - 0.006), y + 0.0002, zRoot + 0.0030), 0.0032, 0.0004, 0.0012, "#2a1e14", bone);
  };
  makeWing(1, 0.004, 0.0345, true, wings.FL);
  makeWing(-1, 0.004, 0.0345, true, wings.FR);
  makeWing(1, -0.0025, 0.0338, false, wings.HL);
  makeWing(-1, -0.0025, 0.0338, false, wings.HR);

  return b.root;
}
```