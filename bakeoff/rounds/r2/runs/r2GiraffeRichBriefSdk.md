```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Young Reticulated Giraffe",
  description:
    "A young giraffe with chestnut patches outlined in cream, a stiff mane, fuzzy ossicones, big ears, long lashes and a dark tongue.",
};

export default function build() {
  const b = createBuilder({ name: "giraffe" });
  const R = rng(7);

  const CREAM = "#ead9a8";
  const CHEST = "#8d4b21";
  const CHEST2 = "#a65c2b";
  const DARK = "#2a1a12";
  const MID = "#d6b27a";
  const PINK = "#c88a86";
  const TONGUE = "#4a2a3a";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.15, -0.4] });
  const spine = b.joint("spine", { at: [0, 1.2, 0.0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.3, 0.38], parent: spine });
  const neckPts: number[][] = [
    [0, 1.35, 0.4],
    [0, 1.7, 0.57],
    [0, 2.0, 0.72],
    [0, 2.2, 0.82],
  ];
  const neck1 = b.joint("neck1", { at: neckPts[0], parent: chest });
  const neck2 = b.joint("neck2", { at: neckPts[1], parent: neck1 });
  const neck3 = b.joint("neck3", { at: neckPts[2], parent: neck2 });
  const head = b.joint("head", { at: neckPts[3], parent: neck3 });
  const jaw = b.joint("jaw", { at: [0, 2.2, 0.95], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 1.25, -0.88], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.98, -0.95], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.7, -0.97], parent: tail2 });

  // ---------- torso ----------
  const torsoGeo = new THREE.IcosahedronGeometry(1, 2);
  torsoGeo.scale(0.27, 0.32, 0.7);
  const torso = b.part(torsoGeo, CREAM, { at: [0, 1.2, -0.02], bone: spine });
  const rumpGeo = new THREE.IcosahedronGeometry(1, 1);
  rumpGeo.scale(0.24, 0.27, 0.3);
  b.part(rumpGeo, CREAM, { at: [0, 1.18, -0.5], bone: hips });
  const shGeo = new THREE.IcosahedronGeometry(1, 1);
  shGeo.scale(0.25, 0.3, 0.3);
  b.part(shGeo, CREAM, { at: [0, 1.32, 0.35], bone: chest });

  // ---------- neck ----------
  const necks: any[] = [];
  const radii = [0.16, 0.125, 0.1];
  for (let i = 0; i < 3; i++) {
    necks.push(b.sweep([neckPts[i], neckPts[i + 1]], radii[i], { color: CREAM }));
    const jg = new THREE.IcosahedronGeometry(radii[i], 1);
    b.part(jg, CREAM, { at: neckPts[i], bone: [neck1, neck2, neck3][i] });
  }

  // ---------- patches ----------
  const patch = (body: any, n: number, size: number, col: string) => {
    const hits = b.surface(body).scatter(n);
    for (const h of hits) {
      const s = size * (0.75 + R() * 0.55);
      const cg = new THREE.IcosahedronGeometry(s, 0);
      cg.scale(1, 0.45, 1);
      b.stick(cg, CREAM, h);
      const bg = new THREE.IcosahedronGeometry(s * 0.8, 0);
      bg.scale(1, 0.7, 1);
      b.stick(bg, R() > 0.5 ? col : CHEST2, h);
    }
  };
  patch(torso, 55, 0.1, CHEST);
  necks.forEach((n, i) => patch(n, [16, 13, 9][i], [0.085, 0.07, 0.055][i], CHEST));

  // ---------- mane ----------
  const curve = new THREE.CatmullRomCurve3(neckPts.map((p) => new THREE.Vector3(...p)));
  for (let i = 0; i < 16; i++) {
    const t = 0.04 + (i / 15) * 0.92;
    const p = curve.getPoint(t);
    const r = 0.15 - t * 0.06;
    const g = new THREE.ConeGeometry(0.03, 0.1, 4);
    g.translate(0, 0.05, 0);
    g.rotateX(-0.8);
    b.part(g, "#4a2a16", { at: [p.x, p.y + r * 0.7, p.z - r * 0.7], bone: [neck1, neck2, neck3][Math.min(2, Math.floor(t * 3))] });
  }

  // ---------- head ----------
  const skull = new THREE.IcosahedronGeometry(0.115, 1);
  skull.scale(0.9, 0.9, 1.15);
  b.part(skull, MID, { at: [0, 2.31, 0.92], bone: head });
  b.part(new THREE.BoxGeometry(0.15, 0.13, 0.26), MID, { at: [0, 2.25, 1.06], bone: head });
  b.part(new THREE.BoxGeometry(0.155, 0.1, 0.07), "#6b4a3a", { at: [0, 2.24, 1.2], bone: head });
  // nostrils
  for (const s of [-1, 1]) {
    b.part(new THREE.IcosahedronGeometry(0.014, 0), DARK, { at: [s * 0.04, 2.25, 1.236], bone: head });
  }
  // lower jaw
  b.part(new THREE.BoxGeometry(0.125, 0.06, 0.24), "#cfae78", { at: [0, 2.165, 1.07], bone: jaw });
  b.part(new THREE.BoxGeometry(0.13, 0.05, 0.05), "#6b4a3a", { at: [0, 2.165, 1.2], bone: jaw });
  // tongue
  b.part(new THREE.BoxGeometry(0.05, 0.015, 0.2), TONGUE, { at: [0, 2.19, 1.17], bone: jaw });
  b.part(new THREE.BoxGeometry(0.045, 0.015, 0.05), TONGUE, { at: [0, 2.175, 1.28], bone: jaw });

  // eyes + lashes
  for (const s of [-1, 1]) {
    const ex = s * 0.1;
    b.part(new THREE.IcosahedronGeometry(0.04, 1), DARK, { at: [ex, 2.34, 0.99], bone: head });
    b.part(new THREE.IcosahedronGeometry(0.011, 0), "#ffffff", { at: [ex + s * 0.012, 2.355, 1.025], bone: head });
    for (let k = 0; k < 4; k++) {
      const a = -0.5 + k * 0.45;
      b.spike([ex + s * 0.01, 2.375, 0.99 + a * 0.06], [s * 0.5, 0.8, 0.35 + a * 0.8], 0.06, 0.006, ) ;
    }
    // ears
    const eg = new THREE.IcosahedronGeometry(1, 1);
    eg.scale(0.13, 0.035, 0.07);
    eg.rotateZ(s * 0.35);
    b.part(eg, CHEST2, { at: [s * 0.24, 2.4, 0.83], bone: head });
    const ig = new THREE.IcosahedronGeometry(1, 1);
    ig.scale(0.095, 0.03, 0.045);
    ig.rotateZ(s * 0.35);
    b.part(ig, PINK, { at: [s * 0.24, 2.4, 0.845], bone: head });
    // ossicones
    const ox = s * 0.055;
    b.spike([ox, 2.4, 0.87], [s * 0.05, 1, -0.2], 0.17, 0.024);
    const tuft = new THREE.IcosahedronGeometry(0.045, 1);
    tuft.scale(1, 1.2, 1);
    b.part(tuft, DARK, { at: [ox + s * 0.01, 2.58, 0.835], bone: head });
    const fuzz = new THREE.IcosahedronGeometry(0.03, 0);
    b.part(fuzz, "#5a3a22", { at: [ox, 2.5, 0.85], bone: head });
  }
  // forehead patch
  const fp = new THREE.IcosahedronGeometry(0.05, 0);
  fp.scale(1, 0.4, 1.4);
  b.part(fp, CHEST, { at: [0, 2.4, 0.95], bone: head });

  // ---------- legs ----------
  const legs = [
    { n: "F", z: 0.38, top: 1.05 },
    { n: "B", z: -0.5, top: 1.05 },
  ];
  for (const L of legs) {
    for (const s of [-1, 1]) {
      const side = s > 0 ? "L" : "R";
      const x = s * 0.15;
      const parent = L.n === "F" ? chest : hips;
      const hip = b.joint(`hip${L.n}${side}`, { at: [x, L.top, L.z], parent });
      const knee = b.joint(`knee${L.n}${side}`, { at: [x, 0.55, L.z + (L.n === "F" ? 0.02 : -0.06)], parent: hip });
      const ankle = b.joint(`ankle${L.n}${side}`, { at: [x, 0.13, L.z + (L.n === "F" ? 0.02 : -0.02)], parent: knee });
      const up = b.sweep([[x, L.top, L.z], [x, 0.55, L.z + (L.n === "F" ? 0.02 : -0.06)]], 0.075, { color: CREAM });
      patch(up, 5, 0.045, CHEST);
      b.sweep([[x, 0.55, L.z + (L.n === "F" ? 0.02 : -0.06)], [x, 0.3, L.z]], 0.055, { color: MID });
      b.sweep([[x, 0.3, L.z], [x, 0.12, L.z + (L.n === "F" ? 0.02 : -0.02)]], 0.05, { color: CREAM });
      b.part(new THREE.IcosahedronGeometry(0.065, 0), CREAM, { at: [x, 0.55, L.z + (L.n === "F" ? 0.02 : -0.06)], bone: knee });
      b.part(new THREE.IcosahedronGeometry(0.06, 0), CREAM, { at: [x, 0.13, L.z + 0.01], bone: ankle });
      const hoof = new THREE.BoxGeometry(0.1, 0.1, 0.14);
      b.part(hoof, DARK, { at: [x, 0.04, L.z + 0.03], bone: ankle });
      // dewclaw-ish fetlock fluff
      b.part(new THREE.IcosahedronGeometry(0.035, 0), "#4a2a16", { at: [x, 0.1, L.z - 0.05], bone: ankle });
    }
  }

  // ---------- tail ----------
  b.sweep([[0, 1.25, -0.88], [0, 0.98, -0.95]], 0.035, { color: CREAM });
  b.sweep([[0, 0.98, -0.95], [0, 0.7, -0.97]], 0.025, { color: MID });
  const tt = new THREE.ConeGeometry(0.045, 0.22, 5);
  tt.rotateX(Math.PI);
  b.part(tt, DARK, { at: [0, 0.6, -0.97], bone: tail3 });

  return b.root;
}
```