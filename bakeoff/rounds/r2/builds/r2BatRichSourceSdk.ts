import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mottle,
  countershade,
  smoothstep,
  mix,
  polyline,
  catmull,
  frame,
} from "../../../../src/index";

export const meta = {
  name: "Fruit Bat",
  description:
    "Golden-brown fluffy fruit bat in flight with wings spread wide, fox face, big dark eyes, charcoal membrane wings on finger bones with hooked thumb claws, clutching a half-eaten fig in its feet.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "fruitBat", paintSize: 1024 });
  const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const CLAW = "#efe6d0";
  const DARK = "#2b262b";

  // ---------------- skeleton core ----------------
  b.joint("root", { at: [0, 0.3, 0] });
  const spine = b.chain("spine", polyline([V(0, 0.29, -0.1), V(0, 0.3, 0), V(0, 0.31, 0.1)]), {
    parent: "root",
    role: "spine",
    names: ["spine1", "spine2"],
  });
  b.joint("neck", { parent: "spine2", at: [0, 0.318, 0.1], dir: [0, 0.3, 1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.33, 0.14], dir: [0, 0.1, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.318, 0.205], dir: [0, 0, 1], role: "jaw" });

  // ---------------- body ----------------
  const furGold = countershade(
    mottle("#8a5628", "#a86c34", { size: 0.03, seed: 2 }),
    mottle("#d9a55a", "#ebbf78", { size: 0.03, seed: 5 }),
    { level: -0.15, soft: 0.5 },
  );
  const body = b.loft(
    [
      { at: V(0, 0.285, -0.115), w: 0.06, h: 0.06 },
      { at: V(0, 0.295, -0.06), w: 0.13, h: 0.12 },
      { at: V(0, 0.3, 0), w: 0.16, h: 0.14 },
      { at: V(0, 0.305, 0.06), w: 0.15, h: 0.13 },
      { at: V(0, 0.312, 0.11), w: 0.09, h: 0.09 },
    ],
    { color: furGold, bone: spine, name: "body" },
  );
  b.capsule([0, 0.315, 0.09], [0, 0.338, 0.15], 0.045, { color: furGold, bone: "neck", name: "neckFur" });

  // fluffy tufts, leaning back
  const lean = (h: any, back: number) =>
    frame(h, h.n.clone().add(new THREE.Vector3(0, -0.15, -back)).normalize());
  const tuftGeo = new THREE.ConeGeometry(0.012, 0.042, 5);
  b.surface(body)
    .scatter(70, { rng: rng(3), minDist: 0.02, filter: (h) => h.n.y > -0.6 })
    .forEach((h, i) => b.stick(tuftGeo, i % 2 ? "#c98f4a" : "#b57a3a", lean(h, 0.8), { embed: 0.3 }));
  const ruffGeo = new THREE.ConeGeometry(0.014, 0.05, 5);
  b.surface(body)
    .scatter(36, { rng: rng(11), minDist: 0.02, filter: (h) => h.at.z > 0.03 && h.n.y > -0.3 })
    .forEach((h, i) => b.stick(ruffGeo, i % 2 ? "#f0c47a" : "#e6b565", lean(h, 0.6), { embed: 0.3 }));

  // ---------------- head ----------------
  const headPaint = mottle("#8f5a2c", "#a86f38", { size: 0.03, seed: 8 });
  const head = b.part(new THREE.SphereGeometry(1, 10, 8), headPaint, {
    at: [0, 0.345, 0.185],
    scale: [0.057, 0.054, 0.063],
    bone: "head",
    name: "skull",
  });
  b.sweep([V(0, 0.34, 0.215), V(0, 0.322, 0.282)], (t) => [0.036 - 0.014 * t, 0.03 - 0.011 * t], {
    color: "#c89a60",
    bone: "head",
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#0f0c0e", {
    at: [0, 0.323, 0.288],
    scale: [0.016, 0.012, 0.012],
    bone: "head",
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#d5dde8", {
    at: [0.003, 0.3305, 0.2905],
    scale: [0.005, 0.0025, 0.004],
    bone: "head",
    name: "noseShine",
  });
  b.capsule([0, 0.312, 0.215], [0, 0.306, 0.262], [0.024, 0.012], { color: "#b88650", bone: "jaw", name: "lowerJaw" });
  const toothGeo = new THREE.ConeGeometry(0.0028, 0.012, 4);
  for (const s of [1, -1]) {
    b.part(toothGeo, "#f7f3e6", { at: [s * 0.009, 0.31, 0.272], rotation: [180, 0, 0], bone: "head", name: "fangUp" });
    b.part(toothGeo, "#f7f3e6", { at: [s * 0.008, 0.318, 0.266], bone: "jaw", name: "fangLow" });
  }
  b.surface(head)
    .scatter(16, { rng: rng(21), minDist: 0.02, filter: (h) => h.at.z < 0.2 })
    .forEach((h, i) => b.stick(tuftGeo, i % 2 ? "#c98f4a" : "#e0aa5e", lean(h, 0.6), { embed: 0.3, scale: 0.7 }));

  for (const [s, L] of [[1, "L"], [-1, "R"]] as const) {
    // eyes
    const e = new THREE.Vector3(s * 0.037, 0.362, 0.215);
    const d = new THREE.Vector3(s * 0.35, 0.45, 0.8).normalize();
    b.part(new THREE.SphereGeometry(1, 8, 6), "#4a2d18", {
      at: e.clone().addScaledVector(d, -0.004),
      scale: 0.0245,
      bone: "head",
      name: "eyeMask" + L,
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), "#0e0a0d", {
      at: e.clone().addScaledVector(d, 0.001),
      scale: 0.019,
      bone: "head",
      name: "eye" + L,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#ffffff", {
      at: e.clone().addScaledVector(new THREE.Vector3(s * 0.25, 0.55, 0.8).normalize(), 0.0185),
      scale: 0.0045,
      bone: "head",
      name: "eyeGlint" + L,
    });
    // ears
    const base = new THREE.Vector3(s * 0.033, 0.385, 0.165);
    const dir = new THREE.Vector3(s * 0.3, 1, -0.15).normalize();
    b.joint("ear" + L, { parent: "head", at: base, dir });
    const mid = base.clone().addScaledVector(dir, 0.0375);
    b.part(new THREE.ConeGeometry(0.024, 0.075, 4), "#9a6330", { at: mid, dir, bone: "ear" + L, name: "ear" + L });
    b.part(new THREE.ConeGeometry(0.015, 0.06, 4), "#d49a94", {
      at: mid.clone().add(new THREE.Vector3(0, 0, 0.008)),
      dir,
      bone: "ear" + L,
      name: "earInner" + L,
    });
  }

  // ---------------- wings ----------------
  const membraneColor = mottle("#2a2830", "#4a4350", { size: 0.06, contrast: 1.2, seed: 4 });
  for (const [s, L] of [[1, "L"], [-1, "R"]] as const) {
    const P = (x: number, y: number, z: number) => V(s * x, y, z);
    const arm = b.chain("arm" + L, polyline([P(0.05, 0.31, 0.04), P(0.18, 0.33, 0), P(0.34, 0.34, 0.05)]), {
      parent: "spine2",
      role: "arm",
      names: ["shoulder" + L, "elbow" + L, "wrist" + L],
    });
    b.sweep(arm, [0.021, 0.015, 0.01], {
      bands: [
        [0.5, "#8a5a2a"],
        [1, "#3a3238"],
      ],
      name: "arm" + L,
    });

    const wrist = P(0.34, 0.34, 0.05);
    const mk = (n: string, a: number[][]) => {
      const c = b.chain(n + L, polyline([wrist, ...a.map((q) => P(q[0], q[1], q[2]))]), {
        parent: "wrist" + L,
        role: "digit",
      });
      b.sweep(c, [0.007, 0.0045, 0.0025], { color: DARK, name: n + L });
      return c;
    };
    const f2 = mk("finger2", [[0.45, 0.345, 0.15], [0.55, 0.35, 0.3]]);
    const f3 = mk("finger3", [[0.53, 0.34, 0.09], [0.72, 0.335, 0.13]]);
    const f4 = mk("finger4", [[0.5, 0.32, -0.02], [0.64, 0.3, -0.12]]);
    const f5 = mk("finger5", [[0.43, 0.3, -0.1], [0.5, 0.27, -0.26]]);

    // thumb with hooked claw
    const thumbTip = P(0.37, 0.37, 0.125);
    const thumb = b.chain("thumb" + L, polyline([wrist, P(0.355, 0.355, 0.09), thumbTip]), {
      parent: "wrist" + L,
      role: "digit",
    });
    b.sweep(thumb, [0.01, 0.007, 0.005], { color: "#4a3a34", name: "thumb" + L });
    const a = new THREE.Vector3(...thumbTip);
    const o = (x: number, y: number, z: number) => a.clone().add(new THREE.Vector3(s * x, y, z));
    b.sweep(catmull([a, o(0.003, 0.008, 0.012), o(0.004, 0.006, 0.026), o(0.004, -0.004, 0.034)]), [0.0055, 0.004, 0.002, 0.0003], {
      color: CLAW,
      bone: "thumb" + L + "2",
      name: "thumbClaw" + L,
    });

    // membranes
    const mem = (A: any, B: any, extra: object = {}) =>
      b.membrane(A, B, { color: membraneColor, thickness: 0.003, rows: 5, ...extra });
    mem(f2, f3, { scallop: 0.12 });
    mem(f3, f4, { scallop: 0.12 });
    mem(f4, f5, { scallop: 0.12 });
    mem(arm, [P(0.06, 0.265, -0.09), P(0.5, 0.27, -0.26)], { bone: "spine1", scallop: 0.04 });
    mem(arm, [P(0.04, 0.325, 0.1), P(0.18, 0.338, 0.115), thumbTip], { bone: "spine2" });
  }

  // ---------------- fig ----------------
  const cy = 0.0615;
  const cz = -0.04;
  b.joint("fig", { parent: "root", at: [0, cy, cz] });
  const fp: Array<[number, number]> = [
    [0, -0.075], [0.008, -0.07], [0.013, -0.055], [0.035, -0.035],
    [0.055, -0.01], [0.062, 0.015], [0.06, 0.04], [0.052, 0.056],
  ];
  const skin = b.lathe([...fp, [0.044, 0.05], [0.03, 0.04], [0, 0.034]], {
    color: mottle("#3f2150", "#7d4b78", { size: 0.03, seed: 9 }),
    at: [0, cy, cz],
    axis: [0, 0, 1],
    segments: 14,
    bone: "fig",
    name: "figSkin",
  });
  void skin;
  const fleshPaint = paint((p) => {
    const r = Math.hypot(p.x, p.y - cy);
    const t1 = smoothstep(0.022, 0.03, r);
    const t2 = smoothstep(0.043, 0.049, r);
    return mix(mix("#a8244a", "#e8607f", t1), "#f1e3bf", t2);
  });
  const flesh = b.lathe(
    [[0, 0.0365], [0.03, 0.042], [0.044, 0.052], [0.0515, 0.0575], [0.052, 0.056], [0.044, 0.05], [0.03, 0.04], [0, 0.034]],
    { color: fleshPaint, at: [0, cy, cz], axis: [0, 0, 1], segments: 14, bone: "fig", name: "figFlesh" },
  );
  const seedGeo = new THREE.IcosahedronGeometry(0.0028, 0);
  b.surface(flesh)
    .scatter(22, { rng: rng(5), minDist: 0.008, filter: (h) => h.n.z > 0.5 })
    .forEach((h) => b.stick(seedGeo, "#f4dc9a", h, { embed: 0.5, bone: "fig" }));
  b.sweep([V(0, cy, cz - 0.07), V(0, cy + 0.006, cz - 0.108)], [0.007, 0.004], {
    color: "#6b5a2c",
    bone: "fig",
    name: "figStem",
  });

  // ---------------- legs and toes holding the fig ----------------
  const rad = (y: number) => {
    for (let i = 0; i < fp.length - 1; i++) {
      if (y >= fp[i][1] && y <= fp[i + 1][1]) {
        const f = (y - fp[i][1]) / (fp[i + 1][1] - fp[i][1]);
        return fp[i][0] + (fp[i + 1][0] - fp[i][0]) * f;
      }
    }
    return 0.05;
  };
  for (const [s, L] of [[1, "L"], [-1, "R"]] as const) {
    const leg = b.chain("leg" + L, polyline([V(s * 0.05, 0.255, -0.085), V(s * 0.08, 0.2, -0.115), V(s * 0.04, 0.16, -0.02)]), {
      parent: "spine1",
      role: "leg",
      names: ["hip" + L, "knee" + L, "ankle" + L],
    });
    b.sweep(leg, [0.017, 0.011, 0.008], { color: "#9a6330", name: "leg" + L });
    const ankle = V(s * 0.04, 0.16, -0.02);
    [0, 0.012, 0.024, 0.036].forEach((a, k) => {
      const pt = (deg: number) => {
        const th = (deg * Math.PI) / 180;
        const r = rad(a) + 0.004;
        return V(s * r * Math.sin(th), cy + r * Math.cos(th), cz + a);
      };
      const pts = [ankle, pt(12), pt(40), pt(68)];
      const nm = `toe${k}${L}`;
      const toe = b.chain(nm, polyline(pts), { parent: "ankle" + L, role: "digit" });
      b.sweep(toe, [0.007, 0.0055, 0.004, 0.0025], { color: "#3a2c2a", name: nm });
      const tip = new THREE.Vector3(...pts[3]);
      const dirT = tip.clone().sub(new THREE.Vector3(...pts[2])).normalize();
      b.spike(tip, dirT, 0.016, 0.003, { color: CLAW, bone: nm + "3", name: "claw" + nm });
    });
  }

  return b.root;
}
