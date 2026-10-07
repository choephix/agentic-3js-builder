```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, paint, mottle, spots, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust octopus with bumpy mottled skin, golden bar-pupil eyes and a grumpy brow. Eight sucker-lined arms curl out around it, and one holds up an old brass key.",
};

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const rand = rng(11);

  const CORAL = "#e0714f";
  const RUST = "#a8472a";
  const PALE = "#f4cfae";
  const skin = countershade(
    spots(mottle(CORAL, RUST, { size: 0.07, seed: 2 }), PALE, { size: 0.045, amount: 0.4, seed: 3 }),
    "#f2c9a6",
    { level: -0.35, soft: 0.3 },
  );

  // ---- skeleton roots
  b.joint("body", { at: [0, 0.12, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("head", { parent: "body", at: [0, 0.17, -0.03], dir: [0, 1, 0.2], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.07, 0.05], dir: [0, -0.3, 1], role: "jaw" });

  // ---- head and web
  const mantle = b.part(new THREE.SphereGeometry(1, 12, 9), skin, {
    bone: "head",
    at: [0, 0.25, -0.05],
    scale: [0.1, 0.13, 0.115],
    name: "mantle",
  });
  const web = b.part(new THREE.SphereGeometry(1, 12, 8), skin, {
    bone: "body",
    at: [0, 0.13, 0.01],
    scale: [0.125, 0.075, 0.12],
    name: "web",
  });

  // ---- eyes
  for (const sign of [1, -1]) {
    const c = new THREE.Vector3(sign * 0.082, 0.21, 0.02);
    b.part(new THREE.SphereGeometry(1, 10, 8), "#e8a92a", {
      bone: "head",
      at: c,
      scale: [0.03, 0.03, 0.028],
      name: "eye",
    });
    const dir = new THREE.Vector3(sign * 0.55, 0.1, 0.83).normalize();
    b.part(new THREE.BoxGeometry(0.036, 0.009, 0.004), "#1a1008", {
      bone: "head",
      at: c.clone().addScaledVector(dir, 0.0285),
      dir,
      axis: "z",
      up: [0, 1, 0],
      name: "pupil",
    });
    b.part(new THREE.BoxGeometry(0.075, 0.013, 0.022), "#7a2f1c", {
      bone: "head",
      at: [sign * 0.088, 0.248, 0.024],
      rotation: [0, sign * 35, sign * 25],
      name: "brow",
    });
  }

  // ---- siphon
  b.part(new THREE.CylinderGeometry(0.012, 0.017, 0.05, 7), CORAL, {
    bone: "head",
    at: [0.065, 0.15, 0.085],
    dir: [0.3, -0.25, 1],
    name: "siphon",
  });

  // ---- beak
  b.part(new THREE.ConeGeometry(0.014, 0.04, 5), "#2b1a12", {
    bone: "head",
    at: [0, 0.062, 0.05],
    dir: [0, -0.5, 1],
    name: "beakUpper",
  });
  b.part(new THREE.ConeGeometry(0.011, 0.032, 5), "#3a241a", {
    bone: "jaw",
    at: [0, 0.052, 0.05],
    dir: [0, 0.2, 1],
    name: "beakLower",
  });

  // ---- bumps on head / web
  const hits = b.surface([mantle, web]).scatter(70, {
    rng: rng(5),
    minDist: 0.025,
    filter: (h) => h.n.y > -0.1,
  });
  const bump = new THREE.SphereGeometry(1, 5, 4);
  for (const h of hits) {
    const s = 0.006 + rand() * 0.006;
    b.stick(bump, rand() < 0.5 ? "#f0a07e" : "#c9593a", h, { embed: 0.4, scale: s, name: "bump" });
  }

  // ---- arms
  const suckerGeo = new THREE.CylinderGeometry(0.008, 0.009, 0.006, 8);
  const suckerCore = new THREE.CylinderGeometry(0.0045, 0.0045, 0.0075, 6);
  const radiusAt = (t: number) => 0.034 * Math.pow(1 - t, 1.1) + 0.004;
  const lens = [1, 1.05, 0.95, 1.1, 1, 0.9, 1.05, 1];
  let keyTip = new THREE.Vector3();
  let keyTipJoint = "";

  for (let i = 0; i < 8; i++) {
    const ang = ((40 + i * 45) * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const tan = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang));
    const pos = (r: number, s: number, h: number) =>
      d.clone().multiplyScalar(r).addScaledVector(tan, s).setY(h);
    const sg = i % 2 ? 1 : -1;
    const L = lens[i];
    let pts: THREE.Vector3[];
    let count = 4;
    if (i === 0) {
      count = 5;
      pts = [
        pos(0.07, 0, 0.07),
        pos(0.15, 0.01, 0.1),
        pos(0.23, 0.02, 0.17),
        pos(0.29, 0.04, 0.26),
        pos(0.3, 0.07, 0.34),
        pos(0.27, 0.09, 0.39),
      ];
    } else {
      const up = 0.07 + 0.07 * rand();
      pts = [
        pos(0.07, 0, 0.07),
        pos(0.17 * L, sg * 0.03, 0.04),
        pos(0.26 * L, sg * 0.08, 0.024),
        pos(0.34 * L, sg * 0.15, 0.022),
        pos(0.4 * L, sg * 0.22, 0.04),
        pos(0.4 * L, sg * 0.29, up),
      ];
    }
    const n = i + 1;
    const names = Array.from({ length: count }, (_, k) => `arm${n}_${k + 1}`).concat(`arm${n}_tip`);
    const chain = b.chain(`arm${n}`, catmull(pts), { parent: "body", count, names, role: "arm" });
    const sw = b.sweep(chain, radiusAt, { color: skin, caps: "round", sides: 8, name: `arm${n}` });

    // suckers on the lower flanks
    const per = 8;
    for (const ca of [120, 240]) {
      for (let k = 0; k < per; k++) {
        const t = 0.1 + (0.78 * k) / (per - 1) + (ca === 240 ? 0.04 : 0);
        const pt = sw.at(Math.min(t, 0.92), ca, 0);
        const sc = 0.5 + 0.5 * (1 - t);
        b.stick(suckerGeo, "#f6e6c8", pt, { embed: 0.3, scale: sc, name: "sucker" });
        b.stick(suckerCore, "#e0a98c", pt, { embed: 0.1, scale: sc, name: "suckerCore" });
      }
    }
    // dorsal bumps
    for (let k = 0; k < 6; k++) {
      const t = 0.08 + k * 0.13;
      const pt = sw.at(t, (k % 2 ? 35 : -35), 0);
      b.stick(bump, k % 2 ? "#f0a07e" : "#c9593a", pt, { embed: 0.4, scale: 0.005 + 0.005 * (1 - t), name: "armBump" });
    }
    if (i === 0) {
      keyTip = chain.at(1).at.clone();
      keyTipJoint = `arm${n}_tip`;
    }
  }

  // ---- brass key held by arm 1
  b.joint("key", { parent: keyTipJoint, at: keyTip, dir: [0, 1, 0] });
  const brass = mottle("#c89b3c", "#7f5f1a", { size: 0.02, seed: 4 });
  const verdigris = mottle("#c89b3c", "#5f9a7a", { size: 0.015, seed: 8, contrast: 1.5 });
  const kp = (x: number, y: number, z = 0): [number, number, number] => [keyTip.x + x, keyTip.y + y, keyTip.z + z];
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.15, 6), brass, { bone: "key", at: kp(0, 0.04), name: "keyShaft" });
  b.part(new THREE.TorusGeometry(0.032, 0.008, 5, 10), verdigris, { bone: "key", at: kp(0, 0.15), name: "keyBow" });
  b.part(new THREE.TorusGeometry(0.011, 0.005, 4, 8), brass, {
    bone: "key",
    at: kp(0, 0.1),
    rotation: [90, 0, 0],
    name: "keyCollar",
  });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.008), brass, { bone: "key", at: kp(0.02, -0.025), name: "keyTooth1" });
  b.part(new THREE.BoxGeometry(0.022, 0.012, 0.008), brass, { bone: "key", at: kp(0.017, -0.005), name: "keyTooth2" });
  // the arm's coil gripping the shaft
  b.part(new THREE.TorusGeometry(0.014, 0.007, 5, 9), CORAL, {
    bone: keyTipJoint,
    at: kp(0, 0.015),
    rotation: [90, 0, 0],
    name: "grip",
  });
  b.part(new THREE.TorusGeometry(0.014, 0.006, 5, 9), RUST, {
    bone: keyTipJoint,
    at: kp(0, 0.04),
    rotation: [90, 0, 0],
    name: "grip2",
  });

  return b.root;
}
```