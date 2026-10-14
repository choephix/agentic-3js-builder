```ts
import * as THREE from "three";

export const meta = {
  name: "First Bloom — Newborn Unicorn",
  description:
    "A pearly, lilac-shimmered unicorn foal finding its feet, with silver hooves, a tiny spiral horn, pastel baby fluff, and a handmade daisy chain."
};

export default function (): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "First Bloom";
  root.scale.setScalar(0.86);

  let seed = 73129;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = P(0, 1, 0);
  const FRONT = P(0, 0, 1);

  function material(color: string, roughness = 0.55, metalness = 0) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      flatShading: true
    });
  }

  const m = {
    pearl: material("#f8f5f3", 0.4, 0.16),
    lilacPearl: material("#e5dff0", 0.43, 0.17),
    warmPearl: material("#fff0ed", 0.42, 0.13),
    blush: material("#efd5e4", 0.65),
    earShadow: material("#cbaecc", 0.68),
    pink: material("#efb5cf", 0.66),
    mint: material("#b9e3d2", 0.65),
    lavender: material("#c6b5e3", 0.66),
    pinkLight: material("#f6cfdf", 0.67),
    lid: material("#c5b3d1", 0.54),
    dark: material("#211a2d", 0.2, 0.06),
    iris: material("#49344f", 0.28, 0.04),
    nose: material("#76617c", 0.59),
    silver: material("#aebed0", 0.29, 0.77),
    silverLight: material("#e0e8f2", 0.23, 0.8),
    sole: material("#75879a", 0.4, 0.48),
    gold: material("#d9a443", 0.3, 0.68),
    goldLight: material("#ffdf88", 0.27, 0.65),
    petal: material("#fffcee", 0.77),
    yellow: material("#f4ca55", 0.67),
    pollen: material("#d99b39", 0.7),
    leaf: material("#99bea5", 0.74),
    vine: material("#719a83", 0.78),
    white: material("#ffffff", 0.18, 0.04)
  };

  const ball = new THREE.SphereGeometry(1, 12, 8);
  const fluff = new THREE.SphereGeometry(1, 9, 6);
  const small = new THREE.SphereGeometry(1, 8, 5);
  const tiny = new THREE.SphereGeometry(1, 6, 4);
  const diamond = new THREE.OctahedronGeometry(1, 0);

  // The large coat primitives have broad, subtly different pearl facets,
  // rather than a noisy surface pattern.
  function makePearlGeometry() {
    const source = new THREE.SphereGeometry(1, 12, 8).toNonIndexed();
    const positions = source.getAttribute("position");
    const buckets: number[][] = [[], [], []];

    for (let i = 0; i < positions.count; i += 3) {
      let x = 0, y = 0, z = 0;
      for (let j = 0; j < 3; j++) {
        x += positions.getX(i + j) / 3;
        y += positions.getY(i + j) / 3;
        z += positions.getZ(i + j) / 3;
      }
      let index = 0;
      if (y < -0.34) index = 1;
      else if (Math.abs(x) > 0.6 && y > 0.13 && z < -0.25) index = 2;

      for (let j = 0; j < 3; j++) {
        buckets[index].push(
          positions.getX(i + j),
          positions.getY(i + j),
          positions.getZ(i + j)
        );
      }
    }

    const geometry = new THREE.BufferGeometry();
    const all: number[] = [];
    let start = 0;
    buckets.forEach((bucket, index) => {
      all.push(...bucket);
      geometry.addGroup(start, bucket.length / 3, index);
      start += bucket.length / 3;
    });
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(all, 3));
    geometry.computeVertexNormals();
    source.dispose();
    return geometry;
  }

  const pearlGeometry = makePearlGeometry();
  const pearlMaterials = [m.pearl, m.lilacPearl, m.warmPearl];

  function addMesh(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    mat: THREE.Material | THREE.Material[]
  ) {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function ellipsoid(
    parent: THREE.Object3D,
    position: THREE.Vector3,
    scale: THREE.Vector3,
    mat: THREE.Material | THREE.Material[],
    geometry: THREE.BufferGeometry = ball
  ) {
    const mesh = addMesh(parent, geometry, mat);
    mesh.position.copy(position);
    mesh.scale.copy(scale);
    return mesh;
  }

  function span(
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    radiusA: number,
    radiusB: number,
    mat: THREE.Material,
    sides = 8
  ) {
    const direction = b.clone().sub(a);
    const mesh = addMesh(
      parent,
      new THREE.CylinderGeometry(radiusB, radiusA, direction.length(), sides, 1),
      mat
    );
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, direction.normalize());
    return mesh;
  }

  function tube(
    parent: THREE.Object3D,
    points: THREE.Vector3[],
    radius: number,
    mat: THREE.Material,
    steps = 24,
    closed = false,
    sides = 5
  ) {
    const curve = new THREE.CatmullRomCurve3(points, closed, "centripetal");
    return addMesh(
      parent,
      new THREE.TubeGeometry(curve, steps, radius, sides, closed),
      mat
    );
  }

  function outwardGroup(
    parent: THREE.Object3D,
    position: THREE.Vector3,
    normal: THREE.Vector3
  ) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.quaternion.setFromUnitVectors(FRONT, normal.clone().normalize());
    parent.add(group);
    return group;
  }

  // Compact baby barrel, slightly oversized croup and shoulder.
  ellipsoid(root, P(0, 0.988, -0.09), P(0.255, 0.265, 0.60), pearlMaterials, pearlGeometry);
  ellipsoid(root, P(0, 1.002, -0.505), P(0.270, 0.276, 0.284), pearlMaterials, pearlGeometry);
  ellipsoid(root, P(0, 0.973, 0.347), P(0.258, 0.283, 0.291), pearlMaterials, pearlGeometry);
  ellipsoid(root, P(0, 0.817, -0.03), P(0.216, 0.126, 0.422), m.lilacPearl);

  // Upright, softly forward-reaching neck.
  const neckBase = P(0, 1.013, 0.372);
  const neckTop = P(0, 1.448, 0.710);
  span(root, neckBase, neckTop, 0.211, 0.151, m.pearl, 10);
  const neckCap = ellipsoid(
    root, P(0, 1.381, 0.658), P(0.159, 0.213, 0.162),
    pearlMaterials, pearlGeometry
  );
  neckCap.quaternion.setFromUnitVectors(UP, neckTop.clone().sub(neckBase).normalize());
  ellipsoid(root, P(0, 1.005, 0.571), P(0.161, 0.198, 0.068), m.lilacPearl);

  function hoof(x: number, z: number, turn: number) {
    const foot = new THREE.Group();
    foot.position.set(x, 0, z);
    foot.rotation.y = turn;
    root.add(foot);

    const sole = addMesh(
      foot, new THREE.CylinderGeometry(0.097, 0.100, 0.016, 8), m.sole
    );
    sole.position.set(0, 0.008, 0.016);
    sole.scale.set(0.88, 1, 1.17);

    const shell = addMesh(
      foot, new THREE.CylinderGeometry(0.072, 0.097, 0.100, 8), m.silver
    );
    shell.position.set(0, 0.066, 0.016);
    shell.scale.set(0.88, 1, 1.17);

    const rim = addMesh(
      foot, new THREE.TorusGeometry(0.075, 0.0055, 4, 8), m.silverLight
    );
    rim.position.set(0, 0.109, 0.016);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(0.88, 1.17, 1);

    ellipsoid(foot, P(0, 0.128, 0), P(0.065, 0.037, 0.065), m.pearl, small);
    ellipsoid(foot, P(-0.043, 0.139, 0.015), P(0.027, 0.034, 0.032), m.pearl, small);
    ellipsoid(foot, P(0.043, 0.136, 0.010), P(0.027, 0.031, 0.031), m.warmPearl, small);

    // A narrow polished facet on the little metal toe.
    const shine = ellipsoid(
      foot, P(-0.026, 0.065, 0.116), P(0.009, 0.024, 0.0028),
      m.silverLight, diamond
    );
    shine.rotation.z = -0.15;
  }

  // The knees lean in and the feet splay out: tentative, but all four feet
  // are firmly on the floor. Each leg retains readable horse anatomy.
  const forelegs = [
    {
      top: P(0.211, 0.936, 0.352),
      knee: P(0.178, 0.460, 0.468),
      ankle: P(0.282, 0.149, 0.584),
      foot: P(0.303, 0.108, 0.628),
      turn: 0.12
    },
    {
      top: P(-0.211, 0.936, 0.350),
      knee: P(-0.211, 0.477, 0.347),
      ankle: P(-0.316, 0.151, 0.482),
      foot: P(-0.341, 0.108, 0.527),
      turn: -0.13
    }
  ];

  forelegs.forEach((leg) => {
    span(root, leg.top, leg.knee, 0.078, 0.048, m.pearl);
    const shoulder = ellipsoid(
      root, leg.top.clone().add(P(0, -0.070, 0.008)),
      P(0.086, 0.151, 0.091), pearlMaterials, pearlGeometry
    );
    shoulder.quaternion.setFromUnitVectors(
      UP, leg.knee.clone().sub(leg.top).normalize()
    );
    ellipsoid(root, leg.knee, P(0.058, 0.069, 0.057), m.lilacPearl, fluff);
    span(root, leg.knee, leg.ankle, 0.038, 0.029, m.pearl);
    ellipsoid(root, leg.ankle, P(0.047, 0.055, 0.048), m.warmPearl, small);
    span(root, leg.ankle, leg.foot, 0.033, 0.042, m.pearl);
    hoof(leg.foot.x, leg.foot.z, leg.turn);
  });

  const hindlegs = [
    {
      hip: P(0.210, 0.950, -0.494),
      stifle: P(0.239, 0.658, -0.333),
      hock: P(0.269, 0.360, -0.608),
      ankle: P(0.319, 0.146, -0.672),
      foot: P(0.341, 0.108, -0.623),
      turn: 0.13
    },
    {
      hip: P(-0.211, 0.948, -0.517),
      stifle: P(-0.228, 0.647, -0.401),
      hock: P(-0.281, 0.373, -0.744),
      ankle: P(-0.286, 0.146, -0.790),
      foot: P(-0.305, 0.108, -0.742),
      turn: -0.11
    }
  ];

  hindlegs.forEach((leg) => {
    span(root, leg.hip, leg.stifle, 0.092, 0.066, m.pearl);
    const thigh = ellipsoid(
      root, leg.hip.clone().lerp(leg.stifle, 0.40),
      P(0.095, 0.163, 0.103), pearlMaterials, pearlGeometry
    );
    thigh.quaternion.setFromUnitVectors(
      UP, leg.stifle.clone().sub(leg.hip).normalize()
    );
    ellipsoid(root, leg.stifle, P(0.065, 0.073, 0.066), m.pearl, fluff);
    span(root, leg.stifle, leg.hock, 0.049, 0.036, m.pearl);
    ellipsoid(root, leg.hock, P(0.050, 0.059, 0.058), m.lilacPearl, fluff);
    span(root, leg.hock, leg.ankle, 0.033, 0.028, m.pearl);
    ellipsoid(root, leg.ankle, P(0.045, 0.052, 0.045), m.warmPearl, small);
    span(root, leg.ankle, leg.foot, 0.032, 0.042, m.pearl);
    hoof(leg.foot.x, leg.foot.z, leg.turn);
  });

  // A very slight head tilt gives the baby an uncertain, inquisitive look.
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.43, 0.73);
  headPivot.rotation.z = -0.035;
  root.add(headPivot);
  const head = new THREE.Group();
  head.position.set(0, -1.43, -0.73);
  headPivot.add(head);

  ellipsoid(head, P(0, 1.513, 0.818), P(0.239, 0.255, 0.265), pearlMaterials, pearlGeometry);
  ellipsoid(head, P(0, 1.380, 0.980), P(0.201, 0.174, 0.200), pearlMaterials, pearlGeometry);

  const bridge = ellipsoid(
    head, P(0, 1.422, 1.074), P(0.168, 0.245, 0.140),
    pearlMaterials, pearlGeometry
  );
  bridge.quaternion.setFromUnitVectors(UP, P(0, -0.61, 0.79).normalize());

  ellipsoid(head, P(0, 1.233, 1.238), P(0.157, 0.064, 0.141), m.warmPearl);
  ellipsoid(head, P(0, 1.306, 1.258), P(0.195, 0.114, 0.167), m.lilacPearl);
  ellipsoid(head, P(0, 1.338, 1.289), P(0.154, 0.070, 0.134), m.pearl);

  tube(
    head,
    [
      P(-0.151, 1.281, 1.368),
      P(-0.077, 1.259, 1.405),
      P(0, 1.255, 1.413),
      P(0.077, 1.259, 1.405),
      P(0.151, 1.281, 1.368)
    ],
    0.0036, m.nose, 24, false, 4
  );

  for (const side of [-1, 1]) {
    const nostril = outwardGroup(
      head, P(side * 0.118, 1.330, 1.391), P(side * 0.45, 0.15, 0.88)
    );
    nostril.rotateZ(side * -0.24);
    ellipsoid(nostril, P(0, 0, 0), P(0.033, 0.023, 0.007), m.lid, small);
    ellipsoid(nostril, P(0, 0, 0.006), P(0.024, 0.014, 0.005), m.nose, small);

    const cheek = outwardGroup(
      head, P(side * 0.188, 1.416, 1.045), P(side * 0.82, 0.08, 0.57)
    );
    ellipsoid(cheek, P(0, 0, 0), P(0.058, 0.027, 0.007), m.blush, small);
  }

  function eye(side: number) {
    const group = outwardGroup(
      head, P(side * 0.211, 1.543, 0.955), P(side * 0.80, 0.055, 0.60)
    );
    ellipsoid(group, P(0, 0, 0), P(0.106, 0.124, 0.023), m.lid);
    ellipsoid(group, P(0, 0, 0.020), P(0.094, 0.109, 0.035), m.dark);
    ellipsoid(group, P(0, -0.011, 0.052), P(0.065, 0.076, 0.009), m.iris);
    ellipsoid(group, P(0, -0.007, 0.060), P(0.047, 0.065, 0.009), m.dark);
    ellipsoid(group, P(-0.025, 0.040, 0.071), P(0.021, 0.027, 0.006), m.white, small);
    ellipsoid(group, P(0.031, -0.039, 0.068), P(0.008, 0.010, 0.004), m.white, tiny);

    tube(
      group,
      [
        P(-0.092, 0.027, 0.035),
        P(-0.064, 0.084, 0.043),
        P(0, 0.113, 0.038),
        P(0.064, 0.084, 0.043),
        P(0.092, 0.027, 0.035)
      ],
      0.007, m.lid, 22
    );
    tube(
      group,
      [
        P(-0.088, 0.041, 0.043),
        P(-0.056, 0.091, 0.047),
        P(0, 0.109, 0.044),
        P(0.056, 0.091, 0.047),
        P(0.088, 0.041, 0.043)
      ],
      0.004, m.dark, 22, false, 4
    );

    const lashXs = [-0.077, -0.045, -0.008, 0.031, 0.067];
    lashXs.forEach((x, i) => {
      const y = 0.108 * Math.sqrt(1 - (x / 0.096) ** 2);
      const length = [0.058, 0.064, 0.061, 0.057, 0.049][i];
      const fan = x * 0.34;
      const a = P(x, y, 0.046);
      const b = P(x + fan * 0.44, y + length * 0.58, 0.062);
      const c = P(x + fan, y + length, 0.075);
      span(group, a, b, 0.0048, 0.0031, m.dark, 5);
      span(group, b, c, 0.0031, 0.0007, m.dark, 5);
    });

    // A pale brow ridge, not a painted human eyebrow.
    const brow = ellipsoid(
      group, P(0, 0.141, -0.007), P(0.085, 0.018, 0.027),
      m.pearl, fluff
    );
    brow.rotation.z = side * 0.08;
  }
  eye(1);
  eye(-1);

  // Tall, delicately splayed foal ears with inset pink inner leaves.
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(side * 0.153, 1.715, 0.699);
    ear.quaternion.setFromUnitVectors(
      UP, P(side * (side > 0 ? 0.29 : 0.22), 0.96, -0.10).normalize()
    );
    head.add(ear);
    ellipsoid(ear, P(0, 0.119, 0), P(0.069, 0.153, 0.048), pearlMaterials, pearlGeometry);
    ellipsoid(ear, P(0, 0.029, 0), P(0.068, 0.067, 0.046), m.pearl, small);
    ellipsoid(ear, P(0, 0.127, 0.039), P(0.039, 0.110, 0.012), m.blush, small);
    ellipsoid(ear, P(0, 0.084, 0.049), P(0.026, 0.057, 0.006), m.earShadow, small);
  }

  // Small golden cone with a genuinely winding raised spiral.
  const horn = new THREE.Group();
  horn.position.set(0, 1.726, 0.957);
  horn.quaternion.setFromUnitVectors(UP, P(0, 0.945, 0.327).normalize());
  head.add(horn);

  const hornCore = addMesh(
    horn, new THREE.ConeGeometry(0.048, 0.246, 9, 1), m.gold
  );
  hornCore.position.y = 0.123;

  const hornRing = addMesh(
    horn, new THREE.TorusGeometry(0.046, 0.008, 5, 12), m.goldLight
  );
  hornRing.rotation.x = Math.PI / 2;
  hornRing.position.y = 0.006;

  const spiral: THREE.Vector3[] = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const angle = t * Math.PI * 2 * 3.3 + 0.3;
    const r = 0.048 * (1 - t) + 0.002;
    spiral.push(P(Math.cos(angle) * r, 0.009 + t * 0.232, Math.sin(angle) * r));
  }
  tube(horn, spiral, 0.0052, m.goldLight, 100, false, 5);
  ellipsoid(horn, P(0, 0.246, 0), P(0.0047, 0.006, 0.0047), m.goldLight, tiny);

  // Short, clustered baby mane: chunky pastel puffs, not long ribbons.
  const maneRows = [
    P(0, 1.610, 0.557),
    P(0, 1.503, 0.471),
    P(0, 1.396, 0.378),
    P(0, 1.292, 0.283),
    P(0, 1.216, 0.206)
  ];
  const maneColors = [m.lavender, m.pink, m.mint];
  maneRows.forEach((pos, i) => {
    const center = ellipsoid(
      root, pos, P(0.074, 0.090, 0.075),
      maneColors[i % 3], fluff
    );
    center.quaternion.setFromUnitVectors(UP, P(0, 0.76, 0.65).normalize());
    ellipsoid(
      root, pos.clone().add(P(0.055, -0.009, 0.013)),
      P(0.048, 0.063, 0.059), maneColors[(i + 1) % 3], fluff
    );
    ellipsoid(
      root, pos.clone().add(P(-0.047, 0.012, 0.015)),
      P(0.046, 0.057, 0.055), maneColors[(i + 2) % 3], fluff
    );
  });

  ellipsoid(head, P(0, 1.707, 0.646), P(0.081, 0.085, 0.083), m.lavender, fluff);
  ellipsoid(head, P(0.068, 1.757, 0.833), P(0.092, 0.078, 0.081), m.pink, fluff);
  ellipsoid(head, P(-0.068, 1.767, 0.842), P(0.083, 0.082, 0.076), m.mint, fluff);
  ellipsoid(head, P(0.009, 1.768, 0.899), P(0.063, 0.069, 0.066), m.lavender, fluff);

  const forelock = ellipsoid(
    head, P(0.073, 1.714, 0.980), P(0.049, 0.102, 0.048), m.pinkLight, fluff
  );
  forelock.rotation.z = -0.42;
  forelock.rotation.x = -0.20;
  const littleLock = ellipsoid(
    head, P(-0.031, 1.714, 0.976), P(0.039, 0.078, 0.044), m.lavender, fluff
  );
  littleLock.rotation.z = 0.30;

  // Fluffy newborn tail, carried clear of the rump and ending well above
  // the ground. Three distinct pastel locks taper into soft little tips.
  span(root, P(0, 1.087, -0.739), P(0, 1.070, -0.844), 0.055, 0.041, m.pearl);
  ellipsoid(root, P(0, 1.076, -0.824), P(0.071, 0.067, 0.072), m.pinkLight, fluff);

  const tailLocks = [
    {
      color: m.pink,
      points: [P(0.043, 1.065, -0.842), P(0.075, 0.991, -0.954), P(0.085, 0.865, -1.045)],
      widths: [0.057, 0.049]
    },
    {
      color: m.mint,
      points: [P(-0.043, 1.061, -0.842), P(-0.074, 0.974, -0.959), P(-0.030, 0.805, -1.060)],
      widths: [0.055, 0.047]
    },
    {
      color: m.lavender,
      points: [P(0, 1.064, -0.868), P(0.011, 0.958, -0.990), P(0.036, 0.758, -1.101)],
      widths: [0.055, 0.045]
    }
  ];

  tailLocks.forEach((lock) => {
    for (let i = 0; i < 2; i++) {
      const a = lock.points[i], b = lock.points[i + 1];
      const direction = b.clone().sub(a);
      const chunk = ellipsoid(
        root, a.clone().add(b).multiplyScalar(0.5),
        P(lock.widths[i], direction.length() * 0.72, lock.widths[i] * 0.93),
        lock.color, fluff
      );
      chunk.quaternion.setFromUnitVectors(UP, direction.normalize());
    }
    const end = lock.points[2];
    ellipsoid(root, end, P(0.025, 0.044, 0.029), lock.color, small);
  });

  // Restrained pearl glints on the croup catch its lilac faceting.
  for (const side of [-1, 1]) {
    const glints = [
      { y: 1.124, z: -0.514, size: 1 },
      { y: 1.038, z: -0.678, size: 0.65 },
      { y: 1.164, z: -0.403, size: 0.5 }
    ];
    glints.forEach(({ y, z, size }) => {
      const dy = y - 1.002;
      const dz = z + 0.505;
      const x = 0.270 * Math.sqrt(Math.max(0.05, 1 - (dy / 0.276) ** 2 - (dz / 0.284) ** 2));
      const normal = P(side * x / (0.270 ** 2), dy / (0.276 ** 2), dz / (0.284 ** 2)).normalize();
      const g = outwardGroup(root, P(side * x, y, z).addScaledVector(normal, 0.004), normal);
      ellipsoid(g, P(0, 0, 0), P(0.006 * size, 0.020 * size, 0.0018), m.white, diamond);
      ellipsoid(g, P(0, 0, 0), P(0.017 * size, 0.005 * size, 0.0020), m.white, diamond);
    });
  }

  // The necklace follows an inclined neck cross-section, with the front
  // dropping lower into a loose, flower-laden scallop.
  const collarFront = P(0, -0.56, 0.83).normalize();
  function collarPoint(t: number) {
    const c = Math.cos(t);
    const sag = 0.061 * Math.max(0, c) ** 2;
    return P(
      0.231 * Math.sin(t),
      1.255 + collarFront.y * 0.220 * c - sag,
      0.475 + collarFront.z * 0.220 * c + sag * 0.25
    );
  }
  function collarNormal(t: number) {
    return P(Math.sin(t), collarFront.y * Math.cos(t), collarFront.z * Math.cos(t)).normalize();
  }

  const necklacePoints: THREE.Vector3[] = [];
  for (let i = 0; i < 88; i++) {
    necklacePoints.push(collarPoint(i / 88 * Math.PI * 2));
  }
  tube(root, necklacePoints, 0.0055, m.vine, 144, true, 5);

  function leaf(
    parent: THREE.Object3D,
    position: THREE.Vector3,
    angle: number,
    scale = 1
  ) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.z = angle;
    group.scale.setScalar(scale);
    parent.add(group);
    ellipsoid(group, P(0, 0.018, 0), P(0.012, 0.027, 0.0045), m.leaf, small);
    span(group, P(0, -0.006, 0.004), P(0, 0.037, 0.004), 0.0012, 0.0006, m.vine, 4);
  }

  function daisy(
    position: THREE.Vector3,
    normal: THREE.Vector3,
    size: number,
    rotation: number
  ) {
    const flower = outwardGroup(root, position, normal);
    flower.rotateZ(rotation);
    flower.scale.setScalar(size);

    ellipsoid(flower, P(0, 0, -0.005), P(0.022, 0.022, 0.008), m.leaf, small);
    for (let j = 0; j < 9; j++) {
      const angle = j / 9 * Math.PI * 2;
      const petal = ellipsoid(
        flower,
        P(Math.cos(angle) * 0.025, Math.sin(angle) * 0.025, 0.001),
        P(0.0105, 0.022, 0.0058),
        m.petal, small
      );
      petal.rotation.z = angle - Math.PI / 2;
      petal.rotation.x = 0.08;
    }
    ellipsoid(flower, P(0, 0, 0.010), P(0.016, 0.016, 0.010), m.yellow, small);
    for (let j = 0; j < 5; j++) {
      const angle = j / 5 * Math.PI * 2 + 0.3;
      ellipsoid(
        flower,
        P(Math.cos(angle) * 0.0085, Math.sin(angle) * 0.0085, 0.019),
        P(0.0021, 0.0021, 0.0017),
        m.pollen, tiny
      );
    }
  }

  const flowerCount = 15;
  for (let i = 0; i < flowerCount; i++) {
    const t = i / flowerCount * Math.PI * 2;
    const normal = collarNormal(t);
    const position = collarPoint(t).addScaledVector(normal, 0.006);
    daisy(position, normal, i === 0 ? 1.13 : 0.94 + random() * 0.12, i * 0.37 + random() * 0.15);

    const between = t + Math.PI / flowerCount;
    const leafGroup = outwardGroup(
      root,
      collarPoint(between).addScaledVector(collarNormal(between), 0.003),
      collarNormal(between)
    );
    leaf(leafGroup, P(0, 0, 0), i % 2 === 0 ? 0.9 : -0.85, 0.85);
    if (i % 3 === 0) leaf(leafGroup, P(0.009, -0.009, -0.001), -1.15, 0.64);
  }

  // A little tied-off end makes the chain feel freshly handmade.
  const frontPoint = collarPoint(0);
  tube(
    root,
    [
      frontPoint.clone().add(P(0.021, -0.007, 0.005)),
      frontPoint.clone().add(P(0.039, -0.046, 0.018)),
      frontPoint.clone().add(P(0.021, -0.080, 0.019))
    ],
    0.003, m.vine, 14, false, 4
  );
  const tieLeaf = outwardGroup(
    root, frontPoint.clone().add(P(0.029, -0.052, 0.023)), P(0, -0.35, 0.94)
  );
  leaf(tieLeaf, P(0, 0, 0), -0.72, 0.67);

  return root;
}
```