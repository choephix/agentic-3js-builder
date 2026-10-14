import * as THREE from "three";
import { createBuilder, frame, offset, rng } from "../../../../src/index";

export const meta = {
  name: "Veiled Chameleon",
  description:
    "A lime-green veiled chameleon with mosaic turquoise markings, independently rigged turret eyes, a tall faceted casque, opposable five-toed feet, and a curled prehensile tail."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Veiled Chameleon" });
  const random = rng(73129) as unknown as () => number;

  const C = {
    body: "#72AE43",
    forest: "#36794A",
    darkGreen: "#265F43",
    head: "#87B94A",
    headShade: "#69A047",
    headLight: "#9AC653",
    turquoise: "#52B8A1",
    deepTeal: "#278E80",
    lime: "#B7CF65",
    belly: "#CCD98B",
    gold: "#DECA71",
    ochre: "#BFA354",
    toe: "#80AD4D",
    claw: "#DEDDB3",
    mouth: "#173E30",
    pupil: "#102925",
    shine: "#F6F4D3"
  };

  type P = number[];
  const v = (p: P) => new THREE.Vector3(p[0], p[1], p[2]);

  function joint(
    name: string,
    at: P,
    parent: any,
    role: string,
    aim?: P,
    chainName = role
  ): any {
    const options: any = { at };
    if (parent) options.parent = parent;
    if (aim) options.aim = aim;
    options.role = role;

    const handle: any = b.joint(name, options);
    const bone: any = handle.bone ?? handle;
    if (bone.userData) {
      bone.userData.role = role;
      bone.userData.chain = chainName;
    }
    return handle;
  }

  function flat(g: THREE.BufferGeometry): THREE.BufferGeometry {
    const result = g.index ? g.toNonIndexed() : g.clone();
    result.computeVertexNormals();
    return result;
  }

  function sphere(radius: number, width = 12, height = 8) {
    return flat(new THREE.SphereGeometry(radius, width, height));
  }

  function cylinder(r0: number, r1: number, height: number, sides = 8) {
    return flat(new THREE.CylinderGeometry(r1, r0, height, sides, 1));
  }

  function scaleDisc(radius: number, thickness = 0.00065) {
    return cylinder(radius, radius, thickness, 6);
  }

  function segment(
    a: P,
    c: P,
    r0: number,
    r1: number,
    color: string,
    bone: any,
    sides = 8
  ) {
    const start = v(a);
    const end = v(c);
    const direction = end.clone().sub(start);
    return b.part(cylinder(r0, r1, direction.length(), sides), color, {
      frame: frame(start.clone().add(end).multiplyScalar(0.5), direction),
      bone
    });
  }

  // Polygonal shells. Each face is an actual facet, rather than an overlay.
  function shell(
    vertices: P[],
    faces: number[][],
    center: P,
    color: string,
    bone: any
  ) {
    const origin = v(center);
    const positions: number[] = [];

    for (const face of faces) {
      for (let i = 1; i < face.length - 1; i++) {
        const a = v(vertices[face[0]]);
        let c = v(vertices[face[i]]);
        let d = v(vertices[face[i + 1]]);
        const normal = c.clone().sub(a).cross(d.clone().sub(a));
        const outward = a.clone().add(c).add(d).multiplyScalar(1 / 3).sub(origin);
        if (normal.dot(outward) < 0) [c, d] = [d, c];
        for (const point of [a, c, d]) {
          point.sub(origin);
          positions.push(point.x, point.y, point.z);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.computeVertexNormals();
    return b.part(geometry, color, { at: center, bone });
  }

  // ---------------------------------------------------------------------------
  // Skeleton first: a short torso, four open limb chains, independent eyes,
  // a hinged lower jaw, five separated digits per foot, and a long tail chain.
  // ---------------------------------------------------------------------------

  const hipAt = [0, 0.119, -0.083];
  const trunkAt = [0, 0.126, -0.017];
  const chestAt = [0, 0.135, 0.059];
  const neckAt = [0, 0.151, 0.096];
  const headAt = [0, 0.165, 0.128];

  const hips = joint("hips", hipAt, null, "spine", trunkAt);
  const spine = joint("spine1", trunkAt, hips, "spine", chestAt);
  const chest = joint("chest", chestAt, spine, "spine", neckAt);
  const neck = joint("neck", neckAt, chest, "neck", headAt);
  const head = joint("head", headAt, neck, "head", [0, 0.172, 0.202]);
  const jaw = joint("jaw", [0, 0.151, 0.108], head, "jaw", [0, 0.154, 0.2]);

  const eyes: any[] = [];
  for (const sign of [1, -1]) {
    const side = sign === 1 ? "L" : "R";
    const at = [sign * 0.027, 0.18, 0.145];
    const normal = new THREE.Vector3(sign * 0.97, 0.06, 0.27).normalize();
    const aim = v(at).addScaledVector(normal, 0.04).toArray();
    eyes.push({
      sign,
      at,
      normal,
      bone: joint(`eye${side}`, at, head, "hinge", aim, `eye${side}`)
    });
  }

  const legs: any[] = [];

  for (const front of [true, false]) {
    for (const sign of [1, -1]) {
      const side = sign === 1 ? "L" : "R";
      const tag = front ? `foreLeg${side}` : `hindLeg${side}`;
      const rootAt = front
        ? [sign * 0.028, 0.132, 0.059]
        : [sign * 0.027, 0.111, -0.077];
      const bendAt = front
        ? [sign * 0.076, 0.076, 0.03]
        : [sign * 0.075, 0.075, -0.031];
      const ankleAt = front
        ? [sign * 0.09, 0.024, 0.108]
        : [sign * 0.09, 0.024, -0.108];
      const footAt = [sign * 0.093, 0.009, ankleAt[2] + 0.003];
      const role = front ? "arm" : "leg";

      const root = joint(
        front ? `shoulder${side}` : `hip${side}`,
        rootAt,
        front ? chest : hips,
        role,
        bendAt,
        tag
      );
      const bend = joint(
        front ? `elbow${side}` : `knee${side}`,
        bendAt,
        root,
        role,
        ankleAt,
        tag
      );
      const ankle = joint(
        front ? `wrist${side}` : `ankle${side}`,
        ankleAt,
        bend,
        role,
        footAt,
        tag
      );
      const foot = joint(
        `foot${side}${front ? "Front" : "Rear"}`,
        footAt,
        ankle,
        role,
        [footAt[0], footAt[1], footAt[2] + 0.025],
        tag
      );

      const digits: any[] = [];

      // Front feet: three medial toes and two lateral toes.
      // Rear feet reverse the grouping, as on a real chameleon.
      for (const medial of [true, false]) {
        const count = medial ? (front ? 3 : 2) : front ? 2 : 3;
        const direction = medial ? -sign : sign;

        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.006;
          const a = [
            footAt[0] + direction * 0.005,
            0.009,
            footAt[2] + spread - 0.001
          ];
          const m = [
            footAt[0] + direction * 0.018,
            0.0065,
            footAt[2] + spread + 0.009
          ];
          const t = [
            footAt[0] + direction * (0.027 + (i % 2) * 0.0015),
            0.004,
            footAt[2] + spread + 0.016
          ];
          const name = `${front ? "fore" : "hind"}Toe${side}${
            medial ? "Inner" : "Outer"
          }${i + 1}`;
          const j0 = joint(`${name}Base`, a, foot, "digit", m, name);
          const j1 = joint(`${name}Mid`, m, j0, "digit", t, name);
          const nailEnd = [
            t[0] + direction * 0.004,
            0.00075,
            t[2] + 0.003
          ];
          const j2 = joint(`${name}Tip`, t, j1, "digit", nailEnd, name);
          digits.push({ a, m, t, nailEnd, j0, j1, j2, medial });
        }
      }

      legs.push({
        front,
        sign,
        rootAt,
        bendAt,
        ankleAt,
        footAt,
        root,
        bend,
        ankle,
        foot,
        digits
      });
    }
  }

  const tailPositions: P[] = [
    [0, 0.124, -0.119],
    [0, 0.12, -0.141],
    [0, 0.099, -0.166],
    [0, 0.073, -0.189]
  ];

  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    const angle = -Math.PI / 2 - t * Math.PI * 2 * 1.35;
    const radius = 0.06 * (1 - t) + 0.007 * t;
    tailPositions.push([
      0,
      0.116 + Math.sin(angle) * radius,
      -0.229 + Math.cos(angle) * radius
    ]);
  }

  const tail: any[] = [];
  for (let i = 0; i < tailPositions.length; i++) {
    const next =
      i < tailPositions.length - 1
        ? tailPositions[i + 1]
        : v(tailPositions[i])
            .add(v(tailPositions[i]).sub(v(tailPositions[i - 1])))
            .toArray();
    tail.push(
      joint(
        `tail${i + 1}`,
        tailPositions[i],
        i === 0 ? hips : tail[i - 1],
        "tail",
        next,
        "tail"
      )
    );
  }

  // ---------------------------------------------------------------------------
  // Main forms: deliberately simple, faceted, puppet-like masses.
  // ---------------------------------------------------------------------------

  b.sweep([hips, spine, chest], 0.018, { color: C.body });
  const neckSkin = b.sweep([chest, neck, head], 0.022, { color: C.headShade });

  const body = b.part(sphere(1, 16, 12), C.body, {
    at: [0, 0.123, -0.014],
    scale: [0.036, 0.058, 0.112],
    bone: spine
  });
  const bodySurface = b.surface(body);

  const headVertices: P[] = [
    [0.027, 0.157, 0.099],
    [-0.027, 0.157, 0.099],
    [0.029, 0.192, 0.112],
    [-0.029, 0.192, 0.112],
    [0.022, 0.178, 0.193],
    [-0.022, 0.178, 0.193],
    [0.022, 0.158, 0.204],
    [-0.022, 0.158, 0.204],
    [0, 0.204, 0.119],
    [0, 0.183, 0.194]
  ];
  const headCenter = [0, 0.177, 0.145];

  const cheekL = shell(headVertices, [[0, 6, 4, 2]], headCenter, C.head, head);
  const cheekR = shell(
    headVertices,
    [[1, 3, 5, 7]],
    headCenter,
    C.headShade,
    head
  );
  shell(headVertices, [[2, 4, 9, 8]], headCenter, C.headLight, head);
  shell(headVertices, [[3, 8, 9, 5]], headCenter, C.head, head);
  shell(headVertices, [[4, 6, 7, 5, 9]], headCenter, C.headLight, head);
  shell(headVertices, [[0, 2, 8, 3, 1]], headCenter, C.forest, head);
  shell(headVertices, [[0, 1, 7, 6]], headCenter, C.mouth, head);

  const jawVertices: P[] = [
    [0.025, 0.154, 0.108],
    [-0.025, 0.154, 0.108],
    [0.0215, 0.1558, 0.2025],
    [-0.0215, 0.1558, 0.2025],
    [0.02, 0.1415, 0.113],
    [-0.02, 0.1415, 0.113],
    [0.016, 0.1445, 0.195],
    [-0.016, 0.1445, 0.195]
  ];
  const jawCenter = [0, 0.149, 0.154];

  shell(jawVertices, [[0, 2, 6, 4]], jawCenter, C.lime, jaw);
  shell(jawVertices, [[1, 5, 7, 3]], jawCenter, C.headLight, jaw);
  const jawBottom = shell(
    jawVertices,
    [[4, 6, 7, 5]],
    jawCenter,
    C.belly,
    jaw
  );
  shell(jawVertices, [[2, 3, 7, 6]], jawCenter, C.lime, jaw);
  shell(jawVertices, [[0, 4, 5, 1]], jawCenter, C.headShade, jaw);
  shell(jawVertices, [[0, 1, 3, 2]], jawCenter, C.mouth, jaw);

  // A thin closed mouth line, with a separately articulated lower lip.
  for (const sign of [1, -1]) {
    const a = [sign * 0.027, 0.1564, 0.11];
    const m = [sign * 0.0245, 0.1571, 0.153];
    const c = [sign * 0.022, 0.1581, 0.203];
    segment(a, m, 0.00065, 0.00065, C.mouth, head, 6);
    segment(m, c, 0.00065, 0.00045, C.mouth, head, 6);
    segment(
      [sign * 0.0245, 0.1525, 0.115],
      [sign * 0.021, 0.1543, 0.2],
      0.00065,
      0.0005,
      C.gold,
      jaw,
      6
    );
  }

  // Tall, angular veiled-chameleon casque.
  const casqueVertices: P[] = [
    [0.0035, 0.256, 0.094],
    [-0.0035, 0.256, 0.094],
    [0.022, 0.19, 0.089],
    [-0.022, 0.19, 0.089],
    [0.018, 0.192, 0.157],
    [-0.018, 0.192, 0.157],
    [0.018, 0.211, 0.119],
    [-0.018, 0.211, 0.119]
  ];
  const casqueCenter = [0, 0.211, 0.118];

  shell(casqueVertices, [[0, 2, 6]], casqueCenter, C.forest, head);
  shell(casqueVertices, [[0, 6, 4]], casqueCenter, C.headLight, head);
  const casqueLowerL = shell(
    casqueVertices,
    [[2, 4, 6]],
    casqueCenter,
    C.headShade,
    head
  );
  shell(casqueVertices, [[1, 7, 3]], casqueCenter, C.darkGreen, head);
  shell(casqueVertices, [[1, 5, 7]], casqueCenter, C.head, head);
  const casqueLowerR = shell(
    casqueVertices,
    [[3, 7, 5]],
    casqueCenter,
    C.forest,
    head
  );
  shell(casqueVertices, [[0, 1, 3, 2]], casqueCenter, C.darkGreen, head);
  shell(casqueVertices, [[0, 4, 5, 1]], casqueCenter, C.lime, head);
  shell(casqueVertices, [[2, 3, 5, 4]], casqueCenter, C.headShade, head);

  segment(
    [0, 0.256, 0.094],
    [0, 0.193, 0.157],
    0.0012,
    0.0017,
    C.gold,
    head,
    6
  );
  segment(
    [0, 0.256, 0.094],
    [0, 0.19, 0.089],
    0.001,
    0.0014,
    C.darkGreen,
    head,
    6
  );

  for (const [sign, part] of [
    [1, casqueLowerL],
    [-1, casqueLowerR]
  ] as const) {
    const surface = b.surface(part);
    for (let i = 0; i < 4; i++) {
      const hit = surface.ray(
        [sign * 0.09, 0.198 + (i % 2) * 0.001, 0.109 + i * 0.01],
        [-sign, 0, 0]
      );
      if (hit) b.stick(scaleDisc(0.0018), i % 2 ? C.lime : C.gold, hit);
    }
  }

  // ---------------------------------------------------------------------------
  // Conical turret eyes, small apertures, and rings of individual eyelid scales.
  // ---------------------------------------------------------------------------

  const eyeProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.017, 0),
    new THREE.Vector2(0.021, 0.004),
    new THREE.Vector2(0.02, 0.01),
    new THREE.Vector2(0.016, 0.018),
    new THREE.Vector2(0.01, 0.024),
    new THREE.Vector2(0.0062, 0.0265),
    new THREE.Vector2(0, 0.0265)
  ];

  for (const eye of eyes) {
    const n: THREE.Vector3 = eye.normal;
    const pivot = v(eye.at);
    const u = new THREE.Vector3(0, 1, 0).cross(n).normalize();
    const w = n.clone().cross(u).normalize();

    const turret = b.part(flat(new THREE.LatheGeometry(eyeProfile, 12)), C.head, {
      frame: frame(pivot, n),
      bone: eye.bone
    });
    const turretSurface = b.surface(turret);

    for (const row of [
      { h: 0.008, r: 0.0205, count: 14 },
      { h: 0.018, r: 0.016, count: 11 }
    ]) {
      for (let i = 0; i < row.count; i++) {
        const angle = (i / row.count) * Math.PI * 2;
        const outside = pivot
          .clone()
          .addScaledVector(n, row.h)
          .addScaledVector(u, Math.cos(angle) * (row.r + 0.005))
          .addScaledVector(w, Math.sin(angle) * (row.r + 0.005));
        const hit = turretSurface.nearest(outside);
        if (hit) {
          b.stick(
            scaleDisc(row.h < 0.01 ? 0.00145 : 0.00115, 0.0005),
            i % 4 === 0 ? C.gold : i % 3 === 0 ? C.headShade : C.lime,
            hit
          );
        }
      }
    }

    const aperture = pivot.clone().addScaledVector(n, 0.0269);
    b.part(cylinder(0.0057, 0.0057, 0.0008, 12), C.darkGreen, {
      frame: frame(aperture, n),
      bone: eye.bone
    });

    const irisRing = flat(new THREE.TorusGeometry(0.00465, 0.00065, 4, 12));
    irisRing.rotateX(Math.PI / 2);
    b.part(irisRing, C.gold, {
      frame: frame(pivot.clone().addScaledVector(n, 0.0274), n),
      bone: eye.bone
    });
    b.part(cylinder(0.00365, 0.00365, 0.0009, 12), C.pupil, {
      frame: frame(pivot.clone().addScaledVector(n, 0.0276), n),
      bone: eye.bone
    });

    const glint = pivot
      .clone()
      .addScaledVector(n, 0.0283)
      .addScaledVector(u, -0.00105)
      .addScaledVector(w, 0.00125);
    b.part(sphere(0.00085, 6, 4), C.shine, {
      at: glint,
      bone: eye.bone
    });
  }

  // Nostril and cheek scales are seated on the actual head facets.
  for (const [sign, cheek] of [
    [1, cheekL],
    [-1, cheekR]
  ] as const) {
    const surface = b.surface(cheek);
    const nostril = surface.ray(
      [sign * 0.1, 0.172, 0.184],
      [-sign, 0, 0]
    );
    if (nostril) b.stick(scaleDisc(0.00145, 0.0004), C.darkGreen, nostril);

    for (let i = 0; i < 9; i++) {
      const hit = surface.ray(
        [sign * 0.1, 0.1625 + (i % 2) * 0.0015, 0.112 + i * 0.008],
        [-sign, 0, 0]
      );
      if (hit) b.stick(scaleDisc(0.0013, 0.0005), C.lime, hit);
    }
  }

  // ---------------------------------------------------------------------------
  // Body markings: three broad turquoise scale mosaics and small gold freckles.
  // All scales use surface hits, so they follow the faceted ellipsoid exactly.
  // ---------------------------------------------------------------------------

  const bandCenters = [-0.072, -0.012, 0.048];

  for (const sign of [1, -1]) {
    for (let band = 0; band < bandCenters.length; band++) {
      for (let row = 0; row < 10; row++) {
        const y = 0.084 + row * 0.0085;
        const drift = 0.018 * (row / 9 - 0.5);

        for (let column = -1; column <= 1; column++) {
          const z =
            bandCenters[band] +
            drift +
            column * 0.0057 +
            (row % 2) * 0.0018;
          const hit = bodySurface.ray(
            [sign * 0.13, y, z],
            [-sign, 0, 0]
          );
          if (hit) {
            const color =
              column !== 0 && (row + band) % 4 === 0
                ? C.deepTeal
                : C.turquoise;
            b.stick(scaleDisc(0.0042, 0.00055), color, hit);
          }
        }
      }
    }

    // A creamy, scalloped lower flank.
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 17; i++) {
        const hit = bodySurface.ray(
          [
            sign * 0.13,
            0.079 + row * 0.007,
            -0.079 + i * 0.008 + (row % 2) * 0.003
          ],
          [-sign, 0, 0]
        );
        if (hit) {
          b.stick(
            scaleDisc(0.0037, 0.00045),
            row === 0 ? C.belly : C.lime,
            hit
          );
        }
      }
    }

    // Gold lateral-line spots.
    for (let i = 0; i < 18; i++) {
      const hit = bodySurface.ray(
        [sign * 0.13, 0.121 + Math.sin(i * 0.55) * 0.002, -0.098 + i * 0.0107],
        [-sign, 0, 0]
      );
      if (hit) b.stick(scaleDisc(0.00165, 0.0007), C.gold, hit);
    }

    // Sparse pebble scales; the broad markings remain the dominant read.
    for (let i = 0; i < 49; i++) {
      const y = 0.096 + random() * 0.068;
      const z = -0.101 + random() * 0.181;
      const drift = 0.018 * ((y - 0.084) / 0.0765 - 0.5);
      if (bandCenters.some((center) => Math.abs(z - center - drift) < 0.012)) {
        continue;
      }
      const hit = bodySurface.ray([sign * 0.13, y, z], [-sign, 0, 0]);
      if (hit) {
        b.stick(
          scaleDisc(0.0009 + random() * 0.0007, 0.0007),
          i % 5 === 0 ? C.forest : i % 3 === 0 ? C.gold : C.lime,
          hit
        );
      }
    }
  }

  // Midline belly scales.
  for (let i = 0; i < 22; i++) {
    const hit = bodySurface.ray(
      [0, 0.015, -0.104 + i * 0.0086],
      [0, 1, 0]
    );
    if (hit) b.stick(scaleDisc(0.0038, 0.00045), C.belly, hit);
  }

  // Low, warm-colored pyramids form the characteristic serrated dorsal ridge.
  for (let i = 0; i < 21; i++) {
    const z = -0.115 + i * 0.0096;
    const hit = bodySurface.ray([0, 0.3, z], [0, -1, 0]);
    if (!hit) continue;
    const length = 0.0045 + Math.sin((i / 20) * Math.PI) * 0.0034;
    b.stick(
      flat(new THREE.ConeGeometry(0.0025, length, 4)),
      i % 4 === 0 ? C.ochre : C.gold,
      hit
    );
  }

  // A small gular fringe beneath the jaw and throat.
  const lowerJawSurface = b.surface(jawBottom);
  for (let i = 0; i < 8; i++) {
    const hit = lowerJawSurface.ray(
      [0, 0.09, 0.12 + i * 0.009],
      [0, 1, 0]
    );
    if (hit) {
      b.stick(
        flat(new THREE.ConeGeometry(0.0015, 0.0038, 4)),
        C.gold,
        hit
      );
    }
  }
  const throatSurface = b.surface(neckSkin);
  for (let i = 0; i < 5; i++) {
    const hit = throatSurface.nearest([0, 0.07, 0.065 + i * 0.009]);
    if (hit) {
      b.stick(
        flat(new THREE.ConeGeometry(0.0018, 0.0048, 4)),
        C.lime,
        hit
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Limbs, padded split feet, separately rigged fingers, and tiny curved claws.
  // ---------------------------------------------------------------------------

  for (const leg of legs) {
    const skin = b.sweep(
      [leg.root, leg.bend, leg.ankle, leg.foot],
      leg.front ? 0.0066 : 0.0073,
      { color: leg.front ? C.headShade : C.body }
    );

    b.part(sphere(1, 8, 6), C.toe, {
      at: leg.footAt,
      scale: [0.01, 0.009, 0.011],
      bone: leg.foot
    });

    const lowerDirection = v(leg.ankleAt).sub(v(leg.bendAt));
    const cuffAt = v(leg.bendAt).lerp(v(leg.ankleAt), 0.66);
    b.part(
      cylinder(
        leg.front ? 0.00685 : 0.00755,
        leg.front ? 0.00685 : 0.00755,
        0.0045,
        8
      ),
      C.turquoise,
      {
        frame: frame(cuffAt, lowerDirection),
        bone: leg.bend
      }
    );

    const limbSurface = b.surface(skin);
    for (let i = 0; i < 5; i++) {
      const point = v(leg.bendAt).lerp(v(leg.ankleAt), 0.16 + i * 0.13);
      point.x += leg.sign * 0.023;
      const hit = limbSurface.nearest(point);
      if (hit) {
        b.stick(scaleDisc(0.0013, 0.0006), i % 2 ? C.lime : C.gold, hit);
      }
    }

    for (const toe of leg.digits) {
      b.sweep([toe.j0, toe.j1, toe.j2], 0.0021, {
        color: toe.medial ? C.toe : C.headShade
      });
      segment(toe.t, toe.nailEnd, 0.00125, 0.00012, C.claw, toe.j2, 5);

      const direction = v(toe.t).sub(v(toe.m));
      const knuckle = v(toe.m).lerp(v(toe.t), 0.24);
      b.part(cylinder(0.00222, 0.00222, 0.0012, 6), C.lime, {
        frame: frame(knuckle, direction),
        bone: toe.j1
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Prehensile tail: articulated continuous sweeps, narrowing into a tight coil.
  // Subtle stepped tapers preserve the intentionally primitive-built silhouette.
  // ---------------------------------------------------------------------------

  const tailSections = [
    { start: 0, end: 7, radius: 0.0102 },
    { start: 7, end: 12, radius: 0.0083 },
    { start: 12, end: 17, radius: 0.0065 },
    { start: 17, end: 22, radius: 0.0049 },
    { start: 22, end: 27, radius: 0.0034 },
    { start: 27, end: tail.length - 1, radius: 0.0019 }
  ];

  for (let sectionIndex = 0; sectionIndex < tailSections.length; sectionIndex++) {
    const section = tailSections[sectionIndex];
    const skin = b.sweep(
      tail.slice(section.start, section.end + 1),
      section.radius,
      { color: sectionIndex < 4 ? C.body : C.head }
    );
    const surface = b.surface(skin);

    for (let i = section.start; i < section.end; i += 2) {
      const p = tailPositions[i];
      const previous = tailPositions[Math.max(0, i - 1)];
      const next = tailPositions[Math.min(tailPositions.length - 1, i + 1)];
      const tangent = v(next).sub(v(previous));

      b.part(
        cylinder(
          section.radius + 0.00025,
          section.radius + 0.00025,
          sectionIndex < 3 ? 0.0031 : 0.0018,
          8
        ),
        i % 4 === 0 ? C.gold : C.lime,
        {
          frame: frame(p, tangent),
          bone: tail[i]
        }
      );

      if (sectionIndex < 4) {
        const hit = surface.nearest(
          v(p).add(new THREE.Vector3(section.radius + 0.015, 0, 0))
        );
        if (hit) {
          b.stick(scaleDisc(0.0011, 0.0005), C.forest, hit);
        }
      }
    }
  }

  const tipGeometry = flat(new THREE.ConeGeometry(0.0019, 0.0055, 7));
  tipGeometry.translate(0, 0.00275, 0);
  b.part(tipGeometry, C.headLight, {
    frame: tail[tail.length - 1],
    bone: tail[tail.length - 1]
  });

  return b.root;
}
