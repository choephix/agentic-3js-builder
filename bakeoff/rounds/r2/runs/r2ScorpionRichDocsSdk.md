```ts
import * as THREE from "three";
import { createBuilder, limb, catmull, bezier, polyline, mottle, paint } from "agentic-3js-builder";

export const meta = {
  name: "Desert Scorpion",
  description:
    "Amber-armoured scorpion in a threatening pose: tail arched over the back, pincers forward, eight banded legs, dark bulbous stinger and a cluster of tiny black eyes.",
};

const AMBER = "#e8a025";
const AMBER2 = "#c97a14";
const DARK = "#5a2a0c";
const BLACK = "#0a0806";
const STING = "#2b0f06";
const BARB = "#150a05";

export default function build() {
  const b = createBuilder({ name: "scorpion" });
  const root = b.joint("root", { at: [0, 0.02, 0], role: "spine" });

  // ---- spine ----
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.02, 0.05],
      [0, 0.02, 0],
      [0, 0.02, -0.06],
    ]),
    { parent: root, names: ["spine1", "spine2"], role: "spine" },
  );

  // body paint: mottled amber with dark bands between abdominal plates
  const amberPaint = mottle(AMBER, AMBER2, { size: 0.012, contrast: 0.6 });
  const bodyPaint = paint((p, _n, _s) => {
    if (p.z < 0.004) {
      const k = -p.z / 0.0095;
      const f = k - Math.floor(k);
      if (f < 0.16) return DARK;
    }
    return amberPaint;
  });

  // mesosoma / abdomen
  b.loft(
    [
      { at: [0, 0.02, 0.05], w: 0.016, h: 0.012 },
      { at: [0, 0.021, 0.03], w: 0.032, h: 0.018 },
      { at: [0, 0.02, 0.0], w: 0.034, h: 0.016 },
      { at: [0, 0.02, -0.03], w: 0.03, h: 0.014 },
      { at: [0, 0.02, -0.06], w: 0.018, h: 0.011 },
    ],
    { bone: spine, color: bodyPaint },
  );

  // head shield
  const shieldGeo = new THREE.SphereGeometry(1, 10, 6).scale(0.016, 0.007, 0.024);
  const shield = b.part(shieldGeo, bodyPaint, { at: [0, 0.026, 0.028], bone: spine.joints[0] });
  const mound = b.part(new THREE.SphereGeometry(0.0045, 6, 4), DARK, {
    at: [0, 0.0325, 0.033],
    bone: spine.joints[0],
  });

  // eyes: 2 median on the mound, 3 lateral per side on the shield edge
  const eyeGeo = () => new THREE.SphereGeometry(0.0016, 6, 4);
  const mSurf = b.surface(mound);
  for (const s of [1, -1]) {
    const h = mSurf.nearest([s * 0.002, 0.0375, 0.0335]);
    b.stick(eyeGeo(), BLACK, h, { embed: 0.3 });
  }
  const sSurf = b.surface(shield);
  const latPts: [number, number][] = [
    [0.01, 0.043],
    [0.0125, 0.038],
    [0.0135, 0.033],
  ];
  for (const s of [1, -1])
    for (const [x, z] of latPts) {
      const h = sSurf.nearest([s * x, 0.04, z]);
      b.stick(new THREE.SphereGeometry(0.0012, 6, 4), BLACK, h, { embed: 0.3 });
    }

  // chelicerae: upper fixed, lower jaw hinged
  b.frustumBox([0, 0.0205, 0.046], [0, 0.0205, 0.059], [0.014, 0.006], [0.01, 0.004], {
    bone: spine.joints[0],
    color: AMBER2,
  });
  const jaw = b.joint("jaw", {
    parent: spine.joints[0],
    at: [0, 0.0172, 0.05],
    aim: [0, 0.0172, 0.062],
    role: "jaw",
  });
  b.frustumBox([0, 0.0168, 0.05], [0, 0.0168, 0.061], [0.012, 0.003], [0.008, 0.002], {
    bone: jaw,
    color: DARK,
  });

  // ---- tail ----
  const tailPath = catmull([
    [0, 0.02, -0.058],
    [0, 0.022, -0.085],
    [0, 0.04, -0.105],
    [0, 0.065, -0.105],
    [0, 0.085, -0.08],
    [0, 0.092, -0.045],
    [0, 0.085, -0.015],
    [0, 0.074, 0.004],
  ]);
  const tail = b.chain("tail", tailPath, { parent: spine.joints[1], count: 6, role: "tail" });
  b.sweep(
    tail,
    (t) => {
      const u = t * 5.5;
      const f = u - Math.floor(u);
      return 0.0085 * (1 - 0.42 * t) * (0.86 + 0.14 * Math.sin(Math.PI * f));
    },
    {
      color: (t: number) => {
        const f = t * 5.5 - Math.floor(t * 5.5);
        return f < 0.1 || f > 0.9 ? DARK : AMBER;
      },
      caps: "round",
    },
  );
  const tailEnd = tailPath.at(1);
  const T = tailPath.tangentAt(1);
  const tipBone = tail.joints[tail.joints.length - 1];
  const bulbC = tailEnd.clone().addScaledVector(T, 0.004);
  b.part(new THREE.SphereGeometry(1, 8, 6).scale(0.0058, 0.0062, 0.0072), STING, {
    at: bulbC,
    bone: tipBone,
    dir: [T.x, T.y, T.z],
    axis: "z",
  });
  const barbTip = bulbC.clone().addScaledVector(T, 0.008).add(new THREE.Vector3(0, -0.009, 0));
  b.spike(bulbC, barbTip, null, 0.0032, { bone: tipBone, color: BARB });

  // ---- pedipalps ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.014, 0.019, 0.04];
    const el: [number, number, number] = [s * 0.04, 0.017, 0.072];
    const wr: [number, number, number] = [s * 0.026, 0.016, 0.098];
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: spine.joints[0],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.0048, 0.0038], {
      color: (t: number) => (Math.abs(t - 0.5) < 0.06 || t < 0.06 ? DARK : AMBER),
    });
    const wrist = arm.tip ?? arm.joints[arm.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 8, 6).scale(0.011, 0.008, 0.016), amberPaint, {
      at: [s * 0.025, 0.016, 0.112],
      bone: wrist,
    });
    // fixed finger
    b.sweep(
      bezier([s * 0.03, 0.016, 0.12], [s * 0.034, 0.016, 0.146], [s * 0.018, 0.016, 0.162]),
      [0.0062, 0.0008],
      { bone: wrist, color: AMBER2, caps: { end: "point" }, sides: 6 },
    );
    // movable finger on its own joint
    const claw = b.joint(`claw${S}`, {
      parent: wrist,
      at: [s * 0.02, 0.016, 0.122],
      aim: [s * 0.012, 0.016, 0.156],
      role: "jaw",
    });
    b.sweep(
      bezier([s * 0.02, 0.016, 0.122], [s * 0.018, 0.016, 0.146], [s * 0.012, 0.016, 0.158]),
      [0.0052, 0.0008],
      { bone: claw, color: AMBER, caps: { end: "point" }, sides: 6 },
    );
    // dark joint band at palm base
    b.part(new THREE.CylinderGeometry(0.0052, 0.0052, 0.0025, 8), DARK, {
      at: [s * 0.0262, 0.016, 0.1],
      bone: wrist,
      dir: [s * 0.1, 0, 1],
    });
  }

  // ---- eight legs ----
  const zs = [0.03, 0.01, -0.012, -0.034];
  const footDz = [0.028, 0.01, -0.014, -0.036];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const hip: [number, number, number] = [s * 0.015, 0.017, zs[i]];
      const foot: [number, number, number] = [s * (0.054 - i * 0.003), 0.0015, zs[i] + footDz[i] * 0.9];
      const pts = limb(
        hip,
        foot,
        [0.016, 0.021, 0.018],
        [
          [0, 1, 0],
          [0, 1, 0],
        ],
      );
      const nm = [`coxa${S}${i}`, `femur${S}${i}`, `tibia${S}${i}`, `tarsus${S}${i}`];
      const leg = b.chain(`leg${S}${i}`, pts, {
        parent: i < 2 ? spine.joints[0] : spine.joints[1],
        names: nm,
        role: "leg",
      });
      b.sweep(leg, [0.0029, 0.0013], {
        color: (t: number) => (Math.abs(t - 0.3) < 0.05 || Math.abs(t - 0.68) < 0.05 || t < 0.05 ? DARK : AMBER),
        sides: 6,
      });
    }
  }

  return b.root;
}
```