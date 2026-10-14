```ts
import * as THREE from "three";
import { createBuilder, patches, rng } from "agentic-3js-builder";

export const meta = {
  name: "Green Sea Turtle",
  description:
    "Stylized green sea turtle with a scute-patterned carapace, cream plastron, outstretched paddle flippers, and a jointed neck, jaw, tail and flippers.",
};

export default function build() {
  const b = createBuilder({ name: "seaTurtle" });

  const CREAM = "#e6d9a8";
  const RIM = "#c9b56a";
  const shellPaint = patches("#3a3418", ["#6b6a2e", "#7a6430", "#58592a", "#80702f"], { size: 0.15, gap: 0.1, seed: 4 });
  const skinPaint = patches("#4e5a2e", ["#6d6a38", "#7c6e3a", "#5f6534"], { size: 0.07, gap: 0.12, seed: 9 });
  const headPaint = patches("#d9c88a", ["#8a6a30", "#7a5a28", "#6d6a38"], { size: 0.05, gap: 0.14, seed: 2 });

  // ---- skeleton ----
  b.joint("root", { at: [0, 0.15, 0] });
  const spine = b.chain(
    "spine",
    [[0, 0.15, -0.4], [0, 0.15, 0], [0, 0.15, 0.4]],
    { parent: "root", names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    b.ctxPath ? [] : [[0, 0.17, 0.42], [0, 0.2, 0.62], [0, 0.24, 0.78]],
    { parent: "spine2", names: ["neck1", "neck2", "head"], role: "neck" },
  );
  const head = neck.tip!;
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.22, 0.82], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    [[0, 0.13, -0.48], [0, 0.11, -0.58], [0, 0.09, -0.68]],
    { parent: "spine1", names: ["tail1", "tail2"], role: "tail" },
  );

  // ---- carapace + plastron in one loft ----
  const st = (z: number, w: number, h: number, y = 0.15) => ({ at: [0, y, z] as [number, number, number], w, h });
  const shell = b.loft(
    [
      st(-0.52, 0.1, 0.1, 0.16),
      st(-0.4, 0.5, 0.22, 0.15),
      st(-0.2, 0.66, 0.28),
      st(0.05, 0.72, 0.3),
      st(0.28, 0.62, 0.27),
      st(0.42, 0.42, 0.2, 0.155),
      st(0.5, 0.24, 0.12, 0.16),
    ],
    {
      color: shellPaint,
      sides: 14,
      bone: spine.joints[1],
      sectors: [
        [72, 100, RIM],
        [100, 260, CREAM],
        [260, 288, RIM],
      ],
    },
  );

  // neck, head
  b.sweep(neck, [0.1, 0.08, 0.072], {
    color: skinPaint,
    sides: 8,
    sectors: [[100, 260, CREAM]],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), headPaint, { at: [0, 0.24, 0.84], bone: head, scale: [0.082, 0.068, 0.115] });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#8a7a3c", { at: [0, 0.232, 0.915], bone: head, scale: [0.058, 0.032, 0.06] });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { at: [0, 0.2, 0.89], bone: jaw, scale: [0.055, 0.02, 0.08] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 8, 6), "#111111", { at: [s * 0.072, 0.262, 0.86], bone: head });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), "#ffffff", { at: [s * 0.081, 0.268, 0.874], bone: head });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#2a2410", { at: [s * 0.018, 0.246, 0.95], bone: head });
  }

  // tail
  b.sweep(tail, [0.045, 0.028, 0.012], { color: skinPaint, sides: 7, sectors: [[100, 260, "#cdbf8a"]] });

  // ---- flippers ----
  const front = (t: number) => {
    const w = t < 0.35 ? 0.05 + 0.06 * (t / 0.35) : 0.11 * Math.pow(1 - (t - 0.35) / 0.65, 0.8) + 0.012;
    return [w, 0.018 - 0.009 * t] as [number, number];
  };
  const rear = (t: number) => {
    const w = t < 0.3 ? 0.035 + 0.04 * (t / 0.3) : 0.075 * Math.pow(1 - (t - 0.3) / 0.7, 0.8) + 0.01;
    return [w, 0.015 - 0.007 * t] as [number, number];
  };
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const f = b.chain(
      `flipperF${S}`,
      [[s * 0.25, 0.12, 0.22], [s * 0.55, 0.1, 0.15], [s * 0.92, 0.08, 0.02]],
      {
        parent: "spine2",
        up: [0, 1, 0],
        names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
        role: "arm",
      },
    );
    b.sweep(f, front, { color: skinPaint, sides: 8, sectors: [[100, 260, CREAM]] });
    b.spike(f.at(0.82), [s * 0.5, 0.05, 0.3], 0.05, 0.012, { color: "#d8d0b0", bone: f.tip! });

    const r = b.chain(
      `flipperR${S}`,
      [[s * 0.22, 0.1, -0.32], [s * 0.38, 0.09, -0.5], [s * 0.52, 0.08, -0.72]],
      {
        parent: "spine1",
        up: [0, 1, 0],
        names: [`hip${S}`, `knee${S}`, `foot${S}`],
        role: "leg",
      },
    );
    b.sweep(r, rear, { color: skinPaint, sides: 8, sectors: [[100, 260, CREAM]] });
  }

  // ---- barnacles on the shell ----
  const hits = b.surface(shell).scatter(14, { rng: rng(3), minDist: 0.1, filter: (h) => h.n.y > 0.4 });
  const bump = new THREE.IcosahedronGeometry(0.018, 0);
  hits.forEach((h, i) => b.stick(bump, i % 3 === 0 ? "#9fb08a" : "#cfcab8", h, { scale: 0.7 + 0.2 * (i % 3), embed: 0.4 }));

  return b.root;
}
```