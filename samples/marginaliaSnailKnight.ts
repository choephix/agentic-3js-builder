import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { offset, rng } from "../src/math";
import { bezier, catmull, polyline, spiral, arc } from "../src/path";
import { limb } from "../src/ik";
import { paint } from "../src/paint";
import { cel, INK } from "../kits/toon";

// Marginalia: Rabbit Knight and Snail — an illuminated-manuscript margin in 3D.
// Flat tempera (lapis, vermilion, green earth), gold leaf, dark outlines.
const PARCH = "#e6d3a0";
const PARCH_D = "#d3b982";
// lapis used inline in border paint
const LAPIS_D = cel("#1d3470");
const VERM = cel("#c84426");
const GREEN = cel("#6d8f3e");
const GOLD = "#c9a227";
const GOLD_D = "#9a7a1c";
const MAIL = cel("#a8adb5");
const CREAM = cel("#f2e7cd");
const FUR = cel("#b99a6b");
const FUR_D = cel("#8a6f45");
const SNAIL_SKIN = cel("#a9a06b");
const SHELL_D = cel("#7e4f22");
const LEAF = cel("#4f7a34");
const DARK = INK;

export const meta = {
  name: "Marginalia: Rabbit Knight and Snail",
  description:
    "A medieval manuscript margin in 3D: a rabbit knight with pennant lance jousting a giant spiral-shelled snail on a parchment base with flowers and vines.",
};

export default function build() {
  const b = createBuilder({ name: "marginaliaSnailKnight" });
  const R = rng(11);

  // ---- root & parchment base ----
  const root = b.joint("root", { at: [0, 0.04, 0] });
  const basePaint = paint((p) => {
    const bx = Math.abs(p.x);
    const bz = Math.abs(p.z);
    if (p.y > 0.035 && (bx > 0.5 || bz > 0.3)) {
      // illuminated border: alternating vermilion/lapis blocks with gold dots
      const u = Math.floor((p.x + p.z) * 22);
      if (Math.abs(bx - 0.56) < 0.012 || Math.abs(bz - 0.36) < 0.012) return GOLD;
      return ((u % 2) + 2) % 2 ? "#c84426" : "#2b4f9e";
    }
    if (Math.abs(bx - 0.5) < 0.008 || Math.abs(bz - 0.3) < 0.008) return GOLD;
    return Math.sin(p.x * 40) * Math.sin(p.z * 40) > 0.93 ? PARCH_D : PARCH;
  });
  b.part(new THREE.BoxGeometry(1.2, 0.04, 0.8, 1, 1, 1), basePaint, {
    bone: root,
    at: [0, 0.02, 0],
  });
  const FLOOR = 0.04;

  // ================= RABBIT KNIGHT (left, facing +X toward snail) =================
  const hips = b.joint("hips", { parent: root, at: [-0.3, 0.2, 0.02], dir: [0.25, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [-0.27, 0.36, 0.02], dir: [0.3, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [-0.24, 0.46, 0.02], dir: [0.45, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [-0.21, 0.54, 0.02], dir: [0.8, 0.55, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [-0.185, 0.52, 0.02], dir: [1, -0.25, 0], role: "jaw" });

  // body: haunch to chest sweep, continuing up into the head
  const bodyPath = catmull([
    [-0.33, 0.17, 0.02],
    [-0.31, 0.26, 0.02],
    [-0.28, 0.36, 0.02],
    [-0.25, 0.45, 0.02],
    [-0.21, 0.53, 0.02],
  ]);
  b.sweep(bodyPath, [0.09, 0.05], {
    bone: [hips, chest, neck, head],
    color: FUR,
    sides: 8,
  });
  // haunch (big rabbit thigh bump)
  const haunch = b.part(new THREE.SphereGeometry(0.085, 10, 8), FUR, {
    bone: hips,
    at: [-0.335, 0.2, 0.02],
    scale: [0.75, 1.05, 0.9],
  });
  void haunch;

  // head + muzzle + jaw
  b.part(new THREE.SphereGeometry(0.062, 10, 8), FUR, {
    bone: head,
    at: head.local([0, 0.035, 0.01]),
    scale: [0.9, 1, 1],
  });
  b.part(new THREE.SphereGeometry(0.032, 8, 6), CREAM, {
    bone: head,
    at: head.local([0, 0.02, 0.075]),
    scale: [0.85, 0.75, 1],
  });
  // nose
  b.part(new THREE.SphereGeometry(0.011, 6, 4), VERM, {
    bone: head,
    at: head.local([0, 0.032, 0.1]),
  });
  // lower jaw: small box chin
  b.part(new THREE.SphereGeometry(0.026, 8, 6), FUR_D, {
    bone: jaw,
    at: jaw.local([0, -0.005, 0.045]),
    scale: [0.8, 0.55, 1.1],
  });
  // teeth: two white nubs
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.009, 0.014, 0.006), CREAM, {
      bone: jaw,
      at: jaw.local([s * -0.009, -0.012, 0.062]),
    });
  }
  // eyes: dark beads with gold ring (both sides; head faces +X so sides are ±Z... use head local)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 8, 6), DARK, {
      bone: head,
      at: head.local([s * 0.042, 0.055, 0.045]),
    });
  }

  // long ears: sprouted chains so they can pose
  const earTargets: Array<[number, [number, number, number]]> = [
    [1, [-0.3, 0.78, 0.055]],
    [-1, [-0.3, 0.78, -0.015]],
  ];
  for (const [s, tip] of earTargets) {
    const ebase = head.local([s * 0.028, 0.085, -0.01]);
    const epath = bezier(ebase, head.local([s * 0.035, 0.16, -0.03]), tip);
    const sp = b.sprout(s > 0 ? "earL" : "earR", frame(ebase, [0, 1, 0]), epath, [0.024, 0.008], {
      count: 2,
      color: FUR,
      role: "hinge",
    });
    void sp;
    // pink inner ear decal-ish stick
    b.sweep(bezier(offset(ebase, [0, 0.02, 0], 0.02), offset(tip, [0, -0.02, 0], 0.01), tip), [0.011, 0.003], {
      bone: head,
      color: VERM,
    });
  }

  // mail coat: torso sleeve of rings colour + skirt
  b.sweep(
    catmull([
      [-0.285, 0.3, 0.02],
      [-0.265, 0.38, 0.02],
      [-0.25, 0.45, 0.02],
    ]),
    [0.075, 0.066],
    { bone: [hips, chest], color: MAIL, sides: 8 },
  );
  // surcoat: vermilion slab front with gold cross
  const surcoat = b.extrude(
    [
      [-0.045, 0],
      [0.045, 0],
      [0.05, 0.14],
      [0.02, 0.17, "sharp"],
      [-0.02, 0.17, "sharp"],
      [-0.05, 0.14],
    ],
    {
      at: [-0.222, 0.3, 0.02],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.012,
      color: VERM,
      bone: chest,
    },
  );
  void surcoat;
  // gold cross on surcoat
  b.part(new THREE.BoxGeometry(0.014, 0.1, 0.014), GOLD, { bone: chest, at: [-0.214, 0.37, 0.02] });
  b.part(new THREE.BoxGeometry(0.05, 0.014, 0.014), GOLD, { bone: chest, at: [-0.214, 0.39, 0.02] });
  // helmet: gold-leaf dome + brim
  b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.058, 0.01],
      [0.045, 0.03],
      [0.02, 0.045],
      [0, 0.048],
    ],
    { at: head.local([0, 0.075, -0.01]), bone: head, color: GOLD, segments: 10 },
  );
  // helmet nasal guard
  b.part(new THREE.BoxGeometry(0.012, 0.05, 0.01), GOLD_D, {
    bone: head,
    at: head.local([0, 0.05, 0.062]),
  });

  // legs: hind braced (digitigrade), big feet flat
  for (const s of [1, -1]) {
    const z = 0.02 + s * -0.055;
    const pts = limb(
      [-0.32, 0.22, z],
      [-0.24, 0.025, z + 0.02],
      [0.13, 0.12, 0.09],
      [
        [0, 0, 1],
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const leg = b.chain(s > 0 ? "legL" : "legR", polyline(pts), {
      parent: hips,
      names: s > 0 ? ["hipL", "kneeL", "hockL", "footL"] : ["hipR", "kneeR", "hockR", "footR"],
      role: "leg",
      contact: [-0.24, FLOOR, z + 0.02],
    });
    b.sweep(leg, [0.035, 0.022], { color: FUR, sides: 7 });
    // long foot
    b.capsule(leg.tip!.local([0, -0.01, 0.01]), leg.tip!.local([0, -0.015, 0.11]), 0.02, { color: FUR_D });
  }
  // arms holding lance forward
  for (const s of [1, -1]) {
    const z = 0.02 + s * -0.05;
    const pts = limb([-0.26, 0.4, z], [-0.12, 0.38, 0.02 + s * -0.015], [0.11, 0.1], [[0, 0, 1]]);
    const arm = b.chain(s > 0 ? "armL" : "armR", polyline(pts), {
      parent: chest,
      names: s > 0 ? ["shoulderL", "elbowL", "pawL"] : ["shoulderR", "elbowR", "pawR"],
      role: "arm",
    });
    b.sweep(arm, [0.026, 0.018], { color: MAIL, sides: 7 });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), FUR, { bone: arm.tip!, at: arm.tip!.at });
  }

  // lance: long shaft couched under arm pointing +X at snail
  const lanceBase: [number, number, number] = [-0.34, 0.4, 0.0];
  const lanceTip: [number, number, number] = [0.22, 0.34, 0.03];
  b.rod(lanceBase, lanceTip, [0.014, 0.01], { bone: chest, color: CREAM, sides: 8 });
  // steel head
  b.spike(frame(lanceTip, [1, -0.1, 0]), lanceTip, 0.09, 0.016, { bone: chest, color: MAIL });
  // vamplate (hand guard): small cone disc
  b.lathe(
    [
      [0, 0],
      [0.05, 0.0],
      [0, 0.03],
    ],
    { at: [-0.1, 0.378, 0.008], axis: [1, -0.1, 0], bone: chest, color: GOLD, segments: 8 },
  );
  // pennant: small forked flag fluttering
  const penA = polyline([
    [-0.3, 0.415, 0.0],
    [-0.22, 0.43, 0.01],
    [-0.14, 0.415, 0.03],
  ]);
  const penB = polyline([
    [-0.3, 0.375, 0.0],
    [-0.22, 0.375, 0.01],
    [-0.14, 0.39, 0.03],
  ]);
  b.membrane(penA, penB, { bone: chest, color: VERM, thickness: 0.004 });
  // pennant gold tip cross
  b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { bone: chest, at: [-0.14, 0.402, 0.03] });

  // fluffy tail
  b.part(new THREE.SphereGeometry(0.032, 8, 6), CREAM, { bone: hips, at: [-0.385, 0.2, 0.02] });

  // ================= GIANT SNAIL (right, facing -X toward rabbit) =================
  const snailPts = catmull([
    [0.52, 0.1, -0.06],
    [0.4, 0.09, -0.03],
    [0.28, 0.1, 0.0],
    [0.16, 0.13, 0.03],
    [0.08, 0.17, 0.045],
  ]);
  const snail = b.chain("snail", snailPts, {
    parent: root,
    count: 5,
    names: ["snail1", "snail2", "snail3", "snail4", "snail5", "snailHead"],
    role: "spine",
  });
  b.sweep(snail, (t) => 0.075 * (1 - t * 0.35) + 0.02, {
    color: SNAIL_SKIN,
    sides: 9,
  });
  // head knob + mouth
  b.part(new THREE.SphereGeometry(0.055, 10, 8), SNAIL_SKIN, {
    bone: snail.tip!,
    at: snail.tip!.local([0, 0.01, 0.02]),
    scale: [1, 0.85, 1.1],
  });
  // mouth line: small dark slit
  b.part(new THREE.BoxGeometry(0.03, 0.008, 0.01), DARK, {
    bone: snail.tip!,
    at: snail.tip!.local([0, -0.015, 0.065]),
  });
  // eye stalks: two sprouted chains rising from head
  const stalkBaseL = snail.tip!.local([0.03, 0.04, 0.02]);
  const stalkBaseR = snail.tip!.local([-0.03, 0.04, 0.02]);
  const stalkTipL: [number, number, number] = [0.1, 0.42, 0.09];
  const stalkTipR: [number, number, number] = [0.1, 0.42, 0.0];
  const stalkDefs: Array<[string, THREE.Vector3, [number, number, number]]> = [
    ["stalkL", stalkBaseL, stalkTipL],
    ["stalkR", stalkBaseR, stalkTipR],
  ];
  for (const [nm, sb, st] of stalkDefs) {
    const path = bezier(sb, offset(sb, [0, 1, 0], 0.12), st);
    const sp = b.sprout(nm, frame(sb, [0, 1, 0]), path, [0.016, 0.012], {
      count: 2,
      color: SNAIL_SKIN,
      role: "tentacle",
    });
    void sp;
    // eye ball on stalk tip
    const eyeF = frame(st, [0, 1, 0]);
    b.part(new THREE.SphereGeometry(0.024, 8, 6), CREAM, { bone: snail.tip!, at: offset(st, [0, 1, 0], 0.012) });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), DARK, { bone: snail.tip!, at: offset(st, [0, 1, 0.012], 0.03) });
    void eyeF;
  }
  // spiral shell: flat coil riding above body
  const shellCenter = new THREE.Vector3(0.36, 0.3, -0.02);
  const shellAxis: [number, number, number] = [0.15, 0, 1];
  const coil = spiral(shellCenter, offset(shellCenter, [0, -1, 0], 0.15), shellAxis, {
    turns: 2.6,
    r1: 0.012,
    pitch: 0.02,
  });
  const shellPaint = paint((_p, _n, s) => {
    const band = Math.floor(s[0] * 13) % 2 === 0;
    return band ? "#b5763a" : "#7e4f22";
  });
  const shellJoint = b.joint("shell", { parent: snail.joints[2], at: shellCenter, role: "hinge" });
  b.sweep(coil, [0.075, 0.004], { bone: shellJoint, color: shellPaint, sides: 9 });
  // shell lip
  b.lathe(
    [
      [0, 0],
      [0.085, 0],
      [0, 0.035],
    ],
    {
      at: offset(shellCenter, [0.15, 0, 1], -0.01),
      axis: [0.15, 0, 1],
      bone: shellJoint,
      color: SHELL_D,
      segments: 10,
    },
  );
  // gold leaf dots on shell: ring of studs
  const shellSurf = b.surface(shellJoint);
  for (const h of shellSurf.scatter(10, { rng: rng(5), minDist: 0.05 })) {
    b.stick(new THREE.SphereGeometry(0.008, 6, 4), GOLD, h, { embed: 0.4 });
  }
  // foot fringe: wavy skirt along body base
  b.along(snail, 9, (at) => {
    b.spike(at, at, 0.03, 0.014, { color: GREEN });
  });

  // ================= MARGIN DECOR: flowers & vines =================
  const vinePaint = paint(() => "#4f7a34");
  const vinePath = catmull([
    [-0.55, FLOOR + 0.005, 0.3],
    [-0.3, FLOOR + 0.005, 0.34],
    [0.0, FLOOR + 0.005, 0.3],
    [0.3, FLOOR + 0.005, 0.34],
    [0.55, FLOOR + 0.005, 0.3],
  ]);
  b.sweep(vinePath, 0.008, { bone: root, color: vinePaint });
  const vinePath2 = catmull([
    [-0.55, FLOOR + 0.005, -0.3],
    [-0.2, FLOOR + 0.005, -0.34],
    [0.2, FLOOR + 0.005, -0.3],
    [0.55, FLOOR + 0.005, -0.33],
  ]);
  b.sweep(vinePath2, 0.008, { bone: root, color: vinePaint });

  // leaves along vines
  const leafOutline = [
    [0, 0],
    [0.03, 0.018],
    [0.055, 0, "sharp"],
    [0.03, -0.018],
  ] as Array<[number, number] | [number, number, "sharp"]>;
  const leafSpots: Array<[number, number]> = [
    [-0.45, 0.32],
    [-0.15, 0.335],
    [0.12, 0.315],
    [0.42, 0.33],
    [-0.35, -0.325],
    [0.05, -0.325],
    [0.4, -0.32],
  ];
  leafSpots.forEach(([lx, lz], i) => {
    b.extrude(leafOutline, {
      at: [lx, FLOOR + 0.012, lz],
      x: [i % 2 ? 0.7 : -0.7, 0, 0.3],
      thickness: 0.004,
      color: LEAF,
      bone: root,
    });
  });

  // flowers: 3D daisies — white petal disc + gold centre on a stem
  const FLOWER = cel("#f4ead2");
  const flowerAt: Array<[number, number]> = [
    [-0.52, 0.22],
    [-0.5, -0.24],
    [0.55, 0.2],
    [0.5, -0.26],
    [-0.05, -0.33],
    [0.18, 0.33],
  ];
  flowerAt.forEach(([fx, fz], i) => {
    const h = 0.05 + (i % 3) * 0.015;
    b.rod([fx, FLOOR, fz], [fx, FLOOR + h, fz], 0.005, { bone: root, color: GREEN });
    b.part(new THREE.CylinderGeometry(0.026, 0.02, 0.01, 8), FLOWER, {
      bone: root,
      at: [fx, FLOOR + h + 0.005, fz],
    });
    b.part(new THREE.SphereGeometry(0.011, 8, 6), GOLD, { bone: root, at: [fx, FLOOR + h + 0.012, fz] });
    void R;
  });
  // bluebell dots: small lapis bells on stems
  const bellAt: Array<[number, number]> = [
    [-0.42, -0.2],
    [0.44, 0.14],
    [0.02, 0.28],
  ];
  for (const [bx2, bz2] of bellAt) {
    b.rod([bx2, FLOOR, bz2], [bx2, FLOOR + 0.11, bz2], 0.005, { bone: root, color: GREEN });
    b.lathe(
      [
        [0, 0],
        [0.02, 0],
        [0.022, 0.03],
        [0, 0.05],
      ],
      { at: [bx2, FLOOR + 0.11, bz2], bone: root, color: LAPIS_D, segments: 7 },
    );
  }
  // columbine-ish vermilion cups near snail
  for (const [cx2, cz2] of [
    [0.3, -0.24],
    [-0.12, 0.28],
  ] as Array<[number, number]>) {
    b.rod([cx2, FLOOR, cz2], [cx2, FLOOR + 0.08, cz2], 0.005, { bone: root, color: GREEN });
    b.lathe(
      [
        [0, 0],
        [0.022, 0.005],
        [0.026, 0.035],
        [0, 0.04],
      ],
      { at: [cx2, FLOOR + 0.08, cz2], bone: root, color: VERM, segments: 7 },
    );
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, { bone: root, at: [cx2, FLOOR + 0.12, cz2] });
  }

  // gold-leaf corner flourishes: small discs at base corners
  for (const [gx, gz] of [
    [-0.56, 0.36],
    [0.56, 0.36],
    [-0.56, -0.36],
    [0.56, -0.36],
  ] as Array<[number, number]>) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 8), GOLD, { bone: root, at: [gx, FLOOR + 0.003, gz] });
  }

  // bracing pose: rabbit leans into the lance
  b.pose(chest, { axis: [0, 0, 1], deg: -8 });
  b.pose(head, { axis: [0, 0, 1], deg: 10 });
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  void arc;

  return b.root;
}
