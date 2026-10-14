```ts
import * as THREE from "three";
import { createBuilder, frame, catmull, rng } from "agentic-3js-builder";

export const meta = {
  name: "Pip, the Startled Pufferfish",
  description:
    "A thoroughly puffed-up, leopard-spotted little pufferfish, with worried saucer eyes, a tiny pout, ivory prickles, scalloped fins, and a rising trail of bubbles."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "startled-pufferfish" });
  const random = rng(48173);

  const C = new THREE.Vector3(0, 0.252, 0);
  const RX = 0.234;
  const RY = 0.235;
  const RZ = 0.222;

  const P = {
    skin: "#f4d58e",
    crown: "#ecc277",
    cream: "#fae3af",
    pale: "#fff0d0",
    ivory: "#fff6e4",
    belly: "#fffaf1",
    brown: "#76502e",
    fadedBrown: "#a17b49",
    spotCenter: "#d9b16b",
    freckle: "#94683a",
    spine: "#fff8dc",
    spineBase: "#d1ad6e",
    paleSpineBase: "#eee1ba",
    socket: "#d9b87b",
    eyeWhite: "#fffff5",
    irisEdge: "#435856",
    iris: "#648e92",
    pupil: "#172b30",
    white: "#ffffff",
    lid: "#dfbf83",
    brow: "#855c34",
    lip: "#d5a376",
    lowerLip: "#e5b98f",
    mouth: "#50372b",
    tongue: "#c88d79",
    finA: "#efd393",
    finB: "#f8e5b5",
    finEdge: "#c49a55",
    finRay: "#fff1ce",
    bubble: "#a8dbe7",
    bubbleRim: "#bfe9ed",
    bubbleGlint: "#eeffff"
  };

  function ellipsoidNormal(u: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(u.x / RX, u.y / RY, u.z / RZ).normalize();
  }

  function ballPoint(u: THREE.Vector3, lift = 0): THREE.Vector3 {
    const p = new THREE.Vector3(RX * u.x, RY * u.y, RZ * u.z).add(C);
    if (lift !== 0) p.addScaledVector(ellipsoidNormal(u), lift);
    return p;
  }

  function direction(theta: number, phi: number): THREE.Vector3 {
    return new THREE.Vector3(
      Math.sin(theta) * Math.sin(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.cos(phi)
    );
  }

  function sphereGeometry(
    x: number,
    y: number,
    z: number,
    width = 20,
    height = 12
  ): THREE.SphereGeometry {
    const g = new THREE.SphereGeometry(1, width, height);
    g.scale(x, y, z);
    return g;
  }

  function frontPoint(x: number, y: number): THREE.Vector3 {
    const rest = 1 - (x / RX) ** 2 - ((y - C.y) / RY) ** 2;
    return new THREE.Vector3(x, y, RZ * Math.sqrt(Math.max(0, rest)));
  }

  // Skeleton first. The inflated trunk is deliberately a single rigid balloon.
  const core = b.joint("spine", {
    at: C,
    dir: [0, 0, 1],
    role: "spine"
  });
  const head = b.joint("head", {
    parent: core,
    at: C.clone().add(new THREE.Vector3(0, 0, 0.15)),
    dir: [0, 0, 1],
    role: "head"
  });

  const eyes = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const u = new THREE.Vector3(s * 0.44, 0.38, 0.814).normalize();
    const center = ballPoint(u).addScaledVector(ellipsoidNormal(u), 0.020);
    const axis = new THREE.Vector3(s * 0.16, 0.09, 0.983).normalize();
    const right = new THREE.Vector3(1, 0, -axis.x / axis.z).normalize();
    const up = new THREE.Vector3().crossVectors(axis, right).normalize();
    const bone = b.joint(`eye${side}`, {
      parent: head,
      at: center,
      dir: axis,
      role: "head"
    });
    return { s, side, center, axis, right, up, bone };
  });

  const mouthY = C.y - 0.031;
  const mouthSurface = frontPoint(0, mouthY);
  const mouthCenter = mouthSurface.clone().add(new THREE.Vector3(0, 0, 0.019));
  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: mouthSurface,
    dir: [0, 0, 1],
    role: "jaw"
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: mouthSurface.clone().add(new THREE.Vector3(0, -0.004, 0)),
    dir: [0, 0, 1],
    role: "jaw"
  });

  const fins = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const base = new THREE.Vector3(s * 0.226, C.y + 0.004, 0.016);
    const tip = base.clone().add(new THREE.Vector3(s * 0.120, 0, 0.022));
    const bone = b.joint(`fin${side}`, {
      parent: core,
      at: base,
      aim: tip,
      role: "fan"
    });
    b.joint(`finTip${side}`, {
      parent: bone,
      at: tip,
      dir: [s, 0, 0],
      role: "fan"
    });
    return { s, base, bone };
  });

  const tailBase = C.clone().add(new THREE.Vector3(0, 0, -0.200));
  const tailStem = C.clone().add(new THREE.Vector3(0, 0, -0.267));
  const tailEnd = tailStem.clone().add(new THREE.Vector3(0, 0, -0.110));
  const tail0 = b.joint("tail0", {
    parent: core,
    at: tailBase,
    aim: tailStem,
    role: "tail"
  });
  const tail1 = b.joint("tail1", {
    parent: tail0,
    at: tailStem,
    aim: tailEnd,
    role: "tail"
  });
  const tailFan = b.joint("tailFan", {
    parent: tail1,
    at: tailStem,
    dir: [0, 0, -1],
    role: "fan"
  });
  b.joint("tail2", {
    parent: tailFan,
    at: tailEnd,
    dir: [0, 0, -1],
    role: "tail"
  });

  // Simple round body, with broad, progressively lighter latitude bands.
  const body = b.part(new THREE.SphereGeometry(1, 32, 24), P.skin, {
    at: C,
    scale: [RX, RY, RZ],
    bone: core
  });
  const bodySurface = b.surface(body);

  const bands = [
    { start: 0, end: 8, color: P.crown },
    { start: 12, end: 14, color: P.cream },
    { start: 14, end: 16, color: P.pale },
    { start: 16, end: 18, color: P.ivory },
    { start: 18, end: 24, color: P.belly }
  ];
  for (const band of bands) {
    const g = new THREE.SphereGeometry(
      1,
      32,
      band.end - band.start,
      0,
      Math.PI * 2,
      (band.start / 24) * Math.PI,
      ((band.end - band.start) / 24) * Math.PI
    );
    b.part(g, band.color, {
      at: C,
      scale: [RX * 1.0008, RY * 1.0008, RZ * 1.0008],
      bone: core
    });
  }

  // Curved, polygonal pigment patches: broken brown rosettes rather than dots.
  // Their vertices follow the same spheroid as the body.
  function pigmentGeometry(
    theta: number,
    phi: number,
    radius: number,
    ring: boolean,
    seedPhase: number,
    missing: number[],
    stretchX: number,
    stretchY: number
  ): THREE.BufferGeometry {
    const u = direction(theta, phi);
    const tangentX = new THREE.Vector3(Math.cos(phi), 0, -Math.sin(phi));
    const tangentY = new THREE.Vector3(
      Math.cos(theta) * Math.sin(phi),
      -Math.sin(theta),
      Math.cos(theta) * Math.cos(phi)
    );
    const vertices: number[] = [];
    const n = 14;

    function sample(angle: number, r: number): THREE.Vector3 {
      const d = u
        .clone()
        .addScaledVector(tangentX, (Math.cos(angle) * r * stretchX) / RX)
        .addScaledVector(tangentY, (Math.sin(angle) * r * stretchY) / RY)
        .normalize();
      return ballPoint(d, 0.00055).sub(C);
    }

    function outerRadius(a: number): number {
      return radius * (
        1 +
        0.105 * Math.sin(a * 3 + seedPhase) +
        0.070 * Math.cos(a * 5 - seedPhase)
      );
    }

    function pushTriangle(a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3) {
      vertices.push(a.x, a.y, a.z, bb.x, bb.y, bb.z, c.x, c.y, c.z);
    }

    const center = sample(0, 0);
    for (let i = 0; i < n; i++) {
      if (ring && missing.includes(i)) continue;
      const a = (i / n) * Math.PI * 2;
      const next = ((i + 1) / n) * Math.PI * 2;
      const outerA = sample(a, outerRadius(a));
      const outerB = sample(next, outerRadius(next));
      if (ring) {
        const innerA = sample(a, radius * (0.54 + 0.05 * Math.sin(a * 4)));
        const innerB = sample(next, radius * (0.54 + 0.05 * Math.sin(next * 4)));
        pushTriangle(outerA, innerA, outerB);
        pushTriangle(outerB, innerA, innerB);
      } else {
        pushTriangle(center, outerA, outerB);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    // Reverse the winding when necessary: pigment must face outwards.
    const pos = g.getAttribute("position");
    const a = new THREE.Vector3().fromBufferAttribute(pos, 0);
    const bb = new THREE.Vector3().fromBufferAttribute(pos, 1);
    const c = new THREE.Vector3().fromBufferAttribute(pos, 2);
    const normal = bb.clone().sub(a).cross(c.clone().sub(a));
    if (normal.dot(u) < 0) {
      for (let i = 0; i < pos.count; i += 3) {
        const v1 = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
        const v2 = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
        pos.setXYZ(i + 1, v2.x, v2.y, v2.z);
        pos.setXYZ(i + 2, v1.x, v1.y, v1.z);
      }
      g.computeVertexNormals();
    }
    return g;
  }

  function faceClearance(p: THREE.Vector3): boolean {
    if (p.z < 0.105) return false;
    if (Math.abs(p.x) < 0.053 && p.y > 0.175 && p.y < 0.405) return true;
    for (const eye of eyes) {
      const dx = p.x - eye.center.x;
      const dy = p.y - eye.center.y;
      if (dx * dx + dy * dy < 0.077 * 0.077) return true;
    }
    if (Math.abs(p.x) < 0.175 && p.y > 0.401 && p.y < 0.443) return true;
    return false;
  }

  const spotRows = [
    { theta: 0.34, count: 6 },
    { theta: 0.65, count: 11 },
    { theta: 0.92, count: 14 },
    { theta: 1.18, count: 16 },
    { theta: 1.43, count: 17 },
    { theta: 1.66, count: 15 }
  ];
  spotRows.forEach((row, rowIndex) => {
    for (let i = 0; i < row.count; i++) {
      const theta = row.theta + (random() - 0.5) * 0.07;
      const phi =
        (i / row.count) * Math.PI * 2 +
        rowIndex * 0.43 +
        (random() - 0.5) * 0.13;
      const p = ballPoint(direction(theta, phi));
      if (faceClearance(p)) continue;

      const radius = (0.0115 + random() * 0.0065) * (rowIndex === 5 ? 0.78 : 1);
      const phase = random() * Math.PI * 2;
      const stretchX = 0.84 + random() * 0.28;
      const stretchY = 0.88 + random() * 0.25;
      const solid = random() < 0.22;
      const color = rowIndex === 5 ? P.fadedBrown : P.brown;
      const gap = Math.floor(random() * 14);

      if (!solid) {
        b.part(
          pigmentGeometry(theta, phi, radius * 0.73, false, phase, [], stretchX, stretchY),
          P.spotCenter,
          { at: C, bone: core }
        );
      }
      b.part(
        pigmentGeometry(
          theta,
          phi,
          radius,
          !solid,
          phase,
          solid ? [] : [gap, (gap + 6) % 14],
          stretchX,
          stretchY
        ),
        color,
        { at: C, bone: core }
      );

      if (!solid && random() < 0.33) {
        b.part(
          pigmentGeometry(theta + 0.014, phi - 0.016, radius * 0.18, false, phase, [], 1, 1),
          P.freckle,
          { at: C, bone: core }
        );
      }
    }
  });

  // A few small freckles break up the spaces between the larger rosettes.
  for (let i = 0; i < 25; i++) {
    const theta = 0.40 + random() * 1.17;
    const phi = random() * Math.PI * 2;
    if (faceClearance(ballPoint(direction(theta, phi)))) continue;
    b.part(
      pigmentGeometry(theta, phi, 0.0025 + random() * 0.002, false, random() * 6, [], 1, 0.8),
      P.freckle,
      { at: C, bone: core }
    );
  }

  // Short, chunky five-sided prickles. Surface hits seat every base accurately.
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const spineCount = 174;
  for (let i = 0; i < spineCount; i++) {
    const y = 1 - (2 * (i + 0.5)) / spineCount;
    const phi = i * goldenAngle;
    const u = new THREE.Vector3(
      Math.sqrt(1 - y * y) * Math.sin(phi),
      y,
      Math.sqrt(1 - y * y) * Math.cos(phi)
    );
    const p = ballPoint(u);
    if (faceClearance(p)) continue;

    // Keep the attachment areas of the moving fins unobstructed.
    if (Math.abs(p.x) > 0.211 && Math.abs(p.y - C.y) < 0.032 && Math.abs(p.z - 0.016) < 0.046) {
      continue;
    }
    if (p.z < -0.196 && Math.abs(p.y - C.y) < 0.031) continue;

    const length = u.y < -0.80
      ? 0.0125 + random() * 0.0028
      : 0.016 + random() * 0.008;
    const radius = 0.0045 + random() * 0.0017;
    const hit = bodySurface.nearest(p);

    const collar = new THREE.ConeGeometry(radius * 1.24, 0.005, 5, 1);
    collar.translate(0, 0.0025, 0);
    b.stick(collar, u.y < -0.15 ? P.paleSpineBase : P.spineBase, hit);

    const spike = new THREE.ConeGeometry(radius, length, 5, 1);
    spike.translate(0, length / 2, 0);
    b.stick(spike, P.spine, hit);
  }

  // The lowest little prickle touches y=0.
  const bottomHit = bodySurface.nearest(new THREE.Vector3(0, C.y - RY, 0));
  const bottomSpine = new THREE.ConeGeometry(0.005, C.y - RY, 5, 1);
  bottomSpine.translate(0, (C.y - RY) / 2, 0);
  b.stick(bottomSpine, P.spine, bottomHit);

  // Large round eyes, warm sockets, blue-grey irises, and a slightly inward gaze.
  for (const eye of eyes) {
    const socketCenter = eye.center.clone().addScaledVector(eye.axis, -0.006);
    b.part(sphereGeometry(0.065, 0.065, 0.065, 20, 14), P.socket, {
      at: socketCenter,
      bone: eye.bone
    });
    const whiteCenter = eye.center.clone().addScaledVector(eye.axis, 0.002);
    b.part(sphereGeometry(0.0605, 0.0605, 0.0605, 24, 16), P.eyeWhite, {
      at: whiteCenter,
      bone: eye.bone
    });

    const irisCenter = whiteCenter
      .clone()
      .addScaledVector(eye.axis, 0.053)
      .addScaledVector(eye.right, -eye.s * 0.008)
      .addScaledVector(eye.up, 0.005);

    b.part(sphereGeometry(0.036, 0.009, 0.037, 20, 12), P.irisEdge, {
      frame: frame(irisCenter, eye.axis),
      bone: eye.bone
    });
    b.part(sphereGeometry(0.0325, 0.009, 0.0335, 20, 12), P.iris, {
      frame: frame(irisCenter.clone().addScaledVector(eye.axis, 0.003), eye.axis),
      bone: eye.bone
    });
    const pupilCenter = irisCenter.clone().addScaledVector(eye.axis, 0.010);
    b.part(sphereGeometry(0.0235, 0.006, 0.026, 20, 12), P.pupil, {
      frame: frame(pupilCenter, eye.axis),
      bone: eye.bone
    });

    const gleam = pupilCenter
      .clone()
      .addScaledVector(eye.axis, 0.005)
      .addScaledVector(eye.right, -0.008)
      .addScaledVector(eye.up, 0.012);
    b.part(sphereGeometry(0.0071, 0.0026, 0.0085, 12, 8), P.white, {
      frame: frame(gleam, eye.axis),
      bone: eye.bone
    });
    const gleam2 = pupilCenter
      .clone()
      .addScaledVector(eye.axis, 0.0055)
      .addScaledVector(eye.right, 0.009)
      .addScaledVector(eye.up, -0.009);
    b.part(sphereGeometry(0.0028, 0.0015, 0.003, 10, 6), P.white, {
      frame: frame(gleam2, eye.axis),
      bone: eye.bone
    });

    const lidPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = 0.12 * Math.PI + (i / 10) * 0.76 * Math.PI;
      lidPoints.push(
        whiteCenter
          .clone()
          .addScaledVector(eye.right, Math.cos(a) * 0.057)
          .addScaledVector(eye.up, Math.sin(a) * 0.057)
          .addScaledVector(eye.axis, 0.020)
      );
    }
    b.sweep(catmull(lidPoints), 0.0027, { color: P.lid, bone: eye.bone });

    // High inner ends make the eyebrows worried, not angry.
    const browPoints = [
      frontPoint(eye.s * 0.054, C.y + 0.179),
      frontPoint(eye.s * 0.081, C.y + 0.184),
      frontPoint(eye.s * 0.118, C.y + 0.163),
      frontPoint(eye.s * 0.154, C.y + 0.140)
    ];
    b.sweep(bodySurface.drape(catmull(browPoints)), 0.0047, {
      color: P.brow,
      bone: head
    });
  }

  // A tiny puckered muzzle. Upper and lower lips belong to different jaws.
  b.part(sphereGeometry(0.023, 0.018, 0.011, 16, 10), P.cream, {
    at: mouthCenter.clone().add(new THREE.Vector3(0, 0, -0.010)),
    bone: upperJaw
  });
  b.part(sphereGeometry(0.0129, 0.0088, 0.004, 16, 10), P.mouth, {
    at: mouthCenter,
    bone: upperJaw
  });

  const upperLipGeo = new THREE.TorusGeometry(0.014, 0.0041, 6, 18, Math.PI);
  upperLipGeo.scale(1.08, 0.83, 1);
  b.part(upperLipGeo, P.lip, {
    at: mouthCenter.clone().add(new THREE.Vector3(0, 0, 0.003)),
    bone: upperJaw
  });

  const lowerLipGeo = new THREE.TorusGeometry(0.014, 0.0045, 6, 18, Math.PI);
  lowerLipGeo.rotateZ(Math.PI);
  lowerLipGeo.scale(1.08, 0.83, 1);
  b.part(lowerLipGeo, P.lowerLip, {
    at: mouthCenter.clone().add(new THREE.Vector3(0, -0.001, 0.003)),
    bone: jaw
  });
  b.part(sphereGeometry(0.007, 0.0025, 0.0015, 12, 6), P.tongue, {
    at: mouthCenter.clone().add(new THREE.Vector3(0, -0.0048, 0.004)),
    bone: jaw
  });

  // A triangular prism is a simple, solid primitive for each fan segment.
  function trianglePrism(
    pa: THREE.Vector3,
    pb: THREE.Vector3,
    pc: THREE.Vector3,
    extrusionAxis: THREE.Vector3,
    thickness: number
  ): THREE.BufferGeometry {
    const a = pa.clone();
    let bb = pb.clone();
    let c = pc.clone();
    const n = bb.clone().sub(a).cross(c.clone().sub(a));
    if (n.dot(extrusionAxis) < 0) {
      const temp = bb;
      bb = c;
      c = temp;
    }
    const off = extrusionAxis.clone().multiplyScalar(thickness / 2);
    const points = [
      a.clone().sub(off), bb.clone().sub(off), c.clone().sub(off),
      a.clone().add(off), bb.clone().add(off), c.clone().add(off)
    ];
    const vertices = points.flatMap((p) => [p.x, p.y, p.z]);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex([
      3, 4, 5, 2, 1, 0,
      0, 1, 4, 0, 4, 3,
      1, 2, 5, 1, 5, 4,
      2, 0, 3, 2, 3, 5
    ]);
    const flat = g.toNonIndexed();
    flat.computeVertexNormals();
    g.dispose();
    return flat;
  }

  // Spread pectoral fans: alternating pale panels, scalloped edges and fine rays.
  for (const fin of fins) {
    const s = fin.s;
    const points = [
      new THREE.Vector3(s * 0.078, 0.047, 0.002),
      new THREE.Vector3(s * 0.101, 0.043, 0.012),
      new THREE.Vector3(s * 0.117, 0.020, 0.024),
      new THREE.Vector3(s * 0.121, -0.009, 0.026),
      new THREE.Vector3(s * 0.110, -0.036, 0.015),
      new THREE.Vector3(s * 0.082, -0.047, 0.001)
    ];
    const normal = new THREE.Vector3(0, 0, 1);
    const thickness = 0.003;
    for (let i = 0; i < points.length - 1; i++) {
      b.part(
        trianglePrism(new THREE.Vector3(), points[i], points[i + 1], normal, thickness),
        i % 2 === 0 ? P.finA : P.finB,
        { at: fin.base, bone: fin.bone }
      );
    }

    const edge = points.map((p) => p.clone().add(fin.base));
    b.sweep(catmull(edge), 0.0017, { color: P.finEdge, bone: fin.bone });

    points.forEach((p, i) => {
      const start = fin.base.clone().addScaledVector(normal, thickness / 2);
      const end = p.clone().add(fin.base).addScaledVector(normal, thickness / 2);
      const middle = start.clone().lerp(end, 0.52);
      middle.z += 0.002;
      b.sweep(catmull([start, middle, end]), i % 2 === 0 ? 0.0015 : 0.0011, {
        color: i % 2 === 0 ? P.finRay : P.finEdge,
        bone: fin.bone
      });
    });

    b.part(sphereGeometry(0.014, 0.018, 0.010, 12, 8), P.skin, {
      at: fin.base,
      bone: fin.bone
    });
  }

  // Short caudal peduncle and a vertically spread, scalloped tail fan.
  const stemVector = tailStem.clone().sub(tailBase);
  const stemMid = tailBase.clone().lerp(tailStem, 0.5);
  b.part(
    new THREE.CylinderGeometry(0.013, 0.024, stemVector.length(), 9, 1),
    P.skin,
    { frame: frame(stemMid, stemVector), bone: tail0 }
  );

  const tailPoints = [
    new THREE.Vector3(0, 0.059, -0.055),
    new THREE.Vector3(0, 0.077, -0.090),
    new THREE.Vector3(0, 0.058, -0.105),
    new THREE.Vector3(0, 0.029, -0.100),
    new THREE.Vector3(0, 0, -0.111),
    new THREE.Vector3(0, -0.029, -0.100),
    new THREE.Vector3(0, -0.058, -0.105),
    new THREE.Vector3(0, -0.077, -0.090),
    new THREE.Vector3(0, -0.059, -0.055)
  ];
  const tailNormal = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < tailPoints.length - 1; i++) {
    b.part(
      trianglePrism(new THREE.Vector3(), tailPoints[i], tailPoints[i + 1], tailNormal, 0.005),
      i % 2 === 0 ? P.finB : P.finA,
      { at: tailStem, bone: tailFan }
    );
  }
  b.sweep(catmull(tailPoints.map((p) => p.clone().add(tailStem))), 0.0021, {
    color: P.finEdge,
    bone: tailFan
  });

  for (const p of tailPoints) {
    // Ribs on both sides keep the tail finished from any viewing angle.
    for (const s of [1, -1]) {
      const root = tailStem.clone().add(new THREE.Vector3(s * 0.0025, 0, 0));
      const end = p.clone().add(tailStem).add(new THREE.Vector3(s * 0.0025, 0, 0));
      b.sweep([root, end], 0.0013, {
        color: P.finRay,
        bone: tailFan
      });
    }
  }

  // Four airy bubbles, beginning immediately in front of the little pout.
  const bubbles = [
    { at: new THREE.Vector3(0.015, 0.279, 0.279), r: 0.009 },
    { at: new THREE.Vector3(-0.012, 0.392, 0.312), r: 0.017 },
    { at: new THREE.Vector3(0.004, 0.528, 0.323), r: 0.028 },
    { at: new THREE.Vector3(0.038, 0.655, 0.312), r: 0.023 }
  ];

  for (const bubble of bubbles) {
    const { at, r } = bubble;
    b.part(new THREE.SphereGeometry(r, 16, 12), P.bubble, {
      at,
      bone: core
    });

    // A narrow silhouette rim keeps transparent bubbles legible.
    b.part(new THREE.TorusGeometry(r * 0.953, r * 0.027, 4, 24), P.bubbleRim, {
      at: at.clone().add(new THREE.Vector3(0, 0, r * 0.30)),
      bone: core
    });

    const arcPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 7; i++) {
      const a = Math.PI * (0.48 + (i / 7) * 0.36);
      arcPoints.push(
        at.clone().add(
          new THREE.Vector3(
            Math.cos(a) * r * 0.70,
            Math.sin(a) * r * 0.70,
            r * 0.723
          )
        )
      );
    }
    b.sweep(catmull(arcPoints), r * 0.054, { color: P.white, bone: core });

    b.part(sphereGeometry(r * 0.085, r * 0.11, r * 0.035, 8, 6), P.bubbleGlint, {
      at: at.clone().add(new THREE.Vector3(r * 0.48, -r * 0.42, r * 0.78)),
      bone: core
    });
  }

  // Materials remain builder-shared; only the dedicated bubble and eye colours
  // need different optical properties.
  b.root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      const hex = material.color.getHexString().toLowerCase();
      if (hex === P.bubble.slice(1)) {
        material.transparent = true;
        material.opacity = 0.24;
        material.depthWrite = false;
        material.roughness = 0.10;
        material.metalness = 0.05;
      } else if (hex === P.bubbleRim.slice(1)) {
        material.transparent = true;
        material.opacity = 0.62;
        material.depthWrite = false;
        material.roughness = 0.24;
      } else if (
        hex === P.pupil.slice(1) ||
        hex === P.iris.slice(1) ||
        hex === P.irisEdge.slice(1)
      ) {
        material.roughness = 0.22;
        material.metalness = 0.08;
      } else if (hex === P.eyeWhite.slice(1)) {
        material.roughness = 0.33;
      }
    }
  });

  return b.root;
}
```