import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Emperor dragonfly",
  description:
    "Anax imperator hovering over a pond: huge turquoise eyes, apple-green thorax, electric-blue abdomen with black dorsal markings, four veined golden wings held flat, six legs tucked beneath.",
};

type Wing = { sgn: number; x0: number; zc0: number; zc1: number; L: number; H: number; y0: number };

const BODY_Y = 0.2; // thorax height above the pond (m). The dragonfly hovers, so it keeps this height.
const ABD_SEG = 0.0065; // abdomen segment length (m)
const WING_SPEC = {
  fore: { x0: 0.006, zc0: 0.0062, zc1: 0.0095, L: 0.05, H: 0.0046, y0: 0.2085 },
  hind: { x0: 0.0055, zc0: -0.0068, zc1: -0.0088, L: 0.047, H: 0.006, y0: 0.2085 },
};

const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Matrix taking +Y onto the unit vector y, built from an orthonormal basis. */
function basisY(y: THREE.Vector3): THREE.Matrix4 {
  const ref = Math.abs(y.y) < 0.95 ? P(0, 1, 0) : P(1, 0, 0);
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return new THREE.Matrix4().makeBasis(x, y, z);
}

/** One triangle, emitted with both windings so thin membranes read from either side. */
function tri(out: number[], a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
  out.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  out.push(a.x, a.y, a.z, c.x, c.y, c.z, b.x, b.y, b.z);
}

function quad(out: number[], a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) {
  tri(out, a, b, c);
  tri(out, a, c, d);
}

/** A flat vein strip of half-width hw from s to e, lying in the wing plane. */
function ribbon(out: number[], s: THREE.Vector3, e: THREE.Vector3, hw: number) {
  const d = new THREE.Vector3().subVectors(e, s);
  const n = P(-d.z, 0, d.x).normalize().multiplyScalar(hw);
  const s1 = s.clone().add(n);
  const s2 = s.clone().sub(n);
  const e1 = e.clone().add(n);
  const e2 = e.clone().sub(n);
  tri(out, s1, s2, e1);
  tri(out, s2, e2, e1);
}

// Wing coordinates: u runs root (0) to tip (1) along the span; v runs trailing (-1) to leading (+1) edge.
const prof = (u: number) => (1 - u * u * u) * (0.7 + 0.3 * Math.sin(Math.PI * u));
const wingZc = (w: Wing, u: number) => w.zc0 + (w.zc1 - w.zc0) * u;
const wingY = (w: Wing, u: number) => w.y0 + 0.0035 * u;
const wingPt = (w: Wing, u: number, v: number, lift = 0) =>
  P(w.sgn * (w.x0 + u * w.L), wingY(w, u) + lift, wingZc(w, u) + v * w.H * prof(u));

export default function build() {
  const b = createBuilder({ name: "emperor-dragonfly" });
  type Joint = ReturnType<typeof b.joint>;
  const rand = rng(1804);

  const BLUE = "#1378f0";
  const BLACK = "#0d1116";
  const GREEN = "#8fd14f";
  const TURQ = "#2fd3c6";
  const HEAD = "#16292c";
  const STRIPE = "#132230";
  const LEG = "#1c2224";
  const MOUTH = "#2a3b36";
  const GLASS = "#e9dfae";
  const VEIN = "#2d2a1e";
  const WATER = "#22606a";
  const PAD = "#4f9b3d";
  const REED = "#6f9e43";
  const CATTAIL = "#6b4a2b";

  // Pieces are built in model space, then handed over with `at` set to their own centre.
  const put = (geo: THREE.BufferGeometry, color: string, bone: Joint) => {
    geo.computeBoundingBox();
    const c = new THREE.Vector3();
    geo.boundingBox!.getCenter(c);
    geo.translate(-c.x, -c.y, -c.z);
    b.part(geo, color, { at: c, bone });
  };

  // A tapered tube from s (radius rS) to e (radius rE).
  const tube = (
    s: THREE.Vector3,
    e: THREE.Vector3,
    rS: number,
    rE: number,
    color: string,
    bone: Joint,
    radial = 6,
  ) => {
    const d = new THREE.Vector3().subVectors(e, s);
    const len = d.length();
    const geo = new THREE.CylinderGeometry(rE, rS, len, radial, 1);
    geo.applyMatrix4(basisY(d.clone().divideScalar(len)));
    geo.translate((s.x + e.x) / 2, (s.y + e.y) / 2, (s.z + e.z) / 2);
    put(geo, color, bone);
  };

  // A flat disc centred at `centre` with its normal along `axis`.
  const disc = (
    centre: THREE.Vector3,
    axis: THREE.Vector3,
    r: number,
    h: number,
    color: string,
    bone: Joint,
  ) => {
    const geo = new THREE.CylinderGeometry(r, r, h, 8, 1);
    geo.applyMatrix4(basisY(axis.clone().normalize()));
    geo.translate(centre.x, centre.y, centre.z);
    put(geo, color, bone);
  };

  // ---- Skeleton: the thorax is the root; head, abdomen, legs and wings hang from it.
  const thorax = b.joint("thorax", { at: [0, BODY_Y, 0] });
  const head = b.joint("head", { at: [0, BODY_Y, 0.0255], parent: thorax });
  const jaw = b.joint("jaw", { at: [0, 0.1968, 0.0345], parent: head });

  // ---- Thorax: apple green capsule with dark side stripes.
  const thoraxGeo = new THREE.CapsuleGeometry(0.0105, 0.018, 3, 8);
  thoraxGeo.rotateX(Math.PI / 2);
  thoraxGeo.scale(1.08, 1, 1);
  thoraxGeo.translate(0, BODY_Y, 0);
  put(thoraxGeo, GREEN, thorax);
  for (const s of [1, -1]) {
    for (const z of [0.0072, -0.0004]) {
      const stripe = new THREE.BoxGeometry(0.0022, 0.0046, 0.0028);
      stripe.translate(s * 0.0106, BODY_Y + 0.0006, z);
      put(stripe, STRIPE, thorax);
    }
  }

  // ---- Head: faceted compound eyes wrap the front of a small dark skull.
  const skull = new THREE.IcosahedronGeometry(0.0082, 1);
  skull.translate(0, 0.2028, 0.0262);
  put(skull, HEAD, head);
  for (const s of [1, -1]) {
    const eye = new THREE.IcosahedronGeometry(0.0118, 2);
    eye.scale(1, 1.02, 1.2);
    eye.computeVertexNormals();
    eye.translate(s * 0.0075, 0.2055, 0.0275);
    put(eye, TURQ, head);
  }
  // Upper and lower mouthparts, on separate bones so the mouth can open.
  const labrum = new THREE.BoxGeometry(0.004, 0.002, 0.003);
  labrum.translate(0, 0.1995, 0.0352);
  put(labrum, MOUTH, head);
  const labium = new THREE.BoxGeometry(0.0038, 0.0018, 0.0034);
  labium.translate(0, 0.1968, 0.0352);
  put(labium, MOUTH, jaw);

  // ---- Abdomen: ten tapering segments, each on its own joint, electric blue with black markings.
  const abdZ = (k: number) => -0.012 - ABD_SEG * k;
  const abdR = [0.0062, 0.006, 0.0054, 0.0049, 0.0045, 0.0041, 0.0038, 0.0035, 0.0032, 0.003, 0.0028];
  const ab: Joint[] = [];
  let up: Joint = thorax;
  for (let k = 0; k < 10; k++) {
    up = b.joint(`ab${k}`, { at: [0, BODY_Y, abdZ(k)], parent: up });
    ab.push(up);
  }
  for (let k = 0; k < 10; k++) {
    tube(P(0, BODY_Y, abdZ(k)), P(0, BODY_Y, abdZ(k + 1)), abdR[k], abdR[k + 1], BLUE, ab[k], 8);
    const zm = (abdZ(k) + abdZ(k + 1)) / 2;
    const rm = (abdR[k] + abdR[k + 1]) / 2;
    // Black dorsal stripe down the back of each segment.
    const dorsal = new THREE.BoxGeometry(0.0026 - 0.00012 * k, 0.0008, 0.0042);
    dorsal.translate(0, BODY_Y + rm - 0.0002, zm);
    put(dorsal, BLACK, ab[k]);
    // Dark flank spots.
    if (k >= 1 && k <= 8) {
      for (const s of [1, -1]) {
        const spot = new THREE.IcosahedronGeometry(0.0009, 0);
        spot.translate(s * rm * 0.98, BODY_Y - 0.0003, zm);
        put(spot, BLACK, ab[k]);
      }
    }
  }
  // Thin black bands at the joints that separate the blue segments.
  for (const k of [3, 5, 7]) {
    disc(P(0, BODY_Y, abdZ(k)), P(0, 0, 1), abdR[k] + 0.00012, 0.0007, BLACK, ab[k]);
  }
  // Claspers at the tail tip.
  for (const s of [1, -1]) {
    tube(
      P(s * 0.0012, BODY_Y, abdZ(10)),
      P(s * 0.0031, BODY_Y - 0.0012, abdZ(10) - 0.0105),
      0.0006,
      0.00012,
      BLACK,
      ab[9],
      5,
    );
  }

  // ---- Legs: three jointed legs per side, folded up under the body.
  const LEGS: [string, number[], number[], number[], number[]][] = [
    ["fore", [0.0062, 0.19, 0.0125], [0.0118, 0.1768, 0.0236], [0.0074, 0.1702, 0.0232], [0.0056, 0.166, 0.019]],
    ["mid", [0.0074, 0.1896, 0.0005], [0.0176, 0.1748, -0.0006], [0.0122, 0.169, -0.005], [0.009, 0.1652, -0.0088]],
    ["hind", [0.0066, 0.1898, -0.0108], [0.0166, 0.1762, -0.019], [0.0116, 0.1704, -0.0236], [0.0092, 0.1662, -0.0272]],
  ];
  for (const [tag, hp, kp, ap, tp] of LEGS) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const pt = (p: number[]) => P(s * p[0], p[1], p[2]);
      const hip = b.joint(`${tag}Hip${side}`, { at: [s * hp[0], hp[1], hp[2]], parent: thorax });
      const knee = b.joint(`${tag}Knee${side}`, { at: [s * kp[0], kp[1], kp[2]], parent: hip });
      const ankle = b.joint(`${tag}Ankle${side}`, { at: [s * ap[0], ap[1], ap[2]], parent: knee });
      tube(pt(hp), pt(kp), 0.0011, 0.0009, LEG, hip);
      tube(pt(kp), pt(ap), 0.0009, 0.0007, LEG, knee);
      tube(pt(ap), pt(tp), 0.0007, 0.0004, LEG, ankle, 5);
      const knob = new THREE.IcosahedronGeometry(0.0013, 0);
      const kc = pt(kp);
      knob.translate(kc.x, kc.y, kc.z);
      put(knob, LEG, knee);
    }
  }

  // ---- Wings: a glassy golden membrane with a net of dark veins.
  const membrane = (w: Wing) => {
    const N = 18;
    const us = Array.from({ length: N }, (_, j) => (0.99 * j) / (N - 1));
    const outline: THREE.Vector2[] = [];
    for (const u of us) outline.push(new THREE.Vector2(u * w.L, wingZc(w, u) + w.H * prof(u)));
    for (const u of [...us].reverse()) outline.push(new THREE.Vector2(u * w.L, wingZc(w, u) - w.H * prof(u)));
    const sg = new THREE.ShapeGeometry(new THREE.Shape(outline));
    const pos = sg.attributes.position;
    const idx = sg.index!;
    const at = (i: number) => {
      const px = pos.getX(i);
      return P(w.sgn * (w.x0 + px), wingY(w, px / w.L), pos.getY(i));
    };
    const out: number[] = [];
    for (let t = 0; t < idx.count; t += 3) {
      tri(out, at(idx.getX(t)), at(idx.getX(t + 1)), at(idx.getX(t + 2)));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
    g.computeVertexNormals();
    return g;
  };

  const veins = (w: Wing) => {
    const rows = 7;
    const cols = 12;
    const net = Array.from({ length: rows }, (_, k) =>
      Array.from({ length: cols }, (_, i) => ({
        u: 0.02 + (0.9 * i) / (cols - 1) + (rand() - 0.5) * 0.01,
        v:
          k === 0
            ? 0.97
            : k === rows - 1
              ? -0.97
              : 0.97 - (1.94 * k) / (rows - 1) + (rand() - 0.5) * 0.05,
      })),
    );
    const rowWidth = (k: number) => (k === 0 ? 0.00042 : k === rows - 1 ? 0.00026 : 0.00013);
    const out: number[] = [];
    // Veins sit just above and just below the membrane so they read from either side.
    for (const lift of [0.00022, -0.00022]) {
      const at = (k: number, i: number) => wingPt(w, net[k][i].u, net[k][i].v, lift);
      for (let k = 0; k < rows; k++) {
        for (let i = 0; i < cols - 1; i++) ribbon(out, at(k, i), at(k, i + 1), rowWidth(k));
      }
      for (let k = 0; k < rows - 1; k++) {
        for (let i = 0; i < cols; i++) ribbon(out, at(k, i), at(k + 1, i), 0.00011);
        for (let i = 0; i < cols - 1; i++) {
          if ((i + k) % 2 === 0) ribbon(out, at(k, i), at(k + 1, i + 1), 0.00011);
          else ribbon(out, at(k + 1, i), at(k, i + 1), 0.00011);
        }
      }
      // Dark pterostigma near the leading-edge tip.
      const q = (u: number, v: number) => wingPt(w, u, v, lift);
      quad(out, q(0.8, 0.8), q(0.845, 0.8), q(0.845, 0.955), q(0.8, 0.955));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
    g.computeVertexNormals();
    return g;
  };

  for (const key of ["fore", "hind"] as const) {
    for (const s of [1, -1]) {
      const spec = WING_SPEC[key];
      const w: Wing = { ...spec, sgn: s };
      const joint = b.joint(`${key}Wing${s > 0 ? "L" : "R"}`, {
        at: [s * spec.x0, spec.y0, spec.zc0],
        parent: thorax,
      });
      put(membrane(w), GLASS, joint);
      put(veins(w), VEIN, joint);
    }
  }

  // ---- Scenery: the pond the dragonfly hovers over (its surface is y = 0), with lily pads and reeds.
  const pond = new THREE.CylinderGeometry(0.19, 0.19, 0.003, 24);
  pond.translate(0, -0.0015, 0);
  put(pond, WATER, thorax);
  disc(P(0.07, 0.00075, -0.04), P(0, 1, 0), 0.024, 0.0015, PAD, thorax);
  disc(P(-0.085, 0.00075, 0.055), P(0, 1, 0), 0.02, 0.0015, PAD, thorax);
  disc(P(0.02, 0.00075, 0.11), P(0, 1, 0), 0.028, 0.0015, PAD, thorax);

  const reed = (x: number, z: number, top: number) => {
    tube(P(x, 0, z), P(x + 0.002, top, z - 0.001), 0.0014, 0.0008, REED, thorax, 5);
    tube(
      P(x + 0.002, top - 0.012, z - 0.001),
      P(x + 0.002, top, z - 0.001),
      0.0028,
      0.0028,
      CATTAIL,
      thorax,
      6,
    );
  };
  reed(0.11, -0.1, 0.085);
  reed(-0.13, 0.06, 0.07);

  return b.root;
}
