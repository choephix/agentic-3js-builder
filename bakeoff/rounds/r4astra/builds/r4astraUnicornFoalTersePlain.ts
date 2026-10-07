import * as THREE from "three";

export const meta = {
  name: "Little Daydream",
  description:
    "A long-legged unicorn foal with an ivory coat, a honey-gold spiral horn, oversized curious eyes, and a swept lavender, mint, and rose mane.",
};

export default function createModel(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Little Daydream — unicorn foal";

  type V = [number, number, number];

  const material = (
    color: string,
    roughness = 0.75,
    metalness = 0
  ): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      flatShading: true,
    });

  const coat = material("#f6efdf");
  const lightCoat = material("#fff9ec");
  const coolCoat = material("#e2dce3");
  const muzzleMat = material("#e8ccd2");
  const blush = material("#dca6b8");
  const innerEar = material("#e6a9bc");
  const earLight = material("#f4c9ce");
  const mouthMat = material("#926776");
  const nostrilMat = material("#64485d");
  const hoofMat = material("#645971", 0.58);
  const hoofRim = material("#a39ab4");
  const soleMat = material("#453e55");
  const maneDark = material("#76659f");
  const manePurple = material("#a18ac6");
  const maneLight = material("#c5afe2");
  const maneMint = material("#a5d8cd");
  const maneRose = material("#edb5c5");
  const gold = material("#e5b762", 0.36, 0.35);
  const goldLight = material("#ffe2a0", 0.34, 0.22);
  const eyeDark = material("#242339", 0.15);
  const irisMat = material("#518c99", 0.24);
  const eyeWhite = material("#ffffff", 0.2);

  const ico = new THREE.IcosahedronGeometry(1, 1);
  const softIco = new THREE.IcosahedronGeometry(1, 2);
  const round = new THREE.SphereGeometry(1, 12, 8);
  const eyeGeo = new THREE.SphereGeometry(1, 16, 10);
  const leafGeo = new THREE.SphereGeometry(1, 6, 4);
  const diamondGeo = new THREE.OctahedronGeometry(1, 0);

  function ellipsoid(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    mat: THREE.Material,
    p: V,
    s: V,
    rotation?: V
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(...p);
    mesh.scale.set(...s);
    if (rotation) mesh.rotation.set(...rotation);
    parent.add(mesh);
    return mesh;
  }

  function link(
    parent: THREE.Object3D,
    a: V,
    b: V,
    rA: number,
    rB: number,
    mat: THREE.Material,
    sides = 8
  ): THREE.Mesh {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const direction = end.clone().sub(start);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(rB, rA, direction.length(), sides, 1),
      mat
    );
    mesh.position.copy(start.add(end).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
    parent.add(mesh);
    return mesh;
  }

  function line(
    parent: THREE.Object3D,
    points: V[],
    thickness: number,
    mat: THREE.Material,
    segments = 24
  ): THREE.Mesh {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p))
    );
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, segments, thickness, 5, false),
      mat
    );
    parent.add(mesh);
    return mesh;
  }

  // A low-sided cylinder bent into a tapered, sculptural lock of hair.
  function lock(
    parent: THREE.Object3D,
    points: V[],
    widths: number[],
    mat: THREE.Material,
    flatten = 0.7,
    reference: V = [0, 0, 1],
    divisions = 14
  ): THREE.Mesh {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      false,
      "centripetal"
    );
    const geometry = new THREE.CylinderGeometry(
      1,
      1,
      1,
      7,
      divisions,
      false
    );
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const referenceVector = new THREE.Vector3(...reference);
    const side = new THREE.Vector3();
    const outward = new THREE.Vector3();

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const t = THREE.MathUtils.clamp(0.5 - positions.getY(i), 0, 1);
      const center = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();

      side.crossVectors(tangent, referenceVector);
      if (side.lengthSq() < 0.0001) {
        side.crossVectors(tangent, new THREE.Vector3(0, 1, 0));
      }
      side.normalize();
      outward.crossVectors(side, tangent).normalize();

      const f = t * (widths.length - 1);
      const j = Math.min(widths.length - 2, Math.floor(f));
      const radius = THREE.MathUtils.lerp(widths[j], widths[j + 1], f - j);

      center.addScaledVector(side, x * radius);
      center.addScaledVector(outward, z * radius * flatten);
      positions.setXYZ(i, center.x, center.y, center.z);
    }
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, mat);
    parent.add(mesh);
    return mesh;
  }

  // Narrow barrel, round baby haunches, and a raised, fine-boned neck.
  ellipsoid(root, softIco, coat, [0, 0.995, -0.105], [0.287, 0.303, 0.552]);
  ellipsoid(root, softIco, coat, [0, 1.015, -0.433], [0.276, 0.291, 0.289]);
  ellipsoid(root, softIco, coat, [0, 1.017, 0.254], [0.259, 0.283, 0.254]);
  ellipsoid(root, ico, coolCoat, [0, 0.812, 0.245], [0.174, 0.146, 0.187]);

  link(root, [0, 1.028, 0.254], [0, 1.493, 0.493], 0.211, 0.147, coat, 10);
  ellipsoid(root, softIco, coat, [0, 1.453, 0.473], [0.157, 0.179, 0.164]);
  ellipsoid(
    root,
    softIco,
    lightCoat,
    [0, 1.169, 0.403],
    [0.16, 0.248, 0.153],
    [0.34, 0, 0]
  );

  function hoof(x: number, z: number): void {
    const sole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.096, 0.091, 0.028, 8),
      soleMat
    );
    sole.position.set(x, 0.014, z);
    sole.scale.z = 1.23;
    root.add(sole);

    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(0.073, 0.096, 0.117, 8),
      hoofMat
    );
    wall.position.set(x, 0.077, z);
    wall.scale.z = 1.23;
    root.add(wall);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.071, 0.078, 0.026, 8),
      hoofRim
    );
    rim.position.set(x, 0.143, z);
    rim.scale.z = 1.16;
    root.add(rim);

    // The little angular fringe over each unshod hoof.
    for (const dx of [-0.038, 0, 0.038]) {
      const tuft = new THREE.Mesh(
        new THREE.ConeGeometry(dx === 0 ? 0.028 : 0.023, 0.071, 5),
        lightCoat
      );
      tuft.position.set(x + dx, 0.171, z + 0.048);
      tuft.rotation.z = Math.PI + dx * 3;
      root.add(tuft);
    }
  }

  // Four separate, planted legs. The rear hocks retain an equine zig-zag.
  for (const s of [-1, 1]) {
    const dz = s === 1 ? 0.055 : -0.018;
    const shoulder: V = [s * 0.184, 0.995, 0.272 + dz];
    const elbow: V = [s * 0.217, 0.759, 0.300 + dz];
    const knee: V = [s * 0.239, 0.468, 0.333 + dz];
    const ankle: V = [s * 0.254, 0.194, 0.357 + dz];
    const footZ = 0.386 + dz;

    ellipsoid(root, ico, coat, shoulder, [0.112, 0.173, 0.126]);
    link(root, shoulder, elbow, 0.085, 0.065, coat);
    ellipsoid(root, ico, coat, elbow, [0.069, 0.084, 0.071]);
    link(root, elbow, knee, 0.058, 0.047, coat);
    ellipsoid(root, ico, coolCoat, knee, [0.064, 0.075, 0.068]);
    ellipsoid(
      root,
      ico,
      lightCoat,
      [knee[0], knee[1] + 0.012, knee[2] + 0.036],
      [0.046, 0.050, 0.029]
    );
    link(root, knee, ankle, 0.043, 0.044, coat, 7);
    ellipsoid(root, ico, lightCoat, ankle, [0.063, 0.070, 0.064]);
    link(root, ankle, [s * 0.258, 0.137, footZ], 0.049, 0.061, coat);
    hoof(s * 0.258, footZ);

    const backOffset = s === 1 ? -0.032 : 0.014;
    const hip: V = [s * 0.19, 0.991, -0.434 + backOffset];
    const stifle: V = [s * 0.240, 0.735, -0.350 + backOffset];
    const hock: V = [s * 0.272, 0.449, -0.577 + backOffset];
    const backAnkle: V = [s * 0.28, 0.196, -0.595 + backOffset];
    const backFootZ = -0.561 + backOffset;

    ellipsoid(root, softIco, coat, [s * 0.184, 0.914, -0.438 + backOffset], [
      0.13, 0.208, 0.163,
    ]);
    link(root, hip, stifle, 0.111, 0.074, coat);
    ellipsoid(root, ico, coat, stifle, [0.078, 0.096, 0.089]);
    link(root, stifle, hock, 0.068, 0.045, coat);
    ellipsoid(root, ico, coolCoat, hock, [0.061, 0.078, 0.074]);
    link(root, hock, backAnkle, 0.041, 0.046, coat, 7);
    ellipsoid(root, ico, lightCoat, backAnkle, [0.062, 0.071, 0.065]);
    link(root, backAnkle, [s * 0.282, 0.14, backFootZ], 0.048, 0.06, coat);
    hoof(s * 0.282, backFootZ);
  }

  // The mane is a handful of broad, overlapping locks, not individual hairs.
  lock(
    root,
    [[0, 1.672, 0.425], [0, 1.534, 0.300], [0, 1.335, 0.141], [0, 1.178, -0.04]],
    [0.10, 0.12, 0.13, 0.075],
    maneDark,
    0.86,
    [1, 0, 0]
  );

  const maneLocks: { p: V[]; w: number[]; m: THREE.Material }[] = [
    {
      p: [[0.025, 1.665, 0.426], [0.14, 1.588, 0.389], [0.212, 1.451, 0.35], [0.231, 1.323, 0.37], [0.191, 1.263, 0.423]],
      w: [0.082, 0.098, 0.084, 0.053, 0.003],
      m: maneLight,
    },
    {
      p: [[0.025, 1.578, 0.321], [0.142, 1.500, 0.267], [0.244, 1.362, 0.224], [0.267, 1.216, 0.211], [0.221, 1.150, 0.268]],
      w: [0.085, 0.11, 0.101, 0.060, 0.003],
      m: manePurple,
    },
    {
      p: [[0.023, 1.486, 0.218], [0.139, 1.389, 0.133], [0.25, 1.262, 0.077], [0.274, 1.141, 0.035], [0.224, 1.069, 0.083]],
      w: [0.089, 0.108, 0.098, 0.055, 0.003],
      m: maneLight,
    },
    {
      p: [[0.012, 1.374, 0.106], [0.117, 1.279, 0.011], [0.234, 1.164, -0.075], [0.258, 1.071, -0.125], [0.206, 1.019, -0.077]],
      w: [0.081, 0.099, 0.088, 0.053, 0.002],
      m: manePurple,
    },
  ];
  for (const item of maneLocks) {
    lock(root, item.p, item.w, item.m, 0.66, [1, 0, 0]);
  }
  lock(
    root,
    [[0.087, 1.598, 0.318], [0.20, 1.466, 0.287], [0.293, 1.309, 0.254], [0.271, 1.208, 0.26], [0.224, 1.168, 0.275]],
    [0.026, 0.040, 0.037, 0.026, 0.002],
    maneMint,
    0.45,
    [1, 0, 0]
  );
  lock(
    root,
    [[0.107, 1.380, 0.125], [0.24, 1.267, 0.069], [0.309, 1.151, 0.012], [0.27, 1.087, 0.04]],
    [0.02, 0.031, 0.028, 0.002],
    maneRose,
    0.5,
    [1, 0, 0]
  );

  // A lifted root and curling tip keep the tail clear of the hind legs.
  lock(
    root,
    [[0, 1.084, -0.66], [-0.085, 1.064, -0.835], [-0.263, 0.872, -1.024], [-0.397, 0.589, -1.05], [-0.51, 0.365, -0.933], [-0.599, 0.391, -0.806]],
    [0.078, 0.111, 0.143, 0.145, 0.094, 0.002],
    maneDark,
    0.8,
    [0, 0, 1],
    22
  );
  lock(
    root,
    [[0.007, 1.108, -0.715], [-0.05, 1.057, -0.879], [-0.218, 0.846, -1.107], [-0.352, 0.56, -1.113], [-0.48, 0.34, -0.98], [-0.589, 0.39, -0.814]],
    [0.046, 0.077, 0.096, 0.093, 0.069, 0.002],
    maneLight,
    0.54,
    [0, 0, 1],
    20
  );
  lock(
    root,
    [[-0.035, 1.11, -0.712], [-0.145, 1.057, -0.854], [-0.345, 0.848, -1.015], [-0.485, 0.565, -1.016], [-0.559, 0.381, -0.887]],
    [0.033, 0.062, 0.072, 0.066, 0.002],
    manePurple,
    0.7,
    [0, 0, 1],
    20
  );
  lock(
    root,
    [[-0.025, 1.125, -0.738], [-0.115, 1.044, -0.923], [-0.297, 0.834, -1.139], [-0.436, 0.559, -1.118], [-0.512, 0.405, -0.98]],
    [0.02, 0.032, 0.041, 0.038, 0.002],
    maneMint,
    0.5,
    [0, 0, 1],
    20
  );
  lock(
    root,
    [[-0.106, 1.05, -0.79], [-0.285, 0.873, -0.937], [-0.424, 0.615, -0.967], [-0.543, 0.424, -0.879]],
    [0.022, 0.039, 0.040, 0.002],
    maneRose,
    0.6
  );

  // The slightly downward-tilted head retains a long horse muzzle.
  const head = new THREE.Group();
  head.position.set(0, 1.515, 0.578);
  head.rotation.set(0.24, 0, -0.028);
  root.add(head);

  ellipsoid(head, softIco, coat, [0, 0, 0], [0.198, 0.207, 0.232]);
  ellipsoid(head, softIco, coat, [0, -0.039, 0.21], [0.157, 0.143, 0.25]);
  for (const s of [-1, 1]) {
    ellipsoid(head, ico, coat, [s * 0.11, -0.06, 0.086], [0.104, 0.139, 0.149]);
  }
  ellipsoid(head, ico, lightCoat, [0, -0.137, 0.355], [0.13, 0.075, 0.132]);
  ellipsoid(head, softIco, muzzleMat, [0, -0.056, 0.404], [0.178, 0.118, 0.146]);

  // Tall leaf-shaped ears, each with a recessed pink inner plane.
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(s * 0.133, 0.178, -0.071);
    ear.rotation.z = -s * (s === 1 ? 0.27 : 0.21);
    ear.rotation.x = -0.08;
    head.add(ear);
    ellipsoid(ear, leafGeo, coat, [0, 0.12, 0], [0.078, 0.177, 0.05]);
    ellipsoid(ear, leafGeo, innerEar, [0, 0.137, 0.038], [0.047, 0.124, 0.016]);
    ellipsoid(ear, leafGeo, earLight, [0, 0.117, 0.05], [0.026, 0.079, 0.008]);
    ellipsoid(ear, ico, lightCoat, [0, 0.003, 0.018], [0.057, 0.058, 0.048]);
  }

  // Dark, forward-looking eyes with a teal crescent and two crisp catchlights.
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(s * 0.178, 0.026, 0.14);
    eye.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(s * 0.875, 0.05, 0.483).normalize()
    );
    head.add(eye);

    ellipsoid(eye, round, coolCoat, [0, 0, 0], [0.086, 0.103, 0.032]);
    ellipsoid(eye, eyeGeo, eyeDark, [0, 0, 0.019], [0.073, 0.088, 0.026]);
    ellipsoid(eye, eyeGeo, irisMat, [0, -0.015, 0.039], [0.052, 0.062, 0.014]);
    ellipsoid(eye, eyeGeo, eyeDark, [0, 0.006, 0.046], [0.043, 0.064, 0.014]);
    ellipsoid(eye, round, eyeWhite, [-0.022, 0.037, 0.060], [0.019, 0.023, 0.007]);
    ellipsoid(eye, round, eyeWhite, [0.021, -0.029, 0.062], [0.008, 0.010, 0.005]);

    line(
      eye,
      [[-0.069, 0.034, 0.026], [-0.045, 0.079, 0.03], [0.002, 0.089, 0.03], [0.049, 0.068, 0.029]],
      0.0065,
      eyeDark,
      12
    );
    line(
      eye,
      [[-0.06, 0.123, 0.0], [-0.02, 0.135, 0.006], [0.026, 0.13, 0.003]],
      0.008,
      coat,
      8
    );

    const cheek = new THREE.Group();
    cheek.position.set(s * 0.153, -0.06, 0.261);
    cheek.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(s * 0.93, 0, 0.36).normalize()
    );
    head.add(cheek);
    ellipsoid(cheek, ico, blush, [0, 0, 0], [0.044, 0.028, 0.01]);

    const nostril = new THREE.Group();
    nostril.position.set(s * 0.105, -0.024, 0.514);
    nostril.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(s * 0.38, 0.17, 0.91).normalize()
    );
    head.add(nostril);
    ellipsoid(nostril, round, mouthMat, [0, 0, 0], [0.034, 0.023, 0.01], [0, 0, s * 0.34]);
    ellipsoid(nostril, round, nostrilMat, [0, 0.003, 0.007], [0.025, 0.014, 0.007], [0, 0, s * 0.34]);

    for (let i = 0; i < 3; i++) {
      ellipsoid(
        head,
        ico,
        mouthMat,
        [s * (0.128 + i * 0.007), -0.060 - i * 0.017, 0.494 - i * 0.007],
        [0.0045, 0.0045, 0.003]
      );
    }
  }

  line(
    head,
    [[-0.125, -0.085, 0.492], [-0.075, -0.113, 0.519], [0, -0.124, 0.524], [0.075, -0.113, 0.519], [0.125, -0.085, 0.492]],
    0.005,
    mouthMat,
    22
  );

  // A small natural blaze down the bridge of the nose.
  ellipsoid(
    head,
    diamondGeo,
    lightCoat,
    [0, 0.07, 0.312],
    [0.034, 0.098, 0.012],
    [-0.74, 0, 0]
  );

  // Chunky forelock parts around the horn.
  ellipsoid(head, ico, maneDark, [0, 0.17, -0.035], [0.163, 0.075, 0.153]);
  lock(
    head,
    [[-0.105, 0.179, -0.093], [-0.13, 0.213, 0.035], [-0.132, 0.154, 0.165], [-0.072, 0.066, 0.247], [-0.029, 0.046, 0.259]],
    [0.055, 0.076, 0.066, 0.036, 0.002],
    manePurple,
    0.6
  );
  lock(
    head,
    [[0.025, 0.222, -0.098], [0.12, 0.226, 0.012], [0.16, 0.167, 0.135], [0.138, 0.083, 0.216], [0.107, 0.062, 0.217]],
    [0.061, 0.082, 0.067, 0.036, 0.002],
    maneLight,
    0.66
  );
  lock(
    head,
    [[-0.09, 0.228, -0.051], [-0.112, 0.242, 0.053], [-0.116, 0.171, 0.177], [-0.067, 0.084, 0.239]],
    [0.019, 0.027, 0.028, 0.001],
    maneMint,
    0.5
  );

  // The single tapered horn carries a real raised helical ridge.
  const horn = new THREE.Group();
  horn.position.set(0, 0.182, 0.143);
  horn.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 1, -0.05).normalize()
  );
  head.add(horn);

  const hornCore = new THREE.Mesh(
    new THREE.ConeGeometry(0.067, 0.374, 9, 1),
    gold
  );
  hornCore.position.y = 0.195;
  horn.add(hornCore);

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.066, 0.010, 5, 12),
    goldLight
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.012;
  horn.add(collar);

  const spiral: V[] = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const angle = t * Math.PI * 2 * 4.05;
    const r = 0.066 * (1 - t) + 0.0015;
    spiral.push([
      Math.cos(angle) * r,
      0.015 + t * 0.363,
      Math.sin(angle) * r,
    ]);
  }
  line(horn, spiral, 0.0048, goldLight, 112);

  // Restrained little magical birthmarks on the haunches.
  for (const s of [-1, 1]) {
    const mark = new THREE.Group();
    mark.position.set(s * 0.274, 1.055, -0.443);
    mark.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(s, 0.08, 0).normalize()
    );
    root.add(mark);
    ellipsoid(mark, diamondGeo, goldLight, [0, 0, 0], [0.025, 0.067, 0.007]);
    ellipsoid(mark, diamondGeo, goldLight, [0, 0, 0.001], [0.056, 0.023, 0.007]);
    ellipsoid(mark, diamondGeo, maneLight, [0.069, 0.055, -0.012], [0.013, 0.025, 0.006]);
    ellipsoid(mark, ico, goldLight, [-0.056, -0.065, -0.008], [0.010, 0.010, 0.005]);
  }

  // About 1.13 m at the withers: a foal rather than a miniature adult.
  root.scale.setScalar(0.88);
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return root;
}
