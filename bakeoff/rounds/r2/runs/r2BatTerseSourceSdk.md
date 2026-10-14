```ts
import * as THREE from "three";
import { createBuilder, paint, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Bat",
  description:
    "A stylized fruit-bat standing in a rest pose, wings spread. It has a rigged spine, neck, head, separate jaw, arm and finger chains for each wing, hind legs, and a tail. Wing membranes, big ears, fangs and clawed thumbs are built from primitives.",
};

type V = [number, number, number];
const lerp3 = (a: V, b: V, t: number): V => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export default function build() {
  const b = createBuilder({ name: "bat" });

  const FUR = countershade("#4b3a31", "#9a8068", { soft: 0.4 });
  const BONE = "#33272a";
  const MEM_A = "#5e4244";
  const MEM_B = "#4f393d";
  const PINK = "#c98a8a";
  const DARK = "#120d0f";

  // ---- spine, neck, head, jaw
  b.joint("root", { at: [0, 0.05, -0.045], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    [[0, 0.05, -0.045], [0, 0.054, -0.005], [0, 0.06, 0.04]],
    { parent: "root", names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  b.sweep(spine, {
    radius: (t: number) => 0.013 + 0.012 * Math.sin(Math.PI * Math.min(1, t * 0.85 + 0.12)),
    color: FUR,
    sides: 8,
  });

  b.joint("neck", { parent: "chest", at: [0, 0.063, 0.045], dir: [0, 0.2, 1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.068, 0.06], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.064, 0.074], dir: [0, 0, 1], role: "jaw" });

  const sph = (r: number) => new THREE.SphereGeometry(r, 8, 6);
  b.part(sph(0.012), "#a38a70", { at: [0, 0.062, 0.05], bone: "neck", scale: [1.3, 1, 1] }); // ruff
  b.part(sph(0.019), FUR, { at: [0, 0.07, 0.068], bone: "head", scale: [1, 0.95, 1.05] }); // cranium
  b.part(sph(0.011), FUR, { at: [0, 0.066, 0.088], bone: "head", scale: [1, 0.8, 1.25] }); // snout
  b.part(sph(0.0035), PINK, { at: [0, 0.068, 0.1], bone: "head", scale: [1.5, 1, 1] }); // nose
  b.part(new THREE.BoxGeometry(0.013, 0.005, 0.022), "#7a5a55", { at: [0, 0.059, 0.085], bone: "jaw" }); // lower jaw
  b.part(new THREE.BoxGeometry(0.01, 0.0015, 0.012), "#b05a66", { at: [0, 0.0615, 0.085], bone: "jaw" }); // tongue
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.0016, 0.007, 4), "#f1ead8", {
      at: [s * 0.005, 0.0605, 0.097], bone: "head", rotation: [180, 0, 0],
    });
    b.part(new THREE.ConeGeometry(0.0013, 0.005, 4), "#f1ead8", {
      at: [s * 0.004, 0.0645, 0.094], bone: "jaw",
    });
    b.part(sph(0.0036), DARK, { at: [s * 0.0095, 0.075, 0.084], bone: "head" }); // eye
    b.part(sph(0.0011), "#ffffff", { at: [s * 0.0105, 0.0765, 0.0865], bone: "head" });
    // ears
    b.extrude([[0, 0], [0.012, 0], [0.011, 0.03], [0.004, 0.047], [-0.002, 0.028]], {
      color: "#45342d", at: [s * 0.008, 0.082, 0.062], x: [s, 0, 0], y: [s * 0.25, 1, -0.15],
      thickness: 0.0022, bone: "head",
    });
    b.extrude([[0.002, 0.004], [0.0092, 0.004], [0.0082, 0.026], [0.0042, 0.037], [0.0005, 0.025]], {
      color: PINK, at: [s * 0.008, 0.082, 0.0625], x: [s, 0, 0], y: [s * 0.25, 1, -0.15],
      thickness: 0.0029, bone: "head",
    });
  }

  // ---- tail + uropatagium
  const tail = b.chain(
    "tail",
    [[0, 0.05, -0.045], [0, 0.05, -0.1], [0, 0.049, -0.15]],
    { parent: "root", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, { radius: [0.005, 0.0015], color: FUR, sides: 6 });

  // ---- wings and legs, mirrored
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: V = [s * 0.02, 0.062, 0.035];
    const el: V = [s * 0.07, 0.07, 0.01];
    const W: V = [s * 0.13, 0.065, 0.03];

    const arm = b.chain(`arm${S}`, [sh, el, W], {
      parent: "chest",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "wing",
    });
    b.sweep(arm, { radius: [0.006, 0.003, 0.0025], color: FUR, sides: 6 });

    // thumb + claw
    const thumb = b.chain(`thumb${S}`, [W, [s * 0.14, 0.066, 0.045]], {
      parent: `wrist${S}`, names: [`thumb${S}`], role: "digit",
    });
    b.sweep(thumb, { radius: [0.003, 0.002], color: BONE, sides: 5 });
    b.spike([s * 0.14, 0.066, 0.045], [s * 0.3, -0.7, 0.4], 0.01, 0.002, {
      color: "#d8cdb6", bone: `thumb${S}`,
    });

    // fingers
    const tips: V[] = [
      [s * 0.25, 0.058, 0.12],
      [s * 0.29, 0.055, 0.05],
      [s * 0.25, 0.05, -0.04],
      [s * 0.18, 0.045, -0.09],
    ];
    tips.forEach((T, i) => {
      const n = i + 2;
      const m = lerp3(W, T, 0.5);
      m[1] += 0.003;
      const f = b.chain(`finger${n}${S}`, [W, m, T], {
        parent: `wrist${S}`,
        names: [`finger${n}${S}a`, `finger${n}${S}b`, `finger${n}${S}tip`],
        role: "digit",
      });
      b.sweep(f, { radius: [0.0022, 0.0014, 0.0007], color: BONE, sides: 5 });
    });

    // membrane panels
    for (let i = 0; i < 3; i++) {
      const Ti = tips[i], Tj = tips[i + 1];
      const inner = lerp3(lerp3(Ti, Tj, 0.5), W, 0.22);
      b.slab([W, Ti, inner, Tj], {
        color: i % 2 ? MEM_B : MEM_A, thickness: 0.002, bone: `wrist${S}`,
      });
    }
    const ankle: V = [s * 0.045, 0.012, -0.055];
    const hipP: V = [s * 0.02, 0.048, -0.045];
    const t5 = tips[3];
    const scal = lerp3(lerp3(t5, ankle, 0.5), W, 0.12);
    b.slab([W, t5, scal, ankle, hipP, sh, el], {
      color: MEM_A, thickness: 0.002, bone: `elbow${S}`,
    });
    b.slab([[s * 0.014, 0.066, 0.05], W, el, sh], {
      color: MEM_B, thickness: 0.002, bone: `shoulder${S}`,
    });

    // hind leg
    const leg = b.chain(
      `leg${S}`,
      [[s * 0.022, 0.046, -0.05], [s * 0.04, 0.03, -0.07], ankle, [s * 0.05, 0.0025, -0.04]],
      { parent: "root", names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`], role: "leg" },
    );
    b.sweep(leg, { radius: [0.0065, 0.004, 0.0028, 0.0022], color: FUR, sides: 6 });
    for (const k of [-1, 0, 1])
      b.spike([s * 0.05, 0.0028, -0.04], [k * 0.45, 0, 1], 0.009, 0.0013, {
        color: "#d8cdb6", bone: `toe${S}`,
      });

    // uropatagium half
    b.slab([[s * 0.002, 0.05, -0.05], ankle, [s * 0.006, 0.049, -0.15]], {
      color: MEM_B, thickness: 0.002, bone: `hip${S}`,
    });
  }

  return b.root;
}
```