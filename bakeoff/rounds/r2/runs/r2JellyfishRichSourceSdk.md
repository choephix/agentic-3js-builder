```ts
import * as THREE from "three";
import { createBuilder, frame, rng } from "agentic-3js-builder";

export const meta = {
  name: "Moon Jellyfish",
  description:
    "Glowing translucent pale-blue bell with four pink horseshoe gonads, a frilly rim of fine tentacles and four ruffled pearly-lilac oral arms, drifting upward.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "moonJelly" });
  const R = rng(11);
  const Y0 = 0.4; // bell centre height; arm tips touch y = 0

  // Translucent glowing materials
  const GLASS = "#a8d8f2";
  const VEIN = "#d6edfb";
  const PINK = "#ff8fc4";
  const FRINGE = "#e8f4ff";
  const glass = b.material(GLASS);
  glass.transparent = true; glass.opacity = 0.45; glass.depthWrite = false;
  glass.emissive = new THREE.Color("#3d86b8"); glass.emissiveIntensity = 0.7;
  const vein = b.material(VEIN);
  vein.transparent = true; vein.opacity = 0.75;
  vein.emissive = new THREE.Color("#7fb8dd"); vein.emissiveIntensity = 0.6;
  const pink = b.material(PINK);
  pink.emissive = new THREE.Color("#ff4f9a"); pink.emissiveIntensity = 0.9;
  const fringe = b.material(FRINGE);
  fringe.transparent = true; fringe.opacity = 0.7;
  fringe.emissive = new THREE.Color("#8ec5e8"); fringe.emissiveIntensity = 0.6;
  const core = b.material("#fff4fb");
  core.emissive = new THREE.Color("#ffd6f0"); core.emissiveIntensity = 1.0;

  // Skeleton
  b.joint("root", { at: [0, Y0, 0], dir: [0, 1, 0] });
  b.joint("bell", { parent: "root", at: [0, Y0, 0], dir: [0, 1, 0] });

  // Bell: hollow dome shell
  b.lathe(
    [
      [0, 0.162], [0.05, 0.16], [0.1, 0.142], [0.14, 0.102], [0.16, 0.05], [0.166, 0.0], [0.158, -0.022],
      [0.146, 0.0], [0.14, 0.045], [0.115, 0.09], [0.08, 0.115], [0.04, 0.127], [0, 0.13],
    ],
    { color: GLASS, at: [0, Y0, 0], segments: 16, bone: "bell", name: "bell" },
  );

  // Rim ring (scalloped collar)
  const rimPts: THREE.Vector3[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const r = 0.158 + (i % 2 ? 0.006 : 0);
    rimPts.push(new THREE.Vector3(Math.sin(a) * r, Y0 - 0.02 - (i % 2 ? 0.006 : 0), Math.cos(a) * r));
  }
  b.sweep(rimPts.length ? (b as any).ctx && rimPts : rimPts, 0.007, { color: VEIN, bone: "bell", sides: 5, name: "rim" } as any);

  // Radial canals on the bell
  const outer: Array<[number, number]> = [[0.0, 0.166], [0.05, 0.164], [0.1, 0.146], [0.14, 0.106], [0.16, 0.054], [0.167, 0.0]];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const pts = outer.map(([r, y]) => new THREE.Vector3(Math.sin(a) * r * 1.02, Y0 + y, Math.cos(a) * r * 1.02));
    b.sweep(pts, [0.003, 0.0025], { color: VEIN, bone: "bell", sides: 4, caps: "round", name: "canal" });
  }

  // Four pink horseshoe gonads
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const radial = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const c = radial.clone().multiplyScalar(0.066).add(new THREE.Vector3(0, Y0 + 0.075, 0));
    const inward = radial.clone().negate().multiplyScalar(0.034).applyAxisAngle(new THREE.Vector3(0, 1, 0), (45 * Math.PI) / 180);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      pts.push(c.clone().add(inward.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (-270 * Math.PI / 180) * (i / 12))));
    }
    b.sweep(pts, (t: number) => 0.0095 * (0.75 + 0.5 * Math.sin(t * Math.PI)), {
      color: PINK, bone: "bell", sides: 6, name: "gonad" + k,
    });
  }

  // Glowing core + manubrium
  b.part(new THREE.IcosahedronGeometry(0.03, 1), "#fff4fb", { at: [0, Y0 + 0.06, 0], bone: "bell", name: "core" });
  b.lathe(
    [[0, 0.0], [0.022, -0.005], [0.03, -0.03], [0.02, -0.06], [0.012, -0.06], [0.012, -0.03], [0, -0.01]],
    { color: "#e8d9fa", at: [0, Y0 + 0.05, 0], segments: 8, bone: "root", name: "manubrium" },
  );

  // Fine rim tentacles on joint groups
  b.ring(frame([0, Y0 - 0.02, 0], [0, 1, 0]), {
    count: 48, radius: 0.158, joints: 8, name: "rim", parent: "bell", role: "fan",
  }, (item) => {
    const out = item.outward;
    const len = 0.07 + R() * 0.05;
    const base = item.at;
    const p1 = base.clone().addScaledVector(out, 0.012).add(new THREE.Vector3(0, -len * 0.5, 0));
    const p2 = base.clone().addScaledVector(out, 0.004 + R() * 0.01).add(new THREE.Vector3(0, -len, 0));
    b.sweep([item, p1, p2], [0.0028, 0.0008], { color: FRINGE, sides: 4, caps: "round", name: "fringe" });
  });

  // Four ruffled oral arms
  const armPaint = (b as any).ctx
    ? (await_free_gradient())
    : "#f2ecff";
  function await_free_gradient() {
    return gradientPaint();
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4 + 0.0;
    const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const perp = new THREE.Vector3(d.z, 0, -d.x);
    const pts = [
      d.clone().multiplyScalar(0.025).add(new THREE.Vector3(0, Y0 - 0.01, 0)),
      d.clone().multiplyScalar(0.05).addScaledVector(perp, 0.015).add(new THREE.Vector3(0, Y0 - 0.1, 0)),
      d.clone().multiplyScalar(0.04).addScaledVector(perp, -0.02).add(new THREE.Vector3(0, Y0 - 0.22, 0)),
      d.clone().multiplyScalar(0.07).addScaledVector(perp, 0.01).add(new THREE.Vector3(0, 0.006, 0)),
    ];
    const chain = b.chain("arm" + i + "_", pts, { parent: "root", role: "tentacle", count: 4 });
    b.sweep(chain, (t: number) => [
      0.015 * (1 - 0.55 * t) * (1 + 0.45 * Math.sin(t * 55 + i * 1.7)),
      0.0045 * (1 - 0.4 * t),
    ], { color: armPaint, sides: 8, name: "oralArm" + i });
  }

  // Inner light
  const light = new THREE.PointLight("#9bd6ff", 1.4, 1.6);
  light.position.set(0, Y0 + 0.05, 0);
  b.root.add(light);

  const root = b.root;
  const pm = (b as any).ctx.paintMaterial() as THREE.MeshStandardMaterial;
  pm.emissive = new THREE.Color("#7a66b0");
  pm.emissiveIntensity = 0.35;
  return root;

  function gradientPaint() {
    return _gradient();
  }
  function _gradient() {
    return gradientImport("#f7f3ff", "#b79be8", [0, Y0, 0], [0, 0.0, 0]);
  }
}

import { gradient as gradientImport } from "agentic-3js-builder";
```