import * as THREE from "three";
import { createBuilder, frame, spiral, catmull, paint, mix, mottle, countershade } from "../../../../src/index";

export const meta = {
  name: "Garden Snail",
  description: "A rigged garden snail with a striped spiral shell, jointed body, eye stalks, feelers and a two-part jaw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "snail" });

  const sphere = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // ---- Skeleton -----------------------------------------------------------
  const root = b.joint("root", { at: [0, 0.009, 0] });

  const spinePath = catmull([
    [0, 0.003, -0.058],
    [0, 0.009, -0.03],
    [0, 0.009, 0.0],
    [0, 0.009, 0.03],
    [0, 0.011, 0.05],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: root,
    count: 4,
    names: ["tail", "hip", "mid", "neck", "head"],
    role: "spine",
  });
  const head = b.chain ? spine.joints[4] : spine.joints[4];
  const mid = spine.joints[2];

  // ---- Body ---------------------------------------------------------------
  const ss = (t: number, a: number, c: number) => {
    const x = Math.min(Math.max((t - a) / (c - a), 0), 1);
    return x * x * (3 - 2 * x);
  };
  const bodyPaint = countershade(mottle("#7f6e4d", "#98876150".slice(0, 7), { size: 0.006, seed: 3 }), "#dccba3", {
    level: -0.25,
    soft: 0.3,
  });
  b.sweep(spine, (t: number) => {
    const taper = 0.08 + 0.92 * Math.sin(Math.min(1, t / 0.3) * Math.PI / 2);
    const f = 1 - 0.3 * ss(t, 0.8, 1);
    return [0.0125 * taper * f, 0.009 * taper * (1 - 0.1 * ss(t, 0.8, 1))];
  }, { color: bodyPaint, sides: 10, caps: "round", name: "body" });

  // Head
  b.part(sphere(0.0085), bodyPaint, { at: [0, 0.0125, 0.054], bone: head, scale: [1, 0.95, 1.15], name: "head" });
  // Mantle collar under the shell
  b.part(sphere(0.011, 10, 8), mottle("#6e5f43", "#85734f", { size: 0.005, seed: 8 }), {
    at: [0, 0.017, -0.004], bone: mid, scale: [1.2, 0.55, 1.6], name: "mantle",
  });

  // ---- Jaw ----------------------------------------------------------------
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.0085, 0.059], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.008, 0.0028, 0.005), "#4a3a28", { at: [0, 0.0095, 0.0635], bone: head, name: "upperJaw" });
  b.part(new THREE.BoxGeometry(0.0075, 0.0026, 0.0048), "#6a5238", { at: [0, 0.0068, 0.0635], bone: jaw, name: "lowerJaw" });

  // ---- Tentacles ----------------------------------------------------------
  const hp = head.at;
  const stalkColor = mottle("#7f6e4d", "#9a8a66", { size: 0.004, seed: 5 });
  for (const [sx, s] of [[1, "L"], [-1, "R"]] as const) {
    // Long eye stalks
    const start = hp.clone().add(new THREE.Vector3(sx * 0.004, 0.005, 0.004));
    const m = hp.clone().add(new THREE.Vector3(sx * 0.008, 0.022, 0.012));
    const tip = hp.clone().add(new THREE.Vector3(sx * 0.011, 0.04, 0.019));
    const st = b.sprout(`eyeStalk${s}`, frame(start, [0, 1, 0]), [start, m, tip], [0.0028, 0.0017], {
      color: stalkColor, names: [`stalk${s}1`, `stalk${s}2`], role: "tentacle", sides: 7,
    });
    const tipJoint = st.chain!.joints[1];
    b.part(sphere(0.0036, 9, 7), "#7a6a4a", { at: tip, bone: tipJoint, name: `eyeBulb${s}` });
    b.part(sphere(0.0022, 8, 6), "#0a0a0c", { at: tip.clone().add(new THREE.Vector3(sx * 0.0012, 0.0012, 0.0022)), bone: tipJoint, name: `eye${s}` });
    b.part(sphere(0.0007, 5, 4), "#ffffff", { at: tip.clone().add(new THREE.Vector3(sx * 0.0016, 0.0024, 0.0038)), bone: tipJoint, name: `glint${s}` });

    // Short lower feelers
    const fs = hp.clone().add(new THREE.Vector3(sx * 0.005, -0.002, 0.007));
    const ft = hp.clone().add(new THREE.Vector3(sx * 0.009, -0.004, 0.026));
    b.sprout(`feeler${s}`, frame(fs, [0, 0, 1]), [fs, ft], [0.0018, 0.0011], {
      color: stalkColor, names: [`feeler${s}`], role: "tentacle", sides: 6,
    });
  }

  // ---- Shell --------------------------------------------------------------
  const center = new THREE.Vector3(-0.0045, 0.03, -0.006);
  const shell = b.joint("shell", { parent: mid, at: center, dir: [1, 0, 0] });
  const from = center.clone().add(new THREE.Vector3(0, -0.0113, 0.0113));
  const coil = spiral(center, from, [1, 0, 0], { turns: 2.6, r1: 0.004, pitch: 0.0035 });
  const R0 = 0.016, R1 = 0.004;
  const shellPaint = paint((p, n, s) => {
    const f = (((s[1] % 360) + 360) % 360) / 360 * 5 % 1;
    const base = mix("#c98a3c", "#e3b56a", ss(s[0], 0.5, 1));
    const dark = mix("#5a3418", "#7a4a22", ss(s[0], 0.3, 1));
    const edge = ss(f, 0.2, 0.3) * (1 - ss(f, 0.28, 0.34));
    // dark band for f<0.28, with a soft lighter edge
    const k = f < 0.28 ? 1 - edge * 0.0 : 0;
    return mix(base, dark, k);
  });
  b.sweep(coil, (t: number) => {
    const R = R0 * Math.pow(R1 / R0, t);
    const flare = 1 + 0.3 * Math.max(0, 1 - t / 0.12);
    const r = 0.5 * R * flare;
    return [r, r];
  }, { color: shellPaint, bone: shell, sides: 10, caps: "round", name: "shell" });

  return b.root;
}
