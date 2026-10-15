import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { gradient, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A tall elven ranger in forest green: layered cloak and capelet, leather corset and harness, gold leaf filigree, long silver hair, cel-shaded anime face, quiver of fletched arrows and a gold-inlaid longbow.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "elvenArcher" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- palette
  const GREEN = cel("#46703f");
  const SKIN = cel("#f6d8c0", "#e2aa94");
  const CREAM = cel("#eadfc2", "#c8b793");
  const LEATHER = cel("#7b5636", "#523720");
  const LEATHERD = cel("#4d3321", "#33211a");
  const LEATHERL = cel("#8f6a47", "#5f4229");
  const BOOT = cel("#6a4a31", "#45301f");
  const PANTS = cel("#6d5238", "#4a3624");
  const GOLDC = cel("#e0b95c", "#a98433");
  const HAIR = cel(gradient("#f0e6cc", "#d0c09c", [0, 1.5, 0], [0, 0.95, 0]));
  const GOLD = "#d8b058";
  const GEM = "#7ff3b0";
  type C = string | typeof GREEN;

  const VINE = svg(
    `<svg viewBox="0 0 64 128"><path d="M32 124 C26 96 40 76 32 52 C27 36 36 20 32 6" fill="none" stroke="#d8b058" stroke-width="4" stroke-linecap="round"/><path d="M31 100 C16 96 10 82 12 70 C26 74 32 86 31 100Z" fill="#d8b058"/><path d="M33 80 C48 76 54 62 52 50 C38 54 32 66 33 80Z" fill="#d8b058"/><path d="M31 58 C18 54 14 42 16 32 C28 36 32 46 31 58Z" fill="#d8b058"/><path d="M32 30 C42 26 46 18 45 10 C35 14 31 22 32 30Z" fill="#d8b058"/></svg>`,
    { size: 256 },
  );
  const EYE = animeEye({ iris: "#6fb36a" });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  type J = typeof hips;
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.2, 0.01],
      [0, 1.38, 0.005],
      [0, 1.5, -0.005],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.5, -0.005],
      [0, 1.58, 0.01],
      [0, 1.66, 0.03],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.66, 0.03], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.725, 0.035], aim: [0, 1.69, 0.1], role: "jaw" });

  // ---------------------------------------------------------------- helpers
  const PROF: Array<[number, number, number]> = [
    [0.88, 0.13, 0.095],
    [1.0, 0.155, 0.11],
    [1.08, 0.138, 0.098],
    [1.18, 0.118, 0.086],
    [1.26, 0.118, 0.086],
    [1.34, 0.135, 0.098],
    [1.42, 0.15, 0.1],
    [1.52, 0.12, 0.085],
  ];
  const prof = (y: number): [number, number] => {
    if (y <= PROF[0][0]) return [PROF[0][1], PROF[0][2]];
    for (let i = 0; i < PROF.length - 1; i++) {
      const a = PROF[i];
      const c = PROF[i + 1];
      if (y <= c[0]) {
        const f = (y - a[0]) / (c[0] - a[0]);
        return [a[1] + (c[1] - a[1]) * f, a[2] + (c[2] - a[2]) * f];
      }
    }
    const l = PROF[PROF.length - 1];
    return [l[1], l[2]];
  };
  const tf = (x: number, y: number, lift: number) => {
    const [rx, rz] = prof(y);
    return V(x, y, rz * Math.sqrt(Math.max(1 - (x / rx) ** 2, 0.02)) + lift);
  };
  const loopRing = (
    cx: number,
    cy: number,
    cz: number,
    rx: number,
    rz: number,
    r: number,
    color: C,
    bone: J,
  ) => {
    const pts = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return [cx + rx * Math.cos(a), cy, cz + rz * Math.sin(a)];
    });
    return b.sweep(catmull(pts, { closed: true }), r, { color, bone, sides: 6 });
  };
  const legAxis = (s: number, y: number): [number, number] => {
    if (y >= 0.52) {
      const f = (0.95 - y) / 0.43;
      return [s * (0.1 + 0.015 * f), 0.045 * f];
    }
    const f = (0.52 - y) / 0.425;
    return [s * (0.115 + 0.01 * f), 0.045 - 0.05 * f];
  };
  const gem = (at: number[], bone: J, size = 0.012) =>
    glow(b.part(new THREE.OctahedronGeometry(size, 0), GEM, { at, bone, scale: [1, 1.3, 0.8] }));
  const diamond = (w: number, h: number): OutlinePoint[] => [
    [-w, 0, "sharp"],
    [0, h, "sharp"],
    [w, 0, "sharp"],
    [0, -h * 1.1, "sharp"],
  ];

  // ---------------------------------------------------------------- torso
  b.sweep(
    catmull([
      [0, 0.88, 0],
      [0, 1.05, 0],
      [0, 1.2, 0],
      [0, 1.35, 0],
      [0, 1.5, 0],
    ]),
    (t) => {
      const r = prof(0.88 + 0.62 * t);
      return [r[0], r[1]];
    },
    { bone: [hips, spine], color: paint((p) => (p.y < 1.07 ? PANTS : GREEN)) },
  );
  b.sweep(neck, [0.048, 0.04], { color: SKIN });

  // leather corset with lacing
  const corsetPaint = paint((p, n) => {
    const lace = Math.abs(p.x) < 0.011 && n.z > 0.2 && (((p.y / 0.018) % 1) + 1) % 1 < 0.45;
    return lace ? CREAM : LEATHER;
  });
  const corset = b.sweep(
    catmull([
      [0, 1.14, 0],
      [0, 1.255, 0],
      [0, 1.37, 0],
    ]),
    (t) => {
      const r = prof(1.14 + 0.23 * t);
      return [r[0] + 0.01, r[1] + 0.01];
    },
    { bone: spine.joints[1], color: corsetPaint, caps: "flat" },
  );
  for (const s of [1, -1])
    b.decal(corset, VINE, {
      at: [s * 0.062, 1.255, 0.09],
      dir: [0, 0, 1],
      size: [0.06, 0.13],
      mirror: s > 0,
      bone: spine.joints[1],
    });

  // belts
  for (const [y, r, col] of [
    [1.08, 0.016, LEATHERD],
    [1.045, 0.01, LEATHER],
  ] as const) {
    const pr = prof(y);
    loopRing(0, y, 0.003, pr[0] + 0.008, pr[1] + 0.008, r, col, hips);
  }
  b.extrude(diamond(0.03, 0.036), {
    at: [0, 1.08, 0.125],
    x: [1, 0, 0],
    thickness: 0.012,
    color: GOLDC,
    bone: hips,
  });
  gem([0, 1.085, 0.134], hips, 0.01);

  // harness straps across the chest
  const strapA = catmull(Array.from({ length: 6 }, (_, i) => tf(-0.11 + (0.25 * i) / 5, 1.38 - (0.35 * i) / 5, 0.019)));
  b.sweep(strapA, 0.011, { color: LEATHERD, bone: spine.joints[1], sides: 6 });
  const strapB = catmull(Array.from({ length: 6 }, (_, i) => tf(0.1 - (0.22 * i) / 5, 1.37 - (0.25 * i) / 5, 0.02)));
  b.sweep(strapB, 0.008, { color: LEATHER, bone: spine.joints[1], sides: 6 });
  const mid = tf(0.015, 1.205, 0.03);
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.01), GOLD, { at: mid, bone: spine.joints[1] });
  b.part(new THREE.BoxGeometry(0.018, 0.018, 0.012), "#3a2a1c", { at: mid.clone().add(V(0, 0, 0.003)), bone: spine.joints[1] });

  // capelet, rim and clasp
  const capelet = b.lathe(
    [
      [0.11, 0.12],
      [0.2, 0.05],
      [0.25, -0.04],
      [0.24, -0.052],
      [0.19, 0.02],
      [0.1, 0.1],
    ],
    { at: [0, 1.44, 0], bone: chest, segments: 14, color: GREEN },
  );
  capelet.scale.set(1, 1, 0.72);
  loopRing(0, 1.395, 0, 0.243, 0.175, 0.007, GOLD, chest);
  b.extrude(diamond(0.022, 0.028), { at: [0, 1.42, 0.178], x: [1, 0, 0], thickness: 0.01, color: GOLDC, bone: chest });
  gem([0, 1.425, 0.186], chest, 0.009);

  // cloak plate hanging behind
  const CN = V(0, -0.287, 0.958);
  const capePaint = paint((_p, n, s) => {
    if (Math.abs(n.dot(CN)) < 0.5) return "#a8873a";
    const f = Math.sin(s[0] * 18 + Math.sin(s[1] * 4) * 1.5 + s[1] * 3);
    if (s[1] < -0.9) return "#27411f";
    return f > 0.5 ? "#2b4527" : f < -0.5 ? "#3f6537" : "#35542f";
  });
  const capeOutline: OutlinePoint[] = [
    [-0.18, 0],
    [0.18, 0],
    [0.26, -0.25],
    [0.36, -0.6],
    [0.46, -0.9],
    [0.52, -1.08, "sharp"],
    [0.36, -0.97],
    [0.28, -1.14, "sharp"],
    [0.12, -1.0],
    [0.0, -1.16, "sharp"],
    [-0.14, -0.98],
    [-0.28, -1.12, "sharp"],
    [-0.38, -0.96],
    [-0.52, -1.07, "sharp"],
    [-0.46, -0.9],
    [-0.36, -0.6],
    [-0.26, -0.25],
  ];
  b.extrude(capeOutline, {
    at: [0, 1.47, -0.15],
    x: [1, 0, 0],
    y: [0, 1, 0.3],
    thickness: 0.012,
    color: capePaint,
    bone: chest,
  });
  const NOUT = V(0, 0.287, -0.958);
  const capePt = (x: number, L: number) => V(x, 1.47 - 0.958 * L, -0.15 - 0.287 * L).addScaledVector(NOUT, 0.01);
  b.part(new THREE.PlaneGeometry(0.38, 0.7), "#ffffff", { at: capePt(0, 0.5), dir: NOUT, axis: "z", texture: VINE, bone: chest });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.18, 0.45), "#ffffff", {
      at: capePt(s * 0.27, 0.72),
      dir: NOUT,
      axis: "z",
      texture: VINE,
      bone: chest,
    });

  // tunic panels
  const panel = (outline: OutlinePoint[], at: number[], yd: number[], sign: number, texAt: [number, number], texSize: [number, number]) => {
    const Yd = V(yd[0], yd[1], yd[2]).normalize();
    const Xd = V(1, 0, 0);
    const N = Xd.clone().cross(Yd).normalize().multiplyScalar(sign);
    const base = V(at[0], at[1], at[2]);
    const pt = (o: number[], off: number) => base.clone().addScaledVector(Xd, o[0]).addScaledVector(Yd, o[1]).addScaledVector(N, off);
    b.extrude(outline, { at, x: [1, 0, 0], y: yd, thickness: 0.012, color: GREEN, bone: hips });
    for (let i = 1; i < outline.length; i++) {
      const a = outline[i];
      const c = outline[(i + 1) % outline.length];
      b.rod(pt(a, 0.008), pt(c, 0.008), 0.0045, GOLD, { bone: hips, sides: 5 });
    }
    b.part(new THREE.PlaneGeometry(texSize[0], texSize[1]), "#ffffff", {
      at: pt(texAt, 0.0095),
      dir: N,
      axis: "z",
      texture: VINE,
      bone: hips,
    });
  };
  panel(
    [
      [0, 0],
      [0.17, 0],
      [0.2, -0.25],
      [0.13, -0.56, "sharp"],
      [0.05, -0.3],
    ],
    [0, 1.075, 0.118],
    [0, 1, -0.12],
    1,
    [0.11, -0.27],
    [0.07, 0.2],
  );
  panel(
    [
      [0, 0],
      [-0.17, 0],
      [-0.2, -0.2],
      [-0.12, -0.46, "sharp"],
      [-0.04, -0.28],
    ],
    [0, 1.075, 0.122],
    [0, 1, -0.12],
    1,
    [-0.1, -0.22],
    [0.06, 0.17],
  );
  panel(
    [
      [-0.14, 0],
      [0.14, 0],
      [0.17, -0.3],
      [0, -0.55, "sharp"],
      [-0.17, -0.3],
    ],
    [0, 1.075, -0.115],
    [0, 1, 0.14],
    -1,
    [0, -0.27],
    [0.08, 0.2],
  );

  // dagger and pouch
  b.rod([0.215, 1.03, 0.07], [0.245, 0.76, 0.12], [0.022, 0.016], LEATHERD, { bone: hips, sides: 6 });
  b.rod([0.2, 1.0, 0.075], [0.23, 0.95, 0.083], 0.0245, GOLD, { bone: hips, sides: 6 });
  b.rod([0.241, 0.8, 0.113], [0.246, 0.755, 0.121], 0.0185, GOLD, { bone: hips, sides: 6 });
  b.rod([0.2, 1.03, 0.065], [0.19, 1.12, 0.045], 0.0135, "#2f3b2a", { bone: hips, sides: 6 });
  b.part(new THREE.BoxGeometry(0.065, 0.01, 0.014), GOLD, { at: [0.205, 1.036, 0.067], bone: hips });
  gem([0.188, 1.13, 0.043], hips, 0.011);
  b.part(new THREE.BoxGeometry(0.05, 0.09, 0.075), LEATHER, { at: [-0.2, 1.0, 0.04], bone: hips });
  b.part(new THREE.BoxGeometry(0.052, 0.035, 0.078), LEATHERL, { at: [-0.2, 1.03, 0.04], bone: hips });
  b.part(new THREE.BoxGeometry(0.01, 0.022, 0.014), GOLD, { at: [-0.228, 1.0, 0.04], bone: hips });

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = V(s * 0.1, 0.95, 0);
    const knee = V(s * 0.115, 0.52, 0.045);
    const ankle = V(s * 0.125, 0.095, -0.005);
    const toe = V(s * 0.13, 0.045, 0.2);
    const leg = b.chain(`leg${S}`, polyline([hip, knee, ankle, toe]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`],
      role: "leg",
    });
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];
    b.sweep(leg, [0.092, 0.08, 0.064, 0.054, 0.047], { color: PANTS, to: 0.8 });

    // thigh straps
    for (const y of [0.78, 0.67]) {
      const [ax, az] = legAxis(s, y);
      loopRing(ax, y, az, 0.088, 0.088, 0.008, LEATHERD, kneeJ);
      b.part(new THREE.BoxGeometry(0.022, 0.02, 0.012), GOLD, { at: [ax, y, az + 0.09], bone: kneeJ });
    }
    // knee guard
    const [kx] = legAxis(s, 0.55);
    b.extrude(diamond(0.04, 0.055), { at: [kx, 0.55, 0.108], x: [1, 0, 0], thickness: 0.012, color: GOLDC, bone: kneeJ });
    gem([kx, 0.55, 0.12], kneeJ, 0.009);

    // boot
    const [tx, tz] = legAxis(s, 0.47);
    b.rod([tx, 0.47, tz], [s * 0.125, 0.08, -0.005], [0.07, 0.054], BOOT, { bone: kneeJ });
    b.rod([tx, 0.47, tz], [tx, 0.4, tz], [0.088, 0.08], LEATHERL, { bone: kneeJ });
    loopRing(tx, 0.47, tz, 0.088, 0.088, 0.0055, GOLD, kneeJ);
    loopRing(tx, 0.4, tz, 0.08, 0.08, 0.0055, GOLD, kneeJ);
    const [cx, cz] = legAxis(s, 0.43);
    b.extrude(diamond(0.025, 0.036), { at: [cx, 0.425, cz + 0.088], x: [1, 0, 0], thickness: 0.01, color: GOLDC, bone: kneeJ });
    const [ax, az] = legAxis(s, 0.15);
    loopRing(ax, 0.15, az, 0.06, 0.06, 0.007, LEATHERD, ankleJ);
    b.part(new THREE.BoxGeometry(0.016, 0.016, 0.01), GOLD, { at: [ax, 0.15, az + 0.063], bone: ankleJ });
    b.sweep(
      catmull([
        [s * 0.125, 0.065, -0.03],
        [s * 0.127, 0.048, 0.11],
        [s * 0.13, 0.034, 0.22],
      ]),
      [0.052, 0.044, 0.03],
      { color: BOOT, bone: ankleJ, caps: { start: "round", end: "point" }, sides: 8 },
    );
    b.part(new THREE.BoxGeometry(0.075, 0.034, 0.07), LEATHERD, { at: [s * 0.125, 0.017, -0.04], bone: ankleJ });
    b.extrude(diamond(0.012, 0.018), { at: [s * 0.128, 0.058, 0.1], x: [1, 0, 0], thickness: 0.006, color: GOLDC, bone: ankleJ });
  }

  // ---------------------------------------------------------------- arms and hands
  const FN = ["index", "middle", "ring", "pinky"];
  const SC = [1, 1.08, 1, 0.82];
  const wristOf: Record<string, J> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.2, 1.45, 0);
    const el = V(s * 0.31, 1.17, 0);
    const wr = V(s * 0.38, 0.93, 0.08);
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const wrist = arm.tip!;
    wristOf[S] = wrist;
    b.sweep(arm, [0.044, 0.039, 0.034, 0.028], { color: CREAM });
    // green short sleeve
    const sleeveEnd = sh.clone().lerp(el, 0.55);
    b.rod(sh, sleeveEnd, [0.05, 0.044], GREEN, { bone: arm.joints[0] });
    b.rod(sleeveEnd, sleeveEnd.clone().lerp(el, 0.1), 0.0455, GOLD, { bone: arm.joints[0] });
    // bracer
    const d = wr.clone().sub(el).normalize();
    const b0 = el.clone().lerp(wr, 0.38);
    b.rod(b0, wr, [0.041, 0.034], LEATHER, { bone: arm.joints[1] });
    b.rod(b0, b0.clone().addScaledVector(d, 0.012), 0.0425, GOLD, { bone: arm.joints[1] });
    b.rod(wr.clone().addScaledVector(d, -0.012), wr, 0.035, GOLD, { bone: arm.joints[1] });
    b.extrude(diamond(0.012, 0.03), {
      at: b0.clone().lerp(wr, 0.5).add(V(s * 0.045, 0, 0.0)),
      x: [0, 0, 1],
      y: [d.x, d.y, d.z],
      thickness: 0.006,
      color: GOLDC,
      bone: arm.joints[1],
    });
    // hand
    b.part(new THREE.BoxGeometry(0.07, 0.08, 0.034), LEATHERD, {
      at: wr.clone().addScaledVector(d, 0.04),
      dir: d,
      bone: wrist,
    });
    FN.forEach((fname, i) => {
      const ox = (i - 1.5) * 0.0165;
      const start = wr.clone().addScaledVector(d, 0.078).add(V(ox, 0, 0));
      const sc = SC[i];
      let p1: THREE.Vector3;
      let p2: THREE.Vector3;
      if (s > 0) {
        p1 = start.clone().add(V(0, -0.012 * sc, 0.052 * sc));
        p2 = p1.clone().add(V(0, 0.032 * sc, 0.023 * sc));
      } else {
        p1 = start.clone().addScaledVector(d, 0.034 * sc).add(V(0, 0, 0.006));
        p2 = p1.clone().addScaledVector(d, 0.024 * sc).add(V(0, 0, 0.016));
      }
      const fc = b.chain(`${fname}${S}`, polyline([start, p1, p2]), {
        parent: wrist,
        names: [`${fname}${S}1`, `${fname}${S}2`, `${fname}${S}3`],
        role: "digit",
      });
      b.sweep(fc, [0.0092, 0.0066], { bands: [[0.5, LEATHERD], [1, SKIN]], sides: 6 });
    });
    const t0 = wr.clone().addScaledVector(d, 0.04).add(V(-s * 0.034, 0, 0.02));
    let t1: THREE.Vector3;
    let t2: THREE.Vector3;
    if (s > 0) {
      t1 = t0.clone().add(V(0.004, -0.01, 0.048));
      t2 = t1.clone().add(V(0.012, 0.018, 0.02));
    } else {
      t1 = t0.clone().addScaledVector(d, 0.03).add(V(-s * 0.006, 0, 0.012));
      t2 = t1.clone().addScaledVector(d, 0.022).add(V(0, 0, 0.016));
    }
    const th = b.chain(`thumb${S}`, polyline([t0, t1, t2]), {
      parent: wrist,
      names: [`thumb${S}1`, `thumb${S}2`, `thumb${S}3`],
      role: "digit",
    });
    b.sweep(th, [0.0105, 0.0075], { bands: [[0.45, LEATHERD], [1, SKIN]], sides: 6 });
  }

  // ---------------------------------------------------------------- bow (left hand)
  const wl = wristOf.L;
  const bowPath = catmull([
    [0.4, 0.06, -0.1],
    [0.4, 0.45, 0.05],
    [0.4, 0.88, 0.125],
    [0.4, 1.32, 0.05],
    [0.4, 1.66, -0.1],
  ]);
  const BOWG = cel("#2d5f3f", "#1f4430");
  const bowPaint = paint((_p, n, s) => {
    const t = s[0];
    const ring = [0.2, 0.8].some((c) => Math.abs(t - c) < 0.012) || [0.33, 0.67].some((c) => Math.abs(t - c) < 0.008);
    if (ring) return GOLD;
    if (n.z > 0.78) return "#c99f45";
    return BOWG;
  });
  b.sweep(bowPath, [0.006, 0.012, 0.017, 0.02, 0.017, 0.012, 0.006], {
    bone: wl,
    bands: [
      [0.07, GOLD],
      [0.93, bowPaint],
      [1, GOLD],
    ],
    sides: 8,
  });
  b.rod([0.4, 0.8, 0.123], [0.4, 0.96, 0.123], 0.024, LEATHERD, { bone: wl, sides: 8 });
  b.rod([0.4, 0.795, 0.123], [0.4, 0.805, 0.123], 0.0255, GOLD, { bone: wl, sides: 8 });
  b.rod([0.4, 0.955, 0.123], [0.4, 0.965, 0.123], 0.0255, GOLD, { bone: wl, sides: 8 });
  b.rod([0.4, 0.06, -0.1], [0.4, 1.66, -0.1], 0.0025, "#efe8d4", { bone: wl, sides: 4 });
  for (const t of [0.3, 0.7, 0.14, 0.86]) {
    const p = bowPath.at(t);
    gem([p.x, p.y, p.z + 0.018], wl, t === 0.3 || t === 0.7 ? 0.011 : 0.008);
  }

  // ---------------------------------------------------------------- quiver and arrows
  const B = V(-0.12, 1.08, -0.41);
  const T = V(-0.19, 1.55, -0.37);
  const a = T.clone().sub(B).normalize();
  const QUIV = cel("#7b5636", "#523720");
  b.rod(B, T, [0.058, 0.07], QUIV, {
    bone: chest,
    bands: [
      [0.07, GOLD],
      [0.45, QUIV],
      [0.5, GOLD],
      [0.93, QUIV],
      [1, GOLD],
    ],
  });
  const au = V(1, 0, 0).addScaledVector(a, -a.x).normalize();
  const av = a.clone().cross(au).normalize();
  const rnd = rng(7);
  for (let k = 0; k < 8; k++) {
    const th = (k / 8) * Math.PI * 2 + 0.3;
    const rr = 0.016 + 0.024 * rnd();
    const p = T.clone().addScaledVector(au, Math.cos(th) * rr).addScaledVector(av, Math.sin(th) * rr);
    const top = p.clone().addScaledVector(a, 0.14 + 0.09 * rnd());
    b.rod(p.clone().addScaledVector(a, -0.12), top, 0.0042, "#8b6a46", { bone: chest, sides: 5 });
    const vane: OutlinePoint[] = [
      [0, -0.012],
      [0.055, -0.014],
      [0.075, 0],
      [0.055, 0.014],
      [0, 0.012],
    ];
    const at = top.clone().addScaledVector(a, -0.075);
    const col = k % 2 ? "#efe6cf" : "#6d8f5a";
    b.extrude(vane, { at: [at.x, at.y, at.z], x: [a.x, a.y, a.z], y: [au.x, au.y, au.z], thickness: 0.002, color: col, bone: chest });
    b.extrude(vane, { at: [at.x, at.y, at.z], x: [a.x, a.y, a.z], y: [av.x, av.y, av.z], thickness: 0.002, color: col, bone: chest });
  }
  gem([B.x, B.y + 0.03, B.z - 0.065], chest, 0.011);

  // ---------------------------------------------------------------- head
  const HC = V(0, 1.77, 0.04);
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, {
    at: [HC.x, HC.y, HC.z],
    bone: head,
    scale: [0.088, 0.103, 0.098],
  });
  const jawPart = b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    at: [0, 1.705, 0.052],
    bone: jaw,
    scale: [0.068, 0.05, 0.068],
  });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 27, -3);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.042, 0.058], mirror: s > 0 });
  }
  const face = b.surface([skull, jawPart]);
  const nose = face.ray([0, 1.74, 0.5], [0, 0, -1]);
  if (nose) b.stick(new THREE.SphereGeometry(0.009, 6, 4), "#e8b99a", nose, { embed: 0.3 });
  const mouth = face.ray([0, 1.7, 0.5], [0, 0, -1]);
  if (mouth) b.stick(new THREE.BoxGeometry(0.024, 0.004, 0.004), "#b86a62", mouth, { embed: 0.4 });

  // ears
  const ear: OutlinePoint[] = [
    [0, 0],
    [0.05, 0.03],
    [0.14, 0.095, "sharp"],
    [0.07, -0.005],
    [0.025, -0.045],
  ];
  for (const s of [1, -1])
    b.extrude(ear, { at: [s * 0.083, 1.74, 0], x: [s, 0, -0.3], thickness: 0.008, color: SKIN, bone: head });

  // hair cap and circlet
  const cap = b.part(new THREE.SphereGeometry(1, 14, 9, 0, Math.PI * 2, 0, 1.55), HAIR, {
    at: [0, 1.785, 0.03],
    rotation: [-30, 0, 0],
    scale: [0.098, 0.11, 0.112],
    bone: head,
  });
  const scalp = b.surface([skull, cap]);
  const ringPts = Array.from({ length: 16 }, (_, i) => {
    const an = (i / 16) * Math.PI * 2;
    return [0.125 * Math.cos(an), 1.845, 0.03 + 0.13 * Math.sin(an)];
  });
  b.sweep(scalp.drape(catmull(ringPts, { closed: true }), { lift: 0.003 }), 0.0045, { color: GOLD, sides: 5 });
  const brow = scalp.ray([0, 1.85, 0.5], [0, 0, -1]);
  if (brow) glow(b.stick(new THREE.OctahedronGeometry(0.016, 0), GEM, brow, { embed: 0.3 }));

  // forehead tufts and side locks
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [0, 1.86, 0.07],
        [s * 0.06, 1.8, 0.105],
        [s * 0.085, 1.745, 0.06],
      ]),
      [0.018, 0.002],
      { color: HAIR, bone: head, sides: 6 },
    );
  b.sweep(
    catmull([
      [0.095, 1.84, 0.04],
      [0.12, 1.7, 0.07],
      [0.16, 1.55, 0.13],
      [0.18, 1.38, 0.14],
      [0.17, 1.2, 0.12],
    ]),
    (t) => [0.028 * (1 - 0.7 * t * t), 0.014],
    { color: HAIR, bone: head, sides: 6, caps: { start: "round", end: "point" } },
  );
  // braid on the right
  const braid = catmull([
    [-0.095, 1.76, 0.02],
    [-0.115, 1.68, 0.06],
    [-0.13, 1.58, 0.1],
    [-0.14, 1.46, 0.13],
    [-0.145, 1.36, 0.14],
  ]);
  b.sweep(braid, 0.014, { color: HAIR, bone: head, sides: 6 });
  for (const t of [0.25, 0.5, 0.75, 1])
    b.part(new THREE.SphereGeometry(0.0165, 6, 4), GOLD, { at: braid.at(t), bone: head });

  // long back hair
  const capeZ = (y: number) => -0.15 - (1.47 - y) * 0.3;
  const hz = (y: number) => capeZ(Math.min(y, 1.47)) - 0.04;
  for (let i = 0; i < 13; i++) {
    const u = i / 12 - 0.5;
    const xs = u * 0.2;
    const w1 = Math.sin(i * 1.7) * 0.018;
    const w2 = Math.cos(i * 2.3) * 0.025;
    const endY = 0.98 + 0.4 * Math.abs(u) + 0.03 * Math.sin(i * 3.1);
    b.sweep(
      catmull([
        [xs * 0.9, 1.87, -0.07],
        [xs * 1.15, 1.78, -0.125],
        [xs * 1.5, 1.62, -0.15],
        [xs * 1.8 + w1, 1.45, hz(1.45)],
        [xs * 2.1 + w1 * 1.5, 1.32, hz(1.32)],
        [xs * 2.3 + w2, endY, hz(endY)],
      ]),
      (t) => [0.03 * (1 - 0.6 * t * t), 0.011 * (1 - 0.4 * t)],
      { color: HAIR, bone: head, sides: 6, caps: { start: "round", end: "point" } },
    );
  }

  return b.root;
}
