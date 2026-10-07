import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Citron-Crowned Chameleon",
  description:
    "A jewel-green, primitive-built veiled chameleon with a tall faceted casque, turret eyes, lemon flank markings, grasping five-toed feet, and a loosely spiralled, articulated tail."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Citron-Crowned Chameleon" });

  type V = [number, number, number];
  type J = ReturnType<typeof b.joint>;

  const C = {
    green: "#63AB35",
    leaf: "#43973C",
    forest: "#28764A",
    jade: "#258B69",
    teal: "#25877C",
    turquoise: "#54B398",
    lime: "#AED44A",
    lemon: "#DDD660",
    belly: "#BCCA6A",
    cream: "#E7DB9A",
    ochre: "#C7AA43",
    dark: "#264F3B",
    pupil: "#142E2B",
    glint: "#FFF3CC",
    claw: "#6C7152"
  };

  const add = (a: V, d: V): V => [a[0] + d[0], a[1] + d[1], a[2] + d[2]];
  const sub = (a: V, d: V): V => [a[0] - d[0], a[1] - d[1], a[2] - d[2]];
  const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
  const mix = (a: V, d: V, t: number): V => add(mul(a, 1 - t), mul(d, t));
  const length = (a: V) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a: V): V => mul(a, 1 / Math.max(1e-9, length(a)));
  const cross = (a: V, d: V): V => [
    a[1] * d[2] - a[2] * d[1],
    a[2] * d[0] - a[0] * d[2],
    a[0] * d[1] - a[1] * d[0]
  ];
  const dot = (a: V, d: V) => a[0] * d[0] + a[1] * d[1] + a[2] * d[2];

  // Skeleton first. All coordinates are model-space metres.
  const roles = new Map<string, string>();
  function joint(name: string, at: V, parent: J | undefined, role: string, aim?: V): J {
    const options: any = { at, role, aim: aim ?? add(at, [0, 0.01, 0]) };
    if (parent) options.parent = parent;
    const result = b.joint(name, options);
    roles.set(name, role);
    return result;
  }

  const hipsP: V = [0, 0.140, -0.071];
  const spineP: V = [0, 0.154, 0.027];
  const neckP: V = [0, 0.178, 0.111];
  const headP: V = [0, 0.193, 0.163];
  const jawP: V = [0, 0.167, 0.140];

  const hips = joint("hips", hipsP, undefined, "spine", spineP);
  const spine = joint("spine", spineP, hips, "spine", neckP);
  const neck = joint("neck", neckP, spine, "neck", headP);
  const head = joint("head", headP, neck, "head", [0, 0.192, 0.237]);
  const jaw = joint("jaw", jawP, head, "jaw", [0, 0.169, 0.235]);

  const eyes: { side: number; p: V; axis: V; joint: J }[] = [];
  for (const side of [1, -1]) {
    const p: V = [side * 0.031, 0.201, 0.176];
    const axis = norm([side * 0.95, 0.08, 0.30]);
    eyes.push({
      side,
      p,
      axis,
      joint: joint(side === 1 ? "eyeL" : "eyeR", p, head, "hinge", add(p, axis))
    });
  }

  interface Digit {
    points: V[];
    joints: J[];
    outer: boolean;
  }
  interface Leg {
    side: number;
    front: boolean;
    points: V[];
    joints: J[];
    digits: Digit[];
  }
  const legs: Leg[] = [];

  for (const front of [true, false]) {
    for (const side of [1, -1]) {
      const suffix = side === 1 ? "L" : "R";
      const rootP: V = front
        ? [side * 0.033, 0.145, 0.070]
        : [side * 0.032, 0.130, -0.085];
      const bendP: V = front
        ? [side * 0.073, 0.088, 0.041]
        : [side * 0.076, 0.078, -0.025];
      const wristP: V = front
        ? [side * 0.082, 0.027, 0.114]
        : [side * 0.087, 0.027, -0.094];
      const palmP: V = [wristP[0], 0.013, wristP[2] + 0.004];

      const a = joint(
        (front ? "shoulder" : "hip") + suffix,
        rootP, front ? spine : hips, "leg", bendP
      );
      const k = joint(
        (front ? "elbow" : "knee") + suffix,
        bendP, a, "leg", wristP
      );
      const w = joint(
        (front ? "wrist" : "ankle") + suffix,
        wristP, k, "leg", palmP
      );
      const palm = joint(
        (front ? "hand" : "foot") + suffix,
        palmP, w, "leg", add(palmP, [0, 0, 0.02])
      );

      const digits: Digit[] = [];
      for (let d = 0; d < 5; d++) {
        const outer = d >= 3;
        const n = outer ? d - 3 : d;
        const direction = outer ? side : -side;
        const dz = outer ? -0.008 + n * 0.006 : 0.002 + n * 0.005;

        const p0: V = [palmP[0] + direction * 0.003, 0.012, palmP[2] + dz * 0.55];
        const p1: V = [
          palmP[0] + direction * (outer ? 0.015 : 0.014),
          0.006,
          palmP[2] + dz
        ];
        const p2: V = [
          palmP[0] + direction * (outer ? 0.025 : 0.024),
          0.0021,
          palmP[2] + dz + (outer ? 0.004 : 0.008)
        ];
        const prefix = (front ? "fore" : "hind") + suffix + "Digit" + (d + 1);
        const d0 = joint(prefix, p0, palm, "digit", p1);
        const d1 = joint(prefix + "Knuckle", p1, d0, "digit", p2);
        const d2 = joint(prefix + "Tip", p2, d1, "digit", add(p2, sub(p2, p1)));
        digits.push({ points: [p0, p1, p2], joints: [d0, d1, d2], outer });
      }
      legs.push({
        side, front,
        points: [rootP, bendP, wristP, palmP],
        joints: [a, k, w, palm],
        digits
      });
    }
  }

  // An open spiral rather than an intersecting coil: every tail joint remains accessible.
  const tailPoints: V[] = [
    [0, 0.133, -0.130],
    [0, 0.125, -0.160],
    [0, 0.105, -0.184],
    [0, 0.078, -0.206],
    [0, 0.057, -0.230]
  ];
  const coilSteps = 27;
  for (let i = 0; i <= coilSteps; i++) {
    const t = i / coilSteps;
    const angle = -Math.PI / 2 - t * Math.PI * 2 * 1.22;
    const radius = 0.063 * (1 - t) + 0.010 * t;
    tailPoints.push([
      0,
      0.112 + Math.sin(angle) * radius,
      -0.259 + Math.cos(angle) * radius
    ]);
  }

  const tailJoints: J[] = [];
  for (let i = 0; i < tailPoints.length; i++) {
    const target = tailPoints[Math.min(i + 1, tailPoints.length - 1)];
    tailJoints.push(joint(
      "tail" + (i + 1), tailPoints[i],
      i === 0 ? hips : tailJoints[i - 1], "tail",
      i === tailPoints.length - 1
        ? add(tailPoints[i], sub(tailPoints[i], tailPoints[i - 1]))
        : target
    ));
  }

  b.root.traverse((object) => {
    const role = roles.get(object.name);
    if (role) object.userData.role = role;
  });

  // Geometry utilities. Every resulting piece goes through the builder.
  function meshFrom(
    vertices: number[], color: string, at: V, bone: J
  ): ReturnType<typeof b.part> {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    return b.part(g, color, { at, bone });
  }

  function pushTri(out: number[], a: V, c: V, d: V) {
    out.push(...a, ...c, ...d);
  }

  function outwardTri(out: number[], a: V, c: V, d: V, outward: V) {
    if (dot(cross(sub(c, a), sub(d, a)), outward) < 0) pushTri(out, a, d, c);
    else pushTri(out, a, c, d);
  }

  function rod(a: V, c: V, radius: number, color: string, bone: J, sides = 8) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, length(sub(c, a)), sides, 1),
      color,
      { at: mix(a, c, 0.5), dir: sub(c, a), bone }
    );
  }

  function ellipsoid(
    p: V, scale: V, color: string, bone: J, dir?: V, segments = 12
  ) {
    return b.part(
      new THREE.SphereGeometry(1, segments, 8),
      color, { at: p, scale, bone, ...(dir ? { dir } : {}) }
    );
  }

  // Broad torso: a single primitive silhouette, with colour cut into its facets.
  const bodyCenter: V = [0, 0.145, -0.021];
  function bodyLocal(n: V): V {
    return [
      n[0] * 0.045 * (1 - n[2] * 0.08),
      n[1] * 0.069 + n[2] * 0.013,
      n[2] * 0.124
    ];
  }
  const bodyWorld = (n: V): V => add(bodyCenter, bodyLocal(n));

  function bodyColor(n: V): string {
    if (n[1] < -0.64) return C.belly;
    if (n[1] > 0.80) return C.forest;
    if (Math.abs(n[0]) > 0.28 && n[1] > -0.58) {
      const bend = 0.067 * Math.sin(n[1] * 4.7) + n[1] * 0.026;
      for (const center of [-0.66, -0.23, 0.22, 0.63]) {
        const d = Math.abs(n[2] - center - bend);
        if (d < 0.088) return n[1] > 0.20 ? C.lime : C.lemon;
        if (d < 0.127) return C.teal;
      }
    }
    return n[1] > 0.38 ? C.leaf : n[1] < -0.30 ? C.lime : C.green;
  }

  const unitBody = new THREE.SphereGeometry(1, 32, 20);
  const positions = unitBody.getAttribute("position");
  const indices = unitBody.getIndex()!;
  const coloredBody = new Map<string, number[]>();
  for (let i = 0; i < indices.count; i += 3) {
    const tri: V[] = [];
    for (let k = 0; k < 3; k++) {
      const index = indices.getX(i + k);
      tri.push([positions.getX(index), positions.getY(index), positions.getZ(index)]);
    }
    const centroid = mul(add(add(tri[0], tri[1]), tri[2]), 1 / 3);
    const color = bodyColor(centroid);
    if (!coloredBody.has(color)) coloredBody.set(color, []);
    pushTri(
      coloredBody.get(color)!,
      bodyLocal(tri[0]), bodyLocal(tri[1]), bodyLocal(tri[2])
    );
  }

  const bodyParts = new Map<string, ReturnType<typeof b.part>>();
  for (const [color, vertices] of coloredBody) {
    bodyParts.set(color, meshFrom(vertices, color, bodyCenter, spine));
  }

  // Facet-sized granules: restrained relief, not a second layer of large spheres.
  for (const side of [1, -1]) {
    for (let row = 0; row < 7; row++) {
      const ny = -0.49 + row * 0.181;
      for (let column = 0; column < 14; column++) {
        const nz = -0.85 + column * 0.129 + (row % 2) * 0.044;
        const sq = 1 - ny * ny - nz * nz;
        if (sq < 0.16) continue;
        const n: V = [side * Math.sqrt(sq), ny, nz];
        const baseColor = bodyColor(n);
        const surface = b.surface(bodyParts.get(baseColor)!);
        const hit = surface.nearest(bodyWorld(n));
        const r = 0.00155 + ((column + row * 2) % 3) * 0.00027;
        const g = new THREE.SphereGeometry(1, 6, 4).scale(r, r * 0.24, r * 0.83);
        let color = row % 3 === 0 ? C.lime : C.green;
        if (baseColor === C.lemon || baseColor === C.lime) color = C.cream;
        if (baseColor === C.teal) color = C.turquoise;
        if (baseColor === C.forest || baseColor === C.leaf) color = C.green;
        b.stick(g, color, hit);
      }
    }
  }

  // A little saw-toothed dorsal crest, seated directly on the torso.
  for (let i = 0; i < 18; i++) {
    const z = -0.88 + i * 1.70 / 17;
    const n: V = [0, Math.sqrt(1 - z * z), z];
    const hit = b.surface(bodyParts.get(bodyColor(n))!).nearest(bodyWorld(n));
    const h = 0.0045 + 0.0035 * Math.sin(Math.PI * i / 17);
    b.stick(new THREE.ConeGeometry(0.0028, h, 4), i % 4 === 0 ? C.cream : C.lime, hit);
  }

  b.sweep([spine, neck, head], 0.024, { color: C.leaf });

  // Skull and separately rigged upper/lower mouth pieces.
  const skull = ellipsoid(headP, [0.033, 0.033, 0.047], C.leaf, head, undefined, 12);

  interface Section { z: number; y: number; w: number; h: number }
  function jawShape(sections: Section[], color: string, bone: J) {
    const rings = sections.map((s): V[] => [
      [s.w, s.y, s.z],
      [s.w * 0.70, s.y + s.h, s.z],
      [-s.w * 0.70, s.y + s.h, s.z],
      [-s.w, s.y, s.z],
      [-s.w * 0.70, s.y - s.h, s.z],
      [s.w * 0.70, s.y - s.h, s.z]
    ]);
    const origin: V = [0, sections[0].y, sections[0].z];
    const verts: number[] = [];
    for (let i = 0; i < rings.length - 1; i++) {
      for (let j = 0; j < 6; j++) {
        const next = (j + 1) % 6;
        const a = sub(rings[i][j], origin);
        const c = sub(rings[i][next], origin);
        const d = sub(rings[i + 1][next], origin);
        const e = sub(rings[i + 1][j], origin);
        pushTri(verts, a, c, d);
        pushTri(verts, a, d, e);
      }
    }
    for (const end of [0, rings.length - 1]) {
      const center: V = [0, sections[end].y, sections[end].z];
      for (let j = 0; j < 6; j++) {
        outwardTri(
          verts, sub(center, origin),
          sub(rings[end][j], origin), sub(rings[end][(j + 1) % 6], origin),
          [0, 0, end === 0 ? -1 : 1]
        );
      }
    }
    return meshFrom(verts, color, origin, bone);
  }

  const upperJaw = jawShape([
    { z: 0.151, y: 0.184, w: 0.025, h: 0.017 },
    { z: 0.184, y: 0.183, w: 0.026, h: 0.018 },
    { z: 0.228, y: 0.180, w: 0.014, h: 0.008 },
    { z: 0.243, y: 0.178, w: 0.006, h: 0.003 }
  ], C.green, head);

  const lowerJaw = jawShape([
    { z: 0.133, y: 0.166, w: 0.015, h: 0.004 },
    { z: 0.177, y: 0.160, w: 0.025, h: 0.005 },
    { z: 0.226, y: 0.169, w: 0.014, h: 0.003 },
    { z: 0.241, y: 0.1738, w: 0.0055, h: 0.0018 }
  ], C.belly, jaw);

  for (const side of [1, -1]) {
    const mouth: V[] = [
      [side * 0.019, 0.169, 0.138],
      [side * 0.0255, 0.1668, 0.177],
      [side * 0.0142, 0.1720, 0.226],
      [side * 0.0057, 0.1751, 0.242]
    ];
    for (let i = 0; i < mouth.length - 1; i++)
      rod(mouth[i], mouth[i + 1], 0.00085, C.dark, head, 6);

    const nostril = b.surface(upperJaw).nearest([side * 0.011, 0.185, 0.228]);
    b.stick(
      new THREE.SphereGeometry(1, 8, 5).scale(0.00145, 0.00045, 0.0008),
      C.dark, nostril
    );

    const cheekSurface = b.surface(skull);
    for (let i = 0; i < 8; i++) {
      const hit = cheekSurface.nearest([
        side * 0.032, 0.176 + i * 0.0025, 0.146 + i * 0.0022
      ]);
      b.stick(
        new THREE.SphereGeometry(1, 6, 4).scale(0.0017, 0.0005, 0.0013),
        i % 3 === 0 ? C.lemon : C.lime, hit
      );
    }
  }
  rod([-0.0057, 0.1751, 0.242], [0.0057, 0.1751, 0.242], 0.00075, C.dark, head, 6);

  for (let i = 0; i < 7; i++) {
    const hit = b.surface(lowerJaw).nearest([0, 0.140, 0.145 + i * 0.009]);
    b.stick(new THREE.ConeGeometry(0.0018, 0.0048 - i * 0.0003, 4), C.cream, hit);
  }

  // The casque is a thick, folded triangular plate, not a smooth cone.
  const casqueProfile = [
    { z: 0.106, y: 0.195, w: 0.014 },
    { z: 0.111, y: 0.250, w: 0.008 },
    { z: 0.124, y: 0.282, w: 0.004 },
    { z: 0.151, y: 0.251, w: 0.011 },
    { z: 0.203, y: 0.198, w: 0.018 }
  ];
  const casqueCenter: V = [0, 0.231, 0.142];
  for (const side of [1, -1]) {
    const fanCenter: V = [side * 0.018, 0.231, 0.142];
    const colors = [C.forest, C.jade, C.green, C.lime, C.leaf];
    for (let i = 0; i < casqueProfile.length; i++) {
      const a = casqueProfile[i];
      const c = casqueProfile[(i + 1) % casqueProfile.length];
      const vertices: number[] = [];
      outwardTri(
        vertices, sub(fanCenter, casqueCenter),
        sub([side * a.w, a.y, a.z], casqueCenter),
        sub([side * c.w, c.y, c.z], casqueCenter),
        [side, 0, 0]
      );
      meshFrom(vertices, colors[i], casqueCenter, head);
    }
    for (let i = 0; i < 4; i++) {
      const a = casqueProfile[i], c = casqueProfile[i + 1];
      rod([side * a.w, a.y, a.z], [side * c.w, c.y, c.z],
        0.00125, i < 2 ? C.lime : C.lemon, head, 6);
    }
  }
  for (let i = 0; i < casqueProfile.length; i++) {
    const a = casqueProfile[i], c = casqueProfile[(i + 1) % casqueProfile.length];
    const p: V = [a.w, a.y, a.z], q: V = [-a.w, a.y, a.z];
    const r: V = [-c.w, c.y, c.z], s: V = [c.w, c.y, c.z];
    const vertices: number[] = [];
    const outward = sub(mix(p, r, 0.5), casqueCenter);
    outwardTri(vertices, sub(p, casqueCenter), sub(q, casqueCenter), sub(r, casqueCenter), outward);
    outwardTri(vertices, sub(p, casqueCenter), sub(r, casqueCenter), sub(s, casqueCenter), outward);
    meshFrom(vertices, i === 1 || i === 2 ? C.lime : C.forest, casqueCenter, head);
  }

  // Large, independently rigged turret eyes; tiny pupils sit inside gold apertures.
  for (const eye of eyes) {
    const center = add(eye.p, mul(eye.axis, 0.006));
    const turret = ellipsoid(
      center, [0.0172, 0.0125, 0.0172], C.green, eye.joint, eye.axis, 12
    );
    const u = norm(cross([0, 1, 0], eye.axis));
    const v = norm(cross(eye.axis, u));
    const surface = b.surface(turret);

    for (let i = 0; i < 14; i++) {
      const angle = i * Math.PI * 2 / 14;
      const radial = add(mul(u, Math.cos(angle)), mul(v, Math.sin(angle)));
      const target = add(add(center, mul(eye.axis, 0.009)), mul(radial, 0.0118));
      b.stick(
        new THREE.SphereGeometry(1, 6, 4).scale(0.0016, 0.00055, 0.0020),
        i % 3 === 0 ? C.turquoise : C.lime, surface.nearest(target)
      );
    }

    const aperture = add(center, mul(eye.axis, 0.0120));
    b.part(new THREE.CylinderGeometry(0.0078, 0.0084, 0.0016, 12), C.forest,
      { at: aperture, dir: eye.axis, bone: eye.joint });
    const iris = add(aperture, mul(eye.axis, 0.0011));
    b.part(new THREE.CylinderGeometry(0.00645, 0.00665, 0.0012, 12), C.lemon,
      { at: iris, dir: eye.axis, bone: eye.joint });
    const pupil = add(iris, mul(eye.axis, 0.0009));
    b.part(new THREE.CylinderGeometry(0.00365, 0.00365, 0.0011, 12), C.pupil,
      { at: pupil, dir: eye.axis, bone: eye.joint });

    const highlight = add(add(add(pupil, mul(eye.axis, 0.0008)), mul(v, 0.0013)), mul(u, -0.001));
    ellipsoid(highlight, [0.00105, 0.00045, 0.00105], C.glint, eye.joint, eye.axis, 8);
  }

  // Four separated limbs. The continuous sweeps carry the articulated joints.
  for (const leg of legs) {
    const [a, k, w, palm] = leg.joints;
    const [ap, kp, wp, pp] = leg.points;
    const radius = leg.front ? 0.0074 : 0.0081;
    b.sweep([a, k, w, palm], radius, { color: C.green });

    const muscle = ellipsoid(
      mix(ap, kp, 0.44),
      [leg.front ? 0.011 : 0.014, length(sub(kp, ap)) * 0.45, leg.front ? 0.011 : 0.014],
      leg.front ? C.leaf : C.green, a, sub(kp, ap), 10
    );

    for (const t of [0.30, 0.66]) {
      b.part(new THREE.CylinderGeometry(radius * 1.04, radius * 1.04, 0.004, 8),
        t < 0.5 ? C.teal : C.lime,
        { at: mix(kp, wp, t), dir: sub(wp, kp), bone: k });
    }

    const muscleSurface = b.surface(muscle);
    for (let i = 0; i < 5; i++) {
      const p = add(mix(ap, kp, 0.22 + i * 0.12), [leg.side * 0.014, 0.003, 0]);
      b.stick(
        new THREE.SphereGeometry(1, 6, 4).scale(0.0023, 0.00065, 0.0019),
        i % 2 ? C.lime : C.lemon, muscleSurface.nearest(p)
      );
    }

    ellipsoid(pp, [0.009, 0.006, 0.011], C.lime, palm, undefined, 8);

    for (const digit of leg.digits) {
      b.sweep(digit.joints, digit.outer ? 0.0022 : 0.0020, { color: C.lime });
      const p1 = digit.points[1], tip = digit.points[2];
      const direction = norm(sub(tip, p1));
      const clawEnd = add(tip, mul(direction, 0.0033));
      // Blunt little keratin nails, kept at floor level.
      clawEnd[1] = 0.0012;
      const clawBase = mix(p1, tip, 0.86);
      b.part(
        new THREE.ConeGeometry(0.0012, length(sub(clawEnd, clawBase)), 5),
        C.claw,
        {
          at: mix(clawBase, clawEnd, 0.5),
          dir: sub(clawEnd, clawBase),
          bone: digit.joints[2]
        }
      );
    }
  }

  // Tapered polygonal tail. Shared ring boundaries keep the rest-pose silhouette seamless.
  const tailRings: V[][] = [];
  const tailSides = 10;
  for (let i = 0; i < tailPoints.length; i++) {
    const t = i / (tailPoints.length - 1);
    const radius = 0.013 * Math.pow(1 - t, 1.02) + 0.00135;
    const before = tailPoints[Math.max(0, i - 1)];
    const after = tailPoints[Math.min(tailPoints.length - 1, i + 1)];
    const tangent = norm(sub(after, before));
    const x: V = [1, 0, 0];
    const other = norm(cross(tangent, x));
    const ring: V[] = [];
    for (let j = 0; j < tailSides; j++) {
      const angle = j * Math.PI * 2 / tailSides;
      ring.push(add(tailPoints[i],
        add(mul(x, Math.cos(angle) * radius), mul(other, Math.sin(angle) * radius))));
    }
    tailRings.push(ring);
  }

  for (let i = 0; i < tailRings.length - 1; i++) {
    const groups = new Map<string, number[]>();
    for (let j = 0; j < tailSides; j++) {
      const next = (j + 1) % tailSides;
      let color = j >= 5 ? C.lime : C.green;
      if (i > 1 && i % 5 === 2) color = j >= 5 ? C.turquoise : C.teal;
      if (j === 2 || j === 3) color = i % 5 === 2 ? C.jade : C.leaf;
      if (!groups.has(color)) groups.set(color, []);
      const vertices = groups.get(color)!;
      const origin = tailPoints[i];
      const a = sub(tailRings[i][j], origin);
      const c = sub(tailRings[i][next], origin);
      const d = sub(tailRings[i + 1][next], origin);
      const e = sub(tailRings[i + 1][j], origin);
      pushTri(vertices, a, c, d);
      pushTri(vertices, a, d, e);
    }
    for (const [color, vertices] of groups)
      meshFrom(vertices, color, tailPoints[i], tailJoints[i]);
  }
  ellipsoid(
    tailPoints[tailPoints.length - 1],
    [0.0014, 0.0014, 0.0014], C.lime,
    tailJoints[tailJoints.length - 1], undefined, 6
  );

  return b.root;
}
