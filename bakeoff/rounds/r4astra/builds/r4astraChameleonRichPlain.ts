import * as THREE from "three";

export const meta = {
  name: "Prism on a Twig",
  description:
    "A jewel-coloured panther chameleon with independently aimed turret eyes, a serrated casque, gripping mitten feet, and an orange spiral tail.",
};

export default function (): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Panther chameleon on a twig";

  let seed = 197731;
  function rnd(): number {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const materials: THREE.MeshStandardMaterial[] = [];
  function material(color: string, roughness = 0.82): THREE.MeshStandardMaterial {
    const m = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      flatShading: true,
    });
    materials.push(m);
    return m;
  }

  const turquoise = material("#19aaa9");
  const turquoiseLight = material("#58cec0");
  const turquoiseDark = material("#127d86");
  const mint = material("#94dfbc");
  const throatColor = material("#63bdaa");
  const mouthColor = material("#214e50");
  const white = material("#eff0d5");
  const red = material("#bd393d");
  const redLight = material("#e25c48");
  const redDark = material("#91383c");
  const goldEye = material("#d7ca66", 0.55);
  const black = material("#10272b", 0.26);
  const glint = material("#ffffff", 0.18);
  const claw = material("#e5d5a8");

  // Ordered from the warm rump to the cool shoulders.
  const bodyColors = [
    material("#ed8a31"),
    material("#e4ad35"),
    material("#c6cb37"),
    material("#95ce39"),
    material("#63c747"),
    material("#31bc7b"),
    material("#20b6a2"),
  ];
  const scaleColors = [
    material("#ffad49"),
    material("#f2ca52"),
    material("#dce35b"),
    material("#b8e25b"),
    material("#8cdd65"),
    material("#62d499"),
    turquoiseLight,
  ];
  const tailOrange = material("#ef8638");
  const tailApricot = material("#f5a04c");
  const tailCoral = material("#e76f38");
  const tailRust = material("#c65333");
  const bark = material("#70503b");
  const barkDark = material("#47392e");
  const barkLight = material("#987450");
  const wood = material("#ccb17a");
  const woodRing = material("#ad8b58");
  const leafGreen = material("#6b9855");
  const leafLight = material("#99b86b");

  const sphere = new THREE.SphereGeometry(1, 12, 8);
  const smallSphere = new THREE.SphereGeometry(1, 8, 6);
  const scaleGeometry = new THREE.IcosahedronGeometry(1, 0);

  function mesh(
    geometry: THREE.BufferGeometry,
    mat: THREE.Material | THREE.Material[],
    name = ""
  ): THREE.Mesh {
    const m = new THREE.Mesh(geometry, mat);
    m.name = name;
    root.add(m);
    return m;
  }

  function ellipsoid(
    p: THREE.Vector3,
    s: THREE.Vector3,
    mat: THREE.Material,
    geometry: THREE.BufferGeometry = sphere,
    name = ""
  ): THREE.Mesh {
    const m = mesh(geometry, mat, name);
    m.position.copy(p);
    m.scale.copy(s);
    return m;
  }

  function rod(
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    mat: THREE.Material,
    sides = 8,
    name = ""
  ): THREE.Mesh {
    const d = b.clone().sub(a);
    const m = mesh(
      new THREE.CylinderGeometry(rb, ra, d.length(), sides, 1),
      mat,
      name
    );
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    return m;
  }

  function line(
    points: THREE.Vector3[],
    radius: number,
    mat: THREE.Material,
    sides = 6
  ): void {
    for (let i = 0; i < points.length - 1; i++) {
      rod(points[i], points[i + 1], radius, radius, mat, sides);
    }
  }

  function scaleDot(
    p: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
    mat: THREE.Material,
    elongation = 1
  ): void {
    const m = ellipsoid(
      p,
      V(radius, radius * elongation, radius * 0.32),
      mat,
      scaleGeometry
    );
    m.quaternion.setFromUnitVectors(V(0, 0, 1), normal.clone().normalize());
  }

  function groupedTriangles(
    geometry: THREE.BufferGeometry,
    choose: (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => THREE.MeshStandardMaterial
  ): void {
    const pos = geometry.getAttribute("position");
    const bins = new Map<number, number[]>();
    const a = V(0, 0, 0), b = V(0, 0, 0), c = V(0, 0, 0);
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i);
      b.fromBufferAttribute(pos, i + 1);
      c.fromBufferAttribute(pos, i + 2);
      const id = materials.indexOf(choose(a, b, c));
      if (!bins.has(id)) bins.set(id, []);
      bins.get(id)!.push(i, i + 1, i + 2);
    }
    const indices: number[] = [];
    geometry.clearGroups();
    bins.forEach((ids, materialIndex) => {
      geometry.addGroup(indices.length, ids.length, materialIndex);
      indices.push(...ids);
    });
    geometry.setIndex(indices);
  }

  // A crooked, lightly forked twig. Its thick, rear end rests on the floor.
  const branchPoints = [
    V(0.015, 0.012, -0.330),
    V(0.003, 0.030, -0.225),
    V(-0.006, 0.045, -0.130),
    V(0.003, 0.062, -0.035),
    V(0.004, 0.078, 0.068),
    V(-0.003, 0.097, 0.172),
    V(0.005, 0.107, 0.285),
  ];
  const branchRadii = [0.012, 0.0115, 0.0105, 0.0098, 0.009, 0.0078, 0.0056];

  function branchAt(z: number): { p: THREE.Vector3; r: number } {
    for (let i = 0; i < branchPoints.length - 1; i++) {
      if (z <= branchPoints[i + 1].z) {
        const t = THREE.MathUtils.clamp(
          (z - branchPoints[i].z) / (branchPoints[i + 1].z - branchPoints[i].z),
          0, 1
        );
        return {
          p: branchPoints[i].clone().lerp(branchPoints[i + 1], t),
          r: THREE.MathUtils.lerp(branchRadii[i], branchRadii[i + 1], t),
        };
      }
    }
    return { p: branchPoints[6].clone(), r: branchRadii[6] };
  }

  for (let i = 0; i < branchPoints.length - 1; i++) {
    const a = branchPoints[i], b = branchPoints[i + 1];
    rod(a, b, branchRadii[i], branchRadii[i + 1], bark, 9, "Faceted twig");
    if (i > 0) {
      ellipsoid(a, V(branchRadii[i], branchRadii[i], branchRadii[i]), bark, smallSphere);
    }
    const axis = b.clone().sub(a).normalize();
    const u = V(1, 0, 0).cross(axis).normalize();
    const v = axis.clone().cross(u).normalize();
    for (let j = 0; j < 6; j++) {
      const angle = j * Math.PI / 3 + i * 0.31;
      const radial = u.clone().multiplyScalar(Math.cos(angle))
        .addScaledVector(v, Math.sin(angle));
      const t0 = 0.08 + rnd() * 0.2;
      const t1 = 0.68 + rnd() * 0.24;
      const p0 = a.clone().lerp(b, t0).addScaledVector(
        radial, THREE.MathUtils.lerp(branchRadii[i], branchRadii[i + 1], t0) * 0.96
      );
      const p1 = a.clone().lerp(b, t1).addScaledVector(
        radial, THREE.MathUtils.lerp(branchRadii[i], branchRadii[i + 1], t1) * 0.96
      );
      rod(p0, p1, 0.00065, 0.00035, j % 2 ? barkDark : barkLight, 5);
    }
  }

  function cutEnd(p: THREE.Vector3, direction: THREE.Vector3, radius: number): void {
    const d = direction.clone().normalize();
    rod(p, p.clone().addScaledVector(d, 0.0007), radius * 0.84, radius * 0.84, wood, 9);
    const ring = mesh(new THREE.TorusGeometry(radius * 0.52, 0.00045, 4, 12), woodRing);
    ring.position.copy(p).addScaledVector(d, 0.0008);
    ring.quaternion.setFromUnitVectors(V(0, 0, 1), d);
    ellipsoid(
      p.clone().addScaledVector(d, 0.001),
      V(radius * 0.12, radius * 0.12, radius * 0.12),
      woodRing, scaleGeometry
    );
  }
  cutEnd(branchPoints[0], branchPoints[0].clone().sub(branchPoints[1]), branchRadii[0]);
  cutEnd(branchPoints[6], branchPoints[6].clone().sub(branchPoints[5]), branchRadii[6]);

  // The downward fork gives the twig a second natural support.
  const support = [branchAt(0.163).p, V(-0.044, 0.055, 0.148), V(-0.083, 0.004, 0.123)];
  rod(support[0], support[1], 0.006, 0.0047, bark, 7);
  rod(support[1], support[2], 0.0047, 0.0038, bark, 7);
  cutEnd(support[2], support[2].clone().sub(support[1]), 0.0038);

  const stubA = branchAt(-0.213).p;
  const stubB = V(0.052, 0.048, -0.237);
  const stubC = V(0.075, 0.046, -0.253);
  rod(stubA, stubB, 0.0055, 0.0034, bark, 7);
  rod(stubB, stubC, 0.0034, 0.0022, barkLight, 6);
  cutEnd(stubC, stubC.clone().sub(stubB), 0.0022);

  // One small fresh shoot, well away from the silhouette of the animal.
  const shootA = branchAt(0.237).p;
  const shootB = V(0.047, 0.128, 0.255);
  rod(shootA, shootB, 0.0028, 0.001, barkLight, 6);
  function leaf(base: THREE.Vector3, tip: THREE.Vector3, width: number, mat: THREE.Material): void {
    const d = tip.clone().sub(base);
    const m = ellipsoid(
      base.clone().add(tip).multiplyScalar(0.5),
      V(width, 0.0014, d.length() * 0.5),
      mat, new THREE.SphereGeometry(1, 8, 4), "Small leaf"
    );
    m.quaternion.setFromUnitVectors(V(0, 0, 1), d.clone().normalize());
    rod(base, tip, 0.00045, 0.00015, leafLight, 5);
  }
  leaf(shootB, V(0.084, 0.139, 0.267), 0.011, leafGreen);
  leaf(shootB, V(0.049, 0.151, 0.285), 0.008, leafLight);

  // Body: a compressed, angular sphere, painted rather than assembled as coloured beads.
  const bodyCenter = V(0, 0.172, -0.017);
  const bodyLength = 0.108;
  function bodyPoint(n: THREE.Vector3): THREE.Vector3 {
    return V(
      n.x * 0.036 * (1 - 0.12 * n.z),
      bodyCenter.y + 0.014 * n.z + n.y * (n.y >= 0 ? 0.063 : 0.041),
      bodyCenter.z + n.z * bodyLength
    );
  }
  function colorIndex(z: number): number {
    return THREE.MathUtils.clamp(Math.floor((z + 0.125) / 0.216 * 7), 0, 6);
  }
  const barCenters = [-0.099, -0.065, -0.027, 0.012, 0.048, 0.076];

  function skinMaterial(n: THREE.Vector3): THREE.MeshStandardMaterial {
    const z = bodyCenter.z + n.z * bodyLength;
    const radial = Math.sqrt(n.x * n.x + n.y * n.y);
    const sy = n.y / Math.max(radial, 0.0001);
    const side = Math.abs(n.x) / Math.max(radial, 0.0001);
    for (let j = 0; j < barCenters.length; j++) {
      const shift = 0.009 * sy + 0.0028 * Math.sin(sy * 7 + j * 1.7);
      const width = j === 0 || j === 5 ? 0.005 : 0.007;
      if (Math.abs(z - barCenters[j] - shift) < width && sy > -0.86 && sy < 0.96) {
        return sy < -0.4 ? redDark : red;
      }
    }
    if (Math.abs(sy + 0.025) < 0.13 && side > 0.8) return white;
    return bodyColors[colorIndex(z)];
  }

  const bodyGeometry = new THREE.SphereGeometry(1, 32, 26)
    .rotateX(Math.PI / 2).toNonIndexed();
  groupedTriangles(bodyGeometry, (a, b, c) =>
    skinMaterial(a.clone().add(b).add(c).multiplyScalar(1 / 3))
  );
  const bodyPositions = bodyGeometry.getAttribute("position");
  for (let i = 0; i < bodyPositions.count; i++) {
    const p = bodyPoint(V(
      bodyPositions.getX(i), bodyPositions.getY(i), bodyPositions.getZ(i)
    ));
    bodyPositions.setXYZ(i, p.x, p.y, p.z);
  }
  bodyPositions.needsUpdate = true;
  bodyGeometry.computeVertexNormals();
  mesh(bodyGeometry, materials, "Turquoise, lime and orange painted body");

  // Ordered little scale jewels; the underlying large facets remain visible.
  for (const side of [-1, 1]) {
    for (let column = 0; column < 18; column++) {
      const nz = -0.89 + column * 0.101 + (rnd() - 0.5) * 0.022;
      const ringRadius = Math.sqrt(1 - nz * nz);
      for (const rowAngle of [-0.73, -0.43, 0.24, 0.51, 0.78, 1.02]) {
        const angle = rowAngle + (rnd() - 0.5) * 0.10;
        const n = V(side * ringRadius * Math.cos(angle), ringRadius * Math.sin(angle), nz);
        const p = bodyPoint(n);
        const normal = V(n.x / 0.036, n.y / (n.y > 0 ? 0.063 : 0.041), n.z / bodyLength).normalize();
        p.addScaledVector(normal, 0.00045);
        const base = skinMaterial(n);
        const mat = base === red || base === redDark
          ? (rnd() > 0.35 ? redLight : redDark)
          : base === white ? white : scaleColors[colorIndex(p.z)];
        scaleDot(p, normal, 0.0011 + rnd() * 0.0008, mat, 0.85 + rnd() * 0.4);
      }
    }
  }

  // Short saw-tooth dorsal scales.
  for (let i = 0; i < 20; i++) {
    const nz = -0.93 + i * 0.096;
    const n = V(0, Math.sqrt(Math.max(0, 1 - nz * nz)), nz);
    const p = bodyPoint(n);
    const h = 0.004 + 0.0035 * Math.sin((i + 1) / 21 * Math.PI);
    const normal = V(0, 1, nz * 0.44).normalize();
    rod(p.clone().addScaledVector(normal, -0.001), p.clone().addScaledVector(normal, h),
      0.0032, 0, scaleColors[colorIndex(p.z)], 4, "Dorsal ridge tooth");
  }

  // Continuous tapered spiral: low-sided tube, not a stack of disconnected beads.
  const tailPoints = [
    V(0, 0.158, -0.116),
    V(0, 0.166, -0.139),
    V(0, 0.172, -0.168),
  ];
  const spiralTurns = Math.PI * 3.1;
  for (let i = 0; i <= 90; i++) {
    const t = spiralTurns * i / 90;
    const r = THREE.MathUtils.lerp(0.054, 0.0095, i / 90);
    tailPoints.push(V(0, 0.118 + r * Math.cos(t), -0.196 - r * Math.sin(t)));
  }
  const tailCurve = new THREE.CatmullRomCurve3(tailPoints, false, "centripetal");
  const tailSegments = 144;
  const tailSides = 8;
  const tailGeometry = new THREE.TubeGeometry(tailCurve, tailSegments, 1, tailSides, false);
  const tp = tailGeometry.getAttribute("position");
  function tailRadius(u: number): number {
    return 0.0021 + 0.0114 * Math.pow(1 - u, 0.94);
  }
  for (let i = 0; i <= tailSegments; i++) {
    const u = i / tailSegments;
    const center = tailCurve.getPointAt(u);
    for (let j = 0; j <= tailSides; j++) {
      const index = i * (tailSides + 1) + j;
      const p = V(tp.getX(index), tp.getY(index), tp.getZ(index));
      p.sub(center).multiplyScalar(tailRadius(u)).add(center);
      tp.setXYZ(index, p.x, p.y, p.z);
    }
  }
  tailGeometry.clearGroups();
  for (let i = 0; i < tailSegments; i++) {
    const u = i / tailSegments;
    let m = u < 0.16 ? bodyColors[0] : u < 0.70 ? tailOrange : tailCoral;
    if (i > 10 && i % 19 === 0) m = tailRust;
    tailGeometry.addGroup(i * tailSides * 6, tailSides * 6, materials.indexOf(m));
  }
  tailGeometry.computeVertexNormals();
  mesh(tailGeometry, materials, "Tightly coiled prehensile tail");
  ellipsoid(tailCurve.getPointAt(1), V(0.0022, 0.0022, 0.0022), tailCoral, smallSphere);

  for (const side of [-1, 1]) {
    for (let i = 0; i < 39; i++) {
      const u = 0.05 + i * 0.0238;
      const p = tailCurve.getPointAt(u);
      p.x += side * tailRadius(u) * 0.98;
      scaleDot(p, V(side, 0, 0), (0.00135 - u * 0.00065),
        i % 6 === 0 ? tailRust : tailApricot, 1.15);
    }
  }

  // Limbs are splayed and staggered, with the characteristic elbow/knee angles.
  function makeFoot(z: number, side: number, mat: THREE.Material): THREE.Vector3 {
    const info = branchAt(z);
    const b = info.p;
    const r = info.r;
    const palm = V(b.x + side * 0.008, b.y + r + 0.005, z);
    ellipsoid(palm, V(0.0085, 0.0055, 0.011), mat, smallSphere, "Mitten palm");

    // Three fused fingers reach over the far side.
    for (let i = 0; i < 3; i++) {
      const dz = (i - 1) * 0.0041;
      const points = [
        V(b.x + side * 0.007, b.y + r + 0.005, z + dz),
        V(b.x - side * 0.003, b.y + r + 0.004, z + dz),
        V(b.x - side * (r + 0.002), b.y + 0.005, z + dz + 0.001),
        V(b.x - side * (r + 0.001), b.y - 0.0025, z + dz + 0.002),
      ];
      line(points, 0.0025, mat);
      const end = points[3];
      rod(end, end.clone().add(V(side * 0.003, -0.003, 0.001)),
        0.00135, 0.0002, claw, 5);
    }

    // The opposed two-finger mitten closes underneath the near side.
    for (let i = 0; i < 2; i++) {
      const dz = (i - 0.5) * 0.0045;
      const points = [
        V(b.x + side * 0.012, b.y + r + 0.003, z + dz),
        V(b.x + side * (r + 0.006), b.y + 0.004, z + dz),
        V(b.x + side * (r + 0.004), b.y - 0.004, z + dz + 0.001),
        V(b.x + side * (r - 0.001), b.y - 0.007, z + dz + 0.002),
      ];
      line(points, 0.0028, mat);
      rod(points[3], points[3].clone().add(V(-side * 0.003, 0.0005, 0.001)),
        0.0013, 0.00015, claw, 5);
    }
    return palm;
  }

  function limb(
    hip: THREE.Vector3,
    elbow: THREE.Vector3,
    footZ: number,
    side: number,
    upperMat: THREE.Material,
    lowerMat: THREE.Material,
    footMat: THREE.Material,
    thickness: number
  ): void {
    const wrist = makeFoot(footZ, side, footMat);
    ellipsoid(hip, V(thickness * 1.15, thickness * 1.28, thickness * 1.35),
      upperMat, sphere, "Limb root");
    rod(hip, elbow, thickness, thickness * 0.71, upperMat, 9);
    ellipsoid(elbow, V(thickness * 0.77, thickness * 0.77, thickness * 0.77),
      lowerMat, smallSphere);
    rod(elbow, wrist, thickness * 0.67, 0.0045, lowerMat, 8);
    ellipsoid(wrist, V(0.0055, 0.005, 0.006), footMat, smallSphere);

    const a = hip.clone().lerp(elbow, 0.45);
    const b = hip.clone().lerp(elbow, 0.59);
    rod(a, b, thickness * 0.89, thickness * 0.84, red, 9);
    const c = elbow.clone().lerp(wrist, 0.37);
    const d = elbow.clone().lerp(wrist, 0.47);
    rod(c, d, thickness * 0.60, thickness * 0.58, redLight, 8);

    for (let i = 0; i < 5; i++) {
      const u = 0.15 + i * 0.14;
      const p = elbow.clone().lerp(wrist, u);
      p.x += side * thickness * (0.64 - u * 0.19);
      scaleDot(p, V(side, 0.2, 0), 0.00125, footMat);
    }
  }

  limb(V(0.027, 0.174, 0.061), V(0.062, 0.142, 0.105),
    0.161, 1, bodyColors[5], turquoise, turquoiseLight, 0.0094);
  limb(V(-0.027, 0.172, 0.057), V(-0.061, 0.129, 0.030),
    0.105, -1, bodyColors[5], turquoise, turquoiseLight, 0.0091);
  limb(V(0.027, 0.157, -0.077), V(0.065, 0.111, -0.127),
    -0.080, 1, bodyColors[2], bodyColors[1], scaleColors[2], 0.012);
  limb(V(-0.026, 0.153, -0.089), V(-0.060, 0.096, -0.157),
    -0.141, -1, bodyColors[1], bodyColors[0], scaleColors[1], 0.0115);

  // Throat, angular skull, and short square-ended muzzle.
  ellipsoid(V(0, 0.177, 0.119), V(0.023, 0.019, 0.032),
    throatColor, sphere, "Expandable throat");
  ellipsoid(V(0, 0.207, 0.120), V(0.0315, 0.034, 0.047),
    turquoise, sphere, "Head");
  ellipsoid(V(0, 0.199, 0.159), V(0.026, 0.019, 0.027),
    turquoise, new THREE.SphereGeometry(1, 10, 6), "Broad muzzle");
  ellipsoid(V(0, 0.184, 0.145), V(0.0235, 0.009, 0.036),
    turquoiseLight, smallSphere, "Lower jaw");

  // A low, slanted four-sided casque, with an emphatic serrated upper edge.
  const casqueGeometry = new THREE.ConeGeometry(1, 1, 4, 1);
  const cp = casqueGeometry.getAttribute("position");
  for (let i = 0; i < cp.count; i++) {
    const y = cp.getY(i);
    const t = y + 0.5;
    cp.setXYZ(i,
      cp.getX(i) * 0.029,
      0.213 + t * 0.045,
      0.116 + cp.getZ(i) * 0.041 - t * 0.026
    );
  }
  casqueGeometry.computeVertexNormals();
  mesh(casqueGeometry, turquoise, "Angular casque");
  const casqueRidge = [
    V(0, 0.232, 0.073),
    V(0, 0.247, 0.080),
    V(0, 0.258, 0.090),
    V(0, 0.250, 0.104),
    V(0, 0.239, 0.119),
    V(0, 0.228, 0.135),
    V(0, 0.218, 0.153),
  ];
  line(casqueRidge, 0.0021, turquoiseLight, 5);
  for (let i = 0; i < casqueRidge.length - 1; i++) {
    for (let j = 0; j < 2; j++) {
      const p = casqueRidge[i].clone().lerp(casqueRidge[i + 1], j / 2);
      rod(p, p.clone().add(V(0, 0.0055, -0.001)),
        0.0028, 0, i < 3 ? turquoiseDark : mint, 4, "Casque ridge scale");
    }
  }

  // Mouth seams and white cheek stripes join the flank marking.
  for (const side of [-1, 1]) {
    line([
      V(side * 0.012, 0.191, 0.183),
      V(side * 0.023, 0.188, 0.171),
      V(side * 0.027, 0.1855, 0.146),
      V(side * 0.027, 0.187, 0.120),
      V(side * 0.024, 0.191, 0.107),
    ], 0.00125, mouthColor, 6);

    line([
      V(side * 0.024, 0.1825, 0.154),
      V(side * 0.026, 0.181, 0.132),
      V(side * 0.025, 0.182, 0.110),
      V(side * 0.023, 0.181, 0.086),
    ], 0.0024, white, 6);

    ellipsoid(V(side * 0.0195, 0.207, 0.173),
      V(0.0015, 0.00135, 0.0021), turquoiseDark, smallSphere, "Nostril");

    // A small red cheek flash and mosaic-like surrounding scales.
    for (let i = 0; i < 22; i++) {
      const z = 0.095 + rnd() * 0.068;
      const y = 0.194 + rnd() * 0.016;
      const x = side * (0.029 - Math.abs(z - 0.123) * 0.10);
      const mat = i < 7 ? redLight : i % 3 === 0 ? mint : turquoiseLight;
      scaleDot(V(x, y, z), V(side, 0.15, 0.12), 0.0012 + rnd() * 0.0008, mat);
    }
  }
  for (let i = 0; i < 9; i++) {
    const z = 0.101 + i * 0.007;
    rod(V(0, 0.160 + i * 0.0018, z),
      V(0, 0.156 + i * 0.0021, z + 0.001),
      0.0021, 0, mint, 4);
  }

  // Turret eyes: one surveys ahead, the other looks back along the twig.
  function eye(side: number, gaze: THREE.Vector3): void {
    gaze.normalize();
    const base = V(side * 0.0275, 0.219, 0.137);
    ellipsoid(base, V(0.018, 0.020, 0.020), turquoise, sphere, "Turret eye base");

    const collarStart = base.clone().addScaledVector(gaze, 0.006);
    const aperture = base.clone().addScaledVector(gaze, 0.022);
    rod(collarStart, aperture, 0.0152, 0.0071, turquoiseLight, 12, "Directional eye turret");

    const lid = mesh(new THREE.TorusGeometry(0.0067, 0.0016, 5, 14), turquoiseDark, "Circular eyelid");
    lid.position.copy(aperture);
    lid.quaternion.setFromUnitVectors(V(0, 0, 1), gaze);

    const irisCenter = aperture.clone().addScaledVector(gaze, 0.0008);
    const iris = ellipsoid(irisCenter, V(0.0054, 0.0054, 0.0015), goldEye, smallSphere);
    iris.quaternion.setFromUnitVectors(V(0, 0, 1), gaze);
    const pupilCenter = irisCenter.clone().addScaledVector(gaze, 0.0013);
    const pupil = ellipsoid(pupilCenter, V(0.0036, 0.0036, 0.0013), black, sphere, "Small round pupil");
    pupil.quaternion.setFromUnitVectors(V(0, 0, 1), gaze);

    const u = V(0, 1, 0).cross(gaze).normalize();
    const v = gaze.clone().cross(u).normalize();
    const shine = pupilCenter.clone().addScaledVector(gaze, 0.00125)
      .addScaledVector(u, -0.00085).addScaledVector(v, 0.0011);
    ellipsoid(shine, V(0.0009, 0.0009, 0.0009), glint, smallSphere);

    for (let i = 0; i < 12; i++) {
      const theta = i * Math.PI / 6;
      const radial = u.clone().multiplyScalar(Math.cos(theta)).addScaledVector(v, Math.sin(theta));
      const p = base.clone().addScaledVector(gaze, 0.0135).addScaledVector(radial, 0.0115);
      scaleDot(p, gaze.clone().multiplyScalar(0.55).add(radial),
        0.00115, i % 4 === 0 ? redLight : turquoise, 1.25);
    }
  }
  eye(1, V(0.79, 0.10, 0.60));
  eye(-1, V(-0.91, 0.19, -0.37));

  // Adult panther-chameleon scale, with the twig touching y = 0.
  root.scale.setScalar(0.82);
  return root;
}
