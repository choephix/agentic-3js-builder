```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, svg } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { metal, panelled, gearGeometry } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Overwatch Chopper",
  description:
    "Stylized hero-tech chopper motorbike: raked springer-style fork, ape hangers, V-twin with glowing hard-light rings, orange/navy cel-shaded panels, cyan energy accents, spinning wheel joints and a steering joint.",
};

type V = [number, number, number];
const rad = (d: number) => (d * Math.PI) / 180;

// points on a circle in the YZ plane; angle 0 = up, positive = toward +Z (forward)
const arcPts = (cy: number, cz: number, r: number, a0: number, a1: number, n: number, x = 0): V[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = rad(a0 + ((a1 - a0) * i) / n);
    return [x, cy + r * Math.cos(a), cz + r * Math.sin(a)] as V;
  });

export default function build() {
  const b = createBuilder({ name: "chopper", paintSize: 2048 });

  // ---------------------------------------------------------------- palette
  const OR = "#ff9a1f";
  const CY = "#3fe0ff";
  const RUB = "#17191f";
  const SPOKE = "#e9eef8";
  const ORANGE = cel(OR);
  const NAVY = cel("#2d3650");
  const DARK = cel("#1b2030");
  const WHITE = cel("#f2f5fa", "#b6c4de");
  const STEEL = metal("steel", { tarnish: 0.04, polish: 0.55 });
  const GUN = metal("iron", { tarnish: 0.08, polish: 0.45, seed: 3 });
  const GUNP = panelled(GUN, { size: 0.07, rivets: 0.02 });

  const stripe = paint((p) => {
    const x = Math.abs(p.x);
    return x < 0.014 ? WHITE : x < 0.03 ? NAVY : ORANGE;
  });
  const tankPaint = paint((p) => (p.z > 0.4 || p.z < -0.19 ? NAVY : stripe));
  const seatPaint = paint((p) => (Math.abs(p.x) < 0.011 ? OR : DARK));

  // ---------------------------------------------------------------- skeleton
  const frame = b.joint("frame", { at: [0, 0.6, 0] });
  const HEAD = new THREE.Vector3(0, 1.08, 0.52);
  const FD = new THREE.Vector3(0, -0.768, 0.64).normalize(); // fork direction (raked ~40 deg)
  const FY = 0.325;
  const FL = (HEAD.y - FY) / -FD.y;
  const AXF = HEAD.clone().addScaledVector(FD, FL); // front axle
  const RC = new THREE.Vector3(0, 0.34, -0.9); // rear axle

  const steer = b.joint("steer", { parent: frame, at: HEAD, aim: AXF });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXF, dir: [1, 0, 0] });
  const wheelR = b.joint("wheelR", { parent: frame, at: RC, dir: [1, 0, 0] });
  const KD = new THREE.Vector3(-0.15, -0.3, -0.94).normalize();
  const kick = b.joint("kickstand", { parent: frame, at: [-0.14, 0.36, -0.3], dir: KD });

  const fp = (x: number, k: number): V => [x, HEAD.y + FD.y * k, HEAD.z + FD.z * k];
  const H = (x: number, y: number, z: number): V => [HEAD.x + x, HEAD.y + y, HEAD.z + z];

  // ---------------------------------------------------------------- wheels
  const treadPaint = (c: THREE.Vector3, ri: number) =>
    paint((p, n, s) => {
      if (Math.abs(n.x) > 0.55) {
        const r = Math.hypot(p.y - c.y, p.z - c.z);
        return r > ri + 0.03 && r < ri + 0.045 ? OR : "#1d2029";
      }
      const a = (((s[1] - 300 * Math.abs(s[0])) % 24) + 24) % 24;
      return a < 12 ? "#2c313e" : RUB;
    });

  const wheel = (
    bone: Joint,
    c: THREE.Vector3,
    o: { R: number; w: number; ri: number; d: number; ring: number; axle: number; discs: boolean },
  ) => {
    const { R, w, ri, d } = o;
    const X: V = [1, 0, 0];
    b.lathe(
      [
        [ri, -0.58 * w],
        [R - 0.095, -0.93 * w],
        [R - 0.04, -w],
        [R - 0.008, -0.6 * w],
        [R, -0.25 * w],
        [R, 0.25 * w],
        [R - 0.008, 0.6 * w],
        [R - 0.04, w],
        [R - 0.095, 0.93 * w],
        [ri, 0.58 * w],
      ],
      { at: c, axis: X, bone, segments: 28, color: treadPaint(c, ri) },
    );
    const d2 = d * 1.6;
    const rimPaint = paint((p) => (Math.hypot(p.y - c.y, p.z - c.z) > ri - 0.035 ? ORANGE : NAVY));
    b.lathe(
      [
        [0, -d2],
        [0.06, -d2],
        [ri + 0.012, -d],
        [ri + 0.012, d],
        [0.06, d2],
        [0, d2],
      ],
      { at: c, axis: X, bone, segments: 28, color: rimPaint },
    );
    const r0 = 0.055;
    const r1 = ri - 0.025;
    const mid = (r0 + r1) / 2;
    for (const side of [1, -1]) {
      for (let i = 0; i < 6; i++) {
        const a = 15 + i * 60;
        b.part(new THREE.BoxGeometry(0.014, r1 - r0, 0.03), SPOKE, {
          bone,
          at: [c.x + side * (d + 0.011), c.y + Math.cos(rad(a)) * mid, c.z + Math.sin(rad(a)) * mid],
          rotation: [a, 0, 0],
        });
      }
      glow(
        b.lathe(
          [
            [o.ring, 0],
            [o.ring + 0.016, 0],
            [o.ring + 0.016, 0.008],
            [o.ring, 0.008],
          ],
          { at: [c.x + side * (d + 0.012), c.y, c.z], axis: [side, 0, 0], bone, segments: 28, color: CY },
        ),
        1.3,
      );
      if (o.discs) {
        b.lathe(
          [
            [0.085, -0.004],
            [0.15, -0.004],
            [0.15, 0.004],
            [0.085, 0.004],
          ],
          { at: [c.x + side * 0.055, c.y, c.z], axis: X, bone, segments: 24, color: STEEL },
        );
        b.part(new THREE.BoxGeometry(0.034, 0.09, 0.07), OR, {
          bone: steer,
          at: [c.x + side * 0.07, c.y + 0.115, c.z - 0.06],
        });
      }
    }
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 2 * (d2 + 0.01), 10), STEEL, { bone, at: c, dir: X, flat: true });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, o.axle * 2, 8), STEEL, { bone, at: c, dir: X, flat: true });
  };

  wheel(wheelR, RC, { R: 0.34, w: 0.125, ri: 0.215, d: 0.035, ring: 0.14, axle: 0.22, discs: false });
  wheel(wheelF, AXF, { R: 0.325, w: 0.058, ri: 0.205, d: 0.03, ring: 0.16, axle: 0.115, discs: true });

  // ---------------------------------------------------------------- frame
  b.sweep(
    catmull([
      [0, 0.99, 0.6],
      [0, 1.0, 0.3],
      [0, 0.95, -0.05],
      [0, 0.86, -0.3],
      [0, 0.76, -0.5],
      [0, 0.7, -0.8],
    ]),
    0.03,
    { bone: frame, color: NAVY },
  );
  b.sweep(
    catmull([
      [0, 0.9, 0.57],
      [0, 0.68, 0.52],
      [0, 0.5, 0.42],
      [0, 0.4, 0.26],
      [0, 0.38, 0.1],
    ]),
    0.034,
    { bone: frame, color: NAVY },
  );
  b.rod(fp(0, 0.0), fp(0, 0.24), 0.045, NAVY, { bone: frame }); // head tube

  for (const s of [1, -1]) {
    // rails (hardtail)
    b.sweep(
      catmull([
        [s * 0.1, 0.42, 0.05],
        [s * 0.115, 0.37, -0.2],
        [s * 0.13, 0.355, -0.55],
        [s * 0.16, 0.34, -0.9],
      ]),
      0.026,
      { bone: frame, color: NAVY },
    );
    // seat stays
    b.sweep(
      catmull([
        [0, 0.75, -0.5],
        [s * 0.17, 0.6, -0.65],
        [s * 0.17, 0.34, -0.9],
      ]),
      0.018,
      { bone: frame, color: STEEL },
    );
    // dropout plates
    b.part(new THREE.BoxGeometry(0.014, 0.1, 0.12), OR, { bone: frame, at: [s * 0.172, 0.34, -0.9] });
    // fender struts
    b.rod([s * 0.165, 0.34, -0.9], [s * 0.14, 0.34 + 0.385 * Math.cos(rad(-55)), -0.9 + 0.385 * Math.sin(rad(-55))], 0.012, STEEL, { bone: frame });
    b.rod([s * 0.165, 0.34, -0.9], [s * 0.14, 0.34 + 0.385 * Math.cos(rad(40)), -0.9 + 0.385 * Math.sin(rad(40))], 0.012, STEEL, { bone: frame });
    // forward controls
    b.rod([s * 0.03, 0.47, 0.44], [s * 0.22, 0.42, 0.58], 0.014, STEEL, { bone: frame });
    b.rod([s * 0.2, 0.42, 0.58], [s * 0.3, 0.42, 0.58], 0.02, RUB, { bone: frame });
    // side power panels with bolt
    b.extrude(
      [
        [-0.12, -0.05],
        [-0.09, 0.07],
        [0.1, 0.08],
        [0.14, -0.01],
        [0.08, -0.09],
        [-0.1, -0.09],
      ],
      { at: [s * 0.14, 0.5, -0.42], thickness: 0.03, bevel: 0.006, color: ORANGE, bone: frame },
    );
    const bolt = [
      [0.01, 0.075],
      [-0.045, -0.01],
      [-0.01, -0.01],
      [-0.03, -0.075],
      [0.045, 0.015],
      [0.01, 0.015],
      [0.04, 0.075],
    ].map(([x, y]) => [x * 0.6, y * 0.6] as [number, number]);
    glow(b.extrude(bolt, { at: [s * 0.158, 0.5, -0.42], thickness: 0.012, color: CY, bone: frame }), 1.4);
  }

  // skid plate
  b.part(new THREE.BoxGeometry(0.2, 0.035, 0.32), OR, { bone: frame, at: [0, 0.31, -0.05] });

  // ---------------------------------------------------------------- engine (V-twin)
  const crank = new THREE.Vector3(0, 0.46, -0.05);
  b.part(new THREE.BoxGeometry(0.22, 0.26, 0.32), GUNP, { bone: frame, at: crank });
  b.part(new THREE.BoxGeometry(0.2, 0.22, 0.22), GUNP, { bone: frame, at: [0, 0.43, -0.27] });

  const fin: [number, number][] = [
    [0, 0],
    [0.075, 0],
    [0.075, 0.07],
  ];
  let fh = 0.07;
  for (let i = 0; i < 5; i++) {
    fin.push([0.085, fh], [0.125, fh + 0.006], [0.125, fh + 0.016], [0.085, fh + 0.022]);
    fh += 0.034;
  }
  fin.push([0.085, fh], [0.075, fh + 0.01], [0, fh + 0.01]);

  for (const sg of [1, -1]) {
    const dir = new THREE.Vector3(0, 0.766, sg * 0.643);
    const along = (k: number): V => [crank.x + dir.x * k, crank.y + dir.y * k, crank.z + dir.z * k];
    b.lathe(fin, { at: along(0.1), axis: dir, segments: 12, bone: frame, color: GUN });
    glow(
      b.lathe(
        [
          [0.078, 0.02],
          [0.098, 0.02],
          [0.098, 0.03],
          [0.078, 0.03],
        ],
        { at: along(0.1), axis: dir, segments: 12, bone: frame, color: CY },
      ),
      1.3,
    );
    b.part(new THREE.BoxGeometry(0.2, 0.09, 0.17), GUN, { bone: frame, at: along(0.395), dir });
    b.part(new THREE.BoxGeometry(0.18, 0.05, 0.13), ORANGE, { bone: frame, at: along(0.465), dir });
    glow(b.part(new THREE.BoxGeometry(0.1, 0.01, 0.03), CY, { bone: frame, at: along(0.495), dir }), 1.4);
  }

  // primary cover and glowing reactor rings
  for (const s of [1, -1]) {
    const at: V = [s * 0.11, 0.46, -0.05];
    b.lathe(
      [
        [0, 0],
        [0.105, 0],
        [0.115, 0.012],
        [0.1, 0.028],
        [0, 0.028],
      ],
      { at, axis: [s, 0, 0], segments: 14, bone: frame, color: ORANGE },
    );
    glow(
      b.lathe(
        [
          [0.045, 0.028],
          [0.065, 0.028],
          [0.065, 0.034],
          [0.045, 0.034],
        ],
        { at, axis: [s, 0, 0], segments: 14, bone: frame, color: CY },
      ),
      1.4,
    );
    b.lathe(
      [
        [0, 0.028],
        [0.04, 0.028],
        [0.04, 0.04],
        [0, 0.04],
      ],
      { at, axis: [s, 0, 0], segments: 10, bone: frame, color: STEEL },
    );
    // air cleaner
    b.rod([s * 0.05, 0.72, -0.05], [s * 0.18, 0.72, -0.05], 0.03, STEEL, { bone: frame });
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.105, 0.02],
        [0.09, 0.045],
        [0, 0.05],
      ],
      { at: [s * 0.18, 0.72, -0.05], axis: [s, 0, 0], segments: 14, bone: frame, color: ORANGE },
    );
    glow(
      b.lathe(
        [
          [0.03, 0.05],
          [0.06, 0.05],
          [0.06, 0.056],
          [0.03, 0.056],
        ],
        { at: [s * 0.18, 0.72, -0.05], axis: [s, 0, 0], segments: 12, bone: frame, color: CY },
      ),
      1.3,
    );
  }

  // ---------------------------------------------------------------- exhaust
  for (const s of [1, -1]) {
    const P = catmull([
      [s * 0.09, 0.74, 0.27],
      [s * 0.12, 0.7, 0.34],
      [s * 0.17, 0.6, 0.4],
      [s * 0.22, 0.48, 0.37],
      [s * 0.25, 0.4, 0.2],
      [s * 0.27, 0.37, -0.2],
      [s * 0.28, 0.38, -0.6],
      [s * 0.29, 0.43, -1.0],
      [s * 0.29, 0.5, -1.45],
    ]);
    b.sweep(P, [0.028, 0.028, 0.03, 0.034, 0.04, 0.042, 0.05, 0.075], {
      bone: frame,
      color: STEEL,
      caps: { start: "round", end: "none" },
    });
    b.sweep(
      catmull([
        [s * 0.09, 0.74, -0.38],
        [s * 0.14, 0.62, -0.42],
        [s * 0.19, 0.5, -0.34],
        [s * 0.27, 0.4, -0.25],
      ]),
      0.028,
      { bone: frame, color: STEEL },
    );
    glow(b.sweep(P.slice(0.5, 0.53), 0.047, { bone: frame, color: CY, caps: "flat" }), 1.2);
    glow(b.sweep(P.slice(0.62, 0.65), 0.052, { bone: frame, color: CY, caps: "flat" }), 1.2);
    const e = P.at(1);
    const tg = P.tangentAt(1);
    glow(
      b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.01, 10), CY, {
        bone: frame,
        at: [e.x - tg.x * 0.02, e.y - tg.y * 0.02, e.z - tg.z * 0.02],
        dir: tg,
        flat: true,
      }),
      1.5,
    );
  }

  // ---------------------------------------------------------------- chain drive (left)
  const CHX = 0.2;
  b.part(gearGeometry({ teeth: 28, module: 0.0075, spokes: 5, bore: 0.01 }), ORANGE, {
    bone: wheelR,
    at: [CHX, RC.y, RC.z],
    dir: [1, 0, 0],
  });
  b.part(gearGeometry({ teeth: 12, module: 0.0075, bore: 0.008 }), STEEL, {
    bone: frame,
    at: [CHX, 0.39, -0.3],
    dir: [1, 0, 0],
  });
  b.rod([0.1, 0.39, -0.3], [0.2, 0.39, -0.3], 0.015, STEEL, { bone: frame });
  b.sweep(
    catmull(
      [
        [CHX, 0.445, -0.9],
        [CHX, 0.435, -0.3],
        [CHX, 0.39, -0.245],
        [CHX, 0.345, -0.3],
        [CHX, 0.235, -0.9],
        [CHX, 0.34, -1.01],
      ] as V[],
      { closed: true },
    ),
    0.006,
    { bone: frame, color: GUN, section: { ngon: 4 } },
  );

  // ---------------------------------------------------------------- tank, seat, fenders
  const tank = b.loft(
    [
      { at: [0, 1.03, 0.46], w: 0.09, h: 0.09 },
      { at: [0, 1.04, 0.34], w: 0.24, h: 0.2 },
      { at: [0, 1.02, 0.1], w: 0.34, h: 0.26 },
      { at: [0, 0.99, -0.1], w: 0.3, h: 0.22 },
      { at: [0, 0.95, -0.24], w: 0.12, h: 0.1 },
    ],
    { bone: frame, color: tankPaint },
  );
  b.loft(
    [
      { at: [0, 0.8, -0.44], w: 0.16, h: 0.06 },
      { at: [0, 0.795, -0.55], w: 0.26, h: 0.08 },
      { at: [0, 0.78, -0.72], w: 0.3, h: 0.08 },
      { at: [0, 0.795, -0.88], w: 0.2, h: 0.07 },
    ],
    { bone: frame, color: seatPaint },
  );

  const tskin = b.surface(tank);
  const EMB = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#232a3c" stroke="#ffffff" stroke-width="5"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#ff9a1f" stroke-width="4"/>
      <path d="M26 66 L50 22 L74 66 L62 66 L50 44 L38 66Z" fill="#ff9a1f"/>
      <path d="M30 72 H70 V78 H30Z" fill="#3fe0ff"/>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    const hit = tskin.around([0, 1.0, 0.12]).at(s * 90, 0);
    if (hit) b.decal(tank, EMB, { at: hit, dir: [s, 0, 0], size: [0.17, 0.17] });
  }

  // tank-top dial and cap
  const GAUGE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#0b1220"/>
      <path d="M18 70 A40 40 0 1 1 82 70" stroke="#3fe0ff" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M50 50 L68 30" stroke="#ff9a1f" stroke-width="6" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="6" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const dHit = tskin.ray([0, 2, 0.26], [0, -1, 0]);
  if (dHit) {
    const T = new THREE.Vector3(0, 0.8, -0.6).normalize();
    b.lathe(
      [
        [0, -0.012],
        [0.056, -0.012],
        [0.056, 0.01],
        [0.044, 0.01],
        [0.044, 0],
        [0, 0],
      ],
      { at: dHit.at, axis: T, segments: 14, bone: frame, color: STEEL },
    );
    glow(
      b.part(new THREE.CircleGeometry(0.044, 16), "#ffffff", {
        bone: frame,
        at: [dHit.at.x + T.x * 0.003, dHit.at.y + T.y * 0.003, dHit.at.z + T.z * 0.003],
        dir: T,
        axis: "z",
        texture: GAUGE,
      }),
      1,
    );
  }
  const cHit = tskin.ray([0, 2, -0.06], [0, -1, 0]);
  if (cHit) {
    b.stick(new THREE.CylinderGeometry(0.04, 0.045, 0.025, 8), STEEL, cHit, { embed: 0.4, bone: frame, flat: true });
    glow(b.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 8), CY, cHit, { embed: 0.2, bone: frame }), 1.4);
  }

  // rear fender and edge lights
  b.sweep(
    catmull(arcPts(0.34, -0.9, 0.385, 55, -82, 10)),
    (t: number): [number, number] => [0.145 - 0.015 * t, 0.012],
    { bone: frame, color: stripe, section: "box", caps: "flat" },
  );
  for (const s of [1, -1]) {
    glow(b.sweep(catmull(arcPts(0.34, -0.9, 0.4, 50, -78, 10, s * 0.14)), 0.005, { bone: frame, color: CY, caps: "flat" }), 1.3);
  }
  glow(b.rod([-0.09, 0.4, -1.29], [0.09, 0.4, -1.29], 0.015, "#ff6a2a", { bone: frame }), 1.6);

  // sissy bar
  b.sweep(
    catmull([
      [-0.14, 0.52, -0.92],
      [-0.14, 0.95, -0.96],
      [-0.1, 1.15, -0.98],
      [0.1, 1.15, -0.98],
      [0.14, 0.95, -0.96],
      [0.14, 0.52, -0.92],
    ]),
    0.014,
    { bone: frame, color: STEEL },
  );
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.05), DARK, { bone: frame, at: [0, 1.0, -0.97] });
  b.part(new THREE.BoxGeometry(0.16, 0.012, 0.052), OR, { bone: frame, at: [0, 1.0, -0.97] });

  // ---------------------------------------------------------------- front end
  const bracketTop = 0.34;
  for (const s of [1, -1]) {
    b.rod(fp(s * 0.1, -0.02), fp(s * 0.1, 0.55 * FL), 0.017, STEEL, { bone: steer });
    b.rod(fp(s * 0.1, 0.5 * FL), fp(s * 0.1, FL), 0.027, GUNP, { bone: steer });
    glow(b.rod(fp(s * 0.1, 0.46 * FL), fp(s * 0.1, 0.5 * FL), 0.031, CY, { bone: steer }), 1.3);
    glow(
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), CY, {
        bone: steer,
        at: [s * 0.125, AXF.y, AXF.z],
        dir: [1, 0, 0],
        flat: true,
      }),
      1.3,
    );
    // bars
    b.sweep(
      catmull([
        H(s * 0.07, -0.005, 0),
        H(s * 0.075, 0.12, 0.0),
        H(s * 0.1, 0.22, -0.02),
        H(s * 0.2, 0.3, -0.06),
        H(s * 0.34, 0.28, -0.1),
      ]),
      0.014,
      { bone: steer, color: STEEL },
    );
    const gEnd = H(s * 0.46, 0.22, -0.15);
    b.rod(H(s * 0.34, 0.28, -0.1), gEnd, 0.02, RUB, { bone: steer });
    b.part(new THREE.SphereGeometry(0.021, 6, 4), OR, { bone: steer, at: gEnd, flat: true });
    b.rod(H(s * 0.34, 0.265, -0.095), H(s * 0.34, 0.24, 0.05), 0.006, STEEL, { bone: steer });
    // cables
    b.sweep(catmull([H(s * 0.3, 0.27, -0.1), H(s * 0.3, 0.15, 0.0), H(s * 0.13, 0.03, 0.05), fp(s * 0.1, 0.25 * FL)]), 0.004, {
      bone: steer,
      color: RUB,
    });
    // mirrors
    const MD = new THREE.Vector3(0, 0.25, -1).normalize();
    const top = H(s * 0.24, 0.42, -0.08);
    b.rod(H(s * 0.2, 0.3, -0.06), top, 0.008, STEEL, { bone: steer });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.018, 6), ORANGE, { bone: steer, at: top, dir: MD, flat: true });
    glow(
      b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.004, 6), "#9fe8ff", {
        bone: steer,
        at: [top[0] + MD.x * 0.011, top[1] + MD.y * 0.011, top[2] + MD.z * 0.011],
        dir: MD,
        flat: true,
      }),
      0.6,
    );
  }
  // yokes
  b.rod(fp(-0.13, 0), fp(0.13, 0), 0.024, NAVY, { bone: steer });
  b.rod(fp(-0.12, 0.22), fp(0.12, 0.22), 0.02, NAVY, { bone: steer });

  // headlight
  const LC = HEAD.clone().addScaledVector(FD, bracketTop).add(new THREE.Vector3(0, 0, 0.14));
  for (const s of [1, -1]) b.rod(fp(s * 0.1, bracketTop), [s * 0.085, LC.y, LC.z - 0.03], 0.012, STEEL, { bone: steer });
  b.lathe(
    [
      [0, -0.09],
      [0.07, -0.09],
      [0.1, -0.04],
      [0.105, 0.03],
      [0.118, 0.07],
      [0, 0.07],
    ],
    { at: LC, axis: [0, 0, 1], segments: 16, bone: steer, color: ORANGE },
  );
  b.lathe(
    [
      [0.095, 0],
      [0.12, 0],
      [0.12, 0.012],
      [0.095, 0.012],
    ],
    { at: [LC.x, LC.y, LC.z + 0.07], axis: [0, 0, 1], segments: 16, bone: steer, color: NAVY },
  );
  glow(
    b.lathe(
      [
        [0, 0],
        [0.09, 0],
        [0.09, 0.008],
        [0.06, 0.03],
        [0, 0.036],
      ],
      { at: [LC.x, LC.y, LC.z + 0.07], axis: [0, 0, 1], segments: 16, bone: steer, color: "#d8fbff" },
    ),
    1.5,
  );
  b.extrude(
    [
      [-0.15, 0],
      [-0.06, 0.05],
      [0.06, 0.05],
      [0.15, 0],
      [0.07, 0.02],
      [-0.07, 0.02],
    ],
    { at: [LC.x, LC.y + 0.115, LC.z + 0.035], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.005, color: ORANGE, bone: steer },
  );

  // front fender
  b.sweep(
    catmull(arcPts(AXF.y, AXF.z, 0.36, 60, -35, 8)),
    (): [number, number] => [0.07, 0.01],
    { bone: steer, color: stripe, section: "box", caps: "flat" },
  );
  for (const s of [1, -1]) {
    const a = rad(10);
    b.rod([s * 0.06, AXF.y + 0.36 * Math.cos(a), AXF.z + 0.36 * Math.sin(a)], fp(s * 0.1, 0.62 * FL), 0.01, STEEL, { bone: steer });
  }

  // ---------------------------------------------------------------- kickstand (stowed)
  const kTip: V = [kick.at.x + KD.x * 0.26, kick.at.y + KD.y * 0.26, kick.at.z + KD.z * 0.26];
  b.rod(kick.at, kTip, 0.012, STEEL, { bone: kick });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), RUB, { bone: kick, at: kTip, flat: true });

  return b.root;
}
```