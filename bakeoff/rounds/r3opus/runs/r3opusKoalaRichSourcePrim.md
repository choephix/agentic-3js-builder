```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  frame,
  catmull,
  svg,
  paint,
  mottle,
  grain,
  mix,
  smoothstep,
  noise,
  aim,
  DEG,
} from "agentic-3js-builder";

export const meta = {
  name: "Sleepy Koala",
  description:
    "A drowsy ash-grey koala hugging a pale eucalyptus trunk, cream chest and fluffy cream-fringed ears, big leathery nose, heavy-lidded brown eyes, munching a blue-green sprig held in one paw.",
};

export default function build() {
  const b = createBuilder({ name: "sleepyKoala", paintSize: 1024 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const X = V(1, 0, 0);
  const ball = (w: number, h = Math.max(5, Math.round(w * 0.7))) => new THREE.SphereGeometry(1, w, h);
  const R = rng(11);

  // ---------------- palette ----------------
  const GREY = "#9fa1a8";
  const GREY_D = "#878991";
  const GREY_L = "#b9bbc1";
  const CREAM = "#efe7d6";
  const PAW = "#6d6f77";
  const CLAW = "#2b2420";
  const STEM = "#7a5e3e";

  const fur = mottle(GREY, GREY_D, { size: 0.035, seed: 3, contrast: 0.8 });
  const furFine = paint((p, n) => {
    const c = fur.at(p, n);
    const k = noise(p, 0.009, 7);
    return mix(c, GREY_L, smoothstep(0.58, 0.8, k) * 0.55);
  });
  const bodyPaint = paint((p, n) => {
    const c = furFine.at(p, n);
    const d = (p.x / 0.09) ** 2 + ((p.y - 0.28) / 0.15) ** 2;
    const t = smoothstep(1.15, 0.7, d) * smoothstep(0.05, 0.45, n.z);
    return mix(c, CREAM, t);
  });
  const headPaint = paint((p, n) => {
    const c = furFine.at(p, n);
    const chin = smoothstep(0.575, 0.53, p.y) * smoothstep(-0.1, 0.5, n.z);
    const brow = smoothstep(0.68, 0.74, p.y) * 0.25;
    return mix(mix(c, GREY_D, brow), CREAM, chin);
  });
  const nosePaint = mottle("#2a2628", "#3d3538", { size: 0.009, seed: 4, contrast: 1.3 });
  const bark = mottle(grain("#b9ad9a", "#8f8473", { size: 0.012, axis: "y", seed: 2 }), "#ddd5c6", {
    size: 0.07,
    seed: 5,
    contrast: 1.2,
  });

  // ---------------- textures ----------------
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96"><path d="M32 96 C20 72 6 52 9 20 C15 40 21 46 25 30 C27 16 30 8 32 0 C34 8 37 16 39 30 C43 46 49 40 55 20 C58 52 44 72 32 96 Z" fill="#ffffff"/><path d="M32 90 L31 28 M27 82 L17 42 M37 82 L47 42" stroke="#cfcfcf" stroke-width="2.2" fill="none"/></svg>`,
    { size: 128 },
  );
  const leafA = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5c8a7b"/><stop offset="1" stop-color="#93b9ac"/></linearGradient></defs><path d="M20 100 C9 78 3 50 12 22 C15 12 18 5 21 0 C24 8 30 20 31 34 C34 60 28 80 20 100 Z" fill="url(#g)"/><path d="M20 98 C19 70 20 40 21 4" stroke="#dbe9df" stroke-width="1.6" fill="none"/><path d="M20 70 L12 58 M20 55 L28 44 M20 42 L13 32" stroke="#b9d3c6" stroke-width="0.8" fill="none"/></svg>`,
    { size: 128 },
  );
  const leafB = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100"><rect x="18.5" y="84" width="3" height="16" fill="#8a6a4c"/><ellipse cx="20" cy="50" rx="17" ry="36" fill="#a2c4bf" stroke="#b5776a" stroke-width="1.4"/><path d="M20 86 L20 16" stroke="#e3efec" stroke-width="1.5" fill="none"/></svg>`,
    { size: 128 },
  );
  const leaves = [leafA, leafA, leafB];

  // ---------------- skeleton ----------------
  b.joint("root", { at: [0, 0, 0] });
  b.chain("spine", [[0, 0.12, 0], [0, 0.28, 0.01], [0, 0.44, 0.02]], {
    parent: "root",
    names: ["hips", "spine", "chest"],
    role: "spine",
  });
  b.chain("neck", [[0, 0.44, 0.02], [0, 0.53, 0.04]], { parent: "chest", names: ["neck"], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.53, 0.04], dir: [0, 1, 0.1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.555, 0.12], dir: [0, -0.25, 1], role: "jaw" });
  b.joint("earL", { parent: "head", at: [0.12, 0.7, 0.02], dir: [0.6, 0.8, 0], role: "hinge" });
  b.joint("earR", { parent: "head", at: [-0.12, 0.7, 0.02], dir: [-0.6, 0.8, 0], role: "hinge" });

  const armL = b.chain("armL", [[0.12, 0.43, 0.03], [0.25, 0.36, 0.13], [0.21, 0.41, 0.27]], {
    parent: "chest",
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
  });
  const armR = b.chain("armR", [[-0.12, 0.43, 0.03], [-0.23, 0.34, 0.14], [-0.1, 0.47, 0.255]], {
    parent: "chest",
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
  });
  const legL = b.chain("legL", [[0.09, 0.13, 0.02], [0.17, 0.18, 0.15], [0.2, 0.045, 0.2]], {
    parent: "hips",
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.21, 0, 0.24],
  });
  const legR = b.chain("legR", [[-0.09, 0.13, 0.02], [-0.17, 0.18, 0.15], [-0.19, 0.045, 0.21]], {
    parent: "hips",
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.2, 0, 0.25],
  });

  // ---------------- body & head ----------------
  const body = b.part(ball(16), bodyPaint, { at: [0, 0.215, 0], scale: [0.175, 0.22, 0.155], bone: "spine" });
  const head = b.part(ball(16), headPaint, { at: [0, 0.62, 0.05], scale: [0.15, 0.13, 0.13], bone: "head" });

  // nose: big, black, leathery, with glossy highlight and nostrils
  b.part(ball(12, 10), nosePaint, { at: [0, 0.61, 0.175], scale: [0.045, 0.062, 0.04], bone: "head" });
  b.part(ball(8), "#7d7578", { at: [0.013, 0.64, 0.207], scale: [0.011, 0.02, 0.006], bone: "head" });
  for (const s of [1, -1])
    b.part(ball(8), "#0d0b0c", { at: [s * 0.018, 0.562, 0.196], scale: [0.011, 0.008, 0.008], bone: "head" });

  // mouth mid-munch
  b.part(ball(10), GREY_L, { at: [0, 0.547, 0.163], scale: [0.05, 0.022, 0.034], bone: "head" });
  b.part(ball(8), "#4a2629", { at: [-0.004, 0.532, 0.163], scale: [0.032, 0.013, 0.024], bone: "head" });
  b.part(ball(10), "#ddd6c8", { at: [0, 0.518, 0.152], scale: [0.042, 0.017, 0.034], rotation: [12, 0, 0], bone: "jaw" });

  // drowsy eyes
  for (const s of [1, -1]) {
    const x = s * 0.068;
    const y = 0.655;
    const z = 0.05 + 0.13 * Math.sqrt(Math.max(0, 1 - (x / 0.15) ** 2 - ((y - 0.62) / 0.13) ** 2));
    const n = V(x / 0.0225, (y - 0.62) / 0.0169, (z - 0.05) / 0.0169).normalize();
    const c = V(x, y, z).addScaledVector(n, -0.007);
    const qe = aim(n, [0, 1, 0], "z");
    const loc = (lx: number, ly: number, lz: number) => V(lx, ly, lz).applyQuaternion(qe).add(c);
    b.part(ball(10), "#6b4424", { at: c, scale: 0.02, bone: "head" });
    b.part(ball(8), "#1a1210", { at: loc(0, -0.0105, 0.0148), quat: qe, scale: [0.0078, 0.0062, 0.004], bone: "head" });
    b.part(ball(6), "#ffffff", { at: loc(s * 0.003, -0.012, 0.0178), scale: 0.0026, bone: "head" });
    const qLid = qe.clone().multiply(new THREE.Quaternion().setFromAxisAngle(X, 22 * DEG));
    b.part(new THREE.SphereGeometry(0.0234, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#8d8f97", {
      at: c,
      quat: qLid,
      bone: "head",
    });
    b.part(new THREE.TorusGeometry(0.0234, 0.0024, 4, 14, Math.PI), "#3a3335", {
      at: c,
      quat: qLid.clone().multiply(new THREE.Quaternion().setFromAxisAngle(X, 90 * DEG)),
      bone: "head",
    });
  }

  // fluffy ears
  for (const s of [1, -1]) {
    const ear = s > 0 ? "earL" : "earR";
    const ec = V(s * 0.155, 0.73, 0.0);
    const facing = V(s * 0.42, 0.1, 0.9).normalize();
    const q = aim(facing, [0, 1, 0], "z");
    b.part(ball(12, 8), furFine, { at: ec, quat: q, scale: [0.088, 0.082, 0.03], bone: ear });
    b.part(ball(12, 8), CREAM, {
      at: ec.clone().addScaledVector(facing, 0.017),
      quat: q,
      scale: [0.064, 0.058, 0.016],
      bone: ear,
    });
    const back = b.ring(frame(ec.clone().addScaledVector(facing, -0.008), facing), {
      count: 14,
      radius: 0.075,
      fromDeg: -135,
      toDeg: 135,
    });
    b.cards(back.items, tuft, {
      size: [0.05, 0.045],
      flow: facing,
      vary: 0.2,
      spin: 10,
      color: "#aeb0b7",
      bone: ear,
      rng: rng(21 + s),
    });
    const front = b.ring(frame(ec.clone().addScaledVector(facing, 0.01), facing), {
      count: 18,
      radius: 0.066,
      fromDeg: -145,
      toDeg: 145,
    });
    b.cards(front.items, tuft, {
      size: [0.04, 0.05],
      flow: facing,
      vary: 0.25,
      spin: 14,
      bend: 15,
      color: "#f6f1e8",
      bone: ear,
      rng: rng(31 + s),
    });
  }

  // cheek and chest fluff
  const cheekHits = b.surface(head).scatter(22, {
    rng: rng(9),
    minDist: 0.018,
    filter: (h) => Math.abs(h.n.x) > 0.6 && h.at.y < 0.67 && h.at.y > 0.53,
  });
  b.cards(cheekHits, tuft, { size: [0.032, 0.042], lean: 60, flow: [0, -1, 0.2], vary: 0.25, spin: 15, color: "#a9abb2", rng: rng(3) });
  const chestHits = b.surface(body).scatter(16, {
    rng: rng(13),
    minDist: 0.02,
    filter: (h) => h.n.z > 0.55 && h.at.y > 0.3 && h.at.y < 0.43 && Math.abs(h.at.x) < 0.07,
  });
  b.cards(chestHits, tuft, { size: [0.03, 0.04], lean: 65, flow: [0, -1, 0], vary: 0.25, spin: 15, color: "#f3ecdd", rng: rng(4) });

  // ---------------- limbs ----------------
  b.sweep(armL, [0.05, 0.042, 0.03], { color: furFine });
  b.sweep(armR, [0.05, 0.042, 0.03], { color: furFine });
  b.sweep(legL, [0.068, 0.052, 0.034], { color: furFine });
  b.sweep(legR, [0.068, 0.052, 0.034], { color: furFine });

  // left paw gripping the trunk
  {
    const c = V(0.135, 0.41, 0.235);
    const nrm = V(0.707, 0, 0.707);
    const tg = V(-0.707, 0, 0.707);
    const pc = c.clone().addScaledVector(nrm, 0.057);
    b.part(ball(10), PAW, { at: pc, quat: aim(nrm, [0, 1, 0], "z"), scale: [0.038, 0.045, 0.02], bone: "wristL" });
    for (let k = 0; k < 4; k++) {
      const base = pc.clone().addScaledVector(tg, 0.03).add(V(0, (k - 1.5) * 0.016, 0));
      b.spike(base, tg.clone().multiplyScalar(0.7).addScaledVector(nrm, -0.7), 0.024, 0.005, { color: CLAW, bone: "wristL" });
    }
    for (const dy of [-0.01, 0.01]) {
      const base = pc.clone().addScaledVector(tg, -0.03).add(V(0, dy, 0));
      b.spike(base, tg.clone().multiplyScalar(-0.7).addScaledVector(nrm, -0.7), 0.02, 0.0045, { color: CLAW, bone: "wristL" });
    }
  }

  // right paw holding the sprig
  {
    const wrist = V(-0.1, 0.47, 0.255);
    const d = V(0.13, 0.13, 0.115).normalize();
    const pc = wrist.clone().addScaledVector(d, 0.022);
    b.part(ball(10), PAW, { at: pc, dir: d, axis: "y", scale: [0.034, 0.045, 0.026], bone: "wristR" });
    const side = d.clone().cross(V(0, 1, 0)).normalize();
    for (let k = 0; k < 4; k++) {
      const base = pc.clone().addScaledVector(d, 0.032).addScaledVector(side, (k - 1.5) * 0.012);
      b.spike(base, d.clone().multiplyScalar(0.3).add(V(0, -0.6, 0.55)), 0.022, 0.0045, { color: CLAW, bone: "wristR" });
    }
  }

  // feet
  for (const [s, ax, az, bone] of [
    [1, 0.2, 0.2, "ankleL"],
    [-1, -0.19, 0.21, "ankleR"],
  ] as const) {
    const fc = V(ax + s * 0.01, 0.025, az + 0.04);
    const fwd = V(s * 0.15, 0, 1).normalize();
    b.part(ball(10), PAW, { at: fc, dir: fwd, axis: "y", scale: [0.036, 0.062, 0.025], bone });
    for (let k = 0; k < 3; k++) {
      const base = fc.clone().addScaledVector(fwd, 0.052).add(V((k - 1) * 0.016, 0.008, 0));
      b.spike(base, [s * 0.1, -0.5, 1], 0.02, 0.0045, { color: CLAW, bone });
    }
    b.spike(fc.clone().add(V(-s * 0.03, 0.006, 0.01)), [-s, -0.4, 0.4], 0.018, 0.0045, { color: CLAW, bone });
  }

  // ---------------- eucalyptus trunk ----------------
  const trunk = catmull([
    [0.15, -0.02, 0.25],
    [0.14, 0.35, 0.24],
    [0.11, 0.7, 0.21],
    [0.08, 1.07, 0.17],
  ]);
  b.sweep(trunk, (t: number) => 0.055 - 0.025 * t, { color: bark, bone: "root", sides: 10, caps: { start: "flat", end: "round" } });
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.4;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    b.spike([0.15 + dx * 0.03, 0.045, 0.25 + dz * 0.03], [dx, -0.45, dz], 0.1, 0.03, { color: bark, bone: "root" });
  }

  const twigs = [
    catmull([trunk.at(0.6), [0.24, 0.72, 0.26], [0.36, 0.7, 0.31]]),
    catmull([trunk.at(0.82), [-0.04, 0.97, 0.27], [-0.17, 1.0, 0.3]]),
    catmull([trunk.at(0.98), [0.12, 1.15, 0.14], [0.19, 1.21, 0.1]]),
  ];
  const leafFrames: ReturnType<typeof frame>[] = [];
  for (const twig of twigs) {
    b.sweep(twig, [0.016, 0.006], { color: "#7d6a52", bone: "root", sides: 6 });
    const ts = [0.15, 0.28, 0.4, 0.52, 0.64, 0.76, 0.88, 0.98];
    ts.forEach((t, i) => {
      const p = twig.at(t);
      const tan = twig.tangentAt(t);
      const side = tan.clone().cross(V(0, 1, 0)).normalize().multiplyScalar(i % 2 ? 1 : -1);
      const dir = tan
        .clone()
        .multiplyScalar(0.35)
        .add(V(0, -0.75, 0))
        .addScaledVector(side, 0.55)
        .add(V((R() - 0.5) * 0.3, 0, (R() - 0.5) * 0.3));
      leafFrames.push(frame(p, dir));
    });
    // gumnuts
    const g = twig.at(0.5);
    for (let k = 0; k < 3; k++) {
      const off = V(Math.cos(k * 2.1) * 0.013, -0.02, Math.sin(k * 2.1) * 0.013);
      const nut = g.clone().add(off);
      b.rod(g, nut.clone().add(V(0, 0.008, 0)), 0.0018, { color: "#6d5a3c", bone: "root", sides: 4 });
      b.part(new THREE.CylinderGeometry(0.0078, 0.0055, 0.016, 6), "#8a7550", { at: nut, bone: "root" });
      b.part(new THREE.CylinderGeometry(0.0056, 0.004, 0.004, 6), "#5a4630", { at: nut.clone().add(V(0, -0.009, 0)), bone: "root" });
    }
  }
  b.cards(leafFrames, leaves, { size: [0.032, 0.085], vary: 0.2, spin: 30, bend: 18, rng: rng(5), bone: "root" });

  // ---------------- sprig in the right paw ----------------
  const sprig = catmull([
    [-0.17, 0.35, 0.34],
    [-0.1, 0.47, 0.27],
    [-0.06, 0.52, 0.215],
    [-0.02, 0.533, 0.17],
  ]);
  b.sweep(sprig, 0.0045, { color: STEM, bone: "wristR", sides: 5 });
  const sprigFrames: ReturnType<typeof frame>[] = [];
  [0.02, 0.1, 0.18, 0.26, 0.34, 0.41].forEach((t, i) => {
    const s = i % 2 ? 1 : -1;
    sprigFrames.push(frame(sprig.at(t), [-0.45 + s * 0.25, -0.8, 0.35 + s * 0.3]));
  });
  sprigFrames.push(frame(sprig.at(0.55), [-0.6, 0.6, 0.5]));
  b.cards(sprigFrames, leaves, { size: [0.03, 0.078], vary: 0.15, spin: 25, bend: 20, rng: rng(8), bone: "wristR" });
  // leaves poking out of the munching mouth
  b.cards(
    [frame([-0.03, 0.53, 0.168], [-0.75, -0.35, 0.55]), frame([-0.036, 0.536, 0.16], [-0.9, 0.12, 0.4])],
    leafA,
    { size: [0.026, 0.06], sink: 0.25, bend: 15, spin: 10, rng: rng(12), bone: "jaw" },
  );

  // ---------------- fallen leaves ----------------
  const fallen = [
    [-0.26, 0.3],
    [0.33, 0.1],
    [-0.04, 0.4],
    [0.31, 0.4],
    [-0.31, 0.04],
    [0.02, 0.33],
  ].map(([x, z]) => frame([x, 0, z], [0, 1, 0]));
  b.cards(fallen, leaves, {
    size: [0.03, 0.08],
    lean: 90,
    sink: 0,
    flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3)],
    vary: 0.2,
    rng: rng(17),
    bone: "root",
  });

  return b.root;
}
```