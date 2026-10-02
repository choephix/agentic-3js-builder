import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { cel, INK } from "../kits/toon";
import { catmull, polyline } from "../src/path";
import { paint } from "../src/paint";
import { rng } from "../src/math";

const BELL = cel("#9de8ed", "#3b7899", { threshold: -0.08 });
const BELL_UNDERSIDE = cel("#69c6d6", "#284c79", { threshold: 0.05 });
const RIM = cel("#5bc9d8", "#245879", { threshold: -0.1 });
const GONAD = cel("#d75caa", "#702d70", { threshold: -0.12 });
const ARM = cel("#e785bd", "#803b7a", { threshold: -0.08 });
const FRILL = cel("#f1a5cf", "#944781", { threshold: -0.05 });
const HIGHLIGHT = cel("#d3ffff", "#5aa9c4", { threshold: 0.22 });
const BELL_SURFACE = paint((_p, n) => (n.y < -0.18 ? BELL_UNDERSIDE : BELL));

export const meta = {
  name: "Moon jellyfish",
  description:
    "Aurelia aurita drifting above the floor: a faceted translucent-looking bell, four horseshoe gonads, a pulsing rim, fine marginal tentacle bundles, and four frilled oral arms.",
};

export default function build() {
  const b = createBuilder({ name: "moonJellyfish", detail: 0.9, paintSize: 1024 });
  const bellCore = b.joint("bellCore", { at: [0, 0.79, 0], role: "spine" });

  // A thin-walled lathed bell keeps the silhouette simple while the two paints separate its lit dome and underside.
  b.lathe(
    [
      [0, 0.17],
      [0.045, 0.166],
      [0.09, 0.15],
      [0.13, 0.12],
      [0.15, 0.075],
      [0.153, 0.04],
      [0.145, 0.018],
      [0.11, 0.014],
      [0.055, 0.024],
      [0, 0.04],
    ],
    {
      at: [0, 0.79, 0],
      bone: bellCore,
      segments: 18,
      smoothing: 1,
      color: BELL_SURFACE,
      name: "bellShell",
      group: "bell",
    },
  );

  // The dark oral opening makes the underside legible from the low camera angle.
  b.part(new THREE.CircleGeometry(0.043, 12), INK, {
    bone: bellCore,
    at: [0, 0.802, 0],
    dir: [0, -1, 0],
    axis: "z",
    name: "oralOpening",
    group: "bell",
  });

  // Separate rim spans are individually riggable, so a pulse can travel around the bell without moving the dome.
  for (let i = 0; i < 12; i += 1) {
    const a0 = (i / 12) * Math.PI * 2;
    const am = ((i + 0.5) / 12) * Math.PI * 2;
    const a1 = ((i + 1) / 12) * Math.PI * 2;
    const rimPath = polyline([
      [Math.cos(a0) * 0.153, 0.808, Math.sin(a0) * 0.153],
      [Math.cos(am) * 0.156, 0.806, Math.sin(am) * 0.156],
      [Math.cos(a1) * 0.153, 0.808, Math.sin(a1) * 0.153],
    ]);
    const rimChain = b.chain(`rim${i}`, rimPath, {
      parent: bellCore,
      names: [`rim${i}`, `rim${i}Tip`],
      role: "fan",
      group: "bellRim",
    });
    b.sweep(rimChain, 0.008, {
      color: RIM,
      section: { ngon: 6 },
      caps: "flat",
      skin: "rigid",
      name: `rimSegment${i}`,
      group: "bellRim",
    });
  }

  // Four horseshoe-shaped gonads sit proud of the dome as the defining top detail.
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const radial = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const tangent = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const centre = radial
      .clone()
      .multiplyScalar(0.068)
      .add(new THREE.Vector3(0, 0.955, 0));
    const gonadPath = catmull([
      centre.clone().addScaledVector(tangent, -0.034).addScaledVector(radial, -0.008),
      centre.clone().addScaledVector(tangent, -0.028).addScaledVector(radial, 0.014).setY(0.963),
      centre.clone().addScaledVector(radial, 0.024).setY(0.969),
      centre.clone().addScaledVector(tangent, 0.028).addScaledVector(radial, 0.014).setY(0.963),
      centre.clone().addScaledVector(tangent, 0.034).addScaledVector(radial, -0.008),
    ]);
    b.sweep(gonadPath, 0.0065, {
      bone: bellCore,
      color: GONAD,
      section: { ngon: 6 },
      caps: "round",
      name: `gonad${i}`,
      group: "gonads",
    });
  }

  // Four faint radial highlights reinforce the glassy, translucent read without adding smooth geometry.
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 2;
    const d = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    b.sweep(
      polyline([
        d.clone().multiplyScalar(0.025).setY(0.952),
        d.clone().multiplyScalar(0.085).setY(0.934),
        d.clone().multiplyScalar(0.132).setY(0.885),
      ]),
      0.0025,
      { bone: bellCore, color: HIGHLIGHT, caps: "round", name: `bellHighlight${i}`, group: "bell" },
    );
  }

  const random = rng(18231);

  // The four oral arms are broad, visibly frilled tentacle chains, each with three side fronds.
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const radial = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const tangent = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const armPath = catmull([
      radial.clone().multiplyScalar(0.045).setY(0.825),
      radial.clone().multiplyScalar(0.066).addScaledVector(tangent, 0.012).setY(0.755),
      radial.clone().multiplyScalar(0.048).addScaledVector(tangent, 0.026).setY(0.695),
      radial.clone().multiplyScalar(0.02).addScaledVector(tangent, 0.01).setY(0.645),
      radial.clone().multiplyScalar(-0.012).addScaledVector(tangent, -0.018).setY(0.615),
    ]);
    const arm = b.chain(`oralArm${i}`, armPath, {
      parent: bellCore,
      names: [`oralArm${i}Base`, `oralArm${i}Mid`, `oralArm${i}Low`, `oralArm${i}Tip`],
      role: "tentacle",
      group: "oralArms",
    });
    b.sweep(arm, (t) => 0.014 * (1 - t) + 0.003, {
      color: ARM,
      section: { ngon: 7 },
      caps: "round",
      name: `oralArmTube${i}`,
      group: "oralArms",
    });

    for (let j = 0; j < 3; j += 1) {
      const t = 0.28 + j * 0.22;
      const origin = arm.at(t);
      const side = j % 2 === 0 ? 1 : -1;
      const length = 0.045 + random() * 0.025;
      const tip = origin.at
        .clone()
        .addScaledVector(tangent, side * length)
        .addScaledVector(radial, 0.012)
        .setY(origin.at.y - 0.018 - random() * 0.008);
      const frondPath = polyline([
        origin,
        origin.at
          .clone()
          .addScaledVector(tangent, side * length * 0.56)
          .setY(origin.at.y - 0.008),
        tip,
      ]);
      const frond = b.chain(`oralFrond${i}_${j}`, frondPath, {
        parent: arm.joints[Math.min(arm.joints.length - 1, j + 1)],
        names: [`oralFrond${i}_${j}Base`, `oralFrond${i}_${j}Tip`],
        role: "tentacle",
        group: "oralFrills",
      });
      b.sweep(frond, [0.0042, 0.001], {
        color: FRILL,
        section: { ngon: 6 },
        caps: "point",
        name: `oralFrill${i}_${j}`,
        group: "oralFrills",
      });
    }
  }

  // Many fine marginal bundles hang from the rim, with small deterministic variations in their drift.
  for (let i = 0; i < 18; i += 1) {
    const a = (i / 18) * Math.PI * 2;
    const radial = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const tangent = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const sway = (random() - 0.5) * 0.03;
    const base = radial.clone().multiplyScalar(0.151).setY(0.797);
    const p1 = radial.clone().multiplyScalar(0.158).addScaledVector(tangent, sway).setY(0.725);
    const p2 = radial
      .clone()
      .multiplyScalar(0.15)
      .addScaledVector(tangent, sway * 1.8)
      .setY(0.665);
    const tip = radial
      .clone()
      .multiplyScalar(0.142 + random() * 0.012)
      .addScaledVector(tangent, sway * 2.2)
      .setY(0.614 + random() * 0.012);
    const tentaclePath = polyline([base, p1, p2, tip]);
    const tentacle = b.chain(`marginalTentacle${i}`, tentaclePath, {
      parent: bellCore,
      names: [`marginal${i}Base`, `marginal${i}Mid`, `marginal${i}Tip`],
      role: "tentacle",
      group: "marginalTentacles",
    });
    b.sweep(tentacle, (t) => 0.0035 * (1 - t) + 0.0008, {
      color: FRILL,
      section: { ngon: 5 },
      caps: "point",
      name: `marginalBundle${i}`,
      group: "marginalTentacles",
    });
  }

  return b.root;
}
