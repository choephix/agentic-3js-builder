```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Sunset Panther Chameleon",
  description:
    "A jewel-coloured panther chameleon stepping along a weathered twig: turquoise turret eyes, lime flanks with crimson bars and an ivory stripe, grasping mitten feet, and a tightly rolled orange tail."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "sunsetPantherChameleon" });
  const random = rng(73021);
  type P = [number, number, number];
  type Profile = { z: number; cy: number; rx: number; ry: number };

  const C = {
    aqua: "#23b5bf",
    turquoise: "#159faf",
    deepAqua: "#087b91",
    cyanLight: "#64d4cd",
    tealDark: "#12505c",
    red: "#bb3544",
    redLight: "#e25849",
    cream: "#fff2cf",
    ivory: "#e8edb8",
    limeLight: "#c9e879",
    gold: "#ecc653",
    pupil: "#101f29",
    bark: "#705442",
    barkDark: "#463b33",
    barkLight: "#a08060",
    wood: "#d0ae79",
    woodDark: "#9f8058",
    claw: "#dfdfba"
  };

  const gradient = [
    "#f18b36", "#e9a13b", "#dbb63e", "#c3cc42", "#a6d343",
    "#88d047", "#6acb56", "#50c66e", "#3bc48a", "#2abdaa",
    "#23b5bb", "#21aab9"
  ];
  const tailColors = ["#ed8737", "#f08c38", "#ed7835", "#e96b37", "#dc6038"];

  const V = (p: P) => new THREE.Vector3(p[0], p[1], p[2]);
  const tuple = (v: THREE.Vector3): P => [v.x, v.y, v.z];
  const mix = (a: P, d: P, t: number): P => [
    a[0] + (d[0] - a[0]) * t,
    a[1] + (d[1] - a[1]) * t,
    a[2] + (d[2] - a[2]) * t
  ];

  function joint(
    name: string,
    at: P,
    parent: any,
    role: string,
    aim?: P
  ): any {
    const j: any = b.joint(name, {
      at, parent, role, ...(aim ? { aim } : {})
    } as any);
    j.userData = j.userData || {};
    j.userData.role = role;
    j.userData.chainRole = role;
    if (j.bone?.userData) {
      j.bone.userData.role = role;
      j.bone.userData.chainRole = role;
    }
    return j;
  }

  // Skeleton first. The four feet are staggered, but all have a firm grip.
  const hipAt: P = [0, 0.124, -0.077];
  const spineAt: P = [0, 0.139, -0.015];
  const chestAt: P = [0, 0.147, 0.058];
  const neckAt: P = [0, 0.156, 0.093];
  const headAt: P = [0, 0.176, 0.129];
  const jawAt: P = [0, 0.142, 0.113];

  const hips = joint("hips", hipAt, undefined, "spine", spineAt);
  const spine = joint("spine", spineAt, hips, "spine", chestAt);
  const chest = joint("chest", chestAt, spine, "spine", neckAt);
  const neck = joint("neck", neckAt, chest, "neck", headAt);
  const head = joint("head", headAt, neck, "head", [0, 0.166, 0.192]);
  const jaw = joint("jaw", jawAt, head, "jaw", [0, 0.14, 0.191]);
  joint("jawTip", [0, 0.14, 0.191], jaw, "jaw");

  const eyeSpecs = [
    {
      name: "eyeL", side: 1,
      at: [0.030, 0.178, 0.130] as P,
      gaze: [0.82, 0.20, 0.63] as P
    },
    {
      name: "eyeR", side: -1,
      at: [-0.030, 0.178, 0.130] as P,
      gaze: [-0.85, -0.12, -0.55] as P
    }
  ];
  const eyes = eyeSpecs.map(e => {
    const direction = V(e.gaze).normalize();
    const target = V(e.at).addScaledVector(direction, 0.04);
    return { ...e, bone: joint(e.name, e.at, head, "hinge", tuple(target)) };
  });

  const legSpecs = [
    {
      name: "ForeL", side: 1, parent: chest, front: true,
      root: [0.025, 0.136, 0.063] as P,
      bend: [0.054, 0.100, 0.094] as P,
      wrist: [0.012, 0.047, 0.113] as P
    },
    {
      name: "ForeR", side: -1, parent: chest, front: true,
      root: [-0.025, 0.134, 0.055] as P,
      bend: [-0.053, 0.088, 0.059] as P,
      wrist: [-0.012, 0.047, 0.073] as P
    },
    {
      name: "HindL", side: 1, parent: hips, front: false,
      root: [0.023, 0.118, -0.077] as P,
      bend: [0.051, 0.078, -0.098] as P,
      wrist: [0.012, 0.046, -0.066] as P
    },
    {
      name: "HindR", side: -1, parent: hips, front: false,
      root: [-0.023, 0.116, -0.084] as P,
      bend: [-0.050, 0.075, -0.145] as P,
      wrist: [-0.012, 0.047, -0.113] as P
    }
  ];

  const legs = legSpecs.map(l => {
    const suffix = l.side === 1 ? "L" : "R";
    const rootBone = joint(
      l.front ? `shoulder${suffix}` : `hip${suffix}`,
      l.root, l.parent, "leg", l.bend
    );
    const bendBone = joint(
      l.front ? `elbow${suffix}` : `knee${suffix}`,
      l.bend, rootBone, "leg", l.wrist
    );
    const wristBone = joint(
      l.front ? `wrist${suffix}` : `ankle${suffix}`,
      l.wrist, bendBone, "leg"
    );

    const digits: {
      base: P; middle: P; tip: P; bone: any; tipBone: any; outside: boolean;
    }[] = [];
    for (let d = 0; d < 5; d++) {
      const outside = d < 3;
      const dz = outside ? (d - 1) * 0.0054 : (d === 3 ? -0.0032 : 0.0032);
      const z = l.wrist[2] + dz;
      const base: P = outside
        ? [l.side * 0.012, 0.045, z]
        : [l.side * 0.0055, 0.0455, z];
      const middle: P = outside
        ? [l.side * 0.015, 0.034, z + 0.001]
        : [-l.side * 0.0065, 0.042, z + 0.0005];
      const tip: P = outside
        ? [l.side * 0.0085, 0.024, z + 0.002]
        : [-l.side * 0.0105, 0.032, z + 0.001];
      const bone = joint(`toe${l.name}${d + 1}`, base, wristBone, "digit", middle);
      const tipBone = joint(`toe${l.name}${d + 1}Tip`, middle, bone, "digit", tip);
      digits.push({ base, middle, tip, bone, tipBone, outside });
    }
    return { ...l, rootBone, bendBone, wristBone, digits };
  });

  // A planar, inward-tightening spiral, rather than a torus with a blunt end.
  const tailControls: THREE.Vector3[] = [
    V([0, 0.121, -0.108]),
    V([0, 0.112, -0.128])
  ];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const a = -0.30 - t * Math.PI * 3.03;
    const r = 0.046 * (1 - 0.835 * t);
    tailControls.push(new THREE.Vector3(
      0,
      0.115 + Math.sin(a) * r,
      -0.190 + Math.cos(a) * r
    ));
  }
  const tailCurve = new THREE.CatmullRomCurve3(tailControls, false, "centripetal");
  const tailCount = 29;
  const tailBones: any[] = [];
  for (let i = 0; i <= tailCount; i++) {
    const p = tuple(tailCurve.getPointAt(i / tailCount));
    const q = tuple(tailCurve.getPointAt(Math.min(1, (i + 1) / tailCount)));
    tailBones.push(joint(`tail${i + 1}`, p, i ? tailBones[i - 1] : hips, "tail", q));
  }

  // Small geometric utilities: every resulting geometry goes through b.part.
  function geometry(vertices: number[], indices: number[], flat = true) {
    let g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex(indices);
    if (flat) g = g.toNonIndexed();
    g.computeVertexNormals();
    return g;
  }

  function profileAt(stations: Profile[], z: number): Profile {
    if (z <= stations[0].z) return { ...stations[0], z };
    for (let i = 1; i < stations.length; i++) {
      if (z <= stations[i].z) {
        const a = stations[i - 1], d = stations[i];
        const t = (z - a.z) / (d.z - a.z);
        return {
          z,
          cy: a.cy + (d.cy - a.cy) * t,
          rx: a.rx + (d.rx - a.rx) * t,
          ry: a.ry + (d.ry - a.ry) * t
        };
      }
    }
    return { ...stations[stations.length - 1], z };
  }

  function profileGeometry(
    stations: Profile[], z0: number, z1: number,
    rings: number, sides: number, capStart = false, capEnd = false
  ) {
    const vs: number[] = [], ix: number[] = [];
    for (let i = 0; i <= rings; i++) {
      const z = z0 + (z1 - z0) * i / rings;
      const p = profileAt(stations, z);
      for (let k = 0; k < sides; k++) {
        const a = k / sides * Math.PI * 2;
        vs.push(p.rx * Math.cos(a), p.cy + p.ry * Math.sin(a), z);
      }
    }
    for (let i = 0; i < rings; i++) {
      for (let k = 0; k < sides; k++) {
        const a = i * sides + k;
        const d = i * sides + (k + 1) % sides;
        const c = a + sides, e = d + sides;
        ix.push(a, d, c, d, e, c);
      }
    }
    if (capStart) {
      const p = profileAt(stations, z0), center = vs.length / 3;
      vs.push(0, p.cy, z0);
      for (let k = 0; k < sides; k++) ix.push(center, (k + 1) % sides, k);
    }
    if (capEnd) {
      const p = profileAt(stations, z1), center = vs.length / 3;
      vs.push(0, p.cy, z1);
      const off = rings * sides;
      for (let k = 0; k < sides; k++) ix.push(center, off + k, off + (k + 1) % sides);
    }
    return geometry(vs, ix);
  }

  function axes(curve: THREE.Curve<THREE.Vector3>, t: number, fixedX = false) {
    const tangent = curve.getTangentAt(t).normalize();
    const u = fixedX
      ? new THREE.Vector3(1, 0, 0)
      : new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
    const v = tangent.clone().cross(u).normalize();
    return { tangent, u, v };
  }

  function tubeGeometry(
    curve: THREE.Curve<THREE.Vector3>,
    t0: number, t1: number, radius: (t: number) => number,
    rings = 5, sides = 10, fixedX = false
  ) {
    const vs: number[] = [], ix: number[] = [];
    for (let i = 0; i <= rings; i++) {
      const t = t0 + (t1 - t0) * i / rings;
      const p = curve.getPointAt(t);
      const { u, v } = axes(curve, t, fixedX);
      const r = radius(t);
      for (let k = 0; k < sides; k++) {
        const a = k / sides * Math.PI * 2;
        const q = p.clone().addScaledVector(u, Math.cos(a) * r)
          .addScaledVector(v, Math.sin(a) * r);
        vs.push(q.x, q.y, q.z);
      }
    }
    for (let i = 0; i < rings; i++) {
      for (let k = 0; k < sides; k++) {
        const a = i * sides + k, d = i * sides + (k + 1) % sides;
        ix.push(a, d, a + sides, d, d + sides, a + sides);
      }
    }
    return geometry(vs, ix);
  }

  function diskGeometry(
    curve: THREE.Curve<THREE.Vector3>, t: number, radius: number, sides = 11
  ) {
    const p = curve.getPointAt(t);
    const { u, v } = axes(curve, t);
    const vs = [p.x, p.y, p.z], ix: number[] = [];
    for (let k = 0; k < sides; k++) {
      const a = k / sides * Math.PI * 2;
      const q = p.clone().addScaledVector(u, radius * Math.cos(a))
        .addScaledVector(v, radius * Math.sin(a));
      vs.push(q.x, q.y, q.z);
    }
    for (let k = 0; k < sides; k++) {
      if (t === 0) ix.push(0, 1 + (k + 1) % sides, 1 + k);
      else ix.push(0, 1 + k, 1 + (k + 1) % sides);
    }
    return geometry(vs, ix);
  }

  function prismYZ(outline: [number, number][], halfWidth: number) {
    const shape = new THREE.Shape();
    outline.forEach(([y, z], i) => i ? shape.lineTo(z, y) : shape.moveTo(z, y));
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: halfWidth * 2, bevelEnabled: false, steps: 1, curveSegments: 1
    });
    const pos = g.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getX(i), y = pos.getY(i), x = pos.getZ(i) - halfWidth;
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }

  function pebble(r: number, height = 0.31) {
    const g = new THREE.IcosahedronGeometry(r, 0);
    g.scale(1, height, 1.12);
    return g;
  }

  const bodyProfile: Profile[] = [
    { z: -0.110, cy: 0.121, rx: 0.008, ry: 0.016 },
    { z: -0.088, cy: 0.124, rx: 0.022, ry: 0.035 },
    { z: -0.056, cy: 0.134, rx: 0.029, ry: 0.048 },
    { z: -0.015, cy: 0.141, rx: 0.031, ry: 0.052 },
    { z: 0.030, cy: 0.142, rx: 0.029, ry: 0.049 },
    { z: 0.069, cy: 0.147, rx: 0.024, ry: 0.037 },
    { z: 0.096, cy: 0.153, rx: 0.016, ry: 0.026 }
  ];
  const bodyZ0 = bodyProfile[0].z, bodyZ1 = bodyProfile[bodyProfile.length - 1].z;
  const bodySlices = 18;
  const bodyParts: any[] = [], bodySurfaces: any[] = [];

  for (let i = 0; i < bodySlices; i++) {
    const z0 = bodyZ0 + (bodyZ1 - bodyZ0) * i / bodySlices;
    const z1 = bodyZ0 + (bodyZ1 - bodyZ0) * (i + 1) / bodySlices;
    const color = gradient[Math.round(i / (bodySlices - 1) * (gradient.length - 1))];
    const bone = (z0 + z1) / 2 < -0.048 ? hips : (z0 + z1) / 2 > 0.04 ? chest : spine;
    const p = b.part(
      profileGeometry(bodyProfile, z0, z1, 2, 16, i === 0, i === bodySlices - 1),
      color, { at: [0, 0, 0], bone }
    );
    bodyParts.push(p);
    bodySurfaces.push(b.surface(p));
  }

  function bodySurface(z: number) {
    const index = Math.max(0, Math.min(bodySlices - 1,
      Math.floor((z - bodyZ0) / (bodyZ1 - bodyZ0) * bodySlices)));
    return bodySurfaces[index];
  }

  // Conformal, irregular red flank bars.
  function flankBar(stations: Profile[], zc: number, width: number, side: number) {
    const vs: number[] = [], ix: number[] = [];
    const count = 12;
    for (let i = 0; i <= count; i++) {
      const a = -1.06 + i / count * 2.23;
      const wiggle = 0.0024 * Math.sin(a * 4.2 + zc * 73) + a * 0.002;
      const w = width * (1 + 0.19 * Math.sin(a * 5.4));
      for (const edge of [-1, 1]) {
        const z = zc + wiggle + edge * w / 2;
        const p = profileAt(stations, z);
        vs.push(
          side * p.rx * Math.cos(a) * 1.012,
          p.cy + p.ry * Math.sin(a) * 1.012,
          z
        );
      }
    }
    for (let i = 0; i < count; i++) {
      const a = i * 2, d = a + 1, c = a + 2, e = a + 3;
      if (side > 0) ix.push(a, c, d, d, c, e);
      else ix.push(a, d, c, d, e, c);
    }
    return geometry(vs, ix);
  }

  for (const side of [-1, 1]) {
    [-0.079, -0.049, -0.019, 0.012, 0.041, 0.067].forEach((z, i) => {
      b.part(flankBar(bodyProfile, z, 0.006 + (i % 2) * 0.0015, side),
        i % 3 === 0 ? C.redLight : C.red,
        { at: [0, 0, 0], bone: z < -0.05 ? hips : z > 0.04 ? chest : spine });
    });

    const stripeHits: any[] = [];
    for (let i = 0; i <= 32; i++) {
      const z = bodyZ0 + 0.004 + (bodyZ1 - bodyZ0 - 0.008) * i / 32;
      const p = profileAt(bodyProfile, z);
      const a = -0.135 + Math.sin(i * 0.57) * 0.026;
      stripeHits.push(bodySurface(z).nearest([
        side * p.rx * Math.cos(a), p.cy + p.ry * Math.sin(a), z
      ]));
    }
    b.sweep(stripeHits, 0.00235, { color: C.cream });

    // Pebbled scales, kept sparse enough for the broad gradient to remain readable.
    for (let col = 0; col < 17; col++) {
      const z = bodyZ0 + 0.010 + col / 16 * (bodyZ1 - bodyZ0 - 0.021);
      const p = profileAt(bodyProfile, z);
      for (let row = 0; row < 7; row++) {
        const a = -1.00 + row * 0.325 + (random() - 0.5) * 0.075;
        const zz = z + (random() - 0.5) * 0.0035;
        const q = profileAt(bodyProfile, zz);
        const hit = bodySurface(zz).nearest([
          side * q.rx * Math.cos(a), q.cy + q.ry * Math.sin(a), zz
        ]);
        const color = row === 6 && col % 3 === 0 ? C.tealDark
          : col < 4 ? (row % 3 === 0 ? C.gold : gradient[2])
          : col < 11 ? (row % 3 === 0 ? C.limeLight : gradient[5])
          : (row % 3 === 0 ? C.cyanLight : gradient[9]);
        b.stick(pebble(0.00115 + random() * 0.00065), color, hit);
      }
    }
  }

  // The low saw-tooth dorsal crest follows the back's actual surface.
  for (let i = 0; i < 20; i++) {
    const z = -0.096 + i / 19 * 0.177;
    const p = profileAt(bodyProfile, z);
    const hit = bodySurface(z).nearest([0, p.cy + p.ry + 0.01, z]);
    const h = 0.003 + 0.002 * Math.sin(Math.PI * i / 19);
    const tooth = new THREE.ConeGeometry(0.0021, h, 4);
    tooth.scale(0.55, 1, 1.35);
    b.stick(tooth, i < 6 ? C.gold : i > 14 ? C.cyanLight : C.ivory, hit);
  }

  // Faceted tapered tail, articulated into short, continuous sections.
  const tailRadius = (t: number) => 0.0101 * Math.pow(1 - t, 0.84) + 0.00115;
  const tailSurfaces: any[] = [];
  for (let i = 0; i < tailCount; i++) {
    const t0 = i / tailCount, t1 = (i + 1) / tailCount;
    const colorIndex = Math.min(tailColors.length - 1, Math.floor(i / tailCount * tailColors.length));
    const p = b.part(
      tubeGeometry(tailCurve, t0, t1, tailRadius, 4, 10, true),
      tailColors[colorIndex], { at: [0, 0, 0], bone: tailBones[i] }
    );
    tailSurfaces.push(b.surface(p));
    if (i > 1 && i < tailCount - 3 && i % 2 === 0) {
      const t = (t0 + t1) / 2;
      const q = tailCurve.getPointAt(t);
      for (const side of [-1, 1]) {
        const hit = tailSurfaces[i].nearest([
          q.x + side * tailRadius(t), q.y, q.z
        ]);
        b.stick(pebble(0.0010 + 0.0006 * (1 - t)), i % 4 ? C.gold : C.redLight, hit);
      }
    }
  }

  const headProfile: Profile[] = [
    { z: 0.087, cy: 0.169, rx: 0.021, ry: 0.024 },
    { z: 0.114, cy: 0.176, rx: 0.030, ry: 0.035 },
    { z: 0.139, cy: 0.174, rx: 0.030, ry: 0.028 },
    { z: 0.159, cy: 0.162, rx: 0.024, ry: 0.019 },
    { z: 0.182, cy: 0.154, rx: 0.014, ry: 0.011 },
    { z: 0.192, cy: 0.151, rx: 0.0015, ry: 0.007 }
  ];
  const headPart = b.part(
    profileGeometry(headProfile, 0.087, 0.192, 14, 14, true, true),
    C.turquoise, { at: [0, 0, 0], bone: head }
  );
  const headSurface = b.surface(headPart);

  const jawProfile: Profile[] = [
    { z: 0.101, cy: 0.139, rx: 0.016, ry: 0.004 },
    { z: 0.130, cy: 0.136, rx: 0.022, ry: 0.008 },
    { z: 0.160, cy: 0.136, rx: 0.018, ry: 0.006 },
    { z: 0.185, cy: 0.139, rx: 0.010, ry: 0.004 },
    { z: 0.192, cy: 0.145, rx: 0.0015, ry: 0.0015 }
  ];
  const lowerJaw = b.part(
    profileGeometry(jawProfile, 0.101, 0.192, 10, 10, true, true),
    "#a9dbc4", { at: [0, 0, 0], bone: jaw }
  );
  const jawSurface = b.surface(lowerJaw);

  for (const side of [-1, 1]) {
    for (const z of [0.106, 0.146, 0.172]) {
      b.part(flankBar(headProfile, z, 0.0032, side),
        C.red, { at: [0, 0, 0], bone: head });
    }
    const lip: any[] = [], seam: any[] = [];
    for (let i = 0; i <= 18; i++) {
      const z = 0.100 + i / 18 * 0.090;
      const p = profileAt(headProfile, z);
      lip.push(headSurface.nearest([
        side * p.rx * Math.cos(-0.92), p.cy + p.ry * Math.sin(-0.92), z
      ]));
      seam.push(headSurface.nearest([
        side * p.rx * Math.cos(-1.15), p.cy + p.ry * Math.sin(-1.15), z
      ]));
    }
    b.sweep(seam, 0.00065, { color: C.tealDark });
    b.sweep(lip, 0.00130, { color: C.cream });

    for (let i = 0; i < 24; i++) {
      const z = 0.094 + (i % 8) * 0.011;
      const p = profileAt(headProfile, z);
      const a = -0.54 + Math.floor(i / 8) * 0.56;
      const hit = headSurface.nearest([
        side * p.rx * Math.cos(a), p.cy + p.ry * Math.sin(a), z
      ]);
      b.stick(pebble(0.00105 + random() * 0.00055),
        i % 4 === 0 ? C.cyanLight : C.aqua, hit);
    }

    const nostrilZ = 0.180;
    const np = profileAt(headProfile, nostrilZ);
    const nh = headSurface.nearest([side * np.rx * 0.94, np.cy + 0.0035, nostrilZ]);
    b.stick(pebble(0.00125, 0.22), C.tealDark, nh);

    for (let i = 0; i < 8; i++) {
      const z = 0.115 + i * 0.008;
      const p = profileAt(jawProfile, z);
      const h = jawSurface.nearest([side * p.rx, p.cy, z]);
      b.stick(pebble(0.00085), i % 3 === 0 ? C.cream : C.cyanLight, h);
    }
  }

  // Raised casque: broad triangular plates and a little serrated ridge.
  const crestOutline: [number, number][] = [
    [0.189, 0.087], [0.213, 0.094], [0.230, 0.107],
    [0.220, 0.126], [0.194, 0.155], [0.189, 0.132]
  ];
  const crest = b.part(prismYZ(crestOutline, 0.0062), C.deepAqua,
    { at: [0, 0, 0], bone: head });
  const crestSurface = b.surface(crest);
  for (const side of [-1, 1]) {
    b.part(geometry([
      side * 0.00635, 0.198, 0.095,
      side * 0.00635, 0.225, 0.107,
      side * 0.00635, 0.216, 0.124,
      side * 0.00635, 0.197, 0.145
    ], side > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]),
    C.aqua, { at: [0, 0, 0], bone: head });
    for (let i = 0; i < 5; i++) {
      const z = 0.100 + i * 0.008;
      const y = 0.203 + Math.sin(i / 4 * Math.PI) * 0.007;
      b.stick(pebble(0.0012), i % 2 ? C.cyanLight : C.gold,
        crestSurface.nearest([side * 0.009, y, z]));
    }
  }
  for (let i = 0; i < 10; i++) {
    const z = 0.096 + i / 9 * 0.045;
    const y = z <= 0.107
      ? 0.213 + (z - 0.094) / 0.013 * 0.017
      : z <= 0.126
        ? 0.230 - (z - 0.107) / 0.019 * 0.010
        : 0.220 - (z - 0.126) / 0.029 * 0.026;
    const hit = crestSurface.nearest([0, y + 0.004, z]);
    b.stick(new THREE.ConeGeometry(0.0017, 0.0032, 4),
      i % 3 === 0 ? C.gold : C.cyanLight, hit);
  }

  // Turret eyes, with small openings aimed independently rather than forward-facing eyeballs.
  for (const e of eyes) {
    const globeGeo = new THREE.SphereGeometry(1, 12, 8);
    globeGeo.scale(0.016, 0.018, 0.019);
    const turret = b.part(globeGeo, C.aqua, { at: e.at, bone: e.bone });
    const eyeSurface = b.surface(turret);

    for (let ring = 0; ring < 2; ring++) {
      const count = ring ? 14 : 10;
      for (let i = 0; i < count; i++) {
        const a = i / count * Math.PI * 2 + ring * 0.12;
        const r = ring ? 0.014 : 0.009;
        const h = eyeSurface.nearest([
          e.at[0] + e.side * (ring ? 0.0085 : 0.013),
          e.at[1] + Math.cos(a) * r,
          e.at[2] + Math.sin(a) * r
        ]);
        b.stick(pebble(ring ? 0.00125 : 0.0011),
          i % 4 === 0 ? C.gold : i % 2 ? C.cyanLight : C.deepAqua, h);
      }
    }

    const look = V(e.gaze).normalize();
    const openingHit = eyeSurface.nearest(tuple(V(e.at).addScaledVector(look, 0.055)));
    const surround = new THREE.SphereGeometry(1, 12, 6);
    surround.scale(0.0059, 0.00155, 0.0059);
    b.stick(surround, C.tealDark, openingHit);
    const iris = new THREE.SphereGeometry(1, 12, 6);
    iris.scale(0.00455, 0.0020, 0.00455);
    b.stick(iris, C.gold, openingHit);
    const pupil = new THREE.SphereGeometry(1, 12, 6);
    pupil.scale(0.00235, 0.00255, 0.00235);
    b.stick(pupil, C.pupil, openingHit);
    const glint = new THREE.SphereGeometry(0.00072, 6, 4);
    glint.translate(-0.0008, 0.00315, 0.00085);
    b.stick(glint, C.cream, openingHit);
  }

  // Bent limbs, two opposed mitten lobes, and individually rigged gripping toes.
  for (const l of legs) {
    const legColor = l.front ? "#31bbaa" : "#b9cf48";
    const footColor = l.front ? "#78d5b0" : "#d6db72";
    const legTube = b.sweep([l.rootBone, l.bendBone, l.wristBone],
      l.front ? 0.0060 : 0.0067, { color: legColor });
    const limbSurface = b.surface(legTube);

    for (let i = 0; i < 9; i++) {
      const t = (i + 1) / 10;
      const p = t < 0.5
        ? mix(l.root, l.bend, t * 2)
        : mix(l.bend, l.wrist, (t - 0.5) * 2);
      const h = limbSurface.nearest([p[0] + l.side * 0.009, p[1], p[2]]);
      b.stick(pebble(0.00125), i % 3 === 0 ? C.red : l.front ? C.cyanLight : C.gold, h);
    }

    const palm = new THREE.SphereGeometry(1, 8, 6);
    palm.scale(0.0068, 0.0046, 0.010);
    b.part(palm, footColor, { at: l.wrist, bone: l.wristBone });

    for (const d of l.digits) {
      const toeCurve = new THREE.CatmullRomCurve3(
        [V(d.base), V(d.middle), V(d.tip)], false, "centripetal"
      );
      const toe = b.sweep([d.bone, d.tipBone, d.tip], 0.00215, { color: footColor });
      const toeSurface = b.surface(toe);
      const p = toeCurve.getPointAt(0.45);
      b.stick(pebble(0.0008), l.front ? C.cream : C.gold,
        toeSurface.nearest([p.x + l.side * 0.003, p.y + 0.002, p.z]));

      const clawEnd: P = [
        d.tip[0] - l.side * 0.0009,
        d.tip[1] - 0.0016,
        d.tip[2] + 0.0025
      ];
      const clawCurve = new THREE.LineCurve3(V(d.tip), V(clawEnd));
      b.part(tubeGeometry(clawCurve, 0, 1, t => 0.00105 * (1 - t) + 0.0001, 2, 5),
        C.claw, { at: [0, 0, 0], bone: d.tipBone });
    }
  }

  // A naturally bent twig. Its ends rest on the floor; there is no display pedestal.
  const twigCurve = new THREE.CatmullRomCurve3([
    V([-0.007, 0.009, -0.285]),
    V([0.000, 0.031, -0.205]),
    V([0.002, 0.033, -0.100]),
    V([0.000, 0.032, 0.000]),
    V([-0.002, 0.032, 0.110]),
    V([-0.012, 0.017, 0.235]),
    V([-0.018, 0.007, 0.282])
  ], false, "centripetal");
  const twigRadius = (t: number) => 0.0106 - 0.0038 * t;
  const twig = b.part(tubeGeometry(twigCurve, 0, 1, twigRadius, 44, 11),
    C.bark, { at: [0, 0, 0], bone: hips });
  const twigSurface = b.surface(twig);

  for (const t of [0, 1]) {
    b.part(diskGeometry(twigCurve, t, twigRadius(t)), C.wood,
      { at: [0, 0, 0], bone: hips });
    const insetCurve = new THREE.LineCurve3(
      twigCurve.getPointAt(t).addScaledVector(twigCurve.getTangentAt(t), t ? 0.00012 : -0.00012),
      twigCurve.getPointAt(t).addScaledVector(twigCurve.getTangentAt(t), t ? 0.0002 : -0.0002)
    );
    b.part(diskGeometry(insetCurve, t, twigRadius(t) * 0.57, 9), C.woodDark,
      { at: [0, 0, 0], bone: hips });
    b.part(diskGeometry(insetCurve, t, twigRadius(t) * 0.28, 8), C.wood,
      { at: [0, 0, 0], bone: hips });
  }

  // Long broken bark grain, seated by surface hits.
  for (let line = 0; line < 10; line++) {
    const a = line / 10 * Math.PI * 2;
    const start = 0.04 + random() * 0.09;
    const end = 0.88 + random() * 0.09;
    const hits: any[] = [];
    for (let i = 0; i <= 22; i++) {
      const t = start + (end - start) * i / 22;
      const p = twigCurve.getPointAt(t);
      const { u, v } = axes(twigCurve, t);
      const angle = a + Math.sin(t * 19 + line) * 0.065;
      const q = p.clone().addScaledVector(u, Math.cos(angle) * twigRadius(t))
        .addScaledVector(v, Math.sin(angle) * twigRadius(t));
      hits.push(twigSurface.nearest(tuple(q)));
    }
    b.sweep(hits, line % 3 === 0 ? 0.00065 : 0.0004,
      { color: line % 2 ? C.barkDark : C.barkLight });
  }

  for (let i = 0; i < 24; i++) {
    const t = 0.04 + random() * 0.92;
    const a = random() * Math.PI * 2;
    const p = twigCurve.getPointAt(t);
    const { u, v } = axes(twigCurve, t);
    const q = p.clone().addScaledVector(u, Math.cos(a) * twigRadius(t))
      .addScaledVector(v, Math.sin(a) * twigRadius(t));
    const flake = new THREE.BoxGeometry(0.0026 + random() * 0.002, 0.0007, 0.007);
    b.stick(flake, i % 3 === 0 ? C.barkDark : C.barkLight,
      twigSurface.nearest(tuple(q)));
  }

  const forks = [
    {
      points: [
        [0, 0.031, -0.187], [0.041, 0.025, -0.212],
        [0.085, 0.012, -0.238], [0.123, 0.004, -0.250]
      ] as P[],
      radius: 0.0055
    },
    {
      points: [
        [-0.009, 0.024, 0.197], [-0.040, 0.032, 0.214],
        [-0.065, 0.027, 0.238], [-0.082, 0.020, 0.250]
      ] as P[],
      radius: 0.0040
    }
  ];
  for (const f of forks) {
    const curve = new THREE.CatmullRomCurve3(f.points.map(V), false, "centripetal");
    b.part(tubeGeometry(curve, 0, 1, t => f.radius * (1 - 0.67 * t), 15, 8),
      C.bark, { at: [0, 0, 0], bone: hips });
    b.part(diskGeometry(curve, 1, f.radius * 0.33, 8), C.wood,
      { at: [0, 0, 0], bone: hips });
  }

  // A few woody knot scars make the perch read as a twig, not a smooth dowel.
  for (const [t, a] of [[0.19, 0.45], [0.57, 2.4], [0.80, 0.8]]) {
    const p = twigCurve.getPointAt(t);
    const { u, v } = axes(twigCurve, t);
    const q = p.clone().addScaledVector(u, Math.cos(a) * twigRadius(t))
      .addScaledVector(v, Math.sin(a) * twigRadius(t));
    const hit = twigSurface.nearest(tuple(q));
    const outer = new THREE.SphereGeometry(1, 8, 4);
    outer.scale(0.0040, 0.0011, 0.0055);
    b.stick(outer, C.barkDark, hit);
    const inner = new THREE.SphereGeometry(1, 8, 4);
    inner.scale(0.0028, 0.00145, 0.0038);
    b.stick(inner, C.woodDark, hit);
  }

  b.root.userData.description = meta.description;
  return b.root;
}
```