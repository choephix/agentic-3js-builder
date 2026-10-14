```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description:
    "A dragonfly perched on a reed: turquoise compound eyes, an emerald thorax with dark markings, a cobalt and turquoise abdomen with black rings, and four veined clear wings.",
};

type P = [number, number, number];
type Station = [number, number, number]; // [span, leading edge, trailing edge] from the wing root
type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;
type Body = ReturnType<Builder["part"]>;

const EYE = "#1d8fae";
const FACET_LIGHT = "#86e8f7";
const FACET_DARK = "#0c5670";
const THORAX = "#2f9d6a";
const BLACK = "#16191e";
const FACE = "#1c4b4a";
const JAW = "#2d6e62";
const COBALT = "#2452c4";
const TURQ = "#1fb0b8";
const LEG = "#1d2026";
const WING = "#d3e9ee";
const VEIN = "#2a2f36";
const AMBER = "#c77a25";
const REED = "#7d9058";
const LEAF = "#93aa6a";

/** Ellipsoid centred at c with radii r. */
function blob(b: Builder, c: P, r: P, color: string, bone: Joint, w = 12, h = 8): Body {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(r[0], r[1], r[2]);
  return b.part(g, color, { at: c, bone });
}

/** Straight tapered rod from a (radius ra) to c (radius rc). */
function beam(b: Builder, a: P, c: P, ra: number, rc: number, color: string, bone: Joint, seg = 6) {
  const A = new THREE.Vector3(...a);
  const C = new THREE.Vector3(...c);
  const d = new THREE.Vector3().subVectors(C, A);
  const len = d.length();
  d.divideScalar(len);
  const ref = Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const x = new THREE.Vector3().crossVectors(ref, d).normalize();
  const z = new THREE.Vector3().crossVectors(x, d).normalize();
  const g = new THREE.CylinderGeometry(rc, ra, len, seg, 1, false);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(x, d, z));
  const m = new THREE.Vector3().addVectors(A, C).multiplyScalar(0.5);
  b.part(g, color, { at: [m.x, m.y, m.z], bone });
}

/** A flat wing laid in the horizontal plane, origin at its root, span along +X (s = 1) or -X (s = -1). */
function wingGeo(st: Station[], tipU: number, s: number): THREE.BufferGeometry {
  const X = (u: number) => s * u;
  const sh = new THREE.Shape();
  sh.moveTo(X(st[0][0]), st[0][1]);
  for (let i = 1; i < st.length; i++) sh.lineTo(X(st[i][0]), st[i][1]);
  const [uL, leadL, trailL] = st[st.length - 1];
  sh.quadraticCurveTo(X(uL + 0.0035), leadL, X(tipU), 0);
  sh.quadraticCurveTo(X(uL + 0.0035), trailL, X(uL), trailL);
  for (let i = st.length - 2; i >= 0; i--) sh.lineTo(X(st[i][0]), st[i][2]);
  sh.closePath();
  const depth = 0.00025;
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 6 });
  g.translate(0, 0, -depth / 2);
  g.rotateX(Math.PI / 2); // chord (shape Y) -> forward (+Z); thickness -> Y
  return g;
}

/** Longitudinal and cross veins drawn on a wing at root height. */
function veins(b: Builder, root: P, s: number, st: Station[], bone: Joint) {
  const T = [0.06, 0.2, 0.42, 0.66, 0.9];
  const at = (i: number, t: number): P => {
    const [u, lead, trail] = st[i];
    return [root[0] + s * u, root[1], root[2] + trail + t * (lead - trail)];
  };
  for (const t of T) {
    for (let i = 0; i + 1 < st.length; i++) {
      beam(b, at(i, t), at(i + 1, t), 0.0002, 0.0002, VEIN, bone, 4);
    }
  }
  for (let i = 1; i < st.length; i++) {
    for (let k = 0; k + 1 < T.length; k++) {
      beam(b, at(i, T[k]), at(i, T[k + 1]), 0.00014, 0.00014, VEIN, bone, 4);
    }
  }
}

/** Fibonacci-spiral points on the unit sphere: an even spread for facets. */
function fib(n: number): P[] {
  const out: P[] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = ga * i;
    out.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  return out;
}

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // ---- skeleton -------------------------------------------------------
  const THC: P = [0, 0.128, 0.006];
  const thorax = b.joint("thorax", { at: THC });
  const head = b.joint("head", { at: [0, 0.1305, 0.0275], parent: thorax });
  const jaw = b.joint("jaw", { at: [0, 0.1222, 0.036], parent: head });

  const AY = 0.1262; // abdomen axis height
  const abdZ = (i: number) => -0.004 - 0.0062 * i;
  const abd: Joint[] = [];
  let prev: Joint = thorax;
  for (let i = 0; i < 10; i++) {
    const j = b.joint(`abd${i + 1}`, { at: [0, AY, abdZ(i)], parent: prev });
    abd.push(j);
    prev = j;
  }

  const FW_ROOT: P = [0.0036, 0.1368, 0.0132];
  const HW_ROOT: P = [0.0040, 0.1364, 0.0010];
  const FORE: Station[] = [
    [0.0, 0.0011, -0.0011],
    [0.01, 0.0019, -0.0019],
    [0.02, 0.0028, -0.0032],
    [0.03, 0.0030, -0.0034],
    [0.038, 0.0024, -0.0028],
  ];
  const HIND: Station[] = [
    [0.0, 0.0022, -0.0022],
    [0.008, 0.0030, -0.0034],
    [0.018, 0.0034, -0.0042],
    [0.028, 0.0028, -0.0040],
    [0.034, 0.0018, -0.0028],
  ];
  const FORE_TIP = 0.0445;
  const HIND_TIP = 0.0375;

  // legs: hip, knee, ankle, toe on the left side (mirrored for the right); toes grip the reed
  const LEG_SPEC: [string, P, P, P, P][] = [
    ["F", [0.0052, 0.1222, 0.0118], [0.0112, 0.116, 0.019], [0.0088, 0.1078, 0.0128], [0.0017, 0.1016, 0.0018]],
    ["M", [0.0056, 0.1214, 0.004], [0.012, 0.115, 0.004], [0.01, 0.1066, -0.0008], [0.0021, 0.1, -0.0012]],
    ["R", [0.0056, 0.1206, -0.0032], [0.0118, 0.114, -0.006], [0.0094, 0.1054, -0.007], [0.0017, 0.099, -0.0022]],
  ];

  // ---- legs ------------------------------------------------------------
  for (const [tag, hip, knee, ankle, toe] of LEG_SPEC) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const p = (q: P): P => [q[0] * s, q[1], q[2]];
      const hj = b.joint(`hip${tag}${side}`, { at: p(hip), parent: thorax });
      const kj = b.joint(`knee${tag}${side}`, { at: p(knee), parent: hj });
      const aj = b.joint(`ankle${tag}${side}`, { at: p(ankle), parent: kj });
      b.joint(`toe${tag}${side}`, { at: p(toe), parent: aj });
      beam(b, p(hip), p(knee), 0.0007, 0.0005, LEG, hj);
      beam(b, p(knee), p(ankle), 0.0005, 0.00042, LEG, kj);
      beam(b, p(ankle), p(toe), 0.00042, 0.0003, LEG, aj);
    }
  }

  // ---- wings -----------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fw: P = [FW_ROOT[0] * s, FW_ROOT[1], FW_ROOT[2]];
    const hw: P = [HW_ROOT[0] * s, HW_ROOT[1], HW_ROOT[2]];
    const wf = b.joint(`wingF${side}`, { at: fw, parent: thorax });
    const wh = b.joint(`wingH${side}`, { at: hw, parent: thorax });

    b.part(wingGeo(FORE, FORE_TIP, s), WING, { at: fw, bone: wf });
    veins(b, fw, s, FORE, wf);
    b.part(new THREE.BoxGeometry(0.005, 0.0006, 0.001), AMBER, {
      at: [fw[0] + s * 0.0325, fw[1], fw[2] + 0.0022],
      bone: wf,
    });

    b.part(wingGeo(HIND, HIND_TIP, s), WING, { at: hw, bone: wh });
    veins(b, hw, s, HIND, wh);
  }

  // ---- thorax ----------------------------------------------------------
  const thoraxBody = blob(b, THC, [0.008, 0.0092, 0.013], THORAX, thorax);
  const thSurf = b.surface(thoraxBody);
  for (const s of [1, -1]) {
    for (let k = 0; k < 6; k++) {
      const t = k / 5;
      b.stick(
        new THREE.SphereGeometry(0.0011, 6, 4),
        BLACK,
        thSurf.nearest([0.0078 * s, 0.13 - 0.0028 * t, 0.015 - 0.023 * t]),
      );
    }
  }

  // ---- head and jaw ----------------------------------------------------
  blob(b, [0, 0.1305, 0.0275], [0.0072, 0.0082, 0.0088], FACE, head);
  blob(b, [0, 0.1252, 0.034], [0.0058, 0.0048, 0.0046], FACE, head);
  blob(b, [0, 0.1222, 0.0362], [0.003, 0.0014, 0.0026], JAW, jaw);

  // ---- compound eyes, faceted with dotted ommatidia --------------------
  const EYE_R: P = [0.0108, 0.0108, 0.0118];
  const FIB = fib(100);
  for (const s of [1, -1]) {
    const c: P = [0.0065 * s, 0.1335, 0.0295];
    const eye = blob(b, c, EYE_R, EYE, head, 14, 10);
    const eyeSurf = b.surface(eye);
    FIB.forEach((n, i) => {
      if (n[2] < -0.45) return; // back of the head
      if (s > 0 ? n[0] < -0.1 : n[0] > 0.1) return; // the side that meets the other eye
      const p: P = [c[0] + n[0] * EYE_R[0], c[1] + n[1] * EYE_R[1], c[2] + n[2] * EYE_R[2]];
      b.stick(
        new THREE.DodecahedronGeometry(0.001, 0),
        i % 3 === 0 ? FACET_LIGHT : FACET_DARK,
        eyeSurf.nearest(p),
      );
    });
  }

  // ---- abdomen: ten tapering segments with black rings -----------------
  const R = [0.0052, 0.0047, 0.0044, 0.0042, 0.004, 0.0038, 0.0036, 0.0034, 0.0034, 0.0037, 0.003];
  for (let i = 0; i < 10; i++) {
    const g = new THREE.CylinderGeometry(R[i], R[i + 1], 0.0064, 10, 1, false);
    g.rotateX(Math.PI / 2); // top (front) -> +Z
    b.part(g, i >= 7 ? TURQ : COBALT, { at: [0, AY, abdZ(i) - 0.0031], bone: abd[i] });
  }
  for (let i = 0; i < 9; i++) {
    const rr = R[i + 1] + 0.00018;
    const g = new THREE.CylinderGeometry(rr, rr, 0.001, 10, 1, false);
    g.rotateX(Math.PI / 2);
    b.part(g, BLACK, { at: [0, AY, abdZ(i + 1)], bone: abd[i + 1] });
  }
  // claspers at the tail
  beam(b, [0.0008, AY - 0.0002, -0.065], [0.0018, AY - 0.0006, -0.0692], 0.00026, 0.00008, BLACK, abd[9], 5);
  beam(b, [-0.0008, AY - 0.0002, -0.065], [-0.0018, AY - 0.0006, -0.0692], 0.00026, 0.00008, BLACK, abd[9], 5);

  // ---- the reed it perches on, and a leaf beside it --------------------
  b.part(new THREE.CylinderGeometry(0.0019, 0.0023, 0.11, 8, 1, false), REED, {
    at: [0, 0.055, 0],
    bone: thorax,
  });

  const leafShape = new THREE.Shape();
  leafShape.moveTo(-0.0016, 0);
  leafShape.quadraticCurveTo(-0.0026, 0.042, 0, 0.088);
  leafShape.quadraticCurveTo(0.0022, 0.042, 0.0016, 0);
  leafShape.closePath();
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.0005, bevelEnabled: false, curveSegments: 6 });
  leafGeo.translate(0, 0, -0.00025);
  leafGeo.rotateZ(0.28);
  b.part(leafGeo, LEAF, { at: [-0.0035, 0, -0.002], bone: thorax });

  return b.root;
}
```