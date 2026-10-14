```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  vec,
  offset,
  lerp,
  bezier,
  catmull,
  polyline,
  limb,
  countershade,
  mottle,
  gradient,
} from "agentic-3js-builder";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old male lion standing in a neutral rest pose with his head held high: a huge shaggy mane of layered tufts fading from golden blond at the face to dark chocolate at the edges, tawny countershaded coat, cream muzzle, amber eyes, broad black nose, a scar across the right brow, a notched ear, padded paws and a long tail ending in a dark tuft.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const R = rng(17);

  // ---------- palette ----------
  const TAWNY = "#c99149";
  const TAWNY2 = "#b17738";
  const CREAM = "#ecd6aa";
  const MUZZLE = "#f3e5c6";
  const BRIDGE = "#a86f36";
  const NOSE = "#2a1b17";
  const NOSTRIL = "#0a0505";
  const LIP = "#3a2418";
  const AMBER = "#e39a1c";
  const BLACK = "#120b08";
  const WHITE = "#fbf6ea";
  const RIM = "#2b1a10";
  const PAD = "#2e1d16";
  const TOE = "#d6a462";
  const SCAR = "#d9a39a";
  const SCAR_DEEP = "#9c5f55";
  const EAR_BACK = "#6e4122";
  const EAR_IN = "#ead3a6";
  const MANE = ["#f4d27a", "#e0a84f", "#bd7836", "#874a20", "#522b15", "#311a0c"];

  const coat = countershade(mottle(TAWNY, TAWNY2, { size: 0.35, contrast: 0.4, seed: 3 }), CREAM, {
    level: -0.35,
  });
  const maneBase = mottle(MANE[3], MANE[4], { size: 0.12, seed: 5 });

  const keyed = (k: number[][]) => (t: number) => {
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i][0]) {
        const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
        return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * u;
      }
    }
    return k[k.length - 1][1];
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.88, -0.6], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.88, -0.45],
      [0, 0.9, -0.05],
      [0, 0.94, 0.35],
      [0, 0.97, 0.6],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.0, 0.55],
      [0, 1.22, 0.74],
      [0, 1.42, 0.86],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.42, 0.86], dir: [0, 0.06, 1], role: "head" });
  const jawEnd = head.local({ forward: 0.27, down: 0.135 });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.12 }),
    aim: jawEnd,
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.92, -0.75],
      [0, 0.82, -0.98],
      [0, 0.58, -1.15],
      [0, 0.36, -1.3],
      [0, 0.3, -1.52],
      [0, 0.38, -1.72],
    ]),
    { parent: hips, count: 6, names: (i: number) => `tail${i + 1}`, role: "tail" },
  );

  // ---------- tuft helper (mane hair) ----------
  const tuft = (f: any, len: number, w: number, c0: string, c1: string, droop: number) => {
    const p0 = vec(f.at);
    const ax = vec(f.axis).normalize();
    const L = len * (0.85 + 0.3 * R());
    const tip = p0.clone().addScaledVector(ax, L);
    tip.y -= L * droop * (0.8 + 0.4 * R());
    const ctrl = p0.clone().addScaledVector(ax, L * 0.5);
    b.sweep(bezier(f, ctrl, tip), [w * (0.9 + 0.2 * R()), 0], {
      color: gradient(c0, c1, p0, tip),
      sides: 5,
      smooth: false,
      caps: { start: "round", end: "point" },
    });
  };

  // ---------- body ----------
  const rx = keyed([
    [0, 0.2],
    [0.15, 0.24],
    [0.45, 0.2],
    [0.75, 0.24],
    [1, 0.22],
  ]);
  const ry = keyed([
    [0, 0.22],
    [0.15, 0.26],
    [0.45, 0.22],
    [0.75, 0.3],
    [1, 0.27],
  ]);
  b.sweep(
    catmull([
      [0, 0.88, -0.8],
      [0, 0.88, -0.6],
      [0, 0.9, -0.1],
      [0, 0.94, 0.35],
      [0, 0.97, 0.6],
    ]),
    (t: number): [number, number] => [rx(t), ry(t)],
    {
      bone: [hips, spine],
      color: coat,
      sides: 12,
      shift: (t: number): [number, number] => [0, -0.02 - 0.04 * t],
    },
  );

  // ---------- legs & paws ----------
  const paw = (bone: any, x: number, z: number, k: number) => {
    b.part(new THREE.SphereGeometry(0.1 * k, 10, 6).scale(1, 0.55 / k, 1.25), coat, { at: [x, 0.06, z + 0.03], bone });
    b.part(new THREE.CylinderGeometry(0.078 * k, 0.085 * k, 0.02, 10).scale(1, 1, 1.22), PAD, {
      at: [x, 0.011, z + 0.03],
      bone,
    });
    for (const dx of [-0.06, -0.02, 0.02, 0.06]) {
      b.part(new THREE.SphereGeometry(0.036 * k, 7, 5).scale(1, 0.8 / k, 1.15), TOE, {
        at: [x + dx * k, 0.04, z + 0.03 + 0.095 * k - Math.abs(dx) * 0.4],
        bone,
      });
    }
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fp = limb([s * 0.19, 0.92, 0.42], [s * 0.21, 0.07, 0.48], [0.36, 0.32, 0.2], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const front = b.chain(`front${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
    });
    b.sweep(front, [0.11, 0.08, 0.066, 0.064], { color: coat, caps: { start: "round", end: "flat" } });
    paw(front.tip ?? front.joints[front.joints.length - 1], s * 0.21, 0.48, 1);
    // elbow tuft
    b.spike(offset(fp[1], [0, 0, -1], 0.05), [0, -0.5, -1], 0.09, 0.03, {
      color: gradient(MANE[3], MANE[5], offset(fp[1], [0, 0, -1], 0.05), offset(fp[1], [0, -0.5, -1], 0.14)),
      bone: front.joints[1],
      sides: 5,
    });

    const hp = limb([s * 0.19, 0.86, -0.55], [s * 0.21, 0.07, -0.48], [0.34, 0.34, 0.22], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`hind${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hind, [0.15, 0.1, 0.07, 0.064], { color: coat, caps: { start: "round", end: "flat" } });
    paw(hind.tip ?? hind.joints[hind.joints.length - 1], s * 0.21, -0.48, 0.92);
  }

  // ---------- neck & mane mass ----------
  const neckSweep = b.sweep(neck, [0.2, 0.16], { color: maneBase });
  b.part(new THREE.SphereGeometry(0.26, 10, 8), maneBase, {
    at: head.local({ back: 0.16, down: 0.03 }),
    bone: head,
    flat: true,
  });

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(0.17, 10, 8).scale(1.06, 0.95, 1), coat, {
    at: head.local({ forward: 0.02 }),
    bone: head,
    flat: true,
  });
  b.frustumBox(head.local({ forward: 0.1, down: 0.04 }), head.local({ forward: 0.3, down: 0.06 }), [0.2, 0.17], [0.16, 0.13], {
    bone: head,
    color: MUZZLE,
  });
  b.frustumBox(head.local({ forward: 0.09, up: 0.075 }), head.local({ forward: 0.29, up: 0.01 }), [0.1, 0.04], [0.075, 0.03], {
    bone: head,
    color: BRIDGE,
  });
  // broad black nose
  b.extrude(
    [
      [-0.055, 0.025],
      [-0.05, 0],
      [-0.012, -0.03],
      [0, -0.04, "sharp"],
      [0.012, -0.03],
      [0.05, 0],
      [0.055, 0.025],
    ],
    { at: head.local({ forward: 0.3 }), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, bevel: 0.008, smoothing: 1, color: NOSE, bone: head },
  );
  b.rod(head.local({ forward: 0.31, down: 0.04 }), head.local({ forward: 0.31, down: 0.11 }), 0.004, { color: LIP, bone: head });

  // lower jaw + chin
  b.frustumBox(jaw.at, jawEnd, [0.12, 0.055], [0.09, 0.045], { bone: jaw, color: MUZZLE });
  b.spike(offset(jawEnd, [0, -1, 0], 0.015), [0, -1, -0.4], 0.06, 0.022, { color: CREAM, bone: jaw, sides: 5 });

  const brows: any[] = [];
  for (const s of [1, -1]) {
    const nostril = head.local({ left: s * 0.022, down: 0.005, forward: 0.322 });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), NOSTRIL, { at: nostril, bone: head });

    // cheeks
    b.part(new THREE.SphereGeometry(0.08, 8, 6), coat, { at: head.local({ left: s * 0.1, down: 0.05, forward: 0.1 }), bone: head, flat: true });

    // lips
    b.rod(head.local({ left: s * 0.025, down: 0.123, forward: 0.305 }), head.local({ left: s * 0.088, down: 0.112, forward: 0.15 }), 0.006, {
      color: LIP,
      bone: head,
    });

    // whisker pads, spots, whiskers
    const padC = head.local({ left: s * 0.05, down: 0.075, forward: 0.255 });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), MUZZLE, { at: padC, bone: head });
    for (const k of [-1, 0, 1]) {
      const d = new THREE.Vector3(s * 0.7, 0.18 * k, 1).normalize();
      const dot = offset(padC, d, 0.049);
      b.part(new THREE.SphereGeometry(0.005, 4, 3), BLACK, { at: dot, bone: head });
      b.rod(dot, offset(dot, [s, 0.12 * k - 0.05, -0.1], 0.2 + 0.03 * (1 - Math.abs(k))), 0.0022, { color: WHITE, bone: head });
    }

    // eyes
    const d = new THREE.Vector3(s * 0.35, 0.05, 1).normalize();
    const ec = head.local({ left: s * 0.072, up: 0.06, forward: 0.165 });
    b.part(new THREE.SphereGeometry(0.025, 8, 6), AMBER, { at: ec, bone: head });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.006, 8), BLACK, { at: offset(ec, d, 0.022), dir: d, bone: head });
    const hl = offset(ec, d, 0.024);
    hl.y += 0.008;
    hl.x += s * 0.004;
    b.part(new THREE.SphereGeometry(0.004, 4, 3), WHITE, { at: hl, bone: head });
    b.part(new THREE.TorusGeometry(0.025, 0.005, 4, 12), RIM, { at: offset(ec, d, 0.006), dir: d, axis: "z", bone: head });
    const under = offset(ec, d, 0.004);
    under.y -= 0.032;
    b.part(new THREE.SphereGeometry(0.03, 6, 4).scale(1.2, 0.5, 0.8), MUZZLE, { at: under, bone: head });
    // heavy brow
    brows.push(
      b.part(new THREE.BoxGeometry(0.085, 0.028, 0.06), BRIDGE, {
        at: head.local({ left: s * 0.07, up: 0.1, forward: 0.155 }),
        rotation: [0, -s * 20, s * 15],
        bone: head,
      }),
    );

    // ears (right one notched)
    const outline: any =
      s > 0
        ? [
            [-0.045, 0],
            [0.045, 0],
            [0.04, 0.045],
            [0, 0.075],
            [-0.04, 0.045],
          ]
        : [
            [-0.045, 0],
            [0.045, 0],
            [0.04, 0.045],
            [0.02, 0.066, "sharp"],
            [0.008, 0.05, "sharp"],
            [-0.005, 0.072],
            [-0.04, 0.045],
          ];
    const ex: [number, number, number] = [1, -s * 0.35, 0];
    const ey: [number, number, number] = [s * 0.35, 1, 0];
    const earAt = head.local({ left: s * 0.115, up: 0.12 });
    b.extrude(outline, { at: earAt, x: ex, y: ey, thickness: 0.02, bevel: 0.005, smoothing: 1, color: EAR_BACK, bone: head });
    b.extrude(
      [
        [-0.026, 0],
        [0.026, 0],
        [0.022, 0.03],
        [0, 0.045],
        [-0.022, 0.03],
      ],
      { at: offset(offset(earAt, [0, 0, 1], 0.011), [0, 1, 0], 0.008), x: ex, y: ey, thickness: 0.006, smoothing: 1, color: EAR_IN, bone: head },
    );
  }

  // scar across the right eyebrow
  const faceSurf = b.surface([skull, ...brows]);
  const scarLine = (a: THREE.Vector3, c: THREE.Vector3, r: number, col: string) => {
    const pts = [0, 0.25, 0.5, 0.75, 1].map((t) => lerp(a, c, t));
    b.sweep(faceSurf.drape(polyline(pts), { lift: 0.003 }), r, { color: col, sides: 4, bone: head });
  };
  scarLine(head.local({ left: -0.035, up: 0.16, forward: 0.12 }), head.local({ left: -0.115, up: 0.06, forward: 0.13 }), 0.0055, SCAR);
  scarLine(head.local({ left: -0.06, up: 0.155, forward: 0.12 }), head.local({ left: -0.12, up: 0.09, forward: 0.12 }), 0.004, SCAR_DEEP);

  // ---------- mane: layered rings from golden face ruff to chocolate edge ----------
  const layers = [
    { back: 0.0, r: 0.15, n: 14, tilt: -10, len: 0.12, w: 0.045 },
    { back: 0.06, r: 0.19, n: 18, tilt: -28, len: 0.17, w: 0.055 },
    { back: 0.13, r: 0.22, n: 20, tilt: -45, len: 0.21, w: 0.06 },
    { back: 0.21, r: 0.23, n: 20, tilt: -60, len: 0.24, w: 0.065 },
    { back: 0.29, r: 0.2, n: 16, tilt: -72, len: 0.25, w: 0.065 },
  ];
  layers.forEach((L, k) => {
    const centre = head.moved(head.local({ back: L.back }));
    const phase = k * 7;
    b.ring(centre, { count: L.n, radius: L.r, tilt: L.tilt, fromDeg: phase, toDeg: phase + 360 - 360 / L.n }, (item: any) =>
      tuft(item, L.len, L.w, MANE[k], MANE[k + 1], 0.3),
    );
  });
  // shag over neck, shoulders and chest
  for (const [t, rad, n] of [
    [0.15, 0.2, 12],
    [0.5, 0.18, 12],
  ]) {
    b.ring(neck.at(t), { count: n, radius: rad, tilt: -40, fromDeg: 15 * t }, (item: any) =>
      tuft(item, 0.26, 0.07, MANE[3], MANE[5], 0.35),
    );
  }
  b.along(neckSweep, 4, (at: any) => tuft(at, 0.2, 0.06, MANE[2], MANE[4], 0.5));

  // ---------- tail ----------
  b.sweep(tail, (t: number) => 0.05 * (1 - t) + 0.022, { color: coat });
  b.part(new THREE.SphereGeometry(0.06, 8, 6).scale(1, 1.6, 1), MANE[4], { frame: tail.at(0.98), flat: true });
  b.spike(tail.at(1), tail.at(1), 0.11, 0.04, { color: MANE[5], sides: 5 });
  b.ring(tail.at(0.95), { count: 7, radius: 0.03, tilt: 45 }, (item: any) => tuft(item, 0.14, 0.03, MANE[4], MANE[5], 0.1));

  return b.root;
}
```