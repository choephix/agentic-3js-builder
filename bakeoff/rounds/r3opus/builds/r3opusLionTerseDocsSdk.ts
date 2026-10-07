import * as THREE from "three";
import {
  createBuilder,
  limb,
  catmull,
  svg,
  mottle,
  countershade,
  gradient,
  spots,
} from "../../../../src/index";

export const meta = {
  name: "Lion",
  description:
    "A stylised low-poly male lion in a neutral rest pose. It has a layered, faceted mane in gold, rust and chocolate, amber decal eyes, a separate jaw with fangs, elbow tufts and a dark tail tuft.",
};

// deterministic hash in 0..1 (no Math.random)
const hash = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export default function build() {
  const b = createBuilder({ name: "lion" });

  // ---------- palette ----------
  const TAN = "#d9a65a";
  const TAN2 = "#bf8540";
  const CREAM = "#f3dfb2";
  const MUZZLE = "#efd29a";
  const PAW = "#e6c486";
  const GOLD = "#e0a238";
  const LIGHTGOLD = "#efbf5c";
  const MID = "#a9561f";
  const DARK = "#5a2a14";
  const NOSE = "#4a2622";
  const MOUTH = "#3a1414";
  const TOOTH = "#fff4dc";
  const WHISKER = "#fffaf0";
  const EAR_IN = "#8a4f3a";
  const EAR_BACK = "#2e1a10";

  const coat = countershade(mottle(TAN, TAN2, { size: 0.3, contrast: 0.35, seed: 3 }), CREAM, {
    level: -0.35,
  });
  const manePaint = mottle(MID, DARK, { size: 0.12, contrast: 0.6, seed: 9 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.95, -0.6], aim: [0, 0.96, -0.35], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.96, -0.35],
      [0, 0.98, 0.05],
      [0, 1.0, 0.4],
      [0, 1.01, 0.6],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.02, 0.62],
      [0, 1.15, 0.78],
      [0, 1.25, 0.9],
    ]),
    { parent: spine, count: 2, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.25, 0.9], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, up: -0.12 }),
    aim: head.local({ forward: 0.3, up: -0.14 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.0, -0.72],
      [0, 0.86, -0.98],
      [0, 0.6, -1.22],
      [0, 0.45, -1.48],
      [0, 0.47, -1.7],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.9, -0.74], w: 0.38, h: 0.48 },
      { at: [0, 0.9, -0.5], w: 0.44, h: 0.56 },
      { at: [0, 0.92, -0.1], w: 0.4, h: 0.46 },
      { at: [0, 0.88, 0.3], w: 0.48, h: 0.62 },
      { at: [0, 0.95, 0.6], w: 0.4, h: 0.5 },
    ],
    { bone: [hips, spine], color: coat },
  );
  b.sweep(neck, [0.17, 0.15], { color: coat });

  // tail with dark tip
  const tailEnd = tail.at(1);
  b.sweep(tail, (t) => 0.045 * (1 - t) + 0.02, {
    color: gradient(coat, DARK, tail.at(0.8).at, tailEnd.at),
  });
  const tailTipJoint = tail.joints[tail.joints.length - 1];
  b.part(new THREE.IcosahedronGeometry(0.055, 0), DARK, { at: tailEnd.at, bone: tailTipJoint, flat: true });
  b.spike(tailEnd, tailEnd, 0.15, 0.035, { color: DARK, section: { ngon: 5 } });
  b.ring(tailEnd, { count: 7, radius: 0.02, tilt: 45 }, (it) =>
    b.spike(it, it, 0.1 + 0.03 * hash(it.i), 0.024, { color: it.i % 2 ? DARK : MID, section: { ngon: 4 } }),
  );

  // ---------- legs ----------
  const paw = (bone: any, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(0.5, 8, 5), PAW, {
      bone,
      at: [x, 0.05, z + 0.03],
      scale: [0.13, 0.1, 0.17],
      flat: true,
    });
    for (const k of [-1.5, -0.5, 0.5, 1.5])
      b.part(new THREE.SphereGeometry(0.034, 6, 4), PAW, {
        bone,
        at: [x + k * 0.03, 0.032, z + 0.1 - Math.abs(k) * 0.015],
        flat: true,
      });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front leg
    const fx = s * 0.17;
    const fpts = limb([fx, 0.9, 0.42], [fx, 0.07, 0.5], [0.36, 0.34, 0.16], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const fl = b.chain(`legF${side}`, fpts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.085, 0.066, 0.052, 0.05], { color: coat });
    b.part(new THREE.SphereGeometry(0.5, 8, 6), coat, {
      bone: fl.joints[0],
      at: [s * 0.18, 0.86, 0.42],
      scale: [0.16, 0.38, 0.3],
      flat: true,
    });
    // elbow tuft
    b.spike(fl.joints[1].local({ back: 0.045 }), [0, -0.4, -1], 0.08, 0.03, {
      color: DARK,
      bone: fl.joints[1],
      section: { ngon: 4 },
    });
    paw(fl.joints[fl.joints.length - 1], fx, 0.5);

    // hind leg
    const hx = s * 0.16;
    const hpts = limb([hx, 0.9, -0.6], [hx, 0.07, -0.56], [0.38, 0.36, 0.22], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hl = b.chain(`legH${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.1, 0.07, 0.052, 0.05], { color: coat });
    b.part(new THREE.SphereGeometry(0.5, 8, 6), coat, {
      bone: hl.joints[0],
      at: [s * 0.16, 0.84, -0.56],
      scale: [0.18, 0.4, 0.36],
      flat: true,
    });
    paw(hl.joints[hl.joints.length - 1], hx, -0.56);
  }

  // ---------- head ----------
  const cranium = b.part(new THREE.SphereGeometry(0.5, 8, 6), coat, {
    bone: head,
    at: head.local({ forward: 0.05, up: 0.04 }),
    scale: [0.36, 0.32, 0.36],
    flat: true,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.08, 7, 5), coat, {
      bone: head,
      at: head.local({ left: s * 0.12, up: -0.04, forward: 0.12 }),
      flat: true,
    });
  }
  // muzzle, bridge, nose
  b.frustumBox(head.local({ forward: 0.12, up: -0.04 }), head.local({ forward: 0.31, up: -0.06 }), [0.22, 0.15], [0.18, 0.12], {
    bone: head,
    color: MUZZLE,
  });
  b.frustumBox(head.local({ forward: 0.1, up: 0.08 }), head.local({ forward: 0.3, up: 0.0 }), [0.1, 0.06], [0.09, 0.05], {
    bone: head,
    color: TAN2,
  });
  b.extrude(
    [
      [-0.05, 0],
      [0.05, 0],
      [0.012, -0.05],
      [-0.012, -0.05],
    ],
    {
      at: head.local({ forward: 0.315, up: 0.012 }),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.008,
      smoothing: 1,
      color: NOSE,
      bone: head,
    },
  );
  b.part(new THREE.BoxGeometry(0.008, 0.05, 0.01), NOSE, {
    bone: head,
    at: head.local({ forward: 0.312, up: -0.065 }),
  });
  // mouth interior + fangs
  b.part(new THREE.BoxGeometry(0.15, 0.03, 0.18), MOUTH, {
    bone: head,
    at: head.local({ forward: 0.2, up: -0.11 }),
  });
  for (const s of [1, -1]) {
    b.spike(head.local({ left: s * 0.07, forward: 0.285, up: -0.1 }), [0, -1, 0.1], 0.05, 0.012, {
      color: TOOTH,
      bone: head,
      section: { ngon: 5 },
    });
  }
  // lower jaw
  b.frustumBox(jaw.at, head.local({ forward: 0.29, up: -0.14 }), [0.18, 0.06], [0.13, 0.05], {
    bone: jaw,
    color: CREAM,
  });

  // whisker pads + whiskers
  const padPaint = spots(CREAM, NOSE, { size: 0.022, amount: 0.22, seed: 5 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 7, 5), padPaint, {
      bone: head,
      at: head.local({ left: s * 0.045, forward: 0.29, up: -0.07 }),
      scale: [1, 0.8, 0.8],
      flat: true,
    });
    for (let k = 0; k < 3; k++) {
      b.rod(
        head.local({ left: s * 0.075, forward: 0.3, up: -0.06 + k * 0.015 }),
        head.local({ left: s * 0.26, forward: 0.3 - k * 0.03, up: -0.09 + k * 0.035 }),
        0.0025,
        { color: WHISKER, bone: head, sides: 4 },
      );
    }
  }

  // brows
  for (const s of [1, -1]) {
    b.capsule(
      head.local({ left: s * 0.035, up: 0.135, forward: 0.19 }),
      head.local({ left: s * 0.13, up: 0.12, forward: 0.15 }),
      0.022,
      { color: TAN2, bone: head, sides: 6 },
    );
  }

  // eyes (decals)
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70">
      <path d="M6 42 Q 44 0 94 20 Q 72 62 28 60 Z" fill="#f6ead0"/>
      <path d="M12 37 Q 46 7 89 23 Q 66 51 32 49 Z" fill="#24140c"/>
      <path d="M19 35 Q 46 14 82 26 Q 64 45 34 43 Z" fill="#f2c25a"/>
      <ellipse cx="50" cy="30" rx="14" ry="12" fill="#e39a22" stroke="#8a4a10" stroke-width="2.5"/>
      <ellipse cx="50" cy="30" rx="5" ry="7" fill="#100804"/>
      <circle cx="56" cy="25" r="3.2" fill="#ffffff"/>
      <circle cx="44" cy="35" r="1.6" fill="#fff3d0"/>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.decal(cranium, eyeTex, {
      at: head.local({ left: s * 0.085, up: 0.09, forward: 0.21 }),
      dir: [s * 0.3, 0.05, 1],
      size: [0.085, 0.06],
      mirror: s < 0,
      bone: head,
    });
  }

  // ears
  for (const s of [1, -1]) {
    const ear = head.local({ left: s * 0.13, up: 0.15, forward: 0.04 });
    b.extrude(
      [
        [-0.06, 0],
        [0.06, 0],
        [0.055, 0.05],
        [0.02, 0.085],
        [-0.02, 0.085],
        [-0.055, 0.05],
      ],
      { at: ear, x: [1, 0, 0], y: [0, 1, -0.25], thickness: 0.03, bevel: 0.008, smoothing: 1, color: TAN2, bone: head },
    );
    b.extrude(
      [
        [-0.038, 0],
        [0.038, 0],
        [0.034, 0.035],
        [0.012, 0.058],
        [-0.012, 0.058],
        [-0.034, 0.035],
      ],
      {
        at: head.local({ left: s * 0.13, up: 0.162, forward: 0.052 }),
        x: [1, 0, 0],
        y: [0, 1, -0.25],
        thickness: 0.012,
        smoothing: 1,
        color: EAR_IN,
        bone: head,
      },
    );
    b.extrude(
      [
        [-0.05, 0],
        [0.05, 0],
        [0.046, 0.045],
        [0.016, 0.075],
        [-0.016, 0.075],
        [-0.046, 0.045],
      ],
      {
        at: head.local({ left: s * 0.13, up: 0.158, forward: 0.028 }),
        x: [1, 0, 0],
        y: [0, 1, -0.25],
        thickness: 0.012,
        smoothing: 1,
        color: EAR_BACK,
        bone: head,
      },
    );
  }

  // ---------- mane ----------
  const maneCore = b.part(new THREE.SphereGeometry(0.5, 9, 7), manePaint, {
    bone: neck.joints[1],
    at: [0, 1.17, 0.7],
    scale: [0.62, 0.68, 0.55],
    flat: true,
  });

  const maneRing = (
    back: number,
    radius: number,
    count: number,
    tilt: number,
    len: number,
    r: number,
    cols: string[],
    seed: number,
  ) => {
    const step = 360 / count;
    const from = seed % 2 ? step / 2 : 0;
    b.ring(
      head.moved(head.local({ back, up: 0.02 })),
      { count, radius, tilt, fromDeg: from, toDeg: from + 360 - step },
      (it) => {
        const j = hash(it.i + seed * 31);
        b.spike(it, it, len * (0.8 + 0.4 * j), r, {
          color: cols[it.i % cols.length],
          section: { ngon: 5 },
        });
      },
    );
  };
  maneRing(0.0, 0.16, 16, -25, 0.16, 0.055, [GOLD, LIGHTGOLD], 1);
  maneRing(0.1, 0.2, 14, -50, 0.24, 0.075, [MID, GOLD], 2);
  maneRing(0.22, 0.22, 12, -70, 0.3, 0.09, [DARK, MID], 3);

  // shaggy chest fringe and shoulder locks off the mane core
  const maneSurf = b.surface(maneCore);
  const maneCenter: [number, number, number] = [0, 1.17, 0.7];
  let k = 0;
  for (const el of [-30, -55]) {
    for (let az = -50; az <= 50; az += 20) {
      const hit = maneSurf.around(maneCenter).at(az + (el < -40 ? 10 : 0), el);
      k++;
      if (!hit) continue;
      const n = hit.n;
      b.spike(hit, [n.x, n.y - 0.9, n.z], 0.18 + 0.08 * hash(k), 0.07, {
        color: k % 3 === 0 ? GOLD : k % 3 === 1 ? MID : DARK,
        section: { ngon: 5 },
      });
    }
  }
  for (const el of [15, 45]) {
    for (let az = 120; az <= 240; az += 24) {
      const hit = maneSurf.around(maneCenter).at(az, el);
      k++;
      if (!hit) continue;
      const n = hit.n;
      b.spike(hit, [n.x, n.y, n.z - 0.7], 0.2 + 0.08 * hash(k), 0.08, {
        color: k % 2 ? DARK : MID,
        section: { ngon: 5 },
      });
    }
  }

  return b.root;
}
