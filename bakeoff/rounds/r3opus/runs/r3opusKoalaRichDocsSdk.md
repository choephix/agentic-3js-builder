```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, bezier, paint, mottle, patches, noise, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Sleepy Koala",
  description:
    "A drowsy ash-grey koala sitting at the foot of a eucalyptus trunk, hugging it with one arm while munching a sprig of blue-green leaves held in the other paw. Cream chest, fluffy cream-fringed ears, big leathery nose, half-closed eyes.",
};

const FUR_A = "#979ca2";
const FUR_B = "#b6bbc0";
const CREAM = "#efe5d0";
const FRINGE = "#f5f0e6";
const PAW = "#5c5f65";
const CLAW = "#2a2622";
const LID = "#80858b";
const LASH = "#3a3532";
const STEM = "#7d5a45";
const LEAF_A = "#77a497";
const LEAF_B = "#5e8d86";
const LEAF_C = "#8fb3a3";
const RIB = "#c3d6cb";

export default function build() {
  const b = createBuilder({ name: "koala", paintSize: 2048 });
  const R = rng(11);
  type P = ReturnType<typeof paint>;

  // ---------- paints ----------
  const furBase = mottle(FUR_A, FUR_B, { size: 0.05, seed: 4 });
  const fur = paint((p, n) => {
    const w = 0.07 + 0.035 * noise(p, 0.04, 2);
    const top = 0.49 + 0.03 * noise(p, 0.03, 5);
    return n.z > 0.25 && Math.abs(p.x) < w && p.y > 0.12 && p.y < top ? CREAM : furBase;
  });
  const earInner = mottle(CREAM, "#e8d6c6", { size: 0.02, seed: 6 });
  const noseLeather = mottle("#24201e", "#3a3330", { size: 0.008, seed: 8 });
  const bark = patches("#6f604f", ["#d9cfb9", "#c6bea6", "#aab29b", "#cdb595"], { size: 0.07, seed: 3 });
  const ground = mottle(mottle("#6e5b44", "#8a7655", { size: 0.06, seed: 1 }), "#6d7d48", { size: 0.15, seed: 2 });
  const leafPaint = (c: string): P =>
    paint((_p, _n, s) => (Math.abs(s[1]) < 0.0022 && s[0] > 0.006 ? RIB : c));
  const leafPaints = [leafPaint(LEAF_A), leafPaint(LEAF_B), leafPaint(LEAF_C)];

  // ---------- textures ----------
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 C5 50 4 26 9 4 C12 20 14 22 16 0 C18 22 20 20 23 4 C28 26 27 50 16 64 Z" fill="#ffffff"/><path d="M16 60 L13 18 M16 60 L19 18" stroke="#c4c4c4" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );
  const fallen = (fill: string, rib: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96"><path d="M16 96 C4 70 6 30 18 2 C24 30 28 70 16 96 Z" fill="${fill}"/><path d="M16 94 C14 60 15 30 18 6" stroke="${rib}" stroke-width="1.6" fill="none"/></svg>`,
      { size: 192 },
    );
  const fallenTex = [fallen("#6f9a8c", "#b9cfc4"), fallen("#a2794b", "#d1b083"), fallen("#8c8a55", "#c9c38f")];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.155, 0], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.25, 0.005],
      [0, 0.36, 0.015],
      [0, 0.47, 0.035],
    ],
    { parent: hips, names: ["spine1", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.47, 0.035], aim: [0, 0.53, 0.05], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.53, 0.05], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.535, 0.11], aim: [0, 0.52, 0.17], role: "jaw" });

  // ---------- body ----------
  const key = (ks: number[], t: number) => {
    const f = Math.min(0.9999, Math.max(0, t)) * (ks.length - 1);
    const i = Math.floor(f);
    const u = f - i;
    return ks[i] * (1 - u) + ks[i + 1] * u;
  };
  const bodyPath = catmull([
    [0, 0.155, 0],
    [0, 0.25, 0.005],
    [0, 0.36, 0.015],
    [0, 0.47, 0.035],
  ]);
  const body = b.sweep(
    bodyPath,
    (t: number): [number, number] => [key([0.165, 0.172, 0.15, 0.11], t), key([0.145, 0.152, 0.13, 0.095], t)],
    { bone: [hips, spine], color: fur, sides: 12, name: "body" },
  );

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(0.125, 14, 10), fur, {
    bone: head,
    at: [0, 0.615, 0.05],
    scale: [1.12, 0.92, 0.95],
    name: "skull",
  });

  // nose
  b.part(new THREE.SphereGeometry(0.05, 10, 8), noseLeather, {
    bone: head,
    at: [0, 0.585, 0.158],
    scale: [0.6, 0.8, 0.55],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), "#837d78", {
    bone: head,
    at: [0.008, 0.605, 0.18],
    scale: [0.8, 1.5, 0.35],
    name: "noseShine",
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.008, 6, 4), "#0e0b0a", {
      bone: head,
      at: [s * 0.013, 0.553, 0.172],
      scale: [1.3, 0.7, 0.8],
      name: s > 0 ? "nostrilL" : "nostrilR",
    });

  // mouth + jaw
  b.part(new THREE.SphereGeometry(0.016, 8, 6), "#4a2b2b", {
    bone: head,
    at: [0, 0.528, 0.148],
    scale: [1.4, 0.6, 1],
    name: "mouth",
  });
  b.part(new THREE.SphereGeometry(0.032, 10, 7), "#e4dacb", {
    bone: jaw,
    at: [0, 0.515, 0.14],
    scale: [1.25, 0.6, 1.0],
    name: "chin",
  });

  // eyes with drowsy lids
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const E = new THREE.Vector3(s * 0.062, 0.632, 0.142);
    b.part(new THREE.SphereGeometry(0.016, 10, 8), "#5a3820", { bone: head, at: E, name: `eye${S}` });
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), "#120d0a", {
      bone: head,
      at: [E.x, E.y - 0.008, E.z + 0.0115],
      name: `pupil${S}`,
    });
    b.part(new THREE.SphereGeometry(0.0028, 5, 4), "#ffffff", {
      bone: head,
      at: [E.x + 0.004, E.y - 0.008, E.z + 0.0145],
      name: `glint${S}`,
    });
    const lid = b.joint(`lid${S}`, { parent: head, at: E, dir: [0, 0, 1], role: "hinge" });
    b.part(new THREE.SphereGeometry(0.0185, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), LID, {
      bone: lid,
      at: E,
      rotation: [15, 0, 0],
      name: `lidShell${S}`,
    });
    const rim = [-80, -40, 0, 40, 80].map((a) => {
      const r = a * THREE.MathUtils.DEG2RAD;
      return new THREE.Vector3(Math.sin(r), 0, Math.cos(r))
        .multiplyScalar(0.0192)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), 15 * THREE.MathUtils.DEG2RAD)
        .add(E);
    });
    b.sweep(catmull(rim), 0.0022, { bone: lid, color: LASH, sides: 5, name: `lash${S}` });
  }

  // ears
  const circ = (r: number): OutlinePoint[] =>
    Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return [Math.cos(a) * r, Math.sin(a) * r] as OutlinePoint;
    });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const EC = new THREE.Vector3(s * 0.135, 0.705, 0.02);
    const ex: [number, number, number] = [s, 0, -0.3];
    const ey: [number, number, number] = [0, 1, 0];
    const ear = b.extrude(circ(0.072), {
      at: EC,
      x: ex,
      y: ey,
      thickness: 0.032,
      bevel: 0.012,
      smoothing: 1,
      color: furBase,
      bone: head,
      name: `ear${S}`,
    });
    const out = ear.axis.z > 0 ? 1 : -1;
    const front = ear.axis.clone().multiplyScalar(out);
    b.extrude(circ(0.05), {
      at: ear.local([0.01, -0.004, out * 0.02]),
      x: ex,
      y: ey,
      thickness: 0.01,
      bevel: 0.004,
      smoothing: 1,
      color: earInner,
      bone: head,
      name: `earInner${S}`,
    });
    const fringe = b.ring(frame(EC, front), { count: 14, radius: 0.066, fromDeg: -150, toDeg: 150 }).items;
    b.cards(fringe, tuft, {
      size: [0.042, 0.055],
      lean: 15,
      bend: 20,
      vary: 0.25,
      rng: rng(30 + s),
      color: FRINGE,
      bone: head,
    });
    const inner = b.ring(frame(ear.local([0.01, -0.004, out * 0.024]), front), { count: 7, radius: 0.022, tilt: 55 })
      .items;
    b.cards(inner, tuft, { size: [0.032, 0.045], bend: 15, vary: 0.25, rng: rng(40 + s), color: FRINGE, bone: head });
  }

  // ---------- arms ----------
  const armPts: Record<string, number[][]> = {
    L: [
      [0.12, 0.42, 0.05],
      [0.22, 0.31, 0.16],
      [0.13, 0.43, 0.225],
      [0.085, 0.485, 0.225],
    ],
    R: [
      [-0.12, 0.42, 0.05],
      [-0.18, 0.36, 0.24],
      [-0.33, 0.37, 0.245],
      [-0.375, 0.37, 0.15],
    ],
  };
  const limbSweeps: ReturnType<typeof b.sweep>[] = [];
  const handJoints: Record<string, typeof hips> = {};
  const clawsOn = (ch: ReturnType<typeof b.chain>, down: number, spread: number) => {
    const tf = ch.at(1);
    const P = new THREE.Vector3().copy(tf.at);
    const T = new THREE.Vector3().copy(tf.tangent).normalize();
    const B = new THREE.Vector3().copy(tf.binormal).normalize();
    for (let i = 0; i < 5; i++) {
      const o = (i - 2) * spread;
      const base = P.clone().addScaledVector(T, 0.03).addScaledVector(B, o);
      const dir = T.clone().addScaledVector(B, o * 6).add(new THREE.Vector3(0, -down, 0)).normalize();
      b.spike(base, dir, 0.032, 0.0065, { color: CLAW, bone: ch.joints[2], name: `claw_${ch.joints[2].name}_${i}` });
    }
  };
  for (const S of ["L", "R"]) {
    const arm = b.chain(`arm${S}`, armPts[S], {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    handJoints[S] = arm.joints[2];
    const pawT = arm.ts[2] + 0.35 * (1 - arm.ts[2]);
    limbSweeps.push(
      b.sweep(arm, [0.056, 0.048, 0.04, 0.047], {
        color: furBase,
        bands: [
          [pawT, furBase],
          [1, PAW],
        ],
        sides: 9,
        name: `arm${S}`,
      }),
    );
    clawsOn(arm, 0.45, 0.013);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      [
        [s * 0.1, 0.13, 0.05],
        [s * 0.18, 0.2, 0.2],
        [s * 0.155, 0.045, 0.25],
        [s * 0.16, 0.035, 0.34],
      ],
      { parent: hips, names: [`hip${S}`, `knee${S}`, `foot${S}`], role: "leg", contact: [s * 0.16, 0, 0.3] },
    );
    const pawT = leg.ts[2] + 0.3 * (1 - leg.ts[2]);
    limbSweeps.push(
      b.sweep(leg, [0.085, 0.062, 0.048, 0.045], {
        color: furBase,
        bands: [
          [pawT, furBase],
          [1, PAW],
        ],
        sides: 9,
        name: `leg${S}`,
      }),
    );
    clawsOn(leg, 0.25, 0.014);
  }

  // ---------- leaves ----------
  const leaf = (
    base: THREE.Vector3,
    dirIn: THREE.Vector3,
    L: number,
    col: P,
    bone: typeof hips,
    side?: THREE.Vector3,
    bitten = false,
  ) => {
    const d = dirIn.clone().normalize();
    let sd: THREE.Vector3;
    if (side) sd = side.clone().sub(d.clone().multiplyScalar(side.dot(d))).normalize();
    else {
      const ref = Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      sd = new THREE.Vector3().crossVectors(d, ref).normalize().applyAxisAngle(d, (R() - 0.5) * 1.6);
    }
    const o: OutlinePoint[] = bitten
      ? [
          [0, 0, "sharp"],
          [0.18 * L, 0.085 * L],
          [0.4 * L, 0.085 * L],
          [0.47 * L, 0.03 * L, "sharp"],
          [0.6 * L, 0.012 * L],
          [0.72 * L, 0.035 * L, "sharp"],
          [0.82 * L, 0.05 * L],
          [L, 0, "sharp"],
          [0.6 * L, -0.05 * L],
          [0.2 * L, -0.075 * L],
        ]
      : [
          [0, 0, "sharp"],
          [0.18 * L, 0.085 * L],
          [0.55 * L, 0.075 * L],
          [L, 0, "sharp"],
          [0.6 * L, -0.05 * L],
          [0.2 * L, -0.075 * L],
        ];
    b.extrude(o, { at: base, x: d, y: sd, thickness: 0.004, smoothing: 1, color: col, bone, name: "leaf" });
  };
  const pick = () => leafPaints[Math.floor(R() * leafPaints.length) % leafPaints.length];

  // ---------- eucalyptus trunk & branch ----------
  const trunkPath = catmull([
    [-0.28, 0, 0.14],
    [-0.29, 0.4, 0.135],
    [-0.265, 0.8, 0.11],
    [-0.22, 1.18, 0.07],
  ]);
  b.sweep(trunkPath, [0.07, 0.06, 0.05, 0.036], {
    color: bark,
    bone: hips,
    sides: 9,
    caps: { start: "flat", end: "round" },
    name: "trunk",
  });
  b.lathe(
    [
      [0, 0],
      [0.115, 0],
      [0.085, 0.025],
      [0.068, 0.09],
      [0, 0.09],
    ],
    { at: [-0.28, 0, 0.14], segments: 9, color: bark, bone: hips, name: "trunkFlare" },
  );
  const bp = trunkPath.at(0.62);
  const branchPath = catmull([bp, [-0.12, 0.88, 0.17], [0.05, 0.95, 0.21], [0.2, 0.97, 0.22]]);
  b.sweep(branchPath, [0.034, 0.012], { color: bark, bone: hips, sides: 7, name: "branch" });

  for (let i = 0; i < 13; i++) {
    const t = 0.35 + (i / 12) * 0.65;
    const p = new THREE.Vector3().copy(branchPath.at(t));
    const sgn = i % 2 ? 1 : -1;
    const d = new THREE.Vector3(0.3 + R() * 0.4, -0.7 - R() * 0.4, sgn * (0.4 + R() * 0.4));
    leaf(p, d, 0.11 + R() * 0.05, pick(), hips);
  }
  for (let i = 0; i < 9; i++) {
    const t = 0.82 + (i / 8) * 0.18;
    const p = new THREE.Vector3().copy(trunkPath.at(t));
    const a = (i / 9) * Math.PI * 2 + R();
    const d = new THREE.Vector3(Math.cos(a), -0.2 + R() * 0.9, Math.sin(a));
    leaf(p, d, 0.12 + R() * 0.04, pick(), hips);
  }
  // gum nuts
  for (const [path, t] of [
    [branchPath, 0.55],
    [trunkPath, 0.9],
  ] as const) {
    const stem = new THREE.Vector3().copy(path.at(t));
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      const p = stem.clone().add(new THREE.Vector3(Math.cos(a) * 0.014, -0.028, Math.sin(a) * 0.014));
      b.rod(stem, p, 0.0018, { color: STEM, bone: hips, name: "nutStem" });
      b.part(new THREE.CylinderGeometry(0.008, 0.005, 0.013, 6), "#6f6a3e", {
        bone: hips,
        at: p,
        flat: true,
        name: "gumNut",
      });
      b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.002, 6), "#3f3a22", {
        bone: hips,
        at: [p.x, p.y + 0.0065, p.z],
        name: "gumNutCap",
      });
    }
  }

  // ---------- sprig in the left paw ----------
  const handL = handJoints.L;
  const sprigPath = bezier([0.095, 0.47, 0.225], [0.15, 0.55, 0.25], [0.19, 0.68, 0.27]);
  b.sweep(sprigPath, [0.005, 0.0028], { color: STEM, bone: handL, sides: 5, name: "sprigStem" });
  const fwd = new THREE.Vector3(0, 0, 1);
  const sprigDirs = [
    [0.8, 0.35, 0.35],
    [0.25, 0.7, 0.55],
    [0.85, 0.45, 0.1],
    [0.3, 0.8, 0.35],
    [0.4, 1, 0.2],
  ];
  sprigDirs.forEach((dd, i) => {
    const t = 0.35 + i * 0.16;
    const p = new THREE.Vector3().copy(sprigPath.at(Math.min(1, t)));
    const d = new THREE.Vector3(dd[0], dd[1], dd[2]);
    const side = new THREE.Vector3().crossVectors(fwd, d);
    leaf(p, d, 0.1 + R() * 0.02, leafPaints[i % 3], handL, side, i === 1);
  });
  // the leaf being munched: tip inside the mouth
  {
    const base = new THREE.Vector3(0.085, 0.49, 0.23);
    const M = new THREE.Vector3(0.005, 0.53, 0.152);
    const d = M.clone().sub(base);
    const L = d.length() + 0.012;
    leaf(base, d, L, leafPaints[0], handL, new THREE.Vector3().crossVectors(fwd, d), false);
  }

  // ---------- ground ----------
  b.lathe(
    [
      [0, 0],
      [0.46, 0],
      [0.45, 0.006],
      [0.36, 0.011],
      [0, 0.012],
    ],
    { at: [-0.08, 0, 0.1], segments: 11, color: ground, bone: hips, name: "ground" },
  );
  const litter = [
    [0.28, 0.2],
    [0.22, -0.18],
    [-0.1, 0.42],
    [0.05, 0.45],
    [-0.45, 0.05],
    [-0.3, -0.2],
    [0.33, 0.0],
  ];
  litter.forEach(([x, z], i) => {
    const a = R() * Math.PI * 2;
    b.cards([frame([x, 0.0125, z], [0, 1, 0])], fallenTex[i % 3], {
      size: [0.04, 0.12],
      lean: 90,
      flow: [Math.cos(a), 0, Math.sin(a)],
      mirror: true,
      bone: hips,
    });
  });

  // ---------- fur tufts ----------
  const bodyHits = b.surface(body).scatter(170, { rng: rng(21), minDist: 0.03 });
  b.cards(bodyHits, tuft, { size: [0.028, 0.045], lean: 55, bend: 25, vary: 0.3, rng: rng(22), color: fur });
  const headHits = b
    .surface(skull)
    .scatter(70, { rng: rng(23), minDist: 0.025, filter: (h) => h.n.z < 0.35 && h.n.y > -0.4 });
  b.cards(headHits, tuft, { size: [0.022, 0.035], lean: 55, bend: 20, vary: 0.3, rng: rng(24), color: furBase });
  const limbHits = b.surface(limbSweeps).scatter(100, { rng: rng(25), minDist: 0.03 });
  b.cards(limbHits, tuft, { size: [0.024, 0.038], lean: 60, bend: 20, vary: 0.3, rng: rng(26), color: furBase });

  // ---------- pose: mid-munch, sleepy head tilt ----------
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });
  b.pose(head, { axis: [0, 0, 1], deg: 7 });

  return b.root;
}
```