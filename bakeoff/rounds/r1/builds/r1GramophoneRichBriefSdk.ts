import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Antique Gramophone",
  description:
    "Walnut cabinet with pale floral inlay, claw feet, a patinated brass morning-glory horn, record, silver tonearm and side crank.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "gramophone" });
  b.joint("base", { at: [0, 0, 0] });
  const root = b.root;
  const R = rng(7);

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (c: number, rough = 0.6, metal = 0.05) => {
    const k = `${c}-${rough}-${metal}`;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal });
    return mats[k];
  };
  const walnut = mat(0x5a3520, 0.55);
  const walnutDark = mat(0x3d2214, 0.5);
  const walnutLight = mat(0x6e4429, 0.5);
  const cream = mat(0xe9dcb4, 0.6);
  const leafC = mat(0xb9c79a, 0.6);
  const brass = mat(0xb8903c, 0.35, 0.75);
  const silver = mat(0xcfd3d6, 0.25, 0.85);
  const black = mat(0x111112, 0.35);
  const groove = mat(0x232326, 0.3);
  const red = mat(0xb01c22, 0.5);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(p[0], p[1], p[2]);
    parent.add(me);
    return me;
  };
  const box = (w: number, h: number, d: number, p: number[], m: THREE.Material, parent: THREE.Object3D = root) =>
    add(new THREE.BoxGeometry(w, h, d), m, p, parent);

  // ---- Cabinet ----
  box(0.5, 0.04, 0.5, [0, 0.08, 0], walnutDark); // plinth
  box(0.46, 0.36, 0.46, [0, 0.28, 0], walnut); // body
  box(0.52, 0.03, 0.52, [0, 0.475, 0], walnutLight); // top slab
  box(0.49, 0.015, 0.49, [0, 0.4475 - 0.0, 0], walnutDark).position.y = 0.455; // molding
  box(0.5, 0.012, 0.5, [0, 0.105, 0], walnutLight); // base molding

  // corner columns
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const g = new THREE.Group();
      g.position.set(sx * 0.23, 0.28, sz * 0.23);
      root.add(g);
      add(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 8), walnutDark, [0, 0, 0], g);
      for (const y of [-0.16, -0.08, 0, 0.08, 0.16])
        add(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8), walnutLight, [0, y, 0], g);
    }

  // ---- Inlay ----
  const flower = (parent: THREE.Object3D, x: number, y: number, s: number) => {
    const g = new THREE.Group();
    g.position.set(x, y, 0);
    parent.add(g);
    const pg = new THREE.SphereGeometry(1, 6, 4);
    for (let i = 0; i < 5; i++) {
      const arm = new THREE.Group();
      arm.rotation.z = (i * Math.PI * 2) / 5;
      g.add(arm);
      const p = add(pg, cream, [0, 0.04 * s, 0], arm);
      p.scale.set(0.022 * s, 0.04 * s, 0.003);
    }
    const c = add(new THREE.CylinderGeometry(0.01 * s, 0.01 * s, 0.006, 8), brass, [0, 0, 0.002], g);
    c.rotation.x = Math.PI / 2;
    for (const sd of [-1, 1]) {
      const l = add(pg, leafC, [sd * 0.06 * s, -0.05 * s, 0], g);
      l.scale.set(0.02 * s, 0.04 * s, 0.003);
      l.rotation.z = sd * 0.9;
    }
  };
  const panel = (rotY: number, kind: number) => {
    const g = new THREE.Group();
    g.rotation.y = rotY;
    root.add(g);
    const z = 0.231;
    const pw = 0.34, ph = 0.26, cy = 0.28;
    box(pw, ph, 0.004, [0, cy, z], walnutDark, g);
    // border
    box(pw + 0.02, 0.008, 0.005, [0, cy + ph / 2 + 0.006, z], cream, g);
    box(pw + 0.02, 0.008, 0.005, [0, cy - ph / 2 - 0.006, z], cream, g);
    box(0.008, ph + 0.02, 0.005, [pw / 2 + 0.006, cy, z], cream, g);
    box(0.008, ph + 0.02, 0.005, [-pw / 2 - 0.006, cy, z], cream, g);
    const fl = new THREE.Group();
    fl.position.z = z + 0.003;
    g.add(fl);
    if (kind === 0) {
      flower(fl, 0, cy, 2.3);
      for (const sx of [-1, 1])
        for (const sy of [-1, 1]) {
          flower(fl, sx * 0.13, cy + sy * 0.095, 0.8);
          const st = box(0.17, 0.004, 0.003, [sx * 0.065, cy + sy * 0.05, 0], cream, fl);
          st.rotation.z = sx * sy * 0.55;
        }
      // brass pull
      add(new THREE.SphereGeometry(0.014, 8, 6), brass, [0, cy - 0.115, 0.01], fl);
    } else {
      for (const sx of [-1, 1]) {
        flower(fl, sx * 0.1, cy + 0.02, 1.1);
        flower(fl, sx * 0.1, cy - 0.08, 0.6);
      }
      if (kind === 2) flower(fl, 0, cy, 1.4);
    }
  };
  panel(0, 0);
  panel(Math.PI / 2, 1);
  panel(-Math.PI / 2, 2);
  panel(Math.PI, 2);

  // ---- Claw feet ----
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const g = new THREE.Group();
      g.position.set(sx * 0.2, 0, sz * 0.2);
      root.add(g);
      add(new THREE.SphereGeometry(0.03, 8, 6), brass, [0, 0.04, 0], g);
      add(new THREE.CylinderGeometry(0.022, 0.03, 0.02, 8), walnutDark, [0, 0.07, 0], g);
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI * 2) / 4 + 0.78;
        const cg = new THREE.Group();
        cg.rotation.y = -a;
        g.add(cg);
        const claw = add(new THREE.ConeGeometry(0.009, 0.05, 5), brass, [0.03, 0.015, 0], cg);
        claw.rotation.z = -2.2;
        add(new THREE.SphereGeometry(0.009, 5, 4), brass, [0.016, 0.037, 0], cg);
      }
    }

  // ---- Turntable ----
  const topY = 0.49;
  add(new THREE.CylinderGeometry(0.175, 0.175, 0.012, 20), silver, [0, topY + 0.006, 0.03]);
  add(new THREE.CylinderGeometry(0.155, 0.155, 0.006, 24), black, [0, topY + 0.015, 0.03]);
  for (const r of [0.07, 0.09, 0.11, 0.13, 0.145]) {
    const rg = add(new THREE.RingGeometry(r, r + 0.004, 24), groove, [0, topY + 0.0185, 0.03]);
    rg.rotation.x = -Math.PI / 2;
  }
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.002, 20), red, [0, topY + 0.019, 0.03]);
  add(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), brass, [0, topY + 0.03, 0.03]);
  const lr = add(new THREE.RingGeometry(0.03, 0.034, 16), cream, [0, topY + 0.0205, 0.03]);
  lr.rotation.x = -Math.PI / 2;

  // ---- Tonearm ----
  add(new THREE.CylinderGeometry(0.025, 0.03, 0.03, 10), brass, [0.2, topY + 0.015, -0.11]);
  add(new THREE.SphereGeometry(0.02, 8, 6), silver, [0.2, topY + 0.04, -0.11]);
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.2, topY + 0.045, -0.11),
    new THREE.Vector3(0.17, topY + 0.055, -0.04),
    new THREE.Vector3(0.1, topY + 0.05, 0.03),
    new THREE.Vector3(0.06, topY + 0.04, 0.07),
  ]);
  add(new THREE.TubeGeometry(armCurve, 12, 0.006, 6), silver, [0, 0, 0]);
  const head = add(new THREE.CylinderGeometry(0.014, 0.011, 0.03, 8), silver, [0.055, topY + 0.03, 0.08]);
  head.rotation.x = 0.3;
  add(new THREE.ConeGeometry(0.003, 0.012, 5), brass, [0.055, topY + 0.01, 0.087]).rotation.x = Math.PI;
  add(new THREE.SphereGeometry(0.012, 6, 5), silver, [0.215, topY + 0.04, -0.14]);

  // ---- Crank (left side, +X) ----
  const cx = 0.26;
  const shaft = add(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8), brass, [cx - 0.005, 0.28, 0]);
  shaft.rotation.z = Math.PI / 2;
  const rosette = add(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 12), brass, [0.236, 0.28, 0]);
  rosette.rotation.z = Math.PI / 2;
  add(new THREE.SphereGeometry(0.014, 8, 6), brass, [cx + 0.027, 0.28, 0]);
  box(0.012, 0.1, 0.012, [cx + 0.027, 0.23, 0], brass);
  const handle = add(new THREE.CylinderGeometry(0.009, 0.009, 0.06, 8), brass, [cx + 0.055, 0.18, 0]);
  handle.rotation.z = Math.PI / 2;
  add(new THREE.SphereGeometry(0.02, 8, 6), walnutDark, [cx + 0.09, 0.18, 0]).scale.set(1.3, 1, 1);

  // ---- Elbow neck ----
  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, topY, -0.2),
    new THREE.Vector3(0, 0.62, -0.2),
    new THREE.Vector3(0, 0.74, -0.19),
    new THREE.Vector3(0, 0.79, -0.15),
  ]);
  const neckGeo = new THREE.TubeGeometry(neckCurve, 14, 0.032, 8);
  const colorize = (geo: THREE.BufferGeometry, fn: (x: number, y: number, z: number) => THREE.Color) => {
    const pos = geo.attributes.position;
    const cols: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const c = fn(pos.getX(i), pos.getY(i), pos.getZ(i));
      cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(cols), 3));
  };
  const brassC = new THREE.Color(0xc29a45);
  const patC = new THREE.Color(0x5f9a7c);
  const patinaMat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.42, metalness: 0.65, side: THREE.DoubleSide, flatShading: true,
  });
  colorize(neckGeo, (x, y) => brassC.clone().lerp(patC, Math.max(0, Math.min(1, (0.8 - y) * 2.2)) * 0.8));
  add(neckGeo, patinaMat, [0, 0, 0]);
  add(new THREE.CylinderGeometry(0.06, 0.07, 0.025, 12), brass, [0, topY + 0.0125, -0.2]);
  add(new THREE.TorusGeometry(0.04, 0.01, 6, 12), brass, [0, topY + 0.03, -0.2]).rotation.x = Math.PI / 2;

  // ---- Horn ----
  const dir = new THREE.Vector3(0, 0.4, 0.92).normalize();
  const hornG = new THREE.Group();
  hornG.position.set(0, 0.79, -0.15);
  hornG.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  root.add(hornG);
  const L = 0.58;
  const prof: THREE.Vector2[] = [];
  const N = 22;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let r = 0.03 + 0.29 * Math.pow(t, 3.2) + 0.03 * t;
    if (t > 0.96) r += (t - 0.96) * 0.35; // lip flare
    prof.push(new THREE.Vector2(r, t * L));
  }
  const hornGeo = new THREE.LatheGeometry(prof, 10);
  colorize(hornGeo, (x, y, z) => {
    const t = y / L;
    const ang = Math.atan2(z, x);
    const streak = 0.5 + 0.5 * Math.sin(ang * 5 + t * 6) * Math.cos(t * 9);
    const k = Math.max(0, Math.min(1, (1 - t) * 0.9 + streak * 0.35 - 0.25 + (R() - 0.5) * 0.15));
    return brassC.clone().lerp(patC, k * 0.75);
  });
  add(hornGeo, patinaMat, [0, 0, 0], hornG);
  const rim = add(new THREE.TorusGeometry(0.335, 0.012, 5, 10), brass, [0, L, 0], hornG);
  rim.rotation.x = Math.PI / 2;
  const collar = add(new THREE.TorusGeometry(0.036, 0.011, 6, 10), brass, [0, 0.01, 0], hornG);
  collar.rotation.x = Math.PI / 2;
  const collar2 = add(new THREE.TorusGeometry(0.05, 0.008, 6, 10), brass, [0, 0.1, 0], hornG);
  collar2.rotation.x = Math.PI / 2;
  collar2.scale.set(1, 1, 1);
  // swivel ball at throat
  add(new THREE.SphereGeometry(0.04, 8, 6), brass, [0, 0.79, -0.15]);

  return b.root;
}
