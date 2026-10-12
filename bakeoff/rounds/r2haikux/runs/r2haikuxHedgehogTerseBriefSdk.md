```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "hedgehog",
  description:
    "A stylised hedgehog at rest: a dense back of banded spines, a pale face and belly, bead eyes with glints, a dark nose and a separate lower jaw.",
};

type V = [number, number, number];

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const unit = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};
const dist = (a: V, c: V) => Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]);
const frac = (x: number) => x - Math.floor(x);

/** Point on an ellipsoid (centre c, radii r) in direction u, and its outward normal. */
function onEllipsoid(c: V, r: V, u: V): { p: V; n: V } {
  const k = 1 / Math.hypot(u[0] / r[0], u[1] / r[1], u[2] / r[2]);
  const p: V = [c[0] + u[0] * k, c[1] + u[1] * k, c[2] + u[2] * k];
  const n = unit([
    (p[0] - c[0]) / (r[0] * r[0]),
    (p[1] - c[1]) / (r[1] * r[1]),
    (p[2] - c[2]) / (r[2] * r[2]),
  ]);
  return { p, n };
}

/** Evenly spread unit directions (golden spiral). */
function sphereDirs(count: number): V[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out: V[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const ring = Math.sqrt(1 - y * y);
    const a = golden * i;
    out.push([Math.cos(a) * ring, y, Math.sin(a) * ring]);
  }
  return out;
}

/** A cone standing on its base at the origin, so `at` seats the base. */
function cone(len: number, radius: number) {
  const g = new THREE.ConeGeometry(radius, len, 6, 1);
  g.translate(0, len / 2, 0);
  return g;
}

/** An ellipsoid centred on the origin with radii r. */
function ellipsoid(r: V, seg: number, ring: number) {
  const g = new THREE.SphereGeometry(1, seg, ring);
  g.scale(r[0], r[1], r[2]);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "hedgehog" });

  // Palette
  const BODY = "#3b281d";
  const SPINE_DARK = "#4b3223";
  const SPINE_MID = "#906c48";
  const CREAM = "#efe2c6";
  const FACE = "#e6d0a8";
  const SNOUT = "#d7ab94";
  const NOSE = "#1f1411";
  const EYE = "#0d0907";
  const GLINT = "#ffffff";
  const SKIN = "#c48d7a";
  const EAR = "#d89c8c";
  const CLAW = "#2f211b";

  // Spines are dark, mid or cream, mixed deterministically.
  const spineColour = (i: number) => {
    const k = (i * 53) % 100;
    return k < 42 ? SPINE_DARK : k < 78 ? SPINE_MID : CREAM;
  };

  // Skeleton, rest pose (metres, +Z is forward)
  const hips = b.joint("hips", { at: [0, 0.09, -0.05] });
  const spine = b.joint("spine", { at: [0, 0.09, 0.03], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.088, 0.06], parent: spine });
  const head = b.joint("head", { at: [0, 0.085, 0.085], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.066, 0.14], parent: head });

  // Legs: short and splayed, with pink soles and dark toe claws
  const leg = (name: string, side: 1 | -1, z: number, parent: typeof spine) => {
    const hip = b.joint(name, { at: [0.05 * side, 0.03, z], parent });
    const foot = b.joint(`${name}Foot`, { at: [0.06 * side, 0.01, z + 0.012], parent: hip });
    b.part(new THREE.CylinderGeometry(0.014, 0.017, 0.06, 8), SKIN, {
      at: [0.05 * side, 0.03, z],
      bone: hip,
    });
    b.part(ellipsoid([0.017, 0.01, 0.024], 12, 8), SKIN, {
      at: [0.06 * side, 0.01, z + 0.012],
      bone: foot,
    });
    for (const dx of [-0.008, 0, 0.008]) {
      b.part(new THREE.SphereGeometry(0.0045, 6, 5), CLAW, {
        at: [0.06 * side + dx, 0.0045, z + 0.034],
        bone: foot,
      });
    }
  };
  leg("frontL", 1, 0.04, spine);
  leg("frontR", -1, 0.04, spine);
  leg("backL", 1, -0.08, hips);
  leg("backR", -1, -0.08, hips);

  // Body: a dark ball under the spines, with a pale belly band
  const bodyC: V = [0, 0.09, -0.01];
  const bodyR: V = [0.074, 0.055, 0.092];
  const body = b.part(ellipsoid(bodyR, 18, 12), BODY, { at: bodyC, bone: spine });
  b.part(ellipsoid([0.08, 0.048, 0.1], 14, 9), CREAM, {
    at: [0, 0.072, -0.01],
    bone: spine,
  });
  const bodySurf = b.surface(body);

  // Head: pale face
  const headC: V = [0, 0.085, 0.085];
  const headR: V = [0.05, 0.052, 0.055];
  const skull = b.part(ellipsoid(headR, 18, 12), FACE, { at: headC, bone: head });
  const headSurf = b.surface(skull);

  // Snout, dark nose, and a separate lower jaw
  const snout = new THREE.CylinderGeometry(0.011, 0.024, 0.055, 10, 1);
  snout.rotateX(Math.PI / 2);
  b.part(snout, SNOUT, { at: [0, 0.08, 0.158], bone: head });
  b.part(new THREE.SphereGeometry(0.0105, 12, 9), NOSE, {
    at: [0, 0.08, 0.181],
    bone: head,
  });
  const chin = new THREE.CylinderGeometry(0.0055, 0.016, 0.05, 10, 1);
  chin.rotateX(Math.PI / 2);
  b.part(chin, CREAM, { at: [0, 0.062, 0.16], bone: jaw });

  // Bead eyes with a glint each
  for (const side of [1, -1]) {
    const { p, n } = onEllipsoid(headC, headR, [side * 0.5, 0.3, 0.8]);
    b.part(new THREE.SphereGeometry(0.0095, 12, 9), EYE, { at: p, bone: head });
    const glint = add(p, mul(unit(add(n, [0, 0.6, 0])), 0.0088));
    b.part(new THREE.SphereGeometry(0.0028, 8, 6), GLINT, { at: glint, bone: head });
  }

  // Small rounded ears set into the sides of the head
  for (const side of [1, -1]) {
    const { p } = onEllipsoid(headC, headR, [side * 0.95, 0.45, -0.3]);
    b.part(ellipsoid([0.005, 0.012, 0.011], 10, 8), EAR, { at: p, bone: head });
  }

  // Short crown of spines over the top of the head
  sphereDirs(160).forEach((u, i) => {
    if (u[1] < 0.45 || u[2] > 0.55) return;
    const { n } = onEllipsoid(headC, headR, u);
    const hit = headSurf.nearest(add(headC, mul(u, 0.3)));
    const len = 0.014 + 0.01 * frac(i * 0.618);
    b.part(cone(len, 0.0042), spineColour(i + 7), {
      at: hit,
      dir: unit(add(n, [0, 0, -0.4])),
      bone: head,
    });
  });

  // The main coat: spines on the back and flanks, leaning back toward the tail.
  // Each dark or mid spine gets a cream tip, which gives the banded hedgehog look.
  sphereDirs(420).forEach((u, i) => {
    const { p, n } = onEllipsoid(bodyC, bodyR, u);
    if (n[2] > 0.6 || n[1] < -0.35) return; // face and belly stay bare
    if (dist(p, headC) < 0.062) return; // keep clear of the head

    const hit = bodySurf.nearest(add(bodyC, mul(u, 0.4)));
    const dir = unit(add(n, [0, 0, -0.5]));
    const len = 0.03 + 0.015 * frac(i * 0.618);
    const colour = spineColour(i);

    b.part(cone(len, 0.0058), colour, { at: hit, dir, bone: spine });

    if (colour !== CREAM) {
      const t = len * 0.6;
      b.part(cone(len - t + 0.0004, 0.0024), CREAM, {
        at: add(p, mul(dir, t)),
        dir,
        bone: spine,
      });
    }
  });

  return b.root;
}
```