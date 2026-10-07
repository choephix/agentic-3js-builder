```ts
import * as THREE from "three";

export const meta = {
  name: "Oh! — Puffed Pufferfish",
  description:
    "A round, startled pufferfish with creamy leopard-spotted skin, little ivory spines, worried eyes, golden fan fins, and a trail of bubbles.",
};

export default function buildPufferfish(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Startled pufferfish";

  let seed = 0x51f17a23;
  function random(): number {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function material(
    color: number,
    roughness = 0.75,
    options: THREE.MeshStandardMaterialParameters = {}
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      flatShading: true,
      ...options,
    });
  }

  const skin = [
    material(0xfff8e8),
    material(0xfbefd2),
    material(0xf5e2af),
    material(0xefd590),
    material(0xe8c77d),
  ];
  const spotCenter = material(0xd4af6d);
  const chocolate = material(0x744b31, 0.87);
  const cinnamon = material(0x94633d, 0.86);
  const fadedSpot = material(0xb58e5b);
  const spineIvory = material(0xfff1c7);
  const spineBase = material(0xd9b975);
  const finGold = material(0xe7b75f, 0.64, { side: THREE.DoubleSide });
  const finLight = material(0xf3d184, 0.64, { side: THREE.DoubleSide });
  const finEdge = material(0xffe5aa, 0.62, { side: THREE.DoubleSide });
  const finRay = material(0xb98b48);
  const eyeSocket = material(0xd0aa6c);
  const eyeWhite = material(0xfffdf4, 0.27, { flatShading: false });
  const irisGold = material(0xb58b50, 0.38, { flatShading: false });
  const pupil = material(0x261d19, 0.18, { flatShading: false });
  const shine = material(0xffffff, 0.2, { flatShading: false });
  const lip = material(0xd8ad88, 0.65);
  const bubbleGlass = material(0x8edce9, 0.14, {
    transparent: true,
    opacity: 0.19,
    depthWrite: false,
    flatShading: false,
    metalness: 0.08,
  });
  const bubbleEdge = material(0xbbeefa, 0.25, {
    transparent: true,
    opacity: 0.64,
    depthWrite: false,
    flatShading: false,
  });

  const smallSphere = new THREE.SphereGeometry(1, 8, 5);
  const eyeSphere = new THREE.SphereGeometry(1, 20, 14);
  const detailSphere = new THREE.SphereGeometry(1, 12, 8);
  const Y = new THREE.Vector3(0, 1, 0);
  const Z = new THREE.Vector3(0, 0, 1);
  const center = new THREE.Vector3(0, 0.257, 0);
  const rx = 0.235;
  const ry = 0.228;
  const rz = 0.239;

  function ellipsoid(
    parent: THREE.Object3D,
    position: THREE.Vector3,
    scale: THREE.Vector3,
    mat: THREE.Material,
    geometry: THREE.BufferGeometry = smallSphere
  ): THREE.Mesh {
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
    radius: number,
    mat: THREE.Material,
    endRadius = radius
  ): THREE.Mesh {
    const delta = b.clone().sub(a);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(endRadius, radius, delta.length(), 6, 1),
      mat
    );
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Y, delta.normalize());
    parent.add(mesh);
    return mesh;
  }

  function surfacePoint(n: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(
      n.x * rx,
      center.y + n.y * ry,
      n.z * rz
    );
  }

  function surfaceNormal(n: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(n.x / rx, n.y / ry, n.z / rz).normalize();
  }

  function tangentBasis(n: THREE.Vector3): [THREE.Vector3, THREE.Vector3] {
    const normal = surfaceNormal(n);
    const reference = Math.abs(normal.y) > 0.91 ? Z : Y;
    const u = new THREE.Vector3().crossVectors(reference, normal).normalize();
    const v = new THREE.Vector3().crossVectors(normal, u).normalize();
    return [u, v];
  }

  function skinOval(
    n: THREE.Vector3,
    width: number,
    height: number,
    mat: THREE.Material,
    rotation = 0,
    tangent?: THREE.Vector3,
    thickness = 0.00065
  ): THREE.Mesh {
    const normal = surfaceNormal(n);
    const mesh = ellipsoid(
      root,
      surfacePoint(n).addScaledVector(normal, thickness * 0.65),
      new THREE.Vector3(width, height, thickness),
      mat
    );
    if (tangent) {
      const u = tangent.clone().addScaledVector(normal, -tangent.dot(normal)).normalize();
      const v = new THREE.Vector3().crossVectors(normal, u).normalize();
      mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, v, normal));
    } else {
      mesh.quaternion.setFromUnitVectors(Z, normal);
    }
    mesh.rotateZ(rotation);
    return mesh;
  }

  // The skin remains one simple faceted ball. Closely related colour bands
  // turn the yellow crown gently into an almost-white underside.
  const bodyGeometry = new THREE.SphereGeometry(1, 36, 24);
  const positions = bodyGeometry.getAttribute("position");
  const index = bodyGeometry.getIndex()!;
  bodyGeometry.clearGroups();

  let lastMaterial = -1;
  let groupStart = 0;
  let groupCount = 0;
  for (let i = 0; i < index.count; i += 3) {
    const h =
      (positions.getY(index.getX(i)) +
        positions.getY(index.getX(i + 1)) +
        positions.getY(index.getX(i + 2))) / 3;
    const m = h < -0.62 ? 0 : h < -0.33 ? 1 : h < 0.12 ? 2 : h < 0.59 ? 3 : 4;
    if (m !== lastMaterial) {
      if (groupCount > 0) bodyGeometry.addGroup(groupStart, groupCount, lastMaterial);
      groupStart = i;
      groupCount = 0;
      lastMaterial = m;
    }
    groupCount += 3;
  }
  bodyGeometry.addGroup(groupStart, groupCount, lastMaterial);

  const body = new THREE.Mesh(bodyGeometry, skin);
  body.name = "Creamy inflated ball";
  body.position.copy(center);
  body.scale.set(rx, ry, rz);
  root.add(body);

  const eyeDirections = [
    new THREE.Vector3(0.37, 0.30, 0.88).normalize(),
    new THREE.Vector3(-0.37, 0.30, 0.88).normalize(),
  ];
  const mouthDirection = new THREE.Vector3(0, -0.135, 1).normalize();

  function inFace(n: THREE.Vector3, padding: number): boolean {
    return (
      n.dot(eyeDirections[0]) > padding ||
      n.dot(eyeDirections[1]) > padding ||
      n.dot(mouthDirection) > 0.982
    );
  }

  // Small, broken rosettes are actual raised primitive shapes, not a uniform
  // polka-dot texture. Their lighter centres keep the leopard pattern readable.
  const spotSamples = 98;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < spotSamples; i++) {
    const y = 1 - (2 * (i + 0.5)) / spotSamples;
    const ring = Math.sqrt(1 - y * y);
    const angle = i * goldenAngle + 0.37;
    const n = new THREE.Vector3(
      Math.cos(angle) * ring,
      y,
      Math.sin(angle) * ring
    );
    n.add(
      new THREE.Vector3(
        (random() - 0.5) * 0.085,
        (random() - 0.5) * 0.055,
        (random() - 0.5) * 0.085
      )
    ).normalize();

    if (n.y < -0.22 || inFace(n, 0.927)) continue;
    if (n.z > 0.7 && n.y < -0.06) continue;

    const [u, v] = tangentBasis(n);
    const size = 0.016 + random() * 0.009;
    const orientation = random() * Math.PI * 2;
    const dark = n.y < -0.04 ? fadedSpot : random() < 0.32 ? cinnamon : chocolate;

    if (random() < 0.15) {
      skinOval(n, size * 0.60, size * 0.46, dark, orientation, u);
      continue;
    }

    skinOval(n, size * 0.69, size * 0.57, spotCenter, orientation, u);
    const petals = random() < 0.55 ? 4 : 5;
    for (let j = 0; j < petals; j++) {
      const a = orientation + (j / petals) * Math.PI * 2 + (random() - 0.5) * 0.32;
      const distance = size * (0.61 + random() * 0.19);
      const spotN = n
        .clone()
        .addScaledVector(u, (Math.cos(a) * distance) / rx)
        .addScaledVector(v, (Math.sin(a) * distance) / ry)
        .normalize();
      skinOval(
        spotN,
        size * (0.35 + random() * 0.11),
        size * (0.22 + random() * 0.075),
        j === 1 && n.y > 0.1 ? cinnamon : dark,
        a + Math.PI / 2,
        u,
        0.0008
      );
    }

    if (random() < 0.36) {
      const a = orientation + 0.7;
      const satellite = n
        .clone()
        .addScaledVector(u, (Math.cos(a) * size * 1.32) / rx)
        .addScaledVector(v, (Math.sin(a) * size * 1.32) / ry)
        .normalize();
      skinOval(satellite, size * 0.19, size * 0.24, dark, a, u);
    }
  }

  // Short radial thorns, each with a little fleshy socket.
  const spikeSamples = 148;
  for (let i = 0; i < spikeSamples; i++) {
    const y = 1 - (2 * (i + 0.5)) / spikeSamples;
    const r = Math.sqrt(1 - y * y);
    const a = i * goldenAngle + 1.71;
    const n = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    n.add(
      new THREE.Vector3(
        (random() - 0.5) * 0.04,
        (random() - 0.5) * 0.035,
        (random() - 0.5) * 0.04
      )
    ).normalize();
    if (inFace(n, 0.923)) continue;
    if (Math.abs(n.x) > 0.975 && Math.abs(n.y) < 0.14) continue;
    if (n.z < -0.974 && Math.abs(n.y) < 0.18) continue;

    const normal = surfaceNormal(n);
    const p = surfacePoint(n);
    const width = 0.0043 + random() * 0.0017;
    let length = 0.019 + random() * 0.012;
    if (n.z > 0.72) length *= 0.77;

    const socket = ellipsoid(
      root,
      p.clone(),
      new THREE.Vector3(width * 1.28, 0.0019, width * 1.28),
      n.y < -0.3 ? skin[0] : n.y > 0.24 ? spineBase : skin[3]
    );
    socket.quaternion.setFromUnitVectors(Y, normal);

    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(width, length, 5, 1),
      n.y < -0.3 ? skin[0] : spineIvory
    );
    spike.position.copy(p).addScaledVector(normal, length / 2 + 0.0004);
    spike.quaternion.setFromUnitVectors(Y, normal);
    spike.name = "Short ivory spine";
    root.add(spike);
  }

  // Fins are thick, low-sided fan sectors with pale hems and individual ribs.
  function makeFan(radius: number, halfAngle: number, thickness: number, divisions: number): THREE.Group {
    const fan = new THREE.Group();
    const webGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      thickness,
      divisions,
      1,
      false,
      Math.PI / 2 - halfAngle,
      halfAngle * 2
    );
    webGeometry.rotateX(Math.PI / 2);
    fan.add(new THREE.Mesh(webGeometry, finGold));

    for (let i = 0; i < divisions; i++) {
      const start = -halfAngle + (i / divisions) * halfAngle * 2;
      const sector = new THREE.Mesh(
        new THREE.CircleGeometry(radius * 0.985, 1, start, (halfAngle * 2) / divisions),
        i % 2 === 0 ? finLight : finGold
      );
      sector.position.z = thickness / 2 + 0.00015;
      fan.add(sector);
    }

    const hem = new THREE.Mesh(
      new THREE.RingGeometry(radius * 0.87, radius, divisions, 1, -halfAngle, halfAngle * 2),
      finEdge
    );
    hem.position.z = thickness / 2 + 0.00035;
    fan.add(hem);

    for (let i = 0; i <= divisions; i++) {
      const a = -halfAngle + (i / divisions) * halfAngle * 2;
      rod(
        fan,
        new THREE.Vector3(0.006, 0, thickness / 2 + 0.0007),
        new THREE.Vector3(
          Math.cos(a) * radius * 0.96,
          Math.sin(a) * radius * 0.96,
          thickness / 2 + 0.0007
        ),
        0.00125,
        finRay,
        0.0007
      );
    }
    return fan;
  }

  for (const side of [-1, 1]) {
    ellipsoid(
      root,
      new THREE.Vector3(side * 0.225, center.y - 0.004, 0.012),
      new THREE.Vector3(0.019, 0.023, 0.018),
      skin[3],
      detailSphere
    );
    const fin = makeFan(0.084, 0.70, 0.004, 7);
    fin.name = side === 1 ? "Left fluttering fin" : "Right fluttering fin";
    fin.position.set(side * 0.221, center.y - 0.004, 0.018);
    fin.scale.x = side;
    fin.rotation.y = side * -0.17;
    fin.rotation.z = side === 1 ? 0.12 : 0.09;
    root.add(fin);
  }

  // A short caudal stalk and a rounded, vertically spread tail fan.
  rod(
    root,
    new THREE.Vector3(0, center.y, -0.215),
    new THREE.Vector3(0, center.y + 0.002, -0.282),
    0.020,
    skin[3],
    0.0125
  );
  ellipsoid(
    root,
    new THREE.Vector3(0, center.y + 0.002, -0.271),
    new THREE.Vector3(0.016, 0.018, 0.017),
    spineBase
  );
  const tail = makeFan(0.106, 0.76, 0.007, 9);
  tail.name = "Stubby golden fan tail";
  tail.position.set(0, center.y + 0.002, -0.269);
  tail.rotation.y = Math.PI / 2;
  root.add(tail);

  // Oversized round eyes with small pupils and inward-raised worried brows.
  eyeDirections.forEach((direction, i) => {
    const side = i === 0 ? 1 : -1;
    const eye = new THREE.Group();
    eye.name = side === 1 ? "Left worried eye" : "Right worried eye";
    eye.position.copy(surfacePoint(direction));
    eye.quaternion.setFromUnitVectors(
      Z,
      new THREE.Vector3(side * 0.17, 0.11, 1).normalize()
    );
    root.add(eye);

    ellipsoid(
      eye,
      new THREE.Vector3(0, 0, -0.001),
      new THREE.Vector3(0.067, 0.073, 0.025),
      eyeSocket,
      detailSphere
    );

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.006, 6, 24), skin[3]);
    rim.scale.y = 1.10;
    rim.position.z = 0.011;
    eye.add(rim);

    ellipsoid(
      eye,
      new THREE.Vector3(0, 0, 0.021),
      new THREE.Vector3(0.058, 0.064, 0.042),
      eyeWhite,
      eyeSphere
    );

    const ix = -side * 0.004;
    const iy = -0.005;
    ellipsoid(
      eye,
      new THREE.Vector3(ix, iy, 0.061),
      new THREE.Vector3(0.0265, 0.028, 0.007),
      chocolate,
      detailSphere
    );
    ellipsoid(
      eye,
      new THREE.Vector3(ix, iy, 0.065),
      new THREE.Vector3(0.0227, 0.024, 0.006),
      irisGold,
      detailSphere
    );
    ellipsoid(
      eye,
      new THREE.Vector3(ix, iy, 0.070),
      new THREE.Vector3(0.0172, 0.020, 0.0065),
      pupil,
      detailSphere
    );
    ellipsoid(
      eye,
      new THREE.Vector3(ix - 0.0065, iy + 0.009, 0.0765),
      new THREE.Vector3(0.006, 0.0075, 0.0024),
      shine,
      detailSphere
    );
    ellipsoid(
      eye,
      new THREE.Vector3(ix + 0.007, iy - 0.007, 0.076),
      new THREE.Vector3(0.0025, 0.003, 0.0015),
      shine,
      detailSphere
    );

    const browPoints = [
      new THREE.Vector3(side * 0.047, 0.045, 0.036),
      new THREE.Vector3(side * 0.027, 0.060, 0.042),
      new THREE.Vector3(-side * 0.010, 0.070, 0.032),
      new THREE.Vector3(-side * 0.039, 0.069, 0.021),
    ];
    for (let j = 0; j < browPoints.length - 1; j++) {
      rod(eye, browPoints[j], browPoints[j + 1], 0.0061, skin[3], 0.0052);
      const a = browPoints[j].clone().add(new THREE.Vector3(0, 0.001, 0.003));
      const b = browPoints[j + 1].clone().add(new THREE.Vector3(0, 0.001, 0.003));
      rod(eye, a, b, 0.0026, cinnamon, 0.0021);
    }
  });

  // Subtle creamy cheeks frame a truly tiny, puckered O-shaped mouth.
  for (const side of [-1, 1]) {
    const n = new THREE.Vector3(side * 0.155, -0.12, 1).normalize();
    skinOval(n, 0.020, 0.016, skin[2], side * 0.12, undefined, 0.004);
  }

  const mouth = new THREE.Group();
  mouth.name = "Tiny pouting mouth";
  mouth.position.copy(surfacePoint(mouthDirection));
  mouth.quaternion.setFromUnitVectors(Z, surfaceNormal(mouthDirection));
  root.add(mouth);

  ellipsoid(
    mouth,
    new THREE.Vector3(0, 0, 0.008),
    new THREE.Vector3(0.0105, 0.0092, 0.0027),
    pupil,
    detailSphere
  );
  const pout = new THREE.Mesh(new THREE.TorusGeometry(0.011, 0.0045, 6, 16), lip);
  pout.position.z = 0.012;
  pout.scale.set(1, 0.88, 0.85);
  mouth.add(pout);
  ellipsoid(
    mouth,
    new THREE.Vector3(0, -0.0095, 0.014),
    new THREE.Vector3(0.009, 0.004, 0.004),
    skin[2],
    detailSphere
  );

  // Four lightweight bubbles, with thin rims and off-centre crescent glints.
  const bubbles = [
    { x: -0.008, y: 0.290, z: 0.305, r: 0.009 },
    { x: 0.008, y: 0.386, z: 0.330, r: 0.014 },
    { x: -0.022, y: 0.501, z: 0.345, r: 0.021 },
    { x: -0.006, y: 0.613, z: 0.360, r: 0.0145 },
  ];

  for (const data of bubbles) {
    const bubble = new THREE.Group();
    bubble.name = "Rising mouth bubble";
    bubble.position.set(data.x, data.y, data.z);
    root.add(bubble);

    bubble.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(data.r, 16, 10),
        bubbleGlass
      )
    );

    const outline = new THREE.Mesh(
      new THREE.TorusGeometry(data.r * 0.975, data.r * 0.025, 4, 24),
      bubbleEdge
    );
    outline.position.z = data.r * 0.06;
    bubble.add(outline);

    const crescent = new THREE.Mesh(
      new THREE.TorusGeometry(data.r * 0.79, data.r * 0.043, 4, 10, 1.03),
      shine
    );
    crescent.rotation.z = 1.64;
    crescent.position.z = data.r * 0.59;
    bubble.add(crescent);

    ellipsoid(
      bubble,
      new THREE.Vector3(-data.r * 0.29, data.r * 0.40, data.r * 0.85),
      new THREE.Vector3(data.r * 0.09, data.r * 0.13, data.r * 0.035),
      shine,
      detailSphere
    );
  }

  // Rest the lowest ivory thorn exactly on the model's floor.
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root, true);
  root.position.y -= bounds.min.y;
  return root;
}
```