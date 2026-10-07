```ts
import * as THREE from "three";
import { createBuilder, catmull, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Scorpion",
  description:
    "A golden desert scorpion standing in a rest pose: segmented body, eight legs, two open pincers, curled tail with a stinger, rigged with jaw, tail, leg and claw joints.",
};

export default function build() {
  const b = createBuilder({ name: "scorpion" });

  const AMBER = "#b5722a";
  const AMBER_D = "#8a5220";
  const DARK = "#4a2a10";
  const LEG = "#a8641f";
  const CLAW = "#7a3f14";
  const BLACK = "#0a0a0a";
  const skin = mottle(AMBER, "#9a5e22", { size: 0.025, seed: 3 });

  const sph = (rx: number, ry: number, rz: number, color: any, at: any, opts: any = {}) =>
    b.part({
      geometry: new THREE.SphereGeometry(1, b.segments(10), b.segments(6)),
      color,
      at,
      scale: [rx, ry, rz],
      flat: true,
      ...opts,
    });

  // ---- skeleton core
  const root = b.joint("root", { at: [0, 0.034, 0.03] });
  const spine = b.chain("spine", catmull([[0, 0.034, 0.03], [0, 0.033, -0.04], [0, 0.032, -0.125]]), {
    role: "spine",
    count: 3,
    parent: root,
  });
  const head = b.joint("head", { parent: root, at: [0, 0.036, 0.07], dir: [0, 0, 1], role: "head" });

  // ---- body
  b.loft(
    [
      { at: [0, 0.03, 0.06], w: 0.05, h: 0.024 },
      { at: [0, 0.031, 0.0], w: 0.064, h: 0.028 },
      { at: [0, 0.03, -0.065], w: 0.062, h: 0.026 },
      { at: [0, 0.03, -0.128], w: 0.036, h: 0.02 },
    ],
    { color: skin, bone: spine, name: "belly" },
  );
  // carapace
  sph(0.034, 0.017, 0.046, skin, [0, 0.037, 0.04], { bone: root, name: "carapace" });
  sph(0.024, 0.012, 0.02, AMBER_D, [0, 0.04, 0.072], { bone: root });
  sph(0.008, 0.007, 0.012, AMBER, [0, 0.052, 0.05], { bone: root }); // eye mound
  for (const s of [1, -1]) {
    sph(0.0045, 0.0045, 0.0045, BLACK, [s * 0.006, 0.057, 0.052], { bone: root });
    for (let k = 0; k < 3; k++)
      sph(0.0032, 0.0032, 0.0032, BLACK, [s * (0.024 - k * 0.002), 0.045, 0.078 - k * 0.009], { bone: root });
  }
  // mesosoma tergites
  for (let i = 0; i < 7; i++) {
    const w = 0.037 - i * 0.0014;
    sph(w, 0.012, 0.0105, i % 2 ? AMBER_D : AMBER, [0, 0.037 - i * 0.0002, -0.012 - i * 0.0165], {
      name: `tergite${i + 1}`,
    });
    sph(0.004, 0.005, 0.008, DARK, [0, 0.047, -0.012 - i * 0.0165]);
  }

  // ---- chelicerae (upper fixed finger on head, lower movable finger on jaw)
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const jaw = b.joint(`jaw${S}`, { parent: head, at: [s * 0.011, 0.031, 0.095], dir: [0, 0, 1], role: "jaw" });
    b.part(new THREE.BoxGeometry(0.014, 0.012, 0.016), AMBER_D, { at: [s * 0.011, 0.035, 0.088], bone: head, flat: true });
    b.spike([s * 0.011, 0.038, 0.094], [0, -0.1, 1], 0.018, 0.0045, { color: CLAW, bone: head });
    b.spike([s * 0.011, 0.031, 0.094], [0, 0.1, 1], 0.018, 0.0042, { color: CLAW, bone: jaw });
  }

  // ---- pedipalps
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `palp${S}`,
      catmull([
        [s * 0.03, 0.034, 0.07],
        [s * 0.062, 0.034, 0.098],
        [s * 0.06, 0.032, 0.145],
        [s * 0.05, 0.031, 0.178],
      ]),
      { role: "arm", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], parent: root },
    );
    b.sweep(arm, { radius: [0.0095, 0.0078, 0.0068, 0.0075], color: AMBER, name: `palpArm${S}` });
    const j1 = arm.joints[1];
    sph(0.0095, 0.0095, 0.0095, AMBER_D, [s * 0.062, 0.034, 0.098], { bone: j1 });
    sph(0.017, 0.012, 0.022, skin, [s * 0.047, 0.031, 0.192], { bone: arm, name: `hand${S}` });
    const pincer = b.joint(`pincer${S}`, {
      parent: arm,
      at: [s * 0.056, 0.031, 0.203],
      dir: [0, 0, 1],
      role: "digit",
    });
    b.sweep(
      catmull([
        [s * 0.037, 0.031, 0.205],
        [s * 0.036, 0.031, 0.236],
        [s * 0.042, 0.031, 0.262],
      ]),
      { radius: [0.0085, 0.006, 0.0015], color: CLAW, bone: arm, name: `fixedFinger${S}` },
    );
    b.sweep(
      catmull([
        [s * 0.058, 0.031, 0.205],
        [s * 0.063, 0.031, 0.236],
        [s * 0.054, 0.031, 0.261],
      ]),
      { radius: [0.0085, 0.006, 0.0015], color: CLAW, bone: pincer, name: `movableFinger${S}` },
    );
  }

  // ---- walking legs
  const fzs = [1, 0.35, -0.45, -1];
  const zcs = [0.062, 0.042, 0.022, 0.002];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const fz = fzs[i];
      const zc = zcs[i];
      const pts: [number, number, number][] = [
        [s * 0.026, 0.03, zc],
        [s * 0.068, 0.05, zc + fz * 0.016],
        [s * 0.1, 0.034, zc + fz * 0.04],
        [s * 0.118, 0.002, zc + fz * 0.058],
      ];
      const leg = b.chain(`leg${S}${i + 1}`, catmull(pts), {
        role: "leg",
        parent: root,
        names: [`hip${S}${i + 1}`, `knee${S}${i + 1}`, `ankle${S}${i + 1}`, `foot${S}${i + 1}`],
      });
      b.sweep(leg, { radius: [0.0048, 0.0036, 0.0026, 0.0014], color: LEG, name: `leg${S}${i + 1}` });
      sph(0.0058, 0.0058, 0.0058, DARK, pts[1], { bone: leg.joints[1] });
      sph(0.0042, 0.0042, 0.0042, AMBER_D, pts[2], { bone: leg.joints[2] });
    }
  }

  // ---- tail (metasoma) and stinger
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.032, -0.125],
      [0, 0.036, -0.16],
      [0, 0.056, -0.195],
      [0, 0.09, -0.207],
      [0, 0.125, -0.195],
      [0, 0.15, -0.165],
      [0, 0.162, -0.13],
    ]),
    {
      role: "tail",
      parent: spine,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "telson"],
      count: 5,
    },
  );
  // The chain made by `count` has 5 spans; the tip joint comes from the 6th name only when counts match.
  const tr = (t: number) => {
    const f = (t * 5) % 1;
    const base = 0.0135 - 0.0055 * t;
    return base * (0.82 + 0.18 * Math.sin(Math.PI * f));
  };
  b.sweep(tail, {
    radius: tr,
    color: (t: number) => (Math.floor(Math.min(t, 0.999) * 5) % 2 ? AMBER_D : AMBER),
    name: "metasoma",
  });
  const end = tail.at(1);
  const d = end.axis.clone();
  const c = end.at.clone().addScaledVector(d, 0.006);
  const tipBone = tail.tip ?? tail.joints[tail.joints.length - 1];
  b.part(new THREE.SphereGeometry(1, b.segments(10), b.segments(6)), "#8a4a1c", {
    at: c,
    dir: d,
    axis: "z",
    scale: [0.0105, 0.009, 0.014],
    bone: tipBone,
    flat: true,
    name: "telsonBulb",
  });
  const down = new THREE.Vector3(0, -1, 0);
  b.sweep(
    catmull([
      c.clone().addScaledVector(d, 0.008),
      c.clone().addScaledVector(d, 0.018).addScaledVector(down, 0.003),
      c.clone().addScaledVector(d, 0.022).addScaledVector(down, 0.016),
    ]),
    { radius: [0.0062, 0.0035, 0.0005], color: "#1e0f06", bone: tipBone, name: "stinger" },
  );

  return b.root;
}
```