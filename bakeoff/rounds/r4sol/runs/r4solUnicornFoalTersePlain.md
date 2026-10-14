```ts
import * as THREE from "three";

export const meta = {
  name: "Moonpetal, the Unicorn Foal",
  description:
    "A long-legged ivory unicorn foal with oversized ears, sea-glass eyes, a golden spiral horn, and a softly curling pastel mane and tail."
};

export default function (): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Moonpetal";
  type P = [number, number, number];

  const palette = {
    coat: "#eee8e2",
    cream: "#fff4e7",
    shadow: "#d9cedf",
    lilac: "#aa98d3",
    lavender: "#cbbbea",
    deepMane: "#80709f",
    pinkMane: "#e3b0c8",
    mint: "#a9d7ce",
    blush: "#e9b9c0",
    innerEar: "#cf91aa",
    hoof: "#726079",
    hoofRim: "#aa91ac",
    sole: "#51465d",
    outline: "#413348",
    white: "#fffaf0",
    irisEdge: "#327e85",
    iris: "#6bc7bb",
    pupil: "#172c37",
    nostril: "#80616f",
    horn: "#f9e6bd",
    gold: "#d5ac60",
    birthmark: "#ead5a5"
  };

  const materials = {} as Record<keyof typeof palette, THREE.MeshStandardMaterial>;
  for (const key of Object.keys(palette) as (keyof typeof palette)[]) {
    materials[key] = new THREE.MeshStandardMaterial({
      color: palette[key],
      roughness: key === "pupil" || key === "iris" ? 0.28 : 0.72,
      metalness: key === "gold" ? 0.38 : key === "horn" ? 0.12 : 0,
      flatShading: true
    });
  }
  type M = keyof typeof palette;

  const round = new THREE.SphereGeometry(1, 12, 8);
  const smallRound = new THREE.SphereGeometry(1, 8, 6);
  const faceted = new THREE.IcosahedronGeometry(1, 1);
  const diamond = new THREE.OctahedronGeometry(1, 0);
  const up = new THREE.Vector3(0, 1, 0);
  const forward = new THREE.Vector3(0, 0, 1);
  const vec = (p: P) => new THREE.Vector3(...p);

  function mesh(
    geometry: THREE.BufferGeometry,
    material: M,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const result = new THREE.Mesh(geometry, materials[material]);
    result.castShadow = true;
    result.receiveShadow = true;
    parent.add(result);
    return result;
  }

  function ellipsoid(
    material: M,
    position: P,
    scale: P,
    parent: THREE.Object3D = root,
    geometry: THREE.BufferGeometry = round
  ): THREE.Mesh {
    const result = mesh(geometry, material, parent);
    result.position.set(...position);
    result.scale.set(...scale);
    return result;
  }

  function taper(
    a: P,
    b: P,
    radiusA: number,
    radiusB: number,
    material: M,
    parent: THREE.Object3D = root,
    sides = 8
  ): THREE.Mesh {
    const start = vec(a);
    const end = vec(b);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const result = mesh(
      new THREE.CylinderGeometry(radiusB, radiusA, length, sides, 1),
      material,
      parent
    );
    result.position.copy(start.add(end).multiplyScalar(0.5));
    result.quaternion.setFromUnitVectors(up, direction.normalize());
    return result;
  }

  function curve(
    points: P[],
    radius: number,
    material: M,
    parent: THREE.Object3D = root,
    segments = 24
  ) {
    const path = new THREE.CatmullRomCurve3(points.map(vec));
    return mesh(new THREE.TubeGeometry(path, segments, radius, 5, false), material, parent);
  }

  // A lock consists of chunky tapered primitives, flattened into a soft ribbon.
  function lock(
    points: P[],
    radii: number[],
    material: M,
    flatten = 0.6,
    normal: P = [1, 0, 0]
  ) {
    const preferredNormal = vec(normal).normalize();
    for (let i = 0; i < points.length - 1; i++) {
      const a = vec(points[i]);
      const b = vec(points[i + 1]);
      const direction = b.clone().sub(a);
      const length = direction.length();
      direction.normalize();

      const xAxis = preferredNormal.clone()
        .addScaledVector(direction, -preferredNormal.dot(direction))
        .normalize();
      const zAxis = new THREE.Vector3().crossVectors(xAxis, direction).normalize();
      const basis = new THREE.Matrix4().makeBasis(xAxis, direction, zAxis);
      const rotation = new THREE.Quaternion().setFromRotationMatrix(basis);

      const part = mesh(
        new THREE.CylinderGeometry(radii[i + 1], radii[i], length, 7, 1),
        material
      );
      part.position.copy(a.clone().add(b).multiplyScalar(0.5));
      part.quaternion.copy(rotation);
      part.scale.x = flatten;

      const joint = ellipsoid(
        material,
        points[i],
        [radii[i] * flatten, radii[i], radii[i]],
        root,
        smallRound
      );
      joint.quaternion.copy(rotation);
    }
    const n = points.length - 1;
    ellipsoid(
      material,
      points[n],
      [radii[n] * flatten, radii[n], radii[n]],
      root,
      smallRound
    );
  }

  function lockHighlight(
    points: P[],
    radii: number[],
    material: M,
    flatten: number,
    normal: P = [1, 0, 0]
  ) {
    const n = vec(normal).normalize();
    const shifted = points.map((p, i) =>
      vec(p).addScaledVector(n, radii[i] * flatten * 0.88).toArray() as P
    );
    lock(
      shifted,
      radii.map(r => Math.max(0.0025, r * 0.19)),
      material,
      0.55,
      normal
    );
  }

  // Short, compact baby body and softly angular haunches.
  ellipsoid("coat", [0, 0.95, -0.14], [0.268, 0.289, 0.526]);
  ellipsoid("coat", [0, 0.954, -0.49], [0.269, 0.284, 0.30]);
  ellipsoid("coat", [0, 0.975, 0.238], [0.243, 0.296, 0.274]);
  ellipsoid("shadow", [0, 0.772, -0.115], [0.207, 0.137, 0.402]);
  ellipsoid("cream", [0, 0.922, 0.347], [0.19, 0.23, 0.148]);

  // The long upright neck is narrower than the head, as on a very young foal.
  taper([0, 1.025, 0.258], [0, 1.455, 0.523], 0.188, 0.134, "coat", root, 9);
  const neck = ellipsoid("coat", [0, 1.247, 0.397], [0.156, 0.298, 0.181]);
  neck.rotation.x = 0.43;
  const throat = ellipsoid("cream", [0, 1.232, 0.503], [0.111, 0.225, 0.092]);
  throat.rotation.x = 0.43;

  function hoof(x: number, z: number) {
    const foot = mesh(new THREE.CylinderGeometry(0.069, 0.087, 0.116, 8), "hoof");
    foot.position.set(x, 0.07, z);
    foot.scale.z = 1.3;

    const bottom = mesh(new THREE.CylinderGeometry(0.086, 0.089, 0.022, 8), "sole");
    bottom.position.set(x, 0.011, z + 0.003);
    bottom.scale.z = 1.3;

    const rim = mesh(new THREE.CylinderGeometry(0.07, 0.074, 0.013, 8), "hoofRim");
    rim.position.set(x, 0.123, z - 0.001);
    rim.scale.z = 1.24;
  }

  // All four feet are planted. Small stance offsets keep the legs distinct.
  for (const side of [-1, 1]) {
    const advance = side === 1 ? 0.028 : -0.012;
    const shoulder: P = [side * 0.181, 0.98, 0.23 + advance];
    const knee: P = [side * 0.205, 0.554, 0.294 + advance];
    const ankle: P = [side * 0.229, 0.166, 0.337 + advance];

    ellipsoid("coat", shoulder, [0.101, 0.163, 0.115]);
    taper(shoulder, knee, 0.084, 0.06, "coat");
    ellipsoid("coat", knee, [0.076, 0.086, 0.075], root, faceted);
    taper(knee, ankle, 0.055, 0.041, "coat", root, 7);
    taper(
      [side * 0.222, 0.275, 0.327 + advance],
      ankle,
      0.045,
      0.052,
      "shadow",
      root,
      7
    );
    ellipsoid("cream", ankle, [0.072, 0.067, 0.079], root, faceted);
    taper(
      [side * 0.229, 0.207, 0.291 + advance],
      [side * 0.23, 0.128, 0.26 + advance],
      0.032,
      0.005,
      "cream",
      root,
      5
    );
    hoof(side * 0.231, 0.345 + advance);

    const rearShift = side === 1 ? -0.025 : 0.018;
    const hip: P = [side * 0.191, 0.967, -0.478 + rearShift];
    const stifle: P = [side * 0.229, 0.67, -0.349 + rearShift];
    const hock: P = [side * 0.241, 0.408, -0.564 + rearShift];
    const rearAnkle: P = [side * 0.248, 0.163, -0.541 + rearShift];

    ellipsoid("coat", hip, [0.112, 0.158, 0.135]);
    taper(hip, stifle, 0.108, 0.069, "coat");
    ellipsoid("coat", stifle, [0.077, 0.084, 0.084], root, faceted);
    taper(stifle, hock, 0.066, 0.047, "coat", root, 7);
    ellipsoid("coat", hock, [0.063, 0.073, 0.069], root, faceted);
    taper(hock, rearAnkle, 0.044, 0.038, "coat", root, 7);
    taper(
      [side * 0.246, 0.265, -0.55 + rearShift],
      rearAnkle,
      0.04,
      0.05,
      "shadow",
      root,
      7
    );
    ellipsoid("cream", rearAnkle, [0.069, 0.063, 0.074], root, faceted);
    taper(
      [side * 0.248, 0.195, -0.586 + rearShift],
      [side * 0.248, 0.126, -0.617 + rearShift],
      0.026,
      0.004,
      "cream",
      root,
      5
    );
    hoof(side * 0.249, -0.524 + rearShift);
  }

  // Broad baby forehead, long equine bridge, and a small velvety muzzle.
  const skull = ellipsoid("coat", [0, 1.493, 0.627], [0.21, 0.243, 0.231]);
  skull.rotation.x = -0.12;
  ellipsoid("coat", [0, 1.331, 0.79], [0.158, 0.139, 0.199]);
  taper([0, 1.493, 0.72], [0, 1.329, 0.967], 0.143, 0.125, "coat", root, 9);
  const bridge = ellipsoid("cream", [0, 1.451, 0.855], [0.13, 0.125, 0.193]);
  bridge.rotation.x = 0.56;
  ellipsoid("coat", [0, 1.273, 0.895], [0.132, 0.095, 0.169]);
  ellipsoid("cream", [0, 1.313, 1.004], [0.164, 0.114, 0.173]);
  ellipsoid("cream", [0, 1.257, 1.034], [0.125, 0.044, 0.116]);

  // Tall, splayed, triangular foal ears with inset pink interiors.
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    root.add(ear);
    ear.position.set(side * 0.129, 1.676, 0.556);
    ear.rotation.z = -side * 0.24;
    ear.rotation.x = 0.12;

    ellipsoid("coat", [0, 0.018, 0], [0.084, 0.077, 0.06], ear, smallRound);

    const outer = mesh(new THREE.ConeGeometry(0.095, 0.31, 4), "cream", ear);
    outer.position.y = 0.14;
    outer.rotation.y = Math.PI / 4;
    outer.scale.set(0.94, 1, 0.58);

    const inset = mesh(new THREE.ConeGeometry(0.07, 0.218, 4), "blush", ear);
    inset.position.set(0, 0.132, 0.039);
    inset.rotation.y = Math.PI / 4;
    inset.scale.set(0.91, 1, 0.18);

    const inner = mesh(new THREE.ConeGeometry(0.046, 0.163, 4), "innerEar", ear);
    inner.position.set(0, 0.115, 0.048);
    inner.rotation.y = Math.PI / 4;
    inner.scale.set(0.88, 1, 0.12);
  }

  // Eyes sit on the forward-facing sides of the head rather than on the muzzle.
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.176, 1.53, 0.755);
    eye.quaternion.setFromUnitVectors(
      forward,
      new THREE.Vector3(side * 0.83, 0.08, 0.552).normalize()
    );
    root.add(eye);

    ellipsoid("outline", [0, 0, 0], [0.091, 0.105, 0.028], eye);
    ellipsoid("white", [0, -0.004, 0.014], [0.079, 0.091, 0.025], eye);
    const gaze = -side * 0.015;
    ellipsoid("irisEdge", [gaze, -0.004, 0.036], [0.06, 0.073, 0.016], eye);
    ellipsoid("iris", [gaze, -0.004, 0.045], [0.051, 0.065, 0.012], eye);
    ellipsoid("pupil", [gaze, -0.003, 0.059], [0.029, 0.05, 0.009], eye);
    ellipsoid("white", [gaze - 0.015, 0.025, 0.071], [0.014, 0.017, 0.006], eye, smallRound);
    ellipsoid("white", [gaze + 0.014, -0.025, 0.07], [0.0065, 0.0075, 0.004], eye, smallRound);

    curve(
      [[-0.072, 0.076, 0.02], [0, 0.104, 0.025], [0.073, 0.073, 0.02]],
      0.011,
      "cream",
      eye,
      10
    );
    taper(
      [side * 0.068, 0.073, 0.016],
      [side * 0.095, 0.096, 0.024],
      0.0055,
      0.001,
      "outline",
      eye,
      5
    );
    taper(
      [side * 0.05, 0.088, 0.017],
      [side * 0.068, 0.117, 0.022],
      0.0045,
      0.0008,
      "outline",
      eye,
      5
    );

    const cheek = ellipsoid("blush", [side * 0.183, 1.409, 0.753], [0.044, 0.023, 0.006]);
    cheek.quaternion.setFromUnitVectors(
      forward,
      new THREE.Vector3(side * 0.86, -0.05, 0.51).normalize()
    );

    const nose = new THREE.Group();
    nose.position.set(side * 0.109, 1.335, 1.132);
    nose.quaternion.setFromUnitVectors(
      forward,
      new THREE.Vector3(side * 0.4, 0.15, 0.905).normalize()
    );
    root.add(nose);
    const rim = ellipsoid("blush", [0, 0, 0], [0.043, 0.028, 0.009], nose);
    rim.rotation.z = -side * 0.3;
    const opening = ellipsoid("nostril", [0, 0.002, 0.007], [0.026, 0.016, 0.007], nose);
    opening.rotation.z = -side * 0.3;

    ellipsoid("birthmark", [side * 0.068, 1.366, 1.15], [0.008, 0.006, 0.004], root, smallRound);
    ellipsoid("birthmark", [side * 0.047, 1.38, 1.143], [0.005, 0.004, 0.003], root, smallRound);
  }

  curve(
    [
      [-0.105, 1.282, 1.128],
      [-0.056, 1.271, 1.158],
      [0, 1.268, 1.168],
      [0.056, 1.271, 1.158],
      [0.105, 1.282, 1.128]
    ],
    0.0033,
    "nostril",
    root,
    20
  );

  // Swept-back mane crest and overlapping scalloped locks.
  lock(
    [[0, 1.633, 0.459], [0.012, 1.535, 0.325], [0.025, 1.355, 0.19],
      [0.025, 1.184, 0.075], [0.041, 1.092, -0.025]],
    [0.08, 0.11, 0.112, 0.1, 0.028],
    "deepMane",
    0.95
  );

  const maneLocks: { points: P[]; radii: number[]; color: M; stripe?: M }[] = [
    {
      points: [[0.086, 1.618, 0.466], [0.171, 1.518, 0.386], [0.215, 1.413, 0.403],
        [0.247, 1.315, 0.471], [0.251, 1.244, 0.455], [0.224, 1.213, 0.39]],
      radii: [0.066, 0.088, 0.09, 0.083, 0.048, 0.005],
      color: "lilac",
      stripe: "lavender"
    },
    {
      points: [[0.05, 1.532, 0.321], [0.133, 1.411, 0.236], [0.193, 1.28, 0.292],
        [0.248, 1.175, 0.357], [0.248, 1.097, 0.324], [0.211, 1.067, 0.25]],
      radii: [0.069, 0.095, 0.096, 0.083, 0.041, 0.004],
      color: "pinkMane",
      stripe: "cream"
    },
    {
      points: [[0.024, 1.385, 0.184], [0.112, 1.275, 0.114], [0.216, 1.149, 0.17],
        [0.277, 1.047, 0.151], [0.27, 0.986, 0.071], [0.233, 1.001, 0.006]],
      radii: [0.075, 0.099, 0.102, 0.083, 0.042, 0.005],
      color: "lilac",
      stripe: "lavender"
    },
    {
      points: [[0.017, 1.262, 0.084], [0.124, 1.135, -0.001], [0.227, 1.032, 0.001],
        [0.28, 0.993, -0.065], [0.263, 1.01, -0.141]],
      radii: [0.061, 0.091, 0.085, 0.045, 0.004],
      color: "lavender"
    },
    {
      points: [[-0.035, 1.594, 0.383], [-0.091, 1.454, 0.271], [-0.121, 1.313, 0.199],
        [-0.137, 1.195, 0.153], [-0.127, 1.149, 0.096]],
      radii: [0.043, 0.061, 0.063, 0.043, 0.004],
      color: "lavender"
    }
  ];
  for (const part of maneLocks) {
    lock(part.points, part.radii, part.color, 0.52);
    if (part.stripe) lockHighlight(part.points, part.radii, part.stripe, 0.52);
  }

  // A broad curled forelock frames the horn without hiding either eye.
  const forelock: P[] = [
    [-0.116, 1.663, 0.571], [-0.06, 1.704, 0.654], [0.066, 1.686, 0.724],
    [0.119, 1.628, 0.798], [0.074, 1.573, 0.85], [0.018, 1.586, 0.858]
  ];
  const foreRadii = [0.064, 0.079, 0.075, 0.06, 0.032, 0.004];
  lock(forelock, foreRadii, "lilac", 0.62, [0, 0, 1]);
  lockHighlight(forelock, foreRadii, "lavender", 0.62, [0, 0, 1]);

  lock(
    [[-0.109, 1.683, 0.594], [-0.038, 1.73, 0.645], [0.066, 1.705, 0.709],
      [0.128, 1.653, 0.765], [0.12, 1.613, 0.809]],
    [0.021, 0.031, 0.029, 0.02, 0.003],
    "pinkMane",
    0.6,
    [0, 0, 1]
  );
  lock(
    [[-0.142, 1.64, 0.548], [-0.177, 1.583, 0.579], [-0.163, 1.54, 0.635]],
    [0.032, 0.031, 0.003],
    "mint",
    0.65,
    [0, 0, 1]
  );

  // Young, slender horn with a real raised spiral winding around its facets.
  const hornBase = new THREE.Vector3(0, 1.687, 0.769);
  const hornDirection = new THREE.Vector3(0, 0.985, 0.173).normalize();
  const hornLength = 0.335;
  const hornTip = hornBase.clone().addScaledVector(hornDirection, hornLength);
  taper(hornBase.toArray() as P, hornTip.toArray() as P, 0.064, 0, "horn", root, 9);

  const collar = mesh(new THREE.CylinderGeometry(0.069, 0.073, 0.023, 10), "gold");
  collar.position.copy(hornBase.clone().addScaledVector(hornDirection, 0.008));
  collar.quaternion.setFromUnitVectors(up, hornDirection);

  const spiralPoints: THREE.Vector3[] = [];
  const radialX = new THREE.Vector3(1, 0, 0);
  const radialZ = new THREE.Vector3(0, -hornDirection.z, hornDirection.y);
  for (let i = 0; i <= 88; i++) {
    const t = i / 88;
    const angle = t * Math.PI * 2 * 4.1 + 0.4;
    const radius = 0.064 * (1 - t) + 0.002;
    spiralPoints.push(
      hornBase.clone()
        .addScaledVector(hornDirection, t * hornLength)
        .addScaledVector(radialX, Math.cos(angle) * radius)
        .addScaledVector(radialZ, Math.sin(angle) * radius)
    );
  }
  mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiralPoints), 88, 0.0038, 5, false),
    "gold"
  );

  // A little sea-glass jewel is set into the front of the horn's basal ring.
  const hornJewel = ellipsoid(
    "iris",
    [0, 1.688, 0.844],
    [0.014, 0.018, 0.009],
    root,
    diamond
  );
  hornJewel.rotation.x = -0.12;

  // Tail arches clear of the hind legs, then drops into a loose, upturned curl.
  taper([0, 1.003, -0.698], [0.014, 1.04, -0.842], 0.065, 0.049, "coat");
  ellipsoid("deepMane", [0.014, 1.039, -0.844], [0.097, 0.085, 0.115], root, faceted);

  const tailPath: P[] = [
    [0.012, 1.047, -0.818],
    [0.062, 1.008, -0.923],
    [0.102, 0.881, -1.028],
    [0.125, 0.701, -1.103],
    [0.132, 0.504, -1.137],
    [0.091, 0.343, -1.116],
    [0.007, 0.277, -1.039],
    [-0.052, 0.326, -0.999]
  ];
  const tailRadii = [0.079, 0.102, 0.114, 0.116, 0.099, 0.071, 0.037, 0.004];
  lock(tailPath, tailRadii, "deepMane", 0.95);

  const tailVariants: {
    offset: number;
    zOffset: number;
    yOffset: number;
    color: M;
    stripe?: M;
    size: number;
  }[] = [
    { offset: 0.072, zOffset: 0.012, yOffset: 0.003, color: "lilac", stripe: "lavender", size: 0.82 },
    { offset: -0.065, zOffset: 0.004, yOffset: 0.034, color: "pinkMane", size: 0.79 },
    { offset: 0.117, zOffset: 0.051, yOffset: 0.045, color: "lavender", size: 0.58 },
    { offset: -0.106, zOffset: 0.04, yOffset: 0.067, color: "lilac", stripe: "pinkMane", size: 0.56 },
    { offset: 0.134, zOffset: -0.025, yOffset: 0.083, color: "mint", size: 0.35 }
  ];
  for (const variant of tailVariants) {
    const points = tailPath.map((p, i) => {
      const spread = Math.sin((i / (tailPath.length - 1)) * Math.PI * 0.72);
      return [
        p[0] + variant.offset * spread,
        p[1] + variant.yOffset * spread,
        p[2] + variant.zOffset * spread
      ] as P;
    });
    const radii = tailRadii.map(r => Math.max(0.003, r * variant.size));
    lock(points, radii, variant.color, 0.75);
    if (variant.stripe) lockHighlight(points, radii, variant.stripe, 0.75);
  }

  // Subtle star-shaped birthmarks and a few warm freckles on the haunches.
  function flankSurface(side: number, y: number, z: number) {
    const dy = (y - 0.954) / 0.284;
    const dz = (z + 0.49) / 0.30;
    const x = side * (0.269 * Math.sqrt(Math.max(0.05, 1 - dy * dy - dz * dz)) + 0.003);
    const normal = new THREE.Vector3(
      x / (0.269 * 0.269),
      (y - 0.954) / (0.284 * 0.284),
      (z + 0.49) / (0.30 * 0.30)
    ).normalize();
    return { position: new THREE.Vector3(x, y, z), normal };
  }

  for (const side of [-1, 1]) {
    const site = flankSurface(side, 1.057, -0.477);
    const mark = new THREE.Group();
    mark.position.copy(site.position);
    mark.quaternion.setFromUnitVectors(forward, site.normal);
    root.add(mark);
    ellipsoid("birthmark", [0, 0, 0], [0.015, 0.049, 0.0035], mark, diamond);
    ellipsoid("birthmark", [0, 0, 0.0005], [0.035, 0.015, 0.0035], mark, diamond);

    const freckles: [number, number, number][] = [
      [1.094, -0.56, 0.012],
      [1.032, -0.579, 0.008],
      [0.982, -0.584, 0.011],
      [1.119, -0.429, 0.007],
      [1.012, -0.391, 0.009]
    ];
    for (const [y, z, size] of freckles) {
      const surface = flankSurface(side, y, z);
      const dot = ellipsoid(
        "birthmark",
        surface.position.toArray() as P,
        [size, size * 0.8, 0.003],
        root,
        smallRound
      );
      dot.quaternion.setFromUnitVectors(forward, surface.normal);
    }
  }

  // Approximately one metre at the withers; all four soles remain at y = 0.
  root.scale.setScalar(0.88);
  return root;
}
```