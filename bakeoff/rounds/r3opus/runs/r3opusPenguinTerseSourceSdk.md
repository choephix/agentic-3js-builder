```ts
import * as THREE from "three";
import { createBuilder, paint, scales, mix, smoothstep, polyline, catmull } from "agentic-3js-builder";

export const meta = {
  name: "King Penguin",
  description:
    "A stylized king penguin standing in a rest pose: slate-scaled back, ink-black head, glowing orange ear commas and bib, an orange plate on its long beak, flippers extended, and webbed feet.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "penguin" });

  const INK = "#15171e";
  const WHITE = "#f7f4ec";
  const YEL = "#fdd96a";
  const ORA = "#f4891f";
  const FOOT = "#2c2a2f";

  // ---------------- Skeleton ----------------
  b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.12, 0],
      [0, 0.32, 0.01],
      [0, 0.52, 0.01],
      [0, 0.66, 0],
      [0, 0.76, 0.02],
      [0, 0.9, 0.02],
    ]),
    { parent: "root", names: ["hips", "spine1", "chest", "neck", "head"], role: "spine" },
  );

  // ---------------- Body paint ----------------
  const slate = scales(["#4a576b", "#435064", "#505e73"], "#323b4b", { size: 0.026, width: 0.16, seed: 4 });
  const A = new THREE.Vector3(0.1, 0.775, -0.012);
  const B = new THREE.Vector3(0.088, 0.67, 0.065);
  const AB = B.clone().sub(A);
  const abLen = AB.lengthSq();
  const q = new THREE.Vector3();
  const bodyPaint = paint((p, n) => {
    q.set(Math.abs(p.x), p.y, p.z);
    const s = Math.min(1, Math.max(0, q.clone().sub(A).dot(AB) / abLen));
    const d = q.distanceTo(A.clone().addScaledVector(AB, s));
    const r = 0.034 * (1 - s) + 0.009 * s;
    const ear = smoothstep(r + 0.004, r - 0.004, d);
    const head = mix(INK, "#262c3a", smoothstep(0.2, 1, n.y) * 0.8);
    const backCol = mix(slate.at(p, n), INK, smoothstep(0.56, 0.66, p.y));
    const frontCol =
      p.y > 0.6 ? mix(YEL, ORA, smoothstep(0.6, 0.68, p.y)) : mix(WHITE, YEL, smoothstep(0.47, 0.6, p.y));
    const frontBottom = mix("#e4ddcf", frontCol, smoothstep(0.05, 0.2, p.y));
    const white = smoothstep(-0.1, -0.03, n.z);
    const line = smoothstep(-0.22, -0.15, n.z);
    let torso = mix(backCol, INK, line);
    torso = mix(torso, frontBottom, white);
    let c = mix(torso, head, smoothstep(0.67, 0.705, p.y));
    c = mix(c, ORA, ear);
    return c;
  });

  // ---------------- Body ----------------
  const body = b.loft(
    [
      { at: [0, 0.1, 0.0], w: 0.16, h: 0.14 },
      { at: [0, 0.22, 0.012], w: 0.37, h: 0.34 },
      { at: [0, 0.4, 0.018], w: 0.39, h: 0.36 },
      { at: [0, 0.58, 0.004], w: 0.29, h: 0.27 },
      { at: [0, 0.7, 0.0], w: 0.19, h: 0.18 },
      { at: [0, 0.79, 0.02], w: 0.21, h: 0.22 },
      { at: [0, 0.875, 0.02], w: 0.1, h: 0.1 },
    ],
    { color: bodyPaint, bone: spine, sides: 16, name: "body" },
  );

  // ---------------- Beak ----------------
  const BEAK = "#1d1d22";
  b.sweep(
    catmull([
      [0, 0.797, 0.07],
      [0, 0.791, 0.18],
      [0, 0.772, 0.275],
    ]),
    (t: number) => [0.024 * (1 - t) + 0.004, 0.017 * (1 - t) + 0.004] as const,
    { color: BEAK, bone: "head", caps: { start: "flat", end: "round" }, name: "beakUpper" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.776, 0.09], dir: [0, -0.1, 1], role: "jaw" });
  b.sweep(
    catmull([
      [0, 0.773, 0.075],
      [0, 0.766, 0.18],
      [0, 0.762, 0.255],
    ]),
    (t: number) => [0.02 * (1 - t) + 0.003, 0.011 * (1 - t) + 0.003] as const,
    {
      bands: [
        [0.58, ORA],
        [1, BEAK],
      ],
      bone: "jaw",
      caps: { start: "flat", end: "round" },
      name: "beakLower",
    },
  );

  // ---------------- Eyes ----------------
  const skin = b.surface(body);
  const look = skin.around([0, 0.8, 0.03]);
  for (const s of [1, -1]) {
    const hit = look.at(62 * s, 12);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.015, 10, 8), "#0b0b0e", hit, { embed: 0.45, bone: "head" });
    const ringGeo = new THREE.TorusGeometry(0.016, 0.0028, 4, 12);
    ringGeo.rotateX(Math.PI / 2);
    b.stick(ringGeo, "#3a4252", hit, { embed: 0.3, bone: "head" });
    const hp = hit.at.clone().addScaledVector(hit.n, 0.012).add(new THREE.Vector3(0, 0.005, 0.005));
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), "#ffffff", { at: hp, bone: "head" });
  }

  // ---------------- Flippers ----------------
  const flipperPaint = paint((p, n) => mix(WHITE, "#252c3a", smoothstep(-0.2, 0.2, n.y)));
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const arm = b.chain(
      `flipper${side}`,
      polyline([
        [s * 0.1, 0.57, 0.0],
        [s * 0.22, 0.5, 0.0],
        [s * 0.33, 0.42, 0.0],
        [s * 0.41, 0.35, 0.0],
      ]),
      {
        parent: "chest",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `flipperTip${side}`],
        role: "arm",
      },
    );
    b.sweep(
      arm,
      (t: number) => [0.011 - 0.004 * t, 0.014 + 0.042 * Math.pow(1 - t, 0.7) * Math.min(1, 0.6 + 2 * t)] as const,
      { color: flipperPaint, sides: 10, name: `flipper${side}` },
    );
  }

  // ---------------- Legs and feet ----------------
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const ankle: [number, number, number] = [s * 0.075, 0.035, 0.045];
    const leg = b.chain(
      `leg${side}`,
      polyline([[s * 0.07, 0.15, 0.0], [s * 0.08, 0.09, 0.04], ankle]),
      {
        parent: "hips",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.075, 0, 0.09],
      },
    );
    b.sweep(leg, [0.04, 0.028], { color: FOOT, name: `leg${side}` });

    const toes = [-28, 0, 28].map((deg, i) => {
      const yaw = (deg + s * 8) * (Math.PI / 180);
      const start: [number, number, number] = [s * 0.075, 0.025, 0.045];
      const tip: [number, number, number] = [
        start[0] + Math.sin(yaw) * 0.088,
        0.012,
        start[2] + Math.cos(yaw) * 0.088,
      ];
      const midP: [number, number, number] = [(start[0] + tip[0]) / 2, 0.016, (start[2] + tip[2]) / 2];
      const toe = b.chain(`toe${i + 1}${side}`, polyline([start, midP, tip]), {
        parent: `ankle${side}`,
        names: [`toe${i + 1}${side}1`, `toe${i + 1}${side}2`],
        role: "digit",
      });
      b.sweep(toe, [0.017, 0.011], { color: FOOT, name: `toe${i + 1}${side}` });
      b.spike(tip, [Math.sin(yaw), -0.25, Math.cos(yaw)], 0.022, 0.0075, {
        color: "#101013",
        bone: toe.joints[1],
        name: `claw${i + 1}${side}`,
      });
      return toe;
    });
    for (let k = 0; k < 2; k++)
      b.membrane(toes[k], toes[k + 1], {
        color: "#3a3539",
        thickness: 0.005,
        scallop: 0.25,
        name: `web${k + 1}${side}`,
      });
  }

  // ---------------- Tail ----------------
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.13, -0.09],
      [0, 0.09, -0.15],
      [0, 0.05, -0.21],
    ]),
    { parent: "hips", names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t: number) => [0.045 - 0.03 * t, 0.014 - 0.006 * t] as const, {
    color: INK,
    name: "tail",
  });

  return b.root;
}
```