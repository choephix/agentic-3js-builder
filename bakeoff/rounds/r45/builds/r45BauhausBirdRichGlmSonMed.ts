import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";

export const meta = {
  "name": "Bauhaus Songbird on a Branch",
  "description": "A stylized songbird assembled from pure circles, half-circles, triangles and bars in hard red, yellow, blue, black and cream, perched on a felled branch resting on the floor."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  blue: "#1f4fa3",
  blueDark: "#15336b",
  red: "#d9382a",
  yellow: "#f2b31c",
  black: "#1d1a17",
  cream: "#f4ead6",
  white: "#ffffff",
  wood: "#8a5a33",
  woodDark: "#5f3c20",
  woodCut: "#d9b98a",
  barkLine: "#3a2412",
};
const M = {
  perchTop: [0, 0.175, 0.05] as [number, number, number],
  neckBase: [0, 0.56, 0.12] as [number, number, number],
  tailRoot: [0, 0.45, -0.1] as [number, number, number],
  wingShoulderL: [0.13, 0.53, 0.08] as [number, number, number],
  wingShoulderR: [-0.13, 0.53, 0.08] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // branch
  (() => {
function buildBranch({ b, J, P }: any) {
  const bone = J.root;
  const R = rng(11);
  const Y = 0.09;
  const WOOD = P.wood, DARK = P.woodDark, CUT = P.woodCut, BLK = P.black;

  // Main log: tapered cylinder along Z (rear z=-0.95 r=0.095, front z=0.88 r=0.075)
  const zr = -0.95, zf = 0.88, len = zf - zr;
  const log = new THREE.CylinderGeometry(0.075, 0.095, len, 10, 1, true);
  b.part(log, WOOD, { bone, at: [0, Y, (zr + zf) / 2], dir: [0, 0, 1], axis: "y", flat: true });
  // Front cut face
  const cap = (r: number, z: number, c: string, h = 0.004) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 12), c, { bone, at: [0, Y, z], dir: [0, 0, 1], axis: "y" });
  cap(0.075, zf, CUT, 0.006);
  cap(0.05, zf + 0.003, DARK, 0.005);
  cap(0.03, zf + 0.006, CUT, 0.005);
  cap(0.008, zf + 0.009, BLK, 0.005);
  // Bark ring lines near the front
  b.part(new THREE.TorusGeometry(0.076, 0.004, 4, 12), P.barkLine, { bone, at: [0, Y, zf - 0.01], dir: [0, 0, 1], axis: "z" });
  // Rear broken stub
  b.part(new THREE.CylinderGeometry(0.06, 0.095, 0.1, 8), DARK, { bone, at: [0, Y, zr - 0.04], dir: [0, 0, 1], axis: "y", flat: true });
  cap(0.06, zr - 0.092, DARK, 0.006);
  b.part(new THREE.ConeGeometry(0.02, 0.06, 5), WOOD, { bone, at: [0.02, Y + 0.03, zr - 0.1], dir: [0, 0.4, -1], axis: "y", flat: true });
  b.part(new THREE.ConeGeometry(0.015, 0.05, 5), CUT, { bone, at: [-0.025, Y - 0.01, zr - 0.1], dir: [0, -0.2, -1], axis: "y", flat: true });

  // Bark lines along the log
  for (const [x, y, z, l] of [[0.07, 0.12, -0.5, 0.25], [-0.07, 0.12, 0.2, 0.3], [0.06, 0.04, 0.5, 0.2], [-0.08, 0.07, -0.3, 0.22]] as number[][]) {
    b.part(new THREE.BoxGeometry(0.006, 0.006, l), P.barkLine, { bone, at: [x, y, z] });
  }

  // Knuckles
  for (const z of [-0.6, 0.4]) {
    b.part(new THREE.SphereGeometry(0.05, 8, 6), DARK, { bone, at: [0.03, Y + 0.03, z], scale: [1, 0.8, 1.1], flat: true });
  }
  // Lichen dots on the upper surface
  const lz = [-0.8, -0.45, -0.15, 0.25, 0.55, 0.7];
  lz.forEach((z, i) => {
    const r = 0.015 + R() * 0.01;
    const x = (R() - 0.5) * 0.05;
    const top = Y + 0.085 - (z + 0.95) * 0.011;
    b.part(new THREE.SphereGeometry(r, 6, 4), P.cream, { bone, at: [x, top, z], scale: [1, 0.4, 1] });
  });

  // Side twig
  const t0: [number, number, number] = [0.1, 0.11, -0.35];
  const t1: [number, number, number] = [0.22, 0.46, -0.3];
  const t2: [number, number, number] = [0.3, 0.4, -0.2];
  b.rod(t0, t1, [0.036, 0.022], DARK, { bone, sides: 6 });
  b.rod([0.17, 0.3, -0.32], t2, [0.02, 0.012], DARK, { bone, sides: 6 });
  b.part(new THREE.SphereGeometry(0.04, 7, 5), DARK, { bone, at: [0.13, 0.15, -0.35], flat: true });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), DARK, { bone, at: t1, flat: true });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), DARK, { bone, at: t2, flat: true });

  // Buds
  for (const [x, y, z] of [[0.13, 0.2, -0.345], [0.17, 0.32, -0.32], [0.2, 0.41, -0.3], [0.26, 0.36, -0.26], [0.285, 0.395, -0.215]]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), P.yellow, { bone, at: [x, y, z] });
  }

  // Leaves (flat extrudes facing sideways-ish)
  const leaf = (outline: any[], at: number[], x: number[], y: number[], col: string) =>
    b.extrude(outline, { at, x, y, thickness: 0.012, color: col, bone });
  // blue circle leaf
  const circ: any[] = [];
  for (let i = 0; i < 14; i++) circ.push([0.07 * Math.cos((i / 14) * 6.2832), 0.07 * Math.sin((i / 14) * 6.2832)]);
  leaf(circ, [0.2, 0.52, -0.3], [1, 0, 0.1], [0, 1, 0.3], P.blue);
  // yellow half-disc, flat edge toward twig
  const half: any[] = [[-0.08, 0, "sharp"], [0.08, 0, "sharp"]];
  for (let i = 1; i < 8; i++) half.push([0.08 * Math.cos((i / 8) * Math.PI), 0.08 * Math.sin((i / 8) * Math.PI)]);
  half.sort((a, c) => 0);
  const halfPts: any[] = [[0.08, 0, "sharp"]];
  for (let i = 1; i < 8; i++) halfPts.push([0.08 * Math.cos((i / 8) * Math.PI), 0.08 * Math.sin((i / 8) * Math.PI)]);
  halfPts.push([-0.08, 0, "sharp"]);
  leaf(halfPts, [0.31, 0.405, -0.2], [0.3, 0.2, 1], [1, 0.6, 0], P.yellow);
  // red triangle leaf
  leaf([[-0.05, 0, "sharp"], [0.05, 0, "sharp"], [0, 0.12, "sharp"]], [0.21, 0.46, -0.31], [0.9, 0, -0.4], [-0.25, 1, 0], P.red);
  // leaf stems
  b.rod([0.22, 0.46, -0.3], [0.2, 0.5, -0.3], 0.006, DARK, { bone });
  b.rod(t2, [0.31, 0.405, -0.2], 0.006, DARK, { bone });
}
    return buildBranch;
  })(),
  // torso
  (() => {
function buildTorso({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const ARCH = "#15336b";

  // Egg body: tilt so chest is low/front, rump high/back.
  const C: [number, number, number] = [0, 0.42, 0.04];
  const tilt = -0.42; // rotate about X: pitches +Z end downward
  const eggGeo = new THREE.SphereGeometry(1, 16, 12);
  const egg = b.part(eggGeo, P.blue, {
    bone,
    at: C,
    rotation: [tilt * 57.2958, 0, 0],
    scale: [0.14, 0.185, 0.17],
    name: "torsoEgg",
  });
  // Egg local axes: long axis is local Z (0.17), tall Y (0.185).
  const tiltQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, 0));
  const eggPt = (x: number, y: number, z: number) =>
    new THREE.Vector3(x, y, z).applyQuaternion(tiltQ).add(new THREE.Vector3(...C));
  void egg;

  // Cream belly bulge
  b.part(new THREE.SphereGeometry(0.115, 14, 10), P.cream, {
    bone,
    at: [0, 0.335, 0.075],
    scale: [0.98, 0.9, 1],
    name: "torsoBelly",
  });
  // Belly outline ring (thin black torus) at belly/chest seam
  b.part(new THREE.TorusGeometry(0.108, 0.005, 5, 20), P.black, {
    bone,
    at: [0, 0.37, 0.075],
    rotation: [90, 0, 0],
    scale: [1, 1, 1],
    name: "torsoBellySeam",
  });

  // Red half-disc breast plate: semicircle arc on top, flat edge down
  const bibPts: [number, number][] = [];
  const BR = 0.1;
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI;
    bibPts.push([BR * Math.cos(a), BR * Math.sin(a)]);
  }
  const bibAt: [number, number, number] = [0, 0.385, 0.178];
  b.extrude(bibPts, {
    at: bibAt,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.035,
    color: P.red,
    bone,
    name: "torsoBib",
  });
  // Black outline: slightly larger half-disc behind the red
  const ol: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI;
    ol.push([(BR + 0.008) * Math.cos(a), (BR + 0.008) * Math.sin(a) + 0.0]);
  }
  b.extrude(ol, {
    at: [0, 0.382, 0.168],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    color: P.black,
    bone,
    name: "torsoBibOutline",
  });
  // Yellow small bar and dots on the bib as Bauhaus accents
  b.part(new THREE.BoxGeometry(0.11, 0.008, 0.006), P.yellow, {
    bone,
    at: [0, 0.428, 0.198],
    name: "torsoBibBar",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), P.cream, {
      bone,
      at: [s * 0.04, 0.405, 0.199],
      name: "torsoBibDot",
    });
  }

  // Rump black band: torus ringed around the rear of the egg
  b.part(new THREE.TorusGeometry(0.1, 0.012, 6, 20), P.black, {
    bone,
    at: [0, 0.46, -0.085],
    rotation: [-20, 0, 0],
    scale: [1, 1.05, 1],
    name: "torsoRump",
  });

  // Shoulder dome caps seating the wings
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), P.blue, {
      bone,
      at: [s * 0.125, 0.52, 0.08],
      dir: [s, 0.5, 0],
      scale: [1, 0.9, 1.1],
      name: "torsoShoulder",
    });
    b.part(new THREE.TorusGeometry(0.05, 0.004, 5, 14), P.black, {
      bone,
      at: [s * 0.125, 0.52, 0.08],
      dir: [s, 0.5, 0],
      axis: "z",
      name: "torsoShoulderRing",
    });
  }

  // Back seam dots along the spine of the egg
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const a = -0.9 + t * 1.5; // angle along the top, from rump to neck
    const p = eggPt(0, 0.185 * Math.cos(a) * 1.0 + 0.004, 0.17 * Math.sin(-a) * 0.98);
    const n = new THREE.Vector3(0, Math.cos(a), -Math.sin(a)).applyQuaternion(tiltQ);
    b.part(new THREE.SphereGeometry(0.008, 6, 4), P.black, {
      bone,
      at: p,
      scale: [1, 1, 1],
      name: "torsoSeam",
    });
    void n;
  }

  // Side flank cream-edge lines (thin black ring around the egg waist)
  b.part(new THREE.TorusGeometry(0.14, 0.004, 4, 24), P.black, {
    bone,
    at: [0, 0.44, 0.02],
    rotation: [90 + tilt * 57.2958 * 0, 0, 0],
    scale: [1, 1.2, 1],
    name: "torsoWaist",
  });

  // Little blue-dark chest shading wedge at collar where head meets
  b.part(new THREE.ConeGeometry(0.04, 0.05, 3), ARCH, {
    bone,
    at: [0, 0.56, 0.1],
    dir: [0, 0, 1],
    name: "torsoCollar",
  });
  void R;
  void frame;
  void M;
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const C: [number, number, number] = [0, 0.66, 0.17];
  const R = 0.095;

  // Skull
  b.part(new THREE.SphereGeometry(1, 16, 12), P.black, {
    bone: head,
    at: C,
    scale: [R, R * 0.97, R * 1.03],
    rotation: [8, 0, 0],
    name: "skull",
  });

  // Neck collar bridging into torso
  b.part(new THREE.SphereGeometry(1, 12, 8), P.black, {
    bone: J.neck,
    at: [0, 0.58, 0.13],
    scale: [0.075, 0.06, 0.075],
    name: "neckBlock",
  });

  for (const s of [1, -1]) {
    // Cream cheek disc, facing outward
    const cheek = b.extrude(
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return [Math.cos(a) * 0.055, Math.sin(a) * 0.055] as [number, number];
      }),
      {
        at: [s * 0.083, 0.628, 0.15],
        x: [0, 0, s],
        y: [0, 1, 0],
        thickness: 0.015,
        color: P.cream,
        bone: head,
        name: "cheek",
      },
    );
    // thin black outline ring behind cheek
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.008, 14), P.black, {
      bone: head,
      at: [s * 0.078, 0.628, 0.15],
      dir: [s, 0, 0],
      name: "cheekRim",
    });

    // Eye: white sphere + black pupil
    const ex = s * 0.078, ey = 0.682, ez = 0.205;
    b.part(new THREE.SphereGeometry(0.03, 10, 8), P.white, {
      bone: head, at: [ex, ey, ez], name: "eyeWhite",
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), P.black, {
      bone: head, at: [s * 0.088, ey, ez + 0.019], name: "pupil",
    });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), P.white, {
      bone: head, at: [s * 0.09, ey + 0.007, ez + 0.032], name: "glint",
    });
    // black eye ring
    b.part(new THREE.TorusGeometry(0.03, 0.004, 5, 14), P.black, {
      bone: head, at: [ex + s * 0.004, ey, ez], dir: [s, 0, 0.3], axis: "z", name: "eyeRing",
    });

    // Yellow brow wedges
    for (let k = 0; k < 2; k++) {
      b.extrude(
        [[0, 0], [0.032, 0.0], [0.0, 0.011, "sharp"]],
        {
          at: [s * (0.074 + k * 0.004), 0.716 + k * 0.01, 0.18 + k * 0.02],
          x: [0, 0, 1],
          y: [s * 0.4, 1, 0],
          thickness: 0.007,
          color: P.yellow,
          bone: head,
          name: "brow",
        },
      );
    }
  }

  // Upper beak
  const bs: [number, number, number] = [0, 0.642, 0.245];
  const tip: [number, number, number] = [0, 0.628, 0.34];
  b.spike(bs, tip, null, 0.032, { color: P.yellow, bone: head, sides: 6, name: "beakUpper" });

  // Lower mandible on jaw
  b.spike([0, 0.622, 0.248], [0, 0.616, 0.322], null, 0.023, {
    color: P.yellow, bone: jaw, sides: 6, name: "beakLower",
  });

  // Mouth seam
  b.rod([0, 0.632, 0.245], [0, 0.624, 0.325], 0.004, P.black, { bone: head, name: "seam" });

  // Nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.005, 5, 4), P.black, {
      bone: head, at: [s * 0.014, 0.652, 0.272], name: "nostril",
    });

  // Beak base band
  b.part(new THREE.TorusGeometry(0.03, 0.004, 5, 12), P.black, {
    bone: head, at: [0, 0.642, 0.248], dir: [0, -0.15, 1], axis: "z", name: "beakBase",
  });

  // Crest wedge
  b.extrude(
    [[0, 0], [0.05, 0], [0.0, 0.055, "sharp"]],
    {
      at: [0, 0.742, 0.17],
      x: [0, 0.0, -1],
      y: [0, 1, 0],
      thickness: 0.016,
      color: P.blue,
      bone: head,
      name: "crest",
    },
  );
  b.extrude(
    [[0, 0], [0.035, 0], [0.0, 0.04, "sharp"]],
    {
      at: [0, 0.745, 0.19],
      x: [0, 0.0, -1],
      y: [0, 1, 0],
      thickness: 0.016,
      color: P.red,
      bone: head,
      name: "crestRed",
    },
  );
}
    return buildHead;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const r = rng(11);

  // Teardrop outline in (u along wing from shoulder toward tip, v across).
  // u runs 0..0.44 (shoulder to tip), v is height of the slab across its width.
  const LEAF: [number, number, ("sharp" | undefined)?][] = [
    [0.0, 0.0],
    [0.05, 0.07],
    [0.2, 0.085],
    [0.34, 0.05],
    [0.46, 0.0, "sharp"],
    [0.32, -0.05],
    [0.16, -0.07],
    [0.05, -0.05],
  ];
  const outline = LEAF.map((p) => (p[2] ? [p[0], p[1], "sharp"] : [p[0], p[1]])) as any;

  for (const s of [1, -1]) {
    const sh = new THREE.Vector3(s * 0.125, 0.53, 0.08);
    const tip = new THREE.Vector3(s * 0.145, 0.34, -0.3);
    const dir = tip.clone().sub(sh);
    const len = dir.length();
    const d = dir.clone().normalize();
    // Wing plane: u along d, v in the flank plane perpendicular to d and to X-ish thickness axis.
    const thick = new THREE.Vector3(s, 0, 0);
    const vAxis = new THREE.Vector3().crossVectors(thick, d).normalize(); // x-direction for extrude uses d
    const k = len / 0.46;

    // Extrude: x along d, y = vAxis ; thickness along x × y.
    const X = d.toArray() as [number, number, number];
    const Y = vAxis.toArray() as [number, number, number];
    const out = new THREE.Vector3().crossVectors(d, vAxis); // thickness direction
    if (out.x * s < 0) out.negate();

    const scaled = outline.map((p: any) => (p[2] ? [p[0] * k, p[1] * k, "sharp"] : [p[0] * k, p[1] * k]));
    const wing = b.extrude(scaled, {
      at: sh, x: X, y: Y, thickness: 0.035, smoothing: 2, bevel: 0.004, color: P.black, bone,
    });

    // point on the wing's outer face
    const onFace = (u: number, v: number, lift: number) => {
      const p = sh.clone().addScaledVector(d, u * k).addScaledVector(vAxis, v * k);
      return p.addScaledVector(out, (out.x * s > 0 ? 1 : 1) * (0.0175 + lift));
    };
    const faceDir = out.clone();
    const faceOut = faceDir.dot(new THREE.Vector3(s, 0, 0)) >= 0 ? faceDir : faceDir.negate();

    // Stripe bars crossing the wing (across v) near trailing edge.
    const bar = (u: number, w: number, hv: number, col: string) => {
      const half = hv * k;
      const pts: [number, number][] = [
        [u, -half], [u + w, -half * 0.96], [u + w, half * 0.96], [u, half],
      ];
      const sc = pts.map((p) => [p[0] * k, p[1]] as [number, number]);
      const bb = b.extrude(sc, {
        at: sh.clone().addScaledVector(faceOut, 0.0175), x: X, y: Y, thickness: 0.008, color: col, bone,
      });
      return bb;
    };
    // bars: widths of wing taper, so size half heights by position
    bar(0.27, 0.035, 0.06, P.cream);
    bar(0.345, 0.03, 0.04, P.yellow);

    // Leading edge line (blueDark rod) from shoulder to wrist along the top edge.
    const a = sh.clone().addScaledVector(vAxis, 0.07 * k).addScaledVector(faceOut, 0.016).addScaledVector(d, 0.03);
    const e = sh.clone().addScaledVector(d, 0.32 * k).addScaledVector(vAxis, 0.05 * k).addScaledVector(faceOut, 0.016);
    b.rod(a, e, 0.004, P.blueDark, { bone });

    // Three stepped primaries poking past the tip.
    for (let i = 0; i < 3; i++) {
      const base = tip.clone()
        .addScaledVector(d, -0.04 + i * 0.0)
        .addScaledVector(vAxis, (i - 1) * 0.02)
        .addScaledVector(d, -0.0 - i * 0.02 * -1);
      const L = 0.09;
      const prim = [
        [0, -0.011], [L * 0.8, -0.011], [L, 0], [L * 0.8, 0.011], [0, 0.011],
      ] as [number, number][];
      b.extrude(prim.map((p) => [p[0], p[1]]) as any, {
        at: base.addScaledVector(faceOut, -0.002 * i), x: X, y: Y, thickness: 0.015, color: P.blueDark, bone,
      });
    }

    // Shoulder cap rivet and wrist dot for detail.
    b.part(new THREE.SphereGeometry(0.012, 6, 4), P.yellow, {
      bone, at: sh.clone().addScaledVector(d, 0.04 * k).addScaledVector(faceOut, 0.02),
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), P.cream, {
      bone, at: sh.clone().addScaledVector(d, 0.3 * k).addScaledVector(vAxis, 0.045 * k).addScaledVector(faceOut, 0.02),
    });
  }
  void frame; void r; void M;
}
    return buildWings;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const root = new THREE.Vector3(...M.tailRoot);
  const tail = J.tail;
  const r = rng(11);

  // Fan of 5 feathers. Each feather is drawn in a local plane: x across, y along its length.
  // Direction in the YZ plane: pitch down-back; yaw spreads sideways.
  const spread = [-16, -8, 0, 8, 16];
  const lens = [0.36, 0.43, 0.48, 0.43, 0.36];
  const pitch = 22; // degrees below horizontal pointing back

  spread.forEach((yawDeg, i) => {
    const L = lens[i];
    const yaw = (yawDeg * Math.PI) / 180;
    const pt = (pitch * Math.PI) / 180;
    // direction of feather length (pointing back and down, spread in X)
    const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pt), -Math.sin(pt), -Math.cos(yaw) * Math.cos(pt)).normalize();
    // width axis: horizontal, perpendicular to dir
    const wide = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
    const w = 0.04;
    const outline: [number, number, "sharp"?][] = [
      [-w * 0.6, 0],
      [w * 0.6, 0],
      [w, L * 0.55],
      [w * 0.55, L * 0.92],
      [0, L, "sharp"],
      [-w * 0.55, L * 0.92],
      [-w, L * 0.55],
    ];
    const start = root.clone().add(new THREE.Vector3(0, 0, 0.0));
    const lift = new THREE.Vector3().crossVectors(dir, wide).normalize(); // face normal
    const up = lift.y < 0 ? lift.clone().negate() : lift.clone();
    const mk = (pts: [number, number, "sharp"?][], color: string, th: number, off: number, lat = 0) =>
      b.extrude(pts as any, {
        at: start.clone().addScaledVector(up, off + (i % 2 ? 0.001 : 0)).addScaledVector(wide, lat),
        x: wide,
        y: dir,
        thickness: th,
        color,
        bone: tail,
      });
    mk(outline, P.blue, 0.016, 0);

    // black base band across the base third
    const b0 = L * 0.06, b1 = L * 0.3;
    const hw = (y: number) => (y < L * 0.55 ? w * 0.6 + (w * 0.4 * y) / (L * 0.55) : w);
    mk(
      [[-hw(b0) - 0.001, b0], [hw(b0) + 0.001, b0], [hw(b1) + 0.001, b1], [-hw(b1) - 0.001, b1]],
      P.black, 0.02, 0,
    );

    // tip band
    const outer = Math.abs(yawDeg) === 16;
    const t0 = L * 0.84, t1 = L * 0.965;
    const tw0 = w * 0.8, tw1 = w * 0.3;
    mk(
      [[-tw0, t0], [tw0, t0], [tw1, t1], [-tw1, t1]],
      outer ? P.cream : P.yellow, 0.02, 0,
    );
  });

  // rump coverts: black wedge capping the root
  b.extrude(
    [[-0.09, 0], [0.09, 0], [0.05, -0.07], [-0.05, -0.07]] as any,
    {
      at: [0, root.y + 0.005, root.z + 0.0],
      x: [1, 0, 0],
      y: [0, 0.2, -1],
      thickness: 0.03,
      color: P.black,
      bone: tail,
    },
  );
  b.part(new THREE.ConeGeometry(0.06, 0.12, 4), P.black, {
    at: [0, root.y + 0.01, root.z - 0.05],
    dir: [0, -0.2, -1],
    bone: tail,
  });

  // tiny cream pin at the fan hinge
  b.part(new THREE.SphereGeometry(0.014, 6, 4), P.cream, {
    at: [0, root.y + 0.03, root.z - 0.02],
    bone: tail,
  });
}
    return buildTail;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const BLACK = P.black;
  const YELLOW = P.yellow;
  const CREAM = P.cream;
  const perch = M.perchTop;
  const footY = perch[1] + 0.01; // toe-base height, resting on branch top
  const r = rng(11);

  for (const s of [1, -1]) {
    const bone = s > 0 ? J.legL : J.legR;
    const x = s * 0.05;
    const top: [number, number, number] = [x, 0.31, 0.05];
    const ankle: [number, number, number] = [x, footY, perch[2]];

    // Leg shaft
    b.rod(top, ankle, 0.012, BLACK, { bone, sides: 8 });
    // Thigh knuckle where leg leaves the belly
    b.part(new THREE.SphereGeometry(0.02, 8, 6), BLACK, { bone: J.body, at: [x, 0.295, 0.05] });

    // Anklet ring
    b.part(new THREE.TorusGeometry(0.014, 0.004, 6, 10), YELLOW, {
      bone,
      at: [x, footY + 0.025, perch[2]],
      dir: [0, 1, 0],
      axis: "z",
    });

    // Ankle knuckle
    b.part(new THREE.SphereGeometry(0.014, 8, 6), BLACK, { bone, at: ankle });

    // Three forward toes wrapping the branch: bend over the top then curl down the front
    for (const ang of [-35, 0, 35]) {
      const a = (ang * Math.PI) / 180;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const p0: [number, number, number] = ankle;
      const p1: [number, number, number] = [x + dx * 0.03, footY - 0.003, perch[2] + dz * 0.03];
      const p2: [number, number, number] = [x + dx * 0.052, footY - 0.03, perch[2] + dz * 0.048];
      const p3: [number, number, number] = [x + dx * 0.055, 0.105, perch[2] + dz * 0.052];
      b.rod(p0, p1, 0.008, BLACK, { bone, sides: 6 });
      b.rod(p1, p2, 0.008, BLACK, { bone, sides: 6 });
      b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone, at: p1 });
      b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone, at: p2 });
      b.rod(p2, p3, 0.007, BLACK, { bone, sides: 6 });
      // claw tip
      b.spike(p3, [dx * 0.2, -1, dz * 0.2], 0.014, 0.005, { bone, color: CREAM, sides: 6 });
    }

    // Rear toe curling back around the underside
    const q0: [number, number, number] = ankle;
    const q1: [number, number, number] = [x, footY - 0.004, perch[2] - 0.03];
    const q2: [number, number, number] = [x, footY - 0.03, perch[2] - 0.048];
    const q3: [number, number, number] = [x, 0.105, perch[2] - 0.05];
    b.rod(q0, q1, 0.008, BLACK, { bone, sides: 6 });
    b.rod(q1, q2, 0.008, BLACK, { bone, sides: 6 });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone, at: q1 });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone, at: q2 });
    b.rod(q2, q3, 0.007, BLACK, { bone, sides: 6 });
    b.spike(q3, [0, -1, -0.2], 0.014, 0.005, { bone, color: CREAM, sides: 6 });

    // Small scale bands on the shaft for Bauhaus rhythm
    for (const y of [0.27, 0.235]) {
      b.part(new THREE.CylinderGeometry(0.0135, 0.0135, 0.004, 8), YELLOW, {
        bone,
        at: [x, y + r() * 0.0, 0.05],
      });
    }
  }
}
    return buildLegs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bauhausSongbird" });
  const J: Record<string, Joint> = {};
  J["root"] = b.joint("root", { at: [0,0.09,0], dir: [0,0,1], role: "spine" });
  J["body"] = b.joint("body", { parent: J["root"], at: [0,0.4,0.03], dir: [0,0.55,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["body"], at: [0,0.56,0.12], dir: [0,0.65,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.64,0.17], dir: [0,0.45,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.63,0.24], dir: [0,-0.2,1], role: "jaw" });
  J["tail"] = b.joint("tail", { parent: J["body"], at: [0,0.45,-0.1], dir: [0,-0.35,-1], role: "tail" });
  J["legL"] = b.joint("legL", { parent: J["body"], at: [0.05,0.3,0.05], dir: [0,-1,0.08], role: "leg" });
  J["legR"] = b.joint("legR", { parent: J["body"], at: [-0.05,0.3,0.05], dir: [0,-1,0.08], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
