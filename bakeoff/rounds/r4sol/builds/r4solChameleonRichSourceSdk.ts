import * as THREE from "three";
import {
  createBuilder, frame, rng, paint, mix, rgb, catmull, spiral, polyline,
  type Fill, type Rgb, type JointRef, type PointInput
} from "../../../../src/index";

export const meta = {
  name: "Prism on a Twig",
  description: "A jewel-coloured panther chameleon with independently aimed turret eyes, scarlet flank bars, clasping mitten feet and a tightly wound sunset-orange tail."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Prism on a Twig", detail: 0.85, paintSize: 2048 });
  const random = rng(2381);

  const C = {
    teal: "#23beba",
    tealDark: "#237b79",
    tealLight: "#74dbbc",
    green: "#80cf4b",
    lime: "#c1df48",
    yellow: "#edd65d",
    orange: "#f59935",
    coral: "#ef753d",
    red: "#dc403f",
    cream: "#f6f2d3",
    horn: "#e9dfb9",
    dark: "#153b3b",
    black: "#102429",
    bark: "#705039",
    barkLight: "#a17a4d",
    barkDark: "#493b2e",
    leaf: "#577e39",
    leafLight: "#789944",
    vein: "#b6ba69"
  };

  const stops: Array<[number, string]> = [
    [-0.34, C.coral], [-0.18, C.orange], [-0.105, "#edb83b"],
    [-0.050, C.lime], [0.005, C.green], [0.062, "#40cd88"],
    [0.115, "#27bba4"], [0.158, "#1bb8be"], [0.225, "#38ccc7"]
  ];
  function coat(z: number): Rgb {
    if (z <= stops[0][0]) return rgb(stops[0][1]);
    for (let i = 1; i < stops.length; i++) {
      if (z <= stops[i][0]) {
        return mix(stops[i - 1][1], stops[i][1],
          (z - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
      }
    }
    return rgb(stops[stops.length - 1][1]);
  }

  // Tiny painted pebbles supplement, rather than replace, the large faceted forms.
  function pebble(base: Rgb, p: THREE.Vector3, n: THREE.Vector3): Rgb {
    let u: number, v: number;
    if (Math.abs(n.x) >= Math.abs(n.y) && Math.abs(n.x) >= Math.abs(n.z)) {
      u = p.z; v = p.y;
    } else if (Math.abs(n.y) >= Math.abs(n.z)) {
      u = p.z; v = p.x;
    } else {
      u = p.x; v = p.y;
    }
    const size = 0.0028;
    const row = Math.floor(v / size);
    const a = u / size + (row & 1) * 0.5;
    const dx = a - Math.floor(a) - 0.5;
    const dy = v / size - Math.floor(v / size) - 0.5;
    const d = dx * dx + dy * dy;
    if (d > 0.195) return [base[0] * 0.92, base[1] * 0.92, base[2] * 0.92];
    if (d < 0.055 && dy > -0.08) return mix(base, "#fff4c7", 0.105);
    return base;
  }
  function stripeHeight(z: number) {
    return 0.192 + z * 0.13 + 0.002 * Math.sin(z * 28);
  }
  const barPositions = [-0.113, -0.079, -0.043, -0.008, 0.027, 0.059, 0.088];
  function inBar(p: THREE.Vector3) {
    return barPositions.some((z, i) => {
      const bend = 0.0025 * Math.sin(p.y * 78 + i * 1.7);
      const width = 0.0053 + 0.0012 * Math.sin(i * 2.2);
      return Math.abs(p.z - z - bend) < width;
    });
  }

  const bodyPaint = paint((p, n) => {
    let base = coat(p.z);
    if (Math.abs(n.x) > 0.27 && inBar(p)) base = rgb(C.red);
    const stripeWidth = 0.0049 *
      Math.max(0.30, Math.min(1, (p.z + 0.139) / 0.025, (0.119 - p.z) / 0.025));
    if (Math.abs(n.x) > 0.32 && Math.abs(p.y - stripeHeight(p.z)) < stripeWidth) {
      base = rgb(C.cream);
    } else if (n.y < -0.35) {
      base = mix(base, "#e5e99b", 0.24);
    }
    return pebble(base, p, n);
  });
  const neckPaint = paint((p, n) => {
    let base = coat(p.z);
    if (Math.abs(n.x) > 0.4 && Math.abs(p.y - (0.205 + (p.z - 0.09) * 0.25)) < 0.0035)
      base = rgb(C.cream);
    return pebble(base, p, n);
  });
  const headPaint = paint((p, n) => {
    let base = coat(Math.max(0.151, p.z));
    if (Math.abs(n.x) > 0.45 && p.z < 0.133 && p.y < 0.254 && p.y > 0.224)
      base = mix(base, C.red, 0.88);
    if (p.y < 0.222) base = mix(base, "#b9e5ae", 0.32);
    return pebble(base, p, n);
  });
  const jawPaint = paint((p, n) =>
    pebble(mix(coat(Math.max(p.z, 0.13)), n.y < -0.15 ? C.cream : "#b8e9b4",
      n.y < -0.15 ? 0.72 : 0.33), p, n));
  const limbPaint = paint((p, n) => {
    let base = mix(coat(p.z), "#d9e789", 0.08);
    if (p.y > 0.128 && Math.abs(n.x) > 0.3 && Math.sin(p.y * 185 + p.z * 42) > 0.89)
      base = mix(base, C.red, 0.9);
    return pebble(base, p, n);
  });
  const footPaint = paint((p, n) => pebble(mix(coat(p.z), "#f4efad", 0.29), p, n));
  const tailPaint = paint((p, n, s) => {
    let base = s[0] < 0.13
      ? coat(p.z)
      : mix("#f5a03a", "#ef713c", Math.min(1, s[0] * 1.15));
    const f = s[0] * 11.0 + 0.13;
    if (Math.abs(f - Math.floor(f) - 0.5) < 0.075 && s[0] < 0.9)
      base = mix(base, "#ca5034", 0.58);
    return pebble(base, p, n);
  });
  const eyePaint = paint((p, n, s) => {
    const radial = 0.5 + 0.5 * Math.cos(s[1] * Math.PI / 15);
    let base = mix("#1db5b1", "#63d9a5", 0.13 + radial * 0.24);
    if (s[0] > 0.0175) base = mix(base, "#d6df79", 0.43);
    return pebble(base, p, n);
  });
  const barkPaint = paint((p) => {
    const a = Math.atan2(p.x, p.y - (0.0682 + 0.12 * p.z));
    const grain = Math.sin(a * 17 + p.z * 12 + Math.sin(p.z * 54) * 0.65);
    const scratch = Math.sin(a * 41 - p.z * 9);
    return mix(C.barkDark, C.barkLight, grain > 0.82 ? 0.77 : 0.32 + 0.10 * scratch);
  });

  // Skeleton first. The twig stays on the scene root; the animal moves on its pelvis.
  const root = b.joint("root", { at: [0, 0, 0] });
  const pelvis = b.joint("pelvis", {
    at: [0, 0.197, -0.092], parent: root, dir: [0, 0, 1], role: "spine"
  });
  const spine = b.chain("spine", [
    [0, 0.189, -0.132], [0, 0.202, -0.052],
    [0, 0.209, 0.021], [0, 0.221, 0.101]
  ], {
    parent: pelvis, names: ["hipCenter", "spine1", "spine2", "chest"],
    up: [0, 1, 0], role: "spine"
  });
  const neck = b.chain("neck", [
    [0, 0.221, 0.087], [0, 0.229, 0.117], [0, 0.235, 0.142]
  ], {
    parent: "chest", names: ["neckBase", "neckTop"], up: [0, 1, 0], role: "neck"
  });
  const head = b.joint("head", {
    parent: "neckTop", at: [0, 0.236, 0.155], dir: [0, 0, 1], role: "head"
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 0.212, 0.129], dir: [0, 0, 1], role: "jaw"
  });
  const eyeL = b.joint("eyeL", {
    parent: head, at: [0.021, 0.244, 0.158], dir: [1, 0.10, 0.70]
  });
  const eyeR = b.joint("eyeR", {
    parent: head, at: [-0.021, 0.244, 0.158], dir: [-1, 0.07, -0.48]
  });

  const tailLead = catmull([
    [0, 0.189, -0.128], [0, 0.201, -0.177], [0, 0.196, -0.237]
  ]);
  const tailCurl = spiral(
    [0, 0.140, -0.237], [0, 0.196, -0.237], [-1, 0, 0],
    { turns: 1.72, r1: 0.0065 }
  );
  const tail = b.chain("tail", tailLead.concat(tailCurl), {
    parent: "hipCenter", count: 11, role: "tail", up: [0, 1, 0]
  });

  function twigY(z: number) { return 0.0682 + 0.12 * z; }
  function twigX(z: number) {
    return z < -0.06 ? -0.004 * (-0.06 - z) / 0.16 : 0;
  }

  const pawSpecifications = [
    { side: "L", sign: 1, front: true, z: 0.115 },
    { side: "R", sign: -1, front: true, z: 0.080 },
    { side: "L", sign: 1, front: false, z: -0.098 },
    { side: "R", sign: -1, front: false, z: -0.137 }
  ];
  const paws = pawSpecifications.map(spec => {
    const s = spec.sign;
    const suffix = `${spec.front ? "F" : "H"}${spec.side}`;
    const y = twigY(spec.z);
    const x = twigX(spec.z);
    const points = spec.front ? [
      [s * 0.025, 0.211, 0.068],
      [s * 0.060, 0.157, 0.018 + (s < 0 ? -0.008 : 0)],
      [x + s * 0.024, y + 0.030, spec.z],
      [x + s * 0.012, y + 0.016, spec.z]
    ] : [
      [s * 0.028, 0.190, -0.091],
      [s * 0.062, 0.144, -0.054],
      [x + s * 0.026, y + 0.029, spec.z],
      [x + s * 0.012, y + 0.016, spec.z]
    ];
    const leg = b.chain(`leg${suffix}`, points, {
      parent: spec.front ? "spine2" : "hipCenter",
      names: spec.front
        ? [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`, `foot${suffix}`]
        : [`hip${suffix}`, `knee${suffix}`, `ankle${suffix}`, `foot${suffix}`],
      role: "leg",
      contact: [x, y + 0.009, spec.z],
      up: [0, 0, 1]
    });
    const outerPoints = [
      [x + s * 0.014, y + 0.016, spec.z - 0.003],
      [x + s * 0.019, y + 0.004, spec.z + 0.001],
      [x + s * 0.012, y - 0.006, spec.z + 0.008]
    ];
    const innerPoints = [
      [x + s * 0.005, y + 0.015, spec.z + 0.004],
      [x - s * 0.014, y + 0.003, spec.z + 0.006],
      [x - s * 0.010, y - 0.007, spec.z + 0.012]
    ];
    const digits = [
      { label: "Outer", points: outerPoints, nails: spec.front ? 2 : 3 },
      { label: "Inner", points: innerPoints, nails: spec.front ? 3 : 2 }
    ].map(d => ({
      ...d,
      chain: b.chain(`toes${d.label}${suffix}`, d.points, {
        parent: `foot${suffix}`,
        names: [
          `toes${d.label}${suffix}1`,
          `toes${d.label}${suffix}2`,
          `toes${d.label}${suffix}Tip`
        ],
        role: "digit"
      })
    }));
    return { ...spec, suffix, x, y, points, leg, digits };
  });

  function ellipsoid(
    at: PointInput, size: number[], color: Fill, bone: JointRef, name?: string,
    segments = 10
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 6), color, {
      at, scale: size, bone, flat: true, name
    });
  }

  // A gently rising, crooked twig: its knotted rear end actually touches the ground.
  const twigPath = catmull([
    [-0.018, 0.014, -0.360],
    [-0.004, 0.0418, -0.220],
    [0, 0.061, -0.060],
    [0, 0.0826, 0.120],
    [0.008, 0.106, 0.320]
  ]);
  const twig = b.sweep(twigPath, [0.014, 0.0115, 0.0096, 0.0076, 0.0055], {
    color: barkPaint, bone: root, sides: 9, smooth: false,
    caps: "flat", name: "crookedTwig", up: [0, 1, 0]
  });
  ellipsoid([-0.018, 0.009, -0.357], [0.014, 0.009, 0.018], C.bark, root, "groundKnot");
  b.sweep(catmull([
    [-0.010, 0.026, -0.298], [-0.046, 0.018, -0.315], [-0.075, 0.006, -0.299]
  ]), [0.006, 0.0036, 0.002], {
    color: barkPaint, bone: root, sides: 7, smooth: false, caps: "round", name: "rearFork"
  });

  const twigSurface = b.surface(twig);
  for (const z of [-0.290, -0.178, 0.173, 0.264]) {
    const cut = twigSurface.loop([twigX(z), twigY(z), z], {
      dir: [0, 0, 1], lift: 0.0002
    });
    b.sweep(cut, 0.0006, {
      color: C.barkLight, bone: root, sides: 5, smooth: false, caps: "none",
      name: "raisedBarkCollar"
    });
  }
  twigSurface.scatter(14, {
    rng: random, minDist: 0.027, filter: h => h.n.y > -0.2
  }).forEach((hit, i) => {
    b.stick(new THREE.IcosahedronGeometry(0.0024, 0),
      i % 3 === 0 ? C.barkDark : C.barkLight, hit, {
        bone: root, scale: [1, 0.45, 1.7], embed: 0.45, name: "barkNodule"
      });
  });
  const frontEnd = twigPath.at(1);
  const frontAxis = twigPath.tangentAt(1);
  b.part(new THREE.CylinderGeometry(0.00545, 0.00545, 0.0007, 9), "#c8a774", {
    at: frontEnd.clone().addScaledVector(frontAxis, 0.0002),
    dir: frontAxis, bone: root, flat: true, name: "twigCutEnd"
  });
  for (const r of [0.0021, 0.0039]) {
    b.part(new THREE.TorusGeometry(r, 0.00025, 3, 12), "#8c6a44", {
      at: frontEnd.clone().addScaledVector(frontAxis, 0.00065),
      dir: frontAxis, axis: "z", bone: root, name: "growthRing"
    });
  }

  // Small folded leaves offset from the silhouette of the animal.
  b.sweep(catmull([
    [0, 0.094, 0.211], [0.041, 0.123, 0.251], [0.084, 0.145, 0.277]
  ]), [0.0044, 0.0026, 0.0012], {
    color: barkPaint, bone: root, sides: 7, smooth: false, name: "leafyFork"
  });
  function leaf(base: number[], tip: number[], width: number, name: string) {
    const a = new THREE.Vector3(...base as [number, number, number]);
    const t = new THREE.Vector3(...tip as [number, number, number]);
    const d = t.clone().sub(a);
    const side = d.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
    const mid = a.clone().lerp(t, 0.48).add(new THREE.Vector3(0, 0.003, 0));
    const l1 = a.clone().lerp(t, 0.28).addScaledVector(side, width * 0.43);
    const l2 = a.clone().lerp(t, 0.65).addScaledVector(side, width * 0.37);
    const r1 = a.clone().lerp(t, 0.28).addScaledVector(side, -width * 0.43);
    const r2 = a.clone().lerp(t, 0.65).addScaledVector(side, -width * 0.37);
    b.slab([a, l1, l2, t, mid], {
      color: C.leafLight, thickness: 0.0007, bone: root, name: `${name}LightHalf`
    });
    b.slab([a, mid, t, r2, r1], {
      color: C.leaf, thickness: 0.0007, bone: root, name: `${name}DarkHalf`
    });
    b.sweep([a, mid, t], 0.00045, {
      color: C.vein, bone: root, sides: 5, name: `${name}Midrib`
    });
    for (const edge of [l1, l2, r1, r2]) {
      b.rod(mid, edge, 0.00025, { color: "#96a55b", bone: root, sides: 4 });
    }
  }
  leaf([0.079, 0.143, 0.273], [0.143, 0.153, 0.306], 0.035, "leafOne");
  leaf([0.057, 0.133, 0.262], [0.036, 0.147, 0.311], 0.027, "leafTwo");

  // The laterally compressed torso is a single skinned low-poly loft.
  const body = b.loft([
    { at: [0, 0.189, -0.132], w: 0.026, h: 0.052 },
    { at: [0, 0.198, -0.102], w: 0.052, h: 0.085 },
    { at: [0, 0.204, -0.047], w: 0.070, h: 0.104 },
    { at: [0, 0.209, 0.025], w: 0.074, h: 0.105 },
    { at: [0, 0.216, 0.072], w: 0.061, h: 0.088 },
    { at: [0, 0.225, 0.106], w: 0.038, h: 0.053 }
  ], {
    color: bodyPaint, bone: spine, sides: 12, smooth: false,
    caps: "round", up: [0, 1, 0], name: "barredTorso"
  });
  b.loft([
    { at: [0, 0.220, 0.084], w: 0.040, h: 0.063 },
    { at: [0, 0.228, 0.116], w: 0.040, h: 0.050 },
    { at: [0, 0.235, 0.142], w: 0.037, h: 0.039 }
  ], {
    color: neckPaint, bone: neck, sides: 10, smooth: false,
    caps: "round", up: [0, 1, 0], name: "neck"
  });

  const dorsalColors = [C.orange, C.yellow, C.lime, C.green, C.teal];
  b.along(body, 20, hit => {
    const color = dorsalColors[Math.min(4, Math.floor(hit.t * 5))];
    b.stick(new THREE.ConeGeometry(0.0025, 0.0053, 4), color, hit, {
      scale: [0.65, 1, 1.35], flow: [0, 0, 1], embed: 0.17,
      name: "dorsalSawtooth"
    });
  }, { from: 0.08, to: 0.93 });

  const bodySurface = b.surface(body);
  bodySurface.scatter(68, {
    rng: random, minDist: 0.0075,
    filter: h => Math.abs(h.n.x) > 0.55 &&
      h.at.y > stripeHeight(h.at.z) + 0.009 && !inBar(h.at)
  }).forEach(hit => {
    const z = hit.at.z;
    const color = z > 0.079 ? C.tealLight : z > 0.022 ? "#7cdb89"
      : z > -0.032 ? "#b6e268" : z > -0.079 ? "#dce576" : "#f4ce69";
    b.stick(new THREE.IcosahedronGeometry(0.00115, 0), color, hit, {
      scale: [1, 0.46, 1], embed: 0.45, name: "raisedFlankScale"
    });
  });

  // Separate upper head and hinged lower jaw; the dark interstice is a closed mouth.
  const upperHead = b.extrude([
    [-0.038, -0.014], [-0.041, 0.006], [-0.025, 0.034],
    [-0.008, 0.038], [0.013, 0.021], [0.048, -0.005],
    [0.052, -0.019], [0.027, -0.021], [-0.003, -0.023]
  ], {
    at: [0, 0.236, 0.155], x: [0, 0, 1], y: [0, 1, 0],
    thickness: [0.044, 0.023], bevel: 0.0018, detail: 0.55,
    color: headPaint, bone: head, name: "casquedUpperHead"
  });
  b.frustumBox(
    [0, 0.2129, 0.130], [0, 0.2167, 0.206],
    [0.033, 0.0018], [0.027, 0.0013],
    { color: C.dark, bone: head, name: "mouthInterstice", up: [0, 1, 0] }
  );
  const lowerJaw = b.extrude([
    [-0.033, 0.001], [-0.017, 0.007], [0.029, 0.008],
    [0.051, 0.010], [0.048, 0.002], [0.029, -0.008], [-0.009, -0.009]
  ], {
    at: [0, 0.207, 0.155], x: [0, 0, 1], y: [0, 1, 0],
    thickness: [0.027, 0.034], bevel: 0.0012, detail: 0.5,
    color: jawPaint, bone: jaw, name: "lowerJaw"
  });
  const headSurface = b.surface(upperHead);
  const jawSurface = b.surface(lowerJaw);
  for (const sign of [1, -1]) {
    const lipHits = [0.137, 0.151, 0.169, 0.187, 0.202].map(z => {
      const y = 0.2138 + (z - 0.137) * 0.042;
      return headSurface.nearest([sign * 0.030, y, z]);
    });
    const lipPath = polyline(lipHits.map(h => h.at.addScaledVector(h.n, 0.0004)));
    b.sweep(lipPath, 0.0008, {
      color: "#d5eab6", bone: head, sides: 5, name: "paleUpperLip"
    });
    const nostril = headSurface.nearest([sign * 0.022, 0.230, 0.192]);
    b.stick(new THREE.SphereGeometry(1, 8, 4), C.dark, nostril, {
      scale: [0.0010, 0.00065, 0.00145], embed: 0.35, name: "nostril"
    });
  }
  for (let i = 0; i < 6; i++) {
    const z = 0.132 + i * 0.0102;
    const hit = jawSurface.nearest([0, 0.187, z]);
    b.stick(new THREE.IcosahedronGeometry(0.0016, 0), "#80c6a1", hit, {
      scale: [0.8, 0.7, 1], embed: 0.45, bone: jaw, name: "chinBead"
    });
  }

  // A narrow, distinctly ridged casque, not the oversized helmet of a veiled chameleon.
  const crestPoints: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const z = 0.120 + i * 0.0069;
    const hit = headSurface.ray([0, 0.340, z], [0, -1, 0]);
    if (!hit) continue;
    crestPoints.push(hit.at.clone().addScaledVector(hit.n, 0.0003));
    b.stick(new THREE.ConeGeometry(0.0028, i < 5 ? 0.0067 : 0.0048, 4),
      i % 3 === 0 ? "#8ce3c4" : C.teal, hit, {
        bone: head, scale: [0.55, 1, 1.5], flow: [0, 0, 1],
        embed: 0.12, name: "casqueRidge"
      });
  }
  if (crestPoints.length > 1) b.sweep(crestPoints, 0.0011, {
    color: C.tealDark, bone: head, sides: 5, name: "casqueRim"
  });

  // Independent, skin-covered conical eye turrets. Only a tiny iris and pupil are exposed.
  for (const eye of [eyeL, eyeR]) {
    const turret = b.lathe([
      [0, 0], [0.0138, 0], [0.0164, 0.006],
      [0.0144, 0.012], [0.0104, 0.018],
      [0.0061, 0.023], [0, 0.023]
    ], {
      at: eye, axis: eye, segments: 12, color: eyePaint,
      bone: eye, name: `${eye.name}Turret`
    });
    const turretSurface = b.surface(turret);
    b.ring(eye.moved([0, 0.012, 0]), { count: 15, radius: 0.0144 }, item => {
      const hit = turretSurface.nearest(item.at);
      b.stick(new THREE.IcosahedronGeometry(0.00105, 0), "#74d8ac", hit, {
        bone: eye, scale: [1, 0.55, 1], embed: 0.35, name: "turretScale"
      });
    });
    b.lathe([
      [0.0038, 0], [0.0061, 0], [0.0065, 0.0007],
      [0.0055, 0.0015], [0.0038, 0.0015]
    ], {
      at: eye.moved([0, 0.0229, 0]), axis: eye, segments: 12,
      color: "#d8df8b", bone: eye, name: `${eye.name}LidRim`
    });
    b.part(new THREE.CylinderGeometry(0.0042, 0.0042, 0.0006, 12), "#b59748", {
      at: eye.moved([0, 0.0241, 0]), dir: eye,
      bone: eye, name: `${eye.name}Iris`
    });
    b.part(new THREE.CylinderGeometry(0.00305, 0.00305, 0.0007, 12), C.black, {
      at: eye.moved([0, 0.02455, 0]), dir: eye,
      bone: eye, name: `${eye.name}Pupil`
    });
    ellipsoid(eye.moved([0.0009, 0.02505, 0.0010]),
      [0.00085, 0.00085, 0.00085], "#fffbe2", eye, `${eye.name}Catchlight`, 8);
  }
  b.material(C.black).roughness = 0.27;

  // Angular, splayed limbs and two opposed fused-toe mittens on each foot.
  for (const paw of paws) {
    b.sweep(paw.leg, paw.front
      ? [0.0114, 0.0092, 0.0067, 0.0075]
      : [0.0134, 0.0113, 0.0075, 0.0078], {
      color: limbPaint, sides: 8, smooth: false, caps: "round",
      extend: [0.004, 0], name: `${paw.suffix}Leg`
    });
    ellipsoid(paw.points[1], paw.front
      ? [0.0091, 0.0100, 0.0091] : [0.0108, 0.0101, 0.0104],
      limbPaint, paw.leg.joints[1], `${paw.suffix}Joint`);
    ellipsoid([paw.x + paw.sign * 0.011, paw.y + 0.016, paw.z],
      [0.0108, 0.0068, 0.0105], footPaint, `foot${paw.suffix}`, `${paw.suffix}Palm`);

    for (const toes of paw.digits) {
      const mitten = b.sweep(toes.chain, t => {
        const r = 0.0056 - 0.0011 * t;
        return [r * 1.10, r * 0.87];
      }, {
        color: footPaint, sides: 8, smooth: false,
        caps: "round", extend: [0.002, 0], name: `${paw.suffix}${toes.label}Mitten`
      });
      const grooveAngles = toes.nails === 3 ? [-24, 24] : [0];
      for (const angle of grooveAngles) {
        b.sweep(mitten.line(angle, 0.00012).slice(0.18, 0.87), 0.00023, {
          color: "#689a62", bone: toes.chain, sides: 4,
          name: "fusedToeCrease"
        });
      }
      const tip = toes.points[toes.points.length - 1];
      for (let j = 0; j < toes.nails; j++) {
        const dx = (j - (toes.nails - 1) / 2) * 0.00245;
        b.spike(
          [tip[0] + dx, tip[1] + 0.0007, tip[2] + 0.0024],
          [tip[0] + dx + paw.sign * 0.0004, tip[1] - 0.0022, tip[2] + 0.0058],
          null, 0.00105, {
            color: C.horn, bone: toes.chain.tip!, sides: 5,
            smooth: false, name: "tinyGrippingClaw"
          }
        );
      }
    }
  }

  const tailSkin = b.sweep(tail, t => 0.00125 + 0.0108 * Math.pow(1 - t, 0.91), {
    color: tailPaint, sides: 9, smooth: false,
    caps: "round", name: "coiledSunsetTail"
  });
  b.along(tailSkin, 9, hit => {
    b.stick(new THREE.ConeGeometry(0.0015, 0.0028, 4), "#eab955", hit, {
      scale: [0.65, 1, 1.2], embed: 0.25,
      flow: hit.tangent, name: "tailRidgeScale"
    });
  }, { from: 0.035, to: 0.29 });

  return b.root;
}
