```ts
import * as THREE from "three";
import { catmull, createBuilder, limb, paint, rng, scales } from "agentic-3js-builder";

export const meta = {
  name: "armadillo",
  description:
    "A nine-banded armadillo at rest: a domed shell with nine banded rings, a pointed snout, stubby legs with long foreclaws and a ringed tail.",
};

// Warm tan shell, pale banded middle, pink snout and paws, ivory claws.
const SHELL_A = "#9b8874";
const SHELL_B = "#86735f";
const SHELL_C = "#b09d89";
const SCUTE = "#554435";
const BAND = "#dcbfab";
const BAND_LINE = "#6b5748";
const BELLY = "#ebd3c5";
const SNOUT = "#eba8a0";
const NOSE = "#b46a66";
const EAR = "#d89a8f";
const EYE = "#1d1815";
const GLINT = "#f6f1e8";
const CLAW = "#efe5cb";
const LEG = "#8d7b69";
const PAD = "#d69c90";
const TAIL_A = "#8b7a68";
const TAIL_B = "#cfb8a0";
const STUD = "#c6b29c";

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---- paints
  const shieldScales = scales([SHELL_A, SHELL_B, SHELL_C], SCUTE, { size: 0.024, seed: 3 });
  const rumpScales = scales([SHELL_B, SHELL_A], SCUTE, { size: 0.022, seed: 5 });
  const headScales = scales([SHELL_A, SHELL_C], SCUTE, { size: 0.016, seed: 8 });

  const shellPaint = paint((p, n) => {
    if (n.y < -0.6) return BELLY;
    if (p.z > 0) return shieldScales;
    if (p.z < -0.095) return rumpScales;
    return BAND;
  });
  const headPaint = paint((p, n) => {
    if (n.y < -0.5) return BELLY;
    if (p.z > 0.25) return SNOUT;
    return headScales;
  });
  const tailPaint = paint((_p, _n, s) => (Math.floor(s[0] * 18) % 2 === 0 ? TAIL_A : TAIL_B));

  // ---- skeleton: hips, back, shoulders, neck tip
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.1, -0.2],
      [0, 0.11, -0.04],
      [0, 0.115, 0.08],
      [0, 0.12, 0.15],
    ]),
    { names: ["hips", "back", "shoulders", "neck"], role: "spine" },
  );
  const hips = spine.joints[0];
  const shoulders = spine.joints[2];
  const neck = spine.joints[3];

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.121, 0.16],
    aim: [0, 0.095, 0.36],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.07, 0.17],
    aim: [0, 0.072, 0.32],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.097, -0.22],
      [0, 0.09, -0.3],
      [0, 0.082, -0.38],
      [0, 0.076, -0.45],
      [0, 0.08, -0.5],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  // ---- shell: one domed loft over the spine, with nine band rings and scute paint
  const shell = b.loft(
    [
      { at: [0, 0.12, 0.14], w: 0.13, h: 0.095 },
      { at: [0, 0.118, 0.06], w: 0.2, h: 0.11 },
      { at: [0, 0.116, 0], w: 0.2, h: 0.115 },
      { at: [0, 0.112, -0.06], w: 0.2, h: 0.115 },
      { at: [0, 0.108, -0.12], w: 0.19, h: 0.11 },
      { at: [0, 0.1, -0.18], w: 0.15, h: 0.095 },
      { at: [0, 0.095, -0.22], w: 0.1, h: 0.075 },
    ],
    { bone: spine, color: shellPaint },
  );
  const shellSkin = b.surface(shell);

  // ten seams around the shell give the nine movable bands
  for (let k = 0; k < 10; k++) {
    const ring = shellSkin.loop([0, 0.115, -k * 0.0105], { dir: [0, 0, 1], lift: 0.0015 });
    b.sweep(ring, 0.0032, { color: BAND_LINE });
  }

  // small osteoderm studs on the two shields
  for (const hit of shellSkin.scatter(44, {
    rng: rng(11),
    minDist: 0.024,
    filter: (h) => h.n.y > 0.2 && (h.at.z > 0 || h.at.z < -0.1),
  })) {
    b.stick(new THREE.SphereGeometry(0.0045, 5, 4), STUD, hit, { embed: 0.4 });
  }

  // ---- head: a flat shield tapering into a pointed snout
  const skull = b.loft(
    [
      { at: [0, 0.122, 0.13], w: 0.105, h: 0.09 },
      { at: [0, 0.12, 0.18], w: 0.11, h: 0.095 },
      { at: [0, 0.114, 0.23], w: 0.08, h: 0.08 },
      { at: [0, 0.104, 0.27], w: 0.05, h: 0.05 },
      { at: [0, 0.098, 0.305], w: 0.022, h: 0.024 },
    ],
    { bone: head, color: headPaint },
  );
  const headSkin = b.surface(skull);
  for (const hit of headSkin.scatter(10, {
    rng: rng(21),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.3 && h.at.z < 0.22,
  })) {
    b.stick(new THREE.SphereGeometry(0.004, 5, 4), STUD, hit, { embed: 0.4 });
  }
  b.part(new THREE.SphereGeometry(0.016, 8, 6), NOSE, { bone: head, at: [0, 0.099, 0.31] });

  // lower jaw, its own joint so it can open
  b.loft(
    [
      { at: [0, 0.068, 0.17], w: 0.06, h: 0.018 },
      { at: [0, 0.07, 0.25], w: 0.04, h: 0.015 },
      { at: [0, 0.075, 0.29], w: 0.02, h: 0.012 },
    ],
    { bone: jaw, color: BELLY },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // eyes with a catch-light, and a rounded ear standing up and back
    b.part(new THREE.SphereGeometry(0.011, 8, 6), EYE, { bone: head, at: [s * 0.047, 0.132, 0.2] });
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), GLINT, { bone: head, at: [s * 0.055, 0.136, 0.206] });

    const ear: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ear.push([Math.cos(a) * 0.018, Math.sin(a) * 0.024]);
    }
    b.extrude(ear, {
      at: [s * 0.05, 0.16, 0.15],
      x: [0, 0, 1],
      y: [0, 1, -0.25],
      thickness: 0.006,
      bevel: 0.002,
      color: EAR,
      bone: head,
    });

    // front leg: shoulder, elbow, wrist, paw; the paw lies flat, heel to toe
    const fore = limb(
      [s * 0.075, 0.075, 0.06],
      [s * 0.1, 0.013, 0.115],
      [0.07, 0.065, 0.035],
      [[0, 0, -1]],
      { sole: [0, 0, 1] },
    );
    const foreLeg = b.chain(`foreLeg${side}`, fore, {
      parent: shoulders,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
    });
    b.sweep(foreLeg, (t) => 0.024 - 0.016 * t, { color: LEG });

    const paw = foreLeg.joints[3];
    b.part(new THREE.SphereGeometry(1, 8, 5).scale(0.026, 0.009, 0.024), PAD, {
      bone: paw,
      at: [s * 0.1, 0.009, 0.0975],
    });
    for (const k of [-0.016, -0.0055, 0.0055, 0.016]) {
      const len = Math.abs(k) > 0.01 ? 0.022 : 0.03;
      b.spike([s * 0.1 + k, 0.017, 0.118], [0, -0.35, 0.94], len, 0.0062, {
        bone: paw,
        color: CLAW,
      });
    }

    // hind leg: hip, knee forward, ankle, toe; plantigrade foot
    const hind = limb(
      [s * 0.085, 0.085, -0.15],
      [s * 0.09, 0.015, -0.05],
      [0.085, 0.075, 0.05],
      [[0, 0, 1]],
      { sole: [0, 0, 1] },
    );
    const hindLeg = b.chain(`hindLeg${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
    });
    b.sweep(hindLeg, (t) => 0.03 - 0.02 * t, { color: LEG });

    const toe = hindLeg.joints[3];
    b.part(new THREE.SphereGeometry(1, 8, 5).scale(0.03, 0.011, 0.028), PAD, {
      bone: toe,
      at: [s * 0.09, 0.011, -0.075],
    });
    for (const k of [-0.013, -0.0045, 0.0045, 0.013]) {
      b.spike([s * 0.09 + k, 0.015, -0.047], [0, -0.25, 0.97], 0.014, 0.0042, {
        bone: toe,
        color: CLAW,
      });
    }
  }

  // ---- tail: tapering, with bony rings painted along its length
  b.sweep(tail, (t) => 0.024 - 0.016 * t, { color: tailPaint });

  return b.root;
}
```