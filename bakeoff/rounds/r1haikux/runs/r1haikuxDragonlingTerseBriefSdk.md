```ts
import * as THREE from "three";
import { createBuilder, frame } from "agentic-3js-builder";

export const meta = {
  name: "Baby dragon",
  description:
    "A round-bellied teal hatchling with an amber crest, ivory horns, coral wing membranes and big golden eyes.",
};

const TEAL = "#2c9c86";
const TEAL_DARK = "#1c6c60";
const BELLY = "#f7e6b0";
const IVORY = "#f6eedb";
const AMBER = "#f2a33a";
const GOLD = "#ffd43b";
const PUPIL = "#17141d";
const CORAL = "#ff7d6b";
const BLUSH = "#f59c8c";

type V = [number, number, number];
type Stops = [number, number][];

/** Piecewise-linear tube radius along a path, t in 0..1. */
function profile(stops: Stops) {
  return (t: number): number => {
    if (t <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      const [t1, r1] = stops[i];
      if (t <= t1) {
        const [t0, r0] = stops[i - 1];
        return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
      }
    }
    return stops[stops.length - 1][1];
  };
}
const flat = (r: number) => profile([[0, r], [1, r]]);

const ball = (r: number) => new THREE.SphereGeometry(r, 12, 8);

/** Cone with its base on the origin and its apex along +Y. */
function cone(r: number, h: number) {
  const g = new THREE.ConeGeometry(r, h, 7);
  g.translate(0, h / 2, 0);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });

  // ---------- skeleton: spine, neck, head ----------
  const pelvis = b.joint("pelvis", { at: [0, 0.3, -0.16] });
  const chest = b.joint("chest", { at: [0, 0.345, 0.09], parent: pelvis });
  const neck1 = b.joint("neck1", { at: [0, 0.39, 0.15], parent: chest });
  const neck2 = b.joint("neck2", { at: [0, 0.45, 0.22], parent: neck1 });
  const head = b.joint("head", { at: [0, 0.55, 0.3], parent: neck2 });
  b.joint("jaw", { at: [0, 0.49, 0.28], parent: head });

  // ---------- body, belly, neck, head ----------
  const body = b.sweep(
    [[0, 0.3, -0.18], [0, 0.32, -0.08], [0, 0.335, 0.01], [0, 0.345, 0.09], [0, 0.36, 0.14]],
    {
      radius: profile([[0, 0.062], [0.3, 0.08], [0.6, 0.088], [0.85, 0.08], [1, 0.07]]),
      color: TEAL,
    }
  );
  const bodySurf = b.surface(body);

  // cream underside that pokes out below the teal body
  b.sweep(
    [[0, 0.262, -0.17], [0, 0.285, -0.08], [0, 0.3, 0.01], [0, 0.31, 0.09], [0, 0.32, 0.13]],
    { radius: profile([[0, 0.05], [0.4, 0.068], [0.8, 0.066], [1, 0.05]]), color: BELLY }
  );

  b.sweep(
    [[0, 0.34, 0.08], [0, 0.39, 0.15], [0, 0.45, 0.22], [0, 0.51, 0.27]],
    { radius: profile([[0, 0.075], [0.3, 0.058], [0.7, 0.05], [1, 0.054]]), color: TEAL }
  );

  const skull = b.sweep(
    [[0, 0.55, 0.25], [0, 0.58, 0.32], [0, 0.56, 0.39], [0, 0.54, 0.44], [0, 0.535, 0.475]],
    {
      radius: profile([[0, 0.07], [0.3, 0.085], [0.6, 0.075], [0.85, 0.052], [1, 0.04]]),
      color: TEAL,
    }
  );
  const headSurf = b.surface(skull);

  // lower jaw, hinged at the back of the mouth
  const lowerJaw = b.sweep(
    [[0, 0.49, 0.27], [0, 0.46, 0.36], [0, 0.44, 0.43], [0, 0.445, 0.46]],
    { radius: profile([[0, 0.04], [0.4, 0.03], [0.85, 0.024], [1, 0.018]]), color: BELLY }
  );
  const jawSurf = b.surface(lowerJaw);

  // small ivory teeth along the lower jaw
  for (const x of [-0.012, 0, 0.012]) {
    b.stick(cone(0.007, 0.016), IVORY, jawSurf.nearest([x, 0.47, 0.4]));
  }

  // ---------- head details (mirrored) ----------
  for (const s of [1, -1]) {
    // big golden eye with a dark pupil on its front face
    const eye = headSurf.nearest([s * 0.07, 0.57, 0.4]);
    b.stick(ball(0.032), GOLD, eye);
    const pupil = ball(0.015);
    pupil.translate(0, 0.031, 0);
    b.stick(pupil, PUPIL, eye);

    // brow bump above the eye
    b.stick(ball(0.022), TEAL_DARK, headSurf.nearest([s * 0.065, 0.625, 0.36]));
    // blush cheek for a baby look
    b.stick(ball(0.02), BLUSH, headSurf.nearest([s * 0.075, 0.51, 0.36]));
    // nostril
    b.stick(ball(0.008), PUPIL, headSurf.nearest([s * 0.018, 0.545, 0.49]));

    // swept-back horn
    b.sweep(
      [[s * 0.04, 0.6, 0.25], [s * 0.05, 0.66, 0.22], [s * 0.07, 0.71, 0.19], [s * 0.08, 0.735, 0.165]],
      { radius: profile([[0, 0.02], [0.6, 0.011], [1, 0.003]]), color: IVORY }
    );
  }

  // ---------- amber crest down the back and neck ----------
  let spine = 0;
  b.along(
    [[0, 0.362, -0.18], [0, 0.4, -0.08], [0, 0.423, 0.01], [0, 0.43, 0.09], [0, 0.448, 0.15], [0, 0.5, 0.22]],
    9,
    (at) => {
      const h = 0.05 - spine * 0.003;
      spine++;
      b.stick(cone(0.017, h), AMBER, frame(at, [0, 1, -0.3]));
    }
  );

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    [
      [0, 0.31, -0.2],
      [0, 0.3, -0.33],
      [0, 0.28, -0.46],
      [0, 0.27, -0.57],
      [0, 0.3, -0.65],
      [0, 0.36, -0.69],
      [0, 0.43, -0.67],
    ],
    { role: "tail", parent: pelvis }
  );
  b.sweep(tail, {
    radius: profile([[0, 0.045], [0.5, 0.02], [0.85, 0.011], [1, 0.008]]),
    color: TEAL,
  });
  // arrow-shaped tail tip
  b.stick(cone(0.03, 0.07), AMBER, frame([0, 0.43, -0.67], [0, 0.8, 0.3]));

  // ---------- limbs and wings (mirrored) ----------
  for (const s of [1, -1]) {
    const K = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number): V => [s * x, y, z];

    // hind leg
    const hip = b.joint(`hip${K}`, { at: P(0.08, 0.3, -0.14), parent: pelvis });
    const knee = b.joint(`knee${K}`, { at: P(0.1, 0.15, -0.08), parent: hip });
    b.joint(`ankle${K}`, { at: P(0.1, 0.035, -0.15), parent: knee });
    b.joint(`toe${K}`, { at: P(0.1, 0.02, -0.03), parent: knee });
    b.sweep([P(0.08, 0.3, -0.14), P(0.1, 0.15, -0.08), P(0.1, 0.035, -0.15)], {
      radius: profile([[0, 0.04], [0.5, 0.03], [1, 0.022]]),
      color: TEAL,
    });
    b.sweep([P(0.1, 0.035, -0.15), P(0.1, 0.02, -0.03)], {
      radius: flat(0.02),
      color: TEAL_DARK,
    });
    b.stick(ball(0.045), TEAL, bodySurf.nearest(P(0.09, 0.31, -0.12)));
    for (const k of [-1, 0, 1]) {
      b.stick(
        cone(0.009, 0.03),
        IVORY,
        frame(P(0.1 + k * 0.016, 0.022, -0.03), [s * k * 0.4, -0.3, 1])
      );
    }

    // front leg
    const shoulder = b.joint(`shoulder${K}`, { at: P(0.07, 0.32, 0.12), parent: chest });
    const elbow = b.joint(`elbow${K}`, { at: P(0.09, 0.17, 0.09), parent: shoulder });
    const wrist = b.joint(`wrist${K}`, { at: P(0.09, 0.04, 0.16), parent: elbow });
    b.joint(`paw${K}`, { at: P(0.09, 0.02, 0.21), parent: wrist });
    b.sweep([P(0.07, 0.32, 0.12), P(0.09, 0.17, 0.09), P(0.09, 0.04, 0.16)], {
      radius: profile([[0, 0.032], [0.5, 0.024], [1, 0.02]]),
      color: TEAL,
    });
    b.sweep([P(0.09, 0.04, 0.16), P(0.09, 0.02, 0.21)], {
      radius: flat(0.018),
      color: TEAL_DARK,
    });
    b.stick(ball(0.04), TEAL, bodySurf.nearest(P(0.085, 0.31, 0.12)));
    for (const k of [-1, 0, 1]) {
      b.stick(
        cone(0.009, 0.03),
        IVORY,
        frame(P(0.09 + k * 0.016, 0.02, 0.21), [s * k * 0.4, -0.3, 1])
      );
    }

    // wing: arm, wrist, three fingers, coral membrane
    const wShoulder = b.joint(`wingShoulder${K}`, { at: P(0.05, 0.4, 0.08), parent: chest });
    const wElbow = b.joint(`wingElbow${K}`, { at: P(0.2, 0.5, 0.02), parent: wShoulder });
    const wWrist = b.joint(`wingWrist${K}`, { at: P(0.36, 0.47, -0.05), parent: wElbow });
    const f1 = P(0.56, 0.44, 0.06);
    const f2 = P(0.52, 0.42, -0.16);
    const f3 = P(0.38, 0.38, -0.32);
    b.joint(`digit1${K}`, { at: f1, parent: wWrist });
    b.joint(`digit2${K}`, { at: f2, parent: wWrist });
    b.joint(`digit3${K}`, { at: f3, parent: wWrist });

    b.sweep([P(0.05, 0.4, 0.08), P(0.2, 0.5, 0.02), P(0.36, 0.47, -0.05)], {
      radius: profile([[0, 0.024], [1, 0.016]]),
      color: TEAL,
    });
    const wristPt = P(0.36, 0.47, -0.05);
    for (const tip of [f1, f2, f3]) {
      b.sweep([wristPt, tip], { radius: profile([[0, 0.012], [1, 0.006]]), color: TEAL_DARK });
    }
    // thumb claw on the wrist
    b.stick(cone(0.01, 0.035), IVORY, frame(P(0.36, 0.48, -0.03), [0, 0.8, 0.6]));

    b.membrane(
      [P(0.06, 0.42, 0.08), P(0.2, 0.5, 0.03), wristPt, f1],
      [P(0.07, 0.33, -0.12), P(0.22, 0.36, -0.2), f3, f2],
      { color: CORAL }
    );
  }

  return b.root;
}
```