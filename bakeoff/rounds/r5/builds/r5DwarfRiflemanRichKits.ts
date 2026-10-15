import * as THREE from "three";
import { createBuilder, catmull, limb, lerp, offset, grain, mottle, scales, svg } from "../../../../src/index";
import type { Joint, Paint } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "Stocky Warcraft-style dwarf rifleman: steel helm with goggles, layered spiked pauldrons, braided ginger beard with gold rings, powder keg on his back, and a brass-banded blunderbuss held at the hip.",
};

// ---------------------------------------------------------------- palette
const SKIN = "#e3a37e";
const NOSE = "#dc8670";
const CHEEK = "#e8927a";
const BEARD = "#c4521c";
const BEARD_L = "#e87a2c";
const BEARD_D = "#8a3512";
const GOLD = "#e6b53c";
const GOLD_D = "#a97a1e";
const LEATHER = "#7b4b29";
const LEATHER_D = "#4b2c17";
const LEATHER_L = "#a8703f";
const BLUE = "#2c55b0";
const BLUE_D = "#1c3878";
const PANTS = "#5d4a3a";
const WOOD = "#8b5a2e";
const WOOD_D = "#5a361a";
const CREAM = "#eadfc2";
const DARK = "#14121a";
const IRON_F = "#2b2b33";

const STEEL = panelled(metal("steel", { tarnish: 0.15 }), { size: 0.1, rivets: 0.028 });
const IRON = metal("iron", { polish: 0.5 });
const BRASS = metal("brass", { tarnish: 0.2 });
const MAIL = scales("#8793a6", "#454d5c", { size: 0.024 });
const CLOTH = mottle("#7d5c3c", "#6a4b30", { size: 0.06 });
const BEARD_P = grain(BEARD_L, BEARD_D, { size: 0.012, axis: "y" });
const MUST_P = grain(BEARD_L, BEARD, { size: 0.01, axis: "y", seed: 3 });
const WOOD_P = grain(WOOD, WOOD_D, { size: 0.016, axis: "z" });
const KEG_P = grain(WOOD, WOOD_D, { size: 0.018, axis: [1, 0, 0] });

const EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="42" fill="none" stroke="#f2c14e" stroke-width="7"/>
    <path d="M22 36 H78 L70 50 H60 L64 62 H72 V72 H28 V62 H36 L40 50 H30 Q22 48 22 36Z" fill="#f2c14e"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const ring = (R: number, r: number, at: THREE.Vector3 | number[], dir: THREE.Vector3 | number[], color: string | Paint, bone: Joint, seg = 12) =>
    b.part(new THREE.TorusGeometry(R, r, 4, seg), color, { bone, at, dir, axis: "z" });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.62, 0], [0, 0.77, 0.03], [0, 0.94, 0.03], [0, 1.09, 0.02]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chestJ = spine.joints[2];
  const pelvisJ = spine.joints[0];
  const neck = b.chain("neck", [[0, 1.09, 0.02], [0, 1.17, 0.05]], { parent: chestJ, names: ["neck"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.17, 0.05], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.235, 0.03], aim: [0, 1.2, 0.16], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 0.57, 0], w: 0.31, h: 0.22 },
      { at: [0, 0.66, 0.015], w: 0.35, h: 0.25 },
      { at: [0, 0.78, 0.035], w: 0.4, h: 0.29 },
      { at: [0, 0.93, 0.035], w: 0.47, h: 0.3 },
      { at: [0, 1.05, 0.02], w: 0.44, h: 0.25 },
      { at: [0, 1.1, 0.02], w: 0.3, h: 0.2 },
    ],
    { bone: spine, color: CLOTH },
  );
  const skin = b.surface(torso);

  b.sweep(neck, 0.072, { color: SKIN });
  // collar
  b.lathe([[0.075, 0.03], [0.115, 0.03], [0.15, -0.02], [0.14, -0.03], [0.075, -0.01]], {
    at: [0, 1.115, 0.02],
    segments: 10,
    color: LEATHER_D,
    bone: chestJ,
  });

  // belt, buckle, pouches
  b.sweep(skin.loop([0, 0.67, 0.02], { lift: 0.012 }), () => [0.014, 0.035], {
    section: "box",
    color: LEATHER_D,
  });
  const buckle = skin.ray([0, 0.67, 1], [0, 0, -1])!;
  b.stick(new THREE.BoxGeometry(0.085, 0.03, 0.068), GOLD, buckle, { embed: 0.1 });
  b.stick(new THREE.BoxGeometry(0.045, 0.035, 0.036), LEATHER_D, buckle, { embed: -0.2 });
  const pouchL = skin.ray([0.6, 0.64, 0.02], [-1, 0, 0])!;
  b.stick(new THREE.BoxGeometry(0.085, 0.06, 0.1), LEATHER, pouchL);
  b.stick(new THREE.BoxGeometry(0.09, 0.066, 0.035), LEATHER_L, pouchL.moved([0, 0.0, 0.035]));
  b.stick(new THREE.SphereGeometry(0.012, 6, 4), GOLD, pouchL.moved([0, 0.05, 0.03]));
  const pouchB = skin.ray([0.12, 0.64, -0.6], [0, 0, 1])!;
  b.stick(new THREE.BoxGeometry(0.1, 0.05, 0.08), LEATHER, pouchB);
  b.stick(new THREE.SphereGeometry(0.01, 6, 4), GOLD, pouchB.moved([0, 0.04, 0.02]));

  // tabard apron
  const z0 = skin.ray([0, 0.72, 1], [0, 0, -1])!.at.z;
  b.extrude(
    [[-0.118, 0.3, "sharp"], [0.118, 0.3, "sharp"], [0.118, 0.045, "sharp"], [0, -0.03, "sharp"], [-0.118, 0.045, "sharp"]],
    { at: [0, 0.4, z0 - 0.004], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.036, color: GOLD, bone: pelvisJ },
  );
  b.extrude(
    [[-0.105, 0.3, "sharp"], [0.105, 0.3, "sharp"], [0.105, 0.05, "sharp"], [0, 0, "sharp"], [-0.105, 0.05, "sharp"]],
    { at: [0, 0.4, z0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: BLUE, bone: pelvisJ },
  );
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    at: [0, 0.56, z0 + 0.0215],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM,
    bone: pelvisJ,
  });

  // powder horn on right hip
  const horn = catmull([V(-0.2, 0.64, 0.06), V(-0.225, 0.58, 0.1), V(-0.235, 0.5, 0.17), V(-0.22, 0.45, 0.25)]);
  b.sweep(horn, [0.032, 0.006], { color: CREAM, bone: pelvisJ });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), GOLD, { bone: pelvisJ, at: V(-0.2, 0.645, 0.058), dir: [0.2, 0.3, -0.5] });

  // keg on the back with suspenders
  const kegC = V(0, 0.92, -0.205);
  b.lathe([[0, -0.15], [0.085, -0.15], [0.1, -0.07], [0.108, 0], [0.1, 0.07], [0.085, 0.15], [0, 0.15]], {
    at: kegC,
    axis: [1, 0, 0],
    segments: 10,
    color: KEG_P,
    bone: chestJ,
  });
  for (const [hx, hr] of [[0.11, 0.097], [-0.11, 0.097], [0.04, 0.111], [-0.04, 0.111]] as const)
    ring(hr, 0.008, V(hx, kegC.y, kegC.z), [1, 0, 0], IRON, chestJ, 12);
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), GOLD, { bone: chestJ, at: V(0.0, kegC.y + 0.108, kegC.z), dir: [0, 1, 0] });
  for (const s of [1, -1]) {
    const strap = skin.drape(
      catmull([
        [s * 0.13, 0.9, -0.17],
        [s * 0.15, 1.06, -0.08],
        [s * 0.16, 1.1, 0.03],
        [s * 0.14, 1.05, 0.15],
        [s * 0.13, 0.92, 0.22],
        [s * 0.12, 0.78, 0.22],
      ]),
      { lift: 0.012 },
    );
    b.sweep(strap, () => [0.022, 0.014], { section: "box", color: LEATHER_D });
    b.along(strap, 4, (pt) => {
      const hit = skin.nearest(pt.at);
      b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.05, 6), GOLD_D, {
        bone: chestJ,
        at: offset(hit.at, hit.n, 0.03),
        dir: [0, 1, 0],
      });
    });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.11, 0.62, 0), V(s * 0.125, 0.1, 0.02), [0.29, 0.27], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.125, 0, 0.06],
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    b.sweep(leg, [0.088, 0.064], { color: PANTS });

    // boot shaft, cuff, buckle
    b.rod(lerp(pts[1], pts[2], 0.1), offset(pts[2], [0, -1, 0], 0.02), [0.083, 0.07], LEATHER_D, { bone: knee });
    b.rod(lerp(pts[1], pts[2], 0.08), lerp(pts[1], pts[2], 0.3), 0.096, LEATHER_L, { bone: knee });
    b.part(new THREE.BoxGeometry(0.045, 0.05, 0.014), GOLD, {
      bone: knee,
      at: offset(lerp(pts[1], pts[2], 0.55), [0, 0, 1], 0.076),
    });
    // knee pad + spike
    b.part(new THREE.SphereGeometry(0.062, 8, 6), STEEL, {
      bone: knee,
      at: offset(pts[1], [0, 0.01, 1], 0.05),
      scale: [1, 1, 0.7],
      flat: true,
    });
    b.spike(offset(pts[1], [0, 0.01, 1], 0.085), [0, 0.25, 1], 0.07, 0.022, { color: GOLD, bone: knee });

    // foot
    b.capsule(V(s * 0.125, 0.06, -0.02), V(s * 0.125, 0.06, 0.16), [0.063, 0.059], LEATHER_D, { bone: ankle });
    b.part(new THREE.BoxGeometry(0.145, 0.026, 0.3), IRON_F, { bone: ankle, at: [s * 0.125, 0.013, 0.065] });
    const toe = b.joint(`toe${side}`, {
      parent: ankle,
      at: [s * 0.125, 0.05, 0.14],
      aim: [s * 0.125, 0.05, 0.22],
      role: "digit",
    });
    b.part(new THREE.SphereGeometry(0.052, 8, 6), STEEL, {
      bone: toe,
      at: [s * 0.125, 0.056, 0.178],
      scale: [1, 0.9, 0.85],
      flat: true,
    });
  }

  // ---------------------------------------------------------------- arms, hands, pauldrons
  const plate = (r: number, h: number): [number, number][] => [
    [0, h], [r * 0.5, h * 0.93], [r * 0.85, h * 0.5], [r, 0],
    [r, -0.014], [r * 0.84, h * 0.5 - 0.014], [r * 0.5, h * 0.93 - 0.014], [0, h - 0.014],
  ];

  const x0 = -0.34;
  let wristR: Joint | null = null;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const A: number[][] =
      s > 0
        ? [[0.26, 1.04, 0], [0.37, 0.87, 0.01], [0.43, 0.69, 0.07]]
        : [[-0.26, 1.04, 0], [-0.37, 0.92, -0.17], [x0, 0.775, -0.07]];
    const arm = b.chain(`arm${side}`, A, {
      parent: chestJ,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const sh = arm.joints[0];
    const el = arm.joints[1];
    const wr = arm.joints[2];
    b.sweep(arm, [0.077, 0.06], { color: MAIL });
    const ep = V(A[1][0], A[1][1], A[1][2]);
    const wp = V(A[2][0], A[2][1], A[2][2]);
    // bracer + elbow pad
    b.rod(lerp(ep, wp, 0.3), lerp(ep, wp, 0.93), [0.078, 0.066], LEATHER_D, { bone: el });
    b.rod(lerp(ep, wp, 0.84), lerp(ep, wp, 0.92), 0.081, GOLD, { bone: el });
    b.part(new THREE.SphereGeometry(0.058, 7, 5), STEEL, { bone: el, at: offset(ep, [s * 0.5, 0, -1], 0.03), flat: true });

    // pauldron
    const C = V(s * 0.27, 1.06, 0);
    const ax = V(s * 0.5, 1, 0).normalize();
    const u = ax.clone().cross(V(0, 0, 1)).normalize();
    const v = ax.clone().cross(u).normalize();
    const cC = C.clone().addScaledVector(ax, -0.03);
    const cB = C.clone();
    const cA = C.clone().addScaledVector(ax, 0.035);
    b.lathe(plate(0.17, 0.05), { at: cC, axis: ax, segments: 12, color: BLUE, bone: sh });
    b.lathe(plate(0.14, 0.07), { at: cB, axis: ax, segments: 12, color: STEEL, bone: sh });
    b.lathe(plate(0.105, 0.085), { at: cA, axis: ax, segments: 10, color: STEEL, bone: sh });
    ring(0.17, 0.009, cC, ax, GOLD, sh, 14);
    ring(0.14, 0.008, cB, ax, GOLD, sh, 14);
    b.spike(cA.clone().addScaledVector(ax, 0.078), ax, 0.1, 0.022, { color: GOLD, bone: sh });
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI * 2) / 8;
      const rad = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a));
      if (rad.x * s < -0.35) continue;
      b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, {
        bone: sh,
        at: cC.clone().addScaledVector(rad, 0.152).addScaledVector(ax, 0.013),
      });
      if (k % 2 === 0)
        b.spike(cC.clone().addScaledVector(rad, 0.168), rad.clone().addScaledVector(ax, -0.15), 0.065, 0.016, {
          color: GOLD,
          bone: sh,
        });
    }

    // gauntlet cuff
    const dir = wp.clone().sub(ep).normalize();
    b.part(new THREE.CylinderGeometry(0.066, 0.072, 0.05, 8), STEEL, {
      bone: wr,
      at: wp.clone().addScaledVector(dir, -0.005),
      dir,
      flat: true,
    });
    ring(0.07, 0.007, wp.clone().addScaledVector(dir, 0.02), dir, GOLD, wr, 10);

    if (s > 0) {
      // open left hand
      const lat = V(1, 0, 0).addScaledVector(dir, -dir.x).normalize();
      b.part(new THREE.BoxGeometry(0.095, 0.09, 0.055), LEATHER_L, {
        bone: wr,
        at: wp.clone().addScaledVector(dir, 0.045),
        dir,
      });
      for (let i = 0; i < 4; i++) {
        const off = (i - 1.5) * 0.024;
        const base = wp.clone().addScaledVector(dir, 0.085).addScaledVector(lat, off);
        const p1 = base.clone().addScaledVector(dir, 0.035).add(V(0, 0, 0.01));
        const p2 = base.clone().addScaledVector(dir, 0.062).add(V(0, 0, 0.03));
        const f = b.chain(`finger${side}${i + 1}`, [base, p1, p2], {
          parent: wr,
          names: [`finger${side}${i + 1}a`, `finger${side}${i + 1}b`],
          role: "digit",
        });
        b.sweep(f, [0.0135, 0.01], { color: LEATHER_L });
      }
      const tb = wp.clone().addScaledVector(dir, 0.03).addScaledVector(lat, -s * 0.052);
      const t1 = tb.clone().addScaledVector(dir, 0.03).addScaledVector(lat, -s * 0.008).add(V(0, 0, 0.025));
      const t2 = t1.clone().addScaledVector(dir, 0.025).add(V(0, 0, 0.022));
      const th = b.chain(`thumb${side}`, [tb, t1, t2], {
        parent: wr,
        names: [`thumb${side}1`, `thumb${side}2`],
        role: "digit",
      });
      b.sweep(th, [0.016, 0.011], { color: LEATHER_L });
    } else {
      // fist around the blunderbuss grip
      wristR = wr;
      b.part(new THREE.BoxGeometry(0.085, 0.095, 0.05), LEATHER_L, { bone: wr, at: [x0 + 0.005, 0.72, -0.055] });
      for (let i = 0; i < 4; i++) {
        const y = 0.745 - 0.02 * i;
        const f = b.chain(
          `finger${side}${i + 1}`,
          catmull([V(x0 - 0.035, y, -0.04), V(x0 - 0.05, y, -0.005), V(x0 - 0.03, y, 0.032), V(x0 + 0.01, y, 0.027)]),
          { parent: wr, names: [`finger${side}${i + 1}a`, `finger${side}${i + 1}b`, `finger${side}${i + 1}c`], role: "digit" },
        );
        b.sweep(f, [0.0125, 0.01], { color: LEATHER_L });
      }
      const th = b.chain(
        `thumb${side}`,
        catmull([V(x0 + 0.04, 0.772, -0.05), V(x0 + 0.045, 0.776, -0.01), V(x0 + 0.025, 0.774, 0.03)]),
        { parent: wr, names: [`thumb${side}1`, `thumb${side}2`], role: "digit" },
      );
      b.sweep(th, [0.016, 0.011], { color: LEATHER_L });
    }
  }

  // ---------------------------------------------------------------- blunderbuss
  const gun = wristR!;
  const gy = 0.84;
  const bz = 0.13;
  const BARREL: [number, number][] = [
    [0, 0], [0.034, 0], [0.034, 0.04], [0.027, 0.07], [0.026, 0.32], [0.032, 0.39],
    [0.05, 0.52], [0.078, 0.62], [0.064, 0.62], [0.046, 0.52], [0.018, 0.41], [0, 0.39],
  ];
  b.lathe(BARREL, { at: [x0, gy, bz], axis: [0, 0, 1], segments: 10, color: IRON, bone: gun });
  b.part(new THREE.CircleGeometry(0.057, 10), DARK, { bone: gun, at: [x0, gy, bz + 0.6], dir: [0, 0, 1], axis: "z" });
  for (const dz of [0.08, 0.2, 0.34]) ring(0.033, 0.006, V(x0, gy, bz + dz), [0, 0, 1], GOLD, gun, 10);
  ring(0.073, 0.008, V(x0, gy, bz + 0.605), [0, 0, 1], GOLD, gun, 12);
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.045, 8), BRASS, { bone: gun, at: [x0, gy, bz + 0.005], dir: [0, 0, 1] });

  const stockA = V(x0, 0.83, 0.16);
  const stockB = V(x0, 0.79, -0.27);
  b.frustumBox(stockA, stockB, [0.06, 0.075], [0.066, 0.14], { color: WOOD_P, bone: gun });
  const sd = stockB.clone().sub(stockA).normalize();
  b.part(new THREE.BoxGeometry(0.072, 0.15, 0.014), BRASS, {
    bone: gun,
    at: stockB.clone().addScaledVector(sd, 0.006),
    dir: sd,
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.028, 0.15, 8), WOOD_D, { bone: gun, at: [x0, 0.72, -0.005] });
  for (const k of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.008, 0.052, 0.1), BRASS, { bone: gun, at: [x0 + k * 0.034, 0.815, 0.09] });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { bone: gun, at: [x0 + k * 0.04, 0.815, 0.07] });
  }
  b.capsule(V(x0 + 0.036, 0.835, 0.11), V(x0 + 0.036, 0.89, 0.06), 0.008, IRON_F, { bone: gun });
  b.part(new THREE.TorusGeometry(0.035, 0.006, 4, 8, Math.PI), BRASS, {
    bone: gun,
    at: [x0, 0.786, 0.06],
    dir: [1, 0, 0],
    up: [0, -1, 0],
    axis: "z",
  });
  b.rod(V(x0, 0.787, 0.075), V(x0, 0.762, 0.06), 0.005, IRON_F, { bone: gun });
  b.rod(V(x0, 0.797, 0.16), V(x0, 0.797, 0.7), 0.007, WOOD_D, { bone: gun });
  b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { bone: gun, at: [x0, 0.797, 0.705] });

  // ---------------------------------------------------------------- head
  const headC = V(0, 1.29, 0.07);
  b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { bone: head, at: headC, scale: [0.115, 0.12, 0.12] });
  b.part(new THREE.SphereGeometry(1, 8, 6), BEARD_D, { bone: head, at: [0, 1.27, -0.05], scale: [0.118, 0.11, 0.09] });
  // upper jaw / lip and dark mouth gap
  b.part(new THREE.BoxGeometry(0.12, 0.04, 0.09), SKIN, { bone: head, at: [0, 1.228, 0.14] });
  b.part(new THREE.BoxGeometry(0.075, 0.014, 0.03), "#4a1e1e", { bone: head, at: [0, 1.208, 0.18] });
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: jaw, at: [0, 1.195, 0.1], scale: [0.085, 0.05, 0.085] });
  // nose and cheeks
  b.part(new THREE.SphereGeometry(0.042, 8, 6), NOSE, { bone: head, at: [0, 1.255, 0.205], scale: [1, 0.95, 1.05] });
  b.capsule(V(0, 1.31, 0.18), V(0, 1.268, 0.212), 0.02, SKIN, { bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 8, 6), CHEEK, { bone: head, at: [s * 0.072, 1.25, 0.14], scale: [1, 0.9, 0.9] });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), SKIN, { bone: head, at: [s * 0.12, 1.28, 0.05], scale: [0.6, 1, 0.8] });
    // eyes
    const ex = s * 0.052;
    b.part(new THREE.SphereGeometry(0.021, 8, 6), "#f4efe6", { bone: head, at: [ex, 1.305, 0.172], scale: [1, 0.85, 0.7] });
    b.part(new THREE.CircleGeometry(0.0115, 10), "#2f7fd0", { bone: head, at: [ex, 1.305, 0.1875], dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.CircleGeometry(0.0055, 8), "#10131c", { bone: head, at: [ex, 1.305, 0.1882], dir: [0, 0, 1], axis: "z" });
    // brows + sideburns
    b.capsule(V(s * 0.012, 1.336, 0.182), V(s * 0.088, 1.326, 0.15), 0.02, BEARD_D, { bone: head });
    b.capsule(V(s * 0.102, 1.33, 0.06), V(s * 0.108, 1.222, 0.1), [0.028, 0.04], BEARD, { bone: head });
    // mustache
    const must = catmull([
      V(s * 0.005, 1.226, 0.208),
      V(s * 0.06, 1.216, 0.208),
      V(s * 0.12, 1.19, 0.19),
      V(s * 0.15, 1.145, 0.195),
      V(s * 0.145, 1.105, 0.215),
    ]);
    b.sweep(must, [0.034, 0.014], { color: MUST_P, bone: head });
    ring(0.018, 0.005, V(s * 0.145, 1.112, 0.213), [0, 1, 0], GOLD, head, 8);
    b.spike(V(s * 0.145, 1.1, 0.214), [0, -1, 0], 0.05, 0.016, { color: BEARD_L, bone: head });
    // goggles
    const gd = V(0, 0.45, 1).normalize();
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 10), GOLD_D, { bone: head, at: [s * 0.052, 1.405, 0.2], dir: gd });
    const lens = b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.036, 10), "#8fd8f0", {
      bone: head,
      at: [s * 0.052, 1.405, 0.2],
      dir: gd,
    });
    glow(lens, 0.6);
  }
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.012), GOLD_D, { bone: head, at: [0, 1.405, 0.192] });

  // beard mass
  b.loft(
    [
      { at: [0, 1.22, 0.13], w: 0.21, h: 0.12 },
      { at: [0, 1.14, 0.18], w: 0.2, h: 0.1 },
      { at: [0, 1.04, 0.235], w: 0.17, h: 0.09 },
      { at: [0, 0.94, 0.25], w: 0.12, h: 0.07 },
      { at: [0, 0.88, 0.25], w: 0.05, h: 0.04 },
    ],
    { bone: head, color: BEARD_P },
  );
  // braids
  for (const bx of [-0.055, 0, 0.055]) {
    const bp = catmull([V(bx, 0.92, 0.255), V(bx * 1.15, 0.82, 0.265), V(bx * 1.3, 0.7, 0.272), V(bx * 1.4, 0.57, 0.278)]);
    b.sweep(bp, [0.02, 0.012], { color: BEARD_D, bone: head });
    let k = 0;
    b.along(bp, 10, (pt) => {
      const sd2 = k % 2 ? 1 : -1;
      const sc = 1 - 0.3 * (k / 9);
      b.part(new THREE.SphereGeometry(0.024, 6, 4), k % 2 ? BEARD : BEARD_L, {
        bone: head,
        at: pt.at.clone().add(V(sd2 * 0.008, 0, 0)),
        dir: pt.axis.clone().add(V(sd2 * 0.8, 0, 0)),
        scale: [sc, sc * 1.5, sc * 0.95],
      });
      k++;
    });
    const bs = bp.at(0.05);
    ring(0.024, 0.007, bs, [0, 1, 0], GOLD, head, 8);
    const be = bp.at(1);
    ring(0.017, 0.006, offset(be, [0, 1, 0], 0.01), [0, 1, 0], GOLD, head, 8);
    b.spike(be, [0, -1, 0], 0.06, 0.02, { color: BEARD_L, bone: head });
  }

  // helm
  const helmAt = V(0, 1.355, 0.07);
  b.lathe(
    [[0, -0.012], [0.145, -0.012], [0.145, 0], [0.128, 0.04], [0.1, 0.08], [0.05, 0.1], [0, 0.105]],
    { at: helmAt, segments: 12, color: STEEL, bone: head },
  );
  ring(0.137, 0.009, V(0, 1.366, 0.07), [0, 1, 0], GOLD, head, 14);
  b.extrude(
    [[-0.125, 0.03], [-0.11, 0.095], [-0.06, 0.135], [0, 0.155], [0.06, 0.135], [0.11, 0.095], [0.125, 0.03]],
    { at: helmAt, thickness: 0.016, color: GOLD, bone: head },
  );
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { bone: head, at: [0, 1.355 + 0.11, 0.07] });

  return b.root;
}
