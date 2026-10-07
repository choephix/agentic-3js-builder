import * as THREE from "three";

export const meta = {
  name: "Jewel Chameleon",
  description:
    "A bright, low-poly veiled chameleon with a tall angular casque, independently aimed turret eyes, patterned flanks, grasping split toes, and a tightly curled, banded tail."
};

export default function createChameleon(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Jewel chameleon";

  const makeMaterial = (color: number, roughness = 0.76) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      flatShading: true
    });

  const mat = {
    leaf: makeMaterial(0x45b85d),
    lime: makeMaterial(0x83ce45),
    turquoise: makeMaterial(0x219c8b),
    deepGreen: makeMaterial(0x247b62),
    yellow: makeMaterial(0xdfd34b),
    gold: makeMaterial(0xe5a63c),
    orange: makeMaterial(0xc96f35),
    cream: makeMaterial(0xd9dda0),
    mint: makeMaterial(0xa6dba1),
    black: makeMaterial(0x152c28, 0.3),
    white: makeMaterial(0xfaf2d4, 0.28)
  };

  let seed = 63827;
  function random(): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const up = V(0, 1, 0);
  const forward = V(0, 0, 1);
  const sphereGeometry = new THREE.SphereGeometry(1, 12, 8);
  const smallSphereGeometry = new THREE.SphereGeometry(1, 8, 6);
  const scaleGeometry = new THREE.SphereGeometry(1, 6, 4);

  function mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material | THREE.Material[]
  ): THREE.Mesh {
    const result = new THREE.Mesh(geometry, material);
    result.castShadow = true;
    result.receiveShadow = true;
    root.add(result);
    return result;
  }

  function ellipsoid(
    position: THREE.Vector3,
    size: THREE.Vector3,
    material: THREE.MeshStandardMaterial,
    geometry = sphereGeometry
  ): THREE.Mesh {
    const result = mesh(geometry, material);
    result.position.copy(position);
    result.scale.copy(size);
    return result;
  }

  function rod(
    a: THREE.Vector3,
    b: THREE.Vector3,
    radiusA: number,
    radiusB: number,
    material: THREE.MeshStandardMaterial,
    sides = 8
  ): THREE.Mesh {
    const delta = b.clone().sub(a);
    const result = mesh(
      new THREE.CylinderGeometry(radiusB, radiusA, delta.length(), sides),
      material
    );
    result.position.copy(a).add(b).multiplyScalar(0.5);
    result.quaternion.setFromUnitVectors(up, delta.normalize());
    return result;
  }

  function joint(
    p: THREE.Vector3,
    radius: number,
    material: THREE.MeshStandardMaterial
  ): THREE.Mesh {
    return ellipsoid(p, V(radius, radius, radius), material, smallSphereGeometry);
  }

  function surfaceScale(
    p: THREE.Vector3,
    normal: THREE.Vector3,
    width: number,
    height: number,
    material: THREE.MeshStandardMaterial,
    thickness = 0.0011
  ): THREE.Mesh {
    const result = ellipsoid(
      p,
      V(width, height, thickness),
      material,
      scaleGeometry
    );
    result.quaternion.setFromUnitVectors(forward, normal.clone().normalize());
    return result;
  }

  // A single, generously faceted torso. Its geometric faces carry the large
  // zigzag flank bands, leaving the silhouette simple and uninterrupted.
  const bodyCenter = V(0, 0.118, -0.028);
  const bodySize = V(0.053, 0.074, 0.125);
  const bodyGeometry = new THREE.SphereGeometry(1, 20, 16);
  bodyGeometry.rotateX(Math.PI / 2);
  const bodyFaces = bodyGeometry.toNonIndexed();
  bodyGeometry.dispose();

  const bodyMaterials = [
    mat.leaf,
    mat.lime,
    mat.turquoise,
    mat.yellow,
    mat.cream,
    mat.deepGreen
  ];
  const positions = bodyFaces.getAttribute("position");
  bodyFaces.clearGroups();
  let runStart = 0;
  let lastMaterial = -1;

  for (let i = 0; i < positions.count; i += 3) {
    const x = (positions.getX(i) + positions.getX(i + 1) + positions.getX(i + 2)) / 3;
    const y = (positions.getY(i) + positions.getY(i + 1) + positions.getY(i + 2)) / 3;
    const z = (positions.getZ(i) + positions.getZ(i + 1) + positions.getZ(i + 2)) / 3;
    let materialIndex = y > 0.48 ? 1 : 0;

    if (y < -0.62) {
      materialIndex = 4;
    } else if (Math.abs(x) > 0.34 && y < 0.87) {
      const bandPosition = z + 0.075 * Math.sin(y * 5.5);
      const distance = Math.min(
        Math.abs(bandPosition + 0.64),
        Math.abs(bandPosition + 0.08),
        Math.abs(bandPosition - 0.5)
      );
      if (distance < 0.105) materialIndex = 3;
      else if (distance < 0.205) materialIndex = 2;
      else if (y < -0.38) materialIndex = 5;
    }

    if (materialIndex !== lastMaterial) {
      if (lastMaterial !== -1) {
        bodyFaces.addGroup(runStart, i - runStart, lastMaterial);
      }
      runStart = i;
      lastMaterial = materialIndex;
    }
  }
  bodyFaces.addGroup(runStart, positions.count - runStart, lastMaterial);
  const torso = mesh(bodyFaces, bodyMaterials);
  torso.position.copy(bodyCenter);
  torso.scale.copy(bodySize);

  // Small scale accents follow the curved flanks rather than floating in rows.
  function bodySurface(side: number, t: number, angle: number) {
    const ring = Math.sqrt(Math.max(0, 1 - t * t));
    const relative = V(
      side * bodySize.x * ring * Math.cos(angle),
      bodySize.y * ring * Math.sin(angle),
      bodySize.z * t
    );
    const normal = V(
      relative.x / (bodySize.x * bodySize.x),
      relative.y / (bodySize.y * bodySize.y),
      relative.z / (bodySize.z * bodySize.z)
    ).normalize();
    return {
      point: relative.add(bodyCenter).addScaledVector(normal, -0.00015),
      normal
    };
  }

  for (const side of [-1, 1]) {
    for (let column = 0; column < 6; column++) {
      for (let row = 0; row < 4; row++) {
        const t = -0.78 + column * 0.292 + (random() - 0.5) * 0.07;
        const angle = -0.43 + row * 0.31 + (random() - 0.5) * 0.1;
        const s = bodySurface(side, t, angle);
        const choice = random();
        surfaceScale(
          s.point,
          s.normal,
          0.0034 + random() * 0.0018,
          0.0043 + random() * 0.002,
          choice < 0.38 ? mat.mint : choice < 0.7 ? mat.lime : mat.deepGreen
        );
      }
    }
    // The characteristic pale, interrupted lateral line.
    for (let i = 0; i < 13; i++) {
      const t = -0.86 + i * 0.135;
      const s = bodySurface(side, t, -0.17 + 0.035 * Math.sin(i * 1.3));
      surfaceScale(s.point, s.normal, 0.0024, 0.0021, mat.cream, 0.0012);
    }
  }

  // Small saw-tooth dorsal crest.
  for (let i = 0; i < 17; i++) {
    const z = -0.144 + i * 0.014;
    const t = (z - bodyCenter.z) / bodySize.z;
    const y = bodyCenter.y + bodySize.y * Math.sqrt(Math.max(0, 1 - t * t));
    const h = 0.0055 + 0.0048 * Math.sin((i / 16) * Math.PI);
    const spine = mesh(
      new THREE.ConeGeometry(0.004, h, 4),
      i % 3 === 0 ? mat.gold : mat.cream
    );
    spine.position.set(0, y + h * 0.36, z);
    spine.rotation.x = -0.16;
  }

  // Neck, angular head, and pale gular pouch.
  ellipsoid(V(0, 0.139, 0.083), V(0.039, 0.043, 0.047), mat.leaf);
  ellipsoid(V(0, 0.157, 0.169), V(0.04, 0.036, 0.061), mat.lime);
  ellipsoid(V(0, 0.142, 0.216), V(0.029, 0.022, 0.032), mat.lime);
  ellipsoid(V(0, 0.119, 0.184), V(0.028, 0.012, 0.046), mat.cream);

  // A triangular-cylinder primitive makes a broad, planar veiled casque.
  function casqueGeometry(thickness: number, height: number, length: number) {
    const g = new THREE.CylinderGeometry(1, 1, 1, 3, 1);
    g.rotateZ(Math.PI / 2);
    g.scale(thickness, height, length);
    g.rotateX(0.34);
    return g;
  }

  const casque = mesh(casqueGeometry(0.045, 0.065, 0.08), mat.leaf);
  casque.position.set(0, 0.18, 0.123);

  for (const side of [-1, 1]) {
    const panel = mesh(casqueGeometry(0.002, 0.05, 0.059), mat.turquoise);
    panel.position.set(side * 0.0236, 0.19, 0.119);

    rod(
      V(side * 0.023, 0.2464, 0.1041),
      V(side * 0.023, 0.1533, 0.1984),
      0.0027,
      0.002,
      mat.yellow,
      6
    );
    rod(
      V(side * 0.023, 0.2464, 0.1041),
      V(side * 0.023, 0.1403, 0.0665),
      0.0022,
      0.0017,
      mat.deepGreen,
      6
    );

    for (let i = 0; i < 4; i++) {
      surfaceScale(
        V(side * 0.025, 0.213 + i * 0.005, 0.105 + i * 0.008),
        V(side, 0, 0),
        0.0023,
        0.0032,
        mat.lime
      );
    }
  }
  rod(V(-0.023, 0.2464, 0.1041), V(0.023, 0.2464, 0.1041),
      0.0025, 0.0025, mat.yellow, 6);

  // Turret eyes: green bulbs, conical golden lids, small dark apertures.
  for (const side of [-1, 1]) {
    const eyeCenter = V(side * 0.036, 0.174, 0.172);
    const gaze = V(side * (side === 1 ? 0.86 : 0.93), side === 1 ? 0.045 : 0.14,
      side === 1 ? 0.51 : 0.34).normalize();
    const orientation = new THREE.Quaternion().setFromUnitVectors(forward, gaze);

    ellipsoid(eyeCenter, V(0.023, 0.022, 0.023), mat.lime);
    rod(
      eyeCenter.clone().addScaledVector(gaze, 0.012),
      eyeCenter.clone().addScaledVector(gaze, 0.025),
      0.016,
      0.0098,
      mat.gold,
      12
    );

    function eyeDisc(offset: number, radius: number, depth: number,
      material: THREE.MeshStandardMaterial) {
      const disc = ellipsoid(
        eyeCenter.clone().addScaledVector(gaze, offset),
        V(radius, radius, depth),
        material
      );
      disc.quaternion.copy(orientation);
      return disc;
    }

    eyeDisc(0.026, 0.0085, 0.0015, mat.black);
    eyeDisc(0.0275, 0.0067, 0.0011, mat.orange);
    eyeDisc(0.0287, 0.0046, 0.001, mat.black);

    const eyelidRim = mesh(new THREE.TorusGeometry(0.0101, 0.00135, 4, 12), mat.yellow);
    eyelidRim.position.copy(eyeCenter).addScaledVector(gaze, 0.025);
    eyelidRim.quaternion.copy(orientation);

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const local = V(Math.cos(a) * 0.013, Math.sin(a) * 0.013, 0.0205);
      local.applyQuaternion(orientation).add(eyeCenter);
      joint(local, 0.0013, i % 2 === 0 ? mat.lime : mat.orange);
    }

    const glintPosition = V(-0.0015, 0.002, 0.0300)
      .applyQuaternion(orientation).add(eyeCenter);
    const glint = ellipsoid(glintPosition, V(0.0014, 0.0014, 0.00065), mat.white);
    glint.quaternion.copy(orientation);
  }

  // Long, fine lip lines and understated nostrils.
  for (const side of [-1, 1]) {
    const lip = [
      V(side * 0.025, 0.141, 0.133),
      V(side * 0.032, 0.135, 0.162),
      V(side * 0.030, 0.130, 0.187),
      V(side * 0.026, 0.128, 0.212),
      V(side * 0.020, 0.129, 0.231),
      V(side * 0.006, 0.132, 0.245)
    ];
    for (let i = 0; i < lip.length - 1; i++) {
      rod(lip[i], lip[i + 1], 0.00125, 0.0011, mat.deepGreen, 6);
    }
    ellipsoid(
      V(side * 0.012, 0.151, 0.243),
      V(0.0022, 0.00125, 0.0014),
      mat.black,
      smallSphereGeometry
    );

    for (let i = 0; i < 5; i++) {
      surfaceScale(
        V(side * (0.034 - i * 0.0017), 0.147 + (i % 2) * 0.004, 0.154 + i * 0.012),
        V(side, 0.12, 0.2),
        0.0021,
        0.0025,
        i % 2 ? mat.yellow : mat.mint
      );
    }
  }

  for (let i = 0; i < 7; i++) {
    const tooth = mesh(new THREE.ConeGeometry(0.0023, 0.005, 3), mat.cream);
    tooth.position.set(0, 0.1075, 0.157 + i * 0.010);
    tooth.rotation.z = Math.PI;
  }

  // Four bent, separated legs, with opposed bundles of two and three toes.
  function buildFoot(side: number, ankle: THREE.Vector3, front: boolean) {
    const baseZ = front ? 0.148 : -0.086;
    const baseX = front ? 0.102 : 0.108;
    const palm = V(side * baseX, 0.012, baseZ);
    rod(ankle, palm, 0.007, 0.006, mat.lime);
    ellipsoid(palm, V(0.008, 0.008, 0.010), mat.lime, smallSphereGeometry);

    for (const bundle of [-1, 1]) {
      const count = bundle === 1 ? 3 : 2;
      for (let j = 0; j < count; j++) {
        const start = V(side * (baseX + bundle * 0.004), 0.009, baseZ + j * 0.002);
        const endX = baseX + bundle * (0.015 + j * 0.0055);
        const endZ = baseZ + 0.025 + (count - 1 - j) * 0.0025;
        const knuckle = V(
          side * (baseX + bundle * (0.011 + j * 0.0035)),
          0.0055,
          baseZ + 0.014 + j * 0.0015
        );
        const tip = V(side * endX, 0.003, endZ);
        rod(start, knuckle, 0.0038, 0.0034, mat.lime, 6);
        joint(knuckle, 0.0035, mat.yellow);
        rod(knuckle, tip, 0.0033, 0.0028, mat.lime, 6);
        joint(tip, 0.003, mat.lime);
        rod(
          tip,
          V(side * (endX + bundle * 0.002), 0.0015, endZ + 0.006),
          0.0017,
          0.00015,
          mat.orange,
          5
        );
      }
    }
  }

  for (const side of [-1, 1]) {
    const shoulder = V(side * 0.036, 0.128, 0.058);
    const elbow = V(side * 0.080, 0.076, 0.092);
    const wrist = V(side * 0.096, 0.023, 0.137);
    joint(shoulder, 0.016, mat.leaf);
    rod(shoulder, elbow, 0.013, 0.0095, mat.leaf);
    joint(elbow, 0.0105, mat.lime);
    rod(elbow, wrist, 0.009, 0.0065, mat.turquoise);
    joint(wrist, 0.007, mat.lime);
    const frontBandA = shoulder.clone().lerp(elbow, 0.54);
    const frontBandB = shoulder.clone().lerp(elbow, 0.68);
    rod(frontBandA, frontBandB, 0.0118, 0.0111, mat.yellow);
    buildFoot(side, wrist, true);

    const hip = V(side * 0.038, 0.113, -0.106);
    const knee = V(side * 0.087, 0.064, -0.139);
    const ankle = V(side * 0.104, 0.022, -0.098);
    joint(hip, 0.018, mat.leaf);
    rod(hip, knee, 0.017, 0.0115, mat.leaf);
    joint(knee, 0.0125, mat.lime);
    rod(knee, ankle, 0.010, 0.0068, mat.turquoise);
    joint(ankle, 0.0075, mat.lime);
    rod(hip.clone().lerp(knee, 0.48), hip.clone().lerp(knee, 0.65),
      0.0148, 0.0138, mat.yellow);
    buildFoot(side, ankle, false);
  }

  // A tapered spiral in the sagittal plane, with genuine open space between
  // turns. Short cylinders and faceted joints preserve the primitive look.
  const tailPoints: THREE.Vector3[] = [];
  const tailRadii: number[] = [];
  const tailSteps = 62;

  for (let i = 0; i <= tailSteps; i++) {
    const t = i / tailSteps;
    const angle = -9.2 * t;
    const spiralRadius = 0.090 * (1 - t) + 0.011 * t;
    tailPoints.push(V(
      0.0015 * Math.sin(t * Math.PI),
      0.113 + spiralRadius * Math.sin(angle),
      -0.247 + spiralRadius * Math.cos(angle)
    ));
    tailRadii.push(0.020 * Math.pow(1 - t, 1.25) + 0.0032);
  }

  rod(V(0, 0.116, -0.137), tailPoints[0], 0.025, tailRadii[0], mat.leaf);
  function tailMaterial(i: number): THREE.MeshStandardMaterial {
    if (i < 4) return mat.leaf;
    const band = i % 15;
    if (band === 5 || band === 6) return mat.yellow;
    if (band === 7) return mat.lime;
    return i > 39 ? mat.lime : mat.turquoise;
  }

  for (let i = 0; i < tailPoints.length; i++) {
    const material = tailMaterial(i);
    joint(tailPoints[i], tailRadii[i], material);
    if (i < tailPoints.length - 1) {
      rod(
        tailPoints[i],
        tailPoints[i + 1],
        tailRadii[i],
        tailRadii[i + 1],
        material,
        8
      );
    }
  }

  // Approximately sixty centimetres nose-to-tail if the tail were uncurled.
  root.scale.setScalar(0.72);
  return root;
}
