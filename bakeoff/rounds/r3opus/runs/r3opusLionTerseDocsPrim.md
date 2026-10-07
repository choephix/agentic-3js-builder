```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  limb,
  lerp,
  offset,
  polyline,
  catmull,
  countershade,
  mottle,
} from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description:
    "A stylized, rigged male lion. It is built from faceted primitives: a chunky layered mane of five-sided tufts, an amber-eyed face with tear marks and whisker pads, a hinged jaw with fangs, and a tufted tail. It stands in a neutral rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const R = rng(1977) as unknown;
  const rand = (): number =>
    typeof R === "function" ? (R as () => number)() : (R as { next: () => number }).next();

  // ---------- palette ----------
  const TAWNY = "#c98d45";
  const TAWNY2 = "#b4772f";
  const TAWNY_DK = "#9c6228";
  const CREAM = "#ecd3a2";
  const MUZ = "#f3e4c4";
  const DARK = "#2b1a10";
  const MANE_DK = "#5b2c12";
  const MANE = "#8c4a1d";
  const MANE_LT = "#c07a30";
  const NOSE = "#7b3a2c";
  const AMBER = "#e3a51f";
  const IVORY = "#f6efdc";
  const EAR_IN = "#e8c7a0";

  const coat = countershade(mottle(TAWNY, TAWNY2, { size: 0.22, seed: 3 }), CREAM, { level: -0.35 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.95, -0.55], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.95, -0.55],
      [0, 0.97, -0.2],
      [0, 0.98, 0.15],
      [0, 0.99, 0.5],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.0, 0.5],
      [0, 1.13, 0.69],
      [0, 1.27, 0.88],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.27, 0.88], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.085 }),
    aim: head.local({ forward: 0.26, down: 0.115 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.66],
      [0, 0.9, -0.95],
      [0, 0.74, -1.2],
      [0, 0.62, -1.45],
      [0, 0.6, -1.66],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.94, -0.74], w: 0.3, h: 0.34 },
      { at: [0, 0.95, -0.52], w: 0.42, h: 0.46 },
      { at: [0, 0.97, -0.2], w: 0.38, h: 0.4 },
      { at: [0, 0.93, 0.15], w: 0.44, h: 0.56 },
      { at: [0, 0.92, 0.45], w: 0.48, h: 0.64 },
      { at: [0, 0.96, 0.68], w: 0.38, h: 0.5 },
    ],
    { bone: [hips, spine], color: coat },
  );
  b.sweep(neck, [0.18, 0.15], { color: coat });

  // belly fringe
  for (const z of [0.05, 0.18, 0.31, 0.44]) {
    b.spike([0, 0.68, z], [0, -1, -0.45], 0.1, 0.04, {
      color: z > 0.25 ? MANE : MANE_LT,
      section: { ngon: 5 },
    });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.17;

    // front leg
    const fp = limb([x, 0.92, 0.5], [x, 0.14, 0.55], [0.42, 0.4], [[0, 0, -1]]);
    const fToe = new THREE.Vector3(x, 0.05, 0.66);
    const front = b.chain(`legF${side}`, polyline([...fp, fToe]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
      contact: [x, 0, 0.66],
    });
    b.sweep(front, [0.1, 0.078, 0.062, 0.055, 0.05], { color: coat });
    // shoulder blade muscle
    b.part(new THREE.SphereGeometry(0.15, 8, 6), coat, {
      bone: front.joints[0],
      at: lerp(fp[0], fp[1], 0.3),
      scale: [0.65, 1.25, 1],
      flat: true,
    });
    // elbow tuft
    b.spike(fp[1], [0, -0.3, -1], 0.12, 0.035, { bone: front.joints[1], color: TAWNY_DK, section: { ngon: 4 } });
    buildPaw(front.joints[front.joints.length - 1], x, 0.64);

    // hind leg
    const hx = s * 0.15;
    const hp = limb(
      [hx, 0.9, -0.55],
      [hx, 0.12, -0.66],
      [0.36, 0.32, 0.26],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hToe = new THREE.Vector3(hx, 0.05, -0.52);
    const hind = b.chain(`legH${side}`, polyline([...hp, hToe]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`, `toe${side}`],
      role: "leg",
      contact: [hx, 0, -0.52],
    });
    b.sweep(hind, [0.12, 0.09, 0.062, 0.055, 0.05], { color: coat });
    // haunch
    b.part(new THREE.SphereGeometry(0.17, 8, 6), coat, {
      bone: hind.joints[0],
      at: lerp(hp[0], hp[1], 0.35),
      scale: [0.7, 1.25, 1.05],
      flat: true,
    });
    buildPaw(hind.joints[hind.joints.length - 1], hx, -0.54);
  }

  function buildPaw(bone: ReturnType<typeof b.joint>, x: number, z: number) {
    b.part(new THREE.SphereGeometry(0.08, 8, 6), TAWNY, {
      bone,
      at: [x, 0.045, z],
      scale: [1, 0.56, 1.2],
      flat: true,
    });
    for (const dx of [-0.045, -0.015, 0.015, 0.045]) {
      b.part(new THREE.SphereGeometry(0.027, 6, 4), CREAM, {
        bone,
        at: [x + dx, 0.027, z + 0.075],
        flat: true,
      });
    }
  }

  // ---------- tail ----------
  b.sweep(tail, [0.055, 0.042, 0.028], { color: coat });
  const tip = tail.at(1);
  b.part(new THREE.SphereGeometry(0.07, 7, 5), MANE_DK, { frame: tip, scale: [1, 1.5, 1], flat: true });
  b.ring(tail.at(0.96), { count: 6, radius: 0.03, tilt: 50 }, (it) =>
    b.spike(it, it, 0.1, 0.03, { color: MANE_DK, section: { ngon: 4 } }),
  );

  // ---------- mane ----------
  const n1 = neck.joints[0];
  const maneC = new THREE.Vector3(0, 1.17, 0.72);
  b.part(new THREE.SphereGeometry(0.3, 9, 7), MANE_DK, {
    bone: n1,
    at: maneC,
    scale: [1, 1.0, 0.7],
    flat: true,
  });
  const layers = [
    { shift: 0.07, radius: 0.24, count: 14, tilt: -35, len: 0.19, r: 0.07, cols: [MANE_LT, MANE] },
    { shift: -0.03, radius: 0.27, count: 16, tilt: -55, len: 0.25, r: 0.08, cols: [MANE, MANE_LT] },
    { shift: -0.14, radius: 0.24, count: 14, tilt: -78, len: 0.27, r: 0.08, cols: [MANE_DK, MANE] },
  ];
  layers.forEach((L, li) => {
    const c = n1.moved(offset(maneC, n1, L.shift));
    b.ring(c, { count: L.count, radius: L.radius, tilt: L.tilt, fromDeg: li * 11, toDeg: 360 + li * 11 }, (it) =>
      b.spike(it, it, L.len * (0.85 + 0.3 * rand()), L.r, {
        color: L.cols[it.i % 2],
        section: { ngon: 5 },
      }),
    );
  });
  // inner ruff framing the face
  b.ring(head.moved(head.local({ forward: 0.06 })), { count: 12, radius: 0.16, tilt: -20 }, (it) =>
    b.spike(it, it, 0.12 * (0.85 + 0.3 * rand()), 0.045, {
      color: it.i % 2 ? MANE_LT : "#d08f42",
      section: { ngon: 5 },
    }),
  );

  // ---------- head ----------
  const hpart = (geo: THREE.BufferGeometry, color: string, p: THREE.Vector3, scale?: [number, number, number]) =>
    b.part(geo, color, { bone: head, frame: head.moved(p), scale: scale ?? [1, 1, 1], flat: true });

  // cranium
  b.part(new THREE.SphereGeometry(0.14, 8, 6), coat, {
    bone: head,
    at: head.local({ forward: 0.05, up: 0.05 }),
    scale: [1.05, 0.95, 1.0],
    flat: true,
  });
  // brow ridge
  hpart(new THREE.BoxGeometry(0.2, 0.06, 0.045), TAWNY_DK, head.local({ forward: 0.155, up: 0.085 }));
  // forelock
  for (const k of [-1, 0, 1]) {
    b.spike(head.local({ left: k * 0.05, up: 0.15, forward: 0.03 }), [k * 0.3, 1, -0.6], 0.12, 0.04, {
      bone: head,
      color: MANE_LT,
      section: { ngon: 5 },
    });
  }
  // muzzle + nose bridge
  b.frustumBox(
    head.local({ forward: 0.12, down: 0.03 }),
    head.local({ forward: 0.27, down: 0.05 }),
    [0.17, 0.13],
    [0.13, 0.1],
    { bone: head, color: MUZ },
  );
  b.frustumBox(
    head.local({ forward: 0.1, up: 0.06 }),
    head.local({ forward: 0.27, up: 0.005 }),
    [0.09, 0.05],
    [0.07, 0.04],
    { bone: head, color: TAWNY },
  );
  hpart(new THREE.SphereGeometry(0.04, 6, 4), NOSE, head.local({ forward: 0.285, up: 0.0 }), [1.25, 0.8, 0.65]);

  // lower jaw + chin
  const jawEnd = jaw.local({ forward: 0.19 });
  b.frustumBox(jaw.at, jawEnd, [0.12, 0.06], [0.09, 0.045], { bone: jaw, color: MUZ });
  b.spike(jaw.local({ forward: 0.12, down: 0.02 }), [0, -1, -0.5], 0.07, 0.03, {
    bone: jaw,
    color: CREAM,
    section: { ngon: 4 },
  });

  for (const s of [1, -1]) {
    // eyes
    hpart(new THREE.SphereGeometry(0.031, 6, 4), DARK, head.local({ left: s * 0.066, up: 0.045, forward: 0.155 }));
    hpart(new THREE.SphereGeometry(0.024, 8, 6), AMBER, head.local({ left: s * 0.066, up: 0.046, forward: 0.168 }));
    hpart(new THREE.SphereGeometry(0.011, 6, 4), DARK, head.local({ left: s * 0.066, up: 0.047, forward: 0.19 }));
    hpart(new THREE.SphereGeometry(0.005, 4, 3), "#ffffff", head.local({ left: s * 0.06, up: 0.056, forward: 0.192 }));
    // tear marks
    b.capsule(
      head.local({ left: s * 0.045, up: 0.025, forward: 0.18 }),
      head.local({ left: s * 0.058, down: 0.03, forward: 0.235 }),
      0.006,
      { bone: head, color: DARK },
    );
    // whisker pads + dots + whiskers
    hpart(new THREE.SphereGeometry(0.052, 7, 5), MUZ, head.local({ left: s * 0.045, forward: 0.25, down: 0.065 }));
    for (let k = 0; k < 3; k++) {
      hpart(
        new THREE.SphereGeometry(0.006, 4, 3),
        DARK,
        head.local({ left: s * (0.06 + k * 0.012), forward: 0.285 - k * 0.012, down: 0.055 + k * 0.012 }),
      );
      b.rod(
        head.local({ left: s * 0.08, forward: 0.27, down: 0.06 + k * 0.015 }),
        head.local({ left: s * 0.22, forward: 0.29 - k * 0.03, down: 0.035 + k * 0.035 }),
        0.0025,
        { bone: head, color: IVORY, sides: 4 },
      );
    }
    // fangs
    b.spike(head.local({ left: s * 0.042, forward: 0.265, down: 0.095 }), [0, -1, 0.1], 0.04, 0.011, {
      bone: head,
      color: IVORY,
      section: { ngon: 5 },
    });
    b.spike(jaw.local({ left: s * 0.03, forward: 0.16, up: 0.02 }), [0, 1, 0.1], 0.025, 0.008, {
      bone: jaw,
      color: IVORY,
      section: { ngon: 5 },
    });
    // ears
    const earAt = head.local({ left: s * 0.11, up: 0.13, forward: 0.03 });
    b.part(new THREE.CylinderGeometry(0.05, 0.056, 0.03, 8), TAWNY_DK, {
      bone: head,
      at: earAt,
      dir: [s * 0.25, 0.2, 1],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.032, 0.034, 0.02, 8), EAR_IN, {
      bone: head,
      at: offset(earAt, [s * 0.25, 0.2, 1], 0.012),
      dir: [s * 0.25, 0.2, 1],
      flat: true,
    });
  }

  return b.root;
}
```