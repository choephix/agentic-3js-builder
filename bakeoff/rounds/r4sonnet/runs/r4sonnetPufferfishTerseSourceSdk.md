```ts
import * as THREE from "three";
import {
  createBuilder,
  polyline,
  rng,
  paint,
  spots,
  mottle,
  noise,
  smoothstep,
  mix,
  interpolate,
  DEG,
} from "agentic-3js-builder";

export const meta = {
  name: "Pufferfish",
  description:
    "A chubby, faceted pufferfish at real size (about 38 cm). Ochre back with dark spots, cream belly with a golden lateral line, " +
    "bulging gold eyes with eyelids, a buck-toothed beak made of separate upper and lower jaws, rayed fins, " +
    "a ring of small spines, and a full skeleton (root, head, jaw, eyes, spine, tail, pectoral/dorsal/anal fins).",
};

// ---------------------------------------------------------------- palette
const OCHRE = "#c98d3b";
const OCHRE2 = "#a8702a";
const DARK = "#3a2312";
const CREAM = "#f6e9c8";
const CREAM2 = "#e3cb9c";
const GOLD_LINE = "#f3c85a";
const MUZZLE = "#f4dba3";
const RIM = "#6b4220";
const BLUSH = "#eb9a60";
const SLIT = "#2e1a0c";
const DEEP = "#8a5a22";

const EYE_GOLD = "#e7b93c";
const EYE_RING = "#b8631a";
const PUPIL = "#120b08";
const LID = "#b27a30";
const SPINE_BACK = "#6a4019";
const SPINE_BELLY = "#f3e4bd";
const LIP = "#efc27a";
const TOOTH = "#fff4d6";
const SEAM = "#7d5d33";
const CAVITY = "#2a120d";

const FIN_BASE = "#f0c46c";
const FIN_LIGHT = "#f8e0a0";
const FIN_RAY = "#c9852f";
const FIN_RIM = "#7a4a1c";

// ---------------------------------------------------------------- body profile (z front → back)
const Z0 = 0.095; // path start (round cap adds the snout)
const Z1 = -0.165; // path end
const PROFILE_Z = [0.095, 0.075, 0.05, 0.02, -0.01, -0.04, -0.07, -0.095, -0.12, -0.14, -0.165];
const PROFILE_R = [0.045, 0.07, 0.092, 0.111, 0.118, 0.113, 0.096, 0.074, 0.05, 0.035, 0.027];
const PROFILE_T = PROFILE_Z.map((z) => (Z0 - z) / (Z0 - Z1));
const bodyRadius = (t: number): [number, number] => {
  const r = interpolate(PROFILE_T, PROFILE_R, t);
  return [r * 0.98, r * 1.03];
};

// ---------------------------------------------------------------- fins
/** A fan (circular sector with its apex below the root) as an outline in meters. */
function fan(ax: number, ay: number, R: number, centerDeg: number, halfDeg: number, rBase: number, steps = 6) {
  const at = (r: number, a: number): [number, number] => [
    ax + r * Math.cos((centerDeg + a) * DEG),
    ay + r * Math.sin((centerDeg + a) * DEG),
  ];
  const pts: Array<[number, number]> = [at(rBase, -halfDeg)];
  for (let i = 0; i <= steps; i++) pts.push(at(R, -halfDeg + (2 * halfDeg * i) / steps));
  pts.push(at(rBase, halfDeg));
  return pts;
}

/** Fin rays: thin darker spokes on a pale membrane, a dark rim and a dark root. Reads the outline's own x,y. */
function finPaint(o: { ax: number; ay: number; center: number; half: number; R: number; step: number }) {
  return paint((_p, _n, s) => {
    const dx = s[0] - o.ax;
    const dy = s[1] - o.ay;
    const r = Math.hypot(dx, dy);
    let ang = Math.atan2(dy, dx) / DEG - o.center;
    ang = ((((ang + 540) % 360) + 360) % 360) - 180;
    const f = ang / o.step;
    const d = Math.abs(f - Math.round(f));
    const ray = smoothstep(0.2, 0.08, d) * smoothstep(0.22 * o.R, 0.4 * o.R, r);
    let c = mix(FIN_BASE, FIN_LIGHT, smoothstep(0.35 * o.R, 0.85 * o.R, r));
    c = mix(c, FIN_RAY, ray * 0.85);
    const edge = Math.max(
      smoothstep(o.R - 0.01, o.R - 0.004, r),
      smoothstep(o.half - 3.5, o.half - 1.5, Math.abs(ang)),
    );
    c = mix(c, FIN_RIM, edge * 0.85);
    c = mix(c, FIN_RIM, smoothstep(0.3 * o.R, 0.12 * o.R, r) * 0.5);
    return c;
  });
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "pufferfish" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const cy = 0.13; // body centre height (grounded at the end)

  // ------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, cy, 0], dir: [0, 0, 1] });
  const head = b.joint("head", { parent: root, at: [0, cy, 0.07], dir: [0, 0, 1], role: "head" });
  const ym = cy - 0.012; // mouth line
  const jaw = b.joint("jaw", { parent: head, at: [0, ym - 0.002, 0.095], dir: [0, 0, 1], role: "jaw" });

  const spine = b.chain(
    "spine",
    [
      [0, cy, 0],
      [0, cy, -0.06],
      [0, cy, -0.12],
    ],
    { parent: root, names: ["spine1", "spine2"], role: "spine", up: [0, 1, 0] },
  );
  const tail = b.chain(
    "tail",
    [
      [0, cy, -0.12],
      [0, cy, -0.14],
      [0, cy, -0.165],
    ],
    { parent: spine, names: ["tail1", "tail2", "tail3"], role: "tail", up: [0, 1, 0] },
  );

  // ------------------------------------------------------------ body paint
  const eyeBase: THREE.Vector3[] = []; // filled once the eyes are seated; read lazily when the paint bakes
  const back = spots(mottle(OCHRE, OCHRE2, { size: 0.05, seed: 2, contrast: 1.3 }), DARK, {
    size: 0.046,
    amount: 0.25,
    seed: 7,
  });
  const belly = spots(CREAM, CREAM2, { size: 0.022, amount: 0.3, seed: 4 });
  const cheeks = [V(0.09, cy - 0.03, 0.028), V(-0.09, cy - 0.03, 0.028)];

  const coat = paint((p, n) => {
    const h = p.y - cy + (noise(p, 0.07, 3) - 0.5) * 0.045;
    const split = smoothstep(-0.05, -0.028, h);
    let c =
      split <= 0 ? belly.at(p, n) : split >= 1 ? back.at(p, n) : mix(belly.at(p, n), back.at(p, n), split);
    // golden lateral line where back meets belly
    c = mix(c, GOLD_LINE, smoothstep(0.008, 0.0015, Math.abs(h + 0.04)) * 0.8);
    // pale muzzle
    c = mix(c, MUZZLE, smoothstep(0.085, 0.118, p.z) * 0.85);
    // darker tail wrist
    c = mix(c, DEEP, smoothstep(-0.115, -0.15, p.z) * 0.6);
    // cheeks
    for (const ch of cheeks) c = mix(c, BLUSH, 0.55 * smoothstep(0.03, 0.01, ch.distanceTo(p)));
    // dark ring round each eye
    for (const e of eyeBase) {
      const d = e.distanceTo(p);
      const ringBand = smoothstep(0.038, 0.041, d) * smoothstep(0.052, 0.046, d);
      c = mix(c, RIM, ringBand * 0.95);
    }
    // gill slit
    const ax = Math.abs(p.x);
    if (ax > 0.07) {
      const dy = p.y - (cy - 0.004);
      const dz = Math.abs(p.z - (0.008 - 5 * dy * dy));
      const slit = smoothstep(0.0042, 0.0022, dz) * smoothstep(0.036, 0.028, Math.abs(dy));
      c = mix(c, SLIT, slit * 0.9);
    }
    return c;
  });

  // ------------------------------------------------------------ body
  const body = b.sweep(polyline([[0, cy, Z0], [0, cy, Z1]]), bodyRadius, {
    name: "body",
    color: coat,
    bone: [head, spine, tail],
    up: [0, 1, 0],
    sides: 12,
    smooth: false,
    caps: { start: "round", end: "flat" },
    shift: (t: number) => [0, -0.06 * bodyRadius(t)[1]] as const,
  });
  const skin = b.surface(body);

  // ------------------------------------------------------------ eyes
  for (const sgn of [1, -1]) {
    const tag = sgn > 0 ? "L" : "R";
    const hit = skin.ray([sgn * 0.4, cy + 0.034, 0.045], [-sgn, 0, 0])!;
    const n = hit.n.clone();
    eyeBase.push(hit.at.clone());
    const gaze = n.clone().multiplyScalar(0.8).add(V(0, 0.05, 0.6)).normalize();
    const R = 0.031;
    const centre = hit.at.clone().addScaledVector(n, 0.008);
    const eyeJ = b.joint(`eye${tag}`, { parent: head, at: centre, dir: gaze });

    const upv = V(0, 1, 0).addScaledVector(gaze, -gaze.y).normalize();
    const latv = V(-sgn, 0, 0).addScaledVector(gaze, sgn * gaze.x).normalize();

    // raised socket, eyeball, iris ring, pupil, highlights, lid
    b.part(new THREE.SphereGeometry(0.039, 12, 7), RIM, {
      bone: head,
      at: hit.at.clone().addScaledVector(n, 0.002),
      dir: n,
      scale: [1, 0.5, 1],
      flat: true,
      name: `eyeSocket${tag}`,
    });
    b.part(new THREE.SphereGeometry(R, 12, 9), EYE_GOLD, { bone: eyeJ, at: centre, name: `eyeball${tag}` });
    b.part(new THREE.TorusGeometry(0.0228, 0.003, 5, 16), EYE_RING, {
      bone: eyeJ,
      at: centre.clone().addScaledVector(gaze, 0.021),
      dir: gaze,
      axis: "z",
      name: `iris${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0185, 12, 8), PUPIL, {
      bone: eyeJ,
      at: centre.clone().addScaledVector(gaze, 0.0265),
      dir: gaze,
      scale: [1, 0.4, 1],
      name: `pupil${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0055, 8, 6), "#ffffff", {
      bone: eyeJ,
      at: centre.clone().addScaledVector(gaze, 0.0345).addScaledVector(upv, 0.0075).addScaledVector(latv, 0.004),
      name: `glint${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0026, 6, 5), "#ffffff", {
      bone: eyeJ,
      at: centre.clone().addScaledVector(gaze, 0.0327).addScaledVector(upv, -0.0085).addScaledVector(latv, -0.0055),
      name: `glintSmall${tag}`,
    });
    const lidDir = upv.clone().multiplyScalar(0.93).addScaledVector(gaze, 0.37).normalize();
    b.part(new THREE.SphereGeometry(0.0335, 12, 5, 0, Math.PI * 2, 0, 0.7), LID, {
      bone: eyeJ,
      at: centre,
      dir: lidDir,
      flat: true,
      name: `eyelid${tag}`,
    });
  }

  // ------------------------------------------------------------ pectoral fins
  const pecBases: THREE.Vector3[] = [];
  const pecPaint = finPaint({ ax: -0.03, ay: 0, center: 0, half: 24, R: 0.11, step: 5 });
  for (const sgn of [1, -1]) {
    const tag = sgn > 0 ? "L" : "R";
    const hit = skin.ray([sgn * 0.4, cy - 0.012, -0.018], [-sgn, 0, 0])!;
    pecBases.push(hit.at.clone());
    const origin = hit.at.clone().addScaledVector(hit.n, -0.006);
    const xDir = V(sgn * 0.5, 0.06, -1).normalize();
    const j = b.joint(`pectoral${tag}`, { parent: "spine1", at: origin, dir: xDir, role: "fan" });
    b.extrude(fan(-0.03, 0, 0.11, 0, 24, 0.035), {
      color: pecPaint,
      at: origin,
      x: xDir,
      y: [0, 1, 0],
      thickness: 0.0045,
      bevel: 0.0013,
      smoothing: 1,
      bone: j,
      name: `pectoralFin${tag}`,
    });
  }

  // ------------------------------------------------------------ dorsal + anal fins (sit on the sloping peduncle)
  {
    const A = skin.ray([0, cy + 0.3, -0.082], [0, -1, 0])!;
    const B = skin.ray([0, cy + 0.3, -0.138], [0, -1, 0])!;
    const xDir = B.at.clone().sub(A.at).normalize();
    const origin = A.at.clone().addScaledVector(xDir, 0.007);
    const j = b.joint("dorsal", { parent: "spine2", at: origin, dir: xDir, role: "fan" });
    b.extrude(fan(0.03, -0.045, 0.1, 90, 24, 0.03), {
      color: finPaint({ ax: 0.03, ay: -0.045, center: 90, half: 24, R: 0.1, step: 6 }),
      at: origin,
      x: xDir,
      y: [0, 1, 0],
      thickness: 0.004,
      bevel: 0.0012,
      smoothing: 1,
      bone: j,
      name: "dorsalFin",
    });
  }
  {
    const A = skin.ray([0, cy - 0.3, -0.082], [0, 1, 0])!;
    const B = skin.ray([0, cy - 0.3, -0.138], [0, 1, 0])!;
    const xDir = B.at.clone().sub(A.at).normalize();
    const origin = A.at.clone().addScaledVector(xDir, 0.008);
    const j = b.joint("anal", { parent: "spine2", at: origin, dir: xDir, role: "fan" });
    b.extrude(fan(0.028, -0.04, 0.075, 90, 24, 0.028), {
      color: finPaint({ ax: 0.028, ay: -0.04, center: 90, half: 24, R: 0.075, step: 6 }),
      at: origin,
      x: xDir,
      y: [0, -1, 0],
      thickness: 0.004,
      bevel: 0.0012,
      smoothing: 1,
      bone: j,
      name: "analFin",
    });
  }

  // ------------------------------------------------------------ caudal fin
  b.extrude(fan(-0.03, 0, 0.105, 0, 26, 0.03, 8), {
    color: finPaint({ ax: -0.03, ay: 0, center: 0, half: 26, R: 0.105, step: 4 }),
    at: [0, cy - 0.0015, -0.152],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.005,
    bevel: 0.0015,
    smoothing: 1,
    bone: "tail3",
    name: "caudalFin",
  });

  // ------------------------------------------------------------ mouth: separate upper and lower jaw
  const sph = (r: number) => new THREE.SphereGeometry(r, 10, 7);
  b.part(new THREE.BoxGeometry(0.034, 0.012, 0.02), CAVITY, {
    bone: head,
    at: V(0, ym - 0.001, 0.135),
    name: "mouthCavity",
  });
  b.part(sph(0.024), LIP, {
    bone: head,
    at: V(0, ym + 0.007, 0.127),
    scale: [1.25, 0.72, 1],
    flat: true,
    name: "upperLip",
  });
  b.part(new THREE.BoxGeometry(0.03, 0.007, 0.014), TOOTH, {
    bone: head,
    at: V(0, ym + 0.0035, 0.152),
    name: "upperBeak",
  });
  b.part(new THREE.BoxGeometry(0.0016, 0.0072, 0.0146), SEAM, {
    bone: head,
    at: V(0, ym + 0.0035, 0.1525),
    name: "upperSeam",
  });
  b.part(sph(0.021), LIP, {
    bone: jaw,
    at: V(0, ym - 0.013, 0.121),
    scale: [1.2, 0.72, 1],
    flat: true,
    name: "lowerLip",
  });
  b.part(new THREE.BoxGeometry(0.027, 0.006, 0.013), TOOTH, {
    bone: jaw,
    at: V(0, ym - 0.003, 0.1485),
    name: "lowerBeak",
  });
  b.part(new THREE.BoxGeometry(0.0016, 0.0062, 0.0136), SEAM, {
    bone: jaw,
    at: V(0, ym - 0.003, 0.1488),
    name: "lowerSeam",
  });

  // nostrils
  for (const sgn of [1, -1]) {
    const h = skin.ray([sgn * 0.013, cy + 0.3, 0.103], [0, -1, 0]);
    if (!h) continue;
    b.part(new THREE.SphereGeometry(0.004, 6, 5), DARK, {
      bone: head,
      at: h.at.clone().addScaledVector(h.n, 0.0004),
      dir: h.n,
      scale: [1, 0.45, 1.3],
      name: sgn > 0 ? "nostrilL" : "nostrilR",
    });
  }

  // ------------------------------------------------------------ spines
  const rand = rng(11);
  const spineGeo = new THREE.ConeGeometry(0.0062, 0.022, 5, 1, true);
  const spineHits = skin.scatter(95, {
    rng: rand,
    minDist: 0.03,
    keepOut: (p) => {
      if (p.z > 0.098 || p.z < -0.1) return true;
      for (const e of eyeBase) if (e.distanceTo(p) < 0.062) return true;
      for (const q of pecBases) if (q.distanceTo(p) < 0.06) return true;
      if (Math.abs(p.x) < 0.03 && Math.abs(p.y - cy) > 0.055 && p.z < -0.06) return true;
      if (Math.abs(p.x) > 0.08 && Math.abs(p.z - 0.008) < 0.03 && Math.abs(p.y - cy) < 0.045) return true;
      return false;
    },
    filter: (h) => h.n.y > -0.72,
  });
  for (const h of spineHits) {
    const onBack = h.n.y > 0.15;
    b.stick(spineGeo, onBack ? SPINE_BACK : SPINE_BELLY, h, {
      embed: 0.3,
      scale: 0.75 + 0.5 * rand(),
      flat: true,
      group: "spines",
    });
  }

  // ------------------------------------------------------------ finish: bake paints, plant on the floor
  const model = b.root;
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  model.position.y -= box.min.y;
  model.updateMatrixWorld(true);
  return model;
}
```