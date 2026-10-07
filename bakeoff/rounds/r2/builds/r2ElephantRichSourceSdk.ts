import * as THREE from "three";
import {
  createBuilder,
  paint,
  mottle,
  mix,
  resolve,
  smoothstep,
  noise,
  catmull,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Elephant Calf",
  description:
    "A gentle African elephant calf with dusty slate skin, big pink-flushed ears, a curious curled trunk, baby tusks, long lashes and padded feet with pale toenails.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "elephantCalf" });

  // ---------- paints ----------
  const slate = mottle("#7b7b85", "#8d8792", { size: 0.2, seed: 2 });
  const dusty = mottle("#a47e68", "#8f6f5f", { size: 0.14, seed: 5 });
  const skin = paint((p, n) => {
    const dust = Math.min(
      1,
      smoothstep(0.6, 0.05, p.y) * 0.85 + 0.25 * noise(p, 0.25, 9) + 0.2 * Math.max(0, n.y),
    );
    const c = mix(resolve(slate, p, n), resolve(dusty, p, n), dust);
    const w = 0.93 + 0.07 * Math.sin(p.y * 70 + noise(p, 0.2, 3) * 9);
    return [c[0] * w, c[1] * w, c[2] * w] as [number, number, number];
  });
  const trunkSkin = paint((p, n, s) => {
    const c = skin.at(p, n);
    const r = 0.86 + 0.14 * Math.sin(s[0] * 95);
    return [c[0] * r, c[1] * r, c[2] * r] as [number, number, number];
  });
  const pink = mottle("#dba39d", "#c98786", { size: 0.08, seed: 4 });

  const ball = (r: number, at: V, scale: V, color: any, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, { at, scale, bone });

  // ---------- skeleton ----------
  b.joint("pelvis", { at: [0, 0.78, -0.5] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.5],
      [0, 0.8, -0.1],
      [0, 0.85, 0.4],
    ]),
    { parent: "pelvis", role: "spine", names: ["spine1", "spine2"] },
  );
  b.chain(
    "neck",
    [
      [0, 0.85, 0.4],
      [0, 0.92, 0.62],
    ],
    { parent: "spine2", role: "neck", names: ["neck", "head"] },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.72, 0.78], dir: [0, -0.1, 1], role: "jaw" });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.74, -0.64], w: 0.34, h: 0.46 },
      { at: [0, 0.77, -0.42], w: 0.5, h: 0.62 },
      { at: [0, 0.79, 0.0], w: 0.56, h: 0.66 },
      { at: [0, 0.82, 0.35], w: 0.56, h: 0.68 },
      { at: [0, 0.87, 0.58], w: 0.42, h: 0.55 },
    ],
    { color: skin, bone: spine, name: "body" },
  );

  // ---------- head ----------
  const skull = ball(0.27, [0, 0.95, 0.75], [0.95, 1, 1], skin, "head");
  ball(0.16, [0.1, 1.07, 0.7], [1, 0.9, 1], skin, "head");
  ball(0.16, [-0.1, 1.07, 0.7], [1, 0.9, 1], skin, "head");
  ball(0.17, [0, 0.8, 0.9], [1, 0.95, 1], skin, "head");
  ball(0.09, [0, 0.67, 0.88], [1.2, 0.7, 1.2], skin, "jaw");

  // trunk
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 0.78, 0.95],
      [0, 0.55, 1.07],
      [0, 0.3, 1.13],
      [0, 0.14, 1.25],
      [0, 0.14, 1.4],
      [0, 0.25, 1.47],
    ]),
    { parent: "head", role: "tentacle" },
  );
  b.sweep(trunk, [0.115, 0.095, 0.075, 0.058, 0.046], { color: trunkSkin, name: "trunk" });
  const tip = trunk.at(1).at;
  for (const sx of [1, -1])
    b.part(new THREE.SphereGeometry(0.014, 6, 5), "#2d2528", {
      at: [tip.x + sx * 0.018, tip.y + 0.03, tip.z + 0.01],
      bone: trunk,
    });

  // tusks
  for (const sx of [1, -1])
    b.spike([sx * 0.1, 0.76, 0.95], [sx * 0.12, -0.3, 0.9], 0.15, 0.03, {
      color: "#efe6cf",
      bone: "head",
      sides: 6,
    });

  // eyes and lashes
  for (const sx of [1, -1]) {
    const E = new THREE.Vector3(sx * 0.21, 0.97, 0.9);
    const out = new THREE.Vector3(sx * 0.8, 0.05, 0.55).normalize();
    const at = (k: number): V => [E.x + out.x * k, E.y + out.y * k, E.z + out.z * k];
    b.part(new THREE.SphereGeometry(0.042, 8, 6), "#6e676c", { at: at(0), scale: [0.8, 1, 1], bone: "head" });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), "#5a3520", { at: at(0.016), bone: "head" });
    b.part(new THREE.SphereGeometry(0.017, 6, 5), "#140d0b", { at: at(0.03), bone: "head" });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), "#ffffff", {
      at: [at(0.04)[0], at(0.04)[1] + 0.01, at(0.04)[2] + 0.005],
      bone: "head",
    });
    for (let i = 0; i < 5; i++) {
      const a = (-50 + i * 25) * (Math.PI / 180);
      const base: V = [E.x + out.x * 0.02 + sx * 0.0, E.y + 0.035, E.z + 0.012 + Math.sin(a) * 0.02];
      b.spike(base, [sx * (0.5 + Math.cos(a) * 0.3), 0.8, 0.6 + Math.sin(a) * 0.9], 0.055, 0.0045, {
        color: "#1d1618",
        bone: "head",
        sides: 4,
      });
    }
  }

  // ears
  for (const sx of [1, -1]) {
    const nm = sx > 0 ? "earL" : "earR";
    const root: V = [sx * 0.2, 0.98, 0.62];
    const xd = new THREE.Vector3(sx * 0.85, -0.12, -0.5).normalize();
    b.joint(nm, { parent: "head", at: root, dir: xd.toArray() as V, role: "hinge" });
    const outline: Array<[number, number]> = [
      [0, 0.13],
      [0.12, 0.22],
      [0.28, 0.23],
      [0.4, 0.12],
      [0.45, -0.05],
      [0.38, -0.23],
      [0.26, -0.35],
      [0.14, -0.31],
      [0.04, -0.15],
      [0, -0.04],
    ];
    const yd = new THREE.Vector3(0, 1, 0);
    const ear = b.extrude(outline, {
      color: skin,
      at: root,
      x: xd.toArray() as V,
      y: yd.toArray() as V,
      thickness: 0.025,
      bevel: 0.008,
      smoothing: 1,
      bone: nm,
      name: nm + "Skin",
    });
    // inner pink face
    const yo = yd.clone().addScaledVector(xd, -yd.dot(xd)).normalize();
    const n = new THREE.Vector3().crossVectors(xd, yo).multiplyScalar(-sx);
    const inner = outline.map(([x, y]) => [0.04 + x * 0.88, y * 0.86 - 0.01] as [number, number]);
    b.extrude(inner, {
      color: pink,
      at: [root[0] + n.x * 0.0135, root[1] + n.y * 0.0135, root[2] + n.z * 0.0135],
      x: xd.toArray() as V,
      y: yd.toArray() as V,
      thickness: 0.006,
      smoothing: 1,
      bone: nm,
      name: nm + "Pink",
    });
    void ear;
  }

  // ---------- legs ----------
  const legSpec = [
    { pre: ["shoulder", "elbow", "wrist"], z: 0.3, parent: "spine2" },
    { pre: ["hip", "knee", "ankle"], z: -0.5, parent: "pelvis" },
  ];
  for (const spec of legSpec)
    for (const sx of [1, -1]) {
      const S = sx > 0 ? "L" : "R";
      const x = sx * 0.2;
      const names = spec.pre.map((p) => p + S);
      const leg = b.chain(
        "leg" + spec.pre[0] + S,
        [
          [x, 0.64, spec.z],
          [x, 0.34, spec.z + 0.015],
          [x, 0.09, spec.z + 0.015],
        ],
        { parent: spec.parent, role: "leg", names, contact: [x, 0, spec.z + 0.015] },
      );
      b.sweep(leg, [0.135, 0.105, 0.105], { color: skin, name: "leg" + spec.pre[0] + S });
      const fz = spec.z + 0.015;
      const foot = names[2];
      b.part(new THREE.CylinderGeometry(0.115, 0.125, 0.09, 10), skin, { at: [x, 0.045, fz], bone: foot });
      for (let i = 0; i < 4; i++) {
        const a = (-48 + i * 32) * (Math.PI / 180);
        b.part(new THREE.BoxGeometry(0.04, 0.04, 0.022), "#e9dfcb", {
          at: [x + Math.sin(a) * 0.125, 0.035, fz + Math.cos(a) * 0.125],
          rotation: [0, a * (180 / Math.PI), 0],
          bone: foot,
        });
      }
    }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.8, -0.68],
      [0, 0.64, -0.78],
      [0, 0.46, -0.8],
      [0, 0.34, -0.79],
    ]),
    { parent: "pelvis", role: "tail" },
  );
  b.sweep(tail, [0.035, 0.024, 0.015], { color: skin, name: "tail" });
  const tt = tail.at(1).at;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike([tt.x, tt.y, tt.z], [Math.cos(a) * 0.45, -1, Math.sin(a) * 0.45 - 0.1], 0.13, 0.011, {
      color: "#3f3436",
      bone: tail,
      sides: 4,
    });
  }

  // ---------- fuzzy bristles on head and back ----------
  const fur = b.surface([body, skull]);
  const hits = fur.scatter(34, { rng: rng(7), filter: (h) => h.n.y > 0.75 && h.at.y > 0.9 });
  for (const h of hits)
    b.spike(h, h, 0.04, 0.005, { color: "#3d3335", sides: 4 });

  return b.root;
}
