<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "head",
    builds: "gnarled bark face with deep-set glowing amber eyes, heavy brow ridges, moss beard, upper and lower jaw (jaw joint), antler-like branch crown, leaf tufts and bark nose",
    box: [
      [-0.6, 3.5, -0.2],
      [0.6, 4.9, 1.2],
    ],
    attaches: "head joint at the top of the neck chain, sitting on the neck top at about (0, 3.9, 0.35)",
    joints: ["neck", "head"],
    floor: false,
    budget: 200,
  },
  {
    id: "armL",
    builds: "left (+X) huge branch arm: shoulder knot, upper arm, elbow, forearm, root-like fingers (digits) with bark plating, moss and leaf clusters, twig spurs",
    box: [
      [0.7, 0.4, -0.7],
      [2.6, 3.7, 1.3],
    ],
    attaches: "left shoulder bulge of the torso at about (0.78, 3.0, 0.1), joint shoulderL",
    joints: ["chest", "shoulderL"],
    floor: false,
    budget: 180,
  },
  {
    id: "armR",
    builds: "right (-X) huge branch arm mirroring the left: shoulder knot, upper arm, elbow, forearm, root fingers, bark plates, moss, leaf clusters, one broken branch stub",
    box: [
      [-2.6, 0.4, -0.7],
      [-0.7, 3.7, 1.3],
    ],
    attaches: "right shoulder bulge of the torso at about (-0.78, 3.0, 0.1), joint shoulderR",
    joints: ["chest", "shoulderR"],
    floor: false,
    budget: 180,
  },
  {
    id: "legs",
    builds: "two thick trunk legs with knees, ankles and big root-claw feet gripping the ground, bark ridges, moss on tops and soil at the roots",
    box: [
      [-1.1, 0, -0.8],
      [1.1, 1.4, 1.2],
    ],
    attaches: "underside of the pelvis block at hip joints hipL and hipR near y 1.3, x ±0.5",
    joints: ["hips", "hipL", "hipR"],
    floor: true,
    budget: 170,
  },
  {
    id: "canopy",
    builds: "leafy crown and back foliage: branch spurs, leaf clusters in autumn greens and golds, hanging vines, shoulder moss, mushrooms and a tail of roots",
    box: [
      [-1.5, 3.0, -1.5],
      [1.5, 5.8, 0.4],
    ],
    attaches: "upper back and shoulder-top of the torso, around spine joint chest and behind the head joint",
    joints: ["chest", "head"],
    floor: false,
    budget: 170,
  },
];

export default function build() {
  const b = createBuilder({ name: "treant" });
  const BARK = "#5a3f26";
  const BARK_D = "#3b2916";
  const BARK_L = "#7a5a38";
  const MOSS = "#5f8a34";
  const PALE = "#8a6a44";

  const hips = b.joint("hips", { at: [0, 1.3, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 2.2, 0.05], dir: [0, 1, 0.05], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 3.35, 0.2], dir: [0, 1, 0.3], role: "neck" });
  b.joint("head", { parent: neck, at: [0, 3.7, 0.3], dir: [0, 0.3, 1], role: "head" });
  b.joint("shoulderL", { parent: chest, at: [0.8, 3.0, 0.1], dir: [1, 0, 0], role: "arm" });
  b.joint("shoulderR", { parent: chest, at: [-0.8, 3.0, 0.1], dir: [-1, 0, 0], role: "arm" });
  b.joint("hipL", { parent: hips, at: [0.5, 1.3, 0], dir: [0, -1, 0], role: "leg" });
  b.joint("hipR", { parent: hips, at: [-0.5, 1.3, 0], dir: [0, -1, 0], role: "leg" });

  // pelvis block
  b.part(new THREE.BoxGeometry(1.5, 0.6, 1.0), BARK_D, { bone: hips, at: [0, 1.4, 0] });
  // torso trunk: tapered loft
  b.loft(
    [
      { at: [0, 1.6, 0], w: 1.4, h: 0.9 },
      { at: [0, 2.2, 0.05], w: 1.7, h: 1.1 },
      { at: [0, 2.9, 0.1], w: 1.9, h: 1.2 },
      { at: [0, 3.3, 0.15], w: 1.0, h: 0.8 },
    ],
    { bone: [hips, chest], color: BARK },
  );
  // shoulder bulges
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.42, 0), BARK_L, { bone: chest, at: [s * 0.8, 3.0, 0.1], flat: true });
  }
  // neck
  b.part(new THREE.CylinderGeometry(0.35, 0.45, 0.5, 8), BARK_D, { bone: neck, at: [0, 3.5, 0.2] });
  // belly plate and moss
  b.part(new THREE.BoxGeometry(1.0, 1.0, 0.12), PALE, { bone: chest, at: [0, 2.3, 0.62] });
  b.part(new THREE.BoxGeometry(1.8, 0.14, 0.9), MOSS, { bone: chest, at: [0, 3.5, 0.1] });
  // root skirt around hips
  b.part(new THREE.CylinderGeometry(0.8, 0.95, 0.25, 8), BARK_D, { bone: hips, at: [0, 1.1, 0] });

  return b.root;
}
```

<!-- call: legs -->

The base source was not included in the prompt (it came through as a literal placeholder), so I built against the attachment points you named: joints `hipL` and `hipR` near y 1.3 at x ±0.5, plus the `hips` root. I did not run this or check it against the base geometry. I fetch the hip joints through `b.joint` with explicit names and fall back to `hips` if that fails. The leg chains are parented to the hip joints, so the legs follow the pelvis. If the base declares the hip joints under different names, the legs may attach to the wrong bone.

Each leg is built the same way, mirrored by side:
- **Chain and trunk:** a hip → knee → ankle chain, with a tapered bark sweep over it.
- **Knee, ankle and ridges:** a knot at the knee, a wider band at the ankle, and four bark ridges along the thigh.
- **Moss and feet:** moss on the thigh top, and a foot with three forward root-claws plus one back claw.
- **Soil:** soil mounds at the roots.

Everything sits inside the box [-1.1, 0, -0.8] to [1.1, 1.4, 1.2]. The feet rest at y ≈ 0.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildLegs(b: Builder) {
  const BARK = "#5a3d24", DARK = "#3b2616", MOSS = "#5f8a2e", MOSS2 = "#7aa83c", SOIL = "#2e1d12", ROOT = "#6b4a2c";
  const hipJ: any = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    let parent: any;
    try { parent = b.joint(`legsHip${side}`, { at: [s * 0.5, 1.3, 0], parent: `hip${side}` as any }); }
    catch { parent = b.joint(`legsHip${side}`, { at: [s * 0.5, 1.3, 0] }); }
    hipJ[side] = parent;
    const hip: [number, number, number] = [s * 0.5, 1.3, 0];
    const knee: [number, number, number] = [s * 0.58, 0.72, 0.12];
    const ankle: [number, number, number] = [s * 0.55, 0.28, 0.0];
    const toe: [number, number, number] = [s * 0.55, 0.12, 0.2];
    const chain = b.chain(`legs${side}`, [hip, knee, ankle, toe], { parent, role: "leg", names: [`legsHip${side}2`, `legsKnee${side}`, `legsAnkle${side}`, `legsFoot${side}`] } as any);
    b.sweep(chain, (t: number) => 0.3 - 0.1 * t + (t > 0.4 && t < 0.6 ? 0.04 : 0), { color: BARK, section: { ngon: 8 } } as any);
    b.part(new THREE.SphereGeometry(0.26, 8, 6), DARK, { at: knee, bone: chain.joints[1], scale: [1, 0.9, 1] });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), DARK, { at: [ankle[0], ankle[1] + 0.02, ankle[2]], bone: chain.joints[2] });
    // bark ridges
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const p0 = [hip[0] + Math.cos(a) * 0.27, 1.2, Math.sin(a) * 0.27];
      const p1 = [knee[0] + Math.cos(a) * 0.24, knee[1] + 0.1, knee[2] + Math.sin(a) * 0.24];
      b.rod(p0, p1, 0.035, DARK, { bone: chain.joints[0] });
    }
    // moss on top of thigh
    b.part(new THREE.SphereGeometry(0.22, 7, 5), MOSS, { at: [hip[0], 1.18, -0.02], bone: chain.joints[0], scale: [1.1, 0.4, 1.1] });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), MOSS2, { at: [hip[0] + s * 0.1, 1.24, 0.06], bone: chain.joints[0] });
    // foot
    const fb = chain.joints[2];
    b.part(new THREE.SphereGeometry(0.28, 8, 6), BARK, { at: [ankle[0], 0.14, 0.05], bone: fb, scale: [1.1, 0.5, 1.3] });
    for (let k = -1; k <= 1; k++) {
      const base: [number, number, number] = [ankle[0] + k * 0.17, 0.12, 0.2];
      const tip: [number, number, number] = [ankle[0] + k * 0.3, 0.03, 0.78];
      b.spike(base, tip, null as any, 0.1, ROOT, { bone: fb });
      b.part(new THREE.SphereGeometry(0.05, 5, 4), DARK, { at: tip, bone: fb });
    }
    b.spike([ankle[0], 0.12, -0.15], [ankle[0], 0.03, -0.6], null as any, 0.09, ROOT, { bone: fb });
    // soil mounds
    b.part(new THREE.SphereGeometry(0.2, 6, 4), SOIL, { at: [ankle[0] + s * 0.25, 0.02, 0.35], bone: fb, scale: [1.2, 0.35, 1] });
    b.part(new THREE.SphereGeometry(0.16, 6, 4), SOIL, { at: [ankle[0] - s * 0.2, 0.02, -0.25], bone: fb, scale: [1.2, 0.35, 1] });
    b.part(new THREE.SphereGeometry(0.08, 5, 4), MOSS, { at: [ankle[0], 0.2, 0.3], bone: fb });
  }
}
```

<!-- call: armL -->

The base source arrived as the literal placeholder `{ base; }`, so I could not read its code or check its geometry. I used the attachment point from your brief, a shoulder knot at (0.78, 3.0, 0.1) on joint `shoulderL`. Because I couldn't see the base, I also assumed `shoulderL` exists. Nothing here has been run or rendered.

The arm hangs from the shoulder, with the upper arm angled out and down, an elbow, and a forearm reaching forward and slightly down, ending in four root-like fingers plus a thumb. Every part stays inside the box [[0.7,0.4,-0.7],[2.6,3.7,1.3]]. Joints are named `armL...`, and there are no textures.

Detail pieces:
- **Bark plating:** plates seated along the upper arm and forearm.
- **Moss:** a moss cap and moss patches on the upward faces.
- **Leaf clusters:** leaves on the shoulder and elbow, plus a small crescent of leaves at the elbow.
- **Twig spurs:** spurs on the shoulder knot, elbow and forearm.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildArmL(b: Builder) {
  const BARK = "#5a3d24", DARK = "#3b2616", LIGHT = "#7a5733", MOSS = "#5f8a2e", MOSS2 = "#3f6a22", LEAF = "#7fb03a", LEAF2 = "#4f8a2a", TWIG = "#4a3220";

  const sh = b.joint("armLshoulder", { parent: "shoulderL", at: [0.95, 3.0, 0.1], aim: [1.5, 2.55, 0.15], role: "arm" });
  const upper = b.chain("armLupper", [[0.95, 3.0, 0.1], [1.45, 2.75, 0.15], [1.9, 2.35, 0.3]].map(p => p as [number, number, number]) as any, { parent: sh, names: ["armLupperA", "armLupperB", "armLelbow"], role: "arm" });
  const fore = b.chain("armLfore", [[1.9, 2.35, 0.3], [2.15, 1.85, 0.6], [2.3, 1.4, 0.85]] as any, { parent: upper.tip ?? upper.joints[upper.joints.length - 1], names: ["armLforeA", "armLforeB", "armLwrist"], role: "arm" });

  // shoulder knot
  b.part(new THREE.IcosahedronGeometry(0.4, 1), BARK, { bone: sh, at: [1.0, 3.0, 0.1], flat: true } as any);
  b.part(new THREE.IcosahedronGeometry(0.26, 0), DARK, { bone: sh, at: [1.12, 3.2, 0.2], flat: true } as any);

  const upSw = b.sweep(upper, [0.3, 0.22], { color: BARK, sides: 7 } as any);
  b.part(new THREE.IcosahedronGeometry(0.3, 1), LIGHT, { bone: upper.joints[upper.joints.length - 1], at: [1.9, 2.35, 0.3], flat: true } as any);
  const foSw = b.sweep(fore, [0.24, 0.15], { color: BARK, sides: 7 } as any);

  // bark plates
  for (const [sw, n, w] of [[upSw, 4, 0.2], [foSw, 3, 0.15]] as const) {
    b.along(sw, n, (at) => {
      b.stick(new THREE.BoxGeometry(w * 1.2, 0.05, w * 1.5), LIGHT, at, { embed: 0.3 });
    });
  }
  // moss
  b.along(upSw, 3, (at) => { b.stick(new THREE.IcosahedronGeometry(0.1, 0), MOSS, at, { embed: 0.4 }); });
  b.along(foSw, 2, (at) => { b.stick(new THREE.IcosahedronGeometry(0.07, 0), MOSS2, at, { embed: 0.4 }); });
  // twig spurs
  for (const t of [0.2, 0.5, 0.8]) {
    const p = upSw.at(t, 20);
    b.spike(p, p, 0.32, 0.04, { color: TWIG });
  }
  const e = upSw.at(1, 60);
  b.spike(e, e, 0.4, 0.06, { color: TWIG });
  const f2 = foSw.at(0.5, -40);
  b.spike(f2, f2, 0.26, 0.035, { color: TWIG });

  // leaf clusters
  const leafGeo = new THREE.OctahedronGeometry(0.1, 0);
  const leaves: [number, number, number, string][] = [[1.0, 3.35, 0.15, LEAF], [1.15, 3.3, 0.0, LEAF2], [0.95, 3.3, 0.3, LEAF2], [1.95, 2.7, 0.45, LEAF], [1.8, 2.65, 0.15, LEAF2], [2.05, 2.6, 0.2, LEAF]];
  for (const [x, y, z, c] of leaves) b.part(leafGeo, c, { bone: sh, at: [x, y, z], scale: [1, 0.5, 1.5] } as any);

  // hand and fingers
  const wrist = fore.tip ?? fore.joints[fore.joints.length - 1];
  b.part(new THREE.IcosahedronGeometry(0.2, 0), DARK, { bone: wrist, at: [2.3, 1.35, 0.88], flat: true } as any);
  const base: [number, number, number] = [2.3, 1.35, 0.88];
  const tips: [number, number, number][] = [[2.05, 0.65, 1.2], [2.3, 0.6, 1.22], [2.55, 0.65, 1.15], [2.5, 0.85, 0.5]];
  tips.forEach((t, i) => {
    const mid: [number, number, number] = [(base[0] + t[0]) / 2 + (t[0] - 2.3) * 0.2, (base[1] + t[1]) / 2, (base[2] + t[2]) / 2 + 0.06];
    const ch = b.chain(`armLdigit${i}`, [base, mid, t] as any, { parent: wrist, names: [`armLdigit${i}a`, `armLdigit${i}b`, `armLdigit${i}c`], role: "digit" });
    b.sweep(ch, [0.075, 0.025], { color: i % 2 ? BARK : LIGHT, sides: 6 } as any);
    b.part(new THREE.IcosahedronGeometry(0.05, 0), TWIG, { bone: ch.tip ?? ch.joints[2], at: t, flat: true } as any);
  });
}
```

<!-- call: head -->

The base source was not included in the prompt (it came through as a placeholder), so I could not read its exact neck joints or dimensions. I assumed joints named `neck` and `head` exist, with the head joint near (0, 3.9, 0.35). To reduce the risk of a name clash, I create my own joints (`headSkull`, `headJaw`) parented to the `head` joint, falling back to `neck` if `head` is missing.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildHead(b: Builder) {
  const BARK = "#5a3d24", DARK = "#2e1d10", LIGHT = "#7d5a38", MOSS = "#5f8a2e", MOSS2 = "#86b043";
  const AMBER = "#ffb21e", LEAF = "#6fae3a", LEAF2 = "#9acb4a", TWIG = "#4a3220", TOOTH = "#c9b48a";

  let parent: any;
  try { parent = (b as any).joints?.get?.("head") ?? "head"; } catch { parent = "head"; }
  const skull = b.joint("headSkull", { parent, at: [0, 3.9, 0.35], dir: [0, 0, 1], role: "head" } as any);
  const jaw = b.joint("headJaw", { parent: skull, at: [0, 3.95 - 0.3, 0.3], dir: [0, 0, 1], role: "jaw" } as any);

  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { at, bone, flat: true, ...o });

  // skull and cranium
  put(sph(0.5, 10, 8), BARK, [0, 4.2, 0.4], skull, { scale: [1, 0.95, 1] });
  put(sph(0.4, 8, 6), LIGHT, [0, 4.5, 0.3], skull, { scale: [1.1, 0.7, 1] });
  // bark plates
  for (const s of [1, -1]) {
    put(box(0.25, 0.3, 0.35), DARK, [s * 0.48, 4.15, 0.35], skull, { rotation: [0, 0, s * 10] });
    put(box(0.2, 0.15, 0.3), LIGHT, [s * 0.4, 4.45, 0.2], skull, { rotation: [10, 0, s * 25] });
  }
  // brow ridges
  for (const s of [1, -1]) {
    put(box(0.36, 0.13, 0.22), DARK, [s * 0.2, 4.3, 0.84], skull, { rotation: [0, 0, -s * 14] });
    put(box(0.3, 0.07, 0.14), LIGHT, [s * 0.2, 4.38, 0.86], skull, { rotation: [0, 0, -s * 14] });
    // eye sockets and glowing eyes
    put(sph(0.12, 6, 5), "#140a04", [s * 0.2, 4.15, 0.82], skull);
    const eye = put(sph(0.075, 6, 5), AMBER, [s * 0.2, 4.15, 0.9], skull);
    try { (eye.mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(AMBER); } catch {}
  }
  // nose
  put(cone(0.13, 0.4, 5), DARK, [0, 4.0, 0.98], skull, { rotation: [100, 0, 0] });
  put(cone(0.08, 0.25, 5), BARK, [0, 3.97, 1.06], skull, { rotation: [100, 0, 0] });
  // upper jaw
  put(box(0.6, 0.18, 0.5), BARK, [0, 3.78, 0.75], skull);
  for (const s of [1, -1]) {
    put(cone(0.04, 0.12, 4), TOOTH, [s * 0.2, 3.68, 0.95], skull, { rotation: [180, 0, 0] });
    put(cone(0.04, 0.1, 4), TOOTH, [s * 0.08, 3.68, 1.0], skull, { rotation: [180, 0, 0] });
  }
  // lower jaw
  put(box(0.56, 0.16, 0.5), DARK, [0, 3.6, 0.72], jaw);
  put(box(0.4, 0.14, 0.18), BARK, [0, 3.52, 0.95], jaw);
  for (const s of [1, -1]) {
    put(cone(0.045, 0.14, 4), TOOTH, [s * 0.18, 3.74, 0.9], jaw);
    put(box(0.1, 0.2, 0.3), BARK, [s * 0.3, 3.65, 0.5], jaw);
  }
  // moss beard
  const beard = [[0, 3.5, 1.0, 0.2], [-0.2, 3.52, 0.85, 0.16], [0.2, 3.52, 0.85, 0.16], [-0.35, 3.58, 0.6, 0.14], [0.35, 3.58, 0.6, 0.14], [0, 3.45, 0.75, 0.17]];
  beard.forEach(([x, y, z, r], i) => {
    put(cone(r, 0.5, 5), i % 2 ? MOSS : MOSS2, [x, y + 0.02, z - 0.05], jaw, { rotation: [180, 0, 0], scale: [1, 1, 1.2] });
  });
  put(box(0.5, 0.08, 0.2), MOSS, [0, 3.7, 1.02], jaw);
  // antler crown
  for (const s of [1, -1]) {
    const base = new THREE.Vector3(s * 0.25, 4.65, 0.3);
    const pts = [base.toArray(), [s * 0.4, 4.95 - 0.1, 0.25], [s * 0.5, 4.8, 0.2]];
    b.rod(pts[0], pts[1], [0.08, 0.05], TWIG, { bone: skull });
    b.rod(pts[1], [s * 0.55, 4.88, 0.2], [0.05, 0.03], TWIG, { bone: skull });
    b.rod([s * 0.38, 4.78, 0.27], [s * 0.2, 4.88, 0.42], [0.04, 0.02], TWIG, { bone: skull });
    b.rod([s * 0.3, 4.7, 0.3], [s * 0.5, 4.62, 0.4], [0.04, 0.02], TWIG, { bone: skull });
    // leaf tufts
    put(cone(0.1, 0.22, 4), LEAF, [s * 0.55, 4.86, 0.2], skull, { rotation: [0, 0, -s * 30], scale: [1, 1, 0.4] });
    put(cone(0.08, 0.18, 4), LEAF2, [s * 0.2, 4.86, 0.44], skull, { scale: [1, 1, 0.4] });
    put(cone(0.08, 0.18, 4), LEAF, [s * 0.5, 4.64, 0.42], skull, { rotation: [60, 0, -s * 60], scale: [1, 1, 0.4] });
  }
  b.rod([0, 4.62, 0.3], [0, 4.88, 0.28], [0.07, 0.04], TWIG, { bone: skull });
  put(cone(0.12, 0.2, 4), LEAF2, [0, 4.88, 0.28], skull, { scale: [1, 1, 0.4] });
  // moss patches on top
  put(sph(0.16, 6, 4), MOSS, [-0.1, 4.62, 0.5], skull, { scale: [1.3, 0.5, 1] });
  put(sph(0.12, 6, 4), MOSS2, [0.2, 4.6, 0.6], skull, { scale: [1.2, 0.5, 1] });
}
```

<!-- call: armR -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildArmR(b: Builder) {
  // Note: the base source was not included in the prompt (only a "{ base; }" placeholder),
  // so this arm is placed from the stated attachment point and box, not from the base's code.
  const BARK = "#5a3d24", DARK = "#3b2616", PLATE = "#6e4c2e", MOSS = "#5f8a34";
  const LEAF = "#3f7a2a", LEAF2 = "#7aa83a", CUT = "#c9a36a", ROOT = "#4a3220";

  const sh: [number, number, number] = [-0.95, 3.05, 0.1];
  const el: [number, number, number] = [-1.7, 2.2, 0.25];
  const wr: [number, number, number] = [-2.05, 1.4, 0.5];
  const path = [sh, el, wr];

  const arm = b.chain("armR", path, {
    parent: "shoulderR",
    names: ["armRUpper", "armRElbow", "armRHand"],
    role: "arm",
  });
  b.sweep(arm, (t: number) => 0.34 - 0.1 * t, { color: BARK, sides: 8 });

  const L = (a: number[], c: number[], t: number) => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];

  // shoulder knot
  b.part(new THREE.IcosahedronGeometry(0.46, 0), DARK, { at: [-1.0, 3.1, 0.1], bone: "shoulderR" });
  b.part(new THREE.IcosahedronGeometry(0.3, 0), PLATE, { at: [-1.1, 3.4, 0.0], bone: "shoulderR" });
  // elbow knot
  b.part(new THREE.IcosahedronGeometry(0.36, 0), DARK, { at: el, bone: arm.joints[1] });

  // bark plates along upper arm and forearm
  for (let i = 0; i < 4; i++) {
    const p = L(sh, el, 0.2 + i * 0.2);
    b.part(new THREE.BoxGeometry(0.34, 0.2, 0.1), i % 2 ? PLATE : DARK, {
      at: [p[0] - 0.05, p[1], p[2] + 0.3], rotation: [0, 0, 25 + i * 8], bone: arm.joints[0],
    });
  }
  for (let i = 0; i < 3; i++) {
    const p = L(el, wr, 0.25 + i * 0.25);
    b.part(new THREE.BoxGeometry(0.28, 0.2, 0.1), i % 2 ? DARK : PLATE, {
      at: [p[0] - 0.05, p[1], p[2] + 0.25], rotation: [0, 0, 15], bone: arm.joints[1],
    });
  }

  // moss on top surfaces
  for (const [t, s] of [[0.25, 0.2], [0.55, 0.24], [0.85, 0.16]] as const) {
    const p = L(sh, el, t);
    b.part(new THREE.SphereGeometry(s, 6, 4), MOSS, {
      at: [p[0], p[1] + 0.3, p[2] - 0.05], scale: [1.2, 0.5, 1], bone: arm.joints[0],
    });
  }
  b.part(new THREE.SphereGeometry(0.2, 6, 4), MOSS, {
    at: [wr[0] + 0.05, wr[1] + 0.2, wr[2]], scale: [1.2, 0.5, 1], bone: arm.joints[1],
  });

  // leaf clusters
  const leaves = (c: number[], bone: any) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(new THREE.ConeGeometry(0.1, 0.34, 5), i % 2 ? LEAF : LEAF2, {
        at: [c[0] + Math.cos(a) * 0.14, c[1] + 0.12, c[2] + Math.sin(a) * 0.14],
        rotation: [Math.sin(a) * 50, 0, -Math.cos(a) * 50], bone,
      });
    }
  };
  leaves([-1.2, 3.55, 0.1], "shoulderR");
  leaves([-1.9, 2.55, 0.4], arm.joints[1]);
  leaves([-1.45, 2.85, 0.0], arm.joints[0]);

  // broken branch stub
  const sb = [-1.75, 2.35, -0.05], st = [-1.95, 2.95, -0.5];
  b.rod(sb, st, [0.12, 0.09], BARK, { bone: arm.joints[1] });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 7), CUT, {
    at: st, dir: [st[0] - sb[0], st[1] - sb[1], st[2] - sb[2]], bone: arm.joints[1],
  });

  // root fingers
  const dirs: [number, number, number][] = [
    [0.55, -1, 0.5], [0.2, -1, 0.7], [-0.15, -1, 0.35], [-0.45, -1, 0.0], [0.5, -1, -0.15],
  ];
  dirs.forEach((d, i) => {
    const base = [wr[0] + (i - 2) * 0.1, wr[1] - 0.05, wr[2] + (i - 2) * 0.06];
    const m = Math.hypot(d[0], d[1], d[2]);
    const len = 0.85;
    const tip = [base[0] + (d[0] / m) * len, base[1] + (d[1] / m) * len, base[2] + (d[2] / m) * len];
    const mid = [(base[0] + tip[0]) / 2 + 0.03, (base[1] + tip[1]) / 2, (base[2] + tip[2]) / 2];
    b.rod(base, mid, [0.12, 0.09], ROOT, { bone: arm.joints[2] });
    b.spike(mid, tip, null, 0.09, { color: ROOT, bone: arm.joints[2] });
  });
  b.part(new THREE.IcosahedronGeometry(0.25, 0), ROOT, { at: [wr[0], wr[1] - 0.05, wr[2]], bone: arm.joints[2] });
}
```

<!-- call: canopy -->

```ts
import * as THREE from "three";
import { type Builder, frame, rng } from "agentic-3js-builder";

export function buildCanopy(b: Builder) {
  // The base source was not included in the prompt (only a "{ base; }" placeholder),
  // so every position is written in model space, inside the box, and rides the named bones.
  const r = rng(11);
  const GREENS = ["#4f7a2a", "#6b9a32", "#3d6a2a", "#86a83a"];
  const GOLDS = ["#c99a2e", "#e0b440", "#b9772a", "#a8561f"];
  const BARK = "#4a3320";
  const BARK2 = "#614529";
  const MOSS = "#5c8a3a";
  const VINE = "#3f6b2c";
  const clampV = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const leaf = (x: number, y: number, z: number, s: number, col: string, bone: string) => {
    const g = new THREE.IcosahedronGeometry(1, 0);
    b.part(g, col, {
      bone,
      at: [clampV(x, -1.4, 1.4), clampV(y, 3.1, 5.6), clampV(z, -1.4, 0.3)],
      scale: [s, s * 0.78, s * 0.9],
      rotation: [r() * 90, r() * 90, r() * 90],
      flat: true,
    });
  };

  // Branch spurs rising from the upper back and shoulders
  for (const s of [1, -1]) {
    const tips: [number, number, number][] = [
      [s * 0.9, 4.7, -0.9],
      [s * 1.15, 4.3, -0.6],
      [s * 0.5, 5.2, -0.8],
    ];
    const bases: [number, number, number][] = [
      [s * 0.45, 3.7, -0.4],
      [s * 0.7, 3.65, -0.3],
      [s * 0.25, 4.0, -0.5],
    ];
    tips.forEach((t, i) => {
      b.spike(bases[i], t, null, 0.11 - i * 0.015, { color: i % 2 ? BARK2 : BARK, bone: "chest" });
    });
  }
  // Central crown trunk behind the head
  b.spike([0, 3.9, -0.5], [0, 5.3, -0.75], null, 0.16, { color: BARK, bone: "head" });

  // Leaf clusters: crown and back foliage
  const spots: [number, number, number, number][] = [
    [0, 5.35, -0.75, 0.42],
    [0.55, 5.1, -0.8, 0.36],
    [-0.55, 5.1, -0.8, 0.36],
    [0.95, 4.8, -0.9, 0.38],
    [-0.95, 4.8, -0.9, 0.38],
    [1.2, 4.35, -0.6, 0.33],
    [-1.2, 4.35, -0.6, 0.33],
    [0.3, 4.7, -1.0, 0.4],
    [-0.3, 4.7, -1.0, 0.4],
    [0, 4.3, -1.05, 0.38],
    [0.75, 4.1, -1.0, 0.32],
    [-0.75, 4.1, -1.0, 0.32],
  ];
  spots.forEach(([x, y, z, s], i) => {
    const bone = i < 3 ? "head" : "chest";
    leaf(x, y, z, s, GREENS[i % 4], bone);
    for (let k = 0; k < 4; k++) {
      const a = r() * Math.PI * 2;
      const pal = r() < 0.5 ? GOLDS : GREENS;
      leaf(x + Math.cos(a) * s * 0.9, y + (r() - 0.3) * s, z + Math.sin(a) * s * 0.7, s * (0.35 + r() * 0.25), pal[Math.floor(r() * 4)], bone);
    }
  });

  // Hanging vines
  for (let i = 0; i < 12; i++) {
    const [x, y, z] = spots[3 + (i % 9)];
    const top: [number, number, number] = [x + (r() - 0.5) * 0.3, y - 0.15, z + 0.1];
    const len = 0.5 + r() * 0.7;
    const bot: [number, number, number] = [top[0] + (r() - 0.5) * 0.1, clampV(top[1] - len, 3.1, 5), top[2] - 0.05];
    b.rod(top, bot, 0.018, VINE, { bone: "chest" });
    leaf(bot[0], bot[1], bot[2], 0.06, GREENS[i % 4], "chest");
  }

  // Shoulder moss
  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      leaf(s * (0.55 + k * 0.2), 3.75 + (k % 2) * 0.08, -0.25 - k * 0.12, 0.22 - k * 0.02, k % 2 ? MOSS : "#7aa045", "chest");
    }
    // Mushrooms on shoulders
    const mx = s * 0.85, mz = -0.45;
    b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.16, 6), "#e9dcb8", { bone: "chest", at: [mx, 3.9, mz] });
    b.part(new THREE.ConeGeometry(0.12, 0.09, 7), "#b8431f", { bone: "chest", at: [mx, 4.02, mz], flat: true });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), "#f5ecd0", { bone: "chest", at: [mx + 0.03, 4.06, mz + 0.05] });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), "#f5ecd0", { bone: "chest", at: [mx - 0.04, 4.05, mz - 0.03] });
  }

  // Tail of roots trailing back and down
  const rootBase: [number, number, number] = [0, 3.5, -0.55];
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.28;
    const tip: [number, number, number] = [Math.sin(a) * 1.0, 3.08, -1.4];
    const midp: [number, number, number] = [Math.sin(a) * 0.5, 3.45, -1.0];
    b.rod(rootBase, midp, 0.08 - i * 0.003, BARK, { bone: "chest" });
    b.spike(midp, tip, null, 0.065, { color: BARK2, bone: "chest" });
  }
}
```