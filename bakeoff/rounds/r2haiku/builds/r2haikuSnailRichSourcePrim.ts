import * as THREE from "three";
import { createBuilder, paint, spots } from "../../../../src/index";

export const meta = {
  name: "Garden snail on an adventure",
  description:
    "A grey-green garden snail with a caramel, chocolate and cream spiral shell, long eye stalks, short feelers and a ladybird riding on top.",
};

export default function gardenSnail() {
  const b = createBuilder({ name: "garden-snail", detail: 1, paintSize: 1024 });

  // Skeleton: body spine, head, shell, and the two eye stalks (each a chain ending in an eye joint).
  b.joint("body", { at: [0, 0.011, 0], role: "spine" });
  b.joint("head", { parent: "body", at: [0, 0.016, 0.046], role: "head" });
  b.joint("shell", { parent: "body", at: [0, 0.024, -0.01] });

  // Pebbly grey-green skin: dark and light mottles with small spots.
  const skin = spots("#6f8270", ["#9aab93", "#56654f"], { size: 0.011, amount: 0.4, seed: 3 });

  // Soft body: a tapered capsule, thin at the tail and fuller in the head.
  b.capsule(
    [0, 0.011, -0.03],
    [0, 0.012, 0.04],
    [0.007, 0.013],
    { color: skin, name: "body", bone: "body", sides: 10 },
  );

  // Spiral shell: a lathe whose colour bands run diagonally round the whorls.
  const shellPaint = paint((_p, _n, s) => {
    const phase = (s[1] / 360) * 4 + s[0] * 55;
    const f = phase - Math.floor(phase);
    return f < 0.22 ? "#f2e4c2" : f < 0.62 ? "#b9763a" : "#4a2514";
  });
  const shellProfile: [number, number][] = [
    [0, 0.0],
    [0.012, 0.002],
    [0.021, 0.012],
    [0.024, 0.028],
    [0.021, 0.042],
    [0.013, 0.052],
    [0.006, 0.057],
    [0, 0.058],
  ];
  b.lathe(shellProfile, {
    color: shellPaint,
    at: [0, 0.024, -0.01],
    axis: [0, 1, 0],
    segments: 24,
    name: "shell",
    bone: "shell",
  });

  // A pair of eye stalks, a long chain each, with a black eye at the tip, plus two short feelers.
  const stalk = "#7b8a76";
  const feeler = "#8c9a86";

  const side = (tag: "L" | "R", s: number) => {
    const chain = b.chain(
      `eye${tag}`,
      [
        [s * 0.006, 0.02, 0.046],
        [s * 0.008, 0.04, 0.056],
        [s * 0.009, 0.058, 0.062],
      ],
      { parent: "head", names: [`eye${tag}1`, `eye${tag}2`, `eye${tag}tip`], role: "tentacle" },
    );
    b.sweep(chain, [0.0042, 0.0024], { color: stalk, name: `eyeStalk${tag}`, caps: "round", sides: 10 });

    const eye: [number, number, number] = [s * 0.009, 0.0615, 0.0625];
    b.part(new THREE.SphereGeometry(0.0034, 12, 9), "#140d08", {
      at: eye,
      bone: `eye${tag}tip`,
      name: `eye${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0009, 6, 5), "#ffffff", {
      at: [eye[0] + s * 0.0008, eye[1] + 0.0012, eye[2] + 0.0024],
      bone: `eye${tag}tip`,
      name: `eyeShine${tag}`,
    });

    b.capsule(
      [s * 0.004, 0.017, 0.054],
      [s * 0.008, 0.026, 0.07],
      [0.0022, 0.0008],
      { color: feeler, name: `feeler${tag}`, bone: "head", sides: 8 },
    );
  };
  side("L", 1);
  side("R", -1);

  // A tiny ladybird on the top of the shell.
  const shellBone = "shell";
  const red = "#c8221c";
  const black = "#1a1210";
  b.part(new THREE.SphereGeometry(0.0045, 14, 10), red, {
    at: [0.008, 0.0826, -0.01],
    scale: [1, 0.65, 1.25],
    bone: shellBone,
    name: "ladybirdShell",
  });
  b.part(new THREE.SphereGeometry(0.0022, 8, 6), black, {
    at: [0.008, 0.0818, -0.0047],
    bone: shellBone,
    name: "ladybirdHead",
  });
  const dots: Array<[number, number, number]> = [
    [0.0058, 0.0847, -0.0125],
    [0.0102, 0.0847, -0.0125],
    [0.0058, 0.0847, -0.0075],
    [0.0102, 0.0847, -0.0075],
  ];
  dots.forEach((at, i) =>
    b.part(new THREE.SphereGeometry(0.0009, 6, 5), black, {
      at,
      bone: shellBone,
      name: `ladybirdDot${i + 1}`,
    }),
  );

  return b.root;
}
