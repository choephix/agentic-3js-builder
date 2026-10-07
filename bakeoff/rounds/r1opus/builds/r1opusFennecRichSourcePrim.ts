import * as THREE from "three";
import { createBuilder, rng, paint, mix, smoothstep, noise, gradient, catmull } from "../../../../src/index";

export const meta = {
  name: "Fennec Kit at Dusk",
  description:
    "A fennec fox kit standing alert on a little sand dune at dusk: enormous satin-lined ears, cream fur warming to sandy gold, a black-tipped bushy tail, oversized paws and a woven leather collar with a brass bell.",
};

export default function build() {
  const b = createBuilder({ name: "fennecKit", paintSize: 1024 });
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const r = rng(42);

  // ---------- palette ----------
  const CREAM = "#f8ecd6";
  const GOLD = "#d9a35a";
  const DEEP = "#b5793a";
  const DARK = "#2b1d16";

  const fur = paint((p, n) => {
    let t = smoothstep(-0.25, 0.75, n.y) * smoothstep(0.095, 0.135, p.y);
    t *= 1 - 0.75 * smoothstep(0.3, 0.9, n.z);
    let base = mix(CREAM, GOLD, t);
    const saddle = smoothstep(0.82, 0.98, n.y) * smoothstep(0.13, 0.145, p.y) * (1 - smoothstep(0.03, 0.06, Math.abs(p.x)));
    base = mix(base, DEEP, 0.35 * saddle);
    const g = noise(p, 0.012, 3);
    return mix(base, DEEP, 0.28 * t * smoothstep(0.55, 0.8, g));
  });

  const tailPaint = paint((p, n, s) => {
    const tip = smoothstep(0.8, 0.94, s[0]);
    let base = mix(GOLD, CREAM, 0.45 * smoothstep(0.1, -0.7, n.y));
    base = mix(base, DEEP, 0.25 * smoothstep(0.55, 0.8, noise(p, 0.015, 9)));
    return mix(base, "#1e1511", tip);
  });

  const collarPaint = paint((p, n, s) => {
    const k = s[0] * 44 + Math.abs(s[1] - 0.5) * 4;
    const f = k - Math.floor(k);
    const tone = Math.floor(k) % 2 === 0 ? "#8e5a33" : "#704326";
    const edge = smoothstep(0.0, 0.18, f) * smoothstep(1, 0.82, f);
    return mix("#3a2214", tone, edge);
  });

  const dunePaint = paint((p, n) => {
    const w = noise(p, 0.09, 11);
    const rip = 0.5 + 0.5 * Math.sin((p.x * 0.8 + p.z * 0.6) * 170 + w * 7);
    const ridge = smoothstep(0.75, 0.95, rip);
    let base = mix("#efb57e", "#d99260", noise(p, 0.15, 5));
    base = mix(base, "#bf774b", ridge * 0.5);
    base = mix(base, "#f8cfa6", 0.3 * smoothstep(0.4, 0.95, n.y));
    return mix(base, "#b8694a", 0.35 * smoothstep(0.3, -0.6, n.z) * (1 - n.y));
  });

  const satin = new THREE.MeshStandardMaterial({ color: "#f9c4ab", roughness: 0.3, metalness: 0.05 });
  const brass = new THREE.MeshStandardMaterial({ color: "#d9a441", roughness: 0.28, metalness: 0.85 });
  const glossEye = new THREE.MeshStandardMaterial({ color: "#1c110b", roughness: 0.1, metalness: 0.0 });
  const glossNose = new THREE.MeshStandardMaterial({ color: "#1a1210", roughness: 0.22, metalness: 0.0 });

  const G = 0.067; // paw sole height on the dune top

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0, 0] });
  b.chain("spine", [[0, 0.147, -0.05], [0, 0.15, -0.005], [0, 0.153, 0.035]], {
    parent: "root",
    names: ["hips", "spine", "chest"],
    role: "spine",
  });
  b.chain("neck", [[0, 0.158, 0.038], [0, 0.198, 0.072]], { parent: "chest", names: ["neck", "head"], role: "neck" });
  const HC = v3(0, 0.21, 0.08);
  const H = (x: number, y: number, z: number) => HC.clone().add(v3(x, y, z));
  const jawDir = v3(0, -0.25, 1).normalize();
  const jawAt = H(0, -0.018, 0.026);
  b.joint("jaw", { parent: "head", at: jawAt, dir: jawDir, role: "jaw" });

  // ---------- dune (scenery) ----------
  const RX = 0.36, RZ = 0.3, DH = 0.068;
  const dune = (x: number, z: number) => {
    const q = Math.max(0, 1 - (x / RX) ** 2 - (z / RZ) ** 2);
    const y = DH * Math.sqrt(q);
    return { p: v3(x, y, z), n: v3(x / (RX * RX), y / (DH * DH), z / (RZ * RZ)).normalize(), q };
  };
  b.part(new THREE.SphereGeometry(1, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2), dunePaint, {
    at: [0, 0, 0], scale: [RX, DH, RZ], bone: "root",
  });
  b.part(new THREE.SphereGeometry(1, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2), dunePaint, {
    at: [-0.25, 0, -0.17], scale: [0.16, 0.04, 0.13], bone: "root",
  });
  b.part(new THREE.CircleGeometry(1, 18), "#b8774a", { at: [0, 0.0005, 0], rotation: [90, 0, 0], scale: [RX, RZ, 1], bone: "root" });

  // pebbles
  const pebbleCols = ["#9a6b4f", "#c29a7a", "#7d5a46", "#d8b48c"];
  let placed = 0;
  for (let i = 0; i < 60 && placed < 11; i++) {
    const x = (r() * 2 - 1) * RX * 0.85;
    const z = (r() * 2 - 1) * RZ * 0.85;
    if (Math.abs(x) < 0.07 && z > -0.23 && z < 0.09) continue;
    const h = dune(x, z);
    if (h.q < 0.12) continue;
    const s = 0.004 + r() * 0.006;
    b.part(new THREE.IcosahedronGeometry(s, 0), pebbleCols[placed % pebbleCols.length], {
      at: h.p.clone().addScaledVector(h.n, s * 0.2), dir: h.n, scale: [1, 0.6, 1.2], bone: "root", flat: true,
    });
    placed++;
  }
  // dry grass tufts
  const tufts: Array<[number, number]> = [[0.22, -0.1], [-0.24, 0.07], [0.14, 0.19], [-0.1, -0.22]];
  tufts.forEach(([x, z], ti) => {
    const h = dune(x, z);
    for (let k = 0; k < 7; k++) {
      const len = 0.03 + r() * 0.035;
      const a = (k / 7) * Math.PI * 2 + r();
      const dir = h.n.clone().add(v3(Math.cos(a) * 0.45, 0, Math.sin(a) * 0.45)).normalize();
      b.part(new THREE.ConeGeometry(0.0022, len, 3), k % 2 ? "#a8925a" : (ti % 2 ? "#8c7f45" : "#c2a868"), {
        at: h.p.clone().addScaledVector(dir, len / 2 - 0.002), dir, bone: "root", flat: true,
      });
    }
  });
  // little paw-print trail behind the kit
  const prints: Array<[number, number]> = [[0.03, -0.12], [-0.02, -0.15], [0.035, -0.19], [-0.015, -0.22], [0.04, -0.25]];
  prints.forEach(([x, z]) => {
    const h = dune(x, z);
    b.part(new THREE.SphereGeometry(0.0075, 8, 4), "#b06f45", {
      at: h.p.clone().addScaledVector(h.n, -0.0005), dir: h.n, scale: [0.85, 0.22, 1.1], bone: "root",
    });
    for (let t = -1; t <= 1; t++) {
      const tp = dune(x + t * 0.005, z + 0.011);
      b.part(new THREE.SphereGeometry(0.0026, 6, 3), "#b06f45", {
        at: tp.p.clone().addScaledVector(tp.n, -0.0003), dir: tp.n, scale: [1, 0.3, 1], bone: "root",
      });
    }
  });

  // ---------- body ----------
  b.part(new THREE.SphereGeometry(1, 12, 9), fur, { at: [0, 0.148, -0.008], scale: [0.036, 0.036, 0.062], bone: "spine" });
  b.part(new THREE.SphereGeometry(0.034, 12, 9), fur, { at: [0, 0.152, 0.03], bone: "chest" });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.026, 10, 8), fur, { at: [s * 0.016, 0.145, -0.045], bone: "hips" });
  // chest fluff
  [[-0.01, 0.135, 0.058], [0.01, 0.135, 0.058], [0, 0.128, 0.056]].forEach((p, i) =>
    b.part(new THREE.ConeGeometry(0.008, 0.022, 5), CREAM, {
      at: p, dir: [i === 2 ? 0 : p[0] * 20, -1, 0.35], bone: "chest", flat: true,
    }),
  );

  // neck
  const neckA = v3(0, 0.155, 0.035);
  const neckB = v3(0, 0.198, 0.072);
  b.capsule(neckA, neckB, 0.021, { color: fur, bone: "neck", sides: 10 });

  // collar + bell
  const neckDir = neckB.clone().sub(neckA).normalize();
  const collarC = neckA.clone().lerp(neckB, 0.45);
  const perp = v3(0, -neckDir.z, neckDir.y).normalize(); // front-down, square to the neck
  b.part(new THREE.TorusGeometry(0.0225, 0.0043, 6, 20), collarPaint, { at: collarC, dir: neckDir, axis: "z", bone: "neck" });
  const loop = b.part(new THREE.TorusGeometry(0.0028, 0.0009, 4, 8), "#d9a441", {
    at: collarC.clone().addScaledVector(perp, 0.0285), dir: [1, 0, 0], axis: "z", bone: "neck",
  });
  loop.mesh.material = brass;
  const bellC = collarC.clone().addScaledVector(perp, 0.036);
  const bell = b.part(new THREE.SphereGeometry(0.0075, 10, 7), "#d9a441", { at: bellC, bone: "neck" });
  bell.mesh.material = brass;
  const lip = b.part(new THREE.TorusGeometry(0.0072, 0.0012, 4, 12), "#d9a441", {
    at: bellC.clone().add(v3(0, -0.0015, 0)), dir: [0, 1, 0], axis: "z", bone: "neck",
  });
  lip.mesh.material = brass;
  b.part(new THREE.BoxGeometry(0.009, 0.0013, 0.004), "#3a2412", { at: bellC.clone().add(v3(0, -0.0062, 0.002)), bone: "neck" });
  b.part(new THREE.SphereGeometry(0.0016, 6, 4), "#3a2412", { at: bellC.clone().add(v3(0, -0.0058, 0.0045)), bone: "neck" });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 14, 10), fur, { at: HC, scale: [0.034, 0.03, 0.032], bone: "head" });
  for (const s of [1, -1]) {
    // fluffy cheeks
    b.part(new THREE.SphereGeometry(0.016, 10, 7), CREAM, { at: H(s * 0.02, -0.011, 0.008), scale: [1, 0.85, 1], bone: "head" });
    b.part(new THREE.ConeGeometry(0.0075, 0.02, 5), CREAM, {
      at: H(s * 0.034, -0.016, 0.004), dir: [s, -0.6, -0.25], bone: "head", flat: true,
    });
    b.part(new THREE.ConeGeometry(0.006, 0.016, 5), CREAM, {
      at: H(s * 0.03, -0.024, 0.0), dir: [s * 0.6, -1, -0.2], bone: "head", flat: true,
    });
  }
  // muzzle, nose, jaw
  const muzzleDir = v3(0, -0.12, 1).normalize();
  b.part(new THREE.ConeGeometry(0.0145, 0.03, 7), CREAM, { at: H(0, -0.007, 0.04), dir: muzzleDir, scale: [1, 1, 0.72], bone: "head" });
  const nose = b.part(new THREE.SphereGeometry(0.0056, 8, 6), "#1a1210", { at: H(0, -0.0092, 0.055), scale: [1.25, 0.85, 1], bone: "head" });
  nose.mesh.material = glossNose;
  b.part(new THREE.SphereGeometry(0.0015, 5, 4), "#ffffff", { at: H(-0.002, -0.0065, 0.0595), bone: "head" });
  b.part(new THREE.ConeGeometry(0.0085, 0.024, 6), CREAM, {
    at: jawAt.clone().addScaledVector(jawDir, 0.012), dir: jawDir, scale: [1, 1, 0.6], bone: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.0035, 6, 4), "#e48a86", {
    at: jawAt.clone().addScaledVector(jawDir, 0.014).add(v3(0, 0.003, 0)), scale: [1, 0.4, 1.4], bone: "jaw",
  });

  for (const s of [1, -1]) {
    // big dark eyes with sparkle
    const eyeC = H(s * 0.0135, 0.004, 0.0245);
    b.part(new THREE.SphereGeometry(0.0103, 10, 7), "#3a2214", {
      at: eyeC.clone().add(v3(0, 0, -0.0015)), rotation: [0, s * 20, 0], scale: [1, 1, 0.55], bone: "head",
    });
    const eye = b.part(new THREE.SphereGeometry(0.0088, 12, 8), "#1c110b", {
      at: eyeC, rotation: [0, s * 20, 0], scale: [1, 1, 0.72], bone: "head",
    });
    eye.mesh.material = glossEye;
    b.part(new THREE.SphereGeometry(0.0022, 6, 4), "#ffffff", { at: eyeC.clone().add(v3(-0.0026 + s * 0.0012, 0.0033, 0.0058)), bone: "head" });
    b.part(new THREE.SphereGeometry(0.001, 5, 3), "#ffffff", { at: eyeC.clone().add(v3(0.0022 + s * 0.0012, -0.0025, 0.0062)), bone: "head" });
    // tear streak
    b.capsule(H(s * 0.0085, -0.0045, 0.031), H(s * 0.0105, -0.0135, 0.041), 0.0016, { color: "#5a3a22", bone: "head", sides: 5 });
    // whisker freckles and whiskers
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.SphereGeometry(0.0011, 5, 3), "#5a3a22", {
        at: H(s * (0.0095 + k * 0.0018), -0.009 - k * 0.0018, 0.047 - k * 0.003), bone: "head",
      });
      const a = H(s * 0.0105, -0.011 - k * 0.0015, 0.045);
      b.rod(a, a.clone().add(v3(s * 0.036, (1 - k) * 0.009, -0.006)), 0.0005, { color: DARK, bone: "head", sides: 3 });
    }

    // enormous ears
    const S = s > 0 ? "L" : "R";
    const earBase = H(s * 0.02, 0.022, -0.007);
    const earTip = H(s * 0.066, 0.105, -0.016);
    b.chain(`ear${S}`, [earBase, earTip], { parent: "head", names: [`ear${S}`, `ear${S}Tip`], up: [0, 0, 1] });
    const dir = earTip.clone().sub(earBase).normalize();
    const up = v3(s * 0.35, 0, 1);
    const fwd = up.clone().addScaledVector(dir, -up.dot(dir)).normalize();
    const mid = earBase.clone().lerp(earTip, 0.5);
    b.part(new THREE.ConeGeometry(0.03, 0.095, 8), gradient(GOLD, "#a5643a", earBase, earTip), {
      at: mid, dir, up, scale: [1, 1, 0.36], bone: `ear${S}`,
    });
    const inner = b.part(new THREE.ConeGeometry(0.0235, 0.078, 8), "#f9c4ab", {
      at: mid.clone().addScaledVector(dir, -0.007).addScaledVector(fwd, 0.0046), dir, up, scale: [1, 1, 0.3], bone: `ear${S}`,
    });
    inner.mesh.material = satin;
    // satin highlight seam down the middle of the lining
    b.part(new THREE.CylinderGeometry(0.0012, 0.0025, 0.05, 4), "#fde3d4", {
      at: mid.clone().addScaledVector(dir, -0.012).addScaledVector(fwd, 0.0115), dir, up, bone: `ear${S}`,
    });
    // cream fur tufts at the ear opening
    for (let k = -1; k <= 1; k++) {
      const side = dir.clone().cross(fwd).normalize();
      const at = earBase.clone().addScaledVector(dir, 0.014).addScaledVector(fwd, 0.009).addScaledVector(side, k * 0.006);
      b.part(new THREE.ConeGeometry(0.0036, 0.024, 4), "#fff7ec", {
        at, dir: dir.clone().addScaledVector(side, k * 0.35).addScaledVector(fwd, 0.25), bone: `ear${S}`, flat: true,
      });
    }

    // front leg
    const fx = s * 0.024;
    const fl = b.chain(`frontLeg${S}`, [[s * 0.022, 0.135, 0.035], [fx, 0.1, 0.031], [s * 0.026, G + 0.013, 0.038]], {
      parent: "chest", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "leg", contact: [s * 0.026, G, 0.044],
    });
    b.capsule(fl.joints[0], fl.joints[1], [0.011, 0.0088], { color: fur, bone: `shoulder${S}`, sides: 8 });
    b.capsule(fl.joints[1], fl.joints[2], [0.0085, 0.0075], { color: fur, bone: `elbow${S}`, sides: 8 });
    paw(s * 0.026, 0.044, `wrist${S}`);

    // hind leg
    const hl = b.chain(`hindLeg${S}`, [[s * 0.024, 0.14, -0.05], [s * 0.027, 0.108, -0.034], [s * 0.027, 0.088, -0.058], [s * 0.027, G + 0.012, -0.048]], {
      parent: "hips", names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`], role: "leg", contact: [s * 0.027, G, -0.044],
    });
    b.capsule(hl.joints[0], hl.joints[1], [0.0145, 0.0105], { color: fur, bone: `hip${S}`, sides: 8 });
    b.capsule(hl.joints[1], hl.joints[2], [0.0085, 0.007], { color: fur, bone: `knee${S}`, sides: 8 });
    b.capsule(hl.joints[2], hl.joints[3], [0.007, 0.0068], { color: fur, bone: `hock${S}`, sides: 7 });
    paw(s * 0.027, -0.044, `hock${S}`);
  }

  // oversized paws with little toes
  function paw(x: number, z: number, bone: string) {
    b.part(new THREE.SphereGeometry(1, 10, 7), CREAM, { at: [x, G + 0.008, z], scale: [0.0158, 0.0112, 0.0205], bone });
    for (let k = -1; k <= 1; k++)
      b.part(new THREE.SphereGeometry(0.0056, 7, 5), "#f1dfc2", {
        at: [x + k * 0.0072, G + 0.0058, z + 0.0165 - Math.abs(k) * 0.002], bone,
      });
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([[0, 0.146, -0.068], [0, 0.132, -0.11], [0, 0.124, -0.15], [0, 0.135, -0.19], [0, 0.156, -0.215]]),
    { parent: "hips", count: 4, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.011 + 0.017 * Math.sin(Math.PI * (0.12 + 0.8 * t)), { color: tailPaint, sides: 9 });

  return b.root;
}
