<!-- call: plan -->

```json
{
  "name": "Dwarf Blacksmith at the Anvil",
  "description": "A stocky Warcraft-style dwarf smith with braided red beard, plate pauldrons and leather apron, hammer raised over a glowing anvil beside a small forge.",
  "builderName": "dwarfSmith",
  "size": [1.9, 1.5, 1.4],
  "layout": "The dwarf is about 1.35 m tall (huge Warcraft proportions: broad shoulders, big hands and boots, short legs, big head), standing at x=0, z=-0.15, facing +Z. In front of him (+Z) stands a heavy iron anvil on a log stump, centred at z=0.45. His right arm (model -X) is raised holding a big hammer above the anvil; his left arm (+X) holds tongs with a glowing bar on the anvil. A small stone forge with glowing coals sits behind-left (x=0.65, z=-0.45). Chunky, faceted, bold shapes; oversized pauldrons with rivets and spikes, braided beard with metal rings, saturated warm palette with glowing orange accents. Everything is flat colours and small seated detail parts.",
  "palette": {
    "skin": "#d9a07a",
    "skinShade": "#b87a58",
    "beard": "#b8431c",
    "beardLight": "#e0702a",
    "hair": "#8a2e14",
    "leather": "#6b4226",
    "leatherDark": "#3f2615",
    "plate": "#5d6b86",
    "plateLight": "#9fb0cc",
    "gold": "#e0b030",
    "cloth": "#3a4f8a",
    "iron": "#2f3036",
    "ironLight": "#585a66",
    "wood": "#7a5030",
    "woodDark": "#4a2e1a",
    "stone": "#6f6a64",
    "stoneDark": "#48443f",
    "ember": "#ff7a1a",
    "hotYellow": "#ffd35a",
    "eye": "#2a1a10",
    "white": "#f4efe4"
  },
  "mounts": {
    "hips": [0, 0.5, -0.15],
    "chest": [0, 0.78, -0.15],
    "neck": [0, 1.05, -0.12],
    "headCenter": [0, 1.2, -0.1],
    "shoulderR": [-0.3, 1.0, -0.15],
    "shoulderL": [0.3, 1.0, -0.15],
    "handR": [-0.35, 1.5, 0.2],
    "handL": [0.3, 0.85, 0.3],
    "anvilTop": [0, 0.78, 0.45],
    "forgeCenter": [0.65, 0, -0.5],
    "floor": [0, 0, 0]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.5, -0.15], "dir": [0, 1, 0], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 0.78, -0.15], "dir": [0, 1, 0], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 1.05, -0.12], "dir": [0, 1, 0], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.15, -0.1], "dir": [0, 1, 0], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.15, -0.02], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "upperArmR", "parent": "chest", "at": [-0.3, 1.0, -0.15], "dir": [0, -1, 0], "role": "arm", "group": "arms" },
    { "name": "elbowR", "parent": "upperArmR", "at": [-0.4, 0.78, -0.15], "dir": [0, -1, 0], "role": "arm", "group": "arms" },
    { "name": "upperArmL", "parent": "chest", "at": [0.3, 1.0, -0.15], "dir": [0, -1, 0], "role": "arm", "group": "arms" },
    { "name": "elbowL", "parent": "upperArmL", "at": [0.4, 0.78, -0.15], "dir": [0, -1, 0], "role": "arm", "group": "arms" },
    { "name": "hipL", "parent": "hips", "at": [0.14, 0.48, -0.15], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.14, 0.25, -0.13], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.14, 0.48, -0.15], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.14, 0.25, -0.13], "dir": [0, -1, 0], "role": "leg", "group": "legs" }
  ],
  "parts": [
    {
      "id": "body",
      "builds": "Legs with boots (wide cuffed leather boots with gold buckles, cloth trousers), hips, belt with big gold buckle and hanging tools (pouch, small hammer), leather apron with stitched trim and soot stains, barrel torso with cloth shirt, and the neck. Uses the legs/hips/chest/neck joints. Boots must touch y=0 and be big and chunky.",
      "box": [[-0.38, 0, -0.45], [0.38, 1.08, 0.2]],
      "attaches": "Shoulder mounts shoulderR/shoulderL for arms and pauldrons; neck mount for the head.",
      "joints": ["hips", "chest", "neck", "hipL", "kneeL", "hipR", "kneeR"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "head",
      "builds": "Big square characterful head: heavy brow ridge, big bulbous nose, deep-set eyes with white and dark pupils and bushy brows, ears, a separate upper skull and lower jaw (jaw joint), mouth hidden behind the beard. Huge braided red beard flowing down the chest in two braids with gold rings and tips, layered overlapping blades from beardLight to beard, moustache with curled ends, red hair with a topknot, and a small plate helmet band with a gold rune stud across the forehead.",
      "box": [[-0.28, 0.85, -0.35], [0.28, 1.42, 0.2]],
      "attaches": "Sits on the neck mount; beard drapes over chest front without covering the belt.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "arms",
      "builds": "Both arms and gear: oversized plate pauldrons with rivets, gold trim and spikes; leather bracers; muscular skin forearms with hair; big gloved hands. Right arm (-X) raised, gripping the hammer handle at handR; left arm (+X) forward holding long tongs gripping a glowing bar at handL. The hammer: wooden haft with leather wrap, big iron head with gold bands and a rune; head glows faintly at the striking face.",
      "box": [[-0.65, 0.65, -0.35], [0.6, 1.75, 0.5]],
      "attaches": "Roots at shoulderR/shoulderL on the chest joint; hands reach handR and handL.",
      "joints": ["upperArmR", "elbowR", "upperArmL", "elbowL", "chest"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "anvil",
      "builds": "Heavy iron anvil (horn, face, waist, base feet) with a bright steel face, gold maker's mark, on a thick log stump with bark rings, axe marks and iron bands. A glowing orange-yellow bar on the face with a few spark particles (small hotYellow and ember cubes) floating above. Static, no joints.",
      "box": [[-0.35, 0, 0.1], [0.35, 0.95, 0.95]],
      "attaches": "Top surface at anvilTop where the glowing bar lies for the tongs and hammer.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "forge",
      "builds": "Small chunky stone forge behind-left: stacked rough stone blocks forming a hearth with a chimney hood, glowing coal bed (ember and hotYellow faceted lumps), iron grate, leather bellows with wooden handles, a bucket of water, and a rack with tongs and chisels on the wall side. Also a few small flame shapes in ember/hotYellow. Static, no joints.",
      "box": [[0.3, 0, -0.75], [0.95, 1.5, -0.2]],
      "attaches": "Centred on forgeCenter; stands on the floor beside the dwarf, not touching his arms.",
      "joints": [],
      "floor": true,
      "budget": 160
    }
  ]
}
```

<!-- call: anvil -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };

export function buildAnvil({ b, J, P, M }: Ctx) {
  const B = J.hips; // static prop: ride the root joint so it never drifts
  const [CX, TOPY, CZ] = M.anvilTop;
  const R = rng(42);

  // own colours (6)
  const STEEL_EDGE = "#e6edf7";
  const SCORCH = "#1d1d22";
  const HOLE = "#111114";
  const MOSS = "#4f6a2e";
  const CUT = "#a77a4a";
  const GASH = "#2a1608";

  const put = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: B, at, flat: true, ...o });

  // tapered rectangular block, origin at base centre, y 0..h
  const frustumGeo = (w0: number, d0: number, w1: number, d1: number, h: number) => {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const c = [
      V(-w0 / 2, 0, -d0 / 2), V(w0 / 2, 0, -d0 / 2), V(w0 / 2, 0, d0 / 2), V(-w0 / 2, 0, d0 / 2),
      V(-w1 / 2, h, -d1 / 2), V(w1 / 2, h, -d1 / 2), V(w1 / 2, h, d1 / 2), V(-w1 / 2, h, d1 / 2),
    ];
    const faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
    const pos: number[] = [];
    const centre = V(0, h / 2, 0);
    for (const f of faces) {
      let q = f.map((i) => c[i]);
      const n = new THREE.Vector3().subVectors(q[1], q[0]).cross(new THREE.Vector3().subVectors(q[2], q[0]));
      const cen = q.reduce((a, v) => a.add(v), V(0, 0, 0)).multiplyScalar(0.25);
      if (n.dot(cen.sub(centre)) < 0) q = [q[3], q[2], q[1], q[0]];
      for (const i of [0, 1, 2, 0, 2, 3]) pos.push(q[i].x, q[i].y, q[i].z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  };
  const block = (cx: number, y0: number, cz: number, w0: number, d0: number, w1: number, d1: number, h: number, color: string) =>
    put(frustumGeo(w0, d0, w1, d1, h), color, [cx, y0, cz]);

  // ---------------------------------------------------------------- stump
  const ST = 0.42; // stump top
  const TR = 0.285;
  put(new THREE.CylinderGeometry(TR, TR + 0.004, 0.4, 12), P.woodDark, [CX, 0.2, CZ]);
  // cut-wood cap with rings
  put(new THREE.CylinderGeometry(0.295, 0.292, 0.025, 12), CUT, [CX, ST - 0.0125, CZ]);
  for (const r of [0.255, 0.215, 0.17, 0.12])
    put(new THREE.RingGeometry(r - 0.004, r + 0.004, 12), P.wood, [CX, ST + 0.0015, CZ], { rotation: [-90, 0, 0] });
  // radial cracks and axe cuts on the cap
  for (const [a, r, len] of [[40, 0.235, 0.09], [165, 0.24, 0.07], [260, 0.235, 0.1]] as number[][])
    put(new THREE.BoxGeometry(0.006, 0.003, len), GASH, [CX + Math.sin((a * Math.PI) / 180) * r, ST + 0.001, CZ + Math.cos((a * Math.PI) / 180) * r], { rotation: [0, a, 0] });
  for (const [a, r] of [[100, 0.22], [215, 0.225]] as number[][])
    put(new THREE.BoxGeometry(0.07, 0.004, 0.012), P.woodDark, [CX + Math.sin((a * Math.PI) / 180) * r, ST + 0.001, CZ + Math.cos((a * Math.PI) / 180) * r], { rotation: [0, a + 70, 0] });

  // bark ridges at the 12 vertices
  for (let k = 0; k < 12; k++) {
    const a = k * 30;
    const h = 0.26 + R() * 0.1;
    const y0 = 0.02 + R() * 0.06;
    const ar = (a * Math.PI) / 180;
    put(new THREE.BoxGeometry(0.04, h, 0.03), k % 2 ? P.leather : P.wood,
      [CX + Math.sin(ar) * (TR + 0.002), y0 + h / 2, CZ + Math.cos(ar) * (TR + 0.002)], { rotation: [0, a, 0] });
  }
  // axe marks on the trunk faces
  for (const [fa, y, roll] of [[45, 0.2, 35], [135, 0.16, -30], [195, 0.24, 40], [285, 0.2, -35], [345, 0.15, 30]] as number[][]) {
    const ar = (fa * Math.PI) / 180;
    const r = 0.276;
    put(new THREE.BoxGeometry(0.1, 0.014, 0.014), GASH, [CX + Math.sin(ar) * r, y, CZ + Math.cos(ar) * r], { rotation: [0, fa, roll] });
    put(new THREE.BoxGeometry(0.05, 0.008, 0.01), CUT, [CX + Math.sin(ar) * (r + 0.004), y + 0.025, CZ + Math.cos(ar) * (r + 0.004)], { rotation: [0, fa, roll] });
  }

  // iron bands with rivets
  for (const y of [0.08, 0.32]) {
    put(new THREE.CylinderGeometry(0.292, 0.292, 0.045, 12), P.iron, [CX, y, CZ]);
    put(new THREE.CylinderGeometry(0.294, 0.294, 0.007, 12), P.ironLight, [CX, y + 0.0225, CZ]);
    for (let k = 0; k < 12; k++) {
      const a = 15 + k * 30;
      const ar = (a * Math.PI) / 180;
      put(new THREE.SphereGeometry(0.014, 6, 4), P.ironLight, [CX + Math.sin(ar) * 0.283, y - 0.002, CZ + Math.cos(ar) * 0.283]);
    }
  }

  // roots flaring on the floor
  for (let k = 0; k < 6; k++) {
    const a = 20 + k * 60 + (R() - 0.5) * 14;
    const ar = (a * Math.PI) / 180;
    const dx = Math.sin(ar);
    const dz = Math.cos(ar);
    b.extrude([[0, 0], [0.1, 0], [0.07, 0.035], [0, 0.14]], {
      at: [CX + dx * 0.245, 0, CZ + dz * 0.245], x: [dx, 0, dz], y: [0, 1, 0],
      thickness: 0.07, color: k % 2 ? P.woodDark : P.leather, bone: B,
    });
    if (k % 2 === 0)
      put(new THREE.SphereGeometry(0.034, 6, 4), MOSS, [CX + dx * 0.3, 0.055, CZ + dz * 0.3], { scale: [1, 0.4, 1] });
  }
  put(new THREE.SphereGeometry(0.05, 6, 4), MOSS, [CX + Math.sin(2.2) * 0.27, 0.36, CZ + Math.cos(2.2) * 0.27], { scale: [1, 0.5, 0.6], rotation: [0, 126, 0] });

  // ---------------------------------------------------------------- anvil body
  put(new THREE.BoxGeometry(0.38, 0.03, 0.26), P.iron, [CX, ST + 0.015, CZ]);          // base plate
  for (const sx of [-1, 1]) for (const sz of [-1, 1])                                    // corner pads
    put(new THREE.BoxGeometry(0.05, 0.034, 0.05), P.ironLight, [CX + sx * 0.17, ST + 0.017, CZ + sz * 0.11]);
  block(CX, ST + 0.03, CZ, 0.32, 0.21, 0.22, 0.15, 0.07, P.iron);                       // foot flare
  block(CX, ST + 0.1, CZ, 0.22, 0.15, 0.15, 0.11, 0.07, P.iron);                        // waist lower
  block(CX, ST + 0.17, CZ, 0.15, 0.11, 0.2, 0.15, 0.07, P.iron);                        // waist upper
  block(CX, 0.66, CZ, 0.3, 0.16, 0.46, 0.2, 0.08, P.iron);                              // body flare
  put(new THREE.BoxGeometry(0.46, 0.04, 0.21), P.plateLight, [CX, TOPY - 0.02, CZ]);    // steel face
  put(new THREE.BoxGeometry(0.07, 0.12, 0.17), P.iron, [CX - 0.265, 0.72, CZ]);         // heel
  put(new THREE.BoxGeometry(0.072, 0.008, 0.172), P.ironLight, [CX - 0.265, TOPY - 0.004, CZ]);

  // horn
  const hornScale = [0.85, 1, 1.25];
  put(new THREE.CylinderGeometry(0.018, 0.078, 0.13, 8), P.iron, [CX + 0.285, 0.714, CZ], { rotation: [0, 0, -90], scale: hornScale });
  put(new THREE.CylinderGeometry(0.068, 0.07, 0.012, 8), P.ironLight, [CX + 0.25, 0.716, CZ], { rotation: [0, 0, -90], scale: hornScale });
  put(new THREE.SphereGeometry(0.02, 6, 4), P.ironLight, [CX + 0.332, 0.728, CZ]);

  // edge highlights
  for (const sz of [-1, 1]) {
    put(new THREE.BoxGeometry(0.46, 0.004, 0.01), STEEL_EDGE, [CX, TOPY + 0.0005, CZ + sz * 0.1]);
    put(new THREE.BoxGeometry(0.44, 0.006, 0.004), P.ironLight, [CX, 0.725, CZ + sz * 0.0985]);
  }
  put(new THREE.BoxGeometry(0.01, 0.004, 0.2), STEEL_EDGE, [CX + 0.228, TOPY + 0.0005, CZ]);

  // tie-down straps over the base plate
  for (const sx of [-1, 1]) {
    put(new THREE.BoxGeometry(0.035, 0.012, 0.3), P.ironLight, [CX + sx * 0.14, ST + 0.036, CZ]);
    for (const sz of [-1, 1]) {
      put(new THREE.BoxGeometry(0.035, 0.06, 0.012), P.ironLight, [CX + sx * 0.14, ST + 0.012, CZ + sz * 0.147]);
      put(new THREE.SphereGeometry(0.01, 6, 4), P.iron, [CX + sx * 0.14, ST + 0.044, CZ + sz * 0.1]);
    }
  }

  // holes in the face
  put(new THREE.BoxGeometry(0.032, 0.003, 0.032), HOLE, [CX - 0.19, TOPY + 0.0006, CZ]);
  put(new THREE.CylinderGeometry(0.011, 0.011, 0.003, 8), HOLE, [CX + 0.17, TOPY + 0.0006, CZ + 0.06]);

  // hammer dents and scorch
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1;
    put(new THREE.CylinderGeometry(0.008 + R() * 0.006, 0.011 + R() * 0.006, 0.003, 6), SCORCH,
      [CX - 0.2 + R() * 0.4, TOPY + 0.0006, CZ + side * (0.05 + R() * 0.04)]);
  }

  // maker's mark on the +Z side (tilted to the sloped flank)
  const mY = 0.7;
  const mAt = [CX, mY, CZ + 0.088];
  const flank = [0, 1, 0.25];
  const hexo = (s: number) => [[0, 0.034 * s], [0.03 * s, 0.017 * s], [0.03 * s, -0.017 * s], [0, -0.034 * s], [-0.03 * s, -0.017 * s], [-0.03 * s, 0.017 * s]];
  b.extrude(hexo(1), { at: mAt, x: [1, 0, 0], y: flank, thickness: 0.012, color: P.gold, bone: B });
  b.extrude(hexo(0.78), { at: [mAt[0], mAt[1], mAt[2] + 0.002], x: [1, 0, 0], y: flank, thickness: 0.012, color: SCORCH, bone: B });
  b.extrude(
    [[-0.014, 0.012], [0.016, 0.012], [0.022, 0.006], [0.012, 0.004], [0.006, -0.004], [0.012, -0.012], [-0.012, -0.012], [-0.006, -0.004], [-0.012, 0.004]],
    { at: [mAt[0], mAt[1], mAt[2] + 0.004], x: [1, 0, 0], y: flank, thickness: 0.012, color: P.gold, bone: B },
  );

  // ---------------------------------------------------------------- glowing bar
  const yaw = 20;
  const ya = (yaw * Math.PI) / 180;
  const bx = 0.04;
  const bz = CZ - 0.02;
  const barAt = (lx: number, y: number) => [bx + lx * Math.cos(ya), y, bz - lx * Math.sin(ya)];
  const by = TOPY + 0.0185;
  const rot = [0, yaw, 0];

  glow(put(new THREE.CylinderGeometry(0.1, 0.1, 0.002, 8), P.ember, [bx, TOPY + 0.0015, bz], { rotation: rot, scale: [1.9, 1, 0.55] }), 0.45);
  glow(put(new THREE.CylinderGeometry(0.1, 0.1, 0.002, 8), P.hotYellow, [bx, TOPY + 0.0025, bz], { rotation: rot, scale: [1.4, 1, 0.3] }), 0.5);

  glow(put(new THREE.BoxGeometry(0.08, 0.032, 0.042), P.beard, barAt(-0.14, by), { rotation: rot }), 0.9);
  glow(put(new THREE.BoxGeometry(0.14, 0.032, 0.042), P.ember, barAt(-0.03, by), { rotation: rot }), 1.3);
  glow(put(new THREE.BoxGeometry(0.1, 0.032, 0.042), P.ember, barAt(0.09, by), { rotation: rot }), 1.5);
  glow(put(new THREE.BoxGeometry(0.03, 0.032, 0.042), P.hotYellow, barAt(0.165, by), { rotation: rot }), 1.6);
  glow(put(new THREE.BoxGeometry(0.22, 0.008, 0.02), P.hotYellow, barAt(0.03, by + 0.017), { rotation: rot }), 1.5);

  // ---------------------------------------------------------------- sparks
  for (let i = 0; i < 18; i++) {
    const near = i < 6;
    const s = 0.01 + R() * 0.012;
    const x = bx - 0.08 + R() * 0.32;
    const z = bz - 0.1 + R() * 0.2;
    const y = near ? TOPY + 0.05 + R() * 0.04 : TOPY + 0.08 + R() * 0.08;
    const col = i % 3 === 0 ? P.ember : P.hotYellow;
    if (i % 4 === 3)
      glow(put(new THREE.BoxGeometry(0.005, 0.005, 0.034), col, [x, y, z], { rotation: [R() * 90, R() * 360, R() * 90] }), 1.6);
    else
      glow(put(new THREE.BoxGeometry(s, s, s), col, [x, y, z], { rotation: [R() * 90, R() * 90, R() * 90] }), 1.6);
  }
  for (let i = 0; i < 4; i++)
    glow(put(new THREE.BoxGeometry(0.008, 0.008, 0.008), i % 2 ? P.ember : P.hotYellow,
      [bx - 0.05 + R() * 0.25, TOPY + 0.012, CZ + (i % 2 ? 0.07 : -0.09) + R() * 0.02], { rotation: [30, R() * 90, 20] }), 1.4);
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  type V = [number, number, number];

  // Own colours (max 6): beard glints, nose, socket shade.
  const GLINT = "#f09a45";
  const NOSE = "#cf8660";
  const SOCKET = "#8a5238";

  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    at: V,
    o: { bone?: any; scale?: V; rot?: V; dir?: V } = {},
  ) => {
    const opts: any = { bone: o.bone ?? J.head, at, flat: true };
    if (o.scale) opts.scale = o.scale;
    if (o.rot) opts.rotation = o.rot;
    if (o.dir) opts.dir = o.dir;
    return b.part(geo, color, opts);
  };
  const ell = (at: V, r: V, color: string, o: { bone?: any; rot?: V } = {}) =>
    put(new THREE.SphereGeometry(1, 8, 6), color, at, { ...o, scale: r });
  const oct = (rt: number, rb: number, h: number) => new THREE.CylinderGeometry(rt, rb, h, 8).rotateY(Math.PI / 8);
  const box = (at: V, size: V, color: string, o: { bone?: any; rot?: V } = {}) =>
    put(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, o);
  const cone = (base: V, dir: V, h: number, r: number, color: string, o: { bone?: any } = {}) => {
    const d = new THREE.Vector3(...dir).normalize();
    const c: V = [base[0] + (d.x * h) / 2, base[1] + (d.y * h) / 2, base[2] + (d.z * h) / 2];
    return put(new THREE.ConeGeometry(r, h, 6), color, c, { ...o, dir: [d.x, d.y, d.z] });
  };
  const ring = (at: V, R: number, tube: number, color: string, rot: V, o: { bone?: any } = {}) =>
    put(new THREE.TorusGeometry(R, tube, 5, 10), color, at, { ...o, rot });

  // ---------------------------------------------------------------- neck
  put(oct(0.105, 0.115, 0.14), P.skinShade, [0, 1.07, -0.115], { bone: J.neck, scale: [1, 1, 0.95] });

  // ---------------------------------------------------------------- skull (upper head)
  const HC: V = [0, 1.225, -0.1];
  put(oct(0.2, 0.2, 0.23), P.skin, HC, { scale: [1, 1, 0.95] });
  // cheekbones
  for (const s of [1, -1]) {
    ell([s * 0.115, 1.185, 0.05], [0.05, 0.032, 0.04], P.skin);
    ell([s * 0.075, 1.19, 0.07], [0.035, 0.02, 0.02], P.skinShade); // under-eye bag
  }

  // ---------------------------------------------------------------- lower jaw
  put(oct(0.19, 0.165, 0.07), P.skinShade, [0, 1.095, -0.1], { bone: J.jaw, scale: [1, 1, 0.95] });
  // mouth interior and a pair of teeth, hidden behind the moustache
  box([0, 1.128, 0.05], [0.11, 0.016, 0.05], P.eye, { bone: J.head });
  for (const s of [1, -1]) box([s * 0.025, 1.135, 0.065], [0.014, 0.018, 0.01], P.white, { bone: J.jaw });

  // ---------------------------------------------------------------- eyes
  for (const s of [1, -1]) {
    ell([s * 0.072, 1.222, 0.068], [0.037, 0.03, 0.025], SOCKET);
    ell([s * 0.072, 1.222, 0.082], [0.03, 0.024, 0.021], P.white);
    ell([s * 0.069, 1.222, 0.095], [0.014, 0.014, 0.014], P.eye);
    ell([s * 0.064, 1.229, 0.106], [0.005, 0.005, 0.004], P.white);
    // brow ridge (inner end lower for a stern look)
    box([s * 0.07, 1.262, 0.06], [0.11, 0.04, 0.075], P.skinShade, { rot: [0, 0, s * 14] });
    // bushy brow
    box([s * 0.072, 1.278, 0.085], [0.115, 0.034, 0.05], P.beard, { rot: [0, 0, s * 14] });
    box([s * 0.07, 1.286, 0.09], [0.08, 0.014, 0.035], GLINT, { rot: [0, 0, s * 14] });
    cone([s * 0.12, 1.285, 0.07], [s, 0.5, 0.3], 0.05, 0.014, P.beard);
    cone([s * 0.125, 1.272, 0.07], [s, -0.1, 0.4], 0.04, 0.012, P.beard);
    cone([s * 0.025, 1.29, 0.1], [-s * 0.3, 1, 0.4], 0.04, 0.012, P.beard);
  }

  // ---------------------------------------------------------------- nose
  box([0, 1.212, 0.085], [0.05, 0.09, 0.05], P.skin, { rot: [-15, 0, 0] });
  ell([0, 1.178, 0.115], [0.054, 0.046, 0.052], NOSE);
  for (const s of [1, -1]) {
    ell([s * 0.036, 1.165, 0.1], [0.024, 0.022, 0.024], NOSE);
    ell([s * 0.02, 1.15, 0.13], [0.009, 0.007, 0.009], P.eye);
  }
  ell([0, 1.2, 0.15], [0.016, 0.01, 0.012], "#e6a888"); // shine on the bulb

  // ---------------------------------------------------------------- ears
  for (const s of [1, -1]) {
    ell([s * 0.192, 1.215, -0.1], [0.026, 0.062, 0.046], P.skin);
    ell([s * 0.208, 1.215, -0.095], [0.012, 0.04, 0.03], P.skinShade);
    cone([s * 0.2, 1.245, -0.1], [s * 0.5, 1, -0.1], 0.06, 0.026, P.skin);
  }
  ring([0.21, 1.165, -0.1], 0.02, 0.004, P.gold, [0, 90, 0]); // earring, left ear
  ell([0.21, 1.14, -0.1], [0.008, 0.008, 0.008], P.gold);

  // ---------------------------------------------------------------- helmet band
  const bandY = 1.32;
  put(oct(0.215, 0.215, 0.04), P.plate, [0, bandY, -0.1], { scale: [1, 1, 0.95] });
  put(oct(0.2158, 0.2158, 0.008), P.plateLight, [0, bandY + 0.008, -0.1], { scale: [1, 1, 0.95] });
  put(oct(0.218, 0.218, 0.006), P.gold, [0, bandY - 0.02, -0.1], { scale: [1, 1, 0.95] });
  put(oct(0.218, 0.218, 0.006), P.gold, [0, bandY + 0.02, -0.1], { scale: [1, 1, 0.95] });
  const bandPt = (deg: number, d: number): V => {
    const a = (deg * Math.PI) / 180;
    return [Math.sin(a) * d, bandY, -0.1 + Math.cos(a) * d * 0.95];
  };
  for (const deg of [45, -45, 135, -135, 180]) {
    const p = bandPt(deg, 0.2);
    put(new THREE.SphereGeometry(0.011, 6, 4), P.gold, p);
  }
  for (const s of [1, -1]) {
    put(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 6), P.gold, [s * 0.2, bandY, -0.1], { dir: [s, 0, 0] });
    put(new THREE.SphereGeometry(0.009, 6, 4), P.plateLight, [s * 0.207, bandY, -0.1]);
  }
  // rune stud
  put(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 6), P.gold, [0, bandY, 0.0895], { dir: [0, 0, 1] });
  box([0, bandY, 0.0975], [0.005, 0.034, 0.004], P.iron);
  box([0.008, bandY + 0.006, 0.0975], [0.004, 0.02, 0.004], P.iron, { rot: [0, 0, -40] });
  box([-0.008, bandY - 0.006, 0.0975], [0.004, 0.02, 0.004], P.iron, { rot: [0, 0, 40] });

  // ---------------------------------------------------------------- hair
  put(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.hair, [0, 1.335, -0.1], {
    scale: [0.205, 0.08, 0.195],
  });
  ell([0, 1.215, -0.255], [0.19, 0.14, 0.06], P.hair);
  ell([0, 1.26, -0.275], [0.12, 0.05, 0.04], P.beard);
  // spiky tufts around the crown
  for (let i = 0; i < 7; i++) {
    const a = ((-100 + i * (200 / 6)) * Math.PI) / 180 + Math.PI; // spread over back and sides
    const ang = a;
    const base: V = [Math.sin(ang) * 0.17, 1.352, -0.1 + Math.cos(ang) * 0.16];
    cone(base, [Math.sin(ang) * 0.8, 0.6, Math.cos(ang) * 0.8], 0.06, 0.03, i % 2 ? P.beard : P.hair);
  }
  // locks falling behind the ears
  for (const s of [1, -1]) {
    cone([s * 0.15, 1.15, -0.2], [s * 0.15, -1, -0.45], 0.14, 0.04, P.hair);
    cone([s * 0.11, 1.15, -0.24], [s * 0.1, -1, -0.5], 0.11, 0.032, P.beard);
  }
  // topknot with gold tie, tail flopping back
  ell([0, 1.384, -0.13], [0.036, 0.034, 0.036], P.hair);
  ring([0, 1.368, -0.13], 0.033, 0.006, P.gold, [90, 0, 0]);
  cone([0, 1.388, -0.15], [0, 0.25, -1], 0.11, 0.03, P.hair);
  cone([0.012, 1.386, -0.15], [0.35, 0.15, -1], 0.09, 0.022, P.beard);
  cone([-0.012, 1.386, -0.15], [-0.35, 0.15, -1], 0.09, 0.022, P.beard);

  // ---------------------------------------------------------------- beard (on the jaw bone so it follows the mouth)
  // solid base silhouette
  ell([0, 1.075, 0.03], [0.165, 0.07, 0.115], P.beard, { bone: J.jaw });
  ell([0, 1.02, 0.095], [0.13, 0.1, 0.05], P.beard, { bone: J.jaw });
  // sideburns from the ears down to the chin
  for (const s of [1, -1]) {
    ell([s * 0.175, 1.16, -0.03], [0.036, 0.085, 0.1], P.beard, { bone: J.head });
    ell([s * 0.182, 1.185, -0.05], [0.026, 0.05, 0.07], GLINT, { bone: J.head });
    ell([s * 0.165, 1.115, 0.02], [0.04, 0.05, 0.07], P.beard, { bone: J.jaw });
  }

  const blade = (
    x: number,
    topY: number,
    z: number,
    w: number,
    h: number,
    color: string,
    streak: string,
    lean: number,
  ) => {
    const a = -Math.sign(x) * 0.24 * (Math.abs(x) / 0.15);
    const X = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const Y = new THREE.Vector3(-Math.sin(a) * Math.cos(lean), Math.cos(a) * Math.cos(lean), Math.sin(lean));
    const N = new THREE.Vector3().crossVectors(X, Y).normalize();
    const outline: any = [
      [-w / 2, 0],
      [w / 2, 0],
      [w * 0.46, -h * 0.55],
      [0, -h, "sharp"],
      [-w * 0.46, -h * 0.55],
    ];
    b.extrude(outline, {
      at: [x, topY, z],
      x: [X.x, X.y, X.z],
      y: [Y.x, Y.y, Y.z],
      thickness: 0.028,
      bevel: 0.006,
      color,
      bone: J.jaw,
    });
    const hl: any = [
      [-w * 0.13, -h * 0.06],
      [w * 0.13, -h * 0.06],
      [w * 0.05, -h * 0.55],
      [0, -h * 0.8, "sharp"],
      [-w * 0.05, -h * 0.55],
    ];
    b.extrude(hl, {
      at: [x + N.x * 0.016, topY + N.y * 0.016, z + N.z * 0.016],
      x: [X.x, X.y, X.z],
      y: [Y.x, Y.y, Y.z],
      thickness: 0.012,
      color: streak,
      bone: J.jaw,
    });
  };
  // back to front: dark roots, light fronts
  for (const x of [-0.15, -0.075, 0, 0.075, 0.15]) blade(x, 1.14, 0.055, 0.1, 0.19, P.beard, GLINT, -0.4);
  for (const x of [-0.115, -0.038, 0.038, 0.115]) blade(x, 1.13, 0.075, 0.085, 0.2, P.beard, P.beardLight, -0.38);
  for (const x of [-0.15, -0.075, 0, 0.075, 0.15].slice(1, 4).concat([-0.14, 0.14]))
    blade(x, 1.11, 0.09, 0.08, 0.17, P.beardLight, GLINT, -0.33);
  for (const x of [-0.05, 0.05, 0]) blade(x, 1.09, 0.105, 0.07, 0.15, P.beardLight, "#ffd9a0", -0.3);

  // two braids with gold rings and tips
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const y = 1.0 - i * 0.03;
      const r = 0.037 - i * 0.002;
      ell(
        [s * 0.06, y, 0.15],
        [r, 0.026, r * 0.9],
        i % 2 ? P.beard : P.beardLight,
        { bone: J.jaw, rot: [0, 0, (i % 2 ? 1 : -1) * 28] },
      );
    }
    ring([s * 0.06, 0.988, 0.15], 0.035, 0.007, P.gold, [90, 0, 0], { bone: J.jaw });
    ring([s * 0.06, 0.9, 0.15], 0.03, 0.007, P.gold, [90, 0, 0], { bone: J.jaw });
    cone([s * 0.06, 0.9, 0.15], [0, -1, 0], 0.05, 0.027, P.gold, { bone: J.jaw });
  }

  // ---------------------------------------------------------------- moustache with curled ends
  for (const s of [1, -1]) {
    const pts: V[] = [
      [s * 0.012, 1.135, 0.108],
      [s * 0.07, 1.125, 0.1],
      [s * 0.125, 1.133, 0.07],
      [s * 0.162, 1.162, 0.03],
      [s * 0.17, 1.2, 0.0],
    ];
    b.sweep(catmull(pts), [0.036, 0.012], { color: P.beard, bone: J.head });
    const hi: V[] = pts.slice(0, 4).map((p) => [p[0], p[1] + 0.014, p[2] + 0.014] as V);
    b.sweep(catmull(hi), [0.018, 0.008], { color: GLINT, bone: J.head });
    ring([s * 0.158, 1.158, 0.036], 0.019, 0.004, P.gold, [60, s * 40, 0], { bone: J.head });
  }
}
```

<!-- call: forge -->

```ts
import * as THREE from "three";
import { aim, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildForge({ b, J, P }: Ctx) {
  type V = [number, number, number];
  const D = Math.PI / 180;
  const R = rng(21);

  // own colours (5)
  const COAL = "#2a1c16";
  const WATER = "#3f86c4";
  const STONE_LT = "#8a847c";
  const FLAME = "#ff4a10";
  const ASH = "#9a928a";

  // ---- merged-geometry collector: one part per colour (and glow strength) ----
  const groups = new Map<string, { color: string; glow: number; geos: THREE.BufferGeometry[] }>();
  function add(color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4, gl = 0) {
    geo.applyMatrix4(m);
    const g = geo.index ? geo.toNonIndexed() : geo;
    const key = color + "|" + gl;
    let e = groups.get(key);
    if (!e) {
      e = { color, glow: gl, geos: [] };
      groups.set(key, e);
    }
    e.geos.push(g);
  }
  function put(color: string, geo: THREE.BufferGeometry, pos: V, rot: V = [0, 0, 0], scl: V = [1, 1, 1], gl = 0) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D));
    add(color, geo, new THREE.Matrix4().compose(new THREE.Vector3(...pos), q, new THREE.Vector3(...scl)), gl);
  }
  const bx = (color: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, rot: V = [0, 0, 0], gl = 0) =>
    put(color, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], rot, [1, 1, 1], gl);
  function rod(color: string, a: V, c: V, r: number, sides = 6, gl = 0) {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const dir = B.clone().sub(A);
    const q = aim(dir);
    add(
      color,
      new THREE.CylinderGeometry(r, r, dir.length(), sides),
      new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)),
      gl,
    );
  }
  const ball = (color: string, p: V, r: number, gl = 0) => put(color, new THREE.IcosahedronGeometry(r, 0), p, [R() * 90, R() * 90, 0], [1, 1, 1], gl);

  // ---- rough stone wall made of staggered blocks ----
  const STONES = [P.stone, P.stoneDark, STONE_LT, P.stone];
  function wall(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, along: "x" | "z", ch: number) {
    const rows = Math.max(1, Math.round((y1 - y0) / ch));
    const h = (y1 - y0) / rows;
    const L = along === "x" ? x1 - x0 : z1 - z0;
    const T = along === "x" ? z1 - z0 : x1 - x0;
    const n = Math.max(1, Math.round(L / 0.13));
    for (let row = 0; row < rows; row++) {
      const cuts = [0];
      if (n > 1) {
        if (row % 2) for (let i = 0; i < n; i++) cuts.push((i + 0.5) / n);
        else for (let i = 1; i < n; i++) cuts.push(i / n);
      }
      cuts.push(1);
      for (let i = 0; i < cuts.length - 1; i++) {
        const a = cuts[i];
        const c = cuts[i + 1];
        const len = (c - a) * L - 0.006;
        const sh = h - 0.006 + (R() - 0.5) * 0.008;
        const st = T + (R() - 0.5) * 0.014;
        const m = a + (c - a) / 2;
        const px = along === "x" ? x0 + m * L : (x0 + x1) / 2;
        const pz = along === "z" ? z0 + m * L : (z0 + z1) / 2;
        const py = y0 + row * h + h / 2;
        const geo = along === "x" ? new THREE.BoxGeometry(len, sh, st) : new THREE.BoxGeometry(st, sh, len);
        put(STONES[Math.floor(R() * 4)], geo, [px, py, pz], [(R() - 0.5) * 2, (R() - 0.5) * 6, (R() - 0.5) * 2]);
      }
    }
  }

  // ================= HEARTH =================
  const CX = 0.725;
  const CZ = -0.55;
  bx(P.stoneDark, 0.5, 0.95, 0, 0.06, -0.75, -0.36); // plinth
  wall(0.52, 0.93, 0.06, 1.02, -0.74, -0.66, "x", 0.12); // back wall
  wall(0.52, 0.6, 0.06, 0.62, -0.66, -0.36, "z", 0.11); // left wall
  wall(0.85, 0.93, 0.06, 0.62, -0.66, -0.36, "z", 0.11); // right wall
  wall(0.6, 0.66, 0.06, 0.62, -0.44, -0.36, "x", 0.11); // front flanks
  wall(0.79, 0.85, 0.06, 0.62, -0.44, -0.36, "x", 0.11);
  wall(0.66, 0.79, 0.28, 0.62, -0.44, -0.36, "x", 0.11); // above ash door
  wall(0.52, 0.62, 0.62, 1.02, -0.46, -0.36, "x", 0.1); // pillars
  wall(0.83, 0.93, 0.62, 1.02, -0.46, -0.36, "x", 0.1);

  // mantle + gold studs
  bx(STONE_LT, 0.5, 0.95, 1.02, 1.07, -0.75, -0.33);
  for (let k = 0; k < 6; k++) bx(P.gold, 0.535 + k * 0.073 - 0.007, 0.535 + k * 0.073 + 0.007, 1.038, 1.052, -0.336, -0.322);

  // ash door: glowing opening with iron frame and bars
  bx(P.ember, 0.665, 0.785, 0.08, 0.27, -0.445, -0.435, [0, 0, 0], 1.2);
  bx(P.hotYellow, 0.69, 0.76, 0.1, 0.2, -0.436, -0.431, [0, 0, 0], 1.5);
  bx(P.ironLight, 0.645, 0.665, 0.06, 0.315, -0.375, -0.352);
  bx(P.ironLight, 0.785, 0.805, 0.06, 0.315, -0.375, -0.352);
  bx(P.iron, 0.64, 0.81, 0.275, 0.315, -0.378, -0.352);
  for (const x of [0.69, 0.725, 0.76]) bx(P.ironLight, x - 0.006, x + 0.006, 0.07, 0.28, -0.412, -0.398);

  // fire pit: dark fill, glowing bed, soot, grate
  bx(COAL, 0.6, 0.85, 0.06, 0.5, -0.66, -0.44);
  bx(P.ember, 0.61, 0.84, 0.5, 0.55, -0.65, -0.45, [0, 0, 0], 1.1);
  bx(COAL, 0.63, 0.82, 0.55, 0.8, -0.651, -0.645);
  bx(COAL, 0.68, 0.77, 0.8, 0.97, -0.651, -0.645);
  for (const x of [0.64, 0.69, 0.74, 0.79, 0.835]) bx(P.iron, x - 0.006, x + 0.006, 0.568, 0.58, -0.65, -0.45);
  bx(P.ironLight, 0.6, 0.85, 0.566, 0.582, -0.65, -0.635);
  bx(P.ironLight, 0.6, 0.85, 0.566, 0.582, -0.465, -0.45);

  // coal lumps
  for (let i = 0; i < 20; i++) {
    const x = 0.625 + R() * 0.205;
    const z = -0.64 + R() * 0.18;
    const d = Math.hypot(x - CX, (z - CZ) * 1.2);
    const rad = 0.022 + R() * 0.02;
    const y = 0.55 + rad * 0.5 + R() * 0.015;
    let col = COAL;
    let gl = 0;
    if (d < 0.055) {
      col = P.hotYellow;
      gl = 1.4;
    } else if (R() < 0.62) {
      col = P.ember;
      gl = 1.2;
    }
    put(col, new THREE.IcosahedronGeometry(rad, 0), [x, y, z], [R() * 180, R() * 180, R() * 180], [1 + R() * 0.4, 0.7 + R() * 0.3, 1 + R() * 0.4], gl);
  }

  // flames: outer red, mid ember, hot core
  const flames: [number, number, number, number][] = [
    [0.7, -0.56, 0.17, 6],
    [0.76, -0.52, 0.14, -8],
    [0.67, -0.5, 0.11, 10],
    [0.78, -0.6, 0.12, -6],
    [0.73, -0.47, 0.09, 4],
  ];
  flames.forEach(([x, z, h, tilt], i) => {
    const y0 = 0.6;
    const ry = i * 40;
    put(FLAME, new THREE.ConeGeometry(0.032, h, 5), [x, y0 + h / 2, z], [tilt, ry, -tilt], [1, 1, 1], 1.1);
    put(P.ember, new THREE.ConeGeometry(0.024, h * 0.78, 5), [x, y0 + h * 0.39, z], [tilt, ry + 20, -tilt], [1, 1, 1], 1.3);
    put(P.hotYellow, new THREE.ConeGeometry(0.014, h * 0.5, 5), [x, y0 + h * 0.25, z], [tilt * 0.5, ry, -tilt * 0.5], [1, 1, 1], 1.5);
  });
  // sparks
  for (let i = 0; i < 8; i++) {
    const s = 0.008 + R() * 0.008;
    put(i % 2 ? P.hotYellow : P.ember, new THREE.BoxGeometry(s, s, s), [0.64 + R() * 0.17, 0.78 + R() * 0.24, -0.62 + R() * 0.14], [R() * 90, R() * 90, R() * 90], [1, 1, 1], 1.5);
  }

  // ================= HOOD & CHIMNEY =================
  const HB = 1.07;
  const HH = 0.34;
  const RB = 0.283;
  const RT = 0.12;
  const hoodGeo = (rt: number, rb: number, h: number) => new THREE.CylinderGeometry(rt, rb, h, 4, 1).rotateY(Math.PI / 4);
  put(P.stone, hoodGeo(RT, RB, HH), [CX, HB + HH / 2, -0.54], [0, 0, 0], [1, 1, 0.95]);
  const rAt = (t: number) => RB - (RB - RT) * t;
  for (const t of [0.03, 0.55, 0.9]) {
    const rr = rAt(t) + 0.008;
    put(P.iron, hoodGeo(rr, rr, 0.035), [CX, HB + HH * t, -0.54], [0, 0, 0], [1, 1, 0.95]);
  }
  // band rivets on the front
  const bandHalf = (rAt(0.55) + 0.008) / Math.SQRT2;
  for (let k = -2; k <= 2; k++) ball(P.ironLight, [CX + k * 0.065, HB + HH * 0.55, -0.54 + bandHalf * 0.95 + 0.004], 0.009);
  // chimney
  bx(P.stoneDark, 0.65, 0.8, 1.41, 1.47, -0.615, -0.465);
  bx(STONE_LT, 0.6, 0.85, 1.47, 1.5, -0.665, -0.415);
  bx(COAL, 0.67, 0.78, 1.499, 1.503, -0.595, -0.485);

  // gold emblem with dark rune on the hood front
  const hoodSlope = Math.atan((RB - RT) / Math.SQRT2 / HH) * (180 / Math.PI) * 0.95;
  const sl = hoodSlope * D;
  const eY = 1.15;
  const eT = (eY - HB) / HH;
  const surfZ = -0.54 + (rAt(eT) / Math.SQRT2) * 0.95;
  const face = (u: number, v: number, off: number): V => [
    CX + u,
    eY + v * Math.cos(sl) + off * Math.sin(sl),
    surfZ - v * Math.sin(sl) + off * Math.cos(sl),
  ];
  put(P.gold, new THREE.CylinderGeometry(0.042, 0.042, 0.012, 6), face(0, 0, 0.004), [90 - hoodSlope, 0, 0]);
  bx(P.iron, -0.004, 0.004, -0.03, 0.03, -0.003, 0.003); // placeholder no-op size guard (cheap)
  put(P.iron, new THREE.BoxGeometry(0.008, 0.06, 0.005), face(0, 0, 0.011), [-hoodSlope, 0, 0]);
  put(P.iron, new THREE.BoxGeometry(0.008, 0.036, 0.005), face(0.012, 0.014, 0.011), [-hoodSlope, 0, -45]);
  put(P.iron, new THREE.BoxGeometry(0.008, 0.036, 0.005), face(0.012, -0.006, 0.011), [-hoodSlope, 0, -45]);

  // ================= BELLOWS =================
  const bx0 = 0.5; // hinge / nozzle end
  for (const x of [0.345, 0.485])
    for (const z of [-0.625, -0.475]) bx(P.woodDark, x - 0.0175, x + 0.0175, 0, 0.5, z - 0.0175, z + 0.0175);
  for (const z of [-0.625, -0.475]) bx(P.woodDark, 0.345, 0.485, 0.1, 0.13, z - 0.012, z + 0.012);
  for (const x of [0.345, 0.485]) bx(P.woodDark, x - 0.012, x + 0.012, 0.1, 0.13, -0.625, -0.475);
  bx(P.wood, 0.335, 0.5, 0.5, 0.53, -0.64, -0.46); // bottom board
  const ang = 20;
  const ca = Math.cos(ang * D);
  const sa = Math.sin(ang * D);
  put(P.wood, new THREE.BoxGeometry(0.17, 0.028, 0.18), [bx0 - 0.085 * ca, 0.535 + 0.085 * sa + 0.014, -0.55], [0, 0, -ang]); // top board
  [0.2, 0.45, 0.7, 0.92].forEach((f, i) => {
    const x = bx0 - 0.17 * f * ca;
    const under = 0.535 + (bx0 - x) * Math.tan(ang * D);
    const h = under - 0.53 + 0.004;
    put(i % 2 ? P.leatherDark : P.leather, new THREE.BoxGeometry(0.034, h, 0.17), [x, 0.53 + h / 2 - 0.002, -0.55]);
  });
  put(P.iron, new THREE.BoxGeometry(0.02, 0.034, 0.19), [bx0 - 0.17 * 0.6 * ca, 0.535 + 0.17 * 0.6 * sa + 0.014, -0.55], [0, 0, -ang]);
  bx(P.iron, 0.4, 0.42, 0.497, 0.532, -0.645, -0.455);
  bx(P.iron, 0.49, 0.505, 0.5, 0.57, -0.645, -0.455); // hinge strap
  // handle
  rod(P.wood, [0.345, 0.6, -0.55], [0.345, 0.76, -0.55], 0.012);
  rod(P.wood, [0.345, 0.76, -0.6], [0.345, 0.76, -0.5], 0.014);
  ball(P.woodDark, [0.345, 0.76, -0.605], 0.022);
  ball(P.woodDark, [0.345, 0.76, -0.495], 0.022);
  // nozzle pipe into the wall
  rod(P.iron, [0.497, 0.54, -0.55], [0.69, 0.562, -0.55], 0.02, 8);
  rod(P.gold, [0.503, 0.541, -0.55], [0.518, 0.543, -0.55], 0.027, 8);

  // ================= BUCKET =================
  const BX = 0.8;
  const BZ = -0.275;
  put(P.wood, new THREE.CylinderGeometry(0.07, 0.058, 0.17, 10), [BX, 0.085, BZ]);
  for (const y of [0.04, 0.13]) {
    const rr = 0.058 + (0.012 * y) / 0.17 + 0.004;
    put(P.iron, new THREE.CylinderGeometry(rr, rr, 0.018, 10), [BX, y, BZ]);
  }
  put(WATER, new THREE.CylinderGeometry(0.063, 0.063, 0.008, 10), [BX, 0.172, BZ]);
  put(P.plateLight, new THREE.BoxGeometry(0.02, 0.003, 0.012), [BX + 0.02, 0.178, BZ + 0.01], [0, 30, 0]);
  put(P.iron, new THREE.TorusGeometry(0.068, 0.005, 4, 10, Math.PI), [BX, 0.17, BZ]);

  // ================= POKER =================
  rod(P.iron, [0.91, 0.01, -0.27], [0.915, 0.8, -0.375], 0.009, 6);
  put(P.gold, new THREE.TorusGeometry(0.02, 0.005, 4, 8), [0.915, 0.82, -0.375], [90, 0, 0]);

  // ================= TOOL RACK =================
  bx(P.woodDark, 0.315, 0.355, 0, 1.4, -0.725, -0.685); // posts
  bx(P.woodDark, 0.455, 0.495, 0, 1.4, -0.725, -0.685);
  bx(P.woodDark, 0.31, 0.5, 1.36, 1.4, -0.73, -0.68); // cap beam
  bx(P.wood, 0.31, 0.497, 1.26, 1.31, -0.715, -0.675); // tong bar
  bx(P.wood, 0.31, 0.497, 0.7, 0.73, -0.725, -0.63); // shelf
  bx(P.woodDark, 0.33, 0.46, 0.73, 0.78, -0.7, -0.65); // chisel block
  rod(P.woodDark, [0.335, 0.72, -0.7], [0.395, 1.2, -0.7], 0.01, 5); // brace (hidden-ish)
  for (const cx of [0.35, 0.378, 0.406, 0.434]) {
    rod(P.ironLight, [cx, 0.79, -0.675], [cx, 0.87, -0.675], 0.007, 5);
    rod(P.iron, [cx, 0.865, -0.675], [cx, 0.885, -0.675], 0.012, 5);
    rod(P.wood, [cx, 0.885, -0.675], [cx, 0.95, -0.675], 0.014, 5);
  }
  // peg + hanging tongs
  const tx = 0.405;
  rod(P.iron, [tx, 1.27, -0.675], [tx, 1.27, -0.64], 0.008, 5);
  const zA = -0.655;
  rod(P.iron, [tx - 0.035, 1.285, zA], [tx + 0.03, 0.99, zA], 0.01, 5);
  rod(P.iron, [tx + 0.035, 1.285, zA - 0.014], [tx - 0.03, 0.99, zA - 0.014], 0.01, 5);
  rod(P.leather, [tx - 0.035, 1.285, zA], [tx - 0.0235, 1.234, zA], 0.015, 5);
  rod(P.leather, [tx + 0.035, 1.285, zA - 0.014], [tx + 0.0235, 1.234, zA - 0.014], 0.015, 5);
  ball(P.gold, [tx, 1.1, zA - 0.007], 0.014);
  bx(P.ironLight, tx + 0.02, tx + 0.04, 0.96, 0.995, zA - 0.006, zA + 0.006);
  bx(P.ironLight, tx - 0.04, tx - 0.02, 0.96, 0.995, zA - 0.02, zA - 0.008);
  // leaning charcoal/ash chunks at rack foot
  for (let i = 0; i < 4; i++) put(i % 2 ? COAL : ASH, new THREE.IcosahedronGeometry(0.025 + R() * 0.015, 0), [0.36 + R() * 0.12, 0.03, -0.66 + R() * 0.05], [R() * 90, R() * 90, 0], [1, 0.7, 1]);

  // ---- flush merged groups ----
  for (const g of groups.values()) {
    const merged = mergeGeometries(g.geos, false);
    if (!merged) continue;
    const part = b.part(merged, g.color, { bone: J.hips, at: [0, 0, 0], flat: true });
    if (g.glow > 0) glow(part, g.glow);
  }
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { polyline, rng } from "agentic-3js-builder";

export function buildBody({ b, J, P, M }: any) {
  void M;
  const R = rng(11);

  // ---- own colours (4) ----
  const TROUSER = "#5a4a3e";
  const SOOT = "#2a2321";
  const STITCH = "#d8c49a";
  const CLOTH_D = "#2c3d70";

  type V = number[];
  type X = Record<string, any>;

  // ---- helpers ----
  const part = (g: THREE.BufferGeometry, color: string, at: V, bone: any, extra: X = {}) =>
    b.part(g, color, { bone, at, ...extra });
  const box = (w: number, h: number, d: number, color: string, at: V, bone: any, extra: X = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, bone, extra);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: V, bone: any, extra: X = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, bone, { flat: true, ...extra });
  const ball = (r: number, color: string, at: V, bone: any, extra: X = {}) =>
    part(new THREE.SphereGeometry(r, 6, 5), color, at, bone, { flat: true, ...extra });
  const torus = (Rr: number, t: number, color: string, at: V, bone: any, extra: X = {}) =>
    part(new THREE.TorusGeometry(Rr, t, 4, 12), color, at, bone, { flat: true, rotation: [90, 0, 0], ...extra });
  const blob = (sx: number, sy: number, sz: number, color: string, at: V, bone: any, seg = 8) =>
    part(new THREE.SphereGeometry(1, seg, 6), color, at, bone, { flat: true, scale: [sx, sy, sz] });

  // ---- torso profile: [y, halfWidthX, halfDepthZ] ----
  const PROF: [number, number, number][] = [
    [0.46, 0.215, 0.175],
    [0.56, 0.235, 0.195],
    [0.68, 0.265, 0.215],
    [0.8, 0.285, 0.21],
    [0.92, 0.29, 0.19],
    [1.03, 0.17, 0.12],
  ];
  const prof = (y: number): [number, number] => {
    const c = Math.min(Math.max(y, PROF[0][0]), PROF[PROF.length - 1][0]);
    for (let i = 0; i < PROF.length - 1; i++) {
      const p0 = PROF[i];
      const p1 = PROF[i + 1];
      if (c <= p1[0]) {
        const t = (c - p0[0]) / (p1[0] - p0[0]);
        return [p0[1] + (p1[1] - p0[1]) * t, p0[2] + (p1[2] - p0[2]) * t];
      }
    }
    const l = PROF[PROF.length - 1];
    return [l[1], l[2]];
  };
  const Y0 = 0.46;
  const Y1 = 1.03;

  // ================= TORSO (shirt) =================
  b.sweep(polyline([[0, Y0, -0.15], [0, Y1, -0.15]]), (t: number) => prof(Y0 + t * (Y1 - Y0)), {
    bone: [J.hips, J.chest],
    color: P.cloth,
    sides: 12,
    smooth: false,
    caps: "flat",
  });
  // shoulder yokes fill the gap under the pauldrons
  for (const s of [1, -1]) {
    blob(0.1, 0.085, 0.095, P.cloth, [s * 0.255, 0.96, -0.15], J.chest);
    // side wrinkles of the shirt
    for (const y of [0.7, 0.78, 0.86]) {
      const [rx] = prof(y);
      box(0.014, 0.012, 0.1, CLOTH_D, [s * (rx + 0.003), y, -0.15], J.chest);
    }
  }
  // blousing over the belt
  cyl(0.272, 0.274, 0.055, 12, P.cloth, [0, 0.62, -0.15], J.hips, { scale: [1, 1, 0.78] });

  // ================= HIPS =================
  cyl(0.215, 0.2, 0.2, 10, TROUSER, [0, 0.47, -0.15], J.hips, { scale: [1, 1, 0.82] });

  // ================= LEGS & BOOTS =================
  for (const s of [1, -1]) {
    const x = s * 0.14;
    const hb = s > 0 ? J.hipL : J.hipR;
    const kb = s > 0 ? J.kneeL : J.kneeR;
    b.sweep(polyline([[x, 0.5, -0.15], [x, 0.25, -0.13], [x, 0.14, -0.12]]), [0.125, 0.115, 0.1], {
      bone: [hb, kb],
      color: TROUSER,
      sides: 8,
      smooth: false,
      caps: "flat",
    });
    // knee patch with stitches
    box(0.13, 0.1, 0.03, P.leather, [x, 0.38, -0.014], kb);
    for (const dx of [-0.045, -0.015, 0.015, 0.045]) box(0.012, 0.006, 0.004, STITCH, [x + dx, 0.425, 0.003], kb);

    // boot
    box(0.23, 0.035, 0.38, SOOT, [x, 0.0175, -0.03], kb); // sole
    box(0.215, 0.022, 0.36, P.leatherDark, [x, 0.046, -0.035], kb); // welt
    box(0.2, 0.1, 0.3, P.leather, [x, 0.095, -0.07], kb); // upper
    blob(0.1, 0.082, 0.105, P.leather, [x, 0.09, 0.055], kb); // toe
    blob(0.072, 0.028, 0.065, P.ironLight, [x, 0.166, 0.062], kb, 6); // steel toe plate
    cyl(0.1, 0.105, 0.18, 8, P.leather, [x, 0.2, -0.13], kb); // shaft
    cyl(0.125, 0.115, 0.065, 8, P.wood, [x, 0.28, -0.13], kb); // folded cuff
    cyl(0.1, 0.1, 0.005, 8, P.leatherDark, [x, 0.311, -0.13], kb); // dark boot mouth
    torus(0.127, 0.005, STITCH, [x, 0.305, -0.13], kb);
    torus(0.117, 0.005, STITCH, [x, 0.255, -0.13], kb);
    // shaft strap + gold buckle
    torus(0.106, 0.012, P.leatherDark, [x, 0.19, -0.13], kb);
    box(0.052, 0.05, 0.016, P.gold, [x, 0.19, -0.13 + 0.11], kb);
    box(0.03, 0.03, 0.02, P.iron, [x, 0.19, -0.13 + 0.112], kb);
    box(0.008, 0.044, 0.024, P.gold, [x, 0.19, -0.13 + 0.114], kb);
    // instep strap + buckle
    box(0.205, 0.014, 0.06, P.leatherDark, [x, 0.147, 0.0], kb);
    box(0.05, 0.012, 0.045, P.gold, [x, 0.157, 0.0], kb);
    box(0.03, 0.014, 0.025, P.iron, [x, 0.159, 0.0], kb);
    // mud splatter
    for (let i = 0; i < 2; i++) {
      blob(0.03 + R() * 0.015, 0.012, 0.025, P.woodDark, [x + s * (0.07 + R() * 0.03), 0.045 + R() * 0.03, -0.12 + R() * 0.2], kb, 5);
    }
  }

  // ================= BELT =================
  const BR = 0.262;
  cyl(BR, BR, 0.08, 14, P.leatherDark, [0, 0.56, -0.15], J.hips, { scale: [1, 1, 0.84] });
  cyl(BR + 0.002, BR + 0.002, 0.007, 14, STITCH, [0, 0.592, -0.15], J.hips, { scale: [1, 1, 0.84] });
  cyl(BR + 0.002, BR + 0.002, 0.007, 14, STITCH, [0, 0.528, -0.15], J.hips, { scale: [1, 1, 0.84] });

  const belted = (deg: number, off: number) => {
    const a = (deg * Math.PI) / 180;
    const r = BR + off;
    return {
      x: r * Math.sin(a),
      z: -0.15 + 0.84 * r * Math.cos(a),
      yaw: (Math.atan2(Math.sin(a), 0.84 * Math.cos(a)) * 180) / Math.PI,
    };
  };
  type Pl = { x: number; z: number; yaw: number };
  const place = (o: Pl, lx: number, ly: number, lz: number, y: number): V => {
    const a = (o.yaw * Math.PI) / 180;
    return [o.x + lx * Math.cos(a) + lz * Math.sin(a), y + ly, o.z - lx * Math.sin(a) + lz * Math.cos(a)];
  };
  const tool = (w: number, h: number, d: number, color: string, o: Pl, lx: number, ly: number, lz: number, extra: X = {}) =>
    box(w, h, d, color, place(o, lx, ly, lz, 0.56), J.hips, { rotation: [0, o.yaw, 0], ...extra });

  // studs
  for (const deg of [-130, -112, -34, -20, 20, 34, 112, 130]) {
    const o = belted(deg, 0.003);
    ball(0.011, P.gold, [o.x, 0.56, o.z], J.hips);
  }
  // big gold buckle
  const fz = -0.15 + 0.84 * BR;
  box(0.125, 0.095, 0.02, P.gold, [0, 0.56, fz + 0.008], J.hips);
  box(0.08, 0.052, 0.022, P.iron, [0, 0.56, fz + 0.01], J.hips);
  box(0.016, 0.06, 0.026, P.gold, [0, 0.56, fz + 0.013], J.hips);
  for (const sx of [1, -1])
    for (const sy of [1, -1]) ball(0.007, P.ironLight, [sx * 0.05, 0.56 + sy * 0.036, fz + 0.019], J.hips);
  // belt tail
  {
    const o = belted(21, 0.012);
    box(0.05, 0.11, 0.012, P.leatherDark, [o.x, 0.5, o.z], J.hips, { rotation: [0, o.yaw, 0] });
    box(0.052, 0.014, 0.014, P.gold, [o.x + 0, 0.447, o.z], J.hips, { rotation: [0, o.yaw, 0] });
  }

  // pouch (left hip)
  {
    const o = belted(62, 0);
    tool(0.11, 0.12, 0.06, P.leather, o, 0, -0.09, 0.04);
    tool(0.116, 0.05, 0.068, P.wood, o, 0, -0.045, 0.044);
    ball(0.012, P.gold, place(o, 0, -0.068, 0.082, 0.56), J.hips);
    tool(0.12, 0.012, 0.064, STITCH, o, 0, -0.152, 0.04, {});
  }
  // small hammer (right hip)
  {
    const o = belted(-58, 0);
    tool(0.03, 0.1, 0.01, P.leatherDark, o, 0, -0.03, 0.008);
    tool(0.024, 0.2, 0.024, P.wood, o, 0, -0.11, 0.03);
    tool(0.028, 0.07, 0.028, P.leatherDark, o, 0, -0.12, 0.03);
    tool(0.1, 0.05, 0.05, P.iron, o, 0, -0.225, 0.03);
    tool(0.012, 0.054, 0.054, P.ironLight, o, -0.056, -0.225, 0.03);
    tool(0.012, 0.054, 0.054, P.ironLight, o, 0.056, -0.225, 0.03);
    tool(0.016, 0.054, 0.054, P.gold, o, 0.0, -0.225, 0.03);
  }
  // key ring + keys (back right)
  {
    const o = belted(-135, 0.004);
    part(new THREE.TorusGeometry(0.024, 0.004, 4, 10), P.iron, place(o, 0, -0.04, 0.01, 0.56), J.hips, { flat: true, rotation: [0, o.yaw, 0] });
    tool(0.012, 0.05, 0.006, P.ironLight, o, -0.01, -0.09, 0.012);
    tool(0.012, 0.04, 0.006, P.gold, o, 0.012, -0.085, 0.012);
  }
  // rag tucked in belt (back left)
  {
    const o = belted(150, 0.006);
    tool(0.09, 0.15, 0.012, P.white, o, 0, -0.1, 0.0);
    tool(0.05, 0.04, 0.004, SOOT, o, 0.008, -0.13, 0.008);
  }
  // apron tie knot at the back
  box(0.05, 0.04, 0.03, P.leatherDark, [0, 0.56, -0.15 - 0.84 * BR - 0.012], J.hips);
  for (const s of [1, -1])
    box(0.03, 0.13, 0.01, P.leather, [s * 0.026, 0.48, -0.15 - 0.84 * BR - 0.016], J.hips, { rotation: [0, 0, s * 10] });

  // ================= APRON =================
  const zs = (x: number, y: number) => {
    if (y < 0.5) return 0.045 - x * x;
    const [rx, rz] = prof(y);
    return -0.15 + rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
  };
  const orient = (x: number, y: number) => {
    const z = zs(x, y);
    const dzdx = (zs(x + 0.01, y) - zs(x - 0.01, y)) / 0.02;
    const dzdy = (zs(x, y + 0.02) - zs(x, y - 0.02)) / 0.04;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.atan(dzdy), -Math.atan(dzdx), 0, "YXZ"));
    return { z, q };
  };
  const strip = (x: number, y0: number, y1: number, w: number, color: string, lift: number, bone: any) => {
    const ym = (y0 + y1) / 2;
    const { z, q } = orient(x, ym);
    return box(w, y1 - y0, 0.02, color, [x, ym, z + lift], bone, { quat: q });
  };
  const decal = (x: number, y: number, w: number, h: number, color: string, lift: number, bone: any, depth = 0.004) => {
    const { z, q } = orient(x, y);
    return box(w, h, depth, color, [x, y, z + lift + 0.011 + depth / 2], bone, { quat: q });
  };
  const XS = [-0.16, -0.08, 0, 0.08, 0.16];
  const BIB_TOP = [0.76, 0.9, 0.95, 0.9, 0.76];
  const HEM = [0.37, 0.34, 0.32, 0.34, 0.37];
  XS.forEach((x, i) => {
    const col = i % 2 === 0 ? P.leather : P.wood;
    // bib on the chest
    strip(x, 0.6, BIB_TOP[i], 0.086, col, 0.012, J.chest);
    decal(x, BIB_TOP[i] - 0.014, 0.05, 0.006, STITCH, 0.012, J.chest);
    // skirt on the hips
    strip(x, HEM[i], 0.57, 0.086, col, 0, J.hips);
    decal(x, HEM[i] + 0.011, 0.086, 0.022, P.leatherDark, 0, J.hips, 0.006);
    decal(x, HEM[i] + 0.011, 0.04, 0.006, STITCH, 0, J.hips, 0.009);
  });
  // gold rivets on the bib top
  for (const s of [1, -1]) ball(0.012, P.gold, [s * 0.08, 0.915, zs(s * 0.08, 0.915) + 0.012 + 0.012], J.chest);
  // pocket with tool handles
  {
    const px = 0.09;
    const py = 0.42;
    decal(px, py, 0.1, 0.085, P.leatherDark, 0, J.hips, 0.01);
    for (const dx of [-0.03, 0, 0.03]) decal(px + dx, py + 0.034, 0.018, 0.006, STITCH, 0, J.hips, 0.014);
    const zz = zs(px, 0.47) - 0.002;
    for (const [dx, tip] of [[-0.03, P.ironLight], [0.0, P.iron], [0.03, P.ironLight]] as [number, string][]) {
      box(0.014, 0.06, 0.014, P.wood, [px + dx, 0.475, zz], J.hips);
      box(0.01, 0.022, 0.01, tip, [px + dx, 0.516, zz], J.hips);
    }
  }
  // soot stains
  decal(-0.05, 0.7, 0.08, 0.06, SOOT, 0.012, J.chest);
  decal(0.1, 0.82, 0.05, 0.04, SOOT, 0.012, J.chest);
  decal(-0.13, 0.66, 0.06, 0.05, SOOT, 0.012, J.chest);
  decal(0.04, 0.63, 0.1, 0.035, SOOT, 0.012, J.chest);
  decal(-0.1, 0.4, 0.09, 0.06, SOOT, 0, J.hips);
  decal(0.15, 0.5, 0.04, 0.06, SOOT, 0, J.hips);
  decal(0.0, 0.37, 0.07, 0.03, SOOT, 0, J.hips);

  // ================= STRAPS (suspenders over the shoulders) =================
  const zf = (y: number, x: number) => {
    const [rx, rz] = prof(y);
    return -0.15 + rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2)) + 0.012;
  };
  const zb = (y: number, x: number) => {
    const [rx, rz] = prof(y);
    return -0.15 - rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2)) - 0.012;
  };
  for (const s of [1, -1]) {
    const x = s * 0.1;
    const pts: V[] = [
      [x, 0.93, zf(0.93, x)],
      [x, 1.045, -0.045],
      [x, 1.045, -0.255],
      [x, 0.93, zb(0.93, x)],
      [x, 0.78, zb(0.78, x)],
      [x, 0.64, zb(0.64, x)],
    ];
    for (let i = 0; i < pts.length - 1; i++)
      b.frustumBox(pts[i], pts[i + 1], [0.04, 0.012], [0.04, 0.012], { color: P.leatherDark, bone: J.chest });
    for (let i = 1; i < pts.length - 1; i++) ball(0.02, P.leatherDark, pts[i], J.chest);
    // gold buckle where the strap meets the bib
    box(0.05, 0.036, 0.012, P.gold, [x, 0.912, zf(0.912, x) + 0.012], J.chest);
    box(0.03, 0.018, 0.014, P.iron, [x, 0.912, zf(0.912, x) + 0.013], J.chest);
  }

  // ================= NECK, COLLAR, CHEST V =================
  cyl(0.085, 0.097, 0.15, 8, P.skin, [0, 1.075, -0.12], J.neck);
  cyl(0.11, 0.125, 0.05, 10, P.cloth, [0, 1.04, -0.12], J.neck);
  torus(0.113, 0.005, STITCH, [0, 1.064, -0.12], J.neck);
  // skin V of the open shirt
  b.extrude(
    [
      [-0.075, 0],
      [0.075, 0],
      [0, -0.095, "sharp"],
    ],
    {
      at: [0, 1.0, zf(1.0, 0) - 0.004],
      x: [1, 0, 0],
      y: [0, 1, -0.6],
      thickness: 0.012,
      color: P.skin,
      bone: J.chest,
    },
  );
  for (let i = 0; i < 3; i++) {
    const yy = 0.985 - i * 0.026;
    box(0.06 - i * 0.012, 0.006, 0.004, STITCH, [0, yy, zf(yy, 0) + 0.014 - i * 0.002], J.chest, { rotation: [-30, 0, 0] });
  }
  // shirt collar lapels
  for (const s of [1, -1]) {
    box(0.012, 0.012, 0.012, STITCH, [s * 0.075, 0.992, zf(0.992, 0) + 0.006], J.chest);
    b.frustumBox([s * 0.095, 1.045, -0.03], [s * 0.04, 0.95, 0.005], [0.03, 0.01], [0.03, 0.01], {
      color: P.cloth,
      bone: J.chest,
    });
  }
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildArms({ b, J, P, M }: Ctx) {
  const v = (a: ArrayLike<number>) => new THREE.Vector3(a[0], a[1], a[2]);
  const rnd = rng(23);
  const ball = (r: number, ws = 6, hs = 4) => new THREE.SphereGeometry(r, ws, hs);

  // ---------- local basis helper: Y = main axis, Z = secondary, X = Y x Z ----------
  const basis = (o: THREE.Vector3, ey: THREE.Vector3, ez: THREE.Vector3) => {
    const Y = ey.clone().normalize();
    const Z = ez.clone().addScaledVector(Y, -ez.dot(Y)).normalize();
    const X = new THREE.Vector3().crossVectors(Y, Z);
    return {
      o,
      X,
      Y,
      Z,
      p: (x = 0, y = 0, z = 0) => o.clone().addScaledVector(X, x).addScaledVector(Y, y).addScaledVector(Z, z),
    };
  };
  type Basis = ReturnType<typeof basis>;
  const bx = (bs: Basis, bone: any, color: string, w: number, h: number, d: number, x = 0, y = 0, z = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: bs.p(x, y, z), dir: bs.Y, up: bs.Z });

  // ---------- gloved fist: fingers stacked along the grip axis (Y), wrapping toward +Z ----------
  const fist = (bs: Basis, bone: any, thumbSide: number) => {
    bx(bs, bone, P.leather, 0.105, 0.11, 0.085, 0, 0, 0);
    for (let i = 0; i < 4; i++) bx(bs, bone, P.leather, 0.108, 0.026, 0.036, 0, (i - 1.5) * 0.028, 0.058);
    for (let i = 0; i < 3; i++) bx(bs, bone, P.leatherDark, 0.11, 0.004, 0.04, 0, (i - 1) * 0.028, 0.058);
    b.capsule(bs.p(-thumbSide * 0.04, 0.045, 0.01), bs.p(-thumbSide * 0.03, 0.052, 0.078), 0.019, P.leather, { bone });
    bx(bs, bone, P.leatherDark, 0.1, 0.1, 0.012, 0, 0, -0.0485);
    for (const sx of [-1, 1]) b.part(ball(0.011), P.gold, { bone, at: bs.p(sx * 0.03, 0, -0.057) });
  };

  // ---------- pauldron ----------
  const pauldron = (s: number, bone: any, Sh: THREE.Vector3) => {
    const k = 0.9;
    const a = v([s * 0.574, 0.819, 0]);
    const Pc = Sh.clone().add(v([s * 0.08, 0, 0]));
    const at = (y: number) => Pc.clone().addScaledVector(a, y * k);
    const prof = (pts: any[]) => pts.map((p) => (p.length === 3 ? [p[0] * k, p[1] * k, p[2]] : [p[0] * k, p[1] * k]));
    const D = [
      [0.2, 0.03],
      [0.19, 0.058],
      [0.168, 0.084],
      [0.125, 0.104],
      [0.065, 0.115],
      [0, 0.12],
    ];
    const rho = (y: number) => {
      if (y <= 0.03) return 0.2;
      for (let i = 1; i < D.length; i++)
        if (y <= D[i][1]) return D[i - 1][0] + ((D[i][0] - D[i - 1][0]) * (y - D[i - 1][1])) / (D[i][1] - D[i - 1][1]);
      return 0;
    };
    // leather lining skirt
    b.lathe(
      prof([[0, 0], [0.235, 0, "sharp"], [0.235, 0.02, "sharp"], [0.215, 0.045], [0.17, 0.065], [0, 0.07]]) as any,
      { at: at(-0.045), axis: a, segments: 10, color: P.leatherDark, bone },
    );
    // main dome
    b.lathe(
      prof([[0, 0], [0.2, 0, "sharp"], [0.2, 0.03, "sharp"], [0.19, 0.058], [0.168, 0.084], [0.125, 0.104], [0.065, 0.115], [0, 0.12]]) as any,
      { at: Pc, axis: a, segments: 10, color: P.plate, bone },
    );
    // top cap saucer
    const yc = 0.082;
    const Rc = rho(yc) + 0.012;
    b.lathe(
      prof([[0, 0], [Rc, 0, "sharp"], [Rc, 0.014, "sharp"], [Rc * 0.86, 0.034], [Rc * 0.6, 0.05], [Rc * 0.3, 0.058], [0, 0.062]]) as any,
      { at: at(yc), axis: a, segments: 10, color: P.plateLight, bone },
    );
    // gold trim
    b.part(new THREE.TorusGeometry(0.2 * k, 0.011, 5, 14), P.gold, { bone, at: at(0.006), dir: a, axis: "z" });
    b.part(new THREE.TorusGeometry(Rc * k, 0.008, 5, 14), P.gold, { bone, at: at(yc + 0.004), dir: a, axis: "z" });
    // rivets
    b.ring(frame(at(0.024), a), { count: 6, radius: 0.2 * k + 0.002 }, (it) =>
      b.part(ball(0.009), P.plateLight, { at: it, bone }),
    );
    b.ring(frame(at(yc + 0.012), a), { count: 5, radius: Rc * k + 0.001 }, (it) =>
      b.part(ball(0.008), P.gold, { at: it, bone }),
    );
    // rim spikes (skipping the neck side)
    b.ring(frame(at(0.016), a), { count: 5, radius: 0.2 * k, fromDeg: 70, toDeg: 290, tilt: 55 }, (it) =>
      b.spike(it, it, 0.085, 0.02, { color: P.plateLight, bone }),
    );
    // crown spike with gold collar
    const apexY = yc + 0.062;
    b.spike(at(apexY - 0.012), a, 0.11, 0.032, { color: P.plateLight, bone });
    b.part(new THREE.TorusGeometry(0.04 * k + 0.004, 0.008, 5, 12), P.gold, {
      bone,
      at: at(apexY - 0.007),
      dir: a,
      axis: "z",
    });
  };

  // ---------- arm: sleeve, skin, bracer, glove cuff, hair, elbow guard ----------
  const arm = (s: number, upper: any, elbow: any, Sh: THREE.Vector3, Eg: THREE.Vector3, W: THREE.Vector3) => {
    const L = (t: number) => Sh.clone().lerp(Eg, t);
    b.capsule(Sh, L(0.6), 0.085, P.cloth, { bone: upper });
    b.capsule(L(0.55), Eg, 0.068, P.skin, { bone: upper });
    b.rod(L(0.56), L(0.62), 0.092, P.leatherDark, { bone: upper });

    const rad = (t: number) => 0.07 - 0.022 * t + 0.016 * Math.sin(Math.PI * Math.min(1, t / 0.6));
    const fa = b.sweep([Eg, W], rad, { bone: elbow, color: P.skin });
    // leather bracer with gold bands, straps and rivets
    const bracer = b.sweep([Eg, W], (t: number) => rad(t) + 0.013, {
      from: 0.5,
      to: 0.9,
      bone: elbow,
      color: P.leather,
      caps: "flat",
    });
    for (const [t0, t1] of [[0.5, 0.54], [0.86, 0.9]])
      b.sweep([Eg, W], (t: number) => rad(t) + 0.02, { from: t0, to: t1, bone: elbow, color: P.gold, caps: "flat" });
    for (const [t0, t1] of [[0.63, 0.66], [0.75, 0.78]])
      b.sweep([Eg, W], (t: number) => rad(t) + 0.019, { from: t0, to: t1, bone: elbow, color: P.leatherDark, caps: "flat" });
    for (const t of [0.58, 0.82])
      for (const ang of [-70, 0, 70]) b.stick(ball(0.01), P.gold, bracer.at(t, ang), { embed: 0.4 });
    // glove cuff flaring over the wrist
    b.sweep([Eg, W], (t: number) => rad(t) + 0.02 + 0.016 * ((t - 0.9) / 0.1), {
      from: 0.9,
      to: 1,
      bone: elbow,
      color: P.leatherDark,
      caps: "flat",
    });
    // forearm hair
    for (let i = 0; i < 6; i++) {
      const t = 0.06 + 0.36 * rnd();
      const ang = -110 + 220 * rnd();
      const pt = fa.at(t, ang);
      const dir = pt.n.clone().multiplyScalar(0.45).addScaledVector(pt.tangent, 0.9).normalize();
      b.spike(pt, dir, 0.04, 0.008, { color: P.hair });
    }
    // elbow guard: faceted dome, spike, gold ring
    const out = Eg.clone().sub(Sh).normalize().sub(W.clone().sub(Eg).normalize()).normalize();
    b.part(new THREE.IcosahedronGeometry(0.068, 1), P.plate, { bone: elbow, at: Eg.clone().addScaledVector(out, 0.03), flat: true });
    b.spike(Eg.clone().addScaledVector(out, 0.08), out, 0.1, 0.03, { color: P.plateLight, bone: elbow });
    b.part(new THREE.TorusGeometry(0.036, 0.008, 5, 10), P.gold, {
      bone: elbow,
      at: Eg.clone().addScaledVector(out, 0.085),
      dir: out,
      axis: "z",
    });
  };

  // ---------- skeleton pose ----------
  const poseArm = (upper: any, elbow: any, Eg: THREE.Vector3, W: THREE.Vector3) => {
    const S = upper.at.clone();
    const cur = elbow.at.clone().sub(S).normalize();
    b.pose(upper, new THREE.Quaternion().setFromUnitVectors(cur, Eg.clone().sub(S).normalize()));
    const cy = elbow.axis.clone().normalize();
    b.pose(elbow, new THREE.Quaternion().setFromUnitVectors(cy, W.clone().sub(Eg).normalize()));
  };

  const ShR = v(M.shoulderR);
  const ShL = v(M.shoulderL);
  const HR = v(M.handR);
  const HL = v(M.handL);

  // ---------- right arm + hammer ----------
  const ang = (31 * Math.PI) / 180;
  const d = v([0, Math.cos(ang), -Math.sin(ang)]); // haft, cocked back
  const f = v([0, Math.sin(ang), Math.cos(ang)]); // striking-face direction
  const bh = basis(HR, d, f); // p(side, along haft, along face)
  const WR = HR.clone().addScaledVector(f, -0.075);
  const EgR = v([-0.55, 1.06, -0.02]);
  poseArm(J.upperArmR, J.elbowR, EgR, WR);
  pauldron(-1, J.upperArmR, ShR);
  arm(-1, J.upperArmR, J.elbowR, ShR, EgR, WR);
  fist(bh, J.elbowR, -1);

  const rb = J.elbowR;
  // haft, leather wrap, pommel
  b.rod(bh.p(0, -0.34, 0), bh.p(0, 0.245, 0), 0.024, P.wood, { bone: rb });
  for (let i = 0; i < 6; i++)
    b.rod(bh.p(0, -0.3 + i * 0.035, 0), bh.p(0, -0.3 + i * 0.035 + 0.022, 0), 0.03, i % 2 ? P.leatherDark : P.leather, { bone: rb });
  b.rod(bh.p(0, -0.362, 0), bh.p(0, -0.338, 0), 0.036, P.gold, { bone: rb });
  b.rod(bh.p(0, -0.338, 0), bh.p(0, -0.322, 0), 0.03, P.ironLight, { bone: rb });
  b.part(ball(0.022), P.gold, { bone: rb, at: bh.p(0, 0.25, 0) });
  // hammer head
  const hc = 0.15;
  bx(bh, rb, P.iron, 0.13, 0.11, 0.17, 0, hc, 0);
  for (const u of [-0.06, 0.06]) bx(bh, rb, P.gold, 0.138, 0.118, 0.016, 0, hc, u);
  bx(bh, rb, P.ironLight, 0.15, 0.125, 0.05, 0, hc, 0.115);
  glow(bx(bh, rb, "#e8622a", 0.12, 0.098, 0.008, 0, hc, 0.143), 0.6);
  glow(bx(bh, rb, P.ember, 0.07, 0.055, 0.006, 0, hc, 0.148), 0.7);
  bx(bh, rb, P.ironLight, 0.11, 0.1, 0.045, 0, hc, -0.1075);
  bx(bh, rb, P.iron, 0.075, 0.075, 0.04, 0, hc, -0.1475);
  bx(bh, rb, P.ironLight, 0.04, 0.05, 0.03, 0, hc, -0.1825);
  for (const sx of [-1, 1])
    for (const sy of [-1, 1]) b.part(ball(0.011), P.gold, { bone: rb, at: bh.p(sx * 0.0765, hc + sy * 0.04, 0.115) });
  // runes on both sides (fehu)
  for (const sx of [-1, 1]) {
    const x = sx * 0.0668;
    const r = (h1: number, u1: number, h2: number, u2: number) =>
      glow(b.rod(bh.p(x, hc + h1, u1), bh.p(x, hc + h2, u2), 0.0045, P.gold, { bone: rb }), 0.5);
    r(-0.035, -0.012, 0.035, -0.012);
    r(0.035, -0.012, 0.012, 0.032);
    r(0.005, -0.012, -0.018, 0.032);
  }

  // ---------- left arm + tongs ----------
  const tdir = v([-0.5, -0.14, 0.77]).normalize();
  const ezL = v([-1, 0, 0]);
  const fl = basis(HL, tdir, ezL);
  const WL = HL.clone().addScaledVector(fl.Z, -0.075);
  const EgL = v([0.55, 0.86, -0.02]);
  poseArm(J.upperArmL, J.elbowL, EgL, WL);
  pauldron(1, J.upperArmL, ShL);
  arm(1, J.upperArmL, J.elbowL, ShL, EgL, WL);
  fist(fl, J.elbowL, 1);

  const lb = J.elbowL;
  const tb = basis(HL, tdir, v([0, 1, 0]));
  const pt = (s: number, o: number) => tb.p(0, s, o);
  const rein = (sgn: number) => {
    const off = (s: number) => sgn * (0.05 - 0.125 * (s + 0.2));
    b.capsule(pt(-0.2, off(-0.2)), pt(0.3, off(0.3)), 0.011, P.iron, { bone: lb });
    b.rod(pt(0.3, off(0.3)), pt(0.36, off(0.3)), 0.011, P.ironLight, { bone: lb });
    b.rod(pt(-0.17, off(-0.17)), pt(-0.065, off(-0.065)), 0.0165, P.leatherDark, { bone: lb });
    b.part(new THREE.TorusGeometry(0.02, 0.005, 5, 10), P.ironLight, {
      bone: lb,
      at: pt(-0.222, off(-0.2)),
      dir: tb.X,
      axis: "z",
    });
  };
  rein(1);
  rein(-1);
  b.rod(tb.p(-0.025, 0.2, 0), tb.p(0.025, 0.2, 0), 0.014, P.ironLight, { bone: lb });
  for (const sx of [-1, 1]) b.part(ball(0.012), P.gold, { bone: lb, at: tb.p(sx * 0.027, 0.2, 0) });
  // glowing bar gripped in the jaws
  glow(b.rod(pt(0.27, 0), pt(0.4, 0), 0.0135, P.ember, { bone: lb, section: "box" }), 1.2);
  glow(b.rod(pt(0.4, 0), pt(0.43, 0), 0.0125, P.hotYellow, { bone: lb, section: "box" }), 1.5);
}
```