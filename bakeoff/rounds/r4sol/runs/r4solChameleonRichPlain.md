```ts
import * as THREE from "three";

export const meta = {
  name: "Sunset Panther Chameleon",
  description:
    "A jewel-coloured panther chameleon stepping along a bark-covered twig, with independently aimed turret eyes, clasping mitten feet, a sawtooth crest and a tightly wound orange tail."
};

export default function (): THREE.Object3D {
  const model = new THREE.Group();
  model.name = "Panther chameleon on a twig";

  let seed = 271828;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const up = V(0, 1, 0);
  const forward = V(0, 0, 1);
  const tau = Math.PI * 2;

  function material(color: number, roughness = 0.82) {
    return new THREE.MeshStandardMaterial({
      color, roughness, metalness: 0, flatShading: true
    });
  }

  const gradient = [
    0x16b9bb, 0x25c6ae, 0x42d291, 0x65d35d,
    0x8ed547, 0xb1d83e, 0xced63c, 0xe3c43a,
    0xeea436, 0xef8432, 0xe96e30
  ].map(c => material(c));

  const turquoise = gradient[0];
  const mint = gradient[2];
  const lime = gradient[4];
  const yellow = gradient[6];
  const orange = gradient[9];
  const tealDark = material(0x176d70);
  const tealShadow = material(0x168e91);
  const crestLight = material(0x76e0ca);
  const jawColor = material(0x62cfbd);
  const ivory = material(0xf3f0d8);
  const clawColor = material(0xe7d6a8);
  const red = material(0xd44249);
  const redShadow = material(0xa9323c);
  const coral = material(0xf06a58);
  const eyeGold = material(0xe8c747, 0.55);
  const black = material(0x112c2d, 0.32);
  const glint = material(0xffffff, 0.22);

  const tailColors = [
    0xeb8731, 0xf29839, 0xf08733, 0xe96c30, 0xd95531
  ].map(c => material(c));
  const tailBand = material(0xba5030);

  const bark = material(0x70503b);
  const barkDark = material(0x483a2e);
  const barkLight = material(0x967252);
  const cutWood = material(0xc6a172);
  const cutRing = material(0x96724e);
  const leafGreen = material(0x467957);
  const leafLight = material(0x68906a);
  const leafVein = material(0x9cab78);

  const sphere = new THREE.SphereGeometry(1, 12, 8);
  const smallSphere = new THREE.SphereGeometry(1, 8, 6);
  const tinySphere = new THREE.SphereGeometry(1, 6, 4);
  const crestGeometry = new THREE.SphereGeometry(1, 4, 2);

  function mesh(
    geometry: THREE.BufferGeometry,
    mat: THREE.Material,
    position: THREE.Vector3,
    scale?: THREE.Vector3,
    quaternion?: THREE.Quaternion
  ) {
    const m = new THREE.Mesh(geometry, mat);
    m.position.copy(position);
    if (scale) m.scale.copy(scale);
    if (quaternion) m.quaternion.copy(quaternion);
    m.castShadow = true;
    m.receiveShadow = true;
    model.add(m);
    return m;
  }

  function ellipsoid(
    p: THREE.Vector3,
    s: THREE.Vector3,
    mat: THREE.Material,
    geometry = smallSphere,
    q?: THREE.Quaternion
  ) {
    return mesh(geometry, mat, p, s, q);
  }

  function beam(
    a: THREE.Vector3,
    b: THREE.Vector3,
    rA: number,
    rB: number,
    mat: THREE.Material,
    sides = 8
  ) {
    const d = b.clone().sub(a);
    const length = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(up, d.normalize());
    return mesh(
      new THREE.CylinderGeometry(rB, rA, length, sides, 1),
      mat, a.clone().add(b).multiplyScalar(0.5), undefined, q
    );
  }

  function ring(
    p: THREE.Vector3,
    axis: THREE.Vector3,
    radius: number,
    thickness: number,
    mat: THREE.Material,
    segments = 20
  ) {
    const q = new THREE.Quaternion().setFromUnitVectors(forward, axis.clone().normalize());
    return mesh(
      new THREE.TorusGeometry(radius, thickness, 5, segments),
      mat, p, undefined, q
    );
  }

  function disk(
    p: THREE.Vector3,
    axis: THREE.Vector3,
    radius: number,
    thickness: number,
    mat: THREE.Material,
    sides = 12
  ) {
    const q = new THREE.Quaternion().setFromUnitVectors(up, axis.clone().normalize());
    return mesh(
      new THREE.CylinderGeometry(radius, radius, thickness, sides, 1),
      mat, p, undefined, q
    );
  }

  // A gently crooked, tapering twig. Its rear end and side fork touch the floor.
  const twigPoints = [
    V(-0.008, 0.017, -0.420),
    V(0.006, 0.025, -0.275),
    V(-0.003, 0.030, -0.115),
    V(0.005, 0.035, 0.050),
    V(0.000, 0.044, 0.215),
    V(-0.011, 0.053, 0.365)
  ];
  const twigRadii = [0.017, 0.0158, 0.0141, 0.0127, 0.0113, 0.0087];

  function twigAt(z: number) {
    for (let i = 0; i < twigPoints.length - 1; i++) {
      if (z <= twigPoints[i + 1].z) {
        const t = THREE.MathUtils.clamp(
          (z - twigPoints[i].z) / (twigPoints[i + 1].z - twigPoints[i].z), 0, 1
        );
        return {
          p: twigPoints[i].clone().lerp(twigPoints[i + 1], t),
          r: THREE.MathUtils.lerp(twigRadii[i], twigRadii[i + 1], t)
        };
      }
    }
    return { p: twigPoints[5].clone(), r: twigRadii[5] };
  }

  for (let i = 0; i < twigPoints.length - 1; i++) {
    const a = twigPoints[i], b = twigPoints[i + 1];
    beam(a, b, twigRadii[i], twigRadii[i + 1], bark, 9);
    const tangent = b.clone().sub(a).normalize();
    const across = V(1, 0, 0).cross(tangent).normalize();
    const around = tangent.clone().cross(across).normalize();
    for (let j = 0; j < 9; j++) {
      const t = 0.09 + random() * 0.8;
      const angle = random() * tau;
      const radial = across.clone().multiplyScalar(Math.cos(angle))
        .addScaledVector(around, Math.sin(angle));
      const r = THREE.MathUtils.lerp(twigRadii[i], twigRadii[i + 1], t);
      const p = a.clone().lerp(b, t).addScaledVector(radial, r * 0.985);
      const length = 0.008 + random() * 0.023;
      beam(
        p.clone().addScaledVector(tangent, -length / 2),
        p.clone().addScaledVector(tangent, length / 2),
        0.00065, 0.00035,
        j % 3 === 0 ? barkLight : barkDark, 5
      );
    }
  }

  function cutEnd(p: THREE.Vector3, axis: THREE.Vector3, radius: number) {
    const n = axis.clone().normalize();
    disk(p.clone().addScaledVector(n, 0.0005), n, radius * 0.94, 0.001, cutWood, 9);
    ring(p.clone().addScaledVector(n, 0.0011), n, radius * 0.63, 0.00065, cutRing, 15);
    ring(p.clone().addScaledVector(n, 0.0012), n, radius * 0.31, 0.00045, cutRing, 12);
  }
  cutEnd(twigPoints[0], twigPoints[0].clone().sub(twigPoints[1]), twigRadii[0]);
  cutEnd(twigPoints[5], twigPoints[5].clone().sub(twigPoints[4]), twigRadii[5]);

  const rearFork = [
    V(0.005, 0.025, -0.270), V(-0.069, 0.014, -0.325), V(-0.120, 0.005, -0.354)
  ];
  beam(rearFork[0], rearFork[1], 0.010, 0.0065, bark, 7);
  beam(rearFork[1], rearFork[2], 0.0065, 0.0048, bark, 7);
  cutEnd(rearFork[2], rearFork[2].clone().sub(rearFork[1]), 0.0048);

  const forkA = [V(0, 0.044, 0.222), V(0.053, 0.062, 0.273), V(0.098, 0.077, 0.328)];
  beam(forkA[0], forkA[1], 0.007, 0.0045, bark, 7);
  beam(forkA[1], forkA[2], 0.0045, 0.0023, bark, 6);
  const forkB = [V(-0.008, 0.050, 0.319), V(-0.054, 0.065, 0.359)];
  beam(forkB[0], forkB[1], 0.0047, 0.0022, bark, 6);

  // Angular, quiet green leaves frame the much brighter animal.
  function leaf(start: THREE.Vector3, end: THREE.Vector3, width: number, mat: THREE.Material) {
    const direction = end.clone().sub(start).normalize();
    const normal = V(0, 1, 0.3);
    normal.addScaledVector(direction, -normal.dot(direction)).normalize();
    const cross = direction.clone().cross(normal).normalize();
    const basis = new THREE.Matrix4().makeBasis(cross, direction, normal);
    const q = new THREE.Quaternion().setFromRotationMatrix(basis);
    const length = start.distanceTo(end);
    ellipsoid(
      start.clone().lerp(end, 0.5),
      V(width, length / 2, 0.0015), mat,
      new THREE.SphereGeometry(1, 6, 2), q
    );
    const a = start.clone().addScaledVector(normal, 0.0017);
    const b = end.clone().addScaledVector(normal, 0.0017);
    beam(a, b, 0.0007, 0.0003, leafVein, 5);
    for (const t of [0.37, 0.62]) {
      const center = a.clone().lerp(b, t);
      for (const sign of [-1, 1]) {
        const edge = start.clone().lerp(end, t + 0.13)
          .addScaledVector(cross, sign * width * 0.68)
          .addScaledVector(normal, 0.0015);
        beam(center, edge, 0.0004, 0.00022, leafVein, 4);
      }
    }
  }
  leaf(forkA[2], V(0.147, 0.094, 0.365), 0.017, leafGreen);
  beam(forkA[1], V(0.061, 0.081, 0.302), 0.0025, 0.0015, bark, 6);
  leaf(V(0.061, 0.081, 0.302), V(0.044, 0.111, 0.362), 0.019, leafLight);
  leaf(forkB[1], V(-0.086, 0.079, 0.416), 0.018, leafGreen);

  // Small bark knots and a broken spur.
  const knotAt = twigAt(-0.345);
  ring(knotAt.p.clone().add(V(0.004, knotAt.r * 0.9, 0)), up, 0.0041, 0.0009, barkDark, 12);
  const spurA = V(0.005, 0.034, 0.010);
  const spurB = V(0.031, 0.050, 0.020);
  beam(spurA, spurB, 0.007, 0.004, bark, 7);
  cutEnd(spurB, spurB.clone().sub(spurA), 0.004);

  // The torso is one faceted ellipsoid, divided into coloured primitive latitude slices.
  const BX = 0.046, BY = 0.074, BZ = 0.140;
  const CY = 0.172, CZ = 0.003;
  const thetaSteps = 20, phiSteps = 24;
  const thetaStep = Math.PI / thetaSteps, phiStep = tau / phiSteps;
  const bandColors = [0, 0, 1, 1, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 8, 8, 9, 9, 10];

  for (let i = 0; i < thetaSteps; i++) {
    const g = new THREE.SphereGeometry(1, phiSteps, 1, 0, tau, i * thetaStep, thetaStep);
    const m = mesh(g, gradient[bandColors[i]], V(0, CY, CZ), V(BX, BZ, BY));
    m.rotation.x = Math.PI / 2;
  }

  function vertex(theta: number, phi: number) {
    return V(
      -BX * Math.cos(phi) * Math.sin(theta),
      CY - BY * Math.sin(phi) * Math.sin(theta),
      CZ + BZ * Math.cos(theta)
    );
  }

  // Interpolation on the actual facets keeps all painted markings flush to the body.
  function bodyPoint(theta: number, phi: number) {
    theta = THREE.MathUtils.clamp(theta, 0, Math.PI - 0.000001);
    phi = ((phi % tau) + tau) % tau;
    const ti = Math.min(thetaSteps - 1, Math.floor(theta / thetaStep));
    const pi = Math.floor(phi / phiStep);
    const v = theta / thetaStep - ti;
    const u = phi / phiStep - pi;
    const a = vertex(ti * thetaStep, pi * phiStep);
    const b = vertex(ti * thetaStep, (pi + 1) * phiStep);
    const c = vertex((ti + 1) * thetaStep, pi * phiStep);
    const d = vertex((ti + 1) * thetaStep, (pi + 1) * phiStep);
    if (u >= v) {
      return a.multiplyScalar(1 - u).addScaledVector(b, u - v).addScaledVector(d, v);
    }
    return a.multiplyScalar(1 - v).addScaledVector(c, v - u).addScaledVector(d, u);
  }

  function bodyNormal(p: THREE.Vector3) {
    return V(p.x / (BX * BX), (p.y - CY) / (BY * BY), (p.z - CZ) / (BZ * BZ)).normalize();
  }

  function skinPatch(
    phiStart: number, phiLength: number,
    thetaStart: number, thetaLength: number,
    mat: THREE.Material, offset: number,
    widthSegments: number, heightSegments: number,
    warp = 0, phase = 0
  ) {
    const g = new THREE.SphereGeometry(
      1, widthSegments, heightSegments,
      phiStart, phiLength, thetaStart, thetaLength
    );
    const positions = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      const theta = Math.acos(THREE.MathUtils.clamp(positions.getY(i), -1, 1));
      const phi = Math.atan2(positions.getZ(i), -positions.getX(i));
      const shiftedTheta = theta + warp * Math.sin(phi * 2 + phase);
      const p = bodyPoint(shiftedTheta, phi);
      p.addScaledVector(bodyNormal(p), offset);
      positions.setXYZ(i, p.x, p.y, p.z);
    }
    g.computeVertexNormals();
    return mesh(g, mat, V(0, 0, 0));
  }

  // Ivory lateral stripe, interrupted by bold, slightly crooked vermilion bars.
  for (const sidePhi of [Math.PI + 0.045, -0.045]) {
    skinPatch(sidePhi - 0.071, 0.142, 0.43, 2.36, ivory, 0.00055, 2, 32);
  }

  const redCenters = [0.62, 1.01, 1.40, 1.81, 2.21, 2.59];
  redCenters.forEach((theta, i) => {
    const width = i === 2 || i === 3 ? 0.17 : 0.13;
    const phase = i * 1.3;
    skinPatch(Math.PI - 0.95, 2.20, theta - width / 2, width,
      red, 0.001, 13, 3, 0.037, phase);
    skinPatch(-1.26, 2.22, theta - width / 2, width,
      red, 0.001, 13, 3, -0.032, phase + 0.5);
  });

  // Sparse pebble-like scales, particularly readable over the broad flank facets.
  for (const side of [1, -1]) {
    for (let row = 0; row < 11; row++) {
      for (let col = 0; col < 6; col++) {
        const theta = 0.55 + row * 0.188 + (random() - 0.5) * 0.08;
        const phi = (side > 0 ? Math.PI : 0) - 0.80 + col * 0.31 + (random() - 0.5) * 0.12;
        const p = bodyPoint(theta, phi);
        const n = bodyNormal(p);
        let mat: THREE.Material = gradient[
          bandColors[Math.min(19, Math.floor(theta / thetaStep))]
        ];
        const distanceToBar = Math.min(...redCenters.map(t => Math.abs(t - theta)));
        if (distanceToBar < 0.085) mat = random() > 0.5 ? redShadow : coral;
        else if (random() > 0.65) {
          const index = bandColors[Math.min(19, Math.floor(theta / thetaStep))];
          mat = gradient[Math.min(10, index + 1)];
        }
        const centerPhi = side > 0 ? Math.PI + 0.045 : -0.045;
        let delta = Math.abs(phi - centerPhi);
        delta = Math.min(delta, Math.abs(delta - tau));
        if (delta < 0.08 && distanceToBar > 0.10) mat = ivory;
        const size = 0.00115 + random() * 0.0008;
        const q = new THREE.Quaternion().setFromUnitVectors(forward, n);
        ellipsoid(p.addScaledVector(n, 0.00095), V(size, size * 0.8, 0.00055), mat, tinySphere, q);
      }
    }
  }

  // A tiny saw-tooth dorsal ridge follows the arched silhouette.
  for (let i = 0; i < 16; i++) {
    const z = -0.107 + i * 0.0144;
    const theta = Math.acos(THREE.MathUtils.clamp((z - CZ) / BZ, -1, 1));
    const p = bodyPoint(theta, Math.PI * 1.5);
    const height = 0.0065 + 0.004 * Math.sin((i / 15) * Math.PI);
    const mat = gradient[bandColors[Math.min(19, Math.floor(theta / thetaStep))]];
    mesh(
      new THREE.ConeGeometry(1, 1, 4), mat,
      p.add(V(0, height / 2 - 0.001, 0)),
      V(0.0034, height, 0.0067)
    );
  }

  // Curled sunset-orange tail, constructed from short polygonal tapered segments.
  const tailLead = new THREE.CatmullRomCurve3([
    V(0, 0.167, -0.109),
    V(0, 0.164, -0.148),
    V(0, 0.177, -0.196),
    V(0, 0.189, -0.238),
    V(0, 0.193, -0.267)
  ]).getPoints(15);

  const tailPath = tailLead.slice();
  const spiralSegments = 82;
  for (let i = 1; i <= spiralSegments; i++) {
    const t = i / spiralSegments;
    const angle = Math.PI / 2 + t * Math.PI * 3.55;
    const radius = THREE.MathUtils.lerp(0.067, 0.0085, t);
    tailPath.push(V(
      0.0015 * Math.sin(t * Math.PI),
      0.126 + radius * Math.sin(angle),
      -0.267 + radius * Math.cos(angle)
    ));
  }
  function tailRadius(i: number) {
    if (i <= 15) return THREE.MathUtils.lerp(0.0136, 0.0097, i / 15);
    return THREE.MathUtils.lerp(0.0097, 0.0022, (i - 15) / spiralSegments);
  }
  for (let i = 0; i < tailPath.length - 1; i++) {
    const t = Math.max(0, (i - 15) / spiralSegments);
    const colorIndex = Math.min(4, Math.floor(t * 5));
    const mat = i > 21 && i % 17 === 12 ? tailBand : tailColors[colorIndex];
    beam(tailPath[i], tailPath[i + 1], tailRadius(i), tailRadius(i + 1), mat, 8);
    const r = tailRadius(i);
    ellipsoid(tailPath[i], V(r, r, r), mat, tinySphere);
    if (i > 15 && i % 6 === 0) {
      for (const side of [-1, 1]) {
        ellipsoid(
          tailPath[i].clone().add(V(side * r * 0.94, 0.001, 0)),
          V(0.00065, r * 0.25, r * 0.29),
          colorIndex < 2 ? gradient[7] : tailColors[Math.max(0, colorIndex - 1)],
          tinySphere
        );
      }
    }
  }
  ellipsoid(tailPath[tailPath.length - 1], V(0.0022, 0.0022, 0.0022), tailColors[4], tinySphere);

  // Four separated elbowed limbs terminate in opposed, fused toe bundles.
  function foot(side: number, z: number, mat: THREE.Material) {
    const twig = twigAt(z);
    const x = twig.p.x, y = twig.p.y, r = twig.r;
    const palm = V(x + side * 0.010, y + r + 0.006, z);
    const wrist = V(x + side * 0.026, y + r + 0.016, z - side * 0.003);
    beam(wrist, palm, 0.0067, 0.0078, mat, 7);
    ellipsoid(palm, V(0.0125, 0.007, 0.013), mat, smallSphere);

    for (const outer of [true, false]) {
      const count = outer ? 2 : 3;
      const lobeZ = z + (outer ? -0.006 : 0.006);
      const lobe = V(x + side * (outer ? 0.015 : 0.002), y + r + 0.002, lobeZ);
      ellipsoid(lobe, V(0.008, 0.0065, outer ? 0.007 : 0.009), mat, tinySphere);
      for (let j = 0; j < count; j++) {
        const zz = lobeZ + (j - (count - 1) / 2) * 0.0043;
        const a = V(x + side * (outer ? 0.015 : 0.002), y + r + 0.003, zz);
        const b = V(x + side * (outer ? r + 0.006 : -r - 0.002), y + 0.003, zz + 0.001);
        const c = V(x + side * (outer ? r * 0.68 : -r * 0.71), y - r * 0.73, zz + 0.002);
        beam(a, b, 0.0031, 0.0028, mat, 6);
        beam(b, c, 0.0028, 0.0021, mat, 6);
        ellipsoid(b, V(0.0028, 0.0028, 0.0028), mat, tinySphere);
        const tip = c.clone().add(V(side * (outer ? -0.0038 : 0.0038), -0.0012, 0.001));
        beam(c, tip, 0.0017, 0.00035, clawColor, 5);
      }
    }
    return wrist;
  }

  function leg(
    side: number, front: boolean, footZ: number,
    shoulder: THREE.Vector3, elbow: THREE.Vector3,
    upperMat: THREE.Material, lowerMat: THREE.Material, footMat: THREE.Material
  ) {
    const wrist = foot(side, footZ, footMat);
    const upperRadius = front ? 0.0112 : 0.0144;
    ellipsoid(shoulder, V(upperRadius, upperRadius * 1.2, upperRadius * 1.15), upperMat, smallSphere);
    beam(shoulder, elbow, upperRadius, front ? 0.0087 : 0.0103, upperMat, 8);
    ellipsoid(elbow, V(0.010, 0.011, 0.010), lowerMat, smallSphere);
    beam(elbow, wrist, front ? 0.008 : 0.009, 0.0061, lowerMat, 8);

    const axis = elbow.clone().sub(shoulder).normalize();
    ring(shoulder.clone().lerp(elbow, 0.45), axis, upperRadius * 0.90, 0.0013, red, 12);
    ring(shoulder.clone().lerp(elbow, 0.70), axis, upperRadius * 0.82, 0.0010, red, 12);
    ellipsoid(
      elbow.clone().add(V(side * 0.008, 0.003, 0)),
      V(0.0016, 0.0035, 0.0045), ivory, tinySphere
    );
  }

  leg(1, true, 0.189, V(0.034, 0.185, 0.095), V(0.076, 0.131, 0.127),
    turquoise, mint, gradient[3]);
  leg(-1, true, 0.102, V(-0.034, 0.182, 0.095), V(-0.072, 0.132, 0.055),
    turquoise, gradient[2], lime);
  leg(1, false, -0.176, V(0.030, 0.166, -0.085), V(0.073, 0.119, -0.123),
    gradient[8], gradient[6], yellow);
  leg(-1, false, -0.059, V(-0.032, 0.163, -0.082), V(-0.073, 0.114, -0.058),
    orange, gradient[7], gradient[5]);

  // Broad angular skull, low casque, blunt snout and understated gular fringe.
  ellipsoid(V(0, 0.191, 0.127), V(0.031, 0.033, 0.040), turquoise, smallSphere);
  ellipsoid(V(0, 0.213, 0.171), V(0.044, 0.044, 0.057), turquoise, sphere);
  ellipsoid(V(0, 0.1835, 0.196), V(0.033, 0.013, 0.051), jawColor, smallSphere);

  const snout = mesh(
    new THREE.CylinderGeometry(0.019, 0.032, 0.075, 6, 1),
    turquoise, V(0, 0.202, 0.212), V(1, 1, 0.73)
  );
  snout.rotation.x = Math.PI / 2;

  ellipsoid(V(0, 0.247, 0.146), V(0.018, 0.027, 0.043), tealShadow, crestGeometry);
  const crestLine = [
    V(0, 0.255, 0.111), V(0, 0.273, 0.142), V(0, 0.260, 0.181)
  ];
  beam(crestLine[0], crestLine[1], 0.0024, 0.0022, crestLight, 6);
  beam(crestLine[1], crestLine[2], 0.0022, 0.0016, crestLight, 6);
  for (let i = 0; i < 6; i++) {
    const z = 0.116 + i * 0.011;
    const y = z < 0.142
      ? THREE.MathUtils.lerp(0.258, 0.273, (z - 0.116) / 0.026)
      : THREE.MathUtils.lerp(0.273, 0.261, (z - 0.142) / 0.029);
    beam(V(-0.006, y - 0.002, z), V(0.006, y - 0.002, z), 0.0014, 0.0014, turquoise, 5);
  }

  for (let i = 0; i < 8; i++) {
    const z = 0.114 + i * 0.011;
    const y = 0.155 + i * 0.0025;
    const m = mesh(
      new THREE.ConeGeometry(0.0028, 0.0055, 4),
      i < 4 ? turquoise : jawColor, V(0, y, z)
    );
    m.rotation.z = Math.PI;
  }

  for (const side of [-1, 1]) {
    const mouth = [
      V(side * 0.026, 0.192, 0.129),
      V(side * 0.038, 0.190, 0.160),
      V(side * 0.035, 0.191, 0.193),
      V(side * 0.026, 0.194, 0.220),
      V(side * 0.017, 0.196, 0.247)
    ];
    for (let i = 0; i < mouth.length - 1; i++) {
      beam(mouth[i], mouth[i + 1], 0.00105, 0.0009, tealDark, 6);
    }
    beam(V(side * 0.026, 0.181, 0.128), V(side * 0.033, 0.199, 0.145),
      0.0023, 0.0022, ivory, 6);
    beam(V(side * 0.033, 0.199, 0.145), V(side * 0.040, 0.205, 0.173),
      0.0022, 0.0017, ivory, 6);

    ellipsoid(V(side * 0.012, 0.214, 0.239), V(0.0018, 0.0012, 0.0023), tealDark, tinySphere);
    ellipsoid(V(side * 0.033, 0.222, 0.129), V(0.0019, 0.012, 0.004), red, tinySphere);
    ellipsoid(V(side * 0.038, 0.209, 0.146), V(0.0016, 0.006, 0.003), coral, tinySphere);

    for (let i = 0; i < 10; i++) {
      const z = 0.132 + random() * 0.060;
      const y = 0.201 + random() * 0.029;
      const dz = (z - 0.171) / 0.057;
      const dy = (y - 0.213) / 0.044;
      const x = 0.044 * Math.sqrt(Math.max(0.04, 1 - dz * dz - dy * dy));
      ellipsoid(
        V(side * (x + 0.0006), y, z),
        V(0.0007, 0.0015, 0.0017),
        i % 3 === 0 ? crestLight : tealShadow, tinySphere
      );
    }
  }

  // Skin-covered eye turrets: small gold apertures, not exposed eyeballs.
  function eye(center: THREE.Vector3, direction: THREE.Vector3) {
    const n = direction.clone().normalize();
    ellipsoid(center, V(0.022, 0.023, 0.023), turquoise, sphere);
    const q = new THREE.Quaternion().setFromUnitVectors(forward, n);
    ring(center.clone().addScaledVector(n, 0.0158), n, 0.0153, 0.0012, crestLight, 18);
    ring(center.clone().addScaledVector(n, 0.0200), n, 0.0100, 0.0017, tealShadow, 18);
    disk(center.clone().addScaledVector(n, 0.0220), n, 0.0079, 0.0012, eyeGold, 14);
    ellipsoid(
      center.clone().addScaledVector(n, 0.0230),
      V(0.0049, 0.0051, 0.0018), black, sphere, q
    );

    const u = up.clone().cross(n).normalize();
    const v = n.clone().cross(u).normalize();
    ellipsoid(
      center.clone().addScaledVector(n, 0.0250).addScaledVector(u, -0.0016).addScaledVector(v, 0.0018),
      V(0.00125, 0.00125, 0.00065), glint, tinySphere, q
    );
    for (let i = 0; i < 10; i++) {
      const angle = i * tau / 10;
      const radial = n.clone().multiplyScalar(0.67)
        .addScaledVector(u, Math.cos(angle) * 0.742)
        .addScaledVector(v, Math.sin(angle) * 0.742).normalize();
      const p = center.clone().addScaledVector(radial, 0.0231);
      const scaleQ = new THREE.Quaternion().setFromUnitVectors(forward, radial);
      ellipsoid(p, V(0.0018, 0.0013, 0.0005),
        i % 3 === 0 ? mint : crestLight, tinySphere, scaleQ);
    }
  }
  eye(V(0.044, 0.225, 0.179), V(0.83, 0.20, 0.52));
  eye(V(-0.044, 0.224, 0.168), V(-0.80, -0.07, -0.59));

  return model;
}
```