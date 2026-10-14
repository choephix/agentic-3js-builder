import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  frame,
  paint,
  scales,
  spots,
  mottle,
  countershade,
  smoothstep,
  mix,
  resolve,
} from "../../../../src/index";

export const meta = {
  name: "Baby Dragon with Broken Egg",
  description:
    "A cat-sized baby dragon sitting proudly beside the cracked shell of its speckled egg: teal scales, butter belly, stubby horns, orange back spines, oversized amber-membraned wings, a spade-tipped tail and a wisp of smoke.",
};

type V = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "babyDragon", paintSize: 2048 });
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---------- palette & paints ----------
  const TEAL = "#2a8f93";
  const DARK_TEAL = "#1c6f74";
  const ORANGE = "#f29a4a";
  const IVORY = "#f0d9a8";
  const tealScales = scales(["#2da7a0", "#33b5aa", "#279a9b"], "#1c6f74", { size: 0.02, width: 0.16, seed: 3 });
  const butterScales = scales(["#f7e4a4", "#f3d98e"], "#d8b66a", { size: 0.022, width: 0.12, seed: 5 });
  const frontBelly = paint((p, n) => {
    const band = Math.max(smoothstep(0.25, 0.65, n.z), smoothstep(-0.2, -0.7, n.y));
    const t = band * smoothstep(0.07, 0.04, Math.abs(p.x));
    return mix(resolve(tealScales, p, n), resolve(butterScales, p, n), t);
  });
  const underBelly = countershade(tealScales, butterScales, { level: -0.3, soft: 0.25 });
  const amber = mottle("#f4a93a", "#ffcb6b", { size: 0.05, contrast: 1.2, seed: 4 });
  const eggPaint = spots(mottle("#f4ecd8", "#e6d9ba", { size: 0.03 }), ["#8f6b4a", "#b58e5e", "#6f5236"], {
    size: 0.014,
    amount: 0.6,
    seed: 2,
  });

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.078, -0.04], dir: [0, 1, 0], role: "spine" });

  const spine = b.chain("spine", catmull([[0, 0.078, -0.04], [0, 0.12, -0.01], [0, 0.17, 0.02]]), {
    parent: "hips",
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const body = b.sweep(spine, [0.072, 0.08, 0.062], { color: frontBelly, caps: "round", sides: 10, name: "body" });

  const neck = b.chain("neck", catmull([[0, 0.17, 0.02], [0, 0.21, 0.05], [0, 0.235, 0.075]]), {
    parent: "spine2",
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });
  const neckSweep = b.sweep(neck, [0.04, 0.035, 0.034], { color: frontBelly, caps: "round", sides: 8, name: "neck" });

  // ---------- head ----------
  b.part(sph(0.055, 10, 8), tealScales, { at: [0, 0.27, 0.085], scale: [1, 0.92, 1.02], bone: "head", name: "cranium" });
  b.frustumBox([0, 0.26, 0.1], [0, 0.255, 0.18], [0.075, 0.05], [0.05, 0.036], {
    color: underBelly,
    bone: "head",
    name: "upperJaw",
  });
  b.joint("jaw", { parent: "head", at: [0, 0.233, 0.085], dir: [0, 0, 1], role: "jaw" });
  b.frustumBox([0, 0.233, 0.085], [0, 0.231, 0.162], [0.05, 0.02], [0.034, 0.016], {
    color: butterScales,
    bone: "jaw",
    name: "lowerJaw",
  });
  // grin of little teeth
  for (const sx of [1, -1])
    for (let k = 0; k < 4; k++) {
      const z = 0.112 + k * 0.017;
      const half = 0.0375 - ((z - 0.1) / 0.08) * 0.0125;
      b.part(new THREE.ConeGeometry(0.0058, 0.012, 5), "#fffaf0", {
        at: [sx * (half - 0.003), 0.231, z],
        rotation: [180, 0, 0],
        bone: "head",
        name: "tooth",
      });
    }
  // nostrils, smoke
  for (const sx of [1, -1]) b.part(sph(0.005, 6, 4), "#1d3b3c", { at: [sx * 0.012, 0.262, 0.179], bone: "head", name: "nostril" });
  b.sweep(
    catmull([[0.012, 0.264, 0.183], [0.022, 0.286, 0.2], [0.008, 0.31, 0.212], [0.022, 0.334, 0.206], [0.012, 0.358, 0.216]]),
    (t) => 0.004 + 0.012 * t,
    { color: "#d3d7dc", caps: "round", sides: 6, bone: "head", name: "smoke" },
  );
  b.part(sph(0.012, 6, 4), "#e4e7ea", { at: [0.02, 0.352, 0.21], bone: "head", name: "puff" });
  // eyes, brows, horns, frills
  for (const sx of [1, -1]) {
    b.part(sph(0.019, 10, 8), "#f5a623", { at: [sx * 0.037, 0.279, 0.12], bone: "head", name: "eye" });
    b.part(sph(0.011, 8, 6), "#1b1320", { at: [sx * 0.0475, 0.2785, 0.131], scale: [0.5, 1.15, 0.55], bone: "head", name: "pupil" });
    b.part(sph(0.004, 5, 4), "#ffffff", { at: [sx * 0.043, 0.2885, 0.1335], bone: "head", name: "glint" });
    b.capsule([sx * 0.022, 0.303, 0.122], [sx * 0.05, 0.297, 0.098], 0.007, { color: DARK_TEAL, bone: "head", sides: 5, name: "brow" });
    b.spike([sx * 0.03, 0.312, 0.055], [sx * 0.4, 0.8, -0.45], 0.055, 0.012, { color: IVORY, bone: "head", sides: 6, name: "horn" });
    b.spike([sx * 0.05, 0.285, 0.065], [sx * 0.8, 0.2, -0.5], 0.04, 0.01, { color: ORANGE, bone: "head", sides: 5, name: "frill" });
  }

  // ---------- tail ----------
  const tailPts: V[] = [[0, 0.05, -0.09], [0, 0.035, -0.16], [0.05, 0.026, -0.22], [0.12, 0.02, -0.2], [0.17, 0.017, -0.13]];
  const tail = b.chain("tail", catmull(tailPts), {
    parent: "hips",
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });
  const tailSweep = b.sweep(tail, [0.042, 0.036, 0.026, 0.017, 0.011], { color: underBelly, caps: "round", sides: 8, name: "tail" });
  {
    const E = new THREE.Vector3(...tailPts[4]);
    const dir = E.clone().sub(new THREE.Vector3(...tailPts[3])).setY(0).normalize();
    const lat = new THREE.Vector3(0, 1, 0).cross(dir);
    const spade = [
      [0, 0.006], [0.014, 0.022], [0.032, 0.026], [0.05, 0.012], [0.068, 0],
      [0.05, -0.012], [0.032, -0.026], [0.014, -0.022], [0, -0.006],
    ];
    b.extrude(spade, {
      color: "#ee8a3a",
      at: [E.x - dir.x * 0.004, 0.013, E.z - dir.z * 0.004],
      x: dir,
      y: lat,
      thickness: 0.008,
      bevel: 0.002,
      bone: "tail5",
      name: "spade",
    });
  }

  // ---------- back spines ----------
  const spines = (src: typeof body, count: number, s0: number, s1: number) => {
    let i = 0;
    b.along(src, count, (p) => {
      const s = s0 + ((s1 - s0) * i) / Math.max(count - 1, 1);
      i++;
      b.stick(new THREE.ConeGeometry(0.011 * s, 0.032 * s, 5), ORANGE, p, { embed: 0.25, name: "spine" });
    });
  };
  spines(neckSweep as unknown as typeof body, 3, 0.7, 0.85);
  spines(body, 4, 1.0, 1.15);
  spines(tailSweep as unknown as typeof body, 5, 1.0, 0.45);

  // ---------- arms & legs ----------
  for (const [S, sx] of [["L", 1], ["R", -1]] as const) {
    const P = (x: number, y: number, z: number): V => [sx * x, y, z];
    // arm
    const arm = b.chain(`arm${S}`, catmull([P(0.058, 0.16, 0.035), P(0.065, 0.095, 0.065), P(0.045, 0.027, 0.1)]), {
      parent: "spine2",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.024, 0.02, 0.016], { color: tealScales, caps: "round", sides: 7, name: `arm${S}` });
    b.part(sph(0.026, 8, 6), tealScales, { at: P(0.045, 0.013, 0.118), scale: [1, 0.5, 1.25], bone: `wrist${S}`, name: `paw${S}` });
    for (let k = 0; k < 3; k++) {
      const o = (k - 1) * 0.016;
      const a = P(0.045 + (sx * o) / sx * 1, 0.012, 0.125);
      a[0] = sx * 0.045 + o;
      const e: V = [sx * 0.045 + (k - 1) * 0.022, 0.013, 0.16];
      b.joint(`fToe${k + 1}${S}`, { parent: `wrist${S}`, at: a, aim: e, role: "digit" });
      b.capsule(a, e, 0.008, { color: TEAL, bone: `fToe${k + 1}${S}`, sides: 5, detail: 0.5, name: "toe" });
      b.spike(e, [0, 0, 1], 0.014, 0.006, { color: IVORY, bone: `fToe${k + 1}${S}`, sides: 4, name: "claw" });
    }
    // hind leg
    const leg = b.chain(`leg${S}`, catmull([P(0.075, 0.075, -0.05), P(0.115, 0.045, 0.02), P(0.11, 0.022, 0.07)]), {
      parent: "hips",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.044, 0.035, 0.021], { color: tealScales, caps: "round", sides: 8, name: `leg${S}` });
    b.part(sph(0.03, 8, 6), tealScales, { at: P(0.11, 0.013, 0.095), scale: [1, 0.45, 1.3], bone: `ankle${S}`, name: `foot${S}` });
    for (let k = 0; k < 3; k++) {
      const a: V = [sx * 0.11 + (k - 1) * 0.016, 0.012, 0.108];
      const e: V = [sx * 0.11 + (k - 1) * 0.022, 0.013, 0.15];
      b.joint(`hToe${k + 1}${S}`, { parent: `ankle${S}`, at: a, aim: e, role: "digit" });
      b.capsule(a, e, 0.008, { color: TEAL, bone: `hToe${k + 1}${S}`, sides: 5, detail: 0.5, name: "toe" });
      b.spike(e, [0, 0, 1], 0.014, 0.006, { color: IVORY, bone: `hToe${k + 1}${S}`, sides: 4, name: "claw" });
    }

    // ---------- wing ----------
    const wArm = b.chain(`wingArm${S}`, catmull([P(0.05, 0.15, -0.05), P(0.13, 0.23, -0.09), P(0.21, 0.29, -0.12)]), {
      parent: "spine2",
      names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    b.sweep(wArm, [0.016, 0.012, 0.009], { color: TEAL, caps: "round", sides: 6, name: `wingArm${S}` });
    b.spike(P(0.21, 0.29, -0.12), [sx * 0.5, 0.8, 0.3], 0.032, 0.007, { color: IVORY, bone: `wingWrist${S}`, sides: 5, name: "thumbClaw" });
    const wrist = P(0.21, 0.29, -0.12);
    const defs: Array<[V, V]> = [
      [P(0.3, 0.38, -0.15), P(0.4, 0.46, -0.17)],
      [P(0.32, 0.31, -0.2), P(0.44, 0.33, -0.27)],
      [P(0.28, 0.2, -0.22), P(0.36, 0.12, -0.3)],
    ];
    const fingers = defs.map(([m, t], k) => {
      const f = b.chain(`finger${k + 1}${S}`, catmull([wrist, m, t]), {
        parent: `wingWrist${S}`,
        names: [`finger${k + 1}a${S}`, `finger${k + 1}b${S}`, `finger${k + 1}tip${S}`],
        role: "digit",
      });
      b.sweep(f, [0.008, 0.005, 0.0025], { color: DARK_TEAL, caps: "round", sides: 5, name: `finger${k + 1}${S}` });
      return f;
    });
    const mo = { color: amber, thickness: 0.003, rows: 3, scallop: 0.1 };
    b.membrane(fingers[0], fingers[1], { ...mo, name: `web1${S}` });
    b.membrane(fingers[1], fingers[2], { ...mo, name: `web2${S}` });
    b.membrane(fingers[2], polyline([wrist, P(0.05, 0.1, -0.09)]), { ...mo, bone: "spine1", name: `web3${S}` });
  }

  // ---------- egg ----------
  const ex = -0.21;
  const ez = 0.13;
  b.joint("egg", { parent: "hips", at: [ex, 0.04, ez], dir: [0, 1, 0] });
  b.lathe(
    [[0, 0], [0.03, 0.002], [0.052, 0.015], [0.062, 0.04], [0.063, 0.06], [0.058, 0.085],
     [0.05, 0.083], [0.056, 0.06], [0.055, 0.04], [0.046, 0.017], [0.026, 0.006], [0, 0.008]],
    { color: eggPaint, at: [ex, 0, ez], bone: "egg", segments: 10, name: "eggShell" },
  );
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.004, 8), "#d6e6a0", { at: [ex, 0.01, ez], bone: "egg", name: "goo" });
  const toothH = [0.03, 0.012, 0.04, 0.018, 0.034, 0.01, 0.028, 0.02, 0.036];
  b.ring(frame([ex, 0.085, ez], [0, 1, 0]), { count: 9, radius: 0.0545 }, (item) => {
    const h = toothH[item.i];
    b.part(new THREE.ConeGeometry(0.014, h, 3), eggPaint, {
      at: [item.at.x, 0.082 + h / 2, item.at.z],
      rotation: [0, item.i * 40, 0],
      bone: "egg",
      name: "rimShard",
    });
  });
  const shard = (x: number, z: number, rot: number, r: number, th: number) =>
    b.part(new THREE.SphereGeometry(r, 6, 3, 0, Math.PI * 2, 0, th), eggPaint, {
      at: [x, 0.002 - r * Math.cos(th), z],
      scale: [1, 1, 0.7],
      rotation: [0, rot, 0],
      bone: "egg",
      flat: true,
      name: "shard",
    });
  shard(-0.3, 0.2, 30, 0.05, 0.65);
  shard(-0.16, 0.22, 110, 0.04, 0.6);
  shard(-0.29, 0.06, 70, 0.035, 0.7);

  return b.root;
}
