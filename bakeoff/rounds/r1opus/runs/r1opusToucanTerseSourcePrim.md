```ts
import * as THREE from "three";
import { createBuilder, mottle, paint, mix, smoothstep, grain, stripes, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Toco Toucan",
  description:
    "A stylized low-poly toco toucan in a rigging rest pose: glossy black plumage, white bib, red undertail, a huge painted orange beak with a split jaw and a black tip, wings spread wide, and zygodactyl feet.",
};

export default function build() {
  const b = createBuilder({ name: "toucan", paintSize: 1024 });

  // Palette
  const BLACK = "#0f1015";
  const BLACK2 = "#1d2030";
  const WHITE = "#f6f3ea";
  const CREAM = "#f4dc84";
  const RED = "#d8262b";
  const LEG = "#5c7aa6";
  const LEG2 = "#3e5a84";
  const CLAW = "#1e1e24";

  const plumage = mottle(BLACK, BLACK2, { size: 0.025, seed: 3, contrast: 0.8 });

  // ---------- Skeleton ----------
  b.joint("hips", { at: [0, 0.16, -0.03], dir: [0, 0.6, 1] });
  const spine = b.chain("spine", [[0, 0.16, -0.03], [0, 0.215, 0.03], [0, 0.28, 0.072]], {
    names: ["spine1", "spine2"],
    role: "spine",
    parent: "hips",
  });
  const neck = b.chain("neckChain", [[0, 0.28, 0.072], [0, 0.33, 0.095]], {
    names: ["neck"],
    role: "neck",
    parent: "spine2",
  });
  b.joint("head", { at: [0, 0.34, 0.1], dir: [0, 0, 1], parent: "neck", role: "head" });
  b.joint("jaw", { at: [0, 0.318, 0.13], aim: [0, 0.292, 0.315], parent: "head", role: "jaw" });
  const tail = b.chain("tail", [[0, 0.165, -0.09], [0, 0.15, -0.18], [0, 0.13, -0.285]], {
    names: ["tail1", "tail2"],
    role: "tail",
    parent: "hips",
  });

  // ---------- Body ----------
  const bodyPaint = paint((p, n) => {
    if (p.z < -0.065 && n.y < -0.15) return RED;
    if (p.z < -0.06 && n.y > 0.35) return WHITE;
    const edge = 0.248 + 0.015 * Math.abs(n.x);
    if (n.z > 0.05 && p.y > edge) return mix(WHITE, CREAM, smoothstep(0.29, 0.335, p.y));
    if (n.z > 0.15 && p.y > edge - 0.007) return "#f2a23a";
    return plumage;
  });
  b.loft(
    [
      { at: [0, 0.15, -0.11], w: 0.06, h: 0.05 },
      { at: [0, 0.165, -0.05], w: 0.105, h: 0.1 },
      { at: [0, 0.205, 0.02], w: 0.115, h: 0.115 },
      { at: [0, 0.255, 0.065], w: 0.095, h: 0.095 },
      { at: [0, 0.3, 0.09], w: 0.07, h: 0.07 },
    ],
    { color: bodyPaint, bone: ["hips", spine, neck], sides: 10, name: "body" },
  );
  // Blocky tufts: white rump, red undertail coverts
  b.part(new THREE.SphereGeometry(0.03, 8, 6), WHITE, {
    at: [0, 0.183, -0.095], bone: "hips", scale: [1, 0.45, 1.15], name: "rump",
  });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), RED, {
    at: [0, 0.138, -0.088], bone: "hips", scale: [1.1, 0.6, 1.25], name: "undertail",
  });

  // ---------- Head ----------
  const headPaint = paint((p, n) => {
    if (p.y < 0.345 && n.z > -0.3) return mix(WHITE, CREAM, smoothstep(0.1, 0.15, p.z));
    return plumage;
  });
  b.part(new THREE.SphereGeometry(0.05, 12, 9), headPaint, {
    at: [0, 0.34, 0.1], bone: "head", scale: [0.95, 1, 1.05], name: "headBall",
  });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.021, 10, 8), "#f08a1c", {
      at: [s * 0.043, 0.352, 0.118], bone: "head", scale: [0.35, 0.8, 1], name: `eyeSkin${S}`,
    });
    b.part(new THREE.TorusGeometry(0.0095, 0.0028, 6, 14), "#3a7bd5", {
      at: [s * 0.0485, 0.353, 0.12], dir: [s, 0, 0], axis: "z", bone: "head", name: `eyeRing${S}`,
    });
    b.part(new THREE.SphereGeometry(0.0068, 8, 6), "#0a0a0c", {
      at: [s * 0.0465, 0.353, 0.12], bone: "head", name: `eye${S}`,
    });
    b.part(new THREE.SphereGeometry(0.0019, 5, 4), "#ffffff", {
      at: [s * 0.0525, 0.3565, 0.1235], bone: "head", name: `eyeGlint${S}`,
    });
  }

  // ---------- Beak ----------
  const upperPaint = paint((p, n) => {
    const t = (p.z - 0.135) / 0.2;
    if (t < 0.035) return "#16120e";
    const serr = n.y + 0.45 + 0.12 * Math.sin(p.z * 220);
    let c = t < 0.5 ? mix("#ffd43b", "#ff8a1e", t / 0.5) : mix("#ff8a1e", "#ec4a1c", (t - 0.5) / 0.36);
    if (n.y > 0.75) c = mix(c, "#e2321c", 0.6);
    if (Math.abs(serr) < 0.1 && t > 0.08 && t < 0.84) c = mix(c, "#7a2410", 0.85);
    return mix(c, "#141210", smoothstep(0.83, 0.88, t));
  });
  b.loft(
    [
      { at: [0, 0.35, 0.132], w: 0.046, h: 0.062 },
      { at: [0, 0.348, 0.19], w: 0.04, h: 0.055 },
      { at: [0, 0.338, 0.25], w: 0.032, h: 0.045 },
      { at: [0, 0.322, 0.3], w: 0.022, h: 0.03 },
      { at: [0, 0.301, 0.335], w: 0.009, h: 0.013 },
    ],
    { color: upperPaint, bone: "head", sides: 10, name: "beakUpper" },
  );
  const lowerPaint = paint((p) => {
    const t = (p.z - 0.135) / 0.18;
    if (t < 0.04) return "#16120e";
    const c = mix("#ffb52e", "#f2601c", t);
    return mix(c, "#141210", smoothstep(0.84, 0.9, t));
  });
  b.loft(
    [
      { at: [0, 0.312, 0.135], w: 0.04, h: 0.03 },
      { at: [0, 0.305, 0.2], w: 0.034, h: 0.024 },
      { at: [0, 0.298, 0.27], w: 0.022, h: 0.016 },
      { at: [0, 0.293, 0.315], w: 0.008, h: 0.006 },
    ],
    { color: lowerPaint, bone: "jaw", sides: 10, name: "beakLower" },
  );

  // ---------- Tail ----------
  const tailPaint = grain(BLACK, "#232634", { size: 0.006, axis: "z", seed: 5 });
  for (let k = 0; k < 6; k++) {
    const xo = (k - 2.5) * 0.009;
    const lift = (2.5 - Math.abs(k - 2.5)) * 0.0025;
    const base: [number, number, number] = [xo, 0.168 + lift, -0.085];
    const midP: [number, number, number] = [xo * 1.25, 0.152 + lift - Math.abs(xo) * 0.2, -0.18];
    const tip: [number, number, number] = [xo * 1.6, 0.132 + lift - Math.abs(xo) * 0.4, -0.29 + Math.abs(xo) * 0.4];
    b.sweep([base, midP, tip], (t) => [0.0075 + 0.003 * t, 0.0032], {
      section: "box", bone: tail, color: tailPaint, caps: "flat", name: `tailFeather${k + 1}`,
    });
  }

  // ---------- Sides: legs, toes, wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.035, 0.15, 0.0];
    const knee: [number, number, number] = [s * 0.042, 0.1, 0.035];
    const foot: [number, number, number] = [s * 0.042, 0.009, 0.02];
    b.chain(`leg${S}`, [hip, knee, foot], {
      names: [`hip${S}`, `knee${S}`, `foot${S}`], role: "leg", parent: "hips",
    });
    b.capsule(hip, knee, [0.02, 0.016], { color: plumage, bone: `hip${S}`, name: `thigh${S}` });
    b.capsule(knee, foot, 0.0065, {
      color: stripes(LEG, LEG2, { size: 0.008, axis: "y", width: 0.25, wobble: 0.1, seed: 2 }),
      bone: `knee${S}`, sides: 6, name: `tarsus${S}`,
    });
    b.part(new THREE.SphereGeometry(0.0085, 7, 5), LEG2, { at: foot, bone: `foot${S}`, name: `footPad${S}` });

    const toes = [
      { a: 12, len: 0.036 },
      { a: -20, len: 0.033 },
      { a: 158, len: 0.028 },
      { a: -165, len: 0.026 },
    ];
    toes.forEach((toe, i) => {
      const r = (toe.a * Math.PI) / 180;
      const dir = new THREE.Vector3(s * Math.sin(r), 0, Math.cos(r));
      const tip: [number, number, number] = [foot[0] + dir.x * toe.len, 0.005, foot[2] + dir.z * toe.len];
      const name = `toe${i + 1}${S}`;
      b.chain(name, [foot, tip], { names: [name], role: "digit", parent: `foot${S}` });
      b.capsule(foot, tip, 0.005, { color: LEG, bone: name, sides: 6, name: `${name}Mesh` });
      b.spike(tip, [dir.x, -0.35, dir.z], 0.009, 0.0028, { color: CLAW, bone: name, sides: 5, name: `${name}Claw` });
    });

    // Wing
    const wing = b.chain(
      `wing${S}`,
      [
        [s * 0.06, 0.25, 0.02],
        [s * 0.15, 0.26, 0.0],
        [s * 0.24, 0.26, -0.02],
        [s * 0.32, 0.258, -0.045],
      ],
      { names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `wingTip${S}`], role: "wing", parent: "spine2" },
    );
    b.sweep(wing, [0.016, 0.006], { color: BLACK, sides: 8, name: `wingArm${S}` });
    b.membrane(
      wing,
      catmull([
        [s * 0.06, 0.245, -0.07],
        [s * 0.15, 0.25, -0.105],
        [s * 0.24, 0.252, -0.09],
        [s * 0.305, 0.252, -0.06],
      ]),
      { color: "#13151c", thickness: 0.01, name: `wingWeb${S}` },
    );
    // Primaries: a fanned hand of blocky feathers
    for (let k = 0; k < 7; k++) {
      const f = k / 6;
      const base = new THREE.Vector3(s * (0.2 + 0.1 * f), 0.251 + 0.0015 * k, -0.07 + 0.02 * f);
      const th = ((25 + 60 * f) * Math.PI) / 180;
      const dir = new THREE.Vector3(s * Math.sin(th), 0, -Math.cos(th));
      const len = 0.075 + 0.02 * Math.sin(Math.PI * f);
      const tip = base.clone().addScaledVector(dir, len);
      b.frustumBox(base, tip, [0.024, 0.005], [0.014, 0.003], {
        color: k % 2 ? "#1a1d28" : "#0e0f14", bone: `wrist${S}`, up: [0, 1, 0], name: `primary${k + 1}${S}`,
      });
    }
    // Secondaries along the arm
    for (let k = 0; k < 5; k++) {
      const f = k / 4;
      const base = new THREE.Vector3(s * (0.07 + 0.12 * f), 0.246 - 0.001 * k, -0.05 - 0.025 * f);
      const dir = new THREE.Vector3(s * 0.25, 0, -1).normalize();
      const tip = base.clone().addScaledVector(dir, 0.055);
      b.frustumBox(base, tip, [0.026, 0.005], [0.02, 0.003], {
        color: k % 2 ? "#0e0f14" : "#1a1d28", bone: k >= 2 ? `elbow${S}` : `shoulder${S}`, up: [0, 1, 0],
        name: `secondary${k + 1}${S}`,
      });
    }
  }

  return b.root;
}
```