import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin",
  description: "A stylized emperor penguin in a rest pose, with a rigged spine, flippers, legs, tail and a two-part beak.",
};

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // Palette
  const BLACK = "#1b2027";
  const FLIPPER = "#20252d";
  const FOOT = "#2f2f33";

  // Skeleton
  b.joint("root", { at: [0, 0.3, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.3, 0],
      [0, 0.55, 0.01],
      [0, 0.78, 0.03],
      [0, 0.92, 0.05],
    ],
    { names: ["spine1", "spine2", "neck", "head"], role: "spine", parent: "root" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.96, 0.12], dir: [0, 0, 1], role: "jaw" });

  // Body paint: black back, white belly, golden chest
  const coat = paint((p, n) => {
    let f = smoothstep(0.0, 0.3, n.z);
    f *= 1 - smoothstep(0.84, 0.92, p.y);
    const belly = mix("#f7f4ee", "#f4b43a", smoothstep(0.56, 0.82, p.y));
    return mix(BLACK, belly, f);
  });

  b.loft(
    [
      { at: [0, 0.12, -0.02], w: 0.2, h: 0.24 },
      { at: [0, 0.34, -0.02], w: 0.44, h: 0.4 },
      { at: [0, 0.55, 0.0], w: 0.47, h: 0.4 },
      { at: [0, 0.75, 0.03], w: 0.34, h: 0.3 },
      { at: [0, 0.9, 0.05], w: 0.19, h: 0.19 },
    ],
    { color: coat, bone: spine, caps: "round", name: "body" },
  );

  // Head with ear patches
  const headCenter = new THREE.Vector3(0, 0.99, 0.06);
  const headPaint = paint((p) => {
    const dl = p.distanceTo(new THREE.Vector3(0.07, 0.985, 0.045));
    const dr = p.distanceTo(new THREE.Vector3(-0.07, 0.985, 0.045));
    const d = Math.min(dl, dr);
    return mix("#14171c", "#f6b93b", smoothstep(0.05, 0.028, d));
  });
  b.part(new THREE.SphereGeometry(0.085, 12, 8), headPaint, {
    at: headCenter,
    scale: [0.95, 1, 1.1],
    bone: "head",
    name: "head",
  });

  // Eyes
  for (const s of [1, -1]) {
    const dir = new THREE.Vector3(s * 0.8, 0.1, 0.55).normalize();
    const base = new THREE.Vector3(s * 0.072, 1.0, 0.1);
    b.part(new THREE.SphereGeometry(0.02, 8, 6), "#f2efe6", { at: base, bone: "head" });
    b.part(new THREE.SphereGeometry(0.013, 8, 6), "#050505", {
      at: base.clone().addScaledVector(dir, 0.012),
      bone: "head",
    });
  }

  // Beak: upper on head, lower on jaw
  b.spike([0, 0.99, 0.13], [0, 0.962, 0.285], null, { radius: 0.03, color: "#3a3a40", bone: "head", name: "beakUpper" });
  b.spike([0, 0.955, 0.13], [0, 0.948, 0.255], null, { radius: 0.02, color: "#e8895a", bone: "jaw", name: "beakLower" });

  // Flippers, legs, feet
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.chain(
      `flipper${S}`,
      [
        [s * 0.235, 0.72, 0],
        [s * 0.31, 0.535, 0],
        [s * 0.385, 0.35, 0],
      ],
      { names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm", parent: "spine2" },
    );
    b.extrude(
      [
        [0.03, 0.02],
        [-0.03, 0.02],
        [-0.05, -0.12],
        [-0.045, -0.28],
        [-0.015, -0.4],
        [0.01, -0.28],
        [0.04, -0.1],
      ],
      {
        color: FLIPPER,
        at: [s * 0.235, 0.72, 0],
        x: [0, 0, 1],
        y: [-s * 0.4, 1, 0],
        thickness: 0.03,
        bevel: 0.008,
        smoothing: 1,
        bone: `shoulder${S}`,
        name: `flipperBlade${S}`,
      },
    );

    const leg = b.chain(
      `leg${S}`,
      [
        [s * 0.1, 0.22, 0],
        [s * 0.1, 0.12, 0.015],
        [s * 0.1, 0.045, 0.03],
      ],
      { names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", parent: "root" },
    );
    b.sweep(leg, { radius: 0.035, color: FOOT, name: `leg${S}` });

    b.extrude(
      [
        [0.03, -0.03],
        [-0.03, -0.03],
        [-0.06, 0.04],
        [-0.085, 0.12],
        [-0.06, 0.15],
        [-0.03, 0.12],
        [0, 0.16],
        [0.03, 0.12],
        [0.06, 0.15],
        [0.085, 0.12],
        [0.06, 0.04],
      ],
      {
        color: FOOT,
        at: [s * 0.1, 0.012, 0.0],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.024,
        bevel: 0.005,
        bone: `ankle${S}`,
        name: `foot${S}`,
      },
    );
  }

  // Tail
  const tail = b.chain(
    "tail",
    [
      [0, 0.22, -0.14],
      [0, 0.12, -0.24],
      [0, 0.06, -0.33],
    ],
    { names: ["tail1", "tail2", "tail3"], role: "tail", parent: "root" },
  );
  b.sweep(tail, {
    radius: (t: number) => [0.075 * (1 - t) + 0.015, 0.03],
    color: BLACK,
    name: "tail",
  });

  return b.root;
}
