import * as THREE from "three";
import { createBuilder, bezier, catmull, cells, mix, noise, paint, spiral } from "../../../../src/index";

export const meta = {
  name: "Garden Snail Adventurer",
  description: "A glossy caramel, chocolate and cream spiral-shelled garden snail with a pebbly grey-green body, long eye stalks and a ladybird hitching a ride.",
};

const BODY = "#7d9a80";
const BODY_DARK = "#56705c";
const BODY_LIGHT = "#a8c2a6";
const CARAMEL = "#c07a3a";
const CHOCO = "#5a3424";
const CREAM = "#f1e2c0";
const RED = "#d1302a";
const DARK = "#1d1a18";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "snail" });

  // Skeleton: a hips joint at the tail, then a body chain running to the head.
  const hips = b.joint("hips", { at: [0, 0.042, -0.05] });
  const body = b.chain(
    "body",
    catmull([
      [0, 0.042, -0.17],
      [0, 0.042, -0.06],
      [0, 0.044, 0.05],
      [0, 0.05, 0.14],
    ]),
    { parent: hips, count: 5, names: ["tail", "back", "mid", "neck", "head"], role: "spine" },
  );
  const back = body.joints[1];
  const head = body.joints[4];

  // Foot and body: pebbly grey-green skin, flat sole touching the floor.
  const bodyPaint = paint((p) => {
    const c = cells(p, 0.012);
    return c.d2 - c.d1 < 0.2 ? BODY_DARK : mix(BODY, BODY_LIGHT, noise(p, 0.06));
  });
  b.sweep(body, (t) => [0.02 + 0.03 * t, 0.042], { color: bodyPaint });

  // Shell: a spiral coil lying in the side plane, banded along its length.
  const center: [number, number, number] = [0, 0.16, -0.02];
  const coil = spiral(center, [0, 0.23, -0.02], [1, 0, 0], { turns: 2.2, r1: 0.02, pitch: 0.01 });
  const shellPaint = paint((_p, _n, s) => {
    const k = Math.floor(s[0] * 7) % 3;
    return k === 0 ? CARAMEL : k === 1 ? CHOCO : CREAM;
  });
  b.sweep(coil, (t) => 0.026 - 0.014 * t, { bone: back, color: shellPaint });

  // Solid whorl filling the middle of the coil.
  b.part(new THREE.SphereGeometry(0.062, 14, 10), CARAMEL, {
    bone: back,
    at: center,
    scale: [0.5, 1, 1],
  });

  // Ladybird perched on the top of the shell.
  const lady = b.part(new THREE.SphereGeometry(0.02, 10, 7), RED, {
    bone: back,
    at: [0, 0.264, -0.01],
    scale: [1, 0.6, 1.15],
  });
  b.part(new THREE.SphereGeometry(0.007, 6, 5), DARK, { bone: back, at: [0, 0.262, 0.017] });
  const ladyTop = b.surface(lady);
  const spots: [number, number][] = [
    [-70, 35],
    [-25, 60],
    [25, 60],
    [70, 35],
    [-130, 30],
    [130, 30],
  ];
  for (const [az, el] of spots) {
    const hit = ladyTop.around().at(az, el);
    if (hit) b.stick(new THREE.SphereGeometry(0.0045, 6, 4), DARK, hit, { embed: 0.4 });
  }

  // Eye stalks with black eyes, and short feelers below them.
  for (const s of [1, -1]) {
    const stalk = bezier(
      head.local({ left: s * 0.025, up: 0.035, forward: 0.01 }),
      head.local({ left: s * 0.035, up: 0.085, forward: 0.02 }),
      head.local({ left: s * 0.04, up: 0.14, forward: 0.03 }),
      head.local({ left: s * 0.045, up: 0.17, forward: 0.035 }),
    );
    b.sweep(stalk, [0.011, 0.006], { bone: head, color: BODY });

    const tip = head.local({ left: s * 0.045, up: 0.17, forward: 0.035 });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), DARK, { bone: head, at: tip });
    b.part(new THREE.SphereGeometry(0.005, 5, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.05, up: 0.178, forward: 0.048 }),
    });

    const feeler = bezier(
      head.local({ left: s * 0.02, up: 0.02, forward: 0.05 }),
      head.local({ left: s * 0.03, up: 0.05, forward: 0.08 }),
      head.local({ left: s * 0.03, up: 0.05, forward: 0.13 }),
    );
    b.sweep(feeler, [0.008, 0.003], { bone: head, color: BODY });
  }

  return b.root;
}
