import * as THREE from "three";

export const meta = {
  name: "Seahorse",
  description:
    "A stylised coral seahorse: ring-plated trunk with a spiny back, pale belly, gold coronet, aqua translucent fins, and a tail coiled under the body so it stands on its curl.",
};

const DEG = Math.PI / 180;

// Orient a primitive whose axis is +Y so that axis follows `dir`.
// Builds a proper orthonormal basis, so tilted directions are safe too.
function orientY(obj: THREE.Object3D, dir: THREE.Vector3) {
  const y = dir.clone().normalize();
  const ref = Math.abs(y.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
  const z = new THREE.Vector3().crossVectors(ref, y).normalize();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

export default function seahorse(): THREE.Object3D {
  // ---------- materials (one per colour, shared) ----------
  const body = new THREE.MeshStandardMaterial({ color: "#E8673A", roughness: 0.55 });
  const band = new THREE.MeshStandardMaterial({ color: "#FFA65C", roughness: 0.5 });
  const joint = new THREE.MeshStandardMaterial({ color: "#4A1A10", roughness: 0.85 });
  const belly = new THREE.MeshStandardMaterial({ color: "#FFE6B8", roughness: 0.5 });
  const spine = new THREE.MeshStandardMaterial({ color: "#FFF2D8", roughness: 0.4 });
  const gold = new THREE.MeshStandardMaterial({ color: "#F6B83A", roughness: 0.35, metalness: 0.15 });
  const fin = new THREE.MeshStandardMaterial({
    color: "#5ED3C6",
    roughness: 0.6,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const white = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.3 });
  const black = new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.3 });

  const root = new THREE.Group();

  // ---------- spine: [y, z, radius] for snout, head, neck and trunk (x = 0) ----------
  const hand: [number, number, number][] = [
    [0.262, 0.088, 0.0075], // 0 snout tip
    [0.266, 0.064, 0.0105],
    [0.270, 0.040, 0.0170], // head centre line
    [0.262, 0.012, 0.0235], // back of head
    [0.242, -0.004, 0.0235], // neck
    [0.216, -0.016, 0.0250],
    [0.190, -0.021, 0.0275],
    [0.166, -0.010, 0.0300], // chest
    [0.142, 0.004, 0.0275],
    [0.121, 0.000, 0.0240], // abdomen
  ];
  const P: THREE.Vector3[] = [];
  const R: number[] = [];
  for (const [y, z, r] of hand) {
    P.push(new THREE.Vector3(0, y, z));
    R.push(r);
  }

  // ---------- tail: 1.5-turn coil that curls forward under the belly ----------
  const TAIL = P.length; // index of the first coil point (the tail base)
  const phi0 = 64 * DEG;
  const R0 = 0.042;
  const T0 = { y: 0.105, z: -0.008 };
  const coil = new THREE.Vector3(0, T0.y - R0 * Math.sin(phi0), T0.z - R0 * Math.cos(phi0));
  const STEPS = 36; // 15 degrees per step
  for (let k = 0; k <= STEPS; k++) {
    const u = k / STEPS;
    const phi = phi0 - 3 * Math.PI * u;
    const rc = R0 * (1 - 0.4 * u);
    P.push(new THREE.Vector3(0, coil.y + rc * Math.sin(phi), coil.z + rc * Math.cos(phi)));
    R.push(0.018 - 0.009 * u);
  }

  const tangentAt = (i: number) =>
    P[Math.min(i + 1, P.length - 1)].clone().sub(P[Math.max(i - 1, 0)]).normalize();

  // ---------- body: ring plates with dark joints along the spine ----------
  const spineG = new THREE.Group();
  root.add(spineG);
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i];
    const b = P[i + 1];
    const ra = R[i];
    const rb = R[i + 1];
    const len = a.distanceTo(b);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a);

    // dark joint core, visible in the gaps between plates
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(rb * 0.78, ra * 0.78, len * 1.04, 8, 1),
      joint
    );
    core.position.copy(mid);
    orientY(core, dir);
    spineG.add(core);

    // bony ring plate, banded on the tail
    const banded = i >= TAIL && Math.floor((i - TAIL) / 3) % 2 === 1;
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(rb, ra, len * 0.66, 8, 1),
      banded ? band : body
    );
    plate.position.copy(mid);
    orientY(plate, dir);
    spineG.add(plate);
  }

  // ---------- spines along the back of the neck and trunk ----------
  for (let i = 4; i <= 9; i++) {
    const t = tangentAt(i);
    const n = new THREE.Vector3(0, -t.z, t.y).normalize();
    if (n.z > 0) n.negate(); // make sure it points to the back
    const h = i % 2 === 0 ? 0.018 : 0.012;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.0048, h, 6), spine);
    spike.position.copy(P[i]).addScaledVector(n, R[i] * 0.8 + h / 2);
    orientY(spike, n);
    spineG.add(spike);
  }

  // ---------- small outward spines on the coil ----------
  for (let i = TAIL + 2; i < P.length; i += 3) {
    const n = new THREE.Vector3(0, P[i].y - coil.y, P[i].z - coil.z).normalize();
    const h = 0.012;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.0035, h, 6), spine);
    spike.position.copy(P[i]).addScaledVector(n, R[i] * 0.75 + h / 2);
    orientY(spike, n);
    spineG.add(spike);
  }

  // ---------- head ----------
  const headC = new THREE.Vector3(0, 0.268, 0.02);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.031, 14, 10), body);
  head.position.copy(headC);
  head.scale.set(1, 0.95, 1.12);
  root.add(head);

  // dark tip of the snout
  const fwd = P[0].clone().sub(P[1]).normalize();
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.0068, 8, 6), joint);
  mouth.position.copy(P[0]).addScaledVector(fwd, 0.001);
  root.add(mouth);

  // bulging eyes with pupils
  for (const s of [1, -1]) {
    const eyeC = new THREE.Vector3(s * 0.026, 0.274, 0.044);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0115, 12, 9), white);
    eye.position.copy(eyeC);
    root.add(eye);

    const out = eyeC.clone().sub(headC).normalize();
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0058, 8, 6), black);
    pupil.position.copy(eyeC).addScaledVector(out, 0.0095);
    root.add(pupil);
  }

  // gold coronet: a crest down the top of the head plus two side spines
  const crestDir = new THREE.Vector3(0, 0.85, -0.5).normalize();
  const crests = [
    { x: 0, y: 0.293, z: 0.016, h: 0.02, r: 0.0055 },
    { x: 0, y: 0.291, z: 0.004, h: 0.025, r: 0.006 },
    { x: 0, y: 0.282, z: -0.008, h: 0.017, r: 0.005 },
  ];
  for (const c of crests) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(c.r, c.h, 6), gold);
    cone.position.set(c.x, c.y, c.z).addScaledVector(crestDir, c.h / 2);
    orientY(cone, crestDir);
    root.add(cone);
  }
  for (const s of [1, -1]) {
    const d = new THREE.Vector3(s * 0.5, 0.8, -0.4).normalize();
    const h = 0.014;
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.0042, h, 6), gold);
    c.position.set(s * 0.02, 0.283, 0).addScaledVector(d, h / 2);
    orientY(c, d);
    root.add(c);
  }

  // pale belly pouch at the front of the chest
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), belly);
  pouch.position.set(0, 0.158, 0.02);
  pouch.scale.set(0.85, 2.0, 0.75);
  root.add(pouch);

  // ---------- dorsal fin: a translucent fan on the back, with ribs ----------
  const dorsal = new THREE.Group();
  dorsal.add(new THREE.Mesh(new THREE.CircleGeometry(0.04, 10, -0.1, 1.9), fin));
  for (const a of [-0.1, 0.45, 0.95, 1.4, 1.8]) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.0016, 0.002), spine);
    rib.position.set(0.02 * Math.cos(a), 0.02 * Math.sin(a), 0.0012);
    rib.rotation.z = a;
    dorsal.add(rib);
  }
  dorsal.position.set(0, 0.2, -0.04);
  dorsal.rotation.y = Math.PI / 2; // fan opens backwards and up
  root.add(dorsal);

  // ---------- pectoral fins on the sides of the chest ----------
  for (const s of [1, -1]) {
    const pec = new THREE.Mesh(new THREE.CircleGeometry(0.038, 8, -0.6, 1.5), fin);
    pec.position.set(s * 0.024, 0.165, -0.004);
    pec.rotation.y = s > 0 ? 0.35 : Math.PI - 0.35; // sweep backwards and outwards
    root.add(pec);
  }

  // ---------- stand the model on the floor ----------
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root, true);
  root.position.y -= box.min.y;

  return root;
}
