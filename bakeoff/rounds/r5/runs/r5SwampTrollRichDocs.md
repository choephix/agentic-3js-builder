```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  frame,
  gradient,
  limb,
  line,
  mottle,
  offset,
  polyline,
  rng,
  stripes,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Swamp Troll",
  description:
    "Hunched teal swamp troll with lower tusks, a tall flame mohawk, bone fetishes, a skull totem on his back, moss and mushrooms. Rigged, in a T-pose-style rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "swampTroll" });

  type Paint = ReturnType<typeof countershade>;
  type Col = string | Paint;

  // ---------------------------------------------------------------- palette
  const SKIN: Paint = countershade(
    mottle("#4b9583", "#3b7f70", { size: 0.25, contrast: 0.8 }),
    "#a2cc9c",
    { level: -0.3, soft: 0.5 },
  );
  const SKIN_D = "#2f6b60";
  const HAIR_D = "#6e1a12";
  const HAIR = "#e2582a";
  const BONE = "#ece2c4";
  const BONE_D = "#cdbf9a";
  const LEATHER = "#5c3b25";
  const WOOD = "#4b3524";
  const GOLD = "#d8a62b";
  const CLAW = "#2b2420";
  const EYE = "#ffd43b";
  const BLACK = "#17120f";
  const CLOTH = "#7d2a22";
  const CLOTH_D = "#4f1a16";
  const BEAD = "#27b3b0";
  const BEAD_R = "#c8321f";
  const MOUTH = "#2a1519";
  const MUSH = "#d2552e";
  const MUSH_S = "#efe3c4";

  // ---------------------------------------------------------------- helpers
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sphereG = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const ell = (rx: number, ry: number, rz: number, w = 8, h = 6) =>
    new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);
  const lin =
    (ks: number[][]) =>
    (t: number): [number, number] => {
      for (let i = 1; i < ks.length; i++) {
        if (t <= ks[i][0]) {
          const a = ks[i - 1];
          const c = ks[i];
          const u = (t - a[0]) / (c[0] - a[0]);
          return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
        }
      }
      const l = ks[ks.length - 1];
      return [l[1], l[2]];
    };

  // ---------------------------------------------------------------- textures
  const featherSvg = (a: string, c: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 80"><path d="M12 80 C-2 56 -2 20 12 0 C26 20 26 56 12 80Z" fill="${a}"/><path d="M12 78 L12 6" stroke="${c}" stroke-width="2.4" fill="none"/><path d="M12 30 L4 22 M12 44 L3 34 M12 58 L5 50 M12 30 L20 22 M12 44 L21 34 M12 58 L19 50" stroke="${c}" stroke-width="2" fill="none"/></svg>`,
      { size: 128 },
    );
  const featherTex = [
    featherSvg("#c8321f", "#f2c230"),
    featherSvg("#1f8a8a", "#f2e6b0"),
    featherSvg("#e08a1e", "#7a2e10"),
  ];
  const mossTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M6 48 Q8 20 4 6 Q16 20 17 48Z" fill="#3f7a35"/><path d="M16 48 Q18 14 24 0 Q30 14 31 48Z" fill="#5da046"/><path d="M28 48 Q34 24 44 8 Q44 30 40 48Z" fill="#3f7a35"/></svg>`,
    { size: 96 },
  );
  const glyphTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#1c3550" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M50 10 L50 92"/><path d="M20 32 Q50 62 80 32"/><path d="M28 54 Q50 82 72 54"/><path d="M14 14 L34 34 M86 14 L66 34"/><circle cx="50" cy="22" r="8"/></g></svg>`,
    { size: 256 },
  );
  const warTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g fill="none" stroke="#f3dd7a" stroke-width="6" stroke-linecap="round"><path d="M5 8 L35 19"/><path d="M5 25 L33 35"/></g></svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.05, 0], role: "spine" });
  type Joint = typeof hips;

  const spinePath = catmull([
    [0, 1.05, 0],
    [0, 1.34, 0.09],
    [0, 1.62, 0.23],
    [0, 1.84, 0.38],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neckPath = catmull([
    [0, 1.84, 0.38],
    [0, 1.93, 0.48],
    [0, 2.0, 0.56],
  ]);
  const neck = b.chain("neck", neckPath, { parent: spine, names: ["neck1", "neck2"], role: "neck" });

  const H = V(0, 2.04, 0.6);
  const hp = (x: number, y: number, z: number): [number, number, number] => [x, H.y + y, H.z + z];
  const head = b.joint("head", { parent: neck, at: H, dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.04, 0.05),
    aim: hp(0, -0.1, 0.34),
    role: "jaw",
  });

  // ---------------------------------------------------------------- torso
  const torso = b.sweep(
    spine,
    lin([
      [0, 0.21, 0.19],
      [0.3, 0.25, 0.22],
      [0.62, 0.34, 0.26],
      [0.85, 0.38, 0.25],
      [1, 0.3, 0.2],
    ]),
    { color: SKIN },
  );
  b.part(ell(0.27, 0.2, 0.24, 8, 6), SKIN, { bone: hips, at: [0, 1.02, 0] });
  const hump = b.part(ell(0.3, 0.2, 0.22, 8, 6), SKIN, { bone: spine.joints[2], at: [0, 1.93, 0.18] });
  b.sweep(neck, [0.18, 0.15], { color: SKIN });

  // pecs and abs seated on the torso
  const tSurf = b.surface(torso);
  for (const s of [1, -1]) {
    const hit = tSurf.nearest([s * 0.18, 1.72, 1.4]);
    b.stick(ell(0.16, 0.06, 0.13, 8, 6), SKIN, hit, { embed: 0.3 });
    for (let r = 0; r < 3; r++) {
      const ah = tSurf.nearest([s * 0.065, 1.2 + r * 0.1, 1.4]);
      b.stick(ell(0.06, 0.03, 0.045, 6, 4), SKIN, ah, { embed: 0.3 });
    }
  }

  // ---------------------------------------------------------------- head
  const hpart = (geo: THREE.BufferGeometry, color: Col, p: [number, number, number], bone: Joint = head) =>
    b.part(geo, color, { bone, at: hp(p[0], p[1], p[2]) });

  const skull = hpart(ell(0.17, 0.17, 0.2, 10, 8), SKIN, [0, 0.08, 0.04]);
  const midface = b.frustumBox(hp(0, 0.03, 0.1), hp(0, 0.0, 0.3), [0.24, 0.2], [0.2, 0.13], {
    bone: head,
    color: SKIN,
  });
  // mouth line, lower jaw (separate bone) and chin
  b.frustumBox(hp(0, -0.066, 0.12), hp(0, -0.064, 0.34), [0.25, 0.014], [0.21, 0.014], {
    bone: head,
    color: MOUTH,
  });
  b.frustumBox(hp(0, -0.1, 0.04), hp(0, -0.105, 0.34), [0.26, 0.085], [0.2, 0.09], {
    bone: jaw,
    color: SKIN,
  });
  hpart(ell(0.1, 0.06, 0.07, 8, 6), SKIN, [0, -0.1, 0.36], jaw);
  for (const x of [-0.05, 0, 0.05]) {
    hpart(new THREE.ConeGeometry(0.014, 0.045, 5), BONE, [x, -0.045, 0.33], jaw);
  }
  // nose: long and hooked
  b.sweep(catmull([hp(0, 0.1, 0.2), hp(0, 0.1, 0.32), hp(0, 0.07, 0.41), hp(0, 0.01, 0.435)]), [0.055, 0.03], {
    bone: head,
    color: SKIN,
  });

  for (const s of [1, -1]) {
    // brow, cheek, eye
    b.capsule(hp(s * 0.02, 0.15, 0.2), hp(s * 0.155, 0.15, 0.1), 0.035, { color: SKIN_D, bone: head });
    hpart(ell(0.06, 0.05, 0.07, 6, 4), SKIN, [s * 0.13, 0.0, 0.12]);
    hpart(sphereG(0.03, 8, 6), EYE, [s * 0.08, 0.095, 0.215]);
    hpart(ell(0.008, 0.02, 0.01, 6, 4), BLACK, [s * 0.08, 0.095, 0.243]);
    hpart(sphereG(0.012, 5, 4), BLACK, [s * 0.025, 0.0, 0.43]);

    // tusks
    const tp = bezier(hp(s * 0.1, -0.07, 0.27), hp(s * 0.16, 0.0, 0.37), hp(s * 0.115, 0.17, 0.35));
    b.sweep(tp, [0.034, 0], {
      bone: jaw,
      color: gradient(BONE_D, BONE, hp(s * 0.1, -0.07, 0.27), hp(s * 0.115, 0.17, 0.35)),
    });
    const tpos = tp.at(0.4);
    const tring = b.ring(line(tpos, offset(tpos, tp.tangentAt(0.4), 1)), { count: 8, radius: 0.024 });
    b.sweep(catmull(tring.items, { closed: true }), 0.007, { color: GOLD, bone: jaw });

    // ears + gold hoops
    const O = V(s * 0.15, H.y + 0.05, H.z - 0.03);
    b.extrude(
      [
        [0, -0.05],
        [0.12, 0],
        [0.26, 0.14],
        [0.38, 0.3, "sharp"],
        [0.2, 0.2],
        [0.08, 0.1],
        [0, 0.06],
      ],
      { at: O, x: [s * 0.4, 0, -1], y: [s * 0.5, 1, 0], thickness: 0.02, bevel: 0.004, color: SKIN, bone: head },
    );
    const xv = V(s * 0.4, 0, -1).normalize();
    const yv = V(s * 0.5, 1, 0).normalize();
    const nrm = xv.clone().cross(yv).normalize();
    for (const u of [0.06, 0.14, 0.22]) {
      const v = u < 0.12 ? -0.05 + u * 0.4167 : u < 0.26 ? u - 0.12 : 0.14 + (u - 0.26) * 1.333;
      const c = O.clone().addScaledVector(xv, u).addScaledVector(yv, v - 0.012);
      b.part(new THREE.TorusGeometry(0.022, 0.005, 5, 10), GOLD, { bone: head, at: c, dir: nrm, axis: "z" });
    }

    // braids with bone beads
    b.sweep(
      catmull([hp(s * 0.06, 0.12, -0.12), hp(s * 0.1, 0.0, -0.24), hp(s * 0.13, -0.18, -0.28), hp(s * 0.14, -0.38, -0.25)]),
      [0.028, 0.014],
      { bone: head, color: HAIR_D },
    );
    hpart(sphereG(0.026, 6, 4), BONE, [s * 0.14, -0.4, -0.25]);
    hpart(sphereG(0.02, 6, 4), GOLD, [s * 0.1, 0.0, -0.24]);
    hpart(sphereG(0.02, 6, 4), BEAD, [s * 0.13, -0.18, -0.28]);
  }

  // the mohawk: a tall flame crest
  b.extrude(
    [
      [0.07, -0.02],
      [0.1, 0.2, "sharp"],
      [0.02, 0.09],
      [-0.02, 0.3, "sharp"],
      [-0.09, 0.11],
      [-0.15, 0.32, "sharp"],
      [-0.2, 0.08],
      [-0.27, 0.24, "sharp"],
      [-0.31, 0.0],
      [-0.36, -0.12, "sharp"],
      [-0.25, -0.1],
      [-0.1, -0.08],
      [0, -0.06],
    ],
    {
      at: hp(0, 0.22, 0.15),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.07,
      bevel: 0.008,
      color: gradient(HAIR_D, HAIR, hp(0, 0.12, 0), hp(0, 0.46, 0)),
      bone: head,
    },
  );

  // war paint
  for (const s of [1, -1]) {
    const hit = b.surface([skull, midface]).nearest(hp(s * 0.14, 0.0, 0.5));
    b.decal([skull, midface], warTex, { at: hit, dir: [s * 0.4, 0.1, 1], size: [0.11, 0.11], mirror: s > 0 });
  }

  // ---------------------------------------------------------------- arms
  const deltoids: ReturnType<typeof b.part>[] = [];
  const armSweeps: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = V(s * 0.4, 1.78, 0.3);
    const el = V(s * 0.86, 1.52, 0.37);
    const wr = V(s * 1.26, 1.22, 0.47);
    const arm = b.chain(`arm${side}`, polyline([sh, el, wr]), {
      parent: spine,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    const hand = arm.tip as Joint;
    const armSw = b.sweep(arm, [0.125, 0.125, 0.095, 0.12, 0.075], { color: SKIN });
    armSweeps.push(armSw);
    deltoids.push(b.part(ell(0.17, 0.16, 0.16, 8, 6), SKIN, { bone: arm.joints[0], at: sh }));

    // shoulder bone spikes, elbow spike
    b.ring(arm.joints[0], { count: 5, radius: 0.15, fromDeg: -90, toDeg: 90 }, (it) =>
      b.spike(it, it, 0.17, 0.035, { color: BONE }),
    );
    b.spike(el, [s * 0.4, 0.3, -1], 0.12, 0.035, { color: BONE, bone: arm.joints[1] });

    // leather bracer with bone studs, bone bead armband
    for (const t of [0.8, 0.88]) {
      const band = b.ring(arm.at(t), { count: 10, radius: 0.105 }).items;
      b.sweep(catmull(band, { closed: true }), 0.022, { color: LEATHER });
    }
    b.ring(arm.at(0.84), { count: 6, radius: 0.115, fromDeg: -110, toDeg: 110 }, (it) =>
      b.spike(it, it, 0.08, 0.02, { color: BONE }),
    );
    const band2 = b.ring(arm.at(0.26), { count: 10, radius: 0.128 }).items;
    b.sweep(catmull(band2, { closed: true }), 0.018, { color: GOLD });

    // glyph tattoo on upper arm
    {
      const pt = arm.at(0.26).at.clone().add(V(0, 0.1, 0.6));
      const hit = b.surface(armSw).nearest(pt);
      b.decal(armSw, glyphTex, { at: hit, dir: [0, 0.1, 1], size: [0.15, 0.15], mirror: s > 0 });
    }

    // hand
    const d = wr.clone().sub(el).normalize();
    b.sweep(
      polyline([wr.clone().addScaledVector(d, -0.03), wr.clone().addScaledVector(d, 0.15)]),
      (t: number): [number, number] => [0.066 - 0.012 * t, 0.04],
      { bone: hand, color: SKIN },
    );
    [-0.05, 0, 0.05].forEach((z, i) => {
      const p0 = wr.clone().addScaledVector(d, 0.13).add(V(0, 0, z));
      const p1 = p0.clone().addScaledVector(d, 0.1).add(V(0, -0.015, z * 0.35));
      const p2 = p1.clone().addScaledVector(d, 0.08).add(V(0, -0.04, z * 0.3));
      const p3 = p2.clone().addScaledVector(d, 0.05).add(V(0, -0.045, z * 0.2));
      const f = b.chain(`finger${i + 1}${side}`, polyline([p0, p1, p2, p3]), {
        parent: hand,
        names: [`f${i + 1}a${side}`, `f${i + 1}b${side}`, `f${i + 1}c${side}`],
        role: "digit",
      });
      b.sweep(f, [0.027, 0.02, 0.013], { color: SKIN });
      b.part(sphereG(0.03, 6, 4), SKIN, { bone: hand, at: p0 });
      b.spike(p3, p3.clone().sub(p2).normalize(), 0.07, 0.013, { color: CLAW, bone: f.joints[2] });
    });
    {
      const tdir = d.clone().multiplyScalar(0.5).add(V(0, -0.35, 0.8)).normalize();
      const t0 = wr.clone().addScaledVector(d, 0.05).add(V(0, -0.01, 0.06));
      const t1 = t0.clone().addScaledVector(tdir, 0.09);
      const t2 = t1.clone().addScaledVector(tdir, 0.08);
      const th = b.chain(`thumb${side}`, polyline([t0, t1, t2]), {
        parent: hand,
        names: [`thumb1${side}`, `thumb2${side}`],
        role: "digit",
      });
      b.sweep(th, [0.03, 0.017], { color: SKIN });
      b.spike(t2, tdir, 0.065, 0.014, { color: CLAW, bone: th.joints[1] });
    }
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.23, 1.0, -0.02],
      [s * 0.31, 0.06, 0.3],
      [0.46, 0.46, 0.32, 0.16],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain(`leg${side}`, polyline(pts.slice(0, 4)), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.31, 0, 0.2],
    });
    const foot = leg.tip as Joint;
    b.sweep(leg, [0.17, 0.175, 0.13, 0.1, 0.085, 0.075, 0.065], { color: SKIN });
    b.part(sphereG(0.105, 8, 6), SKIN, { bone: leg.joints[1], at: pts[1] });
    b.part(sphereG(0.08, 7, 5), SKIN, { bone: leg.joints[2], at: pts[2] });
    b.spike(pts[1], [0, 0.1, 1], 0.1, 0.03, { color: BONE, bone: leg.joints[1] });
    b.spike(pts[2], [0, 0.3, -1], 0.1, 0.026, { color: BONE, bone: leg.joints[2] });

    // shin wrap and ankle ring
    for (const t of [0.5, 0.56]) {
      const w = b.ring(leg.at(t), { count: 9, radius: 0.098 }).items;
      b.sweep(catmull(w, { closed: true }), 0.017, { color: LEATHER });
    }
    const ank = b.ring(leg.at(0.78), { count: 9, radius: 0.078 }).items;
    b.sweep(catmull(ank, { closed: true }), 0.012, { color: GOLD });

    // foot: pad + three clawed toes
    const ball = pts[3];
    b.part(ell(0.1, 0.06, 0.12, 8, 6), SKIN, { bone: foot, at: [ball.x, 0.065, ball.z + 0.04] });
    [-0.075, 0, 0.075].forEach((ox, i) => {
      const q0 = V(ball.x + ox, 0.05, ball.z + 0.1);
      const q1 = V(ball.x + ox * 1.3, 0.05, ball.z + 0.2);
      const q2 = V(ball.x + ox * 1.6, 0.04, ball.z + 0.29);
      const toe = b.chain(`toe${i + 1}${side}`, polyline([q0, q1, q2]), {
        parent: foot,
        names: [`toe${i + 1}a${side}`, `toe${i + 1}b${side}`],
        role: "digit",
      });
      b.sweep(toe, [0.042, 0.03], { color: SKIN });
      b.spike(q2, [ox * 0.2, -0.1, 1], 0.07, 0.018, { color: CLAW, bone: toe.joints[1] });
    });
  }

  // ---------------------------------------------------------------- belt and cloth
  const bodySurf = b.surface(torso);
  const beltPath = bodySurf.loop([0, 1.14, 0.03], { dir: [0, 1, 0], lift: 0.02 });
  b.sweep(beltPath, 0.04, { color: LEATHER, bone: spine.joints[0] });
  b.along(
    bodySurf.loop([0, 1.14, 0.03], { dir: [0, 1, 0], lift: 0.05 }),
    14,
    (at) => b.part(sphereG(0.014, 5, 4), GOLD, { frame: at, bone: spine.joints[0] }),
  );

  for (const [z, dz] of [
    [0.27, 1],
    [-0.21, -1],
  ]) {
    b.extrude(
      [
        [-0.14, 0],
        [0.14, 0],
        [0.13, -0.3],
        [0.07, -0.26],
        [0, -0.4],
        [-0.07, -0.26],
        [-0.13, -0.33],
      ],
      {
        at: [0, 1.1, z],
        x: [1, 0, 0],
        y: [0, 1, 0.12 * dz],
        thickness: 0.025,
        color: stripes(CLOTH, CLOTH_D, { size: 0.07, axis: "y" }),
        bone: hips,
      },
    );
  }

  // ---------------------------------------------------------------- fetishes
  const skullAt = (p: THREE.Vector3, k: number, bone: Joint, horns = false) => {
    const at = (x: number, y: number, z: number): [number, number, number] => [
      p.x + x * k,
      p.y + y * k,
      p.z + z * k,
    ];
    b.part(ell(0.5 * k, 0.46 * k, 0.52 * k, 8, 6), BONE, { bone, at: at(0, 0, 0) });
    b.part(ell(0.32 * k, 0.18 * k, 0.34 * k, 7, 5), BONE_D, { bone, at: at(0, -0.46, 0.14) });
    for (const s of [1, -1]) {
      b.part(ell(0.15 * k, 0.17 * k, 0.1 * k, 6, 4), BLACK, { bone, at: at(s * 0.2, 0.0, 0.43) });
      if (horns) {
        b.sweep(bezier(at(s * 0.3, 0.3, 0), at(s * 0.85, 0.5, 0), at(s * 0.8, 1.1, 0)), [0.12 * k, 0], {
          color: BONE_D,
          bone,
        });
      }
    }
    b.part(ell(0.05 * k, 0.09 * k, 0.05 * k, 5, 4), BLACK, { bone, at: at(0, -0.2, 0.5) });
    for (const x of [-0.12, 0, 0.12]) {
      b.part(new THREE.BoxGeometry(0.09 * k, 0.12 * k, 0.05 * k), BONE, { bone, at: at(x, -0.58, 0.42) });
    }
  };

  const fan = (p: THREE.Vector3, bone: Joint, n: number, h: number) => {
    const frames = Array.from({ length: n }, () => frame(p, [0, 1, 0]));
    b.cards(frames, featherTex, {
      size: [0.075, h],
      lean: 30,
      flow: (_f, i): [number, number, number] => [
        Math.cos((i / n) * Math.PI * 2),
        0,
        Math.sin((i / n) * Math.PI * 2),
      ],
      bone,
      rng: rng(31 + n),
      vary: 0.2,
    });
  };

  const dangle = (p: THREE.Vector3, bone: Joint, seed: number) => {
    b.rod(p, V(p.x, p.y - 0.05, p.z), 0.006, { color: LEATHER, bone });
    [-0.04, 0, 0.04].forEach((dx, i) => {
      const q = V(p.x + dx, p.y - 0.05, p.z);
      b.capsule(q, V(q.x + dx * 0.6, q.y - (0.11 + 0.03 * i), q.z), 0.011, { color: BONE, bone });
    });
    b.part(sphereG(0.016, 5, 4), seed % 2 ? BEAD : BEAD_R, { bone, at: [p.x, p.y - 0.05, p.z] });
    b.cards([frame(V(p.x, p.y - 0.03, p.z + 0.015), [0, 1, 0])], featherTex[seed % 3], {
      size: [0.05, 0.2],
      lean: 180,
      flow: [0, 0, 1],
      bone,
    });
  };

  // belt skull with crossed bones
  {
    const bf = beltPath.at(0).clone();
    const c = V(bf.x, 0.98, 0.34);
    b.rod(bf, V(c.x, c.y + 0.05, c.z), 0.008, { color: LEATHER, bone: hips });
    for (const s of [1, -1]) {
      const a = V(c.x - s * 0.1, c.y - 0.09, c.z - 0.01);
      const e = V(c.x + s * 0.1, c.y + 0.09, c.z - 0.01);
      b.capsule(a, e, 0.014, { color: BONE, bone: hips });
      b.part(sphereG(0.022, 5, 4), BONE, { bone: hips, at: [e.x, e.y, e.z] });
      b.part(sphereG(0.022, 5, 4), BONE, { bone: hips, at: [a.x, a.y, a.z] });
    }
    skullAt(c, 0.11, hips);
    // hip danglers
    dangle(beltPath.at(0.09).clone().add(V(0, -0.03, 0.02)), hips, 1);
    dangle(beltPath.at(0.91).clone().add(V(0, -0.03, 0.02)), hips, 2);
  }

  // choker and the V necklace of fangs and beads
  {
    const ch = b.ring(neck.at(0.1), { count: 12, radius: 0.185 }).items;
    b.sweep(catmull(ch, { closed: true }), 0.013, { color: LEATHER });
    const nk = b.surface(torso).drape(
      catmull([
        [-0.2, 1.95, 0.7],
        [-0.17, 1.8, 0.8],
        [-0.1, 1.66, 0.85],
        [0, 1.6, 0.85],
        [0.1, 1.66, 0.85],
        [0.17, 1.8, 0.8],
        [0.2, 1.95, 0.7],
      ]),
      { lift: 0.055 },
    );
    b.sweep(nk, 0.01, { color: LEATHER_SAFE(), bone: spine.joints[2] });
    let n = 0;
    b.along(nk, 9, (at) => {
      if (n % 2 === 0) {
        b.part(new THREE.ConeGeometry(0.024, 0.09, 6), BONE, {
          frame: at.moved({ down: 0.045 }),
          dir: [0, -1, 0],
          bone: spine.joints[2],
        });
      } else {
        b.part(sphereG(0.02, 6, 4), n % 4 === 1 ? BEAD : BEAD_R, { frame: at, bone: spine.joints[2] });
      }
      n++;
    });
    const mid = nk.at(0.5);
    skullAt(V(mid.x, mid.y - 0.1, mid.z + 0.03), 0.07, spine.joints[2]);
  }

  // totem harness: a strap across the chest holding a skull totem on the back
  {
    const raw = catmull([
      [-0.3, 1.98, 0.35],
      [-0.2, 1.78, 0.85],
      [0, 1.52, 0.95],
      [0.18, 1.28, 0.8],
      [0.26, 1.12, 0.4],
    ]);
    const strap = bodySurf.drape(raw, { lift: 0.02 });
    b.sweep(strap, 0.03, { color: LEATHER, bone: spine.joints[1] });
    b.along(bodySurf.drape(raw, { lift: 0.05 }), 7, (at) =>
      b.part(sphereG(0.018, 5, 4), GOLD, { frame: at, bone: spine.joints[1] }),
    );

    const P0 = beltPath.at(0.45).clone().add(V(0, -0.06, -0.12));
    const P1 = V(-0.5, 2.15, -0.12);
    const bone = spine.joints[1];
    b.rod(P0, P1, 0.024, { color: WOOD, bone });
    const polePath = polyline([P0, P1]);
    b.along(polePath, 4, (at) =>
      b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.045, 8), LEATHER, { frame: at, bone }),
      { from: 0.1, to: 0.55 },
    );
    const sa = strap.at(0);
    const lash = polePath.at(0.8);
    b.rod(V(sa.x, sa.y, sa.z), V(lash.x, lash.y, lash.z), 0.014, { color: LEATHER, bone });

    // crossbar with dangling bones
    const q = polePath.at(0.72);
    b.capsule(V(q.x - 0.2, q.y - 0.02, q.z), V(q.x + 0.2, q.y + 0.02, q.z), 0.018, { color: BONE, bone });
    for (const s of [1, -1]) {
      b.part(sphereG(0.03, 6, 4), BONE, { bone, at: [q.x + s * 0.2, q.y + s * 0.02, q.z] });
      dangle(V(q.x + s * 0.17, q.y + s * 0.015 - 0.02, q.z), bone, s > 0 ? 3 : 4);
    }
    // crowning skull, horns and feather crest
    const top = V(P1.x, P1.y + 0.13, P1.z);
    skullAt(top, 0.15, bone, true);
    fan(V(top.x, top.y + 0.07, top.z - 0.05), bone, 5, 0.3);
  }

  // ---------------------------------------------------------------- swamp life
  {
    const living = b.surface([torso, hump, ...deltoids]);
    const hits = living.scatter(70, { rng: rng(11), minDist: 0.07, filter: (h) => h.n.y > 0.5 });
    b.cards(hits, mossTex, { size: [0.07, 0.1], lean: 25, bend: 20, vary: 0.3, rng: rng(5) });

    const hs = b.surface(hump);
    [
      [215, 50, 0.07],
      [160, 58, 0.05],
      [190, 35, 0.04],
    ].forEach(([az, el, r]) => {
      const hit = hs.around(hump.at).at(az, el);
      if (!hit) return;
      b.stick(new THREE.CylinderGeometry(r * 0.35, r * 0.5, r * 2, 6), MUSH_S, hit, { embed: 0.3 });
      b.stick(new THREE.SphereGeometry(r, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), MUSH, hit.moved([0, r * 1.9, 0]), {
        embed: 0.1,
      });
    });
  }

  return b.root;

  function LEATHER_SAFE() {
    return LEATHER;
  }
}
```