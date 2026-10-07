import * as THREE from "three";
import { createBuilder, paint, spots, mix, smoothstep, flatten, catmull, rng, aim } from "../../../../src/index";

export const meta = {
  name: "Startled Pufferfish",
  description:
    "A fully puffed pufferfish ball: creamy yellow skin with brown leopard rosettes fading to a white belly, swept-back spines all over, a tiny pouting O mouth with a hinged lower lip, big worried eyes, fluttering pectoral fins, a stubby fan tail and bubbles rising from its mouth.",
};

export default function build() {
  const b = createBuilder({ name: "pufferfish", paintSize: 1024 });
  const D = Math.PI / 180;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Palette
  const CREAM = "#f2d47a";
  const BELLY = "#fbf8ef";
  const SPOT = "#7a4720";
  const SPOT2 = "#9c6330";
  const BLUSH = "#f39a86";
  const SCLERA = "#fffdf4";
  const IRIS_RING = "#2c3614";
  const IRIS = "#d9a21c";
  const PUPIL = "#15110e";
  const SHINE = "#ffffff";
  const BROW = "#5a3418";
  const LIP = "#ee9f7c";
  const MOUTH = "#5b1e26";
  const BUBBLE = "#bfe9f7";
  const GILL = "#a0743a";
  const NOSE = "#e6c56e";
  const SPIKE = "#f3e2a8";
  const SPIKE_TIP = "#7d5128";
  const SPIKE_BELLY = "#f8f4ea";
  const SPIKE_BELLY_TIP = "#c9bca2";
  const FIN = "#f4e2a0";
  const FIN_TIP = "#fdf6dc";
  const RAY = "#c8984e";

  const R = 0.15;
  const CY = R + 0.016;
  const C = V(0, CY, 0);

  const body = b.joint("body", { at: C, dir: [0, 0, 1], role: "spine" });

  // ---------- Skin paint: belly white -> cream -> leopard rosettes on top, rosy cheeks ----------
  const spotted = spots(CREAM, [SPOT, SPOT2], { size: 0.048, amount: 0.55, rosette: true, seed: 4 });
  const cheeks = [V(0.085, CY - 0.045, 0.11), V(-0.085, CY - 0.045, 0.11)];
  const skin = paint((p, n) => {
    const h = (p.y - CY) / R;
    let c = mix(BELLY, CREAM, smoothstep(-0.6, -0.1, h));
    const k = smoothstep(-0.1, 0.35, h);
    if (k > 0) c = mix(c, spotted.at(p, n), k);
    const d = Math.min(...cheeks.map((q) => q.distanceTo(p)));
    const blush = smoothstep(0.034, 0.012, d);
    if (blush > 0) c = mix(c, BLUSH, blush * 0.6);
    return c;
  });

  const finPaint = (len: number, edge?: string) =>
    paint((_p, _n, s) => {
      const x = s[0];
      const y = s[1];
      const r = Math.hypot(x, y);
      const a = Math.atan2(y, x + 0.012);
      let c = mix(FIN, FIN_TIP, smoothstep(0.3 * len, len, r));
      const ray = smoothstep(0.8, 0.97, Math.abs(Math.sin(a * 11))) * smoothstep(0.1 * len, 0.35 * len, r);
      c = mix(c, RAY, ray * 0.75);
      if (edge) c = mix(c, edge, smoothstep(0.8 * len, 0.95 * len, r) * 0.8);
      return c;
    });

  // ---------- Body ball ----------
  const bodyPart = b.part(new THREE.SphereGeometry(R, 22, 16), skin, { at: C, bone: body });
  const surf = b.surface(bodyPart);
  const onBody = (az: number, el: number) => {
    const d = V(Math.cos(el * D) * Math.sin(az * D), Math.sin(el * D), Math.cos(el * D) * Math.cos(az * D));
    return surf.ray(C.clone().addScaledVector(d, 1), d.clone().negate()) ?? surf.nearest(C.clone().addScaledVector(d, R));
  };
  const zones: Array<[THREE.Vector3, number]> = [];

  // ---------- Eyes + worried brows ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = onBody(38 * s, 20);
    const n = hit.n;
    zones.push([hit.at, 0.066]);
    const c = hit.at.clone().addScaledVector(n, -0.012);
    const front = flatten(V(0, 0, 1), n).normalize();
    const up = flatten(V(0, 1, 0), n).normalize();
    const gaze = n
      .clone()
      .multiplyScalar(Math.cos(16 * D))
      .addScaledVector(front, Math.sin(16 * D))
      .addScaledVector(up, 0.06)
      .normalize();
    const eye = b.joint("eye" + side, { at: c, dir: gaze, parent: body });
    b.part(new THREE.SphereGeometry(0.034, 16, 12), SCLERA, { at: c, dir: gaze, bone: eye, name: "sclera" + side });
    const disc = (r: number, dist: number, col: string, segs: number) =>
      b.part(new THREE.SphereGeometry(r, segs, 8), col, {
        at: c.clone().addScaledVector(gaze, dist),
        dir: gaze,
        scale: [1, 0.3, 1],
        bone: eye,
      });
    disc(0.023, 0.03, IRIS_RING, 16);
    disc(0.019, 0.034, IRIS, 16);
    disc(0.011, 0.0385, PUPIL, 12);
    const hl = gaze.clone().addScaledVector(up, 0.42).addScaledVector(front, 0.2).normalize();
    b.part(new THREE.SphereGeometry(0.005, 8, 6), SHINE, { at: c.clone().addScaledVector(hl, 0.042), bone: eye });
    const hl2 = gaze.clone().addScaledVector(up, -0.3).addScaledVector(front, -0.22).normalize();
    b.part(new THREE.SphereGeometry(0.0024, 6, 4), SHINE, { at: c.clone().addScaledVector(hl2, 0.04), bone: eye });

    // Brow: inner end raised for a worried look.
    const inner = flatten(V(-s, 0, 0), n).normalize();
    const bp = (u: number, i: number) => {
      const h = surf.nearest(c.clone().addScaledVector(n, 0.012).addScaledVector(up, u).addScaledVector(inner, i));
      return h.at.clone().addScaledVector(h.n, 0.003);
    };
    b.sweep(catmull([bp(0.035, -0.027), bp(0.048, -0.005), bp(0.053, 0.016)]), (t: number) => 0.0032 + 0.0028 * Math.sin(Math.PI * t), {
      color: BROW,
      sides: 6,
      bone: body,
      name: "brow" + side,
    });

    // Little nostril tubes.
    const nh = onBody(17 * s, 9);
    zones.push([nh.at, 0.02]);
    const nn = nh.n;
    b.rod(nh.at.clone().addScaledVector(nn, -0.002), nh.at.clone().addScaledVector(nn, 0.008), [0.004, 0.0032], {
      color: NOSE,
      sides: 6,
      bone: body,
    });
    b.part(new THREE.SphereGeometry(0.0022, 6, 4), MOUTH, { at: nh.at.clone().addScaledVector(nn, 0.008), bone: body });
  }

  // ---------- Tiny pouting mouth: upper lip on the body, lower lip on the jaw ----------
  const mh = onBody(0, -13);
  const mn = mh.n;
  zones.push([mh.at, 0.045]);
  const M = mh.at.clone().addScaledVector(mn, 0.004);
  const jaw = b.joint("jaw", { at: mh.at.clone().addScaledVector(mn, -0.012), dir: mn, parent: body, role: "jaw" });
  const lip = new THREE.TorusGeometry(0.014, 0.0072, 6, 10, Math.PI);
  b.part(lip, LIP, { at: M, quat: aim(mn, V(0, 1, 0), "z"), bone: body, name: "lipUpper" });
  b.part(lip, LIP, { at: M, quat: aim(mn, V(0, -1, 0), "z"), bone: jaw, name: "lipLower" });
  b.part(new THREE.SphereGeometry(0.011, 10, 8), MOUTH, {
    at: M.clone().addScaledVector(mn, -0.002),
    dir: mn,
    scale: [1, 0.5, 1],
    bone: body,
    name: "mouthInside",
  });

  // ---------- Bubbles rising from the mouth ----------
  const bubbleMat = b.material(BUBBLE);
  bubbleMat.transparent = true;
  bubbleMat.opacity = 0.5;
  bubbleMat.roughness = 0.15;
  bubbleMat.depthWrite = false;
  const bubbles: Array<[number, number, number, number]> = [
    [0.006, 0.012, 0.032, 0.0065],
    [-0.01, 0.05, 0.046, 0.009],
    [0.012, 0.096, 0.055, 0.011],
    [-0.006, 0.152, 0.06, 0.0135],
    [0.01, 0.215, 0.062, 0.01],
  ];
  for (const [x, y, z, r] of bubbles) {
    const at = M.clone().add(V(x, y, z));
    b.part(new THREE.IcosahedronGeometry(r, 1), BUBBLE, { at, bone: body, flat: true, name: "bubble" });
    b.part(new THREE.SphereGeometry(r * 0.28, 6, 4), SHINE, { at: at.clone().add(V(r * 0.35, r * 0.45, r * 0.6)), bone: body });
  }

  // ---------- Pectoral fins + gill slits ----------
  const PEC = [
    [-0.006, -0.008],
    [0.018, -0.018],
    [0.038, -0.027],
    [0.048, -0.017],
    [0.046, -0.006],
    [0.051, 0.004],
    [0.047, 0.015],
    [0.039, 0.026],
    [0.018, 0.018],
    [-0.006, 0.008],
  ];
  const pecPaint = finPaint(0.05);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = onBody(92 * s, -4);
    const n = hit.n;
    zones.push([hit.at, 0.042]);
    const out = V(s, 0.08, -0.5).normalize();
    const root = hit.at.clone().addScaledVector(n, -0.004);
    b.chain("fin" + side, [root, root.clone().addScaledVector(out, 0.05)], {
      names: ["fin" + side, "fin" + side + "Tip"],
      role: "fan",
      parent: body,
    });
    b.extrude(PEC, {
      at: root,
      x: out,
      y: [0, 1, 0],
      thickness: 0.0035,
      bevel: 0.001,
      color: pecPaint,
      smoothing: 1,
      bone: "fin" + side,
      name: "pectoral" + side,
    });
    const gp = (u: number, f: number) => {
      const h = surf.nearest(hit.at.clone().add(V(0, u, f)));
      return h.at.clone().addScaledVector(h.n, 0.0015);
    };
    b.sweep(catmull([gp(0.018, 0.012), gp(0, 0.019), gp(-0.018, 0.012)]), 0.0026, {
      color: GILL,
      sides: 5,
      bone: body,
      name: "gill" + side,
    });
  }

  // ---------- Stubby tail ----------
  const tail = b.chain("tail", [V(0, CY, -0.11), V(0, CY + 0.004, -0.152), V(0, CY + 0.01, -0.182)], {
    names: ["tail1", "tail2", "tailTip"],
    role: "tail",
    parent: body,
  });
  b.sweep(tail, (t: number) => 0.042 - 0.02 * t, { color: skin, sides: 10, name: "peduncle" });
  const CAUDAL = [
    [-0.012, -0.014],
    [0.018, -0.028],
    [0.048, -0.054],
    [0.064, -0.044],
    [0.062, -0.024],
    [0.07, -0.012],
    [0.068, 0.012],
    [0.062, 0.024],
    [0.064, 0.044],
    [0.048, 0.054],
    [0.018, 0.028],
    [-0.012, 0.014],
  ];
  b.extrude(CAUDAL, {
    at: V(0, CY + 0.01, -0.172),
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.004,
    bevel: 0.0012,
    color: finPaint(0.07, "#b07a3c"),
    smoothing: 1,
    bone: "tail2",
    name: "caudalFin",
  });

  // ---------- Small dorsal and anal fins ----------
  const SMALL = [
    [-0.006, -0.008],
    [0.02, -0.014],
    [0.032, -0.006],
    [0.033, 0.006],
    [0.024, 0.016],
    [0.006, 0.014],
    [-0.006, 0.008],
  ];
  const smallPaint = finPaint(0.033);
  const smallFin = (az: number, el: number, xdir: [number, number, number], name: string) => {
    const h = onBody(az, el);
    zones.push([h.at, 0.035]);
    b.extrude(SMALL, {
      at: h.at.clone().addScaledVector(h.n, -0.004),
      x: xdir,
      y: [0, 1, 0],
      thickness: 0.003,
      color: smallPaint,
      smoothing: 1,
      bone: body,
      name,
    });
  };
  smallFin(180, 46, [0, 0.8, -1], "dorsalFin");
  smallFin(180, -40, [0, -0.6, -1], "analFin");

  // ---------- Spines all over (Fibonacci-even), swept back ----------
  const rand = rng(11);
  const blocked = (p: THREE.Vector3) => {
    if (p.z < -0.1 && Math.hypot(p.x, p.y - CY) < 0.065) return true;
    return zones.some(([q, r]) => q.distanceTo(p) < r);
  };
  const N = 190;
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N;
    const rr = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    const d = V(rr * Math.cos(th), y, rr * Math.sin(th));
    const len0 = 0.019 + 0.006 * rand();
    if (blocked(C.clone().addScaledVector(d, R))) continue;
    const hit = surf.ray(C.clone().addScaledVector(d, 1), d.clone().negate());
    if (!hit) continue;
    const n = hit.n;
    const dir = n.clone().add(V(0, 0, -0.35)).normalize();
    const len = i === N - 1 ? 0.023 : len0;
    const top = (hit.at.y - CY) / R > -0.15;
    b.spike(hit.at.clone().addScaledVector(n, -0.003), dir, len, 0.0052, {
      bands: [
        [0.55, top ? SPIKE : SPIKE_BELLY],
        [1, top ? SPIKE_TIP : SPIKE_BELLY_TIP],
      ],
      sides: 5,
      bone: body,
      group: "spines",
    });
  }

  return b.root;
}
