import * as THREE from "three";

export const meta = {
  name: "Curious Reef Octopus",
  description:
    "A bulbous coral-and-rust reef octopus with golden bar-pupil eyes, a grumpy brow, cream-suckered arms, and one arm raised to show off a brass shipwreck key.",
};

function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function buildOctopus(): THREE.Object3D {
  const rand = mulberry32(20240611);
  const root = new THREE.Group();

  // ---------- Materials ----------
  function makeMottleTexture(): THREE.CanvasTexture {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#d4604a";
    g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 260; i++) {
      const x = rand() * 512;
      const y = rand() * 256;
      const r = 6 + rand() * 26;
      g.fillStyle =
        rand() < 0.6 ? "rgba(246,215,180,0.45)" : "rgba(120,40,22,0.35)";
      g.beginPath();
      g.ellipse(x, y, r, r * (0.5 + rand() * 0.5), rand() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: makeMottleTexture(),
    roughness: 0.78,
  });
  const rustMat = new THREE.MeshStandardMaterial({ color: 0x9c3b1f, roughness: 0.7 });
  const suckerMat = new THREE.MeshStandardMaterial({ color: 0xf1e3c4, roughness: 0.5 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xe8b53a, roughness: 0.3 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x161009, roughness: 0.6 });
  const browMat = new THREE.MeshStandardMaterial({ color: 0x5e2513, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xc9962b,
    metalness: 0.7,
    roughness: 0.35,
  });

  // ---------- Mantle / head ----------
  const MC = new THREE.Vector3(0, 0.34, 0);
  const RX = 0.2, RY = 0.24, RZ = 0.216;

  const mantle = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), bodyMat);
  mantle.scale.set(1, 1.2, 1.08);
  mantle.position.copy(MC);
  root.add(mantle);

  // Point on the ellipsoid surface for a unit direction, and its normal.
  function surface(d: THREE.Vector3) {
    const p = new THREE.Vector3(MC.x + d.x * RX, MC.y + d.y * RY, MC.z + d.z * RZ);
    const n = new THREE.Vector3(d.x / RX, d.y / RY, d.z / RZ).normalize();
    return { p, n };
  }

  const bumpGeo = new THREE.SphereGeometry(1, 6, 5);
  for (let i = 0; i < 110; i++) {
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const d = new THREE.Vector3(s * Math.cos(phi), u, s * Math.sin(phi));
    const { p, n } = surface(d);
    const r = 0.012 + rand() * 0.012;
    const bump = new THREE.Mesh(bumpGeo, rustMat);
    bump.scale.setScalar(r);
    bump.position.copy(p).addScaledVector(n, r * 0.35);
    root.add(bump);
  }

  // ---------- Eyes with bar pupils and grumpy brows ----------
  const eyeBallGeo = new THREE.SphereGeometry(0.045, 14, 10);
  const pupilGeo = new THREE.BoxGeometry(0.05, 0.011, 0.012);
  const browGeo = new THREE.BoxGeometry(0.1, 0.028, 0.04);

  for (const s of [-1, 1]) {
    const d = new THREE.Vector3(s * 0.5, 0.15, 0.85).normalize();
    const { p, n } = surface(d);

    const eye = new THREE.Group();
    eye.position.copy(p).addScaledVector(n, 0.004);
    eye.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    root.add(eye);

    const ball = new THREE.Mesh(eyeBallGeo, eyeMat);
    ball.scale.set(1, 1, 0.6);
    eye.add(ball);

    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(0, 0, 0.03);
    eye.add(pupil);

    const brow = new THREE.Mesh(browGeo, browMat);
    brow.position.set(0, 0.066, 0.012);
    brow.rotation.z = s * 0.35; // inner end dips for a grumpy look
    eye.add(brow);
  }

  // ---------- Arms ----------
  const sphereGeo = new THREE.SphereGeometry(1, 8, 6);
  const suckerGeo = new THREE.CylinderGeometry(1, 1, 0.25, 8);
  const NSEG = 26;
  const LIFT_ARM = 3;
  let keyTip = new THREE.Vector3();

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + (rand() - 0.5) * 0.3;
    const lift = i === LIFT_ARM ? 0.45 : 0;
    const pts: THREE.Vector3[] = [];
    const radii: number[] = [];

    for (let k = 0; k <= NSEG; k++) {
      const t = k / NSEG;
      const R = 0.05 + 0.35 * Math.pow(t, 0.8);
      const theta = a + Math.sin(t * Math.PI * 1.4 + i) * 0.5 * t;
      let y = 0.1 + 0.1 * Math.sin(t * Math.PI * 0.9) * (1 - 0.4 * t) + lift * t * t;
      const rr = 0.042 * Math.pow(1 - t, 0.85) + 0.008;
      y = Math.max(y, rr);
      pts.push(new THREE.Vector3(Math.cos(theta) * R, y, Math.sin(theta) * R));
      radii.push(rr);
    }

    // Tapered arm built from overlapping spheres
    for (let k = 0; k <= NSEG; k++) {
      const m = new THREE.Mesh(sphereGeo, bodyMat);
      m.scale.setScalar(radii[k]);
      m.position.copy(pts[k]);
      root.add(m);
    }

    // Suckers on the ventral side, two rows
    const down = new THREE.Vector3(0, -1, 0);
    for (let k = 2; k < NSEG - 1; k++) {
      const T = new THREE.Vector3().subVectors(pts[k + 1], pts[k - 1]).normalize();
      let V = down.clone().addScaledVector(T, -down.dot(T));
      if (V.lengthSq() < 1e-4) V.set(0, 0, 1);
      V.normalize();
      const S = new THREE.Vector3().crossVectors(T, V).normalize();
      const rr = radii[k];
      for (const side of [-1, 1]) {
        const sucker = new THREE.Mesh(suckerGeo, suckerMat);
        const sc = rr * 0.3;
        sucker.scale.set(sc, 1, sc);
        sucker.position
          .copy(pts[k])
          .addScaledVector(V, rr * 0.85)
          .addScaledVector(S, side * rr * 0.45);
        sucker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), V);
        root.add(sucker);
      }
    }

    // A few warts along the upper side of each arm
    for (let k = 4; k < NSEG; k += 3) {
      const wart = new THREE.Mesh(sphereGeo, rustMat);
      const wr = radii[k] * 0.35;
      wart.scale.setScalar(wr);
      wart.position.copy(pts[k]).add(new THREE.Vector3(0, radii[k] * 0.8, 0));
      root.add(wart);
    }

    if (i === LIFT_ARM) keyTip = pts[NSEG].clone();
  }

  // ---------- Brass key held aloft ----------
  const key = new THREE.Group();
  key.position.copy(keyTip).add(new THREE.Vector3(0, 0.03, 0.01));
  key.rotation.z = 0.2;
  root.add(key);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 8, 16), brassMat);
  ring.position.y = 0.075;
  key.add(ring);

  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.13, 0.01), brassMat);
  key.add(shaft);

  const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.01), brassMat);
  tooth1.position.set(0.012, -0.055, 0);
  key.add(tooth1);

  const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.01), brassMat);
  tooth2.position.set(0.008, -0.035, 0);
  key.add(tooth2);

  // ---------- Stand on the floor, centred on x/z ----------
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  box.getCenter(center);
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;

  const holder = new THREE.Group();
  holder.add(root);
  return holder;
}
