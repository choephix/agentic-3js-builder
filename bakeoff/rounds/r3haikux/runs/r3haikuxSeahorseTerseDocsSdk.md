```ts
import * as THREE from "three";
import { catmull, createBuilder, offset, paint, spiral, spots } from "agentic-3js-builder";

export const meta = {
  name: "seahorse",
  description:
    "A stylised seahorse curled on its tail: ringed orange armour, a tubular snout with a jaw, teal fan fins, a gold crown and bold eyes.",
};

// Design numbers below are in units that K scales to metres: about 0.2 m tall.
const K = 0.7;
const m = (d: number) => d * K;

type V3 = [number, number, number];

const BODY = "#f2873a";
const BELLY = "#ffd77d";
const RIDGE = "#b5431c";
const SPOT = "#fff1c9";
const FIN = "#34c6b8";
const RAY = "#e6fff9";
const PUPIL = "#111a24";
const IRIS = "#ffb347";
const WHITE = "#fffdf6";

// Tail: seven cream-ringed bands, the curled tip in fin teal.
const TAIL = paint((_p, _n, s) => (s[0] > 0.86 ? FIN : (s[0] * 7) % 1 < 0.3 ? RIDGE : BODY));

// Fan fins: pale rays radiating from a root point (outline coordinates, metres).
const fanPaint = (ru: number, rv: number) =>
  paint((_p, _n, s) => (Math.abs(Math.sin(Math.atan2(s[1] - rv, s[0] - ru) * 9)) < 0.16 ? RAY : FIN));

const outline = (pts: [number, number][]): [number, number][] =>
  pts.map(([u, v]): [number, number] => [m(u), m(v)]);

function make(lift: number): THREE.Object3D {
  const b = createBuilder({ name: "seahorse" });
  const pt = (x: number, y: number, z: number): V3 => [m(x), m(y) + lift, m(z)];

  // Midline skeleton (x = 0): trunk from hips to neck top, head to snout tip.
  const H0 = pt(0, 0.085, -0.035);
  const H1 = pt(0, 0.112, -0.018);
  const H2 = pt(0, 0.138, 0.0);
  const H3 = pt(0, 0.162, 0.014);
  const H4 = pt(0, 0.186, 0.032);
  const H5 = pt(0, 0.205, 0.052);
  const S1 = pt(0, 0.222, 0.072);
  const S2 = pt(0, 0.207, 0.112);
  const S3 = pt(0, 0.19, 0.148);
  const JAW = pt(0, 0.196, 0.107);
  const JAW_TIP = pt(0, 0.183, 0.145);
  const COIL_TOP = pt(0, 0.075, -0.05);
  const COIL_CENTRE = pt(0, 0.035, -0.05);

  // One smooth curve for the whole body, hips to snout tip.
  const body = catmull([H0, H1, H2, H3, H4, H5, S1, S2, S3]);
  const tOf = (p: V3) => body.closestT(p);

  // Radius along the body, keyed at its points and interpolated between them.
  const girth = (keys: [V3, number][]) => {
    const k = keys.map(([p, r]): [number, number] => [tOf(p), m(r)]);
    return (u: number) => {
      for (let i = 1; i < k.length; i++) {
        const [u1, r1] = k[i];
        if (u <= u1) {
          const [u0, r0] = k[i - 1];
          return r0 + ((r1 - r0) * (u - u0)) / (u1 - u0);
        }
      }
      return k[k.length - 1][1];
    };
  };

  // Skeleton: hips root, trunk, neck, head with snout, jaw, and a coiled tail.
  const hips = b.joint("hips", { at: H0, aim: H1, role: "spine" });
  const spine = b.chain("spine", body.slice(tOf(H1), tOf(H5)), { parent: hips, role: "spine" });
  const neck = b.chain("neck", body.slice(tOf(H5), tOf(S1)), { parent: spine, count: 2, role: "neck" });
  const head = b.chain("head", body.slice(tOf(S1), 1), {
    parent: neck,
    names: ["head", "snout"],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: JAW, aim: JAW_TIP, role: "jaw" });
  const coil = spiral(COIL_CENTRE, COIL_TOP, [1, 0, 0], { turns: -1.3, r1: m(0.016) });
  const tail = b.chain("tail", coil, { parent: hips, count: 8, role: "tail" });

  // Trunk: cream belly, dark dorsal ridge, spotted flanks; plain orange neck and head.
  const tNeck = tOf(H5);
  const trunkSpots = spots(BODY, SPOT, { size: 0.03, amount: 0.22, seed: 4 });
  const TRUNK = paint((_p, n, s) => {
    if (s[0] > tNeck) return BODY;
    if (n.z > 0.45) return BELLY;
    if (n.z < -0.6) return RIDGE;
    return trunkSpots;
  });

  const trunk = b.sweep(
    body,
    girth([
      [H0, 0.024],
      [H1, 0.033],
      [H2, 0.04],
      [H3, 0.042],
      [H4, 0.036],
      [H5, 0.024],
      [S1, 0.037],
      [S2, 0.021],
      [S3, 0.01],
    ]),
    { bone: [hips, spine, neck, head], sides: 10, color: TRUNK },
  );

  // Tail, tapering toward the curl.
  b.sweep(tail, (u: number) => m(0.02 - 0.012 * u), { color: TAIL });

  // Armour rings wrapped round the trunk at each spine joint.
  const skin = b.surface(trunk);
  for (const j of spine.joints) {
    b.sweep(skin.loop(j, { lift: m(0.0015) }), m(0.006), { color: RIDGE });
  }

  // Dorsal fan, standing up from the back of the trunk in the mid-plane.
  const dorsal = outline([
    [-0.004, -0.012],
    [0.024, -0.014],
    [0.046, 0.012],
    [0.056, 0.042],
    [0.04, 0.062],
    [0.012, 0.058],
    [-0.004, 0.03],
  ]);
  b.extrude(dorsal, {
    at: pt(0, 0.13, -0.02),
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: m(0.007),
    bevel: m(0.002),
    smoothing: 1,
    color: fanPaint(m(0.01), m(-0.012)),
    bone: spine.joints[1],
  });

  // Pectoral fans on each side of the neck, angled so they read from front and side.
  const pectoral = outline([
    [0, -0.01],
    [0.022, -0.012],
    [0.046, -0.004],
    [0.058, 0.014],
    [0.05, 0.032],
    [0.024, 0.032],
    [0.004, 0.012],
  ]);
  const pectoralPaint = fanPaint(0, m(-0.004));
  for (const s of [1, -1]) {
    b.extrude(pectoral, {
      at: pt(0, 0.184, 0.03),
      x: [0.894 * s, 0, -0.447],
      y: [0, 1, 0],
      thickness: m(0.005),
      bevel: m(0.0015),
      smoothing: 1,
      color: pectoralPaint,
      bone: spine.joints[3],
    });
  }

  // Coronet: three gold spines on the top-back of the skull.
  for (const [az, el] of [
    [150, 52],
    [180, 66],
    [210, 52],
  ] as const) {
    const hit = skin.around(S1).at(az, el);
    if (hit) b.spike(hit, hit, m(0.034), m(0.0085), { color: BELLY });
  }

  // Bulging eyes on the sides of the skull: dark pupil, pale ring, gold iris, glint.
  const re = m(0.0165);
  for (const s of [1, -1]) {
    const az = s * 62;
    const el = 14;
    const hit = skin.around(S1).at(az, el);
    if (!hit) continue;
    const a = (az * Math.PI) / 180;
    const e = (el * Math.PI) / 180;
    const D = [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
    const eye = hit.moved([0, re * 0.45, 0]);
    const eyePaint = paint((_p, n) => {
      const d = n.x * D[0] + n.y * D[1] + n.z * D[2];
      return d > 0.9 ? PUPIL : d > 0.72 ? WHITE : IRIS;
    });
    b.part(new THREE.SphereGeometry(re, 12, 8), eyePaint, { at: eye, bone: head.joints[0] });
    const glint = offset(offset(eye, D, re * 0.85), [0, 1, 0], re * 0.3);
    b.part(new THREE.SphereGeometry(re * 0.2, 6, 4), WHITE, { at: glint, bone: head.joints[0] });
  }

  // Lower jaw: a cream tube on its own joint under the snout, so the mouth can open.
  b.capsule(JAW, JAW_TIP, m(0.0055), { color: BELLY, bone: jaw });

  return b.root;
}

export default function build() {
  // Build once to find the lowest point, then again shifted so the coil rests on y = 0.
  const low = new THREE.Box3().setFromObject(make(0), true).min.y;
  return make(-low);
}
```