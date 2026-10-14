import * as THREE from "three";
import { createBuilder, rng, catmull, limb, countershade, mottle, paint, noise } from "../../../../src/index";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old lion standing tall with his head held high: a huge layered shaggy mane fading from golden blond at the face to dark chocolate at the edges, tawny coat with a cream belly and muzzle, heavy-lidded amber eyes, a broad black nose, a scar across one brow, big padded paws and a long tail with a dark tuft.",
};

const TAWNY = "#c99140";
const TAWNY_D = "#a87130";
const CREAM = "#f0dcb2";
const BLOND = "#f2cb6a";
const GOLD = "#dc9d3c";
const OCHRE = "#a9652a";
const BROWN = "#6c391b";
const CHOC = "#3b1d0f";
const DARK = "#1b1310";
const NOSE = "#221816";
const AMBER = "#eaa21c";
const WHITE = "#fff8ea";
const SCAR = "#dc917f";
const IVORY = "#efe5cc";
const EAR_IN = "#5a3626";
const PAD = "#d9ad66";

export default function build() {
  const b = createBuilder({ name: "lion", paintSize: 2048 });
  const r0: any = rng(11);
  const R: () => number = typeof r0 === "function" ? r0 : () => r0.next();

  const coat = countershade(mottle(TAWNY, TAWNY_D, { size: 0.35, contrast: 0.5, seed: 2 }), CREAM, { level: -0.35 });

  // ---------------- skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.95, -0.55] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.96, -0.42],
      [0, 0.99, -0.05],
      [0, 1.02, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.02, 0.3],
      [0, 1.22, 0.5],
      [0, 1.42, 0.68],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.42, 0.68], dir: [0, 0, 1], role: "head" });
  type W = { left?: number; up?: number; down?: number; forward?: number; back?: number };
  const H = (o: W) => head.local(o);
  const jaw = b.joint("jaw", { parent: head, at: H({ forward: 0.08, down: 0.07 }), dir: [0, -0.1, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.92, -0.8],
      [0, 0.84, -1.0],
      [0, 0.64, -1.2],
      [0, 0.48, -1.45],
      [0, 0.44, -1.72],
      [0, 0.52, -1.92],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );

  // ---------------- mane paint & tuft helper ----------------
  const FACE = H({ forward: 0.1 });
  const manePaint = paint((p: any) => {
    const d =
      Math.hypot(p.x - FACE.x, p.y - FACE.y, p.z - FACE.z) + (noise(p, 0.06, 5) - 0.5) * 0.09;
    return d < 0.21 ? BLOND : d < 0.27 ? GOLD : d < 0.34 ? OCHRE : d < 0.43 ? BROWN : CHOC;
  });
  const tuft = (base: any, dir: any, len: number, r: number, bone: any, color: any = manePaint, sides = 5) => {
    const d = new THREE.Vector3(dir.x, dir.y, dir.z).normalize();
    const at = new THREE.Vector3(base.x, base.y, base.z).addScaledVector(d, -0.18 * len);
    b.part(new THREE.ConeGeometry(r, len, sides, 1).translate(0, len / 2, 0), color, {
      at,
      dir: d,
      bone,
      flat: true,
    });
  };
  const jit = (v: any, k = 0.25) =>
    new THREE.Vector3(v.x + (R() - 0.5) * k, v.y + (R() - 0.5) * k + 0.05, v.z + (R() - 0.5) * k);

  // ---------------- body ----------------
  const keys = [
    [0, 0.17, 0.19],
    [0.15, 0.24, 0.27],
    [0.5, 0.235, 0.28],
    [0.8, 0.27, 0.33],
    [1, 0.22, 0.27],
  ];
  const bodyR = (t: number): [number, number] => {
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], c = keys[i + 1];
      if (t <= c[0]) {
        let u = (t - a[0]) / (c[0] - a[0]);
        u = u * u * (3 - 2 * u);
        return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      }
    }
    return [keys[4][1], keys[4][2]];
  };
  const bodyPath = catmull([
    [0, 0.9, -0.84],
    [0, 0.95, -0.55],
    [0, 0.98, -0.18],
    [0, 1.0, 0.16],
    [0, 0.98, 0.44],
  ]);
  const body = b.sweep(bodyPath, bodyR, { bone: [hips, spine], color: coat, shift: (t: number) => [0, -0.04 * t] });

  // neck core (under the mane)
  b.sweep(neck, (t: number) => [0.2, 0.16 + 0.02 * t] as [number, number], { color: BROWN });

  // ---------------- head ----------------
  const skull = b.part(new THREE.SphereGeometry(0.15, 12, 9), coat, {
    bone: head,
    at: H({ forward: 0.05 }),
    scale: [1, 0.9, 1.05],
  });
  const skin = b.surface(skull);
  const surfZ = (x: number, y: number) =>
    0.05 + 0.1575 * Math.sqrt(Math.max(0, 1 - (x / 0.15) ** 2 - (y / 0.135) ** 2));

  // muzzle bridge
  b.frustumBox(H({ up: 0.06, forward: 0.1 }), H({ up: 0.03, forward: 0.29 }), [0.12, 0.08], [0.1, 0.07], {
    color: coat,
    bone: head,
  });
  // broad black nose
  b.frustumBox(H({ forward: 0.302, down: 0.002 }), H({ forward: 0.302, up: 0.056 }), [0.04, 0.05], [0.1, 0.05], {
    color: NOSE,
    bone: head,
  });
  b.part(new THREE.BoxGeometry(0.006, 0.035, 0.01), DARK, { at: H({ forward: 0.296, down: 0.022 }), bone: head });

  const brows: any[] = [];
  for (const s of [1, -1]) {
    // full cheeks
    b.part(new THREE.SphereGeometry(0.075, 10, 8), coat, {
      bone: head,
      at: H({ left: s * 0.085, down: 0.035, forward: 0.13 }),
      scale: [1, 0.9, 1],
    });
    // cream whisker pads
    const padC = H({ left: s * 0.038, down: 0.02, forward: 0.265 });
    b.part(new THREE.SphereGeometry(0.048, 10, 8), CREAM, { bone: head, at: padC, scale: [1, 0.85, 0.9] });
    for (let k = 0; k < 4; k++) {
      const d = new THREE.Vector3(s * (0.45 + 0.12 * k), 0.15 - 0.12 * (k % 2) - 0.05 * k, 0.85).normalize();
      b.part(new THREE.SphereGeometry(0.0045, 5, 4), DARK, {
        bone: head,
        at: new THREE.Vector3(padC.x + d.x * 0.046, padC.y + d.y * 0.04, padC.z + d.z * 0.042),
      });
    }
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod(
        H({ left: s * 0.06, down: 0.012 + k * 0.012, forward: 0.27 }),
        H({ left: s * 0.24, down: -0.02 + k * 0.04, forward: 0.22 - k * 0.025 }),
        0.0022,
        { color: WHITE, bone: head, sides: 3 },
      );
    }
    // lip line and canines
    b.capsule(H({ left: s * 0.075, down: 0.058, forward: 0.2 }), H({ left: s * 0.012, down: 0.064, forward: 0.284 }), 0.006, {
      color: DARK,
      bone: head,
    });
    b.spike(H({ left: s * 0.03, down: 0.055, forward: 0.272 }), [0, -1, 0.1], 0.036, 0.008, { color: IVORY, bone: head });

    // eyes: dark socket, amber ball, pupil, glint, heavy old lid
    const eh = skin.nearest(H({ left: s * 0.064, up: 0.045, forward: surfZ(0.064, 0.045) + 0.01 }));
    const n = new THREE.Vector3().copy(eh.n);
    const c = new THREE.Vector3().copy(eh.at).addScaledVector(n, -0.004);
    b.part(new THREE.SphereGeometry(0.028, 8, 6), DARK, { bone: head, at: c.clone().addScaledVector(n, -0.003) });
    b.part(new THREE.SphereGeometry(0.024, 10, 8), AMBER, { bone: head, at: c });
    const gaze = n.clone().add(new THREE.Vector3(0, 0, 1.2)).normalize();
    b.part(new THREE.SphereGeometry(0.0105, 8, 6), DARK, { bone: head, at: c.clone().addScaledVector(gaze, 0.017) });
    b.part(new THREE.SphereGeometry(0.0045, 5, 4), WHITE, {
      bone: head,
      at: c.clone().addScaledVector(gaze, 0.022).add(new THREE.Vector3(s * 0.004, 0.009, 0)),
    });
    b.part(new THREE.SphereGeometry(0.028, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), coat, {
      bone: head,
      at: c,
      dir: [s * 0.15, 1, 0.75],
    });
    // dark tear line toward the muzzle
    const tear = skin.nearest(H({ left: s * 0.045, up: 0.02, forward: surfZ(0.045, 0.02) + 0.01 }));
    b.capsule(tear.at, H({ left: s * 0.052, up: 0.0, forward: 0.2 }), 0.0045, { color: DARK, bone: head });

    // brows
    const a = skin.nearest(H({ left: s * 0.025, up: 0.09, forward: surfZ(0.025, 0.09) + 0.01 })).at;
    const e = skin.nearest(H({ left: s * 0.105, up: 0.072, forward: surfZ(0.105, 0.072) + 0.01 })).at;
    brows.push(b.capsule(a, e, 0.021, { color: coat, bone: head }));

    // round ears with dark backs, half in the mane
    b.part(new THREE.SphereGeometry(0.052, 8, 6), BROWN, {
      bone: head,
      at: H({ left: s * 0.105, up: 0.13, forward: 0.055 }),
      scale: [1, 1, 0.45],
    });
    b.part(new THREE.SphereGeometry(0.046, 8, 6), coat, {
      bone: head,
      at: H({ left: s * 0.105, up: 0.13, forward: 0.065 }),
      scale: [1, 1, 0.4],
    });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), EAR_IN, {
      bone: head,
      at: H({ left: s * 0.105, up: 0.125, forward: 0.078 }),
      scale: [1, 1, 0.3],
    });
  }

  // scar across the right brow
  const scarRough = catmull(
    [
      [-0.03, 0.128],
      [-0.075, 0.088],
      [-0.118, 0.045],
    ].map(([x, y]) => H({ left: x, up: y, forward: surfZ(Math.abs(x), y) + 0.02 })),
  );
  const scarPath = b.surface([skull, brows[1]]).drape(scarRough, { lift: 0.004 });
  b.sweep(scarPath, 0.0075, { color: SCAR, bone: head });

  // lower jaw and chin
  b.frustumBox(H({ forward: 0.1, down: 0.085 }), H({ forward: 0.26, down: 0.09 }), [0.12, 0.055], [0.085, 0.045], {
    color: CREAM,
    bone: jaw,
  });
  b.part(new THREE.SphereGeometry(0.042, 8, 6), CREAM, { bone: jaw, at: H({ forward: 0.21, down: 0.1 }) });
  for (let i = 0; i < 5; i++) {
    tuft(
      H({ left: (i - 2) * 0.028, down: 0.11, forward: 0.2 - Math.abs(i - 2) * 0.025 }),
      jit({ x: (i - 2) * 0.15, y: -1, z: -0.25 }, 0.15),
      0.1,
      0.026,
      jaw,
    );
  }

  // ---------------- the mane ----------------
  b.part(new THREE.SphereGeometry(0.25, 12, 9), BROWN, {
    bone: head,
    at: H({ back: 0.13, down: 0.03 }),
    scale: [1, 1.08, 0.85],
  });
  const layers: number[][] = [
    [-0.03, 0.155, 16, 0.13, 0.05, -15],
    [0.04, 0.19, 18, 0.19, 0.065, -30],
    [0.12, 0.22, 20, 0.24, 0.075, -45],
    [0.2, 0.23, 20, 0.27, 0.08, -60],
    [0.29, 0.21, 16, 0.25, 0.08, -75],
  ];
  layers.forEach(([k, rad, n, len, r, tilt], li) => {
    const step = 360 / n;
    const from = (li % 2) * step * 0.5;
    b.ring(
      head.moved(H({ forward: -k })),
      { count: n, radius: rad, fromDeg: from, toDeg: from + 360 - step, tilt },
      (it: any) => tuft(it.at, jit(it.outward), len * (0.8 + 0.4 * R()), r * (0.85 + 0.3 * R()), it.bone ?? head),
    );
  });
  [0.15, 0.45, 0.78].forEach((t, i) => {
    const n = 16;
    const step = 360 / n;
    const from = (i % 2) * step * 0.5;
    b.ring(neck.at(t), { count: n, radius: 0.15, fromDeg: from, toDeg: from + 360 - step, tilt: -40 }, (it: any) =>
      tuft(it.at, jit(it.outward), 0.25 * (0.8 + 0.4 * R()), 0.08, it.bone ?? neck.joints[0]),
    );
  });
  b.ring(spine.at(0.93), { count: 16, radius: 0.24, fromDeg: 0, toDeg: 337.5, tilt: -55 }, (it: any) =>
    tuft(it.at, jit(it.outward), 0.23 * (0.8 + 0.4 * R()), 0.08, it.bone ?? chest),
  );
  // chest fringe hanging between the forelegs
  for (let i = 0; i < 7; i++) {
    const pt: any = body.at(0.94 - (i % 2) * 0.05, 140 + i * 13);
    tuft(pt.at, jit({ x: (i - 3) * 0.08, y: -1, z: 0.3 }, 0.2), 0.24 * (0.85 + 0.3 * R()), 0.07, pt.bone ?? chest);
  }

  // ---------------- legs ----------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // forelegs
    const fpts = limb([s * 0.19, 0.92, 0.3], [s * 0.2, 0.07, 0.42], [0.44, 0.42, 0.14], [[0, 0, -1]], {
      sole: [0, -0.5, 1],
    });
    const fl = b.chain(`front${side}`, fpts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
      contact: [s * 0.2, 0, 0.45],
    });
    b.sweep(fl, [0.115, 0.082, 0.066, 0.06, 0.056], { color: coat });
    // hind legs
    const hpts = limb(
      [s * 0.17, 0.93, -0.6],
      [s * 0.19, 0.07, -0.56],
      [0.4, 0.38, 0.3, 0.14],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, -0.5, 1] },
    );
    const hl = b.chain(`hind${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.19, 0, -0.53],
    });
    b.sweep(hl, [0.15, 0.105, 0.066, 0.058, 0.055, 0.055], { color: coat });

    // big padded paws
    for (const [leg, pts, k] of [
      [fl, fpts, 1],
      [hl, hpts, 0.92],
    ] as [any, THREE.Vector3[], number][]) {
      const tip = pts[pts.length - 1];
      const pb = leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(0.08 * k, 10, 7), coat, {
        bone: pb,
        at: [tip.x, 0.045 * k, tip.z - 0.015],
        scale: [1, 0.56, 1.15],
      });
      for (let t = 0; t < 4; t++) {
        const dx = (t - 1.5) * 0.031 * k;
        b.part(new THREE.SphereGeometry(0.029 * k, 7, 5), PAD, {
          bone: pb,
          at: [tip.x + dx, 0.026 * k, tip.z + 0.06 * k - Math.abs(t - 1.5) * 0.016],
          scale: [1, 0.9, 1.1],
        });
      }
    }
    // dark elbow tufts
    const elbow = fl.joints[1];
    tuft(
      new THREE.Vector3(elbow.at.x, elbow.at.y, elbow.at.z - 0.03),
      { x: s * 0.25, y: -0.45, z: -1 },
      0.15,
      0.035,
      elbow,
      CHOC,
    );
  }

  // ---------------- tail ----------------
  b.sweep(tail, (t: number) => 0.055 - 0.028 * t, { color: coat });
  const tailEnd = tail.joints[tail.joints.length - 1];
  const end: any = tail.at(1);
  b.part(new THREE.SphereGeometry(0.05, 8, 6), CHOC, { bone: tailEnd, at: end.at, dir: end.tangent, scale: [1, 1.5, 1] });
  b.ring(tail.at(0.95), { count: 9, radius: 0.02, tilt: 45 }, (it: any) =>
    tuft(it.at, jit(it.outward, 0.15), 0.13 * (0.85 + 0.3 * R()), 0.032, tailEnd, CHOC),
  );
  tuft(end.at, end.tangent, 0.13, 0.042, tailEnd, DARK);

  return b.root;
}
