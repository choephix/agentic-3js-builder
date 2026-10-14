import * as THREE from "three";

export const meta = {
  name: "Sunburst Pufferfish",
  description:
    "A round, wide-eyed golden pufferfish with an ivory belly, chocolate freckles, individually tipped spines, and delicate striped fan fins."
};

export default function (): THREE.Object3D {
  const fish = new THREE.Group();
  fish.name = "Sunburst pufferfish";

  let seed = 0x73a92f16;
  const random = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const material = (
    color: string,
    roughness = 0.78,
    extra: Partial<THREE.MeshStandardMaterialParameters> = {}
  ) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      flatShading: true,
      ...extra
    });

  const crown = material("#ad953d");
  const gold = material("#d9b64b");
  const butter = material("#edce73");
  const belly = material("#f5e5b4");
  const socketGold = material("#b38d39");
  const spotBrown = material("#685336");
  const spotLight = material("#98763c");
  const spineIvory = material("#fff0c8", 0.64);
  const spineTip = material("#c3a15a", 0.66);
  const finHoney = material("#d3a44d", 0.72, { side: THREE.DoubleSide });
  const finPale = material("#f6d989", 0.72, { side: THREE.DoubleSide });
  const finStripe = material("#b7863a", 0.76, { side: THREE.DoubleSide });
  const finRay = material("#91703b", 0.7);
  const eyeWhite = material("#fff6dc", 0.3);
  const iris = material("#468d83", 0.3);
  const irisRim = material("#244e48", 0.38);
  const pupil = material("#111f23", 0.19);
  const glint = material("#ffffff", 0.15);
  const lip = material("#bd8a46", 0.68);
  const mouthDark = material("#382b28", 0.85);
  const beak = material("#fff6d8", 0.48);

  const Y = new THREE.Vector3(0, 1, 0);
  const Z = new THREE.Vector3(0, 0, 1);
  const center = new THREE.Vector3(0, 0.249, 0);
  const radii = new THREE.Vector3(0.224, 0.215, 0.228);

  const sphereGeometry = new THREE.SphereGeometry(1, 12, 8);
  const smallSphereGeometry = new THREE.SphereGeometry(1, 8, 5);
  const spotGeometry = new THREE.SphereGeometry(1, 7, 4);
  const eyeGeometry = new THREE.SphereGeometry(1, 18, 12);
  const rodGeometry = new THREE.CylinderGeometry(1, 1, 1, 6);
  const taperedRodGeometry = new THREE.CylinderGeometry(0.3, 1, 1, 5);
  const spineShaftGeometry = new THREE.CylinderGeometry(0.24, 1, 1, 5);
  const spinePointGeometry = new THREE.ConeGeometry(1, 1, 5);
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

  function addMesh(
    geometry: THREE.BufferGeometry,
    mat: THREE.Material | THREE.Material[],
    position?: THREE.Vector3,
    scale?: THREE.Vector3,
    quaternion?: THREE.Quaternion
  ) {
    const mesh = new THREE.Mesh(geometry, mat);
    if (position) mesh.position.copy(position);
    if (scale) mesh.scale.copy(scale);
    if (quaternion) mesh.quaternion.copy(quaternion);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    fish.add(mesh);
    return mesh;
  }

  function oval(
    position: THREE.Vector3,
    scale: THREE.Vector3,
    mat: THREE.Material,
    normal?: THREE.Vector3,
    geometry = sphereGeometry
  ) {
    return addMesh(
      geometry,
      mat,
      position,
      scale,
      normal
        ? new THREE.Quaternion().setFromUnitVectors(Z, normal.clone().normalize())
        : undefined
    );
  }

  function rod(
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    mat: THREE.Material,
    tapered = false
  ) {
    const delta = b.clone().sub(a);
    return addMesh(
      tapered ? taperedRodGeometry : rodGeometry,
      mat,
      a.clone().add(b).multiplyScalar(0.5),
      new THREE.Vector3(radius, delta.length(), radius),
      new THREE.Quaternion().setFromUnitVectors(Y, delta.normalize())
    );
  }

  function surface(direction: THREE.Vector3) {
    const d = direction.clone().normalize();
    const point = new THREE.Vector3(
      d.x * radii.x,
      d.y * radii.y,
      d.z * radii.z
    ).add(center);
    const normal = new THREE.Vector3(
      d.x / radii.x,
      d.y / radii.y,
      d.z / radii.z
    ).normalize();
    return { point, normal, direction: d };
  }

  // One simple, faceted balloon-shaped body, with a scalloped colour boundary.
  const bodyGeometry = new THREE.SphereGeometry(1, 32, 22);
  const bodyPositions = bodyGeometry.getAttribute("position");
  const bodyIndex = bodyGeometry.index!;
  bodyGeometry.clearGroups();

  let groupStart = 0;
  let currentMaterial = -1;
  for (let i = 0; i < bodyIndex.count; i += 3) {
    let x = 0, y = 0, z = 0;
    for (let j = 0; j < 3; j++) {
      const k = bodyIndex.getX(i + j);
      x += bodyPositions.getX(k) / 3;
      y += bodyPositions.getY(k) / 3;
      z += bodyPositions.getZ(k) / 3;
    }

    const bellyBoundary = -0.43 + 0.045 * Math.cos(x * 11);
    let index = y < bellyBoundary ? 3 : y < -0.10 ? 2 : 1;
    if (y > 0.52 + z * 0.065) index = 0;
    if (z > 0.73 && y > bellyBoundary && y < 0.46) index = 2;

    if (index !== currentMaterial) {
      if (currentMaterial >= 0)
        bodyGeometry.addGroup(groupStart, i - groupStart, currentMaterial);
      currentMaterial = index;
      groupStart = i;
    }
  }
  bodyGeometry.addGroup(
    groupStart,
    bodyIndex.count - groupStart,
    currentMaterial
  );
  addMesh(bodyGeometry, [crown, gold, butter, belly], center, radii);

  function spot(
    direction: THREE.Vector3,
    radius: number,
    mat: THREE.Material,
    aspect = 0.8
  ) {
    const { point, normal } = surface(direction);
    const q = new THREE.Quaternion().setFromUnitVectors(Z, normal);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(Z, random() * Math.PI));
    return addMesh(
      spotGeometry,
      mat,
      point.addScaledVector(normal, 0.0005),
      new THREE.Vector3(radius, radius * aspect, 0.0016),
      q
    );
  }

  // Freckles are physical, very shallow polygonal patches rather than noise.
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 108; i++) {
    const y = 1 - 2 * ((i + 0.5) / 108);
    const ring = Math.sqrt(1 - y * y);
    const angle = i * goldenAngle + 0.8;
    const d = new THREE.Vector3(
      Math.cos(angle) * ring,
      y,
      Math.sin(angle) * ring
    );
    if (y < -0.5) continue;
    if (d.z > 0.66 && y < 0.66 && Math.abs(d.x) < 0.77) continue;
    const radius = 0.0065 + random() * 0.010;
    spot(d, radius, spotBrown, 0.66 + random() * 0.37);

    if (i % 4 === 0) {
      const satellite = d.clone().add(
        new THREE.Vector3(
          (random() - 0.5) * 0.14,
          (random() - 0.5) * 0.12,
          (random() - 0.5) * 0.14
        )
      ).normalize();
      spot(satellite, radius * 0.34, spotLight);
    }
  }

  function addSpine(direction: THREE.Vector3, forcedLength?: number) {
    const { point, normal, direction: d } = surface(direction);
    const radius = 0.0064 + random() * 0.0027;
    let length = forcedLength ?? (0.030 + random() * 0.020);
    if (d.y < -0.65 && forcedLength === undefined)
      length = 0.023 + random() * 0.008;

    const axis = normal.clone().add(
      new THREE.Vector3(
        (random() - 0.5) * 0.065,
        (random() - 0.5) * 0.065,
        (random() - 0.5) * 0.065
      )
    ).normalize();
    if (forcedLength !== undefined) axis.copy(normal);

    const start = point.clone().addScaledVector(normal, 0.001);
    if (axis.y < -0.1)
      length = Math.min(length, (start.y + 0.001) / -axis.y);

    oval(
      point.clone().addScaledVector(normal, 0.0006),
      new THREE.Vector3(radius * 1.4, radius * 1.13, 0.002),
      d.y > -0.35 ? (random() > 0.47 ? spotBrown : spotLight) : butter,
      normal,
      spotGeometry
    );

    const q = new THREE.Quaternion().setFromUnitVectors(Y, axis);
    const shaftLength = length * 0.75;
    addMesh(
      spineShaftGeometry,
      spineIvory,
      start.clone().addScaledVector(axis, shaftLength * 0.5),
      new THREE.Vector3(radius, shaftLength, radius),
      q
    );
    const tipLength = length - shaftLength;
    addMesh(
      spinePointGeometry,
      d.y < -0.35 ? spineIvory : spineTip,
      start.clone().addScaledVector(axis, shaftLength + tipLength * 0.5),
      new THREE.Vector3(radius * 0.24, tipLength, radius * 0.24),
      q
    );
  }

  // Evenly spaced quills leave the expression and fin attachments unobstructed.
  for (let i = 0; i < 174; i++) {
    const y = 1 - 2 * ((i + 0.5) / 174);
    const ring = Math.sqrt(1 - y * y);
    const angle = i * goldenAngle;
    const d = new THREE.Vector3(
      ring * Math.cos(angle),
      y,
      ring * Math.sin(angle)
    );
    if (d.z > 0.63 && y > -0.5 && y < 0.67 && Math.abs(d.x) < 0.76)
      continue;
    if (Math.abs(d.x) > 0.92 && Math.abs(y) < 0.19 && Math.abs(d.z) < 0.24)
      continue;
    if (d.z < -0.93 && Math.abs(y) < 0.26) continue;
    if (Math.abs(d.x) < 0.18 && y > 0.65 && d.z < -0.25) continue;
    if (Math.abs(d.x) < 0.17 && y < -0.6 && d.z < -0.35) continue;
    addSpine(d);
  }
  // This tiny bottom quill grounds the inflated fish at floor level.
  addSpine(new THREE.Vector3(0, -1, 0), 0.034);

  // Protruding eyes: warm sockets, cream globes, lagoon irises and bright glints.
  for (const side of [-1, 1]) {
    const d = new THREE.Vector3(side * 0.45, 0.34, 0.826).normalize();
    const { point, normal } = surface(d);
    oval(
      point.clone().addScaledVector(normal, 0.007),
      new THREE.Vector3(0.060, 0.063, 0.025),
      socketGold,
      normal
    );

    const eyeCenter = point.clone().addScaledVector(normal, 0.033);
    const gaze = new THREE.Vector3(side * 0.12, 0.045, 1).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(Z, gaze);
    const localPoint = (x: number, y: number, z: number) =>
      new THREE.Vector3(x, y, z).applyQuaternion(q).add(eyeCenter);

    addMesh(
      eyeGeometry,
      eyeWhite,
      eyeCenter,
      new THREE.Vector3(0.050, 0.054, 0.044),
      q
    );
    addMesh(
      eyeGeometry,
      iris,
      localPoint(0, 0, 0.035),
      new THREE.Vector3(0.031, 0.033, 0.008),
      q
    );
    addMesh(
      new THREE.TorusGeometry(0.031, 0.0021, 5, 18),
      irisRim,
      localPoint(0, 0, 0.034),
      new THREE.Vector3(1, 1.06, 1),
      q
    );
    addMesh(
      eyeGeometry,
      pupil,
      localPoint(0, 0, 0.042),
      new THREE.Vector3(0.0185, 0.022, 0.004),
      q
    );
    oval(
      localPoint(-0.0085, 0.012, 0.047),
      new THREE.Vector3(0.0066, 0.0073, 0.0028),
      glint,
      gaze,
      smallSphereGeometry
    );
    oval(
      localPoint(0.008, -0.008, 0.046),
      new THREE.Vector3(0.0026, 0.0029, 0.0016),
      glint,
      gaze,
      smallSphereGeometry
    );

    const lidQ = q.clone().multiply(
      new THREE.Quaternion().setFromAxisAngle(Z, side * -0.045)
    );
    addMesh(
      new THREE.TorusGeometry(0.048, 0.0058, 6, 16, Math.PI),
      gold,
      localPoint(0, 0.001, 0.013),
      new THREE.Vector3(1, 1.05, 1),
      lidQ
    );

    // Three neatly placed cheek freckles, below and outside each eye.
    for (let j = 0; j < 3; j++) {
      const cx = 0.67 + j * 0.035;
      const cy = 0.11 - j * 0.075;
      const cz = Math.sqrt(1 - cx * cx - cy * cy);
      spot(
        new THREE.Vector3(side * cx, cy, cz),
        0.0057 - j * 0.0008,
        spotBrown
      );
    }
  }

  // Two minute tubular nostrils above the puckered beak.
  for (const side of [-1, 1]) {
    const position = new THREE.Vector3(side * 0.033, 0.289, 0.229);
    const direction = new THREE.Vector3(side * 0.10, 0.24, 0.965).normalize();
    oval(
      position,
      new THREE.Vector3(0.0085, 0.0105, 0.008),
      gold,
      direction,
      smallSphereGeometry
    );
    oval(
      position.clone().addScaledVector(direction, 0.0071),
      new THREE.Vector3(0.0031, 0.0039, 0.0011),
      spotBrown,
      direction,
      smallSphereGeometry
    );
  }

  // A small open mouth with the four fused tooth plates of a puffer's beak.
  oval(
    new THREE.Vector3(0, 0.224, 0.242),
    new THREE.Vector3(0.035, 0.028, 0.018),
    butter
  );
  oval(
    new THREE.Vector3(0, 0.224, 0.263),
    new THREE.Vector3(0.023, 0.0185, 0.0035),
    mouthDark,
    Z
  );
  addMesh(
    new THREE.TorusGeometry(0.024, 0.0056, 6, 20),
    lip,
    new THREE.Vector3(0, 0.224, 0.261),
    new THREE.Vector3(1.12, 0.85, 1)
  );
  for (const side of [-1, 1]) {
    const upper = addMesh(
      boxGeometry,
      beak,
      new THREE.Vector3(side * 0.0056, 0.232, 0.267),
      new THREE.Vector3(0.0102, 0.0085, 0.0065)
    );
    upper.rotation.z = side * -0.07;
    const lower = addMesh(
      boxGeometry,
      beak,
      new THREE.Vector3(side * 0.0052, 0.2165, 0.266),
      new THREE.Vector3(0.0095, 0.0055, 0.005)
    );
    lower.rotation.z = side * 0.045;
  }

  // Thin, curved gill openings hug the cheeks just ahead of the side fins.
  for (const side of [-1, 1]) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 7; i++) {
      const t = i / 7;
      const y = -0.13 + t * 0.29;
      const z = 0.365 - Math.sin(t * Math.PI) * 0.075;
      const x = side * Math.sqrt(1 - y * y - z * z);
      const s = surface(new THREE.Vector3(x, y, z));
      points.push(s.point.addScaledVector(s.normal, 0.0025));
    }
    for (let i = 0; i < points.length - 1; i++)
      rod(points[i], points[i + 1], 0.00165, spotBrown);
  }

  function fan(
    pivot: THREE.Vector3,
    outward: THREE.Vector3,
    across: THREE.Vector3,
    radius: number,
    spread: number,
    thickness: number,
    isTail = false
  ) {
    const u = outward.clone().normalize();
    const v = across.clone().addScaledVector(u, -across.dot(u)).normalize();
    const n = new THREE.Vector3().crossVectors(u, v).normalize();
    const sectorQ = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(v, n, u)
    );
    const flatQ = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(u, v, n)
    );
    const segments = isTail ? 12 : 10;

    addMesh(
      new THREE.CylinderGeometry(
        radius, radius, thickness, segments, 1, false,
        -spread / 2, spread
      ),
      [finPale, finHoney, finHoney],
      pivot,
      undefined,
      sectorQ
    );

    // A pale outer band follows the polygonal fan edge on both faces.
    const rimGeometry = new THREE.RingGeometry(
      radius * (isTail ? 0.81 : 0.86),
      radius,
      segments,
      1,
      -spread / 2,
      spread
    );
    for (const face of [-1, 1]) {
      addMesh(
        rimGeometry,
        finPale,
        pivot.clone().addScaledVector(n, face * (thickness / 2 + 0.00035)),
        undefined,
        flatQ
      );
    }

    if (isTail) {
      for (const angle of [-0.43, 0, 0.43]) {
        addMesh(
          new THREE.CylinderGeometry(
            radius * 0.81, radius * 0.81, thickness + 0.0005,
            3, 1, false, angle - 0.045, 0.09
          ),
          finStripe,
          pivot,
          undefined,
          sectorQ
        );
      }
    }

    const ribCount = isTail ? 10 : 8;
    for (let i = 0; i <= ribCount; i++) {
      const angle = -spread / 2 + spread * i / ribCount;
      const direction = u.clone().multiplyScalar(Math.cos(angle))
        .addScaledVector(v, Math.sin(angle));
      for (const face of [-1, 1]) {
        const offset = n.clone().multiplyScalar(
          face * (thickness / 2 + 0.0007)
        );
        const start = pivot.clone().add(offset).addScaledVector(direction, 0.008);
        const end = pivot.clone().add(offset).addScaledVector(direction, radius * 0.99);
        rod(start, end, isTail ? 0.00145 : 0.00105, finRay, true);
      }
    }

    // Small raised edge cords keep the fins readable even nearly edge-on.
    for (let i = 0; i < segments; i++) {
      const a = -spread / 2 + spread * i / segments;
      const b = -spread / 2 + spread * (i + 1) / segments;
      const pointAt = (angle: number) =>
        pivot.clone()
          .addScaledVector(u, Math.cos(angle) * radius)
          .addScaledVector(v, Math.sin(angle) * radius);
      rod(pointAt(a), pointAt(b), 0.0010, finPale);
    }
  }

  // Splayed pectoral paddles, with fleshy little attachment cuffs.
  for (const side of [-1, 1]) {
    const pivot = new THREE.Vector3(side * 0.214, 0.256, 0.018);
    oval(
      pivot.clone().add(new THREE.Vector3(side * -0.002, 0, 0.003)),
      new THREE.Vector3(0.014, 0.025, 0.022),
      socketGold
    );
    fan(
      pivot,
      new THREE.Vector3(side * 0.95, -0.12, -0.29),
      new THREE.Vector3(0, 1, -0.06),
      0.114,
      1.60,
      0.0036
    );
  }

  // Short, stout tail stalk leading to a vertically spread rounded fan.
  const tailStart = new THREE.Vector3(0, 0.251, -0.205);
  const tailEnd = new THREE.Vector3(0, 0.251, -0.283);
  const tailDelta = tailEnd.clone().sub(tailStart);
  addMesh(
    new THREE.CylinderGeometry(0.021, 0.034, tailDelta.length(), 10),
    gold,
    tailStart.clone().add(tailEnd).multiplyScalar(0.5),
    undefined,
    new THREE.Quaternion().setFromUnitVectors(Y, tailDelta.normalize())
  );
  oval(
    new THREE.Vector3(0, 0.251, -0.276),
    new THREE.Vector3(0.023, 0.027, 0.020),
    butter,
    undefined,
    smallSphereGeometry
  );
  fan(
    new THREE.Vector3(0, 0.251, -0.281),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 1, 0),
    0.139,
    1.60,
    0.006,
    true
  );

  // Pufferfish have dorsal and anal fins, but no pelvic fins.
  fan(
    new THREE.Vector3(0, 0.425, -0.119),
    new THREE.Vector3(0, 0.77, -0.64),
    new THREE.Vector3(0, 0.64, 0.77),
    0.095,
    1.18,
    0.004
  );
  fan(
    new THREE.Vector3(0, 0.102, -0.124),
    new THREE.Vector3(0, -0.62, -0.78),
    new THREE.Vector3(0, 0.78, -0.62),
    0.073,
    1.15,
    0.0035
  );

  return fish;
}
