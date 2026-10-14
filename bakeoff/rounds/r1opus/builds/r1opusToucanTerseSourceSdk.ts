import * as THREE from "three";
import { createBuilder, frame, paint, mix, smoothstep, noise, scales, grain } from "../../../../src/index";

export const meta = {
  name: "Keel-billed Toucan",
  description:
    "A stylized keel-billed toucan perched on a mossy log: rainbow bill with separate jaw, yellow bib with red trim, layered extruded wing and tail feathers, blue zygodactyl feet, wings spread in a rig-ready rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "toucan", paintSize: 1024 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------- palette ----------------
  const RED = "#e3242b";
  const LEG = "#5b8fd0";
  const CLAW = "#2b2b33";
  const featherBlack = scales(["#16161e", "#1b1c27", "#131319"], "#08080b", { size: 0.016, width: 0.14, seed: 3 });
  const bibYellow = scales(["#ffd21a", "#ffdc3a", "#ffcf10"], "#f0a80c", { size: 0.012, width: 0.1, seed: 5 });

  // ---------------- skeleton ----------------
  b.joint("root", { at: [0, 0, 0] });
  b.joint("hips", { parent: "root", at: [0, 0.2, -0.02], dir: [0, 1, 0.6] });
  const spine = b.chain("spine", [[0, 0.2, -0.02], [0, 0.27, 0.03], [0, 0.335, 0.065]], {
    names: ["spine1", "spine2"],
    role: "spine",
    parent: "hips",
  });
  const neck = b.chain("neck", [[0, 0.335, 0.065], [0, 0.395, 0.092]], {
    names: ["neck"],
    role: "neck",
    parent: "spine2",
  });
  b.joint("head", { parent: "neck", at: [0, 0.405, 0.1], dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.398, 0.13], dir: [0, -0.06, 1], role: "jaw" });

  // ---------------- body ----------------
  const bodyPaint = paint((p, n) => {
    const yb = 0.285 + 0.006 * Math.sin(p.x * 140);
    const front = n.z > 0.18 && Math.abs(n.x) < 0.9;
    if (front && p.y > yb) return bibYellow;
    if (front && p.y > yb - 0.012) return RED;
    if (p.z < -0.035 && n.y < -0.25 && p.y < 0.205) return RED;
    return featherBlack;
  });
  b.loft(
    [
      { at: [0, 0.178, -0.09], w: 0.06, h: 0.05 },
      { at: [0, 0.2, -0.03], w: 0.115, h: 0.12 },
      { at: [0, 0.265, 0.025], w: 0.13, h: 0.135 },
      { at: [0, 0.33, 0.065], w: 0.1, h: 0.1 },
      { at: [0, 0.39, 0.09], w: 0.07, h: 0.07 },
    ],
    { color: bodyPaint, bone: [spine, neck], sides: 12, name: "body" },
  );
  // red undertail puff
  b.part(new THREE.SphereGeometry(1, 8, 6), RED, {
    at: [0, 0.168, -0.065],
    scale: [0.028, 0.018, 0.032],
    bone: "hips",
    flat: true,
    name: "undertail",
  });

  // ---------------- head ----------------
  const hc = V(0, 0.41, 0.1);
  const ra = 0.045, rb = 0.05, rc = 0.055;
  const eyes = [1, -1].map((sx) => {
    const local = V(sx * 0.0405, 0.012, 0.02);
    const at = hc.clone().add(local);
    const nrm = V(local.x / (ra * ra), local.y / (rb * rb), local.z / (rc * rc)).normalize();
    return { at, nrm, sx };
  });
  const headPaint = paint((p, n) => {
    for (const e of eyes) {
      const d = p.distanceTo(e.at);
      if (d < 0.0105) return "#2e6e22";
      if (d < 0.02) return mix("#a6e64e", "#6cc13a", d / 0.02);
    }
    if (p.y < hc.y - 0.003 + (p.z - hc.z) * 0.4 && p.z > hc.z - 0.02) return bibYellow;
    if (p.y > hc.y + 0.015 && n.z < 0.1) return noise(p, 0.01, 4) > 0.5 ? "#36161c" : "#26121a";
    return featherBlack;
  });
  b.part(new THREE.SphereGeometry(1, 12, 9), headPaint, {
    at: hc,
    scale: [ra, rb, rc],
    bone: "head",
    flat: true,
    name: "head",
  });
  for (const e of eyes) {
    const f = frame(e.at, e.nrm);
    b.stick(new THREE.SphereGeometry(0.0085, 10, 8), "#0b0b0e", f, { bone: "head", embed: 0.4, name: `eye${e.sx > 0 ? "L" : "R"}` });
    const ring = new THREE.TorusGeometry(0.0098, 0.0017, 5, 14);
    ring.rotateX(Math.PI / 2);
    b.stick(ring, "#1f4f18", f, { bone: "head", embed: 0.3 });
    b.part(new THREE.SphereGeometry(0.0024, 6, 4), "#ffffff", {
      at: e.at.clone().addScaledVector(e.nrm, 0.0085).add(V(0, 0.003, 0.002)),
      bone: "head",
    });
  }

  // ---------------- bill ----------------
  const u = (z: number) => (z - 0.13) / 0.195;
  const upperPaint = paint((p, n) => {
    const t = u(p.z);
    if (t < 0.035) return "#151515";
    if (t > 0.86 + 0.02 * Math.sin(p.y * 300)) return t > 0.96 ? "#a3141d" : RED;
    if (n.y < -0.6) return "#3c6d1e";
    const side = Math.abs(n.x);
    if (side > 0.4 && t > 0.3 && t < 0.8 && p.y < 0.425 - t * 0.02) {
      const edge = Math.min(t - 0.3, 0.8 - t);
      return mix("#ff9a2a", "#ff6f12", smoothstep(0, 0.12, edge));
    }
    return mix("#78c23e", "#c6ea62", smoothstep(-0.2, 0.9, n.y));
  });
  const lowerPaint = paint((p, n) => {
    const t = u(p.z);
    if (t < 0.035) return "#151515";
    if (t > 0.8) return RED;
    if (t < 0.2) return mix("#78c23e", "#4f9ee0", (t - 0.035) / 0.165);
    return mix("#3d84d0", "#86ccf5", smoothstep(-0.6, 0.6, n.y));
  });
  b.loft(
    [
      { at: [0, 0.425, 0.13], w: 0.05, h: 0.05 },
      { at: [0, 0.42, 0.2], w: 0.042, h: 0.04 },
      { at: [0, 0.408, 0.27], w: 0.03, h: 0.03 },
      { at: [0, 0.39, 0.325], w: 0.008, h: 0.01 },
    ],
    { color: upperPaint, bone: "head", sides: 8, smooth: false, name: "billUpper" },
  );
  b.loft(
    [
      { at: [0, 0.39, 0.13], w: 0.044, h: 0.025 },
      { at: [0, 0.388, 0.2], w: 0.036, h: 0.022 },
      { at: [0, 0.383, 0.26], w: 0.024, h: 0.016 },
      { at: [0, 0.38, 0.3], w: 0.006, h: 0.008 },
    ],
    { color: lowerPaint, bone: "jaw", sides: 8, smooth: false, name: "billLower" },
  );

  // ---------------- wings ----------------
  const featherPaint = (len: number, base: string, tip: string) =>
    paint((_p, _n, s) => {
      const along = s[0] / len;
      if (Math.abs(s[1]) < 0.0013 && along > 0 && along < 0.85) return "#3a3c4c";
      return mix(base, tip, smoothstep(0.45, 1, along));
    });
  const featherOutline = (len: number, w: number) => [
    [-0.012, -w / 2],
    [len - w * 0.6, -w / 2],
    [len, -w * 0.1],
    [len - w * 0.15, w * 0.35],
    [len - w * 0.7, w / 2],
    [-0.012, w / 2],
  ];

  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      [
        [sx * 0.045, 0.315, 0.03],
        [sx * 0.14, 0.322, 0.015],
        [sx * 0.235, 0.318, 0.0],
        [sx * 0.31, 0.312, -0.012],
      ],
      { names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `wingtip${S}`], role: "wing", parent: "spine2", up: [0, 1, 0] },
    );
    b.sweep(wing, [0.026, 0.02, 0.012], { color: featherBlack, name: `wingArm${S}` });

    // flight feathers
    const N = 12;
    for (let i = 0; i < N; i++) {
      const t = 0.06 + (0.93 * i) / (N - 1);
      const f = smoothstep(0.5, 1, t);
      const dir = V(sx * (0.05 + 0.9 * f), -0.04, -(1 - 0.65 * f)).normalize();
      const len = 0.085 + 0.055 * f + 0.008 * Math.sin(i * 1.7);
      const w = 0.03;
      const cp = wing.at(Math.min(t, 0.999)).at;
      const base = cp.add(V(0, -0.004 + (i % 2) * 0.003, 0));
      const across = V(0, 1, 0).cross(dir).normalize();
      b.extrude(featherOutline(len, w), {
        at: base,
        x: dir,
        y: across,
        thickness: 0.004,
        smoothing: 1,
        color: featherPaint(len, i % 2 ? "#15151d" : "#1a1b26", "#24304e"),
        bone: wing.jointAt(t),
        name: `remex${S}${i + 1}`,
      });
    }
    // coverts
    const M = 9;
    for (let i = 0; i < M; i++) {
      const t = 0.05 + (0.8 * i) / (M - 1);
      const f = smoothstep(0.5, 1, t);
      const dir = V(sx * (0.05 + 0.8 * f), -0.05, -(1 - 0.6 * f)).normalize();
      const len = 0.045 + 0.018 * f;
      const w = 0.03;
      const base = wing.at(t).at.add(V(0, 0.009 + (i % 2) * 0.002, 0));
      const across = V(0, 1, 0).cross(dir).normalize();
      b.extrude(featherOutline(len, w), {
        at: base,
        x: dir,
        y: across,
        thickness: 0.004,
        smoothing: 1,
        color: featherPaint(len, "#1f2232", "#33406a"),
        bone: wing.jointAt(t),
        name: `covert${S}${i + 1}`,
      });
    }
  }

  // ---------------- tail ----------------
  const tail = b.chain("tail", [[0, 0.185, -0.07], [0, 0.15, -0.14], [0, 0.115, -0.21], [0, 0.09, -0.275]], {
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
    parent: "hips",
  });
  [-2, -1, 0, 1, 2].forEach((k) => {
    b.sweep(tail, (t) => [0.0085 + 0.003 * t, 0.0032], {
      section: "box",
      color: Math.abs(k) % 2 ? "#1b1c26" : "#15151d",
      shift: [k * 0.0135, Math.abs(k) * 0.0025],
      to: 1 - Math.abs(k) * 0.05,
      caps: "round",
      name: `tailFeather${k + 3}`,
    });
  });

  // ---------------- legs & feet ----------------
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      [
        [sx * 0.035, 0.175, 0.0],
        [sx * 0.042, 0.12, 0.02],
        [sx * 0.042, 0.078, 0.02],
      ],
      { names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", parent: "hips", contact: [sx * 0.042, 0.07, 0.02] },
    );
    b.sweep(leg, [0.014, 0.0075], {
      bands: [
        [0.42, "#16161e"],
        [1, LEG],
      ],
      name: `leg${S}`,
    });
    const ankle = leg.tip!;
    const toes: number[][][] = [
      [[sx * 0.05, 0.073, 0.035], [sx * 0.056, 0.064, 0.047], [sx * 0.058, 0.05, 0.054]],
      [[sx * 0.036, 0.073, 0.035], [sx * 0.033, 0.064, 0.047], [sx * 0.031, 0.05, 0.054]],
      [[sx * 0.048, 0.073, 0.005], [sx * 0.052, 0.064, -0.007], [sx * 0.054, 0.05, -0.014]],
      [[sx * 0.036, 0.073, 0.005], [sx * 0.034, 0.064, -0.007], [sx * 0.032, 0.05, -0.014]],
    ];
    toes.forEach((pts, i) => {
      const { chain } = b.sprout(`toe${S}${i + 1}`, ankle, pts, [0.0055, 0.0035], {
        count: 1,
        role: "digit",
        color: LEG,
      });
      const tip = V(pts[2][0], pts[2][1], pts[2][2]);
      const prev = V(pts[1][0], pts[1][1], pts[1][2]);
      b.spike(tip, tip.clone().sub(prev), 0.009, 0.0032, { color: CLAW, bone: chain!.joints[0] });
    });
  }

  // ---------------- perch ----------------
  const bark = grain("#5a3a22", "#3b2515", { size: 0.008, axis: "x", seed: 2 });
  const barkPaint = paint((p, n) => {
    if (Math.abs(n.x) > 0.8) {
      const r = Math.hypot(p.y - 0.035, p.z - 0.02);
      if (r > 0.031) return "#4a2f1b";
      return (r / 0.006) % 1 < 0.25 ? "#b8875a" : "#d9ad7c";
    }
    if (n.y > 0.35 && noise(p, 0.03, 9) > 0.48) return noise(p, 0.008, 11) > 0.5 ? "#5f9e3a" : "#79b84a";
    return bark;
  });
  b.rod([-0.26, 0.035, 0.02], [0.26, 0.035, 0.02], 0.035, { color: barkPaint, bone: "root", sides: 10, name: "log" });
  b.rod([-0.15, 0.06, 0.03], [-0.17, 0.1, 0.05], [0.008, 0.005], { color: bark, bone: "root", name: "stub" });
  b.rod([0.17, 0.062, 0.02], [0.2, 0.15, 0.04], [0.007, 0.004], { color: bark, bone: "root", name: "twig" });

  const leafPaint = (L: number) =>
    paint((_p, _n, s) => (Math.abs(s[1]) < 0.0022 ? "#b4de78" : mix("#2f8a3a", "#62bd4c", s[0] / L)));
  const leaf = (at: THREE.Vector3, dir: THREE.Vector3, L: number, name: string) => {
    b.extrude(
      [
        [0, 0, "sharp"],
        [L * 0.3, L * 0.17],
        [L * 0.7, L * 0.15],
        [L, 0, "sharp"],
        [L * 0.7, -L * 0.15],
        [L * 0.3, -L * 0.17],
      ],
      { at, x: dir.normalize(), y: [0, 1, 0.15], thickness: 0.003, smoothing: 1, color: leafPaint(L), bone: "root", name },
    );
  };
  leaf(V(0.2, 0.15, 0.04), V(0.6, 0.45, 0.4), 0.09, "leaf1");
  leaf(V(0.2, 0.15, 0.04), V(-0.25, 0.55, 0.7), 0.075, "leaf2");
  leaf(V(-0.17, 0.1, 0.05), V(-0.7, 0.4, 0.4), 0.085, "leaf3");
  leaf(V(-0.17, 0.1, 0.05), V(-0.3, 0.5, -0.6), 0.07, "leaf4");

  const berryAt: Array<[number, number, number, string]> = [
    [0.205, 0.158, 0.05, "#ff5a1f"],
    [0.19, 0.152, 0.055, "#e8331e"],
    [0.215, 0.146, 0.035, "#ff7a2a"],
    [0.198, 0.168, 0.036, "#e8331e"],
    [0.212, 0.165, 0.058, "#ff5a1f"],
  ];
  berryAt.forEach(([x, y, z, c], i) => {
    b.part(new THREE.SphereGeometry(0.011, 8, 6), c, { at: [x, y, z], bone: "root", flat: true, name: `berry${i + 1}` });
    b.part(new THREE.SphereGeometry(0.003, 5, 4), "#3a1a10", { at: [x, y + 0.011, z], bone: "root" });
  });

  return b.root;
}
