```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, limb, rng, stripes } from "agentic-3js-builder";

const SHELL = "#9a7452";
const SHELL_DARK = "#6b4c33";
const BELLY = "#e8d3ad";
const HEAD = "#b8926a";
const LEG = "#7d5d42";
const CLAW = "#f1e7cf";
const SNOUT = "#c99a86";
const DARK = "#241c18";
const EAR = "#c99a86";

export const meta = {
  name: "armadillo",
  description: "A nine-banded armadillo in a rest pose: banded shell, pale belly, scaly tail, clawed feet.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.17, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.17, -0.1],
      [0, 0.18, 0.05],
      [0, 0.2, 0.22],
      [0, 0.24, 0.36],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine, at: [0, 0.25, 0.4], dir: [0, 0.2, 1], role: "head" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.17, -0.1],
      [0, 0.14, -0.28],
      [0, 0.11, -0.46],
      [0, 0.1, -0.6],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // Shell and belly: banded rings round the body, pale underneath
  const sine = (t: number) => Math.sin(Math.PI * t);
  const bandPaint = stripes(SHELL, SHELL_DARK, { size: 0.045, axis: "z" });
  const bodyPaint = countershade(bandPaint, BELLY, { level: -0.15 });
  const body = b.sweep(spine, (t) => [0.07 + 0.03 * sine(t), 0.06 + 0.03 * sine(t)], { color: bodyPaint });

  // Head: tapered snout
  b.sweep(
    catmull([
      [0, 0.25, 0.4],
      [0, 0.262, 0.48],
      [0, 0.25, 0.55],
    ]),
    [0.075, 0.028],
    { bone: head, color: HEAD },
  );
  b.part(new THREE.SphereGeometry(0.022, 8, 6), DARK, { bone: head, at: [0, 0.25, 0.56] });

  for (const s of [1, -1]) {
    // Eyes
    b.part(new THREE.SphereGeometry(0.016, 6, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.045, up: 0.035, forward: 0.08 }),
    });
    // Ears
    b.spike([s * 0.05, 0.315, 0.39], [s * 0.25, 0.9, -0.4], 0.04, 0.02, { color: EAR, bone: head });
  }

  // Legs: front knees forward, rear hocks back, feet planted on the floor
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    const front = limb([s * 0.085, 0.16, 0.2], [s * 0.1, 0.02, 0.23], [0.08, 0.08], [0, 0, 1]);
    const fl = b.chain(`legF${S}`, front, {
      parent: hips,
      names: [`hipF${S}`, `kneeF${S}`, `ankleF${S}`],
      role: "leg",
    });
    b.sweep(fl, [0.032, 0.022], { color: LEG });
    const ftip = fl.tip!;
    b.part(new THREE.BoxGeometry(0.07, 0.03, 0.1), LEG, { bone: ftip, at: [s * 0.1, 0.015, 0.25] });
    for (const dx of [-0.025, 0, 0.025])
      b.spike([s * 0.1 + dx, 0.012, 0.3], [0, -0.15, 1], 0.028, 0.008, { color: CLAW, bone: ftip });

    const rear = limb([s * 0.085, 0.16, -0.12], [s * 0.1, 0.02, -0.1], [0.08, 0.08], [0, 0, -1]);
    const rl = b.chain(`legR${S}`, rear, {
      parent: hips,
      names: [`hipR${S}`, `kneeR${S}`, `ankleR${S}`],
      role: "leg",
    });
    b.sweep(rl, [0.034, 0.024], { color: LEG });
    const rtip = rl.tip!;
    b.part(new THREE.BoxGeometry(0.08, 0.03, 0.1), LEG, { bone: rtip, at: [s * 0.1, 0.015, -0.1] });
    for (const dx of [-0.025, 0, 0.025])
      b.spike([s * 0.1 + dx, 0.012, -0.05], [0, -0.15, 1], 0.028, 0.008, { color: CLAW, bone: rtip });
  }

  // Tail: scaly, ringed, pointed tip
  const tailPaint = stripes(SHELL, SHELL_DARK, { size: 0.05, axis: "z" });
  b.sweep(tail, (t) => 0.05 * (1 - t) + 0.012, { color: tailPaint, caps: { end: "point" } });

  // Scutes: small hex plates stuck over the shell
  const shell = b.surface(body);
  const scutes = shell.scatter(90, {
    rng: rng(7),
    minDist: 0.03,
    filter: (h) => h.n.y > -0.2 && h.at.z > -0.15 && h.at.z < 0.25,
  });
  for (const h of scutes) b.stick(new THREE.CylinderGeometry(0.011, 0.013, 0.005, 6), SHELL_DARK, h, { embed: 0.4 });

  return b.root;
}
```