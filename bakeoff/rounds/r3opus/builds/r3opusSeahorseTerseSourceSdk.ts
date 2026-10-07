import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  paint,
  mottle,
  cells,
  mix,
  smoothstep,
  interpolate,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Seahorse",
  description:
    "A stylised coral-orange seahorse (~21 cm): hexagonal bony body rings with cream tubercles, a spiked coronet with algae fronds, a fan dorsal fin, pectoral fins, swivel eyes and a hinged snout jaw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "seahorse", paintSize: 1024 });
  const rand = rng(7);

  // Palette
  const CORAL = "#ef7f35";
  const GOLD = "#f7b544";
  const BELLY = "#ffd98a";
  const DEEP = "#9c3a14";
  const CREAM = "#fff1d0";
  const RING = "#cf5e25";
  const FIN = "#ffd2a0";
  const RAY = "#e8742c";
  const FROND = "#8fcf5a";
  const PUPIL = "#120a06";
  const SHINE = "#ffffff";

  b.material(PUPIL).roughness = 0.15;
  b.material(SHINE).roughness = 0.1;

  // ---------- Paints ----------
  const mot = mottle(CORAL, GOLD, { size: 0.02, seed: 3 });
  const bodyPaint = paint((p, n) => {
    let c = mot.at(p, n);
    const belly = smoothstep(0.3, 0.95, n.z) * smoothstep(0.05, 0.09, p.y) * (1 - smoothstep(0.15, 0.17, p.y));
    c = mix(c, BELLY, belly * 0.75);
    const sp = cells(p, 0.0065, 11);
    if (sp.id < 0.35 && sp.d1 < 0.22) return mix(c, CREAM, smoothstep(0.22, 0.12, sp.d1));
    if (sp.id > 0.88 && sp.d1 < 0.17) return mix(c, DEEP, 0.75 * smoothstep(0.17, 0.1, sp.d1));
    return c;
  });
  const headPaint = paint((p, n) => {
    if (p.z > 0.022 && p.z < 0.046 && Math.sin((p.z * 2 * Math.PI) / 0.0065) > 0.8) return CREAM;
    return bodyPaint;
  });
  const dorsalPaint = paint((p, n, s) => {
    const ray = Math.sin((s[1] * 2 * Math.PI) / 0.0026) > 0.55;
    const edge = smoothstep(-0.008, -0.012, s[0]);
    const base = mix(FIN, "#fff3e0", edge * 0.6);
    return ray ? mix(RAY, FIN, edge * 0.5) : base;
  });
  const pecPaint = paint((p, n, s) => {
    const a = Math.atan2(s[1], s[0]);
    return Math.sin(a * 16) > 0.5 ? RAY : FIN;
  });

  // ---------- Skeleton ----------
  const Q: [number, number, number][] = [
    [0, 0.181, -0.006], // 0 head base
    [0, 0.166, -0.01], // 1 neck
    [0, 0.15, -0.004], // 2 chest top
    [0, 0.128, 0.002], // 3 chest
    [0, 0.105, 0.0], // 4 belly
    [0, 0.085, -0.006], // 5 pelvis
    [0, 0.062, -0.012], // 6 tail
    [0, 0.04, -0.013],
    [0, 0.02, -0.008],
    [0, 0.0035, 0.004],
    [0, 0.006, 0.017], // 10 tail tip (curl)
  ];

  b.joint("pelvis", { at: Q[5] });
  const spine = b.chain("spine", catmull([Q[5], Q[4], Q[3], Q[2]]), { parent: "pelvis", role: "spine" });
  const neck = b.chain("neck", catmull([Q[2], Q[1], Q[0]]), { parent: spine, role: "neck" });
  b.joint("head", { parent: neck, at: Q[0], aim: [0, 0.177, 0.05], role: "head" });
  const tail = b.chain("tail", catmull([Q[5], Q[6], Q[7], Q[8], Q[9], Q[10]]), {
    parent: "pelvis",
    count: 8,
    role: "tail",
  });
  b.joint("jaw", { parent: "head", at: [0, 0.1742, 0.044], aim: [0, 0.1745, 0.052], role: "jaw" });
  b.joint("eyeL", { parent: "head", at: [0.0068, 0.1885, 0.003], dir: [1, 0, 0] });
  b.joint("eyeR", { parent: "head", at: [-0.0068, 0.1885, 0.003], dir: [-1, 0, 0] });
  b.joint("dorsal", { parent: "spine1", at: [0, 0.095, -0.013], dir: [0, 0, -1], role: "fan" });
  b.joint("pectoralL", { parent: "neck2", at: [0.004, 0.17, -0.006], dir: [0.55, 0, -0.83], role: "fan" });
  b.joint("pectoralR", { parent: "neck2", at: [-0.004, 0.17, -0.006], dir: [-0.55, 0, -0.83], role: "fan" });

  // ---------- Body (neck → trunk → tail), one skinned hexagonal tube ----------
  const bodyPath = catmull(Q);
  const knots = bodyPath.knots;
  const rys = [0.0065, 0.0062, 0.0085, 0.0125, 0.0125, 0.0095, 0.0068, 0.0052, 0.004, 0.0032, 0.0022];
  const rxs = [0.0055, 0.005, 0.0065, 0.0085, 0.0088, 0.0072, 0.0058, 0.0048, 0.0038, 0.0032, 0.0022];
  const radius = (t: number): [number, number] => [interpolate(knots, rxs, t), interpolate(knots, rys, t)];
  const bones = [neck, spine, tail];
  b.sweep(bodyPath, radius, {
    color: bodyPaint,
    bone: bones,
    section: { ngon: 6 },
    up: [0, 0, 1],
    name: "body",
  });

  // Bony rings with tubercles
  const frames = bodyPath.frames([0, 0, 1]);
  const RINGS = 26;
  for (let i = 0; i < RINGS; i++) {
    const t = 0.1 + ((0.955 - 0.1) * i) / (RINGS - 1);
    b.sweep(bodyPath, (u: number) => {
      const r = radius(u);
      return [r[0] * 1.13, r[1] * 1.13];
    }, {
      from: t - 0.0045,
      to: t + 0.0045,
      color: RING,
      bone: bones,
      section: { ngon: 6 },
      up: [0, 0, 1],
      caps: "flat",
      name: `ring${i + 1}`,
    });
    const c = bodyPath.at(t);
    const T = bodyPath.tangentAt(t);
    const N = frames.normalAt(t);
    const [rx, ry] = radius(t);
    const scale = Math.max(0.55, rx / 0.008);
    for (const s of [1, -1]) {
      const base = c.clone().add(new THREE.Vector3(s * rx * 0.85, 0, 0));
      const dir = new THREE.Vector3(s, 0, 0).addScaledVector(T, -0.3);
      b.spike(base, dir, (0.0022 + rand() * 0.0008) * scale, 0.0009 * scale, { color: CREAM, sides: 5 });
    }
    const back = c.clone().addScaledVector(N, -ry * 0.9);
    const bdir = N.clone().negate().addScaledVector(T, -0.4);
    b.spike(back, bdir, (0.0028 + rand() * 0.001) * scale, 0.001 * scale, { color: CREAM, sides: 5 });
  }

  // ---------- Head ----------
  b.loft(
    [
      { at: [0, 0.181, -0.012], w: 0.012, h: 0.016 },
      { at: [0, 0.186, -0.002], w: 0.016, h: 0.022 },
      { at: [0, 0.184, 0.01], w: 0.012, h: 0.015 },
      { at: [0, 0.18, 0.02], w: 0.0065, h: 0.0075 },
      { at: [0, 0.177, 0.036], w: 0.0055, h: 0.006 },
      { at: [0, 0.176, 0.048], w: 0.0075, h: 0.0075 },
    ],
    { color: headPaint, bone: "head", sides: 10, smooth: false, name: "head" },
  );
  // mouth + lower jaw
  b.part(new THREE.SphereGeometry(0.0017, 8, 6), PUPIL, { at: [0, 0.1752, 0.0525], bone: "head" });
  b.capsule([0, 0.1735, 0.0445], [0, 0.1738, 0.0515], 0.0026, { color: "#e5793a", bone: "jaw", sides: 8 });

  // coronet
  b.rod([0, 0.192, -0.005], [0, 0.2025, -0.0055], [0.0036, 0.003], {
    color: RING,
    bone: "head",
    section: { ngon: 5 },
  });
  b.ring(frame([0, 0.2025, -0.0055], [0, 1, 0]), { count: 5, radius: 0.0026, tilt: 50 }, (item) => {
    b.spike(item, item, 0.0045, 0.0011, { color: CREAM, bone: "head", sides: 5 });
  });
  // algae fronds caught on the coronet
  const fronds: [number, number, number][][] = [
    [[0, 0.203, -0.006], [0.002, 0.209, -0.01], [0.001, 0.212, -0.018], [-0.001, 0.209, -0.023]],
    [[-0.001, 0.2025, -0.005], [-0.003, 0.207, -0.003], [-0.005, 0.214, -0.006]],
    [[0.001, 0.2025, -0.007], [0.004, 0.205, -0.012], [0.007, 0.204, -0.017]],
  ];
  fronds.forEach((pts, i) =>
    b.sweep(catmull(pts), [0.0009, 0.0003], { color: FROND, bone: "head", sides: 5, name: `frond${i + 1}` }),
  );

  // eyes, brows, gill plates, pectoral fins (per side)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eye = `eye${side}`;
    const ec = new THREE.Vector3(s * 0.0068, 0.1885, 0.003);
    const irisPaint = paint((p) => {
      const d = Math.hypot(p.y - ec.y, p.z - ec.z);
      return d < 0.0022 ? "#ffe07a" : d < 0.003 ? "#e8892a" : "#5a2a10";
    });
    b.part(new THREE.SphereGeometry(0.0038, 12, 9), irisPaint, { at: ec, bone: eye });
    b.part(new THREE.SphereGeometry(0.0018, 10, 8), PUPIL, {
      at: ec.clone().add(new THREE.Vector3(s * 0.003, 0, 0.0002)),
      bone: eye,
    });
    b.part(new THREE.SphereGeometry(0.0007, 6, 5), SHINE, {
      at: ec.clone().add(new THREE.Vector3(s * 0.0042, 0.0012, 0.0012)),
      bone: eye,
    });
    b.part(new THREE.TorusGeometry(0.0041, 0.0008, 5, 12), RING, {
      at: ec.clone().add(new THREE.Vector3(s * 0.0006, 0, 0)),
      dir: [s, 0, 0],
      axis: "z",
      bone: "head",
    });
    b.capsule([s * 0.0078, 0.1928, -0.0015], [s * 0.0066, 0.1918, 0.0078], 0.0012, {
      color: RING,
      bone: "head",
      sides: 6,
    });
    b.spike([s * 0.006, 0.1925, 0.002], [s * 0.5, 1, 0.2], 0.004, 0.001, {
      color: CREAM,
      bone: "head",
      sides: 5,
    });
    // gill plate
    b.part(new THREE.SphereGeometry(1, 8, 6), RING, {
      at: [s * 0.0058, 0.1805, -0.004],
      scale: [0.0025, 0.0055, 0.0045],
      bone: "head",
      flat: true,
    });
    // pectoral fin
    b.extrude(
      [
        [0, -0.0025],
        [0.004, -0.0045],
        [0.0075, -0.0035],
        [0.0095, -0.0005],
        [0.009, 0.003],
        [0.006, 0.0055],
        [0.002, 0.0045],
        [0, 0.0025],
      ],
      {
        color: pecPaint,
        at: [s * 0.0032, 0.17, -0.0065],
        x: [s * 0.55, 0.05, -0.83],
        y: [0, 1, 0],
        thickness: 0.0008,
        smoothing: 1,
        bone: `pectoral${side}`,
        name: `pectoralFin${side}`,
      },
    );
  }

  // ---------- Dorsal fin ----------
  b.extrude(
    [
      [0.002, 0],
      [-0.005, 0.0015],
      [-0.0105, 0.007],
      [-0.0125, 0.015],
      [-0.0105, 0.023],
      [-0.004, 0.028],
      [0.002, 0.027],
    ],
    {
      color: dorsalPaint,
      at: [0, 0.082, -0.012],
      thickness: 0.0012,
      bevel: 0.0003,
      smoothing: 1,
      bone: "dorsal",
      name: "dorsalFin",
    },
  );
  // fin base ridge
  b.capsule([0, 0.083, -0.0135], [0, 0.109, -0.0118], 0.0012, { color: RING, bone: "dorsal", sides: 6 });

  // ---------- Seat on the floor ----------
  const root = b.root;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;
  root.updateMatrixWorld(true);
  return b.root;
}
