```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type V3 = [number, number, number];

// ---- palette: flat colours, one shared material each ----
const SKIN = "#f4dd8e"; // creamy yellow top
const BELLY = "#fbf3dc"; // creamy white underside
const LEOPARD = "#7a4623"; // brown rosette rings
const SPIKE = "#d8b56a"; // golden spikes
const SCLERA = "#fffdf5";
const PUPIL = "#1e1915";
const GLINT = "#ffffff";
const BROW = "#4a2b17";
const LIP = "#e8756a"; // pouting lips
const DARK = "#4a1f19"; // nostrils and mouth opening
const FIN = "#f2b15a";
const TAIL = "#eba34c";
const BUBBLE = "#d6f1fb";

// ---- proportions (metres) ----
const R = 0.095; // body radius: a puffed ball about 19 cm across
const SPIKE_L = 0.022; // spike length
const RC = R + SPIKE_L - 0.002; // body centre height: spike tips rest on the floor
const C: V3 = [0, RC, 0];
const EYE_R = 0.036;
const EYE_D = R * 0.92; // eye centre distance from the body centre

// ---- vector helpers ----
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const onBody = (dir: V3, d: number): V3 => add(C, mul(norm(dir), d));
const near = (n: V3, c: V3, rad: number): boolean => dot(n, norm(c)) > Math.cos(rad);

// evenly spread directions on a sphere (Fibonacci lattice)
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const fib = (i: number, n: number): V3 => {
  const y = 1 - (2 * i + 1) / n;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const a = i * GOLDEN;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
};

// face landmarks as directions from the body centre (s = +1 left, -1 right)
const EYE_ZONE = (s: number): V3 => norm([0.5 * s, 0.45, 0.82]); // eye and brow area, kept clear
const FIN_DIR = (s: number): V3 => norm([s, -0.25, -0.05]);
const MOUTH_DIR: V3 = norm([0, -0.15, 1]);
const MOUTH = onBody(MOUTH_DIR, R - 0.001);

export const meta = {
  name: "Startled pufferfish",
  description:
    "A pufferfish puffed into a spiky ball: creamy yellow top with brown leopard rosettes fading to a white belly, big worried eyes, a tiny pout, fluttering side fins, a fan tail and a few rising bubbles.",
};

export default function build() {
  const b = createBuilder({ name: "startled-pufferfish" });

  // ---- skeleton ----
  const body = b.joint("body", { at: C });
  const head = b.joint("head", { at: [0, RC, 0.04], parent: body });
  const jawU = b.joint("jawU", { at: [0, MOUTH[1] + 0.006, MOUTH[2] - 0.012], parent: head });
  const jawL = b.joint("jawL", { at: [0, MOUTH[1] - 0.006, MOUTH[2] - 0.012], parent: head });
  const tail = b.joint("tail", { at: [0, RC, -0.085], parent: body });
  const finL = b.joint("finL", { at: onBody(FIN_DIR(1), R - 0.012), parent: body });
  const finR = b.joint("finR", { at: onBody(FIN_DIR(-1), R - 0.012), parent: body });

  // ---- body: a ball, creamy above, white below ----
  b.part(
    new THREE.SphereGeometry(R, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    SKIN,
    { at: C, bone: body },
  );
  b.part(
    new THREE.SphereGeometry(R, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    BELLY,
    { at: C, bone: body },
  );

  // ---- leopard rosettes: dense on top, thinning out toward the belly ----
  const SPOTS = 120;
  for (let i = 0; i < SPOTS; i++) {
    const n = fib(i, SPOTS);
    const keep = n[1] > 0.28 || (n[1] > -0.12 && i % 3 === 0);
    if (!keep) continue;
    if (near(n, EYE_ZONE(1), 0.6) || near(n, EYE_ZONE(-1), 0.6) || near(n, MOUTH_DIR, 0.35)) continue;
    const variety = 0.8 + 0.2 * (((i * 7) % 5) / 4);
    const fade = Math.min(1, Math.max(0.55, (n[1] + 0.1) / 0.5));
    const size = variety * fade;
    const outer = new THREE.SphereGeometry(0.011 * size, 8, 4);
    outer.scale(1, 0.3, 1);
    const inner = new THREE.SphereGeometry(0.0058 * size, 6, 4);
    inner.scale(1, 0.7, 1);
    const p = onBody(n, R);
    b.part(outer, LEOPARD, { at: p, dir: n, bone: body });
    b.part(inner, n[1] > 0.05 ? SKIN : BELLY, { at: p, dir: n, bone: body });
  }

  // ---- short spikes all over, kept off the face and fins ----
  const SPIKES = 240;
  for (let i = 0; i < SPIKES; i++) {
    const n = fib(i, SPIKES);
    if (near(n, EYE_ZONE(1), 0.55) || near(n, EYE_ZONE(-1), 0.55)) continue;
    if (near(n, MOUTH_DIR, 0.3) || near(n, FIN_DIR(1), 0.28) || near(n, FIN_DIR(-1), 0.28)) continue;
    const spike = new THREE.ConeGeometry(0.0052, SPIKE_L, 5, 1);
    spike.translate(0, SPIKE_L / 2, 0); // base at the origin, tip along +Y
    b.part(spike, SPIKE, { at: onBody(n, R), dir: n, bone: body });
  }

  // ---- big worried eyes, raised brows and nostrils ----
  for (const s of [1, -1]) {
    const dir = norm([0.5 * s, 0.28, 0.82]);
    const ec = onBody(dir, EYE_D);
    b.part(new THREE.SphereGeometry(EYE_R, 16, 12), SCLERA, { at: ec, bone: head });

    // pupils glance up and inward
    const pd = norm([dir[0] - 0.1 * s, dir[1] + 0.2, dir[2]]);
    const pc = add(ec, mul(pd, 0.026));
    b.part(new THREE.SphereGeometry(0.02, 12, 9), PUPIL, { at: pc, bone: head });
    const gc = add(add(pc, mul(pd, 0.019)), [0, 0.005, 0]);
    b.part(new THREE.SphereGeometry(0.005, 8, 6), GLINT, { at: gc, bone: head });

    // worried brows: inner ends raised
    const bc = onBody([dir[0], dir[1] + 0.45, dir[2]], R + 0.018);
    const brow = new THREE.CapsuleGeometry(0.0055, 0.04, 3, 6);
    brow.rotateZ(Math.atan2(-s, -0.4));
    b.part(brow, BROW, { at: bc, bone: head });

    // nostril
    const nc = onBody([0.12 * s, 0.05, 0.99], R - 0.002);
    b.part(new THREE.SphereGeometry(0.0045, 8, 6), DARK, { at: nc, bone: head });
  }

  // ---- tiny pouting mouth: upper and lower lip on separate jaws ----
  const lipC = add(MOUTH, [0, 0, 0.004]);
  const upperLip = new THREE.TorusGeometry(0.0125, 0.0058, 6, 12, Math.PI);
  const lowerLip = new THREE.TorusGeometry(0.0125, 0.0058, 6, 12, Math.PI);
  lowerLip.rotateZ(Math.PI);
  b.part(upperLip, LIP, { at: lipC, bone: jawU });
  b.part(lowerLip, LIP, { at: lipC, bone: jawL });
  b.part(new THREE.CircleGeometry(0.0085, 10), DARK, { at: add(MOUTH, [0, 0, 0.001]), bone: head });

  // ---- stubby fan tail, lying in the side plane and opening backwards ----
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0.012);
  tailShape.quadraticCurveTo(0.03, 0.03, 0.045, 0.055);
  tailShape.quadraticCurveTo(0.05, 0.02, 0.06, 0);
  tailShape.quadraticCurveTo(0.05, -0.02, 0.045, -0.055);
  tailShape.quadraticCurveTo(0.03, -0.03, 0, -0.012);
  tailShape.closePath();
  const tailGeo = new THREE.ExtrudeGeometry(tailShape, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 1,
    curveSegments: 5,
  });
  tailGeo.translate(0, 0, -0.003);
  tailGeo.rotateY(Math.PI / 2);
  b.part(tailGeo, TAIL, { at: [0, RC, -0.085], bone: tail });

  // ---- small fluttering pectoral fins, swept back and lifted ----
  for (const s of [1, -1]) {
    const fs = new THREE.Shape();
    fs.moveTo(0, 0.008);
    fs.quadraticCurveTo(0.03 * s, 0.026, 0.06 * s, 0.012);
    fs.quadraticCurveTo(0.045 * s, 0, 0.058 * s, -0.012);
    fs.quadraticCurveTo(0.03 * s, -0.02, 0, -0.008);
    fs.closePath();
    const fin = new THREE.ExtrudeGeometry(fs, { depth: 0.003, bevelEnabled: false, curveSegments: 6 });
    fin.translate(0, 0, -0.0015);
    fin.rotateY(0.5 * s);
    fin.rotateZ(0.3 * s);
    b.part(fin, FIN, { at: onBody(FIN_DIR(s), R - 0.012), bone: s > 0 ? finL : finR });
  }

  // ---- a few bubbles rising from the mouth ----
  const bubbles: [V3, number][] = [
    [[0.012, RC - 0.004, 0.13], 0.0115],
    [[0.024, RC + 0.05, 0.15], 0.0092],
    [[0.014, RC + 0.095, 0.165], 0.007],
    [[0.03, RC + 0.13, 0.19], 0.0052],
  ];
  for (const [p, r] of bubbles) {
    b.part(new THREE.SphereGeometry(r, 10, 8), BUBBLE, { at: p, bone: body });
    const glint = add(p, mul(norm([-0.5, 0.5, 0.7]), r * 0.92));
    b.part(new THREE.SphereGeometry(r * 0.2, 5, 4), GLINT, { at: glint, bone: body });
  }

  return b.root;
}
```