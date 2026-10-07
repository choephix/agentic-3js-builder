import * as THREE from "three";
import { createBuilder, bezier, catmull, limb, grain } from "../../../../src/index";

export const meta = {
  name: "stag beetle",
  description: "A stag beetle in a rest pose: glossy brown elytra, a dark pronotum, six jointed legs, clubbed antennae and long branched mandibles.",
};

const BODY = "#2b1a10";
const ELYTRA = grain("#6a3119", "#3d1a0b", { size: 0.004, axis: "z" });
const SEAM = "#170c06";
const LEG = "#24150c";
const MANDIBLE = "#6b3418";
const MANDIBLE_TIP = "#2a170c";
const EYE = "#0c0a09";
const ANT = "#3a2014";
const CLUB = "#6b3d1e";

// An ellipsoid (or a half of one) built in model space.
const blob = (
  cx: number,
  cy: number,
  cz: number,
  sx: number,
  sy: number,
  sz: number,
  phiStart = 0,
  phiLength = Math.PI * 2,
  seg: [number, number] = [12, 8],
) =>
  new THREE.SphereGeometry(1, seg[0], seg[1], phiStart, phiLength)
    .scale(sx, sy, sz)
    .translate(cx, cy, cz);

export default function build() {
  const b = createBuilder({ name: "stag-beetle" });

  // Skeleton
  const body = b.joint("body", { at: [0, 0.014, 0], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 0.0145, 0.036], dir: [0, 0, 1], role: "head" });

  // Elytra: two half-ellipsoids meeting on the midline
  const elytra = [
    b.part(blob(0, 0.014, -0.004, 0.011, 0.0085, 0.02, Math.PI, Math.PI, [14, 10]), ELYTRA, {
      bone: body,
      at: [0, 0, 0],
    }),
    b.part(blob(0, 0.014, -0.004, 0.011, 0.0085, 0.02, 0, Math.PI, [14, 10]), ELYTRA, {
      bone: body,
      at: [0, 0, 0],
    }),
  ];

  // Dark seam along the top of the elytra, seated on the built surface
  const top = b.surface(elytra);
  const seamPts = [-0.022, -0.011, 0, 0.008, 0.015].map((z) => top.nearest([0, 0.03, z]).at);
  b.sweep(catmull(seamPts), 0.0006, { bone: body, color: SEAM });

  // Pronotum (the shield behind the head)
  b.part(blob(0, 0.0155, 0.0205, 0.0095, 0.0085, 0.0095), BODY, { bone: body, at: [0, 0, 0] });

  // Head
  b.part(blob(0, 0.0145, 0.036, 0.0075, 0.0065, 0.0075), BODY, { bone: head, at: [0, 0, 0] });

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // Compound eye on each side of the head
    const eyeAt = s > 0
      ? head.local({ left: 0.0068, up: 0.0015, forward: 0.0005 })
      : head.local({ right: 0.0068, up: 0.0015, forward: 0.0005 });
    b.part(new THREE.SphereGeometry(0.003, 8, 6), EYE, { bone: head, at: eyeAt });

    // Antenna: a thin stalk ending in a flattened club
    const antPath = catmull([
      [s * 0.0035, 0.0165, 0.0455],
      [s * 0.0075, 0.0195, 0.0525],
      [s * 0.0115, 0.0218, 0.0595],
      [s * 0.0125, 0.0235, 0.0635],
    ]);
    b.sweep(antPath, (t: number) => 0.0005 + 0.0006 * t, { bone: head, color: ANT });
    b.part(blob(s * 0.0128, 0.0237, 0.0645, 0.0016, 0.0014, 0.0032, 0, Math.PI * 2, [8, 6]), CLUB, {
      bone: head,
      at: [0, 0, 0],
    });

    // Mandible on a jaw joint at the front of the head
    const jaw = b.joint(`jaw${sd}`, {
      parent: head,
      at: [s * 0.0045, 0.0135, 0.0435],
      dir: [0, 0, 1],
      role: "jaw",
    });
    const mand = b.sweep(
      bezier(
        [s * 0.0045, 0.0135, 0.0435],
        [s * 0.0105, 0.0135, 0.052],
        [s * 0.0105, 0.013, 0.064],
        [s * 0.0025, 0.0125, 0.0705],
      ),
      [0.0019, 0.0016, 0.0011, 0.0005],
      { bone: jaw, color: MANDIBLE },
    );

    // Inner teeth on the mandible
    const toothMid = mand.at(0.45, 0);
    b.spike(toothMid, [-s * 0.6, 0.8, 0.1], 0.0035, 0.0009, { color: MANDIBLE_TIP });
    const toothBase = mand.at(0.2, 0);
    b.spike(toothBase, [-s * 0.5, 0.85, 0.0], 0.0025, 0.0007, { color: MANDIBLE_TIP });
  }

  // Six legs: three pairs along the sides of the thorax
  const zh = [0.0175, 0.0, -0.0155];
  const dz = [0.009, 0.0, -0.009];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    for (let p = 0; p < 3; p++) {
      const hip = [s * 0.0085, 0.0105, zh[p]];
      const foot = [s * 0.036, 0.0008, zh[p] + dz[p]];
      const pts = limb(hip, foot, [0.013, 0.013, 0.01], [
        [s * 0.6, 1, 0],
        [s * 0.6, 1, 0],
      ]);
      const leg = b.chain(`leg${sd}${p}`, pts, {
        parent: body,
        role: "leg",
        names: [`hip${sd}${p}`, `knee${sd}${p}`, `ankle${sd}${p}`, `foot${sd}${p}`],
      });
      b.sweep(leg, (t: number) => 0.0016 - 0.0008 * t, { color: LEG });
    }
  }

  return b.root;
}
