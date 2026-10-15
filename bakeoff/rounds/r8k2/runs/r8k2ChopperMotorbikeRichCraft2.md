1. **Powertrain:** In `cylAssy` I widened the fins from 0.09 to 0.105 and the bore from 0.062 to 0.075, and widened the head boxes to 0.23 and 0.20 across x; their positions are unchanged, so they don't rise into the tank. The air cleaner is now radius 0.095/0.10 at y 0.63, pushed slightly outboard, with the `AIR` disc shrunk to 0.09.
2. **Seat:** The small box is replaced by a tapered 0.24 × 0.025 × 0.32 m pan, extruded in the xz plane and wider at the front. Two mounts at x ±0.07 run from the backbone at y 0.665 to the pan at y 0.735, tied together by a crossmember on the backbone.
3. **Sissy-bar pad:** A chrome crossbar at y 1.14, z −1.05 spans the rail intersections at x ±0.2. A navy backing plate sits between the bar and the cushion and overlaps the cushion by about 9 mm.
4. **Belt:** The belt is now built explicitly from matching inner and outer yz contours, with 6 mm radial thickness and 35 mm axial width, so the width stays along x on every run and arc. The flanges moved to the new outer edge at x 0.2375. A bevelled navy guard sits over the forward upper run on two brackets from the engine case.
5. **Exhaust:** The rear of `pipe2` shifts from x −0.30 to −0.34 after z −0.30. Four hangers at z −0.55 and −0.85 run from both pipes to the lower cradle rail.
6. **Headlight:** The cylinder housing is replaced by a tapered, bevelled navy lathe shell about 0.21 wide and 0.13 deep, narrowing toward the mounting arms. The orange ring grows to 0.108, two orange side cheeks join the brow to the shell, and a single white brow inset is added. The lens is untouched.
7. **Finish:** The tank art is now one large navy-edged cream flame, one small cyan accent and the emblem. The chrome tank loops moved to the narrow ends at z 0.40 and −0.15. Both sprockets use a dark gunmetal paint with bright tooth tips and hub, and the flanges are orange.

<<<<<<< SEARCH
import { catmull, createBuilder, gradient, mix, offset, paint, polyline, smoothstep, svg } from "agentic-3js-builder";
=======
import { catmull, createBuilder, gradient, mix, offset, paint, smoothstep, svg } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
const TONGUES: [number, number, number, number, number][] = [
  [56, 28, 132, 17, -8],
  [52, 63, 122, 16, 8],
];
=======
const TONGUES: [number, number, number, number, number][] = [[56, 45, 134, 26, -12]];
>>>>>>> REPLACE

<<<<<<< SEARCH
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x, y, l, w, c)}" fill="#ffd25a"/>`).join("")}
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x + 8, y, l * 0.68, w * 0.52, c * 0.6)}" fill="#fff7dc"/>`).join("")}
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x + 16, y, l * 0.36, w * 0.2, c * 0.3)}" fill="${CYAN}"/>`).join("")}
=======
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x, y, l, w, c)}" fill="#fff1c8"/>`).join("")}
      ${TONGUES.map(([x, y, l, w, c]) => `<path d="${flame(x + 14, y, l * 0.42, w * 0.16, c * 0.3)}" fill="${CYAN}"/>`).join("")}
>>>>>>> REPLACE

<<<<<<< SEARCH
    R(chassis, offset(base, dir, 0), offset(base, dir, 0.22), 0.062, GUN, 10);
    for (let i = 0; i < 7; i++) R(chassis, offset(base, dir, 0.03 + i * 0.027), offset(base, dir, 0.045 + i * 0.027), 0.09, FIN, 10);
    G(box(0.2, 0.09, 0.15), GUN, chassis, offset(base, dir, 0.25), { dir });
    G(box(0.175, 0.035, 0.12), ORANGE_P, chassis, offset(base, dir, 0.3), { dir });
=======
    R(chassis, offset(base, dir, 0), offset(base, dir, 0.22), 0.075, GUN, 10);
    for (let i = 0; i < 7; i++) R(chassis, offset(base, dir, 0.03 + i * 0.027), offset(base, dir, 0.045 + i * 0.027), 0.105, FIN, 10);
    G(box(0.23, 0.09, 0.15), GUN, chassis, offset(base, dir, 0.25), { dir });
    G(box(0.2, 0.035, 0.12), ORANGE_P, chassis, offset(base, dir, 0.3), { dir });
>>>>>>> REPLACE

<<<<<<< SEARCH
  R(chassis, V(0, 0.68, 0.06), V(0.1, 0.68, 0.06), 0.035, CHROME, 8);
  R(chassis, V(0.1, 0.68, 0.06), V(0.17, 0.68, 0.06), 0.125, ORANGE_P, 14);
  R(chassis, V(0.17, 0.68, 0.06), V(0.18, 0.68, 0.06), 0.13, CHROME, 14);
  G(new THREE.CircleGeometry(0.115, 16), "#ffffff", chassis, V(0.1805, 0.68, 0.06), { dir: [1, 0, 0], axis: "z", texture: AIR });
=======
  R(chassis, V(0, 0.63, 0.06), V(0.12, 0.63, 0.06), 0.03, CHROME, 8);
  R(chassis, V(0.12, 0.63, 0.06), V(0.17, 0.63, 0.06), 0.095, ORANGE_P, 14);
  R(chassis, V(0.17, 0.63, 0.06), V(0.18, 0.63, 0.06), 0.1, CHROME, 14);
  G(new THREE.CircleGeometry(0.09, 16), "#ffffff", chassis, V(0.1805, 0.63, 0.06), { dir: [1, 0, 0], axis: "z", texture: AIR });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(gearGeometry(SPR_SMALL), CHROME, { bone: chassis, at: SMALL_C, dir: [1, 0, 0] });
=======
  const sprocketPaint = (shape: { teeth: number; module: number }) => {
    const sz = gearSize(shape);
    return paint((_p, _n, s) => {
      const r = Math.hypot(s[0], s[1]);
      return r > sz.outer - 0.006 || r < sz.hub + 0.004 ? "#c9d3e6" : "#262d44";
    });
  };
  b.part(gearGeometry(SPR_SMALL), sprocketPaint(SPR_SMALL), { bone: chassis, at: SMALL_C, dir: [1, 0, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(gearGeometry(SPR_BIG), CHROME, { bone: wheelR, at: V(BX, AXLE_R.y, AXLE_R.z), dir: [1, 0, 0] });
=======
  b.part(gearGeometry(SPR_BIG), sprocketPaint(SPR_BIG), { bone: wheelR, at: V(BX, AXLE_R.y, AXLE_R.z), dir: [1, 0, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const BELT_T = 0.003;
=======
    const BELT_T = 0.006;
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(polyline(pts, { closed: true }), (_t: number): [number, number] => [0.013, BELT_T], {
      color: RUBBER,
      bone: chassis,
      section: "box",
    });
=======
    // explicit belt strip from matching outer/inner yz contours, constant 35 mm width along x
    const inner: [number, number, number][] = [];
    for (let k = 0; k <= n2; k++) inner.push(at(c2, rSmall - BELT_T, na - ((na - nb) * k) / n2));
    for (let k = 0; k <= n1; k++) inner.push(at(c1, rBig - BELT_T, nb - (sweepBig * k) / n1));
    const BW = 0.035;
    const bx0 = BX - BW / 2;
    const bx1 = BX + BW / 2;
    const bpos: number[] = [];
    const quad = (q: number[][], want: THREE.Vector3) => {
      const e1 = V(q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]);
      const e2 = V(q[2][0] - q[0][0], q[2][1] - q[0][1], q[2][2] - q[0][2]);
      const order = e1.cross(e2).dot(want) >= 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
      for (const i of order) bpos.push(q[i][0], q[i][1], q[i][2]);
    };
    const NP = pts.length;
    for (let i = 0; i < NP; i++) {
      const j = (i + 1) % NP;
      const o = (k: number, x: number) => [x, pts[k][1], pts[k][2]];
      const m = (k: number, x: number) => [x, inner[k][1], inner[k][2]];
      const out = V(0, pts[i][1] - inner[i][1], pts[i][2] - inner[i][2]);
      quad([o(i, bx0), o(i, bx1), o(j, bx1), o(j, bx0)], out);
      quad([m(i, bx0), m(i, bx1), m(j, bx1), m(j, bx0)], out.clone().negate());
      quad([o(i, bx1), o(j, bx1), m(j, bx1), m(i, bx1)], V(1, 0, 0));
      quad([o(i, bx0), o(j, bx0), m(j, bx0), m(i, bx0)], V(-1, 0, 0));
    }
    const beltGeo = new THREE.BufferGeometry();
    beltGeo.setAttribute("position", new THREE.Float32BufferAttribute(bpos, 3));
    beltGeo.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((bpos.length / 3) * 2).fill(0), 2));
    beltGeo.computeVertexNormals();
    b.part(beltGeo, "#2c2f3c", { bone: chassis, at: [0, 0, 0] });

    // bevelled navy guard over the forward upper run, on two brackets from the case
    const sA = at(c2, rSmall, na);
    const sB = at(c1, rBig, na);
    const run = V(0, sB[1] - sA[1], sB[2] - sA[2]).normalize();
    const nrm = V(0, Math.sin(na), Math.cos(na));
    const gp = (uu: number, vv: number, x: number) =>
      V(x, sA[1] + run.y * uu + nrm.y * vv, sA[2] + run.z * uu + nrm.z * vv);
    b.extrude(
      [
        [0.01, 0],
        [0.39, 0],
        [0.4, 0.008],
        [0.4, 0.014],
        [0.39, 0.022],
        [0.01, 0.022],
        [0, 0.014],
        [0, 0.008],
      ],
      { at: gp(0.02, 0.012, 0.22), x: run, y: nrm, thickness: 0.046, bevel: 0.004, color: NV, bone: chassis },
    );
    R(chassis, V(0.085, 0.47, -0.2), gp(0.1, 0.02, 0.2), 0.008, NV, 6);
    R(chassis, V(0.085, 0.46, -0.27), gp(0.3, 0.02, 0.2), 0.008, NV, 6);
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: [0.233, AXLE_R.y, AXLE_R.z], axis: [1, 0, 0], segments: 28, color: CHROME, bone: wheelR },
=======
      { at: [0.2375, AXLE_R.y, AXLE_R.z], axis: [1, 0, 0], segments: 28, color: ORANGE_P, bone: wheelR },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: [0.233, SMALL_C.y, SMALL_C.z], axis: [1, 0, 0], segments: 18, color: CHROME, bone: chassis },
=======
      { at: [0.2375, SMALL_C.y, SMALL_C.z], axis: [1, 0, 0], segments: 18, color: ORANGE_P, bone: chassis },
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.3, 0.45, -0.3],
    [-0.3, 0.44, -0.7],
    [-0.3, 0.45, -1.2],
=======
    [-0.3, 0.45, -0.3],
    [-0.34, 0.44, -0.7],
    [-0.34, 0.45, -1.2],
>>>>>>> REPLACE

<<<<<<< SEARCH
    gradient(BLUED, CHROME, V(-0.1, 0.68, -0.13), V(-0.28, 0.5, -0.2)),
  );
=======
    gradient(BLUED, CHROME, V(-0.1, 0.68, -0.13), V(-0.28, 0.5, -0.2)),
  );
  // hangers carrying both pipes from the lower cradle rail
  for (const h of [
    { z: -0.55, rx: 0.143, ry: 0.389, x2: -0.325 },
    { z: -0.85, rx: 0.163, ry: 0.44, x2: -0.34 },
  ]) {
    R(chassis, V(-0.27, 0.31, h.z), V(-h.rx, h.ry, h.z), 0.008, NV, 6);
    R(chassis, V(h.x2, 0.44, h.z), V(-h.rx, h.ry, h.z), 0.008, NV, 6);
    G(box(0.03, 0.03, 0.03), NV, chassis, V(-h.rx, h.ry, h.z));
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  G(box(0.1, 0.03, 0.2), GUN, chassis, V(0, 0.73, -0.38));
=======
  // tapered seat pan on two mounts tied into a backbone crossmember
  b.extrude(
    [
      [-0.12, 0.16],
      [0.12, 0.16],
      [0.075, -0.16],
      [-0.075, -0.16],
    ],
    { at: [0, 0.735, -0.38], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.025, bevel: 0.004, color: GUN, bone: chassis },
  );
  R(chassis, V(-0.07, 0.662, -0.4), V(0.07, 0.662, -0.4), 0.014, GUN, 8);
  for (const s of [1, -1]) R(chassis, V(s * 0.07, 0.665, -0.4), V(s * 0.07, 0.735, -0.4), 0.012, GUN, 8);
>>>>>>> REPLACE

<<<<<<< SEARCH
  G(box(0.22, 0.1, 0.05), LEATHER, chassis, V(0, 1.14, -1.08));
=======
  R(chassis, V(-0.205, 1.14, -1.05), V(0.205, 1.14, -1.05), 0.011, CHROME, 8);
  G(box(0.26, 0.13, 0.012), NV, chassis, V(0, 1.14, -1.058));
  G(box(0.22, 0.1, 0.05), LEATHER, chassis, V(0, 1.14, -1.08));
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const z of [0.3, -0.04])
=======
  for (const z of [0.4, -0.15])
>>>>>>> REPLACE

<<<<<<< SEARCH
  R(steer, V(0, LAMP.y, LAMP.z - 0.07), V(0, LAMP.y, LAMP.z + 0.03), 0.09, NV, 12);
  R(steer, V(0, LAMP.y, LAMP.z + 0.03), V(0, LAMP.y, LAMP.z + 0.06), 0.097, ORANGE, 12);
=======
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.062, 0.015],
      [0.098, 0.11],
      [0.103, 0.12],
      [0.1, 0.13],
      [0, 0.13],
    ],
    { at: [0, LAMP.y, LAMP.z - 0.1], axis: [0, 0, 1], segments: 12, color: NV, bone: steer },
  );
  R(steer, V(0, LAMP.y, LAMP.z + 0.03), V(0, LAMP.y, LAMP.z + 0.06), 0.108, ORANGE, 12);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) R(steer, V(s * 0.095, LAMP.y, 0.436), V(s * 0.08, LAMP.y, LAMP.z - 0.03), 0.016, CHROME, 6);
=======
  for (const s of [1, -1]) R(steer, V(s * 0.095, LAMP.y, 0.436), V(s * 0.08, LAMP.y, LAMP.z - 0.03), 0.016, CHROME, 6);
  // side cheeks joining the brow to the shell; lens stays fully exposed
  for (const s of [1, -1])
    b.extrude(
      [
        [-0.08, 0.02],
        [0.03, -0.01],
        [0.055, 0.03],
        [0.05, 0.075],
        [-0.07, 0.075],
      ],
      { at: [s * 0.1, LAMP.y, LAMP.z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.016, bevel: 0.003, color: ORANGE_P, bone: steer },
    );
  // restrained white brow inset
  G(box(0.07, 0.004, 0.04), WHITE, steer, V(0, LAMP.y + 0.126, LAMP.z + 0.015));
>>>>>>> REPLACE