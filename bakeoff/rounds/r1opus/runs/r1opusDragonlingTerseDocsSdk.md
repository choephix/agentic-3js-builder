```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  bezier,
  limb,
  svg,
  paint,
  scales,
  spots,
  gradient,
} from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby teal baby dragon in a rigging rest pose: wings spread, tail curling to a golden spade, big amber eyes, and a cracked eggshell still stuck on its head.",
};

// Palette
const TEAL = "#2bb39a";
const TEAL_D = "#18756f";
const DEEP = "#1b5e74";
const SPOTC = "#7fe0c4";
const BELLY = "#ffd08a";
const BELLY_L = "#e89a52";
const SPIKE = "#ffb53b";
const CLAW = "#fbf1da";
const HORN = "#f4e3bb";
const HORN_D = "#d9b77a";
const WING_IN = "#7b3fa0";
const WING_OUT = "#ff7a8a";
const WING_SP = "#ffc6b4";
const EGG = "#fff6e4";
const SPECK = "#c7a27a";
const CRACK = "#8a6a4a";
const BLUSH = "#ff8fa6";
const NOSE = "#123f45";
const TOOTH = "#ffffff";
const WHITE = "#fdfdf8";

function must<T>(h: T | null | undefined, what: string): T {
  if (!h) throw new Error(`missing hit: ${what}`);
  return h;
}

export default function build() {
  const b = createBuilder({ name: "babyDragon" });

  // ---------- Paints ----------
  const scalePaint = scales(TEAL, TEAL_D, { size: 0.03 });
  const backPaint = spots(DEEP, SPOTC, { size: 0.07, amount: 0.25, seed: 5 });
  const bellyPaint = paint((_p, _n, s) => ((s[0] * 70) % 1 < 0.18 ? BELLY_L : BELLY));
  const footPaint = gradient(scalePaint, TEAL_D, [0, 0.12, 0], [0, 0.02, 0]);
  const hornPaint = paint((_p, _n, s) => (Math.floor(s[0] * 7) % 2 === 0 ? HORN : HORN_D));
  const shellBase = spots(EGG, SPECK, { size: 0.025, amount: 0.3, seed: 3 });
  const shellPaint = paint((_p, _n, s) => {
    const tri = Math.abs((((s[1] / 20) % 2) + 2) % 2 - 1);
    const z = 0.004 + 0.012 * tri;
    return Math.abs(s[0] - z) < 0.0025 ? CRACK : shellBase;
  });

  // ---------- Body curve & skeleton ----------
  const bodyPath = catmull([
    [0, 0.14, -1.0], // tail tip, curling up
    [0, 0.035, -0.82], // tail resting on the floor
    [0, 0.09, -0.58],
    [0, 0.2, -0.32],
    [0, 0.29, -0.08], // hips
    [0, 0.31, 0.1],
    [0, 0.35, 0.22], // shoulders
    [0, 0.45, 0.3],
    [0, 0.56, 0.33], // head base
  ]);
  const tH = bodyPath.closestT([0, 0.29, -0.08]);
  const tC = bodyPath.closestT([0, 0.35, 0.22]);

  const hips = b.joint("hips", { at: bodyPath.at(tH) });
  const spine = b.chain("spine", bodyPath.slice(tH, tC), {
    parent: hips,
    count: 2,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain("neck", bodyPath.slice(tC, 1), {
    parent: spine.joints[1],
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const tail = b.chain("tail", bodyPath.slice(tH, 0), { parent: hips, count: 6, role: "tail" });
  const head = b.joint("head", { parent: neck.joints[1], at: bodyPath.at(1), dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.53, 0.38], aim: [0, 0.515, 0.54], role: "jaw" });

  // ---------- Body tube ----------
  const bodyR = (t: number): [number, number] => {
    let r: number;
    if (t <= tH) r = 0.018 + 0.097 * Math.pow(t / tH, 1.6);
    else if (t <= tC) {
      const u = (t - tH) / (tC - tH);
      r = 0.115 + 0.03 * Math.sin(Math.PI * u) - 0.025 * u;
    } else {
      const v = (t - tC) / (1 - tC);
      r = 0.09 - 0.03 * v;
    }
    return [r * 1.05, r * 1.1];
  };
  const body = b.sweep(bodyPath, bodyR, {
    bone: [tail, spine, neck, head],
    color: scalePaint,
    sides: 10,
    shift: (t: number): [number, number] => {
      if (t <= tH || t >= tC) return [0, 0];
      const u = (t - tH) / (tC - tH);
      return [0, -0.02 * Math.sin(Math.PI * u)];
    },
    sectors: [
      [-28, 28, backPaint, 0.04, 0.97],
      [125, 235, bellyPaint, 0.02, 1],
    ],
    name: "body",
  });

  // Dorsal spikes
  b.along(
    body,
    18,
    (at) => {
      const r = bodyR(at.t)[0];
      b.spike(at.moved([0, -r * 0.06, 0]), at, r * 0.6, r * 0.24, { color: SPIKE, section: { ngon: 4 } });
    },
    { from: 0.06, to: 0.93 },
  );

  // Tail spade
  b.extrude(
    [
      [-0.02, 0],
      [0.04, 0.055],
      [0.13, 0, "sharp"],
      [0.04, -0.055],
    ],
    {
      at: bodyPath.at(0),
      x: [0, 0.5, -0.86],
      y: [0, 0.86, 0.5],
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: SPIKE,
      bone: tail.joints[tail.joints.length - 1],
      name: "tailSpade",
    },
  );

  // ---------- Legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Front leg
    const fPts = limb([s * 0.085, 0.3, 0.17], [s * 0.1, 0.028, 0.22], [0.15, 0.14, 0.06], [[0, 0, -1]], {
      sole: [0, 0, 1],
    });
    const fLeg = b.chain(`legF${S}`, polyline(fPts), {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.21],
    });
    b.sweep(fLeg, [0.045, 0.036, 0.03, 0.028], { color: footPaint, sides: 8 });

    // Hind leg
    const hPts = limb(
      [s * 0.08, 0.26, -0.09],
      [s * 0.11, 0.028, 0.02],
      [0.11, 0.1, 0.08, 0.06],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const hLeg = b.chain(`legH${S}`, polyline(hPts), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`, `toe${S}`],
      role: "leg",
      contact: [s * 0.11, 0, 0.01],
    });
    b.sweep(hLeg, [0.05, 0.04, 0.032, 0.028, 0.028], { color: footPaint, sides: 8 });
    // Chubby haunch
    b.part(new THREE.SphereGeometry(0.075, 8, 6), scalePaint, {
      bone: hLeg.joints[0],
      at: [s * 0.1, 0.25, -0.09],
      scale: [0.8, 1, 1.1],
      flat: true,
    });

    // Toes and claws on both feet
    for (const [pts, tipJ] of [
      [fPts, fLeg.tip!],
      [hPts, hLeg.tip!],
    ] as const) {
      const heel = pts[pts.length - 2];
      const toe = pts[pts.length - 1];
      for (const k of [-1, 0, 1]) {
        const a = [toe.x + k * 0.014, 0.018, heel.z + 0.02];
        const c = [toe.x + k * 0.026, 0.016, toe.z + 0.035];
        b.capsule(a, c, 0.016, { color: TEAL_D, bone: tipJ, sides: 6 });
        b.spike([c[0], c[1] + 0.002, c[2] + 0.008], [k * 0.3, -0.35, 1], 0.03, 0.009, {
          color: CLAW,
          bone: tipJ,
          sides: 5,
        });
      }
    }
  }

  // ---------- Wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const root = [s * 0.07, 0.41, 0.13];
    const elbow = [s * 0.24, 0.47, 0.1];
    const wristP = [s * 0.42, 0.53, 0.1];
    const arm = b.chain(`wing${S}`, polyline([root, elbow, wristP]), {
      parent: spine.joints[1],
      names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    const wrist = arm.tip!;
    b.sweep(arm, [0.026, 0.02, 0.016], { color: TEAL_D, sides: 7 });

    const fingerDefs = [
      [
        [s * 0.62, 0.62, 0.07],
        [s * 0.78, 0.66, 0.0],
      ],
      [
        [s * 0.58, 0.48, -0.03],
        [s * 0.7, 0.42, -0.14],
      ],
      [
        [s * 0.47, 0.4, -0.06],
        [s * 0.5, 0.3, -0.2],
      ],
    ];
    const fingers = fingerDefs.map((f, i) =>
      b.chain(`wingFinger${i + 1}${S}`, catmull([wristP, f[0], f[1]]), {
        parent: wrist,
        count: 2,
        names: [`wingFinger${i + 1}${S}1`, `wingFinger${i + 1}${S}2`],
        role: "digit",
      }),
    );
    for (const f of fingers)
      b.sweep(f, [0.012, 0.004], { color: TEAL_D, sides: 6, caps: { start: "round", end: "point" } });

    const wingPaint = spots(
      gradient(WING_IN, WING_OUT, [s * 0.1, 0.4, 0.1], [s * 0.75, 0.55, -0.05]),
      WING_SP,
      { size: 0.06, amount: 0.18, seed: 11 },
    );
    b.membrane(fingers[0], fingers[1], { thickness: 0.006, color: wingPaint, scallop: 0.12 });
    b.membrane(fingers[1], fingers[2], { thickness: 0.006, color: wingPaint, scallop: 0.12 });
    b.membrane(fingers[2], [root, [s * 0.1, 0.33, -0.12]], {
      thickness: 0.006,
      color: wingPaint,
      bone: spine.joints[1],
    });

    // Thumb claw
    b.spike(wrist, [s * 0.2, 0.5, 1], 0.04, 0.01, { color: CLAW, sides: 5 });
  }

  // ---------- Head ----------
  const headC = [0, 0.6, 0.37];
  const cranium = b.part(new THREE.SphereGeometry(0.11, 10, 8), scalePaint, {
    bone: head,
    at: headC,
    scale: [1.1, 0.95, 1],
    flat: true,
    name: "cranium",
  });
  const snout = b.loft(
    [
      { at: [0, 0.575, 0.42], w: 0.17, h: 0.12 },
      { at: [0, 0.565, 0.5], w: 0.14, h: 0.09 },
      { at: [0, 0.555, 0.555], w: 0.11, h: 0.07 },
    ],
    { bone: head, color: scalePaint, sides: 8, name: "snout" },
  );
  b.loft(
    [
      { at: [0, 0.52, 0.4], w: 0.13, h: 0.06 },
      { at: [0, 0.512, 0.48], w: 0.11, h: 0.045 },
      { at: [0, 0.515, 0.535], w: 0.085, h: 0.035 },
    ],
    { bone: jaw, color: BELLY, sides: 8, name: "lowerJaw" },
  );

  const cranSurf = b.surface(cranium);
  const snoutSurf = b.surface(snout);

  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="27" fill="#2a1a0e"/>
      <circle cx="32" cy="32" r="25" fill="#f5a623"/>
      <circle cx="32" cy="36" r="17" fill="#ffd34d"/>
      <ellipse cx="32" cy="33" rx="7" ry="19" fill="#1a0f08"/>
      <circle cx="22" cy="20" r="7" fill="#ffffff"/>
      <circle cx="42" cy="45" r="3.5" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Big bulging eyes
    const eyeHit = must(cranSurf.around(headC).at(s * 38, 12), "eye");
    const eyeball = b.stick(new THREE.SphereGeometry(0.042, 12, 8), WHITE, eyeHit, {
      embed: 0.45,
      scale: [1, 0.6, 1],
      bone: head,
      name: `eye${S}`,
    });
    b.decal(eyeball, eyeTex, {
      at: eyeHit.moved([0, 0.03, 0]),
      dir: [eyeHit.n.x, eyeHit.n.y, eyeHit.n.z],
      size: [0.07, 0.07],
      mirror: s > 0,
      bone: head,
    });

    // Brow ridge
    const e = eyeHit.at;
    const ba = cranSurf.nearest([e.x - s * 0.015, e.y + 0.05, e.z + 0.01]);
    const bb = cranSurf.nearest([e.x + s * 0.03, e.y + 0.045, e.z - 0.015]);
    b.capsule(ba.moved([0, 0.003, 0]), bb.moved([0, 0.003, 0]), 0.011, { color: DEEP, bone: head, sides: 6 });

    // Blush
    const cheek = must(cranSurf.around(headC).at(s * 58, -20), "cheek");
    b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 10), BLUSH, cheek, {
      embed: 0.5,
      scale: [1.3, 1, 1],
      bone: head,
    });

    // Cheek spikes
    for (const el of [6, -12]) {
      const h = must(cranSurf.around(headC).at(s * 100, el), "cheekSpike");
      b.spike(h.moved([0, -0.004, 0]), [s * 0.7, 0.15 + el * 0.01, -0.7], 0.05, 0.012, {
        color: SPIKE,
        bone: head,
        sides: 5,
      });
    }

    // Ringed horns sweeping back
    const hh = must(cranSurf.around(headC).at(s * 150, 40), "horn");
    const h0 = hh.at;
    b.sprout(
      `horn${S}`,
      hh,
      bezier([h0.x, h0.y, h0.z], [h0.x + s * 0.02, h0.y + 0.07, h0.z - 0.02], [h0.x + s * 0.05, h0.y + 0.09, h0.z - 0.11]),
      [0.022, 0.003],
      { count: 0, color: hornPaint, caps: { end: "point" }, sides: 7 },
    );

    // Ear frills
    b.extrude(
      [
        [0, -0.02],
        [0.07, -0.03],
        [0.13, 0.02, "sharp"],
        [0.08, 0.05],
        [0.02, 0.04],
      ],
      {
        at: [s * 0.09, 0.61, 0.32],
        x: [s * 0.75, 0, -0.66],
        y: [0, 1, 0],
        thickness: 0.008,
        bevel: 0.003,
        smoothing: 1,
        color: gradient(WING_IN, WING_OUT, [s * 0.09, 0.61, 0.32], [s * 0.19, 0.63, 0.23]),
        bone: head,
        name: `frill${S}`,
      },
    );

    // Nostrils
    const nh = snoutSurf.ray([s * 0.025, 0.8, 0.56], [0, -1, 0]);
    if (nh) b.stick(new THREE.SphereGeometry(0.01, 6, 4), NOSE, nh, { embed: 0.5, scale: [1, 0.5, 1.3], bone: head });

    // Little fangs
    const th = snoutSurf.ray([s * 0.03, 0.4, 0.575], [0, 1, 0]);
    if (th) b.stick(new THREE.ConeGeometry(0.007, 0.022, 5), TOOTH, th, { embed: 0.2, bone: head });
  }

  // ---------- Eggshell hat ----------
  const top = must(cranSurf.around(headC).at(-35, 62), "shell");
  const ax = new THREE.Vector3(top.n.x * 0.6, 1, top.n.z * 0.6).normalize();
  const shellAt = top.at.clone().addScaledVector(ax, -0.026);
  b.lathe(
    [
      [0, 0.075],
      [0.045, 0.065],
      [0.07, 0.035],
      [0.078, 0],
      [0.07, 0],
      [0.062, 0.031],
      [0.04, 0.057],
      [0, 0.066],
    ],
    {
      at: [shellAt.x, shellAt.y, shellAt.z],
      axis: [ax.x, ax.y, ax.z],
      segments: 14,
      color: shellPaint,
      bone: head,
      name: "eggshell",
    },
  );

  return b.root;
}
```