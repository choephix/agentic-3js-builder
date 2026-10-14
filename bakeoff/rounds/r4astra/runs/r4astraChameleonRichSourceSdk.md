```ts
import * as THREE from "three";
import {
  createBuilder, frame, catmull, bezier, spiral, polyline,
  paint, mix, grain, rng,
  type Chain, type Joint, type Rgb
} from "agentic-3js-builder";

export const meta = {
  name: "Prism on a Twig",
  description: "A jewel-colored panther chameleon, with independently aimed turret eyes, clasping mitten feet, a serrated casque, and a tightly spiraled sunset tail."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Prism on a Twig", paintSize: 2048 });
  const random = rng(741);
  const C = {
    turquoise: "#16bcb1", teal: "#087d7d", blue: "#189b9c",
    mint: "#65d8b5", lime: "#afd447", yellow: "#e4cf65",
    orange: "#ee853b", coral: "#d9533f", red: "#bd343c",
    cream: "#f2edce", dark: "#153e38", pupil: "#071d21",
    bark: "#705038", barkLight: "#987349", wood: "#c5a274",
    leaf: "#72904b", leafDark: "#496d43"
  };

  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const add = (p: readonly number[], d: readonly number[]) => p.map((v, i) => v + d[i]);

  // Color is carried by the skin, rather than by extra floating stripe geometry.
  const colorStops: Array<[number, string]> = [
    [-0.145, C.orange], [-0.100, "#dbce49"], [-0.035, C.lime],
    [0.025, "#6cce59"], [0.072, "#2bc994"], [0.115, C.turquoise],
    [0.190, "#26c9c0"]
  ];
  function bodyColor(z: number): Rgb {
    if (z <= colorStops[0][0]) return mix(colorStops[0][1], colorStops[0][1], 0);
    for (let i = 1; i < colorStops.length; i++) {
      const [za, ca] = colorStops[i - 1];
      const [zb, cb] = colorStops[i];
      if (z <= zb) return mix(ca, cb, (z - za) / (zb - za));
    }
    return mix(C.turquoise, C.mint, 0.25);
  }

  // Small, restrained pebble scales, projected onto the dominant face.
  function pebble(base: string | Rgb, p: THREE.Vector3, n: THREE.Vector3, size = 0.0026): Rgb {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const u = (ax >= ay && ax >= az ? p.z : ay >= az ? p.z : p.x) / size;
    const v = (ax >= ay && ax >= az ? p.y : ay >= az ? p.x : p.y) / (size * 0.87);
    const row = Math.floor(v);
    const xx = u + (row % 2) * 0.5;
    const col = Math.floor(xx);
    const dx = xx - col - 0.5, dy = v - row - 0.5;
    const d = Math.sqrt(dx * dx + dy * dy);
    const variation = Math.sin(col * 23.17 + row * 71.39);
    let out = mix(base, "#254e39", d > 0.445 ? 0.12 : 0.0);
    if (d < 0.29) out = mix(out, "#fff2b4", 0.035 + 0.025 * variation);
    return out;
  }

  const skin = paint((p, n) => {
    let c = bodyColor(p.z);
    const side = Math.abs(n.x);
    if (n.y < -0.32) c = mix(c, "#ccdf9f", 0.28);
    const stripeY = 0.166 + 0.055 * p.z;
    const waveZ = p.z + 0.0045 * Math.sin((p.y - 0.15) * 91) + 0.10 * (p.y - 0.18);
    const bars = [-0.094, -0.062, -0.029, 0.005, 0.038, 0.065];
    let barDistance = 1;
    for (const z of bars) barDistance = Math.min(barDistance, Math.abs(waveZ - z));
    if (barDistance < 0.0058 && side > 0.22 && p.y > 0.135) {
      c = mix(C.red, C.coral, Math.max(0, Math.min(1, (p.y - 0.14) * 9)));
    }
    if (side > 0.37 && Math.abs(p.y - stripeY) < 0.0043) {
      c = barDistance < 0.0020 ? mix(C.cream, C.coral, 0.68) : mix(C.cream, "#ffffff", 0.1);
    }
    if (p.y > 0.227 && side < 0.5) c = mix(c, "#5eaa54", 0.17);
    return pebble(c, p, n);
  });

  const headSkin = paint((p, n) => {
    let c = mix(C.turquoise, "#37cbbb", Math.max(0, (p.y - 0.18) * 4));
    if (p.y < 0.19 && p.z < 0.116 && Math.abs(n.x) > 0.45) {
      const f = (p.z + p.y * 0.25) / 0.012;
      if (f - Math.floor(f) < 0.20) c = mix(c, C.red, 0.75);
    }
    return pebble(c, p, n, 0.0022);
  });
  const jawSkin = paint((p, n) => pebble(mix(C.turquoise, "#c0e4b8", 0.39), p, n, 0.0023));
  const tailSkin = paint((p, n, s) => {
    const t = s[0];
    let c = t < 0.17
      ? mix("#d9c849", C.orange, t / 0.17)
      : mix(C.orange, "#d95348", (t - 0.17) / 0.83);
    const band = t * 12.5 + 0.08 * Math.sin(s[1] * Math.PI / 90);
    if (band - Math.floor(band) < 0.16) c = mix(c, "#b94a35", 0.48);
    return pebble(c, p, n, 0.0024);
  });
  const eyeSkin = paint((p, n, s) => {
    let c: Rgb = mix(C.turquoise, C.teal, 0.1);
    const angle = s[1] * Math.PI / 180;
    if (s[0] > 0.015 && Math.sin(angle * 11 + s[0] * 100) > 0.57) {
      c = mix(c, "#d6ca58", 0.53);
    }
    if (s[0] > 0.023) c = mix(c, "#b3cf62", 0.4);
    return pebble(c, p, n, 0.0018);
  });
  const barkPaint = grain("#654a35", "#8b6949", { size: 0.0018, axis: [0.1, 0.15, 1], seed: 14 });

  function twigAt(z: number): number[] {
    return [0.10 * z, 0.053 + 0.15 * z, z];
  }
  function twigRadius(z: number) {
    return 0.0105 - 0.004 * ((z + 0.30) / 0.547);
  }

  // Skeleton first. The twig has a stationary root, separate from the animal.
  const root = b.joint("root", { at: [0, 0, 0] });
  const pelvis = b.joint("pelvis", {
    at: [0, 0.174, -0.097], parent: root, dir: [0, 0, 1], role: "spine"
  });
  const spine = b.chain("spine", [
    [0, 0.176, -0.099], [0, 0.187, -0.021], [0, 0.189, 0.055]
  ], {
    parent: pelvis, names: ["spineRear", "spineFront", "chest"], role: "spine", up: [0, 1, 0]
  });
  const neck = b.chain("neck", [[0, 0.189, 0.049], [0, 0.195, 0.086]], {
    parent: spine.tip!, names: ["neck"], role: "neck", up: [0, 1, 0]
  });
  const head = b.joint("head", {
    at: [0, 0.192, 0.085], parent: neck, dir: [0, 0, 1], role: "head"
  });
  const jaw = b.joint("jaw", {
    at: [0, 0.166, 0.088], parent: head, dir: [0, 0, 1], role: "jaw"
  });

  const tailPath = bezier(
    [0, 0.169, -0.114], [0, 0.171, -0.145], [0, 0.166, -0.187]
  ).concat(spiral(
    [0, 0.108, -0.187], [0, 0.166, -0.187], [-1, 0, 0],
    { turns: 1.66, r1: 0.0088, pitch: 0.0007 }
  ));
  const tail = b.chain("tail", tailPath, {
    parent: pelvis, count: 13, role: "tail", up: [0, 1, 0]
  });

  const eyes: Array<{ bone: Joint; at: number[]; dir: THREE.Vector3; side: number }> = [];
  for (const side of [1, -1]) {
    const at = [side * 0.018, 0.207, 0.131];
    const dir = new THREE.Vector3(side * 0.88, side === 1 ? 0.055 : 0.13, side === 1 ? 0.47 : -0.37).normalize();
    const bone = b.joint(side === 1 ? "eyeL" : "eyeR", {
      at, parent: head, dir, role: "head"
    });
    eyes.push({ bone, at, dir, side });
  }

  type ToeGroup = { chain: Chain; points: number[][]; count: number; outer: boolean };
  type Leg = {
    chain: Chain; front: boolean; side: number; z: number;
    points: number[][]; toes: ToeGroup[];
  };
  const legs: Leg[] = [];

  for (const front of [true, false]) {
    for (const side of [1, -1]) {
      const suffix = (front ? "F" : "H") + (side === 1 ? "L" : "R");
      const z = front ? 0.096 + side * 0.009 : -0.094 - side * 0.010;
      const [bx, by] = twigAt(z);
      const r = twigRadius(z);
      const points = [
        [side * (front ? 0.023 : 0.029), front ? 0.178 : 0.170, front ? 0.051 : -0.086],
        [side * (front ? 0.061 : 0.064), front ? 0.125 : 0.112, front ? 0.030 : -0.045],
        [bx + side * (r + 0.009), by + r + 0.007, z]
      ];
      const names = front
        ? [side === 1 ? "shoulderL" : "shoulderR", side === 1 ? "elbowL" : "elbowR", side === 1 ? "wristL" : "wristR"]
        : [side === 1 ? "hipL" : "hipR", side === 1 ? "kneeL" : "kneeR", side === 1 ? "ankleL" : "ankleR"];
      const chain = b.chain("leg" + suffix, points, {
        parent: front ? spine.tip! : pelvis, names, role: "leg",
        contact: [bx, by + r, z], up: [0, 0, 1]
      });
      const toes: ToeGroup[] = [];
      for (const outer of [true, false]) {
        const dz = outer ? 0.0055 : -0.0055;
        const p = outer ? [
          [bx + side * (r + 0.007), by + r + 0.007, z + dz],
          [bx + side * (r + 0.004), by + 0.001, z + dz],
          [bx + side * r * 0.85, by - r * 0.72, z + dz]
        ] : [
          [bx + side * (r + 0.006), by + r + 0.007, z + dz],
          [bx - side * r * 0.72, by + r * 0.95, z + dz],
          [bx - side * (r + 0.002), by - r * 0.30, z + dz]
        ];
        const digit = b.chain("digits" + suffix + (outer ? "Outer" : "Inner"), p, {
          parent: chain.tip!, role: "digit", up: [0, 0, 1],
          names: ["digit" + suffix + (outer ? "Outer1" : "Inner1"), "digit" + suffix + (outer ? "Outer2" : "Inner2")]
        });
        toes.push({ chain: digit, points: p, count: outer ? 3 : 2, outer });
      }
      legs.push({ chain, front, side, z, points, toes });
    }
  }

  // Woody support: a sparse, naturally forked twig rather than a presentation pedestal.
  const twigDirection = new THREE.Vector3(0.10, 0.15, 1).normalize();
  const twig = b.sweep([twigAt(-0.30), twigAt(0.247)], [0.0105, 0.0065], {
    bone: root, color: barkPaint, sides: 9, smooth: false, caps: "flat", name: "mainTwig"
  });

  function cutEnd(at: number[], radius: number, direction: THREE.Vector3) {
    const face = V(at).addScaledVector(direction, 0.00035);
    b.part(new THREE.CylinderGeometry(radius, radius, 0.0006, 9), C.wood, {
      at: face, dir: direction, bone: root, name: "exposedWood"
    });
    for (const ratio of [0.37, 0.72]) {
      b.part(new THREE.TorusGeometry(radius * ratio, 0.00028, 3, 12), C.barkLight, {
        at: face.clone().addScaledVector(direction, 0.00034), dir: direction, axis: "z", bone: root
      });
    }
    b.part(new THREE.SphereGeometry(0.00075, 6, 4), C.bark, {
      at: face.clone().addScaledVector(direction, 0.0004), bone: root
    });
  }
  cutEnd(twigAt(0.247), 0.00635, twigDirection);
  cutEnd(twigAt(-0.30), 0.01025, twigDirection.clone().negate());

  const forkPath = catmull([
    twigAt(0.149), [-0.011, 0.091, 0.175], [-0.045, 0.111, 0.202], [-0.066, 0.131, 0.224]
  ]);
  b.sweep(forkPath, [0.0045, 0.0038, 0.0026, 0.0012], {
    color: barkPaint, bone: root, sides: 7, smooth: false, caps: "round", name: "leafTwig"
  });
  b.sweep([twigAt(-0.210), [0.005, 0.036, -0.229], [0.024, 0.039, -0.235]], [0.0042, 0.0019], {
    color: barkPaint, bone: root, sides: 7, smooth: false, caps: "flat"
  });
  cutEnd([0.024, 0.039, -0.235], 0.0019, new THREE.Vector3(1, 0.16, -0.3).normalize());

  for (const z of [-0.212, -0.023, 0.147]) {
    b.part(new THREE.SphereGeometry(1, 9, 5), barkPaint, {
      at: twigAt(z), scale: [twigRadius(z) * 1.12, twigRadius(z) * 1.05, 0.012],
      bone: root, flat: true
    });
    b.ring(frame(twigAt(z), twigDirection), { count: 5, radius: twigRadius(z) * 0.98 }, item => {
      b.stick(new THREE.SphereGeometry(1, 6, 4), C.barkLight, item, {
        scale: [0.0018, 0.0010, 0.0030], embed: 0.5, bone: root
      });
    });
  }

  function leaf(base: number[], tip: number[], width: number) {
    const a = V(base), e = V(tip);
    const mid = a.clone().lerp(e, 0.47).add(new THREE.Vector3(0, 0.005, 0));
    const across = new THREE.Vector3(1, 0.1, -0.35).normalize().multiplyScalar(width);
    const l = mid.clone().add(across), r = mid.clone().sub(across);
    b.slab([a, l, e, mid], { color: C.leaf, thickness: 0.0006, bone: root });
    b.slab([a, mid, e, r], { color: C.leafDark, thickness: 0.0006, bone: root });
    b.sweep([a, mid, e], [0.00065, 0.0002], { color: "#a9b57a", bone: root, sides: 5 });
    for (const t of [0.3, 0.51, 0.7]) {
      const p = a.clone().lerp(e, t).add(new THREE.Vector3(0, 0.005 * Math.sin(t * Math.PI), 0));
      for (const sign of [-1, 1]) {
        const q = a.clone().lerp(e, Math.min(0.94, t + 0.16))
          .addScaledVector(across, sign * Math.sin(t * Math.PI) * 0.72);
        b.rod(p, q, 0.00022, { color: "#93a968", bone: root, sides: 4 });
      }
    }
  }
  leaf([-0.055, 0.121, 0.214], [-0.091, 0.143, 0.239], 0.012);
  leaf([-0.037, 0.107, 0.196], [-0.017, 0.128, 0.228], 0.010);

  // Tall, laterally compressed torso; a simple faceted mass carries the ornate skin.
  const body = b.loft([
    { at: [0, 0.170, -0.126], w: 0.019, h: 0.032 },
    { at: [0, 0.176, -0.091], w: 0.054, h: 0.080 },
    { at: [0, 0.187, -0.035], w: 0.067, h: 0.111 },
    { at: [0, 0.190, 0.023], w: 0.059, h: 0.103 },
    { at: [0, 0.190, 0.058], w: 0.044, h: 0.066 },
    { at: [0, 0.193, 0.087], w: 0.031, h: 0.038 }
  ], {
    color: skin, bone: [pelvis, spine, neck], up: [0, 1, 0],
    sides: 12, smooth: false, caps: "flat", name: "compressedTorso"
  });

  const curledTail = b.sweep(tail, t => 0.0119 * Math.pow(1 - t, 0.90) + 0.0018, {
    color: tailSkin, sides: 9, smooth: false, caps: "round", name: "spiralTail"
  });

  // The upper skull and lower jaw are completely separate pieces.
  const skull = b.extrude([
    [0.068, 0.177], [0.083, 0.170], [0.174, 0.171],
    [0.182, 0.181], [0.174, 0.198], [0.146, 0.225],
    [0.091, 0.260], [0.071, 0.238], [0.062, 0.206]
  ], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0],
    thickness: [0.048, 0.007], bevel: 0.0045,
    color: headSkin, bone: head, name: "casqueAndUpperJaw"
  });

  b.extrude([
    [0.083, 0.166], [0.175, 0.167], [0.174, 0.158],
    [0.155, 0.153], [0.119, 0.151], [0.091, 0.157], [0.078, 0.162]
  ], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0],
    thickness: [0.035, 0.043], bevel: 0.0023,
    color: jawSkin, bone: jaw, name: "lowerJaw"
  });
  b.extrude([
    [0.087, 0.1658], [0.177, 0.1680], [0.177, 0.1704], [0.084, 0.1690]
  ], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0],
    thickness: 0.037, color: C.dark, bone: jaw, name: "mouthOpening"
  });

  for (const side of [1, -1]) {
    b.sweep([
      [side * 0.0190, 0.1705, 0.084],
      [side * 0.0212, 0.1700, 0.116],
      [side * 0.0200, 0.1713, 0.151],
      [side * 0.0151, 0.1740, 0.176]
    ], 0.0014, { color: C.cream, bone: head, sides: 6, caps: "round", name: "upperLip" });
    b.sweep([
      [side * 0.0182, 0.1622, 0.091],
      [side * 0.0188, 0.1585, 0.133],
      [side * 0.0165, 0.1617, 0.171]
    ], 0.0010, { color: "#a6dbad", bone: jaw, sides: 5 });

    const ridge = [
      [side * 0.002, 0.257, 0.091],
      [side * 0.012, 0.234, 0.113],
      [side * 0.022, 0.215, 0.143],
      [side * 0.016, 0.196, 0.174]
    ];
    b.sweep(ridge, [0.0023, 0.0020, 0.0016, 0.0011], {
      color: C.mint, bone: head, sides: 5, smooth: false, name: "casqueRidge"
    });

    const snoutHit = b.surface(skull).ray([side * 0.10, 0.191, 0.166], [-side, 0, 0]);
    if (snoutHit) {
      b.stick(new THREE.SphereGeometry(1, 8, 5), C.teal, snoutHit, {
        scale: [0.0033, 0.0011, 0.0019], embed: 0.4, bone: head
      });
      b.stick(new THREE.SphereGeometry(1, 6, 4), C.dark, snoutHit, {
        scale: [0.0017, 0.0013, 0.0010], embed: 0.10, bone: head
      });
    }
  }

  const helmetTop = polyline([
    [0, 0.241, 0.073], [0, 0.261, 0.091], [0, 0.228, 0.145], [0, 0.199, 0.173]
  ]);
  b.sweep(helmetTop, 0.0020, { color: C.teal, bone: head, sides: 5, smooth: false });
  b.along(helmetTop, 13, pt => {
    b.stick(new THREE.ConeGeometry(0.00215, 0.0038, 4), C.mint,
      frame(pt.at, [0, 1, -0.15]), { bone: head, embed: 0.37, flat: true });
  });

  // Dorsal crest scutes, seated on the actual loft.
  b.along(body, 23, pt => {
    const h = 0.0040 + 0.0018 * Math.sin(pt.t * Math.PI);
    b.stick(new THREE.ConeGeometry(0.00225, h, 4), pt.t < 0.44 ? C.yellow : "#8bd879", pt, {
      embed: 0.26, flat: true, flow: [0, 0, 1], name: "dorsalScute"
    });
  }, { from: 0.08, to: 0.89 });

  for (let i = 0; i < 8; i++) {
    const t = 0.015 + i * 0.022;
    b.stick(new THREE.ConeGeometry(0.0018 * (1 - t), 0.0034 * (1 - t), 4), C.yellow,
      curledTail.at(t), { embed: 0.35, flat: true });
  }

  // Turrets point in deliberately different directions.
  for (const eye of eyes) {
    const { at, dir, bone } = eye;
    b.lathe([
      [0, -0.002], [0.0165, -0.002], [0.0210, 0.005],
      [0.0202, 0.012], [0.0164, 0.021], [0.0101, 0.027],
      [0.0073, 0.0285], [0, 0.0285]
    ], { at, axis: dir, segments: 12, color: eyeSkin, bone, name: "eyeTurret" });

    const end = V(at).addScaledVector(dir, 0.0284);
    b.part(new THREE.TorusGeometry(0.0071, 0.0012, 5, 14), "#c9ce68", {
      at: end, dir, axis: "z", bone, name: "turretEyelid"
    });
    b.part(new THREE.CylinderGeometry(0.0059, 0.0059, 0.0014, 14), "#ca8e3b", {
      at: end.clone().addScaledVector(dir, 0.00065), dir, bone, name: "amberIris"
    });
    b.part(new THREE.SphereGeometry(1, 12, 7), C.pupil, {
      at: end.clone().addScaledVector(dir, 0.0015), dir,
      scale: [0.0041, 0.0018, 0.0041], bone, name: "pupil"
    });
    const highlight = end.clone().addScaledVector(dir, 0.0031)
      .add(new THREE.Vector3(0, 0.00155, 0.0003));
    b.part(new THREE.SphereGeometry(0.0010, 7, 5), "#fff9df", {
      at: highlight, bone, name: "eyeGlint"
    });
  }
  b.material(C.pupil).roughness = 0.22;

  // Slim, bent walking limbs and fleshy opposed toe packets.
  for (const leg of legs) {
    const base = leg.front ? "#26bd97" : "#b7ce4b";
    const limbSkin = paint((p, n, s) => {
      let c: Rgb = mix(base, "#cfe29a", Math.max(0, s[0] - 0.65) * 0.6);
      if ((s[0] > 0.22 && s[0] < 0.29) || (s[0] > 0.53 && s[0] < 0.58)) {
        c = mix(c, C.red, 0.73);
      }
      return pebble(c, p, n, 0.0023);
    });
    b.sweep(leg.chain, [leg.front ? 0.0118 : 0.0145, 0.0092, 0.0053], {
      color: limbSkin, sides: 8, smooth: false, caps: "round", name: "walkingLimb"
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), limbSkin, {
      at: leg.points[1], scale: [0.0097, 0.0090, 0.0100],
      bone: leg.chain.spanJoints[1], flat: true, name: "knuckle"
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), base, {
      at: leg.points[2], scale: [0.0065, 0.0054, 0.0090],
      bone: leg.chain.tip!, flat: true, name: "palm"
    });

    for (const group of leg.toes) {
      const padColor = leg.front ? "#8cd7a0" : "#d1d47a";
      b.sweep(group.chain, t => [0.0041 - 0.0010 * t, (group.count === 3 ? 0.0073 : 0.0057) - 0.0015 * t], {
        color: padColor, sides: 8, smooth: false, caps: "round", name: "opposedMitten"
      });
      const bone = group.chain.spanJoints[1];
      const end = V(group.points[2]);
      const inward = new THREE.Vector3(group.outer ? -leg.side : leg.side, -0.20, 0).normalize();
      for (let k = 0; k < group.count; k++) {
        const offset = (k - (group.count - 1) / 2) * 0.0038;
        const tip = end.clone().add(new THREE.Vector3(0, 0, offset));
        b.capsule(tip.clone().addScaledVector(inward, -0.0035), tip, [0.00215, 0.00165], {
          color: padColor, bone, sides: 6, smooth: false, name: "toeLobe"
        });
        b.spike(tip, tip.clone().addScaledVector(inward, 0.0042), null, 0.0011, {
          color: C.cream, bone, sides: 5, smooth: false, name: "tinyClaw"
        });
        // Narrow seams make the fused toes legible without turning them into fingers.
        b.rod(
          tip.clone().add(new THREE.Vector3(leg.side * 0.001, 0.0017, -0.0015)),
          tip.clone().addScaledVector(inward, -0.0030).add(new THREE.Vector3(leg.side * 0.001, 0.0017, -0.0015)),
          0.00032, { color: leg.front ? C.teal : "#8aa646", bone, sides: 4 }
        );
      }
    }
  }

  // A few raised granules catch the light; most detail remains painted on simple masses.
  const bodySurface = b.surface(body);
  const bumps = bodySurface.scatter(42, {
    rng: random, minDist: 0.008,
    filter: hit => Math.abs(hit.n.x) > 0.69 &&
      Math.abs(hit.at.y - (0.166 + hit.at.z * 0.055)) > 0.010 &&
      hit.at.y > 0.145
  });
  for (const hit of bumps) {
    b.stick(new THREE.SphereGeometry(1, 6, 4),
      hit.at.z > 0.035 ? "#71d8a4" : hit.at.z < -0.075 ? "#dec968" : "#b7dd72",
      hit, {
        scale: [0.00125, 0.00075, 0.00165], embed: 0.4, flat: true, name: "skinGranule"
      });
  }

  const skullSurface = b.surface(skull);
  const cheekBumps = skullSurface.scatter(23, {
    rng: random, minDist: 0.005,
    filter: hit => Math.abs(hit.n.x) > 0.65 && hit.at.y > 0.18 &&
      hit.at.y < 0.205 && hit.at.z < 0.118
  });
  for (const hit of cheekBumps) {
    b.stick(new THREE.SphereGeometry(1, 6, 4), C.mint, hit, {
      scale: [0.0016, 0.00085, 0.0014], embed: 0.42, flat: true
    });
  }

  // Tiny old bark scars, restricted to exposed stretches of the support.
  for (const hit of b.surface(twig).scatter(15, {
    rng: random, minDist: 0.019,
    filter: h => h.n.y > 0.05 && (h.at.z < -0.15 || h.at.z > 0.13)
  })) {
    b.stick(new THREE.SphereGeometry(1, 5, 4), "#a09063", hit, {
      scale: [0.0018, 0.00065, 0.0032], embed: 0.45, bone: root, flat: true
    });
  }

  return b.root;
}
```