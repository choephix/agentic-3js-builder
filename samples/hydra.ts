import { ConeGeometry, CylinderGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { countershade, scales, stripes } from "../src/paint";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "Hydra",
  description: "A four-legged, scale-armoured hydra with three spread necks and three toothy, frilled heads.",
  builtBy: "GPT-6 Astra",
};

const GREEN = "#4b7c45";
const DARK = "#1f3f2e";
const SCALE = "#86a95a";
const BELLY = "#d9c98e";
const FRILL = "#c65443";
const FRILL_DARK = "#762e3c";
const EYE = "#f2b632";
const PUPIL = "#201323";
const TOOTH = "#f4e6bc";
const CLAW = "#35251d";
const MOUTH = "#9b4c52";
const PAD = "#594336";

const COAT = countershade(stripes(scales(GREEN, SCALE, { size: 0.18, width: 0.24, seed: 19 }), DARK, { size: 0.82, width: 0.42, axis: [0, 0, 1], wobble: 0.12, seed: 7 }), BELLY, {
  level: -0.08,
});

export default function build() {
  const b = createBuilder({ name: "hydra", detail: 0.85 });
  const random = rng(41);

  // A single heavy spine is split at the hips so the tail and front trunk share a seamless skin.
  const bodyCurve = catmull([
    [0, 1.05, -2.55],
    [0, 1.16, -2.15],
    [0, 1.28, -1.55],
    [0, 1.34, -0.75],
    [0, 1.42, -0.05],
    [0, 1.52, 0.53],
    [0, 1.58, 0.82],
  ]);
  const hips = b.joint("hips", { at: [0, 1.31, -0.75], role: "spine", group: "body" });
  const hipsT = bodyCurve.closestT(hips.at);
  const tail = b.chain("tail", bodyCurve.slice(hipsT, 0), { parent: hips, count: 7, role: "tail", group: "tail" });
  const spine = b.chain("spine", bodyCurve.slice(hipsT, 1), {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "chest", "shoulder", "neckRoot"],
    role: "spine",
    group: "body",
  });
  const body = b.sweep(bodyCurve, (t) => {
    const z = bodyCurve.at(t).z;
    if (z < -2.15) return 0.1 + (z + 2.55) * 0.2;
    if (z < -1.35) return 0.26 + (z + 2.15) * 0.17;
    if (z < 0.25) return 0.48;
    return 0.44 - (z - 0.25) * 0.2;
  }, {
    bone: [tail, hips, spine],
    color: COAT,
    sectors: [[112, 248, BELLY]],
    sides: 10,
    group: "body",
    caps: { start: "round", end: "round" },
  });

  // Four planted, outward-splayed legs. Each has a named hip/knee/ankle/foot chain.
  const legTubes: Sweep[] = [];
  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const legSpecs = [
      {
        kind: "hind",
        parent: hips,
        root: [s * 0.52, 1.23, -1.18] as const,
        foot: [s * 0.82, 0.19, -0.86] as const,
        bends: [[s * 0.9, 0, 0.35], [0, 0, -1]] as const,
        lengths: [0.62, 0.62, 0.24] as const,
      },
      {
        kind: "front",
        parent: spine.joints[2],
        root: [s * 0.49, 1.38, 0.43] as const,
        foot: [s * 0.76, 0.19, 0.72] as const,
        bends: [[s * 0.75, 0, -0.5], [0, 0, 1]] as const,
        lengths: [0.6, 0.58, 0.23] as const,
      },
    ];
    for (const spec of legSpecs) {
      const points = limb(spec.root, spec.foot, spec.lengths, spec.bends);
      const end = points[points.length - 1];
      const group = `leg${spec.kind}${side}`;
      const chain = b.chain(`${spec.kind}${side}`, [...points, [end.x, end.y, end.z + 0.15]], {
        parent: spec.parent,
        names: [`${spec.kind}Hip${side}`, `${spec.kind}Knee${side}`, `${spec.kind}Ankle${side}`, `${spec.kind}Foot${side}`],
        role: "leg",
        group,
        contact: [end.x, 0, end.z],
      });
      const tube = b.sweep(chain, (t) => [0.16 - 0.07 * t, 0.19 - 0.075 * t], {
        color: COAT,
        sectors: [[110, 250, BELLY]],
        sides: 8,
        group,
      });
      legTubes.push(tube);
      b.part(new SphereGeometry(0.5, 8, 5), PAD, {
        bone: chain.joints[chain.joints.length - 1],
        at: [end.x, 0.055, end.z],
        scale: [0.24, 0.11, 0.3],
        group,
        name: `${spec.kind}Pad${side}`,
      });
      for (const toe of [-1, 0, 1]) {
        const toeBase = [end.x + toe * 0.055, 0.055, end.z + 0.11] as const;
        b.spike(toeBase, [0, 0, 1], 0.15, 0.026, { bone: chain.joints[chain.joints.length - 1], color: CLAW, group });
      }
    }
  }

  // Three serpentine necks fan apart from the shoulder, then stay extended in a readable rest pose.
  const neckSpecs = [
    { key: "L", root: [0.48, 1.66, 0.62] as const, mid: [0.88, 2.12, 1.18] as const, tip: [1.25, 2.7, 1.72] as const },
    { key: "C", root: [0, 1.7, 0.74] as const, mid: [0, 2.28, 1.22] as const, tip: [0, 3.0, 1.82] as const },
    { key: "R", root: [-0.48, 1.66, 0.62] as const, mid: [-0.88, 2.12, 1.18] as const, tip: [-1.25, 2.7, 1.72] as const },
  ] as const;
  for (const spec of neckSpecs) {
    const curve = catmull([spec.root, spec.mid, spec.tip]);
    const neck = b.chain(`neck${spec.key}`, curve, {
      parent: spine.joints[4],
      count: 5,
      role: "neck",
      group: `neck${spec.key}`,
    });
    b.sweep(neck, (t) => 0.22 - 0.11 * t, {
      color: COAT,
      sectors: [[112, 248, BELLY]],
      sides: 9,
      group: `neck${spec.key}`,
    });

    const head = b.joint(`head${spec.key}`, {
      parent: neck.joints[neck.joints.length - 1],
      at: neck.at(1),
      dir: [spec.key === "L" ? 0.18 : spec.key === "R" ? -0.18 : 0, -0.08, 1],
      role: "head",
      group: `head${spec.key}`,
    });
b.loft([
  { at: head.local([0, -0.04, 0]), w: 0.52, h: 0.42 },
  { at: head.local([0, 0.22, 0]), w: 0.62, h: 0.5 },
  { at: head.local([0, 0.5, -0.01]), w: 0.4, h: 0.36 },
  { at: head.local([0, 0.68, -0.03]), w: 0.26, h: 0.25 },
], {
  bone: head,
  color: COAT,
  sectors: [[120, 240, MOUTH]],
  sides: 8,
  group: `head${spec.key}`,
});
    const jaw = b.joint(`jaw${spec.key}`, {
      parent: head,
      at: head.local([0, 0.02, -0.22]),
      dir: head.dir([0, 0.92, -0.22]),
      role: "jaw",
      group: `jaw${spec.key}`,
    });
    b.loft([
      { at: jaw.local([0, -0.02, 0]), w: 0.38, h: 0.18 },
      { at: jaw.local([0, 0.23, 0]), w: 0.44, h: 0.2 },
      { at: jaw.local([0, 0.53, 0]), w: 0.22, h: 0.13 },
    ], {
      bone: jaw,
      color: COAT,
      sectors: [[115, 245, BELLY]],
      sides: 8,
      group: `jaw${spec.key}`,
    });

    // Separate jaws have opposing rows of teeth, with large fangs at the front.
    for (const s of [1, -1]) {
      for (let i = 0; i < 4; i++) {
        const y = 0.16 + i * 0.12;
        b.spike(head.local([s * (0.13 + (i % 2) * 0.035), y, -0.23]), head.dir([0, -1, 0]), i === 0 ? 0.15 : 0.105, 0.026, {
          bone: head,
          color: TOOTH,
          group: `head${spec.key}`,
        });
        b.spike(jaw.local([s * (0.1 + (i % 2) * 0.03), 0.13 + i * 0.1, 0.1]), jaw.dir([0, 1, 0]), i === 1 ? 0.13 : 0.09, 0.022, {
          bone: jaw,
          color: TOOTH,
          group: `jaw${spec.key}`,
        });
      }
    }

    // Amber side eyes, slit pupils, and two little brow horns make each head read independently.
    for (const s of [1, -1]) {
      const eyeAt = head.local([s * 0.28, 0.24, 0.17]);
      b.part(new SphereGeometry(0.075, 8, 5), EYE, { bone: head, at: eyeAt, group: `head${spec.key}` });
      b.part(new SphereGeometry(0.035, 6, 4), PUPIL, {
        bone: head,
        at: head.local([s * 0.28, 0.285, 0.17]),
        scale: [0.7, 1.3, 0.6],
        group: `head${spec.key}`,
      });
      b.spike(head.local([s * 0.22, 0.26, 0.36]), head.dir([s * 0.2, 0.65, 0.55]), 0.2, 0.055, {
        bone: head,
        color: DARK,
        group: `head${spec.key}`,
      });
    }
    // Nostrils and a dark mouth line at the snout.
    b.part(new SphereGeometry(0.03, 6, 4), PUPIL, { bone: head, at: head.local([0.1, 0.63, 0.02]), group: `head${spec.key}` });
    b.part(new SphereGeometry(0.03, 6, 4), PUPIL, { bone: head, at: head.local([-0.1, 0.63, 0.02]), group: `head${spec.key}` });

    const fan = b.ring(frame(head, head), {
      count: 9,
      radius: 0.27,
      fromDeg: -125,
      toDeg: 125,
      tilt: -12,
      joints: 3,
      name: `frill${spec.key}`,
      role: "fan",
      group: `head${spec.key}`,
    }, (rib) => b.spike(rib, rib, 0.22 + (rib.i % 2) * 0.035, 0.025, { color: FRILL_DARK, group: `head${spec.key}` }));
    for (let i = 0; i < fan.items.length - 1; i++) {
      const a = fan.items[i];
      const c = fan.items[i + 1];
      b.slab([a, c, c.moved([0, 0.13, 0]), a.moved([0, 0.11, 0])], {
        color: i % 2 ? FRILL : FRILL_DARK,
        thickness: 0.012,
        group: `head${spec.key}`,
      });
    }
    b.pose(jaw, { axis: head.dir([1, 0, 0]), deg: 16 });
  }

  // Keeled osteoderms on the body and upper limbs add a readable reptile silhouette.
  const osteoderm = new ConeGeometry(0.065, 0.09, 5);
  const bodySurface = b.surface([body, ...legTubes]);
  for (const hit of bodySurface.scatter(34, {
    rng: random,
    minDist: 0.16,
    filter: (h) => h.n.y > 0.32 && h.at.z > -2.1 && h.at.z < 0.75,
  }))
    b.stick(osteoderm, random() > 0.6 ? SCALE : DARK, hit, { embed: 0.55, flow: [0, 0, 1], scale: 0.7 + random() * 0.6, group: "scales" });

  // A few broad dorsal plates bridge the shoulder into the three-neck crown.
  for (const t of [0.24, 0.38, 0.52, 0.66]) {
    const at = body.at(t, -35);
    b.part(new CylinderGeometry(0.07, 0.11, 0.12, 6), DARK, { frame: at, scale: [1.2, 1, 1.5], group: "scales" });
  }

  return b.root;
}
