```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  scales,
  grain,
  noise,
  smoothstep,
  mix,
  resolve,
  catmull,
} from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed Toucan on a Mossy Branch",
  description:
    "A stylized keel-billed toucan with wings spread wide, perched on a short mossy branch. It has a rainbow beak in lime, sky blue and orange with a cherry tip, glossy black plumage, a lemon bib edged in red, lime eye rings, blue zygodactyl feet, a scarlet undertail and a white rump. A pink orchid blooms beside it.",
};

export default function build() {
  const b = createBuilder({ name: "keelBilledToucan", paintSize: 2048 });
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const DEG = Math.PI / 180;
  const glossy: THREE.Mesh[] = [];

  const BLACK = "#141418";
  const BLUE = "#2f7fe8";
  b.material(BLACK).roughness = 0.3;
  b.material("#1d2030").roughness = 0.3;
  b.material("#15151c").roughness = 0.3;
  b.material("#22253a").roughness = 0.3;
  b.material(BLUE).roughness = 0.4;

  // ---------------------------------------------------------------- skeleton (spine)
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.17, -0.01], aim: [0, 0.24, 0.005], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.24, 0.005], aim: [0, 0.29, 0.015], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.29, 0.015], aim: [0, 0.335, 0.025], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.335, 0.025], aim: [0, 0.345, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.335, 0.065], dir: [0, 0, 1], role: "jaw" });

  // ---------------------------------------------------------------- paints
  const featherBlack = scales(["#101015", "#16161d", "#1b1c27"], "#07070a", { size: 0.011, width: 0.14, seed: 3 });
  const plumage = paint((p, n) => {
    const base = resolve(featherBlack, p, n);
    const lo = 0.12 - 0.45 * smoothstep(0.27, 0.31, p.y);
    const front = smoothstep(lo - 0.12, lo + 0.12, n.z);
    const below = smoothstep(0.36, 0.346, p.y);
    const above = smoothstep(0.226, 0.236, p.y);
    const y = front * below * above;
    const red = front * smoothstep(0.212, 0.218, p.y) * smoothstep(0.236, 0.229, p.y);
    const yellow = mix("#ffd21f", "#fff07a", smoothstep(0.35, 0.75, noise(p, 0.02, 5)) * 0.6);
    const nape = smoothstep(0.3, 0.34, p.y) * smoothstep(-0.2, -0.6, n.z) * 0.45;
    let c = mix(base, "#4a1426", nape);
    c = mix(c, "#d62034", red * (1 - y));
    return mix(c, yellow, y);
  });

  const upperBeak = paint((p, n) => {
    const z = p.z;
    let c = mix("#7cc61f", "#c4ea3a", smoothstep(0.5, 0.95, n.y));
    const side = smoothstep(0.35, 0.7, Math.abs(n.x));
    const band = smoothstep(0.1, 0.125, z) * smoothstep(0.205, 0.18, z);
    c = mix(c, "#ff8a1c", band * side);
    const notch = n.y < -0.15 && n.y > -0.75 && (z * 110) % 1 < 0.3 ? 0.7 : 0;
    c = mix(c, "#25471a", notch * smoothstep(0.08, 0.1, z));
    c = mix(c, "#d8102c", smoothstep(0.208, 0.228, z));
    return mix(c, "#141414", smoothstep(0.08, 0.072, z));
  });
  const lowerBeak = paint((p, n) => {
    const z = p.z;
    let c = mix("#7cc61f", "#2aa8ee", smoothstep(0.1, 0.135, z));
    c = mix(c, "#1d7fd0", smoothstep(-0.2, -0.8, n.y) * smoothstep(0.1, 0.14, z) * 0.6);
    c = mix(c, "#d8102c", smoothstep(0.2, 0.222, z));
    return mix(c, "#141414", smoothstep(0.082, 0.074, z));
  });

  const barkGrain = grain("#4e331f", "#7a5434", { size: 0.006, axis: "x", seed: 2 });
  const bark = paint((p, n) => {
    const c = resolve(barkGrain, p, n);
    const mossy = smoothstep(0.35, 0.85, n.y) * smoothstep(0.42, 0.58, noise(p, 0.035, 9));
    const lichen = smoothstep(0.72, 0.8, noise(p, 0.02, 4)) * 0.8;
    let out = mix(c, "#a3b18c", lichen);
    out = mix(out, mix("#4d7d22", "#7fae36", noise(p, 0.01, 1)), mossy);
    return out;
  });

  // ---------------------------------------------------------------- body, neck, head
  const body = b.part(new THREE.SphereGeometry(1, 16, 12), plumage, {
    bone: hips,
    at: [0, 0.215, 0],
    scale: [0.068, 0.1, 0.072],
    rotation: [12, 0, 0],
  });
  glossy.push(body.mesh);
  const neckTube = b.capsule([0, 0.27, 0.012], [0, 0.335, 0.024], 0.042, { color: plumage, bone: neck, sides: 12 });
  glossy.push(...neckTube.meshes);
  const H = V(0, 0.348, 0.028);
  const headBall = b.part(new THREE.SphereGeometry(0.052, 14, 10), plumage, { bone: head, at: H });
  glossy.push(headBall.mesh);

  // ---------------------------------------------------------------- beak (upper on head, lower on jaw)
  const upper = b.loft(
    [
      { at: [0, 0.363, 0.055], w: 0.05, h: 0.06 },
      { at: [0, 0.368, 0.11], w: 0.044, h: 0.056 },
      { at: [0, 0.358, 0.175], w: 0.034, h: 0.042 },
      { at: [0, 0.338, 0.225], w: 0.02, h: 0.026 },
      { at: [0, 0.316, 0.258], w: 0.006, h: 0.009 },
    ],
    { color: upperBeak, bone: head, sides: 10, name: "beakUpper" },
  );
  glossy.push(...upper.meshes);
  const lower = b.loft(
    [
      { at: [0, 0.332, 0.06], w: 0.044, h: 0.03 },
      { at: [0, 0.332, 0.12], w: 0.038, h: 0.026 },
      { at: [0, 0.327, 0.185], w: 0.026, h: 0.018 },
      { at: [0, 0.316, 0.235], w: 0.01, h: 0.009 },
    ],
    { color: lowerBeak, bone: jaw, sides: 10, name: "beakLower" },
  );
  glossy.push(...lower.meshes);

  // ---------------------------------------------------------------- eyes with lime skin rings
  for (const s of [1, -1]) {
    const d = V(0.78 * s, 0.3, 0.55).normalize();
    const at = (k: number) => H.clone().addScaledVector(d, k);
    b.part(new THREE.CylinderGeometry(0.019, 0.02, 0.01, 12), "#9be22d", { bone: head, at: at(0.048), dir: d, flat: true });
    b.part(new THREE.TorusGeometry(0.0125, 0.0026, 6, 12), "#5fae1f", { bone: head, at: at(0.0535), dir: d, axis: "z" });
    b.part(new THREE.SphereGeometry(0.0095, 10, 8), "#3d5226", { bone: head, at: at(0.0535) });
    b.part(new THREE.SphereGeometry(0.0065, 8, 6), "#050505", { bone: head, at: at(0.0605) });
    b.part(new THREE.SphereGeometry(0.0022, 6, 4), "#ffffff", {
      bone: head,
      at: at(0.066).add(V(0, 0.003, 0.002)),
    });
  }

  // ---------------------------------------------------------------- tail, white rump, scarlet undertail
  const tail = b.chain("tail", catmull([[0, 0.14, -0.06], [0, 0.085, -0.125], [0, 0.035, -0.175]]), {
    parent: hips,
    names: ["tail1", "tail2", "tailTip"],
    role: "tail",
  });
  const tailTube = b.sweep(tail, (t) => [0.03 + 0.012 * t, 0.006 - 0.002 * t], {
    section: "box",
    color: featherBlack,
    caps: "flat",
    name: "tailFeathers",
  });
  glossy.push(...tailTube.meshes);
  b.part(new THREE.SphereGeometry(1, 10, 8), "#e0162b", {
    bone: hips,
    at: [0, 0.128, -0.05],
    scale: [0.034, 0.024, 0.036],
    rotation: [-35, 0, 0],
    name: "undertailScarlet",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), "#f3f0e6", {
    bone: hips,
    at: [0, 0.165, -0.066],
    scale: [0.032, 0.016, 0.03],
    rotation: [-30, 0, 0],
    name: "rumpWhite",
  });

  // ---------------------------------------------------------------- wings, spread wide
  const feather = (base: THREE.Vector3, d: THREE.Vector3, L: number, w: number, color: string, bone: string) => {
    const side = new THREE.Vector3().crossVectors(d, V(0, 1, 0)).normalize();
    const at = (f: number, g: number) => base.clone().addScaledVector(d, f * L).addScaledVector(side, g * w);
    return b.slab([at(0, -0.4), at(0.8, -0.5), at(0.95, -0.32), at(1, 0), at(0.95, 0.32), at(0.8, 0.5), at(0, 0.4)], {
      color,
      thickness: 0.004,
      bone,
    });
  };
  for (const [s, S] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const P = (x: number, y: number, z: number) => V(x * s, y, z);
    const lead = [P(0.058, 0.262, 0), P(0.13, 0.27, -0.012), P(0.195, 0.272, -0.018), P(0.255, 0.268, -0.035)];
    const wing = b.chain(`wing${S}`, lead, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `wingTip${S}`],
      role: "wing",
    });
    const trail = catmull([P(0.055, 0.255, -0.085), P(0.13, 0.258, -0.115), P(0.195, 0.262, -0.105), P(0.25, 0.265, -0.06)]);
    b.membrane(wing, trail, { color: BLACK, thickness: 0.01, bone: wing, name: `wingWeb${S}` });
    const outward = V(s, 0, -0.35).normalize();
    for (let k = 0; k < 12; k++) {
      const u = k / 11;
      const l = wing.at(Math.min(u, 0.999)).at;
      const tr = trail.at(u);
      const base = l.clone().lerp(tr, 0.45);
      base.y -= 0.003 + (k % 2) * 0.0025;
      const d = tr.clone().sub(l).setY(0).normalize().lerp(outward, 0.75 * u * u).normalize();
      feather(base, d, 0.065 + 0.05 * u * u, 0.026, u > 0.55 ? "#1d2030" : "#15151c", wing.nearestJoint(base).name);
    }
    for (let k = 0; k < 9; k++) {
      const u = ((k + 0.5) / 9) * 0.92;
      const l = wing.at(u).at;
      const tr = trail.at(u);
      const base = l.clone().lerp(tr, 0.12);
      base.y += 0.006 + (k % 2) * 0.0015;
      const d = tr.clone().sub(l).setY(0).normalize().lerp(outward, 0.5 * u * u).normalize();
      feather(base, d, 0.045, 0.032, "#22253a", wing.nearestJoint(base).name);
    }
  }

  // ---------------------------------------------------------------- legs and zygodactyl blue feet
  for (const [s, S] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const ankleV = V(0.034 * s, 0.09, 0.004);
    const leg = b.chain(`leg${S}`, [V(0.03 * s, 0.16, 0), V(0.036 * s, 0.125, 0.022), ankleV], {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [0.034 * s, 0.08, 0],
    });
    b.sweep(leg, (t) => 0.013 - 0.007 * t, { color: (t) => (t < 0.42 ? BLACK : BLUE), sides: 8 });
    const ankle = leg.joints[2];
    b.part(new THREE.SphereGeometry(0.0075, 8, 6), BLUE, { bone: ankle, at: ankleV });
    const toes: Array<[number, number]> = [
      [0.008, 1],
      [-0.006, 1],
      [0.007, -1],
      [-0.008, -1],
    ];
    toes.forEach(([dx, sz], i) => {
      const pts = [ankleV.clone()];
      for (const a of [14, 34, 56]) {
        const r = a * DEG;
        pts.push(V(0.034 * s + dx * s * (a / 56), 0.04 + 0.0445 * Math.cos(r), sz * 0.0445 * Math.sin(r)));
      }
      const name = `toe${S}${i + 1}`;
      const toe = b.chain(name, catmull(pts), { parent: ankle, count: 1, names: [name], role: "digit" });
      b.sweep(toe, (t) => 0.0048 - 0.0015 * t, { color: BLUE, sides: 6 });
      const r = 56 * DEG;
      b.spike(pts[3], V(0, -Math.sin(r), sz * Math.cos(r)), 0.009, 0.0026, {
        color: "#1f2b45",
        bone: toe.joints[0],
        sides: 5,
      });
    });
  }

  // ---------------------------------------------------------------- mossy branch
  b.sweep(
    catmull([
      [-0.33, 0.042, 0.01],
      [-0.1, 0.04, -0.005],
      [0.12, 0.041, 0.004],
      [0.33, 0.038, -0.008],
    ]),
    [0.042, 0.039, 0.04, 0.036],
    { color: bark, bone: root, sides: 10, caps: "flat", name: "branch" },
  );
  for (const [x, y, z, r] of [
    [-0.334, 0.042, 0.01, 0.042],
    [0.334, 0.038, -0.008, 0.036],
  ]) {
    b.part(new THREE.CylinderGeometry(r * 0.92, r * 0.92, 0.006, 10), "#d4b27f", { bone: root, at: [x, y, z], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(r * 0.55, r * 0.55, 0.008, 10), "#b48a55", { bone: root, at: [x, y, z], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(r * 0.18, r * 0.18, 0.01, 6), "#8a6236", { bone: root, at: [x, y, z], rotation: [0, 0, 90] });
  }
  // twig with a leaf, a knot, shelf fungus
  b.sweep(catmull([[-0.18, 0.065, -0.01], [-0.22, 0.11, -0.04], [-0.25, 0.16, -0.05]]), [0.012, 0.005], {
    color: bark,
    bone: root,
    sides: 7,
  });
  b.slab(
    [V(-0.25, 0.16, -0.05), V(-0.27, 0.18, -0.03), V(-0.29, 0.205, -0.02), V(-0.282, 0.185, -0.045), V(-0.265, 0.165, -0.055)],
    { color: "#4f8a2c", thickness: 0.003, bone: root },
  );
  b.part(new THREE.SphereGeometry(0.012, 7, 5), "#5c3d24", { bone: root, at: [0.08, 0.045, 0.036], scale: [1, 0.8, 0.6], flat: true });
  b.part(new THREE.SphereGeometry(1, 10, 6), "#e9a23b", { bone: root, at: [-0.27, 0.045, 0.042], scale: [0.02, 0.005, 0.015] });
  b.part(new THREE.SphereGeometry(1, 10, 6), "#f2c46a", { bone: root, at: [-0.25, 0.032, 0.04], scale: [0.014, 0.004, 0.011] });

  // moss cushions and sporophytes
  const mossCols = ["#4f7f24", "#6a9a2c", "#3d6b20", "#86b23a"];
  let placed = 0;
  for (let i = 0; i < 160 && placed < 40; i++) {
    const x = -0.3 + R() * 0.6;
    const a = (R() - 0.5) * 140 * DEG;
    if (Math.abs(x) < 0.065 && Math.abs(a) < 70 * DEG) continue;
    if (x > 0.12 && x < 0.23) continue;
    const nrm = V(0, Math.cos(a), Math.sin(a));
    const at = V(x, 0.04, 0).addScaledVector(nrm, 0.04);
    const sx = 0.01 + R() * 0.012;
    b.part(new THREE.IcosahedronGeometry(1, 0), mossCols[Math.floor(R() * 4)], {
      bone: root,
      at,
      dir: nrm,
      scale: [sx, 0.005 + R() * 0.003, sx * (0.7 + R() * 0.5)],
    });
    placed++;
  }
  for (let i = 0; i < 9; i++) {
    const x = -0.29 + R() * 0.2 + (i > 4 ? 0.33 : 0);
    const a = (R() - 0.5) * 60 * DEG;
    const base = V(x, 0.04 + 0.041 * Math.cos(a), 0.041 * Math.sin(a));
    const tip = base.clone().add(V((R() - 0.5) * 0.01, 0.022 + R() * 0.01, (R() - 0.5) * 0.01));
    b.rod(base, tip, 0.0008, { color: "#8a5a2a", bone: root, sides: 4 });
    b.part(new THREE.SphereGeometry(0.0018, 5, 4), "#d9792e", { bone: root, at: tip });
  }

  // ---------------------------------------------------------------- pink orchid
  const C = V(0.2, 0.19, 0.075);
  const F = V(-0.25, 0.15, 1).normalize();
  const right = new THREE.Vector3().crossVectors(V(0, 1, 0), F).normalize();
  const upv = new THREE.Vector3().crossVectors(F, right).normalize();
  const petalPaint = paint((p) => {
    const d = p.distanceTo(C);
    const base = mix("#fde6f2", "#f06aae", smoothstep(0.006, 0.03, d));
    const freckle = smoothstep(0.66, 0.72, noise(p, 0.003, 21)) * (1 - smoothstep(0.012, 0.022, d));
    return mix(base, "#b4155f", freckle);
  });
  const petal = (deg: number, len: number, wid: number, color: string | typeof petalPaint, cup: number, push = 0) => {
    const a = deg * DEG;
    const dA = right.clone().multiplyScalar(Math.cos(a)).addScaledVector(upv, Math.sin(a));
    const side = new THREE.Vector3().crossVectors(F, dA);
    const center = C.clone().addScaledVector(dA, (len / 2) * 0.85).addScaledVector(F, push);
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 10; k++) {
      const t = (k / 10) * Math.PI * 2;
      pts.push(
        center
          .clone()
          .addScaledVector(dA, (len / 2) * Math.cos(t))
          .addScaledVector(side, (wid / 2) * Math.sin(t))
          .addScaledVector(F, cup * ((Math.cos(t) + 1) / 2)),
      );
    }
    b.slab(pts, { color, thickness: 0.002, bone: "root" });
  };
  b.sweep(catmull([[0.16, 0.075, 0.012], [0.165, 0.13, 0.03], [0.178, 0.17, 0.052], [0.198, 0.188, 0.07]]), 0.0028, {
    color: "#5b8a2c",
    bone: root,
    sides: 6,
  });
  petal(90, 0.032, 0.015, petalPaint, 0.006, -0.002);
  petal(215, 0.03, 0.014, petalPaint, 0.006, -0.002);
  petal(325, 0.03, 0.014, petalPaint, 0.006, -0.002);
  petal(10, 0.034, 0.03, petalPaint, 0.008);
  petal(170, 0.034, 0.03, petalPaint, 0.008);
  petal(270, 0.022, 0.016, "#b0124f", 0.004, 0.005);
  b.part(new THREE.SphereGeometry(0.0045, 8, 6), "#ffd23a", { bone: root, at: C.clone().addScaledVector(F, 0.008).addScaledVector(upv, -0.005) });
  b.part(new THREE.SphereGeometry(0.0045, 8, 6), "#fff4f9", { bone: root, at: C.clone().addScaledVector(F, 0.006).addScaledVector(upv, 0.004), scale: [1, 1.4, 1] });
  b.part(new THREE.SphereGeometry(0.007, 8, 6), "#f48cc0", { bone: root, at: [0.172, 0.165, 0.047], scale: [1, 1.2, 1] });
  b.part(new THREE.SphereGeometry(0.0045, 6, 5), "#9cc35a", { bone: root, at: [0.166, 0.145, 0.037] });
  // waxy leaves lying along the branch, aerial roots wrapping it
  b.part(new THREE.SphereGeometry(1, 10, 6), "#3e7a35", { bone: root, at: [0.19, 0.082, 0.012], scale: [0.048, 0.005, 0.017], rotation: [8, 20, 0] });
  b.part(new THREE.SphereGeometry(1, 10, 6), "#356c2e", { bone: root, at: [0.14, 0.081, -0.01], scale: [0.042, 0.005, 0.015], rotation: [-8, -25, 0] });
  for (const [x0, drift] of [
    [0.165, 0.02],
    [0.15, -0.015],
  ]) {
    const pts = [30, 70, 110, 150].map((deg, k) => {
      const a = deg * DEG;
      return V(x0 + drift * (k / 3), 0.04 + 0.043 * Math.cos(a), 0.043 * Math.sin(a));
    });
    b.sweep(catmull(pts), [0.0026, 0.0018], { color: "#b9c7a6", bone: root, sides: 5 });
  }

  // ---------------------------------------------------------------- finish: glossy plumage and beak
  const out = b.root;
  const gloss = b.ctx.paintMaterial().clone();
  gloss.roughness = 0.28;
  gloss.metalness = 0.05;
  gloss.name = "paintGloss";
  for (const m of glossy) m.material = gloss;
  return out;
}
```