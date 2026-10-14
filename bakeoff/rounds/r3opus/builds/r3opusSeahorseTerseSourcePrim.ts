import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  paint,
  spots,
  mottle,
  mix,
  resolve,
  smoothstep,
  interpolate,
} from "../../../../src/index";

export const meta = {
  name: "Seahorse",
  description:
    "A stylized golden seahorse with a ringed, knobbly body, a square curling tail, a coronet crown, a long tubular snout with an opening lower jaw, and ray-striped fins.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "seahorse" });

  // ---------------- palette & paints ----------------
  const GOLD = "#f4b23a";
  const AMBER = "#ea8a2a";
  const CREAM = "#ffe6a3";
  const RING = "#a8481a";
  const SPECK = "#fff8e8";
  const SPINE = "#d0602a";
  const CROWN = "#e8862e";
  const FIN = "#ffe4b8";
  const FINRAY = "#f0913f";

  const mottled = mottle(GOLD, AMBER, { size: 0.03, seed: 4, contrast: 0.8 });
  const skinBase = paint((p, n) => mix(resolve(mottled, p, n), CREAM, smoothstep(0.15, 0.85, n.z) * 0.85));
  const speckled = spots(skinBase, SPECK, { size: 0.009, amount: 0.16, seed: 3 });
  const ringed = (count: number) =>
    paint((p, n, s) => {
      const f = (((s[0] * count) % 1) + 1) % 1;
      const d = Math.min(f, 1 - f);
      const k = smoothstep(0.12, 0.05, d);
      return mix(resolve(speckled, p, n), RING, k * 0.85);
    });
  const dorsalPaint = paint((p, n, s) => {
    const f = (((s[1] / 0.0032) % 1) + 1) % 1;
    const ray = smoothstep(0.32, 0.12, Math.min(f, 1 - f));
    const rim = smoothstep(0.014, 0.022, s[0]);
    return mix(mix(FIN, FINRAY, ray * 0.8), "#f7a24e", rim * 0.6);
  });
  const pectoralPaint = paint((p, n, s) => {
    const a = Math.atan2(s[1], s[0]);
    const f = (((a * 7) / Math.PI) % 1 + 1) % 1;
    const ray = smoothstep(0.3, 0.1, Math.min(f, 1 - f));
    return mix(FIN, FINRAY, ray * 0.8);
  });

  // ---------------- skeleton ----------------
  b.joint("root", { at: [0, 0.105, 0.002] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.105, 0.002],
      [0, 0.135, 0.008],
      [0, 0.165, 0.005],
      [0, 0.188, -0.004],
    ]),
    { parent: "root", names: ["spine1", "spine2", "spine3"], role: "spine", up: [0, 0, 1] },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.188, -0.004],
      [0, 0.206, 0.0],
    ],
    { parent: "spine3", names: ["neck"], role: "neck", up: [0, 0, 1] },
  );

  const H = new THREE.Vector3(0, 0.208, 0.002);
  const d = new THREE.Vector3(0, -0.32, 1).normalize();
  const along = (s: number, extra: [number, number, number] = [0, 0, 0]) =>
    H.clone().addScaledVector(d, s).add(new THREE.Vector3(...extra));

  b.joint("head", { parent: "neck", at: H, dir: d, role: "head" });
  const tip = along(0.044);
  b.joint("jaw", { parent: "head", at: along(0.038, [0, -0.003, 0]), dir: d, role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.105, 0.002],
      [0, 0.08, -0.012],
      [0, 0.052, -0.016],
      [0, 0.026, -0.008],
      [0, 0.01, 0.012],
      [0, 0.016, 0.032],
      [0, 0.034, 0.036],
      [0, 0.042, 0.022],
    ]),
    {
      parent: "root",
      count: 7,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tail7"],
      role: "tail",
    },
  );

  b.joint("dorsalFin", { parent: "spine1", at: [0, 0.122, -0.01], dir: [0, 0, -1], role: "fan" });
  b.joint("finL", { parent: "neck", at: [0.0085, 0.193, -0.004], dir: [0.5, 0, -1], role: "fan" });
  b.joint("finR", { parent: "neck", at: [-0.0085, 0.193, -0.004], dir: [-0.5, 0, -1], role: "fan" });

  // ---------------- body ----------------
  const bodyX = [0, 0.33, 0.66, 1];
  const rxs = [0.011, 0.0145, 0.013, 0.0085];
  const rys = [0.014, 0.019, 0.016, 0.0105];
  const body = b.sweep(spine, {
    radius: (t: number) => [interpolate(bodyX, rxs, t), interpolate(bodyX, rys, t)] as [number, number],
    color: ringed(11),
    section: { ngon: 7 },
    shift: (t: number) => [0, 0.004 * Math.sin(Math.PI * t)] as [number, number],
  });

  b.sweep(neck, {
    radius: (t: number) => [0.0085 + 0.001 * t, 0.0102 + 0.001 * t] as [number, number],
    color: speckled,
    section: { ngon: 7 },
  });

  const tailSweep = b.sweep(tail, {
    radius: (t: number) => 0.0115 * Math.pow(1 - t, 1.1) + 0.0022,
    color: ringed(22),
    section: "box",
  });

  // knobbly tubercles on the bony rings
  const knob = new THREE.ConeGeometry(0.0016, 0.0036, 5);
  const bigKnob = new THREE.ConeGeometry(0.002, 0.0045, 5);
  for (let i = 1; i < 11; i++) {
    const t = i / 11;
    for (const ang of [-120, 120, 180, -55, 55]) {
      const g = ang === 180 ? bigKnob : knob;
      b.stick(g, SPINE, body.at(t, ang), { embed: 0.3 });
    }
  }
  for (let i = 1; i < 16; i++) {
    const t = i / 22;
    const angs = i % 2 === 0 ? [-135, 135, -45, 45] : [-135, 135];
    for (const ang of angs) b.stick(knob, SPINE, tailSweep.at(t, ang), { embed: 0.3, scale: 1 - t * 0.8 });
  }

  // ---------------- head ----------------
  const sphere = new THREE.SphereGeometry(1, 10, 8);
  b.part(sphere, speckled, { at: along(-0.002, [0, 0.002, -0.002]), scale: [0.0095, 0.013, 0.0145], bone: "head" });
  // occipital knob
  b.part(sphere, speckled, { at: [0, H.y - 0.001, H.z - 0.012], scale: [0.0065, 0.0075, 0.007], bone: "head" });
  // cheeks
  for (const sx of [1, -1]) {
    b.part(sphere, speckled, {
      at: [sx * 0.0068, H.y - 0.005, H.z + 0.002],
      scale: [0.005, 0.0075, 0.009],
      bone: "head",
    });
    // cheek spine
    b.part(new THREE.ConeGeometry(0.0014, 0.004, 5), SPINE, {
      at: [sx * 0.0105, H.y - 0.007, H.z - 0.002],
      dir: [sx * 0.6, -0.5, -0.6],
      bone: "head",
    });
  }

  // snout (upper jaw) with rings
  b.rod(along(0.006), tip, [0.0068, 0.0045], { color: ringed(6), bone: "head", sides: 7 });
  // lip ring
  b.part(new THREE.TorusGeometry(0.0042, 0.0011, 5, 10), AMBER, { at: tip, dir: d, axis: "z", bone: "head" });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.0062, 0.0022, 0.0075), "#d9772a", {
    at: tip.clone().add(new THREE.Vector3(0, -0.0042, -0.002)),
    dir: d,
    axis: "z",
    bone: "jaw",
  });

  // coronet crown
  const crownBase = new THREE.Vector3(0, H.y + 0.017, H.z - 0.004);
  b.part(new THREE.CylinderGeometry(0.0045, 0.0034, 0.009, 6), CROWN, { at: crownBase, bone: "head" });
  const crownSpike = new THREE.ConeGeometry(0.0013, 0.005, 5);
  b.ring(frame([0, H.y + 0.021, H.z - 0.004], [0, 1, 0]), { count: 5, radius: 0.0036, tilt: 35 }, (item) => {
    b.part(crownSpike, SPINE, { frame: item, at: item.moved([0, 0.0022, 0]), bone: "head" });
  });
  b.part(sphere, CROWN, { at: [0, H.y + 0.022, H.z - 0.004], scale: 0.0022, bone: "head" });

  // eyes
  for (const sx of [1, -1]) {
    const E = new THREE.Vector3(sx * 0.0098, H.y + 0.003, H.z + 0.004);
    const o = new THREE.Vector3(sx, 0.1, 0.35).normalize();
    b.part(new THREE.TorusGeometry(0.0044, 0.0009, 5, 12), RING, {
      at: E.clone().addScaledVector(o, 0.0008),
      dir: o,
      axis: "z",
      bone: "head",
    });
    b.part(sphere, "#ffd34d", { at: E, scale: 0.0042, bone: "head" });
    b.part(sphere, "#1a120c", { at: E.clone().addScaledVector(o, 0.0024), scale: 0.0024, bone: "head" });
    b.part(sphere, "#ffffff", {
      at: E.clone().addScaledVector(o, 0.0043).add(new THREE.Vector3(0, 0.0012, 0.0005)),
      scale: 0.0008,
      bone: "head",
    });
    // brow spine
    b.part(new THREE.ConeGeometry(0.0013, 0.0045, 5), SPINE, {
      at: E.clone().add(new THREE.Vector3(-sx * 0.001, 0.0055, -0.001)),
      dir: [sx * 0.4, 1, -0.2],
      bone: "head",
    });
  }

  // ---------------- fins ----------------
  b.extrude(
    [
      [0, 0],
      [0.012, -0.002],
      [0.02, 0.006],
      [0.022, 0.018],
      [0.019, 0.03],
      [0.01, 0.038],
      [0, 0.036],
    ],
    {
      color: dorsalPaint,
      at: [0, 0.116, -0.006],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.0012,
      smoothing: 1,
      bone: "dorsalFin",
    },
  );

  const pecOutline: Array<[number, number]> = [
    [0, -0.004],
    [0.006, -0.007],
    [0.012, -0.006],
    [0.015, -0.002],
    [0.015, 0.003],
    [0.012, 0.007],
    [0.006, 0.008],
    [0, 0.004],
  ];
  for (const sx of [1, -1]) {
    b.extrude(pecOutline, {
      color: pectoralPaint,
      at: [sx * 0.0075, 0.193, -0.004],
      x: [sx * 0.5, 0, -1],
      y: [0, 1, 0],
      thickness: 0.0008,
      smoothing: 1,
      bone: sx > 0 ? "finL" : "finR",
    });
  }

  // ---------------- stand on the floor ----------------
  const group = b.ctx.root;
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group, true);
  const dy = -0.0008 - box.min.y;
  const rootJoint = b.ctx.rootJoint!;
  rootJoint.object.position.y += dy;
  group.updateMatrixWorld(true);

  return b.root;
}
