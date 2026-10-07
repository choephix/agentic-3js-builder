import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  smoothstep,
  catmull,
  bezier,
  arc,
} from "../../../../src/index";

export const meta = {
  name: "Oh! — the startled puffer",
  description:
    "A fully inflated, leopard-spotted little puffer with ivory prickles, anxious saucer eyes, a tiny pout, golden ray fins and a rising trail of bubbles.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Startled pufferfish", paintSize: 1024 });
  const random = rng(24017);
  const CY = 0.278;
  const RX = 0.258;
  const RY = 0.25;
  const RZ = 0.25;

  const C = {
    ivory: "#fff9e9",
    eyeWhite: "#fff9e7",
    socket: "#c8a86d",
    brow: "#89603b",
    amber: "#b88039",
    irisEdge: "#66462d",
    pupil: "#18242a",
    shine: "#ffffff",
    lip: "#dfb17e",
    lowerLip: "#edc69b",
    mouth: "#523a35",
    tongue: "#c88272",
    finRay: "#c59b55",
    finEdge: "#f6e2ad",
    spikeTop: "#f3e3b8",
    spikeBottom: "#fffbee",
    spikeBase: "#d8bc7d",
    paleBase: "#eee4c7",
    bubble: "#bce9ed",
    bubbleRim: "#e9ffff",
  };

  // Skeleton first. The body is a continuous skin; the appendages remain extended.
  const root = b.joint("root", {
    at: [0, CY, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, CY, -RZ],
      [0, CY, -0.02],
      [0, CY, RZ],
    ],
    {
      parent: root,
      names: ["spineBack", "spineFront"],
      role: "spine",
      up: [0, 1, 0],
    },
  );
  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [0, CY, 0.155],
    dir: [0, 0, 1],
    role: "head",
  });
  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: [0, 0.267, 0.235],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.244, 0.237],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const eyes = [1, -1].map((sign) => ({
    sign,
    joint: b.joint(sign === 1 ? "eyeL" : "eyeR", {
      parent: head,
      at: [sign * 0.131, 0.367, 0.213],
      dir: [sign * 0.15, 0.03, 1],
      role: "head",
    }),
  }));
  const tail = b.chain(
    "tail",
    [
      [0, CY, -0.219],
      [0, CY, -0.278],
      [0, CY, -0.322],
      [0, CY, -0.433],
    ],
    {
      parent: spine.joints[0],
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
      up: [0, 1, 0],
    },
  );
  const fins = [1, -1].map((sign) => {
    const suffix = sign === 1 ? "L" : "R";
    const chain = b.chain(
      `pectoral${suffix}`,
      [
        [sign * 0.239, 0.279, 0],
        [sign * 0.308, 0.279, -0.009],
        [sign * 0.391, 0.279, -0.025],
      ],
      {
        parent: spine.joints[1],
        names: [`fin${suffix}`, `finTip${suffix}`],
        role: "fan",
        up: [0, 1, 0],
      },
    );
    return { sign, suffix, chain };
  });
  const bubblesBone = b.joint("bubbles", {
    parent: root,
    at: [0, 0, 0],
  });

  // Hand-designed irregular rosettes in spherical coordinates. Their pigment
  // disappears gradually into the clean, milky underside.
  const rosettes = Array.from({ length: 68 }, (_, i) => {
    const y = -0.18 + (1.17 * (i + 0.5)) / 68;
    const az = i * Math.PI * (3 - Math.sqrt(5)) + (random() - 0.5) * 0.2;
    const r = Math.sqrt(1 - y * y);
    const center = new THREE.Vector3(r * Math.cos(az), y, r * Math.sin(az));
    const u = new THREE.Vector3(center.z, 0, -center.x).normalize();
    u.applyAxisAngle(center, random() * Math.PI);
    const v = new THREE.Vector3().crossVectors(center, u).normalize();
    const sy = 0.112 + random() * 0.039;
    return {
      center,
      u,
      v,
      sx: sy * (0.8 + random() * 0.4),
      sy,
      phase: random() * Math.PI * 2,
      solid: i % 9 === 0,
      dark: i % 3 === 0 ? "#805535" : "#704930",
    };
  });

  const coat = paint((p) => {
    const d = new THREE.Vector3(p.x / RX, (p.y - CY) / RY, p.z / RZ).normalize();
    const base = mix("#fffdef", "#eed28b", smoothstep(0.19, 0.445, p.y));
    const pigment = smoothstep(0.216, 0.357, p.y);
    if (pigment <= 0) return base;

    for (const spot of rosettes) {
      if (d.dot(spot.center) < 0.965) continue;
      const u = d.dot(spot.u) / spot.sx;
      const v = d.dot(spot.v) / spot.sy;
      const angle = Math.atan2(v, u);
      const edge =
        1 +
        0.13 * Math.sin(angle * 3 + spot.phase) +
        0.075 * Math.sin(angle * 5 - spot.phase);
      const q = Math.hypot(u, v) / edge;
      if (q > 1.075) continue;

      const outer = 1 - smoothstep(0.94, 1.075, q);
      if (spot.solid) return mix(base, spot.dark, outer * pigment * 0.94);

      const broken =
        1 - smoothstep(0.77, 0.94, Math.cos(angle + spot.phase));
      const ring = outer * smoothstep(0.51, 0.67, q) * broken;
      const honeyCenter = mix(
        base,
        "#ba904e",
        (1 - smoothstep(0.49, 0.71, q)) * 0.25 * pigment,
      );
      return mix(honeyCenter, spot.dark, ring * pigment);
    }
    return base;
  });

  const body = b.sweep(
    [
      [0, CY, -RZ],
      [0, CY, RZ],
    ],
    (t) => {
      const circle = Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
      return [RX * circle, RY * circle];
    },
    {
      bone: [spine, head],
      color: coat,
      sides: 24,
      smooth: false,
      caps: "flat",
      up: [0, 1, 0],
      name: "Inflated spotted body",
    },
  );
  const skin = b.surface(body);

  // The narrow tail wrist disappears into the big round body.
  b.sweep(tail, (t) => 0.026 * (1 - 0.65 * t), {
    from: 0,
    to: 0.62,
    color: "#e5c57f",
    sides: 8,
    smooth: false,
    name: "Tail wrist",
  });

  const finPaint = paint((_p, _n, s) => {
    const t = s[0];
    const gold = mix("#d5a555", "#f4dd9c", smoothstep(0.08, 0.8, t));
    return mix(gold, "#fff0c6", smoothstep(0.83, 0.96, t));
  });

  // Tail fan: individual closed membrane wedges between supporting rays.
  const tailRoot = new THREE.Vector3(0, CY, -0.307);
  const tailTips = [
    [0, 0.372, -0.404],
    [0, 0.356, -0.444],
    [0, 0.322, -0.453],
    [0, CY, -0.449],
    [0, 0.234, -0.453],
    [0, 0.2, -0.444],
    [0, 0.184, -0.404],
  ];
  const tailRays = tailTips.map((p) => {
    const tip = new THREE.Vector3(...(p as [number, number, number]));
    return bezier(
      tailRoot,
      [0, CY + (tip.y - CY) * 0.48, -0.369],
      tip,
    );
  });
  for (let i = 0; i < tailRays.length - 1; i++) {
    const a = tailRays[i];
    const c = tailRays[i + 1];
    b.membrane(a, c, {
      bone: tail,
      color: finPaint,
      thickness: 0.006,
      rows: 2,
      cols: 6,
      scallop: 0.07,
      name: `Tail fan panel ${i + 1}`,
    });
    const rim = Array.from({ length: 6 }, (_, k) => {
      const s = k / 5;
      const t = 1 - 0.07 * 4 * s * (1 - s);
      return a.at(t).lerp(c.at(t), s);
    });
    b.sweep(catmull(rim), 0.002, {
      bone: tail,
      color: C.finEdge,
      sides: 5,
    });
  }
  tailRays.forEach((ray, i) =>
    b.sweep(ray, [0.0034, 0.0015], {
      bone: tail,
      color: C.finRay,
      sides: 5,
      smooth: false,
      name: `Tail ray ${i + 1}`,
    }),
  );

  // Small, open pectoral fans, with a gentle ripple through their outer edge.
  for (const { sign, suffix, chain } of fins) {
    const finRoot = new THREE.Vector3(sign * 0.237, 0.279, 0);
    const tips = [
      [sign * 0.334, 0.345, -0.005],
      [sign * 0.377, 0.328, -0.012],
      [sign * 0.396, 0.294, -0.02],
      [sign * 0.392, 0.26, -0.025],
      [sign * 0.374, 0.229, -0.033],
      [sign * 0.335, 0.214, -0.039],
    ];
    const rays = tips.map((p) => {
      const tip = new THREE.Vector3(...(p as [number, number, number]));
      const control = finRoot.clone().lerp(tip, 0.56);
      control.z += 0.009;
      return bezier(finRoot, control, tip);
    });
    for (let i = 0; i < rays.length - 1; i++) {
      b.membrane(rays[i], rays[i + 1], {
        bone: chain,
        color: finPaint,
        thickness: 0.0045,
        rows: 2,
        cols: 5,
        scallop: 0.11,
        name: `Pectoral ${suffix} panel ${i + 1}`,
      });
      const rim = Array.from({ length: 6 }, (_, k) => {
        const s = k / 5;
        const t = 1 - 0.11 * 4 * s * (1 - s);
        return rays[i].at(t).lerp(rays[i + 1].at(t), s);
      });
      b.sweep(catmull(rim), 0.0017, {
        bone: chain,
        color: C.finEdge,
        sides: 5,
      });
    }
    rays.forEach((ray, i) =>
      b.sweep(ray, [0.0027, 0.0012], {
        bone: chain,
        color: C.finRay,
        sides: 5,
        smooth: false,
        name: `Pectoral ${suffix} ray ${i + 1}`,
      }),
    );
    b.part(new THREE.SphereGeometry(1, 10, 6), "#e5c88b", {
      bone: chain.joints[0],
      at: finRoot,
      scale: [0.02, 0.025, 0.018],
      flat: true,
      name: `Pectoral ${suffix} hinge`,
    });
  }

  // Little gill crescents, draped onto the actual side surfaces.
  for (const sign of [1, -1]) {
    const points = [
      [sign * 0.28, 0.326, 0.065],
      [sign * 0.28, 0.307, 0.081],
      [sign * 0.28, 0.282, 0.082],
      [sign * 0.28, 0.262, 0.069],
    ].map((p) => {
      const hit = skin.nearest(p);
      return hit.at.addScaledVector(hit.n, 0.002);
    });
    b.sweep(catmull(points), [0.0013, 0.0027, 0.0027, 0.001], {
      bone: spine.joints[1],
      color: "#a5834d",
      sides: 5,
      name: sign === 1 ? "Gill L" : "Gill R",
    });
  }

  // Hundreds of short, blunt-based, pointed prickles, not porcupine quills.
  const spineRandom = rng(691);
  const prickleHits = skin.scatter(185, {
    rng: spineRandom,
    minDist: 0.035,
    keepOut: (p) => {
      const eyeRegion =
        ((Math.abs(p.x) - 0.131) / 0.105) ** 2 +
          ((p.y - 0.367) / 0.108) ** 2 <
        1;
      if (p.z > 0.115 && eyeRegion) return true;
      if (p.z > 0.18 && Math.abs(p.x) < 0.072 && p.y > 0.208 && p.y < 0.324)
        return true;
      if (Math.abs(p.x) > 0.213 && Math.abs(p.z) < 0.065 && p.y > 0.223 && p.y < 0.342)
        return true;
      return false;
    },
  });

  const padGeometry = new THREE.SphereGeometry(1, 8, 4);
  prickleHits.forEach((hit, i) => {
    let length = 0.019 + spineRandom() * 0.01;
    const radius = 0.0053 + spineRandom() * 0.0021;
    if (hit.n.y < -0.2) {
      length = Math.min(length, (hit.at.y - 0.001) / -hit.n.y);
    }
    const upper = hit.at.y > 0.32;
    const middle = hit.at.y > 0.22;
    b.stick(
      padGeometry,
      upper ? C.spikeBase : C.paleBase,
      hit,
      {
        scale: [radius * 1.28, 0.0025, radius * 1.28],
        embed: 0.48,
        flat: true,
        name: `Prickle socket ${i + 1}`,
      },
    );
    b.stick(
      new THREE.ConeGeometry(radius, length, 5, 1),
      middle ? C.spikeTop : C.spikeBottom,
      hit,
      {
        embed: 0.1,
        flat: true,
        spin: spineRandom() * 72,
        name: `Prickle ${i + 1}`,
      },
    );
  });

  // A bottom prickle provides the model's exact floor contact.
  const bottom = skin.ray([0, -1, 0], [0, 1, 0]);
  if (bottom) {
    b.spike(bottom, [0, -1, 0], bottom.at.y, 0.006, {
      color: C.spikeBottom,
      sides: 5,
      smooth: false,
      name: "Lowest ivory prickle",
    });
  }

  // Enormous anxious eyes: warm sockets, creamy globes, amber irises, dark pupils.
  for (const { sign, joint } of eyes) {
    const side = sign === 1 ? "L" : "R";
    const gaze = [sign * 0.15, 0.03, 1];
    const socket = b.part(new THREE.SphereGeometry(1, 20, 12), C.socket, {
      bone: head,
      at: [sign * 0.131, 0.367, 0.2],
      scale: [0.084, 0.092, 0.052],
      dir: gaze,
      axis: "z",
      flat: true,
      name: `Eye socket ${side}`,
    });
    const white = b.part(new THREE.SphereGeometry(1, 24, 16), C.eyeWhite, {
      bone: joint,
      at: [sign * 0.131, 0.367, 0.213],
      scale: [0.076, 0.085, 0.061],
      dir: gaze,
      axis: "z",
      name: `Eye white ${side}`,
    });

    const ix = sign * 0.115;
    const iy = 0.376;
    const eyeHit = b.surface(white).ray([ix, iy, 1], [0, 0, -1])!;
    const irisBorder = b.stick(
      new THREE.SphereGeometry(1, 20, 12).scale(0.043, 0.006, 0.043),
      C.irisEdge,
      eyeHit,
      { embed: 0.16, flow: [0, 1, 0], bone: joint, name: `Iris rim ${side}` },
    );
    const irisHit = b.surface(irisBorder).ray([ix, iy, 1], [0, 0, -1])!;
    const iris = b.stick(
      new THREE.SphereGeometry(1, 20, 12).scale(0.0395, 0.005, 0.0395),
      C.amber,
      irisHit,
      { embed: 0.27, flow: [0, 1, 0], bone: joint, name: `Amber iris ${side}` },
    );
    const pupilHit = b.surface(iris).ray([ix, iy + 0.001, 1], [0, 0, -1])!;
    const pupil = b.stick(
      new THREE.SphereGeometry(1, 20, 12).scale(0.0295, 0.0055, 0.0315),
      C.pupil,
      pupilHit,
      { embed: 0.2, flow: [0, 1, 0], bone: joint, name: `Pupil ${side}` },
    );

    const pupilSurface = b.surface(pupil);
    for (const [dx, dy, size] of [
      [-0.01, 0.012, 0.0083],
      [0.009, -0.009, 0.0038],
    ]) {
      const glint = pupilSurface.ray([ix + dx, iy + dy, 1], [0, 0, -1]);
      if (glint) {
        b.stick(
          new THREE.SphereGeometry(1, 10, 6).scale(size, 0.0022, size),
          C.shine,
          glint,
          { embed: 0.13, bone: joint, name: `Eye glint ${side}` },
        );
      }
    }

    // Brows lift toward the bridge and droop outward, making the worry readable.
    const browSurface = b.surface([socket, white]);
    const browPoints = [
      [sign * 0.082, 0.433, 0.36],
      [sign * 0.118, 0.455, 0.36],
      [sign * 0.15, 0.447, 0.36],
      [sign * 0.193, 0.421, 0.36],
    ].map((p) => {
      const hit = browSurface.nearest(p);
      return hit.at.addScaledVector(hit.n, 0.0028);
    });
    b.sweep(catmull(browPoints), [0.004, 0.008, 0.008, 0.0035], {
      bone: head,
      color: C.brow,
      sides: 7,
      name: `Worried brow ${side}`,
    });
  }

  b.material(C.pupil).roughness = 0.2;
  b.material(C.amber).roughness = 0.34;
  b.material(C.eyeWhite).roughness = 0.42;

  // Two understated nostril pores on the bridge.
  for (const sign of [1, -1]) {
    const hit = skin.ray([sign * 0.037, 0.31, 0.8], [0, 0, -1]);
    if (hit) {
      b.stick(
        new THREE.SphereGeometry(1, 8, 6).scale(0.0038, 0.0018, 0.0027),
        "#a3804e",
        hit,
        { bone: head, embed: 0.16, name: sign === 1 ? "Nostril L" : "Nostril R" },
      );
    }
  }

  // Separate upper and lower lips surround a very small, surprised O.
  b.part(new THREE.SphereGeometry(1, 16, 10), "#f5dfb4", {
    bone: upperJaw,
    at: [0, 0.257, 0.251],
    scale: [0.037, 0.03, 0.022],
    name: "Pouting muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 16, 10), C.mouth, {
    bone: head,
    at: [0, 0.255, 0.274],
    scale: [0.0205, 0.0155, 0.004],
    name: "Small open mouth",
  });
  const lipPath = (sign: number) =>
    catmull(
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 8) * Math.PI;
        return [
          0.024 * Math.cos(a),
          0.255 + sign * 0.018 * Math.sin(a),
          0.278 + 0.004 * Math.sin(a),
        ];
      }),
    );
  b.sweep(lipPath(1), (t) => 0.0054 + 0.0013 * Math.sin(t * Math.PI), {
    bone: upperJaw,
    color: C.lip,
    sides: 8,
    name: "Upper pouting lip",
  });
  b.sweep(lipPath(-1), (t) => 0.0056 + 0.0018 * Math.sin(t * Math.PI), {
    bone: jaw,
    color: C.lowerLip,
    sides: 8,
    name: "Lower pouting lip",
  });
  b.part(new THREE.SphereGeometry(1, 12, 6), C.tongue, {
    bone: jaw,
    at: [0, 0.2455, 0.278],
    scale: [0.0105, 0.003, 0.002],
    name: "Tiny lower mouth interior",
  });

  // Sparse, glassy bubbles with physical crescent highlights rather than solid dots.
  const bubbleMaterial = b.material(C.bubble);
  bubbleMaterial.transparent = true;
  bubbleMaterial.opacity = 0.23;
  bubbleMaterial.depthWrite = false;
  bubbleMaterial.roughness = 0.13;
  bubbleMaterial.metalness = 0.05;

  const bubbles = [
    { p: [0.0, 0.322, 0.326], r: 0.012 },
    { p: [-0.025, 0.416, 0.366], r: 0.018 },
    { p: [0.019, 0.554, 0.399], r: 0.027 },
    { p: [-0.045, 0.706, 0.412], r: 0.021 },
  ];
  bubbles.forEach(({ p, r }, i) => {
    const center = new THREE.Vector3(...(p as [number, number, number]));
    b.part(new THREE.SphereGeometry(r, 20, 12), C.bubble, {
      bone: bubblesBone,
      at: center,
      name: `Bubble ${i + 1}`,
    });

    const rimCenter = center.clone().add(new THREE.Vector3(0, 0, r * 0.59));
    const rimRadius = r * 0.805;
    const angle = Math.PI / 5;
    const rimStart = rimCenter
      .clone()
      .add(new THREE.Vector3(rimRadius * Math.cos(angle), rimRadius * Math.sin(angle), 0));
    b.sweep(arc(rimCenter, rimStart, [0, 0, 1], 121), r * 0.043, {
      bone: bubblesBone,
      color: C.bubbleRim,
      sides: 5,
      name: `Bubble crescent ${i + 1}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), C.shine, {
      bone: bubblesBone,
      at: center.clone().add(new THREE.Vector3(-r * 0.31, r * 0.4, r * 0.866)),
      scale: [r * 0.115, r * 0.18, r * 0.045],
      rotation: [0, 0, -27],
      name: `Bubble sparkle ${i + 1}`,
    });
  });

  return b.root;
}
