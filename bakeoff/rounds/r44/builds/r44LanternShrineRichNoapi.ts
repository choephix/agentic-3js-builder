import * as THREE from "three";
import { createBuilder, svg, paint, mix, noise, smoothstep, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Roadside Shrine",
  description: "A small Inazuma-style roadside shrine with a vermilion torii, stone lanterns, a hokora shrine and offerings.",
};

const VERM = "#c8382a";
const VERM_D = "#8e2219";
const BLACK = "#2a2230";
const GOLD = "#f0c050";
const CREAM = "#f4e8cc";

const stone = paint((p, n) => {
  let c = mix("#a9a7b5", "#d4d2dc", noise(p, 0.12, 3));
  c = mix(c, "#6fa05a", smoothstep(0.55, 0.8, noise(p, 0.08, 5)) * (1 - smoothstep(0.0, 0.3, p.y)) * 0.8);
  c = mix(c, "#6a6878", smoothstep(0.2, -0.8, n.y) * 0.4);
  return c;
});
const wood = paint((p, n) => mix("#8a5a34", "#5e3a20", noise(p, 0.05, 9)));
const ground = paint((p) => mix("#7aa857", "#5a8a40", noise(p, 0.2, 2)));

export default function build() {
  const b = createBuilder({ name: "roadsideShrine", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(4);
  const box = (s: [number, number, number], at: [number, number, number], c: any, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...s), c, { bone: root, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, at: [number, number, number], c: any, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: root, at });

  // ground mound and path
  b.part(new THREE.CylinderGeometry(1.7, 1.85, 0.12, 14), ground, { bone: root, at: [0, 0.05, 0] });
  for (let i = 0; i < 6; i++)
    box([0.5, 0.04, 0.4], [(R() - 0.5) * 0.1, 0.12, 1.9 - i * 0.28 - 0.0].map((v, k) => (k === 1 ? 0.12 : v)) as any, stone);

  // torii
  const T = 0.95;
  for (const s of [-1, 1]) {
    cyl(0.085, 0.1, 2.2, [s * T, 1.2, 0.9], VERM, 10);
    box([0.26, 0.1, 0.26], [s * T, 0.17, 0.9], BLACK);
    box([0.18, 0.08, 0.18], [s * T, 1.55, 0.9], BLACK);
  }
  box([2.6, 0.13, 0.17], [0, 2.18, 0.9], VERM);
  box([2.9, 0.1, 0.22], [0, 2.38, 0.9], BLACK, [0, 0, 0]);
  box([3.0, 0.07, 0.24], [0, 2.46, 0.9], VERM_D);
  for (const s of [-1, 1]) box([0.3, 0.1, 0.24], [s * 1.5, 2.5, 0.9], VERM_D, [0, 0, s * 20]);
  box([0.1, 0.3, 0.06], [0, 2.3, 0.9], BLACK);
  box([0.06, 0.2, 0.07], [0, 2.3, 0.9], GOLD);
  // shimenawa rope
  b.sweep([new THREE.Vector3(-0.85, 2.05, 0.9), new THREE.Vector3(0, 1.93, 0.9), new THREE.Vector3(0.85, 2.05, 0.9)], 0.035, { color: "#d8c38a", bone: root, sides: 6 });
  for (const x of [-0.5, 0, 0.5]) box([0.05, 0.2, 0.01], [x, 1.82, 0.9], CREAM);

  // hokora shrine
  box([1.0, 0.18, 0.9], [0, 0.21, -0.4], stone);
  box([0.7, 0.55, 0.6], [0, 0.57, -0.4], wood);
  for (const s of [-1, 1]) box([0.06, 0.55, 0.06], [s * 0.34, 0.57, -0.08], VERM);
  box([0.5, 0.4, 0.02], [0, 0.55, -0.1], "#2a1c22");
  b.part(new THREE.PlaneGeometry(0.2, 0.3), "#ffffff", {
    bone: root, at: [0, 0.57, -0.085], dir: [0, 0, 1], axis: "z",
    texture: svg(`<svg viewBox="0 0 60 90"><rect width="60" height="90" fill="#efe2bd" stroke="#8e2219" stroke-width="4"/><path d="M30 14 L44 45 L30 76 L16 45Z M30 14V76M16 45H44" fill="none" stroke="#c8382a" stroke-width="4"/></svg>`, { size: 128 }),
  });
  b.part(new THREE.ConeGeometry(0.85, 0.45, 4), VERM_D, { bone: root, at: [0, 1.07, -0.4], rotation: [0, 45, 0], scale: [1, 1, 0.8] });
  b.part(new THREE.ConeGeometry(0.4, 0.2, 4), BLACK, { bone: root, at: [0, 1.38, -0.4], rotation: [0, 45, 0] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), GOLD, { bone: root, at: [0, 1.52, -0.4] }), 1.3);

  // stone lanterns
  for (const s of [-1, 1]) {
    const x = s * 1.25, z = 1.25;
    box([0.36, 0.12, 0.36], [x, 0.18, z], stone);
    cyl(0.07, 0.08, 0.5, [x, 0.5, z], stone, 6);
    box([0.3, 0.07, 0.3], [x, 0.78, z], stone);
    glow(box([0.2, 0.2, 0.2], [x, 0.92, z], "#ffcf70"), 1.4);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box([0.03, 0.2, 0.03], [x + sx * 0.1, 0.92, z + sz * 0.1], stone);
    b.part(new THREE.ConeGeometry(0.28, 0.2, 4), stone, { bone: root, at: [x, 1.12, z], rotation: [0, 45, 0] });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), stone, { bone: root, at: [x, 1.26, z] });
  }
  // hanging paper lanterns
  for (const x of [-0.6, 0.6]) {
    b.sweep([new THREE.Vector3(x, 2.15, 0.9), new THREE.Vector3(x, 1.85, 0.9)], 0.008, { color: BLACK, bone: root });
    glow(b.part(new THREE.SphereGeometry(0.14, 8, 6), "#ff9a50", { bone: root, at: [x, 1.7, 0.9], scale: [1, 1.2, 1] }), 1.2);
    box([0.1, 0.03, 0.1], [x, 1.88, 0.9], BLACK);
    box([0.1, 0.03, 0.1], [x, 1.52, 0.9], BLACK);
  }

  // offerings
  box([0.5, 0.05, 0.3], [0, 0.35, 0.18], wood);
  box([0.3, 0.12, 0.2], [-0.5, 0.15, 0.4], wood);
  b.part(new THREE.CylinderGeometry(0.1, 0.07, 0.07, 8), "#f4efe0", { bone: root, at: [0.1, 0.4, 0.18] });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), "#f4efe0", { bone: root, at: [0.1, 0.46, 0.18], scale: [1, 0.6, 1] });
  for (const [x, c] of [[-0.12, "#e85a7a"], [-0.2, "#f0c050"], [-0.04, "#6ab0e8"]] as const)
    b.part(new THREE.SphereGeometry(0.045, 6, 5), c, { bone: root, at: [x, 0.41, 0.2] });
  cyl(0.05, 0.05, 0.1, [-0.5, 0.26, 0.4], "#5a8ac8");
  b.part(new THREE.SphereGeometry(0.055, 6, 5), "#e85a7a", { bone: root, at: [-0.4, 0.23, 0.4] });
  // fox statues
  for (const s of [-1, 1]) {
    const x = s * 0.9, z = 0.2;
    box([0.3, 0.16, 0.3], [x, 0.2, z], stone);
    b.part(new THREE.CapsuleGeometry(0.09, 0.2, 4, 8), stone, { bone: root, at: [x, 0.42, z] });
    b.part(new THREE.SphereGeometry(0.08, 8, 6), stone, { bone: root, at: [x, 0.62, z + 0.03] });
    b.part(new THREE.ConeGeometry(0.05, 0.12, 4), stone, { bone: root, at: [x - 0.04, 0.73, z + 0.02] });
    b.part(new THREE.ConeGeometry(0.05, 0.12, 4), stone, { bone: root, at: [x + 0.04, 0.73, z + 0.02] });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.02), VERM, { bone: root, at: [x, 0.52, z + 0.08] });
  }
  return b.root;
}
