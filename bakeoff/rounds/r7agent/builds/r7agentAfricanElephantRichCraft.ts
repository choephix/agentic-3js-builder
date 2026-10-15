import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { cells, mix, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult bull African bush elephant in faceted low-poly: crackled dusty hide, fan ears with veined inner flaps, ripple-ringed trunk, long curved tusks, toenailed feet and a bristle-tufted tail, on a full quadruped rig.",
  style: "low-poly",
  commit: "88fc1f0",
};

// Palette ---------------------------------------------------------------------------------------------------------
const SKIN = "#928b81";
const SKIN_D = "#6e675f";
const CRACK = "#463f39";
const DUST = "#b0926d";
const BELLY = "#a89a8f";
const PINK = "#b99d94";
const NAIL = "#dcd2bd";
const SOLE = "#554f48";
const FOLD = "#5b544d";
const IVORY = "#efe4c6";
const IVORY_D = "#c3a874";
const HAIR = "#2f2822";
const EYE = "#b9853a";
const PUPIL = "#1b110c";
const MOUTH = "#4a2a2e";

type Key = readonly [number, number, number];

/** Smooth piecewise profile through [t, rx, ry] keys. */
function ramp(keys: readonly Key[]) {
  return (t: number): [number, number] => {
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const c = keys[i + 1];
      if (t <= c[0] || i === keys.length - 2) {
        const u = smoothstep(a[0], c[0], t);
        return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      }
    }
    return [keys[0][1], keys[0][2]];
  };
}

export default function build() {
  const b = createBuilder({ name: "africanElephant", paintSize: 2048 });
  const r = rng(11);
  const side = (s: number) => (s > 0 ? "L" : "R");

  // Paints ----------------------------------------------------------------------------------------------------------
  const skin = paint((p, n) => {
    const big = cells(p, 0.36, 5);
    const fine = cells(p, 0.14, 9);
    const crack1 = smoothstep(0.0, 0.09, big.d2 - big.d1);
    const crack2 = smoothstep(0.0, 0.12, fine.d2 - fine.d1);
    const tone = noise(p, 0.8, 3);
    let c = mix(SKIN_D, SKIN, Math.min(1, Math.max(0, tone * 0.95 + (big.id - 0.5) * 0.4 + 0.08)));
    const belly = smoothstep(-0.1, -0.85, n.y) * 0.55;
    c = mix(c, BELLY, belly);
    const dust =
      smoothstep(1.8, 0.1, p.y) * (0.5 + 0.5 * noise(p, 0.35, 8)) * 0.85 +
      smoothstep(2.6, 3.5, p.y) * Math.max(0, n.y) * 0.18;
    c = mix(c, DUST, Math.min(1, dust));
    const groove = mix(CRACK, "#6c5a46", Math.min(1, dust));
    c = mix(groove, c, 0.35 + 0.65 * crack1);
    c = mix(mix(c, groove, 0.45), c, 0.55 + 0.45 * crack2);
    return c;
  });

  const jawSkin = paint((p, n) => mix(resolve(skin, p, n), PINK, 0.4));

  const trunkPath = catmull([
    [0, 2.5, 2.35],
    [0, 2.1, 2.9],
    [0, 1.55, 3.15],
    [0, 0.95, 3.2],
    [0, 0.52, 3.3],
    [0, 0.3, 3.55],
  ]);
  const TRUNK_LEN = trunkPath.length;
  const trunkSkin = paint((p, n, s) => {
    const base = resolve(skin, p, n);
    const ring = Math.abs(Math.sin((s[0] * TRUNK_LEN * Math.PI) / 0.085));
    const groove = 1 - smoothstep(0.0, 0.28, ring);
    let c = mix(base, CRACK, 0.5 * groove);
    c = mix(c, PINK, smoothstep(0.72, 0.95, s[0]) * smoothstep(0.3, -0.6, n.y) * 0.85);
    return c;
  });

  const earOuter = paint((p, n) => mix(resolve(skin, p, n), PINK, 0.15));
  const earInner = paint((p, n, s) => {
    const a = Math.atan2(s[1] + 0.35, s[0] + 0.02);
    const wob = noise(p, 0.25, 4) * 1.4;
    const vein = Math.abs(Math.sin(a * 17 + wob * 3));
    const base = mix(resolve(skin, p, n), PINK, 0.5);
    const mottled = mix(base, "#a98c86", noise(p, 0.3, 6) * 0.6);
    return mix("#6f5853", mottled, 0.45 + 0.55 * smoothstep(0.0, 0.25, vein));
  });

  const ivory = paint((p, _n, s) => {
    const stain = smoothstep(0.62, 1.0, s[0]) * 0.8 + noise(p, 0.12, 2) * 0.35;
    const root = 1 - smoothstep(0.0, 0.12, s[0]);
    const streak = Math.abs(Math.sin(s[1] * 0.35 + noise(p, 0.3, 5) * 4));
    let c = mix(IVORY, IVORY_D, Math.min(1, stain));
    c = mix(c, "#9d8454", (1 - smoothstep(0.0, 0.18, streak)) * 0.35);
    c = mix(c, "#6b5a42", root * 0.8);
    return c;
  });

  // Skeleton --------------------------------------------------------------------------------------------------------
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.42, -1.15],
      [0, 2.3, -0.5],
      [0, 2.32, 0.1],
      [0, 2.42, 0.5],
    ]),
    { names: ["hips", "spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[3];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.45, 0.5],
      [0, 2.55, 0.95],
      [0, 2.62, 1.4],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck", group: "head" },
  );
  const head = b.joint("head", { at: neck.at(1), aim: [0, 2.5, 2.4], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.0, 1.75], aim: [0, 1.8, 2.5], role: "jaw", group: "head" });

  // Body and neck ---------------------------------------------------------------------------------------------------
  const body = b.sweep(
    spine,
    ramp([
      [0, 0.8, 0.8],
      [0.2, 0.92, 0.85],
      [0.5, 0.96, 0.86],
      [0.8, 0.92, 0.84],
      [1, 0.82, 0.8],
    ]),
    { color: skin, sides: 8, smooth: false, name: "body", group: "body" },
  );
  b.sweep(
    neck,
    ramp([
      [0, 0.8, 0.8],
      [1, 0.72, 0.82],
    ]),
    { color: skin, sides: 8, smooth: false, name: "neck", group: "head" },
  );

  // Head ------------------------------------------------------------------------------------------------------------
  const skull = b.loft(
    [
      { at: [0, 2.62, 1.3], w: 1.05, h: 1.4 },
      { at: [0, 2.72, 1.8], w: 1.12, h: 1.5 },
      { at: [0, 2.58, 2.25], w: 0.92, h: 1.25 },
      { at: [0, 2.42, 2.58], w: 0.66, h: 0.85 },
    ],
    { bone: head, color: skin, sides: 8, smooth: false, name: "skull", group: "head" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 5), skin, {
      bone: head,
      at: [s * 0.3, 3.2, 1.95],
      scale: [0.4, 0.3, 0.42],
      flat: true,
      name: `forehead${side(s)}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), skin, {
      bone: head,
      at: [s * 0.48, 2.3, 2.05],
      scale: [0.26, 0.3, 0.4],
      flat: true,
      name: `cheek${side(s)}`,
    });
  }

  // Jaw and mouth
  b.loft(
    [
      { at: [0, 1.86, 1.8], w: 0.7, h: 0.42 },
      { at: [0, 1.82, 2.2], w: 0.58, h: 0.36 },
      { at: [0, 1.8, 2.5], w: 0.38, h: 0.3 },
    ],
    { bone: jaw, color: jawSkin, sides: 8, smooth: false, name: "jaw", group: "head" },
  );
  b.part(new THREE.BoxGeometry(0.46, 0.1, 0.55), MOUTH, { bone: head, at: [0, 1.98, 2.3], name: "mouth" });
  b.part(new THREE.BoxGeometry(0.3, 0.05, 0.4), "#b36a72", { bone: jaw, at: [0, 2.02, 2.2], name: "tongue" });

  // Eyes and brow
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.nearest([s * 0.62, 2.52, 2.0]);
    b.stick(new THREE.SphereGeometry(0.05, 6, 4), EYE, hit, { embed: 0.55, flat: true, name: `iris${side(s)}` });
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), PUPIL, hit.moved([0, 0.03, 0]), {
      embed: 0.3,
      flat: true,
      name: `pupil${side(s)}`,
    });
    const lid = hit.moved([0, 0.004, 0]);
    b.sweep(
      catmull(b.ring(lid, { count: 10, radius: 0.075 }).items, { closed: true }),
      0.017,
      { color: SKIN_D, sides: 4, smooth: false, name: `lid${side(s)}`, group: "head" },
    );
    b.ring(hit.moved([0, 0.012, 0]), { count: 7, radius: 0.075, fromDeg: -75, toDeg: 75, tilt: 25 }, (lash) =>
      b.spike(lash, lash, 0.075, 0.007, { color: HAIR, sides: 4 }),
    );
    b.capsule([s * 0.6, 2.7, 1.92], [s * 0.56, 2.68, 2.18], 0.045, {
      color: skin,
      sides: 6,
      smooth: false,
      name: `brow${side(s)}`,
      group: "head",
    });
  }

  // Tusks
  for (const s of [1, -1]) {
    const root = skullSkin.nearest([s * 0.34, 2.0, 2.4]);
    const path = catmull([root, [s * 0.43, 1.78, 2.95], [s * 0.5, 1.55, 3.5], [s * 0.46, 1.5, 4.0], [s * 0.36, 1.62, 4.45]]);
    b.sprout(`tusk${side(s)}`, root, path, [0.09, 0.012], {
      count: 1,
      color: ivory,
      sides: 8,
      smooth: false,
      caps: { end: "point" },
      group: "head",
      name: `tusk${side(s)}`,
    });
    b.sweep(path.slice(0, 0.1), [0.13, 0.118], {
      bone: head,
      color: PINK,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: `tuskSleeve${side(s)}`,
      group: "head",
    });
  }

  // Trunk -----------------------------------------------------------------------------------------------------------
  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    count: 8,
    names: (i) => `trunk${i + 1}`,
    role: "tentacle",
    group: "trunk",
  });
  const trunkProf = ramp([
    [0, 0.4, 0.34],
    [0.25, 0.27, 0.25],
    [0.6, 0.18, 0.17],
    [0.9, 0.125, 0.12],
    [1, 0.11, 0.105],
  ]);
  const trunkTube = b.sweep(
    trunk,
    (t) => {
      const [rx, ry] = trunkProf(t);
      const rip = 1 + 0.05 * Math.cos((2 * Math.PI * t * TRUNK_LEN) / 0.2) * smoothstep(0.05, 0.2, t);
      return [rx * rip, ry * rip];
    },
    { color: trunkSkin, sides: 10, smooth: false, caps: "flat", name: "trunk", group: "trunk" },
  );
  const tip = trunk.at(1);
  b.part(new THREE.CylinderGeometry(0.115, 0.125, 0.06, 10), PINK, { frame: tip.moved([0, 0.02, 0]), flat: true, name: "nosePad" });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 6), MOUTH, {
      frame: tip.moved([s * 0.05, 0.052, 0]),
      flat: true,
      name: `nostril${side(s)}`,
    });
  b.spike(tip.moved([0, 0.03, 0.085]), tip, 0.1, 0.05, { color: PINK, sides: 6, smooth: false, name: "fingerUp", group: "trunk" });
  b.spike(tip.moved([0, 0.03, -0.085]), tip, 0.06, 0.04, { color: PINK, sides: 6, smooth: false, name: "fingerDown", group: "trunk" });
  // trunk wrinkle rings near the root
  for (const t of [0.07, 0.13, 0.19]) {
    const ringPath = b.surface(trunkTube).loop(trunk.at(t), { lift: 0.008 });
    b.sweep(ringPath, 0.014, { color: FOLD, sides: 4, smooth: false, name: `trunkFold${t}`, group: "trunk" });
  }

  // Ears ------------------------------------------------------------------------------------------------------------
  const K = 0.9;
  const earOutline = (c: number): [number, number, "sharp"?][] => {
    const pts: [number, number, "sharp"?][] = [
      [0.0, 0.32],
      [0.3, 0.46],
      [0.7, 0.44],
      [1.05, 0.28],
      [1.2, -0.02],
      [1.17, -0.4],
      [1.0, -0.78],
      [0.78, -1.1],
      [0.55, -1.35, "sharp"],
      [0.4, -1.0],
      [0.22, -0.7],
      [0.0, -0.5],
    ];
    const cx = 0.55;
    const cy = -0.35;
    return pts.map(([x, y, f]) => {
      const nx = (cx + (x - cx) * c) * K;
      const ny = (cy + (y - cy) * c) * K;
      return f ? [nx, ny, f] : [nx, ny];
    });
  };
  for (const s of [1, -1]) {
    const at: [number, number, number] = [s * 0.5, 3.02, 1.45];
    const ear = b.joint(`ear${side(s)}`, { parent: head, at, dir: [s * 0.8, 0, -0.6], role: "hinge", group: "ear" });
    const X: [number, number, number] = [s * 0.8, 0, -0.6];
    b.extrude(earOutline(1), {
      at,
      x: X,
      y: [0, 1, 0],
      thickness: [0.03, 0.06],
      bevel: 0.012,
      smoothing: 1,
      color: earOuter,
      bone: ear,
      name: `ear${side(s)}`,
      group: "ear",
    });
    b.extrude(earOutline(0.8), {
      at,
      x: X,
      y: [0, 1, 0],
      thickness: [0.04, 0.07],
      bevel: 0.006,
      smoothing: 1,
      color: earInner,
      bone: ear,
      name: `earInner${side(s)}`,
      group: "ear",
    });
    b.capsule([s * 0.52, 3.14, 1.45], [s * 0.54, 2.35, 1.58], 0.1, {
      color: skin,
      sides: 8,
      smooth: false,
      bone: head,
      name: `earRoot${side(s)}`,
      group: "ear",
    });
  }

  // Legs ------------------------------------------------------------------------------------------------------------
  const legProf = ramp([
    [0, 0.4, 0.4],
    [0.3, 0.37, 0.37],
    [0.5, 0.31, 0.33],
    [0.8, 0.28, 0.29],
    [1, 0.29, 0.29],
  ]);
  for (const s of [1, -1]) {
    const L = side(s);
    for (const front of [true, false]) {
      const rootPt: [number, number, number] = front ? [s * 0.52, 2.15, 0.7] : [s * 0.55, 2.15, -1.0];
      const foot: [number, number, number] = [rootPt[0], 0.2, rootPt[2] + (front ? 0.08 : -0.02)];
      const pts = limb(rootPt, foot, [1.0, 1.0], [0, 0, front ? -1 : 1]);
      const names = front ? [`shoulder${L}`, `elbow${L}`, `footF${L}`] : [`hip${L}`, `knee${L}`, `footH${L}`];
      const leg = b.chain(`leg${front ? "F" : "H"}${L}`, pts, {
        parent: front ? chest : hips,
        names,
        role: "leg",
        group: "legs",
        contact: [foot[0], 0, foot[2]],
      });
      const tube = b.sweep(leg, legProf, {
        color: skin,
        sides: 8,
        smooth: false,
        caps: "flat",
        name: `leg${front ? "F" : "H"}${L}`,
        group: "legs",
      });
      const footJoint = leg.tip!;
      b.part(new THREE.CylinderGeometry(0.3, 0.335, 0.22, 10, 1), skin, {
        bone: footJoint,
        at: [foot[0], 0.11, foot[2]],
        flat: true,
        name: `foot${front ? "F" : "H"}${L}`,
      });
      b.part(new THREE.CylinderGeometry(0.35, 0.36, 0.05, 10, 1), SOLE, {
        bone: footJoint,
        at: [foot[0], 0.025, foot[2]],
        flat: true,
        name: `sole${front ? "F" : "H"}${L}`,
      });
      const nailAngles = front ? [-48, -16, 16, 48] : [-32, 0, 32];
      for (const deg of nailAngles) {
        const a = (deg * Math.PI) / 180;
        b.part(new THREE.BoxGeometry(0.115, 0.125, 0.05), NAIL, {
          bone: footJoint,
          at: [foot[0] + Math.sin(a) * 0.33, 0.12, foot[2] + Math.cos(a) * 0.33],
          dir: [Math.sin(a) * 0.97, 0.12, Math.cos(a)],
          axis: "z",
          flat: true,
          name: `nail${front ? "F" : "H"}${L}${deg}`,
        });
      }
      // wrinkle folds at the elbow / knee and ankle
      const foldTs = front ? [0.46, 0.52, 0.9, 0.95] : [0.46, 0.52, 0.9, 0.95];
      for (const t of foldTs) {
        const loop = b.surface(tube).loop(leg.at(t), { lift: 0.01 });
        b.sweep(loop, 0.017, { color: FOLD, sides: 4, smooth: false, name: `fold${front ? "F" : "H"}${L}${t}`, group: "legs" });
      }
    }
  }

  // Tail ------------------------------------------------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.55, -1.9],
      [0, 2.15, -2.12],
      [0, 1.65, -2.17],
      [0, 1.2, -2.15],
      [0, 0.85, -2.12],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail", group: "tail" },
  );
  b.sweep(tail, [0.1, 0.04], { color: skin, sides: 6, smooth: false, caps: "flat", name: "tail", group: "tail" });
  const tailEnd = tail.at(1);
  b.ring(tailEnd, { count: 9, radius: 0.025, tilt: 60 }, (h) =>
    b.spike(h, h, 0.3, 0.02, { color: HAIR, sides: 4, smooth: false }),
  );
  b.ring(tailEnd, { count: 7, radius: 0.012, tilt: 28 }, (h) =>
    b.spike(h, h, 0.38, 0.018, { color: "#3a3028", sides: 4, smooth: false }),
  );
  b.spike(tailEnd, tailEnd, 0.4, 0.022, { color: HAIR, sides: 4, smooth: false });

  // Body surface detail ---------------------------------------------------------------------------------------------
  const bodySkin = b.surface(body);
  for (const s of [1, -1]) {
    const creases: number[][][] = [
      [[s * 1.0, 3.05, 0.35], [s * 1.05, 2.55, 0.25], [s * 1.0, 2.0, 0.4], [s * 0.85, 1.62, 0.6]],
      [[s * 0.98, 3.0, -1.45], [s * 1.02, 2.5, -1.55], [s * 0.95, 2.0, -1.45], [s * 0.8, 1.65, -1.2]],
      [[s * 0.9, 3.15, -0.35], [s * 1.0, 2.6, -0.45], [s * 0.98, 2.1, -0.35]],
    ];
    creases.forEach((pts, i) =>
      b.sweep(bodySkin.drape(catmull(pts), { lift: 0.01 }), [0.006, 0.024, 0.006], {
        color: FOLD,
        sides: 4,
        smooth: false,
        name: `crease${side(s)}${i}`,
        group: "body",
      }),
    );
  }
  b.along(body, 14, (at) =>
    b.stick(new THREE.ConeGeometry(0.1, 0.09, 6), SKIN_D, at, { embed: 0.4, flat: true, name: "spineBump" }),
  );
  for (const hit of bodySkin.scatter(70, { rng: r, minDist: 0.22, filter: (h) => h.at.y > 1.75 && Math.abs(h.n.x) > 0.2 || h.n.y > 0.5 }))
    b.stick(new THREE.IcosahedronGeometry(0.05 + r() * 0.03, 0), SKIN_D, hit, { embed: 0.5, flat: true, name: "wart" });

  // Neck folds under the head
  const neckSkin = b.surface(body);
  void neckSkin;

  // Bristles on the crown and trunk root
  const bristle = svg(`<svg viewBox="0 0 12 40"><path d="M6 0 L10.5 40 L1.5 40 Z" fill="#ffffff"/></svg>`, { size: 96 });
  const crown = skullSkin.scatter(60, {
    rng: rng(21),
    minDist: 0.12,
    filter: (h) => h.at.y > 3.0 && h.n.y > 0.35,
  });
  b.cards(crown, bristle, { size: [0.02, 0.1], lean: 50, bend: 20, vary: 0.3, rng: rng(22), color: "#3f362e", flow: [0, -0.3, -1] });
  const trunkRoot = b.surface(trunkTube).scatter(30, {
    rng: rng(23),
    minDist: 0.1,
    filter: (h) => h.at.y > 1.9 && h.n.y > 0.2,
  });
  b.cards(trunkRoot, bristle, { size: [0.018, 0.08], lean: 50, bend: 20, vary: 0.3, rng: rng(24), color: "#3f362e" });

  return b.root;
}
