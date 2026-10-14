import * as THREE from "three";
import { createBuilder, catmull, paint, mottle, stripes, rng } from "../../../../src/index";

export const meta = {
  name: "Seahorse",
  description: "A stylized low-poly seahorse with a curled prehensile tail, ringed body, crown, jointed snout and fins, gripping a coral stem.",
};

const BODY = "#e8a23c";
const BODY2 = "#cf7a28";
const DARK = "#8f4a1c";
const BELLY = "#f6d78e";
const FIN_A = "#f7cf78";
const FIN_B = "#e59a45";
const EYE = "#f2c230";
const BLACK = "#14110f";
const WHITE = "#ffffff";
const CORAL = "#e2606f";
const SAND = "#d9c79a";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "seahorse" });
  const rand = rng(11);

  // ---- skeleton ----
  const core = b.joint("hips", { at: [0, 0.09, 0], role: "spine" });
  const body = catmull([
    [0, 0.03, 0.0],
    [0, 0.036, 0.012],
    [0, 0.026, 0.024],
    [0, 0.012, 0.012],
    [0, 0.014, -0.008],
    [0, 0.035, -0.02],
    [0, 0.06, -0.018],
    [0, 0.09, 0],
    [0, 0.12, 0.008],
    [0, 0.145, 0.002],
    [0, 0.162, 0.006],
  ]);
  const rootT = body.closestT(core.at);
  const front = b.chain("neck", body.slice(rootT, 1), {
    parent: core,
    count: 4,
    role: "neck",
    names: (i: number) => `neck${i + 1}`,
  });
  const back = b.chain("tail", body.slice(rootT, 0), {
    parent: core,
    count: 6,
    role: "tail",
    names: (i: number) => `tail${i + 1}`,
  });

  const prof: number[][] = [
    [-0.17, 0.003],
    [-0.12, 0.006],
    [-0.06, 0.011],
    [0, 0.02],
    [0.03, 0.027],
    [0.055, 0.022],
    [0.075, 0.012],
    [0.095, 0.012],
  ];
  const radiusAt = (d: number) => {
    if (d <= prof[0][0]) return prof[0][1];
    for (let i = 1; i < prof.length; i++) {
      if (d <= prof[i][0]) {
        const k = (d - prof[i - 1][0]) / (prof[i][0] - prof[i - 1][0]);
        return prof[i - 1][1] + k * (prof[i][1] - prof[i - 1][1]);
      }
    }
    return prof[prof.length - 1][1];
  };

  const mot = mottle(BODY, BODY2, { size: 0.02, seed: 3 });
  const skinPaint = paint((_p, n, s) => {
    const d = (s[0] - rootT) * body.length;
    if (n.z > 0.4 && d > -0.03 && d < 0.075) return BELLY;
    const k = Math.floor(d / 0.007 + 100) % 2;
    return k === 0 ? DARK : mot;
  });

  const bodySweep = b.sweep(
    body,
    (t: number) => {
      const r = radiusAt((t - rootT) * body.length);
      return [r, r * 1.12] as [number, number];
    },
    { bone: [back, core, front], color: skinPaint, sides: 8, smooth: false },
  );

  // ---- head ----
  const head = b.joint("head", {
    parent: front.joints[front.joints.length - 1],
    at: body.at(1),
    dir: [0, -0.25, 1],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), BODY, {
    bone: head,
    at: head.local({ forward: 0.008, up: 0.002 }),
    scale: [0.9, 1.05, 1.2],
    flat: true,
  });
  // upper snout
  b.rod(head.local({ forward: 0.015, down: 0.002 }), head.local({ forward: 0.068, down: 0.012 }), [0.011, 0.006], {
    bone: head,
    color: BODY2,
    sides: 6,
  });
  // lower jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, down: 0.011 }),
    aim: head.local({ forward: 0.064, down: 0.018 }),
    role: "jaw",
  });
  b.rod(head.local({ forward: 0.022, down: 0.012 }), head.local({ forward: 0.064, down: 0.018 }), [0.0055, 0.0035], {
    bone: jaw,
    color: BODY,
    sides: 6,
  });
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.0165, forward: 0.014, up: 0.007 }),
    });
    b.part(new THREE.SphereGeometry(0.0048, 6, 4), BLACK, {
      bone: head,
      at: head.local({ left: s * 0.0222, forward: 0.0155, up: 0.0075 }),
    });
    b.part(new THREE.SphereGeometry(0.0014, 4, 3), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.0252, forward: 0.0175, up: 0.0095 }),
    });
    // cheek spine
    b.spike(
      head.local({ left: s * 0.014, forward: -0.004, down: 0.004 }),
      head.local({ left: s * 0.026, forward: -0.014, down: 0.006 }),
      null,
      0.004,
      { bone: head, color: DARK, sides: 5 },
    );
  }
  // crown
  for (let i = 0; i < 5; i++) {
    const h = 0.014 + 0.012 * (1 - Math.abs(i - 2) / 2.5);
    b.spike(
      head.local({ up: 0.017, forward: 0.014 - i * 0.0065 }),
      head.local({ up: 0.017 + h, forward: 0.006 - i * 0.0085 }),
      null,
      0.0042,
      { bone: head, color: i % 2 ? BODY2 : DARK, sides: 5 },
    );
  }

  // ---- body spines ----
  const surf = b.surface(bodySweep);
  for (let k = 0; k < 14; k++) {
    const d = -0.07 + (k / 13) * 0.14;
    const t = rootT + d / body.length;
    const hit = surf.around(body.at(t)).at(180, 0);
    if (hit) {
      const sz = 0.7 + 0.5 * Math.sin(((k + 0.5) / 14) * Math.PI);
      b.stick(new THREE.ConeGeometry(0.0045 * sz, 0.014 * sz, 5), k % 2 ? DARK : BODY2, hit, { embed: 0.2 });
    }
  }
  for (let k = 0; k < 8; k++) {
    const d = -0.02 + (k / 7) * 0.085;
    const t = rootT + d / body.length;
    const hit = surf.around(body.at(t)).at(0, 0);
    if (hit) b.stick(new THREE.SphereGeometry(0.0038 + rand() * 0.0006, 5, 4), DARK, hit, { embed: 0.4 });
  }

  // ---- fins ----
  b.extrude(
    [
      [0, 0],
      [0.022, 0.003],
      [0.027, 0.02],
      [0.019, 0.034],
      [0, 0.036],
    ],
    {
      at: [0, 0.062, -0.026],
      x: [0, 0, -1],
      thickness: 0.002,
      smoothing: 1,
      color: stripes(FIN_A, FIN_B, { size: 0.005, axis: "z" }),
      bone: core,
      name: "dorsalFin",
    },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.012, 0.01],
        [0.024, 0.004],
        [0.02, -0.01],
        [0.008, -0.016],
      ],
      {
        at: [s * 0.013, 0.122, -0.004],
        x: [0, 0, -1],
        y: [s * 0.35, 1, 0],
        thickness: 0.0016,
        smoothing: 1,
        color: stripes(FIN_A, FIN_B, { size: 0.004, axis: "z" }),
        bone: front.joints[1],
        name: s > 0 ? "pectoralFinL" : "pectoralFinR",
      },
    );
  }

  // ---- coral perch ----
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.04, 0.007],
      [0, 0.009],
    ],
    { at: [0, 0, 0.008], segments: 9, color: SAND, bone: core, name: "base" },
  );
  b.rod([0, 0.005, 0.008], [0, 0.075, 0.006], [0.007, 0.004], { color: CORAL, bone: core, sides: 6 });
  b.rod([0, 0.045, 0.007], [0.022, 0.07, 0.012], [0.004, 0.0025], { color: CORAL, bone: core, sides: 5 });
  b.rod([0, 0.05, 0.007], [-0.02, 0.078, 0.0], [0.004, 0.0025], { color: CORAL, bone: core, sides: 5 });
  b.part(new THREE.SphereGeometry(0.004, 5, 4), "#f08a96", { at: [0, 0.079, 0.006], bone: core });

  return b.root;
}
