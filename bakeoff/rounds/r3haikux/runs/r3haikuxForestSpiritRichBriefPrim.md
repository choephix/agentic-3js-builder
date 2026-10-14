```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

type V = [number, number, number];
type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;

export const meta = {
  name: "Mossy stone forest spirit",
  description:
    "A small forest spirit, part deer and part river stone: a moss-covered grey body on slender wooden legs and hooves, branching antlers with white flowers and leaves, a pale wooden mask with glowing green eyes, and fireflies circling its head.",
};

const COL = {
  stoneDark: "#5b6360",
  stone: "#7d8582",
  stoneLight: "#a6aca6",
  stonePale: "#c3c7bf",
  mossDeep: "#2f5f2c",
  moss: "#4c8a3b",
  mossMid: "#5d9d46",
  mossBright: "#7cbb55",
  wood: "#7a5a3b",
  bark: "#4b3726",
  antler: "#8f6e4d",
  mask: "#e9d8ae",
  maskShade: "#c9b185",
  socket: "#2a2119",
  hoof: "#2a2220",
  eye: "#8dff9e",
  firefly: "#f3ff8c",
  petal: "#f8f6ee",
  pistil: "#f2c94c",
  leafA: "#6cc05e",
  leafB: "#3d8f47",
};

export default function build() {
  const b = createBuilder({ name: "mossy-stone-forest-spirit" });
  const rand = rng(1187);

  // ---------- primitive helpers ----------
  const stone = (color: string, at: V, bone: Joint, r: number, sx = 1, sy = 1, sz = 1) => {
    const g = new THREE.DodecahedronGeometry(r, 0);
    g.scale(sx, sy, sz);
    b.part(g, color, { at, bone });
  };

  const moss = (color: string, at: V, bone: Joint, r: number, sx = 1, sy = 0.6, sz = 1) => {
    const g = new THREE.IcosahedronGeometry(r, 1);
    g.scale(sx, sy, sz);
    b.part(g, color, { at, bone });
  };

  const leaf = (color: string, at: V, bone: Joint, len: number) => {
    const g = new THREE.OctahedronGeometry(len, 0);
    g.scale(0.42, 1, 0.14);
    g.rotateZ(rand() * Math.PI * 2);
    b.part(g, color, { at, bone });
  };

  const ball = (color: string, at: V, bone: Joint, r: number, seg = 8) => {
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 3)), color, { at, bone });
  };

  // a cylinder from a to c; rA is the radius at a, rC the radius at c
  const rod = (bone: Joint, a: V, c: V, rA: number, rC: number, color: string, seg = 6) => {
    const A = new THREE.Vector3(...a);
    const Cp = new THREE.Vector3(...c);
    const d = Cp.clone().sub(A);
    const len = d.length();
    const dir = d.clone().normalize();
    const mid = A.clone().add(Cp).multiplyScalar(0.5);
    const g = new THREE.CylinderGeometry(rC, rA, len, seg, 1);
    b.part(g, color, { at: [mid.x, mid.y, mid.z], bone, dir: [dir.x, dir.y, dir.z] });
  };

  const hoof = (x: number, z: number, bone: Joint) => {
    b.part(new THREE.CylinderGeometry(0.032, 0.044, 0.07, 6), COL.hoof, {
      at: [x, 0.035, z],
      bone,
    });
  };

  // five radial petals and a pistil, lying roughly facing +Z
  const flower = (c: V, bone: Joint) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.2;
      const g = new THREE.SphereGeometry(0.02, 5, 4);
      g.scale(0.5, 1.4, 0.4);
      g.rotateZ(a - Math.PI / 2);
      b.part(g, COL.petal, {
        at: [c[0] + Math.cos(a) * 0.02, c[1] + Math.sin(a) * 0.02, c[2]],
        bone,
      });
    }
    ball(COL.pistil, c, bone, 0.011, 5);
  };

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 1.05, 0] });
  const chest = b.joint("chest", { at: [0, 1.12, 0.28], parent: body });
  const neckLow = b.joint("neckLow", { at: [0, 1.26, 0.46], parent: chest });
  const neckHigh = b.joint("neckHigh", { at: [0, 1.44, 0.6], parent: neckLow });
  const head = b.joint("head", { at: [0, 1.6, 0.74], parent: neckHigh });
  const jaw = b.joint("jaw", { at: [0, 1.4, 0.8], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 1.14, -0.54], parent: body });
  const tail2 = b.joint("tail2", { at: [0, 1.2, -0.7], parent: tail1 });

  // ---------- torso: river stones under moss ----------
  stone(COL.stone, [0, 1.08, 0], body, 0.3, 0.95, 0.82, 1.35);
  stone(COL.stoneDark, [0, 1.1, -0.36], body, 0.24, 0.95, 0.85, 1.0);
  stone(COL.stoneLight, [0, 1.12, 0.3], chest, 0.22, 1.0, 0.9, 1.0);
  stone(COL.stonePale, [0.14, 1.3, -0.1], body, 0.1);
  stone(COL.stoneLight, [-0.15, 1.28, 0.08], chest, 0.09, 1.1, 0.9, 1.0);
  stone(COL.stonePale, [0.06, 1.33, -0.32], body, 0.08);
  stone(COL.stoneDark, [0, 0.9, 0.04], body, 0.18, 1.1, 0.6, 1.2);
  stone(COL.stone, [0.27, 1.04, 0.06], chest, 0.13);
  stone(COL.stoneLight, [-0.26, 1.0, -0.06], body, 0.13);

  // moss saddle along the back and flanks
  moss(COL.moss, [0, 1.36, -0.05], body, 0.15, 1.3, 0.5, 1.1);
  moss(COL.mossBright, [0.12, 1.36, 0.14], chest, 0.1, 1.2, 0.55, 1.2);
  moss(COL.mossDeep, [-0.13, 1.33, 0.1], chest, 0.09, 1.2, 0.55, 1.1);
  moss(COL.mossMid, [0.2, 1.22, -0.2], body, 0.1);
  moss(COL.mossBright, [-0.2, 1.24, -0.22], body, 0.09);
  moss(COL.moss, [0.08, 1.38, -0.34], body, 0.08);
  moss(COL.mossDeep, [0.27, 1.12, 0.08], chest, 0.07);
  moss(COL.mossMid, [-0.28, 1.06, -0.12], body, 0.07);

  // scattered clumps over the upper body
  for (let i = 0; i < 9; i++) {
    const th = rand() * Math.PI * 2;
    const ph = 0.35 + rand() * 0.95;
    const x = 0.31 * Math.sin(ph) * Math.cos(th);
    const y = 1.08 + 0.27 * Math.cos(ph);
    const z = 0.42 * Math.sin(ph) * Math.sin(th);
    moss(i % 2 ? COL.mossMid : COL.moss, [x, y, z], body, 0.06 + rand() * 0.03, 1.2, 0.55, 1.1);
  }

  // leaves sprouting from the moss
  for (let i = 0; i < 6; i++) {
    const th = rand() * Math.PI * 2;
    const ph = 0.4 + rand() * 0.7;
    const x = 0.3 * Math.sin(ph) * Math.cos(th);
    const y = 1.1 + 0.26 * Math.cos(ph);
    const z = 0.42 * Math.sin(ph) * Math.sin(th);
    leaf(i % 2 ? COL.leafA : COL.leafB, [x, y, z], body, 0.035);
  }

  // ---------- neck: two stacked stones with moss ----------
  stone(COL.stone, [0, 1.28, 0.5], neckLow, 0.15, 0.9, 1.0, 1.1);
  stone(COL.stoneLight, [0, 1.46, 0.63], neckHigh, 0.12, 0.9, 1.0, 0.95);
  moss(COL.moss, [0.1, 1.38, 0.56], neckLow, 0.07, 1.1, 0.6, 1.2);
  moss(COL.mossBright, [-0.11, 1.46, 0.5], neckHigh, 0.07, 1.1, 0.6, 1.1);
  moss(COL.mossDeep, [0.06, 1.56, 0.66], neckHigh, 0.055);

  // ---------- tail: a stone nub with a moss puff ----------
  stone(COL.stoneDark, [0, 1.15, -0.55], tail1, 0.06);
  rod(tail1, [0, 1.14, -0.54], [0, 1.2, -0.7], 0.03, 0.022, COL.wood);
  moss(COL.mossMid, [0, 1.22, -0.72], tail2, 0.1, 1, 0.9, 1);
  moss(COL.mossBright, [0.03, 1.27, -0.76], tail2, 0.07);

  // ---------- head: stone skull, pale wooden mask, glowing eyes ----------
  stone(COL.stoneDark, [0, 1.66, 0.72], head, 0.17, 0.95, 0.95, 1.05);
  moss(COL.mossBright, [0, 1.8, 0.62], head, 0.085, 1.2, 0.6, 1.1);
  moss(COL.moss, [0.14, 1.7, 0.6], head, 0.06);
  moss(COL.mossDeep, [-0.15, 1.66, 0.84], head, 0.05);
  moss(COL.moss, [0.15, 1.66, 0.84], head, 0.05);

  const mask = new THREE.SphereGeometry(0.15, 10, 7);
  mask.scale(0.92, 1.05, 0.5);
  b.part(mask, COL.mask, { at: [0, 1.56, 0.97], bone: head });

  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.05), COL.maskShade, {
    at: [0, 1.66, 1.03],
    bone: head,
  });

  const nose = new THREE.OctahedronGeometry(0.035, 0);
  nose.scale(0.6, 1.7, 0.6);
  b.part(nose, COL.maskShade, { at: [0, 1.5, 1.05], bone: head });

  for (const s of [1, -1]) {
    const ex = 0.055 * s;
    b.part(new THREE.TorusGeometry(0.046, 0.012, 5, 10), COL.socket, {
      at: [ex, 1.59, 1.04],
      bone: head,
    });
    const glow = new THREE.SphereGeometry(0.03, 8, 6);
    glow.scale(1, 1, 0.7);
    b.part(glow, COL.eye, { at: [ex, 1.59, 1.05], bone: head });
    // carved tear marks running down from each eye
    rod(head, [ex, 1.55, 1.03], [ex * 1.4, 1.41, 1.0], 0.009, 0.006, COL.bark, 4);
  }

  // lower jaw hangs from the jaw hinge
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.17), COL.maskShade, {
    at: [0, 1.385, 0.95],
    bone: jaw,
  });

  // ---------- legs: wooden shanks, stone knees, dark hooves ----------
  const legPair = (s: 1 | -1, S: "L" | "R") => {
    const x = 0.17 * s;
    // foreleg: shoulder, knee, ankle, hoof
    const pSh: V = [x, 1.0, 0.36];
    const pKn: V = [x, 0.52, 0.4];
    const pAn: V = [x, 0.1, 0.42];
    const pHo: V = [x, 0, 0.42];
    // hind leg: hip, stifle, hock, hoof
    const pHip: V = [0.18 * s, 1.0, -0.36];
    const pSt: V = [x, 0.5, -0.3];
    const pHk: V = [x, 0.18, -0.46];
    const pHh: V = [x, 0, -0.46];

    const sh = b.joint(`shoulder${S}`, { at: pSh, parent: chest });
    const kn = b.joint(`knee${S}`, { at: pKn, parent: sh });
    const an = b.joint(`ankle${S}`, { at: pAn, parent: kn });
    const ho = b.joint(`hoof${S}`, { at: pHo, parent: an });
    const hp = b.joint(`hip${S}`, { at: pHip, parent: body });
    const st = b.joint(`stifle${S}`, { at: pSt, parent: hp });
    const hk = b.joint(`hock${S}`, { at: pHk, parent: st });
    const hh = b.joint(`hindHoof${S}`, { at: pHh, parent: hk });

    rod(sh, pSh, pKn, 0.046, 0.034, COL.wood);
    stone(COL.stone, pKn, kn, 0.052, 1, 0.9, 1);
    rod(kn, pKn, pAn, 0.034, 0.024, COL.wood);
    ball(COL.bark, pAn, an, 0.026, 6);
    rod(an, pAn, [x, 0.05, 0.42], 0.024, 0.028, COL.wood);
    hoof(x, 0.42, ho);

    rod(hp, pHip, pSt, 0.05, 0.04, COL.wood);
    stone(COL.stoneLight, pSt, st, 0.05);
    rod(st, pSt, pHk, 0.04, 0.03, COL.wood);
    stone(COL.stone, pHk, hk, 0.045, 1, 1, 1.2);
    rod(hk, pHk, [x, 0.05, -0.46], 0.028, 0.024, COL.wood);
    hoof(x, -0.46, hh);
  };
  legPair(1, "L");
  legPair(-1, "R");

  // ---------- antlers: branching beams with flowers and leaves ----------
  const antler = (s: 1 | -1, S: "L" | "R") => {
    const pB0: V = [0.1 * s, 1.8, 0.7];
    const pB1: V = [0.2 * s, 2.02, 0.66];
    const pB2: V = [0.32 * s, 2.2, 0.56];
    const pF1: V = [0.3 * s, 2.14, 0.9];
    const pF2: V = [0.44 * s, 2.34, 0.46];

    const jB0 = b.joint(`antlerBase${S}`, { at: pB0, parent: head });
    const jB1 = b.joint(`antlerMid${S}`, { at: pB1, parent: jB0 });
    const jB2 = b.joint(`antlerTip${S}`, { at: pB2, parent: jB1 });
    const jF1 = b.joint(`antlerFork${S}`, { at: pF1, parent: jB1 });
    const jF2 = b.joint(`antlerPoint${S}`, { at: pF2, parent: jB2 });

    rod(jB0, pB0, pB1, 0.032, 0.024, COL.antler);
    rod(jB1, pB1, pB2, 0.024, 0.016, COL.antler);
    rod(jB1, pB1, pF1, 0.02, 0.012, COL.antler);
    rod(jB2, pB2, pF2, 0.016, 0.009, COL.antler);
    ball(COL.antler, pB1, jB1, 0.026, 6);
    ball(COL.antler, pB2, jB2, 0.018, 6);

    flower([pB1[0] + 0.03 * s, pB1[1] + 0.03, pB1[2] + 0.02], jB1);
    flower([pB2[0] + 0.03 * s, pB2[1] + 0.03, pB2[2] + 0.02], jB2);
    flower([pF1[0], pF1[1] + 0.03, pF1[2]], jF1);
    flower([pF2[0], pF2[1] + 0.03, pF2[2]], jF2);

    leaf(COL.leafA, [pB1[0] - 0.04 * s, pB1[1] + 0.06, pB1[2] + 0.03], jB1, 0.03);
    leaf(COL.leafB, [pB2[0] + 0.02 * s, pB2[1] - 0.03, pB2[2] + 0.04], jB2, 0.028);
    leaf(COL.leafB, [0.15 * s, 1.9, 0.68], jB0, 0.03);
    leaf(COL.leafA, [0.3 * s, 2.12, 0.8], jF1, 0.028);
    leaf(COL.leafA, [0.4 * s, 2.3, 0.52], jF2, 0.026);
  };
  antler(1, "L");
  antler(-1, "R");

  // ---------- fireflies circling the head ----------
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand() * 0.6;
    const R = 0.42 + rand() * 0.12;
    const at: V = [
      Math.cos(a) * R,
      1.68 + Math.sin(a * 2 + i) * 0.2,
      0.76 + Math.sin(a) * R * 0.7,
    ];
    b.part(new THREE.SphereGeometry(0.02, 6, 4), COL.firefly, { at, bone: head });
  }

  return b.root;
}
```