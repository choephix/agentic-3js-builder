import * as THREE from "three";

export const meta = {
  name: "Bat",
  description:
    "A stylized bat standing with wings spread, built from primitives: plum-brown body, pink-lined ears, glowing eyes, fangs and a membrane wing with scalloped edges.",
};

export default function createBat(): THREE.Object3D {
  const mats = {
    body: new THREE.MeshStandardMaterial({ color: 0x3b2d42, roughness: 0.85, flatShading: true }),
    belly: new THREE.MeshStandardMaterial({ color: 0x5c4a68, roughness: 0.9, flatShading: true }),
    bone: new THREE.MeshStandardMaterial({ color: 0x241b29, roughness: 0.7, flatShading: true }),
    membrane: new THREE.MeshStandardMaterial({
      color: 0x6a4272,
      roughness: 0.6,
      side: THREE.DoubleSide,
      flatShading: true,
    }),
    ear: new THREE.MeshStandardMaterial({ color: 0x2f2437, roughness: 0.8, flatShading: true }),
    earInner: new THREE.MeshStandardMaterial({ color: 0xe88a9a, roughness: 0.7, flatShading: true }),
    eye: new THREE.MeshStandardMaterial({
      color: 0xffc83d,
      emissive: 0xff9a00,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    }),
    nose: new THREE.MeshStandardMaterial({ color: 0xc26f7e, roughness: 0.6, flatShading: true }),
    fang: new THREE.MeshStandardMaterial({ color: 0xf4f1e6, roughness: 0.4, flatShading: true }),
  };

  const root = new THREE.Group();

  // Helper: cylinder bone between two points
  const up = new THREE.Vector3(0, 1, 0);
  function bone(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material): THREE.Mesh {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(r * 0.75, r, len, 6);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(up, dir.normalize());
    return m;
  }

  // ---- Body ----
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mats.body);
  body.scale.set(0.05, 0.075, 0.055);
  body.position.set(0, 0.2, 0);
  root.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mats.belly);
  belly.scale.set(0.034, 0.05, 0.036);
  belly.position.set(0, 0.19, 0.022);
  root.add(belly);

  // ---- Head ----
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mats.body);
  head.position.set(0, 0.31, 0.03);
  root.add(head);

  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.035), mats.body);
  muzzle.position.set(0, 0.29, 0.075);
  root.add(muzzle);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.014, 0.01), mats.nose);
  nose.position.set(0, 0.302, 0.096);
  root.add(nose);

  // Ears (outer + pink inner), splayed outward
  for (const s of [1, -1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.055, 5), mats.ear);
    ear.position.set(0.024 * s, 0.36, 0.025);
    ear.rotation.set(-0.15, 0, -0.32 * s);
    root.add(ear);

    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.04, 5), mats.earInner);
    inner.position.set(0.024 * s, 0.358, 0.034);
    inner.rotation.set(-0.15, 0, -0.32 * s);
    root.add(inner);

    // Eyes
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), mats.eye);
    eye.position.set(0.02 * s, 0.325, 0.068);
    root.add(eye);

    // Fangs pointing down
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.014, 4), mats.fang);
    fang.position.set(0.01 * s, 0.272, 0.088);
    fang.rotation.x = Math.PI;
    root.add(fang);

    // Legs and feet
    const hip = new THREE.Vector3(0.03 * s, 0.15, 0);
    const ankle = new THREE.Vector3(0.034 * s, 0.012, 0.025);
    root.add(bone(hip, ankle, 0.007, mats.bone));

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.04), mats.bone);
    foot.position.set(0.034 * s, 0.006, 0.03);
    root.add(foot);
  }

  // ---- Wings ----
  // Wings sweep slightly back (z = -0.3 * span) so they read as a 3D spread pose.
  function buildWing(sign: number): THREE.Group {
    const g = new THREE.Group();
    const P = (x: number, y: number) => new THREE.Vector3(sign * x, y, -0.3 * x);

    const shoulder = P(0.04, 0.26);
    const elbow = P(0.16, 0.33);
    const wrist = P(0.3, 0.3);

    // Arm bones
    g.add(bone(shoulder, elbow, 0.009, mats.bone));
    g.add(bone(elbow, wrist, 0.007, mats.bone));

    // Finger bones from wrist to tips
    const tips: [number, number][] = [
      [0.36, 0.42],
      [0.46, 0.34],
      [0.42, 0.2],
      [0.27, 0.11],
    ];
    for (const [tx, ty] of tips) {
      g.add(bone(wrist, P(tx, ty), 0.0045, mats.bone));
    }

    // Thumb claw at the elbow
    const thumb = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.03, 4), mats.bone);
    thumb.position.copy(P(0.16, 0.345));
    g.add(thumb);

    // Membrane with scalloped trailing edge
    const outline: [number, number][] = [
      [0.035, 0.22],
      [0.04, 0.26],
      [0.16, 0.33],
      [0.3, 0.3],
      [0.36, 0.42],
      [0.38, 0.36],
      [0.46, 0.34],
      [0.42, 0.27],
      [0.42, 0.2],
      [0.34, 0.17],
      [0.27, 0.11],
      [0.18, 0.13],
      [0.08, 0.13],
      [0.035, 0.15],
    ];
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ShapeGeometry(shape);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setXYZ(i, sign * x, y, -0.3 * x);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    const membrane = new THREE.Mesh(geo, mats.membrane);
    g.add(membrane);

    return g;
  }

  root.add(buildWing(1));
  root.add(buildWing(-1));

  // Overall size: wingspan roughly 0.55 m
  root.scale.setScalar(0.62);

  return root;
}
