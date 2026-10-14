```ts
import * as THREE from "three";

export const meta = {
  name: "Oh! The Leopard Puffer",
  description:
    "A thoroughly startled, fully inflated pufferfish with leopard-rosette skin, ivory spines, anxious eyes, delicate golden fins, and a rising trail of bubbles.",
};

export default function (): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Startled pufferfish";

  let seed = 197803;
  function random(): number {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const cy = 0.34;
  const rx = 0.3;
  const ry = 0.3;
  const rz = 0.29;
  const UP = new THREE.Vector3(0, 1, 0);

  function material(
    color: number,
    extra: THREE.MeshStandardMaterialParameters = {}
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.78,
      metalness: 0,
      ...extra,
    });
  }

  const butter = material(0xf8dea0, { flatShading: true });
  const spineGold = material(0xffe7a0, { flatShading: true });
  const spineCream = material(0xfff4d1, { flatShading: true });
  const ivory = material(0xfff9e7);
  const socketGold = material(0xd9b767);
  const browGold = material(0x96703a);
  const irisOutline = material(0x583e2b);
  const irisAmber = material(0xb7853d, { roughness: 0.48 });
  const pupil = material(0x171f23, { roughness: 0.24 });
  const highlight = material(0xffffff, { roughness: 0.2 });
  const lip = material(0xdca26c);
  const lowerLip = material(0xf2cea0);
  const mouthDark = material(0x53372b);
  const gillMaterial = material(0x9b773e);
  const finGold = material(0xe9ba57, {
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    flatShading: true,
    roughness: 0.55,
  });
  const finLight = material(0xf6d98b, {
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
    flatShading: true,
    roughness: 0.55,
  });
  const finEdge = material(0xffe7a6, { flatShading: true });
  const finRay = material(0xb88438, { flatShading: true });
  const bubbleMaterial = material(0xc9edf3, {
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    roughness: 0.16,
    metalness: 0.08,
  });
  const bubbleRim = material(0x9dcdd7, {
    transparent: true,
    opacity: 0.61,
    depthWrite: false,
    roughness: 0.3,
  });

  const sphereGeometry = new THREE.SphereGeometry(1, 20, 14);
  const littleSphereGeometry = new THREE.SphereGeometry(1, 12, 8);

  function ellipsoid(
    parent: THREE.Object3D,
    mat: THREE.Material,
    position: THREE.Vector3,
    scale: THREE.Vector3,
    small = false
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      small ? littleSphereGeometry : sphereGeometry,
      mat
    );
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
    sides = 6
  ): THREE.Mesh {
    const d = b.clone().sub(a);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusB, radiusA, d.length(), sides),
      mat
    );
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(mesh);
    return mesh;
  }

  function curvedLine(
    parent: THREE.Object3D,
    points: THREE.Vector3[],
    radius: number,
    mat: THREE.Material,
    segments = 12
  ): THREE.Mesh {
    const path = new THREE.CatmullRomCurve3(points);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(path, segments, radius, 5, false),
      mat
    );
    parent.add(mesh);
    return mesh;
  }

  // A painted spherical skin: irregular broken rosettes, small freckles,
  // and a broad, unspotted ivory belly. The geometry remains deliberately simple.
  type Spot = {
    n: THREE.Vector3;
    u: THREE.Vector3;
    v: THREE.Vector3;
    radius: number;
    threshold: number;
    phase: number;
    solid: boolean;
    shade: number;
  };

  const spots: Spot[] = [];

  function faceClear(n: THREE.Vector3): boolean {
    return (
      n.z > 0.68 &&
      Math.abs(n.x) < 0.71 &&
      n.y > -0.3 &&
      n.y < 0.57
    );
  }

  function addSpot(n: THREE.Vector3, radius: number, solid: boolean): void {
    const axis =
      Math.abs(n.y) > 0.92
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(axis, n).normalize();
    const v = new THREE.Vector3().crossVectors(n, u).normalize();
    spots.push({
      n,
      u,
      v,
      radius,
      threshold: Math.cos(radius * 1.3),
      phase: random() * Math.PI * 2,
      solid,
      shade: random(),
    });
  }

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 132; i++) {
    const y = 1 - (2 * (i + 0.5)) / 132;
    const a = i * goldenAngle + 0.71;
    const r = Math.sqrt(1 - y * y);
    const n = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    if (y < -0.28 || faceClear(n)) continue;
    const solid = random() < 0.24;
    addSpot(n, (0.078 + random() * 0.043) * (solid ? 0.77 : 1), solid);
  }

  for (let i = 0; i < 38; i++) {
    const y = -0.12 + random() * 1.09;
    const a = random() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    const n = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    if (!faceClear(n)) addSpot(n, 0.017 + random() * 0.017, true);
  }

  const width = 1024;
  const height = 512;
  const pixels = new Uint8Array(width * height * 4);
  const longitudeCos = new Float32Array(width);
  const longitudeSin = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    const a = ((x + 0.5) / width) * Math.PI * 2;
    longitudeCos[x] = Math.cos(a);
    longitudeSin[x] = Math.sin(a);
  }

  const cream = [255, 249, 229];
  const middle = [249, 230, 173];
  const gold = [232, 196, 105];

  function mix(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  for (let row = 0; row < height; row++) {
    const v = (row + 0.5) / height;
    const ny = -Math.cos(Math.PI * v);
    const ringRadius = Math.sin(Math.PI * v);
    let base: number[];

    if (ny < -0.1) {
      const t = THREE.MathUtils.smoothstep(ny, -0.65, -0.1);
      base = cream.map((c, k) => mix(c, middle[k], t));
    } else {
      const t = THREE.MathUtils.smoothstep(ny, -0.1, 0.88);
      base = middle.map((c, k) => mix(c, gold[k], t));
    }

    for (let col = 0; col < width; col++) {
      const nx = -longitudeCos[col] * ringRadius;
      const nz = longitudeSin[col] * ringRadius;
      let red = base[0];
      let green = base[1];
      let blue = base[2];

      for (const s of spots) {
        const dot = nx * s.n.x + ny * s.n.y + nz * s.n.z;
        if (dot < s.threshold) continue;

        const tx = nx * s.u.x + ny * s.u.y + nz * s.u.z;
        const ty = nx * s.v.x + ny * s.v.y + nz * s.v.z;
        const angle = Math.atan2(ty, tx);
        const wobble =
          1 +
          0.12 * Math.sin(3 * angle + s.phase) +
          0.075 * Math.cos(5 * angle - s.phase) +
          0.035 * Math.sin(7 * angle);
        const distance = Math.sqrt(tx * tx + ty * ty) / (s.radius * wobble);
        if (distance > 1) continue;

        const fade = THREE.MathUtils.smoothstep(ny, -0.31, 0.13);
        const innerEdge = 0.53 + 0.09 * Math.cos(3 * angle + s.phase);
        const broken = Math.cos(2 * angle + s.phase) > 0.93;
        const dark =
          s.solid || (distance > innerEdge && !(broken && distance < 0.91));

        const edge = Math.min(1, (1 - distance) * 30);
        const strength = fade * edge * (dark ? 0.98 : 0.7);
        const paint = dark
          ? [96 + s.shade * 19, 62 + s.shade * 14, 32 + s.shade * 7]
          : [211, 170, 83];
        red = mix(red, paint[0], strength);
        green = mix(green, paint[1], strength);
        blue = mix(blue, paint[2], strength);
      }

      const p = (row * width + col) * 4;
      pixels[p] = red;
      pixels[p + 1] = green;
      pixels[p + 2] = blue;
      pixels[p + 3] = 255;
    }
  }

  const skinTexture = new THREE.DataTexture(
    pixels,
    width,
    height,
    THREE.RGBAFormat
  );
  skinTexture.colorSpace = THREE.SRGBColorSpace;
  skinTexture.wrapS = THREE.RepeatWrapping;
  skinTexture.wrapT = THREE.ClampToEdgeWrapping;
  skinTexture.magFilter = THREE.LinearFilter;
  skinTexture.minFilter = THREE.LinearMipmapLinearFilter;
  skinTexture.generateMipmaps = true;
  skinTexture.needsUpdate = true;

  const skin = new THREE.MeshStandardMaterial({
    map: skinTexture,
    roughness: 0.85,
    metalness: 0,
    flatShading: true,
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), skin);
  body.name = "Puffed, leopard-painted body";
  body.position.y = cy;
  body.scale.set(rx, ry, rz);
  root.add(body);

  // Short, stout, five-sided spines follow the ellipsoid's surface normal.
  for (let i = 0; i < 244; i++) {
    const y = 1 - (2 * (i + 0.5)) / 244;
    const a = i * goldenAngle + 1.82;
    const r = Math.sqrt(1 - y * y);
    const n = new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a));

    const eyeZone =
      n.z > 0.67 &&
      n.y > -0.02 &&
      n.y < 0.64 &&
      Math.abs(n.x) < 0.76;
    const mouthZone =
      n.z > 0.85 && Math.abs(n.x) < 0.26 && n.y > -0.43 && n.y < 0.14;
    const finZone =
      Math.abs(n.x) > 0.93 && Math.abs(n.y) < 0.18;
    const tailZone = n.z < -0.94 && Math.abs(n.y) < 0.22;
    if (eyeZone || mouthZone || finZone || tailZone) continue;

    const p = new THREE.Vector3(rx * n.x, cy + ry * n.y, rz * n.z);
    const normal = new THREE.Vector3(n.x / rx, n.y / ry, n.z / rz).normalize();
    const length = 0.023 + random() * 0.014;
    const radius = 0.0067 + random() * 0.003;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(radius, length, 5),
      n.y < -0.2 ? spineCream : random() < 0.24 ? butter : spineGold
    );
    cone.position.copy(p).addScaledVector(normal, length * 0.45);
    cone.quaternion.setFromUnitVectors(UP, normal);
    root.add(cone);
  }

  const bottomSpine = new THREE.Mesh(
    new THREE.ConeGeometry(0.008, 0.04, 5),
    spineCream
  );
  bottomSpine.rotation.z = Math.PI;
  bottomSpine.position.set(0, 0.02, 0);
  root.add(bottomSpine);

  // Each eye is an oversized, inset little assemblage of primitive ellipsoids.
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.name = side === 1 ? "Left worried eye" : "Right worried eye";
    eye.position.set(side * 0.127, cy + 0.092, 0.251);
    eye.rotation.y = side * 0.105;
    eye.rotation.x = -0.035;
    root.add(eye);

    ellipsoid(
      eye,
      socketGold,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.087, 0.091, 0.066)
    );
    ellipsoid(
      eye,
      ivory,
      new THREE.Vector3(0, 0.002, 0.019),
      new THREE.Vector3(0.077, 0.081, 0.062)
    );

    const gazeX = -side * 0.01;
    ellipsoid(
      eye,
      irisOutline,
      new THREE.Vector3(gazeX, 0.004, 0.077),
      new THREE.Vector3(0.042, 0.046, 0.011)
    );
    ellipsoid(
      eye,
      irisAmber,
      new THREE.Vector3(gazeX, 0.004, 0.084),
      new THREE.Vector3(0.035, 0.039, 0.008)
    );
    ellipsoid(
      eye,
      pupil,
      new THREE.Vector3(gazeX - side * 0.002, 0.006, 0.09),
      new THREE.Vector3(0.027, 0.032, 0.009)
    );
    ellipsoid(
      eye,
      highlight,
      new THREE.Vector3(gazeX - 0.011, 0.021, 0.099),
      new THREE.Vector3(0.01, 0.012, 0.0038),
      true
    );
    ellipsoid(
      eye,
      highlight,
      new THREE.Vector3(gazeX + 0.012, -0.009, 0.099),
      new THREE.Vector3(0.0042, 0.0048, 0.0025),
      true
    );

    const browPoints = [
      new THREE.Vector3(side * 0.055, cy + 0.173, 0.287),
      new THREE.Vector3(side * 0.087, cy + 0.191, 0.276),
      new THREE.Vector3(side * 0.141, cy + 0.182, 0.266),
      new THREE.Vector3(side * 0.193, cy + 0.144, 0.249),
    ];
    curvedLine(root, browPoints, 0.0105, butter);
    curvedLine(
      root,
      browPoints.map((p) => p.clone().add(new THREE.Vector3(0, 0.002, 0.008))),
      0.0045,
      browGold
    );
  }

  // Tiny pursed "oh!" mouth, rather than a smile.
  ellipsoid(
    root,
    spineCream,
    new THREE.Vector3(0, cy - 0.066, 0.288),
    new THREE.Vector3(0.04, 0.032, 0.022)
  );
  ellipsoid(
    root,
    mouthDark,
    new THREE.Vector3(0, cy - 0.065, 0.313),
    new THREE.Vector3(0.015, 0.014, 0.005)
  );
  const lipRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.0188, 0.0061, 7, 20),
    lip
  );
  lipRing.position.set(0, cy - 0.065, 0.315);
  lipRing.scale.y = 0.9;
  root.add(lipRing);
  ellipsoid(
    root,
    lowerLip,
    new THREE.Vector3(0, cy - 0.084, 0.316),
    new THREE.Vector3(0.017, 0.0067, 0.008),
    true
  );

  for (const side of [-1, 1]) {
    ellipsoid(
      root,
      gillMaterial,
      new THREE.Vector3(side * 0.025, cy - 0.019, 0.291),
      new THREE.Vector3(0.0032, 0.0025, 0.0018),
      true
    );

    for (let j = 0; j < 3; j++) {
      const z = 0.115 + j * 0.011;
      const x = side * (0.275 - j * 0.005);
      curvedLine(
        root,
        [
          new THREE.Vector3(x - side * 0.005, cy + 0.028, z),
          new THREE.Vector3(x, cy + 0.003, z + 0.002),
          new THREE.Vector3(x - side * 0.005, cy - 0.025, z),
        ],
        0.0021,
        gillMaterial,
        7
      );
    }
  }

  // Low-poly fan membranes with a pale outer band and individually modeled rays.
  function makeFan(
    name: string,
    origin: THREE.Vector3,
    sample: (angle: number, fraction: number) => THREE.Vector3,
    halfAngle: number,
    rayCount: number,
    ribThickness: number
  ): void {
    const fan = new THREE.Group();
    fan.name = name;
    root.add(fan);

    function patch(points: THREE.Vector3[], mat: THREE.Material): void {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          points.flatMap((p) => [p.x, p.y, p.z]),
          3
        )
      );
      geometry.computeVertexNormals();
      fan.add(new THREE.Mesh(geometry, mat));
    }

    const angles: number[] = [];
    for (let i = 0; i < rayCount; i++) {
      angles.push(-halfAngle + (2 * halfAngle * i) / (rayCount - 1));
    }

    for (let i = 0; i < rayCount - 1; i++) {
      const a = angles[i];
      const b = angles[i + 1];
      const midA = sample(a, 0.72);
      const midB = sample(b, 0.72);
      const tipA = sample(a, 1);
      const tipB = sample(b, 1);
      const scallop = sample((a + b) * 0.5, 0.955);

      patch(
        [origin, midA, midB],
        i % 2 === 0 ? finGold : finLight
      );
      patch(
        [
          midA, tipA, scallop,
          midA, scallop, midB,
          midB, scallop, tipB,
        ],
        finLight
      );
      rod(fan, tipA, scallop, ribThickness * 0.62, ribThickness * 0.52, finEdge);
      rod(fan, scallop, tipB, ribThickness * 0.52, ribThickness * 0.62, finEdge);
    }

    for (const a of angles) {
      const mid = sample(a, 0.56);
      const tip = sample(a, 1);
      rod(fan, origin, mid, ribThickness, ribThickness * 0.72, finRay);
      rod(fan, mid, tip, ribThickness * 0.72, ribThickness * 0.32, finRay);
    }
  }

  for (const side of [-1, 1]) {
    const origin = new THREE.Vector3(side * 0.272, cy - 0.008, 0.028);
    const tilt = side === 1 ? 0.1 : -0.09;
    makeFan(
      side === 1 ? "Left fluttering fin" : "Right fluttering fin",
      origin,
      (angle, fraction) => {
        const length = 0.133 * fraction;
        const a = angle + tilt;
        return origin.clone().add(
          new THREE.Vector3(
            side * Math.cos(a) * length,
            Math.sin(a) * length,
            -length * 0.34 + Math.sin(a) * length * 0.16
          )
        );
      },
      0.72,
      8,
      0.0025
    );
  }

  ellipsoid(
    root,
    butter,
    new THREE.Vector3(0, cy, -0.302),
    new THREE.Vector3(0.048, 0.05, 0.081)
  );

  const tailOrigin = new THREE.Vector3(0, cy, -0.349);
  makeFan(
    "Stubby golden caudal fan",
    tailOrigin,
    (angle, fraction) => {
      const length = 0.17 * fraction;
      return tailOrigin.clone().add(
        new THREE.Vector3(
          length * 0.12 + Math.sin(angle) * length * 0.06,
          Math.sin(angle) * length,
          -Math.cos(angle) * length
        )
      );
    },
    0.87,
    9,
    0.0028
  );

  // Transparent faceted bubbles retain readable rims even in neutral lighting.
  const bubbles = [
    { x: 0.025, y: cy - 0.005, z: 0.38, r: 0.0105 },
    { x: 0.014, y: cy + 0.139, z: 0.423, r: 0.0145 },
    { x: -0.027, y: cy + 0.343, z: 0.411, r: 0.025 },
    { x: 0.021, y: cy + 0.48, z: 0.398, r: 0.0175 },
    { x: -0.024, y: cy + 0.605, z: 0.38, r: 0.0315 },
  ];

  for (const b of bubbles) {
    const group = new THREE.Group();
    group.name = "Escaping bubble";
    group.position.set(b.x, b.y, b.z);
    root.add(group);

    ellipsoid(
      group,
      bubbleMaterial,
      new THREE.Vector3(),
      new THREE.Vector3(b.r, b.r, b.r),
      true
    );

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(b.r * 0.965, b.r * 0.031, 4, 24),
      bubbleRim
    );
    group.add(rim);

    const gleam = new THREE.Mesh(
      new THREE.TorusGeometry(
        b.r * 0.78,
        b.r * 0.043,
        4,
        12,
        Math.PI * 0.57
      ),
      highlight
    );
    gleam.rotation.z = Math.PI * 0.36;
    gleam.position.z = b.r * 0.57;
    group.add(gleam);

    ellipsoid(
      group,
      highlight,
      new THREE.Vector3(-b.r * 0.34, b.r * 0.5, b.r * 0.77),
      new THREE.Vector3(b.r * 0.09, b.r * 0.13, b.r * 0.045),
      true
    );
  }

  return root;
}
```