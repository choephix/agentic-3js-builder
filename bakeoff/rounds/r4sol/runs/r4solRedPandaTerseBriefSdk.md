```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Red Panda",
  description:
    "A little copper-coated red panda with ivory cheek ruffs, expressive masked eyes, dark stocking legs, and a long, fluffy ringed tail. Built in a neutral four-footed pose with an articulated skeleton.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda" });

  const C = {
    rust: "#B5532E",
    back: "#C76735",
    furLight: "#CC713F",
    furDark: "#A64B2C",
    tailLight: "#DD8243",
    tailDark: "#A94729",
    belly: "#332A28",
    leg: "#292526",
    paw: "#393032",
    toe: "#30292B",
    claw: "#766963",
    cream: "#F2E6D2",
    creamShade: "#DFCEB5",
    mask: "#8E3F2B",
    bridge: "#BC5931",
    earDark: "#57423A",
    earInner: "#AA7960",
    iris: "#65412C",
    eye: "#17191A",
    nose: "#242629",
    noseShine: "#8F9690",
    white: "#FFF8E9",
    whisker: "#DED0BA",
    mouth: "#45302D",
  };

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  function flat(g: THREE.BufferGeometry): THREE.BufferGeometry {
    const result = g.index ? g.toNonIndexed() : g;
    result.computeVertexNormals();
    return result;
  }

  function joint(
    name: string,
    at: THREE.Vector3,
    parent: any,
    role: string,
    aim?: THREE.Vector3,
  ): any {
    const options = { at, parent, role, aim };
    const result = b.joint(name, options);
    const bone = (result as any).bone ?? result;
    if (bone.userData) bone.userData.role = role;
    return result;
  }

  function ellipsoid(
    at: THREE.Vector3,
    size: [number, number, number],
    color: string,
    bone: any,
    faceted = true,
    segments = 12,
  ) {
    let g: THREE.BufferGeometry = new THREE.SphereGeometry(1, segments, 8);
    g.scale(size[0], size[1], size[2]);
    if (faceted) g = flat(g);
    return b.part(g, color, { at, bone });
  }

  function between(
    a: THREE.Vector3,
    end: THREE.Vector3,
    radiusA: number,
    radiusB: number,
    color: string,
    bone: any,
    sides = 6,
  ) {
    const delta = end.clone().sub(a);
    const center = a.clone().add(end).multiplyScalar(0.5);
    return b.part(
      flat(new THREE.CylinderGeometry(radiusB, radiusA, delta.length(), sides, 1)),
      color,
      { at: center, dir: delta, bone },
    );
  }

  function plateGeometry(points: number[][], depth: number) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i][0], points[i][1]);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      bevelEnabled: false,
      curveSegments: 1,
    });
  }

  // A small triangular, raised fur shingle. Its +Y side faces away from the coat.
  function furChip(width: number, length: number, thickness: number) {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          -width / 2, 0, length * 0.4,
          width / 2, 0, length * 0.4,
          0, 0, -length * 0.6,
          -width / 2, thickness, length * 0.4,
          width / 2, thickness, length * 0.4,
          0, thickness * 0.15, -length * 0.6,
        ],
        3,
      ),
    );
    g.setIndex([
      0, 2, 1,
      3, 4, 5,
      0, 1, 4, 0, 4, 3,
      1, 2, 5, 1, 5, 4,
      2, 0, 3, 2, 3, 5,
    ]);
    return flat(g);
  }

  function seatedOval(
    surface: any,
    target: THREE.Vector3,
    size: [number, number, number],
    color: string,
    faceted = true,
  ) {
    let g: THREE.BufferGeometry = new THREE.SphereGeometry(1, 12, 8);
    g.scale(...size);
    if (faceted) g = flat(g);
    return b.stick(g, color, surface.nearest(target));
  }

  // ------------------------------------------------------------------
  // Skeleton first. Dimensions are those of a small adult red panda.
  // ------------------------------------------------------------------

  const P = {
    hips: v(0, 0.257, -0.205),
    spine: v(0, 0.271, -0.058),
    chest: v(0, 0.285, 0.13),
    neck: v(0, 0.319, 0.196),
    head: v(0, 0.373, 0.284),
    upperJaw: v(0, 0.344, 0.384),
    jaw: v(0, 0.321, 0.371),
    earL: v(0.086, 0.451, 0.277),
    earR: v(-0.086, 0.451, 0.277),
  };

  const hips = joint("hips", P.hips, undefined, "spine", P.spine);
  const spine = joint("spine", P.spine, hips, "spine", P.chest);
  const chest = joint("chest", P.chest, spine, "spine", P.neck);
  const neck = joint("neck", P.neck, chest, "neck", P.head);
  const head = joint("head", P.head, neck, "head", v(0, 0.373, 0.45));
  const upperJaw = joint(
    "upperJaw", P.upperJaw, head, "jaw", v(0, 0.344, 0.46),
  );
  const jaw = joint("jaw", P.jaw, head, "jaw", v(0, 0.321, 0.445));
  const earL = joint("earL", P.earL, head, "hinge", P.earL.clone().add(v(0.01, 0.07, 0)));
  const earR = joint("earR", P.earR, head, "hinge", P.earR.clone().add(v(-0.01, 0.07, 0)));

  const legs: {
    side: number;
    front: boolean;
    topP: THREE.Vector3;
    bendP: THREE.Vector3;
    ankleP: THREE.Vector3;
    pawP: THREE.Vector3;
    top: any;
    bend: any;
    ankle: any;
    paw: any;
    digits: { at: THREE.Vector3; bone: any }[];
  }[] = [];

  for (const front of [false, true]) {
    for (const side of [1, -1]) {
      const suffix = side === 1 ? "L" : "R";
      const topP = front
        ? v(side * 0.093, 0.256, 0.126)
        : v(side * 0.092, 0.233, -0.21);
      const bendP = front
        ? v(side * 0.127, 0.142, 0.118)
        : v(side * 0.125, 0.145, -0.166);
      const ankleP = front
        ? v(side * 0.139, 0.064, 0.179)
        : v(side * 0.132, 0.064, -0.233);
      const pawP = front
        ? v(side * 0.139, 0.029, 0.203)
        : v(side * 0.132, 0.029, -0.21);

      const top = joint(
        `${front ? "shoulder" : "hip"}${suffix}`,
        topP,
        front ? chest : hips,
        "leg",
        bendP,
      );
      const bend = joint(
        `${front ? "elbow" : "knee"}${suffix}`,
        bendP,
        top,
        "leg",
        ankleP,
      );
      const ankle = joint(
        `${front ? "wrist" : "ankle"}${suffix}`,
        ankleP,
        bend,
        "leg",
        pawP,
      );
      const paw = joint(
        `${front ? "forePaw" : "hindPaw"}${suffix}`,
        pawP,
        ankle,
        "hinge",
        pawP.clone().add(v(0, 0, 0.055)),
      );

      const digits = [];
      for (let i = 0; i < 4; i++) {
        const at = pawP.clone().add(
          v((i - 1.5) * 0.018, -0.011, 0.034 + (i === 0 || i === 3 ? -0.005 : 0.002)),
        );
        digits.push({
          at,
          bone: joint(
            `${front ? "fore" : "hind"}Toe${suffix}${i + 1}`,
            at,
            paw,
            "digit",
            at.clone().add(v(0, 0, 0.024)),
          ),
        });
      }
      legs.push({ side, front, topP, bendP, ankleP, pawP, top, bend, ankle, paw, digits });
    }
  }

  const tailCurve = new THREE.CatmullRomCurve3(
    [
      v(0, 0.278, -0.267),
      v(0.035, 0.29, -0.353),
      v(0.087, 0.312, -0.448),
      v(0.148, 0.332, -0.549),
      v(0.198, 0.338, -0.652),
      v(0.221, 0.321, -0.755),
      v(0.203, 0.288, -0.844),
    ],
    false,
    "centripetal",
  );
  const tailJoints: any[] = [];
  let tailParent: any = hips;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const at = tailCurve.getPointAt(t);
    const aim = i < 10
      ? tailCurve.getPointAt((i + 1) / 10)
      : at.clone().add(tailCurve.getTangentAt(1).multiplyScalar(0.035));
    const node = joint(`tail${i + 1}`, at, tailParent, "tail", aim);
    tailJoints.push(node);
    tailParent = node;
  }

  // ------------------------------------------------------------------
  // Coat: broad simple forms, with a warm dorsal mantle and dark underside.
  // ------------------------------------------------------------------

  ellipsoid(v(0, 0.222, -0.049), [0.117, 0.085, 0.2], C.belly, spine);
  const torso = ellipsoid(v(0, 0.267, -0.065), [0.13, 0.117, 0.235], C.rust, spine);

  let capGeo: THREE.BufferGeometry = new THREE.SphereGeometry(
    1, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.535,
  );
  capGeo.scale(0.1315, 0.119, 0.238);
  capGeo = flat(capGeo);
  const mantle = b.part(capGeo, C.back, {
    at: v(0, 0.267, -0.065),
    bone: spine,
  });

  b.sweep([chest, neck, head], 0.063, { color: C.rust, skin: "rigid" });
  ellipsoid(v(0, 0.299, 0.149), [0.105, 0.08, 0.087], C.rust, chest);
  ellipsoid(v(0, 0.273, 0.188), [0.087, 0.079, 0.074], C.belly, chest);

  for (const leg of legs) {
    b.sweep([leg.top, leg.bend, leg.ankle], leg.front ? 0.03 : 0.034, {
      color: C.leg,
      skin: "rigid",
    });

    if (!leg.front) {
      const thighCenter = leg.topP.clone().lerp(leg.bendP, 0.27);
      ellipsoid(thighCenter, [0.049, 0.061, 0.056], C.rust, leg.top, true, 10);
    } else {
      ellipsoid(
        leg.topP.clone().add(v(leg.side * 0.007, -0.008, -0.003)),
        [0.042, 0.045, 0.048],
        C.rust,
        leg.top,
        true,
        10,
      );
    }

    const foot = ellipsoid(leg.pawP, [0.042, 0.029, 0.049], C.paw, leg.paw, true, 10);
    const footSurface = b.surface(foot);
    b.stick(
      furChip(0.025, 0.034, 0.003),
      C.leg,
      footSurface.nearest(leg.pawP.clone().add(v(0, 0.05, -0.009))),
    );

    for (const digit of leg.digits) {
      ellipsoid(digit.at, [0.0076, 0.018, 0.023], C.toe, digit.bone, true, 8);
      const clawBase = digit.at.clone().add(v(0, 0.006, 0.02));
      const clawTip = clawBase.clone().add(v(0, -0.004, 0.012));
      between(clawBase, clawTip, 0.0028, 0.0005, C.claw, digit.bone, 5);
    }
  }

  // Restrained triangular coat marks, not a dense carpet of fur.
  const mantleSurface = b.surface(mantle);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 5; i++) {
      const x = (row - 1) * 0.055;
      const z = -0.231 + i * 0.077 + (row % 2) * 0.017;
      b.stick(
        furChip(0.019 + (i % 2) * 0.004, 0.039, 0.0028),
        (row + i) % 3 === 0 ? C.furDark : C.furLight,
        mantleSurface.nearest(v(x, 0.46, z)),
      );
    }
  }
  const torsoSurface = b.surface(torso);
  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.stick(
        furChip(0.022, 0.037, 0.004),
        i % 2 === 0 ? C.back : C.furDark,
        torsoSurface.nearest(v(side * 0.2, 0.273, -0.226 + i * 0.084)),
      );
    }
  }

  // ------------------------------------------------------------------
  // Long, polygonal tail. Each broad ring is a little curved ten-sided
  // tube primitive, sharing its boundary exactly with the next ring.
  // ------------------------------------------------------------------

  function tailRadius(t: number): number {
    if (t < 0.16) return 0.041 + (t / 0.16) * 0.021;
    if (t < 0.7) return 0.062 - ((t - 0.16) / 0.54) * 0.004;
    if (t < 0.94) return 0.058 - ((t - 0.7) / 0.24) * 0.034;
    return 0.024 * (1 - (t - 0.94) / 0.06);
  }

  function tailBandGeometry(a: number, end: number, center: THREE.Vector3) {
    const sides = 10;
    const steps = 4;
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let j = 0; j <= steps; j++) {
      const t = a + (end - a) * j / steps;
      const p = tailCurve.getPointAt(t);
      const tangent = tailCurve.getTangentAt(t).normalize();
      const right = v(0, 1, 0).cross(tangent).normalize();
      const up = tangent.clone().cross(right).normalize();
      const radius = tailRadius(t);
      for (let k = 0; k < sides; k++) {
        const angle = k / sides * Math.PI * 2;
        const q = p.clone()
          .addScaledVector(right, Math.cos(angle) * radius)
          .addScaledVector(up, Math.sin(angle) * radius)
          .sub(center);
        vertices.push(q.x, q.y, q.z);
      }
    }

    for (let j = 0; j < steps; j++) {
      for (let k = 0; k < sides; k++) {
        const a0 = j * sides + k;
        const a1 = j * sides + (k + 1) % sides;
        const b0 = (j + 1) * sides + k;
        const b1 = (j + 1) * sides + (k + 1) % sides;
        indices.push(a0, a1, b1, a0, b1, b0);
      }
    }

    const startCap = vertices.length / 3;
    const startP = tailCurve.getPointAt(a).sub(center);
    vertices.push(startP.x, startP.y, startP.z);
    const endCap = vertices.length / 3;
    const endP = tailCurve.getPointAt(end).sub(center);
    vertices.push(endP.x, endP.y, endP.z);

    for (let k = 0; k < sides; k++) {
      indices.push(startCap, (k + 1) % sides, k);
      indices.push(
        endCap,
        steps * sides + k,
        steps * sides + (k + 1) % sides,
      );
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    return flat(geo);
  }

  b.sweep(tailJoints, 0.021, { color: C.tailDark, skin: "rigid" });

  for (let i = 0; i < 12; i++) {
    const a = i / 12;
    const end = (i + 1) / 12;
    const t = (a + end) / 2;
    const center = tailCurve.getPointAt(t);
    const color = i % 2 === 0 ? C.tailLight : C.tailDark;
    const band = b.part(tailBandGeometry(a, end, center), color, {
      at: center,
      bone: tailJoints[Math.min(10, Math.floor(t * 10))],
    });

    if (i > 0 && i < 10 && i % 2 === 0) {
      const target = center.clone().add(v(0, tailRadius(t) * 1.7, 0));
      b.stick(
        furChip(0.023, 0.035, 0.0035),
        C.furLight,
        b.surface(band).nearest(target),
      );
    }
  }

  // ------------------------------------------------------------------
  // Head: broad russet crown, cream eyebrows and cheeks, reddish tears.
  // ------------------------------------------------------------------

  const headPart = ellipsoid(P.head, [0.129, 0.103, 0.112], C.rust, head, true, 14);
  const face = b.surface(headPart);

  seatedOval(face, v(0, 0.45, 0.322), [0.047, 0.008, 0.046], C.back);
  ellipsoid(v(0, 0.372, 0.389), [0.031, 0.043, 0.024], C.bridge, head, true, 10);

  const cheekParts: any[] = [];
  for (const side of [1, -1]) {
    const cheek = seatedOval(
      face,
      v(side * 0.092, 0.345, 0.359),
      [0.051, 0.013, 0.038],
      C.cream,
    );
    cheekParts.push(cheek);

    // Three blunt cream tips make the white cheek ruff visibly shaggy.
    const cheekOrigin = v(side * 0.096, 0.345, 0.363);
    const tuftOutlines = [
      [[0, 0.014], [0.05, 0.001], [0.012, -0.008]],
      [[0.006, 0.001], [0.047, -0.021], [0.011, -0.023]],
      [[-0.002, -0.013], [0.026, -0.039], [-0.008, -0.026]],
    ];
    for (let i = 0; i < tuftOutlines.length; i++) {
      const outline = tuftOutlines[i].map(([x, y]) => [side * x, y]);
      b.part(
        flat(plateGeometry(outline, 0.017)),
        i === 2 ? C.creamShade : C.cream,
        { at: cheekOrigin, bone: head },
      );
    }

    // Cream eyebrow arcs sit above the darker eye islands.
    seatedOval(
      face,
      v(side * 0.057, 0.409, 0.373),
      [0.037, 0.006, 0.0165],
      C.cream,
    );
    seatedOval(
      face,
      v(side * 0.027, 0.405, 0.389),
      [0.015, 0.0045, 0.014],
      C.cream,
    );

    const mask = seatedOval(
      face,
      v(side * 0.06, 0.382, 0.389),
      [0.033, 0.008, 0.034],
      C.mask,
    );
    const iris = seatedOval(
      b.surface(mask),
      v(side * 0.059, 0.382, 0.56),
      [0.022, 0.0055, 0.025],
      C.iris,
      false,
    );
    const eye = seatedOval(
      b.surface(iris),
      v(side * 0.059, 0.383, 0.6),
      [0.0184, 0.006, 0.021],
      C.eye,
      false,
    );

    const eyeSurface = b.surface(eye);
    seatedOval(
      eyeSurface,
      v(side * 0.053, 0.392, 0.65),
      [0.0046, 0.0017, 0.0046],
      C.white,
      false,
    );
    seatedOval(
      eyeSurface,
      v(side * 0.066, 0.376, 0.65),
      [0.0019, 0.0009, 0.0019],
      C.creamShade,
      false,
    );

    // The red panda's characteristic rusty downward tear marks.
    const cheekSurface = b.surface(cheek);
    for (let i = 0; i < 3; i++) {
      seatedOval(
        cheekSurface,
        v(side * (0.082 + i * 0.006), 0.364 - i * 0.011, 0.51),
        [0.010 - i * 0.0013, 0.0028, 0.0115],
        i === 0 ? C.mask : C.rust,
      );
    }
  }

  // Broad pointed ears with irregular fluffy ivory rims.
  const earOutline = [
    [-0.03, -0.024],
    [-0.039, 0.003],
    [-0.034, 0.002],
    [-0.034, 0.025],
    [-0.029, 0.022],
    [-0.022, 0.043],
    [-0.017, 0.04],
    [-0.007, 0.064],
    [0.003, 0.059],
    [0.013, 0.049],
    [0.018, 0.052],
    [0.029, 0.032],
    [0.026, 0.025],
    [0.035, 0.013],
    [0.03, 0.008],
    [0.033, -0.024],
  ];

  for (const side of [1, -1]) {
    const ear = side === 1 ? earL : earR;
    const earP = side === 1 ? P.earL : P.earR;
    const outline = earOutline.map(([x, y]) => [side * x, y]);

    const backGeo = plateGeometry(outline, 0.026);
    backGeo.translate(0, 0, -0.017);
    b.part(flat(backGeo), C.rust, { at: earP, bone: ear });

    const rimGeo = plateGeometry(
      outline.map(([x, y]) => [x * 0.96, y * 0.96]),
      0.006,
    );
    rimGeo.translate(0, 0, 0.01);
    b.part(flat(rimGeo), C.cream, { at: earP, bone: ear });

    const innerOutline = [
      [-0.021, -0.014],
      [-0.023, 0.009],
      [-0.009, 0.043],
      [0.01, 0.035],
      [0.021, 0.012],
      [0.022, -0.013],
    ].map(([x, y]) => [side * x, y]);

    const innerGeo = plateGeometry(innerOutline, 0.004);
    innerGeo.translate(0, 0, 0.017);
    b.part(flat(innerGeo), C.earDark, { at: earP, bone: ear });

    const warmGeo = plateGeometry(
      innerOutline.map(([x, y]) => [x * 0.64, y * 0.65 - 0.003]),
      0.003,
    );
    warmGeo.translate(0, 0, 0.022);
    b.part(flat(warmGeo), C.earInner, { at: earP, bone: ear });
  }

  // ------------------------------------------------------------------
  // Separate upper muzzle and hinged lower jaw, closed in the rest pose.
  // ------------------------------------------------------------------

  const muzzleParts: any[] = [];
  for (const side of [1, -1]) {
    muzzleParts.push(
      ellipsoid(
        v(side * 0.025, 0.34, 0.405),
        [0.036, 0.028, 0.035],
        C.cream,
        upperJaw,
        true,
        12,
      ),
    );
  }
  ellipsoid(v(0, 0.313, 0.402), [0.048, 0.015, 0.033], C.creamShade, jaw, true, 12);
  ellipsoid(v(0, 0.318, 0.421), [0.036, 0.009, 0.018], C.cream, jaw, true, 10);

  const noseOutline = [
    [-0.019, 0.005],
    [-0.011, 0.011],
    [0.011, 0.011],
    [0.019, 0.005],
    [0.013, -0.005],
    [0, -0.012],
    [-0.013, -0.005],
  ];
  const nose = b.part(
    flat(plateGeometry(noseOutline, 0.014)),
    C.nose,
    { at: v(0, 0.346, 0.436), bone: upperJaw },
  );
  seatedOval(
    b.surface(nose),
    v(-0.005, 0.352, 0.5),
    [0.006, 0.0011, 0.0023],
    C.noseShine,
    false,
  );

  between(v(0, 0.334, 0.441), v(0, 0.322, 0.441), 0.0015, 0.0012, C.mouth, upperJaw);
  const mouthPoints = [
    v(-0.041, 0.325, 0.421),
    v(-0.022, 0.32, 0.435),
    v(0, 0.319, 0.439),
    v(0.022, 0.32, 0.435),
    v(0.041, 0.325, 0.421),
  ];
  for (let i = 0; i < mouthPoints.length - 1; i++) {
    between(mouthPoints[i], mouthPoints[i + 1], 0.0014, 0.0014, C.mouth, jaw, 5);
  }

  for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
    const side = sideIndex === 0 ? 1 : -1;
    const muzzleSurface = b.surface(muzzleParts[sideIndex]);

    for (let i = 0; i < 3; i++) {
      seatedOval(
        muzzleSurface,
        v(side * (0.028 + i * 0.008), 0.341 - (i % 2) * 0.008, 0.5),
        [0.0018, 0.0008, 0.0018],
        C.mask,
        false,
      );
    }

    // Fine, separated whiskers fan gently forward from the muzzle.
    for (let i = 0; i < 3; i++) {
      const y = 0.332 + (i - 1) * 0.007;
      const start = muzzleSurface.nearest(v(side * 0.044, y, 0.5));
      b.sweep(
        [
          start,
          v(side * 0.095, y + (i - 1) * 0.006, 0.451),
          v(side * (0.136 + (i === 1 ? 0.008 : 0)), y + (i - 1) * 0.014, 0.461),
        ],
        0.00065,
        { color: C.whisker, skin: "rigid" },
      );
    }
  }

  return b.root;
}
```