```ts
import * as THREE from "three";

export const meta = {
  name: "Sunleaf Chameleon",
  description:
    "A jewel-green veiled chameleon with golden flank markings, swivelling turret eyes, split grasping feet, a tall angular casque, and a tightly curled tail."
};

export default function (): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Sunleaf chameleon";

  let seed = 194731;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const material = (color: string, roughness = 0.83) =>
    new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });

  const M = {
    jade: material("#369756"),
    leaf: material("#72B64D"),
    forest: material("#245F43"),
    teal: material("#288C80"),
    mint: material("#83BC7A"),
    lime: material("#BDD456"),
    gold: material("#D9BD55"),
    yellow: material("#DACC75"),
    cream: material("#E7E2AF"),
    orange: material("#CD874B"),
    deepTeal: material("#226F66"),
    paleMint: material("#B6D49A"),
    casque: material("#599D46"),
    casquePanel: material("#9BBB50"),
    eyeGold: material("#CBA347", 0.53),
    black: material("#102B26", 0.28)
  };

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const Y = V(0, 1, 0);
  const Z = V(0, 0, 1);
  const sphere = new THREE.SphereGeometry(1, 12, 8);
  const smallSphere = new THREE.SphereGeometry(1, 8, 6);
  const scaleSphere = new THREE.SphereGeometry(1, 7, 4);

  function ellipsoid(
    p: THREE.Vector3,
    s: THREE.Vector3,
    mat: THREE.MeshStandardMaterial,
    parent: THREE.Object3D = root,
    geometry: THREE.BufferGeometry = smallSphere
  ) {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.copy(p);
    mesh.scale.copy(s);
    parent.add(mesh);
    return mesh;
  }

  function rod(
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    mat: THREE.MeshStandardMaterial,
    parent: THREE.Object3D = root,
    sides = 8
  ) {
    const delta = b.clone().sub(a);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(rb, ra, delta.length(), sides, 1),
      mat
    );
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Y, delta.normalize());
    parent.add(mesh);
    return mesh;
  }

  function disk(
    p: THREE.Vector3,
    normal: THREE.Vector3,
    rx: number,
    ry: number,
    thickness: number,
    mat: THREE.MeshStandardMaterial,
    parent: THREE.Object3D = root
  ) {
    const mesh = ellipsoid(
      p, V(rx, ry, thickness), mat, parent, scaleSphere
    );
    mesh.quaternion.setFromUnitVectors(Z, normal);
    return mesh;
  }

  // A triangular cylinder, reshaped into a simple triangular prism.
  function prism(
    a: THREE.Vector2,
    b: THREE.Vector2,
    c: THREE.Vector2,
    thickness: number,
    mat: THREE.MeshStandardMaterial,
    x = 0
  ) {
    const g = new THREE.CylinderGeometry(1, 1, 1, 3, 1, false);
    const positions = g.getAttribute("position");
    const cy = (a.x + b.x + c.x) / 3;
    const cz = (a.y + b.y + c.y) / 3;
    for (let i = 0; i < positions.count; i++) {
      const px = positions.getX(i);
      const py = positions.getY(i);
      const pz = positions.getZ(i);
      positions.setXYZ(
        i,
        x + py * thickness,
        cy + px * (b.x - c.x) / Math.sqrt(3) + pz * (a.x - cy),
        cz + px * (b.y - c.y) / Math.sqrt(3) + pz * (a.y - cz)
      );
    }
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, mat);
    root.add(mesh);
    return mesh;
  }

  // The broad flank markings are colours on the facets of a single body.
  const bodyGeometry = new THREE.SphereGeometry(1, 22, 14);
  const bodyMaterials = [
    M.jade, M.leaf, M.teal, M.mint, M.lime, M.gold, M.deepTeal
  ];
  bodyGeometry.clearGroups();
  const bp = bodyGeometry.getAttribute("position");
  const indices = bodyGeometry.getIndex()!;
  let previousMaterial = -1;
  let groupStart = 0;
  for (let i = 0; i < indices.count; i += 3) {
    const center = V(0, 0, 0);
    for (let j = 0; j < 3; j++) {
      const k = indices.getX(i + j);
      center.add(V(bp.getX(k), bp.getY(k), bp.getZ(k)));
    }
    center.multiplyScalar(1 / 3);
    let color = 0;
    if (center.y > 0.48) color = 1;
    if (center.y < -0.25) color = 2;
    if (center.y < -0.74) color = 3;
    if (Math.abs(center.x) > 0.43 && center.y > -0.64 && center.y < 0.66) {
      const bend = 0.045 * Math.sin(center.y * 8) + center.y * 0.045;
      const inBand = [-0.61, -0.10, 0.43].some(
        z => Math.abs(center.z - z - bend) < 0.115
      );
      if (inBand) color = center.y < -0.05 ? 5 : 4;
    }
    if (color !== previousMaterial) {
      if (previousMaterial !== -1) {
        bodyGeometry.addGroup(groupStart, i - groupStart, previousMaterial);
      }
      groupStart = i;
      previousMaterial = color;
    }
  }
  bodyGeometry.addGroup(groupStart, indices.count - groupStart, previousMaterial);

  const body = new THREE.Mesh(bodyGeometry, bodyMaterials);
  body.position.set(0, 0.123, -0.019);
  body.scale.set(0.047, 0.070, 0.121);
  root.add(body);

  // Neck, throat, jaw, and the elongated, gently pointed muzzle.
  ellipsoid(V(0, 0.133, 0.091), V(0.033, 0.034, 0.046), M.jade, root, sphere);
  ellipsoid(V(0, 0.117, 0.112), V(0.028, 0.022, 0.043), M.mint);
  ellipsoid(V(0, 0.130, 0.168), V(0.031, 0.012, 0.057), M.paleMint);

  const head = ellipsoid(
    V(0, 0.157, 0.151), V(0.043, 0.036, 0.061), M.leaf, root, sphere
  );
  const muzzle = ellipsoid(
    V(0, 0.145, 0.196), V(0.032, 0.023, 0.035), M.leaf, root, sphere
  );
  const jaw = ellipsoid(
    V(0, 0.136, 0.165), V(0.036, 0.010, 0.059), M.mint, root, sphere
  );

  // Tall, blade-like veiled-chameleon casque.
  const ca = new THREE.Vector2(0.249, 0.108);
  const cb = new THREE.Vector2(0.171, 0.181);
  const cc = new THREE.Vector2(0.168, 0.078);
  prism(ca, cb, cc, 0.045, M.casque);

  const casqueCenter = ca.clone().add(cb).add(cc).multiplyScalar(1 / 3);
  const inset = (p: THREE.Vector2, amount: number) =>
    p.clone().sub(casqueCenter).multiplyScalar(amount).add(casqueCenter);

  for (const side of [-1, 1]) {
    prism(inset(ca, 0.79), inset(cb, 0.79), inset(cc, 0.79),
      0.0012, M.casquePanel, side * 0.0228);

    rod(
      V(side * 0.0234, 0.238, 0.111),
      V(side * 0.0234, 0.180, 0.165),
      0.0020, 0.0028, M.lime
    );
    rod(
      V(side * 0.0228, 0.234, 0.105),
      V(side * 0.0228, 0.180, 0.086),
      0.0015, 0.0021, M.forest
    );

    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      disk(
        V(side * 0.0241, 0.183 + t * 0.042, 0.109 + t * 0.006),
        V(side, 0, 0),
        0.0016 + (i % 2) * 0.0005,
        0.0022,
        0.00055,
        i % 3 === 0 ? M.gold : M.leaf
      );
    }
  }
  rod(V(0, 0.249, 0.108), V(0, 0.176, 0.178),
    0.0027, 0.0033, M.lime);
  rod(V(0, 0.247, 0.108), V(0, 0.172, 0.079),
    0.0021, 0.0030, M.forest);

  // A fine sawtooth dorsal ridge, rather than oversized dragon spikes.
  for (let i = 0; i < 17; i++) {
    const z = -0.128 + i * 0.0125;
    const u = (z + 0.019) / 0.121;
    const y = 0.123 + 0.070 * Math.sqrt(Math.max(0, 1 - u * u));
    const height = 0.006 + 0.004 * Math.sin(Math.PI * (i + 1) / 19);
    prism(
      new THREE.Vector2(y + height, z - 0.002),
      new THREE.Vector2(y - 0.001, z + 0.0047),
      new THREE.Vector2(y - 0.001, z - 0.0047),
      0.0035,
      i % 4 === 0 ? M.gold : M.lime
    );
  }

  // Subtle pointed scales underneath the throat.
  for (let i = 0; i < 7; i++) {
    const z = 0.100 + i * 0.010;
    const y = 0.096 + i * 0.0043;
    rod(V(0, y + 0.004, z), V(0, y - 0.002, z + 0.001),
      0.0032, 0, M.paleMint, root, 4);
  }

  // Surface-attached freckles and a broken pale lateral stripe.
  root.updateMatrixWorld(true);
  const raycaster = new THREE.Raycaster();

  function surface(
    side: number,
    y: number,
    z: number,
    objects: THREE.Object3D[]
  ) {
    raycaster.set(V(side * 0.25, y, z), V(-side, 0, 0));
    const hits = raycaster.intersectObjects(objects, false);
    if (!hits.length || !hits[0].face) return null;
    const hit = hits[0];
    const normal = hit.face!.normal.clone().applyNormalMatrix(
      new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)
    ).normalize();
    return { p: hit.point.clone(), normal };
  }

  for (const side of [-1, 1]) {
    for (let i = 0; i < 68; i++) {
      const z = -0.124 + random() * 0.211;
      const y = 0.083 + random() * 0.091;
      const hit = surface(side, y, z, [body]);
      if (!hit || Math.abs(hit.normal.x) < 0.37) continue;
      const r = 0.0011 + random() * 0.0012;
      const colors = [M.leaf, M.mint, M.gold, M.orange, M.deepTeal];
      const color = colors[Math.floor(random() * colors.length)];
      disk(
        hit.p.addScaledVector(hit.normal, 0.00035), hit.normal,
        r, r * (0.8 + random() * 0.5), 0.00065, color
      );
    }

    for (let i = 0; i < 19; i++) {
      const t = i / 18;
      const z = -0.116 + 0.205 * t;
      const y = 0.111 + 0.025 * t + 0.0015 * Math.sin(t * 15);
      const hit = surface(side, y, z, [body]);
      if (!hit) continue;
      disk(
        hit.p.addScaledVector(hit.normal, 0.0006), hit.normal,
        0.0020, 0.0031, 0.00085,
        i % 4 === 0 ? M.lime : M.paleMint
      );
    }
  }

  // Thin closed mouth, fitted to the actual faceted face.
  for (const side of [-1, 1]) {
    const mouth: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const z = 0.124 + t * 0.104;
      const y = 0.138 + 0.004 * Math.pow(2 * t - 1, 2);
      const hit = surface(side, y, z, [head, muzzle, jaw]);
      if (hit) mouth.push(hit.p.addScaledVector(hit.normal, 0.0007));
    }
    mouth.push(V(0, 0.142, 0.2312));
    for (let i = 1; i < mouth.length; i++) {
      rod(mouth[i - 1], mouth[i], 0.0011, 0.0011, M.forest, root, 6);
    }

    const nostril = surface(side, 0.157, 0.216, [muzzle]);
    if (nostril) {
      disk(nostril.p.clone().addScaledVector(nostril.normal, 0.0004),
        nostril.normal, 0.0030, 0.0021, 0.0007, M.lime);
      disk(nostril.p.clone().addScaledVector(nostril.normal, 0.0011),
        nostril.normal, 0.0016, 0.0010, 0.0005, M.forest);
    }

    for (let i = 0; i < 6; i++) {
      const z = 0.120 + i * 0.012;
      const hit = surface(side, 0.149 + (i % 2) * 0.002, z, [head, muzzle]);
      if (hit) {
        disk(hit.p.addScaledVector(hit.normal, 0.0006), hit.normal,
          0.0018, 0.0022, 0.0006, i % 2 ? M.gold : M.paleMint);
      }
    }
  }

  // Independently aimed turret eyes: skin-covered globes, tiny dark apertures.
  for (const side of [-1, 1]) {
    const center = V(side * 0.043, 0.175, 0.165);
    const normal = side === 1
      ? V(0.84, 0.10, 0.53).normalize()
      : V(-0.94, 0.12, 0.32).normalize();

    const turret = ellipsoid(center, V(0.025, 0.026, 0.022), M.leaf, root, sphere);
    turret.quaternion.setFromUnitVectors(Z, normal);

    const tangent = V(0, 1, 0).cross(normal).normalize();
    const up = normal.clone().cross(tangent).normalize();

    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI * 2 / 12;
      const p = center.clone().addScaledVector(normal, 0.0139)
        .addScaledVector(tangent, Math.cos(a) * 0.019)
        .addScaledVector(up, Math.sin(a) * 0.019);
      disk(p, normal, 0.0020, 0.0026, 0.0010,
        i % 3 === 0 ? M.gold : M.lime);
    }

    const eyelid = new THREE.Mesh(
      new THREE.TorusGeometry(0.0118, 0.0035, 6, 14), M.lime
    );
    eyelid.position.copy(center).addScaledVector(normal, 0.0180);
    eyelid.quaternion.setFromUnitVectors(Z, normal);
    root.add(eyelid);

    disk(center.clone().addScaledVector(normal, 0.0213), normal,
      0.0085, 0.0085, 0.0015, M.eyeGold);
    disk(center.clone().addScaledVector(normal, 0.0230), normal,
      0.0043, 0.0047, 0.0011, M.black);
    disk(center.clone().addScaledVector(normal, 0.0241)
      .addScaledVector(up, 0.00165).addScaledVector(tangent, -0.00115),
      normal, 0.00115, 0.00115, 0.00035, M.cream);
  }

  function foot(x: number, z: number, rotation: number) {
    const group = new THREE.Group();
    group.position.set(x, 0.008, z);
    group.rotation.y = rotation;
    root.add(group);

    ellipsoid(V(0, 0.006, 0), V(0.012, 0.009, 0.016), M.leaf, group);

    // The toes remain in two opposed, mitten-like bundles: three and two.
    for (const direction of [-1, 1]) {
      const count = direction === -1 ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * 0.0038;
        const a = V(direction * 0.005 + offset * 0.7, 0.005, 0.004);
        const b = V(direction * 0.013 + offset, 0.001, 0.015);
        const c = V(direction * 0.016 + offset, -0.004,
          0.024 - Math.abs(offset) * 0.35);
        rod(a, b, 0.0050, 0.0045, M.lime, group, 6);
        rod(b, c, 0.0045, 0.0038, M.leaf, group, 6);
        ellipsoid(c, V(0.0038, 0.004, 0.004), M.leaf, group, scaleSphere);
        const clawTip = c.clone().add(V(direction * 0.0015, -0.002, 0.0065));
        rod(c.clone().add(V(0, 0.001, 0.001)), clawTip,
          0.00165, 0, M.cream, group, 5);
      }
    }
  }

  // Four separated, angular limbs in a low, stable walking-rest stance.
  for (const side of [-1, 1]) {
    const limbs = [
      {
        shoulder: V(side * 0.034, 0.138, 0.065),
        elbow: V(side * 0.075, 0.080, 0.032),
        wrist: V(side * 0.087, 0.023, 0.105),
        footZ: 0.111,
        upper: 0.0118,
        color: M.jade,
        rotation: side * 0.20
      },
      {
        shoulder: V(side * 0.032, 0.114, -0.092),
        elbow: V(side * 0.073, 0.071, -0.050),
        wrist: V(side * 0.086, 0.023, -0.113),
        footZ: -0.120,
        upper: 0.0152,
        color: M.leaf,
        rotation: Math.PI - side * 0.48
      }
    ];

    for (const limb of limbs) {
      ellipsoid(limb.shoulder, V(limb.upper, limb.upper, limb.upper * 1.12),
        limb.color);
      rod(limb.shoulder, limb.elbow, limb.upper, 0.0108, limb.color);
      ellipsoid(limb.elbow, V(0.012, 0.012, 0.012), M.leaf);
      rod(limb.elbow, limb.wrist, 0.0091, 0.0058, M.jade);
      ellipsoid(limb.wrist, V(0.0063, 0.0065, 0.0063), M.lime);

      for (const t of [0.55, 0.75]) {
        const a = limb.elbow.clone().lerp(limb.wrist, t);
        const b = limb.elbow.clone().lerp(limb.wrist, t + 0.055);
        const r = THREE.MathUtils.lerp(0.0091, 0.0058, t) + 0.0002;
        rod(a, b, r, r - 0.0002, M.leaf, root, 8);
      }
      for (let i = 0; i < 4; i++) {
        const p = limb.shoulder.clone().lerp(limb.elbow, 0.35 + i * 0.14);
        p.x += side * 0.009;
        disk(p, V(side, 0.15, 0).normalize(),
          0.0016, 0.0021, 0.0008, i % 2 ? M.gold : M.mint);
      }

      rod(limb.wrist, V(limb.wrist.x, 0.015, limb.footZ),
        0.0058, 0.007, M.leaf);
      foot(limb.wrist.x, limb.footZ, limb.rotation);
    }
  }

  // A tapering polygonal tail. The clear negative space inside the spiral
  // is intentional, and the segments get finer toward the golden tip.
  const tailPoints: THREE.Vector3[] = [
    V(0, 0.119, -0.121),
    V(0, 0.112, -0.139),
    V(0, 0.099, -0.152)
  ];
  const tailRadii = [0.0155, 0.0140, 0.0128];
  const tailColors: THREE.MeshStandardMaterial[] = [M.jade, M.jade, M.leaf];

  const turns = 65;
  for (let i = 0; i <= turns; i++) {
    const t = i / turns;
    const angle = -0.22 - t * Math.PI * 3.05;
    const radius = 0.080 - 0.065 * t;
    tailPoints.push(V(
      0,
      0.099 + Math.sin(angle) * radius,
      -0.238 + Math.cos(angle) * radius
    ));
    tailRadii.push(0.0120 * (1 - t) + 0.0022 * t);
    let color = t < 0.22 ? M.jade : t < 0.54 ? M.leaf : M.lime;
    if (t > 0.84) color = M.yellow;
    if (i % 10 === 5 || i % 10 === 6) {
      color = t < 0.48 ? M.leaf : M.gold;
    }
    tailColors.push(color);
  }

  for (let i = 0; i < tailPoints.length; i++) {
    const r = tailRadii[i];
    ellipsoid(tailPoints[i], V(r, r, r), tailColors[i], root, smallSphere);
    if (i > 0) {
      rod(tailPoints[i - 1], tailPoints[i],
        tailRadii[i - 1], r, tailColors[i], root, 8);
    }
  }

  // A few little scales make the tail root flow into the dorsal crest.
  for (let i = 0; i < 5; i++) {
    const a = tailPoints[Math.min(i + 1, tailPoints.length - 1)];
    const r = tailRadii[i + 1];
    rod(V(0, a.y + r * 0.82, a.z),
      V(0, a.y + r + 0.004 * (1 - i / 6), a.z - 0.0015),
      0.0026, 0, M.lime, root, 4);
  }

  // Adult veiled-chameleon scale; the toe pads meet the ground at y = 0.
  root.scale.setScalar(0.75);
  root.traverse(object => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  return root;
}
```