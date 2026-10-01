import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { offset, rng } from "../src/math";
import { countershade, mottle, paint, scales } from "../src/paint";
import { bezier, catmull, polyline } from "../src/path";
import type { Chain, Joint } from "../src/skeleton";

export const meta = {
  name: "Secretary Bird · Sonnet",
  description:
    "A 1.3 m secretary bird at rest: black feathered thighs over bare scaly legs, a grey body, black flight feathers, two long central tail feathers, an orange-red bare face with a hooked beak, and a fan of black-tipped crest quills.",
};

const GREY = "#9aa4ab";
const THIGH = "#272a31";
const GREY_DARK = "#939da5";
const GREY_LIGHT = "#a9b3b9";
const PALE = "#dde1e0";
const COVERT = "#818b92";
const BLACK = "#1d1f24";
const WHITE = "#f1f2ee";
const FACE = "#e5502a";
const LEG = "#d9c8b2";
const LEG_EDGE = "#a8957e";
const BEAK = "#8a949a";
const HOOK = "#2f363b";
const IRIS = "#5d3818";
const CLAW = "#2a2a2c";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function build() {
  const b = createBuilder({ name: "secretaryBird" });
  const rand = rng(11);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.85, -0.17], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.85, -0.17],
      [0, 0.88, 0.04],
      [0, 0.94, 0.2],
    ]),
    { parent: hips, role: "spine", count: 2 },
  );
  const chestJoint = spine.joints[spine.joints.length - 1];
  const neckPath = catmull([
    [0, 0.95, 0.2],
    [0, 1.03, 0.275],
    [0, 1.1, 0.3],
    [0, 1.165, 0.325],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chestJoint, role: "neck", count: 3 });
  const neckTop = neck.joints[neck.joints.length - 1];
  const HC = V(0, 1.2, 0.345); // head centre
  const head = b.joint("head", { parent: neckTop, at: [0, 1.17, 0.33], aim: [0, 1.2, 0.4], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HC.y - 0.032, HC.z + 0.028],
    aim: [0, HC.y - 0.034, HC.z + 0.1],
    role: "jaw",
    group: "head",
  });

  // ---------------------------------------------------------------- paints
  const coat = countershade(mottle(GREY_DARK, GREY_LIGHT, { size: 0.08, contrast: 0.5 }), PALE, { level: -0.35, soft: 0.25 });
  const legSkin = scales(LEG, LEG_EDGE, { size: 0.02, width: 0.22 });
  const skullPaint = paint((p) => {
    const dz = p.z - HC.z;
    const dy = p.y - HC.y;
    const zig = Math.abs((((dz / 0.014) % 1) + 1) % 1 - 0.5) * 2; // 0..1 triangle wave
    const edge = 0.028 + 0.008 * zig + 0.3 * dz;
    return dz > -0.04 && dy < edge ? FACE : coat;
  });

  // ---------------------------------------------------------------- body
  b.sweep(spine, (t) => [0.098 + 0.03 * Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.125 + 0.035 * Math.sin(Math.PI * t)], {
    color: coat,
    sides: 10,
    shift: [0, -0.005],
  });
  // neck
  b.sweep(neck, (t) => 0.046 - 0.014 * t, { color: coat, sides: 8 });
  // ruffled breast frill at the neck base, drooping over the chest
  b.ring(frame(neck.at(0.1), [0, -1, 0.4]), { count: 14, radius: 0.046, tilt: 58 }, (f) =>
    b.spike(f, f, 0.06, 0.017, { color: coat, sides: 4 }),
  );

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), skullPaint, {
    bone: head,
    at: HC,
    scale: [0.046, 0.05, 0.062],
  });
  const face = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = face.around(HC).at(s * 62, 10);
    if (!hit) continue;
    const eye = b.stick(new THREE.SphereGeometry(0.0165, 5, 4), IRIS, hit, { embed: 0.45, bone: head });
    b.stick(new THREE.SphereGeometry(0.0085, 6, 4), "#0a0a0c", hit.moved([0, 0.0125, 0]), { embed: 0.5, bone: head });
    b.stick(new THREE.SphereGeometry(0.0028, 4, 3), "#ffffff", hit.moved([s * 0.002, 0.0195, 0.004]), { embed: 0.5, bone: head });
    b.ring(eye, { count: 7, radius: 0.016, fromDeg: -80, toDeg: 80, tilt: 28 }, (lash) =>
      b.spike(lash, lash, 0.03, 0.0032, { color: BLACK, sides: 4, bone: head }),
    );
  }

  // upper beak: deep, hooked
  const beakPath = catmull([
    [0, HC.y - 0.006, HC.z + 0.04],
    [0, HC.y + 0.001, HC.z + 0.085],
    [0, HC.y - 0.018, HC.z + 0.118],
    [0, HC.y - 0.058, HC.z + 0.128],
  ]);
  b.sweep(beakPath, (t) => [0.021 * (1 - 0.5 * t), 0.03 * (1 - 0.78 * Math.pow(t, 1.3))], {
    bone: head,
    sides: 6,
    caps: { start: "flat", end: "point" },
    bands: [
      [0.3, FACE],
      [0.82, BEAK],
      [1, HOOK],
    ],
    up: [0, 1, 0],
  });
  // lower beak, hinged on the jaw
  b.sweep(polyline([[0, HC.y - 0.038, HC.z + 0.03], [0, HC.y - 0.039, HC.z + 0.08], [0, HC.y - 0.036, HC.z + 0.112]]), [0.016, 0.004], {
    bone: jaw,
    sides: 6,
    caps: { start: "flat", end: "point" },
    bands: [
      [0.75, "#a4adb2"],
      [1, HOOK],
    ],
  });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.006, 5, 4), HOOK, { bone: head, at: [s * 0.012, HC.y - 0.005, HC.z + 0.06] });

  // crest of black-tipped quills, fanned behind the skull
  const crestLine = frame([0, HC.y + 0.008, HC.z - 0.038], [0, 0.18, -1]);
  b.ring(
    crestLine,
    { count: 13, radius: 0.028, fromDeg: -100, toDeg: 100, tilt: 50, joints: 3, name: "crest", parent: head, role: "fan" },
    (q) => {
      const k = Math.abs(q.t - 0.5) * 2; // 0 at top, 1 at sides
      const len = 0.16 - 0.05 * k + 0.012 * (rand() - 0.5);
      const tip = offset(offset(q, q, len), [0, -1, -0.3], 0.03 + 0.03 * k);
      const mid = offset(offset(q, q, len * 0.55), [0, 1, 0], 0.004);
      b.sweep(bezier(q, mid, tip), (t) => [0.0046 + 0.0105 * smooth(0.4, 0.7, t) * (1 - 0.6 * smooth(0.88, 1, t)), 0.0032], {
        up: q.outward,
        section: "box",
        caps: { start: "flat", end: "point" },
        bands: [
          [0.5, GREY],
          [1, BLACK],
        ],
      });
    },
  );

  // ---------------------------------------------------------------- tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.86, -0.2],
      [0, 0.85, -0.42],
      [0, 0.82, -0.7],
    ]),
    { parent: hips, role: "tail", count: 3 },
  );
  const tailBands: [number, string][] = [
    [0.62, GREY],
    [0.86, BLACK],
    [1, WHITE],
  ];
  const ribbon = (
    root: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    w: number,
    bands: [number, string][],
    opts: { bone: Joint | Chain; up: THREE.Vector3; droop: number; thick?: number; curl?: THREE.Vector3 },
  ) => {
    const d = dir.clone().normalize();
    const tip = root.clone().addScaledVector(d, len).add(V(0, -opts.droop, 0));
    if (opts.curl) tip.add(opts.curl);
    const ctrl = root.clone().addScaledVector(d, len * 0.5).add(V(0, -opts.droop * 0.12, 0));
    const prof = (t: number) => Math.min(1, 0.5 + t * 3.5) * (1 - 0.7 * smooth(0.82, 1, t));
    return b.sweep(bezier(root, ctrl, tip), (t) => [w * prof(t), opts.thick ?? 0.0035], {
      bone: opts.bone,
      up: opts.up,
      section: "box",
      caps: { start: "flat", end: "flat" },
      bands,
    });
  };
  for (const s of [1, -1]) {
    ribbon(V(s * 0.03, 0.865, -0.2), V(s * 0.03, -0.2, -1), 0.8, 0.03, tailBands, {
      bone: tail,
      up: V(0, 1, 0),
      droop: 0.07,
      curl: V(s * 0.004, 0, 0),
    });
    [
      [9, 0.52, 0.004],
      [19, 0.42, 0.008],
      [30, 0.33, 0.012],
    ].forEach(([yaw, len, lower]) => {
      const a = (yaw * Math.PI) / 180;
      ribbon(V(s * 0.03, 0.86 - lower, -0.2), V(s * Math.sin(a), -0.16, -Math.cos(a)), len, 0.03, tailBands, {
        bone: tail,
        up: V(0, 1, 0),
        droop: 0.05,
      });
    });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt = V(s * 0.085, 0.8, 0.02);
    const foot = V(s * 0.095, 0.04, 0.07);
    const pts = limb(hipPt, foot, [0.2, 0.33, 0.45], [[0, 0, 1], [0, 0, -1]]);
    if (pts[pts.length - 1].distanceTo(foot) > 1e-3) throw new Error("leg too short");
    const leg = b.chain("leg" + side, pts, {
      parent: hips,
      role: "leg",
      names: ["hip" + side, "knee" + side, "ankle" + side, "foot" + side],
    });
    const footJoint = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.sweep(
      leg,
      (t) => (t < 0.34 ? 0.03 : 0.03 - 0.012 * smooth(0.34, 0.56, t)),
      { color: legSkin, sides: 8 },
    );
    // black feathered thigh
    b.sweep(
      leg,
      (t) => {
        const swell = 0.048 + 0.02 * Math.sin(Math.PI * Math.min(1, t / 0.4) * 0.9);
        return t < 0.25 ? swell : swell * (1 - 0.35 * smooth(0.25, 0.41, t));
      },
      { to: 0.41, color: THIGH, sides: 8, smooth: false, caps: { start: "round", end: "flat" } },
    );
    for (const [t, r, len, n] of [
      [0.22, 0.068, 0.06, 10],
      [0.34, 0.05, 0.066, 9],
      [0.41, 0.034, 0.075, 8],
    ] as const) {
      b.ring(leg.at(t), { count: n, radius: r, tilt: 66 }, (f) =>
        b.spike(f, f, len, 0.014, { color: BLACK, sides: 4 }),
      );
    }
    // heel ball + foot
    b.part(new THREE.SphereGeometry(0.024, 6, 5), legSkin, { bone: footJoint, at: foot });
    const footBase = foot.clone();
    const toes: [number, number, number][] = [
      [-30, 0.098, 0.014],
      [0, 0.118, 0.014],
      [30, 0.098, 0.014],
    ];
    toes.forEach(([deg, len, r], i) => {
      const a = (deg * Math.PI) / 180;
      const d = V(Math.sin(a), 0, Math.cos(a));
      const p1 = footBase.clone().addScaledVector(d, len * 0.42);
      p1.y = r;
      const p2 = footBase.clone().addScaledVector(d, len);
      p2.y = r;
      const toe = b.chain(`toe${side}${i + 1}`, [footBase, p1, p2], {
        parent: footJoint,
        role: "digit",
        names: [`toe${side}${i + 1}a`, `toe${side}${i + 1}b`, `toe${side}${i + 1}Tip`],
      });
      b.sweep(toe, [r * 1.15, r * 0.85], { color: legSkin, sides: 6, caps: { start: "round", end: "flat" } });
      b.spike(p2.clone().addScaledVector(d, -0.006), d.clone().add(V(0, -0.35, 0)), 0.034, 0.012, {
        color: CLAW,
        sides: 5,
        bone: toe.joints[toe.joints.length - 1],
      });
    });
    // hind toe (hallux)
    const back = footBase.clone().add(V(0, 0, -0.055));
    back.y = 0.013;
    const hallux = b.chain(`toe${side}4`, [footBase, back], {
      parent: footJoint,
      role: "digit",
      names: [`toe${side}4a`, `toe${side}4Tip`],
    });
    b.sweep(hallux, [0.015, 0.011], { color: legSkin, sides: 6, caps: { start: "round", end: "flat" } });
    b.spike(back.clone().add(V(0, 0, 0.004)), V(0, -0.3, -1), 0.028, 0.011, {
      color: CLAW,
      sides: 5,
      bone: hallux.joints[hallux.joints.length - 1],
    });
  }

  // ---------------------------------------------------------------- wings
  const leafOutline = (L: number, w: number): OutlinePoint[] => [
    [0, -0.45 * w],
    [0.18 * L, -w],
    [0.72 * L, -w],
    [0.94 * L, -0.45 * w],
    [L, 0, "sharp"],
    [0.94 * L, 0.45 * w],
    [0.72 * L, w],
    [0.18 * L, w],
    [0, 0.45 * w],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const armPts = [V(s * 0.125, 0.985, 0.13), V(s * 0.175, 0.955, -0.04), V(s * 0.215, 0.93, -0.17), V(s * 0.25, 0.895, -0.27)];
    const arm = b.chain("wing" + side, armPts, {
      parent: spine.joints[1],
      role: "wing",
      names: ["shoulder" + side, "elbow" + side, "wrist" + side, "hand" + side],
    });
    const armPath = catmull(armPts);
    b.sweep(arm, [0.032, 0.022], { color: COVERT, sides: 6 });
    const out = V(s, 0, 0);
    const place = (u: number) => {
      const p = armPath.at(u);
      return V(p.x, p.y, p.z);
    };
    const fdir = (u: number) => {
      const pitch = ((-72 + (u - 0.15) * 43) * Math.PI) / 180;
      return V(s * 0.2, Math.sin(pitch), -Math.cos(pitch));
    };
    const boneAt = (u: number) => (u < 0.5 ? arm.joints[1] : arm.joints[2]);
    // secondaries then primaries (black flight feathers)
    const flight: number[] = [];
    for (let i = 0; i < 9; i++) flight.push(0.17 + (0.4 * i) / 8);
    for (let i = 0; i < 10; i++) flight.push(0.62 + (0.38 * i) / 9);
    flight.forEach((u, k) => {
      const prim = u >= 0.6;
      const len = prim ? 0.36 - 0.12 * Math.pow((u - 0.85) / 0.25, 2) : 0.21 + 0.05 * ((u - 0.17) / 0.4);
      const root = place(u).addScaledVector(out, 0.008 + 0.004 * (k % 2));
      ribbon(
        root,
        fdir(u),
        len,
        prim ? 0.0195 : 0.021,
        [
          [0.3, "#3a3d44"],
          [1, BLACK],
        ],
        { bone: boneAt(u), up: out, droop: prim ? 0.03 : 0.01, thick: 0.0045 },
      );
    });
    // grey coverts, three overlapping rows of rounded feathers
    const rows: [number, number, number, number, string, number][] = [
      [15, 0.03, 0.15, 0.03, COVERT, 0.029],
      [13, 0.02, 0.105, 0.04, GREY, 0.029],
      [11, 0.0, 0.085, 0.05, GREY_LIGHT, 0.03],
    ];
    rows.forEach(([n, u0, len, lift, col, w]) => {
      for (let i = 0; i < n; i++) {
        const u = u0 + ((0.97 - u0) * i) / (n - 1);
        const d = fdir(u).normalize();
        const across = out.clone().cross(d).normalize();
        b.extrude(leafOutline(len * (1 - 0.3 * u), w), {
          at: place(u).addScaledVector(out, lift),
          x: d.toArray(),
          y: across.toArray(),
          thickness: 0.008,
          bevel: 0.003,
          detail: 0.34,
          color: col,
          bone: boneAt(u),
        });
      }
    });
  }

  return b.root;
}
