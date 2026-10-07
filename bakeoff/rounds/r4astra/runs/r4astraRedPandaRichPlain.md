```ts
import * as THREE from "three";

export const meta = {
  name: "Bamboo Balancing Act",
  description:
    "A delighted, bright-eyed red panda balances on a moss-covered woodland branch, clutching bamboo while its enormous striped tail acts as a counterweight.",
};

export default function createModel(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Red panda on a mossy branch";

  let seed = 71429;
  function random(): number {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const Y = v(0, 1, 0);
  const Z = v(0, 0, 1);

  function material(color: string, roughness = 0.88) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      flatShading: true,
    });
  }

  const M = {
    rust: material("#b44729"),
    sunRust: material("#ce6037"),
    deepRust: material("#853321"),
    tear: material("#a44129"),
    cream: material("#f1e9d6"),
    creamShade: material("#d4c4a5"),
    blackFur: material("#292522"),
    softBlack: material("#39302b"),
    nose: material("#181b19", 0.36),
    eye: material("#111815", 0.15),
    glint: material("#fff8df", 0.28),
    tongue: material("#dc8f88"),
    ear: material("#663c31"),
    earWarm: material("#b87b60"),
    ginger: material("#d1773d"),
    tailCream: material("#ebcf9c"),
    bark: material("#604332"),
    barkDark: material("#412e25"),
    barkLight: material("#896247"),
    wood: material("#cea473"),
    woodRing: material("#9c714c"),
    mossDark: material("#425832"),
    moss: material("#698344"),
    mossLight: material("#97a857"),
    bamboo: material("#729747"),
    bambooDark: material("#4b7236"),
    bambooNode: material("#bcc57b"),
    leaf: material("#45813a"),
    leafLight: material("#78a34b"),
    leafDark: material("#305e32"),
  };

  const sphereGeometry = new THREE.SphereGeometry(1, 12, 8);
  const largeSphereGeometry = new THREE.SphereGeometry(1, 16, 10);
  const icoGeometry = new THREE.IcosahedronGeometry(1, 1);
  const octaGeometry = new THREE.OctahedronGeometry(1, 0);

  function mesh(
    geometry: THREE.BufferGeometry,
    mat: THREE.Material | THREE.Material[],
    position: THREE.Vector3,
    scale?: THREE.Vector3,
    parent: THREE.Object3D = root
  ) {
    const object = new THREE.Mesh(geometry, mat);
    object.position.copy(position);
    if (scale) object.scale.copy(scale);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  function ellipsoid(
    position: THREE.Vector3,
    scale: THREE.Vector3,
    mat: THREE.Material,
    parent: THREE.Object3D = root,
    large = false
  ) {
    return mesh(
      large ? largeSphereGeometry : sphereGeometry,
      mat,
      position,
      scale,
      parent
    );
  }

  function pebble(
    position: THREE.Vector3,
    scale: THREE.Vector3,
    mat: THREE.Material,
    parent: THREE.Object3D = root
  ) {
    return mesh(icoGeometry, mat, position, scale, parent);
  }

  function cylinder(
    a: THREE.Vector3,
    b: THREE.Vector3,
    r0: number,
    r1: number,
    mat: THREE.Material,
    parent: THREE.Object3D = root,
    sides = 8
  ) {
    const direction = b.clone().sub(a);
    const object = mesh(
      new THREE.CylinderGeometry(r1, r0, direction.length(), sides, 1),
      mat,
      a.clone().add(b).multiplyScalar(0.5),
      undefined,
      parent
    );
    object.quaternion.setFromUnitVectors(Y, direction.normalize());
    return object;
  }

  function tuft(
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    mat: THREE.Material,
    parent: THREE.Object3D = root
  ) {
    return cylinder(a, b, radius, 0, mat, parent, 5);
  }

  function line(
    points: THREE.Vector3[],
    radius: number,
    mat: THREE.Material,
    parent: THREE.Object3D = root,
    divisions = 12
  ) {
    const curve = new THREE.CatmullRomCurve3(points);
    return mesh(
      new THREE.TubeGeometry(curve, divisions, radius, 5, false),
      mat,
      v(0, 0, 0),
      undefined,
      parent
    );
  }

  function triangle(
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
    mat: THREE.Material,
    parent: THREE.Object3D
  ) {
    const geometry = new THREE.BufferGeometry().setFromPoints([a, b, c]);
    geometry.setIndex([0, 1, 2]);
    geometry.computeVertexNormals();
    return mesh(geometry, mat, v(0, 0, 0), undefined, parent);
  }

  // A short, rooted tree fork supports the branch without a display plinth.
  const woodGroup = new THREE.Group();
  woodGroup.name = "Gnarled branch and exposed roots";
  root.add(woodGroup);

  function woodySegment(
    a: THREE.Vector3,
    b: THREE.Vector3,
    r0: number,
    r1: number,
    ridges = 6
  ) {
    cylinder(a, b, r0, r1, M.bark, woodGroup, 9);
    const direction = b.clone().sub(a).normalize();
    const reference = Math.abs(direction.y) > 0.88 ? Z : Y;
    const u = new THREE.Vector3().crossVectors(direction, reference).normalize();
    const w = new THREE.Vector3().crossVectors(direction, u).normalize();

    for (let j = 0; j < ridges; j++) {
      const angle = (j / ridges) * Math.PI * 2 + random() * 0.25;
      const outward = u
        .clone()
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(w, Math.sin(angle));
      const t0 = 0.04 + random() * 0.15;
      const t1 = 0.77 + random() * 0.18;
      const start = a.clone().lerp(b, t0);
      const finish = a.clone().lerp(b, t1);
      start.addScaledVector(outward, (r0 + (r1 - r0) * t0) * 0.95);
      finish.addScaledVector(outward, (r0 + (r1 - r0) * t1) * 0.95);
      cylinder(
        start,
        finish,
        0.0025 + random() * 0.002,
        0.0015,
        j % 3 === 0 ? M.barkLight : M.barkDark,
        woodGroup,
        5
      );
    }
  }

  pebble(v(-0.335, 0.055, -0.105), v(0.133, 0.06, 0.113), M.bark, woodGroup);

  const roots: [THREE.Vector3, THREE.Vector3, number, number][] = [
    [v(-0.35, 0.072, -0.11), v(-0.56, 0.039, 0.02), 0.071, 0.035],
    [v(-0.56, 0.039, 0.02), v(-0.66, 0.019, 0.10), 0.035, 0.018],
    [v(-0.30, 0.065, -0.12), v(-0.13, 0.03, -0.25), 0.066, 0.028],
    [v(-0.13, 0.03, -0.25), v(-0.055, 0.017, -0.29), 0.028, 0.015],
    [v(-0.31, 0.064, -0.06), v(-0.24, 0.037, 0.16), 0.058, 0.031],
    [v(-0.24, 0.037, 0.16), v(-0.14, 0.018, 0.205), 0.031, 0.016],
    [v(-0.37, 0.059, -0.15), v(-0.48, 0.023, -0.285), 0.055, 0.021],
  ];
  roots.forEach(([a, b, ra, rb]) => woodySegment(a, b, ra, rb, 4));

  const trunkPoints = [
    v(-0.345, 0.055, -0.12),
    v(-0.398, 0.235, -0.10),
    v(-0.304, 0.398, -0.06),
    v(-0.22, 0.493, -0.018),
  ];
  const trunkRadii = [0.094, 0.083, 0.075, 0.067];
  for (let i = 0; i < trunkPoints.length - 1; i++) {
    woodySegment(trunkPoints[i], trunkPoints[i + 1], trunkRadii[i], trunkRadii[i + 1], 8);
    if (i > 0) {
      pebble(
        trunkPoints[i],
        v(trunkRadii[i], trunkRadii[i] * 1.1, trunkRadii[i]),
        M.bark,
        woodGroup
      );
    }
  }

  const branchPoints = [
    v(-0.665, 0.413, 0.094),
    v(-0.438, 0.472, 0.014),
    v(-0.12, 0.510, 0.0),
    v(0.16, 0.55, -0.012),
    v(0.43, 0.596, -0.025),
    v(0.642, 0.656, 0.0),
  ];
  const branchRadii = [0.062, 0.071, 0.066, 0.057, 0.043, 0.025];

  for (let i = 0; i < branchPoints.length - 1; i++) {
    woodySegment(
      branchPoints[i],
      branchPoints[i + 1],
      branchRadii[i],
      branchRadii[i + 1],
      7
    );
    if (i > 0) {
      pebble(
        branchPoints[i],
        v(branchRadii[i], branchRadii[i] * 0.96, branchRadii[i]),
        M.bark,
        woodGroup
      );
    }
  }

  woodySegment(v(0.39, 0.585, -0.034), v(0.485, 0.706, -0.098), 0.027, 0.017, 4);
  woodySegment(v(0.485, 0.706, -0.098), v(0.514, 0.779, -0.088), 0.017, 0.006, 3);
  woodySegment(v(-0.398, 0.261, -0.10), v(-0.498, 0.317, -0.17), 0.041, 0.024, 5);

  function cutEnd(point: THREE.Vector3, normal: THREE.Vector3, radius: number) {
    const n = normal.clone().normalize();
    const face = mesh(
      new THREE.CircleGeometry(radius * 0.9, 12),
      M.wood,
      point.clone().addScaledVector(n, 0.001),
      undefined,
      woodGroup
    );
    face.quaternion.setFromUnitVectors(Z, n);

    for (const fraction of [0.32, 0.58, 0.79]) {
      const ring = mesh(
        new THREE.RingGeometry(radius * fraction - 0.0012, radius * fraction + 0.0012, 12),
        M.woodRing,
        point.clone().addScaledVector(n, 0.0018),
        undefined,
        woodGroup
      );
      ring.quaternion.copy(face.quaternion);
    }
    const localX = v(1, 0, 0).applyQuaternion(face.quaternion);
    const localY = v(0, 1, 0).applyQuaternion(face.quaternion);
    const center = point.clone().addScaledVector(n, 0.0022);
    cylinder(
      center.clone().addScaledVector(localX, radius * 0.17),
      center.clone().addScaledVector(localX, radius * 0.78).addScaledVector(localY, radius * 0.16),
      0.0015,
      0.0007,
      M.barkDark,
      woodGroup,
      4
    );
  }

  cutEnd(branchPoints[0], branchPoints[0].clone().sub(branchPoints[1]), branchRadii[0]);
  cutEnd(branchPoints[5], branchPoints[5].clone().sub(branchPoints[4]), branchRadii[5]);
  cutEnd(v(-0.498, 0.317, -0.17), v(-0.10, 0.056, -0.07), 0.024);

  // Cushions of moss follow the upper surfaces, leaving the bark readable.
  for (let i = 0; i < branchPoints.length - 1; i++) {
    for (let j = 0; j < 10; j++) {
      const t = (j + 0.3 + random() * 0.4) / 10;
      const p = branchPoints[i].clone().lerp(branchPoints[i + 1], t);
      const radius = THREE.MathUtils.lerp(branchRadii[i], branchRadii[i + 1], t);
      const lateral = (random() - 0.5) * radius * 1.25;
      p.z += lateral;
      p.y += Math.sqrt(Math.max(0, radius * radius - lateral * lateral)) * 0.9;
      const mossMat = j % 4 === 0 ? M.mossLight : j % 3 === 0 ? M.mossDark : M.moss;
      const sx = 0.021 + random() * 0.019;
      const sy = 0.009 + random() * 0.008;
      pebble(p, v(sx, sy, 0.022 + random() * 0.016), mossMat, woodGroup);

      if (j % 3 === 0) {
        for (let k = 0; k < 3; k++) {
          const a = p.clone().add(v((random() - 0.5) * 0.028, sy * 0.5, (random() - 0.5) * 0.022));
          tuft(a, a.clone().add(v((random() - 0.5) * 0.009, 0.013 + random() * 0.009, 0)), 0.004, M.mossLight, woodGroup);
        }
      }
    }
  }

  for (let i = 0; i < 17; i++) {
    const t = random();
    const p = trunkPoints[0].clone().lerp(trunkPoints[2], t);
    p.x -= 0.037 + random() * 0.038;
    p.z += 0.043 + random() * 0.037;
    pebble(p, v(0.027, 0.019 + random() * 0.025, 0.015), i % 3 ? M.moss : M.mossDark, woodGroup);
  }
  for (let i = 0; i < 12; i++) {
    const angle = random() * Math.PI * 2;
    const p = v(-0.34 + Math.cos(angle) * 0.115, 0.035 + random() * 0.014, -0.10 + Math.sin(angle) * 0.095);
    pebble(p, v(0.036, 0.015, 0.030), i % 3 === 0 ? M.mossLight : M.moss, woodGroup);
  }

  // Broad, ringed tail: one faceted curved tube with genuinely continuous bands.
  const tailCurve = new THREE.CatmullRomCurve3([
    v(-0.02, 0.805, -0.133),
    v(-0.14, 0.777, -0.197),
    v(-0.30, 0.711, -0.180),
    v(-0.46, 0.657, -0.106),
    v(-0.605, 0.668, -0.013),
    v(-0.697, 0.732, 0.046),
    v(-0.710, 0.829, 0.061),
    v(-0.678, 0.882, 0.047),
  ]);
  const tailSteps = 80;
  const tailSides = 10;
  const tailGeometry = new THREE.TubeGeometry(tailCurve, tailSteps, 1, tailSides, false);
  const tailPositions = tailGeometry.getAttribute("position");

  function tailRadius(t: number) {
    const swell = 0.050 + 0.038 * Math.sin(Math.min(1, t / 0.23) * Math.PI * 0.5);
    const taper = THREE.MathUtils.smoothstep(t, 0.76, 1);
    return swell * (1 - 0.69 * taper);
  }
  function tailMaterialIndex(t: number) {
    const band = Math.min(9, Math.floor(t * 10));
    return band === 0 ? 2 : band % 2;
  }

  for (let i = 0; i <= tailSteps; i++) {
    const t = i / tailSteps;
    const center = tailCurve.getPointAt(t);
    for (let j = 0; j <= tailSides; j++) {
      const index = i * (tailSides + 1) + j;
      const p = v(
        tailPositions.getX(index),
        tailPositions.getY(index),
        tailPositions.getZ(index)
      );
      p.sub(center).multiplyScalar(tailRadius(t)).add(center);
      tailPositions.setXYZ(index, p.x, p.y, p.z);
    }
  }
  tailGeometry.clearGroups();
  for (let i = 0; i < tailSteps; i++) {
    tailGeometry.addGroup(i * tailSides * 6, tailSides * 6, tailMaterialIndex((i + 0.5) / tailSteps));
  }
  tailPositions.needsUpdate = true;
  tailGeometry.computeVertexNormals();
  tailGeometry.computeBoundingSphere();
  const tailMats = [M.ginger, M.tailCream, M.rust];
  mesh(tailGeometry, tailMats, v(0, 0, 0));
  ellipsoid(tailCurve.getPointAt(1), v(0.028, 0.028, 0.028), M.tailCream);

  const tailFrames = tailCurve.computeFrenetFrames(tailSteps, false);
  for (let band = 1; band < 10; band++) {
    const t = (band + 0.48) / 10;
    const index = Math.round(t * tailSteps);
    const center = tailCurve.getPointAt(t);
    const tangent = tailCurve.getTangentAt(t);
    for (let j = 0; j < 3; j++) {
      const angle = j * Math.PI * 2 / 3 + band * 0.53;
      const radial = tailFrames.normals[index].clone().multiplyScalar(Math.cos(angle))
        .addScaledVector(tailFrames.binormals[index], Math.sin(angle));
      const a = center.clone().addScaledVector(radial, tailRadius(t) * 0.89);
      const b = a.clone().addScaledVector(radial, 0.019).addScaledVector(tangent, 0.017);
      tuft(a, b, 0.012, tailMats[tailMaterialIndex(t)]);
    }
  }

  // Hind legs and broad feet on the two slightly different branch heights.
  ellipsoid(v(-0.100, 0.750, -0.005), v(0.071, 0.106, 0.073), M.blackFur);
  ellipsoid(v(0.099, 0.770, -0.021), v(0.073, 0.105, 0.072), M.blackFur);
  cylinder(v(-0.107, 0.742, 0.012), v(-0.117, 0.641, 0.040), 0.048, 0.039, M.blackFur);
  cylinder(v(0.105, 0.762, 0.003), v(0.111, 0.670, 0.028), 0.049, 0.039, M.blackFur);

  const feet = [
    { x: -0.114, y: 0.613, z: 0.088 },
    { x: 0.110, y: 0.641, z: 0.066 },
  ];
  for (const foot of feet) {
    ellipsoid(v(foot.x, foot.y, foot.z), v(0.051, 0.034, 0.081), M.blackFur);
    for (let j = -1; j <= 1; j++) {
      ellipsoid(v(foot.x + j * 0.027, foot.y - 0.002, foot.z + 0.060), v(0.017, 0.023, 0.028), M.softBlack);
      tuft(
        v(foot.x + j * 0.027, foot.y - 0.005, foot.z + 0.080),
        v(foot.x + j * 0.027, foot.y - 0.018, foot.z + 0.097),
        0.005,
        M.creamShade
      );
    }
  }

  const torso = ellipsoid(v(0.002, 0.871, -0.012), v(0.158, 0.221, 0.130), M.rust, root, true);
  torso.rotation.z = -0.085;
  ellipsoid(v(0.009, 0.984, -0.017), v(0.149, 0.105, 0.126), M.sunRust);
  ellipsoid(v(0.004, 0.863, 0.078), v(0.131, 0.181, 0.080), M.blackFur, root, true);
  ellipsoid(v(0.005, 1.046, 0.047), v(0.106, 0.078, 0.087), M.blackFur);

  for (const side of [-1, 1]) {
    tuft(v(side * 0.122, 0.921, 0.005), v(side * 0.177, 0.887, 0.010), 0.036, M.rust);
    tuft(v(side * 0.133, 0.994, 0.005), v(side * 0.185, 0.971, 0.013), 0.035, M.sunRust);
    tuft(v(side * 0.086, 1.036, -0.035), v(side * 0.135, 1.086, -0.029), 0.031, M.sunRust);
  }
  // A few angular coat locks, mostly along the back rather than across the belly.
  tuft(v(-0.055, 0.975, -0.120), v(-0.067, 0.919, -0.145), 0.037, M.sunRust);
  tuft(v(0.051, 0.913, -0.126), v(0.059, 0.850, -0.146), 0.037, M.deepRust);

  // Outstretched balancing paw.
  ellipsoid(v(-0.136, 0.990, 0.014), v(0.052, 0.063, 0.059), M.blackFur);
  cylinder(v(-0.145, 0.990, 0.029), v(-0.231, 0.947, 0.070), 0.044, 0.033, M.blackFur);
  ellipsoid(v(-0.229, 0.949, 0.073), v(0.038, 0.036, 0.038), M.blackFur);
  cylinder(v(-0.231, 0.951, 0.074), v(-0.280, 0.972, 0.118), 0.032, 0.027, M.blackFur);
  const balancePaw = ellipsoid(v(-0.289, 0.975, 0.128), v(0.037, 0.042, 0.037), M.blackFur);
  balancePaw.rotation.z = -0.37;
  for (let j = 0; j < 3; j++) {
    const x = -0.315 + j * 0.021;
    ellipsoid(v(x, 0.959 - Math.abs(j - 1) * 0.004, 0.153), v(0.012, 0.021, 0.020), M.softBlack);
    tuft(v(x, 0.950, 0.164), v(x - 0.002, 0.940, 0.173), 0.0035, M.creamShade);
  }

  // Raised arm, curved around the bamboo.
  ellipsoid(v(0.137, 0.990, 0.022), v(0.053, 0.066, 0.058), M.blackFur);
  cylinder(v(0.150, 0.989, 0.035), v(0.216, 0.948, 0.105), 0.044, 0.034, M.blackFur);
  ellipsoid(v(0.214, 0.950, 0.104), v(0.039, 0.040, 0.039), M.blackFur);
  cylinder(v(0.215, 0.951, 0.109), v(0.282, 1.015, 0.188), 0.033, 0.028, M.blackFur);
  ellipsoid(v(0.287, 1.019, 0.195), v(0.039, 0.039, 0.035), M.blackFur);

  // Head is a simple round form with a broad ivory mask and a small jaunty tilt.
  const head = new THREE.Group();
  head.name = "Delighted white-masked face";
  head.position.set(0.008, 1.170, 0.045);
  head.rotation.set(0.012, 0.045, -0.095);
  root.add(head);

  ellipsoid(v(0, 0, 0), v(0.191, 0.161, 0.150), M.rust, head, true);
  ellipsoid(v(0, 0.081, -0.014), v(0.160, 0.084, 0.130), M.sunRust, head);
  ellipsoid(v(0, -0.023, 0.094), v(0.172, 0.132, 0.085), M.cream, head, true);

  for (const side of [-1, 1]) {
    ellipsoid(v(side * 0.130, -0.033, 0.063), v(0.064, 0.081, 0.096), M.cream, head);
    tuft(v(side * 0.157, -0.011, 0.063), v(side * 0.208, -0.035, 0.069), 0.027, M.cream, head);
    tuft(v(side * 0.155, -0.057, 0.067), v(side * 0.194, -0.092, 0.080), 0.029, M.cream, head);
    tuft(v(side * 0.153, 0.051, 0.019), v(side * 0.198, 0.043, 0.025), 0.029, M.rust, head);

    // Pointed four-sided ears: their front faces carry inset triangular interiors.
    const ear = new THREE.Group();
    ear.position.set(side * 0.139, 0.139, -0.022);
    ear.rotation.z = -side * 0.25;
    ear.rotation.x = -0.055;
    head.add(ear);
    ellipsoid(v(0, -0.065, -0.009), v(0.062, 0.052, 0.050), M.rust, ear);
    mesh(
      new THREE.ConeGeometry(1, 1, 4, 1, false, Math.PI / 4),
      M.cream,
      v(0, 0, 0),
      v(0.099, 0.177, 0.068),
      ear
    );
    triangle(v(-0.046, -0.058, 0.0415), v(0.046, -0.058, 0.0415), v(0, 0.062, 0.0085), M.ear, ear);
    triangle(v(-0.027, -0.055, 0.0430), v(0.028, -0.055, 0.0430), v(0, 0.022, 0.0218), M.earWarm, ear);
    tuft(v(-0.018, -0.071, 0.044), v(-0.013, -0.034, 0.039), 0.009, M.creamShade, ear);
    tuft(v(0.016, -0.074, 0.044), v(0.009, -0.045, 0.040), 0.010, M.cream, ear);

    // Rust-red eye markings taper down the white cheeks.
    const eyePatch = ellipsoid(v(side * 0.081, 0.018, 0.170), v(0.039, 0.033, 0.014), M.tear, head);
    eyePatch.rotation.z = side * 0.13;
    const tear = mesh(
      new THREE.ConeGeometry(1, 1, 5),
      M.tear,
      v(side * 0.106, -0.034, 0.169),
      v(0.025, 0.090, 0.010),
      head
    );
    tear.quaternion.setFromUnitVectors(Y, v(side * 0.31, -1, -0.11).normalize());

    const brow = ellipsoid(v(side * 0.078, 0.062, 0.153), v(0.055, 0.023, 0.027), M.cream, head);
    brow.rotation.z = side * 0.16;

    ellipsoid(v(side * 0.081, 0.023, 0.184), v(0.0195, 0.024, 0.013), M.eye, head);
    ellipsoid(v(side * 0.081 - 0.005, 0.031, 0.195), v(0.0055, 0.0065, 0.0027), M.glint, head);
    ellipsoid(v(side * 0.081 + 0.006, 0.017, 0.196), v(0.0025, 0.0028, 0.0018), M.glint, head);

    line([
      v(side * 0.060, 0.031, 0.185),
      v(side * 0.077, 0.046, 0.188),
      v(side * 0.096, 0.035, 0.181),
    ], 0.0034, M.softBlack, head, 8);

    // The high cheek pads help the expression read as a smile.
    ellipsoid(v(side * 0.063, -0.028, 0.167), v(0.032, 0.022, 0.018), M.cream, head);
  }

  ellipsoid(v(0, -0.102, 0.145), v(0.071, 0.034, 0.038), M.cream, head);
  ellipsoid(v(0, -0.084, 0.178), v(0.048, 0.032, 0.013), M.nose, head);
  ellipsoid(v(0, -0.102, 0.190), v(0.023, 0.011, 0.005), M.tongue, head);
  ellipsoid(v(-0.032, -0.059, 0.168), v(0.047, 0.033, 0.039), M.cream, head);
  ellipsoid(v(0.032, -0.059, 0.168), v(0.047, 0.033, 0.039), M.cream, head);
  pebble(v(0, -0.042, 0.208), v(0.025, 0.016, 0.017), M.nose, head);
  ellipsoid(v(-0.006, -0.037, 0.222), v(0.009, 0.003, 0.002), M.softBlack, head);
  cylinder(v(0, -0.052, 0.211), v(0, -0.074, 0.207), 0.0026, 0.0023, M.nose, head, 5);

  for (const side of [-1, 1]) {
    line([
      v(0, -0.073, 0.207),
      v(side * 0.020, -0.082, 0.204),
      v(side * 0.039, -0.074, 0.199),
    ], 0.0024, M.softBlack, head, 8);

    for (let j = 0; j < 2; j++) {
      ellipsoid(v(side * (0.045 + j * 0.010), -0.055 - j * 0.012, 0.199 - j * 0.004), v(0.0028, 0.0026, 0.002), M.softBlack, head);
      line([
        v(side * 0.056, -0.063 - j * 0.014, 0.190),
        v(side * 0.097, -0.063 - j * 0.020, 0.201),
        v(side * 0.140, -0.055 - j * 0.030, 0.205),
      ], 0.00115, M.creamShade, head, 7);
    }
  }

  // Low-poly folded leaves use octahedra, so their silhouettes are pointed
  // and their central ridges catch the light.
  function leaf(
    a: THREE.Vector3,
    b: THREE.Vector3,
    width: number,
    mat: THREE.Material,
    parent: THREE.Object3D = root,
    vein = true
  ) {
    const direction = b.clone().sub(a);
    const object = mesh(
      octaGeometry,
      mat,
      a.clone().add(b).multiplyScalar(0.5),
      v(width / 2, direction.length() / 2, 0.003),
      parent
    );
    object.quaternion.setFromUnitVectors(Y, direction.normalize());
    if (vein) {
      cylinder(
        a.clone().lerp(b, 0.12).add(v(0, 0, 0.0025)),
        a.clone().lerp(b, 0.89).add(v(0, 0, 0.0025)),
        0.0009,
        0.0004,
        M.leafLight,
        parent,
        4
      );
    }
    return object;
  }

  const bambooGroup = new THREE.Group();
  bambooGroup.name = "Fresh bamboo shoot held in one paw";
  root.add(bambooGroup);
  const stalkBottom = v(0.319, 0.840, 0.204);
  const stalkTop = v(0.345, 1.394, 0.189);
  const stalkAxis = stalkTop.clone().sub(stalkBottom).normalize();
  const nodes = [0, 0.23, 0.48, 0.72, 0.94, 1];

  for (let i = 0; i < nodes.length - 1; i++) {
    const a = stalkBottom.clone().lerp(stalkTop, nodes[i]);
    const b = stalkBottom.clone().lerp(stalkTop, nodes[i + 1]);
    cylinder(a, b, 0.0155 - i * 0.0009, 0.015 - i * 0.0009, M.bamboo, bambooGroup, 8);
    const edgeA = a.clone().add(v(-0.007, 0, 0.011));
    const edgeB = b.clone().add(v(-0.006, 0, 0.010));
    cylinder(edgeA, edgeB, 0.0015, 0.001, M.bambooDark, bambooGroup, 4);
  }
  for (const t of nodes.slice(0, -1)) {
    const p = stalkBottom.clone().lerp(stalkTop, t);
    cylinder(
      p.clone().addScaledVector(stalkAxis, -0.003),
      p.clone().addScaledVector(stalkAxis, 0.006),
      0.018 - t * 0.003,
      0.018 - t * 0.003,
      M.bambooNode,
      bambooGroup,
      8
    );
    cylinder(
      p.clone().addScaledVector(stalkAxis, -0.005),
      p.clone().addScaledVector(stalkAxis, -0.003),
      0.018 - t * 0.003,
      0.018 - t * 0.003,
      M.bambooDark,
      bambooGroup,
      8
    );
  }
  cylinder(stalkTop, stalkTop.clone().addScaledVector(stalkAxis, 0.002), 0.0105, 0.0105, M.bambooNode, bambooGroup, 8);

  leaf(v(0.321, 0.847, 0.214), v(0.300, 0.928, 0.217), 0.025, M.bambooDark, bambooGroup, false);
  leaf(v(0.326, 0.861, 0.208), v(0.351, 0.912, 0.210), 0.021, M.bambooNode, bambooGroup, false);

  const sprigA = v(0.337, 1.240, 0.192);
  const sprigB = v(0.466, 1.322, 0.193);
  cylinder(sprigA, sprigB, 0.005, 0.0018, M.bambooDark, bambooGroup, 6);
  leaf(v(0.378, 1.267, 0.193), v(0.405, 1.365, 0.198), 0.036, M.leaf, bambooGroup);
  leaf(v(0.405, 1.284, 0.194), v(0.503, 1.277, 0.213), 0.037, M.leafDark, bambooGroup);
  leaf(v(0.434, 1.304, 0.193), v(0.502, 1.391, 0.186), 0.041, M.leaf, bambooGroup);
  leaf(v(0.463, 1.320, 0.193), v(0.557, 1.351, 0.207), 0.032, M.leafLight, bambooGroup);

  cylinder(v(0.343, 1.362, 0.190), v(0.298, 1.431, 0.190), 0.0035, 0.0013, M.bambooDark, bambooGroup, 5);
  leaf(v(0.327, 1.389, 0.190), v(0.244, 1.433, 0.197), 0.034, M.leaf, bambooGroup);
  leaf(v(0.302, 1.422, 0.190), v(0.297, 1.500, 0.182), 0.030, M.leafLight, bambooGroup);
  leaf(v(0.344, 1.379, 0.190), v(0.390, 1.474, 0.193), 0.037, M.leaf, bambooGroup);

  // Fingers sit in front of the stalk; the palm and thumb remain behind it.
  for (let j = 0; j < 3; j++) {
    const y = 0.998 + j * 0.015;
    ellipsoid(v(0.318, y, 0.223), v(0.025, 0.009, 0.010), M.softBlack);
    tuft(v(0.337, y, 0.225), v(0.344, y - 0.003, 0.218), 0.003, M.creamShade);
  }
  ellipsoid(v(0.307, 1.043, 0.210), v(0.023, 0.012, 0.018), M.blackFur);
  tuft(v(0.321, 1.048, 0.220), v(0.334, 1.044, 0.218), 0.004, M.creamShade);

  // Two small woodland sprouts tie the living moss into the rooted support.
  function fern(base: THREE.Vector3, lean: number, height: number) {
    const end = base.clone().add(v(lean, height, 0));
    line([
      base,
      base.clone().add(v(lean * 0.25, height * 0.55, 0.006)),
      end,
    ], 0.0018, M.leafDark, woodGroup, 9);
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      const p = base.clone().lerp(end, t);
      const length = 0.047 * (1 - t * 0.55);
      for (const side of [-1, 1]) {
        leaf(
          p,
          p.clone().add(v(side * length, 0.017 + t * 0.008, 0.008)),
          0.014 * (1 - t * 0.35),
          i % 2 ? M.leaf : M.mossLight,
          woodGroup,
          false
        );
      }
    }
    leaf(end.clone().add(v(-lean * 0.1, -0.021, 0)), end.clone().add(v(lean * 0.12, 0.020, 0)), 0.014, M.leafLight, woodGroup, false);
  }
  fern(v(-0.510, 0.055, 0.028), -0.027, 0.130);
  fern(v(-0.222, 0.057, 0.071), 0.042, 0.111);

  return root;
}
```