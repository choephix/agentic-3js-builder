import * as THREE from "three";

export const meta = {
  name: "Dragonfly",
  description: "A resting dragonfly with blue segmented abdomen, green thorax, large turquoise compound eyes and four translucent wings held flat.",
};

export default function createDragonfly(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "dragonfly";

  // ---------- Materials (one per colour, shared) ----------
  const blue = new THREE.MeshStandardMaterial({ color: "#1d63c9", roughness: 0.45 });
  const navy = new THREE.MeshStandardMaterial({ color: "#0d1b3d", roughness: 0.5 });
  const cyanTail = new THREE.MeshStandardMaterial({ color: "#39c6d9", roughness: 0.4 });
  const thorax = new THREE.MeshStandardMaterial({ color: "#5aa64a", roughness: 0.5 });
  const stripe = new THREE.MeshStandardMaterial({ color: "#1f3d24", roughness: 0.6 });
  const head = new THREE.MeshStandardMaterial({ color: "#3d6b3a", roughness: 0.5 });
  const eye = new THREE.MeshStandardMaterial({ color: "#3ea6d6", metalness: 0.2, roughness: 0.25 });
  const dark = new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.7 });
  const wingMat = new THREE.MeshStandardMaterial({
    color: "#cdeeff",
    roughness: 0.15,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const veinMat = new THREE.MeshStandardMaterial({ color: "#2b2b2b", roughness: 0.6 });

  // ---------- Abdomen: chain of tapered segments along -Z ----------
  const N = 9;
  const seg = 0.0062;
  let zFront = 0.0098;
  const profile = (t: number) => {
    let r = 0.0034 - 0.0016 * t;
    if (t > 0.75) r += 0.0008; // club-shaped tail end
    return r;
  };
  for (let i = 0; i < N; i++) {
    const t0 = i / N;
    const t1 = (i + 1) / N;
    const rF = profile(t0);
    const rB = profile(t1);
    const zB = zFront - seg;
    const geo = new THREE.CylinderGeometry(rF, rB, seg + 0.0003, 8, 1);
    const mat = i === N - 1 ? cyanTail : i % 2 === 0 ? blue : navy;
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = Math.PI / 2; // +Y (top radius) maps to +Z (front)
    m.position.z = (zFront + zB) / 2;
    root.add(m);
    zFront = zB;
  }

  // ---------- Thorax ----------
  const thoraxGeo = new THREE.SphereGeometry(1, 14, 10);
  thoraxGeo.scale(0.0056, 0.0066, 0.0115);
  const thoraxMesh = new THREE.Mesh(thoraxGeo, thorax);
  thoraxMesh.position.set(0, 0.0128, 0);
  root.add(thoraxMesh);

  // Side stripes on thorax
  for (const sx of [-1, 1]) {
    for (const z of [0.002, -0.003]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.0012, 0.0045, 0.003), stripe);
      s.position.set(sx * 0.0052, 0.0128, z);
      root.add(s);
    }
  }

  // ---------- Head and compound eyes ----------
  const headGeo = new THREE.SphereGeometry(0.0052, 12, 8);
  const headMesh = new THREE.Mesh(headGeo, head);
  headMesh.position.set(0, 0.0138, 0.0175);
  root.add(headMesh);

  const eyeGeo = new THREE.SphereGeometry(0.0046, 12, 8);
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(eyeGeo, eye);
    e.position.set(sx * 0.0034, 0.0146, 0.0192);
    root.add(e);
  }

  // ---------- Helper: cylinder between two points ----------
  const up = new THREE.Vector3(0, 1, 0);
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, parent: THREE.Object3D) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 5), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(up, d.clone().normalize());
    parent.add(m);
  };

  // ---------- Antennae ----------
  for (const sx of [-1, 1]) {
    limb(
      new THREE.Vector3(sx * 0.0008, 0.0170, 0.0228),
      new THREE.Vector3(sx * 0.0030, 0.0200, 0.0255),
      0.00022,
      dark,
      root
    );
  }

  // ---------- Six legs, three pairs, splayed for a resting pose ----------
  const legZ = [0.0035, -0.0008, -0.0050];
  const legKneeZ = [0.0045, 0.0, -0.0025];
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const z = legZ[i];
      const kz = legKneeZ[i];
      const body = new THREE.Vector3(sx * 0.0042, 0.0098, z);
      const knee = new THREE.Vector3(sx * 0.0115, 0.0038, z + kz);
      const foot = new THREE.Vector3(sx * 0.0135, 0.0, z + kz - 0.0018);
      limb(body, knee, 0.0005, dark, root);
      limb(knee, foot, 0.00038, dark, root);
    }
  }

  // ---------- Wings ----------
  const L = 0.032;

  // Wing outline lying flat in the XZ plane, span along +X.
  const makeWingGeometry = (): THREE.BufferGeometry => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.0015);
    s.quadraticCurveTo(L * 0.45, 0.0055, L, 0.0006);
    s.quadraticCurveTo(L * 0.6, -0.0022, 0, -0.0012);
    s.closePath();
    const geo = new THREE.ShapeGeometry(s, 6);
    geo.rotateX(-Math.PI / 2); // shape Y -> world -Z
    return geo;
  };

  const makeWing = (root3: THREE.Vector3, sweep: number, mirror: boolean) => {
    const sx = mirror ? -1 : 1;
    const g = new THREE.Group();
    g.position.copy(root3);
    g.rotation.order = "YXZ";
    g.rotation.y = mirror ? -sweep : sweep;
    g.rotation.z = mirror ? -0.18 : 0.18; // slight upward dihedral, tips raised

    const geo = makeWingGeometry();
    if (mirror) geo.scale(-1, 1, 1);
    const membrane = new THREE.Mesh(geo, wingMat);
    g.add(membrane);

    // Longitudinal veins
    for (const zy of [-0.001, 0.0002, 0.0012]) {
      const v = new THREE.Mesh(new THREE.BoxGeometry(L * 0.92, 0.0003, 0.0005), veinMat);
      v.position.set(sx * L * 0.5, 0.0002, zy);
      g.add(v);
    }
    // Cross veins
    for (const t of [0.22, 0.42, 0.62]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.0005, 0.0003, 0.0034), veinMat);
      c.position.set(sx * L * t, 0.0002, -0.0005);
      g.add(c);
    }
    // Pterostigma (dark leading-edge spot near the tip)
    const pt = new THREE.Mesh(new THREE.BoxGeometry(0.0045, 0.0004, 0.0014), veinMat);
    pt.position.set(sx * L * 0.8, 0.0003, 0.0012);
    g.add(pt);

    root.add(g);
  };

  const forewingSweep = -0.2; // angled slightly forward
  const hindwingSweep = 0.3;  // angled slightly back
  for (const sx of [-1, 1]) {
    const mirror = sx < 0;
    makeWing(new THREE.Vector3(sx * 0.0045, 0.0165, 0.0042), forewingSweep, mirror);
    makeWing(new THREE.Vector3(sx * 0.0042, 0.0160, -0.0048), hindwingSweep, mirror);
  }

  return root;
}
