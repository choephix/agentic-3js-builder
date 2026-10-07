import * as THREE from "three";

export const meta = {
  name: "Red Panda",
  description:
    "A copper-red, low-poly red panda with an ivory face, fluffy triangular ears, dark stocking legs, and a sweeping ringed tail."
};

export default function (): THREE.Object3D {
  const panda = new THREE.Group();
  panda.name = "Red panda";
  panda.scale.setScalar(0.78);

  type Vec = [number, number, number];

  const material = (color: string, roughness = 0.88) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      flatShading: true
    });

  const fur = material("#b94b29");
  const backFur = material("#cd602f");
  const brightFur = material("#df773d");
  const deepRust = material("#843822");
  const tailRust = material("#943b24");
  const tailGold = material("#dd9250");
  const darkFur = material("#342522");
  const stocking = material("#251e1d");
  const cream = material("#eee0c8");
  const ivory = material("#fff0d8");
  const earDark = material("#735047");
  const earWarm = material("#ad795d");
  const black = material("#141719", 0.26);
  const eyeRim = material("#673b28", 0.62);
  const noseHighlight = material("#61524a", 0.5);
  const claw = material("#a3947d");
  const whisker = material("#ccbea7");

  const round = new THREE.SphereGeometry(1, 12, 8);
  const smallRound = new THREE.SphereGeometry(1, 8, 6);
  const tinyRound = new THREE.SphereGeometry(1, 6, 4);
  const earGeometry = new THREE.ConeGeometry(1, 1, 4, 1);
  earGeometry.rotateY(Math.PI / 4);

  function mesh(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    mat: THREE.Material,
    position: Vec,
    scale: Vec = [1, 1, 1],
    rotation: Vec = [0, 0, 0]
  ) {
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(...position);
    object.scale.set(...scale);
    object.rotation.set(...rotation);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  function blob(
    parent: THREE.Object3D,
    mat: THREE.Material,
    position: Vec,
    scale: Vec,
    rotation: Vec = [0, 0, 0],
    geometry: THREE.BufferGeometry = round
  ) {
    return mesh(parent, geometry, mat, position, scale, rotation);
  }

  function tapered(
    parent: THREE.Object3D,
    mat: THREE.Material,
    from: Vec,
    to: Vec,
    bottomRadius: number,
    topRadius: number,
    sides = 7
  ) {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const direction = b.clone().sub(a);
    const geometry = new THREE.CylinderGeometry(
      topRadius,
      bottomRadius,
      direction.length(),
      sides,
      1
    );
    const object = mesh(parent, geometry, mat, [0, 0, 0]);
    object.position.copy(a.add(b).multiplyScalar(0.5));
    object.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
    return object;
  }

  function line(
    parent: THREE.Object3D,
    mat: THREE.Material,
    points: Vec[],
    radius: number,
    segments = 6
  ) {
    const path = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p))
    );
    return mesh(
      parent,
      new THREE.TubeGeometry(path, segments, radius, 5, false),
      mat,
      [0, 0, 0]
    );
  }

  // The tail is a sequence of faceted, tapered cylinder primitives.
  // Matching cross sections keep the coloured rings continuous around the bend.
  const tailCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0.025, 0.316, -0.260),
      new THREE.Vector3(0.048, 0.300, -0.370),
      new THREE.Vector3(0.140, 0.253, -0.490),
      new THREE.Vector3(0.255, 0.199, -0.595),
      new THREE.Vector3(0.375, 0.200, -0.640),
      new THREE.Vector3(0.465, 0.255, -0.590)
    ],
    false,
    "centripetal"
  );

  const radiusKeys: [number, number][] = [
    [0, 0.042],
    [0.12, 0.056],
    [0.42, 0.067],
    [0.68, 0.061],
    [0.86, 0.047],
    [0.96, 0.027],
    [1, 0.009]
  ];

  function tailRadius(t: number): number {
    for (let i = 1; i < radiusKeys.length; i++) {
      const [ta, ra] = radiusKeys[i - 1];
      const [tb, rb] = radiusKeys[i];
      if (t <= tb) return THREE.MathUtils.lerp(ra, rb, (t - ta) / (tb - ta));
    }
    return 0.009;
  }

  const boundaries = [
    0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48,
    0.56, 0.64, 0.72, 0.8, 0.88, 0.95, 1
  ];
  const up = new THREE.Vector3(0, 1, 0);

  for (let band = 0; band < boundaries.length - 1; band++) {
    const geometry = new THREE.CylinderGeometry(1, 1, 1, 10, 2, false);
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const u = THREE.MathUtils.clamp(positions.getY(i) + 0.5, 0, 1);
      const t = THREE.MathUtils.lerp(
        boundaries[band],
        boundaries[band + 1],
        u
      );
      const center = tailCurve.getPointAt(t);
      const tangent = tailCurve.getTangentAt(t).normalize();
      const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
      const cross = new THREE.Vector3().crossVectors(side, tangent).normalize();
      const radius = tailRadius(t);
      center.addScaledVector(side, x * radius);
      center.addScaledVector(cross, z * radius);
      positions.setXYZ(i, center.x, center.y, center.z);
    }
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    const part = mesh(
      panda,
      geometry,
      band % 2 === 0 ? tailRust : tailGold,
      [0, 0, 0]
    );
    part.name = `Tail ring ${band + 1}`;
  }
  const tailTip = tailCurve.getPointAt(1);
  blob(
    panda,
    tailRust,
    [tailTip.x, tailTip.y, tailTip.z],
    [0.010, 0.010, 0.010],
    [0, 0, 0],
    smallRound
  );

  // Stocky torso, dark underside, and a broad copper mantle.
  blob(panda, darkFur, [0, 0.238, -0.048], [0.138, 0.111, 0.218]);
  blob(panda, fur, [0, 0.300, -0.064], [0.150, 0.150, 0.249]);
  blob(panda, fur, [0, 0.316, -0.193], [0.138, 0.120, 0.136]);
  blob(panda, backFur, [0, 0.362, -0.092], [0.140, 0.088, 0.217]);
  blob(panda, darkFur, [0, 0.297, 0.131], [0.111, 0.109, 0.102]);

  // Four distinct legs and grounded, softly blocky paws.
  for (const side of [-1, 1]) {
    const frontX = side * 0.111;
    const rearX = side * 0.128;

    blob(
      panda,
      darkFur,
      [side * 0.105, 0.190, 0.132],
      [0.047, 0.112, 0.052],
      [0.075, 0, side * 0.035],
      smallRound
    );
    tapered(
      panda,
      stocking,
      [frontX, 0.061, 0.174],
      [side * 0.107, 0.215, 0.137],
      0.034,
      0.042,
      8
    );
    blob(
      panda,
      stocking,
      [frontX, 0.075, 0.169],
      [0.036, 0.059, 0.041],
      [0, 0, 0],
      smallRound
    );
    blob(
      panda,
      fur,
      [side * 0.104, 0.313, 0.099],
      [0.052, 0.068, 0.071],
      [0, 0, side * 0.10],
      smallRound
    );

    blob(
      panda,
      darkFur,
      [side * 0.112, 0.209, -0.209],
      [0.061, 0.098, 0.071],
      [-0.17, 0, -side * 0.06],
      smallRound
    );
    tapered(
      panda,
      stocking,
      [rearX, 0.055, -0.222],
      [side * 0.121, 0.175, -0.244],
      0.033,
      0.044,
      8
    );
    blob(
      panda,
      fur,
      [side * 0.118, 0.288, -0.203],
      [0.050, 0.058, 0.070],
      [0, 0, -side * 0.12],
      smallRound
    );

    for (const [x, z] of [
      [frontX, 0.191],
      [rearX, -0.210]
    ]) {
      blob(
        panda,
        stocking,
        [x, 0.028, z],
        [0.046, 0.029, 0.062],
        [0, 0, 0],
        smallRound
      );
      for (let toe = -1; toe <= 1; toe++) {
        const tx = x + toe * 0.022;
        blob(
          panda,
          stocking,
          [tx, 0.022, z + 0.043],
          [0.014, 0.020, 0.025],
          [0, 0, 0],
          smallRound
        );
        blob(
          panda,
          claw,
          [tx, 0.011, z + 0.064],
          [0.0045, 0.0045, 0.011],
          [0.15, 0, 0],
          tinyRound
        );
      }
    }

    // Broad, pointed fur locks at the edges of the coat.
    tapered(
      panda, fur,
      [side * 0.137, 0.312, 0.090],
      [side * 0.166, 0.267, 0.067],
      0.027, 0, 4
    );
    tapered(
      panda, backFur,
      [side * 0.133, 0.326, -0.195],
      [side * 0.166, 0.279, -0.230],
      0.030, 0, 4
    );
    tapered(
      panda, darkFur,
      [side * 0.086, 0.287, 0.179],
      [side * 0.098, 0.244, 0.189],
      0.022, 0, 4
    );
  }

  // A broad head, held forward above the black chest.
  const head = new THREE.Group();
  head.name = "Face and ears";
  head.position.set(0, 0.423, 0.255);
  head.rotation.z = -0.025;
  panda.add(head);

  blob(head, deepRust, [0, -0.043, -0.044], [0.148, 0.105, 0.108]);
  blob(head, fur, [0, 0, 0], [0.166, 0.133, 0.122]);
  blob(head, backFur, [0, 0.074, -0.013], [0.116, 0.063, 0.094]);

  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(side * 0.120, 0.119, -0.014);
    ear.rotation.z = -side * 0.26;
    ear.rotation.y = side * 0.09;
    head.add(ear);

    mesh(ear, earGeometry, fur, [0, 0, -0.006], [0.091, 0.124, 0.047]);
    mesh(ear, earGeometry, ivory, [0, 0.002, 0.005], [0.081, 0.113, 0.042]);
    mesh(ear, earGeometry, earDark, [0, -0.008, 0.027], [0.051, 0.071, 0.012]);
    mesh(ear, earGeometry, earWarm, [0, -0.018, 0.035], [0.031, 0.039, 0.004]);
    blob(
      ear, cream,
      [0, -0.043, 0.027],
      [0.041, 0.019, 0.022],
      [0, 0, 0],
      smallRound
    );

    blob(
      head, fur,
      [side * 0.120, -0.025, 0.045],
      [0.063, 0.063, 0.057],
      [0, side * 0.12, side * 0.13],
      smallRound
    );
    tapered(
      head, backFur,
      [side * 0.143, 0.003, 0.030],
      [side * 0.184, -0.032, 0.047],
      0.030, 0, 4
    );

    // White facial fields leave the central copper bridge exposed.
    blob(
      head, cream,
      [side * 0.075, 0.007, 0.093],
      [0.064, 0.066, 0.025],
      [0, side * 0.10, -side * 0.20]
    );
    blob(
      head, ivory,
      [side * 0.065, 0.057, 0.096],
      [0.054, 0.024, 0.023],
      [0, side * 0.08, side * 0.17],
      smallRound
    );
    blob(
      head, cream,
      [side * 0.108, -0.035, 0.087],
      [0.061, 0.045, 0.033],
      [0, side * 0.18, side * 0.12],
      smallRound
    );

    tapered(
      head, cream,
      [side * 0.134, -0.028, 0.079],
      [side * 0.179, -0.051, 0.082],
      0.025, 0, 4
    );
    tapered(
      head, cream,
      [side * 0.123, -0.051, 0.080],
      [side * 0.160, -0.083, 0.081],
      0.023, 0, 4
    );

    // Russet eye patches and the characteristic descending tear markings.
    blob(
      head, deepRust,
      [side * 0.066, 0.009, 0.116],
      [0.032, 0.029, 0.014],
      [0, side * 0.12, -side * 0.06],
      smallRound
    );
    blob(
      head, deepRust,
      [side * 0.064, -0.018, 0.125],
      [0.011, 0.029, 0.008],
      [0, 0, side * 0.27],
      smallRound
    );

    blob(
      head, eyeRim,
      [side * 0.066, 0.013, 0.129],
      [0.020, 0.022, 0.010],
      [0, side * 0.13, 0],
      smallRound
    );
    blob(
      head, black,
      [side * 0.066, 0.013, 0.133],
      [0.0167, 0.0195, 0.0085],
      [0, side * 0.13, 0],
      smallRound
    );
    blob(
      head, ivory,
      [side * 0.066 - 0.0045, 0.020, 0.141],
      [0.0044, 0.0044, 0.0021],
      [0, 0, 0],
      tinyRound
    );
  }

  // The small orange forehead flame and cream, double-lobed muzzle.
  blob(
    head, brightFur,
    [0, 0.068, 0.093],
    [0.044, 0.039, 0.023],
    [0, 0, 0],
    smallRound
  );
  blob(
    head, fur,
    [0, -0.002, 0.116],
    [0.031, 0.046, 0.019],
    [0, 0, 0],
    smallRound
  );
  blob(head, cream, [0, -0.082, 0.110], [0.061, 0.024, 0.038]);

  for (const side of [-1, 1]) {
    blob(
      head, ivory,
      [side * 0.027, -0.061, 0.133],
      [0.037, 0.028, 0.029],
      [0, side * 0.12, 0],
      smallRound
    );
  }

  blob(
    head, black,
    [0, -0.044, 0.159],
    [0.022, 0.013, 0.015],
    [0, 0, 0],
    tinyRound
  );
  blob(
    head, noseHighlight,
    [-0.004, -0.039, 0.172],
    [0.008, 0.0026, 0.0015],
    [0, 0, -0.08],
    tinyRound
  );

  line(head, black, [
    [0, -0.054, 0.165],
    [0, -0.063, 0.166],
    [0, -0.069, 0.164]
  ], 0.0018, 4);

  for (const side of [-1, 1]) {
    line(head, black, [
      [0, -0.069, 0.164],
      [side * 0.011, -0.075, 0.163],
      [side * 0.025, -0.072, 0.157]
    ], 0.0016, 5);

    for (const [x, y] of [
      [0.039, -0.054],
      [0.050, -0.059],
      [0.039, -0.068]
    ]) {
      blob(
        head, earDark,
        [side * x, y, 0.158],
        [0.0017, 0.0017, 0.0012],
        [0, 0, 0],
        tinyRound
      );
    }

    line(head, whisker, [
      [side * 0.052, -0.059, 0.154],
      [side * 0.112, -0.049, 0.159],
      [side * 0.175, -0.040, 0.148]
    ], 0.00095, 6);
    line(head, whisker, [
      [side * 0.051, -0.070, 0.152],
      [side * 0.109, -0.075, 0.160],
      [side * 0.166, -0.085, 0.153]
    ], 0.0009, 6);
  }

  return panda;
}
