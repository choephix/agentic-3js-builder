```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Koala",
  description: "A sitting koala in a rigged rest pose, with big fluffy ears, a large dark nose, a split jaw and fingers and toes with claws.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });

  const GREY = "#858890";
  const CREAM = "#e4dfd2";
  const DARK = "#2a2a2e";
  const SKIN = "#4a4649";
  const CLAW = "#d9d3c4";

  const fur = paint((p) => mix(mix(GREY, "#6f7279", noise(p, 0.04, 3)), "#9a9ca3", noise(p, 0.015, 9) * 0.35));
  const bodyFur = paint((p, n) => {
    const k = smoothstep(0.1, 0.6, n.z) * smoothstep(0.58, 0.4, p.y);
    return mix(mix(GREY, "#6f7279", noise(p, 0.04, 3)), CREAM, k * 0.9);
  });
  const headFur = paint((p) => {
    const base = mix(mix(GREY, "#6f7279", noise(p, 0.04, 5)), "#9a9ca3", noise(p, 0.015, 2) * 0.3);
    const k = smoothstep(0.1, 0.16, p.z) * smoothstep(0.66, 0.6, p.y) * 0.65;
    return mix(base, CREAM, k);
  });

  const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

  // ---- skeleton ----
  b.joint("pelvis", { at: [0, 0.16, -0.05] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.16, -0.05],
      [0, 0.28, -0.05],
      [0, 0.42, 0.0],
      [0, 0.52, 0.03],
    ],
    { parent: "pelvis", role: "spine", names: ["spine1", "spine2", "neck", "head"] },
  );

  // body
  b.sweep(spine, [0.15, 0.17, 0.14, 0.08], { color: bodyFur, name: "body" });
  // rump tuft
  b.part(sph(0.07), CREAM, { at: [0, 0.1, -0.17], bone: "pelvis", scale: [1.2, 0.8, 0.9] });

  // ---- head ----
  b.part(sph(0.15, 12, 9), headFur, { at: [0, 0.62, 0.06], bone: "head", scale: [1.1, 0.95, 0.95], name: "skull" });
  b.part(sph(0.06, 10, 8), headFur, { at: [0, 0.59, 0.17], bone: "head", scale: [1, 0.8, 1], name: "muzzle" });
  b.part(sph(0.032, 10, 8), DARK, { at: [0, 0.628, 0.206], bone: "head", scale: [1.35, 0.85, 1], name: "nose" });
  b.joint("jaw", { parent: "head", at: [0, 0.57, 0.1], dir: [0, 0, 1], role: "jaw" });
  b.part(sph(0.05), CREAM, { at: [0, 0.553, 0.16], bone: "jaw", scale: [1, 0.5, 1.1], name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.05, 0.004, 0.05), SKIN, { at: [0, 0.572, 0.19], bone: "head", name: "lip" });

  for (const [sx, S] of [[1, "L"], [-1, "R"]] as const) {
    // eyes
    b.part(sph(0.016, 8, 6), DARK, { at: [sx * 0.07, 0.65, 0.178], bone: "head", name: "eye" + S });
    b.part(sph(0.005, 5, 4), "#ffffff", { at: [sx * 0.074, 0.658, 0.19], bone: "head" });

    // ears
    const ec = new THREE.Vector3(sx * 0.125, 0.725, 0.02);
    b.joint("ear" + S, { parent: "head", at: ec.toArray(), dir: [sx * 0.3, 1, 0.2] });
    const rot: [number, number, number] = [0, sx * 30, 0];
    const eul = new THREE.Euler(0, sx * (30 * Math.PI) / 180, 0);
    b.part(sph(0.075, 10, 8), fur, { at: ec.toArray(), bone: "ear" + S, scale: [1, 1, 0.4], rotation: rot, name: "ear" + S });
    const fwd = new THREE.Vector3(0, 0, 0.022).applyEuler(eul);
    b.part(sph(0.058, 10, 8), CREAM, {
      at: ec.clone().add(fwd).toArray(), bone: "ear" + S, scale: [1, 1, 0.4], rotation: rot,
    });
    for (let i = 0; i < 7; i++) {
      const a = (-30 + i * 40) * (Math.PI / 180) + Math.PI / 2 - Math.PI / 2;
      const q = new THREE.Vector3(Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0.012).applyEuler(eul);
      b.part(sph(0.017, 6, 5), "#f1ede2", { at: ec.clone().add(q).toArray(), bone: "ear" + S });
    }

    // ---- arms ----
    const sh = [sx * 0.13, 0.42, 0.07], el = [sx * 0.23, 0.34, 0.15], wr = [sx * 0.26, 0.28, 0.25];
    const arm = b.chain("arm" + S, [sh, el, wr], {
      parent: "spine2", role: "arm", names: ["shoulder" + S, "elbow" + S, "wrist" + S],
    });
    b.sweep(arm, [0.05, 0.042, 0.034], { color: fur, name: "arm" + S });
    const wj = "wrist" + S;
    b.part(sph(0.036, 8, 6), SKIN, { at: wr, bone: wj, scale: [1, 0.8, 1.1] });
    const fingers: Array<[string, number, number]> = [
      ["thumb", -sx * 0.035, 0.05],
      ["fingerA", sx * 0.005, 0.08],
      ["fingerB", sx * 0.03, 0.075],
      ["fingerC", sx * 0.052, 0.06],
    ];
    for (const [fn, dx, dz] of fingers) {
      const name = fn + S;
      const tip = [wr[0] + dx * 0.9, wr[1] - 0.02, wr[2] + dz];
      b.sprout(name, b.joint ? (b as any).ctx.joints.get(wj) : wj, tip, 0.012, { color: SKIN, role: "digit" });
      b.spike(tip, [0, -0.35, 1], 0.026, 0.007, { color: CLAW, bone: name });
    }

    // ---- legs ----
    const hip = [sx * 0.12, 0.14, -0.03], knee = [sx * 0.17, 0.1, 0.17], ank = [sx * 0.15, 0.045, 0.3];
    const leg = b.chain("leg" + S, [hip, knee, ank], {
      parent: "pelvis", role: "leg", names: ["hip" + S, "knee" + S, "ankle" + S],
    });
    b.sweep(leg, [0.08, 0.06, 0.042], { color: fur, name: "leg" + S });
    b.part(sph(0.036, 8, 6), SKIN, { at: [ank[0], 0.04, ank[2] + 0.035], bone: "ankle" + S, scale: [1, 0.95, 1.6], name: "foot" + S });
    const toes = [-0.032, -0.011, 0.011, 0.032];
    toes.forEach((t, i) => {
      const name = `toe${i + 1}${S}`;
      const tip = [ank[0] + sx * t * 1.2, 0.034, ank[2] + 0.1];
      b.sprout(name, (b as any).ctx.joints.get("ankle" + S), [tip[0], tip[1], tip[2]], 0.011, { color: SKIN, role: "digit" });
      b.spike(tip, [0, -0.2, 1], 0.022, 0.006, { color: CLAW, bone: name });
    });
  }

  return b.root;
}
```