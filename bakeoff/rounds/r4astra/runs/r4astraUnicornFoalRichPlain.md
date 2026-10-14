```ts
import * as THREE from "three";

export const meta = {
  name: "First Steps — Unicorn Foal",
  description:
    "A pearly newborn unicorn finding its feet, with cotton-candy fluff, silver hooves, a little twisted gold horn, and a hand-strung daisy necklace."
};

export default function createModel(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "First Steps";

  type P = [number, number, number];
  type Mat = THREE.Material | THREE.Material[];

  let seed = 48127;
  function random(): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function material(
    color: number,
    roughness = 0.55,
    metalness = 0,
    flatShading = true
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color, roughness, metalness, flatShading
    });
  }

  const pearl = material(0xf3eff8, 0.38, 0.13);
  const pearlLight = material(0xfffaf8, 0.38, 0.13);
  const pearlLilac = material(0xe5dff1, 0.4, 0.13);
  const coat = [pearl, pearlLight, pearlLilac];
  const muzzleMat = material(0xeee3ee, 0.49, 0.04);
  const blush = material(0xe6bfd4);
  const earPink = material(0xe9bfd7);
  const mouthMat = material(0x96768e, 0.65);
  const nostrilMat = material(0x65526b, 0.64);

  const pink = material(0xf2b7d2, 0.65);
  const mint = material(0xb8e3d2, 0.65);
  const lavender = material(0xc5b5e5, 0.65);
  const pinkLight = material(0xffd8e6, 0.65);
  const mintLight = material(0xd9f1e5, 0.65);
  const lavenderLight = material(0xe0d4f4, 0.65);
  const hair = [pink, lavender, mint];
  const hairLight = [pinkLight, lavenderLight, mintLight];

  const eyeRim = material(0xcfc3df, 0.5);
  const eyeDark = material(0x211b30, 0.15, 0.06, false);
  const irisMat = material(0x44304e, 0.22, 0.02, false);
  const pupilMat = material(0x100e1b, 0.12, 0.03, false);
  const lashMat = material(0x33263d, 0.45);
  const glintMat = material(0xfffdf7, 0.18, 0, false);

  const silver = material(0xbdc8db, 0.28, 0.66);
  const silverLight = material(0xe3eaf4, 0.24, 0.65);
  const silverEdge = material(0x8594ad, 0.36, 0.52);
  const gold = material(0xd9a446, 0.29, 0.65);
  const goldLight = material(0xffd989, 0.27, 0.59);
  const goldDark = material(0xb98439, 0.36, 0.52);

  const stemMat = material(0x87a68d, 0.78);
  const leafMat = material(0xb3cea6, 0.75);
  const petalMat = material(0xfffff4, 0.65);
  const petalShade = material(0xf5eedc, 0.68);
  const flowerGold = material(0xf0cc58, 0.65);
  const flowerOchre = material(0xc99a39, 0.7);

  const ball = new THREE.SphereGeometry(1, 12, 8);
  const smallBall = new THREE.SphereGeometry(1, 8, 6);
  const petalGeometry = new THREE.SphereGeometry(1, 8, 5);
  const eyeGeometry = new THREE.SphereGeometry(1, 16, 12);
  const fluffGeometry = new THREE.DodecahedronGeometry(1, 0);

  // Broad, softly different pearl facets rather than a noisy surface texture.
  const pearlGeometry = new THREE.SphereGeometry(1, 12, 8).toNonIndexed();
  pearlGeometry.clearGroups();
  const positions = pearlGeometry.getAttribute("position");
  let groupStart = 0;
  let previousMaterial = -1;
  for (let i = 0; i < positions.count; i += 3) {
    let x = 0, y = 0, z = 0;
    for (let j = 0; j < 3; j++) {
      x += positions.getX(i + j) / 3;
      y += positions.getY(i + j) / 3;
      z += positions.getZ(i + j) / 3;
    }
    let index = 0;
    if (y < -0.34 || (x < -0.58 && z < 0.25)) index = 2;
    else if (y > 0.42) index = 1;
    if (index !== previousMaterial) {
      if (previousMaterial !== -1) {
        pearlGeometry.addGroup(groupStart, i - groupStart, previousMaterial);
      }
      previousMaterial = index;
      groupStart = i;
    }
  }
  pearlGeometry.addGroup(
    groupStart,
    positions.count - groupStart,
    previousMaterial
  );

  const up = new THREE.Vector3(0, 1, 0);
  const forward = new THREE.Vector3(0, 0, 1);
  const v = (p: P) => new THREE.Vector3(p[0], p[1], p[2]);

  function mesh(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    mat: Mat,
    position: P = [0, 0, 0],
    scale: P = [1, 1, 1]
  ): THREE.Mesh {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(...position);
    m.scale.set(...scale);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function sphere(
    parent: THREE.Object3D,
    mat: Mat,
    p: P,
    s: P,
    geometry: THREE.BufferGeometry = ball
  ): THREE.Mesh {
    return mesh(parent, geometry, mat, p, s);
  }

  function pearlShape(parent: THREE.Object3D, p: P, s: P): THREE.Mesh {
    return sphere(parent, coat, p, s, pearlGeometry);
  }

  function rod(
    parent: THREE.Object3D,
    a: P, b: P,
    radiusA: number, radiusB: number,
    mat: Mat,
    sides = 8
  ): THREE.Mesh {
    const av = v(a), bv = v(b);
    const delta = bv.clone().sub(av);
    const m = mesh(
      parent,
      new THREE.CylinderGeometry(radiusB, radiusA, delta.length(), sides),
      mat
    );
    m.position.copy(av.add(bv).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(up, delta.normalize());
    return m;
  }

  function softBone(
    parent: THREE.Object3D,
    a: P, b: P,
    rx: number, rz: number,
    extra = 0.02
  ): THREE.Mesh {
    const av = v(a), bv = v(b);
    const delta = bv.clone().sub(av);
    const mid = av.clone().add(bv).multiplyScalar(0.5);
    const m = pearlShape(
      parent,
      [mid.x, mid.y, mid.z],
      [rx, delta.length() * 0.5 + extra, rz]
    );
    m.quaternion.setFromUnitVectors(up, delta.normalize());
    return m;
  }

  function tube(
    parent: THREE.Object3D,
    points: P[],
    radius: number,
    mat: Mat,
    segments = 32,
    closed = false,
    radialSegments = 5
  ): THREE.Mesh {
    const curve = new THREE.CatmullRomCurve3(points.map(v), closed);
    return mesh(
      parent,
      new THREE.TubeGeometry(curve, segments, radius, radialSegments, closed),
      mat
    );
  }

  function fluff(
    parent: THREE.Object3D,
    p: P, s: P,
    mat: THREE.Material,
    rotation: P = [0, 0, 0]
  ): THREE.Mesh {
    const m = mesh(parent, fluffGeometry, mat, p, s);
    m.rotation.set(...rotation);
    return m;
  }

  // Compact baby barrel and a narrow, upright horse neck.
  pearlShape(root, [0, 1.052, -0.16], [0.241, 0.244, 0.459]);
  pearlShape(root, [0, 1.066, -0.438], [0.23, 0.245, 0.254]);
  pearlShape(root, [0, 1.077, 0.177], [0.225, 0.267, 0.249]);
  pearlShape(root, [0, 0.979, 0.285], [0.156, 0.193, 0.137]);

  rod(root, [0, 1.065, 0.18], [0, 1.448, 0.423], 0.178, 0.12, pearl, 10);
  softBone(root, [0, 1.075, 0.192], [0, 1.462, 0.426], 0.154, 0.155, 0.061);

  // Four distinct weight-bearing feet: asymmetric angles suggest unsteady balance.
  function hoof(x: number, z: number, yaw: number): void {
    const foot = new THREE.Group();
    foot.position.set(x, 0, z);
    foot.rotation.y = yaw;
    root.add(foot);

    mesh(
      foot,
      new THREE.CylinderGeometry(0.068, 0.064, 0.018, 8),
      silverEdge, [0, 0.009, 0.006], [1, 1, 1.19]
    );
    mesh(
      foot,
      new THREE.CylinderGeometry(0.050, 0.068, 0.097, 8),
      silver, [0, 0.0665, 0.006], [1, 1, 1.19]
    );
    mesh(
      foot,
      new THREE.CylinderGeometry(0.048, 0.052, 0.014, 8),
      silverLight, [0, 0.118, 0.003], [1, 1, 1.15]
    );
    pearlShape(foot, [0, 0.142, -0.009], [0.051, 0.045, 0.054]);

    const shine = mesh(
      foot, new THREE.BoxGeometry(0.009, 0.038, 0.003),
      silverLight, [0.022, 0.067, 0.076]
    );
    shine.rotation.z = -0.13;
  }

  function frontLeg(
    shoulder: P, elbow: P, knee: P, ankle: P,
    footX: number, footZ: number, yaw: number
  ): void {
    softBone(root, shoulder, elbow, 0.072, 0.079, 0.056);
    rod(root, elbow, knee, 0.049, 0.034, pearl, 8);
    softBone(root, elbow, knee, 0.043, 0.047);
    pearlShape(root, knee, [0.05, 0.057, 0.05]);
    rod(root, knee, ankle, 0.033, 0.026, pearl, 8);
    pearlShape(root, ankle, [0.043, 0.044, 0.044]);
    rod(root, ankle, [footX, 0.128, footZ - 0.009], 0.031, 0.037, pearl, 8);
    hoof(footX, footZ, yaw);
  }

  frontLeg(
    [0.159, 1.061, 0.181], [0.193, 0.795, 0.189],
    [0.185, 0.536, 0.276], [0.290, 0.181, 0.375],
    0.310, 0.412, 0.13
  );
  frontLeg(
    [-0.159, 1.055, 0.178], [-0.189, 0.791, 0.158],
    [-0.161, 0.553, 0.250], [-0.272, 0.178, 0.236],
    -0.289, 0.269, -0.17
  );

  function hindLeg(
    hip: P, stifle: P, hock: P, ankle: P,
    footX: number, footZ: number, yaw: number
  ): void {
    softBone(root, hip, stifle, 0.094, 0.106, 0.065);
    pearlShape(root, stifle, [0.062, 0.064, 0.069]);
    rod(root, stifle, hock, 0.051, 0.031, pearl, 8);
    softBone(root, stifle, hock, 0.043, 0.049, 0.025);
    pearlShape(root, hock, [0.046, 0.055, 0.053]);
    rod(root, hock, ankle, 0.030, 0.025, pearl, 8);
    pearlShape(root, ankle, [0.041, 0.044, 0.044]);
    rod(root, ankle, [footX, 0.128, footZ - 0.012], 0.030, 0.037, pearl, 8);
    hoof(footX, footZ, yaw);
  }

  hindLeg(
    [0.156, 1.041, -0.435], [0.215, 0.789, -0.315],
    [0.251, 0.466, -0.561], [0.295, 0.175, -0.461],
    0.309, -0.421, 0.16
  );
  hindLeg(
    [-0.154, 1.048, -0.450], [-0.204, 0.791, -0.326],
    [-0.248, 0.474, -0.622], [-0.305, 0.173, -0.584],
    -0.318, -0.548, -0.12
  );

  // A few small, downward coat points at the baby chest.
  for (let i = -1; i <= 1; i++) {
    rod(
      root,
      [i * 0.037, 0.881, 0.367],
      [i * 0.044, 0.801 - (i === 0 ? 0.016 : 0), 0.351],
      0.025, 0.002, pearlLight, 5
    );
  }

  // Short scalloped mane, sitting on the crest rather than hanging in sheets.
  const maneStations: P[] = [
    [0, 1.613, 0.282],
    [0, 1.519, 0.252],
    [0, 1.420, 0.219],
    [0, 1.337, 0.154],
    [0, 1.307, 0.064],
    [0, 1.296, -0.032]
  ];
  maneStations.forEach((p, i) => {
    const c = i % 3;
    fluff(root, p, [0.087, 0.090, 0.079], hair[c], [0.15, i * 0.37, 0.12]);
    fluff(
      root,
      [p[0] + 0.062, p[1] - 0.013, p[2] + 0.017],
      [0.061, 0.081, 0.070], hair[c], [0.22, 0.28, -0.32]
    );
    if (i < 5) {
      fluff(
        root, [0.044, p[1] + 0.040, p[2] + 0.029],
        [0.037, 0.038, 0.043], hairLight[c], [0, 0.3, 0.2]
      );
    }
  });

  // A short fluffy tail with three clearly separated pastel ends.
  rod(root, [0, 1.126, -0.634], [0.058, 1.111, -0.813], 0.039, 0.028, pearl, 8);
  fluff(root, [0.065, 1.098, -0.809], [0.067, 0.062, 0.093], pink, [0.1, -0.3, 0]);
  fluff(root, [0.119, 1.017, -0.915], [0.081, 0.139, 0.092], pink, [0.54, 0.2, 0.29]);
  fluff(root, [0.184, 0.959, -0.935], [0.067, 0.149, 0.074], lavender, [0.48, 0.1, 0.30]);
  fluff(root, [0.078, 0.970, -0.965], [0.060, 0.128, 0.073], mint, [0.58, -0.2, 0.12]);
  fluff(root, [0.137, 0.881, -1.025], [0.061, 0.090, 0.062], pink, [0.50, 0.1, 0.15]);
  fluff(root, [0.220, 0.859, -0.984], [0.044, 0.067, 0.049], lavenderLight, [0.48, 0, 0.25]);
  fluff(root, [0.079, 0.899, -1.020], [0.040, 0.062, 0.048], mintLight, [0.58, 0, 0]);
  fluff(root, [0.133, 1.087, -0.889], [0.042, 0.057, 0.055], pinkLight, [0.3, 0.3, 0]);

  // Large, slightly cocked head: long face, small soft muzzle, upright ears.
  const head = new THREE.Group();
  head.position.set(0, 1.393, 0.449);
  head.rotation.z = -0.085;
  head.rotation.y = -0.025;
  root.add(head);

  pearlShape(head, [0, 0.079, 0], [0.183, 0.219, 0.189]);
  pearlShape(head, [0, -0.025, 0.062], [0.169, 0.145, 0.176]);
  const bridge = pearlShape(head, [0, -0.022, 0.166], [0.124, 0.141, 0.186]);
  bridge.rotation.x = 0.20;
  sphere(head, muzzleMat, [0, -0.109, 0.316], [0.148, 0.101, 0.131]);
  pearlShape(head, [0, -0.177, 0.294], [0.113, 0.045, 0.108]);

  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(side * 0.116, 0.271, -0.027);
    ear.rotation.z = -side * (side === 1 ? 0.22 : 0.14);
    ear.rotation.x = side === 1 ? -0.04 : 0.09;
    head.add(ear);
    pearlShape(ear, [0, 0.102, 0], [0.060, 0.153, 0.044]);
    sphere(ear, earPink, [0, 0.114, 0.035], [0.037, 0.107, 0.014], smallBall);
    sphere(ear, blush, [0, 0.086, 0.044], [0.019, 0.065, 0.005], smallBall);
    pearlShape(ear, [0, 0.005, 0.020], [0.047, 0.049, 0.036]);

    const normal = new THREE.Vector3(side * 0.79, 0.035, 0.613).normalize();
    const eye = new THREE.Group();
    eye.position.set(side * 0.150, 0.080, 0.138);
    eye.quaternion.setFromUnitVectors(forward, normal);
    head.add(eye);

    sphere(eye, eyeRim, [0, 0, 0], [0.085, 0.100, 0.027], eyeGeometry);
    sphere(eye, eyeDark, [0, 0, 0.014], [0.075, 0.090, 0.028], eyeGeometry);
    sphere(eye, irisMat, [-side * 0.008, -0.014, 0.035], [0.047, 0.060, 0.010], eyeGeometry);
    sphere(eye, pupilMat, [-side * 0.008, -0.002, 0.043], [0.034, 0.060, 0.006], eyeGeometry);
    sphere(eye, glintMat, [-0.024, 0.031, 0.044], [0.019, 0.024, 0.007], smallBall);
    sphere(eye, glintMat, [0.026, -0.033, 0.042], [0.009, 0.011, 0.004], smallBall);

    tube(
      eye,
      [[-0.066, 0.036, 0.025], [-0.046, 0.073, 0.031],
       [0, 0.090, 0.028], [0.046, 0.073, 0.031], [0.067, 0.032, 0.025]],
      0.0045, lashMat, 20
    );

    for (let i = 0; i < 3; i++) {
      const x = side * (0.033 + i * 0.016);
      const y = 0.080 - i * 0.013;
      const a: P = [x, y, 0.031];
      const b: P = [x + side * (0.014 + i * 0.004), y + 0.027, 0.039];
      const c: P = [x + side * (0.024 + i * 0.008), y + 0.041 - i * 0.003, 0.044];
      rod(eye, a, b, 0.0045, 0.0032, lashMat, 5);
      rod(eye, b, c, 0.0032, 0.0008, lashMat, 5);
    }

    const cheek = new THREE.Group();
    cheek.position.set(side * 0.151, -0.064, 0.194);
    cheek.quaternion.setFromUnitVectors(forward, normal);
    head.add(cheek);
    sphere(cheek, blush, [0, 0, 0], [0.038, 0.019, 0.006], smallBall);
    for (let i = 0; i < 3; i++) {
      sphere(
        cheek, pearlLight,
        [-0.018 + i * 0.017, 0.005 + (i === 1 ? 0.006 : 0), 0.006],
        [0.0042, 0.0042, 0.0025], smallBall
      );
    }

    const nostril = new THREE.Group();
    nostril.position.set(side * 0.102, -0.092, 0.410);
    nostril.rotation.y = side * 0.44;
    nostril.rotation.z = -side * 0.27;
    head.add(nostril);
    sphere(nostril, blush, [0, 0, 0], [0.025, 0.019, 0.006], smallBall);
    sphere(nostril, nostrilMat, [0, 0.001, 0.005], [0.016, 0.011, 0.004], smallBall);
  }

  tube(
    head,
    [[-0.090, -0.147, 0.394], [-0.055, -0.164, 0.426],
     [0, -0.168, 0.438], [0.055, -0.164, 0.426], [0.090, -0.147, 0.394]],
    0.0036, mouthMat, 28
  );

  // Fluffy forelock leaves the horn and the expressive eyes unobscured.
  fluff(head, [-0.050, 0.274, 0.040], [0.071, 0.063, 0.077], mint, [0.1, 0.2, -0.3]);
  fluff(head, [0.035, 0.281, 0.038], [0.083, 0.060, 0.078], pink, [-0.2, 0.1, 0.2]);
  fluff(head, [0.092, 0.238, 0.103], [0.054, 0.077, 0.058], lavender, [0.1, 0.2, -0.40]);
  fluff(head, [-0.049, 0.231, 0.131], [0.049, 0.061, 0.052], pink, [0, 0.1, 0.32]);
  fluff(head, [0.034, 0.309, 0.056], [0.044, 0.032, 0.045], pinkLight, [0, 0.4, 0]);
  fluff(head, [-0.081, 0.274, 0.073], [0.029, 0.037, 0.038], mintLight);

  const horn = new THREE.Group();
  horn.position.set(0, 0.244, 0.137);
  horn.quaternion.setFromUnitVectors(up, new THREE.Vector3(0, 0.954, 0.3).normalize());
  head.add(horn);

  mesh(horn, new THREE.ConeGeometry(0.039, 0.194, 10), gold, [0, 0.097, 0]);
  const collar = mesh(horn, new THREE.TorusGeometry(0.039, 0.0055, 5, 12), goldDark);
  collar.rotation.x = Math.PI / 2;

  const spiral: P[] = [];
  for (let i = 0; i <= 90; i++) {
    const t = i / 90;
    const angle = t * Math.PI * 2 * 3.15 + 0.35;
    const radius = 0.0395 * (1 - t) + 0.001;
    spiral.push([
      Math.cos(angle) * radius,
      0.008 + t * 0.179,
      Math.sin(angle) * radius
    ]);
  }
  tube(horn, spiral, 0.0047, goldLight, 90, false, 5);

  // A genuinely encircling, draped stem chain with dimensional daisies.
  function necklacePoint(t: number): P {
    return [
      0.199 * Math.sin(t),
      1.219 - 0.145 * Math.cos(t),
      0.346 + 0.170 * Math.cos(t)
    ];
  }

  const chainPoints: P[] = [];
  for (let i = 0; i < 48; i++) {
    chainPoints.push(necklacePoint(i * Math.PI * 2 / 48));
  }
  tube(root, chainPoints, 0.0054, stemMat, 80, true, 5);

  const flowerCount = 13;
  for (let i = 0; i < flowerCount; i++) {
    const t = i * Math.PI * 2 / flowerCount;
    const p = necklacePoint(t);
    const normal = new THREE.Vector3(
      0.94 * Math.sin(t), 0.24, Math.cos(t)
    ).normalize();

    const flower = new THREE.Group();
    flower.position.copy(v(p).addScaledVector(normal, 0.007));
    flower.quaternion.setFromUnitVectors(forward, normal);
    flower.rotateZ((random() - 0.5) * 0.45);
    const size = 0.88 + 0.12 * Math.max(0, Math.cos(t));
    flower.scale.setScalar(size);
    root.add(flower);

    for (let j = 0; j < 8; j++) {
      const angle = j * Math.PI / 4;
      const length = 0.0255 + random() * 0.003;
      const petal = sphere(
        flower,
        j % 3 === 0 ? petalShade : petalMat,
        [Math.sin(angle) * 0.031, Math.cos(angle) * 0.031, 0],
        [0.0127, length, 0.007],
        petalGeometry
      );
      petal.rotation.z = -angle;
      petal.rotation.x = (random() - 0.5) * 0.18;
    }
    sphere(flower, flowerOchre, [0, 0, 0.006], [0.021, 0.021, 0.009], smallBall);
    sphere(flower, flowerGold, [0, 0, 0.013], [0.018, 0.018, 0.010], smallBall);
    for (let j = 0; j < 4; j++) {
      const a = j * Math.PI * 0.5 + 0.3;
      sphere(
        flower, flowerOchre,
        [Math.sin(a) * 0.009, Math.cos(a) * 0.009, 0.022],
        [0.0026, 0.0026, 0.0017], smallBall
      );
    }

    const lt = t + Math.PI / flowerCount;
    const leafPoint = necklacePoint(lt);
    const leaf = new THREE.Group();
    leaf.position.set(...leafPoint);
    leaf.quaternion.setFromUnitVectors(
      forward,
      new THREE.Vector3(Math.sin(lt), 0.3, Math.cos(lt)).normalize()
    );
    leaf.rotateZ(i % 2 ? 0.85 : -0.8);
    root.add(leaf);
    sphere(leaf, leafMat, [0, 0.021, -0.002], [0.012, 0.030, 0.004], smallBall);
    rod(leaf, [0, -0.003, 0.002], [0, 0.042, 0.002], 0.0015, 0.0006, stemMat, 5);
  }

  // Approximately 1.1 m at the withers; all four hoof soles meet y = 0.
  root.scale.setScalar(0.84);
  return root;
}
```