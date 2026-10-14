import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Golden Pufferfish",
  description:
    "A plump, golden porcupine puffer with an ivory belly, chocolate freckles, little ivory spines, jewel-like eyes, a puckered beak, and striped, ray-supported fins."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Golden Pufferfish" });

  const C = {
    gold: "#D9AA45",
    honey: "#E8BE66",
    cream: "#F4E7BF",
    spine: "#FFF1CF",
    spot: "#69492D",
    spotLight: "#CBB078",
    cheek: "#D78C48",
    lip: "#B97945",
    mouth: "#382A24",
    tooth: "#FFF5D9",
    eyeWhite: "#FFF4D8",
    irisRim: "#BF8735",
    iris: "#367F79",
    pupil: "#172E2C",
    glint: "#FFFFFF",
    fin: "#E4AC43",
    finLight: "#F4D88B",
    finBand: "#956336",
    finEdge: "#C18A36"
  };

  const center = new THREE.Vector3(0, 0.262, 0);
  const rx = 0.245;
  const ry = 0.262;
  const rz = 0.268;

  const V = (x: number, y: number, z: number) =>
    new THREE.Vector3(x, y, z);

  // The round, inflated body is deliberately rigid; the mouth, fins and tail
  // have their own recognizable animation joints.
  function joint(
    name: string,
    at: THREE.Vector3,
    parent: any,
    role: string,
    dir: THREE.Vector3
  ): any {
    const j = b.joint(name, { at, parent, dir, role } as any);
    const bone = (j as any).bone ?? j;
    if (bone.userData) bone.userData.role = role;
    return j;
  }

  const spine = joint("spine", center, undefined, "spine", V(0, 0, 1));
  const neck = joint("neck", V(0, 0.262, 0.172), spine, "neck", V(0, 0, 1));
  const head = joint("head", V(0, 0.275, 0.216), neck, "head", V(0, 0, 1));
  const upperJaw = joint(
    "upperJaw", V(0, 0.281, 0.266), head, "head", V(0, 0, 1)
  );
  const jaw = joint("jaw", V(0, 0.238, 0.259), head, "jaw", V(0, 0, 1));

  const tailPoints = [
    V(0, 0.262, -0.233),
    V(0, 0.263, -0.311),
    V(0, 0.263, -0.374)
  ];
  const tail1 = joint("tail1", tailPoints[0], spine, "tail", V(0, 0, -1));
  const tail2 = joint("tail2", tailPoints[1], tail1, "tail", V(0, 0, -1));
  const tail3 = joint("tail3", tailPoints[2], tail2, "tail", V(0, 0, -1));
  joint("tailTip", V(0, 0.263, -0.504), tail3, "tail", V(0, 0, -1));

  const finRoots = {
    L: V(0.235, 0.269, 0.035),
    R: V(-0.235, 0.269, 0.035),
    dorsal: V(0, 0.49, -0.126),
    anal: V(0, 0.061, -0.16)
  };
  const finL = joint("finL", finRoots.L, spine, "fan", V(1, 0, -0.15));
  const finR = joint("finR", finRoots.R, spine, "fan", V(-1, 0, -0.15));
  joint("finTipL", V(0.38, 0.278, -0.025), finL, "fan", V(1, 0, 0));
  joint("finTipR", V(-0.38, 0.278, -0.025), finR, "fan", V(-1, 0, 0));
  const dorsal = joint(
    "dorsalFin", finRoots.dorsal, spine, "fan", V(0, 1, -0.15)
  );
  joint("dorsalTip", V(0, 0.608, -0.133), dorsal, "fan", V(0, 1, 0));
  const anal = joint("analFin", finRoots.anal, spine, "fan", V(0, -1, -0.5));

  function ellipsoid(
    position: THREE.Vector3,
    radii: THREE.Vector3,
    color: string,
    bone: any,
    widthSegments = 16,
    heightSegments = 10
  ): any {
    const g = new THREE.SphereGeometry(1, widthSegments, heightSegments);
    g.scale(radii.x, radii.y, radii.z);
    return b.part(g, color, { at: position, bone });
  }

  function rod(
    a: THREE.Vector3,
    c: THREE.Vector3,
    radius: number,
    color: string,
    bone: any
  ) {
    const direction = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(radius, radius, direction.length(), 6);
    return b.part(g, color, {
      at: a.clone().add(c).multiplyScalar(0.5),
      dir: direction,
      bone
    });
  }

  // Two matching primitive shells share a gently scalloped color boundary.
  // Their common bottom pole touches y = 0.
  function bellyBoundary(phi: number): number {
    return 1.95 + 0.055 * Math.cos(phi * 4 + 0.4) + 0.025 * Math.sin(phi * 3);
  }

  function bodyPoint(theta: number, phi: number): THREE.Vector3 {
    return center.clone().add(
      V(
        rx * Math.sin(theta) * Math.cos(phi),
        ry * Math.cos(theta),
        rz * Math.sin(theta) * Math.sin(phi)
      )
    );
  }

  function bodyShell(lower: boolean): THREE.BufferGeometry {
    const around = 32;
    const rows = lower ? 8 : 15;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let j = 0; j <= rows; j++) {
      for (let i = 0; i <= around; i++) {
        const phi = (i / around) * Math.PI * 2;
        const edge = bellyBoundary(phi);
        const theta = lower
          ? edge + (Math.PI - edge) * (j / rows)
          : edge * (j / rows);
        const p = bodyPoint(theta, phi).sub(center);
        positions.push(p.x, p.y, p.z);
      }
    }
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < around; i++) {
        const a = j * (around + 1) + i;
        const d = a + around + 1;
        indices.push(a, d, a + 1, a + 1, d, d + 1);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    const flat = g.toNonIndexed();
    flat.computeVertexNormals();
    return flat;
  }

  const body = b.part(bodyShell(false), C.gold, { at: center, bone: spine });
  const belly = b.part(bodyShell(true), C.cream, { at: center, bone: spine });
  const bodySurface = b.surface(body);
  const bellySurface = b.surface(belly);

  function bodyHit(theta: number, phi: number): any {
    const surf = theta > bellyBoundary(phi) ? bellySurface : bodySurface;
    return surf.nearest(bodyPoint(theta, phi));
  }

  function directionHit(direction: THREE.Vector3): any {
    const d = direction.clone().normalize();
    const theta = Math.acos(d.y);
    let phi = Math.atan2(d.z, d.x);
    if (phi < 0) phi += Math.PI * 2;
    return bodyHit(theta, phi);
  }

  function disk(radius: number, thickness = 0.0008): THREE.BufferGeometry {
    return new THREE.CylinderGeometry(radius, radius, thickness, 12);
  }

  // A mathematically spaced, non-random pattern of freckles and five-sided
  // ivory spines. The face and the floor-contact area are kept clear.
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const sampleCount = 148;
  for (let i = 0; i < sampleCount; i++) {
    const yy = 1 - 2 * ((i + 0.5) / sampleCount);
    const theta = Math.acos(yy);
    const phi = (i * goldenAngle + 0.31) % (Math.PI * 2);
    const xx = Math.sin(theta) * Math.cos(phi);
    const zz = Math.sin(theta) * Math.sin(phi);

    if (zz > 0.66 && yy > -0.4 && Math.abs(xx) < 0.67) continue;
    if (yy < -0.91) continue;

    const hit = bodyHit(theta, phi);
    const isBelly = theta > bellyBoundary(phi);
    const spotRadius = (isBelly ? 0.008 : 0.012) + (i % 4) * 0.0015;
    b.stick(disk(spotRadius), isBelly ? C.spotLight : C.spot, hit);

    if (yy > -0.73) {
      const length =
        0.023 + (i % 3) * 0.0038 + Math.max(0, yy) * 0.004;
      const cone = new THREE.ConeGeometry(
        isBelly ? 0.0052 : 0.0066,
        length,
        5
      );
      b.stick(cone, C.spine, hit);
    } else if (i % 3 === 0) {
      b.stick(disk(spotRadius * 0.43, 0.001), C.cream, hit);
    }
  }

  // Smaller freckles and warm cheek patches distinguish the uncluttered face.
  for (const side of [1, -1]) {
    const cheekHit = directionHit(V(side * 0.56, 0.075, 0.825));
    const cheekGeo = new THREE.SphereGeometry(1, 12, 6);
    cheekGeo.scale(0.022, 0.0018, 0.013);
    b.stick(cheekGeo, C.cheek, cheekHit);

    for (let k = 0; k < 4; k++) {
      const d = V(
        side * (0.32 + k * 0.075),
        0.17 + 0.035 * (k % 2),
        0.92
      );
      b.stick(disk(0.0032 + (k % 2) * 0.0007), C.spot, directionHit(d));
    }
  }

  // Separate upper and lower mouth assemblies form a small, open puffer beak.
  const snout = ellipsoid(
    V(0, 0.281, 0.272), V(0.057, 0.026, 0.033), C.honey, upperJaw
  );
  ellipsoid(
    V(0, 0.236, 0.272), V(0.048, 0.022, 0.032), C.cream, jaw
  );
  ellipsoid(
    V(0, 0.259, 0.308), V(0.03, 0.032, 0.006), C.mouth, head, 16, 10
  );

  const upperLip = new THREE.TorusGeometry(0.032, 0.006, 6, 16, Math.PI);
  b.part(upperLip, C.lip, { at: V(0, 0.259, 0.315), bone: upperJaw });
  const lowerLip = new THREE.TorusGeometry(0.032, 0.0065, 6, 16, Math.PI);
  lowerLip.rotateZ(Math.PI);
  b.part(lowerLip, C.honey, { at: V(0, 0.259, 0.315), bone: jaw });

  for (const side of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.013, 0.013, 0.007), C.tooth, {
      at: V(side * 0.0069, 0.277, 0.318),
      bone: upperJaw
    });
    b.part(new THREE.BoxGeometry(0.0105, 0.009, 0.006), C.tooth, {
      at: V(side * 0.0056, 0.244, 0.319),
      bone: jaw
    });

    const nostrilHit = b.surface(snout).nearest(V(side * 0.027, 0.296, 0.306));
    const nostril = new THREE.SphereGeometry(1, 8, 6);
    nostril.scale(0.0026, 0.001, 0.0035);
    b.stick(nostril, C.spot, nostrilHit);
  }

  // Each eye is a stack of seated primitives, including two painted-looking
  // highlights placed by surface rays rather than floating in front of it.
  for (const side of [1, -1]) {
    const outward = V(side * 0.49, 0.38, 0.785).normalize();
    const hit = directionHit(outward);

    const scleraGeo = new THREE.SphereGeometry(1, 20, 12);
    scleraGeo.scale(0.043, 0.022, 0.046);
    const sclera = b.stick(scleraGeo, C.eyeWhite, hit);
    const eyeOrigin = center.clone().addScaledVector(outward, 0.95);

    const eyeTip = b.surface(sclera).nearest(eyeOrigin);
    const rim = b.stick(disk(0.0295, 0.002), C.irisRim, eyeTip);
    const iris = b.stick(
      disk(0.0255, 0.0022),
      C.iris,
      b.surface(rim).nearest(eyeOrigin)
    );

    const pupilGeo = new THREE.SphereGeometry(1, 16, 8);
    pupilGeo.scale(0.0145, 0.004, 0.017);
    const pupil = b.stick(
      pupilGeo,
      C.pupil,
      b.surface(iris).nearest(eyeOrigin)
    );
    const pupilSurface = b.surface(pupil);

    const right = V(outward.z, 0, -outward.x).normalize();
    const up = outward.clone().cross(right).normalize();
    const highlights = [
      { x: -0.006, y: 0.008, r: 0.0045 },
      { x: 0.006, y: -0.006, r: 0.0021 }
    ];
    for (const h of highlights) {
      const origin = eyeOrigin.clone()
        .addScaledVector(right, h.x)
        .addScaledVector(up, h.y);
      const glintHit =
        pupilSurface.ray(origin, outward.clone().negate()) ??
        pupilSurface.nearest(origin);
      const g = new THREE.SphereGeometry(1, 8, 6);
      g.scale(h.r, h.r * 0.28, h.r);
      b.stick(g, C.glint, glintHit);
    }
  }

  // Three short, curved gill marks on either side, just ahead of the fins.
  for (const side of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const phi = side > 0
        ? 0.43 - k * 0.075
        : Math.PI - (0.43 - k * 0.075);
      const points = [];
      for (let j = 0; j < 5; j++) {
        const theta = 1.34 + j * 0.075;
        points.push(bodyHit(theta, phi + side * 0.024 * Math.sin(j * Math.PI / 4)));
      }
      b.sweep(points, 0.0018, { color: C.spot });
    }
  }

  // The narrow caudal peduncle is a continuous tube on the named tail joints.
  b.sweep([tail1, tail2, tail3], 0.024, { color: C.gold });
  for (const z of [-0.314, -0.343]) {
    const band = new THREE.TorusGeometry(0.024, 0.0025, 5, 12);
    b.part(band, C.finBand, {
      at: V(0, 0.263, z),
      bone: z < -0.33 ? tail3 : tail2
    });
  }

  // A thickened triangle or quadrilateral is still a simple, blocky primitive.
  function finSlab(
    points: THREE.Vector3[],
    normal: THREE.Vector3,
    thickness: number,
    origin: THREE.Vector3,
    color: string,
    bone: any
  ) {
    const n = points.length;
    const positions: number[] = [];
    const indices: number[] = [];
    const offset = normal.clone().normalize().multiplyScalar(thickness / 2);

    for (const sign of [1, -1]) {
      for (const p of points) {
        const q = p.clone().sub(origin).addScaledVector(offset, sign);
        positions.push(q.x, q.y, q.z);
      }
    }
    for (let i = 1; i < n - 1; i++) {
      indices.push(0, i, i + 1, n, n + i + 1, n + i);
    }
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      indices.push(i, n + i, n + j, i, n + j, j);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    const flat = g.toNonIndexed();
    flat.computeVertexNormals();
    b.part(flat, color, { at: origin, bone });
  }

  function fan(
    root: THREE.Vector3,
    tips: THREE.Vector3[],
    normal: THREE.Vector3,
    bone: any,
    strongBand: boolean,
    thickness = 0.0025
  ) {
    const innerFraction = strongBand ? 0.77 : 0.87;
    const outerFraction = strongBand ? 0.9 : 0.95;

    for (let i = 0; i < tips.length - 1; i++) {
      const a = tips[i];
      const c = tips[i + 1];
      const ai = root.clone().lerp(a, innerFraction);
      const ci = root.clone().lerp(c, innerFraction);
      const ao = root.clone().lerp(a, outerFraction);
      const co = root.clone().lerp(c, outerFraction);

      finSlab(
        [root, ai, ci], normal, thickness, root,
        i % 2 === 0 ? C.fin : C.finLight, bone
      );
      finSlab(
        [ai, ao, co, ci], normal, thickness, root,
        strongBand ? C.finBand : C.finEdge, bone
      );
      finSlab(
        [ao, a, c, co], normal, thickness, root, C.finLight, bone
      );
    }

    const surfaceOffset = normal.clone().normalize().multiplyScalar(thickness / 2);
    for (const tip of tips) {
      rod(
        root.clone().add(surfaceOffset),
        tip.clone().add(surfaceOffset),
        0.00135,
        C.finLight,
        bone
      );
    }
    for (let i = 0; i < tips.length - 1; i++) {
      rod(tips[i], tips[i + 1], 0.00115, C.finEdge, bone);
    }
  }

  const sideTips = [
    V(0.314, 0.348, 0.036),
    V(0.348, 0.339, 0.018),
    V(0.374, 0.312, -0.002),
    V(0.387, 0.278, -0.025),
    V(0.382, 0.245, -0.047),
    V(0.365, 0.216, -0.068),
    V(0.336, 0.202, -0.082)
  ];
  fan(finRoots.L, sideTips, V(0.22, 0.05, 1), finL, false);
  fan(
    finRoots.R,
    sideTips.map(p => V(-p.x, p.y, p.z)),
    V(-0.22, 0.05, 1),
    finR,
    false
  );

  fan(
    finRoots.dorsal,
    [
      V(0, 0.565, -0.071),
      V(0, 0.601, -0.102),
      V(0, 0.608, -0.14),
      V(0, 0.585, -0.181),
      V(0, 0.527, -0.231)
    ],
    V(1, 0, 0),
    dorsal,
    false,
    0.003
  );

  fan(
    finRoots.anal,
    [
      V(0, 0.03, -0.184),
      V(0, 0.025, -0.212),
      V(0, 0.042, -0.24),
      V(0, 0.078, -0.244)
    ],
    V(1, 0, 0),
    anal,
    false,
    0.0025
  );

  fan(
    tailPoints[2],
    [
      V(0, 0.368, -0.464),
      V(0, 0.381, -0.489),
      V(0, 0.357, -0.506),
      V(0, 0.314, -0.503),
      V(0, 0.263, -0.494),
      V(0, 0.214, -0.504),
      V(0, 0.174, -0.507),
      V(0, 0.146, -0.489),
      V(0, 0.157, -0.463)
    ],
    V(1, 0, 0),
    tail3,
    true,
    0.0035
  );

  return b.root;
}
