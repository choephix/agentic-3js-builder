```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, mix, smoothstep, noise, rng } from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed toucan on a mossy branch",
  description:
    "Rainbow-beaked toucan with a lemon bib, lime eye rings, blue feet and scarlet undertail, perched beside a pink orchid.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "toucan" });
  const S = new THREE.SphereGeometry(1, 12, 8);
  const rand = rng(11);

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0, 0] });
  b.joint("hips", { parent: "root", at: [0, 0.2, 0], role: "spine" });
  b.joint("chest", { parent: "hips", at: [0, 0.24, 0.05], role: "spine" });
  b.joint("neck1", { parent: "chest", at: [0, 0.28, 0.1], dir: [0, 1, 0.6], role: "neck" });
  b.joint("neck2", { parent: "neck1", at: [0, 0.31, 0.13], dir: [0, 1, 0.6], role: "neck" });
  b.joint("head", { parent: "neck2", at: [0, 0.335, 0.15], dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.298, 0.15], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.14, -0.1],
      [0, 0.1, -0.22],
      [0, 0.065, -0.34],
      [0, 0.045, -0.45],
    ]),
    { parent: "hips", role: "tail", count: 3, up: [0, 1, 0] },
  );

  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    b.joint(`shoulder${side}`, { parent: "chest", at: [0.07 * sx, 0.24, 0.02], dir: [0, -0.4, -1], role: "wing" });
    b.joint(`elbow${side}`, { parent: `shoulder${side}`, at: [0.075 * sx, 0.19, -0.07], dir: [0, -0.5, -1], role: "wing" });
    b.joint(`wrist${side}`, { parent: `elbow${side}`, at: [0.075 * sx, 0.14, -0.16], dir: [0, -0.5, -1], role: "wing" });
    b.joint(`hip${side}`, { parent: "hips", at: [0.035 * sx, 0.14, 0], dir: [0, -1, 0.3], role: "leg" });
    b.joint(`knee${side}`, { parent: `hip${side}`, at: [0.04 * sx, 0.105, 0.02], dir: [0, -1, -0.3], role: "leg" });
    b.joint(`ankle${side}`, { parent: `knee${side}`, at: [0.035 * sx, 0.068, 0], dir: [0, 0, 1], role: "leg" });
  }

  // ---------- palettes ----------
  const sheen = paint((p, n) => mix("#07070b", "#232f58", smoothstep(0.2, 1, n.y) * 0.8));
  const lime = "#9be02b", sky = "#2fb4ea", orange = "#ff8a1c", red = "#d8142a";
  const beakPaint = paint((p, n) => {
    const t = (p.z - 0.17) / 0.24;
    const low = mix(sky, orange, smoothstep(0.2, 0.36, t));
    let c = mix(low, lime, smoothstep(0.15, 0.55, n.y) * smoothstep(0.02, 0.1, t));
    c = mix(c, red, smoothstep(0.84, 0.92, t));
    c = mix(c, "#111111", 1 - smoothstep(0.0, 0.05, t));
    return c;
  });

  const place = (
    color: string | ReturnType<typeof paint>,
    at: number[],
    scale: number[],
    bone: string,
    rot: number[] = [0, 0, 0],
  ) => b.part(S, color, { at, scale, rotation: rot, bone });

  // ---------- body ----------
  place(sheen, [0, 0.2, -0.01], [0.08, 0.085, 0.15], "hips", [-35, 0, 0]);
  place(sheen, [0, 0.3, 0.125], [0.055, 0.06, 0.065], "neck1");
  place(sheen, [0, 0.34, 0.15], [0.052, 0.058, 0.064], "head");
  // bib
  place("#ffe84a", [0, 0.285, 0.145], [0.052, 0.058, 0.043], "neck2");
  place("#ffe040", [0, 0.255, 0.14], [0.06, 0.075, 0.05], "chest", [-35, 0, 0]);
  place("#e8402a", [0, 0.2, 0.12], [0.045, 0.012, 0.03], "chest", [-35, 0, 0]);
  // scarlet undertail
  place("#e5102a", [0, 0.122, -0.115], [0.045, 0.03, 0.055], "hips", [-35, 0, 0]);

  // eyes
  for (const sx of [1, -1]) {
    place(lime, [0.044 * sx, 0.348, 0.165], [0.011, 0.03, 0.03], "head");
    place("#2a1408", [0.052 * sx, 0.348, 0.167], [0.012, 0.013, 0.013], "head");
    place("#ffffff", [0.062 * sx, 0.352, 0.172], [0.003, 0.004, 0.004], "head");
    place("#101010", [0.028 * sx, 0.345, 0.222], [0.006, 0.007, 0.012], "head");
  }

  // ---------- beak ----------
  b.sweep(
    catmull([
      [0, 0.338, 0.15],
      [0, 0.338, 0.26],
      [0, 0.322, 0.35],
      [0, 0.295, 0.41],
    ]),
    (t) => [0.032 * (1 - 0.5 * t), 0.044 * Math.pow(1 - t, 0.7) + 0.01],
    { color: beakPaint, bone: "head", caps: "round", sides: 10, name: "upperBeak" },
  );
  b.sweep(
    catmull([
      [0, 0.298, 0.15],
      [0, 0.298, 0.26],
      [0, 0.29, 0.35],
      [0, 0.275, 0.4],
    ]),
    (t) => [0.028 * (1 - 0.5 * t), 0.025 * (1 - t) + 0.008],
    { color: beakPaint, bone: "jaw", caps: "round", sides: 10, name: "lowerBeak" },
  );

  // ---------- tail ----------
  b.sweep(tail, (t) => [0.03 + 0.016 * Math.sin(Math.min(t * 1.6, 1) * Math.PI * 0.5) - 0.012 * t * t * t, 0.009], {
    color: sheen,
    sides: 8,
    name: "tailFeathers",
  });

  // ---------- wings ----------
  const wingOutline: [number, number][] = [
    [0.06, 0.03], [-0.02, 0.06], [-0.1, 0.03], [-0.2, -0.07], [-0.26, -0.14], [-0.14, -0.12], [-0.04, -0.1], [0.04, -0.05],
  ];
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    b.extrude(wingOutline, {
      color: sheen,
      at: [0.072 * sx, 0.225, 0.02],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.006,
      smoothing: 1,
      bone: `shoulder${side}`,
      name: `wing${side}`,
    });
  }

  // ---------- legs & feet ----------
  const toes: [number, number][] = [[0.012, 0.055], [-0.01, 0.055], [0.012, -0.04], [-0.01, -0.04]];
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    b.capsule([0.035 * sx, 0.14, 0], [0.04 * sx, 0.105, 0.02], 0.019, { color: "#0b0b10", bone: `hip${side}` });
    b.capsule([0.04 * sx, 0.105, 0.02], [0.035 * sx, 0.07, 0], 0.011, { color: "#1e7fe0", bone: `knee${side}` });
    place("#1e7fe0", [0.035 * sx, 0.066, 0], [0.014, 0.012, 0.014], `ankle${side}`);
    toes.forEach(([dx, dz], i) => {
      const jn = `toe${side}${i + 1}`;
      b.joint(jn, { parent: `ankle${side}`, at: [0.035 * sx, 0.066, 0], dir: [dx * sx, 0, dz], role: "digit" });
      const tip = [(0.035 + dx) * sx, 0.066, dz];
      b.capsule([0.035 * sx, 0.066, 0], tip, 0.0085, { color: "#2a8cf0", bone: jn, sides: 6 });
      const len = Math.hypot(dx, dz);
      b.spike(tip, [(dx * sx) / len, -0.5, dz / len], 0.014, 0.005, { color: "#0c0c0c", bone: jn, sides: 5 });
    });
  }

  // ---------- branch ----------
  const bark = paint((p, n) => {
    const m = noise(p, 0.05, 3);
    const base = mix("#5b3f27", "#3f2b1b", noise(p, 0.02, 1));
    return mix(base, "#4f9030", smoothstep(0.3, 0.7, 0.5 * n.y + 0.6 * m));
  });
  b.sweep(
    catmull([
      [-0.33, 0.045, 0],
      [-0.12, 0.031, 0.005],
      [0, 0.031, 0],
      [0.15, 0.033, -0.004],
      [0.33, 0.047, 0.01],
    ]),
    (t) => 0.03 + 0.003 * Math.sin(t * 9),
    { color: bark, bone: "root", caps: "round", sides: 10, name: "branch" },
  );
  const mossCols = ["#4f8a2e", "#6aa83a", "#3b6e28", "#7dbb45"];
  const mossAt = [[-0.27, 0.07, 0.0], [-0.2, 0.062, 0.015], [-0.13, 0.062, -0.01], [0.1, 0.062, 0.01], [0.29, 0.075, 0.0],
    [-0.22, 0.035, 0.03], [0.12, 0.04, -0.03], [0.26, 0.045, 0.03], [-0.08, 0.036, -0.032]];
  mossAt.forEach((p, i) => {
    const s = 0.018 + rand() * 0.014;
    place(mossCols[i % 4], p, [s * 1.3, s * 0.6, s * 1.1], "root", [0, rand() * 90, 0]);
  });
  // twig with leaves
  b.sweep(
    catmull([[-0.2, 0.055, 0], [-0.215, 0.1, -0.015], [-0.245, 0.14, -0.03]]),
    [0.01, 0.005],
    { color: "#5b3f27", bone: "root", sides: 6, name: "twig" },
  );
  place("#5fae3a", [-0.255, 0.15, -0.035], [0.012, 0.004, 0.03], "root", [-20, 30, 10]);
  place("#78c24a", [-0.235, 0.145, -0.02], [0.012, 0.004, 0.028], "root", [-20, -40, -10]);

  // ---------- orchid ----------
  b.sweep(
    catmull([[0.2, 0.058, 0], [0.19, 0.12, -0.005], [0.2, 0.18, 0], [0.215, 0.222, 0.005]]),
    [0.005, 0.0035],
    { color: "#4c9a3a", bone: "root", sides: 6, name: "orchidStem" },
  );
  const leafCols = ["#2f7a34", "#3a8a3a", "#2a6e30"];
  place(leafCols[0], [0.2, 0.075, 0.055], [0.022, 0.005, 0.065], "root", [-12, 0, 0]);
  place(leafCols[1], [0.232, 0.072, 0.038], [0.02, 0.005, 0.06], "root", [-12, 40, 0]);
  place(leafCols[2], [0.168, 0.072, 0.038], [0.02, 0.005, 0.06], "root", [-12, -40, 0]);
  // buds
  place("#d94b8f", [0.185, 0.17, 0.006], [0.01, 0.014, 0.01], "root");
  place("#e870a8", [0.19, 0.145, 0.005], [0.008, 0.011, 0.008], "root");
  // bloom
  const cx = 0.215, cy = 0.225, cz = 0.015;
  const F = (x: number, y: number, z: number) => [cx + x, cy + y, cz + z];
  place("#ff9ec6", F(0, 0.036, 0), [0.017, 0.032, 0.004], "root");
  place("#ff9ec6", F(0.024, -0.026, 0), [0.015, 0.032, 0.004], "root", [0, 0, 30]);
  place("#ff9ec6", F(-0.024, -0.026, 0), [0.015, 0.032, 0.004], "root", [0, 0, -30]);
  place("#ffb8d8", F(0.034, 0.004, 0.005), [0.036, 0.028, 0.005], "root", [0, 0, 14]);
  place("#ffb8d8", F(-0.034, 0.004, 0.005), [0.036, 0.028, 0.005], "root", [0, 0, -14]);
  place("#e0388a", F(0, -0.014, 0.011), [0.013, 0.02, 0.006], "root");
  place("#c02070", F(0.011, -0.03, 0.012), [0.006, 0.012, 0.004], "root", [0, 0, 25]);
  place("#c02070", F(-0.011, -0.03, 0.012), [0.006, 0.012, 0.004], "root", [0, 0, -25]);
  place("#fff3a0", F(0, 0.008, 0.014), [0.008, 0.01, 0.007], "root");
  place("#d6307f", F(0.04, 0.006, 0.01), [0.006, 0.006, 0.002], "root");
  place("#d6307f", F(-0.04, 0.006, 0.01), [0.006, 0.006, 0.002], "root");

  return b.root;
}
```