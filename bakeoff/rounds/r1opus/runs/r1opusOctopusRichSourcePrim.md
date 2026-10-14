```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  frame,
  paint,
  mottle,
  spots,
  mix,
  smoothstep,
  interpolate,
} from "agentic-3js-builder";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust reef octopus with a bumpy, pale-mottled bulbous mantle, golden bar-pupil eyes under grumpy lids and brows, eight curling sucker-lined arms, and one arm proudly raising an old shipwreck brass key.",
};

export default function build() {
  const b = createBuilder({ name: "reefOctopus", paintSize: 2048 });
  const R = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- palette ----------
  const CORAL = "#e2643f";
  const RUST = "#a63b22";
  const DEEP = "#7d2a17";
  const PALE = "#f2b796";
  const PALE2 = "#f8cdb0";
  const VENTRAL = "#f6c7a8";
  const CREAM = "#fbe8cc";
  const CUP = "#d07b60";
  const BROW = "#8a2c1a";
  const BUMPS = ["#ee8a68", "#f3b08f", "#c9482c", "#f6c2a2"];

  const skin = spots(
    spots(mottle(CORAL, RUST, { size: 0.05, seed: 3, contrast: 1.2 }), [PALE, PALE2], {
      size: 0.03,
      amount: 0.32,
      seed: 5,
    }),
    DEEP,
    { size: 0.016, amount: 0.1, seed: 9 },
  );
  const armPaint = paint((p, n, s) => {
    const deg = ((s[1] % 360) + 360) % 360;
    const d = Math.abs(deg - 180);
    const v = smoothstep(80, 40, d);
    const top = skin.at(p, n);
    const c = mix(top, VENTRAL, v * 0.9);
    return mix(c, "#f39373", smoothstep(0.75, 1, s[0]) * 0.35);
  });

  // ---------- skeleton core ----------
  const body = b.joint("body", { at: [0, 0.06, 0] });
  const head = b.joint("head", { parent: body, at: [0, 0.11, 0.035], dir: [0, 1, 0], role: "head" });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.1, 0],
      [0, 0.17, -0.07],
      [0, 0.255, -0.14],
    ]),
    { parent: head, count: 2, names: ["mantle1", "mantle2"], role: "spine" },
  );

  // ---------- body volumes ----------
  const mts = [0, 0.2, 0.45, 0.7, 0.88, 1];
  const mrs = [0.065, 0.092, 0.104, 0.092, 0.065, 0.038];
  const mantleSweep = b.sweep(
    mantle,
    (t) => {
      const r = interpolate(mts, mrs, t);
      return [r * 1.06, r] as const;
    },
    { color: skin, sides: 14, name: "mantleSac" },
  );
  const headPart = b.part(new THREE.SphereGeometry(0.075, 16, 12), skin, {
    bone: head,
    at: [0, 0.105, 0.035],
    scale: [1.15, 0.85, 1],
    name: "headBulb",
  });
  b.part(new THREE.SphereGeometry(0.1, 18, 8), skin, {
    bone: body,
    at: [0, 0.05, -0.005],
    scale: [1, 0.45, 1],
    name: "armCrown",
  });

  // beak (upper on body, lower on jaw) hidden under the crown
  b.part(new THREE.ConeGeometry(0.011, 0.02, 6), "#3b2418", { bone: body, at: [0, 0.03, 0.01], rotation: [180, 0, 0] });
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.03, 0], dir: [0, -0.3, 1], role: "jaw" });
  b.part(new THREE.ConeGeometry(0.009, 0.016, 6), "#2a1810", { bone: jaw, at: [0, 0.022, -0.004], rotation: [180, 0, 0] });

  // siphon on the left flank
  const sA = V(0.055, 0.075, -0.035);
  const sB = V(0.097, 0.068, -0.052);
  b.rod(sA, sB, [0.013, 0.0105], { color: skin, bone: "body", sides: 8, name: "siphon" });
  b.part(new THREE.TorusGeometry(0.0095, 0.0022, 4, 10), BROW, {
    bone: body,
    at: sB,
    dir: sB.clone().sub(sA),
    axis: "z",
  });

  // ---------- eyes ----------
  const eyeCentres: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const E = V(s * 0.062, 0.138, 0.058);
    eyeCentres.push(E);
    const g = V(s * 0.74, 0.22, 0.64).normalize();
    b.part(new THREE.SphereGeometry(0.03, 12, 9), skin, { bone: head, at: E, name: `socket${side}` });
    const C = E.clone().addScaledVector(g, 0.013);
    const eye = b.joint(`eye${side}`, { parent: head, at: C, dir: g });
    b.part(new THREE.SphereGeometry(0.022, 14, 10), "#e8bf45", { bone: eye, at: C });
    b.part(new THREE.SphereGeometry(0.0222, 14, 4, 0, Math.PI * 2, 0, 0.9), "#b0661a", { bone: eye, at: C, dir: g });
    b.part(new THREE.SphereGeometry(0.0225, 14, 4, 0, Math.PI * 2, 0, 0.62), "#f4c534", { bone: eye, at: C, dir: g });
    b.part(new THREE.BoxGeometry(0.019, 0.0055, 0.006), "#16100c", {
      bone: eye,
      at: C.clone().addScaledVector(g, 0.0215),
      dir: g,
      axis: "z",
      name: `pupil${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0028, 6, 4), "#fffbe8", {
      bone: eye,
      at: C.clone().addScaledVector(g, 0.021).add(V(-s * 0.004, 0.007, 0)),
    });
    // heavy lid, sagging toward the middle: grumpy
    const lid = b.joint(`lid${side}`, { parent: head, at: C, dir: g, up: [0, 1, 0], role: "hinge" });
    const lidDir = V(-0.3 * s, 1, 0.1).normalize();
    b.part(new THREE.SphereGeometry(0.0248, 14, 6, 0, Math.PI * 2, 0, 1.15), skin, {
      bone: lid,
      at: C,
      dir: lidDir,
      name: `lid${side}`,
    });
    // furrowed brow ridge, low on the inside
    const inner = C.clone().add(V(-s * 0.02, 0.021, 0.012));
    const outer = C.clone().add(V(s * 0.017, 0.031, -0.006));
    b.capsule(inner, outer, [0.0065, 0.005], { color: BROW, bone: "head", sides: 6, name: `brow${side}` });
    // little horn papillae over the eye
    b.spike(outer, [s * 0.35, 1, -0.25], 0.024, 0.006, { color: skin, bone: "head", sides: 6 });
    b.spike(C.clone().add(V(-s * 0.004, 0.03, 0.002)), [-s * 0.1, 1, 0.1], 0.013, 0.004, {
      color: skin,
      bone: "head",
      sides: 5,
    });
  }

  // ---------- bumps on mantle and head ----------
  const bumpGeo = new THREE.SphereGeometry(1, 6, 4);
  const pickBump = () => BUMPS[Math.floor(R() * BUMPS.length)];
  for (const hit of b.surface(mantleSweep).scatter(80, { rng: rng(21), minDist: 0.013 })) {
    b.stick(bumpGeo, pickBump(), hit, { scale: 0.0035 + R() * 0.0035, embed: 0.55 });
  }
  for (const hit of b.surface(headPart).scatter(26, {
    rng: rng(33),
    minDist: 0.013,
    keepOut: (p) => p.y < 0.08 || eyeCentres.some((e) => p.distanceTo(e) < 0.042),
  })) {
    b.stick(bumpGeo, pickBump(), hit, { scale: 0.003 + R() * 0.003, embed: 0.55 });
  }

  // ---------- arms ----------
  const at3 = (az: number, r: number, y: number, sd: number) =>
    V(Math.sin(az) * r + Math.cos(az) * sd, y, Math.cos(az) * r - Math.sin(az) * sd);
  const rFn = (th: number) => (t: number) => (0.0055 + 0.026 * Math.pow(1 - t, 1.15)) * th;
  const basePts = [
    [0.04, 0.055, 0],
    [0.12, 0.032, 0.004],
    [0.215, 0.019, 0.016],
    [0.305, 0.0145, 0.04],
    [0.375, 0.026, 0.066],
    [0.41, 0.07, 0.082],
    [0.385, 0.112, 0.088],
    [0.34, 0.108, 0.085],
    [0.325, 0.078, 0.075],
  ];
  const keyPts = [
    [0.04, 0.06, 0],
    [0.115, 0.05, 0],
    [0.185, 0.085, 0.005],
    [0.215, 0.16, 0.012],
    [0.205, 0.24, 0.02],
    [0.17, 0.295, 0.03],
    [0.135, 0.29, 0.038],
    [0.128, 0.258, 0.04],
  ];
  const armDefs = [
    { nm: "L1", az: 22.5 },
    { nm: "L2", az: 67.5 },
    { nm: "L3", az: 112.5 },
    { nm: "L4", az: 157.5 },
    { nm: "R4", az: 202.5 },
    { nm: "R3", az: 247.5 },
    { nm: "R2", az: 292.5 },
    { nm: "R1", az: 337.5 },
  ];
  const rimGeo = new THREE.TorusGeometry(1, 0.32, 4, 10).rotateX(Math.PI / 2);
  const cupGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.35, 10);
  const arms: Array<{ chain: ReturnType<typeof b.chain>; az: number }> = [];
  let keyChain: ReturnType<typeof b.chain> | null = null;
  let keyAz = 0;

  for (const def of armDefs) {
    const az = def.az * (Math.PI / 180);
    const isKey = def.nm === "L2";
    const L = 0.88 + R() * 0.2;
    const c = 0.8 + R() * 0.55;
    const sway = (R() * 2 - 1) * 1.1;
    const th = 0.9 + R() * 0.15;
    const pts = isKey
      ? keyPts.map(([r, y, sd]) => at3(az, r, y, sd))
      : basePts.map(([r, y, sd], i) =>
          at3(az, i === 0 ? r : r * L, i >= 4 ? 0.026 + (y - 0.026) * c : y, sd * sway),
        );
    const chain = b.chain(`arm${def.nm}`, catmull(pts), {
      parent: body,
      count: 6,
      role: "tentacle",
      names: (i: number) => `arm${def.nm}_${i + 1}`,
    });
    const rf = rFn(th);
    const sw = b.sweep(chain, rf, { color: armPaint, sides: 10, name: `arm${def.nm}` });
    arms.push({ chain, az });
    if (isKey) {
      keyChain = chain;
      keyAz = az;
    }

    // suckers: zig-zag double row, single row near the tip
    const n = 16;
    for (let i = 0; i < n; i++) {
      const t = 0.08 + (0.88 * i) / (n - 1);
      const ang = t > 0.75 ? 180 : 180 + (i % 2 ? 32 : -32);
      const pt = sw.at(t, ang);
      if (pt.n.y < -0.55) continue;
      const size = rf(t) * 0.42;
      b.stick(rimGeo, CREAM, pt, { scale: size, embed: 0.2 });
      b.stick(cupGeo, CUP, pt, { scale: size, embed: 0.2 });
    }
    // dorsal bumps
    for (let j = 0; j < 6; j++) {
      const t = 0.08 + 0.13 * j + R() * 0.05;
      const pt = sw.at(t, (R() - 0.5) * 100);
      if (pt.n.y < -0.3) continue;
      b.stick(bumpGeo, pickBump(), pt, { scale: rf(t) * (0.18 + R() * 0.12), embed: 0.55 });
    }
  }

  // webbing between neighbouring arm roots
  for (let i = 0; i < arms.length; i++) {
    const a = arms[i];
    const nb = arms[(i + 1) % arms.length];
    b.membrane(a.chain.path.slice(0.02, 0.17), nb.chain.path.slice(0.02, 0.17), {
      color: skin,
      thickness: 0.004,
      bone: a.chain,
      rows: 3,
      name: `web${i + 1}`,
    });
  }

  // ---------- the shipwreck brass key ----------
  if (keyChain) {
    const tipJoint = keyChain.joints[keyChain.joints.length - 1];
    const d = V(Math.sin(keyAz), 0, Math.cos(keyAz));
    const tv = V(Math.cos(keyAz), 0, -Math.sin(keyAz));
    const G = at3(keyAz, 0.165, 0.262, 0.034);
    const axis = V(0, 1, 0).addScaledVector(d, 0.2).addScaledVector(tv, 0.1).normalize();
    const kf = frame(G, axis, [0, 0, 1]);
    const q = kf.quat;
    const BRASS = "#c99a3b";
    const BRASS_DK = "#8c6a26";
    const brassMat = b.material(BRASS);
    brassMat.metalness = 0.65;
    brassMat.roughness = 0.36;
    const darkMat = b.material(BRASS_DK);
    darkMat.metalness = 0.5;
    darkMat.roughness = 0.5;
    const kp = (geo: THREE.BufferGeometry, color: string, local: number[], scale?: number[]) =>
      b.part(geo, color, { bone: tipJoint, at: kf.local(local), quat: q, scale, group: "key" });

    kp(new THREE.TorusGeometry(0.016, 0.0038, 6, 14), BRASS, [0, -0.036, 0]);
    kp(new THREE.BoxGeometry(0.026, 0.003, 0.003), BRASS_DK, [0, -0.036, 0]);
    kp(new THREE.SphereGeometry(0.0045, 8, 6), BRASS_DK, [0, -0.036, 0], [1, 1, 0.7]);
    kp(new THREE.SphereGeometry(0.0055, 8, 6), BRASS, [0, -0.019, 0]);
    kp(new THREE.CylinderGeometry(0.0058, 0.0058, 0.005, 8), BRASS_DK, [0, -0.014, 0]);
    kp(new THREE.CylinderGeometry(0.0058, 0.0058, 0.005, 8), BRASS_DK, [0, -0.004, 0]);
    kp(new THREE.CylinderGeometry(0.0032, 0.0032, 0.088, 8), BRASS, [0, 0.034, 0]);
    kp(new THREE.SphereGeometry(0.004, 8, 6), BRASS, [0, 0.08, 0]);
    kp(new THREE.BoxGeometry(0.02, 0.022, 0.0042), BRASS, [0.011, 0.064, 0]);
    kp(new THREE.BoxGeometry(0.006, 0.008, 0.0042), BRASS, [0.024, 0.072, 0]);
    kp(new THREE.BoxGeometry(0.007, 0.005, 0.0047), "#2e2410", [0.016, 0.06, 0]);
    kp(new THREE.BoxGeometry(0.004, 0.004, 0.0047), "#2e2410", [0.008, 0.07, 0]);
    // verdigris and a barnacle from the wreck
    const VERD = "#5fae92";
    kp(new THREE.SphereGeometry(0.0036, 6, 4), VERD, [0.013, -0.044, 0.002], [1, 1, 0.5]);
    kp(new THREE.SphereGeometry(0.003, 6, 4), VERD, [-0.015, -0.03, 0.002], [1, 1, 0.5]);
    kp(new THREE.SphereGeometry(0.003, 6, 4), VERD, [0.005, 0.054, 0.002], [1, 1, 0.5]);
    kp(new THREE.SphereGeometry(0.0025, 6, 4), VERD, [-0.001, 0.02, 0.003], [1, 1, 0.5]);
    b.part(new THREE.ConeGeometry(0.004, 0.005, 6), "#ece4d0", {
      bone: tipJoint,
      at: kf.local([-0.011, -0.05, 0.003]),
      dir: kf.dir([0, 0, 1]),
      group: "key",
    });
  }

  return b.root;
}
```