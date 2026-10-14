```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Garden Snail",
  description: "A stylized garden snail with a banded spiral shell, eye stalks and a jointed jaw, in rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });

  // Skeleton
  const body = b.joint("body", { at: [0, 0.006, 0] });
  const tail2 = b.joint("tail2", { at: [0, 0.004, -0.045], parent: body });
  const tail1 = b.joint("tail1", { at: [0, 0.004, -0.022], parent: body });
  const neck = b.joint("neck", { at: [0, 0.006, 0.025], parent: body });
  const head = b.joint("head", { at: [0, 0.012, 0.043], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.008, 0.05], parent: head });
  const shell = b.joint("shell", { at: [0, 0.03, -0.008], parent: body });
  const stalkL = b.joint("eyeStalkL", { at: [0.004, 0.016, 0.047], parent: head });
  const stalkR = b.joint("eyeStalkR", { at: [-0.004, 0.016, 0.047], parent: head });
  const feelerL = b.joint("feelerL", { at: [0.004, 0.011, 0.051], parent: head });
  const feelerR = b.joint("feelerR", { at: [-0.004, 0.011, 0.051], parent: head });

  const sph = new THREE.SphereGeometry(1, 10, 7);
  const sphLow = new THREE.SphereGeometry(1, 8, 6);

  const skin = "#b8a27a";
  const skinDark = "#8f7a58";
  const sole = "#d9c9a0";

  // Foot (sole) segments from tail to head
  const foot: [number, number, number, any][] = [
    [-0.058, 0.0035, 0.004, tail2],
    [-0.048, 0.0045, 0.007, tail2],
    [-0.036, 0.0050, 0.009, tail1],
    [-0.022, 0.0050, 0.011, tail1],
    [-0.006, 0.0050, 0.0115, body],
    [0.01, 0.0050, 0.0115, body],
    [0.026, 0.0050, 0.011, neck],
    [0.04, 0.0050, 0.0095, neck],
  ];
  foot.forEach(([z, ry, rx, bone]) => {
    b.part(sph, sole, { at: [0, ry - 0.001, z], scale: [rx, ry, 0.011], bone });
  });

  // Upper body
  b.part(sph, skin, { at: [0, 0.009, -0.045], scale: [0.0045, 0.005, 0.012], bone: tail2 });
  b.part(sph, skin, { at: [0, 0.0095, -0.03], scale: [0.0075, 0.0075, 0.014], bone: tail1 });
  b.part(sph, skin, { at: [0, 0.011, -0.01], scale: [0.0095, 0.009, 0.016], bone: body });
  b.part(sph, skin, { at: [0, 0.011, 0.012], scale: [0.0088, 0.0085, 0.016], bone: body });
  b.part(sph, skin, { at: [0, 0.0115, 0.03], scale: [0.0078, 0.0085, 0.013], bone: neck });
  // Back ridge
  b.part(sph, skinDark, { at: [0, 0.0185, 0.0], scale: [0.0025, 0.0025, 0.03], bone: body });

  // Head
  b.part(sph, skin, { at: [0, 0.012, 0.045], scale: [0.0078, 0.0078, 0.0085], bone: head });
  b.part(new THREE.BoxGeometry(0.008, 0.0025, 0.004), "#6e5a3e", { at: [0, 0.0085, 0.0525], bone: head });
  b.part(new THREE.BoxGeometry(0.0075, 0.002, 0.0035), "#d07a6a", { at: [0, 0.0065, 0.0515], bone: jaw });

  // Eye stalks and eyes
  const stalkGeo = new THREE.CylinderGeometry(0.0013, 0.002, 0.018, 6);
  const feelerGeo = new THREE.CylinderGeometry(0.0009, 0.0014, 0.008, 6);
  const eyeGeo = new THREE.SphereGeometry(1, 8, 6);
  for (const s of [1, -1]) {
    const sj = s > 0 ? stalkL : stalkR;
    const fj = s > 0 ? feelerL : feelerR;
    const base = [0.004 * s, 0.016, 0.047];
    const dir = [0.3 * s, 1, 0.6];
    const len = Math.hypot(...dir);
    const d = dir.map((v) => v / len);
    const center = base.map((v, i) => v + d[i] * 0.009);
    const tip = base.map((v, i) => v + d[i] * 0.018);
    b.part(stalkGeo, skinDark, { at: center, dir: d, bone: sj });
    b.part(eyeGeo, "#2a2118", { at: tip, scale: [0.0026, 0.0026, 0.0026], bone: sj });
    b.part(eyeGeo, "#f2efe6", { at: [tip[0] + 0.0008 * s, tip[1] + 0.001, tip[2] + 0.001], scale: [0.0008, 0.0008, 0.0008], bone: sj });

    const fb = [0.004 * s, 0.011, 0.051];
    const fd = [0.35 * s, 0.35, 1];
    const fl = Math.hypot(...fd);
    const f = fd.map((v) => v / fl);
    b.part(feelerGeo, skinDark, { at: fb.map((v, i) => v + f[i] * 0.004), dir: f, bone: fj });
    b.part(eyeGeo, skin, { at: fb.map((v, i) => v + f[i] * 0.008), scale: [0.0014, 0.0014, 0.0014], bone: fj });
  }

  // Spiral shell: tube spheres along a log spiral in the y-z plane
  const turns = 3.1;
  const steps = 46;
  const c = [0, 0.03, -0.008];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const t = u * turns;
    const th = t * Math.PI * 2 + 0.6;
    const pathR = 0.002 + 0.0042 * t;
    const tubeR = 0.0022 + 0.0033 * t;
    const x = 0.005 * (1 - u) - 0.002;
    const col = Math.floor(i / 2) % 2 === 0 ? "#7a4a22" : "#c99555";
    b.part(i % 2 ? sph : sphLow, col, {
      at: [x, c[1] + Math.sin(th) * pathR, c[2] - Math.cos(th) * pathR],
      scale: [tubeR * 1.05, tubeR, tubeR],
      bone: shell,
    });
  }
  // Shell mouth rim and apex nub
  b.part(sph, "#e6cf9c", { at: [0, 0.0145, 0.014], scale: [0.011, 0.005, 0.009], bone: shell });
  b.part(new THREE.ConeGeometry(0.0022, 0.005, 6), "#5a3418", { at: [0.0075, 0.0315, -0.0075], dir: [1, 0, 0], bone: shell });

  return b.root;
}
```