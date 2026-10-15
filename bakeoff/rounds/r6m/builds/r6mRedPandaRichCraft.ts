import * as THREE from "three";
import {
  createBuilder,
  rng,
  limb,
  catmull,
  noise,
  mix,
  smoothstep,
  paint,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded, Genshin-style red panda balancing on a mossy boulder, with a raised paw, a ringed tail held high, a bell collar, dendro crystals, sweet flowers and floating seeds.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const ST = 0.2; // stone top
  const BY = ST + 0.25; // body line height
  const V3 = (a: V) => new THREE.Vector3(...a);
  const along = (p: V, d: V, k: number): V => {
    const n = V3(d).normalize();
    return [p[0] + n.x * k, p[1] + n.y * k, p[2] + n.z * k];
  };

  // ---------- palette ----------
  const ORANGE = "#e2582a";
  const ORANGE_D = "#b83a1e";
  const BROWN = "#3a2020";
  const COAT = cel(furEdge(ORANGE, BROWN, { level: -0.12, teeth: 0.25, period: 0.03, ink: "#22112f", inkWidth: 0.05 }));
  const LEG = cel("#3b2220");
  const CREAM = cel("#fff1d6", "#e9c9a8");
  const NOSE = "#1b1116";
  const GOLD = "#f2c04a";
  const RIBBON = "#cf2f2a";
  const rings = paint((_p, _n, s) => (s[0] > 0.93 ? "#4a2420" : Math.floor(s[0] * 10) % 2 ? ORANGE_D : ORANGE));
  const TAIL = cel(rings);
  const stoneP = cel(
    paint((p, n) => {
      const stone = mix("#5d6678", "#9aa4b4", noise(p, 0.08, 2));
      const moss = mix("#2f6b2c", "#7fbf44", noise(p, 0.05, 5));
      const t = smoothstep(0.35, 0.55, n.y + (noise(p, 0.12, 3) - 0.5) * 0.9);
      return mix(stone, moss, t);
    }),
  );
  const MOSS = cel(mix("#3d8a34", "#86c84e", 0.5));

  // ---------- textures ----------
  const EYE = animeEye({ iris: "#f0a020", irisLight: "#ffe27a" });
  const TEAR = svg(`<svg viewBox="0 0 20 60"><path d="M4 0 Q8 30 10 58 Q16 28 16 0 Z" fill="#4a241c"/></svg>`, { size: 96 });
  const GRASS = svg(
    `<svg viewBox="0 0 40 60"><path d="M8 60 Q6 30 2 6 Q14 28 18 60Z" fill="#4f9a3a"/><path d="M14 60 Q18 28 22 0 Q28 30 28 60Z" fill="#7cc24a"/><path d="M24 60 Q30 34 38 14 Q36 40 34 60Z" fill="#3b7a2e"/></svg>`,
    { size: 128 },
  );
  const FLOWER = svg(
    `<svg viewBox="0 0 40 60"><rect x="19" y="26" width="3" height="34" fill="#3b7a2e"/><path d="M21 48 Q32 44 34 36 Q26 38 21 44Z" fill="#4f9a3a"/>
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="20" cy="11" rx="5.5" ry="9" fill="#fff6f0" stroke="#e7a9c0" stroke-width="1.2" transform="rotate(${a} 20 20)"/>`).join("")}
    <circle cx="20" cy="20" r="4.5" fill="#f6c443"/></svg>`,
    { size: 128 },
  );

  // ---------- stone & setting ----------
  const stone = b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.42, 0.07],
      [0.43, 0.14],
      [0.34, ST],
      [0, ST],
    ],
    { at: [0, 0, 0.02], segments: 8, color: stoneP },
  );
  const rock = (p: V, r: number) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), stoneP, { at: p, scale: [1, 0.7, 1], flat: true });
  rock([0.5, 0.04, -0.1], 0.075);
  rock([-0.48, 0.035, 0.2], 0.065);
  rock([0.1, 0.03, 0.5], 0.055);

  const skinStone = b.surface(stone);
  const free = (h: { at: THREE.Vector3; n: THREE.Vector3 }) =>
    !(Math.abs(h.at.x) < 0.2 && h.at.z > -0.32 && h.at.z < 0.34);
  b.cards(
    skinStone.scatter(70, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.y > 0.7 && free(h) }),
    GRASS,
    { size: [0.07, 0.08], lean: 20, vary: 0.4, rng: rng(6), cross: true },
  );
  for (const h of skinStone.scatter(14, { rng: rng(8), minDist: 0.08, filter: (h) => h.n.y > 0.5 && free(h) }))
    b.stick(new THREE.IcosahedronGeometry(0.035, 0), MOSS, h, { embed: 0.5, flat: true });
  for (const [x, z] of [[0.3, 0.22], [-0.3, -0.05], [0.25, -0.2]] as const)
    b.cards([{ at: new THREE.Vector3(x, ST, z), axis: new THREE.Vector3(0, 1, 0) } as never], FLOWER, {
      size: [0.07, 0.1],
      cross: true,
      sink: 0.05,
    });

  // dendro crystals + floating seeds
  for (const [p, d, len] of [
    [[0.27, ST, 0.12], [0.3, 1, 0.2], 0.15],
    [[0.31, ST - 0.01, 0.05], [0.6, 1, -0.1], 0.1],
    [[-0.26, ST, -0.12], [-0.3, 1, -0.1], 0.14],
    [[-0.3, ST - 0.01, -0.02], [-0.6, 1, 0.2], 0.09],
  ] as [V, V, number][]) {
    glow(
      b.part(new THREE.ConeGeometry(0.03, len, 6), "#6df0c8", {
        at: along(p, d, len * 0.4),
        dir: d,
        flat: true,
      }),
      1.4,
    );
  }
  for (const p of [[0.32, 0.62, 0.3], [-0.34, 0.78, 0.2], [0.22, 0.98, -0.4]] as V[])
    glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), "#9dffb0", { at: p }), 2);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, BY, -0.2] });
  const spinePts: V[] = [
    [0, BY, -0.2],
    [0, BY, -0.08],
    [0, BY + 0.01, 0.08],
    [0, BY + 0.03, 0.2],
  ];
  const spine = b.chain("spine", catmull(spinePts), { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });
  const chest = spine.joints[2];
  b.sweep(spine, (t) => {
    const k = Math.sin(Math.PI * (0.1 + 0.8 * t));
    return [0.08 + 0.06 * k, 0.075 + 0.055 * k];
  }, { color: COAT });

  const neckPts: V[] = [
    [0, BY + 0.03, 0.2],
    [0, BY + 0.07, 0.27],
    [0, BY + 0.1, 0.33],
  ];
  const neck = b.chain("neck", catmull(neckPts), { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const neckTube = b.sweep(neck, [0.095, 0.085], { color: COAT });
  const HC: V = [0, BY + 0.13, 0.38];
  const head = b.joint("head", { parent: neck.joints[1], at: neckPts[2], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HC[1] - 0.045, HC[2] - 0.02],
    aim: [0, HC[1] - 0.05, HC[2] + 0.1],
    role: "jaw",
  });

  // ---------- head ----------
  const HEADP = cel(
    paint((p) => {
      const dx = Math.abs(p.x - HC[0]);
      const dy = p.y - HC[1];
      const dz = p.z - HC[2];
      if (dz > 0.05 && dy < 0.03) return "#fff1d6";
      if (dx > 0.06 && dy < 0.03 && dz > -0.03) return "#fff1d6";
      if (dx > 0.02 && dx < 0.05 && dy > 0.05 && dz > 0.02) return "#fff1d6";
      return dy > 0.05 ? ORANGE_D : ORANGE;
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADP, { bone: head, at: HC, scale: [0.125, 0.1, 0.108] });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: head,
    at: [0, HC[1] - 0.03, HC[2] + 0.09],
    scale: [0.05, 0.042, 0.055],
  });
  b.part(new THREE.SphereGeometry(0.015, 6, 4), NOSE, { bone: head, at: [0, HC[1] - 0.012, HC[2] + 0.143] });
  b.part(new THREE.SphereGeometry(1, 10, 6), CREAM, {
    bone: jaw,
    at: [0, HC[1] - 0.058, HC[2] + 0.07],
    scale: [0.04, 0.02, 0.055],
  });

  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const th = skin.around(HC).at(s * 33, -18);
    if (th) b.decal(skin, TEAR, { at: th, size: [0.02, 0.055], lift: 0.002, mirror: s > 0 });
    const eh = skin.around(HC).at(s * 38, 4);
    if (eh) b.decal(skin, EYE, { at: eh, size: [0.044, 0.06], lift: 0.004, mirror: s > 0 });

    // ears: cream rim, orange body, cream inner tuft
    const ed: V = [s * 0.45, 0.35, 0.8];
    const EC: V = [s * 0.088, HC[1] + 0.085, HC[2] - 0.015];
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 8), CREAM, { bone: head, at: EC, dir: ed });
    b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.018, 8), HEADP, { bone: head, at: along(EC, ed, 0.005), dir: ed });
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.018, 8), CREAM, { bone: head, at: along(EC, ed, 0.011), dir: ed });

    // cheek ruffs
    for (const [dy, dz, ds] of [[-0.01, 0.01, 1], [-0.035, 0.0, 0.8], [-0.055, 0.03, 0.6]] as V[])
      b.spike([s * 0.095, HC[1] + dy, HC[2] + dz], [s * 0.9, -0.2 * ds, -0.3], 0.06 * ds, 0.022, { color: CREAM, bone: head });
    // whiskers
    for (let k = 0; k < 3; k++)
      b.rod(
        [s * 0.04, HC[1] - 0.03 - k * 0.006, HC[2] + 0.12],
        [s * 0.13, HC[1] - 0.02 - k * 0.025, HC[2] + 0.11],
        0.0025,
        "#fff6e6",
        { bone: head, sides: 4 },
      );
  }

  // collar with bell
  const loop = b.surface(neckTube).loop(neck.at(0.5), { lift: 0.004 });
  b.sweep(loop, 0.013, RIBBON);
  const bellHit = b.surface(neckTube).around(neck.at(0.5).at).at(0, -35);
  if (bellHit) {
    b.stick(new THREE.SphereGeometry(0.022, 8, 6), GOLD, bellHit, { embed: 0.3 });
    for (const s of [1, -1])
      b.spike(bellHit.at, [s * 0.25, -1, 0.3], 0.08, 0.014, { color: RIBBON });
  }

  // ---------- legs ----------
  const paw = (c: ReturnType<typeof b.chain>, p: V, tilt = 0) => {
    b.part(new THREE.SphereGeometry(0.05, 8, 6), LEG, {
      bone: c.tip!,
      at: [p[0], p[1] - 0.003, p[2] + 0.018],
      scale: [1, 0.65, 1.35],
      rotation: [tilt, 0, 0],
    });
    for (const k of [-1, 0, 1])
      b.part(new THREE.SphereGeometry(0.016, 6, 4), LEG, {
        bone: c.tip!,
        at: [p[0] + k * 0.025, p[1] - 0.006, p[2] + 0.062 - Math.abs(k) * 0.008],
      });
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // hind
    const hf: V = [s * 0.1, ST + 0.035, -0.26];
    const hp = limb([s * 0.1, BY - 0.03, -0.2], hf, [0.17, 0.16], [[0, 0, 1]]);
    const hl = b.chain(`legH${side}`, hp, { parent: hips, names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`], role: "leg" });
    b.sweep(hl, [0.08, 0.06, 0.042], { color: LEG });
    paw(hl, hf);
    // front
    const raised = s < 0;
    const ff: V = raised ? [-0.15, BY - 0.02, 0.3] : [0.11, ST + 0.035, 0.2];
    const fp = limb([s * 0.1, BY - 0.02, 0.13], ff, [0.15, 0.14], [raised ? [0, -1, 0] : [0, 0, -1]]);
    const fl = b.chain(`legF${side}`, fp, { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    b.sweep(fl, [0.07, 0.055, 0.04], { color: LEG });
    paw(fl, ff, raised ? -35 : 0);
  }

  // ---------- tail ----------
  const tailPts: V[] = [
    [0, BY - 0.01, -0.24],
    [0, BY, -0.4],
    [0, BY + 0.1, -0.56],
    [0, BY + 0.27, -0.62],
    [0, BY + 0.45, -0.55],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });
  b.sweep(tail, [0.05, 0.075, 0.09, 0.085, 0.07, 0.04], { color: TAIL });

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
  return b.root;
}
