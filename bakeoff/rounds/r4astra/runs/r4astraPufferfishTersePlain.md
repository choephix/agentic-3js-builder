```ts
import * as THREE from "three";

export const meta = {
  name: "Honeythorn Pufferfish",
  description:
    "An inflated, honey-gold pufferfish with ivory prickles, spotted skin, bright inquisitive eyes, a tiny four-toothed pout, and delicately ribbed fan fins.",
};

export default function createModel(): THREE.Object3D {
  const fish = new THREE.Group();

  let seed = 731924;
  function random(): number {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function material(
    color: number,
    roughness = 0.75,
    side: THREE.Side = THREE.FrontSide
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      flatShading: true,
      side,
    });
  }

  const palette = {
    back: material(0xb98435),
    gold: material(0xdfaa49),
    flank: material(0xf0c975),
    belly: material(0xf1dfae),
    ivory: material(0xffedc7, 0.53),
    socket: material(0xc9943e),
    spot: material(0x705033),
    freckle: material(0x98703b),
    lip: material(0xe4b67d),
    lipShade: material(0xb67c47),
    mouth: material(0x35291f, 0.84),
    iris: material(0x488780, 0.36),
    irisEdge: material(0x294e48, 0.4),
    pupil: material(0x101e20, 0.23),
    shine: material(0xffffff, 0.2),
    finLight: material(0xf1d48b, 0.7, THREE.DoubleSide),
    finGold: material(0xd9ac58, 0.73, THREE.DoubleSide),
    finShade: material(0xc28e40, 0.75, THREE.DoubleSide),
  };

  const round = new THREE.SphereGeometry(1, 12, 8);
  const smallRound = new THREE.SphereGeometry(1, 8, 5);
  const eyeRound = new THREE.SphereGeometry(1, 20, 12);
  const up = new THREE.Vector3(0, 1, 0);
  const forward = new THREE.Vector3(0, 0, 1);

  function mesh(
    geometry: THREE.BufferGeometry,
    mat: THREE.Material | THREE.Material[],
    parent: THREE.Object3D = fish
  ): THREE.Mesh {
    const object = new THREE.Mesh(geometry, mat);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  function ellipsoid(
    parent: THREE.Object3D,
    mat: THREE.Material,
    position: THREE.Vector3,
    scale: THREE.Vector3,
    geometry: THREE.BufferGeometry = round
  ): THREE.Mesh {
    const object = mesh(geometry, mat, parent);
    object.position.copy(position);
    object.scale.copy(scale);
    return object;
  }

  function rod(
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    radiusA: number,
    radiusB: number,
    mat: THREE.Material,
    sides = 6
  ): THREE.Mesh {
    const direction = new THREE.Vector3().subVectors(b, a);
    const object = mesh(
      new THREE.CylinderGeometry(
        radiusB,
        radiusA,
        direction.length(),
        sides,
        1
      ),
      mat,
      parent
    );
    object.position.copy(a).add(b).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(up, direction.normalize());
    return object;
  }

  const center = new THREE.Vector3(0, 0.247, 0.025);
  const radii = new THREE.Vector3(0.215, 0.205, 0.225);

  function skinPoint(n: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(
      center.x + radii.x * n.x,
      center.y + radii.y * n.y,
      center.z + radii.z * n.z
    );
  }

  function skinNormal(n: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(
      n.x / radii.x,
      n.y / radii.y,
      n.z / radii.z
    ).normalize();
  }

  function faceArea(n: THREE.Vector3): boolean {
    return (
      n.z > 0.66 &&
      Math.abs(n.x) < 0.76 &&
      n.y > -0.48 &&
      n.y < 0.63
    );
  }

  // One substantial, faceted body, with a softly scalloped painted belly.
  const bodyGeometry = new THREE.SphereGeometry(1, 32, 22);
  const positions = bodyGeometry.getAttribute("position");
  const originalIndex = bodyGeometry.getIndex()!;
  const colorIndices: number[][] = [[], [], [], []];

  for (let i = 0; i < originalIndex.count; i += 3) {
    const ia = originalIndex.getX(i);
    const ib = originalIndex.getX(i + 1);
    const ic = originalIndex.getX(i + 2);
    const x = (positions.getX(ia) + positions.getX(ib) + positions.getX(ic)) / 3;
    const y = (positions.getY(ia) + positions.getY(ib) + positions.getY(ic)) / 3;
    const z = (positions.getZ(ia) + positions.getZ(ib) + positions.getZ(ic)) / 3;
    const angle = Math.atan2(z, x);
    let color = 1;
    if (y > 0.59 + Math.sin(angle * 3) * 0.025) color = 0;
    else if (y < -0.29 + Math.sin(angle * 7) * 0.037) color = 3;
    else if (y < 0.065 + Math.sin(angle * 5) * 0.027) color = 2;
    colorIndices[color].push(ia, ib, ic);
  }

  bodyGeometry.clearGroups();
  const reordered: number[] = [];
  for (let i = 0; i < colorIndices.length; i++) {
    bodyGeometry.addGroup(reordered.length, colorIndices[i].length, i);
    reordered.push(...colorIndices[i]);
  }
  bodyGeometry.setIndex(reordered);
  const body = mesh(bodyGeometry, [
    palette.back,
    palette.gold,
    palette.flank,
    palette.belly,
  ]);
  body.position.copy(center);
  body.scale.copy(radii);

  // Short, tapered quills, each growing from a small raised skin follicle.
  const spineDirections: THREE.Vector3[] = [];
  const spineCount = 164;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < spineCount; i++) {
    const y = 1 - (2 * (i + 0.5)) / spineCount;
    const ringRadius = Math.sqrt(1 - y * y);
    const angle = i * goldenAngle + 0.27;
    const n = new THREE.Vector3(
      Math.cos(angle) * ringRadius,
      y,
      Math.sin(angle) * ringRadius
    );

    if (faceArea(n) || n.z < -0.925) continue;
    if (
      Math.abs(n.x) > 0.9 &&
      n.y < 0.08 &&
      n.y > -0.34 &&
      Math.abs(n.z) < 0.26
    ) continue;
    if (Math.abs(n.x) < 0.17 && n.z < -0.5 && n.y > 0.51) continue;

    spineDirections.push(n.clone());
    const normal = skinNormal(n);
    const surface = skinPoint(n);
    const length =
      (n.y < -0.35 ? 0.023 : 0.029) * (0.79 + random() * 0.48);
    const radius = 0.0062 + random() * 0.0023;

    const follicle = ellipsoid(
      fish,
      n.y < -0.27 ? palette.flank : palette.socket,
      surface.clone().addScaledVector(normal, 0.0004),
      new THREE.Vector3(radius * 1.38, 0.0026, radius * 1.38),
      smallRound
    );
    follicle.quaternion.setFromUnitVectors(up, normal);

    const spike = mesh(
      new THREE.ConeGeometry(radius, length, 6, 1),
      palette.ivory
    );
    spike.position
      .copy(surface)
      .addScaledVector(normal, length * 0.5 + 0.0004);
    spike.quaternion.setFromUnitVectors(up, normal);
  }

  // Flat, irregularly sized skin markings between the quills.
  let spotCount = 0;
  for (let attempt = 0; attempt < 900 && spotCount < 72; attempt++) {
    const y = -0.36 + random() * 1.34;
    const angle = random() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    const n = new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
    if (faceArea(n) || n.z < -0.95) continue;
    if (spineDirections.some((s) => s.dot(n) > 0.994)) continue;

    const normal = skinNormal(n);
    const radius = 0.005 + Math.pow(random(), 0.7) * 0.009;
    const marking = ellipsoid(
      fish,
      spotCount % 5 === 0 ? palette.freckle : palette.spot,
      skinPoint(n).addScaledVector(normal, 0.0005),
      new THREE.Vector3(radius, radius * (0.65 + random() * 0.38), 0.0017),
      smallRound
    );
    marking.quaternion.setFromUnitVectors(forward, normal);
    marking.rotateZ(random() * Math.PI);

    if (spotCount % 5 === 0 && y > 0.05) {
      const neighbor = n
        .clone()
        .add(new THREE.Vector3(0.065, -0.055, 0.015))
        .normalize();
      if (!faceArea(neighbor)) {
        const dot = ellipsoid(
          fish,
          palette.spot,
          skinPoint(neighbor).addScaledVector(skinNormal(neighbor), 0.0005),
          new THREE.Vector3(0.0035, 0.0042, 0.0012),
          smallRound
        );
        dot.quaternion.setFromUnitVectors(forward, skinNormal(neighbor));
      }
    }
    spotCount++;
  }

  // Eye cups are part of the silhouette rather than merely painted-on eyes.
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.112, 0.309, 0.218);
    eye.rotation.y = side * 0.3;
    fish.add(eye);

    ellipsoid(
      eye, palette.socket,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.057, 0.06, 0.034),
      eyeRound
    );
    ellipsoid(
      eye, palette.ivory,
      new THREE.Vector3(0, 0.003, 0.02),
      new THREE.Vector3(0.044, 0.048, 0.032),
      eyeRound
    );
    ellipsoid(
      eye, palette.irisEdge,
      new THREE.Vector3(-side * 0.002, 0.001, 0.048),
      new THREE.Vector3(0.028, 0.032, 0.011),
      eyeRound
    );
    ellipsoid(
      eye, palette.iris,
      new THREE.Vector3(-side * 0.002, 0.001, 0.054),
      new THREE.Vector3(0.0245, 0.0285, 0.008),
      eyeRound
    );
    ellipsoid(
      eye, palette.pupil,
      new THREE.Vector3(-side * 0.003, 0.001, 0.06),
      new THREE.Vector3(0.0165, 0.023, 0.006),
      eyeRound
    );
    ellipsoid(
      eye, palette.shine,
      new THREE.Vector3(-0.008, 0.013, 0.0655),
      new THREE.Vector3(0.007, 0.009, 0.003),
      smallRound
    );
    ellipsoid(
      eye, palette.shine,
      new THREE.Vector3(0.007, -0.009, 0.0655),
      new THREE.Vector3(0.0027, 0.0033, 0.0018),
      smallRound
    );

    const brow = mesh(
      new THREE.TorusGeometry(0.048, 0.0065, 6, 12, Math.PI * 0.87),
      palette.gold,
      eye
    );
    brow.position.set(0, 0.004, 0.022);
    brow.rotation.z = Math.PI * 0.065;
    brow.scale.y = 1.055;
  }

  // Soft cheek pads, tiny nostrils and understated cheek freckles.
  for (const side of [-1, 1]) {
    const cheek = ellipsoid(
      fish, palette.flank,
      new THREE.Vector3(side * 0.053, 0.22, 0.242),
      new THREE.Vector3(0.028, 0.017, 0.013)
    );
    cheek.rotation.y = side * 0.16;

    for (let j = 0; j < 3; j++) {
      ellipsoid(
        fish, palette.freckle,
        new THREE.Vector3(
          side * (0.049 + j * 0.009),
          0.223 + (j === 1 ? 0.004 : 0),
          0.254 - j * 0.0014
        ),
        new THREE.Vector3(0.0021, 0.0018, 0.001),
        smallRound
      );
    }

    ellipsoid(
      fish, palette.flank,
      new THREE.Vector3(side * 0.034, 0.264, 0.248),
      new THREE.Vector3(0.009, 0.0055, 0.005),
      smallRound
    );
    ellipsoid(
      fish, palette.spot,
      new THREE.Vector3(side * 0.034, 0.2645, 0.2525),
      new THREE.Vector3(0.0032, 0.0022, 0.0015),
      smallRound
    );
  }

  // Puckered mouth with the characteristic paired upper and lower tooth plates.
  ellipsoid(
    fish, palette.flank,
    new THREE.Vector3(0, 0.206, 0.249),
    new THREE.Vector3(0.042, 0.032, 0.022)
  );
  ellipsoid(
    fish, palette.mouth,
    new THREE.Vector3(0, 0.206, 0.273),
    new THREE.Vector3(0.024, 0.018, 0.0045)
  );

  const lip = mesh(
    new THREE.TorusGeometry(0.0245, 0.0067, 8, 20),
    palette.lip
  );
  lip.position.set(0, 0.206, 0.277);
  lip.scale.set(1.13, 0.9, 1);

  const innerLip = mesh(
    new THREE.TorusGeometry(0.0188, 0.002, 5, 18),
    palette.lipShade
  );
  innerLip.position.set(0, 0.206, 0.2758);
  innerLip.scale.set(1.12, 0.88, 1);

  for (const side of [-1, 1]) {
    const upper = mesh(
      new THREE.BoxGeometry(0.0085, 0.008, 0.004),
      palette.ivory
    );
    upper.position.set(side * 0.0049, 0.215, 0.278);
    upper.rotation.z = -side * 0.065;

    const lower = mesh(
      new THREE.BoxGeometry(0.008, 0.005, 0.0035),
      palette.ivory
    );
    lower.position.set(side * 0.0047, 0.1955, 0.2775);
    lower.rotation.z = side * 0.045;
  }

  // A single curved gill opening on either side, ahead of each pectoral fin.
  for (const side of [-1, 1]) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const n = new THREE.Vector3(
        side * 0.91,
        0.15 - t * 0.31,
        0.38 + Math.sin(t * Math.PI) * 0.07
      ).normalize();
      points.push(skinPoint(n).addScaledVector(skinNormal(n), 0.002));
    }
    for (let i = 0; i < points.length - 1; i++) {
      rod(fish, points[i], points[i + 1], 0.0022, 0.0022, palette.spot);
    }
  }

  // Primitive circle sectors make thin, visibly ribbed fan fins.
  function fanFin(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    spreadDirection: THREE.Vector3,
    radius: number,
    halfAngle: number,
    segments: number,
    tail = false
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(origin);
    const ex = direction.clone().normalize();
    const ey = spreadDirection
      .clone()
      .addScaledVector(ex, -spreadDirection.dot(ex))
      .normalize();
    const ez = new THREE.Vector3().crossVectors(ex, ey).normalize();
    group.setRotationFromMatrix(new THREE.Matrix4().makeBasis(ex, ey, ez));
    fish.add(group);

    const arc = halfAngle * 2;
    const colors = [palette.finLight, palette.finGold, palette.finLight, palette.finShade];

    for (let i = 0; i < segments; i++) {
      mesh(
        new THREE.CircleGeometry(
          radius,
          3,
          -halfAngle + (arc * i) / segments,
          arc / segments
        ),
        colors[i % colors.length],
        group
      );
    }

    const band = mesh(
      new THREE.RingGeometry(
        radius * (tail ? 0.81 : 0.9),
        radius,
        segments,
        1,
        -halfAngle,
        arc
      ),
      tail ? palette.finShade : palette.finGold,
      group
    );
    band.position.z = 0.0004;

    const edgeBand = mesh(
      new THREE.RingGeometry(
        radius * 0.976,
        radius * 1.015,
        segments,
        1,
        -halfAngle,
        arc
      ),
      palette.finLight,
      group
    );
    edgeBand.position.z = 0.0007;

    const endpoints: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = -halfAngle + (arc * i) / segments;
      const end = new THREE.Vector3(
        Math.cos(a) * radius,
        Math.sin(a) * radius,
        0.0013
      );
      endpoints.push(end);
      rod(
        group,
        new THREE.Vector3(radius * 0.055, 0, 0.0013),
        end,
        tail ? 0.0021 : 0.00165,
        0.00085,
        palette.ivory,
        5
      );
    }

    for (let i = 0; i < endpoints.length - 1; i++) {
      rod(
        group,
        endpoints[i],
        endpoints[i + 1],
        0.001,
        0.001,
        palette.finLight,
        5
      );
    }

    ellipsoid(
      group, palette.gold,
      new THREE.Vector3(radius * 0.075, 0, 0),
      new THREE.Vector3(radius * 0.19, radius * 0.115, 0.009),
      smallRound
    );

    return group;
  }

  for (const side of [-1, 1]) {
    fanFin(
      new THREE.Vector3(side * 0.203, 0.224, -0.004),
      new THREE.Vector3(side * 0.91, -0.12, -0.39),
      new THREE.Vector3(0, 1, 0),
      0.137,
      0.59,
      8
    );
  }

  // Narrow caudal peduncle, clearly distinct from the inflated body.
  rod(
    fish,
    new THREE.Vector3(0, 0.247, -0.163),
    new THREE.Vector3(0, 0.247, -0.306),
    0.061,
    0.026,
    palette.gold,
    10
  );
  ellipsoid(
    fish, palette.belly,
    new THREE.Vector3(0, 0.227, -0.249),
    new THREE.Vector3(0.031, 0.016, 0.057)
  );

  fanFin(
    new THREE.Vector3(0, 0.247, -0.299),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 1, 0),
    0.151,
    0.78,
    10,
    true
  );

  fanFin(
    new THREE.Vector3(0, 0.386, -0.135),
    new THREE.Vector3(0, 0.72, -0.69),
    new THREE.Vector3(0, 0.69, 0.72),
    0.097,
    0.58,
    7
  );

  fanFin(
    new THREE.Vector3(0, 0.123, -0.142),
    new THREE.Vector3(0, -0.54, -0.84),
    new THREE.Vector3(0, 0.84, -0.54),
    0.076,
    0.5,
    6
  );

  // A large adult, about sixty centimetres from lips to tail.
  fish.scale.setScalar(0.82);
  fish.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(fish);
  fish.position.y -= bounds.min.y;
  fish.updateMatrixWorld(true);

  return fish;
}
```