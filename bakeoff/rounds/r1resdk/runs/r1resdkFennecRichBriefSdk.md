```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Fennec Fox Kit on a Dune",
  description:
    "Alert fennec kit with huge peach-lined ears, gold-cream fur, black-tipped fluffy tail, oversized paws and a woven leather collar with a brass bell, standing on a dusk-lit sand dune.",
};

export default function build() {
  const b = createBuilder({ name: "fennec" });
  const root: THREE.Object3D = b.root;
  const Y = 0.1; // dune top

  const C = {
    cream: "#f5e6c8", gold: "#dba75c", deepGold: "#c98d45", peach: "#f2b7a0",
    dark: "#1a1210", white: "#ffffff", brass: "#d4a52a", leather: "#6b3f22",
    leather2: "#8a5530", sand: "#e3b374", sand2: "#c98f5e", sand3: "#a8704f",
  };
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (c: string) =>
    (mats[c] ||= new THREE.MeshStandardMaterial({
      color: c, roughness: c === C.brass ? 0.35 : 0.8, metalness: c === C.brass ? 0.7 : 0.03, flatShading: true,
    }));

  // ---- skeleton
  const jp: Record<string, THREE.Vector3> = {};
  const J: Record<string, any> = {};
  const joint = (name: string, at: [number, number, number], parent?: string) => {
    jp[name] = new THREE.Vector3(...at);
    J[name] = parent ? b.joint(name, { at, parent: J[parent] }) : b.joint(name, { at });
    return J[name];
  };
  joint("hips", [0, Y + 0.17, -0.08]);
  joint("spine", [0, Y + 0.18, 0.0], "hips");
  joint("chest", [0, Y + 0.19, 0.07], "spine");
  joint("neck", [0, Y + 0.23, 0.1], "chest");
  joint("head", [0, Y + 0.29, 0.13], "neck");
  joint("jaw", [0, Y + 0.275, 0.17], "head");
  joint("earL", [0.05, Y + 0.355, 0.115], "head");
  joint("earR", [-0.05, Y + 0.355, 0.115], "head");
  joint("tail1", [0, Y + 0.18, -0.2], "hips");
  joint("tail2", [0, Y + 0.14, -0.33], "tail1");
  joint("tail3", [0, Y + 0.1, -0.45], "tail2");
  for (const [s, x] of [["L", 1], ["R", -1]] as const) {
    joint("shoulder" + s, [0.045 * x, Y + 0.2, 0.09], "chest");
    joint("elbow" + s, [0.045 * x, Y + 0.12, 0.09], "shoulder" + s);
    joint("wrist" + s, [0.045 * x, Y + 0.04, 0.09], "elbow" + s);
    joint("hip" + s, [0.06 * x, Y + 0.17, -0.13], "hips");
    joint("knee" + s, [0.06 * x, Y + 0.1, -0.1], "hip" + s);
    joint("ankle" + s, [0.055 * x, Y + 0.04, -0.14], "knee" + s);
  }

  const put = (o: THREE.Object3D, world: [number, number, number], jn: string) => {
    const p = new THREE.Vector3(...world);
    const j = J[jn];
    if (j && (j as any).isObject3D) {
      o.position.copy(p).sub(jp[jn]);
      (j as THREE.Object3D).add(o);
    } else {
      o.position.copy(p);
      root.add(o);
    }
    return o;
  };
  const sph = (r: number, s: [number, number, number], c: string, at: [number, number, number], jn: string, seg = 8) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(5, seg - 2)), mat(c));
    m.scale.set(...s);
    return put(m, at, jn) as THREE.Mesh;
  };
  const box = (s: [number, number, number], c: string, at: [number, number, number], jn: string, rot?: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...s), mat(c));
    if (rot) m.rotation.set(...rot);
    return put(m, at, jn);
  };
  const cyl = (r1: number, r2: number, h: number, c: string, at: [number, number, number], jn: string, seg = 6) =>
    put(new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, h, seg), mat(c)), at, jn);

  // ---- dune
  const dune = new THREE.Mesh(
    new THREE.LatheGeometry(
      [[0.0, 0], [0.62, 0], [0.55, 0.02], [0.44, 0.045], [0.3, 0.075], [0.15, 0.095], [0.0, 0.1]].map(([x, y]) => new THREE.Vector2(x, y)),
      14,
    ),
    mat(C.sand),
  );
  root.add(dune);
  for (let i = 0; i < 4; i++) {
    const r = 0.22 + i * 0.1;
    const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 4, 24, Math.PI * 0.9), mat(i % 2 ? C.sand3 : C.sand2));
    t.rotation.x = -Math.PI / 2;
    t.rotation.z = Math.PI * 0.55 + i * 0.3;
    t.scale.set(1, 1, 0.8);
    t.position.y = 0.1 - 0.06 * (i / 3) - 0.013 - i * 0.012;
    root.add(t);
  }
  const rg = (n: number) => { let s = n; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
  const rnd = rg(7);
  for (let i = 0; i < 7; i++) {
    const a = rnd() * Math.PI * 2, r = 0.3 + rnd() * 0.2;
    const pb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.012 + rnd() * 0.01), mat(C.sand3));
    pb.position.set(Math.cos(a) * r, 0.05 - (r - 0.3) * 0.2, Math.sin(a) * r);
    root.add(pb);
  }

  // ---- body
  sph(0.1, [0.82, 0.82, 1.55], C.cream, [0, Y + 0.17, -0.02], "spine", 10);
  sph(0.09, [0.85, 0.55, 1.5], C.gold, [0, Y + 0.205, -0.03], "spine", 10);
  sph(0.07, [0.9, 0.9, 1], C.cream, [0, Y + 0.18, 0.08], "chest", 8);
  sph(0.07, [0.8, 0.5, 1], C.deepGold, [0, Y + 0.225, 0.06], "chest", 8);
  sph(0.08, [0.9, 0.9, 1.0], C.gold, [0, Y + 0.18, -0.12], "hips", 8);

  // neck
  cyl(0.045, 0.05, 0.1, C.cream, [0, Y + 0.24, 0.11], "neck");
  (J.neck.children?.[J.neck.children.length - 1] as THREE.Object3D | undefined)?.rotateX?.(0.35);

  // ---- legs
  for (const [s, x] of [["L", 1], ["R", -1]] as const) {
    // front
    cyl(0.017, 0.014, 0.1, C.cream, [0.045 * x, Y + 0.12, 0.09], "elbow" + s);
    sph(0.025, [1, 1, 1], C.cream, [0.045 * x, Y + 0.2, 0.08], "shoulder" + s, 7);
    sph(0.03, [0.85, 0.55, 1.5], C.cream, [0.047 * x, Y + 0.025, 0.105], "wrist" + s, 7);
    for (const t of [-1, 0, 1]) sph(0.011, [1, 0.8, 1.2], C.cream, [(0.047 + t * 0.014) * x, Y + 0.016, 0.14], "wrist" + s, 5);
    // hind
    sph(0.05, [0.8, 1.05, 1.2], C.gold, [0.065 * x, Y + 0.16, -0.13], "hip" + s, 8);
    cyl(0.018, 0.014, 0.1, C.cream, [0.06 * x, Y + 0.08, -0.13], "knee" + s);
    sph(0.03, [0.85, 0.55, 1.6], C.cream, [0.058 * x, Y + 0.025, -0.115], "ankle" + s, 7);
    for (const t of [-1, 0, 1]) sph(0.011, [1, 0.8, 1.2], C.cream, [(0.058 + t * 0.014) * x, Y + 0.016, -0.075], "ankle" + s, 5);
  }

  // ---- head
  sph(0.075, [1.15, 0.92, 1.0], C.cream, [0, Y + 0.3, 0.14], "head", 10);
  sph(0.06, [1.0, 0.4, 0.9], C.gold, [0, Y + 0.345, 0.12], "head", 8); // forehead
  sph(0.04, [0.9, 0.78, 1.5], C.cream, [0, Y + 0.285, 0.195], "head", 8); // muzzle
  sph(0.012, [1.2, 0.9, 1], C.dark, [0, Y + 0.297, 0.248], "head", 6); // nose
  sph(0.03, [1.1, 0.6, 1.6], C.cream, [0, Y + 0.268, 0.19], "jaw", 7); // lower jaw
  for (const x of [1, -1]) {
    sph(0.02, [1, 1.15, 0.6], C.dark, [0.037 * x, Y + 0.31, 0.205], "head", 8); // eye
    sph(0.0055, [1, 1, 1], C.white, [0.037 * x + 0.004, Y + 0.318, 0.215], "head", 5); // sparkle
    sph(0.016, [1.2, 0.5, 1], C.dark, [0.034 * x, Y + 0.335, 0.2], "head", 5); // brow smudge
    sph(0.014, [1, 0.8, 1.2], C.gold, [0.075 * x, Y + 0.28, 0.17], "head", 5); // cheek tuft
  }

  // ---- ears
  for (const [s, x] of [["L", 1], ["R", -1]] as const) {
    const g = new THREE.Group();
    const h = 0.2;
    const og = new THREE.ConeGeometry(0.05, h, 6);
    og.translate(0, h / 2, 0);
    const outer = new THREE.Mesh(og, mat(C.gold));
    outer.scale.z = 0.3;
    const ig = new THREE.ConeGeometry(0.037, h * 0.84, 6);
    ig.translate(0, h * 0.42, 0);
    const inner = new THREE.Mesh(ig, mat(C.peach));
    inner.scale.z = 0.3;
    inner.position.z = 0.0105;
    const rim = new THREE.Mesh(new THREE.SphereGeometry(0.01, 5, 4), mat(C.cream));
    rim.position.set(0, 0.0, 0.012);
    rim.scale.set(3.5, 1.2, 0.8);
    g.add(outer, inner, rim);
    g.rotation.set(-0.2, 0.15 * x, -0.4 * x);
    put(g, [0.055 * x, Y + 0.355, 0.115], "ear" + s);
  }

  // ---- tail
  const tailPts: [number, number, number, number, string, string][] = [
    [0, Y + 0.18, -0.21, 0.05, C.gold, "tail1"],
    [0, Y + 0.16, -0.29, 0.062, C.gold, "tail1"],
    [0, Y + 0.13, -0.38, 0.066, C.cream, "tail2"],
    [0, Y + 0.105, -0.46, 0.058, C.cream, "tail3"],
  ];
  for (const [x, y, z, r, c, j] of tailPts) sph(r, [1, 1, 1.35], c, [x, y, z], j, 8);
  sph(0.05, [0.95, 0.95, 1.5], C.dark, [0, Y + 0.088, -0.53], "tail3", 8);
  sph(0.03, [1, 1, 1], C.dark, [0, Y + 0.08, -0.59], "tail3", 6);

  // ---- collar
  const cg = new THREE.Group();
  cg.add(new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.01, 5, 14), mat(C.leather)));
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.011, 0.024), mat(i % 2 ? C.leather2 : C.leather));
    w.position.set(Math.cos(a) * 0.0585, Math.sin(a) * 0.0585, 0);
    w.rotation.z = a;
    w.rotateY(i % 2 ? 0.5 : -0.5);
    cg.add(w);
  }
  const ba = -Math.PI / 2 + 0.0;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.0025, 4, 8), mat(C.brass));
  ring.position.set(0, -0.062, 0.005);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.0175, 8, 6), mat(C.brass));
  bell.position.set(Math.cos(ba) * 0.075, Math.sin(ba) * 0.075 - 0.005, 0.01);
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.0025, 0.004), mat(C.dark));
  slit.position.set(bell.position.x, bell.position.y - 0.004, 0.0265);
  cg.add(ring, bell, slit);
  cg.rotation.x = -0.93;
  put(cg, [0, Y + 0.245, 0.11], "neck");

  return root;
}
```