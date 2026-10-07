```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Red Panda",
  description:
    "A small, russet-coated red panda with a snowy face, velvet-dark paws, tufted ears, and a long copper-and-honey ringed tail. Built in a relaxed, four-footed rigging pose."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Red Panda" });

  const C = {
    rust: "#B74628",
    orange: "#CC5830",
    lightRust: "#D96C37",
    darkRust: "#91351F",
    neck: "#813323",
    chocolate: "#442822",
    leg: "#302322",
    paw: "#271F1E",
    cream: "#F2E5CF",
    brightCream: "#FFF0D8",
    earCream: "#E4CFB0",
    earInner: "#734536",
    mask: "#803D2C",
    eyeRim: "#432820",
    iris: "#87552F",
    black: "#17191A",
    noseHighlight: "#53504A",
    claw: "#B9A78C",
    tailRed: "#AD4025",
    tailGold: "#DEA05B",
    tailGoldLight: "#E7AE68"
  };

  type P = [number, number, number];
  const add = (p: P, q: P): P => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];

  // Skeleton -----------------------------------------------------------------
  const hipAt: P = [0, 0.258, -0.151];
  const spineAt: P = [0, 0.269, 0.106];
  const neckAt: P = [0, 0.315, 0.209];
  const headAt: P = [0, 0.358, 0.299];

  const hips = b.joint("hips", { at: hipAt });
  const spine = b.joint("spine", { at: spineAt, parent: hips });
  const neck = b.joint("neck", { at: neckAt, parent: spine });
  const head = b.joint("head", { at: headAt, parent: neck });
  const jaw = b.joint("jaw", {
    at: [0, 0.304, 0.35],
    parent: head
  });

  const ears = [-1, 1].map((s) => {
    const at: P = [s * 0.084, 0.418, 0.284];
    return {
      s,
      at,
      joint: b.joint(s === 1 ? "earL" : "earR", { at, parent: head })
    };
  });

  const legs = [-1, 1].flatMap((s) => {
    const suffix = s === 1 ? "L" : "R";
    return [false, true].map((front) => {
      const upperAt: P = front
        ? [s * 0.108, 0.258, 0.133]
        : [s * 0.108, 0.248, -0.17];
      const middleAt: P = front
        ? [s * 0.124, 0.148, 0.148]
        : [s * 0.129, 0.146, -0.13];
      const ankleAt: P = front
        ? [s * 0.129, 0.061, 0.185]
        : [s * 0.132, 0.063, -0.191];
      const footAt: P = front
        ? [s * 0.13, 0.029, 0.204]
        : [s * 0.132, 0.029, -0.17];

      const upper = b.joint((front ? "shoulder" : "hip") + suffix, {
        at: upperAt,
        parent: front ? spine : hips
      });
      const middle = b.joint((front ? "elbow" : "knee") + suffix, {
        at: middleAt,
        parent: upper
      });
      const ankle = b.joint((front ? "wrist" : "hock") + suffix, {
        at: ankleAt,
        parent: middle
      });
      const foot = b.joint((front ? "pawFront" : "pawBack") + suffix, {
        at: footAt,
        parent: ankle
      });

      const toes = Array.from({ length: 5 }, (_, i) => {
        const k = i - 2;
        const at: P = [
          footAt[0] + k * 0.015,
          0.014,
          footAt[2] + 0.037 - Math.abs(k) * 0.004
        ];
        return {
          at,
          joint: b.joint(
            `toe${front ? "Front" : "Back"}${suffix}${i + 1}`,
            { at, parent: foot }
          )
        };
      });

      return {
        front, s, upperAt, middleAt, ankleAt, footAt,
        upper, middle, ankle, foot, toes
      };
    });
  });

  const tail = b.chain(
    "tail",
    [
      [0, 0.273, -0.265],
      [0.005, 0.247, -0.336],
      [0.02, 0.214, -0.416],
      [0.05, 0.199, -0.497],
      [0.097, 0.204, -0.574],
      [0.157, 0.224, -0.644],
      [0.23, 0.252, -0.69],
      [0.312, 0.277, -0.709],
      [0.391, 0.292, -0.7]
    ],
    { parent: hips, role: "tail" }
  );

  // Primitive helpers ---------------------------------------------------------
  function ellipsoid(
    at: any,
    radii: P,
    color: string,
    bone?: any,
    segments = 12
  ) {
    return b.part(
      new THREE.SphereGeometry(1, segments, 8),
      color,
      { at, scale: radii, ...(bone ? { bone } : {}) }
    );
  }

  function seatedOval(on: any, radii: P, color: string) {
    const g = new THREE.SphereGeometry(1, 12, 8);
    g.scale(radii[0], radii[1], radii[2]);
    return b.stick(g, color, on);
  }

  function frontHit(part: any, x: number, y: number) {
    const surface = b.surface(part);
    return surface.ray([x, y, 0.9], [0, 0, -1]) ??
      surface.nearest([x, y, 0.9]);
  }

  function taperedRod(
    a: P,
    z: P,
    r0: number,
    r1: number,
    color: string,
    bone: any,
    sides = 7
  ) {
    const va = new THREE.Vector3(...a);
    const vz = new THREE.Vector3(...z);
    const direction = vz.clone().sub(va);
    return b.part(
      new THREE.CylinderGeometry(r1, r0, direction.length(), sides, 1),
      color,
      {
        at: va.clone().add(vz).multiplyScalar(0.5),
        dir: direction,
        bone
      }
    );
  }

  function flatShape(
    outline: number[][],
    depth: number,
    color: string,
    at: any,
    bone: any,
    rotation = 0,
    zOffset = 0
  ) {
    const shape = new THREE.Shape();
    outline.forEach(([x, y], i) => {
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      steps: 1,
      curveSegments: 1
    });
    g.rotateZ(rotation);
    g.translate(0, 0, zOffset);
    return b.part(g, color, { at, bone });
  }

  // Body: a deliberately simple, generously proportioned fur silhouette. -------
  ellipsoid([0, 0.218, -0.023], [0.122, 0.096, 0.226], C.chocolate, spine);
  const body = ellipsoid(
    [0, 0.269, -0.025],
    [0.143, 0.126, 0.256],
    C.rust,
    spine,
    14
  );

  b.sweep([spine, neck, head], 0.069, { color: C.neck });
  ellipsoid([0, 0.29, 0.183], [0.099, 0.094, 0.102], C.orange, neck);
  ellipsoid([0, 0.265, 0.228], [0.071, 0.067, 0.047], C.chocolate, neck);

  for (const leg of legs) {
    b.sweep(
      [leg.upper, leg.middle, leg.ankle, leg.foot],
      leg.front ? 0.029 : 0.032,
      { color: C.leg }
    );

    if (leg.front) {
      b.sweep([leg.upper, leg.middle], 0.039, { color: C.chocolate });
    } else {
      ellipsoid(
        add(leg.upperAt, [leg.s * 0.012, -0.01, 0.004]),
        [0.064, 0.084, 0.077],
        C.orange,
        leg.upper
      );
      b.sweep([leg.middle, leg.ankle], 0.034, { color: C.leg });
    }

    ellipsoid(leg.footAt, [0.04, 0.029, 0.05], C.paw, leg.foot, 10);

    for (const toe of leg.toes) {
      ellipsoid(toe.at, [0.007, 0.014, 0.022], C.paw, toe.joint, 8);
      taperedRod(
        add(toe.at, [0, 0.001, 0.017]),
        add(toe.at, [0, -0.009, 0.031]),
        0.0035, 0.0005, C.claw, toe.joint, 5
      );
    }
  }

  // Short angular tufts break the flank silhouette without obscuring the base.
  const bodySurface = b.surface(body);
  for (const s of [-1, 1]) {
    for (const [y, z, color] of [
      [0.288, -0.2, C.orange],
      [0.255, -0.145, C.lightRust],
      [0.31, 0.093, C.orange]
    ] as [number, number, string][]) {
      const hit = bodySurface.nearest([s * 0.24, y, z]);
      const g = new THREE.ConeGeometry(0.02, 0.027, 3);
      g.scale(1, 1, 0.55);
      b.stick(g, color, hit);
    }
  }

  // Bushy tail. Small swept sections retain the chain's bone weights and
  // produce gently stepped, fur-like edges rather than perfectly machined rings.
  const bands = 13;
  const radiusAt = (t: number) =>
    0.047 + 0.022 * Math.sin(Math.PI * t) - 0.025 * t * t;

  for (let band = 0; band < bands; band++) {
    const color = band % 2 === 0
      ? C.tailRed
      : (band % 4 === 1 ? C.tailGold : C.tailGoldLight);

    for (let slice = 0; slice < 3; slice++) {
      const a = (band + slice / 3) / bands;
      const z = (band + (slice + 1) / 3) / bands;
      const start = Math.max(0, a - 0.0008);
      const end = Math.min(1, z + 0.0008);
      b.sweep(
        [tail.at(start), tail.at((a + z) * 0.5), tail.at(end)],
        radiusAt((a + z) * 0.5),
        { color }
      );
    }
  }
  b.part(new THREE.SphereGeometry(1, 10, 6), C.tailRed, {
    at: tail.at(1),
    dir: tail.at(1),
    scale: [0.022, 0.031, 0.022]
  });

  // Broad head and the characteristic white cheeks / russet tear mask. --------
  const cranium = ellipsoid(headAt, [0.114, 0.094, 0.103], C.orange, head, 14);

  for (const s of [-1, 1]) {
    const cheek = seatedOval(
      frontHit(cranium, s * 0.071, 0.343),
      [0.055, 0.015, 0.052],
      C.cream
    );

    // Small triangular fur tips on the outer cheek edge.
    const cheekSurface = b.surface(cheek);
    for (const y of [0.343, 0.323]) {
      const tuft = new THREE.ConeGeometry(0.016, 0.026, 3);
      tuft.scale(1, 1, 0.66);
      b.stick(
        tuft,
        C.cream,
        cheekSurface.nearest([s * 0.19, y, 0.365])
      );
    }

    const mask = seatedOval(
      frontHit(cheek, s * 0.061, 0.359),
      [0.029, 0.0065, 0.037],
      C.mask
    );

    const socket = seatedOval(
      frontHit(mask, s * 0.06, 0.374),
      [0.0185, 0.004, 0.0195],
      C.eyeRim
    );
    const eye = seatedOval(
      frontHit(socket, s * 0.06, 0.375),
      [0.0143, 0.006, 0.016],
      C.black
    );
    const iris = seatedOval(
      frontHit(eye, s * 0.06, 0.375),
      [0.0096, 0.0011, 0.0108],
      C.iris
    );
    const pupil = seatedOval(
      frontHit(iris, s * 0.06, 0.375),
      [0.0075, 0.0012, 0.009],
      C.black
    );
    seatedOval(
      frontHit(pupil, s * 0.06 - 0.0032, 0.3794),
      [0.0025, 0.0011, 0.003],
      C.brightCream
    );

    // White, slightly oversized eyebrows are essential to the red-panda face.
    seatedOval(
      frontHit(cranium, s * 0.061, 0.407),
      [0.03, 0.006, 0.011],
      C.brightCream
    );
  }

  // The muzzle belongs to the upper head; the chin and mouth floor to the jaw.
  ellipsoid([0, 0.305, 0.405], [0.048, 0.0045, 0.032], C.eyeRim, jaw);
  ellipsoid([0, 0.293, 0.402], [0.047, 0.014, 0.034], C.cream, jaw);

  const muzzlePads = [-1, 1].map((s) => ({
    s,
    part: ellipsoid(
      [s * 0.024, 0.322, 0.409],
      [0.035, 0.023, 0.034],
      C.brightCream,
      head
    )
  }));

  flatShape(
    [
      [-0.018, 0.006],
      [0.018, 0.006],
      [0.015, -0.002],
      [0, -0.013],
      [-0.015, -0.002]
    ],
    0.011,
    C.black,
    [0, 0.343, 0.437],
    head
  );

  ellipsoid(
    [-0.004, 0.346, 0.4485],
    [0.007, 0.0018, 0.0014],
    C.noseHighlight,
    head,
    8
  );
  taperedRod(
    [0, 0.331, 0.441],
    [0, 0.31, 0.439],
    0.0017, 0.0012, C.eyeRim, head, 5
  );

  // Freckles and three separated whiskers on either side.
  for (const { s, part } of muzzlePads) {
    for (const [dx, dy] of [
      [0.006, 0.003],
      [0.014, -0.001],
      [0.005, -0.005]
    ]) {
      seatedOval(
        frontHit(part, s * (0.024 + dx), 0.322 + dy),
        [0.0015, 0.0006, 0.0015],
        C.mask
      );
    }

    for (let i = 0; i < 3; i++) {
      const start: P = [s * 0.046, 0.322 - i * 0.005, 0.434 - i * 0.002];
      const end: P = [
        s * (0.126 + (i === 1 ? 0.009 : 0)),
        0.335 - i * 0.017,
        0.417 - i * 0.01
      ];
      taperedRod(start, end, 0.00075, 0.00025, C.cream, head, 5);
    }
  }

  // Upright, outward-flared ears: rusty shell, thick ivory edge, dark interior.
  const earOutline = [
    [-0.035, -0.02],
    [-0.042, 0.014],
    [-0.033, 0.055],
    [-0.014, 0.076],
    [0.01, 0.071],
    [0.038, 0.03],
    [0.039, -0.012],
    [0.016, -0.027]
  ];

  for (const ear of ears) {
    const rotation = -ear.s * 0.19;
    flatShape(earOutline, 0.026, C.darkRust, ear.at, ear.joint, rotation, -0.011);
    flatShape(
      earOutline.map(([x, y]) => [x * 0.94, y * 0.95]),
      0.007, C.cream, ear.at, ear.joint, rotation, 0.016
    );
    flatShape(
      earOutline.map(([x, y]) => [x * 0.64, y * 0.7 + 0.007]),
      0.004, C.earInner, ear.at, ear.joint, rotation, 0.024
    );
    flatShape(
      [
        [-0.023, -0.01],
        [-0.021, 0.011],
        [-0.013, 0.005],
        [-0.006, 0.024],
        [0.002, 0.009],
        [0.014, 0.019],
        [0.022, -0.009],
        [0.009, -0.018]
      ],
      0.004, C.earCream, ear.at, ear.joint, rotation, 0.029
    );
  }

  // Rig labels and a consistent matte, faceted finish.
  b.root.traverse((obj) => {
    if ((obj as THREE.Bone).isBone) {
      const n = obj.name;
      let role = "hinge";
      if (/^tail/i.test(n)) role = "tail";
      else if (/^toe/i.test(n)) role = "digit";
      else if (/^(hip|knee|hock|paw|shoulder|elbow|wrist)/i.test(n) && n !== "hips") role = "leg";
      else if (n === "hips" || n === "spine") role = "spine";
      else if (n === "neck") role = "neck";
      else if (n === "head") role = "head";
      else if (n === "jaw") role = "jaw";
      obj.userData.role = role;
    }

    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.flatShading = true;
          material.metalness = 0;
          material.roughness =
            material.color.getHexString() === C.black.slice(1).toLowerCase()
              ? 0.3
              : 0.86;
        }
      }
    }
  });

  return b.root;
}
```