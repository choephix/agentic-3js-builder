```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "scorpion",
  description:
    "A stylised scorpion: a segmented body, a raised tail ending in a bulb and stinger, pedipalp pincers and eight jointed legs, rigged on a named skeleton.",
};

type V = [number, number, number];
type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;

const C = {
  shell: "#6b3a1c",
  dark: "#3a1f0f",
  claw: "#8e4522",
  pale: "#c98e4a",
  sting: "#b8431e",
  eye: "#111111",
};

export default function build() {
  const b = createBuilder({ name: "scorpion" });

  // Helpers: primitives placed on a joint's bone.
  const ell = (bone: Joint, at: V, rx: number, ry: number, rz: number, color: string, seg = 10) => {
    const g = new THREE.SphereGeometry(1, seg, 8);
    g.scale(rx, ry, rz);
    b.part(g, color, { at, bone });
  };

  const ball = (bone: Joint, at: V, r: number, color: string) => {
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, bone });
  };

  const rod = (bone: Joint, a: V, c: V, r0: number, r1: number, color: string, seg = 6) => {
    const d: V = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const dir: V = [d[0] / len, d[1] / len, d[2] / len];
    const at: V = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    // CylinderGeometry: top radius sits at the +Y end, which is the end `c`.
    b.part(new THREE.CylinderGeometry(r1, r0, len, seg), color, { at, bone, dir });
  };

  const cone = (bone: Joint, base: V, tip: V, r: number, color: string) => {
    const d: V = [tip[0] - base[0], tip[1] - base[1], tip[2] - base[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const dir: V = [d[0] / len, d[1] / len, d[2] / len];
    const at: V = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2, (base[2] + tip[2]) / 2];
    b.part(new THREE.ConeGeometry(r, len, 6), color, { at, bone, dir });
  };

  // ---- Skeleton: body ----
  const hipsP: V = [0, 0.022, 0];
  const hips = b.joint("hips", { at: hipsP });

  const prosomaP: V = [0, 0.026, 0.08];
  const prosoma = b.joint("prosoma", { at: prosomaP, parent: hips });

  const mesoP: V = [0, 0.026, 0];
  const meso = b.joint("meso", { at: mesoP, parent: hips });

  // ---- Prosoma (front shield) ----
  ell(prosoma, prosomaP, 0.024, 0.013, 0.03, C.shell, 12);
  ell(prosoma, [0, 0.037, 0.09], 0.012, 0.003, 0.02, C.pale, 8); // pale dorsal stripe
  ell(prosoma, [-0.007, 0.036, 0.1], 0.0035, 0.0035, 0.0035, C.eye, 6);
  ell(prosoma, [0.007, 0.036, 0.1], 0.0035, 0.0035, 0.0035, C.eye, 6);
  ell(prosoma, [-0.016, 0.034, 0.09], 0.0028, 0.0028, 0.0028, C.eye, 6);
  ell(prosoma, [0.016, 0.034, 0.09], 0.0028, 0.0028, 0.0028, C.eye, 6);

  // ---- Mesosoma (five banded segments, shrinking backwards) ----
  for (let i = 0; i < 5; i++) {
    const z = 0.046 - i * 0.019;
    const rx = 0.02 - i * 0.0022;
    const ry = 0.0135 - i * 0.0012;
    ell(meso, [0, 0.026, z], rx, ry, 0.0115, i % 2 === 0 ? C.shell : C.dark, 10);
  }

  // ---- Tail (metasoma): arches back, up and over, ending in bulb and stinger ----
  const tailP: V[] = [
    [0, 0.03, -0.04],
    [0, 0.05, -0.062],
    [0, 0.08, -0.074],
    [0, 0.106, -0.06],
    [0, 0.124, -0.03],
  ];
  const telsonP: V = [0, 0.12, -0.01];

  const tail1 = b.joint("tail1", { at: tailP[0], parent: hips });
  const tail2 = b.joint("tail2", { at: tailP[1], parent: tail1 });
  const tail3 = b.joint("tail3", { at: tailP[2], parent: tail2 });
  const tail4 = b.joint("tail4", { at: tailP[3], parent: tail3 });
  const tail5 = b.joint("tail5", { at: tailP[4], parent: tail4 });
  const telson = b.joint("telson", { at: telsonP, parent: tail5 });

  const tailJoints = [tail1, tail2, tail3, tail4, tail5];
  const tailR = [0.0095, 0.009, 0.0082, 0.0076, 0.0068];
  for (let i = 0; i < 4; i++) {
    rod(tailJoints[i], tailP[i], tailP[i + 1], tailR[i], tailR[i + 1], C.shell);
  }
  rod(tail5, tailP[4], telsonP, tailR[4], 0.0068, C.shell);

  tailJoints.forEach((j, i) => ball(j, tailP[i], tailR[i] + 0.0008, C.dark));

  ell(telson, telsonP, 0.0115, 0.0105, 0.0125, C.shell, 12);
  ell(telson, [0, 0.12, -0.012], 0.0075, 0.0068, 0.008, C.dark, 8); // dark bulb cap

  // Stinger: hooks forward over the bulb.
  const stingBase: V = [0, 0.128, -0.002];
  const stingTip: V = [0, 0.122, 0.016];
  cone(telson, stingBase, stingTip, 0.0045, C.sting);
  ball(telson, stingBase, 0.0028, C.sting);

  // ---- Legs: four pairs, knee raised, feet on the floor ----
  const legZ = [0.098, 0.082, 0.066, 0.05];
  for (const s of [1, -1]) {
    const sn = s > 0 ? "L" : "R";
    legZ.forEach((z, i) => {
      const hipP: V = [s * 0.02, 0.026, z];
      const kneeP: V = [s * 0.05, 0.036, z + 0.006];
      const ankP: V = [s * 0.072, 0.012, z + 0.004];
      const tipP: V = [s * 0.084, 0.002, z - 0.002];

      const hip = b.joint(`leg${sn}${i}Hip`, { at: hipP, parent: prosoma });
      const knee = b.joint(`leg${sn}${i}Knee`, { at: kneeP, parent: hip });
      const ankle = b.joint(`leg${sn}${i}Ankle`, { at: ankP, parent: knee });

      rod(hip, hipP, kneeP, 0.0034, 0.0028, C.dark);
      rod(knee, kneeP, ankP, 0.0028, 0.0022, C.dark);
      rod(ankle, ankP, tipP, 0.0022, 0.0014, C.dark);
      ball(knee, kneeP, 0.003, C.pale);
      ball(ankle, ankP, 0.0022, C.dark);
      ball(ankle, tipP, 0.0016, C.dark); // foot tip
    });
  }

  // ---- Pedipalps: chunky pincers on arm-like chains ----
  for (const s of [1, -1]) {
    const sn = s > 0 ? "L" : "R";
    const hipP: V = [s * 0.018, 0.028, 0.118];
    const elbowP: V = [s * 0.042, 0.032, 0.146];
    const wristP: V = [s * 0.058, 0.028, 0.18];
    const pinchP: V = [s * 0.068, 0.026, 0.195];

    const palHip = b.joint(`pal${sn}Hip`, { at: hipP, parent: prosoma });
    const palElbow = b.joint(`pal${sn}Elbow`, { at: elbowP, parent: palHip });
    const palWrist = b.joint(`pal${sn}Wrist`, { at: wristP, parent: palElbow });
    const palPinch = b.joint(`pal${sn}Pinch`, { at: pinchP, parent: palWrist });

    rod(palHip, hipP, elbowP, 0.0055, 0.0048, C.shell);
    rod(palElbow, elbowP, wristP, 0.005, 0.0045, C.shell);
    ball(palElbow, elbowP, 0.0048, C.dark);
    ball(palWrist, wristP, 0.005, C.dark);

    // Hand block
    ell(palWrist, [s * 0.062, 0.027, 0.196], 0.013, 0.011, 0.02, C.claw, 10);

    // Fixed finger and moving finger (pinches on the moving joint)
    rod(palWrist, [s * 0.05, 0.026, 0.196], [s * 0.066, 0.024, 0.236], 0.0048, 0.0016, C.claw);
    rod(palPinch, pinchP, [s * 0.058, 0.024, 0.236], 0.0044, 0.0014, C.claw);
    ball(palWrist, [s * 0.066, 0.024, 0.236], 0.0014, C.dark); // dark claw tips
    ball(palPinch, [s * 0.058, 0.024, 0.236], 0.0013, C.dark);
  }

  return b.root;
}
```