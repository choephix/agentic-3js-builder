```ts
import * as THREE from "three";
import { createBuilder, limb, paint, scales, stripes, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Nine-banded Armadillo",
  description: "A stylized armadillo with a banded carapace, long snout, tall ears, armored tail and a rigged skeleton.",
};

const SKIN = "#9c8872";
const SHELL = "#8c7b68";
const SHELL_DARK = "#5e5246";
const BELLY = "#d8c3a8";
const PINK = "#c98f86";
const CLAW = "#e8dcc4";
const BLACK = "#1a1512";

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.17, -0.17], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.17, -0.17],
      [0, 0.19, 0],
      [0, 0.19, 0.15],
      [0, 0.175, 0.25],
    ],
    { parent: hips, count: 4, role: "spine" },
  );
  const lastSpine = spine.joints[spine.joints.length - 1];

  const neck = b.joint("neck", { parent: lastSpine, at: [0, 0.18, 0.23], aim: [0, 0.175, 0.31], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.175, 0.31], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, down: 0.03 }),
    aim: head.local({ forward: 0.16, down: 0.04 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    [
      [0, 0.15, -0.2],
      [0, 0.11, -0.4],
      [0, 0.05, -0.56],
      [0, 0.02, -0.72],
    ],
    { parent: hips, count: 4, role: "tail" },
  );

  // ---- body ----
  const shell = countershade(SHELL, BELLY, { level: -0.15 });
  const body = b.sweep(spine, (t) => [0.07 + 0.035 * Math.sin(Math.PI * t), 0.075 + 0.02 * Math.sin(Math.PI * t)], {
    color: shell,
    caps: "round",
  });

  // shoulder and pelvic shields
  const domeGeo = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const plates = scales(SHELL, SHELL_DARK, { size: 0.028 });
  b.part(domeGeo, plates, { bone: spine.joints[2], at: [0, 0.17, 0.19], scale: [0.108, 0.105, 0.075], flat: true });
  b.part(domeGeo, plates, { bone: spine.joints[0], at: [0, 0.165, -0.14], scale: [0.108, 0.105, 0.07], flat: true });

  // movable bands
  const skin = b.surface(body);
  for (let i = 0; i < 9; i++) {
    const z = -0.05 + i * 0.0175;
    const loop = skin.loop([0, 0.18, z], { dir: [0, 0, 1], lift: 0.004 });
    const top = loop.slice(0.78, 1).concat(loop.slice(0, 0.22));
    b.sweep(top, 0.005, { color: SHELL_DARK, sides: 5 });
  }

  // neck
  b.rod(neck.at, head.at, 0.06, { bone: neck, color: SKIN });

  // ---- head ----
  b.part(new THREE.SphereGeometry(1, 8, 6), scales(SHELL, SHELL_DARK, { size: 0.02 }), {
    bone: head,
    at: head.local({ forward: 0.035, up: 0.005 }),
    scale: [0.055, 0.05, 0.07],
    flat: true,
  });
  const snoutEnd = head.local({ forward: 0.2, down: 0.03 });
  b.rod(head.local({ forward: 0.04 }), snoutEnd, [0.04, 0.016], { bone: head, color: "#b59c86", sides: 6 });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), PINK, { bone: head, at: snoutEnd });
  // lower jaw
  b.rod(jaw.at, head.local({ forward: 0.17, down: 0.045 }), [0.026, 0.01], { bone: jaw, color: "#d2bfa6", sides: 6 });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.01, 6, 4), BLACK, {
      bone: head,
      at: head.local({ right: s * 0.048, up: 0.025, forward: 0.075 }),
    });
    // tall ears
    b.part(new THREE.ConeGeometry(0.03, 0.1, 5), SKIN, {
      bone: head,
      at: head.local({ right: s * 0.042, up: 0.055, forward: 0.0 }),
      dir: [-s * 0.35, 1, -0.25],
      scale: [1, 1, 0.4],
    });
    b.part(new THREE.ConeGeometry(0.018, 0.07, 5), PINK, {
      bone: head,
      at: head.local({ right: s * 0.044, up: 0.056, forward: 0.008 }),
      dir: [-s * 0.35, 1, -0.25],
      scale: [1, 1, 0.3],
    });
  }

  // ---- tail ----
  b.sweep(tail, (t) => 0.042 * (1 - t) + 0.01, {
    color: stripes(SHELL, SHELL_DARK, { size: 0.03, axis: "z" }),
    caps: "round",
    sides: 6,
  });

  // ---- legs ----
  const legs: [string, number, number, number, number, boolean][] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legs.push(["F" + side, s, 0.17, 0.2, 0.09, true]);
    legs.push(["H" + side, s, -0.2, -0.17, 0.1, false]);
  }
  for (const [tag, s, hz, fz, len, front] of legs) {
    const hipY = front ? 0.15 : 0.14;
    const pts = limb([s * 0.08, hipY, hz], [s * 0.09, 0.025, fz], [len, len], [0, 0, front ? -1 : 1]);
    const names = front
      ? [`shoulder${tag}`, `elbow${tag}`, `hand${tag}`]
      : [`hip${tag}`, `knee${tag}`, `foot${tag}`];
    const leg = b.chain(`leg${tag}`, pts, {
      parent: front ? spine.joints[2] : spine.joints[0],
      names,
      role: "leg",
    });
    b.sweep(leg, [0.036, 0.02], { color: SKIN, sides: 6 });
    const tip = leg.tip!;
    const fx = s * 0.09;
    b.part(new THREE.BoxGeometry(0.05, 0.02, 0.07), SKIN, { bone: tip, at: [fx, 0.01, fz + 0.02] });
    for (const i of [-1, 0, 1]) {
      b.spike([fx + i * 0.017, 0.015, fz + 0.05], [0, -0.2, 1], front ? 0.045 : 0.032, 0.009, {
        color: CLAW,
        bone: tip,
        sides: 5,
      });
    }
  }

  return b.root;
}
```