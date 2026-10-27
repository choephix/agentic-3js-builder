import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle perched on a carved cathedral ledge, with folded haunches, claws, horns, fangs, and broad bat wings.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = "#55545a";
  const STONE_LIGHT = "#77747a";
  const STONE_DARK = "#37363d";
  const STONE_SHADOW = "#292930";
  const EDGE = "#99939a";
  const EYE = "#d49a3e";
  const EYE_DARK = "#241611";
  const MOUTH = "#17151a";
  const LEDGE = "#403f46";
  const MOSS = "#52604b";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    bone?: any,
    scale?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      bone,
      scale,
      name,
      flat: true,
    });

  const cone = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, 7), color, {
      at,
      bone,
      name,
      flat: true,
    });

  // The named stone ledge is deliberately simple so the creature remains the hero.
  box([1.9, 0.18, 1.18], LEDGE, [0, 0.09, 0], undefined, "ledge");
  box([2.02, 0.08, 1.28], STONE_DARK, [0, 0.22, 0], undefined, "ledge_cap");
  box([1.65, 0.08, 0.12], STONE_LIGHT, [0, 0.275, 0.53], undefined, "ledge_front_trim");
  for (const x of [-0.72, -0.25, 0.25, 0.72]) {
    box([0.16, 0.025, 0.035], MOSS, [x, 0.275, 0.56], undefined, "moss_chip");
  }

  // Skeleton first: a compact, heavy crouching spine.
  const hips = b.joint("hips", {
    at: [0, 0.9, -0.18],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.02, 0.89, -0.25],
      [0, 1.02, -0.02],
      [0, 1.1, 0.25],
      [0, 1.18, 0.48],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.16, 0.42],
      [0, 1.29, 0.58],
      [0, 1.39, 0.68],
    ]),
    { parent: spine.tip, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.43, 0.71],
    dir: [0, 0.08, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.35, 0.79],
    dir: [0, -0.1, 1],
    role: "jaw",
  });

  // Tail curls behind and then rests on the ledge.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.94, -0.34],
      [0, 0.76, -0.58],
      [0, 0.58, -0.78],
      [0.08, 0.43, -0.96],
      [0.2, 0.34, -1.02],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // Leg skeletons, bent outward and forward in a readable crouch.
  const legData = [
    { s: 1, hip: [0.27, 0.91, -0.12] as [number, number, number], knee: [0.43, 0.62, 0.08] as [number, number, number], ankle: [0.36, 0.3, 0.34] as [number, number, number], foot: [0.36, 0.28, 0.47] as [number, number, number], n: "L" },
    { s: -1, hip: [-0.27, 0.91, -0.12] as [number, number, number], knee: [-0.43, 0.62, 0.08] as [number, number, number], ankle: [-0.36, 0.3, 0.34] as [number, number, number], foot: [-0.36, 0.28, 0.47] as [number, number, number], n: "R" },
  ];

  const legs: any[] = [];
  for (const d of legData) {
    const leg = b.chain(
      `leg${d.n}`,
      polyline([d.hip, d.knee, d.ankle, d.foot]),
      {
        parent: hips,
        names: [`hip${d.n}`, `knee${d.n}`, `ankle${d.n}`, `foot${d.n}`],
        role: "leg",
        contact: d.foot,
      },
    );
    legs.push(leg);
  }

  // Long arms brace against the ledge, elbows raised in a gargoyle crouch.
  const arms: any[] = [];
  for (const d of [
    { s: 1, shoulder: [0.3, 1.19, 0.35] as [number, number, number], elbow: [0.52, 0.84, 0.33] as [number, number, number], hand: [0.62, 0.3, 0.48] as [number, number, number], n: "L" },
    { s: -1, shoulder: [-0.3, 1.19, 0.35] as [number, number, number], elbow: [-0.52, 0.84, 0.33] as [number, number, number], hand: [-0.62, 0.3, 0.48] as [number, number, number], n: "R" },
  ]) {
    arms.push(
      b.chain(
        `arm${d.n}`,
        polyline([d.shoulder, d.elbow, d.hand]),
        {
          parent: spine,
          names: [`shoulder${d.n}`, `elbow${d.n}`, `hand${d.n}`],
          role: "arm",
          contact: d.hand,
        },
      ),
    );
  }

  // Wing skeletons: broad, still wings extended like carved architectural buttresses.
  const wingChains: any[] = [];
  for (const d of [
    { s: 1, n: "L" },
    { s: -1, n: "R" },
  ]) {
    const shoulder: [number, number, number] = [0.29 * d.s, 1.22, 0.32];
    const wing = b.chain(
      `wing${d.n}`,
      polyline([
        shoulder,
        [0.58 * d.s, 1.5, 0.2],
        [0.92 * d.s, 1.68, -0.03],
        [1.18 * d.s, 1.53, -0.2],
      ]),
      {
        parent: spine.tip,
        names: [`wingRoot${d.n}`, `wingMid${d.n}`, `wingTip${d.n}`],
        role: "wing",
      },
    );
    wingChains.push(wing);
  }

  // Continuous body tubes.
  b.sweep(spine, (t: number) => 0.22 - t * 0.045, {
    color: STONE,
    section: { ngon: 8 },
    name: "carved_spine",
  });
  b.sweep(neck, [0.17, 0.13], {
    color: STONE_LIGHT,
    section: { ngon: 8 },
    name: "carved_neck",
  });
  b.sweep(tail, [0.13, 0.025], {
    color: STONE_DARK,
    section: { ngon: 7 },
    name: "carved_tail",
  });

  for (let i = 0; i < legs.length; i++) {
    b.sweep(legs[i], [0.105, 0.075], {
      color: STONE_DARK,
      section: { ngon: 6 },
      name: `leg_tube_${i}`,
    });
    const s = i === 0 ? 1 : -1;
    // Heavy angular haunch plate.
    box([0.3, 0.28, 0.3], STONE, [0.3 * s, 0.78, -0.1], legs[i].joints[0], "haunch");
    sphere(0.12, STONE_LIGHT, [0.36 * s, 0.31, 0.36], legs[i].tip, [1.15, 0.65, 1.5], "ankle_pad");
  }

  for (let i = 0; i < arms.length; i++) {
    b.sweep(arms[i], [0.075, 0.052], {
      color: STONE,
      section: { ngon: 6 },
      name: `arm_tube_${i}`,
    });
  }

  // Feet and hands: chunky claws visibly gripping the ledge.
  for (const d of legData) {
    sphere(0.095, STONE_LIGHT, d.foot, undefined, [1.2, 0.55, 1.25], "foot_palm");
    for (let k = -1; k <= 1; k++) {
      const x = d.foot[0] + k * 0.055;
      b.spike(
        [x, 0.285, 0.49],
        [0, -0.15, 1],
        0.15,
        0.023,
        { color: EDGE, name: "foot_claw" },
      );
    }
  }
  for (const d of [
    { s: 1, p: [0.62, 0.3, 0.48] as [number, number, number] },
    { s: -1, p: [-0.62, 0.3, 0.48] as [number, number, number] },
  ]) {
    sphere(0.09, STONE_LIGHT, d.p, undefined, [1.2, 0.55, 1.15], "hand_palm");
    for (let k = -1; k <= 1; k++) {
      b.spike(
        [d.p[0] + k * 0.045, 0.29, 0.53],
        [0, -0.2, 1],
        0.14,
        0.018,
        { color: EDGE, name: "hand_claw" },
      );
    }
  }

  // Head silhouette: brow, muzzle, separate open lower jaw.
  sphere(0.27, STONE_LIGHT, [0, 1.46, 0.72], head, [1.0, 1.08, 0.92], "gargoyle_skull");
  box([0.32, 0.16, 0.2], STONE, [0, 1.34, 0.88], jaw, "lower_jaw");
  box([0.38, 0.13, 0.2], STONE_DARK, [0, 1.4, 0.89], head, "mouth_cavity");
  sphere(0.08, STONE_LIGHT, [0, 1.42, 0.98], head, [1.55, 0.75, 0.75], "muzzle");
  sphere(0.045, STONE_DARK, [0, 1.45, 1.04], head, [1.2, 0.75, 0.6], "nose");

  // Eyes, brows and deliberately oversized fangs.
  for (const s of [1, -1]) {
    sphere(0.052, EYE_DARK, [0.105 * s, 1.51, 0.91], head, [1, 1, 0.35], "eye_socket");
    sphere(0.027, EYE, [0.105 * s, 1.51, 0.935], head, [1, 1, 0.3], "amber_eye");
    box([0.15, 0.045, 0.055], STONE_DARK, [0.1 * s, 1.57, 0.9], head, "heavy_brow");
    b.spike(
      [0.095 * s, 1.39, 0.98],
      [0, -1, 0.08],
      0.105,
      0.024,
      { color: EDGE, name: "fang" },
    );
  }

  // Horns sweep upward and outward.
  for (const s of [1, -1]) {
    const horn = catmull([
      [0.16 * s, 1.61, 0.72],
      [0.24 * s, 1.78, 0.68],
      [0.34 * s, 1.87, 0.57],
      [0.4 * s, 1.89, 0.43],
    ]);
    b.sweep(horn, [0.065, 0.008], {
      color: STONE_DARK,
      caps: "point",
      name: "horn",
    });
    for (let j = 0; j < 3; j++) {
      const p = horn.at(0.25 + j * 0.2);
      b.ring({ at: p, axis: horn.tangentAt(0.25 + j * 0.2) }, { count: 6, radius: 0.008, fromDeg: 0, toDeg: 360 }, (r: any) =>
        b.spike(r, r, 0.018, 0.004, { color: EDGE, name: "horn_ridge" }),
      );
    }
  }

  // Wing membranes between the articulated leading edge and ragged trailing edge.
  for (let i = 0; i < wingChains.length; i++) {
    const s = i === 0 ? 1 : -1;
    const wing = wingChains[i];
    const edgeA = wing.path;
    const edgeB = polyline([
      [0.3 * s, 1.18, 0.12],
      [0.52 * s, 1.27, -0.18],
      [0.82 * s, 1.37, -0.42],
      [1.08 * s, 1.3, -0.55],
    ]);
    b.membrane(edgeA, edgeB, {
      color: STONE_DARK,
      thickness: 0.018,
      rows: 4,
      cols: 8,
      scallop: 0.15,
      name: "wing_membrane",
    });

    // Raised stone ribs divide the wing like gothic tracery.
    for (const t of [0.25, 0.5, 0.75]) {
      b.rod(
        wing.at(t).at,
        edgeB.at(t),
        0.018,
        { color: STONE_LIGHT, name: "wing_rib" },
      );
    }
  }

  // Small dorsal stone spines and shoulder ornaments.
  b.along(spine, 5, (p: any) =>
    b.spike(p, p, 0.09, 0.027, { color: EDGE, name: "back_spine" }),
  );
  for (const s of [1, -1]) {
    cone(0.11, 0.22, STONE_LIGHT, [0.34 * s, 1.29, 0.27], spine, "shoulder_boss");
  }

  // A few intentional carved chips give the silhouette age without adding scenery.
  const chips = [
    [0.23, 1.02, 0.4],
    [-0.2, 1.11, 0.37],
    [0.18, 0.83, -0.29],
    [-0.3, 0.68, 0.18],
    [0.0, 0.54, -0.72],
  ] as [number, number, number][];
  for (const p of chips) {
    b.part(new THREE.TetrahedronGeometry(0.035, 0), STONE_LIGHT, {
      at: p,
      name: "carved_chip",
      flat: true,
    });
  }

  return b.root;
}
