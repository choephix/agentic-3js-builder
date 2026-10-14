import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";

export const meta = {
  name: "Sunspike Pufferfish",
  description:
    "A round, honey-gold pufferfish with an ivory belly, prickly quills, spotted skin, jewel-like eyes and boldly ribbed fan fins."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Sunspike Pufferfish" });

  const C = {
    back: "#B39243",
    gold: "#DDB453",
    lightGold: "#ECD18A",
    belly: "#F4E5BA",
    quill: "#FFF0BF",
    quillBase: "#C49B45",
    spot: "#514633",
    softSpot: "#796139",
    fin: "#E7B74F",
    finLight: "#F4D583",
    finPale: "#F9E4A7",
    finRay: "#AC7935",
    finEdge: "#655334",
    socket: "#AC813B",
    white: "#FFF5D8",
    irisRim: "#D49B3A",
    teal: "#318E8A",
    irisLight: "#8CC4AD",
    black: "#142D2E",
    lip: "#C48E59",
    lipLight: "#E0B478",
    mouth: "#3E302A"
  };

  type V = THREE.Vector3;
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const center = v(0, 0.302, 0);
  const radii = v(0.286, 0.302, 0.327);

  function onEllipsoid(d: V): V {
    const n = d.clone().normalize();
    return v(
      center.x + radii.x * n.x,
      center.y + radii.y * n.y,
      center.z + radii.z * n.z
    );
  }

  // All articulation is established before any geometry.
  const roles = new Map<string, string>();
  function joint(name: string, at: V, parent: any, role: string) {
    const j = parent
      ? b.joint(name, { at, parent })
      : b.joint(name, { at });
    roles.set(name, role);
    return j;
  }

  const spine = joint("spine", center, null, "spine");
  const neck = joint("neck", v(0, 0.303, 0.182), spine, "neck");
  const head = joint("head", v(0, 0.306, 0.263), neck, "head");
  const upperJaw = joint("upperJaw", v(0, 0.286, 0.307), head, "jaw");
  const jaw = joint("jaw", v(0, 0.239, 0.304), head, "jaw");

  const eyeDirections = [
    v(0.56, 0.34, 0.755).normalize(),
    v(-0.56, 0.34, 0.755).normalize()
  ];
  const eyePositions = eyeDirections.map(onEllipsoid);
  const eyeBones = [
    joint("eyeL", eyePositions[0], head, "head"),
    joint("eyeR", eyePositions[1], head, "head")
  ];

  const tailPositions = [
    v(0, 0.294, -0.267),
    v(0, 0.294, -0.370),
    v(0, 0.294, -0.472)
  ];
  const tail1 = joint("tail1", tailPositions[0], spine, "tail");
  const tail2 = joint("tail2", tailPositions[1], tail1, "tail");
  const tail3 = joint("tail3", tailPositions[2], tail2, "tail");
  const tailFan = joint("tailFan", v(0, 0.294, -0.510), tail3, "fan");

  const finRoots = [v(0.263, 0.283, 0.055), v(-0.263, 0.283, 0.055)];
  const finBones = [
    joint("finL", finRoots[0], spine, "hinge"),
    joint("finR", finRoots[1], spine, "hinge")
  ];
  joint("finTipL", v(0.458, 0.285, -0.055), finBones[0], "fan");
  joint("finTipR", v(-0.458, 0.285, -0.055), finBones[1], "fan");

  const dorsalRoot = v(0, 0.527, -0.151);
  const analRoot = v(0, 0.106, -0.188);
  const dorsal = joint("dorsalFin", dorsalRoot, spine, "fan");
  joint("dorsalTip", v(0, 0.650, -0.242), dorsal, "fan");
  const anal = joint("analFin", analRoot, spine, "fan");
  joint("analTip", v(0, 0.053, -0.300), anal, "fan");

  function flat(g: THREE.BufferGeometry): THREE.BufferGeometry {
    const result = g.index ? g.toNonIndexed() : g;
    result.computeVertexNormals();
    return result;
  }

  function ellipsoid(rx: number, ry: number, rz: number, segments = 12) {
    return flat(new THREE.SphereGeometry(1, segments, 8).scale(rx, ry, rz));
  }

  function rod(a: V, end: V, radius: number, color: string, bone: any, rEnd = radius) {
    const mid = a.clone().add(end).multiplyScalar(0.5);
    return b.part(
      flat(new THREE.CylinderGeometry(rEnd, radius, a.distanceTo(end), 6)),
      color,
      { at: mid, aim: end, bone }
    );
  }

  // One simple, faceted sphere, divided into contiguous countershaded patches.
  // The pale boundary rises toward the face instead of forming a straight belt.
  const bodySource = new THREE.SphereGeometry(1, 24, 16).toNonIndexed();
  const sourcePositions = bodySource.getAttribute("position");
  const patchVertices: number[][] = [[], [], [], []];
  for (let i = 0; i < sourcePositions.count; i += 3) {
    let cy = 0, cz = 0;
    for (let k = 0; k < 3; k++) {
      cy += sourcePositions.getY(i + k) / 3;
      cz += sourcePositions.getZ(i + k) / 3;
    }
    const shade = cy - 0.36 * cz;
    const patch = shade > 0.55 ? 0 : shade > -0.13 ? 1 : shade > -0.36 ? 2 : 3;
    for (let k = 0; k < 3; k++) {
      patchVertices[patch].push(
        sourcePositions.getX(i + k) * radii.x,
        sourcePositions.getY(i + k) * radii.y,
        sourcePositions.getZ(i + k) * radii.z
      );
    }
  }

  const bodyColors = [C.back, C.gold, C.lightGold, C.belly];
  const bodyParts = patchVertices.map((vertices, i) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    return b.part(g, bodyColors[i], { at: center, bone: spine });
  });
  const skinSurfaces = bodyParts.map(p => b.surface(p));

  function skinHit(direction: V): any {
    const p = onEllipsoid(direction);
    const candidates = skinSurfaces.map(s => s.nearest(p));
    candidates.sort(
      (a, c) => a.position.distanceToSquared(p) - c.position.distanceToSquared(p)
    );
    return candidates[0];
  }

  function faceClear(n: V): boolean {
    if (eyeDirections.some(d => d.dot(n) > 0.915)) return false;
    if (n.z > 0.85 && Math.abs(n.x) < 0.43 && n.y > -0.42 && n.y < 0.30) return false;
    if (n.z < -0.90 && Math.abs(n.y) < 0.21) return false;
    if (Math.abs(n.x) > 0.91 && n.y > -0.22 && n.y < 0.08 && n.z > -0.05) return false;
    if (Math.abs(n.x) < 0.12 && n.z < -0.25 && n.y > 0.65) return false;
    return true;
  }

  // Golden-angle placement is deterministic, but avoids conspicuous latitude rows.
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 157; i++) {
    const y = 1 - 2 * (i + 0.5) / 157;
    const radial = Math.sqrt(1 - y * y);
    const az = i * goldenAngle;
    const n = v(Math.cos(az) * radial, y, Math.sin(az) * radial);
    if (y < -0.66 || !faceClear(n)) continue;

    const hit = skinHit(n);
    const variation = 0.5 + 0.5 * Math.sin(i * 4.71 + 0.6);
    const length = (0.036 + 0.022 * variation) * (n.z > 0.5 ? 0.78 : 1);
    const radius = 0.0105 + variation * 0.005;

    if (i % 3 === 0) {
      b.stick(
        flat(new THREE.CylinderGeometry(radius * 1.65, radius * 1.75, 0.002, 7)),
        C.softSpot,
        hit
      );
    }

    b.stick(flat(new THREE.ConeGeometry(radius, length, 5)), C.quill, hit);
    b.stick(
      flat(new THREE.CylinderGeometry(radius * 0.69, radius, length * 0.31, 5)),
      C.quillBase,
      hit
    );
  }

  // Ink-like, angular skin spots: distinct from the pale quills.
  for (let i = 0; i < 101; i++) {
    const y = 1 - 2 * (i + 0.32) / 101;
    if (y < -0.57) continue;
    const r = Math.sqrt(1 - y * y);
    const angle = i * goldenAngle + 0.88;
    const n = v(r * Math.cos(angle), y, r * Math.sin(angle));
    if (!faceClear(n)) continue;
    const radius = 0.006 + 0.010 * (0.5 + 0.5 * Math.sin(i * 3.13));
    const g = new THREE.CylinderGeometry(radius, radius * 1.03, 0.0018, 7);
    g.scale(1, 1, 0.73 + 0.25 * (0.5 + 0.5 * Math.cos(i * 2.1)));
    b.stick(flat(g), i % 4 === 0 ? C.softSpot : C.spot, skinHit(n));
  }

  // Big outward-set eyes. Every layer is seated on the preceding curved surface.
  eyeBones.forEach((eyeBone, i) => {
    const sign = i === 0 ? 1 : -1;
    const hit = skinHit(eyeDirections[i]);

    b.part(
      ellipsoid(0.077, 0.022, 0.077).translate(0, 0.008, 0),
      C.socket,
      { frame: hit, bone: eyeBone }
    );
    const sclera = b.part(
      ellipsoid(0.068, 0.049, 0.069, 16).translate(0, 0.030, 0),
      C.white,
      { frame: hit, bone: eyeBone }
    );
    const facing = v(sign * 0.36, 0.12, 0.925).normalize();
    const probe = eyePositions[i].clone().addScaledVector(facing, 0.35);
    const scleraHit = b.surface(sclera).nearest(probe);

    const rim = b.stick(ellipsoid(0.048, 0.009, 0.048, 16), C.irisRim, scleraHit);
    const rimHit = b.surface(rim).nearest(probe);
    const iris = b.stick(ellipsoid(0.0418, 0.008, 0.0418, 16), C.teal, rimHit);
    const irisSurface = b.surface(iris);
    const irisHit = irisSurface.nearest(probe);

    const normal = irisHit.axis.clone().normalize();
    const tangent = v(0, 1, 0).cross(normal).normalize();
    const up = normal.clone().cross(tangent).normalize();

    for (let j = 0; j < 12; j++) {
      const angle = j * Math.PI * 2 / 12;
      const p = irisHit.position.clone()
        .addScaledVector(tangent, Math.cos(angle) * 0.0335)
        .addScaledVector(up, Math.sin(angle) * 0.0335);
      b.stick(
        ellipsoid(0.0024, 0.0012, 0.0032, 6),
        j % 3 === 0 ? C.white : C.irisLight,
        irisSurface.nearest(p)
      );
    }

    const pupil = b.stick(ellipsoid(0.027, 0.006, 0.0285, 16), C.black, irisHit);
    const pupilSurface = b.surface(pupil);
    const pupilHit = pupilSurface.nearest(probe);
    const gleamPoint = pupilHit.position.clone()
      .addScaledVector(up, 0.012)
      .addScaledVector(tangent, -0.009);
    b.stick(ellipsoid(0.0082, 0.003, 0.0082, 8), C.white, pupilSurface.nearest(gleamPoint));
    const littleGleam = pupilHit.position.clone()
      .addScaledVector(up, -0.009)
      .addScaledVector(tangent, 0.010);
    b.stick(ellipsoid(0.003, 0.0016, 0.003, 6), C.white, pupilSurface.nearest(littleGleam));
  });

  // Independent upper and lower mouth masses, lips, and pufferfish beak plates.
  const mouthCenter = v(0, 0.266, 0.369);
  b.part(ellipsoid(0.072, 0.041, 0.042), C.lightGold, {
    at: v(0, 0.287, 0.321), bone: upperJaw
  });
  b.part(ellipsoid(0.059, 0.030, 0.037), C.belly, {
    at: v(0, 0.236, 0.329), bone: jaw
  });
  b.part(ellipsoid(0.036, 0.029, 0.009, 16), C.mouth, {
    at: mouthCenter.clone().add(v(0, 0, -0.006)), bone: upperJaw
  });

  const upperLip = flat(
    new THREE.TorusGeometry(0.034, 0.0085, 6, 12, Math.PI).scale(1.1, 0.86, 1)
  );
  const lowerLip = flat(
    new THREE.TorusGeometry(0.034, 0.009, 6, 12, Math.PI)
      .rotateZ(Math.PI).scale(1.1, 0.86, 1)
  );
  b.part(upperLip, C.lip, { at: mouthCenter, bone: upperJaw });
  b.part(lowerLip, C.lipLight, { at: mouthCenter, bone: jaw });

  for (const sign of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.0125, 0.012, 0.008), C.white, {
      at: mouthCenter.clone().add(v(sign * 0.007, 0.013, 0.001)),
      bone: upperJaw
    });
  }
  b.part(new THREE.BoxGeometry(0.021, 0.007, 0.007), C.white, {
    at: mouthCenter.clone().add(v(0, -0.018, 0)),
    bone: jaw
  });

  for (const sign of [-1, 1]) {
    const nostrilHit = skinHit(v(sign * 0.225, 0.16, 0.975));
    const bump = b.stick(ellipsoid(0.010, 0.006, 0.012, 8), C.socket, nostrilHit);
    b.stick(
      ellipsoid(0.004, 0.0018, 0.005, 6),
      C.spot,
      b.surface(bump).nearest(onEllipsoid(v(sign * 0.225, 0.16, 0.975)).add(v(0, 0, 0.1)))
    );
    for (let j = 0; j < 3; j++) {
      b.stick(
        flat(new THREE.CylinderGeometry(0.0047 - j * 0.0007, 0.0047 - j * 0.0007, 0.0015, 6)),
        C.softSpot,
        skinHit(v(sign * (0.34 + j * 0.095), -0.23 - j * 0.035, 0.94))
      );
    }
  }

  // A triangular prism is the deliberately simple building block of each fin.
  function finPanel(a: V, d: V, e: V, thickness: number, color: string, bone: any) {
    const normal = d.clone().sub(a).cross(e.clone().sub(a)).normalize()
      .multiplyScalar(thickness / 2);
    const vertices: number[] = [];
    for (const side of [1, -1]) {
      for (const p of [a, d, e]) {
        const q = p.clone().sub(a).addScaledVector(normal, side);
        vertices.push(q.x, q.y, q.z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex([
      0, 1, 2, 5, 4, 3,
      0, 3, 4, 0, 4, 1,
      1, 4, 5, 1, 5, 2,
      2, 5, 3, 2, 3, 0
    ]);
    return b.part(flat(g), color, { at: a, bone });
  }

  function fan(root: V, edge: V[], bone: any, thickness: number, border = true) {
    for (let i = 0; i < edge.length - 1; i++) {
      finPanel(root, edge[i], edge[i + 1], thickness,
        [C.finLight, C.fin, C.finPale, C.finLight][i % 4], bone);
    }
    edge.forEach(p => rod(root, p, 0.0031, C.finRay, bone, 0.0017));
    if (border) {
      for (let i = 0; i < edge.length - 1; i++) {
        rod(edge[i], edge[i + 1], 0.0034, C.finEdge, bone);
      }
    }
  }

  // The short, jointed caudal peduncle leads to a fully spread tail fan.
  b.sweep([tail1, tail2, tail3], 0.033, { color: C.gold });
  rod(v(0, 0.294, -0.437), v(0, 0.294, -0.455), 0.0345, C.finEdge, tail3);
  rod(v(0, 0.294, -0.456), v(0, 0.294, -0.467), 0.035, C.lightGold, tail3);

  const tailEdge = [
    v(0, 0.447, -0.623),
    v(0, 0.424, -0.674),
    v(0, 0.365, -0.694),
    v(0, 0.294, -0.680),
    v(0, 0.222, -0.694),
    v(0, 0.164, -0.674),
    v(0, 0.141, -0.623)
  ];
  fan(tailPositions[2], tailEdge, tailFan, 0.010);

  // Both faces of the tail carry a small series of puffer-like dark freckles.
  for (const sign of [-1, 1]) {
    [
      [0.409, -0.638, 0.008],
      [0.364, -0.658, 0.009],
      [0.294, -0.650, 0.007],
      [0.224, -0.658, 0.009],
      [0.179, -0.638, 0.008]
    ].forEach(([y, z, r]) => {
      b.part(
        flat(new THREE.CylinderGeometry(r, r, 0.0015, 7)),
        C.spot,
        { frame: frame([sign * 0.0055, y, z], [sign, 0, 0]), bone: tailFan }
      );
    });
  }

  finBones.forEach((bone, i) => {
    const sign = i === 0 ? 1 : -1;
    const root = finRoots[i];
    b.part(ellipsoid(0.031, 0.026, 0.044), C.socket, { at: root, bone });
    b.part(ellipsoid(0.030, 0.022, 0.035), C.lightGold, {
      at: root.clone().add(v(sign * 0.016, 0, 0)), bone
    });

    const edge = [
      v(sign * 0.398, 0.340, 0.041),
      v(sign * 0.450, 0.328, 0.003),
      v(sign * 0.470, 0.294, -0.047),
      v(sign * 0.451, 0.261, -0.095),
      v(sign * 0.411, 0.250, -0.121),
      v(sign * 0.326, 0.257, -0.083)
    ];
    fan(root, edge, bone, 0.005);
    for (let j = 0; j < edge.length - 1; j++) {
      const a = root.clone().lerp(edge[j], 0.82);
      const d = root.clone().lerp(edge[j + 1], 0.82);
      rod(a, d, 0.0023, C.finPale, bone);
    }
  });

  fan(dorsalRoot, [
    v(0, 0.638, -0.188),
    v(0, 0.656, -0.222),
    v(0, 0.650, -0.253),
    v(0, 0.618, -0.286),
    v(0, 0.562, -0.304),
    v(0, 0.494, -0.268)
  ], dorsal, 0.007);

  fan(analRoot, [
    v(0, 0.051, -0.252),
    v(0, 0.036, -0.289),
    v(0, 0.051, -0.323),
    v(0, 0.086, -0.343),
    v(0, 0.158, -0.298)
  ], anal, 0.006);

  b.root.traverse(object => {
    const role = roles.get(object.name);
    if (role) object.userData.role = role;
  });
  b.root.userData.chains = [
    { role: "spine", joints: ["spine", "neck", "head"] },
    { role: "jaw", joints: ["upperJaw", "jaw"] },
    { role: "tail", joints: ["tail1", "tail2", "tail3", "tailFan"] },
    { role: "fan", joints: ["finL", "finTipL"] },
    { role: "fan", joints: ["finR", "finTipR"] },
    { role: "fan", joints: ["dorsalFin", "dorsalTip"] },
    { role: "fan", joints: ["analFin", "analTip"] }
  ];

  return b.root;
}
