```ts
import * as THREE from "three";
import { createBuilder, catmull, spiral, paint, scales, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Garden Snail",
  description:
    "A garden snail with a glossy caramel, chocolate and cream striped spiral shell, a pebbly grey-green body, two eye stalks, two short feelers and a ladybird riding on the shell.",
};

const CARA = "#c98a3d";
const CHOC = "#4a2a16";
const CREAM = "#f1e2b8";
const GROWTH = "#8a5424";
const RED = "#d6201c";
const BLACK = "#121212";

export default function build() {
  const b = createBuilder({ name: "snail" });

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.0115, -0.02] });
  const bodyPath = catmull([
    [0, 0.0115, -0.075],
    [0, 0.0115, -0.02],
    [0, 0.0115, 0.035],
    [0, 0.022, 0.06],
  ]);
  const bodyC = b.chain("body", bodyPath, { parent: root, names: ["tail", "hips", "chest", "head"], role: "spine" });
  const head = bodyC.tip!;

  // ---------- body ----------
  const skin = countershade(
    scales("#8c9d82", "#6f8066", { size: 0.006 }),
    scales("#b5c0a2", "#9aa88b", { size: 0.006 }),
    { level: -0.2 },
  );
  const rx = (t: number) => {
    if (t < 0.4) return 0.002 + 0.0125 * Math.pow(t / 0.4, 0.8);
    if (t < 0.7) return 0.0145;
    return 0.0145 - 0.006 * ((t - 0.7) / 0.3);
  };
  const ry = (t: number) => 0.75 * rx(t);
  b.sweep(bodyC, (t: number) => [rx(t), ry(t)], {
    shift: (t: number) => [0, (ry(t) - 0.0115) * Math.max(0, Math.min(1, 1 - (t - 0.6) / 0.25))],
    color: skin,
    caps: { start: "point", end: "round" },
  });
  b.part(new THREE.SphereGeometry(0.0085, 8, 6), skin, {
    bone: head,
    at: [0, 0.0225, 0.064],
    scale: [1, 0.95, 1.2],
  });

  // mouth: separate upper and lower lip
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.0185, 0.066],
    aim: [0, 0.0155, 0.0765],
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.0045, 7, 5), "#8a9b80", {
    bone: jaw,
    at: [0, 0.0155, 0.0705],
    scale: [1.3, 0.6, 1],
  });
  b.part(new THREE.SphereGeometry(0.0035, 7, 5), "#8a9b80", { bone: head, at: [0, 0.0205, 0.0725] });
  b.part(new THREE.SphereGeometry(0.002, 6, 4), "#4a3f3a", {
    bone: head,
    at: [0, 0.0178, 0.0752],
    scale: [1.8, 0.3, 1],
  });

  // ---------- eye stalks and feelers ----------
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const stalkPath = catmull([
      [s * 0.007, 0.03, 0.052],
      [s * 0.011, 0.05, 0.057],
      [s * 0.013, 0.068, 0.064],
    ]);
    const stalk = b.chain(`stalk${side}`, stalkPath, {
      parent: head,
      names: [`stalk${side}1`, `stalk${side}2`, `eye${side}`],
      role: "tentacle",
    });
    b.sweep(stalk, [0.0036, 0.0022], { color: skin });
    const eyeJ = stalk.tip!;
    b.part(new THREE.SphereGeometry(0.0046, 8, 6), BLACK, { bone: eyeJ, at: stalkPath.at(1) });
    b.part(new THREE.SphereGeometry(0.0012, 5, 4), "#ffffff", {
      bone: eyeJ,
      at: [s * 0.0145, 0.0705, 0.0675],
    });

    const feelerPath = catmull([
      [s * 0.009, 0.019, 0.062],
      [s * 0.012, 0.0165, 0.072],
      [s * 0.014, 0.0125, 0.0805],
    ]);
    const feeler = b.chain(`feeler${side}`, feelerPath, {
      parent: head,
      names: [`feeler${side}1`, `feeler${side}2`, `feelerTip${side}`],
      role: "tentacle",
    });
    b.sweep(feeler, [0.0025, 0.0012], { color: skin });
  }

  // ---------- shell ----------
  const shellJ = b.joint("shell", { parent: bodyC.joints[1], at: [-0.004, 0.03, -0.012] });
  const cx = -0.008;
  const C: [number, number, number] = [cx, 0.04, -0.012];
  const r0 = 0.022;
  const r1 = 0.004;
  const turns = 2.6;
  const pitch = 0.008;
  const shellPath = spiral(C, [cx, C[1] - r0, C[2]], [1, 0, 0], { turns, r1, pitch });
  const rAt = (t: number) => r0 - (r0 - r1) * Math.max(0, Math.min(1, t));
  const shellPaint = paint((p, _n, s) => {
    const t = Math.max(0, Math.min(1, s[0]));
    const r = rAt(t);
    const th = Math.log(Math.max(r, r1) / r0) / Math.log(r1 / r0);
    const xc = cx + pitch * turns * th;
    const lat = Math.max(-0.999, Math.min(0.999, (p.x - xc) / (0.5 * r)));
    const cols = [CREAM, CARA, CHOC, CHOC, CARA, CREAM, CARA, CHOC, CARA, CARA];
    const col = cols[Math.floor((lat + 1) * 5)];
    const g = (th * 16) % 1;
    return g < 0.06 ? GROWTH : col;
  });
  const shell = b.sweep(shellPath, (t: number) => 0.5 * rAt(t), {
    bone: shellJ,
    color: shellPaint,
    sides: 12,
    caps: { start: "flat", end: "round" },
  });
  // cream lip around the aperture
  b.part(new THREE.TorusGeometry(0.0108, 0.0023, 6, 14), CREAM, {
    bone: shellJ,
    at: shellPath.at(0),
    dir: shellPath.tangentAt(0),
    axis: "z",
  });

  // ---------- ladybird ----------
  const hit = b.surface(shell).nearest([-0.004, 0.09, -0.012]);
  const bx = hit.at.x;
  const by = hit.at.y - 0.0005;
  const bz = hit.at.z;
  const P = (dx: number, dy: number, dz: number): [number, number, number] => [bx + dx, by + dy, bz + dz];
  const G = (g: THREE.BufferGeometry, x: number, y: number, z: number) => g.scale(x, y, z);
  const hemi = (r: number) => new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(G(hemi(0.0052), 1, 0.8, 1.12), BLACK, { bone: shellJ, at: P(0, 0, 0) });
  const spotList = [
    [0.5, 0.45],
    [0.55, -0.15],
    [0.25, -0.65],
  ];
  for (const s of [1, -1]) {
    b.part(G(hemi(0.0055), 0.48, 0.8, 1.15), RED, { bone: shellJ, at: P(s * 0.003, 0.0002, 0) });
    for (const [ex, ez] of spotList) {
      const y = Math.sqrt(1 - ex * ex - ez * ez) * 0.0044;
      b.part(new THREE.SphereGeometry(0.0009, 5, 4), BLACK, {
        bone: shellJ,
        at: P(s * (0.003 + ex * 0.00264), 0.0002 + y, ez * 0.0063),
      });
    }
    b.part(new THREE.SphereGeometry(0.0007, 5, 4), "#ffffff", { bone: shellJ, at: P(s * 0.0014, 0.0022, 0.0087) });
    b.rod(P(s * 0.001, 0.0016, 0.0088), P(s * 0.0025, 0.0028, 0.0125), 0.00018, { bone: shellJ, color: BLACK, sides: 4 });
    for (const z of [-0.003, 0, 0.003]) {
      b.rod(P(s * 0.0035, 0.0003, z), P(s * 0.0063, -0.0007, z + 0.0007), 0.00028, {
        bone: shellJ,
        color: BLACK,
        sides: 4,
      });
    }
  }
  b.part(G(new THREE.SphereGeometry(0.0027, 7, 5), 1.2, 0.9, 1), BLACK, { bone: shellJ, at: P(0, 0.001, 0.0066) });

  // ---------- finish: glossy, slimy look ----------
  const out = b.root;
  out.traverse((o: any) => {
    if (o.isMesh && o.material && !Array.isArray(o.material) && "roughness" in o.material) {
      o.material.roughness = 0.32;
    }
  });
  return out;
}
```