import * as THREE from "three";
import { createBuilder, rng, catmull, spiral, limb, mottle } from "../../../../src/index";

export const meta = {
  name: "Clockwork Terrier",
  description:
    "A wind-up terrier of polished brass and copper with riveted plates, chest gears, a winding key, spring legs, leather ears, green glass eyes, a coil-spring tail and a red collar with a brass tag.",
};

const BRASS = "#d4a937";
const BRASS_L = "#f0cf6a";
const BRASS_D = "#8a6420";
const COPPER = "#b8683a";
const LEATHER = "#6b3b22";
const RED = "#c0262d";
const GLASS = "#58e8a8";
const DARK = "#2a2118";
const STEEL = "#9096a0";

function gearOutline(n: number, ro: number, ri: number): [number, number][] {
  const pts: [number, number][] = [];
  const w = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * w;
    for (const [f, r] of [[0, ri], [0.2, ri], [0.3, ro], [0.6, ro], [0.7, ri]] as [number, number][]) {
      pts.push([Math.cos(a + f * w) * r, Math.sin(a + f * w) * r]);
    }
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "clockworkTerrier" });
  const metal = mottle(BRASS, BRASS_L, { size: 0.05, contrast: 0.5, seed: 3 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.27, -0.14] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.27, -0.14],
      [0, 0.28, 0.02],
      [0, 0.31, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );

  // body
  const body = b.sweep(spine, (t) => [0.095 + 0.02 * t, 0.1 + 0.02 * t], {
    color: metal,
    sectors: [[125, 235, COPPER]],
  });

  // bands and rivets
  const skin = b.surface(body);
  for (const z of [-0.06, 0.19]) {
    const loop = skin.loop([0, 0.29, z], { dir: [0, 0, 1], lift: 0.006 });
    b.sweep(loop, 0.009, { color: COPPER, sides: 6 });
    b.along(loop, 16, (at) => b.part(new THREE.SphereGeometry(0.011, 6, 4), BRASS_L, { at }));
  }
  for (const hit of skin.scatter(45, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.y > 0.3 })) {
    b.stick(new THREE.SphereGeometry(0.009, 6, 4), BRASS_D, hit, { embed: 0.4 });
  }

  // neck, head
  const neck = b.joint("neck", {
    parent: spine.joints[1],
    at: [0, 0.34, 0.22],
    aim: [0, 0.45, 0.3],
    role: "neck",
  });
  b.rod([0, 0.34, 0.22], [0, 0.45, 0.3], 0.055, { bone: neck, color: BRASS });
  const head = b.joint("head", { parent: neck, at: [0, 0.45, 0.3], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.405, 0.36],
    aim: [0, 0.4, 0.5],
    role: "jaw",
  });

  b.frustumBox([0, 0.46, 0.27], [0, 0.46, 0.38], [0.15, 0.14], [0.12, 0.12], { bone: head, color: metal });
  b.frustumBox([0, 0.45, 0.38], [0, 0.44, 0.5], [0.1, 0.08], [0.08, 0.07], { bone: head, color: BRASS });
  b.frustumBox([0, 0.395, 0.37], [0, 0.39, 0.49], [0.07, 0.025], [0.06, 0.025], { bone: jaw, color: COPPER });
  b.part(new THREE.SphereGeometry(0.025, 8, 6), DARK, { bone: head, at: [0, 0.47, 0.505] });
  // beard
  b.spike([0, 0.38, 0.45], [0, -0.5, 0.4], 0.06, 0.02, { bone: jaw, color: COPPER });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const eyeAt: [number, number, number] = [s * 0.05, 0.5, 0.385];
    b.part(new THREE.SphereGeometry(0.028, 8, 6), GLASS, { bone: head, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffffff", {
      bone: head,
      at: [s * 0.05 + s * 0.009, 0.51, 0.41],
    });
    b.part(new THREE.TorusGeometry(0.031, 0.007, 6, 12), BRASS_D, {
      bone: head,
      at: [s * 0.05, 0.5, 0.388],
      dir: [0, 0, 1],
      axis: "z",
    });
    // whiskers
    for (const dy of [0, -0.015]) {
      b.rod([s * 0.04, 0.43 + dy, 0.49], [s * 0.13, 0.44 + dy * 2, 0.5], 0.003, { bone: head, color: DARK, sides: 4 });
    }
    // floppy leather ears
    const ear = b.chain(
      `ear${S}`,
      catmull([
        [s * 0.06, 0.52, 0.3],
        [s * 0.11, 0.51, 0.28],
        [s * 0.14, 0.43, 0.26],
      ]),
      { parent: head, names: [`ear${S}1`, `ear${S}2`], role: "hinge" },
    );
    b.sweep(ear, (t) => [0.03 * (1 - 0.4 * t) + 0.006, 0.007], { color: LEATHER });
    // chest gears
    const gx = s * 0.106;
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 14), DARK, {
      bone: spine.joints[1],
      at: [gx, 0.29, 0.1],
      dir: [s, 0, 0],
    });
    const gears: [number, number, number, number, number, string, number][] = [
      [10, 0.055, 0.042, 0.0, 0.0, BRASS_L, 0.113],
      [7, 0.03, 0.022, 0.065, 0.03, COPPER, 0.117],
      [6, 0.026, 0.019, -0.055, -0.03, STEEL, 0.117],
    ];
    for (const [n, ro, ri, dz, dy, col, x] of gears) {
      b.extrude(gearOutline(n, ro, ri), {
        at: [s * x, 0.29 + dy, 0.1 + dz],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.01,
        color: col,
        bone: spine.joints[1],
      });
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6), DARK, {
        bone: spine.joints[1],
        at: [s * (x + 0.004), 0.29 + dy, 0.1 + dz],
        dir: [s, 0, 0],
      });
    }
  }

  // collar + tag
  b.part(new THREE.TorusGeometry(0.064, 0.014, 6, 14), RED, {
    bone: neck,
    at: [0, 0.406, 0.268],
    dir: [0, 0.81, 0.59],
    axis: "z",
  });
  b.part(new THREE.TorusGeometry(0.01, 0.003, 5, 8), BRASS_D, {
    bone: neck,
    at: [0, 0.358, 0.33],
    dir: [0, 0.1, 1],
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.007, 12), BRASS_L, {
    bone: neck,
    at: [0, 0.335, 0.335],
    dir: [0, 0.1, 1],
  });

  // winding key
  const key = b.joint("key", { parent: spine.joints[0], at: [0, 0.38, 0.02], dir: [0, 1, 0], role: "hinge" });
  b.rod([0, 0.37, 0.02], [0, 0.445, 0.02], 0.01, { bone: key, color: STEEL, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), COPPER, { bone: key, at: [0, 0.385, 0.02] });
  b.extrude(
    [
      [-0.012, 0], [0.012, 0], [0.012, 0.03], [0.05, 0.04], [0.075, 0.06], [0.075, 0.09], [0.05, 0.105],
      [0.02, 0.085], [0, 0.07], [-0.02, 0.085], [-0.05, 0.105], [-0.075, 0.09], [-0.075, 0.06], [-0.05, 0.04],
      [-0.012, 0.03],
    ],
    { at: [0, 0.44, 0.02], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, color: BRASS_L, bone: key },
  );

  // legs
  const makeLeg = (name: string, s: number, front: boolean) => {
    const z = front ? 0.15 : -0.12;
    const root: [number, number, number] = [s * 0.085, 0.25, z];
    const foot: [number, number, number] = [s * 0.085, 0.028, z + 0.02];
    const pts = limb(root, foot, [0.13, 0.12], [front ? [0, 0, -1] : [0, 0, 1]]);
    const names = front
      ? [`shoulder${name}`, `elbow${name}`, `paw${name}`]
      : [`hip${name}`, `knee${name}`, `ankle${name}`];
    const leg = b.chain(`leg${name}${front ? "F" : "H"}`, pts, {
      parent: front ? spine.joints[1] : hips,
      names,
      role: "leg",
    });
    b.sweep(leg, [0.03, 0.014], { color: BRASS, sides: 8 });
    b.part(new THREE.SphereGeometry(0.042, 8, 6), COPPER, { bone: leg.joints[0], at: pts[0] });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), COPPER, { bone: leg.joints[1], at: pts[1] });
    // spring on the lower leg
    const d = pts[2].clone().sub(pts[1]);
    const L = d.length();
    d.normalize();
    const center = pts[1].clone().addScaledVector(d, 0.015);
    const side = new THREE.Vector3(1, 0, 0);
    side.addScaledVector(d, -side.dot(d)).normalize();
    const from = center.clone().addScaledVector(side, 0.034);
    const turns = 5;
    const coil = spiral(center, from, d, { turns, r1: 0.034, pitch: (L - 0.04) / turns });
    b.sweep(coil, 0.0065, { bone: leg.joints[1], color: COPPER, sides: 5 });
    // paw
    b.part(new THREE.SphereGeometry(0.04, 8, 6), BRASS, {
      bone: leg.joints[2],
      at: [foot[0], foot[1], foot[2] + 0.02],
      scale: [1, 0.7, 1.4] as any,
    });
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    makeLeg(S, s, true);
    makeLeg(S, s, false);
  }

  // coil-spring tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.3, -0.2],
      [0, 0.38, -0.3],
      [0, 0.5, -0.34],
      [0, 0.6, -0.3],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, 0.011, { color: DARK, sides: 6 });
  b.along(tail, 14, (at) =>
    b.part(new THREE.TorusGeometry(0.035, 0.007, 5, 10), COPPER, {
      at,
      dir: at.axis,
      axis: "z",
      scale: 1 - 0.35 * at.t,
    }),
  );
  b.part(new THREE.SphereGeometry(0.02, 8, 6), BRASS_L, { at: tail.at(1) });

  return b.root;
}
