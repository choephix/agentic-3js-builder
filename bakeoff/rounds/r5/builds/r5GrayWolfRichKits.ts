import * as THREE from "three";
import { createBuilder, catmull, rng, paint, mix, noise, smoothstep, gradient } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf (Alert)",
  description:
    "Chunky, Warcraft-style gray wolf standing alert: heavy shoulders, shaggy mane and chest ruff, big paws with claws, glowing amber eyes, upright ears, and a separate jaw.",
};

// ---------- palette ----------
const FUR_D = "#4a4d53";
const FUR_M = "#73767b";
const FUR_L = "#9c9d9b";
const CREAM = "#e6dec9";
const TAN = "#b9a98a";
const DARK = "#25262b";
const IVORY = "#f1ead4";
const CLAW = "#2a2622";
const NOSE = "#141418";
const AMBER = "#ffb21f";
const MAW = "#5a1d26";
const TONGUE = "#c4575c";
const EAR_IN = "#b8918a";

// ---------- helpers ----------
function keyed(keys: number[]) {
  return (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(x), keys.length - 2);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return keys[i] * (1 - u) + keys[i + 1] * u;
  };
}

function ell(rx: number, ry: number, rz: number, w = 8, h = 6) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}

const q = new THREE.Vector3();

// Hand-painted gray wolf coat: streaky fur, dark saddle, cream belly, tan socks, pale muzzle, dark nose bridge.
const coat = paint((p, n) => {
  const big = noise(p, 0.12, 3);
  q.set(p.x * 4, p.y * 4, p.z * 0.9);
  const fine = noise(q, 0.05, 8);
  let c = mix(FUR_D, FUR_L, smoothstep(0.25, 0.75, big) * 0.6 + fine * 0.4);
  const saddle = smoothstep(0.3, 0.9, n.y) * smoothstep(0.76, 0.95, p.y);
  c = mix(c, DARK, 0.5 * saddle * (0.5 + 0.5 * big));
  c = mix(c, CREAM, 0.85 * smoothstep(0.0, -0.5, n.y));
  c = mix(c, TAN, 0.8 * smoothstep(0.42, 0.2, p.y));
  const muz = smoothstep(1.02, 1.1, p.z) * smoothstep(0.98, 1.04, p.y);
  c = mix(c, CREAM, muz * 0.8);
  c = mix(c, DARK, 0.6 * smoothstep(1.0, 1.1, p.z) * smoothstep(0.03, 0.0, Math.abs(p.x)) * smoothstep(0.4, 0.8, n.y));
  return c;
});

export default function build() {
  const b = createBuilder({ name: "wolf" });
  const R = rng(11);
  const pick = <T,>(a: T[]): T => a[Math.floor(R() * a.length)];
  const flow = (path: ReturnType<typeof catmull>, h: { n: THREE.Vector3; at: THREE.Vector3 }, k: number, sign: number) => {
    const t = path.tangentAt(path.closestT(h.at));
    return h.n.clone().multiplyScalar(k).addScaledVector(t, sign).normalize();
  };

  // ---------- skeleton: spine ----------
  const hips = b.joint("hips", { at: [0, 0.78, -0.4], dir: [0, 0, 1], role: "spine" });
  const spinePath = catmull([
    [0, 0.78, -0.4],
    [0, 0.8, -0.05],
    [0, 0.84, 0.25],
    [0, 0.87, 0.48],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, role: "spine" });
  const spineEnd = spine.joints[spine.joints.length - 1];

  const rx = keyed([0.16, 0.19, 0.205, 0.2]);
  const ry = keyed([0.19, 0.215, 0.25, 0.26]);
  const sh = keyed([0.0, 0.02, 0.035, 0.04]);
  const body = b.sweep(spine, (t) => [rx(t), ry(t)], { shift: (t) => [0, -sh(t)], color: coat, sides: 10 });

  // ---------- neck & head ----------
  const neckPath = catmull([
    [0, 0.88, 0.48],
    [0, 1.0, 0.62],
    [0, 1.14, 0.78],
  ]);
  const neck = b.chain("neck", neckPath, { parent: spineEnd, role: "neck" });
  const neckTube = b.sweep(neck, (t) => [0.165 - 0.045 * t, 0.18 - 0.05 * t], { color: coat, sides: 10 });

  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: neckPath.at(1), dir: [0, -0.12, 1], role: "head" });
  const P = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: P(0.1, -0.07), aim: P(0.4, -0.115), role: "jaw" });

  const skull = b.part(ell(0.125, 0.115, 0.14, 10, 8), coat, { bone: head, at: P(0.07, 0.03), flat: true });
  // upper muzzle, nose
  b.frustumBox(P(0.14, 0.0), P(0.44, -0.045), [0.16, 0.13], [0.085, 0.075], { bone: head, color: coat });
  b.part(ell(0.045, 0.032, 0.03, 8, 6), NOSE, { bone: head, at: P(0.455, -0.035), flat: true });
  // lower jaw (separate bone)
  b.frustumBox(P(0.1, -0.095), P(0.4, -0.12), [0.13, 0.05], [0.075, 0.042], { bone: jaw, color: coat });
  b.part(new THREE.BoxGeometry(0.1, 0.01, 0.26), MAW, { bone: jaw, at: P(0.27, -0.098) });
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.18), TONGUE, { bone: jaw, at: P(0.3, -0.093) });
  // fangs
  for (const s of [1, -1]) {
    b.spike(P(0.38, -0.072, s * 0.042), [0, -1, 0], 0.055, 0.014, { color: IVORY, bone: head, sides: 5 });
    b.spike(P(0.2, -0.07, s * 0.05), [0, -1, 0], 0.03, 0.01, { color: IVORY, bone: head, sides: 5 });
    b.spike(P(0.37, -0.1, s * 0.026), [0, 1, 0.1], 0.05, 0.012, { color: IVORY, bone: jaw, sides: 5 });
  }
  b.spike(P(0.38, -0.14), [0, -0.6, -0.8], 0.07, 0.022, { color: CREAM, bone: jaw, sides: 5 });

  // eyes (glowing amber), brows
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(skull.at).at(s * 38, 14);
    if (hit) {
      const eye = b.stick(ell(0.027, 0.012, 0.016, 8, 6), AMBER, hit, { embed: 0.35, spin: s * 24, bone: head });
      glow(eye, 1.2);
      b.stick(ell(0.005, 0.01, 0.017, 6, 4), "#120d08", eye.moved([0, 0.007, 0]), { embed: 0, bone: head });
    }
    const brow = skin.around(skull.at).at(s * 36, 38);
    if (brow) b.stick(ell(0.042, 0.015, 0.018, 8, 5), DARK, brow, { embed: 0.4, spin: s * 24, bone: head });
  }

  // ears: big, pointed, upright, with pinkish inner
  const EAR: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.062, 0],
    [0.062, 0],
    [0.05, 0.08],
    [0.0, 0.215, "sharp"],
    [-0.04, 0.09],
  ];
  const EAR_I: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.036, 0.015],
    [0.036, 0.015],
    [0.026, 0.075],
    [0.0, 0.16, "sharp"],
    [-0.024, 0.075],
  ];
  const T = 0.22;
  for (const s of [1, -1]) {
    const base = P(0.02, 0.085, s * 0.075);
    const xd: [number, number, number] = [s, -T, 0];
    const yd: [number, number, number] = [s * T, 1, 0.05];
    b.extrude(EAR, { at: base, x: xd, y: yd, thickness: 0.025, bevel: 0.005, color: coat, bone: head });
    b.extrude(EAR_I, {
      at: [base.x, base.y, base.z + s * 0.007],
      x: xd,
      y: yd,
      thickness: 0.015,
      color: EAR_IN,
      bone: head,
    });
  }

  // cheek ruff
  const rows: Array<[number, number]> = [
    [0.08, 0.0],
    [0.06, -0.05],
    [0.02, -0.09],
    [-0.02, -0.05],
    [-0.04, 0.0],
  ];
  for (const s of [1, -1]) {
    rows.forEach(([fw, up], i) => {
      b.spike(P(fw, up, s * 0.105), [s * 0.45, -0.25, -0.85], 0.12 + R() * 0.05, 0.035, {
        color: i % 2 ? CREAM : FUR_L,
        bone: head,
        sides: 5,
      });
    });
  }

  // ---------- tail ----------
  const tailPath = catmull([
    [0, 0.8, -0.55],
    [0, 0.74, -0.82],
    [0, 0.58, -1.05],
    [0, 0.38, -1.17],
    [0, 0.2, -1.2],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail" });
  const tr = keyed([0.075, 0.1, 0.12, 0.1, 0.05]);
  const tailTube = b.sweep(tail, (t) => tr(t), {
    color: gradient(coat, "#222328", tailPath.at(0.74), tailPath.at(1)),
    caps: { start: "round", end: "point" },
  });

  // ---------- legs ----------
  const paw = (bone: ReturnType<typeof b.joint>, cx: number, pz: number) => {
    b.part(ell(0.075, 0.05, 0.115, 8, 6), coat, { bone, at: [cx, 0.05, pz], flat: true });
    for (const k of [-1.5, -0.5, 0.5, 1.5]) {
      const x = cx + k * 0.036;
      b.part(ell(0.026, 0.03, 0.035, 6, 4), coat, { bone, at: [x, 0.032, pz + 0.095], flat: true });
      b.spike([x, 0.026, pz + 0.125], [0, -0.3, 1], 0.055, 0.011, { color: CLAW, bone, sides: 5 });
    }
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // forelegs
    const fpts: number[][] = [
      [s * 0.17, 0.74, 0.4],
      [s * 0.18, 0.46, 0.34],
      [s * 0.17, 0.17, 0.4],
      [s * 0.17, 0.06, 0.5],
    ];
    const fleg = b.chain(`legF${side}`, catmull(fpts), {
      parent: spineEnd,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
    });
    const fr = keyed([0.105, 0.085, 0.062, 0.055]);
    b.sweep(fleg, (t) => fr(t), { color: coat, sides: 8 });
    b.part(ell(0.095, 0.16, 0.15, 8, 6), coat, { bone: fleg.joints[0], at: [s * 0.165, 0.7, 0.38], flat: true });
    b.spike([s * 0.19, 0.5, 0.28], [0, -0.4, -1], 0.13, 0.035, { color: FUR_L, bone: fleg.joints[1], sides: 5 });
    b.spike([s * 0.19, 0.42, 0.28], [0, -0.5, -1], 0.1, 0.03, { color: CREAM, bone: fleg.joints[1], sides: 5 });
    paw(fleg.tip!, s * 0.17, 0.48);

    // hind legs (digitigrade)
    const hpts: number[][] = [
      [s * 0.14, 0.76, -0.4],
      [s * 0.21, 0.47, -0.22],
      [s * 0.18, 0.27, -0.52],
      [s * 0.18, 0.09, -0.46],
      [s * 0.18, 0.05, -0.36],
    ];
    const hleg = b.chain(`legH${side}`, catmull(hpts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`, `pawH${side}`],
      role: "leg",
    });
    const hr = keyed([0.15, 0.1, 0.065, 0.052, 0.05]);
    b.sweep(hleg, (t) => hr(t), { color: coat, sides: 8 });
    b.part(ell(0.1, 0.17, 0.19, 8, 6), coat, { bone: hleg.joints[0], at: [s * 0.19, 0.64, -0.36], flat: true });
    b.spike([s * 0.18, 0.3, -0.58], [0, -0.5, -1], 0.11, 0.032, { color: FUR_M, bone: hleg.joints[2], sides: 5 });
    b.spike([s * 0.21, 0.62, -0.5], [0, -0.7, -0.7], 0.14, 0.04, { color: FUR_L, bone: hleg.joints[0], sides: 5 });
    b.spike([s * 0.22, 0.54, -0.46], [0, -0.8, -0.6], 0.12, 0.035, { color: CREAM, bone: hleg.joints[0], sides: 5 });
    paw(hleg.tip!, s * 0.18, -0.4);
  }

  // ---------- fur tufts: mane, back, ridge, chest, tail ----------
  const maneColors = [FUR_M, FUR_L, FUR_D, CREAM, FUR_L];
  const neckSurf = b.surface(neckTube);
  for (const h of neckSurf.scatter(36, { rng: rng(5), minDist: 0.06, filter: (hh) => hh.n.y > -0.5 })) {
    const d = flow(neckPath, h, 0.5, -1);
    d.y -= 0.15;
    b.spike(h, d, 0.17 + R() * 0.08, 0.042, { color: pick(maneColors), sides: 5 });
  }

  const bodySurf = b.surface(body);
  for (const h of bodySurf.scatter(45, {
    rng: rng(6),
    minDist: 0.1,
    filter: (hh) => hh.n.y > 0.2 && hh.at.z > -0.3,
  })) {
    b.spike(h, flow(spinePath, h, 0.4, -1), 0.13 + R() * 0.06, 0.036, { color: pick([FUR_M, FUR_L, FUR_D]), sides: 5 });
  }
  b.along(body, 9, (at) => {
    const d = at.n.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0.1, -0.8)).normalize();
    b.spike(at, d, 0.17, 0.042, { color: DARK, sides: 5 });
  });

  for (const h of bodySurf.scatter(26, {
    rng: rng(7),
    minDist: 0.07,
    filter: (hh) => hh.at.z > 0.2 && hh.n.y < 0.4 && hh.n.z > 0.15,
  })) {
    const d = h.n.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, -0.8, -0.3)).normalize();
    b.spike(h, d, 0.15 + R() * 0.07, 0.04, { color: pick([CREAM, CREAM, FUR_L]), sides: 5 });
  }

  const tailSurf = b.surface(tailTube);
  for (const h of tailSurf.scatter(40, { rng: rng(8), minDist: 0.05 })) {
    const tt = tailPath.closestT(h.at);
    b.spike(h, flow(tailPath, h, 0.45, 1), 0.12 + R() * 0.06, 0.035, {
      color: tt > 0.72 ? DARK : pick([FUR_M, FUR_L, FUR_D]),
      sides: 5,
    });
  }

  // open the mouth a little: a rest pose that shows the fangs
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
