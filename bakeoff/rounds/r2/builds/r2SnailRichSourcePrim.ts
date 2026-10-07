import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  noise,
  scales,
  mottle,
  countershade,
  catmull,
  spiral,
  interpolate,
} from "../../../../src/index";

export const meta = {
  name: "Garden Snail with Ladybird",
  description:
    "A garden snail with a glossy caramel, chocolate and cream striped spiral shell, a pebbly grey-green body, two long eye stalks, two short feelers, and a ladybird riding on the shell.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0, 0], dir: [0, 0, 1] });

  const spinePts = [
    V(0, 0.003, -0.042),
    V(0, 0.007, -0.025),
    V(0, 0.009, -0.005),
    V(0, 0.011, 0.015),
    V(0, 0.015, 0.03),
    V(0, 0.017, 0.04),
  ];
  const spine = b.chain("spine", catmull(spinePts), {
    parent: "root",
    role: "spine",
    names: ["spine1", "spine2", "spine3", "spine4", "spine5", "head"],
  });

  // ---------- body ----------
  const back = scales(["#7f8c6e", "#8a9779", "#76846a"], "#66725c", { size: 0.0035, width: 0.25, seed: 2 });
  const belly = mottle("#aab594", "#b9c2a2", { size: 0.006 });
  const bodyPaint = countershade(back, belly, { level: -0.25, soft: 0.4 });

  const ts = [0, 0.2, 0.5, 0.8, 1];
  const rxs = [0.001, 0.008, 0.0105, 0.0095, 0.0075];
  const rys = [0.001, 0.006, 0.0085, 0.0078, 0.006];
  b.sweep(spine, (t: number) => [interpolate(ts, rxs, t), interpolate(ts, rys, t)], {
    color: bodyPaint,
    sides: 10,
    name: "body",
  });

  // sole of the foot
  b.sweep(
    [V(0, 0.003, -0.04), V(0, 0.003, 0.03)],
    (t: number) => [0.0105 * Math.min(1, 0.25 + t * 2.5) * (1 - 0.15 * t), 0.003],
    { color: "#b7bf9d", bone: spine, sides: 10, name: "sole" },
  );

  // slime trail
  b.sweep([V(0, 0.0004, -0.11), V(0, 0.0004, -0.04)], [0.0045, 0.0085], {
    color: "#d9ebe3",
    bone: "root",
    caps: "round",
    sides: 6,
    section: "box",
    name: "slime",
  });

  // ---------- mouth ----------
  b.joint("jaw", { parent: "head", at: [0, 0.0118, 0.0405], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.009, 0.0018, 0.0045), "#6d7860", { at: [0, 0.0128, 0.0435], bone: "head", name: "upperLip" });
  b.part(new THREE.BoxGeometry(0.0085, 0.0016, 0.0042), "#5e6a52", { at: [0, 0.0107, 0.0432], bone: "jaw", name: "lowerLip" });
  b.part(new THREE.BoxGeometry(0.006, 0.0007, 0.003), "#3a2a2a", { at: [0, 0.0118, 0.0438], bone: "jaw", name: "mouthPit" });

  // ---------- eye stalks and feelers ----------
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const stalk = b.chain(
      `eyeStalk${side}`,
      catmull([V(sx * 0.0035, 0.021, 0.0385), V(sx * 0.0048, 0.029, 0.0415), V(sx * 0.0062, 0.039, 0.0455)]),
      {
        parent: "head",
        role: "tentacle",
        names: [`eyeStalk${side}1`, `eyeStalk${side}2`, `eyeStalk${side}3`],
      },
    );
    b.sweep(stalk, [0.0019, 0.0011], { color: "#8a8f78", sides: 8, name: `stalk${side}` });
    const tip = stalk.tip!;
    b.part(new THREE.SphereGeometry(0.0027, 10, 8), "#7d836c", { at: V(sx * 0.0062, 0.0402, 0.0455), bone: tip, name: `eyeBulb${side}` });
    b.part(new THREE.SphereGeometry(0.0021, 10, 8), "#0b0b0d", { at: V(sx * 0.0066, 0.0408, 0.0468), bone: tip, name: `eye${side}` });
    b.part(new THREE.SphereGeometry(0.0007, 6, 5), "#ffffff", { at: V(sx * 0.0072, 0.0418, 0.0482), bone: tip, name: `eyeShine${side}` });

    const feeler = b.chain(
      `feeler${side}`,
      catmull([V(sx * 0.004, 0.015, 0.0415), V(sx * 0.0058, 0.0135, 0.0485), V(sx * 0.0075, 0.0105, 0.0545)]),
      {
        parent: "head",
        role: "tentacle",
        names: [`feeler${side}1`, `feeler${side}2`, `feeler${side}3`],
      },
    );
    b.sweep(feeler, [0.0011, 0.0006], { color: "#868c74", sides: 6, name: `feelerSweep${side}` });
    b.part(new THREE.SphereGeometry(0.0009, 6, 5), "#7d836c", { at: V(sx * 0.0075, 0.0105, 0.0545), bone: feeler.tip!, name: `feelerTip${side}` });
  }

  // ---------- shell ----------
  const ax = V(0.75, 0.5, -0.4).normalize();
  const C = V(-0.008, 0.026, -0.002);
  const down = V(0, -1, 0);
  down.addScaledVector(ax, -down.dot(ax)).normalize();
  const r0 = 0.0105;
  const r1 = 0.003;
  const from = C.clone().addScaledVector(down, r0);
  b.joint("shell", { parent: "spine3", at: C, dir: ax });
  const coil = spiral(C, from, ax, { turns: 3, r1, pitch: 0.007 });

  const CARAMEL = "#c98a3e";
  const CHOC = "#4a2a16";
  const CREAM = "#f1e2bd";
  const bands: Array<[number, string]> = [
    [30, CHOC], [75, CARAMEL], [95, CREAM], [120, CHOC], [200, CARAMEL],
    [220, CREAM], [245, CHOC], [300, CARAMEL], [320, CREAM], [360, CHOC],
  ];
  const shellPaint = paint((p, n, s) => {
    const a = ((s[1] % 360) + 360) % 360;
    let base: string | readonly [number, number, number] = CHOC;
    for (const [end, col] of bands) {
      if (a <= end) {
        base = col;
        break;
      }
    }
    if (base === CARAMEL) base = mix(CARAMEL, "#e3ad60", noise(p, 0.006, 3));
    let out = typeof base === "string" ? mix(base, base, 0) : base;
    const g = (s[0] * 46) % 1;
    if (g < 0.07) out = mix(out, "#2a160a", 0.28);
    return out;
  });

  const shell = b.sweep(coil, (t: number) => 0.52 * (r0 + (r1 - r0) * t), {
    color: shellPaint,
    bone: "shell",
    sides: 10,
    caps: "round",
    name: "shell",
  });

  // ---------- ladybird ----------
  const surf = b.surface(shell);
  const hit = surf.ray([0.004, 0.1, -0.006], [0, -1, 0]);
  const L = hit ? hit.at.clone() : V(0.004, 0.045, -0.006);
  const k = 1.35;
  b.joint("ladybird", { parent: "shell", at: L, dir: [0, 0, 1] });
  const at = (x: number, y: number, z: number) => V(L.x + x * k, L.y + y * k - 0.0003, L.z + z * k);
  const RX = 0.0032;
  const RY = 0.0024;
  const RZ = 0.0038;
  const domeY = (x: number, z: number) => RY * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2 - (z / RZ) ** 2));

  b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), "#d8281f", {
    at: at(0, 0, 0), scale: [RX * k, RY * k, RZ * k], bone: "ladybird", name: "elytra",
  });
  b.part(new THREE.SphereGeometry(1, 8, 4), "#161616", {
    at: at(0, 0, 0), scale: [0.003 * k, 0.0007 * k, 0.0035 * k], bone: "ladybird", name: "ladybirdBelly",
  });
  for (let i = 0; i < 6; i++) {
    const z = -0.0032 + i * 0.00125;
    b.part(new THREE.BoxGeometry(0.0004 * k, 0.0003 * k, 0.0014 * k), "#151515", {
      at: at(0, domeY(0, z + 0.0006) + 0.00005, z + 0.0006), bone: "ladybird", name: "seam",
    });
  }
  const spots: Array<[number, number]> = [[0.0017, -0.0016], [0.0018, 0.0006], [0.001, 0.0024]];
  for (const [x, z] of spots)
    for (const sx of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.00065 * k, 6, 5), "#151515", {
        at: at(sx * x, domeY(x, z) * 0.97, z), scale: [1, 0.5, 1], bone: "ladybird", name: "spot",
      });
    }
  b.part(new THREE.SphereGeometry(0.0016 * k, 8, 6), "#161616", {
    at: at(0, 0.0007, 0.0038), scale: [1.25, 0.85, 0.85], bone: "ladybird", name: "ladybirdHead",
  });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0004 * k, 5, 4), "#ffffff", {
      at: at(sx * 0.001, 0.0012, 0.0051), bone: "ladybird", name: "ladybirdEye",
    });
    for (const z of [-0.002, 0, 0.002]) {
      b.part(new THREE.BoxGeometry(0.0016 * k, 0.0003 * k, 0.0004 * k), "#161616", {
        at: at(sx * 0.0034, -0.0002, z), rotation: [0, 0, sx * -20], bone: "ladybird", name: "ladybirdLeg",
      });
    }
    b.part(new THREE.BoxGeometry(0.0003 * k, 0.0003 * k, 0.0016 * k), "#161616", {
      at: at(sx * 0.0008, 0.0014, 0.0058), rotation: [0, sx * 20, 0], bone: "ladybird", name: "antenna",
    });
  }

  // ---------- finish: glossy, slimy shine ----------
  const root = b.root;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && (m.material as THREE.MeshStandardMaterial).name === "paint") {
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.roughness = 0.3;
      mat.metalness = 0.05;
    }
  });
  return root;
}
