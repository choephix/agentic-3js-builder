import * as THREE from "three";
import { createBuilder, countershade, gradient, paint, rng } from "../../../../src/index";

export const meta = {
  name: "Hedgehog",
  description:
    "A stylised hedgehog: a banded spiny back over a pale belly, a pale face with a dark snout, black nose and bright eyes, and four short legs on a rig.",
};

const BODY_C: [number, number, number] = [0, 0.085, -0.005];
const RX = 0.075;
const RY = 0.06;
const RZ = 0.0975;

/** Spines: cream shafts with two dark bands and a dark tip. `t` runs base (0) to tip (1). */
const SPINE = paint((_p, _n, s) => ((s[0] > 0.4 && s[0] < 0.58) || s[0] > 0.86 ? "#4a2e1b" : "#f3e6c8"));

export default function hedgehog() {
  const b = createBuilder({ name: "hedgehog", detail: 1, paintSize: 1024 });
  const dark = "#2a1a10";

  // Skeleton: root (body), neck, head, jaw, then four leg chains.
  b.joint("root", { at: BODY_C, role: "spine" });
  b.joint("neck", { parent: "root", at: [0, 0.1, 0.07] });
  b.joint("head", { parent: "neck", at: [0, 0.1, 0.12], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.068, 0.13], role: "jaw" });

  const leg = (
    tag: string,
    s: number,
    hip: number[],
    knee: number[],
    ankle: number[],
    toe: number[],
  ) => {
    const x = (p: number[]) => [s * p[0], p[1], p[2]];
    const names = [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `foot${tag}`];
    const chain = b.chain(`leg${tag}`, [x(hip), x(knee), x(ankle), x(toe)], {
      parent: "root",
      role: "leg",
      names,
    });
    b.sweep(chain, [0.018, 0.014], { color: "#5b3a24" });
    b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), dark, {
      at: x(toe),
      bone: names[3],
      scale: [1.1, 0.8, 1.3],
    });
  };
  leg("FL", 1, [0.05, 0.085, 0.05], [0.058, 0.05, 0.058], [0.058, 0.024, 0.068], [0.058, 0.018, 0.088]);
  leg("FR", -1, [0.05, 0.085, 0.05], [0.058, 0.05, 0.058], [0.058, 0.024, 0.068], [0.058, 0.018, 0.088]);
  leg("HL", 1, [0.05, 0.085, -0.07], [0.062, 0.05, -0.068], [0.062, 0.024, -0.064], [0.062, 0.018, -0.045]);
  leg("HR", -1, [0.05, 0.085, -0.07], [0.062, 0.05, -0.068], [0.062, 0.024, -0.064], [0.062, 0.018, -0.045]);

  // Body: an ellipsoid painted dark on the back and pale underneath.
  b.part(new THREE.SphereGeometry(RX, b.segments(20), b.segments(14)), countershade("#6a4327", "#eadbb8", { level: -0.15, soft: 0.45 }), {
    at: BODY_C,
    bone: "root",
    scale: [1, 0.8, 1.3],
  });

  // Spines: random points on the back and flanks of the body, each a short cone leaning backwards.
  const random = rng(11);
  const placed: THREE.Vector3[] = [];
  let tries = 0;
  while (placed.length < 320 && tries++ < 8000) {
    const dy = 2 * random() - 1;
    const ang = 2 * Math.PI * random();
    const ring = Math.sqrt(1 - dy * dy);
    const dx = ring * Math.cos(ang);
    const dz = ring * Math.sin(ang);
    const P = new THREE.Vector3(BODY_C[0] + RX * dx, BODY_C[1] + RY * dy, BODY_C[2] + RZ * dz);
    const N = new THREE.Vector3(dx / RX, dy / RY, dz / RZ).normalize();
    if (N.y < -0.25 || P.z > 0.07) continue;
    if (placed.some((q) => q.distanceTo(P) < 0.014)) continue;
    placed.push(P);
    const dir = N.clone().add(new THREE.Vector3(0, 0.12, -0.45)).normalize();
    const len = 0.028 + 0.014 * random();
    const base = P.clone().addScaledVector(N, -0.004);
    b.spike(base.toArray(), dir.toArray(), len, 0.0042, { color: SPINE, sides: 6, bone: "root" });
  }

  // Neck-to-face: a pale head with a snout that darkens toward the nose.
  b.part(new THREE.SphereGeometry(0.045, b.segments(16), b.segments(12)), "#e8cfa6", {
    at: [0, 0.1, 0.12],
    bone: "head",
    scale: [1, 0.95, 1.05],
  });
  b.sweep(
    [
      [0, 0.1, 0.12],
      [0, 0.094, 0.2],
    ],
    [0.036, 0.017],
    {
      bone: "head",
      color: gradient("#e8cfa6", "#3a2517", [0, 0.1, 0.13], [0, 0.094, 0.2]),
    },
  );
  b.part(new THREE.SphereGeometry(0.012, b.segments(10), b.segments(8)), "#120b08", {
    at: [0, 0.095, 0.2],
    bone: "head",
    scale: [1.3, 0.85, 1],
  });

  // Eyes with a highlight each, and small ears set into the top of the head.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0065, b.segments(8), b.segments(6)), "#120c09", {
      at: [s * 0.024, 0.113, 0.152],
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.0022, b.segments(6), b.segments(4)), "#ffffff", {
      at: [s * 0.0265, 0.1165, 0.1575],
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.016, b.segments(10), b.segments(8)), "#7a4c35", {
      at: [s * 0.028, 0.132, 0.11],
      bone: "head",
      scale: [0.55, 0.9, 0.3],
    });
  }

  // Lower jaw: a pale chin on its own hinge so the mouth can open.
  b.sweep(
    [
      [0, 0.068, 0.13],
      [0, 0.072, 0.19],
    ],
    [0.013, 0.01],
    { bone: "jaw", color: "#eadbb8" },
  );

  return b.root;
}
