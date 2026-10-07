```ts
import * as THREE from "three";

export const meta = {
  name: "Copperleaf Red Panda",
  description:
    "A little copper-red panda with a cream face mask, dark stocking legs, pointed fluffy ears, and a generously curled, ringed tail.",
};

type XYZ = [number, number, number];

export default function (): THREE.Object3D {
  const panda = new THREE.Group();
  panda.name = "Red panda";
  panda.scale.setScalar(0.9);

  const material = (
    color: string,
    roughness = 0.88,
    flatShading = true
  ): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color, roughness, flatShading });

  const coat = material("#b94d28");
  const shoulderCoat = material("#cb6230");
  const lightCoat = material("#d8773c");
  const rumpCoat = material("#a64024");
  const tailDark = material("#a34225");
  const tailLight = material("#df9953");
  const cream = material("#f3dfba");
  const innerEar = material("#c69b77");
  const darkFur = material("#29201c");
  const softDark = material("#382923");
  const faceDark = material("#573026");
  const eyeBrown = material("#633b27", 0.33, false);
  const black = material("#171211", 0.22, false);
  const glint = material("#fff6e1", 0.2, false);
  const noseShine = material("#776258", 0.38);
  const claw = material("#938172", 0.65);

  const bodyBall = new THREE.SphereGeometry(1, 14, 10);
  const headBall = new THREE.SphereGeometry(1, 16, 10);
  const smallBall = new THREE.SphereGeometry(1, 10, 7);
  const tinyBall = new THREE.SphereGeometry(1, 8, 5);
  const eyeBall = new THREE.SphereGeometry(1, 12, 8);
  const up = new THREE.Vector3(0, 1, 0);

  function ellipsoid(
    parent: THREE.Object3D,
    mat: THREE.MeshStandardMaterial,
    position: XYZ,
    scale: XYZ,
    geometry: THREE.BufferGeometry = smallBall
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }

  function taper(
    parent: THREE.Object3D,
    mat: THREE.MeshStandardMaterial,
    start: XYZ,
    end: XYZ,
    startRadius: number,
    endRadius: number,
    sides = 6,
    flatten = 1
  ): THREE.Mesh {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const geometry = new THREE.CylinderGeometry(
      endRadius,
      startRadius,
      direction.length(),
      sides,
      1
    );
    geometry.scale(1, 1, flatten);
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(up, direction.normalize());
    parent.add(mesh);
    return mesh;
  }

  function stroke(
    parent: THREE.Object3D,
    mat: THREE.MeshStandardMaterial,
    points: XYZ[],
    radius: number
  ): THREE.Mesh {
    const curve = new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(...point))
    );
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 8, radius, 5, false),
      mat
    );
    parent.add(mesh);
    return mesh;
  }

  // The coat is assembled as a few generous, faceted puppet shapes.
  ellipsoid(
    panda,
    darkFur,
    [0, 0.222, -0.078],
    [0.162, 0.119, 0.245],
    bodyBall
  );
  ellipsoid(
    panda,
    coat,
    [0, 0.289, -0.087],
    [0.187, 0.179, 0.285],
    bodyBall
  );
  ellipsoid(
    panda,
    rumpCoat,
    [0, 0.302, -0.237],
    [0.178, 0.156, 0.169],
    bodyBall
  );
  ellipsoid(
    panda,
    shoulderCoat,
    [0, 0.313, 0.082],
    [0.169, 0.155, 0.154],
    bodyBall
  );
  ellipsoid(
    panda,
    shoulderCoat,
    [0, 0.344, 0.189],
    [0.145, 0.128, 0.123],
    bodyBall
  );
  ellipsoid(
    panda,
    darkFur,
    [0, 0.263, 0.188],
    [0.127, 0.116, 0.082],
    bodyBall
  );

  // Four distinct, weight-bearing legs; every paw has a flat floor contact.
  for (const side of [-1, 1]) {
    const x = side * 0.151;

    ellipsoid(
      panda,
      shoulderCoat,
      [side * 0.128, 0.292, 0.101],
      [0.078, 0.118, 0.097]
    );
    taper(
      panda,
      darkFur,
      [side * 0.132, 0.259, 0.112],
      [side * 0.147, 0.151, 0.147],
      0.052,
      0.044,
      8
    );
    ellipsoid(
      panda,
      darkFur,
      [side * 0.147, 0.151, 0.147],
      [0.046, 0.052, 0.046]
    );
    taper(
      panda,
      darkFur,
      [side * 0.147, 0.156, 0.147],
      [x, 0.063, 0.167],
      0.044,
      0.038,
      8
    );
    ellipsoid(
      panda,
      softDark,
      [x, 0.038, 0.194],
      [0.064, 0.038, 0.083]
    );

    ellipsoid(
      panda,
      coat,
      [side * 0.127, 0.281, -0.251],
      [0.091, 0.131, 0.119]
    );
    ellipsoid(
      panda,
      darkFur,
      [side * 0.142, 0.168, -0.265],
      [0.068, 0.102, 0.079]
    );
    taper(
      panda,
      darkFur,
      [side * 0.145, 0.178, -0.278],
      [side * 0.16, 0.063, -0.273],
      0.049,
      0.035,
      8
    );
    ellipsoid(
      panda,
      softDark,
      [side * 0.16, 0.039, -0.23],
      [0.067, 0.039, 0.088]
    );

    for (let toe = -1; toe <= 1; toe++) {
      const toeX = x + toe * 0.022;
      ellipsoid(
        panda,
        softDark,
        [toeX, 0.025, 0.253],
        [0.019, 0.025, 0.031],
        tinyBall
      );
      taper(
        panda,
        claw,
        [toeX, 0.025, 0.277],
        [toeX, 0.022, 0.291],
        0.0044,
        0.0006,
        5
      );

      const rearToeX = side * 0.16 + toe * 0.023;
      ellipsoid(
        panda,
        softDark,
        [rearToeX, 0.024, -0.169],
        [0.019, 0.024, 0.031],
        tinyBall
      );
      taper(
        panda,
        claw,
        [rearToeX, 0.024, -0.146],
        [rearToeX, 0.02, -0.133],
        0.0041,
        0.0006,
        5
      );
    }
  }

  // A few directed coat tufts, rather than a noisy fur-covered surface.
  for (const side of [-1, 1]) {
    const flankTufts = [
      [0.163, 0.342, 0.088],
      [0.181, 0.329, -0.005],
      [0.183, 0.319, -0.108],
      [0.17, 0.315, -0.215],
    ];
    flankTufts.forEach(([x, y, z], i) => {
      taper(
        panda,
        i < 2 ? lightCoat : coat,
        [side * x, y, z],
        [side * (x + 0.034), y - 0.03, z - 0.049],
        0.025,
        0,
        4,
        0.55
      );
    });
    taper(
      panda,
      lightCoat,
      [side * 0.09, 0.437, 0.129],
      [side * 0.115, 0.421, 0.062],
      0.024,
      0,
      4,
      0.55
    );
  }

  for (let i = 0; i < 4; i++) {
    const z = 0.036 - i * 0.075;
    taper(
      panda,
      i < 2 ? shoulderCoat : coat,
      [-0.014, 0.45 - i * 0.003, z],
      [-0.012, 0.453 - i * 0.003, z - 0.044],
      0.018,
      0,
      4,
      0.45
    );
  }

  // The large tail sweeps behind the haunches and out to the panda's left.
  // Each coloured sleeve is a bent low-sided cylinder, with matching edges.
  const tailCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0.018, 0.303, -0.336),
      new THREE.Vector3(0.055, 0.285, -0.433),
      new THREE.Vector3(0.165, 0.225, -0.525),
      new THREE.Vector3(0.31, 0.173, -0.559),
      new THREE.Vector3(0.445, 0.148, -0.523),
      new THREE.Vector3(0.517, 0.164, -0.42),
    ],
    false,
    "centripetal"
  );

  const tailRadius = (t: number): number =>
    0.08 * (1 - 0.94 * t * t * t) + 0.021 * Math.sin(Math.PI * t);

  const tail = new THREE.Group();
  tail.name = "Eleven copper and gold tail bands";
  panda.add(tail);

  const ringCount = 11;
  for (let ring = 0; ring < ringCount; ring++) {
    const t0 = ring / ringCount;
    const t1 = (ring + 1) / ringCount;
    const geometry = new THREE.CylinderGeometry(1, 1, 1, 12, 3, false);
    const positions = geometry.getAttribute("position") as THREE.BufferAttribute;

    for (let vertex = 0; vertex < positions.count; vertex++) {
      const localX = positions.getX(vertex);
      const localY = positions.getY(vertex);
      const localZ = positions.getZ(vertex);
      const t = t0 + (localY + 0.5) * (t1 - t0);
      const center = tailCurve.getPoint(t);
      const tangent = tailCurve.getTangent(t).normalize();
      const sideways = new THREE.Vector3().crossVectors(up, tangent).normalize();
      const vertical = new THREE.Vector3()
        .crossVectors(tangent, sideways)
        .normalize();
      const radius = tailRadius(t);
      center.addScaledVector(sideways, localX * radius);
      center.addScaledVector(vertical, localZ * radius);
      positions.setXYZ(vertex, center.x, center.y, center.z);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(
      geometry,
      ring % 2 === 0 ? tailDark : tailLight
    );
    tail.add(mesh);
  }
  const tailTip = tailCurve.getPoint(1);
  ellipsoid(
    tail,
    tailDark,
    [tailTip.x, tailTip.y, tailTip.z],
    [0.0053, 0.0053, 0.0053],
    tinyBall
  );

  // Broad, short-faced head.
  const head = new THREE.Group();
  head.name = "Cream-masked face";
  panda.add(head);
  ellipsoid(
    head,
    shoulderCoat,
    [0, 0.408, 0.251],
    [0.194, 0.147, 0.161],
    headBall
  );

  // Chunky triangular ears have an auburn back, cream rim and dark inset.
  function ear(side: number): void {
    const group = new THREE.Group();
    group.position.set(side * 0.143, 0.494, 0.233);
    group.rotation.z = -side * 0.18;
    group.rotation.x = 0.1;
    head.add(group);

    function earCone(
      mat: THREE.MeshStandardMaterial,
      radius: number,
      height: number,
      baseY: number,
      z: number,
      thickness: number
    ): void {
      const geometry = new THREE.ConeGeometry(radius, height, 4, 1);
      geometry.rotateY(Math.PI / 4);
      geometry.scale(1, 1, thickness);
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(0, baseY + height / 2, z);
      group.add(mesh);
    }

    earCone(rumpCoat, 0.09, 0.144, 0, -0.005, 0.48);
    earCone(cream, 0.08, 0.135, 0.004, 0.015, 0.43);
    earCone(darkFur, 0.055, 0.095, 0.012, 0.034, 0.37);
    earCone(innerEar, 0.028, 0.047, 0.014, 0.051, 0.3);
    ellipsoid(
      group,
      cream,
      [0, 0.016, 0.042],
      [0.043, 0.012, 0.014],
      tinyBall
    );
  }
  ear(-1);
  ear(1);

  for (const side of [-1, 1]) {
    // Rusty mane points behind the white cheek fringe.
    taper(
      head,
      coat,
      [side * 0.146, 0.395, 0.277],
      [side * 0.216, 0.374, 0.25],
      0.037,
      0,
      4,
      0.6
    );
    taper(
      head,
      shoulderCoat,
      [side * 0.151, 0.361, 0.288],
      [side * 0.213, 0.322, 0.272],
      0.033,
      0,
      4,
      0.55
    );

    const cheek = ellipsoid(
      head,
      cream,
      [side * 0.121, 0.38, 0.367],
      [0.086, 0.062, 0.038]
    );
    cheek.rotation.z = side * 0.17;

    taper(
      head,
      cream,
      [side * 0.158, 0.377, 0.348],
      [side * 0.217, 0.362, 0.328],
      0.029,
      0,
      4,
      0.5
    );
    taper(
      head,
      cream,
      [side * 0.146, 0.349, 0.347],
      [side * 0.197, 0.325, 0.328],
      0.025,
      0,
      4,
      0.5
    );

    const brow = ellipsoid(
      head,
      cream,
      [side * 0.094, 0.466, 0.373],
      [0.062, 0.027, 0.025]
    );
    brow.rotation.z = side * 0.21;

    const tearMark = ellipsoid(
      head,
      faceDark,
      [side * 0.092, 0.399, 0.394],
      [0.027, 0.044, 0.02]
    );
    tearMark.rotation.z = side * 0.25;

    const socket = ellipsoid(
      head,
      faceDark,
      [side * 0.089, 0.433, 0.391],
      [0.039, 0.032, 0.023]
    );
    socket.rotation.z = side * 0.13;

    ellipsoid(
      head,
      eyeBrown,
      [side * 0.09, 0.434, 0.411],
      [0.025, 0.024, 0.012],
      eyeBall
    );
    ellipsoid(
      head,
      black,
      [side * 0.088, 0.434, 0.419],
      [0.018, 0.02, 0.008],
      eyeBall
    );
    ellipsoid(
      head,
      glint,
      [side * 0.088 - 0.006, 0.442, 0.427],
      [0.0047, 0.0047, 0.0025],
      tinyBall
    );
    ellipsoid(
      head,
      glint,
      [side * 0.088 + 0.005, 0.429, 0.427],
      [0.0019, 0.0019, 0.0012],
      tinyBall
    );
  }

  // A narrow ginger bridge preserves the red panda's split white mask.
  ellipsoid(
    head,
    lightCoat,
    [0, 0.424, 0.399],
    [0.036, 0.055, 0.022]
  );

  ellipsoid(
    head,
    cream,
    [0, 0.324, 0.395],
    [0.065, 0.027, 0.034]
  );
  for (const side of [-1, 1]) {
    ellipsoid(
      head,
      cream,
      [side * 0.044, 0.351, 0.411],
      [0.057, 0.037, 0.03]
    );
  }
  ellipsoid(
    head,
    cream,
    [0, 0.346, 0.42],
    [0.058, 0.036, 0.031]
  );

  const nose = ellipsoid(
    head,
    black,
    [0, 0.37, 0.455],
    [0.029, 0.019, 0.015],
    tinyBall
  );
  nose.name = "Little dark nose";
  ellipsoid(
    head,
    noseShine,
    [-0.009, 0.377, 0.467],
    [0.009, 0.0032, 0.0018],
    tinyBall
  );

  stroke(
    head,
    black,
    [
      [0, 0.354, 0.456],
      [0, 0.344, 0.453],
      [0, 0.336, 0.451],
    ],
    0.0021
  );
  for (const side of [-1, 1]) {
    stroke(
      head,
      black,
      [
        [0, 0.336, 0.451],
        [side * 0.016, 0.334, 0.45],
        [side * 0.031, 0.339, 0.446],
      ],
      0.0018
    );

    // Small muzzle dots and three fine, lightly fanned whiskers.
    for (let i = 0; i < 3; i++) {
      ellipsoid(
        head,
        faceDark,
        [side * (0.049 + i * 0.008), 0.355 - (i % 2) * 0.007, 0.44],
        [0.0015, 0.0015, 0.001],
        tinyBall
      );
      taper(
        head,
        cream,
        [side * 0.064, 0.348 + i * 0.006, 0.438],
        [
          side * (0.174 + i * 0.007),
          0.332 + i * 0.021,
          0.458 - i * 0.007,
        ],
        0.001,
        0.00035,
        5
      );
    }
  }

  return panda;
}
```