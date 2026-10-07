import * as THREE from "three";

export const meta = {
  name: "Vintage Bicycle",
  description: "A stylized vintage city bicycle with a mint-green frame, leather saddle, wicker basket, fenders, chain guard and bell, built from primitives.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (hex: number, rough = 0.5, metal = 0) => {
    const k = hex + "_" + rough + "_" + metal;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal, flatShading: true });
    return mats[k];
  };
  const frameM = M(0x4fb89a, 0.35, 0.3);
  const chromeM = M(0xd8dde0, 0.25, 0.9);
  const rubberM = M(0x1b1b1d, 0.9);
  const leatherM = M(0x7a4524, 0.6);
  const creamM = M(0xf0e6c8, 0.7);
  const wickerM = M(0xc99a55, 0.9);
  const darkM = M(0x333638, 0.5, 0.4);
  const brassM = M(0xc9a227, 0.3, 0.8);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], r: [number, number, number] = [0, 0, 0], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(...p);
    me.rotation.set(...r);
    parent.add(me);
    return me;
  };
  // tube between two points
  const tube = (a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, seg = 8) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), m);
    me.position.copy(a).addScaledVector(d, 0.5);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    root.add(me);
    return me;
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const R = 0.34; // wheel radius
  const rearZ = -0.55, frontZ = 0.55;

  const wheel = (z: number) => {
    const g = new THREE.Group();
    g.position.set(0, R, z);
    root.add(g);
    add(new THREE.TorusGeometry(R - 0.02, 0.024, 6, 28), rubberM, [0, 0, 0], [0, Math.PI / 2, 0], g);
    add(new THREE.TorusGeometry(R - 0.05, 0.01, 4, 28), chromeM, [0, 0, 0], [0, Math.PI / 2, 0], g);
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 10), chromeM, [0, 0, 0], [0, 0, Math.PI / 2], g);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const len = R - 0.06;
      const s = add(new THREE.CylinderGeometry(0.003, 0.003, len, 3), chromeM, [0, Math.cos(a) * len / 2, Math.sin(a) * len / 2], [a, 0, 0], g);
      s.rotation.x = a;
      s.position.set(i % 2 ? 0.012 : -0.012, -Math.sin(a) * len / 2, Math.cos(a) * len / 2);
      s.rotation.set(a, 0, 0);
      s.rotation.x = Math.PI / 2 - a + Math.PI / 2 * 0;
      s.rotation.x = a;
      // orient: cylinder along Y rotated about X by a -> points (0,cos a,sin a)
      s.position.set(i % 2 ? 0.012 : -0.012, Math.cos(a) * len / 2, Math.sin(a) * len / 2);
      s.rotation.x = a;
      s.rotation.x = -a + 0;
      s.position.y = Math.cos(a) * len / 2;
      s.position.z = Math.sin(a) * len / 2;
      s.rotation.x = a - 0;
      // cylinder Y axis rotated by angle t about X gives (0,cos t,sin t); need t = -a? ensure consistency:
      s.rotation.x = Math.atan2(-Math.cos(a) * 0 + 0, 1) + 0;
      s.rotation.x = -Math.atan2(Math.sin(a), Math.cos(a)) * -1;
    }
    // fix spokes cleanly: direction (0,cos a,sin a) from Y axis => rotation about X by -? use +a with sign
    g.children.forEach((c) => {
      if ((c as THREE.Mesh).geometry instanceof THREE.CylinderGeometry && (c as THREE.Mesh).geometry.parameters.radiusTop === 0.003) {
        const y = c.position.y, zz = c.position.z;
        const ang = Math.atan2(-zz, y); // rotate Y axis to (0,y,zz): rotation about X by t gives (0,cos t,sin t)
        c.rotation.set(Math.atan2(zz, y), 0, 0);
        void ang;
      }
    });
    return g;
  };
  wheel(rearZ);
  wheel(frontZ);

  // frame points
  const hub1 = V(0, R, rearZ), hub2 = V(0, R, frontZ);
  const bb = V(0, 0.3, -0.05);
  const seatTop = V(0, 0.88, -0.2);
  const headBot = V(0, 0.68, 0.4);
  const headTop = V(0, 0.84, 0.43);
  const fr = 0.014;
  tube(bb, seatTop, fr + 0.003, frameM);
  tube(headBot, bb, fr + 0.006, frameM);
  tube(V(0, 0.8, -0.18), V(0, 0.8, 0.43), fr, frameM); // top tube (slightly sloped)
  tube(V(0, 0.8, -0.18), headTop, fr, frameM);
  for (const s of [-0.05, 0.05]) {
    tube(V(s, 0.3, -0.05), V(s, R, rearZ), 0.011, frameM);
    tube(V(s, 0.8, -0.19), V(s, R, rearZ), 0.01, frameM);
    tube(V(s, 0.64, 0.4), V(s, R, frontZ), 0.012, chromeM);
  }
  tube(V(-0.05, 0.3, -0.05), V(0.05, 0.3, -0.05), 0.02, frameM);
  // head tube
  tube(V(0, 0.66, 0.39), V(0, 0.88, 0.44), 0.025, frameM, 8);
  // front fork crown
  add(new THREE.BoxGeometry(0.12, 0.02, 0.04), frameM, [0, 0.66, 0.4]);

  // stem and handlebar
  tube(V(0, 0.88, 0.44), V(0, 0.95, 0.44), 0.012, chromeM);
  const hbY = 0.98;
  tube(V(-0.2, hbY, 0.4), V(0.2, hbY, 0.4), 0.011, chromeM);
  tube(V(0, 0.95, 0.44), V(0, hbY, 0.4), 0.011, chromeM);
  for (const s of [-1, 1]) {
    tube(V(s * 0.2, hbY, 0.4), V(s * 0.27, hbY - 0.03, 0.25), 0.011, chromeM);
    tube(V(s * 0.27, hbY - 0.03, 0.25), V(s * 0.27, hbY - 0.03, 0.14), 0.017, leatherM);
    add(new THREE.SphereGeometry(0.02, 6, 5), leatherM, [s * 0.27, hbY - 0.03, 0.135]);
    tube(V(s * 0.18, hbY + 0.005, 0.38), V(s * 0.18, hbY - 0.04, 0.3), 0.004, darkM, 4);
  }
  // bell
  add(new THREE.SphereGeometry(0.03, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), brassM, [0.1, hbY + 0.012, 0.4]);
  // headlamp
  add(new THREE.CylinderGeometry(0.04, 0.05, 0.06, 10), chromeM, [0, 0.9, 0.52], [Math.PI / 2, 0, 0]);
  add(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 10), M(0xfff4b0, 0.2), [0, 0.9, 0.553], [Math.PI / 2, 0, 0]);

  // saddle
  tube(seatTop, V(0, 0.95, -0.21), 0.011, chromeM);
  const sad = add(new THREE.BoxGeometry(0.15, 0.04, 0.17), leatherM, [0, 0.97, -0.17]);
  sad.scale.set(1, 1, 1);
  add(new THREE.BoxGeometry(0.07, 0.035, 0.1), leatherM, [0, 0.975, -0.04]);
  add(new THREE.BoxGeometry(0.16, 0.012, 0.012), chromeM, [0, 0.935, -0.17]);
  for (const s of [-0.03, 0.03]) tube(V(s, 0.94, -0.26), V(s, 0.95, -0.05), 0.004, chromeM, 4);

  // crank, chainring, pedals
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.008, 16), chromeM, [0.04, 0.3, -0.05], [0, 0, Math.PI / 2]);
  add(new THREE.CylinderGeometry(0.12, 0.12, 0.004, 16), darkM, [0.065, 0.3, -0.05], [0, 0, Math.PI / 2]); // chain guard
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), chromeM, [0, 0.3, -0.05], [0, 0, Math.PI / 2]);
  const ca = -0.5;
  for (const s of [1, -1]) {
    const a = ca + (s === 1 ? 0 : Math.PI);
    const end = V(s * 0.09, 0.3 + Math.sin(a) * 0.17, -0.05 + Math.cos(a) * 0.17);
    tube(V(s * 0.08, 0.3, -0.05), end, 0.012, chromeM, 6);
    add(new THREE.BoxGeometry(0.1, 0.02, 0.07), darkM, [s * 0.15, end.y, end.z]);
  }
  // chain
  tube(V(0.055, 0.4, -0.05), V(0.055, 0.4, rearZ), 0.004, darkM, 4).position.set(0.055, 0.37, -0.3);
  tube(V(0.055, 0.2, -0.05), V(0.055, 0.3, rearZ), 0.004, darkM, 4);
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.01, 10), chromeM, [0.05, R, rearZ], [0, 0, Math.PI / 2]);

  // fenders (half tori)
  const fen = (z: number, a0: number, len: number) => {
    const f = add(new THREE.TorusGeometry(R + 0.03, 0.006, 4, 20, len), frameM, [0, R, z]);
    f.scale.set(1, 1, 1);
    f.rotation.y = 0;
    const g = f.geometry as THREE.TorusGeometry;
    void g;
    f.rotation.set(0, Math.PI / 2, 0);
    f.rotation.z = a0;
    return f;
  };
  const fw = (z: number, a0: number, len: number) => {
    const grp = new THREE.Group();
    grp.position.set(0, R, z);
    root.add(grp);
    const m = add(new THREE.CylinderGeometry(R + 0.04, R + 0.04, 0.075, 20, 1, true, 0, len), frameM, [0, 0, 0], [0, 0, Math.PI / 2], grp);
    m.material = new THREE.MeshStandardMaterial({ color: 0x4fb89a, roughness: 0.35, metalness: 0.3, flatShading: true, side: THREE.DoubleSide });
    m.rotation.set(0, 0, Math.PI / 2);
    m.rotation.order = "ZYX";
    m.rotation.x = a0;
    return grp;
  };
  void fen;
  const fwA = fw(frontZ, 0, Math.PI * 0.9);
  fwA.rotation.set(0, 0, 0);
  fwA.children[0].rotation.set(0, 0, 0);
  fwA.children[0].rotation.z = Math.PI / 2;
  fwA.children[0].rotation.x = 0;
  const fwB = fw(rearZ, 0, Math.PI * 0.9);
  void fwB;

  // rear rack + basket on front
  add(new THREE.BoxGeometry(0.14, 0.015, 0.2), darkM, [0, 0.72, rearZ + 0.05]);
  const bask = add(new THREE.CylinderGeometry(0.16, 0.12, 0.17, 10), wickerM, [0, 1.12, 0.52]);
  bask.scale.set(1.0, 1, 0.8);
  add(new THREE.TorusGeometry(0.15, 0.012, 4, 10), M(0x9a6f33, 0.9), [0, 1.2, 0.52], [Math.PI / 2, 0, 0]).scale.set(1, 0.8, 1);
  tube(V(0, 0.98, 0.44), V(0, 1.06, 0.5), 0.01, darkM, 4);
  // rear reflector
  add(new THREE.BoxGeometry(0.05, 0.03, 0.01), M(0xd22b2b, 0.3), [0, 0.65, rearZ - 0.06]);
  // kickstand
  tube(V(0.04, 0.3, -0.3), V(0.1, 0.0, -0.22), 0.007, darkM, 4);

  // whitewall tire accents
  for (const z of [rearZ, frontZ]) add(new THREE.TorusGeometry(R - 0.035, 0.006, 4, 28), creamM, [0.0, R, z], [0, Math.PI / 2, 0]);

  return root;
}
