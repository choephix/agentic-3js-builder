```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  svg,
  paint,
  mottle,
  spots,
  patches,
  mix,
  smoothstep,
  catmull,
  Sweep,
} from "agentic-3js-builder";

export const meta = {
  name: "Sleepy Koala",
  description:
    "A drowsy ash-grey koala sitting at the foot of a peeling eucalyptus branch, hugging it with one arm and munching a blue-green sprig held in the other paw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "sleepyKoala", paintSize: 1024 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------- palette ----------------
  const FUR = "#a1a5aa";
  const FUR_D = "#858a90";
  const CREAM = "#efe5d2";
  const PAW = "#8a8f95";
  const CLAW = "#2a2421";
  const NOSE_A = "#1b191c";
  const NOSE_B = "#2f2a31";
  const TWIG = "#8b6a52";

  const furPaint = mottle(FUR, FUR_D, { size: 0.05, seed: 2, contrast: 0.6 });
  const furHead = mottle("#a6aaaf", "#8e9398", { size: 0.035, seed: 3, contrast: 0.6 });
  const rump = spots(furPaint, "#e6e2da", { size: 0.035, amount: 0.3, seed: 5 });
  const bodyPaint = paint((p, n) => {
    const base = n.z < -0.2 && p.y < 0.26 ? rump : furPaint;
    const chest =
      smoothstep(0.15, 0.5, n.z) *
      smoothstep(0.12, 0.05, Math.abs(p.x)) *
      smoothstep(0.1, 0.2, p.y) *
      smoothstep(0.56, 0.46, p.y);
    if (chest <= 0) return base;
    return mix(base.at(p, n), CREAM, chest);
  });
  const headPaint = paint((p, n) => {
    const chin = smoothstep(-0.15, -0.6, n.y) * smoothstep(0.0, 0.08, p.z);
    if (chin <= 0) return furHead;
    return mix(furHead.at(p, n), CREAM, chin);
  });
  const nosePaint = mottle(NOSE_A, NOSE_B, { size: 0.012, seed: 9 });
  const barkPaint = patches("#9e8e78", ["#e2dbcc", "#cfc6b4", "#bfb29c", "#d9cfbc", "#c9b9a0"], {
    size: 0.06,
    gap: 0.12,
    seed: 4,
  });

  // ---------------- textures ----------------
  const leafSvg = (c1: string, c2: string, vein: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 160"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><path d="M20 160 L20 146" stroke="#9a6b4c" stroke-width="3"/><path d="M20 148 C 6 118 4 64 26 4 C 30 50 36 112 20 148 Z" fill="url(#g)"/><path d="M20 146 C 20 104 22 60 26 8" stroke="${vein}" stroke-width="1.6" fill="none"/></svg>`;
  const leafA = svg(leafSvg("#5f8f86", "#9cc1b4", "#d3e6dc"), { size: 128 });
  const leafB = svg(leafSvg("#6f9a8c", "#a9c7a6", "#e0ecd6"), { size: 128 });
  const leaves = [leafA, leafB, leafA];
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128"><path d="M32 128 C 20 100 6 70 10 20 C 18 50 24 70 28 80 C 26 50 28 25 34 2 C 38 30 38 55 36 80 C 42 65 50 45 56 22 C 58 70 46 100 32 128 Z" fill="#f4f4f4"/></svg>`,
    { size: 128 },
  );

  // ---------------- skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.14, 0], dir: [0, 1, 0] });
  const spine = b.chain("spine", [[0, 0.24, 0], [0, 0.36, 0.005], [0, 0.48, 0]], {
    parent: hips,
    role: "spine",
    names: ["spine1", "spine2"],
  });
  const neck = b.joint("neck", { parent: "spine2", at: [0, 0.52, 0], dir: [0, 1, 0.15], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.62, 0.03], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.6, 0.08], dir: [0, -0.3, 1], role: "jaw" });

  // ---------------- body ----------------
  const body = b.sweep([[0, 0.13, -0.01], [0, 0.3, 0], [0, 0.46, 0], [0, 0.53, 0]], {
    radius: (t: number) => {
      const r = [0.13, 0.168, 0.165, 0.14, 0.105];
      const x = Math.min(Math.max(t, 0), 1) * 4;
      const i = Math.min(Math.floor(x), 3);
      const f = x - i;
      const s = f * f * (3 - 2 * f);
      const v = r[i] + (r[i + 1] - r[i]) * s;
      return [v, v * 0.93];
    },
    color: bodyPaint,
    bone: ["hips", spine, "neck"],
    sides: 14,
  });

  // ---------------- head ----------------
  const headPart = b.part(new THREE.SphereGeometry(1, 16, 12), headPaint, {
    at: [0, 0.66, 0.03],
    scale: [0.16, 0.13, 0.13],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), headPaint, { at: [0, 0.6, 0.11], scale: [0.07, 0.045, 0.06], bone: head });
  // big leathery nose
  b.part(new THREE.SphereGeometry(1, 12, 10), nosePaint, {
    at: [0, 0.645, 0.162],
    scale: [0.048, 0.07, 0.045],
    rotation: [-10, 0, 0],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#58525d", {
    at: [0.012, 0.675, 0.197],
    scale: [0.011, 0.02, 0.006],
    bone: head,
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 8, 6), "#090808", {
      at: [0.018 * s, 0.6, 0.186],
      scale: [0.012, 0.007, 0.008],
      rotation: [0, 0, 25 * s],
      bone: head,
    });
  // mouth + jaw
  b.part(new THREE.SphereGeometry(1, 10, 6), "#3b2328", { at: [0, 0.572, 0.15], scale: [0.03, 0.01, 0.02], bone: head });
  b.part(new THREE.SphereGeometry(1, 10, 8), "#d8d0c2", { at: [0, 0.555, 0.11], scale: [0.05, 0.022, 0.055], bone: jaw });

  // drowsy eyes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ec: [number, number, number] = [0.075 * s, 0.69, 0.135];
    b.part(new THREE.SphereGeometry(0.02, 12, 8), "#5a3820", { at: ec, bone: head });
    b.part(new THREE.SphereGeometry(0.009, 8, 6), "#120c08", {
      at: [0.074 * s, 0.687, 0.15],
      scale: [1, 1, 0.5],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.0032, 6, 4), "#f4efe6", { at: [0.07 * s, 0.684, 0.155], bone: head });
    const lid = b.joint(`lid${side}`, { parent: head, at: ec, dir: [0, 0, 1], role: "hinge" });
    b.part(new THREE.SphereGeometry(0.0235, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), "#73787e", {
      at: ec,
      rotation: [5, 0, 0],
      bone: lid,
    });
    // heavy sleepy brow
    b.capsule([0.05 * s, 0.712, 0.142], [0.1 * s, 0.705, 0.128], 0.006, { color: "#7b8086", bone: head });
  }

  // fluffy ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ec = V(0.155 * s, 0.765, 0.0);
    const facing = V(0.3 * s, 0.08, 1).normalize();
    const ear = b.joint(`ear${side}`, { parent: head, at: ec, dir: [0.6 * s, 0.8, 0] });
    b.part(new THREE.CylinderGeometry(0.08, 0.075, 0.035, 14), furHead, { at: ec, dir: facing, bone: ear });
    const inner = ec.clone().addScaledVector(facing, 0.016);
    b.part(new THREE.CylinderGeometry(0.056, 0.052, 0.012, 14), CREAM, { at: inner, dir: facing, bone: ear });
    const rim = b.ring(frame(ec, facing), { count: 20, radius: 0.074 }).items;
    b.cards(rim, tuft, {
      size: [0.04, 0.055],
      lean: 25,
      bend: 25,
      flow: facing,
      color: "#ebe7e0",
      vary: 0.25,
      spin: 15,
      rng: rng(11 + s),
      bone: ear,
    });
    const innerRing = b
      .ring(frame(inner.clone().addScaledVector(facing, 0.006), facing), { count: 10, radius: 0.028 })
      .items;
    b.cards(innerRing, tuft, {
      size: [0.03, 0.04],
      lean: 50,
      flow: facing,
      color: CREAM,
      vary: 0.2,
      rng: rng(21 + s),
      bone: ear,
    });
  }

  // ---------------- arms ----------------
  const armL = b.chain("armL", [[0.13, 0.47, 0.02], [0.27, 0.43, 0.2], [0.18, 0.45, 0.32]], {
    parent: "spine2",
    role: "arm",
    names: ["shoulderL", "elbowL", "wristL"],
  });
  const armR = b.chain("armR", [[-0.13, 0.47, 0.02], [-0.22, 0.4, 0.15], [-0.11, 0.52, 0.21]], {
    parent: "spine2",
    role: "arm",
    names: ["shoulderR", "elbowR", "wristR"],
  });
  b.sweep(armL, { radius: [0.055, 0.046, 0.038], color: furPaint, sides: 10 });
  b.sweep(armR, { radius: [0.055, 0.046, 0.038], color: furPaint, sides: 10 });

  const pawDigits = (
    center: THREE.Vector3,
    fwd: THREE.Vector3,
    up: THREE.Vector3,
    clawDir: THREE.Vector3,
    bone: string,
    curl: THREE.Vector3,
  ) => {
    b.part(new THREE.SphereGeometry(1, 10, 8), PAW, { at: center, scale: [0.045, 0.042, 0.048], bone });
    for (let k = 0; k < 5; k++) {
      const off = (k - 2) * 0.017;
      const base = center.clone().addScaledVector(fwd, 0.028).addScaledVector(up, off);
      const tip = base.clone().addScaledVector(fwd, 0.028).addScaledVector(curl, 0.01).addScaledVector(up, off * 0.4);
      b.capsule(base, tip, 0.011, { color: PAW, bone, sides: 6 });
      b.spike(tip.clone().addScaledVector(fwd, 0.006), clawDir, 0.024, 0.0055, { color: CLAW, bone, sides: 5 });
    }
  };
  pawDigits(V(0.16, 0.45, 0.335), V(-1, 0, -0.35).normalize(), V(0, 1, 0), V(-0.4, 0, -1).normalize(), "wristL", V(0, 0, -1));
  pawDigits(V(-0.095, 0.55, 0.22), V(1, 0, 0.3).normalize(), V(0, 1, 0), V(0.5, -0.2, -0.8).normalize(), "wristR", V(0, 0, -1));

  // ---------------- legs ----------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${side}`, [[0.09 * s, 0.1, 0.03], [0.2 * s, 0.14, 0.13], [0.24 * s, 0.05, 0.22]], {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      contact: [0.25 * s, 0, 0.27],
    });
    b.sweep(leg, { radius: [0.072, 0.056, 0.042], color: furPaint, sides: 10 });
    const foot = `ankle${side}`;
    b.part(new THREE.SphereGeometry(1, 10, 8), PAW, { at: [0.25 * s, 0.03, 0.27], scale: [0.05, 0.028, 0.072], bone: foot });
    for (let k = 0; k < 4; k++) {
      const x = (0.25 + (k - 1.5) * 0.017) * s;
      const a = V(x, 0.028, 0.31);
      const t = V(x, 0.024, 0.335);
      b.capsule(a, t, 0.011, { color: PAW, bone: foot, sides: 6 });
      b.spike(t.clone().add(V(0, 0, 0.006)), [0, -0.3, 1], 0.02, 0.005, { color: CLAW, bone: foot, sides: 5 });
    }
    // opposable hind thumb
    const tb = V(0.22 * s, 0.03, 0.27);
    const tt = V(0.18 * s, 0.03, 0.29);
    b.capsule(tb, tt, 0.013, { color: PAW, bone: foot, sides: 6 });
  }

  // ---------------- fur tufts ----------------
  const bodySurf = b.surface(body);
  const bodyHits = bodySurf.scatter(45, {
    rng: rng(31),
    minDist: 0.04,
    filter: (h) => h.at.y > 0.12 && h.at.y < 0.52,
  });
  b.cards(bodyHits, tuft, {
    size: [0.04, 0.05],
    lean: 60,
    bend: 15,
    flow: [0, -1, -0.1],
    color: bodyPaint,
    vary: 0.3,
    spin: 20,
    rng: rng(32),
  });
  const headSurf = b.surface(headPart);
  const cheekHits = headSurf.scatter(22, {
    rng: rng(41),
    minDist: 0.022,
    filter: (h) => Math.abs(h.at.x) > 0.1 && h.at.y < 0.7 && h.n.z > -0.3,
  });
  b.cards(cheekHits, tuft, {
    size: [0.035, 0.045],
    lean: 55,
    bend: 20,
    flow: (f) => V(Math.sign(f.at.x), -0.6, 0),
    color: headPaint,
    vary: 0.25,
    rng: rng(42),
    bone: head,
  });

  // ---------------- eucalyptus branch ----------------
  const trunk = b.sweep(catmull([[0.13, -0.01, 0.22], [0.145, 0.35, 0.235], [0.14, 0.7, 0.22], [0.11, 1.0, 0.19]]), {
    radius: [0.045, 0.04, 0.033, 0.022],
    color: barkPaint,
    bone: "hips",
    caps: { start: "flat", end: "round" },
    sides: 9,
  });
  void trunk;
  // root flares
  for (const a of [0, 120, 240]) {
    const r = (a * Math.PI) / 180;
    b.spike([0.13, 0.04, 0.22], [Math.sin(r), -0.9, Math.cos(r)], 0.07, 0.025, {
      color: barkPaint,
      bone: "hips",
      sides: 6,
    });
  }

  const leafy = (tw: Sweep, n: number, seed: number) => {
    const r = rng(seed);
    const frames = [];
    const flows: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const t = 0.2 + (0.75 * (i + 0.5)) / n;
      const ang = (i % 2 ? 100 : -100) + (r() - 0.5) * 40;
      const f = tw.at(t, ang);
      frames.push(f);
      flows.push(f.tangent.clone().multiplyScalar(0.7).add(V(0, -0.7, 0)));
    }
    b.cards(frames, leaves, {
      size: [0.035, 0.11],
      lean: 60,
      bend: 18,
      flow: (_f, i) => flows[i],
      vary: 0.2,
      spin: 15,
      rng: rng(seed + 1),
      sink: 0.05,
    });
    const c = tw.curve();
    const tipFrame = frame(c.at(1), c.tangentAt(1));
    const tips = b.ring(tipFrame, { count: 3, tilt: 55 }).items;
    b.cards(tips, leaves, { size: [0.035, 0.11], bend: 12, flow: c.tangentAt(1), vary: 0.15, rng: rng(seed + 2), bone: "hips" });
  };

  const twig = (pts: number[][], r0: number, bone: string) =>
    b.sweep(catmull(pts), { radius: [r0, r0 * 0.45], color: TWIG, bone, sides: 6 });

  leafy(twig([[0.15, 0.62, 0.23], [0.3, 0.72, 0.25], [0.42, 0.78, 0.2]], 0.016, "hips"), 7, 101);
  leafy(twig([[0.11, 0.98, 0.19], [0.0, 1.08, 0.2], [-0.09, 1.12, 0.15]], 0.014, "hips"), 6, 201);
  leafy(twig([[0.14, 0.82, 0.21], [0.25, 0.92, 0.15], [0.31, 1.0, 0.1]], 0.013, "hips"), 6, 301);

  // sprig in the right paw
  const sprig = b.sweep(catmull([[-0.1, 0.49, 0.215], [-0.09, 0.6, 0.225], [-0.05, 0.73, 0.28]]), {
    radius: [0.007, 0.004],
    color: TWIG,
    bone: "wristR",
    sides: 6,
  });
  leafy(sprig, 5, 401);

  // the leaf mid-munch, poking into the mouth
  const munchRoot = V(-0.075, 0.56, 0.205);
  const munchDir = V(0.0, 0.57, 0.15).sub(munchRoot).normalize();
  b.cards([frame(munchRoot, munchDir)], leafB, { size: [0.032, 0.1], flow: [0, 1, 0], sink: 0, bone: "wristR" });
  b.cards([frame(V(-0.07, 0.555, 0.2), V(0.6, 0.2, -0.5).normalize())], leafA, {
    size: [0.028, 0.08],
    flow: [0, 1, 0],
    bend: 15,
    sink: 0,
    bone: "wristR",
  });

  return b.root;
}
```