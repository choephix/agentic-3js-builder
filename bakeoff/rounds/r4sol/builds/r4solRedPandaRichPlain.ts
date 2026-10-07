import * as THREE from "three";

export const meta = {
  name: "Bamboo Balancing Act",
  description:
    "A delighted, russet-red panda balances on a gnarled mossy branch, clutching fresh bamboo while its enormous cream-ringed tail curls beside it.",
};

export default function (): THREE.Object3D {
  const scene = new THREE.Group();
  scene.name = "Red panda on a mossy branch";

  let seed = 21873;
  function random(): number {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const range = (a: number, b: number) => a + (b - a) * random();
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

  const fur = material("#a84425");
  const furShade = material("#82361f");
  const furLight = material("#cb6334");
  const cream = material("#f7ecd6");
  const tailCream = material("#eed5a4");
  const tailGinger = material("#c76a35");
  const charcoal = material("#242022");
  const charcoalLight = material("#382c2c");
  const black = material("#151519", 0.35);
  const eyeGlint = material("#fffaf0", 0.22);
  const innerEar = material("#a55b48");
  const innerEarDark = material("#6c3b34");
  const tongue = material("#df928c");
  const claw = material("#c9bba4");
  const whisker = material("#c6bda7");
  const bark = material("#624631");
  const barkDark = material("#3d2c24");
  const barkLight = material("#846044");
  const wood = material("#c49661");
  const woodRing = material("#8b633e");
  const mossDark = material("#405731");
  const moss = material("#667f3d");
  const mossLight = material("#96ad50");
  const bamboo = material("#548d43");
  const bambooLight = material("#83ac50");
  const bambooNode = material("#c0ca7b");
  const leafDark = material("#357344");
  const leafLight = material("#70a648");
  const fungus = material("#bc894e");
  const fungusEdge = material("#e0c79d");
  const stone = material("#74776a");

  const round = new THREE.SphereGeometry(1, 12, 8);
  const smallRound = new THREE.SphereGeometry(1, 8, 5);
  const mossGeometry = new THREE.SphereGeometry(1, 7, 4);
  const faceted = new THREE.DodecahedronGeometry(1, 0);
  const leafGeometry = new THREE.SphereGeometry(1, 4, 2);

  function blob(
    parent: THREE.Object3D,
    mat: THREE.Material,
    position: THREE.Vector3,
    scale: THREE.Vector3,
    geometry: THREE.BufferGeometry = round
  ) {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.copy(position);
    mesh.scale.copy(scale);
    parent.add(mesh);
    return mesh;
  }

  function rod(
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    radiusA: number,
    radiusB: number,
    mat: THREE.Material,
    sides = 8
  ) {
    const delta = b.clone().sub(a);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusB, radiusA, delta.length(), sides, 1),
      mat
    );
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Y, delta.normalize());
    parent.add(mesh);
    return mesh;
  }

  function point(
    parent: THREE.Object3D,
    base: THREE.Vector3,
    tip: THREE.Vector3,
    radius: number,
    mat: THREE.Material,
    sides = 5
  ) {
    return rod(parent, base, tip, radius, 0, mat, sides);
  }

  function curvedLine(
    parent: THREE.Object3D,
    points: THREE.Vector3[],
    radius: number,
    mat: THREE.Material,
    segments = 12
  ) {
    const curve = new THREE.CatmullRomCurve3(points);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, segments, radius, 5, false),
      mat
    );
    parent.add(mesh);
    return mesh;
  }

  function ring(
    parent: THREE.Object3D,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
    thickness: number,
    mat: THREE.Material,
    segments = 20
  ) {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(radius, thickness, 4, segments),
      mat
    );
    mesh.position.copy(center);
    mesh.quaternion.setFromUnitVectors(Z, normal.clone().normalize());
    parent.add(mesh);
    return mesh;
  }

  // A low, fallen limb, supported by its own knotted forks.
  const branch = new THREE.Group();
  branch.name = "Gnarled branch with moss and exposed end grain";
  scene.add(branch);

  const logPoints = [
    v(-0.89, 0.17, -0.15),
    v(-0.61, 0.235, -0.09),
    v(-0.31, 0.27, -0.035),
    v(0, 0.29, 0.01),
    v(0.29, 0.305, 0.035),
    v(0.57, 0.315, 0.11),
    v(0.82, 0.285, 0.23),
  ];
  const logRadii = [0.085, 0.098, 0.102, 0.099, 0.09, 0.083, 0.071];

  for (let i = 0; i < logPoints.length - 1; i++) {
    const a = logPoints[i];
    const b = logPoints[i + 1];
    rod(branch, a, b, logRadii[i], logRadii[i + 1], bark, 9);
    if (i > 0) {
      blob(
        branch,
        bark,
        a,
        v(logRadii[i] * 1.05, logRadii[i], logRadii[i]),
        smallRound
      );
    }

    const axis = b.clone().sub(a).normalize();
    const side = axis.clone().cross(Y).normalize();
    const up = side.clone().cross(axis).normalize();
    for (let j = 0; j < 7; j++) {
      const angle = j * Math.PI * 2 / 7 + range(-0.13, 0.13);
      const outward = side.clone().multiplyScalar(Math.cos(angle))
        .addScaledVector(up, Math.sin(angle));
      const t0 = range(0.06, 0.22);
      const t1 = range(0.68, 0.97);
      const p0 = a.clone().lerp(b, t0)
        .addScaledVector(outward, THREE.MathUtils.lerp(logRadii[i], logRadii[i + 1], t0) * 0.99);
      const p1 = a.clone().lerp(b, t1)
        .addScaledVector(outward, THREE.MathUtils.lerp(logRadii[i], logRadii[i + 1], t1) * 0.99);
      rod(branch, p0, p1, range(0.004, 0.008), range(0.003, 0.006),
        j % 3 === 0 ? barkLight : barkDark, 5);
    }
  }

  function woodyFork(points: THREE.Vector3[], radii: number[]) {
    for (let i = 0; i < points.length - 1; i++) {
      rod(branch, points[i], points[i + 1], radii[i], radii[i + 1], bark, 7);
      if (i > 0) blob(branch, bark, points[i], v(radii[i], radii[i], radii[i]), smallRound);
    }
  }

  woodyFork(
    [v(-0.64, 0.225, -0.08), v(-0.73, 0.10, -0.13), v(-0.88, 0.057, -0.19)],
    [0.081, 0.075, 0.057]
  );
  woodyFork(
    [v(-0.73, 0.105, -0.13), v(-0.66, 0.061, 0.06), v(-0.55, 0.033, 0.19)],
    [0.061, 0.048, 0.03]
  );
  woodyFork(
    [v(0.48, 0.307, 0.09), v(0.60, 0.14, 0.005), v(0.72, 0.061, -0.075)],
    [0.078, 0.068, 0.059]
  );
  woodyFork(
    [v(0.60, 0.14, 0.005), v(0.63, 0.054, 0.18), v(0.74, 0.034, 0.30)],
    [0.052, 0.044, 0.032]
  );
  woodyFork(
    [v(-0.51, 0.25, -0.12), v(-0.55, 0.405, -0.25), v(-0.61, 0.445, -0.32)],
    [0.033, 0.022, 0.012]
  );

  function cutEnd(center: THREE.Vector3, direction: THREE.Vector3, radius: number) {
    const n = direction.clone().normalize();
    const face = center.clone().addScaledVector(n, 0.003);
    rod(branch, center, face.clone().addScaledVector(n, 0.003), radius, radius, wood, 9);
    for (const fraction of [0.29, 0.55, 0.82]) {
      ring(branch, face.clone().addScaledVector(n, 0.004), n,
        radius * fraction, 0.0015, woodRing, 18);
    }
    const tangent = n.clone().cross(Y).normalize();
    rod(
      branch,
      face.clone().addScaledVector(tangent, radius * 0.52).addScaledVector(n, 0.005),
      face.clone().addScaledVector(tangent, radius * 0.96).addScaledVector(n, 0.005),
      0.0014, 0.002, barkDark, 4
    );
  }
  cutEnd(logPoints[6], logPoints[6].clone().sub(logPoints[5]), 0.068);
  cutEnd(logPoints[0], logPoints[0].clone().sub(logPoints[1]), 0.08);
  cutEnd(v(-0.61, 0.445, -0.32), v(-0.06, 0.04, -0.07), 0.011);

  for (const p of [v(-0.39, 0.258, 0.057), v(0.37, 0.29, 0.126)]) {
    blob(branch, barkDark, p, v(0.019, 0.03, 0.007), smallRound);
    const knot = ring(branch, p.clone().add(v(0, 0, 0.004)), v(0, 0.12, 1),
      0.027, 0.004, barkLight, 12);
    knot.scale.set(0.76, 1.16, 1);
  }

  // Moss grows in little faceted cushions, leaving the balancing feet visible.
  for (let i = 0; i < 48; i++) {
    const segment = Math.floor(random() * 6);
    const t = random();
    const p = logPoints[segment].clone().lerp(logPoints[segment + 1], t);
    if (Math.abs(p.x) < 0.20 && random() < 0.82) continue;
    const r = THREE.MathUtils.lerp(logRadii[segment], logRadii[segment + 1], t);
    const angle = range(-0.65, 0.8);
    p.y += Math.cos(angle) * r;
    p.z += Math.sin(angle) * r;
    const width = range(0.035, 0.068);
    const green = [mossDark, moss, mossLight][Math.floor(random() * 3)];
    blob(branch, green, p, v(width, range(0.014, 0.024), width * range(0.6, 1.05)),
      mossGeometry);
    for (let j = 0; j < 2; j++) {
      const start = p.clone().add(v(range(-0.021, 0.021), 0.012, range(-0.02, 0.02)));
      point(branch, start, start.clone().add(v(range(-0.009, 0.009),
        range(0.016, 0.034), range(-0.006, 0.006))), 0.0045, mossLight, 3);
    }
  }

  for (const [x, z, s] of [[-0.77, 0.085, 0.065], [0.69, -0.15, 0.068], [0.52, 0.22, 0.039]]) {
    blob(branch, stone, v(x, s * 0.37, z), v(s, s * 0.4, s * 0.75), faceted);
    blob(branch, mossDark, v(x - 0.013, s * 0.68, z),
      v(s * 0.75, s * 0.16, s * 0.55), mossGeometry);
  }

  // Three tiny shelf fungi on the front of the old wood.
  for (let i = 0; i < 3; i++) {
    const p = v(-0.59 + i * 0.063, 0.242 - i * 0.035, 0.012 + i * 0.014);
    blob(branch, fungusEdge, p, v(0.048 - i * 0.008, 0.013, 0.043), smallRound);
    blob(branch, fungus, p.clone().add(v(0, 0.007, -0.005)),
      v(0.048 - i * 0.008, 0.013, 0.037), smallRound);
  }

  const panda = new THREE.Group();
  panda.name = "Delighted red panda";
  scene.add(panda);

  // Pear-shaped body, black underside, and angular red shoulder ruff.
  blob(panda, fur, v(0, 0.716, -0.018), v(0.211, 0.246, 0.173));
  blob(panda, furShade, v(0, 0.731, -0.085), v(0.182, 0.221, 0.125));
  blob(panda, charcoal, v(0, 0.688, 0.096), v(0.174, 0.219, 0.102));
  blob(panda, charcoalLight, v(0, 0.669, 0.178), v(0.112, 0.15, 0.019), smallRound);
  blob(panda, fur, v(0, 0.872, 0.005), v(0.133, 0.119, 0.122));

  for (const sign of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const y = 0.647 + i * 0.068;
      const x = sign * (0.171 + (i === 1 || i === 2 ? 0.017 : 0));
      point(panda, v(x, y, -0.012),
        v(x + sign * 0.05, y - 0.025, -0.005),
        0.029, i % 2 ? furLight : fur, 5);
    }
    blob(panda, furLight, v(sign * 0.137, 0.864, 0.076),
      v(0.077, 0.065, 0.042), faceted);
  }
  for (let i = 0; i < 5; i++) {
    blob(panda, i % 2 ? fur : furLight, v(0, 0.64 + i * 0.053, -0.18),
      v(0.08 - i * 0.007, 0.046, 0.021), faceted);
  }

  // Two separate hind legs and broad, gripping feet.
  for (const sign of [-1, 1]) {
    const footY = sign === 1 ? 0.419 : 0.407;
    blob(panda, charcoal, v(sign * 0.12, 0.571, -0.001), v(0.091, 0.126, 0.092));
    rod(panda, v(sign * 0.129, 0.559, 0.012),
      v(sign * 0.137, footY + 0.033, 0.057), 0.067, 0.047, charcoal, 8);
    blob(panda, charcoal, v(sign * 0.132, footY, 0.105),
      v(0.073, 0.039, 0.099), smallRound);
    for (let j = -1; j <= 1; j++) {
      const x = sign * 0.132 + j * 0.034;
      blob(panda, charcoalLight, v(x, footY - 0.002, 0.178),
        v(0.024, 0.027, 0.035), smallRound);
      point(panda, v(x, footY + 0.003, 0.198),
        v(x, footY - 0.005, 0.22), 0.007, claw, 5);
    }
  }

  // The huge tail is a single faceted tube with uninterrupted cream/ginger bands.
  const tailCurve = new THREE.CatmullRomCurve3([
    v(-0.07, 0.579, -0.168),
    v(-0.24, 0.55, -0.215),
    v(-0.43, 0.454, -0.17),
    v(-0.61, 0.455, -0.072),
    v(-0.75, 0.535, -0.01),
    v(-0.81, 0.665, 0.012),
    v(-0.795, 0.782, 0.025),
  ]);
  const tailSegments = 44;
  const tailSides = 10;
  const tailGeometry = new THREE.TubeGeometry(tailCurve, tailSegments, 1, tailSides, false);
  const positions = tailGeometry.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i <= tailSegments; i++) {
    const t = i / tailSegments;
    const center = tailCurve.getPointAt(t);
    let radius = 0.060 + 0.048 * Math.sin(Math.PI * t);
    if (t > 0.8) radius *= THREE.MathUtils.lerp(1, 0.21, (t - 0.8) / 0.2);
    radius *= 1 + 0.035 * Math.sin(t * Math.PI * 22);
    for (let j = 0; j <= tailSides; j++) {
      const index = i * (tailSides + 1) + j;
      const p = v(positions.getX(index), positions.getY(index), positions.getZ(index));
      p.sub(center).multiplyScalar(radius).add(center);
      positions.setXYZ(index, p.x, p.y, p.z);
    }
  }
  positions.needsUpdate = true;
  tailGeometry.computeVertexNormals();
  tailGeometry.clearGroups();
  for (let band = 0; band < 11; band++) {
    tailGeometry.addGroup(band * 4 * tailSides * 6, 4 * tailSides * 6, band % 2);
  }
  const tailMesh = new THREE.Mesh(tailGeometry, [tailGinger, tailCream]);
  tailMesh.name = "Eleven bold fluffy tail rings";
  panda.add(tailMesh);
  blob(panda, tailGinger, tailCurve.getPointAt(1), v(0.013, 0.016, 0.013), smallRound);

  // One arm extended for balance.
  blob(panda, charcoal, v(-0.172, 0.827, 0.027), v(0.074, 0.082, 0.073));
  rod(panda, v(-0.181, 0.815, 0.034), v(-0.30, 0.767, 0.072),
    0.064, 0.051, charcoal);
  blob(panda, charcoal, v(-0.3, 0.767, 0.072), v(0.051, 0.055, 0.053), smallRound);
  rod(panda, v(-0.30, 0.772, 0.077), v(-0.433, 0.813, 0.145),
    0.047, 0.037, charcoal);
  const balancePaw = blob(panda, charcoal, v(-0.459, 0.827, 0.159),
    v(0.055, 0.05, 0.045), smallRound);
  balancePaw.rotation.z = -0.30;
  blob(panda, charcoalLight, v(-0.466, 0.827, 0.196),
    v(0.031, 0.028, 0.008), smallRound);
  for (let i = 0; i < 3; i++) {
    blob(panda, charcoal, v(-0.488 + i * 0.021, 0.863 + (i === 1 ? 0.007 : 0), 0.173),
      v(0.016, 0.024, 0.021), smallRound);
  }

  // The other forelimb bends around its treasured bamboo.
  blob(panda, charcoal, v(0.172, 0.829, 0.035), v(0.07, 0.083, 0.071));
  rod(panda, v(0.184, 0.815, 0.038), v(0.279, 0.751, 0.135),
    0.061, 0.048, charcoal);
  blob(panda, charcoal, v(0.279, 0.755, 0.135), v(0.049, 0.052, 0.053), smallRound);
  rod(panda, v(0.278, 0.764, 0.141), v(0.365, 0.834, 0.232),
    0.046, 0.038, charcoal);
  blob(panda, charcoal, v(0.379, 0.85, 0.256), v(0.051, 0.055, 0.048), smallRound);

  // Round face: cream mask, rust tear streaks, bright eyes and a small open smile.
  const head = new THREE.Group();
  head.name = "Smiling white face with red tear markings";
  head.position.set(0, 0.996, 0.055);
  head.rotation.z = -0.055;
  head.rotation.y = 0.035;
  panda.add(head);

  blob(head, fur, v(0, 0, 0), v(0.202, 0.177, 0.168));
  blob(head, cream, v(0, -0.027, 0.099), v(0.184, 0.141, 0.094));
  for (const sign of [-1, 1]) {
    blob(head, cream, v(sign * 0.126, -0.05, 0.123),
      v(0.081, 0.079, 0.057));
    for (let i = 0; i < 3; i++) {
      point(head, v(sign * (0.169 - i * 0.006), -0.02 - i * 0.03, 0.081),
        v(sign * (0.222 - i * 0.009), -0.041 - i * 0.034, 0.095),
        0.029 - i * 0.003, cream, 4);
    }
    point(head, v(sign * 0.166, 0.012, -0.025),
      v(sign * 0.218, -0.012, -0.028), 0.033, furLight, 5);
  }
  blob(head, fur, v(0, 0.123, 0.074), v(0.143, 0.059, 0.106));
  blob(head, furLight, v(0, 0.093, 0.174), v(0.033, 0.034, 0.012), smallRound);

  for (const sign of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(sign * 0.151, 0.139, -0.005);
    ear.rotation.z = -sign * 0.22;
    head.add(ear);

    const earBack = new THREE.Mesh(new THREE.ConeGeometry(0.114, 0.21, 4), fur);
    earBack.rotation.y = Math.PI / 4;
    earBack.scale.z = 0.5;
    earBack.position.z = -0.022;
    ear.add(earBack);

    const earRim = new THREE.Mesh(new THREE.ConeGeometry(0.113, 0.21, 4), cream);
    earRim.rotation.y = Math.PI / 4;
    earRim.scale.z = 0.43;
    ear.add(earRim);

    const earInside = new THREE.Mesh(new THREE.ConeGeometry(0.076, 0.145, 4), innerEar);
    earInside.rotation.y = Math.PI / 4;
    earInside.scale.z = 0.13;
    earInside.position.set(0, -0.008, 0.036);
    ear.add(earInside);

    const earHollow = new THREE.Mesh(new THREE.ConeGeometry(0.044, 0.09, 4), innerEarDark);
    earHollow.rotation.y = Math.PI / 4;
    earHollow.scale.z = 0.12;
    earHollow.position.set(0, -0.019, 0.043);
    ear.add(earHollow);

    const tear = blob(head, fur, v(sign * 0.092, -0.026, 0.182),
      v(0.029, 0.061, 0.013), smallRound);
    tear.rotation.z = sign * 0.28;
    const tearHighlight = blob(head, furLight, v(sign * 0.099, -0.049, 0.19),
      v(0.015, 0.035, 0.005), smallRound);
    tearHighlight.rotation.z = sign * 0.28;

    blob(head, furShade, v(sign * 0.077, 0.023, 0.181),
      v(0.041, 0.038, 0.012), smallRound);
    const eye = blob(head, black, v(sign * 0.076, 0.023, 0.193),
      v(0.028, 0.032, 0.018));
    eye.rotation.z = -sign * 0.1;
    blob(head, eyeGlint, v(sign * 0.076 - 0.008, 0.035, 0.208),
      v(0.008, 0.009, 0.0035), smallRound);
    blob(head, eyeGlint, v(sign * 0.076 + 0.009, 0.013, 0.209),
      v(0.003, 0.003, 0.002), smallRound);

    const eyebrow = blob(head, cream, v(sign * 0.075, 0.068, 0.185),
      v(0.04, 0.013, 0.012), smallRound);
    eyebrow.rotation.z = -sign * 0.16;
  }

  blob(head, cream, v(0, -0.12, 0.153), v(0.098, 0.046, 0.069));
  blob(head, black, v(0, -0.099, 0.214), v(0.045, 0.029, 0.014), smallRound);
  blob(head, tongue, v(0, -0.113, 0.227), v(0.025, 0.011, 0.006), smallRound);
  for (const sign of [-1, 1]) {
    blob(head, cream, v(sign * 0.039, -0.064, 0.195),
      v(0.058, 0.039, 0.043));
  }
  blob(head, black, v(0, -0.046, 0.239), v(0.022, 0.015, 0.016), smallRound);
  blob(head, charcoalLight, v(-0.005, -0.04, 0.252),
    v(0.006, 0.003, 0.002), smallRound);
  rod(head, v(0, -0.058, 0.236), v(0, -0.082, 0.234),
    0.0023, 0.0023, black, 5);
  curvedLine(head, [
    v(-0.049, -0.083, 0.226),
    v(-0.027, -0.102, 0.228),
    v(0, -0.108, 0.23),
    v(0.027, -0.102, 0.228),
    v(0.049, -0.083, 0.226),
  ], 0.0028, black, 16);

  for (const sign of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      blob(head, charcoalLight, v(sign * (0.058 + (i % 2) * 0.016),
        -0.056 - i * 0.01, 0.229), v(0.0024, 0.0024, 0.002), smallRound);
      rod(head,
        v(sign * 0.069, -0.067 - i * 0.01, 0.227),
        v(sign * (0.173 + i * 0.007), -0.049 - i * 0.024, 0.239 - i * 0.005),
        0.0011, 0.0006, whisker, 4);
    }
  }

  const shoot = new THREE.Group();
  shoot.name = "Fresh bamboo held in the left paw";
  scene.add(shoot);
  const shootBottom = v(0.31, 0.66, 0.23);
  const shootTop = v(0.50, 1.18, 0.27);
  const shootAxis = shootTop.clone().sub(shootBottom).normalize();

  for (let i = 0; i < 6; i++) {
    const a = shootBottom.clone().lerp(shootTop, i / 6);
    const b = shootBottom.clone().lerp(shootTop, (i + 1) / 6);
    const radius = 0.0145 - i * 0.0008;
    rod(shoot, a, b, radius, radius - 0.0005, i % 2 ? bambooLight : bamboo, 7);
    rod(shoot, a.clone().addScaledVector(shootAxis, -0.001),
      a.clone().addScaledVector(shootAxis, 0.007),
      radius * 1.16, radius * 1.16, bambooNode, 8);
  }
  point(shoot, shootTop.clone().addScaledVector(shootAxis, -0.017),
    shootTop.clone().addScaledVector(shootAxis, 0.04), 0.012, bambooLight, 5);

  function bambooLeaf(a: THREE.Vector3, b: THREE.Vector3, width: number, mat: THREE.Material) {
    const delta = b.clone().sub(a);
    const mesh = new THREE.Mesh(leafGeometry, mat);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.scale.set(width / 2, delta.length() / 2, 0.004);
    mesh.quaternion.setFromUnitVectors(Y, delta.clone().normalize());
    shoot.add(mesh);
    rod(shoot, a.clone().add(v(0, 0, 0.003)),
      b.clone().lerp(a, 0.13).add(v(0, 0, 0.003)),
      0.0011, 0.0005, bambooLight, 4);
  }

  rod(shoot, v(0.445, 1.027, 0.258), v(0.62, 1.085, 0.272),
    0.005, 0.002, bamboo, 5);
  rod(shoot, v(0.477, 1.114, 0.265), v(0.382, 1.173, 0.28),
    0.004, 0.0015, bamboo, 5);
  bambooLeaf(v(0.572, 1.069, 0.27), v(0.735, 1.141, 0.285), 0.047, leafLight);
  bambooLeaf(v(0.607, 1.08, 0.271), v(0.696, 1.015, 0.294), 0.039, leafDark);
  bambooLeaf(v(0.553, 1.061, 0.268), v(0.609, 0.952, 0.298), 0.036, leafLight);
  bambooLeaf(v(0.411, 1.157, 0.276), v(0.304, 1.237, 0.292), 0.04, leafDark);
  bambooLeaf(v(0.388, 1.169, 0.28), v(0.371, 1.073, 0.304), 0.038, leafLight);
  bambooLeaf(v(0.501, 1.18, 0.271), v(0.471, 1.284, 0.282), 0.03, leafLight);
  bambooLeaf(v(0.5, 1.173, 0.271), v(0.586, 1.235, 0.286), 0.032, leafDark);

  // Fingers sit in front of the shaft, making the grip unmistakable.
  for (let i = 0; i < 3; i++) {
    const y = 0.829 + i * 0.022;
    const x = 0.31 + ((y - 0.66) / 0.52) * 0.19;
    const finger = blob(panda, charcoal, v(x + 0.016, y, 0.291),
      v(0.027, 0.012, 0.017), smallRound);
    finger.rotation.z = -0.22;
    point(panda, v(x + 0.039, y, 0.293), v(x + 0.045, y - 0.003, 0.297),
      0.0035, claw, 4);
  }
  blob(panda, charcoalLight, v(0.353, 0.869, 0.283),
    v(0.022, 0.026, 0.016), smallRound);

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return scene;
}
