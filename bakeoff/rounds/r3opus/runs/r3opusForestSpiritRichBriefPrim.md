```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Mossback Spirit",
  description:
    "A small forest spirit: a grey river-stone body under a cap of soft moss, slender wooden legs on little hooves, a pale wooden mask with glowing green eyes, branching antlers with tiny white flowers and leaves, and fireflies circling its head.",
};

type P = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "mossback_spirit" });

  const R: any = rng(1337);
  const rand = (): number =>
    typeof R === "function" ? R() : R.next ? R.next() : R.float();
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length) % arr.length];

  // ---------- palette ----------
  const STONE = "#8a8f8c";
  const STONE_DK = "#6b706e";
  const STONE_LT = "#a9aea8";
  const MOSS = "#5f8f3a";
  const MOSS_LT = "#86b04a";
  const MOSS_DK = "#40692b";
  const WOOD = "#7a5a3a";
  const WOOD_DK = "#4e3826";
  const MASK = "#efe3c8";
  const MASK_LINE = "#8a6a48";
  const HOOF = "#2f2620";
  const EYE = "#8dff6a";
  const SOCKET = "#1d2a1a";
  const PETAL = "#fbf8f0";
  const POLLEN = "#ffd34d";
  const LEAF = "#7fc04a";
  const FLY = "#e8ff7a";
  const HALO = "#c8ff9a";
  const CAP = "#c8442f";
  const STEM = "#f2e6cf";
  const LICHEN = "#c9cfa0";
  const ANTLER = "#9c7b55";

  const V = (p: P) => new THREE.Vector3(p[0], p[1], p[2]);

  function rod(a: P, c: P, r0: number, r1: number, color: string, bone: any, seg = 6) {
    const A = V(a), C = V(c);
    const len = A.distanceTo(C);
    const m = A.clone().add(C).multiplyScalar(0.5);
    const d = C.clone().sub(A).normalize();
    b.part(new THREE.CylinderGeometry(r1, r0, len, seg), color, {
      at: [m.x, m.y, m.z],
      dir: [d.x, d.y, d.z],
      bone,
    });
  }
  function ball(at: P, r: number, color: string, bone: any, scale?: P, dir?: P, detail = 0) {
    const opts: any = { at, bone };
    if (scale) opts.scale = scale;
    if (dir) opts.dir = dir;
    b.part(new THREE.IcosahedronGeometry(r, detail), color, opts);
  }

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.48, -0.1] });
  const chest = b.joint("chest", { at: [0, 0.5, 0.15], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.56, 0.24], parent: chest });
  const head = b.joint("head", { at: [0, 0.78, 0.4], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.745, 0.47], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.52, -0.3], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.55, -0.37], parent: tail1 });

  type Leg = { hip: P; knee: P; ankle: P; side: "L" | "R"; front: boolean };
  const legs: Leg[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legs.push({ side, front: true, hip: [0.1 * s, 0.38, 0.17], knee: [0.11 * s, 0.21, 0.19], ankle: [0.11 * s, 0.055, 0.17] });
    legs.push({ side, front: false, hip: [0.11 * s, 0.38, -0.18], knee: [0.12 * s, 0.21, -0.22], ankle: [0.12 * s, 0.055, -0.19] });
  }
  const legBones = legs.map((l) => {
    const pre = l.front ? "shoulder" : "hip";
    const kn = l.front ? "elbow" : "knee";
    const parent = l.front ? chest : hips;
    const j0 = b.joint(pre + l.side, { at: l.hip, parent });
    const j1 = b.joint(kn + l.side, { at: l.knee, parent: j0 });
    const j2 = b.joint((l.front ? "wrist" : "ankle") + l.side, { at: l.ankle, parent: j1 });
    const j3 = b.joint((l.front ? "hoofF" : "hoofB") + l.side, { at: [l.ankle[0], 0.0, l.ankle[2] + 0.01], parent: j2 });
    return { l, j0, j1, j2, j3 };
  });

  // antlers
  const antlers = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const base: P = [0.05 * s, 0.875, 0.41];
    const p1: P = [0.11 * s, 1.0, 0.38];
    const p2: P = [0.16 * s, 1.13, 0.34];
    const p3: P = [0.17 * s, 1.24, 0.31];
    const a1 = b.joint("antler1" + side, { at: base, parent: head });
    const a2 = b.joint("antler2" + side, { at: p1, parent: a1 });
    const a3 = b.joint("antler3" + side, { at: p2, parent: a2 });
    b.joint("antlerTip" + side, { at: p3, parent: a3 });
    const earJ = b.joint("ear" + side, { at: [0.07 * s, 0.83, 0.39], parent: head });
    return { s, base, p1, p2, p3, a1, a2, a3, earJ };
  });

  // ---------- stone body ----------
  const C: P = [0, 0.48, 0.02];
  const rx = 0.2, ry = 0.16, rz = 0.31;
  b.part(new THREE.IcosahedronGeometry(1, 2), STONE, { at: C, bone: hips, scale: [rx, ry, rz] });
  // flatter underside slab, a river stone has a worn belly
  b.part(new THREE.IcosahedronGeometry(1, 1), STONE_DK, { at: [0, 0.4, 0.02], bone: hips, scale: [rx * 0.82, ry * 0.5, rz * 0.85] });

  // moss blanket over the back
  b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.4), MOSS, {
    at: [C[0], C[1] + 0.005, C[2]],
    bone: hips,
    scale: [rx * 1.05, ry * 1.08, rz * 1.05],
  });
  // moss drip edge
  for (let i = 0; i < 22; i++) {
    const t = (i / 22) * Math.PI * 2 + rand() * 0.1;
    const ny = 0.32 + rand() * 0.1;
    const h = Math.sqrt(1 - ny * ny);
    const p: P = [C[0] + Math.cos(t) * h * rx * 1.05, C[1] + ny * ry * 1.02, C[2] + Math.sin(t) * h * rz * 1.05];
    ball(p, 0.022 + rand() * 0.01, pick([MOSS, MOSS_DK]), p[2] > 0 ? chest : hips, [1, 0.7, 1]);
  }
  // moss tufts on the back
  const backPts: P[] = [];
  for (let i = 0; i < 42; i++) {
    const t = rand() * Math.PI * 2;
    const ny = 0.45 + rand() * 0.55;
    const h = Math.sqrt(1 - ny * ny);
    const n = new THREE.Vector3(Math.cos(t) * h / rx, ny / ry, Math.sin(t) * h / rz).normalize();
    const p: P = [C[0] + Math.cos(t) * h * rx * 1.07, C[1] + ny * ry * 1.08, C[2] + Math.sin(t) * h * rz * 1.07];
    backPts.push(p);
    ball(p, 0.018 + rand() * 0.02, pick([MOSS, MOSS_LT, MOSS_DK, MOSS_LT]), p[2] > 0 ? chest : hips, [1, 0.55, 1], [n.x, n.y, n.z]);
  }
  // lichen patches & pebbles on the flanks
  for (let i = 0; i < 10; i++) {
    const s = i % 2 ? 1 : -1;
    const z = -0.22 + rand() * 0.44;
    const y = 0.4 + rand() * 0.08;
    const k = Math.max(0.05, 1 - (z - C[2]) ** 2 / (rz * rz) - (y - C[1]) ** 2 / (ry * ry));
    const x = s * rx * Math.sqrt(k);
    if (i < 6) ball([x, y, z], 0.016 + rand() * 0.008, LICHEN, z > 0 ? chest : hips, [0.35, 1, 1]);
    else b.part(new THREE.DodecahedronGeometry(0.03 + rand() * 0.015, 0), pick([STONE_LT, STONE_DK]), { at: [x * 0.97, y - 0.02, z], bone: z > 0 ? chest : hips, scale: [0.6, 0.6, 0.9] });
  }
  // tiny mushrooms and moss-flowers on the back
  const shrooms: P[] = [[0.08, 0.63, -0.12], [0.1, 0.615, -0.17], [-0.06, 0.635, 0.06]];
  shrooms.forEach((p, i) => {
    const hgt = i === 1 ? 0.025 : 0.04;
    rod(p, [p[0], p[1] + hgt, p[2]], 0.007, 0.006, STEM, hips, 5);
    b.part(new THREE.SphereGeometry(i === 1 ? 0.016 : 0.024, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), CAP, { at: [p[0], p[1] + hgt - 0.003, p[2]], bone: hips });
    ball([p[0] + 0.008, p[1] + hgt + (i === 1 ? 0.011 : 0.017), p[2] + 0.006], 0.004, PETAL, hips);
  });
  for (let i = 0; i < 6; i++) {
    const p = backPts[(i * 7) % backPts.length];
    const at: P = [p[0], p[1] + 0.012, p[2]];
    ball(at, 0.006, POLLEN, p[2] > 0 ? chest : hips);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      ball([at[0] + Math.cos(a) * 0.009, at[1] - 0.002, at[2] + Math.sin(a) * 0.009], 0.006, PETAL, p[2] > 0 ? chest : hips, [1, 0.5, 1]);
    }
  }

  // tail: a mossy tuft
  rod([0, 0.5, -0.27], [0, 0.55, -0.37], 0.03, 0.02, STONE_DK, tail1, 6);
  ball([0, 0.56, -0.38], 0.04, MOSS_LT, tail2, [1, 0.8, 1.1], undefined, 1);
  ball([0.015, 0.585, -0.4], 0.022, MOSS, tail2);
  ball([-0.018, 0.57, -0.41], 0.02, MOSS_DK, tail2);

  // ---------- legs ----------
  for (const { l, j0, j1, j2, j3 } of legBones) {
    rod(l.hip, l.knee, 0.03, 0.022, WOOD, j0, 6);
    ball(l.knee, 0.025, WOOD_DK, j1, [1, 0.9, 1]);
    rod(l.knee, l.ankle, 0.021, 0.015, WOOD, j1, 6);
    ball(l.ankle, 0.018, WOOD_DK, j2);
    // bark rings & a sprig of moss on the thigh
    const mid1 = V(l.hip).lerp(V(l.knee), 0.55);
    b.part(new THREE.TorusGeometry(0.026, 0.006, 4, 8), WOOD_DK, { at: [mid1.x, mid1.y, mid1.z], bone: j0, dir: [0, 0, 1] });
    ball([l.hip[0] * 1.05, l.hip[1] - 0.02, l.hip[2]], 0.03, MOSS, j0, [1, 0.6, 1]);
    const mid2 = V(l.knee).lerp(V(l.ankle), 0.4);
    b.part(new THREE.TorusGeometry(0.019, 0.005, 4, 8), WOOD_DK, { at: [mid2.x, mid2.y, mid2.z], bone: j1, dir: [0, 0, 1] });
    // little twig shooting off the shin
    const tw = V(l.knee).lerp(V(l.ankle), 0.3);
    const sx = Math.sign(l.ankle[0]);
    rod([tw.x, tw.y, tw.z], [tw.x + 0.035 * sx, tw.y + 0.035, tw.z - 0.01], 0.006, 0.003, WOOD, j1, 4);
    ball([tw.x + 0.04 * sx, tw.y + 0.04, tw.z - 0.01], 0.012, LEAF, j1, [0.35, 1, 0.12], [sx, 1, 0]);
    // hoof: split cloven block
    const hx = l.ankle[0], hz = l.ankle[2] + 0.01;
    b.part(new THREE.CylinderGeometry(0.02, 0.027, 0.04, 6), HOOF, { at: [hx, 0.02, hz], bone: j3 });
    b.part(new THREE.BoxGeometry(0.004, 0.03, 0.03), WOOD_DK, { at: [hx, 0.016, hz + 0.012], bone: j3 });
  }

  // ---------- neck ----------
  rod([0, 0.53, 0.2], [0, 0.78, 0.38], 0.075, 0.055, STONE, neck, 7);
  for (let i = 0; i < 9; i++) {
    const t = 0.15 + (i / 9) * 0.75;
    const p = V([0, 0.53, 0.2]).lerp(V([0, 0.78, 0.38]), t);
    const a = (i % 3 - 1) * 0.6 + Math.PI * 1.5 + (rand() - 0.5) * 0.4;
    ball([p.x + Math.cos(a) * 0.04, p.y + 0.035, p.z - 0.03 + Math.sin(a) * 0.01], 0.025 + rand() * 0.01, pick([MOSS, MOSS_LT, MOSS_DK]), neck, [1, 0.7, 1]);
  }
  // mossy mane collar
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ball([Math.cos(a) * 0.08, 0.6 + Math.sin(a) * 0.02, 0.25 + Math.sin(a) * 0.05], 0.03, i % 2 ? MOSS : MOSS_LT, neck, [1, 0.7, 1]);
  }

  // ---------- head ----------
  ball([0, 0.8, 0.39], 0.085, STONE, head, [1, 1, 1.05], undefined, 1);
  // moss crown
  b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.42), MOSS, { at: [0, 0.81, 0.38], bone: head, scale: [0.09, 0.08, 0.09] });
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    ball([Math.cos(a) * 0.05, 0.875 + rand() * 0.01, 0.37 + Math.sin(a) * 0.04], 0.016 + rand() * 0.008, pick([MOSS_LT, MOSS_DK]), head, [1, 0.6, 1]);
  }

  // pale wooden mask
  ball([0, 0.8, 0.455], 0.1, MASK, head, [0.85, 1.05, 0.5], undefined, 1);
  // brow ridge
  b.part(new THREE.BoxGeometry(0.13, 0.016, 0.03), MASK, { at: [0, 0.845, 0.49], bone: head });
  // upper snout
  b.part(new THREE.CylinderGeometry(0.028, 0.045, 0.09, 6), MASK, { at: [0, 0.755, 0.515], bone: head, dir: [0, -0.3, 1] });
  ball([0, 0.745, 0.565], 0.016, WOOD_DK, head, [1.2, 0.8, 0.8]); // nose
  // lower jaw
  b.part(new THREE.BoxGeometry(0.05, 0.016, 0.075), MASK, { at: [0, 0.722, 0.51], bone: jaw });
  b.part(new THREE.BoxGeometry(0.04, 0.006, 0.05), MASK_LINE, { at: [0, 0.731, 0.52], bone: jaw });
  // eyes: dark sockets with glowing irises
  for (const s of [1, -1]) {
    ball([0.042 * s, 0.81, 0.495], 0.026, SOCKET, head, [1.1, 0.75, 0.35]);
    ball([0.042 * s, 0.81, 0.503], 0.016, EYE, head, [1.1, 0.8, 0.5], undefined, 1);
    ball([0.036 * s, 0.816, 0.511], 0.004, "#ffffff", head);
    // carved cheek lines
    b.part(new THREE.BoxGeometry(0.004, 0.035, 0.004), MASK_LINE, { at: [0.05 * s, 0.775, 0.49], bone: head, dir: [0.25 * s, 1, 0.3] });
    b.part(new THREE.BoxGeometry(0.004, 0.025, 0.004), MASK_LINE, { at: [0.062 * s, 0.78, 0.483], bone: head, dir: [0.25 * s, 1, 0.3] });
  }
  // forehead leaf emblem
  b.part(new THREE.IcosahedronGeometry(1, 0), MOSS_DK, { at: [0, 0.865, 0.493], bone: head, scale: [0.012, 0.022, 0.004] });
  b.part(new THREE.BoxGeometry(0.002, 0.03, 0.003), LEAF, { at: [0, 0.865, 0.497], bone: head });
  ball([0, 0.835, 0.5], 0.006, EYE, head, [1, 1, 0.6]);

  // ---------- ears & antlers ----------
  const flowerAt = (p: P, bone: any, size = 1) => {
    ball(p, 0.007 * size, POLLEN, bone);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ball([p[0] + Math.cos(a) * 0.011 * size, p[1] - 0.002, p[2] + Math.sin(a) * 0.011 * size], 0.007 * size, PETAL, bone, [1, 0.45, 1]);
    }
  };
  const leafAt = (p: P, d: P, bone: any, size = 1) => {
    const n = V(d).normalize();
    const c: P = [p[0] + n.x * 0.018 * size, p[1] + n.y * 0.018 * size, p[2] + n.z * 0.018 * size];
    ball(c, 1, LEAF, bone, [0.011 * size, 0.022 * size, 0.003], [n.x, n.y, n.z]);
  };

  for (const a of antlers) {
    const s = a.s;
    // leaf-shaped ear sticking sideways
    ball([0.11 * s, 0.84, 0.39], 1, MASK, a.earJ, [0.022, 0.05, 0.008], [s, 0.35, 0], 1);
    ball([0.112 * s, 0.84, 0.395], 1, MOSS_LT, a.earJ, [0.012, 0.035, 0.004], [s, 0.35, 0]);

    // main beam
    rod(a.base, a.p1, 0.016, 0.013, ANTLER, a.a1, 6);
    ball(a.p1, 0.013, ANTLER, a.a2);
    rod(a.p1, a.p2, 0.013, 0.01, ANTLER, a.a2, 6);
    ball(a.p2, 0.01, ANTLER, a.a3);
    rod(a.p2, a.p3, 0.01, 0.005, ANTLER, a.a3, 5);
    // burr ring
    b.part(new THREE.TorusGeometry(0.018, 0.006, 4, 8), WOOD_DK, { at: [a.base[0], a.base[1] + 0.01, a.base[2]], bone: a.a1, dir: [0.4 * s, 1, 0] });
    // tines
    const t1: P = [0.2 * s, 1.07, 0.44];
    const t2: P = [0.09 * s, 1.22, 0.4];
    const t3: P = [0.25 * s, 1.21, 0.28];
    const t4: P = [0.04 * s, 1.06, 0.45];
    rod(a.p1, t1, 0.009, 0.004, ANTLER, a.a2, 5);
    rod(a.p2, t2, 0.008, 0.004, ANTLER, a.a3, 5);
    rod(a.p2, t3, 0.008, 0.004, ANTLER, a.a3, 5);
    rod([0.08 * s, 0.94, 0.395], t4, 0.008, 0.004, ANTLER, a.a1, 5);
    // moss sleeve at the base
    ball([0.065 * s, 0.92, 0.4], 0.018, MOSS, a.a1, [1, 0.8, 1]);
    // flowers at tips
    flowerAt([a.p3[0], a.p3[1] + 0.006, a.p3[2]], a.a3, 1.1);
    flowerAt([t2[0], t2[1] + 0.006, t2[2]], a.a3, 0.9);
    flowerAt([t1[0], t1[1] + 0.006, t1[2]], a.a2, 0.85);
    // leaves sprouting along beams
    leafAt(t3, [s, 0.4, -0.3], a.a3, 1.1);
    leafAt(t4, [0.2 * s, 1, 0.5], a.a1, 0.9);
    leafAt(a.p1, [-0.3 * s, 0.6, 0.6], a.a2, 0.9);
    leafAt(a.p2, [s, 0.2, 0.4], a.a3, 0.8);
    leafAt([0.14 * s, 1.07, 0.36], [0.4 * s, 0.4, -0.8], a.a2, 0.8);
    // a hanging moss strand
    ball([0.135 * s, 1.03, 0.37], 0.008, MOSS_LT, a.a2, [1, 2.2, 1]);
  }

  // ---------- fireflies ----------
  const flies: P[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rand() * 0.5;
    const r = 0.2 + rand() * 0.07;
    flies.push([Math.cos(a) * r, 0.9 + rand() * 0.25, 0.38 + Math.sin(a) * r]);
  }
  flies.forEach((p) => {
    ball(p, 0.009, FLY, head, undefined, undefined, 1);
    ball(p, 0.022, HALO, head, undefined, undefined, 1);
    ball([p[0], p[1] + 0.006, p[2] - 0.004], 0.006, "#d9e8ef", head, [1.4, 0.3, 0.7]); // wings
  });

  // ---------- glow pass: tweak the shared materials ----------
  const glow = new Set([new THREE.Color(EYE).getHexString(), new THREE.Color(FLY).getHexString()]);
  const halo = new THREE.Color(HALO).getHexString();
  b.root.traverse((o: any) => {
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      if (!m || !m.color || !m.emissive) continue;
      const hx = m.color.getHexString();
      if (glow.has(hx)) {
        m.emissive.copy(m.color);
        m.emissiveIntensity = 1.6;
        m.roughness = 0.4;
      } else if (hx === halo) {
        m.emissive.copy(m.color);
        m.emissiveIntensity = 1.0;
        m.transparent = true;
        m.opacity = 0.28;
        m.depthWrite = false;
      }
    }
  });

  return b.root;
}
```