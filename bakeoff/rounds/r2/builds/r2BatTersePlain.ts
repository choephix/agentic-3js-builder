import * as THREE from "three";

export const meta = {
  name: "Bat",
  description: "A stylized low-poly fruit bat in a spread-wing pose, built from primitives, standing on its feet and wing thumbs.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let s = 12345;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

  const mat = (c: number, r = 0.9) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
  const fur = mat(0x4a3526);
  const furDark = mat(0x2e2018);
  const furLight = mat(0x8a6a4a);
  const skin = mat(0x5a3a4a);
  const skinLight = mat(0x7a5066);
  const bone = mat(0x2a1c22);
  const pink = mat(0xc88a96);
  const white = mat(0xf4f0e0, 0.4);
  const black = mat(0x0a0a0a, 0.3);
  const amber = mat(0xd9892b, 0.3);
  const claw = mat(0xd8cdb8);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[], r: number[] = [0, 0, 0], sc: number[] = [1, 1, 1], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(p[0], p[1], p[2]);
    me.rotation.set(r[0], r[1], r[2]);
    me.scale.set(sc[0], sc[1], sc[2]);
    parent.add(me);
    return me;
  };

  // Body: hangs-upright perch pose; total height ~0.4m
  const body = new THREE.Group();
  root.add(body);
  add(new THREE.IcosahedronGeometry(0.1, 1), fur, [0, 0.2, 0], [0.25, 0, 0], [1, 1.35, 0.95], body);
  add(new THREE.IcosahedronGeometry(0.075, 0), furLight, [0, 0.19, 0.05], [0, 0, 0], [1, 1.2, 0.8], body); // chest
  // shoulders ruff
  add(new THREE.IcosahedronGeometry(0.085, 0), furDark, [0, 0.3, -0.01], [0, 0, 0], [1.2, 0.8, 0.9], body);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.37, 0.05);
  body.add(head);
  add(new THREE.IcosahedronGeometry(0.07, 1), fur, [0, 0, 0], [0, 0, 0], [1, 0.95, 1], head);
  add(new THREE.BoxGeometry(0.06, 0.04, 0.06), furLight, [0, -0.025, 0.06], [0.2, 0, 0], [1, 1, 1], head); // snout
  add(new THREE.BoxGeometry(0.025, 0.015, 0.02), black, [0, -0.01, 0.095], [0.2, 0, 0], [1, 1, 1], head); // nose
  // mouth fangs
  for (const x of [-0.015, 0.015]) add(new THREE.ConeGeometry(0.005, 0.02, 4), white, [x, -0.055, 0.08], [Math.PI, 0, 0], [1, 1, 1], head);
  for (const x of [-1, 1]) {
    // eyes
    add(new THREE.SphereGeometry(0.017, 8, 6), amber, [x * 0.035, 0.015, 0.055], [0, 0, 0], [1, 1, 1], head);
    add(new THREE.SphereGeometry(0.009, 6, 5), black, [x * 0.037, 0.015, 0.068], [0, 0, 0], [1, 1, 1], head);
    // ears: big cones
    const ear = add(new THREE.ConeGeometry(0.04, 0.14, 4), furDark, [x * 0.05, 0.1, -0.01], [-0.1, Math.PI / 4, -x * 0.25], [1, 1, 0.4], head);
    add(new THREE.ConeGeometry(0.026, 0.1, 4), pink, [x * 0.05, 0.095, 0.003], [-0.1, Math.PI / 4, -x * 0.25], [1, 1, 0.3], head);
    void ear;
  }

  // Wings
  const wingGroup = (side: number) => {
    const g = new THREE.Group();
    g.position.set(side * 0.1, 0.3, -0.01);
    root.add(g);
    // arm (upper) and forearm as bones
    const shoulder = new THREE.Vector3(0, 0, 0);
    const elbow = new THREE.Vector3(side * 0.25, 0.1, -0.08);
    const wrist = new THREE.Vector3(side * 0.55, 0.12, -0.02);
    const bar = (a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material) => {
      const d = b.clone().sub(a);
      const len = d.length();
      const me = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r, len, 5), m);
      me.position.copy(a).add(b).multiplyScalar(0.5);
      me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      g.add(me);
    };
    bar(shoulder, elbow, 0.014, fur);
    bar(elbow, wrist, 0.011, furDark);
    add(new THREE.IcosahedronGeometry(0.018, 0), bone, [wrist.x, wrist.y, wrist.z], [0, 0, 0], [1, 1, 1], g);
    // thumb claw
    add(new THREE.ConeGeometry(0.01, 0.045, 4), claw, [wrist.x, wrist.y + 0.03, wrist.z + 0.01], [0, 0, side * 0.3], [1, 1, 1], g);
    // fingers
    const tips = [
      new THREE.Vector3(side * 0.95, -0.02, 0.12),
      new THREE.Vector3(side * 0.9, -0.2, 0.0),
      new THREE.Vector3(side * 0.74, -0.34, -0.05),
      new THREE.Vector3(side * 0.5, -0.38, -0.08),
    ];
    for (const t of tips) bar(wrist, t, 0.007, bone);
    // membrane panels as triangles
    const tri = (pts: THREE.Vector3[], m: THREE.Material) => {
      const geo = new THREE.BufferGeometry();
      const v: number[] = [];
      for (const p of pts) v.push(p.x, p.y, p.z);
      geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
      geo.computeVertexNormals();
      const mm = m.clone() as THREE.MeshStandardMaterial;
      mm.side = THREE.DoubleSide;
      const me = new THREE.Mesh(geo, mm);
      g.add(me);
    };
    const body0 = new THREE.Vector3(side * 0.02, -0.1, -0.05);
    const hip = new THREE.Vector3(side * 0.06, -0.28, -0.04);
    const fore = [shoulder, elbow, wrist];
    tri([fore[0], fore[1], tips[0]], skinLight); // propatagium-ish
    tri([elbow, wrist, tips[0]], skinLight);
    tri([wrist, tips[0], tips[1]], skin);
    tri([wrist, tips[1], tips[2]], skin);
    tri([wrist, tips[2], tips[3]], skin);
    tri([wrist, tips[3], hip], skin);
    tri([shoulder, wrist, hip], skin);
    tri([shoulder, hip, body0], skin);
    void rnd;
    return g;
  };
  wingGroup(1);
  wingGroup(-1);

  // Legs & feet
  for (const x of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(x * 0.045, 0.13, -0.02);
    root.add(leg);
    add(new THREE.CylinderGeometry(0.015, 0.02, 0.13, 5), furDark, [0, -0.03, 0], [0, 0, x * 0.05], [1, 1, 1], leg);
    add(new THREE.BoxGeometry(0.035, 0.015, 0.06), furDark, [0, -0.1, 0.02], [0, 0, 0], [1, 1, 1], leg);
    for (const t of [-1, 0, 1]) add(new THREE.ConeGeometry(0.004, 0.025, 4), claw, [t * 0.01, -0.1, 0.06], [Math.PI / 2, 0, 0], [1, 1, 1], leg);
  }
  // tail membrane
  const tg = new THREE.BufferGeometry();
  tg.setAttribute("position", new THREE.Float32BufferAttribute([-0.07, 0.1, -0.05, 0.07, 0.1, -0.05, 0, 0.02, -0.18], 3));
  tg.computeVertexNormals();
  const tm = skin.clone(); tm.side = THREE.DoubleSide;
  root.add(new THREE.Mesh(tg, tm));

  // Wing tips and thumbs touch ground: lower the whole model so feet at y=0
  // feet bottom at about 0.13-0.11=0.02 -> shift
  root.position.y = -0.02;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
