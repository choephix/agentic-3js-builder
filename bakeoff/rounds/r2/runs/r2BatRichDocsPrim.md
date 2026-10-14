```ts
import * as THREE from "three";
import { createBuilder, frame, rng, limb, bezier, mottle, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Fruit Bat with Fig",
  description:
    "A golden-brown flying fox in flight with wings spread wide, fox-like face, big dark eyes, hooked thumb claws, clutching a half-eaten fig in its feet.",
};

export default function build() {
  const b = createBuilder({ name: "fruitBat" });

  const FUR_BACK = "#8d5a2a";
  const FUR_LIGHT = "#a8723a";
  const FUR_BELLY = "#d3a45a";
  const GOLD = "#e0b060";
  const FUR_MID = "#c08a45";
  const FACE = "#a06c38";
  const MUZZLE = "#b27a40";
  const DARKFUR = "#5a3b22";
  const BONE = "#2c2b31";
  const IVORY = "#e8dcc0";
  const BLACK = "#120d0c";
  const EAR_IN = "#c58a78";

  const wingPaint = mottle("#3a3a42", "#4d4a56", { size: 0.1 });
  const coat = countershade(mottle(FUR_BACK, FUR_LIGHT, { size: 0.05 }), FUR_BELLY, { level: -0.1, soft: 0.3 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.3, -0.17] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.3, -0.17],
      [0, 0.315, -0.03],
      [0, 0.34, 0.08],
    ],
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const head = b.joint("head", { parent: chest, at: [0, 0.355, 0.115], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.03 }),
    aim: head.local({ forward: 0.12, down: 0.03 }),
    role: "jaw",
  });

  // ---------- body ----------
  const body = b.sweep(
    spine,
    (t: number) => {
      const k = Math.sin(Math.PI * (0.15 + 0.8 * t));
      return [0.035 + 0.045 * k, 0.035 + 0.04 * k] as [number, number];
    },
    { color: coat, sides: 10 },
  );
  const skin = b.surface(body);
  const tufts = skin.scatter(70, { rng: rng(5), minDist: 0.03 });
  tufts.forEach((h, i) => {
    b.stick(new THREE.ConeGeometry(0.018, 0.05, 5), i % 2 ? FUR_MID : GOLD, h, { embed: 0.3, flow: [0, -0.2, -1] });
  });
  // neck ruff / mantle
  b.ring(frame([0, 0.345, 0.085], [0, 0.1, 1]), { count: 12, radius: 0.06, tilt: -35 }, (it) =>
    b.spike(it, it, 0.06, 0.02, { color: GOLD }),
  );
  b.ring(frame([0, 0.34, 0.05], [0, 0.1, 1]), { count: 10, radius: 0.075, tilt: -40 }, (it) =>
    b.spike(it, it, 0.055, 0.02, { color: FUR_MID }),
  );

  // ---------- head ----------
  const sd = (s: number, x: number, u: number, f: number) =>
    s > 0 ? { left: x, up: u, forward: f } : { right: x, up: u, forward: f };

  b.part(new THREE.SphereGeometry(0.058, 10, 8), FACE, {
    bone: head,
    at: head.local({ forward: 0.03 }),
    scale: [1, 0.95, 1.05],
  });
  b.sweep([head.local({ forward: 0.05 }), head.local({ forward: 0.15, down: 0.012 })], (t: number) => [0.036 - 0.018 * t, 0.03 - 0.014 * t] as [number, number], {
    bone: head,
    color: MUZZLE,
    sides: 7,
  });
  b.sweep([head.local({ forward: 0.04, down: 0.03 }), head.local({ forward: 0.125, down: 0.027 })], (t: number) => [0.024 - 0.012 * t, 0.018 - 0.008 * t] as [number, number], {
    bone: jaw,
    color: "#9a6a38",
    sides: 6,
  });
  // nose, moist highlight
  b.part(new THREE.SphereGeometry(0.02, 8, 6), BLACK, {
    bone: head,
    at: head.local({ forward: 0.157, down: 0.01 }),
    scale: [1.25, 0.9, 1],
  });
  b.part(new THREE.SphereGeometry(0.0055, 5, 4), "#ffffff", {
    bone: head,
    at: head.local({ forward: 0.166, up: 0.0, down: -0.004 }),
  });
  // fangs
  for (const s of [1, -1]) {
    b.spike(head.local(sd(s, 0.015, -0.03, 0.12)), [0, -1, 0.1], 0.018, 0.004, { bone: head, color: IVORY });
    b.spike(jaw.local({ forward: 0, up: 0 }).clone().set(0, 0, 0).add(head.local(sd(s, 0.013, -0.036, 0.11))), [0, 1, 0.1], 0.016, 0.004, {
      bone: jaw,
      color: IVORY,
    });
  }
  for (const s of [1, -1]) {
    // eyes
    const ePos = head.local(sd(s, 0.034, 0.02, 0.06));
    b.part(new THREE.SphereGeometry(0.022, 9, 7), BLACK, { bone: head, at: ePos, scale: [1, 1.05, 0.95] });
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), "#ffffff", {
      bone: head,
      at: head.local(sd(s, 0.034 - s * 0.0, 0.03, 0.078)),
    });
    // brow fur
    b.spike(head.local(sd(s, 0.03, 0.04, 0.07)), [s * 0.4, 0.5, 0.6], 0.03, 0.012, { bone: head, color: DARKFUR });
    // cheek tufts
    b.spike(head.local(sd(s, 0.04, -0.015, 0.04)), [s * 0.8, -0.3, -0.1], 0.045, 0.016, { bone: head, color: GOLD });
    b.spike(head.local(sd(s, 0.035, -0.03, 0.02)), [s * 0.5, -0.6, -0.2], 0.04, 0.015, { bone: head, color: FUR_MID });
    // ears
    const outline: [number, number, "sharp"?][] = [
      [-0.022, 0],
      [0.026, 0],
      [0.03, 0.03],
      [0.012, 0.085, "sharp"],
      [-0.008, 0.05],
    ];
    const inner: [number, number, "sharp"?][] = [
      [-0.012, 0.006],
      [0.017, 0.006],
      [0.019, 0.03],
      [0.009, 0.062, "sharp"],
      [-0.002, 0.04],
    ];
    const eBase = head.local(sd(s, 0.03, 0.045, 0.0));
    b.extrude(outline as any, {
      at: eBase,
      x: [s, 0, 0],
      y: [s * 0.35, 1, -0.1],
      thickness: 0.008,
      smoothing: 1,
      color: DARKFUR,
      bone: head,
    });
    b.extrude(inner as any, {
      at: eBase.clone().add(new THREE.Vector3(0, 0, 0.005)),
      x: [s, 0, 0],
      y: [s * 0.35, 1, -0.1],
      thickness: 0.004,
      smoothing: 1,
      color: EAR_IN,
      bone: head,
    });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  // ---------- wings ----------
  const tipsBase = [
    [0.78, 0.45, 0.22],
    [0.72, 0.4, -0.06],
    [0.6, 0.37, -0.3],
    [0.42, 0.34, -0.44],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const W: [number, number, number] = [s * 0.36, 0.43, 0.07];
    const arm = b.chain(
      "arm" + S,
      [
        [s * 0.065, 0.345, 0.02],
        [s * 0.21, 0.395, -0.02],
        W,
      ],
      { parent: spine.joints[1], names: ["shoulder" + S, "elbow" + S, "wrist" + S], role: "arm" },
    );
    b.sweep(arm, [0.019, 0.009], { color: BONE, sides: 6 });
    const wrist = arm.joints[arm.joints.length - 1];

    // thumb with hooked claw
    const thumbTip: [number, number, number] = [s * 0.37, 0.45, 0.15];
    const thumb = b.chain("thumb" + S, [W, thumbTip], { parent: wrist, names: ["thumb" + S, "thumbTip" + S], role: "digit" });
    b.sweep(thumb, [0.009, 0.006], { color: BONE, sides: 6 });
    const thumbJ = thumb.joints[thumb.joints.length - 1];
    b.sweep(
      bezier(thumbTip, [thumbTip[0], thumbTip[1] + 0.015, thumbTip[2] + 0.025], [thumbTip[0], thumbTip[1] - 0.012, thumbTip[2] + 0.05]),
      [0.007, 0],
      { bone: thumbJ, color: IVORY, caps: { end: "point" }, sides: 6 },
    );

    // fingers
    const fing = tipsBase.map((tp, k) => {
      const tip: [number, number, number] = [s * tp[0], tp[1], tp[2]];
      const mid: [number, number, number] = [(W[0] + tip[0]) / 2, (W[1] + tip[1]) / 2 + 0.012, (W[2] + tip[2]) / 2];
      const f = b.chain(`finger${k + 1}${S}`, [W, mid, tip], {
        parent: wrist,
        names: [`f${k + 1}Base${S}`, `f${k + 1}Mid${S}`, `f${k + 1}Tip${S}`],
        role: "digit",
      });
      b.sweep(f, [0.008 - k * 0.0008, 0.0028], { color: BONE, sides: 5 });
      return f;
    });
    for (let k = 0; k < 3; k++) {
      b.membrane(fing[k], fing[k + 1], { thickness: 0.006, color: wingPaint, scallop: 0.12, bone: wrist });
    }
    const hipPt: [number, number, number] = [s * 0.06, 0.27, -0.2];
    const midPt: [number, number, number] = [s * 0.2, 0.33, -0.15];
    b.membrane(fing[3], [W, midPt, hipPt], { thickness: 0.006, color: wingPaint, scallop: 0.1, bone: hips });
    b.membrane(arm, [hipPt, midPt, W], { thickness: 0.006, color: wingPaint, bone: hips });
  }

  // ---------- fig ----------
  const C: [number, number, number] = [0, 0.09, -0.06];
  const R = 0.09;
  b.part(new THREE.SphereGeometry(R, 12, 8, Math.PI, Math.PI), "#5b2c4e", { bone: hips, at: C });
  b.part(new THREE.CircleGeometry(R * 0.98, 14), "#e8b0a8", { bone: hips, at: [C[0], C[1], C[2] + 0.002] });
  b.part(new THREE.CircleGeometry(R * 0.82, 14), "#d65a6a", { bone: hips, at: [C[0], C[1], C[2] + 0.004] });
  b.part(new THREE.CircleGeometry(R * 0.5, 10), "#9b2a45", { bone: hips, at: [C[0], C[1], C[2] + 0.006] });
  const rs = rng(11);
  for (let i = 0; i < 16; i++) {
    const a = rs() * Math.PI * 2;
    const r = Math.sqrt(rs()) * R * 0.7;
    b.part(new THREE.SphereGeometry(0.0045, 5, 4), "#e8c860", {
      bone: hips,
      at: [C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r, C[2] + 0.008],
      scale: [1, 1.3, 0.5],
    });
  }
  b.part(new THREE.CylinderGeometry(0.006, 0.01, 0.025, 6), "#6b7a3a", { bone: hips, at: [C[0], C[1] + R + 0.004, C[2] - 0.01] });

  // ---------- legs and feet gripping the fig ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.05, 0.29, -0.17];
    const F: [number, number, number] = [s * 0.04, 0.165, -0.09];
    const pts = limb(hip, F, [0.1, 0.1], [[0, 0, -1]]);
    const leg = b.chain("leg" + S, pts, { parent: hips, names: ["hip" + S, "knee" + S, "foot" + S], role: "leg" });
    b.sweep(leg, [0.024, 0.011], { color: FUR_MID, sides: 7 });
    const foot = leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.015, 6, 5), DARKFUR, { bone: foot, at: F });
    [-1.5, -0.5, 0.5, 1.5].forEach((j) => {
      const d = new THREE.Vector3(s * 0.3 + j * 0.22, 0.85, -0.25).normalize();
      const tip = new THREE.Vector3(...C).addScaledVector(d, R + 0.004);
      b.rod(F, tip, 0.0065, { bone: foot, color: DARKFUR, sides: 5 });
      b.spike(tip, d, 0.014, 0.004, { bone: foot, color: IVORY });
    });
  }

  return b.root;
}
```