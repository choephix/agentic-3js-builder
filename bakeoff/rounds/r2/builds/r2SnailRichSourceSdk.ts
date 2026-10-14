import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  spiral,
  paint,
  noise,
  mix,
  smoothstep,
  scales,
  countershade,
  interpolate,
} from "../../../../src/index";

export const meta = {
  name: "Garden Snail with Ladybird",
  description:
    "A glossy caramel, chocolate and cream striped garden snail with a pebbly grey-green body, long eye stalks, short feelers, a jointed jaw, a slime trail and a ladybird riding on the shell.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });
  b.ctx.paintMaterial().roughness = 0.3;
  b.ctx.paintMaterial().metalness = 0.0;
  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.012, 0], dir: [0, 0, 1], role: "spine" });

  // ---------- body ----------
  const bodyBack = scales(["#8a9b78", "#93a483", "#85967a"], "#6c7d5f", { size: 0.0055, width: 0.22, seed: 4 });
  const bodyBelly = scales(["#a9b793", "#b3c09d"], "#8d9c78", { size: 0.0055, width: 0.2, seed: 5 });
  const bodyPaint = countershade(bodyBack, bodyBelly, { level: 0.05, soft: 0.5 });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.004, -0.076],
      [0, 0.01, -0.04],
      [0, 0.012, 0],
      [0, 0.017, 0.04],
      [0, 0.026, 0.066],
      [0, 0.03, 0.082],
    ]),
    { names: ["tail", "spine1", "spine2", "spine3", "neck", "head"], role: "spine" },
  );
  const ts = [0, 0.2, 0.47, 0.72, 0.9, 1];
  const ryv = [0.003, 0.01, 0.012, 0.012, 0.011, 0.011];
  const rxv = [0.002, 0.012, 0.016, 0.015, 0.012, 0.011];
  b.sweep(spine, (t) => [interpolate(ts, rxv, t), interpolate(ts, ryv, t)], {
    color: bodyPaint,
    sides: 10,
    name: "body",
  });

  // foot sole / fringe
  const sts = [0, 0.15, 0.5, 0.9, 1];
  b.sweep(
    [
      [0, 0.004, -0.07],
      [0, 0.004, 0.056],
    ],
    (t) => [interpolate(sts, [0.001, 0.012, 0.0185, 0.015, 0.01], t), 0.004],
    { color: "#b9c4a2", sides: 8, bone: spine, name: "foot", caps: "round" },
  );

  // ---------- head details ----------
  b.joint("jaw", { parent: "head", at: [0, 0.0225, 0.078], dir: [0, 0, 1], up: [0, 1, 0], role: "jaw" });
  b.material("#5f6e50").roughness = 0.4;
  b.part(sphere(0.006), "#5f6e50", { at: [0, 0.0258, 0.0875], scale: [1.25, 0.55, 0.9], bone: "head", name: "upperJaw" });
  b.part(sphere(0.0055), "#74846a", { at: [0, 0.0208, 0.0865], scale: [1.15, 0.5, 0.85], bone: "jaw", name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.007, 0.0006, 0.002), "#2a3022", { at: [0, 0.0237, 0.0925], bone: "head", name: "mouthSlit" });

  // ---------- eye stalks and feelers ----------
  const stalkColor = "#869774";
  b.material(stalkColor).roughness = 0.3;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tip: [number, number, number] = [s * 0.013, 0.097, 0.086];
    const res = b.sprout(
      `eyeStalk${side}`,
      frame([s * 0.007, 0.036, 0.07], [0, 1, 0]),
      catmull([[s * 0.007, 0.036, 0.07], [s * 0.01, 0.066, 0.078], tip]),
      { radius: [0.0036, 0.0025], color: bodyBack, role: "tentacle", sides: 6 },
    );
    const bone = res.chain!.joints[res.chain!.joints.length - 1];
    b.part(sphere(0.0046), stalkColor, { at: tip, bone, name: `eyeBulb${side}` });
    b.part(sphere(0.0028), "#07070a", { at: [tip[0] + s * 0.0006, tip[1] + 0.0005, tip[2] + 0.0028], bone, name: `eye${side}` });
    b.part(sphere(0.0009, 6, 4), "#ffffff", { at: [tip[0] + s * 0.0014, tip[1] + 0.0018, tip[2] + 0.0049], bone, name: `glint${side}` });

    const ftip: [number, number, number] = [s * 0.016, 0.02, 0.112];
    const fres = b.sprout(`feeler${side}`, frame([s * 0.007, 0.027, 0.082], [0, 0, 1]), ftip, {
      radius: [0.0027, 0.0017],
      color: bodyBack,
      count: 1,
      role: "tentacle",
      sides: 6,
    });
    b.part(sphere(0.0024, 6, 5), "#9aab88", { at: ftip, bone: fres.chain!.joints[0], name: `feelerTip${side}` });
  }

  // ---------- shell ----------
  b.joint("shell", { parent: "root", at: [-0.006, 0.042, -0.012], dir: [0, 1, 0], role: "hinge" });
  const CARAMEL = "#c98a3c";
  const CHOC = "#4a2814";
  const CREAM = "#f1e2bd";
  const pattern = [CARAMEL, CHOC, CARAMEL, CREAM, CARAMEL, CARAMEL, CHOC, CREAM];
  const shellPaint = paint((p, n, s) => {
    const t = s[0];
    const a = (s[1] / 360) * 8 + 0.5 * (noise(p, 0.014, 3) - 0.5);
    const k = ((Math.floor(a) % 8) + 8) % 8;
    const f = a - Math.floor(a);
    let col = mix(pattern[k], pattern[(k + 1) % 8], smoothstep(0.88, 1, f));
    // growth lines
    const g = (t * 16) % 1;
    col = mix(col, "#2a160a", 0.22 * smoothstep(0.12, 0.0, g));
    // old apex darker, lip creamy
    col = mix(col, "#5a3219", 0.7 * smoothstep(0.12, 0.0, t));
    col = mix(col, "#f6ead0", smoothstep(0.93, 0.985, t));
    return col;
  });
  const c = new THREE.Vector3(-0.006, 0.042, -0.012);
  const shellPath = spiral(c, [c.x, c.y, c.z + 0.005], [1, 0, 0], { turns: 2.15, r1: 0.021, pitch: 0.006 });
  const shell = b.sweep(shellPath, (t) => 0.6 * (0.005 + 0.016 * t) * (1 + 0.12 * smoothstep(0.9, 1, t)), {
    color: shellPaint,
    bone: "shell",
    sides: 10,
    name: "shell",
    caps: "round",
  });

  // ---------- ladybird ----------
  const hit = b.surface(shell).ray([-0.004, 0.2, -0.012], [0, -1, 0])!;
  const base = hit.at;
  b.joint("ladybird", { parent: "shell", at: base, dir: [0, 0, 1] });
  const q = hit.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.7));
  const L = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(base);
  const lb = (g: THREE.BufferGeometry, col: string, pos: THREE.Vector3, scale: [number, number, number], name: string) =>
    b.part(g, col, { at: pos, quat: q, scale, bone: "ladybird", name });
  b.material("#d8281e").roughness = 0.25;
  lb(sphere(0.0055, 10, 7), "#d8281e", L(0, 0.0032, 0), [1, 0.7, 1.15], "elytra");
  lb(sphere(0.0056, 8, 6), "#14100f", L(0, 0.0032, 0), [0.1, 0.72, 1.16], "wingSeam");
  const dome = (x: number, z: number) =>
    0.0032 + 0.0039 * Math.sqrt(Math.max(0.02, 1 - (x / 0.0055) ** 2 - (z / 0.0063) ** 2));
  for (const [x, z] of [
    [0.0027, 0.002],
    [-0.0027, 0.002],
    [0.0028, -0.0027],
    [-0.0028, -0.0027],
    [0.0012, -0.0046],
    [-0.0012, -0.0046],
  ])
    lb(sphere(0.0012, 6, 5), "#14100f", L(x, dome(x, z), z), [1, 0.8, 1], "spot");
  lb(sphere(0.0028, 7, 5), "#14100f", L(0, 0.0028, 0.0064), [1.1, 0.8, 0.9], "ladyHead");
  for (const x of [1, -1]) {
    lb(sphere(0.0009, 5, 4), "#fff7e6", L(x * 0.0016, 0.0036, 0.0083), [1, 1, 0.8], "ladyEye");
    for (const z of [-0.0025, 0, 0.0025])
      lb(sphere(0.0007, 4, 3), "#14100f", L(x * 0.0052, 0.0006, z), [1, 1, 1.6], "ladyLeg");
  }

  // ---------- slime trail ----------
  b.extrude(
    [
      [-0.011, 0.05],
      [-0.0125, 0.12],
      [-0.009, 0.2],
      [-0.004, 0.26],
      [0.003, 0.2],
      [0.011, 0.12],
      [0.0125, 0.05],
    ],
    {
      color: "#cfe3dc",
      at: [0, 0, 0],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.0008,
      smoothing: 1,
      bone: "root",
      name: "slimeTrail",
    },
  );
  b.material("#cfe3dc").roughness = 0.1;

  return b.root;
}
