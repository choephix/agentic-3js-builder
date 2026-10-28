<!-- call: plan -->

```json
{
  "name": "Hydra of the Blighted Marsh",
  "description": "A five-headed hydra in a God of War style: a scarred, armored Norse-myth beast with a bulky body, four legs, a heavy tail, and five fanged heads on long necks, each with a glowing eye, with chains, runes and broken weapons stuck in its hide.",
  "builderName": "hydra",
  "size": [5.0, 5.2, 7.0],
  "layout": "A low, heavy quadruped body runs along Z, with its chest toward +Z and its tail toward -Z. It stands on four thick, clawed legs, and the claws, feet and belly rest on y=0. Five long S-curved necks rise from the shoulders and fan out in a hand shape. The centre neck is tallest (head at about y=5, z=2.6). Inner pair heads sit at x=+-1.1 (y=4.4, z=2.9). Outer pair heads sit at x=+-2.0 (y=3.3, z=2.4). Heads are blocky wedge skulls with an upper and a lower jaw, big teeth, horns, brow ridges and glowing amber eyes. Style: gritty, desaturated, Norse. Dark green-grey scaled hide has paler belly plates, and cold blue-iron armour plates with rivets are chained onto the shoulders and back. Carved pale-blue glowing runes, scar slashes, broken spear shafts and axe blades stuck in the hide, and bone spikes down the spine give the God of War look. Every colour is a flat colour per part.",
  "palette": {
    "hideDark": "#2f3a34",
    "hideMid": "#46554a",
    "hideLight": "#6b7a5c",
    "belly": "#a89a74",
    "scar": "#8a5a4a",
    "iron": "#3d4652",
    "ironLight": "#7d8896",
    "rust": "#7a4a2a",
    "bone": "#cfc6a8",
    "horn": "#5a4a3a",
    "claw": "#d8d0b8",
    "eye": "#ffb020",
    "mouth": "#7a2430",
    "tongue": "#a83a48",
    "runeBlue": "#6fd8ff",
    "chain": "#59606a",
    "wood": "#6a4a30",
    "fur": "#4a3a2c"
  },
  "mounts": {
    "chest": [0, 1.9, 1.5],
    "hips": [0, 1.8, -1.4],
    "neckBaseC": [0, 2.9, 1.9],
    "neckBaseIL": [0.6, 2.8, 1.8],
    "neckBaseIR": [-0.6, 2.8, 1.8],
    "neckBaseOL": [1.1, 2.6, 1.6],
    "neckBaseOR": [-1.1, 2.6, 1.6],
    "headC": [0, 5.0, 2.6],
    "headIL": [1.1, 4.4, 2.9],
    "headIR": [-1.1, 4.4, 2.9],
    "headOL": [2.0, 3.3, 2.4],
    "headOR": [-2.0, 3.3, 2.4],
    "tailBase": [0, 1.7, -2.6],
    "shoulderL": [1.1, 1.5, 1.5],
    "shoulderR": [-1.1, 1.5, 1.5],
    "hipL": [1.1, 1.5, -1.4],
    "hipR": [-1.1, 1.5, -1.4]
  },
  "joints": [
    { "name": "hips", "at": [0, 1.8, -1.4], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 1.9, 1.5], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neckC1", "parent": "chest", "at": [0, 2.9, 1.9], "dir": [0, 1, 0.2], "role": "neck" },
    { "name": "neckC2", "parent": "neckC1", "at": [0, 3.8, 2.1], "dir": [0, 1, 0.3], "role": "neck" },
    { "name": "neckC3", "parent": "neckC2", "at": [0, 4.5, 2.4], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "headC", "parent": "neckC3", "at": [0, 5.0, 2.6], "dir": [0, 0, 1], "role": "head" },
    { "name": "jawC", "parent": "headC", "at": [0, 4.9, 2.8], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "neckIL1", "parent": "chest", "at": [0.6, 2.8, 1.8], "dir": [0.3, 1, 0.2], "role": "neck" },
    { "name": "neckIL2", "parent": "neckIL1", "at": [0.9, 3.6, 2.1], "dir": [0.3, 1, 0.3], "role": "neck" },
    { "name": "neckIL3", "parent": "neckIL2", "at": [1.1, 4.1, 2.5], "dir": [0, 0.4, 1], "role": "neck" },
    { "name": "headIL", "parent": "neckIL3", "at": [1.1, 4.4, 2.9], "dir": [0, 0, 1], "role": "head" },
    { "name": "jawIL", "parent": "headIL", "at": [1.1, 4.3, 3.1], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "neckIR1", "parent": "chest", "at": [-0.6, 2.8, 1.8], "dir": [-0.3, 1, 0.2], "role": "neck" },
    { "name": "neckIR2", "parent": "neckIR1", "at": [-0.9, 3.6, 2.1], "dir": [-0.3, 1, 0.3], "role": "neck" },
    { "name": "neckIR3", "parent": "neckIR2", "at": [-1.1, 4.1, 2.5], "dir": [0, 0.4, 1], "role": "neck" },
    { "name": "headIR", "parent": "neckIR3", "at": [-1.1, 4.4, 2.9], "dir": [0, 0, 1], "role": "head" },
    { "name": "jawIR", "parent": "headIR", "at": [-1.1, 4.3, 3.1], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "neckOL1", "parent": "chest", "at": [1.1, 2.6, 1.6], "dir": [0.6, 1, 0.2], "role": "neck" },
    { "name": "neckOL2", "parent": "neckOL1", "at": [1.6, 3.2, 1.9], "dir": [0.5, 0.8, 0.4], "role": "neck" },
    { "name": "neckOL3", "parent": "neckOL2", "at": [1.9, 3.3, 2.2], "dir": [0.2, 0.2, 1], "role": "neck" },
    { "name": "headOL", "parent": "neckOL3", "at": [2.0, 3.3, 2.4], "dir": [0, 0, 1], "role": "head" },
    { "name": "jawOL", "parent": "headOL", "at": [2.0, 3.2, 2.6], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "neckOR1", "parent": "chest", "at": [-1.1, 2.6, 1.6], "dir": [-0.6, 1, 0.2], "role": "neck" },
    { "name": "neckOR2", "parent": "neckOR1", "at": [-1.6, 3.2, 1.9], "dir": [-0.5, 0.8, 0.4], "role": "neck" },
    { "name": "neckOR3", "parent": "neckOR2", "at": [-1.9, 3.3, 2.2], "dir": [-0.2, 0.2, 1], "role": "neck" },
    { "name": "headOR", "parent": "neckOR3", "at": [-2.0, 3.3, 2.4], "dir": [0, 0, 1], "role": "head" },
    { "name": "jawOR", "parent": "headOR", "at": [-2.0, 3.2, 2.6], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "legFL1", "parent": "chest", "at": [1.1, 1.5, 1.5], "dir": [0, -1, 0.2], "role": "leg" },
    { "name": "legFL2", "parent": "legFL1", "at": [1.3, 0.8, 1.7], "dir": [0, -1, -0.1], "role": "leg" },
    { "name": "legFL3", "parent": "legFL2", "at": [1.3, 0.2, 1.8], "dir": [0, 0, 1], "role": "leg" },
    { "name": "legFR1", "parent": "chest", "at": [-1.1, 1.5, 1.5], "dir": [0, -1, 0.2], "role": "leg" },
    { "name": "legFR2", "parent": "legFR1", "at": [-1.3, 0.8, 1.7], "dir": [0, -1, -0.1], "role": "leg" },
    { "name": "legFR3", "parent": "legFR2", "at": [-1.3, 0.2, 1.8], "dir": [0, 0, 1], "role": "leg" },
    { "name": "legBL1", "parent": "hips", "at": [1.1, 1.5, -1.4], "dir": [0, -1, 0.3], "role": "leg" },
    { "name": "legBL2", "parent": "legBL1", "at": [1.3, 0.9, -1.1], "dir": [0, -1, -0.4], "role": "leg" },
    { "name": "legBL3", "parent": "legBL2", "at": [1.3, 0.2, -1.4], "dir": [0, 0, 1], "role": "leg" },
    { "name": "legBR1", "parent": "hips", "at": [-1.1, 1.5, -1.4], "dir": [0, -1, 0.3], "role": "leg" },
    { "name": "legBR2", "parent": "legBR1", "at": [-1.3, 0.9, -1.1], "dir": [0, -1, -0.4], "role": "leg" },
    { "name": "legBR3", "parent": "legBR2", "at": [-1.3, 0.2, -1.4], "dir": [0, 0, 1], "role": "leg" },
    { "name": "tail1", "parent": "hips", "at": [0, 1.7, -2.6], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.5, -3.6], "dir": [0, -0.1, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.2, -4.8], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 1.0, -5.8], "dir": [0, 0.1, -1], "role": "tail" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The body: a lofted bulky barrel torso from hips to chest in hideDark/hideMid with a hideLight back and a belly-coloured plate underside (rows of belly bands). Scarred slashes in scar colour, bone spikes down the spine, iron shoulder pauldrons and back plates with rivets, chains crossing the chest with iron links, glowing runeBlue runes on the flanks, and broken spear and axe blades stuck in the hide with wood shafts. The five neck bases are muscled shoulder humps at the neckBase mounts.",
      "box": [[-1.8, 0.9, -2.8], [1.8, 3.2, 2.6]],
      "attaches": "Necks start at the neckBase mounts, legs at the shoulder and hip mounts, and the tail at tailBase.",
      "joints": ["hips", "chest"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "legsTail",
      "builds": "Four thick legs, each a thigh, shin and foot chain in hideDark/hideMid, with iron knee guards, rivets, scale bands, big three-toe feet with claw-coloured claws, and mud/scar details. The heavy tapered tail has bone spikes along its top, a scarred patch, an iron band, and a spiked bone-and-iron club tip. The belly is paler.",
      "box": [[-1.9, 0.0, -6.2], [1.9, 1.9, 2.3]],
      "floor": true,
      "attaches": "Legs hang from the shoulder and hip mounts, and the tail starts at tailBase.",
      "joints": ["legFL1", "legFL2", "legFL3", "legFR1", "legFR2", "legFR3", "legBL1", "legBL2", "legBL3", "legBR1", "legBR2", "legBR3", "tail1", "tail2", "tail3", "tail4"],
      "budget": 190
    },
    {
      "id": "headsCentre",
      "builds": "The centre neck and head, plus the inner left head (headIL): S-curved scaled necks in hideMid with belly stripes on their fronts, iron collars with rivets and chain links, and a ridge of bone spikes. Heads are wedge skulls with an upper jaw and a separate lower jaw bound to the jaw joint, a mouth interior in mouth/tongue colours, rows of bone fangs, horns in horn/bone colours, brow ridges, nostrils and glowing eye parts. The centre head is the biggest, with a broken iron crown/helm and a long scar over one eye. Each head wears one unique detail, such as a cracked horn or an arrow stuck in a cheek.",
      "box": [[-0.6, 2.7, 1.3], [1.8, 5.6, 3.9]],
      "attaches": "Neck chains start at neckBaseC and neckBaseIL on the torso and end at headC and headIL.",
      "joints": ["neckC1", "neckC2", "neckC3", "headC", "jawC", "neckIL1", "neckIL2", "neckIL3", "headIL", "jawIL"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "headsRight",
      "builds": "The inner right head (headIR) and its neck, in the same style as the centre heads: scaled neck with belly stripes, iron collar and chain, bone spikes, a wedge skull with separate upper and lower jaw, fangs, horns, brow ridges, a glowing eye, and its own unique detail (a notched horn and a snapped spear tip in the jaw). Also the outer right head (headOR) and its neck, sprawling low to the right with an open jaw, an eye scar and an iron muzzle band.",
      "box": [[-2.8, 2.5, 1.3], [-0.3, 5.0, 3.9]],
      "attaches": "Necks start at neckBaseIR and neckBaseOR on the torso.",
      "joints": ["neckIR1", "neckIR2", "neckIR3", "headIR", "jawIR", "neckOR1", "neckOR2", "neckOR3", "headOR", "jawOR"],
      "floor": false,
      "budget": 160
    },
    {
      "id": "headOuterLeft",
      "builds": "The outer left head (headOL) and its neck, sprawling low to the left in the same head style: a scaled neck with an iron collar and chain, a wedge skull with a separate upper and lower jaw, fangs, horns, a glowing eye, a scar, bone spikes, and one unique detail (a broken axe blade lodged in the neck, a cracked tusk). Also a few extra runeBlue glow runes on its neck and some spare dangling chain loops hung from the shoulders.",
      "box": [[0.8, 2.4, 1.3], [3.0, 4.3, 3.6]],
      "attaches": "The neck starts at neckBaseOL on the torso.",
      "joints": ["neckOL1", "neckOL2", "neckOL3", "headOL", "jawOL"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: headsRight -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, bezier } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type HRCtx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildHeadsRight({ b, J, P }: HRCtx) {
  const rnd = rng(1105);
  const HOLE = "#15110e";
  const D2R = Math.PI / 180;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ONE = V(1, 1, 1);

  const geoAt = (g: THREE.BufferGeometry, pos: number[], rot: number[] = [0, 0, 0]) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D2R, rot[1] * D2R, rot[2] * D2R));
    g.applyMatrix4(new THREE.Matrix4().compose(V(pos[0], pos[1], pos[2]), q, ONE));
    return g;
  };
  const orient = (g: THREE.BufferGeometry, pos: THREE.Vector3, dir: THREE.Vector3) => {
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(pos, q, ONE));
    return g;
  };
  const merged = (geos: THREE.BufferGeometry[], color: string, bone: any) =>
    b.part(mergeGeometries(geos, false)!, color, { bone, at: [0, 0, 0], flat: true });

  // ---------------------------------------------------------------- neck
  function neck(cfg: { pts: number[][]; radii: number[]; bones: any[]; runeAt: number; runeAngle: number; slash?: boolean }) {
    const path = catmull(cfg.pts);
    const sw = b.sweep(path, cfg.radii, {
      bone: cfg.bones,
      color: P.hideMid,
      sectors: [
        [-70, 70, P.hideDark],
        [135, 225, P.belly],
      ],
    });
    // belly plates
    for (let i = 0; i < 6; i++) {
      const sp = sw.at(0.12 + i * 0.12, 180, -0.01);
      b.stick(new THREE.BoxGeometry(sp.radius * 0.9, 0.06, 0.04), P.hideDark, sp, { embed: 0.6 });
    }
    // side scale plates
    for (const side of [1, -1]) {
      for (let j = 0; j < 4; j++) {
        const sp = sw.at(0.1 + j * 0.2 + (side > 0 ? 0.09 : 0), side * 58, -0.01);
        b.stick(new THREE.ConeGeometry(sp.radius * 0.45, 0.07, 4), P.hideLight, sp, { embed: 0.3, flat: true });
      }
    }
    // bone spikes along the back
    for (let i = 0; i < 5; i++) {
      const t = 0.1 + i * 0.16;
      const sp = sw.at(t, 0, -0.03);
      b.spike(sp, sp, 0.24 * (1 - t * 0.5), 0.05, { color: P.bone });
    }
    // glowing rune
    const sp = sw.at(cfg.runeAt, cfg.runeAngle, -0.005);
    const stroke = (dx: number, dz: number, spin: number, len: number) =>
      glow(
        b.stick(new THREE.BoxGeometry(0.018, 0.02, len), P.runeBlue, sp.moved([dx, 0, dz]), {
          embed: 0.3,
          spin,
          flow: sp.tangent,
        }),
        1.4,
      );
    stroke(0, 0, 0, 0.17);
    stroke(0.04, 0.05, -45, 0.09);
    stroke(0.04, -0.02, -45, 0.09);
    // scar slash
    if (cfg.slash) {
      const sc = sw.at(0.3, -95, -0.005);
      for (const [dx, spin] of [[0, 35], [0.03, 35]] as number[][])
        b.stick(new THREE.BoxGeometry(0.02, 0.02, 0.26), P.scar, sc.moved([dx, 0, 0]), { embed: 0.3, spin, flow: sc.tangent });
    }
    return { path, sw };
  }

  function collar(path: any, sw: any, t: number, bone: any) {
    const c: THREE.Vector3 = path.at(t);
    const T: THREE.Vector3 = path.tangentAt(t);
    const R = sw.at(t, 0).radius + 0.05;
    const items = b.ring(frame(c, T), { count: 10, radius: R }).items;
    b.sweep(catmull(items, { closed: true }), 0.055, { color: P.iron, bone });
    const lower = c.clone().addScaledVector(T, -0.1);
    const items2 = b.ring(frame(lower, T), { count: 10, radius: R - 0.005 }).items;
    b.sweep(catmull(items2, { closed: true }), 0.03, { color: P.ironLight, bone });
    const rv = b.ring(frame(c, T), { count: 8, radius: R + 0.045 }).items;
    merged(
      rv.map((it: any) => geoAt(new THREE.SphereGeometry(0.026, 5, 4), [it.at.x, it.at.y, it.at.z])),
      P.ironLight,
      bone,
    );
    return items.map((it: any) => it.at.clone() as THREE.Vector3);
  }

  function chainLinks(a: THREE.Vector3, e: THREE.Vector3, sag: number, bone: any) {
    const p = bezier(a, a.clone().add(V(0, -sag, 0)), e.clone().add(V(0, -sag, 0)), e);
    const n = Math.max(4, Math.round(p.length / 0.07));
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const g = new THREE.TorusGeometry(0.034, 0.011, 5, 8);
      g.scale(1, 1.45, 1);
      if (i % 2) g.rotateY(Math.PI / 2);
      geos.push(orient(g, p.at(t), p.tangentAt(t)));
    }
    merged(geos, P.chain, bone);
  }

  // ---------------------------------------------------------------- head
  function head(cfg: { o: number[]; S: number; hb: any; jb: any; kind: "IR" | "OR" }) {
    const [ox, oy, oz] = cfg.o;
    const S = cfg.S;
    const hb = cfg.hb;
    const jb = cfg.jb;
    const L = (x: number, y: number, z: number) => [ox + x * S, oy + y * S, oz + z * S];
    const hw = (z: number) => (z < 0.3 ? 0.245 : 0.23 - ((z - 0.3) / 0.68) * 0.08);
    const botY = (z: number) => (z < 0.3 ? -0.15 : -0.16 + ((z - 0.3) / 0.68) * 0.03);
    const jw = (z: number) => 0.2 - ((z - 0.02) / 0.9) * 0.07;

    // skull
    b.frustumBox(L(0, 0.06, -0.2), L(0, 0.05, 0.35), [0.56 * S, 0.42 * S], [0.5 * S, 0.36 * S], { bone: hb, color: P.hideMid });
    b.frustumBox(L(0, -0.02, 0.3), L(0, -0.03, 0.98), [0.46 * S, 0.28 * S], [0.3 * S, 0.2 * S], { bone: hb, color: P.hideMid });
    b.frustumBox(L(0, 0.1, 0.28), L(0, 0.06, 0.96), [0.2 * S, 0.05 * S], [0.12 * S, 0.04 * S], { bone: hb, color: P.hideDark });
    for (const s of [1, -1]) {
      // cheeks, brows, eyes
      b.part(new THREE.BoxGeometry(0.07 * S, 0.2 * S, 0.4 * S), P.hideDark, { bone: hb, at: L(s * 0.27, -0.05, 0.08) });
      b.frustumBox(L(s * 0.3, 0.235, 0.08), L(s * 0.13, 0.22, 0.46), [0.09 * S, 0.075 * S], [0.08 * S, 0.07 * S], {
        bone: hb,
        color: P.hideDark,
      });
      glow(
        b.part(new THREE.SphereGeometry(0.065 * S, 8, 6), P.eye, { bone: hb, at: L(s * 0.2, 0.15, 0.36), scale: [0.9, 1, 1.25] }),
        1.6,
      );
      b.part(new THREE.BoxGeometry(0.012 * S, 0.08 * S, 0.02 * S), HOLE, { bone: hb, at: L(s * 0.2, 0.15, 0.44) });
      // cheek spikes
      b.spike(L(s * 0.25, -0.08, -0.05), [s * 0.7, -0.1, -0.8], 0.22 * S, 0.045 * S, { bone: hb, color: P.bone });
      // ear frill
      b.extrude(
        [
          [0, 0],
          [0.22 * S, 0.02 * S],
          [0.3 * S, 0.2 * S, "sharp"],
          [0.16 * S, 0.1 * S],
          [0.18 * S, 0.34 * S, "sharp"],
          [0.05 * S, 0.2 * S],
          [0, 0.12 * S],
        ],
        { at: L(s * 0.26, 0.0, -0.05), x: [0, 0, -1], y: [s * 0.5, 1, 0], thickness: 0.022 * S, color: P.hideLight, bone: hb },
      );
    }
    // nostrils
    merged(
      [1, -1].map((s) => geoAt(new THREE.SphereGeometry(0.035 * S, 5, 4), L(s * 0.07, 0.06, 0.93))),
      HOLE,
      hb,
    );
    // crest of bone spikes between the brows
    {
      const geos: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 5; i++) {
        const h = (0.13 - i * 0.015) * S;
        const g = new THREE.ConeGeometry(0.036 * S, h, 5);
        geos.push(geoAt(g, L(0, 0.23 + 0.0 + h / (2 * S) - 0.02, -0.12 + i * 0.1), [-12, 0, 0]));
      }
      merged(geos, P.bone, hb);
    }

    // horns
    for (const s of [1, -1]) {
      const hp = bezier(L(s * 0.2, 0.2, -0.05), L(s * 0.4, 0.28, -0.18), L(s * 0.55, 0.4, -0.3), L(s * 0.58, 0.56, -0.12));
      const broken = cfg.kind === "IR" && s === 1;
      const notched = cfg.kind === "IR" && s === -1;
      if (broken) {
        const hs = hp.slice(0, 0.78);
        b.sweep(hs, [0.075 * S, 0.028 * S], { bone: hb, color: P.horn, caps: { start: "round", end: "flat" } });
        const e = hs.at(1);
        b.spike(e, hs.tangentAt(1), 0.1 * S, 0.026 * S, { bone: hb, color: P.bone });
      } else {
        b.sweep(hp, [0.075 * S, 0.0], { bone: hb, color: P.horn, caps: { end: "point" } });
        b.sweep(hp.slice(0.55, 1), [0.04 * S, 0.0], { bone: hb, color: P.bone, caps: { end: "point" }, extend: 0.0 });
      }
      if (notched) {
        const pt = hp.at(0.5);
        b.part(new THREE.BoxGeometry(0.05 * S, 0.05 * S, 0.035 * S), HOLE, {
          bone: hb,
          at: [pt.x, pt.y + 0.03 * S, pt.z],
          rotation: [0, 0, 45],
        });
        b.part(new THREE.BoxGeometry(0.1 * S, 0.012 * S, 0.012 * S), P.scar, {
          bone: hb,
          at: [hp.at(0.35).x, hp.at(0.35).y + 0.03 * S, hp.at(0.35).z],
          rotation: [0, 0, 20],
        });
      }
    }

    // lower jaw
    b.frustumBox(L(0, -0.2, 0.02), L(0, -0.2, 0.92), [0.4 * S, 0.1 * S], [0.26 * S, 0.07 * S], { bone: jb, color: P.hideDark });
    b.frustumBox(L(0, -0.245, 0.1), L(0, -0.24, 0.85), [0.3 * S, 0.025 * S], [0.2 * S, 0.025 * S], { bone: jb, color: P.belly });
    b.part(new THREE.BoxGeometry(0.2 * S, 0.05 * S, 0.1 * S), P.bone, { bone: jb, at: L(0, -0.23, 0.9) });
    // mouth interior
    b.frustumBox(L(0, -0.155, 0.1), L(0, -0.15, 0.9), [0.3 * S, 0.03 * S], [0.2 * S, 0.03 * S], { bone: hb, color: P.mouth });
    b.frustumBox(L(0, -0.152, 0.05), L(0, -0.152, 0.9), [0.34 * S, 0.012 * S], [0.22 * S, 0.012 * S], { bone: jb, color: P.mouth });
    b.frustumBox(L(0, -0.125, 0.1), L(0, -0.128, 0.76), [0.14 * S, 0.03 * S], [0.07 * S, 0.025 * S], { bone: jb, color: P.tongue });

    // teeth
    {
      const up: THREE.BufferGeometry[] = [];
      const lo: THREE.BufferGeometry[] = [];
      for (const s of [1, -1]) {
        for (const z of [0.36, 0.5, 0.64, 0.78]) {
          const len = 0.085 + rnd() * 0.03;
          const g = new THREE.ConeGeometry(0.026 * S, len * S, 5);
          g.rotateX(Math.PI);
          up.push(geoAt(g, L(s * (hw(z) - 0.03), botY(z) - len / 2 + 0.015, z)));
        }
        {
          const g = new THREE.ConeGeometry(0.036 * S, 0.21 * S, 5);
          g.rotateX(Math.PI);
          up.push(geoAt(g, L(s * (hw(0.9) - 0.025), botY(0.9) - 0.09, 0.9), [0, 0, s * 6]));
        }
        for (const z of [0.3, 0.44, 0.58, 0.72]) {
          const len = 0.07 + rnd() * 0.02;
          lo.push(geoAt(new THREE.ConeGeometry(0.022 * S, len * S, 5), L(s * (jw(z) - 0.035), -0.16 + len / 2, z)));
        }
        lo.push(geoAt(new THREE.ConeGeometry(0.03 * S, 0.16 * S, 5), L(s * (jw(0.84) - 0.04), -0.16 + 0.07, 0.84)));
      }
      merged(up, P.bone, hb);
      merged(lo, P.bone, jb);
    }

    if (cfg.kind === "IR") {
      // snapped spear tip lodged in the corner of the jaw (model-left side)
      b.extrude(
        [
          [0, 0],
          [0.04 * S, 0.07 * S],
          [0, 0.25 * S, "sharp"],
          [-0.04 * S, 0.07 * S],
        ],
        { at: L(0.14, -0.17, 0.5), x: [0, 0, 1], y: [1, -0.15, 0], thickness: 0.018 * S, color: P.ironLight, bone: hb },
      );
      b.spike(L(0.15, -0.17, 0.5), [-1, -0.1, 0.1], 0.26 * S, 0.03 * S, { bone: hb, color: P.wood });
      b.rod(L(0.1, -0.17, 0.5), L(0.15, -0.17, 0.5), 0.038 * S, { bone: hb, color: P.iron });
    } else {
      // eye scar over the right eye and an iron muzzle band
      b.part(new THREE.BoxGeometry(0.022 * S, 0.42 * S, 0.07 * S), P.scar, {
        bone: hb,
        at: L(-0.2, 0.14, 0.4),
        rotation: [0, 0, -24],
      });
      for (const k of [-0.1, 0.1])
        b.part(new THREE.BoxGeometry(0.07 * S, 0.014 * S, 0.06 * S), P.scar, {
          bone: hb,
          at: L(-0.2 - k * 0.4, 0.14 + k, 0.4),
          rotation: [0, 0, -24],
        });
      const band: THREE.BufferGeometry[] = [
        geoAt(new THREE.BoxGeometry(0.4 * S, 0.025 * S, 0.12 * S), L(0, 0.105, 0.62)),
        ...[1, -1].map((s) => geoAt(new THREE.BoxGeometry(0.025 * S, 0.27 * S, 0.12 * S), L(s * 0.2, -0.025, 0.62))),
      ];
      merged(band, P.iron, hb);
      const rv: THREE.BufferGeometry[] = [];
      for (const s of [1, -1]) for (const z of [0.57, 0.67]) rv.push(geoAt(new THREE.SphereGeometry(0.02 * S, 5, 4), L(s * 0.215, 0.0, z)));
      for (const x of [-0.1, 0.1]) rv.push(geoAt(new THREE.SphereGeometry(0.02 * S, 5, 4), L(x, 0.118, 0.62)));
      merged(rv, P.ironLight, hb);
    }
  }

  // ---------------------------------------------------------------- inner right (IR)
  const nIR = neck({
    pts: [
      [-0.55, 2.55, 1.7],
      [-0.75, 3.2, 1.75],
      [-1.0, 3.8, 2.0],
      [-1.05, 4.2, 2.5],
      [-1.1, 4.4, 2.85],
    ],
    radii: [0.4, 0.33, 0.28, 0.26, 0.27],
    bones: [J.neckIR1, J.neckIR2, J.neckIR3],
    runeAt: 0.42,
    runeAngle: -110,
    slash: true,
  });
  const colIR = collar(nIR.path, nIR.sw, 0.82, J.neckIR3);
  head({ o: [-1.1, 4.4, 2.9], S: 1.0, hb: J.headIR, jb: J.jawIR, kind: "IR" });

  // ---------------------------------------------------------------- outer right (OR)
  const nOR = neck({
    pts: [
      [-1.05, 2.55, 1.55],
      [-1.45, 3.15, 1.65],
      [-1.85, 3.5, 1.9],
      [-1.95, 3.4, 2.2],
      [-2.0, 3.3, 2.4],
    ],
    radii: [0.38, 0.32, 0.28, 0.25, 0.26],
    bones: [J.neckOR1, J.neckOR2, J.neckOR3],
    runeAt: 0.35,
    runeAngle: -110,
  });
  const colOR = collar(nOR.path, nOR.sw, 0.6, J.neckOR2);
  head({ o: [-2.0, 3.3, 2.4], S: 0.95, hb: J.headOR, jb: J.jawOR, kind: "OR" });

  // chain slung between the two collars
  const a = colIR.reduce((m, p) => (p.x < m.x ? p : m), colIR[0]);
  const e = colOR.reduce((m, p) => (p.x > m.x ? p : m), colOR[0]);
  chainLinks(a, e, 0.35, J.neckIR3);

  // outer head sprawls with its jaw hanging open
  b.pose(J.jawOR, { axis: [1, 0, 0], deg: 26 });
}
```

<!-- call: legsTail -->

```ts
import * as THREE from "three";
import { aim, catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildLegsTail({ b, J, P, M }: Ctx) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const Y = V(0, 1, 0);
  const MUD = "#3a3226";
  const rnd = rng(11);

  // ---------- helpers ----------
  const interp = (st: number[][], t: number) => {
    if (t <= st[0][0]) return st[0][1];
    for (let i = 0; i < st.length - 1; i++) {
      if (t <= st[i + 1][0]) {
        const k = (t - st[i][0]) / (st[i + 1][0] - st[i][0]);
        return st[i][1] + (st[i + 1][1] - st[i][1]) * k;
      }
    }
    return st[st.length - 1][1];
  };

  // orient a geometry (local Y -> dir, or local Z -> dir with axis "z") and move it into model space
  const piece = (geo: THREE.BufferGeometry, pos: THREE.Vector3, dir: THREE.Vector3, up?: THREE.Vector3, axis: "y" | "z" = "y") => {
    geo.applyQuaternion(aim(dir, up, axis));
    geo.translate(pos.x, pos.y, pos.z);
    return geo;
  };

  // collector: same bone + colour pieces become one merged part
  const acc = new Map<string, { bone: any; color: string; geos: THREE.BufferGeometry[]; glow: number }>();
  const add = (bone: any, color: string, geo: THREE.BufferGeometry, glowK = 0) => {
    const key = `${bone.name}|${color}|${glowK}`;
    let e = acc.get(key);
    if (!e) acc.set(key, (e = { bone, color, geos: [], glow: glowK }));
    e.geos.push(geo);
  };
  const flush = () => {
    for (const e of acc.values()) {
      const geo = e.geos.length === 1 ? e.geos[0] : mergeGeometries(e.geos);
      if (!geo) continue;
      const part = b.part(geo, e.color, { bone: e.bone, at: [0, 0, 0], flat: true });
      if (e.glow) glow(part, e.glow);
    }
  };

  const ringVec = (dir: THREE.Vector3) => {
    const q = aim(dir);
    return (a: number) => V(Math.sin(a), 0, Math.cos(a)).applyQuaternion(q);
  };

  // iron band round a limb or tail, with rivets on its flat faces
  const band = (bone: any, color: string, rivet: string, c: THREE.Vector3, dir: THREE.Vector3, R: number, h: number, n = 8) => {
    add(bone, color, piece(new THREE.CylinderGeometry(R, R, h, n), c, dir));
    const rv = ringVec(dir);
    const face = R * Math.cos(Math.PI / n) + 0.004;
    for (let k = 0; k < n; k++) {
      const v = rv(((k + 0.5) * Math.PI * 2) / n);
      add(bone, rivet, piece(new THREE.SphereGeometry(0.02 + h * 0.06, 5, 4), c.clone().addScaledVector(v, face), v));
    }
  };

  // flat stroke lying on a surface patch (p, normal n, tangent tan), in surface-plane metres
  const stroke = (p: THREE.Vector3, n: THREE.Vector3, tan: THREE.Vector3, a0: number, c0: number, a1: number, c1: number, w: number, th: number, lift: number) => {
    const bin = V().crossVectors(n, tan);
    const A = p.clone().addScaledVector(tan, a0).addScaledVector(bin, c0);
    const B = p.clone().addScaledVector(tan, a1).addScaledVector(bin, c1);
    const mid = A.clone().add(B).multiplyScalar(0.5).addScaledVector(n, lift);
    const dir = B.clone().sub(A);
    const len = dir.length();
    dir.normalize();
    return piece(new THREE.BoxGeometry(w, th, len + w * 0.6), mid, n, dir);
  };

  const RUNES: number[][][] = [
    [[-1, 0, 1, 0], [0.1, 0, 1, 0.7], [-0.5, 0, 0.3, 0.7]],
    [[-1, 0, 1, 0], [0.1, 0, 1, 0.65], [0.1, 0, 1, -0.65]],
    [[-1, -0.7, 1, 0.7], [-1, 0.7, 1, -0.7], [0, -0.9, 0, 0.9]],
    [[-1, 0, 0, 0.7], [0, 0.7, 1, 0], [1, 0, 0, -0.7], [0, -0.7, -1, 0]],
  ];
  const rune = (bone: any, sp: { p: THREE.Vector3; n: THREE.Vector3; tan: THREE.Vector3 }, size: number, v: number) => {
    for (const s of RUNES[v % RUNES.length])
      add(bone, P.runeBlue, stroke(sp.p, sp.n, sp.tan, s[0] * size, s[1] * size, s[2] * size, s[3] * size, 0.02, 0.014, 0.008), 1.5);
  };

  const slash = (bone: any, color: string, sp: { p: THREE.Vector3; n: THREE.Vector3; tan: THREE.Vector3 }, phi: number, len: number, w: number) => {
    const c = Math.cos(phi) * len * 0.5;
    const s = Math.sin(phi) * len * 0.5;
    add(bone, color, stroke(sp.p, sp.n, sp.tan, -c, -s, c, s, w, 0.016, 0.004));
  };
  const stitches = (bone: any, sp: { p: THREE.Vector3; n: THREE.Vector3; tan: THREE.Vector3 }, phi: number, count: number, spacing: number) => {
    const d = [Math.cos(phi), Math.sin(phi)];
    const pp = [-Math.sin(phi), Math.cos(phi)];
    for (let k = 0; k < count; k++) {
      const o = (k - (count - 1) / 2) * spacing;
      const ca = d[0] * o;
      const cc = d[1] * o;
      add(bone, P.bone, stroke(sp.p, sp.n, sp.tan, ca - pp[0] * 0.05, cc - pp[1] * 0.05, ca + pp[0] * 0.05, cc + pp[1] * 0.05, 0.016, 0.024, 0.005));
    }
  };

  // ---------- feet ----------
  const foot = (j3: any, fx: number, fz: number) => {
    add(j3, P.hideDark, piece(new THREE.SphereGeometry(1, 8, 6).scale(0.27, 0.23, 0.31), V(fx, 0.21, fz + 0.02), Y));
    for (const dx of [-1, 0, 1]) {
      const dirT = V(dx * 0.4, 0, 1).normalize();
      const start = V(fx + dx * 0.2, 0.14, fz + 0.02);
      const len = dx === 0 ? 0.74 : 0.62;
      const mid = start.clone().addScaledVector(dirT, len / 2);
      const tip = start.clone().addScaledVector(dirT, len);
      add(j3, P.hideDark, piece(new THREE.CylinderGeometry(0.11, 0.15, len, 6), mid, dirT));
      add(j3, P.hideMid, piece(new THREE.SphereGeometry(0.125, 7, 5), V(tip.x, 0.13, tip.z), Y));
      for (const f of [0.22, 0.45]) {
        const pos = start.clone().addScaledVector(dirT, len * f * 1.3);
        pos.y = 0.255;
        add(j3, P.hideLight, piece(new THREE.BoxGeometry(0.14, 0.04, 0.12), pos, dirT, undefined, "z"));
      }
      // iron toe ring
      add(j3, P.iron, piece(new THREE.CylinderGeometry(0.152, 0.152, 0.05, 6), start.clone().addScaledVector(dirT, len * 0.58), dirT));
      // claw
      const cd = V(dirT.x, -0.28, dirT.z).normalize();
      const cb = tip.clone().addScaledVector(dirT, 0.09);
      cb.y = 0.14;
      add(j3, P.claw, piece(new THREE.ConeGeometry(0.07, 0.3, 6), cb.clone().addScaledVector(cd, 0.15), cd));
    }
    // heel spur
    add(j3, P.claw, piece(new THREE.ConeGeometry(0.05, 0.22, 5), V(fx, 0.32, fz - 0.28), V(0, 0.35, -1).normalize()));
    // mud clumps
    for (let i = 0; i < 5; i++) {
      const sc = 0.08 + rnd() * 0.05;
      add(j3, MUD, piece(new THREE.SphereGeometry(1, 6, 4).scale(sc * 1.3, sc * 0.55, sc), V(fx + (rnd() - 0.5) * 0.85, sc * 0.55 - 0.01, fz + 0.05 + rnd() * 0.6), Y));
    }
  };

  // ---------- legs ----------
  const LEG_R = [[0, 0.4], [0.2, 0.45], [0.5, 0.34], [0.78, 0.26], [1, 0.22]];

  const leg = (tag: string, s: number, front: boolean) => {
    const j1 = J[`leg${tag}1`];
    const j2 = J[`leg${tag}2`];
    const j3 = J[`leg${tag}3`];
    const hip = j1.at.clone();
    const knee = j2.at.clone();
    const ankle = j3.at.clone();
    const path = catmull([hip, knee, ankle]);
    const rad = (t: number) => interp(LEG_R, t);
    const boneAt = (t: number) => (t < 0.45 ? j1 : t < 0.8 ? j2 : j3);
    const outAng = -s * 90;

    const sw = b.sweep(path, rad, {
      bone: [j1, j2, j3],
      color: P.hideMid,
      bands: [[0.5, P.hideMid], [0.86, P.hideDark], [1, MUD]],
      sides: 8,
      smooth: false,
    });
    const S = (t: number, a: number) => {
      const q = sw.at(t, a);
      return { p: q.at.clone(), n: q.n.clone(), tan: q.tangent.clone() };
    };

    // haunch / shoulder muscle
    const hc = hip.clone().add(V(s * 0.12, -0.12, front ? 0.02 : -0.1));
    add(j1, P.hideMid, piece(new THREE.SphereGeometry(1, 10, 8).scale(0.5, 0.55, 0.62), hc, Y));
    // ridge scales over the haunch
    for (let i = 0; i < 4; i++) {
      const a = 0.4 + i * 0.35;
      const d = V(s * Math.cos(a) * 0.6, Math.sin(a) * 0.9, front ? 0.3 : -0.3).normalize();
      add(j1, P.hideLight, piece(new THREE.BoxGeometry(0.2, 0.04, 0.16), hc.clone().add(V(d.x * 0.5, d.y * 0.55, d.z * 0.6)), d, V(0, 0, 1)));
    }

    // scale bands
    for (const t of [0.4, 0.6, 0.67, 0.74, 0.8])
      add(boneAt(t), P.hideDark, piece(new THREE.TorusGeometry(rad(t) * 1.08, 0.03, 4, 10), path.at(t), path.tangentAt(t), undefined, "z"));
    // front shin plates
    for (const t of [0.58, 0.68, 0.78])
      for (const a of [-42, 0, 42]) {
        const sp = S(t, a);
        add(boneAt(t), P.hideLight, piece(new THREE.BoxGeometry(rad(t) * 0.6, 0.035, 0.13), sp.p.clone().addScaledVector(sp.n, -0.012), sp.n, sp.tan));
      }

    // knee guard
    const rk = rad(0.5);
    const d = V(s * (front ? 0.4 : 0.3), 0.05, 1).normalize();
    const c = knee.clone().addScaledVector(d, rk * 0.95);
    add(j2, P.iron, piece(new THREE.CylinderGeometry(0.2, 0.25, 0.1, 6), c, d));
    add(j2, P.ironLight, piece(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 6), c.clone().addScaledVector(d, -0.04), d));
    const rv = ringVec(d);
    for (let k = 0; k < 6; k++) {
      const v = rv((k * Math.PI * 2) / 6);
      add(j2, P.ironLight, piece(new THREE.SphereGeometry(0.03, 5, 4), c.clone().addScaledVector(d, 0.055).addScaledVector(v, 0.19), d));
    }
    add(j2, P.bone, piece(new THREE.ConeGeometry(0.07, 0.28, 6), c.clone().addScaledVector(d, 0.17), d));
    // bone spur at the back of the elbow / hock
    const tt = front ? 0.5 : 0.76;
    const sd = V(s * 0.3, 0.3, -1).normalize();
    add(j2, P.bone, piece(new THREE.ConeGeometry(0.06, 0.34, 5), path.at(tt).add(V(0, 0, -rad(tt) * 0.85)).addScaledVector(sd, 0.14), sd));

    // cuffs
    band(j3, P.iron, P.ironLight, path.at(0.88), path.tangentAt(0.88), rad(0.88) * 1.15, 0.13);
    band(j1, P.iron, P.ironLight, path.at(0.3), path.tangentAt(0.3), rad(0.3) * 1.12, 0.12);

    // swagged chain below the thigh cuff
    const N = 9;
    const cp: { p: THREE.Vector3; n: THREE.Vector3 }[] = [];
    for (let i = 0; i <= N; i++) {
      const sp = S(0.32 + 0.08 * Math.sin((Math.PI * i) / N), -72 + (144 * i) / N);
      cp.push({ p: sp.p.addScaledVector(sp.n, 0.024), n: sp.n });
    }
    for (let i = 0; i < N; i++) {
      const tan = cp[i + 1].p.clone().sub(cp[i].p).normalize();
      const up = i % 2 ? cp[i].n.clone() : V().crossVectors(tan, cp[i].n).normalize();
      const pos = cp[i].p.clone().add(cp[i + 1].p).multiplyScalar(0.5);
      add(j1, P.chain, piece(new THREE.TorusGeometry(0.04, 0.011, 4, 8).scale(0.8, 1.35, 1), pos, tan, up));
    }

    // scars (stitched) on the outer thigh
    for (let i = 0; i < 3; i++) {
      const t = 0.37 + 0.035 * i;
      slash(boneAt(t), P.scar, S(t, outAng + (i - 1) * 16), 0.6, 0.34, 0.03);
    }
    stitches(j1, S(0.405, outAng), 0.6, 4, 0.07);

    // glowing rune on the outer shin
    rune(j2, S(0.7, outAng), 0.085, tag.charCodeAt(0) + tag.charCodeAt(1));

    // embedded weapon fragments
    if (tag === "BL") {
      const sd2 = V(s * 0.75, 0.55, -0.35).normalize();
      const base = hc.clone().add(V(sd2.x * 0.45, sd2.y * 0.5, sd2.z * 0.55));
      add(j1, P.wood, piece(new THREE.CylinderGeometry(0.03, 0.036, 0.7, 5), base.clone().addScaledVector(sd2, 0.28), sd2));
      add(j1, P.wood, piece(new THREE.ConeGeometry(0.032, 0.13, 4), base.clone().addScaledVector(sd2, 0.69), sd2));
      for (const f of [0.15, 0.24]) add(j1, P.rust, piece(new THREE.CylinderGeometry(0.047, 0.047, 0.05, 6), base.clone().addScaledVector(sd2, f), sd2));
      add(j1, P.iron, piece(new THREE.ConeGeometry(0.07, 0.24, 4), base.clone().addScaledVector(sd2, -0.02), sd2.clone().negate()));
    }
    if (tag === "FR") {
      const sd2 = V(s * 0.7, 0.5, 0.55).normalize();
      const base = hc.clone().add(V(sd2.x * 0.45, sd2.y * 0.5, sd2.z * 0.55));
      add(j1, P.wood, piece(new THREE.CylinderGeometry(0.014, 0.016, 0.55, 5), base.clone().addScaledVector(sd2, 0.22), sd2));
      for (let k = 0; k < 3; k++) {
        const fd = ringVec(sd2)((k * Math.PI * 2) / 3);
        add(j1, P.scar, piece(new THREE.BoxGeometry(0.01, 0.1, 0.05), base.clone().addScaledVector(sd2, 0.46).addScaledVector(fd, 0.035), fd, sd2));
      }
    }

    foot(j3, ankle.x, ankle.z);
  };

  leg("FL", 1, true);
  leg("FR", -1, true);
  leg("BL", 1, false);
  leg("BR", -1, false);

  // ---------- tail ----------
  const tpts = [
    V(M.tailBase[0], M.tailBase[1] - 0.1, M.tailBase[2] + 0.3),
    J.tail1.at.clone(),
    J.tail2.at.clone(),
    J.tail3.at.clone(),
    V(0, 0.98, -5.9),
  ];
  const tpath = catmull(tpts);
  const TAIL_R = [[0, 0.5], [0.2, 0.46], [0.5, 0.34], [0.8, 0.24], [1, 0.17]];
  const trad = (t: number) => interp(TAIL_R, t);
  const tbone = (t: number) => (t < 0.36 ? J.tail1 : t < 0.7 ? J.tail2 : t < 0.97 ? J.tail3 : J.tail4);
  const tail = b.sweep(tpath, trad, {
    bone: [J.tail1, J.tail2, J.tail3, J.tail4],
    color: P.hideMid,
    sectors: [[-50, 50, P.hideLight], [125, 235, P.belly]],
    sides: 10,
    smooth: false,
  });
  const TS = (t: number, a: number) => {
    const q = tail.at(t, a);
    return { p: q.at.clone(), n: q.n.clone(), tan: q.tangent.clone() };
  };

  // dorsal bone spikes (big) and side spikes (small)
  for (let i = 0; i < 12; i++) {
    const t = 0.12 + i * 0.07;
    const sp = TS(t, 0);
    const d = sp.n.clone().addScaledVector(sp.tan, 0.6).normalize();
    const len = 0.4 - 0.22 * t;
    add(tbone(t), P.bone, piece(new THREE.ConeGeometry(trad(t) * 0.3, len, 6), sp.p.clone().addScaledVector(sp.n, -0.03).addScaledVector(d, len / 2), d));
    if (i % 2 === 0)
      for (const a of [-60, 60]) {
        const sq = TS(t + 0.03, a);
        const dd = sq.n.clone().addScaledVector(sq.tan, 0.5).normalize();
        add(tbone(t), P.horn, piece(new THREE.ConeGeometry(trad(t) * 0.17, len * 0.55, 5), sq.p.clone().addScaledVector(sq.n, -0.02).addScaledVector(dd, len * 0.27), dd));
      }
  }
  // scale plates on the flanks, belly bands
  for (let i = 0; i < 14; i++) {
    const t = 0.1 + i * 0.062;
    for (const a of [-38, 38]) {
      const sp = TS(t, a);
      add(tbone(t), P.hideDark, piece(new THREE.BoxGeometry(trad(t) * 0.7, 0.04, 0.2), sp.p.clone().addScaledVector(sp.n, -0.015), sp.n, sp.tan));
    }
    for (const a of [-82, 82]) {
      const sp = TS(t + 0.03, a);
      add(tbone(t), P.hideLight, piece(new THREE.BoxGeometry(trad(t) * 0.5, 0.035, 0.14), sp.p.clone().addScaledVector(sp.n, -0.012), sp.n, sp.tan));
    }
    const bp = TS(t, 180);
    add(tbone(t), P.hideMid, piece(new THREE.BoxGeometry(trad(t) * 1.2, 0.02, 0.025), bp.p.clone().addScaledVector(bp.n, -0.004), bp.n, bp.tan));
  }

  // iron bands
  band(J.tail2, P.iron, P.ironLight, tpath.at(0.5), tpath.tangentAt(0.5), trad(0.5) * 1.13, 0.24, 10);
  band(J.tail2, P.iron, P.ironLight, tpath.at(0.6), tpath.tangentAt(0.6), trad(0.6) * 1.1, 0.1, 10);

  // scarred patch on one flank
  {
    const sp = TS(0.3, 90);
    add(J.tail1, P.scar, piece(new THREE.SphereGeometry(1, 7, 5).scale(0.17, 0.05, 0.3), sp.p.clone().addScaledVector(sp.n, -0.015), sp.n, sp.tan));
    for (let k = 0; k < 3; k++) slash(J.tail1, P.rust, { p: sp.p.clone().addScaledVector(sp.n, 0.02), n: sp.n, tan: sp.tan }, 0.5 + k * 0.5, 0.36, 0.028);
    stitches(J.tail1, { p: sp.p.clone().addScaledVector(sp.n, 0.02), n: sp.n, tan: sp.tan }, 0.5, 4, 0.06);
  }
  // runes on the other flank and the top
  rune(J.tail1, TS(0.24, -90), 0.1, 1);
  rune(J.tail2, TS(0.42, -90), 0.1, 2);
  rune(J.tail3, TS(0.78, 90), 0.08, 3);

  // ---------- club tip ----------
  const C = V(0, 0.98, -5.72);
  const cb = J.tail4;
  add(cb, P.iron, piece(new THREE.SphereGeometry(0.3, 8, 6), C, Y));
  for (const z of [-0.11, 0.11]) {
    const R = Math.sqrt(0.09 - z * z) + 0.025;
    add(cb, P.ironLight, piece(new THREE.CylinderGeometry(R, R, 0.07, 8), C.clone().add(V(0, 0, z)), V(0, 0, 1)));
  }
  const NS = 24;
  for (let i = 0; i < NS; i++) {
    const y = 1 - (2 * (i + 0.5)) / NS;
    const r = Math.sqrt(1 - y * y);
    const phi = i * 2.399963;
    const d = V(Math.cos(phi) * r, y, Math.sin(phi) * r);
    if (d.z > 0.5) continue;
    add(cb, P.bone, piece(new THREE.ConeGeometry(0.07, 0.2, 6), C.clone().addScaledVector(d, 0.37), d));
    add(cb, P.iron, piece(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 6), C.clone().addScaledVector(d, 0.27), d));
  }

  flush();
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { aim, catmull, frame, offset, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildTorso({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const R = rng(7);
  const INK = "#1b221e";
  const BELLY_SEAM = "#7a6e4e";
  const BELLY_HI = "#c2b58b";
  const SPLINTER = "#9a7a52";
  const DARKIRON = "#2b3139";
  const boneAt = (z: number): any => (z > 0.3 ? J.chest : J.hips);

  // ---------------------------------------------------------------- batching helpers
  type Item = { color: string; bone: any; geos: THREE.BufferGeometry[] };
  const bag = new Map<string, Item>();
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    bone: any,
    pos: THREE.Vector3,
    quat?: THREE.Quaternion,
    scale?: number[],
  ) => {
    const g = geo.clone();
    const sc = scale ? V(scale[0], scale[1], scale[2]) : V(1, 1, 1);
    g.applyMatrix4(new THREE.Matrix4().compose(pos, quat ?? new THREE.Quaternion(), sc));
    const key = color + "|" + bone.name;
    let it = bag.get(key);
    if (!it) bag.set(key, (it = { color, bone, geos: [] }));
    it.geos.push(g);
  };
  const based = (g: THREE.BufferGeometry) => {
    g.computeBoundingBox();
    g.translate(0, -g.boundingBox!.min.y, 0);
    return g;
  };
  const seat = (
    hit: { at: THREE.Vector3; n: THREE.Vector3 },
    geo: THREE.BufferGeometry,
    color: string,
    o: { embed?: number; scale?: number[]; lift?: number; bone?: any; flow?: number[]; spin?: number } = {},
  ) => {
    const sc = o.scale ?? [1, 1, 1];
    geo.computeBoundingBox();
    const h = (geo.boundingBox!.max.y - geo.boundingBox!.min.y) * sc[1];
    const n = hit.n.clone().normalize();
    const q = aim(n, o.flow ?? [0, 0, 1]);
    if (o.spin) q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, o.spin * (Math.PI / 180)));
    const pos = hit.at.clone().addScaledVector(n, (o.lift ?? 0) - (o.embed ?? 0.25) * h);
    put(geo, color, o.bone ?? boneAt(hit.at.z), pos, q, sc);
  };

  // unit geometries
  const SPH = new THREE.SphereGeometry(1, 5, 3);
  const SPH8 = new THREE.SphereGeometry(1, 8, 6);
  const CYL5 = new THREE.CylinderGeometry(1, 1, 1, 5, 1);
  const CONE5 = new THREE.ConeGeometry(1, 1, 5, 1);
  const BOX = based(new THREE.BoxGeometry(1, 1, 1));
  const BOXC = new THREE.BoxGeometry(1, 1, 1);
  const SCALE = based(new THREE.SphereGeometry(1, 5, 3));
  const DOME = based(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2));
  const SPIKE = based(new THREE.ConeGeometry(1, 1, 6, 1));
  const BASE6 = based(new THREE.CylinderGeometry(1, 1.25, 0.1, 6, 1));
  const DISC = based(new THREE.CylinderGeometry(1, 1, 0.05, 7, 1));
  const LINK_A = new THREE.TorusGeometry(0.07, 0.02, 4, 8).scale(0.7, 1.2, 1);
  const LINK_B = LINK_A.clone().rotateY(Math.PI / 2);

  const rodB = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, bone: any, ends = true) => {
    const d = c.clone().sub(a);
    const len = d.length();
    if (len < 1e-5) return;
    const q = aim(d.clone().normalize());
    put(CYL5, color, bone, a.clone().add(c).multiplyScalar(0.5), q, [r, len, r]);
    if (ends) {
      put(SPH, color, bone, a, undefined, [r, r, r]);
      put(SPH, color, bone, c, undefined, [r, r, r]);
    }
  };

  // ---------------------------------------------------------------- body lofts
  const st = [
    { z: -2.6, y: 1.95, w: 1.5, h: 1.3 },
    { z: -2.0, y: 2.0, w: 2.5, h: 1.75 },
    { z: -1.0, y: 2.05, w: 3.0, h: 1.9 },
    { z: 0.2, y: 2.1, w: 3.2, h: 1.95 },
    { z: 1.3, y: 2.12, w: 3.2, h: 2.0 },
    { z: 2.0, y: 2.1, w: 2.8, h: 1.85 },
    { z: 2.45, y: 2.0, w: 1.9, h: 1.5 },
  ];
  const bodyBones = [J.hips, J.chest];
  const body = b.loft(
    st.map((s) => ({ at: [0, s.y, s.z], w: s.w, h: s.h })),
    { bone: bodyBones, color: P.hideDark, name: "torsoBody" },
  );
  const dorsalSt = [
    { at: [0, 2.2, -2.35], w: 0.3, h: 0.7 },
    ...st.slice(1, 5).map((s) => ({ at: [0, s.y + 0.35, s.z], w: s.w * 0.6, h: s.h * 0.8 })),
    { at: [0, 2.6, 1.85], w: 0.6, h: 1.2 },
  ];
  const dorsal = b.loft(dorsalSt, { bone: bodyBones, color: P.hideLight, name: "torsoDorsal" });
  const bellySt = [
    { at: [0, 1.75, -2.3], w: 0.5, h: 0.7 },
    ...st.slice(1, 6).map((s) => ({ at: [0, s.y - 0.35, s.z], w: s.w * 0.62, h: s.h * 0.8 })),
    { at: [0, 1.75, 2.25], w: 0.5, h: 0.9 },
  ];
  const belly = b.loft(bellySt, { bone: bodyBones, color: BELLY_SEAM, name: "torsoBelly" });

  const sBody: any = b.surface(body);
  const sTop: any = b.surface([body, dorsal]);
  const sAll: any = b.surface([body, dorsal, belly]);
  const pt = (s: any, o: number[], d: number[], lift = 0.02): THREE.Vector3 | null => {
    const h = s.ray(o, d);
    return h ? h.at.clone().addScaledVector(h.n, lift) : null;
  };

  // ---------------------------------------------------------------- haunches, humps
  for (const s of [1, -1]) {
    put(SPH8, P.hideMid, J.hips, V(s * 1.22, 1.7, -1.4), undefined, [0.55, 0.7, 0.8]);
    put(SPH8, P.hideMid, J.chest, V(s * 1.25, 1.75, 1.5), undefined, [0.5, 0.65, 0.68]);
  }
  for (const key of ["neckBaseC", "neckBaseIL", "neckBaseIR", "neckBaseOL", "neckBaseOR"]) {
    const m = M[key];
    const c = V(m[0], m[1] - 0.28, m[2]);
    const rr = key === "neckBaseC" ? [0.62, 0.5, 0.6] : [0.5, 0.42, 0.52];
    put(SPH8, P.hideMid, J.chest, c, undefined, rr);
    for (let k = 0; k < 6; k++) {
      const az = k * 60 * (Math.PI / 180) + 0.3;
      const el = 38 * (Math.PI / 180);
      const n = V(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
      const pos = c.clone().add(V(n.x * rr[0], n.y * rr[1], n.z * rr[2]));
      put(SPH, P.hideLight, J.chest, pos, aim(n), [0.17, 0.06, 0.13]);
    }
  }

  // ---------------------------------------------------------------- flank ribs
  for (const s of [1, -1]) {
    for (const z of [1.75, 0.65, -0.45, -1.55]) {
      const pts: THREE.Vector3[] = [];
      for (const y of [2.7, 2.4, 2.1, 1.8, 1.5]) {
        const p = pt(sBody, [s * 4, y, z + (2.7 - y) * 0.12], [-s, 0, 0], 0.0);
        if (p) pts.push(p);
      }
      if (pts.length < 3) continue;
      const path = sBody.drape(catmull(pts), { lift: 0.0 });
      b.sweep(path, (t: number) => 0.025 + 0.055 * Math.sin(Math.PI * t), {
        color: P.hideMid,
        sides: 5,
        name: "torsoRib",
      });
    }
  }

  // ---------------------------------------------------------------- belly plates
  for (let z = -2.2; z <= 2.01; z += 0.3) {
    const f = 1 - 0.35 * Math.pow((z + 0.2) / 2.2, 2);
    for (const x of [-0.52, 0, 0.52]) {
      const h = sAll.ray([x * f, 0.2, z], [0, 1, 0]);
      if (!h) continue;
      seat(h, BOX, BELLY_HI, { embed: 0.35, scale: [0.5 * f, 0.08, 0.25], bone: boneAt(z) });
    }
  }
  // chest scute trim along belly centre
  for (let z = -2.0; z <= 1.9; z += 0.6) {
    const h = sAll.ray([0, 0.2, z], [0, 1, 0]);
    if (h) seat(h, SPIKE, P.bone, { embed: 0.1, scale: [0.05, 0.07, 0.05] } as any && h, { scale: [0.05, 0.07, 0.05] });
  }

  // ---------------------------------------------------------------- hide scales
  const nearRune = (h: any) =>
    Math.abs(h.at.x) > 1.2 &&
    Math.abs(h.at.y - 2.05) < 0.45 &&
    [1.2, 0.1, -1.0].some((rz) => Math.abs(h.at.z - rz) < 0.4);
  const hits = sTop.scatter(54, {
    rng: rng(11),
    minDist: 0.27,
    filter: (h: any) => h.n.y > -0.25 && !nearRune(h) && h.at.y > 1.3,
  });
  for (const h of hits) {
    const r = R();
    const c = r < 0.4 ? P.hideMid : r < 0.75 ? P.hideLight : P.hideDark;
    const s = 0.7 + R() * 0.6;
    seat(h, SCALE, c, { embed: 0.3, scale: [0.19 * s, 0.07, 0.14 * s], spin: R() * 60 });
  }

  // ---------------------------------------------------------------- spine spikes
  const zs = [-2.3, -1.95, -1.6, -1.25, -0.9, -0.55, -0.2, 0.15, 0.5, 0.85, 1.15];
  zs.forEach((z, i) => {
    const h = sTop.ray([0, 6, z], [0, -1, 0]);
    if (!h) return;
    const hgt = 0.35 + 0.32 * (1 - Math.abs(i - 6) / 6);
    const r = 0.08 + 0.05 * (1 - Math.abs(i - 6) / 6);
    const tn = h.n.clone().add(V(0, 0, -0.4)).normalize();
    seat(h, BASE6, P.horn, { embed: 0.3, scale: [r * 1.6, 1, r * 1.6] });
    seat({ at: h.at, n: tn }, SPIKE, P.bone, { embed: 0.05, lift: 0.04, scale: [r, hgt, r] });
  });
  for (const s of [1, -1]) {
    [-1.9, -1.2, -0.5, 0.2, 0.9].forEach((z, i) => {
      const h = sTop.ray([s * 0.78, 6, z], [0, -1, 0]);
      if (!h) return;
      const hgt = 0.2 + 0.05 * (i % 2);
      const tn = h.n.clone().add(V(s * 0.2, 0, -0.35)).normalize();
      seat({ at: h.at, n: tn }, SPIKE, P.bone, { embed: 0.15, scale: [0.06, hgt, 0.06] });
    });
  }

  // ---------------------------------------------------------------- iron back plates
  for (const z of [-1.9, -1.1, -0.3, 0.5]) {
    const h = sTop.ray([0, 6, z], [0, -1, 0]);
    if (!h) continue;
    seat(h, BOX, P.iron, { embed: 0.3, scale: [1.0, 0.09, 0.62], bone: boneAt(z) });
    const h2 = sTop.ray([0, 6, z + 0.3], [0, -1, 0]);
    if (h2) seat(h2, BOX, P.ironLight, { embed: 0.0, lift: 0.0, scale: [0.95, 0.035, 0.05], bone: boneAt(z) });
    const h3 = sTop.ray([0, 6, z - 0.3], [0, -1, 0]);
    if (h3) seat(h3, BOX, P.ironLight, { embed: 0.0, scale: [0.95, 0.035, 0.05], bone: boneAt(z) });
    for (const dx of [-0.38, 0.38])
      for (const dz of [-0.2, 0.2]) {
        const p = pt(sTop, [dx, 6, z + dz], [0, -1, 0], 0.045);
        if (p) put(SPH, P.ironLight, boneAt(z), p, undefined, [0.04, 0.035, 0.04]);
      }
    // rust drip
    const rp = pt(sTop, [0.3, 6, z - 0.05], [0, -1, 0], 0.05);
    if (rp) put(SPH, P.rust, boneAt(z), rp, undefined, [0.09, 0.015, 0.06]);
  }

  // ---------------------------------------------------------------- pauldrons
  for (const s of [1, -1]) {
    const dir = V(-s * 0.55, -1, 0).normalize();
    const h = sTop.ray([s * 2.6, 4.2, 0.8], [dir.x, dir.y, dir.z]);
    if (!h) continue;
    const n = h.n.clone().normalize();
    const layers = [
      { r: 0.62, c: P.iron, lift: 0 },
      { r: 0.5, c: P.ironLight, lift: 0.09 },
      { r: 0.38, c: P.iron, lift: 0.18 },
      { r: 0.24, c: P.ironLight, lift: 0.26 },
    ];
    for (const l of layers)
      seat({ at: h.at.clone().addScaledVector(n, l.lift), n }, DOME, l.c, {
        embed: 0.1,
        bone: J.chest,
        scale: [l.r, l.r * 0.55, l.r * 1.15],
      });
    seat({ at: h.at.clone().addScaledVector(n, 0.3), n }, SPIKE, P.bone, { embed: 0.1, bone: J.chest, scale: [0.07, 0.34, 0.07] });
    const e1 = V(0, 0, 1);
    e1.addScaledVector(n, -e1.dot(n)).normalize();
    const e2 = n.clone().cross(e1);
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      const p = h.at
        .clone()
        .addScaledVector(n, 0.07)
        .addScaledVector(e1, Math.cos(a) * 0.62 * 1.12)
        .addScaledVector(e2, Math.sin(a) * 0.62 * 0.98);
      put(SPH, P.ironLight, J.chest, p, undefined, [0.045, 0.04, 0.045]);
    }
    for (const a of [0.8, 3.6]) {
      const p = h.at
        .clone()
        .addScaledVector(n, 0.12)
        .addScaledVector(e1, Math.cos(a) * 0.4)
        .addScaledVector(e2, Math.sin(a) * 0.4);
      put(SPH, P.rust, J.chest, p, aim(n), [0.1, 0.02, 0.07]);
    }
    // hanging strap links off pauldron front
    for (let k = 0; k < 3; k++) {
      const p = h.at.clone().addScaledVector(e1, 0.7 + k * 0.1).addScaledVector(n, 0.02 - k * 0.07);
      put(k % 2 ? LINK_A : LINK_B, P.chain, J.chest, p, aim(e1, n));
    }
  }

  // ---------------------------------------------------------------- chains across chest
  const chestHits: any[] = [];
  for (const s of [1, -1]) {
    const raw = [
      sBody.ray([s * 1.3, 6, 0.7], [0, -1, 0]),
      sBody.ray([s * 1.0, 2.75, 6], [0, 0, -1]),
      sBody.ray([s * 0.35, 2.3, 6], [0, 0, -1]),
      sBody.ray([-s * 0.35, 1.75, 6], [0, 0, -1]),
      sBody.ray([-s * 1.1, 1.4, 6], [0, 0, -1]),
      sBody.ray([-s * 5, 1.65, 0.9], [s, 0, 0]),
    ].filter(Boolean);
    if (raw.length < 4) continue;
    const rough = catmull(raw.map((h: any) => offset(h.at, h.n, 0.05)));
    const path = sBody.drape(rough, { lift: 0.045 });
    const count = 22;
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const p = path.at(t);
      const T = path.tangentAt(t);
      const nn = sBody.nearest(p).n;
      put(i % 2 ? LINK_A : LINK_B, P.chain, boneAt(p.z), p, aim(T, nn));
    }
    chestHits.push(path);
  }
  // medallion at crossing
  {
    const h = sBody.ray([0, 2.05, 6], [0, 0, -1]);
    if (h) {
      const n = h.n.clone().normalize();
      seat(h, DISC, P.iron, { embed: 0.2, bone: J.chest, scale: [0.28, 1.2, 0.28] });
      put(new THREE.TorusGeometry(0.25, 0.035, 4, 10), P.ironLight, J.chest, h.at.clone().addScaledVector(n, 0.05), aim(n, UP, "z"));
      put(SPH, P.runeBlue, J.chest, h.at.clone().addScaledVector(n, 0.07), aim(n), [0.12, 0.06, 0.12]);
      const e1 = V(0, 1, 0);
      e1.addScaledVector(n, -e1.dot(n)).normalize();
      const e2 = n.clone().cross(e1);
      for (let k = 0; k < 4; k++) {
        const a = k * (Math.PI / 2) + Math.PI / 4;
        const d = e1.clone().multiplyScalar(Math.cos(a)).addScaledVector(e2, Math.sin(a));
        const p = h.at.clone().addScaledVector(n, 0.05).addScaledVector(d, 0.3);
        put(CONE5, P.ironLight, J.chest, p.addScaledVector(d, 0.03), aim(d.clone().add(n.clone().multiplyScalar(0.3)).normalize()), [0.05, 0.14, 0.05]);
      }
    }
  }

  // ---------------------------------------------------------------- girth bands
  const hipLoop = sBody.loop(frame([0, 1.85, -1.4], [0, 0, 1]), { lift: 0.08 });
  b.sweep(hipLoop, 0.075, { color: P.iron, sides: 6, name: "torsoHipBand" });
  b.along(hipLoop, 16, (at: any) => {
    put(SPH, P.ironLight, boneAt(at.at.z), at.at.clone(), undefined, [0.085, 0.085, 0.085]);
  });
  const midLoop = sBody.loop(frame([0, 2.1, 0.55], [0, 0, 1]), { lift: 0.08 });
  b.sweep(midLoop, 0.06, { color: P.iron, sides: 6, name: "torsoGirth" });
  b.along(midLoop, 14, (at: any) => {
    put(SPH, P.rust, boneAt(at.at.z), at.at.clone(), undefined, [0.07, 0.07, 0.07]);
  });

  // ---------------------------------------------------------------- runes (glowing)
  const GLYPHS: number[][][] = [
    [[0, -0.28, 0, 0.28], [0, 0.05, 0.17, 0.2], [0, 0.28, 0.17, 0.14]],
    [[0, -0.28, 0, 0.28], [0, 0.12, 0.16, 0], [0.16, 0, 0, -0.12]],
    [[0, -0.28, 0, 0.28], [0, 0, -0.17, 0.2], [0, 0, 0.17, 0.2]],
    [[0.12, 0.28, -0.12, 0.05], [-0.12, 0.05, 0.12, -0.05], [0.12, -0.05, -0.12, -0.28]],
    [[0, -0.28, 0, 0.28], [0, 0.28, 0.17, 0.12], [0, 0.1, 0.17, -0.06]],
    [[0, 0.28, 0.16, 0.08], [0.16, 0.08, -0.12, -0.12], [-0.12, -0.12, 0.16, -0.28], [0, 0.28, -0.14, 0.1]],
  ];
  const rune = (s: number, z0: number, y0: number, g: number) => {
    const bn = boneAt(z0);
    const P2 = (u: number, v: number, lift: number) => pt(sBody, [s * 4, y0 + v, z0 - s * u], [-s, 0, 0], lift);
    for (const [u0, v0, u1, v1] of GLYPHS[g]) {
      const a = P2(u0, v0, 0.012);
      const c = P2(u1, v1, 0.012);
      if (a && c) rodB(a, c, 0.042, INK, bn);
      const a2 = P2(u0, v0, 0.035);
      const c2 = P2(u1, v1, 0.035);
      if (a2 && c2) rodB(a2, c2, 0.02, P.runeBlue, bn);
    }
  };
  for (const s of [1, -1]) {
    rune(s, 1.2, 2.0, s > 0 ? 0 : 3);
    rune(s, 0.1, 2.1, s > 0 ? 2 : 5);
    rune(s, -1.0, 2.0, s > 0 ? 4 : 1);
  }
  // runic marks on the dorsal saddle
  for (const z of [-1.5, -0.7]) {
    const p = pt(sTop, [0.62, 6, z], [0, -1, 0], 0.03);
    const q = pt(sTop, [0.62, 6, z + 0.22], [0, -1, 0], 0.03);
    if (p && q) rodB(p, q, 0.02, P.runeBlue, boneAt(z));
    const p2 = pt(sTop, [-0.62, 6, z], [0, -1, 0], 0.03);
    const q2 = pt(sTop, [-0.62, 6, z + 0.22], [0, -1, 0], 0.03);
    if (p2 && q2) rodB(p2, q2, 0.02, P.runeBlue, boneAt(z));
  }

  // ---------------------------------------------------------------- scars
  const slash = (s: any, a: number[], c: number[], dir: number[], w: number, stitches = true) => {
    const pa = pt(s, a, dir, 0.012);
    const pb = pt(s, c, dir, 0.012);
    if (!pa || !pb) return;
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    const d = pb.clone().sub(pa);
    const L = d.length();
    const dn = d.clone().normalize();
    const bn = boneAt(mid.z);
    put(CONE5, P.scar, bn, mid.clone().addScaledVector(dn, L / 4), aim(dn), [w, L / 2, w * 0.6]);
    put(CONE5, P.scar, bn, mid.clone().addScaledVector(dn, -L / 4), aim(dn.clone().negate()), [w, L / 2, w * 0.6]);
    if (stitches) {
      const side = dn.clone().cross(V(dir[0], dir[1], dir[2])).normalize();
      for (let k = -1; k <= 1; k++) {
        const c0 = mid.clone().addScaledVector(dn, k * L * 0.22);
        rodB(c0.clone().addScaledVector(side, -0.06), c0.clone().addScaledVector(side, 0.06), 0.008, P.bone, bn, false);
      }
    }
  };
  // chest front claw marks
  for (let k = 0; k < 3; k++)
    slash(sBody, [0.85 + k * 0.2, 2.75 - k * 0.04, 6], [0.55 + k * 0.2, 1.8 - k * 0.04, 6], [0, 0, -1], 0.04);
  // right rear flank
  for (let k = 0; k < 3; k++)
    slash(sBody, [-4, 2.55 - k * 0.04, -1.55 - k * 0.16], [-4, 1.65 - k * 0.04, -2.05 - k * 0.16], [1, 0, 0], 0.04);
  // back slashes
  for (let k = 0; k < 3; k++)
    slash(sTop, [-0.9 + k * 0.18, 6, 1.25], [-1.1 + k * 0.18, 6, 0.1], [0, -1, 0], 0.04);

  // ---------------------------------------------------------------- weapons stuck in hide
  const splinter = (tip: THREE.Vector3, d: THREE.Vector3, r: number, bn: any) => {
    for (let k = 0; k < 3; k++) {
      const side = V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.6);
      const dd = d.clone().add(side).normalize();
      put(CONE5, SPLINTER, bn, tip.clone().addScaledVector(dd, 0.06 + k * 0.01), aim(dd), [r * 0.55, 0.18 + k * 0.04, r * 0.55]);
    }
  };
  const wounds = (h: any, size: number) => {
    seat(h, DISC, P.scar, { embed: 0.5, scale: [size, 1, size] });
  };
  const spear = (o: number[], rd: number[], dir: number[], len: number) => {
    const h = sBody.ray(o, rd);
    if (!h) return;
    const bn = boneAt(h.at.z);
    const d = V(dir[0], dir[1], dir[2]).normalize();
    const base = h.at.clone().addScaledVector(d, -0.35);
    const tip = h.at.clone().addScaledVector(d, len);
    wounds(h, 0.18);
    rodB(base, tip, 0.045, P.wood, bn, false);
    splinter(tip, d, 0.045, bn);
    for (const t of [0.15, 0.3, 0.55]) {
      const p = h.at.clone().addScaledVector(d, len * t + 0.1);
      put(new THREE.TorusGeometry(0.052, 0.014, 4, 8), P.fur, bn, p, aim(d, UP, "z"));
    }
    // feather/rag tied on
    const rag = h.at.clone().addScaledVector(d, len * 0.7);
    put(SPH, P.rust, bn, rag.clone().add(V(0, -0.12, 0)), undefined, [0.03, 0.14, 0.05]);
  };
  const spearhead = (o: number[], rd: number[], dir: number[]) => {
    const h = sBody.ray(o, rd);
    if (!h) return;
    const bn = boneAt(h.at.z);
    const n = h.n.clone().normalize();
    const d = V(dir[0], dir[1], dir[2]).normalize();
    const side = d.clone().cross(n);
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    side.normalize();
    const at = h.at.clone().addScaledVector(d, -0.08);
    wounds(h, 0.2);
    b.extrude(
      [[-0.09, -0.05], [-0.03, 0.04], [0.04, -0.06], [0.1, 0.02], [0.12, 0.22], [0, 0.5, "sharp"], [-0.12, 0.22]],
      { at, x: side, y: d, thickness: 0.035, bevel: 0.006, color: P.ironLight, bone: bn },
    );
    const thick = side.clone().cross(d).normalize();
    rodB(at.clone().addScaledVector(d, 0.04).addScaledVector(thick, 0.022), at.clone().addScaledVector(d, 0.42).addScaledVector(thick, 0.022), 0.01, P.iron, bn, false);
    rodB(h.at.clone().addScaledVector(d, -0.15), h.at.clone().addScaledVector(d, 0.1), 0.05, P.rust, bn, false);
    rodB(h.at.clone().addScaledVector(d, -0.1), h.at.clone().addScaledVector(d, 0.1).addScaledVector(n, 0.02), 0.04, P.wood, bn, false);
    splinter(h.at.clone().addScaledVector(d, -0.02).addScaledVector(n, 0.02), d.clone().multiplyScalar(-0.2).add(n).normalize(), 0.04, bn);
  };
  const axe = (o: number[], rd: number[], haftDir: number[]) => {
    const h = sTop.ray(o, rd);
    if (!h) return;
    const bn = boneAt(h.at.z);
    const n = h.n.clone().normalize();
    const d = V(haftDir[0], haftDir[1], haftDir[2]);
    d.addScaledVector(n, -d.dot(n)).normalize();
    d.addScaledVector(n, 0.12).normalize();
    const at = h.at.clone().addScaledVector(n, 0.22);
    const blade: [number, number][] = [
      [0, -0.08], [0.05, -0.12], [0.2, -0.36], [0.33, -0.32], [0.29, -0.04], [0.34, 0.24], [0.2, 0.32], [0.05, 0.12], [0, 0.08],
    ];
    b.extrude(blade, { at, x: n.clone().negate(), y: d, thickness: 0.035, bevel: 0.006, color: P.iron, bone: bn });
    b.extrude(
      blade.map(([x, y]) => [x * 0.7 + 0.02, y * 0.75] as [number, number]),
      { at, x: n.clone().negate(), y: d, thickness: 0.05, color: P.ironLight, bone: bn },
    );
    wounds(h, 0.2);
    const end = at.clone().addScaledVector(d, 0.95);
    rodB(at.clone().addScaledVector(d, -0.22), end, 0.04, P.wood, bn, false);
    rodB(at.clone().addScaledVector(d, -0.1), at.clone().addScaledVector(d, 0.12), 0.07, DARKIRON, bn, false);
    splinter(end, d, 0.04, bn);
    for (const t of [0.35, 0.55]) put(new THREE.TorusGeometry(0.05, 0.013, 4, 8), P.fur, bn, at.clone().addScaledVector(d, t), aim(d, UP, "z"));
  };
  // left side
  spear([4, 2.3, -2.0], [-1, 0, 0], [1, 0.9, -0.5], 0.9);
  axe([0.9, 6, -1.3], [0, -1, 0], [0, 0.2, -1]);
  // right side
  spear([-4, 2.65, 1.35], [1, 0, 0], [-1, 0.8, -0.35], 1.1);
  spearhead([-1.0, 6, -2.0], [0, -1, 0], [-0.3, 1, -0.3]);
  axe([-4, 2.5, -0.7], [1, 0, 0], [0, 0.35, 1]);
  spearhead([0.5, 6, 0.9], [0, -1, 0], [0.6, 1, 0.4]);

  // ---------------------------------------------------------------- flush batches
  for (const it of bag.values()) {
    const merged = mergeGeometries(it.geos);
    if (!merged) continue;
    const part = b.part(merged, it.color, { bone: it.bone, at: [0, 0, 0], flat: true, name: "torsoDetail" });
    if (it.color === P.runeBlue) glow(part, 1.6);
  }
}
```

<!-- call: headOuterLeft -->

```ts
import * as THREE from "three";
import { aim, bezier, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildHeadOuterLeft({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ONE = V(1, 1, 1);
  const QID = new THREE.Quaternion();
  const head = J.headOL;
  const jaw = J.jawOL;
  const hp = V(M.headOL[0], M.headOL[1], M.headOL[2]);
  // head-local helper: l = left (+X), u = up, f = forward
  const H = (l: number, u: number, f: number) => V(hp.x + l, hp.y + u, hp.z + f);
  const lerp = (a: number, c: number, t: number) => a + (c - a) * t;

  // own colours (6)
  const BELLY_D = "#7f7150";
  const PUPIL = "#140e08";
  const NOSTRIL = "#12161a";
  const PLATE = "#1b2a2e";
  const WOODL = "#8c6c46";

  // ---------- merge helpers: many small pieces of one colour on one bone become one part ----------
  type Bag = THREE.BufferGeometry[];
  const put = (bag: Bag, geo: THREE.BufferGeometry, pos: THREE.Vector3, quat?: THREE.Quaternion, scale?: THREE.Vector3) => {
    const g = geo.clone();
    g.applyMatrix4(new THREE.Matrix4().compose(pos, quat ?? QID, scale ?? ONE));
    bag.push(g);
  };
  const flush = (bag: Bag, color: string, bone: any, glowK?: number) => {
    if (!bag.length) return null;
    const g = mergeGeometries(bag, false);
    if (!g) return null;
    const p = b.part(g, color, { bone, at: [0, 0, 0], flat: true });
    if (glowK) glow(p, glowK);
    return p;
  };
  const cone = (r: number, len: number, sides = 5) => new THREE.ConeGeometry(r, len, sides, 1).translate(0, len / 2, 0);
  const putSpike = (bag: Bag, base: THREE.Vector3, dir: THREE.Vector3, r: number, len: number, sides = 5) =>
    put(bag, cone(r, len, sides), base, aim(dir.clone().normalize()));
  const putRing = (bag: Bag, c: THREE.Vector3, tan: THREE.Vector3, R: number, tube: number) =>
    put(bag, new THREE.TorusGeometry(R, tube, 5, 10).rotateX(Math.PI / 2), c, aim(tan.clone().normalize()));
  const links = (bag: Bag, path: any, r: number) => {
    const n = Math.max(3, Math.round(path.length / (r * 1.5)));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const g = new THREE.TorusGeometry(r, r * 0.3, 5, 8);
      if (i % 2) g.rotateY(Math.PI / 2);
      put(bag, g, path.at(t), aim(path.tangentAt(t)), V(1, 1.4, 1));
    }
  };

  // =====================================================================================
  // NECK
  // =====================================================================================
  const neckPath = catmull([J.neckOL1.at, J.neckOL2.at, J.neckOL3.at, V(2.0, 3.3, 2.55)]);
  const neckR = (t: number) => 0.32 - 0.06 * t;
  const neck = b.sweep(neckPath, neckR, {
    bone: [J.neckOL1, J.neckOL2, J.neckOL3],
    color: P.hideMid,
    sectors: [
      [-65, 65, P.hideDark],
      [125, 235, P.belly],
    ],
    name: "neckOL",
  });

  const bestAt = (t: number, d: THREE.Vector3) => {
    let best = neck.at(t, 0);
    let sc = -9;
    for (let a = 0; a < 360; a += 15) {
      const p = neck.at(t, a);
      const s = p.n.dot(d);
      if (s > sc) {
        sc = s;
        best = p;
      }
    }
    return best;
  };
  const boneAtT = (t: number) => (t < 0.5 ? J.neckOL1 : t < 0.8 ? J.neckOL2 : J.neckOL3);

  // belly bands across the underside
  const bandBag: Bag = [];
  for (let i = 0; i < 8; i++) {
    const t = 0.07 + i * 0.1;
    if (Math.abs(t - 0.2) < 0.07 || Math.abs(t - 0.74) < 0.06) continue;
    const p = neck.at(t, 180);
    put(bandBag, new THREE.BoxGeometry(neckR(t) * 1.1, 0.03, 0.05), p.at.clone().addScaledVector(p.n, -0.008), p.quat);
  }
  flush(bandBag, BELLY_D, J.neckOL2);

  // scale plates on the flanks
  const scaleBag: Bag = [];
  const scaleGeo = new THREE.ConeGeometry(0.085, 0.07, 4).rotateY(Math.PI / 4).translate(0, 0.035, 0);
  [-75, -38, 38, 75].forEach((ang, ai) => {
    for (let i = 0; i < 8; i++) {
      const t = 0.06 + i * 0.1 + (ai % 2 ? 0.05 : 0);
      if (t > 0.8 || Math.abs(t - 0.2) < 0.07 || Math.abs(t - 0.74) < 0.07) continue;
      const p = neck.at(t, ang);
      put(scaleBag, scaleGeo, p.at.clone().addScaledVector(p.n, -0.02), aim(p.n, p.tangent));
    }
  });
  flush(scaleBag, P.hideLight, J.neckOL2);

  // dorsal bone spikes
  const spikeBag: Bag = [];
  [0.07, 0.31, 0.42, 0.53, 0.63].forEach((t, i) => {
    const p = neck.at(t, 0);
    const dir = p.n.clone().addScaledVector(p.tangent, -0.5);
    putSpike(spikeBag, p.at.clone().addScaledVector(p.n, -0.02), dir, 0.05, 0.22 - i * 0.015);
  });
  flush(spikeBag, P.bone, J.neckOL2);

  // ---------- collars, rivets and chains ----------
  const ringAt = (t: number, a: number, extra: number) => {
    const c = neckPath.at(t);
    const tan = neckPath.tangentAt(t).clone().normalize();
    let bn = tan.clone().cross(V(0, 1, 0));
    if (bn.lengthSq() < 1e-4) bn = V(1, 0, 0);
    bn.normalize();
    const nn = bn.clone().cross(tan).normalize();
    const R = neckR(t) * 1.09 + extra;
    const out = bn.clone().multiplyScalar(Math.cos(a)).addScaledVector(nn, Math.sin(a));
    return { c, tan, out, p: c.clone().addScaledVector(out, R), R };
  };
  const collar = (t: number, tube: number, bone: any, color: string) => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 12; k++) pts.push(ringAt(t, (k / 12) * Math.PI * 2, 0).p);
    b.sweep(catmull(pts, { closed: true }), tube, { bone, color, sides: 6 });
  };
  const rivetBag: Bag = [];
  const T1 = 0.2;
  collar(T1, 0.058, J.neckOL1, P.iron);
  {
    // thin lighter band above the collar
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 12; k++) {
      const r = ringAt(T1 + 0.06, (k / 12) * Math.PI * 2, 0.0);
      pts.push(r.p);
    }
    b.sweep(catmull(pts, { closed: true }), 0.026, { bone: J.neckOL1, color: P.ironLight, sides: 6 });
    for (let k = 0; k < 8; k++) {
      const r = ringAt(T1, ((k + 0.5) / 8) * Math.PI * 2, 0.045);
      put(rivetBag, new THREE.SphereGeometry(0.03, 6, 4), r.p);
    }
  }
  collar(0.74, 0.04, J.neckOL2, P.iron);
  for (let k = 0; k < 6; k++) {
    const r = ringAt(0.74, ((k + 0.5) / 6) * Math.PI * 2, 0.03);
    put(rivetBag, new THREE.SphereGeometry(0.022, 6, 4), r.p);
  }

  // choose anchors on collar 1: A = upper-left, B = front
  const pickIdx = (d: THREE.Vector3) => {
    let bi = 0;
    let bs = -9;
    for (let k = 0; k < 12; k++) {
      const s = ringAt(T1, (k / 12) * Math.PI * 2, 0).out.dot(d.clone().normalize());
      if (s > bs) {
        bs = s;
        bi = k;
      }
    }
    return bi;
  };
  const iA = pickIdx(V(1, 0.35, 0.35));
  let iB = pickIdx(V(0.15, -0.1, 1));
  if (iB === iA) iB = (iA + 3) % 12;
  const rA = ringAt(T1, (iA / 12) * Math.PI * 2, 0.06);
  put(rivetBag, new THREE.TorusGeometry(0.055, 0.015, 5, 8), rA.p, aim(rA.out));
  const rB = ringAt(T1, (iB / 12) * Math.PI * 2, 0.06);
  put(rivetBag, new THREE.TorusGeometry(0.05, 0.014, 5, 8), rB.p, aim(rB.out));

  const chainBag: Bag = [];
  {
    const diff = ((iB - iA + 18) % 12) - 6;
    const pts: THREE.Vector3[] = [];
    for (let u = 0; u <= 4; u++) {
      const idx = iA + (diff * u) / 4;
      const r = ringAt(T1, (idx / 12) * Math.PI * 2, 0.07);
      pts.push(r.p.add(V(0, -0.26 * Math.sin((Math.PI * u) / 4), 0)));
    }
    links(chainBag, catmull(pts), 0.042);
    // hanging spare chain with a shackle
    const a0 = rA.p.clone();
    const hang = catmull([
      a0,
      a0.clone().add(V(0.06, -0.14, 0.0)),
      a0.clone().add(V(0.1, -0.26, 0.05)),
      a0.clone().add(V(0.1, -0.36, 0.08)),
    ]);
    links(chainBag, hang, 0.04);
    put(rivetBag, new THREE.TorusGeometry(0.06, 0.016, 5, 8), a0.clone().add(V(0.1, -0.42, 0.08)), aim(V(0, 0, 1)));
    put(rivetBag, new THREE.OctahedronGeometry(0.05), a0.clone().add(V(0.1, -0.5, 0.08)));
  }
  flush(chainBag, P.chain, J.neckOL1);
  flush(rivetBag, P.ironLight, J.neckOL1);

  // ---------- runes (glowing, carved into dark plates) ----------
  const GLYPH: Record<string, number[][]> = {
    fehu: [[-0.4, -1, -0.4, 1], [-0.4, 0.3, 0.5, 1], [-0.4, -0.4, 0.5, 0.35]],
    algiz: [[0, -1, 0, 1], [0, 0.1, -0.7, 1], [0, 0.1, 0.7, 1]],
    thurisaz: [[-0.4, -1, -0.4, 1], [-0.4, 0.5, 0.5, 0.1], [0.5, 0.1, -0.4, -0.35]],
  };
  const plateBag: Bag = [];
  const strokeBag: Bag = [];
  const rune = (t: number, d: THREE.Vector3, name: string) => {
    const p = bestAt(t, d.clone().normalize());
    const sc = 0.065;
    put(plateBag, new THREE.BoxGeometry(0.17, 0.025, 0.19), p.at, p.quat);
    for (const [x1, z1, x2, z2] of GLYPH[name]) {
      const cx = ((x1 + x2) / 2) * sc;
      const cz = ((z1 + z2) / 2) * sc;
      const len = Math.hypot(x2 - x1, z2 - z1) * sc + 0.014;
      const th = Math.atan2(-(z2 - z1), x2 - x1);
      const q = p.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), th));
      const pos = V(cx, 0.014, cz).applyQuaternion(p.quat).add(p.at);
      put(strokeBag, new THREE.BoxGeometry(len, 0.022, 0.016), pos, q);
    }
  };
  rune(0.36, V(1, 0.4, 0.2), "fehu");
  rune(0.62, V(0.6, 0.8, 0.2), "algiz");
  rune(0.62, V(1, -0.3, 0.3), "thurisaz");
  flush(plateBag, PLATE, J.neckOL2);
  flush(strokeBag, P.runeBlue, J.neckOL2, 1.5);

  // ---------- broken axe blade lodged in the neck ----------
  {
    const p = bestAt(0.47, V(0.25, 1, 0.5).normalize());
    const n = p.n.clone();
    const tan = p.tangent.clone();
    const yd = n.clone().addScaledVector(tan, 0.3).normalize();
    const xd = tan.clone().addScaledVector(yd, -tan.dot(yd)).normalize();
    const at0 = p.at.clone().addScaledVector(n, -0.03);
    const bone = J.neckOL1;
    // wound
    b.part(new THREE.SphereGeometry(1, 8, 6), P.scar, { at: p.at, quat: p.quat, scale: [0.2, 0.045, 0.15], bone, flat: true });
    b.part(new THREE.SphereGeometry(1, 8, 6), P.mouth, { at: p.at.clone().addScaledVector(n, 0.015), quat: p.quat, scale: [0.15, 0.04, 0.1], bone, flat: true });
    const blade: [number, number][] = [
      [-0.26, 0.06], [-0.14, -0.04], [0, -0.07], [0.14, -0.04], [0.26, 0.06],
      [0.2, 0.2], [0.07, 0.24], [0.07, 0.3], [-0.07, 0.3], [-0.07, 0.24], [-0.2, 0.2],
    ];
    b.extrude(blade, { at: at0, x: xd.toArray(), y: yd.toArray(), thickness: 0.03, bevel: 0.006, color: P.iron, bone });
    b.extrude(
      [[-0.26, 0.06], [-0.14, -0.04], [0, -0.07], [0.14, -0.04], [0.26, 0.06], [0.2, 0.09], [0.12, 0.0], [0, -0.03], [-0.12, 0.0], [-0.2, 0.09]],
      { at: at0, x: xd.toArray(), y: yd.toArray(), thickness: 0.036, color: P.ironLight, bone },
    );
    b.extrude(
      [[0.05, 0.1], [0.2, 0.12], [0.18, 0.2], [0.08, 0.19]],
      { at: at0, x: xd.toArray(), y: yd.toArray(), thickness: 0.034, color: P.rust, bone },
    );
    const base = at0.clone().addScaledVector(yd, 0.28);
    const top = at0.clone().addScaledVector(yd, 0.66);
    b.rod(base, top, 0.03, P.wood, { bone });
    b.rod(at0.clone().addScaledVector(yd, 0.34), at0.clone().addScaledVector(yd, 0.4), 0.039, P.iron, { bone });
    b.spike(top, yd.clone().addScaledVector(xd, 0.4), 0.11, 0.022, { color: WOODL, bone });
    b.spike(top.clone().addScaledVector(xd, -0.015), yd.clone().addScaledVector(xd, -0.5), 0.07, 0.016, { color: WOODL, bone });
  }

  // =====================================================================================
  // HEAD
  // =====================================================================================
  const hb = { bone: head };
  // cranium (wedge back)
  const cranium = b.frustumBox(H(0, 0.07, 0.0), H(0, 0.07, 0.55), [0.64, 0.54], [0.58, 0.46], { ...hb, color: P.hideMid, name: "craniumOL" });
  // snout / upper jaw
  b.frustumBox(H(0, 0.02, 0.5), H(0, -0.02, 1.0), [0.5, 0.32], [0.34, 0.2], { ...hb, color: P.hideMid, name: "snoutOL" });
  // dark crown plate over the top
  b.frustumBox(H(0, 0.325, 0.05), H(0, 0.295, 0.5), [0.36, 0.04], [0.26, 0.04], { ...hb, color: P.hideDark });
  // nose bump
  b.frustumBox(H(0, 0.125, 0.78), H(0, 0.105, 0.99), [0.3, 0.07], [0.24, 0.07], { ...hb, color: P.hideLight });
  const nostrilBag: Bag = [];
  const socketBag: Bag = [];
  const eyeBag: Bag = [];
  const pupilBag: Bag = [];
  const crestBag: Bag = [];
  const upperTeeth: Bag = [];
  const lowerTeeth: Bag = [];
  const chinBag: Bag = [];
  const hornRings: Bag = [];
  const crackBag: Bag = [];
  const headRivets: Bag = [];

  for (const s of [1, -1]) {
    put(nostrilBag, new THREE.BoxGeometry(0.05, 0.03, 0.05), H(s * 0.075, 0.135, 0.965));
    // lip strip
    b.rod(H(s * 0.255, -0.1, 0.5), H(s * 0.17, -0.1, 0.98), 0.03, P.hideDark, { ...hb, sides: 6 });
    // eyes
    const ec = H(s * 0.285, 0.16, 0.38);
    put(socketBag, new THREE.SphereGeometry(0.088, 7, 5), H(s * 0.27, 0.16, 0.38), QID, V(0.75, 1, 1.05));
    put(eyeBag, new THREE.SphereGeometry(0.066, 8, 6), ec);
    const od = V(s * 0.8, 0, 0.6);
    put(pupilBag, new THREE.BoxGeometry(0.013, 0.08, 0.02), ec.clone().addScaledVector(od, 0.066), aim(od, V(0, 1, 0), "z"));
    // brow ridge
    b.frustumBox(H(s * 0.265, 0.265, 0.15), H(s * 0.235, 0.2, 0.64), [0.13, 0.09], [0.1, 0.06], { ...hb, color: P.hideDark });
    for (const f of [0.25, 0.4, 0.55]) {
      const u = lerp(0.29, 0.23, f / 0.6);
      putSpike(crestBag, H(s * 0.25, u, f), V(s * 0.5, 0.8, -0.3), 0.03, 0.1, 4);
    }
    // cheek spikes
    putSpike(crestBag, H(s * 0.3, -0.08, 0.06), V(s * 0.8, -0.2, -0.6), 0.045, 0.15);
    putSpike(crestBag, H(s * 0.3, 0.02, 0.03), V(s * 0.8, 0.1, -0.6), 0.04, 0.12);
  }

  // helper curves for jaws
  const snoutBottom = (f: number) => {
    const t = (f - 0.5) / 0.5;
    return 0.02 - 0.04 * t - (0.32 - 0.12 * t) / 2;
  };
  const snoutHalfW = (f: number) => (0.5 - 0.16 * ((f - 0.5) / 0.5)) / 2;
  const jt01 = (f: number) => (f - 0.12) / 0.86;
  const jc = (f: number) => -0.2 - 0.18 * jt01(f);
  const jh = (f: number) => 0.13 - 0.02 * jt01(f);
  const jw = (f: number) => 0.5 - 0.18 * jt01(f);
  const jTop = (f: number) => jc(f) + jh(f) / 2;
  const jBot = (f: number) => jc(f) - jh(f) / 2;

  // mouth roof + lower jaw (separate, on jaw joint)
  b.frustumBox(H(0, -0.17, 0.3), H(0, -0.125, 0.98), [0.4, 0.02], [0.3, 0.02], { ...hb, color: P.mouth });
  b.frustumBox(H(0, jc(0.12), 0.12), H(0, jc(0.98), 0.98), [jw(0.12), jh(0.12)], [jw(0.98), jh(0.98)], {
    bone: jaw,
    color: P.hideDark,
    name: "lowerJawOL",
  });
  b.frustumBox(H(0, jBot(0.25) + 0.005, 0.25), H(0, jBot(0.95) + 0.005, 0.95), [jw(0.25) * 0.6, 0.02], [jw(0.95) * 0.6, 0.02], {
    bone: jaw,
    color: P.belly,
  });
  b.frustumBox(H(0, jTop(0.2), 0.2), H(0, jTop(0.95), 0.95), [jw(0.2) * 0.78, 0.025], [jw(0.95) * 0.78, 0.025], {
    bone: jaw,
    color: P.mouth,
  });
  b.frustumBox(H(0, jTop(0.26) + 0.022, 0.26), H(0, jTop(0.86) + 0.02, 0.86), [0.2, 0.04], [0.1, 0.03], {
    bone: jaw,
    color: P.tongue,
  });

  // teeth
  for (const s of [1, -1]) {
    for (const f of [0.5, 0.62, 0.74, 0.86]) {
      const x = s * (snoutHalfW(f) - 0.04);
      putSpike(upperTeeth, H(x, snoutBottom(f) + 0.015, f), V(0, -1, 0.05), 0.027, 0.1 + (f > 0.7 ? 0.02 : 0), 4);
    }
    putSpike(upperTeeth, H(s * 0.12, snoutBottom(0.93) + 0.02, 0.93), V(0, -1, 0.12), 0.04, 0.2, 5);
    for (const f of [0.4, 0.52, 0.64, 0.76]) {
      const x = s * (jw(f) / 2 - 0.04);
      putSpike(lowerTeeth, H(x, jTop(f) - 0.01, f), V(0, 1, -0.08), 0.025, 0.085, 4);
    }
    // chin spikes
    for (const f of [0.5, 0.7, 0.9]) putSpike(chinBag, H(s * 0.05, jBot(f) + 0.01, f), V(0, -1, 0.3), 0.028, 0.08, 4);
  }

  // tusks (left one cracked)
  for (const s of [1, -1]) {
    const cracked = s > 0;
    const path = bezier(H(s * 0.16, -0.34, 0.86), H(s * 0.235, -0.15, 0.93), H(s * 0.25, 0.08, 0.95));
    const rad = (t: number) => 0.045 - 0.035 * t;
    b.sweep(path, rad, {
      bone: jaw,
      color: P.bone,
      caps: cracked ? { start: "flat", end: "flat" } : { start: "flat", end: "point" },
      to: cracked ? 0.7 : 1,
      sides: 6,
      bands: [[0.35, P.claw], [1, P.bone]],
    });
    if (cracked) {
      for (const t of [0.35, 0.5]) putRing(crackBag, path.at(t), path.tangentAt(t), rad(t) * 1.12, 0.006);
      const top = path.at(0.7);
      const tan = path.tangentAt(0.7);
      putSpike(hornRings, top.clone().addScaledVector(V(0.012, 0, 0), s), tan.clone().add(V(0.3, 0, 0)), 0.018, 0.075, 4);
    }
  }

  // horns (inner one broken)
  for (const s of [1, -1]) {
    const broken = s < 0;
    const path = bezier(H(s * 0.2, 0.27, 0.08), H(s * 0.4, 0.36, -0.15), H(s * 0.5, 0.62, -0.32));
    const rad = (t: number) => 0.075 - 0.063 * t;
    b.sweep(path, rad, {
      ...hb,
      color: P.horn,
      sides: 6,
      to: broken ? 0.62 : 1,
      caps: broken ? { start: "flat", end: "flat" } : { start: "flat", end: "point" },
      bands: [[broken ? 0.5 : 0.55, P.horn], [1, P.bone]],
    });
    const ts = broken ? [0.14, 0.28, 0.42] : [0.18, 0.36, 0.54];
    for (const t of ts) putRing(hornRings, path.at(t), path.tangentAt(t), rad(t) * 1.12, 0.014);
    if (broken) {
      const top = path.at(0.62);
      const tan = path.tangentAt(0.62);
      putSpike(crestBag, top.clone().add(V(0.015, 0, 0)), tan.clone().add(V(0.4, 0.2, 0)), 0.02, 0.1, 4);
      putSpike(crestBag, top.clone().add(V(-0.015, 0, 0)), tan.clone().add(V(-0.4, 0, 0)), 0.016, 0.06, 4);
    }
  }

  // crest spikes along the skull top
  [0.08, 0.2, 0.32, 0.44].forEach((f, i) => {
    const top = 0.07 + (0.54 - (0.08 * f) / 0.55) / 2;
    putSpike(crestBag, H(0, top + 0.015, f), V(0, 1, -0.55), 0.05 - i * 0.006, 0.17 - i * 0.025);
  });
  for (const f of [0.64, 0.78]) putSpike(crestBag, H(0, snoutBottom(f) + 0.28 - (f - 0.5) * 0.3, f), V(0, 1, -0.4), 0.026, 0.07, 4);

  // iron cheek plate (right side) with rivets
  b.frustumBox(H(-0.315, 0.0, 0.06), H(-0.315, 0.0, 0.3), [0.035, 0.3], [0.03, 0.24], { ...hb, color: P.iron });
  for (const [u, f] of [[0.09, 0.1], [0.09, 0.24], [-0.09, 0.1], [-0.09, 0.24]])
    put(headRivets, new THREE.SphereGeometry(0.02, 6, 4), H(-0.336, u, f));

  // scar slashes across the left side and eye
  {
    const skin = b.surface(cranium);
    for (let k = 0; k < 3; k++) {
      const path = skin.drape(
        catmull([H(0.3, 0.3, 0.2 + 0.07 * k), H(0.305, 0.1, 0.25 + 0.07 * k), H(0.3, -0.12, 0.31 + 0.07 * k)]),
        { lift: 0.006 },
      );
      b.sweep(path, 0.014, { bone: head, color: P.scar, sides: 5 });
    }
  }

  flush(nostrilBag, NOSTRIL, head);
  flush(socketBag, P.hideDark, head);
  flush(eyeBag, P.eye, head, 1.8);
  flush(pupilBag, PUPIL, head);
  flush(crestBag, P.bone, head);
  flush(upperTeeth, P.claw, head);
  flush(lowerTeeth, P.claw, jaw);
  flush(chinBag, P.bone, jaw);
  flush(hornRings, P.claw, head);
  flush(crackBag, P.horn, jaw);
  flush(headRivets, P.ironLight, head);
}
```

<!-- call: headsCentre -->

```ts
import * as THREE from "three";
import { rng, vec, polyline, catmull, bezier } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadsCentre({ b, J, P, M }: Ctx) {
  // ---------- own colours ----------
  const BELLY2 = "#8d8160";
  const VOID = "#15120f";
  const IRONDK = "#2a3038";
  const SCARP = "#b88f7a";

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const X = V(1, 0, 0);
  const Y = V(0, 1, 0);
  const ONE = V(1, 1, 1);
  const n3 = (a: number[]) => {
    const v = V(a[0], a[1], a[2]).normalize();
    return [v.x, v.y, v.z];
  };

  // ---------- baked batches (merged per bone + colour) ----------
  const batches = new Map<string, { bone: any; color: string; geos: THREE.BufferGeometry[] }>();
  const bake = (bone: any, color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4) => {
    const key = `${bone.name}|${color}`;
    let e = batches.get(key);
    if (!e) batches.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(geo.clone().applyMatrix4(m));
  };
  const flush = () => {
    for (const e of batches.values()) {
      const g = mergeGeometries(e.geos);
      if (g) b.part(g, e.color, { bone: e.bone, at: [0, 0, 0], flat: true });
    }
    batches.clear();
  };
  const basisMat = (yAx: THREE.Vector3, zHint: THREE.Vector3, pos: THREE.Vector3) => {
    const y = yAx.clone().normalize();
    let z = zHint.clone().sub(y.clone().multiplyScalar(zHint.dot(y)));
    if (z.lengthSq() < 1e-6) z = V(1, 0, 0).sub(y.clone().multiplyScalar(y.x));
    z.normalize();
    const x = y.clone().cross(z);
    return new THREE.Matrix4().makeBasis(x, y, z).setPosition(pos);
  };
  const owner = (js: any[], y: number) => {
    let o = js[0];
    for (const j of js) if (j.at.y - 0.35 <= y) o = j;
    return o;
  };

  // chain-link geometries (long axis +Z, local Y = outward)
  const linkA = () => new THREE.TorusGeometry(0.04, 0.011, 5, 8).scale(1, 1.5, 1).rotateX(Math.PI / 2);
  const linkB = () => linkA().rotateZ(Math.PI / 2);

  // ======================================================================
  // NECKS
  // ======================================================================
  function neck(js: any[], pts: number[][], rad: (t: number) => number, collars: number[], chainT: number, seed: number, topY: number) {
    const path = catmull(pts);
    const len = path.length;
    const tube = b.sweep(path, rad, {
      bone: js,
      color: P.hideMid,
      sides: 8,
      sectors: [
        [-40, 40, P.hideDark],
        [130, 230, BELLY2],
      ],
    });
    const at = (t: number) => {
      const c = vec(path.at(t));
      const T = vec(path.tangentAt(t)).normalize();
      const back = Y.clone().sub(T.clone().multiplyScalar(Y.dot(T)));
      if (back.lengthSq() < 1e-4) back.set(0, 0, -1);
      back.normalize();
      const a = X.clone().sub(T.clone().multiplyScalar(X.dot(T))).normalize();
      const bb = T.clone().cross(a);
      return { c, T, back, front: back.clone().negate(), a, bb, r: rad(t), o: owner(js, c.y) };
    };
    const nearCollar = (t: number) => collars.some((ct) => Math.abs(ct - t) < 0.045);

    // belly plates: arcs hugging the neck front
    for (let t = 0.08; t < 0.86; t += 0.075) {
      if (nearCollar(t)) continue;
      const f = at(t);
      const phi = Math.atan2(f.front.dot(f.bb), f.front.dot(f.a));
      const g = new THREE.TorusGeometry(f.r * 1.04, 0.03, 4, 7, 2.3).rotateZ(phi - 1.15);
      bake(f.o, P.belly, g, new THREE.Matrix4().makeBasis(f.a, f.bb, f.T).setPosition(f.c));
    }

    // bone spikes down the back
    for (const t of [0.08, 0.18, 0.28, 0.38, 0.48, 0.56, 0.72, 0.8]) {
      if (nearCollar(t)) continue;
      const f = at(t);
      const len2 = 0.28 - 0.17 * t;
      const g = new THREE.ConeGeometry(0.065 - 0.03 * t, len2, 5)
        .translate(0, len2 / 2 - 0.04, 0)
        .rotateX(-0.35);
      bake(f.o, P.bone, g, basisMat(f.back, f.T, f.c.clone().addScaledVector(f.back, f.r * 1.04)));
    }

    // scale bumps on the flanks
    const r = rng(seed);
    const skin = b.surface(tube);
    const hits = skin.scatter(16, {
      rng: r,
      minDist: 0.22,
      filter: (h: any) => h.n.z < 0.45 && h.at.y < topY - 0.35 && h.at.y > 2.9,
    });
    hits.forEach((h: any, i: number) => {
      const g = new THREE.ConeGeometry(0.06, 0.045, 4).translate(0, 0.01, 0).rotateY(r() * Math.PI);
      bake(owner(js, h.at.y), i % 2 ? P.hideLight : P.hideDark, g, basisMat(h.n, V(0.3, -1, 0.2), vec(h.at)));
    });

    // iron collars with rivets
    for (const t of collars) {
      const f = at(t);
      const R = f.r * 1.05 + 0.02;
      const pos: [number, number, number] = [f.c.x, f.c.y, f.c.z];
      const ax: [number, number, number] = [f.T.x, f.T.y, f.T.z];
      b.lathe(
        [
          [R - 0.03, -0.07],
          [R + 0.045, -0.08],
          [R + 0.06, -0.04],
          [R + 0.06, 0.04],
          [R + 0.045, 0.08],
          [R - 0.03, 0.07],
        ],
        { at: pos, axis: ax, segments: 10, color: P.iron, bone: f.o },
      );
      b.lathe(
        [
          [R + 0.05, -0.02],
          [R + 0.078, -0.014],
          [R + 0.078, 0.014],
          [R + 0.05, 0.02],
        ],
        { at: pos, axis: ax, segments: 10, color: P.ironLight, bone: f.o },
      );
      const phi = Math.atan2(f.front.dot(f.bb), f.front.dot(f.a));
      for (let k = -4; k <= 4; k++) {
        const ang = phi + (k * 25 * Math.PI) / 180;
        const dir = f.a.clone().multiplyScalar(Math.cos(ang)).addScaledVector(f.bb, Math.sin(ang));
        const p = f.c.clone().addScaledVector(dir, R + 0.055).addScaledVector(f.T, 0.055);
        bake(f.o, P.ironLight, new THREE.SphereGeometry(0.02, 5, 4), new THREE.Matrix4().setPosition(p));
      }
    }

    // hanging chain from the lower collar, ending in an iron weight
    {
      const dt = 0.078 / len;
      let t = chainT - 0.03;
      for (let i = 0; i < 6; i++, t -= dt) {
        const f = at(t);
        const p = f.c.clone().addScaledVector(f.front, f.r * 1.08 + 0.045);
        bake(f.o, P.chain, i % 2 ? linkB() : linkA(), basisMat(f.front, f.T, p));
      }
      const f = at(t);
      const p = f.c.clone().addScaledVector(f.front, f.r * 1.08 + 0.045);
      const m = basisMat(f.front, f.T, p);
      bake(f.o, P.iron, new THREE.BoxGeometry(0.16, 0.05, 0.18).translate(0, 0, -0.08), m);
      bake(f.o, P.rust, new THREE.BoxGeometry(0.1, 0.055, 0.05).translate(0, 0, -0.12), m);
      bake(f.o, P.ironLight, new THREE.SphereGeometry(0.02, 5, 4).translate(0.05, 0.03, -0.03), m);
      bake(f.o, P.ironLight, new THREE.SphereGeometry(0.02, 5, 4).translate(-0.05, 0.03, -0.03), m);
    }
    return { path, tube };
  }

  // ======================================================================
  // HEADS
  // ======================================================================
  function head(o: { c: number[]; k: number; H: any; Jw: any; open: number; crown: boolean; arrow: boolean }) {
    const { c, k, H, Jw } = o;
    const P3 = (x: number, y: number, z: number): [number, number, number] => [c[0] + x * k, c[1] + y * k, c[2] + z * k];
    const place = (g: THREE.BufferGeometry, x: number, y: number, z: number) => {
      g.translate(x, y, z);
      g.scale(k, k, k);
      g.translate(c[0], c[1], c[2]);
      return g;
    };
    const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number, color: string, bone: any, rot?: number[]) =>
      b.part(new THREE.BoxGeometry(sx * k, sy * k, sz * k), color, { bone, at: P3(x, y, z), rotation: rot, flat: true });
    const stroke = (pts: number[][], n = 4) => {
      const out: number[][] = [];
      for (let i = 0; i < pts.length - 1; i++)
        for (let j = 0; j < n; j++) {
          const t = j / n;
          out.push([0, 1, 2].map((q) => pts[i][q] + (pts[i + 1][q] - pts[i][q]) * t));
        }
      out.push(pts[pts.length - 1]);
      return out;
    };

    // --- skull ---
    const cran = b.frustumBox(P3(0, 0, -0.3), P3(0, 0, 0.35), [0.78 * k, 0.72 * k], [0.7 * k, 0.6 * k], { bone: H, color: P.hideMid });
    const snout = b.frustumBox(P3(0, -0.08, 0.3), P3(0, -0.08, 1.15), [0.58 * k, 0.42 * k], [0.42 * k, 0.3 * k], { bone: H, color: P.hideMid });
    box(0.43, 0.31, 0.08, 0, -0.08, 1.13, P.hideDark, H);
    box(0.14, 0.05, 0.7, 0, 0.115, 0.75, P.hideLight, H, [4, 0, 0]);
    box(0.3, 0.04, 0.55, 0, 0.335, -0.02, P.hideDark, H);
    const jowls: any[] = [];
    for (const s of [1, -1]) {
      jowls.push(box(0.09, 0.3, 0.5, s * 0.39, -0.16, 0.02, P.hideDark, H));
      b.spike(P3(s * 0.4, -0.2, -0.15), n3([s * 0.5, -0.25, -0.8]), 0.3 * k, 0.05 * k, { color: P.bone, bone: H });
    }
    // crest spikes at the back of the skull
    b.spike(P3(0, 0.2, -0.28), n3([0, 0.5, -1]), 0.3 * k, 0.06 * k, { color: P.bone, bone: H });
    b.spike(P3(0, 0.0, -0.3), n3([0, 0.1, -1]), 0.26 * k, 0.055 * k, { color: P.bone, bone: H });
    b.spike(P3(0, -0.2, -0.3), n3([0, -0.3, -1]), 0.2 * k, 0.045 * k, { color: P.bone, bone: H });

    // --- eyes ---
    for (const s of [1, -1]) {
      const ec = P3(s * 0.31, 0.08, 0.3);
      glow(b.part(new THREE.SphereGeometry(0.08 * k, 8, 6), P.eye, { bone: H, at: ec }), 1.6);
      const e = n3([s * 0.55, 0.05, 0.83]);
      b.part(new THREE.BoxGeometry(0.016 * k, 0.1 * k, 0.012 * k), VOID, {
        bone: H,
        at: [ec[0] + e[0] * 0.074 * k, ec[1] + e[1] * 0.074 * k, ec[2] + e[2] * 0.074 * k],
        dir: e,
        axis: "z",
      });
      b.part(new THREE.SphereGeometry(0.088 * k, 8, 4, 0, Math.PI * 2, 0, 1.15), P.hideDark, {
        bone: H,
        at: ec,
        rotation: [0, 0, s * 22],
      });
      box(0.34, 0.07, 0.2, s * 0.24, 0.215, 0.3, P.hideDark, H, [0, 0, s * 16]);
    }

    // --- nostrils ---
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.05 * k, 6, 4), P.hideLight, { bone: H, at: P3(s * 0.1, 0.08, 0.98), scale: [1, 0.65, 1.2] });
      b.part(new THREE.SphereGeometry(0.028 * k, 5, 4), VOID, { bone: H, at: P3(s * 0.1, 0.09, 1.04), scale: [1, 0.7, 1.4] });
    }

    // --- horns ---
    const hornPts = (s: number) => [
      P3(s * 0.26, 0.28, -0.15),
      P3(s * 0.38, 0.33, -0.35),
      P3(s * 0.5, 0.36, -0.6),
      P3(s * 0.5, 0.55, -0.8),
    ];
    for (const s of [1, -1]) {
      if (!o.crown && s === -1) {
        // cracked horn
        const pts = [P3(-0.26, 0.28, -0.15), P3(-0.36, 0.33, -0.3), P3(-0.44, 0.36, -0.42), P3(-0.46, 0.4, -0.5)];
        b.sweep(bezier(pts[0], pts[1], pts[2], pts[3]), [0.075 * k, 0.05 * k], {
          bone: H,
          color: P.horn,
          caps: { start: "flat", end: "flat" },
          sides: 6,
        });
        b.spike(P3(-0.47, 0.4, -0.5), n3([-0.2, 1, -0.3]), 0.14 * k, 0.04 * k, { color: P.bone, bone: H });
        b.spike(P3(-0.44, 0.4, -0.5), n3([0.5, 0.8, -0.2]), 0.08 * k, 0.025 * k, { color: P.bone, bone: H });
        box(0.015, 0.1, 0.012, -0.5, 0.36, -0.46, VOID, H, [0, 0, 20]);
        continue;
      }
      const pts = hornPts(s);
      const horn = b.sweep(bezier(pts[0], pts[1], pts[2], pts[3]), [0.075 * k, 0], {
        bone: H,
        color: P.horn,
        bands: [
          [0.55, P.horn],
          [1, P.bone],
        ],
        caps: { start: "flat", end: "point" },
        sides: 6,
      });
      if (o.crown) {
        const sp = horn.at(0.22);
        b.lathe(
          [
            [0.075 * k * 0.78 + 0.0, -0.03],
            [0.075 * k * 0.78 + 0.035, -0.025],
            [0.075 * k * 0.78 + 0.035, 0.025],
            [0.075 * k * 0.78 + 0.0, 0.03],
          ],
          { at: sp, axis: sp.tangent, segments: 8, color: P.iron, bone: H },
        );
      }
    }

    // --- back frills ---
    const fo = (
      [
        [0, -0.15],
        [0.25, -0.1],
        [0.5, 0.05],
        [0.28, 0.1],
        [0.42, 0.28],
        [0.18, 0.2],
        [0.22, 0.42],
        [0.05, 0.25],
      ] as number[][]
    ).map(([x, y]) => [x * k, y * k] as [number, number]);
    for (const s of [1, -1])
      b.extrude(fo, {
        at: P3(s * 0.38, -0.02, -0.1),
        x: [0, 0, -1],
        y: [s * 0.35, 1, 0],
        thickness: 0.035 * k,
        color: P.horn,
        bone: H,
      });

    // --- jaws ---
    const yUp = (z: number) => -0.29 + 0.0706 * (z - 0.3);
    const hwUp = (z: number) => 0.29 - 0.0941 * (z - 0.3);
    const yLo = (z: number) => -0.245 - 0.035 * (z - 0.05);
    const hwLo = (z: number) => 0.31 - 0.13 * (z - 0.05);
    const cone = (r: number, h: number, x: number, y: number, z: number, down: boolean, tilt = 0) => {
      const g = new THREE.ConeGeometry(r, h, 5);
      if (down) g.rotateX(Math.PI);
      if (tilt) g.rotateZ(tilt);
      return place(g, x, y, z);
    };
    const upper: THREE.BufferGeometry[] = [];
    const lower: THREE.BufferGeometry[] = [];
    [0.42, 0.56, 0.7, 0.84, 0.98, 1.1].forEach((z, i) => {
      for (const s of [1, -1]) {
        const h = 0.07 + (i % 2) * 0.03;
        upper.push(cone(0.024, h, s * (hwUp(z) - 0.03), yUp(z) - h / 2 + 0.02, z, true));
      }
    });
    for (const s of [1, -1]) upper.push(cone(0.04, 0.22, s * 0.14, yUp(1.08) - 0.08, 1.08, true));
    [0.25, 0.4, 0.55, 0.7, 0.85, 0.98].forEach((z, i) => {
      for (const s of [1, -1]) {
        const h = 0.06 + (i % 2) * 0.025;
        lower.push(cone(0.022, h, s * (hwLo(z) - 0.03), yLo(z) + h / 2 - 0.02, z, false));
      }
    });
    for (const s of [1, -1]) lower.push(cone(0.035, 0.26, s * 0.22, -0.16, 0.8, false, -s * 0.25));
    b.part(mergeGeometries(upper)!, P.bone, { bone: H, at: [0, 0, 0], flat: true });
    b.part(mergeGeometries(lower)!, P.bone, { bone: Jw, at: [0, 0, 0], flat: true });

    b.frustumBox(P3(0, -0.295, 0.12), P3(0, -0.25, 1.1), [0.5 * k, 0.04 * k], [0.34 * k, 0.04 * k], { bone: H, color: P.mouth });
    b.frustumBox(P3(0, -0.345, 0.05), P3(0, -0.345, 1.05), [0.62 * k, 0.2 * k], [0.36 * k, 0.13 * k], { bone: Jw, color: P.hideDark });
    b.frustumBox(P3(0, -0.252, 0.2), P3(0, -0.272, 0.98), [0.5 * k, 0.03 * k], [0.3 * k, 0.03 * k], { bone: Jw, color: P.mouth });
    b.frustumBox(P3(0, -0.24, 0.2), P3(0, -0.255, 0.95), [0.22 * k, 0.05 * k], [0.12 * k, 0.04 * k], { bone: Jw, color: P.tongue });
    b.frustumBox(P3(0, -0.46, 0.2), P3(0, -0.38, 1.0), [0.3 * k, 0.03 * k], [0.2 * k, 0.03 * k], { bone: Jw, color: P.belly });
    for (const [x, z, d] of [
      [0, 0.88, 0.14],
      [0.14, 0.7, 0.1],
      [-0.14, 0.7, 0.1],
    ])
      b.spike(P3(x, -0.43, z), n3([0, -1, 0.35]), d * k, 0.035 * k, { color: P.bone, bone: Jw });

    // --- skin surface: scars + runes ---
    const skin = b.surface([cran, snout]);
    const scarLine = (pts: number[][], w: number, color: string) =>
      b.sweep(skin.drape(polyline(stroke(pts.map((p) => P3(p[0], p[1], p[2])), 4)), { lift: 0.004 }), (t: number) => w * k * (0.4 + 0.6 * Math.sin(Math.PI * t)), {
        bone: H,
        color,
        sides: 5,
      });
    if (o.crown) {
      scarLine(
        [
          [0.06, 0.36, 0.08],
          [0.2, 0.33, 0.22],
          [0.3, 0.25, 0.3],
          [0.36, 0.1, 0.34],
          [0.37, -0.08, 0.3],
        ],
        0.018,
        P.scar,
      );
      for (const [x, y, z] of [
        [0.22, 0.31, 0.2],
        [0.33, 0.19, 0.31],
        [0.37, 0.0, 0.33],
      ])
        scarLine(
          [
            [x - 0.04, y - 0.03, z + 0.03],
            [x + 0.04, y + 0.03, z - 0.03],
          ],
          0.008,
          SCARP,
        );
    } else {
      scarLine(
        [
          [-0.2, 0.1, 0.6],
          [-0.05, 0.12, 0.8],
          [0.1, 0.1, 0.95],
        ],
        0.016,
        P.scar,
      );
      scarLine(
        [
          [0.2, 0.1, 0.5],
          [0.27, -0.05, 0.7],
          [0.25, -0.2, 0.9],
        ],
        0.016,
        P.scar,
      );
    }
    jowls.forEach((jp, i) => {
      const s = i === 0 ? 1 : -1;
      const js = b.surface(jp);
      const xr = s * 0.44;
      for (const pts of [
        [
          [xr, -0.05, 0.1],
          [xr, -0.27, 0.1],
        ],
        [
          [xr, -0.1, 0.1],
          [xr, -0.17, -0.07],
        ],
      ]) {
        const pp = stroke(pts.map((p) => P3(p[0], p[1], p[2])), 4);
        glow(b.sweep(js.drape(polyline(pp), { lift: 0.004 }), 0.011 * k, { bone: H, color: P.runeBlue, sides: 4 }), 1.5);
      }
    });

    // --- crown (centre head) ---
    if (o.crown) {
      box(0.84, 0.07, 0.3, 0, 0.345, -0.05, P.iron, H);
      box(0.07, 0.56, 0.3, 0.39, 0.07, -0.05, P.iron, H);
      box(0.07, 0.3, 0.3, -0.39, 0.2, -0.05, P.iron, H);
      box(0.84, 0.03, 0.04, 0, 0.36, 0.11, P.ironLight, H);
      box(0.045, 0.06, 0.2, -0.39, 0.06, -0.05, P.rust, H, [0, 0, 8]);
      const xs = [0.3, 0.15, 0, -0.15, -0.3];
      const hs = [0.17, 0.2, 0.22, 0.07, 0.13];
      xs.forEach((x, i) => {
        const h = hs[i];
        if (i === 3) {
          b.part(new THREE.CylinderGeometry(0.025 * k, 0.05 * k, h * k, 4), P.iron, { bone: H, at: P3(x, 0.38 + h / 2 - 0.01, -0.05), rotation: [0, 45, 0] });
          box(0.04, 0.025, 0.03, x + 0.02, 0.44, -0.04, P.rust, H);
        } else {
          b.part(new THREE.ConeGeometry(0.05 * k, h * k, 4), P.iron, { bone: H, at: P3(x, 0.38 + h / 2 - 0.01, -0.05), rotation: [0, 45, 0] });
        }
      });
      const riv: THREE.BufferGeometry[] = [];
      for (const x of [-0.3, -0.15, 0, 0.15, 0.3]) riv.push(place(new THREE.SphereGeometry(0.02, 5, 4), x, 0.385, 0.05));
      for (const y of [-0.1, 0.05, 0.2]) riv.push(place(new THREE.SphereGeometry(0.02, 5, 4), 0.43, y, -0.05));
      b.part(mergeGeometries(riv)!, P.ironLight, { bone: H, at: [0, 0, 0], flat: true });
      const ca: THREE.BufferGeometry[] = [];
      const cb: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 4; i++) {
        const g = linkA().rotateX(-Math.PI / 2);
        (i % 2 ? cb : ca).push(place(i % 2 ? g.rotateY(Math.PI / 2) : g, -0.43, -0.02 - i * 0.09, -0.05));
      }
      b.part(mergeGeometries(ca)!, P.chain, { bone: H, at: [0, 0, 0], flat: true });
      b.part(mergeGeometries(cb)!, P.chain, { bone: H, at: [0, 0, 0], flat: true });
    }

    // --- arrow stuck in the cheek ---
    if (o.arrow) {
      const dir = n3([0.35, 0.5, -0.45]);
      const entry = P3(0.435, -0.14, 0.05);
      const a = [entry[0] - dir[0] * 0.06, entry[1] - dir[1] * 0.06, entry[2] - dir[2] * 0.06];
      const e = [entry[0] + dir[0] * 0.42 * k, entry[1] + dir[1] * 0.42 * k, entry[2] + dir[2] * 0.42 * k];
      b.rod(a, e, 0.014 * k, P.wood, { bone: H });
      b.part(new THREE.SphereGeometry(0.05 * k, 6, 4), P.mouth, { bone: H, at: entry, scale: [0.5, 1, 1] });
      const fl = [e[0] - dir[0] * 0.05, e[1] - dir[1] * 0.05, e[2] - dir[2] * 0.05];
      b.part(new THREE.BoxGeometry(0.12 * k, 0.12 * k, 0.006 * k), P.bone, { bone: H, at: fl, dir });
      b.part(new THREE.BoxGeometry(0.006 * k, 0.12 * k, 0.12 * k), P.bone, { bone: H, at: fl, dir });
      b.part(new THREE.BoxGeometry(0.04 * k, 0.03 * k, 0.04 * k), P.rust, { bone: H, at: [e[0] + dir[0] * 0.02, e[1] + dir[1] * 0.02, e[2] + dir[2] * 0.02], dir });
    }

    return () => b.pose(Jw, { axis: [1, 0, 0], deg: o.open });
  }

  // ======================================================================
  // BUILD
  // ======================================================================
  // centre neck
  neck(
    [J.neckC1, J.neckC2, J.neckC3],
    [
      [0, 2.55, 1.72],
      [0, 2.9, 1.9],
      [0, 3.35, 2.1],
      [0, 3.8, 2.1],
      [0, 4.2, 2.2],
      [0, 4.55, 2.4],
      [0, 4.85, 2.52],
    ],
    (t) => 0.3 + 0.22 * Math.pow(1 - t, 1.3),
    [0.62, 0.86],
    0.62,
    11,
    5.0,
  );
  // inner-left neck
  neck(
    [J.neckIL1, J.neckIL2, J.neckIL3],
    [
      [0.5, 2.5, 1.65],
      [0.6, 2.8, 1.8],
      [0.75, 3.2, 1.95],
      [0.92, 3.6, 2.1],
      [1.02, 3.95, 2.3],
      [1.08, 4.2, 2.55],
      [1.1, 4.35, 2.72],
    ],
    (t) => 0.27 + 0.17 * Math.pow(1 - t, 1.3),
    [0.55, 0.84],
    0.55,
    23,
    4.4,
  );

  const openC = head({ c: [M.headC[0], M.headC[1], M.headC[2]], k: 1.08, H: J.headC, Jw: J.jawC, open: 14, crown: true, arrow: false });
  const openIL = head({ c: [M.headIL[0], M.headIL[1], M.headIL[2]], k: 0.85, H: J.headIL, Jw: J.jawIL, open: 10, crown: false, arrow: true });

  flush();
  openC();
  openIL();
}
```