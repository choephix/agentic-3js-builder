import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, bezier, polyline } from "../src/path";
import { limb } from "../src/ik";
import { offset, vec } from "../src/math";
import { stripes, mottle } from "../src/paint";
import { glow } from "../kits/glow";

export const meta = {
  name: "Biomechanical Swarm Queen",
  description:
    "A 3 m insectoid hive queen: crested head with mandibles and inner jaw, six floor-planted legs, raised scythe forelimbs, ribbed thorax, swollen egg-sac abdomen and glowing green sacs.",
};

const CHITIN = "#101218";
const CHITIN2 = "#1b1f28";
const RIB = "#3d4350";
const BONE = "#d8cdb0";
const BONE_DARK = "#a99e80";
const SAC = "#86e83e";
const SAC_DEEP = "#3f9c1e";
const SAC_MEM = "#c9b98a";
const EYE = "#a5ff4d";
const CABLE = "#23262e";

export default function build() {
  const b = createBuilder({ name: "biomechSwarmQueen" });

  const chitinPaint = mottle(CHITIN, CHITIN2, { size: 0.12, contrast: 0.6, seed: 11 });
  const ribPaint = stripes(CHITIN, RIB, { size: 0.055, axis: [0, 0, 1], width: 0.45, seed: 5 });
  const sacPaint = mottle(SAC_MEM, "#b3a67f", { size: 0.09, contrast: 0.5, seed: 21 });

  // ---------- skeleton ----------
  const pelvis = b.joint("pelvis", { at: [0, 0.92, 0.15], role: "spine" });

  const spineCurve = catmull([
    [0, 0.92, 0.15],
    [0, 0.97, 0.5],
    [0, 1.02, 0.85],
  ]);
  const spine = b.chain("spine", spineCurve, {
    parent: pelvis,
    count: 2,
    names: ["spine", "thorax"],
    role: "spine",
  });
  const thoraxJ = spine.joints[1];

  const neckCurve = catmull([
    [0, 1.02, 0.85],
    [0, 1.06, 1.02],
    [0, 1.08, 1.18],
  ]);
  const neck = b.chain("neck", neckCurve, {
    parent: thoraxJ,
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.09, 1.3],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });
  const snout = b.joint("snout", {
    parent: head,
    at: [0, 1.08, 1.52],
    dir: [0, -0.05, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.0, 1.28],
    aim: [0, 0.9, 1.55],
    role: "jaw",
    group: "head",
  });
  const innerJaw = b.joint("innerJaw", {
    parent: jaw,
    at: [0, 1.0, 1.34],
    aim: [0, 0.94, 1.6],
    role: "jaw",
    group: "head",
  });

  const abdCurve = catmull([
    [0, 0.92, 0.15],
    [0, 0.88, -0.35],
    [0, 0.74, -0.9],
    [0, 0.58, -1.2],
    [0, 0.52, -1.42],
  ]);
  const abdomen = b.chain("abdomen", abdCurve, {
    parent: pelvis,
    count: 4,
    names: ["abdomen1", "abdomen2", "abdomen3", "abdomenTip"],
    role: "tail",
  });

  // ---------- body tubes ----------
  // thorax: head-ward tube over spine
  const thoraxTube = b.sweep(spineCurve, (t) => 0.24 - 0.06 * t, {
    bone: [pelvis, spine.joints[0], thoraxJ],
    color: chitinPaint,
    section: { ngon: 8 },
  });
  // neck + head capsule
  const headTube = b.sweep(
    catmull([
      [0, 1.02, 0.8],
      [0, 1.07, 1.05],
      [0, 1.09, 1.3],
      [0, 1.07, 1.52],
    ]),
    [0.17, 0.13, 0.16, 0.07],
    { bone: [thoraxJ, neck.joints[0], neck.joints[1], head], color: chitinPaint, section: { ngon: 7 } },
  );
  // swollen egg-sac abdomen
  const abdRadii = [0.22, 0.3, 0.37, 0.34, 0.18, 0.05];
  const abdTube = b.sweep(abdCurve, abdRadii, {
    bone: [pelvis, abdomen.joints[0], abdomen.joints[1], abdomen.joints[2], abdomen.joints[3]],
    color: sacPaint,
    section: { ngon: 10 },
  });
  // ribbed armour bands over front half of abdomen + thorax rings
  b.sweep(abdCurve.slice(0, 0.45), (t) => 0.235 + 0.16 * Math.sin(t * Math.PI) + 0.012, {
    bone: [pelvis, abdomen.joints[0], abdomen.joints[1]],
    color: ribPaint,
    section: { ngon: 10 },
    caps: "none",
  });

  // dorsal thorax plates (bone-coloured ribbed armour)
  for (let i = 0; i < 4; i++) {
    const t = 0.12 + i * 0.24;
    const top = thoraxTube.at(t, 0, 0.01);
    b.stick(new THREE.SphereGeometry(0.13 - i * 0.012, 9, 6), BONE, top, {
      embed: 0.55,
      scale: [1.15, 0.42, 0.72],
    });
  }
  // abdomen segment ridges: bone studs ringing the sac
  b.along(
    abdTube,
    6,
    (at) => {
      for (const deg of [0, 55, 125, 180, 235, 305]) {
        const sp = abdTube.at(at.t, deg, 0.005);
        b.stick(new THREE.SphereGeometry(0.022, 7, 5), BONE_DARK, sp, { embed: 0.4 });
      }
    },
    { from: 0.08, to: 0.6 },
  );

  // ---------- crest, eyes, mandibles, jaws ----------
  // head crest: tall blade
  b.extrude(
    [
      [0.0, 0],
      [0.24, 0.04],
      [0.32, 0.26, "sharp"],
      [0.14, 0.36],
      [-0.02, 0.28],
      [-0.05, 0.08],
    ],
    {
      at: [0, 1.02, 1.22],
      x: [0, 0, 1],
      thickness: 0.06,
      bevel: 0.008,
      smoothing: 1,
      color: BONE,
      bone: head,
    },
  );
  // crest spikes
  for (let i = 0; i < 3; i++) {
    b.spike([0, 1.26 + i * 0.015, 1.32 + i * 0.06], [0, 1, -0.25], 0.15 - i * 0.02, 0.024, {
      bone: head,
      color: BONE_DARK,
    });
  }
  // eyes: clusters of glowing orbs
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const e = b.part(new THREE.SphereGeometry(0.032 - i * 0.006, b.segments(8), b.segments(6)), EYE, {
        bone: head,
        at: [s * (0.1 + i * 0.035), 1.12 - i * 0.02, 1.38 - i * 0.055],
      });
      glow(e, 1.6);
    }
  }
  // mandibles: curved fangs either side of mouth
  for (const s of [1, -1]) {
    const mCurve = catmull([
      [s * 0.09, 1.03, 1.5],
      [s * 0.2, 0.98, 1.62],
      [s * 0.22, 1.0, 1.78],
      [s * 0.13, 1.06, 1.86],
    ]);
    const m = b.chain(`mandible${s > 0 ? "L" : "R"}`, mCurve, {
      parent: head,
      count: 2,
      role: "digit",
    });
    b.sweep(m, [0.035, 0.012], { color: BONE_DARK, caps: { end: "point" } });
  }
  // upper snout jaw (toothed beak)
  b.sweep(
    catmull([
      [0, 1.08, 1.45],
      [0, 1.06, 1.62],
      [0, 1.04, 1.74],
    ]),
    [0.075, 0.05, 0.012],
    { bone: [snout], color: BONE, caps: { end: "point" } },
  );
  // lower jaw: thin jaw + inner jaw spike
  b.sweep(
    catmull([
      [0, 1.0, 1.3],
      [0, 0.96, 1.5],
      [0, 0.95, 1.66],
    ]),
    [0.055, 0.035, 0.01],
    { bone: [jaw], color: BONE_DARK, caps: { end: "point" } },
  );
  b.sweep(
    catmull([
      [0, 1.0, 1.36],
      [0, 0.97, 1.55],
      [0, 0.99, 1.7],
    ]),
    [0.03, 0.02, 0.006],
    { bone: [innerJaw], color: SAC_DEEP },
  );
  // jaw teeth
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.spike([s * 0.03, 0.985 - i * 0.008, 1.42 + i * 0.08], [0, 1, 0], 0.035, 0.009, {
        bone: jaw,
        color: BONE,
      });
    }
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  b.pose(innerJaw, { axis: [1, 0, 0], deg: 8 });

  // ---------- six legs ----------
  const legRoots: Array<[number, number, number]> = [
    [0.2, 0.86, 0.62],
    [0.26, 0.86, 0.18],
    [0.24, 0.84, -0.3],
  ];
  const legTargets: Array<[number, number, number]> = [
    [0.78, 0.05, 0.85],
    [0.92, 0.05, 0.15],
    [0.85, 0.05, -0.62],
  ];
  let li = 0;
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const root: [number, number, number] = [s * legRoots[k][0], legRoots[k][1], legRoots[k][2]];
      const target: [number, number, number] = [s * legTargets[k][0], legTargets[k][1], legTargets[k][2]];
      const pts = limb(root, target, [0.55, 0.62], [[s * 0.5, 1, 0]]);
      if (pts[pts.length - 1].distanceTo(vec(target)) > 1e-3) throw new Error("leg too short");
      const side = s > 0 ? "L" : "R";
      const leg = b.chain(`leg${side}${k + 1}`, pts, {
        parent: k === 2 ? pelvis : thoraxJ,
        names: [`hip${side}${k + 1}`, `knee${side}${k + 1}`, `ankle${side}${k + 1}`],
        role: "leg",
        contact: target,
      });
      b.sweep(leg, [0.055, 0.04], { color: chitinPaint, section: { ngon: 6 } });
      // lower leg thinner + foot spike
      b.sweep(polyline([pts[1].toArray() as [number, number, number], target]), [0.038, 0.014], {
        bone: [leg.joints[1]],
        color: CABLE,
        section: { ngon: 6 },
      });
      b.spike(target, [target[0] + s * 0.03, target[1] - 1, target[2]], 0.09, 0.016, {
        bone: leg.tip ?? leg.joints[1],
        color: BONE_DARK,
      });
      // knee barb
      b.spike(pts[1], [s * 0.7, 1, -0.2], 0.1, 0.018, { bone: leg.joints[1], color: BONE });
      li++;
    }
  }

  // ---------- raised scythe forelimbs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root: [number, number, number] = [s * 0.2, 1.0, 0.78];
    const target: [number, number, number] = [s * 0.72, 1.78, 1.02];
    const pts = limb(root, target, [0.55, 0.75], [[s * 1, 0.5, 0]]);
    const arm = b.chain(`scythe${side}`, pts, {
      parent: thoraxJ,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const armTube = b.sweep(arm, [0.06, 0.045], { color: chitinPaint, section: { ngon: 6 } });
    // scythe blade: broad flat fang
    const wrist = pts[2];
    b.extrude(
      [
        [0, 0],
        [0.16, 0.1],
        [0.3, 0.5, "sharp"],
        [0.2, 0.62],
        [0.02, 0.3],
      ],
      {
        at: [wrist.x, wrist.y - 0.05, wrist.z],
        x: [s, 0, 0],
        y: [s * 0.25, 1, 0.15],
        thickness: [0.035, 0.008],
        bevel: 0.006,
        smoothing: 1,
        color: BONE,
        bone: arm.tip ?? arm.joints[1],
      },
    );
    // elbow barb + arm rings
    b.spike(pts[1], [s * 1, 0.2, -0.6], 0.16, 0.02, { bone: arm.joints[1], color: BONE_DARK });
    b.along(
      arm,
      3,
      (at) => {
        const sp = armTube.at(at.t, 90, 0.004);
        b.stick(new THREE.SphereGeometry(0.02, 7, 5), BONE_DARK, sp, { embed: 0.4 });
      },
      { from: 0.05, to: 0.5 },
    );
  }

  // ---------- thorax side armour ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const plate = b.surface(thoraxTube).nearest([s * 0.24, 0.9 - i * 0.1, 0.28 + i * 0.16]);
      if (plate)
        b.stick(new THREE.SphereGeometry(0.075 - i * 0.01, 8, 6), BONE_DARK, plate, {
          embed: 0.5,
          scale: [0.5, 1.0, 1.3],
        });
    }
  }

  // ---------- ribbed tubes thorax -> abdomen ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      const y0 = 0.98 - i * 0.14;
      const tubeCurve = catmull([
        [s * 0.2, y0, 0.55],
        [s * 0.42, y0 - 0.08, 0.0],
        [s * 0.46, 0.8 - i * 0.1, -0.5],
        [s * 0.36, 0.68 - i * 0.08, -0.85],
      ]);
      b.sweep(tubeCurve, [0.045, 0.055, 0.05, 0.03], {
        bone: [thoraxJ, pelvis, abdomen.joints[0]],
        color: ribPaint,
        section: { ngon: 7 },
      });
    }
  }

  // ---------- glowing green sacs ----------
  const sacSpots: Array<[number, number, number, number]> = [
    [0.2, 0.78, 0.35, 0.075],
    [-0.2, 0.78, 0.35, 0.075],
    [0.3, 0.7, -0.35, 0.09],
    [-0.3, 0.7, -0.35, 0.09],
    [0.24, 0.6, -0.7, 0.075],
    [-0.24, 0.6, -0.7, 0.075],
    [0, 0.9, -1.05, 0.1],
  ];
  const surf = b.surface(abdTube);
  for (const [x, y, z, r] of sacSpots) {
    const hit = surf.nearest([x, y, z]);
    if (!hit) continue;
    const sac = b.stick(new THREE.SphereGeometry(r, 10, 7), SAC, hit, { embed: 0.35 });
    glow(sac, 1.4);
    // cable tendrils gripping each sac
    for (const deg of [30, 150, 270]) {
      const rim = surf.nearest(
        hit.moved([Math.cos((deg * Math.PI) / 180) * r * 1.1, -r * 0.4, Math.sin((deg * Math.PI) / 180) * r * 1.1]),
      );
      if (rim) b.rod(hit.moved([0, r * 0.9, 0]), rim, 0.01, { color: CABLE });
    }
  }
  // throat sac under neck
  const throatHit = b.surface(headTube).nearest([0, 0.9, 1.1]);
  if (throatHit) glow(b.stick(new THREE.SphereGeometry(0.06, 10, 7), SAC_DEEP, throatHit, { embed: 0.3 }), 1.2);

  // ---------- tail stinger + ovipositor ----------
  b.sweep(
    catmull([
      [0, 0.52, -1.42],
      [0, 0.52, -1.56],
      [0, 0.62, -1.64],
    ]),
    [0.05, 0.03, 0.004],
    { bone: [abdomen.joints[3]], color: BONE_DARK, caps: { end: "point" } },
  );
  // dorsal spines along abdomen
  b.along(abdTube, 5, (at) => b.spike(at, at, 0.12, 0.025, { color: BONE }), { from: 0.15, to: 0.7 });

  // ---------- cables / whiskers on head ----------
  const flankSurf = b.surface(thoraxTube);
  for (const s of [1, -1]) {
    const base = b.surface(headTube).nearest([s * 0.14, 1.02, 1.2]);
    if (!base) continue;
    const anchor = flankSurf.nearest([s * 0.24, 0.9, 0.5]);
    const end = anchor ? anchor.at : [s * 0.24, 0.9, 0.5];
    b.sweep(bezier(base.at, offset(base.at, [s * 0.3, -0.2, -0.5], 0.25), end), [0.02, 0.01], {
      color: CABLE,
    });
  }

  return b.root;
}
