```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Bat",
  description: "Stylized fruit bat in a rest pose with wings spread, rigged with wing, leg, ear and jaw joints.",
};

const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

function rodGeo(a: number[], bb: number[], r1: number, r2 = r1, seg = 6) {
  const pa = V(a), pb = V(bb);
  const d = pb.clone().sub(pa);
  const g = new THREE.CylinderGeometry(r2, r1, d.length(), seg);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
  const m = pa.clone().add(pb).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}
function coneGeo(base: number[], tip: number[], r: number, seg = 4) {
  return rodGeo(base, tip, r, 0.0005, seg);
}
function ballGeo(c: number[], r: number, sc: number[] = [1, 1, 1], seg = 8) {
  const g = new THREE.SphereGeometry(r, seg, Math.max(5, seg - 2));
  g.scale(sc[0], sc[1], sc[2]);
  g.translate(c[0], c[1], c[2]);
  return g;
}
function membraneGeo(poly: number[][], pivot: number[]) {
  const pos: number[] = [];
  const n = poly.length;
  const tri = (a: number[], b: number[], c: number[]) => {
    pos.push(...a, ...b, ...c);
    pos.push(...a, ...c, ...b);
  };
  for (let i = 0; i < n; i++) tri(pivot, poly[i], poly[(i + 1) % n]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export default function build() {
  const b = createBuilder({ name: "bat" });
  const fur = "#5a4234", furDark = "#3c2b24", skin = "#2f2733", ear = "#b3727a", eye = "#120c0c", bone = "#4a3a3a", tooth = "#f2ead8", belly = "#8a6a55";

  const body = b.joint("body", { at: [0, 0.1, 0] });
  const chest = b.joint("chest", { at: [0, 0.105, 0.03], parent: body });
  const neck = b.joint("neck", { at: [0, 0.12, 0.07], parent: chest });
  const head = b.joint("head", { at: [0, 0.13, 0.085], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.122, 0.1], parent: head });
  const tail = b.joint("tail1", { at: [0, 0.09, -0.06], parent: body });

  // torso & head
  b.part(ballGeo([0, 0.1, 0], 0.045, [1, 0.95, 1.4], 8), fur, { bone: body });
  b.part(ballGeo([0, 0.088, 0.015], 0.04, [0.95, 0.8, 1.3], 7), belly, { bone: chest });
  b.part(ballGeo([0, 0.125, 0.065], 0.03, [1.1, 1, 1.1], 8), furDark, { bone: neck });
  b.part(ballGeo([0, 0.132, 0.095], 0.03, [1, 0.95, 1], 8), fur, { bone: head });
  // snout (upper jaw)
  b.part(ballGeo([0, 0.127, 0.123], 0.017, [1, 0.8, 1.2], 6), furDark, { bone: head });
  b.part(ballGeo([0, 0.132, 0.139], 0.007, [1.3, 0.8, 0.8], 5), eye, { bone: head });
  // lower jaw
  b.part(ballGeo([0, 0.115, 0.115], 0.014, [1, 0.5, 1.4], 6), furDark, { bone: jaw });
  // fangs
  for (const s of [1, -1]) {
    b.part(coneGeo([s * 0.008, 0.119, 0.13], [s * 0.008, 0.108, 0.131], 0.0025), tooth, { bone: head });
    b.part(coneGeo([s * 0.007, 0.116, 0.13], [s * 0.007, 0.126, 0.131], 0.002), tooth, { bone: jaw });
  }
  // tail membrane stub
  b.part(rodGeo([0, 0.09, -0.06], [0, 0.085, -0.12], 0.006, 0.004), fur, { bone: tail });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const earJ = b.joint("ear" + L, { at: [s * 0.02, 0.155, 0.09], parent: head });
    b.part(coneGeo([s * 0.02, 0.15, 0.09], [s * 0.032, 0.195, 0.085], 0.015, 4), fur, { bone: earJ });
    b.part(coneGeo([s * 0.02, 0.152, 0.096], [s * 0.03, 0.188, 0.092], 0.009, 4), ear, { bone: earJ });
    // eyes
    b.part(ballGeo([s * 0.017, 0.14, 0.116], 0.0065, [1, 1, 1], 6), eye, { bone: head });
    b.part(ballGeo([s * 0.0185, 0.1415, 0.1215], 0.002, [1, 1, 1], 4), "#ffffff", { bone: head });

    // wing skeleton
    const P = {
      sh: [s * 0.035, 0.125, 0.02],
      el: [s * 0.13, 0.15, -0.01],
      wr: [s * 0.21, 0.155, 0.045],
      th: [s * 0.225, 0.17, 0.075],
      t1: [s * 0.33, 0.115, 0.2],
      t2: [s * 0.42, 0.105, 0.07],
      t3: [s * 0.37, 0.1, -0.08],
      t4: [s * 0.27, 0.095, -0.18],
      hip: [s * 0.04, 0.085, -0.07],
    };
    const shJ = b.joint("shoulder" + L, { at: P.sh, parent: chest });
    const elJ = b.joint("elbow" + L, { at: P.el, parent: shJ });
    const wrJ = b.joint("wrist" + L, { at: P.wr, parent: elJ });
    const thJ = b.joint("thumb" + L, { at: P.th, parent: wrJ });
    const fJ = [P.t1, P.t2, P.t3, P.t4].map((t, i) => {
      const mid = [(P.wr[0] + t[0]) / 2, (P.wr[1] + t[1]) / 2, (P.wr[2] + t[2]) / 2];
      const j1 = b.joint(`finger${i + 1}${L}`, { at: P.wr, parent: wrJ });
      b.joint(`finger${i + 1}${L}b`, { at: mid, parent: j1 });
      return j1;
    });

    b.part(rodGeo(P.sh, P.el, 0.008, 0.006), fur, { bone: shJ });
    b.part(rodGeo(P.el, P.wr, 0.006, 0.0045), furDark, { bone: elJ });
    b.part(rodGeo(P.wr, P.th, 0.004, 0.002, 4), bone, { bone: thJ });
    b.part(ballGeo(P.th, 0.005, [1, 1, 1], 5), tooth, { bone: thJ });
    [P.t1, P.t2, P.t3, P.t4].forEach((t, i) => {
      b.part(rodGeo(P.wr, t, 0.003, 0.0012, 4), bone, { bone: fJ[i] });
    });
    b.part(ballGeo(P.wr, 0.007, [1, 1, 1], 6), fur, { bone: wrJ });

    // membrane outline with scalloped trailing edge
    const tips = [P.t1, P.t2, P.t3, P.t4];
    const poly: number[][] = [P.sh, P.el, P.wr, P.th, P.t1];
    for (let i = 0; i < 3; i++) {
      const a = tips[i], c = tips[i + 1];
      const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
      poly.push([m[0] + (P.wr[0] - m[0]) * 0.22, m[1], m[2] + (P.wr[2] - m[2]) * 0.22]);
      poly.push(c);
    }
    const m4 = [(P.t4[0] + P.hip[0]) / 2, 0.09, (P.t4[2] + P.hip[2]) / 2];
    poly.push([m4[0] + (P.wr[0] - m4[0]) * 0.15, m4[1], m4[2] + (P.wr[2] - m4[2]) * 0.15]);
    poly.push(P.hip);
    // thumb is above plane; keep fan from wrist
    b.part(membraneGeo(poly.filter((_, i) => i !== 3), P.wr), skin, { bone: wrJ });

    // legs
    const hipJ = b.joint("hip" + L, { at: [s * 0.03, 0.08, -0.05], parent: body });
    const kneeJ = b.joint("knee" + L, { at: [s * 0.055, 0.045, -0.095], parent: hipJ });
    const footJ = b.joint("foot" + L, { at: [s * 0.05, 0.008, -0.07], parent: kneeJ });
    b.part(rodGeo([s * 0.03, 0.08, -0.05], [s * 0.055, 0.045, -0.095], 0.008, 0.006), fur, { bone: hipJ });
    b.part(rodGeo([s * 0.055, 0.045, -0.095], [s * 0.05, 0.008, -0.07], 0.005, 0.0035), furDark, { bone: kneeJ });
    for (let k = -1; k <= 1; k++) {
      b.part(rodGeo([s * 0.05, 0.006, -0.07], [s * 0.05 + k * 0.011, 0.004, -0.045], 0.0025, 0.0018, 4), tooth, { bone: footJ });
    }
    b.part(ballGeo([s * 0.05, 0.007, -0.072], 0.006, [1, 0.8, 1], 5), furDark, { bone: footJ });
  }

  return b.root;
}
```