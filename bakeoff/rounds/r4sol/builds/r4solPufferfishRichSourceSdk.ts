import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  spots,
  mix,
  smoothstep,
  catmull,
  type JointRef,
} from "../../../../src/index";

export const meta = {
  name: "Oh! Puffer",
  description:
    "A completely puffed-up, leopard-spotted pufferfish with worried saucer eyes, a tiny puckered mouth, delicate golden fins, and a rising string of bubbles.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Oh! Puffer", detail: 0.85, paintSize: 1024 });
  const random = rng(42819);

  const cy = 0.315;
  const rx = 0.274;
  const ry = 0.281;
  const rz = 0.252;
  const mouthY = cy - 0.052;

  const C = {
    cream: "#fff2ce",
    ivory: "#fff9e9",
    yellow: "#f1d58a",
    gold: "#dfb25b",
    socket: "#e7c477",
    brown: "#80532f",
    darkBrown: "#5e3d29",
    black: "#182024",
    lip: "#e9b782",
    lipLight: "#f5cca1",
    mouth: "#58382f",
    finRay: "#b88740",
    white: "#ffffff",
    bubble: "#b9ebf0",
    bubbleRim: "#78bfcd",
  };

  // Skeleton first. The appendages are open and separated for animation.
  const root = b.joint("root", { at: [0, cy, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, cy, -rz],
      [0, cy, rz],
    ],
    {
      parent: root,
      count: 3,
      names: ["spine1", "spine2", "spine3"],
      up: [0, 1, 0],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: "spine3",
    at: [0, cy + 0.035, 0.208],
    dir: [0, 0, 1],
    role: "head",
  });
  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: [0, mouthY, 0.25],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, mouthY - 0.013, 0.243],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const eyeRig = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const x = s * 0.112;
    const y = cy + 0.112;
    const eye = b.joint(`eye${side}`, {
      parent: head,
      at: [x, y, 0.245],
      dir: [0, 0, 1],
      role: "head",
    });
    const brow = b.joint(`brow${side}`, {
      parent: head,
      at: [s * 0.111, cy + 0.187, 0.229],
      dir: [0, 0, 1],
      role: "hinge",
    });
    return { s, side, x, y, eye, brow };
  });

  const finRig = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const chain = b.chain(
      `pectoral${side}`,
      [
        [s * 0.259, cy - 0.002, 0.014],
        [s * 0.328, cy - 0.004, -0.015],
        [s * 0.408, cy - 0.005, -0.045],
      ],
      {
        parent: "spine2",
        names: [`shoulder${side}`, `fin${side}`, `finTip${side}`],
        up: [0, 0, 1],
        role: "wing",
      },
    );
    return { s, side, chain };
  });

  const tail = b.chain(
    "tail",
    [
      [0, cy, -0.218],
      [0, cy - 0.007, -0.306],
      [0, cy - 0.007, -0.462],
    ],
    {
      parent: "spine1",
      names: ["tail1", "tail2", "tail3"],
      up: [0, 1, 0],
      role: "tail",
    },
  );

  const leopard = spots(
    "#f0d58a",
    ["#79502e", "#8c5c32", "#99683a"],
    { size: 0.073, amount: 0.63, rosette: true, seed: 117 },
  );
  const skin = paint((p, n) => {
    const yellowAmount = smoothstep(cy - 0.15, cy + 0.16, p.y);
    const base = mix("#fffbed", "#f5df9d", yellowAmount);
    const patternAmount = smoothstep(cy - 0.045, cy + 0.072, p.y);
    return mix(base, leopard.at(p, n), patternAmount);
  });

  // A spherical, faceted sweep, continuously skinned along the spine.
  const body = b.sweep(
    spine,
    (t) => {
      const f = Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
      return [rx * f, ry * f];
    },
    {
      color: skin,
      sides: 20,
      smooth: false,
      caps: "flat",
      name: "inflatedBall",
    },
  );
  const bodySurface = b.surface(body);
  const address = bodySurface.around([0, cy, 0]);

  // Short, broad-based prickles, carefully seated on the actual faceted skin.
  const hits = bodySurface.scatter(164, {
    rng: random,
    minDist: 0.031,
    keepOut: (p) => {
      if (p.z < 0.16) return false;
      for (const s of [1, -1]) {
        const ex = (p.x - s * 0.112) / 0.091;
        const ey = (p.y - (cy + 0.112)) / 0.101;
        if (ex * ex + ey * ey < 1.22) return true;
      }
      return (
        p.z > 0.219 &&
        Math.abs(p.x) < 0.048 &&
        p.y > mouthY - 0.039 &&
        p.y < mouthY + 0.041
      );
    },
  });

  hits.forEach((hit, i) => {
    const p = hit.at;
    const upper = p.y > cy + 0.02;
    const front = p.z > 0.18;
    const length = (front ? 0.020 : 0.025) + random() * 0.010;
    const radius = 0.0058 + random() * 0.0022;

    b.stick(
      new THREE.CylinderGeometry(radius * 1.28, radius * 1.5, 0.0035, 6),
      upper ? C.socket : C.cream,
      hit,
      { embed: 0.48, flat: true, name: `prickleSocket${i + 1}` },
    );
    b.stick(
      new THREE.ConeGeometry(radius, length, 5, 1),
      upper ? C.cream : C.ivory,
      hit,
      {
        embed: 0.12,
        spin: random() * 72,
        flat: true,
        name: `prickle${i + 1}`,
      },
    );
  });

  // The very lowest prickle touches y = 0.
  const bottom = bodySurface.ray([0, -1, 0], [0, 1, 0]);
  if (bottom) {
    b.stick(
      new THREE.ConeGeometry(0.007, 0.03864, 5),
      C.ivory,
      bottom,
      { embed: 0.12, flat: true, name: "bottomPrickle" },
    );
  }

  // Generous eye cushions connect the projecting eyes to the round body.
  for (const e of eyeRig) {
    const socket = b.part(new THREE.SphereGeometry(1, 16, 10), C.socket, {
      at: [e.s * 0.111, cy + 0.110, 0.216],
      scale: [0.077, 0.087, 0.042],
      bone: head,
      flat: true,
      name: `eyeCushion${e.side}`,
    });
    const white = b.part(new THREE.SphereGeometry(1, 18, 12), C.ivory, {
      at: [e.x, e.y, 0.245],
      scale: [0.064, 0.071, 0.05],
      bone: e.eye,
      name: `wideEye${e.side}`,
    });

    // Slightly inward, low-set pupils leave a worried band of white above.
    const px = e.x - e.s * 0.009;
    const py = e.y - 0.008;
    const whiteHit = b.surface(white).ray([px, py, 1], [0, 0, -1])!;
    const iris = b.stick(new THREE.SphereGeometry(1, 16, 8), C.darkBrown, whiteHit, {
      scale: [0.035, 0.007, 0.035],
      embed: 0.30,
      bone: e.eye,
      name: `iris${e.side}`,
    });
    const irisHit = b.surface(iris).ray([px, py, 1], [0, 0, -1])!;
    const pupil = b.stick(new THREE.SphereGeometry(1, 16, 8), C.black, irisHit, {
      scale: [0.0275, 0.0045, 0.028],
      embed: 0.28,
      bone: e.eye,
      name: `pupil${e.side}`,
    });

    const pupilSurface = b.surface(pupil);
    const shine = pupilSurface.ray([px - 0.009, py + 0.012, 1], [0, 0, -1]);
    if (shine) {
      b.stick(new THREE.SphereGeometry(1, 8, 6), C.white, shine, {
        scale: [0.0082, 0.0018, 0.009],
        embed: 0.15,
        bone: e.eye,
        name: `eyeCatchlight${e.side}`,
      });
    }
    const shine2 = pupilSurface.ray([px + 0.010, py - 0.010, 1], [0, 0, -1]);
    if (shine2) {
      b.stick(new THREE.SphereGeometry(1, 6, 4), C.cream, shine2, {
        scale: [0.0033, 0.0012, 0.0033],
        embed: 0.15,
        bone: e.eye,
        name: `eyeSmallCatchlight${e.side}`,
      });
    }

    // Raised inner ends, not an angry downward scowl.
    const browPositions = [
      [e.s * 0.076, cy + 0.179],
      [e.s * 0.091, cy + 0.190],
      [e.s * 0.113, cy + 0.191],
      [e.s * 0.137, cy + 0.177],
      [e.s * 0.163, cy + 0.158],
    ];
    const socketSurface = b.surface(socket);
    const browPoints = browPositions.map(([x, y]) => {
      const h = socketSurface.ray([x, y, 1], [0, 0, -1])!;
      return h.at.addScaledVector(h.n, 0.002);
    });
    b.sweep(catmull(browPoints), [0.0028, 0.0048, 0.0045, 0.0032, 0.0018], {
      color: C.brown,
      bone: e.brow,
      sides: 6,
      smooth: false,
      caps: "round",
      name: `worriedBrow${e.side}`,
    });
  }

  // Tiny cheek cushions and a genuinely separate lower jaw.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 12, 8), C.cream, {
      at: [s * 0.019, mouthY + 0.001, 0.253],
      scale: [0.024, 0.022, 0.022],
      bone: upperJaw,
      name: s === 1 ? "muzzleL" : "muzzleR",
    });
  }
  b.part(new THREE.SphereGeometry(1, 12, 8), C.mouth, {
    at: [0, mouthY, 0.277],
    scale: [0.0145, 0.0135, 0.006],
    bone: upperJaw,
    name: "littleMouthOpening",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), C.ivory, {
    at: [0, mouthY - 0.016, 0.255],
    scale: [0.022, 0.011, 0.018],
    bone: jaw,
    name: "littleChin",
  });

  function lipArc(upper: boolean, bone: JointRef) {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI;
      points.push(
        new THREE.Vector3(
          0.0165 * Math.cos(a),
          mouthY + (upper ? 1 : -1) * 0.0125 * Math.sin(a),
          0.283 + 0.0035 * Math.sin(a),
        ),
      );
    }
    b.sweep(catmull(points), upper ? 0.0045 : 0.0052, {
      color: upper ? C.lip : C.lipLight,
      bone,
      sides: 7,
      smooth: false,
      caps: "round",
      name: upper ? "poutingUpperLip" : "poutingLowerLip",
    });
  }
  lipArc(true, upperJaw);
  lipArc(false, jaw);

  // Small, restrained gill marks, drawn onto the skin just ahead of each fin.
  for (const s of [1, -1]) {
    for (let g = 0; g < 3; g++) {
      const points: THREE.Vector3[] = [];
      for (let k = 0; k <= 4; k++) {
        const t = k / 4;
        const y = cy + 0.025 - t * 0.038;
        const z = 0.130 - g * 0.013 + 0.005 * Math.sin(t * Math.PI);
        const h = bodySurface.ray([s, y, z], [-s, 0, 0]);
        if (h) points.push(h.at.addScaledVector(h.n, 0.0014));
      }
      if (points.length > 1) {
        b.sweep(catmull(points), 0.0016, {
          color: "#b18b51",
          bone: "spine2",
          sides: 5,
          smooth: false,
          name: `gill${s === 1 ? "L" : "R"}${g + 1}`,
        });
      }
    }
  }

  const finPaint = paint((_p, _n, s) => {
    if (s[0] > 0.91) return "#fff0c3";
    if (s[0] > 0.80) return "#ecc876";
    return mix("#e4b867", "#fae7ac", smoothstep(0.08, 0.78, s[0]));
  });

  // Open, slightly cupped fans: golden spokes between thin closed membranes.
  for (const f of finRig) {
    const origin = new THREE.Vector3(f.s * 0.259, cy - 0.002, 0.014);
    const rays: THREE.Vector3[][] = [];
    const tips: THREE.Vector3[] = [];

    b.capsule(
      origin,
      [f.s * 0.283, cy - 0.002, 0.006],
      [0.017, 0.010],
      {
        color: C.gold,
        bone: `shoulder${f.side}`,
        sides: 8,
        smooth: false,
        name: `finRoot${f.side}`,
      },
    );

    for (let i = 0; i < 7; i++) {
      const u = i / 6;
      const angle = (-48 + 96 * u) * Math.PI / 180;
      const length = 0.148 * (1 - 0.12 * Math.abs(2 * u - 1));
      const tip = new THREE.Vector3(
        origin.x + f.s * length * Math.cos(angle),
        origin.y + length * Math.sin(angle),
        origin.z - 0.057 * Math.cos(angle) + 0.009 * Math.sin(angle),
      );
      const middle = origin.clone().lerp(tip, 0.53);
      middle.z += 0.011;
      rays.push([origin.clone(), middle, tip]);
      tips.push(tip);
    }

    for (let i = 0; i < rays.length - 1; i++) {
      b.membrane(rays[i], rays[i + 1], {
        color: finPaint,
        thickness: 0.0024,
        rows: 2,
        cols: 5,
        scallop: 0.075,
        bone: f.chain,
        name: `finWeb${f.side}${i + 1}`,
      });
    }
    rays.forEach((ray, i) => {
      b.sweep(catmull(ray), [0.0025, 0.0019, 0.0012], {
        color: C.finRay,
        bone: f.chain,
        sides: 5,
        smooth: false,
        caps: "round",
        name: `finRay${f.side}${i + 1}`,
      });
    });
    b.sweep(catmull(tips), 0.0017, {
      color: "#f8e4ae",
      bone: f.chain,
      sides: 5,
      smooth: false,
      name: `finHem${f.side}`,
    });
  }

  // A little spotted peduncle and a compact vertical fan tail.
  const tailSkin = spots("#e8c477", "#916039", {
    size: 0.047,
    amount: 0.38,
    seed: 91,
  });
  b.sweep(tail, [0.030, 0.021, 0.014], {
    to: 0.43,
    color: tailSkin,
    sides: 10,
    smooth: false,
    caps: "round",
    name: "tailPeduncle",
  });

  const tailPaint = paint((_p, _n, s) => {
    if (s[0] > 0.93) return "#ffedbd";
    if (s[0] > 0.77) return "#b48545";
    return mix("#dcac57", "#f1d28c", s[0]);
  });
  const tailOrigin = new THREE.Vector3(0, cy - 0.007, -0.307);
  const tailRays: THREE.Vector3[][] = [];
  const tailTips: THREE.Vector3[] = [];

  for (let i = 0; i < 8; i++) {
    const a = (-52 + (104 * i) / 7) * Math.PI / 180;
    const length = 0.153;
    const tip = new THREE.Vector3(
      0,
      tailOrigin.y + Math.sin(a) * length,
      tailOrigin.z - Math.cos(a) * length,
    );
    const middle = tailOrigin.clone().lerp(tip, 0.52);
    middle.x = 0.006;
    tailRays.push([tailOrigin.clone(), middle, tip]);
    tailTips.push(tip);
  }
  for (let i = 0; i < tailRays.length - 1; i++) {
    b.membrane(tailRays[i], tailRays[i + 1], {
      color: tailPaint,
      thickness: 0.005,
      rows: 2,
      cols: 6,
      scallop: 0.065,
      bone: tail,
      name: `tailFanWeb${i + 1}`,
    });
  }
  tailRays.forEach((ray, i) => {
    b.sweep(catmull(ray), [0.003, 0.0021, 0.0015], {
      color: "#9a713b",
      bone: tail,
      sides: 5,
      smooth: false,
      name: `tailFanRay${i + 1}`,
    });
  });
  b.sweep(catmull(tailTips), 0.0023, {
    color: C.cream,
    bone: "tail2",
    sides: 6,
    smooth: false,
    name: "tailFanHem",
  });

  // Clear blue bubbles with graphic rims and surface-seated reflected crescents.
  const bubbleMaterial = b.material(C.bubble);
  bubbleMaterial.transparent = true;
  bubbleMaterial.opacity = 0.25;
  bubbleMaterial.roughness = 0.16;
  bubbleMaterial.metalness = 0.02;
  bubbleMaterial.depthWrite = false;

  const rimMaterial = b.material(C.bubbleRim);
  rimMaterial.transparent = true;
  rimMaterial.opacity = 0.57;
  rimMaterial.roughness = 0.3;
  rimMaterial.depthWrite = false;

  const bubbles = [
    { p: [0, cy - 0.004, 0.329], r: 0.008 },
    { p: [0.004, cy + 0.063, 0.35], r: 0.012 },
    { p: [-0.002, cy + 0.161, 0.36], r: 0.018 },
    { p: [0.024, cy + 0.290, 0.35], r: 0.024 },
    { p: [0.012, cy + 0.435, 0.33], r: 0.028 },
  ];

  bubbles.forEach(({ p, r }, i) => {
    const bubble = b.part(new THREE.SphereGeometry(r, 14, 10), C.bubble, {
      at: p,
      bone: root,
      name: `bubble${i + 1}`,
    });
    b.part(
      new THREE.TorusGeometry(r * 0.935, r * 0.027, 4, 18),
      C.bubbleRim,
      {
        at: [p[0], p[1], p[2] + r * 0.30],
        bone: root,
        name: `bubbleRim${i + 1}`,
      },
    );

    const surface = b.surface(bubble);
    const reflected: THREE.Vector3[] = [];
    for (let k = 0; k <= 6; k++) {
      const a = (48 + (88 * k) / 6) * Math.PI / 180;
      const h = surface.ray(
        [
          p[0] + Math.cos(a) * r * 0.69,
          p[1] + Math.sin(a) * r * 0.69,
          p[2] + r * 3,
        ],
        [0, 0, -1],
      );
      if (h) reflected.push(h.at.addScaledVector(h.n, 0.00035));
    }
    if (reflected.length > 1) {
      b.sweep(catmull(reflected), Math.max(0.0006, r * 0.041), {
        color: "#f7ffff",
        bone: root,
        sides: 5,
        smooth: false,
        name: `bubbleReflection${i + 1}`,
      });
    }
    const gleam = surface.ray(
      [p[0] - r * 0.34, p[1] + r * 0.30, p[2] + r * 3],
      [0, 0, -1],
    );
    if (gleam) {
      b.stick(new THREE.SphereGeometry(1, 6, 4), C.white, gleam, {
        scale: [r * 0.095, r * 0.025, r * 0.12],
        embed: 0.1,
        bone: root,
        name: `bubbleGleam${i + 1}`,
      });
    }
  });

  return b.root;
}
