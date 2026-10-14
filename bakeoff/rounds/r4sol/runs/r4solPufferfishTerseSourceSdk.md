```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mottle,
  spots,
  mix,
  smoothstep,
  catmull,
  polyline,
  aim,
  type Fill,
  type JointRef,
} from "agentic-3js-builder";

export const meta = {
  name: "Golden Pufferfish",
  description:
    "An inflated, honey-gold pufferfish with a creamy belly, spotted skin, little ivory quills, jewel-green eyes, a split beak, and fully spread, ray-striped fins.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({
    name: "Golden Pufferfish",
    detail: 0.85,
    paintSize: 2048,
  });
  const random = rng(71429);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const C = {
    honey: "#d6a253",
    gold: "#e6b565",
    ochre: "#aa753a",
    brown: "#65452d",
    socket: "#73502e",
    cream: "#f5dfad",
    ivory: "#fff0c9",
    quill: "#f1d9a1",
    quillTip: "#bc894c",
    fin: "#dfad61",
    finLight: "#ebc37d",
    finDark: "#ca934c",
    finRib: "#a4763d",
    finEdge: "#f4dca5",
    teal: "#438877",
    irisEdge: "#365a43",
    pupil: "#12272c",
    mouth: "#513731",
    shine: "#ffffed",
  };

  b.material(C.pupil).roughness = 0.19;
  b.material(C.pupil).metalness = 0.12;
  b.material(C.teal).roughness = 0.3;
  b.material(C.ivory).roughness = 0.54;
  b.material(C.shine).roughness = 0.2;

  // Skeleton first: a short fish spine, separate jaws, an extended tail,
  // and paired pectoral paddles in an open swimming rest pose.
  const root = b.joint("root", {
    at: [0, 0.18, -0.055],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.18, -0.105],
      [0, 0.185, 0.035],
      [0, 0.202, 0.147],
    ],
    {
      parent: root,
      names: ["spine1", "spine2", "head"],
      up: [0, 1, 0],
      role: "spine",
    },
  );

  const tail = b.chain(
    "tail",
    [
      [0, 0.18, -0.12],
      [0, 0.181, -0.205],
      [0, 0.181, -0.262],
    ],
    {
      parent: root,
      names: ["tail1", "tail2", "tail3"],
      up: [0, 1, 0],
      role: "tail",
    },
  );

  const upperJaw = b.joint("upperJaw", {
    parent: "head",
    at: [0, 0.211, 0.173],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "jaw",
  });
  const jaw = b.joint("jaw", {
    parent: "head",
    at: [0, 0.192, 0.169],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "jaw",
  });

  const caudalFin = b.joint("caudalFin", {
    parent: "tail3",
    at: [0, 0.181, -0.262],
    dir: [0, 0, -1],
    up: [0, 1, 0],
    role: "fan",
  });
  const dorsalFin = b.joint("dorsalFin", {
    parent: "spine1",
    at: [0, 0.311, -0.128],
    dir: [0, 1, -0.6],
    role: "fan",
  });
  const analFin = b.joint("analFin", {
    parent: "tail1",
    at: [0, 0.064, -0.125],
    dir: [0, -1, -0.6],
    role: "fan",
  });

  const pectorals = [1, -1].map((side) => {
    const suffix = side === 1 ? "L" : "R";
    const origin = V(side * 0.149, 0.175, 0.047);
    const outward = V(side * 0.87, 0, -0.493).normalize();
    const chain = b.chain(
      `pectoral${suffix}`,
      [origin, origin.clone().addScaledVector(outward, 0.137)],
      {
        parent: "spine2",
        names: [`shoulder${suffix}`, `wrist${suffix}`],
        up: [0, 1, 0],
        role: "wing",
      },
    );
    return { suffix, origin, outward, bone: chain.joints[0] };
  });

  const eyes = [1, -1].map((side) => {
    const suffix = side === 1 ? "L" : "R";
    const center = V(side * 0.102, 0.264, 0.13);
    const gaze = V(side * 0.44, 0.055, 0.9).normalize();
    const bone = b.joint(`eye${suffix}`, {
      parent: "head",
      at: center,
      dir: gaze,
      up: [0, 1, 0],
    });
    return { side, suffix, center, gaze, bone };
  });

  const sphere = new THREE.SphereGeometry(1, 12, 8);
  function ellipsoid(
    name: string,
    at: THREE.Vector3 | number[],
    scale: number[],
    color: Fill,
    bone: JointRef,
    quat?: THREE.Quaternion,
    flat = false,
  ) {
    return b.part(sphere, color, {
      name,
      at,
      scale,
      bone,
      quat,
      flat,
    });
  }

  // Warm painted skin, with a clean cream underside and irregular cocoa spots.
  const goldenSkin = mottle("#d1a153", "#edc27a", {
    size: 0.095,
    seed: 18,
    contrast: 1.3,
  });
  const spottedSkin = spots(goldenSkin, ["#65482d", "#785332", "#90653b"], {
    size: 0.049,
    amount: 0.62,
    seed: 43,
  });
  const bodyPaint = paint((p, n, s) => {
    const boundary = p.y + 0.007 * Math.sin(p.z * 35 + p.x * 12);
    const bellyToBack = smoothstep(0.106, 0.179, boundary);
    return mix("#f7e3b4", spottedSkin.at(p, n, s), bellyToBack);
  });

  // One simple, faceted inflated volume. The widest belly reaches y = 0.
  const body = b.loft(
    [
      { at: [0, 0.182, -0.178], w: 0.055, h: 0.065 },
      { at: [0, 0.181, -0.137], w: 0.214, h: 0.238 },
      { at: [0, 0.18, -0.078], w: 0.322, h: 0.331 },
      { at: [0, 0.18, -0.021], w: 0.35, h: 0.36 },
      { at: [0, 0.184, 0.052], w: 0.309, h: 0.322 },
      { at: [0, 0.192, 0.111], w: 0.239, h: 0.258 },
      { at: [0, 0.197, 0.151], w: 0.139, h: 0.15 },
      { at: [0, 0.197, 0.175], w: 0.05, h: 0.069 },
    ],
    {
      name: "inflatedSpottedBody",
      color: bodyPaint,
      bone: [root, spine, "head"],
      sides: 16,
      smooth: false,
      caps: "round",
      up: [0, 1, 0],
    },
  );
  const skin = b.surface(body);

  b.sweep(
    tail,
    (t) => [0.047 * (1 - t) + 0.011 * t, 0.054 * (1 - t) + 0.017 * t],
    {
      name: "taperedTailPeduncle",
      color: bodyPaint,
      sides: 10,
      smooth: false,
      caps: "flat",
    },
  );

  // A fin is a little angular fan, not a smooth sculpt:
  // solid wedges, a pale distal band, and raised ribs on both faces.
  function fan(
    name: string,
    origin: THREE.Vector3,
    tips: THREE.Vector3[],
    bone: JointRef,
    thickness: number,
    rimStart: number,
  ) {
    const normal = tips[0]
      .clone()
      .sub(origin)
      .cross(tips[tips.length - 1].clone().sub(origin))
      .normalize();
    const webColors = [C.fin, C.finLight, C.fin, C.finDark, C.finLight];
    for (let i = 0; i < tips.length - 1; i++) {
      const a = origin.clone().lerp(tips[i], rimStart);
      const d = origin.clone().lerp(tips[i + 1], rimStart);
      b.slab([origin, a, d], {
        name: `${name}Web${i + 1}`,
        color: webColors[i % webColors.length],
        thickness,
        bone,
        group: name,
      });
      b.slab([a, tips[i], tips[i + 1], d], {
        name: `${name}CreamHem${i + 1}`,
        color: i % 3 === 1 ? C.cream : C.finEdge,
        thickness,
        bone,
        group: name,
      });
    }
    for (let i = 0; i < tips.length; i++) {
      for (const face of [-1, 1]) {
        const lift = (thickness / 2 + 0.0004) * face;
        b.rod(
          origin.clone().addScaledVector(normal, lift),
          tips[i].clone().addScaledVector(normal, lift),
          [0.0017, 0.0008],
          {
            name: `${name}Ray${i + 1}${face === 1 ? "A" : "B"}`,
            color: C.finRib,
            sides: 5,
            smooth: false,
            bone,
            group: name,
          },
        );
      }
      if (i < tips.length - 1) {
        b.rod(tips[i], tips[i + 1], 0.00135, {
          color: C.gold,
          sides: 5,
          smooth: false,
          bone,
          group: name,
        });
      }
    }
  }

  for (const fin of pectorals) {
    const outline = [
      [0.038, 0.029],
      [0.075, 0.05],
      [0.111, 0.046],
      [0.133, 0.021],
      [0.137, -0.009],
      [0.119, -0.037],
      [0.083, -0.052],
      [0.043, -0.036],
    ];
    const tips = outline.map(([distance, height]) =>
      fin.origin.clone().addScaledVector(fin.outward, distance).add(V(0, height, 0)),
    );
    fan(`pectoral${fin.suffix}`, fin.origin, tips, fin.bone, 0.0042, 0.79);
    ellipsoid(
      `pectoralRoot${fin.suffix}`,
      fin.origin,
      [0.013, 0.015, 0.014],
      C.gold,
      fin.bone,
      undefined,
      true,
    );
  }

  fan(
    "caudal",
    V(0, 0.181, -0.262),
    [
      V(0, 0.28, -0.365),
      V(0, 0.277, -0.383),
      V(0, 0.25, -0.38),
      V(0, 0.219, -0.375),
      V(0, 0.181, -0.384),
      V(0, 0.143, -0.375),
      V(0, 0.112, -0.38),
      V(0, 0.085, -0.383),
      V(0, 0.082, -0.365),
    ],
    caudalFin,
    0.007,
    0.78,
  );

  fan(
    "dorsal",
    V(0, 0.311, -0.128),
    [
      V(0, 0.354, -0.142),
      V(0, 0.385, -0.163),
      V(0, 0.397, -0.188),
      V(0, 0.381, -0.212),
      V(0, 0.349, -0.222),
      V(0, 0.303, -0.181),
    ],
    dorsalFin,
    0.005,
    0.77,
  );

  fan(
    "anal",
    V(0, 0.064, -0.125),
    [
      V(0, 0.039, -0.15),
      V(0, 0.025, -0.179),
      V(0, 0.029, -0.203),
      V(0, 0.049, -0.215),
      V(0, 0.078, -0.184),
    ],
    analFin,
    0.0045,
    0.77,
  );

  // The quills are seated on actual body triangles. Keep the belly smooth,
  // the face readable, and the eyes clear of spines.
  const quillHits = skin.scatter(108, {
    rng: random,
    minDist: 0.0255,
    filter: (hit) => {
      const p = hit.at;
      if (hit.n.y < -0.34) return false;
      if (p.z > 0.132 && p.y < 0.249) return false;
      for (const eye of eyes) {
        if (p.distanceTo(eye.center) < 0.07) return false;
      }
      return true;
    },
  });

  quillHits.forEach((hit, i) => {
    const length = 0.019 + random() * 0.014;
    const radius = 0.0034 + random() * 0.0015;
    b.stick(
      new THREE.CylinderGeometry(radius * 1.4, radius * 1.45, 0.0015, 7),
      i % 4 === 0 ? C.brown : C.ochre,
      hit,
      {
        name: `quillSeat${i + 1}`,
        embed: 0.55,
        flat: true,
        group: "quills",
      },
    );
    const direction = hit.n
      .clone()
      .add(V((random() - 0.5) * 0.14, 0.04, -0.035))
      .normalize();
    b.spike(hit.moved([0, -0.0008, 0]), direction, length, radius, {
      name: `quill${i + 1}`,
      color: C.quill,
      bands: [
        [0.82, i % 5 === 0 ? C.ivory : C.quill],
        [1, C.quillTip],
      ],
      sides: 5,
      smooth: false,
      group: "quills",
    });
  });

  // Short, curved gill openings pulled onto the skin.
  for (const side of [1, -1]) {
    for (let slit = 0; slit < 2; slit++) {
      const points = [];
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        const y = 0.16 + t * (slit === 0 ? 0.073 : 0.056);
        const z = 0.068 - slit * 0.01 - 0.006 * Math.sin(t * Math.PI);
        const hit = skin.ray([side * 0.4, y, z], [-side, 0, 0]);
        if (hit) points.push(hit.moved([0, 0.001, 0]));
      }
      if (points.length > 1) {
        b.sweep(catmull(points), slit === 0 ? 0.002 : 0.00125, {
          name: `gill${side === 1 ? "L" : "R"}${slit + 1}`,
          color: slit === 0 ? C.brown : C.ochre,
          sides: 6,
          caps: "round",
        });
      }
    }
  }

  // Large, globular fish eyes: ochre sockets, cream globes, painted radial
  // green irises, deep pupils, and two small specular beads.
  for (const eye of eyes) {
    const q = aim(eye.gaze, [0, 1, 0], "z");
    const local = (x: number, y: number, z: number) =>
      V(x, y, z).applyQuaternion(q).add(eye.center);

    ellipsoid(
      `eyeSocket${eye.suffix}`,
      local(0, -0.002, -0.015),
      [0.054, 0.055, 0.033],
      C.socket,
      "head",
      q,
      true,
    );
    ellipsoid(
      `goldenEyeRim${eye.suffix}`,
      local(0, 0, -0.01),
      [0.051, 0.052, 0.033],
      C.gold,
      "head",
      q,
    );
    ellipsoid(
      `eyeGlobe${eye.suffix}`,
      eye.center,
      [0.043, 0.046, 0.039],
      C.ivory,
      eye.bone,
      q,
    );

    const irisCenter = local(0, 0, 0.036);
    const inverse = q.clone().invert();
    const irisPaint = paint((p) => {
      const pLocal = p.clone().sub(irisCenter).applyQuaternion(inverse);
      const x = pLocal.x / 0.028;
      const y = pLocal.y / 0.03;
      const angle = Math.atan2(y, x);
      const radius = Math.min(Math.hypot(x, y), 1);
      const spoke = 0.5 + 0.5 * Math.sin(angle * 23 + 0.8 * Math.sin(angle * 7));
      return mix("#317467", "#c0cf85", 0.16 + spoke * 0.44 + (1 - radius) * 0.17);
    });
    ellipsoid(
      `radialIris${eye.suffix}`,
      irisCenter,
      [0.028, 0.03, 0.01],
      irisPaint,
      eye.bone,
      q,
    );
    b.part(new THREE.TorusGeometry(0.0275, 0.0021, 5, 18), C.irisEdge, {
      name: `irisOutline${eye.suffix}`,
      at: local(0, 0, 0.038),
      quat: q,
      scale: [1, 1.075, 1],
      bone: eye.bone,
    });
    ellipsoid(
      `pupil${eye.suffix}`,
      local(0, 0, 0.0458),
      [0.0158, 0.02, 0.0055],
      C.pupil,
      eye.bone,
      q,
    );
    ellipsoid(
      `eyeCatchlight${eye.suffix}`,
      local(-0.0058, 0.0095, 0.0502),
      [0.0048, 0.0048, 0.0033],
      C.shine,
      eye.bone,
      q,
    );
    ellipsoid(
      `eyeCatchlightSmall${eye.suffix}`,
      local(0.008, -0.009, 0.0498),
      [0.0021, 0.0021, 0.0017],
      C.cream,
      eye.bone,
      q,
    );

    const brow = [];
    const lowerLid = [];
    for (let k = 0; k <= 10; k++) {
      const a = ((17 + (146 * k) / 10) * Math.PI) / 180;
      brow.push(local(0.046 * Math.cos(a), 0.048 * Math.sin(a), -0.001));
      const d = ((203 + (134 * k) / 10) * Math.PI) / 180;
      lowerLid.push(local(0.042 * Math.cos(d), 0.044 * Math.sin(d), 0.003));
    }
    b.sweep(polyline(brow), 0.0047, {
      name: `upperEyelid${eye.suffix}`,
      color: C.honey,
      sides: 7,
      bone: "head",
      caps: "round",
    });
    b.sweep(polyline(lowerLid), 0.0031, {
      name: `lowerEyelid${eye.suffix}`,
      color: C.cream,
      sides: 7,
      bone: "head",
      caps: "round",
    });
  }

  // Small tube-like nostrils, rather than a mammalian nose.
  for (const side of [1, -1]) {
    const hit = skin.ray([side * 0.043, 0.241, 0.4], [0, 0, -1]);
    if (hit) {
      const end = hit.at.addScaledVector(hit.n, 0.008);
      b.capsule(hit.moved([0, -0.002, 0]), end, [0.0038, 0.003], {
        name: `nostrilTube${side === 1 ? "L" : "R"}`,
        color: C.gold,
        sides: 7,
        bone: "head",
      });
      b.part(new THREE.SphereGeometry(1, 8, 6), C.brown, {
        name: `nostrilOpening${side === 1 ? "L" : "R"}`,
        at: end,
        scale: [0.0022, 0.0012, 0.0022],
        dir: hit.n,
        bone: "head",
      });
    }
  }

  // The pursed mouth has genuinely separate upper and lower assemblies.
  ellipsoid(
    "upperSnout",
    [0, 0.218, 0.198],
    [0.034, 0.019, 0.025],
    C.gold,
    upperJaw,
  );
  ellipsoid(
    "lowerSnout",
    [0, 0.184, 0.197],
    [0.029, 0.018, 0.026],
    C.cream,
    jaw,
  );
  ellipsoid(
    "mouthCavity",
    [0, 0.202, 0.225],
    [0.0255, 0.016, 0.006],
    C.mouth,
    upperJaw,
  );

  const upperLip = [];
  const lowerLip = [];
  for (let k = 0; k <= 12; k++) {
    const a = (k / 12) * Math.PI;
    upperLip.push(V(0.027 * Math.cos(a), 0.202 + 0.021 * Math.sin(a), 0.232));
    const d = Math.PI + a;
    lowerLip.push(V(0.027 * Math.cos(d), 0.199 + 0.0145 * Math.sin(d), 0.233));
  }
  b.sweep(polyline(upperLip), 0.0059, {
    name: "upperPursedLip",
    color: C.ochre,
    sides: 8,
    bone: upperJaw,
    caps: "round",
  });
  b.sweep(polyline(lowerLip), 0.0061, {
    name: "lowerPursedLip",
    color: C.gold,
    sides: 8,
    bone: jaw,
    caps: "round",
  });

  b.extrude(
    [
      [-0.017, 0.012],
      [-0.015, 0.004],
      [-0.003, 0.002],
      [-0.001, 0.006],
      [0.001, 0.006],
      [0.003, 0.002],
      [0.015, 0.004],
      [0.017, 0.012],
    ],
    {
      name: "upperTwoPartBeak",
      at: [0, 0.202, 0.234],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.0055,
      bevel: 0.001,
      color: C.ivory,
      bone: upperJaw,
    },
  );
  b.extrude(
    [
      [-0.015, -0.009],
      [-0.012, -0.004],
      [0.012, -0.004],
      [0.015, -0.009],
      [0.009, -0.012],
      [-0.009, -0.012],
    ],
    {
      name: "lowerBeak",
      at: [0, 0.202, 0.234],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.0055,
      bevel: 0.001,
      color: C.ivory,
      bone: jaw,
    },
  );
  b.rod([0, 0.21, 0.237], [0, 0.214, 0.237], 0.00065, {
    name: "upperBeakSeam",
    color: C.ochre,
    bone: upperJaw,
    sides: 5,
  });

  // Two subtle smile folds land directly on the curved cheek skin.
  for (const side of [1, -1]) {
    const points = [];
    for (let k = 0; k <= 5; k++) {
      const t = k / 5;
      const hit = skin.ray(
        [side * (0.037 + t * 0.023), 0.201 + Math.sin(t * Math.PI) * 0.008, 0.4],
        [0, 0, -1],
      );
      if (hit) points.push(hit.moved([0, 0.0009, 0]));
    }
    if (points.length > 1) {
      b.sweep(catmull(points), 0.0012, {
        name: `cheekFold${side === 1 ? "L" : "R"}`,
        color: C.ochre,
        bone: "head",
        sides: 5,
        caps: "round",
      });
    }
  }

  return b.root;
}
```