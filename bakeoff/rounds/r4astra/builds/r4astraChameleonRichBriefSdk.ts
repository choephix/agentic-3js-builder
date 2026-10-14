import * as THREE from "three";
import { createBuilder, lerp } from "../../../../src/index";

export const meta = {
  name: "Prismatic Panther Chameleon",
  description:
    "A jewel-colored panther chameleon gripping a weathered twig, with independently aimed turret eyes, scarlet barring, ivory flank stripes, a serrated casque, and a tightly wound sunset-orange tail."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Prismatic Panther Chameleon" });

  const C = {
    turquoise: "#29bcae",
    turquoiseLight: "#69dbc5",
    teal: "#209d94",
    deepTeal: "#226c65",
    mint: "#88d9ad",
    lime: "#a7d348",
    yellow: "#d8dc70",
    cream: "#f3efce",
    white: "#fff7df",
    red: "#d64840",
    redDark: "#ae3839",
    redLight: "#ed7055",
    orange: "#ed912d",
    orangeMid: "#e98029",
    orangeDeep: "#dc692b",
    coral: "#d75932",
    pupil: "#132928",
    iris: "#dcb648",
    bark: "#6b4936",
    barkLight: "#936342",
    barkDark: "#44362c",
    wood: "#c19963",
    woodLight: "#dbb77b",
    lichen: "#a8b69a",
    lichenDark: "#7f9274"
  };

  const bodyColors = [
    "#29bcae", "#2ac3ab", "#38c7a0", "#4ccb89",
    "#63ce70", "#7bd057", "#96d344", "#b1d641",
    "#c6d33c", "#d6c63a", "#e1b238", "#e89f31",
    "#ed912d", "#e98029"
  ];

  const V = (p: number[] | THREE.Vector3): THREE.Vector3 =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);

  function tag(j: any, role: string) {
    if (j.userData) j.userData.role = role;
    if (j.bone?.userData) j.bone.userData.role = role;
    return j;
  }

  function joint(name: string, at: number[] | THREE.Vector3, parent: any, role: string, aim?: number[] | THREE.Vector3) {
    const opts: any = { at, parent };
    if (aim) opts.aim = aim;
    return tag(b.joint(name, opts), role);
  }

  const root = tag(b.joint("root", { at: [0, 0, 0] }), "spine");
  const bodyCenter = new THREE.Vector3(0, 0.198, -0.014);
  const bodyR = new THREE.Vector3(0.036, 0.076, 0.115);

  // Skeleton, including the opposed digital bundles, precedes all geometry.
  const hips = joint("hips", [0, 0.194, -0.089], root, "spine", bodyCenter);
  const spine = joint("spine", bodyCenter, hips, "spine", [0, 0.217, 0.075]);
  const neck = joint("neck", [0, 0.217, 0.075], spine, "neck", [0, 0.246, 0.116]);
  const head = joint("head", [0, 0.246, 0.116], neck, "head", [0, 0.239, 0.169]);
  const jaw = joint("jaw", [0, 0.215, 0.075], head, "jaw", [0, 0.213, 0.169]);

  const eyeData = [
    { name: "eyeL", p: new THREE.Vector3(0.031, 0.252, 0.118), gaze: new THREE.Vector3(0.87, 0.15, 0.47).normalize() },
    { name: "eyeR", p: new THREE.Vector3(-0.031, 0.252, 0.118), gaze: new THREE.Vector3(-0.84, 0.23, -0.49).normalize() }
  ].map(e => ({
    ...e,
    bone: joint(e.name, e.p, head, "hinge", e.p.clone().add(e.gaze))
  }));

  const twigPoints = [
    [-0.018, 0.011, -0.310],
    [-0.012, 0.030, -0.258],
    [-0.003, 0.063, -0.163],
    [0.000, 0.080, -0.080],
    [0.005, 0.090, 0.035],
    [0.008, 0.090, 0.140],
    [0.011, 0.049, 0.300]
  ].map(V);
  const twigRadii = [0.0115, 0.012, 0.011, 0.0103, 0.0092, 0.0075, 0.0045];

  function twigAt(z: number) {
    let i = 0;
    while (i < twigPoints.length - 2 && twigPoints[i + 1].z < z) i++;
    const a = twigPoints[i], q = twigPoints[i + 1];
    return a.clone().lerp(q, (z - a.z) / (q.z - a.z));
  }

  const legSpecs = [
    { side: 1, front: true, suffix: "L", shoulder: [0.026, 0.212, 0.067], elbow: [0.066, 0.151, 0.086], z: 0.106 },
    { side: -1, front: true, suffix: "R", shoulder: [-0.026, 0.212, 0.067], elbow: [-0.065, 0.159, 0.111], z: 0.150 },
    { side: 1, front: false, suffix: "L", shoulder: [0.026, 0.185, -0.077], elbow: [0.067, 0.143, -0.123], z: -0.112 },
    { side: -1, front: false, suffix: "R", shoulder: [-0.026, 0.185, -0.077], elbow: [-0.066, 0.143, -0.070], z: -0.060 }
  ];

  const legs = legSpecs.map(l => {
    const wood = twigAt(l.z);
    const wrist = new THREE.Vector3(wood.x + l.side * 0.014, wood.y + 0.021, l.z);
    const p = [V(l.shoulder), V(l.elbow), wrist];
    const names = l.front
      ? [`shoulder${l.suffix}`, `elbow${l.suffix}`, `wrist${l.suffix}`]
      : [`hip${l.suffix}`, `knee${l.suffix}`, `ankle${l.suffix}`];
    const j0 = joint(names[0], p[0], l.front ? neck : hips, l.front ? "arm" : "leg", p[1]);
    const j1 = joint(names[1], p[1], j0, l.front ? "arm" : "leg", p[2]);
    const j2 = joint(names[2], p[2], j1, l.front ? "arm" : "leg");
    const digits = [0, 1].map(d => {
      const side = d === 0 ? l.side : -l.side;
      const z = l.z + (d === 0 ? 0.0057 : -0.0057);
      const pts = [
        new THREE.Vector3(wood.x + l.side * 0.004, wood.y + 0.014, z),
        new THREE.Vector3(wood.x + side * 0.016, wood.y + 0.002, z),
        new THREE.Vector3(wood.x + side * 0.006, wood.y - 0.010, z)
      ];
      const prefix = `${l.front ? "finger" : "toe"}${l.suffix}${d + 1}`;
      const a = joint(prefix + "Base", pts[0], j2, "digit", pts[1]);
      const c = joint(prefix + "Middle", pts[1], a, "digit", pts[2]);
      const e = joint(prefix + "Tip", pts[2], c, "digit");
      return { side, pts, joints: [a, c, e], count: d === 0 ? 3 : 2 };
    });
    return { ...l, wood, p, joints: [j0, j1, j2], digits };
  });

  const tailPoints: THREE.Vector3[] = [
    new THREE.Vector3(0, 0.196, -0.123),
    new THREE.Vector3(0, 0.187, -0.131)
  ];
  const coilSamples = 43;
  for (let i = 0; i < coilSamples; i++) {
    const t = i / (coilSamples - 1);
    const angle = 0.32 - t * Math.PI * 3.65;
    const r = 0.060 - 0.049 * t;
    tailPoints.push(new THREE.Vector3(
      0.003 * Math.sin(t * Math.PI * 0.8),
      0.153 + Math.sin(angle) * r,
      -0.193 + Math.cos(angle) * r
    ));
  }
  const tail = b.chain("tail", tailPoints, { parent: hips, role: "tail" });
  const tailRadii = tailPoints.map((_, i) =>
    0.00125 + 0.0106 * Math.pow(1 - i / (tailPoints.length - 1), 1.15)
  );

  // Small reusable primitives. Every mesh is registered with the builder.
  function meshFrom(verts: THREE.Vector3[], indices: number[]) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts.flatMap(p => [p.x, p.y, p.z]), 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }

  function worldPart(g: THREE.BufferGeometry, color: string, bone: any) {
    return b.part(g, color, { at: [0, 0, 0], bone });
  }

  function rod(a0: number[] | THREE.Vector3, b0: number[] | THREE.Vector3, ra: number, rb: number, color: string, bone: any, sides = 7) {
    const a = V(a0), q = V(b0);
    const d = q.clone().sub(a);
    return b.part(new THREE.CylinderGeometry(rb, ra, d.length(), sides, 1), color, {
      at: a.clone().add(q).multiplyScalar(0.5), dir: d, bone
    });
  }

  function tubeRings(points: THREE.Vector3[], radii: number[], sides: number) {
    return points.map((p, i) => {
      const tangent = points[Math.min(points.length - 1, i + 1)].clone()
        .sub(points[Math.max(0, i - 1)]).normalize();
      const u = new THREE.Vector3(1, 0, 0);
      u.addScaledVector(tangent, -u.dot(tangent)).normalize();
      const v = new THREE.Vector3().crossVectors(tangent, u).normalize();
      return Array.from({ length: sides }, (_, k) => {
        const a = k / sides * Math.PI * 2;
        return p.clone()
          .addScaledVector(u, Math.cos(a) * radii[i])
          .addScaledVector(v, Math.sin(a) * radii[i]);
      });
    });
  }

  function tubeGeometry(rings: THREE.Vector3[][], cap = true) {
    const n = rings[0].length;
    const verts = rings.flat().map(p => p.clone());
    const ix: number[] = [];
    for (let i = 0; i < rings.length - 1; i++) {
      for (let k = 0; k < n; k++) {
        const a = i * n + k, c = i * n + (k + 1) % n;
        const d = (i + 1) * n + k, e = (i + 1) * n + (k + 1) % n;
        ix.push(a, c, d, c, e, d);
      }
    }
    if (cap) {
      const start = rings[0].reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / n);
      const end = rings[rings.length - 1].reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / n);
      const si = verts.length;
      verts.push(start, end);
      for (let k = 0; k < n; k++) {
        ix.push(si, (k + 1) % n, k);
        const e = (rings.length - 1) * n;
        ix.push(si + 1, e + k, e + (k + 1) % n);
      }
    }
    return meshFrom(verts, ix);
  }

  // A crooked, grounded twig with angular bark and genuinely cut ends.
  const twigRings = tubeRings(twigPoints, twigRadii, 7);
  const twig = worldPart(tubeGeometry(twigRings), C.bark, root);
  const twigSurface = b.surface(twig);

  for (const face of [1, 3, 5]) {
    const verts: THREE.Vector3[] = [];
    const ix: number[] = [];
    for (let i = 0; i < twigRings.length; i++) {
      const center = twigPoints[i];
      for (const k of [face, (face + 1) % 7]) {
        verts.push(twigRings[i][k].clone().sub(center).multiplyScalar(1.008).add(center));
      }
      if (i) {
        const j = (i - 1) * 2;
        ix.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);
      }
    }
    worldPart(meshFrom(verts, ix), face === 3 ? C.barkDark : C.barkLight, root);
  }

  function branch(points: number[][], radii: number[]) {
    const pts = points.map(V);
    const part = worldPart(tubeGeometry(tubeRings(pts, radii, 6)), C.bark, root);
    const end = pts[pts.length - 1];
    const dir = end.clone().sub(pts[pts.length - 2]).normalize();
    const r = radii[radii.length - 1];
    b.part(new THREE.CylinderGeometry(r * 0.94, r * 0.94, 0.0006, 7), C.wood, {
      at: end.clone().addScaledVector(dir, 0.0003), dir, bone: root
    });
    return part;
  }

  branch([[0.005, 0.088, 0.085], [0.059, 0.043, 0.160], [0.115, 0.005, 0.226]], [0.007, 0.0055, 0.0036]);
  branch([[-0.004, 0.054, -0.185], [-0.054, 0.025, -0.154], [-0.088, 0.004, -0.111]], [0.0067, 0.0045, 0.0028]);
  branch([[0.005, 0.087, 0.046], [-0.021, 0.108, 0.073], [-0.036, 0.126, 0.084]], [0.0048, 0.0030, 0.0017]);

  const twigEnd = twigPoints[twigPoints.length - 1];
  const twigEndDir = twigEnd.clone().sub(twigPoints[twigPoints.length - 2]).normalize();
  b.part(new THREE.CylinderGeometry(0.00435, 0.00435, 0.0007, 7), C.woodLight, {
    at: twigEnd.clone().addScaledVector(twigEndDir, 0.0004), dir: twigEndDir, bone: root
  });
  for (const r of [0.0014, 0.0030]) {
    const ringGeo = new THREE.TorusGeometry(r, 0.00023, 3, 10).rotateX(Math.PI / 2);
    b.part(ringGeo, C.barkLight, {
      at: twigEnd.clone().addScaledVector(twigEndDir, 0.00085), dir: twigEndDir, bone: root
    });
  }

  for (let i = 0; i < 22; i++) {
    const z = -0.275 + i * 0.0252;
    const p = twigAt(z);
    const h = twigSurface.ray([p.x + Math.sin(i * 2.8) * 0.005, 0.4, z], [0, -1, 0]);
    if (!h) continue;
    b.stick(new THREE.BoxGeometry(0.0011, 0.00055, 0.010 + (i % 3) * 0.003), i % 3 === 0 ? C.wood : C.barkDark, h);
    if (i % 3 === 1) {
      b.stick(new THREE.DodecahedronGeometry(0.0032, 0).scale(1, 0.23, 0.8), C.lichen, h);
    }
  }
  for (let i = 0; i < 9; i++) {
    const z = -0.22 + i * 0.057;
    const p = twigAt(z);
    const h = twigSurface.ray([p.x + 0.08, p.y + 0.003, z], [-1, 0, 0]);
    if (h) b.stick(new THREE.DodecahedronGeometry(0.0023, 0).scale(1, 0.35, 1.2), C.lichenDark, h);
  }

  // A simple compressed, leaf-shaped body. Closely matched colored sphere
  // sectors provide a real three-dimensional turquoise-to-orange transition.
  b.sweep([hips, spine, neck], 0.023, { color: bodyColors[5] });
  const bodyGeo = new THREE.SphereGeometry(1, 20, 28)
    .rotateX(Math.PI / 2).scale(bodyR.x, bodyR.y, bodyR.z);
  const body = b.part(bodyGeo, bodyColors[6], { at: bodyCenter, bone: spine });
  const bodySurface = b.surface(body);

  for (let i = 0; i < bodyColors.length; i++) {
    const theta = i / bodyColors.length * Math.PI;
    const g = new THREE.SphereGeometry(1, 20, 2, 0, Math.PI * 2, theta, Math.PI / bodyColors.length)
      .rotateX(Math.PI / 2)
      .scale(bodyR.x * 1.0015, bodyR.y * 1.0015, bodyR.z * 1.0015);
    b.part(g, bodyColors[i], { at: bodyCenter, bone: spine });
  }

  function bodyHit(side: number, y: number, z: number) {
    return bodySurface.ray([side * 0.2, y, z], [-side, 0, 0]);
  }

  function sidePoint(side: number, y: number, z: number, lift: number) {
    const h = bodyHit(side, y, z);
    if (!h) return new THREE.Vector3(side * 0.001, y, z);
    return lerp(h, h, 0).add(new THREE.Vector3(side * lift, 0, 0));
  }

  const barCenters = [-0.089, -0.052, -0.012, 0.027, 0.062];
  function barZ(center: number, angle: number, index: number, side: number) {
    return center + 0.0045 * Math.sin(angle * 2.5 + index * 0.8 + side * 0.3) + angle * 0.002;
  }
  function barMesh(side: number, center: number, width: number, index: number, lift: number) {
    const verts: THREE.Vector3[] = [], ix: number[] = [];
    const n = 13;
    for (let j = 0; j <= n; j++) {
      const angle = -1.05 + j / n * 2.31;
      const zmid = barZ(center, angle, index, side);
      const w = width * (0.85 + 0.15 * Math.cos(j * 1.7 + index));
      for (const edge of [-1, 1]) {
        const z = zmid + edge * w / 2;
        const rr = Math.sqrt(Math.max(0.001, 1 - Math.pow((z - bodyCenter.z) / bodyR.z, 2)));
        const y = bodyCenter.y + bodyR.y * rr * Math.sin(angle);
        verts.push(sidePoint(side, y, z, lift));
      }
      if (j) {
        const k = (j - 1) * 2;
        ix.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    if (side < 0) {
      for (let i = 0; i < ix.length; i += 3) [ix[i + 1], ix[i + 2]] = [ix[i + 2], ix[i + 1]];
    }
    return meshFrom(verts, ix);
  }

  for (const side of [-1, 1]) {
    barCenters.forEach((center, i) => {
      worldPart(barMesh(side, center, 0.014, i, 0.00024), C.redDark, spine);
      worldPart(barMesh(side, center, 0.0107, i, 0.00038), C.red, spine);
    });
  }

  const stripeY = (z: number) =>
    bodyCenter.y - 0.008 + 0.040 * (z - bodyCenter.z) + 0.0013 * Math.sin(z * 55);

  for (const side of [-1, 1]) {
    const verts: THREE.Vector3[] = [], ix: number[] = [];
    for (let i = 0; i <= 31; i++) {
      const t = i / 31, z = -0.111 + 0.201 * t;
      const width = 0.0064 * Math.min(1, 0.35 + Math.sin(Math.PI * t) * 1.8);
      const rag = 0.0005 * Math.sin(i * 2.2);
      verts.push(sidePoint(side, stripeY(z) - width / 2 + rag, z, 0.00065));
      verts.push(sidePoint(side, stripeY(z) + width / 2 + rag, z, 0.00065));
      if (i) {
        const k = (i - 1) * 2;
        ix.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    if (side > 0) {
      for (let i = 0; i < ix.length; i += 3) [ix[i + 1], ix[i + 2]] = [ix[i + 2], ix[i + 1]];
    }
    worldPart(meshFrom(verts, ix), C.white, spine);
  }

  // Sparse raised polygonal scales, seated on the actual body rather than
  // floating on an approximate ellipsoid.
  const scaleGeo = new THREE.SphereGeometry(1, 5, 3).scale(0.00135, 0.00047, 0.00165);
  for (const side of [-1, 1]) {
    for (let row = 0; row < 7; row++) {
      const angle = -0.99 + row * 0.335;
      for (let col = 0; col < 18; col++) {
        const z = -0.103 + col * 0.0108 + (row % 2) * 0.0048;
        const rr = Math.sqrt(Math.max(0, 1 - Math.pow((z - bodyCenter.z) / bodyR.z, 2)));
        const y = bodyCenter.y + bodyR.y * rr * Math.sin(angle);
        if (Math.abs(y - stripeY(z)) < 0.005) continue;
        const h = bodyHit(side, y, z);
        if (!h) continue;
        const onBar = barCenters.some((c, k) => Math.abs(z - barZ(c, angle, k, side)) < 0.0066);
        let color = z > 0.035 ? C.turquoiseLight : z < -0.070 ? C.orange : C.yellow;
        if ((row + col) % 4 === 0) color = z > 0.025 ? C.teal : C.lime;
        if (onBar) color = (row + col) % 3 ? C.redLight : C.redDark;
        b.stick(scaleGeo, color, h);
      }
    }
  }

  // Finely serrated dorsal ridge.
  for (let i = 0; i < 20; i++) {
    const z = -0.106 + i * 0.0096;
    const h = bodySurface.ray([0, 0.5, z], [0, -1, 0]);
    if (!h) continue;
    const height = 0.0038 + 0.0024 * Math.sin((i + 1) / 21 * Math.PI);
    b.stick(new THREE.ConeGeometry(0.0026, height, 4), i < 6 ? C.orange : C.yellow, h);
  }

  // The tail is a continuous spiral of matching low-poly tube sections.
  // Each section inherits the corresponding animated tail-chain frame.
  b.sweep(tail, 0.00115, { color: C.orangeDeep });
  const tailRings = tubeRings(tailPoints, tailRadii, 9);
  const distances = [0];
  for (let i = 1; i < tailPoints.length; i++) {
    distances.push(distances[i - 1] + tailPoints[i].distanceTo(tailPoints[i - 1]));
  }
  const totalTailLength = distances[distances.length - 1];
  for (let i = 0; i < tailPoints.length - 1; i++) {
    const t = (distances[i] + distances[i + 1]) * 0.5 / totalTailLength;
    const at = tail.at(t);
    const center = lerp(at, at, 0);
    const rings = [tailRings[i], tailRings[i + 1]].map(r => r.map(p => p.clone().sub(center)));
    let color = t < 0.32 ? C.orange : t < 0.65 ? C.orangeMid : t < 0.87 ? C.orangeDeep : C.coral;
    if (i > 2 && i % 8 === 4) color = C.coral;
    b.part(tubeGeometry(rings, i === 0 || i === tailPoints.length - 2), color, { at });
  }

  // Angular skull and a separate, hinged lower jaw.
  const headStations = [
    { z: 0.055, w: 0.019, lo: 0.219, hi: 0.255 },
    { z: 0.082, w: 0.031, lo: 0.219, hi: 0.270 },
    { z: 0.118, w: 0.031, lo: 0.219, hi: 0.263 },
    { z: 0.150, w: 0.022, lo: 0.217, hi: 0.244 },
    { z: 0.174, w: 0.006, lo: 0.216, hi: 0.228 }
  ];

  function jawHull(lower: boolean) {
    const rings = headStations.map(s => {
      const w = s.w * (lower ? 0.96 : 1);
      const lo = lower ? s.lo - 0.010 : s.lo;
      const hi = lower ? s.lo - 0.0015 : s.hi;
      const chamfer = lower ? 0.002 : Math.min(0.007, (hi - lo) * 0.35);
      return [
        new THREE.Vector3(-w, lo + 0.002, s.z),
        new THREE.Vector3(-w, hi - chamfer, s.z),
        new THREE.Vector3(-w * 0.55, hi, s.z),
        new THREE.Vector3(w * 0.55, hi, s.z),
        new THREE.Vector3(w, hi - chamfer, s.z),
        new THREE.Vector3(w, lo + 0.002, s.z)
      ];
    });
    return tubeGeometry(rings);
  }

  const skull = worldPart(jawHull(false), C.turquoise, head);
  const lowerJaw = worldPart(jawHull(true), C.mint, jaw);
  const skullSurface = b.surface(skull);
  const lowerSurface = b.surface(lowerJaw);

  for (const side of [-1, 1]) {
    for (let i = 0; i < headStations.length - 1; i++) {
      const a = headStations[i], q = headStations[i + 1];
      rod([side * a.w, a.lo - 0.0003, a.z], [side * q.w, q.lo - 0.0003, q.z],
        0.0008, 0.0008, C.deepTeal, head, 5);
    }
    // Cream lip corner extends the flank stripe naturally into the face.
    rod([side * 0.028, 0.223, 0.079], [side * 0.0305, 0.2225, 0.119],
      0.0019, 0.0013, C.cream, head, 6);
    const nostril = skullSurface.ray([side * 0.1, 0.233, 0.157], [-side, 0, 0]);
    if (nostril) b.stick(new THREE.SphereGeometry(1, 7, 4).scale(0.00155, 0.00055, 0.0010), C.deepTeal, nostril);

    for (let i = 0; i < 10; i++) {
      const z = 0.069 + i * 0.009;
      const y = 0.230 + 0.003 * Math.sin(i * 1.8);
      const h = skullSurface.ray([side * 0.1, y, z], [-side, 0, 0]);
      if (h) b.stick(scaleGeo, i % 3 === 0 ? C.teal : C.turquoiseLight, h);
      if (i % 2 === 0) {
        const jh = lowerSurface.ray([side * 0.1, 0.214, z], [-side, 0, 0]);
        if (jh) b.stick(scaleGeo, C.cream, jh);
      }
    }
  }

  // The casque is a faceted wedge, not a smooth horn.
  const casqueOutline = [
    { z: 0.060, y: 0.244, w: 0.014 },
    { z: 0.071, y: 0.299, w: 0.0045 },
    { z: 0.133, y: 0.260, w: 0.009 },
    { z: 0.150, y: 0.232, w: 0.013 }
  ];
  const casqueVerts: THREE.Vector3[] = [];
  for (const side of [-1, 1]) {
    casqueOutline.forEach(p => casqueVerts.push(new THREE.Vector3(side * p.w, p.y, p.z)));
  }
  worldPart(meshFrom(casqueVerts, [
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7,
    0, 1, 4, 1, 5, 4, 1, 2, 5, 2, 6, 5,
    2, 3, 6, 3, 7, 6, 3, 0, 7, 0, 4, 7
  ]), C.teal, head);

  for (const side of [-1, 1]) {
    rod([side * 0.014, 0.245, 0.061], [side * 0.0045, 0.298, 0.071],
      0.0017, 0.0015, C.turquoiseLight, head, 5);
    rod([side * 0.0047, 0.298, 0.071], [side * 0.0093, 0.260, 0.133],
      0.0016, 0.0010, C.lime, head, 5);
  }
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const p = new THREE.Vector3(0, 0.299 - 0.039 * t, 0.071 + 0.062 * t);
    const h = 0.0035 + 0.0015 * Math.sin(t * Math.PI);
    b.part(new THREE.ConeGeometry(0.0023, h, 4), i < 3 ? C.yellow : C.turquoiseLight, {
      at: p.add(new THREE.Vector3(0, h * 0.5, 0)), bone: head
    });
  }
  for (let i = 0; i < 7; i++) {
    const z = 0.094 + i * 0.0087;
    b.part(new THREE.ConeGeometry(0.0017, 0.0037, 4), C.cream, {
      at: [0, 0.207 - i * 0.00035, z], dir: [0, -1, 0], bone: jaw
    });
  }

  // Turret eyes: their apertures really point in different directions.
  for (const e of eyeData) {
    const turret = b.part(
      new THREE.SphereGeometry(1, 12, 8).scale(0.020, 0.0215, 0.024),
      C.turquoise,
      { at: e.p, bone: e.bone }
    );
    const surface = b.surface(turret);
    const origin = e.p.clone().addScaledVector(e.gaze, 0.085);
    const back = e.gaze.clone().negate();
    const hit = surface.ray(origin, back);
    if (!hit) continue;

    const rim = b.stick(new THREE.CylinderGeometry(0.0100, 0.0112, 0.0014, 12), C.lime, hit);
    const rimHit = b.surface(rim).ray(origin, back);
    if (rimHit) {
      const iris = b.stick(new THREE.CylinderGeometry(0.0069, 0.0075, 0.0010, 12), C.iris, rimHit);
      const irisHit = b.surface(iris).ray(origin, back);
      if (irisHit) {
        const pupil = b.stick(new THREE.CylinderGeometry(0.0038, 0.0040, 0.0008, 12), C.pupil, irisHit);
        const pupilOrigin = origin.clone().add(new THREE.Vector3(0, 0.0017, 0.0007));
        const glint = b.surface(pupil).ray(pupilOrigin, back);
        if (glint) b.stick(new THREE.SphereGeometry(0.00082, 6, 4), C.white, glint);
      }
    }

    const u = new THREE.Vector3().crossVectors(e.gaze, new THREE.Vector3(0, 1, 0)).normalize();
    const v = new THREE.Vector3().crossVectors(u, e.gaze).normalize();
    for (let i = 0; i < 13; i++) {
      const a = i / 13 * Math.PI * 2;
      const d = e.gaze.clone().multiplyScalar(0.70)
        .addScaledVector(u, Math.cos(a) * 0.72)
        .addScaledVector(v, Math.sin(a) * 0.72).normalize();
      const h = surface.ray(e.p.clone().addScaledVector(d, 0.08), d.clone().negate());
      if (h) b.stick(new THREE.SphereGeometry(1, 5, 3).scale(0.0017, 0.0006, 0.0020),
        i % 3 ? C.turquoiseLight : C.teal, h);
    }
  }

  // Splayed limbs and split mittens leave the silhouette and rig readable.
  for (const l of legs) {
    const color = l.front ? C.turquoise : C.lime;
    b.sweep(l.joints, l.front ? 0.0073 : 0.0080, { color });
    rod(l.p[0], l.p[1], l.front ? 0.0104 : 0.0120, 0.0082, color, l.joints[0], 7);

    const upperDirection = l.p[1].clone().sub(l.p[0]).normalize();
    const bandCenter = l.p[0].clone().lerp(l.p[1], 0.57);
    b.part(new THREE.CylinderGeometry(0.0096, 0.0100, 0.005, 7), C.red, {
      at: bandCenter, dir: upperDirection, bone: l.joints[0]
    });

    const palm = new THREE.Vector3(l.wood.x + l.side * 0.006, l.wood.y + 0.014, l.z);
    b.part(new THREE.SphereGeometry(1, 8, 5).scale(0.012, 0.008, 0.014),
      l.front ? C.turquoiseLight : C.yellow, { at: palm, bone: l.joints[2] });

    for (const d of l.digits) {
      b.sweep(d.joints, 0.0048, { color: l.front ? C.turquoiseLight : C.lime });
      for (let k = 0; k < d.count; k++) {
        const zOffset = (k - (d.count - 1) / 2) * 0.0031;
        const tip = d.pts[2].clone().add(new THREE.Vector3(0, 0, zOffset));
        const clawEnd = tip.clone().add(new THREE.Vector3(-d.side * 0.0028, 0.0020, 0.0012));
        rod(tip, clawEnd, 0.0010, 0.00015, C.cream, d.joints[2], 5);
      }
      for (let k = 1; k < d.count; k++) {
        const zz = (k - d.count / 2) * 0.0031;
        const a = d.pts[1].clone().add(new THREE.Vector3(d.side * 0.0044, 0.001, zz));
        const q = d.pts[2].clone().lerp(d.pts[1], 0.34)
          .add(new THREE.Vector3(d.side * 0.0037, 0, zz));
        rod(a, q, 0.00033, 0.00024, C.deepTeal, d.joints[1], 4);
      }
    }

    // Raised knee/elbow scales without obscuring the joint.
    for (let i = 0; i < 3; i++) {
      const p = l.p[1].clone().lerp(l.p[0], 0.12 + i * 0.17);
      p.x += l.side * 0.0088;
      b.part(new THREE.DodecahedronGeometry(0.0021, 0).scale(0.5, 1, 1),
        l.front ? C.turquoiseLight : C.yellow, { at: p, bone: l.joints[0] });
    }
  }

  return b.root;
}
